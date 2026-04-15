/* ══════════════════════════════════════
   종족 승률
══════════════════════════════════════ */
function rRace(C,T){
  T.innerText='🧬 종족별 전체 승률';
  let h='';
  if(typeof buildYearMonthFilter==='function'){
    h+=buildYearMonthFilter('race');
  }
  if(typeof raceSummaryHTML==='function'){
    h+=raceSummaryHTML();
    C.innerHTML=h;
  }
}

/* ══════════════════════════════════════
   대학별 포인트 순위
══════════════════════════════════════ */
function rUniv(C,T){
  T.innerText='🏛️ 대학별 포인트 순위';
  C.innerHTML=rUnivBodyHTML();
}

function rUnivBodyHTML(){
  const uS={};
  // 프로리그 matchId 집합 (제외용)
  const proMatchIds=new Set(proM.map(m=>m._id).filter(Boolean));
  // 대학별 기본 구조 생성
  getAllUnivs().forEach(u=>{uS[u.name]={w:0,l:0,pts:0,cnt:0};});
  // 선수 수 카운트
  players.forEach(p=>{
    if(!uS[p.univ])uS[p.univ]={w:0,l:0,pts:0,cnt:0};
    uS[p.univ].cnt++;
  });
  // 연/월 필터를 적용한 경기 결과로 승/패/포인트 집계 (프로리그 제외)
  // h.univ: 경기 시점 대학 (선수가 이후 대학 이동해도 당시 소속 대학으로 집계)
  players.forEach(p=>{
    (p.history||[]).forEach(h=>{
      if(proMatchIds.has(h.matchId)) return; // 프로리그 제외
      const d=h.date||'';
      if(typeof passDateFilter==='function' && !passDateFilter(d)) return;
      const univKey=h.univ||p.univ; // 저장된 대학 우선, 없으면 현재 대학
      if(!uS[univKey])return;
      if(h.result==='승') uS[univKey].w++;
      else if(h.result==='패') uS[univKey].l++;
    });
  });
  Object.values(uS).forEach(s=>{
    s.pts = (s.w*3)-(s.l*3);
  });
  const sorted=Object.entries(uS).filter(([,s])=>s.cnt>0).sort((a,b)=>b[1].pts-a[1].pts);
  let h='';
  if(typeof buildYearMonthFilter==='function'){
    h+=buildYearMonthFilter('univ-rank');
  }
  h+=`<table><thead><tr><th style="text-align:left">순위</th><th style="text-align:left">대학</th><th>선수 수</th><th>총 승</th><th>총 패</th><th>총 포인트</th><th>승률</th></tr></thead><tbody>`;
  if(!sorted.length)h+=`<tr><td colspan="7" style="padding:40px;color:var(--gray-l)">등록된 선수가 없습니다.</td></tr>`;
  sorted.forEach(([name,s],i)=>{
    const col=gc(name);const tot=s.w+s.l;const wr=tot?Math.round(s.w/tot*100):0;
    let rnkHTML;
    if(i===0) rnkHTML=`<span class="rk1">1등</span>`;
    else if(i===1) rnkHTML=`<span class="rk2">2등</span>`;
    else if(i===2) rnkHTML=`<span class="rk3">3등</span>`;
    else rnkHTML=`<span style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:13px">${i+1}위</span>`;
    h+=`<tr style="background:${col}08">
      <td style="text-align:left">${rnkHTML}</td>
      <td style="text-align:left"><span class="ubadge clickable-univ" style="background:${col}" onclick="openUnivModal('${name}')">${name}</span></td>
      <td style="color:var(--gray-l)">${s.cnt}명</td>
      <td class="wt" style="font-size:15px;font-weight:800">${s.w}</td>
      <td class="lt" style="font-size:15px;font-weight:800">${s.l}</td>
      <td class="${pC(s.pts)}" style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:18px">${pS(s.pts)}</td>
      <td style="font-weight:700;color:${wr>=50?'var(--green)':'var(--red)'}">${tot?wr+'%':'-'}</td>
    </tr>`;
  });
  return h+`</tbody></table>`;
}

// 종족 승률 공통 HTML (연도/월 필터 적용)
function raceSummaryHTML(){
  const proMatchIds=new Set(proM.map(m=>m._id).filter(Boolean));
  const rs={T:{w:0,l:0},Z:{w:0,l:0},P:{w:0,l:0}};
  const vs={T:{T:{w:0,l:0},Z:{w:0,l:0},P:{w:0,l:0}},Z:{T:{w:0,l:0},Z:{w:0,l:0},P:{w:0,l:0}},P:{T:{w:0,l:0},Z:{w:0,l:0},P:{w:0,l:0}}};
  players.forEach(p=>{
    const myRace=p.race;
    if(!rs[myRace])return;
    (p.history||[]).forEach(h=>{
      if(proMatchIds.has(h.matchId)) return; // 프로리그 제외
      const d=h.date||'';
      if(typeof passDateFilter==='function' && !passDateFilter(d)) return;
      if(h.result==='승') rs[myRace].w++; else rs[myRace].l++;
      if(vs[myRace]?.[h.oppRace]){
        if(h.result==='승') vs[myRace][h.oppRace].w++; else vs[myRace][h.oppRace].l++;
      }
    });
  });
  const RC={T:'#1d4ed8',Z:'#7c3aed',P:'#b45309'};
  const MAIN_RACES=['T','Z','P'];
  let h=`<div class="scards">`;
  MAIN_RACES.forEach(r=>{
    const s=rs[r];const tot=s.w+s.l;const wr=tot?Math.round(s.w/tot*100):0;
    h+=`<div class="scard" style="border-top:4px solid ${RC[r]}">
      <div class="sv" style="color:${RC[r]}">${tot?wr+'%':'-'}</div>
      <div style="margin:6px 0"><span class="rbadge r${r}">${r} ${RNAME[r]}</span></div>
      <div class="sl"><span class="wt">${s.w}승</span> · <span class="lt">${s.l}패</span></div>
    </div>`;
  });
  h+=`</div><table><thead><tr><th style="text-align:left">내 종족</th><th>vs 테란(T)</th><th>vs 저그(Z)</th><th>vs 프로토스(P)</th></tr></thead><tbody>`;
  MAIN_RACES.forEach(my=>{
    h+=`<tr><td style="text-align:left"><span class="rbadge r${my}">${my} ${RNAME[my]}</span></td>`;
    MAIN_RACES.forEach(op=>{
      const s=vs[my][op];const t=s.w+s.l;const w=t?Math.round(s.w/t*100):0;
      h+=`<td><span class="wt">${s.w}승</span> <span class="lt">${s.l}패</span>${t?` <span style="color:${w>=50?'var(--green)':'var(--red)'};font-weight:700">(${w}%)</span>`:''}`;
    });
    h+=`</tr>`;
  });
  return h+`</tbody></table>`;
}

