function initBoardDrag(){
  const wrap=document.getElementById('board-wrap');
  if(!wrap)return;
  wrap.querySelectorAll('.brd-card').forEach(card=>initBoardDragCard(card, wrap));
  // 플레이어 행 드래그: 관리자만
  if(_boardCanManage()) wrap.querySelectorAll('.brd-body').forEach(body=>initBoardPlayerDrag(body));
}

let _brdDragSrc = null;
let _brdRowDragSrc = null; // 플레이어 행 드래그 소스

function initBoardDragCard(card, wrap){
  // dragstart/dragend는 이제 brd-hdr 인라인 핸들러로 처리
  // dragover/drop만 카드 레벨에서 처리
  card.addEventListener('dragover',e=>{
    if(_brdRowDragSrc) return; // 플레이어 행 드래그 중이면 카드 이동 무시
    if(!_brdDragSrc) return;
    e.preventDefault();
    e.dataTransfer.dropEffect='move';
    if(_brdDragSrc!==card){
      wrap.querySelectorAll('.brd-card').forEach(c=>c.classList.remove('drag-over'));
      card.classList.add('drag-over');
    }
  });
  card.addEventListener('dragleave',e=>{
    if(!e.currentTarget.contains(e.relatedTarget)) card.classList.remove('drag-over');
  });
  card.addEventListener('drop',e=>{
    if(_brdRowDragSrc) return;
    e.preventDefault();
    if(_brdDragSrc&&_brdDragSrc!==card){
      const cards=[...wrap.querySelectorAll('.brd-card')];
      const si=cards.indexOf(_brdDragSrc), di=cards.indexOf(card);
      if(si<di) card.after(_brdDragSrc); else card.before(_brdDragSrc);
    }
    card.classList.remove('drag-over');
  });
}

