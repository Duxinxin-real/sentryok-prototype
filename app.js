const page=document.body.dataset.page||'home';
const names=['Sentry','Browser','Vault','You'];
const pages=['home','check','vault','you'];
const stage=document.querySelector('.screen');
const asset=(name,p=page)=>`assets/${p}-${name}.png`;
const img=(name,cls='',p=page)=>`<img class="${cls}" src="${asset(name,p)}" alt="" draggable="false">`;
const arrow=()=>img('arrow','chevron','home');
function card(label,icon,x,y,w,h,href,extra='') {return `<a class="card ${extra}" href="${href}" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px">${img(icon,'icon','home')}<span class="label">${label}</span>${arrow()}</a>`}
// Store only prototype status keys, never message, email or image contents.
function readOverview(){try{return JSON.parse(localStorage.getItem('sentryok-demo-overview')||'{}')}catch{return {}}}
function overviewPanel(){const state=readOverview();if(!Object.keys(state).length)return '';return `<section class="overview-results" aria-label="Safety overview"><div class="overview-heading">Safety overview</div>${[['data','Data breaches','No breaches found'],['message','Messages','No risks found'],['dns','Browsing','DNS check complete'],['image','Scams & deepfakes','No risks found']].map(([key,label,result])=>`<div class="overview-result"><span>${label}</span><strong>${state[key]?result:(key==='dns'?'Protection off':'Not checked')}</strong></div>`).join('')}</section>`;}
function previewResult(key){const state=readOverview();state[key]=true;try{localStorage.setItem('sentryok-demo-overview',JSON.stringify(state))}catch{}const results={data:['No breaches found','Your email was not found in known data breaches.'],message:['No risks found','No suspicious content found in this message.'],dns:['DNS check complete','No suspicious DNS settings found.'],image:['No risks found','No signs of scams or deepfakes found in this image.']};const [title,description]=results[key];dialog(title,`<p>${description}</p><a class="result-home" href="index.html">View overview</a>`);}
function home(){return `${overviewPanel()}<a href="#" class="primary">Open Protection</a><h2 class="section-title home-protection-title">Protection</h2>${[['Ad & pop-up blocking','lock'],['Anti-phishing','browse'],['Redirect blocking','message'],['Data leak alert','data'],['Malware blocking','lock']].map(([label,icon],i)=>`<article class="card protection-item" style="left:${i%2?435:34}px;top:${1023+Math.floor(i/2)*194}px;width:383px;height:171px">${img(icon,'icon','home')}<div class="protection-name"><span>${label}</span><small>Off</small></div></article>`).join('')}`}

