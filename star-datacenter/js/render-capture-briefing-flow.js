/* ══════════════════════════════════════════════════════════════
   렌더캡처 - 캔버스 생성/미리보기/저장 플로우 (render-capture-utils.js 에서 분리, 2026-07-30)
   ══════════════════════════════════════════════════════════════ */

async function _briefGenerateCanvas(mode, meta){
  const ctx = window._b2BriefingExportCtx;
  if(!ctx) throw new Error('브리핑 데이터를 아직 불러오지 못했습니다. 브리핑 화면을 한 번 연 뒤 다시 시도해주세요.');
  if(mode === 'basic') return await _basicCaptureBase();
  const cfg = _briefModeConfig(mode);
  const holder=document.createElement('div');
  // html2canvas는 뷰포트 밖(left:-99999px)에 있는 콘텐츠를 렌더 윈도우 밖으로 취급해
  // 잘라내는 경우가 있어, 실제 좌표(0,0)에 두고 opacity:0으로 화면에는 보이지 않게 처리한다.
  holder.style.cssText='position:fixed;left:0;top:0;opacity:0;pointer-events:none;z-index:-1';
  holder.innerHTML = `<style>${cfg.css()}</style>` + cfg.buildHtml(ctx, meta);
  document.body.appendChild(holder);
  try{
    const sheet=holder.querySelector('.'+cfg.sheetClass);
    await _imgToDataUrls(sheet);
    try{ if(typeof _waitForImages==='function') await _waitForImages(sheet,1500); }catch(e){}
    try{ await _waitForFonts(2000); }catch(e){}
    _sanitizeUnsupportedCssFunctions(sheet);
    const w=cfg.width;
    const h=cfg.fixedHeight || Math.max(1, Math.ceil(sheet.scrollHeight||0));
    const scale = _safeExportScale(w, h, cfg.scale);
    const canvas=await html2canvas(sheet,{
      backgroundColor:cfg.bg, scale:scale, useCORS:true, allowTaint:false, logging:false,
      imageTimeout:20000, width:w, height:h, windowWidth:w+80, windowHeight:h+80, scrollX:0, scrollY:0,
      onclone:(clonedDoc)=>{
        _sanitizeUnsupportedColorsInDoc(clonedDoc);
        try{ _forceResolveComputedColors(clonedDoc.querySelector('.'+cfg.sheetClass)); }catch(e){}
        try{ _fixGradientTextClipInDoc(clonedDoc.querySelector('.'+cfg.sheetClass)); }catch(e){}
        try{ _killCloneAnimations(clonedDoc); }catch(e){}
      }
    });
    return canvas;
  } finally {
    try{ if(holder.parentNode) holder.parentNode.removeChild(holder); }catch(e){}
  }
}

