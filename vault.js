(()=>{
// Prototype state stays in memory; this is not a secure storage implementation.
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let albums=[['Personal','personal'],['Travel','travel'],['Memories','favorites'],['Documents','documents']].map(([name,cover],i)=>({id:i,name,cover:(i===0||i===3)?null:cover,password:'',files:i===3?[]:[{name:name+'.jpg',type:'Photos',url:`assets/vault-${cover}.png`}]})).filter(a=>a.id!==0);
albums.push(
 {id:4,name:'Videos',cover:'travel',password:'',mediaType:'Videos',files:[{name:'Travel highlights.webm',type:'Videos',url:'assets/vault-highlights.webm',thumbnail:'assets/vault-travel.png'}]},
 {id:5,name:'GIFs',cover:'favorites',password:'',mediaType:'GIF',files:[{name:'Moments.gif',type:'GIF',url:'assets/vault-moments.gif',thumbnail:'assets/vault-favorites.png'}]}
);
for(const a of albums){
 if(a.id===1||a.id===2)a.files=Array.from({length:12},(_,i)=>({name:`Photo ${i+1}.jpg`,type:'Photos',url:`assets/album-photo-${i+1}.jpg`}));
 if(a.id===4)a.files=Array.from({length:6},(_,i)=>({name:`Travel clip ${i+1}.webm`,type:'Videos',url:'assets/vault-highlights.webm',thumbnail:'assets/vault-travel.png'}));
 if(a.id===5)a.files=Array.from({length:6},(_,i)=>({name:`Moment ${i+1}.gif`,type:'GIF',url:'assets/vault-moments.gif',thumbnail:'assets/vault-favorites.png'}));
}
for(const sample of window.albumDocumentSamples||[]){const bytes=Uint8Array.from(atob(sample.data),c=>c.charCodeAt(0));albums.find(a=>a.id===3).files.push({name:sample.name,type:'PDF',pages:1,size:bytes.length,url:'data:application/pdf;base64,'+sample.data,thumbnail:sample.thumbnail,size:sample.size,pages:1});}
albums.forEach(a=>a.category=a.mediaType||(a.id===3?'PDF':'Photos'));
const sampleAlbums=albums;
const storageKey='sentryok-vault-prototype-v2';
let vaultState={pin:'',permission:'unknown',albums:[]},unlocked=false;
try{const saved=JSON.parse(localStorage.getItem(storageKey));if(saved&&Array.isArray(saved.albums))vaultState=saved;}catch{}
albums=vaultState.albums;
function persist(){vaultState.albums=albums;try{localStorage.setItem(storageKey,JSON.stringify(vaultState));}catch{dialog('Storage full','<p>This browser could not save the latest items. Remove some items and try again.</p>',{compact:true});}}

let filter='All',reverse=false,sorted=false,target=null;
const close=()=>document.querySelector('.modal-backdrop').hidden=true;
function mediaCover(a){const f=a.files.find(f=>f.type!=='PDF');return f?(f.thumbnail||f.url):(a.cover?'assets/vault-'+a.cover+'.png':'');}
function coverFile(a){return a.files.find(f=>f.type==='PDF'&&f.thumbnail&&(filter==='All'||filter==='PDF'));}
function render(){persist();document.querySelector('.vault-empty').innerHTML=albums.length?'No albums in this category':'<strong>Your Vault is empty</strong><span>Create an album to add your private items.</span>';const list=sorted?[...albums].sort((a,b)=>(reverse?-1:1)*a.name.localeCompare(b.name)):[...albums];const visible=list.filter(a=>filter==='All'||a.category===filter);document.querySelector('.vault-empty').hidden=visible.length>0;document.querySelector('.vault-albums').innerHTML=visible.map(a=>`<article class="vault-album"><button class="vault-open" data-open="${a.id}" aria-label="Open ${esc(a.name)}">${a.password?'<div class="vault-locked-cover"><img src="assets/vault-lock.png" alt="">Locked</div>':coverFile(a)?`<div class="vault-pdf-cover"><img src="${coverFile(a).thumbnail}" alt="PDF first page"><span>PDF</span></div>`:mediaCover(a)?`<div class="vault-media-cover"><img class="vault-cover" src="${esc(mediaCover(a))}" alt=""><span>${a.category==='Videos'?'VIDEO':a.category==='GIF'?'GIF':'PHOTO'}</span></div>`:`<div class="vault-new-cover">${a.files.length?`${a.files.length} item${a.files.length===1?'':'s'}`:'Empty album'}<small>${a.category||''}</small></div>`}<strong>${esc(a.name)}</strong></button><div class="vault-album-meta"><span>${a.password?'Password required':`${a.files.length} item${a.files.length===1?'':'s'}`}</span><button data-manage="${a.id}" aria-label="Manage ${esc(a.name)}">Manage</button></div></article>`).join('');document.querySelectorAll('[data-open]').forEach(b=>b.onclick=()=>authenticate(albums.find(a=>a.id===+b.dataset.open),showAlbum));document.querySelectorAll('[data-manage]').forEach(b=>b.onclick=()=>authenticate(albums.find(a=>a.id===+b.dataset.manage),manage));}
function authenticate(a,next){if(!unlocked){showGate();return;}next(a);}
let currentAlbum=null;
const albumPage=document.createElement('section');albumPage.className='vault-album-page';albumPage.hidden=true;albumPage.setAttribute('aria-label','Album contents');stage.append(albumPage);
function exitAlbum(){albumPage.hidden=true;albumPage.innerHTML='';currentAlbum=null;stage.querySelector('main').hidden=false;stage.querySelector('nav').hidden=false;document.title='Vault — Security concept';const button=document.querySelector('.vault-open');if(button)button.focus();}
let albumNewest=true,albumSelecting=false;const selectedItems=new Set();
function showAlbum(a){
 close();sheet.hidden=true;if(currentAlbum!==a){albumSelecting=false;selectedItems.clear();}currentAlbum=a;stage.querySelector('main').hidden=true;stage.querySelector('nav').hidden=true;albumPage.hidden=false;document.title=a.name+' — Vault';
 const files=albumNewest?[...a.files]:[...a.files].reverse();
 albumPage.innerHTML=`<div class="album-page-status" aria-hidden="true"></div><header class="album-page-header"><button class="album-page-back">Albums</button><h1>${esc(a.name)}</h1><span>${a.category} · ${a.files.length} item${a.files.length===1?'':'s'}</span><button class="album-page-select">${albumSelecting?'Done':'Select'}</button></header><div class="album-content-panel"><div class="album-section-heading"><h2>${{Photos:'October 2026',Videos:'All videos',GIF:'All GIFs',PDF:'All documents'}[a.category]}</h2><button class="album-sort">${albumNewest?'Newest first':'Oldest first'}</button></div><div class="album-items-scroll"><div class="album-items-grid ${a.category==='PDF'?'documents-grid':''}">${files.length?files.map((f,i)=>{let preview=f.type==='Videos'?`<div class="album-item-preview"><video src="${esc(f.url)}" ${f.thumbnail?`poster="${esc(f.thumbnail)}"`:''} preload="metadata" muted playsinline></video><span class="album-item-type">VIDEO</span></div>`:f.type==='PDF'?`<div class="album-item-preview pdf">${f.thumbnail?`<img src="${f.thumbnail}" alt="First page">`:'<span>PDF</span>'}<span class="album-item-type">PDF</span></div>`:`<div class="album-item-preview"><img src="${esc(f.url)}" alt="">${f.type==='GIF'?'<span class="album-item-type">GIF</span>':''}</div>`;return `<button class="album-item ${selectedItems.has(f)?'item-selected':''}" data-item="${i}" aria-label="${esc(f.name)}" ${albumSelecting?`aria-pressed="${selectedItems.has(f)}"`:''}>${preview}${albumSelecting?'<span class="album-select-dot" aria-hidden="true"></span>':''}${f.type==='PDF'?`<span class="album-item-name">${esc(f.name)}</span><small class="album-item-meta">${f.pages||1} page${(f.pages||1)>1?'s':''}${f.size?' · '+Math.ceil(f.size/1024)+' KB':''}</small>`:''}</button>`;}).join(''):'<p class="album-items-empty">No items yet</p>'}</div></div></div><div class="album-bottom-fade"></div><button class="album-page-add">${albumSelecting?(selectedItems.size?`Delete ${selectedItems.size} item${selectedItems.size===1?'':'s'}`:'Select items'):'Add item'}</button><div class="album-home-indicator" aria-hidden="true"></div>`;
 albumPage.querySelector('.album-page-back').onclick=exitAlbum;
 albumPage.querySelector('.album-page-select').onclick=()=>{albumSelecting=!albumSelecting;selectedItems.clear();showAlbum(a);};
 albumPage.querySelector('.album-sort').onclick=()=>{albumNewest=!albumNewest;showAlbum(a);};
 albumPage.querySelector('.album-page-add').disabled=albumSelecting&&!selectedItems.size;
 albumPage.querySelector('.album-page-add').onclick=()=>{if(!albumSelecting){pick(a);return;}dialog('Delete items?',`<p>Remove ${selectedItems.size} selected item${selectedItems.size===1?'':'s'} from this album?</p><button id="confirm-delete-items">Delete items</button>`,{compact:true});document.querySelector('#confirm-delete-items').onclick=()=>{a.files=a.files.filter(f=>!selectedItems.has(f));selectedItems.clear();albumSelecting=false;render();showAlbum(a);};};
 albumPage.querySelectorAll('[data-item]').forEach(b=>b.onclick=()=>{const f=files[+b.dataset.item];if(albumSelecting){const scroll=albumPage.querySelector('.album-items-scroll').scrollTop;selectedItems.has(f)?selectedItems.delete(f):selectedItems.add(f);showAlbum(a);albumPage.querySelector('.album-items-scroll').scrollTop=scroll;return;}openItem(f,b);});
}
const itemViewer=document.createElement('section');
itemViewer.className='vault-item-viewer';itemViewer.hidden=true;stage.append(itemViewer);
let viewerTask=null,viewerVersion=0,viewerReturn=null;
function closeItem(){
 viewerVersion++;itemViewer.querySelectorAll('video').forEach(v=>{v.pause();v.removeAttribute('src');v.load();});
 if(viewerTask){viewerTask.destroy();viewerTask=null;}
 itemViewer.hidden=true;itemViewer.innerHTML='';albumPage.inert=false;
 document.title=(currentAlbum?.name||'Vault')+' — Vault';if(viewerReturn?.isConnected)viewerReturn.focus();
}
async function openItem(f,trigger){
 const version=++viewerVersion;viewerReturn=trigger;albumPage.inert=true;
 itemViewer.hidden=false;itemViewer.classList.toggle('is-document',f.type==='PDF');
 document.title=f.name+' — Vault';
 itemViewer.innerHTML=`<header class="item-viewer-header"><button type="button" class="item-viewer-back">Back</button><h1>${esc(f.name)}</h1><span>${esc(f.type)}</span></header><div class="item-viewer-content"></div><div class="item-viewer-indicator" aria-hidden="true"></div>`;
 itemViewer.querySelector('.item-viewer-back').onclick=closeItem;
 itemViewer.querySelector('.item-viewer-back').focus();
 const content=itemViewer.querySelector('.item-viewer-content');
 if(f.type!=='PDF'){
  content.innerHTML=f.type==='Videos'?`<video src="${esc(f.url)}" poster="${esc(f.thumbnail||'')}" controls playsinline preload="metadata"></video>`:`<img src="${esc(f.url)}" alt="${esc(f.name)}">`;return;
 }
 content.innerHTML='<p class="item-viewer-loading">Loading…</p>';
 let task;
 try{
  await pdfCoverReady;const data=new Uint8Array(await(await fetch(f.url)).arrayBuffer());if(version!==viewerVersion)return;
  task=pdfjsLib.getDocument({data,isEvalSupported:false,useSystemFonts:true});viewerTask=task;
  const pdf=await task.promise;if(version!==viewerVersion)return;content.innerHTML='';
  for(let n=1;n<=pdf.numPages;n++){
   if(version!==viewerVersion)return;
   const page=await pdf.getPage(n),base=page.getViewport({scale:1}),viewport=page.getViewport({scale:1200/base.width});
   const canvas=document.createElement('canvas');canvas.width=Math.ceil(viewport.width);canvas.height=Math.ceil(viewport.height);canvas.setAttribute('aria-label',`Page ${n} of ${pdf.numPages}`);
   const wrapper=document.createElement('figure');wrapper.append(canvas);const label=document.createElement('figcaption');label.textContent=`${n} / ${pdf.numPages}`;wrapper.append(label);content.append(wrapper);
   await page.render({canvasContext:canvas.getContext('2d'),viewport,background:'white'}).promise;
  }
 }catch(error){if(version===viewerVersion)content.innerHTML=`<p class="item-viewer-loading">Unable to open this PDF.</p><a href="${esc(f.url)}" target="_blank" rel="noopener">Open PDF</a>`;}
 finally{if(task){await task.destroy();if(viewerTask===task)viewerTask=null;}}
}
itemViewer.addEventListener('keydown',e=>{if(e.key==='Escape'){e.stopPropagation();closeItem();}});
function manage(a){dialog(esc(a.name),`<form id="name-form"><input aria-label="Album name" value="${esc(a.name)}" maxlength="30" required><button>Save</button></form>`,{compact:true});document.querySelector('#name-form').onsubmit=e=>{e.preventDefault();const v=e.target.querySelector('input').value.trim();if(!v)return;a.name=v;render();close();};}
function nativePick(a){target=a;const input=document.querySelector('#vault-files');input.accept={Photos:'image/jpeg,image/png,image/webp,image/heic',Videos:'video/*',GIF:'image/gif',PDF:'application/pdf'}[a.category];input.click();}
function pick(a){if(!unlocked)return;sheet.hidden=true;if(a.category==='PDF')showPicker(a);else requestPhotos(()=>showPicker(a));}
let selectedAlbum=albums[0]?.id;
const sheet=document.createElement('div');sheet.className='vault-add-overlay';sheet.hidden=true;stage.append(sheet);
function hideAdd(){sheet.hidden=true;document.querySelector('.add-files').focus();}
function openAdd(){
 if(!unlocked)return;
 if(!albums.length){sheet.hidden=false;createAlbum();return;}
 if(!albums.some(a=>a.id===selectedAlbum))selectedAlbum=albums[0]?.id;
 sheet.innerHTML=`<section class="vault-add-sheet" role="dialog" aria-modal="true" aria-labelledby="vault-add-title"><div class="sheet-handle" aria-hidden="true"></div><header><h2 id="vault-add-title">Add to Vault</h2><button class="sheet-cancel">Cancel</button></header><div class="sheet-album-heading"><h3>Choose an album</h3><button class="sheet-new">New album</button></div><div class="sheet-albums" role="radiogroup" aria-label="Choose an album">${albums.map(a=>`<label class="sheet-album ${a.id===selectedAlbum?'selected':''}"><input type="radio" name="destination" value="${a.id}" ${a.id===selectedAlbum?'checked':''}><div class="sheet-thumbnail ${a.password?'locked':''}">${a.password?'<img src="assets/vault-lock.png" alt="">':coverFile(a)?`<img class="pdf" src="${coverFile(a).thumbnail}" alt="">`:mediaCover(a)?`<img src="${esc(mediaCover(a))}" alt="">`:'<span>Empty</span>'}</div><div class="sheet-album-copy"><strong>${esc(a.name)}</strong><span>${a.password?'Locked':`${a.category} · ${a.files.length} item${a.files.length===1?'':'s'}`}</span></div><span class="sheet-radio" aria-hidden="true"></span></label>`).join('')}</div><p class="sheet-help">Select an album, then choose what to add.</p><button class="sheet-add" ${albums.length?'':'disabled'}>Add item</button><div class="sheet-home-indicator" aria-hidden="true"></div></section>`;
 sheet.hidden=false;
 sheet.querySelector('.sheet-cancel').onclick=hideAdd;
 sheet.querySelector('.sheet-new').onclick=createAlbum;
 sheet.querySelectorAll('input[name="destination"]').forEach(r=>r.onchange=()=>{selectedAlbum=Number(r.value);sheet.querySelectorAll('.sheet-album').forEach(row=>row.classList.toggle('selected',row.querySelector('input').checked));});
 sheet.querySelector('.sheet-add').onclick=()=>{const a=albums.find(a=>a.id===selectedAlbum);if(a)authenticate(a,pick);};
 sheet.querySelector('.sheet-cancel').focus();
}
sheet.addEventListener('click',e=>{if(e.target===sheet)hideAdd();});
document.addEventListener('keydown',e=>{if(sheet.hidden||!document.querySelector('.modal-backdrop').hidden)return;if(e.key==='Escape')hideAdd();if(e.key==='Tab'){const focusable=[...sheet.querySelectorAll('button:not(:disabled),input:not([type=radio]):not(:disabled),input[type=radio]:checked')];const first=focusable[0],last=focusable.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}});
document.querySelector('.add-files').onclick=openAdd;
document.querySelector('#vault-files').onchange=async e=>{if(!target||!e.target.files.length)return;const destination=target;if(!unlocked)return;picker.hidden=true;sheet.hidden=true;const selected=[...e.target.files].filter(f=>/^(image\/|video\/|application\/pdf$)/.test(f.type)||/\.pdf$/i.test(f.name));e.target.value='';if(selected.some(f=>(f.type==='image/gif'?'GIF':f.type.startsWith('image/')?'Photos':f.type.startsWith('video/')?'Videos':'PDF')!==destination.category)){dialog('Choose '+destination.category,'<p>This album accepts '+destination.category+' only.</p>');return;}if(!selected.length){dialog('Unsupported file','<p>Choose photos, videos, GIFs or PDFs.</p>');return;}dialog('Adding files','<p>Preparing previews…</p>');const added=await Promise.all(selected.map(async f=>{const type=f.type==='image/gif'?'GIF':f.type.startsWith('image/')?'Photos':f.type.startsWith('video/')?'Videos':'PDF';const item={name:f.name,type,size:f.size,url:await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=reject;reader.readAsDataURL(f);})};if(type==='PDF'){try{item.thumbnail=await(await pdfCoverReady)(await f.arrayBuffer());}catch{item.coverFailed=true;}}return item;}));if(!unlocked||!albums.includes(destination))return;destination.files.push(...added);filter='All';syncFilter();render();showAlbum(destination);};
function createAlbum(){
 let category='';
 sheet.innerHTML=`<section class="vault-add-sheet vault-create-sheet" role="dialog" aria-modal="true" aria-labelledby="new-album-title"><div class="sheet-handle" aria-hidden="true"></div><header><h2 id="new-album-title">New album</h2><button class="sheet-cancel" type="button">Cancel</button></header><form id="create-album"><h3 class="create-label">Choose a category</h3><div class="album-categories" role="radiogroup" aria-label="Album category">${['Photos','Videos','GIF','PDF'].map(type=>`<label class="album-category"><input type="radio" name="category" value="${type}" required><span>${type}</span><i class="sheet-radio" aria-hidden="true"></i></label>`).join('')}</div><div class="album-name-field" hidden><label class="create-label" for="new-album-name">Album name</label><input id="new-album-name" name="album-name" placeholder="Enter album name" maxlength="30" required disabled autocomplete="off"></div><button class="sheet-add" type="submit" disabled>Create album</button></form><div class="sheet-home-indicator" aria-hidden="true"></div></section>`;
 sheet.querySelector('.sheet-cancel').onclick=openAdd;
 const nameInput=sheet.querySelector('#new-album-name'),submit=sheet.querySelector('.sheet-add');
 const validate=()=>submit.disabled=!category||!nameInput.value.trim();
 sheet.querySelectorAll('[name=category]').forEach(input=>input.onchange=()=>{category=input.value;sheet.querySelectorAll('.album-category').forEach(row=>row.classList.toggle('selected',row.querySelector('input').checked));sheet.querySelector('.album-name-field').hidden=false;nameInput.disabled=false;validate();});
 nameInput.oninput=validate;
 sheet.querySelector('#create-album').onsubmit=e=>{e.preventDefault();const name=nameInput.value.trim();if(!category||!name)return;const album={id:Date.now(),name,category,mediaType:category,cover:null,files:[],password:''};albums.push(album);selectedAlbum=album.id;filter='All';syncFilter();render();openAdd();sheet.querySelector('input:checked').closest('.sheet-album').scrollIntoView({block:'nearest'});};
 sheet.querySelector('.sheet-cancel').focus();
}
// Entry lock, permission and picker UI belong to the prototype, not native iOS APIs.
const gate=document.createElement('section');gate.className='vault-gate';stage.append(gate);
const permissionOverlay=document.createElement('div');permissionOverlay.className='ios-permission-overlay';permissionOverlay.hidden=true;stage.append(permissionOverlay);
const picker=document.createElement('section');picker.className='ios-item-picker';picker.hidden=true;stage.append(picker);
const controls=document.createElement('aside');controls.className='vault-prototype-controls';controls.innerHTML='<button id="vault-reset">清空所有</button><button id="vault-seed" disabled>模拟添加多个 item</button><p aria-live="polite">请先设置密码并解锁</p>';
let firstPin='',gateStep='',pendingPermission=null;
function showGate(){
 unlocked=false;firstPin='';gateStep=vaultState.pin?'unlock':'create';
 close();sheet.hidden=true;permissionOverlay.hidden=true;picker.hidden=true;
 if(!itemViewer.hidden)closeItem();if(currentAlbum)exitAlbum();
 stage.querySelector('main').inert=true;gate.hidden=false;controls.querySelector('#vault-seed').disabled=true;
 controls.querySelector('p').textContent=vaultState.pin?'解锁后可模拟添加':'请先设置密码并解锁';drawGate();
}
function drawGate(){
 const title={create:'Create passcode',confirm:'Confirm passcode',unlock:'Unlock Vault'}[gateStep];
 gate.innerHTML=`<h2>${title}</h2><form id="vault-pin-form"><div class="vault-pin-dots" aria-hidden="true">${Array.from({length:6},()=>'<span></span>').join('')}</div><input id="vault-pin" type="password" inputmode="numeric" autocomplete="off" maxlength="6" pattern="[0-9]{6}" aria-label="6-digit passcode" required><p class="pin-error" role="status"></p><div class="vault-keypad">${['1','2','3','4','5','6','7','8','9','Back','0','Delete'].map(n=>n==='Back'?'<span aria-hidden="true"></span>':`<button type="button" data-digit="${n}">${n}</button>`).join('')}</div><button class="vault-pin-submit" type="submit">${gateStep==='unlock'?'Unlock':'Continue'}</button></form>`;
 const input=gate.querySelector('input');const error=gate.querySelector('.pin-error');
 const syncDots=()=>gate.querySelectorAll('.vault-pin-dots span').forEach((dot,i)=>dot.classList.toggle('filled',i<input.value.length));
 input.oninput=()=>{input.value=input.value.replace(/\D/g,'').slice(0,6);error.textContent='';syncDots();};
 gate.querySelectorAll('[data-digit]').forEach(b=>b.onclick=()=>{if(b.dataset.digit==='Back'){if(gateStep==='confirm'){firstPin='';gateStep='create';drawGate();}else{location.href='index.html';}return;}input.value=b.dataset.digit==='Delete'?input.value.slice(0,-1):(input.value+b.dataset.digit).slice(0,6);error.textContent='';syncDots();});
 gate.querySelector('form').onsubmit=e=>{e.preventDefault();const pin=input.value;if(!/^\d{6}$/.test(pin)){showToast('Enter a 6-digit passcode.');return;}
 if(gateStep==='create'){firstPin=pin;gateStep='confirm';drawGate();return;}
 if(gateStep==='confirm'&&pin!==firstPin){showToast('Passcodes don’t match. Try again.');input.value='';syncDots();return;}
 if(gateStep==='unlock'&&pin!==vaultState.pin){try{const key='sentry-intruder-log-v1';let log=JSON.parse(localStorage.getItem(key)||'[]');if(!Array.isArray(log))log=[];log.unshift({time:Date.now(),method:'passcode'});localStorage.setItem(key,JSON.stringify(log.slice(0,100)));}catch{}showToast('Incorrect passcode. Try again.');input.value='';syncDots();return;}
 if(gateStep==='confirm'){vaultState.pin=pin;persist();}unlocked=true;gate.hidden=true;stage.querySelector('main').inert=false;controls.querySelector('#vault-seed').disabled=false;controls.querySelector('p').textContent='已解锁';render();};
}
function requestPhotos(next){
 if(vaultState.permission==='all'||vaultState.permission==='limited'){next();return;}
 pendingPermission=next;permissionOverlay.hidden=false;
 if(vaultState.permission==='denied'){
 permissionOverlay.innerHTML='<section class="ios-alert" role="dialog" aria-modal="true"><h2>Photo Access Is Off</h2><p>Allow photo access to add photos and videos to your Vault.</p><div class="ios-alert-actions"><button data-access="cancel">Not Now</button><button data-access="settings">Settings</button></div></section>';
 }else permissionOverlay.innerHTML='<section class="ios-alert" role="dialog" aria-modal="true"><h2>“SentryOK” Would Like to Access Your Photos</h2><p>Add photos and videos to your private Vault.</p><button data-access="limited">Select Photos…</button><button data-access="all">Allow Access to All Photos</button><button data-access="denied">Don’t Allow</button></section>';
 permissionOverlay.querySelectorAll('[data-access]').forEach(b=>b.onclick=()=>{const action=b.dataset.access;
 if(action==='cancel'){permissionOverlay.hidden=true;pendingPermission=null;return;}
 if(action==='settings'){permissionOverlay.innerHTML='<section class="ios-alert" role="dialog" aria-modal="true"><h2>Photo Access</h2><p>Choose what SentryOK can access.</p><button data-choice="limited">Selected Photos</button><button data-choice="all">All Photos</button><button data-choice="denied">None</button></section>';permissionOverlay.querySelectorAll('[data-choice]').forEach(button=>button.onclick=()=>finishPermission(button.dataset.choice));return;}
 finishPermission(action);
 });
}
function finishPermission(value){vaultState.permission=value;persist();permissionOverlay.hidden=true;const next=pendingPermission;pendingPermission=null;if(value!=='denied'&&unlocked)next?.();}
function showPicker(a,onComplete,available){
 const samples=available||sampleAlbums.find(x=>x.category===a.category)?.files||[];const chosen=new Set();picker.hidden=false;
 picker.innerHTML=`<header><button data-picker-cancel>Cancel</button><h2>${a.category==='PDF'?'Files':a.category==='Videos'?'Videos':'Photos'}</h2><button data-picker-add disabled>Add</button></header><div class="picker-source"><strong>${a.category==='PDF'?'Recents':vaultState.permission==='limited'?'Select Photos':'Library'}</strong><button data-browse>Browse ${a.category==='PDF'?'files':'device'}…</button></div><div class="picker-grid ${a.category==='PDF'?'picker-documents':''}">${samples.map((f,i)=>`<button class="picker-item" data-pick="${i}" aria-pressed="false"><img src="${esc(f.thumbnail||f.url)}" alt="${esc(f.name)}"><span>${esc(f.name)}</span></button>`).join('')}</div><footer><span data-picker-count>Select items</span><p>${a.category==='PDF'?'Only selected files will be added.':'Choose the items to add to your Vault.'}</p></footer>`;
 picker.querySelector('[data-picker-cancel]').onclick=()=>{picker.hidden=true;};
 picker.querySelector('[data-browse]').onclick=()=>nativePick(a);
 picker.querySelectorAll('[data-pick]').forEach(b=>b.onclick=()=>{const i=+b.dataset.pick;chosen.has(i)?chosen.delete(i):chosen.add(i);b.classList.toggle('selected',chosen.has(i));b.setAttribute('aria-pressed',String(chosen.has(i)));picker.querySelector('[data-picker-add]').disabled=!chosen.size;picker.querySelector('[data-picker-count]').textContent=chosen.size?`${chosen.size} selected`:'Select items';});
 picker.querySelector('[data-picker-add]').onclick=()=>{if(!unlocked||!chosen.size)return;const added=[...chosen].map(i=>({...samples[i]}));picker.hidden=true;if(onComplete){onComplete(added);return;}a.files.push(...added);render();showAlbum(a);};
}
controls.querySelector('#vault-reset').onclick=()=>{
 permissionOverlay.hidden=true;picker.hidden=true;sheet.hidden=true;pendingPermission=null;
 vaultState={pin:'',permission:'unknown',albums:[]};albums=[];filter='All';sorted=false;selectedItems.clear();selectedAlbum=null;target=null;persist();syncFilter();showGate();render();
};
controls.querySelector('#vault-seed').onclick=()=>{
 if(!unlocked)return;
 const add=(selection=null)=>{if(!unlocked)return;for(const category of ['Photos','Videos','GIF','PDF']){const sample=sampleAlbums.find(a=>a.category===category);const files=selection&&category!=='PDF'?selection.filter(f=>f.type===category):sample.files;if(!files.length)continue;let album=albums.find(a=>a.category===category);if(!album){album={id:Date.now()+albums.length,name:{Photos:'Photos',Videos:'Videos',GIF:'GIFs',PDF:'Documents'}[category],category,mediaType:category,cover:sample.cover,password:'',files:[]};albums.push(album);}album.files.push(...files.map(f=>({...f})));}filter='All';syncFilter();render();if(currentAlbum)showAlbum(currentAlbum);controls.querySelector('p').textContent=selection?'已添加选中内容及 PDF':'已添加四类示例内容';};
 add();
};
window.addEventListener('pagehide',()=>{showGate();});window.addEventListener('pageshow',e=>{if(e.persisted)showGate();});
showGate();
if(sessionStorage.getItem('sentry-seed-vault')){sessionStorage.removeItem('sentry-seed-vault');vaultState.pin=vaultState.pin||'123456';vaultState.permission='all';albums=JSON.parse(JSON.stringify(sampleAlbums));persist();unlocked=true;gate.hidden=true;stage.querySelector('main').inert=false;controls.querySelector('#vault-seed').disabled=false;}
function syncFilter(){document.querySelectorAll('[data-filter]').forEach(b=>{const on=b.dataset.filter===filter;b.classList.toggle('selected',on);b.setAttribute('aria-pressed',String(on));});}
document.querySelectorAll('[data-filter]').forEach(b=>b.onclick=()=>{filter=b.dataset.filter;syncFilter();render();});document.querySelector('.sort-control').onclick=()=>{if(sorted)reverse=!reverse;sorted=true;render();};render();

})();
