/* competition-bracket-dynamic.js: extracted from competition.js */
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

/* ── 티어대회(개인전) 전용 동적 브라켓 ──
   - tn.type==='tier'
   - tn.bracket: {slots,winners,champ,matchDetails}
   - slots: "r-mi-side" → 선수명
   - winners: "r-mi" → 선수명
*/
function rTierBracketDynamic(tn){
  if(!tn) return `<div style="padding:30px;text-align:center;color:var(--gray-l)">대회를 선택하세요.</div>`;
  const br=getBracket(tn);
  const overrideSize=parseInt(tn.bracketOverrideSize||'0',10)||0;
  const numTeams = overrideSize>1 ? overrideSize : 8;
  let totalRounds=0;{let n=numTeams;while(n>1){n=Math.ceil(n/2);totalRounds++;}} if(!totalRounds) totalRounds=1;

  const slotName = (rnd,mi,side)=>{
    const k=`${rnd}-${mi}-${side}`;
    if(Object.prototype.hasOwnProperty.call(br.slots||{}, k)) return String(br.slots[k]||'');
    if(rnd<=0) return '';
    const pk=`${rnd-1}-${mi*2 + (side==='a'?0:1)}`;
    return String((br.winners||{})[pk]||'');
  };
  const matchDetail = (rnd,mi)=>{
    // matchDetails는 optional. 없으면 표시용만.
    const k=`${rnd}-${mi}`;
    return (br.matchDetails && br.matchDetails[k]) ? br.matchDetails[k] : null;
  };
  const rndLabel = (ri)=>{
    const sz = Math.pow(2, totalRounds-ri);
    if(sz===2) return '결승';
    if(sz===4) return '4강';
    if(sz===8) return '8강';
    if(sz===16) return '16강';
    if(sz===32) return '32강';
    return `${sz}강`;
  };

  let h = `<div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;flex-wrap:wrap">
    <div style="font-weight:900;font-size:15px;color:var(--blue)">🗂️ ${tn.name} 토너먼트</div>
    <span style="font-size:11px;color:var(--gray-l)">※ 티어대회(개인전) 대진표</span>
    ${isLoggedIn?`
      <div style="display:flex;align-items:center;gap:6px;margin-left:auto;flex-wrap:wrap">
        <button class="btn btn-p btn-sm" onclick="openTierBktPasteModal && openTierBktPasteModal('${tn.id}')" title="여러 경기 결과를 붙여넣어 토너먼트 기록으로 저장">📋 자동인식</button>
        <span style="font-size:11px;color:var(--gray-l);font-weight:800">강수</span>
        <select onchange="setTierBracketSize('${tn.id}', this.value)" style="border:1px solid var(--border2);border-radius:8px;padding:5px 8px;font-size:12px">
          ${[2,4,8,16,32,64].map(x=>`<option value="${x}" ${x===numTeams?'selected':''}>${x}강</option>`).join('')}
        </select>
      </div>
    `:''}
  </div>`;

  h += `<div style="overflow-x:auto;padding-bottom:14px"><div style="display:inline-flex;gap:0;align-items:flex-start;min-width:fit-content">`;
  for(let ri=0; ri<totalRounds; ri++){
    const matchCount = Math.ceil(numTeams/Math.pow(2,ri+1));
    const isLast = ri===totalRounds-1;
    const gap = ri===0?8:(Math.pow(2,ri)*60+8);
    h += `<div style="display:flex;align-items:center">
      <div style="min-width:${isLast?220:200}px;flex-shrink:0">
        <div style="text-align:center;font-size:12px;font-weight:900;color:#fff;margin-bottom:10px;padding:7px 10px;background:linear-gradient(135deg,#3b82f6,#1d4ed8);border-radius:10px;box-shadow:0 3px 8px rgba(37,99,235,.25);letter-spacing:.5px">${rndLabel(ri)}</div>
        <div style="display:flex;flex-direction:column;gap:${gap}px">`;
    for(let mi=0; mi<matchCount; mi++){
      const a = slotName(ri,mi,'a') || 'TBD';
      const b = slotName(ri,mi,'b') || 'TBD';
      const w = (br.winners||{})[`${ri}-${mi}`] || '';
      const aWin = w && w===a, bWin = w && w===b;
      const md = matchDetail(ri,mi);
      const sa = md?.sa, sb = md?.sb;
      const hasScore = (sa!=null && sb!=null);
      const _esc = s => String(s||'').replace(/'/g,"\\'");
      h += `<div style="border-radius:12px;overflow:hidden;background:var(--white);box-shadow:0 1px 6px rgba(0,0,0,.07);border:1.5px solid #e2e8f0">
        <div style="padding:9px 12px;border-bottom:1px solid #f1f5f9;background:${aWin?'#2563eb18':a==='TBD'?'#f8fafc':'#fff'};display:flex;align-items:center;gap:8px;${aWin?`border-left:3px solid #2563eb`:''};${w && !aWin?'opacity:.55':''}">
          <div style="flex:1;min-width:0">
            <div style="font-size:12px;font-weight:${aWin?'900':a==='TBD'?'400':'700'};color:${aWin?'#2563eb':a==='TBD'?'#94a3b8':'#374151'};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;cursor:${a!=='TBD'?'pointer':'default'}" onclick="${a!=='TBD'?`openPlayerModal('${String(a).replace(/'/g,"\\'")}')`:''}">${a}</div>
          </div>
          ${hasScore?`<span style="font-size:11px;font-weight:900;color:${aWin?'#2563eb':'#94a3b8'};flex-shrink:0">${sa}</span>`:''}
          ${isLoggedIn?`<button class="btn btn-xs" style="font-size:10px;padding:0 6px" onclick="(function(){const v=prompt('A 슬롯 선수명 입력(빈칸=삭제, BYE 가능)', '${_esc(a==='TBD'?'':a)}'); if(v===null)return; setBracketSlot('${tn.id}',${ri},${mi},'a', (v||'').trim()); })()">✏️</button>`:''}
        </div>
        <div style="padding:9px 12px;background:${bWin?'#2563eb18':b==='TBD'?'#f8fafc':'#fff'};display:flex;align-items:center;gap:8px;${bWin?`border-left:3px solid #2563eb`:''};${w && !bWin?'opacity:.55':''}">
          <div style="flex:1;min-width:0">
            <div style="font-size:12px;font-weight:${bWin?'900':b==='TBD'?'400':'700'};color:${bWin?'#2563eb':b==='TBD'?'#94a3b8':'#374151'};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;cursor:${b!=='TBD'?'pointer':'default'}" onclick="${b!=='TBD'?`openPlayerModal('${String(b).replace(/'/g,"\\'")}')`:''}">${b}</div>
          </div>
          ${hasScore?`<span style="font-size:11px;font-weight:900;color:${bWin?'#2563eb':'#94a3b8'};flex-shrink:0">${sb}</span>`:''}
          ${isLoggedIn?`<button class="btn btn-xs" style="font-size:10px;padding:0 6px" onclick="(function(){const v=prompt('B 슬롯 선수명 입력(빈칸=삭제, BYE 가능)', '${_esc(b==='TBD'?'':b)}'); if(v===null)return; setBracketSlot('${tn.id}',${ri},${mi},'b', (v||'').trim()); })()">✏️</button>`:''}
        </div>
        ${(md?.d||md?.map)?`<div style="padding:3px 12px;font-size:11px;font-weight:600;color:var(--text3);background:#f8fafc;border-top:1px solid #f1f5f9;display:flex;gap:8px">${md?.d?`<span>🗓️ ${(md.d||'').slice(2).replace(/-/g,'.')}</span>`:''}${md?.map?`<span>🗺️ ${md.map}</span>`:''}</div>`:''}
        ${isLoggedIn?`<div style="padding:5px 8px;background:#f8fafc;border-top:1px solid #f1f5f9;display:flex;gap:3px;flex-wrap:wrap">
          ${(a!=='TBD'&&b!=='TBD')?`<button class="btn btn-xs" style="flex:1;font-size:10px;${aWin?`background:#2563eb;color:#fff;border-color:#2563eb`:''}" onclick="setBracketWinner('${tn.id}',${ri},${mi},'${a.replace(/'/g,"\\'")}')">${a.slice(0,5)} 승</button>
          <button class="btn btn-xs" style="flex:1;font-size:10px;${bWin?`background:#2563eb;color:#fff;border-color:#2563eb`:''}" onclick="setBracketWinner('${tn.id}',${ri},${mi},'${b.replace(/'/g,"\\'")}')">${b.slice(0,5)} 승</button>`:''}
          <button class="btn btn-xs btn-r" style="font-size:10px;padding:0 6px" onclick="clearBracketWinner('${tn.id}',${ri},${mi})" title="승자 초기화">↩️</button>
        </div>`:''}
      </div>`;
    }
    h += `</div></div>`;
    if(ri < totalRounds-1) h += `<div style="width:28px;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:18px;color:#cbd5e1;font-weight:900;align-self:center;padding-top:36px">➔</div>`;
    h += `</div>`;
  }
  h += `</div></div>`;
  return h;
}
function setBracketWinner(tnId,rnd,mi,winner){
  const tn=tourneys.find(t=>t.id===tnId);if(!tn)return;
  const br=getBracket(tn);
  const key=`${rnd}-${mi}`;
  if(br.winners[key]===winner){br.winners[key]='';} // 토글 off
  else{br.winners[key]=winner;}
  save();render();
}
function clearBracketWinner(tnId,rnd,mi){
  const tn=tourneys.find(t=>t.id===tnId);if(!tn)return;
  const br=getBracket(tn);
  const key=`${rnd}-${mi}`;
  if(br.winners && Object.prototype.hasOwnProperty.call(br.winners, key)){
    delete br.winners[key];
  }
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

// (요청사항) 티어대회 토너먼트 강수(브라켓 크기) 선택 지원
// - tn.bracketOverrideSize: 2/4/8/16/32/64...
// - 강수를 바꾸면 기존 슬롯/결과가 의미가 없어질 수 있으므로 브라켓을 초기화한다.
function setTierBracketSize(tnId, size){
  const tn=(tourneys||[]).find(t=>t && t.id===tnId); if(!tn) return;
  const sz=parseInt(size,10)||0;
  if(sz<2) return;
  const cur=parseInt(tn.bracketOverrideSize||'0',10)||0;
  if(cur===sz) return;
  if(!confirm(`토너먼트 강수를 ${sz}강으로 변경할까요?\n\n⚠️ 강수를 변경하면 기존 대진표 슬롯/결과가 초기화됩니다.`)) return;
  tn.bracketOverrideSize = sz;
  // 브라켓 데이터 초기화
  tn.bracket = {slots:{},winners:{},champ:'',matchDetails:{}};
  save(); render();
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
  const allUNames=getAllUnivNames();
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
  function teamRow(team,isWin,isLose,rnd,mi,side,score,detailClick){
    const col=team?gc(team.univ):'#e2e8f0';
    const name=team?.univ||'';
    const tbd=!name;
    const bg=isWin?col+'1a':isLose?'#f8fafc':'var(--white)';
    const bc=isWin?col:tbd?'#e2e8f0':col+'55';
    const textCol=tbd?'#b0bec5':isLose?'#94a3b8':isWin?col:'var(--text)';
    const fw=isWin?800:isLose?500:600;
    const detAttr = detailClick ? ` onclick="openCompMatchDetailModal('${tnId}',null,${mi},${rnd},false)"` : '';
    const scoreEl=score!=null?`<span style="min-width:18px;text-align:center;font-size:13px;font-weight:800;color:${isWin?col:isLose?'#cbd5e1':'var(--text3)'};padding-right:8px;${detailClick?'cursor:pointer;text-decoration:underline;text-underline-offset:2px;':''}"${detAttr}>${score}</span>`:'';
    if(isLoggedIn){
      return `<div style="display:flex;align-items:center;height:36px;background:${bg};border-left:4px solid ${bc}">
        ${team?.grpName?`<span style="background:${team.color||col};color:#fff;font-size:9px;font-weight:800;padding:1px 4px;margin:0 3px;border-radius:3px;flex-shrink:0">${team.rank}</span>`:'<span style="width:3px;flex-shrink:0"></span>'}
        <select onchange="setBracketSlot('${tnId}',${rnd},${mi},'${side}',this.value)"
          style="flex:1;height:100%;border:none;background:transparent;font-size:12px;font-weight:${fw};color:${textCol};padding:0 5px;cursor:pointer;outline:none;min-width:0">
          <option value="">— 미정 —</option>
          ${allUNames.map(n=>`<option value="${n}"${name===n?' selected':''}>${n}</option>`).join('')}
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
    const aSc=detDone?det.sa:null, bSc=detDone?det.sb:null;
    const _winCol = winner ? (winner===a?.univ?aC:winner===b?.univ?bC:'#64748b') : '#64748b';
    const _winRgb = _tcHexToRgbStr(_winCol);
    return `<div class="tc-card" style="--tc-win-rgb:${_winRgb};background:var(--white);border:1.5px solid ${isDone?aC+'66':'var(--border)'};border-radius:8px;overflow:hidden;width:185px;flex-shrink:0;box-shadow:0 1px 6px rgba(0,0,0,.07)">
      ${teamRow(a,aWin,bWin,rnd,mi,'a',aSc,detDone)}
      <div style="height:1px;background:var(--border)"></div>
      ${teamRow(b,bWin,aWin,rnd,mi,'b',bSc,detDone)}
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
      const CL=`var(--tc-line-w) solid rgba(var(--tc-line-rgb), var(--tc-line-a))`;
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
      <div style="width:100%;height:var(--tc-line-w);background:linear-gradient(90deg, rgba(var(--tc-line-rgb), var(--tc-line-a)), ${cc})"></div>
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
          ${allUNames.map(n=>`<option value="${n}"${finalWinner===n?' selected':''}>${n}</option>`).join('')}
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
    ${finalWinner?`<div style="background:linear-gradient(135deg,#f59e0b,#d97706);border-radius:14px;padding:14px 20px;margin-bottom:16px;display:flex;align-items:center;gap:14px;box-shadow:0 4px 20px rgba(217,119,6,.35)">
      ${gUI(finalWinner,'52px')}
      <div>
        <div style="font-size:10px;color:rgba(255,255,255,.8);font-weight:700;letter-spacing:.5px">🏆 TOURNAMENT CHAMPION</div>
        <div style="font-size:20px;font-weight:900;color:#fff">${finalWinner}</div>
      </div>
      <div style="margin-left:auto;font-size:32px">👑</div>
    </div>`:''}
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

