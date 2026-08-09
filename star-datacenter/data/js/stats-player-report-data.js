/* ══════════════════════════════════════════════════════════════
   선수 리포트 - 데이터 계산 & 기본 HTML 프래그먼트 (stats-player-report.js 에서 분리, 2026-07-30)
   ══════════════════════════════════════════════════════════════ */

/* ══════════════════════════════════════
   stats-player-report.js
   통계 탭 > 🔍 리포트 > 📡 스트리머 리포트
   - 스트리머 검색 후 개별 종합 리포트 (기본 정보, 기간별 승률 게이지,
     맵별 성적, 핵심 분석 결과, AI 분석 코멘트, 최근전적, ELO 보드,
     동일 티어 상대전적, 1:1 비교)
   - AI 분석 코멘트: 규칙 기반 템플릿 문장 (외부 API 미사용)
   - ELO 보드: eloboard.com 외부 링크만 연결 (개인 URL 등록 기능 없음)
══════════════════════════════════════ */

/* ─── 상태 (var 사용 — 지연 로딩 재실행 시 재선언 충돌 방지) ─── */
if(window._prName===undefined) window._prName = '';
if(window._prPeriod===undefined) window._prPeriod = 'all'; // 30 | 90 | season | all
if(window._prExcludeMini===undefined) window._prExcludeMini = false;
if(window._prExcludeUniv===undefined) window._prExcludeUniv = false;
if(window._prExcludeCk===undefined) window._prExcludeCk = false;
if(window._prExcludeTier===undefined) window._prExcludeTier = false;
if(window._prExcludeNormalTour===undefined) window._prExcludeNormalTour = false;
if(window._prVsOpp===undefined) window._prVsOpp = '';
if(window._prTableLimit===undefined) window._prTableLimit = 20;
if(window._prRecentMapFilter===undefined) window._prRecentMapFilter = '';
if(window._prStripExpanded===undefined) window._prStripExpanded = false;

var PR_RECENT_KEY = 'su_prReportRecent';

function _prLoadRecent(){
  try{ return JSON.parse(localStorage.getItem(PR_RECENT_KEY)||'[]'); }catch(e){ return []; }
}
function _prSaveRecent(name){
  try{
    let arr = _prLoadRecent().filter(n=>n!==name);
    arr.unshift(name);
    arr = arr.slice(0,8);
    localStorage.setItem(PR_RECENT_KEY, JSON.stringify(arr));
  }catch(e){}
}

