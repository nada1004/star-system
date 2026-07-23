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
    '.tier-view-btn{padding:6px 9px;border-radius:var(--r);border:1.5px solid var(--border2);background:var(--white);color:var(--text3);font-size:var(--fs-base);cursor:pointer;line-height:1;box-shadow:0 8px 16px rgba(15,23,42,.04);display:inline-flex;align-items:center;gap:5px;white-space:nowrap}',
    '.tier-view-row{display:flex;align-items:center;gap:10px;padding-top:11px;margin-top:1px;border-top:1px dashed rgba(148,163,184,.24);flex-wrap:wrap}',
    '.tier-view-row-label{font-size:11px;font-weight:850;color:var(--text3);flex-shrink:0;display:flex;align-items:center;gap:4px;letter-spacing:-.01em}',
    '.tier-view-row-btns{display:flex;gap:3px;flex-wrap:wrap;min-width:0}',
    'body.dark .tier-view-row{border-top-color:rgba(148,163,184,.16)}',
    'body.dark .tier-view-row-label{color:#94a3b8}',
    '.tier-view-btn-icon{line-height:1}',
    '.tier-view-btn-label{font-size:11px;font-weight:800;letter-spacing:-.01em}',
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
    '.tier-rank-card{cursor:pointer;background:linear-gradient(180deg,rgba(255,255,255,.98),rgba(248,250,252,.94));border:1.5px solid rgba(148,163,184,.18);border-radius:18px;padding:14px 12px;display:flex;flex-direction:column;align-items:center;gap:7px;transition:box-shadow .15s,transform .15s;position:relative;box-shadow:0 12px 24px rgba(15,23,42,.05)}',
    '.tier-rank-card:hover{box-shadow:0 18px 30px rgba(15,23,42,.08);transform:translateY(-2px)}',
    '.tier-rank-card.top1,.tier-rank-card.top2,.tier-rank-card.top3{box-shadow:0 16px 30px rgba(15,23,42,.07);border-color:rgba(148,163,184,.22)}',
    '.tier-rank-badge{position:absolute;top:8px;left:10px;font-size:var(--fs-sm);font-weight:900}',
    '.tier-rank-act{position:absolute;top:8px;right:10px}',
    '.tier-rank-statgrid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;width:100%;border-top:1px solid rgba(148,163,184,.16);padding-top:8px;margin-top:4px}',
    '.tier-rank-stat{padding:7px 4px;border-radius:12px;background:rgba(248,250,252,.9);text-align:center;border:1px solid rgba(148,163,184,.14)}',
    '.tier-rank-extra{font-size:var(--fs-caption);text-align:center;padding:5px 10px;border-radius:999px;background:rgba(59,130,246,.08);border:1px solid rgba(59,130,246,.16);font-weight:800;color:var(--text2)}',
    '.tier-podium-wrap{display:flex;flex-direction:column;gap:18px}',
    '.tier-podium-stage{display:grid;grid-template-columns:repeat(3,292px);justify-content:center;gap:34px;align-items:end;max-width:none;margin:0 auto}',
    '.tier-podium-lane{display:flex;align-items:flex-end}',
    '.tier-podium-card{display:flex;flex-direction:column;gap:12px;cursor:pointer;padding:18px;border-radius:24px;background:linear-gradient(180deg,rgba(255,255,255,.99),rgba(248,250,252,.95));border:1px solid rgba(148,163,184,.16);box-shadow:0 18px 34px rgba(15,23,42,.06)}',
    '.tier-podium-card.place-1{min-height:100%;padding:22px;border-radius:28px;background:linear-gradient(180deg,rgba(255,251,235,.99),rgba(255,247,237,.96));border-color:rgba(245,158,11,.26);box-shadow:0 20px 38px rgba(245,158,11,.12);min-height:344px}',
    '.tier-podium-card.place-2{justify-content:flex-end;background:linear-gradient(180deg,rgba(248,250,252,.99),rgba(241,245,249,.96));border-color:rgba(148,163,184,.30);box-shadow:0 18px 30px rgba(148,163,184,.12);min-height:324px}',
    '.tier-podium-card.place-3{justify-content:flex-end;background:linear-gradient(180deg,rgba(251,248,245,.99),rgba(247,241,236,.96));border-color:rgba(180,120,96,.16);box-shadow:0 14px 24px rgba(180,120,96,.05);min-height:292px}',
    '.tier-podium-rankline{display:flex;align-items:center;justify-content:space-between;gap:10px}',
    '.tier-podium-medal{display:inline-flex;align-items:center;gap:8px;font-size:var(--fs-base);font-weight:900;color:var(--text2)}',
    '.tier-podium-ranknum{display:inline-flex;align-items:center;justify-content:center;min-width:38px;height:38px;padding:0 10px;border-radius:999px;background:rgba(15,23,42,.06);font-size:var(--fs-base);font-weight:900;color:var(--text2)}',
    '.tier-podium-card.place-1 .tier-podium-medal{color:#b45309}',
    '.tier-podium-card.place-2 .tier-podium-medal{color:#475569}',
    '.tier-podium-card.place-3 .tier-podium-medal{color:#92400e}',
    '.tier-podium-card.place-1 .tier-podium-ranknum{background:rgba(245,158,11,.14);color:#b45309}',
    '.tier-podium-card.place-2 .tier-podium-ranknum{background:rgba(148,163,184,.18);color:#475569}',
    '.tier-podium-card.place-3 .tier-podium-ranknum{background:rgba(194,120,86,.12);color:#92400e}',
    /* ── 포디움 카드: 프로필 사진이 카드 전체를 채우는 풀배경형 ── */
    '.tier-podium-card{position:relative;overflow:hidden}',
    '.tier-podium-bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center 18%;z-index:0;transition:transform .32s ease}',
    '.tier-podium-card:hover .tier-podium-bg{transform:scale(1.045)}',
    '.tier-podium-bg-fallback{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:60px;font-weight:900;color:#fff;z-index:0;letter-spacing:-.04em}',
    '.tier-podium-rankline{position:relative;z-index:2}',
    '.tier-podium-medal{background:rgba(15,23,42,.34);color:#fff!important;padding:5px 10px;border-radius:999px;backdrop-filter:blur(6px)}',
    '.tier-podium-card.place-1 .tier-podium-medal,.tier-podium-card.place-2 .tier-podium-medal,.tier-podium-card.place-3 .tier-podium-medal{color:#fff!important}',
    '.tier-podium-ranknum{background:rgba(15,23,42,.34)!important;color:#fff!important;backdrop-filter:blur(6px)}',
    '.tier-podium-card.place-1 .tier-podium-ranknum,.tier-podium-card.place-2 .tier-podium-ranknum,.tier-podium-card.place-3 .tier-podium-ranknum{background:rgba(15,23,42,.34)!important;color:#fff!important}',
    '.tier-podium-main{display:flex;align-items:center;gap:12px;min-width:0;position:relative;z-index:2;margin-top:auto}',
    '.tier-podium-main--hero{align-items:flex-start;gap:14px}',
    '.tier-podium-copy{display:flex;flex-direction:column;gap:6px;min-width:0;flex:1}',
    '.tier-podium-card.place-1 .tier-podium-copy{padding-top:2px}',
    '.tier-podium-name{font-size:19px;font-weight:950;letter-spacing:-.03em;color:#fff;text-shadow:0 1px 3px rgba(0,0,0,.75),0 2px 12px rgba(0,0,0,.6);min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
    '.tier-podium-card.place-1 .tier-podium-name{font-size:24px}',
    '.tier-podium-sub{display:flex;align-items:center;gap:6px;flex-wrap:wrap;min-width:0}',
    '.tier-podium-highlight{font-size:var(--fs-sm);line-height:1.6;color:rgba(255,255,255,.9);text-shadow:0 1px 3px rgba(0,0,0,.7),0 2px 8px rgba(0,0,0,.5)}',
    '.tier-podium-stats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;position:relative;z-index:2}',
    '.tier-podium-card.place-1 .tier-podium-stats{gap:8px}',
    '.tier-podium-statbox{display:flex;flex-direction:column;gap:4px;padding:10px 11px;border-radius:var(--r2);background:rgba(255,255,255,.16);backdrop-filter:blur(8px) saturate(1.2);-webkit-backdrop-filter:blur(8px) saturate(1.2);border:1px solid rgba(255,255,255,.22);min-width:0}',
    '.tier-podium-statbox-label{font-size:10px;font-weight:800;color:rgba(255,255,255,.78);letter-spacing:.04em;text-transform:uppercase;text-shadow:0 1px 4px rgba(0,0,0,.35)}',
    '.tier-podium-statbox-value{font-size:14px;font-weight:900;color:#fff;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-shadow:0 1px 4px rgba(0,0,0,.4)}',
    '.tier-podium-foot{display:flex;align-items:center;justify-content:space-between;gap:10px;position:relative;z-index:2}',
    '.tier-podium-stat{font-size:var(--fs-caption);font-weight:800;padding:5px 10px;border-radius:999px;background:rgba(255,255,255,.18);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,.22);text-shadow:0 1px 3px rgba(0,0,0,.35)}',
    '.tier-podium-rest{padding-top:2px}',
    '.tier-podium-rest-head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:10px}',
    '.tier-podium-rest-title{font-size:var(--fs-sm);font-weight:900;color:var(--text2);letter-spacing:-.02em}',
    '.tier-podium-rest-sub{font-size:var(--fs-caption);font-weight:700;color:var(--text3)}',
    '.tier-podium-rest-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:14px}',
    '.tier-podium-rest-item{position:relative;cursor:pointer;border-radius:20px;overflow:hidden;aspect-ratio:.74;display:flex;align-items:flex-end;border:1px solid rgba(255,255,255,.14);background:#0b1120;box-shadow:0 10px 22px rgba(15,23,42,.08);transition:transform .2s ease,box-shadow .2s ease}',
    '.tier-podium-rest-photo{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:top center;transition:transform .32s ease;z-index:0}',
    '.tier-podium-rest-item:hover .tier-podium-rest-photo{transform:scale(1.05)}',
    '.tier-podium-rest-fallback{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:30px;font-weight:900;color:#fff;z-index:0}',
    '.tier-podium-rest-rankchip{position:absolute;top:8px;left:8px;z-index:2;min-width:26px;height:24px;padding:0 7px;border-radius:999px;background:rgba(15,23,42,.55);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);color:#fff;font-size:11px;font-weight:900;display:inline-flex;align-items:center;justify-content:center;box-shadow:0 4px 10px rgba(0,0,0,.25)}',
    '.tier-podium-rest-bottom{position:relative;z-index:2;width:100%;padding:10px 10px 11px;display:flex;flex-direction:column;gap:6px}',
    '.tier-podium-rest-top{display:flex;align-items:center;gap:10px;min-width:0}',
    '.tier-podium-rest-rank{font-size:var(--fs-sm);font-weight:900;color:var(--text3);min-width:34px}',
    '.tier-podium-rest-copy{display:flex;flex-direction:column;gap:5px;min-width:0;flex:1}',
    '.tier-podium-rest-name{font-size:var(--fs-base);font-weight:900;color:#fff;text-shadow:0 1px 3px rgba(0,0,0,.75),0 2px 8px rgba(0,0,0,.55);min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
    '.tier-podium-rest-subline{display:flex;align-items:center;gap:5px;flex-wrap:wrap}',
    '.tier-podium-rest-metrics{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px}',
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
    '.tier-group-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:12px;padding:0 4px}',
    '.tier-group-card{position:relative;cursor:pointer;overflow:hidden;border-radius:16px;aspect-ratio:.78;border:1px solid rgba(255,255,255,.14);background:#0b1120;box-shadow:0 10px 20px rgba(15,23,42,.06);display:flex;align-items:flex-end;transition:transform .2s ease,box-shadow .2s ease}',
    '.tier-group-photo{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:top center;transition:transform .3s ease;z-index:0}',
    '.tier-group-card:hover .tier-group-photo{transform:scale(1.06)}',
    '.tier-group-fallback{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:26px;font-weight:900;color:#fff;z-index:0}',
    '.tier-group-rank{position:absolute;top:6px;left:6px;z-index:2;font-size:9px;font-weight:900;color:#fff;background:rgba(15,23,42,.55);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);padding:2px 7px;border-radius:999px}',
    '.tier-group-bottom{position:relative;z-index:2;width:100%;padding:8px 8px 9px;display:flex;flex-direction:column;gap:4px}',
    '.tier-group-name{font-weight:900;font-size:12px;color:#fff;text-shadow:0 1px 3px rgba(0,0,0,.75),0 2px 6px rgba(0,0,0,.5);max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
    '.tier-group-pills{display:flex;gap:3px;flex-wrap:wrap;align-items:center}',
    '.tier-group-wr{font-size:10px;font-weight:800;text-shadow:0 1px 3px rgba(0,0,0,.7),0 2px 6px rgba(0,0,0,.4)}',
    /* ── 매거진/룩북 모드 ── */
    '.tier-mag-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:22px;padding:10px 2px}',
    '.tier-mag-card{position:relative;aspect-ratio:.72;border-radius:22px;overflow:hidden;cursor:pointer;background:#0b1120;isolation:isolate;transition:box-shadow .25s ease,transform .25s ease}',
    '.tier-mag-card:hover{box-shadow:0 22px 44px rgba(15,23,42,.24);transform:translateY(-2px)}',
    '.tier-mag-card.is-selected{outline:2px solid rgba(255,255,255,.3);outline-offset:2px}',
    '.tier-mag-spine{position:absolute;top:0;left:0;right:0;height:4px;z-index:4;transition:height .25s ease,filter .25s ease}',
    '.tier-mag-card:hover .tier-mag-spine{height:6px;filter:brightness(1.25)}',
    '.tier-mag-photo{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:0;transition:transform .5s cubic-bezier(.2,.8,.2,1),filter .45s ease}',
    '.tier-mag-card:hover .tier-mag-photo{transform:scale(1.065);filter:brightness(.6) contrast(1.06) saturate(1.1)}',
    '.tier-mag-fallback{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:40px;font-weight:900;color:#fff;z-index:0}',
    '.tier-mag-rank{position:absolute;top:12px;left:12px;z-index:3;font-size:11px;font-weight:950;color:#fff;padding:4px 10px;border-radius:8px;letter-spacing:-.01em;box-shadow:0 6px 14px rgba(0,0,0,.3);transition:transform .3s cubic-bezier(.34,1.56,.64,1)}',
    '.tier-mag-card:hover .tier-mag-rank{transform:scale(1.1) rotate(-2deg)}',
    '.tier-mag-bottom{position:absolute;left:0;right:0;bottom:0;z-index:2;display:flex;flex-direction:column}',
    '.tier-mag-panel{max-height:0;overflow:hidden;transition:max-height .36s cubic-bezier(.2,.8,.2,1);padding:0 16px}',
    '.tier-mag-card:hover .tier-mag-panel{max-height:180px;padding:14px 16px 2px}',
    '.tier-mag-panel-row{display:flex;align-items:center;justify-content:space-between;gap:10px;font-size:12px;font-weight:800;color:rgba(255,255,255,.95);padding:4px 0;opacity:0;transform:translateY(6px);transition:opacity .3s ease,transform .3s ease}',
    '.tier-mag-card:hover .tier-mag-panel-row{opacity:1;transform:translateY(0)}',
    '.tier-mag-card:hover .tier-mag-panel-row:nth-child(1){transition-delay:.04s}',
    '.tier-mag-card:hover .tier-mag-panel-row:nth-child(2){transition-delay:.09s}',
    '.tier-mag-card:hover .tier-mag-panel-row:nth-child(3){transition-delay:.14s}',
    '.tier-mag-panel-label{color:rgba(255,255,255,.6);font-weight:750;font-size:10px;letter-spacing:.06em;text-transform:uppercase}',
    '.tier-mag-baseline{display:flex;align-items:flex-end;justify-content:space-between;gap:10px;padding:12px 16px 16px}',
    '.tier-mag-baseline-text{min-width:0;flex:1}',
    '.tier-mag-eyebrow{font-size:10px;font-weight:850;letter-spacing:.09em;text-transform:uppercase;color:rgba(255,255,255,.8);margin-bottom:3px;text-shadow:0 1px 4px rgba(0,0,0,.5);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
    '.tier-mag-name{font-size:19px;font-weight:950;letter-spacing:-.02em;line-height:1.08;color:#fff;text-shadow:0 2px 10px rgba(0,0,0,.65);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0;transition:letter-spacing .3s ease}',
    '.tier-mag-card:hover .tier-mag-name{letter-spacing:-.005em}',
    '.tier-mag-wr-chip{font-size:12px;font-weight:950;color:#fff;background:rgba(15,23,42,.5);backdrop-filter:blur(4px);padding:5px 11px;border-radius:999px;white-space:nowrap;border:1.5px solid rgba(255,255,255,.2);flex-shrink:0}',
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
    'body.dark .tier-podium-card.place-2{background:linear-gradient(180deg,rgba(30,41,59,.98),rgba(15,23,42,.9));border-color:rgba(148,163,184,.30);box-shadow:0 18px 34px rgba(148,163,184,.10)}',
    'body.dark .tier-podium-card.place-3{background:linear-gradient(180deg,rgba(49,26,18,.22),rgba(15,23,42,.92));border-color:rgba(180,120,96,.20);box-shadow:0 18px 32px rgba(120,72,52,.08)}',
    'body.dark .tier-podium-card.place-1 .tier-podium-medal{color:#fcd34d}',
    'body.dark .tier-podium-card.place-2 .tier-podium-medal{color:#e2e8f0}',
    'body.dark .tier-podium-card.place-3 .tier-podium-medal{color:#e7b38a}',
    'body.dark .tier-podium-card.place-2 .tier-podium-ranknum{background:rgba(148,163,184,.18);color:#e2e8f0}',
    'body.dark .tier-podium-card.place-3 .tier-podium-ranknum{background:rgba(180,120,96,.16);color:#e7b38a}',
    'body.dark .tier-rank-stat,body.dark .tier-podium-stat,body.dark .tier-rank-extra,body.dark .tier-compact-extra{background:rgba(30,41,59,.78);border-color:#334155;color:#e2e8f0}',
    'body.dark .tier-podium-name,body.dark .tier-podium-statbox-value,body.dark .tier-podium-rest-name{color:#f8fafc}',
    'body.dark .tier-podium-medal,body.dark .tier-podium-ranknum,body.dark .tier-podium-highlight,body.dark .tier-podium-rest-title,body.dark .tier-podium-rest-sub,body.dark .tier-podium-rest-rank,body.dark .tier-podium-statbox-label{color:#cbd5e1}',
    'body.dark .tier-compact-head,body.dark .tier-compact-rank-label,body.dark .tier-compact-metric-label{color:#94a3b8}',
    'body.dark .tier-compact-name,body.dark .tier-compact-rank,body.dark .tier-compact-metric-value{color:#f8fafc}',
    'body.dark .tier-compact-metric{background:rgba(30,41,59,.78);border-color:#334155}',
    'body.dark .tier-podium-card.is-selected,body.dark .tier-podium-rest-item.is-selected,body.dark .tier-compact-item.is-selected,body.dark .tier-group-card.is-selected{box-shadow:0 16px 30px rgba(0,0,0,.26),0 0 0 2px color-mix(in srgb,var(--selected-accent,#3b82f6) 26%, transparent);border-color:color-mix(in srgb,var(--selected-accent,#3b82f6) 44%, #334155)}',
    'body.dark .tier-act-dot{background:linear-gradient(180deg,rgba(15,23,42,.94),rgba(30,41,59,.88));border-color:#334155;box-shadow:0 12px 22px rgba(0,0,0,.18)}',
    'body.dark .tier-act-dot.hot{color:#86efac;border-color:rgba(34,197,94,.24)}',
    'body.dark .tier-act-dot.warm{color:#fcd34d;border-color:rgba(245,158,11,.22)}',
    'body.dark .tier-act-dot.cool,body.dark .tier-act-dot.none{color:#cbd5e1}',
    'body.dark .tier-mag-card{box-shadow:0 16px 32px rgba(0,0,0,.3)}',
    'body.dark .tier-mag-card.is-selected{outline-color:rgba(148,163,184,.4)}',
    '@media (max-width:768px){.tier-shell{overflow-x:hidden;max-width:100%}.tier-hero{display:none}.tier-toolbar-card,.tier-content-card{padding:10px;overflow-x:hidden}.tier-filter-blocks{grid-template-columns:1fr}.tier-filter-selectrow,.tier-filter-option-row,.tier-type-grid{grid-template-columns:1fr}.tier-view-btn-label{display:none}.tier-view-btn{padding:7px}.tier-podium-stage{grid-template-columns:1fr;gap:10px;max-width:none;width:100%}.tier-podium-card{padding:14px 14px 16px;border-radius:20px;min-height:0 !important;max-width:100%}.tier-podium-card.place-1{padding:18px;order:0}.tier-podium-card.place-2{order:1}.tier-podium-card.place-3{order:2}.tier-podium-name{font-size:var(--fs-lg)}.tier-podium-card.place-1 .tier-podium-name{font-size:20px}.tier-podium-main{align-items:flex-start}.tier-podium-avatar{width:52px!important;height:52px!important;max-width:52px!important;max-height:52px!important;border-radius:18px}.tier-podium-card.place-1 .tier-podium-avatar{width:96px!important;height:118px!important;max-width:96px!important;max-height:118px!important;border-radius:20px}.tier-podium-stats{grid-template-columns:repeat(2,minmax(0,1fr))}.tier-podium-rest-grid{grid-template-columns:1fr}.tier-group-grid{grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:8px}.tier-compact-head{display:none}.tier-compact-item{grid-template-columns:48px minmax(0,1fr);gap:8px 10px;align-items:start;padding:9px 10px}.tier-compact-main,.tier-compact-metrics{grid-column:2 / 3}.tier-compact-side{display:none}.tier-compact-metrics{grid-template-columns:repeat(3,minmax(0,1fr));gap:6px}.tier-compact-metric{align-items:flex-start;padding:6px 7px}.tier-compact-metric-value{font-size:var(--fs-caption);white-space:normal}.tier-mag-grid{grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:12px}.tier-mag-name{font-size:15px}.tier-mag-eyebrow{font-size:9px}}',
    /* 초소형 폰(400px 이하) 추가 대응: 카드/그룹 그리드 여백을 더 좁혀 2열이 빠듯하게라도 들어가도록 */
    '@media (max-width:400px){.tier-hero{padding:12px}.tier-toolbar-card,.tier-content-card{padding:8px}.tier-podium-stats{grid-template-columns:repeat(3,minmax(0,1fr));gap:5px}.tier-podium-card{padding:12px}.tier-podium-card.place-1{padding:14px}.tier-podium-statbox{padding:7px 6px}.tier-podium-rest-metrics{gap:5px}.tier-compact-item{padding:8px 8px}.tier-compact-metrics{gap:5px}.tier-mag-grid{grid-template-columns:repeat(auto-fill,minmax(128px,1fr));gap:8px}.tier-mag-name{font-size:13px}.tier-mag-eyebrow{font-size:8px}}',
    /* 포디움 모드 모바일: 1등을 가운데(은-금-동 순)로 배치, 한 줄(3열)에 나란히, 박스 크기를 모바일 브라우저에 맞게 축소 */
    '@media (max-width:768px){',
      '.tier-podium-stage{grid-template-columns:repeat(3,minmax(0,1fr)) !important;gap:8px !important;max-width:100% !important;width:100%;align-items:end !important;padding:0 2px}',
      '.tier-podium-lane{min-width:0;display:flex;align-items:flex-end}',
      '.tier-podium-card{padding:8px 6px 10px !important;border-radius:14px !important;gap:6px !important;min-width:0;width:100%;box-sizing:border-box}',
      '.tier-podium-card.place-1{order:1 !important;padding:12px 7px 14px !important;transform:translateY(-8px);z-index:1}',
      '.tier-podium-card.place-2{order:0 !important}',
      '.tier-podium-card.place-3{order:2 !important}',
      '.tier-podium-rankline{gap:4px}',
      '.tier-podium-medal{font-size:9.5px !important;gap:3px !important}',
      '.tier-podium-ranknum{min-width:20px !important;height:20px !important;font-size:9.5px !important;padding:0 5px !important}',
      '.tier-podium-main{flex-direction:column !important;align-items:center !important;text-align:center;gap:4px !important}',
      '.tier-podium-main--hero{align-items:center !important}',
      '.tier-podium-avatar{width:38px !important;height:38px !important;max-width:38px !important;max-height:38px !important;border-radius:11px !important}',
      '.tier-podium-card.place-1 .tier-podium-avatar{width:60px !important;height:74px !important;max-width:60px !important;max-height:74px !important;border-radius:15px !important}',
      '.tier-podium-copy{align-items:center !important;width:100%;gap:3px !important;min-width:0}',
      '.tier-podium-name{font-size:11.5px !important;max-width:100%;text-align:center;overflow:hidden;text-overflow:ellipsis}',
      '.tier-podium-card.place-1 .tier-podium-name{font-size:var(--fs-base) !important}',
      '.tier-podium-sub,.tier-podium-highlight,.tier-podium-foot,.tier-podium-stats{display:none !important}',
    '}',
    /* 티어 순위표 - 테이블뷰 모바일 전용: 종족 컬럼을 없애고 아바타 코너 배지로 대체,
       확보된 공간으로 순위/티어/이름을 더 크고 읽기 쉽게 표시 (PC는 영향 없음) */
    '.tier-avatar-wrap{position:relative;display:inline-flex;flex-shrink:0}',
    '.tier-avatar-race{display:none}',
    '@media (max-width:768px){',
      /* [FIX] 아바타를 30~36px로 확대(모양 설정이 잘 보이도록)하면서 배지도 비율에 맞춰 소폭 상향.
         고정 크기(12px 원형)로 아바타 대비 비율을 스트리머탭 리스트뷰와 비슷한 수준으로 유지하고,
         코너에 살짝 겹치는 정도로만 보이게 함. */
      '.tier-avatar-race{display:inline-flex;align-items:center;justify-content:center;position:absolute;left:-3px;top:-3px;width:22px !important;height:22px !important;padding:0 !important;font-size:var(--fs-caption) !important;line-height:1;border-radius:50%;border:2px solid #fff;box-shadow:0 1px 3px rgba(15,23,42,.35)}',
      'body.dark .tier-avatar-race{border-color:#0f172a}',
      '.tier-table thead th{font-size:10.5px !important}',
      '.tier-table .tbadge{font-size:10px !important;padding:2px 5px !important}',
      '.tier-table .clickable-name{font-size:12.5px !important;font-weight:800 !important}',
      '.tier-table .tier-rank-chip{min-width:0 !important;width:100%;height:19px !important;padding:0 2px !important;font-size:9.5px !important;border-radius:8px !important}',
      '.tier-name-badges{margin-left:1px}',
      '.tier-name-badges img{width:14px !important;height:14px !important}',
      '.tier-name-badges .male-icon{font-size:var(--fs-sm)}',
      '.tier-content-card{margin:0 2px;box-sizing:border-box}',
      '.tier-table tbody tr{box-shadow:0 8px 16px rgba(15,23,42,.05) !important}',
      '.tier-table{border-spacing:0 6px !important}',
      '.tier-table tbody tr,.clickable-name{-webkit-tap-highlight-color:transparent}',
    '}',
    /* 모바일에서 숨겨지는 컬럼(대학/승/패/ELO/활동) 정보를 각 행 아래 요약 줄로 노출 (PC에서는 숨김) */
    '.tier-mobile-info-row{display:none}',
    '@media (max-width:768px){',
      '.tier-mobile-info-row{display:table-row}',
      '.tier-mobile-info-row td{border-top:none !important;padding:0 10px 8px 74px !important}',
      '.tier-table tbody tr:has(+ .tier-mobile-info-row) td{border-bottom:none !important;padding-bottom:4px !important}',
      '.tier-table tbody tr:has(+ .tier-mobile-info-row) td:first-child{border-bottom-left-radius:0 !important}',
      '.tier-table tbody tr:has(+ .tier-mobile-info-row) td:first-child,.tier-mobile-info-row td:first-child{border-top-left-radius:0 !important}',
      '.tier-table tbody tr:has(+ .tier-mobile-info-row) td:last-child{border-bottom-right-radius:0 !important}',
      '.tier-mobile-info-row td{border-top-left-radius:0 !important;border-top-right-radius:0 !important;border-bottom-left-radius:16px !important;border-bottom-right-radius:16px !important}',
      /* [클린업] 낱개 pill 배지 나열 대신 한 줄짜리 메타 텍스트로 정리 (대학 · 승패 · ELO, 활동은 우측 정렬) */
      '.tier-mobile-meta{display:flex;align-items:center;gap:5px;min-width:0;font-size:10.5px;font-weight:700;color:var(--text3);border-top:1px solid rgba(148,163,184,.14);padding-top:5px}',
      'body.dark .tier-mobile-meta{border-top-color:rgba(255,255,255,.08)}',
      '.tier-mobile-meta .tmm-univ{color:var(--text2);font-weight:900;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:88px;flex-shrink:0}',
      '.tier-mobile-meta .tmm-sep{opacity:.35;flex-shrink:0}',
      '.tier-mobile-meta .tmm-rec{flex-shrink:0;white-space:nowrap}',
      '.tier-mobile-meta .tmm-rec b{font-weight:900}',
      '.tier-mobile-meta .tmm-rec .w{color:var(--win-col)}',
      '.tier-mobile-meta .tmm-rec .l{color:var(--lose-col)}',
      '.tier-mobile-meta .tmm-elo{flex-shrink:0;white-space:nowrap;font-weight:900;color:var(--text2)}',
    '}'
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
  const _viewModeLabels={table:'테이블',podium:'포디움',compact:'컴팩트','tier-group':'티어 그룹',magazine:'매거진'};
  if(!window._tierViewMode) window._tierViewMode = (()=>{try{return localStorage.getItem('su_tier_view_mode')||'table';}catch(e){return 'table';}})();
  const _viewLabel=_viewModeLabels[window._tierViewMode||'table']||'테이블';

  // ── 1행: 필터/정렬 pills ──   ── 2행: 보기 모드 버튼 ──
  let fh=`<div class="tier-toolbar-card"><div class="tier-filter-shell">`;
  fh+=`<div class="fbar" style="min-width:0;overflow-x:auto;flex-wrap:nowrap;-webkit-overflow-scrolling:touch;scrollbar-width:none;gap:4px">`;
  fh+=`<button class="pill ${window._tierFilterOpen||_activeFilters>0?'on':''}" style="flex-shrink:0;white-space:nowrap" onclick="window._tierFilterOpen=!window._tierFilterOpen;render()">🔍 필터${_activeFilters>0?` (${_activeFilters})`:''} ${window._tierFilterOpen?'▲':'▼'}</button>`;
  modes.forEach(m=>{
    const on=tierRankMode===m.id&&_curModeNoFilter;
    fh+=`<button class="pill ${on?'on':''}" style="flex-shrink:0;white-space:nowrap" onclick="tierRankMode='${m.id}';window._tierTypeSet=new Set();render()">${m.lbl}</button>`;
  });
  fh+=`<span class="fbar-divider"></span>`;
  fh+=`<button class="pill ${window._tierHideNoRecord?'on':''}" style="flex-shrink:0;white-space:nowrap" onclick="window._tierHideNoRecord=!window._tierHideNoRecord;render()">전적없음 제외</button>`;
  fh+=`<button class="pill ${window._tierExcludeMale?'on':''}" style="flex-shrink:0;white-space:nowrap" onclick="window._tierExcludeMale=!window._tierExcludeMale;render()">남자 제외</button>`;
  fh+=`</div>`;
  // ── 뷰 전환 버튼 (필터/정렬 아래 별도 행, 오른쪽 정렬) ──
  const _viewModes=[
    {id:'table',      icon:'📋', title:'테이블'},
    {id:'magazine',   icon:'📷', title:'매거진/룩북'},
    {id:'podium',     icon:'🏆', title:'포디움'},
    {id:'tier-group', icon:'🎖️', title:'티어별 그룹'},
    {id:'compact',    icon:'📝', title:'컴팩트'},
  ];
  if(!window._tierViewMode) window._tierViewMode = (()=>{try{return localStorage.getItem('su_tier_view_mode')||'table';}catch(e){return 'table';}})();
  fh+=`<div class="tier-view-row">`;
  fh+=`<span class="tier-view-row-label">🎛️ 모드</span>`;
  fh+=`<div class="tier-view-row-btns">`;
  _viewModes.forEach(vm=>{
    const on=window._tierViewMode===vm.id;
    fh+=`<button class="tier-view-btn ${on?'on':''}" title="${vm.title}" onclick="window._tierViewMode='${vm.id}';try{localStorage.setItem('su_tier_view_mode','${vm.id}');}catch(e){}render()"><span class="tier-view-btn-icon">${vm.icon}</span><span class="tier-view-btn-label">${vm.title}</span></button>`;
  });
  fh+=`</div></div>`;
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
    allU.forEach(u=>{fh+=`<button class="pill ${_fUniv===u.name?'on':''}" style="flex-shrink:0;${_fUniv===u.name?`background:${u.color};border-color:${u.color};color:#fff`:''}" onclick="sf('${escJS(u.name)}','${_fTier}')">${u.name}</button>`;});
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
    // ── 4행: 종족 (flex-wrap) ──
    fh+=`<div class="tier-filter-sub">종족</div>`;
    fh+=`<div class="fbar" style="flex-wrap:wrap;gap:6px">`;
    ['전체','T','Z','P'].forEach(r=>{
      fh+=`<button class="pill ${window._tierRaceFilter===r?'on':''}" onclick="window._tierRaceFilter='${r}';render()">${r==='전체'?'전체':r}</button>`;
    });
    fh+=`</div></section>`;

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
  const _isNarrow = (typeof window !== 'undefined' && window.innerWidth <= 400); // 초소형 폰(320~400px) 추가 대응
  const _pad = _isMb ? (_isNarrow?'4px 3px':'5px 4px') : '8px 10px';
  const _padRT = _isMb ? (_isNarrow?'4px 1px':'5px 2px') : '8px 10px'; // 순위/티어 칸: 간격을 좁혀 이름 쪽에 폭을 더 확보
  const _padName = _isMb ? (_isNarrow?'8px 4px':'9px 6px') : '8px 12px';
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
  const _wrapStyle = _isMb
    ? `overflow-x:hidden;width:100%`
    : `overflow-x:auto;-webkit-overflow-scrolling:touch;width:100%`;
  const _tableStyle = _isMb
    ? `table-layout:fixed;width:100%;max-width:100%`
    : `table-layout:auto;width:100%;min-width:1120px;max-width:1600px;margin:0 auto`;
  const _mbNcols = 10 + (_li?1:0);
  // 모바일: 숨김 컬럼을 제외한 5개 컬럼(순위/티어/이름/승률/포인트)의 폭을 %로 고정해
  // 합계가 항상 100%가 되도록 해서 가로 슬라이드 없이 한 화면에 다 보이게 함
  const _mbColgroup = _isMb ? `<colgroup>
      <col style="width:7%"><col style="width:11%"><col class="col-hide-mobile"><col style="width:54%">
      <col class="col-hide-mobile"><col class="col-hide-mobile"><col style="width:14%"><col style="width:14%">
      <col class="col-hide-mobile"><col class="col-hide-mobile">${_li?'<col class="col-hide-mobile">':''}
    </colgroup>` : '';
  h=`<div class="tier-content-card"><div class="tier-table-wrap" style="${_wrapStyle}">
    <table class="tier-table" style="${_tableStyle}">${_mbColgroup}<thead><tr>
      <th style="text-align:center;white-space:nowrap;padding:${_padRT}">순위</th>
      <th class="tier-th-tier" style="text-align:center;white-space:nowrap;padding:${_padRT}">티어</th>
      <th class="col-hide-mobile" style="text-align:center;white-space:nowrap;padding:${_pad}">대학</th>
      ${_isMb?'':`<th style="text-align:center;white-space:nowrap;padding:${_pad}">종족</th>`}
      <th style="text-align:left;white-space:nowrap;padding:${_padName}">이름</th>
      <th class="col-hide-mobile" style="text-align:center;white-space:nowrap;padding:${_pad}">승</th>
      <th class="col-hide-mobile" style="text-align:center;white-space:nowrap;padding:${_pad}">패</th>
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
    else rnkHTML=`<span style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:${_isMb?12:13}px">${i+1}위</span>`;
    const extraVal=_getExtraVal(p);
    const univIconHTML=_getUnivIconHTML(p);
    const _pSafe=(typeof escJS==='function') ? escJS(p.name) : (p.name||'').replace(/\\/g,'\\\\').replace(/'/g,"\\'").replace(/\r/g,'\\r').replace(/\n/g,'\\n');
    const _pAttr=(typeof escAttr==='function')
      ? escAttr(String(p.name||'').replace(/[\r\n]+/g,' '))
      : String(p.name||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/[\r\n]+/g,' ');
    const _modePick = hasTypeSet && window._tierTypeSet.size===1 ? [...window._tierTypeSet][0] : (!hasTypeSet ? tierRankMode : '');
    const _clickHist = (_canGoHist && _modePick) ? `onclick="event.stopPropagation();tierRankGoHist('${_modePick}','${_pSafe}')"` : '';
    const _actHTML=_getActHTML(p);
    const _elo = (p.elo||ELO_DEFAULT);
    h+=`<tr class="${i===0?'top1':i===1?'top2':i===2?'top3':''}" style="border-left:3px solid ${col};background:${_getUnivBg(p.univ,.06)};cursor:pointer" data-tp-action="open-player" data-tp-player="${_pAttr}">
      <td style="text-align:center;white-space:nowrap;padding:${_padRT}">${rnkHTML}</td>
      <td style="text-align:center;white-space:nowrap;padding:${_padRT}">${_getTierBadge(p.tier)}</td>
      <td class="col-hide-mobile" style="text-align:center;white-space:nowrap;padding:${_pad}">
        <span class="ubadge tier-univ-badge clickable-univ" data-icon-done="1"
          style="background:${col};font-size:${_isMb?11:13}px;max-width:${_isMb?90:120}px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap"
          onclick="event.stopPropagation();openUnivModal('${p.univ}')"
        >${univIconHTML}${p.univ}</span>
      </td>
      ${_isMb?'':`<td style="text-align:center;white-space:nowrap;padding:${_pad}"><span class="rbadge r${p.race}">${p.race}</span></td>`}
      <td style="text-align:left;white-space:nowrap;padding:${_padName};font-weight:700;min-width:0">
        <span style="display:inline-flex;align-items:center;gap:${_isMb?'6px':'6px'};min-width:0;max-width:100%">
          <span class="tier-avatar-wrap">${getPlayerPhotoHTML(p.name,_isMb?(_isNarrow?'60px':'72px'):'40px','',{lazy:true})}${_isMb?`<span class="tier-avatar-race rbadge r${p.race}">${p.race}</span>`:''}</span>
          <span class="clickable-name" style="min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;cursor:pointer" data-tp-action="open-player" data-tp-player="${_pAttr}">${p.name}</span>
          <span class="tier-name-badges" style="flex-shrink:0;display:inline-flex;align-items:center;gap:3px">${genderIcon(p.gender)}${_getStatusIcon(p.name)}</span>
        </span>
      </td>
      <td class="col-hide-mobile" style="text-align:center;white-space:nowrap;padding:${_pad};font-weight:900;color:var(--win-col);cursor:pointer" data-tp-action="open-player" data-tp-player="${_pAttr}">${rec.w}</td>
      <td class="col-hide-mobile" style="text-align:center;white-space:nowrap;padding:${_pad};font-weight:900;color:var(--lose-col);cursor:pointer" data-tp-action="open-player" data-tp-player="${_pAttr}">${rec.l}</td>
      <td style="text-align:center;white-space:nowrap;padding:${_pad};font-weight:800;font-size:${_isMb?'11px':''};color:${tot===0?'var(--gray-l)':wr>=50?'var(--green)':'var(--red)'};cursor:pointer" data-tp-action="open-player" data-tp-player="${_pAttr}">${tot?wr+'%':'-'}</td>
      <td style="text-align:center;white-space:nowrap;padding:${_pad};font-size:${_isMb?'11px':''};cursor:pointer;${_canGoHist?'text-decoration:underline dotted':''}" ${_clickHist||`data-tp-action="open-player" data-tp-player="${_pAttr}"`} title="${_canGoHist?'대전기록탭에서 보기':'스트리머 상세'}">${extraVal}</td>
      <td class="col-hide-mobile" style="text-align:center;white-space:nowrap;padding:${_pad};font-weight:800;color:${_elo>=ELO_DEFAULT?'#2563eb':'#dc2626'};cursor:pointer" data-tp-action="open-player" data-tp-player="${_pAttr}">${_elo}</td>
      <td class="col-hide-mobile" style="text-align:center;white-space:nowrap;padding:${_pad}">${_actHTML}</td>
      ${_li?`<td class="no-export col-hide-mobile" style="text-align:center;white-space:nowrap;padding:${_pad}">${adminBtn(`<button class="btn btn-w btn-xs" onclick="event.stopPropagation();openEPFromModal('${_pSafe}')">✏️ 수정</button>`)}</td>`:''}
    </tr>
    <tr class="tier-mobile-info-row" style="border-left:3px solid ${col};background:${_getUnivBg(p.univ,.06)};cursor:pointer" data-tp-action="open-player" data-tp-player="${_pAttr}">
      <td colspan="${_mbNcols}">
        <div class="tier-mobile-meta" style="cursor:pointer" data-tp-action="open-player" data-tp-player="${_pAttr}">
          <span class="tmm-univ">${p.univ||'무소속'}</span>
          <span class="tmm-sep">·</span>
          <span class="tmm-rec"><b class="w">${rec.w}승</b> <b class="l">${rec.l}패</b></span>
          <span class="tmm-sep">·</span>
          <span class="tmm-elo">${_hasDateFilter?'현재 ':''}ELO ${_elo}</span>
        </div>
      </td>
    </tr>`;
  });
  h+=`</tbody></table></div></div>`;
  }

  // ════════════════════════════════════════════
  // 뷰2: PODIUM (포디움 + 나머지 리스트)
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
    const _photoRaw = p.photo || (window.playerPhotos && window.playerPhotos[p.name]) || '';
    const _photoUrl = _photoRaw ? (typeof toHttpsUrl==='function'?toHttpsUrl(_photoRaw):_photoRaw) : '';
    const _initial = String(p.name||'-').trim().slice(0,1);
    const _2ndImg = (typeof _phSwap2ndHTML==='function') ? _phSwap2ndHTML(p.secondProfileFile) : '';
    const _hasPhoto = !!_photoUrl;
    return `<article class="tier-podium-card place-${place} ${_hasPhoto?'ph-swap':''} ${_isTpPlayerSelected(p.name)?'is-selected':''}" data-tp-action="open-player" data-tp-player="${_pAttr}" style="--selected-accent:${col};border:2.5px solid ${col}">
      ${_hasPhoto?`<img class="tier-podium-bg" src="${_photoUrl}" alt="${p.name||''}" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`:''}
      ${_2ndImg}
      <div class="tier-podium-bg-fallback" style="${_hasPhoto?'display:none':'display:flex'};background:${col}">${_initial}</div>
      <div class="tier-podium-rankline">
        <span class="tier-podium-medal">${medal} ${place}위</span>
      </div>
      <div class="tier-podium-main ${place===1?'tier-podium-main--hero':''}">
        <div class="tier-podium-copy">
          <div class="tier-podium-name">${p.name}${genderIcon(p.gender)}</div>
          <div class="tier-podium-sub">
            ${_getTierBadge(p.tier)}
            <span class="rbadge r${p.race}" style="font-size:10px">${p.race||'?'}</span>
            <span class="tier-univ-badge" style="background:${col};font-size:10px;max-width:${place===1?140:110}px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;cursor:pointer" onclick="event.stopPropagation();if(typeof openUnivModal==='function')openUnivModal('${(p.univ||'').replace(/\\/g,'\\\\').replace(/'/g,"\\'")}');">${p.univ||'무소속'}</span>
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
          <span class="tier-podium-statbox-value" style="color:${tot===0?'rgba(255,255,255,.7)':wr>=50?'#86efac':'#fecaca'}">${tot?wr+'%':'-'}</span>
        </div>
        <div class="tier-podium-statbox">
          <span class="tier-podium-statbox-label">${extraHeader}</span>
          <span class="tier-podium-statbox-value">${extraVal}</span>
        </div>
      </div>
      <div class="tier-podium-foot">
        <span class="tier-podium-stat" style="color:${tot===0?'rgba(255,255,255,.7)':wr>=50?'#86efac':'#fecaca'}">${tot?`${tot}전 ${wr}%`:'공식전 없음'}</span>
      </div>
    </article>`;
  };
  h=`<div class="tier-content-card"><div class="tier-podium-wrap">
    <section class="tier-podium-stage">
      <div class="tier-podium-lane">${_podiumCard(top1,1)}</div>
      <div class="tier-podium-lane">${_podiumCard(top2,2)}</div>
      <div class="tier-podium-lane">${_podiumCard(top3,3)}</div>
    </section>`;
  if(rest.length){
    h+=`<section class="tier-podium-rest">
      <div class="tier-podium-rest-grid">`;
    rest.forEach((p,i)=>{
      const ri=i+4; const col=_getUnivColor(p.univ);
      const rec=_tierWL(p); const tot=rec.tot; const wr=rec.wr;
      const _pAttr=(typeof escAttr==='function')
        ? escAttr(String(p.name||'').replace(/[\r\n]+/g,' '))
        : String(p.name||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/[\r\n]+/g,' ');
      const _photoRaw = p.photo || (window.playerPhotos && window.playerPhotos[p.name]) || '';
      const _photoUrl = _photoRaw ? (typeof toHttpsUrl==='function'?toHttpsUrl(_photoRaw):_photoRaw) : '';
      const _initial = String(p.name||'-').trim().slice(0,1);
      const _2ndImg = (typeof _phSwap2ndHTML==='function') ? _phSwap2ndHTML(p.secondProfileFile) : '';
      const _hasPhoto = !!_photoUrl;
      h+=`<article class="tier-podium-rest-item ${_hasPhoto?'ph-swap':''} ${_isTpPlayerSelected(p.name)?'is-selected':''}" data-tp-action="open-player" data-tp-player="${_pAttr}" style="--selected-accent:${col};border:2px solid ${col}">
        ${_hasPhoto?`<img class="tier-podium-rest-photo" src="${_photoUrl}" alt="${p.name||''}" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`:''}
        ${_2ndImg}
        <div class="tier-podium-rest-fallback" style="${_hasPhoto?'display:none':'display:flex'};background:${col}">${_initial}</div>
        <span class="tier-podium-rest-rankchip">${ri}위</span>
        <div class="tier-podium-rest-bottom">
          <div class="tier-podium-rest-name">${p.name}${genderIcon(p.gender)}</div>
          <div class="tier-podium-rest-subline">
            ${_getTierBadge(p.tier)}
            <span class="rbadge r${p.race}" style="font-size:9px">${p.race||'?'}</span>
            <span class="ubadge tier-univ-badge" style="background:${col};font-size:9px;padding:1px 6px;max-width:92px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;cursor:pointer" onclick="event.stopPropagation();if(typeof openUnivModal==='function')openUnivModal('${(p.univ||'').replace(/\\/g,'\\\\').replace(/'/g,"\\'")}');">${p.univ||'무소속'}</span>
          </div>
          <div class="tier-podium-rest-metrics">
            <div class="tier-podium-statbox">
              <span class="tier-podium-statbox-label">전적</span>
              <span class="tier-podium-statbox-value">${rec.w}W ${rec.l}L</span>
            </div>
            <div class="tier-podium-statbox">
              <span class="tier-podium-statbox-label">승률</span>
              <span class="tier-podium-statbox-value" style="color:${tot===0?'rgba(255,255,255,.7)':wr>=50?'#86efac':'#fecaca'}">${tot?wr+'%':'-'}</span>
            </div>
          </div>
        </div>
      </article>`;
    });
    h+=`</div></section>`;
  }
  h+=`</div></div>`;
  }

  // ════════════════════════════════════════════
  // 뷰3: COMPACT (초밀도 리스트)
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
            <span class="ubadge tier-univ-badge" style="background:${col};font-size:9px;padding:1px 6px;max-width:${_isMb?82:96}px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;cursor:pointer" onclick="event.stopPropagation();if(typeof openUnivModal==='function')openUnivModal('${(p.univ||'').replace(/\\/g,'\\\\').replace(/'/g,"\\'")}');">${p.univ}</span>
          </div>
        </div>
      </div>
      <div class="tier-compact-metrics">
        <div class="tier-compact-metric">
          <span class="tier-compact-metric-label">전적</span>
          <span class="tier-compact-metric-value"><span style="color:var(--win-col)">${rec.w}</span>W <span style="color:var(--lose-col)">${rec.l}</span>L</span>
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
  // 뷰4: TIER-GROUP (티어별 그룹)
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
      <div class="tier-group-grid" style="grid-template-columns:repeat(auto-fill,minmax(${_isNarrow?'104px':(_isMb?'130px':'160px')},1fr));gap:${_isNarrow?'5px':(_isMb?'6px':'8px')}">`;
    grp.players.forEach(({p,i})=>{
      const rec=_tierWL(p); const col=_getUnivColor(p.univ); const tot=rec.tot; const wr=rec.wr;
      const _pAttr=(typeof escAttr==='function')
        ? escAttr(String(p.name||'').replace(/[\r\n]+/g,' '))
        : String(p.name||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/[\r\n]+/g,' ');
      const _photoRaw = p.photo || (window.playerPhotos && window.playerPhotos[p.name]) || '';
      const _photoUrl = _photoRaw ? (typeof toScaledUrl==='function'?toScaledUrl(_photoRaw,220):_photoRaw) : '';
      const _initial = String(p.name||'-').trim().slice(0,1);
      const _2ndImg = (typeof _phSwap2ndHTML==='function') ? _phSwap2ndHTML(p.secondProfileFile) : '';
      const _hasPhoto = !!_photoUrl;
      h+=`<div class="tier-group-card ${_hasPhoto?'ph-swap':''} ${_isTpPlayerSelected(p.name)?'is-selected':''}" data-tp-action="open-player" data-tp-player="${_pAttr}" style="--selected-accent:${col};border:2px solid ${col}">
        ${_hasPhoto?`<img class="tier-group-photo" src="${_photoUrl}" alt="${p.name||''}" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`:''}
        ${_2ndImg}
        <div class="tier-group-fallback" style="${_hasPhoto?'display:none':'display:flex'};background:${col}">${_initial}</div>
        <span class="tier-group-rank">${i+1}위</span>
        <div class="tier-group-bottom">
          <span class="tier-group-name">${p.name}${genderIcon(p.gender)}</span>
          <div class="tier-group-pills">
            <span class="rbadge r${p.race}" style="font-size:9px">${p.race}</span>
            <span class="ubadge tier-univ-badge" data-icon-done="1" style="background:${col};font-size:9px;padding:1px 6px;max-width:80px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;cursor:pointer" onclick="event.stopPropagation();if(typeof openUnivModal==='function')openUnivModal('${(p.univ||'').replace(/\\/g,'\\\\').replace(/'/g,"\\'")}');event.stopPropagation()">${p.univ}</span>
          </div>
          <div class="tier-group-wr" style="color:${tot===0?'rgba(255,255,255,.7)':wr>=50?'#86efac':'#fecaca'}">${tot?wr+'%':'-'} (${rec.w}W${rec.l}L)</div>
        </div>
      </div>`;
    });
    h+=`</div></div>`;
  });
  }

  // ════════════════════════════════════════════
  // 뷰5: MAGAZINE (매거진/룩북 스타일)
  // ════════════════════════════════════════════
  else if(_vm==='magazine'){
  h=`<div class="tier-content-card"><div class="tier-mag-grid" style="grid-template-columns:repeat(auto-fill,minmax(${_isNarrow?'128px':(_isMb?'150px':'220px')},1fr));gap:${_isNarrow?'8px':(_isMb?'12px':'20px')}">`;
  list.forEach((p,i)=>{
    const rec=_tierWL(p); const col=_getUnivColor(p.univ); const tot=rec.tot; const wr=rec.wr;
    const _pAttr=(typeof escAttr==='function')
      ? escAttr(String(p.name||'').replace(/[\r\n]+/g,' '))
      : String(p.name||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/[\r\n]+/g,' ');
    const _photoRaw = p.photo || (window.playerPhotos && window.playerPhotos[p.name]) || '';
    const _photoUrl = _photoRaw ? (typeof toScaledUrl==='function'?toScaledUrl(_photoRaw,320):_photoRaw) : '';
    const _initial = String(p.name||'-').trim().slice(0,1);
    const _2ndImg = (typeof _phSwap2ndHTML==='function') ? _phSwap2ndHTML(p.secondProfileFile) : '';
    const _hasPhoto = !!_photoUrl;
    const extraVal=_getExtraVal(p);
    h+=`<div class="tier-mag-card ${_isTpPlayerSelected(p.name)?'is-selected':''}" data-tp-action="open-player" data-tp-player="${_pAttr}" style="--selected-accent:${col};box-shadow:0 0 0 2px ${col}45,0 14px 30px rgba(15,23,42,.16)">
      ${_hasPhoto?`<img class="tier-mag-photo" src="${_photoUrl}" alt="${p.name||''}" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`:''}
      ${_2ndImg}
      <div class="tier-mag-fallback" style="${_hasPhoto?'display:none':'display:flex'};background:${col}">${_initial}</div>
      <span class="tier-mag-spine" style="background:${col}"></span>
      <span class="tier-mag-rank" style="background:${col}">${i+1}위</span>
      <div class="tier-mag-bottom" style="background:linear-gradient(180deg,${col}00 0%,${col}2e 42%,rgba(6,10,24,.72) 66%,rgba(3,6,18,.94) 100%)">
        <div class="tier-mag-panel">
          <div class="tier-mag-panel-row"><span class="tier-mag-panel-label">대학</span><span>${p.univ||'무소속'}</span></div>
          <div class="tier-mag-panel-row"><span class="tier-mag-panel-label">전적</span><span>${tot?`${rec.w}W ${rec.l}L`:'기록 없음'}</span></div>
          <div class="tier-mag-panel-row"><span class="tier-mag-panel-label">${extraHeader}</span><span>${extraVal||'-'}</span></div>
        </div>
        <div class="tier-mag-baseline">
          <div class="tier-mag-baseline-text">
            <div class="tier-mag-eyebrow">${p.tier||'?'}티어 · ${p.race||'?'}</div>
            <div class="tier-mag-name">${p.name}${genderIcon(p.gender)}</div>
          </div>
          <span class="tier-mag-wr-chip" style="border-color:${col}">${tot?wr+'%':'-'}</span>
        </div>
      </div>
    </div>`;
  });
  h+=`</div></div>`;
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
