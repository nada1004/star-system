function rCal(C,T){
  T.textContent='📅 경기 캘린더';

  // Feature 3: 뷰 저장
  localStorage.setItem('su_cal_view', calView);

  // 모든 경기 데이터 캐싱
  if(typeof calScheduled==='undefined') window.calScheduled=[];
  window._calScheduled=calScheduled;
  const _calT=localStorage.getItem('su_last_save_time')||'0';
  if(_calT!==window._calMatchCacheTime){window._calMatchCache=null;window._calMatchCacheTime=_calT;}
  if(!window._calMatchCache) window._calMatchCache=[
    ...miniM,...univM,...comps,...ckM,...proM,
    ...(typeof getTourneyMatches==='function'?getTourneyMatches():[]),
    ...(typeof indM!=='undefined'?indM:[]),
    ...(typeof gjM!=='undefined'?gjM:[]),
    ...(typeof ttM!=='undefined'?ttM:[]),
    ...window._calScheduled
  ];

  // Bug fix: 통합 타입 감지 (한 곳에서 관리)
  function matchType(m){
    if(window._calScheduled&&window._calScheduled.includes(m)) return 'sched';
    if(typeof indM!=='undefined'&&indM.includes(m)) return 'ind';
    if(typeof gjM!=='undefined'&&gjM.includes(m)) return 'gj';
    if(typeof ttM!=='undefined'&&ttM.includes(m)) return 'tt';
    if(miniM.includes(m)) return 'mini';
    if(univM.includes(m)) return 'univm';
    if(ckM.includes(m)) return 'ck';
    if(proM.includes(m)) return 'pro';
    return 'comp';
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
    if(type==='sched') return `📌 ${m.note||'예정'}`;
    if(type==='ind'||type==='gj') return `${ti.emoji} ${m.wName||''} vs ${m.lName||''}`;
    if(type==='tt') return `🎯 ${m.compName||''}`;
    if(type==='mini') return `⚡ ${m.a||''} vs ${m.b||''}`;
    if(type==='univm') return `🏟️ ${m.a||''} vs ${m.b||''}`;
    if(type==='ck'||type==='pro') return `${ti.emoji} ${m.teamALabel||'A팀'} vs ${m.teamBLabel||'B팀'}`;
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
    const chip=(txt,bg,fg)=>`<span style="display:inline-flex;align-items:center;gap:4px;padding:2px 6px;border-radius:999px;font-size:10px;font-weight:900;border:1px solid ${bg};background:${bg};color:${fg};white-space:nowrap">${txt}</span>`;
    const totalChip=chip(`총 ${matches.length}`,'rgba(37,99,235,.10)','var(--blue)');
    if(chipMode==='total') return `<div style="display:flex;gap:4px;flex-wrap:wrap">${totalChip}</div>`;
    const typeChips=top.map(([t,c])=>{
      const ti=TYPE_INFO[t]||TYPE_INFO.comp;
      return chip(`${ti.emoji} ${c}`, ti.bg+'22', ti.bg);
    }).join('');
    const more=restCnt>0?chip(`+${restCnt}`,'rgba(100,116,139,.10)','var(--text3)'):'';
    return `<div style="display:flex;gap:4px;flex-wrap:wrap">${totalChip}${typeChips}${more}</div>`;
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
          rowHTML+=`<td style="background:var(--surface);vertical-align:top;padding:4px;min-height:80px"></td>`;
        } else {
          const ds=dateStr(year,month,day);
          const matches=dateMatchMap[ds]||[];
          const isToday=ds===todayStr;
          const hasMatch=matches.length>0;
          const isActive=ds===_calActiveDay;
          const chips=calCellChips(ds,matches);
          rowHTML+=`<td data-ds="${ds}" style="vertical-align:top;padding:4px;min-height:80px;cursor:${hasMatch?'pointer':'default'};${hasMatch?`background:${isActive?'#dbeafe':'#f0f6ff'};`:''}border-radius:6px;${isActive?'outline:2px solid var(--blue);outline-offset:-2px;':''}"
            ${hasMatch?`onclick="calShowDay('${ds}')"`:''}
          >
            <div style="font-weight:${isToday?'900':'600'};font-size:12px;color:${isToday?'#fff':'var(--text)'};background:${isToday?'var(--blue)':'transparent'};width:22px;height:22px;border-radius:50%;display:flex;align-items:center;justify-content:center;margin-bottom:3px">${day}</div>
            ${hasMatch?chips:''}
          </td>`;
          day++;
        }
      }
      cells+=`<tr>${rowHTML}</tr>`;
      if(day>lastDate) break;
    }
    calHTML=`
      <table style="width:100%;border-collapse:collapse;table-layout:fixed">
        <thead><tr>${weeks.map((w,i)=>`<th style="padding:8px;font-size:11px;color:${i===0?'var(--red)':i===6?'var(--blue)':'var(--gray-l)'};font-weight:700">${w}</th>`).join('')}</tr></thead>
        <tbody>${cells}</tbody>
      </table>`;

  } else if(calView==='week'){
    const ws=new Date(weekStart), we=new Date(weekStart);
    we.setDate(we.getDate()+6);
    navHTML=`
      <button class="btn btn-w btn-sm" onclick="calWeekOffset--;render()">◀ 이전 주</button>
      <span style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:15px;min-width:130px;text-align:center">${ws.getMonth()+1}/${ws.getDate()} ~ ${we.getMonth()+1}/${we.getDate()}</span>
      <button class="btn btn-w btn-sm" onclick="calWeekOffset++;render()">다음 주 ▶</button>
      <button class="btn btn-w btn-sm" onclick="calWeekOffset=0;render()">이번 주</button>`;

    let rows='';
    for(let i=0;i<7;i++){
      const d=new Date(weekStart); d.setDate(weekStart.getDate()+i);
      const ds=dateStr(d.getFullYear(),d.getMonth(),d.getDate());
      const matches=dateMatchMap[ds]||[];
      const isToday=ds===todayStr;
      const chips=calCellChips(ds,matches);
      rows+=`<div style="display:flex;gap:12px;padding:10px 14px;background:${isToday?'var(--blue-l)':'var(--white)'};border:1px solid ${isToday?'var(--blue)':'var(--border)'};border-radius:8px;margin-bottom:6px;align-items:flex-start;cursor:${matches.length?'pointer':'default'}"
        ${matches.length?`onclick="calDayDate='${ds}';calView='day';render()"`:''}>
        <div style="min-width:48px;text-align:center">
          <div style="font-size:10px;color:${i===0?'var(--red)':i===6?'var(--blue)':'var(--gray-l)'};font-weight:700">${weeks[i]}</div>
          <div style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:20px;color:${isToday?'var(--blue)':'var(--text)'}">${d.getDate()}</div>
        </div>
        <div style="flex:1">
          ${matches.length===0?`<span style="color:var(--gray-l);font-size:12px">경기 없음</span>`:chips}
        </div>
      </div>`;
    }
    calHTML=rows;

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
      calHTML=`<div style="padding:40px;text-align:center;color:var(--gray-l)">이 날 경기가 없습니다.</div>`;
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
        return `<div style="margin-bottom:14px">
          <div style="font-size:12px;font-weight:900;color:var(--text2);margin-bottom:8px;display:flex;align-items:center;gap:8px">
            <span style="background:var(--surface);border:1px solid var(--border);padding:4px 10px;border-radius:999px">${title}</span>
          </div>
          ${inner}
        </div>`;
      }

      function schedCard(m){
        const timeStr=m.time?`<span style="font-size:11px;background:#f0f6ff;border:1px solid var(--blue-ll);border-radius:4px;padding:2px 7px;color:var(--blue);font-weight:700">🕐 ${m.time}</span>`:'';
        return `<div style="background:#fef9c3;border:1px solid #fde68a;border-radius:12px;margin-bottom:10px;padding:14px 16px">
          <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
            <span style="font-weight:900;color:#92400e;font-size:14px">📌 ${m.note||'예정'}</span>
            ${timeStr}
            <div style="margin-left:auto;display:flex;gap:6px" class="no-export">
              ${isLoggedIn?`<button class="btn btn-r btn-xs" onclick="calDeleteSched('${m._id}')">🗑️ 삭제</button>`:''}
            </div>
          </div>
        </div>`;
      }

      function matchCard(m,mi){
        const type=matchType(m);
        const ti=TYPE_INFO[type]||TYPE_INFO.comp;
        const tA=getTeamA(m), tB=getTeamB(m);
        const _isIG=type==='ind'||type==='gj';
        const ca=_isIG?ti.bg:(type==='ck'||type==='pro')?'#2563eb':gc(m.a||'');
        const cb=_isIG?'#64748b':(type==='ck'||type==='pro')?'#dc2626':gc(m.b||'');
        const aWin=_isIG?!!m.wName:(m.sa??-1)>(m.sb??-1), bWin=_isIG?false:(m.sb??-1)>(m.sa??-1);
        const hasResult=_isIG?!!m.wName:(m.sa!=null&&m.sa!=='');
        const timeStr=m.time?`<span style="font-size:11px;background:#f0f6ff;border:1px solid var(--blue-ll);border-radius:4px;padding:2px 7px;color:var(--blue);font-weight:700">🕐 ${m.time}</span>`:'';
        const detKey=`calday-${calDayDate}-${mi}`;
        const modeKey=(typeof indM!=='undefined'&&indM.includes(m))?'ind':(typeof gjM!=='undefined'&&gjM.includes(m))?'gj':miniM.includes(m)?'mini':univM.includes(m)?'univm':ckM.includes(m)?'ck':proM.includes(m)?'pro':'comp';
        const detHTML=buildDetailHTML(m,modeKey,tA,tB,ca,cb,aWin,bWin);
        const leftCol = hasResult?(aWin?ca:bWin?cb:'var(--border)'):'var(--border)';
        return `<div class="rec-summary" style="margin-bottom:10px;border-left:3px solid ${leftCol}">
          <div class="rec-sum-header" style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
            <span style="font-size:11px;font-weight:900;color:${ti.bg}">${ti.lbl}</span>
            ${timeStr}
            <span class="ubadge${aWin&&hasResult?'':hasResult?' loser':''}" style="background:${ca}">${tA}</span>
            ${hasResult&&!_isIG?`<div style="font-family:'Noto Sans KR',sans-serif;font-weight:1000;font-size:18px"><span class="${aWin?'wt':bWin?'lt':'pt-z'}">${m.sa}</span><span style="color:var(--gray-l);font-size:13px"> : </span><span class="${bWin?'wt':aWin?'lt':'pt-z'}">${m.sb}</span></div>`:`<span style="color:var(--gray-l);font-weight:800">vs</span>`}
            <span class="ubadge${bWin&&hasResult?'':hasResult?' loser':''}" style="background:${cb}">${tB}</span>
            <span style="font-size:11px;color:var(--gray-l)">${hasResult?(aWin?`▶ ${tA} 승`:bWin?`▶ ${tB} 승`:'무'):'결과 미입력'}</span>
            <div style="margin-left:auto;display:flex;gap:6px;align-items:center" class="no-export">
              ${(()=>{const _adm=(localStorage.getItem('su_share_admin_only')||'0')==='1';return(!_adm||isLoggedIn)?`<button class="btn btn-p btn-xs" onclick="openRCalMatchShareCard('${calDayDate}',${mi})">🎴 공유</button>`:'';})()}
              <button id="detbtn-${detKey}" class="btn-detail" onclick="toggleDetail('${detKey}')">📂 상세</button>
            </div>
          </div>
          <div id="det-${detKey}" class="rec-detail-area">
            <div style="padding:12px 14px">${detHTML}</div>
          </div>
        </div>`;
      }

      calHTML =
        sec('📌 예정', schedList.length ? schedList.map(x=>schedCard(x.m)).join('') : '') +
        sec('📜 기록', recList.length ? recList.map(x=>matchCard(x.m,x.mi)).join('') : '') +
        sec('🏆 대회/리그', tourList.length ? tourList.map(x=>matchCard(x.m,x.mi)).join('') : '');
    }
  }

  // 날짜 미정 (타입 필터 적용)
  const undatedMatches=(calTypeFilter&&calTypeFilter!=='all'?rawAll.filter(m=>matchType(m)===calTypeFilter):rawAll).filter(m=>!m.d||(typeof m.d==='string'&&m.d.trim()===''));
  const undatedHTML=undatedMatches.length?`<div style="margin-bottom:12px;background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:10px 14px">
  <div style="font-size:12px;font-weight:700;color:#92400e;margin-bottom:6px">📋 날짜 미정 경기 (${undatedMatches.length}건)</div>
  <div style="display:flex;flex-wrap:wrap;gap:4px">
  ${undatedMatches.slice(0,10).map(m=>`<span style="font-size:10px;background:#fef3c7;border:1px solid #fde68a;border-radius:4px;padding:2px 7px;color:#92400e">${matchLabel(m)}</span>`).join('')}
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
  const filterHTML=`<div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:12px" class="no-export">
    ${filterBtns.map(f=>`<button class="pill${calTypeFilter===f.id?' on':''}" onclick="calTypeFilter='${f.id}';render()">${f.lbl}</button>`).join('')}
  </div>`;

  C.innerHTML=`
  <div>
    <!-- 컨트롤 바 -->
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;flex-wrap:wrap">
      ${navHTML}
      <div style="margin-left:auto;display:flex;gap:4px;flex-wrap:wrap;align-items:center">
        <button class="pill ${calView==='month'?'on':''}" onclick="calView='month';render()">월간</button>
        <button class="pill ${calView==='week'?'on':''}" onclick="calWeekOffset=0;calView='week';render()">주간</button>
        <button class="pill ${calView==='day'?'on':''}" onclick="calDayDate='${todayStr}';calView='day';render()">일간</button>
        ${isLoggedIn?`<button class="pill no-export" onclick="openCalSchedModal()">+ 예정</button>`:''}
      </div>
    </div>
    ${filterHTML}
    ${undatedHTML}
    <!-- 캘린더 본문 -->
    <div style="background:var(--white);border:1px solid var(--border);border-radius:10px;padding:12px;overflow-x:auto">
      ${calHTML}
    </div>
    <!-- 범례 -->
    <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;padding:8px 12px;margin-top:10px;background:var(--surface);border-radius:8px;font-size:10px;color:var(--gray-l)">
      <span style="font-weight:700">범례:</span>
      ${Object.entries(TYPE_INFO).filter(([k])=>k!=='sched').map(([k,v])=>`<span style="background:${v.bg};color:#fff;border-radius:3px;padding:1px 6px">${v.lbl}</span>`).join('')}
    </div>
    <!-- 선택 날짜 경기 목록 (월간뷰용) -->
    <div id="calDayDetail" style="margin-top:14px"></div>
  </div>`;
}

let _calActiveDay='';
let _calDetailState={};

function calDeleteSched(id){
  if(!isLoggedIn) return;
  if(!confirm('예정 경기를 삭제할까요?')) return;
  const idx=calScheduled.findIndex(x=>x._id===id);
  if(idx>=0){ calScheduled.splice(idx,1); window._calScheduled=calScheduled; }
  window._calMatchCache=null;
  if(typeof save==='function') save();
  render();
}

// Feature 1+3: 예정 경기 등록 모달
function openCalSchedModal(prefillDate){
  const today=new Date();
  const pad=n=>String(n).padStart(2,'0');
  const todayStr=`${today.getFullYear()}-${pad(today.getMonth()+1)}-${pad(today.getDate())}`;
  const dateEl=document.getElementById('cal-sched-date');
  const timeEl=document.getElementById('cal-sched-time');
  const noteEl=document.getElementById('cal-sched-note');
  if(dateEl) dateEl.value=prefillDate||calDayDate||todayStr;
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
  if(typeof save==='function') save();
  cm('calSchedModal');
  render();
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
  if(_calActiveDay===ds){
    _calActiveDay='';
    _calDetailState={};
    el.innerHTML='';
    render();
    return;
  }
  _calActiveDay=ds;
  _calDetailState={};
  const allM=[...miniM,...univM,...comps,...ckM,...proM,...(typeof getTourneyMatches==='function'?getTourneyMatches():[]),...(typeof indM!=='undefined'?indM:[]),...(typeof gjM!=='undefined'?gjM:[])];
  const matches=allM.filter(m=>m.d===ds);
  const schedMatches=(calScheduled||[]).filter(m=>m.d===ds);
  if(!window._calDayCache) window._calDayCache={};
  window._calDayCache[ds]=matches;

  function buildMatchRow(m,mi){
    const _isInd=typeof indM!=='undefined'&&indM.includes(m);
    const _isGj=typeof gjM!=='undefined'&&gjM.includes(m);
    const _isIG=_isInd||_isGj;
    // ind/gj: 별도 처리 (sa/sb 없음)
    if(_isIG){
      const typeBg=_isInd?'#8b5cf6':'#db2777';
      const typeLabel=_isInd?'🎮 개인전':'⚔️ 끝장전';
      const detKey='caldm-'+ds+'-'+mi;
      const detHTML=buildDetailHTML(m,_isInd?'ind':'gj',m.wName||'',m.lName||'',typeBg,'#64748b',true,false);
      return '<div class="rec-summary" style="margin-bottom:6px">'
        +'<div class="rec-sum-header" style="cursor:pointer" onclick="calToggleDetail(\''+detKey+'\')">'
        +'<span style="background:'+typeBg+';color:#fff;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:700">'+typeLabel+'</span>'
        +'<div class="rec-sum-vs" style="flex:1;display:flex;align-items:center;gap:6px;flex-wrap:wrap">'
        +'<span style="font-weight:700;color:'+typeBg+'">'+( m.wName||'')+'</span>'
        +'<span style="color:var(--gray-l);font-size:12px">vs</span>'
        +'<span style="font-weight:600;opacity:.7">'+( m.lName||'')+'</span>'
        +(m.map?'<span style="font-size:11px;color:var(--text3)">📍'+m.map+'</span>':'')
        +'<span style="font-size:12px;font-weight:700;color:'+typeBg+'">▶ '+(m.wName||'')+' 승</span>'
        +'</div>'
        +'<div class="no-export" style="margin-left:auto;display:flex;gap:4px;align-items:center">'
        +'<button id="detbtn-'+detKey+'" class="btn-detail" onclick="event.stopPropagation();calToggleDetail(\''+detKey+'\')">📂 상세</button>'
        +'</div>'
        +'</div>'
        +'<div id="det-'+detKey+'" style="display:none;padding:10px 14px;background:var(--surface);border-top:1px solid var(--border)">'
        +detHTML
        +'</div>'
        +'</div>';
    }
    if(m.sa==null||m.sa==='') return '';
    const isCKorPro=ckM.includes(m)||proM.includes(m);
    const tA=isCKorPro?'A팀':(m.a||'');
    const tB=isCKorPro?'B팀':(m.b||'');
    const ca=isCKorPro?'#2563eb':gc(m.a||'');
    const cb=isCKorPro?'#dc2626':gc(m.b||'');
    const aWin=(m.sa??-1)>(m.sb??-1), bWin=(m.sb??-1)>(m.sa??-1);
    const typeBg=miniM.includes(m)?'#2563eb':univM.includes(m)?'#7c3aed':ckM.includes(m)?'#d97706':proM.includes(m)?'#7c3aed':'#16a34a';
    const typeLabel=miniM.includes(m)?'⚡ 미니대전':univM.includes(m)?'🏟️ 대학대전':ckM.includes(m)?'🤝 대학CK':proM.includes(m)?'🏅 프로리그':'🎖️ 대회';
    const detKey='caldm-'+ds+'-'+mi;
    const modeKey=miniM.includes(m)?'mini':univM.includes(m)?'univm':ckM.includes(m)?'ck':proM.includes(m)?'pro':'comp';
    const detHTML=buildDetailHTML(m,modeKey,tA,tB,ca,cb,aWin,bWin);
    const winLabel=aWin?'▶ '+tA+' 승':bWin?'▶ '+tB+' 승':'무승부';
    const winColor=aWin?ca:bWin?cb:'#888';
    return '<div class="rec-summary" style="margin-bottom:6px">'
      +'<div class="rec-sum-header" style="cursor:pointer" onclick="calToggleDetail(\''+detKey+'\')">'
      +'<span style="background:'+typeBg+';color:#fff;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:700">'+typeLabel+'</span>'
      +'<div class="rec-sum-vs" style="flex:1">'
      +'<span class="ubadge'+(aWin?'':' loser')+'" style="background:'+ca+'">'+tA+'</span>'
      +'<div class="rec-sum-score score-click" onclick="event.stopPropagation();calToggleDetail(\''+detKey+'\')">'
      +'<span class="'+(aWin?'wt':bWin?'lt':'pt-z')+'">'+m.sa+'</span>'
      +'<span style="color:var(--gray-l);font-size:14px"> : </span>'
      +'<span class="'+(bWin?'wt':aWin?'lt':'pt-z')+'">'+m.sb+'</span>'
      +'</div>'
      +'<span class="ubadge'+(bWin?'':' loser')+'" style="background:'+cb+'">'+tB+'</span>'
      +'<span style="font-size:12px;font-weight:700;color:'+winColor+'">'+winLabel+'</span>'
      +'</div>'
      +'<div class="no-export" style="margin-left:auto;display:flex;gap:4px;align-items:center">'
      +'<button id="detbtn-'+detKey+'" class="btn-detail" onclick="event.stopPropagation();calToggleDetail(\''+detKey+'\')">📂 상세</button>'
      +'</div>'
      +'</div>'
      +'<div id="det-'+detKey+'" style="display:none;padding:10px 14px;background:var(--surface);border-top:1px solid var(--border)">'
      +detHTML
      +'<div style="margin-top:8px;padding-top:8px;border-top:1px solid var(--border)">'
      +'<button class="btn btn-p btn-xs no-export" onclick="openCalMatchShareCardByCache(\''+ds+'\','+mi+');event.stopPropagation()">🎴 공유 카드</button>'
      +'</div>'
      +'</div>'
      +'</div>';
  }

  el.style.animation='fadeIn .2s';
  el.innerHTML='<div class="ssec" style="border:2px solid var(--blue);animation:fadeIn .2s">'
    +'<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;flex-wrap:wrap;gap:8px">'
    +'<h4 style="margin:0;color:var(--blue)">📅 '+ds+' 경기 목록 <span style="font-size:12px;font-weight:400;color:var(--gray-l)">'+matches.length+'경기</span></h4>'
    +'<div style="display:flex;gap:6px">'
    +'<button class="btn btn-b btn-sm" onclick="calDayDate=\''+ds+'\';calView=\'day\';render()">📋 일간 상세보기</button>'
    +'<button class="btn btn-w btn-sm" onclick="_calActiveDay=\'\';document.getElementById(\'calDayDetail\').innerHTML=\'\'">✕ 닫기</button>'
    +'</div></div>'
    +matches.map(buildMatchRow).join('')
    +(schedMatches.length?'<div style="margin-top:10px;padding:10px 14px;background:#fefce8;border:1px solid #fde68a;border-radius:8px">'
      +'<div style="font-size:12px;font-weight:700;color:#92400e;margin-bottom:8px">📌 예정 경기</div>'
      +schedMatches.map(m=>'<div style="display:flex;align-items:center;gap:8px;padding:4px 0;border-bottom:1px solid #fde68a20">'
        +'<span style="font-size:12px;flex:1">'+(m.note||'예정')+(m.time?' 🕐'+m.time:'')+'</span>'
        +(isLoggedIn?'<button class="btn btn-r btn-xs" onclick="calDeleteSched(\''+m._id+'\')">🗑️</button>':'')
        +'</div>'
      ).join('')
      +'</div>':'')
    +'</div>';
}

function swNav(t,el){
  document.querySelectorAll('.bnav-item').forEach(b=>b.classList.remove('on'));
  if(el) el.classList.add('on');
  if(t==='comp'){compSub='league';leagueFilterDate='';leagueFilterGrp='';grpRankFilter='';}
  if(t==='mini')miniSub='records';
  if(t==='univck')ckSub='records';
  if(t==='univm')univmSub='records';
  if(t==='pro')proSub='records';
  if(t==='hist')histSub='mini';
  let found=false;
  document.querySelectorAll('.tab').forEach(b=>{
    const oc=b.getAttribute('onclick')||'';
    if(oc.includes("'"+t+"'")){sw(t,b);found=true;}
  });
  if(!found){
    curTab=t;openDetails={};
    // 바텀 네비 동기화
    document.querySelectorAll('.bnav-item').forEach(b=>{
      const oc=b.getAttribute('onclick')||'';
      b.classList.toggle('on',oc.includes("'"+t+"'"));
    });
    const fstrip=document.getElementById('fstrip');
    if(fstrip) fstrip.style.display=(t==='total'&&isLoggedIn)?'block':'none';
    const C=document.getElementById('rcont');
    if(C) C.innerHTML='';
    render();
  }
}
