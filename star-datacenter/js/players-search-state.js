/* ══════════════════════════════════════
   성적 관리
══════════════════════════════════════ */
let totalRaceFilter='전체'; // 스트리머 탭 종족 필터
let totalSearch=''; // 스트리머 탭 이름 검색
let totalHideNoRecord=false; // 전적 없는 선수 숨기기
let _bulkEditMode=false; // 일괄 수정 모드
let _bulkEditSelected=new Set(); // 선택된 스트리머 이름
let _bulkEditSearch=''; // 일괄 수정(선택 모드) 검색어
let totalViewMode=(()=>{try{return localStorage.getItem('su_streamer_view_mode')||'table';}catch(e){return 'table';}})(); // 'gallery'(카드형) | 'table'(리스트형) | 'focus'(상세형)
let totalFocusPlayer=''; // 상세형에서 선택된 스트리머 이름

(function _injectStreamerTabUiStyle(){
  if(typeof document==='undefined') return;
  if(document.getElementById('streamer-tab-ui-style')) return;
  const s=document.createElement('style');
  s.id='streamer-tab-ui-style';
  s.textContent=[
    '.streamer-shell{display:flex;flex-direction:column;gap:14px}',
    '.streamer-hero{display:flex;align-items:flex-start;justify-content:space-between;gap:14px;padding:18px 20px;border-radius:24px;background:linear-gradient(135deg,rgba(255,255,255,.98),rgba(248,250,252,.94));border:1px solid rgba(148,163,184,.18);box-shadow:0 18px 38px rgba(15,23,42,.06),inset 0 1px 0 rgba(255,255,255,.88)}',
    '.streamer-hero-copy{display:flex;flex-direction:column;gap:6px;min-width:0}',
    '.streamer-hero-kicker{font-size:11px;font-weight:900;letter-spacing:.08em;color:#2563eb;text-transform:uppercase}',
    '.streamer-hero-title{font-size:24px;font-weight:950;letter-spacing:-.03em;color:var(--text1);line-height:1.15}',
    '.streamer-hero-desc{font-size:13px;line-height:1.6;color:var(--text3)}',
    '.streamer-hero-badges{display:flex;flex-wrap:wrap;gap:8px;justify-content:flex-end}',
    '.streamer-hero-badge{display:inline-flex;align-items:center;gap:6px;padding:8px 12px;border-radius:999px;background:rgba(255,255,255,.9);border:1px solid rgba(148,163,184,.16);font-size:12px;font-weight:800;color:var(--text2);box-shadow:0 10px 20px rgba(15,23,42,.04)}',
    '.streamer-toolbar-card,.streamer-content-card{padding:12px 14px;border-radius:22px;background:linear-gradient(180deg,rgba(255,255,255,.98),rgba(248,250,252,.94));border:1px solid rgba(148,163,184,.18);box-shadow:0 16px 32px rgba(15,23,42,.05)}',
    '.streamer-toolbar-card .pill{border-radius:999px;border:1px solid rgba(148,163,184,.18);background:linear-gradient(180deg,rgba(255,255,255,.96),rgba(248,250,252,.92));color:var(--text2);font-weight:800;box-shadow:0 8px 16px rgba(15,23,42,.04);transition:transform .15s,box-shadow .15s,border-color .15s,background .15s}',
    '.streamer-toolbar-card .pill:hover{transform:translateY(-1px);box-shadow:0 14px 24px rgba(15,23,42,.08)}',
    '.streamer-toolbar-card .pill.on{background:linear-gradient(135deg,#2563eb,#3b82f6);border-color:#2563eb;color:#fff;box-shadow:0 14px 26px rgba(37,99,235,.24)}',
    '.streamer-toolbar-card .pill.warn-on{background:linear-gradient(135deg,#f59e0b,#f97316);border-color:#f59e0b;color:#fff;box-shadow:0 14px 26px rgba(245,158,11,.22)}',
    '.streamer-toolbar-card .pill.edit-on{background:linear-gradient(135deg,#2563eb,#60a5fa);border-color:#2563eb;color:#fff;box-shadow:0 14px 26px rgba(37,99,235,.22)}',
    '.streamer-search{padding:8px 12px;border:1px solid rgba(148,163,184,.18);border-radius:14px;font-size:12px;min-width:140px;max-width:240px;flex:0 1 210px;background:linear-gradient(180deg,rgba(255,255,255,.98),rgba(248,250,252,.94));color:var(--text);box-shadow:inset 0 1px 0 rgba(255,255,255,.7)}',
    '.streamer-summary-chip{display:inline-flex;align-items:center;gap:6px;padding:7px 10px;border-radius:999px;background:rgba(248,250,252,.94);border:1px solid rgba(148,163,184,.16);font-size:11px;font-weight:800;color:var(--text2)}',
    '.streamer-kpi-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}',
    '.streamer-kpi-card{padding:14px 15px;border-radius:20px;background:linear-gradient(180deg,rgba(255,255,255,.99),rgba(248,250,252,.95));border:1px solid rgba(148,163,184,.16);box-shadow:0 14px 28px rgba(15,23,42,.05)}',
    '.streamer-kpi-label{font-size:11px;font-weight:900;letter-spacing:.04em;color:var(--text3)}',
    '.streamer-kpi-value{margin-top:8px;font-size:24px;font-weight:950;letter-spacing:-.03em;color:var(--text1)}',
    '.streamer-kpi-sub{margin-top:5px;font-size:11px;font-weight:700;color:var(--text3)}',
    '.streamer-table-wrap{overflow-x:auto;-webkit-overflow-scrolling:touch;width:100%}',
    '.streamer-table{table-layout:fixed;width:100%;border-collapse:separate;border-spacing:0 8px}',
    '.streamer-table thead th{background:linear-gradient(180deg,#f8fbff,#eef6ff);border-top:1px solid rgba(148,163,184,.18);border-bottom:1px solid rgba(148,163,184,.18)}',
    '.streamer-table tbody tr{box-shadow:0 12px 24px rgba(15,23,42,.05)}',

    '.streamer-table tbody tr.streamer-row.inactive td{opacity:.92}',
    '.streamer-table tbody tr.streamer-row.retired td{opacity:.78;filter:saturate(.78)}',
    '.streamer-table tbody td{background:linear-gradient(180deg,rgba(255,255,255,.98),rgba(248,250,252,.94));border-top:1px solid rgba(148,163,184,.14);border-bottom:1px solid rgba(148,163,184,.14)}',
    '.streamer-table tbody tr td:first-child{border-left:1px solid rgba(148,163,184,.14);border-top-left-radius:16px;border-bottom-left-radius:16px}',
    '.streamer-table tbody tr td:last-child{border-right:1px solid rgba(148,163,184,.14);border-top-right-radius:16px;border-bottom-right-radius:16px}',
    '.streamer-univ-head td{padding:0!important;border:none!important;background:transparent!important;box-shadow:none!important}',
    '.streamer-univ-banner{position:relative;display:flex;align-items:center;justify-content:space-between;gap:10px;padding:12px 14px;border-radius:18px;color:#fff;overflow:hidden;box-shadow:0 16px 30px rgba(15,23,42,.12)}',
    '.streamer-univ-banner::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(255,255,255,.18),transparent 42%);pointer-events:none}',
    '.streamer-univ-meta{display:flex;align-items:center;gap:8px;flex-wrap:wrap;min-width:0;position:relative;z-index:1}',
    '.streamer-univ-badge{display:inline-flex;align-items:center;gap:6px;padding:6px 12px;border-radius:999px;background:rgba(255,255,255,.18);backdrop-filter:blur(8px);color:#fff;font-size:14px;font-weight:900;border:1px solid rgba(255,255,255,.24)}',
    '.streamer-univ-count{position:relative;z-index:1;font-size:11px;color:rgba(255,255,255,.86);font-weight:700;white-space:nowrap}',
    '.streamer-subgrp td{padding:0!important;border:none!important;background:transparent!important;box-shadow:none!important}',
    '.streamer-subgrp-chip{display:inline-flex;align-items:center;gap:6px;padding:7px 12px;border-radius:999px;font-size:12px;font-weight:800;background:rgba(59,130,246,.08);color:var(--text2);border:1px solid rgba(59,130,246,.14)}',
    '.streamer-player-cell{display:flex;align-items:center;gap:10px;min-width:0}',
    '.streamer-avatar{width:42px;height:42px;border-radius:var(--su_profile_radius,50%);flex-shrink:0;display:inline-flex;align-items:center;justify-content:center;overflow:hidden;border:2px solid rgba(148,163,184,.18);background:linear-gradient(180deg,#eef2ff,#e2e8f0);font-size:11px;font-weight:900;color:#64748b;position:relative;cursor:pointer;box-shadow:0 10px 18px rgba(15,23,42,.07)}',
    '.streamer-name-stack{display:flex;flex-direction:column;gap:4px;min-width:0}',
    '.streamer-name-line{display:flex;align-items:center;gap:4px;flex-wrap:wrap;min-width:0}',
    '.streamer-name-link{font-weight:800;cursor:pointer;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
    '.streamer-mini-meta{display:flex;align-items:center;gap:6px;flex-wrap:wrap}',
    '.streamer-rank-box{display:flex;flex-direction:column;align-items:center;gap:4px}',
    '.streamer-stat-num{font-weight:900}',
    '.streamer-wr-box{display:flex;flex-direction:column;align-items:center;gap:3px}',
    '.streamer-elo-chip,.streamer-act-chip{display:inline-flex;align-items:center;justify-content:center;min-width:54px;padding:5px 8px;border-radius:999px;border:1px solid rgba(148,163,184,.16);font-size:11px;font-weight:900;background:rgba(248,250,252,.96)}',
    '.streamer-act-chip.hot{color:#16a34a;background:linear-gradient(180deg,rgba(240,253,244,.98),rgba(220,252,231,.92));border-color:rgba(34,197,94,.26)}',
    '.streamer-act-chip.warm{color:#d97706;background:linear-gradient(180deg,rgba(255,251,235,.98),rgba(254,243,199,.92));border-color:rgba(245,158,11,.26)}',
    '.streamer-act-chip.cool{color:#64748b;background:linear-gradient(180deg,rgba(248,250,252,.98),rgba(241,245,249,.92));border-color:rgba(148,163,184,.24)}',
    '.streamer-gallery-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(168px,1fr));gap:var(--su-streamer-card-gap,13px);padding:22px}',
    '.streamer-gallery-head{grid-column:1/-1;display:flex;align-items:center;gap:8px;padding:14px 16px;border-radius:20px;position:relative;overflow:hidden;box-shadow:0 16px 30px rgba(15,23,42,.12);margin-top:10px}',
    '.streamer-gallery-head::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(255,255,255,.18),transparent 44%);pointer-events:none}',
    '.streamer-gallery-univ{position:relative;z-index:1;background:rgba(255,255,255,.18)!important;border:1px solid rgba(255,255,255,.24);backdrop-filter:blur(8px)}',
    '.streamer-gallery-univ.clickable-univ{cursor:pointer;transition:transform .16s ease,box-shadow .16s ease,background .16s ease}',
    '.streamer-gallery-univ.clickable-univ:hover{transform:translateY(-1px);background:rgba(255,255,255,.24)!important;box-shadow:0 10px 18px rgba(15,23,42,.14)}',
    '@keyframes podiumCardHoverFloat{0%{transform:translateY(0) scale(1)}40%{transform:translateY(-7px) scale(1.016)}100%{transform:translateY(-5px) scale(1.012)}}',
    '.streamer-gallery-card{position:relative;border-radius:22px;overflow:hidden;cursor:pointer;aspect-ratio:0.72;transition:transform .22s ease,box-shadow .22s ease,border-color .22s ease,filter .22s ease;display:flex;align-items:flex-end;border:1px solid rgba(255,255,255,.14);background:#0b1120;box-shadow:0 10px 28px rgba(15,23,42,.14),0 2px 10px rgba(15,23,42,.08);-webkit-tap-highlight-color:transparent;tap-highlight-color:transparent;outline:none}',
    '.streamer-gallery-card,.streamer-gallery-card *{-webkit-tap-highlight-color:transparent}',
    '.streamer-gallery-card:focus,.streamer-gallery-card:active,.streamer-gallery-card *:focus,.streamer-gallery-card *:active{outline:none!important}',
    '.streamer-gallery-card.inactive{filter:saturate(.92)}',
    '.streamer-gallery-card.retired{filter:grayscale(.16) saturate(.84);opacity:.84}',
    '.streamer-gallery-card:hover{box-shadow:0 10px 28px rgba(15,23,42,.14),0 2px 10px rgba(15,23,42,.08)}',
    '.streamer-gallery-card.is-selected{transform:none;outline:2px solid rgba(255,255,255,.26);outline-offset:2px;border-color:rgba(255,255,255,.14);box-shadow:0 10px 28px rgba(15,23,42,.14),0 2px 10px rgba(15,23,42,.08)}',
    '.streamer-gallery-card.is-selected::after{content:none}',

    '.streamer-gallery-rank{display:none}',
    '.streamer-gallery-act{position:absolute;top:12px;right:12px}',
    '.streamer-gallery-act .streamer-act-chip{min-width:40px;padding:4px 7px;font-size:10px;backdrop-filter:blur(10px);background:rgba(15,23,42,.58);border-color:rgba(255,255,255,.20);color:#fff;box-shadow:0 10px 18px rgba(15,23,42,.18);text-shadow:0 1px 2px rgba(0,0,0,.28)}',
    '.streamer-gallery-card img{transition:transform .3s ease}',
    '.streamer-gallery-overlay{position:absolute;inset:0;background:linear-gradient(180deg,rgba(15,23,42,.18) 0%,rgba(15,23,42,.32) 34%,rgba(15,23,42,.94) 100%);transition:background .22s ease}',
    '.streamer-gallery-bottom{position:relative;z-index:1;width:100%;padding:16px 14px 16px;text-align:left}',
    '.streamer-gallery-topline{display:flex;align-items:center;gap:6px;justify-content:space-between;margin-bottom:6px}',
    '.streamer-gallery-name{font-size:15px;font-weight:950;color:#fff;line-height:1.25;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;letter-spacing:-.02em;text-shadow:0 2px 10px rgba(0,0,0,.34)}',
    '.streamer-gallery-role{font-size:11px;color:rgba(255,255,255,.86);margin-bottom:8px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-shadow:0 1px 6px rgba(0,0,0,.28)}',
    '.streamer-gallery-meta{display:flex;align-items:center;gap:5px;flex-wrap:wrap;margin-bottom:10px}',
    '.streamer-gallery-univ-chip{display:inline-flex;align-items:center;gap:6px;padding:4px 8px;border-radius:999px;background:rgba(15,23,42,.46);border:1px solid rgba(255,255,255,.18);font-size:10px;font-weight:800;color:#fff;backdrop-filter:blur(8px);text-shadow:0 1px 2px rgba(0,0,0,.25)}',
    '.streamer-gallery-univ-chip.clickable-univ{cursor:pointer;transition:transform .16s ease,box-shadow .16s ease,background .16s ease;border-color:rgba(255,255,255,.24)}',
    '.streamer-gallery-univ-chip.clickable-univ:hover{transform:translateY(-1px);box-shadow:0 10px 18px rgba(15,23,42,.18)}',
    '.streamer-gallery-stats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px}',
    '.streamer-gallery-stat{padding:8px 8px 8px;border-radius:14px;background:rgba(15,23,42,.44);border:1px solid rgba(255,255,255,.14);backdrop-filter:blur(8px);box-shadow:0 10px 20px rgba(15,23,42,.14);min-height:62px;display:flex;flex-direction:column;justify-content:space-between;transition:transform .2s ease,background .2s ease,box-shadow .2s ease;transform-origin:center}',
    '.streamer-gallery-card:hover .streamer-gallery-stat{transform:scale(1.045)}',
    '.streamer-gallery-stat-label{font-size:9px;font-weight:800;color:rgba(255,255,255,.80);text-transform:uppercase;letter-spacing:.05em;text-shadow:0 1px 2px rgba(0,0,0,.25)}',
    '.streamer-gallery-stat-value{margin-top:4px;font-size:12px;font-weight:900;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-shadow:0 1px 4px rgba(0,0,0,.32);line-height:1.2}',
    '.streamer-gallery-stat-value--split{display:flex;flex-direction:column;gap:2px;white-space:normal;overflow:visible;text-overflow:clip}',
    '.streamer-gallery-stat-value--split span{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
    '.streamer-gallery-stat-value--em{font-size:13px;letter-spacing:-.02em}',
    '.streamer-gallery-stat-value--muted{color:rgba(255,255,255,.82);font-size:11px;font-weight:800}',
    '.streamer-gallery-univ-chip,.streamer-gallery-stat,.streamer-gallery-stat *{user-select:none;-webkit-user-select:none}',
    '.streamer-focus-layout{display:grid;grid-template-columns:minmax(280px,360px) minmax(0,1fr);gap:18px;align-items:start}',
    '.streamer-focus-sidebar,.streamer-focus-main{padding:14px;border-radius:22px;background:linear-gradient(180deg,rgba(255,255,255,.99),rgba(248,250,252,.95));border:1px solid rgba(148,163,184,.16);box-shadow:0 16px 30px rgba(15,23,42,.05)}',
    '.streamer-focus-section-title{font-size:12px;font-weight:900;color:var(--text2);margin-bottom:10px;letter-spacing:-.02em}',
    '.streamer-focus-list{display:flex;flex-direction:column;gap:14px;max-height:900px;overflow:auto;padding-right:4px}',
    '.streamer-focus-group{display:flex;flex-direction:column;gap:8px}',
    '.streamer-focus-group-title{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px 12px;border-radius:16px;color:#fff;font-size:12px;font-weight:900;box-shadow:0 12px 24px rgba(15,23,42,.12)}',
    '.streamer-focus-card-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;padding:2px 0}',
    '.streamer-focus-card{position:relative;border-radius:18px;overflow:hidden;cursor:pointer;aspect-ratio:0.78;border:1px solid rgba(148,163,184,.16);box-shadow:0 10px 22px rgba(15,23,42,.08);background:#0b1120;transition:transform .15s ease,box-shadow .15s ease,border-color .15s ease}',
    '.streamer-focus-card:hover{transform:translateY(-2px);box-shadow:0 14px 26px rgba(15,23,42,.12)}',
    '.streamer-focus-card.active{outline:2px solid rgba(255,255,255,.22);outline-offset:2px;border-color:rgba(255,255,255,.14)}',
    '.streamer-focus-card-fallback{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:900;color:rgba(255,255,255,.72);background:linear-gradient(160deg,rgba(148,163,184,.28),rgba(15,23,42,.16))}',
    '.streamer-focus-card-bottom{position:absolute;left:0;right:0;bottom:0;padding:10px 10px 12px;display:flex;flex-direction:column;gap:4px}',
    '.streamer-focus-card-bottom::before{content:"";position:absolute;left:0;right:0;bottom:0;height:72%;background:linear-gradient(180deg,rgba(15,23,42,0) 0%,rgba(15,23,42,.24) 28%,rgba(5,8,20,.78) 100%);pointer-events:none}',
    '.streamer-focus-card-bottom>*{position:relative;z-index:1}',
    '.streamer-focus-card-name{font-size:12px;font-weight:950;color:#fff;letter-spacing:-.02em;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-shadow:0 2px 8px rgba(0,0,0,.35)}',
    '.streamer-focus-card-sub{font-size:10.5px;font-weight:800;color:rgba(255,255,255,.82);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-shadow:0 1px 4px rgba(0,0,0,.35)}',
    '.streamer-focus-main-hero{position:relative;display:flex;gap:28px;padding:28px;border-radius:24px;overflow:hidden;align-items:stretch;flex-wrap:wrap;background:linear-gradient(135deg,rgba(15,23,42,.9),rgba(37,99,235,.82));box-shadow:0 20px 38px rgba(15,23,42,.16)}',
    '.streamer-focus-hero-bg{position:absolute;inset:0;background-size:cover;background-position:top center;filter:blur(18px) saturate(1.1);transform:scale(1.08);opacity:.30;pointer-events:none;z-index:0}',
    '.streamer-focus-hero-bg2{position:absolute;top:0;right:0;bottom:0;left:var(--hero-bg2-left,52%);background-repeat:no-repeat;background-size:contain;background-position:var(--hero-bg2-pos, right center);filter:blur(1.1px) saturate(1.04) brightness(1.02);opacity:var(--hero-bg2-op,.08);transform:scale(var(--hero-bg2-scale,1.04));transform-origin:right center;pointer-events:none;z-index:0;-webkit-mask-image:linear-gradient(90deg,transparent 0%, rgba(0,0,0,.28) 18%, rgba(0,0,0,.88) 42%, rgba(0,0,0,1) 100%);mask-image:linear-gradient(90deg,transparent 0%, rgba(0,0,0,.28) 18%, rgba(0,0,0,.88) 42%, rgba(0,0,0,1) 100%)}',
    '.streamer-focus-main-hero::before{content:"";position:absolute;inset:0;background:linear-gradient(135deg,rgba(2,6,23,.70),rgba(2,6,23,.22));pointer-events:none;z-index:0}',
    '.streamer-focus-main-hero::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(255,255,255,.10),transparent 48%);pointer-events:none;z-index:0}',
    '.streamer-focus-main-hero > :not(.streamer-focus-hero-bg){position:relative;z-index:1}',
    '.streamer-focus-photo{position:relative;border-radius:22px;overflow:hidden;width:clamp(200px,30vw,340px);height:clamp(270px,42vw,460px);background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.16);flex:0 0 auto}',
    '.streamer-focus-photo img{width:100%;height:100%;object-fit:cover;display:block}',
    '.streamer-focus-photo-fallback{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:48px;font-weight:900;color:rgba(255,255,255,.9)}',
    '.streamer-focus-copy{position:relative;z-index:1;display:flex;flex-direction:column;gap:14px;min-width:260px;flex:1;color:#fff}',
    '.streamer-focus-kicker{font-size:11px;font-weight:900;letter-spacing:.08em;text-transform:uppercase;color:rgba(255,255,255,.76)}',
    '.streamer-focus-title{font-size:30px;font-weight:950;letter-spacing:-.04em;line-height:1.08;color:#fff}',
    '.streamer-focus-chips{display:flex;align-items:center;gap:8px;flex-wrap:wrap}',
    '.streamer-focus-chip{display:inline-flex;align-items:center;gap:6px;padding:7px 11px;border-radius:999px;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.14);font-size:11px;font-weight:800;color:#fff;backdrop-filter:blur(8px)}',
    '.streamer-focus-desc{font-size:13px;line-height:1.65;color:rgba(255,255,255,.82)}',
    '.streamer-focus-statgrid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin-top:14px}',
    '.streamer-focus-stat{padding:13px 14px;border-radius:18px;background:linear-gradient(180deg,rgba(255,255,255,.99),rgba(248,250,252,.95));border:1px solid rgba(148,163,184,.16)}',
    '.streamer-focus-stat-label{font-size:10px;font-weight:900;color:var(--text3);letter-spacing:.05em}',
    '.streamer-focus-stat-value{margin-top:6px;font-size:18px;font-weight:950;color:var(--text1);letter-spacing:-.03em}',
    '.streamer-focus-note-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-top:10px}',
    '.streamer-focus-note{padding:13px 14px;border-radius:18px;background:linear-gradient(180deg,rgba(255,255,255,.98),rgba(248,250,252,.94));border:1px solid rgba(148,163,184,.14)}',
    '.streamer-focus-note-title{font-size:11px;font-weight:900;color:var(--text2)}',
    '.streamer-focus-note-desc{margin-top:6px;font-size:12px;line-height:1.6;color:var(--text3)}',
    '.streamer-empty{padding:20px}',
    'body.dark .streamer-hero,body.dark .streamer-toolbar-card,body.dark .streamer-content-card{background:linear-gradient(180deg,rgba(15,23,42,.94),rgba(15,23,42,.9));border-color:#334155;box-shadow:0 20px 38px rgba(0,0,0,.28),inset 0 1px 0 rgba(255,255,255,.03)}',
    'body.dark .streamer-hero-title{color:#f8fafc}',
    'body.dark .streamer-hero-desc{color:#94a3b8}',
    'body.dark .streamer-hero-badge,body.dark .streamer-summary-chip,body.dark .streamer-search,body.dark .streamer-elo-chip,body.dark .streamer-act-chip,body.dark .streamer-subgrp-chip{background:linear-gradient(180deg,rgba(15,23,42,.94),rgba(30,41,59,.88));border-color:#334155;color:#e2e8f0}',
    'body.dark .streamer-toolbar-card .pill{background:linear-gradient(180deg,rgba(15,23,42,.94),rgba(15,23,42,.9));border-color:#334155;color:#cbd5e1;box-shadow:0 12px 22px rgba(0,0,0,.18)}',
    'body.dark .streamer-toolbar-card .pill.on{background:linear-gradient(135deg,#1d4ed8,#2563eb);border-color:#2563eb;color:#eff6ff}',
    'body.dark .streamer-kpi-card{background:linear-gradient(180deg,rgba(15,23,42,.94),rgba(30,41,59,.9));border-color:#334155;box-shadow:0 16px 30px rgba(0,0,0,.22)}',
    'body.dark .streamer-kpi-value{color:#f8fafc}',
    'body.dark .streamer-kpi-label,body.dark .streamer-kpi-sub{color:#94a3b8}',
    'body.dark .streamer-focus-sidebar,body.dark .streamer-focus-main,body.dark .streamer-focus-stat,body.dark .streamer-focus-note,body.dark .streamer-focus-item{background:linear-gradient(180deg,rgba(15,23,42,.94),rgba(30,41,59,.9));border-color:#334155;color:#e2e8f0}',
    'body.dark .streamer-focus-item.active{background:linear-gradient(180deg,rgba(30,64,175,.34),rgba(29,78,216,.28));border-color:#2563eb}',
    'body.dark .streamer-focus-name,body.dark .streamer-focus-stat-value{color:#f8fafc}',
    'body.dark .streamer-focus-sub,body.dark .streamer-focus-note-desc,body.dark .streamer-focus-stat-label{color:#94a3b8}',
    'body.dark .streamer-focus-avatar{background:linear-gradient(180deg,#17263c,#0f172a);border-color:#334155;color:#cbd5e1}',
    'body.dark .streamer-table thead th{background:linear-gradient(180deg,#132033,#17263c);border-color:#334155;color:#e2e8f0}',
    'body.dark .streamer-table tbody td{background:linear-gradient(180deg,rgba(15,23,42,.94),rgba(15,23,42,.9));border-color:#334155;color:#e2e8f0}',
    'body.dark .streamer-avatar{background:linear-gradient(180deg,#17263c,#0f172a);border-color:#334155;color:#cbd5e1;box-shadow:0 12px 22px rgba(0,0,0,.18)}',
    'body.dark .streamer-gallery-card.is-selected{box-shadow:0 16px 30px rgba(0,0,0,.24);border-color:#334155}',
    '@media (max-width:980px){.streamer-kpi-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}',
    '@media (max-width:980px){.streamer-focus-layout{grid-template-columns:1fr}.streamer-focus-list{max-height:none}}',
    '@media (max-width:780px){.streamer-hero{flex-direction:column;padding:16px;border-radius:20px}.streamer-hero-title{font-size:20px}.streamer-hero-badges{justify-content:flex-start}.streamer-toolbar-card,.streamer-content-card{padding:10px}.streamer-gallery-grid{grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:var(--su-streamer-card-gap,9px);padding:16px}.streamer-search{max-width:none;flex:1 1 180px}.streamer-kpi-grid,.streamer-focus-statgrid,.streamer-focus-note-grid{grid-template-columns:1fr}.streamer-focus-card-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.streamer-focus-photo{width:100%;height:220px}.streamer-focus-main-hero{gap:18px;padding:18px}.streamer-focus-copy{min-width:0}.streamer-focus-hero-bg2{display:none}}'
  ].join('');
  document.head.appendChild(s);
})();

