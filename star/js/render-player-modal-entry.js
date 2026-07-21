// 플레이어 모달용 이미지 프리로드 캐시
;(function _injectPlayerModalPremiumStyle(){
  if(typeof document==='undefined') return;
  if(document.getElementById('player-modal-premium-style')) return;
  const s=document.createElement('style');
  s.id='player-modal-premium-style';
  s.textContent=[
    '#playerModal.modal--player-top{backdrop-filter:blur(8px);background:var(--su-pd-modal-overlay-bg,rgba(15,23,42,.38))}',
    '#playerModal.modal--player-top .mbox,#playerModal.modal--player-top .mbox--player{width:min(1160px,calc(100vw - 24px));max-height:min(92vh,940px);border-radius:30px;background:var(--su-pd-modal-box-bg,linear-gradient(180deg,rgba(255,255,255,.985),rgba(248,250,252,.96)));border:1px solid var(--su-pd-modal-box-border,rgba(148,163,184,.18));box-shadow:0 30px 64px rgba(15,23,42,.22),inset 0 1px 0 rgba(255,255,255,.88);overflow:hidden}',
    '#playerModal.modal--player-top #playerModalTitle{padding:18px 22px 14px;background:linear-gradient(135deg,rgba(239,246,255,.96),rgba(255,255,255,.92));border-bottom:1px solid var(--su-pd-modal-box-border,rgba(148,163,184,.18));font-size:22px;font-weight:950;letter-spacing:-.03em;color:var(--text1)}',
    '#playerModal.modal--player-top #playerModalBody{padding:18px 20px 22px;background:linear-gradient(180deg,rgba(255,255,255,.94),rgba(248,250,252,.9));overflow:auto}',
    '#playerModal[data-pd-univbg-enabled="1"] #playerModalTitle{background:var(--su-pd-modal-title-bg)!important}',
    '#playerModal[data-pd-univbg-enabled="1"][data-pd-univbg-scope="body"] #playerModalBody,#playerModal[data-pd-univbg-enabled="1"][data-pd-univbg-scope="cards"] #playerModalBody{background:var(--su-pd-modal-body-bg)!important}',
    '#playerModal[data-pd-univbg-enabled="1"] .pd-hero{background:var(--su-pd-hero-bg)!important;border:1px solid var(--su-pd-card-border)!important}',
    '#playerModal[data-pd-univbg-enabled="1"][data-pd-univbg-scope="body"] .pd-strip,#playerModal[data-pd-univbg-enabled="1"][data-pd-univbg-scope="cards"] .pd-strip{background:var(--su-pd-strip-bg)!important;border-color:var(--su-pd-card-border)!important}',
    '#playerModal[data-pd-univbg-enabled="1"][data-pd-univbg-scope="cards"] .pd-elo-chart-card,#playerModal[data-pd-univbg-enabled="1"][data-pd-univbg-scope="cards"] .pd-mode-card,#playerModal[data-pd-univbg-enabled="1"][data-pd-univbg-scope="cards"] .pd-race-card,#playerModal[data-pd-univbg-enabled="1"][data-pd-univbg-scope="cards"] .pd-map-card,#playerModal[data-pd-univbg-enabled="1"][data-pd-univbg-scope="cards"] .pd-univ-card,#playerModal[data-pd-univbg-enabled="1"][data-pd-univbg-scope="cards"] .pd-memo-input,#playerModal[data-pd-univbg-enabled="1"][data-pd-univbg-scope="cards"] .pd-teammate-chip,#playerModal[data-pd-univbg-enabled="1"][data-pd-univbg-scope="cards"] .pd-hero-quickcard,#playerModal[data-pd-univbg-enabled="1"][data-pd-univbg-scope="cards"] .pd-hero-stat{background:var(--su-pd-card-bg)!important;border-color:var(--su-pd-card-border)!important}',
    '#playerModal[data-pd-univbg-enabled="1"][data-pd-univbg-scope="cards"] .mode-filter-chip:not(.active),#playerModal[data-pd-univbg-enabled="1"][data-pd-univbg-scope="cards"] .year-filter-chip:not(.active){background:var(--su-pd-card-chip-bg)!important;border-color:var(--su-pd-card-border)!important}',
    '#playerModal[data-pd-univbg-enabled="1"][data-pd-univbg-scope="cards"] .pd-opp-table,#playerModal[data-pd-univbg-enabled="1"][data-pd-univbg-scope="cards"] .pd-opp-table tbody tr td{background:var(--su-pd-card-bg)!important}',
    '#playerModal[data-pd-univbg-enabled="1"][data-pd-univbg-scope="cards"] .pd-opp-table tbody tr td,#playerModal[data-pd-univbg-enabled="1"][data-pd-univbg-scope="cards"] .pd-opp-table thead th{border-color:var(--su-pd-card-border)!important}',
    '#playerModal[data-pd-univbtn-enabled="1"] .pd-premium-shell .btn.btn-w,#playerModal[data-pd-univbtn-enabled="1"] .pd-premium-shell button.btn-w{background:var(--su-pd-card-btn-bg)!important;border-color:var(--su-pd-card-btn-border)!important;color:var(--su-pd-card-btn-text)!important}',
    '.pd-premium-shell{display:flex;flex-direction:column;gap:14px}',
    '.pd-premium-shell>div{border-radius:22px!important;box-shadow:0 16px 32px rgba(15,23,42,.06),inset 0 1px 0 rgba(255,255,255,.5)}',
    '.pd-premium-shell>div:first-child{border-radius:26px!important;box-shadow:0 20px 40px rgba(15,23,42,.10),inset 0 1px 0 rgba(255,255,255,.32)}',
    '.pd-premium-shell canvas{border-radius:14px}',
    '.pd-premium-shell .btn,.pd-premium-shell button{box-shadow:0 10px 18px rgba(15,23,42,.05)}',
    'body.dark #playerModal.modal--player-top .mbox,body.dark #playerModal.modal--player-top .mbox--player{background:linear-gradient(180deg,rgba(15,23,42,.98),rgba(15,23,42,.94));border-color:#334155;box-shadow:0 30px 64px rgba(0,0,0,.42),inset 0 1px 0 rgba(255,255,255,.03)}',
    'body.dark #playerModal.modal--player-top #playerModalTitle{background:linear-gradient(180deg,rgba(15,23,42,.96),rgba(15,23,42,.9));border-color:#334155;color:#f8fafc}',
    'body.dark #playerModal.modal--player-top #playerModalBody{background:linear-gradient(180deg,rgba(15,23,42,.92),rgba(15,23,42,.9))}',
    'body.dark .pd-premium-shell>div{box-shadow:0 16px 30px rgba(0,0,0,.2),inset 0 1px 0 rgba(255,255,255,.03)}',
    '@media (max-width:780px){#playerModal.modal--player-top .mbox,#playerModal.modal--player-top .mbox--player{width:min(100vw - 12px,1000px);border-radius:22px}#playerModal.modal--player-top #playerModalTitle{padding:14px 16px 12px;font-size:19px}#playerModal.modal--player-top #playerModalBody{padding:14px 12px 16px}.pd-premium-shell{gap:10px}.pd-premium-shell>div{border-radius:18px!important}.pd-premium-shell>div:first-child{border-radius:20px!important}}'
  ].join('');
  document.head.appendChild(s);
})();

