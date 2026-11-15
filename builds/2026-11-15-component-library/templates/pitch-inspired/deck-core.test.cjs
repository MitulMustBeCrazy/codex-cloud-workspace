const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const script = fs.readFileSync(path.join(__dirname, "deck-core.js"), "utf8");
const files = ["editorial.html", "board-report.html", "kpi-report.html"];

for (const file of files) {
  test(file + " has 5 original slide examples and shared controls", () => {
    const src = fs.readFileSync(path.join(__dirname, file), "utf8");
    assert.equal((src.match(/<section data-slide /g)||[]).length, 5);
    assert.match(src, /deck-core\.js/);
    assert.match(src, /data-reveal/);
    assert.match(src, /data-auto/);
    assert.ok(src.includes("</html>"));
  });
}

function classList() {
  const set = new Set();
  return {
    add(k){set.add(k)}, contains(k){return set.has(k)},
    toggle(k,on){on?set.add(k):set.delete(k)}
  };
}
function element({count=0,title=""}={}) {
  const r = {classList:classList(),dataset:{title},attrs:{},style:{},disabled:false,textContent:"",
    setAttribute(k,v){this.attrs[k]=v},
    addEventListener(k,fn){this.events??={};this.events[k]=fn}};
  r.nodes=Array.from({length:count},()=>element());
  r.querySelectorAll=()=>r.nodes;
  return r;
}

test("Reveal engine supports navigation, keyboard, pause and initial rendering", () => {
  const slides=[element({count:3,title:"First"}),element({count:2,title:"Second"})];
  const deck=element();deck.dataset.pace="1600";deck.querySelectorAll=()=>slides;
  const controls={};["[data-prev]","[data-next]","[data-auto]","[data-count]","[data-progress]"].forEach(k=>controls[k]=element());
  const events={};const document={
    title:"",activeElement:{tagName:"BODY"},
    querySelector(k){return k==="[data-deck]"?deck:controls[k]},
    addEventListener(k,fn){events[k]=fn}
  };
  const window={
    matchMedia(){return {matches:false}},
    setInterval(fn,ms){this.tick=fn;this.delay=ms;return 17},
    clearInterval(){this.tick=null}
  };
  vm.runInNewContext(script,{window,document});
  assert.equal(slides[0].attrs["aria-hidden"],"false");
  assert.equal(slides[0].nodes[0].classList.contains("is-visible"),true);
  assert.equal(deck.classList.contains("is-enhanced"),true);
  controls["[data-next]"].events.click();
  assert.equal(slides[0].nodes[1].classList.contains("is-visible"),true);
  controls["[data-next]"].events.click();
  controls["[data-next]"].events.click();
  assert.equal(slides[1].classList.contains("is-current"),true);
  events.keydown({key:"Home",preventDefault(){}});
  assert.equal(slides[0].nodes.every(n=>!n.classList.contains("is-visible")),true);
  controls["[data-auto]"].events.click();
  assert.equal(window.delay,1600);
  events.keydown({key:"Escape",preventDefault(){}});
  assert.equal(window.tick,null);
});
