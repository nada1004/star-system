/* ══════════════════════════════════════════════════════════════
   🏛️ 대학 리포트 — "스트리머 리포트"와 같은 톤의 대학 단위 종합 리포트
   (검색/선택 → 히어로 → 기본 정보 → 종족/티어 구성 → 팀 내 다승왕/연승 리더
    → 라이벌 대학 상대전적 → 로스터 → 최근 경기)
   ══════════════════════════════════════════════════════════════ */

function _urInjectStyle(){
  if (typeof document==='undefined') return;
  if (document.getElementById('ur-report-style')) return;
  const s = document.createElement('style');
  s.id = 'ur-report-style';
  s.textContent = [
    '.ur-univ-picker-wrap{display:flex;flex-direction:column;gap:10px}',
    '.ur-recent-wrap{display:flex;align-items:center;gap:6px;flex-wrap:wrap}',
    '.ur-recent-lbl{font-size:11px;font-weight:800;color:var(--text3);flex-shrink:0}',
    '.ur-recent-chip{padding:4px 11px;border-radius:999px;border:1px solid var(--border2);background:var(--white);color:var(--text2);font-size:11px;font-weight:700;cursor:pointer;transition:border-color .12s,color .12s}',
    '.ur-recent-chip:hover{border-color:var(--ur-accent,var(--blue));color:var(--ur-accent,var(--blue))}',
    'body.dark .ur-recent-chip{background:rgba(15,23,42,.7);border-color:#334155;color:var(--text2)}',
    '.ur-univ-picker-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(92px,1fr));gap:8px}',
    '.ur-univ-btn{display:flex;flex-direction:column;align-items:center;gap:5px;padding:10px 6px 9px;border-radius:14px;border:1.5px solid var(--border2);background:var(--white);cursor:pointer;transition:transform .14s,box-shadow .14s,border-color .14s;font-family:inherit}',
    '.ur-univ-btn:hover{transform:translateY(-2px);box-shadow:0 10px 20px rgba(15,23,42,.1);border-color:var(--ubtn-col)}',
    '.ur-univ-btn:active{transform:translateY(0) scale(.96);transition-duration:.06s}',
    '.ur-univ-btn.is-sel{border-color:var(--ubtn-col);background:linear-gradient(180deg,color-mix(in srgb,var(--ubtn-col) 12%,var(--white)),var(--white));box-shadow:0 0 0 2px color-mix(in srgb,var(--ubtn-col) 30%,transparent)}',
    '.ur-univ-btn-logo{width:32px;height:32px;border-radius:50%;overflow:hidden;display:flex;align-items:center;justify-content:center;font-size:16px;background:var(--surface);flex-shrink:0}',
    '.ur-univ-btn-logo img{width:100%;height:100%;object-fit:cover}',
    '.ur-univ-btn-name{font-size:10.5px;font-weight:800;color:var(--text2);max-width:80px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
    '.ur-univ-btn.is-sel .ur-univ-btn-name{color:var(--ubtn-col)}',
    'body.dark .ur-univ-btn{background:rgba(15,23,42,.7);border-color:#334155}',
    'body.dark .ur-univ-btn.is-sel{background:linear-gradient(180deg,color-mix(in srgb,var(--ubtn-col) 22%,rgba(15,23,42,.7)),rgba(15,23,42,.7))}',
    '.ur-nav-bar{display:flex;gap:6px;flex-wrap:wrap;margin:2px 0 14px;padding:8px;border-radius:14px;background:var(--surface);border:1px solid var(--border2)}',
    '.ur-nav-chip{padding:5px 12px;border-radius:999px;border:1px solid var(--border2);background:var(--white);color:var(--text2);font-size:11px;font-weight:800;cursor:pointer;white-space:nowrap;transition:transform .12s,box-shadow .12s,color .12s,border-color .12s}',
    '.ur-nav-chip:hover{color:var(--ur-accent,var(--blue));border-color:var(--ur-accent,var(--blue));transform:translateY(-1px);box-shadow:0 4px 10px color-mix(in srgb, var(--ur-accent,#2563eb) 15%, transparent)}',
    'body.dark .ur-nav-bar{background:rgba(15,23,42,.5);border-color:#334155}',
    'body.dark .ur-nav-chip{background:rgba(15,23,42,.7);border-color:#334155;color:var(--text2)}',
    '.ur-trend-chart{display:flex;align-items:flex-end;gap:6px;height:96px;padding-top:6px;border-bottom:1.5px solid var(--border2)}',
    '.ur-trend-col{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;height:100%;gap:5px}',
    '.ur-trend-count{font-size:10px;font-weight:900;color:var(--text2)}',
    '.ur-trend-bar{width:100%;max-width:28px;border-radius:6px 6px 3px 3px;transition:height .5s ease}',
    '.ur-trend-day{font-size:9px;font-weight:800;color:var(--text3);padding-top:6px}',
    'body.dark .ur-trend-chart{border-bottom-color:#334155}',
    '.ur-subsec-lbl{font-size:10.5px;font-weight:800;color:var(--text3);letter-spacing:.4px;margin-bottom:8px;text-transform:uppercase}',
    '.ur-subsec-divider{height:1px;background:var(--border2);margin:0 0 14px}',
    'body.dark .ur-subsec-divider{background:#334155}',
    '.ur-two-col{display:grid;grid-template-columns:minmax(0,1.3fr) minmax(0,1fr);gap:14px;align-items:start;margin-bottom:14px}',
    '.ur-two-col-left,.ur-two-col-right{display:flex;flex-direction:column;gap:14px;min-width:0}',
    '.ur-two-col .ur-panel{margin-bottom:0}',
    '@media(max-width:860px){.ur-two-col{grid-template-columns:1fr}}',
    '.ur-empty{padding:60px 20px;text-align:center;color:var(--text2)}',
    '.ur-hero{display:flex;align-items:center;flex-wrap:wrap;gap:16px;padding:22px 24px;border-radius:20px;border:1px solid rgba(148,163,184,.18);box-shadow:0 18px 32px rgba(15,23,42,.06);margin:14px 0;position:relative;overflow:hidden}',
    '.ur-hero::after{content:"";position:absolute;left:0;top:0;width:5px;height:100%;background:var(--ur-hero-accent,transparent)}',
    '.ur-hero-logo{width:72px;height:72px;flex-shrink:0;display:flex;align-items:center;justify-content:center;background:transparent;box-shadow:none;position:relative;z-index:1}',
    '.ur-hero>div:not(.ur-hero-logo),.ur-hero-actions{position:relative;z-index:1}',
    '.ur-hero-logo img{width:96%;height:96%;object-fit:contain;filter:drop-shadow(0 4px 10px rgba(15,23,42,.18))}',
    '.ur-hero-name{font-size:24px;font-weight:950;letter-spacing:-.03em;color:var(--text1)}',
    '.ur-hero-badges{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}',
    '.ur-hero-actions{display:flex;gap:6px;flex-shrink:0;margin-left:auto;align-self:flex-start}',
    '@media(max-width:640px){.ur-hero-actions{margin-left:0;align-self:stretch;width:100%;justify-content:flex-end;order:3}}',
    '.ur-badge{display:inline-flex;align-items:center;gap:5px;padding:5px 11px;border-radius:999px;background:rgba(255,255,255,.7);border:1px solid rgba(148,163,184,.22);font-size:11.5px;font-weight:800;color:var(--text2)}',
    '.ur-btn{display:inline-flex;align-items:center;gap:5px;padding:8px 13px;border-radius:12px;font-size:12px;font-weight:800;cursor:pointer;border:1.5px solid var(--border2);background:var(--white);color:var(--text2);white-space:nowrap;transition:transform .12s,box-shadow .12s}',
    '.ur-btn:hover{transform:translateY(-1px);box-shadow:0 6px 14px rgba(15,23,42,.12)}',
    '.ur-btn-primary{background:var(--blue);border-color:var(--blue);color:#fff}',
    '.ur-kpi-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:10px;margin-bottom:14px}',
    '@media(max-width:700px){.ur-kpi-grid{grid-template-columns:repeat(3,1fr)}}',
    '@media(max-width:420px){.ur-kpi-grid{grid-template-columns:repeat(2,1fr)}}',
    '.ur-kpi{border-radius:16px;padding:13px 10px;text-align:center;border:1px solid rgba(148,163,184,.16);background:var(--white);box-shadow:0 10px 18px rgba(15,23,42,.04)}',
    '.ur-kpi-num{font-size:20px;font-weight:900;line-height:1.1}',
    '.ur-kpi-lbl{font-size:10.5px;font-weight:700;color:var(--text3);margin-top:3px}',
    '.ur-panel{background:var(--white);border:1px solid rgba(148,163,184,.16);border-radius:18px;padding:16px;box-shadow:0 14px 26px rgba(15,23,42,.04);margin-bottom:14px}',
    '.ur-panel-title{font-size:14px;font-weight:900;color:var(--text1);margin-bottom:12px;display:flex;align-items:center;gap:6px}',
    '.ur-roster-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(112px,1fr));gap:10px}',
    '.ur-roster-card{position:relative;aspect-ratio:.78;border-radius:16px;overflow:hidden;cursor:pointer;background:#0b1120;isolation:isolate;transition:transform .18s ease,box-shadow .18s ease}',
    '.ur-roster-card:hover{transform:translateY(-3px);box-shadow:0 16px 30px rgba(15,23,42,.2)!important}',
    '.ur-roster-card:active{transform:translateY(-1px) scale(.97);transition-duration:.06s}',
    '.ur-roster-photo{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:top center;z-index:0;transition:transform .4s ease}',
    '.ur-roster-card:hover .ur-roster-photo{transform:scale(1.06)}',
    '.ur-roster-fallback{position:absolute;inset:0;align-items:center;justify-content:center;font-size:32px;font-weight:900;color:#fff;z-index:0}',
    '.ur-roster-bottom{position:absolute;left:0;right:0;bottom:0;z-index:2;padding:8px 8px 9px;display:flex;flex-direction:column;gap:4px;background:linear-gradient(180deg,rgba(2,4,14,0) 0%,rgba(2,4,14,.05) 28%,rgba(2,4,14,.32) 56%,rgba(2,4,14,.7) 82%,rgba(2,4,14,.86) 100%)}',
    '.ur-roster-sort-wrap{display:flex;align-items:center;gap:4px;margin-left:auto}',
    '.ur-roster-sort{font-size:10.5px;font-weight:800;color:var(--text2);background:var(--surface);border:1px solid var(--border2);border-radius:8px;padding:4px 8px;cursor:pointer}',
    'body.dark .ur-roster-sort{background:rgba(15,23,42,.7);border-color:#334155;color:var(--text2)}',
    '.ur-rival-logo,.ur-recent-avatar{width:20px;height:20px;border-radius:50%;overflow:hidden;flex-shrink:0;display:inline-flex;align-items:center;justify-content:center;background:var(--surface);font-size:10px}',
    '.ur-rival-logo img,.ur-recent-avatar img{width:100%;height:100%;object-fit:cover}',
    '.ur-recent-inline{display:inline-flex;align-items:center;gap:8px;max-width:100%;overflow:hidden}',
    '.ur-recent-name-cell,.ur-recent-opp-cell{overflow:hidden}',
    '.ur-recent-name-cell span:not(.ur-recent-avatar),.ur-recent-opp-cell span:not(.ur-recent-avatar){overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
    '.ur-vs-label{color:var(--text3);font-weight:800;font-size:10.5px;flex-shrink:0}',
    '.ur-roster-name{font-size:11.5px;font-weight:900;color:#fff;text-shadow:0 1px 3px rgba(0,0,0,.7),0 2px 8px rgba(0,0,0,.5);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
    '.ur-roster-tier{font-size:9px;font-weight:900;padding:1px 7px;border-radius:999px;align-self:flex-start;box-shadow:0 2px 6px rgba(0,0,0,.25)}',
    '.ur-list-box{max-width:100%;border:1px solid var(--border2);border-radius:14px;overflow:hidden;padding:2px 10px}',
    '.ur-winner-row,.ur-rival-row{display:flex;align-items:center;gap:9px;padding:9px 6px;border-radius:0;cursor:pointer;transition:background .12s}',
    '.ur-winner-row.is-alt,.ur-rival-row.is-alt{background:rgba(148,163,184,.05)}',
    '.ur-winner-row:hover,.ur-rival-row:hover{background:var(--blue-l,rgba(37,99,235,.06))}',
    '.ur-winner-row:hover,.ur-rival-row:hover{background:var(--surface)}',
    '.ur-winner-row+.ur-winner-row,.ur-rival-row+.ur-rival-row{border-top:1px solid var(--border2)}',
    '.ur-mini-avatar{width:28px;height:28px;border-radius:var(--su_profile_radius,50%);clip-path:var(--su_profile_clip,none);overflow:hidden;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:900;color:#fff}',
    '.ur-mini-avatar img{width:100%;height:100%;object-fit:cover}',
    '.ur-bar-track{flex:1;height:14px;border-radius:999px;overflow:hidden;background:var(--border2)}',
    '.ur-recent-table{width:100%;table-layout:auto;border-collapse:collapse;font-size:12px}',
    '.ur-recent-table thead th{padding:6px 6px;text-align:left;font-size:10px;font-weight:800;color:var(--text3);border-bottom:1.5px solid var(--border2);white-space:nowrap}',
    '.ur-recent-table td{padding:7px 6px;border-bottom:1px solid var(--border2)}',
    '.ur-recent-table td:nth-child(2){padding-left:12px}',
    '.ur-recent-table td:nth-child(3){padding-left:12px}',
    '.ur-recent-table tr:last-child td{border-bottom:none}',
    '.ur-recent-row{position:relative;transition:background .12s}',
    '.ur-recent-row:hover td{background:var(--surface)}',
    '.ur-recent-row td:first-child{position:relative}',
    '.ur-recent-row.is-win td:first-child::before{content:"";position:absolute;left:0;top:0;bottom:0;width:3px;background:#dc2626;border-radius:2px}',
    '.ur-recent-row.is-lose td:first-child::before{content:"";position:absolute;left:0;top:0;bottom:0;width:3px;background:#2563eb;border-radius:2px}',
    '.ur-recent-result{display:inline-flex;align-items:center;justify-content:center;min-width:32px;padding:2px 8px;border-radius:7px;font-size:10px;font-weight:900;letter-spacing:.2px}',
    '.ur-recent-result.is-win{background:#fee2e2;color:#dc2626;border:1px solid #fca5a5}',
    '.ur-recent-result.is-lose{background:#dbeafe;color:#2563eb;border:1px solid #93c5fd}',
    '.ur-recent-map{cursor:pointer;border-bottom:1px dotted var(--text3);padding-bottom:1px;font-weight:800;color:var(--text2)}',
    '.ur-recent-mode{display:inline-flex;align-items:center;padding:2px 7px;border-radius:6px;font-size:9.5px;font-weight:900;color:#fff;white-space:nowrap}',
    '.ur-recent-map:hover{color:var(--blue)!important;border-bottom-color:var(--blue)}',
    'body.dark .ur-recent-row:hover td{background:rgba(148,163,184,.08)}',
    'body.dark .ur-recent-result.is-win{background:#7f1d1d33;color:#f87171;border-color:#7f1d1d}',
    'body.dark .ur-recent-result.is-lose{background:#1e3a5f66;color:#93c5fd;border-color:#1e3a5f}',
    '.ur-tr-matrix-wrap{overflow-x:auto}',
    '.ur-tr-matrix{width:100%;border-collapse:collapse;font-size:12px;min-width:420px}',
    '.ur-tr-matrix th{padding:6px 8px;font-size:11px;font-weight:800;color:var(--text3);text-align:center;border-bottom:1.5px solid var(--border2)}',
    '.ur-tr-matrix th:first-child{text-align:left}',
    '.ur-tr-matrix td{padding:7px 8px;text-align:center;border-bottom:1px solid var(--border2);font-weight:700;color:var(--text2)}',
    '.ur-tr-matrix td:first-child{text-align:left}',
    '.ur-tr-matrix tr:last-child td{border-bottom:none}',
    '.ur-tr-tier-badge{display:inline-flex;align-items:center;padding:2px 9px;border-radius:7px;font-size:11px;font-weight:900}',
    '.ur-tr-wr{font-weight:900}',
    '.ur-tr-g{display:block;font-size:10px;font-weight:600;color:var(--text3);margin-top:1px}',
    '.ur-tr-dash{color:var(--text3);font-weight:600}',
    'body.dark .ur-tr-matrix th{border-bottom-color:#334155}',
    'body.dark .ur-tr-matrix td{border-bottom-color:#334155}',
    '.ur-tier-roster-groups{display:flex;flex-direction:column;gap:16px}',
    '.ur-tier-roster-head{display:flex;align-items:center;gap:8px;margin-bottom:6px}',
    '.ur-tier-roster-tablewrap{max-width:100%;border:1px solid var(--border2);border-radius:14px;overflow:hidden}',
    '.ur-tier-roster-headrow{display:grid;grid-template-columns:minmax(0,1fr) 54px 180px;column-gap:18px;padding:8px 12px;background:var(--surface);font-size:10px;font-weight:800;color:var(--text3);letter-spacing:.3px;border-bottom:1.5px solid var(--border2)}',
    '.ur-tier-roster-tierbar{display:flex;align-items:center;gap:8px;padding:8px 12px;background:var(--surface);border-left:4px solid var(--border2);border-bottom:1px solid var(--border2)}',
    '.ur-tier-roster-rows{display:flex;flex-direction:column}',
    '.ur-tier-roster-row{display:grid;grid-template-columns:minmax(0,1fr) 54px 180px;align-items:center;column-gap:18px;padding:9px 12px;border-bottom:1px solid var(--border2);cursor:pointer;transition:background .12s;font-size:12.5px}',
    '.ur-tier-roster-row.is-alt{background:rgba(148,163,184,.05)}',
    '.ur-tier-roster-group:last-child .ur-tier-roster-rows .ur-tier-roster-row:last-child{border-bottom:none}',
    '.ur-tier-roster-row:hover{background:var(--blue-l,rgba(37,99,235,.06))}',
    '.ur-tier-roster-name{display:flex;align-items:center;gap:11px;min-width:0;overflow:hidden}',
    '.ur-tier-roster-namewrap{display:flex;align-items:center;gap:9px;min-width:0;overflow:hidden}',
    '.ur-tier-roster-namewrap span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
    '.ur-tier-roster-wr{text-align:right;font-weight:900;font-size:13.5px;flex-shrink:0}',
    '.ur-tier-roster-rec{text-align:right;color:var(--text2);font-weight:700;white-space:nowrap;flex-shrink:0}',
    '.ur-tier-roster-streak{margin-left:6px;font-size:10px;font-weight:900;color:#dc2626}',
    '@media(max-width:560px){.ur-tier-roster-headrow,.ur-tier-roster-row{grid-template-columns:minmax(0,1fr) 44px 132px;font-size:11px}}',
    'body.dark .ur-tier-roster-tablewrap{border-color:#334155}',
    'body.dark .ur-tier-roster-headrow{background:rgba(15,23,42,.5);border-bottom-color:#334155}',
    'body.dark .ur-tier-roster-tierbar{background:rgba(15,23,42,.5);border-bottom-color:#334155}',
    'body.dark .ur-tier-roster-row{border-bottom-color:#334155}',
    'body.dark .ur-tier-roster-row.is-alt{background:rgba(148,163,184,.04)}',
    'body.dark .ur-tier-roster-row:hover{background:rgba(96,165,250,.12)}',
    'body.dark .ur-kpi,body.dark .ur-panel,body.dark .ur-btn{background:rgba(15,23,42,.7)!important;border-color:#334155!important}',
    'body.dark .ur-btn-primary{background:var(--blue)!important;border-color:var(--blue)!important;color:#fff!important}',
    'body.dark .ur-badge{background:rgba(15,23,42,.45);border-color:#334155}',
    'body.dark .ur-winner-row+.ur-winner-row,body.dark .ur-rival-row+.ur-rival-row{border-top-color:#334155}',
    'body.dark .ur-list-box{border-color:#334155}',
    'body.dark .ur-winner-row.is-alt,body.dark .ur-rival-row.is-alt{background:rgba(148,163,184,.04)}',
    'body.dark .ur-winner-row:hover,body.dark .ur-rival-row:hover{background:rgba(96,165,250,.12)}',
    'body.dark .ur-bar-track{background:#334155}',
    'body.dark .ur-recent-table td{border-bottom-color:#334155}',
    '.ur-bg-loading .ur-img-preview-body{position:relative}',
    '.ur-bg-loading .ur-img-preview-body img{opacity:.35}',
    '.ur-bg-loading .ur-img-preview-body::after{content:"이미지 생성 중...";position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:12px;font-weight:800;color:var(--text2);background:var(--white);padding:8px 14px;border-radius:999px;box-shadow:0 6px 16px rgba(0,0,0,.15)}',
    /* ── 소속 대학 색상 테마: #ur-report-capture 안의 배경/박스/버튼/메뉴를 --ur-accent(대학색)의 연한 톤으로
       (2026-08-21 "좀 더 연하게" 피드백으로 비율 축소 재조정) ── */
    '#ur-report-capture{background:color-mix(in srgb, var(--ur-accent,var(--blue)) 4%, transparent);border-radius:22px}',
    '#ur-report-capture .ur-panel{background:color-mix(in srgb, var(--ur-accent,var(--blue)) 6%, var(--white));border-color:color-mix(in srgb, var(--ur-accent,var(--blue)) 18%, rgba(148,163,184,.16))}',
    /* 핵심 분석 & AI 코멘트 패널은 대학색 대신 AI 코멘트와 어울리는 별도 톤(인디고/보라 계열) 고정 사용 — ID 2개라 위 .ur-panel 규칙보다 항상 우선 적용됨 */
    '#ur-report-capture #ur-sec-insights.ur-panel{background:linear-gradient(135deg,#eef2ff,#f5f3ff);border-color:#e0e7ff}',
    'body.dark #ur-report-capture #ur-sec-insights.ur-panel{background:linear-gradient(135deg,#1e2547,#241b47)!important;border-color:#2d3f55!important}',
    '#ur-report-capture .ur-kpi{background:color-mix(in srgb, var(--ur-accent,var(--blue)) 10%, var(--white));border-color:color-mix(in srgb, var(--ur-accent,var(--blue)) 20%, rgba(148,163,184,.16))}',
    /* .ur-btn-primary는 자체 배경(var(--blue))+흰 글자 조합인데, ID로 스코프된 아래 규칙이
       클래스 2개짜리 .ur-btn.ur-btn-primary보다 우선순위가 높아 배경만 연하게 덮어써 흰 글자가 거의 안 보이던
       버그가 있었음(2026-08-21) → :not()으로 제외해 원래 진한 배경+흰 글자 유지 */
    '#ur-report-capture .ur-btn:not(.ur-btn-primary){background:color-mix(in srgb, var(--ur-accent,var(--blue)) 7%, var(--white))}',
    '#ur-report-capture .ur-btn:not(.ur-btn-primary):hover{background:color-mix(in srgb, var(--ur-accent,var(--blue)) 16%, var(--white))}',
    '#ur-report-capture .ur-nav-bar{background:color-mix(in srgb, var(--ur-accent,var(--blue)) 5%, var(--surface))}',
    '#ur-report-capture .ur-nav-chip{background:color-mix(in srgb, var(--ur-accent,var(--blue)) 7%, var(--white))}',
    '#ur-report-capture .ur-recent-chip{background:color-mix(in srgb, var(--ur-accent,var(--blue)) 7%, var(--white))}',
    '#ur-report-capture .ur-list-box{background:color-mix(in srgb, var(--ur-accent,var(--blue)) 4%, transparent)}',
    '#ur-report-capture .ur-tier-roster-headrow,#ur-report-capture .ur-tier-roster-tierbar,#ur-report-capture .ur-roster-sort{background:color-mix(in srgb, var(--ur-accent,var(--blue)) 7%, var(--surface))}',
    'body.dark #ur-report-capture{background:color-mix(in srgb, var(--ur-accent,var(--blue)) 7%, transparent)}',
    'body.dark #ur-report-capture .ur-panel{background:color-mix(in srgb, var(--ur-accent,var(--blue)) 13%, #1e293b)!important;border-color:color-mix(in srgb, var(--ur-accent,var(--blue)) 24%, #334155)!important}',
    'body.dark #ur-report-capture .ur-kpi{background:color-mix(in srgb, var(--ur-accent,var(--blue)) 17%, #1e293b)!important;border-color:color-mix(in srgb, var(--ur-accent,var(--blue)) 26%, #334155)!important}',
    'body.dark #ur-report-capture .ur-btn:not(.ur-btn-primary){background:color-mix(in srgb, var(--ur-accent,var(--blue)) 12%, #1e293b)!important}',
    'body.dark #ur-report-capture .ur-btn:not(.ur-btn-primary):hover{background:color-mix(in srgb, var(--ur-accent,var(--blue)) 20%, #1e293b)!important}',
    'body.dark #ur-report-capture .ur-nav-bar{background:color-mix(in srgb, var(--ur-accent,var(--blue)) 9%, rgba(15,23,42,.5))}',
    'body.dark #ur-report-capture .ur-nav-chip,body.dark #ur-report-capture .ur-recent-chip{background:color-mix(in srgb, var(--ur-accent,var(--blue)) 12%, rgba(15,23,42,.7))}',
    'body.dark #ur-report-capture .ur-tier-roster-headrow,body.dark #ur-report-capture .ur-tier-roster-tierbar,body.dark #ur-report-capture .ur-roster-sort{background:color-mix(in srgb, var(--ur-accent,var(--blue)) 11%, rgba(15,23,42,.5))}'
  ].join('');
  document.head.appendChild(s);
}