const _pmImgCache = new Map();

// 이미지 URL들을 미리 로드하고, 모두 완료(또는 타임아웃)되면 resolve
function _prewarmPlayerModalImages(p){
  try{
    const urls = [];
    if(p.photo) urls.push(typeof toHttpsUrl==='function' ? toHttpsUrl(p.photo) : p.photo);
    try{
      const pdStyle = JSON.parse(localStorage.getItem('su_pd_style')||'{}');
      const isMobile = window.innerWidth<=768;
      const imgUrlLegacy = isMobile?(pdStyle.img2||''):(pdStyle.img1||'');
      const bgImg = (p.detailHeaderBgImg||pdStyle.header_bg_img||imgUrlLegacy||'').trim();
      if(bgImg) urls.push(typeof toHttpsUrl==='function' ? toHttpsUrl(bgImg) : bgImg);
    }catch(e){}

    const filtered = urls.filter(Boolean);
    if(!filtered.length) return Promise.resolve();

    const promises = filtered.map(src => {
      // 이미 캐시에 있고 완료된 이미지면 즉시 resolve
      const cached = _pmImgCache.get(src);
      if(cached && cached.complete && cached.naturalWidth > 0) return Promise.resolve();

      return new Promise(resolve => {
        const img = new Image();
        img.decoding = 'async';
        img.fetchPriority = 'high';
        const done = () => resolve();
        img.onload = done;
        img.onerror = done;
        img.src = src;
        _pmImgCache.set(src, img);
        if(_pmImgCache.size > 40){
          const firstKey = _pmImgCache.keys().next().value;
          _pmImgCache.delete(firstKey);
        }
      });
    });

    // 최대 400ms 대기 (그 이후엔 그냥 표시)
    return Promise.race([
      Promise.all(promises),
      new Promise(r => setTimeout(r, 400))
    ]);
  }catch(e){
    return Promise.resolve();
  }
}