/* ─── 스타일 주입 (1회) ─── */
try{
(function _prInjectCss(){
  if(document.getElementById('pr-report-style')) return;
  const s=document.createElement('style');
  s.id='pr-report-style';
  s.textContent = [
    '@property --wrp{syntax:"<number>";inherits:false;initial-value:0}',
    '.pr-search-wrap{position:relative;max-width:480px}',
    '.pr-search-input{width:100%;box-sizing:border-box;padding:12px 16px;font-size:var(--fs-md);border:1.5px solid var(--border2);border-radius:999px;font-family:inherit;transition:border-color .15s}',
    '.pr-search-input:focus{outline:none;border-color:var(--blue)}',
    '.pr-search-drop{position:absolute;top:calc(100% + 6px);left:0;right:0;background:var(--white);border:1px solid var(--border);border-radius:var(--r2);box-shadow:var(--sh3);max-height:360px;overflow-y:auto;z-index:50}',
    '.pr-search-row{display:flex;align-items:center;gap:10px;padding:9px 14px;cursor:pointer;border-bottom:1px solid var(--border)}',
    '.pr-search-row:last-child{border-bottom:none}',
    '.pr-search-row:hover{background:var(--surface)}',
    '.pr-recent-wrap{margin-top:8px;display:flex;gap:7px;flex-wrap:wrap;align-items:center;padding:9px 12px;border-radius:var(--r2);background:var(--surface);border:1px solid var(--border)}',
    '.pr-recent-lbl{font-size:11px;color:var(--text2);font-weight:800;display:inline-flex;align-items:center;gap:4px}',
    '.pr-recent-chip{display:inline-flex;align-items:center;gap:4px;padding:5px 12px;border-radius:999px;background:var(--white);border:1px solid var(--border2);font-size:12px;font-weight:700;cursor:pointer;color:var(--text2);transition:.15s}',
    '.pr-recent-chip:hover{background:var(--blue-l);border-color:var(--blue);color:var(--blue)}',
    '.pr-hero{display:flex;align-items:center;gap:20px;padding:22px;border-radius:22px;background:var(--white);border:1px solid var(--border);box-shadow:var(--sh);flex-wrap:wrap;margin-bottom:14px}',
    '.pr-hero-photo{width:124px;height:124px;border-radius:var(--su_profile_radius,22px);overflow:hidden;flex-shrink:0;cursor:pointer;transition:transform .18s,box-shadow .18s}',
    '.pr-hero-photo:hover{transform:translateY(-2px) scale(1.02)}',
    '.pr-hero-name{font-size:24px;font-weight:950;letter-spacing:-.02em;color:var(--text1);display:flex;align-items:center;gap:8px;flex-wrap:wrap}',
    '.pr-hero-name .rbadge{font-size:11px;font-weight:700;opacity:.85}',
    '.pr-hero-wr-row{display:flex;align-items:center;gap:12px;margin-top:8px;flex-wrap:wrap}',
    '.pr-hero-wr-num{font-size:30px;font-weight:950;letter-spacing:-.02em;line-height:1}',
    '.pr-hero-wr-sub{font-size:12px;font-weight:600;color:var(--text2)}',
    '.pr-level-badge{display:inline-flex;align-items:center;gap:6px;padding:2px 10px 2px 4px;border-radius:999px;border:1px solid;line-height:1}',
    '.pr-level-grade{display:inline-flex;align-items:center;justify-content:center;min-width:20px;height:20px;padding:0 5px;border-radius:999px;font-size:10.5px;font-weight:800;letter-spacing:-.01em;color:#fff;flex-shrink:0;box-shadow:0 1px 2px rgba(15,23,42,.16)}',
    '.pr-level-num{font-size:11px;font-weight:800;color:var(--text2)}',
    '.pr-level-bar{width:34px;height:5px;border-radius:999px;background:var(--border2);overflow:hidden;display:inline-block}',
    '.pr-level-bar-fill{display:block;height:100%;border-radius:999px}',
    '.pr-hero-meta{display:flex;align-items:center;gap:9px;flex-wrap:wrap;margin-top:13px}',
    '.pr-chip{display:inline-flex;align-items:center;gap:5px;padding:5.5px 13px;border-radius:999px;font-size:12px;font-weight:700;white-space:nowrap;line-height:1.15}',
    '.pr-chip-neutral{background:var(--surface);color:var(--text2);font-weight:600}',
    '.pr-chip-wr{font-size:12.5px;font-weight:900}',
    '.pr-hero-actions{display:flex;align-items:center;gap:8px;margin-left:auto;flex-wrap:wrap}',
    '.pr-btn{display:inline-flex;align-items:center;gap:6px;padding:9px 16px;border-radius:12px;font-size:12px;font-weight:700;cursor:pointer;border:1px solid var(--border2);background:var(--white);color:var(--text2);text-decoration:none;transition:.15s}',
    '.pr-btn:hover{background:var(--surface);border-color:var(--blue)}',
    '.pr-btn.pr-btn-primary{background:var(--blue);border-color:var(--blue);color:#fff;font-weight:800;box-shadow:0 2px 8px rgba(37,99,235,.28)}',
    '.pr-btn.pr-btn-primary:hover{background:#1d4ed8;border-color:#1d4ed8}',
    '.pr-btn.pr-btn-ghost{background:transparent;border-color:var(--border2);color:var(--text2)}',
    '.pr-btn.pr-btn-ghost:hover{background:var(--surface);color:var(--text2)}',
    '.pr-btn-iconOnly{width:36px;height:36px;padding:0;justify-content:center;border-radius:11px;font-size:15px}',
    '.pr-btn-iconOnly span{display:none}',
    '.pr-period-bar{display:flex;gap:6px;flex-wrap:wrap;margin:0 0 14px}',
    '.pr-period-btn{padding:7px 16px;border-radius:999px;border:1px solid var(--border2);background:var(--white);font-size:12px;font-weight:800;cursor:pointer;color:var(--text2)}',
    '.pr-period-btn.on{background:var(--blue);border-color:var(--blue);color:#fff}',
    '.pr-period-scope-note{font-size:11px;color:var(--text2);font-weight:600;margin:-6px 0 14px;padding:0 2px}',
    '.pr-period-scope-note b{color:var(--blue);font-weight:800}',
    '.pr-wr-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px}',
    '.pr-wr-card{padding:16px;border-radius:18px;background:var(--white);border:1px solid var(--border);box-shadow:var(--sh);text-align:center}',
    '.pr-wr-card .pr-wr-label{font-size:11px;font-weight:800;color:var(--text2);margin-bottom:6px}',
    '.pr-wr-card .pr-wr-pct{font-size:28px;font-weight:950;line-height:1.1}',
    '.pr-wr-card .pr-wr-rec{font-size:11px;color:var(--text2);margin-top:4px;font-weight:700}',
    '.pr-ai-box{padding:18px 20px;border-radius:18px;background:linear-gradient(135deg,#eff6ff,#f5f3ff);border:1px solid #dbeafe;border-left:3px solid #93c5fd;display:flex;gap:12px;align-items:flex-start;transition:background .2s}',
    '.pr-ai-box.pr-ai-good{background:linear-gradient(135deg,#ecfdf5,#f0fdf4);border-color:#bbf7d0;border-left-color:#16a34a}',
    '.pr-ai-box.pr-ai-bad{background:linear-gradient(135deg,#fef2f2,#fff7ed);border-color:#fecaca;border-left-color:#ef4444}',
    '.pr-ai-icon{font-size:22px;flex-shrink:0}',
    '.pr-ai-text{font-size:13px;line-height:1.75;color:var(--text2);font-weight:600}',
    '.pr-strip{display:flex;gap:4px;flex-wrap:wrap;align-items:center}',
    '.pr-strip-older{display:flex;gap:4px;flex-wrap:wrap;align-items:center;opacity:.62}',
    '.pr-strip-sq{width:22px;height:22px;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:900;color:#fff;flex-shrink:0;cursor:default;position:relative}',
    '.pr-strip-sq--recent{width:28px;height:28px;border-radius:8px;font-size:11.5px;box-shadow:0 0 0 2px var(--white),0 0 0 3.5px var(--blue-l)}',
    '.pr-strip-sq[data-tip]:hover{transform:translateY(-2px) scale(1.08);transition:transform .12s;z-index:5}',
    '.pr-strip-sq[data-tip]:hover::after{content:attr(data-tip);position:absolute;bottom:calc(100% + 9px);left:50%;transform:translateX(-50%);background:#1e293b;color:#fff;padding:7px 10px;border-radius:9px;font-size:11px;font-weight:700;line-height:1.55;white-space:pre;text-align:left;box-shadow:var(--sh3);z-index:30;pointer-events:none}',
    '.pr-strip-sq[data-tip]:hover::before{content:"";position:absolute;bottom:calc(100% + 4px);left:50%;transform:translateX(-50%);border:5px solid transparent;border-top-color:#1e293b;z-index:30;pointer-events:none}',
    '.pr-strip-toggle{margin-top:8px;padding:6px 14px;border-radius:999px;border:1px solid var(--border2);background:var(--white);color:var(--text2);font-size:11px;font-weight:800;cursor:pointer}',
    '.pr-strip-toggle:hover{border-color:var(--blue);color:var(--blue)}',
    '.pr-toggle{display:inline-flex;align-items:center;gap:6px;font-size:11px;font-weight:700;color:var(--text2);cursor:pointer;user-select:none}',
    '.pr-tier-opp-row{display:flex;align-items:center;gap:10px;padding:9px 12px;border-bottom:1px solid var(--border);font-size:13px;flex-wrap:wrap}',
    '.pr-tier-opp-row:last-child{border-bottom:none}',
    '.pr-vs-select{appearance:none;-webkit-appearance:none;-moz-appearance:none;padding:9px 34px 9px 14px;border-radius:10px;border:1.5px solid var(--border2);font-size:13px;font-weight:700;font-family:inherit;max-width:240px;cursor:pointer;transition:border-color .15s,box-shadow .15s;background-color:var(--white);background-repeat:no-repeat;background-position:right 13px center;background-size:10px 6px;background-image:url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'10\' height=\'6\'%3E%3Cpath d=\'M0 0l5 6 5-6z\' fill=\'%2394a3b8\'/%3E%3C/svg%3E")}',
    '.pr-vs-select:hover{border-color:var(--blue)}',
    '.pr-vs-select:focus{outline:none;border-color:var(--blue);box-shadow:0 0 0 3px var(--blue-l)}',
    '.pr-vs-box{display:flex;align-items:center;justify-content:center;gap:20px;padding:20px 0;flex-wrap:wrap}',
    '.pr-vs-side{text-align:center;flex:1;min-width:110px}',
    '.pr-predict-bar{height:24px;border-radius:999px;overflow:hidden;display:flex;background:var(--surface);margin-top:8px}',
    '.pr-empty{padding:60px 20px;text-align:center;color:var(--text2)}',
    '.pr-empty-sec{display:flex;align-items:center;gap:8px;justify-content:center;padding:22px 10px;color:var(--text2);font-size:12.5px;font-weight:700;background:var(--surface);border:1px dashed var(--border2);border-radius:14px}',
    '.pr-empty-sec-icon{font-size:16px;opacity:.8}',
    /* ── ELO 추이 그래프 ── */
    '.pr-elo-chart-wrap{position:relative}',
    '.pr-elo-svg{width:100%;height:140px;display:block;overflow:visible}',
    '.pr-elo-dot{cursor:default}',
    '.pr-elo-dot:hover{r:6}',
    '.pr-elo-axis{position:relative;height:16px;margin-top:2px}',
    '.pr-elo-tick{position:absolute;top:0;transform:translateX(-50%);font-size:9.5px;font-weight:700;color:var(--text2);white-space:nowrap}',
    /* ── 월별 승률 미니 차트 ── */
    '.pr-mtrend-summary{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:12px;padding:9px 14px;border-radius:12px;background:var(--surface);border:1px solid var(--border)}',
    '.pr-mtrend-summary-avg{font-size:12px;font-weight:700;color:var(--text2)}',
    '.pr-mtrend-summary-avg b{font-size:13px;font-weight:950;color:var(--text1)}',
    '.pr-mtrend-summary-trend{font-size:11.5px;font-weight:800;color:var(--text2);padding-left:10px;border-left:1px solid var(--border2)}',
    '.pr-mtrend-linewrap{overflow-x:auto;padding:4px 2px 2px;-webkit-overflow-scrolling:touch}',
    '.pr-mtrend-svg{display:block;overflow:visible}',
    '.pr-mtrend-lrow{display:flex}',
    '.pr-mtrend-lcol{flex-shrink:0;display:flex;flex-direction:column;align-items:center;text-align:center}',
    '.pr-mtrend-lcol--now .pr-mtrend-rec,.pr-mtrend-lcol--now .pr-mtrend-lbl{color:var(--blue)}',
    '.pr-mtrend-col--empty{opacity:.5}',
    '.pr-mtrend-rec{font-size:11.5px;color:var(--text1);font-weight:900;white-space:nowrap}',
    '.pr-mtrend-lbl{font-size:10.5px;color:var(--text2);font-weight:800;margin-top:2px}',
    '.pr-mtrend-note{font-size:11.5px;font-weight:700;color:var(--text2);background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:9px 12px;margin-top:2px}',
    '.pr-mtrend-note b{color:#16a34a}',
    '.pr-img-preview-overlay{position:fixed;inset:0;background:rgba(15,23,42,.62);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px;backdrop-filter:blur(2px)}',
    '.pr-img-preview-modal{background:var(--white);border-radius:20px;box-shadow:var(--sh3);max-width:min(720px,92vw);max-height:90vh;display:flex;flex-direction:column;overflow:hidden}',
    '.pr-img-preview-hdr{display:flex;align-items:center;justify-content:space-between;padding:14px 18px;border-bottom:1px solid var(--border);font-size:14px;font-weight:900;color:var(--text1)}',
    '.pr-img-preview-x{border:none;background:transparent;font-size:15px;cursor:pointer;color:var(--text2);padding:4px 8px;border-radius:8px}',
    '.pr-img-preview-x:hover{background:var(--surface);color:var(--text1)}',
    '.pr-img-preview-body{overflow:auto;padding:14px;background:var(--surface);display:flex;justify-content:center;position:relative}',
    '.pr-img-preview-body img{max-width:100%;height:auto;border-radius:10px;box-shadow:var(--sh2);display:block;transition:opacity .15s}',
    '.pr-img-preview-ftr{display:flex;justify-content:flex-end;gap:8px;padding:12px 18px;border-top:1px solid var(--border)}',
    '.pr-bgstyle-row{display:flex;flex-wrap:wrap;gap:6px;padding:10px 16px;border-bottom:1px solid var(--border);justify-content:center}',
    '.pr-bgstyle-btn{flex-shrink:0;display:inline-flex;align-items:center;gap:6px;padding:7px 12px;border-radius:999px;border:1.5px solid var(--border2);background:var(--white);color:var(--text2);font-size:12px;font-weight:800;cursor:pointer;transition:.15s;white-space:nowrap}',
    '.pr-bgstyle-dot{width:10px;height:10px;border-radius:50%;flex-shrink:0;box-shadow:0 0 0 1px rgba(0,0,0,.08)}',
    '.pr-bgstyle-dot--none{background:#fff;border:1.5px solid var(--border2)}',
    '.pr-bgstyle-btn:hover{border-color:var(--blue);color:var(--blue)}',
    '.pr-bgstyle-btn.on{background:var(--blue);border-color:var(--blue);color:#fff}',
    '@media (max-width:480px){.pr-bgstyle-row{gap:5px;padding:8px 10px}.pr-bgstyle-btn{padding:6px 9px;font-size:10.5px}}',
    '.pr-bg-loading .pr-img-preview-body img{opacity:.35}',
    '.pr-bg-loading .pr-img-preview-body::after{content:"이미지 생성 중...";position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:12px;font-weight:800;color:var(--text2);background:var(--white);padding:8px 14px;border-radius:999px;box-shadow:var(--sh2)}',
    /* ── 다크모드 보정: var()로 자동 대응되지 않는 하드코딩 파스텔톤 요소 ── */
    'body.dark .pr-hero{background:linear-gradient(135deg,rgba(30,41,59,.96),rgba(22,32,50,.92));border-color:rgba(148,163,184,.16)}',
    'body.dark .pr-ai-box{background:linear-gradient(135deg,#1e3a5f,#241b47);border-color:#2d3f55;border-left-color:#3b82f6}',
    'body.dark .pr-ai-box.pr-ai-good{background:linear-gradient(135deg,#0f2e1e,#0d2818);border-color:#14532d;border-left-color:#22c55e}',
    'body.dark .pr-ai-box.pr-ai-bad{background:linear-gradient(135deg,#3a1414,#301612);border-color:#5c1f1f;border-left-color:#f87171}',
    'body.dark .pr-highlight-row.pr-highlight-good{background:#0f2e1e;border-left-color:#22c55e}',
    'body.dark .pr-highlight-row.pr-highlight-bad{background:#3a1414;border-left-color:#f87171}',
    'body.dark .pr-filter-pill.on{background:#3a1414;border-color:#f87171;color:#fca5a5}',
    'body.dark .pr-nav-more[open] .pr-nav-more-btn{background:var(--blue-l);border-color:var(--blue);color:var(--blue-d)}',
    'body.dark .pr-strip-toggle:hover,body.dark .pr-recent-chip:hover,body.dark .pr-nav-chip:hover{background:var(--blue-l);border-color:var(--blue);color:var(--blue-d)}',
    'body.dark .pr-empty-sec{background:var(--surface);border-color:var(--border2)}',
    'body.dark .pr-mtrend-note b{color:#4ade80}',
    '.pr-sec-head{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin:0 0 14px}',
    '.pr-sec-head h4{margin:0;border:none;padding:0;font-size:15px}',
    '.pr-sec-sub{font-size:11px;color:var(--text2);font-weight:700}',
    '.pr-info-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(110px,1fr));gap:10px}',
    '.pr-info-card{text-align:center;padding:14px 8px;border-radius:16px;background:var(--surface);border:1px solid var(--border)}',
    '.pr-info-num{font-size:23px;font-weight:950;line-height:1.15}',
    '.pr-info-lbl{font-size:11px;color:var(--text2);font-weight:800;margin-top:5px}',
    '.pr-gauge-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:16px}',
    '.pr-gauge-card{text-align:center}',
    '.pr-gauge-ring{width:92px;height:92px;border-radius:50%;margin:0 auto 8px;position:relative;--wrp:0;animation:pr-gauge-fill 1s cubic-bezier(.16,1,.3,1) forwards}',
    '.pr-gauge-ring::before{content:"";position:absolute;inset:9px;border-radius:50%;background:var(--white)}',
    '@keyframes pr-gauge-fill{to{--wrp:var(--wr-target)}}',
    '@media(prefers-reduced-motion:reduce){.pr-gauge-ring{animation:none;--wrp:var(--wr-target)}}',
    '.pr-gauge-pct{position:absolute;inset:9px;display:flex;flex-direction:column;align-items:center;justify-content:center;font-size:16px;font-weight:950;line-height:1.1}',
    '.pr-gauge-pct .pr-gauge-arrow{font-size:11px;line-height:1;margin-bottom:1px}',
    '.pr-gauge-lbl{font-size:12px;font-weight:800;color:var(--text2)}',
    '.pr-gauge-rec{font-size:10.5px;color:var(--text2);font-weight:700;margin-top:2px}',
    '.pr-gauge-card--best .pr-gauge-ring{box-shadow:0 0 0 3px var(--white),0 0 0 5px rgba(22,163,74,.35)}',
    '.pr-gauge-card--worst .pr-gauge-ring{box-shadow:0 0 0 3px var(--white),0 0 0 5px rgba(239,68,68,.3)}',
    '.pr-gauge-badge{display:inline-block;padding:1px 6px;border-radius:999px;font-size:9.5px;font-weight:900;vertical-align:middle}',
    '.pr-gauge-badge--best{background:#dcfce7;color:#15803d}',
    '.pr-gauge-badge--worst{background:#fee2e2;color:#b91c1c}',
    'body.dark .pr-gauge-badge--best{background:#14532d;color:#4ade80}',
    'body.dark .pr-gauge-badge--worst{background:#4c1d1d;color:#fca5a5}',
    '.pr-bar-row{display:flex;align-items:center;gap:10px;padding:6px 0}',
    '.pr-bar-lbl{width:100px;flex-shrink:0;font-size:12px;font-weight:800;color:var(--text2);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
    '.pr-bar-track{flex:1;height:20px;border-radius:999px;background:var(--surface);overflow:hidden}',
    '.pr-bar-fill{height:100%;border-radius:999px;display:flex;align-items:center;justify-content:flex-end;padding-right:8px;box-sizing:border-box;color:#fff;font-size:10px;font-weight:900;white-space:nowrap;transition:width .3s}',
    '.pr-bar-rec{width:76px;flex-shrink:0;font-size:11px;color:var(--text2);font-weight:700;text-align:right}',
    /* 🎮 이스포츠 카드의 MATCH RECORD 칩 스타일을 리포트 본문(대회·모드별 성적)에도 그대로 재사용 */
    '.pr-mode-chip-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}',
    '.pr-mode-chip{position:relative;padding:14px 16px 14px 20px;border-radius:14px;overflow:hidden}',
    '.pr-mode-chip-accent{position:absolute;left:0;top:0;bottom:0;width:5px}',
    '.pr-mode-chip-lbl{font-size:12px;font-weight:800;margin-bottom:6px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
    '.pr-mode-chip-row{display:flex;align-items:baseline;justify-content:space-between;gap:6px;flex-wrap:wrap}',
    '.pr-mode-chip-pct{font-size:24px;font-weight:950;color:var(--text1);line-height:1}',
    '.pr-mode-chip-rec{font-size:11px;font-weight:700;color:var(--text2);white-space:nowrap}',
    '@media(max-width:900px){.pr-mode-chip-grid{grid-template-columns:repeat(3,1fr)}}',
    '@media(max-width:640px){.pr-mode-chip-grid{grid-template-columns:repeat(2,1fr)}.pr-mode-chip-pct{font-size:22px}}',
    '.pr-highlight-row{display:flex;align-items:center;gap:10px;padding:11px 14px;border-radius:14px;margin-bottom:8px;font-size:12.5px;font-weight:700;color:var(--text2);line-height:1.5;border-left:3px solid transparent}',
    '.pr-highlight-row:last-child{margin-bottom:0}',
    '.pr-highlight-row b{font-weight:900;color:var(--text1)}',
    '.pr-highlight-row.pr-highlight-good{background:#ecfdf5;border-left-color:#16a34a}',
    '.pr-highlight-row.pr-highlight-bad{background:#fef2f2;border-left-color:#ef4444}',
    '.pr-highlight-row.pr-highlight-featured{border-left-width:4px;padding:14px 16px;font-size:14px;box-shadow:var(--sh)}',
    '.pr-highlight-row.pr-highlight-featured .pr-hi-icon{font-size:21px}',
    '.pr-hi-icon{font-size:17px;flex-shrink:0}',
    '.pr-filter-bar{display:flex;gap:8px;flex-wrap:wrap}',
    '.pr-filter-pill{display:inline-flex;align-items:center;gap:5px;padding:6px 13px;border-radius:999px;border:1.5px solid var(--border2);background:var(--white);color:var(--text2);font-size:11px;font-weight:800;cursor:pointer;transition:.15s}',
    '.pr-filter-pill:hover{border-color:var(--blue)}',
    '.pr-filter-pill.on{background:#fef2f2;border-color:#ef4444;color:#b91c1c}',
    '.pr-nav-bar{display:flex;gap:6px;flex-wrap:wrap;overflow-x:auto;-webkit-overflow-scrolling:touch;scrollbar-width:none;padding:4px 2px 14px;margin-bottom:4px}',
    '.pr-nav-bar::-webkit-scrollbar{display:none}',
    '.pr-nav-chip{flex-shrink:0;display:inline-flex;align-items:center;gap:5px;padding:7px 14px;border-radius:999px;border:1px solid var(--border2);background:var(--white);color:var(--text2);font-size:12px;font-weight:800;cursor:pointer;white-space:nowrap;transition:.15s}',
    '.pr-nav-chip:hover{background:var(--blue-l);border-color:var(--blue);color:var(--blue)}',
    '.pr-nav-more{position:relative;flex-shrink:0}',
    '.pr-nav-more-btn{list-style:none}',
    '.pr-nav-more-btn::-webkit-details-marker{display:none}',
    '.pr-nav-more[open] .pr-nav-more-btn{background:var(--blue-l);border-color:var(--blue);color:var(--blue)}',
    '.pr-nav-more-panel{position:absolute;top:calc(100% + 6px);left:0;z-index:20;display:flex;flex-direction:column;gap:2px;background:var(--white);border:1px solid var(--border);border-radius:12px;box-shadow:var(--sh3);padding:6px;min-width:180px}',
    '.pr-nav-more-item{display:block;width:100%;text-align:left;padding:8px 10px;border-radius:8px;border:none;background:transparent;color:var(--text2);font-size:12px;font-weight:800;cursor:pointer;white-space:nowrap}',
    '.pr-nav-more-item:hover{background:var(--surface);color:var(--blue)}',
    /* 전체 경기 테이블(최근전적) — 공용 행 빌더는 건드리지 않고 이 리포트 안에서만 왼쪽 컬러 악센트 + 호버 강조 */
    '.pr-recent-table table{border-collapse:separate;border-spacing:0}',
    '.pr-recent-table tbody tr.pd-hist-row{box-shadow:inset 3px 0 0 0 transparent;transition:background .12s}',
    '.pr-recent-table tbody tr.pd-hist-row.is-win{box-shadow:inset 3px 0 0 0 var(--score-win)}',
    '.pr-recent-table tbody tr.pd-hist-row.is-lose{box-shadow:inset 3px 0 0 0 var(--score-lose)}',
    '.pr-recent-table tbody tr.pd-hist-row.is-draw{box-shadow:inset 3px 0 0 0 #94a3b8}',
    '.pr-recent-table tbody tr.pd-hist-row:hover{background:var(--surface)}',
    '.pr-recent-table tbody td:first-child{padding-left:11px}',
    '.pr-recent-table tbody td:first-child{color:var(--text1)!important;font-weight:800!important}',
    '.pr-recent-table tbody td.ph-col-map{color:var(--text1)!important;font-weight:800!important}',
    '@media(max-width:640px){.pr-hero{padding:16px}.pr-hero-photo{width:92px;height:92px}.pr-hero-name{font-size:19px}.pr-hero-actions{margin-left:0;width:100%}.pr-hero-actions .pr-btn{flex:1;justify-content:center}.pr-hero-actions .pr-btn-iconOnly{flex:0 0 auto}.pr-info-grid{grid-template-columns:repeat(2,1fr)}.pr-gauge-grid{grid-template-columns:repeat(2,1fr)}.pr-bar-lbl{width:80px;font-size:11px}.pr-bar-rec{width:60px;font-size:10px}}',
    '@media(max-width:640px){',
    '  .pr-recent-table{overflow-x:visible}',
    '  .pr-recent-table table{border:none}',
    '  .pr-recent-table thead{display:none}',
    '  .pr-recent-table tbody tr{display:flex;flex-wrap:wrap;align-items:center;gap:6px 10px;padding:12px 14px;border-bottom:1px solid var(--border)}',
    '  .pr-recent-table tbody tr:last-child{border-bottom:none}',
    '  .pr-recent-table tbody td{display:inline-flex;align-items:center;padding:0;border:none;font-size:12px;white-space:nowrap}',
    '  .pr-recent-table tbody td:nth-child(3){order:-1;width:100%;margin-bottom:2px}',
    '  .pr-recent-table tbody td.ph-col-map:not(:empty)::before{content:"🗺️ ";opacity:.6}',
    '  .pr-recent-table tbody td.ph-col-elo::before{content:"ELO ";font-size:10px;color:var(--text2);opacity:.8}',
    '}'
  ].join('\n');
  document.head.appendChild(s);
})();
}catch(e){ console.error('[리포트 스타일 주입 오류]', e); }