function _tpDateNum(v){
  const raw = String(v || '').trim();
  if(!raw) return 0;
  let m = raw.match(/^(\d{4})[.\-\/](\d{2})[.\-\/](\d{2})/);
  if(!m) m = raw.match(/^(\d{4})(\d{2})(\d{2})/);
  if(!m) return 0;
  return Number(`${m[1]}${m[2]}${m[3]}`);
}
function _tpDaysAgoNum(days){
  const d = new Date();
  d.setHours(0,0,0,0);
  d.setDate(d.getDate() - Number(days||0));
  const y = d.getFullYear();
  const m = String(d.getMonth()+1).padStart(2,'0');
  const da = String(d.getDate()).padStart(2,'0');
  return Number(`${y}${m}${da}`);
}

function _getStreamerActivityMeta(p){
  const hist = Array.isArray(p?.history) ? p.history : [];
  const lastNum = hist.reduce((mx,h)=>Math.max(mx,_tpDateNum(h?.date)),0);
  if(!lastNum) return { key:'none', label:'', title:'전적 없음' };
  const _7agoN = _tpDaysAgoNum(7);
  const _30agoN = _tpDaysAgoNum(30);
  if(lastNum >= _7agoN) return { key:'hot', label:'LIVE', title:'최근 활동 7일 이내' };
  if(lastNum >= _30agoN) return { key:'warm', label:'WARM', title:'활동 중 30일 이내' };
  return { key:'none', label:'', title:'최근 활동 적음' };
}