function _urDateNum(s){
  const d = String(s||'').replace(/\D/g,'');
  return d.length>=8 ? parseInt(d.slice(0,8),10) : 0;
}

function _urThisWeekRange(){
  const now = new Date();
  const day = now.getDay();
  const mon = new Date(now); mon.setHours(0,0,0,0); mon.setDate(now.getDate()+(day===0?-6:1-day));
  const toD = new Date(now); toD.setHours(23,59,59,999);
  const f = d => parseInt(d.toISOString().slice(0,10).replace(/-/g,''));
  return { fromN:f(mon), toN:f(toD) };
}

function _urVisUnivList(){
  const _diss = new Set((typeof univCfg!=='undefined'?univCfg:[]).filter(u=>u.dissolved||u.hidden).map(u=>String(u.name||'').trim()));
  const list = (typeof _b2VisUnivs==='function') ? _b2VisUnivs() : (typeof univCfg!=='undefined'?univCfg:[]);
  return (list||[]).filter(u=>u && u.name && u.name!=='무소속' && !_diss.has(String(u.name||'').trim()));
}

/* ─── 최근 본 대학 (스트리머 리포트의 "최근 검색"과 동일한 패턴) ─── */
var UR_RECENT_KEY = 'su_urReportRecent';
function _urLoadRecent(){
  try{ return JSON.parse(localStorage.getItem(UR_RECENT_KEY)||'[]'); }catch(e){ return []; }
}
function _urSaveRecent(name){
  try{
    let arr = _urLoadRecent().filter(n=>n!==name);
    arr.unshift(name);
    arr = arr.slice(0,8);
    localStorage.setItem(UR_RECENT_KEY, JSON.stringify(arr));
  }catch(e){}
}