/* ─── 기간 필터 ─── */
function _prPeriodRange(period){
  const now=new Date();
  const toStr=d=>d.toISOString().slice(0,10);
  if(period==='30'){ const d=new Date(now); d.setDate(d.getDate()-30); return {from:toStr(d), to:toStr(now)}; }
  if(period==='90'){ const d=new Date(now); d.setDate(d.getDate()-90); return {from:toStr(d), to:toStr(now)}; }
  if(period==='season'){ return {from:`${now.getFullYear()}-01-01`, to:toStr(now)}; }
  return {from:'', to:''};
}
function _prFilterHistByPeriod(hist, period){
  const {from,to} = _prPeriodRange(period);
  if(!from) return (hist||[]).slice();
  return (hist||[]).filter(h=>{
    const d = (typeof window._toIsoDateStr==='function') ? window._toIsoDateStr(h.date) : String(h.date||'');
    return d>=from && (!to || d<=to);
  });
}
function _prRaceStats(hist){
  const rv={T:{w:0,l:0},Z:{w:0,l:0},P:{w:0,l:0}};
  let w=0,l=0;
  (hist||[]).forEach(h=>{
    if(h.result==='승'){ w++; if(rv[h.oppRace]) rv[h.oppRace].w++; }
    else if(h.result==='패'){ l++; if(rv[h.oppRace]) rv[h.oppRace].l++; }
  });
  const tot=w+l;
  const wr = tot ? Math.round(w/tot*100) : 0;
  return {w,l,tot,wr,rv};
}