function _tpHistAllForPlayer(p){
  try{
    if(typeof ensureRenderMatchIdsPrepared==='function') ensureRenderMatchIdsPrepared();
    const base = (typeof preparePlayerHistoryBaseData==='function') ? preparePlayerHistoryBaseData(p) : null;
    const normMap = base?.normMap || ((v)=>{ const s=String(v||'-'); return s.replace(/^📍\s*/,'').trim() || '-'; });
    const histDupKey = base?.histDupKey || (h=>{
      if(h?.matchId) return `mid:${h.matchId}`;
      const date = (h?.date||'').trim();
      const map = normMap(h?.map||'-');
      const opp = (h?.opp||'').trim();
      const mode = (h?.mode||'').trim();
      const result = (h?.result||'').trim();
      return `${date}|${map}|${[p.name,opp].filter(x=>x).sort().join('|')}|${mode}|${result}`;
    });
    const dedupedHistory = base?.dedupedHistory || (p.history||[]);
    const histNoResSet = base?.histNoResSet || new Set();
    const hasDetailedKey = base?.hasDetailedKey || new Set();
    const prunedHistory = base?.prunedHistory || dedupedHistory;
    const prunedHistory2 = base?.prunedHistory2 || prunedHistory;
    const existingMatchIds = base?.existingMatchIds || new Set(prunedHistory2.map(h=>h.matchId).filter(Boolean));
    const existingKeys = base?.existingKeys || new Set(prunedHistory2.map(h=>histDupKey(h)));
    const histAll = (typeof collectPlayerExtraHistoryData==='function')
      ? collectPlayerExtraHistoryData({
          player: p,
          dedupedHistory,
          prunedHistory,
          prunedHistory2,
          existingMatchIds,
          existingKeys,
          histNoResSet,
          histDupKey,
          normMap,
          hasDetailedKey
        }).histAll
      : [...prunedHistory2];
    return Array.isArray(histAll) ? histAll : [];
  }catch(e){
    return Array.isArray(p?.history) ? p.history : [];
  }
}

