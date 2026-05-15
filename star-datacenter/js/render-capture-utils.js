/* ══════════════════════════════════════
   Render Capture Utilities
══════════════════════════════════════ */
function _showSaveLoading(){
  let t=document.getElementById('_save-toast');
  if(!t){
    t=document.createElement('div');
    t.id='_save-toast';
    t.style.cssText='position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:rgba(15,23,42,.88);color:#fff;padding:10px 22px;border-radius:24px;font-size:13px;font-weight:700;z-index:99999;display:none;align-items:center;gap:8px;backdrop-filter:blur(6px);font-family:"Noto Sans KR",sans-serif;white-space:nowrap;box-shadow:0 4px 20px rgba(0,0,0,.3)';
    document.body.appendChild(t);
  }
  t.innerHTML='<span style="display:inline-block;animation:_spin .8s linear infinite">⏳</span> 저장 중...';
  t.style.display='flex';
  if(!document.getElementById('_spin-style')){
    const s=document.createElement('style');s.id='_spin-style';
    s.textContent='@keyframes _spin{to{transform:rotate(360deg)}}';
    document.head.appendChild(s);
  }
}
function _hideSaveLoading(){
  const t=document.getElementById('_save-toast');
  if(t) t.style.display='none';
}

async function capturePlayerModal(){
  const body=document.getElementById('playerModalBody');
  if(!body){alert('캡처할 영역이 없습니다.');return;}
  const st = (typeof getPlayerDetailState==='function') ? getPlayerDetailState() : (window.PlayerDetailState||{});
  try{
    _showSaveLoading();
    try{ await (window.ensureHtml2Canvas && window.ensureHtml2Canvas()); }catch(e){}
    await _imgToDataUrls(body);
    try{ if(typeof _waitForImages==='function') await _waitForImages(body,1500); }catch(e){}
    const canvas=await html2canvas(body,{backgroundColor:'#ffffff',scale:2,useCORS:true,allowTaint:false,logging:false,imageTimeout:15000});
    await _saveCanvasImage(canvas,`${st.currentName||'player'}_stat.png`,'png');
  }catch(e){alert('이미지 저장 오류: '+e.message);}
  finally{_hideSaveLoading();}
}

async function captureUnivModal(){
  const body=document.getElementById('univModalBody');
  const title=document.getElementById('univModalTitle');
  if(!body){alert('캡처할 영역이 없습니다.');return;}
  try{
    _showSaveLoading();
    try{ await (window.ensureHtml2Canvas && window.ensureHtml2Canvas()); }catch(e){}
    await _imgToDataUrls(body);
    try{ if(typeof _waitForImages==='function') await _waitForImages(body,1500); }catch(e){}
    const canvas=await html2canvas(body,{backgroundColor:'#ffffff',scale:2,useCORS:true,allowTaint:false,logging:false,imageTimeout:15000});
    await _saveCanvasImage(canvas,`${title?title.innerText.replace('🏛️ ',''):'univ'}_대학정보.png`,'png');
  }catch(e){alert('이미지 저장 오류: '+e.message);}
  finally{_hideSaveLoading();}
}

async function captureDetail(id, filename){
  const el=document.getElementById(id);
  if(!el){alert('캡처할 영역이 없습니다.');return;}
  try{
    _showSaveLoading();
    try{ await (window.ensureHtml2Canvas && window.ensureHtml2Canvas()); }catch(e){}
    await _imgToDataUrls(el);
    try{ if(typeof _waitForImages==='function') await _waitForImages(el,1500); }catch(e){}
    const canvas=await html2canvas(el,{backgroundColor:'#ffffff',scale:2,useCORS:true,allowTaint:false,logging:false,imageTimeout:15000});
    await _saveCanvasImage(canvas,`경기상세_${filename}.png`,'png');
  }catch(e){alert('이미지 저장 오류: '+e.message);}
  finally{_hideSaveLoading();}
}

async function _downloadCanvasImage(canvas, filename, mimeType, quality){
  return new Promise((resolve) => {
    try {
      canvas.toBlob(function(blob){
        if(!blob){ resolve(false); return; }
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(()=>{ document.body.removeChild(a); URL.revokeObjectURL(url); }, 300);
        resolve(true);
      }, mimeType, quality);
    } catch(e) { resolve(false); }
  });
}
async function _saveCanvasImage(canvas, filename, fmt){
  const mime = fmt==='jpg' ? 'image/jpeg' : 'image/png';
  const q = fmt==='jpg' ? 0.95 : undefined;
  const ok = await _downloadCanvasImage(canvas, filename, mime, q);
  if(!ok){
    const dataUrl = fmt==='jpg' ? canvas.toDataURL('image/jpeg', 0.95) : canvas.toDataURL('image/png');
    const w = window.open('', '_blank');
    if(w){
      w.document.write('<html><body style="margin:0;background:#111">'
        + '<p style="color:#fff;font-family:sans-serif;padding:12px;font-size:13px">이미지를 길게 눌러 저장하세요 📥</p>'
        + '<img src="' + dataUrl + '" style="max-width:100%;display:block">'
        + '</body></html>');
    } else {
      window.location.href = fmt==='jpg' ? canvas.toDataURL('image/jpeg', 0.95) : canvas.toDataURL('image/png');
    }
  }
}

try{
  window.capturePlayerModal = capturePlayerModal;
  window.captureUnivModal = captureUnivModal;
  window.captureDetail = captureDetail;
  window._saveCanvasImage = _saveCanvasImage;
  window._downloadCanvasImage = _downloadCanvasImage;
}catch(e){}
