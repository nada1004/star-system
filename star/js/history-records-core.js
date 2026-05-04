/* history-records-core.js: extracted from history.js */
/* ══════════════════════════════════════
   대전 기록 > 전체 통합 탭
══════════════════════════════════════ */
function histAllHTML(){
  // 각 경기 타입별 레이블과 색상
  const typeInfo={
    mini:{lbl:'⚡ 미니대전',col:_histModeAccent('mini')},
    univm:{lbl:'🏟️ 대학대전',col:'#7c3aed'},
    ck:{lbl:'🤝 대학CK',col:_histModeAccent('ck')},
    pro:{lbl:'🏅 프로리그',col:_histModeAccent('pro')},
    ind:{lbl:'🎮 개인전',col:_histModeAccent('ind')},
    gj:{lbl:'⚔️ 끝장전',col:_histModeAccent('gj')},
    tt:{lbl:'🎯 티어대회',col:'#7c3aed'},
    tourney:{lbl:'🎖️ 대회',col:'#b45309'},
    procomp:{lbl:'🏅 프로리그대회',col:'#7c3aed'},
  };
  // 통합 목록 생성
  const allItems=[];
  // 팀전 (mini/ck/univm/pro): m.a, m.b, m.sa, m.sb, m.d
  [[miniM,'mini'],[ckM,'ck'],[univM,'univm'],[proM,'pro']].forEach(([arr,type])=>{
    (arr||[]).forEach((m,idx)=>{
      const isCK=(type==='ck'||type==='pro');
      if(isCK){if(!m.teamAMembers||!m.teamBMembers)return;}else{if(!m.a||!m.b)return;}
      if(m.sa==null||m.sb==null||m.sa===''||m.sb==='')return;
      if(!passDateFilter(m.d||''))return;
      allItems.push({type,d:m.d||'',m,idx});
    });
  });
  // 개인전/끝장전 (ind/gj): m.wName, m.lName, m.d
  [[indM,'ind'],[gjM,'gj']].forEach(([arr,type])=>{
    (arr||[]).forEach((m,idx)=>{
      if(!m.wName||!m.lName)return;
      if(!passDateFilter(m.d||''))return;
      allItems.push({type,d:m.d||'',m,idx});
    });
  });
  // 티어대회 (tt): m.a, m.b, m.sa, m.sb, m.d
  (ttM||[]).forEach((m,idx)=>{
    if(!m.a||!m.b)return;
    if(!passDateFilter(m.d||''))return;
    allItems.push({type:'tt',d:m.d||'',m,idx});
  });
  // 대회 tourney
  if(typeof getTourneyMatches==='function'){
    getTourneyMatches().forEach((m,idx)=>{
      if(!m.a||!m.b||m.sa==null||m.sb==null)return;
      if(!passDateFilter(m.d||''))return;
      allItems.push({type:'tourney',d:m.d||'',m,idx});
    });
  }
  // 대회 토너먼트 (comps)
  (comps||[]).forEach((m,idx)=>{
    if(!m.a&&!m.u) return; if(!m.b) return;
    if(m.sa==null||m.sa===''||m.sb==null||m.sb==='') return;
    if(isNaN(Number(m.sa))||isNaN(Number(m.sb))) return;
    if(!passDateFilter(m.d||'')) return;
    allItems.push({type:'tourney',d:m.d||'',m:{...m,a:m.a||m.u},idx});
  });
  // 프로리그 개인 대회 (procomp)
  (proTourneys||[]).forEach((tn,tnIdx)=>{
    (tn.groups||[]).forEach((grp,grpIdx)=>{
      (grp.matches||[]).forEach((m,matchIdx)=>{
        if(!m.a||!m.b||!m.winner)return;
        if(!passDateFilter(m.d||''))return;
        const wName=m.winner==='A'?m.a:m.b;
        const lName=m.winner==='A'?m.b:m.a;
        allItems.push({type:'procomp',d:m.d||'',m:{...m,wName,lName},idx:matchIdx,_ref:`procomp:${tnIdx}:${grpIdx}:${matchIdx}`});
      });
    });
  });
  allItems.sort((a,b)=>recSortDir==='asc'?(a.d).localeCompare(b.d):(b.d).localeCompare(a.d));

  // 검색어 필터
  const _sq=((window._recQ&&window._recQ['all'])||'').toLowerCase().trim();
  const filtered=_sq?allItems.filter(({m})=>{
    const searchableText=[
      m.a||'',m.b||'',m.d||'',m.wName||'',m.lName||'',m.compName||'',m.memo||'',
      (m.teamAMembers||[]).map(x=>x.name||'').join(' '),(m.teamBMembers||[]).map(x=>x.name||'').join(' '),
      (m.sets||[]).flatMap(s=>(s.games||[]).flatMap(g=>[g.playerA||'',g.playerB||'',g.winner||'',g.wName||'',g.lName||''])).join(' ')
    ].join(' ').toLowerCase();
    return searchableText.includes(_sq);
  }):allItems;

  const initQ=(window._recQ&&window._recQ['all'])||'';
  if(!window._recTypeFilter) window._recTypeFilter='전체';
  const _typeFiltered = window._recTypeFilter==='전체' ? filtered
    : filtered.filter(({type})=>type===window._recTypeFilter);
  const _typeCountMap={};
  filtered.forEach(({type})=>{_typeCountMap[type]=(_typeCountMap[type]||0)+1;});
  const _typeButtons=[
    {id:'전체',lbl:'전체'},
    {id:'mini',lbl:'⚡ 미니'},
    {id:'univm',lbl:'🏟️ 대학대전'},
    {id:'ck',lbl:'🤝 CK'},
    {id:'pro',lbl:'🏅 프로'},
    {id:'tt',lbl:'🎯 티어'},
    {id:'ind',lbl:'🎮 개인전'},
    {id:'gj',lbl:'⚔️ 끝장전'},
    {id:'tourney',lbl:'🎖️ 대회'},
    {id:'procomp',lbl:'🏅 프로리그대회'},
  ].filter(t=>t.id==='전체'||_typeCountMap[t.id]>0);
  // 페이지네이션
  const pageSize=getHistPageSize();
  if(histPage['all']===undefined) histPage['all']=0;
  const totalPages=Math.ceil(_typeFiltered.length/pageSize)||1;
  if(histPage['all']>=totalPages) histPage['all']=Math.max(0,totalPages-1);
  const curPage=histPage['all'];
  const paged=_typeFiltered.length>pageSize?_typeFiltered.slice(curPage*pageSize,(curPage+1)*pageSize):_typeFiltered;

  let h=`<div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:8px">
    ${_typeButtons.map(t=>`<button class="pill ${window._recTypeFilter===t.id?'on':''}" onclick="window._recTypeFilter='${t.id}';histPage['all']=0;render()">${t.lbl}${t.id!=='전체'&&_typeCountMap[t.id]?` <span style="font-size:10px;opacity:.7">(${_typeCountMap[t.id]})</span>`:''}</button>`).join('')}
  </div>`;

  if(!paged.length){
    h+=`<div class="empty-state"><div class="empty-state-icon">📭</div><div class="empty-state-title">기록이 없습니다</div></div>`;
    return h;
  }

  paged.forEach(({type,d,m,idx,_ref}, pageIdx)=>{
    const ti=typeInfo[type]||{lbl:type,col:'#64748b'};
    const isCK=(type==='ck'||type==='pro');
    const isInd=(type==='ind'||type==='gj'||type==='procomp');
    let teamA='',teamB='',scoreA='',scoreB='';
    if(isInd){
      teamA=m.wName||''; teamB=m.lName||'';
    } else if(isCK){
      teamA=(m.teamAMembers||[]).map(x=>x.name||'').join(', ')||m.a||'';
      teamB=(m.teamBMembers||[]).map(x=>x.name||'').join(', ')||m.b||'';
      scoreA=m.sa!=null?m.sa:''; scoreB=m.sb!=null?m.sb:'';
    } else {
      teamA=m.a||''; teamB=m.b||'';
      scoreA=m.sa!=null?m.sa:''; scoreB=m.sb!=null?m.sb:'';
    }
    const winner=isInd?teamA:(!isInd&&scoreA!==''&&scoreB!==''?(Number(scoreA)>Number(scoreB)?teamA:(Number(scoreB)>Number(scoreA)?teamB:'')):'');
    const dLabel=d?d.slice(2).replace(/-/g,'/'):'미정';
    const dColor=d?'var(--text3)':'#f59e0b';
    const winCol=winner===teamA?gc(teamA):winner===teamB?gc(teamB):ti.col;
    const key=`hist-all-${type}-${d}-${(m.a||teamA)}-${(m.b||teamB)}`.replace(/[^\w\-:.]/g,'');
    const labelA=isCK?'A팀':(m.a||teamA);
    const labelB=isCK?'B팀':(m.b||teamB);
    const _pair=isCK?_histModePair(mode):null;
    const ca=isCK?_pair.a:gc(m.a||teamA);
    const cb=isCK?_pair.b:gc(m.b||teamB);
    const aWin=!isInd && Number(scoreA)>Number(scoreB);
    const bWin=!isInd && Number(scoreB)>Number(scoreA);
    const modeMap={mini:'mini',univm:'univm',ck:'ck',pro:'pro',tt:'tt',tourney:'comp',procomp:'comp'};
    const mode=modeMap[type]||'comp';
    const _regIdx = (typeof idx==='number' ? idx : pageIdx);
    const _detM = _ref ? {...m, _editRef:_ref} : m;
    h+=`<div class="rec-summary rec-mode-tierrank" data-rec-mode="tierrank" style="--rec-mode-col:${ti.col};--rec-mode-rgb:${(function(){const h=String(ti.col||'').replace('#','');if(h.length!==6)return'100,116,139';return parseInt(h.slice(0,2),16)+','+parseInt(h.slice(2,4),16)+','+parseInt(h.slice(4,6),16);})()};border-left:3px solid ${ti.col}">
      <div class="rec-sum-header" style="gap:6px">
        <div style="display:flex;flex-direction:column;gap:2px;flex-shrink:0;min-width:68px">
          <span style="font-size:9px;font-weight:800;padding:1px 6px;border-radius:4px;background:${ti.col}18;color:${ti.col};white-space:nowrap;display:inline-block">${ti.lbl}${m._teamMatchType?` <span style="background:#7c3aed;color:#fff;padding:0 4px;border-radius:3px">${m._teamMatchType.replace('v',':')+'전'}</span>`:''}</span>
          <span style="font-size:12px;font-weight:600;color:${dColor};white-space:nowrap">${dLabel}</span>
        </div>
        <span style="font-weight:800;font-size:13px;color:${winner===teamA?'#16a34a':'var(--text)'};flex:1;min-width:60px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${teamA}</span>
        ${isInd
          ?`<span style="font-size:11px;font-weight:700;padding:2px 9px;border-radius:20px;background:#dcfce7;color:#16a34a;border:1px solid #bbf7d0;white-space:nowrap;flex-shrink:0" onclick="toggleDetail('${key}')">승</span>`
          :`<div class="rec-sum-score score-click" style="font-size:16px;padding:3px 12px" onclick="toggleDetail('${key}')">
            <span style="color:${Number(scoreA)>Number(scoreB)?'#16a34a':Number(scoreB)>Number(scoreA)?'#dc2626':'var(--text)'}">${scoreA}</span>
            <span style="color:var(--gray-l);font-size:12px;font-weight:400">:</span>
            <span style="color:${Number(scoreB)>Number(scoreA)?'#16a34a':Number(scoreA)>Number(scoreB)?'#dc2626':'var(--text)'}">${scoreB}</span>
          </div>`}
        <span style="font-weight:800;font-size:13px;color:${winner===teamB?'#16a34a':'var(--text)'};flex:1;min-width:60px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-align:right">${teamB}</span>
        ${winner&&!isInd?`<span style="font-size:10px;font-weight:700;padding:2px 8px;border-radius:20px;background:${winCol}18;color:${winCol};border:1px solid ${winCol}33;white-space:nowrap;flex-shrink:0">🏆 ${winner}</span>`:''}
      </div>
      <div id="det-${key}" class="rec-detail-area">
        ${isInd
          ? (()=> {
              const wp=players.find(p=>p.name===(m.wName||'')); const lp=players.find(p=>p.name===(m.lName||''));
              const wc=wp?gc(wp.univ):'#888'; const lc=lp?gc(lp.univ):'#888';
              const mapStr=m.map&&m.map!=='-'?`<span style="font-size:11px;color:var(--gray-l)">📍 ${m.map}</span>`:'';
              return `<div style="padding:10px;border-top:1px solid var(--border);display:flex;align-items:center;gap:8px">
                ${wp?getPlayerPhotoHTML(wp.name,'24px'):''}<span class="ubadge" style="background:${wc}">${m.wName||''}</span>
                <span style="color:var(--gray-l)">vs</span>
                ${lp?getPlayerPhotoHTML(lp.name,'24px'):''}<span class="ubadge" style="background:${lc}">${m.lName||''}</span>
                ${mapStr}
              </div>`;
            })()
          : _regDet(key, _detM, mode, labelA, labelB, ca, cb, aWin, bWin, _regIdx)}
      </div>
    </div>`;
  });

  // 페이지 네비게이션
  if(_typeFiltered.length>pageSize){
    h+=`<div style="display:flex;justify-content:center;align-items:center;gap:8px;margin-top:12px;flex-wrap:wrap">
      <button class="btn btn-sm" ${curPage===0?'disabled':''} onclick="histPage['all']=${curPage-1};render()">← 이전</button>
      <span style="font-size:12px;color:var(--gray-l)">${curPage+1} / ${totalPages}</span>
      <button class="btn btn-sm" ${curPage>=totalPages-1?'disabled':''} onclick="histPage['all']=${curPage+1};render()">다음 →</button>
    </div>`;
  }
  return h;
}

