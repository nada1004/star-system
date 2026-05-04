function showNoticePopup(){
  if(typeof notices==='undefined'||!notices.length) return;
  const active=notices.filter(n=>n.active);
  if(!active.length) return;
  const today=new Date().toLocaleDateString('ko-KR').replace(/\./g,'').replace(/ /g,'');
  // 공지별 개별 숨김 키 — 새 공지는 독립적으로 팝업됨
  const n=active.find(n=>!localStorage.getItem('su_nhide_'+n.id+'_'+today));
  if(!n) return;
  const todayKey='su_nhide_'+n.id+'_'+today;
  const titleEl=document.getElementById('notice-popup-title');
  const bodyEl=document.getElementById('notice-popup-body');
  const dateEl=document.getElementById('notice-popup-date');
  const iconEl=document.getElementById('notice-popup-type-icon');
  const headerEl=document.getElementById('notice-popup-header');
  if(!titleEl||!bodyEl) return;
  titleEl.textContent=n.title||'공지';
  bodyEl.textContent=n.body||'';
  dateEl.textContent=n.date||'';
  iconEl.textContent=n.type||'📢';
  // 타입별 헤더 색상
  const colors={'🔥':'linear-gradient(135deg,#991b1b,#dc2626)','⚠️':'linear-gradient(135deg,#92400e,#d97706)','🎉':'linear-gradient(135deg,#065f46,#059669)'};
  if(headerEl) headerEl.style.background=colors[n.type]||'linear-gradient(135deg,#1e3a8a,#2563eb)';
  window._noticePopupHideKey=todayKey;
  om('noticePopupModal');
}
function closeNoticePopup(){
  const chk=document.getElementById('notice-no-show-today');
  if(chk&&chk.checked&&window._noticePopupHideKey){
    localStorage.setItem(window._noticePopupHideKey,'1');
  }
  cm('noticePopupModal');
}
let _appErrorBannerEl = null;
let _lastGlobalErrorMsg = '';
let _lastGlobalErrorAt = 0;
function _ensureAppErrorBanner(){
  try{
    if(_appErrorBannerEl && document.body.contains(_appErrorBannerEl)) return _appErrorBannerEl;
    const el = document.createElement('div');
    el.id = 'app-error-banner';
    el.style.cssText = 'position:fixed;top:12px;left:50%;transform:translateX(-50%);z-index:99999;display:none;max-width:min(92vw,720px);width:max-content;background:#7f1d1d;color:#fff;border:1px solid rgba(255,255,255,.18);box-shadow:0 10px 30px rgba(0,0,0,.24);border-radius:14px;padding:10px 14px;font-size:13px;line-height:1.45;align-items:center;gap:10px';
    const msg = document.createElement('div');
    msg.id = 'app-error-banner-msg';
    msg.style.cssText = 'font-weight:700;letter-spacing:-.2px';
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = '닫기';
    btn.style.cssText = 'border:none;background:rgba(255,255,255,.16);color:#fff;border-radius:999px;padding:6px 10px;font-size:12px;font-weight:700;cursor:pointer;flex-shrink:0';
    btn.onclick = ()=>{ try{ el.style.display='none'; }catch(e){} };
    el.appendChild(msg);
    el.appendChild(btn);
    document.body.appendChild(el);
    _appErrorBannerEl = el;
    return el;
  }catch(e){
    return null;
  }
}
window._showGlobalAppError = function(message, opts){
  try{
    const msg = String(message || '오류가 발생했습니다. 새로고침 후 다시 시도해주세요.');
    const now = Date.now();
    if(msg === _lastGlobalErrorMsg && (now - _lastGlobalErrorAt) < 2500) return;
    _lastGlobalErrorMsg = msg;
    _lastGlobalErrorAt = now;
    const el = _ensureAppErrorBanner();
    if(el){
      const box = el.querySelector('#app-error-banner-msg');
      if(box) box.textContent = msg;
      el.style.display = 'flex';
    }
    try{ if(typeof showToast === 'function') showToast(msg, 3200); }catch(e){}
    if(opts && opts.renderFallback){
      const C = document.getElementById('rcont');
      if(C && !String(C.innerHTML||'').trim()){
        C.innerHTML = `
          <div class="empty-state">
            <div class="empty-state-icon">⚠️</div>
            <div class="empty-state-title">화면을 그리는 중 오류가 발생했습니다</div>
            <div class="empty-state-desc">새로고침 후 다시 시도해주세요. 문제가 계속되면 최근 작업을 확인해주세요.</div>
          </div>
        `;
      }
    }
  }catch(e){}
};
window.addEventListener('error', (event)=>{
  try{
    const message = (event && event.message) ? `오류가 발생했습니다: ${event.message}` : '오류가 발생했습니다. 새로고침 후 다시 시도해주세요.';
    window._showGlobalAppError(message);
  }catch(e){}
});
window.addEventListener('unhandledrejection', (event)=>{
  try{
    const reason = event && event.reason;
    const detail = typeof reason === 'string'
      ? reason
      : (reason && reason.message) ? reason.message : '비동기 처리 중 오류가 발생했습니다.';
    window._showGlobalAppError(`오류가 발생했습니다: ${detail}`);
  }catch(e){}
});

// ─────────────────────────────────────────────────────────────
// (요청사항) 가로 "드래그 메뉴" 지원
// - overflow-x:auto 인 메뉴 바를 마우스로 클릭-드래그 해서 스크롤 가능하게
// - render() 이후 동적으로 생성되는 요소에도 적용됨 (render-core.js에서 호출)
// ─────────────────────────────────────────────────────────────
window.enableDragScroll = function(root){
  try{
    const scope = root || document;
    const bars = scope.querySelectorAll ? scope.querySelectorAll('.hist-inlinebar, .tabs, .fbar') : [];
    bars.forEach(el=>{
      if(el.dataset && el.dataset.dragScrollBound==='1') return;
      if(el.dataset) el.dataset.dragScrollBound='1';
      if(!el.classList.contains('hist-inlinebar')) el.style.cursor='grab';

      let isDown=false, startX=0, startScroll=0, moved=false;

      const down = (e)=>{
        const t = e.target;
        if (t && (t.closest('button') || t.closest('input') || t.closest('select') || t.closest('textarea') || t.closest('a'))) return;
        if(e.pointerType==='mouse' && e.button!==0) return;
        isDown=true;
        moved=false;
        startX=e.clientX;
        startScroll=el.scrollLeft;
        if(!el.classList.contains('hist-inlinebar')) el.style.cursor='grabbing';
        el.classList.add('dragging');
        try{ el.setPointerCapture(e.pointerId); }catch(_){}
      };
      const move = (e)=>{
        if(!isDown) return;
        const dx = e.clientX - startX;
        if(Math.abs(dx)>3) moved=true;
        el.scrollLeft = startScroll - dx;
        if(moved) e.preventDefault();
      };
      const up = (e)=>{
        if(!isDown) return;
        isDown=false;
        el.classList.remove('dragging');
        if(!el.classList.contains('hist-inlinebar')) el.style.cursor='grab';
        el._dragMoved = moved;
        setTimeout(()=>{ try{ el._dragMoved=false; }catch(_){} }, 0);
        try{ el.releasePointerCapture(e.pointerId); }catch(_){}
      };

      el.addEventListener('pointerdown', down, {passive:true});
      el.addEventListener('pointermove', move, {passive:false});
      el.addEventListener('pointerup', up, {passive:true});
      el.addEventListener('pointercancel', up, {passive:true});
      el.addEventListener('click', (ev)=>{
        if(el._dragMoved){
          ev.preventDefault();
          ev.stopPropagation();
        }
      }, true);
    });
  }catch(e){}
};

