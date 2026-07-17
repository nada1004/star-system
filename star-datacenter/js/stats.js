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
    '@media (max-width:780px){.stats-hero{flex-direction:column;padding:16px;border-radius:20px}.stats-hero-title{font-size:20px}.stats-hero-badges{justify-content:flex-start}.stats-toolbar-card{padding:10px 10px 12px}.stats-chart-board,.stats-table-card{padding:10px}.stats-chart-wrap{padding:10px}.stats-select{min-width:180px;width:100%}.stats-compare-duel{grid-template-columns:1fr}.stats-compare-vs{min-height:24px}}'
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
  h+=`<div class="fbar utilbar utilbar--scroll no-export" style="overflow-x:auto;flex-wrap:nowrap;-webkit-overflow-scrolling:touch;scrollbar-width:none;gap:4px;margin-bottom:8px;align-items:center">
    <button class="pill ${window._statsViewMode==='core'?'on':''}" style="flex-shrink:0;white-space:nowrap" onclick="window._statsViewMode='core';window.statsSub='${_coreIds.has(window.statsSub||'')?(window.statsSub||'overview'):'overview'}';localStorage.setItem('su_statsSub',window.statsSub);render()">⚡ 핵심 통계</button>
    <button class="pill ${window._statsViewMode==='advanced'?'on':''}" style="flex-shrink:0;white-space:nowrap" onclick="window._statsViewMode='advanced';window.statsSub='${_coreIds.has(window.statsSub||'overview')?'starsystem':(window.statsSub||'starsystem')}';localStorage.setItem('su_statsSub',window.statsSub);render()">🧠 심화 분석</button>
    <span style="font-size:11px;color:var(--gray-l);font-weight:700;margin-left:4px">${window._statsViewMode==='core'?'자주 보는 핵심 지표 중심':'세부 비교·추세·매트릭스 중심'}</span>
  </div>`;
  // 1행: 그룹 pill 바
  h+=`<div class="fbar utilbar utilbar--scroll no-export" style="overflow-x:auto;flex-wrap:nowrap;-webkit-overflow-scrolling:touch;scrollbar-width:none;gap:4px;margin-bottom:10px;align-items:center">`;
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
  h+=`<div class="fbar utilbar utilbar--scroll no-export" style="overflow-x:auto;flex-wrap:nowrap;-webkit-overflow-scrolling:touch;scrollbar-width:none;gap:4px;margin:-2px 0 10px">`;
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
                            const res=h.result==='승'?'<span style="color:#dc2626;font-weight:1000">승</span>':'<span style="color:#2563eb;font-weight:1000">패</span>';
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
                            const res=h.result==='승'?'<span style="color:#dc2626;font-weight:1000">승</span>':'<span style="color:#2563eb;font-weight:1000">패</span>';
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
function statsOverviewHTML(){
  const proMatchIds=statsProMatchIds();
  const univStats={};
  const _players = Array.isArray(players) ? players : [];
  _players.forEach(p=>{
    if(!univStats[p.univ])univStats[p.univ]={w:0,l:0,color:gc(p.univ)};
    const h=statsNonProHist(p);
    univStats[p.univ].w+=h.filter(x=>x.result==='승').length;
    univStats[p.univ].l+=h.filter(x=>x.result==='패').length;
  });
  const univRank=Object.entries(univStats)
    .map(([name,s])=>({name,w:s.w,l:s.l,color:s.color,rate:s.w+s.l===0?0:Math.round(s.w/(s.w+s.l)*100)}))
    .filter(u=>u.w+u.l>=10)
    .sort((a,b)=>b.w-a.w||b.rate-a.rate);

  const rv={T:{T:{w:0,l:0},Z:{w:0,l:0},P:{w:0,l:0}},Z:{T:{w:0,l:0},Z:{w:0,l:0},P:{w:0,l:0}},P:{T:{w:0,l:0},Z:{w:0,l:0},P:{w:0,l:0}}};
  _players.forEach(p=>{
    if(!p.history||!p.race)return;
    statsNonProHist(p).forEach(h=>{
      if(!h.oppRace||!rv[p.race]||!rv[p.race][h.oppRace])return;
      if(h.result==='승')rv[p.race][h.oppRace].w++;
      else if(h.result==='패')rv[p.race][h.oppRace].l++;
    });
  });
  const mapStats={};
  _players.forEach(p=>{
    statsNonProHist(p).forEach(h=>{
      if(!h.map||h.map==='-')return;
      if(!mapStats[h.map])mapStats[h.map]={w:0,l:0};
      if(h.result==='승')mapStats[h.map].w++;
      else if(h.result==='패')mapStats[h.map].l++;
    });
  });
  const mapRank=Object.entries(mapStats).map(([name,s])=>({name,w:s.w,l:s.l,total:s.w+s.l})).sort((a,b)=>b.total-a.total);
  function calcFormPlayers(genderFilter, streakFilter){
    // streakFilter: '승' = 연승자만, '패' = 연패자만, undefined = 전체
    return _players.filter(p=>(genderFilter?p.gender===genderFilter:true))
      .map(p=>{
        const hist=[...(p.history||[])].sort((a,b)=>(b.date||'').localeCompare(a.date||''));
        const rec=hist.slice(0,5);
        if(rec.length<1)return null;
        const streak=(()=>{let s=0,type=rec[0]?.result;for(const h of rec){if(h.result===type)s++;else break;}return{n:s,type};})();
        return{...p,form:rec,streak};
      }).filter(Boolean)
      .filter(p=>streakFilter?p.streak.type===streakFilter:true)
      .sort((a,b)=>b.streak.n-a.streak.n).slice(0,10);
  }
  const formF=calcFormPlayers('F','승'), formM=calcFormPlayers('M','승');
  const worstFormF=calcFormPlayers('F','패'), worstFormM=calcFormPlayers('M','패');
  const raceColor={T:'#2563eb',Z:'#dc2626',P:'#7c3aed'};
  const raceName={T:'테란',Z:'저그',P:'프로토스'};
  const raceEmoji={T:'⚔️',Z:'🦟',P:'🔮'};
  // 대학별 활성 스트리머 수 (최근 30일)
  const _30dAgo=(()=>{const d=new Date();d.setDate(d.getDate()-30);return d.toISOString().slice(0,10);})();
  const _univActive={};
  _players.forEach(p=>{
    if(!p.univ)return;
    const hasRecent=(p.history||[]).some(h=>(h.date||'')>=_30dAgo);
    if(!_univActive[p.univ])_univActive[p.univ]={total:0,active:0};
    _univActive[p.univ].total++;
    if(hasRecent)_univActive[p.univ].active++;
  });
  function formRow(p,pi){
    const icons=p.form.map(h=>h.result==='승'
      ?'<span style="display:inline-block;width:20px;height:20px;background:var(--red);color:#fff;font-size:10px;font-weight:800;border-radius:4px;text-align:center;line-height:20px">W</span>'
      :'<span style="display:inline-block;width:20px;height:20px;background:var(--blue);color:#fff;font-size:10px;font-weight:800;border-radius:4px;text-align:center;line-height:20px">L</span>').join('');
    const sc=p.streak.type==='승'?'var(--red)':'var(--blue)';
    const si=p.streak.type==='승'?'🔥':'❄️';
    return`<div class="stats-list-item">
      <span style="font-weight:700;font-size:11px;color:var(--gray-l);min-width:20px;text-align:right">${pi+1}</span>
      ${getPlayerPhotoHTML(p.name,'38px')}
      <span style="font-weight:800;font-size:14px;cursor:pointer;color:var(--blue);min-width:65px" onclick="openPlayerModal('${escJS(p.name)}')">${escHTML(p.name)}${getStatusIconHTML(p.name)}</span>
      <span style="font-size:11px;color:${gc(p.univ)};font-weight:700;min-width:55px">${escHTML(p.univ)}</span>
      <span style="display:flex;gap:2px">${icons}</span>
      <span style="font-weight:800;font-size:12px;color:${sc};white-space:nowrap">${si} ${p.streak.n}연${p.streak.type==='승'?'승':'패'}</span>
    </div>`;
  }
  return`<div style="display:flex;flex-direction:column;gap:20px">
  <div class="ssec" id="stats-univ-sec">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
      <h4 style="margin:0;font-family:'Noto Sans KR',sans-serif">🏛️ 대학별 승률 랭킹</h4>
      <button class="btn-capture btn-xs no-export" onclick="captureStats()">📷 이미지 저장</button>
    </div>
    <div class="stats-list-stack">
      ${univRank.filter(u=>u.w+u.l>0).map((u,i)=>{
        const medal=i===0?'🥇':i===1?'🥈':i===2?'🥉':`${i+1}위`;
        return`<div class="stats-list-item" style="cursor:pointer" onclick="openUnivModal('${escJS(u.name)}')">
          <span style="min-width:32px;font-weight:800;font-size:13px">${medal}</span>
          <span class="ubadge" style="background:${u.color};min-width:80px;text-align:center">${escHTML(u.name)}</span>
          <div class="stats-progress">
            <div class="stats-progress-bar" style="width:${u.rate}%;background:${u.color}"></div>
          </div>
          <span style="min-width:50px;text-align:right;font-weight:700;font-size:13px">${u.rate}%</span>
          <span style="color:var(--gray-l);font-size:11px">${u.w}승${u.l}패</span>
          <span style="font-size:10px;color:${(_univActive[u.name]?.active||0)>0?'var(--green)':'var(--gray-l)'};white-space:nowrap" title="최근 30일 활성 스트리머">🟢${_univActive[u.name]?.active||0}/${_univActive[u.name]?.total||0}</span>
        </div>`;
      }).join('')||'<p style="color:var(--gray-l)">경기 기록이 없습니다.</p>'}
    </div>
  </div>
  <div class="ssec"><h4>⚔️ 종족별 상대전적</h4><div style="overflow-x:auto"><table class="stats-rank-table" style="min-width:400px">
    <thead><tr><th>내\상대</th>${['T','Z','P'].map(r=>`<th>${raceEmoji[r]} ${raceName[r]}</th>`).join('')}</tr></thead>
    <tbody>${['T','Z','P'].map(r=>`<tr><td style="font-weight:700;color:${raceColor[r]}">${raceEmoji[r]} ${raceName[r]}</td>${['T','Z','P'].map(o=>{
      const s=rv[r][o];const rate=s.w+s.l===0?'-':Math.round(s.w/(s.w+s.l)*100)+'%';
      const bg=r===o?'background:var(--border2)':s.w>s.l?'background:#dc262622':s.w<s.l?'background:#2563eb22':'';
      return`<td style="${bg}">${r===o?'<span style="color:var(--gray-l)">-</span>':`<span style="font-weight:700">${rate}</span><br><span style="font-size:10px;color:var(--gray-l)">${s.w}승${s.l}패</span>`}</td>`;
    }).join('')}</tr>`).join('')}</tbody>
  </table></div>
  <div class="stats-duo-grid" style="margin-top:10px">
    ${[['T','Z'],['T','P'],['Z','P']].map(([a,b])=>{
      const tw=rv[a][b].w, tl=rv[a][b].l, bw=rv[b][a].w, bl=rv[b][a].l;
      const tot=tw+tl+bw+bl;
      const aRate=tot===0?50:Math.round((tw+bl)/(tot)*100);
      const bRate=100-aRate;
      return`<div class="stats-surface-box" style="flex:1;min-width:180px">
        <div style="font-weight:800;font-size:12px;margin-bottom:6px;text-align:center">${raceEmoji[a]} ${raceName[a]} <span style="color:var(--gray-l)">vs</span> ${raceEmoji[b]} ${raceName[b]}</div>
        <div style="display:flex;height:10px;border-radius:5px;overflow:hidden;margin-bottom:4px">
          <div style="width:${aRate}%;background:${raceColor[a]};transition:.3s"></div>
          <div style="width:${bRate}%;background:${raceColor[b]};transition:.3s"></div>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:11px">
          <span style="color:${raceColor[a]};font-weight:700">${aRate}% (${tw+bl}승)</span>
          <span style="color:var(--gray-l);font-size:10px">${tot}경기</span>
          <span style="color:${raceColor[b]};font-weight:700">${bRate}% (${bw+tl}승)</span>
        </div>
      </div>`;
    }).join('')}
  </div></div>
  <div class="ssec"><h4>🗺️ 맵별 경기 통계</h4><div class="stats-duo-grid">
    ${mapRank.map(m=>{const rate=m.total===0?0:Math.round(m.w/m.total*100);return`<div class="stats-surface-box" style="min-width:150px;flex:1;max-width:220px">
      <div style="font-weight:800;font-size:13px;margin-bottom:4px">${m.name}</div>
      <div style="font-size:24px;font-weight:800;color:var(--blue)">${m.total}</div>
      <div style="font-size:10px;color:var(--gray-l);margin-bottom:6px">총 경기</div>
      <div style="height:4px;border-radius:2px;background:var(--border);overflow:hidden;margin-bottom:4px"><div style="height:100%;width:${rate}%;background:var(--blue);border-radius:2px"></div></div>
      <div style="font-size:11px;display:flex;justify-content:space-between"><span style="color:var(--red);font-weight:700">${m.w}승</span><span style="color:var(--gray-l)">${rate}%</span><span style="color:var(--blue);font-weight:700">${m.l}패</span></div>
    </div>`;}).join('')||'<p style="color:var(--gray-l)">기록 없음</p>'}
  </div></div>
  <div class="ssec"><h4>🔥 최근 폼 TOP 10 <span style="font-size:12px;color:#db2777;font-weight:600">👩 여자</span></h4>
    <div style="display:flex;flex-direction:column;gap:4px">${formF.map(formRow).join('')||'<p style="color:var(--gray-l)">기록 없음</p>'}</div>
  </div>
  <div class="ssec"><h4>🔥 최근 폼 TOP 10 <span style="font-size:12px;color:#2563eb;font-weight:600">👨 남자</span></h4>
    <div style="display:flex;flex-direction:column;gap:4px">${formM.map(formRow).join('')||'<p style="color:var(--gray-l)">기록 없음</p>'}</div>
  </div>
  <div class="ssec"><h4>🧊 최악 폼 TOP 10 <span style="font-size:12px;color:#db2777;font-weight:600">👩 여자</span> <span style="font-size:11px;color:var(--gray-l);font-weight:400">(연패 중)</span></h4>
    <div style="display:flex;flex-direction:column;gap:4px">${worstFormF.map(formRow).join('')||'<p style="color:var(--gray-l)">연패 중인 선수 없음</p>'}</div>
  </div>
  <div class="ssec"><h4>🧊 최악 폼 TOP 10 <span style="font-size:12px;color:#2563eb;font-weight:600">👨 남자</span> <span style="font-size:11px;color:var(--gray-l);font-weight:400">(연패 중)</span></h4>
    <div style="display:flex;flex-direction:column;gap:4px">${worstFormM.map(formRow).join('')||'<p style="color:var(--gray-l)">연패 중인 선수 없음</p>'}</div>
  </div>
  </div>`;
}