/* ══════════════════════════════════════
   대전 기록 > 대회 탭: 미니대전처럼 보이는 대회 경기 기록
══════════════════════════════════════ */
function histTourneyHTML(context){
  // tourneys(조편성 대회) + comps(기존 대회) 합산
  const tourItems=getTourneyMatches();
  const compItems=[...comps].map((m,origIdx)=>({...m,_src:'comps',_origIdx:origIdx}));
  const allItems=[...tourItems,...compItems].filter(m=>{
    if(!m.a||!m.b) return false;
    if(m.sa==null||m.sa===''||m.sb==null||m.sb==='') return false;
    if(isNaN(Number(m.sa))||isNaN(Number(m.sb))) return false;
    return typeof passDateFilter!=='function'||passDateFilter(m.d||'');
  });
  allItems.sort((a,b)=>recSortDir==='asc'?(a.d||'').localeCompare(b.d||''):(b.d||'').localeCompare(a.d||''));
  const sortBar=`<div class="fbar no-export" style="overflow-x:auto;flex-wrap:nowrap;-webkit-overflow-scrolling:touch;scrollbar-width:none;gap:4px;margin-bottom:6px;align-items:center">
    <span style="font-size:11px;color:var(--text3)"></span>
    <button class="pill ${recSortDir==='desc'?'on':''}" style="flex-shrink:0;white-space:nowrap" onclick="recSortDir='desc';render()">최신순 ↓</button>
    <button class="pill ${recSortDir==='asc'?'on':''}" style="flex-shrink:0;white-space:nowrap" onclick="recSortDir='asc';render()">오래된순 ↑</button>
    
  </div>`;
  if(!allItems.length) return sortBar+`<div class="empty-state"><div class="empty-state-icon">🏆</div><div class="empty-state-title">대회 경기 기록이 없습니다</div><div class="empty-state-desc">기록이 추가되면 여기에 표시됩니다</div></div>`;

  // 대회명별로 그룹화
  const groups={};
  allItems.forEach((m,idx)=>{
    const compName=m.n||m.compName||'기타 대회';
    if(!groups[compName]) groups[compName]=[];
    groups[compName].push({m,idx});
  });

  let h=sortBar;
  Object.entries(groups).forEach(([compName,items])=>{
    const startDate=items[items.length-1]?.m?.d||'';
    const endDate=items[0]?.m?.d||'';
    const dateRange=startDate===endDate?startDate:(startDate&&endDate?`${startDate} ~ ${endDate}`:'');
    h+=`<div style="background:linear-gradient(135deg,var(--blue-l) 0%,var(--white) 100%);border:1.5px solid var(--blue-ll);border-left:4px solid var(--blue);border-radius:12px;padding:12px 16px;margin:14px 0 6px;display:flex;align-items:center;gap:8px;flex-wrap:wrap">
      <span style="font-size:16px">🎖️</span>
      <span style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:15px;color:var(--blue)">${compName}</span>
      ${dateRange?`<span style="font-size:11px;color:var(--gray-l)">${dateRange}</span>`:''}
      <span style="font-size:11px;font-weight:700;color:var(--blue);background:var(--blue-ll);border-radius:20px;padding:2px 10px;margin-left:auto">${items.length}경기</span>
    </div>`;
    items.forEach(({m,idx})=>{
      const a=m.a||'',b=m.b||'';
      const ca=gc(a),cb=gc(b);
      const aWin=m.sa>m.sb,bWin=m.sb>m.sa;
      const key=`${context}-tourney-${idx}`;
      const rIdx=(m._src==='comps')?m._origIdx:-1;
      const grpBadge=m._src==='tour'
        ?`<span style="background:${m.grpColor||'#2563eb'};color:#fff;font-size:10px;font-weight:700;padding:1px 8px;border-radius:4px">GROUP ${m.grpLetter||''}</span>`:'';
      const _tAwin=m.sa>m.sb,_tBwin=m.sb>m.sa;
      const _tBorderCol=_tAwin?gc(a):_tBwin?gc(b):'var(--blue-ll)';
      h+=`<div class="rec-summary rec-mode-tourney" data-rec-mode="tourney" style="--rec-mode-col:${_tBorderCol};--rec-mode-rgb:${(function(){const h=String(_tBorderCol||'').replace('#','');if(h.length!==6)return'100,116,139';return parseInt(h.slice(0,2),16)+','+parseInt(h.slice(2,4),16)+','+parseInt(h.slice(4,6),16);})()};margin-left:8px;border-left:3px solid ${_tBorderCol}">
        <div class="rec-sum-header">
          <span style="color:var(--text3);font-size:12px;font-weight:600;flex-shrink:0;white-space:nowrap">${m.d?m.d.slice(2).replace(/-/g,'/'):'미정'}</span>
          ${grpBadge}
          <div class="rec-sum-vs">
            ${a?`<span class="ubadge${aWin?'':' loser'} clickable-univ" style="background:${ca}" onclick="openUnivModal('${a}')">${a}</span>`:''}
            ${(a&&b)?`<div class="rec-sum-score score-click" onclick="toggleDetail('${key}')" title="클릭하여 상세 보기">
              <span style="color:${aWin?'#16a34a':bWin?'#dc2626':'var(--text)'}">${m.sa||0}</span>
              <span style="color:var(--gray-l);font-size:12px;font-weight:400">:</span>
              <span style="color:${bWin?'#16a34a':aWin?'#dc2626':'var(--text)'}">${m.sb||0}</span>
            </div>`:''}
            ${b?`<span class="ubadge${bWin?'':' loser'} clickable-univ" style="background:${cb}" onclick="openUnivModal('${b}')">${b}</span>`:''}
            ${(a&&b)?(aWin||bWin)?`<span style="font-size:10px;font-weight:700;padding:2px 8px;border-radius:20px;background:${aWin?ca:cb}18;color:${aWin?ca:cb};border:1px solid ${aWin?ca:cb}33;white-space:nowrap;flex-shrink:0">🏆 ${aWin?a:b}</span>`:`<span style="font-size:10px;color:var(--gray-l)">무승부</span>`:''}

          </div>
          <div style="margin-left:auto;display:flex;gap:5px;align-items:center" class="no-export">
            <button id="detbtn-${key}" class="btn-detail" onclick="toggleDetail('${key}')">📂 상세</button>
            <button class="btn btn-w btn-xs rec-morebtn" style="padding:3px 10px;font-size:14px" title="메뉴"
              onclick="openRecActionMenu(event,{
                _btnEl:this,
                a:'${a.replace(/'/g,"\\'")}',
                sa:${m.sa||0},
                b:'${b.replace(/'/g,"\\'")}',
                sb:${m.sb||0},
                d:'${m.d||''}',
                mode:'comp',
                idx:${rIdx>=0?rIdx:'null'},
                key:'${key}',
                canShare:${(()=>{const _adm=(localStorage.getItem('su_share_admin_only')||'0')==='1';return(!_adm||isLoggedIn)?'true':'false';})()},
                canEdit:${((rIdx>=0 && isLoggedIn && !isSubAdmin) || (m._src==='tour' && isLoggedIn && !isSubAdmin))?'true':'false'},
                canDel:${(rIdx>=0 && isLoggedIn && !isSubAdmin)?'true':'false'},
                canMove:false,
                editKind:'${m._src==='tour'?'league':''}',
                tnId:'${m._tnId||''}',
                gi:${m._gi ?? 'null'},
                mi:${m._mi ?? 'null'}
              })">⋯</button>
          </div>
        </div>
        <div id="det-${key}" class="rec-detail-area">
        ${_regDet(key,{...m,_editRef:rIdx>=0?'comp:'+rIdx:''},  'comp',a,b,ca,cb,aWin,bWin, rIdx)}
        </div>
      </div>`;
    });
  });
  return h;
}

// 대회 탭 공유카드용 헬퍼
function _getHistTourneyMatchObj(idx, context){
  const tourItems=getTourneyMatches();
  const compItems=[...comps].map((m,origIdx)=>({...m,_src:'comps',_origIdx:origIdx}));
  const all=[...tourItems,...compItems].filter(m=>{
    if(!m.a||!m.b) return false;
    if(m.sa==null||m.sb==null) return false;
    return typeof passDateFilter!=='function'||passDateFilter(m.d||'');
  });
  all.sort((a,b)=>recSortDir==='asc'?(a.d||'').localeCompare(b.d||''):(b.d||'').localeCompare(a.d||''));
  return all[idx]||null;
}


function rHistUnivStat(){
  const allU=getAllUnivs();
  if(!histUniv&&allU.length) histUniv=allU[0].name;
  let h='';
  if(typeof buildYearMonthFilter==='function'){
    h+=buildYearMonthFilter('hist-univ');
  }
  h+=`<div style="margin-bottom:16px;" class="no-export"><select onchange="histUniv=this.value;openDetails={};render()" style="padding:6px 10px;border-radius:8px;border:1px solid var(--border);background:var(--card);color:var(--fg);font-size:14px;cursor:pointer;">`;
  allU.forEach(u=>{
    h+=`<option value="${u.name}"${histUniv===u.name?' selected':''}>${u.name}</option>`;
  });
  h+=`</select></div>`;
  if(!histUniv) return h+`<div style="padding:40px;text-align:center;color:var(--gray-l)">대학을 선택하세요.</div>`;
  const col=gc(histUniv);
  const myMini=miniM.filter(m=>(m.a===histUniv||m.b===histUniv)&&(!passDateFilter||passDateFilter(m.d||'')));
  const myUnivM=univM.filter(m=>(m.a===histUniv||m.b===histUniv)&&(!passDateFilter||passDateFilter(m.d||'')));
  const myCK=ckM.filter(m=>((m.teamAMembers||[]).some(x=>x.univ===histUniv)||(m.teamBMembers||[]).some(x=>x.univ===histUniv))&&(!passDateFilter||passDateFilter(m.d||'')));
  const myComp=comps.filter(m=>(((m.a||m.u)===histUniv)||m.b===histUniv)&&(!passDateFilter||passDateFilter(m.d||'')));
  // 조별대회(tourneys) 경기 추가
  const myTourney=(typeof getTourneyMatches==='function'?getTourneyMatches():[])
    .filter(m=>(m.a===histUniv||m.b===histUniv)&&(!passDateFilter||passDateFilter(m.d||'')));
  function calcStats(arr,getA,getB){let w=0,l=0,d=0;arr.forEach(m=>{const a=getA(m),b=getB(m);const iA=(a===histUniv),iB=(b===histUniv);if(iA){if(m.sa>m.sb)w++;else if(m.sb>m.sa)l++;else d++;}else if(iB){if(m.sb>m.sa)w++;else if(m.sa>m.sb)l++;else d++;}});return{w,l,d,total:w+l+d};}
  const sm=calcStats(myMini,m=>m.a,m=>m.b);
  const su=calcStats(myUnivM,m=>m.a,m=>m.b);
  const sc=calcStats(myComp,m=>m.a||m.u,m=>m.b);
  const st=calcStats(myTourney,m=>m.a,m=>m.b);
  let ckW=0,ckL=0;
  myCK.forEach(m=>{
    // univWins가 채워진 경우 (match builder 저장)
    if(m.univWins&&Object.keys(m.univWins).length){
      ckW+=(m.univWins[histUniv]||0);
      ckL+=(m.univLosses&&m.univLosses[histUniv]||0);
    } else {
      // 미채워진 경우: sets 내 게임별 승패 집계
      let hasSets=false;
      (m.sets||[]).forEach(set=>{
        (set.games||[]).forEach(g=>{
          hasSets=true;
          const wp=players.find(p=>p.name===(g.wName||''));
          const lp=players.find(p=>p.name===(g.lName||''));
          if(wp&&wp.univ===histUniv) ckW++;
          if(lp&&lp.univ===histUniv) ckL++;
        });
      });
      // sets도 없으면 팀 스코어로 대체
      if(!hasSets){
        const inA=(m.teamAMembers||[]).some(x=>x.univ===histUniv);
        const inB=(m.teamBMembers||[]).some(x=>x.univ===histUniv);
        if(inA&&m.sa!=null&&m.sb!=null){if(m.sa>m.sb)ckW++;else if(m.sb>m.sa)ckL++;}
        else if(inB&&m.sa!=null&&m.sb!=null){if(m.sb>m.sa)ckW++;else if(m.sa>m.sb)ckL++;}
      }
    }
  });

  // 상대 대학 승/패 집계
  const oppStats={};
  function addOpp(myU,oppU,myWin){
    if(myU!==histUniv||oppU===histUniv)return;
    if(!oppStats[oppU])oppStats[oppU]={w:0,l:0};
    if(myWin)oppStats[oppU].w++;else oppStats[oppU].l++;
  }
  myMini.forEach(m=>{addOpp(m.a,m.b,m.sa>m.sb);addOpp(m.b,m.a,m.sb>m.sa);});
  myUnivM.forEach(m=>{addOpp(m.a,m.b,m.sa>m.sb);addOpp(m.b,m.a,m.sb>m.sa);});
  myComp.forEach(m=>{const a=m.a||m.u||'';addOpp(a,m.b,m.sa>m.sb);addOpp(m.b,a,m.sb>m.sa);});
  myTourney.forEach(m=>{addOpp(m.a,m.b,m.sa>m.sb);addOpp(m.b,m.a,m.sb>m.sa);});

  h+=`<div style="background:${col}0d;border:2px solid ${col}44;border-radius:12px;padding:16px 20px;margin-bottom:20px;">
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px">
      <span class="ubadge clickable-univ" style="background:${col};font-size:14px;padding:5px 16px" onclick="openUnivModal('${histUniv}')">${histUniv}</span>
      <span style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:16px;color:${col}">대전 통합 성적</span>
    </div>
    <div style="display:flex;gap:12px;flex-wrap:wrap">
      ${statCard('⚡ 미니대전',sm.w,sm.l,sm.d,col)}
      ${statCard('🏟️ 대학대전',su.w,su.l,su.d,col)}
      ${statCard('🎖️ 대회',sc.w,sc.l,sc.d,col)}
      ${st.total>0?statCard('🏆 조별대회',st.w,st.l,st.d,col):''}
      ${statCard('🤝 대학CK (게임)',ckW,ckL,0,col)}
    </div>
  </div>`;

  // 상대 대학별 전적표
  const oppList=Object.entries(oppStats).filter(([,s])=>s.w+s.l>0).sort((a,b)=>(b[1].w+b[1].l)-(a[1].w+a[1].l));
  if(oppList.length){
    h+=`<div style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:14px;color:#7c3aed;margin-bottom:10px;padding-bottom:6px;border-bottom:2px solid #ede9fe">🆚 상대 대학 대전 전적</div>`;
    h+=`<table style="margin-bottom:20px"><thead><tr><th>상대 대학</th><th>승</th><th>패</th><th>승률</th></tr></thead><tbody>`;
    oppList.forEach(([opp,s])=>{
      const ot=s.w+s.l;const ow=ot?Math.round(s.w/ot*100):0;const oc=gc(opp);
      h+=`<tr><td><span class="ubadge clickable-univ" style="background:${oc}" onclick="openUnivModal('${opp}')">${opp}</span></td>
        <td class="wt" style="font-weight:800;font-size:14px">${s.w}</td>
        <td class="lt" style="font-weight:800;font-size:14px">${s.l}</td>
        <td style="font-weight:700;color:${ow>=50?'var(--green)':'var(--red)'}">${ot?ow+'%':'-'}</td></tr>`;
    });
    h+=`</tbody></table>`;
  }

  const totalMatches=myMini.length+myUnivM.length+myCK.length+myComp.length+myTourney.length;
  if(!totalMatches) h+=`<div style="padding:40px;text-align:center;color:var(--gray-l)">이 대학의 대전 기록이 없습니다.</div>`;
  return h;
}

function statCard(label,w,l,d,col){
  const tot=w+l+d;const wr=tot?Math.round(w/tot*100):0;
  return `<div style="background:var(--white);border:1.5px solid ${col}33;border-radius:12px;padding:12px 14px;min-width:110px;text-align:center;flex:1;border-top:3px solid ${col}">
    <div style="font-size:10px;font-weight:700;color:${col};margin-bottom:7px;letter-spacing:.3px">${label}</div>
    <div style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:18px;margin-bottom:4px"><span class="wt">${w}승</span> <span class="lt">${l}패</span>${d?` <span style="color:var(--gray-l);font-size:14px">${d}무</span>`:''}</div>
    <div style="font-size:12px;font-weight:800;color:${wr>=50?'#16a34a':'#dc2626'}">${tot?wr+'%':'-'}</div>
  </div>`;
}

