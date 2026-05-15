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
try{
  const _cfgRemotePolicy = localStorage.getItem('su_cfg_remote_policy_v2');
  if(_cfgRemotePolicy !== '1'){
    localStorage.setItem('su_cfg_remote_auto', '1');
    localStorage.setItem('su_cfg_remote_policy_v2', '1');
  }
}catch(e){}
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
        // (모바일 개선) 버튼 위에서 스와이프할 때도 가로 스크롤이 되게 허용
        // - 마우스에서는 클릭 방해가 커서 기존처럼 차단
        // - 터치/펜에서는 드래그 스크롤을 허용하고, 이동한 경우 click을 차단하는 기존 로직으로 처리
        if (t && (t.closest('button') || t.closest('input') || t.closest('select') || t.closest('textarea') || t.closest('a'))){
          if(e.pointerType==='mouse') return;
        }
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
try{ window._seedTierTtM = _seedTierTtM; }catch(e){}

let _ttGeneralRestoreLoading = false;
async function _mergeTierGeneralRestore(){
  try{
    if(_ttGeneralRestoreLoading) return;
    _ttGeneralRestoreLoading = true;
    const res = await fetch('data/tt-general-restore.json?v=20260505-01', {cache:'no-store'});
    if(!res || !res.ok){ _ttGeneralRestoreLoading = false; return; }
    const arr = await res.json();
    if(!Array.isArray(arr) || !arr.length){ _ttGeneralRestoreLoading = false; return; }
    if(typeof ttM==='undefined' || !Array.isArray(ttM)) window.ttM = [];
    const existingIds = new Set((ttM||[]).map(m=>String(m&&m._id||'').trim()).filter(Boolean));
    const existingKeys = new Set((ttM||[]).map(m=>{
      const d=String(m&&m.d||'').trim();
      const a=String(m&&m.a||'').trim();
      const b=String(m&&m.b||'').trim();
      const c=String(m&&m.compName||m&&m.n||m&&m.t||'').trim();
      const st=String(m&&m.stage||'general').trim();
      return [d,a,b,c,st].join('|');
    }));
    let added = 0;
    arr.forEach(m=>{
      if(!m || typeof m!=='object') return;
      if(!m.stage) m.stage='general';
      const c = String(m.compName||m.n||m.t||'').trim();
      const id = String(m._id||'').trim();
      const key = [String(m.d||'').trim(), String(m.a||'').trim(), String(m.b||'').trim(), c, String(m.stage||'general').trim()].join('|');
      if((id && existingIds.has(id)) || existingKeys.has(key)) return;
      if(!m.compName && c) m.compName = c;
      if(!m.n && c) m.n = c;
      if(!m.t && c) m.t = c;
      ttM.unshift(m);
      if(id) existingIds.add(id);
      existingKeys.add(key);
      added++;
    });
    if(added){
      try{ ttM.sort((a,b)=>(String(b?.d||'')).localeCompare(String(a?.d||''))); }catch(e){}
      try{ if(typeof _ttMigrated!=='undefined') _ttMigrated=false; }catch(e){}
      try{ if(typeof save==='function') save(); }catch(e){}
      try{ if(typeof syncTierTtMHistory==='function') syncTierTtMHistory(); }catch(e){}
      try{ if(typeof render==='function') render(); }catch(e){}
      console.log('[티어대회 일반 기록 복구] 추가:', added, '원본:', arr.length);
    }
    _ttGeneralRestoreLoading = false;
  }catch(e){
    _ttGeneralRestoreLoading = false;
  }
}
try{ window._mergeTierGeneralRestore = _mergeTierGeneralRestore; }catch(e){}

