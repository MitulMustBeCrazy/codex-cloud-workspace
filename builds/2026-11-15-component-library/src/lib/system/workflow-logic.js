/** Pure, framework-free component logic, suitable for any Brandaily adapter or HTML deck. */

const toDate = (value) => {
  const s = typeof value === "string" ? value.slice(0,10) : null;
  if (!s || !/^\d{4}-\d{2}-\d{2}$/.test(s)) throw new TypeError("Expected ISO YYYY-MM-DD date");
  const [y,m,d]=s.split("-").map(Number);
  const date=new Date(Date.UTC(y,m-1,d,12));
  if (date.getUTCFullYear()!==y || date.getUTCMonth()!==m-1 || date.getUTCDate()!==d) throw new RangeError("Invalid date");
  return date;
};
const iso = (d)=>d.toISOString().slice(0,10);
const addDays = (d,n)=>new Date(d.getTime()+n*86400000);
const cell=(d,withinPeriod=true)=>({date:iso(d),day:d.getUTCDate(),withinPeriod});
const monday=(d)=>addDays(d,-((d.getUTCDay()+6)%7));
export function calendarDay(value){return [cell(toDate(value))];}
export function calendarWeek(value){const start=monday(toDate(value));return Array.from({length:7},(_,i)=>cell(addDays(start,i)));}
export function calendarMonth(value){
  const ref=toDate(value),start=monday(new Date(Date.UTC(ref.getUTCFullYear(),ref.getUTCMonth(),1,12)));
  return Array.from({length:42},(_,i)=>{const d=addDays(start,i);return cell(d,d.getUTCMonth()===ref.getUTCMonth());});
}
export function calendarQuarter(value){
  const ref=toDate(value),start=Math.floor(ref.getUTCMonth()/3)*3;
  return Array.from({length:3},(_,i)=>({month:start+i+1,year:ref.getUTCFullYear(),date:iso(new Date(Date.UTC(ref.getUTCFullYear(),start+i,1,12)))}));
}
export function calendarYear(value){
  const year=toDate(value).getUTCFullYear();
  return Array.from({length:12},(_,i)=>({month:i+1,year,date:iso(new Date(Date.UTC(year,i,1,12)))}));
}
export function shiftCalendar(value,period,direction){
  const date=toDate(value),day=date.getUTCDate(),delta=direction>=0?1:-1;
  if(period==="Day")return iso(addDays(date,delta));
  if(period==="Week")return iso(addDays(date,delta*7));
  let months=period==="Month"?1:period==="Quarter"?3:12;
  const moved=new Date(Date.UTC(date.getUTCFullYear(),date.getUTCMonth()+months*delta,1,12));
  const last=new Date(Date.UTC(moved.getUTCFullYear(),moved.getUTCMonth()+1,0,12)).getUTCDate();
  moved.setUTCDate(Math.min(day,last));
  return iso(moved);
}
/** query range at the insertion cursor, not a hardcoded offset */
export function findMentionQuery(text,cursor){
  if(typeof text!=="string"||!Number.isInteger(cursor)||cursor<0||cursor>text.length)return null;
  const before=text.slice(0,cursor);
  const match=before.match(/(?:^|\s)([@#$])([\p{L}\p{N}_-]*)$/u);
  if(!match)return null;
  const start=cursor-match[1].length-match[2].length;
  return {prefix:match[1],query:match[2],start,end:cursor};
}
export function insertMention(text,range,entity){
  if(!range||!entity||!entity.id||!entity.label)throw new Error("Valid mention range and entity required");
  const display=range.prefix+entity.label;
  const next=text.slice(0,range.start)+display+text.slice(range.end);
  return {text:next,cursor:range.start+display.length,reference:{id:entity.id,type:entity.type,label:entity.label,start:range.start,end:range.start+display.length,display}};
}
export function filterAndSort(rows,{query="",filters={},sort}={}){
  const q=String(query).trim().toLocaleLowerCase();
  const result=rows.filter(row=>{
    if(Object.entries(filters).some(([key,value])=>value!=="" && value!=null && String(row[key])!==String(value)))return false;
    return !q||Object.values(row).some(value=>value!=null&&String(value).toLocaleLowerCase().includes(q));
  });
  if(!sort||!sort.key)return result;
  const sign=sort.direction==="desc"?-1:1;
  return result.sort((a,b)=>{
    const x=a[sort.key],y=b[sort.key];
    if(x==null)return y==null?0:1;
    if(y==null)return -1;
    const cmp=typeof x==="number"&&typeof y==="number"?x-y:String(x).localeCompare(String(y),undefined,{numeric:true,sensitivity:"base"});
    return sign*cmp;
  });
}
export function summarizeCampaigns(campaigns){
  const summary={total:campaigns.length,blocked:0,pendingApprovals:0,published:0};
  for(const c of campaigns){
    if(c.blocked)summary.blocked++;
    if(!c.blocked&&["Review","Approval","Awaiting Approval"].includes(c.stage))summary.pendingApprovals++;
    if(["Published","Live","Complete"].includes(c.stage))summary.published++;
  }
  return summary;
}
export function normalizeSeries(values){
  const valid=values.filter(x=>typeof x==="number"&&Number.isFinite(x));
  if(!valid.length)return values.map(()=>null);
  const min=Math.min(...valid),max=Math.max(...valid);
  return values.map(x=>typeof x==="number"&&Number.isFinite(x)?max===min?0.5:(x-min)/(max-min):null);
}
export function interpolateSeries(values,progress){
  const pct=Math.min(1,Math.max(0,Number(progress)||0));
  return values.map(v=>typeof v==="number"&&Number.isFinite(v)?v*pct:null);
}

/** Preserve structured mention identity across edits outside the mention span. */
export function reconcileMentionReferences(before,after,references=[]){
  let common=0;
  while(common<Math.min(before.length,after.length)&&before[common]===after[common])common++;
  let suffix=0;
  while(suffix<before.length-common&&suffix<after.length-common&&
    before[before.length-1-suffix]===after[after.length-1-suffix])suffix++;
  const removedEnd=before.length-suffix;
  const insertedEnd=after.length-suffix;
  const delta=insertedEnd-removedEnd;
  return references.flatMap(ref=>{
    if(ref.end<=common){return after.slice(ref.start,ref.end)===ref.display?[ref]:[]}
    if(ref.start>=removedEnd){
      const shifted={...ref,start:ref.start+delta,end:ref.end+delta};
      return after.slice(shifted.start,shifted.end)===shifted.display?[shifted]:[];
    }
    return [];
  });
}
