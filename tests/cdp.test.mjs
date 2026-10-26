import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';

test('completed CDP calls release timeout handles instead of holding each capture open 30s', () => {
  const url = new URL('../scripts/lib/cdp.mjs', import.meta.url).href;
  const result = spawnSync(process.execPath, ['--input-type=module', '-e', `
    import {CDP} from ${JSON.stringify(url)};
    let callback;
    const ws={onMessage(fn){callback=fn},send(payload){queueMicrotask(()=>callback(JSON.stringify({id:JSON.parse(payload).id,result:{ok:true}})))},close(){}};
    const cdp=new CDP(ws);await cdp.send('test');cdp.close();
  `], { encoding: 'utf8', timeout: 2000 });
  assert.equal(result.status, 0, `CDP child should exit promptly: ${result.error?.message || result.stderr}`);
});
test('completed navigation releases load deadlines and event listeners', () => {
  const url = new URL('../scripts/lib/cdp.mjs', import.meta.url).href;
  const result = spawnSync(process.execPath, ['--input-type=module', '-e', `
    import {CDP,goto} from ${JSON.stringify(url)};
    let callback;
    const ws={onMessage(fn){callback=fn},send(payload){const p=JSON.parse(payload);queueMicrotask(()=>{callback(JSON.stringify({id:p.id,result:{}}));callback(JSON.stringify({method:'Page.loadEventFired',params:{},sessionId:'s'}))})},close(){}};
    const cdp=new CDP(ws);await goto(cdp,'s','file://fixture',{settle:0});
    if(cdp.handlers.get('Page.loadEventFired')?.length)throw new Error('Navigation listener leaked');cdp.close();
  `], { encoding: 'utf8', timeout: 2000 });
  assert.equal(result.status, 0, `Navigation should clean up: ${result.error?.message || result.stderr}`);
});
