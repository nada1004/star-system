/* ══════════════════════════════════════════════════════════════
   설정 - 대학 순서 이동 (settings-cfg-apply.js 에서 분리, 2026-07-30)
   ══════════════════════════════════════════════════════════════ */

window.cfgUnivOrderMove = function(i, dir){
  try{
    i = parseInt(i, 10);
    if(isNaN(i)) return;
    if(!Array.isArray(univCfg)) return;
    // 설정 팝업에는 "해체되지 않은 대학"만 노출되므로,
    // 이동도 원본 배열의 인접 인덱스가 아니라 "표시 중인 목록 순서" 기준으로 처리해야 한다.
    const visibleIdxs = univCfg
      .map((u, idx) => ({ u, idx }))
      .filter(x => x.u && !x.u.dissolved)
      .map(x => x.idx);
    const pos = visibleIdxs.indexOf(i);
    if(pos < 0) return;
    const nextPos = pos + (dir==='up' ? -1 : 1);
    if(nextPos < 0 || nextPos >= visibleIdxs.length) return;
    const j = visibleIdxs[nextPos];
    const moved = univCfg.splice(i, 1)[0];
    // splice 제거 후 뒤쪽 요소 인덱스가 당겨지므로 보정
    const insertAt = j > i ? j - 1 : j;
    univCfg.splice(insertAt, 0, moved);
    // 중요: boardOrder가 존재하면 추후 syncBoardOrderToUnivCfg()에서 순서가 되돌아갈 수 있음
    // → boardOrder도 함께 갱신하고 "정식 save()"로 저장
    try{
      if(typeof boardOrder!=='undefined'){
        boardOrder = univCfg.map(u=>u && u.name).filter(Boolean);
      }
    }catch(e){}
    try{ if(typeof save==='function') save(); else if(typeof localSave==='function') localSave(); else if(typeof saveCfg==='function') saveCfg(); }catch(e){}
    try{ if(typeof render==='function') render(); }catch(e){}
    try{ if(typeof showToast==='function') showToast('✅ 순서 저장됨'); }catch(e){}
  }catch(e){
    try{ console.error('[cfgUnivOrderMove] failed', e); }catch(_){}
  }
};

// ─────────────────────────────────────────────────────────────
// (호환/성능) 지연 로딩으로 인해 “함수 없음”으로 오탐되는 케이스 방지용 스텁들
// - settings.js는 상세 조립 파일보다 먼저 로드되므로 여기서 먼저 기본 스텁을 제공해둔다.
// - 실제 구현 파일이 로드되면(예: `render-player-detail.js`) 자동으로 대체된다.
// ─────────────────────────────────────────────────────────────
(function(){
  // cloud-board.js에 정의됨
  function _lazyCheckFbSyncStatus(){
    try{
      const loader = window._loadScriptOnce;
      if(typeof loader !== 'function'){
        alert('기능 로딩 중입니다. 잠시 후 다시 시도해주세요.');
        return;
      }
      Promise.all([
        loader('js/cloud-board-state.js?v=20260717-ds03'),
        loader('js/cloud-board-render.js?v=20260717-ds03'),
        loader('js/cloud-board-drag.js?v=20260717-ds03'),
        loader('js/cloud-board-rank-sync.js?v=20260717-ds01')
      ]).then(()=>{
        const fn = window.checkFbSyncStatus;
        if(typeof fn === 'function' && fn !== _lazyCheckFbSyncStatus) fn();
      }).catch((e)=>{
        console.error('[lazy] checkFbSyncStatus load fail', e);
        alert('동기화 상태 확인 로딩 실패');
      });
    }catch(e){}
  }
  window.checkFbSyncStatus = window.checkFbSyncStatus || _lazyCheckFbSyncStatus;

  // calendar.js에 정의됨
  function _lazyRCal(C, T){
    try{
      const loader = window._loadScriptOnce;
      if(typeof loader !== 'function'){
        if(C) C.innerHTML = '<div style="padding:24px;color:var(--gray-l);text-align:center">캘린더 로딩 중...</div>';
        return;
      }
      loader('js/calendar.js?v=20260811-calfx2').then(()=>{
        const fn = window.rCal;
        if(typeof fn === 'function' && fn !== _lazyRCal) fn(C, T);
      }).catch((e)=>{
        console.error('[lazy] rCal load fail', e);
      });
    }catch(e){}
  }
  window.rCal = window.rCal || _lazyRCal;

  // stats.js + Chart.js에 정의됨
  function _lazyRStats(C, T){
    try{
      const loader = window._loadScriptOnce;
      if(typeof loader !== 'function'){
        if(C) C.innerHTML = '<div style="padding:24px;color:var(--gray-l);text-align:center">통계 로딩 중...</div>';
        return;
      }
      const ensureChart = window.ensureChartJS || (()=>loader('https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js'));
      // CRITICAL fix: 통계 스크립트 로딩은 render-lazy-utils.js의 _ensureStatsLoaded() 권위 소스 사용
      (window._ensureStatsLoaded ? window._ensureStatsLoaded() : Promise.resolve()).then(()=>{
        const fn = window.rStats;
        if(typeof fn === 'function' && fn !== _lazyRStats) fn(C, T);
      }).catch((e)=>{
        console.error('[lazy] rStats load fail', e);
      });
    }catch(e){}
  }
  window.rStats = window.rStats || _lazyRStats;
})();

// ─────────────────────────────────────────────────────────────
// (요청사항) "QA 체크리스트 전부 되는지" 빠른 드라이런 점검
// - 실제 사용자 데이터는 건드리지 않도록:
//   1) 전역 배열/함수(save/render/document.getElementById/localStorage 일부키)를 백업
//   2) 더미 데이터로 실행 후 원복
// - 네트워크/외부 리소스(동기화/이미지 링크)는 "함수 존재/초기화 여부"만 체크
// ─────────────────────────────────────────────────────────────