async function init(){
  try{
    if(window.MatchStore && typeof window.MatchStore.init==='function') await window.MatchStore.init();
    if(window.PlayerStore && typeof window.PlayerStore.init==='function') await window.PlayerStore.init();
  }catch(e){}
  // (요청사항) 다른 기기에서 저장된 "설정(Gist)"이 있으면 시작 시 반영
  // - 새 신호가 있을 때만 pull 됨
  try{
    if(window.SettingsStore && typeof window.SettingsStore.pullOnSignal==='function'){
      await window.SettingsStore.pullOnSignal({ silent:true });
    }
  }catch(e){}
  fixPoints();
  // 티어대회 기록(ttM) 시드가 있으면 로드(비동기) — 로컬 데이터가 비어 있을 때만
  try{ _seedTierTtM(); }catch(e){}
  // 티어대회 일반 기록 복구 JSON이 있으면 누락분만 병합
  try{ _mergeTierGeneralRestore(); }catch(e){}
  // 전역 폰트 설정 적용
  try{ if(typeof window._applyAppFont === 'function') window._applyAppFont(); }catch(e){}
  // (요청사항) 버튼/필 스타일 설정 적용
  try{ if(typeof window._applyUiBtnStyle === 'function') window._applyUiBtnStyle(); }catch(e){}
  // 🎨 디자인 모드(리뉴얼) 적용
  try{ if(typeof window.applyDesignV2 === 'function') window.applyDesignV2(); }catch(e){}
  // ELO 미설정 선수에게 기본값 부여
  if(typeof ELO_DEFAULT!=='undefined'){
    players.forEach(p=>{ if(p.elo===undefined||p.elo===null) p.elo=ELO_DEFAULT; });
  }
  // 대회(tourneys) 기록 자동 소급 반영 (미반영분만, 중복 방지 내장)
  if(typeof syncTourneyHistory==='function') syncTourneyHistory();
  // 티어대회 데이터 마이그레이션 (조별리그/브라켓 기록 → ttM 동기화)
  if(typeof _migrateTierTourneys==='function') _migrateTierTourneys();
  // 티어대전 → 티어대회 명칭 마이그레이션
  if(typeof _migrateTierTourName==='function') _migrateTierTourName();
  // 대학별 전적 정합성 보정: 과거 팀전 history의 잘못된 소속 대학 기록을 1회 재생성
  try{
    const affFixVer = '20260504-aff-univ-fix-01';
    if(localStorage.getItem('su_hist_aff_fix_ver') !== affFixVer){
      if(typeof _rebuildAllPlayerHistoryCore === 'function') _rebuildAllPlayerHistoryCore();
      if(typeof localSave === 'function') localSave();
      localStorage.setItem('su_hist_aff_fix_ver', affFixVer);
    }
  }catch(e){}
  // 연도 필터는 getYearOptions()가 렌더링 시 동적으로 계산하므로 별도 추출 불필요
  const ptier=document.getElementById('p-tier');
  if(ptier) ptier.innerHTML=TIERS.map(t=>`<option value="${t}">${getTierLabel(t)}</option>`).join('');
  try{refreshSel();}catch(e){}
  try{
    window._authInitPromise = (async()=>{
      await initLoginHash();
      if(typeof window.refreshSessionAuthority === 'function'){
        await window.refreshSessionAuthority(true);
      }
    })();
  }catch(e){ try{ initLoginHash(); }catch(_){} }
  applyLoginState();
  try{ if(typeof window._applyTabLinkFromUrl==='function') window._applyTabLinkFromUrl(); }catch(e){}
  render();
  // (요청사항) 주기적으로 설정 신호 확인(다른 기기 변경 반영)
  try{
    if(!window._settingsAutoPullTimer && window.SettingsStore && typeof window.SettingsStore.pullOnSignal==='function'){
      window._settingsAutoPullTimer = setInterval(()=>{
        try{
          window.SettingsStore.pullOnSignal({ silent:true, returnInfo:true }).then(info=>{
            try{
              if(info && info.ok && !info.skipped && typeof render==='function') render();
            }catch(e){}
          }).catch(()=>{});
        }catch(e){}
      }, 15000);
    }
  }catch(e){}
  try{ setTimeout(()=>{ if(typeof window._applyDeepLinkFromUrl==='function') window._applyDeepLinkFromUrl(); }, 80); }catch(e){}
  // (성능) 부가 기능은 idle 시 지연 로딩
  // - BGM/멀티뷰는 초기 렌더와 무관하므로, 최초 로딩을 가볍게 유지
  try{
    const loadExtras = ()=>{
      try{
        if(typeof window._loadScriptOnce!=='function') return;
        window._loadScriptOnce('js/yt-bgm.js?v=20260420-06').catch(()=>{});
        window._loadScriptOnce('js/soop-multiview.js?v=20260504-02').catch(()=>{});
      }catch(e){}
    };
    if('requestIdleCallback' in window) requestIdleCallback(loadExtras, {timeout: 2500});
    else setTimeout(loadExtras, 1200);
  }catch(e){}
  setTimeout(showNoticePopup, 800);
  // 🆕 URL 파라미터로 선수/대학 자동 오픈
  setTimeout(()=>{
    try{
      const params = new URLSearchParams(window.location.search);
      const playerParam = params.get('player');
      const univParam = params.get('univ');
      const queryParam = params.get('query');
      if(playerParam && typeof openPlayerModal==='function'){
        openPlayerModal(decodeURIComponent(playerParam));
      } else if(univParam && typeof openUnivModal==='function'){
        openUnivModal(decodeURIComponent(univParam));
      } else if(queryParam){
        const q = decodeURIComponent(queryParam);
        const exact = players.find(p=>p.name===q);
        if(exact && typeof openPlayerModal==='function'){
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
}
init();
initDark();

// ─────────────────────────────────────────────────────────────
// (요청사항) 설정 변경 → 다른 기기 "바로" 반영 보강
// - 설정 변경 신호가 있을 때만 원격 설정 pull
// - 토큰이 없는 기기도 신호를 보고 읽기만 가능
// ─────────────────────────────────────────────────────────────
(function(){
  if(window._settingsAutoSyncStarted) return;
  window._settingsAutoSyncStarted = true;

  const doPull = async ()=>{
    try{
      if(!window.SettingsStore || typeof window.SettingsStore.pullOnSignal!=='function') return;
      const c = window.SettingsStore.cfg ? window.SettingsStore.cfg() : { gistId:'' };
      if(!c || !c.gistId) return;
      const info = await window.SettingsStore.pullOnSignal({silent:true, returnInfo:true});
      if(!info || info.skipped) return;
      try{
        if(typeof window.refreshSessionAuthority === 'function'){
          await window.refreshSessionAuthority(true);
        }
      }catch(e){}
      // 설정 팝업이 열려있고 AI 섹션이 보이면 입력값/상태 즉시 반영
      try{
        const m = document.getElementById('cfgModal');
        if(m && m.style.display!=='none'){
          const sec = document.getElementById('cfg-sec-aibot');
          if(sec && sec.closest && sec.closest('#cfgModalBody')){
            if(typeof window.cfgInitAiProxy==='function') window.cfgInitAiProxy();
          }
        }
      }catch(e){}
    }catch(e){}
  };

  // 첫 신호 확인
  setTimeout(doPull, 1200);
  // 설정 변경 신호 확인
  setInterval(doPull, 8000);
  // 포커스/재진입 시 신호 확인
  try{ window.addEventListener('focus', ()=>doPull()); }catch(e){}
  try{
    document.addEventListener('visibilitychange', ()=>{
      if(document.visibilityState === 'visible') doPull();
    });
  }catch(e){}
})();

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
window._applyAppFontScale = function(){
  try{
    const w = Math.max(320, Math.min(1920, window.innerWidth || 1024));
    const legacy = parseInt(localStorage.getItem('su_app_font_scale_pct')||'100',10) || 100;
    const key = w <= 768 ? 'su_app_font_scale_mb_pct' : (w <= 1024 ? 'su_app_font_scale_tb_pct' : 'su_app_font_scale_pc_pct');
    const pct = parseInt(localStorage.getItem(key)||String(legacy),10) || legacy;
    const mul = Math.max(85, Math.min(130, pct)) / 100;
    document.documentElement.style.setProperty('--fontS', String(mul));
  }catch(e){}
};
// 초기 1회 적용(렌더 전후 모두 대응)
try{ window._applyAppFont(); }catch(e){}
try{ window._applyAppFontScale(); }catch(e){}

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
  try{ if(typeof window._applyAppFontScale === 'function') window._applyAppFontScale(); }catch(e){}
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
  let memoOn=false, vsAlign='center', scScale=108;
  // (요청사항) 배경 효과 완전 OFF 감지(승리 배경 + 양끝 효과 모두 OFF)
  let sideFxOn = true;
  try{
    const v=localStorage.getItem(onKey); if(v!=null) on = v==='1';
    const sfx=localStorage.getItem('su_rec_side_fx_on'); if(sfx!=null) sideFxOn = sfx!=='0';
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
  vsAlign = ['left','center','right'].includes(vsAlign) ? vsAlign : 'center';
  scScale = Math.max(80, Math.min(130, scScale||108));
  const vsJust = (vsAlign==='center')?'center':(vsAlign==='right')?'flex-end':'flex-start';

  try{
    if(document.body){
      document.body.classList.toggle('rc-theme-on', !!on);
      document.body.classList.toggle('rc-accent-header', !!on && accent==='header');
      document.body.classList.toggle('rc-accent-border', !!on && accent==='border');
      document.body.classList.toggle('rc-accent-full', !!on && accent==='full');
      document.body.classList.toggle('rc-accent-gradient', !!on && accent==='gradient');
      // 배경 효과(모드 컬러/헤더 틴트 포함) 완전 OFF 시, 잔색 제거용 클래스
      document.body.classList.toggle('rc-bgfx-off', (!on && !sideFxOn));
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

// 팀 버튼 스타일 초기 적용
(function(){
  try{
    var TEAM_BTN_STYLES=['solid','pill','badge','gradient','chip-xl','neon','outline','flat'];
    var v=localStorage.getItem('su_rc_team_btn_style')||'solid';
    if(v&&v!=='solid'&&TEAM_BTN_STYLES.indexOf(v)!==-1) document.body.classList.add('team-btn--'+v);
  }catch(e){}
})();

// 버튼 모양 테마 초기 적용
(function(){
  try{
    var BTN_THEMES=['default','flat','outline','pill','soft','glass','retro','neon','brutal'];
    var v=localStorage.getItem('su_btn_theme')||'default';
    if(v&&v!=='default'&&BTN_THEMES.indexOf(v)!==-1) document.body.classList.add('btn-theme--'+v);
  }catch(e){}
})();

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
// 상단 탭/필터바와 기록 인라인바는 공통 `enableDragScroll()`로 처리
// ─────────────────────────────────────────────────────────────
// 초기 1회
setTimeout(()=>{ try{ window.enableDragScroll && window.enableDragScroll(); }catch(e){} }, 400);

// ── 사이트 첫 접속 시 자동 불러오기 ──
(async function autoLoad(){
  try{
    try{
      if(window.MatchStore && typeof window.MatchStore.init==='function') await window.MatchStore.init();
      if(window.PlayerStore && typeof window.PlayerStore.init==='function') await window.PlayerStore.init();
    }catch(e){}
    // (복구) 로컬 기록이 있으면 자동 불러오기 금지 (덮어쓰기 방지)
    const hasAnyLocalKey = (k)=>{ try{ const v=localStorage.getItem(k); return !!(v && v.length>2); }catch(e){ return false; } };
    const hasAnyRecordPayload = (payload)=>{
      if(!payload || typeof payload!=='object') return false;
      return ['miniM','univM','comps','ckM','proM','proTourneys','tourneys','ttM','indM','gjM']
        .some(k=>Array.isArray(payload[k]) && payload[k].length>0);
    };
    const hasMatchIdbData = await (async()=>{
      try{
        if(!window.indexedDB) return false;
        const db = await new Promise((resolve,reject)=>{
          const req = indexedDB.open('star_datacenter_matches', 1);
          req.onupgradeneeded = ()=>resolve(req.result);
          req.onsuccess = ()=>resolve(req.result);
          req.onerror = ()=>reject(req.error||new Error('indexedDB open failed'));
        });
        if(!db || !db.objectStoreNames.contains('match_payloads')) return false;
        const payload = await new Promise((resolve,reject)=>{
          const tx = db.transaction('match_payloads','readonly');
          const req = tx.objectStore('match_payloads').get('main');
          req.onsuccess = ()=>resolve(req.result||null);
          req.onerror = ()=>reject(req.error||new Error('indexedDB get failed'));
        });
        return hasAnyRecordPayload(payload);
      }catch(e){
        return false;
      }
    })();
    const hasPlayerIdbData = await (async()=>{
      try{
        if(window.PlayerStore && typeof window.PlayerStore.load==='function'){
          const payload = await window.PlayerStore.load();
          return !!(payload && Array.isArray(payload.players) && payload.players.length>0);
        }
      }catch(e){}
      return Array.isArray(players) && players.length>0;
    })();
    const hasRuntimePlayers = Array.isArray(players) && players.length>0;
    const hasRuntimeRecords = [miniM,univM,comps,ckM,proM,tourneys,ttM,indM,gjM].some(v=>Array.isArray(v)&&v.length>0);
    const hasRecordKeys = ['su_mm','su_um','su_ck','su_pro','su_cm','su_tn','su_ttm','su_indm','su_gjm'].some(hasAnyLocalKey) || hasMatchIdbData;
    if(hasRuntimePlayers || hasRuntimeRecords) return;
    if(hasRecordKeys && hasPlayerIdbData) return;
  }catch(e){}
  console.log('[자동 불러오기] 로컬 데이터 없음 → GitHub 자동 로드');
  const _fetchAutoJson = async (url)=>{
    const res = await Promise.race([
      fetch(url, {cache:'no-store', mode:'cors'}),
      new Promise((_,r)=>setTimeout(()=>r(new Error('timeout')),10000))
    ]);
    if(!res || !res.ok) throw new Error(`fetch failed: ${url}`);
    const text = await res.text();
    if(!text || !text.trim()) throw new Error(`empty response: ${url}`);
    let raw = JSON.parse(text);
    if(raw && raw.content && raw.encoding==='base64'){
      const b64 = raw.content.replace(/\s/g,'');
      const bin = atob(b64);
      const bytes = new Uint8Array(bin.length);
      for(let i=0;i<bin.length;i++) bytes[i]=bin.charCodeAt(i);
      raw = JSON.parse(new TextDecoder('utf-8').decode(bytes));
    }
    if(raw && typeof raw._lz === 'string'){
      raw = JSON.parse(LZString.decompressFromBase64(raw._lz));
    }
    return raw;
  };
  const _resolveAutoUrl = (baseUrl, rel)=>{
    try{
      let next = String(rel || '').trim();
      next = next.replace(/^\.?\//,'');
      next = next.replace(/^star-datacenter\//,'');
      return new URL(next, new URL(baseUrl, location.href)).toString();
    }
    catch(e){ return String(rel || ''); }
  };
  const _recoverMatchArraysFromPlayerHistoryLocal = (baseData, monthParts)=>{
    const out = {...(baseData||{})};
    if(!Array.isArray(out.indM)) out.indM = [];
    if(!Array.isArray(out.gjM)) out.gjM = [];
    const needInd = !out.indM.length;
    const needGj = !out.gjM.length;
    if(!needInd && !needGj) return out;
    const seenInd = new Set();
    const seenGj = new Set();
    (Array.isArray(monthParts)?monthParts:[]).filter(Boolean).forEach(part=>{
      const ph = part && part.playerHistory || {};
      Object.keys(ph).forEach(name=>{
        (Array.isArray(ph[name]) ? ph[name] : []).forEach(h=>{
          const mode = String(h && h.mode || '').trim();
          const opp = String(h && h.opp || '').trim();
          const res = String(h && h.result || '').trim();
          if(!opp || !res) return;
          let target = '';
          let proLabel = false;
          if(mode === '개인전') target = 'ind';
          else if(mode === '끝장전') target = 'gj';
          else if(mode === '프로리그끝장전'){ target = 'gj'; proLabel = true; }
          else return;
          if((target==='ind' && !needInd) || (target==='gj' && !needGj)) return;
          let wName='', lName='';
          if(res === '승'){ wName = name; lName = opp; }
          else if(res === '패'){ wName = opp; lName = name; }
          else return;
          const d = String(h.date || h.d || '').trim();
          const map = String(h.map || '').trim();
          const mid = String(h.matchId || '').trim();
          const key = mid || [target, proLabel?'pro':'normal', d, map, wName, lName].join('|');
          if(target === 'ind'){
            if(seenInd.has(key)) return;
            seenInd.add(key);
            out.indM.push({ _id: mid || key, d, wName, lName, map: map || '-' });
            return;
          }
          if(seenGj.has(key)) return;
          seenGj.add(key);
          const rec = { _id: mid || key, d, wName, lName, map: map || '-' };
          if(proLabel) rec._proLabel = true;
          out.gjM.push(rec);
        });
      });
    });
    const _byDateDesc = (a,b)=>String(b && b.d || '').localeCompare(String(a && a.d || ''));
    if(needInd) out.indM.sort(_byDateDesc);
    if(needGj) out.gjM.sort(_byDateDesc);
    return out;
  };
  const _recoverCivilMiniFromPlayerHistoryLocal = (baseData, monthParts)=>{
    const out = {...(baseData||{})};
    if(!Array.isArray(out.miniM)) out.miniM = [];
    const hasCivil = out.miniM.some(m=>m && (m.type==='civil' || (m.a==='A팀' && m.b==='B팀')));
    if(hasCivil) return out;
    const gameMap = new Map();
    (Array.isArray(monthParts)?monthParts:[]).filter(Boolean).forEach(part=>{
      const ph = part && part.playerHistory || {};
      Object.keys(ph).forEach(name=>{
        (Array.isArray(ph[name]) ? ph[name] : []).forEach(h=>{
          if(String(h && h.mode || '').trim() !== '시빌워') return;
          const matchId = String(h.matchId || '').trim();
          if(!matchId) return;
          const prev = gameMap.get(matchId) || { _id:matchId, d:String(h.date||'').trim(), map:String(h.map||'').trim(), wName:'', lName:'', univMap:{} };
          prev.d = prev.d || String(h.date||'').trim();
          prev.map = prev.map || String(h.map||'').trim();
          prev.univMap[name] = String(h.univ || '').trim();
          if(h.result === '승'){ prev.wName = name; prev.lName = String(h.opp || '').trim(); }
          else if(h.result === '패'){ prev.wName = String(h.opp || '').trim(); prev.lName = name; }
          gameMap.set(matchId, prev);
        });
      });
    });
    if(!gameMap.size) return out;
    const sessions = new Map();
    const parseParts = (matchId)=>{
      const m = String(matchId||'').match(/^(.*)_s(\d+)_g(\d+)$/);
      if(m) return { base:m[1], setIdx:+m[2], gameIdx:+m[3] };
      return { base:String(matchId||''), setIdx:0, gameIdx:0 };
    };
    for(const rec of gameMap.values()){
      const { base, setIdx, gameIdx } = parseParts(rec._id);
      if(!rec.wName || !rec.lName) continue;
      if(!sessions.has(base)) sessions.set(base, { _id:base, d:rec.d||'', games:[], players:new Map(), adj:new Map() });
      const sess = sessions.get(base);
      sess.d = sess.d || rec.d || '';
      sess.games.push({ ...rec, setIdx, gameIdx });
      [rec.wName, rec.lName].forEach(n=>{
        if(!n) return;
        if(!sess.players.has(n)) sess.players.set(n, { name:n, univ:String(rec.univMap && rec.univMap[n] || '') });
        if(!sess.adj.has(n)) sess.adj.set(n, new Set());
      });
      sess.adj.get(rec.wName).add(rec.lName);
      sess.adj.get(rec.lName).add(rec.wName);
    }
    const recovered = [];
    for(const sess of sessions.values()){
      const side = new Map();
      for(const n of sess.players.keys()){
        if(side.has(n)) continue;
        side.set(n, 'A');
        const q=[n];
        while(q.length){
          const cur=q.shift();
          const curSide=side.get(cur);
          (sess.adj.get(cur)||[]).forEach(nx=>{
            if(!side.has(nx)){ side.set(nx, curSide==='A'?'B':'A'); q.push(nx); }
          });
        }
      }
      const setsMap = new Map();
      sess.games.sort((a,b)=>(a.setIdx-b.setIdx)||(a.gameIdx-b.gameIdx));
      sess.games.forEach(g=>{
        const sA = side.get(g.wName)||'A';
        const playerA = sA==='A' ? g.wName : g.lName;
        const playerB = sA==='A' ? g.lName : g.wName;
        const winner = sA==='A' ? 'A' : 'B';
        if(!setsMap.has(g.setIdx)) setsMap.set(g.setIdx, { scoreA:0, scoreB:0, winner:'', games:[] });
        const st = setsMap.get(g.setIdx);
        if(winner==='A') st.scoreA++; else st.scoreB++;
        st.games.push({ _id:g._id, playerA, playerB, winner, map:g.map||'-', wName:g.wName, lName:g.lName });
      });
      const sets = [...setsMap.entries()].sort((a,b)=>a[0]-b[0]).map(([,st])=>{
        st.winner = st.scoreA>st.scoreB ? 'A' : (st.scoreB>st.scoreA ? 'B' : '');
        return st;
      });
      const teamAMembers = [...sess.players.values()].filter(p=>(side.get(p.name)||'A')==='A');
      const teamBMembers = [...sess.players.values()].filter(p=>(side.get(p.name)||'A')==='B');
      const sa = sets.reduce((n,s)=>n+(s.scoreA||0),0);
      const sb = sets.reduce((n,s)=>n+(s.scoreB||0),0);
      recovered.push({ _id:sess._id, d:sess.d||'', a:'A팀', b:'B팀', sa, sb, sets, type:'civil', teamAMembers, teamBMembers });
    }
    recovered.sort((a,b)=>String(b && b.d || '').localeCompare(String(a && a.d || '')));
    if(recovered.length) out.miniM = out.miniM.concat(recovered);
    return out;
  };
  const _recoverTierGeneralFromPlayerHistoryLocal = (baseData, monthParts)=>{
    const out = {...(baseData||{})};
    if(!Array.isArray(out.ttM)) out.ttM = [];
    const existing = new Set(out.ttM.map(m=>String(m && m._id || '')).filter(Boolean));
    const tierIdMap = new Map(((Array.isArray(out.tourneys) ? out.tourneys : [])||[])
      .filter(t=>t && t.type==='tier' && t.id && t.name)
      .map(t=>[String(t.id).trim(), String(t.name).trim()]));
    const parseTierComp = (mid)=>{
      const s = String(mid||'').trim();
      let tid = '';
      let m = s.match(/^pbn_([^_]+)_/);
      if(m) tid = m[1];
      if(!tid){
        m = s.match(/^([a-z0-9]+)_s\d+_g\d+$/i);
        if(m) tid = m[1];
      }
      return tierIdMap.get(tid) || '복구된 일반전';
    };
    const byId = new Map();
    (Array.isArray(monthParts)?monthParts:[]).filter(Boolean).forEach(part=>{
      const ph = part && part.playerHistory || {};
      Object.keys(ph).forEach(name=>{
        (Array.isArray(ph[name]) ? ph[name] : []).forEach(h=>{
          if(String(h && h.mode || '').trim() !== '티어대회') return;
          const mid = String(h.matchId || '').trim();
          if(!mid || existing.has(mid)) return;
          const prev = byId.get(mid) || { _id:mid, d:String(h.date||'').trim(), map:String(h.map||'').trim(), wName:'', lName:'', compName:parseTierComp(mid) };
          prev.d = prev.d || String(h.date||'').trim();
          prev.map = prev.map || String(h.map||'').trim();
          if(h.result === '승'){ prev.wName = name; prev.lName = String(h.opp || '').trim(); }
          else if(h.result === '패'){ prev.wName = String(h.opp || '').trim(); prev.lName = name; }
          byId.set(mid, prev);
        });
      });
    });
    const recovered = [];
    byId.forEach(rec=>{
      if(!rec.wName || !rec.lName) return;
      recovered.push({
        _id:rec._id, d:rec.d||'', a:rec.wName, b:rec.lName, sa:1, sb:0,
        sets:[{ scoreA:1, scoreB:0, winner:'A', games:[{ _id:rec._id, playerA:rec.wName, playerB:rec.lName, winner:'A', map:rec.map||'-', wName:rec.wName, lName:rec.lName }] }],
        n:rec.compName||'복구된 일반전', compName:rec.compName||'복구된 일반전', stage:'general'
      });
    });
    recovered.sort((a,b)=>String(b && b.d || '').localeCompare(String(a && a.d || '')));
    if(recovered.length) out.ttM = out.ttM.concat(recovered);
    return out;
  };
  const _mergePlayerPhotosIntoPlayers = (arr, photoMap)=>{
    if(!Array.isArray(arr) || !photoMap || typeof photoMap!=='object') return arr;
    arr.forEach(p=>{
      if(p && p.name && !p.photo && photoMap[p.name]) p.photo = photoMap[p.name];
    });
    try{ window.playerPhotos = photoMap; }catch(e){}
    return arr;
  };
  const _mergeSplitStoreData = async (seed, seedUrl)=>{
    let idx = seed;
    if(seed && seed.indexPath){
      try{ idx = await _fetchAutoJson(_resolveAutoUrl(seedUrl, seed.indexPath)); }
      catch(e){ idx = seed; }
    }
    if(!(idx && (idx.splitStore || idx.corePath || idx.historyMonths))) return seed;
    const coreUrl = _resolveAutoUrl(seedUrl, idx.corePath || 'data/core.json');
    const historyDirUrl = _resolveAutoUrl(seedUrl, String(idx.historyDir || 'data/history/').replace(/\/?$/, '/'));
    const core = await _fetchAutoJson(coreUrl);
    const merged = {...core};
    const monthParts = [];
    const histKeys = ['miniM','univM','comps','ckM','proM','ttM','indM','gjM'];
    histKeys.forEach(k=>{ merged[k] = Array.isArray(core[k]) ? [...core[k]] : []; });
    const months = Array.isArray(idx.historyMonths) ? idx.historyMonths : [];
    for(const month of months){
      try{
        const monthUrl = _resolveAutoUrl(historyDirUrl, `${month}.json`);
        const part = await _fetchAutoJson(monthUrl);
        monthParts.push(part);
        histKeys.forEach(k=>{
          if(Array.isArray(part[k]) && part[k].length) merged[k].push(...part[k]);
        });
        if(Array.isArray(part.histExtItems) && part.histExtItems.length){
          merged.histExtItems = (Array.isArray(merged.histExtItems) ? merged.histExtItems : []).concat(part.histExtItems);
        }
      }catch(e){
        console.warn('[자동 불러오기] 월별 데이터 로드 실패:', month, e.message);
      }
    }
    try{
      const recoverFn = (typeof window.__suRecoverMatchArraysFromPlayerHistory === 'function')
        ? window.__suRecoverMatchArraysFromPlayerHistory
        : _recoverMatchArraysFromPlayerHistoryLocal;
      const recovered = recoverFn(merged, monthParts);
      if(recovered){
        if(Array.isArray(recovered.indM)) merged.indM = recovered.indM;
        if(Array.isArray(recovered.gjM)) merged.gjM = recovered.gjM;
      }
      const recoverCivilFn = (typeof window.__suRecoverCivilMiniFromPlayerHistory === 'function')
        ? window.__suRecoverCivilMiniFromPlayerHistory
        : _recoverCivilMiniFromPlayerHistoryLocal;
      const recoveredCivil = recoverCivilFn(merged, monthParts);
      if(recoveredCivil && Array.isArray(recoveredCivil.miniM)) merged.miniM = recoveredCivil.miniM;
      const recoverTierFn = (typeof window.__suRecoverTierGeneralFromPlayerHistory === 'function')
        ? window.__suRecoverTierGeneralFromPlayerHistory
        : _recoverTierGeneralFromPlayerHistoryLocal;
      const recoveredTier = recoverTierFn(merged, monthParts);
      if(recoveredTier && Array.isArray(recoveredTier.ttM)) merged.ttM = recoveredTier.ttM;
    }catch(e){
      console.warn('[자동 불러오기] playerHistory match 복구 실패:', e.message);
    }
    return merged;
  };
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
  let loadedFromUrl = '';
  for(const url of urls){
    try{
      d = await _fetchAutoJson(url);
      d = await _mergeSplitStoreData(d, url);
      if(d){ loadedFromUrl = url; console.log('[자동 불러오기] 성공:', url); break; }
    }catch(e){ console.log('[자동 불러오기] 실패:', url, e.message); continue; }
  }
  if(d){
    try{
      const hasPlayers = Array.isArray(d.players) ? d.players.length>0 : (Array.isArray(d.player) ? d.player.length>0 : false);
      if(!hasPlayers && loadedFromUrl){
        try{
          const coreFallback = await _fetchAutoJson(_resolveAutoUrl(loadedFromUrl, 'data/core.json'));
          if(Array.isArray(coreFallback.players) && coreFallback.players.length) d.players = coreFallback.players;
          if(!d.playerPhotos && coreFallback.playerPhotos) d.playerPhotos = coreFallback.playerPhotos;
          if(!d.univCfg && coreFallback.univCfg) d.univCfg = coreFallback.univCfg;
          if(!d.maps && coreFallback.maps) d.maps = coreFallback.maps;
          if(!d.tourD && coreFallback.tourD) d.tourD = coreFallback.tourD;
          if(!d.tourneys && coreFallback.tourneys) d.tourneys = coreFallback.tourneys;
        }catch(e){
          console.warn('[자동 불러오기] core fallback 실패:', e.message);
        }
      }
      const _prevIndM = Array.isArray(indM) ? indM : [];
      const _prevGjM  = Array.isArray(gjM) ? gjM : [];
      players  = d.players  || d.player  || [];
      players  = _mergePlayerPhotosIntoPlayers(players, d.playerPhotos || d.pPhotoMap || d.playerPhotoMap || null);
      try{ window.players = players; }catch(e){}
      univCfg  = d.univCfg  || d.univConfig || d.universities || univCfg;
      maps     = d.maps     || d.map     || maps;
      tourD    = d.tourD    || d.tournamentDates || Array(15).fill('');
      miniM    = d.miniM    || d.mini    || d.miniMatches || [];
      univM    = d.univM    || d.univ    || d.univMatches || [];
      comps    = d.comps    || d.comp    || d.competitions || [];
      ckM      = d.ckM      || d.ck      || d.ckMatches   || [];
      compNames= d.compNames|| d.competitionNames || [];
      curComp  = d.curComp  || d.currentComp || '';
      proM     = d.proM     || d.pro     || d.proMatches  || [];
      tourneys = d.tourneys || d.tournaments || d.tourney || [];
      ttM      = d.ttM      || d.tt      || [];
      indM     = Array.isArray(d.indM) ? d.indM : (Array.isArray(d.ind) ? d.ind : _prevIndM);
      gjM      = Array.isArray(d.gjM) ? d.gjM : _prevGjM;
      if((!indM || !indM.length) && _prevIndM.length) indM = _prevIndM;
      if((!gjM || !gjM.length) && _prevGjM.length) gjM = _prevGjM;
      try{ window.indM = indM; }catch(e){}
      try{ window.gjM = gjM; }catch(e){}
      if((!players || !players.length) && loadedFromUrl){
        try{
          const coreFallback2 = await _fetchAutoJson(_resolveAutoUrl(loadedFromUrl, 'data/core.json'));
          if(Array.isArray(coreFallback2.players) && coreFallback2.players.length) players = coreFallback2.players;
          players = _mergePlayerPhotosIntoPlayers(players, coreFallback2.playerPhotos || null);
          try{ window.players = players; }catch(e){}
        }catch(e){}
      }
      if(((!players || !players.length) || (!gjM || !gjM.length) || (!indM || !indM.length)) && loadedFromUrl){
        try{
          const idxFallback = await _fetchAutoJson(_resolveAutoUrl(loadedFromUrl, 'data/index.json'));
          const coreFallback3 = await _fetchAutoJson(_resolveAutoUrl(loadedFromUrl, String(idxFallback.corePath || 'data/core.json')));
          const historyDir = String(idxFallback.historyDir || 'data/history/').replace(/\/?$/, '/');
          const monthParts = [];
          for(const month of (Array.isArray(idxFallback.historyMonths) ? idxFallback.historyMonths : [])){
            try{ monthParts.push(await _fetchAutoJson(_resolveAutoUrl(loadedFromUrl, `${historyDir}${month}.json`))); }catch(e){}
          }
          const repaired = _recoverMatchArraysFromPlayerHistoryLocal({
            ...coreFallback3,
            miniM, univM, comps, ckM, proM, ttM, indM, gjM
          }, monthParts);
          const repairedCivil = _recoverCivilMiniFromPlayerHistoryLocal({
            ...coreFallback3,
            miniM, univM, comps, ckM, proM, ttM, indM, gjM
          }, monthParts);
          const repairedTier = _recoverTierGeneralFromPlayerHistoryLocal({
            ...coreFallback3,
            miniM, univM, comps, ckM, proM, ttM, indM, gjM
          }, monthParts);
          if((!players || !players.length) && Array.isArray(coreFallback3.players) && coreFallback3.players.length) players = coreFallback3.players;
          players = _mergePlayerPhotosIntoPlayers(players, coreFallback3.playerPhotos || null);
          try{ window.players = players; }catch(e){}
          if((!indM || !indM.length) && Array.isArray(repaired.indM) && repaired.indM.length) indM = repaired.indM;
          if((!gjM || !gjM.length) && Array.isArray(repaired.gjM) && repaired.gjM.length) gjM = repaired.gjM;
          if(Array.isArray(repairedCivil.miniM) && repairedCivil.miniM.length > (Array.isArray(miniM)?miniM.length:0)) miniM = repairedCivil.miniM;
          if(Array.isArray(repairedTier.ttM) && repairedTier.ttM.length > (Array.isArray(ttM)?ttM.length:0)) ttM = repairedTier.ttM;
        }catch(e){
          console.warn('[자동 불러오기] split-store rescue 실패:', e.message);
        }
      }
      if(!players || !players.length){
        try{
          const coreDirect = await _fetchAutoJson('data/core.json');
          if(Array.isArray(coreDirect.players) && coreDirect.players.length) players = coreDirect.players;
          players = _mergePlayerPhotosIntoPlayers(players, coreDirect.playerPhotos || null);
          try{ window.players = players; }catch(e){}
        }catch(e){}
      }
      if(d.notices && d.notices.length) notices = d.notices;
      if(d.tiers && d.tiers.length) TIERS.splice(0, TIERS.length, ...d.tiers);
      const allD=[...miniM,...univM,...comps,...ckM,...proM];
      mergeValidYearsIntoOptions(yearOptions, allD);
      fixPoints();
      // autoLoad 후 티어대회 마이그레이션 재실행 (flag 리셋 후 재호출)
      if(typeof _migrateTierTourneys==='function'){
        if(typeof _ttMigrated!=='undefined') _ttMigrated=false;
        _migrateTierTourneys();
      }
      // autoLoad 후 티어대전→티어대회 명칭 마이그레이션 재실행
      if(typeof _migrateTierTourName==='function'){
        if(typeof _tierTourNameMigrated!=='undefined') _tierTourNameMigrated=false;
        _migrateTierTourName();
      }
      localSave(); render();
      if(typeof window.gsSetStatus === 'function') window.gsSetStatus('✅ 자동 불러오기 완료 ('+new Date().toLocaleTimeString()+')','var(--green)');
    }catch(e){
      console.error('[자동 불러오기] 데이터 적용 오류:', e);
      if(typeof window.gsSetStatus === 'function') window.gsSetStatus('','');
    }
  } else {
    if(typeof window.gsSetStatus === 'function') window.gsSetStatus('','');
    console.warn('[자동 불러오기] 모든 URL 실패');
  }
})();