/* ══════════════════════════════════════
   2. ELO 랭킹 변동 그래프
══════════════════════════════════════ */
var _eloSelPlayer='';
function _statsRebuildHistoryCtaHTML(){
  // history가 비어있으면 통계 대부분이 "스트리머 없음"으로 보임 → 사용자에게 재생성 버튼 제공
  if(_statsHasAnyHistory()) return '';
  if(!_statsHasAnyMatchData()) return `<div style="padding:16px 18px;border:1px dashed var(--border2);border-radius:12px;color:var(--gray-l);font-size:12px">아직 저장된 경기 데이터가 없습니다.</div>`;
  return `
    <div style="padding:14px 16px;border:1px solid #fde68a;background:#fffbeb;border-radius:12px;display:flex;flex-direction:column;gap:8px">
      <div style="font-weight:900;color:#92400e">⚠️ 스트리머 경기 기록(history)이 비어 있습니다</div>
      <div style="font-size:12px;color:#a16207;line-height:1.6">
        통계 탭(ELO/성장/킬러/클러치/연속기록 등)은 <b>스트리머별 history</b>를 기준으로 집계합니다.<br>
        현재는 경기 데이터는 있는데 history가 아직 재생성되지 않아 "스트리머 없음"으로 보입니다.
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button class="btn btn-b btn-sm" onclick="try{if(typeof _rebuildAllPlayerHistoryCore==='function'){_rebuildAllPlayerHistoryCore();window.__stats_hist_ready=true;}render();}catch(e){alert(String(e));}">🛠️ 스트리머 기록 재생성</button>
      </div>
    </div>
  `;
}
function applyEloSearch(q, forceExact){
  const raw=String(q||'').trim();
  if(!raw) return false;
  const _players = Array.isArray(players) ? players : [];
  const cands=_players.filter(p=>_statsAllHist(p).length>0);
  const exact=cands.find(p=>String(p.name||'').trim()===raw);
  const partial=cands.filter(p=>String(p.name||'').toLowerCase().includes(raw.toLowerCase()));
  const hit=exact || ((!forceExact && partial.length) ? partial[0] : null);
  if(!hit) return false;
  _eloSelPlayer=hit.name;
  const inp=document.getElementById('elo-search-input'); if(inp) inp.value=hit.name;
  const drop=document.getElementById('elo-search-drop'); if(drop) drop.style.display='none';
  initEloChart();
  return true;
}
function eloSearchFilter(q){
  const d=document.getElementById('elo-search-drop');if(!d)return;
  const items=d.querySelectorAll('.sitem');
  items.forEach(el=>{el.style.display=el.textContent.toLowerCase().includes(q.toLowerCase())?'':'none';});
}
function statsEloHTML(){
  const cta=_statsRebuildHistoryCtaHTML();
  if(cta) return `<div class="ssec">${cta}</div>`;
  const _players = Array.isArray(players) ? players : [];
  const allWithHist=_players.filter(p=>_statsAllHist(p).length>0)
    .sort((a,b)=>(b.elo||ELO_DEFAULT)-(a.elo||ELO_DEFAULT));
  const top20=allWithHist.slice(0,30);
  if(!_eloSelPlayer&&allWithHist.length)_eloSelPlayer=allWithHist[0].name;
  const selP=statsP(_eloSelPlayer);
  const _eloVal=selP?.elo||ELO_DEFAULT;
  const _eloMonthDelta=selP?(()=>{
    const now=new Date();
    const ym=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;
    return (_statsAllHist(selP)||[]).filter(h=>h.date&&h.date.startsWith(ym)&&h.eloDelta!=null).reduce((s,h)=>s+(h.eloDelta||0),0);
  })():0;
  return`<div style="display:flex;flex-direction:column;gap:16px">
  <div class="ssec" id="stats-elo-sec">
    <div class="stats-chart-shell">
      <div class="stats-chart-toolbar">
        <div>
          <h4 style="margin:0">📈 ELO 랭킹 변동 그래프</h4>
          <div style="font-size:11px;color:var(--gray-l);margin-top:4px">선택한 스트리머의 ELO 흐름과 현재 랭킹을 함께 확인합니다.</div>
        </div>
        <div class="stats-chart-actions no-export">
          <select id="elo-player-select" class="stats-select" onchange="_eloSelPlayer=(function(v){try{var t=document.createElement('textarea');t.innerHTML=v;return t.value;}catch(e){return v;}})(this.value);initEloChart()">
            ${allWithHist.slice().sort((a,b)=>String(a.name||'').localeCompare(String(b.name||''),'ko')).map(p=>`<option value="${escHTML(p.name)}"${_eloSelPlayer===p.name?' selected':''}>${escHTML(p.name)} · ${escHTML(p.univ)} · ELO ${p.elo||1200}</option>`).join('')}
          </select>
          <button class="btn-capture btn-xs no-export" onclick="captureSection('stats-elo-sec','elo_ranking')">📷 이미지 저장</button>
        </div>
      </div>
      <div class="stats-metric-grid">
        <div class="stats-metric-card">
          <div class="stats-metric-label">선택 스트리머</div>
          <div class="stats-metric-value" style="font-size:18px">${escHTML(selP?.name||'-')}</div>
          <div class="stats-metric-sub">${escHTML(selP?.univ||'기록 없음')}</div>
        </div>
        <div class="stats-metric-card">
          <div class="stats-metric-label">현재 ELO</div>
          <div class="stats-metric-value" style="color:${_eloVal>=1400?'#7c3aed':_eloVal>=1300?'#d97706':_eloVal>=1200?'var(--green)':'var(--red)'}">${_eloVal}</div>
          <div class="stats-metric-sub">기본값 ${ELO_DEFAULT}</div>
        </div>
        <div class="stats-metric-card">
          <div class="stats-metric-label">이번달 변동</div>
          <div class="stats-metric-value" style="color:${_eloMonthDelta>=0?'var(--green)':'var(--red)'}">${_eloMonthDelta>0?'+':''}${_eloMonthDelta}</div>
          <div class="stats-metric-sub">현재 월 기준 합산</div>
        </div>
      </div>
      <div class="stats-chart-board">
        <div class="stats-chart-wrap">
          <canvas id="eloChart" style="width:100%;max-height:300px"></canvas>
        </div>
      </div>
      <div id="eloRankTable"></div>
    </div>
  </div>
  <div class="ssec">
    <h4>🏅 현재 ELO 랭킹 TOP 20</h4>
    <div class="stats-list-stack" style="margin-top:8px">
      ${top20.map((p,i)=>{
        const elo=p.elo||1200;
        const eloColor=elo>=1400?'#7c3aed':elo>=1300?'#d97706':elo>=1200?'var(--green)':'var(--red)';
        const badge=i===0?'🥇':i===1?'🥈':i===2?'🥉':`${i+1}`;
        const bar=Math.min(100,Math.max(0,((elo-900)/800)*100));
        return`<div class="stats-list-item" style="cursor:pointer" onclick="_eloSelPlayer='${escJS(p.name)}';initEloChart()">
          <span style="min-width:28px;font-weight:800;font-size:12px">${badge}</span>
          <span style="font-weight:800;font-size:13px;color:var(--blue);min-width:70px">${escHTML(p.name)}</span>
          <span style="font-size:11px;color:${gc(p.univ)};font-weight:700;min-width:60px">${escHTML(p.univ)}</span>
          <div class="stats-progress">
            <div class="stats-progress-bar" style="width:${bar}%;background:${eloColor}"></div>
          </div>
          <span style="font-weight:800;font-size:14px;color:${eloColor};min-width:48px;text-align:right">${elo}</span>
          ${(()=>{const now=new Date();const ym=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;const d=(_statsAllHist(p)||[]).filter(h=>h.date&&h.date.startsWith(ym)&&h.eloDelta!=null).reduce((s,h)=>s+(h.eloDelta||0),0);return d!==0?`<span class="stats-inline-badge" style="color:${d>0?'#15803d':'#b91c1c'};background:${d>0?'#dcfce7':'#fee2e2'}">${d>0?'+':''}${d}</span>`:'';})()} 
        </div>`;
      }).join('')}
    </div>
  </div>
  </div>`;
}
function initEloChart(){
  const canvas=document.getElementById('eloChart');
  if(!canvas)return;
  // HTML entity decode fallback (특수문자 이름 대응)
  let _eloKey=_eloSelPlayer;
  try{const ta=document.createElement('textarea');ta.innerHTML=_eloKey;_eloKey=ta.value;}catch(e){}
  let p=statsP(_eloKey);
  // statsP 미발견 시 players 배열 직접 탐색
  if(!p && _eloKey){
    p=(Array.isArray(window.players)?window.players:[]).find(x=>String(x&&x.name||'').trim()===_eloKey)||null;
  }
  const histAll = p ? _statsAllHist(p) : [];
  if(!p||!histAll.length){canvas.style.display='none';return;}
  canvas.style.display='block';
  const hist=[...histAll].sort((a,b)=>(String(a.date||'')).localeCompare(String(b.date||'')));
  // ELO 재구성: eloAfter 필드를 우선 사용하고, 없는 구간은 직전까지 알려진 ELO에서 델타를 누적한다.
  // (주의) elo 추적 변수를 eloAfter가 있을 때도 동기화해야 함 — 안 그러면 eloAfter가 끊긴 다음 기록부터
  // ELO_DEFAULT 기준으로 다시 누적되어 그래프가 갑자기 뚝 떨어지거나 튀는 오류가 발생한다.
  const pts=[];let elo=ELO_DEFAULT;
  hist.forEach((h,i)=>{
    if(h.eloAfter!=null){ elo=h.eloAfter; pts.push({i,elo,date:h.date||'',result:h.result,opp:h.opp||'',eloDelta:h.eloDelta||0}); }
    else{ elo+=(h.eloDelta||0); pts.push({i,elo,date:h.date||'',result:h.result,opp:h.opp||'',eloDelta:h.eloDelta||0}); }
  });
  if(!pts.length)return;
  const ctx=canvas.getContext('2d');
  const W=canvas.offsetWidth||600;const H=280;
  canvas.width=W;canvas.height=H;
  const pad={t:20,r:20,b:50,l:55};
  const minE=Math.min(...pts.map(x=>x.elo))-30;
  const maxE=Math.max(...pts.map(x=>x.elo))+30;
  const mapX=i=>(i/(pts.length-1||1))*(W-pad.l-pad.r)+pad.l;
  const mapY=e=>H-pad.b-((e-minE)/(maxE-minE||1))*(H-pad.t-pad.b);
  ctx.clearRect(0,0,W,H);
  // 배경 그리드
  ctx.strokeStyle='#e2e8f0';ctx.lineWidth=1;
  for(let g=0;g<=4;g++){
    const y=pad.t+g*(H-pad.t-pad.b)/4;
    ctx.beginPath();ctx.moveTo(pad.l,y);ctx.lineTo(W-pad.r,y);ctx.stroke();
    const val=Math.round(maxE-g*(maxE-minE)/4);
    ctx.fillStyle='#94a3b8';ctx.font='10px sans-serif';ctx.textAlign='right';
    ctx.fillText(val,pad.l-4,y+4);
  }
  // 1200 기준선
  const baseY=mapY(1200);
  ctx.strokeStyle='#cbd5e1';ctx.setLineDash([4,4]);ctx.lineWidth=1;
  ctx.beginPath();ctx.moveTo(pad.l,baseY);ctx.lineTo(W-pad.r,baseY);ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle='#94a3b8';ctx.font='9px sans-serif';ctx.textAlign='left';
  ctx.fillText('1200',pad.l+2,baseY-3);
  // 그라디언트 채우기
  const grad=ctx.createLinearGradient(0,pad.t,0,H-pad.b);
  grad.addColorStop(0,'rgba(37,99,235,0.25)');grad.addColorStop(1,'rgba(37,99,235,0)');
  ctx.beginPath();ctx.moveTo(mapX(0),mapY(pts[0].elo));
  pts.forEach(pt=>ctx.lineTo(mapX(pt.i),mapY(pt.elo)));
  ctx.lineTo(mapX(pts.length-1),H-pad.b);ctx.lineTo(mapX(0),H-pad.b);
  ctx.closePath();ctx.fillStyle=grad;ctx.fill();
  // 선
  ctx.beginPath();ctx.strokeStyle='#2563eb';ctx.lineWidth=2.5;
  ctx.moveTo(mapX(0),mapY(pts[0].elo));
  pts.forEach(pt=>ctx.lineTo(mapX(pt.i),mapY(pt.elo)));
  ctx.stroke();
  // 점
  pts.forEach(pt=>{
    ctx.beginPath();
    ctx.arc(mapX(pt.i),mapY(pt.elo),4,0,Math.PI*2);
    ctx.fillStyle=pt.result==='승'?'#dc2626':'#2563eb';
    ctx.fill();ctx.strokeStyle='#fff';ctx.lineWidth=1.5;ctx.stroke();
  });
  // X축 날짜 (첫/마지막)
  ctx.fillStyle='#64748b';ctx.font='10px sans-serif';ctx.textAlign='center';
  if(pts.length>0)ctx.fillText(pts[0].date.slice(5)||'',mapX(0),H-pad.b+16);
  if(pts.length>1)ctx.fillText(pts[pts.length-1].date.slice(5)||'',mapX(pts.length-1),H-pad.b+16);
  // 제목
  ctx.fillStyle='#1e293b';ctx.font='bold 13px sans-serif';ctx.textAlign='left';
  ctx.fillText(`${p.name} ELO 변동 (현재: ${p.elo||1200})`,pad.l,14);
  // 드롭다운 동기화
  const sel=document.getElementById('elo-player-select');
  if(sel) sel.value=_eloSelPlayer;
  // 호버 툴팁
  let _eloTip=document.getElementById('eloChartTip');
  if(!_eloTip){
    _eloTip=document.createElement('div');
    _eloTip.id='eloChartTip';
    _eloTip.style.cssText='position:fixed;display:none;background:rgba(15,23,42,.92);color:#fff;font-size:11px;padding:7px 11px;border-radius:9px;pointer-events:none;white-space:nowrap;z-index:9999;box-shadow:0 4px 16px rgba(0,0,0,.3);line-height:1.6';
    document.body.appendChild(_eloTip);
  }
  canvas.onmousemove=e=>{
    const rect=canvas.getBoundingClientRect();
    const mx=(e.clientX-rect.left)*(W/rect.width);
    let ci=0,md=Infinity;
    pts.forEach((pt,i)=>{const d=Math.abs(mapX(pt.i)-mx);if(d<md){md=d;ci=i;}});
    if(md*(rect.width/W)<32){
      const pt=pts[ci];const sign=(pt.eloDelta||0)>=0?'+':'';
      _eloTip.innerHTML=`<b>${pt.opp||'?'}</b> <span style="color:${pt.result==='승'?'#fca5a5':'#93c5fd'}">${pt.result}</span><br>${sign}${pt.eloDelta||0} → <b>${pt.elo}</b><br><span style="color:#94a3b8">${pt.date}</span>`;
      _eloTip.style.display='block';
      _eloTip.style.left=(e.clientX>window.innerWidth/2?e.clientX-145:e.clientX+12)+'px';
      _eloTip.style.top=(e.clientY-50)+'px';
    } else _eloTip.style.display='none';
  };
  canvas.onmouseleave=()=>{if(_eloTip)_eloTip.style.display='none';};
}

/* ══════════════════════════════════════
   3. 선수 성장 곡선
══════════════════════════════════════ */
var _growthSel='';
function _statsGrowthCandidates(){
  const _players = Array.isArray(players) ? players : [];
  return _players.filter(p=>{
    try{ return _statsAllHist(p).length >= 2; }catch(e){ return (p.history||[]).length >= 2; }
  }).sort((a,b)=>{
    const ah=_statsAllHist(a).length, bh=_statsAllHist(b).length;
    return bh-ah || String(a.name||'').localeCompare(String(b.name||''),'ko');
  });
}
function growthSearchFilter(q){
  const d=document.getElementById('growth-search-drop');if(!d)return;
  const qq=String(q||'').trim().toLowerCase();
  let first=null, visible=0;
  d.querySelectorAll('.sitem').forEach(el=>{
    const ok=!qq || el.textContent.toLowerCase().includes(qq);
    el.style.display=ok?'':'none';
    if(ok){ visible++; if(!first) first=el; }
  });
  const empty=document.getElementById('growth-search-empty');
  if(empty) empty.style.display = visible ? 'none' : 'block';
  return {first,visible};
}
function applyGrowthSearch(q, forceExact){
  const cands=_statsGrowthCandidates();
  const raw=String(q||'').trim();
  if(!raw) return false;
  const exact=cands.find(p=>String(p.name||'').trim()===raw);
  const partial=cands.filter(p=>String(p.name||'').toLowerCase().includes(raw.toLowerCase()));
  const hit=exact || ((!forceExact && partial.length) ? partial[0] : null);
  if(!hit) return false;
  _growthSel=hit.name;
  const inp=document.getElementById('growth-search-input'); if(inp) inp.value=hit.name;
  const drop=document.getElementById('growth-search-drop'); if(drop) drop.style.display='none';
  initGrowthChart();
  return true;
}
function statsGrowthHTML(){
  const cta=_statsRebuildHistoryCtaHTML();
  if(cta) return `<div class="ssec">${cta}</div>`;
  const cands=_statsGrowthCandidates();
  if(!_growthSel&&cands.length)_growthSel=cands[0].name;
  const selP=statsP(_growthSel);
  const _games=(selP&&_statsAllHist(selP))?_statsAllHist(selP).length:0;
  return`<div class="ssec" id="stats-growth-sec">
    <div class="stats-chart-shell">
      <div class="stats-chart-toolbar">
        <div>
          <h4 style="margin:0">📊 스트리머 성장 곡선</h4>
          <div style="font-size:11px;color:var(--gray-l);margin-top:4px">누적 승률 변화와 최근 성장 흐름을 한눈에 봅니다.</div>
        </div>
        <div class="stats-chart-actions no-export">
          <select id="growth-player-select" class="stats-select" onchange="_growthSel=(function(v){try{var t=document.createElement('textarea');t.innerHTML=v;return t.value;}catch(e){return v;}})(this.value);initGrowthChart()">
            ${cands.slice().sort((a,b)=>String(a.name||'').localeCompare(String(b.name||''),'ko')).map(p=>`<option value="${escHTML(p.name)}"${_growthSel===p.name?' selected':''}>${escHTML(p.name)} · ${escHTML(p.univ)} · ${(_statsAllHist(p)||[]).length}경기</option>`).join('')}
          </select>
          <button class="btn-capture btn-xs no-export" onclick="captureSection('stats-growth-sec','growth_chart')">📷 이미지 저장</button>
        </div>
      </div>
      <div class="stats-metric-grid">
        <div class="stats-metric-card">
          <div class="stats-metric-label">선택 스트리머</div>
          <div class="stats-metric-value" style="font-size:18px">${escHTML(selP?.name||'-')}</div>
          <div class="stats-metric-sub">${escHTML(selP?.univ||'기록 없음')}</div>
        </div>
        <div class="stats-metric-card">
          <div class="stats-metric-label">누적 경기 수</div>
          <div class="stats-metric-value">${_games}</div>
          <div class="stats-metric-sub">비프로 경기 기준</div>
        </div>
        <div class="stats-metric-card">
          <div class="stats-metric-label">차트 기준</div>
          <div class="stats-metric-value" style="font-size:18px">누적 승률</div>
          <div class="stats-metric-sub">초반부터 현재까지</div>
        </div>
      </div>
      <div class="stats-chart-board">
        <div class="stats-chart-wrap">
          <canvas id="growthChart" style="width:100%;max-height:300px"></canvas>
        </div>
      </div>
      <div id="growthInfo" class="stats-metric-grid"></div>
    </div>
  </div>`;
}
function initGrowthChart(){
  const canvas=document.getElementById('growthChart');
  if(!canvas)return;
  // _growthSel이 HTML 엔티티로 인코딩된 경우 디코딩 후 조회 (특수문자 스트리머명 버그 수정)
  try{const _tmp=document.createElement('textarea');_tmp.innerHTML=_growthSel;if(_tmp.value&&_tmp.value!==_growthSel)_growthSel=_tmp.value;}catch(e){}
  let p=statsP(_growthSel);
  // statsP 미발견 시 이름 부분 매칭 fallback
  if(!p&&_growthSel){p=(Array.isArray(players)?players:[]).find(x=>String(x&&x.name||'').trim()===_growthSel.trim())||null;}
  const histF = p ? statsNonProHist(p) : [];
  const info=document.getElementById('growthInfo');
  if(!p||histF.length<2){
    canvas.style.display='none';
    if(info) info.innerHTML = `<div style="padding:16px 18px;border:1px dashed var(--border2);border-radius:12px;color:var(--gray-l);font-size:12px">선택한 스트리머의 경기 기록이 2경기 이상 있어야 성장 곡선을 표시할 수 있습니다.</div>`;
    return;
  }
  canvas.style.display='block';
  const hist=[...histF].sort((a,b)=>(String(a.date||'')).localeCompare(String(b.date||'')));
  // 누적 승률 계산
  const pts=[];let w=0,total=0;
  hist.forEach((h,i)=>{
    total++;if(h.result==='승')w++;
    pts.push({i,rate:Math.round(w/total*100),w,l:total-w,date:h.date||''});
  });
  const W=canvas.offsetWidth||600;const H=260;
  canvas.width=W;canvas.height=H;
  const pad={t:20,r:20,b:45,l:45};
  const mapX=i=>(i/(pts.length-1||1))*(W-pad.l-pad.r)+pad.l;
  const mapY=r=>H-pad.b-(r/100)*(H-pad.t-pad.b);
  const ctx=canvas.getContext('2d');
  ctx.clearRect(0,0,W,H);
  // 그리드
  [0,25,50,75,100].forEach(g=>{
    const y=mapY(g);
    ctx.strokeStyle='#e2e8f0';ctx.lineWidth=1;ctx.setLineDash(g===50?[4,4]:[]);
    ctx.beginPath();ctx.moveTo(pad.l,y);ctx.lineTo(W-pad.r,y);ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle='#94a3b8';ctx.font='10px sans-serif';ctx.textAlign='right';
    ctx.fillText(g+'%',pad.l-4,y+4);
  });
  ctx.setLineDash([]);
  // 50% 기준선 강조
  const baseY=mapY(50);
  ctx.fillStyle='#64748b';ctx.font='9px sans-serif';ctx.textAlign='left';
  ctx.fillText('50%',pad.l+2,baseY-3);
  // 채우기
  const col=pts[pts.length-1].rate>=50?'rgba(22,163,74,0.2)':'rgba(220,38,38,0.2)';
  const lineCol=pts[pts.length-1].rate>=50?'#dc2626':'#2563eb';
  ctx.beginPath();ctx.moveTo(mapX(0),mapY(pts[0].rate));
  pts.forEach(pt=>ctx.lineTo(mapX(pt.i),mapY(pt.rate)));
  ctx.lineTo(mapX(pts.length-1),H-pad.b);ctx.lineTo(mapX(0),H-pad.b);
  ctx.closePath();ctx.fillStyle=col;ctx.fill();
  // 선
  ctx.beginPath();ctx.strokeStyle=lineCol;ctx.lineWidth=2.5;ctx.setLineDash([]);
  ctx.moveTo(mapX(0),mapY(pts[0].rate));
  pts.forEach(pt=>ctx.lineTo(mapX(pt.i),mapY(pt.rate)));
  ctx.stroke();
  // 날짜 레이블
  ctx.fillStyle='#64748b';ctx.font='10px sans-serif';ctx.textAlign='center';
  if(pts[0].date)ctx.fillText(pts[0].date.slice(5)||'',mapX(0),H-pad.b+14);
  if(pts[pts.length-1].date)ctx.fillText(pts[pts.length-1].date.slice(5)||'',mapX(pts.length-1),H-pad.b+14);
  ctx.fillStyle='#1e293b';ctx.font='bold 13px sans-serif';ctx.textAlign='left';
  ctx.fillText(`${p.name} 누적 승률 추이`,pad.l,14);
  // 인포
  if(info){
    const last=pts[pts.length-1];
    const early=pts.slice(0,Math.ceil(pts.length/3));
    const late=pts.slice(Math.floor(pts.length*2/3));
    const earlyRate=early.length?early[early.length-1].rate:0;
    const lateRate=late.length?late[late.length-1].rate:0;
    const trend=lateRate-earlyRate;
    info.innerHTML=`
      <div class="stats-metric-card" style="text-align:center;background:var(--blue-l);border-color:var(--blue-ll)">
        <div class="stats-metric-label" style="color:var(--blue)">현재 승률</div>
        <div class="stats-metric-value" style="color:var(--blue)">${last.rate}%</div>
        <div class="stats-metric-sub">${last.w}승 ${last.l}패</div>
      </div>
      <div class="stats-metric-card" style="text-align:center;background:${trend>=0?'#f0fdf4':'#fef2f2'};border-color:${trend>=0?'#bbf7d0':'#fecaca'}">
        <div class="stats-metric-label" style="color:${trend>=0?'var(--green)':'var(--red)'}">성장 추세</div>
        <div class="stats-metric-value" style="color:${trend>=0?'var(--green)':'var(--red)'}">${trend>=0?'📈':'📉'} ${trend>0?'+':''}${trend}%</div>
        <div class="stats-metric-sub">초반 → 후반 변화</div>
      </div>
      <div class="stats-metric-card" style="text-align:center;background:#fffbeb;border-color:#fde68a">
        <div class="stats-metric-label" style="color:var(--gold)">총 경기</div>
        <div class="stats-metric-value" style="color:var(--gold)">${last.w+last.l}</div>
        <div class="stats-metric-sub">경기 기록</div>
      </div>`;
  }
  const sel=document.getElementById('growth-player-select');
  if(sel) sel.value=_growthSel;
}