/* ── 플레이어 행 드래그 앤 드롭 (스트리머 네모박스 순서 변경 + 대학 간 이동) ── */
function initBoardPlayerDrag(body){
  if(!_boardCanManage()) return; // 총관리자만

  const getUnivName = ()=> body.closest('.brd-card')?.dataset?.univ || '';

  // brd-body 자체에도 dragover/drop 등록 → 다른 대학 카드의 body 위로 드롭 지원
  body.addEventListener('dragover', e=>{
    if(!_brdRowDragSrc) return;
    e.preventDefault(); e.stopPropagation();
    e.dataTransfer.dropEffect='move';
    body.style.outline='2px dashed rgba(255,255,255,.6)';
  });
  body.addEventListener('dragleave', e=>{
    if(!body.contains(e.relatedTarget)) body.style.outline='';
  });
  body.addEventListener('drop', e=>{
    body.style.outline='';
    if(!_brdRowDragSrc) return;
    const targetUniv = getUnivName();
    const srcUniv = _brdRowDragSrc.dataset.univ;
    const playerName = _brdRowDragSrc.dataset.player;
    // 같은 카드 내 드롭은 row 레벨에서 처리됨 → 여기서는 다른 대학 카드로 이동만 처리
    if(targetUniv && targetUniv !== srcUniv){
      e.preventDefault(); e.stopPropagation();
      if(!confirm(`"${playerName}"을(를) "${srcUniv}" → "${targetUniv}"로 이동하시겠습니까?`)) return;
      const p = players.find(x=>x.name===playerName);
      if(!p) return;
      p.prevUniv = srcUniv; p.transferDate = new Date().toISOString().slice(0,10);
      p.univ = targetUniv;
      if(boardPlayerOrder[srcUniv]){
        boardPlayerOrder[srcUniv] = boardPlayerOrder[srcUniv].filter(n=>n!==playerName);
      }
      save();
      saveBoardPlayerOrder();
      _refreshBoardCard(srcUniv);
      _refreshBoardCard(targetUniv);
      _brdToast(`✅ "${playerName}" → "${targetUniv}" 이동 완료`);
    }
  });

  // brd-row(일반 카드) + brd-chip(칩 레이아웃) 둘 다 드래그 등록
  body.querySelectorAll('.brd-row[data-player], .brd-chip[data-player]').forEach(row=>{
    row.addEventListener('dragstart',e=>{
      e.stopPropagation();
      _brdRowDragSrc=row;
      row.style.opacity='.45';
      e.dataTransfer.effectAllowed='move';
      e.dataTransfer.setData('text/player', row.dataset.player+'|'+row.dataset.univ);
    });
    row.addEventListener('dragend',e=>{
      row.style.opacity='';
      document.querySelectorAll('.brd-row, .brd-chip').forEach(r=>r.style.outline='');
      document.querySelectorAll('.brd-body').forEach(b=>b.style.outline='');
      _brdRowDragSrc=null;
    });
    row.addEventListener('dragover',e=>{
      if(!_brdRowDragSrc) return;
      e.preventDefault(); e.stopPropagation();
      e.dataTransfer.dropEffect='move';
      if(_brdRowDragSrc!==row){
        body.querySelectorAll('.brd-row, .brd-chip').forEach(r=>r.style.outline='');
        row.style.outline='2px solid rgba(255,255,255,.85)';
      }
    });
    row.addEventListener('dragleave',e=>{ row.style.outline=''; });
    row.addEventListener('drop',e=>{
      e.preventDefault(); e.stopPropagation();
      row.style.outline='';
      if(!_brdRowDragSrc||_brdRowDragSrc===row) return;
      const targetUniv = row.dataset.univ;
      const srcUniv = _brdRowDragSrc.dataset.univ;
      if(targetUniv !== srcUniv){
        const playerName = _brdRowDragSrc.dataset.player;
        if(!confirm(`"${playerName}"을(를) "${srcUniv}" → "${targetUniv}"로 이동하시겠습니까?`)) return;
        const p = players.find(x=>x.name===playerName);
        if(!p) return;
        p.prevUniv = srcUniv; p.transferDate = new Date().toISOString().slice(0,10);
        p.univ = targetUniv;
        if(boardPlayerOrder[srcUniv]){
          boardPlayerOrder[srcUniv] = boardPlayerOrder[srcUniv].filter(n=>n!==playerName);
        }
        const ti2 = (boardPlayerOrder[targetUniv]||[]).indexOf(row.dataset.player);
        if(!boardPlayerOrder[targetUniv]) boardPlayerOrder[targetUniv] = _getBoardPlayers(targetUniv).map(p=>p.name);
        if(ti2>=0) boardPlayerOrder[targetUniv].splice(ti2,0,playerName);
        else boardPlayerOrder[targetUniv].push(playerName);
        save(); saveBoardPlayerOrder();
        _refreshBoardCard(srcUniv); _refreshBoardCard(targetUniv);
        _brdToast(`✅ "${playerName}" → "${targetUniv}" 이동 완료`);
        return;
      }
      // 같은 대학 내 순서 변경 (칩은 flex wrap이라 DOM 순서 변경이 시각적으로 반영됨)
      const allItems = [...body.querySelectorAll('.brd-row[data-player], .brd-chip[data-player]')];
      const si=allItems.indexOf(_brdRowDragSrc), di=allItems.indexOf(row);
      if(si>=0 && di>=0 && si!==di){
        if(si<di) row.after(_brdRowDragSrc); else row.before(_brdRowDragSrc);
        const newOrder=[...body.querySelectorAll('.brd-row[data-player], .brd-chip[data-player]')].map(r=>r.dataset.player);
        boardPlayerOrder[targetUniv]=newOrder;
        saveBoardPlayerOrder();
      }
    });
  });
}

