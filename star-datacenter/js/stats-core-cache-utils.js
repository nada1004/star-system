/* ══════════════════════════════════════════════════════════════
   통계 - 캐시/성별·이력 유틸 (stats-core.js 에서 분리, 2026-07-30)
   ⚠️ CSS 인젝션 IIFE(_statsInjectUiCss)는 css/stats-core.css로 전환됨
   ══════════════════════════════════════════════════════════════ */

/* ─── 캐시 (save() → su_last_save_time 변경 시 자동 무효화) ─── */
var _sCacheTime='', _sCache={}, _sCacheFilterKey='';
// [FIX-12] 탭 재진입 시 캐시 강제 무효화 플래그.
// sw('stats') 등 탭 진입 시 window._statsTabEntered=true 로 설정하면
// 다음 _scGet 호출에서 캐시를 버린다. 필터 변경 전 stale 데이터 방지.
function _scGet(sub){
  const t=localStorage.getItem('su_last_save_time')||'0';
  const fk=`${_statsDateFrom}|${_statsDateTo}|${_statsMinGames}|${_statsLastN}|${window._streakLastN||0}|${window._recordsLastN||0}`;
  if(t!==_sCacheTime||fk!==_sCacheFilterKey||window._statsTabEntered){
    _sCache={};_sCacheTime=t;_sCacheFilterKey=fk;
    window._statsTabEntered=false; // 플래그 소비
  }
  return _sCache[sub]||null;
}
function _scSet(sub,html){ _sCache[sub]=html; return html; }

// ─────────────────────────────────────────────────────────────
// HTML escape — constants.js에서 window.escHTML 전역 단일 정의됨
// 파일 스코프 로컬 alias (코드 내 escHTML() 호출 그대로 유지)
// ─────────────────────────────────────────────────────────────
const escHTML = (s) => window.escHTML(s);

/* ─── 전역 필터 상태 ─── */
var _statsDateFrom='', _statsDateTo='', _statsMinGames=10, _statsLastN=0;
// 🚀 티어 랭킹(선수) 상태 — window._statsRankTier 단일 진실 공급원
// (이전: var _statsRankTier + window._statsRankTier 이중 유지 → 단일화)
try{
  window._statsRankTier = (localStorage.getItem('su_statsRankTier') || '4티어').trim() || '4티어';
}catch(e){
  window._statsRankTier = '4티어';
}
function _statsNormGender(v){
  const s=String(v||'').trim().toUpperCase();
  if(s==='F' || s==='여' || s==='여자' || s==='W' || s==='FEMALE') return 'F';
  if(s==='M' || s==='남' || s==='남자' || s==='MALE') return 'M';
  return '';
}
function _statsAllHist(p){
  return Array.isArray(p&&p.history) ? p.history.filter(Boolean) : [];
}
function _statsSyncFilterToWindow(){
  try{
    window._statsDateFrom = _statsDateFrom || '';
    window._statsDateTo   = _statsDateTo || '';
    window._statsMinGames = Number(_statsMinGames||0) || 0;
    window._statsLastN    = Number(_statsLastN||0) || 0;
  }catch(e){}
}
function _statsHasAnyHistory(){
  try{ return (players||[]).some(p=>_statsAllHist(p).length>0); }catch(e){ return false; }
}
function _statsHasAnyMatchData(){
  try{
    const arrs=[miniM,univM,ckM,comps,proM,ttM,gjM,indM,tourneys,proTourneys];
    return arrs.some(a=>Array.isArray(a) && a.length>0);
  }catch(e){ return false; }
}
function _statsEnsureHistoryReady(){
  try{
    const sig = (function(){
      try{
        /* comps/tourneys/proTourneys는 "대회를 새로 만들 때"만 배열 길이가 늘고,
           이미 만들어진 대회 안에 조별리그/대진표 경기를 채워 넣는 편집은 배열 길이를 바꾸지 않는다.
           예전엔 배열 길이만으로 signature를 만들어서, 예를 들어 프로리그대회 조별리그·대진표에
           경기를 새로 입력해도 signature가 그대로라 자동 재생성이 트리거되지 않고
           player.history가 오래된 상태로 남아있는 문제가 있었다(리포트에 '프로리그대회' 기록 누락).
           경기 데이터가 실제로 들어있는 이 3개 배열은 JSON 문자열 길이까지 같이 반영해서
           내부 경기 추가/수정도 감지되게 한다. */
        const flat=[miniM,univM,ckM,proM,ttM,gjM,indM];
        const flatSig = flat.map(a=>Array.isArray(a)?a.length:0).join('|');
        const deep=[comps,tourneys,proTourneys];
        const deepSig = deep.map(a=>{
          if(!Array.isArray(a)) return '0';
          try{ return a.length+':'+JSON.stringify(a).length; }catch(e){ return a.length+':?'; }
        }).join('|');
        return flatSig+'||'+deepSig;
      }catch(e){
        return '';
      }
    })();
    if(window.__stats_hist_ready && window.__stats_hist_sig === sig) return;
    // 이미 history가 있으면 OK
    if(_statsHasAnyHistory() && window.__stats_hist_sig === sig){ window.__stats_hist_ready = true; return; }
    // 경기 데이터가 없으면 생성할 것도 없음
    if(!_statsHasAnyMatchData()) return;
    // 자동 재생성(무확인/무알림) — 통계 탭 기능을 살리기 위한 안전장치
    if(typeof _rebuildAllPlayerHistoryCore === 'function'){
      _rebuildAllPlayerHistoryCore();
      window.__stats_hist_ready = true;
      window.__stats_hist_sig = sig;
    }
  }catch(e){}
}
function _statsYmFromDateStr(v){
  try{
    const iso = (typeof window._toIsoDateStr === 'function') ? window._toIsoDateStr(v) : String(v||'').trim();
    const ym = String(iso||'').slice(0,7);
    return /^\d{4}-\d{2}$/.test(ym) ? ym : '';
  }catch(e){
    return '';
  }
}
function _statsLatestActiveMonths(gender){
  const g=_statsNormGender(gender);
  const _players = (typeof players!=='undefined' && Array.isArray(players)) ? players : [];
  const months=[...new Set(_players.filter(p=>!g || _statsNormGender(p.gender)===g)
    .flatMap(p=>_statsAllHist(p).map(h=>_statsYmFromDateStr(h&&h.date)).filter(Boolean))
  )].sort((a,b)=>b.localeCompare(a));
  return months;
}
