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
    '.streamer-hero-kicker{font-size:var(--fs-caption);font-weight:900;letter-spacing:.08em;color:#2563eb;text-transform:uppercase}',
    '.streamer-hero-title{font-size:24px;font-weight:950;letter-spacing:-.03em;color:var(--text1);line-height:1.15}',
    '.streamer-hero-desc{font-size:var(--fs-base);line-height:1.6;color:var(--text3)}',
    '.streamer-hero-badges{display:flex;flex-wrap:wrap;gap:8px;justify-content:flex-end}',
    '.streamer-hero-badge{display:inline-flex;align-items:center;gap:6px;padding:8px 12px;border-radius:999px;background:rgba(255,255,255,.9);border:1px solid rgba(148,163,184,.16);font-size:var(--fs-sm);font-weight:800;color:var(--text2);box-shadow:0 10px 20px rgba(15,23,42,.04)}',
    '.streamer-toolbar-card,.streamer-content-card{padding:12px 14px;border-radius:22px;background:linear-gradient(180deg,rgba(255,255,255,.98),rgba(248,250,252,.94));border:1px solid rgba(148,163,184,.18);box-shadow:0 16px 32px rgba(15,23,42,.05)}',
    '.streamer-toolbar-card .pill{border-radius:999px;border:1px solid rgba(148,163,184,.18);background:linear-gradient(180deg,rgba(255,255,255,.96),rgba(248,250,252,.92));color:var(--text2);font-weight:800;box-shadow:0 8px 16px rgba(15,23,42,.04);transition:transform .15s,box-shadow .15s,border-color .15s,background .15s}',
    '.streamer-toolbar-card .pill:hover{transform:translateY(-1px);box-shadow:0 14px 24px rgba(15,23,42,.08)}',
    '.streamer-toolbar-card .pill.on{background:linear-gradient(135deg,#2563eb,#3b82f6);border-color:#2563eb;color:#fff;box-shadow:0 14px 26px rgba(37,99,235,.24)}',
    '.streamer-toolbar-card .pill.warn-on{background:linear-gradient(135deg,#f59e0b,#f97316);border-color:#f59e0b;color:#fff;box-shadow:0 14px 26px rgba(245,158,11,.22)}',
    '.streamer-toolbar-card .pill.edit-on{background:linear-gradient(135deg,#2563eb,#60a5fa);border-color:#2563eb;color:#fff;box-shadow:0 14px 26px rgba(37,99,235,.22)}',
    '.streamer-search{padding:8px 12px;border:1px solid rgba(148,163,184,.18);border-radius:14px;font-size:var(--fs-sm);min-width:140px;max-width:240px;flex:0 1 210px;background:linear-gradient(180deg,rgba(255,255,255,.98),rgba(248,250,252,.94));color:var(--text);box-shadow:inset 0 1px 0 rgba(255,255,255,.7)}',
    '.streamer-summary-chip{display:inline-flex;align-items:center;gap:6px;padding:7px 10px;border-radius:999px;background:rgba(248,250,252,.94);border:1px solid rgba(148,163,184,.16);font-size:var(--fs-caption);font-weight:800;color:var(--text2)}',
    '.streamer-kpi-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}',
    '.streamer-kpi-card{padding:14px 15px;border-radius:20px;background:linear-gradient(180deg,rgba(255,255,255,.99),rgba(248,250,252,.95));border:1px solid rgba(148,163,184,.16);box-shadow:0 14px 28px rgba(15,23,42,.05)}',
    '.streamer-kpi-label{font-size:var(--fs-caption);font-weight:900;letter-spacing:.04em;color:var(--text3)}',
    '.streamer-kpi-value{margin-top:8px;font-size:24px;font-weight:950;letter-spacing:-.03em;color:var(--text1)}',
    '.streamer-kpi-sub{margin-top:5px;font-size:var(--fs-caption);font-weight:700;color:var(--text3)}',
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
    '.streamer-univ-count{position:relative;z-index:1;font-size:var(--fs-caption);color:rgba(255,255,255,.86);font-weight:700;white-space:nowrap}',
    '.streamer-subgrp td{padding:0!important;border:none!important;background:transparent!important;box-shadow:none!important}',
    '.streamer-subgrp-chip{display:inline-flex;align-items:center;gap:6px;padding:7px 12px;border-radius:999px;font-size:var(--fs-sm);font-weight:800;background:rgba(59,130,246,.08);color:var(--text2);border:1px solid rgba(59,130,246,.14)}',
    '.streamer-player-cell{display:flex;align-items:center;gap:10px;min-width:0}',
    '.streamer-avatar{width:42px;height:42px;border-radius:var(--su_profile_radius,50%);flex-shrink:0;display:inline-flex;align-items:center;justify-content:center;overflow:hidden;border:2px solid rgba(148,163,184,.18);background:linear-gradient(180deg,#eef2ff,#e2e8f0);font-size:var(--fs-caption);font-weight:900;color:#64748b;position:relative;cursor:pointer;box-shadow:0 10px 18px rgba(15,23,42,.07)}',
    '.streamer-name-stack{display:flex;flex-direction:column;gap:4px;min-width:0}',
    '.streamer-name-line{display:flex;align-items:center;gap:4px;flex-wrap:wrap;min-width:0}',
    '.streamer-name-link{font-weight:800;cursor:pointer;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
    '.streamer-mini-meta{display:flex;align-items:center;gap:6px;flex-wrap:wrap}',
    '.streamer-rank-box{display:flex;flex-direction:column;align-items:center;gap:4px}',
    '.streamer-stat-num{font-weight:900}',
    '.streamer-wr-box{display:flex;flex-direction:column;align-items:center;gap:3px}',
    '.streamer-elo-chip,.streamer-act-chip{display:inline-flex;align-items:center;justify-content:center;min-width:54px;padding:5px 8px;border-radius:999px;border:1px solid rgba(148,163,184,.16);font-size:var(--fs-caption);font-weight:900;background:rgba(248,250,252,.96)}',
    '.streamer-act-chip.hot{color:#16a34a;background:linear-gradient(180deg,rgba(240,253,244,.98),rgba(220,252,231,.92));border-color:rgba(34,197,94,.26)}',
    '.streamer-act-chip.warm{color:#d97706;background:linear-gradient(180deg,rgba(255,251,235,.98),rgba(254,243,199,.92));border-color:rgba(245,158,11,.26)}',
    '.streamer-act-chip.cool{color:#64748b;background:linear-gradient(180deg,rgba(248,250,252,.98),rgba(241,245,249,.92));border-color:rgba(148,163,184,.24)}',
    '.streamer-gallery-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(188px,1fr));gap:14px;padding:4px 0}',
    '.streamer-gallery-head{grid-column:1/-1;display:flex;align-items:center;gap:8px;padding:14px 16px;border-radius:20px;position:relative;overflow:hidden;box-shadow:0 16px 30px rgba(15,23,42,.12);margin-top:10px}',
    '.streamer-gallery-head::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(255,255,255,.18),transparent 44%);pointer-events:none}',
    '.streamer-gallery-univ{position:relative;z-index:1;background:rgba(255,255,255,.18)!important;border:1px solid rgba(255,255,255,.24);backdrop-filter:blur(8px)}',
    '.streamer-gallery-univ.clickable-univ{cursor:pointer;transition:transform .16s ease,box-shadow .16s ease,background .16s ease}',
    '.streamer-gallery-univ.clickable-univ:hover{transform:translateY(-1px);background:rgba(255,255,255,.24)!important;box-shadow:0 10px 18px rgba(15,23,42,.14)}',
    '@keyframes podiumCardHoverFloat{0%{transform:translateY(0) scale(1)}40%{transform:translateY(-7px) scale(1.016)}100%{transform:translateY(-5px) scale(1.012)}}',
    '.streamer-gallery-card{position:relative;border-radius:22px;overflow:hidden;cursor:pointer;min-height:308px;transition:transform .22s ease,box-shadow .22s ease,border-color .22s ease,filter .22s ease;display:flex;align-items:flex-end;border:1px solid rgba(148,163,184,.18);box-shadow:0 14px 28px rgba(15,23,42,.10);-webkit-tap-highlight-color:transparent;tap-highlight-color:transparent;outline:none}',
    '.streamer-gallery-card,.streamer-gallery-card *{-webkit-tap-highlight-color:transparent}',
    '.streamer-gallery-card:focus,.streamer-gallery-card:active,.streamer-gallery-card *:focus,.streamer-gallery-card *:active{outline:none!important}',
    '.streamer-gallery-card.inactive{filter:saturate(.92)}',
    '.streamer-gallery-card.retired{filter:grayscale(.16) saturate(.84);opacity:.84}',
    '.streamer-gallery-card:hover{box-shadow:0 22px 42px rgba(15,23,42,.18)}',
    '.streamer-gallery-card:hover img{transform:scale(1.05)}',
    '.streamer-gallery-card.is-selected{transform:translateY(-2px);border-color:color-mix(in srgb,var(--card-accent,#60a5fa) 58%, rgba(148,163,184,.18));box-shadow:0 18px 34px rgba(15,23,42,.14),0 0 0 2px color-mix(in srgb,var(--card-accent,#60a5fa) 30%, transparent)}',
    '.streamer-gallery-card.is-selected::after{content:"";position:absolute;inset:0;border-radius:inherit;box-shadow:inset 0 0 0 2px color-mix(in srgb,var(--card-accent,#60a5fa) 54%, transparent);pointer-events:none;z-index:2}',

    '.streamer-gallery-rank{position:absolute;top:12px;left:12px;font-size:10px;font-weight:900;color:rgba(255,255,255,.9)}',
    '.streamer-gallery-act{position:absolute;top:12px;right:12px}',
    '.streamer-gallery-act .streamer-act-chip{min-width:40px;padding:4px 7px;font-size:10px;backdrop-filter:blur(10px);background:rgba(15,23,42,.58);border-color:rgba(255,255,255,.20);color:#fff;box-shadow:0 10px 18px rgba(15,23,42,.18);text-shadow:0 1px 2px rgba(0,0,0,.28)}',
    '.streamer-gallery-card img{transition:transform .3s ease}',
    '.streamer-gallery-overlay{position:absolute;inset:0;background:linear-gradient(180deg,rgba(15,23,42,.18) 0%,rgba(15,23,42,.32) 34%,rgba(15,23,42,.94) 100%);transition:background .22s ease}',
    '.streamer-gallery-bottom{position:relative;z-index:1;width:100%;padding:16px 14px 16px;text-align:left}',
    '.streamer-gallery-topline{display:flex;align-items:center;gap:6px;justify-content:space-between;margin-bottom:6px}',
    '.streamer-gallery-name{font-size:var(--fs-md);font-weight:950;color:#fff;line-height:1.25;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;letter-spacing:-.02em;text-shadow:0 2px 10px rgba(0,0,0,.34)}',
    '.streamer-gallery-role{font-size:var(--fs-caption);color:rgba(255,255,255,.86);margin-bottom:8px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-shadow:0 1px 6px rgba(0,0,0,.28)}',
    '.streamer-gallery-meta{display:flex;align-items:center;gap:5px;flex-wrap:wrap;margin-bottom:10px}',
    '.streamer-gallery-univ-chip{display:inline-flex;align-items:center;gap:6px;padding:4px 8px;border-radius:999px;background:rgba(15,23,42,.46);border:1px solid rgba(255,255,255,.18);font-size:10px;font-weight:800;color:#fff;backdrop-filter:blur(8px);text-shadow:0 1px 2px rgba(0,0,0,.25)}',
    '.streamer-gallery-univ-chip.clickable-univ{cursor:pointer;transition:transform .16s ease,box-shadow .16s ease,background .16s ease;border-color:rgba(255,255,255,.24)}',
    '.streamer-gallery-univ-chip.clickable-univ:hover{transform:translateY(-1px);box-shadow:0 10px 18px rgba(15,23,42,.18)}',
    '.streamer-gallery-stats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px}',
    '.streamer-gallery-stat{padding:8px 8px 8px;border-radius:14px;background:rgba(15,23,42,.44);border:1px solid rgba(255,255,255,.14);backdrop-filter:blur(8px);box-shadow:0 10px 20px rgba(15,23,42,.14);min-height:62px;display:flex;flex-direction:column;justify-content:space-between;transition:transform .2s ease,background .2s ease,box-shadow .2s ease;transform-origin:center}',
    '.streamer-gallery-card:hover .streamer-gallery-stat,.streamer-gallery-card.is-selected .streamer-gallery-stat{transform:scale(1.045)}',
    '.streamer-gallery-stat-label{font-size:9px;font-weight:800;color:rgba(255,255,255,.80);text-transform:uppercase;letter-spacing:.05em;text-shadow:0 1px 2px rgba(0,0,0,.25)}',
    '.streamer-gallery-stat-value{margin-top:4px;font-size:var(--fs-sm);font-weight:900;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-shadow:0 1px 4px rgba(0,0,0,.32);line-height:1.2}',
    '.streamer-gallery-stat-value--split{display:flex;flex-direction:column;gap:2px;white-space:normal;overflow:visible;text-overflow:clip}',
    '.streamer-gallery-stat-value--split span{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
    '.streamer-gallery-stat-value--em{font-size:var(--fs-base);letter-spacing:-.02em}',
    '.streamer-gallery-stat-value--muted{color:rgba(255,255,255,.82);font-size:var(--fs-caption);font-weight:800}',
    '.streamer-gallery-univ-chip,.streamer-gallery-stat,.streamer-gallery-stat *{user-select:none;-webkit-user-select:none}',
    '.streamer-focus-layout{display:grid;grid-template-columns:minmax(280px,360px) minmax(0,1fr);gap:14px;align-items:start}',
    '.streamer-focus-sidebar,.streamer-focus-main{padding:14px;border-radius:22px;background:linear-gradient(180deg,rgba(255,255,255,.99),rgba(248,250,252,.95));border:1px solid rgba(148,163,184,.16);box-shadow:0 16px 30px rgba(15,23,42,.05)}',
    '.streamer-focus-section-title{font-size:var(--fs-sm);font-weight:900;color:var(--text2);margin-bottom:10px;letter-spacing:-.02em}',
    '.streamer-focus-list{display:flex;flex-direction:column;gap:10px;max-height:900px;overflow:auto;padding-right:4px}',
    '.streamer-focus-group{display:flex;flex-direction:column;gap:8px}',
    '.streamer-focus-group-title{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px 12px;border-radius:var(--r2);color:#fff;font-size:var(--fs-sm);font-weight:900;box-shadow:0 12px 24px rgba(15,23,42,.12)}',
    '.streamer-focus-item{display:flex;align-items:center;gap:10px;padding:10px 11px;border-radius:18px;border:1px solid rgba(148,163,184,.14);background:linear-gradient(180deg,rgba(255,255,255,.98),rgba(248,250,252,.94));cursor:pointer;transition:transform .15s,box-shadow .15s,border-color .15s}',
    '.streamer-focus-item:hover{transform:translateY(-1px);box-shadow:0 12px 24px rgba(15,23,42,.08)}',
    '.streamer-focus-item.active{border-color:#2563eb;box-shadow:0 16px 28px rgba(37,99,235,.14);background:linear-gradient(180deg,rgba(239,246,255,.98),rgba(219,234,254,.92))}',
    '.streamer-focus-avatar{width:54px;height:54px;border-radius:18px;flex-shrink:0;position:relative;overflow:hidden;background:linear-gradient(180deg,#eef2ff,#e2e8f0);display:flex;align-items:center;justify-content:center;font-size:var(--fs-lg);font-weight:900;color:#64748b;border:1px solid rgba(148,163,184,.18)}',
    '.streamer-focus-meta{display:flex;flex-direction:column;gap:5px;min-width:0;flex:1}',
    '.streamer-focus-name{font-size:14px;font-weight:900;color:var(--text1);display:flex;align-items:center;gap:6px;min-width:0}',
    '.streamer-focus-sub{font-size:var(--fs-caption);color:var(--text3);display:flex;align-items:center;gap:6px;flex-wrap:wrap}',
    '.streamer-focus-main-hero{position:relative;display:grid;grid-template-columns:minmax(170px,220px) minmax(0,1fr);gap:18px;padding:18px;border-radius:24px;overflow:hidden;background:linear-gradient(135deg,rgba(15,23,42,.9),rgba(37,99,235,.82));box-shadow:0 20px 38px rgba(15,23,42,.16)}',
    '.streamer-focus-main-hero::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(255,255,255,.12),transparent 42%);pointer-events:none}',
    '.streamer-focus-photo{position:relative;border-radius:22px;overflow:hidden;min-height:260px;background:rgba(255,255,255,.14);border:1px solid rgba(255,255,255,.16)}',
    '.streamer-focus-photo img{width:100%;height:100%;object-fit:cover;display:block}',
    '.streamer-focus-photo-fallback{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:48px;font-weight:900;color:rgba(255,255,255,.9)}',
    '.streamer-focus-copy{position:relative;z-index:1;display:flex;flex-direction:column;gap:10px;min-width:0;color:#fff}',
    '.streamer-focus-kicker{font-size:var(--fs-caption);font-weight:900;letter-spacing:.08em;text-transform:uppercase;color:rgba(255,255,255,.76)}',
    '.streamer-focus-title{font-size:30px;font-weight:950;letter-spacing:-.04em;line-height:1.08;color:#fff}',
    '.streamer-focus-chips{display:flex;align-items:center;gap:8px;flex-wrap:wrap}',
    '.streamer-focus-chip{display:inline-flex;align-items:center;gap:6px;padding:7px 11px;border-radius:999px;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.14);font-size:var(--fs-caption);font-weight:800;color:#fff;backdrop-filter:blur(8px)}',
    '.streamer-focus-desc{font-size:var(--fs-base);line-height:1.65;color:rgba(255,255,255,.82)}',
    '.streamer-focus-statgrid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin-top:14px}',
    '.streamer-focus-stat{padding:13px 14px;border-radius:18px;background:linear-gradient(180deg,rgba(255,255,255,.99),rgba(248,250,252,.95));border:1px solid rgba(148,163,184,.16)}',
    '.streamer-focus-stat-label{font-size:10px;font-weight:900;color:var(--text3);letter-spacing:.05em}',
    '.streamer-focus-stat-value{margin-top:6px;font-size:var(--fs-lg);font-weight:950;color:var(--text1);letter-spacing:-.03em}',
    '.streamer-focus-note-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-top:10px}',
    '.streamer-focus-note{padding:13px 14px;border-radius:18px;background:linear-gradient(180deg,rgba(255,255,255,.98),rgba(248,250,252,.94));border:1px solid rgba(148,163,184,.14)}',
    '.streamer-focus-note-title{font-size:var(--fs-caption);font-weight:900;color:var(--text2)}',
    '.streamer-focus-note-desc{margin-top:6px;font-size:var(--fs-sm);line-height:1.6;color:var(--text3)}',
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
    'body.dark .streamer-gallery-card.is-selected{box-shadow:0 20px 38px rgba(0,0,0,.32),0 0 0 2px color-mix(in srgb,var(--card-accent,#60a5fa) 34%, transparent);border-color:color-mix(in srgb,var(--card-accent,#60a5fa) 56%, #334155)}',
    '@media (max-width:980px){.streamer-kpi-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}',
    '@media (max-width:980px){.streamer-focus-layout{grid-template-columns:1fr}.streamer-focus-list{max-height:none}.streamer-focus-main-hero{grid-template-columns:1fr}}',
    '@media (max-width:780px){.streamer-hero{flex-direction:column;padding:16px;border-radius:20px}.streamer-hero-title{font-size:20px}.streamer-hero-badges{justify-content:flex-start}.streamer-toolbar-card,.streamer-content-card{padding:10px}.streamer-gallery-grid{grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px}.streamer-search{max-width:none;flex:1 1 180px}.streamer-kpi-grid,.streamer-focus-statgrid,.streamer-focus-note-grid{grid-template-columns:1fr}.streamer-gallery-card{min-height:276px}.streamer-gallery-stats{grid-template-columns:repeat(2,minmax(0,1fr))}.streamer-gallery-stat--wide{grid-column:1/-1}.streamer-focus-title{font-size:24px}.streamer-focus-photo{min-height:220px}}'
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