/* ══════════════════════════════════════
   4. 이달의 선수
══════════════════════════════════════ */
function statsAwardHTML(){
  const _players = Array.isArray(players) ? players : [];
  const monthsF=_statsLatestActiveMonths('F');
  const monthsM=_statsLatestActiveMonths('M');
  const monthsAll=_statsLatestActiveMonths('');
  try{
    if(!window._statsAwardRankGender){
      window._statsAwardRankGender = localStorage.getItem('su_stats_award_rank_gender') || 'F';
    }
  }catch(e){
    window._statsAwardRankGender = window._statsAwardRankGender || 'F';
  }

  // ✅ 전역 필터(올해/이번달/최근3개월/최소경기 등)도 "이달의 스트리머"에서 동작하게:
  // - 날짜 From/To가 설정되어 있으면 해당 기간으로 집계
  // - 없으면 월(YYYY-MM)로 집계
  const _toIso = (v)=> (typeof window._toIsoDateStr==='function') ? window._toIsoDateStr(v) : String(v||'').trim();
  const _gfFrom = String(_statsDateFrom||'').trim();
  const _gfTo = String(_statsDateTo||'').trim();
  const _rangeFrom = _gfFrom ? _toIso(_gfFrom) : (_gfTo ? _toIso(_gfTo) : '');
  const _rangeTo = _gfTo ? _toIso(_gfTo) : (_gfFrom ? _toIso(_gfFrom) : '');
  const _useRange = !!(_rangeFrom || _rangeTo);
  const _rangeLabel = _useRange ? `${_rangeFrom||'-'} ~ ${_rangeTo||'-'}` : '';

  const _rankGender = ['F','M','ALL'].includes(String(window._statsAwardRankGender||'').toUpperCase())
    ? String(window._statsAwardRankGender||'').toUpperCase()
    : 'F';
  let ym=(_rankGender==='F' ? monthsF[0] : _rankGender==='M' ? monthsM[0] : monthsAll[0]) || (()=>{const now=new Date(); return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;})();
  if(_useRange){
    const _ym = String((_rangeFrom || _rangeTo || '')).slice(0,7);
    if(/^\d{4}-\d{2}$/.test(_ym)) ym = _ym;
  }
  let _isFullMonth = false;
  if(_rangeFrom && _rangeTo && _rangeFrom === ym + '-01'){
    const [yy,mm]=String(ym).split('-').map(Number);
    if(yy && mm){
      const last = new Date(yy, mm, 0).getDate();
      const toFull = ym + '-' + String(last).padStart(2,'0');
      if(_rangeTo === toFull) _isFullMonth = true;
    }
  }
  const _awardUseRange = _useRange && !_isFullMonth;
  const prevYm=(function(cur){ const [yy,mm]=String(cur).split('-').map(Number); if(!yy||!mm) return ''; return mm===1?`${yy-1}-12`:`${yy}-${String(mm-1).padStart(2,'0')}`; })(ym);

  function calcMonth(ym2, gender){
    const g=_statsNormGender(gender);
    return _players.map(p=>{
      if(g && _statsNormGender(p.gender)!==g) return null;
      const mh=statsNonProHist(p).filter(h=>_statsYmFromDateStr(h&&h.date)===ym2);
      const w=mh.filter(h=>h.result==='승').length;
      const l=mh.filter(h=>h.result==='패').length;
      const tot=w+l;
      return{...p,mw:w,ml:l,mt:tot,mrate:tot?Math.round(w/tot*100):0};
    })
    .filter(Boolean)
    .filter(p=>p.mt>=Math.max(1, Number(_statsMinGames||0)||0))
    .sort((a,b)=>b.mw-a.mw||b.mrate-a.mrate);
  }
  function calcRange(fromIso, toIso, gender){
    const g=_statsNormGender(gender);
    const from = String(fromIso||'').trim();
    const to = String(toIso||'').trim();
    return _players.map(p=>{
      if(g && _statsNormGender(p.gender)!==g) return null;
      const mh=statsNonProHist(p).filter(h=>{
        const d = _toIso(h && h.date);
        if(!d || !/^\d{4}-\d{2}-\d{2}$/.test(d)) return false;
        if(from && d < from) return false;
        if(to && d > to) return false;
        return true;
      });
      const w=mh.filter(h=>h.result==='승').length;
      const l=mh.filter(h=>h.result==='패').length;
      const tot=w+l;
      return{...p,mw:w,ml:l,mt:tot,mrate:tot?Math.round(w/tot*100):0};
    })
    .filter(Boolean)
    .filter(p=>p.mt>=Math.max(1, Number(_statsMinGames||0)||0))
    .sort((a,b)=>b.mw-a.mw||b.mrate-a.mrate);
  }
  const curListF=_awardUseRange ? calcRange(_rangeFrom,_rangeTo,'F') : calcMonth(ym,'F');
  const curListM=_awardUseRange ? calcRange(_rangeFrom,_rangeTo,'M') : calcMonth(ym,'M');
  const prevListF=calcMonth(prevYm,'F');
  const prevListM=calcMonth(prevYm,'M');
  const curList=[...(curListF||[]), ...(curListM||[])];
  const curRankList = _rankGender==='F' ? curListF : _rankGender==='M' ? curListM : curList;
  const [y,m]=ym.split('-');
  const [py,pm]=prevYm.split('-');
  function awardCard(title,p,extra='',color='#2563eb'){
    if(!p)return`<div class="stats-award-card is-empty"><div style="font-size:28px;margin-bottom:8px">🏆</div><div style="color:var(--gray-l)">기록 없음</div></div>`;
    const univColor=gc(p.univ);
    const _univIcons = (typeof UNIV_ICONS!=='undefined' && UNIV_ICONS) ? UNIV_ICONS : (window.UNIV_ICONS||{});
    const _univCfg = (typeof univCfg!=='undefined' && Array.isArray(univCfg)) ? univCfg : [];
    const _gUI = (typeof gUI === 'function') ? gUI : (()=>'');
    // 대학 아이콘 (gUI 사용 - UNIV_ICONS 또는 univCfg.icon 우선)
    const univIconUrl=(_univIcons && _univIcons[p.univ])||((_univCfg.find(x=>x.name===p.univ)||{}).icon)||'';
    const univIconUrlAttr = (typeof escAttr==='function') ? escAttr(univIconUrl) : escHTML(univIconUrl);
    // 아이콘: URL 있으면 이미지, 없으면 대학명 첫 글자 표시
    const univIconInner=univIconUrl
      ? `<img src="${univIconUrlAttr}" style="width:32px;height:32px;object-fit:contain" onerror="this.outerHTML='<span style=font-size:16px;font-weight:900;color:white>${escHTML(p.univ[0]||'?')}</span>'">`
      : `<span style="font-size:18px;font-weight:900;color:#fff;font-family:Noto Sans KR,sans-serif">${escHTML(p.univ[0]||'?')}</span>`;
    return`<div class="stats-award-card" style="background:linear-gradient(135deg,${color}18,${color}08);border:2px solid ${color}44" onclick="openPlayerModal('${escJS(p.name)}')">
      <div class="stats-award-head" style="color:${color}">${title}</div>
      <div class="stats-award-body">
        ${p.photo?`<img src="${toHttpsUrl(p.photo)}" class="stats-award-avatar" style="object-fit:cover;border:2px solid ${univColor};box-shadow:0 2px 8px ${univColor}55" onerror="this.style.display='none'">`:`<div class="stats-award-avatar" style="background:${univColor};box-shadow:0 2px 8px ${univColor}55">${univIconInner}</div>`}
        <div style="min-width:0">
          <div class="stats-award-name">${escHTML(p.name)}</div>
          <div class="stats-award-meta">
            <span style="display:inline-flex;align-items:center;gap:3px;background:${univColor};color:#fff;font-size:10px;padding:2px 7px;border-radius:4px;font-weight:700">${_gUI(p.univ,'0.85em')}${escHTML(p.univ)}</span>
            <span style="font-size:10px;color:var(--gray-l)">${getTierLabel(p.tier||'-')}</span>
          </div>
        </div>
      </div>
      <div class="stats-award-stats">
        <span class="stats-award-stat" style="background:var(--red)">${p.mw}승</span>
        <span class="stats-award-stat" style="background:var(--blue)">${p.ml}패</span>
        <span class="stats-award-stat" style="background:${color}">${p.mrate}%</span>
      </div>
      ${extra?`<div style="margin-top:8px;font-size:11px;color:${color};font-weight:600">${extra}</div>`:''}
    </div>`;
  }
  function pickAwards(list){
    const top3=[...(list||[])].sort((a,b)=>b.mw-a.mw||b.mrate-a.mrate||b.mt-a.mt).slice(0,3);
    return { top3 };
  }
  const aF=pickAwards(curListF);
  const aM=pickAwards(curListM);
  const pF=pickAwards(prevListF);
  const pM=pickAwards(prevListM);
  // 전월 대비(표시용)는 남녀 합산(전체 기준)으로 계산
  const prevMap=Object.fromEntries([...(prevListF||[]), ...(prevListM||[])].map(p=>[p.name,p]));
  function trendBadge(p){
    const pp=prevMap[p.name];
    if(!pp)return`<span style="font-size:10px;color:var(--gray-l)">신규</span>`;
    const dw=p.mw-pp.mw,dr=p.mrate-pp.mrate;
    const wStr=dw>0?`<span style="color:#16a34a">▲${dw}승</span>`:dw<0?`<span style="color:#dc2626">▼${Math.abs(dw)}승</span>`:`<span style="color:var(--gray-l)">-</span>`;
    const rStr=dr>0?`<span style="color:#16a34a;font-size:9px">+${dr}%</span>`:dr<0?`<span style="color:#dc2626;font-size:9px">${dr}%</span>`:'';
    return`${wStr}${rStr?` ${rStr}`:''}`;
  }
  return`<div style="display:flex;flex-direction:column;gap:20px">
  <div class="ssec" id="stats-award-sec">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;flex-wrap:wrap;gap:8px">
      <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
        <h4 style="margin:0">🏆 이달의 스트리머 ${
          _awardUseRange
            ? `<span style="font-size:12px;color:var(--gray-l);font-weight:400">${_rangeLabel}</span>`
            : `<span style="font-size:12px;color:var(--gray-l);font-weight:400">${y}년 ${m}월</span>`
        } <span style="font-size:11px;color:var(--gray-l);font-weight:400">(프로리그 제외)</span></h4>
      </div>
      <button class="btn-capture btn-xs no-export" onclick="captureSection('stats-award-sec','award')">📷 이미지 저장</button>
    </div>
    <div style="font-size:11px;color:var(--gray-l);margin:-6px 0 10px;line-height:1.5">
      ${_awardUseRange
        ? `※ 현재는 전역 필터(올해/최근3개월/기간 From~To)로 집계 중입니다. <b>최소경기</b>도 반영됩니다.`
        : `※ 기본은 <b>월 단위</b> 자동 집계이며, 전역 필터(올해/최근3개월/월 입력/기간)를 사용하면 해당 기간 집계로 자동 전환됩니다.`
      }
    </div>
    <div class="stats-award-label" style="color:#db2777">👩 여자</div>
    <div class="stats-award-grid">
      ${awardCard('🥇 1위',aF.top3[0]||null,'이번달 승수 1위','#db2777')}
      ${awardCard('🥈 2위',aF.top3[1]||null,'이번달 승수 2위','#db2777')}
      ${awardCard('🥉 3위',aF.top3[2]||null,'이번달 승수 3위','#db2777')}
    </div>
    <div class="stats-award-label" style="color:#2563eb;margin-top:14px">👨 남자</div>
    <div class="stats-award-grid">
      ${awardCard('🥇 1위',aM.top3[0]||null,'이번달 승수 1위','#2563eb')}
      ${awardCard('🥈 2위',aM.top3[1]||null,'이번달 승수 2위','#2563eb')}
      ${awardCard('🥉 3위',aM.top3[2]||null,'이번달 승수 3위','#2563eb')}
    </div>
  </div>
  <div class="ssec">
    <h4 style="margin-bottom:14px">📅 지난달 TOP <span style="font-size:12px;color:var(--gray-l);font-weight:400">${py}년 ${pm}월</span></h4>
    <div class="stats-award-label" style="color:#db2777">👩 여자</div>
    <div class="stats-award-grid">
      ${awardCard('🥇 1위',pF.top3[0]||null,'','#db2777')}
      ${awardCard('🥈 2위',pF.top3[1]||null,'','#db2777')}
      ${awardCard('🥉 3위',pF.top3[2]||null,'','#db2777')}
    </div>
    <div class="stats-award-label" style="color:#2563eb;margin-top:14px">👨 남자</div>
    <div class="stats-award-grid">
      ${awardCard('🥇 1위',pM.top3[0]||null,'','#2563eb')}
      ${awardCard('🥈 2위',pM.top3[1]||null,'','#2563eb')}
      ${awardCard('🥉 3위',pM.top3[2]||null,'','#2563eb')}
    </div>
  </div>
  <div class="ssec">
    <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;margin-bottom:10px">
      <h4 style="margin:0">📋 이달 전체 순위 ${
        _awardUseRange
          ? `<span style="font-size:12px;color:var(--gray-l);font-weight:400">${_rangeLabel}</span>`
          : `<span style="font-size:12px;color:var(--gray-l);font-weight:400">${y}년 ${m}월</span>`
      }</h4>
      <div class="stats-award-toggle no-export">
        <button class="female ${_rankGender==='F'?'on':''}" onclick="window._statsAwardRankGender='F';try{localStorage.setItem('su_stats_award_rank_gender','F')}catch(e){};render()">👩 여자</button>
        <button class="male ${_rankGender==='M'?'on':''}" onclick="window._statsAwardRankGender='M';try{localStorage.setItem('su_stats_award_rank_gender','M')}catch(e){};render()">👨 남자</button>
        <button class="${_rankGender==='ALL'?'on':''}" onclick="window._statsAwardRankGender='ALL';try{localStorage.setItem('su_stats_award_rank_gender','ALL')}catch(e){};render()">🌐 전체</button>
      </div>
    </div>
    <div style="font-size:11px;color:var(--gray-l);margin:-2px 0 10px;line-height:1.5">현재는 <b>${_rankGender==='F'?'여자':'M'===_rankGender?'남자':'전체'}</b> 기준 순위만 표시됩니다.</div>
    ${curRankList.length===0?'<p style="color:var(--gray-l)">선택한 조건의 경기 기록이 없습니다.</p>':`
    <table class="stats-rank-table"><thead><tr><th>순위</th><th>선수</th><th>대학</th><th>티어</th><th>승</th><th>패</th><th>승률</th><th>경기수</th><th title="전월 대비">전월비</th></tr></thead><tbody>
    ${[...curRankList].sort((a,b)=>b.mw-a.mw||b.mrate-a.mrate).map((p,i)=>`<tr class="${i<3?'stats-rank-top':''}">
      <td>${i===0?'🥇':i===1?'🥈':i===2?'🥉':i+1+'위'}</td>
      <td class="stats-rank-player" onclick="openPlayerModal('${escJS(p.name)}')">${escHTML(p.name)}</td>
      <td><span class="ubadge" style="background:${gc(p.univ)}">${escHTML(p.univ)}</span></td>
      <td>${p.tier||'-'}</td>
      <td class="wt">${p.mw}</td><td class="lt">${p.ml}</td>
      <td style="font-weight:700;color:${p.mrate>=50?'var(--red)':'var(--blue)'}">${p.mrate}%</td>
      <td>${p.mt}</td>
      <td style="font-size:11px;white-space:nowrap">${trendBadge(p)}</td>
    </tr>`).join('')}
    </tbody></table>`}
  </div></div>`;
}

/* ══════════════════════════════════════
   5. 최다 기록 보유자
══════════════════════════════════════ */
function statsRecordsHTML(){
  const _players = Array.isArray(players) ? players : [];
  if(!_players.length)return`<div class="ssec"><p style="color:var(--gray-l)">스트리머 데이터가 없습니다.</p></div>`;
  const proIds=statsProMatchIds();
  const withStats=_players.map(p=>{
    const h=statsNonProHist(p);
    const ph=(p.history||[]).filter(x=>proIds.has(x.matchId));
    const w=h.filter(x=>x.result==='승').length;
    const l=h.filter(x=>x.result==='패').length;
    const tot=w+l;
    // 최장 연승 계산 (날짜 오름차순 정렬 후 순방향 계산)
    let maxStreak=0,cur=0,lastRes='';
    [...h].sort((a,b)=>(String(a.date||'')).localeCompare(String(b.date||''))).forEach(x=>{if(x.result===lastRes){cur++;}else{cur=1;lastRes=x.result;}if(lastRes==='승')maxStreak=Math.max(maxStreak,cur);});
    // 현재 연승 (최신→과거 내림차순 정렬 후 첫 연속 구간)
    let curStreak=0,curStreakType='';
    for(const x of [...h].sort((a,b)=>(String(b.date||'')).localeCompare(String(a.date||'')))){if(!curStreakType||x.result===curStreakType){curStreak++;curStreakType=x.result;}else break;}
    return{...p,w,l,tot,rate:tot?Math.round(w/tot*100):0,maxStreak,
      curStreak,curStreakType,elo:p.elo||ELO_DEFAULT,proGames:ph.length,points:p.points||0};
  }).filter(p=>p.tot>0||p.proGames>0);
  if(!withStats.length)return`<div class="ssec"><p style="color:var(--gray-l)">기록이 없습니다.</p></div>`;
  const cats=[
    {title:'🏆 역대 최다승',icon:'🏆',sort:(a,b)=>b.w-a.w,val:p=>`${p.w}승`,sub:p=>`총 ${p.tot}경기`},
    {title:'📊 역대 최고 승률',icon:'📊',sort:(a,b)=>b.rate-a.rate||b.tot-a.tot,val:p=>`${p.rate}%`,sub:p=>`${p.w}승${p.l}패`,filter:p=>p.tot>=_statsMinGames},
    {title:'⚡ 역대 최다 경기',icon:'⚡',sort:(a,b)=>b.tot-a.tot,val:p=>`${p.tot}경기`,sub:p=>`${p.w}승${p.l}패`},
    {title:'🔥 최장 연승 기록',icon:'🔥',sort:(a,b)=>b.maxStreak-a.maxStreak,val:p=>`${p.maxStreak}연승`,sub:p=>`총 ${p.w}승`},
    {title:'💎 최고 ELO',icon:'💎',sort:(a,b)=>b.elo-a.elo,val:p=>`${p.elo}`,sub:p=>`${p.w}승${p.l}패`},
    {title:'🎯 현재 연승중',icon:'🎯',sort:(a,b)=>b.curStreak-a.curStreak,val:p=>`${p.curStreak}연${p.curStreakType==='승'?'승':'패'}`,sub:p=>`현재 진행중`,filter:p=>p.curStreakType==='승'&&p.curStreak>=2},
  ];
  function recordCard(cat){
    const list=(cat.filter?withStats.filter(cat.filter):withStats).sort(cat.sort).slice(0,5);
    return`<div class="ssec" style="flex:1;min-width:280px">
      <h4 style="margin-bottom:12px">${cat.title}</h4>
      ${list.length===0?`<p style="color:var(--gray-l);font-size:12px">기록 없음</p>`:`
      <div class="stats-list-stack">
        ${list.map((p,i)=>{
          const badge=i===0?'🥇':i===1?'🥈':i===2?'🥉':`${i+1}`;
          return`<div class="stats-record-item ${i===0?'top':''}" style="${i===0?'border-color:'+gc(p.univ)+';box-shadow:0 10px 24px '+gc(p.univ)+'33':''}" onclick="openPlayerModal('${escJS(p.name)}')">
            <span style="font-size:16px;min-width:24px">${badge}</span>
            ${getPlayerPhotoHTML(p.name,'30px')}
            <div style="flex:1;min-width:0">
              <div style="font-weight:800;font-size:13px">${escHTML(p.name)}${getStatusIconHTML(p.name)} <span style="font-size:10px;color:${gc(p.univ)};font-weight:600">${escHTML(p.univ)}</span></div>
              <div style="font-size:10px;color:var(--gray-l)">${cat.sub(p)}</div>
            </div>
            <span style="font-weight:900;font-size:16px;color:${i===0?gc(p.univ):'var(--text2)'};font-family:'Noto Sans KR',sans-serif">${cat.val(p)}</span>
          </div>`;
        }).join('')}
      </div>`}
    </div>`;
  }
  return`<div id="stats-records-sec"><div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;flex-wrap:wrap;gap:8px">
    <span style="font-size:12px;color:var(--gray-l);font-weight:700">(프로리그 제외)</span>
    <button class="btn-capture btn-xs no-export" onclick="captureSection('stats-records-sec','records')">📷 이미지 저장</button>
  </div>
  <div class="stats-records-grid">${cats.map(recordCard).join('')}</div></div>`;
}