/* ─── 승률 색상 헬퍼 (강세=초록 / 균등=주황 / 약세=빨강) ─── */
function _prWrColor(wr){
  if(wr>=55) return '#16a34a';
  if(wr>=38) return '#f59e0b';
  return '#ef4444';
}
/* 색약 접근성 보완용 방향 아이콘 (초록=▲ 상승세 / 주황=▬ 균등 / 빨강=▼ 약세) */
function _prWrIcon(wr){
  if(wr>=55) return '▲';
  if(wr>=38) return '▬';
  return '▼';
}
function _prIsDarkMode(){
  try{ return document.body.classList.contains('dark'); }catch(e){ return false; }
}
/* 종족 고유 색상 (사이트 전역 rP/rT/rZ 배지와 동일 계열) — 승률과 무관하게 종족을 구분하기 위함
   다크 배경(#0f172a 계열)에서 명도가 낮아 보이는 프로토스 주황 등은 다크모드용 밝은 톤으로 대체 */
var PR_RACE_COLOR = {P:'#d97706', T:'#2563eb', Z:'#7c3aed'};
var PR_RACE_COLOR_DARK = {P:'#fbbf24', T:'#60a5fa', Z:'#c084fc'};
function _prRaceColor(r){
  return (_prIsDarkMode() ? PR_RACE_COLOR_DARK[r] : PR_RACE_COLOR[r]) || '#94a3b8';
}
/* 맵별 성적 전용 색상(초록 대신 청록 계열 사용 — 종족 배지 색과 겹치지 않도록) */
function _prMapWrColor(wr){
  const dark = _prIsDarkMode();
  if(wr>=55) return dark ? '#22d3ee' : '#0891b2';
  if(wr>=38) return dark ? '#fbbf24' : '#f59e0b';
  return dark ? '#f87171' : '#ef4444';
}
function _prGaugeCardHTML(label, w, l, icon, colorOverride, badge){
  const tot=w+l; const wr= tot? Math.round(w/tot*100):0;
  const color=colorOverride || _prWrColor(wr);
  return `<div class="pr-gauge-card${badge?' pr-gauge-card--'+badge:''}">
    <div class="pr-gauge-ring" style="--wr-target:${wr};background:conic-gradient(${color} calc(var(--wrp)*3.6deg), var(--border) 0deg)">
      <div class="pr-gauge-pct" style="color:${color}">${tot?`<span class="pr-gauge-arrow">${_prWrIcon(wr)}</span>`:''}${wr}%</div>
    </div>
    <div class="pr-gauge-lbl">${icon} ${escHTML(label)}${badge==='best'?' <span class="pr-gauge-badge pr-gauge-badge--best">최강</span>':badge==='worst'?' <span class="pr-gauge-badge pr-gauge-badge--worst">약점</span>':''}</div>
    <div class="pr-gauge-rec">${w}승 ${l}패</div>
  </div>`;
}
/* ─── 승률 게이지 카드 그룹 (전체 승률 단독) ─── */
function _prOverallGaugeHTML(stats){
  return `<div style="display:flex;justify-content:center">${_prGaugeCardHTML('전체 승률', stats.w, stats.l, '🎮')}</div>`;
}
/* 하위 호환용 (다른 곳에서 참조 시 전체+종족 게이지 그리드 · 최강/약점 종족전 배지 표시) */
function _prWinRateCardsHTML(stats){
  const RACE_LABEL={P:'프로토스전',T:'테란전',Z:'저그전'};
  const RACE_ICON={P:'🔵',T:'🔴',Z:'🟣'};
  const eligible=['P','T','Z'].map(r=>{
    const rv=stats.rv[r]; const t=rv.w+rv.l;
    return {r, tot:t, wr: t? Math.round(rv.w/t*100):0};
  }).filter(e=>e.tot>=2);
  let bestR='', worstR='';
  if(eligible.length>=2){
    const sorted=eligible.slice().sort((a,b)=>b.wr-a.wr);
    if(sorted[0].wr>sorted[sorted.length-1].wr){ bestR=sorted[0].r; worstR=sorted[sorted.length-1].r; }
  }
  let h=`<div class="pr-gauge-grid">`;
  h+=_prGaugeCardHTML('전체 승률', stats.w, stats.l, '🎮');
  h+=_prGaugeCardHTML(RACE_LABEL.P, stats.rv.P.w, stats.rv.P.l, RACE_ICON.P, _prRaceColor('P'), 'P'===bestR?'best':'P'===worstR?'worst':'');
  h+=_prGaugeCardHTML(RACE_LABEL.T, stats.rv.T.w, stats.rv.T.l, RACE_ICON.T, _prRaceColor('T'), 'T'===bestR?'best':'T'===worstR?'worst':'');
  h+=_prGaugeCardHTML(RACE_LABEL.Z, stats.rv.Z.w, stats.rv.Z.l, RACE_ICON.Z, _prRaceColor('Z'), 'Z'===bestR?'best':'Z'===worstR?'worst':'');
  h+=`</div>`;
  return h;
}
/* ─── 종족 전적 (동일 종족전 포함 · 상대 종족별 전적 바) ─── */
function _prRaceBarsHTML(stats){
  const RACE_LABEL={P:'프로토스전',T:'테란전',Z:'저그전'};
  const RACE_ICON={P:'🔵',T:'🔴',Z:'🟣'};
  let h=`<div>`;
  ['P','T','Z'].forEach(r=>{
    const rv=stats.rv[r]; const tot=rv.w+rv.l; const wr= tot? Math.round(rv.w/tot*100):0;
    const color=_prRaceColor(r);
    h+=`<div class="pr-bar-row">
      <div class="pr-bar-lbl">${RACE_ICON[r]} ${escHTML(RACE_LABEL[r])}</div>
      <div class="pr-bar-track"><div class="pr-bar-fill" style="width:${tot?Math.max(wr,10):0}%;background:${color}">${tot?_prWrIcon(wr)+' '+wr+'%':'-'}</div></div>
      <div class="pr-bar-rec"><span style="color:var(--score-win);font-weight:900">${rv.w}승</span> <span style="color:var(--score-lose);font-weight:900">${rv.l}패</span></div>
    </div>`;
  });
  h+=`</div>`;
  return h;
}
/* ─── 기본 정보 (전체 통산) ─── */
function _prInfoGridHTML(p){
  const w=p.win||0, l=p.loss||0, tot=w+l;
  const wr= tot? Math.round(w/tot*100):0;
  function card(num, lbl, color){
    return `<div class="pr-info-card"><div class="pr-info-num" style="color:${color||'var(--text1)'}">${num}</div><div class="pr-info-lbl">${escHTML(lbl)}</div></div>`;
  }
  return `<div class="pr-info-grid">
    ${card(tot+'전', '총 경기수')}
    ${card(w+'승', '승리', 'var(--score-win)')}
    ${card(l+'패', '패배', 'var(--score-lose)')}
    ${card((tot?_prWrIcon(wr)+' ':'')+wr+'%', '통산 승률', _prWrColor(wr))}
  </div>`;
}
/* ─── 맵별 성적 ─── */
function _prMapStats(hist){
  const _regMaps = (typeof maps !== 'undefined' ? maps : (window.maps||[]));
  const m={};
  (hist||[]).forEach(h=>{
    if(h.result!=='승' && h.result!=='패') return;
    const map = (h.map && h.map!=='-' && _regMaps.includes(h.map)) ? h.map : null;
    if(!map) return;
    if(!m[map]) m[map]={w:0,l:0};
    if(h.result==='승') m[map].w++; else m[map].l++;
  });
  return Object.entries(m).map(([map,r])=>{
    const tot=r.w+r.l;
    return {map, w:r.w, l:r.l, tot, wr: tot? Math.round(r.w/tot*100):0};
  }).sort((a,b)=>b.tot-a.tot);
}
/* ─── 공통 빈 상태(empty-state) 컴포넌트 ─── */
function _prEmptyStateHTML(msg, icon){
  return `<div class="pr-empty-sec"><span class="pr-empty-sec-icon">${icon||'📭'}</span><span>${escHTML(msg)}</span></div>`;
}
function _prMapBarsHTML(mapStats){
  if(!mapStats.length) return _prEmptyStateHTML('맵 기록이 없습니다');
  const MEDALS=['🥇','🥈','🥉'];
  let h=`<div>`;
  mapStats.forEach((m,i)=>{
    const color=_prMapWrColor(m.wr);
    const medal = MEDALS[i] || '';
    h+=`<div class="pr-bar-row">
      <div class="pr-bar-lbl" title="${escAttr(m.map)}">${medal?`<span style="margin-right:3px">${medal}</span>`:''}${escHTML(m.map)}</div>
      <div class="pr-bar-track"><div class="pr-bar-fill" style="width:${Math.max(m.wr,10)}%;background:${color}">${_prWrIcon(m.wr)} ${m.wr}%</div></div>
      <div class="pr-bar-rec">${m.w}승 ${m.l}패</div>
    </div>`;
  });
  h+=`</div>`;
  return h;
}
/* ─── 맵별 전적(클릭 시 최근 경기 표를 해당 맵으로 필터링) ─── */
function _prRecentMapWinLossHTML(mapStats){
  if(!mapStats.length) return _prEmptyStateHTML('맵 기록이 없습니다');
  const sel = window._prRecentMapFilter||'';
  const chip = (label, on, onclick, rec)=>`<button type="button" onclick="${onclick}"
    style="padding:6px 14px;border-radius:8px;border:2px solid ${on?'var(--blue)':'var(--border2)'};background:${on?'var(--blue-l)':'var(--white)'};font-size:var(--fs-sm);font-weight:${on?'700':'500'};color:${on?'var(--blue)':'var(--text3)'};cursor:pointer;transition:.12s">
    ${escHTML(label)}${rec?` <span style="opacity:.7">${rec}</span>`:''}
  </button>`;
  let h=`<div style="display:flex;flex-wrap:wrap;gap:6px">`;
  h+=chip('전체', !sel, "window._prRecentMapFilter='';window._prTableLimit=20;render()");
  mapStats.forEach(m=>{
    h+=chip(m.map, sel===m.map, `window._prRecentMapFilter='${escJS(m.map)}';window._prTableLimit=20;render()`, `${m.w}승 ${m.l}패`);
  });
  h+=`</div>`;
  return h;
}
/* ─── 최고 연승/연패 계산 (기간 필터 적용된 hist 기준, 무는 스킵) ─── */
function _prBestStreak(hist){
  const sorted = (hist||[]).filter(h=>h.result==='승'||h.result==='패')
    .slice().sort((a,b)=>String(a.date||'').localeCompare(String(b.date||'')));
  let curType='', curN=0, curFrom='';
  let bestWin={n:0,from:'',to:''}, bestLose={n:0,from:'',to:''};
  sorted.forEach(h=>{
    if(h.result===curType){
      curN++;
    } else {
      curType=h.result; curN=1; curFrom=h.date;
    }
    if(curType==='승' && curN>bestWin.n) bestWin={n:curN, from:curFrom, to:h.date};
    if(curType==='패' && curN>bestLose.n) bestLose={n:curN, from:curFrom, to:h.date};
  });
  return {win:bestWin, lose:bestLose};
}
/* ─── 핵심 분석 결과 (하이라이트 콜아웃) ─── */
function _prKeyInsightsHTML(stats, mapStats, histForStreak){
  const RACE_KO={T:'테란',Z:'저그',P:'프로토스'};
  const rows=[];
  const raceEntries=['T','Z','P'].map(r=>{
    const rv=stats.rv[r]; const t=rv.w+rv.l;
    return {r, w:rv.w, l:rv.l, tot:t, wr: t? Math.round(rv.w/t*100):0};
  }).filter(e=>e.tot>=2);
  if(raceEntries.length){
    const best=raceEntries.slice().sort((a,b)=>b.wr-a.wr)[0];
    const worst=raceEntries.slice().sort((a,b)=>a.wr-b.wr)[0];
    rows.push({icon:'🏆', tone:'good', html:`가장 강한 종족전: <b>${RACE_KO[best.r]}전</b> ${best.w}승 ${best.l}패 (승률 ${best.wr}%)`});
    if(worst.r!==best.r){
      rows.push({icon:'⚠️', tone:'bad', html:`가장 약한 종족전: <b>${RACE_KO[worst.r]}전</b> ${worst.w}승 ${worst.l}패 (승률 ${worst.wr}%)`});
    }
  }
  const mapsEligible = mapStats.filter(m=>m.tot>=3);
  if(mapsEligible.length){
    const bestMap = mapsEligible.slice().sort((a,b)=>b.wr-a.wr)[0];
    const worstMap = mapsEligible.slice().sort((a,b)=>a.wr-b.wr)[0];
    rows.push({icon:'🗺️', tone:'good', html:`가장 강한 맵: <b>${escHTML(bestMap.map)}</b> ${bestMap.w}승 ${bestMap.l}패 (승률 ${bestMap.wr}%)`});
    if(worstMap.map!==bestMap.map){
      rows.push({icon:'🚧', tone:'bad', html:`가장 어려운 맵: <b>${escHTML(worstMap.map)}</b> ${worstMap.w}승 ${worstMap.l}패 (승률 ${worstMap.wr}%)`});
    }
  }
  if(histForStreak && histForStreak.length){
    const streaks = _prBestStreak(histForStreak);
    if(streaks.win.n>=2){
      rows.push({icon:'🔥', tone:'good', html:`최고 연승: <b>${streaks.win.n}연승</b> (${escHTML(streaks.win.from)} ~ ${escHTML(streaks.win.to)})`});
    }
    if(streaks.lose.n>=2){
      rows.push({icon:'🥶', tone:'bad', html:`최고 연패: <b>${streaks.lose.n}연패</b> (${escHTML(streaks.lose.from)} ~ ${escHTML(streaks.lose.to)})`});
    }
  }
  if(!rows.length) return _prEmptyStateHTML('분석할 데이터가 부족합니다 (표본 부족)');
  const [featured, ...rest] = rows;
  let h = `<div class="pr-highlight-row pr-highlight-${featured.tone} pr-highlight-featured"><span class="pr-hi-icon">${featured.icon}</span><span>${featured.html}</span></div>`;
  if(rest.length) h += rest.map(r=>`<div class="pr-highlight-row pr-highlight-${r.tone}"><span class="pr-hi-icon">${r.icon}</span><span>${r.html}</span></div>`).join('');
  return h;
}