function _ensurePlayerDetailRendererLoaded(){
  try{
    if(typeof window.buildPlayerDetailHTML === 'function') return Promise.resolve(true);
    if(window.__pdRendererLoading) return window.__pdRendererLoading;
    window.__pdRendererLoading = new Promise((resolve)=>{
      try{
        try{ window.__pdRendererStatus = { state:'loading' }; }catch(e){}
        const _pickSrc = ()=>{
          try{
            const list = Array.from(document.scripts||[]).map(s=>String(s&&s.src||'')).filter(Boolean);
            const hit = list.find(u=>/\/js\/render-player-detail\.js\b/i.test(u) || /\\js\\render-player-detail\.js\b/i.test(u));
            if(hit) return hit;
          }catch(e){}
          try{ return new URL('js/render-player-detail.js', location.href).href; }catch(e){}
          return 'js/render-player-detail.js';
        };
        const srcBase = _pickSrc();
        const s = document.createElement('script');
        s.async = true;
        s.src = `${srcBase}${String(srcBase).includes('?')?'&':'?'}v=hotfix-${Date.now()}`;
        const onErr = (ev)=>{
          try{
            window.__pdRendererStatus = {
              state:'error',
              message:String(ev?.message||'script error'),
              file:String(ev?.filename||''),
              line:ev?.lineno,
              col:ev?.colno
            };
          }catch(e){}
        };
        try{ window.addEventListener('error', onErr, { once:true }); }catch(e){}
        s.onload = ()=>{
          try{ window.removeEventListener('error', onErr); }catch(e){}
          const ok1 = (typeof window.buildPlayerDetailHTML === 'function');
          const ok2 = (!ok1 && (typeof buildPlayerDetailHTML === 'function'));
          if(!ok1 && ok2){
            try{ window.buildPlayerDetailHTML = buildPlayerDetailHTML; }catch(e){}
          }
          const ok = ok1 || ok2;
          try{
            window.__pdRendererStatus = ok ? { state:'loaded_ok' } : { state:'loaded_missing' };
          }catch(e){}
          resolve(ok);
        };
        s.onerror = ()=>{
          try{ window.removeEventListener('error', onErr); }catch(e){}
          try{ window.__pdRendererStatus = { state:'error', message:'load_failed' }; }catch(e){}
          resolve(false);
        };
        document.head.appendChild(s);
      }catch(e){
        try{ window.__pdRendererStatus = { state:'error', message:String(e?.message||e) }; }catch(_){}
        resolve(false);
      }
    });
    return window.__pdRendererLoading;
  }catch(e){
    return Promise.resolve(false);
  }
}