function check(){return `<h1 class="section-title check-title">${img('message')}<span>AI message check</span></h1><div class="mode-tabs" role="tablist" aria-label="Check type"><button role="tab" class="selected" id="message-tab" aria-selected="true" data-mode="message">${img('message-tab')}Message</button><button role="tab" id="image-tab" aria-selected="false" data-mode="image">${img('image')}Image</button></div><form id="check-form"><label class="abs sender-label" for="sender">Sender</label><div class="sender-wrap">${img('sender')}<input id="sender" autocomplete="off" placeholder="Phone or email"></div><label class="abs message-label" for="message">Message</label><div class="message-wrap">${img('document')}<textarea id="message" placeholder="Paste a message" required></textarea></div><div class="image-upload" hidden><label for="image-file">Choose an image</label><input id="image-file" class="sr-only" type="file" accept="image/*"><p id="image-name">No image selected</p></div><button class="primary check-submit" type="submit">Check message</button></form><h2 class="section-title more-checks">More checks</h2>${card('Data breach','data',35,1387,383,139,'#data','more-card')}${card('DNS check','browse',435,1387,383,139,'#dns','more-card')}<div class="check-history">${img('history')}<span>No recent checks</span></div>`}
function vault(){return `<div class="vault-add-background" aria-hidden="true"></div><h1 class="section-title albums-title">Albums</h1><button class="sort-control" aria-label="Sort albums">${img('sort')}Sort</button><div class="filters" role="group" aria-label="Filter albums by file type">${['All','Photos','Videos','GIF','PDF'].map((f,i)=>`<button class="${i===0?'selected':''}" aria-pressed="${i===0}" data-filter="${f}">${f}</button>`).join('')}</div><div class="vault-album-scroll"><div class="vault-albums"></div><p class="vault-empty" hidden>No matching files</p></div><button class="primary add-files">${img('plus')}<span>Add</span></button><input id="vault-files" type="file" multiple hidden accept="image/*,video/*,application/pdf">`}
function settingRow(label,icon,top,kind,key){return `<div class="setting-row" style="top:${top}px">${img(icon,'setting-icon')}<span>${label}</span>${kind==='toggle'?`<button class="toggle" role="switch" aria-checked="true" aria-label="${label}" data-setting="${key}"><span></span></button>`:`<button class="row-action" data-detail="${key}" aria-label="${label}">${arrow()}</button>`}</div>`}
function you(){return `<h1 class="section-title privacy-title">Privacy</h1><section class="settings-group privacy-group" aria-label="Privacy">${settingRow('Face ID unlock','fingerprint',0,'toggle','biometric')}${settingRow('Change passcode','lock',122,'detail','album')}${settingRow('Intruder log','eye',244,'detail','intruder')}</section><h2 class="section-title protection-title" id="protection">Security settings</h2><section class="settings-group protection-group" aria-label="Security settings">${settingRow('Safe browsing','globe',0,'toggle','browsing')}${settingRow('Data leak alert','data',122,'toggle','alerts')}</section><h2 class="section-title activity-title">About</h2><section class="settings-group about-group" aria-label="About"><div class="setting-row" style="top:0"><span id="about-device-id">ID: —</span><button class="copy-id-button" id="copy-device-id">Copy</button></div>${[['Privacy Policy','privacy-policy'],['Terms of Service','terms'],['Version','version']].map(([label,key],i)=>`<div class="setting-row" style="top:${(i+1)*122}px"><span>${label}</span>${key==='version'?'<span class="version-value">1.0.0</span>':`<button class="row-action" data-detail="${key}" aria-label="${label}">${arrow()}</button>`}</div>`).join('')}</section>`}
const renderers={home,check,vault,you};
stage.innerHTML=`<img class="hero" src="${asset('hero')}" alt="${{home:Object.keys(readOverview()).length?'Overview. Safety results.':'Overview. Not checked. Stay protected.',check:'Check. Check before you trust.',vault:'Vault. Your private space.',you:'You. Your privacy, your way.'}[page]}">${page==='check'?'<a class="overlay-control settings" href="you.html" aria-label="Settings"></a>':''}<main aria-label="${names[pages.indexOf(page)]}">${renderers[page]?.()||''}</main>${renderBottomNav(pages.indexOf(page))}<div class="modal-backdrop" hidden><section class="modal" role="dialog" aria-modal="true" aria-labelledby="dialog-title"></section></div>`;
function fit(){window.fitAppViewport();}
window.addEventListener('resize',fit);fit();
let appToastTimer;
function showToast(message){
 let toast=stage.querySelector('.app-toast');
 if(!toast){toast=document.createElement('div');toast.className='app-toast';toast.setAttribute('role','status');toast.setAttribute('aria-live','polite');toast.setAttribute('aria-atomic','true');stage.append(toast);}
 clearTimeout(appToastTimer);toast.textContent=message;toast.classList.add('visible');
 appToastTimer=setTimeout(()=>{toast.classList.remove('visible');toast.textContent='';},2600);
}
let validationToastQueued=false;
stage.addEventListener('invalid',event=>{
 event.preventDefault();if(validationToastQueued)return;validationToastQueued=true;queueMicrotask(()=>validationToastQueued=false);
 const field=event.target;let message='Please complete this field.';
 if(field.id==='vault-pin')message='Enter a 6-digit passcode.';
 else if(field.type==='email')message='Enter a valid email address.';
 else if(field.id==='message')message='Enter a message to check.';
 else if(field.name==='category')message='Choose an album category.';
 else if(field.id==='new-album-name'||field.getAttribute('aria-label')==='Album name')message='Enter an album name.';
 showToast(message);
},true);
function dialog(title,body,options={}){
 const overlay=document.querySelector('.modal-backdrop'),modal=overlay.querySelector('.modal');
 modal.classList.toggle('modal-compact',options.compact===true);
 const previousFocus=document.activeElement;
 overlay.hidden=false;
 modal.innerHTML=`<div class="sheet-handle" aria-hidden="true"></div><header class="unified-sheet-header"><h2 id="dialog-title">${title}</h2><button class="unified-sheet-cancel" data-close type="button">Cancel</button></header><div class="unified-sheet-body">${body}</div><div class="sheet-home-indicator" aria-hidden="true"></div>`;
 const dismiss=()=>{overlay.hidden=true;modal.querySelectorAll('video').forEach(v=>v.pause());if(previousFocus?.isConnected)previousFocus.focus();};
 modal.querySelector('[data-close]').onclick=dismiss;
 overlay.onclick=e=>{if(e.target===overlay)dismiss();};
 modal.onkeydown=e=>{if(e.key==='Escape'){e.stopPropagation();dismiss();return;}if(e.key==='Tab'){const elements=[...modal.querySelectorAll('button:not(:disabled),input:not(:disabled),a[href],video[controls]')].filter(el=>el.getClientRects().length);const first=elements[0],last=elements.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}};
 modal.querySelector('[data-close]').focus();
}
document.addEventListener('keydown',e=>{if(e.key==='Escape')document.querySelector('.modal-backdrop').hidden=true;});