// ─────────────────────────────────────────────────────────────
// (복구) 티어대회 기록(ttM) 시드 로딩
// - 일부 백업 데이터는 tourneys(type:'tier')에 브라켓 결과만 있고 ttM이 비어있는 경우가 있음
// - 이 경우 대전기록탭(티어대회)이 "전부 사라진 것처럼" 보이므로, 배포 번들에 시드 JSON을 넣어 복구
// - 로컬에 ttM이 이미 있으면 절대 덮어쓰지 않음
// ─────────────────────────────────────────────────────────────
let _ttSeedLoaded = false;
let _ttSeedLoading = false;
async function _seedTierTtM(){
  try{
    if(_ttSeedLoaded || _ttSeedLoading) return;
    if(typeof ttM!=='undefined' && Array.isArray(ttM) && ttM.length){ _ttSeedLoaded=true; return; }
    _ttSeedLoading = true;
    const urls = ['ttm_seed_part1.json','ttm_seed_part2.json'];
    const all = [];
    for(const u of urls){
      try{
        const res = await fetch(u, {cache:'no-store'});
        if(!res || !res.ok) continue;
        const arr = await res.json();
        if(Array.isArray(arr)) all.push(...arr);
      }catch(e){}
    }
    if(all.length){
      const seen = new Set();
      const merged = [];
      all.forEach(m=>{
        if(!m || !m._id || seen.has(m._id)) return;
        seen.add(m._id);
        merged.push(m);
      });
      merged.sort((a,b)=>(b.d||'').localeCompare(a.d||''));
      ttM = merged;
      try{ save && save(); }catch(e){}
      // 티어대회 마이그레이션/표시 캐시 갱신
      try{ if(typeof _ttMigrated!=='undefined') _ttMigrated=false; }catch(e){}
      try{ if(typeof _migrateTierTourneys==='function') _migrateTierTourneys(); }catch(e){}
      // 스트리머 상세(최근 경기)에도 보이도록 ttM → history 반영
      try{ if(typeof syncTierTtMHistory==='function') syncTierTtMHistory(); }catch(e){}
      try{ render && render(); }catch(e){}
    }
    _ttSeedLoaded = true;
    _ttSeedLoading = false;
  }catch(e){
    _ttSeedLoaded = true;
    _ttSeedLoading = false;
  }
}

// ─────────────────────────────────────────────────────────────
// URL 기반 탭/서브탭 라우팅
// ─────────────────────────────────────────────────────────────
(function(){
  if(window.__suUrlNavReady) return;
  window.__suUrlNavReady = true;
  const TABS = new Set(['total','board','board2','elboard','hist','mini','ind','gj','univm','univck','comp','tiertour','pro','stats','cal','roulette','vote','cfg']);
  function _safeDec(v){ try{ return decodeURIComponent(String(v||'')); }catch(e){ return String(v||''); } }
  function _subForTab(tab){
    switch(String(tab||'')){
      case 'hist': return String(histSub||'mini');
      case 'stats': return String((window.statsSub||statsSub||'overview'));
      case 'comp': return String(compSub||'league');
      case 'mini': return String(miniSub||'input');
      case 'ind': return String(indSub||'input');
      case 'gj': return String(gjSub||'input');
      case 'univm': return String(univmSub||'input');
      case 'univck': return String(ckSub||'input');
      case 'tiertour': return String((typeof _ttSub!=='undefined' && _ttSub) || 'records');
      default: return '';
    }
  }
  function _setSubForTab(tab, sub){
    const v = String(sub||'').trim();
    if(!v) return;
    switch(String(tab||'')){
      case 'hist': histSub = v; break;
      case 'stats':
        if(typeof window.statsSub!=='undefined') window.statsSub = v;
        try{ statsSub = v; }catch(e){}
        try{ localStorage.setItem('su_statsSub', v); }catch(e){}
        break;
      case 'comp': compSub = v; break;
      case 'mini': miniSub = v; break;
      case 'ind': indSub = v; break;
      case 'gj': gjSub = v; break;
      case 'univm': univmSub = v; break;
      case 'univck': ckSub = v; break;
      case 'tiertour': try{ _ttSub = v; }catch(e){} break;
    }
  }
  window.__suBuildNavUrl = function(){
    const params = new URLSearchParams(window.location.search || '');
    const tab = String((typeof curTab!=='undefined' && curTab) || 'total');
    if(tab && tab!=='total') params.set('tab', tab); else params.delete('tab');
    const sub = _subForTab(tab);
    if(sub) params.set('sub', sub); else params.delete('sub');
    if(tab==='comp' && typeof curComp!=='undefined' && String(curComp||'').trim()) params.set('compName', String(curComp||'').trim()); else params.delete('compName');
    if(tab==='tiertour' && typeof _ttCurComp!=='undefined' && String(_ttCurComp||'').trim()) params.set('ttComp', String(_ttCurComp||'').trim()); else params.delete('ttComp');
    const q = (tab==='stats' && String((window.statsSub||statsSub||''))==='psearch' && typeof window._psearchQ!=='undefined') ? String(window._psearchQ||'').trim() : '';
    if(q) params.set('query', q);
    else if(!params.get('player') && !params.get('univ')) params.delete('query');
    const playerName = String(window.__suModalPlayerName || '').trim();
    const univName = String(window.__suModalUnivName || '').trim();
    const matchKey = String(window.__suOpenHistDetailKey || '').trim();
    if(playerName) params.set('player', playerName); else params.delete('player');
    if(univName) params.set('univ', univName); else params.delete('univ');
    if(matchKey) params.set('match', matchKey); else params.delete('match');
    if(tab==='hist' && typeof histPage!=='undefined'){
      const pgKey = String(histSub||'all');
      const p = Number(histPage[pgKey]||0) + 1;
      if(p > 1) params.set('page', String(p)); else params.delete('page');
    }else{
      params.delete('page');
    }
    const qs = params.toString();
    return `${window.location.pathname}${qs?`?${qs}`:''}${window.location.hash||''}`;
  };
  window.__suSyncUrlState = function(){
    try{
      if(window.__suUrlMute) return;
      const next = window.__suBuildNavUrl();
      const cur = `${window.location.pathname}${window.location.search}${window.location.hash||''}`;
      if(next !== cur) window.history.replaceState({suNav:true}, '', next);
    }catch(e){}
  };
  window.__suApplyUrlState = function(opts){
    const o = opts || {};
    try{
      window.__suUrlMute = true;
      const params = new URLSearchParams(window.location.search || '');
      const tab = String(params.get('tab')||'').trim();
      const sub = String(params.get('sub')||'').trim();
      const compName = _safeDec(params.get('compName')||'').trim();
      const ttComp = _safeDec(params.get('ttComp')||'').trim();
      const q = _safeDec(params.get('query')||'').trim();
      const playerName = _safeDec(params.get('player')||'').trim();
      const univName = _safeDec(params.get('univ')||'').trim();
      const matchKey = _safeDec(params.get('match')||'').trim();
      const page = Math.max(1, parseInt(params.get('page')||'1',10)||1);
      if(tab && TABS.has(tab)) curTab = tab;
      if(sub) _setSubForTab(curTab, sub);
      if(curTab==='hist' && typeof histPage!=='undefined'){
        const pgKey = String(histSub||'all');
        histPage[pgKey] = Math.max(0, page-1);
      }
      if(curTab==='comp' && compName && typeof curComp!=='undefined') curComp = compName;
      if(curTab==='tiertour' && ttComp && typeof _ttCurComp!=='undefined') _ttCurComp = ttComp;
      if(curTab==='stats' && String((window.statsSub||statsSub||''))==='psearch' && q && typeof window._psearchQ!=='undefined') window._psearchQ = q;
      window.__suPendingPlayerModal = playerName || '';
      window.__suPendingUnivModal = univName || '';
      window.__suPendingMatchDetailKey = matchKey || '';
      try{ openDetails = {}; }catch(e){}
    }catch(e){} finally {
      window.__suUrlMute = false;
    }
    if(o.render !== false){
      try{ if(typeof render==='function') render(true); }catch(e){}
    }
  };
  window.__suPatchRenderForUrlSync = function(){
    try{
      if(window.__suRenderUrlPatched || typeof window.render!=='function') return;
      window.__suRenderUrlPatched = true;
      const _origRender = window.render;
      window.render = function(){
        const r = _origRender.apply(this, arguments);
        try{
          if(arguments[0]===true) setTimeout(()=>window.__suSyncUrlState(), 0);
          else requestAnimationFrame(()=>window.__suSyncUrlState());
        }catch(e){}
        return r;
      };
      try{ render = window.render; }catch(e){}
    }catch(e){}
  };
  window.__suPatchModalFnsForUrl = function(){
    try{
      if(window.__suModalUrlPatched) return;
      window.__suModalUrlPatched = true;
      const _origCm = window.cm;
      window.cm = function(id){
        try{
          if(id==='playerModal') window.__suModalPlayerName = '';
          if(id==='univModal') window.__suModalUnivName = '';
          if(id==='histDetModal') window.__suOpenHistDetailKey = '';
        }catch(e){}
        const r = (typeof _origCm === 'function') ? _origCm.apply(this, arguments) : undefined;
        try{ window.__suSyncUrlState(); }catch(e){}
        return r;
      };
    }catch(e){}
  };
  window.__suOpenPendingUrlModal = function(){
    try{
      const playerName = String(window.__suPendingPlayerModal||'').trim();
      const univName = String(window.__suPendingUnivModal||'').trim();
      const matchKey = String(window.__suPendingMatchDetailKey||'').trim();
      window.__suPendingPlayerModal = '';
      window.__suPendingUnivModal = '';
      window.__suPendingMatchDetailKey = '';
      if(playerName && typeof openPlayerModal==='function'){
        setTimeout(()=>{ try{ openPlayerModal(playerName); }catch(e){} }, 100);
        return;
      }
      if(univName && typeof openUnivModal==='function'){
        setTimeout(()=>{ try{ openUnivModal(univName); }catch(e){} }, 100);
        return;
      }
      if(matchKey && typeof openHistDetailModal==='function'){
        setTimeout(()=>{ try{ openHistDetailModal(matchKey); }catch(e){} }, 120);
      }
    }catch(e){}
  };
  window.addEventListener('popstate', ()=>{
    try{ window.__suApplyUrlState({ render:true }); }catch(e){}
  });
})();

