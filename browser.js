if(new URLSearchParams(location.search).has('tool')){
 const script=document.createElement('script');script.src='app.js';document.body.append(script);
}else{
 document.title='Browser — Security concept';
 const css=document.createElement('link');css.rel='stylesheet';css.href='browser.css';document.head.append(css);
 const screen=document.querySelector('.screen');screen.className='screen screen-browser';
 const icon=name=>`<img src="assets/browser-${name}.png" alt="">`;
 screen.innerHTML=`<div class="browser-scroll"><div class="browser-canvas"><img class="browser-header" src="assets/browser-header.png" alt="Browser"><div class="browser-settings-background" aria-hidden="true"></div><form class="browser-search">${icon('search')}<input aria-label="Search or enter URL" placeholder="Search or enter URL" autocomplete="off"></form><main class="browser-main"><h1>Browsing activity</h1><section class="calendar"><div class="month-heading"><button data-month="-1" aria-label="Previous month">${icon('previous')}</button><h2></h2><button data-month="1" aria-label="Next month">${icon('next')}</button></div><div class="weekdays">${['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d=>`<span>${d}</span>`).join('')}</div><div class="calendar-days"></div><div class="calendar-legend"><span><i></i>Safe</span><span><i></i>Blocked</span><span class="legend-warning"><i></i>Warning</span></div><div class="period-tabs" role="tablist">${['Day','Week','Month'].map(t=>`<button role="tab" aria-selected="${t==='Month'}">${t}</button>`).join('')}</div></section><div class="activity-heading"><h2>Recent activity</h2><span>Last 30 days</span></div><section class="browser-records" aria-label="Browsing records"></section></main></div></div>${renderBottomNav(1)}`;
 const contentScroller=screen.querySelector('.browser-scroll');
 for(const selector of ['.browser-header','.browser-settings-background','.browser-search'])screen.insertBefore(screen.querySelector(selector),contentScroller);
 const fit=()=>window.fitAppViewport();addEventListener('resize',fit);fit();
 let selectedDate=new Date(2026,9,23),period='Day';
 const records=[
 ['Malware website','2026-10-23T12:11:00','Blocked','danger'],['Suspicious website','2026-10-23T09:45:00','Warning','warning'],
 ['Pop-up ad','2026-10-22T16:20:00','Blocked','danger'],['Phishing website','2026-10-22T14:18:00','Blocked','danger'],
 ['Unverified download','2026-10-21T18:32:00','Warning','warning'],['Suspicious redirect','2026-10-20T10:06:00','Blocked','danger'],
 ['Unsafe connection','2026-10-19T08:15:00','Warning','warning'],['Shopping website','2026-10-18T15:40:00','Safe','blocked'],
 ['Malicious pop-up','2026-10-17T11:23:00','Blocked','danger'],['News website','2026-10-16T09:12:00','Safe','blocked']
 ].map(([title,time,status,cls])=>({title,date:new Date(time),status,cls}));
 if(localStorage.getItem('sentry-browser-records')!=='true')records.length=0;
 function dateKey(d){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}
 function rangeFor(date,mode){
  let start=new Date(date.getFullYear(),date.getMonth(),date.getDate()),end=new Date(start);
  if(mode==='Week'){start.setDate(start.getDate()-(start.getDay()+6)%7);end=new Date(start);end.setDate(end.getDate()+7);}
  else if(mode==='Month'){start.setDate(1);end=new Date(start.getFullYear(),start.getMonth()+1,1);}
  else end.setDate(end.getDate()+1);
  return {start,end};
 }
 function moveDate(date,mode,step){
  const next=new Date(date);
  if(mode==='Month'){const day=next.getDate();next.setDate(1);next.setMonth(next.getMonth()+step);next.setDate(Math.min(day,new Date(next.getFullYear(),next.getMonth()+1,0).getDate()));}
  else next.setDate(next.getDate()+step*(mode==='Week'?7:1));
  return next;
 }
 const shortDate=d=>d.toLocaleDateString('en-US',{month:'short',day:'numeric'});
 function rangeLabel(){const {start,end}=rangeFor(selectedDate,period);const last=new Date(end);last.setDate(last.getDate()-1);return period==='Month'?start.toLocaleDateString('en-US',{month:'long',year:'numeric'}):period==='Week'?`${shortDate(start)} – ${shortDate(last)}${start.getFullYear()!==last.getFullYear()?' · '+start.getFullYear()+' / '+last.getFullYear():' · '+last.getFullYear()}`:selectedDate.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});}
 function renderRecords(){
  const {start,end}=rangeFor(selectedDate,period);
  const filtered=records.filter(r=>r.date>=start&&r.date<end).sort((a,b)=>b.date-a.date);
  screen.querySelector('.activity-heading>span').textContent=rangeLabel();
  screen.querySelector('.browser-records').innerHTML=filtered.length?filtered.map(({title,date,status,cls})=>`<article><div><h3>${title}</h3><p>${date.toLocaleDateString('en-US',{month:'short',day:'numeric'})}, ${date.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'})}</p></div><span class="record-status ${cls}">${status}</span></article>`).join(''):'<div class="browser-empty"><h3>No browsing activity</h3><p>No records for this date range.</p></div>';
 }
 function calendar(){
  const year=selectedDate.getFullYear(),month=selectedDate.getMonth();
  const {start,end}=rangeFor(selectedDate,'Month');const first=new Date(start);first.setDate(first.getDate()-(first.getDay()+6)%7);
  const entries=[];
  if(period==='Day'){
   for(let i=0;i<42;i++){const d=new Date(first);d.setDate(d.getDate()+i);entries.push({date:d,label:d.getDate(),range:rangeFor(d,'Day'),selected:dateKey(d)===dateKey(selectedDate),muted:d<start||d>=end});}
  }else if(period==='Week'){
   for(let i=0;i<6;i++){const d=new Date(first);d.setDate(d.getDate()+i*7);if(d>=end)break;const range=rangeFor(d,'Week');const choice=d<start?new Date(start):d;entries.push({date:choice,label:`Week ${i+1}`,range,selected:selectedDate>=range.start&&selectedDate<range.end});}
  }else{
   for(let i=0;i<12;i++){const d=new Date(year,i,1);entries.push({date:d,label:d.toLocaleDateString('en-US',{month:'short'}),range:rangeFor(d,'Month'),selected:i===month});}
  }
  screen.querySelector('.month-heading h2').textContent=period==='Month'?String(year):selectedDate.toLocaleDateString('en-US',{month:'long',year:'numeric'});
  screen.querySelector('.calendar').dataset.period=period.toLowerCase();
  screen.querySelector('.weekdays').hidden=period!=='Day';
  screen.querySelector('.calendar-days').innerHTML=entries.map(({date,label,range,selected,muted})=>{
   const items=records.filter(r=>r.date>=range.start&&r.date<range.end);
   let angle=0;const segments=[];
   for(const [status,color] of [['Safe','#0094ff'],['Blocked','#ff7283'],['Warning','#ffb33b']]){const count=items.filter(r=>r.status===status).length;if(count){const next=angle+count/items.length*360;segments.push(`${color} ${angle}deg ${next}deg`);angle=next;}}
   if(!items.length)segments.push('#e4f5ff 0deg 360deg');
   return `<button class="day ${muted?'muted':''} ${selected?'selected':''}" style="--record-ring:conic-gradient(${segments.join(',')})" data-date="${dateKey(date)}" aria-label="${label.toString().replace('<br>',' ')}" aria-pressed="${selected}"><span>${label}</span></button>`;
  }).join('');
  screen.querySelectorAll('[data-date]').forEach(b=>b.onclick=()=>{const [y,m,d]=b.dataset.date.split('-').map(Number);selectedDate=new Date(y,m-1,period==='Month'?Math.min(selectedDate.getDate(),new Date(y,m,0).getDate()):d);calendar();});
  screen.querySelectorAll('[data-month]').forEach(b=>b.setAttribute('aria-label',`${Number(b.dataset.month)<0?'Previous':'Next'} ${period==='Month'?'year':'month'}`));
  screen.querySelectorAll('.period-tabs button').forEach(b=>b.setAttribute('aria-selected',String(b.textContent===period)));
  renderRecords();
 }
 screen.querySelectorAll('[data-month]').forEach(b=>b.onclick=()=>{selectedDate=moveDate(selectedDate,'Month',Number(b.dataset.month)*(period==='Month'?12:1));calendar();});
 screen.querySelectorAll('.period-tabs button').forEach(b=>b.onclick=()=>{period=b.textContent;calendar();});
 document.querySelector('.browser-search').onsubmit=e=>{e.preventDefault();const value=e.target.querySelector('input').value.trim();if(!value)return;let url;try{url=new URL(/^https?:\/\//i.test(value)?value:`https://${value}`);if(!value.includes('.')||value.includes(' '))throw Error();}catch{url=new URL('https://www.google.com/search');url.searchParams.set('q',value);}window.open(url.href,'_blank','noopener,noreferrer');};
 calendar();
}
