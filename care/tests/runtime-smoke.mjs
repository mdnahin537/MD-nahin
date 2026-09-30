// Actual local Workers/D1 runtime, isolated from Cloudflare accounts and email.
import assert from 'node:assert/strict';
import {spawn,spawnSync} from 'node:child_process';
import {mkdtempSync,writeFileSync,mkdirSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {resolve,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {setTimeout as delay} from 'node:timers/promises';

const care = fileURLToPath(new URL('..',import.meta.url));
const temporary = mkdtempSync(join(tmpdir(),'care-runtime-'));
const persist = join(temporary,'state');
const bin = resolve(care,'node_modules/wrangler/bin/wrangler.js');
const environment = {...process.env,CI:'true',WRANGLER_SEND_METRICS:'false'};
for (const key of ['CLOUDFLARE_API_TOKEN','CLOUDFLARE_API_KEY','CLOUDFLARE_ACCOUNT_ID','CLOUDFLARE_EMAIL',
  'SESSION_SECRET','OWNER_SETUP_TOKEN','CARE_MAIL_API_KEY','OPENROUTER_KEY']) delete environment[key];
const parsed = spawnSync('python3',['-c',
  "import json,tomllib;print(json.dumps(tomllib.load(open('wrangler.toml','rb'))))"],
  {cwd:care,encoding:'utf8',env:environment});
assert.equal(parsed.status,0,'Could not read checked-in Wrangler configuration');
const config = JSON.parse(parsed.stdout);
config.main = resolve(care,config.main);
config.assets.directory = resolve(care,config.assets.directory);
config.d1_databases = config.d1_databases.map(db=>({...db,migrations_dir:resolve(care,db.migrations_dir)}));
// No remote AI binding or real mail transport is available to this fixture.
delete config.ai; delete config.keep_vars;
config.vars = {...config.vars,ENVIRONMENT:'development',SESSION_SECRET:'isolated-runtime-session',
  OWNER_SETUP_TOKEN:'isolated-runtime-owner',CARE_MAIL_ENABLED:'false'};
const configPath = join(temporary,'wrangler.json');
writeFileSync(configPath,JSON.stringify(config));
const migrated = spawnSync(process.execPath,[bin,'d1','migrations','apply','realmwright-care',
  '--local','--config',configPath,'--persist-to',persist],
  {cwd:care,encoding:'utf8',env:environment,input:'y\n',timeout:90000});
assert.equal(migrated.status,0,'Local migration failed: '+(migrated.stderr||migrated.stdout).slice(-3000));
const origin = 'http://127.0.0.1:8877';
let diagnostics = '';
const server = spawn(process.execPath,[bin,'dev','--local','--config',configPath,
  '--ip','127.0.0.1','--port','8877','--persist-to',persist,'--log-level','warn'],
  {cwd:care,env:environment,stdio:['ignore','pipe','pipe']});
const exited = new Promise(resolve=>server.once('exit',resolve));
server.stdout.on('data',chunk=>{diagnostics=(diagnostics+chunk).slice(-6000);});
server.stderr.on('data',chunk=>{diagnostics=(diagnostics+chunk).slice(-6000);});
const evidence = {scope:'Local Workers runtime and temporary D1 only; no browser, production data, or email',checks:[]};
async function check(name,fn) { await fn(); evidence.checks.push({name,passed:true}); console.log('PASS '+name); }
function client() {
  let cookie = '';
  return {cookie:()=>cookie,async call(path,body,action,method=body===undefined?'GET':'POST',extraHeaders={}) {
    const headers={Origin:origin,Cookie:cookie,...extraHeaders};
    if(body!==undefined)headers['Content-Type']='application/json';
    if(action)headers['X-Care-Action']=action;
    const response=await fetch(origin+path,{method,headers,redirect:'manual',signal:AbortSignal.timeout(10000),
      ...(body!==undefined?{body:JSON.stringify(body)}:{})});
    const saved=response.headers.get('Set-Cookie'); if(saved)cookie=saved.split(';')[0];
    return response;
  }};
}
const publicClient=client(),customer=client(),ideas=client(),owner=client();
let report,joined,idea,comment;
const bug={type:'bug',area:'exports-data',symptom:'slow',frequency:'sometimes',expected:'Original α',
  actual:'Original β',freetext:'Complete <&> বাংলা report',ctx:{v:'3.2',schema:4}};
try {
  let ready=false;
  for(let attempt=0;attempt<120;attempt++){
    if(server.exitCode!==null)throw new Error('Local Worker stopped: '+diagnostics);
    try { if((await publicClient.call('/api/health')).ok){ready=true;break;} } catch {}
    await delay(250);
  }
  assert.ok(ready,'Local Worker did not start: '+diagnostics);
  await check('Real Worker health and protected assets',async()=>{
    assert.equal((await (await publicClient.call('/api/health')).json()).release,'2026-09-30-care-audit');
    for(const path of ['/desk/','/desk/desk.js','/api/desk/summary','/api/desk/notifications'])
      assert.equal((await publicClient.call(path)).status,404);
    assert.equal((await publicClient.call('/report/')).status,200);
  });
  await check('Local identity and complete bug creation',async()=>{
    assert.equal((await customer.call('/auth/bootstrap',{},'bootstrap')).status,200);
    const response=await customer.call('/api/report',{...bug,submissionKey:'runtime-report-fixture-01'});
    assert.equal(response.status,200);report=await response.json();
    assert.ok(Number.isInteger(report.reportId));
    const item=await (await customer.call('/api/item/'+report.itemId)).json();
    assert.equal(item.reports[0].freetext,bug.freetext);assert.equal(item.reports[0].version,'3.2');
  });
  await check('Retry and matching details on actual D1',async()=>{
    const repeated=await (await customer.call('/api/report',{...bug,submissionKey:'runtime-report-fixture-01'})).json();
    assert.equal(repeated.reportId,report.reportId);
    const response=await customer.call('/api/report',{...bug,mode:'join',joinItemId:report.itemId,freetext:'Joined original detail'});
    assert.equal(response.status,200);joined=await response.json();
    assert.notEqual(joined.reportId,report.reportId);
    assert.equal((await (await customer.call('/api/item/'+report.itemId)).json()).reports.length,2);
  });
  await check('Comments and repeat-safe voting on actual D1',async()=>{
    const response=await customer.call('/api/comment',{itemId:report.itemId,body:'Original comment <&> বাংলা',submissionKey:'runtime-comment-fixture-1'});
    assert.equal(response.status,200);comment=await response.json();
    const repeated=await (await customer.call('/api/comment',{itemId:report.itemId,body:'Original comment <&> বাংলা',submissionKey:'runtime-comment-fixture-1'})).json();
    assert.equal(repeated.id,comment.id);
    assert.equal((await (await customer.call('/api/vote/'+report.itemId,{value:0},null,'PUT')).json()).net,0);
    assert.equal((await (await customer.call('/api/vote/'+report.itemId,{value:1},null,'PUT')).json()).net,1);
    assert.equal((await (await customer.call('/api/vote/'+report.itemId,{value:1},null,'PUT')).json()).net,1);
  });
  await check('Follow-up choices and duplicate-safe updates on actual D1',async()=>{
    const question=(await (await customer.call('/api/report/'+report.reportId+'/followup-question')).json()).question;
    assert.equal(question.q,'which_export');
    const answer={q:question.q,a:'json'};
    assert.equal((await customer.call('/api/report/'+report.reportId+'/followup',answer,null,'PATCH')).status,200);
    assert.equal((await customer.call('/api/report/'+report.reportId+'/followup',answer,null,'PATCH')).status,200);
    const item=await (await customer.call('/api/item/'+report.itemId)).json();
    assert.ok(item.reports.some(r=>r.followups.some(f=>f.answer==='JSON')));
    assert.equal(item.reports[0].freetext,bug.freetext);
  });
  await check('Full idea submission and single protected owner',async()=>{
    assert.equal((await ideas.call('/auth/bootstrap',{},'bootstrap')).status,200);
    const response=await ideas.call('/api/report',{type:'idea',area:'exports-data',ideaKind:'new_tool',
      ask:'Export a faction',why:'Less repeated preparation',doneLooksLike:'One readable PDF'});
    assert.equal(response.status,200);idea=await response.json();
    assert.equal((await owner.call('/auth/owner/claim',{token:'isolated-runtime-owner'},'owner-claim')).status,200);
    assert.equal((await owner.call('/auth/owner/claim',{token:'isolated-runtime-owner'},'owner-claim')).status,409);
    assert.equal((await owner.call('/desk/')).status,200);
    const saved=await (await owner.call('/api/desk/review/report/'+report.reportId)).json();
    assert.equal(saved.record.payload.ctx.schema,4);
    const outbox=await (await owner.call('/api/desk/notifications')).json();
    assert.equal(outbox.counts.find(row=>row.state==='pending').count,5);
    const brief=await (await owner.call('/api/desk/brief',{items:[idea.itemId]})).json();
    assert.ok(brief.text.includes('Less repeated preparation'));assert.ok(brief.text.includes('One readable PDF'));
  });
  await check('Held review preserves content and restores visible counts',async()=>{
    assert.equal((await owner.call('/api/desk/review/report/'+joined.reportId,{publish:false})).status,200);
    assert.equal((await (await customer.call('/api/item/'+report.itemId)).json()).reports.length,1);
    const detail=await (await owner.call('/api/desk/review/report/'+joined.reportId)).json();
    assert.equal(detail.record.payload.freetext,'Joined original detail');
    assert.equal((await owner.call('/api/desk/review/report/'+joined.reportId,{publish:true})).status,200);
    assert.equal((await (await customer.call('/api/item/'+report.itemId)).json()).reports.length,2);
  });
  await check('Origin checks and logout revocation remain effective',async()=>{
    assert.equal((await customer.call('/api/comment',{itemId:report.itemId,body:'Cross-site'},null,'POST',{Origin:'https://foreign.test'})).status,403);
    const oldCookie=owner.cookie();
    assert.equal((await owner.call('/auth/logout')).status,302);
    assert.equal((await publicClient.call('/api/desk/summary',undefined,null,'GET',{Cookie:oldCookie})).status,404);
    assert.equal((await (await customer.call('/api/me')).json()).loggedIn,true);
  });
  evidence.passed=true;
} catch(error) {
  evidence.passed=false;evidence.error=error.message;throw error;
} finally {
  mkdirSync(resolve(care,'test-results'),{recursive:true});
  writeFileSync(resolve(care,'test-results/runtime-smoke.json'),JSON.stringify(evidence,null,2));
  server.kill('SIGTERM');
  await Promise.race([exited,delay(5000)]);
  if(server.exitCode===null)server.kill('SIGKILL');
}