/* ══════════════════════════════════════
   6. 대학별 성적 레이더 차트
══════════════════════════════════════ */
var _radarSelUniv='';
var _radarSort='winrate';
var _radarCompareUnivs=[];
function _radarBaseScore(){
  return {winrate:0,avgElo:1200,pts:0,activity:0,diversity:0,streak:0,w:0,l:0,tot:0,mem:0};
}
function _statsSideNames(side){
  if(Array.isArray(side)){
    return side.map(x => {
      if(x && typeof x === 'object') return String(x.name || '').trim();
      return String(x || '').trim();
    }).filter(Boolean);
  }
  return String(side || '').split(/[,+，]/).map(x=>x.trim()).filter(Boolean);
}
function _statsGameSides(g){
  if(!g || !g.winner) return null;
  const aList = (Array.isArray(g.teamA) && g.teamA.length) ? _statsSideNames(g.teamA) : ((g.a1 || g.a2) ? [g.a1, g.a2].filter(Boolean) : _statsSideNames(g.playerA));
  const bList = (Array.isArray(g.teamB) && g.teamB.length) ? _statsSideNames(g.teamB) : ((g.b1 || g.b2) ? [g.b1, g.b2].filter(Boolean) : _statsSideNames(g.playerB));
  if(!aList.length || !bList.length) return null;
  return { a:aList, b:bList, winner:String(g.winner || '') };
}
function _statsSideUnivs(names){
  const set = new Set();
  (names || []).forEach(name => {
    const p = statsP(name);
    const u = String(p?.univ || '').trim();
    if(u) set.add(u);
  });
  return [...set];
}
function getSortedRadarRows(){
  const _players = Array.isArray(players) ? players : [];
  const univs=getAllUnivs().filter(u=>_players.some(p=>p.univ===u.name));
  const _allScores=getStatsRadarScores();
  const rows=univs.map(u=>({u, scores:_allScores[u.name] || _radarBaseScore()}));
  const sorter = String(_radarSort||'winrate');
  rows.sort((a,b)=>{
    if(sorter==='name') return String(a.u?.name||'').localeCompare(String(b.u?.name||''),'ko');
    if(sorter==='activity') return (b.scores.activity-a.scores.activity)||(b.scores.winrate-a.scores.winrate)||(b.scores.tot-a.scores.tot);
    if(sorter==='elo') return (b.scores.avgElo-a.scores.avgElo)||(b.scores.winrate-a.scores.winrate)||(b.scores.tot-a.scores.tot);
    return (b.scores.winrate-a.scores.winrate)||(b.scores.tot-a.scores.tot)||(b.scores.avgElo-a.scores.avgElo);
  });
  return {rows, scoreMap:_allScores};
}
window.toggleRadarCompareUniv = window.toggleRadarCompareUniv || function(name){
  try{
    const key = String(name||'').trim();
    if(!key) return;
    const arr = Array.isArray(window._radarCompareUnivs) ? [...window._radarCompareUnivs] : [];
    const idx = arr.indexOf(key);
    if(idx >= 0) arr.splice(idx,1);
    else{
      if(arr.length >= 4) arr.shift();
      arr.push(key);
    }
    window._radarCompareUnivs = arr.filter(v=>v && v!==window._radarSelUniv);
    render();
  }catch(e){}
};
function getStatsRadarSourceMatches(){
  const _mini = Array.isArray(window.miniM) ? window.miniM : [];
  const _univm = Array.isArray(window.univM) ? window.univM : [];
  const _ck = Array.isArray(window.ckM) ? window.ckM : [];
  const _comps = Array.isArray(window.comps) ? window.comps : [];
  const _tour = (typeof getTourneyMatches === 'function') ? getTourneyMatches() : [];
  return statsFilterMatches([].concat(_mini, _univm, _ck, _comps, _tour));
}
function getStatsRadarScores(){
  const _players = Array.isArray(players) ? players : [];
  const univNames = [...new Set(_players.map(p=>String(p?.univ||'').trim()).filter(Boolean))];
  const scoreMap = {};
  const memberSets = {};
  univNames.forEach(name=>{
    const mem=_players.filter(p=>String(p?.univ||'').trim()===name);
    const avgElo=Math.round(mem.reduce((s,p)=>s+(p.elo||1200),0)/Math.max(1, mem.length));
    const pts=mem.reduce((s,p)=>s+(p.points||0),0);
    const races=new Set(mem.map(p=>p.race).filter(Boolean)).size;
    memberSets[name] = new Set();
    let maxS=0;
    mem.forEach(p=>{
      let cs=0, lt='';
      const hist=[...statsNonProHist(p)].sort((a,b)=>(String(b.date||'')).localeCompare(String(a.date||'')));
      for(const h of hist){
        if(h.result===lt || lt===''){ cs++; lt=h.result; }
        else { cs=1; lt=h.result; }
        if(lt==='승') maxS=Math.max(maxS, cs);
      }
    });
    // 활동도: statsNonProHist 기반 전역 날짜 필터가 적용된 게임 참여 수 (30일 하드코딩 제거)
    const actCount = mem.reduce((s,p) => s + (statsNonProHist(p)||[]).length, 0);
    scoreMap[name]={winrate:0,avgElo,pts,activity:actCount,diversity:races,streak:maxS,w:0,l:0,tot:0,mem:mem.length};
  });
  getStatsRadarSourceMatches().forEach(m=>{
    const md = String(m?.d || m?.date || '');
    (m.sets||[]).forEach(set=>{
      (set.games||[]).forEach(g=>{
        const sides = _statsGameSides(g);
        if(!sides) return;
        sides.a.forEach(name => {
          const pA = statsP(name);
          const ua = String(pA?.univ || '').trim();
          if(ua && scoreMap[ua]){
            memberSets[ua] && memberSets[ua].add(String(name).trim());
            if(sides.winner === 'A') scoreMap[ua].w++; else scoreMap[ua].l++;
            scoreMap[ua].tot++;
          }
        });
        sides.b.forEach(name => {
          const pB = statsP(name);
          const ub = String(pB?.univ || '').trim();
          if(ub && scoreMap[ub]){
            memberSets[ub] && memberSets[ub].add(String(name).trim());
            if(sides.winner === 'B') scoreMap[ub].w++; else scoreMap[ub].l++;
            scoreMap[ub].tot++;
          }
        });
      });
    });
  });
  Object.values(scoreMap).forEach(s=>{
    s.winrate = s.tot ? Math.round(s.w / s.tot * 100) : 0;
  });
  Object.keys(scoreMap).forEach(name=>{
    scoreMap[name].mem = memberSets[name] ? memberSets[name].size : 0;
  });
  return scoreMap;
}
function getStatsUnivHeadToHead(nameA, nameB){
  const a = String(nameA || '').trim();
  const b = String(nameB || '').trim();
  const res = { aWins:0, bWins:0, total:0 };
  if(!a || !b || a === b) return res;
  getStatsRadarSourceMatches().forEach(m=>{
    (m.sets || []).forEach(set=>{
      (set.games || []).forEach(g=>{
        const sides = _statsGameSides(g);
        if(!sides) return;
        const uA = _statsSideUnivs(sides.a);
        const uB = _statsSideUnivs(sides.b);
        if(uA.length === 1 && uB.length === 1 && uA[0] === a && uB[0] === b){
          res.total++;
          if(sides.winner === 'A') res.aWins++;
          else if(sides.winner === 'B') res.bWins++;
        }else if(uA.length === 1 && uB.length === 1 && uA[0] === b && uB[0] === a){
          res.total++;
          if(sides.winner === 'A') res.bWins++;
          else if(sides.winner === 'B') res.aWins++;
        }
      });
    });
  });
  return res;
}
function statsRadarHTML(){
  const _players = Array.isArray(players) ? players : [];
  const {rows:_rows, scoreMap:_allScores} = getSortedRadarRows();
  const univs=_rows.map(x=>x.u);
  if((!_radarSelUniv || !univs.some(u=>u.name===_radarSelUniv)) && univs.length) _radarSelUniv=univs[0].name;
  _radarCompareUnivs = (Array.isArray(_radarCompareUnivs)?_radarCompareUnivs:[]).filter(name=>name && name!==_radarSelUniv && univs.some(u=>u.name===name)).slice(0,4);
  const _selectedScores=_allScores[_radarSelUniv] || {tot:0,w:0,l:0};
  const _totalGames=_rows.reduce((sum,row)=>sum+(row.scores.tot||0),0);
  const _quickCompare = Array.from(new Set([_radarSelUniv, ..._radarCompareUnivs, ..._rows.slice(0,5).map(r=>r.u.name)])).filter(Boolean).slice(0,7);
  const _sortBtn = (id, label)=>`<button class="pill ${_radarSort===id?'on':''}" style="flex-shrink:0;white-space:nowrap" onclick="_radarSort='${id}';render()">${label}</button>`;
  const _selectedUnivObj = univs.find(u=>u.name===_radarSelUniv);
  const _selectedColor = gc(_radarSelUniv);
  const _compareName = (_radarCompareUnivs[0] && _radarCompareUnivs[0] !== _radarSelUniv)
    ? _radarCompareUnivs[0]
    : (_rows.find(r=>r.u.name !== _radarSelUniv)?.u.name || '');
  const _compareScores = _compareName ? (_allScores[_compareName] || _radarBaseScore()) : _radarBaseScore();
  const _compareColor = _compareName ? gc(_compareName) : '#64748b';
  const _h2h = _compareName ? getStatsUnivHeadToHead(_radarSelUniv, _compareName) : { aWins:0, bWins:0, total:0 };
  const _fmtSigned = (n, suffix='') => `${n > 0 ? '+' : ''}${n}${suffix}`;
  const _metricCard = (label, a, b, opts={})=>{
    const suffix = opts.suffix || '';
    const signed = !!opts.signed;
    const diff = (Number(a) || 0) - (Number(b) || 0);
    const diffColor = diff === 0 ? 'var(--text3)' : (diff > 0 ? '#16a34a' : '#dc2626');
    const av = signed ? _fmtSigned(Number(a) || 0, suffix) : `${a}${suffix}`;
    const bv = signed ? _fmtSigned(Number(b) || 0, suffix) : `${b}${suffix}`;
    const dv = signed ? _fmtSigned(diff, suffix) : `${diff > 0 ? '+' : ''}${diff}${suffix}`;
    return `<div class="stats-compare-kpi">
      <div class="stats-metric-label">${label}</div>
      <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px">
        <div style="min-width:0">
          <div style="font-size:16px;font-weight:950;color:${_selectedColor}">${av}</div>
          <div style="font-size:11px;color:var(--text3);margin-top:2px">${escHTML(_radarSelUniv)}</div>
        </div>
        <div style="font-size:12px;font-weight:900;color:${diffColor};padding-top:2px">${dv}</div>
      </div>
      <div style="margin-top:8px;padding-top:8px;border-top:1px solid rgba(148,163,184,.14)">
        <div style="font-size:14px;font-weight:900;color:${_compareColor}">${bv}</div>
        <div style="font-size:11px;color:var(--text3);margin-top:2px">${escHTML(_compareName || '비교 없음')}</div>
      </div>
    </div>`;
  };
  const _compareSummary = _compareName
    ? `${_radarSelUniv}와 ${_compareName}를 현재 통계 필터 기준으로 바로 비교할 수 있습니다.`
    : '비교할 대학을 선택하면 핵심 차이를 바로 보여줍니다.';
  return`<div style="display:flex;flex-direction:column;gap:16px">
  <div class="ssec" id="stats-radar-sec">
    <div class="stats-chart-shell">
    <div class="stats-chart-toolbar">
      <div>
        <h4 style="margin:0">🕸️ 대학별 성적 레이더 차트 <span style="font-size:11px;color:var(--gray-l);font-weight:400">(프로리그 제외)</span></h4>
        <div style="font-size:11px;color:var(--gray-l);margin-top:4px">${_compareSummary}</div>
      </div>
      <div class="stats-chart-actions no-export">
        <select id="radar-sel" class="stats-select" onchange="_radarSelUniv=(function(v){try{var t=document.createElement('textarea');t.innerHTML=v;return t.value;}catch(e){return v;}})(this.value);initRadarChart()">
          ${univs.map(u=>`<option value="${escHTML(u.name)}"${_radarSelUniv===u.name?' selected':''}>${escHTML(u.name)}</option>`).join('')}
        </select>
        <select id="radar-compare-sel" class="stats-select" onchange="(function(v){try{var t=document.createElement('textarea');t.innerHTML=v;v=t.value;}catch(e){}var arr=(Array.isArray(window._radarCompareUnivs)?window._radarCompareUnivs:[]).filter(function(name){return name&&name!==window._radarSelUniv&&name!==v;});if(v)arr.unshift(v);window._radarCompareUnivs=arr.slice(0,4);render();})(this.value)">
          <option value="">비교 대학 선택</option>
          ${univs.filter(u=>u.name!==_radarSelUniv).map(u=>`<option value="${escHTML(u.name)}"${_compareName===u.name?' selected':''}>${escHTML(u.name)}</option>`).join('')}
        </select>
        <button class="btn-capture btn-xs no-export" onclick="captureSection('stats-radar-sec','radar')">📷 이미지 저장</button>
      </div>
    </div>
    <div class="fbar utilbar utilbar--scroll no-export" style="overflow-x:auto;flex-wrap:nowrap;-webkit-overflow-scrolling:touch;scrollbar-width:none;gap:6px;margin-bottom:10px">
      ${_sortBtn('winrate','승률순')}
      ${_sortBtn('activity','활동도순')}
      ${_sortBtn('elo','ELO순')}
      ${_sortBtn('name','이름순')}
    </div>
    <div class="stats-legend-wrap no-export" style="margin-bottom:12px">
      ${_quickCompare.map(name=>{
        const on = name===_radarSelUniv || _radarCompareUnivs.includes(name);
        const isMain = name===_radarSelUniv;
        return `<button class="stats-legend-chip" onclick="${isMain?`_radarSelUniv='${escJS(name)}';initRadarChart()`:`toggleRadarCompareUniv('${escJS(name)}')`}" style="border-color:${on?gc(name):'var(--border2)'};background:${on?gc(name)+'18':'var(--white)'};color:${on?gc(name):'var(--text3)'};cursor:pointer">${isMain?'기준 ':(_radarCompareUnivs.includes(name)?'비교 ':'+ 비교 ')}${escHTML(name)}</button>`;
      }).join('')}
    </div>
    <div class="stats-metric-grid">
      <div class="stats-metric-card">
        <div class="stats-metric-label">집계 대학</div>
        <div class="stats-metric-value">${_rows.length}</div>
      </div>
      <div class="stats-metric-card">
        <div class="stats-metric-label">집계 경기 수</div>
        <div class="stats-metric-value">${_totalGames}</div>
      </div>
      <div class="stats-metric-card" style="border-color:${_selectedColor}55">
        <div class="stats-metric-label">선택 대학 전적</div>
        <div class="stats-metric-value" style="font-size:18px;color:${_selectedColor}">${_selectedScores.w||0}승 ${_selectedScores.l||0}패</div>
        <div class="stats-metric-sub">${escHTML(_selectedUnivObj?.name||'-')}</div>
      </div>
      <div class="stats-metric-card">
        <div class="stats-metric-label">비교 대학</div>
        <div class="stats-metric-value">${1+_radarCompareUnivs.length}개</div>
      </div>
    </div>
    ${_compareName ? `
      <div class="stats-chart-board">
        <div class="stats-compare-duel" style="margin-bottom:12px">
          <div class="stats-compare-univ-card" style="border-color:${_selectedColor}55;background:${_selectedColor}0d">
            <div style="font-size:11px;font-weight:900;color:${_selectedColor};letter-spacing:.05em;text-transform:uppercase">기준 대학</div>
            <div style="font-size:20px;font-weight:950;color:${_selectedColor};margin-top:6px">${escHTML(_radarSelUniv)}</div>
            <div style="font-size:12px;color:var(--text3);margin-top:6px">${_selectedScores.w || 0}승 ${_selectedScores.l || 0}패 · 승률 ${_selectedScores.winrate || 0}%</div>
          </div>
          <div class="stats-compare-vs">VS</div>
          <div class="stats-compare-univ-card" style="border-color:${_compareColor}55;background:${_compareColor}0d">
            <div style="font-size:11px;font-weight:900;color:${_compareColor};letter-spacing:.05em;text-transform:uppercase">비교 대학</div>
            <div style="font-size:20px;font-weight:950;color:${_compareColor};margin-top:6px">${escHTML(_compareName)}</div>
            <div style="font-size:12px;color:var(--text3);margin-top:6px">${_compareScores.w || 0}승 ${_compareScores.l || 0}패 · 승률 ${_compareScores.winrate || 0}%</div>
          </div>
        </div>
        <div class="stats-compare-kpi-grid">
          ${_metricCard('집계 선수 수', _selectedScores.mem || 0, _compareScores.mem || 0, { suffix:'명' })}
          ${_metricCard('승률', _selectedScores.winrate || 0, _compareScores.winrate || 0, { suffix:'%' })}
          ${_metricCard('평균 ELO', _selectedScores.avgElo || 0, _compareScores.avgElo || 0)}
          ${_metricCard('활동도', _selectedScores.activity || 0, _compareScores.activity || 0, { suffix:'경기' })}
          ${_metricCard('포인트', _selectedScores.pts || 0, _compareScores.pts || 0, { signed:true })}
          ${_metricCard('종족 다양성', _selectedScores.diversity || 0, _compareScores.diversity || 0, { suffix:'종족' })}
        </div>
        <div class="stats-h2h-board" style="margin-top:12px">
          <div style="font-size:12px;font-weight:900;color:var(--text3);margin-bottom:8px">맞대결</div>
          <div class="stats-h2h-score">
            <div style="text-align:center;min-width:120px">
              <div style="font-size:24px;font-weight:950;color:${_selectedColor}">${_h2h.aWins}</div>
              <div style="font-size:11px;color:var(--text3);margin-top:4px">${escHTML(_radarSelUniv)}</div>
            </div>
            <div style="font-size:13px;color:var(--text3);font-weight:900">${_h2h.total ? `${_h2h.total}전` : '맞대결 없음'}</div>
            <div style="text-align:center;min-width:120px">
              <div style="font-size:24px;font-weight:950;color:${_compareColor}">${_h2h.bWins}</div>
              <div style="font-size:11px;color:var(--text3);margin-top:4px">${escHTML(_compareName)}</div>
            </div>
          </div>
        </div>
      </div>
    ` : ''}
    <div class="stats-chart-board">
      <div style="display:flex;gap:20px;flex-wrap:wrap;align-items:flex-start">
        <div class="stats-chart-wrap" style="flex-shrink:0">
          <canvas id="radarChart" width="280" height="280" style="flex-shrink:0"></canvas>
        </div>
        <div id="radarInfo" style="flex:1;min-width:200px"></div>
      </div>
    </div>
    </div>
  </div>
  <div class="ssec">
    <h4 style="margin-bottom:12px">📊 전체 대학 비교</h4>
    <div class="stats-table-card"><div style="overflow-x:auto"><table class="stats-rank-table">
      <thead><tr><th>대학</th><th>집계 선수수</th><th>승률</th><th>전적</th><th>ELO평균</th><th>포인트</th><th>활동도</th><th>다양성</th></tr></thead>
      <tbody>
        ${_rows.map(({u,scores})=>{
          const _isOn=_radarSelUniv===u.name || _radarCompareUnivs.includes(u.name);
          return`<tr class="${_isOn?'stats-rank-top':''}" style="cursor:pointer;${_isOn?'background:'+u.color+'12;':''}" onclick="_radarSelUniv='${escJS(u.name)}';initRadarChart()">
            <td><span class="ubadge clickable-univ" style="background:${u.color}" onclick="event.stopPropagation();openUnivModal('${escJS(u.name)}')">${escHTML(u.name)}</span></td>
            <td>${scores.mem}명</td>
            <td style="color:${scores.winrate>=50?'var(--red)':'var(--blue)'};font-weight:700">${scores.winrate}%</td>
            <td style="font-weight:700">${scores.w}승 ${scores.l}패</td>
            <td>${scores.avgElo}</td>
            <td class="${scores.pts>=0?'wt':'lt'}">${scores.pts>=0?'+':''}${scores.pts}</td>
            <td>${scores.activity}</td>
            <td style="white-space:nowrap">${scores.diversity}종족 <button class="btn btn-w btn-xs" style="margin-left:6px;padding:2px 6px" onclick="event.stopPropagation();toggleRadarCompareUniv('${escJS(u.name)}')">${_radarCompareUnivs.includes(u.name)?'해제':'비교'}</button></td>
          </tr>`;
        }).join('')}
      </tbody>
    </table></div></div>
  </div></div>`;
}
function calcUnivRadar(univName, proIds){
  const scores = getStatsRadarScores();
  return scores[univName] || {winrate:0,avgElo:1200,pts:0,activity:0,diversity:0,streak:0,w:0,l:0,tot:0,mem:0};
}
function initRadarChart(){
  const canvas=document.getElementById('radarChart');
  const info=document.getElementById('radarInfo');
  if(!canvas)return;
  // HTML entity decode fallback (특수문자 대학명 대응)
  try{const ta=document.createElement('textarea');ta.innerHTML=_radarSelUniv;_radarSelUniv=ta.value;}catch(e){}
  const _players = Array.isArray(players) ? players : [];
  const allUnivs=getAllUnivs().filter(u=>_players.some(p=>p.univ===u.name));
  if((!_radarSelUniv || !allUnivs.some(u=>u.name===_radarSelUniv)) && allUnivs.length) _radarSelUniv = allUnivs[0].name;
  const _allScores=getStatsRadarScores();
  const _activeNames = Array.from(new Set([_radarSelUniv, ...((Array.isArray(_radarCompareUnivs)?_radarCompareUnivs:[]).filter(name=>name && name!==_radarSelUniv))])).slice(0,5);
  const _activeRows = _activeNames.map(name=>({name, scores:_allScores[name]||calcUnivRadar(name), col:gc(name)}));
  const scores=_allScores[_radarSelUniv]||calcUnivRadar(_radarSelUniv);
  const _sv=Object.values(_allScores);
  const maxVals={
    winrate:100,
    avgElo:Math.max(..._sv.map(s=>s.avgElo),1500),
    activity:Math.max(..._sv.map(s=>s.activity),1),
    diversity:3,
    streak:Math.max(..._sv.map(s=>s.streak),1),
    mem:Math.max(..._sv.map(s=>s.mem),1),
  };
  const labels=['승률','ELO','활동도','다양성','연승','선수수'];
  const col=gc(_radarSelUniv);
  const W=280,H=280,cx=W/2,cy=H/2,r=100,sides=6;
  const ctx=canvas.getContext('2d');
  ctx.clearRect(0,0,W,H);
  const angle=i=>(-Math.PI/2)+(2*Math.PI/sides)*i;
  // 배경 그물
  [0.2,0.4,0.6,0.8,1.0].forEach(frac=>{
    ctx.beginPath();
    for(let i=0;i<sides;i++){
      const x=cx+r*frac*Math.cos(angle(i));
      const y=cy+r*frac*Math.sin(angle(i));
      if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);
    }
    ctx.closePath();ctx.strokeStyle='#e2e8f0';ctx.lineWidth=1;ctx.stroke();
    if(frac===1||frac===0.5){ctx.fillStyle='#94a3b8';ctx.font='9px sans-serif';ctx.textAlign='center';ctx.fillText(Math.round(frac*100)+'%',cx,cy-r*frac-3);}
  });
  // 축선
  for(let i=0;i<sides;i++){
    ctx.beginPath();ctx.moveTo(cx,cy);
    ctx.lineTo(cx+r*Math.cos(angle(i)),cy+r*Math.sin(angle(i)));
    ctx.strokeStyle='#cbd5e1';ctx.lineWidth=1;ctx.stroke();
  }
  _activeRows.forEach((row, idx)=>{
    const vals=[
      row.scores.winrate/maxVals.winrate,
      row.scores.avgElo/maxVals.avgElo,
      Math.min(1,row.scores.activity/maxVals.activity),
      row.scores.diversity/maxVals.diversity,
      Math.min(1,row.scores.streak/maxVals.streak),
      row.scores.mem/maxVals.mem,
    ];
    ctx.beginPath();
    for(let i=0;i<sides;i++){
      const v=vals[i];
      const x=cx+r*v*Math.cos(angle(i));
      const y=cy+r*v*Math.sin(angle(i));
      if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);
    }
    ctx.closePath();
    ctx.fillStyle=row.col + (idx===0 ? '2e' : '16'); ctx.fill();
    ctx.strokeStyle=row.col; ctx.lineWidth=idx===0?2.8:1.8; ctx.stroke();
    for(let i=0;i<sides;i++){
      const v=vals[i];
      const x=cx+r*v*Math.cos(angle(i));
      const y=cy+r*v*Math.sin(angle(i));
      ctx.beginPath();ctx.arc(x,y,idx===0?4:3,0,Math.PI*2);
      ctx.fillStyle=row.col;ctx.fill();ctx.strokeStyle='#fff';ctx.lineWidth=1.2;ctx.stroke();
    }
  });
  // 레이블
  ctx.fillStyle='#374151';ctx.font='bold 11px sans-serif';ctx.textAlign='center';
  for(let i=0;i<sides;i++){
    const x=cx+(r+18)*Math.cos(angle(i));
    const y=cy+(r+18)*Math.sin(angle(i));
    const va=Math.abs(Math.sin(angle(i)));
    ctx.textAlign=Math.cos(angle(i))>0.1?'left':Math.cos(angle(i))<-0.1?'right':'center';
    ctx.fillText(labels[i],x,y+va*5);
  }
  // 중앙 대학명
  ctx.fillStyle=col;ctx.font='bold 12px sans-serif';ctx.textAlign='center';
  ctx.fillText(_radarSelUniv,cx,cy+4);
  if(info){
    info.innerHTML=`
      <div class="stats-info-stack">
        <div class="stats-legend-wrap">${_activeRows.map((row, idx)=>`<span class="stats-legend-chip" style="background:${row.col}14;border-color:${row.col}55;color:${row.col}"><span style="width:8px;height:8px;border-radius:50%;background:${row.col};display:inline-block"></span>${idx===0?'기준':'비교'} ${escHTML(row.name)}</span>`).join('')}</div>
        ${_activeRows.map((row, idx)=>`
        <div class="stats-detail-card" style="border-color:${idx===0?row.col+'55':'var(--border)'};background:${idx===0?row.col+'0d':'var(--white)'}">
          <div class="stats-detail-title" style="color:${row.col}">${escHTML(row.name)}</div>
          ${[
            ['집계 선수 수',row.scores.mem+'명'],
            ['승률',row.scores.winrate+'%'],
            ['평균 ELO',row.scores.avgElo],
            ['총 포인트',(row.scores.pts>=0?'+':'')+row.scores.pts],
            ['활동도 (경기 수)',row.scores.activity+'경기'],
            ['종족 다양성',row.scores.diversity+'종족'],
            ['최장 연승',row.scores.streak+'연승'],
            ['총 전적',`${row.scores.w}승 ${row.scores.l}패`],
          ].map(([k,v])=>`<div class="stats-detail-row">
            <span>${k}</span>
            <span>${v}</span>
          </div>`).join('')}
        </div>`).join('')}
      </div>`;
  }
  const sel=document.getElementById('radar-sel');
  if(sel)sel.value=_radarSelUniv;
}

