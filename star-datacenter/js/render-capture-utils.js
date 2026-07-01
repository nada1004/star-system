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

function _getBriefingExportMeta(){
  const presetMap={
    thisWeek:'이번주',
    lastWeek:'지난주',
    thisMonth:'이번달',
    lastMonth:'지난달',
    custom:'기간'
  };
  const issueDate=new Date().toISOString().slice(0,10).replace(/-/g,'.');
  const presetKey=String(window._b2WeeklyPreset||'thisWeek');
  const presetLabel=presetMap[presetKey]||'브리핑';
  const from=String(window._b2WeeklyDateFrom||'').slice(0,10).replace(/-/g,'.');
  const to=String(window._b2WeeklyDateTo||'').slice(0,10).replace(/-/g,'.');
  const univ=String(window._b2WeeklyUniv||'전체').trim()||'전체';
  return { issueDate, presetKey, presetLabel, from, to, univ };
}

function _briefingExportHeaderHtml(meta){
  const scopeLabel=meta.univ==='전체' ? '전체 대학' : `${meta.univ} 필터`;
  const editionLabel=meta.presetKey==='thisMonth' || meta.presetKey==='lastMonth' ? 'MONTHLY EDITION' : 'WEEKLY EDITION';
  return `
    <section class="b2w2-export-cover">
      <div class="b2w2-export-cover-top">
        <span>STAR DATACENTER PRESS</span>
        <span>${editionLabel}</span>
        <span>ISSUE ${meta.issueDate}</span>
      </div>
      <div class="b2w2-export-cover-grid">
        <div>
          <div class="b2w2-export-kicker">SPECIAL BRIEFING</div>
          <div class="b2w2-export-name">${meta.presetLabel} 브리핑</div>
          <div class="b2w2-export-dek">선택 기간의 활동 흐름과 핵심 지표를 기사형 레이아웃으로 재정리한 저장본입니다.</div>
        </div>
        <div class="b2w2-export-meta">
          <div class="b2w2-export-meta-label">발행일</div>
          <div class="b2w2-export-meta-value">${meta.issueDate}</div>
          <div class="b2w2-export-meta-label">집계 범위</div>
          <div class="b2w2-export-meta-value">${meta.from} - ${meta.to}</div>
          <div class="b2w2-export-meta-label">필터</div>
          <div class="b2w2-export-meta-value">${scopeLabel}</div>
        </div>
      </div>
    </section>`;
}

function _briefingExportCss(){
  return `
    .b2w2-export-sheet{
      color:#111827 !important;
      background:#ffffff !important;
      max-width:none !important;
    }
    .b2w2-export-cover{
      margin:0 0 18px;
      padding:14px 0 16px;
      border-top:6px solid #111827;
      border-bottom:3px double #111827;
      background:#ffffff;
    }
    .b2w2-export-cover-top{
      display:flex;
      align-items:center;
      justify-content:space-between;
      gap:12px;
      flex-wrap:wrap;
      font-size:10px;
      font-weight:900;
      letter-spacing:.18em;
      text-transform:uppercase;
      color:#475569;
    }
    .b2w2-export-cover-grid{
      display:grid;
      grid-template-columns:minmax(0,1fr) 240px;
      gap:18px;
      align-items:end;
      margin-top:12px;
    }
    .b2w2-export-kicker{
      font-size:10px;
      font-weight:900;
      letter-spacing:.22em;
      text-transform:uppercase;
      color:#2563eb;
    }
    .b2w2-export-name{
      margin-top:7px;
      font-family:'Noto Serif KR', Georgia, serif;
      font-size:42px;
      font-weight:900;
      letter-spacing:-.03em;
      line-height:1.02;
      color:#0f172a;
    }
    .b2w2-export-dek{
      margin-top:10px;
      max-width:780px;
      font-family:'Noto Serif KR', Georgia, serif;
      font-size:14px;
      line-height:1.7;
      color:#334155;
      font-style:italic;
    }
    .b2w2-export-meta{
      display:grid;
      grid-template-columns:74px 1fr;
      gap:7px 10px;
      padding:14px 16px;
      border:1px solid rgba(15,23,42,.14);
      background:#f8fafc;
    }
    .b2w2-export-meta-label{
      font-size:10px;
      font-weight:900;
      letter-spacing:.08em;
      text-transform:uppercase;
      color:#64748b;
    }
    .b2w2-export-meta-value{
      font-family:'Noto Serif KR', Georgia, serif;
      font-size:13px;
      font-weight:800;
      color:#0f172a;
    }
    .b2w2-export-sheet .b2w2-masthead{
      margin-bottom:12px !important;
      padding:0 0 10px !important;
    }
    .b2w2-export-sheet .b2w2-hero{
      padding:20px 0 22px !important;
      margin-bottom:18px !important;
      border-top:1px solid rgba(15,23,42,.14);
      border-bottom:3px double rgba(15,23,42,.55) !important;
      border-radius:0 !important;
      background:#ffffff !important;
      gap:18px !important;
    }
    .b2w2-export-sheet .b2w2-hero-title{
      background:none !important;
      -webkit-background-clip:initial !important;
      background-clip:initial !important;
      -webkit-text-fill-color:#0f172a !important;
      color:#0f172a !important;
      font-size:38px !important;
      line-height:1.03 !important;
    }
    .b2w2-export-sheet .b2w2-hero-desc{
      background:#f8fafc !important;
      border-left:4px solid #2563eb !important;
      color:#334155 !important;
    }
    .b2w2-export-sheet .b2w2-hero-stats,
    .b2w2-export-sheet .b2w2-kpi-card,
    .b2w2-export-sheet .b2w2-highlight-card,
    .b2w2-export-sheet .b2w2-chart-box,
    .b2w2-export-sheet .b2w2-card,
    .b2w2-export-sheet .b2w2-note-row{
      background:#ffffff !important;
      border-color:rgba(15,23,42,.12) !important;
      box-shadow:none !important;
    }
    .b2w2-export-sheet .b2w2-kpi-card{
      background:linear-gradient(180deg, #ffffff 0%, #f8fafc 100%) !important;
    }
    .b2w2-export-sheet .b2w2-kpi-card::before{
      background:var(--kpi-accent, #2563eb) !important;
    }
    .b2w2-export-sheet .b2w2-kpi-card::after,
    .b2w2-export-sheet .b2w2-highlight-card::before{
      display:none !important;
    }
    .b2w2-export-sheet .b2w2-highlight-card::after{
      background:var(--hc-top, #cbd5e1) !important;
    }
    .b2w2-export-sheet .b2w2-highlight-card:hover,
    .b2w2-export-sheet .b2w2-kpi-card:hover,
    .b2w2-export-sheet .b2w2-card:hover{
      transform:none !important;
      border-color:rgba(15,23,42,.12) !important;
    }
    .b2w2-export-sheet .b2w2-rank-delta.up{ background:#f0fdf4 !important; border-color:#bbf7d0 !important; color:#15803d !important; }
    .b2w2-export-sheet .b2w2-rank-delta.down{ background:#fef2f2 !important; border-color:#fecaca !important; color:#b91c1c !important; }
    .b2w2-export-sheet .b2w2-rank-delta.same{ background:#f8fafc !important; border-color:#e2e8f0 !important; color:#64748b !important; }
    .b2w2-export-sheet .b2w2-rank-delta.new{ background:#f5f3ff !important; border-color:#ddd6fe !important; color:#5b21b6 !important; }
    @media (max-width:900px){
      .b2w2-export-cover-grid{ grid-template-columns:1fr; }
    }`;
}

