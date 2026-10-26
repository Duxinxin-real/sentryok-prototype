(()=>{
const KEY='sentry-protection-v1';
const defaults=()=>({checked:false,configured:false,extensionEnabled:false,ads:false,phishing:false,redirects:false,email:'',phone:'',address:'',verified:false,leak:false,malware:false});
let state=defaults();try{state={...state,...JSON.parse(localStorage.getItem(KEY)||'{}')};}catch{}
const definitions=[['ads','Ad & pop-up blocking','lock'],['phishing','Anti-phishing','browse'],['redirects','Redirect blocking','message'],['leak','Data leak alert','data'],['malware','Malware blocking','lock']];
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const browserOn=()=>state.ads&&state.phishing&&state.redirects&&state.malware;
const allOn=()=>definitions.every(([key])=>state[key]);
const save=()=>localStorage.setItem(KEY,JSON.stringify(state));
const main=stage.querySelector('main'),hero=stage.querySelector('.hero');
stage.querySelector('.home-settings-background')?.remove();
main.querySelector('.overview-results')?.remove();
main.insertAdjacentHTML('afterbegin','<section class="sentry-overview"><div class="sentry-statusbar" aria-hidden="true"></div><h1>Sentry</h1><p class="sentry-eyebrow"></p><div class="sentry-summary"></div></section>');
const mainButton=main.querySelector('.primary');mainButton.removeAttribute('href');mainButton.setAttribute('role','button');mainButton.tabIndex=0;
main.querySelectorAll('.protection-item').forEach((card,i)=>{const [key,title,icon]=definitions[i];card.dataset.protection=key;card.setAttribute('role',key==='leak'?'button':'switch');card.tabIndex=0;card.querySelector('img').src='assets/home-'+icon+'.png';card.querySelector('.protection-name>span').textContent=title;card.onclick=()=>onCard(key);card.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();onCard(key);}};});
function refresh(){
 syncTestControls();
 const safe=browserOn();hero.src=safe?'assets/sentry-blue-small-hero.png':'assets/sentry-red-hero.png';hero.alt=safe?'Blue protection shield':'Red warning shield';
 stage.classList.toggle('sentry-protected',safe);
 main.querySelector('.sentry-eyebrow').textContent='Protection overview';
 main.querySelector('.sentry-summary').innerHTML=[['Safe browsing',safe,'browse','browsing'],['Data leak alert',state.leak,'data','leak']].map(([label,on,icon,key])=>`<div><span class="summary-icon"><img src="assets/home-${icon}.png" alt=""></span><div class="summary-content"><span>${label}</span><div class="summary-controls"><button class="summary-switch" role="switch" aria-label="${label}" aria-checked="${on}" data-summary="${key}"><span></span></button></div></div></div>`).join('');
 main.querySelectorAll('[data-summary]').forEach(button=>button.onclick=()=>{if(button.dataset.summary==='leak'){emailSetup();return;}else{if(!state.configured||!state.extensionEnabled){tutorial();return;}const next=!browserOn();state.ads=state.phishing=state.redirects=state.malware=next;}save();refresh();});
 main.querySelectorAll('[data-protection]').forEach(card=>{const on=!!state[card.dataset.protection];if(card.dataset.protection!=='leak')card.setAttribute('aria-checked',String(on));const tag=card.querySelector('small');tag.className='protection-status '+(on?'is-on':'is-off');tag.textContent=on?'On':'Off';});
 mainButton.textContent=allOn()?'Protection on':'Open Protection';mainButton.setAttribute('aria-disabled',String(allOn()));mainButton.classList.toggle('protection-complete',allOn());
}
mainButton.onclick=e=>{e.preventDefault();if(allOn())return;if(!browserOn())tutorial();else if(!state.leak)emailSetup();else emailSetup();};
mainButton.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();mainButton.click();}};
function onCard(key){if(key==='leak'){emailSetup();return;}browserIntro(key);}
function browserIntro(key){
 const copy={
  malware:['Malware blocking','Block malicious websites','Helps block known websites that spread malware, reducing the risk of harmful downloads while you browse.'],
  ads:['Ad & pop-up blocking','Browse with fewer interruptions','Blocks unwanted ads and pop-ups in your browser, so you can focus on the content you want.'],
  phishing:['Anti-phishing','Stay away from fake websites','Helps block known phishing websites that try to steal your passwords, payment details or personal information.'],
  redirects:['Redirect blocking','Stay on the page you choose','Helps stop unwanted redirects that send you to suspicious websites while you browse.']
 };
 const [title,heading,description]=copy[key];
 openFlow(title,`<div class="browser-intro-art"><img src="assets/${key==='malware'?'malware-protection-intro':'browser-protection-intro'}.png" alt="${key==='malware'?'Shield blocking a malicious website':'Browser protection shield'}"></div><h2 class="leak-intro-title">${heading}</h2><p class="leak-intro-copy">${description}</p>`,`<button class="sentry-action" id="browser-turn-on" ${state[key]?'disabled':''}>${state[key]?'On':'Turn On'}</button>`);
 styleEmailFlow();flow.classList.add('leak-intro','browser-intro');
 flow.querySelector('#browser-turn-on').onclick=()=>{if(state[key])return;if(!state.configured||!state.extensionEnabled){tutorial();return;}state[key]=true;save();refresh();closeFlow();};
}
const flow=document.createElement('section');flow.className='sentry-flow';flow.hidden=true;stage.append(flow);let flowVersion=0;
const testPanel=document.createElement('aside');testPanel.className='sentry-test-panel';testPanel.hidden=true;testPanel.innerHTML='<strong>Email verification</strong><p>测试验证码</p><output></output>';document.body.append(testPanel);
function openFlow(title,content,footer=''){
 flowVersion++;flow.classList.remove('system-settings','sentry-email-flow','leak-intro','leak-manager','browser-intro');flow.hidden=false;stage.querySelector('.home-scroll').inert=true;stage.querySelector('nav').hidden=true;
 flow.innerHTML=`<header><button class="sentry-flow-back">Back</button><h1>${title}</h1></header><div class="sentry-flow-body">${content}</div>${footer?`<footer>${footer}</footer>`:''}<div class="sentry-flow-indicator"></div>`;
 flow.querySelector('.sentry-flow-back').onclick=closeFlow;
}
function closeFlow(){flowVersion++;flow.hidden=true;testPanel.hidden=true;stage.querySelector('.home-scroll').inert=false;stage.querySelector('nav').hidden=false;refresh();}
function runCheck(){
 openFlow('Protection check','<div class="sentry-checking"><div class="sentry-spinner"></div><h2>Checking…</h2><p>Reviewing your protection settings</p></div>');const token=flowVersion;
 setTimeout(()=>{if(token!==flowVersion)return;state.checked=true;save();refresh();results();},1200);
}
function results(){
 const missing=definitions.filter(([key])=>!state[key]);
 openFlow('Protection check',`<h2>${missing.length?'Protection needs attention':'You’re protected'}</h2><p>${missing.length?`${missing.length} protection ${missing.length===1?'item is':'items are'} off.`:'All five protections are on.'}</p><div class="sentry-result-list">${(missing.length?missing:definitions).map(([key,label])=>`<div><span>${label}</span><small class="protection-status ${state[key]?'is-on':'is-off'}">${state[key]?'On':'Off'}</small></div>`).join('')}</div>`,`<button class="sentry-action" id="result-next">${missing.length?'Enable Protection':'Done'}</button>`);
 flow.querySelector('#result-next').onclick=()=>{if(allOn())closeFlow();else if(!browserOn())settingsSearch();else if(!state.leak)emailSetup();else emailSetup();};
}
function tutorial(){
 const scenes=[
  ['ios-settings-apps-example.jpg','Tap Apps','-65%','88.6%','6.5%'],
  ['ios-settings-safari-example.png','Select Safari','-39%','66.5%','6.5%'],
  ['ios-safari-settings-example.png','Tap Extensions','-38%','64.5%','6.6%']
 ];
 const scene=(i)=>{const [src,label,offset,top,height]=scenes[i];return `<div class="sentry-tutorial-scroll" style="--scroll-end:${offset}"><img src="assets/${src}" alt="${label}"><span class="sentry-tutorial-highlight" style="top:${top};height:${height}" aria-hidden="true"></span><span class="sentry-tutorial-tap" style="top:calc(${top} + 3%)" aria-hidden="true"><span class="sentry-tutorial-ripple"></span><span class="sentry-tutorial-hand">👆</span></span></div>`;};
 openFlow('Enable protection',`<div class="sentry-tutorial-art" aria-label="Settings: Apps, Safari, Extensions">${scene(0)}</div><h2>Protect your browsing</h2><div class="sentry-steps"><div><b>1</b><p>Open Settings → Apps → Safari.</p></div><div><b>2</b><p>Open Extensions, then SentryOK.</p></div><div><b>3</b><p>Turn on Allow Extension and allow website access.</p></div></div>`,`<button class="sentry-action" id="open-settings">Open Settings</button>`);
 flow.querySelector('#open-settings').onclick=settingsSearch;
 const token=flowVersion,art=flow.querySelector('.sentry-tutorial-art');let current=0;
 function advance(){if(token!==flowVersion||flow.hidden)return;current=(current+1)%scenes.length;art.innerHTML=scene(current);setTimeout(advance,3200);}
 setTimeout(advance,3200);
}

