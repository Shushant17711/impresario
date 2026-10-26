/**
 * Minimal Chrome DevTools Protocol client.
 * No dependencies. Works on Node 18+ (implements the WebSocket framing itself,
 * so it does not rely on the global WebSocket added in Node 22).
 */

import { spawn } from 'node:child_process';
import { createConnection } from 'node:net';
import { mkdtempSync, readFileSync, existsSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomBytes } from 'node:crypto';

const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  '/usr/bin/google-chrome-stable',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
  '/snap/bin/chromium',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
].filter(Boolean);

export function findChrome() {
  for (const p of CHROME_CANDIDATES) {
    try {
      if (existsSync(p)) return p;
    } catch { /* ignore */ }
  }
  return null;
}

/* ------------------------------------------------------------ websocket */

class MiniWebSocket {
  constructor(socket) {
    this.socket = socket;
    this.buffer = Buffer.alloc(0);
    this.listeners = [];
    this.closed = false;
    this.fragments = [];
    this.fragmentOpcode = 0;

    socket.on('data', (chunk) => {
      this.buffer = Buffer.concat([this.buffer, chunk]);
      this.drain();
    });
    socket.on('close', () => { this.closed = true; });
    socket.on('error', () => { this.closed = true; });
  }

  static connect(url) {
    return new Promise((resolve, reject) => {
      const u = new URL(url);
      const key = randomBytes(16).toString('base64');
      const socket = createConnection({
        host: u.hostname,
        port: Number(u.port) || 80,
      });

      socket.once('error', (err) => reject(err));

      socket.once('connect', () => {
        const req =
          `GET ${u.pathname}${u.search} HTTP/1.1\r\n` +
          `Host: ${u.host}\r\n` +
          'Upgrade: websocket\r\n' +
          'Connection: Upgrade\r\n' +
          `Sec-WebSocket-Key: ${key}\r\n` +
          'Sec-WebSocket-Version: 13\r\n\r\n';

        socket.write(req);

        let handshake = Buffer.alloc(0);
        const onData = (chunk) => {
          handshake = Buffer.concat([handshake, chunk]);
          const idx = handshake.indexOf('\r\n\r\n');
          if (idx === -1) return;
          socket.removeListener('data', onData);
          const head = handshake.subarray(0, idx).toString('latin1');
          if (!/HTTP\/1\.1 101/i.test(head)) {
            reject(new Error(`WebSocket handshake failed: ${head.split('\r\n')[0]}`));
            return;
          }
          const rest = handshake.subarray(idx + 4);
          const ws = new MiniWebSocket(socket);
          if (rest.length) { ws.buffer = Buffer.concat([ws.buffer, rest]); ws.drain(); }
          resolve(ws);
        };
        socket.on('data', onData);
      });
    });
  }

  drain() {
    for (;;) {
      const frame = this.readFrame();
      if (!frame) break;
      this.handleFrame(frame);
    }
  }

  readFrame() {
    if (this.buffer.length < 2) return null;
    const b0 = this.buffer[0];
    const b1 = this.buffer[1];
    const fin = (b0 & 0x80) !== 0;
    const opcode = b0 & 0x0f;
    const masked = (b1 & 0x80) !== 0;
    let len = b1 & 0x7f;
    let offset = 2;

    if (len === 126) {
      if (this.buffer.length < offset + 2) return null;
      len = this.buffer.readUInt16BE(offset);
      offset += 2;
    } else if (len === 127) {
      if (this.buffer.length < offset + 8) return null;
      len = Number(this.buffer.readBigUInt64BE(offset));
      offset += 8;
    }

    let mask = null;
    if (masked) {
      if (this.buffer.length < offset + 4) return null;
      mask = this.buffer.subarray(offset, offset + 4);
      offset += 4;
    }

    if (this.buffer.length < offset + len) return null;
    let payload = this.buffer.subarray(offset, offset + len);
    this.buffer = this.buffer.subarray(offset + len);

    if (mask) {
      const out = Buffer.allocUnsafe(len);
      for (let i = 0; i < len; i++) out[i] = payload[i] ^ mask[i % 4];
      payload = out;
    }

    return { fin, opcode, payload };
  }
  handleFrame({ fin, opcode, payload }) {
    if (opcode === 0x8) { this.closed = true; this.socket.end(); return; }
    if (opcode === 0x9) { this.sendFrame(payload, 0xa); return; }
    if (opcode === 0xa) return;

    if (opcode === 0x0) {
      this.fragments.push(payload);
    } else {
      this.fragments = [payload];
      this.fragmentOpcode = opcode;
    }

    if (!fin) return;
    const full = Buffer.concat(this.fragments);
    this.fragments = [];
    if (this.fragmentOpcode === 0x1) {
      for (const fn of this.listeners) fn(full.toString('utf8'));
    }
  }