// ── 외부 img를 data URL로 변환 (가능한 것만 변환, 실패/타임아웃 시 원본 유지) ──
const _imgDataUrlCache = (window._imgDataUrlCache = window._imgDataUrlCache || {});
const _imgDataUrlInflight = (window._imgDataUrlInflight = window._imgDataUrlInflight || {});
const _imgDataUrlCacheOrder = (window._imgDataUrlCacheOrder = window._imgDataUrlCacheOrder || []);
async function _imgToDataUrls(container, timeoutMs=8000, onProgress) {
  const imgs = [...container.querySelectorAll('img')];
  const maxConcurrent = 20;
  let idx = 0;
  let doneCount = 0;

  const stripProto = (u) => String(u||'').replace(/^https?:\/\//i, '');
  // 캐시버스트는 직접 요청 실패 후 재시도 때만 사용 (브라우저 HTTP 캐시 보존)
  const withCacheBust = (u) => {
    const s = String(u||'');
    return s + (s.includes('?') ? '&' : '?') + '_x=' + Date.now();
  };

  // 동일 URL 중복 변환 방지: inflight Promise 공유
  const _inflight = {};

  async function convertOne(img){
    return await new Promise(resolve => {
      // Add null/undefined check for img element
      if (!img || typeof img !== 'object') { resolve(); return; }
      
      let src0 = img.getAttribute('src') || '';
      if (!src0 || src0.startsWith('data:') || src0.startsWith('blob:')) { resolve(); return; }
      try{
        if(typeof toHttpsUrl === 'function'){
          const s2 = toHttpsUrl(src0);
          if(s2 && s2 !== src0){
            src0 = s2;
            try{ img.setAttribute('src', s2); }catch(e){}
          }
        }
      }catch(e){}

      // 1) 세션 캐시 히트 → 즉시 반환
      try{
        const cached = _imgDataUrlCache[src0];
        if(cached && typeof cached === 'string' && cached.startsWith('data:image/')){
          img.src = cached;
          resolve();
          return;
        }
      }catch(e){}

      // 2) 동일 URL을 다른 worker가 이미 변환 중이면 그 결과를 기다림 (중복 네트워크 요청 방지)
      if(_inflight[src0]){
        _inflight[src0].then(dataUrl => {
          if(dataUrl) try{ img.src = dataUrl; }catch(e){}
          resolve();
        }).catch(()=>resolve());
        return;
      }

      let done = false;
      let inflightResolve;
      const inflightPromise = new Promise(r => { inflightResolve = r; });
      _inflight[src0] = inflightPromise;

      const finish = (dataUrl) => {
        if(!done){
          done = true;
          try{ inflightResolve(dataUrl||null); }catch(e){}
          try{ delete _inflight[src0]; }catch(e){}
          resolve();
        }
      };
      const t = setTimeout(() => { finish(null); }, timeoutMs);

      // 직접 요청 먼저 → 실패 시에만 캐시버스트/프록시 사용 (불필요한 네트워크 호출 감소)
      const tryUrls = [src0];
      // 실패 시에만 추가 URL 시도
      const fallbackUrls = [
        withCacheBust(src0),
        'https://images.weserv.nl/?url=' + encodeURIComponent(stripProto(src0)) + '&n=-1&cb=' + Date.now(),
      ];

      let attempt = 0;
      const tryLoad = () => {
        if(done) return;
        let url;
        if (attempt === 0) {
          url = tryUrls[attempt++];
        } else {
          // 실패 시에만 fallback URL 사용
          url = fallbackUrls[attempt - 1] || null;
        }
        if(!url){ clearTimeout(t); finish(null); return; }

        const loader = new Image();
        loader.crossOrigin = 'anonymous';
        loader.onload = () => {
          if(done) return;
          if (!loader.naturalWidth || !loader.naturalHeight) { 
            if (attempt === 0) {
              tryLoad(); // 첫 시도 실패 시 fallback 시도
            } else {
              finish(null); // fallback 실패 시 종료
            }
            return; 
          }
          try{
            const cv = document.createElement('canvas');
            if (!cv) { tryLoad(); return; }
            cv.width  = loader.naturalWidth;
            cv.height = loader.naturalHeight;
            const ctx2d = cv.getContext('2d');
            if (!ctx2d) { tryLoad(); return; }
            ctx2d.drawImage(loader, 0, 0);
            // PNG 대신 WebP(지원 시) 또는 JPEG로 인코딩 → data URL 크기·속도 대폭 개선
            // 품질을 낮춰서 속도 향상 (0.88 → 0.75)
            const _supportsWebP = (()=>{ 
              try{ 
                const testCanvas = document.createElement('canvas');
                if (!testCanvas) return false;
                return testCanvas.toDataURL('image/webp').startsWith('data:image/webp'); 
              }catch(e){ return false; } 
            })();
            const dataUrl = _supportsWebP
              ? cv.toDataURL('image/webp', 0.75)
              : cv.toDataURL('image/jpeg', 0.75);
            if(!dataUrl || dataUrl === 'data:,') { tryLoad(); return; }
            if (img && typeof img === 'object') {
              img.src = dataUrl;
            }
            try{
              if(!_imgDataUrlCache[src0]) _imgDataUrlCacheOrder.push(src0);
              _imgDataUrlCache[src0] = dataUrl;
              if(_imgDataUrlCacheOrder.length > 1000){
                const drop = _imgDataUrlCacheOrder.shift();
                if(drop) delete _imgDataUrlCache[drop];
              }
            }catch(e){}
            clearTimeout(t);
            finish(dataUrl);
          }catch(e){
            tryLoad();
          }
        };
        loader.onerror = () => { tryLoad(); };
        loader.src = url;
      };

      tryLoad();
    });
  }

  async function worker(){
    while(true){
      const i = idx++;
      if(i >= imgs.length) break;
      try{ await convertOne(imgs[i]); }catch(e){}
      doneCount++;
      if(typeof onProgress === 'function'){
        try{ onProgress(doneCount, imgs.length); }catch(e){}
      }
    }
  }

  const workers = Array.from({length: Math.min(maxConcurrent, imgs.length)}, () => worker());
  await Promise.all(workers);
}

async function _precacheImgDataUrl(src0, timeoutMs){
  const key = String(src0||'');
  if(!key) return false;
  if(_imgDataUrlCache[key] && String(_imgDataUrlCache[key]).startsWith('data:image/')) return true;
  if(_imgDataUrlInflight[key]) return await _imgDataUrlInflight[key];

  const stripProto = (u) => String(u||'').replace(/^https?:\/\//i, '');
  const withCacheBust = (u) => {
    const s = String(u||'');
    return s + (s.includes('?') ? '&' : '?') + '_x=' + Date.now();
  };

  const p = new Promise((resolve) => {
    let src = key;
    try{
      if(typeof toHttpsUrl === 'function'){
        const s2 = toHttpsUrl(src);
        if(s2) src = s2;
      }
    }catch(e){}

    if(_imgDataUrlCache[src] && String(_imgDataUrlCache[src]).startsWith('data:image/')){ resolve(true); return; }

    const tryUrls = [];
    tryUrls.push(withCacheBust(src));
    tryUrls.push('https://images.weserv.nl/?url=' + encodeURIComponent(stripProto(src)) + '&n=-1&cb=' + Date.now());
    tryUrls.push('https://corsproxy.io/?' + encodeURIComponent(src));

    let attempt = 0;
    let done = false;
    const finish = (ok) => { if(!done){ done = true; resolve(!!ok); } };
    const t = setTimeout(() => finish(false), Math.max(1200, timeoutMs||8000));

    const tryLoad = () => {
      if(done) return;
      const url = tryUrls[attempt++];
      if(!url){ clearTimeout(t); finish(false); return; }
      const loader = new Image();
      loader.crossOrigin = 'anonymous';
      loader.onload = () => {
        if(done) return;
        if(!loader.naturalWidth || !loader.naturalHeight){ tryLoad(); return; }
        try{
          const cv = document.createElement('canvas');
          cv.width = loader.naturalWidth;
          cv.height = loader.naturalHeight;
          const ctx = cv.getContext('2d');
          ctx.drawImage(loader, 0, 0);
          const _supportsWebP = (()=>{ try{ return document.createElement('canvas').toDataURL('image/webp').startsWith('data:image/webp'); }catch(e){ return false; } })();
          const dataUrl = _supportsWebP
            ? cv.toDataURL('image/webp', 0.88)
            : cv.toDataURL('image/jpeg', 0.88);
          if(!dataUrl || dataUrl === 'data:,'){ tryLoad(); return; }
          try{
            if(!_imgDataUrlCache[src]) _imgDataUrlCacheOrder.push(src);
            _imgDataUrlCache[src] = dataUrl;
            if(_imgDataUrlCacheOrder.length > 500){
              const drop = _imgDataUrlCacheOrder.shift();
              if(drop) delete _imgDataUrlCache[drop];
            }
          }catch(e){}
          clearTimeout(t);
          finish(true);
        }catch(e){
          tryLoad();
        }
      };
      loader.onerror = () => { tryLoad(); };
      loader.src = url;
    };

    tryLoad();
  }).finally(()=>{ try{ delete _imgDataUrlInflight[key]; }catch(e){} });

  _imgDataUrlInflight[key] = p;
  return await p;
}

window._precacheVisibleImages = window._precacheVisibleImages || function(container, limit){
  try{
    if(!container || !container.querySelectorAll) return;
    const max = Math.max(1, parseInt(limit, 10) || 160);
    const urls = [];
    const seen = new Set();
    container.querySelectorAll('img[src]').forEach(img=>{
      const src = img.getAttribute('src') || '';
      if(!src || src.startsWith('data:') || src.startsWith('blob:')) return;
      let s = src;
      try{ if(typeof toHttpsUrl === 'function') s = toHttpsUrl(s) || s; }catch(e){}
      if(seen.has(s)) return;
      seen.add(s);
      if(_imgDataUrlCache[s] && String(_imgDataUrlCache[s]).startsWith('data:image/')) return;
      urls.push(s);
    });
    if(!urls.length) return;
    const list = urls.slice(0, max);
    const run = async () => {
      const conc = 4;
      let i = 0;
      const worker = async () => {
        while(true){
          const k = i++;
          if(k >= list.length) break;
          try{ await _precacheImgDataUrl(list[k], 8000); }catch(e){}
        }
      };
      await Promise.all(Array.from({length: Math.min(conc, list.length)}, () => worker()));
    };
    if('requestIdleCallback' in window){
      try{ window.requestIdleCallback(()=>{ run(); }, {timeout: 1200}); }catch(e){ setTimeout(()=>{ run(); }, 60); }
    } else {
      setTimeout(()=>{ run(); }, 60);
    }
  }catch(e){}
};

async function _waitForImages(container, timeoutMs){
  const ms = Math.max(300, parseInt(timeoutMs, 10) || 900);
  const imgs = container ? [...container.querySelectorAll('img[src]')] : [];
  if(!imgs.length) return true;
  const tasks = imgs.map(img=>{
    try{
      // Add null/undefined checks for img element
      if (!img || typeof img !== 'object') return Promise.resolve(false);
      if(img.complete && img.naturalWidth > 0) return Promise.resolve(true);
      if(typeof img.decode === 'function'){
        return img.decode().then(()=>true).catch(()=>false);
      }
    }catch(e){}
    return new Promise(resolve=>{
      let done = false;
      const fin = (ok)=>{ if(done) return; done=true; resolve(!!ok); };
      try{
        if (img && typeof img === 'object') {
          img.addEventListener('load', ()=>fin(true), {once:true});
          img.addEventListener('error', ()=>fin(false), {once:true});
        } else {
          fin(false);
        }
      }catch(e){ fin(false); }
      setTimeout(()=>fin(false), ms);
    });
  });
  await Promise.race([Promise.allSettled(tasks), new Promise(r=>setTimeout(r, ms))]);
  return true;
}

// ── canvas → PNG 다운로드 (toBlob+ObjectURL 방식: 대용량 PNG에 안정적) ──
async function _dlCanvasBoard(canvas, filename) {
  if (!canvas || canvas.width === 0 || canvas.height === 0) {
    alert('이미지 생성 실패: 캔버스가 비어있습니다. 다시 시도해주세요.');
    return false;
  }
  const pngName = filename.replace(/\.jpg$/i, '.png');
  const showOverlay = (src) => {
    try{
      const old = document.getElementById('__img_save_overlay');
      if(old) old.remove();
      const ov = document.createElement('div');
      ov.id = '__img_save_overlay';
      ov.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.72);z-index:999999;display:flex;align-items:center;justify-content:center;padding:16px;';
      const safeName = String(pngName||'image.png').replace(/</g,'&lt;').replace(/>/g,'&gt;');
      ov.innerHTML = `
        <div style="width:min(980px,96vw);max-height:92vh;background:#0b1220;border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,.12);box-shadow:0 18px 60px rgba(0,0,0,.45);display:flex;flex-direction:column">
          <div style="display:flex;gap:10px;align-items:center;padding:12px 14px;background:rgba(15,23,42,.92);color:#fff">
            <div style="font-weight:900;font-size:13px">이미지 저장</div>
            <div style="font-size:12px;opacity:.8">자동 다운로드가 막혔습니다. PC는 우클릭 저장 / 모바일은 길게 눌러 저장</div>
            <a href="${src}" download="${safeName}" style="margin-left:auto;text-decoration:none;color:#fff;background:#2563eb;border:1px solid rgba(255,255,255,.14);border-radius:10px;padding:6px 10px;font-weight:900;font-size:12px">다운로드</a>
            <button id="__img_save_overlay_close" style="border:1px solid rgba(255,255,255,.16);background:rgba(255,255,255,.06);color:#fff;border-radius:10px;padding:6px 10px;font-weight:900;cursor:pointer;font-size:12px">닫기</button>
          </div>
          <div style="padding:12px;overflow:auto;background:#111">
            <img src="${src}" style="max-width:100%;display:block;margin:0 auto;border-radius:12px;background:#111">
          </div>
        </div>
      `;
      ov.addEventListener('click', (e)=>{ if(e.target===ov) ov.remove(); });
      document.body.appendChild(ov);
      const btn = document.getElementById('__img_save_overlay_close');
      if(btn) btn.onclick = ()=>ov.remove();
    }catch(e){}
  };
  const preWin = (() => {
    try{
      const w = window.__captureDlWin;
      if(w && !w.closed) return w;
    }catch(e){}
    return null;
  })();
  try{ window.__captureDlWin = null; }catch(e){}

  if (!preWin && typeof window._saveCanvasImage === 'function') {
    await window._saveCanvasImage(canvas, pngName, 'png');
    return true;
  }

  const showInWindow = (src, isBlobUrl) => {
    if(!preWin) return;
    try{
      if(isBlobUrl){
        try{ preWin.location.href = src; }catch(e){}
        return;
      }
      preWin.document.open();
      preWin.document.write('<html><head><meta charset="utf-8"><title>이미지 저장</title></head>'
        + '<body style="margin:0;background:#111;color:#fff;font-family:sans-serif">'
        + '<div style="padding:12px;font-size:13px">이미지가 자동 다운로드되지 않으면, 아래 이미지를 길게 눌러 저장하세요.</div>'
        + '<img src="' + src + '" style="max-width:100%;display:block;margin:0 auto">'
        + '</body></html>');
      preWin.document.close();
    }catch(e){}
  };

  const tryDownload = (href) => {
    try{
      const a = document.createElement('a');
      a.href = href;
      a.download = pngName;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => { try{ document.body.removeChild(a); }catch(e){} }, 300);
      return true;
    }catch(e){
      return false;
    }
  };

  return await new Promise((resolve) => {
    try{
      canvas.toBlob(blob => {
        if (!blob) {
          try {
            const dataUrl = canvas.toDataURL('image/png');
            if (!dataUrl || dataUrl === 'data:,') { alert('이미지 저장 실패: 빈 이미지입니다.'); resolve(false); return; }
            const ok = tryDownload(dataUrl);
            if(!ok && !preWin){
              let w = null;
              try{ w = window.open(dataUrl, '_blank', 'noopener'); }catch(e){}
              if(!w) showOverlay(dataUrl);
            }
            showInWindow(dataUrl, false);
            resolve(true);
          } catch(e) {
            const msg = (e && e.message) ? e.message : String(e||'오류');
            if (/insecure|security/i.test(msg)) {
              alert('이미지 저장 실패: 보안 정책(CORS)으로 인해 캔버스를 저장할 수 없습니다.\n\n외부 이미지(프로필/로고/배경)가 포함되어 있으면 저장이 차단될 수 있습니다.');
            } else {
              alert('이미지 저장 실패: ' + msg);
            }
            resolve(false);
          }
          return;
        }
        const url = URL.createObjectURL(blob);
        const ok = tryDownload(url);
        if(!ok && !preWin){
          let w = null;
          try{ w = window.open(url, '_blank', 'noopener'); }catch(e){}
          if(!w) showOverlay(url);
        }
        if(preWin){
          showInWindow(url, true);
          setTimeout(() => { try{ URL.revokeObjectURL(url); }catch(e){} }, 120000);
        }else{
          setTimeout(() => { try{ URL.revokeObjectURL(url); }catch(e){} }, 800);
        }
        resolve(true);
      }, 'image/png');
    }catch(e){
      const msg = (e && e.message) ? e.message : String(e||'오류');
      if (/insecure|security/i.test(msg)) {
        alert('이미지 저장 실패: 보안 정책(CORS)으로 인해 캔버스를 저장할 수 없습니다.\n\n외부 이미지(프로필/로고/배경)가 포함되어 있으면 저장이 차단될 수 있습니다.');
      } else {
        alert('이미지 저장 실패: ' + msg);
      }
      resolve(false);
    }
  });
}

