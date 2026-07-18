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
    '.cal-toolbar-card,.cal-board-card,.cal-soft-card{padding:12px 14px;border-radius:22px;background:linear-gradient(180deg,rgba(255,255,255,.98),rgba(248,250,252,.94));border:1px solid rgba(148,163,184,.18);box-shadow:0 16px 32px rgba(15,23,42,.05)}',
    '.cal-toolbar-row{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap}',
    '.cal-nav-group,.cal-view-group{display:flex;align-items:center;gap:8px;flex-wrap:wrap}',
    '.cal-filter-wrap{display:flex;flex-wrap:wrap;gap:6px}',
    '.cal-board-card{padding:14px 16px}',
    '.cal-board-month table{border-collapse:separate;border-spacing:6px;table-layout:fixed;width:100%}',
    '.cal-board-month th{padding:8px 6px;font-size:var(--fs-caption);font-weight:900;color:var(--text3)}',
    '.cal-cell-empty{background:rgba(148,163,184,.08);border-radius:var(--r2);min-height:100px}',
    '.cal-cell{vertical-align:top;padding:8px;min-height:100px;border-radius:18px;background:linear-gradient(180deg,#fff,#f8fbff);border:1px solid rgba(148,163,184,.14);box-shadow:0 8px 18px rgba(15,23,42,.04);transition:.15s}',
    '.cal-cell.has-match{cursor:pointer;background:linear-gradient(180deg,#f8fbff,#eef6ff)}',
    '.cal-cell.has-match:hover{transform:translateY(-1px);box-shadow:0 14px 24px rgba(15,23,42,.07)}',
    '.cal-cell.active{outline:2px solid var(--blue);outline-offset:-2px;background:linear-gradient(180deg,#eaf3ff,#dbeafe)}',
    '.cal-day-num{font-weight:700;font-size:var(--fs-sm);color:var(--text1);width:26px;height:26px;border-radius:50%;display:flex;align-items:center;justify-content:center;margin-bottom:6px}',
    '.cal-day-num.today{background:linear-gradient(135deg,#2563eb,#3b82f6);color:#fff;font-weight:900;box-shadow:0 10px 18px rgba(37,99,235,.22)}',
    '.cal-week-list{display:flex;flex-direction:column;gap:8px}',
    '.cal-week-card{display:flex;gap:12px;padding:12px 14px;border-radius:18px;background:linear-gradient(180deg,#fff,#f8fbff);border:1px solid rgba(148,163,184,.18);box-shadow:0 10px 20px rgba(15,23,42,.04)}',
    '.cal-week-card.today{background:linear-gradient(180deg,#eff6ff,#dbeafe);border-color:rgba(59,130,246,.35)}',
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
    'body.dark .cal-hero,body.dark .cal-toolbar-card,body.dark .cal-board-card,body.dark .cal-soft-card,body.dark .cal-legend{background:linear-gradient(180deg,rgba(15,23,42,.94),rgba(15,23,42,.9));border-color:#334155;box-shadow:0 20px 38px rgba(0,0,0,.28),inset 0 1px 0 rgba(255,255,255,.03)}',
    'body.dark .cal-hero-title{color:#f8fafc}',
    'body.dark .cal-hero-desc{color:#94a3b8}',
    'body.dark .cal-hero-badge{background:rgba(30,41,59,.78);border-color:#334155;color:#cbd5e1}',
    'body.dark .cal-cell,body.dark .cal-week-card,body.dark .cal-day-sec{background:linear-gradient(180deg,rgba(15,23,42,.94),rgba(15,23,42,.9));border-color:#334155;box-shadow:0 12px 22px rgba(0,0,0,.18)}',
    'body.dark .cal-cell.has-match{background:linear-gradient(180deg,#132033,#17263c)}',
    'body.dark .cal-cell.active{background:linear-gradient(180deg,#17263c,#1e3a5f)}',
    'body.dark .cal-week-num{color:#f8fafc}',
    'body.dark .cal-day-summary{background:linear-gradient(135deg,#132033,#17263c);border-color:#1d4ed8}',
    'body.dark .cal-day-summary-title{color:#93c5fd}',
    'body.dark .cal-sched-card{background:linear-gradient(180deg,rgba(120,53,15,.28),rgba(120,53,15,.18));border-color:#92400e}',
    'body.dark .cal-match-card{background:linear-gradient(180deg,rgba(15,23,42,.94),rgba(15,23,42,.9));border-color:#334155;box-shadow:0 12px 22px rgba(0,0,0,.18)}',
    'body.dark .cal-match-card .rec-sum-header{background:linear-gradient(180deg,rgba(var(--rec-mode-rgb),.16),rgba(15,23,42,.78))}',
    'body.dark .cal-match-result{background:rgba(148,163,184,.12);color:#e2e8f0}',
    'body.dark .cal-match-result.is-win{background:rgba(34,197,94,.18);color:#86efac}',
    'body.dark .cal-match-result.is-pending{background:rgba(148,163,184,.16);color:#cbd5e1}',
    'body.dark .cal-match-card .rec-sum-score{background:rgba(148,163,184,.1)}',
    'body.dark .cal-match-card .rec-detail-area{background:linear-gradient(180deg,rgba(2,6,23,.22),rgba(15,23,42,.68));border-top-color:#334155}',
    'body.dark .cal-cell-empty{background:rgba(51,65,85,.24)}',
    'body.dark .cal-day-num{color:#e2e8f0}',
    'body.dark .cal-undated{background:linear-gradient(180deg,rgba(120,53,15,.28),rgba(120,53,15,.18));border-color:#92400e}',
    'body.dark .cal-undated-chip{background:rgba(120,53,15,.18);border-color:#92400e;color:#fde68a}',
    '@media (max-width:780px){.cal-hero{flex-direction:column;padding:16px;border-radius:20px}.cal-hero-title{font-size:20px}.cal-hero-badges{justify-content:flex-start}.cal-toolbar-card,.cal-board-card,.cal-soft-card{padding:10px}.cal-board-month table{border-spacing:4px}.cal-cell,.cal-cell-empty{min-height:86px}}',
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
  const allMatches=(calTypeFilter&&calTypeFilter!=='all')
    ? rawAll.filter(m=>matchType(m)===calTypeFilter)
    : rawAll;
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
  const _viewLabel = calView==='month' ? '월간 보기' : calView==='week' ? '주간 보기' : '일간 보기';
  const _activeFilterInfo = calTypeFilter==='all'
    ? '전체 일정'
    : ((TYPE_INFO[calTypeFilter]&&TYPE_INFO[calTypeFilter].lbl) || '필터 일정');

  let calHTML='';
  let navHTML='';

  // 달력 셀/주간 리스트를 "요약 칩"으로 단순화
  function calCellChips(ds, matches){
    if(!matches||!matches.length) return '';
    const chipMode = (localStorage.getItem('su_cal_chip_mode')||'types');
    const byType={};
    matches.forEach(m=>{const t=matchType(m);byType[t]=(byType[t]||0)+1;});
    // 동률/애매함 방지: 타입 우선순위로 타이브레이크
    const prio = ['sched','comp','pro','tt','ck','univm','mini','ind','gj'];
    const top=Object.entries(byType)
      .sort((a,b)=>{
        const dc=(b[1]-a[1]);
        if(dc!==0) return dc;
        return (prio.indexOf(a[0])<0?99:prio.indexOf(a[0])) - (prio.indexOf(b[0])<0?99:prio.indexOf(b[0]));
      })
      .slice(0,2);
    const used=top.reduce((s,[,c])=>s+c,0);
    const restCnt=Math.max(0, matches.length-used);
    const chip=(txt,bg,fg)=>`<span class="cal-month-chip" style="border:1px solid ${bg};background:${bg};color:${fg}">${txt}</span>`;
    const totalChip=chip(`총 ${matches.length}`,'rgba(37,99,235,.10)','var(--blue)');
    if(chipMode==='total') return `<div class="cal-month-chip-row">${totalChip}</div>`;
    const typeChips=top.map(([t,c])=>{
      const ti=TYPE_INFO[t]||TYPE_INFO.comp;
      return chip(`${ti.emoji} ${c}`, ti.bg+'22', ti.bg);
    }).join('');
    const more=restCnt>0?chip(`+${restCnt}`,'rgba(100,116,139,.10)','var(--text3)'):'';
    return `<div class="cal-month-chip-row">${totalChip}${typeChips}${more}</div>`;
  }

  if(calView==='month'){
    navHTML=`
      <button class="btn btn-w btn-sm" onclick="calYear=calMonth===0?calYear-1:calYear;calMonth=calMonth===0?11:calMonth-1;render()">◀ 이전</button>
      <span style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:16px;min-width:110px;text-align:center">${year}년 ${month+1}월</span>
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
          const isToday=ds===todayStr;
          const hasMatch=matches.length>0;
          const isActive=ds===_calActiveDay;
          const chips=calCellChips(ds,matches);
          rowHTML+=`<td data-ds="${ds}" class="cal-cell${hasMatch?' has-match':''}${isActive?' active':''}"
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
      <div class="cal-board-month">
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
    for(let i=0;i<7;i++){
      const d=new Date(weekStart); d.setDate(weekStart.getDate()+i);
      const ds=dateStr(d.getFullYear(),d.getMonth(),d.getDate());
      const matches=dateMatchMap[ds]||[];
      const isToday=ds===todayStr;
      const chips=calCellChips(ds,matches);
      rows+=`<div class="cal-week-card${isToday?' today':''}" style="cursor:${matches.length?'pointer':'default'}"
        ${matches.length?`onclick="calDayDate='${ds}';calView='day';render()"`:''}>
        <div class="cal-week-date">
          <div class="cal-week-day" style="color:${i===0?'var(--red)':i===6?'var(--blue)':'var(--gray-l)'}">${weeks[i]}</div>
          <div class="cal-week-num" style="color:${isToday?'var(--blue)':'inherit'}">${d.getDate()}</div>
        </div>
        <div style="flex:1">
          ${matches.length===0?`<span style="color:var(--gray-l);font-size:var(--fs-sm)">경기 없음</span>`:chips}
        </div>
      </div>`;
    }
    calHTML=`<div class="cal-week-list">${rows}</div>`;

  } else if(calView==='day'){
    const d=new Date(calDayDate);
    const prevD=new Date(d); prevD.setDate(d.getDate()-1);
    const nextD=new Date(d); nextD.setDate(d.getDate()+1);
    const fmtDayStr=(dt)=>dateStr(dt.getFullYear(),dt.getMonth(),dt.getDate());
    // UX fix: 월간보기 복귀 버튼 추가
    navHTML=`
      <button class="btn btn-w btn-sm" onclick="calView='month';render()">◀ 월간</button>
      <button class="btn btn-w btn-sm" onclick="calDayDate='${fmtDayStr(prevD)}';render()">◀ 전날</button>
      <span style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:16px;min-width:130px;text-align:center">${calDayDate}</span>
      <button class="btn btn-w btn-sm" onclick="calDayDate='${fmtDayStr(nextD)}';render()">다음날 ▶</button>
      <button class="btn btn-w btn-sm" onclick="calDayDate='${todayStr}';render()">오늘</button>`;

    const matches=dateMatchMap[calDayDate]||[];
    if(!matches.length){
      calHTML=`<div class="cal-empty-state">이 날 경기가 없습니다.</div>`;
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

        calHTML = `<div class="cal-day-sections">` +
        sec('📌 예정', schedList.length ? schedList.map(x=>schedCard(x.m)).join('') : '') +
        sec('📜 기록', recList.length ? recList.map(x=>matchCard(x.m,x.mi)).join('') : '') +
        sec('🏆 대회/리그', tourList.length ? tourList.map(x=>matchCard(x.m,x.mi)).join('') : '') +
        `</div>`;
    }
  }

  // 날짜 미정 (타입 필터 적용)
  const undatedMatches=(calTypeFilter&&calTypeFilter!=='all'?rawAll.filter(m=>matchType(m)===calTypeFilter):rawAll).filter(m=>!m.d||(typeof m.d==='string'&&m.d.trim()===''));
  const undatedHTML=undatedMatches.length?`<div class="cal-undated">
  <div style="font-size:var(--fs-sm);font-weight:700;color:#92400e;margin-bottom:6px">📋 날짜 미정 경기 (${undatedMatches.length}건)</div>
  <div class="cal-undated-chips">
  ${undatedMatches.slice(0,10).map(m=>`<span class="cal-undated-chip">${matchLabel(m)}</span>`).join('')}
  ${undatedMatches.length>10?`<span style="font-size:10px;color:#92400e">... 외 ${undatedMatches.length-10}건</span>`:''}
  </div>
</div>`:'';

  // Feature 2: 타입 필터 버튼
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
    ? `<div class="fbar no-export" style="overflow-x:auto;flex-wrap:nowrap;-webkit-overflow-scrolling:touch;scrollbar-width:none;gap:4px;margin-bottom:6px;align-items:center">
        <button class="pill ${window._calFilterOpen?'on':''}" style="flex-shrink:0;white-space:nowrap" onclick="window._calFilterOpen=!window._calFilterOpen;try{localStorage.setItem('su_cal_filter_open',window._calFilterOpen?'1':'0');}catch(e){}render()">🔍 필터 ${window._calFilterOpen?'▲':'▼'}</button>
      </div>`
    : '';
  const filterHTML = (_enableSubFilter ? window._calFilterOpen : true)
    ? `<div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:12px" class="no-export">
        ${_filterBtns.map(f=>`<button class="pill${calTypeFilter===f.id?' on':''}" onclick="calTypeFilter='${f.id}';render()">${f.lbl}</button>`).join('')}
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
        <span class="cal-hero-badge">총 ${allMatches.length}건</span>
      </div>
    </section>
    <div class="cal-toolbar-card">
    <div class="cal-toolbar-row">
      <div class="cal-nav-group">
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
    ${filterToggleHTML}
    ${filterHTML}
    ${undatedHTML}
    <!-- 캘린더 본문 -->
    <div class="cal-board-card" style="overflow-x:auto">
      ${calHTML}
    </div>
    <!-- 범례 -->
    <div class="cal-legend">
      <span style="font-weight:700">범례:</span>
      ${Object.entries(TYPE_INFO).filter(([k])=>k!=='sched').map(([k,v])=>`<span class="cal-legend-item" style="background:${v.bg}">${v.lbl}</span>`).join('')}
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