function _urSelectUniv(name){
  try{ if(window.SUTTS && (window.SUTTS.isSpeaking() || (window.SUTTS.isPaused && window.SUTTS.isPaused()))) window.SUTTS.stop(); }catch(e){}
  window._urName = name;
  _urSaveRecent(name);
  if (typeof render==='function') render();
}

// 대학 소속 인원의 통산 승수 상위 (팀 내 다승왕)
function _urTopWinners(playerAgg, n){
  return playerAgg.filter(x=>x.win>0).sort((a,b)=>b.win-a.win||(b.wr??-1)-(a.wr??-1)).slice(0,n||6);
}
// 대학 소속 인원의 연승 리더
function _urTopStreaks(playerAgg, n){
  return playerAgg.filter(x=>x.streak>=3).sort((a,b)=>b.streak-a.streak).slice(0,n||6);
}

// 라이벌 대학 상대전적 (상대 닉네임 → 상대 소속 대학으로 역매핑해서 집계)
function _urRivalStats(members, ownUnivName){
  const nameToUniv = {};
  (players||[]).forEach(p=>{ if (p && p.name) nameToUniv[p.name] = String(p.univ||'').trim(); });
  const rivalMap = {};
  members.forEach(p=>{
    (Array.isArray(p.history)?p.history:[]).forEach(h=>{
      if (!h || (h.result!=='승' && h.result!=='패')) return;
      const oppName = String(h.opp||'').trim();
      if (!oppName) return;
      const oppUniv = nameToUniv[oppName] || '';
      if (!oppUniv || oppUniv===ownUnivName || oppUniv==='무소속') return;
      if (!rivalMap[oppUniv]) rivalMap[oppUniv] = {w:0,l:0};
      if (h.result==='승') rivalMap[oppUniv].w++; else rivalMap[oppUniv].l++;
    });
  });
  return Object.entries(rivalMap)
    .map(([name,v])=>({name, w:v.w, l:v.l, tot:v.w+v.l, wr:(v.w+v.l)>0?Math.round(v.w/(v.w+v.l)*100):null}))
    .sort((a,b)=>b.tot-a.tot);
}

/* ─── 핵심 분석 결과 (대학 리포트용) — 스트리머 리포트의 하이라이트 콜아웃 패턴 재사용 ─── */
function _urKeyInsightsRows(univName, raceRecord, topWinners, topStreaks, rivals, totalW, totalL){
  const RACE_KO={T:'테란',Z:'저그',P:'프로토스'};
  const rows=[];
  const raceEntries=['T','Z','P'].map(r=>{
    const rv=raceRecord[r]||{w:0,l:0}; const t=rv.w+rv.l;
    return {r, w:rv.w, l:rv.l, tot:t, wr: t? Math.round(rv.w/t*100):0};
  }).filter(e=>e.tot>=3);
  if (raceEntries.length){
    const best=raceEntries.slice().sort((a,b)=>b.wr-a.wr)[0];
    const worst=raceEntries.slice().sort((a,b)=>a.wr-b.wr)[0];
    rows.push({icon:'🏆', tone:'good',
      html:`팀 내 가장 강한 종족전: <b>${RACE_KO[best.r]}전</b> ${best.w}승 ${best.l}패 (승률 ${best.wr}%)`});
    if (worst.r!==best.r){
      rows.push({icon:'⚠️', tone:'bad',
        html:`팀 내 가장 약한 종족전: <b>${RACE_KO[worst.r]}전</b> ${worst.w}승 ${worst.l}패 (승률 ${worst.wr}%)`});
    }
  }
  if (topWinners && topWinners.length){
    const p = topWinners[0].p;
    rows.push({icon:'👑', tone:'good',
      html:`팀 내 다승왕: <b>${escHTML(p.name||'')}</b> ${topWinners[0].win}승 ${topWinners[0].loss}패`});
  }
  if (topStreaks && topStreaks.length){
    const p = topStreaks[0].p;
    rows.push({icon:'🔥', tone:'good',
      html:`현재 팀 내 최고 연승: <b>${escHTML(p.name||'')}</b> ${topStreaks[0].streak}연승 중`});
  }
  const rivalsEligible = (rivals||[]).filter(r=>r.tot>=2);
  if (rivalsEligible.length){
    const bestRival = rivalsEligible.slice().sort((a,b)=>(b.wr??-1)-(a.wr??-1))[0];
    const worstRival = rivalsEligible.slice().sort((a,b)=>(a.wr??101)-(b.wr??101))[0];
    if (bestRival && bestRival.wr!==null && bestRival.wr>=50){
      rows.push({icon:'😎', tone:'good',
        html:`상대 전적이 가장 좋은 라이벌: <b>${escHTML(bestRival.name)}</b> ${bestRival.w}승 ${bestRival.l}패 (승률 ${bestRival.wr}%)`});
    }
    if (worstRival && worstRival.wr!==null && worstRival.wr<=50 && worstRival.name!==(bestRival&&bestRival.name)){
      rows.push({icon:'😰', tone:'bad',
        html:`상대 전적이 가장 아쉬운 라이벌: <b>${escHTML(worstRival.name)}</b> ${worstRival.w}승 ${worstRival.l}패 (승률 ${worstRival.wr}%)`});
    }
  }
  return rows;
}
function _urKeyInsightsHTML(univName, raceRecord, topWinners, topStreaks, rivals, totalW, totalL){
  const rows = _urKeyInsightsRows(univName, raceRecord, topWinners, topStreaks, rivals, totalW, totalL);
  if (!rows.length) return `<div class="ur-empty" style="padding:24px">분석할 데이터가 부족합니다 (표본 부족)</div>`;
  const [featured, ...rest] = rows;
  let h = `<div class="pr-highlight-row pr-highlight-${featured.tone} pr-highlight-featured"><span class="pr-hi-icon">${featured.icon}</span><span>${featured.html}</span></div>`;
  if (rest.length) h += rest.map(r=>`<div class="pr-highlight-row pr-highlight-${r.tone}"><span class="pr-hi-icon">${r.icon}</span><span>${r.html}</span></div>`).join('');
  return h;
}

/* AI 분석 코멘트의 문장 배열 + 톤을 만드는 공용 함수.
   HTML 렌더링(_urAiCommentHTML)과 음성듣기(TTS) 양쪽에서 함께 사용한다. */
function _urAiCommentSentences(univName, totalW, totalL, raceRecord, topStreaks, rivals){
  const sentences=[];
  let tone='';
  const tot = totalW+totalL;
  if (!tot){
    sentences.push(`${univName}은 기록된 경기가 없습니다.`);
  } else {
    const wr = Math.round(totalW/tot*100);
    if (wr>=65) sentences.push(`통산 승률 ${wr}%(${totalW}승 ${totalL}패)로 팀 전체 컨디션이 매우 좋습니다.`);
    else if (wr>=50) sentences.push(`통산 승률 ${wr}%(${totalW}승 ${totalL}패)로 평균 이상의 흐름을 보이고 있습니다.`);
    else if (wr>=35) sentences.push(`통산 승률 ${wr}%(${totalW}승 ${totalL}패)로 다소 아쉬운 성적입니다.`);
    else sentences.push(`통산 승률 ${wr}%(${totalW}승 ${totalL}패)로 최근 팀 전체가 고전하고 있습니다.`);

    const RACE_KO={T:'테란',Z:'저그',P:'프로토스'};
    const raceEntries=['T','Z','P'].map(r=>{
      const rv=raceRecord[r]||{w:0,l:0}; const t=rv.w+rv.l;
      return {r, w:rv.w, l:rv.l, tot:t, wr: t? Math.round(rv.w/t*100):null};
    }).filter(e=>e.tot>=3);
    if (raceEntries.length){
      const best=raceEntries.slice().sort((a,b)=>b.wr-a.wr)[0];
      const worst=raceEntries.slice().sort((a,b)=>a.wr-b.wr)[0];
      if (best && best.wr>=60) sentences.push(`${RACE_KO[best.r]}전에서 ${best.wr}%(${best.w}승 ${best.l}패)로 강한 모습을 보였습니다.`);
      if (worst && (!best || worst.r!==best.r) && worst.wr<=40) sentences.push(`반면 ${RACE_KO[worst.r]}전은 ${worst.wr}%(${worst.w}승 ${worst.l}패)로 약점으로 보입니다.`);
    }

    if (topStreaks && topStreaks.length && topStreaks[0].streak>=5){
      sentences.push(`${topStreaks[0].p.name||''} 선수가 ${topStreaks[0].streak}연승을 달리며 팀 분위기를 끌어올리고 있습니다.`);
    }

    const rivalsEligible = (rivals||[]).filter(r=>r.tot>=2);
    if (rivalsEligible.length){
      const worstRival = rivalsEligible.slice().sort((a,b)=>(a.wr??101)-(b.wr??101))[0];
      if (worstRival && worstRival.wr!==null && worstRival.wr<=30) sentences.push(`특히 ${worstRival.name}와의 상대전적은 ${worstRival.wr}%로 고전하고 있어 대비가 필요해 보입니다.`);
    }

    if (topStreaks && topStreaks.length && topStreaks[0].streak>=5) tone='pr-ai-good';
    else if (wr>=55) tone='pr-ai-good';
    else if (wr<=35) tone='pr-ai-bad';
  }
  return {sentences, tone};
}
/* ─── AI 분석 코멘트 (대학 리포트용 · 규칙 기반) ─── */
function _urAiCommentHTML(univName, totalW, totalL, raceRecord, topStreaks, rivals){
  const {sentences, tone} = _urAiCommentSentences(univName, totalW, totalL, raceRecord, topStreaks, rivals);
  return `<div class="pr-ai-box ${tone}"><div class="pr-ai-icon">🤖</div><div class="pr-ai-text">${sentences.map(s=>escHTML(s)).join(' ')}</div></div>`;
}


