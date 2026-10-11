import {copy} from './i18n.js';
import {countDays,addDays,iso,parseDate,move,csv,ics} from './calendar.js';
const lang=document.documentElement.lang, t=copy[lang], $=id=>document.getElementById(id);
let mode='count', result=null;
const today=new Date(), localToday=[today.getFullYear(),String(today.getMonth()+1).padStart(2,'0'),String(today.getDate()).padStart(2,'0')].join('-');
$('start').value=localToday;$('end').value=iso(move(parseDate(localToday),30));
function settings(){
  const extra=$('extra').value.split(/[\n,]/).map(x=>x.trim()).filter(Boolean);
  const start=parseDate($('start').value),end=mode==='count'?parseDate($('end').value):move(start,Math.sign(Number($('amount').value))*3660);
  const min=Math.min(start.getUTCFullYear(),end.getUTCFullYear()),max=Math.max(start.getUTCFullYear(),end.getUTCFullYear());
  for(const box of document.querySelectorAll('[data-extra]:checked'))for(let y=min;y<=max;y++)extra.push(`${y}-${box.dataset.extra}`);
  return {denmark:$('denmark').checked,extra,weekdays:[...document.querySelectorAll('[data-weekday]:checked')].map(x=>Number(x.dataset.weekday)),includeStart:$('include-start').checked,includeEnd:$('include-end').checked};
}
function format(date){return new Intl.DateTimeFormat(lang==='da'?'da-DK':'en-GB',{weekday:'long',day:'numeric',month:'long',year:'numeric',timeZone:'UTC'}).format(parseDate(date));}
function clearResult(){result=null;$('error').hidden=true;$('result-content').hidden=true;$('result-empty').hidden=false;$('result-actions').hidden=true;$('excluded-details').hidden=true;$('status').textContent='';}
for(const button of document.querySelectorAll('[data-mode]'))button.addEventListener('click',()=>{
 mode=button.dataset.mode;for(const b of document.querySelectorAll('[data-mode]'))b.setAttribute('aria-selected',String(b===button));
 $('end-field').hidden=mode!=='count';$('amount-field').hidden=mode!=='add';$('endpoints').hidden=mode!=='count';$('amount-help').hidden=mode!=='add';clearResult();
});
$('calculator').addEventListener('input',clearResult);
$('calculator').addEventListener('submit',event=>{
 event.preventDefault();clearResult();
 try{
  const s=settings(),start=$('start').value;
  if(mode==='count')result={...countDays(start,$('end').value,s),start,end:$('end').value,mode};
  else{
    const amount=Number($('amount').value);if(!$('amount').value.trim())throw new Error('amount');
    const end=addDays(start,amount,s);result={start,end,amount,mode,rows:[],working:Math.abs(amount)};
  }
  $('result-empty').hidden=true;$('result-content').hidden=false;$('result-title').textContent=mode==='count'?t.result:t.resultDate;
  $('main-result').className=mode==='count'?'number':'date-result';$('main-result').textContent=mode==='count'?new Intl.NumberFormat(lang).format(result.working):format(result.end);
  $('main-label').textContent=mode==='count'?t.working:t.amountHelp;
  $('metrics').hidden=mode!=='count';$('total-result').textContent=result.total??'';$('excluded-result').textContent=result.excluded??'';
  $('export-actions').hidden=mode!=='count';$('export-help').hidden=mode!=='count';$('result-actions').hidden=false;
  const excluded=result.rows.filter(r=>r.reason);$('excluded-details').hidden=mode!=='count';const body=$('excluded-body');body.replaceChildren();
  for(const row of excluded){const tr=document.createElement('tr');for(const text of [row.date,t.holidays[row.reason]]){const td=document.createElement('td');td.textContent=text;tr.append(td);}body.append(tr);}
  $('no-excluded').hidden=excluded.length>0;$('excluded-table').hidden=!excluded.length;
 }catch(error){$('error').textContent=t.errors[error.message]??t.errors.date;$('error').hidden=false;$('error').focus();}
});
function download(data,type,name){const a=document.createElement('a'),url=URL.createObjectURL(new Blob([data],{type}));a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
$('csv').addEventListener('click',()=>{if(result)download(csv(result.rows,lang==='da'?{date:'Dato',status:'Status',working:'Arbejdsdag'}:undefined),'text/csv;charset=utf-8','working-days.csv');});
$('ics').addEventListener('click',()=>{if(result)download(ics(result.rows,t.working),'text/calendar;charset=utf-8','working-days.ics');});
$('copy').addEventListener('click',async()=>{if(!result)return;const text=mode==='count'?`${result.start} → ${result.end}: ${result.working} ${t.working.toLowerCase()}`:format(result.end);try{await navigator.clipboard.writeText(text);$('status').textContent=t.copied;}catch{$('status').textContent=text;}});
$('language').addEventListener('change',()=>{
 const target=$('language').value, state={start:$('start').value,end:$('end').value,amount:$('amount').value,mode,denmark:$('denmark').checked,includeStart:$('include-start').checked,includeEnd:$('include-end').checked,extra:$('extra').value,weekdays:[...document.querySelectorAll('[data-weekday]:checked')].map(x=>Number(x.dataset.weekday)),optional:[...document.querySelectorAll('[data-extra]:checked')].map(x=>x.dataset.extra)};
 try{sessionStorage.setItem('workday-state',JSON.stringify(state));}catch{}
 location.href=`/${target}/`;
});
try{
 const state=JSON.parse(sessionStorage.getItem('workday-state')||'null');
 if(state){for(const field of ['start','end','amount','extra'])if(state[field]!==undefined)$(field).value=state[field];for(const [field,key] of [['denmark','denmark'],['include-start','includeStart'],['include-end','includeEnd']])$(field).checked=state[key];for(const e of document.querySelectorAll('[data-weekday]'))e.checked=state.weekdays.includes(Number(e.dataset.weekday));for(const e of document.querySelectorAll('[data-extra]'))e.checked=state.optional.includes(e.dataset.extra);if(state.mode==='add')document.querySelector('[data-mode=add]').click();}
}catch{}
