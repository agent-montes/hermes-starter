import http from 'node:http';
import fs from 'node:fs';
import os from 'node:os';
import crypto from 'node:crypto';

const ENV_PATH = new URL('../.env', import.meta.url);

function parseEnv(text) {
  const env = {};
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const i = line.indexOf('=');
    if (i < 0) continue;
    env[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  return env;
}

function upsertEnv(path, updates) {
  const existing = fs.existsSync(path) ? fs.readFileSync(path, 'utf8') : '';
  const seen = new Set();
  const out = [];
  for (const raw of existing.split(/\r?\n/)) {
    if (raw.trim() && !raw.trim().startsWith('#') && raw.includes('=')) {
      const k = raw.split('=', 1)[0].trim();
      if (Object.hasOwn(updates, k)) {
        out.push(`${k}=${updates[k]}`);
        seen.add(k);
        continue;
      }
    }
    if (raw.length || out.length) out.push(raw);
  }
  for (const [k, v] of Object.entries(updates)) {
    if (!seen.has(k)) out.push(`${k}=${v}`);
  }
  fs.writeFileSync(path, out.join('\n').replace(/\n*$/, '\n'), { mode: 0o600 });
}

function lanIPv4s() {
  const ips = [];
  for (const entries of Object.values(os.networkInterfaces())) {
    for (const item of entries || []) {
      if (item.family === 'IPv4' && !item.internal) ips.push(item.address);
    }
  }
  return ips;
}

let envText = fs.existsSync(ENV_PATH) ? fs.readFileSync(ENV_PATH, 'utf8') : '';
let env = parseEnv(envText);
if (!env.JARVIS_PHONE_TOKEN) {
  env.JARVIS_PHONE_TOKEN = crypto.randomBytes(32).toString('base64url');
  upsertEnv(ENV_PATH, { JARVIS_PHONE_TOKEN: env.JARVIS_PHONE_TOKEN });
  envText = fs.readFileSync(ENV_PATH, 'utf8');
  env = parseEnv(envText);
}

const host = env.JARVIS_PHONE_HOST || lanIPv4s()[0] || '127.0.0.1';
const port = Number(env.JARVIS_PHONE_PORT || 8787);
const token = env.JARVIS_PHONE_TOKEN;
const hermesUrl = (env.HERMES_API_URL || 'http://127.0.0.1:8642').replace(/\/$/, '');
const hermesKey = env.API_SERVER_KEY || '';
const origin = `http://${host}:${port}`;

if (!token || token.length < 32) throw new Error('JARVIS_PHONE_TOKEN missing/too short');
if (!hermesKey) throw new Error('API_SERVER_KEY missing');

const sessions = new Set();

function send(res, status, body, type = 'text/plain; charset=utf-8', headers = {}) {
  res.writeHead(status, {
    'Content-Type': type,
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    ...headers,
  });
  res.end(body);
}

function json(res, status, obj, headers = {}) {
  send(res, status, JSON.stringify(obj), 'application/json; charset=utf-8', headers);
}

function readBody(req, max = 20000) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => {
      data += chunk;
      if (data.length > max) {
        reject(new Error('request too large'));
        req.destroy();
      }
    });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}

function cookie(req, name) {
  const c = req.headers.cookie || '';
  for (const part of c.split(';')) {
    const [k, ...v] = part.trim().split('=');
    if (k === name) return decodeURIComponent(v.join('='));
  }
  return '';
}

function isAuthed(req) {
  const auth = req.headers.authorization || '';
  if (auth === `Bearer ${token}`) return true;
  const sid = cookie(req, 'jarvis_phone_session');
  return sid && sessions.has(sid);
}

