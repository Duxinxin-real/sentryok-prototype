// Reuse the same approved artwork on all pages, with uniform visible bounds.
window.renderBottomNav=function(active){
 const metrics={"check-nav-0.png": {"w": 67.03, "h": 72.121, "left": 55.061, "top": 8.818}, "home-nav-1.png": {"w": 72.211, "h": 70.737, "left": 53.263, "top": 11.632}, "check-nav-2.png": {"w": 71.045, "h": 71.045, "left": 54.313, "top": 9.388}, "check-nav-3.png": {"w": 75.515, "h": 75.515, "left": 46.576, "top": 7.121}, "home-nav-0.png": {"w": 64.438, "h": 70.575, "left": 57.164, "top": 11.329}, "check-nav-1.png": {"w": 80.889, "h": 77.333, "left": 47.667, "top": 5.667}, "vault-nav-2.png": {"w": 66.889, "h": 68.444, "left": 55.556, "top": 13.944}, "you-nav-3.png": {"w": 68.986, "h": 71.42, "left": 47.203, "top": 13.319}};
 const inactive=['check-nav-0.png','home-nav-1.png','check-nav-2.png','check-nav-3.png'];
 const selected=['home-nav-0.png','check-nav-1.png','vault-nav-2.png','you-nav-3.png'];
 return `<nav class="nav shared-nav" aria-label="Main navigation">${[0,2,1,3].map(i=>{const label=['Sentry','Browser','Vault','You'][i];const file=(i===active?selected:inactive)[i],m=metrics[file];return `<a href="${['index','check','vault','you'][i]}.html" ${i===active?'class="active" aria-current="page"':''}><img src="assets/${file}" alt="" style="width:${m.w}px;height:${m.h}px;left:${m.left}px;top:${m.top}px"><span>${label}</span></a>`;}).join('')}<span class="indicator" aria-hidden="true"></span></nav>`;
};

// One viewport policy for all tabs: scale the whole design, never stretch it.
window.fitAppViewport=function(){
 const width=Math.min(390,document.documentElement.clientWidth,window.innerHeight*390/844);
 const viewport=document.querySelector('#viewport'),screen=viewport?.querySelector('.screen');
 if(!viewport||!screen)return;
 viewport.style.width=width+'px';viewport.style.height=(width*844/390)+'px';
 screen.style.transform=`scale(${width/853},${width*844/390/1844})`;
 document.documentElement.style.setProperty('--app-preview-width',width+'px');
};
if('scrollRestoration' in history)history.scrollRestoration='manual';

addEventListener('DOMContentLoaded',()=>{const script=document.createElement('script');script.src='prototype-controls.js';document.body.append(script);});