function recSummaryListHTMLFiltered(arr,mode,ctxPrefix,filterUniv){
  if(!arr.length)return`<div class="empty-state"><div class="empty-state-icon">📭</div><div class="empty-state-title">기록이 없습니다</div><div class="empty-state-desc">기록이 추가되면 여기에 표시됩니다</div></div>`;
  const isCKmode=(mode==='ck'||mode==='pro'||mode==='tt');
  // (정렬 보강) 티어대회 등 filtered 목록도 "입력 순서"가 아니라 날짜 기준으로 정렬
  // - 사용자가 과거 날짜 경기를 나중에 저장하면 unshift 때문에 최신순이 깨질 수 있음
  const _normDateSort = (d)=>{
    const s = String(d||'').trim();
    if(!s) return '';
    const m = s.match(/(\d{4})[.\-/](\d{1,2})[.\-/](\d{1,2})/);
    if(m){
      const y=m[1];
      const mo=String(parseInt(m[2],10)).padStart(2,'0');
      const da=String(parseInt(m[3],10)).padStart(2,'0');
      return `${y}-${mo}-${da}`;
    }
    return s;
  };
  let h='';
  let _filtered=false;
  // 유효 경기만 모아 렌더(그룹 요약 제거 요청)
  const list=[];
  arr.forEach((m, _origIdx)=>{
    if(isCKmode){if(mode!=='tt'&&(!m.teamAMembers||!m.teamBMembers)) return;}
    else{if(!m.a||!m.b) return;}
    if(m.sa==null||m.sa===''||m.sb==null||m.sb==='') return;
    if(isNaN(Number(m.sa))||isNaN(Number(m.sb))) return;
    if(typeof passDateFilter==='function' && !passDateFilter(m.d||''))return;
    _filtered=true;
    list.push({m, _origIdx});
  });

  function _renderItem(m){
    const srcArr=mode==='mini'?miniM:mode==='univm'?univM:mode==='pro'?proM:mode==='tt'?ttM:ckM;
    const i=srcArr.indexOf(m);
    const isCK=isCKmode;
    const _pair=isCK?_histModePair(mode):null;
    const ca=isCK?_pair.a:gc(m.a);const cb=isCK?_pair.b:gc(m.b);
    const rawLA2=(m.teamALabel||'').replace(/^\$\{.*\}$/,'');
    const rawLB2=(m.teamBLabel||'').replace(/^\$\{.*\}$/,'');
    const labelA=isCK?(rawLA2||'A팀'):m.a;const labelB=isCK?(rawLB2||'B팀'):m.b;
    const aWin=(m.sa>m.sb),bWin=(m.sb>m.sa);
    const col=gc(filterUniv);
    const isA=(!isCK&&m.a===filterUniv)||(isCK&&(m.teamAMembers||[]).some(x=>x.univ===filterUniv));
    const isB=(!isCK&&m.b===filterUniv)||(isCK&&(m.teamBMembers||[]).some(x=>x.univ===filterUniv));
    const myWin=(isA&&aWin)||(isB&&bWin);
    const key=`${ctxPrefix}-${mode}-${i}`;
    const MODE_COL = {
      ind:_histModeAccent('ind'), gj:_histModeAccent('gj'), progj:_histModeAccent('progj'),
      mini:'#7c3aed', civil:'#a855f7',
      univm:'#16a34a', ck:_histModeAccent('ck'), pro:_histModeAccent('pro'),
      tt:'#10b981', comp:'#3b82f6', tourney:'#7c3aed',
      procomp:_histModeAccent('procomp'), procomptn:'#7c3aed'
    };
    const _mc = MODE_COL[mode] || '#64748b';
    const _rgb = (hex)=>{const h=String(hex||'').replace('#',''); if(h.length!==6) return '100,116,139'; const r=parseInt(h.slice(0,2),16),g=parseInt(h.slice(2,4),16),b=parseInt(h.slice(4,6),16); return `${r},${g},${b}`;};
    h+=`<div class="rec-summary rec-mode-${mode}" data-rec-mode="${mode}" style="--rec-mode-col:${_mc};--rec-mode-rgb:${_rgb(_mc)}">
      <div class="rec-sum-header">
        <span style="color:var(--text3);font-size:12px;font-weight:600;min-width:72px">${m.d||''}</span>
        ${m.t?`<span style="font-weight:700;font-size:12px;color:var(--text3)">${m.t}</span>`:''}
        ${(m.n&&mode!=='comp')?`<span style="font-weight:700;font-size:12px;color:var(--text3)">${m.n}</span>`:''}
        <div class="rec-sum-vs">
          <span class="ubadge${aWin?'':' loser'} clickable-univ" data-icon-done="1" style="background:${ca};display:inline-flex;align-items:center;gap:4px" onclick="openUnivModal('${isCK?'':m.a}')">${(()=>{const n=isCK?'':m.a;const url=UNIV_ICONS[n]||(univCfg.find(x=>x.name===n)||{}).icon||'';return url?`<img src="${toHttpsUrl(url)}" style="width:18px;height:18px;object-fit:contain;border-radius:3px;flex-shrink:0" onerror="this.style.display='none'">`:''})()}${labelA}</span>
          <div class="rec-sum-score score-click" onclick="toggleDetail('${key}')"><span class="${aWin?'wt':bWin?'lt':'pt-z'}">${m.sa}</span><span style="color:var(--gray-l);font-size:14px">:</span><span class="${bWin?'wt':aWin?'lt':'pt-z'}">${m.sb}</span></div>
          <span class="ubadge${bWin?'':' loser'} clickable-univ" data-icon-done="1" style="background:${cb};display:inline-flex;align-items:center;gap:4px" onclick="openUnivModal('${isCK?'':m.b}')">${(()=>{const n=isCK?'':m.b;const url=UNIV_ICONS[n]||(univCfg.find(x=>x.name===n)||{}).icon||'';return url?`<img src="${toHttpsUrl(url)}" style="width:18px;height:18px;object-fit:contain;border-radius:3px;flex-shrink:0" onerror="this.style.display='none'">`:''})()}${labelB}</span>
          <span style="font-size:12px;font-weight:700;color:${myWin?col:'#888'}">${myWin?'▶ '+filterUniv+' 승':aWin?'▶ '+labelA+' 승':bWin?'▶ '+labelB+' 승':'무승부'}</span>
        </div>
        <div style="margin-left:auto;display:flex;gap:5px;align-items:center" class="no-export">
          <button id="detbtn-${key}" class="btn-detail" onclick="toggleDetail('${key}')">📂 상세</button>
          <button class="btn btn-w btn-xs rec-morebtn" style="padding:3px 10px;font-size:14px" title="메뉴"
            onclick="openRecActionMenu(event,{
              _btnEl:this,
              a:'${(m.a||'').replace(/'/g,"\\'")}',
              sa:${m.sa||0},
              b:'${(m.b||'').replace(/'/g,"\\'")}',
              sb:${m.sb||0},
              d:'${m.d||''}',
              mode:'${mode}',
              idx:${i},
              key:'${key}',
              canShare:${(()=>{const _adm=(localStorage.getItem('su_share_admin_only')||'0')==='1';return(!_adm||isLoggedIn)?'true':'false';})()},
              canEdit:${((mode==='tt'||mode==='mini'||mode==='univm'||mode==='comp'||mode==='ck'||mode==='ind'||mode==='gj') && isLoggedIn && !isSubAdmin)?'true':'false'},
              canDel:${(isLoggedIn && !isSubAdmin)?'true':'false'},
              canMove:${(isLoggedIn && (mode==='mini'||mode==='univm'))?'true':'false'}
            })">⋯</button>
        </div>
      </div>
      <div id="det-${key}" class="rec-detail-area">
        ${_regDet(key,{...m,_editRef:`${mode}:${i}`},mode,labelA,labelB,ca,cb,aWin,bWin, i)}
      </div>
    </div>`;
  }

  // 날짜 정렬(기본: 최신순). 같은 날짜면 원래 배열 순서를 유지
  try{
    const dir = (typeof recSortDir!=='undefined' && recSortDir==='asc') ? 'asc' : 'desc';
    list.sort((x,y)=>{
      const dx=_normDateSort(x.m?.d||''), dy=_normDateSort(y.m?.d||'');
      const cmp = dir==='asc' ? dx.localeCompare(dy) : dy.localeCompare(dx);
      if(cmp!==0) return cmp;
      return (x._origIdx||0) - (y._origIdx||0);
    });
  }catch(e){}
  list.forEach(x=>_renderItem(x.m));
  if(!_filtered) return `<div class="empty-state"><div class="empty-state-icon">📭</div><div class="empty-state-title">기록이 없습니다</div><div class="empty-state-desc">기록이 추가되면 여기에 표시됩니다</div></div>`;
  return h;
}