  sendFrame(payload, opcode = 0x1) {
    if (this.closed) return;
    const data = Buffer.isBuffer(payload) ? payload : Buffer.from(String(payload), 'utf8');
    const len = data.length;
    let header;
    if (len < 126) {
      header = Buffer.alloc(2);
      header[1] = 0x80 | len;
    } else if (len < 65536) {
      header = Buffer.alloc(4);
      header[1] = 0x80 | 126;
      header.writeUInt16BE(len, 2);
    } else {
      header = Buffer.alloc(10);
      header[1] = 0x80 | 127;
      header.writeBigUInt64BE(BigInt(len), 2);
    }
    header[0] = 0x80 | opcode;
    const mask = randomBytes(4);
    const masked = Buffer.allocUnsafe(len);
    for (let i = 0; i < len; i++) masked[i] = data[i] ^ mask[i % 4];
    this.socket.write(Buffer.concat([header, mask, masked]));
  }

  send(data) { this.sendFrame(data, 0x1); }

  onMessage(fn) { this.listeners.push(fn); }

  close() {
    this.closed = true;
    try { this.sendFrame(Buffer.alloc(0), 0x8); } catch { /* ignore */ }
    try { this.socket.end(); } catch { /* ignore */ }
  }
}

/* ------------------------------------------------------------- browser */

/* ------------------------------------------------------------- browser */

export async function launchChrome({ headless = true, extraArgs = [] } = {}) {
  const bin = findChrome();
  if (!bin) {
    throw new Error(
      'No Chrome/Chromium found. Set CHROME_PATH to a Chrome, Chromium or Edge binary.'
    );
  }

  const userDataDir = mkdtempSync(join(tmpdir(), 'impresario-'));
  const args = [
    `--user-data-dir=${userDataDir}`,
    '--remote-debugging-port=0',
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-background-networking',
    '--disable-sync',
    '--disable-extensions',
    '--disable-dev-shm-usage',
    '--hide-scrollbars',
    '--mute-audio',
    '--allow-file-access-from-files',
    'about:blank',
  ];
  if (headless) args.unshift('--headless=new');
  args.push(...extraArgs);

  const proc = spawn(bin, args, { stdio: ['ignore', 'pipe', 'pipe'] });
  proc.stdout.on('data', () => {});
  proc.stderr.on('data', () => {});

  const portFile = join(userDataDir, 'DevToolsActivePort');
  const deadline = Date.now() + 20000;
  let port = null;

  while (Date.now() < deadline) {
    if (existsSync(portFile)) {
      const content = readFileSync(portFile, 'utf8').split('\n');
      if (content[0]) { port = Number(content[0]); break; }
    }
    if (proc.exitCode !== null) {
      throw new Error(`Chrome exited with code ${proc.exitCode}.`);
    }
    await sleep(100);
  }

  if (!port) {
    try { proc.kill('SIGKILL'); rmSync(userDataDir, { recursive: true, force: true }); } catch { /* ignore */ }
    throw new Error('Chrome did not expose a DevTools port within 20s.');
  }

  const version = await (await fetch(`http://127.0.0.1:${port}/json/version`)).json();

  return {
    bin,
    port,
    proc,
    userDataDir,
    webSocketDebuggerUrl: version.webSocketDebuggerUrl,
    async close() {
      try { proc.kill('SIGTERM'); } catch { /* ignore */ }
      await sleep(150);
      try { proc.kill('SIGKILL'); } catch { /* ignore */ }
      try { rmSync(userDataDir, { recursive: true, force: true }); } catch { /* ignore */ }
    },
  };
}

/* ----------------------------------------------------------------- CDP */

/* ----------------------------------------------------------------- CDP */