/* ══════════════════════════════════════
   7. 미스매치 감지
══════════════════════════════════════ */
function statsMismatchHTML(){
  const proIds=statsProMatchIds();
  const allMatches=[];
  // proM을 제외한 배열만 처리
  const _mini = Array.isArray(window.miniM) ? window.miniM : [];
  const _univm = Array.isArray(window.univM) ? window.univM : [];
  const _ck = Array.isArray(window.ckM) ? window.ckM : [];
  const _comps = Array.isArray(window.comps) ? window.comps : [];
  statsFilterMatches([..._mini,..._univm,..._ck,..._comps]).forEach((m,_)=>{
    (m.sets||[]).forEach(set=>{
      (set.games||[]).forEach(g=>{
        if(!g.playerA||!g.playerB||!g.winner)return;
        const pA=statsP(g.playerA);
        const pB=statsP(g.playerB);
        if(!pA||!pB)return;
        const eA=pA.elo||ELO_DEFAULT,eB=pB.elo||ELO_DEFAULT;
        const diff=Math.abs(eA-eB);
        if(diff<100)return;
        const winner=g.winner==='A'?g.playerA:g.playerB;
        const underdog=(eA<eB?pA:pB);
        const upset=winner===underdog.name;
        allMatches.push({pA:g.playerA,pB:g.playerB,eA,eB,diff,winner,upset,date:m.d||''});
      });
    });
  });
  allMatches.sort((a,b)=>b.diff-a.diff);
  const upsets=allMatches.filter(m=>m.upset).slice(0,10);
  const bigDiff=allMatches.slice(0,20);
  function matchRow(m){
    const winner=statsP(m.winner);
    const loser=statsP(m.winner===m.pA?m.pB:m.pA);
    const wElo=winner?.elo||ELO_DEFAULT;const lElo=loser?.elo||ELO_DEFAULT;
    const wCol=gc(winner?.univ||'');const lCol=gc(loser?.univ||'');
    return`<div class="stats-list-item" style="flex-wrap:wrap">
      <span style="font-size:11px;color:var(--gray-l);min-width:68px">${m.date}</span>
      <span class="stats-inline-badge" style="background:var(--red);color:#fff;cursor:pointer" onclick="openPlayerModal('${escJS(m.winner)}')">${m.winner}</span>
      <span style="font-size:12px;font-weight:700;color:${wElo>=1300?'#7c3aed':wElo>=1200?'var(--green)':'var(--red)'}">${wElo}</span>
      <span style="color:var(--gray-l);font-size:11px">ELO차</span>
      <span class="stats-inline-badge" style="background:var(--red);color:#fff">${m.diff}↑</span>
      <span style="color:var(--gray-l);font-size:11px">vs</span>
      <span class="stats-inline-badge" style="background:var(--blue);color:#fff;cursor:pointer;opacity:.72" onclick="openPlayerModal('${escJS(m.winner===m.pA?m.pB:m.pA)}')">${m.winner===m.pA?m.pB:m.pA}</span>
      <span style="font-size:12px;font-weight:700;color:${lElo>=1300?'#7c3aed':lElo>=1200?'var(--green)':'var(--red)'}">${lElo}</span>
      ${m.upset?'<span class="stats-inline-badge" style="background:#7c3aed;color:#fff">🔥 이변!</span>':''}
    </div>`;
  }
  return`<div style="display:flex;flex-direction:column;gap:16px">
  <div class="ssec" id="stats-mismatch-top">
    <div class="stats-chart-toolbar" style="margin-bottom:12px">
      <div>
        <h4 style="margin:0">🔥 이변 TOP 10 <span style="font-size:11px;color:var(--gray-l);font-weight:400">(하위 ELO가 승리 · 프로리그 제외)</span></h4>
        <div style="font-size:11px;color:var(--gray-l);margin-top:4px">ELO 차이가 컸는데도 하위 ELO 선수가 승리한 경기만 모았습니다.</div>
      </div>
      <button class="btn-capture btn-xs no-export" onclick="captureSection('stats-mismatch-top','mismatch')">📷 이미지 저장</button>
    </div>
    <div class="stats-metric-grid" style="margin-bottom:12px">
      <div class="stats-metric-card"><div class="stats-metric-label">이변 경기</div><div class="stats-metric-value">${upsets.length}</div></div>
      <div class="stats-metric-card"><div class="stats-metric-label">격차 경기</div><div class="stats-metric-value">${bigDiff.length}</div><div class="stats-metric-sub">ELO 차 100 이상</div></div>
      <div class="stats-metric-card"><div class="stats-metric-label">최대 격차</div><div class="stats-metric-value">${bigDiff[0]?.diff||0}</div><div class="stats-metric-sub">현재 필터 기준</div></div>
    </div>
    ${upsets.length?`<div class="stats-list-stack">${upsets.map(matchRow).join('')}</div>`:'<p style="color:var(--gray-l)">이변 기록이 없습니다.</p>'}
  </div>
  <div class="ssec">
    <h4 style="margin-bottom:12px">⚡ ELO 격차 TOP 20 경기 <span style="font-size:11px;color:var(--gray-l);font-weight:400">(프로리그 제외)</span></h4>
    ${bigDiff.length?`<div class="stats-list-stack">${bigDiff.map(matchRow).join('')}</div>`:'<p style="color:var(--gray-l)">ELO 격차 100 이상 경기 없음</p>'}
  </div></div>`;
}

/* ══════════════════════════════════════
   8. 경기 결과 공유 카드 생성
══════════════════════════════════════ */
var _shareMode='player';
var _sharePlayerSearch='';
var _shareUnivSearch='';
var _shareMatchPage=0; // 경기 결과 페이지 인덱스
var SHARE_MATCH_PER_PAGE=5;
function statsShareCardHTML(){
  const _players = Array.isArray(players) ? players : [];
  const pList=_players.filter(p=>p.history&&p.history.length>0).sort((a,b)=>b.history.length-a.history.length);
  const uList=(typeof univCfg!=='undefined'&&univCfg.length)?univCfg.filter(u=>_players.some(p=>p.univ===u.name)):getAllUnivs().filter(u=>_players.some(p=>p.univ===u.name));
  const filteredP=_sharePlayerSearch
    ?pList.filter(p=>p.name.toLowerCase().includes(_sharePlayerSearch.toLowerCase())||p.univ.toLowerCase().includes(_sharePlayerSearch.toLowerCase()))
    :[];  // 검색하기 전에는 빈 배열 - 아무것도 표시 안 함
  // 모든 경기 최신순 (tourneys 대회 경기 포함)
  const tourMatchesForShare=typeof getTourneyMatches==="function"?getTourneyMatches():[];
  // (보강) 티어대회(tourneys.type==='tier') 공유 카드에서는 "대학 로고"를 숨김
  // getTourneyMatches()의 결과는 tn.type이 없어서 tnId로 역참조하여 플래그 주입
  try{
    const tnMap = new Map((tourneys||[]).map(tn=>[tn.id, tn]));
    tourMatchesForShare.forEach(m=>{
      const tn = tnMap.get(m._tnId);
      if(tn && tn.type==='tier'){
        m._matchType = 'tt';
        m._noUnivIcon = true;
      }
    });
  }catch(e){}
  const _mini = Array.isArray(window.miniM) ? window.miniM : [];
  const _univm = Array.isArray(window.univM) ? window.univM : [];
  const _ck = Array.isArray(window.ckM) ? window.ckM : [];
  const _comps = Array.isArray(window.comps) ? window.comps : [];
  const allMatches=statsFilterMatches([..._mini,..._univm,..._ck,..._comps,...tourMatchesForShare]).sort((a,b)=>(b.d||"").localeCompare(a.d||""));
  // 인덱스 일치/성능 위해 리스트를 전역에 보관
  try{ window._shareMatchList = allMatches; }catch(e){}
  const totalPages=Math.ceil(allMatches.length/SHARE_MATCH_PER_PAGE)||1;
  const safePage=Math.min(_shareMatchPage,totalPages-1);
  const pageMatches=allMatches.slice(safePage*SHARE_MATCH_PER_PAGE,(safePage+1)*SHARE_MATCH_PER_PAGE);

  return`<div class="ssec">
    <div class="stats-chart-toolbar" style="margin-bottom:16px">
      <div>
        <h4 style="margin:0;font-size:16px">🎴 공유 카드 생성</h4>
        <div style="font-size:11px;color:var(--gray-l);margin-top:4px">스트리머, 대학, 경기 결과를 카드로 빠르게 만들어 저장할 수 있습니다.</div>
      </div>
    </div>
    <!-- 모드 탭 -->
    <div class="fbar no-export" style="overflow-x:auto;flex-wrap:nowrap;-webkit-overflow-scrolling:touch;scrollbar-width:none;gap:4px;margin-bottom:16px">
      <button class="pill ${_shareMode==='player'?'on':''}" style="flex-shrink:0;white-space:nowrap" onclick="_shareMode='player';_sharePlayerSearch='';render()">👤 스트리머 카드</button>
      <button class="pill ${_shareMode==='univ'?'on':''}" style="flex-shrink:0;white-space:nowrap" onclick="_shareMode='univ';render()">🏛️ 대학 카드</button>
      <button class="pill ${_shareMode==='match'?'on':''}" style="flex-shrink:0;white-space:nowrap" onclick="_shareMode='match';window._shareMatchObj=null;render()">⚔️ 경기 결과</button>
    </div>

    ${_shareMode==='player'?`
    <div class="stats-chart-shell no-export" style="margin-bottom:12px">
      <input type="text" id="share-player-q" value="${(typeof escAttr==='function')?escAttr(_sharePlayerSearch):escHTML(_sharePlayerSearch)}"
        placeholder="🔍 스트리머 이름 또는 대학 이름 검색..."
        oninput="_sharePlayerSearch=this.value;renderShareCardFilterPlayers()"
        class="stats-search-field"
        style="width:100%;max-width:380px;border-color:var(--blue);box-sizing:border-box">
      <div id="share-player-list" class="stats-chip-pool" style="margin-top:8px;max-height:160px;overflow-y:auto;padding:2px">
        ${filteredP.length?filteredP.slice(0,50).map(p=>`
          <button onclick="renderShareCardByPlayer('${escJS(p.name)}')"
            class="stats-choice-chip"
            style="border-color:${gc(p.univ)};background:${gc(p.univ)}22"
            onmouseover="this.style.background='${gc(p.univ)}55'" onmouseout="this.style.background='${gc(p.univ)}22'">
            ${escHTML(p.name)} <span style="font-size:10px;opacity:.65">${escHTML(p.univ)}</span>
          </button>`).join('')
          :(_sharePlayerSearch?'<span style="color:var(--gray-l);font-size:12px;padding:8px">검색 결과 없음</span>'
          :'<span style="color:var(--gray-l);font-size:12px;padding:8px">이름 또는 대학명을 입력하세요</span>')}
      </div>
    </div>`
    :_shareMode==='univ'?`
    <div class="stats-chip-pool no-export" style="margin-bottom:14px">
      ${uList.map(u=>`
        <button onclick="renderShareCardByUniv('${escJS(u.name)}')"
          class="stats-choice-chip"
          style="background:${u.color};color:#fff;border:none;box-shadow:0 2px 8px ${u.color}55"
          onmouseover="this.style.transform='scale(1.06)'" onmouseout="this.style.transform='scale(1)'">
          ${escHTML(u.name)}
        </button>`).join('')||'<span style="color:var(--gray-l);font-size:12px">등록된 대학이 없습니다</span>'}
    </div>`
    :`
    <div style="margin-bottom:14px" class="no-export">
      <div class="stats-chart-toolbar" style="margin-bottom:8px">
        <div style="font-size:11px;font-weight:700;color:var(--text3)">⏱️ 최신순 경기 목록 (5개씩 표시)</div>
        <div style="display:flex;gap:4px;align-items:center">
          <button class="btn btn-w btn-xs" onclick="_shareMatchPage=Math.max(0,_shareMatchPage-1);render()" ${safePage===0?'disabled':''}>◀ 이전</button>
          <span style="font-size:11px;color:var(--gray-l);padding:0 6px">${safePage+1} / ${totalPages}</span>
          <button class="btn btn-w btn-xs" onclick="_shareMatchPage=Math.min(${totalPages-1},_shareMatchPage+1);render()" ${safePage>=totalPages-1?'disabled':''}>다음 ▶</button>
        </div>
      </div>
      <div class="stats-selection-list">
        ${pageMatches.length?pageMatches.map((m,pi)=>{
          const globalIdx=safePage*SHARE_MATCH_PER_PAGE+pi;
          const a=m.a||m.u||'A팀',b=m.b||'B팀';
          const ca=gc(a),cb=gc(b);
          const aWin=m.sa>m.sb;
          const isActive=window._shareMatchObj&&window._shareMatchObj===m;
          return`<button onclick="window._shareMatchObj=(window._shareMatchList||[])[${globalIdx}]||null;renderShareCardByMatchObj(window._shareMatchObj)"
            class="stats-selection-item"
            style="border-color:${isActive?'var(--blue)':'var(--border)'};background:${isActive?'var(--blue-l)':'transparent'}"
            onmouseover="this.style.background='var(--blue-l)'" onmouseout="this.style.background='${isActive?'var(--blue-l)':'transparent'}'">
            <span style="color:var(--text3);min-width:80px;font-size:12px;font-weight:600">${escHTML(m.d||'-')}</span>
            <span style="background:${ca};color:#fff;padding:2px 9px;border-radius:4px;font-weight:700;font-size:11px">${escHTML(a)}</span>
            <span style="font-weight:900;font-size:15px;color:${aWin?'var(--green)':'#aaa'}">${m.sa}</span>
            <span style="color:var(--gray-l)">:</span>
            <span style="font-weight:900;font-size:15px;color:${(!aWin&&m.sb>m.sa)?'var(--green)':'#aaa'}">${m.sb}</span>
            <span style="background:${cb};color:#fff;padding:2px 9px;border-radius:4px;font-weight:700;font-size:11px">${escHTML(b)}</span>
            ${m.n?`<span style="color:var(--gold);font-size:10px;font-weight:600">🎖️${escHTML(m.n)}</span>`:''}
          </button>`;
        }).join(''):'<span style="color:var(--gray-l);padding:12px;font-size:12px;display:block">경기 기록이 없습니다</span>'}
      </div>
      <div style="font-size:10px;color:var(--gray-l);text-align:right;margin-top:4px">전체 ${allMatches.length}경기</div>
    </div>`}

    <!-- 카드 미리보기 -->
    <div id="sharecard-preview-wrap" class="sharecard-preview-wrap">
      <div class="sharecard-preview-tip">💡 카드를 클릭하면 사라집니다</div>
      <div id="share-card" class="share-card-host stats-preview-frame" title="클릭하여 카드 초기화" onclick="resetShareCard(this)">
        <p style="text-align:center;color:var(--gray-l);padding:36px 20px;font-size:13px">위에서 선택하면 카드가 생성됩니다</p>
      </div>
      <div class="sharecard-modal-actions sharecard-modal-actions--left" style="justify-content:flex-start;margin-top:10px">
        <button class="btn btn-p btn-sm" onclick="downloadShareCardJpg()">📷 이미지 저장</button>
      </div>
    </div>
  </div>`;
}
// 이전 코드 호환용
function renderShareCardFilterPlayers(){
  const q=(document.getElementById('share-player-q')||{}).value||'';
  _sharePlayerSearch=q;
  const _players = Array.isArray(players) ? players : [];
  const pList=_players.filter(p=>p.history&&p.history.length>0).sort((a,b)=>b.history.length-a.history.length);
  const filtered=q?pList.filter(p=>p.name.toLowerCase().includes(q.toLowerCase())||p.univ.toLowerCase().includes(q.toLowerCase())):[];
  const list=document.getElementById('share-player-list');
  if(!list)return;
  if(!q){
    list.innerHTML='<span style="color:var(--gray-l);font-size:12px;padding:8px">이름 또는 대학명을 입력하세요</span>';
    return;
  }
  list.innerHTML=filtered.length?filtered.slice(0,50).map(p=>`
    <button onclick="renderShareCardByPlayer('${escJS(p.name)}')"
      class="stats-choice-chip"
      style="border-color:${gc(p.univ)};background:${gc(p.univ)}22"
      onmouseover="this.style.background='${gc(p.univ)}55'" onmouseout="this.style.background='${gc(p.univ)}22'">
      ${escHTML(p.name)} <span style="font-size:10px;opacity:.65">${escHTML(p.univ)}</span>
    </button>`).join(''):'<span style="color:var(--gray-l);font-size:12px;padding:8px">검색 결과 없음</span>';
}
function renderShareCardDynamic(){renderShareCardFilterPlayers();}
// 선수/대학 공유카드 렌더 및 색상 helper는 `sharecard-render-entity.js`로 분리
function renderShareCardByMatchObj(m){
  const card=document.getElementById('share-card');if(!card)return;
  if(typeof window._renderShareMatchCardPipeline==='function'){
    window._renderShareMatchCardPipeline({
      card,
      matchObj:m,
      statsP,
      gc,
      getShareCardPrefs:_getShareCardPrefs,
      getFixedSideColors:(typeof getFixedSideColors==='function' ? getFixedSideColors : null),
      scMixHex:_scMixHex,
      toHttpsUrl,
      getPlayerPhotoHTML
    });
    return;
  }
  if(!m){card.innerHTML='<p style="color:var(--gray-l);padding:40px;text-align:center">경기를 선택하세요</p>';return;}
}