function recSummaryListHTML(arr, mode, context, extraFilter){
  const isCKmode=(mode==='ck'||mode==='pro'||mode==='tt');
  // 날짜 정규화(정렬용): 2026-4-2 같이 0이 빠진 날짜가 있으면 문자열 정렬이 깨질 수 있음
  const _normDateSort = (d)=>{
    const s = String(d||'').trim();
    if(!s) return '';
    // yyyy-mm-dd / yyyy.m.d / yyyy/m/d
    const m = s.match(/(\d{4})[.\-/](\d{1,2})[.\-/](\d{1,2})/);
    if(m){
      const y=m[1];
      const mo=String(parseInt(m[2],10)).padStart(2,'0');
      const da=String(parseInt(m[3],10)).padStart(2,'0');
      return `${y}-${mo}-${da}`;
    }
    return s;
  };
  // 기록 카드 스타일 설정 (localStorage 기반)
  function _rcGet(k, d){ try{ const v=localStorage.getItem(k); return v==null?d:v; }catch(e){ return d; } }
  const _rcThemeOn = _rcGet('su_rc_theme_on','1')==='1';
  const _rcAccent  = (_rcGet('su_rc_accent_mode','none')||'none').trim();
  const _rcMemoOn  = _rcGet('su_rc_memo_on','0')==='1';
  // (요청사항) 기록 카드 대학 로고를 더 크게 (스코어 영역과 밸런스)
  const _uiconPx   = Math.max(14, Math.min(34, parseInt(_rcGet('su_rc_uicon','24'),10)||24));
  function _hexToRgbStr(hex){
    const h=String(hex||'').replace('#','').trim();
    if(h.length===3){
      const r=parseInt(h[0]+h[0],16), g=parseInt(h[1]+h[1],16), b=parseInt(h[2]+h[2],16);
      if([r,g,b].some(x=>isNaN(x))) return '100,116,139';
      return `${r},${g},${b}`;
    }
    if(h.length>=6){
      const r=parseInt(h.slice(0,2),16), g=parseInt(h.slice(2,4),16), b=parseInt(h.slice(4,6),16);
      if([r,g,b].some(x=>isNaN(x))) return '100,116,139';
      return `${r},${g},${b}`;
    }
    return '100,116,139';
  }
  if(!window._recQ)window._recQ={};
  if(!arr.length){
    const emptyBar=`<div class="fbar no-export" style="overflow-x:auto;flex-wrap:nowrap;-webkit-overflow-scrolling:touch;scrollbar-width:none;gap:4px;margin-bottom:6px;align-items:center">
    <span style="font-size:11px;color:var(--text3)"></span>
    <button class="pill ${recSortDir==='desc'?'on':''}" style="flex-shrink:0;white-space:nowrap" onclick="recSortDir='desc';render()">최신순 ↓</button>
    <button class="pill ${recSortDir==='asc'?'on':''}" style="flex-shrink:0;white-space:nowrap" onclick="recSortDir='asc';render()">오래된순 ↑</button>
  </div>`;
    return emptyBar+`<div class="empty-state"><div class="empty-state-icon">📭</div><div class="empty-state-title">기록이 없습니다</div><div class="empty-state-desc">기록이 추가되면 여기에 표시됩니다</div></div>`;
  }
  // 날짜 필터만 적용 (검색어 필터는 DOM에서 실시간 처리)
  // 필터된 부분 배열이 넘어올 수 있으므로 원본 배열에서 실제 인덱스를 구함
  // (filter()는 같은 객체 참조를 반환하므로 indexOf로 정확한 원본 인덱스 확인 가능)
  const _srcArr=(()=>{
    if(mode==='mini') return miniM;
    if(mode==='univm') return univM;
    if(mode==='ck') return ckM;
    if(mode==='pro') return proM;
    if(mode==='tt') return ttM;
    if(mode==='comp') return comps;
    return arr;
  })();
  let filtered=arr.map((m,i)=>({m,i:_srcArr!==arr?_srcArr.indexOf(m):i})).filter(({m})=>{
    if(extraFilter&&!extraFilter(m)) return false;
    if(isCKmode){
      if(mode!=='tt'&&(!m.teamAMembers||!m.teamBMembers)) return false;
    } else {
      if(!m.a||!m.b) return false;
    }
    if(m.sa==null||m.sa===''||m.sb==null||m.sb==='') return false;
    if(isNaN(Number(m.sa))||isNaN(Number(m.sb))) return false;
    if(typeof passDateFilter==='function'&&!passDateFilter(m.d||'')) return false;
    return true;
  });
  // 동일 날짜 내 정렬 보조키(최신이 위): 시간/생성시각 기반
  // - time: 숫자(ms) 또는 문자열
  // - t: 'HH:MM' 형태(존재할 경우)
  // - _id/sid: genId() = (Date.now base36 + random4) → 앞부분으로 생성시각 추정
  const _getMatchTs = (m, idx) => {
    try{
      // 1) time 필드
      if (m && typeof m.time === 'number') return m.time;
      if (m && typeof m.time === 'string' && m.time.trim()) {
        const n = Number(m.time);
        if (!isNaN(n) && isFinite(n)) return n;
      }
      // 2) t (HH:MM 또는 HH:MM:SS) → 날짜 없는 경우도 있어 보조키로만 사용
      if (m && typeof m.t === 'string' && m.t.includes(':')) {
        const parts = m.t.split(':').map(x=>Number(x));
        if (parts.length >= 2 && parts.every(x=>!isNaN(x))) {
          const hh = parts[0]||0, mm = parts[1]||0, ss = parts[2]||0;
          return hh*3600 + mm*60 + ss;
        }
      }
      // 3) genId 기반(_id/sid)
      const id = (m && (m._id || m.sid)) ? String(m._id || m.sid) : '';
      if (id && id.length > 4) {
        const prefix = id.slice(0, -4); // Date.now().toString(36)
        const t36 = parseInt(prefix, 36);
        if (!isNaN(t36) && isFinite(t36)) return t36;
      }
    }catch(e){}
    // 4) 최후: 배열 인덱스(대부분 unshift로 최신이 0번) → desc에서는 -idx가 최신 우선
    return -idx;
  };
  filtered.sort((a,b)=>{
    const da=_normDateSort(a.m.d||''), db=_normDateSort(b.m.d||'');
    const cmp=recSortDir==='asc'?da.localeCompare(db):db.localeCompare(da);
    if(cmp!==0) return cmp;
    // 동일 날짜일 때: (1) 시간/생성시각 (2) 원본 인덱스
    const ta=_getMatchTs(a.m, a.i);
    const tb=_getMatchTs(b.m, b.i);
    const cmp2 = recSortDir==='asc' ? (ta - tb) : (tb - ta);
    if (cmp2 !== 0) return cmp2;
    // asc(오래된→최신): unshift 기준이라 i가 클수록 오래됨
    return recSortDir==='asc' ? (b.i - a.i) : (a.i - b.i);
  });

  // ── 날짜(일자) 빠른 선택: ASL 스타일 날짜 메뉴(설정: su_date_menu_style) ──
  // 컨텍스트별로 날짜 선택값을 저장하여(예: hist / tiertour) 서로 간섭하지 않게 함
  const _dateMenuStyle = (localStorage.getItem('su_date_menu_style') || 'pill');
  const _datePickKey = `su_rec_date_pick_${context||'x'}_${mode}`;
  const _pickedDate = (localStorage.getItem(_datePickKey) || '').trim();
  const _baseFiltered = filtered.slice(); // 메뉴/카운트는 원본(일자 선택 전) 기준
  const _allDates = Array.from(new Set(_baseFiltered.map(x=>_normDateSort(x.m.d||'')).filter(Boolean))).sort((a,b)=>recSortDir==='asc'?a.localeCompare(b):b.localeCompare(a));
  if(_pickedDate && _allDates.includes(_pickedDate)){
    filtered = filtered.filter(x => _normDateSort(x.m.d||'') === _pickedDate);
  }
  const _dateMenuHTML = (()=>{
    if(_dateMenuStyle!=='asl' || !_allDates.length) return '';
    const daysS=['일','월','화','수','목','금','토'];
    const _mini = (m)=>{
      const isCK=(mode==='ck'||mode==='pro'||mode==='tt');
      const a=isCK?(String(m.teamALabel||'A팀').replace(/^\$\{.*\}$/,'')||'A팀'):(m.a||'');
      const b=isCK?(String(m.teamBLabel||'B팀').replace(/^\$\{.*\}$/,'')||'B팀'):(m.b||'');
      const ca=gc(a)||'#64748b', cb=gc(b)||'#64748b';
      const icon = (u, col)=>{
        const url=UNIV_ICONS[u]||(univCfg.find(x=>x.name===u)||{}).icon||'';
        if(url) return `<img src="${toHttpsUrl(url)}" style="width:14px;height:14px;object-fit:contain;border-radius:3px;flex-shrink:0" onerror="this.style.display='none'">`;
        return `<span style="width:10px;height:10px;border-radius:3px;background:${col};display:inline-block;flex-shrink:0"></span>`;
      };
      return `<div style="display:flex;align-items:center;gap:5px;font-size:10px;color:var(--text2);line-height:1.1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">
        <span style="display:inline-flex;align-items:center;gap:4px;min-width:0;flex:1">${icon(a,ca)}<span style="overflow:hidden;text-overflow:ellipsis">${a||'—'}</span></span>
        <span style="color:var(--gray-l);font-weight:900;flex-shrink:0">vs</span>
        <span style="display:inline-flex;align-items:center;gap:4px;min-width:0;flex:1;justify-content:flex-end">${icon(b,cb)}<span style="overflow:hidden;text-overflow:ellipsis">${b||'—'}</span></span>
      </div>`;
    };
    let h=`<div class="no-export" style="margin-bottom:10px;padding-bottom:10px;border-bottom:2px solid var(--border)">
      <div style="display:flex;gap:8px;overflow-x:auto;flex-wrap:nowrap;-webkit-overflow-scrolling:touch;scrollbar-width:none">`;
    const _onAll = !_pickedDate;
    h+=`<button type="button" onclick="localStorage.setItem('${_datePickKey}','');histPage['${mode}']=0;render()" style="flex-shrink:0;min-width:92px;padding:10px 12px;border-radius:12px;border:1px solid ${_onAll?'var(--blue)':'var(--border)'};background:${_onAll?'#eff6ff':'var(--surface)'};cursor:pointer;text-align:left">
        <div style="font-weight:1000;font-size:12px;color:${_onAll?'var(--blue)':'var(--text2)'}">전체</div>
        <div style="margin-top:6px;font-size:10px;color:var(--gray-l)">날짜 필터 해제</div>
      </button>`;
    _allDates.forEach(d0=>{
      const dt=new Date(d0+'T00:00:00');
      const label=`${daysS[dt.getDay()]} ${String(dt.getMonth()+1).padStart(2,'0')}/${String(dt.getDate()).padStart(2,'0')}`;
      const ms=_baseFiltered
        .filter(x=>String(x.m.d||'').trim()===d0)
        .slice(0,2)
        .map(x=>_mini(x.m)).join('');
      const prev=ms?`<div style="margin-top:6px;display:flex;flex-direction:column;gap:4px">${ms}</div>`:'';
      const on=(_pickedDate===d0);
      const cnt=_baseFiltered.filter(x=>String(x.m.d||'').trim()===d0).length;
      h+=`<button type="button" onclick="localStorage.setItem('${_datePickKey}','${d0}');histPage['${mode}']=0;render()" style="flex-shrink:0;text-align:left;min-width:150px;max-width:240px;padding:10px 12px;border-radius:12px;border:1px solid ${on?'var(--blue)':'var(--border)'};background:${on?'#eff6ff':'var(--surface)'};cursor:pointer">
        <div style="display:flex;align-items:center;gap:8px">
          <span style="font-weight:1000;font-size:12px;color:${on?'var(--blue)':'var(--text2)'}">${label}</span>
          <span style="margin-left:auto;font-size:10px;color:var(--gray-l);font-weight:900">${cnt?`기록 ${cnt}`:''}</span>
        </div>
        ${prev}
      </button>`;
    });
    h+=`</div></div>`;
    return h;
  })();

  // ── 페이지네이션 계산 ──
  const totalItems=filtered.length;
  const pageSize=getHistPageSize();
  const pageKey=mode;
  if(histPage[pageKey]===undefined) histPage[pageKey]=0;
  const totalPages=Math.ceil(totalItems/pageSize)||1;
  if(histPage[pageKey]>=totalPages) histPage[pageKey]=Math.max(0,totalPages-1);
  const curPage=histPage[pageKey];
  const paged=totalItems>pageSize?filtered.slice(curPage*pageSize,(curPage+1)*pageSize):filtered;
  // 일괄 이동 컨텍스트
  const _canBulk=isLoggedIn;
  const _bulkKey=(mode==='mini'&&histSub==='civil')?'civil':mode;
  const _bulkOn=_canBulk&&!!_bulkModes[_bulkKey];
  const _bulkDests=_bulkKey==='mini'?[{l:'⚔️ 시빌워',d:'civil'},{l:'🏟️ 대학대전',d:'univm'}]
    :_bulkKey==='civil'?[{l:'⚡ 미니대전',d:'mini'},{l:'🏟️ 대학대전',d:'univm'}]
    :_bulkKey==='univm'?[{l:'⚡ 미니대전',d:'mini'},{l:'⚔️ 시빌워',d:'civil'}]:[];
  const sortBar=`<div class="fbar no-export" style="overflow-x:auto;flex-wrap:nowrap;-webkit-overflow-scrolling:touch;scrollbar-width:none;gap:6px;margin-bottom:6px;align-items:center">
    ${_canBulk?`<button class="pill bulk-pill ${_bulkOn?'on':''}" onclick="toggleBulkMode('${_bulkKey}')" style="margin-left:auto">${_bulkOn?'✕ 선택 해제':'☑ 일괄 선택'}</button>`:''}
    ${(_canBulk&&_bulkOn)?`<button class="pill danger-pill" onclick="bulkDeleteRecs('${_bulkKey}')">🗑️ 선택 삭제</button>`:''}
  </div>
  ${_bulkOn?`<div class="no-export" style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;padding:7px 10px;background:#eff6ff;border:1.5px solid var(--blue);border-radius:8px;margin-bottom:6px">
    <label style="display:flex;align-items:center;gap:5px;font-size:12px;font-weight:700;cursor:pointer;color:var(--blue)">
      <input type="checkbox" id="bulk-all-${_bulkKey}" onchange="bulkToggleAll('${_bulkKey}',this.checked)" style="width:14px;height:14px;cursor:pointer"> 전체
    </label>
    <span id="bulk-cnt-${_bulkKey}" style="font-size:11px;color:var(--blue);font-weight:700;min-width:64px">0개 선택됨</span>
    <span style="color:var(--border2)">│</span>
    ${_bulkDests.map(bd=>`<button onclick="bulkMoveTeam('${_bulkKey}','${bd.d}')" style="padding:3px 12px;border-radius:12px;border:1.5px solid var(--blue);background:var(--blue);color:#fff;font-size:11px;font-weight:700;cursor:pointer">${bd.l}로 이동</button>`).join('')}
  </div>`:''}
  `;

  if(!totalItems){
    return sortBar+_dateMenuHTML+`<div class="empty-state"><div class="empty-state-icon">📅</div><div class="empty-state-title">기록이 없습니다</div><div class="empty-state-desc"></div></div>`;
  }

  // 기존 렌더 블록을 함수로 감싸서 그룹 출력에 재사용
  function _recItemHTML(m,i){
    const isCK=(mode==='ck'||mode==='pro'||mode==='tt');
    const _pair=isCK?_histModePair(mode):null;
    const ca=isCK?_pair.a:gc(m.a);
    const cb=isCK?_pair.b:gc(m.b);
    // teamALabel/B 필드 정리: 잘못된 값({...} 포함) 필터링
    const rawLA=(m.teamALabel||'').replace(/^\$\{.*\}$/,'');
    const rawLB=(m.teamBLabel||'').replace(/^\$\{.*\}$/,'');
    const labelA=isCK?(rawLA||'A팀'):m.a;
    const labelB=isCK?(rawLB||'B팀'):m.b;
    const aWin=(m.sa>m.sb);const bWin=(m.sb>m.sa);
    const key=`${context}-${mode}-${i}`;
    // 검색용 hay 데이터
    // 대학 아이콘 (대학끼리 경기: mini/univm/comp/tour 는 상대 대학 아이콘, CK/pro/tt는 소속 대학 아이콘)
    const iconA=(()=>{const n=isCK?'':m.a;const u=univCfg.find(x=>x.name===n)||{};const url=UNIV_ICONS[n]||u.icon||'';return url?`<img src="${toHttpsUrl(url)}" style="width:18px;height:18px;object-fit:contain;border-radius:3px;flex-shrink:0;vertical-align:middle" onerror="this.style.display='none'">`:''})();
    const iconB=(()=>{const n=isCK?'':m.b;const u=univCfg.find(x=>x.name===n)||{};const url=UNIV_ICONS[n]||u.icon||'';return url?`<img src="${toHttpsUrl(url)}" style="width:18px;height:18px;object-fit:contain;border-radius:3px;flex-shrink:0;vertical-align:middle" onerror="this.style.display='none'">`:''})();
    // 기본(무색)에서는 승리색 테두리도 사용하지 않음
    const _wBorderCol = (_rcThemeOn && _rcAccent==='border' && (aWin||bWin)) ? (aWin?ca:bWin?cb:'var(--border)') : 'var(--border)';
    // 승리 색 테마(대학 색) — 켜져있을 때만 적용
    const _winCol = (aWin||bWin) ? (aWin?ca:cb) : '';
    const _rgb = _hexToRgbStr(_winCol);
    const _themeCls = (_rcThemeOn && _winCol && _rcAccent!=='none') ? ` rc-theme rc-accent-${_rcAccent}` : '';
    const _themeStyle = (_rcThemeOn && _winCol) ? `--rc-win-rgb:${_rgb};--rc-win-col:${_winCol};` : '';

    const MODE_COL = {
      ind:_histModeAccent('ind'), gj:_histModeAccent('gj'), mini:'#7c3aed', civil:'#a855f7',
      univm:'#16a34a', ck:_histModeAccent('ck'), pro:_histModeAccent('pro'), tt:'#10b981',
      comp:'#3b82f6', tourney:'#7c3aed', procomptn:'#7c3aed', procompteam:_histModeAccent('procompteam')
    };
    const _mc = MODE_COL[mode] || '#64748b';
    const _rgbM = _hexToRgbStr(_mc);
    return `<div class="rec-summary rec-mode-${mode}${_themeCls}" data-rec-mode="${mode}" style="--rec-mode-col:${_mc};--rec-mode-rgb:${_rgbM};${_themeStyle}border-left:3px solid ${_wBorderCol}">
      <div style="padding:8px 12px 0;display:flex;align-items:center;gap:8px;flex-wrap:nowrap">
        ${_bulkOn?`<input type="checkbox" class="bulk-cb no-export" data-bkey="${_bulkKey}" data-bidx="${i}" onchange="_bulkCountUpdate('${_bulkKey}')" onclick="event.stopPropagation()" style="width:15px;height:15px;cursor:pointer;flex-shrink:0;accent-color:var(--blue)">`:''}
        <span class="rec-date" style="color:var(--text3);font-size:13px;font-weight:900;flex-shrink:0;white-space:nowrap">${m.d?m.d.slice(2).replace(/-/g,'/'):''}</span>
        ${m.fmt>0?`<span style="font-size:10px;padding:1px 6px;border-radius:8px;background:#ede9fe;color:#6d28d9;border:1px solid #c4b5fd;font-weight:700;flex-shrink:0">${m.fmt}:${m.fmt}</span>`:''}
        ${aWin||bWin?`<span class="rec-winner" style="font-size:12px;font-weight:900;padding:2px 10px;border-radius:20px;background:rgba(var(--rc-win-rgb, 100,116,139), calc(var(--rc-bg-a, .12) + .06));color:${aWin?ca:cb};border:1.5px solid rgba(var(--rc-win-rgb, 100,116,139), calc(var(--rc-bg-a, .12) + .16));white-space:nowrap;flex-shrink:0">🏆 ${aWin?labelA:labelB}</span>`:`<span style="font-size:11px;color:var(--gray-l);flex-shrink:0">무승부</span>`}
        <div class="rec-actions no-export" style="margin-left:auto">
          <button class="btn btn-w btn-xs rec-morebtn" style="padding:3px 10px;font-size:14px" title="메뉴"
            onclick="openRecActionMenu(event,{
              _btnEl:this,
              a:'${(m.a||'').replace(/'/g,"\\'")}',
              sa:${m.sa||0},
              b:'${(m.b||'').replace(/'/g,"\\'")}',
              sb:${m.sb||0},
              d:'${m.d||''}',
              mode:'${mode}',
              idx:${i},
              key:'${key}',
              canShare:${(()=>{const _adm=(localStorage.getItem('su_share_admin_only')||'0')==='1';return(!_adm||isLoggedIn)?'true':'false';})()},
              canEdit:${(isLoggedIn && !isSubAdmin)?'true':'false'},
              canDel:${(isLoggedIn && !isSubAdmin)?'true':'false'},
              canMove:${(isLoggedIn && (mode==='mini'||mode==='univm'))?'true':'false'}
            })">⋯</button>
        </div>
      </div>
      <div class="rec-sum-header" style="padding:6px 12px 10px">
        <div class="rec-sum-vs">
          <span class="ubadge${aWin?'':' loser'} clickable-univ" data-icon-done="1" style="background:${ca};display:inline-flex;align-items:center;gap:4px" onclick="${!isCK?`openUnivModal('${m.a||''}')`:''}">${iconA?iconA.replace('width:18px;height:18px',`width:${_uiconPx}px;height:${_uiconPx}px`).replace('<img ','<img class="rec-uicon" '):''}${labelA}</span>
          <div class="rec-sum-score score-click" onclick="toggleDetail('${key}')" title="클릭하여 상세 보기/닫기">
            <span style="color:${aWin?'#16a34a':bWin?'#dc2626':'var(--text)'}">${m.sa}</span>
            <span style="color:var(--gray-l);font-size:12px;font-weight:400">:</span>
            <span style="color:${bWin?'#16a34a':aWin?'#dc2626':'var(--text)'}">${m.sb}</span>
          </div>
          <span class="ubadge${bWin?'':' loser'} clickable-univ" data-icon-done="1" style="background:${cb};display:inline-flex;align-items:center;gap:4px" onclick="${!isCK?`openUnivModal('${m.b||''}')`:''}">${iconB?iconB.replace('width:18px;height:18px',`width:${_uiconPx}px;height:${_uiconPx}px`).replace('<img ','<img class="rec-uicon" '):''}${labelB}</span>
        </div>
      </div>
      <div id="det-${key}" class="rec-detail-area">
        ${_regDet(key,{...m,_editRef:`${mode}:${i}`}, mode, labelA, labelB, ca, cb, aWin, bWin, i)}
      </div>
    </div>`;
  }

  // (요청사항) 기록탭 상단 ‘이전/승패 요약’ 제거 → 그냥 리스트로만 출력
  let h=sortBar+`<div id="rec-list-${mode}">`;
  paged.forEach(({m,i})=>{ h+=_recItemHTML(m,i); });

  // ── 페이지 컨트롤 ──
  if(totalItems>getHistPageSize()){
    const pages=totalPages;
    let pager=`<div class="no-export" style="display:flex;align-items:center;justify-content:center;gap:6px;padding:16px 0;flex-wrap:wrap">`;
    pager+=`<button class="btn btn-w btn-xs" style="min-width:32px" onclick="histPage['${pageKey}']=0;render()" ${curPage===0?'disabled':''}>«</button>`;
    pager+=`<button class="btn btn-w btn-xs" style="min-width:32px" onclick="histPage['${pageKey}']=Math.max(0,${curPage}-1);render()" ${curPage===0?'disabled':''}>‹</button>`;
    // 페이지 번호 버튼 (최대 7개)
    let startP=Math.max(0,curPage-3);let endP=Math.min(pages-1,startP+6);
    if(endP-startP<6)startP=Math.max(0,endP-6);
    for(let p=startP;p<=endP;p++){
      pager+=`<button class="btn ${p===curPage?'btn-b':'btn-w'} btn-xs" style="min-width:32px" onclick="histPage['${pageKey}']=${p};render()">${p+1}</button>`;
    }
    pager+=`<button class="btn btn-w btn-xs" style="min-width:32px" onclick="histPage['${pageKey}']=Math.min(${pages-1},${curPage}+1);render()" ${curPage===pages-1?'disabled':''}>›</button>`;
    pager+=`<button class="btn btn-w btn-xs" style="min-width:32px" onclick="histPage['${pageKey}']=${pages-1};render()" ${curPage===pages-1?'disabled':''}>»</button>`;
    pager+=`<span style="font-size:11px;color:var(--text3);margin-left:6px">${curPage+1} / ${pages}</span>`;
    pager+=`</div>`;
    h+=pager;
  }

  return h||`<div class="empty-state"><div class="empty-state-icon">📅</div><div class="empty-state-title">기록이 없습니다</div><div class="empty-state-desc"></div></div>`;
}

/* 모바일 시트용 레지스트리 */
window._detReg = window._detReg || {};
function _regDet(key, m, mode, lA, lB, ca, cb, aW, bW, idx){
  window._detReg[key] = {m, mode, lA, lB, ca, cb, aW, bW, idx};
  return buildDetailHTML(m, mode, lA, lB, ca, cb, aW, bW);
}

// ── (요청사항) 경기기록 점수 방식(세트제/경기제) 전환 ──
function _calcScoreFromSets(sets, scoreMode){
  let sa=0, sb=0;
  (sets||[]).forEach(s=>{
    if(!s) return;
    const games = Array.isArray(s.games) ? s.games : [];
    const scoreA = (s.scoreA!=null) ? Number(s.scoreA) : games.filter(g=>g && g.winner==='A').length;
    const scoreB = (s.scoreB!=null) ? Number(s.scoreB) : games.filter(g=>g && g.winner==='B').length;
    let w = s.winner;
    if(!w){
      w = scoreA>scoreB ? 'A' : scoreB>scoreA ? 'B' : '';
    }
    if(scoreMode==='set'){
      if(w==='A') sa += 1;
      else if(w==='B') sb += 1;
    }else{
      sa += (isNaN(scoreA)?0:scoreA);
      sb += (isNaN(scoreB)?0:scoreB);
    }
  });
  return {sa, sb};
}
function setRecScoreMode(mode, idx, scoreMode){
  try{
    const mkey = (mode==='mini'&&typeof histSub!=='undefined'&&histSub==='civil') ? 'civil' : mode;
    const arr = mkey==='mini'?miniM:mkey==='civil'?miniM:mkey==='univm'?univM:mkey==='ck'?ckM:mkey==='pro'?proM:mkey==='tt'?ttM:mkey==='comp'?comps:null;
    if(!arr || !arr[idx]) return;
    const m = arr[idx];
    if(!m.sets || !Array.isArray(m.sets) || !m.sets.length) return alert('세트 정보가 없어 전환할 수 없습니다.');
    const sm = (scoreMode==='set') ? 'set' : 'game';
    const sc = _calcScoreFromSets(m.sets, sm);
    m.sa = sc.sa;
    m.sb = sc.sb;
    m.scoreMode = sm;
    save();
    render();
  }catch(e){
    console.error('[setRecScoreMode] fail', e);
  }
}

