/* ══════════════════════════════════════════════════════════════
   대전기록 - 매치인덱스 & 진입점 (history-match-index.js 에서 분리, 2026-07-30)
   ══════════════════════════════════════════════════════════════ */

function _getMatchIndex(){
  // 데이터가 자주 바뀌는 앱이라, 없으면 생성 / 너무 오래됐으면 재생성
  const idx = window._matchIndex;
  if(!idx) return _buildMatchIndex();
  // 데이터 로딩/동기화 타이밍 이슈로, 길이 변화가 있으면 즉시 재인덱싱
  const cur = {
    mini: (typeof miniM!=='undefined' && miniM ? miniM.length : 0),
    univm: (typeof univM!=='undefined' && univM ? univM.length : 0),
    ck: (typeof ckM!=='undefined' && ckM ? ckM.length : 0),
    pro: (typeof proM!=='undefined' && proM ? proM.length : 0),
    tt: (typeof ttM!=='undefined' && ttM ? ttM.length : 0),
    comp: (typeof comps!=='undefined' && comps ? comps.length : 0),
    tourney: (typeof tourneys!=='undefined' && tourneys ? tourneys.length : 0),
    procomp: (typeof proTourneys!=='undefined' && proTourneys ? proTourneys.length : 0),
    ind: (typeof indM!=='undefined' && indM ? indM.length : 0),
    gj: (typeof gjM!=='undefined' && gjM ? gjM.length : 0)
  };
  const prev = idx.sizes || {};
  const changed = Object.keys(cur).some(k => (prev[k]||0) !== cur[k]);
  if(changed) return _buildMatchIndex();
  if(!idx.builtAt || (Date.now()-idx.builtAt) > 20000) return _buildMatchIndex(); // 20초 캐시
  return idx;
}

// ─────────────────────────────────────────────────────────────
// 스트리머 상세 "최근 경기"에서 종목(배지) 클릭 → 경기 상세 팝업
// - matchId가 게임ID(_sN_gN)일 수 있어 세션ID로 정규화 후 찾음
// - 찾은 match를 histDetModal(경기 상세)로 표시
// ─────────────────────────────────────────────────────────────
window.openMatchDetailByMatchId = function(matchId, modeLabel){
  return window._openMatchDetailByMatchId(matchId, modeLabel, false);
};

// 내부 구현: silent=true면 실패 시 alert 안 띄움
