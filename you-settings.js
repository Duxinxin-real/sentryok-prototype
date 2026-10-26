(()=>{
const KEY='sentry-protection-v1',VK='sentryok-vault-prototype-v2';
const read=key=>{try{return JSON.parse(localStorage.getItem(key)||'{}')}catch{return {}}};
const safe=s=>!!(s.ads&&s.phishing&&s.redirects&&s.malware);
function sync(){const s=read(KEY);for(const b of document.querySelectorAll('[data-setting]')){const key=b.dataset.setting;b.setAttribute('aria-checked',String(key==='browsing'?safe(s):key==='alerts'?!!s.leak:localStorage.getItem('sentry-face-id')==='true'));}}
for(const b of document.querySelectorAll('[data-setting]'))b.onclick=()=>{
 const key=b.dataset.setting,s=read(KEY);
 if(key==='alerts'){location.href='index.html?open=leak';return;}
 if(key==='browsing'){if(!safe(s)){location.href='index.html?open=protection';return;}s.ads=s.phishing=s.redirects=s.malware=false;localStorage.setItem(KEY,JSON.stringify(s));sync();return;}
 if(localStorage.getItem('sentry-face-id')==='true'){localStorage.setItem('sentry-face-id','false');sync();return;}
 const previousFocus=document.activeElement;
 const overlay=document.createElement('div');overlay.className='ios-permission-overlay';
 overlay.innerHTML='<section class="ios-alert" role="alertdialog" aria-modal="true" aria-labelledby="face-permission-title" aria-describedby="face-permission-description"><h2 id="face-permission-title">“SentryOK” Would Like to Use Face ID</h2><p id="face-permission-description">Use Face ID to unlock your Vault.</p><div class="ios-alert-actions"><button id="face-deny">Don’t Allow</button><button id="face-allow">Allow</button></div></section>';
 document.querySelector('.screen').append(overlay);
 const dismiss=()=>{overlay.remove();previousFocus?.focus();};
 overlay.querySelector('#face-deny').onclick=dismiss;
 overlay.querySelector('#face-allow').onclick=()=>{localStorage.setItem('sentry-face-id','true');dismiss();sync();};
 overlay.onkeydown=e=>{if(e.key==='Escape'){e.preventDefault();dismiss();}if(e.key==='Tab'){e.preventDefault();(document.activeElement.id==='face-deny'?overlay.querySelector('#face-allow'):overlay.querySelector('#face-deny')).focus();}};
 overlay.querySelector('#face-deny').focus();

};
window.openChangePasscode=()=>{
 const vault=read(VK);
 if(!vault.pin){dialog('Set up Vault first','<p>Create a passcode before changing it.</p><button id="setup-vault">Open Vault</button>',{compact:true});document.querySelector('#setup-vault').onclick=()=>location.href='vault.html';return;}
 dialog('Change passcode',`<form id="change-passcode" novalidate>${[['current','Current passcode'],['new','New passcode'],['confirm','Confirm passcode']].map(([id,label])=>`<label class="passcode-field">${label}<input name="${id}" aria-label="${label}" type="password" inputmode="numeric" maxlength="6" pattern="[0-9]{6}" required></label>`).join('')}<button type="submit">Save</button></form>`,{compact:true});
 document.querySelector('#change-passcode').onsubmit=e=>{e.preventDefault();const f=e.target,old=f.elements.current.value,next=f.elements.new.value,confirm=f.elements.confirm.value;
 if(old!==vault.pin){showToast('Incorrect current passcode.');return;}
 if(!/^\d{6}$/.test(next)){showToast('Enter a 6-digit passcode.');return;}
 if(next!==confirm){showToast('Passcodes don’t match.');return;}
 const latest=read(VK);latest.pin=next;localStorage.setItem(VK,JSON.stringify(latest));document.querySelector('.modal-backdrop').hidden=true;showToast('Passcode changed.');};
};
addEventListener('storage',sync);addEventListener('pageshow',sync);sync();
})();

(()=>{
 const KEY='sentry-intruder-log-v1';
 const read=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'[]').filter(r=>r&&Number.isFinite(r.time)).sort((a,b)=>b.time-a.time);}catch{return [];}};
 const panel=document.createElement('section');panel.className='intruder-page';panel.hidden=true;document.querySelector('.screen').append(panel);
 const format=time=>new Date(time).toLocaleString('en-US',{month:'short',day:'numeric',year:'numeric',hour:'numeric',minute:'2-digit'});
 function close(){panel.hidden=true;document.querySelector('[data-detail="intruder"]').focus();}
 function render(){
  const rows=read();
  panel.innerHTML=`<header><button data-back>‹ Back</button><h1>Intruder log</h1></header><main>${rows.length?`<div class="intruder-heading"><h2>Failed unlocks</h2><button data-clear>Clear all</button></div><div class="intruder-list">${rows.map((r,i)=>`<button data-record="${i}"><span><strong>Incorrect passcode</strong><small>${format(r.time)}</small></span><span class="intruder-badge">Failed</span><span aria-hidden="true">›</span></button>`).join('')}</div>`:'<div class="intruder-empty"><img src="assets/you-eye.png" alt=""><h2>No failed unlocks</h2><p>Failed Vault unlock attempts will appear here.</p></div>'}</main><div class="intruder-home-indicator"></div>`;
  panel.querySelector('[data-back]').onclick=close;
  panel.querySelector('[data-clear]')?.addEventListener('click',()=>{dialog('Clear intruder log?','<p>All recorded attempts will be removed.</p><button id="confirm-clear-log">Clear all</button>',{compact:true});document.querySelector('#confirm-clear-log').onclick=()=>{localStorage.removeItem(KEY);document.querySelector('.modal-backdrop').hidden=true;render();};});
  panel.querySelectorAll('[data-record]').forEach(b=>b.onclick=()=>{const r=rows[Number(b.dataset.record)];dialog('Unlock attempt',`<dl class="intruder-details"><div><dt>Time</dt><dd>${format(r.time)}</dd></div><div><dt>Method</dt><dd>Passcode</dd></div><div><dt>Result</dt><dd>Access denied</dd></div><div><dt>Location</dt><dd>Vault</dd></div></dl>`,{compact:true});});
 }
 document.querySelector('[data-detail="intruder"]').onclick=()=>{document.querySelector('.modal-backdrop').hidden=true;render();panel.hidden=false;panel.querySelector('[data-back]').focus();};
 addEventListener('storage',e=>{if(e.key===KEY&&!panel.hidden)render();});
})();

(()=>{
 const key='sentry-device-id';let id=localStorage.getItem(key);
 if(!id){id=Array.from(crypto.getRandomValues(new Uint8Array(4)),n=>n.toString(16).padStart(2,'0')).join('').toUpperCase();localStorage.setItem(key,id);}
 document.querySelector('#about-device-id').textContent=`ID: ${id}`;
 const button=document.querySelector('#copy-device-id');let timer;
 button.onclick=async()=>{
  let copied=false;
  try{await navigator.clipboard.writeText(id);copied=true;}catch{
   const input=document.createElement('textarea');input.value=id;input.style.cssText='position:fixed;left:-9999px';document.body.append(input);input.select();try{copied=document.execCommand('copy');}catch{}input.remove();button.focus();
  }
  if(!copied){showToast('Unable to copy. Please try again.');return;}
  clearTimeout(timer);button.textContent='Copied';timer=setTimeout(()=>button.textContent='Copy',2000);
 };
})();
