const { chromium } = require('playwright');
const fs = require('fs');
const src = fs.readFileSync(process.argv[2], 'utf8');
const html = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><style>body{margin:0;font:14px system-ui}img{max-width:100%}[hidden]{display:none!important}</style></head><body>${src}</body></html>`;
const now = Date.now(); const iso = h => new Date(now - h*3600e3).toISOString();
const S = (id, title, bucket, status, kind, hrs, ps, unread, tags) => ({ id:'session_'+id, title, session_status:'SESSION_STATUS_'+status, status_bucket:'SESSION_STATUS_BUCKET_'+bucket, environment_kind:kind, created_at: iso(hrs+30), updated_at: iso(hrs), post_turn_summary: ps, unread, tags });
const sessions = { data: [
  S('A1','Soma06','BLOCKED','IDLE','bridge',8,{recent_action:'All three builds merged; site goes public once the tunnel is approved.', needs_action:'approve the tunnel at the provider console'}, true),
  S('A3','Wrackline06','REVIEW_READY','IDLE','bridge',0.2,null,true),
  S('A4','Soulstone02','REVIEW_READY','IDLE','bridge',0.1,null,true),
  S('A6','Global dashboard for Claude Code repos','WORKING','RUNNING','anthropic_cloud',0.05,null,false,['project:overseer']),
  S('A8','Strangerhood RED team','COMPLETED','IDLE','bridge',1.5,{recent_action:'Three bot reply fixes committed and live; tests pass. Not pushed.'},true),
  S('A9','Soulstone01','COMPLETED','ARCHIVED','bridge',340,{recent_action:'HANDOFF.md updated with six fixes; none applied yet'},true),
  S('B2','Edge/HL','COMPLETED','IDLE','bridge',200,null,false),
], has_more:false };
const repos = { repos: [
  { full_name:'simoncraig90/soulstone-lab', url:'https://github.com/simoncraig90/soulstone-lab', pushed_at: iso(26), visibility:'private' },
  { full_name:'simoncraig90/Soma', url:'https://github.com/simoncraig90/Soma', pushed_at: iso(700), visibility:'private' },
  { full_name:'simoncraig90/StrangerBot', url:'https://github.com/simoncraig90/StrangerBot', pushed_at: iso(2), visibility:'private' },
  { full_name:'simoncraig90/wrackline-capture-ios', url:'https://github.com/simoncraig90/wrackline-capture-ios', pushed_at: iso(400), visibility:'public' },
  { full_name:'simoncraig90/Overseer', url:'https://github.com/simoncraig90/Overseer', pushed_at: iso(0.5), visibility:'private' },
  { full_name:'simoncraig90/edge-lab', url:'https://github.com/simoncraig90/edge-lab', pushed_at: iso(3000), visibility:'private' },
]};
const prs = { 'soulstone-lab': [ {number:12,title:'Autopilot death RCA hooks',state:'open',draft:true,html_url:'https://github.com/x/12',created_at:iso(50),head:{ref:'claude/rca-hooks'}}, {number:9,title:'Old thing',state:'closed',merged_at:null,html_url:'https://github.com/x/9',created_at:iso(900),head:{ref:'claude/old-thing'}} ], 'StrangerBot': [], 'Overseer': [] };
const branches = { 'soulstone-lab': [{name:'main'},{name:'claude/rca-hooks'},{name:'claude/old-thing'},{name:'claude/forgotten-experiment'}], 'StrangerBot': [{name:'main'}], 'Overseer': [{name:'main'},{name:'overseer/phase-1-2'}] };
const reports = { 'overseer': { repo:'overseer', project:'Overseer', session_id:'session_A6', session_url:'https://claude.ai/code/session_A6', machine:'cloud', branch:'overseer/phase-1-2', unpushed:true, uncommitted:true, running:[], waiting_on_simon:['Say go to merge overseer/phase-1-2'], next:['Phase 3 buttons','Nightly roll-up'], summary:'Phase 1 and 2 page built, awaiting publish.', updated_at: iso(0.3) },
  'strangerbot': { repo:'strangerbot', project:'StrangerBot', session_id:'session_A8', session_url:'https://claude.ai/code/session_A8', machine:'edge-lab', branch:'main', unpushed:true, uncommitted:false, running:['bot-worker','ollama'], waiting_on_simon:[], next:['Push the three fixes','Move bots back to 7B model'], summary:'Three fixes live on edge-lab, not pushed.', updated_at: iso(4) } };
const notes = { 'soulstone-lab': { priority:3, parked:false, target: new Date(now+5*864e5).toISOString().slice(0,10), note:'Goal this month: first real mechanic behind a config key.\nRemember: no hot builds during a live match.', updated_at: iso(20) }, 'edge-lab': { priority:0, parked:true, note:'Dormant until the GPU box is back.', updated_at: iso(100) } };
const stub = `
const SESS=${JSON.stringify(sessions)}, REPOS=${JSON.stringify(repos)}, PRS=${JSON.stringify(prs)}, BR=${JSON.stringify(branches)}, REP=${JSON.stringify(reports)}, NOTES=${JSON.stringify(notes)};
const snap = (obj) => ({ docs: Object.entries(obj).map(([id,d]) => ({ id, exists:true, data:()=>d })), metadata:{fromCache:false, hasPendingWrites:false} });
window.claude = { use: async (name) => {
  if (name === 'mcp') return {
    watchTool(server, tool, input, handler) {
      let d;
      if (tool==='list_sessions') d=SESS; else if (tool==='list_repos') d=REPOS; else if (tool==='list_triggers') d={data:[]};
      else if (tool==='list_pull_requests') d=PRS[input.repo]||[]; else if (tool==='list_branches') d=BR[input.repo]||[];
      setTimeout(() => handler({type:'data', result:{payload:d, cache:{storedAt:Date.now()-30000, revalidating:false}}}), 50); return () => {}; },
    async callTool() { return { payload: {data:[],has_more:false} }; }, async invalidate() {} };
  if (name === 'db') return { collection(c) { return { onSnapshot(next) { setTimeout(() => next(snap(c==='projects'?REP:NOTES)), 80); return () => {}; } }; }, doc(p) { return { async set(d) { window.__saved = [p, d]; } }; } };
  if (name === 'user') return { async can() { return true; } };
  return null; } };`;
(async () => {
  const browser = await chromium.launch();
  for (const [name, w, dark] of [['p12-desktop-light',1280,false],['p12-phone-dark',400,true]]) {
    const ctx = await browser.newContext({ viewport:{width:w,height:900}, deviceScaleFactor:1, colorScheme: dark?'dark':'light' });
    const page = await ctx.newPage(); const errors = [];
    page.on('pageerror', e => errors.push(String(e))); page.on('console', m => { if (m.type()==='error') errors.push(m.text()); });
    await page.addInitScript(stub); await page.goto('about:blank'); await page.setContent(html, { waitUntil: 'load' });
    await page.waitForTimeout(900);
    if (w > 800) { await page.click('[data-edit="soulstone-lab"]'); await page.waitForTimeout(100); await page.fill('#ed-note', 'edited'); await page.click('#ed-save'); await page.waitForTimeout(400); console.log('saved:', JSON.stringify(await page.evaluate(() => window.__saved)).slice(0,160), 'editor hidden:', await page.evaluate(() => document.getElementById('editor').hidden)); }
    const sw = await page.evaluate(() => document.documentElement.scrollWidth);
    await page.screenshot({ path: `${process.env.OUT || '/tmp'}/${name}.png`, fullPage: true });
    console.log(name, 'scrollWidth', sw, 'errors', errors);
    await ctx.close();
  }
  await browser.close();
})();