/* ══════════════════════════════════════
   공통 세트 빌더
══════════════════════════════════════ */
function stabs(current, opts){
  return `<div class="fbar no-export" style="overflow-x:auto;flex-wrap:nowrap;-webkit-overflow-scrolling:touch;scrollbar-width:none;gap:4px;margin-bottom:6px">${opts.map(o=>{
    if(o.id==='input'&&!isLoggedIn) return '';
    return `<button class="pill ${current===o.id?'on':''}" style="flex-shrink:0;white-space:nowrap" onclick="${o.fn}">${o.lbl}</button>`;
  }).join('')}</div>`;
}

// 모든 데이터에서 연도를 자동 추출
function getYearOptions(){
  const s=new Set();
  s.add(String(new Date().getFullYear())); // 현재 연도는 항상 포함
  const flat=[
    ...(miniM||[]),...(univM||[]),...(ckM||[]),...(proM||[]),
    ...(gjM||[]),...(indM||[]),...(ttM||[]),...(comps||[])
  ];
  flat.forEach(m=>{if(m.d&&m.d.length>=4)s.add(m.d.slice(0,4));});
  // tourneys 내부 경기 날짜
  (tourneys||[]).forEach(t=>{(t.matches||[]).forEach(m=>{if(m.d&&m.d.length>=4)s.add(m.d.slice(0,4));});});
  return [...s].filter(y=>/^\d{4}$/.test(y)).sort();
}

// 공통 연도/월 필터 UI
function buildYearMonthFilter(section){
  let h=`<div class="fbar no-export" style="margin-bottom:12px;flex-wrap:wrap">
    <strong>기간</strong>`;
  ['전체',...getYearOptions()].forEach(y=>{
    const sel=(filterYear===y);
    const label=(y==='전체')?'전체':`${y}년`;
    h+=`<button class="pill ${sel?'on':''}" onclick="setFilterYear('${y}','${section}')">${label}</button>`;
  });
  h+=`<span style="font-size:11px;color:var(--gray-l);margin-left:10px">월</span>`;
  const months=['전체','01','02','03','04','05','06','07','08','09','10','11','12'];
  months.forEach(m=>{
    const sel=(filterMonth===m);
    const label=(m==='전체')?'전체':`${parseInt(m,10)}월`;
    h+=`<button class="pill ${sel?'on':''}" onclick="setFilterMonth('${m}','${section}')">${label}</button>`;
  });
  h+='</div>';
  return h;
}

function setFilterYear(y, section){
  filterYear=y;
  openDetails={};
  render();
}

function setFilterMonth(m, section){
  filterMonth=m;
  openDetails={};
  render();
}

function passDateFilter(dateStr){
  if(!dateStr)return true;
  const y=dateStr.slice(0,4);
  const m=dateStr.slice(5,7);
  if(filterYear!=='전체' && y!==filterYear)return false;
  if(filterMonth!=='전체' && m!==filterMonth)return false;
  return true;
}

