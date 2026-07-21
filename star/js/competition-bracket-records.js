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
  const roundLabels={1:'결승',2:'4강',3:'8강',4:'16강',5:'32강',6:'64강',7:'128강',8:'256강'};

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
  // 전역 슬롯 인덱스 부여 (0-based)
  matches.forEach((mc,i)=>{ mc._globalSlot = i; });

  function matchCard(mc){
    const {r,mi,rLabel,teamA,teamB,detail,isDone,winner,isManual,_globalSlot}=mc;
    const ca=gc(teamA||'');const cb=gc(teamB||'');
    const aWin=isDone&&winner===teamA;const bWin=isDone&&winner===teamB;
    const sa=detail?.sa??'';const sb=detail?.sb??'';
    const dateStr=detail?.d||'';
    const winCol=(aWin||bWin)?(aWin?ca:cb):'#64748b';
    const winRgb=_tcHexToRgbStr(winCol);
    let aMembers = [];
    let bMembers = [];
    if (detail?.sets) {
      const aSet = new Set();
      const bSet = new Set();
      detail.sets.forEach(s => {
        (s.games || []).forEach(g => {
          if (g.playerA) aSet.add(g.playerA);
          if (g.playerB) bSet.add(g.playerB);
          if (g.winner === 'A' && g.wName) aSet.add(g.wName);
          if (g.winner === 'B' && g.wName) bSet.add(g.wName);
        });
      });
      aMembers = Array.from(aSet).map(n => ({ name: n }));
      bMembers = Array.from(bSet).map(n => ({ name: n }));
    }
    const _sideAB = {a:aMembers||[], b:bMembers||[]};
    const _sideM = Object.assign({}, detail||{}, {a:(teamA||''), b:(teamB||''), teamAMembers:(aMembers||[]), teamBMembers:(bMembers||[])});
    const _bktSide=(typeof window._buildRecSideProfilePanel==='function')
      ? window._buildRecSideProfilePanel(_sideM, _sideAB, aWin, bWin, ca, cb)
      : {left:'', right:''};
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
    const _hexRgb=(h)=>{const s=String(h||'').replace('#','');if(s.length===6){const r=parseInt(s.slice(0,2),16),g=parseInt(s.slice(2,4),16),b=parseInt(s.slice(4,6),16);if(![r,g,b].some(isNaN))return r+','+g+','+b;}return'100,116,139';};
    const _sideRgbVars=`--rec-side-left-rgb:${_hexRgb(ca||'#3b82f6')};--rec-side-right-rgb:${_hexRgb(cb||'#ef4444')};`;

    const _bktWinnerName = isDone ? (aWin ? teamA : bWin ? teamB : '') : '';
    const _bktWinnerCol  = isDone ? (aWin ? ca : bWin ? cb : '') : '';
    const _bktDateLabel  = dateStr ? dateStr.slice(5).replace('-','/') : '';
    return `<div class="grp-match-wrap">
      <div class="grp-card-meta-bar no-export">
        <span class="grp-meta-group" style="background:${isManual?'#7c3aed':'var(--blue)'};color:#fff;font-size:10px;font-weight:900;padding:2px 8px;border-radius:99px;letter-spacing:.5px">${!isDone?'예정':''}</span>
        ${rLabel?`<span style="background:linear-gradient(135deg,#1e3a8a,#2563eb);color:#fff;font-size:10px;font-weight:900;padding:2px 10px;border-radius:99px;letter-spacing:.5px;box-shadow:0 2px 6px rgba(37,99,235,.30)">${rLabel}</span>`:''}
        <span class="grp-meta-spacer"></span>
        ${_bktMenu?`<span class="grp-meta-menu" style="margin-left:auto">${_bktMenu}</span>`:''}
      </div>
      <div style="margin-bottom:0">
      <div class="grp-match-card match-card-v3 tc-card${_fxOn?' grp-sidefx grp-sidefx--'+_fxMode:''}${(_bktSide.left||_bktSide.right)?' has-side-panels':''}" style="--tc-win-rgb:${winRgb};${_sideRgbVars}${_fxVars}border-left:4px solid ${_fxOn?(ca||'#3b82f6'):(isManual?'#7c3aed':'var(--blue)')};${_fxOn?`border-right:4px solid ${cb||'#ef4444'};`:''};background:var(--white);margin-bottom:0">
        <div class="grp-match-leftpad" style="display:flex;flex-direction:column;align-items:center;gap:3px;min-width:72px">
          ${!isDone?`<span style="background:var(--surface);color:var(--gray-l);font-size:10px;padding:2px 8px;border-radius:var(--r)">예정</span>`:''}
        </div>
        ${_bktSide.left||''}
        <div class="grp-match-main" style="flex:1;display:flex;align-items:center;gap:var(--tc-vs-gap,12px);justify-content:center;flex-wrap:wrap">
          <div class="grp-team-col" style="display:flex;flex-direction:column;align-items:center;gap:5px;text-align:center;min-width:100px">
            <div class="grp-team-chip" style="--chip-col:${ca||'#888'};display:flex;align-items:center;justify-content:center;gap:7px;background:linear-gradient(135deg,color-mix(in srgb, var(--chip-col) 92%, #ffffff 8%),color-mix(in srgb, var(--chip-col) 78%, #000000 22%));padding:10px 16px;border-radius:12px;border:1px solid rgba(255,255,255,.26);cursor:${teamA?'pointer':'default'}" onclick="${teamA?`openUnivModal('${String(teamA).replace(/'/g,"\\'")}')`:''}">
              ${(()=>{const url=teamA?(UNIV_ICONS[teamA]||(univCfg.find(x=>x.name===teamA)||{}).icon||''):'';return url?`<img class="tc-uicon" src="${toHttpsUrl(url)}" style="width:var(--tc-uicon);height:var(--tc-uicon);object-fit:contain;border-radius:var(--su_univ_logo_radius,10px);clip-path:var(--su_tc_uicon_clip,none);flex-shrink:0" onerror="this.style.display='none'">`:'';})()}
              <span style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:14px;color:#fff">${teamA||'미정'}</span>
            </div>
            ${(()=>{const aBtnColor = (isDone&&bWin)?'#94a3b8':(ca||'#3b82f6'); const aMemJson = JSON.stringify(aMembers).replace(/"/g,"'"); return aMembers.length ? `<button class="grp-mem-btn" style="--mem-col:${aBtnColor};${(isDone&&bWin)?'opacity:.45;filter:grayscale(1);':''}" onclick="event.stopPropagation();openProMembersPopup('${teamA.replace(/'/g,"\\'")}', '${ca}', ${aMemJson})"><span class="mem-ico">👥</span><span>${aMembers.length}명</span></button>` : '';})()}

          </div>
          <div class="grp-score-col" style="text-align:center;min-width:80px">
            ${isDone?`<div class="grp-match-score score-click" style="cursor:pointer;padding:6px 14px;background:var(--white);border-radius:12px;border:1.5px solid var(--border);font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:var(--fs-lg)" onclick="openCompMatchDetailModal('${tn.id}',null,${mi},${r},${isManual})"><span style="color:${aWin?'var(--win-col)':bWin?'var(--lose-col)':'var(--text2)'}">${sa}</span><span class="score-sep" style="color:var(--text2);font-size:0.72em;font-weight:900;margin:0 5px;opacity:0.8">:</span><span style="color:${bWin?'var(--win-col)':aWin?'var(--lose-col)':'var(--text2)'}">${sb}</span></div>
            `:`<div style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:22px;color:var(--blue)">VS</div>`}
          </div>
          <div class="grp-team-col" style="display:flex;flex-direction:column;align-items:center;gap:5px;text-align:center;min-width:100px">
            <div class="grp-team-chip" style="--chip-col:${cb||'#888'};display:flex;align-items:center;justify-content:center;gap:7px;background:linear-gradient(135deg,color-mix(in srgb, var(--chip-col) 92%, #ffffff 8%),color-mix(in srgb, var(--chip-col) 78%, #000000 22%));padding:10px 16px;border-radius:12px;border:1px solid rgba(255,255,255,.26);cursor:${teamB?'pointer':'default'}" onclick="${teamB?`openUnivModal('${String(teamB).replace(/'/g,"\\'")}')`:''}">
              ${(()=>{const url=teamB?(UNIV_ICONS[teamB]||(univCfg.find(x=>x.name===teamB)||{}).icon||''):'';return url?`<img class="tc-uicon" src="${toHttpsUrl(url)}" style="width:var(--tc-uicon);height:var(--tc-uicon);object-fit:contain;border-radius:var(--su_univ_logo_radius,10px);clip-path:var(--su_tc_uicon_clip,none);flex-shrink:0" onerror="this.style.display='none'">`:'';})()}
              <span style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:14px;color:#fff">${teamB||'미정'}</span>
            </div>
            ${(()=>{const bBtnColor = (isDone&&aWin)?'#94a3b8':(cb||'#ef4444'); const bMemJson = JSON.stringify(bMembers).replace(/"/g,"'"); return bMembers.length ? `<button class="grp-mem-btn" style="--mem-col:${bBtnColor};${(isDone&&aWin)?'opacity:.45;filter:grayscale(1);':''}" onclick="event.stopPropagation();openProMembersPopup('${teamB.replace(/'/g,"\\'")}', '${cb}', ${bMemJson})"><span class="mem-ico">👥</span><span>${bMembers.length}명</span></button>` : '';})()}
          </div>
        </div>
        ${_bktSide.right||''}
      </div>
    </div></div>`;
  }

  const _roundOrder=['결승','4강','8강','16강','32강','64강'];
  const _roundSet=new Set(matches.map(m=>m.rLabel));
  const _availRounds=['전체',..._roundOrder.filter(r=>_roundSet.has(r))];
  _roundSet.forEach(r=>{if(!_roundOrder.includes(r)&&r!=='전체')_availRounds.push(r);});

  const _filtered=bktSchedRound==='전체'?matches:matches.filter(m=>m.rLabel===bktSchedRound);
  const done=_filtered.filter(m=>m.isDone);
  const pending=_filtered.filter(m=>!m.isDone);
  const _sortedDone=bktSchedSortDir==='asc'?done.slice().sort((a,b)=>(a.detail?.d||'').localeCompare(b.detail?.d||'')):done.slice().sort((a,b)=>(b.detail?.d||'').localeCompare(a.detail?.d||''));

  let h=`<div>
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;flex-wrap:wrap">
      <span style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:var(--fs-md);color:var(--blue)">⚔️ 토너먼트</span>
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
    ${(()=>{if(_availRounds.length<=2)return '';const _pillsHtml=_availRounds.map(rv=>{const _ri=rLabelToR[rv];const _delR=_ri?_ri.r:-1;const _delC=_ri?_ri.matchCount:0;const _delBtn=isLoggedIn&&rv!=='전체'?`<button onclick="bktDelRound('${tn.id}',${_delR},${_delC},'${rv}')" style="padding:6px 10px;border-radius:4px;border:1px solid #f87171;background:#fef2f2;color:#ef4444;font-size:10px;cursor:pointer;line-height:1;min-height:32px;min-width:32px" title="${rv} 라운드 초기화">\u2715</button>`:'';return `<span style="display:inline-flex;align-items:center;gap:2px"><button class="pill ${bktSchedRound===rv?'on':''}" onclick="bktSchedRound='${rv}';render()">${rv}</button>${_delBtn}</span>`;}).join('');return `<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px">${_pillsHtml}</div>`;})()}
    `;

  if(!pending.filter(m=>m.teamA||m.teamB).length&&!done.length){
    h+=`<div style="padding:30px;text-align:center;color:var(--gray-l);background:var(--surface);border-radius:var(--r)">
      ${isLoggedIn?'+ 경기 추가 버튼으로 경기를 등록하거나 브라켓에서 팀을 배정하세요.':'팀이 배정되면 경기 일정이 표시됩니다.'}
    </div>`;
  } else {
    if(pending.filter(m=>m.teamA||m.teamB).length){
      h+=`<div style="margin-bottom:16px">
        <div style="font-size:var(--fs-sm);font-weight:700;color:var(--gray-l);margin-bottom:8px;padding:4px 10px;background:var(--surface);border-radius:6px;display:inline-block">📅 예정 경기</div>`;
      pending.filter(m=>m.teamA||m.teamB).forEach(m=>{h+=matchCard(m);});
      h+=`</div>`;
    }
    if(_sortedDone.length){
      // 날짜별 그룹화
      const _bktByDate={};
      _sortedDone.forEach(mc=>{const k=mc.detail?.d||'날짜 미정';if(!_bktByDate[k])_bktByDate[k]=[];_bktByDate[k].push(mc);});
      const _bktDayKeys=Object.keys(_bktByDate).sort((a,b)=>bktSchedSortDir==='asc'?a.localeCompare(b):b.localeCompare(a));
      const _bktDays=['일요일','월요일','화요일','수요일','목요일','금요일','토요일'];
      _bktDayKeys.forEach(dk=>{
        let _bktDkLabel=dk;
        if(dk!=='날짜 미정'){const dt=new Date(dk+'T00:00:00');_bktDkLabel=`${dt.getFullYear()}년 ${dt.getMonth()+1}월 ${dt.getDate()}일 ${_bktDays[dt.getDay()]}`;}
        h+=`<div style="margin-bottom:22px"><div style="display:flex;align-items:center;gap:10px;margin-bottom:10px"><div style="flex:1;font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:var(--fs-base);color:#1e3a8a;padding:8px 16px;background:linear-gradient(90deg,#1e3a8a10,transparent);border-left:4px solid #2563eb;border-radius:0 8px 8px 0">📅 ${_bktDkLabel}</div></div>`;
        _bktByDate[dk].forEach(mc=>{h+=matchCard(mc);});
        h+=`</div>`;
      });
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
    const target=br.manualMatches[idx];
    revertMatchRecord(target);
    // _id가 있으면 _id 기준으로, 없으면 인덱스로 삭제
    if(target._id){
      br.manualMatches=br.manualMatches.filter(m=>m._id!==target._id);
    } else {
      br.manualMatches.splice(idx,1);
    }
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