function _waitForPlayerDetailRenderer(maxMs=2000){
  return new Promise((resolve)=>{
    try{
      const start = Date.now();
      const tick = ()=>{
        const fn = (typeof window.buildPlayerDetailHTML==='function')
          ? window.buildPlayerDetailHTML
          : (typeof buildPlayerDetailHTML==='function' ? buildPlayerDetailHTML : null);
        if(fn) return resolve(fn);
        if(Date.now() - start >= maxMs) return resolve(null);
        setTimeout(tick, 80);
      };
      tick();
    }catch(e){
      resolve(null);
    }
  });
}

function _doOpenPlayerModal(name, p){
  const st = (typeof getPlayerDetailState==='function') ? getPlayerDetailState() : (window.PlayerDetailState||{});
  const em = document.getElementById('emModal');
  const isEditModalOpen = !!(em && getComputedStyle(em).display !== 'none');
  try{
    if(window._suppressPlayerModalFront && !isEditModalOpen) window._suppressPlayerModalFront = false;
  }catch(e){}
  const keepEditModalFront = !!window._suppressPlayerModalFront || (isEditModalOpen && st.currentName === name);
  try{
    const pm = document.getElementById('playerModal');
    if(pm){
      pm.classList.add('modal--player-top');
    }
  }catch(e){}
  // sharecard-overlay는 닫지 않음: 공유카드 위에 스트리머 모달이 떠야 함
  if(st.currentName!==name){
    playerHistPage=0;
    st.oppPage=0;
    st.oppSort='tot';
    st.year='';
    st.years=[];
    st.histFilter='';
    st.histFilters=[];
    st.seasonFilter='전체';
    st.seasonFilters=[];
  }
  document.getElementById('playerModalTitle').innerHTML=`<span class="detail-main">👤 ${name}</span>`;
  const mbody=document.getElementById('playerModalBody');
  const _fn = (typeof buildPlayerDetailHTML==='function')
    ? buildPlayerDetailHTML
    : (typeof window.buildPlayerDetailHTML==='function' ? window.buildPlayerDetailHTML : null);
  if(!_fn){
    mbody.innerHTML = `<div style="padding:14px 12px;border-radius:var(--r2);border:1px solid rgba(148,163,184,.18);background:linear-gradient(180deg,rgba(255,255,255,.98),rgba(248,250,252,.94));box-shadow:0 12px 24px rgba(15,23,42,.06)">
      <div style="font-size:var(--fs-base);font-weight:950;color:var(--text2);margin-bottom:6px">스트리머 상세 로딩 중…</div>
      <div style="font-size:var(--fs-sm);color:var(--text3);line-height:1.6">렌더러가 아직 로드되지 않았습니다. 자동으로 다시 불러옵니다.</div>
      <div id="pd-load-status" style="margin-top:8px;font-size:var(--fs-caption);color:var(--gray-l)"></div>
      <div style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap">
        <button type="button" class="btn btn-w btn-xs" onclick="location.reload()">새로고침</button>
        <button type="button" class="btn btn-w btn-xs" onclick="try{window.__pdRendererLoading=null;window.openPlayerModal('${String(name).replace(/'/g,'&#39;')}');}catch(e){}">재시도</button>
      </div>
    </div>`;
    try{ om('playerModal'); }catch(e){}
    try{ const pm3=document.getElementById('playerModal'); if(pm3) pm3.style.zIndex='100010'; }catch(e){}
    _ensurePlayerDetailRendererLoaded().then(()=>{
      _waitForPlayerDetailRenderer(2600).then((fn)=>{
        try{
          try{
            const st = document.getElementById('pd-load-status');
            if(st){
              const ss = window.__pdRendererStatus;
              st.textContent = ss
                ? `상태: ${ss.state}${ss.message?` (${ss.message})`:''}`
                : `상태: ${fn?'loaded_ok':'loaded_missing'}`;
            }
          }catch(_){}
          if(fn){
            const body2 = document.getElementById('playerModalBody');
            if(body2) body2.innerHTML = fn(p);
            try{ injectUnivIcons(body2); }catch(_){}
            try{ setTimeout(()=>initPEloChart(String(p?.name||name)),60); }catch(_){}
          }
        }catch(e){}
      });
    });
    return;
  }
  mbody.innerHTML=_fn(p);
  const pdFs=(JSON.parse(localStorage.getItem('su_pd_style')||'{}').font_size||'normal');
  mbody.style.zoom=pdFs==='xlarge'?'1.2':pdFs==='large'?'1.12':'1';
  injectUnivIcons(mbody);
  const editBtn=document.getElementById('playerModalEditBtn');
  if(editBtn){
    const canEdit = !!(typeof isLoggedIn!=='undefined' && isLoggedIn) && !(typeof isSubAdmin!=='undefined' && isSubAdmin);
    editBtn.style.display=canEdit?'inline-flex':'none';
    editBtn.dataset.playerName=name;
  }
  st.currentName=name;
  {
    const pm2=document.getElementById('playerModal');
    const pmVis = !!(pm2 && getComputedStyle(pm2).display !== 'none');
    if(!keepEditModalFront || !pmVis){
      om('playerModal');
      try{
        const pm3=document.getElementById('playerModal');
        if(pm3) pm3.style.zIndex='100010';
      }catch(e){}
    }
  }
  try{ if(typeof window._syncTabUrlFromState==='function') window._syncTabUrlFromState('replace'); }catch(e){}
  setTimeout(()=>initPEloChart(name),60);
}

