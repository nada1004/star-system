/* ─── 캐시 (save() → su_last_save_time 변경 시 자동 무효화) ─── */
var _sCacheTime='', _sCache={}, _sCacheFilterKey='';
// [FIX-12] 탭 재진입 시 캐시 강제 무효화 플래그.
// sw('stats') 등 탭 진입 시 window._statsTabEntered=true 로 설정하면
// 다음 _scGet 호출에서 캐시를 버린다. 필터 변경 전 stale 데이터 방지.
function _scGet(sub){
  const t=localStorage.getItem('su_last_save_time')||'0';
  const fk=`${_statsDateFrom}|${_statsDateTo}|${_statsMinGames}|${_statsLastN}`;
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
var _statsDateFrom='', _statsDateTo='', _statsMinGames=3, _statsLastN=0;
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
        const arrs=[miniM,univM,ckM,comps,proM,ttM,gjM,indM,tourneys,proTourneys];
        return arrs.map(a=>Array.isArray(a)?a.length:0).join('|');
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
(function _statsInjectUiCss(){
  if(document.getElementById('stats-ui-style')) return;
  const s=document.createElement('style');
  s.id='stats-ui-style';
  s.textContent = [
    '.stats-shell{display:flex;flex-direction:column;gap:14px}',
    '.stats-hero{display:flex;align-items:flex-start;justify-content:space-between;gap:14px;padding:18px 20px;border-radius:24px;background:linear-gradient(135deg,rgba(255,255,255,.98),rgba(248,250,252,.94));border:1px solid rgba(148,163,184,.18);box-shadow:0 18px 38px rgba(15,23,42,.06),inset 0 1px 0 rgba(255,255,255,.88)}',
    '.stats-hero-copy{display:flex;flex-direction:column;gap:6px;min-width:0}',
    '.stats-hero-kicker{font-size:11px;font-weight:900;letter-spacing:.08em;color:#2563eb;text-transform:uppercase}',
    '.stats-hero-title{font-size:24px;font-weight:950;letter-spacing:-.03em;color:var(--text1);line-height:1.15}',
    '.stats-hero-desc{font-size:13px;line-height:1.6;color:var(--text3)}',
    '.stats-hero-badges{display:flex;flex-wrap:wrap;gap:8px;justify-content:flex-end}',
    '.stats-hero-badge{display:inline-flex;align-items:center;gap:6px;padding:8px 12px;border-radius:999px;background:rgba(255,255,255,.9);border:1px solid rgba(148,163,184,.16);font-size:12px;font-weight:800;color:var(--text2);box-shadow:0 10px 20px rgba(15,23,42,.04)}',
    '.stats-toolbar-card{padding:12px 14px 14px;border-radius:22px;background:linear-gradient(180deg,rgba(255,255,255,.98),rgba(248,250,252,.94));border:1px solid rgba(148,163,184,.18);box-shadow:0 16px 32px rgba(15,23,42,.05)}',
    /* ── 모드 전환(핵심/심화) 세그먼트 ── */
    '.stats-modebar{display:flex;align-items:center;gap:14px;flex-wrap:wrap;margin-bottom:14px;padding-bottom:14px;border-bottom:1px solid rgba(148,163,184,.16)}',
    '.stats-modeseg{display:inline-flex;gap:8px;padding:4px;border-radius:14px;background:rgba(148,163,184,.10);border:1px solid rgba(148,163,184,.16)}',
    '.stats-modeseg .pill{margin:0;box-shadow:none;border:none;background:transparent}',
    '.stats-modeseg .pill.on{box-shadow:0 6px 16px rgba(37,99,235,.24)}',
    '.stats-modebar-hint{font-size:11px;color:var(--gray-l);font-weight:700}',
    /* ── 그룹(개인/대학/경기/기록실) 행 ── */
    '.stats-grouprow{display:flex;flex-wrap:wrap;gap:12px;margin-bottom:12px;padding-bottom:12px;border-bottom:1px dashed rgba(148,163,184,.18)}',
    '.stats-grouprow .pill{min-width:80px;justify-content:center}',
    /* ── 서브탭(종합/티어랭킹 등) 행 ── */
    '.stats-subrow{display:flex;flex-wrap:wrap;gap:10px}',
    '@media (max-width:680px){.stats-modebar{gap:8px}.stats-modeseg{width:100%;justify-content:flex-start}.stats-modebar-hint{width:100%;text-align:left}.stats-grouprow,.stats-subrow{flex-wrap:nowrap;overflow-x:auto;-webkit-overflow-scrolling:touch;scrollbar-width:none;gap:10px}.stats-grouprow::-webkit-scrollbar,.stats-subrow::-webkit-scrollbar{display:none}.stats-grouprow .pill{min-width:0}}',
    '.stats-filter-box{display:flex;flex-direction:column;gap:8px;margin-bottom:2px;padding:12px 14px;border-radius:18px;background:linear-gradient(180deg,#f8fbff,#eff6ff);border:1px solid rgba(147,197,253,.7);box-shadow:inset 0 1px 0 rgba(255,255,255,.78)}',
    '.stats-filter-box.is-idle{background:linear-gradient(180deg,#fff,#f8fafc);border-color:rgba(148,163,184,.22)}',
    '.stats-award-toggle{display:inline-flex;align-items:center;gap:6px;padding:4px;border-radius:999px;background:var(--surface);border:1px solid var(--border)}',
    '.stats-award-toggle button{border:none;background:transparent;color:var(--text3);padding:7px 12px;border-radius:999px;font-size:12px;font-weight:900;cursor:pointer;transition:.15s}',
    '.stats-award-toggle button.on{background:linear-gradient(135deg,#1d4ed8,#2563eb);color:#fff;box-shadow:0 10px 20px rgba(37,99,235,.22)}',
    '.stats-award-toggle button.female.on{background:linear-gradient(135deg,#db2777,#f472b6)}',
    '.stats-award-toggle button.male.on{background:linear-gradient(135deg,#2563eb,#38bdf8)}',
    '.stats-award-grid{display:flex;gap:12px;flex-wrap:wrap}',
    '.stats-award-label{font-weight:900;font-size:12px;margin:6px 0 8px}',
    '.stats-award-card{position:relative;overflow:hidden;border-radius:18px;padding:20px;flex:1;min-width:220px;cursor:pointer;transition:transform .15s,box-shadow .15s,border-color .15s}',
    '.stats-award-card::before{content:"";position:absolute;inset:auto -30px -30px auto;width:120px;height:120px;background:radial-gradient(circle,rgba(255,255,255,.42),transparent 70%);pointer-events:none}',
    '.stats-award-card:hover{transform:translateY(-2px);box-shadow:0 16px 30px rgba(15,23,42,.10)}',
    '.stats-award-card.is-empty{background:linear-gradient(180deg,var(--surface),#f8fafc);border:1px solid var(--border);text-align:center;cursor:default}',
    '.stats-award-head{font-size:11px;font-weight:800;margin-bottom:8px;letter-spacing:.04em}',
    '.stats-award-body{display:flex;align-items:center;gap:10px;margin-bottom:10px}',
    '.stats-award-avatar{width:48px;height:48px;border-radius:var(--su_profile_radius,50%);display:flex;align-items:center;justify-content:center;flex-shrink:0;overflow:hidden}',
    '.stats-award-name{font-weight:900;font-size:16px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
    '.stats-award-meta{display:flex;align-items:center;gap:4px;margin-top:4px;flex-wrap:wrap}',
    '.stats-award-stats{display:flex;gap:8px;font-size:12px;flex-wrap:wrap}',
    '.stats-award-stat{color:#fff;padding:3px 9px;border-radius:999px;font-weight:800}',
    '.stats-rank-table{width:100%;border-collapse:separate;border-spacing:0;overflow:hidden;border:1px solid rgba(148,163,184,.18);border-radius:18px;background:var(--white);box-shadow:0 14px 28px rgba(15,23,42,.05)}',
    '.stats-rank-table thead th{background:linear-gradient(135deg,#0f172a,#1d4ed8 58%,#3b82f6);color:#fff;padding:12px 10px;font-size:11px;font-weight:900;letter-spacing:.03em;white-space:nowrap;border:none}',
    '.stats-rank-table tbody td{padding:11px 10px;border-bottom:1px solid rgba(148,163,184,.12);font-size:13px;vertical-align:middle;background:rgba(255,255,255,.94)}',
    '.stats-rank-table tbody tr:nth-child(even) td{background:#fbfdff}',
    '.stats-rank-table tbody tr:hover td{background:#eef6ff}',
    '.stats-rank-table tbody tr:last-child td{border-bottom:none}',
    '.stats-rank-player{cursor:pointer;color:var(--blue);font-weight:800}',
    '.stats-rank-top td{background:linear-gradient(90deg,rgba(250,204,21,.12),rgba(255,255,255,.96)) !important}',
    '.stats-list-stack{display:flex;flex-direction:column;gap:8px}',
    '.stats-list-item{display:flex;align-items:center;gap:10px;padding:10px 12px;background:linear-gradient(180deg,rgba(255,255,255,.98),rgba(248,250,252,.94));border:1px solid rgba(148,163,184,.18);border-radius:14px;box-shadow:0 8px 18px rgba(15,23,42,.04)}',
    '.stats-list-item:hover{box-shadow:0 14px 24px rgba(15,23,42,.07);transform:translateY(-1px)}',
    '.stats-inline-badge{display:inline-flex;align-items:center;justify-content:center;padding:2px 8px;border-radius:999px;font-size:10px;font-weight:800}',
    '.stats-progress{flex:1;background:var(--border2);border-radius:999px;height:14px;overflow:hidden;min-width:80px}',
    '.stats-progress-bar{height:100%;border-radius:999px;transition:.25s}',
    '.stats-surface-box{background:linear-gradient(180deg,rgba(255,255,255,.98),rgba(248,250,252,.94));border:1px solid rgba(148,163,184,.18);border-radius:16px;padding:12px 14px;box-shadow:0 10px 22px rgba(15,23,42,.04)}',
    '.stats-duo-grid{display:flex;flex-wrap:wrap;gap:8px}',
    '.stats-records-grid{display:flex;flex-wrap:wrap;gap:14px}',
    '.stats-record-item{display:flex;align-items:center;gap:8px;padding:10px 12px;background:linear-gradient(180deg,rgba(255,255,255,.98),rgba(248,250,252,.94));border:1px solid rgba(148,163,184,.18);border-radius:14px;cursor:pointer;box-shadow:0 8px 18px rgba(15,23,42,.04)}',
    '.stats-record-item.top{box-shadow:0 14px 28px rgba(15,23,42,.08)}',
    '.stats-chart-shell{display:flex;flex-direction:column;gap:14px}',
    '.stats-chart-toolbar{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap}',
    '.stats-chart-actions{display:flex;align-items:center;gap:8px;flex-wrap:wrap}',
    '.stats-select{padding:8px 11px;border:1px solid rgba(148,163,184,.28);border-radius:12px;font-size:12px;font-weight:900;min-width:220px;background:rgba(255,255,255,.92);color:var(--text1);box-shadow:inset 0 1px 0 rgba(255,255,255,.85)}',
    '.stats-chart-board{padding:14px;border-radius:20px;background:linear-gradient(180deg,rgba(255,255,255,.98),rgba(248,250,252,.94));border:1px solid rgba(148,163,184,.18);box-shadow:0 16px 30px rgba(15,23,42,.05)}',
    '.stats-chart-wrap{padding:14px 14px 10px;border-radius:18px;background:linear-gradient(180deg,#ffffff,#f8fbff);border:1px solid rgba(148,163,184,.16)}',
    '.stats-metric-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px}',
    '.stats-metric-card{padding:12px 14px;border-radius:16px;border:1px solid rgba(148,163,184,.18);background:linear-gradient(180deg,rgba(255,255,255,.98),rgba(248,250,252,.94));box-shadow:0 10px 20px rgba(15,23,42,.04)}',
    '.stats-metric-label{font-size:11px;color:var(--text3);font-weight:800;margin-bottom:6px}',
    '.stats-metric-value{font-size:20px;font-weight:950;letter-spacing:-.02em;color:var(--text1)}',
    '.stats-metric-sub{font-size:11px;color:var(--gray-l);margin-top:4px}',
    '.stats-info-stack{display:flex;flex-direction:column;gap:10px}',
    '.stats-legend-wrap{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:2px}',
    '.stats-legend-chip{display:inline-flex;align-items:center;gap:6px;padding:5px 10px;border-radius:999px;font-size:11px;font-weight:900;border:1px solid rgba(148,163,184,.22)}',
    '.stats-detail-card{display:flex;flex-direction:column;gap:8px;padding:12px;border-radius:16px;border:1px solid rgba(148,163,184,.18);background:linear-gradient(180deg,rgba(255,255,255,.98),rgba(248,250,252,.94));box-shadow:0 10px 20px rgba(15,23,42,.04)}',
    '.stats-detail-title{font-weight:900;font-size:15px}',
    '.stats-detail-row{display:flex;justify-content:space-between;gap:10px;padding:8px 10px;border-radius:10px;background:rgba(255,255,255,.92);border:1px solid rgba(148,163,184,.16)}',
    '.stats-detail-row span:first-child{font-size:12px;color:var(--text3)}',
    '.stats-detail-row span:last-child{font-size:12px;font-weight:800;color:var(--text1)}',
    '.stats-table-card{padding:12px;border-radius:20px;background:linear-gradient(180deg,rgba(255,255,255,.98),rgba(248,250,252,.94));border:1px solid rgba(148,163,184,.18);box-shadow:0 16px 30px rgba(15,23,42,.05)}',
    '.stats-search-field{padding:8px 12px;border:2px solid rgba(148,163,184,.22);border-radius:12px;font-size:13px;width:200px;background:rgba(255,255,255,.94);color:var(--text1);box-shadow:inset 0 1px 0 rgba(255,255,255,.85)}',
    '.stats-search-drop{display:none;position:absolute;top:42px;left:0;background:var(--white);border:1px solid rgba(148,163,184,.22);border-radius:14px;z-index:300;max-height:220px;overflow-y:auto;width:240px;box-shadow:0 18px 32px rgba(15,23,42,.10)}',
    '.stats-search-item{padding:8px 12px;cursor:pointer;font-size:12px}',
    '.stats-search-item:hover{background:#eff6ff}',
    '.stats-compare-shell{display:flex;flex-direction:column;gap:14px}',
    '.stats-compare-hero{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:4px}',
    '.stats-vs-card{display:flex;flex-direction:column;align-items:center;gap:8px;padding:14px;border-radius:18px;background:linear-gradient(180deg,rgba(255,255,255,.98),rgba(248,250,252,.94));border:1px solid rgba(148,163,184,.18);box-shadow:0 12px 22px rgba(15,23,42,.05)}',
    '.stats-vs-mark{font-size:22px;font-weight:950;color:var(--text3);padding:0 8px}',
    '.stats-h2h-board{padding:16px;border-radius:18px;border:1px solid rgba(148,163,184,.18);background:linear-gradient(180deg,rgba(255,255,255,.98),rgba(248,250,252,.94));text-align:center;box-shadow:0 12px 22px rgba(15,23,42,.04)}',
    '.stats-h2h-score{display:flex;align-items:center;justify-content:center;gap:16px}',
    '.stats-compare-table{width:100%;border-collapse:separate;border-spacing:0;border:1px solid rgba(148,163,184,.18);border-radius:18px;overflow:hidden;background:var(--white);box-shadow:0 14px 28px rgba(15,23,42,.05)}',
    '.stats-compare-table th,.stats-compare-table td{padding:10px 12px;border-bottom:1px solid rgba(148,163,184,.12)}',
    '.stats-compare-table tbody tr:last-child td{border-bottom:none}',
    '.stats-panel-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px}',
    '.stats-compare-duel{display:grid;grid-template-columns:minmax(0,1fr) 70px minmax(0,1fr);gap:12px;align-items:stretch}',
    '.stats-compare-univ-card{padding:14px;border-radius:18px;border:1px solid rgba(148,163,184,.18);background:linear-gradient(180deg,rgba(255,255,255,.98),rgba(248,250,252,.94));box-shadow:0 12px 22px rgba(15,23,42,.05)}',
    '.stats-compare-vs{display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:950;color:var(--text3)}',
    '.stats-compare-kpi-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:10px}',
    '.stats-compare-kpi{padding:12px 14px;border-radius:16px;border:1px solid rgba(148,163,184,.18);background:linear-gradient(180deg,rgba(255,255,255,.98),rgba(248,250,252,.94));box-shadow:0 10px 20px rgba(15,23,42,.04)}',
    '.stats-note-box{padding:16px 18px;border:1px dashed rgba(148,163,184,.28);border-radius:16px;color:var(--gray-l);font-size:13px;text-align:center;background:rgba(248,250,252,.7)}',
    '.stats-chip-pool{display:flex;flex-wrap:wrap;gap:8px}',
    '.stats-choice-chip{padding:7px 14px;border-radius:999px;border:1px solid rgba(148,163,184,.2);background:rgba(255,255,255,.96);font-size:12px;font-weight:800;cursor:pointer;transition:.15s;box-shadow:0 8px 16px rgba(15,23,42,.04)}',
    '.stats-choice-chip:hover{transform:translateY(-1px)}',
    '.stats-results-stack{display:flex;flex-direction:column;gap:8px}',
    '.stats-result-card{display:flex;align-items:center;gap:10px;padding:12px 14px;border:1px solid rgba(148,163,184,.18);border-radius:16px;background:linear-gradient(180deg,rgba(255,255,255,.98),rgba(248,250,252,.94));cursor:pointer;box-shadow:0 10px 20px rgba(15,23,42,.04);transition:.15s}',
    '.stats-result-card:hover{transform:translateY(-1px);box-shadow:0 14px 26px rgba(15,23,42,.07)}',
    '.stats-preview-frame{width:100%;max-width:420px;min-height:140px;border-radius:20px;overflow:hidden;box-shadow:0 12px 34px rgba(15,23,42,.16);font-family:"Noto Sans KR",sans-serif;display:block;cursor:pointer;background:linear-gradient(180deg,rgba(255,255,255,.98),rgba(248,250,252,.94));border:1px solid rgba(148,163,184,.18)}',
    '.stats-selection-list{display:flex;flex-direction:column;gap:6px;border:1px solid rgba(148,163,184,.18);border-radius:16px;padding:8px;background:linear-gradient(180deg,rgba(255,255,255,.98),rgba(248,250,252,.94))}',
    '.stats-selection-item{display:flex;align-items:center;gap:8px;padding:10px 12px;border-radius:12px;border:1px solid rgba(148,163,184,.18);background:rgba(255,255,255,.88);cursor:pointer;text-align:left;font-size:12px;transition:.12s}',
    '.stats-selection-item:hover{background:#eff6ff}',
    '.stats-filter-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:8px;margin-bottom:12px}',
    'body.dark .stats-hero,body.dark .stats-toolbar-card{background:linear-gradient(180deg,rgba(15,23,42,.94),rgba(15,23,42,.9));border-color:#2d3f55;box-shadow:0 20px 38px rgba(0,0,0,.28),inset 0 1px 0 rgba(255,255,255,.03)}',
    'body.dark .stats-filter-box{background:linear-gradient(180deg,rgba(15,23,42,.92),rgba(22,33,55,.9));border-color:#334155}',
    'body.dark .stats-filter-box.is-idle{background:linear-gradient(180deg,rgba(15,23,42,.92),rgba(15,23,42,.88))}',
    'body.dark .stats-hero-title{color:#f8fafc}',
    'body.dark .stats-hero-desc{color:#94a3b8}',
    'body.dark .stats-hero-badge,body.dark .stats-award-toggle{background:rgba(30,41,59,.78);border-color:#334155;color:#cbd5e1}',
    'body.dark .stats-award-toggle button{color:#cbd5e1}',
    'body.dark .stats-award-card.is-empty{background:linear-gradient(180deg,rgba(30,41,59,.78),rgba(15,23,42,.88));border-color:#334155}',
    'body.dark .stats-rank-table{background:#0f172a;border-color:#334155}',
    'body.dark .stats-rank-table thead th{background:linear-gradient(135deg,#0f172a,#1d4ed8 58%,#2563eb)}',
    'body.dark .stats-rank-table tbody td{background:rgba(15,23,42,.94);border-color:#233247;color:#e2e8f0}',
    'body.dark .stats-rank-table tbody tr:nth-child(even) td{background:#132033}',
    'body.dark .stats-rank-table tbody tr:hover td{background:#17263c}',
    'body.dark .stats-rank-top td{background:linear-gradient(90deg,rgba(245,158,11,.16),rgba(15,23,42,.94)) !important}',
    'body.dark .stats-list-item,body.dark .stats-surface-box,body.dark .stats-record-item,body.dark .stats-chart-board,body.dark .stats-chart-wrap,body.dark .stats-metric-card,body.dark .stats-detail-card,body.dark .stats-table-card{background:linear-gradient(180deg,rgba(15,23,42,.94),rgba(15,23,42,.9));border-color:#334155;box-shadow:0 12px 22px rgba(0,0,0,.18)}',
    'body.dark .stats-select{background:rgba(15,23,42,.92);border-color:#334155;color:#e2e8f0;box-shadow:none}',
    'body.dark .stats-detail-row{background:#132033;border-color:#334155}',
    'body.dark .stats-detail-row span:first-child{color:#cbd5e1}',
    'body.dark .stats-detail-row span:last-child,body.dark .stats-metric-value{color:#f8fafc}',
    'body.dark .stats-legend-chip{border-color:#334155;background:#132033;color:#e2e8f0}',
    'body.dark .stats-search-field{background:#0f172a;border-color:#334155;color:#e2e8f0;box-shadow:none}',
    'body.dark .stats-search-drop{background:#0f172a;border-color:#334155;box-shadow:0 18px 32px rgba(0,0,0,.28)}',
    'body.dark .stats-search-item:hover{background:#17263c}',
    'body.dark .stats-vs-card,body.dark .stats-h2h-board,body.dark .stats-compare-table,body.dark .stats-note-box,body.dark .stats-compare-univ-card,body.dark .stats-compare-kpi{background:linear-gradient(180deg,rgba(15,23,42,.94),rgba(15,23,42,.9));border-color:#334155;box-shadow:0 12px 22px rgba(0,0,0,.18)}',
    'body.dark .stats-compare-table th,body.dark .stats-compare-table td{border-color:#233247;color:#e2e8f0}',
    'body.dark .stats-choice-chip,body.dark .stats-result-card,body.dark .stats-selection-list,body.dark .stats-selection-item,body.dark .stats-preview-frame{background:linear-gradient(180deg,rgba(15,23,42,.94),rgba(15,23,42,.9));border-color:#334155;color:#e2e8f0;box-shadow:0 12px 22px rgba(0,0,0,.18)}',
    'body.dark .stats-selection-item:hover{background:#17263c}',
    '@media (max-width:780px){.stats-hero{flex-direction:column;padding:16px;border-radius:20px}.stats-hero-title{font-size:20px}.stats-hero-badges{justify-content:flex-start}.stats-toolbar-card{padding:10px 10px 12px}.stats-chart-board,.stats-table-card{padding:10px}.stats-chart-wrap{padding:10px}.stats-select{min-width:180px;width:100%}.stats-compare-duel{grid-template-columns:1fr}.stats-compare-vs{min-height:24px}}',
    '@media (max-width:768px){.stats-hero{display:none}}'
  ].join('');
  document.head.appendChild(s);
})();

function rStats(C,T){
  T.textContent='📊 통계';
  // 전역 유틸(stats-core-utils.js)이 window._statsDateFrom 등을 참조하므로 항상 동기화
  _statsSyncFilterToWindow();
  // history가 비어있으면 통계가 전부 비어 보이므로 자동 재생성 시도
  _statsEnsureHistoryReady();
  if(typeof players==='undefined' || !Array.isArray(players)){
    C.innerHTML = `<div style="padding:40px 20px;text-align:center;color:var(--gray-l)">데이터 로딩 중...</div>`;
    return;
  }
  const _li = (typeof isLoggedIn!=='undefined' ? !!isLoggedIn : false) || !!window.isLoggedIn;
  const _coreIds = new Set(['overview','tierRank','award','radar','univwinbar','period','psearch','sharecard']);
  window._statsViewMode = window._statsViewMode || (_coreIds.has(window.statsSub||'overview') ? 'core' : 'advanced');
  // (A안) 하위 탭 + 전역필터를 '필터'로 접기/펼치기
  const _lockOpen = (localStorage.getItem('su_filter_lock_open') ?? '1') === '1';
  if(window._statsFilterOpen===undefined) window._statsFilterOpen=_lockOpen;
  if(_lockOpen) window._statsFilterOpen = true;
  // UX 3: 마지막 방문 서브탭 복원
  const _savedSub=localStorage.getItem('su_statsSub');
  window.statsSub = window.statsSub || 'overview';
  if(_savedSub&&window.statsSub==='overview'&&_savedSub!=='overview'){
    if(_savedSub!=='csvexport'||_li) window.statsSub=_savedSub;
  }
  const _statsGroups=[
    {label:'🏆 개인',tabs:[
      {id:'overview',lbl:'🏛️ 종합'},
      {id:'tierRank',lbl:'🚀 티어 랭킹'},
      {id:'starsystem',lbl:'⭐ 스타시스템'},
      {id:'elo',lbl:'📈 ELO 그래프'},
      {id:'growth',lbl:'📊 성장 곡선'},
      {id:'award',lbl:'🏆 이달의 스트리머'},
      {id:'records',lbl:'🎖️ 최다 기록'},
      {id:'killer',lbl:'🗡️ 킬러/피해자'},
      {id:'streakhist',lbl:'🔥 역대 연속 기록'},
      {id:'playervs',lbl:'⚔️ 스트리머 비교'},
    ]},
    {label:'🏛️ 대학',tabs:[
      {id:'radar',lbl:'🕸️ 대학 레이더'},
      {id:'univmatrix',lbl:'🏛️ 대학 매트릭스'},
      {id:'univmatrix2',lbl:'🏛️ 대학 매트릭스+'},
      {id:'univwinbar',lbl:'📊 대학별 승률'},
    ]},
    {label:'📊 경기',tabs:[
      {id:'period',lbl:'🗓️ 주간/월간 분석'},
      {id:'mismatch',lbl:'⚡ 미스매치'},
      {id:'heatmap',lbl:'📅 활동 히트맵'},
      {id:'tierwin',lbl:'🎯 티어별 승률(개인)'},
      {id:'tiermatch',lbl:'🎖️ 티어별 승률(팀전)'},
      {id:'maprank',lbl:'🗺️ 맵별 특화'},
      {id:'racetrend',lbl:'🔬 종족 트렌드'},
      {id:'seasonal',lbl:'📅 요일/시즌 승률'},
    ]},
    {label:'🔍 기록실',tabs:[
      {id:'psearch',lbl:'🔍 스트리머 검색'},
      {id:'sharecard',lbl:'🎴 공유 카드'},
      {id:'advsearch',lbl:'🔍 고급 검색'},
      ...(_li?[{id:'csvexport',lbl:'📥 CSV 내보내기'}]:[]),
    ]},
  ];
  try{
    if(typeof applyTabLabels==='function'){
      _statsGroups.forEach(g=>{ g.tabs = applyTabLabels('stats', g.tabs); });
    }
  }catch(e){}
  const _viewFilteredGroups = _statsGroups
    .map(g=>({
      ...g,
      tabs:g.tabs.filter(t=>window._statsViewMode==='core' ? _coreIds.has(t.id) : !_coreIds.has(t.id))
    }))
    .filter(g=>g.tabs.length);
  // 유효한 서브탭인지 확인(유효하지 않으면 overview로 복귀)
  const _allSubIds = new Set(_viewFilteredGroups.flatMap(g=>g.tabs.map(t=>t.id)));
  if(!_allSubIds.has(window.statsSub||'')){
    const _fallback=_viewFilteredGroups[0]?.tabs[0]?.id || 'overview';
    window.statsSub=_fallback;
    try{ localStorage.setItem('su_statsSub',_fallback); }catch(e){}
  }
  // 현재 그룹 찾기
  const _curGrp=_viewFilteredGroups.find(g=>g.tabs.some(t=>t.id===(window.statsSub||'overview')))||_viewFilteredGroups[0];
  const _curSub = (window.statsSub||'overview');
  const _curSubObj = _curGrp.tabs.find(t=>t.id===_curSub) || _curGrp.tabs[0];
  const _curGrpLabel = (typeof getTabLabel==='function') ? getTabLabel('statsGroup', _curGrp.label, _curGrp.label) : _curGrp.label;
  let h=`<div class="stats-shell">`;
  h+=`<section class="stats-hero">
    <div class="stats-hero-copy">
      <div class="stats-hero-kicker">Stats Center</div>
      <div class="stats-hero-title">📊 통계 대시보드</div>
      <div class="stats-hero-desc">${window._statsViewMode==='core'?'자주 보는 핵심 지표 위주로 빠르게 확인할 수 있는 통계 화면입니다.':'세부 비교, 추세, 매트릭스까지 한 번에 볼 수 있는 심화 통계 화면입니다.'}</div>
    </div>
    <div class="stats-hero-badges">
      <span class="stats-hero-badge">${window._statsViewMode==='core'?'⚡ 핵심 통계':'🧠 심화 분석'}</span>
      <span class="stats-hero-badge">${_curGrpLabel}</span>
      <span class="stats-hero-badge">${_curSubObj?.lbl||'통계'}</span>
    </div>
  </section>`;
  h+=`<div class="stats-toolbar-card no-export">`;
  h+=`<div class="stats-modebar fbar no-export">
    <div class="stats-modeseg">
      <button class="pill ${window._statsViewMode==='core'?'on':''}" style="flex-shrink:0;white-space:nowrap" onclick="window._statsViewMode='core';window.statsSub='${_coreIds.has(window.statsSub||'')?(window.statsSub||'overview'):'overview'}';localStorage.setItem('su_statsSub',window.statsSub);render()">⚡ 핵심 통계</button>
      <button class="pill ${window._statsViewMode==='advanced'?'on':''}" style="flex-shrink:0;white-space:nowrap" onclick="window._statsViewMode='advanced';window.statsSub='${_coreIds.has(window.statsSub||'overview')?'starsystem':(window.statsSub||'starsystem')}';localStorage.setItem('su_statsSub',window.statsSub);render()">🧠 심화 분석</button>
    </div>
    <span class="stats-modebar-hint">${window._statsViewMode==='core'?'자주 보는 핵심 지표 중심':'세부 비교·추세·매트릭스 중심'}</span>
  </div>`;
  // 1행: 그룹 pill 바
  h+=`<div class="stats-grouprow fbar no-export">`;
  // (요청사항) 통계탭 필터는 맨 좌측(개인 버튼 왼쪽). 단, '항상 펼침'이면 버튼 숨김
  const _enableSubFilter = (localStorage.getItem('su_submenu_filter_enabled') ?? '1') === '1';
  if(_enableSubFilter && !_lockOpen){
    h+=`<button class="pill ${window._statsFilterOpen?'on':''}" style="flex-shrink:0;white-space:nowrap" onclick="window._statsFilterOpen=!window._statsFilterOpen;render()">🔍 필터 ${window._statsFilterOpen?'▲':'▼'}</button>`;
  }
  _viewFilteredGroups.forEach(grp=>{
    const isOn=grp===_curGrp;
    const gLbl = (typeof getTabLabel==='function') ? getTabLabel('statsGroup', grp.label, grp.label) : grp.label;
    h+=`<button class="pill ${isOn?'on':''}" style="flex-shrink:0;white-space:nowrap" onclick="window.statsSub='${grp.tabs[0].id}';localStorage.setItem('su_statsSub','${grp.tabs[0].id}');render()">${gLbl}</button>`;
  });
  // (요청사항) 우측 끝 현재 선택 글자 숨김
  h+=`</div>`;
  // 전역 필터 바
  const _isFiltered=!!(_statsDateFrom||_statsDateTo||_statsMinGames!==3||_statsLastN>0);
  const _now=new Date();
  const _yyyy=_now.getFullYear();
  const _mm=String(_now.getMonth()+1).padStart(2,'0');
  const _dd=String(_now.getDate()).padStart(2,'0');
  const _today=`${_yyyy}-${_mm}-${_dd}`;
  const _thisYearStart=`${_yyyy}-01-01`;
  const _thisMonthStart=`${_yyyy}-${_mm}-01`;
  const _3mAgo=(()=>{const d=new Date(_now);d.setMonth(d.getMonth()-3);return d.toISOString().slice(0,10);})();
  function _qBtn(lbl,from,to){
    const on=_statsDateFrom===from&&_statsDateTo===to;
    return`<button onclick="_statsDateFrom='${from}';_statsDateTo='${to}';render()" style="font-size:10px;padding:2px 7px;border-radius:12px;border:1px solid ${on?'var(--blue)':'var(--border2)'};background:${on?'var(--blue)':'var(--white)'};color:${on?'#fff':'var(--text3)'};cursor:pointer;white-space:nowrap;font-weight:${on?'700':'400'}">${lbl}</button>`;
  }
  function _nBtn(n){
    const on=_statsLastN===n;
    return`<button onclick="_statsLastN=${n};render()" style="font-size:10px;padding:2px 7px;border-radius:12px;border:1px solid ${on?'#7c3aed':'var(--border2)'};background:${on?'#7c3aed':'var(--white)'};color:${on?'#fff':'var(--text3)'};cursor:pointer;white-space:nowrap;font-weight:${on?'700':'400'}">${n===0?'전체':n+'경기'}</button>`;
  }
  // (A안) 필터가 열렸을 때만 하위 탭 + 전역필터 표시
  if((_enableSubFilter?window._statsFilterOpen:true)){
  // 하위 탭 pill 바
  h+=`<div class="stats-subrow fbar no-export" style="margin:-2px 0 10px">`;
  _curGrp.tabs.forEach(o=>{
    h+=`<button class="pill ${(window.statsSub||'overview')===o.id?'on':''}" style="flex-shrink:0;white-space:nowrap" onclick="window.statsSub='${o.id}';localStorage.setItem('su_statsSub','${o.id}');render()">${o.lbl}</button>`;
  });
  h+=`</div>`;

  const _filterBadges = [
    _statsDateFrom||_statsDateTo ? `기간 ${_statsDateFrom||'시작'} ~ ${_statsDateTo||'현재'}` : '기간 전체',
    _statsLastN>0 ? `최근 ${_statsLastN}경기` : '최근 경기 제한 없음',
    `최소경기 ${_statsMinGames}`
  ];

  h+=`<div class="no-export stats-filter-box ${_isFiltered?'':'is-idle'}">
    <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
      <span style="font-size:11px;font-weight:800;color:${_isFiltered?'var(--blue)':'var(--text3)'};white-space:nowrap"></span>
      <label style="font-size:11px;display:flex;align-items:center;gap:4px;white-space:nowrap">
        <input type="date" value="${_statsDateFrom}" onchange="_statsDateFrom=this.value;render()" style="font-size:11px;padding:2px 5px;border:1px solid var(--border2);border-radius:5px">
        ~
        <input type="date" value="${_statsDateTo}" onchange="_statsDateTo=this.value;render()" style="font-size:11px;padding:2px 5px;border:1px solid var(--border2);border-radius:5px">
      </label>
      <label style="font-size:11px;display:flex;align-items:center;gap:4px;white-space:nowrap" title="월만 선택하면 해당 월의 1일~말일로 자동 설정합니다">
        🗓️ 월
        <input type="month" value="${(_statsDateFrom||_statsDateTo)?(String((_statsDateFrom||_statsDateTo)).slice(0,7)):''}"
          onchange="try{const v=this.value||'';if(!v){_statsDateFrom='';_statsDateTo='';render();return;}const a=v.split('-');const yy=+a[0],mm=+a[1];const last=new Date(yy,mm,0).getDate();_statsDateFrom=v+'-01';_statsDateTo=v+'-'+String(last).padStart(2,'0');render();}catch(e){render();}"
          style="font-size:11px;padding:2px 5px;border:1px solid var(--border2);border-radius:5px;width:120px">
      </label>
      <label style="font-size:11px;display:flex;align-items:center;gap:4px;white-space:nowrap" title="이 경기 수 미만인 스트리머는 승률 집계에서 제외됩니다">
        🎮 최소경기
        <input type="number" min="1" max="99" value="${_statsMinGames}" onchange="_statsMinGames=Math.max(1,parseInt(this.value)||1);render()" style="width:50px;font-size:11px;padding:2px 5px;border:1px solid var(--border2);border-radius:5px">
        <span style="font-size:10px;color:var(--gray-l)" title="최소 경기 수 미만인 스트리머는 승률 집계에서 제외">ℹ️</span>
      </label>
      ${_isFiltered?`<button onclick="_statsDateFrom='';_statsDateTo='';_statsMinGames=3;_statsLastN=0;render()" style="font-size:11px;padding:2px 9px;border-radius:5px;border:1px solid #fca5a5;background:#fff1f2;cursor:pointer;color:#dc2626;font-weight:700">✕ 초기화</button>`:''}
    </div>
    <div style="display:flex;align-items:center;gap:5px;flex-wrap:wrap">
      <span style="font-size:10px;color:var(--gray-l);white-space:nowrap"></span>
      ${_qBtn('올해',_thisYearStart,_today)}
      ${_qBtn('이번달',_thisMonthStart,_today)}
      ${_qBtn('최근3개월',_3mAgo,_today)}
      ${_qBtn('전체','','')}
      <span style="font-size:10px;color:var(--gray-l);white-space:nowrap;margin-left:8px">🎯 최근N경기:</span>
      ${_nBtn(0)}${_nBtn(10)}${_nBtn(20)}${_nBtn(30)}${_nBtn(50)}
    </div>
    <div style="display:flex;flex-wrap:wrap;gap:6px">
      ${_filterBadges.map(txt=>`<span style="display:inline-flex;align-items:center;padding:4px 9px;border-radius:999px;background:var(--white);border:1px solid ${_isFiltered?'#bfdbfe':'var(--border)'};font-size:11px;font-weight:700;color:${_isFiltered?'#1d4ed8':'var(--text3)'}">${txt}</span>`).join('')}
    </div>
    ${(_statsDateFrom||_statsDateTo)?``:''}
    ${_statsLastN>0?`<span style="font-size:10px;color:#7c3aed;font-weight:700">🎯 최근 ${_statsLastN}경기 기준 통계입니다</span>`:''}
  </div>`;
  } // end if(_statsFilterOpen)
  h+=`</div>`;
  // 캐시 가능한 순수 탭 (선택 상태 없음): 데이터 변경 시에만 재계산
  const _CACHEABLE=['overview','records','streakhist','period','mismatch','heatmap','univmatrix'];
  function _cached(sub, fn){
    if(!_CACHEABLE.includes(sub)) return fn();
    const c=_scGet(sub);
    return c || _scSet(sub, fn());
  }
  function _safeRender(fn, title){
    try{ return fn(); }
    catch(e){
      try{ console.error('[stats tab error]', title, e); }catch(_){}
      return `<div class="ssec"><div style="color:#dc2626;font-weight:900;margin-bottom:6px">${escHTML(title||'통계')} 렌더 오류</div><div style="font-family:ui-monospace,monospace;font-size:12px;white-space:pre-wrap;color:var(--gray-l)">${escHTML(String(e&&e.stack||e))}</div></div>`;
    }
  }

  if(window.statsSub==='overview')    h+=_safeRender(()=>_cached('overview', statsOverviewHTML), '종합');
  else if(window.statsSub==='tierRank')h+=_safeRender(statsTierRankHTML, '티어 랭킹');
  else if(window.statsSub==='starsystem')h+=_safeRender(statsStarSystemHTML, '스타시스템');
  else if(window.statsSub==='elo')    h+=_safeRender(statsEloHTML, 'ELO 그래프');
  else if(window.statsSub==='growth') h+=_safeRender(statsGrowthHTML, '성장 곡선');
  else if(window.statsSub==='award')  h+=_safeRender(()=>_cached('award', statsAwardHTML), '이달의 스트리머');
  else if(window.statsSub==='records')h+=_safeRender(()=>_cached('records', statsRecordsHTML), '최다 기록');
  else if(window.statsSub==='radar')  h+=_safeRender(statsRadarHTML, '대학 레이더');
  else if(window.statsSub==='period') h+=_safeRender(()=>_cached('period', statsPeriodAnalysisHTML), '주간/월간 분석');
  else if(window.statsSub==='mismatch')h+=_safeRender(()=>_cached('mismatch', statsMismatchHTML), '미스매치');
  else if(window.statsSub==='heatmap')  h+=_safeRender(()=>_cached('heatmap', statsHeatmapHTML), '활동 히트맵');
  else if(window.statsSub==='tierwin')  h+=_safeRender(()=>_cached('tierwin', statsTierWinHTML), '티어별 승률(개인)');
  else if(window.statsSub==='maprank')  h+=_safeRender(()=>_cached('maprank', statsMapRankHTML), '맵별 특화');
  else if(window.statsSub==='univmatrix')h+=_safeRender(()=>_cached('univmatrix', statsUnivMatrixHTML), '대학 매트릭스');
  else if(window.statsSub==='racetrend')h+=_safeRender(statsRaceTrendHTML, '종족 트렌드');
  else if(window.statsSub==='csvexport')h+=_safeRender(statsCsvExportHTML, 'CSV 내보내기');
  else if(window.statsSub==='psearch')   h+=_safeRender(statsPlayerSearchHTML, '스트리머 검색');
  else if(window.statsSub==='sharecard')h+=_safeRender(statsShareCardHTML, '공유 카드');
  else if(window.statsSub==='advsearch')h+=_safeRender(statsAdvSearchHTML, '고급 검색');
  else if(window.statsSub==='killer')   h+=_safeRender(()=>_cached('killer', statsKillerHTML), '킬러/피해자');
  else if(window.statsSub==='seasonal') h+=_safeRender(()=>_cached('seasonal', statsSeasonalHTML), '요일/시즌 승률');
  else if(window.statsSub==='streakhist')h+=_safeRender(()=>_cached('streakhist', statsStreakHistHTML), '연속 기록 히스토리');
  else if(window.statsSub==='tiermatch') h+=_safeRender(()=>_cached('tiermatch', statsTierMatchHTML), '티어별 승률(팀전)');
  else if(window.statsSub==='univmatrix2')h+=_safeRender(()=>_cached('univmatrix2', statsUnivMatrix2HTML), '대학 매트릭스+');
  else if(window.statsSub==='playervs')  h+=_safeRender(statsPlayerVsHTML, '스트리머 비교');
  else if(window.statsSub==='univwinbar') h+=_safeRender(statsUnivWinBarHTML, '대학별 승률');
  h+=`</div>`;
  C.innerHTML=h;
  // 서브탭별 후처리
  if(window.statsSub==='elo')         initEloChart();
  else if(window.statsSub==='growth') initGrowthChart();
  else if(window.statsSub==='radar')  initRadarChart();
  else if(window.statsSub==='racetrend') initRaceTrendChart();
  else if(window.statsSub==='univwinbar') initUnivWinBarChart();
}

/* ─── 공통 유틸 ─── */
// 공통 유틸은 `stats-core-utils.js`로 분리
var _statsDateYmd = (typeof window._statsDateYmd==='function') ? window._statsDateYmd : (d=>'');
var _statsTodayYmd = (typeof window._statsTodayYmd==='function') ? window._statsTodayYmd : (()=>'');
var _statsCurrentWeekRange = (typeof window._statsCurrentWeekRange==='function') ? window._statsCurrentWeekRange : (()=>({from:'',to:''}));
var _statsCurrentMonthRange = (typeof window._statsCurrentMonthRange==='function') ? window._statsCurrentMonthRange : (()=>({from:'',to:''}));
var _statsInRange = (typeof window._statsInRange==='function') ? window._statsInRange : (()=>false);
var _statsAnalyzePeriod = (typeof window._statsAnalyzePeriod==='function') ? window._statsAnalyzePeriod : (()=>({label:'',from:'',to:'',totalMatches:0,totalGames:0,teamMatches:0,soloMatches:0,activeDays:0,bySource:[],topWinners:[],topPlayers:[],topTeams:[]}));
var statsPeriodAnalysisHTML = (typeof window.statsPeriodAnalysisHTML==='function')
  ? window.statsPeriodAnalysisHTML
  : (()=>'<div class="ssec"><div style="color:var(--gray-l);font-size:13px">기간 분석을 불러오지 못했습니다.</div></div>');
try{ window.renderShareCardByPlayer = renderShareCardByPlayer; }catch(e){}

// players 맵/히스토리/매치 필터 공통 유틸은 `stats-core-utils.js`로 분리

/* ══════════════════════════════════════
   🚀 티어 랭킹(선수) — 첨부 TXT 레이아웃 참고
   - 동일 티어 상대전만 집계
   - "일반(스폰)" + "중요경기" + "실전보너스" 형태로 분해 표시
══════════════════════════════════════ */
// 티어 랭킹 helper는 `stats-tier-rank-utils.js`로 분리

function statsTierRankHTML(){
  const tier = (window._statsRankTier || '4티어');
  const _tiers = (typeof TIERS!=='undefined' && Array.isArray(TIERS)) ? TIERS : (Array.isArray(window.TIERS) ? window.TIERS : []);
  const tierBtns = _tiers.filter(t=>t && t!=='미정');

  // 선수 리스트(티어)
  const _players = Array.isArray(players) ? players : [];
  const tierPlayers = _players.filter(p=>(p.tier||'미정')===tier);
  if(!tierPlayers.length){
    return `<div class="ssec"><h3 style="margin:0 0 10px">🚀 티어 랭킹</h3>
      <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px">${tierBtns.map(t=>`<button class="pill ${t===tier?'on':''}" onclick="statsSetRankTier('${escJS(t)}')">${t}</button>`).join('')}</div>
      <div style="color:var(--gray-l);font-size:13px">선택한 티어(${tier})에 선수가 없습니다.</div>
    </div>`;
  }

  // 동일 티어 상대전만 추출
  const rows = tierPlayers.map(p=>{
    const all = statsNonProHist(p)
      .filter(h=>{
        if(!h||!h.opp) return false;
        const opp=statsP(h.opp);
        return opp && (opp.tier||'미정')===tier;
      })
      .sort((a,b)=>(String(b.date||'')).localeCompare(String(a.date||'')));

    const practice = [];
    const important = [];
    all.forEach(h=>{ (_srIsImportant(h.mode) ? important : practice).push(h); });

    // practice: 시간가중치 + 승패
    let pW=0, pL=0, pWW=0, pWL=0;
    practice.forEach(h=>{
      const w=_srTimeW(h.date||'');
      if(h.result==='승'){ pW++; pWW+=w; }
      else if(h.result==='패'){ pL++; pWL+=w; }
    });
    const pTot=pW+pL, pWTot=pWW+pWL;
    const pWR = pWTot>0 ? (pWW/pWTot) : 0;

    // important: (초기) 가중치 없이 raw 승률
    let iW=0, iL=0;
    important.forEach(h=>{ if(h.result==='승') iW++; else if(h.result==='패') iL++; });
    const iTot=iW+iL;
    const iWR=iTot>0 ? (iW/iTot) : 0;

    // 경험치(경기 수): 너무 과하게 튀지 않게 log
    const exp = Math.min(12, Math.log10(Math.max(1,pTot)) * 8);
    const practiceScore = (pWR*70) + exp;                 // 0~82 정도
    const importantScore = (iWR*30) * Math.min(1, iTot/6); // 0~30
    const bonus = (iTot>=3 && iWR>pWR) ? Math.min(25, (iWR-pWR)*200*(Math.min(1,iTot/8))) : 0;
    const total = practiceScore + importantScore + bonus;

    // 활동 여부(최근 30일 내 동일티어 경기)
    const lastDate = (all[0]?.date||'');
    const dormant = lastDate ? (_srDaysAgo(lastDate) > 30) : true;

    return {
      p,
      total:+total.toFixed(1),
      practiceScore:+practiceScore.toFixed(1),
      importantScore:+importantScore.toFixed(1),
      bonus:+bonus.toFixed(1),
      pW,pL,pWR,
      iW,iL,iWR,
      practice, important,
      lastDate,
      dormant,
      safeId:_srSafeId(p.name),
    };
  })
  .filter(r=> (r.pW+r.pL+r.iW+r.iL) >= _statsMinGames)
  .sort((a,b)=> b.total-a.total || (b.iW+b.iL)-(a.iW+a.iL) || (b.pW+b.pL)-(a.pW+a.pL));

  const css = `
    <style>
      .sr-table{width:100%;border-collapse:separate;border-spacing:0;border:1px solid rgba(148,163,184,.18);border-radius:18px;overflow:hidden;box-shadow:0 14px 28px rgba(15,23,42,.05)}
      .sr-table th,.sr-table td{padding:11px 10px;text-align:center;border-bottom:1px solid rgba(148,163,184,.12);vertical-align:middle}
      .sr-table thead th{background:linear-gradient(135deg,#0f172a,#4338ca 52%,#7c3aed);color:#fff;font-weight:900;border-bottom:none}
      .sr-row{background:rgba(255,255,255,.96)}
      .sr-row:nth-child(even){background:#fbfdff}
      .sr-row:hover{background:#eef6ff}
      .sr-player{display:flex;gap:8px;align-items:center;justify-content:flex-start}
      .sr-name{font-weight:1000;color:var(--text2);cursor:pointer}
      .sr-univ{font-size:11px;font-weight:900;opacity:.85}
      .sr-score{font-weight:1000;color:#7c3aed}
      .sr-mini{font-size:11px;color:var(--gray-l);line-height:1.45}
      .sr-tag{display:inline-flex;align-items:center;gap:4px;font-size:11px;font-weight:1000;padding:3px 8px;border-radius:999px;border:1px solid rgba(0,0,0,.10);background:rgba(255,255,255,.88)}
      .sr-tag.p{border-color:rgba(37,99,235,.25);color:#1d4ed8}
      .sr-tag.i{border-color:rgba(22,163,74,.25);color:#15803d}
      .sr-tag.b{border-color:rgba(245,158,11,.25);color:#b45309}
      .sr-det{display:none}
      .sr-det.open{display:table-row}
      .sr-det td{padding:14px 12px;background:linear-gradient(175deg,#f8fbff,#eef4fb)}
      .sr-box{background:#fff;border:1px solid rgba(148,163,184,.18);border-radius:16px;padding:14px;box-shadow:inset 0 1px 0 rgba(255,255,255,.85)}
      .sr-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}
      @media(max-width:820px){.sr-grid{grid-template-columns:1fr}}
      .sr-log{max-height:200px;overflow:auto;border:1px solid rgba(148,163,184,.18);border-radius:12px;background:rgba(255,255,255,.82)}
      .sr-log table{width:100%;border-collapse:collapse;font-size:12px}
      .sr-log th,.sr-log td{padding:6px 8px;border-bottom:1px solid rgba(148,163,184,.12);text-align:center}
      .sr-muted{opacity:.65}
      body.dark .sr-table{border-color:#334155;box-shadow:0 14px 28px rgba(0,0,0,.22)}
      body.dark .sr-table thead th{background:linear-gradient(135deg,#0f172a,#312e81 52%,#6d28d9)}
      body.dark .sr-row{background:#0f172a}
      body.dark .sr-row:nth-child(even){background:#132033}
      body.dark .sr-row:hover{background:#17263c}
      body.dark .sr-table td{border-color:#233247;color:#e2e8f0}
      body.dark .sr-box,body.dark .sr-log{background:#132033;border-color:#334155}
      body.dark .sr-det td{background:linear-gradient(175deg,#0f172a,#162235)}
    </style>`;

  const header = `<div class="ssec">
    ${css}
    <div style="display:flex;align-items:flex-end;justify-content:space-between;gap:10px;flex-wrap:wrap">
      <div>
        <h3 style="margin:0">🚀 티어 랭킹 (동일 티어 기준)</h3>
        <div style="font-size:12px;color:var(--gray-l);margin-top:4px">일반(시간가중치) + 중요(대회/프로/끝장전/CK) + 실전보너스</div>
      </div>
      <div style="font-size:12px;color:var(--gray-l)">최소경기: ${_statsMinGames}</div>
    </div>
    <div class="fbar no-export" style="gap:6px;flex-wrap:wrap;margin:10px 0">
      ${tierBtns.map(t=>`<button class="pill ${t===tier?'on':''}" onclick="statsSetRankTier('${escJS(t)}')">${t}</button>`).join('')}
    </div>
  </div>`;

  const table = `<div class="ssec" style="padding:0;overflow:hidden">
    <table class="sr-table">
      <thead><tr>
        <th style="width:70px">순위</th>
        <th style="text-align:left">선수</th>
        <th style="width:150px">종합 점수</th>
        <th style="width:260px">요약</th>
      </tr></thead>
      <tbody>
      ${rows.map((r,idx)=>{
        const p=r.p;
        const race=(p.race||'');
        const safe=r.safeId;
        const dormClass=r.dormant?'sr-muted':'';
        const pWR=(r.pWR*100)||0, iWR=(r.iWR*100)||0;
        return `
          <tr class="sr-row ${dormClass}" onclick="statsRankToggle('${safe}')">
            <td><div class="sr-score" style="color:${idx<3?'#111827':'#4f46e5'}">${idx+1}</div></td>
            <td style="text-align:left">
              <div class="sr-player">
                ${getPlayerPhotoHTML(p.name,'34px')}
                <div style="min-width:0">
                  <div class="sr-name" onclick="event.stopPropagation();openPlayerModal('${escJS(p.name)}')">${escHTML(p.name)}${race?`<span style="font-size:12px;color:var(--gray-l);font-weight:900;margin-left:6px">(${escHTML(race)})</span>`:''}</div>
                  <div class="sr-univ" style="color:${gc(p.univ)}">${escHTML(p.univ||'-')} · 최근 ${escHTML(r.lastDate||'-')}</div>
                </div>
              </div>
            </td>
            <td>
              <div class="sr-score">${r.total}</div>
              <div class="sr-mini">
                <span class="sr-tag p" title="일반 점수">일반 ${r.practiceScore}</span>
                <span class="sr-tag i" title="중요 점수">중요 ${r.importantScore}</span>
                ${r.bonus>0?`<span class="sr-tag b" title="실전 보너스">보너스 +${r.bonus}</span>`:''}
              </div>
            </td>
            <td>
              <div class="sr-mini" style="display:flex;flex-direction:column;gap:2px">
                <div><b>동일티어</b> ${r.pW}승 ${r.pL}패 · 일반(보정) <b>${pWR.toFixed(1)}%</b></div>
                <div><b>중요경기</b> ${r.iW}승 ${r.iL}패 · 중요 <b>${iWR.toFixed(1)}%</b></div>
                <div style="margin-top:3px"><button id="sr-btn-${safe}" class="btn btn-w btn-xs" style="border-radius:999px" onclick="event.stopPropagation();statsRankToggle('${safe}')">🔽 상세보기</button></div>
              </div>
            </td>
          </tr>
          <tr class="sr-det" id="sr-det-${safe}">
            <td colspan="4">
              <div class="sr-box">
                <div class="sr-grid">
                  <div>
                    <div style="font-weight:1000;margin-bottom:6px;color:var(--text2);display:flex;align-items:center;gap:6px;flex-wrap:wrap">
                      1) 일반(스폰) — 시간가중치
                      <span title="최근 경기일수에 따라 승/패에 가중치를 곱해 ‘최근 경기’를 더 반영합니다.\n\n가중치 범위: ×1.00(최신) ~ ×0.70(오래됨)\n계산: w = max(0.70, 1 - (daysAgo × 0.0035))\n예: 30일 전≈×0.90, 60일 전≈×0.79" style="font-size:11px;color:var(--gray-l);font-weight:900;cursor:help;border:1px solid var(--border2);padding:0 6px;border-radius:999px;background:var(--surface)">?</span>
                    </div>
                    <div class="sr-mini" style="margin-bottom:8px">Raw ${r.pW}승 ${r.pL}패 · 보정승 ${r.practiceScore.toFixed(1)}점</div>
                    <div class="sr-log">
                      <table>
                        <thead><tr><th>날짜</th><th>상대</th><th>결과</th><th>가중치</th><th>모드</th></tr></thead>
                        <tbody>
                          ${r.practice.slice(0,25).map(h=>{
                            const w=_srTimeW(h.date||'');
                            const res=h.result==='승'?'<span style="color:#16a34a;font-weight:1000">승</span>':'<span style="color:#dc2626;font-weight:1000">패</span>';
                            return `<tr><td>${(h.date||'').slice(5).replace('-','/')}</td><td>${escHTML(h.opp||'')}</td><td>${res}</td><td style="color:#b45309;font-weight:900">×${w.toFixed(2)}</td><td style="color:var(--gray-l)">${escHTML(h.mode||'')}</td></tr>`;
                          }).join('')}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <div>
                    <div style="font-weight:1000;margin-bottom:6px;color:var(--text2)">2) 중요 경기</div>
                    <div class="sr-mini" style="margin-bottom:8px">Raw ${r.iW}승 ${r.iL}패 · 중요점수 ${r.importantScore.toFixed(1)}점</div>
                    <div class="sr-log">
                      <table>
                        <thead><tr><th>날짜</th><th>상대</th><th>결과</th><th>모드</th><th>맵</th></tr></thead>
                        <tbody>
                          ${(r.important.slice(0,25)).map(h=>{
                            const res=h.result==='승'?'<span style="color:#16a34a;font-weight:1000">승</span>':'<span style="color:#dc2626;font-weight:1000">패</span>';
                            return `<tr><td>${(h.date||'').slice(5).replace('-','/')}</td><td>${escHTML(h.opp||'')}${h.oppRace?`(${escHTML(h.oppRace)})`:''}</td><td>${res}</td><td style="color:var(--gray-l)">${escHTML(h.mode||'')}</td><td style="color:var(--gray-l)">${escHTML((h.map&&h.map!=='-')?h.map:'')}</td></tr>`;
                          }).join('') || `<tr><td colspan="5" style="color:var(--gray-l)">중요 경기 기록이 없습니다.</td></tr>`}
                        </tbody>
                      </table>
                    </div>
                    <div style="margin-top:10px">
                      <div style="font-weight:1000;margin-bottom:6px;color:var(--text2)">🏆 실전 보너스</div>
                      <div class="sr-mini">
                        ${((r.iW+r.iL)>=3)
                          ? (r.bonus>0
                              ? `✅ 적용됨: 중요 승률(${iWR.toFixed(1)}%)이 일반 승률(${pWR.toFixed(1)}%)보다 높아 +${r.bonus}점`
                              : `❌ 미적용: 중요 승률(${iWR.toFixed(1)}%) ≤ 일반 승률(${pWR.toFixed(1)}%)`)
                          : `❌ 미적용: 중요 경기 판수 부족(최소 3경기)`}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </td>
          </tr>
        `;
      }).join('')}
      </tbody>
    </table>
  </div>`;

  return header + table;
}

