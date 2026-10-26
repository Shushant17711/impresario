/**
 * Minimal PNG reader for 8-bit non-interlaced images (what Chrome returns).
 * Used to measure real palette dominance from screenshots.
 */

import { inflateSync, deflateSync } from 'node:zlib';

export function decodePNG(buffer) {
  if (buffer.length < 8) throw new Error('Not a PNG');
  const sig = [137, 80, 78, 71, 13, 10, 26, 10];
  for (let i = 0; i < 8; i++) {
    if (buffer[i] !== sig[i]) throw new Error('Bad PNG signature');
  }

  let offset = 8;
  let width = 0, height = 0, bitDepth = 8, colorType = 6, interlace = 0;
  const idat = [];
  let palette = null;
  let trns = null;

  while (offset < buffer.length) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer.toString('ascii', offset + 4, offset + 8);
    const dataStart = offset + 8;
    const data = buffer.subarray(dataStart, dataStart + length);

    if (type === 'IHDR') {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      bitDepth = data[8];
      colorType = data[9];
      interlace = data[12];
    } else if (type === 'PLTE') {
      palette = Buffer.from(data);
    } else if (type === 'tRNS') {
      trns = Buffer.from(data);
    } else if (type === 'IDAT') {
      idat.push(Buffer.from(data));
    } else if (type === 'IEND') {
      break;
    }

    offset = dataStart + length + 4;
  }

  if (interlace !== 0) throw new Error('Interlaced PNG not supported');
  if (bitDepth !== 8) throw new Error(`Unsupported PNG bit depth ${bitDepth}`);

  const channels = { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 }[colorType];
  if (!channels) throw new Error(`Unsupported PNG colour type ${colorType}`);

  const raw = inflateSync(Buffer.concat(idat));
  const bpp = channels;
  const stride = width * bpp;
  const out = Buffer.alloc(height * stride);

  let pos = 0;
  for (let y = 0; y < height; y++) {
    const filter = raw[pos++];
    const line = raw.subarray(pos, pos + stride);
    pos += stride;
    const cur = out.subarray(y * stride, (y + 1) * stride);
    const prev = y > 0 ? out.subarray((y - 1) * stride, y * stride) : null;

    for (let x = 0; x < stride; x++) {
      const a = x >= bpp ? cur[x - bpp] : 0;
      const b = prev ? prev[x] : 0;
      const c = prev && x >= bpp ? prev[x - bpp] : 0;
      let v = line[x];
      switch (filter) {
        case 0: break;
        case 1: v = v + a; break;
        case 2: v = v + b; break;
        case 3: v = v + ((a + b) >> 1); break;
        case 4: {
          const p = a + b - c;
          const pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
          v = v + (pa <= pb && pa <= pc ? a : pb <= pc ? b : c);
          break;
        }
        default: throw new Error(`Unknown PNG filter ${filter}`);
      }
      cur[x] = v & 0xff;
    }
  }

  // Normalise to RGBA
  const rgba = Buffer.alloc(width * height * 4);
  for (let i = 0, p = 0; i < width * height; i++, p += bpp) {
    let r, g, b, a = 255;
    if (colorType === 6) { r = out[p]; g = out[p + 1]; b = out[p + 2]; a = out[p + 3]; }
    else if (colorType === 2) { r = out[p]; g = out[p + 1]; b = out[p + 2]; }
    else if (colorType === 0) { r = g = b = out[p]; }
    else if (colorType === 4) { r = g = b = out[p]; a = out[p + 1]; }
    else if (colorType === 3) {
      const idx = out[p];
      r = palette[idx * 3]; g = palette[idx * 3 + 1]; b = palette[idx * 3 + 2];
      if (trns && idx < trns.length) a = trns[idx];
    }
    rgba[i * 4] = r; rgba[i * 4 + 1] = g; rgba[i * 4 + 2] = b; rgba[i * 4 + 3] = a;
  }

  return { width, height, data: rgba };
}

