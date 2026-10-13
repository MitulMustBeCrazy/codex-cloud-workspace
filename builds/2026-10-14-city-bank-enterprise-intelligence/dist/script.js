const slides = [...document.querySelectorAll('.slide')];
const count = document.getElementById('slide-count');
const title = document.getElementById('current-title');
const progress = document.getElementById('progress-fill');
const prev = document.getElementById('prev-button');
const next = document.getElementById('next-button');
const overview = document.getElementById('overview');
const overviewGrid = document.getElementById('overview-grid');
let current = 0;

function goTo(index, updateHash = true) {
  current = Math.max(0, Math.min(slides.length - 1, index));
  slides.forEach((slide, i) => {
    slide.classList.toggle('active', i === current);
    slide.setAttribute('aria-hidden', i === current ? 'false' : 'true');
    if (i === current) slide.scrollTop = 0;
  });
  count.textContent = `${String(current + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
  title.textContent = slides[current].dataset.title;
  progress.style.width = `${((current + 1) / slides.length) * 100}%`;
  prev.disabled = current === 0;
  next.disabled = current === slides.length - 1;
  document.querySelectorAll('.overview-card').forEach((card, i) => card.classList.toggle('current', i === current));
  if (updateHash) history.replaceState(null, '', `#slide-${current + 1}`);
  document.title = `${slides[current].dataset.title} | City Bank Enterprise Intelligence`;
}
prev.addEventListener('click', () => goTo(current - 1));
next.addEventListener('click', () => goTo(current + 1));
slides.forEach((slide, i) => {
  const card = document.createElement('button');
  card.type = 'button';
  card.className = 'overview-card';
  card.innerHTML = `<span>${String(i + 1).padStart(2, '0')} / 09</span><strong>${slide.dataset.title}</strong>`;
  card.addEventListener('click', () => { goTo(i); toggleOverview(false); });
  overviewGrid.append(card);
});
function toggleOverview(show) {
  overview.hidden = !show;
  document.body.style.overflow = show ? 'hidden' : '';
  if (show) document.getElementById('overview-close').focus();
}
document.getElementById('overview-toggle').addEventListener('click', () => toggleOverview(true));
document.getElementById('overview-close').addEventListener('click', () => toggleOverview(false));
document.getElementById('fullscreen-toggle').addEventListener('click', () => {
  if (document.fullscreenElement) document.exitFullscreen();
  else document.documentElement.requestFullscreen?.();
});
document.addEventListener('keydown', event => {
  const tag = document.activeElement?.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA') return;
  if (event.key === 'Escape') { toggleOverview(!overview.hidden ? false : true); return; }
  if (!overview.hidden) return;
  if (event.key === 'ArrowRight' || event.key === 'PageDown' || event.key === ' ') { event.preventDefault(); goTo(current + 1); }
  if (event.key === 'ArrowLeft' || event.key === 'PageUp') { event.preventDefault(); goTo(current - 1); }
  if (event.key === 'Home') { event.preventDefault(); goTo(0); }
  if (event.key === 'End') { event.preventDefault(); goTo(slides.length - 1); }
  if (event.key.toLowerCase() === 'f') document.getElementById('fullscreen-toggle').click();
});
let touchStart = null;
document.getElementById('slides').addEventListener('touchstart', event => { touchStart = {x:event.touches[0].clientX,y:event.touches[0].clientY}; }, {passive:true});
document.getElementById('slides').addEventListener('touchend', event => {
  if (!touchStart) return;
  const dx = event.changedTouches[0].clientX - touchStart.x;
  const dy = event.changedTouches[0].clientY - touchStart.y;
  if (Math.abs(dx) > 80 && Math.abs(dx) > Math.abs(dy) * 1.7) goTo(current + (dx < 0 ? 1 : -1));
  touchStart = null;
}, {passive:true});
window.addEventListener('hashchange', () => {
  const match = location.hash.match(/^#slide-(\d+)$/);
  if (match) goTo(Number(match[1]) - 1, false);
});
const initial = location.hash.match(/^#slide-(\d+)$/);
goTo(initial ? Number(initial[1]) - 1 : 0, false);

// Three illustrative discovery stories.
document.querySelectorAll('.story-tab').forEach(tab => tab.addEventListener('click', () => {
  document.querySelectorAll('.story-tab').forEach(item => {
    const selected = item === tab;
    item.classList.toggle('active', selected);
    item.setAttribute('aria-selected', selected ? 'true' : 'false');
  });
  document.querySelectorAll('.story-panel').forEach(panel => {
    const selected = panel.id === `panel-${tab.dataset.story}`;
    panel.classList.toggle('active', selected);
    panel.hidden = !selected;
  });
}));

// Decision stages.
const flowDetails = [
  ['01 / CONNECT EVIDENCE', 'Bring together approved information with source and ownership visible.', 'Example: a travel journey, card eligibility and a partner service.'],
  ['02 / FIND POSSIBILITIES', 'Suggest connections with a clear explanation of why they may matter.', 'An AI finding is a hypothesis, not a project decision.'],
  ['03 / VALIDATE WITH OWNERS', 'Review evidence, feasibility, dependencies and economics with accountable owners.', 'Weak ideas can be corrected or dismissed here.'],
  ['04 / DECIDE & LEARN', 'Pilot, hand over or stop—and record the reason for future decisions.', 'The outcome improves institutional knowledge.']
];
document.querySelectorAll('.flow-stage').forEach(button => button.addEventListener('click', () => {
  document.querySelectorAll('.flow-stage').forEach(item => item.classList.toggle('active', item === button));
  const [label, main, tail] = flowDetails[Number(button.dataset.flow)];
  document.getElementById('flow-detail').innerHTML = `<span class="detail-label">${label}</span><strong>${main}</strong><span class="detail-tail">${tail}</span>`;
}));

// Concept management dashboard.
const dashboard = {
  travel: {
    title: 'Travel benefit assistance', subtitle: 'Make an eligible airport benefit simple to use.',
    evidence: 'Card eligibility · travel moment · partner service', dependencies: 'Eligibility rules, consent, partner booking',
    owner: 'Cards & digital journey owners (proposed)', action: 'Confirm rules, sources and customer moment',
    status: 'REVIEW REQUIRED'
  },
  merchant: {
    title: 'Merchant growth signal', subtitle: 'Find a timely merchant conversation.',
    evidence: 'Acceptance · settlement insight · assessment', dependencies: 'Approved use of merchant data and policy',
    owner: 'SME & merchant business owners (proposed)', action: 'Validate relevance and assessment pathway',
    status: 'EXPLORE'
  },
  reuse: {
    title: 'Verification reuse', subtitle: 'Explore a shared component across Retail and SME.',
    evidence: 'Retail flow · verification component · SME flow', dependencies: 'Journey needs, control requirements, APIs',
    owner: 'Retail, SME & technology owners (proposed)', action: 'Compare needs and component fit',
    status: 'EXPLORE'
  }
};
function showDashboard(key) {
  const item = dashboard[key];
  document.querySelectorAll('.dash-item').forEach(button => button.classList.toggle('active', button.dataset.dash === key));
  document.getElementById('dash-detail').innerHTML = `
    <div class="dash-detail-top"><span>OPPORTUNITY DETAIL</span><span>${item.status}</span></div>
    <h3>${item.title}</h3><p>${item.subtitle}</p>
    <div class="dash-evidence">
      <div class="dash-field"><small>SUPPORTING EVIDENCE</small><strong>${item.evidence}</strong></div>
      <div class="dash-field"><small>KEY DEPENDENCIES</small><strong>${item.dependencies}</strong></div>
      <div class="dash-field"><small>PROPOSED REVIEWING OWNER</small><strong>${item.owner}</strong></div>
      <div class="dash-field"><small>CURRENT STATE</small><strong>Illustrative hypothesis</strong></div>
    </div>
    <div class="dash-next"><span>NEXT ACTION</span>${item.action}</div>`;
}
document.querySelectorAll('.dash-item').forEach(button => button.addEventListener('click', () => showDashboard(button.dataset.dash)));
showDashboard('travel');

// Interactive, illustrative network model. Lines marked proposed are hypotheses.
const networkNodes = [
  {id:'journey',x:448,y:253,r:59,label:['Travel','journey'],type:'central',category:'CUSTOMER JOURNEY',body:'The customer moment at the centre of the illustrative model. Connected information helps identify a useful next step.'},
  {id:'card',x:245,y:120,r:49,label:['Card','eligibility'],type:'capability',category:'CAPABILITY',body:'A card rule could determine whether a customer is eligible for a travel benefit.'},
  {id:'citytouch',x:630,y:105,r:47,label:['Citytouch','touchpoint'],type:'initiative',category:'INITIATIVE / CHANNEL',body:'A digital touchpoint could present timely information in the journey.'},
  {id:'partner',x:727,y:278,r:48,label:['Partner','booking'],type:'capability',category:'SERVICE / PARTNER',body:'A partner service could make the eligible benefit easy to confirm.'},
  {id:'insight',x:578,y:411,r:47,label:['Customer','insight'],type:'evidence',category:'EVIDENCE SOURCE',body:'Approved customer context could establish whether this is a relevant moment.'},
  {id:'service',x:245,y:405,r:49,label:['Service','orchestration'],type:'capability',category:'CAPABILITY',body:'A service layer could connect the next action across touchpoints.'},
  {id:'strategy',x:105,y:270,r:48,label:['Deeper','engagement'],type:'strategy',category:'STRATEGIC OBJECTIVE',body:'The opportunity should be assessed against an agreed business objective.'},
  {id:'benefit',x:443,y:65,r:47,label:['Airport','benefit'],type:'opportunity',category:'PROPOSED OPPORTUNITY',body:'A possible benefit assistance journey to validate with business and source owners.'}
];
const networkEdges = [
  {a:'journey',b:'card',proposed:false,verb:'Eligibility can inform the travel journey.',evidence:'Illustrative relationship: card rules mapped to a customer journey.'},
  {a:'journey',b:'citytouch',proposed:false,verb:'Citytouch is a possible customer touchpoint.',evidence:'Illustrative relationship: digital channel mapped to the journey.'},
  {a:'journey',b:'partner',proposed:true,verb:'Partner booking may complete the next step.',evidence:'Would require partner and process validation.'},
  {a:'journey',b:'insight',proposed:false,verb:'Customer insight gives the journey context.',evidence:'Illustrative relationship: approved insight mapped to a journey.'},
  {a:'journey',b:'service',proposed:false,verb:'Service orchestration may support the journey.',evidence:'Illustrative capability mapping for owner review.'},
  {a:'journey',b:'strategy',proposed:false,verb:'The journey can be tested against engagement goals.',evidence:'Illustrative strategic alignment.'},
  {a:'journey',b:'benefit',proposed:true,verb:'A travel journey may reveal an airport benefit opportunity.',evidence:'Hypothesis: validate eligibility, timing and experience.'},
  {a:'card',b:'benefit',proposed:true,verb:'Card eligibility could qualify the proposed benefit.',evidence:'Requires rule and source-owner validation.'},
  {a:'partner',b:'benefit',proposed:true,verb:'A partner service could fulfill the proposed benefit.',evidence:'Requires partner availability and feasibility review.'}
];
const svg = document.getElementById('network-svg');
const inspector = document.getElementById('network-inspector');
const ns = 'http://www.w3.org/2000/svg';
const nodeById = Object.fromEntries(networkNodes.map(node => [node.id,node]));
const edgeEls = [];
const nodeEls = [];
function svgEl(tag, attrs = {}) { const el = document.createElementNS(ns,tag); Object.entries(attrs).forEach(([k,v]) => el.setAttribute(k,v)); return el; }
function inspectNode(node) {
  nodeEls.forEach(({el,node:n}) => {
    el.classList.toggle('selected',n.id===node.id);
    el.classList.toggle('dimmed',n.id!==node.id && !networkEdges.some(edge => (edge.a===node.id&&edge.b===n.id)||(edge.b===node.id&&edge.a===n.id)));
  });
  edgeEls.forEach(({el,edge}) => {el.classList.toggle('dimmed',edge.a!==node.id&&edge.b!==node.id);el.classList.remove('selected');});
  const neighbours = networkEdges.filter(edge => edge.a===node.id||edge.b===node.id).length;
  inspector.innerHTML = `<span class="inspector-kicker">${node.category} / ILLUSTRATIVE</span><div class="inspector-icon">◎</div><h3>${node.label.join(' ')}</h3><p>${node.body}</p><div class="inspector-footer"><span>${neighbours} visible connections</span><span>Owner review needed</span></div>`;
}
function inspectEdge(edge, selected) {
  nodeEls.forEach(({el,node}) => {el.classList.toggle('selected',node.id===edge.a||node.id===edge.b);el.classList.toggle('dimmed',node.id!==edge.a&&node.id!==edge.b);});
  edgeEls.forEach(({el}) => {el.classList.toggle('selected',el===selected);el.classList.toggle('dimmed',el!==selected);});
  inspector.innerHTML = `<span class="inspector-kicker">${edge.proposed?'PROPOSED CONNECTION':'RECORDED IN ILLUSTRATIVE MODEL'}</span><div class="inspector-icon">↗</div><h3>${nodeById[edge.a].label.join(' ')} + ${nodeById[edge.b].label.join(' ')}</h3><p>${edge.verb}</p><div class="inspector-footer"><span>${edge.evidence}</span></div>`;
}
networkEdges.forEach(edge => {
  const a=nodeById[edge.a],b=nodeById[edge.b];
  const line=svgEl('line',{x1:a.x,y1:a.y,x2:b.x,y2:b.y,class:`edge ${edge.proposed?'proposed':''}`});
  const hit=svgEl('line',{x1:a.x,y1:a.y,x2:b.x,y2:b.y,class:'edge-hit',tabindex:'0',role:'button','aria-label':`${a.label.join(' ')} to ${b.label.join(' ')}. ${edge.proposed?'Proposed':'Recorded in illustrative model'} connection.`});
  const select=()=>inspectEdge(edge,line);
  hit.addEventListener('click',select);
  hit.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();select();}});
  svg.append(line,hit);
  edgeEls.push({el:line,edge});
});
networkNodes.forEach(node => {
  const group=svgEl('g',{class:`node-group ${node.type==='central'?'central':`type-${node.type}`}`,tabindex:'0',role:'button','aria-label':`${node.category}: ${node.label.join(' ')}`});
  group.append(svgEl('circle',{cx:node.x,cy:node.y,r:node.r}));
  node.label.forEach((part,i)=>{
    const text=svgEl('text',{x:node.x,y:node.y+(i-(node.label.length-1)/2)*17+4,'text-anchor':'middle',class:'node-label'});
    text.textContent=part;group.append(text);
  });
  const select=()=>inspectNode(node);
  group.addEventListener('click',select);
  group.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();select();}});
  svg.append(group);nodeEls.push({el:group,node});
});
