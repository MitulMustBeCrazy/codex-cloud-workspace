const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),Module=require("node:module");
const React=require("react"),{renderToStaticMarkup}=require("react-dom/server"),ts=require("typescript");
function jsx(file){
 const full=path.resolve(__dirname,file);
 const output=ts.transpileModule(fs.readFileSync(full,"utf8"),{fileName:full,compilerOptions:{jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}});
 const m=new Module(full,module);m.filename=full;m.paths=Module._nodeModulePaths(path.dirname(full));m._compile(output.outputText,full);return m.exports;
}
test("calendar renders five views and event labels",()=>{
 const {CalendarPanel}=jsx("./BrandailyWorkbench.tsx");
 for(const view of ["Year","Quarter","Month","Week","Day"]){
  const html=renderToStaticMarkup(React.createElement(CalendarPanel,{view,date:"2026-11-15",events:[{id:"a",title:"Launch planning",date:"2026-11-15"}]}));
  assert.match(html,/Launch planning|1 event/);
  assert.match(html,/aria-label="Calendar/);
 }
});
test("communications module has a separate selectable thread view",()=>{
 const {CommunicationPanel}=jsx("./BrandailyWorkbench.tsx");
 const html=renderToStaticMarkup(React.createElement(CommunicationPanel,{threads:[{id:"c",name:"Creative",unread:2,preview:"Review notes"}],selectedId:"c",onSelect:()=>{}}));
 assert.match(html,/Creative/);assert.match(html,/Review notes/);assert.match(html,/2 unread/);
});
test("approval panel shows blockers and actionable approvals",()=>{
 const {CampaignApprovalPanel}=jsx("./BrandailyWorkbench.tsx");
 const html=renderToStaticMarkup(React.createElement(CampaignApprovalPanel,{campaigns:[{id:"a",title:"Launch",stage:"Review",blocked:false},{id:"b",title:"Risk",stage:"Draft",blocked:true}],onApprove:()=>{}}));
 assert.match(html,/Launch/);assert.match(html,/Blocked/);assert.match(html,/Approve/);
});
test("data explorer table supports accessible headers",()=>{
 const {DataExplorer}=jsx("./BrandailyWorkbench.tsx");
 const html=renderToStaticMarkup(React.createElement(DataExplorer,{rows:[{channel:"Search",reach:100,conversions:4}],columns:[{key:"channel",label:"Channel"},{key:"reach",label:"Reach"}]}));
 assert.match(html,/<table/);assert.match(html,/<th/);assert.match(html,/Search/);
});