async function init(){
  try{
    let usedCriticalBoot = !!window.__suCriticalBootApplied;
    try{
      if(!usedCriticalBoot && window.__suCriticalBootData && await window.__suNeedsBootstrapData()){
        const critical = window.__suCriticalBootData || {};
        if(Array.isArray(critical.players) && critical.players.length){
          if(typeof window.__suApplyImportedData === 'function'){
            await window.__suApplyImportedData(critical, { persist:false, render:false });
          }else{
            players = critical.players;
            if(Array.isArray(critical.univCfg) && critical.univCfg.length) univCfg = critical.univCfg;
            if(Array.isArray(critical.maps) && critical.maps.length) maps = critical.maps;
            miniM = Array.isArray(critical.miniM) ? critical.miniM : (miniM || []);
            univM = Array.isArray(critical.univM) ? critical.univM : (univM || []);
            ckM = Array.isArray(critical.ckM) ? critical.ckM : (ckM || []);
            proM = Array.isArray(critical.proM) ? critical.proM : (proM || []);
            comps = Array.isArray(critical.comps) ? critical.comps : (comps || []);
            tourneys = Array.isArray(critical.tourneys) ? critical.tourneys : (tourneys || []);
            ttM = Array.isArray(critical.ttM) ? critical.ttM : (ttM || []);
            indM = Array.isArray(critical.indM) ? critical.indM : (indM || []);
            gjM = Array.isArray(critical.gjM) ? critical.gjM : (gjM || []);
          }
          window.__suInitialDataPending = false;
          window.__suCriticalBootApplied = true;
          usedCriticalBoot = true;
          const hasCriticalRecords = [
            critical.miniM, critical.univM, critical.ckM, critical.proM,
            critical.comps, critical.tourneys, critical.ttM, critical.indM, critical.gjM
          ].some(v=>Array.isArray(v) && v.length);
          if(hasCriticalRecords) window.__suBootDataApplied = true;
        }
      }
    }catch(e){}
    if(!usedCriticalBoot && !window.__suBootDataApplied && window.__suBootDataPromise && await window.__suNeedsBootstrapData()){
      const bootData = await Promise.race([
        window.__suBootDataPromise,
        new Promise(resolve=>setTimeout(()=>resolve(null), 220))
      ]);
      if(bootData){
        await window.__suApplyImportedData(bootData, { persist:false, render:false });
      }
    }
  }catch(e){}
  try{ if(typeof window.__suPatchRenderForUrlSync==='function') window.__suPatchRenderForUrlSync(); }catch(e){}
  try{ if(typeof window.__suPatchModalFnsForUrl==='function') window.__suPatchModalFnsForUrl(); }catch(e){}
  try{ if(typeof window.__suApplyUrlState==='function') window.__suApplyUrlState({ render:false }); }catch(e){}
  // 첫 화면은 최대한 빨리 노출
  render(true);
  requestAnimationFrame(()=>{
    try{ if(typeof window._applyAllRuntimeSettings === 'function') window._applyAllRuntimeSettings(); }catch(e){}
  });
  // 무거운 복원/정합 작업은 첫 화면을 먼저 그린 뒤로 미룸
  setTimeout(async ()=>{
    let _needsLateRender = false;
    try{
      if(!window.__suBootDataApplied && window.__suBootDataPromise){
        const bootData = await window.__suBootDataPromise;
        if(bootData){
          await window.__suApplyImportedData(bootData, { render:false });
          if(!(typeof curTab!=='undefined' && curTab==='total' && Array.isArray(players) && players.length)){
            _needsLateRender = true;
          }
        }
      }
    }catch(e){}
    try{ fixPoints(); }catch(e){}
    try{ _seedTierTtM(); }catch(e){}
    try{
      if(typeof ELO_DEFAULT!=='undefined'){
        players.forEach(p=>{ if(p.elo===undefined||p.elo===null) p.elo=ELO_DEFAULT; });
      }
    }catch(e){}
    try{
      const ptier=document.getElementById('p-tier');
      if(ptier) ptier.innerHTML=TIERS.map(t=>`<option value="${t}">${getTierLabel(t)}</option>`).join('');
    }catch(e){}
    try{
      if(!window.__suBootDataApplied && typeof window.__suHydrateHistoryFromIDB === 'function'){
        const hydrated = await window.__suHydrateHistoryFromIDB();
        if(hydrated) _needsLateRender = true;
      }
    }catch(e){
      console.warn('[init] history idb hydrate failed', e);
    }
    try{ initLoginHash(); }catch(e){}
    try{ applyLoginState(); }catch(e){}
    try{ if(typeof syncTourneyHistory==='function') syncTourneyHistory(); }catch(e){}
    try{ if(typeof _migrateTierTourneys==='function') _migrateTierTourneys(); }catch(e){}
    try{ if(typeof _migrateTierTourName==='function') _migrateTierTourName(); }catch(e){}
    try{ refreshSel(); }catch(e){}
    try{
      const _isTotalReady = (typeof curTab!=='undefined' && curTab==='total' && Array.isArray(players) && players.length);
      if(_needsLateRender && !_isTotalReady && typeof render==='function') render(true);
    }catch(e){}
    try{ if(typeof window._applyAllRuntimeSettings === 'function') window._applyAllRuntimeSettings(); }catch(e){}
  }, 0);
  // (성능) 부가 기능은 idle 시 지연 로딩
  // - BGM/멀티뷰는 초기 렌더와 무관하므로, 최초 로딩을 가볍게 유지
  try{
    const loadExtras = ()=>{
      try{
        if(typeof window._loadScriptOnce!=='function') return;
        window._loadScriptOnce('js/yt-bgm.js?v=20260420-06').catch(()=>{});
        window._loadScriptOnce('js/soop-multiview.js?v=20260420-10').catch(()=>{});
        window._loadScriptOnce('js/mobile-bar.js?v=20260422-02').catch(()=>{});
      }catch(e){}
    };
    if('requestIdleCallback' in window) requestIdleCallback(loadExtras, {timeout: 2500});
    else setTimeout(loadExtras, 1200);
  }catch(e){}
  try{
    const warmTotal = ()=>{
      try{
        if(typeof window._warmTotalCaches === 'function') window._warmTotalCaches();
      }catch(e){}
    };
    if('requestIdleCallback' in window) requestIdleCallback(warmTotal, {timeout: 1200});
    else setTimeout(warmTotal, 400);
  }catch(e){}
  // 초기 화면과 직접 관련 없는 모듈은 첫 렌더 뒤 지연 로딩
  try{
    const loadDeferredUi = ()=>{
      try{
        if(typeof window._ensureCloudBoardLoaded === 'function') window._ensureCloudBoardLoaded().catch(()=>{});
        else if(typeof window._loadScriptOnce === 'function') window._loadScriptOnce('js/cloud-board.js?v=20260503-12').catch(()=>{});
        if(typeof window._ensureBoard2Loaded === 'function') window._ensureBoard2Loaded().catch(()=>{});
      }catch(e){}
    };
    if('requestIdleCallback' in window) requestIdleCallback(loadDeferredUi, {timeout: 3000});
    else setTimeout(loadDeferredUi, 1500);
  }catch(e){}
  setTimeout(showNoticePopup, 800);
  // URL 파라미터로 검색/상세 자동 오픈
  setTimeout(()=>{
    try{
      const params = new URLSearchParams(window.location.search);
      const queryParam = params.get('query');
      if(queryParam){
        const q = decodeURIComponent(queryParam);
        const exact = players.find(p=>p.name===q);
        if(exact && typeof openPlayerModal==='function' && !String(window.__suPendingPlayerModal||'').trim()){
          openPlayerModal(q);
        } else {
          if(typeof sw==='function') sw('stats');
          if(typeof statsSub!=='undefined') statsSub='psearch';
          if(typeof _psearchQ!=='undefined') _psearchQ=q;
          if(typeof render==='function') render();
        }
      }
    }catch(e){}
  }, 1200);
  setTimeout(()=>{
    try{ if(typeof window.__suOpenPendingUrlModal==='function') window.__suOpenPendingUrlModal(); }catch(e){}
  }, 1350);
}
init();
initDark();