if(page==='check'){
 let mode='message';
 function setMode(next){mode=next;document.querySelectorAll('[data-mode]').forEach(b=>{const selected=b.dataset.mode===next;b.classList.toggle('selected',selected);b.setAttribute('aria-selected',String(selected));});document.querySelector('.check-title span').textContent=next==='message'?'AI message check':'Scam & deepfake check';document.querySelector('.check-title img').src=next==='message'?asset('message'):asset('image','home');document.querySelectorAll('.sender-label,.sender-wrap,.message-label,.message-wrap').forEach(e=>e.hidden=next==='image');document.querySelector('.image-upload').hidden=next!=='image';document.querySelector('#message').required=next==='message';document.querySelector('.check-submit').textContent=next==='message'?'Check message':'Check image';}
 document.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>setMode(b.dataset.mode));
 document.querySelector('#image-file').onchange=e=>document.querySelector('#image-name').textContent=e.target.files[0]?.name||'No image selected';
 document.querySelector('#check-form').onsubmit=e=>{e.preventDefault();if(mode==='image'&&!document.querySelector('#image-file').files.length){showToast('Select an image to check.');return;}previewResult(mode);};
 function dataDialog(){dialog('Data breach check','<p>Check if your email appears in a data breach.</p><input aria-label="Email" type="email" placeholder="Email address"><button id="preview-breach">Check now</button>');document.querySelector('#preview-breach').onclick=()=>{const input=document.querySelector('.modal input');input.required=true;if(input.reportValidity())previewResult('data');};}
 document.querySelector('a[href="#data"]').onclick=e=>{e.preventDefault();dataDialog();};
 function dnsDialog(){dialog('DNS check','<p>Check DNS resolution and look for unexpected redirects or suspicious DNS settings.</p><button id="preview-dns">Check now</button>');document.querySelector('#preview-dns').onclick=()=>previewResult('dns');}
 document.querySelector('a[href="#dns"]').onclick=e=>{e.preventDefault();dnsDialog();};
 const tool=new URLSearchParams(location.search).get('tool');if(tool==='image')setMode('image');if(tool==='email'){document.querySelector('.check-title span').textContent='AI email scam detection';document.querySelector('.sender-label').textContent='Sender email';document.querySelector('#sender').placeholder='sender@example.com';document.querySelector('.message-label').textContent='Email content';document.querySelector('#message').placeholder='Paste the email you want to check';document.querySelector('.check-submit').textContent='Check email';}if(tool==='data')dataDialog();if(tool==='dns')dnsDialog();
}

if(page==='vault'){const script=document.createElement('script');script.src='vault.js';document.body.append(script);}

if(page==='you'){
 const settingsScript=document.createElement('script');settingsScript.src='you-settings.js';document.body.append(settingsScript);
 const details={'privacy-policy':['Privacy Policy','The privacy policy has not been added yet.'],terms:['Terms of Service','The terms of service have not been added yet.'],version:['Version','Version information has not been set yet.'],album:['Album lock','Album password configuration is represented in this concept. No files are encrypted.'],intruder:['Intruder log','No records. This concept does not access the camera or capture photos.'],history:['Check history','No recent checks.'],browsing:['Browsing activity','No browsing activity. This concept does not monitor your browser.']};
 document.querySelectorAll('[data-detail]').forEach(button=>button.onclick=()=>{if(button.dataset.detail==='album'){window.openChangePasscode?.();return;}const [title,body]=details[button.dataset.detail];dialog(title,`<p>${body}</p>`);});
}

if(page==='home'){
 // Scroll the hero and content together while keeping navigation accessible.
 const scroller=document.createElement('div');scroller.className='home-scroll';
 const canvas=document.createElement('div');canvas.className='home-canvas';
 const hero=stage.querySelector('.hero'),main=stage.querySelector('main');
 canvas.append(hero,main);scroller.append(canvas);stage.prepend(scroller);
 const script=document.createElement('script');script.src='sentry.js';document.body.append(script);

}

if(page==='you'){
 const scroll=document.createElement('div');scroll.className='you-scroll';
 const canvas=document.createElement('div');canvas.className='you-canvas';
 canvas.append(stage.querySelector('.hero'),stage.querySelector('main'));scroll.append(canvas);stage.prepend(scroll);
}