/* ══════════════════════════════════════
   ⭐ Project Star System (통계 탭 UI)
   - (요청) 기존 데이터(p.history) 기반으로 계산 (서버/크롤러 없이도 가능)
   - "사용 시작"을 눌러야 계산 결과가 표시됨
══════════════════════════════════════ */
window.starSystemSetEnabled = function(on){
  const v = on ? '1' : '0';
  try{ localStorage.setItem('su_starSystem_enabled', v); }catch(e){}
  try{ if(typeof window.cfgTouchPrefsSync==="function") window.cfgTouchPrefsSync(); }catch(e){}
  render();
};
window.starSystemSetKeywords = function(v){
  try{ localStorage.setItem('su_starSystem_keywords', String(v||'')); }catch(e){}
  try{ if(typeof window.cfgTouchPrefsSync==="function") window.cfgTouchPrefsSync(); }catch(e){}
  render();
};
function _ssKeywords(){
  const dflt = '대학대전,대학CK,CK,교수,코치,주관,끝장전,미니대전,프로리그,티어대회,대회,토너먼트';
  try{
    const raw = (localStorage.getItem('su_starSystem_keywords') || dflt).trim();
    return raw.split(/[\n,]+/).map(s=>s.trim()).filter(Boolean);
  }catch(e){ return dflt.split(','); }
}
function _ssTierToNum(t){
  const s=String(t||'').trim();
  if(!s) return null;
  if(s==='G' || s==='갓' || s==='K') return 0;
  const m = s.match(/^(\d+)/);
  if(m) return parseInt(m[1],10);
  if(s.includes('0티어')) return 0;
  if(s.includes('1티어')) return 1;
  if(s.includes('2티어')) return 2;
  if(s.includes('3티어')) return 3;
  if(s.includes('4티어')) return 4;
  if(s.includes('5티어')) return 5;
  if(s.includes('6티어')) return 6;
  if(s.includes('7티어')) return 7;
  if(s.includes('8티어')) return 8;
  return null;
}
function _ssCalcFairPoints(tierDiff, result){
  const td = Number.isFinite(tierDiff) ? Math.max(-99, Math.min(99, Math.trunc(tierDiff))) : 0;
  const r = String(result||'').toUpperCase();
  const isWin = (r==='WIN');
  // (최선책) 제로섬(Zero-sum): 승자 +X / 패자 -X
  // - 동일 티어: ±3
  // - 상위 티어 상대(업셋): ±5
  // - 하위 티어 상대(기대승): ±2
  if(td===0) return isWin ? 3 : -3;
  if(td>0) return isWin ? 5 : -5;
  return isWin ? 2 : -2;
}
function _ssDaysAgo(dateStr){
  const d=(dateStr||'');
  if(!/^\d{4}-\d{2}-\d{2}$/.test(d)) return 99999;
  const t = new Date(d+'T00:00:00').getTime();
  if(!t) return 99999;
  return Math.max(0, Math.floor((Date.now()-t)/86400000));
}
function _ssStatus(points){
  if(points>=130) return '승급 검증';
  if(points<70) return '강등 위기';
  return '정상';
}
var _ssCacheTime='', _ssCacheKey='', _ssCache=null;
function _ssComputeAll(){
  const t=localStorage.getItem('su_last_save_time')||'0';
  const kw=_ssKeywords().join('|');
  const fk=`${_statsDateFrom}|${_statsDateTo}|${_statsMinGames}|${_statsLastN}`;
  const key=`${t}|${kw}|${fk}`;
  if(_ssCache && _ssCacheTime===t && _ssCacheKey===key) return _ssCache;
  _ssCacheTime=t; _ssCacheKey=key;

  const kws=_ssKeywords();
  const matchOfficial = (mode) => {
    const m=String(mode||'');
    if(!m) return false;
    return kws.some(k=>k && m.includes(k));
  };

  const _players = Array.isArray(players) ? players : [];
  const out = [];
  _players.forEach(p=>{
    const myTierNum=_ssTierToNum(p.tier);
    if(myTierNum==null) return;
    let pts=100;
    let games=0;
    let last='';
    const hist = statsNonProHist(p).filter(h=>matchOfficial(h.mode||h.type||''));
    const sorted=[...hist].sort((a,b)=>(String(a.date||'')).localeCompare(String(b.date||'')));
    sorted.forEach(h=>{
      const opp = statsP(h.opp);
      const oppTierNum = _ssTierToNum(opp?.tier);
      if(oppTierNum==null) return;
      const tierDiff = oppTierNum - myTierNum;
      const res = (h.result==='승') ? 'WIN' : (h.result==='패') ? 'LOSS' : '';
      if(!res) return;
      pts += _ssCalcFairPoints(tierDiff, res);
      games++;
      if(h.date && h.date>last) last=h.date;
    });

    const days=_ssDaysAgo(last);
    let inactiveNote='';
    if(myTierNum<=1){
      if(days>=365){ inactiveNote='비활성(1년+)'; }
    }else if(myTierNum===2){
      if(days>=183 && days<365){
        const months = Math.min(6, Math.max(1, Math.floor((days-183)/30)+1));
        pts -= (months*3);
        inactiveNote=`미활동 감쇄 -${months*3}점`;
      }
    }else{
      if(days>=183){
        inactiveNote='미활동(6개월+) → 강등/말소 대상';
      }
    }

    out.push({
      name:p.name, univ:p.univ, race:p.race,
      tier:p.tier, tierNum:myTierNum,
      points:Math.round(pts),
      status:_ssStatus(pts),
      inactiveNote,
      games,
      last,
    });
  });
  out.sort((a,b)=> a.tierNum-b.tierNum || b.points-a.points || b.games-a.games);
  _ssCache = out;
  return out;
}
function statsStarSystemHTML(){
  const enabled = (localStorage.getItem('su_starSystem_enabled') ?? '0') === '1';
  const kwsRaw = (localStorage.getItem('su_starSystem_keywords') || '').trim();
  const spec = `프로젝트 개요
목적: 스타크래프트 스트리머의 실력을 가장 정직하게 반영하는 티어 산정 및 관리 시스템.
핵심 원칙:
1. 개인 스폰빵 배제, 공식전(대학대전, CK, 교수/코치 주관 경기)만 인정.
2. 승급은 어렵고, 강등과 복귀 검증은 엄격하게 처리.
3. 데이터의 공신력을 위해 수치 기반의 제로섬(Zero-sum) 로직 적용.

티어 유지 및 점수 로직 (제로섬 3점 체제)
모든 사용자는 각 티어별 기본 100점에서 시작하며, 경기 결과에 따라 점수를 가감한다.
[포인트 계산]
동일 티어(0): 승 +3 / 패 -3
상위 티어(+1): 승 +5 / 패 -5
하위 티어(-1): 승 +2 / 패 -2
[승강급 기준]
승급: 130점 도달 시 ‘승급 검증’
강등: 70점 미만 시 ‘강등 위기’

활동/강등 예외
0~1티어: 강등 없음(명예) — 1년 미참여 시 비활성
2티어: 6개월~1년 미활동 시 매월 -3점
3티어 이하: 6개월 이상 공식 기록 없으면 즉시 강등 또는 티어 말소

복귀자 연쇄 검증(Recursive Validation)
6개월 이상 휴식 후 복귀:
1차 관문(필수): 동일 티어 & 동일 종족 + 교수/코치 주관 공식전
패배 페널티: 즉시 -10점, 상태 VERIFY_DOWNGRADE
한 단계 낮은 티어의 상~중위권과 다음 검증전을 배치 (승리할 때까지 하향 반복)
`;

  const css = `<style>
    .ss-tier{margin-top:10px;border:1px solid var(--border);border-radius:12px;overflow:hidden;background:var(--white)}
    .ss-tier-h{padding:10px 12px;background:linear-gradient(135deg,#111827,#334155);color:#fff;font-weight:1000;display:flex;align-items:center;gap:8px}
    .ss-tier-b{padding:10px 12px}
    .ss-table{width:100%;border-collapse:collapse}
    .ss-table th,.ss-table td{padding:8px 6px;border-bottom:1px solid rgba(0,0,0,.06);text-align:center;font-size:12px}
    .ss-table th{text-align:center;color:var(--gray-l);font-weight:900;background:var(--surface)}
    .ss-name{font-weight:1000;color:var(--text2);text-align:left}
    .ss-pts{font-weight:1000;color:#7c3aed}
    .ss-badge{display:inline-flex;align-items:center;padding:2px 8px;border-radius:999px;font-size:11px;font-weight:1000;border:1px solid rgba(0,0,0,.08);background:rgba(255,255,255,.85);max-width:100%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .ss-badge.ok{color:#16a34a;border-color:rgba(22,163,74,.25)}
    .ss-badge.promo{color:#7c3aed;border-color:rgba(124,58,237,.25)}
    .ss-badge.danger{color:#dc2626;border-color:rgba(220,38,38,.25)}
  </style>`;

  const header = `<div class="ssec">
    ${css}
    <h3 style="margin:0 0 8px">⭐ Project Star System</h3>
    <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:10px">
      <span class="ubadge" style="background:${enabled?'#16a34a':'#6b7280'}">${enabled?'사용중':'사용중지'}</span>
      <button class="btn btn-b btn-sm" ${enabled?'disabled':''} onclick="starSystemSetEnabled(true)">✅ 사용 시작</button>
      <button class="btn btn-w btn-sm" ${!enabled?'disabled':''} onclick="starSystemSetEnabled(false)">⛔ 사용 중지</button>
      <button class="btn btn-w btn-sm" onclick="openStarSystemInfo()">📘 산정기준</button>
      <button class="btn btn-w btn-sm" onclick="openCfgTier()">🎭 티어표 관리</button>
      <span style="font-size:12px;color:var(--gray-l)">※ 서버 없이 “기존 기록 데이터(펨코 스타 게시판 경기결과탭에서 등록된 기록 포함)”로 점수 계산합니다.</span>
    </div>

    <div style="padding:12px 14px;background:var(--surface);border:1px solid var(--border);border-radius:10px;margin-bottom:10px">
      <div style="font-size:12px;font-weight:1000;color:var(--text2);margin-bottom:8px">공식전 모드 키워드</div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">
        <input type="text" value="${escHTML(kwsRaw||_ssKeywords().join(','))}" oninput="starSystemSetKeywords(this.value)" placeholder="예: 대학대전,CK,교수,코치,끝장전..." style="flex:1;min-width:260px">
        <button class="btn btn-w btn-sm" onclick="starSystemSetKeywords('대학대전,대학CK,CK,교수,코치,주관,끝장전,미니대전,프로리그,티어대회,대회,토너먼트')">기본값</button>
      </div>
      <div style="font-size:11px;color:var(--gray-l);margin-top:6px">mode(기록의 경기 구분 텍스트)에 키워드가 포함되면 공식전으로 처리합니다.</div>
    </div>

    <div style="padding:12px 14px;background:var(--surface);border:1px solid var(--border);border-radius:10px">
      <div style="font-size:12px;font-weight:1000;color:var(--text2);margin-bottom:8px">사양서</div>
      <pre style="white-space:pre-wrap;line-height:1.55;font-size:12px;color:var(--text3);max-height:300px;overflow:auto;margin:0">${escHTML(spec)}</pre>
    </div>
  </div>`;

  if(!enabled){
    return header + `<div class="ssec" style="margin-top:10px"><div style="font-size:12px;color:var(--gray-l);line-height:1.6">‘사용 시작’을 누르면 아래에 티어별 점수/랭킹이 표시됩니다.</div></div>`;
  }

  const all=_ssComputeAll();
  const byTier={};
  all.forEach(r=>{ if(!byTier[r.tier]) byTier[r.tier]=[]; byTier[r.tier].push(r); });
  const tierOrder = Object.keys(byTier).sort((a,b)=> (_ssTierToNum(a)??99)-(_ssTierToNum(b)??99));
  const tiersHTML = tierOrder.map(t=>{
    const arr = byTier[t].slice().sort((a,b)=> b.points-a.points || b.games-a.games);
    const tnum=_ssTierToNum(t);
    return `<div class="ss-tier">
      <div class="ss-tier-h">🏷️ ${escHTML(t)} <span style="opacity:.8;font-size:12px">(${tnum!=null?tnum:'?'})</span><span style="margin-left:auto;opacity:.85;font-size:12px">인원 ${arr.length}</span></div>
      <div class="ss-tier-b">
        <table class="ss-table">
          <thead><tr><th style="width:60px">순위</th><th style="text-align:left">선수</th><th style="width:90px">점수</th><th style="width:150px">상태</th><th style="width:110px">최근 공식전</th><th style="width:70px">경기수</th></tr></thead>
          <tbody>
            ${arr.map((r,i)=>{
              const bcls = r.status==='승급 검증'?'promo':(r.status==='강등 위기'?'danger':'ok');
              return `<tr>
                <td>${i+1}</td>
                <td class="ss-name"><span class="clickable-name" onclick="openPlayerModal('${escJS(r.name)}')">${escHTML(r.name)}</span> <span style="color:${gc(r.univ)};font-size:11px;font-weight:900">${escHTML(r.univ||'')}</span></td>
                <td class="ss-pts">${r.points}</td>
                <td><span class="ss-badge ${bcls}">${escHTML(r.status)}${r.inactiveNote?` · ${escHTML(r.inactiveNote)}`:''}</span></td>
                <td style="color:var(--gray-l)">${escHTML(r.last||'-')}</td>
                <td>${r.games}</td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>`;
  }).join('');

  return header + `<div class="ssec" style="margin-top:10px">
    <div style="font-size:12px;color:var(--gray-l);margin-bottom:8px">※ 현재는 “현재 티어 기준”으로 상대 티어 차이를 계산합니다(과거 티어 변동까지 반영하려면 기록에 tierAtMatch 저장이 필요).</div>
  </div>` + tiersHTML;
}

/* ══════════════════════════════════════
   1. 종합 (기존 내용 유지)
══════════════════════════════════════ */