function _briefFilename(mode, meta){
  const cfg = _briefModeConfig(mode);
  const rawName=`브리핑_${cfg.label}_${meta.presetLabel}_${String(window._b2WeeklyDateFrom||'').slice(0,10)}_${String(window._b2WeeklyDateTo||'').slice(0,10)}${meta.univ!=='전체'?'_'+meta.univ:''}.png`;
  return rawName.replace(/[\\/:*?"<>|]+/g,'_');
}

/* ─── 미리보기 모달 스타일 (1회 주입) — render-capture-utils.js는 항상 로드되는
   core 번들이므로, 통계탭 전용 스타일(pr-report-style, lazy 로드)에 기대지 않고
   자체 클래스로 완전히 독립시킨다. ─── */
function _briefInjectPreviewCss(){
  if(document.getElementById('brief-preview-style')) return;
  const s=document.createElement('style');
  s.id='brief-preview-style';
  s.textContent = `
    .brief-img-preview-overlay{position:fixed;inset:0;background:rgba(15,23,42,.62);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px;backdrop-filter:blur(2px)}
    .brief-img-preview-modal{background:var(--white);border-radius:20px;box-shadow:var(--sh3);max-width:min(1440px,96vw);max-height:94vh;display:flex;flex-direction:column;overflow:hidden}
    .brief-img-preview-hdr{display:flex;align-items:center;justify-content:space-between;padding:14px 18px;border-bottom:1px solid var(--border);font-size:14px;font-weight:900;color:var(--text1);flex-shrink:0}
    .brief-img-preview-x{border:none;background:transparent;font-size:15px;cursor:pointer;color:var(--text2);padding:4px 8px;border-radius:8px}
    .brief-img-preview-x:hover{background:var(--surface);color:var(--text1)}
    .brief-mode-row{display:flex;gap:6px;padding:10px 18px;border-bottom:1px solid var(--border);overflow-x:auto;flex-wrap:wrap;flex-shrink:0}
    .brief-mode-btn{border:1.5px solid var(--border2);background:var(--white);color:var(--text2);font-size:12px;font-weight:800;padding:7px 13px;border-radius:999px;cursor:pointer;white-space:nowrap;transition:.12s}
    .brief-mode-btn:hover{border-color:var(--blue)}
    .brief-mode-btn.on{background:var(--blue);border-color:var(--blue);color:#fff}
    .brief-img-preview-body{flex:1;min-height:0;overflow:auto;padding:14px;background:var(--surface);display:flex;justify-content:center;align-items:flex-start;position:relative}
    .brief-img-preview-body img{width:100%;max-width:100%;height:auto;flex-shrink:0;display:block;transition:opacity .15s}
    /* '기본' 모드처럼 페이지 전체를 그대로 캡처하면 이미지가 세로로 매우 길어져,
       기본값(width:100%)으로는 계속 스크롤해야 전체를 확인할 수 있었다.
       기본은 "화면에 맞춰 축소해서 한눈에 보기"로 하고, 원본 크기로 보고 싶을 때만
       버튼으로 전환하도록 분리한다. */
    .brief-img-preview-body.fit-mode{align-items:center}
    .brief-img-preview-body.fit-mode img{width:auto;height:auto;max-width:100%;max-height:100%;object-fit:contain}
    .brief-fit-toggle{border:1.5px solid var(--border2);background:var(--white);color:var(--text2);font-size:12px;font-weight:800;padding:7px 12px;border-radius:999px;cursor:pointer;white-space:nowrap;margin-left:auto}
    .brief-fit-toggle:hover{border-color:var(--blue)}
    .brief-img-preview-ftr{display:flex;justify-content:flex-end;gap:8px;padding:12px 18px;border-top:1px solid var(--border);flex-shrink:0}
    .brief-loading .brief-img-preview-body img{opacity:.35}
    .brief-loading .brief-img-preview-body::after{content:"이미지 생성 중...";position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:12px;font-weight:800;color:var(--text2);background:var(--white);padding:8px 14px;border-radius:999px;box-shadow:var(--sh2,0 4px 14px rgba(0,0,0,.1))}
    .brief-btn{border:none;border-radius:10px;padding:9px 16px;font-size:13px;font-weight:800;cursor:pointer}
    .brief-btn-ghost{background:var(--surface);color:var(--text2)}
    .brief-btn-ghost:hover{background:var(--border)}
    .brief-btn-primary{background:var(--blue);color:#fff}
    .brief-btn-primary:hover{background:var(--blue-d,var(--blue))}
  `;
  document.head.appendChild(s);
}

function _briefShowImagePreview(canvas, mode, meta){
  _briefInjectPreviewCss();
  _briefCloseImagePreview();
  const dataUrl = canvas.toDataURL('image/png');
  const wrap=document.createElement('div');
  wrap.id='brief-img-preview-overlay';
  wrap.className='brief-img-preview-overlay';
  wrap.innerHTML = `
    <div class="brief-img-preview-modal">
      <div class="brief-img-preview-hdr">
        <span>📰 브리핑 이미지 미리보기</span>
        <button type="button" class="brief-img-preview-x" onclick="_briefCloseImagePreview()">✕</button>
      </div>
      <div class="brief-mode-row">
        ${BRIEF_MODES.map(([k,lbl])=>`<button type="button" class="brief-mode-btn ${k===mode?'on':''}" data-mode="${k}" onclick="_briefSwitchMode('${k}')">${lbl}</button>`).join('')}
        <button type="button" class="brief-fit-toggle" onclick="_briefTogglePreviewFit()">🔍 원본 크기로 보기</button>
      </div>
      <div class="brief-img-preview-body fit-mode"><img src="${dataUrl}" alt="브리핑 미리보기"></div>
      <div class="brief-img-preview-ftr">
        <button type="button" class="brief-btn brief-btn-ghost" onclick="_briefCloseImagePreview()">취소</button>
        <button type="button" class="brief-btn brief-btn-primary" onclick="_briefConfirmSaveImage()">📥 다운로드</button>
      </div>
    </div>`;
  wrap.addEventListener('click', (e)=>{ if(e.target===wrap) _briefCloseImagePreview(); });
  document.body.appendChild(wrap);
}
function _briefCloseImagePreview(){
  const el = document.getElementById('brief-img-preview-overlay');
  if(el) el.remove();
}
// 화면맞춤(축소해서 한번에 보기) ↔ 원본 크기(가로 100%, 세로 스크롤) 전환.
// '기본' 모드처럼 세로로 매우 긴 이미지를 처음부터 원본 크기로 띄우면 계속 스크롤해야
// 전체를 확인할 수 있어, 기본은 화면맞춤으로 시작하고 필요할 때만 원본 크기로 바꾼다.
function _briefTogglePreviewFit(){
  const body = document.querySelector('#brief-img-preview-overlay .brief-img-preview-body');
  const btn = document.querySelector('#brief-img-preview-overlay .brief-fit-toggle');
  if(!body) return;
  const nowFit = body.classList.toggle('fit-mode');
  if(btn) btn.textContent = nowFit ? '🔍 원본 크기로 보기' : '🗗 화면에 맞추기';
}
async function _briefSwitchMode(mode){
  if(window._briefSwitchBusy) return;
  window._briefSwitchBusy = true;
  const wrap = document.getElementById('brief-img-preview-overlay');
  if(wrap) wrap.classList.add('brief-loading');
  try{
    const meta = window._briefPendingMeta || _getBriefingExportMeta();
    const canvas = await _briefGenerateCanvas(mode, meta);
    window._briefPendingCanvas = canvas;
    window._briefLastMode = mode;
    const imgEl = wrap ? wrap.querySelector('.brief-img-preview-body img') : null;
    if(imgEl) imgEl.src = canvas.toDataURL('image/png');
    if(wrap) wrap.querySelectorAll('.brief-mode-btn').forEach(b=>b.classList.toggle('on', b.dataset.mode===mode));
  }catch(e){ alert('모드 전환 오류: '+e.message); }
  finally{ window._briefSwitchBusy = false; if(wrap) wrap.classList.remove('brief-loading'); }
}
async function _briefConfirmSaveImage(){
  const canvas = window._briefPendingCanvas;
  const meta = window._briefPendingMeta || _getBriefingExportMeta();
  const mode = window._briefLastMode || 'basic';
  _briefCloseImagePreview();
  if(!canvas) return;
  try{
    if(typeof _showSaveLoading==='function') _showSaveLoading();
    await _saveCanvasImage(canvas, _briefFilename(mode, meta), 'png');
  }catch(e){ alert('이미지 저장 오류: '+e.message); }
  finally{
    if(typeof _hideSaveLoading==='function') _hideSaveLoading();
    window._briefPendingCanvas = null;
  }
}

// 브리핑 저장 — 화면을 그대로 캡처하지 않고(그리드 레이아웃이 깨지거나 헤더만
// 캡처되는 등 html2canvas 호환성 문제가 있었음), 별도 레이아웃으로 렌더링해서
// 안정적으로 캡처한다. 저장 직전에 항상 미리보기 모달을 띄워, 모달 안에서
// 기본/신문기사/포스터/미니멀 중 원하는 모드로 바꿔보고 다운로드할 수 있다.
async function captureBriefingArticle(){
  try{
    _showSaveLoading();
    try{ await (window.ensureHtml2Canvas && window.ensureHtml2Canvas()); }catch(e){}
    if(typeof html2canvas!=='function') throw new Error('html2canvas를 불러오지 못했습니다.');
    const meta = _getBriefingExportMeta();
    const mode = window._briefLastMode || 'basic';
    const canvas = await _briefGenerateCanvas(mode, meta);
    window._briefPendingCanvas = canvas;
    window._briefPendingMeta = meta;
    window._briefLastMode = mode;
    _briefShowImagePreview(canvas, mode, meta);
  }catch(e){alert('브리핑 이미지 저장 오류: '+e.message);}
  finally{ _hideSaveLoading(); }
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
        + '<p style="color:#fff;font-family:sans-serif;padding:12px;font-size:var(--fs-base)">이미지를 길게 눌러 저장하세요 📥</p>'
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
  window.captureBriefingArticle = captureBriefingArticle;
  window._saveCanvasImage = _saveCanvasImage;
  window._downloadCanvasImage = _downloadCanvasImage;
  window._briefSwitchMode = _briefSwitchMode;
  window._briefCloseImagePreview = _briefCloseImagePreview;
  window._briefConfirmSaveImage = _briefConfirmSaveImage;
  window._briefTogglePreviewFit = _briefTogglePreviewFit;
}catch(e){}