function _bindTotalDelegatedEvents(){
  if(window.__totalDelegatedBound) return;
  window.__totalDelegatedBound = true;
  document.addEventListener('click', (e)=>{
    const el = e.target && e.target.closest ? e.target.closest('[data-tp-action]') : null;
    if(!el) return;
    const action = el.getAttribute('data-tp-action') || '';
    if(action === 'open-player'){
      e.preventDefault();
      const name = el.getAttribute('data-tp-player') || '';
      if(!name) return;
      try{ window._tpSelectedPlayer = name; }catch(_){}
      _syncTpSelectedCards(name);
      try{
        if(typeof openPlayerModal === 'function') openPlayerModal(name);
      }catch(_){}
    }
  });
}

function _getTpSelectedPlayerName(){
  try{
    const st = (typeof getPlayerDetailState === 'function')
      ? getPlayerDetailState()
      : (window.PlayerDetailState || {});
    return String(window._tpSelectedPlayer || st.currentName || '').trim();
  }catch(e){
    return String(window._tpSelectedPlayer || '').trim();
  }
}

function _isTpSelectableCard(node){
  return !!(node && node.classList && (
    node.classList.contains('streamer-gallery-card') ||
    node.classList.contains('tier-rank-card') ||
    node.classList.contains('tier-podium-card') ||
    node.classList.contains('tier-podium-rest-item') ||
    node.classList.contains('tier-compact-item') ||
    node.classList.contains('tier-group-card')
  ));
}