function rTotal(C,T){
  T.innerText='🎬 전체 스타크래프트 스트리머 리스트';
  try{ _bindTotalDelegatedEvents(); }catch(e){}
  const _pl = (typeof players !== 'undefined' && Array.isArray(players)) ? players : null;
  const _getUnivs = (typeof getAllUnivs === 'function') ? getAllUnivs : null;
  if(!_pl || !_getUnivs){
    const msg = (typeof players === 'undefined')
      ? '데이터 로딩 중...'
      : '스트리머 데이터를 불러올 수 없습니다.';
    C.innerHTML = `<div class="empty-state"><div class="empty-state-icon">⏳</div><div class="empty-state-title">${msg}</div><div class="empty-state-desc">새로고침 후 다시 시도해주세요.</div></div>`;
    return;
  }
  try{
    if(!window.__streamer_hist_ready && typeof _rebuildAllPlayerHistoryCore==='function'){
      const hasMatchData = ((typeof miniM!=='undefined'&&miniM?miniM.length:0)
        + (typeof univM!=='undefined'&&univM?univM.length:0)
        + (typeof ckM!=='undefined'&&ckM?ckM.length:0)
        + (typeof proM!=='undefined'&&proM?proM.length:0)
        + (typeof indM!=='undefined'&&indM?indM.length:0)
        + (typeof gjM!=='undefined'&&gjM?gjM.length:0)
        + (typeof ttM!=='undefined'&&ttM?ttM.length:0)
        + (typeof comps!=='undefined'&&comps?comps.length:0)
        + (typeof tourneys!=='undefined'&&tourneys?tourneys.length:0)) > 0;
      const hasAnyHistory = _pl.some(p=>Array.isArray(p?.history) && p.history.length);
      if(hasMatchData && !hasAnyHistory){
        // 이름/UI 먼저 렌더 후 다음 프레임에 히스토리 재빌드 → 이름 즉시 표시
        window.__streamer_hist_ready = true;
        requestAnimationFrame(()=>{
          try{
            _rebuildAllPlayerHistoryCore();
            if(typeof render==='function') render();
          }catch(e){}
        });
        // 첫 렌더는 히스토리 없이 진행 (이름·티어 즉시 표시)
      }
    }
  }catch(e){}
  // 랭킹 스냅샷 업데이트 (하루 1회)
  if(typeof updateRankSnapshot === 'function') updateRankSnapshot();
  const raceOpts=['전체','T','Z','P','N'];
  const _showBulk=isLoggedIn&&_bulkEditMode;
  const _ncols=(isLoggedIn?11:10)+(_showBulk?1:0);
  const _viewLabel=totalViewMode==='gallery'?'카드형':(totalViewMode==='focus'?'상세형':'리스트형');
  const _visiblePlayers = _pl.filter(p=>{
    if(!p || p.retired) return false;
    if(totalRaceFilter!=='전체' && p.race!==totalRaceFilter) return false;
    if(totalHideNoRecord && (Number(p.win||0)+Number(p.loss||0))<=0) return false;
    return true;
  });
  const _activeUnivCount = new Set(_visiblePlayers.map(p=>p.univ).filter(Boolean)).size;
  const _photoCount = _visiblePlayers.filter(p=>String(p.photo||'').trim()).length;
  const _roleCount = _visiblePlayers.filter(p=>p.role && MAIN_ROLES.includes(p.role)).length;
  const _liveCount = _visiblePlayers.filter(p=>_getStreamerActivityMeta(p).key==='hot').length;
  const _warmCount = _visiblePlayers.filter(p=>_getStreamerActivityMeta(p).key==='warm').length;
  const _hasRecordCount = _visiblePlayers.filter(p=>(Number(p?.win||0)+Number(p?.loss||0))>0).length;
  const _noRecordCount = Math.max(0, _visiblePlayers.length - _hasRecordCount);
  const _kpiBar = totalViewMode==='gallery'
    ? `<div class="streamer-kpi-grid">
        <article class="streamer-kpi-card">
          <div class="streamer-kpi-label">표시 스트리머</div>
          <div class="streamer-kpi-value">${_visiblePlayers.length}</div>
          <div class="streamer-kpi-sub">현재 필터 기준 표시 인원</div>
        </article>
        <article class="streamer-kpi-card">
          <div class="streamer-kpi-label">기록 보유</div>
          <div class="streamer-kpi-value" style="color:#2563eb">${_hasRecordCount}</div>
          <div class="streamer-kpi-sub">전적 있음 ${_hasRecordCount}명 · 전적 없음 ${_noRecordCount}명</div>
        </article>
        <article class="streamer-kpi-card">
          <div class="streamer-kpi-label">대학 분포</div>
          <div class="streamer-kpi-value" style="color:#2563eb">${_activeUnivCount}</div>
          <div class="streamer-kpi-sub">현재 조건에서 보이는 대학 수</div>
        </article>
        <article class="streamer-kpi-card">
          <div class="streamer-kpi-label">프로필 준비</div>
          <div class="streamer-kpi-value" style="color:#7c3aed">${_photoCount}</div>
          <div class="streamer-kpi-sub">사진 등록 ${_photoCount}명 · 직책자 ${_roleCount}명</div>
        </article>
      </div>`
    : '';
  // (모바일/태블릿) 검색창이 커서 버튼들이 2줄로 밀리는 문제 방지
  // - 한 줄 유지 + 가로 스크롤(드래그)로 접근
  let filterBar=`<div class="streamer-toolbar-card"><div class="fbar utilbar utilbar--scroll" style="flex-wrap:nowrap;gap:6px;overflow-x:auto;-webkit-overflow-scrolling:touch;scrollbar-width:none">
    ${raceOpts.map(r=>`<button class="pill ${totalRaceFilter===r?'on':''}" onclick="totalRaceFilter='${r}';render()">${r==='전체'?'전체':RNAME[r]||r}</button>`).join('')}
    <span style="color:var(--border2);align-self:center">│</span>
    <input id="total-search" class="streamer-search" type="text" value="${(totalSearch||'').replace(/"/g,'&quot;')}" placeholder="🔍 이름/대학/티어/직책 + (테/저/프, 남/여) 검색..."
      oncompositionstart="window._tsComp=true"
      oncompositionend="window._tsComp=false;totalSearch=this.value;totalApplySearchFilter()"
      oninput="totalSearch=this.value;if(!window._tsComp)totalApplySearchFilter()"
      autocomplete="off" spellcheck="false">
    <button class="pill ${totalHideNoRecord?'on warn-on':''}" onclick="totalHideNoRecord=!totalHideNoRecord;render()">전적없음 숨김</button>
    <span style="color:var(--border2);align-self:center">│</span>
    <button class="pill ${totalViewMode==='gallery'?'on':''}" onclick="totalViewMode='gallery';try{localStorage.setItem('su_streamer_view_mode','gallery');}catch(e){};_bulkEditMode=false;render()" title="카드형 대시보드 보기">🪪 카드형</button>
    <button class="pill ${totalViewMode==='focus'?'on':''}" onclick="if(totalViewMode!=='focus')totalFocusPlayer='';totalViewMode='focus';try{localStorage.setItem('su_streamer_view_mode','focus');}catch(e){};_bulkEditMode=false;render()" title="좌측 목록 + 우측 상세 보기">🧾 상세형</button>
    <button class="pill ${totalViewMode==='table'?'on':''}" onclick="totalViewMode='table';try{localStorage.setItem('su_streamer_view_mode','table');}catch(e){};_bulkEditMode=false;render()" title="리스트 보기">☰ 리스트</button>
    ${totalViewMode==='table'?(isLoggedIn?`<button class="pill ${_bulkEditMode?'on edit-on':''}" onclick="toggleBulkEditMode()">일괄 수정</button>`:''):''}
    ${totalViewMode==='table'?(isLoggedIn?`<button class="pill" onclick="openMergePlayersModal()">🔀 병합</button>`:''):''}
    ${_showBulk&&totalViewMode==='table'?`<button class="pill ${_bulkEditSelected.size>0?'on':''}" onclick="clearBulkEditSelection()" style="${_bulkEditSelected.size>0?'background:#ef4444;border-color:#ef4444;color:#fff':''}">선택 초기화</button>
      <button id="bulk-edit-apply-btn" onclick="openBulkEditModal()" style="padding:4px 12px;border-radius:12px;border:1.5px solid #2563eb;background:#eff6ff;color:#1d4ed8;font-size:var(--fs-sm);font-weight:700;cursor:pointer;display:${_bulkEditSelected.size>0?'inline-flex':'none'};align-items:center;gap:4px">✏️ <span id="bulk-edit-cnt">${_bulkEditSelected.size}</span>명 수정</button>
      <input type="text" value="${(_bulkEditSearch||'').replace(/"/g,'&quot;')}" placeholder="선택 모드 내 검색..."
        oncompositionstart="window._tsComp2=true"
        oncompositionend="window._tsComp2=false;_bulkEditSearch=this.value;bulkApplySearchFilter()"
        oninput="_bulkEditSearch=this.value;if(!window._tsComp2)bulkApplySearchFilter()"
        autocomplete="off" spellcheck="false"
        class="streamer-search" style="min-width:170px">`:''}
  </div></div>`;

    let tableHTML=`<div class="streamer-content-card"><div class="streamer-table-wrap"><table class="streamer-table"><colgroup>
    ${_showBulk?'<col style="width:36px">':''}
    <col style="width:52px"><col style="width:80px"><col style="width:60px"><col style="width:220px"><col class="col-hide-mobile" style="width:50px">
    <col style="width:52px"><col style="width:52px">
    <col style="width:70px"><col style="width:80px"><col style="width:60px">
    ${isLoggedIn?'<col style="width:70px">':''}
  </colgroup><thead><tr>
    ${_showBulk?`<th style="text-align:center;padding:8px 4px"><input type="checkbox" id="bulk-check-all" onchange="bulkEditToggleAll(this.checked)" style="cursor:pointer"></th>`:''}
    <th style="text-align:center;white-space:nowrap;padding:8px 6px">순위</th>
    <th style="text-align:center;white-space:nowrap;padding:8px 10px">티어</th>
    <th style="text-align:center;white-space:nowrap;padding:8px 8px">종족</th>
    <th style="text-align:left;padding:8px 12px">스트리머</th>
    <th class="col-hide-mobile" style="text-align:center;white-space:nowrap;padding:8px 10px">승</th>
    <th class="col-hide-mobile" style="text-align:center;white-space:nowrap;padding:8px 10px">패</th>
    <th style="text-align:center;white-space:nowrap;padding:8px 10px">승률</th>
    <th class="col-hide-mobile" style="text-align:center;white-space:nowrap;padding:8px 10px">포인트</th>
    <th class="col-hide-mobile" style="text-align:center;white-space:nowrap;padding:8px 10px">ELO</th>
    <th class="col-hide-mobile" style="text-align:center;white-space:nowrap;padding:8px 6px">활동</th>
    ${isLoggedIn?'<th class="no-export" style="text-align:center;white-space:nowrap;padding:8px 10px">관리</th>':''}
  </tr></thead><tbody>`;

  // 전체 순위 맵 (points 기준)
  const _allRanked = [..._pl].filter(p=>!p.retired).sort((a,b)=>(b.points||0)-(a.points||0)||(b.win||0)-(a.win||0));
  const _rankMap = {};
  _allRanked.forEach((p,i) => { _rankMap[p.name] = i+1; });

  // 갤러리 뷰 분기
  if(totalViewMode==='gallery'){
    C.innerHTML=`<div class="streamer-shell">
      <section class="streamer-hero">
        <div class="streamer-hero-copy">
          <div class="streamer-hero-kicker">Streamer Directory</div>
          <div class="streamer-hero-title">🎬 스트리머 탭</div>
          <div class="streamer-hero-desc">카드형 대시보드 중심으로 스트리머를 정리해 사진, 대학, 티어, 활동 상태와 핵심 수치를 한 번에 읽기 쉽게 구성했습니다.</div>
        </div>
        <div class="streamer-hero-badges">
          <span class="streamer-hero-badge">${_viewLabel}</span>
          <span class="streamer-hero-badge">대학 ${_activeUnivCount}곳</span>
          <span class="streamer-hero-badge">총 ${_visiblePlayers.length}명</span>
        </div>
      </section>
      ${_kpiBar}
      ${filterBar}
      <div class="streamer-content-card">${_buildGalleryView(_rankMap)}</div>
    </div>`;
    _syncTpSelectedCards();
    injectUnivIcons(C);
    requestAnimationFrame(()=>injectUnivIcons(C));
    totalApplySearchFilter();
    const si=C.querySelector('#total-search');
    if(si&&totalSearch){si.focus();si.setSelectionRange(si.value.length,si.value.length);}
    return;
  }
  if(totalViewMode==='focus'){
    C.innerHTML=`<div class="streamer-shell">
      <section class="streamer-hero">
        <div class="streamer-hero-copy">
          <div class="streamer-hero-kicker">Streamer Directory</div>
          <div class="streamer-hero-title">🎬 스트리머 탭</div>
          <div class="streamer-hero-desc">상세형은 왼쪽 목록에서 스트리머를 고르고 오른쪽에서 프로필과 핵심 수치를 크게 보는 방식입니다.</div>
        </div>
        <div class="streamer-hero-badges">
          <span class="streamer-hero-badge">${_viewLabel}</span>
          <span class="streamer-hero-badge">대학 ${_activeUnivCount}곳</span>
          <span class="streamer-hero-badge">총 ${_visiblePlayers.length}명</span>
        </div>
      </section>
      ${filterBar}
      ${_buildFocusView(_rankMap)}
    </div>`;
    injectUnivIcons(C);
    requestAnimationFrame(()=>injectUnivIcons(C));
    totalApplySearchFilter();
    const si=C.querySelector('#total-search');
    if(si&&totalSearch){si.focus();si.setSelectionRange(si.value.length,si.value.length);}
    return;
  }

  let totalShown=0;
  const _visiblePhotoUrls = [];
  const _univTotalMap = new Map();
  const _univScMap = new Map();
  for(const p of _pl){
    if(!p) continue;
    const u = p.univ;
    if(!u) continue;
    _univTotalMap.set(u, (_univTotalMap.get(u)||0) + 1);
    const arr = _univScMap.get(u);
    if(arr) arr.push(p);
    else _univScMap.set(u, [p]);
  }
  
  // University section
  _getUnivs().filter(u=>isLoggedIn||!u.hidden).forEach(u=>{
    const _isHiddenUniv=isLoggedIn&&u.hidden;
    let up=_univScMap.get(u.name) || [];
    if(totalRaceFilter!=='전체') up=up.filter(p=>p.race===totalRaceFilter);
    if(totalHideNoRecord) up=up.filter(p=>(Number(p.win||0)+Number(p.loss||0))>0);
    if(!up.length)return;
    totalShown+=up.length;
    const _univTotal=_univTotalMap.get(u.name) || 0; // 은퇴 포함 전체 인원
    // 대학별 헤더 배경 설정 적용
    const _hdrBgImg = u.streamerHeaderBgImg || '';
    const _hdrBgSize = u.streamerHeaderBgSize || 'cover';
    const _hdrBgPos = u.streamerHeaderBgPos || 'center center';
    const _hdrBgOpacity = Math.max(0, Math.min(100, parseInt(u.streamerHeaderBgOpacity, 10) || 30)) / 100;
    const _hdrGradient = u.streamerHeaderGradient || '';
    const _hdrText = u.streamerHeaderText || '';
    const _hdrTextSize = u.streamerHeaderTextSize || '12';
    const _hdrTextColor = u.streamerHeaderTextColor || 'rgba(255,255,255,0.8)';
    const _hdrTextPos = u.streamerHeaderTextPos || localStorage.getItem('su_univ_header_text_pos') || 'right';
    // 그라데이션 스타일 결정
    let _gradientStyle = '';
    if (_hdrGradient || (!_hdrBgImg && !_hdrGradient)) {
      const gMode = _hdrGradient || (localStorage.getItem('su_univ_header_gradient') || 'left-to-right');
      // 대학별 설정 우선, 없으면 전역 설정 사용
      const gLen = Math.max(20, Math.min(100, parseInt(u.streamerHeaderGradientLen || localStorage.getItem('su_univ_header_gradient_length') || '70', 10) || 70));
      const gColorRaw = u.streamerHeaderGradientColor || localStorage.getItem('su_univ_header_gradient_color') || '#ffffff';
      const gColor = (gColorRaw && gColorRaw !== '#ffffff') ? gColorRaw : u.color;
      const gMix = `${gColor} ${gLen}%, transparent`;
      switch(gMode){
        case 'solid':
          _gradientStyle = u.color;
          break;
        case 'left-to-right':
          _gradientStyle = `linear-gradient(90deg, ${u.color}, color-mix(in srgb, ${gMix}))`;
          break;
        case 'left-to-both':
          _gradientStyle = `linear-gradient(90deg, ${u.color} 0%, ${u.color} ${Math.round(gLen/2)}%, color-mix(in srgb, ${u.color} ${gLen}%, transparent) 100%)`;
          break;
        case 'top-to-bottom':
          _gradientStyle = `linear-gradient(180deg, ${u.color}, color-mix(in srgb, ${gMix}))`;
          break;
        case 'both-to-center':
          _gradientStyle = `linear-gradient(90deg, color-mix(in srgb, ${u.color} ${Math.round(100-gLen)}%, transparent) 0%, ${u.color} 50%, color-mix(in srgb, ${u.color} ${Math.round(100-gLen)}%, transparent) 100%)`;
          break;
        default:
          _gradientStyle = `linear-gradient(90deg, ${u.color}, color-mix(in srgb, ${gMix}))`;
      }
    }
    // 배경 이미지가 있으면 그라데이션과 함께 적용
    let _tdBgStyle = _gradientStyle || u.color;
    let _tdBgSize = 'auto';
    let _tdBgPos = 'center center';
    if (_hdrBgImg) {
      // 이미지가 있으면 그라데이션 위에 이미지 오버레이
      _tdBgStyle = `linear-gradient(rgba(0,0,0,${1 - _hdrBgOpacity}), rgba(0,0,0,${1 - _hdrBgOpacity})), url('${_hdrBgImg.replace(/'/g, "\\'")}'), ${_gradientStyle || u.color}`;
      _tdBgSize = `${_hdrBgSize}, ${_hdrBgSize}, auto`;
      _tdBgPos = `${_hdrBgPos}, ${_hdrBgPos}, center center`;
    }
    // 커스텀 텍스트 스타일
    const _textStyle = _hdrText ? `position:relative;` : '';
    // 텍스트 위치에 따른 스타일 결정
    let _textHtml = '';
    if (_hdrText) {
      const _textBaseStyle = `font-size:${_hdrTextSize}px;color:${_hdrTextColor};font-weight:900;white-space:nowrap;`;
      if (_hdrTextPos === 'left') {
        _textHtml = `<span style="${_textBaseStyle}margin-right:8px;">${_hdrText}</span>`;
      } else if (_hdrTextPos === 'center') {
        _textHtml = `<span style="${_textBaseStyle}position:absolute;left:50%;transform:translateX(-50%);">${_hdrText}</span>`;
      } else {
        // right (default)
        _textHtml = `<span style="${_textBaseStyle}margin-left:auto;">${_hdrText}</span>`;
      }
    }
    tableHTML+=`<tr class="ugrp streamer-univ-head" data-univ-header="${u.name}" style="--c:${u.color};${_isHiddenUniv?'opacity:.55;':''}"><td colspan="${_ncols}" style="${_textStyle}">
      <div class="streamer-univ-banner" style="background:${_tdBgStyle};background-size:${_tdBgSize};background-position:${_tdBgPos};background-repeat:no-repeat;">
        <div class="streamer-univ-meta">
          ${_hdrTextPos === 'left' ? _textHtml : ''}
          <span class="clickable-univ streamer-univ-badge" onclick="openUnivModal('${u.name}')" style="background:${u.color}">${gUI(u.name,(typeof getUnivLogoSizeStr==='function'?getUnivLogoSizeStr(u.name,'players','26px'):'26px'))}${u.name}</span>
          ${u.dissolved?`<span style="font-size:10px;background:rgba(0,0,0,.35);color:#fca5a5;border-radius:4px;padding:1px 6px;font-weight:700">🏚️ 해체${u.dissolvedDate?' '+u.dissolvedDate:''}</span>`:''}
          ${_isHiddenUniv?`<span style="font-size:10px;background:rgba(0,0,0,.4);border-radius:4px;padding:1px 6px;font-weight:700">🚫 방문자 숨김</span>`:''}
        </div>
        ${_hdrTextPos === 'center' ? _textHtml : ''}
        <span class="streamer-univ-count">${_univTotal}명</span>
        ${_hdrTextPos === 'right' ? _textHtml : ''}
      </div>
    </td></tr>`;
    // 스트리머 탭: 항상 직책→티어→포인트 순 (현황판 수동 순서 무시)
    const sorted = [...up].sort((a,b)=>getRoleOrder(a.role)-getRoleOrder(b.role)||TIERS.indexOf(a.tier)-TIERS.indexOf(b.tier)||((b.points||0)-(a.points||0)));
    // 직책자와 일반 선수 분리
    const _rolePl = sorted.filter(p=>p.role&&MAIN_ROLES.includes(p.role));
    const _normalPl = sorted.filter(p=>!p.role||!MAIN_ROLES.includes(p.role));
    const _displayList = _rolePl.length ? [..._rolePl, null, ..._normalPl] : _normalPl; // null = 구분자
    let lt='';
    let _inRoleSection = _rolePl.length > 0;
    if(_inRoleSection) tableHTML+=`<tr class="tgrp streamer-subgrp" style="--c:${u.color||'#6366f1'}"><td colspan="${_ncols}"><span class="streamer-subgrp-chip" style="background:${(u.color||'#6366f1')}22;color:${u.color||'#6366f1'};border-color:${(u.color||'#6366f1')}33">👑 직책자 (${_rolePl.length}명)</span></td></tr>`;
    _displayList.forEach(p=>{
      if(p===null){
        // 구분자 - 직책 섹션 끝, 일반 선수 시작
        _inRoleSection=false; lt='';
        if(_normalPl.length) tableHTML+=`<tr class="tgrp streamer-subgrp" style="--c:${u.color||'#6366f1'}"><td colspan="${_ncols}"><span class="streamer-subgrp-chip">▷ 일반 스트리머 (${_normalPl.length}명)</span></td></tr>`;
        return;
      }
      if(!_inRoleSection && (p.tier||'미정')!==lt){lt=p.tier||'미정';tableHTML+=`<tr class="tgrp streamer-subgrp"><td colspan="${_ncols}"><span class="streamer-subgrp-chip">▷ ${getTierLabel(p.tier||'미정')}</span></td></tr>`;}
      const win = Number(p.win||0);
      const loss = Number(p.loss||0);
      const games = win + loss;
      const points = Number(p.points||0);
      const wr=games?Math.round(win/games*100):0;
      const elo = Number(p.elo||ELO_DEFAULT);
      const _pRank = _rankMap[p.name];
      const _pChange = typeof getRankChangeBadge==='function' ? getRankChangeBadge(p.name, _pRank) : '';
      const _pSafe=(typeof escJS==='function') ? escJS(p.name) : (p.name||'').replace(/\\/g,'\\\\').replace(/'/g,"\\'").replace(/\r/g,'\\r').replace(/\n/g,'\\n');
      const _pAttr=(typeof escAttr==='function')
        ? escAttr(String(p.name||'').replace(/[\r\n]+/g,' '))
        : String(p.name||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/[\r\n]+/g,' ');
      const _q = `${p.name||''} ${(p.univ||'')} ${(p.tier||'')} ${(p.role||'')}`.toLowerCase();
      if(typeof p.photo==='string' && p.photo.trim()) _visiblePhotoUrls.push(p.photo.trim());
      tableHTML+=`<tr class="streamer-row ${_pRank===1?'top1':_pRank===2?'top2':_pRank===3?'top3':''} ${p.inactive?'inactive':''} ${p.retired?'retired':''}" data-player-row="1" data-univ="${u.name}" data-q="${_q.replace(/[\r\n]+/g,' ').replace(/"/g,'&quot;')}" data-r="${p.race||''}" data-g="${p.gender||''}">
        ${_showBulk?`<td style="text-align:center;padding:7px 4px"><input type="checkbox" data-player-name="${_pSafe}" ${_bulkEditSelected.has(p.name)?'checked':''} onchange="toggleBulkEditPlayer('${_pSafe}',this.checked)" style="cursor:pointer;width:15px;height:15px"></td>`:''}
        <td style="text-align:center;white-space:nowrap;padding:5px 4px">
          <div class="streamer-rank-box">
          <div style="font-size:var(--fs-caption);font-weight:800;color:var(--text3);line-height:1.2">${_pRank||'-'}</div>
          <div>${_pChange}</div>
          </div>
        </td>
        <td style="text-align:center;white-space:nowrap;padding:7px 10px">${getTierBadge(p.tier)}</td>
        <td style="text-align:center;white-space:nowrap;padding:7px 8px"><span class="rbadge r${p.race}" style="font-size:var(--fs-caption)">${p.race||'?'}</span></td>
        <td style="text-align:left;padding:6px 12px;white-space:nowrap">
          <span class="streamer-player-cell">
            ${p.photo?`<span class="streamer-avatar" data-tp-action="open-player" data-tp-player="${_pAttr}" title="스트리머 상세">${p.race||'?'}<img loading="lazy" src="${toHttpsUrl(p.photo)}" decoding="async" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;border-radius:inherit" onerror="this.style.display='none'"></span>`:'<span class="streamer-avatar"></span>'}
            <span class="streamer-name-stack">
              <span class="streamer-name-line">${p.role?`${getRoleBadgeHTML(p.role,'10px')} `:''}<span class="clickable-name streamer-name-link" data-tp-action="open-player" data-tp-player="${_pAttr}">${p.name}</span>${p.retired?'<span style="font-size:10px;background:#e2e8f0;color:#64748b;border-radius:4px;padding:1px 5px;font-weight:700">🎗️ 은퇴</span>':''}${p.inactive?'<span style="font-size:10px;background:#fff7ed;color:#9a3412;border-radius:4px;padding:1px 5px;font-weight:700">⏸️ 휴학</span>':''}</span>
              <span class="streamer-mini-meta">${genderIcon(p.gender)}${getStatusIconHTML(p.name)}</span>
            </span>
          </span>
        </td>
        <td class="col-hide-mobile wt streamer-stat-num" style="text-align:center;white-space:nowrap;padding:7px 10px">${win}</td>
        <td class="col-hide-mobile lt streamer-stat-num" style="text-align:center;white-space:nowrap;padding:7px 10px">${loss}</td>
        <td style="text-align:center;white-space:nowrap;padding:7px 10px;font-weight:700;color:${games===0?'var(--gray-l)':wr>=50?'var(--green)':'var(--red)'}">
          <div class="streamer-wr-box">
          ${games?wr+'%':'-'}${games?`<span style="font-size:9px;color:var(--gray-l);font-weight:400">${games}전</span>`:''}
          </div>
        </td>
        <td class="col-hide-mobile ${pC(points)}" style="text-align:center;white-space:nowrap;padding:7px 10px;font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:var(--fs-base)">${pS(points)}</td>
        <td class="col-hide-mobile" style="text-align:center;white-space:nowrap;padding:7px 10px"><span class="streamer-elo-chip" style="color:${elo>=ELO_DEFAULT?'#2563eb':'#dc2626'}">${elo}</span></td>
        <td class="col-hide-mobile" style="text-align:center;padding:7px 4px"></td>
        ${isLoggedIn?`<td class="no-export" style="text-align:center;white-space:nowrap;padding:7px 8px">${adminBtn(`<button class="btn btn-w btn-xs" onclick="openEPFromModal('${_pSafe}')">✏️ 수정</button>`)}</td>`:''}
      </tr>`;
    });
  });
  if(totalShown===0){
    tableHTML+=`<tr><td colspan="${_ncols}"><div class="empty-state"><div class="empty-state-icon">🔍</div><div class="empty-state-title">검색 결과가 없습니다</div><div class="empty-state-desc">다른 검색어나 필터를 사용해보세요</div></div></td></tr>`;
  }
  tableHTML+=`</tbody></table></div></div>`;

  C.innerHTML = `<div class="streamer-shell">
    <section class="streamer-hero">
      <div class="streamer-hero-copy">
        <div class="streamer-hero-kicker">Streamer Directory</div>
        <div class="streamer-hero-title">🎬 스트리머 탭</div>
        <div class="streamer-hero-desc">대학별 구성을 유지하면서도 검색, 필터, 순위, 활동 상태를 더 보기 좋고 빠르게 파악할 수 있도록 정리했습니다.</div>
      </div>
      <div class="streamer-hero-badges">
        <span class="streamer-hero-badge">${_viewLabel}</span>
        <span class="streamer-hero-badge">대학 ${_activeUnivCount}곳</span>
        <span class="streamer-hero-badge">총 ${_visiblePlayers.length}명</span>
      </div>
    </section>
    ${filterBar}
    ${tableHTML}
  </div>`;
  try{ if(typeof prewarmImageUrls==='function') prewarmImageUrls(_visiblePhotoUrls, _visiblePhotoUrls.length); }catch(e){}
  injectUnivIcons(C);
  requestAnimationFrame(()=>injectUnivIcons(C));
  totalApplySearchFilter();
  bulkApplySearchFilter();
  const si=C.querySelector('#total-search');
  if(si&&totalSearch){si.focus();si.setSelectionRange(si.value.length,si.value.length);}
}

function _buildGalleryView(rankMap){
  const _pl = (typeof players !== 'undefined' && Array.isArray(players)) ? players : null;
  const _getUnivs = (typeof getAllUnivs === 'function') ? getAllUnivs : null;
  if(!_pl || !_getUnivs){
    const msg = (typeof players === 'undefined')
      ? '데이터 로딩 중...'
      : '스트리머 데이터를 불러올 수 없습니다.';
    return `<div class="empty-state"><div class="empty-state-icon">⏳</div><div class="empty-state-title">${msg}</div><div class="empty-state-desc">새로고침 후 다시 시도해주세요.</div></div>`;
  }
  const RACE_CLR={T:'#2563eb',Z:'#7c3aed',P:'#c2410c',N:'#64748b'};
  let html='<div class="streamer-gallery-grid">';
  let anyShown=false;
  const _galleryPhotoUrls = [];
  const _univScActiveMap = new Map();
  for(const p of _pl){
    if(!p || p.retired) continue;
    const u = p.univ;
    if(!u) continue;
    const arr = _univScActiveMap.get(u);
    if(arr) arr.push(p);
    else _univScActiveMap.set(u, [p]);
  }
  _getUnivs().filter(u=>isLoggedIn||!u.hidden).forEach(u=>{
    let up=_univScActiveMap.get(u.name) || [];
    if(totalRaceFilter!=='전체') up=up.filter(p=>p.race===totalRaceFilter);
    if(totalHideNoRecord) up=up.filter(p=>(Number(p.win||0)+Number(p.loss||0))>0);
    if(!up.length) return;
    anyShown=true;
    const sorted=[...up].sort((a,b)=>getRoleOrder(a.role)-getRoleOrder(b.role)||TIERS.indexOf(a.tier)-TIERS.indexOf(b.tier)||(b.points||0)-(a.points||0));
    // 대학 헤더: 대학별 설정 적용
    const _gHdrBgImg = u.streamerHeaderBgImg || '';
    const _gHdrBgSize = u.streamerHeaderBgSize || 'cover';
    const _gHdrBgPos = u.streamerHeaderBgPos || 'center center';
    const _gHdrBgOpacity = Math.max(0, Math.min(100, parseInt(u.streamerHeaderBgOpacity, 10) || 30)) / 100;
    const _gHdrGradient = u.streamerHeaderGradient || '';
    const _gHdrText = u.streamerHeaderText || '';
    const _gHdrTextSize = u.streamerHeaderTextSize || '12';
    const _gHdrTextColor = u.streamerHeaderTextColor || 'rgba(255,255,255,0.85)';
    const _gHdrTextPos = u.streamerHeaderTextPos || localStorage.getItem('su_univ_header_text_pos') || 'right';
    // 그라데이션 스타일 결정
    let _gGradientStyle = '';
    if (_gHdrGradient || (!_gHdrBgImg && !_gHdrGradient)) {
      const gMode = _gHdrGradient || (localStorage.getItem('su_univ_header_gradient') || 'left-to-right');
      // 대학별 설정 우선, 없으면 전역 설정 사용
      const gLen = Math.max(20, Math.min(100, parseInt(u.streamerHeaderGradientLen || localStorage.getItem('su_univ_header_gradient_length') || '70', 10) || 70));
      const gColorRaw = u.streamerHeaderGradientColor || localStorage.getItem('su_univ_header_gradient_color') || '#ffffff';
      const gColor = (gColorRaw && gColorRaw !== '#ffffff') ? gColorRaw : (u.color || '#6366f1');
      const gMix = `${gColor} ${gLen}%, transparent`;
      switch(gMode){
        case 'solid':
          _gGradientStyle = u.color || '#6366f1';
          break;
        case 'left-to-right':
          _gGradientStyle = `linear-gradient(90deg, ${u.color || '#6366f1'}, color-mix(in srgb, ${gMix}))`;
          break;
        case 'left-to-both':
          _gGradientStyle = `linear-gradient(90deg, ${u.color || '#6366f1'} 0%, ${u.color || '#6366f1'} ${Math.round(gLen/2)}%, color-mix(in srgb, ${u.color || '#6366f1'} ${gLen}%, transparent) 100%)`;
          break;
        case 'top-to-bottom':
          _gGradientStyle = `linear-gradient(180deg, ${u.color || '#6366f1'}, color-mix(in srgb, ${gMix}))`;
          break;
        case 'both-to-center':
          _gGradientStyle = `linear-gradient(90deg, color-mix(in srgb, ${u.color || '#6366f1'} ${Math.round(100-gLen)}%, transparent) 0%, ${u.color || '#6366f1'} 50%, color-mix(in srgb, ${u.color || '#6366f1'} ${Math.round(100-gLen)}%, transparent) 100%)`;
          break;
        default:
          _gGradientStyle = `linear-gradient(90deg, ${u.color || '#6366f1'}, color-mix(in srgb, ${gMix}))`;
      }
    }
    // 배경 이미지가 있으면 그라데이션과 함께 적용
    let _gFinalBgStyle = _gGradientStyle || (u.color || '#6366f1');
    let _gFinalBgSize = 'auto';
    let _gFinalBgPos = 'center center';
    if (_gHdrBgImg) {
      // 이미지가 있으면 그라데이션 위에 이미지 오버레이 (오버레이 블렌딩 사용)
      _gFinalBgStyle = `linear-gradient(rgba(0,0,0,${1 - _gHdrBgOpacity}), rgba(0,0,0,${1 - _gHdrBgOpacity})), url('${_gHdrBgImg.replace(/'/g, "\\'")}'), ${_gGradientStyle || (u.color || '#6366f1')}`;
      _gFinalBgSize = `${_gHdrBgSize}, ${_gHdrBgSize}, auto`;
      _gFinalBgPos = `${_gHdrBgPos}, ${_gHdrBgPos}, center center`;
    }
    // 텍스트 위치에 따른 스타일 결정
    let _gTextHtml = '';
    if (_gHdrText) {
      const _gTextBaseStyle = `font-size:${_gHdrTextSize}px;color:${_gHdrTextColor};font-weight:900;white-space:nowrap;`;
      if (_gHdrTextPos === 'left') {
        _gTextHtml = `<span style="${_gTextBaseStyle}margin-right:8px;">${_gHdrText}</span>`;
      } else if (_gHdrTextPos === 'center') {
        _gTextHtml = `<span style="${_gTextBaseStyle}position:absolute;left:50%;transform:translateX(-50%);">${_gHdrText}</span>`;
      } else {
        // right (default)
        _gTextHtml = `<span style="${_gTextBaseStyle}margin-left:auto;">${_gHdrText}</span>`;
      }
    }
    const _uSafe=(typeof escJS==='function') ? escJS(u.name||'') : String(u.name||'').replace(/\\/g,'\\\\').replace(/'/g,"\\'").replace(/\r/g,'\\r').replace(/\n/g,'\\n');
    html+=`<div class="streamer-gallery-head" data-gallery-univ-header="${u.name}" style="background:${_gFinalBgStyle};background-size:${_gFinalBgSize};background-position:${_gFinalBgPos};background-repeat:no-repeat;margin-top:6px;">
      ${_gHdrTextPos === 'left' ? _gTextHtml : ''}
      <span class="ubadge streamer-gallery-univ clickable-univ" data-icon-done="1" onclick="event.stopPropagation();openUnivModal('${_uSafe}')" style="color:#fff;display:inline-flex;align-items:center;gap:4px;font-size:var(--fs-sm)">${gUI(u.name,(typeof getUnivLogoSizeStr==='function'?getUnivLogoSizeStr(u.name,'players','20px'):'20px'))}${u.name}</span>
      ${_gHdrTextPos === 'center' ? _gTextHtml : ''}
      <span style="font-size:var(--fs-caption);color:rgba(255,255,255,.85);font-weight:700;position:relative;z-index:1">${up.length}명</span>
      ${_gHdrTextPos === 'right' ? _gTextHtml : ''}
    </div>`;
    sorted.forEach(p=>{
      const win = Number(p.win||0);
      const loss = Number(p.loss||0);
      const games = win + loss;
      const wr=games?Math.round(win/games*100):null;
      const points = Number(p.points||0);
      const elo = Number(p.elo||ELO_DEFAULT);
      const clr=RACE_CLR[p.race]||'#64748b';
      const _pSafe=(typeof escJS==='function') ? escJS(p.name) : (p.name||'').replace(/\\/g,'\\\\').replace(/'/g,"\\'").replace(/\r/g,'\\r').replace(/\n/g,'\\n');
      const _pAttr=(typeof escAttr==='function')
        ? escAttr(String(p.name||'').replace(/[\r\n]+/g,' '))
        : String(p.name||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/[\r\n]+/g,' ');
      const q=`${p.name||''} ${(p.univ||'')} ${(p.tier||'')} ${(p.role||'')}`.toLowerCase();
      const _uSafe=(typeof escJS==='function') ? escJS(u.name||'') : String(u.name||'').replace(/\\/g,'\\\\').replace(/'/g,"\\'").replace(/\r/g,'\\r').replace(/\n/g,'\\n');
      const actMeta = _getStreamerActivityMeta(p);
      const photoMap=(window.playerPhotos&&typeof window.playerPhotos==='object')?window.playerPhotos:{};
      const photoSrcRaw=(typeof p.photo==='string'&&p.photo.trim())?p.photo.trim():String(photoMap[p.name]||'').trim();
      const _posUse=(p.photoPosUse!==false);
      const _posX=Number(p.photoPosX), _posY=Number(p.photoPosY);
      const photoPos=(_posUse && Number.isFinite(_posX) && Number.isFinite(_posY)) ? `${_posX}% ${_posY}%` : 'top center';
      if(photoSrcRaw) _galleryPhotoUrls.push(photoSrcRaw);
      html+=`<div class="streamer-gallery-card ${rankMap[p.name]===1?'top1':rankMap[p.name]===2?'top2':rankMap[p.name]===3?'top3':''} ${p.inactive?'inactive':''} ${p.retired?'retired':''} ${_isTpPlayerSelected(p.name)?'is-selected':''}" data-player-card="1" data-univ="${u.name}" data-q="${q.replace(/[\r\n]+/g,' ').replace(/"/g,'&quot;')}" data-r="${p.race||''}" data-g="${p.gender||''}"
        data-tp-action="open-player" data-tp-player="${_pAttr}"
        style="--card-accent:${clr};background:${clr}18;border-color:${clr}38;backdrop-filter:blur(1px)"
        onmouseenter="try{if(typeof _prewarmPlayerModalImages==='function'){var _pp=window.players&&window.players.find(function(x){return x.name==='${_pSafe}'});if(_pp)_prewarmPlayerModalImages(_pp);}}catch(e){}">
        ${photoSrcRaw
          ? `<img loading="lazy" src="${toHttpsUrl(photoSrcRaw)}" decoding="async" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:${photoPos}" onerror="this.parentNode.querySelector('.gc-placeholder').style.display='flex';this.style.display='none'">`
          : ''}
        <div class="gc-placeholder" style="position:absolute;inset:0;display:${photoSrcRaw?'none':'flex'};align-items:center;justify-content:center;font-size:36px;font-weight:900;color:${clr};background:linear-gradient(160deg,${clr}2a 0%,${clr}0e 100%)">${p.race||'?'}</div>
        <div class="streamer-gallery-overlay"></div>
        <div class="streamer-gallery-rank">${rankMap[p.name]?'#'+rankMap[p.name]:''}</div>
        <div class="streamer-gallery-bottom">
          <div class="streamer-gallery-topline">
            <div class="streamer-gallery-name" title="${p.name}">${p.name}${genderIcon(p.gender)}</div>
            ${getStatusIconHTML(p.name)}
          </div>
          <div class="streamer-gallery-role">${p.role || '일반 스트리머'}</div>
          <div class="streamer-gallery-meta">
            ${getTierBadge(p.tier)}<span class="rbadge r${p.race}" style="font-size:9px;padding:1px 4px">${p.race||'?'}</span>
            <span class="streamer-gallery-univ-chip ${u.name&&u.name!=='무소속'?'clickable-univ':''}" ${u.name&&u.name!=='무소속'?`onclick="event.stopPropagation();openUnivModal('${_uSafe}')"`:''}>${u.name&&u.name!=='무소속'?gUI(u.name,(typeof getUnivLogoSizeStr==='function'?getUnivLogoSizeStr(u.name,'players','16px'):'16px')):''}${u.name || '무소속'}</span>
            ${p.inactive?'<span class="streamer-gallery-univ-chip" style="background:rgba(249,115,22,.16);border-color:rgba(249,115,22,.24)">휴학</span>':''}
            ${p.retired?'<span class="streamer-gallery-univ-chip" style="background:rgba(148,163,184,.18);border-color:rgba(148,163,184,.28)">은퇴</span>':''}
          </div>
          <div class="streamer-gallery-stats">
            <div class="streamer-gallery-stat">
              <div class="streamer-gallery-stat-label">전적</div>
              <div class="streamer-gallery-stat-value streamer-gallery-stat-value--split">
                <span class="streamer-gallery-stat-value--em">${games ? `${win}승 ${loss}패` : '기록 없음'}</span>
                <span class="streamer-gallery-stat-value--muted">${games ? `${games}전` : '공식전 없음'}</span>
              </div>
            </div>
            <div class="streamer-gallery-stat">
              <div class="streamer-gallery-stat-label">포인트</div>
              <div class="streamer-gallery-stat-value streamer-gallery-stat-value--em">${pS(points)}</div>
            </div>
            <div class="streamer-gallery-stat streamer-gallery-stat--wide">
              <div class="streamer-gallery-stat-label">ELO / 승률</div>
              <div class="streamer-gallery-stat-value streamer-gallery-stat-value--split">
                <span class="streamer-gallery-stat-value--em">${elo}</span>
                <span class="streamer-gallery-stat-value--muted" style="color:${wr===null?'rgba(255,255,255,.82)':wr>=50?'#86efac':'#fecaca'}">승률 ${wr===null?'-':wr+'%'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>`;
    });
  });
  if(!anyShown) html+=`<div style="grid-column:1/-1"><div class="empty-state"><div class="empty-state-icon">🔍</div><div class="empty-state-title">검색 결과가 없습니다</div></div></div>`;
  html+='</div>';
  try{ if(typeof prewarmImageUrls==='function') prewarmImageUrls(_galleryPhotoUrls, _galleryPhotoUrls.length); }catch(e){}
  return html;
}

function _buildFocusView(rankMap){
  const _pl = (typeof players !== 'undefined' && Array.isArray(players)) ? players : [];
  const _getUnivs = (typeof getAllUnivs === 'function') ? getAllUnivs : null;
  if(!_getUnivs) return `<div class="streamer-content-card"><div class="empty-state"><div class="empty-state-icon">⏳</div><div class="empty-state-title">스트리머 데이터를 불러오는 중입니다.</div></div></div>`;
  const visible = _pl.filter(p=>{
    if(!p || p.retired) return false;
    if(totalRaceFilter!=='전체' && p.race!==totalRaceFilter) return false;
    if(totalHideNoRecord && (Number(p.win||0)+Number(p.loss||0))<=0) return false;
    return true;
  });
  const focusPool = visible.length ? visible : _pl.filter(Boolean);
  if(!focusPool.length){
    return `<div class="streamer-content-card"><div class="empty-state"><div class="empty-state-icon">🔍</div><div class="empty-state-title">표시할 스트리머가 없습니다.</div></div></div>`;
  }
  if(!focusPool.some(p=>p.name===totalFocusPlayer)){
    const withPhoto = focusPool.filter(p=>String(p.photo||'').trim());
    const seedPool = withPhoto.length ? withPhoto : focusPool;
    totalFocusPlayer = (seedPool[Math.floor(Math.random() * seedPool.length)] || {}).name || '';
  }
  const selected = focusPool.find(p=>p.name===totalFocusPlayer) || focusPool[0];
  if(selected) totalFocusPlayer = selected.name;
  const groups = new Map();
  focusPool.forEach(p=>{
    const key = p.univ || '무소속';
    if(groups.has(key)) groups.get(key).push(p);
    else groups.set(key,[p]);
  });
  const orderedUnivs = (_getUnivs().filter(u=>isLoggedIn||!u.hidden).map(u=>u.name)).concat('무소속');
  let listHtml = '<div class="streamer-focus-list">';
  orderedUnivs.forEach(univName=>{
    const members = groups.get(univName);
    if(!members || !members.length) return;
    const u = (typeof getAllUnivs === 'function' ? getAllUnivs().find(x=>x.name===univName) : null) || { name:univName, color:'#64748b' };
    const color = u.color || '#64748b';
    listHtml += `<section class="streamer-focus-group">
      <div class="streamer-focus-group-title" data-focus-univ-header="${u.name}" style="background:linear-gradient(135deg,${color},color-mix(in srgb, ${color} 68%, #ffffff))">
        <span style="display:inline-flex;align-items:center;gap:6px">${u.name && u.name!=='무소속' ? gUI(u.name,(typeof getUnivLogoSizeStr==='function'?getUnivLogoSizeStr(u.name,'players','18px'):'18px')) : '🏷️'}<span class="${u.name&&u.name!=='무소속'?'clickable-univ':''}" ${u.name&&u.name!=='무소속'?`onclick="event.stopPropagation();openUnivModal('${u.name.replace(/'/g,"\\'")}')"`:''}>${u.name}</span></span>
        <span style="font-size:var(--fs-caption);color:rgba(255,255,255,.82)">${members.length}명</span>
      </div>`;
    const sorted = [...members].sort((a,b)=>getRoleOrder(a.role)-getRoleOrder(b.role)||TIERS.indexOf(a.tier)-TIERS.indexOf(b.tier)||(b.points||0)-(a.points||0));
    sorted.forEach(p=>{
      const win = Number(p.win||0);
      const loss = Number(p.loss||0);
      const games = win + loss;
      const wr = games ? Math.round(win/games*100) : null;
      const actMeta = _getStreamerActivityMeta(p);
      const _pSafe=(typeof escJS==='function') ? escJS(p.name) : (p.name||'').replace(/\\/g,'\\\\').replace(/'/g,"\\'").replace(/\r/g,'\\r').replace(/\n/g,'\\n');
      const q=`${p.name||''} ${(p.univ||'')} ${(p.tier||'')} ${(p.role||'')}`.toLowerCase();
      listHtml += `<div class="streamer-focus-item ${selected && selected.name===p.name?'active':''}" data-focus-row="1" data-focus-name="${(typeof escAttr==='function'?escAttr(p.name):p.name)}" data-univ="${u.name}" data-q="${q.replace(/[\r\n]+/g,' ').replace(/"/g,'&quot;')}" data-r="${p.race||''}" data-g="${p.gender||''}" onclick="totalFocusPlayer='${_pSafe}';render()">
        <div class="streamer-focus-avatar">
          ${p.photo ? `<img loading="lazy" src="${toHttpsUrl(p.photo)}" alt="" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover" onerror="this.style.display='none'">` : `${p.race||'?'}`}
        </div>
        <div class="streamer-focus-meta">
          <div class="streamer-focus-name"><span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${p.name}</span>${genderIcon(p.gender)}</div>
          <div class="streamer-focus-sub">${p.role||'일반 스트리머'} · ${p.tier||'?'}티어 · ${p.race||'?'}</div>
          <div class="streamer-focus-sub">${actMeta.label?`<span class="streamer-act-chip ${actMeta.key}" style="min-width:42px;padding:3px 7px;font-size:10px">${actMeta.label}</span>`:''}<span>${games?`${win}승 ${loss}패 · ${wr}%`:'기록 없음'}</span></div>
        </div>
      </div>`;
    });
    listHtml += `</section>`;
  });
  listHtml += '</div>';
  const selWin = Number(selected.win||0);
  const selLoss = Number(selected.loss||0);
  const selGames = selWin + selLoss;
  const selWr = selGames ? Math.round(selWin/selGames*100) : null;
  const selElo = Number(selected.elo||ELO_DEFAULT);
  const selPoints = Number(selected.points||0);
  const selAct = _getStreamerActivityMeta(selected);
  const selHistAll = _tpHistAllForPlayer(selected);
  const selHistSorted = [...selHistAll].sort((a,b)=>_tpDateNum(b?.date)-_tpDateNum(a?.date)||(Number(b?.time||0)-Number(a?.time||0)));
  const lastRec = selHistSorted[0] || null;
  const lastMatch = lastRec ? (lastRec.date || '') : '';
  const selUniv = selected.univ || '무소속';
  const selColor = (typeof gc==='function' ? gc(selUniv) : '#2563eb') || '#2563eb';
  const selAttr = (typeof escAttr==='function')
    ? escAttr(String(selected.name||'').replace(/[\r\n]+/g,' '))
    : String(selected.name||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/[\r\n]+/g,' ');
  const recentList = selHistSorted.slice(0, 5);
  const recentDesc = recentList.length
    ? `<div style="display:flex;flex-direction:column;gap:6px">${recentList.map(h=>{
        const d=String(h?.date||'').trim();
        const r=String(h?.result||'-').trim();
        const opp=String(h?.opp||'').trim();
        const mode=String(h?.mode||'').trim();
        const map=String(h?.map||'').trim();
        const left = `${d||'-'} · ${r}${opp?` vs ${opp}`:''}`;
        const right = `${mode||''}${map?` · ${map}`:''}`;
        return `<div style="display:flex;align-items:flex-start;justify-content:space-between;gap:10px">
          <span style="font-weight:800;color:var(--text2)">${left}</span>
          <span style="color:var(--text3);white-space:nowrap">${right}</span>
        </div>`;
      }).join('')}</div>`
    : '최근 기록이 아직 없습니다.';
  const _7agoN = _tpDaysAgoNum(7);
  const _30agoN = _tpDaysAgoNum(30);
  const _c7 = selHistAll.filter(h=>_tpDateNum(h?.date) >= _7agoN).length;
  const _c30 = selHistAll.filter(h=>_tpDateNum(h?.date) >= _30agoN).length;
  const detailHtml = `<div class="streamer-focus-main">
    <div class="streamer-focus-main-hero" style="background:linear-gradient(135deg,color-mix(in srgb, ${selColor} 28%, #0f172a),${selColor})">
      <div class="streamer-focus-photo">
        ${selected.photo ? `<img src="${toHttpsUrl(selected.photo)}" alt="${selected.name}">` : ''}
        <div class="streamer-focus-photo-fallback" style="display:${selected.photo?'none':'flex'}">${selected.race||'?'}</div>
      </div>
      <div class="streamer-focus-copy">
        <div class="streamer-focus-kicker">Focused Profile</div>
        <div class="streamer-focus-title">${selected.name}${genderIcon(selected.gender)}</div>
        <div class="streamer-focus-chips">
          ${selected.role ? `<span class="streamer-focus-chip">${selected.role}</span>` : ''}
          <span class="streamer-focus-chip">${selected.tier||'?'}티어</span>
          <span class="streamer-focus-chip">${selected.race==='P'?'프로토스':selected.race==='T'?'테란':selected.race==='Z'?'저그':'종족 미정'}</span>
          <span class="streamer-focus-chip ${selUniv&&selUniv!=='무소속'?'clickable-univ':''}" ${selUniv&&selUniv!=='무소속'?`onclick="event.stopPropagation();openUnivModal('${selUniv.replace(/'/g,"\\'")}')"`:''}>${selUniv}</span>
          ${selAct.label ? `<span class="streamer-focus-chip">${selAct.label}</span>` : ''}
          ${getStatusIconHTML(selected.name)}
        </div>
        <div class="streamer-focus-desc">${selUniv} 소속으로 현재 ${selGames ? `${selGames}전 ${selWin}승 ${selLoss}패` : '공식 기록이 아직 없고'}${selWr==null ? '' : `, 승률 ${selWr}%`} 상태입니다.</div>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <button class="pill on" data-tp-action="open-player" data-tp-player="${selAttr}" style="border:none">상세 열기</button>
          ${isLoggedIn ? `<button class="pill" onclick="openEPFromModal('${(typeof escJS==='function'?escJS(selected.name):selected.name)}')">✏️ 수정</button>` : ''}
        </div>
      </div>
    </div>
    <div class="streamer-focus-statgrid">
      <div class="streamer-focus-stat"><div class="streamer-focus-stat-label">전적</div><div class="streamer-focus-stat-value">${selGames ? `${selWin}승 ${selLoss}패` : '기록 없음'}</div></div>
      <div class="streamer-focus-stat"><div class="streamer-focus-stat-label">승률</div><div class="streamer-focus-stat-value" style="color:${selWr==null?'var(--text1)':selWr>=50?'#16a34a':'#dc2626'}">${selWr==null?'-':`${selWr}%`}</div></div>
      <div class="streamer-focus-stat"><div class="streamer-focus-stat-label">포인트</div><div class="streamer-focus-stat-value">${pS(selPoints)}</div></div>
      <div class="streamer-focus-stat"><div class="streamer-focus-stat-label">ELO</div><div class="streamer-focus-stat-value" style="color:${selElo>=ELO_DEFAULT?'#2563eb':'#dc2626'}">${selElo}</div></div>
    </div>
    <div class="streamer-focus-note-grid">
      <div class="streamer-focus-note">
        <div class="streamer-focus-note-title">최근 기록</div>
        <div class="streamer-focus-note-desc">${recentDesc}</div>
      </div>
      <div class="streamer-focus-note">
        <div class="streamer-focus-note-title">활동 상태</div>
        <div class="streamer-focus-note-desc">${selAct.title}<br>최근 7일 · ${_c7}회 / 최근 30일 · ${_c30}회${lastMatch ? `<br>마지막 기록일 · ${lastMatch}` : ''}</div>
      </div>
    </div>
  </div>`;
  return `<div class="streamer-focus-layout">
    <aside class="streamer-focus-sidebar">
      <div class="streamer-focus-section-title">스트리머 선택</div>
      ${listHtml}
    </aside>
    ${detailHtml}
  </div>`;
}

function toggleBulkEditMode(){
  _bulkEditMode=!_bulkEditMode;
  _bulkEditSelected=new Set();
  _bulkEditSearch='';
  render();
}

function toggleBulkEditPlayer(name,checked){
  if(checked) _bulkEditSelected.add(name);
  else _bulkEditSelected.delete(name);
  const cnt=document.getElementById('bulk-edit-cnt');
  if(cnt) cnt.textContent=_bulkEditSelected.size;
  const btn=document.getElementById('bulk-edit-apply-btn');
  if(btn) btn.style.display=_bulkEditSelected.size>0?'inline-flex':'none';
}

function bulkEditToggleAll(checked){
  document.querySelectorAll('[data-player-name]').forEach(cb=>{
    cb.checked=checked;
    const name=cb.dataset.playerName;
    if(name){if(checked)_bulkEditSelected.add(name);else _bulkEditSelected.delete(name);}
  });
  const cnt=document.getElementById('bulk-edit-cnt');
  if(cnt) cnt.textContent=_bulkEditSelected.size;
  const btn=document.getElementById('bulk-edit-apply-btn');
  if(btn) btn.style.display=_bulkEditSelected.size>0?'inline-flex':'none';
}

function clearBulkEditSelection(){
  _bulkEditSelected=new Set();
  const cnt=document.getElementById('bulk-edit-cnt');
  if(cnt) cnt.textContent='0';
  const btn=document.getElementById('bulk-edit-apply-btn');
  if(btn) btn.style.display='none';
  const all=document.getElementById('bulk-check-all');
  if(all) all.checked=false;
  document.querySelectorAll('[data-player-name]').forEach(cb=>{cb.checked=false;});
}

function openBulkEditModal(){
  if(!_bulkEditSelected.size) return;
  const univOpts=getAllUnivs().filter(u=>!u.dissolved).map(u=>`<option value="${u.name}">${u.name}</option>`).join('');
  const tierOpts=TIERS.map(t=>`<option value="${t}">${getTierLabel(t)}</option>`).join('');
  const sel=[..._bulkEditSelected];
  const first=sel.slice(0,30);
  const more=sel.length-first.length;
  document.getElementById('bulkEditBody').innerHTML=`
    <div style="margin-bottom:14px;padding:10px;background:var(--surface);border-radius:8px;font-size:var(--fs-sm);color:var(--text2)">
      <strong style="color:var(--blue)">${sel.length}명</strong> 선택됨: ${first.join(', ')}${more?` 외 ${more}명`:''}
      ${more?`<details style="margin-top:8px"><summary style="cursor:pointer;color:var(--gray-l);font-size:var(--fs-caption)">전체 보기</summary><div style="margin-top:6px;line-height:1.6">${sel.join(', ')}</div></details>`:''}
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px">
      <div>
        <label style="font-size:var(--fs-sm);font-weight:700;color:var(--text2);display:block;margin-bottom:4px">티어</label>
        <select id="bulk-ed-t" style="width:100%;padding:7px 10px;border:1px solid var(--border2);border-radius:8px;font-size:var(--fs-base)">
          <option value="">변경 안함</option>${tierOpts}
        </select>
      </div>
      <div>
        <label style="font-size:var(--fs-sm);font-weight:700;color:var(--text2);display:block;margin-bottom:4px">대학</label>
        <select id="bulk-ed-u" style="width:100%;padding:7px 10px;border:1px solid var(--border2);border-radius:8px;font-size:var(--fs-base)">
          <option value="">변경 안함</option>${univOpts}
        </select>
      </div>
      <div>
        <label style="font-size:var(--fs-sm);font-weight:700;color:var(--text2);display:block;margin-bottom:4px">종족</label>
        <select id="bulk-ed-r" style="width:100%;padding:7px 10px;border:1px solid var(--border2);border-radius:8px;font-size:var(--fs-base)">
          <option value="">변경 안함</option>
          <option value="T">테란</option><option value="Z">저그</option><option value="P">프로토스</option><option value="N">종족미정</option>
        </select>
      </div>
      <div>
        <label style="font-size:var(--fs-sm);font-weight:700;color:var(--text2);display:block;margin-bottom:4px">성별</label>
        <select id="bulk-ed-g" style="width:100%;padding:7px 10px;border:1px solid var(--border2);border-radius:8px;font-size:var(--fs-base)">
          <option value="">변경 안함</option>
          <option value="F">👩 여자</option><option value="M">👨 남자</option>
        </select>
      </div>
    </div>
    <div style="display:flex;align-items:center;gap:10px;padding:10px 12px;background:var(--surface);border-radius:8px;margin-bottom:4px">
      <label style="font-size:var(--fs-sm);font-weight:700;color:var(--text2)">현황판</label>
      <select id="bulk-ed-h" style="padding:6px 10px;border:1px solid var(--border2);border-radius:8px;font-size:var(--fs-base)">
        <option value="">변경 안함</option>
        <option value="hide">제외 (숨김)</option>
        <option value="show">표시</option>
      </select>
      <button onclick="bulkDeleteSelected()" style="margin-left:auto;padding:6px 14px;border-radius:8px;border:1.5px solid #ef4444;background:#fef2f2;color:#dc2626;font-size:var(--fs-sm);font-weight:700;cursor:pointer">🗑️ 선택 삭제</button>
    </div>`;
  om('bulkEditModal');
}

function saveBulkEdit(){
  const _getSelVal=(id)=>document.getElementById(id)?.value||'';
  const t=_getSelVal('bulk-ed-t');
  const u=_getSelVal('bulk-ed-u');
  const r=_getSelVal('bulk-ed-r');
  const g=_getSelVal('bulk-ed-g');
  const h=_getSelVal('bulk-ed-h');
  if(!document.getElementById('bulk-ed-t')&&!document.getElementById('bulk-ed-u')&&!document.getElementById('bulk-ed-r')&&!document.getElementById('bulk-ed-g')&&!document.getElementById('bulk-ed-h')){
    alert('일괄 편집 창을 다시 열어주세요.');
    return;
  }
  if(!t&&!u&&!r&&!g&&!h){alert('변경할 항목을 선택하세요.');return;}
  _bulkEditSelected.forEach(name=>{
    const p=players.find(x=>x.name===name);
    if(!p) return;
    if(t) p.tier=t;
    if(u) p.univ=u;
    if(r) p.race=r;
    if(g) p.gender=g;
    if(h==='hide') p.hideFromBoard=true;
    else if(h==='show') p.hideFromBoard=undefined;
  });
  save();
  cm('bulkEditModal');
  _bulkEditMode=false;
  _bulkEditSelected=new Set();
  render();
}
function bulkDeleteSelected(){
  if(!_bulkEditSelected.size) return;
  if(!confirm(`선택한 ${_bulkEditSelected.size}명을 삭제할까요?\n전적·기록은 삭제되지 않습니다.`)) return;
  _bulkEditSelected.forEach(name=>{
    const idx=players.findIndex(x=>x.name===name);
    if(idx>=0) players.splice(idx,1);
  });
  if(typeof fixPoints==='function') fixPoints();
  save();
  cm('bulkEditModal');
  _bulkEditMode=false;
  _bulkEditSelected=new Set();
  render();
}

function openMergePlayersModal(){
  if(!isLoggedIn) return;
  const modalId='_mergePlayersModal';
  let modal=document.getElementById(modalId);
  if(modal) modal.remove();
  modal=document.createElement('div');
  modal.id=modalId;
  modal.style.cssText='position:fixed;inset:0;background:#0008;z-index:var(--z-modal-5);display:flex;align-items:center;justify-content:center;padding:16px;box-sizing:border-box';
  const list=players.map(p=>p.name).filter(Boolean).sort((a,b)=>a.localeCompare(b));
  modal.innerHTML=`<div style="background:var(--white);border-radius:var(--r2);padding:18px 18px 16px;width:520px;max-width:100%;box-shadow:0 10px 50px rgba(0,0,0,.35)">
    <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:10px">
      <div style="font-weight:900;font-size:var(--fs-md)">🔀 스트리머 병합</div>
      <button class="btn btn-w btn-xs" onclick="document.getElementById('${modalId}').remove()">닫기</button>
    </div>
    <div style="font-size:var(--fs-sm);color:var(--text3);line-height:1.6;margin-bottom:12px">
      A(원본)를 B(대상)로 합칩니다. 모든 기록/대진/현황판에서 A 이름을 B로 치환합니다.
    </div>
    <datalist id="_mergePlayersList">${list.map(n=>`<option value="${escAttr(n)}"></option>`).join('')}</datalist>
    <div style="display:flex;gap:10px;flex-wrap:wrap">
      <div style="flex:1;min-width:220px">
        <div style="font-size:var(--fs-sm);font-weight:800;color:var(--text2);margin-bottom:4px">A (원본)</div>
        <input id="_mergeFrom" list="_mergePlayersList" placeholder="예: 닉네임(오타)" style="width:100%;padding:8px 10px;border:1.5px solid var(--border2);border-radius:var(--r);box-sizing:border-box">
      </div>
      <div style="flex:1;min-width:220px">
        <div style="font-size:var(--fs-sm);font-weight:800;color:var(--text2);margin-bottom:4px">B (대상)</div>
        <input id="_mergeTo" list="_mergePlayersList" placeholder="예: 닉네임(정상)" style="width:100%;padding:8px 10px;border:1.5px solid var(--border2);border-radius:var(--r);box-sizing:border-box">
      </div>
    </div>
    <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-top:12px">
      <label style="display:flex;align-items:center;gap:8px;font-size:var(--fs-sm);color:var(--text3);cursor:pointer">
        <input id="_mergeDel" type="checkbox" checked style="width:15px;height:15px;cursor:pointer"> A(원본) 스트리머 삭제
      </label>
      <label style="display:flex;align-items:center;gap:8px;font-size:var(--fs-sm);color:var(--text3);cursor:pointer">
        <input id="_mergeFill" type="checkbox" checked style="width:15px;height:15px;cursor:pointer"> B 정보가 비면 A 정보로 보강(사진/채널/메모)
      </label>
    </div>
    <div style="display:flex;gap:10px;margin-top:14px">
      <button class="btn btn-b" style="flex:1" onclick="mergePlayersApply()">병합 실행</button>
      <button class="btn btn-w" style="flex:1" onclick="document.getElementById('${modalId}').remove()">취소</button>
    </div>
  </div>`;
  document.body.appendChild(modal);
  const i=document.getElementById('_mergeFrom');
  if(i) i.focus();
}

function mergePlayersApply(){
  const from=(document.getElementById('_mergeFrom')?.value||'').trim();
  const to=(document.getElementById('_mergeTo')?.value||'').trim();
  const del=document.getElementById('_mergeDel')?.checked||false;
  const fill=document.getElementById('_mergeFill')?.checked||false;
  mergePlayers(from,to,{del,fill});
}

function mergePlayers(fromName, toName, opt){
  if(!fromName||!toName) return alert('A/B 둘 다 입력하세요.');
  if(fromName===toName) return alert('A와 B가 같습니다.');
  const fromP=players.find(p=>p.name===fromName);
  const toP=players.find(p=>p.name===toName);
  if(!fromP) return alert(`원본(A) "${fromName}"을 찾을 수 없습니다.`);
  if(!toP) return alert(`대상(B) "${toName}"을 찾을 수 없습니다.`);
  if(!confirm(`"${fromName}" → "${toName}" 병합을 진행할까요?\n(되돌리기 어렵습니다)`)) return;

  const _repList = (arr, fn) => { (arr||[]).forEach(fn); };
  const _repMembers = (mems) => { _repList(mems, m => { if(m && m.name===fromName) m.name=toName; }); };
  const _repGames = (games) => { _repList(games, g => { if(!g) return; if(g.playerA===fromName) g.playerA=toName; if(g.playerB===fromName) g.playerB=toName; if(g.wName===fromName) g.wName=toName; if(g.lName===fromName) g.lName=toName; if(g.winner===fromName) g.winner=toName; }); };
  const _repSets = (sets) => { _repList(sets, s => { if(!s) return; _repGames(s.games); if(s.winner===fromName) s.winner=toName; }); };
  const _repMatch = (m) => {
    if(!m) return;
    if(m.a===fromName) m.a=toName;
    if(m.b===fromName) m.b=toName;
    if(m.wName===fromName) m.wName=toName;
    if(m.lName===fromName) m.lName=toName;
    if(m.playerA===fromName) m.playerA=toName;
    if(m.playerB===fromName) m.playerB=toName;
    if(m.winner===fromName) m.winner=toName;
    _repMembers(m.membersA);
    _repMembers(m.membersB);
    _repMembers(m.teamAMembers);
    _repMembers(m.teamBMembers);
    _repSets(m.sets);
    _repGames(m.games);
  };

  _repList([...(miniM||[]), ...(univM||[]), ...(ckM||[]), ...(proM||[]), ...(comps||[]), ...(ttM||[])], _repMatch);
  _repList(indM||[], m => { if(!m) return; if(m.wName===fromName) m.wName=toName; if(m.lName===fromName) m.lName=toName; if(m.matchupA===fromName) m.matchupA=toName; if(m.matchupB===fromName) m.matchupB=toName; });
  _repList(gjM||[], m => { if(!m) return; if(m.wName===fromName) m.wName=toName; if(m.lName===fromName) m.lName=toName; });

  const _repTourney = (tn) => {
    if(!tn) return;
    if(Array.isArray(tn.groups)){
      tn.groups.forEach(g=>{
        if(!g) return;
        if(Array.isArray(g.players)) g.players=g.players.map(n=>n===fromName?toName:n);
        if(Array.isArray(g.univs)) g.univs=g.univs.map(n=>n===fromName?toName:n);
        _repList(g.matches, _repMatch);
      });
    }
    if(Array.isArray(tn.bracket)){
      tn.bracket.forEach(r=>_repList(r,_repMatch));
    }
    if(tn.thirdPlace) _repMatch(tn.thirdPlace);
    if(Array.isArray(tn.gjMatches)) _repList(tn.gjMatches, s => { if(!s) return; if(s.a===fromName) s.a=toName; if(s.b===fromName) s.b=toName; _repList(s.games, g => { if(!g) return; if(g.winner===fromName) g.winner=toName; }); });
  };
  _repList(proTourneys||[], _repTourney);
  _repList(tourneys||[], _repTourney);

  players.forEach(p=>{
    if(!p) return;
    if(Array.isArray(p.history)){
      p.history.forEach(h=>{
        if(!h) return;
        if(h.opp===fromName) h.opp=toName;
        if(h.who===fromName) h.who=toName;
      });
    }
  });

  if(typeof boardPlayerOrder!=='undefined' && boardPlayerOrder){
    Object.keys(boardPlayerOrder).forEach(u=>{
      const arr=boardPlayerOrder[u]||[];
      const hasTo=arr.includes(toName);
      boardPlayerOrder[u]=arr.filter(n=>n!==fromName);
      if(!hasTo && arr.includes(fromName)) boardPlayerOrder[u].push(toName);
    });
    if(typeof saveBoardPlayerOrder==='function') saveBoardPlayerOrder();
  }

  if(typeof playerStatusIcons!=='undefined'){
    if(playerStatusIcons[fromName] && !playerStatusIcons[toName]) playerStatusIcons[toName]=playerStatusIcons[fromName];
    delete playerStatusIcons[fromName];
    try{ if(typeof _iconPersistState==='function') _iconPersistState(); }catch(e){}
  }

  if(opt?.fill){
    if(!toP.photo && fromP.photo) toP.photo=fromP.photo;
    if(!toP.channelUrl && fromP.channelUrl) toP.channelUrl=fromP.channelUrl;
    if(!toP.memo && fromP.memo) toP.memo=fromP.memo;
  }
  toP.win=(toP.win||0)+(fromP.win||0);
  toP.loss=(toP.loss||0)+(fromP.loss||0);
  toP.points=(toP.points||0)+(fromP.points||0);
  if(!toP.elo && fromP.elo) toP.elo=fromP.elo;
  if(Array.isArray(fromP.history)){
    if(!Array.isArray(toP.history)) toP.history=[];
    toP.history.unshift(...fromP.history);
  }

  if(opt?.del){
    const idx=players.findIndex(p=>p.name===fromName);
    if(idx>=0) players.splice(idx,1);
  }

  if(typeof fixPoints==='function') fixPoints();
  save();
  const m=document.getElementById('_mergePlayersModal');
  if(m) m.remove();
  render();
}

function tierRankGoHist(modeId, playerName){
  const mode=(modeId||'').toLowerCase();
  let type='전체';
  if(mode.startsWith('mini_')||mode.startsWith('civ_')) type='mini';
  else if(mode.startsWith('univm_')) type='univm';
  else if(mode.startsWith('ck_')) type='ck';
  else if(mode.startsWith('pro_')) type='pro';
  else if(mode.startsWith('tt_')) type='tt';
  else if(mode.startsWith('ind_')) type='ind';
  else if(mode.startsWith('gj_')) type='gj';
  else if(mode.startsWith('comp_')) type='tourney';
  if(!window._recQ) window._recQ={};
  window._recQ['all']=playerName||'';
  window._recTypeFilter=type;
  curTab='hist';
  histSub='all';
  openDetails={};
  if(window.histPage && window.histPage['all']!==undefined) window.histPage['all']=0;
  render();
}

/* ══════════════════════════════════════
   티어 순위표
══════════════════════════════════════ */
let tierRankMode='tier'; // tier | winstreak | wins | revstreak | winrate | recent

(function _injectTierRankUiStyle(){
  if(typeof document==='undefined') return;
  if(document.getElementById('tier-rank-ui-style')) return;
  const s=document.createElement('style');
  s.id='tier-rank-ui-style';
  s.textContent=[
    '.tier-shell{display:flex;flex-direction:column;gap:14px}',
    '.tier-hero{display:flex;align-items:flex-start;justify-content:space-between;gap:14px;padding:20px 22px;border-radius:28px;background:linear-gradient(180deg,rgba(255,255,255,.99),rgba(248,250,252,.96));border:1px solid rgba(148,163,184,.18);box-shadow:0 18px 34px rgba(15,23,42,.06);position:relative;overflow:hidden}',
    '.tier-hero::after{content:none}',
    '.tier-hero-copy{display:flex;flex-direction:column;gap:6px;min-width:0}',
    '.tier-hero-kicker{font-size:var(--fs-caption);font-weight:900;letter-spacing:.08em;color:#1d4ed8;text-transform:uppercase;position:relative;z-index:1}',
    '.tier-hero-title{font-size:26px;font-weight:950;letter-spacing:-.03em;color:var(--text1);line-height:1.15;position:relative;z-index:1}',
    '.tier-hero-desc{font-size:var(--fs-base);line-height:1.6;color:var(--text3);position:relative;z-index:1;max-width:720px}',
    '.tier-hero-badges{display:flex;flex-wrap:wrap;gap:8px;justify-content:flex-end}',
    '.tier-hero-badge{display:inline-flex;align-items:center;gap:6px;padding:8px 12px;border-radius:999px;background:linear-gradient(180deg,rgba(255,255,255,.98),rgba(248,250,252,.94));border:1px solid rgba(148,163,184,.18);font-size:var(--fs-sm);font-weight:800;color:var(--text2);box-shadow:0 10px 18px rgba(15,23,42,.05);position:relative;z-index:1}',
    '.tier-toolbar-card,.tier-content-card{padding:14px 16px;border-radius:24px;background:linear-gradient(180deg,rgba(255,255,255,.99),rgba(248,250,252,.96));border:1px solid rgba(148,163,184,.18);box-shadow:0 18px 34px rgba(15,23,42,.06)}',
    '.tier-filter-shell{display:flex;flex-direction:column;gap:10px}',
    '.tier-toolbar-card .pill{border-radius:999px;border:1px solid rgba(148,163,184,.18);background:linear-gradient(180deg,rgba(255,255,255,.96),rgba(248,250,252,.92));color:var(--text2);font-weight:800;box-shadow:0 8px 16px rgba(15,23,42,.04);transition:transform .15s,box-shadow .15s,border-color .15s,background .15s}',
    '.tier-toolbar-card .pill:hover{transform:translateY(-1px);box-shadow:0 14px 24px rgba(15,23,42,.08)}',
    '.tier-toolbar-card .pill.on{background:linear-gradient(135deg,#2563eb,#3b82f6);border-color:#2563eb;color:#fff;box-shadow:0 14px 26px rgba(37,99,235,.24)}',
    '.tier-toolbar-card .tier-chip-soft{display:inline-flex;align-items:center;gap:6px;padding:4px 10px;border-radius:999px;border:1px solid rgba(148,163,184,.16);background:rgba(248,250,252,.94);font-size:var(--fs-caption);font-weight:800;color:var(--text2)}',
    '.tier-toolbar-card .tier-chip-soft button{border:0;background:transparent;color:inherit;padding:0;margin:0;cursor:pointer;font-size:var(--fs-sm);font-weight:900;line-height:1;opacity:.72}',
    '.tier-toolbar-card .tier-chip-soft button:hover{opacity:1}',
    '.tier-toolbar-card .tier-chip-soft.is-date{background:linear-gradient(180deg,rgba(219,234,254,.96),rgba(239,246,255,.92));border-color:rgba(59,130,246,.22);color:#1d4ed8}',
    '.tier-toolbar-card .tier-chip-soft.is-univ{background:linear-gradient(180deg,rgba(237,233,254,.96),rgba(245,243,255,.92));border-color:rgba(124,58,237,.20);color:#6d28d9}',
    '.tier-toolbar-card .tier-chip-soft.is-tier{background:linear-gradient(180deg,rgba(255,247,237,.96),rgba(255,251,235,.92));border-color:rgba(245,158,11,.24);color:#b45309}',
    '.tier-toolbar-card .tier-chip-soft.is-race{background:linear-gradient(180deg,rgba(236,253,245,.96),rgba(240,253,250,.92));border-color:rgba(16,185,129,.20);color:#047857}',
    '.tier-toolbar-card .tier-chip-soft.is-option{background:linear-gradient(180deg,rgba(254,242,242,.96),rgba(255,241,242,.92));border-color:rgba(239,68,68,.20);color:#b91c1c}',
    '.tier-toolbar-card .tier-chip-soft.is-type{background:linear-gradient(180deg,rgba(243,232,255,.96),rgba(250,245,255,.92));border-color:rgba(168,85,247,.20);color:#7e22ce}',
    '.tier-filter-blocks{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}',
    '.tier-filter-block{display:flex;flex-direction:column;gap:8px;padding:12px 14px;border-radius:18px;border:1px solid rgba(148,163,184,.16);background:linear-gradient(180deg,rgba(255,255,255,.98),rgba(248,250,252,.94));box-shadow:0 10px 18px rgba(15,23,42,.04)}',
    '.tier-filter-block.is-full{grid-column:1 / -1}',
    '.tier-filter-head{display:flex;align-items:center;justify-content:space-between;gap:8px}',
    '.tier-filter-title{font-size:var(--fs-sm);font-weight:900;color:var(--text2);letter-spacing:-.01em}',
    '.tier-filter-desc{font-size:var(--fs-caption);font-weight:700;color:var(--text3)}',
    '.tier-filter-sub{font-size:var(--fs-caption);font-weight:900;color:var(--text3);letter-spacing:-.01em;margin-top:2px}',
    '.tier-filter-selectrow{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin-top:2px}',
    '.tier-filter-selectbox{display:flex;align-items:center;gap:8px;padding:10px 12px;border-radius:14px;border:1px solid rgba(148,163,184,.16);background:linear-gradient(180deg,rgba(255,255,255,.98),rgba(248,250,252,.94));box-shadow:0 8px 16px rgba(15,23,42,.04)}',
    '.tier-filter-selectbox label{font-size:var(--fs-caption);font-weight:900;color:var(--text3);white-space:nowrap}',
    '.tier-filter-selectbox select{flex:1;min-width:0;border:1px solid rgba(148,163,184,.22);background:#fff;border-radius:var(--r);padding:7px 10px;font-size:var(--fs-sm);font-weight:800;color:var(--text2);outline:none}',
    '.tier-filter-chiprow{overflow-x:auto;flex-wrap:nowrap;-webkit-overflow-scrolling:touch;scrollbar-width:none;gap:6px;padding-bottom:2px}',
    '.tier-filter-option-row{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}',
    '.tier-type-preset-row{display:flex;flex-wrap:wrap;gap:6px}',
    '.tier-type-selected{display:flex;flex-wrap:wrap;gap:6px;padding:10px 12px;border-radius:14px;border:1px dashed rgba(148,163,184,.26);background:rgba(248,250,252,.72)}',
    '.tier-type-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;width:100%}',
    '.tier-type-group{display:flex;flex-direction:column;gap:8px;padding:10px 12px;border-radius:var(--r2);border:1px solid rgba(148,163,184,.16);background:linear-gradient(180deg,rgba(255,255,255,.96),rgba(248,250,252,.9))}',
    '.tier-type-group-head{display:flex;align-items:center;justify-content:space-between;gap:6px}',
    '.tier-type-group-title{font-size:var(--fs-caption);font-weight:900;color:var(--text2)}',
    '.tier-type-group-count{font-size:10px;font-weight:800;color:var(--text3)}',
    '.tier-toggle-pill{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px 12px;border-radius:14px;border:1px solid rgba(148,163,184,.16);background:linear-gradient(180deg,rgba(255,255,255,.98),rgba(248,250,252,.94));cursor:pointer;box-shadow:0 8px 16px rgba(15,23,42,.04);font-size:var(--fs-sm);font-weight:800;color:var(--text2)}',
    '.tier-toggle-pill::after{content:"OFF";font-size:10px;font-weight:900;padding:4px 8px;border-radius:999px;background:rgba(148,163,184,.14);color:var(--text3)}',
    '.tier-toggle-pill.on{border-color:rgba(37,99,235,.24);background:linear-gradient(180deg,rgba(239,246,255,.98),rgba(219,234,254,.92));color:#1d4ed8;box-shadow:0 12px 22px rgba(37,99,235,.10)}',
    '.tier-toggle-pill.on::after{content:"ON";background:rgba(37,99,235,.14);color:#1d4ed8}',
    '.tier-type-box{width:100%;display:flex;flex-wrap:wrap;gap:5px;padding:8px 10px;background:linear-gradient(180deg,rgba(248,250,252,.96),rgba(241,245,249,.94));border-radius:14px;border:1px solid rgba(148,163,184,.16);margin-top:2px}',
    '.tier-view-btn{padding:6px 9px;border-radius:var(--r);border:1.5px solid var(--border2);background:var(--white);color:var(--text3);font-size:var(--fs-base);cursor:pointer;line-height:1;box-shadow:0 8px 16px rgba(15,23,42,.04)}',
    '.tier-view-btn.on{border-color:var(--blue);background:#eff6ff;color:var(--blue)}',
    '.tier-univ-badge{display:inline-flex;align-items:center;gap:6px;padding:4px 10px;border-radius:999px;color:#fff;font-weight:900;letter-spacing:-.01em;box-shadow:0 10px 18px rgba(15,23,42,.10),inset 0 1px 0 rgba(255,255,255,.28)}',
    '.tier-univ-badge img{box-shadow:0 4px 10px rgba(15,23,42,.16);background:rgba(255,255,255,.82);padding:1px}',
    '.tier-act-dot{display:inline-flex;align-items:center;justify-content:center;min-width:24px;height:24px;padding:0 6px;border-radius:999px;border:1px solid rgba(148,163,184,.16);background:linear-gradient(180deg,rgba(255,255,255,.96),rgba(248,250,252,.92));box-shadow:0 8px 16px rgba(15,23,42,.05);font-size:var(--fs-caption);font-weight:900}',
    '.tier-act-dot.hot{color:#16a34a;border-color:rgba(34,197,94,.28);background:linear-gradient(180deg,rgba(240,253,244,.98),rgba(220,252,231,.92))}',
    '.tier-act-dot.warm{color:#d97706;border-color:rgba(245,158,11,.28);background:linear-gradient(180deg,rgba(255,251,235,.98),rgba(254,243,199,.92))}',
    '.tier-act-dot.cool{color:#64748b;border-color:rgba(148,163,184,.24);background:linear-gradient(180deg,rgba(248,250,252,.98),rgba(241,245,249,.92))}',
    '.tier-act-dot.none{color:#94a3b8}',
    '.tier-table-wrap{overflow-x:auto;-webkit-overflow-scrolling:touch;width:100%}',
    '.tier-table{table-layout:auto;width:100%;min-width:1120px;max-width:1600px;margin:0 auto;border-collapse:separate;border-spacing:0 8px}',
    '.tier-table thead th{background:linear-gradient(180deg,#eff6ff,#dbeafe);border-top:1px solid rgba(96,165,250,.24);border-bottom:1px solid rgba(96,165,250,.24);color:#1e3a8a}',
    '.tier-table tbody tr{box-shadow:0 12px 24px rgba(15,23,42,.05)}',
    '.tier-table tbody tr.top1 td,.tier-table tbody tr.top2 td,.tier-table tbody tr.top3 td{background:linear-gradient(180deg,rgba(255,255,255,.98),rgba(248,250,252,.94));border-top-color:rgba(148,163,184,.14);border-bottom-color:rgba(148,163,184,.14)}',
    '.tier-table tbody td{background:linear-gradient(180deg,rgba(255,255,255,.98),rgba(248,250,252,.94));border-top:1px solid rgba(148,163,184,.14);border-bottom:1px solid rgba(148,163,184,.14)}',
    '.tier-table tbody tr td:first-child{border-left:1px solid rgba(148,163,184,.14);border-top-left-radius:16px;border-bottom-left-radius:16px}',
    '.tier-table tbody tr td:last-child{border-right:1px solid rgba(148,163,184,.14);border-top-right-radius:16px;border-bottom-right-radius:16px}',
    '.tier-rank-chip{display:inline-flex;align-items:center;justify-content:center;min-width:54px;height:30px;padding:0 10px;border-radius:999px;font-size:var(--fs-sm);font-weight:900;letter-spacing:-.02em;border:1px solid transparent;box-shadow:0 10px 18px rgba(15,23,42,.08)}',
    '.tier-rank-chip.gold{background:linear-gradient(180deg,#fef3c7,#fbbf24);border-color:#f59e0b;color:#78350f}',
    '.tier-rank-chip.silver{background:linear-gradient(180deg,#f8fafc,#cbd5e1);border-color:#94a3b8;color:#334155}',
    '.tier-rank-chip.bronze{background:linear-gradient(180deg,#fed7aa,#fb923c);border-color:#ea580c;color:#7c2d12}',
    '.tier-card-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:12px;padding:4px 0}',
    '.tier-rank-card{cursor:pointer;background:linear-gradient(180deg,rgba(255,255,255,.98),rgba(248,250,252,.94));border:1.5px solid rgba(148,163,184,.18);border-radius:18px;padding:14px 12px;display:flex;flex-direction:column;align-items:center;gap:7px;transition:box-shadow .15s,transform .15s;position:relative;box-shadow:0 12px 24px rgba(15,23,42,.05)}',
    '.tier-rank-card:hover{box-shadow:0 18px 30px rgba(15,23,42,.08);transform:translateY(-2px)}',
    '.tier-rank-card.top1,.tier-rank-card.top2,.tier-rank-card.top3{box-shadow:0 16px 30px rgba(15,23,42,.07);border-color:rgba(148,163,184,.22)}',
    '.tier-rank-badge{position:absolute;top:8px;left:10px;font-size:var(--fs-sm);font-weight:900}',
    '.tier-rank-act{position:absolute;top:8px;right:10px}',
    '.tier-rank-statgrid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;width:100%;border-top:1px solid rgba(148,163,184,.16);padding-top:8px;margin-top:4px}',
    '.tier-rank-stat{padding:7px 4px;border-radius:12px;background:rgba(248,250,252,.9);text-align:center;border:1px solid rgba(148,163,184,.14)}',
    '.tier-rank-extra{font-size:var(--fs-caption);text-align:center;padding:5px 10px;border-radius:999px;background:rgba(59,130,246,.08);border:1px solid rgba(59,130,246,.16);font-weight:800;color:var(--text2)}',
    '.tier-podium-wrap{display:flex;flex-direction:column;gap:18px}',
    '.tier-podium-stage{display:grid;grid-template-columns:minmax(0,1fr) minmax(260px,1.22fr) minmax(0,1fr);gap:14px;align-items:stretch}',
    '.tier-podium-lane{display:flex;align-items:stretch}',
    '.tier-podium-card{display:flex;flex-direction:column;gap:12px;cursor:pointer;padding:18px;border-radius:24px;background:linear-gradient(180deg,rgba(255,255,255,.99),rgba(248,250,252,.95));border:1px solid rgba(148,163,184,.16);box-shadow:0 18px 34px rgba(15,23,42,.06)}',
    '.tier-podium-card.place-1{min-height:100%;padding:22px;border-radius:28px;background:linear-gradient(180deg,rgba(255,251,235,.98),rgba(255,247,237,.95));border-color:rgba(245,158,11,.24);box-shadow:0 24px 42px rgba(245,158,11,.12)}',
    '.tier-podium-card.place-2{justify-content:flex-end;background:linear-gradient(180deg,rgba(248,250,252,.99),rgba(241,245,249,.95))}',
    '.tier-podium-card.place-3{justify-content:flex-end;background:linear-gradient(180deg,rgba(255,247,237,.99),rgba(255,237,213,.94))}',
    '.tier-podium-rankline{display:flex;align-items:center;justify-content:space-between;gap:10px}',
    '.tier-podium-medal{display:inline-flex;align-items:center;gap:8px;font-size:var(--fs-base);font-weight:900;color:var(--text2)}',
    '.tier-podium-ranknum{display:inline-flex;align-items:center;justify-content:center;min-width:38px;height:38px;padding:0 10px;border-radius:999px;background:rgba(15,23,42,.06);font-size:var(--fs-base);font-weight:900;color:var(--text2)}',
    '.tier-podium-card.place-1 .tier-podium-ranknum{background:rgba(245,158,11,.14);color:#b45309}',
    '.tier-podium-main{display:flex;align-items:center;gap:12px;min-width:0}',
    '.tier-podium-main--hero{align-items:flex-start}',
    '.tier-podium-copy{display:flex;flex-direction:column;gap:6px;min-width:0;flex:1}',
    '.tier-podium-name{font-size:19px;font-weight:950;letter-spacing:-.03em;color:var(--text1);min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
    '.tier-podium-card.place-1 .tier-podium-name{font-size:24px}',
    '.tier-podium-sub{display:flex;align-items:center;gap:6px;flex-wrap:wrap;min-width:0}',
    '.tier-podium-highlight{font-size:var(--fs-sm);line-height:1.6;color:var(--text3)}',
    '.tier-podium-stats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}',
    '.tier-podium-card.place-1 .tier-podium-stats{gap:10px}',
    '.tier-podium-statbox{display:flex;flex-direction:column;gap:4px;padding:10px 11px;border-radius:var(--r2);background:rgba(255,255,255,.8);border:1px solid rgba(148,163,184,.14);min-width:0}',
    '.tier-podium-statbox-label{font-size:10px;font-weight:800;color:var(--text3);letter-spacing:.04em;text-transform:uppercase}',
    '.tier-podium-statbox-value{font-size:14px;font-weight:900;color:var(--text1);min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
    '.tier-podium-foot{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:auto}',
    '.tier-podium-stat{font-size:var(--fs-caption);font-weight:800;padding:5px 10px;border-radius:999px;background:rgba(255,255,255,.84);border:1px solid rgba(148,163,184,.16)}',
    '.tier-podium-rest{padding-top:2px}',
    '.tier-podium-rest-head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:10px}',
    '.tier-podium-rest-title{font-size:var(--fs-sm);font-weight:900;color:var(--text2);letter-spacing:-.02em}',
    '.tier-podium-rest-sub{font-size:var(--fs-caption);font-weight:700;color:var(--text3)}',
    '.tier-podium-rest-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:10px}',
    '.tier-podium-rest-item{cursor:pointer;display:flex;flex-direction:column;gap:10px;padding:12px 13px;border-radius:18px;border:1px solid rgba(148,163,184,.16);background:linear-gradient(180deg,rgba(255,255,255,.99),rgba(248,250,252,.95));box-shadow:0 10px 20px rgba(15,23,42,.04)}',
    '.tier-podium-rest-top{display:flex;align-items:center;gap:10px;min-width:0}',
    '.tier-podium-rest-rank{font-size:var(--fs-sm);font-weight:900;color:var(--text3);min-width:34px}',
    '.tier-podium-rest-copy{display:flex;flex-direction:column;gap:5px;min-width:0;flex:1}',
    '.tier-podium-rest-name{font-size:var(--fs-base);font-weight:900;color:var(--text1);min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
    '.tier-podium-rest-subline{display:flex;align-items:center;gap:5px;flex-wrap:wrap}',
    '.tier-podium-rest-metrics{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}',
    '.tier-podium-card,.tier-podium-rest-item,.tier-compact-item,.tier-group-card{position:relative;transition:transform .2s ease,box-shadow .2s ease,border-color .2s ease,background .2s ease}',
    '.tier-podium-card:hover{animation:podiumCardHoverFloat .34s ease forwards;box-shadow:0 28px 48px rgba(15,23,42,.16)}',
    '.tier-podium-rest-item:hover,.tier-compact-item:hover,.tier-group-card:hover{transform:translateY(-1px)}',
    '.tier-podium-card.is-selected,.tier-podium-rest-item.is-selected,.tier-compact-item.is-selected,.tier-group-card.is-selected{border-color:color-mix(in srgb,var(--selected-accent,#3b82f6) 44%, rgba(148,163,184,.18));box-shadow:0 14px 28px rgba(15,23,42,.08),0 0 0 2px color-mix(in srgb,var(--selected-accent,#3b82f6) 22%, transparent)}',
    '.tier-podium-card.is-selected::after,.tier-podium-rest-item.is-selected::after,.tier-compact-item.is-selected::after,.tier-group-card.is-selected::after{content:"";position:absolute;inset:0;border-radius:inherit;box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--selected-accent,#3b82f6) 44%, transparent);pointer-events:none}',
    '.tier-compact-list{display:flex;flex-direction:column;gap:8px}',
    '.tier-compact-head{display:grid;grid-template-columns:64px minmax(0,2.2fr) minmax(240px,1.4fr) 36px;gap:12px;align-items:center;padding:0 12px 4px;color:var(--text3);font-size:10px;font-weight:900;letter-spacing:.06em;text-transform:uppercase}',
    '.tier-compact-item{cursor:pointer;display:grid;grid-template-columns:64px minmax(0,2.2fr) minmax(240px,1.4fr) 36px;gap:12px;align-items:center;padding:10px 12px;border-radius:var(--r2);background:linear-gradient(180deg,rgba(255,255,255,.99),rgba(248,250,252,.95));border:1px solid rgba(148,163,184,.14);border-left:4px solid var(--selected-accent,#94a3b8);box-shadow:0 8px 16px rgba(15,23,42,.035)}',
    '.tier-compact-rankbox{display:flex;flex-direction:column;align-items:center;gap:3px}',
    '.tier-compact-rank{font-size:var(--fs-lg);font-weight:950;color:var(--text1);line-height:1}',
    '.tier-compact-rank-label{font-size:10px;font-weight:800;color:var(--text3);line-height:1}',
    '.tier-compact-main{display:flex;align-items:center;gap:10px;min-width:0}',
    '.tier-compact-meta{display:flex;flex-direction:column;gap:5px;min-width:0;flex:1}',
    '.tier-compact-name{font-size:var(--fs-base);font-weight:900;color:var(--text1);min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
    '.tier-compact-sub{display:flex;align-items:center;gap:5px;flex-wrap:wrap;min-width:0}',
    '.tier-compact-metrics{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;min-width:0}',
    '.tier-compact-metric{display:flex;flex-direction:column;gap:4px;align-items:flex-end;padding:7px 9px;border-radius:12px;background:rgba(248,250,252,.9);border:1px solid rgba(148,163,184,.12);min-width:0}',
    '.tier-compact-metric-label{font-size:10px;font-weight:800;color:var(--text3);letter-spacing:.02em}',
    '.tier-compact-metric-value{font-size:var(--fs-sm);font-weight:900;color:var(--text1);min-width:0;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
    '.tier-compact-side{display:flex;align-items:center;justify-content:center}',
    '.tier-compact-extra{font-size:10px;padding:3px 8px;border-radius:999px;background:rgba(59,130,246,.08);border:1px solid rgba(59,130,246,.16);font-weight:800;color:var(--text2)}',
    '.tier-group-sec{margin-bottom:16px}',
    '.tier-group-head{display:flex;align-items:center;gap:8px;padding:10px 14px;border-radius:var(--r2);margin-bottom:8px;box-shadow:0 10px 20px rgba(15,23,42,.04)}',
    '.tier-group-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:8px;padding:0 4px}',
    '.tier-group-card{cursor:pointer;background:linear-gradient(180deg,rgba(255,255,255,.98),rgba(248,250,252,.94));border:1px solid rgba(148,163,184,.16);border-radius:14px;padding:10px 8px;display:flex;flex-direction:column;align-items:center;gap:4px;box-shadow:0 10px 20px rgba(15,23,42,.04)}',
    'body.dark .tier-hero{background:linear-gradient(180deg,rgba(15,23,42,.94),rgba(15,23,42,.9));border-color:#334155;box-shadow:0 20px 38px rgba(0,0,0,.28),inset 0 1px 0 rgba(255,255,255,.03)}',
    'body.dark .tier-toolbar-card,body.dark .tier-content-card{background:linear-gradient(180deg,rgba(15,23,42,.94),rgba(15,23,42,.9));border-color:#334155;box-shadow:0 20px 38px rgba(0,0,0,.28),inset 0 1px 0 rgba(255,255,255,.03)}',
    'body.dark .tier-hero-title{color:#f8fafc}',
    'body.dark .tier-hero-desc{color:#94a3b8}',
    'body.dark .tier-hero-badge{background:rgba(30,41,59,.78);border-color:#334155;color:#cbd5e1}',
    'body.dark .tier-toolbar-card .pill{background:linear-gradient(180deg,rgba(15,23,42,.94),rgba(15,23,42,.9));border-color:#334155;color:#cbd5e1;box-shadow:0 12px 22px rgba(0,0,0,.18)}',
    'body.dark .tier-toolbar-card .pill.on{background:linear-gradient(135deg,#1d4ed8,#2563eb);border-color:#2563eb;color:#eff6ff;box-shadow:0 16px 28px rgba(37,99,235,.22)}',
    'body.dark .tier-toolbar-card .tier-chip-soft,body.dark .tier-type-box{background:linear-gradient(180deg,rgba(15,23,42,.92),rgba(30,41,59,.88));border-color:#334155;color:#cbd5e1}',
    'body.dark .tier-toolbar-card .tier-chip-soft.is-date{background:linear-gradient(180deg,rgba(29,78,216,.22),rgba(30,64,175,.18));border-color:rgba(96,165,250,.22);color:#bfdbfe}',
    'body.dark .tier-toolbar-card .tier-chip-soft.is-univ{background:linear-gradient(180deg,rgba(109,40,217,.22),rgba(91,33,182,.18));border-color:rgba(196,181,253,.18);color:#ddd6fe}',
    'body.dark .tier-toolbar-card .tier-chip-soft.is-tier{background:linear-gradient(180deg,rgba(180,83,9,.22),rgba(146,64,14,.18));border-color:rgba(251,191,36,.18);color:#fde68a}',
    'body.dark .tier-toolbar-card .tier-chip-soft.is-race{background:linear-gradient(180deg,rgba(4,120,87,.22),rgba(6,95,70,.18));border-color:rgba(110,231,183,.18);color:#a7f3d0}',
    'body.dark .tier-toolbar-card .tier-chip-soft.is-option{background:linear-gradient(180deg,rgba(185,28,28,.22),rgba(153,27,27,.18));border-color:rgba(252,165,165,.18);color:#fecaca}',
    'body.dark .tier-toolbar-card .tier-chip-soft.is-type{background:linear-gradient(180deg,rgba(126,34,206,.22),rgba(107,33,168,.18));border-color:rgba(216,180,254,.18);color:#e9d5ff}',
    'body.dark .tier-filter-block{background:linear-gradient(180deg,rgba(15,23,42,.92),rgba(30,41,59,.88));border-color:#334155;box-shadow:0 14px 24px rgba(0,0,0,.18)}',
    'body.dark .tier-filter-title{color:#e2e8f0}',
    'body.dark .tier-filter-desc{color:#94a3b8}',
    'body.dark .tier-filter-sub{color:#94a3b8}',
    'body.dark .tier-filter-selectbox{background:linear-gradient(180deg,rgba(15,23,42,.94),rgba(30,41,59,.88));border-color:#334155;box-shadow:0 12px 22px rgba(0,0,0,.18)}',
    'body.dark .tier-filter-selectbox label{color:#94a3b8}',
    'body.dark .tier-filter-selectbox select{background:#0f172a;border-color:#334155;color:#e2e8f0}',
    'body.dark .tier-type-selected{background:rgba(15,23,42,.56);border-color:#334155}',
    'body.dark .tier-type-group{background:linear-gradient(180deg,rgba(15,23,42,.94),rgba(30,41,59,.88));border-color:#334155}',
    'body.dark .tier-type-group-title{color:#e2e8f0}',
    'body.dark .tier-type-group-count{color:#94a3b8}',
    'body.dark .tier-toggle-pill{background:linear-gradient(180deg,rgba(15,23,42,.94),rgba(30,41,59,.88));border-color:#334155;color:#cbd5e1;box-shadow:0 12px 22px rgba(0,0,0,.18)}',
    'body.dark .tier-toggle-pill::after{background:rgba(148,163,184,.14);color:#cbd5e1}',
    'body.dark .tier-toggle-pill.on{background:linear-gradient(180deg,rgba(30,64,175,.26),rgba(29,78,216,.20));border-color:#2563eb;color:#dbeafe}',
    'body.dark .tier-toggle-pill.on::after{background:rgba(59,130,246,.18);color:#bfdbfe}',
    'body.dark .tier-view-btn{background:#0f172a;border-color:#334155;color:#cbd5e1;box-shadow:0 12px 22px rgba(0,0,0,.18)}',
    'body.dark .tier-view-btn.on{background:#17263c;color:#93c5fd;border-color:#2563eb}',
    'body.dark .tier-univ-badge{box-shadow:0 12px 22px rgba(0,0,0,.22),inset 0 1px 0 rgba(255,255,255,.05)}',
    'body.dark .tier-univ-badge img{background:rgba(15,23,42,.72)}',
    'body.dark .tier-table thead th{background:linear-gradient(180deg,#172554,#1e3a8a);border-color:#1d4ed8;color:#dbeafe}',
    'body.dark .tier-table tbody tr.top1 td,body.dark .tier-table tbody tr.top2 td,body.dark .tier-table tbody tr.top3 td{background:linear-gradient(180deg,rgba(15,23,42,.94),rgba(15,23,42,.9));border-top-color:#334155;border-bottom-color:#334155}',
    'body.dark .tier-table tbody td,body.dark .tier-rank-card,body.dark .tier-podium-rest-item,body.dark .tier-compact-item,body.dark .tier-group-card{background:linear-gradient(180deg,rgba(15,23,42,.94),rgba(15,23,42,.9));border-color:#334155;color:#e2e8f0;box-shadow:0 12px 22px rgba(0,0,0,.18)}',
    'body.dark .tier-rank-chip.gold{background:linear-gradient(180deg,#fbbf24,#f59e0b);border-color:#fcd34d;color:#451a03}',
    'body.dark .tier-rank-chip.silver{background:linear-gradient(180deg,#cbd5e1,#94a3b8);border-color:#e2e8f0;color:#0f172a}',
    'body.dark .tier-rank-chip.bronze{background:linear-gradient(180deg,#fb923c,#ea580c);border-color:#fdba74;color:#431407}',
    'body.dark .tier-rank-card.top1,body.dark .tier-rank-card.top2,body.dark .tier-rank-card.top3{box-shadow:0 16px 30px rgba(0,0,0,.22);border-color:#3f4c63}',
    'body.dark .tier-podium-card{background:linear-gradient(180deg,rgba(15,23,42,.94),rgba(15,23,42,.88));border-color:#334155;box-shadow:0 16px 30px rgba(0,0,0,.24)}',
    'body.dark .tier-podium-card.place-1{background:linear-gradient(180deg,rgba(71,38,3,.38),rgba(15,23,42,.94));border-color:rgba(245,158,11,.32)}',
    'body.dark .tier-podium-card.place-2{background:linear-gradient(180deg,rgba(30,41,59,.98),rgba(15,23,42,.9))}',
    'body.dark .tier-podium-card.place-3{background:linear-gradient(180deg,rgba(67,20,7,.28),rgba(15,23,42,.92))}',
    'body.dark .tier-rank-stat,body.dark .tier-podium-stat,body.dark .tier-rank-extra,body.dark .tier-compact-extra{background:rgba(30,41,59,.78);border-color:#334155;color:#e2e8f0}',
    'body.dark .tier-podium-name,body.dark .tier-podium-statbox-value,body.dark .tier-podium-rest-name{color:#f8fafc}',
    'body.dark .tier-podium-medal,body.dark .tier-podium-ranknum,body.dark .tier-podium-highlight,body.dark .tier-podium-rest-title,body.dark .tier-podium-rest-sub,body.dark .tier-podium-rest-rank,body.dark .tier-podium-statbox-label{color:#cbd5e1}',
    'body.dark .tier-podium-statbox{background:rgba(30,41,59,.72);border-color:#334155}',
    'body.dark .tier-compact-head,body.dark .tier-compact-rank-label,body.dark .tier-compact-metric-label{color:#94a3b8}',
    'body.dark .tier-compact-name,body.dark .tier-compact-rank,body.dark .tier-compact-metric-value{color:#f8fafc}',
    'body.dark .tier-compact-metric{background:rgba(30,41,59,.78);border-color:#334155}',
    'body.dark .tier-podium-card.is-selected,body.dark .tier-podium-rest-item.is-selected,body.dark .tier-compact-item.is-selected,body.dark .tier-group-card.is-selected{box-shadow:0 16px 30px rgba(0,0,0,.26),0 0 0 2px color-mix(in srgb,var(--selected-accent,#3b82f6) 26%, transparent);border-color:color-mix(in srgb,var(--selected-accent,#3b82f6) 44%, #334155)}',
    'body.dark .tier-act-dot{background:linear-gradient(180deg,rgba(15,23,42,.94),rgba(30,41,59,.88));border-color:#334155;box-shadow:0 12px 22px rgba(0,0,0,.18)}',
    'body.dark .tier-act-dot.hot{color:#86efac;border-color:rgba(34,197,94,.24)}',
    'body.dark .tier-act-dot.warm{color:#fcd34d;border-color:rgba(245,158,11,.22)}',
    'body.dark .tier-act-dot.cool,body.dark .tier-act-dot.none{color:#cbd5e1}',
    '@media (max-width:780px){.tier-hero{flex-direction:column;padding:16px;border-radius:20px}.tier-hero-title{font-size:20px}.tier-hero-badges{justify-content:flex-start}.tier-toolbar-card,.tier-content-card{padding:10px}.tier-filter-blocks{grid-template-columns:1fr}.tier-filter-selectrow,.tier-filter-option-row,.tier-type-grid{grid-template-columns:1fr}.tier-card-grid{grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:8px}.tier-podium-stage{grid-template-columns:1fr;gap:10px}.tier-podium-card{padding:14px 14px 16px;border-radius:20px}.tier-podium-card.place-1{padding:18px}.tier-podium-name{font-size:var(--fs-lg)}.tier-podium-card.place-1 .tier-podium-name{font-size:20px}.tier-podium-main{align-items:flex-start}.tier-podium-stats{grid-template-columns:repeat(2,minmax(0,1fr))}.tier-podium-rest-grid{grid-template-columns:1fr}.tier-group-grid{grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:6px}.tier-compact-head{display:none}.tier-compact-item{grid-template-columns:48px minmax(0,1fr);gap:8px 10px;align-items:start;padding:9px 10px}.tier-compact-main,.tier-compact-metrics{grid-column:2 / 3}.tier-compact-side{display:none}.tier-compact-metrics{grid-template-columns:repeat(3,minmax(0,1fr));gap:6px}.tier-compact-metric{align-items:flex-start;padding:6px 7px}.tier-compact-metric-value{font-size:var(--fs-caption);white-space:normal}}'
  ].join('');
  document.head.appendChild(s);
})();

function rTier(C,T){
  T.innerText='📊 티어 순위표';
  try{ _bindTotalDelegatedEvents(); }catch(e){}
  if(typeof fUniv==='undefined' && window.fUniv===undefined) window.fUniv='전체';
  if(typeof fTier==='undefined' && window.fTier===undefined) window.fTier='전체';
  const _fUniv = (typeof fUniv!=='undefined') ? fUniv : window.fUniv;
  const _fTier = (typeof fTier!=='undefined') ? fTier : window.fTier;
  if(window._tierExcludeMale===undefined) window._tierExcludeMale=false;
  const _tiers = (typeof TIERS !== 'undefined' && Array.isArray(TIERS))
    ? TIERS
    : (Array.isArray(window.TIERS) ? window.TIERS : null);
  const _getUnivs = (typeof getAllUnivs === 'function') ? getAllUnivs : null;
  const _pl = (typeof players !== 'undefined' && Array.isArray(players))
    ? players
    : (Array.isArray(window.players) ? window.players : null);
  if(!_getUnivs || !_tiers || !_pl){
    const F=document.getElementById('farea');
    if(F) F.innerHTML='';
    C.innerHTML=`<div style="padding:40px 20px;text-align:center;color:var(--gray-l)">데이터 로딩 중...</div>`;
    return;
  }
  const _mini = (typeof miniM!=='undefined' && Array.isArray(miniM)) ? miniM : [];
  const _univm = (typeof univM!=='undefined' && Array.isArray(univM)) ? univM : [];
  const _ck = (typeof ckM!=='undefined' && Array.isArray(ckM)) ? ckM : [];
  const _pro = (typeof proM!=='undefined' && Array.isArray(proM)) ? proM : [];
  const _tt = (typeof ttM!=='undefined' && Array.isArray(ttM)) ? ttM : [];
  const _ind = (typeof indM!=='undefined' && Array.isArray(indM)) ? indM : [];
  const _gj = (typeof gjM!=='undefined' && Array.isArray(gjM)) ? gjM : [];
  const _tourneys = (typeof tourneys!=='undefined' && Array.isArray(tourneys)) ? tourneys : [];
  const allU=_getUnivs();
  const F=document.getElementById('farea');
  // 모드 버튼
  const modes=[
    {id:'tier',lbl:'📊 티어순'},
    {id:'wins',lbl:'🏆 다승순'},
    {id:'winstreak',lbl:'🔥 승차순'},
    {id:'winrate',lbl:'📈 승률순'},
    {id:'revstreak',lbl:'❄️ 역승차순'},
  ];
  const modeSortBtns=[
    {id:'mini_win',lbl:'⚡ 미니 승',color:'#7c3aed'},
    {id:'mini_loss',lbl:'⚡ 미니 패',color:'#7c3aed'},
    {id:'ck_win',lbl:'🤝 CK 승',color:'#dc2626'},
    {id:'ck_loss',lbl:'🤝 CK 패',color:'#dc2626'},
    {id:'comp_win',lbl:'🏆 대회 승',color:'#d97706'},
    {id:'comp_loss',lbl:'🏆 대회 패',color:'#d97706'},
    {id:'ind_win',lbl:'🎮 개인전 승',color:'#16a34a'},
    {id:'ind_loss',lbl:'🎮 개인전 패',color:'#16a34a'},
    {id:'gj_win',lbl:'⚔️ 끝장전 승',color:'#8b5cf6'},
    {id:'gj_loss',lbl:'⚔️ 끝장전 패',color:'#8b5cf6'},
    {id:'civ_win',lbl:'⚔️ 시빌워 승',color:'#db2777'},
    {id:'civ_loss',lbl:'⚔️ 시빌워 패',color:'#db2777'},
    {id:'tt_win',lbl:'🎯 티어대회 승',color:'#f59e0b'},
    {id:'tt_loss',lbl:'🎯 티어대회 패',color:'#f59e0b'},
    {id:'pro_win',lbl:'🏅 프로리그 승',color:'#0891b2'},
    {id:'pro_loss',lbl:'🏅 프로리그 패',color:'#0891b2'},
    {id:'univm_win',lbl:'🏟️ 대학대전 승',color:'#7c3aed'},
    {id:'univm_loss',lbl:'🏟️ 대학대전 패',color:'#7c3aed'},
  ];
  const _typeGroups=[
    { title:'대학/팀전', ids:['mini_win','mini_loss','ck_win','ck_loss','univm_win','univm_loss'] },
    { title:'개인전', ids:['ind_win','ind_loss','gj_win','gj_loss','civ_win','civ_loss'] },
    { title:'대회/프로', ids:['comp_win','comp_loss','tt_win','tt_loss','pro_win','pro_loss'] },
  ];
  const _typePresets=[
    { title:'승만', ids:modeSortBtns.filter(m=>m.id.endsWith('_win')).map(m=>m.id) },
    { title:'패만', ids:modeSortBtns.filter(m=>m.id.endsWith('_loss')).map(m=>m.id) },
    { title:'대학전만', ids:_typeGroups[0].ids },
    { title:'개인전만', ids:_typeGroups[1].ids },
    { title:'대회/프로만', ids:_typeGroups[2].ids },
  ];
  const _isSameTypePreset = (ids)=>{
    const cur = window._tierTypeSet || new Set();
    if(cur.size !== ids.length) return false;
    return ids.every(id => cur.has(id));
  };
  const allModeIds=new Set([...modes.map(m=>m.id),...modeSortBtns.map(m=>m.id)]);
  if(!tierRankMode||!allModeIds.has(tierRankMode)) tierRankMode='tier';
  const _curModeNoFilter=tierRankMode&&(!window._tierTypeSet||window._tierTypeSet.size===0);
  if(window._tierTypeFilterOpen===undefined) window._tierTypeFilterOpen=false;
  if(window._tierFilterOpen===undefined) window._tierFilterOpen=false;
  if(window._tierDatePreset===undefined) window._tierDatePreset='all';
  if(window._tierDateFrom===undefined) window._tierDateFrom='';
  if(window._tierDateTo===undefined) window._tierDateTo='';
  if(!window._tierRaceFilter) window._tierRaceFilter='전체';
  if(window._tierHideNoRecord===undefined) window._tierHideNoRecord=false;
  const _toIsoTier = (v)=>{
    try{
      if(typeof window._toIsoDateStr === 'function'){
        const iso = String(window._toIsoDateStr(v)||'').trim();
        if(iso) return iso.slice(0,10);
      }
    }catch(e){}
    const s = String(v||'').trim();
    if(!s) return '';
    const m = s.match(/(20\d{2})\D?(\d{1,2})\D?(\d{1,2})/);
    if(!m) return '';
    return `${m[1]}-${String(m[2]).padStart(2,'0')}-${String(m[3]).padStart(2,'0')}`;
  };
  const _tierDateNum = (v)=>{
    const iso = _toIsoTier(v);
    return iso ? parseInt(iso.replace(/-/g,''),10) || 0 : 0;
  };
  const _tierNow = new Date();
  const _tierToday = _tierNow.toISOString().slice(0,10);
  const _tierDaysAgo = (n)=>new Date(_tierNow.getTime()-n*86400000).toISOString().slice(0,10);
  const _tierMonthStart = `${_tierNow.getFullYear()}-${String(_tierNow.getMonth()+1).padStart(2,'0')}-01`;
  const _tierPrevMonth = new Date(_tierNow.getFullYear(), _tierNow.getMonth()-1, 1);
  const _tierPrevMonthFrom = `${_tierPrevMonth.getFullYear()}-${String(_tierPrevMonth.getMonth()+1).padStart(2,'0')}-01`;
  const _tierPrevMonthTo = `${_tierPrevMonth.getFullYear()}-${String(_tierPrevMonth.getMonth()+1).padStart(2,'0')}-${String(new Date(_tierPrevMonth.getFullYear(), _tierPrevMonth.getMonth()+1, 0).getDate()).padStart(2,'0')}`;
  const _tierDateFrom = String(window._tierDateFrom||'').trim();
  const _tierDateTo = String(window._tierDateTo||'').trim();
  const _tierFromN = _tierDateNum(_tierDateFrom);
  const _tierToN = _tierDateNum(_tierDateTo);
  const _hasDateFilter = !!(_tierDateFrom || _tierDateTo);
  const _tierDateBadge = _hasDateFilter ? `${_tierDateFrom||'시작'} ~ ${_tierDateTo||'현재'}` : '전체 기간';
  function _tierInDateRange(raw){
    if(!_hasDateFilter) return true;
    const n = _tierDateNum(raw);
    if(!n) return false;
    if(_tierFromN && n < _tierFromN) return false;
    if(_tierToN && n > _tierToN) return false;
    return true;
  }
  let _tierRecByName = null;
  try{
    let _saveSig = '';
    try{ _saveSig = String(localStorage.getItem('su_last_save_time')||''); }catch(e){}
    const _cacheKey = `${_hasDateFilter?'1':'0'}|${_tierDateFrom}|${_tierDateTo}|${_saveSig}`;
    const _cache = window._tierRecByNameCache || null;
    if(_cache && _cache.ref === _pl && _cache.key === _cacheKey && _cache.map){
      _tierRecByName = _cache.map;
    }else{
      const m = {};
      _pl.forEach(p=>{
        const name = p && p.name;
        if(!name) return;
        const hist = Array.isArray(p.history) ? p.history : [];
        let w = 0, l = 0, points = 0, eloDelta = 0, lastD = '';
        if(_hasDateFilter){
          for(const h of hist){
            if(!h) continue;
            const rawDate = h.date || h.d || '';
            if(!_tierInDateRange(rawDate)) continue;
            if(h.result === '승'){ w++; points += 3; }
            else if(h.result === '패'){ l++; points -= 3; }
            eloDelta += (Number(h.eloDelta||0) || 0);
            const d = _toIsoTier(rawDate);
            if(d && d > lastD) lastD = d;
          }
          const tot = w + l;
          m[name] = { w, l, tot, wr: tot ? Math.round(w/tot*100) : 0, points, eloDelta, lastD };
          return;
        }
        w = Number(p.win||0) || 0;
        l = Number(p.loss||0) || 0;
        points = Number(p.points||0) || 0;
        for(const h of hist){
          if(!h) continue;
          const d = _toIsoTier(h.date || h.d || '');
          if(d && d > lastD) lastD = d;
        }
        const tot = w + l;
        m[name] = { w, l, tot, wr: tot ? Math.round(w/tot*100) : 0, points, eloDelta: 0, lastD };
      });
      _tierRecByName = m;
      window._tierRecByNameCache = { ref:_pl, key:_cacheKey, map:m };
    }
  }catch(e){
    _tierRecByName = {};
  }
  function _tierWL(p){
    const name = p && p.name;
    const s = (name && _tierRecByName) ? _tierRecByName[name] : null;
    if(s) return s;
    const w = Number((p && p.win) || 0) || 0;
    const l = Number((p && p.loss) || 0) || 0;
    const tot = w + l;
    return {
      w, l, tot,
      wr: tot ? Math.round(w/tot*100) : 0,
      points: Number((p && p.points) || 0) || 0,
      eloDelta: 0,
      lastD: ''
    };
  }
  const _hasTypeFilter=window._tierTypeSet&&window._tierTypeSet.size>0;
  // 활성 필터 수 계산 (뱃지용)
  const _activeFilters=[
    _fUniv!=='전체', _fTier!=='전체',
    _hasDateFilter,
    window._tierRaceFilter!=='전체',
    window._tierHideNoRecord, window._tierExcludeMale,
    _hasTypeFilter
  ].filter(Boolean).length;
  const _viewModeLabels={table:'테이블',card:'카드',podium:'포디움',compact:'컴팩트','tier-group':'티어 그룹'};
  if(!window._tierViewMode) window._tierViewMode = (()=>{try{return localStorage.getItem('su_tier_view_mode')||'table';}catch(e){return 'table';}})();
  const _viewLabel=_viewModeLabels[window._tierViewMode||'table']||'테이블';

  // ── 1행: 필터(좌측) + 보기 모드 + (우측) 티어표 ──
  let fh=`<div class="tier-toolbar-card"><div class="tier-filter-shell"><div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">`;
  fh+=`<div class="fbar" style="flex:1 1 420px;min-width:0;overflow-x:auto;flex-wrap:nowrap;-webkit-overflow-scrolling:touch;scrollbar-width:none;gap:4px">`;
  fh+=`<button class="pill ${window._tierFilterOpen||_activeFilters>0?'on':''}" style="flex-shrink:0;white-space:nowrap" onclick="window._tierFilterOpen=!window._tierFilterOpen;render()">🔍 필터${_activeFilters>0?` (${_activeFilters})`:''} ${window._tierFilterOpen?'▲':'▼'}</button>`;
  modes.forEach(m=>{
    const on=tierRankMode===m.id&&_curModeNoFilter;
    fh+=`<button class="pill ${on?'on':''}" style="flex-shrink:0;white-space:nowrap" onclick="tierRankMode='${m.id}';window._tierTypeSet=new Set();render()">${m.lbl}</button>`;
  });
  fh+=`</div>`;
  // ── 뷰 전환 버튼 (우측) ──
  const _viewModes=[
    {id:'table',      icon:'📋', title:'테이블'},
    {id:'card',       icon:'🃏', title:'카드그리드'},
    {id:'podium',     icon:'🏆', title:'포디움'},
    {id:'compact',    icon:'📝', title:'컴팩트'},
    {id:'tier-group', icon:'🎖️', title:'티어별 그룹'},
  ];
  if(!window._tierViewMode) window._tierViewMode = (()=>{try{return localStorage.getItem('su_tier_view_mode')||'table';}catch(e){return 'table';}})();
  fh+=`<div style="display:flex;gap:3px;flex-shrink:0;flex-wrap:wrap;justify-content:flex-end">`;
  _viewModes.forEach(vm=>{
    const on=window._tierViewMode===vm.id;
    fh+=`<button class="tier-view-btn ${on?'on':''}" title="${vm.title}" onclick="window._tierViewMode='${vm.id}';try{localStorage.setItem('su_tier_view_mode','${vm.id}');}catch(e){}render()">${vm.icon}</button>`;
  });
  fh+=`</div>`;
  // (요청사항) 티어순위표 하위 메뉴의 '티어표' 버튼 제거
  fh+=`</div>`;

  if(window._tierFilterOpen){
    const _periodBtn = (id, label, from, to)=>{
      const on = (window._tierDatePreset||'all')===id && _tierDateFrom===from && _tierDateTo===to;
      return `<button class="pill ${on?'on':''}" style="flex-shrink:0" onclick="window._tierDatePreset='${id}';window._tierDateFrom='${from}';window._tierDateTo='${to}';render()">${label}</button>`;
    };
    fh+=`<div class="tier-filter-blocks">`;
    fh+=`<section class="tier-filter-block">
      <div class="tier-filter-head">
        <div class="tier-filter-title">기간 필터</div>
        <div class="tier-filter-desc">${_tierDateBadge}</div>
      </div>
      <div class="fbar" style="flex-wrap:wrap;gap:6px;align-items:center">
        ${_periodBtn('all','전체','','')}
        ${_periodBtn('7d','최근 7일',_tierDaysAgo(6),_tierToday)}
        ${_periodBtn('30d','최근 30일',_tierDaysAgo(29),_tierToday)}
        ${_periodBtn('month','이번달',_tierMonthStart,_tierToday)}
        ${_periodBtn('prev-month','지난달',_tierPrevMonthFrom,_tierPrevMonthTo)}
      </div>
      <div class="fbar" style="flex-wrap:wrap;gap:8px;align-items:center">
        <label style="display:inline-flex;align-items:center;gap:6px;font-size:var(--fs-caption);font-weight:700;color:var(--text3);white-space:nowrap">
          <input type="date" value="${_tierDateFrom}" onchange="window._tierDatePreset='custom';window._tierDateFrom=this.value;render()" style="font-size:var(--fs-caption);padding:4px 8px;border:1px solid var(--border2);border-radius:8px">
          <span>~</span>
          <input type="date" value="${_tierDateTo}" onchange="window._tierDatePreset='custom';window._tierDateTo=this.value;render()" style="font-size:var(--fs-caption);padding:4px 8px;border:1px solid var(--border2);border-radius:8px">
        </label>
        <span style="font-size:var(--fs-caption);font-weight:700;color:${_hasDateFilter?'var(--blue)':'var(--text3)'};padding:4px 9px;border-radius:999px;border:1px solid ${_hasDateFilter?'rgba(37,99,235,.25)':'var(--border2)'};background:${_hasDateFilter?'rgba(37,99,235,.08)':'transparent'}">${_tierDateBadge}</span>
        ${_hasDateFilter?`<button class="pill" style="background:#fff1f2;border-color:#fecdd3;color:#dc2626" onclick="window._tierDatePreset='all';window._tierDateFrom='';window._tierDateTo='';render()">기간 초기화</button>`:''}
      </div>
    </section>`;
    fh+=`<section class="tier-filter-block">
      <div class="tier-filter-head">
        <div class="tier-filter-title">기본 필터</div>
        <div class="tier-filter-desc">대학, 티어, 종족, 옵션</div>
      </div>`;
    fh+=`<div class="tier-filter-selectrow">
      <div class="tier-filter-selectbox">
        <label for="tier-univ-select">대학 선택</label>
        <select id="tier-univ-select" onchange="sf(this.value,'${_fTier}')">
          <option value="전체"${_fUniv==='전체'?' selected':''}>전체 대학</option>
          ${allU.map(u=>`<option value="${String(u.name||'').replace(/"/g,'&quot;')}"${_fUniv===u.name?' selected':''}>${u.name}</option>`).join('')}
        </select>
      </div>
      <div class="tier-filter-selectbox">
        <label for="tier-tier-select">티어 선택</label>
        <select id="tier-tier-select" onchange="sf('${_fUniv}',this.value)">
          <option value="전체"${_fTier==='전체'?' selected':''}>전체 티어</option>
          ${_tiers.map(t=>`<option value="${String(t).replace(/"/g,'&quot;')}"${_fTier===t?' selected':''}>${getTierPillLabel(t)}</option>`).join('')}
        </select>
      </div>
    </div>`;
    // ── 2행: 대학 (스크롤) ──
    fh+=`<div class="tier-filter-sub">대학</div>`;
    fh+=`<div class="fbar tier-filter-chiprow">`;
    fh+=`<button class="pill ${_fUniv==='전체'?'on':''}" style="flex-shrink:0" onclick="sf('전체','${_fTier}')">전체</button>`;
    allU.forEach(u=>{fh+=`<button class="pill ${_fUniv===u.name?'on':''}" style="flex-shrink:0;${_fUniv===u.name?`background:${u.color};border-color:${u.color};color:#fff`:''}" onclick="sf('${u.name}','${_fTier}')">${u.name}</button>`;});
    fh+=`</div>`;
    // ── 3행: 티어 (스크롤) ──
    fh+=`<div class="tier-filter-sub">티어</div>`;
    fh+=`<div class="fbar tier-filter-chiprow">`;
    fh+=`<button class="pill ${_fTier==='전체'?'on':''}" style="flex-shrink:0" onclick="sf('${_fUniv}','전체')">전체</button>`;
    _tiers.forEach(t=>{
      const _bc=getTierBtnColor(t),_bt=getTierBtnTextColor(t),_sel=_fTier===t;
      fh+=`<button class="pill" style="flex-shrink:0;border-color:${_bc};border-width:${_sel?'2':'1'}px;${_sel?`background:${_bc};color:${_bt};font-weight:700;`:'color:'+_bc+';'}" onclick="sf('${_fUniv}','${t}')">${getTierPillLabel(t)}</button>`;
    });
    fh+=`</div>`;
    // ── 4행: 종족 + 옵션 (flex-wrap) ──
    fh+=`<div class="tier-filter-sub">종족</div>`;
    fh+=`<div class="fbar" style="flex-wrap:wrap;gap:6px">`;
    ['전체','T','Z','P'].forEach(r=>{
      fh+=`<button class="pill ${window._tierRaceFilter===r?'on':''}" onclick="window._tierRaceFilter='${r}';render()">${r==='전체'?'전체':r}</button>`;
    });
    fh+=`</div>`;
    fh+=`<div class="tier-filter-sub">옵션</div>`;
    fh+=`<div class="tier-filter-option-row">
      <button class="tier-toggle-pill ${window._tierHideNoRecord?'on':''}" onclick="window._tierHideNoRecord=!window._tierHideNoRecord;render()">전적없는 스트리머 숨김</button>
      <button class="tier-toggle-pill ${window._tierExcludeMale?'on':''}" onclick="window._tierExcludeMale=!window._tierExcludeMale;render()">남자 제외</button>
    </div></section>`;

  // ── 3행: 유형별 필터 ──
  const _typeCount=window._tierTypeSet?window._tierTypeSet.size:0;
  const _toggleBtnLabel=window._tierTypeFilterOpen?'▲ 접기':`▼ 선택${_typeCount>0?` (${_typeCount})`:''}`;
  const _toggleBtnStyle=_typeCount>0&&!window._tierTypeFilterOpen
    ?'padding:3px 10px;border-radius:12px;border:2px solid var(--blue);background:var(--blue);font-size:var(--fs-caption);cursor:pointer;color:#fff;font-weight:700'
    :'padding:3px 10px;border-radius:12px;border:1px solid var(--border2);background:var(--surface);font-size:var(--fs-caption);cursor:pointer;color:var(--text3)';
  fh+=`<section class="tier-filter-block is-full">
    <div class="tier-filter-head">
      <div class="tier-filter-title">유형 필터</div>
      <div class="tier-filter-desc">승/패 종류별 세부 선택</div>
    </div>
    <div class="fbar" style="gap:6px;flex-wrap:wrap;align-items:center">
    <button class="pill ${!_hasTypeFilter?'on':''}" onclick="window._tierTypeSet=new Set();window._tierTypeFilterOpen=false;render()">전체</button>`;
  fh+=`<div class="tier-type-preset-row">`;
  _typePresets.forEach(p=>{
    const _on = _isSameTypePreset(p.ids);
    fh+=`<button class="pill ${_on?'on':''}" onclick="window._tierTypeSet=new Set(${JSON.stringify(p.ids)});window._tierTypeFilterOpen=true;render()">${p.title}</button>`;
  });
  fh+=`</div>`;
  if(_hasTypeFilter){
    fh+=`<div class="tier-type-selected">`;
    [...window._tierTypeSet].forEach(id=>{
      const mb=modeSortBtns.find(m=>m.id===id);
      if(mb) fh+=`<button class="pill on" style="background:${mb.color};border-color:${mb.color};color:#fff" onclick="window._tierTypeSet.delete('${id}');render()">${mb.lbl} ✕</button>`;
    });
    fh+=`</div>`;
  }
  fh+=`<button onclick="window._tierTypeFilterOpen=!window._tierTypeFilterOpen;render()" style="${_toggleBtnStyle}">${_toggleBtnLabel}</button>`;
  if(window._tierTypeFilterOpen){
    fh+=`<div class="tier-type-grid">`;
    _typeGroups.forEach(g=>{
      const _items = g.ids.map(id=>modeSortBtns.find(m=>m.id===id)).filter(Boolean);
      const _selCount = _items.filter(m=>window._tierTypeSet&&window._tierTypeSet.has(m.id)).length;
      fh+=`<div class="tier-type-group">
        <div class="tier-type-group-head">
          <div class="tier-type-group-title">${g.title}</div>
          <div class="tier-type-group-count">${_selCount}/${_items.length}</div>
        </div>
        <div class="fbar" style="gap:5px;flex-wrap:wrap">`;
      _items.forEach(m=>{
        if(!window._tierTypeSet)window._tierTypeSet=new Set();
        const on=window._tierTypeSet.has(m.id);
        fh+=`<button class="pill ${on?'on':''}" style="${on?`background:${m.color};border-color:${m.color};color:#fff`:''}" onclick="if(!window._tierTypeSet)window._tierTypeSet=new Set();window._tierTypeSet.has('${m.id}')?window._tierTypeSet.delete('${m.id}'):window._tierTypeSet.add('${m.id}');render()">${m.lbl}</button>`;
      });
      fh+=`</div></div>`;
    });
    fh+=`</div>`;
  }
  fh+=`</div></section></div>`;
  } // end filter open block
  if(_activeFilters>0){
    const _summaryChips = [];
    if(_hasDateFilter) _summaryChips.push({ cls:'is-date', txt:`기간 ${_tierDateBadge}`, onclick:`window._tierDatePreset='all';window._tierDateFrom='';window._tierDateTo='';render()` });
    if(_fUniv!=='전체') _summaryChips.push({ cls:'is-univ', txt:`대학 ${_fUniv}`, onclick:`sf('전체','${_fTier}');` });
    if(_fTier!=='전체') _summaryChips.push({ cls:'is-tier', txt:`티어 ${getTierPillLabel(_fTier)}`, onclick:`sf('${_fUniv}','전체');` });
    if(window._tierRaceFilter!=='전체') _summaryChips.push({ cls:'is-race', txt:`종족 ${window._tierRaceFilter}`, onclick:`window._tierRaceFilter='전체';render()` });
    if(window._tierHideNoRecord) _summaryChips.push({ cls:'is-option', txt:'전적없음 숨김', onclick:`window._tierHideNoRecord=false;render()` });
    if(window._tierExcludeMale) _summaryChips.push({ cls:'is-option', txt:'남자 제외', onclick:`window._tierExcludeMale=false;render()` });
    if(_hasTypeFilter){
      const _typeLabels = [...window._tierTypeSet]
        .map(id => modeSortBtns.find(m=>m.id===id)?.lbl)
        .filter(Boolean);
      if(_typeLabels.length) _summaryChips.push({ cls:'is-type', txt:`유형 ${_typeLabels.join(', ')}`, onclick:`window._tierTypeSet=new Set();window._tierTypeFilterOpen=false;render()` });
    }
    fh+=`<div class="fbar" style="gap:6px;flex-wrap:wrap;align-items:center;padding-top:2px">
      ${_summaryChips.map(x=>`<span class="tier-chip-soft ${x.cls||''}">${x.txt}<button type="button" onclick="${x.onclick}" title="해제">×</button></span>`).join('')}
      <button class="pill" style="padding:4px 10px;font-size:var(--fs-caption);background:#fff1f2;border-color:#fecdd3;color:#dc2626" onclick="sf('전체','전체');window._tierDatePreset='all';window._tierDateFrom='';window._tierDateTo='';window._tierRaceFilter='전체';window._tierHideNoRecord=false;window._tierExcludeMale=false;window._tierTypeSet=new Set();window._tierTypeFilterOpen=false;render()">전체 초기화</button>
    </div>`;
  }
  fh+=`</div></div>`;
  if(F) F.innerHTML='';

  if(false&&tierRankMode==='recent'){
    // 최근 경기 내역 (버튼 삭제됨 - 사용 안 함)
    const recentGames=[];
    function extractGames(matchList,label){
      matchList.forEach(m=>{
        (m.sets||[]).forEach(set=>{
          (set.games||[]).forEach(g=>{
            if(!g.playerA||!g.playerB||!g.winner)return;
            const wn=g.winner==='A'?g.playerA:g.playerB;
            const ln=g.winner==='A'?g.playerB:g.playerA;
            recentGames.push({date:m.d||'',winner:wn,loser:ln,map:g.map||'-',label:label||''});
          });
        });
      });
    }
    extractGames(miniM,'미니대전');
    extractGames(univM,'대학대전');
    extractGames(comps,'대회');
    extractGames(ckM,'대학CK');
    extractGames(proM,'프로리그');
    // 조별리그 대회 경기 포함
    const tourItems=typeof getTourneyMatches==='function'?getTourneyMatches():[];
    extractGames(tourItems,'조별대회');
    // 티어대회 포함
    if(ttM&&ttM.length) extractGames(ttM,'티어대회');
    // 개인전/끝장전 포함 (구조 다름: wName/lName 직접 필드)
    (indM||[]).forEach(m=>{
      recentGames.push({date:m.d||'',winner:m.wName,loser:m.lName,map:m.map||'-',label:'개인전'});
    });
    (gjM||[]).forEach(m=>{
      recentGames.push({date:m.d||'',winner:m.wName,loser:m.lName,map:m.map||'-',label:m._proLabel?'프로끝장전':'끝장전'});
    });
    recentGames.sort((a,b)=>b.date.localeCompare(a.date));

    // 종족 필터 상태
    if(!window._recentRaceFilter) window._recentRaceFilter='전체';
    // 티어 필터 상태
    if(!window._recentTierFilter) window._recentTierFilter='전체';

    let filtered=recentGames;
    if(window._recentRaceFilter!=='전체'){
      filtered=filtered.filter(g=>{
        const wp=players.find(p=>p.name===g.winner);
        const lp=players.find(p=>p.name===g.loser);
        return (wp&&wp.race===window._recentRaceFilter)||(lp&&lp.race===window._recentRaceFilter);
      });
    }
    if(window._recentTierFilter!=='전체'){
      filtered=filtered.filter(g=>{
        const wp=players.find(p=>p.name===g.winner);
        const lp=players.find(p=>p.name===g.loser);
        return (wp&&wp.tier===window._recentTierFilter)||(lp&&lp.tier===window._recentTierFilter);
      });
    }

    let fh=`<div class="fbar">`;
    ['전체','T','Z','P'].forEach(r=>{
      fh+=`<button class="pill ${window._recentRaceFilter===r?'on':''}" onclick="window._recentRaceFilter='${r}';render()">${r==='전체'?'전체':r}</button>`;
    });
    fh+=`<button class="pill ${window._recentTierFilter==='전체'?'on':''}" style="margin-left:8px" onclick="window._recentTierFilter='전체';render()">전체</button>`;
    TIERS.forEach(t=>{
    const _bc=getTierBtnColor(t),_bt=getTierBtnTextColor(t),_sel=window._recentTierFilter===t;
    fh+=`<button class="pill" style="border-color:${_bc};border-width:${_sel?'2':'1'}px;${_sel?`background:${_bc};color:${_bt};font-weight:700;`:'color:'+_bc+';'}" onmouseover="if(!${_sel})this.style.background='${_bc}22'" onmouseout="if(!${_sel})this.style.background=''" onclick="window._recentTierFilter='${t}';render()">${getTierPillLabel(t)}</button>`;
  });
    fh+=`</div>`;
    F.innerHTML+=fh;

    let h=`<div style="font-size:var(--fs-caption);color:var(--gray-l);margin-bottom:8px">총 ${filtered.length}건</div>`;
    h+=`<table><thead><tr><th>날짜</th><th>종류</th><th>승자</th><th>패자</th><th>맵</th></tr></thead><tbody>`;
    if(!filtered.length)h+=`<tr><td colspan="5" style="padding:30px;color:var(--gray-l);text-align:center">경기 기록 없음</td></tr>`;
    const pageSize=100;
    if(window._recentPage===undefined) window._recentPage=0;
    const totalPages=Math.max(1,Math.ceil(filtered.length/pageSize));
    if(window._recentPage>=totalPages) window._recentPage=totalPages-1;
    const paged=filtered.slice(window._recentPage*pageSize,(window._recentPage+1)*pageSize);
    if(filtered.length>pageSize){
      h+=`<tr><td colspan="5" style="padding:10px 0">
        <div style="display:flex;align-items:center;justify-content:center;gap:8px">
          <button class="btn btn-w btn-xs" onclick="window._recentPage=Math.max(0,(window._recentPage||0)-1);render()" ${window._recentPage<=0?'disabled':''}>이전</button>
          <span style="font-size:var(--fs-caption);color:var(--gray-l)">${(window._recentPage||0)+1} / ${totalPages}</span>
          <button class="btn btn-w btn-xs" onclick="window._recentPage=Math.min(${totalPages-1},(window._recentPage||0)+1);render()" ${window._recentPage>=totalPages-1?'disabled':''}>다음</button>
        </div>
      </td></tr>`;
    }
    paged.forEach(g=>{
      const wp=players.find(p=>p.name===g.winner);const lp=players.find(p=>p.name===g.loser);
      const wc=wp?gc(wp.univ):'#888';const lc=lp?gc(lp.univ):'#888';
      const lblColors={'미니대전':'#2563eb','대학대전':'#7c3aed','대회':'#d97706','대학CK':'#dc2626','프로리그':'#0891b2','조별대회':'#16a34a','티어대회':'#7c3aed'};
      const lblColor=lblColors[g.label]||'#6b7280';
      const wAttr=(typeof escAttr==='function')
        ? escAttr(String(g.winner||'').replace(/[\r\n]+/g,' '))
        : String(g.winner||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/[\r\n]+/g,' ');
      const lAttr=(typeof escAttr==='function')
        ? escAttr(String(g.loser||'').replace(/[\r\n]+/g,' '))
        : String(g.loser||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/[\r\n]+/g,' ');
      h+=`<tr>
        <td style="color:var(--gray-l);font-size:var(--fs-caption)">${g.date}</td>
        <td><span style="background:${lblColor};color:#fff;padding:1px 7px;border-radius:4px;font-size:10px;font-weight:700">${g.label||'-'}</span></td>
        <td><span style="display:inline-flex;align-items:center;gap:5px;font-weight:800" class="wt">
          ${wp?getPlayerPhotoHTML(g.winner,'22px','',{lazy:true}):''}
          <span style="cursor:pointer" data-tp-action="open-player" data-tp-player="${wAttr}">
            ${wp?`<span class="rbadge r${wp.race}" style="font-size:10px;margin-right:2px">${wp.race}</span>`:''}${g.winner}${getStatusIconHTML(g.winner)}</span></span>
          ${wp?`<span class="ubadge" style="background:${wc};font-size:10px;padding:1px 6px;margin-left:4px">${wp.univ}</span>`:''}</td>
        <td><span style="display:inline-flex;align-items:center;gap:5px;opacity:.75">
          ${lp?getPlayerPhotoHTML(g.loser,'22px','',{lazy:true}):''}
          <span style="cursor:pointer" data-tp-action="open-player" data-tp-player="${lAttr}">
            ${lp?`<span class="rbadge r${lp.race}" style="font-size:10px;margin-right:2px">${lp.race}</span>`:''}${g.loser}</span></span>
          ${lp?`<span class="ubadge" style="background:${lc};font-size:10px;padding:1px 6px;margin-left:4px;opacity:.7">${lp.univ}</span>`:''}</td>
        <td style="color:var(--gray-l);font-size:var(--fs-caption)">${g.map}</td>
      </tr>`;
    });
    C.innerHTML=h+`</tbody></table>`;
    return;
  }

  let list=[..._pl]; // 모든 선수 표시 (승패 기록 없어도)
  if(_fUniv!=='전체')list=list.filter(p=>p.univ===_fUniv);
  if(_fTier!=='전체')list=list.filter(p=>_fTier==='미정'?(p.tier==='미정'||!p.tier):p.tier===_fTier);
  // 종족 필터 적용
  if(window._tierRaceFilter&&window._tierRaceFilter!=='전체') list=list.filter(p=>p.race===window._tierRaceFilter);
  // 전적없는 선수 숨기기
  if(window._tierHideNoRecord) list=list.filter(p=>_tierWL(p).tot>0);
  // 남자 제외
  if(window._tierExcludeMale) list=list.filter(p=>p.gender!=='M');

  let _modePStats=null;
  let _typeSum=null; // 다중선택 시 합산 스코어 맵 {name: number}

  // 유형별 다중선택이 활성화된 경우
  if(window._tierTypeSet && window._tierTypeSet.size>0){
    // 각 유형별 데이터 집계 함수
    function _splitTeamNames(v){
      if(Array.isArray(v)){
        return v.map(x => {
          if(x && typeof x === 'object') return String(x.name || '').trim();
          return String(x || '').trim();
        }).filter(Boolean);
      }
      return String(v || '').split(/[,+，]/).map(x=>x.trim()).filter(Boolean);
    }
    function _gameSides(g){
      if(!g || !g.winner) return null;
      if(g.wName && g.lName){
        return { w:_splitTeamNames(g.wName), l:_splitTeamNames(g.lName) };
      }
      const aList = (Array.isArray(g.teamA) && g.teamA.length) ? _splitTeamNames(g.teamA) : ((g.a1 || g.a2) ? [g.a1, g.a2].filter(Boolean) : _splitTeamNames(g.playerA));
      const bList = (Array.isArray(g.teamB) && g.teamB.length) ? _splitTeamNames(g.teamB) : ((g.b1 || g.b2) ? [g.b1, g.b2].filter(Boolean) : _splitTeamNames(g.playerB));
      if(!aList.length || !bList.length) return null;
      return g.winner === 'A' ? { w:aList, l:bList } : { w:bList, l:aList };
    }
    function _addWL(_ps, sides){
      if(!sides) return;
      (sides.w || []).forEach(name => {
        if(!_ps[name]) _ps[name] = { w:0, l:0 };
        _ps[name].w++;
      });
      (sides.l || []).forEach(name => {
        if(!_ps[name]) _ps[name] = { w:0, l:0 };
        _ps[name].l++;
      });
    }
    function _collectPS(arr, useWL){
      const _ps={};
      (arr||[]).forEach(m=>{ if(!_tierInDateRange(m?.d || m?.date || '')) return; (m.sets||[]).forEach(st=>{(st.games||[]).forEach(g=>{
        _addWL(_ps, _gameSides(g));
      });});});
      return _ps;
    }
    function _collectPSFromGames(games){
      const _ps={};
      (games||[]).forEach(g=>{
        if(!_tierInDateRange(g?.d || g?.date || '')) return;
        _addWL(_ps, _gameSides(g));
      });
      return _ps;
    }
    function _collectIndPS(arr){
      const _ps={};
      (arr||[]).forEach(m=>{
        if(!_tierInDateRange(m?.d || m?.date || '')) return;
        if(!m.wName||!m.lName)return;
        if(!_ps[m.wName])_ps[m.wName]={w:0,l:0};if(!_ps[m.lName])_ps[m.lName]={w:0,l:0};
        _ps[m.wName].w++;_ps[m.lName].l++;
      });
      return _ps;
    }
    function _collectCompPS(){
      const _ps={};
      function _cg(g, rawDate){ if(!_tierInDateRange(rawDate)) return; _addWL(_ps, _gameSides(g)); }
      _tourneys.forEach(tn=>{
        (tn.groups||[]).forEach(grp=>{(grp.matches||[]).forEach(m=>{const _rawDate=m?.d || m?.date || tn?.d || tn?.date || ''; (m.sets||[]).forEach(st=>{(st.games||[]).forEach(g=>_cg(g,_rawDate));});});});
        const _br=typeof getBracket==='function'?getBracket(tn):{};
        Object.values(_br.matchDetails||{}).forEach(m=>{const _rawDate=m?.d || m?.date || tn?.d || tn?.date || ''; (m.sets||[]).forEach(st=>{(st.games||[]).forEach(g=>_cg(g,_rawDate));});});
      });
      return _ps;
    }

    const typeDataMap={
      mini_win:()=>_collectPS(_mini),mini_loss:()=>_collectPS(_mini),
      ck_win:()=>_collectPS(_ck),ck_loss:()=>_collectPS(_ck),
      comp_win:()=>_collectCompPS(),comp_loss:()=>_collectCompPS(),
      ind_win:()=>_collectIndPS(_ind),ind_loss:()=>_collectIndPS(_ind),
      gj_win:()=>_collectIndPS(_gj),gj_loss:()=>_collectIndPS(_gj),
      civ_win:()=>_collectPS(_mini.filter(m=>m && (m.type==='civil'||(m.a==='A팀'&&m.b==='B팀')))),
      civ_loss:()=>_collectPS(_mini.filter(m=>m && (m.type==='civil'||(m.a==='A팀'&&m.b==='B팀')))),
      tt_win:()=>_collectPS(_tt),tt_loss:()=>_collectPS(_tt),
      pro_win:()=>_collectPS(_pro),pro_loss:()=>_collectPS(_pro),
      univm_win:()=>_collectPS(_univm),univm_loss:()=>_collectPS(_univm),
    };
    const sumMap={};
    window._tierTypeSet.forEach(modeId=>{
      const isWin=modeId.endsWith('_win');
      const getter=typeDataMap[modeId];
      if(!getter)return;
      const ps=getter();
      Object.keys(ps).forEach(name=>{
        if(!sumMap[name])sumMap[name]=0;
        sumMap[name]+=(isWin?ps[name].w:ps[name].l);
      });
    });
    _typeSum=sumMap;
    list.sort((a,b)=>(sumMap[b.name]||0)-(sumMap[a.name]||0));
  }
  else if(tierRankMode==='tier'){
    const _ti=t=>{ const i=TIERS.indexOf(t||'미정'); return i<0?TIERS.length:i; };
    list.sort((a,b)=>{
      const sa=_tierWL(a), sb=_tierWL(b);
      return _ti(a.tier)-_ti(b.tier) || sb.points-sa.points || sb.w-sa.w || sa.l-sb.l;
    });
  }
  else if(tierRankMode==='wins') list.sort((a,b)=>{const sa=_tierWL(a), sb=_tierWL(b); return sb.w-sa.w||sa.l-sb.l;});
  else if(tierRankMode==='winrate'){
    list=list.filter(p=>_tierWL(p).tot>=1);
    list.sort((a,b)=>{const sa=_tierWL(a), sb=_tierWL(b); const ra=sa.tot?sa.w/sa.tot:0; const rb=sb.tot?sb.w/sb.tot:0; return rb-ra||sb.w-sa.w;});
  }
  else if(tierRankMode==='winstreak'){
    // 승차: 승수 - 패수 (많을수록 상위)
    list.sort((a,b)=>{const sa=_tierWL(a), sb=_tierWL(b); return (sb.w-sb.l)-(sa.w-sa.l)||sb.w-sa.w;});
  }
  else if(tierRankMode==='revstreak'){
    // 역승차: 패수 - 승수 (많을수록 상위, 즉 승차 낮은 순)
    list.sort((a,b)=>{const sa=_tierWL(a), sb=_tierWL(b); return (sb.l-sb.w)-(sa.l-sa.w)||sb.l-sa.l;});
  }
  else if(tierRankMode==='elo'){
    list.sort((a,b)=>{
      if(_hasDateFilter){
        const sa=_tierWL(a), sb=_tierWL(b);
        return sb.eloDelta-sa.eloDelta || sb.w-sa.w || sa.l-sb.l;
      }
      return (b.elo||ELO_DEFAULT)-(a.elo||ELO_DEFAULT);
    });
  }
  else if(tierRankMode==='mini_win'||tierRankMode==='mini_loss'){
    const _ps={};
    _mini.forEach(m=>{(m.sets||[]).forEach(st=>{(st.games||[]).forEach(g=>{
      const _splitTeamNames = v => Array.isArray(v) ? v.map(x => x && typeof x === 'object' ? String(x.name || '').trim() : String(x || '').trim()).filter(Boolean) : String(v || '').split(/[,+，]/).map(x=>x.trim()).filter(Boolean);
      const aList = (Array.isArray(g.teamA) && g.teamA.length) ? _splitTeamNames(g.teamA) : ((g.a1 || g.a2) ? [g.a1, g.a2].filter(Boolean) : _splitTeamNames(g.playerA));
      const bList = (Array.isArray(g.teamB) && g.teamB.length) ? _splitTeamNames(g.teamB) : ((g.b1 || g.b2) ? [g.b1, g.b2].filter(Boolean) : _splitTeamNames(g.playerB));
      const sides = g.wName && g.lName
        ? { w:_splitTeamNames(g.wName), l:_splitTeamNames(g.lName) }
        : (!g.winner || !aList.length || !bList.length) ? null : (g.winner==='A' ? { w:aList, l:bList } : { w:bList, l:aList });
      if(!sides) return;
      (sides.w||[]).forEach(name=>{ if(!_ps[name]) _ps[name]={w:0,l:0}; _ps[name].w++; });
      (sides.l||[]).forEach(name=>{ if(!_ps[name]) _ps[name]={w:0,l:0}; _ps[name].l++; });
    });});});
    _modePStats=_ps;
    list.sort((a,b)=>tierRankMode==='mini_win'?(_ps[b.name]?.w||0)-(_ps[a.name]?.w||0):(_ps[b.name]?.l||0)-(_ps[a.name]?.l||0));
  }
  else if(tierRankMode==='ck_win'||tierRankMode==='ck_loss'){
    const _ps={};
    _ck.forEach(m=>{(m.sets||[]).forEach(st=>{(st.games||[]).forEach(g=>{
      const _splitTeamNames = v => Array.isArray(v) ? v.map(x => x && typeof x === 'object' ? String(x.name || '').trim() : String(x || '').trim()).filter(Boolean) : String(v || '').split(/[,+，]/).map(x=>x.trim()).filter(Boolean);
      const aList = (Array.isArray(g.teamA) && g.teamA.length) ? _splitTeamNames(g.teamA) : ((g.a1 || g.a2) ? [g.a1, g.a2].filter(Boolean) : _splitTeamNames(g.playerA));
      const bList = (Array.isArray(g.teamB) && g.teamB.length) ? _splitTeamNames(g.teamB) : ((g.b1 || g.b2) ? [g.b1, g.b2].filter(Boolean) : _splitTeamNames(g.playerB));
      if(!g.winner || !aList.length || !bList.length) return;
      const sides = g.winner==='A' ? { w:aList, l:bList } : { w:bList, l:aList };
      (sides.w||[]).forEach(name=>{ if(!_ps[name]) _ps[name]={w:0,l:0}; _ps[name].w++; });
      (sides.l||[]).forEach(name=>{ if(!_ps[name]) _ps[name]={w:0,l:0}; _ps[name].l++; });
    });});});
    _modePStats=_ps;
    list.sort((a,b)=>tierRankMode==='ck_win'?(_ps[b.name]?.w||0)-(_ps[a.name]?.w||0):(_ps[b.name]?.l||0)-(_ps[a.name]?.l||0));
  }
  else if(tierRankMode==='comp_win'||tierRankMode==='comp_loss'){
    const _ps={};
    function _cntGame(g){
      const _splitTeamNames = v => Array.isArray(v) ? v.map(x => x && typeof x === 'object' ? String(x.name || '').trim() : String(x || '').trim()).filter(Boolean) : String(v || '').split(/[,+，]/).map(x=>x.trim()).filter(Boolean);
      const aList = (Array.isArray(g.teamA) && g.teamA.length) ? _splitTeamNames(g.teamA) : ((g.a1 || g.a2) ? [g.a1, g.a2].filter(Boolean) : _splitTeamNames(g.playerA));
      const bList = (Array.isArray(g.teamB) && g.teamB.length) ? _splitTeamNames(g.teamB) : ((g.b1 || g.b2) ? [g.b1, g.b2].filter(Boolean) : _splitTeamNames(g.playerB));
      if(!g.winner || !aList.length || !bList.length) return;
      const sides = g.winner==='A' ? { w:aList, l:bList } : { w:bList, l:aList };
      (sides.w||[]).forEach(name=>{ if(!_ps[name]) _ps[name]={w:0,l:0}; _ps[name].w++; });
      (sides.l||[]).forEach(name=>{ if(!_ps[name]) _ps[name]={w:0,l:0}; _ps[name].l++; });
    }
    _tourneys.forEach(tn=>{
      (tn.groups||[]).forEach(grp=>{(grp.matches||[]).forEach(m=>{(m.sets||[]).forEach(st=>{(st.games||[]).forEach(_cntGame);});});});
      const _br=typeof getBracket==='function'?getBracket(tn):{};
      Object.values(_br.matchDetails||{}).forEach(m=>{(m.sets||[]).forEach(st=>{(st.games||[]).forEach(_cntGame);});});
    });
    _modePStats=_ps;
    list.sort((a,b)=>tierRankMode==='comp_win'?(_ps[b.name]?.w||0)-(_ps[a.name]?.w||0):(_ps[b.name]?.l||0)-(_ps[a.name]?.l||0));
  }

  const modeHeaders={
    tier:_hasDateFilter?'기간 포인트':'포인트',wins:'승',winrate:'승률',winstreak:'승차',revstreak:'역승차',
    mini_win:'미니승',mini_loss:'미니패',ck_win:'CK승',ck_loss:'CK패',comp_win:'대회승',comp_loss:'대회패',
    ind_win:'개인전승',ind_loss:'개인전패',gj_win:'끝장전승',gj_loss:'끝장전패',
    civ_win:'시빌워승',civ_loss:'시빌워패',tt_win:'티어대회승',tt_loss:'티어대회패',
    pro_win:'프로리그승',pro_loss:'프로리그패',univm_win:'대학대전승',univm_loss:'대학대전패',
    elo:_hasDateFilter?'ELO 변동':'ELO'
  };
  const hasTypeSet=window._tierTypeSet&&window._tierTypeSet.size>0;
  const extraHeader=hasTypeSet?(window._tierTypeSet.size===1?modeHeaders[[...window._tierTypeSet][0]]||'합산':'합산'):modeHeaders[tierRankMode]||'포인트';

  // ── 뷰별 렌더링 ──
  const _li = (typeof isLoggedIn!=='undefined' ? !!isLoggedIn : false) || !!window.isLoggedIn;
  const _isMb = (typeof window !== 'undefined' && window.innerWidth <= 768);
  const _pad = _isMb ? '6px 8px' : '8px 10px';
  const _padName = _isMb ? '6px 10px' : '8px 12px';
  const _today2=new Date().toISOString().slice(0,10);
  const _30ago2=new Date(Date.now()-30*24*60*60*1000).toISOString().slice(0,10);
  const _7ago2=new Date(Date.now()-7*24*60*60*1000).toISOString().slice(0,10);
  const _univColorCache = new Map();
  const _univBgCache = new Map();
  const _tierBadgeCache = new Map();
  const _statusIconCache = new Map();
  const _getUnivColor = (univ)=>{
    const k = String(univ||'');
    if(_univColorCache.has(k)) return _univColorCache.get(k);
    let c = '#64748b';
    try{ c = gc(k) || '#64748b'; }catch(e){}
    _univColorCache.set(k, c);
    return c;
  };
  const _getUnivBg = (univ, alpha)=>{
    const k = `${String(univ||'')}|${alpha}`;
    if(_univBgCache.has(k)) return _univBgCache.get(k);
    let v = 'transparent';
    try{ v = gcHex8(univ, alpha); }catch(e){}
    _univBgCache.set(k, v);
    return v;
  };
  const _getTierBadge = (tier)=>{
    const k = String(tier||'');
    if(_tierBadgeCache.has(k)) return _tierBadgeCache.get(k);
    let v = '';
    try{ v = getTierBadge(tier); }catch(e){ v = ''; }
    _tierBadgeCache.set(k, v);
    return v;
  };
  const _getStatusIcon = (name)=>{
    const k = String(name||'');
    if(_statusIconCache.has(k)) return _statusIconCache.get(k);
    let v = '';
    try{ v = getStatusIconHTML(k); }catch(e){ v = ''; }
    _statusIconCache.set(k, v);
    return v;
  };
  const _canGoHist = (()=>{
    const pick = hasTypeSet && window._tierTypeSet.size===1 ? [...window._tierTypeSet][0] : (!hasTypeSet ? tierRankMode : '');
    return pick && pick.endsWith('_win') || pick && pick.endsWith('_loss');
  })();

  // 공통 헬퍼
  function _getExtraVal(p){
    const rec=_tierWL(p); const tot=rec.tot; const wr=rec.wr;
    if(_typeSum!==null){const sv=_typeSum[p.name]||0;return`<span style="font-weight:800;color:${sv>0?'#16a34a':sv<0?'#dc2626':'var(--gray-l)'}">${sv}</span>`;}
    if(tierRankMode==='tier'){
      if(_hasDateFilter){
        const v=rec.points;
        return`<span style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:14px;color:${v>0?'var(--green)':v<0?'var(--red)':'var(--gray-l)'}">${v>0?'+':''}${v}</span>`;
      }
      return`<span class="${pC(p.points)}" style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:14px">${pS(p.points)}</span>`;
    }
    if(tierRankMode==='wins') return`<span class="wt" style="font-size:var(--fs-md);font-weight:800">${rec.w}</span>`;
    if(tierRankMode==='winrate') return`<span style="font-weight:700;color:${wr>=50?'var(--green)':'var(--red)'}">${tot?wr+'%':'-'}</span>`;
    if(tierRankMode==='winstreak'){const d=rec.w-rec.l;return`<span style="font-weight:800;color:${d>0?'var(--green)':d<0?'var(--red)':'var(--gray-l)'}">${d>0?'+':''}${d}</span>`;}
    if(tierRankMode==='revstreak'){const d=rec.l-rec.w;return`<span style="font-weight:800;color:${d>0?'var(--red)':d<0?'var(--green)':'var(--gray-l)'}">${d>0?'+':''}${d}</span>`;}
    if(tierRankMode==='elo'){
      if(_hasDateFilter){
        const d=rec.eloDelta;
        return`<span style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:14px;color:${d>0?'var(--green)':d<0?'var(--red)':'var(--gray-l)'}">${d>0?'+':''}${d}</span>`;
      }
      const e=p.elo||ELO_DEFAULT;return`<span style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:14px;color:${e>=1400?'#7c3aed':e>=1300?'var(--gold)':e>=1200?'var(--green)':'var(--red)'}">${e}</span>`;
    }
    if(['mini_win','mini_loss','ck_win','ck_loss','comp_win','comp_loss','ind_win','ind_loss','gj_win','gj_loss','civ_win','civ_loss','tt_win','tt_loss','pro_win','pro_loss','univm_win','univm_loss'].includes(tierRankMode)){
      const _v=_modePStats?_modePStats[p.name]:null; const isWin=tierRankMode.endsWith('_win'); const cnt=_v?(isWin?_v.w:_v.l):0;
      return`<span style="font-weight:800;color:${isWin?'#16a34a':'#dc2626'}">${cnt}</span>`;
    }
    return '';
  }
  function _getActHTML(p){
    const _lastD=_tierWL(p).lastD;
    if(!_lastD) return '';
    if(_lastD>=_7ago2) return`<span class="tier-act-dot hot" title="7일 이내 활동">LIVE</span>`;
    if(_lastD>=_30ago2) return`<span class="tier-act-dot warm" title="30일 이내 활동">WARM</span>`;
    return '';
  }

  const _univIconUrlCache = (()=>{
    const m = new Map();
    try{
      if(typeof UNIV_ICONS!=='undefined' && UNIV_ICONS){
        for(const k in UNIV_ICONS){
          if(!k) continue;
          const v = UNIV_ICONS[k];
          if(v) m.set(k, v);
        }
      }
    }catch(e){}
    try{
      (typeof univCfg!=='undefined' && Array.isArray(univCfg) ? univCfg : []).forEach(u=>{
        if(!u || !u.name || !u.icon) return;
        if(!m.has(u.name)) m.set(u.name, u.icon);
      });
    }catch(e){}
    return m;
  })();
  function _getUnivIconHTML(p){
    const url=_univIconUrlCache.get(p.univ)||'';
    return url?`<img src="${toHttpsUrl(url)}" style="width:22px;height:22px;object-fit:contain;border-radius:var(--su_univ_logo_radius,6px);flex-shrink:0" onerror="this.style.display='none'">`:``; 
  }

  const _vm = window._tierViewMode || 'table';
  let h='';

  // ════════════════════════════════════════════
  // 뷰1: TABLE (기존)
  // ════════════════════════════════════════════
  if(_vm==='table'){
  const _wrapStyle = `overflow-x:auto;-webkit-overflow-scrolling:touch;width:100%`;
  const _tableStyle = _isMb
    ? `table-layout:auto;width:max-content;max-width:100%`
    : `table-layout:auto;width:100%;min-width:1120px;max-width:1600px;margin:0 auto`;
  h=`<div class="tier-content-card"><div class="tier-table-wrap" style="${_wrapStyle}">
    <table class="tier-table" style="${_tableStyle}"><thead><tr>
      <th style="text-align:center;white-space:nowrap;padding:${_pad}">순위</th>
      <th style="text-align:center;white-space:nowrap;padding:${_pad}">티어</th>
      <th style="text-align:center;white-space:nowrap;padding:${_pad}">대학</th>
      <th style="text-align:center;white-space:nowrap;padding:${_pad}">종족</th>
      <th style="text-align:left;white-space:nowrap;padding:${_padName}">이름</th>
      <th style="text-align:center;white-space:nowrap;padding:${_pad}">승</th>
      <th style="text-align:center;white-space:nowrap;padding:${_pad}">패</th>
      <th style="text-align:center;white-space:nowrap;padding:${_pad}">승률</th>
      <th style="text-align:center;white-space:nowrap;padding:${_pad}">${extraHeader}</th>
      <th class="col-hide-mobile" style="text-align:center;white-space:nowrap;padding:${_pad}">${_hasDateFilter?'현재 ELO':'ELO'}</th>
      <th class="col-hide-mobile" style="text-align:center;white-space:nowrap;padding:${_pad}">활동</th>
      ${_li?`<th class="no-export col-hide-mobile" style="text-align:center;white-space:nowrap;padding:${_pad}">관리</th>`:''}
    </tr></thead><tbody>`;
  list.forEach((p,i)=>{
    const rec=_tierWL(p); const col=_getUnivColor(p.univ); const tot=rec.tot; const wr=rec.wr;
    let rnkHTML;
    if(i===0) rnkHTML=`<span class="tier-rank-chip gold">1등</span>`;
    else if(i===1) rnkHTML=`<span class="tier-rank-chip silver">2등</span>`;
    else if(i===2) rnkHTML=`<span class="tier-rank-chip bronze">3등</span>`;
    else rnkHTML=`<span style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:var(--fs-base)">${i+1}위</span>`;
    const extraVal=_getExtraVal(p);
    const univIconHTML=_getUnivIconHTML(p);
    const _pSafe=(typeof escJS==='function') ? escJS(p.name) : (p.name||'').replace(/\\/g,'\\\\').replace(/'/g,"\\'").replace(/\r/g,'\\r').replace(/\n/g,'\\n');
    const _pAttr=(typeof escAttr==='function')
      ? escAttr(String(p.name||'').replace(/[\r\n]+/g,' '))
      : String(p.name||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/[\r\n]+/g,' ');
    const _modePick = hasTypeSet && window._tierTypeSet.size===1 ? [...window._tierTypeSet][0] : (!hasTypeSet ? tierRankMode : '');
    const _clickHist = (_canGoHist && _modePick) ? `onclick="tierRankGoHist('${_modePick}','${_pSafe}')"` : '';
    const _actHTML=_getActHTML(p);
    const _elo = (p.elo||ELO_DEFAULT);
    h+=`<tr class="${i===0?'top1':i===1?'top2':i===2?'top3':''}" style="border-left:3px solid ${col};background:${_getUnivBg(p.univ,.06)}">
      <td style="text-align:center;white-space:nowrap;padding:${_pad}">${rnkHTML}</td>
      <td style="text-align:center;white-space:nowrap;padding:${_pad}">${_getTierBadge(p.tier)}</td>
      <td style="text-align:center;white-space:nowrap;padding:${_pad}">
        <span class="ubadge tier-univ-badge clickable-univ" data-icon-done="1"
          style="background:${col};font-size:${_isMb?11:13}px;max-width:${_isMb?90:120}px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap"
          onclick="openUnivModal('${p.univ}')"
        >${univIconHTML}${p.univ}</span>
      </td>
      <td style="text-align:center;white-space:nowrap;padding:${_pad}"><span class="rbadge r${p.race}">${p.race}</span></td>
      <td style="text-align:left;white-space:nowrap;padding:${_padName};font-weight:700;min-width:0">
        <span style="display:inline-flex;align-items:center;gap:6px;min-width:0;max-width:${_isMb?170:260}px">
          ${getPlayerPhotoHTML(p.name,_isMb?'34px':'40px','',{lazy:true})}
          <span class="clickable-name" style="min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;cursor:pointer" data-tp-action="open-player" data-tp-player="${_pAttr}">${p.name}</span>
          <span style="flex-shrink:0">${genderIcon(p.gender)}${_getStatusIcon(p.name)}</span>
        </span>
      </td>
      <td style="text-align:center;white-space:nowrap;padding:${_pad};font-weight:900;color:var(--score-win)">${rec.w}</td>
      <td style="text-align:center;white-space:nowrap;padding:${_pad};font-weight:900;color:var(--score-lose)">${rec.l}</td>
      <td style="text-align:center;white-space:nowrap;padding:${_pad};font-weight:800;color:${tot===0?'var(--gray-l)':wr>=50?'var(--green)':'var(--red)'}">${tot?wr+'%':'-'}</td>
      <td style="text-align:center;white-space:nowrap;padding:${_pad};${_canGoHist?'cursor:pointer;text-decoration:underline dotted':''}" ${_clickHist} title="${_canGoHist?'대전기록탭에서 보기':''}">${extraVal}</td>
      <td class="col-hide-mobile" style="text-align:center;white-space:nowrap;padding:${_pad};font-weight:800;color:${_elo>=ELO_DEFAULT?'#2563eb':'#dc2626'}">${_elo}</td>
      <td class="col-hide-mobile" style="text-align:center;white-space:nowrap;padding:${_pad}">${_actHTML}</td>
      ${_li?`<td class="no-export col-hide-mobile" style="text-align:center;white-space:nowrap;padding:${_pad}">${adminBtn(`<button class="btn btn-w btn-xs" onclick="openEPFromModal('${_pSafe}')">✏️ 수정</button>`)}</td>`:''}
    </tr>`;
  });
  h+=`</tbody></table></div></div>`;
  }

  // ════════════════════════════════════════════
  // 뷰2: CARD GRID (카드 그리드)
  // ════════════════════════════════════════════
  else if(_vm==='card'){
  h=`<div class="tier-content-card"><div class="tier-card-grid" style="grid-template-columns:repeat(auto-fill,minmax(${_isMb?'150px':'190px'},1fr));gap:${_isMb?'10px':'12px'}">`;
  list.forEach((p,i)=>{
    const rec=_tierWL(p); const col=_getUnivColor(p.univ); const tot=rec.tot; const wr=rec.wr;
    const _pSafe=(typeof escJS==='function') ? escJS(p.name) : (p.name||'').replace(/\\/g,'\\\\').replace(/'/g,"\\'").replace(/\r/g,'\\r').replace(/\n/g,'\\n');
    const _pAttr=(typeof escAttr==='function')
      ? escAttr(String(p.name||'').replace(/[\r\n]+/g,' '))
      : String(p.name||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/[\r\n]+/g,' ');
    const univIconHTML=_getUnivIconHTML(p);
    const extraVal=_getExtraVal(p);
    const metricLabel=_typeSum!==null?'유형 합계':(modeHeaders[tierRankMode]||'포인트');
    const elo=(p.elo||ELO_DEFAULT);
    const photoMap=(window.playerPhotos&&typeof window.playerPhotos==='object')?window.playerPhotos:{};
    const photoSrcRaw=(typeof p.photo==='string'&&p.photo.trim())?p.photo.trim():String(photoMap[p.name]||'').trim();
    const _posUse=(p.photoPosUse!==false);
    const _posX=Number(p.photoPosX), _posY=Number(p.photoPosY);
    const photoPos=(_posUse && Number.isFinite(_posX) && Number.isFinite(_posY)) ? `${_posX}% ${_posY}%` : 'top center';
    h+=`<div class="streamer-gallery-card ${i===0?'top1':i===1?'top2':i===2?'top3':''} ${p.inactive?'inactive':''} ${p.retired?'retired':''} ${_isTpPlayerSelected(p.name)?'is-selected':''}" data-tp-action="open-player" data-tp-player="${_pAttr}"
      style="--card-accent:${col};--selected-accent:${col};background:${col}18;border-color:${col}38;backdrop-filter:blur(1px)"
      onmouseenter="try{if(typeof _prewarmPlayerModalImages==='function'){var _pp=window.players&&window.players.find(function(x){return x.name==='${_pSafe}'});if(_pp)_prewarmPlayerModalImages(_pp);}}catch(e){}">
      ${photoSrcRaw
        ? `<img loading="lazy" src="${toHttpsUrl(photoSrcRaw)}" decoding="async" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:${photoPos}" onerror="this.parentNode.querySelector('.gc-placeholder').style.display='flex';this.style.display='none'">`
        : ''}
      <div class="gc-placeholder" style="position:absolute;inset:0;display:${photoSrcRaw?'none':'flex'};align-items:center;justify-content:center;font-size:36px;font-weight:900;color:${col};background:linear-gradient(160deg,${col}2a 0%,${col}0e 100%)">${p.race||'?'}</div>
      <div class="streamer-gallery-overlay"></div>
      <div class="streamer-gallery-rank">#${i+1}</div>
      <div class="streamer-gallery-bottom">
        <div class="streamer-gallery-topline">
          <div class="streamer-gallery-name" title="${p.name}">${p.name}${genderIcon(p.gender)}</div>
          ${getStatusIconHTML(p.name)}
        </div>
        <div class="streamer-gallery-role">${p.role || '티어 랭커'}</div>
        <div class="streamer-gallery-meta">
          ${_getTierBadge(p.tier)}<span class="rbadge r${p.race}" style="font-size:9px;padding:1px 4px">${p.race||'?'}</span>
          <span class="streamer-gallery-univ-chip">${univIconHTML}${p.univ || '무소속'}</span>
          ${p.inactive?'<span class="streamer-gallery-univ-chip" style="background:rgba(249,115,22,.16);border-color:rgba(249,115,22,.24)">휴학</span>':''}
          ${p.retired?'<span class="streamer-gallery-univ-chip" style="background:rgba(148,163,184,.18);border-color:rgba(148,163,184,.28)">은퇴</span>':''}
        </div>
        <div class="streamer-gallery-stats">
          <div class="streamer-gallery-stat">
            <div class="streamer-gallery-stat-label">전적</div>
            <div class="streamer-gallery-stat-value streamer-gallery-stat-value--split">
              <span class="streamer-gallery-stat-value--em">${tot ? `${rec.w}승 ${rec.l}패` : '기록 없음'}</span>
              <span class="streamer-gallery-stat-value--muted">${tot ? `${tot}전` : '공식전 없음'}</span>
            </div>
          </div>
          <div class="streamer-gallery-stat">
            <div class="streamer-gallery-stat-label">${metricLabel}</div>
            <div class="streamer-gallery-stat-value streamer-gallery-stat-value--em">${extraVal || '-'}</div>
          </div>
          <div class="streamer-gallery-stat streamer-gallery-stat--wide">
            <div class="streamer-gallery-stat-label">ELO / 승률</div>
            <div class="streamer-gallery-stat-value streamer-gallery-stat-value--split">
              <span class="streamer-gallery-stat-value--em">${elo}</span>
              <span class="streamer-gallery-stat-value--muted" style="color:${wr===null?'rgba(255,255,255,.82)':wr>=50?'#86efac':'#fecaca'}">승률 ${tot?wr+'%':'-'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>`;
  });
  h+=`</div></div>`;
  }

  // ════════════════════════════════════════════
  // 뷰3: PODIUM (포디움 + 나머지 리스트)
  // ════════════════════════════════════════════
  else if(_vm==='podium'){
  const top1=list[0]||null, top2=list[1]||null, top3=list[2]||null;
  const rest=list.slice(3);
  const _podiumCard=(p, place)=>{
    if(!p) return '';
    const col=_getUnivColor(p.univ);
    const rec=_tierWL(p); const tot=rec.tot; const wr=rec.wr;
    const extraVal=_getExtraVal(p);
    const _pAttr=(typeof escAttr==='function')
      ? escAttr(String(p.name||'').replace(/[\r\n]+/g,' '))
      : String(p.name||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/[\r\n]+/g,' ');
    const medal = place===1 ? '🥇' : (place===2 ? '🥈' : '🥉');
    const headline = place===1 ? '현재 1위 시드' : (place===2 ? '추격 중인 상위권' : '포디움 마감권');
    return `<article class="tier-podium-card place-${place} ${_isTpPlayerSelected(p.name)?'is-selected':''}" data-tp-action="open-player" data-tp-player="${_pAttr}" style="--selected-accent:${col}">
      <div class="tier-podium-rankline">
        <span class="tier-podium-medal">${medal} ${place}위</span>
        <span class="tier-podium-ranknum">TOP ${place}</span>
      </div>
      <div class="tier-podium-main ${place===1?'tier-podium-main--hero':''}">
        ${getPlayerPhotoHTML(p.name,place===1?(_isMb?'64px':'84px'):(_isMb?'48px':'58px'),'',{lazy:true})}
        <div class="tier-podium-copy">
          <div class="tier-podium-name">${p.name}${genderIcon(p.gender)}</div>
          <div class="tier-podium-sub">
            ${_getTierBadge(p.tier)}
            <span class="rbadge r${p.race}" style="font-size:10px">${p.race||'?'}</span>
            <span class="tier-univ-badge" style="background:${col};font-size:10px;max-width:${place===1?140:110}px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${p.univ||'무소속'}</span>
          </div>
          <div class="tier-podium-highlight">${headline}</div>
        </div>
      </div>
      <div class="tier-podium-stats">
        <div class="tier-podium-statbox">
          <span class="tier-podium-statbox-label">전적</span>
          <span class="tier-podium-statbox-value">${tot?`${rec.w}W ${rec.l}L`:'기록 없음'}</span>
        </div>
        <div class="tier-podium-statbox">
          <span class="tier-podium-statbox-label">승률</span>
          <span class="tier-podium-statbox-value" style="color:${tot===0?'var(--gray-l)':wr>=50?'var(--green)':'var(--red)'}">${tot?wr+'%':'-'}</span>
        </div>
        <div class="tier-podium-statbox">
          <span class="tier-podium-statbox-label">${extraHeader}</span>
          <span class="tier-podium-statbox-value">${extraVal}</span>
        </div>
      </div>
      <div class="tier-podium-foot">
        <span class="tier-podium-stat" style="color:${tot===0?'var(--gray-l)':wr>=50?'var(--green)':'var(--red)'}">${tot?`${tot}전 ${wr}%`:'공식전 없음'}</span>
        <span class="tier-podium-ranknum">#${place}</span>
      </div>
    </article>`;
  };
  h=`<div class="tier-content-card"><div class="tier-podium-wrap">
    <section class="tier-podium-stage">
      <div class="tier-podium-lane">${_podiumCard(top2,2)}</div>
      <div class="tier-podium-lane">${_podiumCard(top1,1)}</div>
      <div class="tier-podium-lane">${_podiumCard(top3,3)}</div>
    </section>`;
  if(rest.length){
    h+=`<section class="tier-podium-rest">
      <div class="tier-podium-rest-head">
        <div class="tier-podium-rest-title">나머지 랭커</div>
        <div class="tier-podium-rest-sub">4위 이하를 카드형으로 빠르게 비교</div>
      </div>
      <div class="tier-podium-rest-grid">`;
    rest.forEach((p,i)=>{
      const ri=i+4; const col=_getUnivColor(p.univ);
      const rec=_tierWL(p); const tot=rec.tot; const wr=rec.wr;
      const _pAttr=(typeof escAttr==='function')
        ? escAttr(String(p.name||'').replace(/[\r\n]+/g,' '))
        : String(p.name||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/[\r\n]+/g,' ');
      h+=`<article class="tier-podium-rest-item ${_isTpPlayerSelected(p.name)?'is-selected':''}" data-tp-action="open-player" data-tp-player="${_pAttr}" style="--selected-accent:${col};border-top:3px solid ${col}">
        <div class="tier-podium-rest-top">
          <span class="tier-podium-rest-rank">${ri}위</span>
          ${getPlayerPhotoHTML(p.name,'34px','',{lazy:true})}
          <div class="tier-podium-rest-copy">
            <div class="tier-podium-rest-name">${p.name}${genderIcon(p.gender)}</div>
            <div class="tier-podium-rest-subline">
              ${_getTierBadge(p.tier)}
              <span class="rbadge r${p.race}" style="font-size:9px">${p.race||'?'}</span>
              <span class="ubadge tier-univ-badge" style="background:${col};font-size:9px;padding:1px 6px;max-width:92px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${p.univ||'무소속'}</span>
            </div>
          </div>
        </div>
        <div class="tier-podium-rest-metrics">
          <div class="tier-podium-statbox">
            <span class="tier-podium-statbox-label">전적</span>
            <span class="tier-podium-statbox-value">${rec.w}W ${rec.l}L</span>
          </div>
          <div class="tier-podium-statbox">
            <span class="tier-podium-statbox-label">승률</span>
            <span class="tier-podium-statbox-value" style="color:${tot===0?'var(--gray-l)':wr>=50?'var(--green)':'var(--red)'}">${tot?wr+'%':'-'}</span>
          </div>
        </div>
      </article>`;
    });
    h+=`</div></section>`;
  }
  h+=`</div></div>`;
  }

  // ════════════════════════════════════════════
  // 뷰4: COMPACT (초밀도 리스트)
  // ════════════════════════════════════════════
  else if(_vm==='compact'){
  h=`<div class="tier-content-card"><div class="tier-compact-list">
    <div class="tier-compact-head">
      <span>순위</span>
      <span>스트리머</span>
      <span>핵심 지표</span>
      <span style="text-align:center">활동</span>
    </div>`;
  list.forEach((p,i)=>{
    const rec=_tierWL(p); const col=_getUnivColor(p.univ); const tot=rec.tot; const wr=rec.wr;
    const _pSafe=(typeof escJS==='function') ? escJS(p.name) : (p.name||'').replace(/\\/g,'\\\\').replace(/'/g,"\\'").replace(/\r/g,'\\r').replace(/\n/g,'\\n');
    const _pAttr=(typeof escAttr==='function')
      ? escAttr(String(p.name||'').replace(/[\r\n]+/g,' '))
      : String(p.name||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/[\r\n]+/g,' ');
    const extraVal=_getExtraVal(p); const _actHTML=_getActHTML(p);
    const _rankMain=i<3?['🥇','🥈','🥉'][i]:`${i+1}`;
    h+=`<div class="tier-compact-item ${_isTpPlayerSelected(p.name)?'is-selected':''}" data-tp-action="open-player" data-tp-player="${_pAttr}" style="--selected-accent:${col}">
      <div class="tier-compact-rankbox">
        <span class="tier-compact-rank">${_rankMain}</span>
        <span class="tier-compact-rank-label">${i+1}위</span>
      </div>
      <div class="tier-compact-main">
        ${getPlayerPhotoHTML(p.name,_isMb?'28px':'30px','',{lazy:true})}
        <div class="tier-compact-meta">
          <div class="tier-compact-name">${p.name}${genderIcon(p.gender)}</div>
          <div class="tier-compact-sub">
            ${_getTierBadge(p.tier)}
            <span class="rbadge r${p.race}" style="font-size:9px">${p.race}</span>
            <span class="ubadge tier-univ-badge" style="background:${col};font-size:9px;padding:1px 6px;max-width:${_isMb?82:96}px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${p.univ}</span>
          </div>
        </div>
      </div>
      <div class="tier-compact-metrics">
        <div class="tier-compact-metric">
          <span class="tier-compact-metric-label">전적</span>
          <span class="tier-compact-metric-value"><span style="color:var(--score-win)">${rec.w}</span>W <span style="color:var(--score-lose)">${rec.l}</span>L</span>
        </div>
        <div class="tier-compact-metric">
          <span class="tier-compact-metric-label">승률</span>
          <span class="tier-compact-metric-value" style="color:${tot===0?'var(--gray-l)':wr>=50?'var(--green)':'var(--red)'}">${tot?wr+'%':'-'}</span>
        </div>
        <div class="tier-compact-metric">
          <span class="tier-compact-metric-label">${extraHeader}</span>
          <span class="tier-compact-metric-value">${extraVal}</span>
        </div>
      </div>
      <div class="tier-compact-side">${_actHTML}</div>
    </div>`;
  });
  h+=`</div></div>`;
  }

  // ════════════════════════════════════════════
  // 뷰5: TIER-GROUP (티어별 그룹)
  // ════════════════════════════════════════════
  else if(_vm==='tier-group'){
  const _tierGroups={};
  list.forEach((p,i)=>{
    const t=p.tier||'미정';
    if(!_tierGroups[t]) _tierGroups[t]={tier:t,players:[]};
    _tierGroups[t].players.push({p,i});
  });
  const _orderedTiers=[...TIERS,'미정'].filter(t=>_tierGroups[t]);
  h='';
  _orderedTiers.forEach(t=>{
    const grp=_tierGroups[t]; if(!grp) return;
    const _tc=getTierBtnColor(t)||'#64748b'; const _tt=getTierBtnTextColor(t)||'#fff';
    h+=`<div class="tier-group-sec">
      <div class="tier-group-head" style="background:${_tc}18;border-left:4px solid ${_tc}">
        <span style="background:${_tc};color:${_tt};font-weight:900;font-size:var(--fs-base);padding:3px 12px;border-radius:5px">${getTierLabel(t)}</span>
        <span style="font-size:var(--fs-sm);font-weight:700;color:var(--text3)">${grp.players.length}명</span>
      </div>
      <div class="tier-group-grid" style="grid-template-columns:repeat(auto-fill,minmax(${_isMb?'130px':'160px'},1fr));gap:${_isMb?'6px':'8px'}">`;
    grp.players.forEach(({p,i})=>{
      const rec=_tierWL(p); const col=_getUnivColor(p.univ); const tot=rec.tot; const wr=rec.wr;
      const _pAttr=(typeof escAttr==='function')
        ? escAttr(String(p.name||'').replace(/[\r\n]+/g,' '))
        : String(p.name||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/[\r\n]+/g,' ');
      h+=`<div class="tier-group-card ${_isTpPlayerSelected(p.name)?'is-selected':''}" data-tp-action="open-player" data-tp-player="${_pAttr}" style="--selected-accent:${col};border-color:${col}33">
        <span style="align-self:flex-start;font-size:10px;font-weight:900;color:var(--text3)">${i+1}위</span>
        ${getPlayerPhotoHTML(p.name,_isMb?'40px':'46px','',{lazy:true})}
        <span style="font-weight:800;font-size:${_isMb?11:12}px;text-align:center;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${p.name}</span>
        <span class="ubadge tier-univ-badge" data-icon-done="1" style="background:${col};font-size:9px;padding:1px 6px;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${p.univ}</span>
        <span class="rbadge r${p.race}" style="font-size:9px">${p.race}</span>
        <div style="font-size:10px;font-weight:800;color:${tot===0?'var(--gray-l)':wr>=50?'var(--green)':'var(--red)'}">${tot?wr+'%':'-'} (${rec.w}W${rec.l}L)</div>
      </div>`;
    });
    h+=`</div></div>`;
  });
  }

  C.innerHTML=`<div class="tier-shell">
    <section class="tier-hero">
      <div class="tier-hero-copy">
        <div class="tier-hero-kicker">Tier Ranking</div>
        <div class="tier-hero-title">📊 티어 순위표</div>
        <div class="tier-hero-desc">티어, 대학, 종족, 활동 지표를 한눈에 비교하고 테이블, 카드, 포디움 등 원하는 보기 방식으로 빠르게 확인할 수 있습니다.</div>
      </div>
      <div class="tier-hero-badges">
        <span class="tier-hero-badge">${_viewLabel}</span>
        <span class="tier-hero-badge">${hasTypeSet?`유형 ${window._tierTypeSet.size}개`:(modeHeaders[tierRankMode]||'포인트')}</span>
        <span class="tier-hero-badge">${_hasDateFilter?`기간 ${_tierDateBadge}`:'전체 기간'}</span>
        <span class="tier-hero-badge">필터 ${_activeFilters}개</span>
        <span class="tier-hero-badge">총 ${list.length}명</span>
      </div>
    </section>
    ${fh}
    ${h}
  </div>`;
  _syncTpSelectedCards();
}
