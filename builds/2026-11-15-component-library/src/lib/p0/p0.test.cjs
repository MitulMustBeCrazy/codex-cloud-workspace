const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const Module = require("node:module");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
const ts = require("typescript");

function loadTsx(relative) {
  const sourceFile = path.resolve(__dirname, relative);
  const source = fs.readFileSync(sourceFile, "utf8");
  const compiled = ts.transpileModule(source, {
    fileName: sourceFile,
    compilerOptions: { jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
    reportDiagnostics: true
  });
  assert.equal((compiled.diagnostics || []).filter(d=>d.category===ts.DiagnosticCategory.Error).length, 0);
  const moduleForFile = new Module(sourceFile, module);
  moduleForFile.filename = sourceFile;
  moduleForFile.paths = Module._nodeModulePaths(path.dirname(sourceFile));
  moduleForFile._compile(compiled.outputText, sourceFile);
  return moduleForFile.exports;
}

test("Today task receives external data, shows open count and controls", () => {
  const { TodayTaskCard } = loadTsx("./TodayTaskCard.tsx");
  const html = renderToStaticMarkup(React.createElement(TodayTaskCard, {
    tasks: [
      {id:"one",title:"Review campaign",completed:false,priority:"high"},
      {id:"two",title:"Final notes",completed:true}
    ],
    onToggle() {}, onAssign() {}, onPromote() {},
  }));
  assert.match(html, /1 open/);
  assert.match(html, /Review campaign/);
  assert.match(html, /Promote/);
  assert.match(html, /To project/);
  assert.match(html, /high priority/);
  assert.match(html, /type="checkbox"/);
});

test("Today task covers empty and error states", () => {
  const { TodayTaskCard } = loadTsx("./TodayTaskCard.tsx");
  const empty = renderToStaticMarkup(React.createElement(TodayTaskCard, {tasks:[],onToggle(){}}));
  assert.match(empty, /Nothing on your list yet/);
  const error = renderToStaticMarkup(React.createElement(TodayTaskCard, {tasks:[],error:"No permission",onToggle(){}}));
  assert.match(error, /role="alert"/);
  assert.match(error, /No permission/);
});

test("Metric distinguishes favorable downward movement and formats numbers", () => {
  const { P0MetricCard } = loadTsx("./MetricCard.tsx");
  const html = renderToStaticMarkup(React.createElement(P0MetricCard, {
    label:"Cost per action", value:1234567, prefix:"৳", locale:"en-BD",
    trend:{value:8,direction:"down",positiveWhen:"down"}
  }));
  assert.match(html, /1,234,567/);
  assert.match(html, /pcl-metric__trend--positive/);
  assert.match(html, /Cost per action/);
});

test("Progress Meter clamps over target without invalid aria bounds", () => {
  const { P0ProgressMeter } = loadTsx("./MetricCard.tsx");
  const html = renderToStaticMarkup(React.createElement(P0ProgressMeter, {label:"Goal",value:150,max:100}));
  assert.match(html, /aria-valuenow="100"/);
  assert.match(html, /width:100%/);
  const invalid = renderToStaticMarkup(React.createElement(P0ProgressMeter, {label:"Goal",value:12,max:0}));
  assert.match(invalid, /No target/);
});