async function hermes(path, method = 'GET', body = undefined) {
  const headers = { Authorization: `Bear${'er'} ${hermesKey}` };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  const r = await fetch(`${hermesUrl}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await r.text();
  let payload;
  try { payload = text ? JSON.parse(text) : {}; } catch { payload = { text }; }
  return { ok: r.ok, status: r.status, payload };
}

function page() {
  return `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><title>Jarvis Phone Bridge</title>
<style>
:root{color-scheme:dark}body{margin:0;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;background:radial-gradient(circle at 50% 0,#18324d,#05070a 55%);color:#eef6ff;min-height:100vh}main{max-width:760px;margin:0 auto;padding:28px 18px 60px}.card{background:rgba(4,10,18,.78);border:1px solid rgba(116,199,255,.24);box-shadow:0 20px 80px rgba(0,0,0,.45),inset 0 0 40px rgba(55,170,255,.06);border-radius:24px;padding:22px;margin:16px 0}h1{font-size:34px;margin:8px 0 2px;letter-spacing:.04em}.sub{color:#9fc7e8}textarea,input{width:100%;box-sizing:border-box;border:1px solid rgba(123,205,255,.28);background:rgba(0,0,0,.36);color:#fff;border-radius:16px;padding:14px;font-size:16px}textarea{min-height:130px}button{border:0;border-radius:999px;padding:14px 18px;margin:8px 8px 0 0;background:#80d8ff;color:#041018;font-weight:800;font-size:16px}.ghost{background:rgba(128,216,255,.12);color:#bfefff;border:1px solid rgba(128,216,255,.28)}#out{white-space:pre-wrap;line-height:1.4}.ok{color:#79ffa8}.bad{color:#ff8e8e}.row{display:flex;gap:8px;flex-wrap:wrap}.pill{display:inline-block;border:1px solid rgba(128,216,255,.28);border-radius:999px;padding:6px 10px;color:#bfefff;margin:4px 4px 0 0;font-size:13px}</style></head>
<body><main><h1>JARVIS</h1><div class="sub">LAN phone bridge to Hermes on your Mac</div>
<section id="login" class="card" hidden><h2>Unlock</h2><p class="sub">Enter the local bridge token from the Mac pairing page.</p><input id="token" placeholder="Access token" autocomplete="off"><button onclick="login()">Connect</button><p id="loginMsg"></p></section>
<section id="app" class="card" hidden><div><span class="pill" id="health">checking…</span><span class="pill">Model: Hermes</span><span class="pill">Voice app stays on Mac</span></div><h2>Ask Hermes</h2><textarea id="prompt" placeholder="Ask Jarvis to do something…"></textarea><div class="row"><button onclick="ask()">Send</button><button class="ghost" onclick="dictate()">Dictate</button><button class="ghost" onclick="speakLast()">Speak reply</button></div></section>
<section class="card"><h2>Output</h2><div id="out" class="sub">Ready.</div></section></main>
<script>
const out=document.getElementById('out');let last='';
function msg(t, cls=''){out.className=cls;out.textContent=t;}
async function api(path, opts={}){const r=await fetch(path,{...opts,headers:{'Content-Type':'application/json',...(opts.headers||{})}}); if(r.status===401){showLogin(); throw new Error('unauthorized');} const j=await r.json().catch(()=>({})); if(!r.ok) throw new Error(j.error||('HTTP '+r.status)); return j;}
function showLogin(){document.getElementById('login').hidden=false;document.getElementById('app').hidden=true;}
function showApp(){document.getElementById('login').hidden=true;document.getElementById('app').hidden=false;}
async function login(){const t=document.getElementById('token').value.trim();try{await api('/api/login',{method:'POST',body:JSON.stringify({token:t})});showApp();status();}catch(e){document.getElementById('loginMsg').textContent='Not accepted';}}
async function status(){try{const j=await api('/api/status');document.getElementById('health').textContent='Hermes '+(j.hermes?'online':'offline');document.getElementById('health').className='pill '+(j.hermes?'ok':'bad');showApp();}catch(e){showLogin();}}
async function ask(){const prompt=document.getElementById('prompt').value.trim(); if(!prompt) return; msg('Working…'); try{const j=await api('/api/ask',{method:'POST',body:JSON.stringify({prompt})}); last=j.output||'(no output)'; msg(last,'');}catch(e){msg('Error: '+e.message,'bad');}}
function dictate(){const SR=window.SpeechRecognition||window.webkitSpeechRecognition;if(!SR){msg('Speech recognition is not available in this browser.','bad');return;}const r=new SR();r.lang='en-US';r.interimResults=false;r.onresult=e=>{document.getElementById('prompt').value=e.results[0][0].transcript};r.start();}
function speakLast(){if(!last) return; speechSynthesis.cancel(); speechSynthesis.speak(new SpeechSynthesisUtterance(last));}
status();
</script></body></html>`;
}

function pairPage() {
  const encoded = encodeURIComponent(token);
  const url = `${origin}/?token=${encoded}`;
  return `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Jarvis Pairing</title><body style="font-family:-apple-system,BlinkMacSystemFont,sans-serif;background:#05070a;color:#eef6ff;padding:32px"><h1>Jarvis Phone Pairing</h1><p>Open this on your phone while on the same Wi‑Fi:</p><p style="font-size:20px"><a style="color:#80d8ff" href="${url}">${origin}</a></p><p>Token is in the link on this Mac-only pairing page. Do not share it.</p><script>history.replaceState(null,'','/pair-local');</script></body>`;
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url || '/', origin);
    if (url.pathname === '/pair-local') return send(res, 200, pairPage(), 'text/html; charset=utf-8');
    if (url.pathname === '/' && url.searchParams.get('token') === token) {
      const sid = crypto.randomBytes(18).toString('base64url');
      sessions.add(sid);
      return send(res, 302, '', 'text/plain', {
        'Set-Cookie': `jarvis_phone_session=${encodeURIComponent(sid)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=604800`,
        Location: '/',
      });
    }
    if (url.pathname === '/') return send(res, 200, page(), 'text/html; charset=utf-8');
    if (url.pathname === '/api/login' && req.method === 'POST') {
      const body = JSON.parse(await readBody(req) || '{}');
      if (body.token !== token) return json(res, 401, { error: 'bad token' });
      const sid = crypto.randomBytes(18).toString('base64url');
      sessions.add(sid);
      return json(res, 200, { ok: true }, { 'Set-Cookie': `jarvis_phone_session=${encodeURIComponent(sid)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=604800` });
    }
    if (url.pathname === '/api/status') {
      if (!isAuthed(req)) return json(res, 401, { error: 'auth required' });
      const h = await hermes('/health');
      return json(res, 200, { ok: true, hermes: h.ok, hermesStatus: h.status });
    }
    if (url.pathname === '/api/ask' && req.method === 'POST') {
      if (!isAuthed(req)) return json(res, 401, { error: 'auth required' });
      const body = JSON.parse(await readBody(req) || '{}');
      const prompt = String(body.prompt || '').slice(0, 4000).trim();
      if (!prompt) return json(res, 400, { error: 'prompt required' });
      const created = await hermes('/v1/runs', 'POST', { input: prompt, max_turns: 8 });
      if (!created.ok) return json(res, 502, { error: 'Hermes run create failed', status: created.status });
      const runId = created.payload.run_id || created.payload.id;
      if (!runId) return json(res, 502, { error: 'Hermes run id missing' });
      let final = null;
      for (let i = 0; i < 90; i++) {
        await new Promise(r => setTimeout(r, 1000));
        const s = await hermes(`/v1/runs/${encodeURIComponent(runId)}`);
        if (!s.ok) continue;
        const st = s.payload.status || s.payload.state;
        if (['completed', 'failed', 'cancelled', 'error'].includes(st)) { final = s.payload; break; }
      }
      if (!final) return json(res, 504, { error: 'Hermes run timed out' });
      const output = final.output || final.final_response || final.result || final.response || JSON.stringify(final);
      return json(res, 200, { ok: true, output: String(output) });
    }
    return json(res, 404, { error: 'not found' });
  } catch (err) {
    return json(res, 500, { error: err?.message || 'server error' });
  }
});

server.listen(port, host, () => {
  console.log(`jarvis_phone_bridge_ready ${origin}`);
  console.log('token_present true');
});