function _isTpPlayerSelected(name){
  return !!name && _getTpSelectedPlayerName() === String(name).trim();
}

function _syncTpSelectedCards(name){
  const selectedName = String(name || _getTpSelectedPlayerName() || '').trim();
  document.querySelectorAll('.streamer-gallery-card.is-selected,.tier-rank-card.is-selected,.tier-podium-card.is-selected,.tier-podium-rest-item.is-selected,.tier-compact-item.is-selected,.tier-group-card.is-selected')
    .forEach(node=>node.classList.remove('is-selected'));
  if(!selectedName) return;
  document.querySelectorAll('[data-tp-player]').forEach(node=>{
    if(!_isTpSelectableCard(node)) return;
    if((node.getAttribute('data-tp-player') || '').trim() !== selectedName) return;
    node.classList.add('is-selected');
  });
}

function _parseTotalSearch(qRaw){
  const q=(qRaw||'').trim().toLowerCase();
  const _RMAP={'테란':'T','테':'T','저그':'Z','저':'Z','프로토스':'P','프토':'P','프':'P','종족미정':'N','미정':'N','?':'N'};
  const _GMAP={'여':'F','여자':'F','남':'M','남자':'M'};
  const toks=q.split(/\s+/).filter(Boolean);
  let rf='', gf='';
  const inc=[], exc=[];
  toks.forEach(t=>{
    if(t.startsWith('-')&&t.length>1){ exc.push(t.slice(1)); return; }
    if(_RMAP[t]) rf=_RMAP[t];
    else if(_GMAP[t]) gf=_GMAP[t];
    else inc.push(t);
  });
  return {rf,gf,inc,exc};
}