// 공유카드 런타임은 `sharecard-runtime.js`로 분리

/* ══════════════════════════════════════
   A. 활동량 히트맵
══════════════════════════════════════ */
if(typeof window._heatmapSelPlayer!=='string') window._heatmapSelPlayer='';
var statsHeatmapHTML = (typeof window.statsHeatmapHTML==='function')
  ? window.statsHeatmapHTML
  : (()=>'<div class="ssec"><div style="color:var(--gray-l);font-size:13px">히트맵을 불러오지 못했습니다.</div></div>');

/* ══════════════════════════════════════
   B. 티어별 승률 분석
══════════════════════════════════════ */
var _tierWinFilter={race:'',univ:'',gender:''};
var statsTierWinHTML = (typeof window.statsTierWinHTML==='function')
  ? window.statsTierWinHTML
  : (()=>'<div class="ssec"><div style="color:var(--gray-l);font-size:13px">티어별 승률 분석을 불러오지 못했습니다.</div></div>');

/* ══════════════════════════════════════
   C. 맵별 선수 특화 분석
══════════════════════════════════════ */
if(typeof window._mapRankSelMap!=='string') window._mapRankSelMap='';
var statsMapRankHTML = (typeof window.statsMapRankHTML==='function')
  ? window.statsMapRankHTML
  : (()=>'<div class="ssec"><div style="color:var(--gray-l);font-size:13px">맵별 특화 분석을 불러오지 못했습니다.</div></div>');

/* ══════════════════════════════════════
   D. 대학 간 상대전적 매트릭스
══════════════════════════════════════ */
var statsUnivMatrixHTML = (typeof window.statsUnivMatrixHTML==='function')
  ? window.statsUnivMatrixHTML
  : (()=>'<div class="ssec"><div style="color:var(--gray-l);font-size:13px">대학 매트릭스를 불러오지 못했습니다.</div></div>');

/* ══════════════════════════════════════
   E. 종족 픽률 트렌드
══════════════════════════════════════ */
if(typeof window._raceTrendMonths!=='number') window._raceTrendMonths=12;
var statsRaceTrendHTML = (typeof window.statsRaceTrendHTML==='function') ? window.statsRaceTrendHTML : (()=>'<div class="ssec"><div style="color:var(--gray-l)">종족 트렌드를 불러오지 못했습니다.</div></div>');
var initRaceTrendChart = (typeof window.initRaceTrendChart==='function') ? window.initRaceTrendChart : (()=>{});

/* ══════════════════════════════════════
   NEW-1. 킬러 선수 / 피해자 선수
══════════════════════════════════════ */
if(typeof window._killerSelPlayer!=='string') window._killerSelPlayer='';
var statsKillerHTML = (typeof window.statsKillerHTML==='function') ? window.statsKillerHTML : (()=>'<div class="ssec"><div style="color:var(--gray-l)">킬러 분석을 불러오지 못했습니다.</div></div>');

/* ══════════════════════════════════════
   NEW-2. 요일 / 시즌별 승률
══════════════════════════════════════ */
if(!window._seasonalFilter) window._seasonalFilter={gender:'',univ:'',race:''};
var statsSeasonalHTML = (typeof window.statsSeasonalHTML==='function') ? window.statsSeasonalHTML : (()=>'<div class="ssec"><div style="color:var(--gray-l)">요일/시즌 통계를 불러오지 못했습니다.</div></div>');

/* ══════════════════════════════════════
   NEW-3. 클러치 지수 (에이스전 승률)
══════════════════════════════════════ */
var statsClutchHTML = (typeof window.statsClutchHTML==='function') ? window.statsClutchHTML : (()=>'<div class="ssec"><div style="color:var(--gray-l)">클러치 지수를 불러오지 못했습니다.</div></div>');

/* ══════════════════════════════════════
   NEW-4. 역대 최장 연승/연패 기록 히스토리
══════════════════════════════════════ */
var statsStreakHistHTML = (typeof window.statsStreakHistHTML==='function') ? window.statsStreakHistHTML : (()=>'<div class="ssec"><div style="color:var(--gray-l)">연속 기록을 불러오지 못했습니다.</div></div>');

/* ══════════════════════════════════════
   NEW-5. 티어별 승률 (상대 티어 기준 매트릭스)
══════════════════════════════════════ */
var statsTierMatchHTML = (typeof window.statsTierMatchHTML==='function') ? window.statsTierMatchHTML : (()=>'<div class="ssec"><div style="color:var(--gray-l)">티어 매트릭스를 불러오지 못했습니다.</div></div>');

/* ══════════════════════════════════════
   NEW-6. 대학 간 상대전적 매트릭스 상세 (+ 선수별 드릴다운)
══════════════════════════════════════ */
if(!window._matrix2Sel) window._matrix2Sel={a:'',b:''};
var statsUnivMatrix2HTML = (typeof window.statsUnivMatrix2HTML==='function') ? window.statsUnivMatrix2HTML : (()=>'<div class="ssec"><div style="color:var(--gray-l)">대학 상세 매트릭스를 불러오지 못했습니다.</div></div>');

/* ══════════════════════════════════════
   F. CSV / 엑셀 내보내기
══════════════════════════════════════ */
var statsCsvExportHTML = (typeof window.statsCsvExportHTML==='function') ? window.statsCsvExportHTML : (()=>'<div class="ssec"><div style="color:var(--gray-l)">CSV 내보내기를 불러오지 못했습니다.</div></div>');

