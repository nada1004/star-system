function rCal(C,T){
  T.textContent='📅 경기 캘린더';

  // 모든 경기 데이터 맵 (날짜→경기 객체 배열)
  const allMatches=[...miniM,...univM,...comps,...ckM,...proM,...(typeof getTourneyMatches==='function'?getTourneyMatches():[])];
  window._rCalAllMatches=allMatches; // calView=day 공유카드용 전역 캐시
  const dateMatchMap={};
  allMatches.forEach(m=>{
    const d=m.d||'';
    if(!d)return;
    if(!dateMatchMap[d])dateMatchMap[d]=[];
    dateMatchMap[d].push(m);
  });

  // 날짜 label 생성
  function matchLabel(m){
    if(miniM.includes(m)) return `⚡ ${m.a||''} vs ${m.b||''}`;
    if(univM.includes(m)) return `🏟️ ${m.a||''} vs ${m.b||''}`;
    if(ckM.includes(m))   return `🤝 CK ${m.teamALabel||'A팀'} vs ${m.teamBLabel||'B팀'}`;
    if(proM.includes(m))  return `🏅 프로 ${m.teamALabel||'A팀'} vs ${m.teamBLabel||'B팀'}`;
    return `🎖️ 대회`;
  }
  // 캘린더용 팀명 getter (프로/CK는 label 사용)
  function getTeamA(m){
  if(ckM.includes(m)||proM.includes(m)){
    const raw=(m.teamALabel||'').replace(/^\$\{.*\}$/,'');
    return raw||'A팀';
  }
  return m.a||'';
}
  function getTeamB(m){
  if(ckM.includes(m)||proM.includes(m)){
    const raw=(m.teamBLabel||'').replace(/^\$\{.*\}$/,'');
    return raw||'B팀';
  }
  return m.b||'';
}

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

  // 주간뷰 기준 weekStart (오프셋 적용)
  const weekStart=new Date(today);
  weekStart.setDate(today.getDate()-today.getDay()+calWeekOffset*7);

  // 일간뷰 날짜
  if(!calDayDate) calDayDate=todayStr;

  let calHTML='';
  let navHTML='';

  if(calView==='month'){
    navHTML=`
      <button class="btn btn-w btn-sm" onclick="calYear=calMonth===0?calYear-1:calYear;calMonth=calMonth===0?11:calMonth-1;render()">◀ 이전</button>
      <span style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:16px;min-width:110px;text-align:center">${year}년 ${month+1}월</span>
      <button class="btn btn-w btn-sm" onclick="calYear=calMonth===11?calYear+1:calYear;calMonth=calMonth===11?0:calMonth+1;render()">다음 ▶</button>
      <button class="btn btn-w btn-sm" onclick="calYear=new Date().getFullYear();calMonth=new Date().getMonth();render()">오늘</button>`;

    let cells='';
    let day=1;
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
          rowHTML+=`<td data-ds="${ds}" style="vertical-align:top;padding:4px;min-height:80px;cursor:${hasMatch?'pointer':'default'};${hasMatch?`background:${ds===_calActiveDay?'#dbeafe':'#f0f6ff'};`:''}border-radius:6px;${hasMatch&&ds===_calActiveDay?'outline:2px solid var(--blue);outline-offset:-2px;':''}"
            ${hasMatch?`onclick="calShowDay('${ds}')"`:''}
          >
            <div style="font-weight:${isToday?'900':'600'};font-size:12px;color:${isToday?'#fff':'var(--text)'};background:${isToday?'var(--blue)':'transparent'};width:22px;height:22px;border-radius:50%;display:flex;align-items:center;justify-content:center;margin-bottom:3px">${day}</div>
            ${matches.slice(0,2).map(m=>`<div style="font-size:9px;background:${proM.includes(m)?'#7c3aed':miniM.includes(m)?'#2563eb':univM.includes(m)?'#059669':ckM.includes(m)?'#d97706':'#2563eb'};color:#fff;border-radius:3px;padding:1px 4px;margin-bottom:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${matchLabel(m)}</div>`).join('')}
            ${matches.length>2?`<div style="font-size:9px;color:var(--blue);font-weight:700">+${matches.length-2}더</div>`:''}
          </td>`;
          day++;
        }
      }
      cells+=`<tr>${rowHTML}</tr>`;
      if(day>lastDate)break;
    }
    calHTML=`
      <table style="width:100%;border-collapse:collapse;table-layout:fixed">
        <thead><tr>${weeks.map((w,i)=>`<th style="padding:8px;font-size:11px;color:${i===0?'var(--red)':i===6?'var(--blue)':'var(--gray-l)'};font-weight:700">${w}</th>`).join('')}</tr></thead>
        <tbody>${cells}</tbody>
      </table>`;

  } else if(calView==='week'){
    // 주간뷰에 이전/다음 주 네비
    const ws=new Date(weekStart);
    const we=new Date(weekStart);we.setDate(we.getDate()+6);
    const wsStr=`${ws.getMonth()+1}/${ws.getDate()}`;
    const weStr=`${we.getMonth()+1}/${we.getDate()}`;
    navHTML=`
      <button class="btn btn-w btn-sm" onclick="calWeekOffset--;render()">◀ 이전 주</button>
      <span style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:15px;min-width:130px;text-align:center">${wsStr} ~ ${weStr}</span>
      <button class="btn btn-w btn-sm" onclick="calWeekOffset++;render()">다음 주 ▶</button>
      <button class="btn btn-w btn-sm" onclick="calWeekOffset=0;render()">이번 주</button>`;

    let rows='';
    for(let i=0;i<7;i++){
      const d=new Date(weekStart);d.setDate(weekStart.getDate()+i);
      const ds=dateStr(d.getFullYear(),d.getMonth(),d.getDate());
      const matches=dateMatchMap[ds]||[];
      const isToday=ds===todayStr;
      rows+=`<div style="display:flex;gap:12px;padding:10px 14px;background:${isToday?'var(--blue-l)':'var(--white)'};border:1px solid ${isToday?'var(--blue)':'var(--border)'};border-radius:8px;margin-bottom:6px;align-items:flex-start;cursor:${matches.length?'pointer':'default'}"
        ${matches.length?`onclick="calDayDate='${ds}';calView='day';render()"`:''}>
        <div style="min-width:48px;text-align:center">
          <div style="font-size:10px;color:${i===0?'var(--red)':i===6?'var(--blue)':'var(--gray-l)'};font-weight:700">${weeks[i]}</div>
          <div style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:20px;color:${isToday?'var(--blue)':'var(--text)'}">${d.getDate()}</div>
        </div>
        <div style="flex:1">
          ${matches.length===0
            ?`<span style="color:var(--gray-l);font-size:12px">경기 없음</span>`
            :matches.map(m=>{
              const isCKorPro=ckM.includes(m)||proM.includes(m);
              const tA=getTeamA(m);const tB=getTeamB(m);
              const ca=isCKorPro?'#2563eb':gc(m.a||'');const cb=isCKorPro?'#dc2626':gc(m.b||'');
              const aWin=(m.sa??-1)>(m.sb??-1);const bWin=(m.sb??-1)>(m.sa??-1);
              const hasResult=(m.sa!=null&&m.sa!=='');
              return `<div style="font-size:11px;font-weight:600;padding:4px 8px;background:#f0f6ff;border:1px solid var(--blue-ll);border-radius:5px;margin-bottom:3px;display:flex;align-items:center;gap:6px">
                <span style="color:var(--blue);font-size:10px">${matchLabel(m).split(' ')[0]}</span>
                <span style="font-weight:700;color:${aWin&&hasResult?ca:'var(--text)'}">${tA}</span>
                ${hasResult?`<span style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:13px">${m.sa}:<span>${m.sb}</span></span>`:`<span style="color:var(--gray-l)">vs</span>`}
                <span style="font-weight:700;color:${bWin&&hasResult?cb:'var(--text)'}">${tB}</span>
                ${hasResult?(aWin?`<span style="font-size:10px;color:${ca};font-weight:800">▶ ${tA} 승</span>`:bWin?`<span style="font-size:10px;color:${cb};font-weight:800">▶ ${tB} 승</span>`:'<span style="font-size:10px;color:var(--gray-l)">무</span>'):''}
              </div>`;
            }).join('')
          }
        </div>
      </div>`;
    }
    calHTML=rows;

  } else if(calView==='day'){
    // 일간뷰
    const d=new Date(calDayDate);
    const prevD=new Date(d);prevD.setDate(d.getDate()-1);
    const nextD=new Date(d);nextD.setDate(d.getDate()+1);
    const fmtDayStr=(dt)=>dateStr(dt.getFullYear(),dt.getMonth(),dt.getDate());
    navHTML=`
      <button class="btn btn-w btn-sm" onclick="calDayDate='${fmtDayStr(prevD)}';render()">◀ 전날</button>
      <span style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:16px;min-width:130px;text-align:center">${calDayDate}</span>
      <button class="btn btn-w btn-sm" onclick="calDayDate='${fmtDayStr(nextD)}';render()">다음날 ▶</button>
      <button class="btn btn-w btn-sm" onclick="calDayDate='${todayStr}';render()">오늘</button>`;

    const matches=dateMatchMap[calDayDate]||[];
    if(!matches.length){
      calHTML=`<div style="padding:40px;text-align:center;color:var(--gray-l)">이 날 경기가 없습니다.</div>`;
    } else {
      calHTML=matches.map((m,mi)=>{
        const isCKorPro=ckM.includes(m)||proM.includes(m);
        const tA=getTeamA(m);const tB=getTeamB(m);
        const ca=isCKorPro?'#2563eb':gc(m.a||'');const cb=isCKorPro?'#dc2626':gc(m.b||'');
        const aWin=(m.sa??-1)>(m.sb??-1);const bWin=(m.sb??-1)>(m.sa??-1);
        const hasResult=(m.sa!=null&&m.sa!=='');
        const typeLabel=miniM.includes(m)?'⚡ 미니대전':univM.includes(m)?'🏟️ 대학대전':ckM.includes(m)?'🤝 대학CK':proM.includes(m)?'🏅 프로리그':'🎖️ 대회';
        const detKey=`calday-${calDayDate}-${mi}`;
        const detHTML=buildDetailHTML(m,miniM.includes(m)?'mini':univM.includes(m)?'univm':ckM.includes(m)?'ck':proM.includes(m)?'pro':'comp',
          tA,tB,ca,cb,aWin,bWin);
        return `<div style="background:var(--white);border:1px solid var(--border);border-radius:10px;margin-bottom:10px;overflow:hidden">
          <div style="padding:12px 16px;display:flex;align-items:center;gap:10px;flex-wrap:wrap;background:var(--surface);border-bottom:1px solid var(--border)">
            <span style="font-size:11px;font-weight:700;color:var(--blue)">${typeLabel}</span>
            <span class="ubadge${aWin&&hasResult?'':hasResult?' loser':''}" style="background:${ca}">${tA}</span>
            ${hasResult?`<div style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:20px"><span class="${aWin?'wt':bWin?'lt':'pt-z'}">${m.sa}</span><span style="color:var(--gray-l);font-size:14px"> : </span><span class="${bWin?'wt':aWin?'lt':'pt-z'}">${m.sb}</span></div>`:`<span style="color:var(--gray-l);font-weight:700">vs</span>`}
            <span class="ubadge${bWin&&hasResult?'':hasResult?' loser':''}" style="background:${cb}">${tB}</span>
            ${hasResult?(aWin?`<span style="font-size:12px;font-weight:800;color:${ca}">▶ ${tA} 승</span>`:bWin?`<span style="font-size:12px;font-weight:800;color:${cb}">▶ ${tB} 승</span>`:'<span style="color:var(--gray-l)">무승부</span>'):'<span style="font-size:11px;color:var(--gray-l)">결과 미입력</span>'}
            <div style="margin-left:auto;display:flex;gap:4px;align-items:center" class="no-export">
            <button id="detbtn-${detKey}" class="btn-detail" onclick="toggleDetail('${detKey}')">▼ 상세 보기</button>
            <button class="btn btn-p btn-xs" onclick="openRCalMatchShareCard('${calDayDate}',${mi})">🎴 공유 카드</button>
          </div>
          </div>
          <div id="det-${detKey}" class="rec-detail-area" style="padding:12px 16px">
            ${detHTML}
            ${hasResult?`<div style="margin-top:8px;padding-top:8px;border-top:1px solid var(--border);display:flex;gap:6px" class="no-export">
              <button class="btn-capture btn-xs" onclick="captureDetail('det-${detKey}','${calDayDate}_match')">📷 이미지 저장</button>
              <button class="btn btn-p btn-xs" onclick="openRCalMatchShareCard('${calDayDate}',${mi})">🎴 공유 카드</button>
            </div>`:''}
          </div>
        </div>`;
      }).join('');
    }
  }

  C.innerHTML=`
  <div>
    <!-- 컨트롤 바 -->
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:16px;flex-wrap:wrap">
      ${navHTML}
      <div style="margin-left:auto;display:flex;gap:4px">
        <button class="btn btn-sm ${calView==='month'?'btn-b':'btn-w'}" onclick="calView='month';render()">월간</button>
        <button class="btn btn-sm ${calView==='week'?'btn-b':'btn-w'}" onclick="calWeekOffset=0;calView='week';render()">주간</button>
        <button class="btn btn-sm ${calView==='day'?'btn-b':'btn-w'}" onclick="calDayDate='${todayStr}';calView='day';render()">일간</button>
      </div>
    </div>
    <!-- 캘린더 본문 -->
    <div style="background:var(--white);border:1px solid var(--border);border-radius:10px;padding:12px;overflow-x:auto">
      ${calHTML}
    </div>
    <!-- 선택 날짜 경기 목록 (월간뷰용) -->
    <div id="calDayDetail" style="margin-top:14px"></div>
  </div>`;
}

let _calActiveDay='';
let _calDetailState={}; // 캘린더 전용 상세 열림 상태

function calToggleDetail(key){
  const area=document.getElementById('det-'+key);
  const btn=document.getElementById('detbtn-'+key);
  if(!area)return;
  _calDetailState[key]=!_calDetailState[key];
  const isOpen=!!_calDetailState[key];
  area.style.display=isOpen?'block':'none';
  if(btn){btn.classList.toggle('open',isOpen);btn.textContent=isOpen?'▲ 닫기':'▼ 상세';}
}

function calShowDay(ds){
  const el=document.getElementById('calDayDetail');
  if(!el)return;
  // 같은 날짜 다시 클릭 → 닫기
  if(_calActiveDay===ds){
    _calActiveDay='';
    _calDetailState={};
    el.style.animation='';
    el.innerHTML='';
    render();
    return;
  }
  _calActiveDay=ds;
  _calDetailState={}; // 날짜 변경 시 상세 상태 초기화
  const allMatches=[...miniM,...univM,...comps,...ckM,...proM,...(typeof getTourneyMatches==='function'?getTourneyMatches():[])];
  const matches=allMatches.filter(m=>m.d===ds);
  // 공유카드용 캐시 - 날짜별 매치 배열 저장
  if(!window._calDayCache)window._calDayCache={};
  window._calDayCache[ds]=matches;

  function buildMatchRow(m,mi){
    if(m.sa==null||m.sa==='') return ''; // 미입력 항목 제외
    const isCKorPro=ckM.includes(m)||proM.includes(m);
    const tA=isCKorPro?'A팀':(m.a||'');
    const tB=isCKorPro?'B팀':(m.b||'');
    const ca=isCKorPro?'#2563eb':gc(m.a||'');
    const cb=isCKorPro?'#dc2626':gc(m.b||'');
    const aWin=(m.sa??-1)>(m.sb??-1);const bWin=(m.sb??-1)>(m.sa??-1);
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
      +'<div class="rec-sum-score score-click" onclick="event.stopPropagation();calToggleDetail(\''+detKey+'\')" title="클릭하여 상세 보기/닫기">'
      +'<span class="'+(aWin?'wt':bWin?'lt':'pt-z')+'">'+m.sa+'</span>'
      +'<span style="color:var(--gray-l);font-size:14px"> : </span>'
      +'<span class="'+(bWin?'wt':aWin?'lt':'pt-z')+'">'+m.sb+'</span>'
      +'</div>'
      +'<span class="ubadge'+(bWin?'':' loser')+'" style="background:'+cb+'">'+tB+'</span>'
      +'<span style="font-size:12px;font-weight:700;color:'+winColor+'">'+winLabel+'</span>'
      +'</div>'
      +'<div class="no-export" style="margin-left:auto;display:flex;gap:4px;align-items:center">'
      +'<button id="detbtn-'+detKey+'" class="btn-detail" onclick="event.stopPropagation();calToggleDetail(\''+detKey+'\')">▼ 상세</button>'
      +'</div>'
      +'</div>'
      +'<div id="det-'+detKey+'" style="display:none;padding:10px 14px;background:var(--surface);border-top:1px solid var(--border)">'
      +detHTML
      +'<div style="margin-top:8px;padding-top:8px;border-top:1px solid var(--border)">'
      +'<button class="btn-capture btn-xs no-export" onclick="captureDetail(\'det-'+detKey+'\',\''+ds+'_match\')">📷 이미지 저장</button>'
      +' <button class="btn btn-p btn-xs no-export" onclick="openCalMatchShareCardByCache(\''+ds+'\','+mi+');event.stopPropagation()">🎴 공유 카드</button>'
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
    +'<button class="btn btn-w btn-sm" onclick="captureDetail(&quot;calDayDetail&quot;,&quot;캘린더_&quot;+(new Date().toLocaleDateString()))" style="margin-right:4px">📷 저장</button>'+'<button class="btn btn-w btn-sm" onclick="_calActiveDay=\'\';document.getElementById(\'calDayDetail\').innerHTML=\'\'">✕ 닫기</button>'
    +'</div></div>'
    +matches.map(buildMatchRow).join('')
    +'</div>';
  // render() 제거 - 호출하면 rCal이 재실행되어 calDayDetail이 초기화됨
}


function swNav(t,el){
  document.querySelectorAll('.bnav-item').forEach(b=>b.classList.remove('on'));
  if(el) el.classList.add('on');
  // 탭 전환 시 서브탭 상태 초기화
  if(t==='comp'){compSub='league';leagueFilterDate='';leagueFilterGrp='';grpRankFilter='';}
  if(t==='mini')miniSub='records';
  if(t==='univck')ckSub='records';
  if(t==='univm')univmSub='records';
  if(t==='pro')proSub='records';
  if(t==='hist')histSub='mini';
  // 탭버튼 찾아서 sw 호출 (데스크탑 탭 UI 동기화)
  let found=false;
  document.querySelectorAll('.tab').forEach(b=>{
    const oc=b.getAttribute('onclick')||'';
    if(oc.includes("'"+t+"'")){sw(t,b);found=true;}
  });
  // 탭 버튼이 없는 경우(모바일 전용 탭 등) 직접 렌더링
  if(!found){
    curTab=t;openDetails={};
    const fstrip=document.getElementById('fstrip');
    if(fstrip) fstrip.style.display=(t==='total'&&isLoggedIn)?'block':'none';
    const C=document.getElementById('rcont');
    if(C) C.innerHTML='';
    render();
  }
}