function setBuilderHTML(bld, mode){
  const isCK=(mode==='ck'||mode==='pro'||mode==='tt'||mode==='gj'||mode==='ind');const isComp=(mode==='comp');
  const allU=getAllUnivs();
  const uOptsA=allU.map(u=>`<option value="${u.name}"${bld.teamA===u.name?' selected':''}>${u.name}</option>`).join('');
  const uOptsB=allU.map(u=>`<option value="${u.name}"${bld.teamB===u.name?' selected':''}>${u.name}</option>`).join('');
  let scoreA=0,scoreB=0;
  bld.sets.forEach(s=>{if(s.winner==='A')scoreA++;else if(s.winner==='B')scoreB++;});
  let h='';
  // CK 모드에서는 날짜를 buildCKInputHTML에서만 표시 (중복 방지)
  if(!isCK){
  h+=`<div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:14px;align-items:center">
    <label style="font-size:12px;font-weight:700;color:var(--blue)">날짜</label>
    <input type="date" value="${bld.date||''}" onchange="BLD['${mode}'].date=this.value" style="width:140px">`;
  if(isComp)h+=`<label style="font-size:12px;font-weight:700;color:var(--blue)">대회명</label>
    <input type="text" id="comp-name-input" value="${bld.compName||curComp||''}" placeholder="대회명" style="width:150px" onchange="BLD['comp'].compName=this.value">`;
  h+=`</div>`;
  }
  if(!isCK){
    // 종족 필터 상태 (BLD에 저장)
    const rfA=bld.raceFilterA||'';const rfB=bld.raceFilterB||'';
    h+=`<div style="display:flex;gap:14px;margin-bottom:16px;flex-wrap:wrap">
      <div style="flex:1;min-width:160px">
        <label style="font-size:12px;font-weight:700;color:var(--blue);display:block;margin-bottom:6px">🔵 ${isComp?'주최 대학 A':'팀 A 대학'}</label>
        <select onchange="BLD['${mode}'].teamA=this.value;BLD['${mode}'].raceFilterA='';BLD['${mode}'].sets=[];render()" style="width:100%">
          <option value="">대학 선택</option>${uOptsA}
        </select>
        ${bld.teamA?`<div style="margin-top:6px;display:flex;gap:4px;align-items:center;flex-wrap:wrap">
          <span class="ubadge" style="background:${gc(bld.teamA)}">${bld.teamA}</span>
          ${!isComp?`<span style="font-size:11px;color:var(--gray-l)">종족 필터:</span>
          <button class="pill ${rfA===''?'on':''}" style="padding:2px 8px;font-size:11px" onclick="BLD['${mode}'].raceFilterA='';render()">전체</button>
          <button class="pill ${rfA==='T'?'on':''}" style="padding:2px 8px;font-size:11px" onclick="BLD['${mode}'].raceFilterA='T';render()">테란</button>
          <button class="pill ${rfA==='Z'?'on':''}" style="padding:2px 8px;font-size:11px" onclick="BLD['${mode}'].raceFilterA='Z';render()">저그</button>
          <button class="pill ${rfA==='P'?'on':''}" style="padding:2px 8px;font-size:11px" onclick="BLD['${mode}'].raceFilterA='P';render()">프토</button>`:''}
        </div>`:''}
      </div>
      <div style="flex:1;min-width:160px">
        <label style="font-size:12px;font-weight:700;color:var(--red);display:block;margin-bottom:6px">🔴 ${isComp?'대결 대학 B':'팀 B 대학'}</label>
        <select onchange="BLD['${mode}'].teamB=this.value;BLD['${mode}'].raceFilterB='';BLD['${mode}'].sets=[];render()" style="width:100%">
          <option value="">대학 선택</option>${uOptsB}
        </select>
        ${bld.teamB?`<div style="margin-top:6px;display:flex;gap:4px;align-items:center;flex-wrap:wrap">
          <span class="ubadge" style="background:${gc(bld.teamB)}">${bld.teamB}</span>
          ${!isComp?`<span style="font-size:11px;color:var(--gray-l)">종족 필터:</span>
          <button class="pill ${rfB===''?'on':''}" style="padding:2px 8px;font-size:11px" onclick="BLD['${mode}'].raceFilterB='';render()">전체</button>
          <button class="pill ${rfB==='T'?'on':''}" style="padding:2px 8px;font-size:11px" onclick="BLD['${mode}'].raceFilterB='T';render()">테란</button>
          <button class="pill ${rfB==='Z'?'on':''}" style="padding:2px 8px;font-size:11px" onclick="BLD['${mode}'].raceFilterB='Z';render()">저그</button>
          <button class="pill ${rfB==='P'?'on':''}" style="padding:2px 8px;font-size:11px" onclick="BLD['${mode}'].raceFilterB='P';render()">프토</button>`:''}
        </div>`:''}
      </div>
    </div>`;
  }
  const teamA=bld.teamA||'';const teamB=bld.teamB||'';
  const rfA=bld.raceFilterA||'';const rfB=bld.raceFilterB||'';
  const rawMA=isCK?(bld.membersA||[]):getMembers(teamA);
  const rawMB=isCK?(bld.membersB||[]):getMembers(teamB);
  const mA=rfA?rawMA.filter(p=>p.race===rfA):rawMA;
  const mB=rfB?rawMB.filter(p=>p.race===rfB):rawMB;
  const canBuild=(isCK)?(rawMA.length&&rawMB.length):(teamA&&teamB);
  if(canBuild){
    const _gjLabelA = mode==='gj' ? (mA[0]?.name||'A') : '';
    const _gjLabelB = mode==='gj' ? (mB[0]?.name||'B') : '';
    const _gjDefA = mode==='gj' && mA.length===1 ? (mA[0].name||'').replace(/'/g,"\\'") : '';
    const _gjDefB = mode==='gj' && mB.length===1 ? (mB[0].name||'').replace(/'/g,"\\'") : '';
    // 입력 모드 토글: 세트 방식 / 세트 없는 방식
    const useNoSet=bld.noSetMode||false;
    h+=`<div style="display:flex;gap:6px;margin-bottom:12px;align-items:center;flex-wrap:wrap">
      <span style="font-size:12px;font-weight:600;color:var(--text3)">입력 방식:</span>
      <button class="btn btn-sm ${!useNoSet?'btn-b':'btn-w'}" onclick="BLD['${mode}'].noSetMode=false;render()">📦 세트 방식</button>
      <button class="btn btn-sm ${useNoSet?'btn-b':'btn-w'}" onclick="BLD['${mode}'].noSetMode=true;BLD['${mode}'].freeGames=BLD['${mode}'].freeGames||[];render()">📋 세트 없이 경기 추가</button>
    </div>`;
    if(useNoSet){
      const freeGames=bld.freeGames||[];
      let fgA=0,fgB=0;
      freeGames.forEach(g=>{if(g.winner==='A')fgA++;else if(g.winner==='B')fgB++;});
      const dA=bld.directSA!=null?bld.directSA:fgA;
      const dB=bld.directSB!=null?bld.directSB:fgB;
      h+=`<div class="score-board">
        <span style="font-weight:700">${mode==='gj'?_gjLabelA:(isCK?'팀A ('+mA.map(m=>m.name).join(',')+')':(teamA||'팀A'))}</span>
        <span class="score-num wt">${dA}</span>
        <span style="color:var(--gray-l);font-size:20px;font-weight:700">:</span>
        <span class="score-num lt">${dB}</span>
        <span style="font-weight:700">${mode==='gj'?_gjLabelB:(isCK?'팀B ('+mB.map(m=>m.name).join(',')+')':(teamB||'팀B'))}</span>
        <span style="font-size:11px;color:var(--gray-l);margin-left:auto">총 ${freeGames.length}경기</span>
      </div>`;
      if(mode!=='gj'){h+=`<div style="display:flex;gap:10px;align-items:center;margin-bottom:12px;flex-wrap:wrap;padding:10px 12px;background:var(--surface);border-radius:8px;border:1px solid var(--border)">
        <span style="font-size:12px;font-weight:700;color:var(--blue)">⚡ 간편 승수 입력</span>
        <span style="font-size:12px">${teamA||'팀A'}:</span>
        <input type="number" min="0" value="${bld.directSA??''}" style="width:60px" placeholder="0" oninput="BLD['${mode}'].directSA=parseInt(this.value)||0;render()">
        <span style="font-size:12px">${teamB||'팀B'}:</span>
        <input type="number" min="0" value="${bld.directSB??''}" style="width:60px" placeholder="0" oninput="BLD['${mode}'].directSB=parseInt(this.value)||0;render()">
        <span style="font-size:11px;color:var(--gray-l)">(선수 미지정 시 승수만 저장)</span>
      </div>`;}
      freeGames.forEach((g,gi)=>{
        const showTeamSize=(mode!=='gj'&&mode!=='ind');
        const curSize=showTeamSize?(g.teamSize||((Array.isArray(g.playerA)?g.playerA.length:0)||(Array.isArray(g.playerB)?g.playerB.length:0)||1)):1;
        const aSel=Array.isArray(g.playerA)?g.playerA:(g.playerA?[g.playerA]:[]);
        const bSel=Array.isArray(g.playerB)?g.playerB:(g.playerB?[g.playerB]:[]);
        const buildOpts=(list,sel)=>list.map(p=>`<option value="${p.name}"${sel===p.name?' selected':''}>${p.name}${p.gender==='F'?'♀':''} [${p.tier}/${p.race}]${isCK?' ('+p.univ+')':''}</option>`).join('');
        let aSelects='',bSelects='';
        for(let pi=0; pi<curSize; pi++){
          const selA=aSel[pi]||''; const selB=bSel[pi]||'';
          aSelects+=`<select onchange="(function(){const g=BLD['${mode}'].freeGames[${gi}];const n=(g.teamSize||1);if(n>1){if(!Array.isArray(g.playerA))g.playerA=g.playerA?[g.playerA]:[];g.playerA[${pi}]=this.value;}else{g.playerA=this.value;}})()"><option value="">A${curSize>1?pi+1:''} 선택</option>${buildOpts(mA,selA)}</select>`;
          bSelects+=`<select onchange="(function(){const g=BLD['${mode}'].freeGames[${gi}];const n=(g.teamSize||1);if(n>1){if(!Array.isArray(g.playerB))g.playerB=g.playerB?[g.playerB]:[];g.playerB[${pi}]=this.value;}else{g.playerB=this.value;}})()"><option value="">B${curSize>1?pi+1:''} 선택</option>${buildOpts(mB,selB)}</select>`;
        }
        const sizeSel=showTeamSize?`<select onchange="(function(){const g=BLD['${mode}'].freeGames[${gi}];const n=parseInt(this.value)||1;g.teamSize=n;if(n>1){if(!Array.isArray(g.playerA))g.playerA=g.playerA?[g.playerA]:[];if(!Array.isArray(g.playerB))g.playerB=g.playerB?[g.playerB]:[];g.playerA=g.playerA.slice(0,n);g.playerB=g.playerB.slice(0,n);}else{if(Array.isArray(g.playerA))g.playerA=g.playerA[0]||'';if(Array.isArray(g.playerB))g.playerB=g.playerB[0]||'';}render();})()" style="max-width:82px"><option value="1" ${curSize===1?'selected':''}>1:1</option><option value="2" ${curSize===2?'selected':''}>2:2</option><option value="3" ${curSize===3?'selected':''}>3:3</option><option value="4" ${curSize===4?'selected':''}>4:4</option></select>`:'';
        const mapOpts=maps.map(m=>`<option value="${m}"${g.map===m?' selected':''}>${m}</option>`).join('');
        h+=`<div class="game-row">
          <span style="font-size:11px;font-weight:700;color:var(--gray-l);min-width:40px">경기${gi+1}</span>
          ${sizeSel}
          ${aSelects}
          <span style="font-size:11px;color:var(--gray-l)">vs</span>
          ${bSelects}
          <select onchange="BLD['${mode}'].freeGames[${gi}].map=this.value" style="max-width:100px"><option value="">맵 선택</option>${mapOpts}</select>
          <button class="win-btn ${g.winner==='A'?'win-sel':''}" onclick="BLD['${mode}'].freeGames[${gi}].winner='A';render()">A 승</button>
          <button class="win-btn ${g.winner==='B'?'lose-sel':''}" onclick="BLD['${mode}'].freeGames[${gi}].winner='B';render()">B 승</button>
          <button class="btn btn-r btn-xs" onclick="BLD['${mode}'].freeGames.splice(${gi},1);render()">🗑️ 삭제</button>
        </div>`;
      });
      h+=`<button class="btn btn-w btn-sm" style="margin-bottom:10px" onclick="BLD['${mode}'].freeGames=BLD['${mode}'].freeGames||[];BLD['${mode}'].freeGames.push({playerA:'${mode==='gj'?_gjDefA:''}',playerB:'${mode==='gj'?_gjDefB:''}',winner:'',map:''});render()">+ 경기 추가</button>`;
      h+=`<div style="margin-top:12px;padding-top:12px;border-top:1px solid var(--border);display:flex;gap:8px;flex-wrap:wrap">
        <button class="btn btn-g" onclick="saveMatch('${mode}')">✅ 저장</button>
        <button class="btn btn-w" onclick="BLD['${mode}']=null;render()">🔄 초기화</button>
      </div>`;
    } else {
      h+=`<div class="score-board">
        <span style="font-weight:700">${mode==='gj'?_gjLabelA:(isCK?'팀A ('+mA.map(m=>m.name).join(',')+')':(teamA||'팀A'))}</span>
        <span class="score-num wt">${scoreA}</span>
        <span style="color:var(--gray-l);font-size:20px;font-weight:700">:</span>
        <span class="score-num lt">${scoreB}</span>
        <span style="font-weight:700">${mode==='gj'?_gjLabelB:(isCK?'팀B ('+mB.map(m=>m.name).join(',')+')':(teamB||'팀B'))}</span>
        <span style="font-size:11px;color:var(--gray-l);margin-left:auto">${bld.sets.length}세트</span>
      </div>`;
      bld.sets.forEach((set,si)=>{
        const isAce=(si===2);const sLabel=isAce?'🎯 에이스전':`${si+1}세트`;
        const sA=set.scoreA||0,sB=set.scoreB||0;
        h+=`<div class="set-block ${isAce?'ace':''}">
          <div class="set-title">
            <span class="set-badge ${isAce?'ace':''}">${sLabel}</span>
            <span style="font-size:12px;color:var(--gray-l)">경기 ${set.games.length}개 &nbsp;|&nbsp; <span class="${sA>sB?'wt':''}">${sA}</span>:<span class="${sB>sA?'wt':''}">${sB}</span></span>
            <button class="btn btn-r btn-xs" onclick="BLD['${mode}'].sets.splice(${si},1);render()">세트 삭제</button>
          </div>`;
        set.games.forEach((g,gi)=>{
          const showTeamSize=(mode!=='gj'&&mode!=='ind');
          const curSize=showTeamSize?(g.teamSize||((Array.isArray(g.playerA)?g.playerA.length:0)||(Array.isArray(g.playerB)?g.playerB.length:0)||1)):1;
          const aSel=Array.isArray(g.playerA)?g.playerA:(g.playerA?[g.playerA]:[]);
          const bSel=Array.isArray(g.playerB)?g.playerB:(g.playerB?[g.playerB]:[]);
          const buildOpts=(list,sel)=>list.map(p=>`<option value="${p.name}"${sel===p.name?' selected':''}>${p.name}${p.gender==='F'?'♀':''} [${p.tier}/${p.race}]${isCK?' ('+p.univ+')':''}</option>`).join('');
          let aSelects='',bSelects='';
          for(let pi=0; pi<curSize; pi++){
            const selA=aSel[pi]||''; const selB=bSel[pi]||'';
            aSelects+=`<select onchange="(function(){const g=BLD['${mode}'].sets[${si}].games[${gi}];const n=(g.teamSize||1);if(n>1){if(!Array.isArray(g.playerA))g.playerA=g.playerA?[g.playerA]:[];g.playerA[${pi}]=this.value;}else{g.playerA=this.value;}})()"><option value="">A${curSize>1?pi+1:''} 선택</option>${buildOpts(mA,selA)}</select>`;
            bSelects+=`<select onchange="(function(){const g=BLD['${mode}'].sets[${si}].games[${gi}];const n=(g.teamSize||1);if(n>1){if(!Array.isArray(g.playerB))g.playerB=g.playerB?[g.playerB]:[];g.playerB[${pi}]=this.value;}else{g.playerB=this.value;}})()"><option value="">B${curSize>1?pi+1:''} 선택</option>${buildOpts(mB,selB)}</select>`;
          }
          const sizeSel=showTeamSize?`<select onchange="(function(){const g=BLD['${mode}'].sets[${si}].games[${gi}];const n=parseInt(this.value)||1;g.teamSize=n;if(n>1){if(!Array.isArray(g.playerA))g.playerA=g.playerA?[g.playerA]:[];if(!Array.isArray(g.playerB))g.playerB=g.playerB?[g.playerB]:[];g.playerA=g.playerA.slice(0,n);g.playerB=g.playerB.slice(0,n);}else{if(Array.isArray(g.playerA))g.playerA=g.playerA[0]||'';if(Array.isArray(g.playerB))g.playerB=g.playerB[0]||'';}recalcSet('${mode}',${si});render();})()" style="max-width:82px"><option value="1" ${curSize===1?'selected':''}>1:1</option><option value="2" ${curSize===2?'selected':''}>2:2</option><option value="3" ${curSize===3?'selected':''}>3:3</option><option value="4" ${curSize===4?'selected':''}>4:4</option></select>`:'';
          const mapOpts=maps.map(m=>`<option value="${m}"${g.map===m?' selected':''}>${m}</option>`).join('');
          h+=`<div class="game-row">
            <span style="font-size:11px;font-weight:700;color:var(--gray-l);min-width:40px">경기${gi+1}</span>
            ${sizeSel}
            ${aSelects}
            <span style="font-size:11px;color:var(--gray-l)">vs</span>
            ${bSelects}
            <select onchange="BLD['${mode}'].sets[${si}].games[${gi}].map=this.value" style="max-width:100px"><option value="">맵 선택</option>${mapOpts}</select>
            <button class="win-btn ${g.winner==='A'?'win-sel':''}" onclick="BLD['${mode}'].sets[${si}].games[${gi}].winner='A';recalcSet('${mode}',${si});render()">A 승</button>
            <button class="win-btn ${g.winner==='B'?'lose-sel':''}" onclick="BLD['${mode}'].sets[${si}].games[${gi}].winner='B';recalcSet('${mode}',${si});render()">B 승</button>
            <button class="btn btn-r btn-xs" onclick="BLD['${mode}'].sets[${si}].games.splice(${gi},1);recalcSet('${mode}',${si});render()">🗑️ 삭제</button>
          </div>`;
        });
        h+=`<button class="btn btn-w btn-sm" onclick="BLD['${mode}'].sets[${si}].games.push({playerA:'${mode==='gj'?_gjDefA:''}',playerB:'${mode==='gj'?_gjDefB:''}',winner:'',map:''});render()">+ 경기 추가</button></div>`;
      });
      if(bld.sets.length<3){
        const nLabel=bld.sets.length===2?'🎯 에이스전 추가':`${bld.sets.length+1}세트 추가`;
        h+=`<button class="btn btn-b" style="margin-right:8px;margin-top:4px" onclick="BLD['${mode}'].sets.push({games:[],scoreA:0,scoreB:0,winner:''});render()">+ ${nLabel}</button>`;
      }
      h+=`<div style="margin-top:16px;padding-top:14px;border-top:1px solid var(--border);display:flex;gap:8px;flex-wrap:wrap">
        <button class="btn btn-g" onclick="saveMatch('${mode}')">✅ 저장</button>
        <button class="btn btn-w" onclick="BLD['${mode}']=null;render()">🔄 초기화</button>
      </div>`;
    }
  }
  return h;
}

function recalcSet(mode,si){
  const set=BLD[mode].sets[si];let a=0,b=0;
  set.games.forEach(g=>{if(g.winner==='A')a++;else if(g.winner==='B')b++;});
  set.scoreA=a;set.scoreB=b;set.winner=a>b?'A':b>a?'B':'';
}

function _normNames(v){
  if(Array.isArray(v)) return v.filter(Boolean);
  if(typeof v==='string' && v) return [v];
  return [];
}

function _applyTeamGameToHistory(g, date, map, baseId, univA, univB, modeLabel){
  const aList=_normNames(g.playerA);
  const bList=_normNames(g.playerB);
  const size=Math.max(aList.length||0, bList.length||0, 1);
  for(let pi=0; pi<size; pi++){
    const a=aList[pi]||aList[0]||'';
    const b=bList[pi]||bList[0]||'';
    if(!a||!b||!g.winner) continue;
    const id = size>1 ? `${baseId}_p${pi}` : baseId;
    const wName=g.winner==='A'?a:b;
    const lName=g.winner==='A'?b:a;
    const univW=g.winner==='A'?(univA||''):(univB||'');
    const univL=g.winner==='A'?(univB||''):(univA||'');
    applyGameResult(wName,lName,date,map||'-',id,univW,univL,modeLabel);
  }
}

function genId(){return Date.now().toString(36)+Math.random().toString(36).slice(2,6);}

function saveMatch(mode){
  const bld=BLD[mode];if(!bld)return;
  const isCK=(mode==='ck'||mode==='tt');const isComp=(mode==='comp');
  const _modeLabel=mode==='mini'?((typeof miniType!=='undefined'&&miniType==='civil')?'시빌워':'미니대전'):{univm:'대학대전',ck:'대학CK',pro:'프로리그',tt:'티어대회',comp:'조별리그',gj:(bld._proLabel?'프로리그끝장전':'끝장전'),ind:'개인전'}[mode]||'';
  // 세트 없는 방식 처리
  if(bld.noSetMode){
    const freeGames=bld.freeGames||[];
    const date=bld.date||new Date().toISOString().slice(0,10);
    const matchId=genId();

    if(mode==='gj'){
      const mA=bld.membersA||[];const mB=bld.membersB||[];
      if(!mA.length||!mB.length)return alert('스트리머를 선택하세요.');
      const sid=matchId;
      freeGames.forEach(g=>{
        if(!g.playerA||!g.playerB||!g.winner)return;
        const wName=g.winner==='A'?g.playerA:g.playerB;
        const lName=g.winner==='A'?g.playerB:g.playerA;
        const gameId=genId(); // 각 게임마다 고유 ID 생성
        applyGameResult(wName,lName,date,g.map||'-',gameId,'','',_modeLabel);
        gjM.unshift({_id:gameId,sid,d:date,wName,lName,map:g.map||'',matchId:sid,...(bld._proLabel?{_proLabel:true}:{})});
      });
      BLD[mode]=null;if(typeof fixPoints==='function')fixPoints();save();
      if(typeof gjSub!=='undefined') gjSub='records';
      render();
      return;
    }
    if(mode==='ind'){
      const mA=bld.membersA||[];const mB=bld.membersB||[];
      if(!mA.length||!mB.length)return alert('스트리머를 선택하세요.');
      if(!freeGames.length)return alert('경기를 1게임 이상 추가하세요.');
      const sid=matchId;
      freeGames.forEach(g=>{
        if(!g.playerA||!g.playerB||!g.winner)return;
        const wName=g.winner==='A'?g.playerA:g.playerB;
        const lName=g.winner==='A'?g.playerB:g.playerA;
        const gameId=genId(); // 각 게임마다 고유 ID 생성
        applyGameResult(wName,lName,date,g.map||'-',gameId,'','','개인전');
        if(typeof indM!=='undefined')indM.unshift({_id:gameId,sid,d:date,wName,lName,map:g.map||''});
      });
      if(typeof _indInput!=='undefined'){_indInput.playerA=mA[0]?.name||'';_indInput.playerB=mB[0]?.name||'';}
      BLD[mode]=null;if(typeof fixPoints==='function')fixPoints();save();
      if(typeof indSub!=='undefined') indSub='records';
      render();
      return;
    }

    // 각 게임에 _id 부여 (rebuildAllPlayerHistory와 ID 일치를 위해, setsSnap spread에 포함됨)
    freeGames.forEach((g,gi)=>{g._id=`${matchId}_s0_g${gi}`;});
    freeGames.forEach((g)=>{
      _applyTeamGameToHistory(g,date,g.map,g._id,bld.teamA||'',bld.teamB||'',_modeLabel);
    });

    let totalA=0,totalB=0;
    if(bld.directSA!=null||bld.directSB!=null){
      totalA=bld.directSA||0;
      totalB=bld.directSB||0;
    } else {
      freeGames.forEach(g=>{if(g.winner==='A')totalA++;else if(g.winner==='B')totalB++;});
    }
    const setsSnap=freeGames.length?[{scoreA:totalA,scoreB:totalB,winner:totalA>totalB?'A':totalB>totalA?'B':'',games:freeGames.map(g=>({...g}))}]:[];

    if(mode==='ck' || mode==='pro' || mode ==='tt'){
        const mA=bld.membersA||[];const mB=bld.membersB||[];
        if(!mA.length||!mB.length)return alert('팀 멤버를 추가하세요.');

        const univW={},univL={};
        freeGames.forEach(g=>{
            const aList=_normNames(g.playerA); const bList=_normNames(g.playerB);
            const size=Math.max(aList.length||0,bList.length||0,1);
            for(let pi=0; pi<size; pi++){
              if(!g.winner) continue;
              const a=aList[pi]||aList[0]||''; const b=bList[pi]||bList[0]||'';
              if(!a||!b) continue;
              const wName=g.winner==='A'?a:b;
              const lName=g.winner==='A'?b:a;
              const wM=(g.winner==='A'?mA:mB).find(m=>m.name===wName);
              const lM=(g.winner==='A'?mB:mA).find(m=>m.name===lName);
              if(wM){univW[wM.univ]=(univW[wM.univ]||0)+1;}
              if(lM){univL[lM.univ]=(univL[lM.univ]||0)+1;}
            }
        });

        const matchData = {_id:matchId,d:date,sa:totalA,sb:totalB, teamALabel:mode==='ck'?'A조':'A팀', teamBLabel:mode==='ck'?'B조':'B팀', teamAMembers:mA,teamBMembers:mB,sets:setsSnap, univWins:univW,univLosses:univL, noSetMode:true };

        if(mode==='ck') ckM.unshift(matchData);
        else if (mode==='pro') proM.unshift(matchData);
        else if (mode==='tt') {
            const tLabel=bld.tiers&&bld.tiers.length?bld.tiers.join('+')+'티어':'전체';
            const _ttComp=_ttCurComp||'';
            ttM.unshift({...matchData, tierLabel: tLabel, compName:_ttComp, stage:'general'});
        }
    } else {
        if(!bld.teamA||!bld.teamB)return alert('팀을 선택하세요.');
        const matchObj={_id:matchId,d:date,a:bld.teamA,b:bld.teamB,sa:totalA,sb:totalB,sets:setsSnap,noSetMode:true};
        if(mode==='mini') miniM.unshift(matchObj);
        else if(mode==='univm') univM.unshift(matchObj);
        else if(mode==='comp'){
          const cn=bld.compName||document.getElementById('comp-name-input')?.value||curComp||'';
          if(!cn)return alert('대회명을 입력하세요.');
          if(cn&&!compNames.includes(cn))compNames.push(cn);
          curComp=cn;
          comps.unshift({...matchObj,n:cn,hostUniv:bld.teamA,u:bld.teamA});
        }
    }
    
    BLD[mode]=null;if(typeof fixPoints==='function')fixPoints();save();
    if(mode==='mini')miniSub='records';
    else if(mode==='univm')univmSub='records';
    else if(mode==='ck')ckSub='records';
    else if(mode==='pro')proSub='records';
    else if(mode==='comp')compSub='records';
    else if(mode==='tt'){_ttSub='records';compSub='tiertour';}
    render();
    return;
  }
  if(!bld.sets.length)return alert('세트를 추가하세요.');
  let totalA=0,totalB=0;
  bld.sets.forEach((s,si)=>{recalcSet(mode,si);if(s.winner==='A')totalA++;else if(s.winner==='B')totalB++;});
  const date=bld.date||new Date().toISOString().slice(0,10);
  const matchId=genId();
  // 각 게임에 _id 부여 (rebuildAllPlayerHistory와 ID 일치를 위해, setsSnap spread에 포함됨)
  bld.sets.forEach((set,setIdx)=>{set.games.forEach((g,gameIdx)=>{g._id=`${matchId}_s${setIdx}_g${gameIdx}`;});});
  const setsSnap=bld.sets.map(s=>({scoreA:s.scoreA,scoreB:s.scoreB,winner:s.winner,games:s.games.map(g=>({...g}))}));
  if(mode==='gj'){
    const mA=bld.membersA||[];const mB=bld.membersB||[];
    if(!mA.length||!mB.length)return alert('스트리머를 선택하세요.');
    const sid=matchId;
    setsSnap.forEach((set, setIdx)=>{
      (set.games||[]).forEach((g, gameIdx)=>{
        if(!g.playerA||!g.playerB||!g.winner)return;
        const wName=g.winner==='A'?g.playerA:g.playerB;
        const lName=g.winner==='A'?g.playerB:g.playerA;
        const gameId=g._id||`${sid}_s${setIdx}_g${gameIdx}`;
        applyGameResult(wName,lName,date,g.map||'-',gameId,'','',_modeLabel);
        gjM.unshift({_id:gameId,sid,d:date,wName,lName,map:g.map||'',matchId:sid,...(bld._proLabel?{_proLabel:true}:{})});
      });
    });
    BLD[mode]=null;if(typeof fixPoints==='function')fixPoints();save();
    if(typeof gjSub!=='undefined') gjSub='records';
    render();
    return;
  }
  // pro 모드도 선수 개인 history에 반영 (여자 선수 포함 혼성 지원)
  bld.sets.forEach((set)=>{
    set.games.forEach((g)=>{
      _applyTeamGameToHistory(g,date,g.map,g._id,bld.teamA||'',bld.teamB||'',_modeLabel);
    });
  });
  if(mode==='mini'){
    if(!bld.teamA||!bld.teamB)return alert('팀을 선택하세요.');
    miniM.unshift({_id:matchId,d:date,a:bld.teamA,b:bld.teamB,sa:totalA,sb:totalB,sets:setsSnap,type:(typeof miniType!=='undefined'?miniType:'mini')});
  } else if(mode==='univm'){
    if(!bld.teamA||!bld.teamB)return alert('팀을 선택하세요.');
    univM.unshift({_id:matchId,d:date,a:bld.teamA,b:bld.teamB,sa:totalA,sb:totalB,sets:setsSnap});
  } else if(mode==='ck'){
    const mA=bld.membersA||[];const mB=bld.membersB||[];
    if(!mA.length||!mB.length)return alert('팀 멤버를 추가하세요.');
    const univW={},univL={};
    bld.sets.forEach(set=>{
      set.games.forEach(g=>{
        const aList=_normNames(g.playerA); const bList=_normNames(g.playerB);
        const size=Math.max(aList.length||0,bList.length||0,1);
        for(let pi=0; pi<size; pi++){
          if(!g.winner) continue;
          const a=aList[pi]||aList[0]||''; const b=bList[pi]||bList[0]||'';
          if(!a||!b) continue;
          const wName=g.winner==='A'?a:b;
          const lName=g.winner==='A'?b:a;
          const wM=(g.winner==='A'?mA:mB).find(m=>m.name===wName);
          const lM=(g.winner==='A'?mB:mA).find(m=>m.name===lName);
          if(wM){univW[wM.univ]=(univW[wM.univ]||0)+1;}
          if(lM){univL[lM.univ]=(univL[lM.univ]||0)+1;}
        }
      });
    });
    ckM.unshift({_id:matchId,d:date,sa:totalA,sb:totalB,
      teamALabel:'A조',
      teamBLabel:'B조',
      teamAMembers:mA,teamBMembers:mB,sets:setsSnap,
      univWins:univW,univLosses:univL
    });
  } else if(mode==='pro'){
    const mA=bld.membersA||[];const mB=bld.membersB||[];
    if(!mA.length||!mB.length)return alert('팀 멤버를 추가하세요.');
    const univW={},univL={};
    bld.sets.forEach(set=>{
      set.games.forEach(g=>{
        const aList=_normNames(g.playerA); const bList=_normNames(g.playerB);
        const size=Math.max(aList.length||0,bList.length||0,1);
        for(let pi=0; pi<size; pi++){
          if(!g.winner) continue;
          const a=aList[pi]||aList[0]||''; const b=bList[pi]||bList[0]||'';
          if(!a||!b) continue;
          const wName=g.winner==='A'?a:b;
          const lName=g.winner==='A'?b:a;
          const wM=(g.winner==='A'?mA:mB).find(m=>m.name===wName);
          const lM=(g.winner==='A'?mB:mA).find(m=>m.name===lName);
          if(wM){univW[wM.univ]=(univW[wM.univ]||0)+1;}
          if(lM){univL[lM.univ]=(univL[lM.univ]||0)+1;}
        }
      });
    });
    proM.unshift({_id:matchId,d:date,sa:totalA,sb:totalB,
      teamALabel:'A팀',
      teamBLabel:'B팀',
      teamAMembers:mA,teamBMembers:mB,sets:setsSnap,
      univWins:univW,univLosses:univL
    });
  } else if(mode==='comp'){
    const cn=bld.compName||document.getElementById('comp-name-input')?.value||curComp||'';
    if(!cn)return alert('대회명을 입력하세요.');
    if(!bld.teamA||!bld.teamB)return alert('대학을 선택하세요.');
    if(cn&&!compNames.includes(cn))compNames.push(cn);
    curComp=cn;
    comps.unshift({_id:matchId,d:date,n:cn,hostUniv:bld.teamA,u:bld.teamA,a:bld.teamA,b:bld.teamB,sa:totalA,sb:totalB,sets:setsSnap});
  } else if(mode==='tt'){
    const mA=bld.membersA||[];const mB=bld.membersB||[];
    if(!mA.length||!mB.length)return alert('팀 멤버를 추가하세요.');
    const tLabel=bld.tiers&&bld.tiers.length?bld.tiers.join('+')+'티어':'전체';
    ttM.unshift({_id:matchId,d:date,sa:totalA,sb:totalB,
      teamALabel:'A팀',teamBLabel:'B팀',tierLabel:tLabel,
      teamAMembers:mA,teamBMembers:mB,sets:setsSnap,
      compName:_ttCurComp||'',stage:'general'
    });
  }
  BLD[mode]=null;if(typeof fixPoints==='function')fixPoints();save();
  if(mode==='mini')miniSub='records';
  else if(mode==='univm')univmSub='records';
  else if(mode==='ck')ckSub='records';
  else if(mode==='pro')proSub='records';
  else if(mode==='comp')compSub='records';
  else if(mode==='tt'){_ttSub='records';compSub='tiertour';}
  render();
}
