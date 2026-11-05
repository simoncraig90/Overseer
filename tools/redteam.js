const { chromium } = require('playwright'); const fs = require('fs');
const src = fs.readFileSync(process.argv[2], 'utf8');
const html = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>[hidden]{display:none!important}</style></head><body>${src}</body></html>`;
const now = Date.now(); const iso = h => new Date(now - h*3600e3).toISOString();
const S = (id, title, bucket, status, kind, hrs, ps, unread, tags) => ({ id, title, session_status:'SESSION_STATUS_'+status, status_bucket:'SESSION_STATUS_BUCKET_'+bucket, environment_kind:kind, created_at: iso(hrs+1), updated_at: iso(hrs), post_turn_summary: ps, unread, tags });
const sessions = { data: [
  S('session_X1','<img src=x onerror="window.__xss=1">','BLOCKED','IDLE','bridge',1,{needs_action:'"><svg onload="window.__xss=2">', recent_action:'</td><script>window.__xss=3</script>'},true),
  S('session_X2','constructor','WORKING','RUNNING','anthropic_cloud',0.1,null,false,['project:__proto__']),
  S('session_X3','SEO audit notes','COMPLETED','IDLE','bridge',3,null,false),
  S('session_X4','Chat','COMPLETED','IDLE','bridge',3,{recent_action: 7},false),
  S('session_X5','Weird','COMPLETED','WHATEVER','bridge',3,null,false),
  { id:'session_X6', title:null, updated_at:'not a date' },
], has_more:true, last_id:'session_X6' };
const repos = { repos: [ { full_name:'simoncraig90/SEO', url:'javascript:window.__xss=4', pushed_at: iso(1) }, { full_name:'simoncraig90/Chat', url:'https://github.com/simoncraig90/Chat', pushed_at: iso(1) }, { full_name:'simoncraig90/soulstone-lab', url:'https://github.com/simoncraig90/soulstone-lab', pushed_at: iso(1) } ] };
const prs = { 'SEO': [ {number:'1" onmouseover="window.__xss=5',title:'t',state:'open',html_url:'javascript:window.__xss=6',created_at:iso(1),head:{ref:'claude/a'}}, {number:2,title:'merged first',state:'closed',merged_at:iso(5),html_url:'https://x/2',created_at:iso(9),head:{ref:'claude/b'}}, {number:3,title:'then closed',state:'closed',merged_at:null,html_url:'https://x/3',created_at:iso(8),head:{ref:'claude/b'}} ], 'Chat': 'not an array' };
const branches = { 'SEO': [{name:'claude/b'},{name:'claude/a'},{name:'constructor'}], 'Chat': [{name:null}] };
const reports = { '__proto__': { polluted: true }, 'seo': { repo:'seo', project:'<b onclick="window.__xss=7">SEO</b>', session_url:'javascript:window.__xss=8', machine:{a:1}, branch:['x'], unpushed:'yes', running:'ollama', waiting_on_simon:'one thing', next:[{a:1}], summary:null, updated_at: 12345 } };
const notes = { 'chat': { priority:'3', parked:'no', note: 42, target: {}, updated_at:null }, 'soulstone-lab': { priority: 99, note:'<script>window.__xss=9</script>' } };
const stub = `
const SESS=${JSON.stringify(sessions)}, REPOS=${JSON.stringify(repos)}, PRS=${JSON.stringify(prs)}, BR=${JSON.stringify(branches)}, REP=${JSON.stringify(reports)}, NOTES=${JSON.stringify(notes)};
window.__pages = 0;
const snap = (obj) => ({ docs: Object.keys(obj).map(id => ({ id, exists:true, data:()=>obj[id] })), metadata:{fromCache:false, hasPendingWrites:false} });
window.claude = { use: async (name) => {
  if (name === 'mcp') return {
    watchTool(server, tool, input, handler) { let d;
      if (tool==='list_sessions') d=SESS; else if (tool==='list_repos') d=REPOS; else if (tool==='list_triggers') d={data:[{name:'<i onclick=1>t</i>', enabled:true, cron_expression:'<b>x</b>', last_run:{status:'FAILED'}}]};
      else if (tool==='list_pull_requests') d=PRS[input.repo]||[]; else if (tool==='list_branches') d=BR[input.repo]||[];
      setTimeout(() => handler({type:'data', result:{payload:d}}), 30); return () => {}; },
    async callTool(server, tool, input) { window.__pages++; return { payload: {data:[], has_more:true, last_id:'session_X6'} }; }, async invalidate() {} };
  if (name === 'db') return { collection(c) { return { onSnapshot(next) { setTimeout(() => next(snap(c==='projects'?REP:NOTES)), 50); return () => {}; } }; }, doc(p) { return { async set(d) { window.__saved=[p,d]; } }; } };
  if (name === 'user') return { async can() { return true; } };
  return null; } };`;
(async () => {
  const browser = await chromium.launch(); const page = await browser.newPage({ viewport:{width:1200,height:900} });
  const errors = []; page.on('pageerror', e => errors.push(String(e).split('\n')[0])); page.on('console', m => { if (m.type()==='error') errors.push(m.text().slice(0,160)); });
  await page.addInitScript(stub); await page.goto('about:blank'); await page.setContent(html, { waitUntil:'load' }); await page.waitForTimeout(800);
  const r = await page.evaluate(() => ({
    xss: window.__xss || null,
    jsHrefs: [...document.querySelectorAll('a[href]')].map(a => a.getAttribute('href')).filter(h => /^\s*javascript:/i.test(h)).length,
    protoPolluted: ({}).polluted === true,
    undefinedText: (document.body.innerText.match(/undefined|NaN|\[object Object\]/g) || []).length,
    pages: window.__pages,
    lanes: [...document.querySelectorAll('.lane h3 > span')].map(e => e.textContent.trim()),
    inboxCount: document.querySelectorAll('#inbox .card').length,
    rendered: document.querySelector('#counts').textContent.trim().slice(0,80),
  }));
  console.log(JSON.stringify(r, null, 1)); console.log('errors', errors);
  await browser.close();
})();