/**
 * Quantised colour histogram.
 * @param {Buffer} pngBytes
 * @param {{quantize?: number, step?: number}} opts
 */
export function colourHistogram(pngBytes, { quantize = 8, step = 1 } = {}) {
  const { width, height, data } = decodePNG(pngBytes);
  const buckets = new Map();
  let total = 0;

  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      const i = (y * width + x) * 4;
      if (data[i + 3] < 8) continue;
      const r = Math.min(255, Math.round(data[i] / quantize) * quantize);
      const g = Math.min(255, Math.round(data[i + 1] / quantize) * quantize);
      const b = Math.min(255, Math.round(data[i + 2] / quantize) * quantize);
      const key = (r << 16) | (g << 8) | b;
      buckets.set(key, (buckets.get(key) || 0) + 1);
      total++;
    }
  }

  const colours = [...buckets.entries()]
    .map(([key, count]) => ({
      hex: '#' + key.toString(16).padStart(6, '0'),
      rgb: [(key >> 16) & 255, (key >> 8) & 255, key & 255],
      count,
      share: total ? count / total : 0,
    }))
    .sort((a, b) => b.count - a.count);

  return { width, height, total, colours };
}

/* ------------------------------------------------------------- encoding */

const CRC_TABLE = (() => {
  const table = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c;
  }
  return table;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const out = Buffer.alloc(data.length + 12);
  out.writeUInt32BE(data.length, 0);
  out.write(type, 4, 'ascii');
  data.copy(out, 8);
  out.writeUInt32BE(crc32(out.subarray(4, 8 + data.length)), 8 + data.length);
  return out;
}

/**
 * Encode raw RGBA pixels as a PNG.
 * @param {number} width
 * @param {number} height
 * @param {Buffer} rgba  width*height*4 bytes
 */
export function encodePNG(width, height, rgba) {
  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0; // filter: none
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, y * stride + stride);
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;   // bit depth
  ihdr[9] = 6;   // colour type: RGBA
  ihdr[10] = 0;  // compression
  ihdr[11] = 0;  // filter
  ihdr[12] = 0;  // interlace

  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 6 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

/**
 * Compose a horizontal filmstrip from several PNG screenshots, scaled down to
 * a common height.
 * @param {Buffer[]} frames
 * @param {{height?: number, gap?: number, background?: number[]}} opts
 */
export function filmstrip(frames, { height = 240, gap = 12, background = [255, 255, 255] } = {}) {
  if (!frames.length) throw new Error('filmstrip needs at least one frame');

  const decoded = frames.map((f) => decodePNG(f));
  const scale = height / Math.max(...decoded.map((d) => d.height));
  const scaled = decoded.map((d) => ({
    w: Math.max(1, Math.round(d.width * scale)),
    h: Math.max(1, Math.round(d.height * scale)),
    data: d.data,
    srcW: d.width,
    srcH: d.height,
  }));

  const totalW = scaled.reduce((s, f) => s + f.w, 0) + gap * (scaled.length + 1);
  const out = Buffer.alloc(totalW * height * 4);
  for (let i = 0; i < totalW * height; i++) {
    out[i * 4] = background[0];
    out[i * 4 + 1] = background[1];
    out[i * 4 + 2] = background[2];
    out[i * 4 + 3] = 255;
  }

  let x = gap;
  for (const f of scaled) {
    for (let dy = 0; dy < f.h; dy++) {
      const sy = Math.min(f.srcH - 1, Math.floor((dy / f.h) * f.srcH));
      for (let dx = 0; dx < f.w; dx++) {
        const sx = Math.min(f.srcW - 1, Math.floor((dx / f.w) * f.srcW));
        const si = (sy * f.srcW + sx) * 4;
        const di = ((dy) * totalW + (x + dx)) * 4;
        out[di] = f.data[si];
        out[di + 1] = f.data[si + 1];
        out[di + 2] = f.data[si + 2];
        out[di + 3] = 255;
      }
    }
    x += f.w + gap;
  }

  return encodePNG(totalW, height, out);
}