// ─────────────────────────────────────────────────────────────
// 경기 상세 역추적 인덱스 (스트리머 history → 원본 경기 데이터)
// - 탭은 원본 배열을 직접 렌더하지만, 스트리머 상세는 history로부터 역추적이 필요함
// - matchId / _id / sid / 내부 _id 등이 섞여 있어 전역 인덱스를 생성해 해결
// ─────────────────────────────────────────────────────────────
window._matchIndex = window._matchIndex || null; // { idMap:Map, sigMap:Map, builtAt:number, sizes:{} }
function _buildMatchIndex(){
  const idMap = new Map();   // id -> [entry]
  const sigMap = new Map();  // sig -> [entry]
  const normDate = (s) => {
    const t = String(s||'').trim();
    if(!t) return '';
    // 허용: YYYY-MM-DD, YYYY-M-D, YYYY.MM.DD, YYYY/MM/DD, YYYYMMDD
    const m = t.match(/(20\\d{2})\\D?(\\d{1,2})\\D?(\\d{1,2})/);
    if(!m) return t;
    const y = m[1];
    const mo = String(m[2]).padStart(2,'0');
    const da = String(m[3]).padStart(2,'0');
    return `${y}-${mo}-${da}`;
  };

  const addId = (id, entry) => {
    const k = String(id||'').trim();
    if(!k) return;
    const arr = idMap.get(k) || [];
    arr.push(entry);
    idMap.set(k, arr);
  };

  const addSig = (date, a, b, map, entry) => {
    const d = normDate(date);
    const A = String(a||'').trim();
    const B = String(b||'').trim();
    if(!d || !A || !B) return;
    const pair = [A,B].sort().join('||');
    const m = (map && map !== '-') ? String(map).trim() : '';
    const sig = [d, pair, m].join('|');
    const arr = sigMap.get(sig) || [];
    arr.push(entry);
    sigMap.set(sig, arr);
    // 맵이 비었을 때도 찾을 수 있도록 map 없는 sig도 같이 기록
    if(m){
      const sig2 = [d, pair, ''].join('|');
      const arr2 = sigMap.get(sig2) || [];
      arr2.push(entry);
      sigMap.set(sig2, arr2);
    }
  };

  const indexSets = (matchObj, modeKey) => {
    if(!matchObj || !matchObj.sets) return;
    const date = normDate(matchObj.d || matchObj.date || '');
    const A = matchObj.a || matchObj.teamALabel || '';
    const B = matchObj.b || matchObj.teamBLabel || '';
    (matchObj.sets||[]).forEach(set=>{
      (set.games||[]).forEach(g=>{
        if(!g) return;
        // gameId → parent match
        if(g._id) addId(g._id, {refType:'game', modeKey, parent:matchObj, game:g});
        // signature (날짜+선수쌍+맵) → parent match
        if(date && g.playerA && g.playerB) addSig(date, g.playerA, g.playerB, g.map||'', {refType:'game', modeKey, parent:matchObj, game:g});
      });
    });
  };

  // 재귀적으로 _id를 가진 객체를 찾아 index (대회/프로리그대회 중첩 구조 대응)
  const walk = (node, modeKey, depth, seen) => {
    if(!node || depth>12) return;
    if(typeof node !== 'object') return;
    try{ if(seen.has(node)) return; seen.add(node); }catch(_){}

    // match-like object
    const id = node._id || node.id || node.matchId || node.sid || '';
    if(id){
      addId(id, {refType:'obj', modeKey, obj:node});
    }
    // 가능한 경우 signature도 등록
    const d = normDate(node.d || node.date || '');
    if(d){
      // 1) a/b 형태(단일 경기)
      if(node.a && node.b){
        addSig(d, node.a, node.b, node.map||'', {refType:'obj', modeKey, obj:node});
      }
      // 2) wName/lName 형태(단일 경기)
      if(node.wName && node.lName){
        addSig(d, node.wName, node.lName, node.map||'', {refType:'obj', modeKey, obj:node});
      }
    }
    // sets 포함 시 gameId도 등록
    if(node.sets && Array.isArray(node.sets)) indexSets(node, modeKey);
    // 프로리그대회 끝장전 세션(gjMatches): {a,b,games:[{winner,map}]}
    if(node.games && Array.isArray(node.games) && node.a && node.b && !node.sets){
      // 세트형으로 만들 수 있는 세션 → signature는 a/b로 등록
      if(d) addSig(d, node.a, node.b, '', {refType:'pcgj', modeKey, obj:node});
    }

    // traverse children
    if(Array.isArray(node)){
      node.forEach(it=>walk(it, modeKey, depth+1, seen));
    } else {
      Object.keys(node).forEach(k=>walk(node[k], modeKey, depth+1, seen));
    }
  };

  // ── top-level sources ──
  const seen = new WeakSet();
  const top = [
    {arr:(typeof miniM!=='undefined'?miniM:[]), modeKey:'mini'},
    {arr:(typeof univM!=='undefined'?univM:[]), modeKey:'univm'},
    {arr:(typeof ckM!=='undefined'?ckM:[]), modeKey:'ck'},
    {arr:(typeof proM!=='undefined'?proM:[]), modeKey:'pro'},
    {arr:(typeof ttM!=='undefined'?ttM:[]), modeKey:'tt'},
    {arr:(typeof comps!=='undefined'?comps:[]), modeKey:'comp'},
    {arr:(typeof tourneys!=='undefined'?tourneys:[]), modeKey:'tourney'},
    {arr:(typeof proTourneys!=='undefined'?proTourneys:[]), modeKey:'procomp'},
    {arr:(typeof indM!=='undefined'?indM:[]), modeKey:'ind'},
    {arr:(typeof gjM!=='undefined'?gjM:[]), modeKey:'gj'}
  ];
  top.forEach(({arr, modeKey})=>{
    try{
      // ind/gj는 game 객체지만 _id/sid를 모두 인덱싱
      if(modeKey==='ind' || modeKey==='gj'){
        (arr||[]).forEach(g=>{
          if(!g) return;
          if(g._id) addId(g._id, {refType:'obj', modeKey, obj:g});
          if(g.sid) addId(g.sid, {refType:'sid', modeKey, sid:g.sid});
          if(g.matchId) addId(g.matchId, {refType:'sid', modeKey, sid:g.matchId});
          if(g.d && g.wName && g.lName) addSig(g.d, g.wName, g.lName, g.map||'', {refType:'obj', modeKey, obj:g});
        });
        return;
      }
      (arr||[]).forEach(m=>{
        if(!m) return;
        // main id
        if(m._id) addId(m._id, {refType:'obj', modeKey, obj:m});
        if(m.id) addId(m.id, {refType:'obj', modeKey, obj:m});
        if(m.matchId) addId(m.matchId, {refType:'obj', modeKey, obj:m});
        // signature for match-level
        if(m.d && (m.a||m.teamALabel) && (m.b||m.teamBLabel)) addSig(m.d, (m.a||m.teamALabel), (m.b||m.teamBLabel), '', {refType:'obj', modeKey, obj:m});
        // sets games
        indexSets(m, modeKey);
        // deep scan nested (대회/프로리그대회)
        walk(m, modeKey, 0, seen);
      });
    }catch(_){}
  });

  const sizes = {
    mini: (typeof miniM!=='undefined' && miniM ? miniM.length : 0),
    univm: (typeof univM!=='undefined' && univM ? univM.length : 0),
    ck: (typeof ckM!=='undefined' && ckM ? ckM.length : 0),
    pro: (typeof proM!=='undefined' && proM ? proM.length : 0),
    tt: (typeof ttM!=='undefined' && ttM ? ttM.length : 0),
    comp: (typeof comps!=='undefined' && comps ? comps.length : 0),
    tourney: (typeof tourneys!=='undefined' && tourneys ? tourneys.length : 0),
    procomp: (typeof proTourneys!=='undefined' && proTourneys ? proTourneys.length : 0),
    ind: (typeof indM!=='undefined' && indM ? indM.length : 0),
    gj: (typeof gjM!=='undefined' && gjM ? gjM.length : 0)
  };
  window._matchIndex = {idMap, sigMap, builtAt:Date.now(), sizes};
  return window._matchIndex;
}
function _getMatchIndex(){
  // 데이터가 자주 바뀌는 앱이라, 없으면 생성 / 너무 오래됐으면 재생성
  const idx = window._matchIndex;
  if(!idx) return _buildMatchIndex();
  // 데이터 로딩/동기화 타이밍 이슈로, 길이 변화가 있으면 즉시 재인덱싱
  const cur = {
    mini: (typeof miniM!=='undefined' && miniM ? miniM.length : 0),
    univm: (typeof univM!=='undefined' && univM ? univM.length : 0),
    ck: (typeof ckM!=='undefined' && ckM ? ckM.length : 0),
    pro: (typeof proM!=='undefined' && proM ? proM.length : 0),
    tt: (typeof ttM!=='undefined' && ttM ? ttM.length : 0),
    comp: (typeof comps!=='undefined' && comps ? comps.length : 0),
    tourney: (typeof tourneys!=='undefined' && tourneys ? tourneys.length : 0),
    procomp: (typeof proTourneys!=='undefined' && proTourneys ? proTourneys.length : 0),
    ind: (typeof indM!=='undefined' && indM ? indM.length : 0),
    gj: (typeof gjM!=='undefined' && gjM ? gjM.length : 0)
  };
  const prev = idx.sizes || {};
  const changed = Object.keys(cur).some(k => (prev[k]||0) !== cur[k]);
  if(changed) return _buildMatchIndex();
  if(!idx.builtAt || (Date.now()-idx.builtAt) > 20000) return _buildMatchIndex(); // 20초 캐시
  return idx;
}

// ─────────────────────────────────────────────────────────────
// 스트리머 상세 "최근 경기"에서 종목(배지) 클릭 → 경기 상세 팝업
// - matchId가 게임ID(_sN_gN)일 수 있어 세션ID로 정규화 후 찾음
// - 찾은 match를 histDetModal(경기 상세)로 표시
// ─────────────────────────────────────────────────────────────
window.openMatchDetailByMatchId = function(matchId, modeLabel){
  return window._openMatchDetailByMatchId(matchId, modeLabel, false);
};

// 내부 구현: silent=true면 실패 시 alert 안 띄움
window._openMatchDetailByMatchId = function(matchId, modeLabel, silent){
  try{
    const mid = String(matchId||'').trim();
    if(!mid) return false;
    const lbl = String(modeLabel||'').trim();
    const sessId = (mid.includes('_s') && mid.includes('_g')) ? mid.split('_s')[0] : mid;

    // 0) 인덱스로 우선 탐색 (중첩 대회 포함)
    let _idxSkipToNative = false; // 예: 끝장전(gj)은 세션 묶음 처리가 필요하므로 아래 native 로직으로 넘김
    {
      const idx = _getMatchIndex();
      const cands = (idx.idMap.get(mid) || []).concat(idx.idMap.get(sessId) || []);
      if(cands && cands.length){
        const pick = cands[0];
        // game ref → parent match
        if(pick.refType==='game' && pick.parent){
          const pm = pick.parent;
          const lA = pm.teamALabel || pm.a || 'A';
          const lB = pm.teamBLabel || pm.b || 'B';
          const _pair=_histModePair(pick.modeKey||'comp');
          const ca = (typeof gc==='function' ? (gc(lA)||_pair.a) : _pair.a);
          const cb = (typeof gc==='function' ? (gc(lB)||_pair.b) : _pair.b);
          const aW = (pm.sa||0)>(pm.sb||0);
          const bW = (pm.sb||0)>(pm.sa||0);
          const key = 'mid:'+String(pm._id||sessId);
          _regDet(key, pm, pick.modeKey||'comp', lA, lB, ca, cb, aW, bW);
          openHistDetailModal(key);
          return true;
        }
        // procompgj session stored as {a,b,games}
        if(pick.refType==='pcgj' && pick.obj){
          const sess = pick.obj;
          const a = sess.a || 'A';
          const b = sess.b || 'B';
          const games = (sess.games||[]).map((gg,idx2)=>({
            _id: `${sess._id||sessId}_s0_g${idx2}`,
            playerA: a, playerB: b,
            winner: gg.winner===a ? 'A' : gg.winner===b ? 'B' : '',
            map: gg.map || ''
          }));
          const sa = games.filter(g=>g.winner==='A').length;
          const sb = games.filter(g=>g.winner==='B').length;
          const mm = {_id: sess._id||sessId, d: sess.d||'', a, b, sa, sb, sets:[{scoreA:sa, scoreB:sb, winner:sa>sb?'A':sb>sa?'B':'', games}]};
          const _pair=_histModePair('procompgj');
          const ca = (typeof gc==='function' ? (gc(a)||_pair.a) : _pair.a);
          const cb = (typeof gc==='function' ? (gc(b)||_pair.b) : _pair.b);
          const key = 'mid:'+String(mm._id);
          _regDet(key, mm, 'procompgj', a, b, ca, cb, sa>sb, sb>sa);
          openHistDetailModal(key);
          return true;
        }
        if(pick.refType==='obj' && pick.obj){
          const o = pick.obj;
          // sets match
          if(o.sets && (o.a||o.teamALabel) && (o.b||o.teamBLabel)){
            const lA = o.teamALabel || o.a || 'A';
            const lB = o.teamBLabel || o.b || 'B';
            const _pair=_histModePair('procomp');
            const ca = (typeof gc==='function' ? (gc(lA)||_pair.a) : _pair.a);
            const cb = (typeof gc==='function' ? (gc(lB)||_pair.b) : _pair.b);
            const aW = (o.sa||0)>(o.sb||0);
            const bW = (o.sb||0)>(o.sa||0);
            const key = 'mid:'+String(o._id||sessId);
            _regDet(key, o, pick.modeKey||'comp', lA, lB, ca, cb, aW, bW);
            openHistDetailModal(key);
            return true;
          }
          // ind-like
          if(o.wName && o.lName){
            // 끝장전(gj)은 BO 시리즈(여러 게임)로 묶어서 보여줘야 하므로
            // 인덱스에서 단일 게임으로 바로 열지 않고, 아래 native gj 로직(묶음 처리)로 넘김
            const mk = String(pick.modeKey||'');
            if(mk==='gj' || lbl.indexOf('끝장전') !== -1){
              _idxSkipToNative = true;
            } else {
              const key = 'mid:'+String(o._id||sessId);
              const _pair=_histModePair(mk||'ind');
              _regDet(key, {_id:key, d:o.d||'', wName:o.wName, lName:o.lName, map:o.map||''}, mk||'ind', 'WIN', 'LOSE', _pair.a, _pair.b, true, false);
              openHistDetailModal(key);
              return true;
            }
          }
          // a/b + winner
          if(o.a && o.b && o.winner){
            const a=o.a, b=o.b;
            const w = (o.winner==='A' || o.winner===a) ? a : (o.winner==='B' || o.winner===b) ? b : '';
            const l = w===a ? b : w===b ? a : '';
            if(w && l){
              const key='mid:'+String(o._id||sessId);
              const _pair=_histModePair('ind');
              _regDet(key, {_id:key, d:o.d||'', wName:w, lName:l, map:o.map||''}, 'ind', 'WIN', 'LOSE', _pair.a, _pair.b, true, false);
              openHistDetailModal(key);
              return true;
            }
          }
        }
      }
    }
    // 인덱스에서 찾았지만(주로 gj) 단일 표시 대신 묶음 처리가 필요하면 아래 로직으로 계속 진행

    const pickColor = (label, fallback) => {
      try{ return (typeof gc==='function' ? (gc(label)||fallback) : fallback); }
      catch(_){ return fallback; }
    };
    const openAsSetsMatch = (m, modeKey, lA, lB, ca, cb) => {
      const aW = (m.sa||0)>(m.sb||0);
      const bW = (m.sb||0)>(m.sa||0);
      const key = 'mid:'+String(m._id||sessId);
      _regDet(key, m, modeKey, lA, lB, ca, cb, aW, bW);
      openHistDetailModal(key);
      return true;
    };
    const openAsIndLike = (wName, lName, d, map, modeKey='ind') => {
      const key = 'mid:'+sessId;
      const m = {_id:sessId, d:d||'', wName, lName, map:map||''};
      const _pair=_histModePair(modeKey);
      _regDet(key, m, modeKey, 'WIN', 'LOSE', _pair.a, _pair.b, true, false);
      openHistDetailModal(key);
      return true;
    };

    // 1) 개인전(indM) — _id가 gameId
    if(lbl==='개인전' && typeof indM!=='undefined'){
      const g = (indM||[]).find(x=>x && (x._id===mid || x._id===sessId));
      if(g) return openAsIndLike(g.wName, g.lName, g.d, g.map, 'ind');
    }

    // 2) 끝장전(gjM) / 프로리그끝장전(gjM _proLabel)
    if((lbl==='끝장전' || lbl==='프로리그끝장전') && typeof gjM!=='undefined'){
      const arr=(gjM||[]);
      const g = arr.find(x=>x && (
        x._id===mid || x._id===sessId ||
        x.sid===sessId || x.matchId===sessId ||
        x.sid===mid || x.matchId===mid
      ));
      if(g){
        const sid = g.sid || g.matchId || '';
        if(sid){
          const group = arr.filter(x=>x && (x.sid===sid || x.matchId===sid));
          if(group.length>=2){
            const names=[]; const seen=new Set();
            group.forEach(it=>{ [it.wName,it.lName].forEach(n=>{ if(n && !seen.has(n)){ seen.add(n); names.push(n);} }); });
            const A = names[0] || g.wName || 'A';
            const B = names[1] || g.lName || 'B';
            const games = group.slice().reverse().map((it,idx)=>({
              _id: `${sid}_s0_g${idx}`,
              playerA: A,
              playerB: B,
              winner: it.wName===A ? 'A' : it.wName===B ? 'B' : '',
              map: it.map || ''
            }));
            const sa = games.filter(x=>x.winner==='A').length;
            const sb = games.filter(x=>x.winner==='B').length;
            const m = {_id: sid, d: g.d||'', a: A, b: B, sa, sb, sets:[{scoreA:sa, scoreB:sb, winner:sa>sb?'A':sb>sa?'B':'', games}]};
            const _pair=_histModePair('gj');
            return openAsSetsMatch(m, 'gj', A, B, pickColor(A,_pair.a), pickColor(B,_pair.b));
          }
        }
        // sid가 없거나 1게임만 잡히는 데이터(과거 저장/마이그레이션 등)는
        // 같은 날짜 + 같은 선수 페어(끝장전 특성상 BO 시리즈)를 한 세션으로 묶어서 표시
        const _pairKey = [g.wName||'', g.lName||''].map(s=>String(s).trim()).sort().join('||');
        const _isProGJ = (lbl==='프로리그끝장전');
        const group2 = arr.filter(x=>{
          if(!x) return false;
          if(String(x.d||'').trim() !== String(g.d||'').trim()) return false;
          const pk = [x.wName||'', x.lName||''].map(s=>String(s).trim()).sort().join('||');
          if(pk !== _pairKey) return false;
          // 프로끝장전/일반끝장전 분리 (가능한 경우)
          if(typeof x._proLabel !== 'undefined'){
            if(_isProGJ && !x._proLabel) return false;
            if(!_isProGJ && x._proLabel) return false;
          }
          return true;
        });
        if(group2.length>=2){
          const names=[]; const seen=new Set();
          group2.forEach(it=>{ [it.wName,it.lName].forEach(n=>{ if(n && !seen.has(n)){ seen.add(n); names.push(n);} }); });
          const A = names[0] || g.wName || 'A';
          const B = names[1] || g.lName || 'B';
          const gid = `gjgrp_${String(g.d||'')}_${_pairKey}`.replace(/[^\w\-|]/g,'');
          const games = group2.slice().reverse().map((it,idx)=>({
            _id: `${gid}_s0_g${idx}`,
            playerA: A,
            playerB: B,
            winner: it.wName===A ? 'A' : it.wName===B ? 'B' : '',
            map: it.map || ''
          }));
          const sa = games.filter(x=>x.winner==='A').length;
          const sb = games.filter(x=>x.winner==='B').length;
          const mm = {_id: gid, d: g.d||'', a: A, b: B, sa, sb, sets:[{scoreA:sa, scoreB:sb, winner:sa>sb?'A':sb>sa?'B':'', games}]};
          const _pair=_histModePair('gj');
          return openAsSetsMatch(mm, 'gj', A, B, pickColor(A,_pair.a), pickColor(B,_pair.b));
        }
        return openAsIndLike(g.wName, g.lName, g.d, g.map, 'gj');
      }
    }

    // 3) 프로리그 대회 끝장전(proTourneys[].gjMatches) — 세션ID
    if(lbl==='프로리그대회끝장전' || lbl==='프로리그 대회 끝장전'){
      if(typeof proTourneys!=='undefined' && Array.isArray(proTourneys)){
        for(const tn of (proTourneys||[])){
          const sess = (tn?.gjMatches||[]).find(s=>s && s._id===sessId);
          if(sess){
            const a = sess.a || 'A';
            const b = sess.b || 'B';
            const games = (sess.games||[]).map((gg,idx)=>({
              _id: `${sessId}_s0_g${idx}`,
              playerA: a,
              playerB: b,
              winner: gg.winner===a ? 'A' : gg.winner===b ? 'B' : '',
              map: gg.map || ''
            }));
            const sa = games.filter(g=>g.winner==='A').length;
            const sb = games.filter(g=>g.winner==='B').length;
            const m = {_id: sessId, d: sess.d||'', a, b, sa, sb, sets:[{scoreA:sa, scoreB:sb, winner:sa>sb?'A':sb>sa?'B':'', games}]};
            const _pair=_histModePair('procompgj');
            return openAsSetsMatch(m, 'procompgj', a, b, pickColor(a,_pair.a), pickColor(b,_pair.b));
          }
        }
      }
    }

    // 4) 세트 기반: mini/univm/ck/pro/tt/comps/tourneys 등
    const pools=[];
    const push=(arr,modeKey)=>{ if(arr && Array.isArray(arr)) pools.push({arr,modeKey}); };
    if(lbl==='미니대전' || lbl==='시빌워') push(typeof miniM!=='undefined'?miniM:[], 'mini');
    if(lbl==='대학대전') push(typeof univM!=='undefined'?univM:[], 'univm');
    if(lbl==='대학CK') push(typeof ckM!=='undefined'?ckM:[], 'ck');
    if(lbl==='프로리그') push(typeof proM!=='undefined'?proM:[], 'pro');
    if(lbl==='티어대회' || lbl==='티어대회 토너먼트') push(typeof ttM!=='undefined'?ttM:[], 'tt');
    if(lbl==='조별리그' || lbl==='대회' || lbl==='토너먼트') push(typeof comps!=='undefined'?comps:[], 'comp');
    // fallback 전체
    push(typeof miniM!=='undefined'?miniM:[], 'mini');
    push(typeof univM!=='undefined'?univM:[], 'univm');
    push(typeof ckM!=='undefined'?ckM:[], 'ck');
    push(typeof proM!=='undefined'?proM:[], 'pro');
    push(typeof ttM!=='undefined'?ttM:[], 'tt');
    push(typeof comps!=='undefined'?comps:[], 'comp');
    // 기존 대회 구조(tourneys)가 있으면 포함
    if(typeof tourneys!=='undefined') push(tourneys, 'tourney');

    for(const p of pools){
      const m = (p.arr||[]).find(x=>x && (x._id===sessId || x.matchId===sessId || x.id===sessId));
      if(m){
        const lA = m.teamALabel || m.a || 'A';
        const lB = m.teamBLabel || m.b || 'B';
        const _pair=_histModePair(p.modeKey);
        return openAsSetsMatch(m, p.modeKey, lA, lB, pickColor(lA,_pair.a), pickColor(lB,_pair.b));
      }
    }

    // 5) 프로리그 대회(조별/토너/팀전) 내부에서 _id 딥서치
    const deepFindById = (root, id, maxDepth=10) => {
      const seen = new WeakSet();
      const walk = (node, depth) => {
        if(!node || depth>maxDepth) return null;
        if(typeof node !== 'object') return null;
        try{ if(seen.has(node)) return null; seen.add(node); }catch(_){}
        if(node._id===id) return node;
        if(Array.isArray(node)){
          for(const it of node){ const r = walk(it, depth+1); if(r) return r; }
        } else {
          for(const k of Object.keys(node)){ const r = walk(node[k], depth+1); if(r) return r; }
        }
        return null;
      };
      return walk(root, 0);
    };
    if(typeof proTourneys!=='undefined'){
      const found = deepFindById(proTourneys, sessId, 10);
      if(found){
        if(found.sets && (found.a||found.teamALabel) && (found.b||found.teamBLabel)){
          const lA = found.teamALabel || found.a || 'A';
          const lB = found.teamBLabel || found.b || 'B';
        const _pair=_histModePair('procomp');
        return openAsSetsMatch(found, 'procomp', lA, lB, pickColor(lA,_pair.a), pickColor(lB,_pair.b));
        }
        if(found.wName && found.lName){
          return openAsIndLike(found.wName, found.lName, found.d||'', found.map||'', 'ind');
        }
        if(found.a && found.b && found.winner){
          const a = found.a, b = found.b;
          const w = (found.winner==='A' || found.winner===a) ? a : (found.winner==='B' || found.winner===b) ? b : '';
          const l = w===a ? b : w===b ? a : '';
          if(w && l) return openAsIndLike(w, l, found.d||'', found.map||'', 'ind');
        }
      }
    }

    if(!silent) alert('해당 경기 상세 데이터를 찾을 수 없습니다.');
    return false;
  }catch(e){
    if(!silent) alert('경기 상세를 여는 중 오류가 발생했습니다.');
    try{ console.error(e); }catch(_){}
    return false;
  }
};

