(()=>{
 const panel=document.createElement('aside');panel.className='prototype-controls';panel.setAttribute('aria-label','状态测试');
 panel.innerHTML='<button data-test="reset">一键重置</button><button data-test="protection">保护开启状态</button><button data-test="vault">Vault 多文件状态</button><button data-test="browser">Browser 有记录状态</button>';
 document.body.append(panel);
 panel.querySelectorAll('button').forEach(button=>button.onclick=()=>{
  const action=button.dataset.test;
  if(action==='reset'){
   for(const storage of [localStorage,sessionStorage])for(const key of Object.keys(storage))if(/^sentry(?:ok)?[-:]/.test(key))storage.removeItem(key);
   location.href=location.pathname;return;
  }
  if(action==='protection'){
   let state={};try{state=JSON.parse(localStorage.getItem('sentry-protection-v1')||'{}')}catch{}
   Object.assign(state,{checked:true,configured:true,extensionEnabled:true,ads:true,phishing:true,redirects:true,malware:true,leak:true,email:state.email||'alex@example.com'});
   localStorage.setItem('sentry-protection-v1',JSON.stringify(state));location.href='index.html';
  }
  if(action==='vault'){sessionStorage.setItem('sentry-seed-vault','true');location.href='vault.html';}
  if(action==='browser'){localStorage.setItem('sentry-browser-records','true');location.href='check.html';}
 });
})();