// 팀 전체 최근 경기 (모든 소속 인원의 경기를 합쳐서 반환 — 정렬/필터/페이지는 렌더 단계에서 처리)
function _urRecentMatches(members){
  // 상대 닉네임 → 상대 선수 객체 (프로필 사진 조회용)
  const nameToPlayer = {};
  (typeof players!=='undefined' ? players : []).forEach(p=>{ if (p && p.name) nameToPlayer[p.name] = p; });
  const rows = [];
  members.forEach(p=>{
    (Array.isArray(p.history)?p.history:[]).forEach(h=>{
      if (!h || (h.result!=='승' && h.result!=='패')) return;
      const oppName = h.opp||'';
      const oppP = nameToPlayer[String(oppName).trim()] || null;
      rows.push({
        name:p.name, photo:p.photo||'', secondProfileFile:p.secondProfileFile||'', race:p.race||'',
        date:h.date||h.d||'', result:h.result,
        opp:oppName, oppPhoto: oppP ? (oppP.photo||'') : '', oppSecondProfileFile: oppP ? (oppP.secondProfileFile||'') : '', oppRace: h.oppRace||(oppP?oppP.race:'')||'', oppUniv: oppP ? (oppP.univ||'') : '',
        map:h.map||'', mode:h.mode||''
      });
    });
  });
  return rows;
}

function _urAvatarHTML(p, col, size){
  const s = size||56;
  const photo = p.photo ? (typeof toThumbUrl==='function'?toThumbUrl(p.photo,s):p.photo) : '';
  const photoOrig = p.photo ? (typeof toHttpsUrl==='function'?toHttpsUrl(p.photo):p.photo) : '';
  const initials = (p.name||'?').slice(0,1);
  const _2nd = (typeof _phSwap2ndHTML==='function' && p.secondProfileFile) ? _phSwap2ndHTML(p.secondProfileFile, {style:'width:100%;height:100%;object-fit:cover;border-radius:inherit'}) : '';
  if (photo) {
    return `<span class="ur-mini-avatar${_2nd?' ph-swap':''}" style="width:${s}px;height:${s}px;background:${col}33"><img src="${photo}" data-orig="${photoOrig}" onerror="if(this.dataset.orig&&this.src!==this.dataset.orig){this.src=this.dataset.orig}else{this.style.display='none'}">${_2nd}</span>`;
  }
  return `<span class="ur-mini-avatar" style="width:${s}px;height:${s}px;background:${col}">${initials}</span>`;
}

// 최근 경기 표용 짧은 날짜 포맷 (예: 8/18(화)) — 대학 대전기록 카드와 동일한 톤으로 통일
function _urFmtRecentDate(d){
  if (!d) return '';
  try{
    const days = ['일','월','화','수','목','금','토'];
    const dt = new Date(String(d).slice(0,10)+'T00:00:00');
    if (isNaN(dt.getTime())) return String(d).slice(0,10);
    return `${dt.getMonth()+1}/${dt.getDate()}(${days[dt.getDay()]})`;
  }catch(e){ return String(d).slice(0,10); }
}

// 최근 경기 표용 미니 아바타 (본인/상대 공통, 마우스 오버 시 두번째 프로필 사진 프리뷰)
function _urRecentAvatarHTML(name, photo, secondProfileFile, col){
  const src = photo ? (typeof toThumbUrl==='function'?toThumbUrl(photo,20):photo) : '';
  const srcOrig = photo ? (typeof toHttpsUrl==='function'?toHttpsUrl(photo):photo) : '';
  const initial = (name||'?').slice(0,1);
  const _2nd = (typeof _phSwap2ndHTML==='function' && secondProfileFile) ? _phSwap2ndHTML(secondProfileFile, {style:'width:100%;height:100%;object-fit:cover;border-radius:inherit'}) : '';
  const inner = src
    ? `<img src="${src}" data-orig="${srcOrig}" onerror="if(this.dataset.orig&&this.src!==this.dataset.orig){this.src=this.dataset.orig}else{this.style.display='none'}">${_2nd}`
    : initial;
  return `<span class="ur-recent-avatar${_2nd?' ph-swap':''}" style="background:${col}">${inner}</span>`;
}

/* ─── 섹션 바로가기 내비게이션 (스트리머 리포트와 동일한 패턴) ─── */
function _urSectionNavHTML(){
  const items = [
    ['ur-sec-race','🎮 구성'],
    ['ur-sec-racewin','⚔️ 종족승률'],
    ['ur-sec-trend','📈 활동추이'],
    ['ur-sec-tierroster','🧾 티어별전적'],
    ['ur-sec-topwins','🏆 다승왕'],
    ['ur-sec-streak','🔥 연승'],
    ['ur-sec-rival','⚔️ 라이벌'],
    ['ur-sec-insights','📈 핵심분석'],
    ['ur-sec-roster','📋 로스터'],
    ['ur-sec-recent','📅 최근경기'],
  ];
  const chips = items.map(([id,lbl])=>
    `<button type="button" class="ur-nav-chip" onclick="_urScrollToSection('${id}')">${lbl}</button>`
  ).join('');
  return `<div class="ur-nav-bar no-export">${chips}</div>`;
}
function _urScrollToSection(id){
  const el = document.getElementById(id);
  if (!el) return;
  const y = el.getBoundingClientRect().top + window.scrollY - 70;
  window.scrollTo({ top:y, behavior:'smooth' });
}
try{ window._urScrollToSection = _urScrollToSection; }catch(e){}