// ─────────────────────────────────────────────
// 프록시 프리셋 UI
// ─────────────────────────────────────────────
window.histExtPresetSelect = function(id){
  const {presets}=_histExtEnsureProxyPresets();
  const p = presets.find(x=>x.id===id) || presets[0];
  if(!p) return;
  _histExtProxyPresetSelSave(p.id);
  try{
    const proxyEl=document.getElementById('hist-ext-proxy');
    const boEl=document.getElementById('hist-ext-bo');
    const pfEl=document.getElementById('hist-ext-pageFrom');
    const ptEl=document.getElementById('hist-ext-pageTo');
    if(proxyEl) proxyEl.value = p.proxy || '';
    if(boEl) boEl.value = p.bo || 'bj_board';
    if(pfEl) pfEl.value = String(p.pFrom||1);
    if(ptEl) ptEl.value = String(p.pTo||6);
  }catch(e){}
};
window.histExtPresetSaveCurrent = function(){
  const {presets, sel}=_histExtEnsureProxyPresets();
  const idx = presets.findIndex(p=>p.id===sel);
  if(idx<0) return;
  const proxy=(document.getElementById('hist-ext-proxy')?.value||'').trim();
  const bo=(document.getElementById('hist-ext-bo')?.value||'bj_board').trim();
  const pFrom=parseInt(document.getElementById('hist-ext-pageFrom')?.value||'1',10)||1;
  const pTo=parseInt(document.getElementById('hist-ext-pageTo')?.value||String(pFrom),10)||pFrom;
  presets[idx] = {...presets[idx], proxy, bo, pFrom, pTo};
  _histExtProxyPresetsSave(presets);
  // legacy도 갱신
  _histExtProxySave(proxy);
  _histExtProxyCfgSave({bo,pFrom,pTo});
  try{ if(typeof showToast==='function') showToast('저장됨'); }catch(e){}
};
window.histExtPresetAdd = function(){
  const name = prompt('프록시 프리셋 이름');
  if(name===null) return;
  const nm = String(name||'').trim();
  if(!nm) return;
  const {presets}=_histExtEnsureProxyPresets();
  const proxy=(document.getElementById('hist-ext-proxy')?.value||'').trim();
  const bo=(document.getElementById('hist-ext-bo')?.value||'bj_board').trim();
  const pFrom=parseInt(document.getElementById('hist-ext-pageFrom')?.value||'1',10)||1;
  const pTo=parseInt(document.getElementById('hist-ext-pageTo')?.value||String(pFrom),10)||pFrom;
  const p = {id:_histExtUid(), name:nm, proxy, bo, pFrom, pTo};
  const next=[...presets, p];
  _histExtProxyPresetsSave(next);
  _histExtProxyPresetSelSave(p.id);
  try{ render(); }catch(e){}
};
window.histExtPresetRename = function(){
  const {presets, sel}=_histExtEnsureProxyPresets();
  const idx = presets.findIndex(p=>p.id===sel);
  if(idx<0) return;
  const cur = presets[idx].name || '';
  const name = prompt('프리셋 이름 변경', cur);
  if(name===null) return;
  const nm = String(name||'').trim();
  if(!nm) return;
  presets[idx] = {...presets[idx], name:nm};
  _histExtProxyPresetsSave(presets);
  try{ render(); }catch(e){}
};
window.histExtPresetDelete = function(){
  const {presets, sel}=_histExtEnsureProxyPresets();
  const idx = presets.findIndex(p=>p.id===sel);
  if(idx<0) return;
  if(presets.length<=1){ alert('프리셋은 최소 1개가 필요합니다.'); return; }
  if(!confirm(`"${presets[idx].name||'프리셋'}" 프리셋을 삭제할까요?`)) return;
  const next = presets.filter(p=>p.id!==sel);
  _histExtProxyPresetsSave(next);
  _histExtProxyPresetSelSave(next[0]?.id||'');
  try{ render(); }catch(e){}
};

