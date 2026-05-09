/* 대회 토너먼트 일정/기록 렌더 */

function rBracketSchedule(tn){
  if(!tn)return '';
  const br=getBracket(tn);
  const _grpsB=(tn.groups&&tn.groups.length>=2)?tn.groups:[];
  const _rankedB=_grpsB.map(grp=>_calcGrpRank(grp));
  const _pcB=Math.floor(_rankedB.length/2)*2;
  const _r1teamsB=[];
  for(let _i=0;_i<_pcB;_i+=2){const gA=_rankedB[_i],gB=_rankedB[_i+1];_r1teamsB.push(gA?.[0]?.u||'',gB?.[0]?.u||'',gB?.[1]?.u||'',gA?.[1]?.u||'');}
  if(_rankedB.length%2===1){const gL=_rankedB[_rankedB.length-1];_r1teamsB.push(gL?.[0]?.u||'');}
  const firstSize = (typeof _bktComputeBracketSize==='function') ? _bktComputeBracketSize(tn) : 8;
  let numR1 = Math.max(1, Math.floor(firstSize / 2));
  let totalRounds = 0;
  let n = firstSize;
  while(n>1){ n = Math.ceil(n/2); totalRounds++; }
  if(totalRounds===0) totalRounds=1;
  const roundLabels={1:'결승',2:'준결승',3:'8강',4:'16강',5:'32강',6:'64강',7:'128강',8:'256강'};

  const rLabelToR={};
  const matches=[];
  for(let r=0;r<totalRounds;r++){
    const matchCount=Math.ceil(numR1/Math.pow(2,r));
    const rNum=totalRounds-r;
    const rLabel=roundLabels[rNum]||(Math.pow(2,rNum)+'강');
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
    const dateStr=detail?.d||'';
    const winCol=(aWin||bWin)?(aWin?ca:cb):'#64748b';
    const winRgb=_tcHexToRgbStr(winCol);
    const _bktActions = [
      isLoggedIn?{ t:'✏️ 결과 입력', d:'대진표 경기 결과 입력', kind:'normal', on:()=>openBracketMatchModal(tn.id,r,mi,teamA,teamB) }:null,
      isLoggedIn?{ t:'📋 붙여넣기', d:'결과 텍스트 빠르게 입력', kind:'accent', on:()=>{ bracketMatchState={tnId:tn.id,rnd:r,mi:mi,teamA:teamA,teamB:teamB}; openBktPasteModal(); } }:null,
      isDone?{ t:'🎴 공유카드', d:'공유용 카드 생성', kind:'accent', on:()=>openBktShareCard(tn.id,r,mi) }:null,
      isLoggedIn?(isManual?{ t:'🗑️ 삭제', d:'수동 경기 삭제', kind:'danger', on:()=>bktDelManualMatch(tn.id,mi) }:{ t:'🗑️ 결과 삭제', d:'대진표 결과 초기화', kind:'danger', on:()=>bktClearMatchResult(tn.id,r,mi) }):null
    ].filter(Boolean);
    const _bktMenu = _bktActions.length ? _compActionMenuHTML(_bktActions) : '';
    const _fxCfg=(typeof _getRecSideFxCfg==='function')?_getRecSideFxCfg():{on:true,mode:'soft',intensity:68,length:25};
    const _fxOn=!!_fxCfg.on;
    const _fxMetrics=(typeof _buildRecSideFxMetrics==='function')?_buildRecSideFxMetrics(_fxCfg):null;
    const _fxMode=_fxMetrics?_fxMetrics.mode:'soft';
    const _fxVars=(_fxOn&&typeof _recSideFxVarStyle==='function')?_recSideFxVarStyle(ca||'#3b82f6',cb||'#ef4444',_fxCfg):'';
    return `<div style="margin-bottom:8px">
      <div class="grp-match-card match-card-v3 tc-card${_fxOn?' grp-sidefx grp-sidefx--'+_fxMode:''}" style="--tc-win-rgb:${winRgb};${_fxVars}border-left:4px solid ${isManual?'#7c3aed':'var(--blue)'};background:var(--white);margin-bottom:0">
        <div style="display:flex;flex-direction:column;align-items:center;gap:3px;min-width:72px">
          <span class="grp-badge" style="background:${isManual?'#7c3aed':'var(--blue)'};font-size:10px">${rLabel}</span>
          ${dateStr?`<span style="font-size:9px;color:var(--gray-l)">${dateStr.slice(5).replace('-','/')}</span>`:''}
          ${!isDone?`<span style="background:var(--surface);color:var(--gray-l);font-size:10px;padding:2px 8px;border-radius:10px">예정</span>`:''}
        </div>
        <div class="grp-match-main" style="flex:1;display:flex;align-items:center;gap:var(--tc-vs-gap,12px);justify-content:center;flex-wrap:wrap">
          <div class="grp-team-col" style="display:flex;flex-direction:column;align-items:center;gap:5px;text-align:center;min-width:100px">
            <div class="grp-team-chip" style="--chip-col:${ca||'#888'};display:flex;align-items:center;justify-content:center;gap:7px;background:linear-gradient(135deg,color-mix(in srgb, var(--chip-col) 92%, #ffffff 8%),color-mix(in srgb, var(--chip-col) 78%, #000000 22%));padding:10px 16px;border-radius:12px;border:1px solid rgba(255,255,255,.26);${(isDone && bWin)?'opacity:.55;filter:saturate(0.65) grayscale(.15)':''}">
              <span style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:14px;color:#fff">${teamA||'미정'}</span>
            </div>
            ${(()=>{
              // 토너먼트 멤버 추출
              let aMembers = [];
              if (detail?.sets) {
                const aSet = new Set();
                detail.sets.forEach(s => {
                  (s.games || []).forEach(g => {
                    if (g.playerA) aSet.add(g.playerA);
                    if (g.winner === 'A' && g.wName) aSet.add(g.wName);
                  });
                });
                aMembers = Array.from(aSet).map(n => ({ name: n }));
              }
              const aBtnColor = ca || '#3b82f6';
              const aMemJson = JSON.stringify(aMembers).replace(/"/g, "'");
              return aMembers.length ? `<button class="grp-mem-btn" style="--mem-col:${aBtnColor};" onclick="event.stopPropagation();openProMembersPopup('${teamA.replace(/'/g,"\\'")}', '${ca}', ${aMemJson})">
              <span class="mem-ico">👥</span><span>${aMembers.length}명</span>
            </button>` : '';
            })()}
          </div>
          <div class="grp-score-col" style="text-align:center;min-width:80px">
            ${isDone?`<div class="grp-match-score score-click" style="cursor:pointer;padding:6px 14px;background:var(--white);border-radius:12px;border:1.5px solid var(--border);font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:18px" onclick="openCompMatchDetailModal('${tn.id}',null,${mi},${r},${isManual})"><span class="${aWin?'wt':bWin?'lt':''}">${sa}</span><span style="color:var(--gray-l);font-size:14px;margin:0 3px">:</span><span class="${bWin?'wt':aWin?'lt':''}">${sb}</span></div>
            `:`<div style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:22px;color:var(--blue)">VS</div>`}
          </div>
          <div class="grp-team-col" style="display:flex;flex-direction:column;align-items:center;gap:5px;text-align:center;min-width:100px">
            <div class="grp-team-chip" style="--chip-col:${cb||'#888'};display:flex;align-items:center;justify-content:center;gap:7px;background:linear-gradient(135deg,color-mix(in srgb, var(--chip-col) 92%, #ffffff 8%),color-mix(in srgb, var(--chip-col) 78%, #000000 22%));padding:10px 16px;border-radius:12px;border:1px solid rgba(255,255,255,.26);${(isDone && aWin)?'opacity:.55;filter:saturate(0.65) grayscale(.15)':''}">
              <span style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:14px;color:#fff">${teamB||'미정'}</span>
            </div>
            ${(()=>{
              // 토너먼트 멤버 추출
              let bMembers = [];
              if (detail?.sets) {
                const bSet = new Set();
                detail.sets.forEach(s => {
                  (s.games || []).forEach(g => {
                    if (g.playerB) bSet.add(g.playerB);
                    if (g.winner === 'B' && g.wName) bSet.add(g.wName);
                  });
                });
                bMembers = Array.from(bSet).map(n => ({ name: n }));
              }
              const bBtnColor = cb || '#ef4444';
              const bMemJson = JSON.stringify(bMembers).replace(/"/g, "'");
              return bMembers.length ? `<button class="grp-mem-btn" style="--mem-col:${bBtnColor};" onclick="event.stopPropagation();openProMembersPopup('${teamB.replace(/'/g,"\\'")}', '${cb}', ${bMemJson})">
              <span class="mem-ico">👥</span><span>${bMembers.length}명</span>
            </button>` : '';
            })()}
          </div>
        </div>
        ${_bktMenu?`<div class="no-export" style="display:flex;flex-direction:column;gap:4px">${_bktMenu}</div>`:''}
      </div>
    </div>`;
  }

  const _roundOrder=['결승','준결승','4강','8강','16강','32강','64강'];
  const _roundSet=new Set(matches.map(m=>m.rLabel));
  const _availRounds=['전체',..._roundOrder.filter(r=>_roundSet.has(r))];
  _roundSet.forEach(r=>{if(!_roundOrder.includes(r)&&r!=='전체')_availRounds.push(r);});

  const _filtered=bktSchedRound==='전체'?matches:matches.filter(m=>m.rLabel===bktSchedRound);
  const done=_filtered.filter(m=>m.isDone);
  const pending=_filtered.filter(m=>!m.isDone);
  const _sortedDone=bktSchedSortDir==='asc'?done.slice().sort((a,b)=>(a.detail?.d||'').localeCompare(b.detail?.d||'')):done.slice().sort((a,b)=>(b.detail?.d||'').localeCompare(a.detail?.d||''));

  let h=`<div>
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;flex-wrap:wrap">
      <span style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:15px;color:var(--blue)">⚔️ 토너먼트</span>
      ${isLoggedIn?`<button class="btn btn-w btn-sm no-export" onclick="openBktSeedModal('${tn.id}')" title="상위 시드(부전승/라운드 합류) 및 자동 배치">🎫 시드/부전승</button>
<button class="btn btn-b btn-sm no-export" onclick="bktAddManualMatch('${tn.id}')">+ 경기 추가</button><button class="btn btn-p btn-sm no-export" onclick="openBktBulkPaste('${tn.id}')">📋 결과 붙여넣기</button>
<button class="btn btn-w btn-xs no-export" onclick="openBktBulkPaste('${tn.id}','64강')">64강</button>
<button class="btn btn-w btn-xs no-export" onclick="openBktBulkPaste('${tn.id}','32강')">32강</button>
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
      h+=`<div>`;
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
  const tn=tourneys.find(t=>t.id===tnId);if(!tn)return;
  const br=getBracket(tn);
  if(!br.manualMatches)br.manualMatches=[];
  br.manualMatches.push({a:'',b:'',d:new Date().toISOString().slice(0,10),rndLabel:roundLabel||'',sa:null,sb:null,sets:[],_id:null});
  const idx=br.manualMatches.length-1;
  save();
  bracketMatchState={tnId,rnd:-1,mi:idx,teamA:'',teamB:''};
  openBktPasteModal();
}

try{
  window.rBracketSchedule = rBracketSchedule;
  window.bktDelRound = bktDelRound;
  window.openBktSchedulePaste = openBktSchedulePaste;
  window.bktAddManualMatch = bktAddManualMatch;
  window.bktDelManualMatch = bktDelManualMatch;
  window.bktClearMatchResult = bktClearMatchResult;
  window.openBktBulkPaste = openBktBulkPaste;
}catch(e){}