export class CDP {
  constructor(ws) {
    this.ws = ws;
    this.nextId = 1;
    this.pending = new Map();
    this.handlers = new Map();
    ws.onMessage((raw) => {
      let msg;
      try { msg = JSON.parse(raw); } catch { return; }
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve, reject, timer } = this.pending.get(msg.id);
        clearTimeout(timer);
        this.pending.delete(msg.id);
        if (msg.error) reject(new Error(`${msg.error.message} (${msg.error.code})`));
        else resolve(msg.result);
      } else if (msg.method) {
        const list = this.handlers.get(msg.method);
        if (list) for (const fn of list) fn(msg.params, msg.sessionId);
      }
    });
  }

  static async connect(url) {
    const ws = await MiniWebSocket.connect(url);
    return new CDP(ws);
  }

  send(method, params = {}, sessionId) {
    const id = this.nextId++;
    const payload = { id, method, params };
    if (sessionId) payload.sessionId = sessionId;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        if (this.pending.has(id)) {
          this.pending.delete(id);
          reject(new Error(`CDP timeout: ${method}`));
        }
      }, 30000);
      this.pending.set(id, { resolve, reject, timer });
      try { this.ws.send(JSON.stringify(payload)); }
      catch (err) {
        clearTimeout(timer);
        this.pending.delete(id);
        reject(err);
      }
    });
  }

  on(method, fn) {
    if (!this.handlers.has(method)) this.handlers.set(method, []);
    this.handlers.get(method).push(fn);
  }

  close() {
    for (const { reject, timer } of this.pending.values()) {
      clearTimeout(timer);
      reject(new Error('CDP connection closed'));
    }
    this.pending.clear();
    this.ws.close();
  }
}

/** Open a page target and attach a flat session to it. */
export async function openPage(cdp) {
  const { targetId } = await cdp.send('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await cdp.send('Target.attachToTarget', { targetId, flatten: true });
  await cdp.send('Page.enable', {}, sessionId);
  await cdp.send('Runtime.enable', {}, sessionId);
  await cdp.send('DOM.enable', {}, sessionId);
  await cdp.send('CSS.enable', {}, sessionId);
  await cdp.send('Network.enable', {}, sessionId);
  return { targetId, sessionId };
}

export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Evaluate an expression in the page and return its JSON value. */
export async function evaluate(cdp, sessionId, expression) {
  const result = await cdp.send('Runtime.evaluate', {
    expression,
    returnByValue: true,
    awaitPromise: true,
    userGesture: true,
  }, sessionId);
  if (result.exceptionDetails) {
    const ex = result.exceptionDetails;
    const desc = ex.exception?.description || ex.text || 'evaluation failed';
    throw new Error(`In-page error: ${desc}`);
  }
  return result.result?.value;
}

/** Navigate and wait for the load event plus a settle delay. */
export async function goto(cdp, sessionId, url, { settle = 900 } = {}) {
  let timer, handler;
  const loaded = new Promise((resolve, reject) => {
    handler = (_params, sid) => { if (sid === sessionId) resolve(); };
    cdp.on('Page.loadEventFired', handler);
    timer = setTimeout(() => reject(new Error(`Navigation load timeout: ${url}`)), 12000);
  });
  // Register a rejection handler immediately if the navigation command itself fails.
  loaded.catch(() => {});
  try {
    const result = await cdp.send('Page.navigate', { url }, sessionId);
    if (result.errorText) throw new Error(`Navigation failed: ${result.errorText}`);
    await loaded;
    await sleep(settle);
  } finally {
    clearTimeout(timer);
    cdp.handlers.set('Page.loadEventFired', (cdp.handlers.get('Page.loadEventFired') || []).filter((fn) => fn !== handler));
  }
}

export async function setViewport(cdp, sessionId, width, height, mobile = false, dsf = 1) {
  await cdp.send('Emulation.setDeviceMetricsOverride', {
    width, height, deviceScaleFactor: dsf, mobile,
    screenWidth: width, screenHeight: height,
  }, sessionId);
}

export async function setReducedMotion(cdp, sessionId, reduce) {
  await cdp.send('Emulation.setEmulatedMedia', {
    features: [{ name: 'prefers-reduced-motion', value: reduce ? 'reduce' : 'no-preference' }],
  }, sessionId);
}

export async function screenshot(cdp, sessionId, { fullPage = false } = {}) {
  const params = { format: 'png', captureBeyondViewport: fullPage };
  if (fullPage) {
    const metrics = await cdp.send('Page.getLayoutMetrics', {}, sessionId);
    const size = metrics.cssContentSize || metrics.contentSize;
    params.clip = {
      x: 0, y: 0,
      width: Math.ceil(size.width),
      height: Math.min(Math.ceil(size.height), 20000),
      scale: 1,
    };
  }
  const { data } = await cdp.send('Page.captureScreenshot', params, sessionId);
  return Buffer.from(data, 'base64');
}

export async function scrollTo(cdp, sessionId, y) {
  await evaluate(cdp, sessionId, `window.scrollTo(0, ${Math.max(0, Math.round(y))}); true;`);
  await sleep(220);
}

export function toFileUrl(p) {
  if (/^[a-z]+:\/\//i.test(p)) return p;
  const abs = p.startsWith('/') ? p : join(process.cwd(), p);
  return `file://${abs}`;
}