function totalApplySearchFilter(){
  const {rf,gf,inc,exc}=_parseTotalSearch(totalSearch);
  const qHas=rf||gf||inc.length||exc.length;
  // 테이블 뷰
  const table=document.querySelector('#rcont table');
  if(table){
    const rows=[...table.querySelectorAll('tr[data-player-row="1"]')];
    rows.forEach(tr=>{
      if(!qHas){ tr.style.display=''; return; }
      const hay=(tr.getAttribute('data-q')||'');
      const r=tr.getAttribute('data-r')||'';
      const g=tr.getAttribute('data-g')||'';
      const okRace=!rf||r===rf;
      const okGender=!gf||g===gf;
      const okInc=inc.length===0||inc.every(t=>hay.includes(t));
      const okExc=exc.length===0||exc.every(t=>!hay.includes(t));
      tr.style.display=(okRace&&okGender&&okInc&&okExc)?'':'none';
    });
    table.querySelectorAll('tr[data-univ-header]').forEach(h=>{
      const u=h.getAttribute('data-univ-header')||'';
      const any=rows.some(r=>r.style.display!== 'none' && r.getAttribute('data-univ')===u);
      h.style.display=any?'':'none';
    });
  }
  // 갤러리 뷰
  const cont=document.getElementById('rcont');
  if(!cont) return;
  const cards=[...cont.querySelectorAll('[data-player-card="1"]')];
  if(!cards.length) return;
  cards.forEach(card=>{
    if(!qHas){ card.style.display=''; return; }
    const hay=(card.getAttribute('data-q')||'');
    const r=card.getAttribute('data-r')||'';
    const g=card.getAttribute('data-g')||'';
    const okRace=!rf||r===rf;
    const okGender=!gf||g===gf;
    const okInc=inc.length===0||inc.every(t=>hay.includes(t));
    const okExc=exc.length===0||exc.every(t=>!hay.includes(t));
    card.style.display=(okRace&&okGender&&okInc&&okExc)?'':'none';
  });
  // 갤러리 대학 섹션 헤더 숨김
  cont.querySelectorAll('[data-gallery-univ-header]').forEach(h=>{
    const u=h.getAttribute('data-gallery-univ-header')||'';
    const any=cards.some(c=>c.style.display!=='none'&&c.getAttribute('data-univ')===u);
    h.style.display=any?'':'none';
  });
  // 상세형 목록 필터
  const focusRows=[...cont.querySelectorAll('[data-focus-row="1"]')];
  focusRows.forEach(row=>{
    if(!qHas){ row.style.display=''; return; }
    const hay=(row.getAttribute('data-q')||'');
    const r=row.getAttribute('data-r')||'';
    const g=row.getAttribute('data-g')||'';
    const okRace=!rf||r===rf;
    const okGender=!gf||g===gf;
    const okInc=inc.length===0||inc.every(t=>hay.includes(t));
    const okExc=exc.length===0||exc.every(t=>!hay.includes(t));
    row.style.display=(okRace&&okGender&&okInc&&okExc)?'':'none';
  });
  cont.querySelectorAll('[data-focus-univ-header]').forEach(h=>{
    const u=h.getAttribute('data-focus-univ-header')||'';
    const any=focusRows.some(r=>r.style.display!=='none'&&r.getAttribute('data-univ')===u);
    h.style.display=any?'':'none';
  });
  if(totalViewMode==='focus'){
    const visibleFocus = focusRows.filter(r=>r.style.display!=='none');
    if(visibleFocus.length && !visibleFocus.some(r => (r.getAttribute('data-focus-name')||'') === totalFocusPlayer)){
      totalFocusPlayer = visibleFocus[0].getAttribute('data-focus-name') || '';
      render();
      return;
    }
  }
}

function bulkApplySearchFilter(){
  const table=document.querySelector('#rcont table');
  if(!table) return;
  const q=(_bulkEditSearch||'').trim().toLowerCase();
  const rows=[...table.querySelectorAll('tr[data-player-row="1"]')];
  if(!_bulkEditMode || !q) return;
  rows.forEach(tr=>{
    if(tr.style.display==='none') return;
    const hay=(tr.getAttribute('data-q')||'');
    if(!hay.includes(q)) tr.style.display='none';
  });
  table.querySelectorAll('tr[data-univ-header]').forEach(h=>{
    const u=h.getAttribute('data-univ-header')||'';
    const any=rows.some(r=>r.style.display!== 'none' && r.getAttribute('data-univ')===u);
    h.style.display=any?'':'none';
  });
}
