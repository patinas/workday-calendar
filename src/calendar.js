const DAY = 86400000;
export const MIN_YEAR=1900, MAX_YEAR=2099;
export function parseDate(value) {
  if(!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error('date');
  const [y,m,d]=value.split('-').map(Number), date=new Date(Date.UTC(y,m-1,d));
  if(y<MIN_YEAR||y>MAX_YEAR||date.getUTCFullYear()!==y||date.getUTCMonth()!==m-1||date.getUTCDate()!==d) throw new Error('date');
  return date;
}
export const iso = date => date.toISOString().slice(0,10);
export const move = (date,n) => new Date(+date+n*DAY);
export function easter(year) {
  const a=year%19,b=Math.floor(year/100),c=year%100,d=Math.floor(b/4),e=b%4,f=Math.floor((b+8)/25),g=Math.floor((b-f+1)/3),h=(19*a+b-d-g+15)%30,i=Math.floor(c/4),k=c%4,l=(32+2*e+2*i-h-k)%7,m=Math.floor((a+11*h+22*l)/451),month=Math.floor((h+l-7*m+114)/31),day=(h+l-7*m+114)%31+1;
  return new Date(Date.UTC(year,month-1,day));
}
export function holidays(year) {
  const result=new Map(), add=(date,key)=>result.set(iso(date),key), E=easter(year);
  add(new Date(Date.UTC(year,0,1)),'newYear');
  for(const [offset,key] of [[-3,'maundy'],[-2,'goodFriday'],[0,'easter'],[1,'easterMonday'],[39,'ascension'],[49,'pentecost'],[50,'whitMonday']]) add(move(E,offset),key);
  if(year<2024) add(move(E,26),'prayerDay');
  add(new Date(Date.UTC(year,11,25)),'christmas'); add(new Date(Date.UTC(year,11,26)),'boxingDay');
  return result;
}
export function options({denmark=true,extra=[],weekdays=[1,2,3,4,5]}={}) {
  if(!weekdays.length||weekdays.some(x=>!Number.isInteger(x)||x<0||x>6)) throw new Error('weekdays');
  const custom=new Set(extra.map(x=>iso(parseDate(x)))); const cache=new Map();
  return date=>{
    if(!weekdays.includes(date.getUTCDay())) return 'weekend';
    if(custom.has(iso(date))) return 'custom';
    if(denmark){const y=date.getUTCFullYear();if(!cache.has(y))cache.set(y,holidays(y));if(cache.get(y).has(iso(date)))return cache.get(y).get(iso(date));}
    return null;
  };
}
export function countDays(start,end,{includeStart=true,includeEnd=true,...settings}={}) {
  const a=parseDate(start),b=parseDate(end);if(a>b)throw new Error('order');
  if((b-a)/DAY>3660) throw new Error('range');
  const excluded=options(settings), rows=[];
  for(let date=a;date<=b;date=move(date,1)){
    if((+date===+a&&!includeStart)||(+date===+b&&!includeEnd))continue;
    rows.push({date:iso(date),reason:excluded(date)});
  }
  return {total:rows.length,working:rows.filter(x=>!x.reason).length,excluded:rows.filter(x=>x.reason).length,rows};
}
export function addDays(start,amount,settings={}) {
  let date=parseDate(start);if(!Number.isInteger(amount)||Math.abs(amount)>2600)throw new Error('amount');
  const excluded=options(settings), step=Math.sign(amount);let remaining=Math.abs(amount),iterations=0;
  while(remaining){date=move(date,step);if(date.getUTCFullYear()<MIN_YEAR||date.getUTCFullYear()>MAX_YEAR||++iterations>3660)throw new Error('range');if(!excluded(date))remaining--;}
  return iso(date);
}
export function csv(rows,labels={date:'Date',status:'Status',working:'Working'}){return '\uFEFF'+labels.date+','+labels.status+'\r\n'+rows.filter(r=>!r.reason).map(r=>r.date+','+labels.working).join('\r\n');}
export function ics(rows,summary='Working day') {
  const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Workday calendar//EN','CALSCALE:GREGORIAN'];
  const clean=summary.replace(/\\/g,'\\\\').replace(/\r?\n/g,'\\n').replace(/,/g,'\\,').replace(/;/g,'\\;');
  for(const row of rows.filter(r=>!r.reason)) {
    const next=iso(move(parseDate(row.date),1));
    lines.push('BEGIN:VEVENT',`UID:${row.date}-workday@workday-calendar.local`,`DTSTAMP:${new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'')}`,`DTSTART;VALUE=DATE:${row.date.replaceAll('-','')}`,`DTEND;VALUE=DATE:${next.replaceAll('-','')}`,`SUMMARY:${clean}`,'END:VEVENT');
  }
  return [...lines,'END:VCALENDAR',''].join('\r\n');
}
