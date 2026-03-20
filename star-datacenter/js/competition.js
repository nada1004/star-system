/* ══════════════════════════════════════
   대회 (조별리그 + 조편성 관리 + 대진표 + 개인순위)
══════════════════════════════════════ */

// 조별 순위 계산 공통 함수 (rBracketSchedule, rCompTourDynamic 공유)
function _calcGrpRank(grp){
  const st={};
  (grp.univs||[]).forEach(u=>{st[u]={w:0,l:0,sw:0,sl:0};});
  (grp.matches||[]).forEach(m=>{
    if(!m.a||!m.b||m.sa==null||m.sb==null)return;
    if(!st[m.a])st[m.a]={w:0,l:0,sw:0,sl:0};
    if(!st[m.b])st[m.b]={w:0,l:0,sw:0,sl:0};
    if(m.sa>m.sb){st[m.a].w++;st[m.b].l++;}
    else if(m.sb>m.sa){st[m.b].w++;st[m.a].l++;}
    st[m.a].sw+=m.sa;st[m.a].sl+=m.sb;
    st[m.b].sw+=m.sb;st[m.b].sl+=m.sa;
  });
  return Object.entries(st).map(([u,s])=>({u,...s})).sort((a,b)=>b.w-a.w||(b.sw-b.sl)-(a.sw-a.sl)||b.sw-a.sw);
}
let leagueFilterDate='';
let leagueFilterGrp='';
let grpRankFilter='';
let grpSub='list';
let grpEditId=null;
let grpMatchState={tnId:null,gi:null,mi:null};
let bracketMatchState={tnId:null,rnd:null,mi:null,teamA:'',teamB:''};
let bktSchedRound='전체';
let leagueSortDir='desc';
let bktSchedSortDir='desc';

function getCurrentTourney(){
  return tourneys.find(t=>t.name===curComp)||tourneys[0]||null;
}

function rComp(C,T){
  T.innerText='🎖️ 대회';
  if(!isLoggedIn && compSub==='grpedit') compSub='league';

  // tier 타입 대회가 curComp에 선택되어 있으면 초기화
  if(curComp && tourneys.find(t=>t.name===curComp&&t.type==='tier')) curComp='';
  const tn=getCurrentTourney();
  const tnType=tn?tn.type||'league':'league'; // 'league' or 'tier'

  let h=`<div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;flex-wrap:wrap;padding:12px 16px;background:var(--gold-bg);border:1px solid var(--gold-b);border-radius:10px">
    <span style="font-weight:700;color:var(--gold);white-space:nowrap">🎖️ 대회 선택:</span>
    <select style="flex:1;max-width:220px;font-weight:700" onchange="curComp=this.value;leagueFilterDate='';leagueFilterGrp='';grpRankFilter='';save();render()">
      <option value="">— 대회를 선택하세요 —</option>
      ${tourneys.filter(t=>t.type!=='tier').map(t=>`<option value="${t.name}"${curComp===t.name?' selected':''}>${t.name}</option>`).join('')}
    </select>
    ${isLoggedIn?`<button class="btn btn-b btn-xs" onclick="grpNewLeagueTourney()">+ 일반 대회</button>`:''}
    ${tn&&isLoggedIn?`<button class="btn btn-w btn-xs" onclick="grpRenameTourney()" title="대회명 수정">✏️ 이름수정</button><button class="btn btn-r btn-xs" onclick="grpDelCurTourney()" title="현재 대회 삭제">🗑️ 삭제</button>`:''}
    ${tn?`<span style="font-size:11px;color:var(--gray-l)">${tnType==='tier'?'🎯 티어대회':('🏆 '+(tn.groups||[]).length+'개 조 · '+(tn.groups||[]).reduce((s,g)=>s+(g.matches||[]).length,0)+'경기')}</span>`:''}
  </div>`;

  // 대회 타입에 따라 다른 서브메뉴
  let subOpts;
  if(tnType==='tier'){
    // 티어별 대회 전용 메뉴
    subOpts=[{id:'tiertour',lbl:'🎯 티어대회'}];
    if(compSub!=='tiertour') compSub='tiertour';
  } else {
    // 일반 대회 메뉴 (tiertour 제외)
    subOpts=[
      {id:'league',lbl:'📅 조별리그 일정'},
      {id:'grprank',lbl:'📊 조별 순위'},
      {id:'tour',lbl:'🗂️ 대진표'},
      {id:'tourschedule',lbl:'📋 토너먼트 경기 일정'},
      {id:'comprank',lbl:'🏅 개인 순위'},
      ...(isLoggedIn?[{id:'grpedit',lbl:'🏗️ 조편성 관리'}]:[]),
    ];
    if(compSub==='tiertour'||compSub==='input') compSub='league';
  }
  h+=`<div class="stabs no-export">${subOpts.map(o=>`<button class="stab ${compSub===o.id?'on':''}" onclick="compSub='${o.id}';render()">${o.lbl}</button>`).join('')}</div>`;

  if(!tn && compSub!=='grpedit'){
    h+=`<div style="padding:60px 20px;text-align:center;background:var(--surface);border-radius:12px;border:2px dashed var(--border2)">
      <div style="font-size:44px;margin-bottom:14px">🏆</div>
      <div style="font-size:16px;font-weight:700;margin-bottom:8px">등록된 대회가 없습니다</div>
      <div style="color:var(--gray-l);margin-bottom:20px">새 대회를 만들어 조편성을 시작하세요.</div>
      ${isLoggedIn?`<button class="btn btn-b" onclick="grpNewLeagueTourney()">+ 일반 대회 만들기</button>`:''}
    </div>`;
    C.innerHTML=h; return;
  }

  if(compSub==='league') h+=rCompLeague(tn);
  else if(compSub==='grprank') h+=rCompGrpRankFull(tn);
  else if(compSub==='tour') h+=tn?rCompTourDynamic(tn):'';
  else if(compSub==='tourschedule') h+=tn?rBracketSchedule(tn):'';
  else if(compSub==='comprank') h+=rCompPlayerRank(tn);
  else if(compSub==='grpedit'){
    // 현재 선택된 대회가 있으면 바로 그 대회 편집 화면으로 이동
    if(tn){grpEditId=tn.id;grpSub='edit';}
    h+=rCompGrpEdit();
  }
  else if(compSub==='tiertour') h+=rTierTour();
  C.innerHTML=h;
}