function _sanitizeUnsupportedCssFunctions(root){
  if(!root || typeof root.querySelectorAll!=='function') return;
  const scrub=(text)=>{
    return String(text||'')
      .replace(/(^|;)\s*[^;:]+:\s*[^;]*color-mix\([^;]*\)\s*;?/gi,'$1')
      .replace(/(^|;)\s*[^;:]+:\s*[^;]*color\([^;]*\)\s*;?/gi,'$1')
      .replace(/;;+/g,';')
      .replace(/^\s*;\s*/,'')
      .trim();
  };
  try{
    root.querySelectorAll('[style]').forEach((el)=>{
      const cleaned=scrub(el.getAttribute('style')||'');
      if(cleaned) el.setAttribute('style', cleaned);
      else el.removeAttribute('style');
    });
  }catch(e){}
  try{
    root.querySelectorAll('style').forEach((el)=>{
      const cleaned=scrub(el.textContent||'');
      el.textContent=cleaned;
    });
  }catch(e){}
}

function _prepareBriefingExportClone(clone, meta){
  if(!clone) return;
  clone.classList.add('b2w2-export-sheet');
  _sanitizeUnsupportedCssFunctions(clone);
  try{
    clone.querySelectorAll('.b2w2-modebar,.b2w2-hdr,.no-export').forEach(el=>el.remove());
  }catch(e){}
  try{
    const masthead=clone.querySelector('.b2w2-masthead');
    if(masthead){
      if(!clone.querySelector('.b2w2-export-cover')) masthead.insertAdjacentHTML('beforebegin', _briefingExportHeaderHtml(meta));
      masthead.remove();
    }
  }catch(e){}
}

