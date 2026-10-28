(()=>{
 // Replay on an explicit reload; ordinary tab navigation does not replay launch.
 const navigation=performance.getEntriesByType('navigation')[0];
 if(sessionStorage.getItem('sentry-launch-seen')&&navigation?.type!=='reload')return;
 sessionStorage.setItem('sentry-launch-seen','true');
 const viewport=document.querySelector('#viewport');
 const splash=document.createElement('div');splash.className='sentry-launch';splash.setAttribute('role','status');splash.setAttribute('aria-label','Opening SentryOK');
 splash.innerHTML=`<div class="sentry-launch-mark"><svg class="sentry-launch-art" viewBox="0 0 1254 1254" role="img" aria-label="SentryOK"><defs><filter id="launch-clean" x="-5%" y="-5%" width="110%" height="110%"><feComponentTransfer in="SourceAlpha"><feFuncA type="discrete" tableValues="0 0 0 1"/></feComponentTransfer><feMorphology operator="erode" radius="7"/><feMorphology operator="dilate" radius="6"/><feGaussianBlur stdDeviation=".6"/><feComposite in="SourceGraphic" operator="in"/></filter><mask id="launch-s-shape" maskUnits="userSpaceOnUse" x="0" y="0" width="1254" height="1254" style="mask-type:alpha"><image href="assets/sentryok-logo-cutout.png" width="1254" height="1254" filter="url(#launch-clean)"/></mask><mask id="launch-reveal" maskUnits="userSpaceOnUse" x="0" y="0" width="1254" height="1254"><path class="sentry-launch-stroke" d="M 950 350 C 820 145 380 165 335 400 C 260 635 965 515 925 790 C 910 1065 510 1070 300 800" pathLength="1" fill="none" stroke="white" stroke-width="430" stroke-linecap="round"/></mask></defs><g class="sentry-launch-flat" mask="url(#launch-reveal)"><rect width="1254" height="1254" fill="white" mask="url(#launch-s-shape)"/></g><image class="sentry-launch-solid" href="assets/sentryok-logo-cutout.png" width="1254" height="1254" filter="url(#launch-clean)"/></svg></div>`;
 viewport.append(splash);
 const screen=viewport.querySelector('.screen');screen.inert=true;
 let done=false;const finish=()=>{if(done)return;done=true;screen.inert=false;splash.remove();};
 splash.addEventListener('animationend',e=>{if(e.target===splash)finish();});
 setTimeout(finish,4200);
 addEventListener('pagehide',finish,{once:true});
})();
