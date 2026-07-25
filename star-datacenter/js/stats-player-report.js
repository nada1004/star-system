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
    '.pr-hero-wr-row{display:flex;align-items:baseline;gap:8px;margin-top:8px}',
    '.pr-hero-wr-num{font-size:30px;font-weight:950;letter-spacing:-.02em;line-height:1}',
    '.pr-hero-wr-sub{font-size:12px;font-weight:600;color:var(--text2)}',
    '.pr-hero-meta{display:flex;align-items:center;gap:7px;flex-wrap:wrap;margin-top:10px}',
    '.pr-chip{display:inline-flex;align-items:center;gap:5px;padding:4px 11px;border-radius:999px;font-size:12px;font-weight:700;white-space:nowrap}',
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
  const m={};
  (hist||[]).forEach(h=>{
    if(h.result!=='승' && h.result!=='패') return;
    const map = (h.map && h.map!=='-') ? h.map : null;
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
function _prExcludeFilter(hist){
  return (hist||[]).filter(h=>{
    if(window._prExcludeMini && h.mode==='미니대전') return false;
    if(window._prExcludeUniv && h.mode==='대학대전') return false;
    if(window._prExcludeCk && h.mode==='대학CK') return false;
    if(window._prExcludeTier && h.mode==='티어대회') return false;
    if(window._prExcludeNormalTour && PR_NORMAL_TOUR_MODES.includes(h.mode)) return false;
    return true;
  });
}
function _prExcludeTogglesHTML(){
  const opts=[
    ['_prExcludeMini','미니대전 제외'],
    ['_prExcludeUniv','대학대전 제외'],
    ['_prExcludeCk','대학CK 제외'],
    ['_prExcludeTier','티어대회 제외'],
    ['_prExcludeNormalTour','일반대회 제외 (일반·조별리그·대진표기록)'],
  ];
  return `<div class="pr-filter-bar no-export">${opts.map(([key,lbl])=>{
    const on=!!window[key];
    return `<button type="button" class="pr-filter-pill${on?' on':''}" aria-pressed="${on}" onclick="window.${key}=!window.${key};render()">${on?'✕':'🚫'} ${escHTML(lbl)}</button>`;
  }).join('')}</div>`;
}
/* ─── 전체 경기 승률 요약 (제외 필터 적용 · 전체 승률 + 종족별 승률) ─── */
function _prAllMatchesWinRateHTML(filtered){
  if(!filtered.length) return '';
  const stats = _prRaceStats(filtered);
  return `<div style="margin-bottom:14px">
    ${_prRaceBarsHTML(stats)}
  </div>`;
}
/* ─── 전체 경기 스트립 ─── */
var PR_STRIP_HIGHLIGHT_N = 8; // 최근 N경기는 항상 강조 표시, 나머지는 "더보기"로 접기
function _prStripSqHTML(hh, big){
  const isWin = hh.result==='승';
  const isDraw = hh.result==='무';
  const bg = isWin?'var(--score-win)':isDraw?'#94a3b8':'var(--score-lose)';
  const lbl = isWin?'W':isDraw?'D':'L';
  const resultKo = isWin?'승':isDraw?'무':'패';
  const tip = `${escAttr(hh.date||'-')} · ${escAttr(hh.mode||'-')}&#10;vs ${escAttr(hh.opp||'-')}&#10;${escAttr(hh.map&&hh.map!=='-'?hh.map:'맵 정보 없음')} · ${resultKo}`;
  return `<div class="pr-strip-sq${big?' pr-strip-sq--recent':''}" style="background:${bg}" data-tip="${tip}">${lbl}</div>`;
}
function _prImportantStripHTML(histAll){
  const filtered = _prExcludeFilter(histAll);
  let h = _prAllMatchesWinRateHTML(filtered);
  const sorted = filtered.slice().sort((a,b)=>String(b.date||'').localeCompare(String(a.date||'')));
  const recentDesc = sorted.slice(0,20); // 최신 → 과거
  if(!recentDesc.length) return h + _prEmptyStateHTML('표시할 경기가 없습니다');
  const highlighted = recentDesc.slice(0,PR_STRIP_HIGHLIGHT_N).reverse(); // 과거 → 최신
  const older = recentDesc.slice(PR_STRIP_HIGHLIGHT_N).reverse(); // 과거 → 최신
  const expanded = !!window._prStripExpanded;
  h+=`<div style="font-size:11px;font-weight:800;color:var(--text2);margin-bottom:6px">🔥 최근 폼 (과거 → 최신)</div>`;
  h+=`<div class="pr-strip">`;
  if(older.length){
    h+=`<div class="pr-strip-older" style="display:${expanded?'flex':'none'}">${older.map(hh=>_prStripSqHTML(hh,false)).join('')}</div>`;
  }
  h+=highlighted.map(hh=>_prStripSqHTML(hh,true)).join('');
  h+=`</div>`;
  if(older.length){
    h+=`<button type="button" class="pr-strip-toggle no-export" onclick="window._prStripExpanded=!window._prStripExpanded;render()">${expanded?'▲ 접기':`▼ 이전 ${older.length}경기 더보기`}</button>`;
  }
  h+=`<div style="font-size:10px;color:var(--text2);margin-top:6px">과거 → 최신 순 · 최근 ${highlighted.length}경기 강조 표시 (최근 ${recentDesc.length}경기 / 전체 ${filtered.length}경기 중) · 사각형에 마우스를 올리면 상세 정보가 표시됩니다</div>`;
  return h;
}

/* ─── ELO 추이 그래프 (리포트 상단 기간 필터 적용 · 최근 N경기의 ELO 변화를 선그래프로) ─── */
var PR_ELO_TREND_N = 30;
function _prEloTrendHTML(p, period){
  const periodKey = period || 'all';
  const baseHist = (typeof statsNonProHist==='function') ? statsNonProHist(p) : _statsAllHist(p);
  const histInPeriod = _prFilterHistByPeriod(baseHist, periodKey);
  const hist = histInPeriod.filter(h=>typeof h.eloDelta==='number')
    .slice().sort((a,b)=>String(b.date||'').localeCompare(String(a.date||''))); // 최신 → 과거
  if(!hist.length) return _prEmptyStateHTML(periodKey==='all' ? 'ELO 변동 기록이 없습니다' : '선택하신 기간에 ELO 변동 기록이 없습니다');
  const recent = hist.slice(0, PR_ELO_TREND_N); // 최신 → 과거
  // 현재 ELO에서 거꾸로 델타를 빼가며 각 경기 "직후" ELO를 복원
  let eloAfter = p.elo || 1200;
  const points = []; // {date, elo, result} 최신 → 과거 순으로 채운 뒤 뒤집는다
  recent.forEach(h=>{
    points.push({date:h.date, elo:eloAfter, result:h.result, opp:h.opp});
    eloAfter = eloAfter - (h.eloDelta||0);
  });
  points.push({date:'시작', elo:eloAfter, result:'', opp:''}); // 구간 시작점(가장 과거)
  points.reverse(); // 과거 → 최신
  const vals = points.map(pt=>pt.elo);
  const min = Math.min(...vals), max = Math.max(...vals);
  const span = Math.max(1, max-min);
  const W=700, H=140, PAD=16;
  const xy = points.map((pt,i)=>{
    const x = PAD + (W-PAD*2) * (points.length===1?0.5:i/(points.length-1));
    const y = H-PAD - (H-PAD*2) * ((pt.elo-min)/span);
    return {...pt, x, y};
  });
  const pts = xy.map(pt=>`${pt.x.toFixed(1)},${pt.y.toFixed(1)}`).join(' ');
  const first = points[0], last = points[points.length-1];
  const delta = Math.round(last.elo - first.elo);
  const deltaColor = delta>0 ? 'var(--score-win)' : delta<0 ? 'var(--score-lose)' : 'var(--text2)';
  const dots = xy.map((pt,i)=>{
    const isLast = i===xy.length-1;
    const c = pt.result==='승'?'var(--score-win)':pt.result==='패'?'var(--score-lose)':'#94a3b8';
    const tip = pt.date==='시작' ? '구간 시작' : `${pt.date} · vs ${pt.opp||'-'} · ${pt.result} · ELO ${Math.round(pt.elo)}`;
    return `<circle cx="${pt.x.toFixed(1)}" cy="${pt.y.toFixed(1)}" r="${isLast?4.5:2.6}" fill="${c}" stroke="${isLast?'var(--white)':'none'}" stroke-width="${isLast?2:0}" class="pr-elo-dot"><title>${escHTML(tip)}</title></circle>`;
  }).join('');
  // 이 구간이 언제인지 감이 오도록 x축에 실제 날짜 눈금을 몇 개 표시
  const realPts = xy.slice(1);
  let tickHTML = '';
  if(realPts.length){
    const n = realPts.length;
    const count = Math.min(4, n);
    const idxs = [...new Set(Array.from({length:count}, (_,k)=> count===1?0:Math.round(k*(n-1)/(count-1))))];
    tickHTML = idxs.map(idx=>{
      const pt = realPts[idx];
      const d = String(pt.date||'').slice(5).replace('-','/');
      return `<div class="pr-elo-tick" style="left:${(pt.x/W*100).toFixed(1)}%">${escHTML(d)}</div>`;
    }).join('');
  }
  return `<div>
    <div style="display:flex;align-items:baseline;gap:10px;flex-wrap:wrap;margin-bottom:8px">
      <span style="font-size:22px;font-weight:950">${Math.round(last.elo)}</span>
      <span style="font-size:13px;font-weight:800;color:${deltaColor}">${delta>0?'▲ +':delta<0?'▼ ':'– '}${Math.abs(delta)}</span>
      <span style="font-size:11px;color:var(--text2);font-weight:700">최근 ${recent.length}경기 기준 (${escHTML(first.date)} → ${escHTML(last.date)})</span>
    </div>
    <div class="pr-elo-chart-wrap">
      <svg viewBox="0 0 ${W} ${H}" class="pr-elo-svg" preserveAspectRatio="none">
        <line x1="${PAD}" y1="${H-PAD}" x2="${W-PAD}" y2="${H-PAD}" stroke="var(--border)" stroke-width="1"/>
        <polyline fill="none" stroke="var(--blue)" stroke-width="2.4" points="${pts}" stroke-linejoin="round" stroke-linecap="round"/>
        ${dots}
      </svg>
      <div class="pr-elo-axis">${tickHTML}</div>
    </div>
    <div style="font-size:10px;color:var(--text2);margin-top:4px">점에 마우스를 올리면 해당 경기 정보가 표시됩니다 · 최소 ${Math.round(min)} ~ 최대 ${Math.round(max)}</div>
  </div>`;
}
/* 월별 승률 전용 색상 — 사이트 전체에서 쓰는 승(빨강)/패(파랑) 색 규칙과 통일 */
function _prMonthlyWrColor(wr){
  return wr>=50 ? 'var(--score-win)' : 'var(--score-lose)';
}
/* YYYY-MM 문자열에 개월수를 더하고 정규화 (연 경계 처리) */
function _prShiftYm(ym, delta){
  const parts = String(ym).split('-');
  let y = Number(parts[0]), m = Number(parts[1]) + delta;
  while(m<1){ m+=12; y--; }
  while(m>12){ m-=12; y++; }
  return `${y}-${String(m).padStart(2,'0')}`;
}
/* ─── 월별 승률 미니 차트 (승/패 숫자 항상 표시, 전체 기록 기준) ─── */
var PR_MONTHLY_TREND_N = 12;
function _prMonthlyTrendHTML(p){
  const hist = _statsAllHist(p).filter(h=>h.result==='승'||h.result==='패');
  if(!hist.length) return _prEmptyStateHTML('월별 기록이 없습니다');
  const byMonth = {};
  let minYm='', maxYm='';
  hist.forEach(h=>{
    const ym = String(h.date||'').slice(0,7); // YYYY-MM
    if(!ym || ym.length!==7) return;
    if(!byMonth[ym]) byMonth[ym]={w:0,l:0};
    if(h.result==='승') byMonth[ym].w++; else byMonth[ym].l++;
    if(!minYm || ym<minYm) minYm=ym;
    if(!maxYm || ym>maxYm) maxYm=ym;
  });
  if(!maxYm) return _prEmptyStateHTML('월별 기록이 없습니다');
  // 실제 기록이 있는 첫 달~마지막 달 사이를 빈 달 없이 연속으로 채운 뒤, 최근 N개월만 사용
  // (기록 없는 달을 건너뛰면 막대 간격이 실제 시간 간격과 어긋나 보이는 문제 수정)
  const allMonths = [];
  for(let ym=minYm; ym<=maxYm; ym=_prShiftYm(ym,1)) allMonths.push(ym);
  const monthKeys = allMonths.slice(-PR_MONTHLY_TREND_N);
  const recs = monthKeys.map(ym=>{
    const rec = byMonth[ym] || {w:0,l:0};
    const tot = rec.w+rec.l;
    const wr = tot? Math.round(rec.w/tot*100):0;
    return {ym, w:rec.w, l:rec.l, tot, wr};
  });
  const totW = recs.reduce((s,r)=>s+r.w,0), totL = recs.reduce((s,r)=>s+r.l,0);
  const avgWr = (totW+totL) ? Math.round(totW/(totW+totL)*100) : 0;
  // 추세: 앞 절반 대비 뒤 절반 평균 승률 비교 (데이터가 2개월 이상일 때만 표시)
  let trendHTML = '';
  if(recs.length>=2){
    const half = Math.floor(recs.length/2);
    const older = recs.slice(0,half), newer = recs.slice(half);
    const oW=older.reduce((s,r)=>s+r.w,0), oT=older.reduce((s,r)=>s+r.tot,0);
    const nW=newer.reduce((s,r)=>s+r.w,0), nT=newer.reduce((s,r)=>s+r.tot,0);
    if(oT>0 && nT>0){
      const diff = Math.round(nW/nT*100) - Math.round(oW/oT*100);
      const icon = diff>3?'📈':diff<-3?'📉':'➖';
      const txt = diff>3?`상승세 (${diff>0?'+':''}${diff}%p)`:diff<-3?`하락세 (${diff}%p)`:'안정적 흐름';
      trendHTML = `<span class="pr-mtrend-summary-trend">${icon} ${txt}</span>`;
    }
  }
  /* ── 라인(추이) 차트 렌더 ── */
  const uColor = (typeof gc==='function') ? gc(p.univ||'') : '#6366f1';
  const lineColor = uColor;
  const pctColor = (typeof univTextColor==='function') ? univTextColor(p.univ||'') : uColor;
  const n = recs.length;
  const COL = 62;              // 달 하나가 차지하는 폭(px) — 라벨 줄과 정확히 맞춰 스크롤되도록 고정폭 사용
  const totalW = Math.max(n*COL, COL);
  const H = 168, PADTOP = 34, PADBOTTOM = 18;
  const chartH = H - PADTOP - PADBOTTOM;
  const xFor = i => i*COL + COL/2;
  const yFor = wr => PADTOP + (100-wr)/100*chartH;
  const baseY = H - PADBOTTOM;
  const pts = recs.map((r,i)=>({...r, x:xFor(i), y:r.tot>0?yFor(r.wr):baseY, hasData:r.tot>0}));
  // 기록 없는 달에서는 선을 끊어 그림(데이터 없는 구간을 이어붙이면 오해의 소지가 있음)
  const segs = [];
  let cur = [];
  pts.forEach(pt=>{ if(pt.hasData){ cur.push(pt); } else if(cur.length){ segs.push(cur); cur=[]; } });
  if(cur.length) segs.push(cur);
  const gridHTML = [0,50,100].map(v=>{
    const y = yFor(v);
    return `<line x1="0" y1="${y.toFixed(1)}" x2="${totalW}" y2="${y.toFixed(1)}" stroke="var(--border)" stroke-width="1" stroke-dasharray="${v===0?'0':'3,4'}"/>
      <text x="2" y="${(y-4).toFixed(1)}" font-size="9" font-weight="700" fill="var(--text2)">${v}%</text>`;
  }).join('');
  const areaHTML = segs.map(seg=>{
    if(seg.length<2) return '';
    const path = `M${seg[0].x.toFixed(1)},${baseY} ` + seg.map(p=>`L${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ') + ` L${seg[seg.length-1].x.toFixed(1)},${baseY} Z`;
    return `<path d="${path}" fill="${lineColor}" fill-opacity="0.16" stroke="none"/>`;
  }).join('');
  const lineHTML = segs.map(seg=>{
    const points = seg.map(p=>`${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
    return `<polyline points="${points}" fill="none" stroke="${lineColor}" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"/>`;
  }).join('');
  const dotsHTML = pts.map((pt,i)=>{
    if(!pt.hasData) return `<circle cx="${pt.x.toFixed(1)}" cy="${baseY}" r="2.5" fill="var(--border2)"/>`;
    const dotColor = _prMonthlyWrColor(pt.wr);
    const tip = `${pt.ym} · 승률 ${pt.wr}% (${pt.w}승 ${pt.l}패)`;
    return `<text x="${pt.x.toFixed(1)}" y="${(pt.y-11).toFixed(1)}" text-anchor="middle" font-size="11.5" font-weight="950" fill="${pctColor}">${pt.wr}%</text>
      <circle cx="${pt.x.toFixed(1)}" cy="${pt.y.toFixed(1)}" r="3.6" fill="${dotColor}" stroke="var(--white)" stroke-width="1.6"><title>${escHTML(tip)}</title></circle>`;
  }).join('');
  const labelsHTML = recs.map((r,i)=>{
    const hasData = r.tot>0;
    const isNow = i===recs.length-1;
    const mLbl = r.ym.slice(5,7)+'월';
    const recHTML = hasData
      ? `<span style="color:var(--score-win)">${r.w}승</span> <span style="color:var(--score-lose)">${r.l}패</span>`
      : '-';
    return `<div class="pr-mtrend-lcol${isNow?' pr-mtrend-lcol--now':''}${hasData?'':' pr-mtrend-col--empty'}" style="width:${COL}px">
      <div class="pr-mtrend-rec">${recHTML}</div>
      <div class="pr-mtrend-lbl">${mLbl}</div>
    </div>`;
  }).join('');
  return `<div>
    <div class="pr-mtrend-summary"><span class="pr-mtrend-summary-avg">최근 ${recs.length}개월 평균 승률 <b>${avgWr}%</b></span>${trendHTML}</div>
    <div class="pr-mtrend-linewrap">
      <div style="width:${totalW}px">
        <svg viewBox="0 0 ${totalW} ${H}" width="${totalW}" height="${H}" class="pr-mtrend-svg">
          ${gridHTML}${areaHTML}${lineHTML}${dotsHTML}
        </svg>
        <div class="pr-mtrend-lrow">${labelsHTML}</div>
      </div>
    </div>
  </div>`;
}
/* ─── 대회/모드별 성적 요약 (전체 기록 기준, 승/패가 기록된 경기만) ─── */
function _prModeStatsHTML(p){
  const hist = _statsAllHist(p).filter(h=>(h.result==='승'||h.result==='패') && (typeof _pdNormalizeRecentModeLabel!=='function' || _pdNormalizeRecentModeLabel(h.mode)!=='시빌워'));
  if(!hist.length) return _prEmptyStateHTML('모드별 기록이 없습니다');
  const colors = (typeof _pdRecentModeColors==='function') ? _pdRecentModeColors() : {};
  const byMode = {};
  hist.forEach(h=>{
    let lbl = (typeof _pdNormalizeRecentModeLabel==='function') ? (_pdNormalizeRecentModeLabel(h.mode)||'기타') : (h.mode||'기타');
    /* 프로리그 대회의 끝장전 세션은 조별리그/대진표와 같은 '프로리그대회' 기록으로 합쳐서 집계
       (그렇지 않으면 소수 경기만 남아 별도 칩으로 쪼개져 눈에 잘 안 띔) */
    if(lbl==='프로리그대회끝장전') lbl='프로리그대회';
    if(!byMode[lbl]) byMode[lbl]={w:0,l:0};
    if(h.result==='승') byMode[lbl].w++; else byMode[lbl].l++;
  });
  /* 🎮 이스포츠 카드(MATCH RECORD)와 동일한 우선순위로 정렬해 두 곳이 같은 순서로 보이게 함 */
  const MODE_ORDER = (typeof PR_CARD_MODE_ORDER!=='undefined') ? PR_CARD_MODE_ORDER : ['프로리그','프로리그대회','미니대전','대학대전','대학CK','티어대회','대회','끝장전'];
  const rows = Object.entries(byMode).map(([mode,rec])=>{
    const tot=rec.w+rec.l; const wr = tot? Math.round(rec.w/tot*100):0;
    return {mode, ...rec, tot, wr};
  }).sort((a,b)=>{
    const ia=MODE_ORDER.indexOf(a.mode), ib=MODE_ORDER.indexOf(b.mode);
    if(ia>=0 && ib>=0) return ia-ib;
    if(ia>=0) return -1;
    if(ib>=0) return 1;
    return b.tot-a.tot;
  });
  /* 🎮 이스포츠 리포트 카드(MATCH RECORD)와 통일감을 주기 위해 막대그래프 대신
     대학 컬러 악센트 + 큰 승률 숫자의 칩 카드 그리드로 노출 */
  let h=`<div class="pr-mode-chip-grid">`;
  rows.forEach(r=>{
    const color = colors[r.mode] || _prWrColor(r.wr);
    h+=`<div class="pr-mode-chip" style="background:${_prHexToRgba(color,.08)};border:1px solid ${_prHexToRgba(color,.25)}">
      <div style="background:${color}" class="pr-mode-chip-accent"></div>
      <div class="pr-mode-chip-lbl" style="color:${color}" title="${escAttr(r.mode)}">${escHTML(r.mode)}</div>
      <div class="pr-mode-chip-row">
        <div class="pr-mode-chip-pct">${r.wr}%</div>
        <div class="pr-mode-chip-rec"><span style="color:var(--score-win);font-weight:900">${r.w}승</span> <span style="color:var(--score-lose);font-weight:900">${r.l}패</span></div>
      </div>
    </div>`;
  });
  h+=`</div>`;
  return h;
}

/* ─── 동일 티어 상대전적 (최근 90일) ─── */
var PR_TIER_OPP_SHOW_N = 6; // 상위 N명만 우선 표시, 나머지는 "더보기"로 펼침
if(window._prTierOppExpanded===undefined) window._prTierOppExpanded = false;
function _prToggleTierOpp(){
  window._prTierOppExpanded = !window._prTierOppExpanded;
  if(typeof render==='function') render();
}
function _prTierOpponentRowHTML(r){
  return `<div class="pr-tier-opp-row">
      ${getPlayerPhotoHTML(r.name,'34px')}
      <span class="rbadge r${r.race||''}" style="font-size:10px">${r.race||''}</span>
      <span style="font-weight:800;color:var(--blue);cursor:pointer" onclick="openPlayerModal('${escJS(r.name)}')">${escHTML(r.name)}</span>
      <span style="font-weight:900"><span style="color:var(--score-win)">${r.w}승</span> <span style="color:var(--score-lose)">${r.l}패</span></span>
      <button class="pr-btn" style="padding:5px 10px;font-size:11px;margin-left:auto" onclick="openPlayerModal('${escJS(r.name)}')">👤 상세프로필</button>
    </div>`;
}
/* ─── 티어 대비 성과 지수 (전체 기록 기준 · 상위/동일/하위 티어 상대 승률 비교) ─── */
function _prTierPerfIndexHTML(p){
  const tiersList = (typeof TIERS!=='undefined' && Array.isArray(TIERS) && TIERS.length) ? TIERS
    : ['G','K','JA','J','S','0티어','1티어','2티어','3티어','4티어','5티어','6티어','7티어','8티어','유스','미정'];
  const myIdx = tiersList.indexOf(p.tier);
  if(myIdx<0) return '';
  const hist = _statsAllHist(p).filter(h=>h.result==='승'||h.result==='패');
  const buckets = {up:{w:0,l:0}, same:{w:0,l:0}, down:{w:0,l:0}};
  hist.forEach(h=>{
    const oppP = (players||[]).find(x=>x && x.name===h.opp);
    if(!oppP) return;
    const oppIdx = tiersList.indexOf(oppP.tier);
    if(oppIdx<0) return;
    const key = oppIdx<myIdx ? 'up' : oppIdx>myIdx ? 'down' : 'same';
    if(h.result==='승') buckets[key].w++; else buckets[key].l++;
  });
  const card = (lbl, icon, rec)=>{
    const tot=rec.w+rec.l; const wr = tot? Math.round(rec.w/tot*100):null;
    return `<div class="pr-info-card"><div class="pr-info-num" style="color:${wr==null?'var(--text2)':_prWrColor(wr)}">${wr==null?'-':wr+'%'}</div><div class="pr-info-lbl">${icon} ${lbl}${tot?` (${rec.w}승 ${rec.l}패)`:' (기록 없음)'}</div></div>`;
  };
  const upWr = buckets.up.w+buckets.up.l ? Math.round(buckets.up.w/(buckets.up.w+buckets.up.l)*100) : null;
  let note = '';
  if(upWr!=null && (buckets.up.w+buckets.up.l)>=3 && upWr>=45){
    note = `<div class="pr-mtrend-note">🔥 상위 티어 상대로도 <b>${upWr}%</b> 승률 — 자이언트 킬러형 기록입니다</div>`;
  }
  return `<div style="margin-bottom:14px">
    <div class="pr-info-grid">
      ${card('상위 티어 상대', '🔼', buckets.up)}
      ${card('동일 티어 상대', '➖', buckets.same)}
      ${card('하위 티어 상대', '🔽', buckets.down)}
    </div>
    ${note}
  </div>`;
}
function _prTierOpponentsHTML(p){
  const perfIndexHTML = _prTierPerfIndexHTML(p);
  const hist90 = _prFilterHistByPeriod(_statsAllHist(p), '90');
  const myTier = p.tier;
  const map = {};
  hist90.forEach(h=>{
    const oppP = (players||[]).find(x=>x && x.name===h.opp);
    if(!oppP || oppP.tier!==myTier) return;
    if(!map[h.opp]) map[h.opp]={w:0,l:0,race:h.oppRace||oppP.race||''};
    if(h.result==='승') map[h.opp].w++;
    else if(h.result==='패') map[h.opp].l++;
  });
  const rows = Object.entries(map).map(([name,rec])=>({name,...rec,tot:rec.w+rec.l}))
    .filter(r=>r.tot>0)
    .sort((a,b)=>b.tot-a.tot);
  if(!rows.length) return perfIndexHTML + _prEmptyStateHTML('최근 90일 내 동일 티어 상대전적이 없습니다');
  const expanded = !!window._prTierOppExpanded;
  const shown = expanded ? rows : rows.slice(0, PR_TIER_OPP_SHOW_N);
  const rest = rows.length - shown.length;
  let h=perfIndexHTML + `<div style="border:1px solid var(--border);border-radius:var(--r2);overflow:hidden">`;
  h += shown.map(_prTierOpponentRowHTML).join('');
  h+=`</div>`;
  if(rows.length > PR_TIER_OPP_SHOW_N){
    h += `<button type="button" class="pr-strip-toggle no-export" style="margin-top:8px" onclick="_prToggleTierOpp()">${expanded?'▲ 접기':`▼ 상대 ${rest}명 더보기`}</button>`;
  }
  return h;
}

/* ─── 1:1 상대 비교 + 규칙 기반 승부 예측 (ELO 표준 공식) ─── */
function _prOpponentList(p){
  const set=new Set();
  _statsAllHist(p).forEach(h=>{ if(h.opp) set.add(h.opp); });
  return [...set].sort((a,b)=>a.localeCompare(b,'ko'));
}
function _prHeadToHead(hist, oppName){
  let w=0,l=0;
  (hist||[]).forEach(h=>{ if(h.opp!==oppName) return; if(h.result==='승') w++; else if(h.result==='패') l++; });
  return {w,l,tot:w+l};
}
function _prVsCompareHTML(p){
  const opts = _prOpponentList(p);
  if(!opts.length) return _prEmptyStateHTML('비교할 상대 전적이 없습니다');
  const cur = (window._prVsOpp && opts.includes(window._prVsOpp)) ? window._prVsOpp : opts[0];
  window._prVsOpp = cur;
  const oppP = (players||[]).find(x=>x&&x.name===cur);
  const all = _statsAllHist(p);
  const h2h90 = _prHeadToHead(_prFilterHistByPeriod(all,'90'), cur);
  const h2hAll = _prHeadToHead(all, cur);
  const myElo = p.elo||1200, oppElo = (oppP&&oppP.elo)||1200;
  const predictMe = Math.max(1,Math.min(99,Math.round(100/(1+Math.pow(10,(oppElo-myElo)/400)))));
  let h=`<div>
    <select class="pr-vs-select" onchange="window._prVsOpp=this.value;render()">
      ${opts.map(n=>`<option value="${escAttr(n)}" ${n===cur?'selected':''}>${escHTML(n)}</option>`).join('')}
    </select>
    <div class="pr-vs-box">
      <div class="pr-vs-side">
        ${getPlayerPhotoHTML(p.name,'92px')}
        <div style="font-weight:900;margin-top:8px;font-size:14px">${escHTML(p.name)}</div>
      </div>
      <div style="text-align:center">
        <div style="font-size:11px;color:var(--text2);font-weight:900">최근 90일</div>
        <div style="font-size:20px;font-weight:950">${h2h90.w}-${h2h90.l}</div>
        <div style="font-size:11px;color:var(--text2);font-weight:900;margin-top:8px">전체</div>
        <div style="font-size:20px;font-weight:950">${h2hAll.w}-${h2hAll.l}</div>
      </div>
      <div class="pr-vs-side">
        ${getPlayerPhotoHTML(cur,'92px')}
        <div style="font-weight:900;margin-top:8px;font-size:14px;color:var(--blue);cursor:pointer" onclick="openPlayerModal('${escJS(cur)}')">${escHTML(cur)}</div>
      </div>
    </div>
    <div style="padding:0 4px">
      <div style="font-size:11px;font-weight:800;color:var(--text2);margin-bottom:4px">🤖 ELO 기반 승부 예상 (규칙 기반 추정치 · 참고용)</div>
      <div class="pr-predict-bar">
        <div style="width:${predictMe}%;background:#dc2626;display:flex;align-items:center;justify-content:center;color:#fff;font-size:11px;font-weight:800">${predictMe}%</div>
        <div style="width:${100-predictMe}%;background:#2563eb;display:flex;align-items:center;justify-content:center;color:#fff;font-size:11px;font-weight:800">${100-predictMe}%</div>
      </div>
    </div>
  </div>`;
  return h;
}

/* ─── 최근 경기 표 (기존 렌더 함수 재사용 · 읽기 전용) ─── */
function _prRecentTableHTML(p){
  const hist = _statsAllHist(p).slice().sort((a,b)=>String(b.date||'').localeCompare(String(a.date||'')));
  const filtered = _prExcludeFilter(hist);
  const shown = filtered.slice(0, window._prTableLimit||20);
  if(!shown.length) return _prEmptyStateHTML('경기 기록이 없습니다');
  let h=`<div class="pr-recent-table" style="border:1px solid var(--border);border-radius:var(--r);overflow:hidden">
    <table style="margin:0;border:none;width:100%"><thead><tr><th>날짜</th><th>종류</th><th>결과</th><th>상대</th><th>종족</th><th class="ph-col-map">맵</th><th class="ph-col-elo">ELO</th></tr></thead><tbody>`;
  shown.forEach(hh=>{
    h += (typeof buildPlayerRecentHistoryRowHTML==='function')
      ? buildPlayerRecentHistoryRowHTML({ hh, hi:-1, pName:p.name, isLoggedIn:false, canEditByDate:false, bulkMode:false, bulkSelectedSet:null })
      : '';
  });
  h+=`</tbody></table></div>`;
  if(filtered.length>shown.length){
    h+=`<div style="text-align:center;padding:10px"><button class="btn btn-w btn-xs" onclick="window._prTableLimit=(window._prTableLimit||20)+20;render()">▼ 더보기 (${filtered.length-shown.length}건)</button></div>`;
  }
  return h;
}

/* ─── 티어 내 순위 ─── */
function _prTierRank(p){
  const sameTier = (players||[]).filter(x=>x && x.tier===p.tier && !x.hideFromBoard);
  const scored = sameTier.map(x=>{
    const t=(x.win||0)+(x.loss||0);
    const wr = t? (x.win||0)/t : 0;
    return {name:x.name, wr, elo:x.elo||1200};
  }).sort((a,b)=> b.elo-a.elo || b.wr-a.wr);
  const idx = scored.findIndex(x=>x.name===p.name);
  return { rank: idx>=0?idx+1:null, total: scored.length };
}

/* ─── 상단 프로필 히어로 ─── */
function _prHeroHTML(p){
  const RACE_KO={T:'테란',Z:'저그',P:'프로토스',N:'무종족'};
  const rankInfo=_prTierRank(p);
  const eloBoardUrl = `https://eloboard.com/?s=${encodeURIComponent(p.name)}`;
  const heroW=p.win||0, heroL=p.loss||0, heroTot=heroW+heroL;
  const heroWr = heroTot? Math.round(heroW/heroTot*100):0;
  const heroWrColor = _prWrColor(heroWr);
  return `<div class="pr-hero">
    <div class="pr-hero-photo" style="box-shadow:0 0 0 3px var(--white),var(--sh2)" onclick="openPlayerModal('${escJS(p.name)}')" title="상세 프로필 보기">${getPlayerPhotoHTML(p.name,'124px','object-fit:cover;object-position:center;')}</div>
    <div style="flex:1;min-width:200px">
      <div class="pr-hero-name">${escHTML(p.name)} <span class="rbadge r${p.race||''}">${RACE_KO[p.race]||p.race||''}</span></div>
      <div class="pr-hero-wr-row">
        <span class="pr-hero-wr-num" style="color:${heroWrColor}">${heroTot?`${heroWr}%`:'-%'}</span>
        <span class="pr-hero-wr-sub">${_prWrIcon(heroWr)} 승률 (${heroW}승 ${heroL}패)</span>
      </div>
      <div class="pr-hero-meta">
        ${(()=>{
          const uName = p.univ||'';
          const uColor = (typeof gc==='function') ? gc(uName) : '#6b7280';
          const uIcon = (typeof gUI==='function') ? gUI(uName,'1.05em') : '';
          return `<span class="pr-chip" style="cursor:pointer;background:${uColor};color:#fff;border-color:${uColor}" onclick="if(typeof openUnivModal==='function')openUnivModal('${escJS(uName)}')">${uIcon}${escHTML(uName||'-')}</span>`;
        })()}
        ${(()=>{
          const tier = p.tier;
          const ic = (typeof _TIER_ICON!=='undefined' && _TIER_ICON[tier]) || '';
          const bg = (typeof getTierBtnColor==='function') ? (getTierBtnColor(tier)||'#64748b') : '#64748b';
          const col = (typeof getTierBtnTextColor==='function') ? (getTierBtnTextColor(tier)||'#fff') : '#fff';
          const rankTxt = rankInfo.rank ? ` · ${rankInfo.rank}위/${rankInfo.total}명` : '';
          return `<span class="pr-chip" style="background:${bg};color:${col};gap:4px">${ic?ic+' ':''}${escHTML(tier||'-')}${rankTxt}</span>`;
        })()}
        <span class="pr-chip pr-chip-neutral">ELO ${p.elo||1200}</span>
      </div>
    </div>
    <div class="pr-hero-actions no-export">
      <button class="pr-btn pr-btn-primary" onclick="openPlayerModal('${escJS(p.name)}')">👤 상세 프로필</button>
      <a class="pr-btn pr-btn-ghost pr-btn-iconOnly" href="${eloBoardUrl}" target="_blank" rel="noopener" title="ELO 보드">📡<span>ELO 보드</span></a>
      <button class="pr-btn pr-btn-ghost pr-btn-iconOnly" title="리포트 이미지 저장" onclick="_prSaveReportImage()">📸<span>리포트 이미지 저장</span></button>
    </div>
  </div>`;
}

/* ─── 검색 ─── */
function _prOnSearchInput(val){
  const drop = document.getElementById('pr-search-drop');
  if(!drop) return;
  const q = String(val||'').trim().toLowerCase();
  if(!q){ drop.style.display='none'; return; }
  const list = (players||[]).filter(p=>p && p.name && p.name.toLowerCase().includes(q)).slice(0,12);
  if(!list.length){
    drop.innerHTML = `<div style="padding:14px;text-align:center;color:var(--text2);font-size:12px">검색 결과가 없습니다</div>`;
    drop.style.display='block';
    return;
  }
  drop.innerHTML = list.map(p=>{
    const tot=(p.win||0)+(p.loss||0);
    const wr = tot? Math.round((p.win||0)/tot*100):0;
    return `<div class="pr-search-row" onclick="_prSelectPlayer('${escJS(p.name)}')">
      ${getPlayerPhotoHTML(p.name,'36px')}
      <div style="flex:1;min-width:0">
        <div style="font-weight:800;font-size:13px">${escHTML(p.name)}</div>
        <div style="font-size:11px;color:var(--text2)">${escHTML(p.tier||'-')} · ${escHTML(p.univ||'-')}</div>
      </div>
      <div style="font-size:12px;font-weight:800;color:${wr>=50?'var(--red)':'var(--text2)'}">${tot?_prWrIcon(wr)+' ':''}${wr}%</div>
    </div>`;
  }).join('');
  drop.style.display='block';
}
function _prSelectPlayer(name){
  window._prName = name;
  window._prVsOpp = '';
  window._prTableLimit = 20;
  _prSaveRecent(name);
  render();
}
function _prApplySearch(val){
  const raw = String(val||'').trim();
  if(!raw) return false;
  const cands = (players||[]).filter(p=>p && p.name);
  const exact = cands.find(p=>String(p.name).trim()===raw);
  const partial = cands.filter(p=>String(p.name).toLowerCase().includes(raw.toLowerCase()));
  const hit = exact || (partial.length ? partial[0] : null);
  if(!hit) return false;
  _prSelectPlayer(hit.name);
  return true;
}
if(!window._prDocClickBound){
  window._prDocClickBound = true;
  document.addEventListener('click', (e)=>{
    const wrap = document.querySelector('.pr-search-wrap');
    const drop = document.getElementById('pr-search-drop');
    if(!wrap || !drop) return;
    if(!wrap.contains(e.target)) drop.style.display='none';
  });
}

/* ─── 메인 엔트리 ─── */
function statsPlayerReportHTML(){
  let h = `<div class="ssec">
    <div class="stats-chart-toolbar" style="margin-bottom:14px">
      <div>
        <h4 style="margin:0">📺 스트리머 리포트</h4>
        <div style="font-size:11px;color:var(--text2);margin-top:4px">스트리머를 검색하면 통산 전적, 종족·맵별 승률, ELO 추이, 월별 승률, 대회·모드별 성적, 동일 티어 상대전적, 1:1 비교까지 한 번에 볼 수 있습니다. 위쪽 필터(기간/최근N경기)를 적용하면 이 리포트에도 함께 반영됩니다.</div>
      </div>
    </div>
    <div class="pr-search-wrap">
      <input id="pr-search-input" class="pr-search-input" type="text" placeholder="🔍 스트리머 이름으로 검색..." value=""
        oninput="_prOnSearchInput(this.value)" onkeydown="if(event.key==='Enter'){_prApplySearch(this.value);}" autocomplete="off">
      <div id="pr-search-drop" class="pr-search-drop" style="display:none"></div>
    </div>`;

  const recent = _prLoadRecent().filter(n=>n!==window._prName);
  if(recent.length){
    h += `<div class="pr-recent-wrap">
      <span class="pr-recent-lbl">🕘 최근 검색</span>
      ${recent.map(n=>`<span class="pr-recent-chip" onclick="_prSelectPlayer('${escJS(n)}')">${escHTML(n)}</span>`).join('')}
    </div>`;
  }
  h += `</div>`;

  const p = window._prName ? (players||[]).find(x=>x && x.name===window._prName) : null;
  if(!p){
    h += `<div class="pr-empty"><div style="font-size:40px;margin-bottom:10px">🔍</div>스트리머를 검색해서 리포트를 확인해보세요</div>`;
    return h;
  }

  const period = window._prPeriod || 'all';
  const periodLabelMap = {'30':'최근 30일','90':'최근 90일','season':'올해','all':'전체'};
  // 상단 통계 필터(기간/최근N경기)를 먼저 적용한 뒤, 리포트 자체 기간 버튼으로 한 번 더 좁힌다
  const histGlobal = (typeof statsNonProHist==='function') ? statsNonProHist(p) : _statsAllHist(p);
  const histAll = _statsAllHist(p); // 전체 경기 스트립/최근 경기표는 전역 필터와 별개로 항상 전체 기록 기준
  const histPeriod = _prFilterHistByPeriod(histGlobal, period);
  const stats = _prRaceStats(histPeriod);
  const mapStats = _prMapStats(histPeriod);

  h += `<div id="pr-report-capture">`;
  h += _prHeroHTML(p);

  h += _prSectionNavHTML();

  h += `<div class="ssec" id="pr-sec-info"><div class="pr-sec-head"><h4>📋 기본 정보</h4></div>${_prInfoGridHTML(p)}</div>`;

  h += `<div class="pr-period-bar">
    ${['30','90','season','all'].map(pk=>`<button class="pr-period-btn ${period===pk?'on':''}" onclick="window._prPeriod='${pk}';render()">${periodLabelMap[pk]}</button>`).join('')}
  </div>`;
  h += `<div class="pr-period-scope-note">⏱️ 이 기간 필터는 아래 <b>승률 요약 · 맵별 성적 · 핵심 분석 · ELO 추이</b> 4개 섹션에 적용됩니다</div>`;

  h += `<div class="ssec" id="pr-sec-winrate"><div class="pr-sec-head"><h4>🎮 ${periodLabelMap[period]} 전체 승률</h4></div>${_prWinRateCardsHTML(stats)}</div>`;

  h += `<div class="ssec" id="pr-sec-map"><div class="pr-sec-head"><h4>🗺️ ${periodLabelMap[period]} 맵별 성적</h4></div>${_prMapBarsHTML(mapStats)}</div>`;

  h += `<div class="ssec" id="pr-sec-insights"><div class="pr-sec-head"><h4>📈 핵심 분석 &amp; AI 코멘트 <span class="pr-sec-sub">(${periodLabelMap[period]})</span></h4></div>${_prKeyInsightsHTML(stats, mapStats, histPeriod)}<div style="margin-top:10px">${_prAiCommentHTML(p, histPeriod, stats, periodLabelMap[period])}</div></div>`;

  h += `<div class="ssec" id="pr-sec-elo"><div class="pr-sec-head"><h4>📉 ELO 추이 <span class="pr-sec-sub">(${periodLabelMap[period]})</span></h4></div>${_prEloTrendHTML(p, period)}</div>`;

  h += `<div class="ssec" id="pr-sec-monthly"><div class="pr-sec-head"><h4>📅 월별 승률 <span class="pr-sec-sub">(전체 기록 기준)</span></h4></div>${_prMonthlyTrendHTML(p)}</div>`;

  h += `<div class="ssec" id="pr-sec-allmatches">
    <div class="pr-sec-head"><h4>📋 전체 경기</h4></div>
    <div style="margin-bottom:10px">${_prExcludeTogglesHTML()}</div>
    ${_prImportantStripHTML(histAll)}
  </div>`;

  h += `<div class="ssec" id="pr-sec-modes"><div class="pr-sec-head"><h4>🏆 대회·모드별 성적 <span class="pr-sec-sub">(전체 기록 기준)</span></h4></div>${_prModeStatsHTML(p)}</div>`;

  h += `<div class="ssec" id="pr-sec-tier"><div class="pr-sec-head"><h4>🎯 티어 성과 &amp; 동일 티어 상대전적</h4></div>${_prTierOpponentsHTML(p)}</div>`;

  h += `<div class="ssec" id="pr-sec-vs"><div class="pr-sec-head"><h4>⚔️ 1:1 상대 비교 &amp; 승부 예측</h4></div>${_prVsCompareHTML(p)}</div>`;

  h += `<div class="ssec" id="pr-sec-recent"><div class="pr-sec-head"><h4>📋 최근 경기</h4></div>${_prRecentTableHTML(p)}</div>`;
  h += `</div>`;

  return h;
}

/* ─── 섹션 바로가기 내비게이션 ─── */
/* 자주 쓰는 섹션만 칩으로 노출하고, 상대적으로 덜 쓰는 섹션(티어상대전적/1:1비교)은
   "더보기" 드롭다운(details/summary)으로 묶어 좁은 화면에서 칩이 두 줄 넘게 늘어지는 것을 방지 */
function _prSectionNavHTML(){
  const items=[
    ['pr-sec-info','📋 기본정보'],
    ['pr-sec-winrate','🎮 승률'],
    ['pr-sec-map','🗺️ 맵'],
    ['pr-sec-insights','📈 핵심분석'],
    ['pr-sec-allmatches','📋 전체경기'],
    ['pr-sec-recent','📋 최근경기'],
  ];
  const moreItems=[
    ['pr-sec-elo','📉 ELO 추이'],
    ['pr-sec-monthly','📅 월별 승률'],
    ['pr-sec-modes','🏆 대회·모드별 성적'],
    ['pr-sec-tier','🎯 티어 성과 · 동일 티어 상대전적'],
    ['pr-sec-vs','⚔️ 1:1 상대 비교'],
  ];
  const chips = items.map(([id,lbl])=>
    `<button type="button" class="pr-nav-chip" onclick="_prScrollToSection('${id}')">${lbl}</button>`
  ).join('');
  const moreChips = moreItems.map(([id,lbl])=>
    `<button type="button" class="pr-nav-more-item" onclick="_prScrollToSection('${id}');_prCloseNavMore()">${lbl}</button>`
  ).join('');
  return `<div class="pr-nav-bar no-export">${chips}<details class="pr-nav-more" id="pr-nav-more"><summary class="pr-nav-chip pr-nav-more-btn">⋯ 더보기</summary><div class="pr-nav-more-panel">${moreChips}</div></details></div>`;
}
function _prCloseNavMore(){
  const d = document.getElementById('pr-nav-more');
  if(d) d.removeAttribute('open');
}
function _prScrollToSection(id){
  const el = document.getElementById(id);
  if(!el) return;
  const y = el.getBoundingClientRect().top + window.scrollY - 70;
  window.scrollTo({ top:y, behavior:'smooth' });
}

/* ─── 리포트 이미지 배경 스타일 (6종: 기본 + 대학 + 보고서 + 완전 신규 3종) ─── */
var PR_BG_STYLES = [
  ['none','⚪ 기본'],
  ['univ','🏫 대학'],
  ['report','📄 보고서'],
  ['esports','🎮 이스포츠'],
  ['magazine','📰 매거진'],
  ['ticket','🎫 티켓']
];
function _prHexToRgba(hex, a){
  try{
    let h = String(hex||'').replace('#','');
    if(h.length===3) h = h.split('').map(c=>c+c).join('');
    const r=parseInt(h.substring(0,2),16), g=parseInt(h.substring(2,4),16), b=parseInt(h.substring(4,6),16);
    if([r,g,b].some(isNaN)) throw 0;
    return `rgba(${r},${g},${b},${a})`;
  }catch(e){ return `rgba(37,99,235,${a})`; }
}
function _prStyleFrameColor(style, p){
  if(style==='univ') return (p && p.univ && typeof gc==='function') ? (gc(p.univ)||'#6366f1') : '#6366f1';
  if(style==='report') return '#0f172a';
  if(style==='esports') return '#22d3ee';
  if(style==='magazine') return '#111827';
  if(style==='ticket') return '#d97706';
  return null; // 기본(효과 없음)
}
/* 리포트 캡처 자체를 스타일별 옅은 색으로 채워서 캡처.
   카드(.ssec 등)는 자체 흰 배경이 있어 그대로 흰색으로 남고, 카드 사이 여백에는
   html2canvas의 backgroundColor 옵션이 그대로 비쳐 보여서 "카드 밖 배경"이 실제로 톤이 바뀜.
   (DOM을 미리 바꿔서 캡처하는 onclone 방식은 클론 레이아웃 재측정 타이밍 이슈로 반영 안 되는 경우가 있어 폐기) */
async function _prCaptureBaseForStyle(style, p){
  const frameColor = (style==='univ') ? _prStyleFrameColor(style, p) : null;
  const bgFill = frameColor ? _prHexToRgba(frameColor, 0.16) : (style==='report' ? '#ffffff' : _prPageBgColor());
  const el = document.getElementById('pr-report-capture');
  if(!el) throw new Error('캡처할 리포트가 없습니다.');
  try{ await (window.ensureHtml2Canvas && window.ensureHtml2Canvas()); }catch(e){}
  if(typeof _imgToDataUrls==='function') await _imgToDataUrls(el);
  try{ if(typeof _waitForImages==='function') await _waitForImages(el,1500); }catch(e){}
  try{ if(typeof _sanitizeUnsupportedCssFunctions==='function') _sanitizeUnsupportedCssFunctions(el); }catch(e){}
  return await html2canvas(el,{
    backgroundColor: bgFill, scale:2, useCORS:true, allowTaint:false, logging:false, imageTimeout:15000,
    onclone:(clonedDoc)=>{
      try{ clonedDoc.querySelectorAll('.no-export').forEach(n=>n.remove()); }catch(e){}
      if(style==='report'){
        try{
          const cloneEl = clonedDoc.getElementById('pr-report-capture');
          if(cloneEl) cloneEl.classList.add('pr-report-mode');
          const styleTag = clonedDoc.createElement('style');
          styleTag.textContent = PR_REPORT_MODE_CSS;
          clonedDoc.head.appendChild(styleTag);
        }catch(e){}
      }
    }
  });
}
/* '기본' 스타일용 배경색: 실제 화면(카드 밖 여백)에 쓰이는 페이지 배경색(--bg)을 그대로 읽어와 사용.
   라이트/다크 모드 등 실제 테마와 항상 일치하도록 하드코딩 대신 computed style에서 가져온다. */
function _prPageBgColor(){
  try{
    const el = document.getElementById('pr-report-capture');
    const src = (el && el.parentElement) || document.body;
    const cs = getComputedStyle(src);
    const varBg = cs.getPropertyValue('--bg');
    if(varBg && varBg.trim()) return varBg.trim();
    const bgColor = cs.backgroundColor;
    if(bgColor && bgColor!=='rgba(0, 0, 0, 0)' && bgColor!=='transparent') return bgColor;
  }catch(e){}
  return '#f1f5f9';
}
/* '보고서' 스타일 전용: 캡처되는 실제 카드 UI 자체를 문서 느낌으로 변형.
   화려한 그림자/그라디언트/큰 라운드 대신 얇은 테두리·직각에 가까운 모서리·
   섹션 번호 매김(01, 02 …)을 적용해 컬러풀한 대시보드가 아닌 정식 보고서처럼 보이게 함.
   (승/패, 종족 등 의미를 가진 색상은 정보 손실을 막기 위해 유지) */
var PR_REPORT_MODE_CSS = [
  '#pr-report-capture.pr-report-mode{counter-reset:pr-sec}',
  '.pr-report-mode, .pr-report-mode *{box-shadow:none!important}',
  '.pr-report-mode .pr-hero{background:#fff!important;border:1px solid #cbd5e1!important;border-bottom:3px solid #0f172a!important;border-radius:2px!important}',
  '.pr-report-mode .pr-hero-photo{border-radius:6px!important}',
  '.pr-report-mode .pr-recent-wrap,.pr-report-mode .pr-period-bar{display:none!important}',
  '.pr-report-mode .ssec{background:#fff!important;border:1px solid #e2e8f0!important;border-radius:2px!important;counter-increment:pr-sec;padding-top:20px!important}',
  '.pr-report-mode .pr-sec-head{border-bottom:2px solid #0f172a;padding-bottom:11px;margin:0 0 16px!important}',
  '.pr-report-mode .pr-sec-head h4{font-size:16px!important;letter-spacing:-.01em;display:flex;align-items:center;gap:8px}',
  '.pr-report-mode .pr-sec-head h4::before{content:counter(pr-sec,decimal-leading-zero);color:#fff;background:#0f172a;font-size:11px;font-weight:900;padding:3px 7px;border-radius:2px;letter-spacing:0}',
  '.pr-report-mode .pr-info-card,.pr-report-mode .pr-wr-card{border-radius:2px!important;background:#f8fafc!important;border:1px solid #e2e8f0!important}',
  '.pr-report-mode .pr-gauge-ring::before{background:#fff!important}',
  '.pr-report-mode .pr-ai-box{background:#f8fafc!important;border:1px solid #e2e8f0!important;border-left:3px solid #0f172a!important;border-radius:2px!important}',
  '.pr-report-mode .pr-ai-box.pr-ai-good{border-left-color:#16a34a!important}',
  '.pr-report-mode .pr-ai-box.pr-ai-bad{border-left-color:#ef4444!important}',
  '.pr-report-mode .pr-chip,.pr-report-mode .pr-btn,.pr-report-mode .pr-period-btn,.pr-report-mode .pr-filter-pill,.pr-report-mode .pr-nav-chip,.pr-report-mode .pr-recent-chip{border-radius:3px!important}',
  '.pr-report-mode .pr-highlight-row{border-radius:2px!important}',
  '.pr-report-mode .pr-bar-track,.pr-report-mode .pr-bar-fill{border-radius:2px!important}',
  '.pr-report-mode .pr-mode-chip{border-radius:2px!important}',
  '.pr-report-mode .pr-nav-bar{border-bottom:1px solid #e2e8f0;padding-bottom:14px!important}'
].join('\n');
/* 캡처된 캔버스 바깥에 스타일 색 테두리/배너, 혹은 완전히 다른 레이아웃(보고서 스타일)을 Canvas2D로 합성.
   DOM/레이아웃과 무관하게 항상 100% 반영됨. '기본' 스타일은 효과 없이 그대로 반환. */
async function _prComposeStyledCanvas(baseCanvas, style, p){
  if(style==='report') return _prDrawReportFrame(baseCanvas, p);

  const frameColor = _prStyleFrameColor(style, p);
  if(!frameColor) return baseCanvas; // 기본: 효과 없음

  const BORDER = 26;
  const BANNER = 56;
  const outW = baseCanvas.width + BORDER*2;
  const outH = baseCanvas.height + BORDER*2 + BANNER;
  const out = document.createElement('canvas');
  out.width = outW; out.height = outH;
  const ctx = out.getContext('2d');
  ctx.fillStyle = frameColor;
  ctx.fillRect(0,0,outW,outH);
  ctx.drawImage(baseCanvas, BORDER, BANNER + BORDER);
  return out;
}
/* 보고서 스타일: 컨설팅 리포트/문서 표지 느낌의 전문적인 레이아웃.
   상단 키커(letter-spaced) + 굵은 타이틀 + 메타 정보 바, 얇은 단일 테두리와 상단 포인트 바,
   하단 3분할 푸터(브랜드 / 리포트 ID / 생성일)로 구성. 순수 Canvas2D 드로잉이라 항상 동일하게 렌더링됨. */
function _prLetterSpacedText(ctx, text, x, y, spacing){
  let cx = x;
  for(const ch of String(text)){
    ctx.fillText(ch, cx, y);
    cx += ctx.measureText(ch).width + spacing;
  }
  return cx - spacing;
}
function _prDrawReportFrame(baseCanvas, p){
  const FONT = '"Apple SD Gothic Neo","Malgun Gothic","Noto Sans KR",-apple-system,sans-serif';
  const INK = '#0f172a';
  const ACCENT = '#1d4ed8';
  const MUTED = '#64748b';
  const FAINT = '#94a3b8';
  const LINE = '#e2e8f0';

  const PAD = 56;
  const ACCENT_BAR_H = 6;
  const HEADER_H = 172;
  const FOOTER_H = 68;
  const name = (p && p.name) || '스트리머';
  const sub = [p && p.univ, p && p.tier].filter(Boolean).join('   ·   ');
  const now = new Date();
  const dateStr = now.toLocaleDateString('ko-KR', {year:'numeric',month:'2-digit',day:'2-digit'});
  const reportId = `SDC-${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}-${String(Math.abs((name||'').split('').reduce((a,c)=>a+c.charCodeAt(0),0))%900+100)}`;

  const outW = baseCanvas.width + PAD*2;
  const outH = ACCENT_BAR_H + baseCanvas.height + PAD*2 + HEADER_H + FOOTER_H;
  const out = document.createElement('canvas');
  out.width = outW; out.height = outH;
  const ctx = out.getContext('2d');
  ctx.textBaseline = 'alphabetic';

  // 배경 + 얇은 단일 테두리
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0,0,outW,outH);
  ctx.strokeStyle = LINE;
  ctx.lineWidth = 1;
  ctx.strokeRect(0.5,0.5,outW-1,outH-1);

  // 상단 포인트 바
  ctx.fillStyle = ACCENT;
  ctx.fillRect(0,0,outW,ACCENT_BAR_H);

  // 헤더: 키커(letter-spaced) + 우측 리포트 ID
  ctx.fillStyle = ACCENT;
  ctx.font = `700 13px ${FONT}`;
  _prLetterSpacedText(ctx, 'STAR DATA CENTER  ·  PLAYER PERFORMANCE REPORT', PAD, ACCENT_BAR_H+PAD-16, 1.4);

  ctx.fillStyle = FAINT;
  ctx.font = `600 13px ${FONT}`;
  ctx.textAlign = 'right';
  ctx.fillText(reportId, outW-PAD, ACCENT_BAR_H+PAD-16);
  ctx.textAlign = 'left';

  // 타이틀
  ctx.fillStyle = INK;
  ctx.font = `800 42px ${FONT}`;
  ctx.fillText(`${name} 스트리머 리포트`, PAD, ACCENT_BAR_H+PAD+38);

  // 메타 정보 (대학/티어 · 생성일) - 캡슐형 배지
  let bx = PAD;
  const by = ACCENT_BAR_H+PAD+64;
  const badges = [sub, `발행일  ${dateStr}`].filter(Boolean);
  ctx.font = `600 15px ${FONT}`;
  badges.forEach((txt, i)=>{
    const w = ctx.measureText(txt).width + 28;
    const bColor = i===0 ? ACCENT : MUTED;
    ctx.fillStyle = i===0 ? _prHexToRgba(ACCENT, 0.09) : '#f1f5f9';
    _prRoundRect(ctx, bx, by, w, 30, 15);
    ctx.fill();
    ctx.fillStyle = bColor;
    ctx.fillText(txt, bx+14, by+20);
    bx += w + 10;
  });

  // 헤더 하단 구분선
  ctx.strokeStyle = LINE;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(PAD, ACCENT_BAR_H+HEADER_H-6);
  ctx.lineTo(outW-PAD, ACCENT_BAR_H+HEADER_H-6);
  ctx.stroke();

  // 본문
  ctx.drawImage(baseCanvas, PAD, ACCENT_BAR_H+HEADER_H+PAD/2);

  // 푸터 구분선
  const footTop = outH-FOOTER_H;
  ctx.strokeStyle = LINE;
  ctx.beginPath();
  ctx.moveTo(PAD, footTop);
  ctx.lineTo(outW-PAD, footTop);
  ctx.stroke();

  // 푸터 3분할: 브랜드 / 페이지 표기 / 생성 시각
  ctx.fillStyle = INK;
  ctx.font = `700 14px ${FONT}`;
  ctx.fillText('STAR DATA CENTER', PAD, footTop+38);

  ctx.fillStyle = FAINT;
  ctx.font = `500 13px ${FONT}`;
  ctx.textAlign = 'center';
  ctx.fillText('본 리포트는 star-datacenter 통계 시스템에서 자동 생성되었습니다', outW/2, footTop+38);

  ctx.textAlign = 'right';
  ctx.fillText(`Page 1 · ${dateStr}`, outW-PAD, footTop+38);
  ctx.textAlign = 'left';

  return out;
}
/* 캔버스 2D 라운드 사각형 헬퍼 (path만 생성, fill/stroke는 호출부에서) */
function _prRoundRect(ctx, x, y, w, h, r){
  ctx.beginPath();
  ctx.moveTo(x+r, y);
  ctx.arcTo(x+w, y, x+w, y+h, r);
  ctx.arcTo(x+w, y+h, x, y+h, r);
  ctx.arcTo(x, y+h, x, y, r);
  ctx.arcTo(x, y, x+w, y, r);
  ctx.closePath();
}
/* ══════════════════════════════════════
   완전히 다른 포맷의 리포트 이미지 (3종)
   기존 카드 UI를 캡처하는 방식이 아니라, 선수 데이터만 뽑아서
   매번 Canvas2D로 처음부터 새로 그리는 독립 렌더러.
   - 🎮 이스포츠: 대학 컬러 기반 다크 방송 그래픽
   - 📰 매거진: 에디토리얼 인터뷰 페이지
   - 🎫 티켓: 보딩패스 스타일 (절취선+바코드)
══════════════════════════════════════ */
var PR_RACE_KO = {T:'테란',Z:'저그',P:'프로토스'};
var PR_CANVAS_FONT = '"Apple SD Gothic Neo","Malgun Gothic","Noto Sans KR",-apple-system,sans-serif';

function _prWrOf(rv){ const t=(rv&&rv.w||0)+(rv&&rv.l||0); return t? Math.round(rv.w/t*100):0; }

/* 이미지 로드 (CORS 실패해도 null 반환하고 카드 생성은 계속 진행) */
function _prLoadImageEl(url){
  return new Promise((resolve)=>{
    if(!url){ resolve(null); return; }
    try{
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = ()=>resolve(img);
      img.onerror = ()=>resolve(null);
      img.src = url;
    }catch(e){ resolve(null); }
  });
}
/* object-fit:cover 방식으로 사각형 안에 이미지 그리기.
   vBias(0~1): 세로로 잘릴 때 어느 지점을 기준으로 자를지 (0=위쪽 기준, .5=중앙, 1=아래쪽 기준).
   인물 사진은 얼굴이 보통 상단~중상단에 있으므로 기본값을 중앙보다 위로 두어
   얼굴이 잘리는 것을 방지한다. */
function _prDrawImageCover(ctx, img, x, y, w, h, vBias){
  if(!img || !img.width || !img.height) return;
  if(vBias==null) vBias = 0.5;
  const ir = img.width/img.height, tr = w/h;
  let sx,sy,sw,sh;
  if(ir>tr){ sh=img.height; sw=sh*tr; sx=(img.width-sw)/2; sy=0; }
  else { sw=img.width; sh=sw/tr; sx=0; sy=(img.height-sh)*vBias; }
  ctx.drawImage(img, sx,sy,sw,sh, x,y,w,h);
}
/* 둥근 사각형 안에 사진 클리핑 + cover 배치 (사진 없으면 플레이스홀더) */
function _prDrawPhotoInRect(ctx, img, x, y, w, h, radius, fallbackColor, vBias){
  ctx.save();
  _prRoundRect(ctx, x, y, w, h, radius);
  ctx.clip();
  if(img){
    _prDrawImageCover(ctx, img, x, y, w, h, vBias);
  } else {
    ctx.fillStyle = fallbackColor || '#334155';
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = '#94a3b8';
    ctx.font = `700 ${Math.round(h*0.3)}px ${PR_CANVAS_FONT}`;
    ctx.textAlign = 'center';
    ctx.fillText('?', x+w/2, y+h/2+h*0.1);
    ctx.textAlign = 'left';
  }
  ctx.restore();
}
/* 티어 → 카드 레어도 컬러 (사이트 티어 색상 재사용, 실패 시 골드 기본값) */
function _prCardRarityColor(tier){
  try{ if(typeof getTierBtnColor==='function'){ const c=getTierBtnColor(tier); if(c) return c; } }catch(e){}
  return '#f59e0b';
}
/* hex 색을 검정/흰색 쪽으로 섞어 더 어둡거나 밝은 톤을 만든다.
   percent: -1(가장 어둡게) ~ 0(원본) ~ 1(가장 밝게) */
function _prShadeColor(hex, percent){
  try{
    let h = String(hex||'').replace('#','');
    if(h.length===3) h = h.split('').map(c=>c+c).join('');
    let r=parseInt(h.substring(0,2),16), g=parseInt(h.substring(2,4),16), b=parseInt(h.substring(4,6),16);
    if([r,g,b].some(isNaN)) throw 0;
    const t = percent<0 ? 0 : 255;
    const p = Math.abs(percent);
    r = Math.round((t-r)*p)+r; g = Math.round((t-g)*p)+g; b = Math.round((t-b)*p)+b;
    return `rgb(${r},${g},${b})`;
  }catch(e){ return hex || '#0b1220'; }
}
/* 3종 신규 스타일 공용 데이터 수집: 화면 캡처가 아니라 선수 원본 데이터를 직접 취합 */
/* 카드용 모드별(미니대전/대학대전/대학CK/티어대회/대회/프로리그 등) 승패 집계.
   성별로 하드코딩하지 않고 실제 기록에 있는 모드만 뽑아 보여줌(여자는 자연히 대학계열, 남자는 자연히 프로리그계열이 나옴) */
var PR_CARD_MODE_ORDER = ['프로리그','프로리그대회','미니대전','대학대전','대학CK','티어대회','대회','끝장전'];
function _prCardModeStats(p){
  const hist = (typeof _statsAllHist==='function' ? _statsAllHist(p) : []).filter(h=>(h.result==='승'||h.result==='패') && (typeof _pdNormalizeRecentModeLabel!=='function' || _pdNormalizeRecentModeLabel(h.mode)!=='시빌워'));
  const byMode = {};
  hist.forEach(h=>{
    let lbl = (typeof _pdNormalizeRecentModeLabel==='function') ? (_pdNormalizeRecentModeLabel(h.mode)||'기타') : (h.mode||'기타');
    /* 프로리그 대회 끝장전도 조별리그/대진표와 함께 '프로리그대회' 한 칩으로 합산 (HTML 리포트 섹션과 동일하게) */
    if(lbl==='프로리그대회끝장전') lbl='프로리그대회';
    if(!byMode[lbl]) byMode[lbl]={w:0,l:0};
    if(h.result==='승') byMode[lbl].w++; else byMode[lbl].l++;
  });
  /* 예전엔 상위 4개만 잘라서 보여줬는데, 그러면 정렬 순서상 뒤로 밀리는 '대회'(공통)나
     '프로리그'(남자)가 기록이 있어도 카드에서 통째로 빠지는 문제가 있었다.
     PR_CARD_MODE_ORDER에 정의된 실제 기록이 있는 모드는 자르지 않고 전부 보여준다
     (카드 높이는 _prDrawEsportsCanvas에서 modeRows.length 기준으로 항상 동적으로 계산됨). */
  return Object.entries(byMode).map(([mode,rec])=>{
    const tot=rec.w+rec.l; return {mode, ...rec, tot, wr: tot?Math.round(rec.w/tot*100):0};
  }).sort((a,b)=>{
    const ia=PR_CARD_MODE_ORDER.indexOf(a.mode), ib=PR_CARD_MODE_ORDER.indexOf(b.mode);
    if(ia>=0 && ib>=0) return ia-ib;
    if(ia>=0) return -1;
    if(ib>=0) return 1;
    return b.tot-a.tot;
  });
}
async function _prBuildCardData(p){
  const histAll = (typeof _statsAllHist==='function') ? _statsAllHist(p) : [];
  const raceStats = _prRaceStats(histAll);
  const w = p.win||0, l = p.loss||0, tot = w+l;
  const wr = tot ? Math.round(w/tot*100) : 0;
  const streak = _prBestStreak(histAll);
  const rankInfo = _prTierRank(p);
  const sorted = (histAll||[]).filter(h=>h.result==='승'||h.result==='패')
    .slice().sort((a,b)=>String(b.date||'').localeCompare(String(a.date||'')));
  const recentForm = sorted.slice(0,10).map(h=>h.result==='승'?'W':'L').reverse();
  const rawPhoto = p.photo || '';
  const photoUrl = (typeof toHttpsUrl==='function') ? toHttpsUrl(rawPhoto) : rawPhoto;
  const photoImg = await _prLoadImageEl(photoUrl);
  const univLogoRaw = (typeof univCfg!=='undefined' ? (univCfg.find(x=>x.name===p.univ)||{}) : {});
  const univLogoUrl0 = univLogoRaw.icon || univLogoRaw.img || '';
  const univLogoUrl = univLogoUrl0 ? ((typeof toHttpsUrl==='function') ? toHttpsUrl(univLogoUrl0) : univLogoUrl0) : '';
  const univLogoImg = univLogoUrl ? await _prLoadImageEl(univLogoUrl) : null;
  const univColor = (p.univ && typeof gc==='function') ? (gc(p.univ)||'#3b5bdb') : '#3b5bdb';
  return {
    name: p.name||'스트리머', univ: p.univ||'', tier: p.tier||'', race: p.race||'', elo: p.elo||1200,
    univColor, photoImg, univLogoImg, w, l, tot, wr,
    raceStats: raceStats.rv,
    bestWinStreak: (streak.win&&streak.win.n)||0,
    bestLoseStreak: (streak.lose&&streak.lose.n)||0,
    rank: rankInfo.rank, rankTotal: rankInfo.total,
    recentForm,
    modeStats: _prCardModeStats(p)
  };
}

/* ─── 🎮 이스포츠 스포트라이트 스타일 (대학 컬러 기반의 밝고 화사한 톤) ─── */
function _prDrawEsportsCanvas(data){
  const FONT = PR_CANVAS_FONT;
  const W=1080;
  const photoY=96, photoH=640, photoX=56, photoW=W-112;
  const modeRows = (data.modeStats||[]).filter(m=>m.tot>0);
  const chipH=88, chipGap=16;
  const raceBarH=28, raceGap=12, sq=30;

  /* 세로 레이아웃 오프셋을 실제 그리기보다 먼저 계산해 캔버스 전체 높이(H)를 데이터(모드 전적 줄 수)에 맞게 정한다.
     아래 그리기 단계와 반드시 같은 수식을 써야 하므로 이름 붙인 상수로 공유 */
  const nameY = photoY+photoH+62;
  const badgeY = nameY+26;
  const statY = badgeY+74;
  const raceLabelY = statY+170;
  const raceBarsTop = raceLabelY+26;
  const afterRaceBars = raceBarsTop + 3*(raceBarH+raceGap);
  const recentLabelY = afterRaceBars+20;
  const sqTop = recentLabelY+22;
  const modeSecLabelY = sqTop + sq + 40;
  const modeChipRows = Math.ceil(modeRows.length/2);
  const modeSecBottom = modeRows.length ? (modeSecLabelY + 26 + modeChipRows*chipH + (modeChipRows-1)*chipGap) : modeSecLabelY;
  const H = modeSecBottom + 90;

  const out=document.createElement('canvas'); out.width=W; out.height=H;
  const ctx=out.getContext('2d');
  const UNIV = data.univColor || '#3b5bdb';
  const ACCENT = _prShadeColor(UNIV, -0.1);   /* 배지/포인트용 - 대학 컬러를 살짝만 눌러 가독성 확보 */
  const INK = '#1c1917';

  /* 배경: 어두워지는 톤 없이 흰색 ~ 대학 컬러의 아주 옅은 톤으로만 구성 (밝고 화사하게) */
  const bgGrad=ctx.createLinearGradient(0,0,W,H);
  bgGrad.addColorStop(0,_prShadeColor(UNIV,0.95)); bgGrad.addColorStop(1,_prShadeColor(UNIV,0.84));
  ctx.fillStyle=bgGrad; ctx.fillRect(0,0,W,H);

  ctx.fillStyle=ACCENT; ctx.font=`800 15px ${FONT}`;
  _prLetterSpacedText(ctx,'STAR DATA CENTER  ·  PLAYER SPOTLIGHT', 56, 66, 2);

  /* 프로필 사진: 어두워지는 오버레이 없이 깔끔하게, 대학 컬러 보더로만 포인트 */
  ctx.save();
  ctx.shadowColor=_prHexToRgba(UNIV,.35); ctx.shadowBlur=26; ctx.shadowOffsetY=10;
  _prDrawPhotoInRect(ctx, data.photoImg, photoX, photoY, photoW, photoH, 22, '#e7e5e4', 0.1);
  ctx.restore();
  ctx.strokeStyle=ACCENT; ctx.lineWidth=4;
  _prRoundRect(ctx, photoX, photoY, photoW, photoH, 22); ctx.stroke();

  /* 이름 + 배지: 사진 아래 밝은 배경 위에 배치 (사진 위에 검은 그라디언트를 얹지 않음) */
  ctx.textAlign='left';
  ctx.fillStyle=INK; ctx.font=`900 52px ${FONT}`;
  ctx.fillText(data.name, 56, nameY);

  let px=56, py=badgeY;
  /* 대학 로고 — 원형 배지 없이 로고 자체 모양 그대로, 반투명 */
  if (data.univLogoImg) {
    const logoS=38, logoCy=py+17;
    ctx.save();
    ctx.globalAlpha=0.75;
    ctx.shadowColor='rgba(28,25,23,.18)'; ctx.shadowBlur=5;
    ctx.drawImage(data.univLogoImg, px, logoCy-logoS/2, logoS, logoS);
    ctx.restore();
    px = px+logoS+10;
  }
  [[data.univ,ACCENT,'#fff'],[data.tier,'#fff',ACCENT]].filter(([t])=>t).forEach(([txt,bg,fg],i)=>{
    ctx.font=`700 16px ${FONT}`;
    const w=ctx.measureText(txt).width+26;
    ctx.fillStyle=bg;
    _prRoundRect(ctx, px, py, w, 34, 17); ctx.fill();
    if(i===1){ ctx.strokeStyle=ACCENT; ctx.lineWidth=2; _prRoundRect(ctx, px, py, w, 34, 17); ctx.stroke(); }
    ctx.fillStyle=fg;
    ctx.fillText(txt, px+13, py+23);
    px+=w+10;
  });

  ctx.fillStyle='#78716c'; ctx.font=`700 14px ${FONT}`;
  _prLetterSpacedText(ctx,'WIN RATE', 56, statY, 2);
  ctx.font=`900 96px ${FONT}`; ctx.fillStyle=ACCENT;
  ctx.fillText(`${data.wr}%`, 56, statY+92);
  ctx.font=`700 20px ${FONT}`; ctx.fillStyle='#57534e';
  ctx.fillText(`${data.w}W ${data.l}L  ·  ELO ${data.elo}`, 56, statY+128);

  if(data.rank){
    ctx.textAlign='right';
    ctx.fillStyle='#78716c'; ctx.font=`700 14px ${FONT}`;
    ctx.fillText('TIER RANK', W-56, statY);
    ctx.font=`900 48px ${FONT}`; ctx.fillStyle=INK;
    ctx.fillText(`#${data.rank}`, W-56, statY+56);
    ctx.font=`700 16px ${FONT}`; ctx.fillStyle='#78716c';
    ctx.fillText(`/ ${data.rankTotal}명`, W-56, statY+82);
    ctx.textAlign='left';
  }

  let ry = raceLabelY;
  ctx.font=`800 15px ${FONT}`; ctx.fillStyle='#78716c';
  ctx.fillText('RACE MATCHUP', 56, ry);
  ry+=26;
  ['T','P','Z'].forEach(r=>{
    const rv=data.raceStats[r]||{w:0,l:0}; const tot=rv.w+rv.l; const wr=_prWrOf(rv);
    const rc=_prRaceColor(r);
    const barX=56, barW=W-112, barH=28;
    ctx.fillStyle='rgba(28,25,23,.06)';
    _prRoundRect(ctx, barX, ry, barW, barH, 8); ctx.fill();
    const fillW = tot? Math.max(barW*wr/100, 14) : 0;
    ctx.fillStyle=rc;
    _prRoundRect(ctx, barX, ry, fillW, barH, 8); ctx.fill();
    ctx.fillStyle='#fff'; ctx.font=`800 13px ${FONT}`;
    ctx.fillText(`${PR_RACE_KO[r]}   ${tot?wr+'%':'-'}   (${rv.w}W ${rv.l}L)`, barX+12, ry+19);
    ry+=barH+12;
  });

  ry += 20;
  ctx.fillStyle='#78716c'; ctx.font=`800 15px ${FONT}`;
  ctx.fillText('RECENT FORM', 56, ry);
  ry+=22;
  const gap=8;
  data.recentForm.forEach((r,i)=>{
    const x=56+i*(sq+gap);
    ctx.fillStyle = r==='W' ? '#ef4444' : '#2563eb';
    _prRoundRect(ctx, x, ry, sq, sq, 6); ctx.fill();
    ctx.fillStyle='#fff'; ctx.font=`900 14px ${FONT}`; ctx.textAlign='center';
    ctx.fillText(r, x+sq/2, ry+sq/2+5);
    ctx.textAlign='left';
  });

  /* 모드별 전적: 미니대전/대학대전/대학CK/티어대회/대회(여자) 또는 프로리그/프로리그대회(남자) 등
     실제 기록에 있는 모드만 상위 4개까지, RACE MATCHUP 막대와는 다른 2단 컬러 스탯 칩으로 노출해서 구분감을 줌 */
  if(modeRows.length){
    ry += sq + 40;
    ctx.fillStyle='#78716c'; ctx.font=`800 15px ${FONT}`;
    ctx.fillText('MATCH RECORD', 56, ry);
    ry += 26;
    const chipW = (W-112-24)/2;
    modeRows.forEach((m,i)=>{
      const col=i%2, row=Math.floor(i/2);
      const bx = 56 + col*(chipW+24);
      const by = ry + row*(chipH+chipGap);
      const col2 = (typeof _pdRecentModeColors==='function' && _pdRecentModeColors()[m.mode]) || ACCENT;
      ctx.fillStyle=_prHexToRgba(col2,.08);
      _prRoundRect(ctx, bx, by, chipW, chipH, 14); ctx.fill();
      ctx.strokeStyle=_prHexToRgba(col2,.25); ctx.lineWidth=2;
      _prRoundRect(ctx, bx, by, chipW, chipH, 14); ctx.stroke();
      ctx.fillStyle=col2;
      _prRoundRect(ctx, bx, by, 6, chipH, 3); ctx.fill();
      ctx.font=`700 13px ${FONT}`; ctx.fillStyle=col2;
      ctx.fillText(m.mode, bx+22, by+26);
      ctx.font=`900 30px ${FONT}`; ctx.fillStyle=INK;
      ctx.fillText(`${m.wr}%`, bx+22, by+64);
      ctx.textAlign='right'; ctx.font=`700 13px ${FONT}`; ctx.fillStyle='#57534e';
      ctx.fillText(`${m.w}W ${m.l}L`, bx+chipW-16, by+64);
      ctx.textAlign='left';
    });
    ry += modeChipRows*chipH + (modeChipRows-1)*chipGap;
  }

  ctx.fillStyle='#a8a29e'; ctx.font=`600 13px ${FONT}`;
  ctx.fillText(`STAR DATA CENTER  ·  ${new Date().toLocaleDateString('ko-KR')}`, 56, H-40);

  return out;
}

/* ─── 📰 매거진/에디토리얼 스타일 (2세대 리디자인) ───
   - 이전 버전의 "SEASON WIN RATE" 라벨과 "통산 ○승 ○패" 줄 겹침 버그를 근본적으로 해결
     (좌표를 개별 매직넘버로 흩어놓지 않고, 섹션마다 세로 커서를 순차적으로 내려가며 배치)
   - 승률 히어로 넘버를 훨씬 크게, 연승/연패는 색상+화살표로 방향성을 즉시 인지되게,
     종족전 승률은 숫자 나열 대신 미니 바 차트로, 하단 여백엔 최근 10경기 폼을 채워 넣음 */
function _prDrawMagazineCanvas(data){
  const FONT = PR_CANVAS_FONT;
  const W=1240, H=860;
  const out=document.createElement('canvas'); out.width=W; out.height=H;
  const ctx=out.getContext('2d');
  const UNIV = data.univColor || '#b91c1c';
  const ACCENT = _prShadeColor(UNIV, -0.1); /* 텍스트 대비 확보를 위해 살짝 눌러 사용 */
  ctx.fillStyle='#faf9f6'; ctx.fillRect(0,0,W,H);

  /* 좌측 세로 포인트 바 (학교 컬러) */
  ctx.fillStyle=ACCENT; ctx.fillRect(0,0,10,H);

  /* ── 우측 사진 패널: 사진 → 여백으로 자연스럽게 스며드는 그라디언트 블렌드 ── */
  const photoW = Math.round(W*0.42), photoX = W-photoW;
  if(data.photoImg) _prDrawImageCover(ctx, data.photoImg, photoX, 0, photoW, H, 0.14);
  else { ctx.fillStyle='#1e293b'; ctx.fillRect(photoX,0,photoW,H); }
  /* 대학 컬러 듀오톤 오버레이(하단으로 갈수록 살짝 짙어짐) */
  const duo = ctx.createLinearGradient(0,0,0,H);
  duo.addColorStop(0, _prHexToRgba(UNIV,.10));
  duo.addColorStop(1, _prHexToRgba('#0f172a',.30));
  ctx.fillStyle=duo; ctx.fillRect(photoX,0,photoW,H);
  /* 좌측 경계를 배경색으로 페이드시켜 "패널이 붙어있는" 느낌 대신 스며드는 느낌으로 */
  const blend = ctx.createLinearGradient(photoX-90,0,photoX+40,0);
  blend.addColorStop(0,'rgba(250,249,246,1)');
  blend.addColorStop(1,'rgba(250,249,246,0)');
  ctx.fillStyle=blend; ctx.fillRect(photoX-90,0,130,H);
  ctx.strokeStyle=_prHexToRgba(UNIV,.55); ctx.lineWidth=3;
  ctx.beginPath(); ctx.moveTo(photoX+2,0); ctx.lineTo(photoX+2,H); ctx.stroke();

  const PAD=68;
  const colRight = photoX-48;
  const contentW = colRight-PAD;
  ctx.textAlign='left';
  let cy; /* 세로 커서 — 섹션마다 순차적으로 내려간다 (겹침 방지) */

  /* ── 상단 키커 + 발행 태그 ── */
  ctx.fillStyle='#0f172a'; ctx.font=`800 12px ${FONT}`;
  _prLetterSpacedText(ctx,'STAR DATA CENTER', PAD, 50, 2);
  ctx.textAlign='right';
  ctx.fillStyle=ACCENT; ctx.font=`800 12px ${FONT}`;
  ctx.fillText('ISSUE 01 · PLAYER FEATURE', colRight, 50);
  ctx.textAlign='left';
  ctx.strokeStyle='#0f172a'; ctx.lineWidth=2;
  ctx.beginPath(); ctx.moveTo(PAD,64); ctx.lineTo(colRight,64); ctx.stroke();

  /* ── 선수명 + 언더라인 스와이프 ── */
  ctx.fillStyle='#0f172a'; ctx.font=`900 58px ${FONT}`;
  ctx.fillText(data.name, PAD, 134);
  const nameW = ctx.measureText(data.name).width;
  ctx.fillStyle=ACCENT; ctx.fillRect(PAD, 146, Math.min(nameW, contentW)*0.42, 6);

  /* ── 소속/티어 배지: 소속은 학교 컬러로 꽉 채워 이름과 시각적으로 연결 ── */
  let bx=PAD, by=168;
  /* 대학 로고 — 원형 배지 없이 로고 자체 모양 그대로, 반투명 */
  if (data.univLogoImg) {
    const logoS=36, logoCy=by+16;
    ctx.save();
    ctx.globalAlpha=0.75;
    ctx.shadowColor='rgba(15,23,42,.18)'; ctx.shadowBlur=5;
    ctx.drawImage(data.univLogoImg, bx, logoCy-logoS/2, logoS, logoS);
    ctx.restore();
    bx = bx+logoS+10;
  }
  ctx.font=`700 14px ${FONT}`;
  const univTxt = `${data.univ||'-'} 소속`;
  const univBw = ctx.measureText(univTxt).width+26;
  ctx.fillStyle=UNIV; _prRoundRect(ctx, bx, by, univBw, 32, 16); ctx.fill();
  ctx.fillStyle='#fff'; ctx.fillText(univTxt, bx+13, by+21);
  bx += univBw+10;
  const tierTxt = `${data.tier||'-'} 티어`;
  const tierBw = ctx.measureText(tierTxt).width+26;
  ctx.strokeStyle=_prHexToRgba(ACCENT,.5); ctx.lineWidth=1.5;
  _prRoundRect(ctx, bx, by, tierBw, 32, 16); ctx.stroke();
  ctx.fillStyle=ACCENT; ctx.fillText(tierTxt, bx+13, by+21);
  cy = by+32; /* = 200 */

  /* ── 승률 히어로 넘버 (겹침 버그 수정: 라벨→숫자→서브텍스트 순서로 커서를 확실히 내림) ── */
  cy += 34; /* 234: 라벨 baseline */
  ctx.fillStyle='#a8a29e'; ctx.font=`800 13px ${FONT}`;
  _prLetterSpacedText(ctx,'SEASON WIN RATE', PAD, cy, 1.6);
  cy += 92; /* 326: 히어로 숫자 baseline (큰 폰트 캡하이트 고려해 충분히 확보) */
  ctx.fillStyle='#0f172a'; ctx.font=`900 96px ${FONT}`;
  ctx.fillText(`${data.wr}`, PAD, cy);
  const wrNumW = ctx.measureText(`${data.wr}`).width;
  ctx.fillStyle=ACCENT; ctx.font=`900 46px ${FONT}`;
  ctx.fillText('%', PAD+wrNumW+4, cy);
  cy += 38; /* 서브텍스트 baseline — 히어로 숫자와 명확히 분리되는 간격 확보 */
  ctx.fillStyle='#78716c'; ctx.font=`600 17px ${FONT}`;
  ctx.fillText(`통산 ${data.w}승 ${data.l}패  ·  ELO ${data.elo}`, PAD, cy);

  cy += 26;
  ctx.strokeStyle='#d6d3d1'; ctx.lineWidth=1;
  ctx.beginPath(); ctx.moveTo(PAD, cy); ctx.lineTo(colRight, cy); ctx.stroke();

  /* ── 팩트 그리드 2×2: 연승/연패는 색+화살표로 방향성을 즉시 전달 ── */
  const colW=(contentW-30)/2;
  const rowH=60;
  cy += 40;
  const gridTop = cy;
  const facts=[
    ['최고 연승', `▲ ${data.bestWinStreak}연승`, '#dc2626'],
    ['최고 연패', `▼ ${data.bestLoseStreak}연패`, '#2563eb'],
    ['티어 내 순위', data.rank?`${data.rank}위 / ${data.rankTotal}명`:'-', '#0f172a'],
    ['통산 경기수', `${data.tot}전`, '#0f172a']
  ];
  facts.forEach(([lbl,val,valCol],i)=>{
    const col=i%2, row=Math.floor(i/2);
    const fx=PAD+col*(colW+30);
    const yy=gridTop+row*rowH;
    ctx.fillStyle=ACCENT; _prRoundRect(ctx, fx, yy-11, 6, 6, 2); ctx.fill();
    ctx.fillStyle='#a8a29e'; ctx.font=`700 12px ${FONT}`;
    _prLetterSpacedText(ctx, lbl, fx+14, yy, .5);
    ctx.fillStyle=valCol; ctx.font=`800 24px ${FONT}`;
    ctx.fillText(val, fx+14, yy+30);
  });
  ctx.strokeStyle='#e7e5e4'; ctx.lineWidth=1;
  ctx.beginPath(); ctx.moveTo(PAD+colW+15, gridTop-30); ctx.lineTo(PAD+colW+15, gridTop+rowH+6); ctx.stroke();
  cy = gridTop+rowH+30;
  ctx.strokeStyle='#d6d3d1'; ctx.lineWidth=1;
  ctx.beginPath(); ctx.moveTo(PAD, cy); ctx.lineTo(colRight, cy); ctx.stroke();

  /* ── 종족전 승률 미니 바 차트 (숫자 나열 대신 한눈에 비교되도록) ── */
  cy += 32;
  ctx.fillStyle='#a8a29e'; ctx.font=`800 12px ${FONT}`;
  _prLetterSpacedText(ctx,'RACE MATCHUP', PAD, cy, 1.5);
  cy += 24;
  const raceRows=[['T','테란전',data.raceStats.T],['Z','저그전',data.raceStats.Z],['P','프로토스전',data.raceStats.P]];
  const barLabelW=76, barPctW=48, barGap=10;
  const barTrackW=contentW-barLabelW-barPctW-barGap*2;
  raceRows.forEach(([code,lbl,rv])=>{
    const wr=_prWrOf(rv);
    const rc=(typeof _prRaceColor==='function') ? _prRaceColor(code) : '#94a3b8';
    ctx.fillStyle='#57534e'; ctx.font=`700 14px ${FONT}`;
    ctx.fillText(lbl, PAD, cy+13);
    const trackX=PAD+barLabelW+barGap;
    ctx.fillStyle='#e7e5e4'; _prRoundRect(ctx, trackX, cy, barTrackW, 16, 8); ctx.fill();
    ctx.fillStyle=rc; _prRoundRect(ctx, trackX, cy, Math.max(barTrackW*wr/100, wr>0?10:0), 16, 8); ctx.fill();
    ctx.textAlign='right'; ctx.fillStyle='#0f172a'; ctx.font=`800 15px ${FONT}`;
    ctx.fillText(`${wr}%`, colRight, cy+13);
    ctx.textAlign='left';
    cy += 34;
  });

  /* ── 최근 폼 (하단 여백을 데이터로 채움) ── */
  cy += 12;
  ctx.fillStyle='#a8a29e'; ctx.font=`800 12px ${FONT}`;
  _prLetterSpacedText(ctx,'RECENT FORM', PAD, cy, 1.5);
  cy += 14;
  const sq=24, gap=7;
  (data.recentForm||[]).forEach((r,i)=>{
    const x=PAD+i*(sq+gap);
    ctx.fillStyle = r==='W' ? '#dc2626' : '#2563eb';
    _prRoundRect(ctx, x, cy, sq, sq, 5); ctx.fill();
    ctx.fillStyle='#fff'; ctx.font=`800 11px ${FONT}`;
    ctx.textAlign='center';
    ctx.fillText(r, x+sq/2, cy+sq/2+4);
    ctx.textAlign='left';
  });

  /* ── 푸터: 발행 정보 + ISSUE 넘버 ── */
  const footTop = H-76;
  ctx.strokeStyle='#d6d3d1'; ctx.lineWidth=1;
  ctx.beginPath(); ctx.moveTo(PAD, footTop); ctx.lineTo(colRight, footTop); ctx.stroke();
  ctx.fillStyle='#a8a29e'; ctx.font=`600 12px ${FONT}`;
  ctx.fillText(`발행 · star-datacenter · ${new Date().toLocaleDateString('ko-KR')}`, PAD, footTop+30);
  ctx.textAlign='right'; ctx.fillStyle=ACCENT; ctx.font=`900 20px ${FONT}`;
  ctx.fillText('ISSUE 01', colRight, footTop+34);
  ctx.textAlign='left';

  return out;
}

/* ─── 🎫 티켓/보딩패스 스타일 (절취선+바코드, 대학 컬러 테마) ─── */
function _prDrawTicketCanvas(data){
  const FONT = PR_CANVAS_FONT;
  const hasLogo = !!data.univLogoImg;
  const W=1400, H=560;
  const out=document.createElement('canvas'); out.width=W; out.height=H;
  const ctx=out.getContext('2d');
  const stubW=340, mainW=W-stubW;
  const UNIV = data.univColor || '#3b5bdb';
  const ACCENT = _prShadeColor(UNIV, -0.06);
  /* 우측 스텁은 대학 컬러 → 점점 어두워지는 그라디언트 (요청대로 여기만 다크 효과 적용) */
  const stubBg1 = UNIV;
  const stubBg2 = _prShadeColor(UNIV, -0.6);

  /* 카드 전체를 둥근 사각형으로 클리핑해 실제 티켓처럼 라운드 처리 */
  ctx.save();
  _prRoundRect(ctx, 0, 0, W, H, 26);
  ctx.clip();

  /* 좌측 본체: 대학 컬러를 아주 옅게 섞은 밝은 톤 (예쁘고 화사하게) */
  const mainGrad=ctx.createLinearGradient(0,0,mainW,H);
  mainGrad.addColorStop(0,_prShadeColor(UNIV,0.94)); mainGrad.addColorStop(1,_prShadeColor(UNIV,0.88));
  ctx.fillStyle=mainGrad; ctx.fillRect(0,0,mainW,H);
  ctx.fillStyle=UNIV; ctx.fillRect(0,0,mainW,10);

  const stubGrad=ctx.createLinearGradient(mainW,0,W,H);
  stubGrad.addColorStop(0,stubBg1); stubGrad.addColorStop(1,stubBg2);
  ctx.fillStyle=stubGrad; ctx.fillRect(mainW,0,stubW,H);

  /* 여백 없는 얇은 대각선 패턴으로 스텁을 항공권 느낌으로 */
  ctx.save();
  ctx.beginPath(); ctx.rect(mainW,0,stubW,H); ctx.clip();
  ctx.globalAlpha=.08; ctx.strokeStyle='#fff'; ctx.lineWidth=2;
  for(let i=mainW-H;i<W;i+=34){ ctx.beginPath(); ctx.moveTo(i,H); ctx.lineTo(i+H,0); ctx.stroke(); }
  ctx.restore();

  const holeR=16;
  ctx.save();
  ctx.globalCompositeOperation='destination-out';
  ctx.beginPath(); ctx.arc(mainW, 0, holeR, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(mainW, H, holeR, 0, Math.PI*2); ctx.fill();
  ctx.restore();
  /* 절취선을 따라 작은 펀치 홀을 촘촘히 배치해 진짜 절취선처럼 보이도록 */
  ctx.save();
  ctx.globalCompositeOperation='destination-out';
  for(let y=holeR*2+6; y<H-holeR*2; y+=16){ ctx.beginPath(); ctx.arc(mainW,y,2.6,0,Math.PI*2); ctx.fill(); }
  ctx.restore();

  const PAD=40;
  ctx.textAlign='left';
  ctx.fillStyle=ACCENT; ctx.font=`800 12px ${FONT}`;
  _prLetterSpacedText(ctx,'STAR DATA CENTER · BOARDING PASS', PAD, 34, 2);

  /* 프로필 사진을 훨씬 크게 - 본체 좌측을 거의 채우는 크기 */
  const phS=460, phY=52;
  ctx.save();
  ctx.shadowColor=_prHexToRgba(UNIV,.3); ctx.shadowBlur=20; ctx.shadowOffsetY=8;
  _prDrawPhotoInRect(ctx, data.photoImg, PAD, phY, phS, phS, 20, '#d6d3d1', 0.18);
  ctx.restore();
  ctx.strokeStyle=ACCENT; ctx.lineWidth=4;
  _prRoundRect(ctx, PAD, phY, phS, phS, 20); ctx.stroke();

  const tx=PAD+phS+36;
  const tw=mainW-tx-28;
  ctx.fillStyle='#292524'; ctx.font=`900 44px ${FONT}`;
  ctx.fillText(data.name, tx, 118);
  ctx.fillStyle='#78716c'; ctx.font=`700 16px ${FONT}`;
  ctx.fillText(`${data.univ||'-'}  ·  ${data.tier||'-'}  ·  ELO ${data.elo}`, tx, 150);

  const tag = data.wr>=60 ? 'PRIORITY BOARDING' : 'STREAMER PASS';
  ctx.font=`800 12px ${FONT}`;
  const tagW=ctx.measureText(tag).width+22;
  ctx.fillStyle=ACCENT; _prRoundRect(ctx, tx, 168, tagW, 28, 14); ctx.fill();
  ctx.fillStyle='#fff'; ctx.fillText(tag, tx+11, 187);

  ctx.strokeStyle=_prHexToRgba(UNIV,.25); ctx.lineWidth=1;
  ctx.beginPath(); ctx.moveTo(tx, 218); ctx.lineTo(tx+tw, 218); ctx.stroke();

  ctx.fillStyle='#a8a29e'; ctx.font=`700 11px ${FONT}`;
  _prLetterSpacedText(ctx,'WIN RATE', tx, 250, 1.5);
  ctx.fillStyle=ACCENT; ctx.font=`900 84px ${FONT}`;
  ctx.fillText(`${data.wr}%`, tx, 330);
  ctx.fillStyle='#57534e'; ctx.font=`700 16px ${FONT}`;
  ctx.fillText(`${data.w}W ${data.l}L`, tx, 358);

  ctx.strokeStyle=_prHexToRgba(UNIV,.25); ctx.lineWidth=1;
  ctx.beginPath(); ctx.moveTo(tx, 384); ctx.lineTo(tx+tw, 384); ctx.stroke();

  const gates=[['RECORD',`${data.w}W ${data.l}L`],['STREAK',`${data.bestWinStreak}연승`]];
  let gx=tx;
  gates.forEach(([lbl,val])=>{
    ctx.fillStyle='#a8a29e'; ctx.font=`700 11px ${FONT}`;
    _prLetterSpacedText(ctx, lbl, gx, 412, 1.5);
    ctx.fillStyle='#292524'; ctx.font=`900 26px ${FONT}`;
    ctx.fillText(val, gx, 444);
    gx+=Math.min(tw/2, 220);
  });

  let fy = 486;
  ctx.fillStyle='#a8a29e'; ctx.font=`700 11px ${FONT}`;
  _prLetterSpacedText(ctx,'RECENT FORM', tx, fy, 1.5);
  const sq=22, gap=6;
  data.recentForm.forEach((r,i)=>{
    const x=tx+i*(sq+gap);
    ctx.fillStyle = r==='W' ? '#dc2626' : '#2563eb';
    _prRoundRect(ctx, x, fy+10, sq, sq, 4); ctx.fill();
  });

  ctx.save();
  ctx.translate(mainW+stubW/2, 0);
  ctx.textAlign='center';
  ctx.fillStyle='rgba(255,255,255,.7)'; ctx.font=`800 11px ${FONT}`;
  ctx.fillText('STREAMER', 0, 40);
  ctx.fillStyle='#fff'; ctx.font=`900 24px ${FONT}`;
  ctx.fillText(data.name.length>7?data.name.slice(0,7)+'…':data.name, 0, 72);
  ctx.font=`700 13px ${FONT}`; ctx.fillStyle='rgba(255,255,255,.7)';
  ctx.fillText(data.tier||'-', 0, 98);

  ctx.beginPath(); ctx.strokeStyle='rgba(255,255,255,.25)'; ctx.lineWidth=6;
  ctx.arc(0,180,52, 0, Math.PI*2); ctx.stroke();
  ctx.beginPath(); ctx.strokeStyle='#fff'; ctx.lineWidth=6;
  ctx.arc(0,180,52, -Math.PI/2, -Math.PI/2 + Math.PI*2*(data.wr/100));
  ctx.stroke();
  ctx.fillStyle='#fff'; ctx.font=`900 26px ${FONT}`;
  ctx.fillText(`${data.wr}%`, 0, 189);

  /* 승률 게이지 아래: 대학 로고만 (원형 배지 없이 로고 자체 모양 그대로, 반투명 스탬프 느낌) */
  if (hasLogo) {
    const logoS = 112, logoCy = 316;
    ctx.save();
    ctx.globalAlpha = 0.72;
    ctx.shadowColor='rgba(0,0,0,.28)'; ctx.shadowBlur=10; ctx.shadowOffsetY=3;
    ctx.drawImage(data.univLogoImg, -logoS/2, logoCy-logoS/2, logoS, logoS);
    ctx.restore();
    ctx.fillStyle='rgba(255,255,255,.85)'; ctx.font=`800 13px ${FONT}`;
    ctx.fillText(data.univ||'', 0, logoCy+logoS/2+22);
  }

  ctx.textAlign='left';
  const bcY=H-84; let bcx=-stubW/2+34;
  const seed = String(data.name||'').split('').reduce((a,c)=>a+c.charCodeAt(0),0) || 42;
  for(let i=0;i<28;i++){
    const bw2 = ((seed*(i+1))%3)+1;
    ctx.fillStyle='rgba(255,255,255,.85)';
    ctx.fillRect(bcx, bcY, bw2, 40);
    bcx+=bw2+3;
  }
  ctx.font=`600 9px ${FONT}`; ctx.fillStyle='rgba(255,255,255,.65)'; ctx.textAlign='center';
  ctx.fillText(`SDC-${seed%9000+1000}`, 0, bcY+56);
  ctx.restore();

  ctx.restore(); /* 카드 라운드 클리핑 해제 */

  ctx.strokeStyle='rgba(0,0,0,.08)'; ctx.lineWidth=1.5;
  _prRoundRect(ctx, .75, .75, W-1.5, H-1.5, 26); ctx.stroke();

  return out;
}

/* ─── 캔버스 생성: 스타일이 바뀌면 카드 사이 배경 톤도 달라져야 하므로 매번 새로 캡처 ─── */
async function _prGenerateReportCanvas(style){
  const p = window._prName ? (players||[]).find(x=>x && x.name===window._prName) : null;
  if(!p) throw new Error('선택된 스트리머가 없습니다.');
  if(style==='esports' || style==='magazine' || style==='ticket'){
    const data = await _prBuildCardData(p);
    if(style==='esports') return _prDrawEsportsCanvas(data);
    if(style==='magazine') return _prDrawMagazineCanvas(data);
    return _prDrawTicketCanvas(data);
  }
  const baseCanvas = await _prCaptureBaseForStyle(style, p);
  return await _prComposeStyledCanvas(baseCanvas, style, p);
}
/* ─── 리포트 전체 이미지 저장 ─── */
async function _prSaveReportImage(){
  const el = document.getElementById('pr-report-capture');
  if(!el){ alert('캡처할 리포트가 없습니다.'); return; }
  const name = window._prName || '스트리머';
  const style = window._prReportBgStyle || 'none';
  try{
    if(typeof _showSaveLoading==='function') _showSaveLoading();
    const canvas = await _prGenerateReportCanvas(style);
    window._prPendingSaveCanvas = canvas;
    window._prPendingSaveName = `${name}_리포트.png`;
    _prShowImagePreview(canvas, style);
  }catch(e){ alert('이미지 저장 오류: '+e.message); }
  finally{ if(typeof _hideSaveLoading==='function') _hideSaveLoading(); }
}
/* ─── 미리보기 안에서 배경 스타일 전환 ─── */
async function _prSwitchBgStyle(style){
  if(window._prBgSwitchBusy) return;
  window._prBgSwitchBusy = true;
  const wrap = document.getElementById('pr-img-preview-overlay');
  if(wrap) wrap.classList.add('pr-bg-loading');
  try{
    const canvas = await _prGenerateReportCanvas(style);
    window._prPendingSaveCanvas = canvas;
    window._prReportBgStyle = style;
    const imgEl = wrap ? wrap.querySelector('.pr-img-preview-body img') : null;
    if(imgEl) imgEl.src = canvas.toDataURL('image/png');
    if(wrap) wrap.querySelectorAll('.pr-bgstyle-btn').forEach(b=>b.classList.toggle('on', b.dataset.style===style));
  }catch(e){ alert('배경 변경 오류: '+e.message); }
  finally{ window._prBgSwitchBusy = false; if(wrap) wrap.classList.remove('pr-bg-loading'); }
}
/* ─── 이미지 저장 전 미리보기 모달 ─── */
function _prShowImagePreview(canvas, style){
  _prCloseImagePreview();
  const dataUrl = canvas.toDataURL('image/png');
  const curStyle = style || window._prReportBgStyle || 'none';
  const p = window._prName ? (players||[]).find(x=>x && x.name===window._prName) : null;
  const wrap = document.createElement('div');
  wrap.id = 'pr-img-preview-overlay';
  wrap.className = 'pr-img-preview-overlay';
  wrap.innerHTML = `
    <div class="pr-img-preview-modal">
      <div class="pr-img-preview-hdr">
        <span>🖼️ 리포트 이미지 미리보기</span>
        <button type="button" class="pr-img-preview-x" onclick="_prCloseImagePreview()">✕</button>
      </div>
      <div class="pr-bgstyle-row">
        ${PR_BG_STYLES.map(([k,lbl])=>{
          const col = _prStyleFrameColor(k, p);
          const dot = col ? `<span class="pr-bgstyle-dot" style="background:${col}"></span>` : `<span class="pr-bgstyle-dot pr-bgstyle-dot--none"></span>`;
          return `<button type="button" class="pr-bgstyle-btn ${k===curStyle?'on':''}" data-style="${k}" onclick="_prSwitchBgStyle('${k}')">${dot}${lbl}</button>`;
        }).join('')}
      </div>
      <div class="pr-img-preview-body"><img src="${dataUrl}" alt="리포트 미리보기"></div>
      <div class="pr-img-preview-ftr">
        <button type="button" class="pr-btn pr-btn-ghost" onclick="_prCloseImagePreview()">취소</button>
        <button type="button" class="pr-btn pr-btn-primary" onclick="_prConfirmSaveImage()">📥 다운로드</button>
      </div>
    </div>`;
  wrap.addEventListener('click', (e)=>{ if(e.target===wrap) _prCloseImagePreview(); });
  document.body.appendChild(wrap);
}
function _prCloseImagePreview(){
  const el = document.getElementById('pr-img-preview-overlay');
  if(el) el.remove();
}
async function _prConfirmSaveImage(){
  const canvas = window._prPendingSaveCanvas;
  const filename = window._prPendingSaveName || '리포트.png';
  _prCloseImagePreview();
  if(!canvas) return;
  try{
    if(typeof _showSaveLoading==='function') _showSaveLoading();
    await _saveCanvasImage(canvas, filename, 'png');
  }catch(e){ alert('이미지 저장 오류: '+e.message); }
  finally{
    if(typeof _hideSaveLoading==='function') _hideSaveLoading();
    window._prPendingSaveCanvas = null;
  }
}

try{
  window.statsPlayerReportHTML = statsPlayerReportHTML;
  window._prSelectPlayer = _prSelectPlayer;
  window._prOnSearchInput = _prOnSearchInput;
  window._prSaveReportImage = _prSaveReportImage;
  window._prScrollToSection = _prScrollToSection;
  window._prCloseNavMore = _prCloseNavMore;
  window._prToggleTierOpp = _prToggleTierOpp;
  window._prCloseImagePreview = _prCloseImagePreview;
  window._prConfirmSaveImage = _prConfirmSaveImage;
}catch(e){}