/* ══════════════════════════════════════
   9. 선수 검색 고급 필터
══════════════════════════════════════ */
/* ══════════════════════════════════════
   스트리머 검색
══════════════════════════════════════ */
var _psearchQ = '';
function _statsPlayerSearchRowHTML(p){
  const wr=(p.win+p.loss)?Math.round(p.win/(p.win+p.loss)*100):null;
  const safeName = (typeof escJS === 'function')
    ? escJS(p.name)
    : String(p.name||'').replace(/\\/g,'\\\\').replace(/'/g,"\\'").replace(/\r/g,'\\r').replace(/\n/g,'\\n');
  return`<div class="stats-result-card" onclick="openPlayerModal('${safeName}')">
    ${p.photo?`<img src="${toHttpsUrl(p.photo)}" style="width:38px;height:38px;border-radius:var(--su_profile_radius,50%);object-fit:cover;flex-shrink:0;border:2px solid var(--border)" onerror="this.style.display='none'">`:`<div style="width:38px;height:38px;border-radius:var(--su_profile_radius,50%);background:var(--border2);border:2px solid var(--border);flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:var(--gray-l)">${p.race||'?'}</div>`}
    <div style="flex:1;min-width:0">
      <div style="font-weight:800;font-size:14px">${escHTML(p.name)}${getStatusIconHTML(p.name)}</div>
      <div style="font-size:11px;color:var(--text3);margin-top:1px">${escHTML(p.univ||'무소속')} · ${escHTML(p.race||'?')}</div>
    </div>
    ${p.tier?`<div>${getTierBadge(p.tier)}</div>`:''}
    <div style="text-align:right;font-size:11px;color:var(--text3)">
      <div style="font-weight:700;color:${wr===null?'var(--gray-l)':wr>=50?'var(--red)':'var(--blue)'}">${wr===null?'-':wr+'%'}</div>
      <div>${p.win}승 ${p.loss}패</div>
    </div>
  </div>`;
}
function statsPlayerSearchHTML(){
  const q = _psearchQ.trim().toLowerCase();
  const _players = Array.isArray(players) ? players : [];
  const list = q
    ? _players.filter(p => p.name.toLowerCase().includes(q) || (p.univ||'').toLowerCase().includes(q) || (p.tier||'').toLowerCase().includes(q) ||
        (p.memo||'').split(/[\s,，\n]+/).some(m=>m.trim()&&m.trim().toLowerCase().includes(q)))
    : [];
  return `<div class="ssec">
    <div class="stats-chart-toolbar" style="margin-bottom:12px">
      <div>
        <h4 style="margin:0">🔍 스트리머 검색</h4>
        <div style="font-size:11px;color:var(--gray-l);margin-top:4px">이름, 대학, 티어, 메모 키워드로 빠르게 찾아서 바로 상세를 열 수 있습니다.</div>
      </div>
    </div>
    <div style="position:relative;max-width:400px;margin-bottom:14px">
      <input id="psearch-input" type="text" value="${(typeof escAttr==='function')?escAttr(_psearchQ):escHTML(_psearchQ)}"
        placeholder="🔍 스트리머 이름 / 대학 / 티어 검색..."
        oninput="_psearchQ=this.value;_statsPlayerSearchUpdate()"
        class="stats-search-field"
        style="width:100%;box-sizing:border-box;font-family:'Noto Sans KR',sans-serif"
        autofocus>
      ${_psearchQ?`<button onclick="_psearchQ='';render()" style="position:absolute;right:10px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:var(--gray-l);font-size:16px;line-height:1">✕</button>`:''}
    </div>
    <div id="psearch-results" class="stats-results-stack">
      ${q && !list.length ? `<div style="color:var(--gray-l);padding:20px;text-align:center">검색 결과가 없습니다</div>` : ''}
      ${list.map(_statsPlayerSearchRowHTML).join('')}
    </div>
    <div style="font-size:11px;color:var(--gray-l);margin-top:6px">
      💡 URL에 <code>?query=이름</code> 을 붙이면 바로 해당 스트리머 정보가 열립니다
    </div>
  </div>`;
}
function _statsPlayerSearchUpdate(){
  const q = _psearchQ.trim().toLowerCase();
  const _players = Array.isArray(players) ? players : [];
  const list = q
    ? _players.filter(p => p.name.toLowerCase().includes(q) || (p.univ||'').toLowerCase().includes(q) || (p.tier||'').toLowerCase().includes(q) ||
        (p.memo||'').split(/[\s,，\n]+/).some(m=>m.trim()&&m.trim().toLowerCase().includes(q)))
    : [];
  const res = document.getElementById('psearch-results');
  if(!res) return;
  res.innerHTML = (q && !list.length)
    ? `<div style="color:var(--gray-l);padding:20px;text-align:center">검색 결과가 없습니다</div>`
    : list.map(_statsPlayerSearchRowHTML).join('');
}

function _advFilterName(val){
  _advFilter.name=val;
  clearTimeout(window._advNameTimer);
  window._advNameTimer=setTimeout(()=>{
    const id='advsearch-name-input';
    const el=document.getElementById(id);
    const pos=el?el.selectionStart:null;
    render();
    const el2=document.getElementById(id);
    if(el2){el2.focus();if(pos!==null)try{el2.setSelectionRange(pos,pos);}catch(e){}}
  },300);
}
var _advFilter={tier:'',race:'',univ:'',gender:'',minElo:'',maxElo:'',minGames:'',name:'',sort:'elo', shuffle: false};
function statsAdvSearchHTML(){
  const f=_advFilter;
  const univs=getAllUnivs();
  const _players = Array.isArray(players) ? players : [];
  let list=_players.slice().filter(p=>{
    if(f.name&&!p.name.includes(f.name))return false;
    if(f.tier&&p.tier!==f.tier)return false;
    if(f.race&&p.race!==f.race)return false;
    if(f.univ&&p.univ!==f.univ)return false;
    if(f.gender&&p.gender!==f.gender)return false;
    const elo=p.elo||1200;
    if(f.minElo&&elo<parseInt(f.minElo))return false;
    if(f.maxElo&&elo>parseInt(f.maxElo))return false;
    const tot=(p.history||[]).length;
    if(f.minGames&&tot<parseInt(f.minGames))return false;
    return true;
  });
  const proIds=statsProMatchIds();
  list=list.map(p=>{
    let w,l,tot;
    if(tierRankModeFilter==='전체'){
      const hh=statsNonProHist(p);
      w=hh.filter(x=>x.result==='승').length;l=hh.filter(x=>x.result==='패').length;
    } else if(tierRankModeFilter==='대회(조별리그)'){
      const mh=(p.history||[]).filter(x=>x.mode==='대회'||x.mode==='조별리그'||x.mode==='토너먼트');
      w=mh.filter(x=>x.result==='승').length;l=mh.filter(x=>x.result==='패').length;
    } else if(tierRankModeFilter==='대학CK'){
      const mh=(p.history||[]).filter(x=>x.mode==='대학CK');
      w=mh.filter(x=>x.result==='승').length;l=mh.filter(x=>x.result==='패').length;
    } else {
      const mh=(p.history||[]).filter(x=>x.mode===tierRankModeFilter);
      w=mh.filter(x=>x.result==='승').length;l=mh.filter(x=>x.result==='패').length;
    }
    tot=w+l;
    return{...p,_w:w,_l:l,_tot:tot,_rate:tot?Math.round(w/tot*100):0,_elo:p.elo||1200};
  });
  if(f.sort==='elo') list.sort((a,b)=>b._elo-a._elo);
  else if(f.sort==='win') list.sort((a,b)=>b._w-a._w);
  else if(f.sort==='loss') list.sort((a,b)=>b._l-a._l);
  else if(f.sort==='rate') list.sort((a,b)=>b._rate-a._rate||b._tot-a._tot);
  else if(f.sort==='games') list.sort((a,b)=>b._tot-a._tot);
  else if(f.sort==='name') list.sort((a,b)=>a.name.localeCompare(b.name));
  else if(f.sort==='shuffle') list.sort(()=>Math.random()-0.5);
  return`<div style="display:flex;flex-direction:column;gap:14px">
  <div class="ssec" id="stats-advsearch-sec">
    <div class="stats-chart-toolbar" style="margin-bottom:12px">
      <div>
      <h4 style="margin:0">🔍 스트리머 고급 검색 필터</h4>
      <div style="font-size:11px;color:var(--gray-l);margin-top:4px">모드, 대학, 티어, 종족, 성별, ELO, 경기수까지 조합해서 세밀하게 찾습니다.</div>
      </div>
      <button class="btn-capture btn-xs no-export" onclick="captureSection('stats-advsearch-sec','advsearch')">📷 이미지 저장</button>
    </div>
    <div class="stats-chip-pool" style="margin-bottom:6px">
      ${['전체','미니대전','대학대전','대학CK','대회(조별리그)','프로리그'].map(m=>`<button onclick="tierRankModeFilter='${m}';render()" style="padding:5px 14px;border-radius:20px;border:2px solid ${tierRankModeFilter===m?'var(--blue)':'var(--border2)'};background:${tierRankModeFilter===m?'var(--blue)':'var(--white)'};color:${tierRankModeFilter===m?'#fff':'var(--text3)'};font-size:12px;font-weight:${tierRankModeFilter===m?'700':'500'};cursor:pointer;transition:.12s">${m}</button>`).join('')}
    </div>
    <div class="stats-chip-pool" style="margin-bottom:10px">
      ${[['미니대전','win','미니대전 승순','#7c3aed'],['미니대전','loss','미니대전 패순','#7c3aed'],['대학CK','win','대학CK 승순','#dc2626'],['대학CK','loss','대학CK 패순','#dc2626'],['대회(조별리그)','win','대회 승순','#d97706'],['대회(조별리그)','loss','대회 패순','#d97706']].map(([mode,sort,lbl,col])=>{
        const on=tierRankModeFilter===mode&&_advFilter.sort===sort;
        return`<button onclick="tierRankModeFilter='${mode}';_advFilter.sort='${sort}';render()" style="padding:3px 10px;border-radius:14px;border:1.5px solid ${on?col:'var(--border2)'};background:${on?col+'22':'var(--white)'};color:${on?col:'var(--text3)'};font-size:11px;font-weight:${on?'700':'500'};cursor:pointer;transition:.12s">${lbl}</button>`;
      }).join('')}
    </div>
    <div class="stats-filter-grid">
      <input id="advsearch-name-input" type="text" placeholder="🔍 스트리머 이름 검색..." value="${f.name}" oninput="_advFilterName(this.value)" class="stats-search-field" style="width:100%">
      <select onchange="_advFilter.univ=(function(v){try{var t=document.createElement('textarea');t.innerHTML=v;return t.value;}catch(e){return v;}})(this.value);render()" class="stats-select" style="min-width:0">
        <option value="">대학 전체</option>
        ${univs.map(u=>`<option value="${escHTML(u.name)}"${f.univ===u.name?' selected':''}>${escHTML(u.name)}</option>`).join('')}
      </select>
      <select onchange="_advFilter.tier=(function(v){try{var t=document.createElement('textarea');t.innerHTML=v;return t.value;}catch(e){return v;}})(this.value);render()" class="stats-select" style="min-width:0">
        <option value="">티어 전체</option>
        ${(((typeof TIERS!=='undefined' && Array.isArray(TIERS)) ? TIERS : (Array.isArray(window.TIERS) ? window.TIERS : []))).map(t=>`<option value="${escHTML(t)}"${f.tier===t?' selected':''}>${escHTML(getTierLabel(t))}</option>`).join('')}
      </select>
      <select onchange="_advFilter.race=this.value;render()" class="stats-select" style="min-width:0">
        <option value="">종족 전체</option>
        <option value="T"${f.race==='T'?' selected':''}>테란</option>
        <option value="Z"${f.race==='Z'?' selected':''}>저그</option>
        <option value="P"${f.race==='P'?' selected':''}>프로토스</option>
      </select>
      <select onchange="_advFilter.gender=this.value;render()" class="stats-select" style="min-width:0">
        <option value="">성별 전체</option>
        <option value="M"${f.gender==='M'?' selected':''}>남자</option>
        <option value="F"${f.gender==='F'?' selected':''}>여자</option>
      </select>
      <input type="number" placeholder="최소ELO" value="${f.minElo}" oninput="_advFilter.minElo=this.value;render()" class="stats-search-field" style="width:100%">
      <input type="number" placeholder="최대ELO" value="${f.maxElo}" oninput="_advFilter.maxElo=this.value;render()" class="stats-search-field" style="width:100%">
      <input type="number" placeholder="최소경기수" value="${f.minGames}" oninput="_advFilter.minGames=this.value;render()" class="stats-search-field" style="width:100%">
      <select onchange="_advFilter.sort=this.value;render()" class="stats-select" style="min-width:0">
        <option value="elo"${f.sort==='elo'?' selected':''}>ELO순</option>
        <option value="win"${f.sort==='win'?' selected':''}>승수순</option>
        <option value="loss"${f.sort==='loss'?' selected':''}>패수순</option>
        <option value="rate"${f.sort==='rate'?' selected':''}>승률순</option>
        <option value="games"${f.sort==='games'?' selected':''}>경기수순</option>
        <option value="name"${f.sort==='name'?' selected':''}>이름순</option>
        <option value="shuffle"${f.sort==='shuffle'?' selected':''}>무작위</option>
      </select>
      <button class="btn btn-w btn-sm" onclick="_advFilter={tier:'',race:'',univ:'',gender:'',minElo:'',maxElo:'',minGames:'',name:'',sort:'elo', shuffle: false};render()">🔄 초기화</button>
    </div>
    <div class="stats-metric-grid" style="margin-bottom:8px">
      <div class="stats-metric-card"><div class="stats-metric-label">검색 결과</div><div class="stats-metric-value">${list.length}</div><div class="stats-metric-sub">현재 조건 기준</div></div>
    </div>
    ${list.length===0?'<p style="color:var(--gray-l);padding:20px;text-align:center">조건에 맞는 스트리머가 없습니다.</p>':`
    <div class="stats-table-card"><div style="overflow-x:auto"><table class="stats-rank-table">
      <thead><tr><th>순위</th><th>이름</th><th>대학</th><th>티어</th><th>종족</th><th>성별</th><th>ELO</th><th>승</th><th>패</th><th>승률</th><th>경기수</th></tr></thead>
      <tbody>
        ${list.map((p,i)=>{
          const eloColor=p._elo>=1400?'#7c3aed':p._elo>=1300?'#d97706':p._elo>=1200?'var(--green)':'var(--red)';
          return`<tr class="${i<3?'stats-rank-top':''}" style="cursor:pointer" onclick="openPlayerModal('${escJS(p.name)}')">
            <td>${i+1}</td>
            <td style="font-weight:700;color:var(--blue)">${escHTML(p.name)}</td>
            <td><span class="ubadge" style="background:${gc(p.univ)}">${escHTML(p.univ)}</span></td>
            <td>${getTierLabel(p.tier||'-')}</td>
            <td><span class="rbadge r${p.race||'T'}">${p.race||'-'}</span></td>
            <td>${p.gender==='M'?'👨':'👩'}</td>
            <td style="font-weight:800;color:${eloColor}">${p._elo}</td>
            <td class="wt">${p._w}</td>
            <td class="lt">${p._l}</td>
            <td style="font-weight:700;color:${p._rate>=50?'var(--red)':'var(--blue)'}">${p._tot?p._rate+'%':'-'}</td>
            <td>${p._tot}</td>
          </tr>`;
        }).join('')}
      </tbody>
    </table></div></div>`}
  </div></div>`;
}



/* ══════════════════════════════════════
   🔍 전체 선수 검색
══════════════════════════════════════ */
function onGlobalSearch(val){
  const drop = document.getElementById('globalSearchDrop');
  if(!val || val.trim()===''){drop.style.display='none';return;}
  const _players = Array.isArray(players) ? players : [];
  const q = val.trim().toLowerCase();
  // 다중 조건 파싱: "흑카 테란" → 이름에 "흑카" + 종족 "테란"
  const tokens = q.split(/\s+/).filter(Boolean);
  const RACE_MAP={'테란':'T','테':'T','t':'T','저그':'Z','저':'Z','z':'Z','프로토스':'P','프토':'P','프':'P','p':'P'};
  const GENDER_MAP={'여':'F','여자':'F','f':'F','남':'M','남자':'M','m':'M'};
  let raceFilter='', genderFilter='', univFilter='', tierFilter='', nameTokens=[];
  tokens.forEach(t=>{
    if(RACE_MAP[t]){raceFilter=RACE_MAP[t];}
    else if(GENDER_MAP[t]){genderFilter=GENDER_MAP[t];}
    else{nameTokens.push(t);}
  });
  const results = _players.filter(p=>{
    const nameMatch = nameTokens.length===0 || nameTokens.every(t=>
      p.name.toLowerCase().includes(t) ||
      (p.univ||'').toLowerCase().includes(t) ||
      (p.tier||'').toLowerCase().includes(t) ||
      (p.role||'').toLowerCase().includes(t) ||
      (p.memo||'').toLowerCase().includes(t)
    );
    const raceMatch = !raceFilter || p.race===raceFilter;
    const genderMatch = !genderFilter || p.gender===genderFilter;
    return nameMatch && raceMatch && genderMatch;
  }).slice(0,18);
  // 외부 대진기록(History > 외부탭)도 함께 검색
  let extResults = [];
  try{
    // history-core.js의 데이터는 관리자 탭에서 관리되지만, 검색은 read-only로 누구나 가능하게 처리(데이터가 없으면 0건)
    const items = (typeof _histExtGetViewItems==='function')
      ? (_histExtGetViewItems()||[])
      : (typeof _histExtLoad==='function' ? ((_histExtLoad()||{}).items||[]) : []);
    extResults = (items||[]).filter(it=>{
      const blob = `${it.source||''} ${it.date||''} ${it.winner||''} ${it.loser||''} ${it.map||''} ${it.elo||''} ${it.type||''} ${it.memo||''}`.toLowerCase();
      return nameTokens.length===0 ? blob.includes(q) : nameTokens.every(t=>blob.includes(t));
    }).slice(0,10);
  }catch(e){}

  if(results.length===0 && extResults.length===0){
    drop.innerHTML=`<div style="padding:16px;text-align:center;color:var(--gray-l);font-size:12px">
      <div style="font-size:20px;margin-bottom:6px">🔍</div>
      검색 결과 없음<br>
      <span style="font-size:10px;color:var(--gray-l);margin-top:4px;display:block">이름 · 대학 · 티어 · 종족(테란/저그/프토) · 성별(남/여) 검색 가능</span>
    </div>`;
    drop.style.display='block';
    return;
  }
  const RACE_CFG={T:{bg:'#dbeafe',col:'#1e40af',label:'테란'},Z:{bg:'#ede9fe',col:'#5b21b6',label:'저그'},P:{bg:'#fef3c7',col:'#92400e',label:'프토'}};
  const TIER_CFG={'S':{bg:'#ede9fe',col:'#7c3aed'},'A':{bg:'#dbeafe',col:'#2563eb'},'B':{bg:'#dcfce7',col:'#16a34a'},'C':{bg:'#fef3c7',col:'#d97706'},'D':{bg:'#fee2e2',col:'#dc2626'}};
  // 검색어 하이라이트 헬퍼
  const hl=(str,q)=>{
    if(!str||!q)return str||'';
    const idx=str.toLowerCase().indexOf(q);
    if(idx<0)return str;
    return str.slice(0,idx)+`<mark style="background:#fef08a;color:inherit;border-radius:2px">`+str.slice(idx,idx+q.length)+`</mark>`+str.slice(idx+q.length);
  };
  const mainQ=nameTokens.join(' ');
  window._gsResults = results;
  window._gsExtResults = extResults;
  window._gsQuery = val.trim();
  let html = '';
  if(results.length){
    html += `<div style="padding:6px 12px 4px;font-size:10px;font-weight:700;color:var(--gray-l);letter-spacing:.5px;border-bottom:1px solid var(--border)">${results.length}명 검색됨</div>` +
    results.map((p,ri)=>{
    const col=gc(p.univ);
    const wr=p.win+p.loss===0?0:Math.round(p.win/(p.win+p.loss)*100);
    const rc=RACE_CFG[p.race]||{bg:'#f1f5f9',col:'#475569',label:p.race};
    return `<div data-gsidx="${ri}" style="padding:9px 14px;cursor:pointer;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px;transition:.1s"
      onmouseover="this.style.background='#f0f6ff'" onmouseout="this.style.background=''"
      onclick="(function(el){const idx=+el.dataset.gsidx;if(window._gsResults&&window._gsResults[idx]){globalSearchSelect(window._gsResults[idx].name);}else{openPlayerModal(el.dataset.name||'');}}).call(this,this)"
    >
      ${p.photo
        ?`<img src="${toHttpsUrl(p.photo)}" style="width:60px;height:60px;border-radius:8px;object-fit:cover;flex-shrink:0;border:2px solid ${col}" onerror="this.outerHTML='<div style=\\'width:60px;height:60px;border-radius:8px;background:${col};display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;color:#fff;flex-shrink:0\\'>${rc.label}</div>'">`
        :`<div style="width:60px;height:60px;border-radius:8px;background:${col};display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;color:#fff;flex-shrink:0;letter-spacing:.3px">${rc.label}</div>`
      }
      <div style="flex:1;min-width:0">
        <div style="font-weight:700;font-size:13px">${hl(p.name,mainQ)}${p.gender==='M'?'<span style="font-size:9px;background:#2563eb;color:#fff;padding:1px 4px;border-radius:4px;margin-left:4px">♂</span>':''}</div>
        <div style="font-size:11px;color:var(--gray-l);margin-top:1px"><span style="background:${(TIER_CFG[p.tier]||{bg:'#f1f5f9'}).bg};color:${(TIER_CFG[p.tier]||{col:'#475569'}).col};padding:1px 6px;border-radius:4px;font-size:10px;font-weight:800">${hl(p.tier,mainQ)}</span> · ${hl(p.univ,mainQ)}${p.role?` · <span style="color:var(--blue);font-size:10px;font-weight:600">${hl(p.role,mainQ)}</span>`:''} · <span style="background:${rc.bg};color:${rc.col};padding:0 4px;border-radius:3px;font-size:10px;font-weight:700">${rc.label}</span></div>
      </div>
      <div style="text-align:right;flex-shrink:0">
        <div style="font-weight:700;font-size:12px;color:${wr>=50?'#dc2626':'#2563eb'}">${wr}%</div>
        <div style="font-size:10px;color:var(--gray-l)">${p.win}승${p.loss}패</div>
        ${p.points?`<div style="font-size:10px;color:var(--gold);font-weight:700">${p.points>0?'+':''}${p.points}pt</div>`:''}
      </div>
    </div>`;
    }).join('');
  }
  if(extResults.length){
    const sep = results.length ? `<div style="height:8px;background:var(--surface);border-top:1px solid var(--border);border-bottom:1px solid var(--border)"></div>` : '';
    html += sep;
    html += `<div style="padding:6px 12px 4px;font-size:10px;font-weight:900;color:var(--gray-l);letter-spacing:.5px;border-bottom:1px solid var(--border)">📎 외부 대진기록 ${extResults.length}건</div>` +
      extResults.map((it,ei)=>{
        const line = `${it.winner||''} vs ${it.loser||''}`;
        const sub  = `${it.date||''}${it.map?` · ${it.map}`:''}${it.source?` · ${it.source}`:''}`;
        return `<div data-gsextidx="${ei}" style="padding:9px 14px;cursor:pointer;border-bottom:1px solid var(--border);display:flex;gap:10px;align-items:center"
          onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background=''"
          onclick="(function(el){globalSearchSelectExt(+el.dataset.gsextidx);}).call(this,this)">
          <div style="flex:1;min-width:0">
            <div style="font-weight:800;font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${hl(line, mainQ||q)}</div>
            <div style="font-size:11px;color:var(--gray-l);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${hl(sub, mainQ||q)}</div>
          </div>
          <div style="flex-shrink:0;font-size:10px;color:var(--blue);font-weight:800">열기</div>
        </div>`;
      }).join('');
  }
  drop.innerHTML = html;
  drop.style.display='block';
}

function globalSearchSelect(name){
  document.getElementById('globalSearch').value='';
  document.getElementById('globalSearchDrop').style.display='none';
  window._gsResults = null;
  openPlayerModal(name);
}

function globalSearchSelectExt(idx){
  const it = window._gsExtResults && window._gsExtResults[idx];
  document.getElementById('globalSearch').value='';
  document.getElementById('globalSearchDrop').style.display='none';
  window._gsResults = null;
  if(!it) return;
  // (요청사항) 외부탭 접근은 관리자만 허용. 일반 사용자는 상세 팝업만 노출.
  const canOpenExtTab = (typeof isLoggedIn!=='undefined' && isLoggedIn) && !(typeof isSubAdmin!=='undefined' && isSubAdmin);
  if(canOpenExtTab){
    try{ curTab='hist'; histSub='ext'; }catch(e){}
    try{ if(typeof window.histExtSetKeyword==='function') window.histExtSetKeyword(window._gsQuery||''); }catch(e){}
    try{ render(); }catch(e){}
    return;
  }
  // read-only 상세 모달
  try{
    const old=document.getElementById('_gsExtModal'); if(old) old.remove();
    const modal=document.createElement('div');
    modal.id='_gsExtModal';
    modal.style.cssText='position:fixed;inset:0;background:#0008;z-index:99999;display:flex;align-items:center;justify-content:center;padding:16px;box-sizing:border-box';
    const line=`${it.winner||''} vs ${it.loser||''}`;
    const sub=`${it.date||''}${it.map?` · ${it.map}`:''}${it.elo?` · ELO ${it.elo}`:''}${it.type?` · ${it.type}`:''}`;
    const memo=(it.memo||'').trim();
    const src=(it.source||'').trim();
    modal.innerHTML=`<div style="background:var(--white);border-radius:16px;padding:18px 18px 14px;width:420px;max-width:95vw;box-shadow:0 8px 40px rgba(0,0,0,.3)">
      <div style="font-weight:1000;font-size:14px;margin-bottom:6px">📎 외부 대진기록</div>
      <div style="font-weight:900;font-size:13px;color:var(--text);margin-bottom:4px">${line}</div>
      <div style="font-size:11px;color:var(--gray-l);line-height:1.6;margin-bottom:10px">${sub}${src?`<br>출처: ${src}`:''}</div>
      ${memo?`<div style="background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:10px;font-size:12px;line-height:1.7;margin-bottom:10px;white-space:pre-wrap">${memo.replace(/</g,'&lt;').replace(/>/g,'&gt;')}</div>`:''}
      <div style="display:flex;gap:8px">
        <button class="btn btn-w" style="flex:1" onclick="document.getElementById('_gsExtModal').remove()">닫기</button>
      </div>
      <div style="margin-top:8px;font-size:10px;color:var(--gray-l);text-align:center">※ 외부탭은 관리자만 접근 가능합니다</div>
    </div>`;
    modal.addEventListener('click',e=>{ if(e.target===modal) modal.remove(); });
    document.body.appendChild(modal);
  }catch(e){}
}

// Lazy 로더가 먼저 프록시를 등록하는 경로에서도 실제 구현을 전역에 확실히 연결한다.
try{
  window.onGlobalSearch = onGlobalSearch;
  window.globalSearchSelect = globalSearchSelect;
  window.globalSearchSelectExt = globalSearchSelectExt;
  window.rStats = rStats;
}catch(e){}

// 외부 클릭 시 드롭다운 닫기
document.addEventListener('click', e=>{
  if(!e.target.closest('#globalSearch') && !e.target.closest('#globalSearchDrop')){
    const d=document.getElementById('globalSearchDrop');
    if(d) d.style.display='none';
  }
});


/* ══════════════════════════════════════
   선수 vs 선수 비교
══════════════════════════════════════ */
var _vsSelA='', _vsSelB='';
function _vsSearchDrop(id, val){
  const d=document.getElementById(id);if(!d)return;
  d.querySelectorAll('.sitem').forEach(el=>{el.style.display=el.textContent.toLowerCase().includes(val.toLowerCase())?'':'none';});
}
function statsPlayerVsHTML(){
  const _players = Array.isArray(players) ? players : [];
  const pAll=_players.filter(p=>(p.history||[]).length>0).sort((a,b)=>a.name.localeCompare(b.name,'ko'));
  function selDropHTML(selId,dropId,inputId,selName){
    return`<div style="position:relative">
      <input id="${inputId}" type="text" value="${(typeof escAttr==='function')?escAttr(selName):escHTML(selName)}" placeholder="🔍 스트리머 검색..."
        class="stats-search-field"
        style="border-color:${selName?gc(statsP(selName)?.univ||''):'var(--border2)'}"
        oninput="_vsSearchDrop('${dropId}',this.value)"
        onfocus="document.getElementById('${dropId}').style.display='block'"
        onblur="setTimeout(()=>{const d=document.getElementById('${dropId}');if(d)d.style.display='none'},200)">
      <div id="${dropId}" class="stats-search-drop">
        ${pAll.map(p=>`<div class="sitem stats-search-item" onmousedown="${selId==='A'?'_vsSelA':'_vsSelB'}='${escJS(p.name)}';document.getElementById('${inputId}').value='${escJS(p.name)}';document.getElementById('${dropId}').style.display='none';render()">
          <b>${escHTML(p.name)}</b> <span style="color:${gc(p.univ)};font-size:11px">${escHTML(p.univ)}</span> <span style="color:var(--gray-l);font-size:10px">${p.history.length}경기</span>
        </div>`).join('')}
      </div>
    </div>`;
  }

  const pA=statsP(_vsSelA);
  const pB=statsP(_vsSelB);
  const colA=pA?gc(pA.univ):'#2563eb';
  const colB=pB?gc(pB.univ):'#dc2626';

  // 직접 대결 기록
  let h2hAwin=0,h2hBwin=0;
  if(pA&&pB){
    statsNonProHist(pA).forEach(h=>{if(h.opp===_vsSelB){if(h.result==='승')h2hAwin++;else h2hBwin++;}});
  }
  const h2hTotal=h2hAwin+h2hBwin;

  // 개인 통계
  function getStats(p){
    if(!p)return null;
    const h=statsNonProHist(p);
    const w=h.filter(x=>x.result==='승').length;
    const l=h.filter(x=>x.result==='패').length;
    const tot=w+l;
    // 최근 5경기 폼
    const rec=[...h].sort((a,b)=>(b.date||'').localeCompare(a.date||'')).slice(0,5);
    // 현재 연속 (최신→과거 내림차순 정렬 후 첫 연속 구간)
    let streak=0,sType='';
    for(const x of [...h].sort((a,b)=>(String(b.date||'')).localeCompare(String(a.date||'')))){if(!sType||x.result===sType){streak++;sType=x.result;}else break;}
    // 종족 상성
    const rv={T:{w:0,l:0},Z:{w:0,l:0},P:{w:0,l:0}};
    h.forEach(x=>{if(x.oppRace&&rv[x.oppRace]){if(x.result==='승')rv[x.oppRace].w++;else rv[x.oppRace].l++;}});
    // 월별 추이 최근 6개월
    const now=new Date();
    const months=Array.from({length:6},(_,i)=>{
      const d=new Date(now);d.setMonth(d.getMonth()-5+i);
      return`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
    });
    const mStats=Object.fromEntries(months.map(ym=>[ym,{w:0,l:0}]));
    h.forEach(x=>{const ym=(x.date||'').slice(0,7);if(mStats[ym]){if(x.result==='승')mStats[ym].w++;else mStats[ym].l++;}});
    return{w,l,tot,rate:tot?Math.round(w/tot*100):0,elo:p.elo||1200,rec,streak,sType,rv,mStats,months};
  }
  const stA=getStats(pA), stB=getStats(pB);

  function formDots(rec){
    return(rec||[]).map(h=>`<span title="${h.date} vs ${h.opp}" style="display:inline-block;width:18px;height:18px;border-radius:50%;background:${h.result==='승'?'#dc2626':'#2563eb'};color:#fff;font-size:9px;font-weight:900;text-align:center;line-height:18px">${h.result==='승'?'W':'L'}</span>`).join('');
  }
  function raceTbl(rv,race,col){
    const r=rv[race]||{w:0,l:0};const t=r.w+r.l;
    return`<td style="text-align:center;font-size:11px;font-weight:700;color:${t?col:'var(--gray-l)'}">${t?Math.round(r.w/t*100)+'%':'-'}<br><span style="font-weight:400;font-size:10px;color:var(--gray-l)">${r.w}W${r.l}L</span></td>`;
  }
  function statRow(label,valA,valB,higherIsBetter=true){
    const numA=parseFloat(valA),numB=parseFloat(valB);
    const aWins=!isNaN(numA)&&!isNaN(numB)&&(higherIsBetter?numA>numB:numA<numB);
    const bWins=!isNaN(numA)&&!isNaN(numB)&&(higherIsBetter?numB>numA:numB<numA);
    return`<tr>
      <td style="text-align:right;font-weight:${aWins?'800':'400'};color:${aWins?colA:'var(--text)'};">${valA}${aWins?` <span style="color:${colA}">◀</span>`:''}</td>
      <td style="text-align:center;font-size:11px;color:var(--gray-l);padding:4px 12px;white-space:nowrap">${label}</td>
      <td style="text-align:left;font-weight:${bWins?'800':'400'};color:${bWins?colB:'var(--text)'};">${bWins?`<span style="color:${colB}">▶</span> `:''} ${valB}</td>
    </tr>`;
  }

  const noSel=!pA&&!pB;
  return`<div class="stats-compare-shell">
  <div class="ssec">
    <div class="stats-chart-toolbar" style="margin-bottom:14px">
      <div>
        <h4 style="margin:0">⚔️ 스트리머 vs 스트리머 비교</h4>
        <div style="font-size:11px;color:var(--gray-l);margin-top:4px">직접 대결, 최근 폼, 종족 상성, 월별 흐름을 한 화면에서 비교합니다.</div>
      </div>
      ${pA&&pB?`<button onclick="_vsSelA='';_vsSelB='';render()" class="btn btn-w btn-xs no-export">초기화</button>`:''}
    </div>
    <div class="stats-compare-hero">
      <div class="stats-vs-card">
        ${getPlayerPhotoHTML(_vsSelA||'','44px',`border:2px solid ${colA};`)}
        ${selDropHTML('A','vs-drop-a','vs-inp-a',_vsSelA)}
        ${pA?`<span class="ubadge" style="background:${colA}">${pA.univ}</span>`:''}
      </div>
      <div class="stats-vs-mark">VS</div>
      <div class="stats-vs-card">
        ${getPlayerPhotoHTML(_vsSelB||'','44px',`border:2px solid ${colB};`)}
        ${selDropHTML('B','vs-drop-b','vs-inp-b',_vsSelB)}
        ${pB?`<span class="ubadge" style="background:${colB}">${pB.univ}</span>`:''}
      </div>
    </div>
    ${noSel?`<div class="stats-note-box">두 선수를 선택하면 비교 분석이 시작됩니다.</div>`:
    (!pA||!pB)?`<div class="stats-note-box">나머지 선수를 선택하세요.</div>`:`

    <!-- 직접 대결 -->
    <div class="stats-h2h-board">
      <div style="font-size:11px;font-weight:700;color:var(--text3);margin-bottom:8px">⚔️ 직접 대결 기록</div>
      ${h2hTotal===0?`<span style="color:var(--gray-l);font-size:12px">직접 대결 기록 없음</span>`:`
      <div class="stats-h2h-score">
        <div style="text-align:center">
          <div style="font-size:28px;font-weight:900;color:${colA}">${h2hAwin}</div>
          <div style="font-size:11px;color:var(--gray-l)">${_vsSelA}</div>
        </div>
        <div style="font-size:13px;color:var(--gray-l)">:&nbsp;</div>
        <div style="text-align:center">
          <div style="font-size:28px;font-weight:900;color:${colB}">${h2hBwin}</div>
          <div style="font-size:11px;color:var(--gray-l)">${_vsSelB}</div>
        </div>
      </div>
      <div style="margin-top:8px;height:8px;border-radius:4px;overflow:hidden;background:${colB};display:flex">
        <div style="width:${Math.round(h2hAwin/h2hTotal*100)}%;background:${colA};transition:width .4s"></div>
      </div>
      <div style="font-size:10px;color:var(--gray-l);margin-top:4px">총 ${h2hTotal}게임</div>`}
    </div>

    <!-- 스탯 비교표 -->
    <div class="stats-table-card" style="margin-bottom:14px"><div style="overflow-x:auto">
    <table class="stats-compare-table">
      <thead><tr>
        <th style="text-align:right;color:${colA};padding:6px 12px;font-size:13px">${_vsSelA}</th>
        <th style="text-align:center;color:var(--text3);font-size:11px;padding:4px 0">항목</th>
        <th style="text-align:left;color:${colB};padding:6px 12px;font-size:13px">${_vsSelB}</th>
      </tr></thead>
      <tbody>
        ${statRow('승률',stA.rate+'%',stB.rate+'%')}
        ${statRow('총 승',stA.w+'승',stB.w+'승')}
        ${statRow('총 경기',stA.tot+'경기',stB.tot+'경기')}
        ${statRow('ELO',stA.elo,stB.elo)}
        ${statRow('현재 연속',stA.streak+'연'+(stA.sType==='승'?'승':'패'),stB.streak+'연'+(stB.sType==='승'?'승':'패'),true)}
        ${statRow('티어',getTierLabel(pA.tier||'-'),getTierLabel(pB.tier||'-'),false)}
      </tbody>
    </table>
    </div></div>

    <!-- 최근 폼 -->
    <div class="stats-panel-grid" style="margin-bottom:14px">
      <div class="stats-surface-box">
        <div style="font-size:11px;font-weight:700;color:var(--text3);margin-bottom:6px">${_vsSelA} 최근 폼</div>
        <div style="display:flex;gap:4px;flex-wrap:wrap">${formDots(stA.rec)}</div>
      </div>
      <div class="stats-surface-box">
        <div style="font-size:11px;font-weight:700;color:var(--text3);margin-bottom:6px">${_vsSelB} 최근 폼</div>
        <div style="display:flex;gap:4px;flex-wrap:wrap">${formDots(stB.rec)}</div>
      </div>
    </div>

    <!-- 종족 상성 비교 -->
    <div class="stats-table-card" style="margin-bottom:14px"><div style="overflow-x:auto">
      <div style="font-size:11px;font-weight:700;color:var(--text3);margin-bottom:6px">🎭 종족 상성 (vs 상대 종족 승률)</div>
      <table class="stats-compare-table">
        <thead><tr><th>선수</th><th style="color:#3b82f6">vs 테란</th><th style="color:#7c3aed">vs 저그</th><th style="color:#d97706">vs 프로토스</th></tr></thead>
        <tbody>
          <tr><td style="font-weight:700;color:${colA}">${_vsSelA}</td>${raceTbl(stA.rv,'T',colA)}${raceTbl(stA.rv,'Z',colA)}${raceTbl(stA.rv,'P',colA)}</tr>
          <tr><td style="font-weight:700;color:${colB}">${_vsSelB}</td>${raceTbl(stB.rv,'T',colB)}${raceTbl(stB.rv,'Z',colB)}${raceTbl(stB.rv,'P',colB)}</tr>
        </tbody>
      </table>
    </div></div>

    <!-- 월별 승수 비교 -->
    <div class="stats-table-card"><div style="overflow-x:auto">
      <div style="font-size:11px;font-weight:700;color:var(--text3);margin-bottom:6px">📅 최근 6개월 월별 승수</div>
      <table class="stats-compare-table">
        <thead><tr><th>월</th>${stA.months.map(ym=>`<th style="font-size:10px">${ym.slice(5)}</th>`).join('')}</tr></thead>
        <tbody>
          <tr><td style="font-weight:700;color:${colA}">${_vsSelA}</td>${stA.months.map(ym=>{const s=stA.mStats[ym];return`<td style="text-align:center;font-weight:700;color:${s.w>0?colA:'var(--gray-l)'}">${s.w>0?s.w+'W':'-'}<br><span style="font-size:9px;color:var(--gray-l)">${(s.w+s.l)>0?Math.round(s.w/(s.w+s.l)*100)+'%':''}</span></td>`;}).join('')}</tr>
          <tr><td style="font-weight:700;color:${colB}">${_vsSelB}</td>${stB.months.map(ym=>{const s=stB.mStats[ym];return`<td style="text-align:center;font-weight:700;color:${s.w>0?colB:'var(--gray-l)'}">${s.w>0?s.w+'W':'-'}<br><span style="font-size:9px;color:var(--gray-l)">${(s.w+s.l)>0?Math.round(s.w/(s.w+s.l)*100)+'%':''}</span></td>`;}).join('')}</tr>
        </tbody>
      </table>
    </div></div>
    `}
  </div></div>`;
}

/* ══════════════════════════════════════
   📊 대학별 승률 비교 차트
══════════════════════════════════════ */
var _uwbSort='wr'; // 'wr'=승률순, 'total'=경기수순, 'name'=이름순
function statsUnivWinBarHTML(){
  return `<div id="uwb-wrap" class="stats-chart-shell">
    <div class="stats-chart-toolbar">
      <div>
        <div style="font-weight:800;font-size:13px">📊 대학별 개인 승률 비교</div>
        <div style="font-size:11px;color:var(--gray-l);margin-top:4px">(개인 미니/대학대전/CK/프로 합산)</div>
      </div>
      <select class="stats-select" onchange="_uwbSort=this.value;initUnivWinBarChart()" style="min-width:140px">
        <option value="wr"${_uwbSort==='wr'?' selected':''}>승률순</option>
        <option value="total"${_uwbSort==='total'?' selected':''}>경기수순</option>
        <option value="name"${_uwbSort==='name'?' selected':''}>이름순</option>
      </select>
    </div>
    <div class="stats-chart-board"><div class="stats-chart-wrap"><canvas id="uwbCanvas" style="width:100%;display:block"></canvas></div></div>
    <div id="uwbTrendList" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px;margin-top:12px"></div>
  </div>`;
}
function initUnivWinBarChart(){
  const canvas=document.getElementById('uwbCanvas');
  const trendList=document.getElementById('uwbTrendList');
  if(!canvas)return;
  // 데이터 수집
  const _li = (typeof isLoggedIn!=='undefined' ? !!isLoggedIn : false) || !!window.isLoggedIn;
  const _players = Array.isArray(players) ? players : [];
  const univs=getAllUnivs().filter(u=>((u.name!=='무소속'&&!u.hidden)||_li)).filter(u=>_players.some(p=>p.univ===u.name&&!p.retired));
  const data=univs.map(u=>{
    const mem=_players.filter(p=>p.univ===u.name&&!p.retired);
    const w=mem.reduce((s,p)=>s+(p.win||0),0);
    const l=mem.reduce((s,p)=>s+(p.loss||0),0);
    const tot=w+l;
    const wr=tot?Math.round(w/tot*100):0;
    return{name:u.name,col:gc(u.name),w,l,tot,wr};
  }).filter(d=>d.tot>0);
  if(!data.length){canvas.style.display='none';return;}
  // 정렬
  if(_uwbSort==='wr') data.sort((a,b)=>b.wr-a.wr);
  else if(_uwbSort==='total') data.sort((a,b)=>b.tot-a.tot);
  else data.sort((a,b)=>a.name.localeCompare(b.name,'ko'));

  const dpr=window.devicePixelRatio||1;
  const ROW_H=34, PAD_L=90, PAD_R=55, PAD_T=28, PAD_B=24;
  const W=canvas.parentElement.clientWidth||300;
  const H=PAD_T+data.length*ROW_H+PAD_B;
  canvas.width=W*dpr; canvas.height=H*dpr;
  canvas.style.width=W+'px'; canvas.style.height=H+'px';
  const ctx=canvas.getContext('2d');
  ctx.scale(dpr,dpr);
  // 배경
  const isDark=document.body.classList.contains('dark')||document.documentElement.getAttribute('data-theme')==='dark';
  const bgCol=isDark?'#1e293b':'#f8fafc';
  const textCol=isDark?'#e2e8f0':'#1e293b';
  const gridCol=isDark?'rgba(255,255,255,.08)':'rgba(0,0,0,.07)';
  ctx.fillStyle=bgCol; ctx.fillRect(0,0,W,H);
  // 헤더: %축
  const chartW=W-PAD_L-PAD_R;
  const pctTicks=[0,25,50,75,100];
  ctx.font=`bold ${10*1}px 'Noto Sans KR',sans-serif`;
  ctx.textAlign='center';
  ctx.fillStyle=isDark?'#94a3b8':'#64748b';
  pctTicks.forEach(t=>{
    const x=PAD_L+chartW*t/100;
    ctx.fillText(t+'%',x,PAD_T-8);
    ctx.beginPath(); ctx.strokeStyle=gridCol; ctx.lineWidth=1;
    ctx.moveTo(x,PAD_T); ctx.lineTo(x,H-PAD_B); ctx.stroke();
  });
  // 50% 기준선 강조
  const x50=PAD_L+chartW*0.5;
  ctx.beginPath(); ctx.strokeStyle=isDark?'rgba(255,255,255,.18)':'rgba(0,0,0,.15)'; ctx.lineWidth=1.5;
  ctx.setLineDash([4,3]); ctx.moveTo(x50,PAD_T); ctx.lineTo(x50,H-PAD_B); ctx.stroke(); ctx.setLineDash([]);

  data.forEach((d,i)=>{
    const y=PAD_T+i*ROW_H;
    const barH=20, barY=y+7;
    const barW=Math.max(2,chartW*d.wr/100);
    // 대학명
    ctx.font=`bold ${12}px 'Noto Sans KR',sans-serif`;
    ctx.textAlign='right'; ctx.fillStyle=textCol;
    ctx.fillText(d.name,PAD_L-6,barY+14);
    // 바 배경
    ctx.fillStyle=isDark?'rgba(255,255,255,.06)':'rgba(0,0,0,.05)';
    ctx.beginPath(); ctx.roundRect?ctx.roundRect(PAD_L,barY,chartW,barH,4):ctx.rect(PAD_L,barY,chartW,barH); ctx.fill();
    // 승률 바
    const hex=d.col;
    ctx.fillStyle=hex+'cc';
    ctx.beginPath(); ctx.roundRect?ctx.roundRect(PAD_L,barY,barW,barH,4):ctx.rect(PAD_L,barY,barW,barH); ctx.fill();
    // 테두리
    ctx.strokeStyle=hex; ctx.lineWidth=1.2;
    ctx.beginPath(); ctx.roundRect?ctx.roundRect(PAD_L,barY,barW,barH,4):ctx.rect(PAD_L,barY,barW,barH); ctx.stroke();
    // 수치 레이블
    ctx.font=`bold ${11}px 'Noto Sans KR',sans-serif`;
    ctx.textAlign='left'; ctx.fillStyle=textCol;
    ctx.fillText(`${d.wr}%  (${d.w}승 ${d.l}패)`,PAD_L+barW+5,barY+14);
  });

  if(trendList){
    const recentMap = {};
    const allMatches = statsFilterMatches([...(window.miniM||[]), ...(window.univM||[]), ...(window.ckM||[]), ...(window.comps||[]), ...(window.proM||[])])
      .sort((a,b)=>String(a?.d||a?.date||'').localeCompare(String(b?.d||b?.date||'')));
    allMatches.forEach(m=>{
      (m.sets||[]).forEach(set=>{
        (set.games||[]).forEach(g=>{
          const sides = _statsGameSides(g);
          if(!sides) return;
          sides.a.forEach(name => {
            const pA = statsP(name);
            const ua = String(pA?.univ||'').trim();
            if(ua){ if(!recentMap[ua]) recentMap[ua]=[]; recentMap[ua].push(sides.winner==='A'?1:0); }
          });
          sides.b.forEach(name => {
            const pB = statsP(name);
            const ub = String(pB?.univ||'').trim();
            if(ub){ if(!recentMap[ub]) recentMap[ub]=[]; recentMap[ub].push(sides.winner==='B'?1:0); }
          });
        });
      });
    });
    const sparkline = (arr, col)=>{
      const vals = (arr||[]).slice(-10);
      if(!vals.length) return `<div style="font-size:11px;color:var(--gray-l)">최근 10경기 데이터 없음</div>`;
      const W=140,H=34,P=4;
      const pts = vals.map((v,i)=>{
        const x = P + ((W-P*2) * (vals.length===1?0.5:i/(vals.length-1)));
        const y = H-P - (H-P*2) * v;
        return `${x},${y}`;
      }).join(' ');
      const dots = vals.map((v,i)=>{
        const x = P + ((W-P*2) * (vals.length===1?0.5:i/(vals.length-1)));
        const y = H-P - (H-P*2) * v;
        return `<circle cx="${x}" cy="${y}" r="2.5" fill="${v?col:'#94a3b8'}" />`;
      }).join('');
      return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" style="display:block">
        <line x1="${P}" y1="${H/2}" x2="${W-P}" y2="${H/2}" stroke="rgba(148,163,184,.45)" stroke-dasharray="3 3"/>
        <polyline fill="none" stroke="${col}" stroke-width="2.2" points="${pts}" />
        ${dots}
      </svg>`;
    };
    trendList.innerHTML = data.slice(0, Math.min(8, data.length)).map(d=>{
      const last = (recentMap[d.name]||[]).slice(-10);
      const streak = last.map(v=>v?'승':'패').join(' ');
      return `<div class="stats-surface-box">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:6px">
          <span style="font-size:13px;font-weight:900;color:${d.col}">${d.name}</span>
          <span style="font-size:11px;color:var(--gray-l)">최근 ${Math.min(10,last.length)}경기</span>
        </div>
        ${sparkline(last, d.col)}
        <div style="display:flex;justify-content:space-between;gap:10px;margin-top:6px;font-size:11px">
          <span style="color:var(--text3)">추세</span>
          <span style="font-weight:700;color:var(--text2)">${streak || '-'}</span>
        </div>
      </div>`;
    }).join('');
  }
}

/* ══════════════════════════════════════
   📅 경기 캘린더
══════════════════════════════════════ */
