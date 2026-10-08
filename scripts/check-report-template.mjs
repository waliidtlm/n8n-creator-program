import fs from 'node:fs';
import assert from 'node:assert/strict';
const read = file => JSON.parse(fs.readFileSync(new URL('../' + file, import.meta.url), 'utf8'));
const main = read('Workflows/WR01-WR99/WR-01-Weekly-Client-Report.json');
const handler = read('Workflows/WR01-WR99/WR-99-Report-Error-Handler.json');
const dataset = read('fixtures/WR-01-demo-dataset.json');
const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
const node = name => { const result = main.nodes.find(n => n.name === name); assert.ok(result, name); return result; };
let count = 0;
async function test(name, check) { await check(); count++; console.log('PASS ' + name); }
const now = { toISO: () => '2026-10-08T09:00:00Z' };
const run = async (name, data, states = {}) => {
 const lookup = key => ({ item: { json: states[key] }, first: () => ({ json: states[key] }) });
 return (await new AsyncFunction('$json','$','$now','$execution',node(name).parameters.jsCode)(structuredClone(data),lookup,now,{id:'offline-test'})).json;
};
function expr(expression, data, states = {}) {
 return new Function('$json','$','return (' + expression.slice(3,-2) + ')')(data, key => ({item:{json:states[key]},first:()=>({json:states[key]})}));
}
for (const workflow of [main,handler]) await test(workflow.name + ': sanitized export and canvas notes', () => {
 assert.equal(workflow.active,false); assert.equal(workflow.id,undefined);
 assert.deepEqual(Object.keys(workflow.pinData || {}),[]);
 const names = new Set(workflow.nodes.map(n=>n.name)); assert.equal(names.size,workflow.nodes.length);
 for (const n of workflow.nodes) {
  assert.equal(n.credentials,undefined); assert.equal(n.webhookId,undefined);
  if(n.type.endsWith('code')) new AsyncFunction(n.parameters.jsCode);
  for(const match of JSON.stringify(n.parameters).matchAll(/\$\(['"]([^'"]+)['"]\)/g)) assert.ok(names.has(match[1]),'Missing expression reference '+match[1]);
 }
 for(const [source,outputs]of Object.entries(workflow.connections)) {
  assert.ok(names.has(source));for(const arrays of Object.values(outputs))for(const links of arrays){assert.ok(Array.isArray(links));for(const link of links)assert.ok(names.has(link.node));}
 }
 const notes=workflow.nodes.filter(n=>n.type.endsWith('stickyNote'));
 const overviews=notes.filter(n=>n.parameters.color===5);assert.equal(overviews.length,1);
 const words=overviews[0].parameters.content.split(/\s+/).filter(Boolean).length;assert.ok(words>=100&&words<=300,words+' overview words');
 assert.match(overviews[0].parameters.content,/How it works/);assert.match(overviews[0].parameters.content,/Setup/);
 for(const note of notes.filter(n=>n.parameters.color!==5))assert.ok(note.parameters.content.split(/\s+/).length<50);
 for(const note of notes)for(const n of workflow.nodes.filter(n=>!n.type.endsWith('stickyNote'))) {
  const [x,y]=n.position;const [sx,sy]=note.position;
  assert.ok(!(x<sx+note.parameters.width && x+180>sx && y<sy+note.parameters.height && y+100>sy),'Sticky overlaps '+n.name);
 }
});
await test('Default demo walks the actual graph without external nodes', async () => {
 let current='Try Demo';let data={};const states={};
 for(let step=0;step<40;step++) {
  const n=node(current);let output=0;
  assert.ok(!n.type.includes('googleSheets')&&!n.type.includes('googleGemini')&&!n.type.endsWith('gmail'),'External node reached: '+current);
  if(n.type.endsWith('code')){data=await run(current,data,states);states[current]=data;}
  else if(n.type.endsWith('if'))output=expr(n.parameters.conditions.conditions[0].leftValue,data,states)?0:1;
  const edges=main.connections[current]?.main[output];if(!edges?.length)break;assert.equal(edges.length,1);current=edges[0].node;
 }
 assert.equal(current,'Return Demo Preview');assert.equal(data.external_calls,false);assert.match(data.html,/Verified performance/);assert.match(data.html,/120\.00 USD/);assert.match(data.html,/Blockers/);
});
for(const [label,raw]of [['null','null'],['false','false'],['array','[]'],['extra fields','{"summary":"Stable results.","extra":"x"}'],['digits','{"summary":"We had 100 clicks."}'],['number words','{"summary":"We had twenty clicks."}'],['empty summary','{"summary":""}'],['oversized summary',JSON.stringify({summary:Array(102).fill('word').join(' ')})]]) await test('Reject AI '+label,async()=>assert.equal((await run('Validate AI Output',{text:raw})).ai_validation.valid,false));
await test('Accept fenced valid summary',async()=>assert.equal((await run('Validate AI Output',{text:'```json\n{"summary":"Performance remained stable."}\n```'})).ai_validation.valid,true));
await test('HTML escaped and internal notes excluded from AI facts', async () => {
 const input=structuredClone(dataset);input.context.completed_work=['<img src=x onerror=alert()>'];input.context.internal_notes='PRIVATE_TEST_NOTE';
 const changed=await run('Calculate KPI Changes',input);
 const facts=await run('Build Verified Facts',changed);assert.ok(!JSON.stringify(facts).includes('PRIVATE_TEST_NOTE'));
 const report=await run('Format Internal Review',{draft:{summary:'<script>alert()</script>'}},{'Normalize Dataset':input,'Build Verified Facts':facts,'Configure Report Template':{sender_name:'Example team'}});
 assert.ok(!report.email_html.includes('<script>'));assert.ok(!report.email_html.includes('<img'));assert.match(report.email_html,/&lt;script&gt;/);assert.match(report.reviewer_preview_html,/client@example.com/);assert.ok(report.reviewer_preview_html.endsWith(report.email_html));
});
await test('Impossible date rejected and previous completed week calculated', async () => {
 const states={'Configure Report Template':{run_started_at:'2026-10-08T09:00:00Z'}};
 assert.equal((await run('Calculate Reporting Period',{period_end:'2026-02-31',timezone:'UTC'},states)).period_valid,false);
 const valid=await run('Calculate Reporting Period',{timezone:'UTC'},states);assert.equal(valid.period_start,'2026-09-28');assert.equal(valid.period_end,'2026-10-04');
 assert.equal((await run('Calculate Reporting Period',{timezone:'INVALID_ZONE'},states)).period_valid,false);
});
await test('Valid dataset accepted; wrong clients and inconsistent metrics rejected', async()=>{
 assert.equal((await run('Validate Dataset',dataset)).validation.valid,true);
 const wrong=structuredClone(dataset);wrong.ads_rows.current.client_id='other';assert.equal((await run('Validate Dataset',wrong)).validation.valid,false);
 const zero=structuredClone(dataset);zero.metrics.current.clicks=0;assert.equal((await run('Validate Dataset',zero)).validation.valid,false);
 const missing=structuredClone(dataset);missing.lookup.context_found=false;assert.equal((await run('Validate Dataset',missing)).validation.valid,false);
});
await test('Demo errors avoid spreadsheet writes',()=>{
 for(const name of ['Dataset Valid?','AI Output Valid?'])assert.equal(main.connections[name].main[1][0].node,'Demo Error?');
 assert.equal(main.connections['Demo Error?'].main[0][0].node,'Return Demo Error');
});
await test('Approval decisions and timestamps are explicit',async()=>{
 const states={'Format Internal Review':{report_key:'demo',test_mode:false}};
 for(const [data,expected]of [[{data:{approved:true}},'approved'],[{data:{approved:false}},'rejected'],[{},'timeout']]){
  const result=await run('Normalize Approval Decision',data,states);assert.equal(result.approval_state,expected);assert.equal(Boolean(result.approved_at),expected==='approved');
 }
 assert.equal(node('Request Human Approval').parameters.message,'={{ $("Format Internal Review").item.json.reviewer_preview_html }}');
 assert.equal(node('Send Client Email').parameters.message,'={{ $json.email_html }}');
});
await test('Protected states skip reruns; SENDING precedes Gmail',()=>{
 const expression=node('Terminal Report?').parameters.conditions.conditions[0].leftValue;
 for(const status of ['SENT','SENDING','PENDING_APPROVAL','REJECTED','APPROVAL_TIMEOUT','APPROVED'])assert.equal(expr(expression,{existing_status:status}),true);
 assert.equal(expr(expression,{existing_status:'DATA_ERROR'}),false);
 assert.equal(main.connections['Prepare SENDING'].main[0][0].node,'Write SENDING');
 assert.equal(main.connections['Write SENDING'].main[0][0].node,'Restore Approved Report');
 assert.equal(main.connections['Restore Approved Report'].main[0][0].node,'Send Client Email');
 assert.notEqual(node('Send Client Email').retryOnFail,true);
});
await test('Uncertain Gmail response cannot produce SENT',async()=>{
 await assert.rejects(()=>run('Verify Gmail Send',{},{}),/uncertain/);
 const review={approved_at:'2026-10-08T08:00:00Z',report_key:'demo',email_subject:'Test',email_html:'<p>Test</p>'};
 const sent=await run('Verify Gmail Send',{id:'FAKE_MESSAGE'},{'Normalize Approval Decision':review});
 const log=await run('Prepare SENT',sent);assert.equal(log.status,'SENT');assert.equal(log.gmail_message_id,'FAKE_MESSAGE');assert.equal(log.approved_at,review.approved_at);
});
await test('Writes use exact report schema and RAW formatting',()=>{
 for(const n of main.nodes.filter(n=>n.type.endsWith('googleSheets')&&n.parameters.columns)){
  assert.equal(n.parameters.options.cellFormat,'RAW');assert.ok(n.parameters.columns.schema.some(c=>c.id==='gmail_message_id'));assert.ok(n.parameters.documentId.value.includes('Configure Report Template'));
 }
 assert.equal(handler.nodes.find(n=>n.name==='Append Error Log').parameters.options.cellFormat,'RAW');
 assert.equal(node('Schedule Trigger').disabled,true);
});
console.log('\n'+count+' local checks passed. No external calls made. Live import, canvas and integration acceptance remain pending.');
