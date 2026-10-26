window.pdfCoverReady=(async()=>{
 const load=src=>new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=src;s.onload=resolve;s.onerror=reject;document.head.append(s);});
 await load('vendor/pdf.worker.min.js');await load('vendor/pdf.min.js');
 return async bytes=>{let task;try{task=pdfjsLib.getDocument({data:new Uint8Array(bytes),isEvalSupported:false,useSystemFonts:true});const pdf=await task.promise;const page=await pdf.getPage(1);const original=page.getViewport({scale:1});const viewport=page.getViewport({scale:600/original.width});const canvas=document.createElement('canvas');canvas.width=Math.ceil(viewport.width);canvas.height=Math.ceil(viewport.height);await page.render({canvasContext:canvas.getContext('2d'),viewport,background:'white'}).promise;return canvas.toDataURL('image/png');}finally{if(task)await task.destroy();}};
})();
