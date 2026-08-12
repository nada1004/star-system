const _calEscHTML = (typeof window !== 'undefined' && typeof window.escHTML === 'function')
  ? window.escHTML
  : (s)=>String(s??'').replace(/[&<>"']/g, (m)=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const _calEscJS = (typeof window !== 'undefined' && typeof window.escJS === 'function')
  ? window.escJS
  : (s)=>String(s??'')
    .replace(/\\/g,'\\\\')
    .replace(/'/g,"\\'")
    .replace(/\r/g,'\\r')
    .replace(/\n/g,'\\n');

(function _injectCalendarUiStyle(){
  if(typeof document==='undefined') return;
  if(document.getElementById('calendar-ui-style')) return;
  const s=document.createElement('style');
  s.id='calendar-ui-style';
  s.textContent = [
    '.cal-shell{display:flex;flex-direction:column;gap:14px}',
    '.cal-hero{display:flex;align-items:flex-start;justify-content:space-between;gap:14px;padding:18px 20px;border-radius:24px;background:linear-gradient(135deg,rgba(255,255,255,.98),rgba(248,250,252,.94));border:1px solid rgba(148,163,184,.18);box-shadow:0 18px 38px rgba(15,23,42,.06),inset 0 1px 0 rgba(255,255,255,.88)}',
    '.cal-hero-copy{display:flex;flex-direction:column;gap:6px;min-width:0}',
    '.cal-hero-kicker{font-size:var(--fs-caption);font-weight:900;letter-spacing:.08em;color:#2563eb;text-transform:uppercase}',
    '.cal-hero-title{font-size:24px;font-weight:950;letter-spacing:-.03em;color:var(--text1);line-height:1.15}',
    '.cal-hero-desc{font-size:var(--fs-base);line-height:1.6;color:var(--text3)}',
    '.cal-hero-badges{display:flex;flex-wrap:wrap;gap:8px;justify-content:flex-end}',
    '.cal-hero-badge{display:inline-flex;align-items:center;gap:6px;padding:8px 12px;border-radius:999px;background:rgba(255,255,255,.9);border:1px solid rgba(148,163,184,.16);font-size:var(--fs-sm);font-weight:800;color:var(--text2);box-shadow:0 10px 20px rgba(15,23,42,.04)}',
    '.cal-toolbar-card,.cal-board-card,.cal-soft-card{padding:12px 14px;border-radius:22px;background:var(--white);border:1px solid rgba(148,163,184,.14);box-shadow:0 8px 18px rgba(15,23,42,.03)}',
    '.cal-toolbar-row{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap}',
    '.cal-nav-group,.cal-view-group{display:flex;align-items:center;gap:8px;flex-wrap:wrap}',
    '.cal-filter-wrap{display:flex;flex-wrap:wrap;gap:6px}',
    '.cal-board-card{padding:14px 16px}',
    '.cal-board-month{background:var(--white);border-radius:var(--r2);border:1px solid rgba(148,163,184,.22);overflow:hidden}',
    '.cal-board-month table{border-collapse:collapse;border-spacing:0;table-layout:fixed;width:100%;background:var(--white)}',
    '.cal-board-month th{padding:11px 6px;font-size:var(--fs-caption);font-weight:900;color:var(--text3);background:rgba(100,116,139,.04);border-bottom:1px solid rgba(148,163,184,.22)}',
    '.cal-cell-empty{position:relative;background:rgba(148,148,148,.03);border:none;border-right:1px solid rgba(148,163,184,.13);border-bottom:1px solid rgba(148,163,184,.13);min-height:100px;transition:none}',
    '.cal-board-month td:last-child{border-right:none}',
    '.cal-board-month tr:last-child td{border-bottom:none}',
    '.cal-cell{position:relative;vertical-align:top;padding:9px;min-height:100px;background:#fff;border:none;border-right:1px solid rgba(148,163,184,.13);border-bottom:1px solid rgba(148,163,184,.13);cursor:default}',
    '.cal-cell.has-match{cursor:pointer}',
    '.cal-cell>*{position:relative;z-index:1}',
    '.cal-cell::before{content:"";position:absolute;inset:3px;border-radius:12px;background:transparent;box-shadow:none;pointer-events:none;transition:background .16s ease,box-shadow .16s ease;z-index:0}',
    '.cal-cell.is-sun::before,.cal-cell.is-sat::before{background:rgba(148,163,184,.05)}',
    '.cal-cell:hover::before{background:linear-gradient(180deg,#f8fafc,#eef2f7)}',
    '.cal-cell.has-match:hover::before{background:linear-gradient(180deg,#eff6ff,#e0edff);box-shadow:0 8px 18px rgba(37,99,235,.16)}',
    '.cal-cell.is-today::before{background:linear-gradient(180deg,#eff6ff,#f7fbff);box-shadow:inset 0 0 0 2px #2563eb}',
    '.cal-cell.is-today:hover::before{box-shadow:inset 0 0 0 2px #2563eb;background:linear-gradient(180deg,#e6f0ff,#eef6ff)}',
    '.cal-cell.is-past:not(.active){opacity:.6}',
    '.cal-cell.active::before{background:linear-gradient(180deg,#f5f3ff,#faf5ff);box-shadow:inset 0 0 0 2px #7c3aed}',
    '.cal-cell.active:hover::before{background:linear-gradient(180deg,#f2eeff,#ede9fe);box-shadow:inset 0 0 0 2px #7c3aed}',
    '.cal-cell.active::after{content:"✓";position:absolute;top:8px;right:8px;width:16px;height:16px;border-radius:50%;background:#7c3aed;color:#fff;font-size:10px;font-weight:900;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 10px rgba(124,58,237,.4);transition:transform .15s;z-index:1}',
    '.cal-cell.active:hover::after{transform:scale(1.15)}',
    '.cal-board-month.cal-anim-in{animation:calFadeIn .25s ease}',
    '.cal-board-month.cal-anim-in .cal-day-num.today{animation:calTodayPop .3s ease}',
    '.cal-week-list.cal-anim-in{animation:calFadeIn .25s ease}',
    '.cal-day-summary.cal-anim-in{animation:calFadeIn .25s ease}',
    '.cal-day-sections.cal-anim-in{animation:calFadeIn .25s ease}',
    '@keyframes calFadeIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}',
    '@keyframes calTodayPop{from{transform:scale(.7);opacity:.4}to{transform:scale(1);opacity:1}}',
    '.cal-month-jump{display:flex;align-items:center;gap:4px}',
    '.cal-month-jump select{padding:6px 8px;border-radius:10px;border:1px solid var(--border2);background:var(--surface);font-size:var(--fs-sm);font-weight:800;color:var(--text2);cursor:pointer}',
    '.cal-week-summary{font-size:var(--fs-sm);font-weight:800;color:var(--text3);padding:2px 4px}',
    '.cal-day-jump{padding:6px 8px;border-radius:10px;border:1px solid var(--border2);background:var(--surface);font-size:var(--fs-sm);font-weight:800;color:var(--text2)}',
    '.cal-legend-item.is-dim{opacity:.32;filter:grayscale(.4)}',
    '.cal-legend-item{cursor:pointer;transition:transform .12s,box-shadow .12s,opacity .12s}',
    '.cal-legend-item:hover{transform:translateY(-1px);box-shadow:0 6px 14px rgba(15,23,42,.18)}',
    '.cal-legend-item.is-active{outline:2px solid var(--text1);outline-offset:1px}',
    '.cal-day-num{font-weight:700;font-size:var(--fs-sm);color:var(--text1);width:26px;height:26px;border-radius:50%;display:flex;align-items:center;justify-content:center;margin-bottom:6px}',
    '.cal-day-num.today{background:linear-gradient(135deg,#2563eb,#3b82f6);color:#fff;font-weight:900;box-shadow:0 10px 18px rgba(37,99,235,.22)}',
    '.cal-week-list{display:flex;flex-direction:column;gap:8px}',
    '.cal-week-card{position:relative;display:flex;gap:12px;padding:12px 14px;border-radius:18px;background:linear-gradient(180deg,#fff,#f8fbff);border:1px solid rgba(148,163,184,.18);box-shadow:0 10px 20px rgba(15,23,42,.04);transition:transform .15s,box-shadow .15s,border-color .15s,background .15s}',
    '.cal-week-card:hover{background:linear-gradient(180deg,#f8fafc,#eef2f7);border-color:rgba(148,163,184,.5);box-shadow:0 8px 16px rgba(15,23,42,.06)}',
    '.cal-week-card.today{background:linear-gradient(180deg,#eff6ff,#dbeafe);border-color:rgba(59,130,246,.35)}',
    '.cal-week-card.today:hover{background:linear-gradient(180deg,#e3efff,#c9e0ff)}',
    '.cal-week-card.is-past{opacity:.6}',
    '.cal-week-card.active{border-width:2px;border-color:#7c3aed;box-shadow:0 0 0 3px rgba(124,58,237,.16) inset;background:linear-gradient(180deg,#f5f3ff,#faf5ff)}',
    '.cal-week-card.active:hover{background:linear-gradient(180deg,#f5f3ff,#ede9fe);border-color:#7c3aed}',
    '.cal-week-card.active::after{content:"✓";position:absolute;top:10px;right:10px;width:16px;height:16px;border-radius:50%;background:#7c3aed;color:#fff;font-size:10px;font-weight:900;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 10px rgba(124,58,237,.4)}',
    '.cal-week-card.has-match:hover{transform:translateY(-2px);box-shadow:0 16px 28px rgba(15,23,42,.08);border-color:rgba(59,130,246,.35);background:linear-gradient(180deg,#eff6ff,#e0edff)}',
    '.cal-week-count{position:absolute;top:10px;right:14px;font-size:10px;font-weight:900;color:#fff;background:linear-gradient(135deg,#2563eb,#3b82f6);padding:2px 8px;border-radius:999px;box-shadow:0 6px 14px rgba(37,99,235,.25)}',
    '.cal-week-date{min-width:54px;text-align:center}',
    '.cal-week-day{font-size:10px;font-weight:800}',
    '.cal-week-num{font-family:"Noto Sans KR",sans-serif;font-weight:950;font-size:22px;color:var(--text1);line-height:1.1}',
    '.cal-day-summary{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;padding:14px 16px;border-radius:20px;background:linear-gradient(135deg,#eff6ff,#dbeafe);border:1px solid rgba(59,130,246,.25);box-shadow:0 14px 28px rgba(37,99,235,.08)}',
    '.cal-day-summary-title{font-size:var(--fs-lg);font-weight:950;color:var(--blue)}',
    '.cal-day-summary-sub{font-size:var(--fs-sm);color:var(--text3);margin-top:4px}',
    '.cal-day-summary-actions{display:flex;gap:8px;flex-wrap:wrap}',
    '.cal-sched-card{background:linear-gradient(180deg,#fff7d6,#fef3c7);border:1px solid #fde68a;border-radius:var(--r2);margin-bottom:10px;padding:14px 16px;box-shadow:0 10px 18px rgba(146,64,14,.08)}',
    '.cal-sched-title{font-weight:900;color:#92400e;font-size:14px}',
    '.cal-inline-time{font-size:var(--fs-caption);background:#f0f6ff;border:1px solid var(--blue-ll);border-radius:999px;padding:3px 8px;color:var(--blue);font-weight:800}',
    '.cal-month-chip-row{display:flex;gap:4px;flex-wrap:wrap}',
    '.cal-month-chip{display:inline-flex;align-items:center;gap:4px;padding:2px 6px;border-radius:999px;font-size:10px;font-weight:900;white-space:nowrap}',
    '.cal-match-card{margin-bottom:10px;border-radius:20px;overflow:hidden;border:1px solid rgba(148,163,184,.18);background:linear-gradient(180deg,#fff,#f8fbff);box-shadow:0 12px 24px rgba(15,23,42,.05)}',
    '.cal-match-card .rec-sum-header{padding:14px 16px;background:linear-gradient(180deg,rgba(var(--rec-mode-rgb),.04),rgba(255,255,255,.92))}',
    '.cal-match-badge{display:inline-flex;align-items:center;gap:6px;padding:5px 10px;border-radius:999px;font-size:var(--fs-caption);font-weight:900;color:#fff;box-shadow:0 8px 16px rgba(15,23,42,.08)}',
    '.cal-match-meta{display:flex;align-items:center;gap:8px;flex-wrap:wrap;min-width:0;flex:1}',
    '.cal-match-result{font-size:var(--fs-caption);font-weight:900;padding:5px 10px;border-radius:999px;background:rgba(15,23,42,.04);color:var(--text2)}',
    '.cal-match-result.is-win{background:rgba(34,197,94,.12);color:#15803d}',
    '.cal-match-result.is-pending{background:rgba(148,163,184,.14);color:var(--gray-l)}',
    '.cal-match-card .ubadge{box-shadow:0 8px 16px rgba(15,23,42,.08)}',
    '.cal-match-card .rec-sum-score{padding:4px 10px;border-radius:999px;background:rgba(15,23,42,.04)}',
    '.cal-match-actions{margin-left:auto;display:flex;gap:6px;align-items:center;flex-wrap:wrap}',
    '.cal-share-row{margin-top:10px;padding-top:10px;border-top:1px solid var(--border);display:flex;justify-content:flex-end}',
    '.cal-match-card .rec-detail-area{background:linear-gradient(180deg,rgba(248,250,252,.88),rgba(241,245,249,.92));border-top:1px solid rgba(148,163,184,.18)}',
    '.cal-match-card .btn-detail{border-radius:999px;padding:7px 12px;box-shadow:none}',
    '.cal-day-sections{display:flex;flex-direction:column;gap:16px}',
    '.cal-day-sec{padding:14px;border-radius:18px;background:linear-gradient(180deg,#fff,#f8fbff);border:1px solid rgba(148,163,184,.18);box-shadow:0 10px 20px rgba(15,23,42,.04)}',
    '.cal-day-sec-title{display:flex;align-items:center;gap:8px;font-size:var(--fs-sm);font-weight:900;color:var(--text2);margin-bottom:10px}',
    '.cal-day-sec-pill{background:var(--surface);border:1px solid var(--border);padding:4px 10px;border-radius:999px}',
    '.cal-legend{display:flex;align-items:center;gap:6px;flex-wrap:wrap;padding:10px 12px;border-radius:18px;background:linear-gradient(180deg,rgba(255,255,255,.98),rgba(248,250,252,.94));border:1px solid rgba(148,163,184,.18);font-size:10px;color:var(--gray-l);box-shadow:0 10px 20px rgba(15,23,42,.04)}',
    '.cal-legend-item{color:#fff;border-radius:999px;padding:3px 8px;font-size:10px;font-weight:800}',
    '.cal-detail-wrap{margin-top:14px}',
    '.cal-undated{margin-bottom:12px;background:linear-gradient(180deg,#fffbeb,#fef3c7);border:1px solid #fde68a;border-radius:18px;padding:12px 14px;box-shadow:0 10px 18px rgba(146,64,14,.08)}',
    '.cal-undated-chips{display:flex;flex-wrap:wrap;gap:6px}',
    '.cal-undated-chip{font-size:10px;background:#fff7d6;border:1px solid #fde68a;border-radius:999px;padding:3px 8px;color:#92400e;font-weight:800}',
    '.cal-empty-state{padding:40px 20px;text-align:center;color:var(--gray-l)}',
    'body.dark .cal-hero,body.dark .cal-toolbar-card,body.dark .cal-board-card,body.dark .cal-soft-card,body.dark .cal-legend{background:#0f172a;border-color:#334155;box-shadow:0 8px 18px rgba(0,0,0,.2)}',
    'body.dark .cal-board-month,body.dark .cal-board-month table{background:#0f172a}',
    'body.dark .cal-hero-title{color:#f8fafc}',
    'body.dark .cal-hero-desc{color:#94a3b8}',
    'body.dark .cal-hero-badge{background:rgba(30,41,59,.78);border-color:#334155;color:#cbd5e1}',
    'body.dark .cal-board-month{border-color:#2d3f55}',
    'body.dark .cal-board-month th{background:rgba(30,41,59,.6);border-color:#2d3f55}',
    'body.dark .cal-cell,body.dark .cal-week-card,body.dark .cal-day-sec{background:linear-gradient(180deg,rgba(15,23,42,.94),rgba(15,23,42,.9));border-color:#2d3f55;box-shadow:0 12px 22px rgba(0,0,0,.18)}',
    'body.dark .cal-cell{box-shadow:none!important}',
    'body.dark .cal-cell.is-sun::before,body.dark .cal-cell.is-sat::before{background:rgba(148,163,184,.05)}',
    'body.dark .cal-cell:hover::before{background:linear-gradient(180deg,rgba(51,65,85,.95),rgba(41,55,75,.9))}',
    'body.dark .cal-cell.has-match:hover::before{background:linear-gradient(180deg,rgba(29,58,95,.85),rgba(30,58,138,.65));box-shadow:0 8px 18px rgba(0,0,0,.35)}',
    'body.dark .cal-cell.is-today::before{background:linear-gradient(180deg,#17263c,#132033);box-shadow:inset 0 0 0 2px #60a5fa}',
    'body.dark .cal-cell.is-today:hover::before{background:linear-gradient(180deg,#1c3253,#152943);box-shadow:inset 0 0 0 2px #60a5fa}',
    'body.dark .cal-cell.is-past:not(.active){opacity:.55}',
    'body.dark .cal-cell.active::before{background:linear-gradient(180deg,#2e1f47,#241a38);box-shadow:inset 0 0 0 2px #a78bfa}',
    'body.dark .cal-cell.active:hover::before{background:linear-gradient(180deg,#33224e,#291c3d);box-shadow:inset 0 0 0 2px #a78bfa}',
    'body.dark .cal-cell.active::after{background:#a78bfa;box-shadow:0 4px 10px rgba(167,139,250,.35)}',
    'body.dark .cal-cell-empty{background:rgba(100,100,100,.12)}',
    'body.dark .cal-week-card:hover{background:linear-gradient(180deg,rgba(51,65,85,.95),rgba(41,55,75,.9))!important;border-color:rgba(148,163,184,.5)!important}',
    'body.dark .cal-week-card.today{background:linear-gradient(180deg,#17263c,#132033)!important;border-color:rgba(96,165,250,.45)!important}',
    'body.dark .cal-week-card.today:hover{background:linear-gradient(180deg,#1c3253,#152943)!important}',
    'body.dark .cal-week-card.has-match:hover{box-shadow:0 16px 28px rgba(0,0,0,.32);border-color:rgba(96,165,250,.5)!important;background:linear-gradient(180deg,rgba(29,58,95,.85),rgba(30,58,138,.65))!important}',
    'body.dark .cal-week-card.active{border-color:#a78bfa!important;box-shadow:0 0 0 3px rgba(167,139,250,.22) inset;background:linear-gradient(180deg,#2e1f47,#241a38)!important}',
    'body.dark .cal-week-card.active:hover{background:linear-gradient(180deg,#33224e,#291c3d)!important;border-color:#a78bfa!important}',
    'body.dark .cal-week-card.active::after{background:#a78bfa;box-shadow:0 4px 10px rgba(167,139,250,.35)}',
    'body.dark .cal-month-jump select,body.dark .cal-day-jump{background:rgba(15,23,42,.7);border-color:#334155;color:#e2e8f0}',
    'body.dark .cal-week-num{color:#f8fafc}',
    'body.dark .cal-day-summary{background:linear-gradient(135deg,#132033,#17263c);border-color:#1d4ed8}',
    'body.dark .cal-day-summary-title{color:#93c5fd}',
    'body.dark .cal-sched-card{background:linear-gradient(180deg,rgba(120,53,15,.28),rgba(120,53,15,.18));border-color:#92400e}',
    'body.dark .cal-sched-title{color:#fde68a}',
    'body.dark .cal-match-card{background:linear-gradient(180deg,rgba(15,23,42,.94),rgba(15,23,42,.9));border-color:#334155;box-shadow:0 12px 22px rgba(0,0,0,.18)}',
    'body.dark .cal-match-card .rec-sum-header{background:linear-gradient(180deg,rgba(var(--rec-mode-rgb),.16),rgba(15,23,42,.78))}',
    'body.dark .cal-match-result{background:rgba(148,163,184,.12);color:#e2e8f0}',
    'body.dark .cal-match-result.is-win{background:rgba(34,197,94,.18);color:#86efac}',
    'body.dark .cal-match-result.is-pending{background:rgba(148,163,184,.16);color:#cbd5e1}',
    'body.dark .cal-match-card .rec-sum-score{background:rgba(148,163,184,.1)}',
    'body.dark .cal-match-card .rec-detail-area{background:linear-gradient(180deg,rgba(2,6,23,.22),rgba(15,23,42,.68));border-top-color:#334155}',
    'body.dark .cal-day-num{color:#e2e8f0}',
    'body.dark .cal-undated{background:linear-gradient(180deg,rgba(120,53,15,.28),rgba(120,53,15,.18));border-color:#92400e}',
    'body.dark .cal-undated-chip{background:rgba(120,53,15,.18);border-color:#92400e;color:#fde68a}',
    '@media (max-width:780px){.cal-hero{flex-direction:column;padding:16px;border-radius:20px}.cal-hero-title{font-size:20px}.cal-hero-badges{justify-content:flex-start}.cal-toolbar-card,.cal-board-card,.cal-soft-card{padding:10px}.cal-cell,.cal-cell-empty{min-height:96px}.cal-month-chip{font-size:9px;padding:1px 5px}}',
    '@media (max-width:768px){.cal-hero{display:none}}'
  ].join('');
  document.head.appendChild(s);
})();

function rCal(C,T){
  T.textContent='📅 경기 캘린더';
  if(typeof calView==='undefined' || !String(calView||'')){
    try{ window.calView = (localStorage.getItem('su_cal_view') || 'month'); }catch(e){ window.calView='month'; }
  }
  if(calView!=='month' && calView!=='week' && calView!=='day') window.calView='month';
  if(typeof calYear==='undefined' || !isFinite(calYear)){
    const d=new Date(); window.calYear=d.getFullYear();
  }
  if(typeof calMonth==='undefined' || !isFinite(calMonth)){
    const d=new Date(); window.calMonth=d.getMonth();
  }
  if(typeof calWeekOffset==='undefined' || !isFinite(calWeekOffset)) window.calWeekOffset=0;
  if(typeof calDayDate==='undefined') window.calDayDate='';
  if(typeof calTypeFilter==='undefined' || !String(calTypeFilter||'')) window.calTypeFilter='all';
  if(typeof window._calSearchQ==='undefined') window._calSearchQ='';
  if(typeof window._calUndatedExpanded==='undefined') window._calUndatedExpanded=false;
  const _li = (typeof isLoggedIn!=='undefined' ? !!isLoggedIn : false) || !!window.isLoggedIn;

  const _enableSubFilter = (localStorage.getItem('su_submenu_filter_enabled') ?? '1') === '1';
  if(window._calFilterOpen===undefined){
    try{ window._calFilterOpen = (localStorage.getItem('su_cal_filter_open') ?? '1') === '1'; }
    catch(e){ window._calFilterOpen = true; }
  }

  // Feature 3: 뷰 저장
  try{ localStorage.setItem('su_cal_view', calView); }catch(e){}

  // 모든 경기 데이터 캐싱
  if(typeof calScheduled==='undefined') window.calScheduled=[];
  window._calScheduled=calScheduled;
  const _calT=localStorage.getItem('su_last_save_time')||'0';
  if(_calT!==window._calMatchCacheTime){
    window._calMatchCache=null;
    window._calDateMatchMap=null;
    window._calRawDateMatchMap=null;
    window._calMatchCacheTime=_calT;
  }
  // [FIX-10] _markCalType: 원본 객체 변경 금지 → spread로 래퍼 객체 생성.
  // 기존 Object.defineProperty(m, ...) 는 miniM/univM 등 공유 배열의 원본을 변경하므로
  // 다른 탭에서 의도치 않은 열거 동작을 유발할 수 있다.
  function _markCalType(arr, type, mode){
    const a = Array.isArray(arr) ? arr : [];
    return a.map(m=>{
      if(!m || typeof m !== 'object') return m;
      return Object.assign(Object.create(Object.getPrototypeOf(m)), m, {
        __calType: type,
        __calMode: mode || type
      });
    });
  }
  const _mini = (typeof miniM!=='undefined' && Array.isArray(miniM)) ? miniM : [];
  const _univm = (typeof univM!=='undefined' && Array.isArray(univM)) ? univM : [];
  const _comps = (typeof comps!=='undefined' && Array.isArray(comps)) ? comps : [];
  const _ck = (typeof ckM!=='undefined' && Array.isArray(ckM)) ? ckM : [];
  const _pro = (typeof proM!=='undefined' && Array.isArray(proM)) ? proM : [];
  if(!window._calMatchCache) window._calMatchCache=[
    ..._markCalType(_mini,'mini'),
    ..._markCalType(_univm,'univm'),
    ..._markCalType(_comps,'comp'),
    ..._markCalType(_ck,'ck'),
    ..._markCalType(_pro,'pro'),
    ..._markCalType((typeof getTourneyMatches==='function'?getTourneyMatches():[]),'comp'),
    ..._markCalType((typeof indM!=='undefined'?indM:[]),'ind'),
    ..._markCalType((typeof gjM!=='undefined'?gjM:[]),'gj'),
    ..._markCalType((typeof ttM!=='undefined'?ttM:[]),'tt'),
    ..._markCalType(window._calScheduled,'sched')
  ];

  // Bug fix: 통합 타입 감지 (한 곳에서 관리)
  function matchType(m){
    return (m && m.__calType) || 'comp';
  }

  const TYPE_INFO={
    sched:{lbl:'📌 예정',   bg:'#92400e', emoji:'📌'},
    ind:  {lbl:'🎮 개인전',  bg:'#8b5cf6', emoji:'🎮'},
    gj:   {lbl:'⚔️ 끝장전', bg:'#db2777', emoji:'⚔️'},
    tt:   {lbl:'🎯 티어대회',bg:'#f59e0b', emoji:'🎯'},
    mini: {lbl:'⚡ 미니대전',bg:'#2563eb', emoji:'⚡'},
    univm:{lbl:'🏟️ 대학대전',bg:'#059669',emoji:'🏟️'},
    ck:   {lbl:'🤝 대학CK', bg:'#d97706', emoji:'🤝'},
    pro:  {lbl:'🏅 프로리그',bg:'#7c3aed', emoji:'🏅'},
    comp: {lbl:'🎖️ 대회',   bg:'#16a34a', emoji:'🎖️'},
  };

  function matchLabel(m){
    const type=matchType(m);
    const ti=TYPE_INFO[type];
    if(type==='sched') return `📌 ${_calEscHTML(m.note||'예정')}`;
    if(type==='ind'||type==='gj') return `${ti.emoji} ${_calEscHTML(m.wName||'')} vs ${_calEscHTML(m.lName||'')}`;
    if(type==='tt') return `🎯 ${_calEscHTML(m.compName||'')}`;
    if(type==='mini') return `⚡ ${_calEscHTML(m.a||'')} vs ${_calEscHTML(m.b||'')}`;
    if(type==='univm') return `🏟️ ${_calEscHTML(m.a||'')} vs ${_calEscHTML(m.b||'')}`;
    if(type==='ck'||type==='pro') return `${ti.emoji} ${_calEscHTML(m.teamALabel||'A팀')} vs ${_calEscHTML(m.teamBLabel||'B팀')}`;
    return `🎖️ 대회`;
  }

  function getTeamA(m){
    const t=matchType(m);
    if(t==='ind'||t==='gj') return m.wName||'';
    if(t==='ck'||t==='pro') return (m.teamALabel||'').replace(/^\$\{.*\}$/,'')||'A팀';
    return m.a||'';
  }
  function getTeamB(m){
    const t=matchType(m);
    if(t==='ind'||t==='gj') return m.lName||'';
    if(t==='ck'||t==='pro') return (m.teamBLabel||'').replace(/^\$\{.*\}$/,'')||'B팀';
    return m.b||'';
  }

  // Feature 2: 타입 필터 적용
  const rawAll=window._calMatchCache;
  if(!window._calRawDateMatchMap){
    const rawMap={};
    rawAll.forEach(m=>{
      const d=m.d||'';
      if(!d) return;
      if(!rawMap[d]) rawMap[d]=[];
      rawMap[d].push(m);
    });
    window._calRawDateMatchMap=rawMap;
  }
  // Feature: 타입별 건수 (필터 뱃지용, 검색어 미적용 - 전체 타입 분포 기준)
  const _typeCounts={};
  rawAll.forEach(m=>{ const t=matchType(m); _typeCounts[t]=(_typeCounts[t]||0)+1; });

  // Feature: 팀/선수 이름 검색
  const _searchQ=String(window._calSearchQ||'').trim().toLowerCase();
  function _calMatchSearchText(m){
    return `${getTeamA(m)||''} ${getTeamB(m)||''} ${m.note||''} ${m.wName||''} ${m.lName||''} ${m.compName||''}`.toLowerCase();
  }

  const typeFiltered=(calTypeFilter&&calTypeFilter!=='all')
    ? rawAll.filter(m=>matchType(m)===calTypeFilter)
    : rawAll;
  const allMatches=_searchQ ? typeFiltered.filter(m=>_calMatchSearchText(m).includes(_searchQ)) : typeFiltered;
  window._rCalAllMatches=allMatches;

  const dateMatchMap={};
  allMatches.forEach(m=>{
    const d=m.d||'';
    if(!d)return;
    if(!dateMatchMap[d])dateMatchMap[d]=[];
    dateMatchMap[d].push(m);
  });
  window._calDateMatchMap=dateMatchMap;

  const now=new Date(calYear,calMonth,1);
  const year=now.getFullYear();
  const month=now.getMonth();
  const firstDay=new Date(year,month,1).getDay();
  const lastDate=new Date(year,month+1,0).getDate();
  const weeks=['일','월','화','수','목','금','토'];
  const today=new Date();
  function pad(n){return String(n).padStart(2,'0');}
  function dateStr(y,m,d){return `${y}-${pad(m+1)}-${pad(d)}`;}
  const todayStr=dateStr(today.getFullYear(),today.getMonth(),today.getDate());
  const weekStart=new Date(today);
  weekStart.setDate(today.getDate()-today.getDay()+calWeekOffset*7);
  if(!calDayDate) calDayDate=todayStr;
  const _calRenderSig=`${calView}|${calYear}|${calMonth}|${calWeekOffset}|${calDayDate}`;
  const _calShouldAnim=window._calLastRenderSig!==_calRenderSig;
  window._calLastRenderSig=_calRenderSig;
  const _calAnimCls=_calShouldAnim?' cal-anim-in':'';
  const _viewLabel = calView==='month' ? '월간 보기' : calView==='week' ? '주간 보기' : '일간 보기';
  const _monthPrefix = `${year}-${pad(month+1)}`;
  const _monthCount = calView==='month' ? allMatches.filter(m=>(m.d||'').startsWith(_monthPrefix)).length : 0;
  const _activeFilterInfo = calTypeFilter==='all'
    ? '전체 일정'
    : ((TYPE_INFO[calTypeFilter]&&TYPE_INFO[calTypeFilter].lbl) || '필터 일정');

  let calHTML='';
  let navHTML='';
  const _visibleTypes=new Set();

  // 달력 셀/주간 리스트를 "요약 칩"으로 단순화
  function calCellChips(ds, matches){
    if(!matches||!matches.length) return '';
    const chipMode = (localStorage.getItem('su_cal_chip_mode')||'types');
    const byType={};
    matches.forEach(m=>{const t=matchType(m);byType[t]=(byType[t]||0)+1;});
    // 동률/애매함 방지: 타입 우선순위로 타이브레이크
    const prio = ['sched','comp','pro','tt','ck','univm','mini','ind','gj'];
    const sorted=Object.entries(byType)
      .sort((a,b)=>{
        const dc=(b[1]-a[1]);
        if(dc!==0) return dc;
        return (prio.indexOf(a[0])<0?99:prio.indexOf(a[0])) - (prio.indexOf(b[0])<0?99:prio.indexOf(b[0]));
      });
    const top=sorted.slice(0,3);
    const used=top.reduce((s,[,c])=>s+c,0);
    const restCnt=Math.max(0, matches.length-used);
    const chip=(txt,bg,fg,title)=>`<span class="cal-month-chip"${title?` title="${title}"`:''} style="border:1px solid ${bg};background:${bg};color:${fg}">${txt}</span>`;
    const fullBreakdown=sorted.map(([t,c])=>`${(TYPE_INFO[t]||TYPE_INFO.comp).lbl} ${c}건`).join(', ');
    const totalChip=chip(`총 ${matches.length}`,'rgba(37,99,235,.10)','var(--blue)',fullBreakdown);
    if(chipMode==='total') return `<div class="cal-month-chip-row">${totalChip}</div>`;
    const typeChips=top.map(([t,c])=>{
      const ti=TYPE_INFO[t]||TYPE_INFO.comp;
      return chip(`${ti.emoji} ${c}`, ti.bg+'22', ti.bg);
    }).join('');
    const restBreakdown=sorted.slice(3).map(([t,c])=>`${(TYPE_INFO[t]||TYPE_INFO.comp).lbl} ${c}건`).join(', ');
    const more=restCnt>0?chip(`+${restCnt}`,'rgba(100,116,139,.10)','var(--text3)',restBreakdown||undefined):'';
    return `<div class="cal-month-chip-row">${totalChip}${typeChips}${more}</div>`;
  }

  if(calView==='month'){
    const _jumpYears=[];
    for(let yy=today.getFullYear()-3;yy<=today.getFullYear()+1;yy++) _jumpYears.push(yy);
    const yearSelHTML=`<select onchange="calYear=parseInt(this.value,10);render()">${_jumpYears.map(yy=>`<option value="${yy}"${yy===year?' selected':''}>${yy}년</option>`).join('')}</select>`;
    const monthSelHTML=`<select onchange="calMonth=parseInt(this.value,10);render()">${Array.from({length:12},(_,i)=>i).map(mi=>`<option value="${mi}"${mi===month?' selected':''}>${mi+1}월</option>`).join('')}</select>`;
    navHTML=`
      <button class="btn btn-w btn-sm" onclick="calYear=calMonth===0?calYear-1:calYear;calMonth=calMonth===0?11:calMonth-1;render()">◀ 이전</button>
      <span class="cal-month-jump">${yearSelHTML}${monthSelHTML}</span>
      <button class="btn btn-w btn-sm" onclick="calYear=calMonth===11?calYear+1:calYear;calMonth=calMonth===11?0:calMonth+1;render()">다음 ▶</button>
      <button class="btn btn-w btn-sm" onclick="calYear=new Date().getFullYear();calMonth=new Date().getMonth();render()">오늘</button>`;

    let cells='', day=1;
    for(let row=0;row<6;row++){
      let rowHTML='';
      for(let col=0;col<7;col++){
        const idx=row*7+col;
        if(idx<firstDay||day>lastDate){
          rowHTML+=`<td class="cal-cell-empty"></td>`;
        } else {
          const ds=dateStr(year,month,day);
          const matches=dateMatchMap[ds]||[];
          matches.forEach(m=>_visibleTypes.add(matchType(m)));
          const isToday=ds===todayStr;
          const hasMatch=matches.length>0;
          const isActive=ds===_calActiveDay;
          const isPast=ds<todayStr;
          const chips=calCellChips(ds,matches);
          const isWeekend=col===0||col===6;
          rowHTML+=`<td data-ds="${ds}" class="cal-cell${hasMatch?' has-match':''}${isActive?' active':''}${isToday?' is-today':''}${isPast?' is-past':''}${isWeekend?(col===0?' is-sun':' is-sat'):''}"
            ${hasMatch?`onclick="calShowDay('${ds}')"`:''}
          >
            <div class="cal-day-num${isToday?' today':''}">${day}</div>
            ${hasMatch?chips:''}
          </td>`;
          day++;
        }
      }
      cells+=`<tr>${rowHTML}</tr>`;
      if(day>lastDate) break;
    }
    calHTML=`
      <div class="cal-board-month${_calAnimCls}">
      <table>
        <thead><tr>${weeks.map((w,i)=>`<th style="padding:8px;font-size:var(--fs-caption);color:${i===0?'var(--red)':i===6?'var(--blue)':'var(--gray-l)'};font-weight:700">${w}</th>`).join('')}</tr></thead>
        <tbody>${cells}</tbody>
      </table>
      </div>`;

  } else if(calView==='week'){
    const ws=new Date(weekStart), we=new Date(weekStart);
    we.setDate(we.getDate()+6);
    navHTML=`
      <button class="btn btn-w btn-sm" onclick="calWeekOffset--;render()">◀ 이전 주</button>
      <span style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:var(--fs-md);min-width:130px;text-align:center">${ws.getMonth()+1}/${ws.getDate()} ~ ${we.getMonth()+1}/${we.getDate()}</span>
      <button class="btn btn-w btn-sm" onclick="calWeekOffset++;render()">다음 주 ▶</button>
      <button class="btn btn-w btn-sm" onclick="calWeekOffset=0;render()">이번 주</button>`;

    let rows='';
    let _weekTotal=0;
    for(let i=0;i<7;i++){
      const d=new Date(weekStart); d.setDate(weekStart.getDate()+i);
      const ds=dateStr(d.getFullYear(),d.getMonth(),d.getDate());
      const matches=dateMatchMap[ds]||[];
      matches.forEach(m=>_visibleTypes.add(matchType(m)));
      _weekTotal+=matches.length;
      const isToday=ds===todayStr;
      const isPast=ds<todayStr;
      const hasMatch=matches.length>0;
      const chips=calCellChips(ds,matches);
      rows+=`<div data-ds="${ds}" class="cal-week-card${isToday?' today':''}${isPast&&!isToday?' is-past':''}${hasMatch?' has-match':''}${ds===_calActiveDay?' active':''}" style="cursor:${matches.length?'pointer':'default'}"
        ${matches.length?`onclick="calShowDay('${ds}')"`:''}>
        ${hasMatch?`<span class="cal-week-count">${matches.length}</span>`:''}
        <div class="cal-week-date">
          <div class="cal-week-day" style="color:${i===0?'var(--red)':i===6?'var(--blue)':'var(--gray-l)'}">${weeks[i]}</div>
          <div class="cal-week-num" style="color:${isToday?'var(--blue)':'inherit'}">${d.getDate()}</div>
        </div>
        <div style="flex:1;min-width:0">
          ${matches.length===0?`<span style="color:var(--gray-l);font-size:var(--fs-sm)">경기 없음</span>`:chips}
        </div>
      </div>`;
    }
    calHTML=`<div class="cal-week-summary">이번 주 총 ${_weekTotal}건</div><div class="cal-week-list${_calAnimCls}">${rows}</div>`;

  } else if(calView==='day'){
    const d=new Date(calDayDate);
    const prevD=new Date(d); prevD.setDate(d.getDate()-1);
    const nextD=new Date(d); nextD.setDate(d.getDate()+1);
    const fmtDayStr=(dt)=>dateStr(dt.getFullYear(),dt.getMonth(),dt.getDate());
    // UX fix: 월간보기 복귀 버튼 추가
    navHTML=`
      <button class="btn btn-w btn-sm" onclick="calView='month';render()">◀ 월간</button>
      <button class="btn btn-w btn-sm" onclick="calDayDate='${fmtDayStr(prevD)}';render()">◀ 전날</button>
      <input type="date" class="cal-day-jump" value="${calDayDate}" onchange="if(this.value){calDayDate=this.value;render()}">
      <button class="btn btn-w btn-sm" onclick="calDayDate='${fmtDayStr(nextD)}';render()">다음날 ▶</button>
      <button class="btn btn-w btn-sm" onclick="calDayDate='${todayStr}';render()">오늘</button>`;

    const matches=dateMatchMap[calDayDate]||[];
    matches.forEach(m=>_visibleTypes.add(matchType(m)));
    const _dowKo=weeks[d.getDay()];
    const _dayIsToday=calDayDate===todayStr;
    const _dayWhen=_dayIsToday?'오늘':(calDayDate<todayStr?'지난 날짜':'예정된 날짜');
    const _dayHeadHTML=`<div class="cal-day-summary${_calAnimCls}" style="margin-bottom:14px">
      <div>
        <div class="cal-day-summary-title">📅 ${_calEscHTML(calDayDate)} (${_dowKo})</div>
        <div class="cal-day-summary-sub">${matches.length?`총 ${matches.length}경기`:'경기 없음'} · ${_dayWhen}</div>
      </div>
      ${_li?`<div class="cal-day-summary-actions"><button class="btn btn-b btn-sm no-export" onclick="openCalSchedModal()">+ 예정 추가</button></div>`:''}
    </div>`;
    if(!matches.length){
      calHTML=_dayHeadHTML+`<div class="cal-empty-state">
        <div style="font-size:40px;margin-bottom:8px">🗓️</div>
        <div>이 날은 등록된 경기·예정이 없습니다.</div>
      </div>`;
    } else {
      const schedList=[], recList=[], tourList=[];
      matches.forEach((m,mi)=>{
        const type=matchType(m);
        if(type==='sched'){ schedList.push({m,mi}); return; }
        if(type==='comp'||type==='pro'||type==='tt'){ tourList.push({m,mi}); return; }
        recList.push({m,mi});
      });

      function sec(title, inner){
        if(!inner) return '';
        return `<div class="cal-day-sec">
          <div class="cal-day-sec-title">
            <span class="cal-day-sec-pill">${title}</span>
          </div>
          ${inner}
        </div>`;
      }

      function schedCard(m){
        const timeStr=m.time?`<span class="cal-inline-time">🕐 ${_calEscHTML(m.time)}</span>`:'';
        const sid=_calEscJS(m._id||'');
        return `<div class="cal-sched-card">
          <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
            <span class="cal-sched-title">📌 ${_calEscHTML(m.note||'예정')}</span>
            ${timeStr}
            <div style="margin-left:auto;display:flex;gap:6px" class="no-export">
              <button class="btn btn-w btn-xs" onclick="calExportSchedIcs('${sid}')">📤 캘린더 추가</button>
              ${_li?`<button class="btn btn-r btn-xs" onclick="calDeleteSched('${sid}')">🗑️ 삭제</button>`:''}
            </div>
          </div>
        </div>`;
      }

      function matchCard(m,mi){
        const type=matchType(m);
        const ti=TYPE_INFO[type]||TYPE_INFO.comp;
        const tA=getTeamA(m), tB=getTeamB(m);
        const tAH=_calEscHTML(tA), tBH=_calEscHTML(tB);
        const _isIG=type==='ind'||type==='gj';
        const ca=_isIG?ti.bg:(type==='ck'||type==='pro')?'#2563eb':gc(m.a||'');
        const cb=_isIG?'#64748b':(type==='ck'||type==='pro')?'#dc2626':gc(m.b||'');
        const aWin=_isIG?!!m.wName:(m.sa??-1)>(m.sb??-1), bWin=_isIG?false:(m.sb??-1)>(m.sa??-1);
        const hasResult=_isIG?!!m.wName:(m.sa!=null&&m.sa!=='');
        const timeStr=m.time?`<span class="cal-inline-time">🕐 ${_calEscHTML(m.time)}</span>`:'';
        const detKey=`calday-${calDayDate}-${mi}`;
        const modeKey=(m && m.__calMode) || matchType(m);
        const detHTML=buildDetailHTML(m,modeKey,tA,tB,ca,cb,aWin,bWin);
        const leftCol = hasResult?(aWin?ca:bWin?cb:'var(--border)'):'var(--border)';
        const MODE_COL = {ind:'#2563eb',gj:'#dc2626',mini:'#7c3aed',univm:'#16a34a',ck:'#f59e0b',pro:'#0ea5e9',tt:'#10b981',comp:'#3b82f6'};
        const _mc = MODE_COL[modeKey] || '#64748b';
        const _rgb = (hex)=>{const h=String(hex||'').replace('#',''); if(h.length!==6) return '100,116,139'; const r=parseInt(h.slice(0,2),16),g=parseInt(h.slice(2,4),16),b=parseInt(h.slice(4,6),16); return `${r},${g},${b}`;};
        const resultClass=!hasResult?'is-pending':'is-win';
        const resultLabel=hasResult?(aWin?`▶ ${tAH} 승`:bWin?`▶ ${tBH} 승`:'무'):'결과 미입력';
        return `<div class="rec-summary cal-match-card rec-mode-${modeKey}" data-rec-mode="${modeKey}" style="--rec-mode-col:${_mc};--rec-mode-rgb:${_rgb(_mc)};border-left:3px solid ${leftCol}">
          <div class="rec-sum-header" style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
            <span class="cal-match-badge" style="background:${ti.bg}">${ti.lbl}</span>
            ${timeStr}
            <div class="cal-match-meta">
            <span class="ubadge${aWin&&hasResult?'':hasResult?' loser':''}" style="background:${ca}">${tAH}</span>
            ${hasResult&&!_isIG?`<div style="font-family:'Noto Sans KR',sans-serif;font-weight:1000;font-size:var(--fs-lg)"><span class="${aWin?'wt':bWin?'lt':'pt-z'}">${m.sa}</span><span style="color:var(--gray-l);font-size:var(--fs-base)"> : </span><span class="${bWin?'wt':aWin?'lt':'pt-z'}">${m.sb}</span></div>`:`<span style="color:var(--gray-l);font-weight:800">vs</span>`}
            <span class="ubadge${bWin&&hasResult?'':hasResult?' loser':''}" style="background:${cb}">${tBH}</span>
            <span class="cal-match-result ${resultClass}">${resultLabel}</span>
            </div>
            <div class="cal-match-actions no-export">
              ${(()=>{const _adm=(localStorage.getItem('su_share_admin_only')||'0')==='1';return(!_adm||_li)?`<button class="btn btn-p btn-xs" style="margin-left:auto;min-width:98px;display:inline-flex;align-items:center;justify-content:center" onclick="openRCalMatchShareCard('${calDayDate}',${mi})">🎴 공유 카드</button>`:'';})()}
              <button id="detbtn-${detKey}" class="btn-detail" onclick="toggleDetail('${detKey}')">📂 상세</button>
            </div>
          </div>
          <div id="det-${detKey}" class="rec-detail-area">
            <div style="padding:12px 14px">${detHTML}</div>
          </div>
        </div>`;
      }

        calHTML = _dayHeadHTML + `<div class="cal-day-sections${_calAnimCls}">` +
        sec('📌 예정', schedList.length ? schedList.map(x=>schedCard(x.m)).join('') : '') +
        sec('📜 기록', recList.length ? recList.map(x=>matchCard(x.m,x.mi)).join('') : '') +
        sec('🏆 대회/리그', tourList.length ? tourList.map(x=>matchCard(x.m,x.mi)).join('') : '') +
        `</div>`;
    }
  }

  // 날짜 미정 (타입 필터 + 검색어 적용, 펼치기/접기 지원)
  const undatedMatches=allMatches.filter(m=>!m.d||(typeof m.d==='string'&&m.d.trim()===''));
  const _undatedShowCount=window._calUndatedExpanded?undatedMatches.length:10;
  const undatedHTML=undatedMatches.length?`<div class="cal-undated">
  <div style="font-size:var(--fs-sm);font-weight:700;color:#92400e;margin-bottom:6px">📋 날짜 미정 경기 (${undatedMatches.length}건)</div>
  <div class="cal-undated-chips">
  ${undatedMatches.slice(0,_undatedShowCount).map(m=>`<span class="cal-undated-chip">${matchLabel(m)}</span>`).join('')}
  ${undatedMatches.length>_undatedShowCount?`<button class="cal-undated-chip no-export" style="cursor:pointer;border:1px solid #f59e0b;background:#fde68a" onclick="window._calUndatedExpanded=true;render()">... 외 ${undatedMatches.length-_undatedShowCount}건 더보기</button>`:''}
  ${window._calUndatedExpanded&&undatedMatches.length>10?`<button class="cal-undated-chip no-export" style="cursor:pointer" onclick="window._calUndatedExpanded=false;render()">접기 ▲</button>`:''}
  </div>
</div>`:'';

  // Feature 2: 타입 필터 버튼 (건수 뱃지 포함)
  const filterBtns=[
    {id:'all',  lbl:'전체'},
    {id:'mini', lbl:'⚡ 미니'},
    {id:'univm',lbl:'🏟️ 대학'},
    {id:'ck',   lbl:'🤝 CK'},
    {id:'pro',  lbl:'🏅 프로'},
    {id:'ind',  lbl:'🎮 개인전'},
    {id:'gj',   lbl:'⚔️ 끝장전'},
    {id:'tt',   lbl:'🎯 티어대회'},
    {id:'comp', lbl:'🎖️ 대회'},
    {id:'sched',lbl:'📌 예정'},
  ];
  const _filterBtns = (typeof applyTabLabels==='function') ? applyTabLabels('calendar', filterBtns) : filterBtns;
  const filterToggleHTML = _enableSubFilter
    ? `<button class="pill no-export ${window._calFilterOpen?'on':''}" style="flex-shrink:0;white-space:nowrap" onclick="window._calFilterOpen=!window._calFilterOpen;try{localStorage.setItem('su_cal_filter_open',window._calFilterOpen?'1':'0');}catch(e){}render()">🔍 필터 ${window._calFilterOpen?'▲':'▼'}</button>`
    : '';
  const filterHTML = (_enableSubFilter ? window._calFilterOpen : true)
    ? `<div class="no-export" style="display:flex;flex-direction:column;gap:8px;margin-bottom:12px">
        <input id="cal-search-input" type="text" placeholder="🔍 팀/선수 이름 검색" value="${String(window._calSearchQ||'').replace(/"/g,'&quot;')}"
          oninput="window._searchFocusId='cal-search-input';window._calSearchQ=this.value;render()"
          onfocus="window._searchFocusId='cal-search-input'"
          style="max-width:260px;padding:6px 10px;border:1px solid var(--border2);border-radius:8px;font-size:var(--fs-sm)">
        <div style="display:flex;gap:4px;flex-wrap:wrap">
        ${_filterBtns.map(f=>{
          const cnt=f.id==='all'?rawAll.length:(_typeCounts[f.id]||0);
          return `<button class="pill${calTypeFilter===f.id?' on':''}" onclick="calTypeFilter='${f.id}';render()">${f.lbl}${cnt?` <span style="opacity:.7">(${cnt})</span>`:''}</button>`;
        }).join('')}
        </div>
      </div>`
    : '';

  C.innerHTML=`
  <div class="cal-shell">
    <section class="cal-hero">
      <div class="cal-hero-copy">
        <div class="cal-hero-kicker">Calendar Center</div>
        <div class="cal-hero-title">📅 경기 캘린더</div>
        <div class="cal-hero-desc">월간, 주간, 일간 화면으로 일정을 빠르게 훑고 선택한 날짜의 경기와 예정 목록을 한눈에 확인할 수 있습니다.</div>
      </div>
      <div class="cal-hero-badges">
        <span class="cal-hero-badge">${_viewLabel}</span>
        <span class="cal-hero-badge">${_activeFilterInfo}</span>
        <span class="cal-hero-badge">${calView==='month'?`이번 달 ${_monthCount}건`:`총 ${allMatches.length}건`}</span>
      </div>
    </section>
    <div class="cal-toolbar-card">
    <div class="cal-toolbar-row">
      <div class="cal-nav-group">
        ${filterToggleHTML}
        ${navHTML}
      </div>
      <div class="cal-view-group">
        <button class="pill ${calView==='month'?'on':''}" onclick="calView='month';render()">월간</button>
        <button class="pill ${calView==='week'?'on':''}" onclick="calWeekOffset=0;calView='week';render()">주간</button>
        <button class="pill ${calView==='day'?'on':''}" onclick="calDayDate='${todayStr}';calView='day';render()">일간</button>
        ${_li?`<button class="pill no-export" onclick="openCalSchedModal()">+ 예정</button>`:''}
      </div>
    </div>
    </div>
    ${filterHTML}
    ${undatedHTML}
    <!-- 캘린더 본문 -->
    <div class="cal-board-card" style="overflow-x:auto">
      ${calHTML}
    </div>
    <!-- 범례 -->
    <div class="cal-legend">
      <span style="font-weight:700">범례:</span>
      ${Object.entries(TYPE_INFO).map(([k,v])=>`<span class="cal-legend-item${_visibleTypes.size&&!_visibleTypes.has(k)?' is-dim':''}${calTypeFilter===k?' is-active':''}" style="background:${v.bg}" onclick="calTypeFilter=(calTypeFilter==='${k}'?'all':'${k}');render()" title="클릭하면 ${v.lbl} 일정만 보기">${v.lbl}</span>`).join('')}
    </div>
    <!-- 선택 날짜 경기 목록 (월간뷰용) -->
    <div id="calDayDetail" class="cal-detail-wrap"></div>
  </div>`;
}

let _calActiveDay='';
let _calDetailState={};

function calDeleteSched(id){
  const _li = (typeof isLoggedIn!=='undefined' ? !!isLoggedIn : false) || !!window.isLoggedIn;
  if(!_li) return;
  if(typeof calScheduled==='undefined' || !Array.isArray(calScheduled)) window.calScheduled=[];
  _calConfirmDel(function(){
    const idx=calScheduled.findIndex(x=>x._id===id);
    if(idx>=0){ calScheduled.splice(idx,1); window._calScheduled=calScheduled; }
    window._calMatchCache=null;
    render();
    if(typeof save==='function'){
      Promise.resolve(save()).catch(function(e){
        _calSaveToast('⚠️ 로컬 저장됨 — 네트워크 오류로 원격 저장 실패');
        console.warn('[calDeleteSched] save error', e);
      });
    }
  });
}

// [개선] 예정 경기 → ICS 파일로 내보내기 (외부 캘린더 앱에 추가)
function calExportSchedIcs(id){
  const list=(typeof calScheduled!=='undefined' && Array.isArray(calScheduled)) ? calScheduled : (window._calScheduled||[]);
  const m=list.find(x=>x._id===id);
  if(!m){ alert('예정 경기를 찾을 수 없습니다.'); return; }
  const d=(m.d||'').replace(/-/g,'');
  if(!d){ alert('날짜 정보가 없습니다.'); return; }
  let startStr, endStr, allDay=false;
  if(m.time && /^\d{1,2}:\d{2}$/.test(m.time)){
    const [hh,mm]=m.time.split(':').map(n=>String(n).padStart(2,'0'));
    startStr=`${d}T${hh}${mm}00`;
    const endDate=new Date(`${m.d}T${hh}:${mm}:00`);
    endDate.setHours(endDate.getHours()+1);
    const pad=n=>String(n).padStart(2,'0');
    endStr=`${endDate.getFullYear()}${pad(endDate.getMonth()+1)}${pad(endDate.getDate())}T${pad(endDate.getHours())}${pad(endDate.getMinutes())}00`;
  } else {
    allDay=true;
    const nd=new Date(m.d); nd.setDate(nd.getDate()+1);
    const pad=n=>String(n).padStart(2,'0');
    startStr=d;
    endStr=`${nd.getFullYear()}${pad(nd.getMonth()+1)}${pad(nd.getDate())}`;
  }
  const escIcs=(s)=>String(s||'').replace(/[\\,;]/g,m2=>'\\'+m2).replace(/\n/g,'\\n');
  const now=new Date();
  const pad2=n=>String(n).padStart(2,'0');
  const dtstamp=`${now.getUTCFullYear()}${pad2(now.getUTCMonth()+1)}${pad2(now.getUTCDate())}T${pad2(now.getUTCHours())}${pad2(now.getUTCMinutes())}${pad2(now.getUTCSeconds())}Z`;
  const ics=[
    'BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//STAR Datacenter//Calendar//KO',
    'BEGIN:VEVENT',
    `UID:${escIcs(id)}@star-datacenter`,
    `DTSTAMP:${dtstamp}`,
    allDay?`DTSTART;VALUE=DATE:${startStr}`:`DTSTART:${startStr}`,
    allDay?`DTEND;VALUE=DATE:${endStr}`:`DTEND:${endStr}`,
    `SUMMARY:${escIcs(m.note||'예정 경기')}`,
    'END:VEVENT','END:VCALENDAR'
  ].join('\r\n');
  const blob=new Blob([ics],{type:'text/calendar;charset=utf-8'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');
  a.href=url;
  a.download=`${(m.note||'경기일정').replace(/[\\/:*?"<>|]/g,'_')}.ics`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
}

// Feature 1+3: 예정 경기 등록 모달
function openCalSchedModal(prefillDate){
  const today=new Date();
  const pad=n=>String(n).padStart(2,'0');
  const todayStr=`${today.getFullYear()}-${pad(today.getMonth()+1)}-${pad(today.getDate())}`;
  const dateEl=document.getElementById('cal-sched-date');
  const timeEl=document.getElementById('cal-sched-time');
  const noteEl=document.getElementById('cal-sched-note');
  if(dateEl) dateEl.value=prefillDate||(typeof calDayDate!=='undefined'?calDayDate:'')||todayStr;
  if(timeEl) timeEl.value='';
  if(noteEl) noteEl.value='';
  om('calSchedModal');
  setTimeout(()=>{ if(noteEl) noteEl.focus(); },300);
}

function saveCalSched(){
  const d=(document.getElementById('cal-sched-date')||{}).value||'';
  const t=(document.getElementById('cal-sched-time')||{}).value||'';
  const n=((document.getElementById('cal-sched-note')||{}).value||'').trim();
  if(!d){ alert('날짜를 입력하세요.'); return; }
  if(!n){ alert('메모를 입력하세요.'); return; }
  const newSched={d, note:n, _id:'s'+Date.now()};
  if(t) newSched.time=t;
  if(typeof calScheduled==='undefined') window.calScheduled=[];
  calScheduled.push(newSched);
  window._calScheduled=calScheduled;
  window._calMatchCache=null;
  cm('calSchedModal');
  render();
  if(typeof save==='function'){
    Promise.resolve(save()).catch(function(e){
      _calSaveToast('⚠️ 로컬 저장됨 — 네트워크 오류로 원격 저장 실패');
      console.warn('[saveCalSched] save error', e);
    });
  }
}

function calToggleDetail(key){
  const area=document.getElementById('det-'+key);
  const btn=document.getElementById('detbtn-'+key);
  if(!area)return;
  _calDetailState[key]=!_calDetailState[key];
  const isOpen=!!_calDetailState[key];
  area.style.display=isOpen?'block':'none';
  if(btn){btn.classList.toggle('open',isOpen);btn.textContent=isOpen?'🔼 닫기':'📂 상세';}
}

function calShowDay(ds){
  const el=document.getElementById('calDayDetail');
  if(!el)return;
  const _li = (typeof isLoggedIn!=='undefined' ? !!isLoggedIn : false) || !!window.isLoggedIn;
  const _scheduled = (typeof calScheduled!=='undefined' && Array.isArray(calScheduled)) ? calScheduled : [];
  if(_calActiveDay===ds){
    _calActiveDay='';
    _calDetailState={};
    el.innerHTML='';
    render();
    return;
  }
  _calActiveDay=ds;
  _calDetailState={};
  document.querySelectorAll('.cal-board-month .cal-cell.active, .cal-week-list .cal-week-card.active').forEach(td=>td.classList.remove('active'));
  const _newActiveTd=document.querySelector('.cal-board-month .cal-cell[data-ds="'+ds+'"], .cal-week-list .cal-week-card[data-ds="'+ds+'"]');
  if(_newActiveTd) _newActiveTd.classList.add('active');
  const matches=((window._calRawDateMatchMap&&window._calRawDateMatchMap[ds])?window._calRawDateMatchMap[ds]:[]).slice();
  const schedMatches=_scheduled.filter(m=>m.d===ds);
  if(!window._calDayCache) window._calDayCache={};
  window._calDayCache[ds]=matches;

  function buildMatchRow(m,mi){
    const _type=(m && m.__calType) || 'comp';
    const _isInd=_type==='ind';
    const _isGj=_type==='gj';
    const _isIG=_isInd||_isGj;
    // ind/gj: 별도 처리 (sa/sb 없음)
    if(_isIG){
      const typeBg=_isInd?'#8b5cf6':'#db2777';
      const typeLabel=_isInd?'🎮 개인전':'⚔️ 끝장전';
      const detKey='caldm-'+ds+'-'+mi;
      const wH=_calEscHTML(m.wName||'');
      const lH=_calEscHTML(m.lName||'');
      const mapH=_calEscHTML(m.map||'');
      const detHTML=buildDetailHTML(m,_isInd?'ind':'gj',m.wName||'',m.lName||'',typeBg,'#64748b',true,false);
      const modeKey=_isInd?'ind':'gj';
      const MODE_COL = {ind:'#2563eb',gj:'#dc2626'};
      const _mc = MODE_COL[modeKey] || '#64748b';
      const _rgb = (hex)=>{const h=String(hex||'').replace('#',''); if(h.length!==6) return '100,116,139'; const r=parseInt(h.slice(0,2),16),g=parseInt(h.slice(2,4),16),b=parseInt(h.slice(4,6),16); return `${r},${g},${b}`;};
      return '<div class="rec-summary cal-match-card rec-mode-'+modeKey+'" data-rec-mode="'+modeKey+'" style="--rec-mode-col:'+_mc+';--rec-mode-rgb:'+_rgb(_mc)+'">'
        +'<div class="rec-sum-header" style="cursor:pointer" onclick="calToggleDetail(\''+detKey+'\')">'
        +'<span class="cal-match-badge" style="background:'+typeBg+'">'+typeLabel+'</span>'
        +'<div class="rec-sum-vs cal-match-meta" style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">'
        +'<span style="font-weight:700;color:'+typeBg+'">'+wH+'</span>'
        +'<span style="color:var(--gray-l);font-size:var(--fs-sm)">vs</span>'
        +'<span style="font-weight:600;opacity:.7">'+lH+'</span>'
        +(m.map?'<span style="font-size:var(--fs-caption);color:var(--text3)">📍'+mapH+'</span>':'')
        +'<span class="cal-match-result is-win">▶ '+wH+' 승</span>'
        +'</div>'
        +'<div class="cal-match-actions no-export">'
        +'<button id="detbtn-'+detKey+'" class="btn-detail" onclick="event.stopPropagation();calToggleDetail(\''+detKey+'\')">📂 상세</button>'
        +'</div>'
        +'</div>'
        +'<div id="det-'+detKey+'" style="display:none;padding:10px 14px;background:var(--surface);border-top:1px solid var(--border)">'
        +detHTML
        +'</div>'
        +'</div>';
    }
    if(m.sa==null||m.sa==='') return '';
    const isCKorPro=_type==='ck'||_type==='pro';
    const tA=isCKorPro?((m.teamALabel||'').replace(/^\$\{.*\}$/,'')||'A팀'):(m.a||'');
    const tB=isCKorPro?((m.teamBLabel||'').replace(/^\$\{.*\}$/,'')||'B팀'):(m.b||'');
    const tAH=_calEscHTML(tA);
    const tBH=_calEscHTML(tB);
    const ca=isCKorPro?'#2563eb':gc(m.a||'');
    const cb=isCKorPro?'#dc2626':gc(m.b||'');
    const aWin=(m.sa??-1)>(m.sb??-1), bWin=(m.sb??-1)>(m.sa??-1);
    const typeBg=_type==='mini'?'#2563eb':_type==='univm'?'#7c3aed':_type==='ck'?'#d97706':_type==='pro'?'#7c3aed':'#16a34a';
    const typeLabel=_type==='mini'?'⚡ 미니대전':_type==='univm'?'🏟️ 대학대전':_type==='ck'?'🤝 대학CK':_type==='pro'?'🏅 프로리그':'🎖️ 대회';
    const detKey='caldm-'+ds+'-'+mi;
    const modeKey=(m && m.__calMode) || _type || 'comp';
    const detHTML=buildDetailHTML(m,modeKey,tA,tB,ca,cb,aWin,bWin);
    const winLabel=aWin?'▶ '+tAH+' 승':bWin?'▶ '+tBH+' 승':'무승부';
    const winColor=aWin?ca:bWin?cb:'#888';
    const MODE_COL = {mini:'#7c3aed',univm:'#16a34a',ck:'#f59e0b',pro:'#0ea5e9',comp:'#3b82f6'};
    const _mc = MODE_COL[modeKey] || '#64748b';
    const _rgb = (hex)=>{const h=String(hex||'').replace('#',''); if(h.length!==6) return '100,116,139'; const r=parseInt(h.slice(0,2),16),g=parseInt(h.slice(2,4),16),b=parseInt(h.slice(4,6),16); return `${r},${g},${b}`;};
    return '<div class="rec-summary cal-match-card rec-mode-'+modeKey+'" data-rec-mode="'+modeKey+'" style="--rec-mode-col:'+_mc+';--rec-mode-rgb:'+_rgb(_mc)+'">'
      +'<div class="rec-sum-header" style="cursor:pointer" onclick="calToggleDetail(\''+detKey+'\')">'
      +'<span class="cal-match-badge" style="background:'+typeBg+'">'+typeLabel+'</span>'
      +'<div class="rec-sum-vs cal-match-meta">'
      +'<span class="ubadge'+(aWin?'':' loser')+'" style="background:'+ca+'">'+tAH+'</span>'
      +'<div class="rec-sum-score score-click" onclick="event.stopPropagation();calToggleDetail(\''+detKey+'\')">'
      +'<span class="'+(aWin?'wt':bWin?'lt':'pt-z')+'">'+m.sa+'</span>'
      +'<span style="color:var(--gray-l);font-size:14px"> : </span>'
      +'<span class="'+(bWin?'wt':aWin?'lt':'pt-z')+'">'+m.sb+'</span>'
      +'</div>'
      +'<span class="ubadge'+(bWin?'':' loser')+'" style="background:'+cb+'">'+tBH+'</span>'
      +'<span class="cal-match-result is-win" style="color:'+winColor+'">'+winLabel+'</span>'
      +'</div>'
      +'<div class="cal-match-actions no-export">'
      +'<button id="detbtn-'+detKey+'" class="btn-detail" onclick="event.stopPropagation();calToggleDetail(\''+detKey+'\')">📂 상세</button>'
      +'</div>'
      +'</div>'
      +'<div id="det-'+detKey+'" style="display:none;padding:10px 14px;background:var(--surface);border-top:1px solid var(--border)">'
      +detHTML
      +'<div class="cal-share-row">'
      +'<button class="btn btn-p btn-xs no-export" style="margin-left:auto;min-width:98px;display:inline-flex;align-items:center;justify-content:center" onclick="openCalMatchShareCardByCache(\''+_calEscJS(ds)+'\','+mi+');event.stopPropagation()">🎴 공유 카드</button>'
      +'</div>'
      +'</div>'
      +'</div>';
  }

  el.style.animation='fadeIn .2s';
  el.innerHTML='<div class="cal-soft-card" style="animation:fadeIn .2s">'
    +'<div class="cal-day-summary">'
    +'<div>'
    +'<div class="cal-day-summary-title">📅 '+_calEscHTML(ds)+' 경기 목록</div>'
    +'<div class="cal-day-summary-sub">총 '+matches.length+'경기 · 선택한 날짜의 기록과 예정 경기를 빠르게 확인합니다.</div>'
    +'</div>'
    +'<div class="cal-day-summary-actions">'
    +'<button class="btn btn-b btn-sm" onclick="calDayDate=\''+_calEscJS(ds)+'\';calView=\'day\';render()">📋 일간 상세보기</button>'
    +'<button class="btn btn-w btn-sm" onclick="_calActiveDay=\'\';document.getElementById(\'calDayDetail\').innerHTML=\'\'">✕ 닫기</button>'
    +'</div></div>'
    +matches.map(buildMatchRow).join('')
    +(schedMatches.length?'<div class="cal-sched-card" style="margin-top:10px">'
      +'<div style="font-size:var(--fs-sm);font-weight:700;color:#92400e;margin-bottom:8px">📌 예정 경기</div>'
      +schedMatches.map(m=>'<div style="display:flex;align-items:center;gap:8px;padding:4px 0;border-bottom:1px solid #fde68a20">'
        +'<span style="font-size:var(--fs-sm);flex:1">'+_calEscHTML(m.note||'예정')+(m.time?' 🕐'+_calEscHTML(m.time):'')+'</span>'
        +'<button class="btn btn-w btn-xs" onclick="calExportSchedIcs(\''+_calEscJS(m._id||'')+'\')">📤</button>'
        +(_li?'<button class="btn btn-r btn-xs" onclick="calDeleteSched(\''+_calEscJS(m._id||'')+'\')">🗑️</button>':'')
        +'</div>'
      ).join('')
      +'</div>':'')
    +'</div>';
}

function swNav(t,el){
  // [BUG-FIX #2,#5] 실제 swNav 로드 완료 → window.swNav를 이 함수로 교체
  window.swNav = swNav;

  // [BUG-FIX #5] _syncBnav 헬퍼가 있으면 매핑 기반 동기화,
  // 없으면 el 기반 폴백 (gj/tiertour/civil 서브탭 불일치 해결)
  if(typeof window._syncBnav === 'function'){
    window._syncBnav(t);
    // el이 bnav-item인 경우 직접 on 보정 (명시적 클릭 시 우선)
    if(el && el.classList && el.classList.contains('bnav-item')){
      document.querySelectorAll('.bnav-item').forEach(b=>{
        b.classList.remove('on');
        b.setAttribute('aria-selected','false');/* [A11Y] */
      });
      el.classList.add('on');
      el.setAttribute('aria-selected','true');/* [A11Y] */
    }
  } else {
    document.querySelectorAll('.bnav-item').forEach(b=>{
      b.classList.remove('on');
      b.setAttribute('aria-selected','false');/* [A11Y] */
    });
    if(el){
      el.classList.add('on');
      el.setAttribute('aria-selected','true');/* [A11Y] */
    }
  }
  // 탭 상태 초기화는 sw() 내부에서 처리하므로 여기서는 중복 정의하지 않음
  let found=false;
  document.querySelectorAll('.tab').forEach(b=>{
    const oc=b.getAttribute('onclick')||'';
    if(oc.includes("'"+t+"'")){sw(t,b);found=true;}
  });
  if(!found){
    curTab=t;openDetails={};
    // 바텀 네비 동기화 (sw()를 통하지 않는 경로)
    if(typeof window._syncBnav === 'function'){
      window._syncBnav(t);
    } else {
      document.querySelectorAll('.bnav-item').forEach(b=>{
        const oc=b.getAttribute('onclick')||'';
        const _isOn=oc.includes("'"+t+"'");
        b.classList.toggle('on',_isOn);
        b.setAttribute('aria-selected',_isOn?'true':'false');/* [A11Y] */
      });
    }
    const fstrip=document.getElementById('fstrip');
    const _li = (typeof isLoggedIn!=='undefined' ? !!isLoggedIn : false) || !!window.isLoggedIn;
    if(fstrip) fstrip.style.display=(t==='total'&&_li&&!(typeof isSubAdmin!=='undefined'&&isSubAdmin))?'block':'none';
    const C=document.getElementById('rcont');
    if(C) C.innerHTML='';
    render();
  }
}

/* ── 캘린더 헬퍼 ─────────────────────────────────────── */

// 예정 경기 삭제 확인 모달
function _calConfirmDel(onConfirm){
  const ov=document.createElement('div');
  ov.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:var(--z-modal-5);display:flex;align-items:center;justify-content:center;padding:16px';
  ov.innerHTML=`
    <div style="background:var(--white);border-radius:14px;padding:22px 20px 16px;max-width:300px;width:100%;box-shadow:0 10px 40px rgba(0,0,0,.3)">
      <div style="font-size:var(--fs-md);font-weight:800;color:var(--text);margin-bottom:10px">🗓️ 예정 경기 삭제</div>
      <div style="font-size:var(--fs-base);color:var(--text2);line-height:1.6;margin-bottom:18px">이 예정 경기를 삭제하시겠습니까?</div>
      <div style="display:flex;gap:8px;justify-content:flex-end">
        <button id="_calDelCancel" style="padding:7px 16px;border-radius:8px;border:1px solid var(--border2);background:var(--surface);font-size:var(--fs-base);font-weight:700;cursor:pointer;color:var(--text2)">취소</button>
        <button id="_calDelOk" style="padding:7px 16px;border-radius:8px;border:none;background:#EF4444;color:#fff;font-size:var(--fs-base);font-weight:700;cursor:pointer">삭제</button>
      </div>
    </div>`;
  document.body.appendChild(ov);
  const close=()=>{ try{ ov.remove(); }catch(e){} };
  ov.querySelector('#_calDelCancel').addEventListener('click', close);
  ov.querySelector('#_calDelOk').addEventListener('click', function(){ close(); onConfirm(); });
  ov.addEventListener('click', function(e){ if(e.target===ov) close(); });
}

// 저장 결과 토스트 (오프라인/에러 안내용)
function _calSaveToast(msg){
  try{
    const t=document.createElement('div');
    t.style.cssText='position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:#1e293b;color:#fff;padding:10px 20px;border-radius:20px;font-size:var(--fs-base);font-weight:700;z-index:var(--z-top);pointer-events:none;box-shadow:0 4px 20px rgba(0,0,0,.3);white-space:nowrap';
    t.textContent=msg;
    document.body.appendChild(t);
    setTimeout(()=>{ try{ t.remove(); }catch(e){} }, 4000);
  }catch(e){}
}

/* ── 하단 네비 더보기 드로어 ────────────────────────────── */
(function(){
  window._bnavMoreToggle = function(btn){
    const d=document.getElementById('bnavMoreDrawer');
    if(!d) return;
    if(d.style.display!=='none'){ _bnavMoreClose(); return; }
    d.style.display='block';
    btn.classList.add('on');
  };
  window._bnavMoreClose = function(){
    const d=document.getElementById('bnavMoreDrawer');
    if(d) d.style.display='none';
    const btn=document.getElementById('bn5');
    if(btn) btn.classList.remove('on');
  };
  window._bnavMoreNav = function(tab){
    _bnavMoreClose();
    if(typeof swNav==='function') swNav(tab, null);
    document.querySelectorAll('.bnav-item').forEach(function(b){
      b.classList.remove('on'); b.setAttribute('aria-selected','false');
    });
    const moreBtn=document.getElementById('bn5');
    if(moreBtn) moreBtn.classList.add('on');
  };

  // 더보기 버튼 스타일 (style.css 이관 전 인젝션)
  const s=document.createElement('style');
  s.textContent=
    '.bnav-more-btn{display:flex;flex-direction:column;align-items:center;gap:4px;' +
    'padding:10px 4px 8px;border:none;background:var(--surface);border-radius:12px;' +
    'cursor:pointer;font-family:"Noto Sans KR",sans-serif;font-size:var(--fs-caption);font-weight:700;' +
    'color:var(--text2);transition:background .15s,transform .1s;width:100%}' +
    '.bnav-more-btn:active{transform:scale(.92);background:var(--border2)}' +
    'body.dark .bnav-more-btn{background:var(--surface);color:var(--text2)}';
  if(document.head) document.head.appendChild(s);
})();
