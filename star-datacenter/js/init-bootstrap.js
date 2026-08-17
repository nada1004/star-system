/* ══════════════════════════════════════════════════════════════
   초기화 - 드래그스크롤/티어 일반복원 유틸 + 앱 부트스트랩(init) (init.js 에서 분리, 2026-07-30)
   ══════════════════════════════════════════════════════════════ */

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
function _ttGeneralRestoreKey(m){
  try{
    const c = String(m?.compName||m?.n||m?.t||'').trim();
    const stage = String(m?.stage||'general').trim() || 'general';
    return [
      String(m?.d||'').trim(),
      String(m?.a||'').trim(),
      String(m?.b||'').trim(),
      c,
      stage
    ].join('|');
  }catch(e){
    return '';
  }
}
function _getTierGeneralRestoreDeletedState(){
  try{
    const raw = JSON.parse(localStorage.getItem('su_tt_general_restore_deleted')||'{}') || {};
    return {
      ids: new Set(Array.isArray(raw.ids) ? raw.ids.map(v=>String(v||'').trim()).filter(Boolean) : []),
      keys: new Set(Array.isArray(raw.keys) ? raw.keys.map(v=>String(v||'').trim()).filter(Boolean) : [])
    };
  }catch(e){
    return { ids:new Set(), keys:new Set() };
  }
}
function _rememberDeletedTierGeneralRestoreMatch(m){
  try{
    if(!m || typeof m!=='object') return false;
    const stage = String(m.stage||'general').trim() || 'general';
    if(stage !== 'general') return false;
    const state = _getTierGeneralRestoreDeletedState();
    const id = String(m._id||'').trim();
    const key = _ttGeneralRestoreKey(m);
    if(id) state.ids.add(id);
    if(key) state.keys.add(key);
    localStorage.setItem('su_tt_general_restore_deleted', JSON.stringify({
      ids: [...state.ids].slice(-400),
      keys: [...state.keys].slice(-400)
    }));
    return true;
  }catch(e){
    return false;
  }
}
try{
  window._ttGeneralRestoreKey = _ttGeneralRestoreKey;
  window._rememberDeletedTierGeneralRestoreMatch = _rememberDeletedTierGeneralRestoreMatch;
}catch(e){}
async function _mergeTierGeneralRestore(){
  try{
    if(_ttGeneralRestoreLoading) return;
    _ttGeneralRestoreLoading = true;
    const res = await fetch('data/tt-general-restore.json?v=20260505-01', {cache:'no-store'});
    if(!res || !res.ok){ _ttGeneralRestoreLoading = false; return; }
    const arr = await res.json();
    if(!Array.isArray(arr) || !arr.length){ _ttGeneralRestoreLoading = false; return; }
    if(typeof ttM==='undefined' || !Array.isArray(ttM)) window.ttM = [];
    const suppressed = _getTierGeneralRestoreDeletedState();
    const existingIds = new Set((ttM||[]).map(m=>String(m&&m._id||'').trim()).filter(Boolean));
    const existingKeys = new Set((ttM||[]).map(m=>{
      return _ttGeneralRestoreKey(m);
    }));
    let added = 0;
    arr.forEach(m=>{
      if(!m || typeof m!=='object') return;
      if(!m.stage) m.stage='general';
      const id = String(m._id||'').trim();
      const c = String(m.compName||m.n||m.t||'').trim();
      const key = _ttGeneralRestoreKey(m);
      if((id && suppressed.ids.has(id)) || suppressed.keys.has(key)) return;
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
      window.LOG('티어대회 일반 기록 복구', '추가:', added, '원본:', arr.length);
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
  // (요청사항) 설정탭이 막혀있는 기기에서도 "링크 1회 방문"으로 동기화 페어링 가능
  try{
    const params = new URLSearchParams(window.location.search);
    const gid = String(params.get('gist')||params.get('gid')||'').trim();
    if(gid && window.SettingsStore && typeof window.SettingsStore.setCfg==='function'){
      window.SettingsStore.setCfg({ gistId: gid, enabled: true });
      try{ await window.SettingsStore.pull({ silent:true, force:true }); }catch(e){}
    }
  }catch(e){}
  // (요청사항) 다른 기기에서 저장된 "설정(Gist)"이 있으면 시작 시 반영
  // - 새 신호가 있을 때만 pull 됨
  // ⚡ 첫 화면 표시를 막지 않도록 백그라운드로 실행 (네트워크 왕복 대기 없이 로컬 데이터로 먼저 렌더),
  //   변경 신호가 있으면 pull 완료 후 재렌더 (주기적 자동 갱신과 동일한 패턴)
  try{
    if(window.SettingsStore && typeof window.SettingsStore.pullOnSignal==='function'){
      window.SettingsStore.pullOnSignal({ silent:true, returnInfo:true }).then(info=>{
        try{
          if(info && info.ok && !info.skipped && typeof render==='function') render();
        }catch(e){}
      }).catch(()=>{});
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
    // 비동기 인증 완료 후 로그인 상태 재적용 (계정 검증 결과 UI 반영)
    window._authInitPromise.then(()=>{
      try{ applyLoginState(); }catch(e){}
    }).catch(()=>{});
  }catch(e){ try{ initLoginHash(); }catch(_){} }
  applyLoginState();
  try{ if(typeof window._applyTabLinkFromUrl==='function') window._applyTabLinkFromUrl(); }catch(e){}
  render();
  // [FIX-IMG-FLICKER-ALLTABS] (요청, 2026-08-17) 탭을 이동할 때마다 목록이 통째로 다시
  // 그려지면서 사진 <img>가 새로 생성되는데, 아직 한 번도 표시되지 않은 스트리머의 사진은
  // 브라우저가 아직 다운로드조차 안 한 상태라 처음 그 탭에 들어갈 때 빈 박스로 보였다가
  // 나타난다. 앱이 켜지고 초기 화면이 그려진 뒤, 우선순위 낮게(브라우저가 한가할 때)
  // 등록된 모든 스트리머의 썸네일을 미리 한 번씩 요청해 브라우저 캐시에 데워둔다.
  // 이렇게 해두면 이후 어떤 탭으로 이동해도 이미 캐시에 있는 사진이라 decoding="sync"와
  // 맞물려 빈 화면 없이 바로 표시된다.
  try{
    const _prewarmAllPlayerPhotos = ()=>{
      try{
        if(typeof prewarmImageUrls !== 'function') return;
        const list = (typeof players !== 'undefined' && Array.isArray(players)) ? players : [];
        const urls = [];
        list.forEach(p=>{
          if(p && p.photo) urls.push(p.photo);
          if(p && p.secondProfileFile) urls.push(p.secondProfileFile);
        });
        if(urls.length) prewarmImageUrls(urls, 400, 96);
      }catch(e){}
    };
    if(typeof requestIdleCallback === 'function'){
      requestIdleCallback(_prewarmAllPlayerPhotos, { timeout: 4000 });
    }else{
      setTimeout(_prewarmAllPlayerPhotos, 1500);
    }
  }catch(e){}
  // (요청사항) 주기적으로 설정 신호 확인(다른 기기 변경 반영)
  try{
    if(!window._settingsAutoPullTimer && window.SettingsStore && typeof window.SettingsStore.pullOnSignal==='function'){
      window._settingsAutoPullTimer = setInterval(()=>{
        try{
          window.SettingsStore.pullOnSignal({ silent:true, returnInfo:true }).then(info=>{
            try{
              if(info && info.ok && !info.skipped && typeof render==='function'){
                // (버그수정) 검색창 등에 입력/한글 조합 중이거나 모달이 열려있으면
                // 전체 재렌더로 화면을 새로 그리면 IME 조합이 깨지고(예: 라이브탭 검색창
                // 한글 입력 도중 글자가 깨지는 문제) 포커스도 끊기므로, 이번 주기는
                // 건너뛰고 다음 15초 주기 또는 입력 종료 시점에 반영한다.
                const active = document.activeElement;
                const isTyping = active && (active.tagName==='INPUT' || active.tagName==='TEXTAREA' || active.isContentEditable);
                let hasOpenModal = false;
                try{
                  hasOpenModal = Array.from(document.querySelectorAll('.modal,[id$="Modal"],[id$="modal"]')).some(el=>{
                    const st = window.getComputedStyle(el);
                    return st.display !== 'none' && st.visibility !== 'hidden';
                  });
                }catch(e){}
                if(isTyping || hasOpenModal){
                  window._settingsAutoPullPending = true;
                  return;
                }
                render();
              }
            }catch(e){}
          }).catch(()=>{});
        }catch(e){}
      }, 15000);
    }
  }catch(e){}
  // (버그수정) 위에서 입력/모달 중이라 미뤄둔(_settingsAutoPullPending) 재렌더를
  // 입력창 blur 또는 한글 조합 종료 시점에 뒤늦게 반영한다.
  try{
    if(!window._settingsAutoPullFlushBound){
      window._settingsAutoPullFlushBound = true;
      const _flushPendingRender = ()=>{
        if(!window._settingsAutoPullPending) return;
        setTimeout(()=>{
          try{
            const active = document.activeElement;
            const stillTyping = active && (active.tagName==='INPUT' || active.tagName==='TEXTAREA' || active.isContentEditable);
            if(stillTyping) return;
            window._settingsAutoPullPending = false;
            if(typeof render==='function') render();
          }catch(e){}
        }, 50);
      };
      document.addEventListener('focusout', _flushPendingRender, true);
      document.addEventListener('compositionend', _flushPendingRender, true);
    }
  }catch(e){}
  try{ setTimeout(()=>{ if(typeof window._applyDeepLinkFromUrl==='function') window._applyDeepLinkFromUrl(); }, 80); }catch(e){}
  // (성능) 부가 기능은 idle 시 지연 로딩
  // - BGM/멀티뷰는 초기 렌더와 무관하므로, 최초 로딩을 가볍게 유지
  try{
    const loadExtras = ()=>{
      try{
        if(typeof window._loadScriptOnce!=='function') return;
        window._loadScriptOnce('js/yt-bgm.js?v=20260717-ds01').catch(()=>{});
        window._loadScriptOnce('js/soop-multiview.js?v=20260717-ds01').catch(()=>{});
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