function openPlayerModal(name){
  const nm = String(name||'').trim();
  try{ window._lastOpenPlayerModalCall = nm; }catch(e){}
  if(!nm) return;
  try{ if(typeof _b2EnsureMvpHistoryFresh==='function') _b2EnsureMvpHistoryFresh(true); }catch(e){}
  const arr = Array.isArray(players) ? players : [];
  let p = arr.find(x=>x && String(x.name||'').trim()===nm);
  if(!p){
    const k = nm.replace(/\s+/g,'');
    p = arr.find(x=>x && String(x.name||'').replace(/\s+/g,'')===k);
  }
  try{ window._lastOpenPlayerModalFound = !!p; }catch(e){}
  if(!p){
    try{ window._lastOpenPlayerModalFail = nm; }catch(e){}
    return;
  }

  // 이미지를 미리 로드한 뒤 모달 오픈 (최대 400ms 대기, 캐시 히트 시 즉시)
  _prewarmPlayerModalImages(p).then(()=>{
    _doOpenPlayerModal(String(p.name||nm), p);
  }).catch(()=>{
    _doOpenPlayerModal(String(p.name||nm), p);
  });
}

if(typeof window.openEPFromModal !== 'function'){
  window.openEPFromModal = function(nameArg) {
    const canEdit = !!(typeof isLoggedIn!=='undefined' && isLoggedIn) && !(typeof isSubAdmin!=='undefined' && isSubAdmin);
    if(!canEdit){ alert('총관리자만 수정할 수 있습니다.'); return; }
    const st = (typeof getPlayerDetailState==='function') ? getPlayerDetailState() : (window.PlayerDetailState||{});
    const name = nameArg || st.currentName;
    if (!name) { alert('선수 이름을 확인할 수 없습니다.'); return; }
    try{ if(typeof cm==='function') cm('playerModal'); }catch(e){}
    if (typeof openEP !== 'function') {
      let attempts = 0;
      const checkOpenEP = setInterval(() => {
        attempts++;
        if (typeof openEP === 'function') {
          clearInterval(checkOpenEP);
          try { setTimeout(()=>openEP(name), 50); } catch(e) { alert('수정창 열기 실패: ' + e.message); }
        } else if (attempts >= 20) {
          clearInterval(checkOpenEP);
          alert('수정창 로드 실패: 페이지를 새로고침해주세요.');
        }
      }, 200);
      return;
    }
    try { setTimeout(()=>openEP(name), 50); } catch(e) { alert('수정창 열기 실패: ' + e.message); }
  };
}

try{
  window.openPlayerModal = openPlayerModal;
}catch(e){}