// ─────────────────────────────────────────────────────────────
// 설정 원격 pull은 수동 실행만 유지
// - GitHub/Firebase 동기화는 변경 신호 기반으로만 수신
// - SettingsStore는 설정 화면의 수동 불러오기에서만 사용
// ─────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────
// 전역 폰트 설정
// - localStorage:
//   su_app_font_preset: system | noto | pretendard | nanum | gmarket | custom
//   su_app_font_css:    (옵션) 폰트 CSS URL
//   su_app_font_family: (옵션) font-family 문자열
// ─────────────────────────────────────────────────────────────
window._applyAppFont = function(){
  let preset='noto', cssUrl='', fam='';
  try{ preset = (localStorage.getItem('su_app_font_preset') || 'noto').trim(); }catch(e){}
  try{ cssUrl = (localStorage.getItem('su_app_font_css') || '').trim(); }catch(e){}
  try{ fam = (localStorage.getItem('su_app_font_family') || '').trim(); }catch(e){}
  let cssTxt = '';
  try{ cssTxt = (localStorage.getItem('su_app_font_css_text') || '').trim(); }catch(e){}

  const ensureLink = (id, href) => {
    const head = document.head || document.getElementsByTagName('head')[0];
    if(!head) return;
    let el = document.getElementById(id);
    if(!href){
      if(el) el.remove();
      return;
    }
    if(!el){
      el = document.createElement('link');
      el.id = id;
      el.rel = 'stylesheet';
      head.appendChild(el);
    }
    el.href = href;
  };

  // 프리셋별 권장 CSS(없어도 동작하지만, 있으면 품질↑)
  const presetCss = {
    noto: 'https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;600;700;900&display=swap',
    pretendard: 'https://cdn.jsdelivr.net/gh/orioncactus/pretendard@latest/dist/web/variable/pretendardvariable.css',
    nanum: 'https://fonts.googleapis.com/css2?family=Nanum+Gothic:wght@400;700;800&display=swap',
    gmarket: 'https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_2001@1.1/GmarketSans.css',
    dohyeon: 'https://fonts.googleapis.com/css2?family=Do+Hyeon&display=swap',
    blackhansans: 'https://fonts.googleapis.com/css2?family=Black+Han+Sans&display=swap',
    ibmplexsans: 'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+KR:wght@400;600;700&display=swap',
  };
  ensureLink('app-font-preset-css', presetCss[preset] || '');
  ensureLink('app-font-custom-css', cssUrl);

  // CSS 직접 입력(@font-face 등) 지원
  try{
    const head = document.head || document.getElementsByTagName('head')[0];
    if(head){
      let st = document.getElementById('app-font-custom-style');
      if(!cssTxt){
        if(st) st.remove();
      }else{
        if(!st){
          st = document.createElement('style');
          st.id = 'app-font-custom-style';
          head.appendChild(st);
        }
        st.textContent = cssTxt;
      }
    }
  }catch(e){}

  // preset → font-family
  const presetFam = {
    system: 'system-ui, -apple-system, Segoe UI, Roboto, "Noto Sans KR", Arial, sans-serif',
    noto: '"Noto Sans KR", sans-serif',
    pretendard: '"Pretendard Variable", Pretendard, "Noto Sans KR", sans-serif',
    nanum: '"Nanum Gothic", "Noto Sans KR", sans-serif',
    gmarket: '"GmarketSans", "Noto Sans KR", sans-serif',
    dohyeon: '"Do Hyeon", "Noto Sans KR", sans-serif',
    blackhansans: '"Black Han Sans", "Noto Sans KR", sans-serif',
    ibmplexsans: '"IBM Plex Sans KR", "Noto Sans KR", sans-serif',
  };
  const finalFam = fam || presetFam[preset] || presetFam.noto;
  // 이모지(📊📅🏆 등)가 흑백으로 보이는 문제 방지:
  // - 전역 폰트를 강제 적용(body * { font-family: var(--app-font) !important; })하는 구조라
  //   이모지 폰트 폴백을 명시적으로 앞에 둬야 컬러 이모지가 유지됩니다.
  const emojiFam = '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji"';
  const finalFamWithEmoji = `${emojiFam}, ${finalFam}`;
  try{ document.documentElement.style.setProperty('--app-font', finalFamWithEmoji); }catch(e){}
};
// 초기 1회 적용(렌더 전후 모두 대응)
try{ window._applyAppFont(); }catch(e){}

// ─────────────────────────────────────────────────────────────
// (요청사항) 버튼/필(탭/필터) 스타일 전역 설정
// - localStorage:
//   su_btn_scale_pct: 85~125 (기본 100)
//   su_btn_r:         px (기본 8)
//   su_pill_r:        px (기본 20)
// ─────────────────────────────────────────────────────────────
window._applyUiBtnStyle = function(){
  let pct=100, br=8, pr=20;
  try{ pct = parseInt(localStorage.getItem('su_btn_scale_pct')||'100',10) || 100; }catch(e){}
  try{ br = parseInt(localStorage.getItem('su_btn_r')||'8',10) || 8; }catch(e){}
  try{ pr = parseInt(localStorage.getItem('su_pill_r')||'20',10) || 20; }catch(e){}
  pct = Math.max(70, Math.min(140, pct));
  br = Math.max(0, Math.min(40, br));
  pr = Math.max(0, Math.min(60, pr));
  const scale = pct/100;
  try{ document.documentElement.style.setProperty('--su_btn_scale', String(scale)); }catch(e){}
  try{ document.documentElement.style.setProperty('--su_btn_r', br+'px'); }catch(e){}
  try{ document.documentElement.style.setProperty('--su_pill_r', pr+'px'); }catch(e){}
};
try{ window._applyUiBtnStyle(); }catch(e){}

// ─────────────────────────────────────────────────────────────
// (요청사항) 전체 테마 변수 적용 (헤더 프리셋과 연동)
// - localStorage: su_theme_vars_v1 (JSON: { "--bg":"...", "--surface":"...", ... })
// - dark 모드에서는 배경 계열은 유지하고, 강조색(--blue 계열)만 적용
// ─────────────────────────────────────────────────────────────
window._applyThemeVars = function(){
  let obj=null;
  try{ obj = JSON.parse(localStorage.getItem('su_theme_vars_v1')||'null'); }catch(e){ obj=null; }
  if(!obj || typeof obj!=='object') obj=null;
  const tgt = document.body || document.documentElement;
  if(!tgt) return;
  // 기존 적용값 제거 후 재적용(없는 키는 제거)
  const keys = ['--bg','--white','--surface','--border','--border2','--blue','--blue-d','--blue-l','--blue-ll','--gold','--gold-bg','--gold-b','--green','--red','--gray','--gray-l'];
  try{
    keys.forEach(k=>{
      // obj가 없거나 해당 키가 없으면 inline 제거
      if(!obj || !Object.prototype.hasOwnProperty.call(obj,k)) tgt.style.removeProperty(k);
    });
  }catch(e){}
  if(!obj) return;
  const isDark = !!document.body?.classList?.contains('dark');
  const allowDark = new Set(['--blue','--blue-d','--blue-l','--blue-ll','--gold','--gold-bg','--gold-b','--green','--red']);
  try{
    Object.keys(obj).forEach(k=>{
      if(typeof obj[k] !== 'string') return;
      if(isDark && !allowDark.has(k)) return;
      tgt.style.setProperty(k, obj[k]);
    });
  }catch(e){}
};
window.setThemeVars = function(vars){
  try{
    if(!vars){ localStorage.removeItem('su_theme_vars_v1'); window._applyThemeVars(); return; }
    localStorage.setItem('su_theme_vars_v1', JSON.stringify(vars));
  }catch(e){}
  try{ window._applyThemeVars(); }catch(e){}
};
try{ window._applyThemeVars(); }catch(e){}

