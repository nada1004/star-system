/* ══════════════════════════════════════
   대회 (조별리그 + 조편성 관리 + 대진표 + 개인순위)
══════════════════════════════════════ */
let leagueFilterDate='';
let leagueFilterGrp='';
let grpRankFilter='';
let grpSub='list';
let grpEditId=null;
let grpMatchState={tnId:null,gi:null,mi:null};
let bracketMatchState={tnId:null,rnd:null,mi:null,teamA:'',teamB:''};

function getCurrentTourney(){
  return tourneys.find(t=>t.name===curComp)||tourneys[0]||null;
}

function rComp(C,T){
  T.innerText='🎖️ 대회';
  if(!isLoggedIn && compSub==='grpedit') compSub='league';

  const tn=getCurrentTourney();
  const tnType=tn?tn.type||'league':'league'; // 'league' or 'tier'

  let h=`<div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;flex-wrap:wrap;padding:12px 16px;background:var(--gold-bg);border:1px solid var(--gold-b);border-radius:10px">
    <span style="font-weight:700;color:var(--gold);white-space:nowrap">🎖️ 대회 선택:</span>
    <select style="flex:1;max-width:220px;font-weight:700" onchange="curComp=this.value;leagueFilterDate='';leagueFilterGrp='';grpRankFilter='';save();render()">
      <option value="">— 대회를 선택하세요 —</option>
      ${tourneys.map(t=>`<option value="${t.name}"${curComp===t.name?' selected':''}>${t.name}${t.type==='tier'?' 🎯':''}</option>`).join('')}
    </select>
    ${isLoggedIn?`<button class="btn btn-b btn-xs" onclick="grpNewLeagueTourney()">+ 일반 대회</button><button class="btn btn-p btn-xs" onclick="grpNewTierTourney()">+ 티어 대회</button>`:''}
    ${tn&&isLoggedIn?`<button class="btn btn-w btn-xs" onclick="grpRenameTourney()" title="대회명 수정">✏️ 이름수정</button><button class="btn btn-r btn-xs" onclick="grpDelCurTourney()" title="현재 대회 삭제">🗑️ 삭제</button>`:''}
    ${tn?`<span style="font-size:11px;color:var(--gray-l)">${tnType==='tier'?'🎯 티어대회':('🏆 '+tn.groups.length+'개 조 · '+tn.groups.reduce((s,g)=>s+(g.matches||[]).length,0)+'경기')}</span>`:''}
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
      {id:'tour',lbl:'⚔️ 대진표'},
      {id:'comprank',lbl:'🏅 개인 순위'},
      ...(isLoggedIn?[{id:'grpedit',lbl:'🏗️ 조편성 관리'},{id:'input',lbl:'📝 경기 입력'}]:[]),
    ];
    if(compSub==='tiertour') compSub='league';
  }
  h+=`<div class="stabs no-export">${subOpts.map(o=>`<button class="stab ${compSub===o.id?'on':''}" onclick="compSub='${o.id}';render()">${o.lbl}</button>`).join('')}</div>`;

  if(!tn && compSub!=='grpedit'){
    h+=`<div style="padding:60px 20px;text-align:center;background:var(--surface);border-radius:12px;border:2px dashed var(--border2)">
      <div style="font-size:44px;margin-bottom:14px">🏆</div>
      <div style="font-size:16px;font-weight:700;margin-bottom:8px">등록된 대회가 없습니다</div>
      <div style="color:var(--gray-l);margin-bottom:20px">새 대회를 만들어 조편성을 시작하세요.</div>
      ${isLoggedIn?`<button class="btn btn-b" onclick="grpNewLeagueTourney()">+ 일반 대회 만들기</button> <button class="btn btn-p" onclick="grpNewTierTourney()">+ 티어 대회 만들기</button>`:''}
    </div>`;
    C.innerHTML=h; return;
  }

  if(compSub==='league') h+=rCompLeague(tn);
  else if(compSub==='grprank') h+=rCompGrpRankFull(tn);
  else if(compSub==='tour') h+=rCompTour();
  else if(compSub==='comprank') h+=rCompPlayerRank(tn);
  else if(compSub==='grpedit') h+=rCompGrpEdit();
  else if(compSub==='tiertour') h+=rTierTour();
  else if(compSub==='input') h+=`<div class="match-builder"><h3>🎖️ 대회 경기 결과 입력</h3>
    <div style="margin-bottom:12px"><button class="btn btn-p btn-sm" onclick="openCompPasteModal()" style="display:inline-flex;align-items:center;gap:5px">📋 결과 붙여넣기 일괄 입력</button><span style="font-size:11px;color:var(--gray-l);margin-left:8px">텍스트 붙여넣기 지원</span></div>
    <div style="font-size:12px;color:var(--gray-l);padding:16px;text-align:center;border:1.5px dashed var(--border);border-radius:10px">붙여넣기 버튼으로 경기 결과를 일괄 입력하세요</div></div>`;
  C.innerHTML=h;
}

function rCompLeague(tn){
  if(!tn) return `<div style="padding:30px;text-align:center;color:var(--gray-l)">대회를 선택하세요.</div>`;
  const allMatches=[];
  tn.groups.forEach((grp,gi)=>{
    const gl='ABCDEFGHIJ'[gi]||gi;
    const col=['#2563eb','#dc2626','#16a34a','#d97706','#7c3aed','#0891b2'][gi%6];
    (grp.matches||[]).forEach((m,mi)=>{
      allMatches.push({...m,grpName:grp.name,grpIdx:gi,grpLetter:gl,matchNum:mi+1,grpColor:col});
    });
  });
  allMatches.sort((a,b)=>(a.d||'9999').localeCompare(b.d||'9999'));
  const dates=[...new Set(allMatches.map(m=>m.d).filter(Boolean))].sort();
  let h=`<div style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:15px;color:var(--blue);margin-bottom:12px">🏆 ${tn.name}</div>`;
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
  Object.keys(byDate).sort().forEach(date=>{
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
          ${isDone?`<span style="background:linear-gradient(135deg,#dcfce7,#bbf7d0);color:#16a34a;font-size:10px;font-weight:700;padding:2px 8px;border-radius:10px;border:1px solid #86efac">✓ 완료</span>`:`<span style="background:#f1f5f9;color:var(--gray-l);font-size:10px;padding:2px 8px;border-radius:10px;border:1px solid var(--border)">예정</span>`}
        </div>
        <div style="flex:1;display:flex;align-items:center;gap:10px;justify-content:center;flex-wrap:wrap">
          <div style="text-align:center;min-width:100px">
            <div style="display:flex;align-items:center;justify-content:center;gap:7px;background:${ca||'#888'};padding:10px 16px;border-radius:12px;cursor:pointer;transition:.15s;${aWin?'box-shadow:0 0 0 3px #fff,0 0 0 5px '+ca+',0 6px 18px '+ca+'66':isDone?'opacity:.5;filter:saturate(0.6)':''}" onclick="openUnivModal('${m.a||''}')">
              ${(()=>{const url=UNIV_ICONS[m.a]||(univCfg.find(x=>x.name===m.a)||{}).icon||'';return url?`<img src="${url}" style="width:28px;height:28px;object-fit:contain;border-radius:5px;flex-shrink:0" onerror="this.style.display='none'">`:`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white' width='24' height='24'><path d='M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z'/></svg>`;})()}
              <span style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:14px;color:#fff">${m.a||'—'}</span>
            </div>
          </div>
          <div style="text-align:center;min-width:80px">
            ${isDone?`<div class="grp-match-score score-click" style="cursor:pointer;padding:6px 14px;background:var(--white);border-radius:12px;border:1.5px solid var(--border);box-shadow:0 2px 8px rgba(0,0,0,.08)" onclick="leagueToggleDet('${detId}',document.getElementById('detbtn-${detId}'))"><span style="color:${aWin?'#16a34a':bWin?'#dc2626':'var(--text)'}">${m.sa}</span><span style="color:var(--gray-l);font-size:14px;margin:0 3px">:</span><span style="color:${bWin?'#16a34a':aWin?'#dc2626':'var(--text)'}">${m.sb}</span></div>
            <div style="display:flex;align-items:center;justify-content:center;gap:4px;margin-top:5px">${(()=>{const winTeam=aWin?m.a:bWin?m.b:'';if(!winTeam)return '<span style="font-size:10px;color:var(--gray-l)">무승부</span>';const url=UNIV_ICONS[winTeam]||(univCfg.find(x=>x.name===winTeam)||{}).icon||'';return url?`<img src="${url}" style="width:18px;height:18px;object-fit:contain;border-radius:3px" onerror="this.style.display='none'"><span style="font-size:10px;font-weight:700;color:${aWin?ca:cb}">${winTeam} 승</span>`:`<span style="font-size:10px;font-weight:700;color:${aWin?ca:cb}">${winTeam} 승</span>`;})()}</div>
            ${isDone?`<button id="detbtn-${detId}" class="btn-detail" style="margin-top:4px;font-size:10px" onclick="leagueToggleDet('${detId}',this)">📂 상세</button>`:''}
            `:`<div style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:22px;color:${m.grpColor};text-shadow:0 1px 8px ${m.grpColor}44">VS</div>`}
          </div>
          <div style="text-align:center;min-width:100px">
            <div style="display:flex;align-items:center;justify-content:center;gap:7px;background:${cb||'#888'};padding:10px 16px;border-radius:12px;cursor:pointer;transition:.15s;${bWin?'box-shadow:0 0 0 3px #fff,0 0 0 5px '+cb+',0 6px 18px '+cb+'66':isDone?'opacity:.5;filter:saturate(0.6)':''}" onclick="openUnivModal('${m.b||''}')">
              ${(()=>{const url=UNIV_ICONS[m.b]||(univCfg.find(x=>x.name===m.b)||{}).icon||'';return url?`<img src="${url}" style="width:28px;height:28px;object-fit:contain;border-radius:5px;flex-shrink:0" onerror="this.style.display='none'">`:`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white' width='24' height='24'><path d='M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z'/></svg>`;})()}
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
        ${isDone?`<div style="margin-top:10px;padding-top:10px;border-top:1px solid var(--border);display:flex;gap:6px;align-items:center;flex-wrap:wrap" class="no-export">
          <button class="btn-capture btn-xs" onclick="captureDetail('${detId}','대회_${(m.d||'match').replace(/\//g,'-')}')">📷 이미지 저장</button>
          <button class="btn btn-p btn-xs" onclick="openCompMatchShareCard('${tn.id}',${m.grpIdx},${m.matchNum-1})">🎴 공유 카드</button>
        </div>`:''}
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

function rCompTour(){
  const tn=getCurrentTourney();
  if(tn){
    return `<div>
      ${rCompTourDynamic(tn)}
      ${rBracketSchedule(tn)}
    </div>`;
  }
  // fallback: tourney 없을 때 기존 수동 8강 (레거시)
  const allU=getAllUnivs();
  function teamBox(idx,label){
    const v=tourD[idx]||'';const col=v?gc(v):'';
    return `<div class="mteam ${v?'set':''}" style="${v?`background:${col}18;border-color:${col};color:${col};font-weight:800`:'color:#94a3b8'}">` + (v||label) + `</div>`;
  }
  function mCard(label,i1,i2,no){
    const v1=tourD[i1]||'',v2=tourD[i2]||'';
    const c1=v1?gc(v1):'',c2=v2?gc(v2):'';
    const selHtml=isLoggedIn?`<div class="msel-wrap no-export" style="margin-top:6px;display:flex;flex-direction:column;gap:4px">
      <select class="msel" onchange="upTour(${i1},this.value)" style="border-left:3px solid ${c1||'var(--border2)'};font-weight:${v1?'700':'400'}">
        <option value="">팀A 선택...</option>
        ${allU.map(u=>`<option value="${u.name}"${v1===u.name?' selected':''}>${u.name}</option>`).join('')}
      </select>
      <select class="msel" onchange="upTour(${i2},this.value)" style="border-left:3px solid ${c2||'var(--border2)'};font-weight:${v2?'700':'400'}">
        <option value="">팀B 선택...</option>
        ${allU.map(u=>`<option value="${u.name}"${v2===u.name?' selected':''}>${u.name}</option>`).join('')}
      </select>
    </div>`:'';
    return `<div class="mcard" style="${(v1||v2)?'border-color:var(--blue-ll)':''}">
      <div class="mcard-lbl">${label} · ${no}</div>
      ${teamBox(i1,'미확정')}<div class="mvs">VS</div>${teamBox(i2,'미확정')}
      ${selHtml}
    </div>`;
  }
  const champ=tourD[14]||''; const cc=champ?gc(champ):'';
  const champSel=isLoggedIn?`<select class="msel no-export" style="margin-top:10px" onchange="upTour(14,this.value)"><option value="">챔피언...</option>${allU.map(u=>`<option value="${u.name}"${champ===u.name?' selected':''}>${u.name}</option>`).join('')}</select>`:'';
  return `<div style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:14px;color:var(--blue);margin-bottom:12px">⚔️ 토너먼트 대진표 — 각 조 상위 2팀</div>
  <div class="tour-wrap"><div class="tour-inner">
    <div class="rcol" style="height:480px"><div class="rcol-lbl">8강 QUARTER</div>${mCard('8강',0,1,1)}${mCard('8강',2,3,2)}${mCard('8강',4,5,3)}${mCard('8강',6,7,4)}</div>
    <div class="conn"><div class="conn-line"></div></div>
    <div class="rcol" style="height:340px"><div class="rcol-lbl">4강 SEMI</div>${mCard('4강',8,9,1)}${mCard('4강',10,11,2)}</div>
    <div class="conn"><div class="conn-line"></div></div>
    <div class="rcol" style="height:200px"><div class="rcol-lbl">🏆 결승 FINAL</div>${mCard('결승',12,13,1)}</div>
    <div class="conn"><div class="conn-line"></div></div>
    <div class="champ-col" style="height:200px"><div class="champ-lbl2">🏆 CHAMPION</div>
      <div class="champ-box"><span class="champ-star">✦ ✦ ✦</span><div class="champ-lbl">CHAMPION</div>
        <div class="champ-team" style="${cc?`background:${cc}18;border-color:${cc};color:${cc}`:''}">` + (champ||'?') + `</div>${champSel}
      </div>
    </div>
  </div></div>`;
}

/* ── 토너먼트 경기 일정 (브라켓 아래) ── */
function rBracketSchedule(tn){
  if(!tn)return '';
  const br=getBracket(tn);
  // 총 라운드 수 계산 (rCompTourDynamic과 동일 로직)
  const numGroups=tn.groups&&tn.groups.length>=2?tn.groups.length:0;
  const pairCount=Math.floor(numGroups/2)*2;
  let numR1=pairCount>0?pairCount:4;
  if(numGroups%2===1)numR1++;
  let totalRounds=0;let n=numR1;while(n>1){n=Math.ceil(n/2);totalRounds++;}
  if(totalRounds===0)totalRounds=1;
  const roundLabels={1:'결승',2:'준결승',3:'8강',4:'16강',5:'32강'};

  // 모든 브라켓 경기 수집 (라운드 역순: 16강→8강→준결승→결승)
  const matches=[];
  for(let r=0;r<totalRounds;r++){
    const matchCount=Math.ceil(numR1/Math.pow(2,r));
    const rNum=totalRounds-r;
    const rLabel=roundLabels[rNum]||(rNum+'강');
    for(let mi=0;mi<matchCount;mi++){
      // 팀 A 결정
      let teamA='',teamB='';
      if(r===0){
        teamA=br.slots[`0-${mi}-a`]||'';
        teamB=br.slots[`0-${mi}-b`]||'';
        // 슬롯 없으면 자동 배치 값 사용 (그룹 순위)
        if(!teamA||!teamB){
          // grpRanks 없이 간단히 빈 값으로 둠 (슬롯만)
        }
      } else {
        teamA=br.slots[`${r}-${mi}-a`]||br.winners[`${r-1}-${mi*2}`]||'';
        teamB=br.slots[`${r}-${mi}-b`]||br.winners[`${r-1}-${mi*2+1}`]||'';
      }
      const mDetail=br.matchDetails&&br.matchDetails[`${r}-${mi}`];
      const mA=mDetail?.a||teamA;const mB=mDetail?.b||teamB;
      const isDone=mDetail&&mDetail.sa!=null;
      const winner=br.winners[`${r}-${mi}`]||'';
      matches.push({r,mi,rLabel,rNum,teamA:mA,teamB:mB,detail:mDetail,isDone,winner});
    }
  }

  // 완료 경기 / 예정 경기 분리
  const done=matches.filter(m=>m.isDone);
  const pending=matches.filter(m=>!m.isDone);

  function matchCard(mc){
    const {r,mi,rLabel,teamA,teamB,detail,isDone,winner}=mc;
    const ca=gc(teamA||'');const cb=gc(teamB||'');
    const aWin=isDone&&winner===teamA;const bWin=isDone&&winner===teamB;
    const sa=detail?.sa??'';const sb=detail?.sb??'';
    const detId=`bsched-det-${r}-${mi}`;
    const hasGames=detail?.sets?.some(s=>(s.games||[]).some(g=>g.playerA||g.playerB));
    return `<div class="grp-match-card" style="border-left:4px solid var(--blue);background:linear-gradient(135deg,var(--white) 0%,#eff6ff 100%);">
      <div style="display:flex;flex-direction:column;align-items:center;gap:3px;min-width:72px">
        <span class="grp-badge" style="background:var(--blue);font-size:10px">${rLabel}</span>
        <span style="font-size:10px;color:var(--gray-l);font-weight:600">${mi+1}경기</span>
        ${isDone?`<span style="background:#dcfce7;color:#16a34a;font-size:10px;font-weight:700;padding:2px 8px;border-radius:10px;border:1px solid #86efac">✓ 완료</span>`:`<span style="background:#f1f5f9;color:var(--gray-l);font-size:10px;padding:2px 8px;border-radius:10px">예정</span>`}
      </div>
      <div style="flex:1;display:flex;align-items:center;gap:10px;justify-content:center;flex-wrap:wrap">
        <div style="text-align:center;min-width:100px">
          <div style="display:flex;align-items:center;justify-content:center;gap:7px;background:${ca||'#888'};padding:10px 16px;border-radius:12px;${aWin?'box-shadow:0 0 0 3px #fff,0 0 0 5px '+ca:isDone?'opacity:.5;filter:saturate(0.6)':''}">
            <span style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:14px;color:#fff">${teamA||'미정'}</span>
          </div>
        </div>
        <div style="text-align:center;min-width:80px">
          ${isDone?`<div style="cursor:pointer;padding:6px 14px;background:var(--white);border-radius:12px;border:1.5px solid var(--border);font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:18px" onclick="bktToggleDet('${detId}',document.getElementById('detbtn-${detId}'))"><span style="color:${aWin?'#16a34a':bWin?'#dc2626':'var(--text)'}">${sa}</span><span style="color:var(--gray-l);font-size:14px;margin:0 3px">:</span><span style="color:${bWin?'#16a34a':aWin?'#dc2626':'var(--text)'}">${sb}</span></div>
          <div style="margin-top:4px;font-size:11px;font-weight:700;color:${aWin?ca:bWin?cb:'var(--gray-l)'}">${winner?winner+' 승':''}</div>
          ${isDone?`<button id="detbtn-${detId}" class="btn-detail" style="margin-top:4px;font-size:10px" onclick="bktToggleDet('${detId}',this)">📂 상세</button>`:''}
          `:`<div style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:22px;color:var(--blue)">VS</div>`}
        </div>
        <div style="text-align:center;min-width:100px">
          <div style="display:flex;align-items:center;justify-content:center;gap:7px;background:${cb||'#888'};padding:10px 16px;border-radius:12px;${bWin?'box-shadow:0 0 0 3px #fff,0 0 0 5px '+cb:isDone?'opacity:.5;filter:saturate(0.6)':''}">
            <span style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:14px;color:#fff">${teamB||'미정'}</span>
          </div>
        </div>
      </div>
      ${isLoggedIn&&teamA&&teamB?`<div class="no-export" style="display:flex;flex-direction:column;gap:4px">
        <button class="btn btn-b btn-xs" style="white-space:nowrap" onclick="openBracketMatchModal('${tn.id}',${r},${mi},'${teamA}','${teamB}')">✏️ 결과</button>
        <button class="btn btn-p btn-xs" style="white-space:nowrap" onclick="openBktSchedulePaste('${tn.id}',${r},${mi},'${teamA}','${teamB}')">📋 붙여넣기</button>
        ${isDone?`<button class="btn btn-xs" style="background:#f5f3ff;border:1px solid #7c3aed;color:#7c3aed;white-space:nowrap" onclick="openBktShareCard('${tn.id}',${r},${mi})">🎴 공유카드</button>`:''}
      </div>`:''}
      <div id="${detId}" style="display:none;width:100%;padding-top:10px;border-top:1px solid var(--border);margin-top:6px">
        ${isDone&&detail?buildDetailHTML(detail,'comp',teamA||'A팀',teamB||'B팀',ca,cb,aWin,bWin):''}
        ${isDone?`<div style="margin-top:8px;display:flex;gap:6px" class="no-export">
          <button class="btn-capture btn-xs" onclick="captureDetail('${detId}','토너먼트_${(detail?.d||'match').replace(/\//g,'-')}')">📷 이미지 저장</button>
          <button class="btn btn-p btn-xs" onclick="openBktShareCard('${tn.id}',${r},${mi})">🎴 공유 카드</button>
        </div>`:''}
      </div>
    </div>`;
  }

  let h=`<div style="margin-top:28px;border-top:2px solid var(--border);padding-top:20px">
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;flex-wrap:wrap">
      <span style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:15px;color:var(--blue)">⚔️ 토너먼트 경기 일정</span>
      ${isLoggedIn?`<button class="btn btn-p btn-sm no-export" onclick="openBktBulkPaste('${tn.id}')">📋 결과 붙여넣기</button>`:''}
    </div>`;

  if(!pending.length&&!done.length){
    h+=`<div style="padding:30px;text-align:center;color:var(--gray-l);background:var(--surface);border-radius:10px">팀이 배정되면 경기 일정이 표시됩니다.</div>`;
  } else {
    if(pending.filter(m=>m.teamA&&m.teamB).length){
      h+=`<div style="margin-bottom:16px">
        <div style="font-size:12px;font-weight:700;color:var(--gray-l);margin-bottom:8px;padding:4px 10px;background:var(--surface);border-radius:6px;display:inline-block">📅 예정 경기</div>`;
      pending.filter(m=>m.teamA&&m.teamB).forEach(m=>{h+=matchCard(m);});
      h+=`</div>`;
    }
    if(done.length){
      h+=`<div>
        <div style="font-size:12px;font-weight:700;color:var(--gray-l);margin-bottom:8px;padding:4px 10px;background:var(--surface);border-radius:6px;display:inline-block">✅ 완료 경기</div>`;
      done.forEach(m=>{h+=matchCard(m);});
      h+=`</div>`;
    }
  }
  h+=`</div>`;
  return h;
}

function openBktSchedulePaste(tnId,rnd,mi,teamA,teamB){
  bracketMatchState={tnId,rnd,mi,teamA,teamB};
  const m=getBktMatch(tnId,rnd,mi);
  if(m){if(!m.a&&teamA)m.a=teamA;if(!m.b&&teamB)m.b=teamB;}
  openBktPasteModal();
}

function openBktBulkPaste(tnId){
  // 대회 경기 전체 붙여넣기 (기존 openCompPasteModal 재활용)
  if(typeof openCompPasteModal==='function')openCompPasteModal();
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

/* ── 동적 브라켓 시각화 (수정 가능 버전) ── */
function rCompTourDynamic(tn){
  function getGrpRank(grp){
    const stat={};
    (grp.univs||[]).forEach(u=>{stat[u]={w:0,l:0,sw:0,sl:0};});
    (grp.matches||[]).forEach(m=>{
      if(!m.a||!m.b||m.sa==null||m.sb==null)return;
      if(!stat[m.a])stat[m.a]={w:0,l:0,sw:0,sl:0};
      if(!stat[m.b])stat[m.b]={w:0,l:0,sw:0,sl:0};
      if(m.sa>m.sb){stat[m.a].w++;stat[m.b].l++;}
      else if(m.sb>m.sa){stat[m.b].w++;stat[m.a].l++;}
      stat[m.a].sw+=m.sa; stat[m.a].sl+=m.sb;
      stat[m.b].sw+=m.sb; stat[m.b].sl+=m.sa;
    });
    return Object.entries(stat).map(([u,s])=>({u,w:s.w,l:s.l,sw:s.sw,sl:s.sl}))
      .sort((a,b)=>b.w-a.w||(b.sw-b.sl)-(a.sw-a.sl)||b.sw-a.sw);
  }

  const grpRanks=(tn.groups&&tn.groups.length>=2)?tn.groups.map((grp,gi)=>{
    const gl='ABCDEFGHIJ'[gi]||String(gi+1);
    const color=['#2563eb','#dc2626','#16a34a','#d97706','#7c3aed','#0891b2'][gi%6];
    const ranked=getGrpRank(grp);
    return{grpName:grp.name||('조'+gl),color,ranked};
  }):[];

  const numGroups=grpRanks.length;
  const pairCount=Math.floor(numGroups/2)*2;
  const r1teams=[]; // 1라운드 팀 목록 순서대로 (조편성 자동 배치)
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
  // 그룹 없으면 기본 4경기(8강) 수동 브라켓
  const numR1=r1teams.length>0?Math.ceil(r1teams.length/2):4;
  let bracketN=numR1; let totalRounds=0;
  let n=bracketN; while(n>1){n=Math.ceil(n/2);totalRounds++;}
  if(totalRounds===0)totalRounds=1;
  const roundLabels={1:'결승',2:'준결승',3:'8강',4:'16강',5:'32강'};

  const br=getBracket(tn);
  const allU=getAllUnivs();
  const tnId=tn.id;

  // 브라켓 전체 팀 상태 계산 (수동 override + 자동 승자 전파)
  // rounds[r][mi] = {a,b} (각각 {univ,color,...} or null)
  const rounds=[]; // rounds[0] = 1라운드
  for(let r=0;r<totalRounds;r++){
    const matchCount=Math.ceil(numR1/Math.pow(2,r));
    const pairs=[];
    for(let mi=0;mi<matchCount;mi++){
      let teamA=null,teamB=null;
      if(r===0){
        // 1라운드: 조 순위에서 기본값, 수동 override 우선
        const baseA=r1teams[mi*2]||null;
        const baseB=r1teams[mi*2+1]||null;
        const slotA=br.slots[`0-${mi}-a`];
        const slotB=br.slots[`0-${mi}-b`];
        teamA=slotA!==undefined?(slotA?{univ:slotA,color:gc(slotA)}:null):(baseA?.univ?baseA:null);
        teamB=slotB!==undefined?(slotB?{univ:slotB,color:gc(slotB)}:null):(baseB?.univ?baseB:null);
      }else{
        // 이후 라운드: 이전 라운드 승자 또는 수동 override
        const prevMiA=mi*2, prevMiB=mi*2+1;
        const autoA=br.winners[`${r-1}-${prevMiA}`]||null;
        const autoB=br.winners[`${r-1}-${prevMiB}`]||null;
        const slotA=br.slots[`${r}-${mi}-a`];
        const slotB=br.slots[`${r}-${mi}-b`];
        teamA=slotA!==undefined?(slotA?{univ:slotA,color:gc(slotA)}:null):(autoA?{univ:autoA,color:gc(autoA)}:null);
        teamB=slotB!==undefined?(slotB?{univ:slotB,color:gc(slotB)}:null):(autoB?{univ:autoB,color:gc(autoB)}:null);
      }
      pairs.push({a:teamA,b:teamB,winner:br.winners[`${r}-${mi}`]||null});
    }
    rounds.push(pairs);
  }

  function teamSlot(team,isWinner,tnId,rnd,mi,side){
    const col=team?gc(team.univ):'#94a3b8';
    const univName=team?.univ||'';
    const isTbd=!univName;
    const winMark=isWinner?'<span style="font-size:13px;margin-left:2px">✅</span>':'';

    // 편집모드면 셀렉트
    if(isLoggedIn){
      const grpBadge=team?.grpName?`<span style="background:${team.color||col};color:#fff;font-size:9px;font-weight:800;padding:1px 4px;border-radius:3px;flex-shrink:0">${team.rank}</span>`:'';
      const winMarkInner=isWinner?`<span style="font-size:11px;flex-shrink:0">✅</span>`:'';
      return `<div style="display:flex;align-items:center;gap:3px;height:38px">
        ${grpBadge}
        <select style="flex:1;height:32px;font-size:12px;font-weight:${isWinner?'800':'600'};padding:0 6px;border-radius:6px;border:${isWinner?'2px':'1px'} solid ${isWinner?col:isTbd?'#cbd5e1':col+'55'};background:${isWinner?col+'15':isTbd?'#f8fafc':'var(--white)'};color:${isWinner?col:isTbd?'#94a3b8':'var(--text)'};cursor:pointer;min-width:0"
          onchange="setBracketSlot('${tnId}',${rnd},${mi},'${side}',this.value)">
          <option value="">— 미정 —</option>
          ${allU.map(u=>`<option value="${u.name}"${univName===u.name?' selected':''}>${u.name}</option>`).join('')}
        </select>
        ${winMarkInner}
      </div>`;
    }
    return `<div style="height:38px;padding:0 8px;border-radius:6px;border:${isWinner?'2px':'1px'} solid ${isWinner?col:isTbd?'#cbd5e1':col+'55'};background:${isWinner?col+'22':isTbd?'#f8fafc':'var(--white)'};display:flex;align-items:center;gap:4px;font-size:12px;font-weight:${isWinner?'800':'600'};color:${isWinner?col:isTbd?'#94a3b8':'var(--text)'};overflow:hidden;white-space:nowrap">
      ${team?.grpName?`<span style="background:${team.color||col};color:#fff;font-size:9px;font-weight:800;padding:1px 4px;border-radius:3px;flex-shrink:0">${team.rank}</span>`:''}
      <span style="overflow:hidden;text-overflow:ellipsis;flex:1">${isTbd?'미정':univName}</span>
      ${winMark}
    </div>`;
  }

  function matchCard(pair, rLabel, rnd, mi){
    const {a,b,winner}=pair;
    const aIsWin=winner&&winner===a?.univ;
    const bIsWin=winner&&winner===b?.univ;
    const canSetWinner=isLoggedIn&&a?.univ&&b?.univ;
    const isDone=!!winner;

    // 브라켓 경기 상세 데이터
    const bktKey=`${rnd}-${mi}`;
    const bktDetail=br.matchDetails&&br.matchDetails[bktKey];
    const bktDone=bktDetail&&bktDetail.sa!=null;
    const bktSA=bktDetail?.sa??'';const bktSB=bktDetail?.sb??'';
    const hasGames=bktDetail?.sets?.some(s=>(s.games||[]).some(g=>g.playerA||g.playerB));

    // 승자 버튼
    let winBtns='';
    if(canSetWinner){
      winBtns=`<div style="display:flex;gap:4px;margin-top:5px">
        <button onclick="setBracketWinner('${tnId}',${rnd},${mi},'${a.univ}')"
          style="flex:1;padding:3px 0;border-radius:5px;border:1.5px solid ${aIsWin?gc(a.univ):'var(--border2)'};background:${aIsWin?gc(a.univ)+'22':'var(--white)'};font-size:10px;font-weight:700;color:${aIsWin?gc(a.univ):'var(--text3)'};cursor:pointer;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">
          ${aIsWin?'✅ ':''}${a.univ.length>6?a.univ.slice(0,5)+'…':a.univ} 승
        </button>
        <button onclick="setBracketWinner('${tnId}',${rnd},${mi},'${b.univ}')"
          style="flex:1;padding:3px 0;border-radius:5px;border:1.5px solid ${bIsWin?gc(b.univ):'var(--border2)'};background:${bIsWin?gc(b.univ)+'22':'var(--white)'};font-size:10px;font-weight:700;color:${bIsWin?gc(b.univ):'var(--text3)'};cursor:pointer;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">
          ${bIsWin?'✅ ':''}${b.univ.length>6?b.univ.slice(0,5)+'…':b.univ} 승
        </button>
      </div>`;
    }else if(!a?.univ||!b?.univ){
      winBtns=`<div style="font-size:9px;color:#94a3b8;text-align:center;margin-top:4px">팀 배정 후 결과 입력</div>`;
    }

    // 스코어 표시
    const scoreHTML=bktDone?`<div style="text-align:center;margin-top:4px;font-size:11px;font-weight:800;color:var(--blue)">${bktSA} : ${bktSB}</div>`:'';

    // 관리자 버튼
    const adminBtns=isLoggedIn&&a?.univ&&b?.univ?`<div style="display:flex;gap:3px;margin-top:5px;flex-wrap:wrap">
      <button onclick="openBracketMatchModal('${tnId}',${rnd},${mi},'${a.univ}','${b.univ}')" style="flex:1;padding:2px 0;border-radius:5px;border:1px solid #2563eb;background:#eff6ff;font-size:9px;font-weight:700;color:#2563eb;cursor:pointer">✏️ 경기입력</button>
      ${bktDone?`<button onclick="openBktShareCard('${tnId}',${rnd},${mi})" style="padding:2px 6px;border-radius:5px;border:1px solid #7c3aed;background:#f5f3ff;font-size:9px;font-weight:700;color:#7c3aed;cursor:pointer">🎴</button>`:''}
    </div>`:'';

    // 상세 토글 (게임 기록 있을 때만)
    const detId=`bkt-det-${rnd}-${mi}`;
    const detBtn=hasGames?`<button id="detbtn-${detId}" style="width:100%;margin-top:3px;padding:2px 0;border-radius:5px;border:1px solid var(--border);background:var(--surface);font-size:9px;color:var(--gray-l);cursor:pointer" onclick="bktToggleDet('${detId}',this)">📂 상세</button>`:'';
    const detDiv=hasGames?`<div id="${detId}" style="display:none;margin-top:4px;padding:8px;background:var(--surface);border-radius:6px;border:1px solid var(--border);font-size:10px">${buildDetailHTML(bktDetail,'comp',a?.univ||'A팀',b?.univ||'B팀',gc(a?.univ||''),gc(b?.univ||''),aIsWin,bIsWin)}</div>`:'';

    return `<div style="background:var(--white);border:${isDone?'2px':'1px'} solid ${isDone?'var(--blue)':'var(--border)'};border-radius:10px;padding:8px 10px;min-width:190px;max-width:210px;box-shadow:${isDone?'0 2px 10px rgba(37,99,235,.12)':'0 1px 4px rgba(0,0,0,.06)'}">
      <div style="font-size:9px;color:${isDone?'var(--blue)':'var(--gray-l)'};font-weight:700;margin-bottom:5px;text-align:center;letter-spacing:.5px">${rLabel} ${mi+1}경기${isDone?' ✓':''}</div>
      ${teamSlot(a,aIsWin,tnId,rnd,mi,'a')}
      <div style="text-align:center;font-size:9px;color:var(--gray-l);font-weight:700;margin:3px 0">VS</div>
      ${teamSlot(b,bIsWin,tnId,rnd,mi,'b')}
      ${scoreHTML}
      ${winBtns}
      ${adminBtns}
      ${detBtn}
      ${detDiv}
    </div>`;
  }

  let allRoundsHTML='';
  for(let r=0;r<totalRounds;r++){
    const rNum=totalRounds-r;
    const rLabel=roundLabels[rNum]||(rNum+'강');
    const pairs=rounds[r];
    const colH=pairs.length>1?`${pairs.length*110+pairs.length*14}px`:'auto';
    allRoundsHTML+=`<div style="display:flex;flex-direction:column;justify-content:space-around;gap:14px;min-width:200px;padding-top:28px;align-items:center">
      <div style="font-size:11px;font-weight:800;color:var(--blue);text-align:center;letter-spacing:.5px;white-space:nowrap;width:100%">${rLabel}</div>
      ${pairs.map((p,mi)=>matchCard(p,rLabel,r,mi)).join('')}
    </div>`;
    if(r<totalRounds-1){
      const connH=Math.max(1,pairs.length);
      allRoundsHTML+=`<div style="display:flex;flex-direction:column;justify-content:space-around;min-width:28px;padding-top:52px;gap:${connH>1?Math.floor(100/connH):0}px">
        ${pairs.map(()=>'<div style="height:2px;background:linear-gradient(90deg,#cbd5e1,#93c5fd);min-width:28px"></div>').join('')}
      </div>`;
    }
  }

  // 챔피언 박스
  const finalPairs=rounds[totalRounds-1]||[];
  const finalWinner=finalPairs[0]?.winner||br.champ||'';
  const cc=finalWinner?gc(finalWinner):'#d97706';
  allRoundsHTML+=`<div style="display:flex;align-items:center;min-width:24px;padding-top:52px">
    <div style="height:2px;width:24px;background:linear-gradient(90deg,#93c5fd,${cc})"></div>
  </div>
  <div style="display:flex;flex-direction:column;justify-content:center;align-items:center;padding-top:28px;min-width:140px">
    <div style="font-size:10px;font-weight:800;color:#d97706;text-align:center;margin-bottom:8px;letter-spacing:2px">🏆 CHAMPION</div>
    <div style="background:${cc}15;border:2px solid ${cc};border-radius:12px;padding:14px 18px;text-align:center;min-width:130px">
      <div style="font-size:22px;margin-bottom:4px">🏆</div>
      <div style="font-weight:900;font-size:14px;color:${cc};white-space:nowrap">${finalWinner||'?'}</div>
    </div>
    ${isLoggedIn?`<select style="margin-top:7px;font-size:11px;padding:4px 7px;border:1px solid var(--border2);border-radius:6px;max-width:130px" onchange="setBracketChamp('${tnId}',this.value)">
      <option value="">챔피언 직접 지정...</option>
      ${allU.map(u=>`<option value="${u.name}"${finalWinner===u.name?' selected':''}>${u.name}</option>`).join('')}
    </select>`:''}
  </div>`;

  return `<div>
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;flex-wrap:wrap">
      <span style="font-weight:900;font-size:15px;color:var(--blue)">⚔️ ${tn.name} — 토너먼트 브라켓</span>
      ${isLoggedIn?`<button class="btn btn-w btn-xs" onclick="resetBracket('${tnId}')" title="브라켓 초기화">🔄 초기화</button>`:''}
      ${isLoggedIn?`<span style="font-size:11px;color:var(--gray-l);margin-left:4px">💡 팀 슬롯 클릭으로 변경 · 승 버튼으로 결과 입력</span>`:''}
    </div>
    <!-- 조별 순위 요약 (그룹 있는 경우만) -->
    ${grpRanks.length>0?`<div style="display:flex;flex-wrap:wrap;gap:7px;margin-bottom:14px">
      ${grpRanks.map(g=>`<div style="background:${g.color}10;border:1px solid ${g.color}44;border-radius:8px;padding:7px 11px;min-width:120px">
        <div style="font-size:11px;font-weight:800;color:${g.color};margin-bottom:5px">${g.grpName}</div>
        ${g.ranked.slice(0,2).map((s,ri)=>`<div style="display:flex;align-items:center;gap:4px;margin-bottom:2px">
          <span style="font-size:10px">${ri===0?'🥇':'🥈'}</span>
          <span style="background:${gc(s.u)};color:#fff;font-size:10px;font-weight:700;padding:1px 5px;border-radius:3px">${s.u}</span>
          <span style="font-size:9px;color:var(--gray-l)">${s.w}승${s.l}패</span>
        </div>`).join('')}
      </div>`).join('')}
    </div>`:`<div style="font-size:11px;color:var(--gray-l);margin-bottom:10px;padding:6px 10px;background:var(--surface);border-radius:6px">💡 조편성이 없습니다. 아래 드롭다운에서 직접 팀을 배치하세요.</div>`}
    <!-- 브라켓 -->
    <div style="overflow-x:auto;padding-bottom:8px">
      <div style="display:flex;align-items:center;gap:0;min-width:fit-content;padding:8px 0">
        ${allRoundsHTML}
      </div>
    </div>
  </div>`;
}

function rCompPlayerRank(tn){
  if(!tn) return `<div style="padding:30px;text-align:center;color:var(--gray-l)">대회를 선택하세요.</div>`;
  const pStats={};
  tn.groups.forEach(grp=>{
    (grp.matches||[]).forEach(m=>{
      if(m.sa==null)return;
      (m.sets||[]).forEach(set=>{
        (set.games||[]).forEach(g=>{
          if(!g.playerA||!g.playerB||!g.winner)return;
          const wn=g.winner==='A'?g.playerA:g.playerB;const ln=g.winner==='A'?g.playerB:g.playerA;
          if(!pStats[wn])pStats[wn]={w:0,l:0};if(!pStats[ln])pStats[ln]={w:0,l:0};
          pStats[wn].w++;pStats[ln].l++;
        });
      });
    });
  });
  const sorted=Object.entries(pStats).sort((a,b)=>{const da=a[1].w-a[1].l,db=b[1].w-b[1].l;return db!==da?db-da:b[1].w-a[1].w;});
  if(!sorted.length) return `<div style="padding:40px;text-align:center;color:var(--gray-l);background:var(--surface);border-radius:10px">⏳ 아직 기록된 경기 결과가 없습니다.</div>`;
  let h=`<div style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:15px;color:var(--blue);margin-bottom:14px">🏅 ${tn.name} 개인 순위</div>
  <table><thead><tr><th style="text-align:left">순위</th><th style="text-align:left">이름</th><th style="text-align:left">소속</th><th>승</th><th>패</th><th>승차</th><th>승률</th></tr></thead><tbody>`;
  sorted.forEach(([name,s],i)=>{
    const p=players.find(x=>x.name===name);const col=p?gc(p.univ):'#888';
    const tot=s.w+s.l;const wr=tot?Math.round(s.w/tot*100):0;const diff=s.w-s.l;
    h+=`<tr>
      <td style="text-align:left">${i===0?`<span class="rk1">1등</span>`:i===1?`<span class="rk2">2등</span>`:i===2?`<span class="rk3">3등</span>`:`${i+1}위`}</td>
      <td style="text-align:left"><span class="clickable-name" onclick="openPlayerModal('${name}')">${name}</span></td>
      <td style="text-align:left">${p?`<span class="ubadge" style="background:${col};font-size:11px">${p.univ}</span>`:'-'}</td>
      <td class="wt" style="font-weight:800">${s.w}</td><td class="lt" style="font-weight:800">${s.l}</td>
      <td style="font-weight:800;color:${diff>0?'var(--green)':diff<0?'var(--red)':'var(--gray-l)'}">${diff>=0?'+':''}${diff}</td>
      <td style="font-weight:700;color:${wr>=50?'var(--green)':'var(--red)'}">${tot?wr+'%':'-'}</td>
    </tr>`;
  });
  return h+`</tbody></table>`;
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
    <div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap">
      <button class="btn btn-b btn-sm" onclick="grpAddSet()">+ 1세트</button>
      <button class="btn btn-w btn-sm" onclick="grpAddSet2()">+ 2세트</button>
      <button class="btn btn-w btn-sm" onclick="grpAddSet3()">🎯 에이스전</button>
      <button class="btn btn-p btn-sm" onclick="openGrpPasteModal()">📋 붙여넣기 일괄 입력</button>
      <button class="btn btn-g btn-sm" style="margin-left:auto" onclick="grpSaveMatch()">✅ 저장 (개인전적 자동반영)</button>
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
    const lbl=si===2?'🎯 에이스전':`${si+1}세트`;
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
  const m=tn.groups[grpMatchState.gi].matches[grpMatchState.mi];if(!m.sets[si].games)m.sets[si].games=[];
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
  m.sa=sa;m.sb=sb;
  // 선수 개인 전적 자동 반영 (경기 시점 대학 저장)
  (m.sets||[]).forEach(set=>{
    (set.games||[]).forEach(g=>{
      if(!g.playerA||!g.playerB||!g.winner)return;
      const wn=g.winner==='A'?g.playerA:g.playerB;const ln=g.winner==='A'?g.playerB:g.playerA;
      const univW=g.winner==='A'?(m.a||''):(m.b||'');
      const univL=g.winner==='A'?(m.b||''):(m.a||'');
      applyGameResult(wn,ln,m.d,g.map||'',matchId,univW,univL);
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
  const totalRounds=(()=>{const n=Math.max(1,Math.ceil((tn.groups&&tn.groups.length>=2)?Math.ceil(tn.groups.length/2)*2:4));let r=0,x=n;while(x>1){x=Math.ceil(x/2);r++;}return r||1;})();
  const roundLabels={1:'결승',2:'준결승',3:'8강',4:'16강',5:'32강'};
  const rNum=totalRounds-rnd;
  const rLabel=roundLabels[rNum]||(rNum+'강');
  const allU=getAllUnivs();
  const uOpts=`<option value="">— 대학 선택 —</option>`+allU.map(u=>`<option value="${u.name}"${m.a===u.name?' selected':''}>${u.name}</option>`).join('');
  const uOptsB=`<option value="">— 대학 선택 —</option>`+allU.map(u=>`<option value="${u.name}"${m.b===u.name?' selected':''}>${u.name}</option>`).join('');
  window._bracketMatchMode=true;
  document.getElementById('grpMatchTitle').textContent=`${rLabel} ${mi+1}경기 결과 입력`;
  document.getElementById('grpMatchBody').innerHTML=`
    <div style="background:var(--blue-l);border:1px solid var(--blue-ll);border-radius:10px;padding:14px;margin-bottom:16px">
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
    <div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap">
      <button class="btn btn-b btn-sm" onclick="bktAddSet()">+ 1세트</button>
      <button class="btn btn-w btn-sm" onclick="bktAddSet2()">+ 2세트</button>
      <button class="btn btn-w btn-sm" onclick="bktAddSet3()">🎯 에이스전</button>
      <button class="btn btn-p btn-sm" onclick="openBktPasteModal()">📋 붙여넣기</button>
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
  if(!m.sets[si].games)m.sets[si].games=[];
  m.sets[si].games.push({playerA:'',playerB:'',winner:'',map:''});bktRefreshSets();
}
function bktDelGame(si,gi2){
  const m=getBktMatch(bracketMatchState.tnId,bracketMatchState.rnd,bracketMatchState.mi);if(!m)return;
  m.sets[si].games.splice(gi2,1);bktRefreshSets();
}

function bktSaveMatch(){
  const {tnId,rnd,mi}=bracketMatchState;
  const m=getBktMatch(tnId,rnd,mi);if(!m)return;
  m.d=document.getElementById('gm-date')?.value||'';
  m.a=document.getElementById('gm-a')?.value||'';
  m.b=document.getElementById('gm-b')?.value||'';
  if(!m.a||!m.b){alert('두 팀을 선택하세요.');return;}
  if(m._id)revertMatchRecord({...m,_id:m._id});
  const matchId=genId();m._id=matchId;
  let sa=0,sb=0;
  (m.sets||[]).forEach(set=>{
    let sA=0,sB=0;
    (set.games||[]).forEach(g=>{if(g.winner==='A')sA++;else if(g.winner==='B')sB++;});
    set.scoreA=sA;set.scoreB=sB;set.winner=sA>sB?'A':sB>sA?'B':'';
    if(set.winner==='A')sa++;else if(set.winner==='B')sb++;
  });
  m.sa=sa;m.sb=sb;
  // 브라켓 승자 자동 업데이트
  const tn=tourneys.find(t=>t.id===tnId);
  if(tn){
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
      applyGameResult(wn,ln,m.d,g.map||'',matchId,univW,univL);
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