async function captureBriefingArticle(mode){
  const root=document.getElementById('b2w2-export-root');
  if(!root){alert('캡처할 브리핑 영역이 없습니다.');return;}
  const saveMode = String(mode||'split')==='single' ? 'single' : 'split';
  let tempWrap=null;
  try{
    _showSaveLoading();
    try{ await (window.ensureHtml2Canvas && window.ensureHtml2Canvas()); }catch(e){}
    if(typeof html2canvas!=='function') throw new Error('html2canvas를 불러오지 못했습니다.');

    const rect=root.getBoundingClientRect();
    const captureWidth=Math.max(900, Math.ceil(root.scrollWidth||rect.width||900));
    const meta=_getBriefingExportMeta();
    const framePad = saveMode==='single' ? 28 : 24;
    tempWrap=document.createElement('div');
    tempWrap.style.cssText=`position:absolute;left:-99999px;top:0;width:${captureWidth + framePad*2}px;padding:${framePad}px;background:${saveMode==='single'
      ? 'radial-gradient(1200px 600px at 15% 10%, rgba(56,189,248,.16) 0%, transparent 60%),radial-gradient(900px 520px at 90% 0%, rgba(167,139,250,.14) 0%, transparent 55%),linear-gradient(180deg, #ffffff 0%, #f8fafc 55%, #ffffff 100%)'
      : '#ffffff'};box-sizing:border-box;z-index:-1`;

    const exportStyle=document.createElement('style');
    exportStyle.textContent=_briefingExportCss();
    tempWrap.appendChild(exportStyle);

    const clone=root.cloneNode(true);
    _prepareBriefingExportClone(clone, meta);
    clone.style.width='100%';
    clone.style.maxWidth='none';
    clone.style.margin='0';
    if(saveMode==='single'){
      const sheet=document.createElement('div');
      sheet.style.cssText='width:100%;border-radius:22px;overflow:hidden;background:#ffffff;box-shadow:0 18px 60px rgba(15,23,42,.18),0 2px 10px rgba(15,23,42,.10);';
      sheet.appendChild(clone);
      tempWrap.appendChild(sheet);
    } else {
      tempWrap.appendChild(clone);
    }
    document.body.appendChild(tempWrap);

    await _imgToDataUrls(tempWrap);
    try{ if(typeof _waitForImages==='function') await _waitForImages(tempWrap,1500); }catch(e){}

    const w=Math.ceil(tempWrap.scrollWidth||captureWidth);
    const h=Math.ceil(tempWrap.scrollHeight||clone.scrollHeight||root.scrollHeight||0);
    const baseArea=Math.max(1, w*h);
    const maxArea=36000000;
    const autoScale=Math.sqrt(maxArea/baseArea);
    const maxSide=15000;
    const sideScale=Math.min(1, maxSide/Math.max(1,w), maxSide/Math.max(1,h));
    const minScale = saveMode==='single' ? 0.8 : 1;
    const scale=Math.max(minScale, Math.min(2.4, sideScale, Number.isFinite(autoScale)?autoScale:1.5));
    const canvas=await html2canvas(tempWrap,{
      backgroundColor:null,
      scale,
      useCORS:true,
      allowTaint:false,
      logging:false,
      imageTimeout:20000,
      width:w,
      height:h,
      windowWidth:w+120,
      windowHeight:h+120,
      scrollX:0,
      scrollY:0,
      onclone:(doc)=>{
        try{
          const exportRoot=doc.getElementById('b2w2-export-root');
          _prepareBriefingExportClone(exportRoot, meta);
        }catch(e){}
      }
    });

    const rawName=`브리핑_${meta.presetLabel}_${String(window._b2WeeklyDateFrom||'').slice(0,10)}_${String(window._b2WeeklyDateTo||'').slice(0,10)}${meta.univ!=='전체'?'_'+meta.univ:''}.png`;
    const safeName=rawName.replace(/[\\/:*?"<>|]+/g,'_');
    if(saveMode==='single') await _saveCanvasImage(canvas,safeName,'png');
    else await _saveCanvasSlices(canvas,safeName,'png',2200);
  }catch(e){alert('브리핑 이미지 저장 오류: '+e.message);}
  finally{
    try{ if(tempWrap&&tempWrap.parentNode) tempWrap.parentNode.removeChild(tempWrap); }catch(e){}
    _hideSaveLoading();
  }
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
async function _saveCanvasSlices(canvas, filename, fmt, maxSliceHeight){
  const limit=Math.max(800, Number(maxSliceHeight)||2200);
  const totalHeight=Math.max(1, Number(canvas && canvas.height)||0);
  if(!canvas || totalHeight<=limit) return _saveCanvasImage(canvas, filename, fmt);
  const dot=String(filename||'').lastIndexOf('.');
  const base=dot>0 ? filename.slice(0,dot) : String(filename||'image');
  const ext=dot>0 ? filename.slice(dot) : `.${fmt==='jpg'?'jpg':'png'}`;
  const partCount=Math.ceil(totalHeight/limit);
  for(let i=0;i<partCount;i++){
    const sy=i*limit;
    const sh=Math.min(limit, totalHeight-sy);
    const part=document.createElement('canvas');
    part.width=canvas.width;
    part.height=sh;
    const ctx=part.getContext('2d');
    if(!ctx) throw new Error('분할 캔버스를 만들지 못했습니다.');
    ctx.drawImage(canvas, 0, sy, canvas.width, sh, 0, 0, canvas.width, sh);
    await _saveCanvasImage(part, `${base}_part${String(i+1).padStart(2,'0')}${ext}`, fmt);
    if(i<partCount-1) await new Promise(resolve=>setTimeout(resolve, 180));
  }
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
  window.captureBriefingArticle = captureBriefingArticle;
  window._saveCanvasImage = _saveCanvasImage;
  window._downloadCanvasImage = _downloadCanvasImage;
}catch(e){}