// ─────────────────────────────────────────────────────────────
// (요청사항) 헤더 커스텀(제목/좌측 아이콘/우측 이미지/배경 이미지/높이)
// - localStorage:
//   su_hdr_title
//   su_hdr_left_icon   (URL 또는 이모지)
//   su_hdr_left_size   (px)
//   su_hdr_right_img   (URL)
//   su_hdr_right_size  (px)
//   su_hdr_bg_img      (URL)
//   su_hdr_height      (px)
// ─────────────────────────────────────────────────────────────
window._applyHeaderSettings = function(){
  let title='', leftIco='', leftSz=22, rightImg='', rightSz=32, bgImg='', hdrH=0;
  // 신규: 헤더 색/효과 + 테마 동기화
  let fx='classic', c1='', c2='', syncTheme=false;
  try{ title=(localStorage.getItem('su_hdr_title')||'').trim(); }catch(e){}
  try{ leftIco=(localStorage.getItem('su_hdr_left_icon')||'').trim(); }catch(e){}
  try{ leftSz=parseInt(localStorage.getItem('su_hdr_left_size')||'22',10)||22; }catch(e){}
  try{ rightImg=(localStorage.getItem('su_hdr_right_img')||'').trim(); }catch(e){}
  try{ rightSz=parseInt(localStorage.getItem('su_hdr_right_size')||'32',10)||32; }catch(e){}
  try{ bgImg=(localStorage.getItem('su_hdr_bg_img')||'').trim(); }catch(e){}
  try{ hdrH=parseInt(localStorage.getItem('su_hdr_height')||'0',10)||0; }catch(e){}
  try{ fx=(localStorage.getItem('su_hdr_fx')||'classic').trim(); }catch(e){}
  try{ c1=(localStorage.getItem('su_hdr_c1')||'').trim(); }catch(e){}
  try{ c2=(localStorage.getItem('su_hdr_c2')||'').trim(); }catch(e){}
  try{ syncTheme=(localStorage.getItem('su_hdr_sync_theme')==='1'); }catch(e){ syncTheme=false; }
  leftSz=Math.max(14,Math.min(44,leftSz));
  rightSz=Math.max(18,Math.min(70,rightSz));
  hdrH=Math.max(0,Math.min(140,hdrH));

  const hdr=document.querySelector('.hdr');
  const tEl=document.querySelector('.hdr-title');
  const iEl=document.querySelector('.hdr-ico');
  const rEl=document.getElementById('hdrRightImg');
  if(hdr){
    try{
      if(hdrH>0) document.documentElement.style.setProperty('--hdr-h', hdrH+'px');
      else document.documentElement.style.removeProperty('--hdr-h');
    }catch(e){}
    // 색 유틸
    const _hexToRgb=(hex)=>{
      const h=String(hex||'').replace('#','').trim();
      if(!/^[0-9a-fA-F]{6}$/.test(h)) return null;
      return {r:parseInt(h.slice(0,2),16), g:parseInt(h.slice(2,4),16), b:parseInt(h.slice(4,6),16)};
    };
    const _rgbToHex=(r,g,b)=>{
      const to=(n)=>Math.max(0,Math.min(255,Math.round(n))).toString(16).padStart(2,'0');
      return `#${to(r)}${to(g)}${to(b)}`;
    };
    const _mix=(a,b,t)=>{
      const A=_hexToRgb(a), B=_hexToRgb(b);
      if(!A||!B) return a||b||'#2563eb';
      return _rgbToHex(A.r+(B.r-A.r)*t, A.g+(B.g-A.g)*t, A.b+(B.b-A.b)*t);
    };
    const _darken=(hex,t)=>_mix(hex,'#000000',t);
    const _lighten=(hex,t)=>_mix(hex,'#ffffff',t);

    // 기본 컬러
    const base1 = _hexToRgb(c1) ? c1 : '#1e3a8a';
    const base2 = _hexToRgb(c2) ? c2 : '#2563eb';
    const base3 = _darken(base1, 0.15);

    // 클래스 정리
    try{
      hdr.classList.remove('hdr-stripes','hdr-glass','hdr-aurora','hdr-mesh');
      if(fx==='glass') hdr.classList.add('hdr-glass');
      else if(fx==='aurora') hdr.classList.add('hdr-aurora');
      else if(fx==='mesh') hdr.classList.add('hdr-mesh');
      else hdr.classList.add('hdr-stripes'); // classic 기본
    }catch(e){}

    // CSS 변수로 전달
    try{
      hdr.style.setProperty('--hdr-c1', base1);
      hdr.style.setProperty('--hdr-c2', base2);
      hdr.style.setProperty('--hdr-c3', base3);
    }catch(e){}

    // 배경(이미지 포함)
    try{
      let g = '';
      // fx별 기본 배경 (그라데이션 말고도 제공)
      if(fx==='solid'){
        g = base2;
      } else if(fx==='glass'){
        // glass는 CSS에서 배경/블러 처리를 하므로, 여기서 background를 덮어쓰지 않음
        g = '';
      } else {
        // classic/aurora/mesh는 기본 그라데이션을 유지하고, 효과는 ::before로 표현
        g = `linear-gradient(135deg,${base1} 0%,${base2} 55%,${base3} 100%)`;
      }
      if(bgImg){
        // glass 모드일 때는 gradient를 합치지 않고 배경 이미지만 깔기
        if(fx==='glass'){
          hdr.style.backgroundImage = `url('${bgImg.replace(/'/g,"%27")}')`;
        }else{
          hdr.style.backgroundImage = `${g}, url('${bgImg.replace(/'/g,"%27")}')`;
        }
        hdr.style.backgroundSize = 'cover';
        hdr.style.backgroundPosition = 'center';
        hdr.style.backgroundRepeat = 'no-repeat';
      }else{
        if(fx==='glass'){
          hdr.style.background = '';
        }else{
          hdr.style.background = g;
        }
        hdr.style.backgroundImage = '';
        hdr.style.backgroundSize = '';
        hdr.style.backgroundPosition = '';
        hdr.style.backgroundRepeat = '';
      }
    }catch(e){}

    // 전체 테마(주색) 동기화
    try{
      if(syncTheme){
        const accent = base2;
        const blue = accent;
        const blueD = _darken(accent, 0.18);
        const blueL = _lighten(accent, 0.86);
        const blueLL = _lighten(accent, 0.92);
        // body에 inline으로 깔면 dark 모드 변수도 덮어씀
        const tgt = document.body || document.documentElement;
        tgt.style.setProperty('--blue', blue);
        tgt.style.setProperty('--blue-d', blueD);
        tgt.style.setProperty('--blue-l', blueL);
        tgt.style.setProperty('--blue-ll', blueLL);
      }else{
        const tgt = document.body || document.documentElement;
        tgt.style.removeProperty('--blue');
        tgt.style.removeProperty('--blue-d');
        tgt.style.removeProperty('--blue-l');
        tgt.style.removeProperty('--blue-ll');
      }
    }catch(e){}
  }
  if(tEl){
    try{
      if(title) tEl.textContent=title;
      // 문서 타이틀도 함께 반영
      if(title) document.title = `⭐ ${title}`;
    }catch(e){}
  }
  if(iEl){
    try{
      const v = leftIco || '🏆';
      // URL이면 이미지, 아니면 텍스트(이모지)로 처리
      if(/^https?:\/\//i.test(v)){
        iEl.innerHTML = `<img alt="" src="${v.replace(/"/g,'&quot;')}" style="width:${leftSz}px;height:${leftSz}px;object-fit:contain;display:block">`;
      }else{
        iEl.textContent = v;
        iEl.style.fontSize = leftSz+'px';
      }
    }catch(e){}
  }
  if(rEl){
    try{
      if(rightImg){
        rEl.src = rightImg;
        rEl.style.display = '';
        rEl.style.width = rightSz+'px';
        rEl.style.height = rightSz+'px';
      }else{
        rEl.style.display = 'none';
      }
    }catch(e){}
  }
};
// 초기 1회 적용(렌더 전후 대응)
try{ window._applyHeaderSettings(); }catch(e){}
// 헤더 적용 후 테마도 다시 적용(우선순위: 테마 vars → 헤더 sync는 --blue만 건드림)
try{ window._applyThemeVars && window._applyThemeVars(); }catch(e){}