/* ─── AI 분석 코멘트 (규칙 기반) ─── */
function _prAiCommentHTML(p, histPeriod, stats, periodLabel){
  const sentences=[];
  let tone='';
  if(!stats.tot){
    sentences.push(`${p.name} 선수는 ${periodLabel} 기간 동안 기록된 경기가 없습니다.`);
  } else {
    if(stats.wr>=65) sentences.push(`${periodLabel} 승률 ${stats.wr}%(${stats.w}승 ${stats.l}패)로 컨디션이 매우 좋습니다.`);
    else if(stats.wr>=50) sentences.push(`${periodLabel} 승률 ${stats.wr}%(${stats.w}승 ${stats.l}패)로 평균 이상의 흐름을 보이고 있습니다.`);
    else if(stats.wr>=35) sentences.push(`${periodLabel} 승률 ${stats.wr}%(${stats.w}승 ${stats.l}패)로 다소 아쉬운 성적입니다.`);
    else sentences.push(`${periodLabel} 승률 ${stats.wr}%(${stats.w}승 ${stats.l}패)로 최근 고전하고 있습니다.`);

    const RACE_KO={T:'테란',Z:'저그',P:'프로토스'};
    const raceEntries=['T','Z','P'].map(r=>{
      const rv=stats.rv[r]; const t=rv.w+rv.l;
      return {r, w:rv.w, l:rv.l, tot:t, wr: t? Math.round(rv.w/t*100):null};
    }).filter(e=>e.tot>=2);
    if(raceEntries.length){
      const best=raceEntries.slice().sort((a,b)=>b.wr-a.wr)[0];
      const worst=raceEntries.slice().sort((a,b)=>a.wr-b.wr)[0];
      if(best && best.wr>=60) sentences.push(`${RACE_KO[best.r]}전에서 ${best.wr}%(${best.w}승 ${best.l}패)로 강한 모습을 보였습니다.`);
      if(worst && (!best || worst.r!==best.r) && worst.wr<=40) sentences.push(`반면 ${RACE_KO[worst.r]}전은 ${worst.wr}%(${worst.w}승 ${worst.l}패)로 약점으로 보입니다.`);
    }

    const sorted = histPeriod.slice().sort((a,b)=>String(b.date||'').localeCompare(String(a.date||'')));
    let streak=0, streakType='';
    for(const h of sorted){
      if(h.result!=='승' && h.result!=='패') continue;
      if(!streakType){ streakType=h.result; streak=1; continue; }
      if(h.result===streakType) streak++;
      else break;
    }
    if(streak>=3){
      sentences.push(streakType==='승' ? `최근 ${streak}연승 중으로 상승세를 타고 있습니다.` : `최근 ${streak}연패 중으로 반등이 필요한 시점입니다.`);
    }
    // 톤 결정: 연승/연패 흐름을 우선하고, 없으면 전체 승률로 판단
    if(streak>=3) tone = streakType==='승' ? 'pr-ai-good' : 'pr-ai-bad';
    else if(stats.wr>=55) tone = 'pr-ai-good';
    else if(stats.wr<=35) tone = 'pr-ai-bad';
  }
  return `<div class="pr-ai-box ${tone}"><div class="pr-ai-icon">🤖</div><div class="pr-ai-text">${sentences.map(s=>escHTML(s)).join(' ')}</div></div>`;
}

/* ─── 제외 필터 (미니대전/대학대전/대학CK/티어대회/일반대회) ─── */
// 일반대회 = 일반대회 소속의 일반경기(대회(일반경기)) + 조별리그 + 대진표기록(대회) 전부 포함
var PR_NORMAL_TOUR_MODES = ['대회(일반경기)','조별리그','대회'];
