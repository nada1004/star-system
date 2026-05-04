(function(){
  function _shareCardSkeletonHTML(){
    return `<div style="position:relative;overflow:hidden;border-radius:18px;background:linear-gradient(180deg,#f8fafc,#eef2ff);padding:16px;min-height:240px">
    <div style="position:absolute;inset:0;background:linear-gradient(90deg,rgba(255,255,255,0) 0%,rgba(255,255,255,.62) 50%,rgba(255,255,255,0) 100%);transform:translateX(-100%);animation:shareSkeletonSlide 1.15s infinite"></div>
    <style>@keyframes shareSkeletonSlide{100%{transform:translateX(100%);}}</style>
    <div style="position:relative;display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
      <div style="width:120px;height:18px;border-radius:999px;background:#dbe4f0"></div>
      <div style="width:64px;height:14px;border-radius:999px;background:#e2e8f0"></div>
    </div>
    <div style="position:relative;display:grid;grid-template-columns:1fr auto 1fr;gap:12px;align-items:center">
      <div style="display:flex;flex-direction:column;align-items:center;gap:8px">
        <div style="width:88px;height:88px;border-radius:999px;background:#d8e2f0"></div>
        <div style="width:88px;height:14px;border-radius:999px;background:#dbe4f0"></div>
        <div style="width:72px;height:10px;border-radius:999px;background:#e5ebf5"></div>
      </div>
      <div style="display:flex;flex-direction:column;align-items:center;gap:8px">
        <div style="width:74px;height:42px;border-radius:14px;background:#c7d2fe"></div>
        <div style="width:56px;height:10px;border-radius:999px;background:#e2e8f0"></div>
      </div>
      <div style="display:flex;flex-direction:column;align-items:center;gap:8px">
        <div style="width:88px;height:88px;border-radius:999px;background:#d8e2f0"></div>
        <div style="width:88px;height:14px;border-radius:999px;background:#dbe4f0"></div>
        <div style="width:72px;height:10px;border-radius:999px;background:#e5ebf5"></div>
      </div>
    </div>
    <div style="position:relative;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-top:18px">
      <div style="height:56px;border-radius:14px;background:#eef2ff"></div>
      <div style="height:56px;border-radius:14px;background:#eef2ff"></div>
      <div style="height:56px;border-radius:14px;background:#eef2ff"></div>
    </div>
  </div>`;
  }

  function _shareCardPrefsSignature(){
    try{
      return JSON.stringify({
        saveTime: localStorage.getItem('su_last_save_time')||'0',
        mode: localStorage.getItem('su_sc_mode')||'campus',
        mode_ck: localStorage.getItem('su_sc_mode_ck')||'inherit',
        mode_pro: localStorage.getItem('su_sc_mode_pro')||'inherit',
        mode_tt: localStorage.getItem('su_sc_mode_tt')||'inherit',
        mode_comp: localStorage.getItem('su_sc_mode_comp')||'inherit',
        color: localStorage.getItem('su_sc_color')||'72',
        fx: localStorage.getItem('su_sc_fx')||'55',
        winbg: localStorage.getItem('su_sc_winbg')||'55',
        losergray: localStorage.getItem('su_sc_losergray')||'55',
        losergray_ck: localStorage.getItem('su_sc_losergray_ck')||'inherit',
        losergray_pro: localStorage.getItem('su_sc_losergray_pro')||'inherit',
        losergray_tt: localStorage.getItem('su_sc_losergray_tt')||'inherit',
        losergray_comp: localStorage.getItem('su_sc_losergray_comp')||'inherit',
        profile: localStorage.getItem('su_sc_profile_pct')||'100',
        profile_ck: localStorage.getItem('su_sc_profile_pct_ck')||'inherit',
        profile_pro: localStorage.getItem('su_sc_profile_pct_pro')||'inherit',
        profile_tt: localStorage.getItem('su_sc_profile_pct_tt')||'inherit',
        profile_comp: localStorage.getItem('su_sc_profile_pct_comp')||'inherit',
        font: localStorage.getItem('su_sc_font_pct')||'100',
        font_ck: localStorage.getItem('su_sc_font_pct_ck')||'inherit',
        font_pro: localStorage.getItem('su_sc_font_pct_pro')||'inherit',
        font_tt: localStorage.getItem('su_sc_font_pct_tt')||'inherit',
        font_comp: localStorage.getItem('su_sc_font_pct_comp')||'inherit',
        logo_layout: localStorage.getItem('su_sc_logo_layout')||'stack',
        logo_size: localStorage.getItem('su_sc_logo_size')||'100',
        logo_fit: localStorage.getItem('su_sc_logo_fit')||'contain',
        surface: localStorage.getItem('su_sc_surface')||'glass',
        radius: localStorage.getItem('su_profile_radius')||'50%'
      });
    }catch(e){ return 'default'; }
  }

  window._shareCardPreviewCache = window._shareCardPreviewCache || new Map();

  function _shareCardCacheGet(key){
    try{ return window._shareCardPreviewCache.get(`${key}::${_shareCardPrefsSignature()}`) || ''; }catch(e){ return ''; }
  }

  function _shareCardCacheSet(key, html){
    try{
      const k=`${key}::${_shareCardPrefsSignature()}`;
      const cache=window._shareCardPreviewCache;
      cache.set(k, html);
      while(cache.size>18){
        const first=cache.keys().next();
        if(first && !first.done) cache.delete(first.value);
        else break;
      }
    }catch(e){}
  }

  function _shareCardRenderCached(card, key, buildHTML){
    const cached=_shareCardCacheGet(key);
    if(cached){
      card.innerHTML=cached;
      return true;
    }
    const html=buildHTML();
    _shareCardCacheSet(key, html);
    card.innerHTML=html;
    return false;
  }

  function _shareCardDeferRender(fn){
    try{
      if(typeof requestAnimationFrame==='function') return requestAnimationFrame(()=>fn());
    }catch(e){}
    return setTimeout(fn, 0);
  }

  function _normalizeShareMatchObjFallback(obj){
    try{
      const m = obj ? {...obj} : null;
      if(!m) return null;
      if(['ind','gj','progj'].includes(String(m._matchType||''))){
        m._usePlayerPhoto = true;
        m._noUnivIcon = false;
        if(m._subLabel==null) m._subLabel = '';
      }
      if((m.a||m.b) && m.sa!=null && m.sb!=null) return m;
      const A = String(m.a||m.pA||m.playerA||m.wName||'A').trim();
      const B = String(m.b||m.pB||m.playerB||m.lName||'B').trim();
      if(Array.isArray(m.games) && m.games.length){
        const games = m.games.map(g=>{
          const pa = String(g.playerA||A).trim();
          const pb = String(g.playerB||B).trim();
          let w = String(g.winner||'').trim();
          if(w && w!=='A' && w!=='B'){
            w = (w===pa) ? 'A' : (w===pb ? 'B' : '');
          }
          return { ...g, playerA: pa, playerB: pb, winner: w };
        });
        const sa = games.filter(g=>g.winner==='A').length;
        const sb = games.filter(g=>g.winner==='B').length;
        m.a = A; m.b = B; m.sa = sa; m.sb = sb;
        m.sets = m.sets && m.sets.length ? m.sets : [{ scoreA: sa, scoreB: sb, winner: sa>sb?'A':sb>sa?'B':'', games }];
        return m;
      }
      if(m.wName || m.lName){
        const w = String(m.wName||'').trim();
        const pa = A || w || 'A';
        const pb = B || String(m.lName||'').trim() || 'B';
        const winnerSide = w && w===pa ? 'A' : (w && w===pb ? 'B' : '');
        m.a = pa; m.b = pb;
        m.sa = winnerSide==='A' ? 1 : 0;
        m.sb = winnerSide==='B' ? 1 : 0;
        m.sets = m.sets && m.sets.length ? m.sets : [{ scoreA: m.sa, scoreB: m.sb, winner: winnerSide, games:[{ playerA: pa, playerB: pb, winner: winnerSide, map: m.map||'' }] }];
        return m;
      }
      return m;
    }catch(e){ return obj||null; }
  }

  function _openShareMatchObjCard(obj){
    try{
      const normalize = (typeof window._normalizeShareMatchObjData==='function')
        ? window._normalizeShareMatchObjData
        : _normalizeShareMatchObjFallback;
      window._shareMatchObj = normalize(obj || null);
      window._shareMode = 'match';
      openShareCardModal();
      const _run = ()=>{ try{ if(window._shareMatchObj && typeof renderShareCardByMatchObj==='function') renderShareCardByMatchObj(window._shareMatchObj); }catch(e){} };
      const _runRetry = (left=4)=>{
        _run();
        try{
          const card=document.getElementById('share-card');
          const skeleton=!!(card && card.querySelector('[style*="shareSkeletonSlide"], style'));
          if(skeleton && left>0) setTimeout(()=>_runRetry(left-1), 120);
        }catch(e){}
      };
      Promise.resolve(typeof window._ensureShareCardRuntime==='function' ? window._ensureShareCardRuntime() : null)
        .then(()=>{ if(typeof window._shareCardDeferRender==='function') window._shareCardDeferRender(()=>_runRetry()); else setTimeout(()=>_runRetry(),0); })
        .catch(()=>{ if(typeof window._shareCardDeferRender==='function') window._shareCardDeferRender(()=>_runRetry()); else setTimeout(()=>_runRetry(),0); });
    }catch(e){}
  }

  function openShareCardModal(){
    const existing=document.getElementById('sharecard-overlay');
    if(existing)existing.remove();

    const overlay=document.createElement('div');
    overlay.id='sharecard-overlay';
    overlay.className='sharecard-modal-overlay modal-compact-overlay';
    overlay.innerHTML=`<div class="sharecard-modal-box modal-compact-box" onclick="event.stopPropagation()" style="max-width:438px;width:calc(100vw - 18px);padding:12px 12px 10px;border-radius:16px">
    <div class="sharecard-modal-hdr" style="display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:10px;cursor:move;user-select:none">
      <div style="font-weight:700;font-size:14px;color:var(--blue);padding-right:8px">🎴 공유 카드</div>
      <button type="button" class="sharecard-modal-close" onclick="document.getElementById('sharecard-overlay').remove()" style="z-index:2;position:static;flex-shrink:0">✕</button>
    </div>
    <div id="modal-share-card" class="sharecard-stage" style="display:flex;justify-content:center;overflow:visible;max-height:none;padding-bottom:2px">
      <div id="share-card" class="share-card-host" style="width:100%;max-width:420px;min-height:140px;border-radius:18px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,.22);font-family:'Noto Sans KR',sans-serif;display:block">
        ${_shareCardSkeletonHTML()}
      </div>
    </div>
    <div class="sharecard-modal-actions" style="margin-top:10px">
      <button class="btn btn-p" onclick="downloadShareCardJpg()">📷 JPG 저장</button>
      <button class="btn btn-w" onclick="downloadShareCard()">🖼 PNG 저장</button>
      <button class="btn btn-w" onclick="document.getElementById('sharecard-overlay').remove()">닫기</button>
    </div>
  </div>`;
    overlay.addEventListener('click', function(e){
      if(e.target===overlay) overlay.remove();
    });
    try{
      overlay.style.alignItems='flex-start';
      overlay.style.overflowY='auto';
      overlay.style.padding='8px 0 18px';
    }catch(e){}
    document.body.appendChild(overlay);
    try{
      if(typeof window._bringModalToFront==='function') window._bringModalToFront(overlay);
    }catch(e){}
    try{
      Promise.resolve().then(()=>typeof window._ensureShareCardRuntime==='function' ? window._ensureShareCardRuntime() : null).catch(()=>null);
    }catch(e){}
    try{
      setTimeout(()=>{ try{ window.ensureHtml2Canvas && window.ensureHtml2Canvas(); }catch(e){} }, 180);
    }catch(e){}
  }

  function resetShareCard(el){
    const c=el||document.getElementById('share-card');
    if(!c)return;
    c.innerHTML='<p style="text-align:center;color:var(--gray-l);padding:36px 20px;font-size:13px">위에서 선택하면 카드가 생성됩니다</p>';
  }

  async function _waitForShareCardAssets(el){
    try{
      const imgs=[...(el?.querySelectorAll?.('img')||[])].filter(img=>img && !img.complete);
      if(!imgs.length) return;
      await Promise.race([
        Promise.all(imgs.map(img=>new Promise(res=>{
          const done=()=>res(true);
          try{
            img.addEventListener('load', done, { once:true });
            img.addEventListener('error', done, { once:true });
          }catch(e){ res(true); }
        }))),
        new Promise(res=>setTimeout(res, 900))
      ]);
    }catch(e){}
  }

  async function downloadShareCardJpg(){
    const el=document.getElementById('share-card');
    if(!el||el.querySelector('p')){alert('먼저 카드를 생성하세요.');return;}
    try{
      _showSaveLoading();
      try{ await (window.ensureHtml2Canvas && window.ensureHtml2Canvas()); }catch(e){}
      await _imgToDataUrls(el);
      await _waitForShareCardAssets(el);
      const canvas=await html2canvas(el,{backgroundColor:null,scale:3,useCORS:false,allowTaint:false,logging:false,imageTimeout:5000});
      await _saveCanvasImage(canvas, `share_card_${new Date().toISOString().slice(0,10)}.jpg`, 'jpg');
    }catch(e){alert('저장 오류: '+e.message);}
    finally{_hideSaveLoading();}
  }

  async function downloadShareCard(){
    const el=document.getElementById('share-card');
    if(!el||!el.children.length||el.querySelector('p')){alert('먼저 카드를 생성하세요.');return;}
    try{
      _showSaveLoading();
      try{ await (window.ensureHtml2Canvas && window.ensureHtml2Canvas()); }catch(e){}
      await _imgToDataUrls(el);
      await _waitForShareCardAssets(el);
      const canvas=await html2canvas(el,{backgroundColor:null,scale:3,useCORS:false,allowTaint:false,logging:false,imageTimeout:5000});
      await _saveCanvasImage(canvas, `share_card_${new Date().toISOString().slice(0,10)}.png`, 'png');
    }catch(e){alert('저장 오류: '+e.message);}
    finally{_hideSaveLoading();}
  }

  window._shareCardPrefsSignature = _shareCardPrefsSignature;
  window._shareCardCacheGet = _shareCardCacheGet;
  window._shareCardCacheSet = _shareCardCacheSet;
  window._shareCardRenderCached = _shareCardRenderCached;
  window._shareCardDeferRender = _shareCardDeferRender;
  window._openShareMatchObjCard = _openShareMatchObjCard;
  window.openShareCardModal = openShareCardModal;
  window.resetShareCard = resetShareCard;
  window._waitForShareCardAssets = _waitForShareCardAssets;
  window.downloadShareCardJpg = downloadShareCardJpg;
  window.downloadShareCard = downloadShareCard;
})();