// ─────────────────────────────────────────────────────────────
// 반응형 UI 스케일(자동): 브라우저/기기 폭에 따라 글자/아이콘 크기 자동 조절
// - CSS 변수 --uiS 로 제어 (style.css에서 적용)
// ─────────────────────────────────────────────────────────────
function _applyUiScale(){
  try{
    const w = Math.max(320, Math.min(1920, window.innerWidth || 1024));
    // 모바일은 살짝 작게(정보 밀도↑), 태블릿/PC는 기본
    let s = 1;
    if (w <= 360) s = 0.92;
    else if (w <= 430) s = 0.96;
    else if (w <= 520) s = 0.98;
    else if (w <= 768) s = 1.00;
    else if (w <= 1024) s = 1.02;
    else s = 1.00;
    // (신규) 수동 UI 스케일(폰트 크기) — 자동값에 곱해서 전역 적용
    // - 기기별 분리: su_ui_scale_pc_pct / su_ui_scale_tb_pct / su_ui_scale_mb_pct
    // - 구버전 호환: su_ui_scale_pct
    try{
      const legacy = parseInt(localStorage.getItem('su_ui_scale_pct')||'100',10) || 100;
      const key = w <= 768 ? 'su_ui_scale_mb_pct' : (w <= 1024 ? 'su_ui_scale_tb_pct' : 'su_ui_scale_pc_pct');
      const pct = parseInt(localStorage.getItem(key)||String(legacy),10) || legacy;
      const mul = Math.max(80, Math.min(140, pct)) / 100;
      s = s * mul;
    }catch(e){}
    document.documentElement.style.setProperty('--uiS', String(s));
  }catch(e){}
}
window.addEventListener('resize', ()=>{ _applyUiScale(); }, {passive:true});
// 설정에서 즉시 반영할 수 있도록 노출
window._applyUiScale = _applyUiScale;
_applyUiScale();

// ─────────────────────────────────────────────────────────────
// (요청사항) 모든 탭 공통 자동 맞춤(모바일/태블릿)
// - 간격/패딩/카드·그리드 밀도/테이블 패딩 등을 화면에 맞춰 조절
// - 설정: localStorage su_af_alltabs_v1 = '1'
// ─────────────────────────────────────────────────────────────
function _applyAllTabsAutoFit(){
  const key = 'su_af_alltabs_v1';
  let on = false;
  try{ on = (localStorage.getItem(key) === '1'); }catch(e){ on = false; }

  try{
    // 모바일 주소창 변동 대응용 CSS vh 변수
    const vh = (window.innerHeight || 800) * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  }catch(e){}

  try{
    if(document.body) document.body.classList.toggle('af-on', !!on);
  }catch(e){}
  if(!on) return;

  const w = Math.max(320, Math.min(1920, window.innerWidth || 1024));
  const h = Math.max(480, Math.min(2160, window.innerHeight || 800));
  const landscape = w > h;
  const isMobile = w <= 768;
  const isTablet = w > 768 && w <= 1024;

  // 기본값(PC)
  let bodyPad = 16, mainPad = 18, gap = 12, cardMin = 120, cardPad = 14;
  let tdx = 12, tdy = 8;

  if(isTablet){
    bodyPad = 12; mainPad = 14; gap = 10; cardMin = 110; cardPad = 12;
    tdx = 10; tdy = 7;
  }
  if(isMobile){
    bodyPad = 10; mainPad = 12; gap = 8; cardMin = 92; cardPad = 10;
    tdx = 8; tdy = 6;
  }
  // 가로모드(특히 모바일 가로)는 세로공간이 부족하니 더 촘촘하게
  if(landscape && w <= 1024){
    bodyPad = Math.max(6, bodyPad - 2);
    mainPad = Math.max(8, mainPad - 2);
    gap = Math.max(6, gap - 1);
    tdy = Math.max(5, tdy - 1);
  }

  try{
    const r = document.documentElement;
    r.style.setProperty('--af-body-pad', bodyPad+'px');
    r.style.setProperty('--af-main-pad', mainPad+'px');
    r.style.setProperty('--af-gap', gap+'px');
    r.style.setProperty('--af-card-min', cardMin+'px');
    r.style.setProperty('--af-card-pad', cardPad+'px');
    r.style.setProperty('--af-tdx', tdx+'px');
    r.style.setProperty('--af-tdy', tdy+'px');
  }catch(e){}
}
window._applyAllTabsAutoFit = _applyAllTabsAutoFit;
window.addEventListener('resize', ()=>{ _applyAllTabsAutoFit(); }, {passive:true});
window.addEventListener('orientationchange', ()=>{ setTimeout(_applyAllTabsAutoFit, 50); }, {passive:true});
_applyAllTabsAutoFit();

// ─────────────────────────────────────────────────────────────
// (요청사항) 기록 카드(모든 기록 탭) 테마/밝기 설정
// - 승리 대학색을 카드 배경/헤더에 연하게 적용
// ─────────────────────────────────────────────────────────────
function _applyRecCardTheme(){
  const onKey='su_rc_theme_on';
  const acKey='su_rc_accent_mode';
  const bgKey='su_rc_bg_alpha';
  const hdKey='su_rc_hd_alpha';
  const iconKey='su_rc_uicon';
  const univFontKey='su_rc_univ_font_pct';
  const ymScaleKey='su_ym_scale_pct';
  const memoKey='su_rc_memo_on';
  const vsKey='su_rc_vs_align';
  const scKey='su_rc_score_scale';
  let on=true, accent='none', bg=12, hd=14, uicon=24;
  let univFontPct=110, ymScalePct=100;
  let memoOn=false, vsAlign='left', scScale=100;
  try{
    const v=localStorage.getItem(onKey); if(v!=null) on = v==='1';
    const a=localStorage.getItem(acKey); if(a) accent=a;
    const b=parseInt(localStorage.getItem(bgKey)||'',10); if(!isNaN(b)) bg=b;
    const h=parseInt(localStorage.getItem(hdKey)||'',10); if(!isNaN(h)) hd=h;
    const ic=parseInt(localStorage.getItem(iconKey)||'',10); if(!isNaN(ic)) uicon=ic;
    const uf=parseInt(localStorage.getItem(univFontKey)||'',10); if(!isNaN(uf)) univFontPct=uf;
    const ys=parseInt(localStorage.getItem(ymScaleKey)||'',10); if(!isNaN(ys)) ymScalePct=ys;
    const mo=localStorage.getItem(memoKey); if(mo!=null) memoOn = mo==='1';
    const va=localStorage.getItem(vsKey); if(va) vsAlign=va;
    const ss=parseInt(localStorage.getItem(scKey)||'',10); if(!isNaN(ss)) scScale=ss;
  }catch(e){}
  bg=Math.max(0,Math.min(30,bg));
  hd=Math.max(0,Math.min(30,hd));
  uicon=Math.max(12,Math.min(34,uicon));
  univFontPct=Math.max(90,Math.min(150,univFontPct||100));
  ymScalePct=Math.max(80,Math.min(140,ymScalePct||100));
  accent = ['none','header','border','full','gradient'].includes(accent) ? accent : 'none';
  vsAlign = ['left','center','right'].includes(vsAlign) ? vsAlign : 'left';
  scScale = Math.max(80, Math.min(130, scScale||100));
  const vsJust = (vsAlign==='center')?'center':(vsAlign==='right')?'flex-end':'flex-start';

  try{
    if(document.body){
      document.body.classList.toggle('rc-theme-on', !!on);
      document.body.classList.toggle('rc-accent-header', !!on && accent==='header');
      document.body.classList.toggle('rc-accent-border', !!on && accent==='border');
      document.body.classList.toggle('rc-accent-full', !!on && accent==='full');
      document.body.classList.toggle('rc-accent-gradient', !!on && accent==='gradient');
    }
    document.documentElement.style.setProperty('--rc-bg-a', String(bg/100));
    document.documentElement.style.setProperty('--rc-hd-a', String(hd/100));
    document.documentElement.style.setProperty('--rc-uicon', uicon+'px');
    document.documentElement.style.setProperty('--rc-univ-font-scale', String(univFontPct/100));
    document.documentElement.style.setProperty('--ym-scale', String(ymScalePct/100));
    document.documentElement.style.setProperty('--rc-memo-on', memoOn?'1':'0');
    document.documentElement.style.setProperty('--rc-vs-justify', vsJust);
    document.documentElement.style.setProperty('--rc-score-scale', String(scScale/100));
  }catch(e){}
}
window._applyRecCardTheme=_applyRecCardTheme;
_applyRecCardTheme();