// 스트리머 상세의 history 한 줄 정보(날짜/상대/맵/모드)만으로도 경기 상세 찾기
window.openMatchDetailFromHistory = function(selfName, oppName, date, map, modeLabel, matchId, result){
  try{
    const selfN=String(selfName||'').trim();
    const oppN=String(oppName||'').trim();
    const _normDate = (s) => {
      const t = String(s||'').trim();
      if(!t) return '';
      const m = t.match(/(20\\d{2})\\D?(\\d{1,2})\\D?(\\d{1,2})/);
      if(!m) return t;
      const y=m[1], mo=String(m[2]).padStart(2,'0'), da=String(m[3]).padStart(2,'0');
      return `${y}-${mo}-${da}`;
    };
    const d=_normDate(date);
    const m=String(map||'').trim();
    const lbl=String(modeLabel||'').trim();
    const mid=String(matchId||'').trim();
    const res=String(result||'').trim(); // '승' | '패' (없을 수 있음)

    // ── (추가 폴백) 스트리머 history 자체에서 "같은 날짜+상대+종목"을 묶어서 세트로 표시 ──
    // 원본 배열(ttM/tourneys 등)에서 게임을 못 주워오는 환경/데이터에서도, 유저가 보는 history 기준으로는
    // 분명 같은날 여러 경기가 존재하므로 팝업에서는 최소한 "여러 경기"로 묶여서 보이게 한다.
    if(d && selfN && oppN && lbl){
      const pObj = (typeof players!=='undefined' ? (players||[]).find(p=>p && p.name===selfN) : null);
      const hs = (pObj?.history||[]).filter(h=>{
        if(!h) return false;
        const hd=_normDate(h.date||h.d||'');
        if(hd !== d) return false;
        if(String(h.opp||'').trim() !== oppN) return false;
        if(String(h.mode||'').trim() !== lbl) return false;
        return true;
      });
      if(hs.length >= 2){
        // 시간순(있으면)으로 정렬해서 경기1~N으로 보여주기
        hs.sort((a,b)=>(a.time||0)-(b.time||0));
        const games = hs.map((h,i)=>({
          _id: `histgrp_${lbl}_${d}_${[selfN,oppN].sort().join('_')}_g${i}`.replace(/[^\w\-]/g,''),
          playerA: selfN,
          playerB: oppN,
          winner: (h.result==='승') ? 'A' : (h.result==='패') ? 'B' : '',
          map: h.map || ''
        })).filter(g=>g.winner); // 승패 없는 건 제외
        if(games.length >= 2){
          const sa = games.filter(x=>x.winner==='A').length;
          const sb = games.filter(x=>x.winner==='B').length;
          const mm = {_id:`histgrp_${lbl}_${d}_${[selfN,oppN].sort().join('_')}`.replace(/[^\w\-]/g,''), d, a:selfN, b:oppN, sa, sb,
            sets:[{scoreA:sa, scoreB:sb, winner:sa>sb?'A':sb>sa?'B':'', games}]};
          const _pair=_histModePair(lbl.indexOf('끝장전')!==-1?'gj':'comp');
          const ca = (typeof gc==='function' ? (gc(selfN)||_pair.a) : _pair.a);
          const cb = (typeof gc==='function' ? (gc(oppN)||_pair.b) : _pair.b);
          const key = 'mid:'+mm._id;
          _regDet(key, mm, (lbl.indexOf('티어대회')!==-1?'tt':lbl.indexOf('끝장전')!==-1?'gj':'comp'), selfN, oppN, ca, cb, sa>sb, sb>sa);
          openHistDetailModal(key);
          return true;
        }
      }
    }

    // ── (중요) 실시간 스캔 기반 "날짜+상대 묶기" ──
    // 인덱스(sigMap)는 캐시/타이밍 이슈로 최신 게임을 놓칠 수 있어,
    // 사용자가 클릭했을 때는 해당 모드의 원본 배열을 직접 스캔해서 "같은 날짜+상대" 게임을 전부 모아준다.
    const _pairOk = (a,b) => {
      const A=String(a||'').trim(), B=String(b||'').trim();
      return (A===selfN && B===oppN) || (A===oppN && B===selfN);
    };
    const _pushGameList = (out, pA, pB, winnerName, gMap, gid) => {
      const A=String(pA||'').trim(), B=String(pB||'').trim();
      const W=String(winnerName||'').trim();
      if(!A || !B || !W) return;
      if(!(W===A || W===B)) return;
      // ⚠️ 맵이 '-'(또는 공백)인 게임이 여러 개면, (A,B,W,map) 기준 중복제거로 인해 1개만 남는 문제가 생김.
      // gameId가 있으면 그것을 키로 우선 사용하고, 없으면 시퀀스를 붙여 유니크 처리한다.
      if(out._seq == null) out._seq = 0;
      const mapKey = String(gMap||'').trim();
      const key = gid ? `gid:${gid}` : `${A}|${B}|${W}|${mapKey}|seq:${++out._seq}`;
      if(out._seen.has(key)) return;
      out._seen.add(key);
      out.games.push({playerA:A, playerB:B, winner: (W===A?'A':'B'), map:gMap||''});
    };
    const _collectFromSetsArr = (arr, out) => {
      if(!Array.isArray(arr)) return;
      for(const mm of arr){
        if(!mm) continue;
        const md = _normDate(mm.d || mm.date || '');
        if(d && md && md !== d) continue;
        const sets = mm.sets || [];
        for(let si=0; si<sets.length; si++){
          const set = sets[si];
          const games = set?.games || [];
          for(let gi=0; gi<games.length; gi++){
            const g = games[gi];
            if(!g || !g.winner) continue;
            if(!_pairOk(g.playerA, g.playerB)) continue;
            const wName = (g.winner==='A') ? g.playerA : (g.winner==='B') ? g.playerB : '';
            const gid = g._id || `${mm._id||mm.id||'m'}_s${si}_g${gi}`;
            _pushGameList(out, g.playerA, g.playerB, wName, g.map||'', gid);
          }
        }
      }
    };
    const _collectFromGjArr = (arr, out, proOnly=null) => {
      if(!Array.isArray(arr)) return;
      for(const gg of arr){
        if(!gg) continue;
        const gd = _normDate(gg.d || gg.date || '');
        if(d && gd && gd !== d) continue;
        if(!_pairOk(gg.wName, gg.lName)) continue;
        if(proOnly === true && !gg._proLabel) continue;
        if(proOnly === false && gg._proLabel) continue;
        _pushGameList(out, gg.wName, gg.lName, gg.wName, gg.map||'', gg._id || gg.sid || gg.matchId || '');
      }
    };
    const _collectDeepSets = (root, out, depth=0, seen=new WeakSet()) => {
      if(!root || depth>10) return;
      if(typeof root !== 'object') return;
      try{ if(seen.has(root)) return; seen.add(root); }catch(_){}
      // match object with sets
      if(root.sets && Array.isArray(root.sets)){
        const rd = _normDate(root.d || root.date || '');
        if(!d || !rd || rd === d){
          for(let si=0; si<root.sets.length; si++){
            const set = root.sets[si];
            const games = set?.games || [];
            for(let gi=0; gi<games.length; gi++){
              const g = games[gi];
              if(!g || !g.winner) continue;
              if(!_pairOk(g.playerA, g.playerB)) continue;
              const wName = (g.winner==='A') ? g.playerA : (g.winner==='B') ? g.playerB : '';
              const gid = g._id || `${root._id||root.id||'r'}_s${si}_g${gi}`;
              _pushGameList(out, g.playerA, g.playerB, wName, g.map||'', gid);
            }
          }
        }
      }
      if(Array.isArray(root)){
        for(const it of root) _collectDeepSets(it, out, depth+1, seen);
      } else {
        for(const k of Object.keys(root)) _collectDeepSets(root[k], out, depth+1, seen);
      }
    };
    const _openGroupedSetPopup = (games, modeKeyFallback) => {
      if(!games || games.length < 2) return false;
      const A=selfN, B=oppN;
      const gs = games.map((g,i)=>({
        _id: `grp_${lbl}_${d}_${[A,B].sort().join('_')}_g${i}`.replace(/[^\w\-]/g,''),
        playerA: A,
        playerB: B,
        winner: ((g.winner==='A'?g.playerA:g.playerB)===A) ? 'A' : 'B',
        map: g.map || ''
      }));
      const sa = gs.filter(x=>x.winner==='A').length;
      const sb = gs.filter(x=>x.winner==='B').length;
      const mm = {_id:`grp_${lbl}_${d}_${[A,B].sort().join('_')}`.replace(/[^\w\-]/g,''), d, a:A, b:B, sa, sb,
        sets:[{scoreA:sa, scoreB:sb, winner:sa>sb?'A':sb>sa?'B':'', games:gs}]};
      const _pair=_histModePair(lbl.indexOf('끝장전')!==-1?'gj':'comp');
      const ca = (typeof gc==='function' ? (gc(A)||_pair.a) : _pair.a);
      const cb = (typeof gc==='function' ? (gc(B)||_pair.b) : _pair.b);
      const key='mid:'+mm._id;
      _regDet(key, mm, modeKeyFallback||'comp', A, B, ca, cb, sa>sb, sb>sa);
      openHistDetailModal(key);
      return true;
    };

    // 모드별로 스캔 범위 선택
    if(d && selfN && oppN){
      const out = {games:[], _seen:new Set()};
      if(lbl==='끝장전'){
        _collectFromGjArr(typeof gjM!=='undefined'?gjM:[], out, false);
        if(_openGroupedSetPopup(out.games, 'gj')) return true;
      }
      if(lbl==='프로리그끝장전'){
        _collectFromGjArr(typeof gjM!=='undefined'?gjM:[], out, true);
        if(_openGroupedSetPopup(out.games, 'gj')) return true;
      }
      if(lbl==='대학CK'){
        _collectFromSetsArr(typeof ckM!=='undefined'?ckM:[], out);
        if(_openGroupedSetPopup(out.games, 'ck')) return true;
      }
      if(lbl==='티어대회' || lbl==='티어대회 토너먼트'){
        _collectFromSetsArr(typeof ttM!=='undefined'?ttM:[], out);
        _collectDeepSets(typeof tourneys!=='undefined'?tourneys:[], out);
        if(_openGroupedSetPopup(out.games, 'tt')) return true;
      }
      if(lbl==='프로리그'){
        _collectFromSetsArr(typeof proM!=='undefined'?proM:[], out);
        if(_openGroupedSetPopup(out.games, 'pro')) return true;
      }
      if(lbl==='대학대전'){
        _collectFromSetsArr(typeof univM!=='undefined'?univM:[], out);
        if(_openGroupedSetPopup(out.games, 'univm')) return true;
      }
      if(lbl==='미니대전' || lbl==='시빌워'){
        _collectFromSetsArr(typeof miniM!=='undefined'?miniM:[], out);
        if(_openGroupedSetPopup(out.games, 'mini')) return true;
      }
      if(lbl==='조별리그' || lbl==='대회' || lbl==='토너먼트' || lbl.indexOf('프로리그대회')!==-1 || lbl.indexOf('프로리그 대회')!==-1){
        _collectFromSetsArr(typeof comps!=='undefined'?comps:[], out);
        _collectDeepSets(typeof tourneys!=='undefined'?tourneys:[], out);
        _collectDeepSets(typeof proTourneys!=='undefined'?proTourneys:[], out);
        if(_openGroupedSetPopup(out.games, 'comp')) return true;
      }
    }

    // (요청) A안: 날짜+상대가 같으면 무조건 1매치로 묶기
    // - 스트리머 history는 종종 "개별 게임 1개" 단위로 쌓여있어서 종목 클릭 시 1개만 뜨는 문제가 있었음
    // - 탭에 있는 원본 데이터(세트/대회/끝장전/CK/티어대회 등)에서 "같은 날짜 + 같은 선수 페어" 게임을 전부 모아 세트형으로 표시
    const _labelToModeKeys = (label) => {
      if(!label) return [];
      if(label==='대학CK') return ['ck'];
      if(label==='대학대전') return ['univm'];
      if(label==='미니대전' || label==='시빌워') return ['mini'];
      if(label==='프로리그') return ['pro'];
      if(label.indexOf('티어대회') !== -1) return ['tt','tourney']; // 티어대회 토너먼트가 tourneys에 들어있는 케이스 대응
      if(label.indexOf('끝장전') !== -1) return ['gj','procompgj'];
      if(label==='조별리그' || label==='대회' || label==='토너먼트' || label.indexOf('프로리그대회') !== -1 || label.indexOf('프로리그 대회') !== -1)
        return ['comp','tourney','procomp'];
      // 기타는 제한하지 않음
      return [];
    };
    const _wantModeKeys = _labelToModeKeys(lbl);
    if(d && selfN && oppN && lbl && lbl!=='개인전'){
      const idx = _getMatchIndex();
      const pair = [selfN, oppN].sort().join('||');
      const sig = [d, pair, ''].join('|');
      const entries = idx.sigMap.get(sig) || [];
      // mode 필터 적용 (필터가 비어있으면 전부 허용)
      const filtered = _wantModeKeys.length ? entries.filter(e => _wantModeKeys.includes(e.modeKey)) : entries;

      // game 수집 (중복 제거)
      const outGames = [];
      const seenGame = new Set();
      const pushGame = (pA, pB, winnerName, gMap) => {
        const A = String(pA||'').trim(), B = String(pB||'').trim();
        const W = String(winnerName||'').trim();
        if(!A || !B || !W) return;
        if(!(W===A || W===B)) return;
        const key = [A,B,W,String(gMap||'').trim()].join('|');
        if(seenGame.has(key)) return;
        seenGame.add(key);
        outGames.push({
          playerA: A,
          playerB: B,
          winner: W===A ? 'A' : 'B',
          map: gMap || ''
        });
      };

      filtered.forEach(ent=>{
        if(!ent) return;
        if(ent.refType==='game' && ent.game){
          const g = ent.game;
          const wName = (g.winner==='A') ? g.playerA : (g.winner==='B') ? g.playerB : '';
          pushGame(g.playerA, g.playerB, wName, g.map||'');
        } else if(ent.refType==='pcgj' && ent.obj){
          const s = ent.obj;
          const A = s.a, B = s.b;
          (s.games||[]).forEach(gg=>{
            pushGame(A, B, gg.winner, gg.map||'');
          });
        } else if(ent.refType==='obj' && ent.obj){
          const o = ent.obj;
          if(o.wName && o.lName){
            pushGame(o.wName, o.lName, o.wName, o.map||'');
          } else if(o.a && o.b && o.winner){
            const a=o.a, b=o.b;
            const w = (o.winner==='A'||o.winner===a) ? a : (o.winner==='B'||o.winner===b) ? b : '';
            pushGame(a, b, w, o.map||'');
          }
        }
      });

      // 2게임 이상이면 세트형으로 묶어서 표시
      if(outGames.length >= 2){
        // self/opp를 A/B로 고정해서 표기 (요청: 날짜+상대 기준 묶기)
        const A = selfN, B = oppN;
        const games = outGames.map((g, i)=>({
          _id: `grp_${d}_${[A,B].sort().join('_')}_g${i}`.replace(/[^\w\-]/g,''),
          playerA: A,
          playerB: B,
          winner: (g.winner==='A' ? g.playerA : g.playerB)===A ? 'A' : 'B',
          map: g.map || ''
        }));
        const sa = games.filter(x=>x.winner==='A').length;
        const sb = games.filter(x=>x.winner==='B').length;
        const mm = {_id:`grp_${lbl}_${d}_${[A,B].sort().join('_')}`.replace(/[^\w\-]/g,''), d, a: A, b: B, sa, sb,
          sets:[{scoreA:sa, scoreB:sb, winner:sa>sb?'A':sb>sa?'B':'', games}]};
        const _pair=_histModePair(modeKey);
        const ca = (typeof gc==='function' ? (gc(A)||_pair.a) : _pair.a);
        const cb = (typeof gc==='function' ? (gc(B)||_pair.b) : _pair.b);
        const modeKey = (_wantModeKeys[0] || (lbl.indexOf('끝장전')!==-1?'gj':'comp'));
        const key = 'mid:'+mm._id;
        _regDet(key, mm, modeKey, A, B, ca, cb, sa>sb, sb>sa);
        openHistDetailModal(key);
        return true;
      }
    }

    // 끝장전은 "한 세션(BO5 등)"으로 묶어서 보여주는 게 기본 기대값이라,
    // history의 matchId가 개별 게임ID로 들어와도 날짜+선수페어 기준으로 묶어서 우선 표시한다.
    if((lbl==='끝장전' || lbl==='프로리그끝장전') && typeof gjM!=='undefined'){
      const arr = (gjM||[]);
      const dateOk = (xDate) => !d || _normDate(xDate) === d;
      const playersOk = (a,b) => {
        const A=String(a||'').trim(), B=String(b||'').trim();
        return (A===selfN && B===oppN) || (A===oppN && B===selfN);
      };
      const group = arr.filter(x=>{
        if(!x) return false;
        if(x.d && !dateOk(x.d)) return false;
        // 일부 데이터는 d가 비어있을 수 있어, 그런 경우엔 날짜 필터를 강제하지 않음
        if(x.wName && x.lName){
          if(!playersOk(x.wName, x.lName)) return false;
        } else return false;
        // 프로끝장전/일반끝장전 구분 (가능한 경우)
        if(typeof x._proLabel !== 'undefined'){
          if(lbl==='프로리그끝장전' && !x._proLabel) return false;
          if(lbl==='끝장전' && x._proLabel) return false;
        }
        return true;
      });
      if(group.length >= 2){
        const names=[]; const seen=new Set();
        group.forEach(it=>{ [it.wName,it.lName].forEach(n=>{ if(n && !seen.has(n)){ seen.add(n); names.push(n);} }); });
        const A = names[0] || selfN || 'A';
        const B = names[1] || oppN || 'B';
        const gid = `gjgrp_${d}_${[A,B].sort().join('_')}`.replace(/[^\w\-]/g,'');
        const games = group.slice().reverse().map((it,idx)=>({
          _id: `${gid}_s0_g${idx}`,
          playerA: A,
          playerB: B,
          winner: it.wName===A ? 'A' : it.wName===B ? 'B' : '',
          map: it.map || ''
        }));
        const sa = games.filter(x=>x.winner==='A').length;
        const sb = games.filter(x=>x.winner==='B').length;
        const mm = {_id: gid, d, a: A, b: B, sa, sb, sets:[{scoreA:sa, scoreB:sb, winner:sa>sb?'A':sb>sa?'B':'', games}]};
        const _pair=_histModePair(lbl.indexOf('끝장전')!==-1?'gj':'comp');
        const ca = (typeof gc==='function' ? (gc(A)||_pair.a) : _pair.a);
        const cb = (typeof gc==='function' ? (gc(B)||_pair.b) : _pair.b);
        const key = 'mid:'+gid;
        _regDet(key, mm, 'gj', A, B, ca, cb, sa>sb, sb>sa);
        openHistDetailModal(key);
        return true;
      }
    }

    if(mid){
      const ok = window._openMatchDetailByMatchId(mid, lbl, true);
      if(ok) return true;
    }

    // 인덱스 signature 기반 탐색 (날짜+선수쌍+맵)
    {
      const idx = _getMatchIndex();
      const pair = [selfN, oppN].sort().join('||');
      const mKey = (m && m !== '-') ? m : '';
      const sig = [d, pair, mKey].join('|');
      const cands = (idx.sigMap.get(sig) || []).concat(idx.sigMap.get([d,pair,''].join('|')) || []);
      if(cands && cands.length){
        // 가장 먼저 들어온 후보를 id로 다시 열기 (세트 경기면 match._id, game이면 game._id)
        const c = cands[0];
        if(c.refType==='game' && c.parent && c.parent._id){
          return window._openMatchDetailByMatchId(c.parent._id, lbl, false);
        }
        if(c.refType==='obj' && c.obj && (c.obj._id || c.obj.id)){
          return window._openMatchDetailByMatchId(c.obj._id || c.obj.id, lbl, false);
        }
      }
    }

    // fallback: 날짜+선수쌍(+맵)으로 game 포함 여부 검색
    const mapOk = (gMap) => {
      if(!m || m==='-') return true;
      return String(gMap||'').trim() === m;
    };
    const playersOk = (a,b) => {
      const A=String(a||'').trim(), B=String(b||'').trim();
      return (A===selfN && B===oppN) || (A===oppN && B===selfN);
    };
    const dateOk = (xDate) => !d || String(xDate||'').trim() === d;

    // 개인전/끝장전 단일 게임
    if((lbl==='개인전') && typeof indM!=='undefined'){
      const g=(indM||[]).find(x=>x && dateOk(x.d) && playersOk(x.wName,x.lName) && mapOk(x.map));
      if(g) return window._openMatchDetailByMatchId(g._id||'', lbl, false);
    }
    if((lbl==='끝장전' || lbl==='프로리그끝장전') && typeof gjM!=='undefined'){
      const g=(gjM||[]).find(x=>x && dateOk(x.d) && playersOk(x.wName,x.lName) && mapOk(x.map));
      if(g) return window._openMatchDetailByMatchId(g._id||g.sid||'', lbl, false);
    }

    // 프로리그 대회 끝장전 세션
    if((lbl==='프로리그대회끝장전' || lbl==='프로리그 대회 끝장전') && typeof proTourneys!=='undefined'){
      for(const tn of (proTourneys||[])){
        const sess=(tn?.gjMatches||[]).find(s=>s && dateOk(s.d) && playersOk(s.a,s.b));
        if(sess) return window._openMatchDetailByMatchId(sess._id||'', '프로리그대회끝장전', false);
      }
    }

    // 세트 경기들: 특정 모드 풀 우선, 없으면 전체 풀
    const pools=[];
    const push=(arr,modeKey)=>{ if(arr && Array.isArray(arr)) pools.push({arr,modeKey}); };
    if(lbl==='미니대전' || lbl==='시빌워') push(typeof miniM!=='undefined'?miniM:[], 'mini');
    if(lbl==='대학대전') push(typeof univM!=='undefined'?univM:[], 'univm');
    if(lbl==='대학CK') push(typeof ckM!=='undefined'?ckM:[], 'ck');
    if(lbl==='프로리그') push(typeof proM!=='undefined'?proM:[], 'pro');
    if(lbl==='티어대회' || lbl==='티어대회 토너먼트') push(typeof ttM!=='undefined'?ttM:[], 'tt');
    if(lbl==='조별리그' || lbl==='대회' || lbl==='토너먼트') push(typeof comps!=='undefined'?comps:[], 'comp');
    // fallback
    push(typeof miniM!=='undefined'?miniM:[], 'mini');
    push(typeof univM!=='undefined'?univM:[], 'univm');
    push(typeof ckM!=='undefined'?ckM:[], 'ck');
    push(typeof proM!=='undefined'?proM:[], 'pro');
    push(typeof ttM!=='undefined'?ttM:[], 'tt');
    push(typeof comps!=='undefined'?comps:[], 'comp');

    for(const p of pools){
      for(const mm of (p.arr||[])){
        if(!mm || !dateOk(mm.d)) continue;
        const sets = mm.sets || [];
        for(const set of sets){
          const games = set.games || [];
          for(const g of games){
            if(!g) continue;
            if(playersOk(g.playerA,g.playerB) && mapOk(g.map)){
              return window._openMatchDetailByMatchId(mm._id||mm.id||'', lbl, false);
            }
          }
        }
      }
    }

    // 마지막 폴백: 원본 history 한 줄 정보로라도 상세 팝업을 띄움
    // (일부 데이터는 match 배열(gjM/indM/comps/ttM 등)에 없고 history만 존재)
    const wName = (res==='승') ? selfN : (res==='패') ? oppN : selfN;
    const lName = (res==='승') ? oppN  : (res==='패') ? selfN : oppN;
    const key = 'hist:'+ [d, lbl, wName, lName, m].join('|');
    const isGJ = (lbl.indexOf('끝장전') !== -1);
    const modeKey = isGJ ? 'gj' : 'ind';
    const memo = '⚠️ 원본 경기(세트/대회) 데이터를 찾지 못해 history 기반 단일 경기로 표시합니다.';
    const mm = {_id:key, d, wName, lName, map: m||'', memo};
    const _pair=_histModePair(modeKey);
    _regDet(key, mm, modeKey, 'WIN', 'LOSE', _pair.a, _pair.b, true, false);
    openHistDetailModal(key);
    return true;
  }catch(e){
    alert('경기 상세를 여는 중 오류가 발생했습니다.');
    try{ console.error(e); }catch(_){}
    return false;
  }
};