// ── html2canvas 캡처 후 저장 ──────────────────────────────────────
async function _captureAndSave(tmpDiv, w, h, filename) {
  try{ await (window.ensureHtml2Canvas && window.ensureHtml2Canvas()); }catch(e){}
  if (typeof html2canvas !== 'function') throw new Error('html2canvas를 불러오지 못했습니다.');
  try{
    // 레이아웃 강제 flush: 고정 80ms×2 대신 rAF 2프레임으로 최소 대기
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
    if(typeof _applyBoardBgAutoSizing === 'function') _applyBoardBgAutoSizing(tmpDiv);
    if(typeof _b2ApplyBgAutoSizing === 'function') _b2ApplyBgAutoSizing(tmpDiv);
    await new Promise(r => requestAnimationFrame(r));
  }catch(e){}

  try{
    const imgs = tmpDiv.querySelectorAll('img').length;
    const t = document.getElementById('_save-toast');
    if(imgs && t) t.innerHTML = '<span style="display:inline-block;animation:_spin .8s linear infinite">⏳</span> 이미지 변환 (0/'+imgs+')';
  }catch(e){}
  await _imgToDataUrls(tmpDiv, 12000, (done, total)=>{
    try{
      const t = document.getElementById('_save-toast');
      if(t) t.innerHTML = '<span style="display:inline-block;animation:_spin .8s linear infinite">⏳</span> 이미지 변환 ('+done+'/'+total+')';
    }catch(e){}
  });

  // 다크모드 CSS(body.dark .brd-card filter 등)가 export에 적용되지 않도록 일시 해제
  const wasDark = document.body.classList.contains('dark');
  if (wasDark) document.body.classList.remove('dark');

  try {
    const t = document.getElementById('_save-toast');
    if(t) t.innerHTML = '<span style="display:inline-block;animation:_spin .8s linear infinite">⏳</span> 캡처 중...';
    try{ await _waitForImages(tmpDiv, 1500); }catch(e){}
    const bg = (() => {
      try{
        const c = window.getComputedStyle ? getComputedStyle(tmpDiv).backgroundColor : '';
        if (c && c !== 'transparent' && c !== 'rgba(0, 0, 0, 0)') return c;
      }catch(e){}
      return '#f0f2f5';
    })();
    const makeOnClone = (aggressive) => {
      return function(clonedDoc){
        try{
          if(clonedDoc && clonedDoc.adoptedStyleSheets && clonedDoc.adoptedStyleSheets.length){
            try{ clonedDoc.adoptedStyleSheets = []; }catch(e){}
          }
        }catch(e){}
        if(!aggressive) return;
        try{ clonedDoc.querySelectorAll('svg').forEach(el => el.remove()); }catch(e){}
        try{
          clonedDoc.querySelectorAll('img').forEach(img => {
            try{
              const src = String(img.getAttribute('src') || img.src || '');
              if(!src) return;
              if(src.includes('data:image/svg+xml') || /\.svg(\?|#|$)/i.test(src)){
                img.style.display = 'none';
              }
            }catch(e){}
          });
        }catch(e){}
        try{
          clonedDoc.querySelectorAll('[style*="background-image"]').forEach(el => {
            try{
              const bi = String(el.style && el.style.backgroundImage ? el.style.backgroundImage : '');
              if(bi && bi.includes('url(') && !bi.includes('data:image/')) el.style.backgroundImage = 'none';
            }catch(e){}
          });
        }catch(e){}
      };
    };

    const baseOpts = {
      scale: 1,
      backgroundColor: bg,
      logging: false,
      imageTimeout: 20000,
      width: w,
      height: h,
      windowWidth: w + 100,
      windowHeight: h + 100,
      x: 0, y: 0, scrollX: 0, scrollY: 0
    };

    const isWaterfox = /waterfox/i.test(navigator.userAgent);
    const isFirefox = /firefox/i.test(navigator.userAgent);
    
    const attempts = [
      { useCORS: true, allowTaint: false, foreignObjectRendering: false, onclone: makeOnClone(false) },
      { useCORS: true, allowTaint: false, foreignObjectRendering: true, onclone: makeOnClone(false) },
      { useCORS: true, allowTaint: false, foreignObjectRendering: false, onclone: makeOnClone(true), ignoreElements: (el)=> el && el.tagName && el.tagName.toLowerCase() === 'svg' },
      ...(isWaterfox || isFirefox ? [
        { useCORS: true, allowTaint: false, foreignObjectRendering: false, onclone: makeOnClone(true),
          ignoreElements: (el)=> {
            if (!el || !el.tagName) return false;
            const tag = el.tagName.toLowerCase();
            if (tag === 'svg') return true;
            if (tag === 'img') {
              try{
                const src = String(el.getAttribute('src') || el.src || '');
                if(src && src.includes('://') && !src.includes(window.location.hostname) && !src.startsWith('data:')) return true;
              }catch(e){}
            }
            if (el.style && el.style.backgroundImage && String(el.style.backgroundImage).includes('url(') && !String(el.style.backgroundImage).includes('data:image/')) {
              return true;
            }
            return false;
          }
        }
      ] : [])
    ];

    let canvas = null;
    let lastErr = null;
    for(const opt of attempts){
      try{
        canvas = await html2canvas(tmpDiv, { ...baseOpts, ...opt });
        if (canvas && canvas.width > 0 && canvas.height > 0) { lastErr = null; break; }
        lastErr = new Error('캔버스 생성 실패');
      }catch(e){
        lastErr = e;
        const msg = _captureErrText(e);
        if(msg.includes("can't access property \"type\"") || msg.includes("can't access property 'type'")){
          continue;
        }
        if(msg === '[object Event]' || msg.startsWith('이벤트 오류(')){
          continue;
        }
        break;
      }
    }
    if(lastErr) throw new Error(_captureErrText(lastErr));
    if (!canvas || canvas.width === 0 || canvas.height === 0) throw new Error('캔버스 생성 실패');
    let ok = await _dlCanvasBoard(canvas, filename);
    if(!ok){
      // "The operation is insecure."(Firefox) 등 CORS/보안 이슈로 저장 실패하면,
      // 외부 리소스를 제거한 안전 캡처로 1회 재시도
      try{
        tmpDiv.querySelectorAll('img').forEach(img => {
          try{
            const src = String(img.getAttribute('src') || img.src || '');
            if(!src) return;
            const host = String(window.location.hostname||'');
            const safe = src.startsWith('data:') || src.startsWith('blob:') || (host && src.includes(host));
            if(!safe) img.style.display = 'none';
          }catch(e){}
        });
        tmpDiv.querySelectorAll('[style*="background-image"]').forEach(el => {
          try{
            const bi = String(el.style && el.style.backgroundImage ? el.style.backgroundImage : '');
            if(bi && bi.includes('url(') && !bi.includes('data:image/')) el.style.backgroundImage = 'none';
          }catch(e){}
        });
      }catch(e){}
      const canvas2 = await html2canvas(tmpDiv, { ...baseOpts, useCORS: true, allowTaint: false, foreignObjectRendering: false, onclone: makeOnClone(true) });
      if (!canvas2 || canvas2.width === 0 || canvas2.height === 0) throw new Error('캔버스 생성 실패');
      ok = await _dlCanvasBoard(canvas2, filename);
      if(!ok) throw new Error('이미지 저장 실패');
    }
  } finally {
    // 다크모드 클래스 복원
    if (wasDark) document.body.classList.add('dark');
  }
}

// 전체저장: board-wrap 클론 후 단일 캡처 (카운터 없음)
async function downloadBoardAll(){
  const btn=event?.currentTarget;
  if(btn){btn.disabled=true;btn._ot=btn.textContent;btn.textContent='⏳...';}
  const tmpDiv=document.createElement('div');
  try{
    try{ await (window.ensureHtml2Canvas && window.ensureHtml2Canvas()); }catch(e){}
    if (typeof html2canvas !== 'function') throw new Error('html2canvas를 불러오지 못했습니다.');
    const boardWrap=document.getElementById('board-wrap');
    if(!boardWrap||!boardWrap.children.length){alert('표시 중인 현황판이 없습니다.');return;}
    const bw=boardWrap.scrollWidth||900;
    tmpDiv.style.cssText=`position:absolute;left:-9999px;top:0;width:${bw}px;background:#f0f2f5;font-family:'Noto Sans KR',sans-serif;box-sizing:border-box;`;
    // rcont의 <style> 블록도 클론에 포함 (brd-card 등 현황판 전용 스타일)
    const rcont=document.getElementById('rcont');
    const brdStyle=rcont?rcont.querySelector('style'):null;
    tmpDiv.innerHTML=(brdStyle?brdStyle.outerHTML:'')+boardWrap.innerHTML;
    tmpDiv.querySelectorAll('.no-export,.no-export-movebtns').forEach(el=>el.remove());
    // 숨김 대학 카드 제거 (이미지 저장 시 항상 제외)
    tmpDiv.querySelectorAll('.brd-card').forEach(card=>{
      const uObj=univCfg.find(x=>x.name===card.dataset.univ);
      if(uObj&&uObj.hidden)card.remove();
    });
    document.body.appendChild(tmpDiv);
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));

    await _imgToDataUrls(tmpDiv, 12000);

    const wasDark=document.body.classList.contains('dark');
    if(wasDark)document.body.classList.remove('dark');
    try{
      const w=tmpDiv.scrollWidth||bw;
      const h=Math.max(tmpDiv.scrollHeight,tmpDiv.offsetHeight,200);
      const canvas=await html2canvas(tmpDiv,{
        scale:1,useCORS:true,allowTaint:false,
        backgroundColor:'#f0f2f5',logging:false,imageTimeout:20000,
        width:w,height:h,windowWidth:w+200,windowHeight:h+200
      });
      if(!canvas||canvas.width===0||canvas.height===0)throw new Error('캔버스 생성 실패');
      await _dlCanvasBoard(canvas,'현황판_전체저장.png');
    }finally{if(wasDark)document.body.classList.add('dark');}
  }catch(e){alert('다운로드 실패: '+e.message);}
  finally{
    if(tmpDiv.parentNode)document.body.removeChild(tmpDiv);
    if(btn){btn.disabled=false;btn.textContent=btn._ot||btn.textContent;}
  }
}

// 포인트 순 전체 랭킹 뷰