function statsUnivReportHTML(){
  _urInjectStyle();

  const univName = window._urName || '';
  const allUnivList = _urVisUnivList();
  const _urRecentUnivs = _urLoadRecent().filter(n=>n!==univName && allUnivList.some(u=>u.name===n));

  let h = `<div class="ssec">
    <div class="stats-chart-toolbar" style="margin-bottom:14px">
      <div>
        <h4 style="margin:0">🏛️ 대학 리포트</h4>
        <div style="font-size:11px;color:var(--text2);margin-top:4px">대학 버튼을 누르면 로스터, 종족·티어 구성, 종족별 승률, 티어별 소속 스트리머 전적, 최근 7일 활동 추이, 팀 내 다승왕·연승 리더, 라이벌 대학 상대전적, 최근 경기까지 한 번에 볼 수 있습니다.</div>
      </div>
    </div>
    <div class="ur-univ-picker-wrap">
      ${_urRecentUnivs.length?`<div class="ur-recent-wrap">
        <span class="ur-recent-lbl">🕘 최근 본 대학</span>
        ${_urRecentUnivs.map(n=>`<span class="ur-recent-chip" onclick="_urSelectUniv('${String(n).replace(/'/g,"\\'")}')">${escHTML(n)}</span>`).join('')}
      </div>`:''}
      <div id="ur-univ-picker-grid" class="ur-univ-picker-grid">
        ${allUnivList.map(u=>{
          const uCol = (typeof gc==='function' ? gc(u.name) : '') || '#64748b';
          const uIconUrl = u.icon || u.img || (typeof UNIV_ICONS!=='undefined'?UNIV_ICONS[u.name]:'') || '';
          const uLogoSrc = uIconUrl ? (typeof toHttpsUrl==='function'?toHttpsUrl(uIconUrl):uIconUrl) : '';
          const isSel = u.name===univName;
          const safeU = String(u.name||'').replace(/'/g,"\\'");
          return `<button type="button" class="ur-univ-btn${isSel?' is-sel':''}" data-uname="${escHTML(u.name)}" style="--ubtn-col:${uCol}" onclick="_urSelectUniv('${safeU}')">
            <span class="ur-univ-btn-logo">${uLogoSrc?`<img src="${uLogoSrc}" onerror="this.parentNode.textContent='🏫'">`:'🏫'}</span>
            <span class="ur-univ-btn-name">${escHTML(u.name)}</span>
          </button>`;
        }).join('')}
      </div>
    </div>
  </div>`;

  const uCfg = univName ? (typeof univCfg!=='undefined'?univCfg:[]).find(u=>u && u.name===univName) : null;

  if (!univName || !uCfg) {
    h += `<div class="ur-empty"><div style="font-size:40px;margin-bottom:10px">🏛️</div>대학 버튼을 눌러서 리포트를 확인해보세요</div>`;
    return h;
  }

  const col = (typeof gc==='function' ? gc(univName) : '') || '#64748b';
  const _dissOwn = !!(uCfg.dissolved || uCfg.hidden);
  const allMembers = (players||[]).filter(p => p && !p.hidden && !p.retired && !p.hideFromBoard && String(p?.univ||'').trim()===univName);
  const hasRoleFn = (typeof _b2HasRole==='function') ? _b2HasRole : (()=>false);
  const roledMembers = allMembers.filter(p=>hasRoleFn(p));
  const tieredMembers = allMembers.filter(p=>!hasRoleFn(p));

  if (!allMembers.length) {
    h += `<div class="ur-empty"><div style="font-size:40px;margin-bottom:10px">🏛️</div>${escHTML(univName)}에 등록된 선수가 없습니다</div>`;
    return h;
  }

  // 선수별 통산 승/패·연승 집계
  const playerAgg = tieredMembers.map(p=>{
    const decided = (Array.isArray(p.history)?p.history:[]).filter(x=>x && (x.result==='승'||x.result==='패'));
    const sortedDesc = [...decided].sort((a,b)=>_urDateNum(b.date||b.d||'')-_urDateNum(a.date||a.d||''));
    let streak = 0;
    for (const x of sortedDesc) { if (x.result==='승') streak++; else break; }
    const win = decided.filter(x=>x.result==='승').length;
    const loss = decided.length - win;
    return { p, win, loss, games:decided.length, wr:decided.length?Math.round(win/decided.length*100):null, streak };
  });
  let totalW=0, totalL=0;
  playerAgg.forEach(x=>{ totalW+=x.win; totalL+=x.loss; });
  const totalG = totalW+totalL;
  const totalWr = totalG>0 ? Math.round(totalW/totalG*100) : null;
  const wrCol = totalWr===null?'#94a3b8':totalWr>=55?'#10b981':totalWr>=45?'#f59e0b':'#ef4444';

  const { fromN, toN } = _urThisWeekRange();
  const weekActive = new Set();
  tieredMembers.forEach(p=>(Array.isArray(p.history)?p.history:[]).forEach(x=>{
    const d = _urDateNum(x.date||x.d||'');
    if (d>=fromN && d<=toN) weekActive.add(p.name);
  }));

  const TIERS_LOCAL = typeof TIERS!=='undefined' ? TIERS : [];
  const sortedByTier = [...tieredMembers].sort((a,b)=>{
    const ia=TIERS_LOCAL.indexOf(a.tier||''), ib=TIERS_LOCAL.indexOf(b.tier||'');
    return (ia>=0?ia:999)-(ib>=0?ib:999);
  });
  const topTier = sortedByTier[0]?.tier || null;
  const topTierCol = (typeof getTierBtnColor==='function' && topTier) ? getTierBtnColor(topTier) : '#64748b';
  const topTierTc = (typeof getTierBtnTextColor==='function' && topTier) ? (getTierBtnTextColor(topTier)||'#fff') : '#fff';

  const raceCts = {P:0,T:0,Z:0,'?':0};
  tieredMembers.forEach(p=>{ const r=p.race||'?'; raceCts[r in raceCts?r:'?']++; });
  const raceTotal = raceCts.P+raceCts.T+raceCts.Z || 1;

  const tierCts = {};
  tieredMembers.forEach(p=>{ const t=p.tier||'미정'; tierCts[t]=(tierCts[t]||0)+1; });
  const orderedTiers = TIERS_LOCAL.filter(t=>tierCts[t]).concat(Object.keys(tierCts).filter(t=>!TIERS_LOCAL.includes(t)));

  // 종족별 승률 (인원 비율과 별개로 실제 승률 비교용)
  // (수정) 종족 미정('?') 선수의 전적이 위 "통산 승률" 배지에는 포함되는데
  // 여기서는 누락돼 숫자가 안 맞는 문제가 있었음 → '?' 버킷도 함께 집계.
  const raceRecord = {P:{w:0,l:0},T:{w:0,l:0},Z:{w:0,l:0},'?':{w:0,l:0}};
  tieredMembers.forEach(p=>{
    const r = (p.race in raceRecord) ? p.race : '?';
    (Array.isArray(p.history)?p.history:[]).forEach(h=>{
      if (h.result==='승') raceRecord[r].w++;
      else if (h.result==='패') raceRecord[r].l++;
    });
  });

  // 최근 7일 일별 활동량 (경기 수)
  const last7Days = [];
  { const _nowD = new Date();
    for (let i=6;i>=0;i--) {
      const d = new Date(_nowD); d.setDate(_nowD.getDate()-i); d.setHours(0,0,0,0);
      last7Days.push({ dn:parseInt(d.toISOString().slice(0,10).replace(/-/g,'')), label:`${d.getMonth()+1}/${d.getDate()}`, isToday:i===0, count:0 });
    }
  }
  const last7Map = new Map(last7Days.map(x=>[x.dn, x]));
  tieredMembers.forEach(p=>{
    (Array.isArray(p.history)?p.history:[]).forEach(h=>{
      if (!h || (h.result!=='승' && h.result!=='패')) return;
      const row = last7Map.get(_urDateNum(h.date||h.d||''));
      if (row) row.count++;
    });
  });
  const last7Max = Math.max(1, ...last7Days.map(x=>x.count));

  const iconUrl = uCfg.icon || uCfg.img || (typeof UNIV_ICONS!=='undefined'?UNIV_ICONS[univName]:'') || '';
  const logoSrc = iconUrl ? (typeof toHttpsUrl==='function'?toHttpsUrl(iconUrl):iconUrl) : '';
  const logoHtml = logoSrc
    ? `<img src="${logoSrc}" onerror="this.parentNode.style.display='none'">`
    : `<span style="font-size:26px">🏫</span>`;

  h += `<div id="ur-report-capture" style="--ur-accent:${col}">`;
  h += `<div class="ur-hero" style="background:linear-gradient(135deg,${col}22,${col}08);border-color:${col}33;--ur-hero-accent:${col}">
    <div class="ur-hero-logo">${logoHtml}</div>
    <div style="min-width:0;flex:1">
      <div class="ur-hero-name" style="color:${col}">${escHTML(univName)}</div>
      <div class="ur-hero-badges">
        <span class="ur-badge">👥 총원 ${allMembers.length}명</span>
        <span class="ur-badge">일반 ${tieredMembers.length}명 · 직책 ${roledMembers.length}명</span>
        ${totalWr!==null?`<span class="ur-badge" style="color:${wrCol}">📈 통산 ${totalWr}% (${totalW}승 ${totalL}패)</span>`:''}
        <span class="ur-badge">🔥 이번주 활동 ${weekActive.size}명</span>
        ${topTier?`<span class="ur-badge" style="background:${topTierCol};color:${topTierTc};border-color:transparent">TOP 티어 ${topTier}</span>`:''}
        ${_dissOwn?`<span class="ur-badge" style="color:#dc2626">해체됨</span>`:''}
      </div>
    </div>
    <div class="ur-hero-actions no-export">
      <button type="button" id="ur-report-speak-btn" class="ur-btn" title="리포트 음성으로 듣기" onclick="_urToggleSpeak()">🔊<span>음성듣기</span></button>
      <button type="button" class="ur-btn ur-btn-primary" title="리포트 이미지 저장" onclick="_urSaveReportImage()">📸<span>이미지 저장</span></button>
    </div>
  </div>`;

  h += _urSectionNavHTML();

  // 기본 정보 KPI
  h += `<div class="ur-kpi-grid">
    <div class="ur-kpi"><div class="ur-kpi-num" style="color:${col}">${allMembers.length}</div><div class="ur-kpi-lbl">총 인원</div></div>
    <div class="ur-kpi"><div class="ur-kpi-num" style="color:#7c3aed">${raceCts.P}</div><div class="ur-kpi-lbl">🔮 프로토스</div></div>
    <div class="ur-kpi"><div class="ur-kpi-num" style="color:#0284c7">${raceCts.T}</div><div class="ur-kpi-lbl">⚔️ 테란</div></div>
    <div class="ur-kpi"><div class="ur-kpi-num" style="color:#059669">${raceCts.Z}</div><div class="ur-kpi-lbl">🦎 저그</div></div>
    <div class="ur-kpi"><div class="ur-kpi-num" style="color:${wrCol}">${totalWr!==null?totalWr+'%':'-'}</div><div class="ur-kpi-lbl">통산 승률</div></div>
  </div>`;

  // 종족 비율 + 티어 분포
  h += `<div class="ur-panel" id="ur-sec-race">
    <div class="ur-panel-title">🎮 종족 비율 &amp; 🏆 티어 분포</div>
    <div class="ur-subsec-lbl">종족 비율</div>
    <div style="display:flex;flex-direction:column;gap:7px;margin-bottom:16px">
      ${[{r:'P',c:'#7c3aed',l:'🔮 프로토스'},{r:'T',c:'#0284c7',l:'⚔️ 테란'},{r:'Z',c:'#059669',l:'🦎 저그'}].map(({r,c,l})=>{
        const n=raceCts[r]; const pct=Math.round(n/raceTotal*100);
        return `<div>
          <div style="display:flex;justify-content:space-between;margin-bottom:3px">
            <span style="font-size:12px;font-weight:800;color:${c}">${l}</span>
            <span style="font-size:12px;font-weight:900;color:var(--text2)">${n}<span style="font-weight:600;color:var(--text3)"> (${pct}%)</span></span>
          </div>
          <div class="ur-bar-track"><div style="width:${pct}%;height:100%;background:${c};border-radius:5px;transition:width .6s ease"></div></div>
        </div>`;
      }).join('')}
    </div>
    <div class="ur-subsec-divider"></div>
    <div class="ur-subsec-lbl">티어 분포</div>
    <div style="display:flex;flex-wrap:wrap;gap:6px">
      ${orderedTiers.map(t=>{
        const tc = typeof getTierBtnColor==='function' ? getTierBtnColor(t) : '#64748b';
        const tcol = typeof getTierBtnTextColor==='function' ? (getTierBtnTextColor(t)||'#fff') : '#fff';
        const n = tierCts[t];
        return `<span style="display:inline-flex;align-items:center;gap:5px;padding:5px 10px;border-radius:999px;background:${tc}18;border:1.5px solid ${tc}55">
          <span style="font-size:11px;font-weight:900;padding:1px 7px;border-radius:6px;background:${tc};color:${tcol}">${t}</span>
          <span style="font-size:11px;font-weight:800;color:${tc}">${n}명</span>
        </span>`;
      }).join('')}
    </div>
  </div>`;

  // ⚔️ 종족별 승률
  h += `<div class="ur-panel" id="ur-sec-racewin">
    <div class="ur-panel-title">⚔️ 종족별 승률 <span style="margin-left:auto;font-size:11px;color:var(--text3);font-weight:600">전체 기간 통산</span></div>
    <div style="display:flex;flex-direction:column;gap:11px">
      ${[{r:'P',c:'#7c3aed',l:'🔮 프로토스'},{r:'T',c:'#0284c7',l:'⚔️ 테란'},{r:'Z',c:'#059669',l:'🦎 저그'}]
        .concat(raceRecord['?'].w+raceRecord['?'].l>0 ? [{r:'?',c:'#64748b',l:'❔ 종족 미정'}] : [])
        .map(({r,c,l})=>{
        const rec=raceRecord[r]; const g=rec.w+rec.l; const wr=g>0?Math.round(rec.w/g*100):null;
        return `<div>
          <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:4px">
            <span style="font-size:12px;font-weight:800;color:${c}">${l}</span>
            <span style="font-size:12px;font-weight:900;color:${c}">${wr!==null?wr+'%':'-'}<span style="font-weight:600;color:var(--text3);margin-left:5px">${rec.w}승 ${rec.l}패</span></span>
          </div>
          <div class="ur-bar-track"><div style="width:${wr??0}%;height:100%;background:linear-gradient(90deg,color-mix(in srgb, ${c} 45%, white),${c});border-radius:999px;transition:width .6s ease"></div></div>
        </div>`;
      }).join('')}
    </div>
  </div>`;

  // 📈 최근 7일 활동 추이
  h += `<div class="ur-panel" id="ur-sec-trend">
    <div class="ur-panel-title">📈 최근 7일 활동 추이 <span style="margin-left:auto;font-size:11px;color:var(--text3);font-weight:600">최근 7일 총 ${last7Days.reduce((s,d)=>s+d.count,0)}경기</span></div>
    <div class="ur-trend-chart">
      ${last7Days.map(d=>{
        const hPct = Math.max(4, Math.round(d.count/last7Max*100));
        const isPeak = d.count>0 && d.count===last7Max;
        return `<div class="ur-trend-col" title="${d.label}: ${d.count}경기">
          <span class="ur-trend-count" style="${isPeak?`color:${col};font-weight:900`:''}">${d.count}${isPeak?' 🔺':''}</span>
          <div class="ur-trend-bar" style="min-height:3px;height:${hPct}%;background:${d.isToday?'linear-gradient(180deg,#fbbf24,#f59e0b)':`linear-gradient(180deg,${col}bb,${col})`}"></div>
          <span class="ur-trend-day" style="${d.isToday?`color:${col}`:''}">${d.isToday?'오늘':d.label}</span>
        </div>`;
      }).join('')}
    </div>
  </div>`;

  // 🗒️ 대학 메모 (설정된 경우에만 노출)
  if (uCfg.memo || uCfg.bMemo) {
    h += `<div class="ur-panel" id="ur-sec-memo">
      <div class="ur-panel-title">🗒️ 대학 메모</div>
      <div style="font-size:12.5px;line-height:1.7;color:var(--text2);white-space:pre-wrap">${escHTML(uCfg.memo||uCfg.bMemo||'')}</div>
    </div>`;
  }


  // 티어별 소속 스트리머 전체 전적 + 팀 내 다승왕/연승 리더/라이벌 전적을 2단 배치로
  h += `<div class="ur-two-col">`;
  h += `<div class="ur-two-col-left">`;
  // 🧾 티어별 소속 스트리머 전체 전적 — 각 티어에 어떤 스트리머가 있고 개개인 통산 전적이 어떤지
  const tierRosterRecord = orderedTiers.map(t=>({
    tier: t,
    members: playerAgg.filter(x=>(x.p.tier||'미정')===t).sort((a,b)=>(b.wr??-1)-(a.wr??-1)||b.win-a.win)
  })).filter(g=>g.members.length);
  if (tierRosterRecord.length) {
    h += `<div class="ur-panel" id="ur-sec-tierroster">
      <div class="ur-panel-title">🧾 티어별 소속 스트리머 전체 전적</div>
      <div class="ur-tier-roster-tablewrap">
        <div class="ur-tier-roster-headrow">
          <span>스트리머</span><span style="text-align:right">승률</span><span style="text-align:right">전적</span>
        </div>
        ${tierRosterRecord.map(({tier,members})=>{
          const tc = typeof getTierBtnColor==='function' ? getTierBtnColor(tier) : '#64748b';
          const tcol = typeof getTierBtnTextColor==='function' ? (getTierBtnTextColor(tier)||'#fff') : '#fff';
          return `<div class="ur-tier-roster-group">
            <div class="ur-tier-roster-tierbar" style="border-left-color:${tc}">
              <span class="ur-tr-tier-badge" style="background:${tc};color:${tcol}">${escHTML(tier)}</span>
              <span style="font-size:11px;font-weight:700;color:var(--text3)">${members.length}명</span>
            </div>
            <div class="ur-tier-roster-rows">
              ${members.map((x,i)=>{
                const p = x.p;
                const safeName = String(p.name||'').replace(/'/g,"\\'");
                const raceBadge = p.race ? `<span class="rbadge r${escHTML(p.race)}" style="font-size:9px;padding:1px 5px">${escHTML(p.race)}</span>` : '';
                const wr = x.wr;
                const wc = wr===null?'var(--text3)':(wr>=55?'#10b981':wr>=45?'#f59e0b':'#ef4444');
                const streakTxt = x.streak>=3 ? `<span class="ur-tier-roster-streak">🔥${x.streak}연승</span>` : '';
                return `<div class="ur-tier-roster-row${i%2?' is-alt':''}" onclick="if(typeof openPlayerModal==='function')openPlayerModal('${safeName}')">
                  <div class="ur-tier-roster-name">${_urAvatarHTML(p, col, 36)}<span class="ur-tier-roster-namewrap"><span style="font-weight:800;color:${col}">${escHTML(p.name)}</span>${raceBadge}</span></div>
                  <div class="ur-tier-roster-wr" style="color:${wc}">${wr!==null?wr+'%':'-'}</div>
                  <div class="ur-tier-roster-rec">${x.win}승 ${x.loss}패 <span style="color:var(--text3);font-weight:600">· ${x.games}경기</span>${streakTxt}</div>
                </div>`;
              }).join('')}
            </div>
          </div>`;
        }).join('')}
      </div>
    </div>`;
  }

  h += `</div>`;
  h += `<div class="ur-two-col-right">`;
  // 팀 내 다승왕 TOP
  const topWinners = _urTopWinners(playerAgg, 6);
  if (topWinners.length) {
    h += `<div class="ur-panel" id="ur-sec-topwins">
      <div class="ur-panel-title">🏆 팀 내 다승왕 TOP</div>
      <div class="ur-list-box">
      ${topWinners.map((x,i)=>{
        const p=x.p;
        const medal = i<3 ? ['🥇','🥈','🥉'][i] : `${i+1}`;
        const wrColBar = (typeof _prTintByPercent==='function') ? _prTintByPercent(x.wr, col, 95).css : (x.wr===null?'#94a3b8':x.wr>=60?'#10b981':x.wr>=40?'#f59e0b':'#ef4444');
        // 퍼센트 숫자는 카드 배경(흰색 계열) 위에 직접 얹히는 텍스트라, 배경용과 달리
        // 너무 옅어지면(대학색이 연할 때) 안 보이므로 명도 상한을 낮게 잡아 항상 읽히게 함
        const wrColText = (typeof _prTintByPercent==='function') ? _prTintByPercent(x.wr, col, 58).css : wrColBar;
        const safeName = (p.name||'').replace(/'/g,"\\'");
        return `<div class="ur-winner-row${i%2?' is-alt':''}" onclick="if(typeof openPlayerModal==='function')openPlayerModal('${safeName}')">
          <span style="width:20px;text-align:center;font-size:12px;font-weight:900;color:var(--text3);flex-shrink:0">${medal}</span>
          ${_urAvatarHTML(p, col, 32)}
          <span style="font-size:12px;font-weight:800;color:${col};min-width:64px;max-width:110px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${escHTML(p.name||'')}</span>
          <div class="ur-bar-track" style="margin:0 6px"><div style="width:${x.wr}%;height:100%;background:linear-gradient(90deg,#22d3ee,#38bdf8,#3b82f6,#6366f1);border-radius:999px"></div></div>
          <span style="font-size:11.5px;font-weight:900;color:var(--text2);flex-shrink:0">${x.win}승 ${x.loss}패</span>
          <span style="font-size:11.5px;font-weight:900;color:${wrColText};min-width:36px;text-align:right;flex-shrink:0">${x.wr}%</span>
        </div>`;
      }).join('')}
      </div>
    </div>`;
  }

  // 팀 내 연승 리더
  const topStreaks = _urTopStreaks(playerAgg, 6);
  if (topStreaks.length) {
    const maxStreak = topStreaks[0].streak || 1;
    h += `<div class="ur-panel" id="ur-sec-streak">
      <div class="ur-panel-title">🔥 팀 내 연승 리더 <span style="margin-left:auto;font-size:11px;color:var(--text3);font-weight:600">3연승 이상</span></div>
      <div class="ur-list-box">
      ${topStreaks.map((x,i)=>{
        const p=x.p;
        const medal = i<3 ? ['🥇','🥈','🥉'][i] : `${i+1}`;
        const t = Math.min(1, x.streak/Math.max(maxStreak,1));
        const hue = Math.round(38 - t*20);
        const badgeBg = `linear-gradient(135deg,hsl(${hue} 92% 56%),hsl(${Math.max(hue-16,0)} 85% 46%))`;
        const safeName = (p.name||'').replace(/'/g,"\\'");
        return `<div class="ur-winner-row${i%2?' is-alt':''}" onclick="if(typeof openPlayerModal==='function')openPlayerModal('${safeName}')">
          <span style="width:20px;text-align:center;font-size:12px;font-weight:900;color:var(--text3);flex-shrink:0">${medal}</span>
          ${_urAvatarHTML(p, col, 32)}
          <span style="font-size:12px;font-weight:800;color:${col};min-width:64px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1">${escHTML(p.name||'')}</span>
          <span style="display:inline-flex;align-items:center;gap:3px;padding:4px 11px;border-radius:999px;font-size:11px;font-weight:900;color:#fff;background:${badgeBg};flex-shrink:0">🔥 ${x.streak}연승</span>
        </div>`;
      }).join('')}
      </div>
    </div>`;
  }

  // 라이벌 대학 상대전적
  const rivals = _urRivalStats(tieredMembers, univName).slice(0,6);
  if (rivals.length) {
    h += `<div class="ur-panel" id="ur-sec-rival">
      <div class="ur-panel-title">⚔️ 라이벌 대학 상대전적</div>
      <div class="ur-list-box">
      ${rivals.map((r,i)=>{
        const rCol = (typeof gc==='function' ? gc(r.name) : '') || '#64748b';
        // (2026-08-19) 라이벌 상대전적 바는 "우리 팀"의 성적을 보여주는 것이라
        // 상대(rCol) 색이 아니라 우리 대학 고유색(col)을 승률에 따라 옅게~진하게
        const rWrColBar = (typeof _prTintByPercent==='function') ? _prTintByPercent(r.wr??0, col, 95).css : (r.wr===null?'#94a3b8':r.wr>=55?'#10b981':r.wr>=45?'#f59e0b':'#ef4444');
        // 퍼센트 숫자는 흰색 카드 배경 위 텍스트라 너무 옅어지면 안 보이므로 명도 상한을 낮춤
        const rWrColText = (typeof _prTintByPercent==='function') ? _prTintByPercent(r.wr??0, col, 58).css : rWrColBar;
        const safeRival = String(r.name||'').replace(/'/g,"\\'");
        const rUCfg = (typeof univCfg!=='undefined'?univCfg:[]).find(u=>u && u.name===r.name);
        const rIconUrl = rUCfg ? (rUCfg.icon || rUCfg.img || (typeof UNIV_ICONS!=='undefined'?UNIV_ICONS[r.name]:'') || '') : '';
        const rLogoSrc = rIconUrl ? (typeof toHttpsUrl==='function'?toHttpsUrl(rIconUrl):rIconUrl) : '';
        const rLogoHtml = rLogoSrc
          ? `<span class="ur-rival-logo"><img src="${rLogoSrc}" onerror="this.parentNode.style.display='none'"></span>`
          : `<span class="ur-rival-logo" style="color:${rCol};font-weight:900">${escHTML((r.name||'?').slice(0,1))}</span>`;
        return `<div class="ur-rival-row${i%2?' is-alt':''}" onclick="if(typeof openUnivModal==='function')openUnivModal('${safeRival}')">
          ${rLogoHtml}
          <span style="font-size:12px;font-weight:800;color:${rCol};min-width:70px;max-width:90px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${escHTML(r.name)}</span>
          <div class="ur-bar-track"><div style="width:${r.wr??0}%;height:100%;background:linear-gradient(90deg,#22d3ee,#38bdf8,#3b82f6,#6366f1);border-radius:999px"></div></div>
          <span style="font-size:11.5px;font-weight:900;color:${rWrColText};min-width:38px;text-align:right">${r.wr!==null?r.wr+'%':'-'}</span>
          <span style="font-size:10.5px;color:var(--text3);min-width:64px;text-align:right">${r.w}승 ${r.l}패</span>
        </div>`;
      }).join('')}
      </div>
    </div>`;
  }

  h += `</div>`;
  h += `</div>`;

  // 📈 핵심 분석 & AI 코멘트 (스트리머 리포트와 같은 톤)
  h += `<div class="ur-panel" id="ur-sec-insights">
    <div class="ur-panel-title">📈 핵심 분석 &amp; AI 코멘트</div>
    ${_urKeyInsightsHTML(univName, raceRecord, topWinners, topStreaks, rivals, totalW, totalL)}
    <div style="margin-top:10px">${_urAiCommentHTML(univName, totalW, totalL, raceRecord, topStreaks, rivals)}</div>
  </div>`;

  // 로스터
  const rosterSortKey = (typeof localStorage!=='undefined' && localStorage.getItem('su_ur_roster_sort')) || 'tier';
  const wrByName = new Map(playerAgg.map(x=>[x.p.name, x]));
  const _urRosterSortFn = (a,b)=>{
    if (rosterSortKey==='wr') {
      const wa = wrByName.get(a.name)?.wr, wb = wrByName.get(b.name)?.wr;
      if (wa===null || wa===undefined) return 1;
      if (wb===null || wb===undefined) return -1;
      return wb-wa;
    }
    if (rosterSortKey==='recent') {
      const ha = Array.isArray(a.history)?a.history:[], hb = Array.isArray(b.history)?b.history:[];
      const da = ha.reduce((m,x)=>Math.max(m,_urDateNum(x.date||x.d||'')),0);
      const db = hb.reduce((m,x)=>Math.max(m,_urDateNum(x.date||x.d||'')),0);
      return db-da;
    }
    if (rosterSortKey==='name') return String(a.name||'').localeCompare(String(b.name||''),'ko');
    const ia=TIERS_LOCAL.indexOf(a.tier||''), ib=TIERS_LOCAL.indexOf(b.tier||'');
    return (ia>=0?ia:999)-(ib>=0?ib:999);
  };
  const rosterOrdered = [...roledMembers, ...[...tieredMembers].sort(_urRosterSortFn)];
  const rosterSortOptions = [
    {v:'tier', l:'🏆 티어순'}, {v:'wr', l:'📈 승률순'}, {v:'recent', l:'🕘 최근활동순'}, {v:'name', l:'가나다순'}
  ];
  // 로스터는 항상 전체 인원을 보여준다 (더보기 없음)
  h += `<div class="ur-panel" id="ur-sec-roster">
    <div class="ur-panel-title">📋 로스터
      <div class="ur-roster-sort-wrap">
        <select class="ur-roster-sort" onchange="localStorage.setItem('su_ur_roster_sort',this.value);if(typeof render==='function')render();">
          ${rosterSortOptions.map(o=>`<option value="${o.v}" ${o.v===rosterSortKey?'selected':''}>${o.l}</option>`).join('')}
        </select>
        <span style="font-size:11px;color:var(--text3);font-weight:600">${allMembers.length}명</span>
      </div>
    </div>
    <div class="ur-roster-grid">
      ${rosterOrdered.map(p=>{
        const tc = typeof getTierBtnColor==='function' && p.tier ? getTierBtnColor(p.tier) : '#64748b';
        const tcol = typeof getTierBtnTextColor==='function' && p.tier ? (getTierBtnTextColor(p.tier)||'#fff') : '#fff';
        const rIco = p.race==='P'?'🔮':p.race==='T'?'⚔️':p.race==='Z'?'🦎':'';
        const safeName = (p.name||'').replace(/'/g,"\\'");
        const photoUrl = p.photo ? (typeof toThumbUrl==='function'?toThumbUrl(p.photo,220):p.photo) : '';
        const photoOrig = p.photo ? (typeof toHttpsUrl==='function'?toHttpsUrl(p.photo):p.photo) : '';
        const hasPhoto = !!photoUrl;
        const initials = (p.name||'?').slice(0,1);
        const _2ndRoster = (hasPhoto && typeof _phSwap2ndHTML==='function' && p.secondProfileFile)
          ? _phSwap2ndHTML(p.secondProfileFile, {extraClass:'ur-roster-photo', style:'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:top center;z-index:1'})
          : '';
        return `<div class="ur-roster-card${_2ndRoster?' ph-swap':''}" style="box-shadow:0 0 0 1.5px ${col}33,0 8px 18px rgba(15,23,42,.08)" onclick="if(typeof openPlayerModal==='function')openPlayerModal('${safeName}')">
          ${hasPhoto?`<img class="ur-roster-photo" src="${photoUrl}" data-orig="${photoOrig}" loading="lazy" alt="${escHTML(p.name||'')}" onerror="if(this.dataset.orig&&this.src!==this.dataset.orig){this.src=this.dataset.orig}else{this.style.display='none';this.nextElementSibling.style.display='flex'}">`:''}
          ${_2ndRoster}
          <div class="ur-roster-fallback" style="${hasPhoto?'display:none':'display:flex'};background:${col}">${initials}</div>
          <div class="ur-roster-bottom">
            <span class="ur-roster-name">${rIco?rIco+' ':''}${escHTML(p.name||'')}</span>
            ${p.role?`<span class="ur-roster-tier" style="background:${col}cc;color:#fff">${escHTML(p.role)}</span>`:(p.tier?`<span class="ur-roster-tier" style="background:${tc};color:${tcol}">${escHTML(p.tier)}</span>`:'')}
          </div>
        </div>`;
      }).join('')}
    </div>
  </div>`;

  // 최근 경기 (대전기록 탭처럼 연도/월 필터 + 정렬 + 더보기 페이지네이션)
  const _urRecentSection = 'ur-recent';
  const _urAllRecent = _urRecentMatches(tieredMembers);
  const _urRecentFiltered = _urAllRecent.filter(m => typeof passDateFilter!=='function' || passDateFilter(m.date||'', _urRecentSection));
  const _urRecentDir = (typeof recSortDir!=='undefined' && (recSortDir==='asc'||recSortDir==='desc')) ? recSortDir : 'desc';
  const _urRecentSorted = [..._urRecentFiltered].sort((a,b)=> _urRecentDir==='asc' ? (a.date||'').localeCompare(b.date||'') : (b.date||'').localeCompare(a.date||''));
  const _urRecentPageSize = 15;
  window._urRecentPage = window._urRecentPage || {};
  if (window._urRecentPage[univName]===undefined) window._urRecentPage[univName]=0;
  const _urRecentLoaded = (window._urRecentPage[univName]+1)*_urRecentPageSize;
  const recentMatches = _urRecentSorted.slice(0, _urRecentLoaded);
  const _urRecentHasMore = _urRecentSorted.length>recentMatches.length;
  const _urUnivNameEsc = univName.replace(/'/g,"\\'");

  if (_urAllRecent.length) {
    const _urRecentFilterBar = (typeof buildYearMonthFilterControls==='function')
      ? `<div class="hist-inlinebar no-export" style="margin-bottom:10px">
          ${buildYearMonthFilterControls(_urRecentSection, true)}
          <span class="hist-inline-sep"></span>
          <div class="hist-ctrl-group">
            <button class="pill ${_urRecentDir==='desc'?'on':''}" style="flex-shrink:0;white-space:nowrap" onclick="recSortDir='desc';window._urRecentPage=window._urRecentPage||{};window._urRecentPage['${_urUnivNameEsc}']=0;render()">최신순 ↓</button>
            <button class="pill ${_urRecentDir==='asc'?'on':''}" style="flex-shrink:0;white-space:nowrap" onclick="recSortDir='asc';window._urRecentPage=window._urRecentPage||{};window._urRecentPage['${_urUnivNameEsc}']=0;render()">오래된순 ↑</button>
          </div>
        </div>`
      : '';
    const _urMapFilter = window._urRecentMapFilter || '';
    const _urMapFilterChip = _urMapFilter
      ? `<button type="button" class="no-export" onclick="window._urRecentMapFilter='';render()" style="padding:3px 10px;border-radius:999px;border:1px solid ${col};background:${col}1a;color:${col};font-size:10px;font-weight:900;cursor:pointer;margin-left:6px">🗺️ ${escHTML(_urMapFilter)} ✕</button>`
      : '';
    const _urRecentByMap = _urMapFilter ? recentMatches.filter(m=>m.map===_urMapFilter) : recentMatches;
    h += `<div class="ur-panel" id="ur-sec-recent">
      <div class="ur-panel-title">📅 최근 경기 <small style="font-weight:700;color:var(--text3);margin-left:4px">${_urRecentSorted.length}경기</small>${_urMapFilterChip}</div>
      ${_urRecentFilterBar}
      ${!_urRecentByMap.length?`<div style="padding:24px;text-align:center;color:var(--gray-l)">선택한 조건에 기록이 없습니다.</div>`:`<table class="ur-recent-table"><thead><tr>
        <th style="width:66px">날짜</th><th style="width:70px">종류</th><th style="width:150px">스트리머</th><th style="width:40px;text-align:center">결과</th><th style="width:28px;text-align:center">vs</th><th style="width:120px">대학</th><th style="width:150px">상대</th><th style="width:80px;text-align:right">맵</th>
      </tr></thead><tbody>
        ${_urRecentByMap.map(m=>{
          const isWin = m.result==='승';
          const safeMName = String(m.name||'').replace(/'/g,"\\'");
          const safeOppName = String(m.opp||'').replace(/'/g,"\\'");
          const safeMap = String(m.map||'').replace(/'/g,"\\'");
          const oppAvatarHtml = m.opp ? _urRecentAvatarHTML(m.opp, m.oppPhoto, m.oppSecondProfileFile, '#94a3b8') : '';
          const myRaceBadge = m.race ? `<span class="rbadge r${escHTML(m.race)}" style="font-size:9px;padding:1px 5px;flex-shrink:0">${escHTML(m.race)}</span>` : '';
          const oppRaceBadge = m.oppRace ? `<span class="rbadge r${escHTML(m.oppRace)}" style="font-size:9px;padding:1px 5px;flex-shrink:0">${escHTML(m.oppRace)}</span>` : '';
          const oppUnivHtml = (m.oppUniv && m.oppUniv!=='무소속' && typeof gUI==='function')
            ? `<span style="display:inline-flex;align-items:center;gap:4px;cursor:pointer;color:var(--text2);font-size:12px;font-weight:900;max-width:112px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${escHTML(m.oppUniv)}" onclick="event.stopPropagation();if(typeof openUnivModal==='function')openUnivModal('${String(m.oppUniv).replace(/'/g,"\\'")}')">${gUI(m.oppUniv,(typeof getUnivLogoSizeStr==='function'?getUnivLogoSizeStr(m.oppUniv,'players','22px'):'22px'))}<span style="overflow:hidden;text-overflow:ellipsis">${escHTML(m.oppUniv)}</span></span>`
            : '';
          const modeLbl = (typeof _pdNormalizeRecentModeLabel==='function') ? _pdNormalizeRecentModeLabel(m.mode) : (m.mode||'');
          const modeColor = (typeof _pdRecentModeColors==='function' && modeLbl) ? (_pdRecentModeColors()[modeLbl]||'#6b7280') : '#6b7280';
          const modeBadge = modeLbl ? `<span class="ur-recent-mode" style="background:${modeColor}">${escHTML(modeLbl)}</span>` : '';
          return `<tr class="ur-recent-row ${isWin?'is-win':'is-lose'}">
            <td style="width:66px;color:var(--text3);font-weight:700;white-space:nowrap;border-bottom:none">${escHTML(_urFmtRecentDate(m.date))}</td>
            <td class="ur-recent-mode-cell">${modeBadge}</td>
            <td class="ur-recent-name-cell" style="font-weight:800;color:${col};cursor:pointer" onclick="if(typeof openPlayerModal==='function')openPlayerModal('${safeMName}')">
              <span class="ur-recent-inline">${_urRecentAvatarHTML(m.name, m.photo, m.secondProfileFile, col)}<span style="display:inline-flex;align-items:center;gap:14px">${escHTML(m.name)}${myRaceBadge}</span></span>
            </td>
            <td style="width:40px;text-align:center"><span class="ur-recent-result ${isWin?'is-win':'is-lose'}">${m.result}</span></td>
            <td class="ur-vs-cell" style="width:28px;text-align:center">${m.opp?`<span class="ur-vs-label">vs</span>`:''}</td>
            <td style="width:120px">${oppUnivHtml}</td>
            <td class="ur-recent-opp-cell" style="color:var(--text2);${m.opp?'cursor:pointer':''}" ${m.opp?`onclick="if(typeof openPlayerModal==='function')openPlayerModal('${safeOppName}')"`:''}>
              <span class="ur-recent-inline">${oppAvatarHtml}<span style="display:inline-flex;align-items:center;gap:7px">${escHTML(m.opp||'-')}${oppRaceBadge}</span></span>
            </td>
            <td style="width:80px;text-align:right">${m.map?`<span class="ur-recent-map" title="이 맵으로 필터링" onclick="window._urRecentMapFilter='${safeMap}';render()">${escHTML(m.map)}</span>`:''}</td>
          </tr>`;
        }).join('')}
      </tbody></table>`}
      ${_urRecentSorted.length>_urRecentPageSize?`<div class="no-export" style="display:flex;justify-content:center;align-items:center;gap:8px;margin-top:12px;flex-wrap:wrap">
        <span style="font-size:var(--fs-sm);color:var(--gray-l)">${recentMatches.length} / ${_urRecentSorted.length}건 표시 중</span>
        ${_urRecentHasMore?`<button class="btn btn-sm" onclick="window._urRecentPage=window._urRecentPage||{};window._urRecentPage['${_urUnivNameEsc}']=(window._urRecentPage['${_urUnivNameEsc}']||0)+1;render()">더 보기 ↓</button>`:''}
        ${window._urRecentPage[univName]>0?`<button class="btn btn-sm btn-w" onclick="window._urRecentPage=window._urRecentPage||{};window._urRecentPage['${_urUnivNameEsc}']=0;render()">처음으로</button>`:''}
      </div>`:''}
    </div>`;
  }

  h += `</div>`;

  return h;
}

try{
  window.statsUnivReportHTML = statsUnivReportHTML;
}catch(e){}

/* ─── 🔊 대학 리포트 음성듣기(TTS) ─── */
function _urPushSpoken(queue, text){
  if (!text) return;
  const parts = String(text).split(/,\s+/).map(s=>s.trim()).filter(Boolean);
  parts.forEach((part,i)=>{
    const isLast = (i === parts.length-1);
    queue.push(isLast ? {text:part} : {text:part, gapMs:140});
  });
}

function _urBuildSpeakQueue(){
  const univName = window._urName;
  const uCfg = univName ? (typeof univCfg!=='undefined'?univCfg:[]).find(u=>u && u.name===univName) : null;
  if (!univName || !uCfg) return [];

  const allMembers = (players||[]).filter(p => p && !p.hidden && !p.retired && !p.hideFromBoard && String(p?.univ||'').trim()===univName);
  const hasRoleFn = (typeof _b2HasRole==='function') ? _b2HasRole : (()=>false);
  const roledMembers = allMembers.filter(p=>hasRoleFn(p));
  const tieredMembers = allMembers.filter(p=>!hasRoleFn(p));
  if (!allMembers.length) return [];

  const playerAgg = tieredMembers.map(p=>{
    const decided = (Array.isArray(p.history)?p.history:[]).filter(x=>x && (x.result==='승'||x.result==='패'));
    const sortedDesc = [...decided].sort((a,b)=>_urDateNum(b.date||b.d||'')-_urDateNum(a.date||a.d||''));
    let streak = 0;
    for (const x of sortedDesc) { if (x.result==='승') streak++; else break; }
    const win = decided.filter(x=>x.result==='승').length;
    const loss = decided.length - win;
    return { p, win, loss, games:decided.length, wr:decided.length?Math.round(win/decided.length*100):null, streak };
  });
  let totalW=0, totalL=0;
  playerAgg.forEach(x=>{ totalW+=x.win; totalL+=x.loss; });
  const totalG = totalW+totalL;
  const totalWr = totalG>0 ? Math.round(totalW/totalG*100) : null;

  const queue = [];
  queue.push({text:`${univName} 대학 리포트를 읽어드리겠습니다.`});
  _urPushSpoken(queue, `총 ${allMembers.length}명이 소속되어 있고, 일반 ${tieredMembers.length}명, 직책 ${roledMembers.length}명입니다.`);

  if (totalG>0) {
    _urPushSpoken(queue, `통산 전적은 ${totalG}전 ${totalW}승 ${totalL}패, 승률 ${totalWr}%입니다.`);
  } else {
    queue.push({text:`아직 등록된 통산 전적이 없습니다.`});
  }

  const RACE_KO = {P:'프로토스', T:'테란', Z:'저그'};
  const raceCts = {P:0,T:0,Z:0,'?':0};
  const raceRecord = {P:{w:0,l:0},T:{w:0,l:0},Z:{w:0,l:0}};
  tieredMembers.forEach(p=>{
    const r=p.race||'?'; raceCts[r in raceCts?r:'?']++;
    if (p.race in raceRecord) {
      (Array.isArray(p.history)?p.history:[]).forEach(h=>{
        if (h.result==='승') raceRecord[p.race].w++;
        else if (h.result==='패') raceRecord[p.race].l++;
      });
    }
  });
  const raceParts = ['P','T','Z'].filter(r=>raceCts[r]>0).map(r=>`${RACE_KO[r]} ${raceCts[r]}명`);
  if (raceParts.length) _urPushSpoken(queue, `종족 구성은 ${raceParts.join(', ')}입니다.`);

  const tierSet = new Set(tieredMembers.map(p=>p.tier||'미정'));
  if (tierSet.size) _urPushSpoken(queue, `티어는 총 ${tierSet.size}개로 구성되어 있습니다.`);

  { // 최근 7일 활동
    const _cut = new Date(); _cut.setDate(_cut.getDate()-6); _cut.setHours(0,0,0,0);
    const _cutNum = parseInt(_cut.toISOString().slice(0,10).replace(/-/g,''));
    let last7Total = 0;
    tieredMembers.forEach(p=>{
      (Array.isArray(p.history)?p.history:[]).forEach(h=>{
        if (!h || (h.result!=='승' && h.result!=='패')) return;
        if (_urDateNum(h.date||h.d||'')>=_cutNum) last7Total++;
      });
    });
    _urPushSpoken(queue, `최근 7일간 총 ${last7Total}경기가 진행되었습니다.`);
  }

  const topWinners = _urTopWinners(playerAgg, 1);
  if (topWinners.length) {
    const x = topWinners[0];
    const spName = (window.SUTTS && window.SUTTS.speakName) ? window.SUTTS.speakName(x.p) : x.p.name;
    _urPushSpoken(queue, `팀 내 다승왕은 ${spName}로, ${x.win}승 ${x.loss}패를 기록했습니다.`);
  }

  const topStreaks = _urTopStreaks(playerAgg, 1);
  if (topStreaks.length) {
    const x = topStreaks[0];
    const spName = (window.SUTTS && window.SUTTS.speakName) ? window.SUTTS.speakName(x.p) : x.p.name;
    _urPushSpoken(queue, `현재 연승 리더는 ${spName}로, ${x.streak}연승을 달리고 있습니다.`);
  }

  const rivals = _urRivalStats(tieredMembers, univName);
  if (rivals.length) {
    const top = rivals[0];
    _urPushSpoken(queue, `가장 많이 맞붙은 라이벌 대학은 ${top.name}로, ${top.w}승 ${top.l}패를 기록했습니다.`);
  }

  if (totalG>0) {
    // 핵심 분석 & AI 코멘트 — 첫 문장(통산 승률 개요)은 위에서 이미 읽었으므로 중복 방지를 위해 건너뜀
    const {sentences: aiSentences} = _urAiCommentSentences(univName, totalW, totalL, raceRecord, topStreaks, rivals);
    aiSentences.slice(1).forEach(s=>_urPushSpoken(queue, s));
  }

  queue.push({text:`이상으로 ${univName} 대학 리포트를 마칩니다.`});
  return queue;
}

function _urSpeakBtnLabel(){
  const btn = document.getElementById('ur-report-speak-btn');
  if (!btn) return;
  const speaking = !!(window.SUTTS && window.SUTTS.isSpeaking());
  const paused = !speaking && !!(window.SUTTS && window.SUTTS.isPaused && window.SUTTS.isPaused());
  btn.innerHTML = speaking ? '⏸<span>일시정지</span>' : (paused ? '▶<span>이어듣기</span>' : '🔊<span>음성듣기</span>');
}

function _urToggleSpeak(){
  if (!window.SUTTS || !('speechSynthesis' in window)) { alert('이 브라우저는 음성 안내를 지원하지 않습니다.'); return; }
  if (window.SUTTS.isSpeaking()) { window.SUTTS.pause(); _urSpeakBtnLabel(); return; }
  if (window.SUTTS.isPaused && window.SUTTS.isPaused()) { window.SUTTS.resume(); _urSpeakBtnLabel(); return; }
  const queue = _urBuildSpeakQueue();
  if (!queue.length) { alert('음성으로 읽어줄 리포트 내용이 없습니다.'); return; }
  window.SUTTS.speak(queue, { onEnd:_urSpeakBtnLabel });
  _urSpeakBtnLabel();
}

/* ─── 📸 대학 리포트 이미지 저장 (스트리머 리포트처럼 배경 스타일 여러 개 선택 가능) ─── */
var UR_BG_STYLES = [
  ['none','⚪ 기본'],
  ['univ','🏫 대학색'],
  ['report','📄 보고서']
];
function _urHexToRgba(hex, a){
  try{
    let h = String(hex||'').replace('#','');
    if (h.length===3) h = h.split('').map(c=>c+c).join('');
    const r=parseInt(h.substring(0,2),16), g=parseInt(h.substring(2,4),16), b=parseInt(h.substring(4,6),16);
    if ([r,g,b].some(isNaN)) throw 0;
    return `rgba(${r},${g},${b},${a})`;
  }catch(e){ return `rgba(37,99,235,${a})`; }
}
function _urStyleFrameColor(style, univName){
  if (style==='univ') return (univName && typeof gc==='function') ? (gc(univName)||'#6366f1') : '#6366f1';
  if (style==='report') return '#0f172a';
  return null;
}
function _urPageBgColor(){
  try{
    const el = document.getElementById('ur-report-capture');
    const src = (el && el.parentElement) || document.body;
    const cs = getComputedStyle(src);
    const varBg = cs.getPropertyValue('--bg');
    if (varBg && varBg.trim()) return varBg.trim();
    const bgColor = cs.backgroundColor;
    if (bgColor && bgColor!=='rgba(0, 0, 0, 0)' && bgColor!=='transparent') return bgColor;
  }catch(e){}
  return '#f1f5f9';
}
/* '보고서' 스타일 전용: 화려한 그림자/그라디언트/큰 라운드 대신 얇은 테두리·직각 모서리로 변형 */
var UR_REPORT_MODE_CSS = [
  '.ur-report-mode .ur-hero{background:#fff!important;border:1px solid #cbd5e1!important;border-bottom:3px solid #0f172a!important;border-radius:2px!important;backdrop-filter:none!important}',
  '.ur-report-mode .ur-panel{background:#fff!important;border:1px solid #e2e8f0!important;border-radius:2px!important;box-shadow:none!important}',
  '.ur-report-mode .ur-panel-title{border-bottom:2px solid #0f172a;padding-bottom:9px}',
  '.ur-report-mode .ur-kpi{border-radius:2px!important;background:#f8fafc!important;border:1px solid #e2e8f0!important;box-shadow:none!important}',
  '.ur-report-mode .ur-badge,.ur-report-mode .ur-roster-tier,.ur-report-mode .ur-winner-row,.ur-report-mode .ur-rival-row{border-radius:3px!important}',
  '.ur-report-mode .ur-roster-card{border-radius:4px!important}',
  '.ur-report-mode .ur-bar-track{border-radius:2px!important}',
  '.ur-report-mode, .ur-report-mode *{box-shadow:none!important}'
].join('');

async function _urGenerateReportCanvas(style){
  const el = document.getElementById('ur-report-capture');
  if (!el) throw new Error('캡처할 리포트가 없습니다.');
  const univName = window._urName;
  const frameColor = (style==='univ') ? _urStyleFrameColor(style, univName) : null;
  const bgFill = frameColor ? _urHexToRgba(frameColor, 0.16) : (style==='report' ? '#ffffff' : _urPageBgColor());
  try{ await (window.ensureHtml2Canvas && window.ensureHtml2Canvas()); }catch(e){}
  if (typeof _imgToDataUrls==='function') await _imgToDataUrls(el);
  try{ if (typeof _waitForImages==='function') await _waitForImages(el,1500); }catch(e){}
  try{ if (typeof _sanitizeUnsupportedCssFunctions==='function') _sanitizeUnsupportedCssFunctions(el); }catch(e){}
  return await html2canvas(el, {
    backgroundColor:bgFill, scale:2, useCORS:true, allowTaint:false, logging:false, imageTimeout:15000,
    onclone:(clonedDoc)=>{
      try{ clonedDoc.querySelectorAll('.no-export').forEach(n=>n.remove()); }catch(e){}
      try{ if (typeof _sanitizeUnsupportedColorsInDoc==='function') _sanitizeUnsupportedColorsInDoc(clonedDoc); }catch(e){}
      if (style==='report') {
        try{
          const cloneEl = clonedDoc.getElementById('ur-report-capture');
          if (cloneEl) cloneEl.classList.add('ur-report-mode');
          const styleTag = clonedDoc.createElement('style');
          styleTag.textContent = UR_REPORT_MODE_CSS;
          clonedDoc.head.appendChild(styleTag);
        }catch(e){}
      }
    }
  });
}

async function _urSaveReportImage(){
  const el = document.getElementById('ur-report-capture');
  if (!el) { alert('캡처할 리포트가 없습니다.'); return; }
  const name = window._urName || '대학';
  const style = window._urReportBgStyle || 'none';
  try{
    if (typeof _showSaveLoading==='function') _showSaveLoading();
    const canvas = await _urGenerateReportCanvas(style);
    window._urPendingSaveCanvas = canvas;
    window._urPendingSaveName = `${name}_대학리포트.png`;
    _urShowImagePreview(canvas, style);
  }catch(e){ alert('이미지 저장 오류: '+e.message); }
  finally{ if (typeof _hideSaveLoading==='function') _hideSaveLoading(); }
}

async function _urSwitchBgStyle(style){
  if (window._urBgSwitchBusy) return;
  window._urBgSwitchBusy = true;
  const wrap = document.getElementById('ur-img-preview-overlay');
  if (wrap) wrap.classList.add('ur-bg-loading');
  try{
    const canvas = await _urGenerateReportCanvas(style);
    window._urPendingSaveCanvas = canvas;
    window._urReportBgStyle = style;
    const imgEl = wrap ? wrap.querySelector('.ur-img-preview-body img') : null;
    if (imgEl) imgEl.src = canvas.toDataURL('image/png');
    if (wrap) wrap.querySelectorAll('.ur-bgstyle-btn').forEach(b=>b.classList.toggle('on', b.dataset.style===style));
  }catch(e){ alert('배경 변경 오류: '+e.message); }
  finally{ window._urBgSwitchBusy = false; if (wrap) wrap.classList.remove('ur-bg-loading'); }
}

function _urShowImagePreview(canvas, style){
  _urCloseImagePreview();
  const dataUrl = canvas.toDataURL('image/png');
  const curStyle = style || window._urReportBgStyle || 'none';
  const univName = window._urName;
  const wrap = document.createElement('div');
  wrap.id = 'ur-img-preview-overlay';
  wrap.style.cssText = 'position:fixed;inset:0;z-index:99999;background:rgba(15,23,42,.6);display:flex;align-items:center;justify-content:center;padding:20px';
  wrap.innerHTML = `
    <div style="background:var(--white);border-radius:20px;max-width:520px;width:100%;max-height:88vh;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 30px 60px rgba(0,0,0,.3)">
      <div style="display:flex;align-items:center;justify-content:space-between;padding:14px 16px;border-bottom:1px solid var(--border2);font-weight:900;font-size:14px;color:var(--text1)">
        <span>🖼️ 대학 리포트 이미지 미리보기</span>
        <button type="button" onclick="_urCloseImagePreview()" style="border:none;background:none;font-size:16px;cursor:pointer;color:var(--text3)">✕</button>
      </div>
      <div style="display:flex;gap:6px;flex-wrap:wrap;padding:10px 14px;border-bottom:1px solid var(--border2)">
        ${UR_BG_STYLES.map(([k,lbl])=>{
          const c = _urStyleFrameColor(k, univName);
          const dot = c ? `<span style="width:9px;height:9px;border-radius:50%;background:${c};display:inline-block;margin-right:5px"></span>` : `<span style="width:9px;height:9px;border-radius:50%;background:var(--border2);display:inline-block;margin-right:5px"></span>`;
          return `<button type="button" class="ur-btn ur-bgstyle-btn${k===curStyle?' on':''}" data-style="${k}" onclick="_urSwitchBgStyle('${k}')" style="${k===curStyle?'background:var(--blue);border-color:var(--blue);color:#fff':''}">${dot}${lbl}</button>`;
        }).join('')}
      </div>
      <div class="ur-img-preview-body" style="flex:1;overflow:auto;padding:14px;background:var(--surface)"><img src="${dataUrl}" style="width:100%;border-radius:10px;display:block" alt="대학 리포트 미리보기"></div>
      <div style="display:flex;gap:8px;justify-content:flex-end;padding:12px 16px;border-top:1px solid var(--border2)">
        <button type="button" class="ur-btn" onclick="_urCloseImagePreview()">취소</button>
        <button type="button" class="ur-btn ur-btn-primary" onclick="_urConfirmSaveImage()">📥 다운로드</button>
      </div>
    </div>`;
  wrap.addEventListener('click', (e)=>{ if (e.target===wrap) _urCloseImagePreview(); });
  document.body.appendChild(wrap);
}

function _urCloseImagePreview(){
  const el = document.getElementById('ur-img-preview-overlay');
  if (el) el.remove();
}

async function _urConfirmSaveImage(){
  const canvas = window._urPendingSaveCanvas;
  const filename = window._urPendingSaveName || '대학리포트.png';
  _urCloseImagePreview();
  if (!canvas) return;
  try{
    if (typeof _showSaveLoading==='function') _showSaveLoading();
    if (typeof _saveCanvasImage==='function') {
      await _saveCanvasImage(canvas, filename, 'png');
    } else {
      const a = document.createElement('a');
      a.href = canvas.toDataURL('image/png');
      a.download = filename;
      a.click();
    }
  }catch(e){ alert('이미지 저장 오류: '+e.message); }
  finally{
    if (typeof _hideSaveLoading==='function') _hideSaveLoading();
    window._urPendingSaveCanvas = null;
  }
}

try{
  window._urToggleSpeak = _urToggleSpeak;
  window._urSaveReportImage = _urSaveReportImage;
  window._urSwitchBgStyle = _urSwitchBgStyle;
  window._urCloseImagePreview = _urCloseImagePreview;
  window._urConfirmSaveImage = _urConfirmSaveImage;
}catch(e){}