function buildDetailHTML(m, mode, labelA, labelB, ca, cb, aWin, bWin){
  const _memoNote = m.memo
    ? `<div class="modal-danger-note" style="background:#fffaf0;border-color:#fde68a;color:#92400e;margin-bottom:8px">📝 ${m.memo}</div>`
    : '';
  // ind/gj: (단일 경기) sets 없이 wName/lName/map 구조
  // 단, 끝장전(BO 시리즈)처럼 sets가 존재하는 경우는 아래 세트 렌더링을 사용한다.
  if((mode==='ind'||mode==='gj'||mode==='progj') && (!m.sets || !m.sets.length)){
    const pW=players.find(p=>p.name===m.wName), pL=players.find(p=>p.name===m.lName);
    const rW=pW?`<span class="rbadge r${pW.race}" style="font-size:10px">${pW.race}</span>`:'';
    const rL=pL?`<span class="rbadge r${pL.race}" style="font-size:10px">${pL.race}</span>`:'';
    const typeChip = mode==='ind' ? '⚔️ 개인전' : (mode==='progj' ? '👑 프로리그 끝장전' : '🔥 끝장전');
    const photoW=pW?getPlayerPhotoHTML(pW.name,'52px',`flex-shrink:0;border:2px solid ${ca};box-shadow:0 2px 10px ${ca}44`):'';
    const photoL=pL?getPlayerPhotoHTML(pL.name,'52px',`flex-shrink:0;border:2px solid ${cb};box-shadow:0 2px 10px ${cb}33`):'';
    const univW=pW?.univ?`<span style="font-size:10px;color:var(--text3);font-weight:700">${pW.univ}</span>`:'';
    const univL=pL?.univ?`<span style="font-size:10px;color:var(--text3);font-weight:700">${pL.univ}</span>`:'';
    const mapStr=m.map?`<span style="font-size:10px;color:#475569;white-space:nowrap;font-weight:800;background:#eef2ff;border:1px solid #c7d2fe;padding:2px 8px;border-radius:999px">${m.map}</span>`:'';
    return `${_memoNote}<div style="padding:4px 0">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;margin-bottom:8px">
        <span style="font-size:10px;color:#1e40af;font-weight:900;background:#dbeafe;border:1px solid #bfdbfe;padding:3px 9px;border-radius:999px">${typeChip}</span>
        ${mapStr}
      </div>
      <div style="display:grid;grid-template-columns:minmax(0,1fr) auto minmax(0,1fr);gap:10px;align-items:center">
        <div style="padding:10px 12px;border-radius:14px;background:linear-gradient(180deg,#ffffff,#f8fafc);border:1px solid ${ca}33;box-shadow:0 3px 12px rgba(15,23,42,.05);min-width:0">
          <div style="display:flex;align-items:center;gap:8px;min-width:0">
            ${photoW?`<span style="flex-shrink:0">${photoW}</span>`:''}
            <div style="min-width:0">
              <div style="display:flex;align-items:center;gap:5px;flex-wrap:wrap">${rW}<span style="font-size:14px;font-weight:900;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${m.wName||''}</span></div>
              <div style="display:flex;align-items:center;gap:5px;flex-wrap:wrap;margin-top:3px"><span style="font-size:10px;color:#fff;font-weight:900;background:${ca};padding:2px 7px;border-radius:999px">WIN</span>${univW}</div>
            </div>
          </div>
      </div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:5px">
          <div style="font-size:22px;font-weight:1000;color:${ca};line-height:1">1 <span style="font-size:14px;color:var(--gray-l)">:</span> 0</div>
          <div style="font-size:10px;color:var(--gray-l);font-weight:800">DETAIL MATCH</div>
        </div>
        <div style="padding:10px 12px;border-radius:14px;background:linear-gradient(180deg,#ffffff,#f8fafc);border:1px solid ${cb}22;box-shadow:0 3px 12px rgba(15,23,42,.05);opacity:.92;min-width:0">
          <div style="display:flex;align-items:center;gap:8px;min-width:0">
            ${photoL?`<span style="flex-shrink:0">${photoL}</span>`:''}
            <div style="min-width:0">
              <div style="display:flex;align-items:center;gap:5px;flex-wrap:wrap">${rL}<span style="font-size:14px;font-weight:800;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${m.lName||''}</span></div>
              <div style="display:flex;align-items:center;gap:5px;flex-wrap:wrap;margin-top:3px"><span style="font-size:10px;color:${cb};font-weight:800;background:${typeof getMatchWinTint==='function'?getMatchWinTint(cb):(cb+'18')};border:1px solid ${cb}33;padding:2px 7px;border-radius:999px">LOSE</span>${univL}</div>
            </div>
          </div>
        </div>
      </div>
    </div>`;
  }
  if(!m.sets||!m.sets.length) return `${_memoNote}<div style="font-size:12px;color:var(--gray-l);padding:8px 0">세트 상세 기록 없음</div>`;
  let h=_memoNote;
  m.sets.forEach((set,si)=>{
    const isAce=(si===m.sets.length-1&&m.sets.length>=3);
    const sLabel=isAce?'🎯 에이스전':`${si+1}세트`;
    const swA=set.scoreA||0, swB=set.scoreB||0;
    const setAWin=swA>swB, setBWin=swB>swA;
    h+=`<div class="set-row">
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px;padding:5px 10px;background:${isAce?'#f5f3ff':'var(--blue-l)'};border-radius:7px;border:1px solid ${isAce?'#ddd6fe':'var(--blue-ll)'}">
        <span class="set-row-title ${isAce?'ace-t':''}" style="margin-bottom:0;font-size:12px">${sLabel}</span>
        <span class="ubadge${setAWin?'':' loser'}" style="background:${ca};font-size:10px">${labelA}</span>
        <span style="font-weight:800;font-size:14px">
          <span class="${setAWin?'wt':setBWin?'lt':'pt-z'}">${swA}</span>
          <span style="color:var(--border2)"> : </span>
          <span class="${setBWin?'wt':setAWin?'lt':'pt-z'}">${swB}</span>
        </span>
        <span class="ubadge${setBWin?'':' loser'}" style="background:${cb};font-size:10px">${labelB}</span>
        ${setAWin?`<span style="font-size:10px;font-weight:700;color:${ca}">▶ ${labelA} 승</span>`:setBWin?`<span style="font-size:10px;font-weight:700;color:${cb}">▶ ${labelB} 승</span>`:''}
      </div>`;
    if(set.games&&set.games.length){
      set.games.forEach((g,gi)=>{
        if(!g.playerA&&!g.playerB)return;
        const pA=players.find(p=>p.name===g.playerA);
        const pB=players.find(p=>p.name===g.playerB);
        const aIsWinner=(g.winner==='A');
        const bIsWinner=(g.winner==='B');
        const hasWinner=!!(g.winner);
        const winBgA=(typeof getMatchWinTint==='function'?getMatchWinTint(ca):(ca+'22'));
        const winBgB=(typeof getMatchWinTint==='function'?getMatchWinTint(cb):(cb+'22'));
        const winBorderA=ca+'88'; const winBorderB=cb+'88';
        const _pASafe=(g.playerA||'').replace(/\\/g,'\\\\').replace(/'/g,"\\'");
        const _pBSafe=(g.playerB||'').replace(/\\/g,'\\\\').replace(/'/g,"\\'");
        // (설정) 경기 결과 팝업( histDetModal )에서 스트리머 클릭 시 팝업 닫기 여부
        const clickA=g.playerA?`onclick="(()=>{ const _s=JSON.parse(localStorage.getItem('su_pd_style')||'{}'); if(_s.close_on_match_player!==false){ const _m=document.getElementById('histDetModal'); if(_m) _m.style.display='none'; } })();setTimeout(()=>openPlayerModal('${_pASafe}'),80)" style="cursor:pointer;text-decoration:underline dotted;"`:''
        const clickB=g.playerB?`onclick="(()=>{ const _s=JSON.parse(localStorage.getItem('su_pd_style')||'{}'); if(_s.close_on_match_player!==false){ const _m=document.getElementById('histDetModal'); if(_m) _m.style.display='none'; } })();setTimeout(()=>openPlayerModal('${_pBSafe}'),80)" style="cursor:pointer;text-decoration:underline dotted;"`:''
        const raceA=pA?`<span class="rbadge r${pA.race}" style="font-size:10px;flex-shrink:0">${pA.race}</span>`:'';
        const raceB=pB?`<span class="rbadge r${pB.race}" style="font-size:10px;flex-shrink:0">${pB.race}</span>`:'';
        // 경기 상세 카드(경기 기록 네모) 프로필 이미지: 1배(조금 더 크게)
        const photoA=pA?getPlayerPhotoHTML(pA.name,'40px','flex-shrink:0;border:2px solid '+ca+';box-shadow:0 1px 6px '+ca+'44'):'';
        const photoB=pB?getPlayerPhotoHTML(pB.name,'40px','flex-shrink:0;border:2px solid '+cb+';box-shadow:0 1px 6px '+cb+'44'):'';
        const editBtn=isLoggedIn&&m._editRef?`<button class="btn btn-o btn-xs no-export" style="margin-left:4px;flex-shrink:0" onclick="openGameEditModal('${m._editRef}',${si},${gi})">✏️</button>`:'';

        {
          // (대회 상세 팝업) 더 컴팩트/세련된 한 줄 카드 UI
          const winA = aIsWinner&&hasWinner;
          const winB = bIsWinner&&hasWinner;
          const _ct = t => t ? t.replace(/티어$/,'') : '';
          const _tierBadge = (tier) => tier ? `<span style="background:${getTierBtnColor(tier)||'#64748b'};color:${getTierBtnTextColor(tier)||'#fff'};font-size:9px;font-weight:700;padding:1px 5px;border-radius:6px;flex-shrink:0"><span class="tier-pc">${tier}</span><span class="tier-mob">${_ct(tier)}</span></span>` : '';
          const tierA = _tierBadge(pA?.tier);
          const tierB = _tierBadge(pB?.tier);
          const winMark = col => `<span class="cmd-win" style="--cmd-col:${col}">WIN</span>`;

          // 팝업(대회탭/기록탭)에서는 동일한 '세련된' 경기 카드 UI 사용
          if((window.__detailCtx||'')==='compModal' || (window.__detailCtx||'')==='histModal'){
            const loseA = hasWinner && !winA;
            const loseB = hasWinner && !winB;
            const pAHtml = photoA ? `<span class="cmd-photo ${loseA?'is-lose':''}">${photoA}</span>` : '';
            const pBHtml = photoB ? `<span class="cmd-photo ${loseB?'is-lose':''}">${photoB}</span>` : '';
            h+=`<div class="cmd-game">
              <div class="cmd-game-row">
                <div class="cmd-player ${winA?'is-win':''} ${loseA?'is-lose':''}" style="--cmd-col:${ca};${winA?`background:${(typeof getMatchWinTint==='function'?getMatchWinTint(ca):(ca+'22'))};border-color:${ca}55;`:''}">
                  <div class="cmd-player-meta">
                    <div class="cmd-player-name" ${clickA}><span class="cmd-player-inline">${tierA}${raceA}</span><span class="cmd-player-name__txt">${g.playerA||'?'}</span></div>
                  </div>
                  ${winA?`${winMark(ca)}${pAHtml}`:pAHtml}
                </div>
                <div class="cmd-midbox">
                  <div class="cmd-gno">경기 ${gi+1}</div>
                  ${g.map?`<div class="cmd-gmap">${g.map}</div>`:''}
                </div>
                <div class="cmd-player ${winB?'is-win':''} ${loseB?'is-lose':''} is-right" style="--cmd-col:${cb};${winB?`background:${(typeof getMatchWinTint==='function'?getMatchWinTint(cb):(cb+'22'))};border-color:${cb}55;`:''}">
                  ${winB?`${pBHtml}${winMark(cb)}`:pBHtml}
                  <div class="cmd-player-meta">
                    <div class="cmd-player-name" ${clickB}><span class="cmd-player-name__txt">${g.playerB||'?'}</span><span class="cmd-player-inline">${raceB}${tierB}</span></div>
                  </div>
                </div>
                ${editBtn}
              </div>
            </div>`;
          } else {
            // ── [WIN] [소속 종족 이름] [사진] vs [사진] [이름 종족 소속] [WIN] ──
            // (요청사항) 경기 상세 창에서 패자 영역이 '반투명'처럼 보이지 않도록
            // 패자 스타일에 opacity를 적용하지 않는다. (승자만 강조)
            const loserStyleA = '';
            const loserStyleB = '';
            const winBadge = col => `<span style="background:${col};color:#fff;font-size:10px;font-weight:800;padding:2px 7px;border-radius:4px;flex-shrink:0">WIN</span>`;
            const mapDot = g.map ? `<span style="font-size:10px;color:var(--text3);white-space:nowrap;flex-shrink:0">${g.map}</span>` : '';
            // (요청사항) 패자 프로필 사진 흐리게
            const loseA = hasWinner && !winA;
            const loseB = hasWinner && !winB;
            const photoAHtml = photoA ? `<span class="cmd-photo ${loseA?'is-lose':''}">${photoA}</span>` : '';
            const photoBHtml = photoB ? `<span class="cmd-photo ${loseB?'is-lose':''}">${photoB}</span>` : '';
            const nameStyleA = loseA ? 'opacity:.7;color:#64748b;' : 'opacity:1;';
            const nameStyleB = loseB ? 'opacity:.7;color:#64748b;' : 'opacity:1;';
            h+=`<div style="display:flex;flex-direction:column;gap:3px;padding:5px 2px;">
              <div style="display:flex;align-items:center;gap:5px;">
                <span style="color:var(--gray-l);font-size:11px;min-width:40px;font-weight:700;flex-shrink:0;text-align:center">경기${gi+1}</span>
                <!-- 좌측 선수: [WIN] [티어 종족 이름] [사진] -->
                <div style="flex:1;display:flex;align-items:center;gap:5px;padding:6px 8px;border-radius:12px;background:${winA?ca+'18':'var(--surface)'};border:${winA?'1.5px solid '+ca+'55':'1px solid var(--border)'};min-width:0;${loserStyleA}">
                  ${winA ? winBadge(ca) : ''}
                  <div style="flex:1;min-width:0;display:flex;align-items:center;justify-content:flex-end;gap:4px;overflow:hidden">
                    ${tierA}${raceA}
                    <strong style="font-size:13px;color:var(--text);white-space:nowrap;${nameStyleA}" ${clickA}>${g.playerA||'?'}</strong>
                  </div>
                  ${photoAHtml}
                </div>
                <span style="color:var(--gray-l);font-size:12px;font-weight:800;flex-shrink:0">vs</span>
                <!-- 우측 선수: [사진] [이름 종족 티어] [WIN] -->
                <div style="flex:1;display:flex;align-items:center;gap:5px;padding:6px 8px;border-radius:12px;background:${winB?cb+'18':'var(--surface)'};border:${winB?'1.5px solid '+cb+'55':'1px solid var(--border)'};min-width:0;${loserStyleB}">
                  ${photoBHtml}
                  <div style="flex:1;min-width:0;display:flex;align-items:center;gap:4px;overflow:hidden">
                    <strong style="font-size:13px;color:var(--text);white-space:nowrap;${nameStyleB}" ${clickB}>${g.playerB||'?'}</strong>
                    ${raceB}${tierB}
                  </div>
                  ${winB ? winBadge(cb) : ''}
                </div>
                ${editBtn}
              </div>
              ${mapDot ? `<div style="padding-left:48px;font-size:10px;color:var(--text3)">${mapDot}</div>` : ''}
            </div>`;
          }
        }
      });
    } else {
      h+=`<div style="font-size:11px;color:var(--gray-l);padding:4px 0">상세 경기 기록 없음</div>`;
    }
    h+=`</div>`;
  });
  h+=`</div>`;
  return h;
}