function settingsSearch(){
 openFlow('Settings',`<input class="sentry-settings-search" aria-label="Search Settings" placeholder="Search" type="search"><div class="sentry-settings-results"><button id="safari-settings">Safari <span>Apps · Extensions</span></button></div>`,`<button class="sentry-action" id="return-sentry">Return to Sentry</button>`);
 flow.classList.add('system-settings');flow.querySelector('.sentry-flow-back').onclick=returnFromSettings;
 flow.querySelector('#return-sentry').onclick=returnFromSettings;
 const input=flow.querySelector('input'),row=flow.querySelector('#safari-settings');input.oninput=()=>row.hidden=!!input.value&&!/safari|sentry|extension/i.test(input.value);row.onclick=extensionSettings;input.focus();
}
function extensionSettings(){
 openFlow('SentryOK',`<p>Safari · Extensions</p><div class="sentry-setting-row"><span>Allow Extension</span><button class="sentry-switch" id="allow-extension" role="switch" aria-label="Allow Extension" aria-checked="${state.extensionEnabled}"><span></span></button></div><div class="sentry-setting-row"><span>Website Access</span><button id="website-access">${state.extensionEnabled?'Allow':'Ask'}</button></div><p class="sentry-setting-note">Return to Sentry to check your protection.</p>`,`<button class="sentry-action" id="return-sentry">Return to Sentry</button>`);
 flow.querySelector('.sentry-flow-back').onclick=settingsSearch;flow.querySelector('#return-sentry').onclick=returnFromSettings;
 flow.querySelector('#allow-extension').onclick=()=>{state.extensionEnabled=!state.extensionEnabled;state.configured=state.configured||state.extensionEnabled;state.ads=state.phishing=state.redirects=state.malware=state.extensionEnabled;save();extensionSettings();};
 flow.querySelector('#website-access').onclick=()=>{if(!state.extensionEnabled){showToast('Turn on Allow Extension first.');return;}showToast('Website access is allowed.');};
}
function returnFromSettings(){flow.classList.remove('system-settings');runCheck();}
const leakFields=[['email','Email','email','alex@example.com'],['phone','Phone','tel','+1 (202) 555-0147'],['address','Address','text','Street, city, postal code']];
function styleEmailFlow(){
 flow.classList.add('sentry-email-flow');
 flow.insertAdjacentHTML('afterbegin','<div class="sentry-statusbar" aria-hidden="true"></div>');
}
function emailSetup(fromManager=false){
 openFlow('Data leak alert',`<div class="leak-intro-art" role="img" aria-label="Email, phone and address leak notification"></div><h2 class="leak-intro-title">Know when your<br>data leaks</h2><p class="leak-intro-copy">Add your email, phone number or address. Get a push notification when your information appears in a newly detected leak.</p>`,`<button class="sentry-action" id="leak-get">Get</button>`);
 styleEmailFlow();flow.classList.add('leak-intro');
 flow.querySelector('#leak-get').onclick=leakManager;
 if(fromManager)flow.querySelector('.sentry-flow-back').onclick=leakManager;
}
function syncLeak(){state.leak=leakFields.some(([key])=>!!state[key]?.trim());save();refresh();}
function leakManager(){
 openFlow('Data leak alert',`<div class="leak-info-list">${leakFields.map(([key,label])=>`<article class="leak-info-card"><div><h2>${label}</h2>${state[key]?`<p>${escape(state[key])}</p>`:''}</div><button data-leak-edit="${key}">${state[key]?'Edit':'+ Add'}</button></article>`).join('')}</div><p class="leak-privacy">Your information stays on this device.</p><button class="leak-recent" id="leak-recent">Recent alerts <span aria-hidden="true">›</span></button>`,`<button class="sentry-action" id="leak-done">Done</button>`);
 styleEmailFlow();flow.classList.add('leak-manager');
 flow.querySelector('header').insertAdjacentHTML('beforeend','<button class="leak-help" aria-label="About Data leak alert">!</button>');
 flow.querySelector('.leak-help').onclick=()=>emailSetup(true);
 flow.querySelectorAll('[data-leak-edit]').forEach(button=>button.onclick=()=>editLeak(button.dataset.leakEdit));
 flow.querySelector('#leak-done').onclick=closeFlow;
 flow.querySelector('#leak-recent').onclick=()=>{
  openFlow('Recent alerts','<div class="leak-empty">No alerts yet</div>');styleEmailFlow();flow.querySelector('.sentry-flow-back').onclick=leakManager;
 };
}
function editLeak(key){
 const [,label,type,placeholder]=leakFields.find(([id])=>id===key);
 openFlow(label,`<form id="leak-edit-form" novalidate><label for="leak-value">${label}</label>${key==='address'?`<textarea id="leak-value" placeholder="${placeholder}" maxlength="240" required>${escape(state[key]||'')}</textarea>`:`<input id="leak-value" type="${type}" placeholder="${placeholder}" value="${escape(state[key]||'')}" maxlength="254" required>`}</form>${state[key]?'<button class="leak-remove" id="leak-remove">Remove</button>':''}`,`<button class="sentry-action" form="leak-edit-form">Save</button>`);
 styleEmailFlow();flow.querySelector('.sentry-flow-back').onclick=leakManager;
 flow.querySelector('form').onsubmit=e=>{e.preventDefault();const input=flow.querySelector('#leak-value'),value=input.value.trim();if(!value||!input.validity.valid||(key==='phone'&&value.replace(/\D/g,'').length<6)){showToast('Enter a valid '+label.toLowerCase()+'.');return;}state[key]=value;syncLeak();leakManager();};
 const remove=flow.querySelector('#leak-remove');if(remove)remove.onclick=()=>{state[key]='';syncLeak();leakManager();};
}
function syncTestControls(){}
addEventListener('storage',e=>{if(e.key===KEY){try{state={...defaults(),...JSON.parse(e.newValue||'{}')};refresh();}catch{}}});
refresh();
const entry=new URLSearchParams(location.search).get('open');
if(entry==='protection')tutorial();
if(entry==='leak')emailSetup();
})();