// ─────────────────────────────────────────────────────────────
// (요청사항) 대회탭 카드(조별리그 일정 등) 테마/디자인 모드
// ─────────────────────────────────────────────────────────────
function _applyTourneyCardTheme(){
  const onKey='su_tc_theme_on';
  const acKey='su_tc_accent_mode';
  const hdKey='su_tc_hd_alpha';
  const bwKey='su_tc_border_w';
  const icKey='su_tc_uicon';
  const lwKey='su_tc_line_w';
  const laKey='su_tc_line_a';
  let on=false, accent='none', hd=12, bw=4, ic=34;
  let lw=2, la=70;
  try{
    const v=localStorage.getItem(onKey); if(v!=null) on = v==='1';
    const a=localStorage.getItem(acKey); if(a) accent=a;
    const h=parseInt(localStorage.getItem(hdKey)||'',10); if(!isNaN(h)) hd=h;
    const b=parseInt(localStorage.getItem(bwKey)||'',10); if(!isNaN(b)) bw=b;
    const i=parseInt(localStorage.getItem(icKey)||'',10); if(!isNaN(i)) ic=i;
    const w=parseInt(localStorage.getItem(lwKey)||'',10); if(!isNaN(w)) lw=w;
    const o=parseInt(localStorage.getItem(laKey)||'',10); if(!isNaN(o)) la=o;
  }catch(e){}
  hd=Math.max(0,Math.min(30,hd));
  bw=Math.max(2,Math.min(6,bw));
  ic=Math.max(24,Math.min(48,ic));
  lw=Math.max(1,Math.min(4,lw));
  la=Math.max(25,Math.min(100,la));
  accent = ['none','header','border'].includes(accent) ? accent : 'none';

  try{
    if(document.body){
      document.body.classList.toggle('tc-theme-on', !!on);
      document.body.classList.toggle('tc-accent-header', !!on && accent==='header');
      document.body.classList.toggle('tc-accent-border', !!on && accent==='border');
    }
    document.documentElement.style.setProperty('--tc-hd-a', String(hd/100));
    document.documentElement.style.setProperty('--tc-bw', bw+'px');
    document.documentElement.style.setProperty('--tc-uicon', ic+'px');
    document.documentElement.style.setProperty('--tc-line-w', lw+'px');
    document.documentElement.style.setProperty('--tc-line-a', String(la/100));
  }catch(e){}
}
window._applyTourneyCardTheme=_applyTourneyCardTheme;
_applyTourneyCardTheme();

// ─────────────────────────────────────────────────────────────
// 설정 런타임 공용 부팅
// - 설정탭 진입 여부와 무관하게 앱 시작 시 바로 적용되어야 하는 설정만 모음
// - settings.js(UI)와 분리된 런타임 SSOT
// ─────────────────────────────────────────────────────────────
try{
  if(typeof window._cfgFemcoDefaults !== 'function'){
    window._cfgFemcoDefaults = function(){
      return {
        autoLayout: 1,
        logoSize: 150,
        logoPos: 'top',
        logoAttachTitle: 1,
        headGap: 10,
        titleSize: 28,
        titleFont: 'system',
        playerImgSize: 46,
        playerImgShape: 'square',
        rowsPerCol: 5,
        colWidth: 170,
        colGap: 10,
        univGap: 18,
        countFontSize: 12,
        contentPadX: 16,
        contentAlign: 'left',
        contentOffsetX: 0,
        univSubtitles: {},
        subtitleSize: 12,
        subtitleWeight: 800,
        subtitleColor: '',
        nameFontSize: 12,
        roleFontSize: 10,
        tierBadgeSize: 10,
        tierBadgePadX: 6,
        starSize: 15,
        statusIconSize: 18,
        univColorOverrides: {},
        univBgMedia: {},
        bgOverlay: 22,
        logoOffsetX: 0,
        logoOffsetY: 0,
        titleOffsetX: 0,
        titleOffsetY: 0,
        titlePos: 'bottom'
      };
    };
  }
  if(typeof window._cfgFemcoLoad !== 'function'){
    window._cfgFemcoLoad = function(){
      try{
        const raw = localStorage.getItem('b2_femco_settings_v1');
        const base = (typeof window._cfgFemcoDefaults === 'function') ? window._cfgFemcoDefaults() : {};
        if(!raw) return base;
        const obj = JSON.parse(raw) || {};
        return {
          ...base,
          ...obj,
          univSubtitles:{...(base.univSubtitles||{}), ...(obj.univSubtitles||{})},
          univColorOverrides:{...(base.univColorOverrides||{}), ...(obj.univColorOverrides||{})},
          univBgMedia:{...(base.univBgMedia||{}), ...(obj.univBgMedia||{})}
        };
      }catch(e){
        try{ return (typeof window._cfgFemcoDefaults === 'function') ? window._cfgFemcoDefaults() : {}; }catch(_){ return {}; }
      }
    };
  }
  if(typeof window._cfgFemcoSave !== 'function'){
    window._cfgFemcoSave = function(obj){
      try{ localStorage.setItem('b2_femco_settings_v1', JSON.stringify(obj||{})); }catch(e){}
      try{ if(typeof window._markLocalSettingsChanged === 'function') window._markLocalSettingsChanged(); }catch(e){}
      try{ if(typeof window._scheduleCloudAppSettingsSave === 'function') window._scheduleCloudAppSettingsSave(); }catch(e){}
    };
  }
}catch(e){}

window._applyAllRuntimeSettings = function(){
  try{ if(typeof window._applyAppFont === 'function') window._applyAppFont(); }catch(e){}
  try{ if(typeof window._applyUiBtnStyle === 'function') window._applyUiBtnStyle(); }catch(e){}
  try{ if(typeof window.applyDesignV2 === 'function') window.applyDesignV2(); }catch(e){}
  try{ if(typeof window._applyThemeVars === 'function') window._applyThemeVars(); }catch(e){}
  try{ if(typeof window._applyHeaderSettings === 'function') window._applyHeaderSettings(); }catch(e){}
  try{ if(typeof window._applyUiScale === 'function') window._applyUiScale(); }catch(e){}
  try{ if(typeof window._applyAllTabsAutoFit === 'function') window._applyAllTabsAutoFit(); }catch(e){}
  try{ if(typeof window._applyRecCardTheme === 'function') window._applyRecCardTheme(); }catch(e){}
  try{ if(typeof window._applyTourneyCardTheme === 'function') window._applyTourneyCardTheme(); }catch(e){}
  try{ if(typeof applyProfileShapeVars === 'function') applyProfileShapeVars(); }catch(e){}
  try{ if(typeof applyUnivLogoVars === 'function') applyUnivLogoVars(); }catch(e){}
  try{ if(typeof applyBoard2LogoVars === 'function') applyBoard2LogoVars(); }catch(e){}
  try{ if(typeof applyResponsiveUiVars === 'function') applyResponsiveUiVars(); }catch(e){}
  try{ if(typeof applyMatchDetailVars === 'function') applyMatchDetailVars(); }catch(e){}
};
try{ window._applyAllRuntimeSettings(); }catch(e){}

window.__suNeedsBootstrapData = async function(){
  try{
    if(typeof window.__suHasIndexedDBData === 'function'){
      try{
        if(await window.__suHasIndexedDBData()) return false;
      }catch(e){}
    }
    const hasAnyLocalKey = (k)=>{ try{ const v=localStorage.getItem(k); return !!(v && v.length>2); }catch(e){ return false; } };
    const hasRecordKeys = ['su_mm','su_um','su_ck','su_pro','su_cm','su_tn','su_ttm','su_indm','su_gjm'].some(hasAnyLocalKey);
    const hasRuntimeRecordData = [
      (typeof miniM!=='undefined' ? miniM : window.miniM),
      (typeof univM!=='undefined' ? univM : window.univM),
      (typeof ckM!=='undefined' ? ckM : window.ckM),
      (typeof proM!=='undefined' ? proM : window.proM),
      (typeof comps!=='undefined' ? comps : window.comps),
      (typeof tourneys!=='undefined' ? tourneys : window.tourneys),
      (typeof ttM!=='undefined' ? ttM : window.ttM),
      (typeof indM!=='undefined' ? indM : window.indM),
      (typeof gjM!=='undefined' ? gjM : window.gjM)
    ].some(v=>Array.isArray(v) && v.length > 0);
    const hasRuntimeUnivCfg = (typeof univCfg!=='undefined' && Array.isArray(univCfg) && univCfg.length > 0)
      || (Array.isArray(window.univCfg) && window.univCfg.length > 0);
    const hasRuntimeMaps = (typeof maps!=='undefined' && Array.isArray(maps) && maps.length > 0)
      || (Array.isArray(window.maps) && window.maps.length > 0);
    const hasCoreGlobals = hasRuntimeUnivCfg && hasRuntimeMaps;
    const localPlayers = (typeof J==='function') ? J('su_p') : null;
    const hasLocalPlayers = Array.isArray(localPlayers)
      ? localPlayers.length > 0
      : !!(localPlayers && typeof localPlayers==='object' && Array.isArray(localPlayers.p) && localPlayers.p.length > 0);
    if((hasRecordKeys || hasRuntimeRecordData || hasLocalPlayers) && hasCoreGlobals) return false;
    if(window.__suBootDataApplied && hasCoreGlobals && (hasRecordKeys || hasRuntimeRecordData || hasLocalPlayers)) return false;
    return true;
  }catch(e){
    return true;
  }
};