function rCompLeague(tn){
  if(!tn||!tn.groups) tn=tn?{...tn,groups:[]}:null;
  if(!tn) return `<div style="padding:30px;text-align:center;color:var(--gray-l)">대회를 선택하세요.</div>`;
  const allMatches=[];
  tn.groups.forEach((grp,gi)=>{
    const gl='ABCDEFGHIJ'[gi]||gi;
    const col=['#2563eb','#dc2626','#16a34a','#d97706','#7c3aed','#0891b2'][gi%6];
    (grp.matches||[]).forEach((m,mi)=>{
      allMatches.push({...m,grpName:grp.name,grpIdx:gi,grpLetter:gl,matchNum:mi+1,grpColor:col});
    });
  });
  allMatches.sort((a,b)=>leagueSortDir==='asc'?(a.d||'9999').localeCompare(b.d||'9999'):(b.d||'').localeCompare(a.d||''));
  const dates=[...new Set(allMatches.map(m=>m.d).filter(Boolean))].sort();
  const _totalM=allMatches.length, _doneM=allMatches.filter(m=>m.sa!=null&&m.sb!=null).length;
  const _pct=_totalM?Math.round(_doneM/_totalM*100):0;
  const _pctColor=_pct===100?'#16a34a':_pct>=50?'#2563eb':'#d97706';
  let h=``;
  if(_totalM>0){
    h+=`<div style="margin-bottom:12px;padding:10px 14px;background:var(--surface);border-radius:10px;border:1px solid var(--border)">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
        <span style="font-size:12px;font-weight:700;color:${_pctColor}">📊 진행률</span>
        <span style="font-size:12px;color:var(--gray-l)">${_doneM}/${_totalM}경기 완료</span>
        <span style="margin-left:auto;font-size:13px;font-weight:800;color:${_pctColor}">${_pct}%</span>
      </div>
      <div style="height:8px;background:var(--border);border-radius:4px;overflow:hidden">
        <div style="height:100%;width:${_pct}%;background:${_pctColor};border-radius:4px;transition:.3s"></div>
      </div>
    </div>`;
  }
  h+=`<div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;flex-wrap:wrap">
    <div style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:15px;color:var(--blue)">🏆 ${tn.name}</div>
    <div style="margin-left:auto;display:flex;gap:4px">
      <button class="pill ${leagueSortDir==='desc'?'on':''}" onclick="leagueSortDir='desc';render()">최신순</button>
      <button class="pill ${leagueSortDir==='asc'?'on':''}" onclick="leagueSortDir='asc';render()">오래된순</button>
    </div>
  </div>`;
  if(isLoggedIn&&tn.groups.length){
    h+=`<div class="no-export" style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px;align-items:center">
      <button class="btn btn-p btn-sm" onclick="openCompAutoDetectPaste('${tn.id}')" title="선수 소속 대학을 자동으로 인식해 해당 조 경기에 저장">📋 붙여넣기 일괄 입력</button>
      <span style="font-size:11px;font-weight:700;color:var(--gray-l);margin-left:4px">경기 추가:</span>`;
    tn.groups.forEach((grp,gi)=>{
      const gl='ABCDEFGHIJ'[gi];
      const col=['#2563eb','#dc2626','#16a34a','#d97706','#7c3aed','#0891b2'][gi%6];
      h+=`<button class="btn btn-xs" style="background:${col};color:#fff;border-color:${col}" onclick="grpAddMatch('${tn.id}',${gi})">+ ${gl}조</button>`;
    });
    h+=`</div>`;
  }
  h+=`<div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:10px;padding-bottom:10px;border-bottom:2px solid var(--border)">
    <button class="pill ${!leagueFilterDate?'on':''}" onclick="leagueFilterDate='';render()">전체</button>`;
  dates.forEach(d=>{
    const dt=new Date(d+'T00:00:00');const days=['일','월','화','수','목','금','토'];
    h+=`<button class="pill ${leagueFilterDate===d?'on':''}" onclick="leagueFilterDate='${d}';render()">${dt.getMonth()+1}/${dt.getDate()}(${days[dt.getDay()]})</button>`;
  });
  h+=`</div>`;
  if(tn.groups.length>1){
    h+=`<div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:12px;align-items:center"><span style="font-size:11px;font-weight:700;color:var(--gray-l)">조:</span>
      <button class="pill ${!leagueFilterGrp?'on':''}" onclick="leagueFilterGrp='';render()">전체</button>`;
    tn.groups.forEach((grp,gi)=>{
      const gl='ABCDEFGHIJ'[gi];const col=['#2563eb','#dc2626','#16a34a','#d97706','#7c3aed','#0891b2'][gi%6];
      h+=`<button class="pill ${leagueFilterGrp===grp.name?'on':''}" style="${leagueFilterGrp===grp.name?`background:${col};border-color:${col};color:#fff`:''}" onclick="leagueFilterGrp='${grp.name}';render()">GROUP ${gl}</button>`;
    });
    h+=`</div>`;
  }
  let filtered=allMatches;
  if(leagueFilterDate) filtered=filtered.filter(m=>m.d===leagueFilterDate);
  if(leagueFilterGrp) filtered=filtered.filter(m=>m.grpName===leagueFilterGrp);
  if(!filtered.length){
    h+=`<div style="padding:40px;text-align:center;color:var(--gray-l);background:var(--surface);border-radius:10px">
      ${allMatches.length?'해당 조건의 경기가 없습니다.':'아직 등록된 경기가 없습니다.'}
      ${isLoggedIn?`<br><br><button class="btn btn-b btn-sm" onclick="compSub='grpedit';render()">+ 조편성 관리에서 경기 추가</button>`:''}
    </div>`;
    return h;
  }
  const byDate={};
  filtered.forEach(m=>{const k=m.d||'날짜 미정';if(!byDate[k])byDate[k]=[];byDate[k].push(m);});
  Object.keys(byDate).sort((a,b)=>leagueSortDir==='asc'?a.localeCompare(b):b.localeCompare(a)).forEach(date=>{
    let dateLabel=date;
    if(date!=='날짜 미정'){
      const dt=new Date(date+'T00:00:00');
      const days=['일요일','월요일','화요일','수요일','목요일','금요일','토요일'];
      dateLabel=`${dt.getFullYear()}년 ${dt.getMonth()+1}월 ${dt.getDate()}일 ${days[dt.getDay()]}`;
    }
    h+=`<div style="margin-bottom:22px">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">
        <div style="flex:1;font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:13px;color:#1e3a8a;padding:8px 16px;background:linear-gradient(90deg,#1e3a8a10,transparent);border-left:4px solid #2563eb;border-radius:0 8px 8px 0">📅 ${dateLabel}</div>
        ${isLoggedIn?`<button class="btn btn-b btn-xs no-export" onclick="grpAddMatchByDate('${tn.id}','${date}')">+ 경기 추가</button>`:''}
      </div>`;
    byDate[date].forEach(m=>{
      const ca=gc(m.a||'');const cb=gc(m.b||'');
      const isDone=m.sa!=null&&m.sb!=null;
      const aWin=isDone&&m.sa>m.sb;const bWin=isDone&&m.sb>m.sa;
      const detId=`ld-${m.grpIdx}-${m.matchNum-1}`;
      const hasDetail=isDone&&m.sets&&m.sets.some(s=>(s.games||[]).some(g=>g.playerA||g.playerB));
      h+=`<div class="grp-match-card" style="background:linear-gradient(135deg,var(--white) 0%,var(--blue-l) 100%);border:1.5px solid ${m.grpColor}22;border-left:4px solid ${m.grpColor};box-shadow:0 2px 12px rgba(0,0,0,.06);">
        <div style="display:flex;flex-direction:column;align-items:center;gap:3px;min-width:72px">
          <span class="grp-badge" style="background:linear-gradient(135deg,${m.grpColor},${m.grpColor}cc);font-size:10px;letter-spacing:.5px;box-shadow:0 2px 6px ${m.grpColor}55">GROUP ${m.grpLetter}</span>
          <span style="font-size:10px;color:var(--gray-l);font-weight:600">${m.matchNum}경기</span>
          ${!isDone?`<span style="background:var(--surface);color:var(--gray-l);font-size:10px;padding:2px 8px;border-radius:10px;border:1px solid var(--border)">예정</span>`:''}
        </div>
        <div style="flex:1;display:flex;align-items:center;gap:10px;justify-content:center;flex-wrap:wrap">
          <div style="text-align:center;min-width:100px">
            <div style="display:flex;align-items:center;justify-content:center;gap:7px;background:${ca||'#888'};padding:10px 16px;border-radius:12px;cursor:pointer;transition:.15s;${aWin?'box-shadow:0 0 0 3px #fff,0 0 0 5px '+ca+',0 6px 18px '+ca+'66':isDone?'opacity:.5;filter:saturate(0.6)':''}" onclick="openUnivModal('${m.a||''}')">
              ${(()=>{const url=UNIV_ICONS[m.a]||(univCfg.find(x=>x.name===m.a)||{}).icon||'';return url?`<img src="${url}" style="width:36px;height:36px;object-fit:contain;border-radius:5px;flex-shrink:0" onerror="this.style.display='none'">`:`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white' width='24' height='24'><path d='M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z'/></svg>`;})()}
              <span style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:14px;color:#fff">${m.a||'—'}</span>
            </div>
          </div>
          <div style="text-align:center;min-width:80px">
            ${isDone?`<div class="grp-match-score score-click" style="cursor:pointer;padding:6px 14px;background:var(--white);border-radius:12px;border:1.5px solid var(--border);box-shadow:0 2px 8px rgba(0,0,0,.08)" onclick="leagueToggleDet('${detId}',document.getElementById('detbtn-${detId}'))"><span style="color:${aWin?'#16a34a':bWin?'#dc2626':'var(--text)'}">${m.sa}</span><span style="color:var(--gray-l);font-size:14px;margin:0 3px">:</span><span style="color:${bWin?'#16a34a':aWin?'#dc2626':'var(--text)'}">${m.sb}</span></div>
            <div style="display:flex;align-items:center;justify-content:center;gap:4px;margin-top:5px">${(()=>{const winTeam=aWin?m.a:bWin?m.b:'';if(!winTeam)return '<span style="font-size:10px;color:var(--gray-l)">무승부</span>';const url=UNIV_ICONS[winTeam]||(univCfg.find(x=>x.name===winTeam)||{}).icon||'';return url?`<img src="${url}" style="width:18px;height:18px;object-fit:contain;border-radius:3px" onerror="this.style.display='none'"><span style="font-size:10px;font-weight:700;color:${aWin?ca:cb}">${winTeam} 승</span>`:`<span style="font-size:10px;font-weight:700;color:${aWin?ca:cb}">${winTeam} 승</span>`;})()}</div>
            ${isDone?`<div style="display:flex;gap:3px;justify-content:center;margin-top:4px"><button id="detbtn-${detId}" class="btn-detail" style="font-size:10px" onclick="leagueToggleDet('${detId}',this)">📂 상세</button><button class="btn btn-p" style="font-size:10px;padding:3px 7px;border-radius:7px" onclick="openCompMatchShareCard('${tn.id}',${m.grpIdx},${m.matchNum-1})">🎴</button></div>`:''}
            `:`<div style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:22px;color:${m.grpColor};text-shadow:0 1px 8px ${m.grpColor}44">VS</div>`}
          </div>
          <div style="text-align:center;min-width:100px">
            <div style="display:flex;align-items:center;justify-content:center;gap:7px;background:${cb||'#888'};padding:10px 16px;border-radius:12px;cursor:pointer;transition:.15s;${bWin?'box-shadow:0 0 0 3px #fff,0 0 0 5px '+cb+',0 6px 18px '+cb+'66':isDone?'opacity:.5;filter:saturate(0.6)':''}" onclick="openUnivModal('${m.b||''}')">
              ${(()=>{const url=UNIV_ICONS[m.b]||(univCfg.find(x=>x.name===m.b)||{}).icon||'';return url?`<img src="${url}" style="width:36px;height:36px;object-fit:contain;border-radius:5px;flex-shrink:0" onerror="this.style.display='none'">`:`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white' width='24' height='24'><path d='M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z'/></svg>`;})()}
              <span style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:14px;color:#fff">${m.b||'—'}</span>
            </div>
          </div>
        </div>
        ${isLoggedIn?`<div class="no-export" style="display:flex;flex-direction:column;gap:4px">
          <button class="btn btn-b btn-xs" style="white-space:nowrap" onclick="leagueEditMatch('${tn.id}',${m.grpIdx},${m.matchNum-1})">✏️ 결과</button>
          <button class="btn btn-r btn-xs" onclick="grpDelMatch('${tn.id}',${m.grpIdx},${m.matchNum-1})">🗑️ 삭제</button>
        </div>`:''}
      </div>
      <div id="${detId}" style="display:none;margin-top:-4px;margin-bottom:8px;padding:14px 16px;background:var(--surface);border-radius:0 0 10px 10px;border:1px solid var(--border);border-top:none">
        ${isDone?buildDetailHTML(m,'comp',m.a||'A팀',m.b||'B팀',ca,cb,aWin,bWin):'<div style="font-size:12px;color:var(--gray-l)">아직 경기가 진행되지 않았습니다.</div>'}
      </div>`;
    });
    h+=`</div>`;
  });
  return h;
}

function leagueToggleDet(id,btn){
  const el=document.getElementById(id);if(!el)return;
  const open=el.style.display==='none'||!el.style.display;
  el.style.display=open?'block':'none';
  const detBtn=btn||document.getElementById('detbtn-'+id);
  if(detBtn){detBtn.textContent=open?'🔼 닫기':'📂 상세';detBtn.classList.toggle('open',open);}
}

function leagueEditMatch(tnId,gi,mi){
  grpMatchState={tnId,gi,mi};
  const tn=tourneys.find(t=>t.id===tnId);
  if(tn)grpOpenMatchModal(tn,gi,mi);
}
function openLeaguePaste(tnId,gi,mi){
  grpMatchState={tnId,gi,mi};
  const tn=tourneys.find(t=>t.id===tnId);if(!tn)return;
  const m=tn.groups[gi].matches[mi];if(!m)return;
  if(!m.sets)m.sets=[];
  openGrpPasteModal();
}
// 상단 버튼: 조/팀 자동인식 모드
function openCompAutoDetectPaste(tnId){
  grpMatchState={tnId,gi:null,mi:null};
  openGrpPasteModal();
}

function grpMatchDetail(m){
  if(!m.sets||!m.sets.length) return `<div style="font-size:12px;color:var(--gray-l)">상세 기록이 없습니다.</div>`;
  let h=`<div style="font-size:12px;font-weight:700;color:var(--text2);margin-bottom:8px">🔍 세부 경기 기록</div>`;
  m.sets.forEach((set,si)=>{
    const lbl=si===2?'🎯 에이스전':`${si+1}세트`;
    const sA=set.scoreA||0;const sB=set.scoreB||0;
    h+=`<div style="margin-bottom:10px">
      <div style="display:flex;align-items:center;gap:8px;padding:5px 10px;background:${si===2?'#f5f3ff':'var(--blue-l)'};border-radius:6px;margin-bottom:6px">
        <strong style="font-size:11px;color:${si===2?'#7c3aed':'var(--blue)'}">${lbl}</strong>
        <span style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:14px"><span class="${sA>sB?'wt':''}">${sA}</span><span style="color:var(--gray-l)">:</span><span class="${sB>sA?'wt':''}">${sB}</span></span>
        <span style="font-size:11px;font-weight:700;color:${sA>sB?'var(--green)':sB>sA?'var(--red)':'var(--gray-l)'}">${sA>sB?(m.a||'A팀')+' 승':sB>sA?(m.b||'B팀')+' 승':'무승부'}</span>
      </div>
      <div style="display:flex;flex-wrap:wrap;gap:5px">`;
    (set.games||[]).forEach((g,gi)=>{
      if(!g.playerA&&!g.playerB)return;
      const pa=players.find(p=>p.name===g.playerA);const pb=players.find(p=>p.name===g.playerB);
      const wA=g.winner==='A';const wB=g.winner==='B';
      const _ct=t=>t?t.replace(/티어$/,''):'';
      const _tb=tier=>tier?`<span style="background:${_TIER_BG[tier]||'#64748b'};color:${_TIER_TEXT[tier]||'#fff'};font-size:9px;font-weight:700;padding:1px 4px;border-radius:3px;flex-shrink:0"><span class="tier-pc">${tier}</span><span class="tier-mob">${_ct(tier)}</span></span>`:'';
      h+=`<div style="font-size:11px;background:var(--white);padding:5px 10px;border-radius:6px;border:1px solid ${wA?'var(--green)33':wB?'var(--red)33':'var(--border)'};display:flex;align-items:center;gap:4px">
        <span style="font-size:10px;color:var(--gray-l);min-width:14px;flex-shrink:0">${gi+1}</span>
        <span style="font-weight:${wA?'800':'400'};color:${wA?'var(--green)':'var(--text)'};white-space:nowrap">${g.playerA||'?'}</span>
        ${pa?`<span class="rbadge r${pa.race}" style="font-size:9px;padding:0 3px">${pa.race||''}</span>`:''}
        ${_tb(pa?.tier)}
        <span style="color:var(--gray-l);font-size:10px;flex-shrink:0">vs</span>
        <span style="font-weight:${wB?'800':'400'};color:${wB?'var(--green)':'var(--text)'};white-space:nowrap">${g.playerB||'?'}</span>
        ${pb?`<span class="rbadge r${pb.race}" style="font-size:9px;padding:0 3px">${pb.race||''}</span>`:''}
        ${_tb(pb?.tier)}
        ${g.map?`<span style="color:var(--gray-l);font-size:10px;margin-left:2px;flex-shrink:0">📍${g.map}</span>`:''}
      </div>`;
    });
    h+=`</div></div>`;
  });
  return h;
}

function rCompGrpRankFull(tn){
  if(!tn) return `<div style="padding:30px;text-align:center;color:var(--gray-l)">대회를 선택하세요.</div>`;
  const GL='ABCDEFGHIJ';
  let h=`<div style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:15px;color:var(--blue);margin-bottom:4px">📊 ${tn.name} — 조별 순위</div>
  <div style="font-size:11px;color:var(--gray-l);margin-bottom:14px">승점 → 세트 득실 → 득점 순 · 상위 2팀 토너먼트 진출</div>`;
  if(tn.groups.length>1){
    h+=`<div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:14px">
      <button class="pill ${!grpRankFilter?'on':''}" onclick="grpRankFilter='';render()">전체</button>`;
    tn.groups.forEach((grp,gi)=>{
      const gl=GL[gi];const col=['#2563eb','#dc2626','#16a34a','#d97706','#7c3aed','#0891b2'][gi%6];
      h+=`<button class="pill ${grpRankFilter===grp.name?'on':''}" style="${grpRankFilter===grp.name?`background:${col};border-color:${col};color:#fff`:''}" onclick="grpRankFilter='${grp.name}';render()">GROUP ${gl}</button>`;
    });
    h+=`</div>`;
  }
  const targetGroups=grpRankFilter?tn.groups.filter(g=>g.name===grpRankFilter):tn.groups;
  targetGroups.forEach(grp=>{
    const gi=tn.groups.indexOf(grp);const gl=GL[gi]||gi;
    const col=['#2563eb','#dc2626','#16a34a','#d97706','#7c3aed','#0891b2'][gi%6];
    const sc={};
    grp.univs.forEach(u=>{sc[u]={w:0,l:0,gw:0,gl2:0,pts:0,played:0};});
    (grp.matches||[]).forEach(m=>{
      if(m.sa==null||m.sb==null)return;
      if(!sc[m.a])sc[m.a]={w:0,l:0,gw:0,gl2:0,pts:0,played:0};
      if(!sc[m.b])sc[m.b]={w:0,l:0,gw:0,gl2:0,pts:0,played:0};
      sc[m.a].played++;sc[m.b].played++;
      sc[m.a].gw+=m.sa;sc[m.a].gl2+=m.sb;sc[m.b].gw+=m.sb;sc[m.b].gl2+=m.sa;
      if(m.sa>m.sb){sc[m.a].w++;sc[m.a].pts+=3;sc[m.b].l++;}
      else if(m.sb>m.sa){sc[m.b].w++;sc[m.b].pts+=3;sc[m.a].l++;}
      else{sc[m.a].pts++;sc[m.b].pts++;}
    });
    const sorted=Object.entries(sc).sort((a,b)=>b[1].pts-a[1].pts||(b[1].gw-b[1].gl2)-(a[1].gw-a[1].gl2)||b[1].gw-a[1].gw);
    const played=grp.matches.filter(m=>m.sa!=null).length;
    h+=`<div style="background:var(--white);border:1.5px solid var(--border);border-radius:12px;padding:16px;margin-bottom:16px;box-shadow:0 2px 8px rgba(0,0,0,.04)">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;flex-wrap:wrap">
        <span style="background:${col};color:#fff;font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:13px;padding:3px 14px;border-radius:20px">GROUP ${gl}</span>
        <span style="font-size:11px;color:var(--gray-l)">${played}/${grp.matches.length}경기 완료</span>
        <div style="margin-left:auto;display:flex;gap:5px;flex-wrap:wrap">${grp.univs.map(u=>`<span class="ubadge" style="background:${gc(u)};font-size:11px">${gUI(u,'10px')}${u}</span>`).join('')}</div>
      </div>
      <table class="grp-rank-table"><thead><tr><th>순위</th><th>대학</th><th>경기</th><th>승</th><th>패</th><th>득</th><th>실</th><th>득실</th><th>승점</th></tr></thead><tbody>`;
    sorted.forEach(([name,s],i)=>{
      const uc=gc(name);const diff=s.gw-s.gl2;const isTop=i<2;
      const rowClass=i===0?'grp-rank-top1':i===1?'grp-rank-top2':'';
      h+=`<tr class="${rowClass}">
        <td>${i===0?`<span class="rk1">1위</span>`:i===1?`<span class="rk2">2위</span>`:i===2?`<span class="rk3">3위</span>`:`${i+1}위`}</td>
        <td><span class="ubadge clickable-univ" style="background:${uc};font-size:11px" onclick="openUnivModal('${name}')">${name}</span></td>
        <td style="color:var(--gray-l)">${s.played}</td><td class="wt">${s.w}</td><td class="lt">${s.l}</td>
        <td class="wt">${s.gw}</td><td class="lt">${s.gl2}</td>
        <td style="font-weight:700;color:${diff>0?'var(--green)':diff<0?'var(--red)':'var(--gray-l)'}">${diff>=0?'+':''}${diff}</td>
        <td style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:15px;color:${col}">${s.pts}</td>
      </tr>`;
    });
    h+=`</tbody></table>`;
    if(played===0) h+=`<div style="font-size:12px;color:var(--gray-l);padding:10px 0;text-align:center">⏳ 아직 진행된 경기가 없습니다</div>`;
    h+=`</div>`;
  });
  return h;
}

/* ── 토너먼트 경기 일정 (브라켓 아래) ── */
function rBracketSchedule(tn){
  if(!tn)return '';
  const br=getBracket(tn);
  const _grpsB=(tn.groups&&tn.groups.length>=2)?tn.groups:[];
  const _rankedB=_grpsB.map(grp=>_calcGrpRank(grp));
  const _pcB=Math.floor(_rankedB.length/2)*2;
  const _r1teamsB=[];
  for(let _i=0;_i<_pcB;_i+=2){const gA=_rankedB[_i],gB=_rankedB[_i+1];_r1teamsB.push(gA?.[0]?.u||'',gB?.[0]?.u||'',gB?.[1]?.u||'',gA?.[1]?.u||'');}
  if(_rankedB.length%2===1){const gL=_rankedB[_rankedB.length-1];_r1teamsB.push(gL?.[0]?.u||'');}
  // 총 라운드 수 계산
  const numGroups=tn.groups&&tn.groups.length>=2?tn.groups.length:0;
  const pairCount=Math.floor(numGroups/2)*2;
  let numR1=pairCount>0?pairCount:4;
  if(numGroups%2===1)numR1++;
  // totalRounds는 팀 수(=첫 라운드 경기수 × 2) 기준으로 계산 → rCompTourDynamic과 라운드 레이블 일치
  let totalRounds=0;let n=numR1*2;while(n>1){n=Math.ceil(n/2);totalRounds++;}
  if(totalRounds===0)totalRounds=1;
  const roundLabels={1:'결승',2:'준결승',3:'8강',4:'16강',5:'32강'};

  // 브라켓 경기 수집
  const rLabelToR={};
  const matches=[];
  for(let r=0;r<totalRounds;r++){
    const matchCount=Math.ceil(numR1/Math.pow(2,r));
    const rNum=totalRounds-r;
    const rLabel=roundLabels[rNum]||(rNum+'강');
    if(!rLabelToR[rLabel])rLabelToR[rLabel]={r,matchCount:Math.ceil(numR1/Math.pow(2,r))};
    for(let mi=0;mi<matchCount;mi++){
      let teamA='',teamB='';
      if(r===0){
        const bA=_r1teamsB[mi*2]||'',bB=_r1teamsB[mi*2+1]||'';
        const sA=br.slots[`0-${mi}-a`],sB=br.slots[`0-${mi}-b`];
        teamA=sA!==undefined?sA:bA;teamB=sB!==undefined?sB:bB;
      }else{
        const pA=br.winners[`${r-1}-${mi*2}`]||'',pB=br.winners[`${r-1}-${mi*2+1}`]||'';
        const sA=br.slots[`${r}-${mi}-a`],sB=br.slots[`${r}-${mi}-b`];
        teamA=sA!==undefined?sA:pA;teamB=sB!==undefined?sB:pB;
      }
      const mDetail=br.matchDetails&&br.matchDetails[`${r}-${mi}`];
      const mA=mDetail?.a||teamA;const mB=mDetail?.b||teamB;
      const isDone=mDetail&&mDetail.sa!=null;
      const winner=br.winners[`${r}-${mi}`]||'';
      if(mA||mB)matches.push({r,mi,rLabel,teamA:mA,teamB:mB,detail:mDetail,isDone,winner,isManual:false});
    }
  }
  // 수동 추가 경기
  (br.manualMatches||[]).forEach((mm,idx)=>{
    if(!mm)return;
    const isDone=mm.sa!=null;
    const winner=isDone?(mm.sa>mm.sb?mm.a:mm.sb>mm.sa?mm.b:''):'';
    matches.push({r:-1,mi:idx,rLabel:mm.rndLabel||'토너먼트 경기',teamA:mm.a||'',teamB:mm.b||'',detail:mm,isDone,winner,isManual:true});
  });

  function matchCard(mc){
    const {r,mi,rLabel,teamA,teamB,detail,isDone,winner,isManual}=mc;
    const ca=gc(teamA||'');const cb=gc(teamB||'');
    const aWin=isDone&&winner===teamA;const bWin=isDone&&winner===teamB;
    const sa=detail?.sa??'';const sb=detail?.sb??'';
    const detId=`bsched-det-${r==-1?'m'+mi:r+'-'+mi}`;
    const hasGames=detail?.sets?.some(s=>(s.games||[]).some(g=>g.playerA||g.playerB));
    const dateStr=detail?.d||'';
    return `<div style="margin-bottom:8px">
      <div class="grp-match-card" style="border-left:4px solid ${isManual?'#7c3aed':'var(--blue)'};background:linear-gradient(135deg,var(--white) 0%,${isManual?'#f5f3ff':'#eff6ff'} 100%);margin-bottom:0">
        <div style="display:flex;flex-direction:column;align-items:center;gap:3px;min-width:72px">
          <span class="grp-badge" style="background:${isManual?'#7c3aed':'var(--blue)'};font-size:10px">${rLabel}</span>
          ${dateStr?`<span style="font-size:9px;color:var(--gray-l)">${dateStr.slice(5).replace('-','/')}</span>`:''}
          ${!isDone?`<span style="background:var(--surface);color:var(--gray-l);font-size:10px;padding:2px 8px;border-radius:10px">예정</span>`:''}
        </div>
        <div style="flex:1;display:flex;align-items:center;gap:10px;justify-content:center;flex-wrap:wrap">
          <div style="text-align:center;min-width:100px">
            <div style="display:flex;align-items:center;justify-content:center;gap:7px;background:${ca||'#888'};padding:10px 16px;border-radius:12px;${aWin?'box-shadow:0 0 0 3px #fff,0 0 0 5px '+ca:isDone?'opacity:.5;filter:saturate(0.6)':''}">
              <span style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:14px;color:#fff">${teamA||'미정'}</span>
            </div>
          </div>
          <div style="text-align:center;min-width:80px">
            ${isDone?`<div style="padding:6px 14px;background:var(--white);border-radius:12px;border:1.5px solid var(--border);font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:18px"><span style="color:${aWin?'#16a34a':bWin?'#dc2626':'var(--text)'}">${sa}</span><span style="color:var(--gray-l);font-size:14px;margin:0 3px">:</span><span style="color:${bWin?'#16a34a':aWin?'#dc2626':'var(--text)'}">${sb}</span></div>
            <div style="margin-top:4px;font-size:11px;font-weight:700;color:${aWin?ca:bWin?cb:'var(--gray-l)'}">${winner?winner+' 승':''}</div>
            <button class="btn btn-p btn-xs no-export" style="margin-top:4px" onclick="openBktShareCard('${tn.id}',${r},${mi})">🎴 공유 카드</button>
            ${hasGames?`<button id="detbtn-${detId}" class="btn-detail" style="margin-top:4px;font-size:10px" onclick="bktToggleDet('${detId}',this)">📂 상세</button>`:''}
            `:`<div style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:22px;color:var(--blue)">VS</div>`}
          </div>
          <div style="text-align:center;min-width:100px">
            <div style="display:flex;align-items:center;justify-content:center;gap:7px;background:${cb||'#888'};padding:10px 16px;border-radius:12px;${bWin?'box-shadow:0 0 0 3px #fff,0 0 0 5px '+cb:isDone?'opacity:.5;filter:saturate(0.6)':''}">
              <span style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:14px;color:#fff">${teamB||'미정'}</span>
            </div>
          </div>
        </div>
        ${isLoggedIn?`<div class="no-export" style="display:flex;flex-direction:column;gap:4px">
          <button class="btn btn-b btn-xs" style="white-space:nowrap" onclick="openBracketMatchModal('${tn.id}',${r},${mi},'${teamA}','${teamB}')">✏️ 수정</button>
          ${isManual?`<button class="btn btn-r btn-xs" onclick="bktDelManualMatch('${tn.id}',${mi})">🗑️ 삭제</button>`:`<button class="btn btn-r btn-xs" onclick="bktClearMatchResult('${tn.id}',${r},${mi})">🗑️ 초기화</button>`}
        </div>`:''}
      </div>
      ${hasGames?`<div id="${detId}" style="display:none;padding:12px;background:var(--surface);border-radius:0 0 10px 10px;border:1px solid var(--border);border-top:none;margin-top:-1px">
        ${buildDetailHTML(detail,'comp',teamA||'A팀',teamB||'B팀',ca,cb,aWin,bWin)}
      </div>`:''}
    </div>`;
  }

  // 라운드 필터 버튼용 라운드 목록
  const _roundOrder=['결승','준결승','4강','8강','16강','32강'];
  const _roundSet=new Set(matches.map(m=>m.rLabel));
  const _availRounds=['전체',..._roundOrder.filter(r=>_roundSet.has(r))];
  _roundSet.forEach(r=>{if(!_roundOrder.includes(r)&&r!=='전체')_availRounds.push(r);});

  // 필터 적용
  const _filtered=bktSchedRound==='전체'?matches:matches.filter(m=>m.rLabel===bktSchedRound);
  const done=_filtered.filter(m=>m.isDone);
  const pending=_filtered.filter(m=>!m.isDone);

  // 정렬
  const _sortedDone=bktSchedSortDir==='asc'?done.slice().sort((a,b)=>(a.detail?.d||'').localeCompare(b.detail?.d||'')):done.slice().sort((a,b)=>(b.detail?.d||'').localeCompare(a.detail?.d||''));

  let h=`<div>
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;flex-wrap:wrap">
      <span style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:15px;color:var(--blue)">⚔️ 토너먼트 경기 일정</span>
      ${isLoggedIn?`<button class="btn btn-b btn-sm no-export" onclick="bktAddManualMatch('${tn.id}')">+ 경기 추가</button><button class="btn btn-p btn-sm no-export" onclick="openBktBulkPaste('${tn.id}')">📋 결과 붙여넣기</button>
<button class="btn btn-w btn-xs no-export" onclick="openBktBulkPaste('${tn.id}','16강')">16강</button>
<button class="btn btn-w btn-xs no-export" onclick="openBktBulkPaste('${tn.id}','8강')">8강</button>
<button class="btn btn-w btn-xs no-export" onclick="openBktBulkPaste('${tn.id}','4강')">4강</button>
<button class="btn btn-w btn-xs no-export" onclick="openBktBulkPaste('${tn.id}','결승')">결승</button>`:''}
      <div style="margin-left:auto;display:flex;gap:4px">
        <button class="pill ${bktSchedSortDir==='desc'?'on':''}" onclick="bktSchedSortDir='desc';render()">최신순</button>
        <button class="pill ${bktSchedSortDir==='asc'?'on':''}" onclick="bktSchedSortDir='asc';render()">오래된순</button>
      </div>
    </div>
    ${(()=>{if(_availRounds.length<=2)return '';const _pillsHtml=_availRounds.map(rv=>{const _ri=rLabelToR[rv];const _delR=_ri?_ri.r:-1;const _delC=_ri?_ri.matchCount:0;const _delBtn=isLoggedIn&&rv!=='전체'?`<button onclick="bktDelRound('${tn.id}',${_delR},${_delC},'${rv}')" style="padding:2px 5px;border-radius:4px;border:1px solid #f87171;background:#fef2f2;color:#ef4444;font-size:9px;cursor:pointer;line-height:1" title="${rv} 라운드 초기화">\u2715</button>`:'';return `<span style="display:inline-flex;align-items:center;gap:2px"><button class="pill ${bktSchedRound===rv?'on':''}" onclick="bktSchedRound='${rv}';render()">${rv}</button>${_delBtn}</span>`;}).join('');return `<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px">${_pillsHtml}</div>`;})()}
    `;

  if(!pending.filter(m=>m.teamA||m.teamB).length&&!done.length){
    h+=`<div style="padding:30px;text-align:center;color:var(--gray-l);background:var(--surface);border-radius:10px">
      ${isLoggedIn?'+ 경기 추가 버튼으로 경기를 등록하거나 브라켓에서 팀을 배정하세요.':'팀이 배정되면 경기 일정이 표시됩니다.'}
    </div>`;
  } else {
    if(pending.filter(m=>m.teamA||m.teamB).length){
      h+=`<div style="margin-bottom:16px">
        <div style="font-size:12px;font-weight:700;color:var(--gray-l);margin-bottom:8px;padding:4px 10px;background:var(--surface);border-radius:6px;display:inline-block">📅 예정 경기</div>`;
      pending.filter(m=>m.teamA||m.teamB).forEach(m=>{h+=matchCard(m);});
      h+=`</div>`;
    }
    if(_sortedDone.length){
      h+=`<div>
        `;
      _sortedDone.forEach(m=>{h+=matchCard(m);});
      h+=`</div>`;
    }
  }
  h+=`</div>`;
  return h;
}

function bktDelRound(tnId,r,matchCount,rLabel){
  const tn=tourneys.find(t=>t.id===tnId);if(!tn)return;
  if(!confirm(`'${rLabel}' 라운드 슬롯/결과를 초기화하시겠습니까?`))return;
  const br=getBracket(tn);
  if(r===-1){
    if(br.manualMatches)br.manualMatches=br.manualMatches.filter(m=>!m||(m.rndLabel||'토너먼트 경기')!==rLabel);
  } else {
    for(let mi=0;mi<matchCount;mi++){
      delete br.slots[`${r}-${mi}-a`];
      delete br.slots[`${r}-${mi}-b`];
      delete br.winners[`${r}-${mi}`];
      if(br.matchDetails)delete br.matchDetails[`${r}-${mi}`];
    }
  }
  bktSchedRound='전체';
  save();render();
}

function openBktSchedulePaste(tnId,rnd,mi,teamA,teamB){
  bracketMatchState={tnId,rnd,mi,teamA,teamB};
  const m=getBktMatch(tnId,rnd,mi);
  if(m){if(!m.a&&teamA)m.a=teamA;if(!m.b&&teamB)m.b=teamB;}
  openBktPasteModal();
}

function bktAddManualMatch(tnId){
  const tn=tourneys.find(t=>t.id===tnId);if(!tn)return;
  const br=getBracket(tn);
  if(!br.manualMatches)br.manualMatches=[];
  br.manualMatches.push({a:'',b:'',d:new Date().toISOString().slice(0,10),rndLabel:'',sa:null,sb:null,sets:[],_id:null});
  const idx=br.manualMatches.length-1;
  save();
  openBracketMatchModal(tnId,-1,idx,'','');
}

function bktDelManualMatch(tnId,idx){
  if(!confirm('경기를 삭제하시겠습니까?\n⚠️ 선수 개인 전적도 롤백됩니다.'))return;
  const tn=tourneys.find(t=>t.id===tnId);if(!tn)return;
  const br=getBracket(tn);
  if(br.manualMatches&&br.manualMatches[idx]){
    revertMatchRecord(br.manualMatches[idx]);
    br.manualMatches.splice(idx,1);
  }
  save();render();
}

function bktClearMatchResult(tnId,r,mi){
  if(!confirm('경기 결과를 초기화하시겠습니까?\n⚠️ 선수 개인 전적도 롤백됩니다.'))return;
  const tn=tourneys.find(t=>t.id===tnId);if(!tn)return;
  const br=getBracket(tn);
  const key=`${r}-${mi}`;
  if(br.matchDetails&&br.matchDetails[key]){
    revertMatchRecord(br.matchDetails[key]);
    delete br.matchDetails[key];
  }
  if(br.winners&&br.winners[key])delete br.winners[key];
  save();render();
}

function openBktBulkPaste(tnId, roundLabel){
  // 새 수동 매치 생성 후 바로 붙여넣기 모달 열기
  const tn=tourneys.find(t=>t.id===tnId);if(!tn)return;
  const br=getBracket(tn);
  if(!br.manualMatches)br.manualMatches=[];
  br.manualMatches.push({a:'',b:'',d:new Date().toISOString().slice(0,10),rndLabel:roundLabel||'',sa:null,sb:null,sets:[],_id:null});
  const idx=br.manualMatches.length-1;
  save();
  bracketMatchState={tnId,rnd:-1,mi:idx,teamA:'',teamB:''};
  openBktPasteModal();
}

/* ══════════════════════════════════════
   브라켓 상태 저장 유틸
   tn.bracket = {
     slots: { "r-mi-side": "대학명" },   // 각 라운드 각 경기 슬롯 수동 override
     winners: { "r-mi": "대학명" },       // 각 라운드 각 경기 승자
     champ: "대학명"
   }
══════════════════════════════════════ */
function getBracket(tn){
  if(!tn.bracket)tn.bracket={slots:{},winners:{},champ:''};
  if(!tn.bracket.slots)tn.bracket.slots={};
  if(!tn.bracket.winners)tn.bracket.winners={};
  if(tn.bracket.champ===undefined)tn.bracket.champ='';
  return tn.bracket;
}
function setBracketWinner(tnId,rnd,mi,winner){
  const tn=tourneys.find(t=>t.id===tnId);if(!tn)return;
  const br=getBracket(tn);
  const key=`${rnd}-${mi}`;
  if(br.winners[key]===winner){br.winners[key]='';} // 토글 off
  else{br.winners[key]=winner;}
  save();render();
}
function setBracketSlot(tnId,rnd,mi,side,val){
  const tn=tourneys.find(t=>t.id===tnId);if(!tn)return;
  const br=getBracket(tn);
  br.slots[`${rnd}-${mi}-${side}`]=val;
  // 슬롯 바꾸면 해당 매치 승자 초기화
  delete br.winners[`${rnd}-${mi}`];
  save();render();
}
function setBracketChamp(tnId,val){
  const tn=tourneys.find(t=>t.id===tnId);if(!tn)return;
  getBracket(tn).champ=val;save();render();
}
function resetBracket(tnId){
  const tn=tourneys.find(t=>t.id===tnId);if(!tn)return;
  if(!confirm('브라켓을 초기화하시겠습니까?\n수동으로 입력한 팀 배치와 결과가 모두 삭제됩니다.'))return;
  tn.bracket={slots:{},winners:{},champ:''};save();render();
}

/* ── 동적 브라켓 시각화 (스포츠 대진표 스타일) ── */
function rCompTourDynamic(tn){
  const grpRanks=(tn.groups&&tn.groups.length>=2)?tn.groups.map((grp,gi)=>{
    const gl='ABCDEFGHIJ'[gi]||String(gi+1);
    const color=['#2563eb','#dc2626','#16a34a','#d97706','#7c3aed','#0891b2'][gi%6];
    return{grpName:grp.name||('조'+gl),color,ranked:_calcGrpRank(grp)};
  }):[];

  const numGroups=grpRanks.length;
  const pairCount=Math.floor(numGroups/2)*2;
  const r1teams=[];
  for(let i=0;i<pairCount;i+=2){
    const gA=grpRanks[i],gB=grpRanks[i+1]||grpRanks[0];
    r1teams.push(
      {univ:gA.ranked[0]?.u||'',grpName:gA.grpName,color:gA.color,rank:1},
      {univ:gB.ranked[1]?.u||'',grpName:gB.grpName,color:gB.color,rank:2},
      {univ:gB.ranked[0]?.u||'',grpName:gB.grpName,color:gB.color,rank:1},
      {univ:gA.ranked[1]?.u||'',grpName:gA.grpName,color:gA.color,rank:2}
    );
  }
  if(numGroups%2===1){
    const last=grpRanks[numGroups-1];
    r1teams.push(
      {univ:last.ranked[0]?.u||'',grpName:last.grpName,color:last.color,rank:1},
      {univ:'',grpName:'와일드카드',color:'#6b7280',rank:'-'}
    );
  }

  const overrideSize=tn.bracketOverrideSize||0;
  const numTeams=overrideSize>1?overrideSize:(r1teams.length>0?r1teams.length:8);
  let totalRounds=0;
  {let n=numTeams;while(n>1){n=Math.ceil(n/2);totalRounds++;}}
  if(!totalRounds)totalRounds=1;

  const roundLabels={1:'결승',2:'준결승',3:'8강',4:'16강',5:'32강'};
  const br=getBracket(tn);
  const allU=getAllUnivs();
  const tnId=tn.id;
  const BASE_H=130; // px per R0 match slot

  // Build rounds data
  const rounds=[];
  for(let r=0;r<totalRounds;r++){
    const matchCount=Math.ceil(numTeams/Math.pow(2,r+1));
    const pairs=[];
    for(let mi=0;mi<matchCount;mi++){
      let tA=null,tB=null;
      if(r===0){
        const bA=r1teams[mi*2]||null,bB=r1teams[mi*2+1]||null;
        const sA=br.slots[`0-${mi}-a`],sB=br.slots[`0-${mi}-b`];
        tA=sA!==undefined?(sA?{univ:sA,color:gc(sA)}:null):(bA?.univ?bA:null);
        tB=sB!==undefined?(sB?{univ:sB,color:gc(sB)}:null):(bB?.univ?bB:null);
      }else{
        const pA=br.winners[`${r-1}-${mi*2}`]||null,pB=br.winners[`${r-1}-${mi*2+1}`]||null;
        const sA=br.slots[`${r}-${mi}-a`],sB=br.slots[`${r}-${mi}-b`];
        tA=sA!==undefined?(sA?{univ:sA,color:gc(sA)}:null):(pA?{univ:pA,color:gc(pA)}:null);
        tB=sB!==undefined?(sB?{univ:sB,color:gc(sB)}:null):(pB?{univ:pB,color:gc(pB)}:null);
      }
      pairs.push({a:tA,b:tB,winner:br.winners[`${r}-${mi}`]||null});
    }
    rounds.push(pairs);
  }

  // === 팀 슬롯 행 HTML ===
  function teamRow(team,isWin,isLose,rnd,mi,side,score){
    const col=team?gc(team.univ):'#e2e8f0';
    const name=team?.univ||'';
    const tbd=!name;
    const bg=isWin?col+'1a':isLose?'#f8fafc':'var(--white)';
    const bc=isWin?col:tbd?'#e2e8f0':col+'55';
    const textCol=tbd?'#b0bec5':isLose?'#94a3b8':isWin?col:'var(--text)';
    const fw=isWin?800:isLose?500:600;
    const scoreEl=score!=null?`<span style="min-width:18px;text-align:center;font-size:13px;font-weight:800;color:${isWin?col:isLose?'#cbd5e1':'var(--text3)'};padding-right:8px">${score}</span>`:'';
    if(isLoggedIn){
      return `<div style="display:flex;align-items:center;height:36px;background:${bg};border-left:4px solid ${bc}">
        ${team?.grpName?`<span style="background:${team.color||col};color:#fff;font-size:9px;font-weight:800;padding:1px 4px;margin:0 3px;border-radius:3px;flex-shrink:0">${team.rank}</span>`:'<span style="width:3px;flex-shrink:0"></span>'}
        <select onchange="setBracketSlot('${tnId}',${rnd},${mi},'${side}',this.value)"
          style="flex:1;height:100%;border:none;background:transparent;font-size:12px;font-weight:${fw};color:${textCol};padding:0 5px;cursor:pointer;outline:none;min-width:0">
          <option value="">— 미정 —</option>
          ${allU.map(u=>`<option value="${u.name}"${name===u.name?' selected':''}>${u.name}</option>`).join('')}
        </select>
        ${scoreEl}
      </div>`;
    }
    return `<div style="display:flex;align-items:center;height:36px;padding:0 0 0 8px;gap:5px;background:${bg};border-left:4px solid ${bc}">
      ${team?.grpName?`<span style="background:${team.color||col};color:#fff;font-size:9px;font-weight:800;padding:1px 4px;border-radius:3px;flex-shrink:0">${team.rank}</span>`:''}
      <span style="flex:1;font-size:12px;font-weight:${fw};color:${textCol};overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${tbd?'미정':name}</span>
      ${scoreEl}
    </div>`;
  }

  // === 매치 카드 HTML ===
  function matchCard(pair,rnd,mi){
    const {a,b,winner}=pair;
    const aC=a?gc(a.univ):'#e2e8f0',bC=b?gc(b.univ):'#e2e8f0';
    const aWin=!!(winner&&winner===a?.univ),bWin=!!(winner&&winner===b?.univ);
    const isDone=!!winner;
    const bktKey=`${rnd}-${mi}`;
    const det=br.matchDetails?.[bktKey];
    const detDone=det&&det.sa!=null;
    const hasGames=det?.sets?.some(s=>(s.games||[]).some(g=>g.playerA||g.playerB));
    const detId=`bkt-det-${rnd}-${mi}`;
    let footer='';
    if(isLoggedIn&&a?.univ&&b?.univ){
      footer=`<div style="display:flex;gap:2px;padding:4px;background:var(--surface);border-top:1px solid var(--border);flex-wrap:wrap">
        <div style="display:flex;gap:2px;flex:1;min-width:0">
          <button onclick="setBracketWinner('${tnId}',${rnd},${mi},'${a.univ}')"
            style="flex:1;padding:2px 4px;border-radius:4px;border:1.5px solid ${aWin?aC:'#e2e8f0'};background:${aWin?aC+'22':'var(--white)'};font-size:10px;font-weight:700;color:${aWin?aC:'#94a3b8'};cursor:pointer;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0">
            ${aWin?'✅ ':''}${a.univ}승
          </button>
          <button onclick="setBracketWinner('${tnId}',${rnd},${mi},'${b.univ}')"
            style="flex:1;padding:2px 4px;border-radius:4px;border:1.5px solid ${bWin?bC:'#e2e8f0'};background:${bWin?bC+'22':'var(--white)'};font-size:10px;font-weight:700;color:${bWin?bC:'#94a3b8'};cursor:pointer;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0">
            ${bWin?'✅ ':''}${b.univ}승
          </button>
        </div>
        <div style="display:flex;gap:2px">
          <button onclick="openBracketMatchModal('${tnId}',${rnd},${mi},'${a.univ}','${b.univ}')"
            style="padding:2px 5px;border-radius:4px;border:1px solid #2563eb;background:#eff6ff;font-size:10px;color:#2563eb;cursor:pointer" title="결과 직접 입력">✏️</button>
          <button onclick="bracketMatchState={tnId:'${tnId}',rnd:${rnd},mi:${mi},teamA:'${a.univ}',teamB:'${b.univ}'};openBktPasteModal()"
            style="padding:2px 5px;border-radius:4px;border:1px solid #16a34a;background:#f0fdf4;font-size:10px;color:#16a34a;cursor:pointer" title="붙여넣기로 입력">📋</button>
          ${detDone?`<button onclick="openBktShareCard('${tnId}',${rnd},${mi})" style="padding:2px 5px;border-radius:4px;border:1px solid #7c3aed;background:#f5f3ff;font-size:10px;color:#7c3aed;cursor:pointer">🎴</button>`:''}
        </div>
      </div>`;
    }else if(!a?.univ||!b?.univ){
      footer=`<div style="font-size:9px;color:#94a3b8;text-align:center;padding:4px;border-top:1px solid #f1f5f9">팀 배정 후 입력</div>`;
    }
    const detBtn=hasGames?`<button id="detbtn-${detId}" style="width:100%;padding:2px 0;border:none;background:var(--surface);font-size:9px;color:var(--gray-l);cursor:pointer;border-top:1px solid var(--border)" onclick="bktToggleDet('${detId}',this)">📂 상세</button>`:'';
    const detDiv=hasGames?`<div id="${detId}" style="display:none;padding:8px;background:var(--surface);font-size:10px;border-top:1px solid var(--border)">${buildDetailHTML(det,'comp',a?.univ||'A팀',b?.univ||'B팀',aC,bC,aWin,bWin)}</div>`:'';
    const aSc=detDone?det.sa:null, bSc=detDone?det.sb:null;
    return `<div style="background:var(--white);border:1.5px solid ${isDone?aC+'66':'var(--border)'};border-radius:8px;overflow:hidden;width:185px;flex-shrink:0;box-shadow:0 1px 6px rgba(0,0,0,.07)">
      ${teamRow(a,aWin,bWin,rnd,mi,'a',aSc)}
      <div style="height:1px;background:var(--border)"></div>
      ${teamRow(b,bWin,aWin,rnd,mi,'b',bSc)}
      ${footer}
    </div>`;
  }

  // 팀 수 선택
  let sizeHTML='';
  if(isLoggedIn){
    sizeHTML=`<div class="no-export" style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-bottom:12px">
      <span style="font-size:12px;font-weight:700;color:var(--text3)">⚙️ 참가 팀 수:</span>
      ${[2,4,8,16].map(s=>`<button onclick="setBracketSize('${tnId}',${s})"
        style="padding:3px 10px;border-radius:6px;border:1.5px solid ${numTeams===s&&overrideSize>0?'var(--blue)':'var(--border2)'};background:${numTeams===s&&overrideSize>0?'var(--blue)':'var(--white)'};color:${numTeams===s&&overrideSize>0?'#fff':'var(--text3)'};font-size:12px;font-weight:700;cursor:pointer">${s}팀</button>`).join('')}
      ${overrideSize>0?`<button onclick="setBracketSize('${tnId}',0)" style="padding:3px 10px;border-radius:6px;border:1.5px solid #6b7280;background:var(--white);color:#6b7280;font-size:12px;cursor:pointer">🔄 자동</button>`:''}
      <span style="font-size:11px;color:var(--gray-l)">현재 ${numTeams}팀 / ${totalRounds}라운드</span>
      <button class="btn btn-w btn-xs" onclick="resetBracket('${tnId}')" title="브라켓 초기화">🔄 초기화</button>
    </div>`;
  }

  // 조별 순위 요약
  const grpSummary=grpRanks.length>0?`<div style="display:flex;flex-wrap:wrap;gap:7px;margin-bottom:14px">
    ${grpRanks.map(g=>`<div style="background:${g.color}10;border:1px solid ${g.color}44;border-radius:8px;padding:7px 11px;min-width:120px">
      <div style="font-size:11px;font-weight:800;color:${g.color};margin-bottom:5px">${g.grpName}</div>
      ${g.ranked.slice(0,2).map((s,ri)=>`<div style="display:flex;align-items:center;gap:4px;margin-bottom:2px">
        <span style="font-size:10px">${ri===0?'🥇':'🥈'}</span>
        <span style="background:${gc(s.u)};color:#fff;font-size:10px;font-weight:700;padding:1px 5px;border-radius:3px">${s.u}</span>
        <span style="font-size:9px;color:var(--gray-l)">${s.w}승${s.l}패</span>
      </div>`).join('')}
    </div>`).join('')}
  </div>`:`<div style="font-size:11px;color:var(--gray-l);margin-bottom:10px;padding:6px 10px;background:var(--surface);border-radius:6px">💡 조편성이 없습니다. 팀 수를 선택하고 슬롯에서 직접 팀을 배치하세요.</div>`;

  // 브라켓 레이아웃
  let bracketHTML=`<div style="display:inline-flex;align-items:flex-start;gap:0;padding-bottom:8px">`;
  for(let r=0;r<totalRounds;r++){
    const rNum=totalRounds-r;
    const rLabel=roundLabels[rNum]||(rNum+'강');
    const unitH=BASE_H*Math.pow(2,r);
    const matchCount=rounds[r].length;
    bracketHTML+=`<div style="display:flex;flex-direction:column">
      <div style="text-align:center;font-size:11px;font-weight:800;color:var(--blue);padding:5px 12px 10px;letter-spacing:.5px;white-space:nowrap">${rLabel}</div>`;
    for(let mi=0;mi<matchCount;mi++){
      bracketHTML+=`<div style="height:${unitH}px;display:flex;align-items:center;justify-content:center;padding:0 8px">
        ${matchCard(rounds[r][mi],r,mi)}
      </div>`;
    }
    bracketHTML+=`</div>`;
    // 연결선 (매치 중심점에서 정확히 연결)
    if(r<totalRounds-1){
      const CL='2px solid #93c5fd';
      const nextMatchCount=rounds[r+1].length;
      // 연결선 컬럼
      bracketHTML+=`<div style="display:flex;flex-direction:column;width:20px;padding-top:31px">`;
      for(let ci=0;ci<matchCount-1;ci+=2){
        // 4분할: 빈칸(상) / 꺾임선(하) / 꺾임선(상) / 빈칸(하)
        bracketHTML+=`<div style="height:${unitH}px;display:flex;flex-direction:column">
          <div style="flex:1"></div>
          <div style="flex:1;border-right:${CL};border-bottom:${CL};border-bottom-right-radius:3px"></div>
        </div>
        <div style="height:${unitH}px;display:flex;flex-direction:column">
          <div style="flex:1;border-right:${CL};border-top:${CL};border-top-right-radius:3px"></div>
          <div style="flex:1"></div>
        </div>`;
        if(ci+2<matchCount&&ci+2!==matchCount-1+(matchCount%2)){
          // 짝수 쌍 사이 여백 없음 (연속)
        }
      }
      if(matchCount%2===1){
        // 홀수 매치: 직선 연결
        bracketHTML+=`<div style="height:${unitH}px;display:flex;align-items:center">
          <div style="width:100%;border-top:${CL}"></div>
        </div>`;
      }
      bracketHTML+=`</div>`;
      // bridge 컬럼 (다음 라운드 매치 입력선)
      bracketHTML+=`<div style="display:flex;flex-direction:column;width:14px;padding-top:31px">`;
      for(let ni=0;ni<nextMatchCount;ni++){
        bracketHTML+=`<div style="height:${unitH*2}px;display:flex;align-items:center">
          <div style="width:100%;border-top:${CL}"></div>
        </div>`;
      }
      bracketHTML+=`</div>`;
    }
  }
  // 챔피언 박스 연결선
  const finalPairs=rounds[totalRounds-1]||[];
  const finalWinner=finalPairs[0]?.winner||br.champ||'';
  const cc=finalWinner?gc(finalWinner):'#d97706';
  const champUnitH=BASE_H*Math.pow(2,totalRounds-1);
  bracketHTML+=`<div style="display:flex;flex-direction:column;width:32px;padding-top:31px">
    <div style="height:${champUnitH}px;display:flex;align-items:center">
      <div style="width:100%;height:2.5px;background:linear-gradient(90deg,#93c5fd,${cc})"></div>
    </div>
  </div>`;
  // 챔피언 박스
  bracketHTML+=`<div style="display:flex;flex-direction:column;padding-top:31px">
    <div style="height:${champUnitH}px;display:flex;align-items:center;padding:0 8px">
      <div style="background:${cc}18;border:2.5px solid ${cc};border-radius:14px;padding:18px 22px;text-align:center;min-width:120px">
        <div style="font-size:9px;font-weight:800;color:#d97706;letter-spacing:2px;margin-bottom:6px">🏆 CHAMPION</div>
        <div style="font-size:28px;margin-bottom:6px">🏆</div>
        <div style="font-weight:900;font-size:15px;color:${cc};white-space:nowrap">${finalWinner||'?'}</div>
        ${isLoggedIn?`<select onchange="setBracketChamp('${tnId}',this.value)" style="margin-top:8px;font-size:11px;padding:3px 6px;border:1px solid ${cc}44;border-radius:6px;background:transparent;color:${cc};max-width:120px">
          <option value="">직접 지정...</option>
          ${allU.map(u=>`<option value="${u.name}"${finalWinner===u.name?' selected':''}>${u.name}</option>`).join('')}
        </select>`:''}
      </div>
    </div>
  </div>`;
  bracketHTML+=`</div>`;

  return `<div>
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;flex-wrap:wrap">
      <span style="font-weight:900;font-size:15px;color:var(--blue)">⚔️ ${tn.name} — 토너먼트 브라켓</span>
      ${isLoggedIn?`<span class="no-export" style="font-size:11px;color:var(--gray-l)">💡 슬롯 클릭으로 팀 변경 · 승 버튼으로 결과 입력</span>`:''}
    </div>
    ${sizeHTML}
    ${grpSummary}
    <div style="overflow-x:auto;padding-bottom:8px;-webkit-overflow-scrolling:touch;touch-action:pan-x">${bracketHTML}</div>
  </div>`;
}

function setBracketSize(tnId,size){
  const tn=tourneys.find(t=>t.id===tnId);if(!tn)return;
  if(size>0)tn.bracketOverrideSize=size;else delete tn.bracketOverrideSize;
  save();render();
}

function rCompPlayerRank(tn){
  if(!tn) return `<div style="padding:30px;text-align:center;color:var(--gray-l)">대회를 선택하세요.</div>`;
  const pStats={};
  function countGames(m){
    if(m.sa==null)return;
    (m.sets||[]).forEach(set=>{
      (set.games||[]).forEach(g=>{
        if(!g.playerA||!g.playerB||!g.winner)return;
        const wn=g.winner==='A'?g.playerA:g.playerB;const ln=g.winner==='A'?g.playerB:g.playerA;
        if(!pStats[wn])pStats[wn]={w:0,l:0};if(!pStats[ln])pStats[ln]={w:0,l:0};
        pStats[wn].w++;pStats[ln].l++;
      });
    });
  }
  (tn.groups||[]).forEach(grp=>{
    (grp.matches||[]).forEach(m=>countGames(m));
  });
  // 브라켓 경기 포함
  const br=getBracket(tn);
  Object.values(br.matchDetails||{}).forEach(m=>countGames(m));
  (br.manualMatches||[]).forEach(m=>{if(m)countGames(m);});
  if(!window._rankSort)window._rankSort={};
  const sk=window._rankSort['comp']||'rate';
  const sorted=Object.entries(pStats)
    .map(([name,s])=>({name,w:s.w,l:s.l,total:s.w+s.l,rate:s.w+s.l?Math.round(s.w/(s.w+s.l)*100):0}))
    .filter(p=>p.total>0)
    .sort((a,b)=>sk==='w'?b.w-a.w||b.rate-a.rate:sk==='l'?b.l-a.l||a.rate-b.rate:b.rate-a.rate||b.w-a.w);
  const sortBar=`<div class="sort-bar no-export" style="display:flex;align-items:center;gap:6px;margin-bottom:10px;flex-wrap:wrap"><span style="font-size:11px;font-weight:700;color:var(--text3)">정렬:</span><button class="sort-btn ${sk==='rate'?'on':''}" onclick="window._rankSort['comp']='rate';render()">승률순</button><button class="sort-btn ${sk==='w'?'on':''}" onclick="window._rankSort['comp']='w';render()">승순</button><button class="sort-btn ${sk==='l'?'on':''}" onclick="window._rankSort['comp']='l';render()">패순</button></div>`;
  if(!sorted.length) return sortBar+`<div style="padding:40px;text-align:center;color:var(--gray-l);background:var(--surface);border-radius:10px">⏳ 아직 기록된 경기 결과가 없습니다.</div>`;
  if(!window._rankPage)window._rankPage={};
  const _PK='comp_rank';
  const _PAGE=20;
  if(window._rankPage[_PK]===undefined)window._rankPage[_PK]=0;
  const _tot=sorted.length;
  const _totP=Math.ceil(_tot/_PAGE)||1;
  if(window._rankPage[_PK]>=_totP)window._rankPage[_PK]=0;
  const _cp=window._rankPage[_PK];
  const _paged=_tot>_PAGE?sorted.slice(_cp*_PAGE,(_cp+1)*_PAGE):sorted;
  let h=sortBar+`<div style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:15px;color:var(--blue);margin-bottom:14px">🏅 ${tn.name} 개인 순위</div>
  <table><thead><tr><th style="text-align:left">순위</th><th style="text-align:left">이름</th><th style="text-align:left">소속</th><th>승</th><th>패</th><th>승차</th><th>승률</th></tr></thead><tbody>`;
  _paged.forEach((p,i)=>{
    const pObj=players.find(x=>x.name===p.name);const col=pObj?gc(pObj.univ):'#888';
    const diff=p.w-p.l;
    const _ri=_cp*_PAGE+i;
    h+=`<tr>
      <td style="text-align:left">${_ri===0?`<span class="rk1">1등</span>`:_ri===1?`<span class="rk2">2등</span>`:_ri===2?`<span class="rk3">3등</span>`:`${_ri+1}위`}</td>
      <td style="text-align:left"><span style="display:inline-flex;align-items:center;gap:7px">${typeof getPlayerPhotoHTML==='function'?getPlayerPhotoHTML(p.name,'34px'):''}<span class="clickable-name" style="font-weight:700;font-size:14px" onclick="openPlayerModal('${p.name}')">${p.name}</span></span></td>
      <td style="text-align:left">${pObj?`<span class="ubadge" style="background:${col};font-size:11px">${pObj.univ}</span>`:'-'}</td>
      <td class="wt" style="font-weight:800">${p.w}</td><td class="lt" style="font-weight:800">${p.l}</td>
      <td style="font-weight:800;color:${diff>0?'var(--green)':diff<0?'var(--red)':'var(--gray-l)'}">${diff>=0?'+':''}${diff}</td>
      <td style="font-weight:700;color:${p.rate>=50?'var(--green)':'var(--red)'}">${p.total?p.rate+'%':'-'}</td>
    </tr>`;
  });
  const _pageNav=_tot>_PAGE?`<div style="display:flex;justify-content:center;align-items:center;gap:10px;margin-top:12px;flex-wrap:wrap">
  <button class="btn btn-sm" ${_cp===0?'disabled':''} onclick="if(!window._rankPage)window._rankPage={};window._rankPage['${_PK}']=${_cp-1};render()">← 이전</button>
  <span style="font-size:12px;color:var(--gray-l)">${_cp+1} / ${_totP} (${_tot}명)</span>
  <button class="btn btn-sm" ${_cp>=_totP-1?'disabled':''} onclick="if(!window._rankPage)window._rankPage={};window._rankPage['${_PK}']=${_cp+1};render()">다음 →</button>
</div>`:'';
  return h+`</tbody></table>`+_pageNav;
}

function grpToggleTierFilter(t){
  if(!window._grpTierFilters)window._grpTierFilters=[];
  const i=window._grpTierFilters.indexOf(t);
  if(i>=0)window._grpTierFilters.splice(i,1);else window._grpTierFilters.push(t);
  render();
}

function rCompGrpEdit(){
  if(!isLoggedIn) return `<div style="padding:30px;text-align:center;color:var(--gray-l)">로그인 후 이용 가능합니다.</div>`;
  if(grpSub==='edit'&&grpEditId) return rGrpEditInner();
  if(!window._grpTierFilters)window._grpTierFilters=[];
  const tfs=window._grpTierFilters;
  let h=`<div class="grp-edit-header">
    <span style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:15px;color:var(--blue)">🏗️ 대회 조편성 관리</span>
    <button class="btn btn-b btn-sm" onclick="grpNewTourney()">+ 새 대회 만들기</button>
    <div style="margin-left:auto;display:flex;gap:5px;align-items:center;flex-wrap:wrap">
      <span style="font-size:11px;font-weight:700;color:var(--gray-l)">출전 티어 <span style="font-weight:400;font-size:10px">(복수선택)</span>:</span>
      <button class="tier-filter-btn ${tfs.length===0?'on':''}" onclick="window._grpTierFilters=[];render()">전체</button>
      ${TIERS.map(t=>{const _bg=getTierBtnColor(t),_tc=getTierBtnTextColor(t),_on=tfs.includes(t);return`<button class="tier-filter-btn ${_on?'on':''}" style="${_on?`background:${_bg};color:${_tc};border-color:${_bg}`:''}" onclick="grpToggleTierFilter('${t}')">${getTierLabel(t)}</button>`;}).join('')}
    </div>
  </div>`;
  if(!tourneys.length){h+=`<div style="padding:40px;text-align:center;color:var(--gray-l);background:var(--surface);border-radius:10px;border:2px dashed var(--border2)">등록된 대회가 없습니다.</div>`;return h;}
  tourneys.forEach((tn,ti)=>{
    const isActive=tn.name===curComp;
    h+=`<div style="background:${isActive?'var(--blue-l)':'var(--surface)'};border:${isActive?'2px solid var(--blue)':'1px solid var(--border)'};border-radius:12px;padding:16px 20px;margin-bottom:12px">
      <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:10px">
        <span style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:15px">${isActive?'✅ ':''} ${tn.name}</span>
        <span style="font-size:11px;color:var(--gray-l)">${tn.groups.length}개조 / ${tn.groups.reduce((s,g)=>s+(g.matches||[]).length,0)}경기</span>
        <div style="margin-left:auto;display:flex;gap:6px;flex-wrap:wrap">
          ${!isActive?`<button class="btn btn-b btn-xs" onclick="curComp='${tn.name}';save();render()">현재 대회로 설정</button>`:'<span style="font-size:11px;color:var(--blue);font-weight:700">📌 현재 대회</span>'}
          <button class="btn btn-w btn-xs" onclick="grpEditId='${tn.id}';grpSub='edit';render()">📝 조편성 입력</button>
          <button class="btn btn-r btn-xs" onclick="grpDelTourney(${ti})">🗑️ 삭제</button>
        </div>
      </div>
      ${tn.groups.length?`<div style="display:flex;gap:6px;flex-wrap:wrap">${tn.groups.map((g,gi)=>{const gl='ABCDEFGHIJ'[gi];const col=['#2563eb','#dc2626','#16a34a','#d97706','#7c3aed','#0891b2'][gi%6];return `<span style="background:${col};color:#fff;padding:2px 12px;border-radius:20px;font-size:11px;font-weight:700">GROUP ${gl}조 (${g.univs.length}팀, ${(g.matches||[]).length}경기)</span>`;}).join('')}</div>`:'<span style="font-size:11px;color:var(--gray-l)">조 없음</span>'}
    </div>`;
  });
  return h;
}

function rGrpEditInner(){
  const tn=tourneys.find(t=>t.id===grpEditId);
  if(!tn){grpSub='list';render();return '';}
  const GL='ABCDEFGHIJ';
  let h=`<div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;flex-wrap:wrap">
    <button class="btn btn-w btn-sm" onclick="grpSub='list';render()">← 목록</button>
    <span style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:16px">🏆 ${tn.name} — 조편성</span>
    <button class="btn btn-b btn-sm" style="margin-left:auto" onclick="grpAddGroup('${tn.id}')">+ ${GL[tn.groups.length]||'?'}조 추가</button>
  </div>`;
  if(!tn.groups.length){
    h+=`<div style="text-align:center;padding:50px;background:var(--surface);border-radius:12px;border:2px dashed var(--border2)">
      <div style="font-size:32px;margin-bottom:12px">🏆</div>
      <div style="font-weight:700;margin-bottom:10px">A조부터 순차적으로 조를 만들어주세요</div>
      <button class="btn btn-b" onclick="grpAddGroup('${tn.id}')">+ GROUP A조 만들기</button>
    </div>`;
    return h;
  }
  tn.groups.forEach((grp,gi)=>{
    const gl=GL[gi]||gi;const col=['#2563eb','#dc2626','#16a34a','#d97706','#7c3aed','#0891b2'][gi%6];
    const availU=getAllUnivs().map(u=>u.name).filter(n=>!grp.univs.includes(n));
    h+=`<div style="background:${col}08;border:2px solid ${col}44;border-radius:12px;padding:16px;margin-bottom:16px">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:14px;flex-wrap:wrap">
        <span style="background:${col};color:#fff;font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:14px;padding:3px 16px;border-radius:20px">GROUP ${gl}조</span>
        <span style="font-size:11px;color:var(--gray-l)">${grp.univs.length}개 대학 · ${(grp.matches||[]).length}경기</span>
        <button class="btn btn-r btn-xs" style="margin-left:auto" onclick="grpDelGroup('${tn.id}',${gi})">조 삭제</button>
      </div>
      <div style="margin-bottom:14px">
        <div style="font-size:12px;font-weight:700;color:${col};margin-bottom:8px">① 대학 선택</div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px">
          ${grp.univs.map((u,ui)=>`<span class="ubadge" style="background:${gc(u)};font-size:12px">${u}<button onclick="grpRemoveUniv('${tn.id}',${gi},${ui})" style="background:rgba(255,255,255,.3);border:none;border-radius:50%;color:#fff;width:16px;height:16px;font-size:9px;cursor:pointer;margin-left:3px;line-height:16px;text-align:center">×</button></span>`).join('')}
          ${!grp.univs.length?'<span style="color:var(--gray-l);font-size:12px">아직 없음</span>':''}
        </div>
        ${availU.length?`<div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap">
          <div style="position:relative;flex:1;min-width:150px">
            <input type="text" id="grp-univ-search-${gi}" placeholder="🔍 대학 검색..." style="width:100%;padding:6px 10px;font-size:12px;border:1px solid var(--border2);border-radius:6px" oninput="grpFilterUnivSel(${gi})">
          </div>
          <select id="grp-univ-sel-${gi}" style="max-width:200px"><option value="">— 대학 선택 —</option>${availU.map(u=>`<option value="${u}">${u}</option>`).join('')}</select>
          <button class="btn btn-b btn-sm" onclick="grpAddUniv('${tn.id}',${gi})">+ 추가</button>
        </div>`:`<div style="font-size:11px;color:var(--gray-l)">모든 대학이 추가됨</div>`}
      </div>
      <div>
        <div style="font-size:12px;font-weight:700;color:${col};margin-bottom:8px">② 경기 일정 (${(grp.matches||[]).length}경기 등록)</div>
        ${(grp.matches||[]).length?`<div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px">${grp.matches.map((m,mi)=>{
          const isDone=m.sa!=null&&m.sb!=null;const ca=gc(m.a||'');const cb=gc(m.b||'');
          return `<div style="background:var(--white);border:1px solid var(--border);border-radius:8px;padding:7px 12px;font-size:12px;display:flex;align-items:center;gap:6px;flex-wrap:wrap">
            <span style="font-size:10px;font-weight:700;color:${col}">${gl}조 ${mi+1}경기</span>
            ${m.d?`<span style="font-size:10px;color:var(--gray-l)">${m.d.slice(5)}</span>`:''}
            <span style="background:${ca||'#888'};color:#fff;padding:1px 7px;border-radius:4px;font-size:11px">${m.a||'?'}</span>
            <span style="color:var(--gray-l)">vs</span>
            <span style="background:${cb||'#888'};color:#fff;padding:1px 7px;border-radius:4px;font-size:11px">${m.b||'?'}</span>
            ${isDone?`<span style="font-weight:800;font-size:12px"><span class="wt">${m.sa}</span>:<span class="lt">${m.sb}</span></span>`:'<span style="font-size:10px;color:var(--gray-l)">예정</span>'}
            <button class="btn btn-b btn-xs" onclick="grpEditMatch('${tn.id}',${gi},${mi})">✏️ 결과입력</button>
            <button class="btn btn-r btn-xs" onclick="grpDelMatch('${tn.id}',${gi},${mi})">×</button>
          </div>`;
        }).join('')}</div>`:''}
        ${grp.univs.length>=2?`<button class="btn btn-b btn-sm" onclick="grpAddMatch('${tn.id}',${gi})">+ ${gl}조 경기 추가</button>`:`<span style="font-size:11px;color:var(--gray-l)">※ 대학 2개 이상 추가 후 경기 등록 가능</span>`}
      </div>
    </div>`;
  });
  return h;
}

function grpAddMatchByDate(tnId, date){
  // 해당 날짜의 조 중 팀이 2개 이상인 첫 번째 조에 경기 추가
  const tn=tourneys.find(t=>t.id===tnId);if(!tn)return;
  // 조 선택 (팀 2개 이상 있는 조가 있으면 첫 번째, 없으면 첫 번째 조)
  const validGrp=tn.groups.find(g=>g.univs.length>=2)||tn.groups[0];
  if(!validGrp){alert('조를 먼저 만들어 주세요.');return;}
  const gi=tn.groups.indexOf(validGrp);
  validGrp.matches.push({a:'',b:'',d:date,sa:null,sb:null,sets:[]});
  const mi=validGrp.matches.length-1;
  save();grpMatchState={tnId,gi,mi};grpOpenMatchModal(tn,gi,mi);
}

function grpAddMatch(tnId,gi){
  const tn=tourneys.find(t=>t.id===tnId);if(!tn)return;
  const grp=tn.groups[gi];
  if(grp.univs.length<2){alert('먼저 대학을 2개 이상 추가하세요.');return;}
  tn.groups[gi].matches.push({a:'',b:'',d:'',sa:null,sb:null,sets:[]});
  const mi=tn.groups[gi].matches.length-1;
  save();grpMatchState={tnId,gi,mi};grpOpenMatchModal(tn,gi,mi);
}
function grpEditMatch(tnId,gi,mi){
  grpMatchState={tnId,gi,mi};const tn=tourneys.find(t=>t.id===tnId);if(tn)grpOpenMatchModal(tn,gi,mi);
}
function grpDelMatch(tnId,gi,mi){
  if(!confirm('경기를 삭제하시겠습니까?\n⚠️ 선수 개인 전적도 롤백됩니다.'))return;
  const tn=tourneys.find(t=>t.id===tnId);if(!tn)return;
  if(!tn.groups||!tn.groups[gi]||!tn.groups[gi].matches||!tn.groups[gi].matches[mi])return;
  revertMatchRecord(tn.groups[gi].matches[mi]);
  tn.groups[gi].matches.splice(mi,1);save();render();
}

function grpOpenMatchModal(tn,gi,mi){
  const grp=tn.groups[gi];const m=grp.matches[mi];
  const GL=['A','B','C','D','E','F','G','H','I','J'];const gl=GL[gi]||String.fromCharCode(65+gi);
  const col=['#2563eb','#dc2626','#16a34a','#d97706','#7c3aed','#0891b2'][gi%6];
  const uOpts=`<option value="">— 대학 선택 —</option>`+grp.univs.map(u=>`<option value="${u}"${m.a===u?' selected':''}>${u}</option>`).join('');
  const uOptsB=`<option value="">— 대학 선택 —</option>`+grp.univs.map(u=>`<option value="${u}"${m.b===u?' selected':''}>${u}</option>`).join('');
  document.getElementById('grpMatchTitle').textContent=`GROUP ${gl}조 ${mi+1}경기 결과 입력`;
  document.getElementById('grpMatchBody').innerHTML=`
    <div style="background:${col}10;border:1px solid ${col}44;border-radius:10px;padding:14px;margin-bottom:16px">
      <div style="font-size:11px;font-weight:700;color:${col};margin-bottom:10px">
        📋 GROUP ${gl}조 소속 대학: ${grp.univs.map(u=>`<span style="background:${gc(u)};color:#fff;padding:1px 8px;border-radius:4px;font-size:11px;margin-left:4px">${u}</span>`).join('')}
      </div>
      <div style="display:flex;gap:12px;flex-wrap:wrap;align-items:flex-start">
        <div style="flex:1;min-width:130px">
          <div style="font-size:11px;font-weight:700;color:var(--blue);margin-bottom:4px">🔵 팀 A 대학</div>
          <select id="gm-a" onchange="grpRefreshSets();" style="width:100%">${uOpts}</select>
        </div>
        <div style="font-size:16px;font-weight:800;color:var(--gray-l);padding-top:22px">VS</div>
        <div style="flex:1;min-width:130px">
          <div style="font-size:11px;font-weight:700;color:var(--red);margin-bottom:4px">🔴 팀 B 대학</div>
          <select id="gm-b" onchange="grpRefreshSets();" style="width:100%">${uOptsB}</select>
        </div>
        <div>
          <div style="font-size:11px;font-weight:700;color:var(--gray-l);margin-bottom:4px">📅 날짜</div>
          <input type="date" id="gm-date" value="${m.d||new Date().toISOString().slice(0,10)}" style="width:145px">
        </div>
      </div>
    </div>
    <div id="gm-sets"></div>
    <div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap;align-items:center">
      <button class="btn btn-b btn-sm" onclick="grpAddSet()">+ 1세트</button>
      <button class="btn btn-w btn-sm" onclick="grpAddSet2()">+ 2세트</button>
      <button class="btn btn-w btn-sm" onclick="grpAddSet3()">🎯 에이스전</button>
      <button class="btn btn-p btn-sm" onclick="openGrpPasteModal()">📋 붙여넣기 일괄 입력</button>
      <select id="gm-match-mode" style="padding:4px 8px;border-radius:6px;border:1px solid var(--border2);font-size:12px;font-weight:700" title="경기방식">
        <option value="set">세트제</option>
        <option value="game">게임수 합산</option>
      </select>
      <button class="btn btn-g btn-sm" style="margin-left:auto" onclick="grpSaveMatch()">✅ 저장</button>
      <button class="btn btn-w btn-sm" onclick="cm('grpMatchModal')">취소</button>
    </div>`;
  om('grpMatchModal');
  grpRefreshSets();
}

function grpUpdateMemberList(){
  function mHTML(univ){
    if(!univ)return '';
    const mems=players.filter(p=>p.univ===univ);
    if(!mems.length)return `<span style="color:var(--gray-l)">선수 없음</span>`;
    return `<div style="display:flex;flex-wrap:wrap;gap:3px">${mems.map(p=>`<span style="font-size:11px;background:${gc(univ)}12;border:1px solid ${gc(univ)}44;padding:2px 7px;border-radius:4px">${p.name}<span style="color:var(--gray-l)">[${p.tier||'-'}/${p.race||'-'}]</span></span>`).join('')}</div>`;
  }
  const aEl=document.getElementById('gm-a'),bEl=document.getElementById('gm-b');
  const aDiv=document.getElementById('gm-a-mems'),bDiv=document.getElementById('gm-b-mems');
  if(aEl&&aDiv)aDiv.innerHTML=mHTML(aEl.value);
  if(bEl&&bDiv)bDiv.innerHTML=mHTML(bEl.value);
}

function grpRefreshSets(){
  const tn=tourneys.find(t=>t.id===grpMatchState.tnId);if(!tn)return;
  if(grpMatchState.gi==null||grpMatchState.mi==null)return;
  const m=tn.groups[grpMatchState.gi].matches[grpMatchState.mi];
  const aEl=document.getElementById('gm-a');const bEl=document.getElementById('gm-b');
  if(!aEl)return;
  const teamA=aEl.value,teamB=bEl?bEl.value:'';
  const tfs=window._grpTierFilters||[];
  const mA=players.filter(p=>p.univ===teamA&&(tfs.length===0||tfs.includes(p.tier)));
  const mB=players.filter(p=>p.univ===teamB&&(tfs.length===0||tfs.includes(p.tier)));
  const tfLabel=tfs.length?` [${tfs.join('+')}]`:'';
  const optsA=`<option value="">A팀 선수${tfLabel}</option>`+mA.map(p=>`<option value="${p.name}">${p.name} [${p.tier||'-'}/${p.race||'-'}]</option>`).join('');
  const optsB=`<option value="">B팀 선수${tfLabel}</option>`+mB.map(p=>`<option value="${p.name}">${p.name} [${p.tier||'-'}/${p.race||'-'}]</option>`).join('');
  const setsEl=document.getElementById('gm-sets');if(!setsEl)return;
  if(!m.sets||!m.sets.length){setsEl.innerHTML='<div style="color:var(--gray-l);font-size:12px;margin:12px 0;padding:14px;background:var(--surface);border-radius:8px;text-align:center">세트를 추가하세요 ↓</div>';return;}
  let h='';
  m.sets.forEach((set,si)=>{
    const lbl=set.label||(si===2?'🎯 에이스전':`${si+1}세트`);
    const sA=set.scoreA||0,sB=set.scoreB||0;
    h+=`<div class="set-block${si===2?' ace':''}">
      <div class="set-title">
        <span class="set-badge${si===2?' ace':''}">${lbl}</span>
        <span style="font-size:12px;color:var(--gray-l)">경기 ${(set.games||[]).length}개 · <span class="${sA>sB?'wt':''}">${sA}</span>:<span class="${sB>sA?'wt':''}">${sB}</span></span>
        <button class="btn btn-r btn-xs" onclick="grpDelSet(${si})">세트 삭제</button>
      </div>`;
    (set.games||[]).forEach((g,gi2)=>{
      const mapOpts=maps.map(mp=>`<option value="${mp}"${g.map===mp?' selected':''}>${mp}</option>`).join('');
      const selA=optsA.replace(`value="${g.playerA}"`,`value="${g.playerA}" selected`);
      const selB=optsB.replace(`value="${g.playerB}"`,`value="${g.playerB}" selected`);
      h+=`<div class="game-row">
        <span style="font-size:11px;font-weight:700;color:var(--gray-l);min-width:40px">경기${gi2+1}</span>
        <select onchange="grpSetGame(${si},${gi2},'playerA',this.value)">${selA}</select>
        <span style="font-size:11px;color:var(--gray-l)">vs</span>
        <select onchange="grpSetGame(${si},${gi2},'playerB',this.value)">${selB}</select>
        <select onchange="grpSetGame(${si},${gi2},'map',this.value)" style="max-width:100px"><option value="">맵</option>${mapOpts}</select>
        <button class="win-btn ${g.winner==='A'?'win-sel':''}" onclick="grpSetGame(${si},${gi2},'winner','A');grpRefreshSets()">A 승</button>
        <button class="win-btn ${g.winner==='B'?'lose-sel':''}" onclick="grpSetGame(${si},${gi2},'winner','B');grpRefreshSets()">B 승</button>
        <button class="btn btn-r btn-xs" onclick="grpDelGame(${si},${gi2})">🗑️ 삭제</button>
      </div>`;
    });
    h+=`<button class="btn btn-w btn-sm" onclick="grpAddGame(${si})">+ 경기 추가</button></div>`;
  });
  setsEl.innerHTML=h;
}

function grpSetGame(si,gi,field,val){
  const tn=tourneys.find(t=>t.id===grpMatchState.tnId);if(!tn)return;
  const m=tn.groups[grpMatchState.gi].matches[grpMatchState.mi];
  if(m.sets[si]&&m.sets[si].games[gi])m.sets[si].games[gi][field]=val;
}
function grpAddSet(){
  const tn=tourneys.find(t=>t.id===grpMatchState.tnId);if(!tn)return;
  const m=tn.groups[grpMatchState.gi].matches[grpMatchState.mi];if(!m.sets)m.sets=[];
  if(m.sets.length>=3){alert('최대 3세트(에이스전 포함)까지 가능합니다.');return;}
  m.sets.push({games:[{playerA:'',playerB:'',winner:'',map:''}],scoreA:0,scoreB:0,winner:''});grpRefreshSets();
}
function grpAddSet2(){
  const tn=tourneys.find(t=>t.id===grpMatchState.tnId);if(!tn)return;
  const m=tn.groups[grpMatchState.gi].matches[grpMatchState.mi];if(!m.sets)m.sets=[];
  if(m.sets.length>=3){alert('이미 최대 세트입니다.');return;}
  if(m.sets.length<1)m.sets.push({games:[{playerA:'',playerB:'',winner:'',map:''}],scoreA:0,scoreB:0,winner:''});
  if(m.sets.length<2)m.sets.push({games:[{playerA:'',playerB:'',winner:'',map:''}],scoreA:0,scoreB:0,winner:''});
  grpRefreshSets();
}
function grpAddSet3(){
  const tn=tourneys.find(t=>t.id===grpMatchState.tnId);if(!tn)return;
  const m=tn.groups[grpMatchState.gi].matches[grpMatchState.mi];if(!m.sets)m.sets=[];
  if(m.sets.length>=3){alert('에이스전이 이미 있습니다.');return;}
  while(m.sets.length<3)m.sets.push({games:[{playerA:'',playerB:'',winner:'',map:''}],scoreA:0,scoreB:0,winner:''});
  grpRefreshSets();
}
function grpDelSet(si){
  const tn=tourneys.find(t=>t.id===grpMatchState.tnId);if(!tn)return;
  const m=tn.groups[grpMatchState.gi].matches[grpMatchState.mi];m.sets.splice(si,1);grpRefreshSets();
}
function grpAddGame(si){
  const tn=tourneys.find(t=>t.id===grpMatchState.tnId);if(!tn)return;
  const m=tn.groups[grpMatchState.gi].matches[grpMatchState.mi];
  if(!m||!m.sets||!m.sets[si])return;
  if(!m.sets[si].games)m.sets[si].games=[];
  m.sets[si].games.push({playerA:'',playerB:'',winner:'',map:''});grpRefreshSets();
}
function grpDelGame(si,gi2){
  const tn=tourneys.find(t=>t.id===grpMatchState.tnId);if(!tn)return;
  const m=tn.groups[grpMatchState.gi].matches[grpMatchState.mi];m.sets[si].games.splice(gi2,1);grpRefreshSets();
}


function grpSaveMatch(){
  const tn=tourneys.find(t=>t.id===grpMatchState.tnId);if(!tn)return;
  const {gi,mi}=grpMatchState;const m=tn.groups[gi].matches[mi];
  m.d=document.getElementById('gm-date')?.value||'';
  m.a=document.getElementById('gm-a')?.value||'';
  m.b=document.getElementById('gm-b')?.value||'';
  if(!m.a||!m.b){alert('두 팀을 선택하세요.');return;}
  // 이전 기록 롤백
  if(m._id)revertMatchRecord({...m,_id:m._id});
  const matchId=genId();m._id=matchId;
  let sa=0,sb=0;
  (m.sets||[]).forEach(set=>{
    let sA=0,sB=0;
    (set.games||[]).forEach(g=>{if(g.winner==='A')sA++;else if(g.winner==='B')sB++;});
    set.scoreA=sA;set.scoreB=sB;set.winner=sA>sB?'A':sB>sA?'B':'';
    if(set.winner==='A')sa++;else if(set.winner==='B')sb++;
  });
  // 경기방식: game=게임수합산, set=세트수(기본)
  const _grpMode = document.getElementById('gm-match-mode')?.value||'set';
  if(_grpMode==='game'){
    sa=(m.sets||[]).reduce((s,st)=>s+(st.scoreA||0),0);
    sb=(m.sets||[]).reduce((s,st)=>s+(st.scoreB||0),0);
  }
  m.sa=sa;m.sb=sb;
  // 선수 개인 전적 자동 반영 (경기 시점 대학 저장)
  (m.sets||[]).forEach(set=>{
    (set.games||[]).forEach(g=>{
      if(!g.playerA||!g.playerB||!g.winner)return;
      const wn=g.winner==='A'?g.playerA:g.playerB;const ln=g.winner==='A'?g.playerB:g.playerA;
      const univW=g.winner==='A'?(m.a||''):(m.b||'');
      const univL=g.winner==='A'?(m.b||''):(m.a||'');
      applyGameResult(wn,ln,m.d,g.map||'',matchId,univW,univL,'조별리그');
    });
  });
  save();cm('grpMatchModal');render();
}

/* ══════════════════════════════════════
   브라켓 경기 상세 입력
══════════════════════════════════════ */
function getBktMatch(tnId,rnd,mi){
  const tn=tourneys.find(t=>t.id===tnId);if(!tn)return null;
  const br=getBracket(tn);
  if(rnd===-1){
    // 수동 추가 경기 (manualMatches 배열)
    if(!br.manualMatches)br.manualMatches=[];
    if(!br.manualMatches[mi])br.manualMatches[mi]={a:'',b:'',d:new Date().toISOString().slice(0,10),rndLabel:'',sa:null,sb:null,sets:[],_id:null};
    return br.manualMatches[mi];
  }
  if(!br.matchDetails)br.matchDetails={};
  const key=`${rnd}-${mi}`;
  if(!br.matchDetails[key])br.matchDetails[key]={a:'',b:'',d:new Date().toISOString().slice(0,10),sa:null,sb:null,sets:[],_id:null};
  return br.matchDetails[key];
}

function bktToggleDet(id,btn){
  const el=document.getElementById(id);if(!el)return;
  const open=el.style.display==='none'||!el.style.display;
  el.style.display=open?'block':'none';
  if(btn){btn.textContent=open?'🔼 닫기':'📂 상세';}
}

function openBracketMatchModal(tnId,rnd,mi,teamA,teamB){
  bracketMatchState={tnId,rnd,mi,teamA,teamB};
  const m=getBktMatch(tnId,rnd,mi);if(!m)return;
  if(!m.a&&teamA)m.a=teamA;
  if(!m.b&&teamB)m.b=teamB;
  const tn=tourneys.find(t=>t.id===tnId);if(!tn)return;
  const isManual=(rnd===-1);
  let rLabel='';
  if(isManual){
    rLabel=m.rndLabel||'토너먼트 경기';
  } else {
    const totalRounds=(()=>{const _ng=(tn.groups&&tn.groups.length>=2)?tn.groups.length:0;const _pc=Math.floor(_ng/2)*2;let _nr1=_pc>0?_pc:4;if(_ng%2===1)_nr1++;let r=0,x=_nr1*2;while(x>1){x=Math.ceil(x/2);r++;}return r||1;})();
    const roundLabels={1:'결승',2:'준결승',3:'8강',4:'16강',5:'32강'};
    rLabel=roundLabels[totalRounds-rnd]||((totalRounds-rnd)+'강');
  }
  const allU=getAllUnivs();
  const uOpts=`<option value="">— 대학 선택 —</option>`+allU.map(u=>`<option value="${u.name}"${m.a===u.name?' selected':''}>${u.name}</option>`).join('');
  const uOptsB=`<option value="">— 대학 선택 —</option>`+allU.map(u=>`<option value="${u.name}"${m.b===u.name?' selected':''}>${u.name}</option>`).join('');
  window._bracketMatchMode=true;
  document.getElementById('grpMatchTitle').textContent=isManual?`토너먼트 경기 입력`:`${rLabel} ${mi+1}경기 결과 입력`;
  document.getElementById('grpMatchBody').innerHTML=`
    <div style="background:var(--blue-l);border:1px solid var(--blue-ll);border-radius:10px;padding:14px;margin-bottom:16px">
      ${isManual?`<div style="margin-bottom:10px">
        <div style="font-size:11px;font-weight:700;color:var(--blue);margin-bottom:4px">⚔️ 라운드 (예: 8강, 준결승, 결승)</div>
        <input type="text" id="gm-rndlabel" value="${m.rndLabel||''}" placeholder="라운드명 입력 (예: 준결승)" style="width:100%;padding:6px 10px;border:1px solid var(--border2);border-radius:7px;font-size:13px">
      </div>`:''}
      <div style="display:flex;gap:12px;flex-wrap:wrap;align-items:flex-start">
        <div style="flex:1;min-width:130px">
          <div style="font-size:11px;font-weight:700;color:var(--blue);margin-bottom:4px">🔵 팀 A</div>
          <select id="gm-a" onchange="bktRefreshSets();" style="width:100%">${uOpts}</select>
        </div>
        <div style="font-size:16px;font-weight:800;color:var(--gray-l);padding-top:22px">VS</div>
        <div style="flex:1;min-width:130px">
          <div style="font-size:11px;font-weight:700;color:var(--red);margin-bottom:4px">🔴 팀 B</div>
          <select id="gm-b" onchange="bktRefreshSets();" style="width:100%">${uOptsB}</select>
        </div>
        <div>
          <div style="font-size:11px;font-weight:700;color:var(--gray-l);margin-bottom:4px">📅 날짜</div>
          <input type="date" id="gm-date" value="${m.d||new Date().toISOString().slice(0,10)}" style="width:145px">
        </div>
      </div>
    </div>
    <div id="gm-sets"></div>
    <div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap;align-items:center">
      <button class="btn btn-b btn-sm" onclick="bktAddSet()">+ 1세트</button>
      <button class="btn btn-w btn-sm" onclick="bktAddSet2()">+ 2세트</button>
      <button class="btn btn-w btn-sm" onclick="bktAddSet3()">🎯 에이스전</button>
      <button class="btn btn-p btn-sm" onclick="openBktPasteModal()">📋 붙여넣기</button>
      <select id="gm-match-mode" style="padding:4px 8px;border-radius:6px;border:1px solid var(--border2);font-size:12px;font-weight:700" title="경기방식">
        <option value="set">세트제</option>
        <option value="game">게임수 합산</option>
      </select>
      <button class="btn btn-g btn-sm" style="margin-left:auto" onclick="bktSaveMatch()">✅ 저장</button>
      <button class="btn btn-w btn-sm" onclick="cm('grpMatchModal')">취소</button>
    </div>`;
  om('grpMatchModal');
  bktRefreshSets();
}

function bktRefreshSets(){
  const {tnId,rnd,mi}=bracketMatchState;
  const m=getBktMatch(tnId,rnd,mi);if(!m)return;
  const aEl=document.getElementById('gm-a');const bEl=document.getElementById('gm-b');
  if(!aEl)return;
  const teamA=aEl.value,teamB=bEl?bEl.value:'';
  const tfs=window._grpTierFilters||[];
  const mA=players.filter(p=>p.univ===teamA&&(tfs.length===0||tfs.includes(p.tier)));
  const mB=players.filter(p=>p.univ===teamB&&(tfs.length===0||tfs.includes(p.tier)));
  const tfLabel=tfs.length?` [${tfs.join('+')}]`:'';
  const optsA=`<option value="">A팀 선수${tfLabel}</option>`+mA.map(p=>`<option value="${p.name}">${p.name} [${p.tier||'-'}/${p.race||'-'}]</option>`).join('');
  const optsB=`<option value="">B팀 선수${tfLabel}</option>`+mB.map(p=>`<option value="${p.name}">${p.name} [${p.tier||'-'}/${p.race||'-'}]</option>`).join('');
  const setsEl=document.getElementById('gm-sets');if(!setsEl)return;
  if(!m.sets||!m.sets.length){setsEl.innerHTML='<div style="color:var(--gray-l);font-size:12px;margin:12px 0;padding:14px;background:var(--surface);border-radius:8px;text-align:center">세트를 추가하세요 ↓</div>';return;}
  let h='';
  m.sets.forEach((set,si)=>{
    const lbl=si===2?'🎯 에이스전':`${si+1}세트`;
    const sA=set.scoreA||0,sB=set.scoreB||0;
    h+=`<div class="set-block${si===2?' ace':''}">
      <div class="set-title">
        <span class="set-badge${si===2?' ace':''}">${lbl}</span>
        <span style="font-size:12px;color:var(--gray-l)">경기 ${(set.games||[]).length}개 · <span class="${sA>sB?'wt':''}">${sA}</span>:<span class="${sB>sA?'wt':''}">${sB}</span></span>
        <button class="btn btn-r btn-xs" onclick="bktDelSet(${si})">세트 삭제</button>
      </div>`;
    (set.games||[]).forEach((g,gi2)=>{
      const mapOpts=maps.map(mp=>`<option value="${mp}"${g.map===mp?' selected':''}>${mp}</option>`).join('');
      const selA=optsA.replace(`value="${g.playerA}"`,`value="${g.playerA}" selected`);
      const selB=optsB.replace(`value="${g.playerB}"`,`value="${g.playerB}" selected`);
      h+=`<div class="game-row">
        <span style="font-size:11px;font-weight:700;color:var(--gray-l);min-width:40px">경기${gi2+1}</span>
        <select onchange="bktSetGame(${si},${gi2},'playerA',this.value)">${selA}</select>
        <span style="font-size:11px;color:var(--gray-l)">vs</span>
        <select onchange="bktSetGame(${si},${gi2},'playerB',this.value)">${selB}</select>
        <select onchange="bktSetGame(${si},${gi2},'map',this.value)" style="max-width:100px"><option value="">맵</option>${mapOpts}</select>
        <button class="win-btn ${g.winner==='A'?'win-sel':''}" onclick="bktSetGame(${si},${gi2},'winner','A');bktRefreshSets()">A 승</button>
        <button class="win-btn ${g.winner==='B'?'lose-sel':''}" onclick="bktSetGame(${si},${gi2},'winner','B');bktRefreshSets()">B 승</button>
        <button class="btn btn-r btn-xs" onclick="bktDelGame(${si},${gi2})">🗑️</button>
      </div>`;
    });
    h+=`<button class="btn btn-w btn-sm" onclick="bktAddGame(${si})">+ 경기 추가</button></div>`;
  });
  setsEl.innerHTML=h;
}

function bktSetGame(si,gi,field,val){
  const m=getBktMatch(bracketMatchState.tnId,bracketMatchState.rnd,bracketMatchState.mi);if(!m)return;
  if(m.sets[si]&&m.sets[si].games[gi])m.sets[si].games[gi][field]=val;
}
function bktAddSet(){
  const m=getBktMatch(bracketMatchState.tnId,bracketMatchState.rnd,bracketMatchState.mi);if(!m)return;if(!m.sets)m.sets=[];
  if(m.sets.length>=3){alert('최대 3세트(에이스전 포함)까지 가능합니다.');return;}
  m.sets.push({games:[{playerA:'',playerB:'',winner:'',map:''}],scoreA:0,scoreB:0,winner:''});bktRefreshSets();
}
function bktAddSet2(){
  const m=getBktMatch(bracketMatchState.tnId,bracketMatchState.rnd,bracketMatchState.mi);if(!m)return;if(!m.sets)m.sets=[];
  if(m.sets.length>=3){alert('이미 최대 세트입니다.');return;}
  if(m.sets.length<1)m.sets.push({games:[{playerA:'',playerB:'',winner:'',map:''}],scoreA:0,scoreB:0,winner:''});
  if(m.sets.length<2)m.sets.push({games:[{playerA:'',playerB:'',winner:'',map:''}],scoreA:0,scoreB:0,winner:''});
  bktRefreshSets();
}
function bktAddSet3(){
  const m=getBktMatch(bracketMatchState.tnId,bracketMatchState.rnd,bracketMatchState.mi);if(!m)return;if(!m.sets)m.sets=[];
  if(m.sets.length>=3){alert('에이스전이 이미 있습니다.');return;}
  while(m.sets.length<3)m.sets.push({games:[{playerA:'',playerB:'',winner:'',map:''}],scoreA:0,scoreB:0,winner:''});
  bktRefreshSets();
}
function bktDelSet(si){
  const m=getBktMatch(bracketMatchState.tnId,bracketMatchState.rnd,bracketMatchState.mi);if(!m)return;
  m.sets.splice(si,1);bktRefreshSets();
}
function bktAddGame(si){
  const m=getBktMatch(bracketMatchState.tnId,bracketMatchState.rnd,bracketMatchState.mi);if(!m)return;
  if(!m.sets||!m.sets[si])return;
  if(!m.sets[si].games)m.sets[si].games=[];
  m.sets[si].games.push({playerA:'',playerB:'',winner:'',map:''});bktRefreshSets();
}
function bktDelGame(si,gi2){
  const m=getBktMatch(bracketMatchState.tnId,bracketMatchState.rnd,bracketMatchState.mi);if(!m)return;
  if(!m.sets||!m.sets[si]||!m.sets[si].games)return;
  m.sets[si].games.splice(gi2,1);bktRefreshSets();
}

function bktSaveMatch(){
  const {tnId,rnd,mi}=bracketMatchState;
  const m=getBktMatch(tnId,rnd,mi);if(!m)return;
  m.d=document.getElementById('gm-date')?.value||new Date().toISOString().slice(0,10);
  m.a=document.getElementById('gm-a')?.value||'';
  m.b=document.getElementById('gm-b')?.value||'';
  if(!m.a||!m.b){alert('두 팀을 선택하세요.');return;}
  if(rnd===-1){
    const rl=document.getElementById('gm-rndlabel');
    if(rl)m.rndLabel=rl.value.trim()||'토너먼트 경기';
  }
  if(m._id)revertMatchRecord({...m,_id:m._id});
  const matchId=genId();m._id=matchId;
  let sa=0,sb=0;
  (m.sets||[]).forEach(set=>{
    let sA=0,sB=0;
    (set.games||[]).forEach(g=>{if(g.winner==='A')sA++;else if(g.winner==='B')sB++;});
    set.scoreA=sA;set.scoreB=sB;set.winner=sA>sB?'A':sB>sA?'B':'';
    if(set.winner==='A')sa++;else if(set.winner==='B')sb++;
  });
  // 경기방식: game=게임수합산, set=세트수(기본)
  const _bktMode = document.getElementById('gm-match-mode')?.value||'set';
  if(_bktMode==='game'){
    sa=(m.sets||[]).reduce((s,st)=>s+(st.scoreA||0),0);
    sb=(m.sets||[]).reduce((s,st)=>s+(st.scoreB||0),0);
  }
  m.sa=sa;m.sb=sb;
  // 브라켓 승자 자동 업데이트 (수동 추가 경기는 스킵)
  const tn=tourneys.find(t=>t.id===tnId);
  if(tn&&rnd!==-1){
    const br=getBracket(tn);
    const w=sa>sb?m.a:sb>sa?m.b:'';
    if(w)br.winners[`${rnd}-${mi}`]=w;
  }
  (m.sets||[]).forEach(set=>{
    (set.games||[]).forEach(g=>{
      if(!g.playerA||!g.playerB||!g.winner)return;
      const wn=g.winner==='A'?g.playerA:g.playerB;const ln=g.winner==='A'?g.playerB:g.playerA;
      const univW=g.winner==='A'?(m.a||''):(m.b||'');
      const univL=g.winner==='A'?(m.b||''):(m.a||'');
      applyGameResult(wn,ln,m.d,g.map||'',matchId,univW,univL,'대회');
    });
  });
  window._bracketMatchMode=false;
  save();cm('grpMatchModal');render();
}

function openBktShareCard(tnId,rnd,mi){
  const m=getBktMatch(tnId,rnd,mi);if(!m||m.sa==null)return;
  const tn=tourneys.find(t=>t.id===tnId);if(!tn)return;
  window._shareMatchObj={a:m.a||'',b:m.b||'',sa:m.sa,sb:m.sb,d:m.d||'',n:tn.name,sets:m.sets||[]};
  _shareMode='match';
  if(typeof openShareCardModal==='function'){openShareCardModal();setTimeout(()=>renderShareCardByMatchObj(window._shareMatchObj),80);}
}