window.__suApplyImportedData = async function(d, opts){
  if(!d || typeof d !== 'object') return false;
  const options = opts || {};
  let next = d;
  // LZString 압축 데이터 자동 해제
  if(next && typeof next._lz === 'string'){
    try{ next = JSON.parse(LZString.decompressFromBase64(next._lz)); }
    catch(e){ console.warn('[자동 불러오기] 압축 해제 실패:', e); }
  }
  const _needCore = !(
    (Array.isArray(next.univCfg) && next.univCfg.length) ||
    (Array.isArray(next.univConfig) && next.univConfig.length) ||
    (Array.isArray(next.universities) && next.universities.length)
  ) || !(
    (Array.isArray(next.maps) && next.maps.length) ||
    (Array.isArray(next.map) && next.map.length)
  );
  if(_needCore){
    const _CORE_URLS = [
      'data/core.json',
      'https://raw.githubusercontent.com/nada1004/star-system/main/star-datacenter/data/core.json',
      'https://cdn.jsdelivr.net/gh/nada1004/star-system@main/star-datacenter/data/core.json'
    ];
    for(const coreUrl of _CORE_URLS){
      try{
        const res = await fetch(coreUrl, {cache:'no-store', mode:'cors'});
        if(!res || !res.ok) continue;
        const core = JSON.parse(await res.text());
        if(core && typeof core === 'object'){
          if(!(Array.isArray(next.univCfg) && next.univCfg.length) && Array.isArray(core.univCfg) && core.univCfg.length) next.univCfg = core.univCfg;
          if(!(Array.isArray(next.maps) && next.maps.length) && Array.isArray(core.maps) && core.maps.length) next.maps = core.maps;
          if(!(Array.isArray(next.notices) && next.notices.length) && Array.isArray(core.notices) && core.notices.length) next.notices = core.notices;
          break;
        }
      }catch(e){}
    }
  }
  players  = next.players  || next.player  || [];
  univCfg  = next.univCfg  || next.univConfig || next.universities || univCfg;
  maps     = next.maps     || next.map     || maps;
  tourD    = next.tourD    || next.tournamentDates || Array(15).fill('');
  miniM    = next.miniM    || next.mini    || next.miniMatches || [];
  univM    = next.univM    || next.univ    || next.univMatches || [];
  comps    = next.comps    || next.comp    || next.competitions || [];
  ckM      = next.ckM      || next.ck      || next.ckMatches   || [];
  compNames= next.compNames|| next.competitionNames || [];
  curComp  = next.curComp  || next.currentComp || '';
  proM     = next.proM     || next.pro     || next.proMatches  || [];
  tourneys = next.tourneys || next.tournaments || next.tourney || [];
  ttM      = next.ttM      || next.tt      || [];
  indM     = next.indM     || next.ind     || next.indMatches || [];
  gjM      = next.gjM      || next.gj      || next.gjMatches  || [];
  if(next.notices && next.notices.length) notices = next.notices;
  if(next.tiers && next.tiers.length) TIERS.splice(0, TIERS.length, ...next.tiers);
  const allD=[...miniM,...univM,...comps,...ckM,...proM];
  mergeValidYearsIntoOptions(yearOptions, allD);
  try{ fixPoints(); }catch(e){}
  try{
    if(typeof _migrateTierTourneys==='function'){
      if(typeof _ttMigrated!=='undefined') _ttMigrated=false;
      _migrateTierTourneys();
    }
  }catch(e){}
  try{
    if(typeof _migrateTierTourName==='function'){
      if(typeof _tierTourNameMigrated!=='undefined') _tierTourNameMigrated=false;
      _migrateTierTourName();
    }
  }catch(e){}
  if(options.persist !== false){
    try{ localSave(); }catch(e){}
  }
  try{ window.__suBootDataApplied = true; }catch(e){}
  try{ window.__suInitialDataPending = false; }catch(e){}
  if(options.render !== false){
    try{ if(typeof render==='function') render(true); }catch(e){}
  }
  return true;
};

// ─────────────────────────────────────────────────────────────
// 상단 탭/필터바와 기록 인라인바는 공통 `enableDragScroll()`로 처리
// ─────────────────────────────────────────────────────────────
// 초기 1회
setTimeout(()=>{ try{ window.enableDragScroll && window.enableDragScroll(); }catch(e){} }, 400);

// ── 사이트 첫 접속 시 자동 불러오기 ──
(async function autoLoad(){
  try{
    if(typeof window.__suNeedsBootstrapData === 'function'){
      const needsBootstrap = await window.__suNeedsBootstrapData();
      if(!needsBootstrap) return;
    }
  }catch(e){}
  console.log('[자동 불러오기] 로컬 데이터 없음 → GitHub 자동 로드');
  // (복구) 번들에 포함된 data.json을 최우선으로 시도
  const _LOCAL = 'data.json';
  // (수정) 실제 경로: star-datacenter/data.json
  const _RAW = 'https://raw.githubusercontent.com/nada1004/star-system/main/star-datacenter/data.json';
  const _API = 'https://api.github.com/repos/nada1004/star-system/contents/star-datacenter/data.json';
  const _CDN = 'https://cdn.jsdelivr.net/gh/nada1004/star-system@main/star-datacenter/data.json';
  const _PROXY = 'https://api.allorigins.win/raw?url=' + encodeURIComponent(_RAW);
  const urls = [_LOCAL, _RAW, _CDN, _API, _PROXY];
  if(typeof window.gsSetStatus === 'function') window.gsSetStatus('🔄 데이터 불러오는 중...','var(--blue)');
  let d = null;
  try{
    if(window.__suBootDataPromise){
      d = await window.__suBootDataPromise;
      if(d) console.log('[자동 불러오기] 성공: boot data preload');
    }
  }catch(e){}
  for(const url of (d ? [] : urls)){
    try{
      const res = await Promise.race([
        fetch(url, {cache:'no-store', mode:'cors'}),
        new Promise((_,r)=>setTimeout(()=>r(new Error('timeout')),10000))
      ]);
      if(!res || !res.ok) continue;
      const text = await res.text();
      if(!text || !text.trim()) continue;
      let raw;
      try{ raw = JSON.parse(text); }catch(e){ continue; }
      if(raw && raw.content && raw.encoding==='base64'){
        try{
          const b64 = raw.content.replace(/\s/g,'');
          const bin = atob(b64);
          const bytes = new Uint8Array(bin.length);
          for(let i=0;i<bin.length;i++) bytes[i]=bin.charCodeAt(i);
          d = JSON.parse(new TextDecoder('utf-8').decode(bytes));
        }catch(e){ continue; }
      } else {
        d = raw;
      }
      if(d){ console.log('[자동 불러오기] 성공:', url); break; }
    }catch(e){ console.log('[자동 불러오기] 실패:', url, e.message); continue; }
  }
  if(d){
    try{
      if(window.__suBootDataApplied) return;
      const _skipRenderForReadyTotal = (typeof curTab!=='undefined' && curTab==='total' && Array.isArray(players) && players.length);
      await window.__suApplyImportedData(d, { render: !_skipRenderForReadyTotal });
      try{ window.__suInitialDataPending = false; }catch(e){}
      // 단순 부트스트랩(data.json) 적용은 조용히 처리하고, "완료" 배지는 최신 원격 동기화 경로에서만 사용
      if(typeof window.gsSetStatus === 'function') window.gsSetStatus('','');
    }catch(e){
      console.error('[자동 불러오기] 데이터 적용 오류:', e);
      try{ window.__suInitialDataPending = false; }catch(e){}
      if(typeof window.gsSetStatus === 'function') window.gsSetStatus('','');
    }
  } else {
    try{ window.__suInitialDataPending = false; }catch(e){}
    if(typeof window.gsSetStatus === 'function') window.gsSetStatus('','');
    console.warn('[자동 불러오기] 모든 URL 실패');
  }
})();
