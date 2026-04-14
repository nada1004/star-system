// --- 공통 헬퍼 ---
function _getTeamName(m, side){
  const tLabel=side==='A'?m.teamALabel:m.teamBLabel;
  const tName=side==='A'?m.a:m.b;
  if(tName && !['A팀','B팀','A조','B조'].includes(tName)){
    if(m.a===m.b) return tName+' '+side+'팀';
    return tName;
  }
  const mems=side==='A'?m.teamAMembers:m.teamBMembers;
  if(!mems||!mems.length) return side==='A'?'A팀':'B팀';
  const uCount={};
  mems.forEach(p=>{const u=p.univ||'무소속';uCount[u]=(uCount[u]||0)+1;});
  const uKeys=Object.keys(uCount);
  if(uKeys.length===1 && uKeys[0]!=='무소속'){
    if(m.a===m.b || (m.teamALabel&&m.teamBLabel&&m.teamALabel.includes('A')&&m.teamBLabel.includes('B'))) return uKeys[0]+' '+side+'팀';
    return uKeys[0];
  }
  if(tLabel && !['A팀','B팀','A조','B조'].includes(tLabel)) return tLabel;
  return '연합';
}

function _hasValidScore(m){
  if(m.sa!=null && m.sa!=='' && m.sb!=null && m.sb!=='') return true;
  if(Array.isArray(m.sets) && m.sets.length>0) return true;
  return false;
}

function rHist(C,T){
  T.innerText='📅 대전 기록';

  const tabDefs=[
    {id:'all',      grp:'종합',   lbl:'📋 전체 통합'},
    {id:'psearch',  grp:'종합',   lbl:'🔍 스트리머별 검색'},
    {id:'race',     grp:'종합',   lbl:'🧬 종족 승률'},
    {id:'vs',       grp:'종합',   lbl:'⚔️ 1:1 상대전적'},
    {id:'ind',      grp:'개인',    lbl:'🎮 개인전'},
    {id:'gj',       grp:'개인',    lbl:'⚔️ 끝장전'},
    {id:'mini',     grp:'팀',  lbl:'⚡ 미니대전'},
    {id:'ck',       grp:'팀',  lbl:'🤝 대학CK'},
    {id:'univm',    grp:'팀',  lbl:'🏟️ 대학대전'},
    {id:'civil',    grp:'팀',  lbl:'⚔️ 시빌워'},
    {id:'tourney',  grp:'대회',    lbl:'🎖️ 대회 (토너먼트)'},
    {id:'tiertour', grp:'대회',    lbl:'🎯 티어대회'},
    {id:'pro',      grp:'프로리그', lbl:'🏅 일반'},
    {id:'progj',    grp:'프로리그', lbl:'⚔️ 끝장전'},
    {id:'procomp',  grp:'프로리그', lbl:'🏆 대회 기록'},
    {id:'procomptn',  grp:'프로리그', lbl:'🗂️ 토너먼트'},
    {id:'procompteam',grp:'프로리그', lbl:'🤝 팀전'},
    {id:'univstat', grp:'종합',   lbl:'🏛️ 대학별 기록'},
    {id:'univrank', grp:'종합',   lbl:'🏛️ 대학별 포인트'},
    {id:'univcomp',  grp:'종합',   lbl:'⚔️ 대학 전력 비교'},
  ];
  
  const curTab=tabDefs.find(t=>t.id===histSub)||tabDefs[0];
  const grps=['종합', '개인', '팀', '대회', '프로리그'];
  
  if(window._histDetailOpen===undefined) window._histDetailOpen=false;
  const _needDateFilter=['mini','civil','ck','univm','comp','tourney','pro','race','ind','gj','progj','tiertour','procomp','all'].includes(histSub);
  
  let h='';

  // ── 상단 Sticky Bar ──
  h+=`<div class="no-export" style="position:sticky;top:0;z-index:30;background:var(--bg);padding:0 0 10px;margin-bottom:10px;border-bottom:1px solid var(--border)">`;

  const _activeHistFilterCount=(()=>{
    return [
      filterYear!=='전체',
      filterMonth!=='전체',
      recSortDir!=='desc'
    ].filter(Boolean).length;
  })();

  h+=`<div style="display:flex;align-items:center;gap:6px;margin-bottom:8px">`;
  h+=`<button onclick="window._histDetailOpen=!window._histDetailOpen;render()" style="display:inline-flex;align-items:center;gap:5px;padding:6px 12px;border:1.5px solid ${_activeHistFilterCount>0?'var(--blue)':'var(--border2)'};border-radius:8px;background:${_activeHistFilterCount>0?'var(--blue-ll)':'var(--surface)'};color:${_activeHistFilterCount>0?'var(--blue)':'var(--text2)'};font-size:12px;font-weight:800;cursor:pointer;flex-shrink:0">⚙ 필터${_activeHistFilterCount>0?` (${_activeHistFilterCount})`:''} ${window._histDetailOpen?'▲':'▼'}</button>`;

  h+=`<div style="flex:1;display:flex;align-items:center;gap:4px;background:var(--surface);border:1.5px solid var(--border2);border-radius:12px;padding:4px;overflow-x:auto;scrollbar-width:none;-webkit-overflow-scrolling:touch">`;
  grps.forEach(g=>{
    const isOn=curTab.grp===g;
    const firstId=tabDefs.find(t=>t.grp===g)?.id || 'all';
    h+=`<button onclick="histSub='${firstId}';openDetails={};if(histPage['${firstId}']!==undefined)histPage['${firstId}']=0;render()"
      style="flex:1;min-width:60px;padding:7px 10px;border-radius:8px;border:none;background:${isOn?'var(--blue)':'transparent'};color:${isOn?'#fff':'var(--text2)'};font-size:13px;font-weight:${isOn?'800':'600'};cursor:pointer;white-space:nowrap;transition:all .2s;text-align:center">${g}</button>`;
  });
  h+=`</div>`;
  h+=`</div>`;

  // (B) 세부 분류 (티어순위표처럼: 선택 시 아래 탭이 항상 보임)
  const grpTabs=tabDefs.filter(t=>t.grp===curTab.grp);
  if(grpTabs.length>1){
    h+=`<div style="display:flex;align-items:center;gap:3px;background:var(--surface);border:1.5px solid var(--border2);border-radius:12px;padding:4px;overflow-x:auto;scrollbar-width:none;-webkit-overflow-scrolling:touch;margin-bottom:8px">`;
    grpTabs.forEach(t=>{
      const on=histSub===t.id;
      h+=`<button onclick="histSub='${t.id}';openDetails={};if(histPage['${t.id}']!==undefined)histPage['${t.id}']=0;render()"
        style="flex-shrink:0;white-space:nowrap;padding:7px 14px;border:none;border-radius:8px;font-size:12px;font-weight:${on?'800':'600'};cursor:pointer;transition:all .15s;background:${on?'var(--blue)':'transparent'};color:${on?'#fff':'var(--text2)'}">${t.lbl}</button>`;
    });
    h+=`</div>`;
  }

  h+=`<div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">`;
  const _ym=(filterYear!=='전체'||filterMonth!=='전체')?`${filterYear==='전체'?'전체':filterYear+'년'}${filterMonth==='전체'?'':' '+parseInt(filterMonth,10)+'월'}`:'';
  if(_ym){
    h+=`<span style="display:inline-flex;align-items:center;gap:3px;padding:3px 8px;background:var(--surface);border:1.5px solid var(--border2);border-radius:20px;font-size:11px;font-weight:700;cursor:pointer" onclick="filterYear='전체';filterMonth='전체';render()">📅 ${_ym} ✕</span>`;
  }
  if(recSortDir!=='desc'){
    h+=`<span style="display:inline-flex;align-items:center;gap:3px;padding:3px 8px;background:var(--surface);border:1.5px solid var(--border2);border-radius:20px;font-size:11px;font-weight:700;cursor:pointer" onclick="recSortDir='desc';render()">정렬: 오래된순 ✕</span>`;
  }
  if(_activeHistFilterCount>0){
    h+=`<button class="btn btn-w btn-xs" style="margin-left:auto" onclick="filterYear='전체';filterMonth='전체';recSortDir='desc';window._histDetailOpen=false;render()">초기화</button>`;
  }
  h+=`</div>`;
  h+=`</div>`;

  // ── 필터 패널 (접기/펼치기) ──
  if(window._histDetailOpen){
    h+=`<div class="no-export" style="background:var(--surface);border:1.5px solid var(--border2);border-radius:12px;padding:12px 14px;margin-bottom:12px;display:flex;flex-direction:column;gap:12px;box-shadow:0 4px 12px rgba(0,0,0,0.05)">`;
    
    // 연/월 필터
    if(_needDateFilter && typeof buildYearMonthFilter==='function'){
      h+=`<div style="display:flex;flex-direction:column;gap:6px">
        <span style="font-size:11px;font-weight:800;color:var(--text3)">기간 필터</span>
        ${buildYearMonthFilter('hist')}
      </div>`;
    }
    // 일괄 선택 (기간 옆)
    if(isLoggedIn && (histSub==='mini' || histSub==='civil' || histSub==='univm')){
      const _bulkKey=(histSub==='civil')?'civil':histSub;
      const _bulkOn=!!_bulkModes[_bulkKey];
      h+=`<div style="display:flex;align-items:center;justify-content:space-between;gap:8px">
        <span style="font-size:11px;font-weight:800;color:var(--text3)">일괄 선택</span>
        <button onclick="toggleBulkMode('${_bulkKey}')" style="padding:6px 12px;border-radius:10px;border:1.5px solid ${_bulkOn?'#dc2626':'var(--border2)'};background:${_bulkOn?'#fff1f2':'var(--white)'};color:${_bulkOn?'#dc2626':'var(--text2)'};font-size:12px;font-weight:800;cursor:pointer">${_bulkOn?'✕ 선택 해제':'☑ 일괄 선택'}</button>
      </div>`;
    }

    // 정렬 필터
    h+=`<div style="display:flex;flex-direction:column;gap:6px">
      <span style="font-size:11px;font-weight:800;color:var(--text3)">정렬 기준</span>
      <div style="display:flex;gap:6px">
        <button class="pill ${recSortDir==='desc'?'on':''}" onclick="recSortDir='desc';render()">최신순 ↓</button>
        <button class="pill ${recSortDir==='asc'?'on':''}" onclick="recSortDir='asc';render()">오래된순 ↑</button>
      </div>
    </div>`;

    h+=`</div>`;
  }
  if(histSub==='vs'){
    h+=vsSearchHTML();
    h+=univVsHTML();
    C.innerHTML=h;
    // 두 선수 이미 선택된 경우 결과 즉시 렌더
    if(vsNameA&&vsNameB&&vsNameA!==vsNameB) _vsRenderResult();
    renderUnivVsResult();
    return;
  }
  if(histSub==='race'){
    if(typeof raceSummaryHTML==='function'){
      h+=raceSummaryHTML();
      C.innerHTML=h;
      return;
    }
    rRace(C,T);
    return;
  }
  if(histSub==='univstat'){h+=rHistUnivStat();C.innerHTML=h;return;}
  if(histSub==='univcomp'){try{h+=histUnivCompHTML();}catch(e){h+=`<div style="padding:20px;color:red;font-size:12px">⚠️ 오류: ${e.message}</div>`;console.error('histUnivCompHTML error:',e);}C.innerHTML=h;return;}
  if(histSub==='univrank'){
    if(typeof rUnivBodyHTML==='function'){
      h+=rUnivBodyHTML();
      C.innerHTML=h;
      return;
    }
    rUniv(C,T);
    return;
  }
  if(histSub==='all') h+=histAllHTML();
  else if(histSub==='civil') h+=recSummaryListHTML(miniM.filter(m=>m.type==='civil'||(m.a==='A팀'&&m.b==='B팀')),'mini','hist');
  else if(histSub==='mini') h+=recSummaryListHTML(miniM.filter(m=>m.type!=='civil'&&!(m.a==='A팀'&&m.b==='B팀')),'mini','hist');
  else if(histSub==='ind') h+=typeof indRecordsHTML==='function'?indRecordsHTML():'<div style="padding:30px;text-align:center;color:var(--gray-l)">기록 없음</div>';
  else if(histSub==='gj') h+=typeof gjRecordsHTML==='function'?gjRecordsHTML(false):'<div style="padding:30px;text-align:center;color:var(--gray-l)">기록 없음</div>';
  else if(histSub==='progj') h+=typeof gjRecordsHTML==='function'?gjRecordsHTML(true):'<div style="padding:30px;text-align:center;color:var(--gray-l)">기록 없음</div>';
  else if(histSub==='ck') h+=recSummaryListHTML(ckM,'ck','hist');
  else if(histSub==='univm') h+=recSummaryListHTML(univM,'univm','hist');
  else if(histSub==='comp') h+=compSummaryListHTML('hist');
  else if(histSub==='tourney') h+=histTourneyHTML('hist');
  else if(histSub==='tiertour'||histSub==='tiertour-gen'||histSub==='tiertour-league'||histSub==='tiertour-bkt'){
    const _ttSubBar=`<div class="stabs no-export" style="margin-bottom:10px">
      <button class="stab ${histSub==='tiertour'?'on':''}" onclick="histSub='tiertour';openDetails={};render()">📋 전체</button>
      <button class="stab ${histSub==='tiertour-gen'?'on':''}" onclick="histSub='tiertour-gen';openDetails={};render()">📝 일반</button>
      <button class="stab ${histSub==='tiertour-league'?'on':''}" onclick="histSub='tiertour-league';openDetails={};render()">📅 조별리그</button>
      <button class="stab ${histSub==='tiertour-bkt'?'on':''}" onclick="histSub='tiertour-bkt';openDetails={};render()">🏆 토너먼트 기록</button>
    </div>`;
    h+=_ttSubBar;
    const _ttAll=ttM.filter(m=>!m._proKey);
    const _ttGen=_ttAll.filter(m=>!m.stage||m.stage==='general'||m.stage==='grp');
    const _ttLeague=_ttAll.filter(m=>m.stage==='league');
    const _ttBkt=_ttAll.filter(m=>m.stage==='bkt');
    const _ttSrc=histSub==='tiertour-gen'?_ttGen:histSub==='tiertour-league'?_ttLeague:histSub==='tiertour-bkt'?_ttBkt:_ttAll;
    const _emptyIco=histSub==='tiertour-bkt'?'🏆':histSub==='tiertour-league'?'📅':'🎯';
    const _emptyMsg=histSub==='tiertour-bkt'?'토너먼트 기록이 없습니다':histSub==='tiertour-league'?'조별리그 기록이 없습니다':histSub==='tiertour-gen'?'일반 기록이 없습니다':'티어대회 기록이 없습니다';
    h+=_ttSrc.length?histTierTourGroupedHTML(_ttSrc):`<div class="empty-state"><div class="empty-state-icon">${_emptyIco}</div><div class="empty-state-title">${_emptyMsg}</div><div class="empty-state-desc">기록이 추가되면 여기에 표시됩니다</div></div>`;
  }
  else if(histSub==='pro') h+=recSummaryListHTML(proM,'pro','hist');
  else if(histSub==='procomp') h+=histProCompHTML();
  else if(histSub==='procomptn') h+=histProCompTourneyHTML();
  else if(histSub==='procompteam') h+=histProCompTeamHTML();
  else if(histSub==='procompgj') h+=histProCompGJHTML();
  else if(histSub==='psearch') h+=histPlayerSearchHTML();
  C.innerHTML=h;
}

function _renderRecCardsSimple(arr, mode, context){
  const _srcArr=(()=>{
    if(mode==='mini') return miniM;
    if(mode==='univm') return univM;
    if(mode==='ck') return ckM;
    if(mode==='pro') return proM;
    if(mode==='tt') return ttM;
    if(mode==='comp') return comps;
    return arr;
  })();
  const isCKmode=(mode==='ck'||mode==='pro'||mode==='tt');
  let pairs=(arr||[]).map(m=>({m,i:_srcArr.indexOf(m)})).filter(({m,i})=>{
    if(i<0) return false;
    if(isCKmode){
      const hasTeams = Array.isArray(m.teamAMembers) && Array.isArray(m.teamBMembers) && m.teamAMembers.length && m.teamBMembers.length;
      const hasAB = !!(m.a && m.b);
      if(!(hasTeams || hasAB)) return false;
    } else {
      if(!m.a||!m.b) return false;
    }
    if(!_hasValidScore(m)) return false;
    if(typeof passDateFilter==='function'&&!passDateFilter(m.d||'')) return false;
    return true;
  });
  pairs.sort((a,b)=>{
    const da=(a.m.d||''), db=(b.m.d||'');
    const cmp=recSortDir==='asc'?da.localeCompare(db):db.localeCompare(da);
    if(cmp!==0) return cmp;
    return recSortDir==='asc' ? (a.i - b.i) : (b.i - a.i);
  });
  if(!pairs.length) return `<div class="empty-state"><div class="empty-state-icon">📭</div><div class="empty-state-title">기록이 없습니다</div></div>`;

  const isCK=(mode==='ck'||mode==='pro'||mode==='tt');
  const modeBadgeMap={mini:'⚡ 미니대전',ck:'🤝 대학CK',univm:'🏟️ 대학대전',pro:'🏅 일반',tt:'🎯 티어대회',comp:'🏆 대회'};
  const modeBadge=modeBadgeMap[mode]||mode;

  let h=`<div style="display:flex;flex-direction:column;gap:12px;">`;
  let _lastDate='';
  pairs.forEach(({m,i})=>{
    const _d=(m.d||'');
    if(_d && _d!==_lastDate){
      _lastDate=_d;
      h+=`<div class="no-export" style="position:sticky;top:118px;z-index:20;background:var(--white);border:1px solid var(--border);border-radius:10px;padding:6px 10px;margin:10px 0 0;font-size:12px;font-weight:900;color:var(--text2);display:flex;align-items:center;gap:8px;box-shadow:0 2px 4px rgba(0,0,0,0.02)">
        <span style="color:var(--gray-l);font-weight:800">📅</span>
        <span>${_d.slice(2).replace(/-/g,'/')}</span>
      </div>`;
    }
    const ca=isCK?'#2563eb':gc(m.a);
    const cb=isCK?'#dc2626':gc(m.b);
    const rawLA=(m.teamALabel||'').replace(/^\$\{.*\}$/,'');
    const rawLB=(m.teamBLabel||'').replace(/^\$\{.*\}$/,'');
    const labelA=isCK?(m.a||rawLA||'A팀'):m.a;
    const labelB=isCK?(m.b||rawLB||'B팀'):m.b;
    const aWin=(m.sa>m.sb);const bWin=(m.sb>m.sa);
    const key=`${context}-${mode}-${i}`;
    const iconA=(()=>{if(isCK) return ''; const n=m.a;const u=univCfg.find(x=>x.name===n)||{};const url=UNIV_ICONS[n]||u.icon||'';return url?`<img src="${url}" style="width:20px;height:20px;object-fit:contain;border-radius:4px;flex-shrink:0;vertical-align:middle" onerror="this.style.display='none'">`:''})();
    const iconB=(()=>{if(isCK) return ''; const n=m.b;const u=univCfg.find(x=>x.name===n)||{};const url=UNIV_ICONS[n]||u.icon||'';return url?`<img src="${url}" style="width:20px;height:20px;object-fit:contain;border-radius:4px;flex-shrink:0;vertical-align:middle" onerror="this.style.display='none'">`:''})();
    const _wBorderCol=aWin?ca:bWin?cb:'var(--border)';

    h+=`<div class="rec-summary" style="border-left:4px solid ${_wBorderCol};background:var(--white);border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.04);padding:14px;display:flex;flex-direction:column;gap:12px;margin:0;">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:6px;flex-wrap:wrap">
        <div style="display:flex;align-items:center;gap:6px">
          <span style="background:var(--surface);color:var(--text2);font-size:10px;font-weight:800;padding:3px 8px;border-radius:6px;border:1px solid var(--border2);display:inline-flex;align-items:center">${modeBadge}</span>
          ${m.map?`<span style="font-size:11px;color:var(--text3);display:inline-flex;align-items:center;gap:2px">📍 ${m.map}</span>`:''}
        </div>
        <div class="rec-actions no-export" style="display:flex;align-items:center;gap:4px">
          <button class="btn btn-w btn-xs" onclick="copyMatchResult('${escJS(labelA||'')}',${sa||0},'${escJS(labelB||'')}',${sb||0},'${m.d||''}','${mode}',${i})" title="결과 텍스트로 복사" style="padding:4px 8px;font-size:11px;display:inline-flex;align-items:center;gap:4px">📋 <span class="hide-mobile">복사</span></button>
          <button class="btn btn-w btn-xs" onclick="openShareCardFromMatch('${mode}',${i})" title="공유 카드 이미지 생성" style="padding:4px 8px;font-size:11px;display:inline-flex;align-items:center;gap:4px">🎴 <span class="hide-mobile">카드</span></button>
          <button id="detbtn-${key}" class="btn btn-b btn-xs" onclick="toggleDetail('${key}')" style="padding:4px 10px;font-size:11px;font-weight:700;display:inline-flex;align-items:center;gap:4px">📂 <span class="hide-mobile">상세</span></button>
          ${adminBtn(`<button class="btn btn-o btn-xs" onclick="openRE('${mode}',${i})" title="수정">✏️</button>`)}
          ${adminBtn(`<button class="btn btn-r btn-xs" onclick="delRec('${mode}',${i})" title="삭제">🗑️</button>`)}
        </div>
      </div>

      <div style="display:flex;align-items:center;justify-content:center;padding:4px 0">
        <div style="flex:1;display:flex;flex-direction:column;align-items:flex-end;gap:4px">
          <span class="ubadge${aWin?'':' loser'} clickable-univ" data-icon-done="1" style="background:${ca};display:inline-flex;align-items:center;gap:6px;font-size:14px;padding:4px 12px" onclick="${!isCK?`openUnivModal('${m.a||''}')`:''}">${labelA}${iconA}</span>
          ${aWin?`<span style="font-size:10px;font-weight:800;color:${ca};padding:0 4px">WINNER 🏆</span>`:''}
        </div>
        <div class="rec-sum-score score-click" onclick="toggleDetail('${key}')" title="클릭하여 상세 보기/닫기" style="margin:0 16px;padding:6px 16px;background:var(--surface);border-radius:12px;border:1.5px solid var(--border2)">
          <span style="font-size:24px;font-weight:900;color:${aWin?'#16a34a':bWin?'#dc2626':'var(--text)'}">${sa}</span>
          <span style="color:var(--gray-l);font-size:16px;font-weight:400;margin:0 6px">:</span>
          <span style="font-size:24px;font-weight:900;color:${bWin?'#16a34a':aWin?'#dc2626':'var(--text)'}">${sb}</span>
        </div>
        <div style="flex:1;display:flex;flex-direction:column;align-items:flex-start;gap:4px">
          <span class="ubadge${bWin?'':' loser'} clickable-univ" data-icon-done="1" style="background:${cb};display:inline-flex;align-items:center;gap:6px;font-size:14px;padding:4px 12px" onclick="${!isCK?`openUnivModal('${m.b||''}')`:''}">${iconB}${labelB}</span>
          ${bWin?`<span style="font-size:10px;font-weight:800;color:${cb};padding:0 4px">WINNER 🏆</span>`:''}
        </div>
      </div>

      <div id="det-${key}" class="rec-detail-area">
        ${_regDet(key,{...m,_editRef:`${mode}:${i}`}, mode, labelA, labelB, ca, cb, aWin, bWin)}
      </div>
    </div>`;
  });
  h+=`</div>`;
  return h;
}

function histTierTourGroupedHTML(arr){
  const groups={};
  (arr||[]).forEach(m=>{
    const n=(m.compName||m.n||m.t||'티어대회').trim()||'티어대회';
    if(!groups[n]) groups[n]=[];
    groups[n].push(m);
  });
  const entries=Object.entries(groups).map(([name,list])=>{
    const ds=(list||[]).map(x=>x.d||'').filter(Boolean).sort();
    const start=ds[0]||''; const end=ds[ds.length-1]||'';
    return {name,list, start, end, max:end};
  }).sort((a,b)=>recSortDir==='asc' ? (a.max||'').localeCompare(b.max||'') : (b.max||'').localeCompare(a.max||''));

  let h='';
  entries.forEach(g=>{
    const range = g.start && g.end ? (g.start===g.end ? g.start : `${g.start} ~ ${g.end}`) : '';
    const rangeLabel = range ? range.slice(2).replace(/-/g,'/') : '';
    h+=`<div style="background:linear-gradient(135deg,var(--blue-l) 0%,var(--white) 100%);border:1.5px solid var(--blue-ll);border-left:4px solid var(--blue);border-radius:12px;padding:12px 16px;margin:14px 0 6px;display:flex;align-items:center;gap:8px;flex-wrap:wrap">
      <span style="font-size:16px">🎯</span>
      <span style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:15px;color:var(--blue)">${g.name}</span>
      ${rangeLabel?`<span style="font-size:11px;color:var(--gray-l)">${rangeLabel}</span>`:''}
      <span style="font-size:11px;font-weight:700;color:var(--blue);background:var(--blue-ll);border-radius:20px;padding:2px 10px;margin-left:auto">${g.list.length}경기</span>
    </div>`;
    h+=_renderRecCardsSimple(g.list,'tt','hist');
  });
  return h || `<div class="empty-state"><div class="empty-state-icon">🎯</div><div class="empty-state-title">티어대회 기록이 없습니다</div></div>`;
}


/* ══════════════════════════════════════
   대전 기록 > 전체 통합 탭
══════════════════════════════════════ */
function histAllHTML(){
  // 각 경기 타입별 레이블과 색상
  const typeInfo={
    mini:{lbl:'⚡ 미니대전',col:'#2563eb'},
    univm:{lbl:'🏟️ 대학대전',col:'#7c3aed'},
    ck:{lbl:'🤝 대학CK',col:'#dc2626'},
    pro:{lbl:'🏅 프로리그',col:'#0891b2'},
    ind:{lbl:'🎮 개인전',col:'#16a34a'},
    gj:{lbl:'⚔️ 끝장전',col:'#d97706'},
    tt:{lbl:'🎯 티어대회',col:'#7c3aed'},
    tourney:{lbl:'🎖️ 대회',col:'#b45309'},
    procomp:{lbl:'🏅 프로리그대회',col:'#7c3aed'},
  };
  // 통합 목록 생성
  const allItems=[];
  // 팀전 (mini/ck/univm/pro): m.a, m.b, m.sa, m.sb, m.d
  [[miniM,'mini'],[ckM,'ck'],[univM,'univm'],[proM,'pro']].forEach(([arr,type])=>{
    (arr||[]).forEach(m=>{
      if(type==='ck' || type==='pro'){
        const hasTeams = Array.isArray(m.teamAMembers) && Array.isArray(m.teamBMembers) && m.teamAMembers.length && m.teamBMembers.length;
        const hasAB = !!(m.a && m.b);
        if(!(hasTeams || hasAB)) return;
      } else {
        if(!m.a||!m.b) return;
      }
      if(!_hasValidScore(m)) return;
      if(typeof passDateFilter==='function' && !passDateFilter(m.d||''))return;
      allItems.push({type,d:m.d||'',m});
    });
  });
  // 개인전/끝장전 (ind/gj): m.wName, m.lName, m.d
  [[indM,'ind'],[gjM,'gj']].forEach(([arr,type])=>{
    (arr||[]).forEach(m=>{
      if(!m.wName||!m.lName)return;
      if(typeof passDateFilter==='function' && !passDateFilter(m.d||''))return;
      allItems.push({type,d:m.d||'',m});
    });
  });
  // 티어대회 (tt): m.a, m.b, m.sa, m.sb, m.d
  (ttM||[]).forEach(m=>{
    const hasTeams = Array.isArray(m.teamAMembers) && Array.isArray(m.teamBMembers) && m.teamAMembers.length && m.teamBMembers.length;
    const hasAB = !!(m.a && m.b);
    if(!(hasTeams || hasAB)) return;
    if(!_hasValidScore(m)) return;
    if(typeof passDateFilter==='function' && !passDateFilter(m.d||''))return;
    allItems.push({type:'tt',d:m.d||'',m});
  });
  // 대회 tourney
  if(typeof getTourneyMatches==='function'){
    getTourneyMatches().forEach(m=>{
      if(!m.a||!m.b||m.sa==null||m.sb==null)return;
      if(typeof passDateFilter==='function' && !passDateFilter(m.d||''))return;
      allItems.push({type:'tourney',d:m.d||'',m});
    });
  }
  // 대회 토너먼트 (comps)
  (comps||[]).forEach(m=>{
    if(!m.a&&!m.u) return; if(!m.b) return;
    if(m.sa==null||m.sa===''||m.sb==null||m.sb==='') return;
    if(isNaN(Number(m.sa))||isNaN(Number(m.sb))) return;
    if(typeof passDateFilter==='function' && !passDateFilter(m.d||'')) return;
    allItems.push({type:'tourney',d:m.d||'',m:{...m,a:m.a||m.u}});
  });
  // 프로리그 개인 대회 (procomp)
  (proTourneys||[]).forEach(tn=>{
    (tn.groups||[]).forEach(grp=>{
      (grp.matches||[]).forEach(m=>{
        if(!m.a||!m.b||!m.winner)return;
        if(typeof passDateFilter==='function' && !passDateFilter(m.d||''))return;
        const wName=m.winner==='A'?m.a:m.b;
        const lName=m.winner==='A'?m.b:m.a;
        allItems.push({type:'procomp',d:m.d||'',m:{...m,wName,lName}});
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

  const _typeFiltered = filtered;
  // 페이지네이션
  const pageSize=getHistPageSize();
  if(histPage['all']===undefined) histPage['all']=0;
  const totalPages=Math.ceil(_typeFiltered.length/pageSize)||1;
  if(histPage['all']>=totalPages) histPage['all']=Math.max(0,totalPages-1);
  const curPage=histPage['all'];
  const paged=_typeFiltered.length>pageSize?_typeFiltered.slice(curPage*pageSize,(curPage+1)*pageSize):_typeFiltered;

  let h=``;

  if(!paged.length){
    h+=`<div class="empty-state"><div class="empty-state-icon">📭</div><div class="empty-state-title">기록이 없습니다</div></div>`;
    return h;
  }

  let _lastDate='';
  paged.forEach(({type,d,m})=>{
    if(d && d!==_lastDate){
      _lastDate=d;
      h+=`<div class="no-export" style="position:sticky;top:118px;z-index:20;background:var(--white);border:1px solid var(--border);border-radius:10px;padding:6px 10px;margin:10px 0 0;font-size:12px;font-weight:900;color:var(--text2);display:flex;align-items:center;gap:8px;box-shadow:0 2px 4px rgba(0,0,0,0.02)">
        <span style="color:var(--gray-l);font-weight:800">📅</span>
        <span>${d.slice(2).replace(/-/g,'/')}</span>
      </div>`;
    }
    const ti=typeInfo[type]||{lbl:type,col:'#64748b'};
    const isInd=(type==='ind'||type==='gj'||type==='procomp');
    const isTeamLabelType=(type==='ck'||type==='pro'||type==='tt');
    let teamA='',teamB='',scoreA='',scoreB='';
    if(isInd){
      teamA=m.wName||''; teamB=m.lName||'';
      scoreA=''; scoreB='';
    } else {
      teamA=isTeamLabelType ? _getTeamName(m,'A') : (m.a||'');
      teamB=isTeamLabelType ? _getTeamName(m,'B') : (m.b||'');
      let t_sa=m.sa, t_sb=m.sb;
      if(t_sa==null||t_sb==null){
        t_sa=0;t_sb=0;
        (m.sets||[]).forEach(s=>{
          (s.games||[]).forEach(g=>{if(g.winner==='A')t_sa++;else if(g.winner==='B')t_sb++;});
        });
      }
      scoreA=t_sa; scoreB=t_sb;
    }
    const winner=isInd?teamA:(!isInd&&scoreA!==''&&scoreB!==''?(Number(scoreA)>Number(scoreB)?teamA:(Number(scoreB)>Number(scoreA)?teamB:'')):'');
    const dLabel=d?d.slice(2).replace(/-/g,'/'):'미정';
    const key=`hist-all-${type}-${d}-${(m.a||teamA)}-${(m.b||teamB)}`.replace(/[^\w\-:.]/g,'');
    const labelA=teamA;
    const labelB=teamB;
    const wp=isInd?players.find(p=>p.name===teamA):null;
    const lp=isInd?players.find(p=>p.name===teamB):null;
    const ca=isInd?(wp?.univ?gc(wp.univ):'#16a34a'):(isTeamLabelType?'#2563eb':gc(teamA));
    const cb=isInd?(lp?.univ?gc(lp.univ):'#dc2626'):(isTeamLabelType?'#dc2626':gc(teamB));
    const winCol=winner===teamA?ca:winner===teamB?cb:ti.col;
    const aWin=winner===teamA;
    const bWin=winner===teamB;
    const modeMap={mini:'mini',univm:'univm',ck:'ck',pro:'pro',tt:'tt',tourney:'comp',procomp:'comp'};
    const mode=modeMap[type]||'comp';
    
    const iconA=(()=>{if(isInd||isTeamLabelType) return ''; const n=teamA;const u=univCfg.find(x=>x.name===n)||{};const url=UNIV_ICONS[n]||u.icon||'';return url?`<img src="${url}" style="width:20px;height:20px;object-fit:contain;border-radius:4px;flex-shrink:0;vertical-align:middle" onerror="this.style.display='none'">`:''})();
    const iconB=(()=>{if(isInd||isTeamLabelType) return ''; const n=teamB;const u=univCfg.find(x=>x.name===n)||{};const url=UNIV_ICONS[n]||u.icon||'';return url?`<img src="${url}" style="width:20px;height:20px;object-fit:contain;border-radius:4px;flex-shrink:0;vertical-align:middle" onerror="this.style.display='none'">`:''})();
    
    h+=`<div class="rec-summary" style="border-left:4px solid ${winCol};background:var(--white);border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.04);padding:14px;display:flex;flex-direction:column;gap:12px;margin-bottom:12px;">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:6px;flex-wrap:wrap">
        <div style="display:flex;align-items:center;gap:6px">
          <span style="background:${ti.col}18;color:${ti.col};font-size:10px;font-weight:800;padding:3px 8px;border-radius:6px;border:1px solid ${ti.col}33;display:inline-flex;align-items:center">${ti.lbl}</span>
          ${m.map&&m.map!=='-'?`<span style="font-size:11px;color:var(--text3);display:inline-flex;align-items:center;gap:2px">📍 ${m.map}</span>`:''}
        </div>
        
        <div class="rec-actions no-export" style="display:flex;align-items:center;gap:4px">
          <button id="detbtn-${key}" class="btn btn-b btn-xs" onclick="toggleDetail('${key}')" style="padding:4px 10px;font-size:11px;font-weight:700;display:inline-flex;align-items:center;gap:4px">📂 <span class="hide-mobile">상세</span></button>
        </div>
      </div>

      <div style="display:flex;align-items:center;justify-content:center;padding:4px 0">
        <div style="flex:1;display:flex;flex-direction:column;align-items:flex-end;gap:4px">
          <span class="ubadge${aWin?'':' loser'} clickable-univ" data-icon-done="1" style="background:${ca};display:inline-flex;align-items:center;gap:6px;font-size:14px;padding:4px 12px;text-align:right" onclick="${(!isInd&&!isTeamLabelType)?`openUnivModal('${teamA}')`:''}">${labelA}${iconA}</span>
          ${aWin?`<span style="font-size:10px;font-weight:800;color:${ca};padding:0 4px">WINNER 🏆</span>`:''}
        </div>
        
        <div class="rec-sum-score score-click" onclick="toggleDetail('${key}')" title="클릭하여 상세 보기/닫기" style="margin:0 16px;padding:6px 16px;background:var(--surface);border-radius:12px;border:1.5px solid var(--border2)">
          ${isInd?`<span style="font-size:14px;font-weight:800;color:var(--text3)">VS</span>`:`<span style="font-size:24px;font-weight:900;color:${aWin?'#16a34a':bWin?'#dc2626':'var(--text)'}">${scoreA}</span>
          <span style="color:var(--gray-l);font-size:16px;font-weight:400;margin:0 6px">:</span>
          <span style="font-size:24px;font-weight:900;color:${bWin?'#16a34a':aWin?'#dc2626':'var(--text)'}">${scoreB}</span>`}
        </div>
        
        <div style="flex:1;display:flex;flex-direction:column;align-items:flex-start;gap:4px">
          <span class="ubadge${bWin?'':' loser'} clickable-univ" data-icon-done="1" style="background:${cb};display:inline-flex;align-items:center;gap:6px;font-size:14px;padding:4px 12px;text-align:left" onclick="${(!isInd&&!isTeamLabelType)?`openUnivModal('${teamB}')`:''}">${iconB}${labelB}</span>
          ${bWin?`<span style="font-size:10px;font-weight:800;color:${cb};padding:0 4px">WINNER 🏆</span>`:''}
        </div>
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
          : _regDet(key, m, mode, labelA, labelB, ca, cb, aWin, bWin)}
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
  const sortBar=`<div class="sort-bar no-export">
    <span style="font-size:11px;color:var(--text3)">날짜 정렬</span>
    <button class="sort-btn ${recSortDir==='desc'?'on':''}" onclick="recSortDir='desc';render()">최신순 ↓</button>
    <button class="sort-btn ${recSortDir==='asc'?'on':''}" onclick="recSortDir='asc';render()">오래된순 ↑</button>
    <span style="font-size:11px;color:var(--gray-l);margin-left:4px">${allItems.length}건</span>
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
      h+=`<div class="rec-summary" style="margin-left:8px;border-left:3px solid ${_tBorderCol}">
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
            ${rIdx>=0?adminBtn(`<button class="btn btn-o btn-xs" onclick="openRE('comp',${rIdx})">✏️ 수정</button>`):''}
            ${rIdx>=0?adminBtn(`<button class="btn btn-r btn-xs" onclick="delRec('comp',${rIdx})">🗑️ 삭제</button>`):''}
            ${m._src==='tour'?adminBtn(`<button class="btn btn-o btn-xs" onclick="leagueEditMatch('${m._tnId}',${m._gi},${m._mi})">✏️ 수정</button>`):''}
          </div>
        </div>
        <div id="det-${key}" class="rec-detail-area">
          ${_regDet(key,{...m,_editRef:rIdx>=0?'comp:'+rIdx:''},  'comp',a,b,ca,cb,aWin,bWin)}
          <div style="margin-top:10px;padding-top:10px;border-top:1px solid var(--border)" class="no-export">
            ${m.memo?`<div style="font-size:12px;color:var(--text2);background:var(--gold-bg);border:1px solid var(--gold-b);border-radius:6px;padding:6px 10px;margin-bottom:6px">📝 ${m.memo}</div>`:''}
            <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap">
              <button class="btn btn-p btn-xs" onclick="_shareMode='match';window._shareMatchObj=_getHistTourneyMatchObj(${idx},'${context}');openShareCardModal();setTimeout(()=>renderShareCardByMatchObj(window._shareMatchObj),80)">🎴 공유 카드</button>
              ${rIdx>=0&&isLoggedIn?`<input type="text" id="memo-${key}" placeholder="경기 메모..." value="${m.memo||''}" style="flex:1;font-size:12px">
              <button class="btn btn-w btn-xs" onclick="saveMemo('comp',${rIdx},'memo-${key}')">💾 메모</button>
              ${m.memo?`<button class="btn btn-r btn-xs" onclick="saveMemo('comp',${rIdx},null)">🗑️ 삭제</button>`:''}`:''}
            </div>
          </div>
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
  let h='';
  let _filtered=false;
  arr.forEach(m=>{
    if(isCKmode){if(mode!=='tt'&&(!m.teamAMembers||!m.teamBMembers)) return;}
    else{if(!m.a||!m.b) return;}
    if(!_hasValidScore(m)) return;
    if(typeof passDateFilter==='function' && !passDateFilter(m.d||''))return;
    _filtered=true;
    const srcArr=mode==='mini'?miniM:mode==='univm'?univM:mode==='pro'?proM:mode==='tt'?ttM:ckM;
    const i=srcArr.indexOf(m);
    const isCK=isCKmode;
    const labelA=_getTeamName(m,'A');
    const labelB=_getTeamName(m,'B');
    const ca=isCK?'#2563eb':gc(labelA);
    const cb=isCK?'#dc2626':gc(labelB);
    const aWin=(m.sa>m.sb),bWin=(m.sb>m.sa);
    const col=gc(filterUniv);
    const isA=(!isCK&&m.a===filterUniv)||(isCK&&(m.teamAMembers||[]).some(x=>x.univ===filterUniv));
    const isB=(!isCK&&m.b===filterUniv)||(isCK&&(m.teamBMembers||[]).some(x=>x.univ===filterUniv));
    const myWin=(isA&&aWin)||(isB&&bWin);
    const key=`${ctxPrefix}-${mode}-${i}`;
    h+=`<div class="rec-summary">
      <div class="rec-sum-header">
        <span style="color:var(--text3);font-size:12px;font-weight:600;min-width:72px">${m.d||''}</span>
        ${m.t?`<span style="font-weight:700;font-size:12px;color:var(--text3)">${m.t}</span>`:''}
        ${(m.n&&mode!=='comp')?`<span style="font-weight:700;font-size:12px;color:var(--text3)">${m.n}</span>`:''}
        <div class="rec-sum-vs">
          <span class="ubadge${aWin?'':' loser'} clickable-univ" data-icon-done="1" style="background:${ca};display:inline-flex;align-items:center;gap:4px" onclick="openUnivModal('${isCK?'':m.a}')">${(()=>{const n=isCK?'':m.a;const url=UNIV_ICONS[n]||(univCfg.find(x=>x.name===n)||{}).icon||'';return url?`<img src="${url}" style="width:18px;height:18px;object-fit:contain;border-radius:3px;flex-shrink:0" onerror="this.style.display='none'">`:''})()}${labelA}</span>
          <div class="rec-sum-score score-click" onclick="toggleDetail('${key}')"><span class="${aWin?'wt':bWin?'lt':'pt-z'}">${m.sa}</span><span style="color:var(--gray-l);font-size:14px">:</span><span class="${bWin?'wt':aWin?'lt':'pt-z'}">${m.sb}</span></div>
          <span class="ubadge${bWin?'':' loser'} clickable-univ" data-icon-done="1" style="background:${cb};display:inline-flex;align-items:center;gap:4px" onclick="openUnivModal('${isCK?'':m.b}')">${(()=>{const n=isCK?'':m.b;const url=UNIV_ICONS[n]||(univCfg.find(x=>x.name===n)||{}).icon||'';return url?`<img src="${url}" style="width:18px;height:18px;object-fit:contain;border-radius:3px;flex-shrink:0" onerror="this.style.display='none'">`:''})()}${labelB}</span>
          <span style="font-size:12px;font-weight:700;color:${myWin?col:'#888'}">${myWin?'▶ '+filterUniv+' 승':aWin?'▶ '+labelA+' 승':bWin?'▶ '+labelB+' 승':'무승부'}</span>
        </div>
        <div style="margin-left:auto;display:flex;gap:5px;align-items:center" class="no-export">
          <button id="detbtn-${key}" class="btn-detail" onclick="toggleDetail('${key}')">📂 상세</button>
          ${(mode==='tt'||mode==='mini'||mode==='univm'||mode==='comp'||mode==='ck'||mode==='ind'||mode==='gj')?adminBtn(`<button class="btn btn-o btn-xs" onclick="openRE('${mode}',${i})">✏️ 수정</button>`):''}
          ${adminBtn(`<button class="btn btn-r btn-xs" onclick="delRec('${mode}',${i})">🗑️ 삭제</button>`)}
        </div>
      </div>
      <div id="det-${key}" class="rec-detail-area">
        ${_regDet(key,{...m,_editRef:`${mode}:${i}`},mode,labelA,labelB,ca,cb,aWin,bWin)}
        <div style="margin-top:8px;padding-top:8px;border-top:1px solid var(--border)">
          <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap">
            <button class="btn btn-p btn-xs no-export" onclick="openShareCardFromMatch('${mode}',${i})">🎴 공유 카드</button>
          </div>
        </div>
      </div>
    </div>`;
  });
  if(!_filtered) return `<div class="empty-state"><div class="empty-state-icon">📭</div><div class="empty-state-title">기록이 없습니다</div><div class="empty-state-desc">기록이 추가되면 여기에 표시됩니다</div></div>`;
  return h;
}

function recSummaryListHTML(arr, mode, context, extraFilter){
  const isCKmode=(mode==='ck'||mode==='pro'||mode==='tt');
  if(!window._recQ)window._recQ={};
  if(!arr.length){
    const emptyBar=`<div class="sort-bar no-export" style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
    <span style="font-size:11px;color:var(--text3)">날짜</span>
    <button class="sort-btn ${recSortDir==='desc'?'on':''}" onclick="recSortDir='desc';render()">최신순 ↓</button>
    <button class="sort-btn ${recSortDir==='asc'?'on':''}" onclick="recSortDir='asc';render()">오래된순 ↑</button>
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
      const hasTeams = Array.isArray(m.teamAMembers) && Array.isArray(m.teamBMembers) && m.teamAMembers.length && m.teamBMembers.length;
      const hasAB = !!(m.a && m.b);
      if(!(hasTeams || hasAB)) return false;
    } else {
      if(!m.a||!m.b) return false;
    }
    if(m.sa==null||m.sa===''||m.sb==null||m.sb==='') return false;
    if(isNaN(Number(m.sa))||isNaN(Number(m.sb))) return false;
    if(typeof passDateFilter==='function'&&!passDateFilter(m.d||'')) return false;
    return true;
  });
  filtered.sort((a,b)=>{
    const da=(a.m.d||''), db=(b.m.d||'');
    const cmp=recSortDir==='asc'?da.localeCompare(db):db.localeCompare(da);
    if(cmp!==0) return cmp;
    // 동일 날짜일 때 안정적 보조 정렬: 원본 인덱스 기준
    return recSortDir==='asc' ? (a.i - b.i) : (b.i - a.i);
  });

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
  const sortBar=`${_bulkOn?`<div class="no-export" style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;padding:7px 10px;background:#eff6ff;border:1.5px solid var(--blue);border-radius:8px;margin-bottom:6px">
    <label style="display:flex;align-items:center;gap:5px;font-size:12px;font-weight:700;cursor:pointer;color:var(--blue)">
      <input type="checkbox" id="bulk-all-${_bulkKey}" onchange="bulkToggleAll('${_bulkKey}',this.checked)" style="width:14px;height:14px;cursor:pointer"> 전체
    </label>
    <span id="bulk-cnt-${_bulkKey}" style="font-size:11px;color:var(--blue);font-weight:700;min-width:64px">0개 선택됨</span>
    <span style="color:var(--border2)">│</span>
    ${_bulkDests.map(bd=>`<button onclick="bulkMoveTeam('${_bulkKey}','${bd.d}')" style="padding:3px 12px;border-radius:12px;border:1.5px solid var(--blue);background:var(--blue);color:#fff;font-size:11px;font-weight:700;cursor:pointer">${bd.l}로 이동</button>`).join('')}
    <button onclick="bulkDeleteRecs('${_bulkKey}')" style="padding:3px 12px;border-radius:12px;border:1.5px solid #dc2626;background:#dc2626;color:#fff;font-size:11px;font-weight:700;cursor:pointer">🗑️ 선택 삭제</button>
    <button onclick="toggleBulkMode('${_bulkKey}')" style="padding:3px 12px;border-radius:12px;border:1.5px solid var(--border2);background:var(--white);color:var(--text2);font-size:11px;font-weight:700;cursor:pointer">✕ 선택 해제</button>
  </div>`:''}
  `;

  if(!totalItems){
    return sortBar+`<div class="empty-state"><div class="empty-state-icon">📅</div><div class="empty-state-title">해당 기간에 기록이 없습니다</div><div class="empty-state-desc">다른 기간을 선택해보세요</div></div>`;
  }

  let h=sortBar+`<div id="rec-list-${mode}" style="display:flex;flex-direction:column;gap:12px;">`;
  let _lastDate='';
  paged.forEach(({m,i})=>{
    const _d=(m.d||'');
    if(_d && _d!==_lastDate){
      _lastDate=_d;
      h+=`<div class="no-export" style="position:sticky;top:118px;z-index:20;background:var(--white);border:1px solid var(--border);border-radius:10px;padding:6px 10px;margin:10px 0 0;font-size:12px;font-weight:900;color:var(--text2);display:flex;align-items:center;gap:8px;box-shadow:0 2px 4px rgba(0,0,0,0.02)">
        <span style="color:var(--gray-l);font-weight:800">📅</span>
        <span>${_d.slice(2).replace(/-/g,'/')}</span>
      </div>`;
    }
    const isCK=(mode==='ck'||mode==='pro'||mode==='tt');
    const labelA=(mode==='pro')?(m.teamALabel||_getTeamName(m,'A')):_getTeamName(m,'A');
    const labelB=(mode==='pro')?(m.teamBLabel||_getTeamName(m,'B')):_getTeamName(m,'B');
    const ca=isCK?'#2563eb':gc(labelA);
    const cb=isCK?'#dc2626':gc(labelB);
    let sa=m.sa, sb=m.sb;
    if(sa==null||sb==null){
      sa=0;sb=0;
      (m.sets||[]).forEach(s=>{
        (s.games||[]).forEach(g=>{if(g.winner==='A')sa++;else if(g.winner==='B')sb++;});
      });
    }
    const aWin=(sa>sb);const bWin=(sb>sa);
    const key=`${context}-${mode}-${i}`;
    // 대학 아이콘
    const iconA=(()=>{if(isCK) return ''; const n=labelA;const u=univCfg.find(x=>x.name===n)||{};const url=UNIV_ICONS[n]||u.icon||'';return url?`<img src="${url}" style="width:20px;height:20px;object-fit:contain;border-radius:4px;flex-shrink:0;vertical-align:middle" onerror="this.style.display='none'">`:''})();
    const iconB=(()=>{if(isCK) return ''; const n=labelB;const u=univCfg.find(x=>x.name===n)||{};const url=UNIV_ICONS[n]||u.icon||'';return url?`<img src="${url}" style="width:20px;height:20px;object-fit:contain;border-radius:4px;flex-shrink:0;vertical-align:middle" onerror="this.style.display='none'">`:''})();
    const _wBorderCol=aWin?ca:bWin?cb:'var(--border)';
    
    const modeBadgeMap={mini:'⚡ 미니대전',ck:'🤝 대학CK',univm:'🏟️ 대학대전',pro:'🏅 일반',tt:'🎯 티어대회',comp:'🏆 대회'};
    const modeBadge=modeBadgeMap[mode]||mode;

    h+=`<div class="rec-summary" style="border-left:4px solid ${_wBorderCol};background:var(--white);border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.04);padding:14px;display:flex;flex-direction:column;gap:12px;margin:0;">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:6px;flex-wrap:wrap">
        <div style="display:flex;align-items:center;gap:6px;min-width:0">
          ${_bulkOn?`<input type="checkbox" class="bulk-cb no-export" data-bkey="${_bulkKey}" data-bidx="${i}" onchange="_bulkCountUpdate('${_bulkKey}')" onclick="event.stopPropagation()" style="width:16px;height:16px;cursor:pointer;flex-shrink:0;accent-color:var(--blue)">`:''}
          <span style="background:var(--surface);color:var(--text2);font-size:10px;font-weight:800;padding:3px 8px;border-radius:6px;border:1px solid var(--border2);display:inline-flex;align-items:center">${modeBadge}</span>
          ${m.map?`<span style="font-size:11px;color:var(--text3);display:inline-flex;align-items:center;gap:2px">📍 ${m.map}</span>`:''}
          <span style="font-size:11px;color:var(--text2);font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:240px">⚔ ${labelA} vs ${labelB}</span>
        </div>
        
        <div class="rec-actions no-export" style="display:flex;align-items:center;gap:4px">
          <button class="btn btn-w btn-xs" onclick="copyMatchResult('${escJS(labelA||'')}',${sa||0},'${escJS(labelB||'')}',${sb||0},'${m.d||''}','${mode}',${i})" title="결과 텍스트로 복사" style="padding:4px 8px;font-size:11px;display:inline-flex;align-items:center;gap:4px">📋 <span class="hide-mobile">복사</span></button>
          <button class="btn btn-w btn-xs" onclick="openShareCardFromMatch('${mode}',${i})" title="공유 카드 이미지 생성" style="padding:4px 8px;font-size:11px;display:inline-flex;align-items:center;gap:4px">🎴 <span class="hide-mobile">카드</span></button>
          <button id="detbtn-${key}" class="btn btn-b btn-xs" onclick="toggleDetail('${key}')" style="padding:4px 10px;font-size:11px;font-weight:700;display:inline-flex;align-items:center;gap:4px">📂 <span class="hide-mobile">상세</span></button>
          ${adminBtn(`<button class="btn btn-o btn-xs" onclick="openRE('${mode}',${i})" title="수정">✏️</button>`)}
          ${adminBtn(`<button class="btn btn-r btn-xs" onclick="delRec('${mode}',${i})" title="삭제">🗑️</button>`)}
          ${isLoggedIn&&(mode==='mini'||mode==='univm')?`<button class="btn btn-w btn-xs no-export" onclick="event.stopPropagation();openMoveMatchPop(this,'${mode}',${i})" title="다른 탭으로 이동">↗</button>`:''}
        </div>
      </div>

      <div style="display:flex;align-items:center;justify-content:center;padding:4px 0">
        <div style="flex:1;display:flex;flex-direction:column;align-items:flex-end;gap:4px">
          <span class="ubadge${aWin?'':' loser'} clickable-univ" data-icon-done="1" style="background:${ca};display:inline-flex;align-items:center;gap:6px;font-size:14px;padding:4px 12px" onclick="${!isCK && (univCfg||[]).some(x=>x.name===labelA) ? `openUnivModal('${labelA}')` : (!isCK && (univCfg||[]).some(x=>x.name===m.a) ? `openUnivModal('${m.a||''}')` : '')}">${labelA}${iconA}</span>
          ${aWin?`<span style="font-size:10px;font-weight:800;color:${ca};padding:0 4px">WINNER 🏆</span>`:''}
        </div>
        
        <div class="rec-sum-score score-click" onclick="toggleDetail('${key}')" title="클릭하여 상세 보기/닫기" style="margin:0 16px;padding:6px 16px;background:var(--surface);border-radius:12px;border:1.5px solid var(--border2)">
          <span style="font-size:24px;font-weight:900;color:${aWin?'#16a34a':bWin?'#dc2626':'var(--text)'}">${sa}</span>
          <span style="color:var(--gray-l);font-size:16px;font-weight:400;margin:0 6px">:</span>
          <span style="font-size:24px;font-weight:900;color:${bWin?'#16a34a':aWin?'#dc2626':'var(--text)'}">${sb}</span>
        </div>
        
        <div style="flex:1;display:flex;flex-direction:column;align-items:flex-start;gap:4px">
          <span class="ubadge${bWin?'':' loser'} clickable-univ" data-icon-done="1" style="background:${cb};display:inline-flex;align-items:center;gap:6px;font-size:14px;padding:4px 12px" onclick="${!isCK && (univCfg||[]).some(x=>x.name===labelB) ? `openUnivModal('${labelB}')` : (!isCK && (univCfg||[]).some(x=>x.name===m.b) ? `openUnivModal('${m.b||''}')` : '')}">${iconB}${labelB}</span>
          ${bWin?`<span style="font-size:10px;font-weight:800;color:${cb};padding:0 4px">WINNER 🏆</span>`:''}
        </div>
      </div>

      <div id="det-${key}" class="rec-detail-area">
        ${_regDet(key,{...m,_editRef:`${mode}:${i}`}, mode, labelA, labelB, ca, cb, aWin, bWin)}
        ${m.memo?`<div style="margin-top:10px;font-size:12px;color:var(--text2);background:var(--gold-bg);border:1px solid var(--gold-b);border-radius:6px;padding:8px 12px">📝 ${m.memo}</div>`:''}
        ${isLoggedIn?`<div style="margin-top:10px;padding-top:10px;border-top:1px solid var(--border);display:flex;gap:6px">
          <input type="text" id="memo-${key}" placeholder="경기 메모 입력..." value="${m.memo||''}" style="flex:1;font-size:12px;padding:6px 10px;border:1px solid var(--border);border-radius:6px">
          <button class="btn btn-w btn-xs" onclick="saveMemo('${mode}',${i},'memo-${key}')" style="border-radius:6px">💾 메모</button>
          ${m.memo?`<button class="btn btn-r btn-xs" onclick="saveMemo('${mode}',${i},null)" style="border-radius:6px">🗑️ 삭제</button>`:''}
        </div>`:''}
      </div>
    </div>`;
  });
  h+=`</div>`;

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

  return h||`<div class="empty-state"><div class="empty-state-icon">📅</div><div class="empty-state-title">해당 기간에 기록이 없습니다</div><div class="empty-state-desc">다른 기간을 선택해보세요</div></div>`;
}

/* 모바일 시트용 레지스트리 */
window._detReg = window._detReg || {};
function _regDet(key, m, mode, lA, lB, ca, cb, aW, bW){
  window._detReg[key] = {m, mode, lA, lB, ca, cb, aW, bW};
  return buildDetailHTML(m, mode, lA, lB, ca, cb, aW, bW);
}

function buildDetailHTML(m, mode, labelA, labelB, ca, cb, aWin, bWin){
  // ind/gj: sets 없이 wName/lName/map 구조
  if(mode==='ind'||mode==='gj'){
    const pW=players.find(p=>p.name===m.wName), pL=players.find(p=>p.name===m.lName);
    const rW=pW?`<span class="rbadge r${pW.race}" style="font-size:10px">${pW.race}</span>`:'';
    const rL=pL?`<span class="rbadge r${pL.race}" style="font-size:10px">${pL.race}</span>`:'';
    const mapStr=m.map?`<span style="font-size:11px;color:var(--text3);white-space:nowrap">📍 ${m.map}</span>`:'';
    const memoStr=m.memo?`<div style="font-size:11px;color:var(--gray-l);margin-top:4px">📝 ${m.memo}</div>`:'';
    return `<div style="padding:6px 0">
      <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">
        <span style="background:${ca};color:#fff;font-size:10px;font-weight:800;padding:2px 7px;border-radius:4px">WIN</span>
        <span style="font-weight:700;font-size:13px">${m.wName||''}</span>${rW}
        <span style="color:var(--gray-l);font-size:12px">vs</span>
        <span style="font-size:13px;opacity:.7">${m.lName||''}</span>${rL}
        ${mapStr}
      </div>
      ${memoStr}
    </div>`;
  }
  if(!m.sets||!m.sets.length) return '<div style="font-size:12px;color:var(--gray-l);padding:8px 0">세트 상세 기록 없음</div>';
  let h='';
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
        const isMulti = Array.isArray(g.playerA) || Array.isArray(g.playerB);
        const pA_list = Array.isArray(g.playerA) ? g.playerA : [g.playerA];
        const pB_list = Array.isArray(g.playerB) ? g.playerB : [g.playerB];
        
        const aIsWinner=(g.winner==='A');
        const bIsWinner=(g.winner==='B');
        const hasWinner=!!(g.winner);
        const editBtn=isLoggedIn&&m._editRef?`<button class="btn btn-o btn-xs no-export" style="margin-left:4px;flex-shrink:0" onclick="openGameEditModal('${m._editRef}',${si},${gi})">✏️</button>`:'';

        const renderPlayer = (name, teamCol) => {
          const p = players.find(x=>x.name===name);
          const _pSafe = (name||'').replace(/\\/g,'\\\\').replace(/'/g,"\\'");
          const click = name ? `onclick="openPlayerModal('${_pSafe}')" style="cursor:pointer;text-decoration:underline dotted;"` : '';
          const race = p ? `<span class="rbadge r${p.race}" style="font-size:10px;flex-shrink:0">${p.race}</span>` : '';
          const photo = p ? getPlayerPhotoHTML(p.name,'38px','flex-shrink:0;border:2px solid '+teamCol+';box-shadow:0 1px 6px '+teamCol+'44') : (name ? `<div style="width:38px;height:38px;border-radius:50%;background:var(--border2);border:2px solid ${teamCol};flex-shrink:0"></div>` : '');
          const _ct = t => t ? t.replace(/티어$/,'') : '';
          const tier = p?.tier ? `<span style="background:${_TIER_BG[p.tier]||'#64748b'};color:${_TIER_TEXT[p.tier]||'#fff'};font-size:9px;font-weight:700;padding:1px 5px;border-radius:4px;flex-shrink:0"><span class="tier-pc">${p.tier}</span><span class="tier-mob">${_ct(p.tier)}</span></span>` : '';
          
          return { photo, html: `<div style="display:flex;align-items:center;gap:4px;overflow:hidden">${tier}${race}<strong style="font-size:13px;color:var(--text);white-space:nowrap" ${click}>${name||'?'}</strong></div>` };
        };

        const winBadge = col => `<span style="background:${col};color:#fff;font-size:10px;font-weight:800;padding:2px 7px;border-radius:4px;flex-shrink:0">WIN</span>`;
        const mapDot = g.map ? `<span style="font-size:10px;color:var(--text3);white-space:nowrap;flex-shrink:0">📍${g.map}</span>` : '';
        const winA = aIsWinner&&hasWinner;
        const winB = bIsWinner&&hasWinner;
        const loserStyleA = hasWinner && !aIsWinner ? 'opacity:.4;' : '';
        const loserStyleB = hasWinner && !bIsWinner ? 'opacity:.4;' : '';

        const resA = pA_list.map(n => renderPlayer(n, ca));
        const resB = pB_list.map(n => renderPlayer(n, cb));

        h+=`<div style="display:flex;flex-direction:column;gap:3px;padding:5px 2px;">
          <div style="display:flex;align-items:center;gap:5px;">
            <span style="color:var(--gray-l);font-size:11px;min-width:40px;font-weight:700;flex-shrink:0;text-align:center">경기${gi+1}</span>
            <div style="flex:1;display:flex;align-items:center;gap:5px;padding:6px 8px;border-radius:12px;background:${winA?ca+'18':'var(--surface)'};border:${winA?'1.5px solid '+ca+'55':'1px solid var(--border)'};min-width:0;${loserStyleA}">
              ${winA ? winBadge(ca) : ''}
              <div style="flex:1;min-width:0;display:flex;flex-direction:column;align-items:flex-end;gap:2px">
                ${resA.map(r => r.html).join('')}
              </div>
              <div style="display:flex;flex-direction:column;gap:2px">${resA.map(r => r.photo).join('')}</div>
            </div>
            <span style="color:var(--gray-l);font-size:12px;font-weight:800;flex-shrink:0">vs</span>
            <div style="flex:1;display:flex;align-items:center;gap:5px;padding:6px 8px;border-radius:12px;background:${winB?cb+'18':'var(--surface)'};border:${winB?'1.5px solid '+cb+'55':'1px solid var(--border)'};min-width:0;${loserStyleB}">
              <div style="display:flex;flex-direction:column;gap:2px">${resB.map(r => r.photo).join('')}</div>
              <div style="flex:1;min-width:0;display:flex;flex-direction:column;align-items:flex-start;gap:2px">
                ${resB.map(r => r.html).join('')}
              </div>
              ${winB ? winBadge(cb) : ''}
            </div>
            ${editBtn}
          </div>
          ${mapDot ? `<div style="padding-left:48px;font-size:10px;color:var(--text3)">${mapDot}</div>` : ''}
        </div>`;
      });
    } else {
      h+=`<div style="font-size:11px;color:var(--gray-l);padding:4px 0">상세 경기 기록 없음</div>`;
    }
    h+=`</div>`;
  });
  h+=`</div>`;
  return h;
}

/* ══════════════════════════════════════
   대전 기록 > 선수별 검색 탭
══════════════════════════════════════ */
function _histPSearchResultsHTML(q){
  const modeBadgeColors={'조별리그':'#2563eb','대회':'#b45309','미니대전':'#2563eb','시빌워':'#db2777','대학대전':'#7c3aed','대학CK':'#dc2626','프로리그':'#0891b2','티어대회':'#f59e0b','끝장전':'#8b5cf6','개인전':'#8b5cf6','개인':'#8b5cf6'};
  if(!q){
    return`<div class="empty-state"><div class="empty-state-icon">🔍</div><div class="empty-state-title">스트리머 이름을 입력하세요</div><div class="empty-state-desc">선수의 최근 기록(p.history)에서 검색합니다</div></div>`;
  }
  const ql=q.toLowerCase();
  const matched=players.filter(p=>p.name.toLowerCase().includes(ql));
  if(!matched.length){
    return`<div class="empty-state"><div class="empty-state-icon">😅</div><div class="empty-state-title">스트리머를 찾을 수 없습니다</div><div class="empty-state-desc">"${q}"와 일치하는 스트리머가 없습니다</div></div>`;
  }
  let h='';
  matched.forEach(p=>{
    const hist=(p.history||[]).slice().sort((a,b)=>(b.date||'').localeCompare(a.date||'')||(b.time||0)-(a.time||0));
    // 날짜 필터 적용
    const filteredHist=typeof passDateFilter==='function'?hist.filter(h=>passDateFilter(h.date||'')):hist;
    if(!filteredHist.length)return;
    const col=gc(p.univ)||'#6b7280';
    const wins=filteredHist.filter(hh=>hh.result==='승').length;
    const losses=filteredHist.length-wins;
    const wr=filteredHist.length?Math.round(wins/filteredHist.length*100):0;
    h+=`<div style="background:var(--surface);border:1px solid var(--border);border-radius:12px;overflow:hidden;margin-bottom:16px">
      <div style="padding:12px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px;cursor:pointer" onclick="openPlayerModal('${escJS(p.name)}')">
        <span style="width:10px;height:10px;border-radius:50%;background:${col};display:inline-block;flex-shrink:0"></span>
        <span style="font-weight:800;font-size:15px;color:var(--text)">${p.name}</span>
        <span style="font-size:12px;color:var(--gray-l)">${p.univ||''}</span>
        <span style="margin-left:auto;font-size:12px;font-weight:700;color:var(--text3)">${filteredHist.length}게임</span>
        <span style="font-size:12px;font-weight:700;color:#16a34a">${wins}승</span>
        <span style="font-size:12px;font-weight:700;color:#dc2626">${losses}패</span>
        <span style="font-size:12px;padding:2px 8px;border-radius:20px;background:${wr>=50?'#dcfce7':'#fee2e2'};color:${wr>=50?'#16a34a':'#dc2626'};font-weight:800">${wr}%</span>
      </div>
      <div style="overflow-x:auto">
        <table style="margin:0;border:none;border-radius:0;font-size:12px"><thead><tr>
          <th style="white-space:nowrap">날짜</th><th>종류</th><th>결과</th><th>상대</th><th>종족</th><th>맵</th><th>ELO</th>
        </tr></thead><tbody>`;
    filteredHist.forEach(hh=>{
      const isWin=hh.result==='승';
      const mc=modeBadgeColors[hh.mode||'']||'#6b7280';
      const oppP=players.find(x=>x.name===hh.opp);const oppCol=oppP?gc(oppP.univ):'#6b7280';
      const eloStr=hh.eloDelta!=null?`<span style="font-weight:700;font-size:11px;color:${hh.eloDelta>0?'#16a34a':'#dc2626'}">${hh.eloDelta>0?'+':''}${hh.eloDelta}</span>`:'-';
      h+=`<tr style="background:${isWin?'#f0fdf4':'#fef2f2'}10">
        <td style="color:var(--text3);font-size:12px;font-weight:600;white-space:nowrap">${hh.date||''}</td>
        <td><span style="background:${mc};color:#fff;padding:1px 5px;border-radius:4px;font-size:10px;font-weight:700;white-space:nowrap">${hh.mode||''}</span></td>
        <td>${isWin?`<span style="background:#dcfce7;color:#16a34a;border:1px solid #bbf7d0;font-size:10px;font-weight:800;padding:2px 7px;border-radius:20px">WIN</span>`:`<span style="background:#fee2e2;color:#dc2626;border:1px solid #fecaca;font-size:10px;font-weight:800;padding:2px 7px;border-radius:20px">LOSE</span>`}</td>
        <td style="cursor:pointer;font-weight:700" onclick="openPlayerModal('${escJS(hh.opp)}')"><span style="display:inline-flex;align-items:center;gap:3px"><span style="width:10px;height:10px;border-radius:3px;background:${oppCol};display:inline-block;flex-shrink:0"></span><span style="color:var(--blue)">${hh.opp||''}</span></span></td>
        <td><span class="rbadge r${hh.oppRace}" style="font-size:10px">${hh.oppRace||''}</span></td>
        <td style="color:var(--gray-l);font-size:11px">${hh.map&&hh.map!=='-'?hh.map:''}</td>
        <td>${eloStr}</td>
      </tr>`;
    });
    h+=`</tbody></table></div></div>`;
  });
  return h||`<div class="empty-state"><div class="empty-state-icon">📭</div><div class="empty-state-title">경기 기록이 없습니다</div></div>`;
}

function _psearchUpdate(val){
  window._histPSearchQ=val;
  const r=document.getElementById('hist-psearch-results');
  if(r) r.innerHTML=_histPSearchResultsHTML(val.trim());
}

/* ══════════════════════════════════════
   대학 전력 비교
══════════════════════════════════════ */
var _univCompA = '', _univCompB = '';

function histUnivCompHTML(){
  const allU = getAllUnivs().filter(u=>!u.hidden||isLoggedIn).filter(u=>u.name!=='무소속');
  // 처음 진입 시 자동으로 첫 두 대학 선택
  if(!_univCompA && allU.length>=1) _univCompA = allU[0].name;
  if(!_univCompB && allU.length>=2) _univCompB = allU[1].name;
  const uOpts = name => `<option value="">— 대학 선택 —</option>`
    + allU.map(u=>`<option value="${u.name}"${u.name===name?' selected':''}>${u.name}</option>`).join('');

  // 선택된 대학 비교 카드
  function univStats(univName){
    if(!univName) return null;
    const col = gc(univName);
    const members = players.filter(p=>p.univ===univName&&!p.retired);
    const activeM = members.filter(p=>(p.win+p.loss)>0);
    const avgElo = activeM.length ? Math.round(activeM.reduce((s,p)=>s+(p.elo||ELO_DEFAULT),0)/activeM.length) : ELO_DEFAULT;
    const totalW = members.reduce((s,p)=>s+(p.win||0),0);
    const totalL = members.reduce((s,p)=>s+(p.loss||0),0);
    const wr = (totalW+totalL) ? Math.round(totalW/(totalW+totalL)*100) : 0;
    const ace = [...members].sort((a,b)=>(b.points||0)-(a.points||0))[0];
    // 전체 팀전 전적 (미니/대학대전/CK/프로)
    const _allTeamArrs = [
      {arr:miniM, label:'미니'},
      {arr:univM, label:'대학대전'},
      {arr:ckM,   label:'CK', isCK:true},
      {arr:proM,  label:'프로', isCK:true},
    ];
    let mW=0,mL=0;
    _allTeamArrs.forEach(({arr,isCK})=>{
      (arr||[]).forEach(m=>{
        if(m.sa==null||m.sb==null) return;
        const myA = isCK
          ? (m.teamAMembers||[]).some(x=>x.univ===univName)
          : m.a===univName;
        const myB = isCK
          ? (m.teamBMembers||[]).some(x=>x.univ===univName)
          : m.b===univName;
        if(myA&&m.sa>m.sb) mW++;
        else if(myB&&m.sb>m.sa) mW++;
        else if(myA&&m.sa<m.sb) mL++;
        else if(myB&&m.sb<m.sa) mL++;
      });
    });
    // 직접 대결 (전체 팀전)
    let vsW=0,vsL=0;
    if(_univCompA&&_univCompB){
      const opp=univName===_univCompA?_univCompB:_univCompA;
      _allTeamArrs.forEach(({arr,isCK})=>{
        (arr||[]).filter(m=>m.sa!=null).forEach(m=>{
          const myA=isCK?(m.teamAMembers||[]).some(x=>x.univ===univName):m.a===univName;
          const myB=isCK?(m.teamBMembers||[]).some(x=>x.univ===univName):m.b===univName;
          const oppA=isCK?(m.teamAMembers||[]).some(x=>x.univ===opp):m.a===opp;
          const oppB=isCK?(m.teamBMembers||[]).some(x=>x.univ===opp):m.b===opp;
          const hasOpp=oppA||oppB;
          if(!hasOpp) return;
          const myWin=(myA&&m.sa>m.sb)||(myB&&m.sb>m.sa);
          const myLoss=(myA&&m.sa<m.sb)||(myB&&m.sb<m.sa);
          if(myWin)vsW++; else if(myLoss)vsL++;
        });
      });
    }
    return {col,members,activeM,avgElo,totalW,totalL,wr,ace,mW,mL,vsW,vsL};
  }

  const sA = univStats(_univCompA);
  const sB = univStats(_univCompB);

  function statRow(label,va,vb,higherBetter=true){
    const na=parseFloat(va),nb=parseFloat(vb);
    const aWins=!isNaN(na)&&!isNaN(nb)&&(higherBetter?na>nb:na<nb);
    const bWins=!isNaN(na)&&!isNaN(nb)&&(higherBetter?nb>na:nb<na);
    const ca=sA?sA.col:'#2563eb', cb=sB?sB.col:'#dc2626';
    return `<tr>
      <td style="text-align:right;padding:6px 10px;font-weight:${aWins?800:600};color:${aWins?ca:'var(--text)'}">${va}${aWins?` <span style="color:${ca}">◀</span>`:''}</td>
      <td style="text-align:center;padding:6px 8px;color:var(--gray-l);font-size:11px;white-space:nowrap">${label}</td>
      <td style="text-align:left;padding:6px 10px;font-weight:${bWins?800:600};color:${bWins?cb:'var(--text)'}">${bWins?`<span style="color:${cb}">▶</span> `:''}${vb}</td>
    </tr>`;
  }

  return `<div>
    <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-bottom:16px;padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:12px">
      <select onchange="_univCompA=this.value;render()" style="flex:1;min-width:120px;padding:7px 10px;border-radius:8px;border:1.5px solid ${sA?sA.col+'99':'var(--border2)'};font-size:13px;font-weight:700;background:var(--white)">
        ${uOpts(_univCompA)}
      </select>
      <span style="font-weight:900;font-size:16px;color:var(--gray-l)">VS</span>
      <select onchange="_univCompB=this.value;render()" style="flex:1;min-width:120px;padding:7px 10px;border-radius:8px;border:1.5px solid ${sB?sB.col+'99':'var(--border2)'};font-size:13px;font-weight:700;background:var(--white)">
        ${uOpts(_univCompB)}
      </select>
    </div>

    ${(!sA||!sB)?`<div style="text-align:center;padding:40px;color:var(--gray-l)">두 대학을 선택하면 전력을 비교합니다</div>`:`
    <div style="display:flex;gap:10px;margin-bottom:14px;flex-wrap:wrap">
      <div style="flex:1;min-width:130px;background:${sA.col}18;border:2px solid ${sA.col}44;border-radius:12px;padding:14px;text-align:center">
        <div style="font-weight:900;font-size:16px;color:${sA.col};margin-bottom:4px">${_univCompA}</div>
        <div style="font-size:11px;color:var(--gray-l)">${sA.members.length}명</div>
        ${sA.vsW>sA.vsL?`<div style="margin-top:6px;font-size:10px;font-weight:800;color:${sA.col}">🏆 직접 대결 우세</div>`:''}
      </div>
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-width:80px">
        <div style="font-size:11px;color:var(--gray-l);margin-bottom:4px">직접 대결</div>
        <div style="font-size:28px;font-weight:900">
          <span style="color:${sA.vsW>sA.vsL?sA.col:'var(--text3)'}">${sA.vsW}</span>
          <span style="color:var(--gray-l);font-size:18px">:</span>
          <span style="color:${sB.vsW>sB.vsL?sB.col:'var(--text3)'}">${sB.vsW}</span>
        </div>
        <div style="font-size:10px;color:var(--gray-l)">팀전 전체 기준</div>
      </div>
      <div style="flex:1;min-width:130px;background:${sB.col}18;border:2px solid ${sB.col}44;border-radius:12px;padding:14px;text-align:center">
        <div style="font-weight:900;font-size:16px;color:${sB.col};margin-bottom:4px">${_univCompB}</div>
        <div style="font-size:11px;color:var(--gray-l)">${sB.members.length}명</div>
        ${sB.vsW>sB.vsL?`<div style="margin-top:6px;font-size:10px;font-weight:800;color:${sB.col}">🏆 직접 대결 우세</div>`:''}
      </div>
    </div>

    <div style="background:var(--white);border:1px solid var(--border);border-radius:12px;overflow:hidden;margin-bottom:14px">
      <table style="margin:0;border:none;border-radius:0;table-layout:fixed">
        <thead><tr>
          <th style="text-align:right;color:${sA.col};width:40%">${_univCompA}</th>
          <th style="text-align:center;color:var(--gray-l);width:20%">항목</th>
          <th style="text-align:left;color:${sB.col};width:40%">${_univCompB}</th>
        </tr></thead>
        <tbody>
          ${statRow('평균 ELO', sA.avgElo, sB.avgElo)}
          ${statRow('전체 승률', sA.wr+'%', sB.wr+'%')}
          ${statRow('전체 승', sA.totalW, sB.totalW)}
          ${statRow('전체 패', sA.totalL, sB.totalL, false)}
          ${statRow('팀전 승(전체)', sA.mW, sB.mW)}
          ${statRow('팀전 패(전체)', sA.mL, sB.mL, false)}
          ${statRow('선수 수', sA.members.length, sB.members.length)}
          <tr>
            <td style="text-align:right;padding:6px 10px;cursor:pointer;color:${sA.col};font-weight:700" onclick="cm('univModal');setTimeout(()=>openPlayerModal('${(sA.ace?.name||'').replace(/'/g,"\'")}'),80)">${sA.ace?.name||'-'}</td>
            <td style="text-align:center;padding:6px 8px;color:var(--gray-l);font-size:11px">에이스</td>
            <td style="text-align:left;padding:6px 10px;cursor:pointer;color:${sB.col};font-weight:700" onclick="cm('univModal');setTimeout(()=>openPlayerModal('${(sB.ace?.name||'').replace(/'/g,"\'")}'),80)">${sB.ace?.name||'-'}</td>
          </tr>
        </tbody>
      </table>
    </div>`}
  </div>`;
}

function histPlayerSearchHTML(){
  const q=(window._histPSearchQ||'').trim();
  return`<div style="margin-bottom:12px">
    <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
      <input type="text" id="hist-psearch-input" placeholder="🔍 스트리머 이름 입력..." value="${q.replace(/"/g,'&quot;')}"
        oninput="_psearchUpdate(this.value)"
        style="flex:1;min-width:160px;max-width:280px;padding:7px 12px;border:1.5px solid var(--blue);border-radius:8px;font-size:13px;font-weight:600;outline:none" autofocus>
      ${q?`<button onclick="window._histPSearchQ='';document.getElementById('hist-psearch-input').value='';document.getElementById('hist-psearch-results').innerHTML=_histPSearchResultsHTML('')" style="background:none;border:none;cursor:pointer;color:var(--gray-l);font-size:18px;line-height:1;padding:0 2px">✕</button>`:''}
    </div>
  </div>
  <div id="hist-psearch-results">${_histPSearchResultsHTML(q)}</div>`;
}

// tourneys에서 완료된 모든 경기를 flat하게 추출
function getTourneyMatches(){
  const result=[];
  if(!Array.isArray(tourneys))return result;
  (tourneys||[]).forEach(tn=>{
    // 조별리그 경기
    (tn.groups||[]).forEach((grp,gi)=>{
      const gl='ABCDEFGHIJ'[gi]||String(gi);
      const col=['#2563eb','#dc2626','#16a34a','#d97706','#7c3aed','#0891b2'][gi%6];
      (grp.matches||[]).forEach((m,mi)=>{
        if(!m.a||!m.b)return;
        if(m.sa==null||m.sb==null)return;
        result.push({
          _src:'tour',_tnId:tn.id,_gi:gi,_mi:mi,
          d:m.d||'',n:tn.name,a:m.a,b:m.b,
          sa:m.sa,sb:m.sb,sets:m.sets||[],
          grpName:grp.name,grpLetter:gl,grpColor:col
        });
      });
    });
    // 브라켓 경기 (matchDetails)
    const br=tn.bracket||{};
    Object.entries(br.matchDetails||{}).forEach(([key,m])=>{
      if(!m||!m.a||!m.b||m.sa==null||m.sb==null)return;
      result.push({
        _src:'tour_bracket',_tnId:tn.id,_bktKey:key,
        d:m.d||'',n:tn.name,a:m.a,b:m.b,
        sa:m.sa,sb:m.sb,sets:m.sets||[],
        grpName:'토너먼트',grpLetter:'T',grpColor:'#2563eb'
      });
    });
    // 브라켓 winner-only 경기 (matchDetails에 a/b 없거나 없는 키)
    Object.entries(br.winners||{}).forEach(([key,winner])=>{
      if(!winner)return;
      const det=(br.matchDetails||{})[key];
      if(det&&det.a&&det.b&&det.sa!=null&&det.sb!=null)return; // 이미 위에서 처리
      const parts=key.split('-');
      const r=parseInt(parts[0]),mi=parseInt(parts[1]);
      const a=(det&&det.a)||((br.slots||{})[`${r}-${mi}-a`])||(r>0?((br.winners||{})[`${r-1}-${mi*2}`]||''):'');
      const b=(det&&det.b)||((br.slots||{})[`${r}-${mi}-b`])||(r>0?((br.winners||{})[`${r-1}-${mi*2+1}`]||''):'');
      if(!a||!b)return;
      result.push({
        _src:'tour_bracket',_tnId:tn.id,_bktKey:key,
        d:(det&&det.d)||'',n:tn.name,a,b,
        sa:winner===a?1:0,sb:winner===b?1:0,sets:[],
        grpName:'토너먼트',grpLetter:'T',grpColor:'#2563eb'
      });
    });
    // 수동 추가 브라켓 경기 (manualMatches)
    (br.manualMatches||[]).forEach((m,idx)=>{
      if(!m||!m.a||!m.b||m.sa==null||m.sb==null)return;
      result.push({
        _src:'tour_manual',_tnId:tn.id,_manualIdx:idx,
        d:m.d||'',n:tn.name,a:m.a,b:m.b,
        sa:m.sa,sb:m.sb,sets:m.sets||[],
        grpName:m.rndLabel||'토너먼트',grpLetter:'T',grpColor:'#7c3aed'
      });
    });
  });
  return result;
}
function compSummaryListHTML(context){
  // tourneys 경기 + comps 배열 모두 합산
  const tourItems=getTourneyMatches();
  const compItems=[...comps].map((m,origIdx)=>({...m,_src:'comps',_origIdx:origIdx}));
  const allItems=[...tourItems,...compItems];
  if(!allItems.length)return`<div class="empty-state"><div class="empty-state-icon">📭</div><div class="empty-state-title">기록이 없습니다</div><div class="empty-state-desc">기록이 추가되면 여기에 표시됩니다</div></div>`;
  // 날짜 필터 적용 후 정렬
  const filtered=allItems.filter(m=>
    typeof passDateFilter!=='function'||passDateFilter(m.d||'')
  );
  filtered.sort((a,b)=>recSortDir==='asc'
    ?(a.d||'').localeCompare(b.d||'')
    :(b.d||'').localeCompare(a.d||''));
  const sortBar=`<div class="sort-bar no-export">
    <span style="font-size:11px;color:var(--text3)">날짜 정렬</span>
    <button class="sort-btn ${recSortDir==='desc'?'on':''}" onclick="recSortDir='desc';render()">최신순 ↓</button>
    <button class="sort-btn ${recSortDir==='asc'?'on':''}" onclick="recSortDir='asc';render()">오래된순 ↑</button>
    <span style="font-size:11px;color:var(--gray-l);margin-left:4px">${filtered.length}건</span>
  </div>`;
  if(!filtered.length)return sortBar+`<div class="empty-state"><div class="empty-state-icon">📅</div><div class="empty-state-title">해당 기간에 기록이 없습니다</div><div class="empty-state-desc">다른 기간을 선택해보세요</div></div>`;
  let h=sortBar;
  filtered.forEach((m,listIdx)=>{
    const a=m.a||m.hostUniv||m.u||'';const b=m.b||'';
    const ca=gc(a);const cb=gc(b);
    const aWin=m.sa>m.sb;const bWin=m.sb>m.sa;
    const key=`${context}-comp-${listIdx}`;
    const rIdx=(m._src==='comps')?m._origIdx:-1;
    // GROUP 배지 (tourneys 경기)
    const grpBadge=m._src==='tour'
      ?`<span style="background:${m.grpColor};color:#fff;font-size:10px;font-weight:700;padding:1px 8px;border-radius:4px;margin-left:6px">GROUP ${m.grpLetter}</span>`:'';
    h+=`<div class="rec-summary">
      <div class="rec-sum-header">
        <span style="color:var(--text3);font-size:12px;font-weight:600;min-width:72px">${m.d||''}</span>
        <span style="font-weight:700;font-size:13px">🎖️ ${m.n||'대회'}${grpBadge}</span>
        <div class="rec-sum-vs">
          ${a?`<span class="ubadge${aWin?'':' loser'} clickable-univ" style="background:${ca}" onclick="openUnivModal('${a}')">${a}</span>`:''}
          ${(a&&b)?`<div class="rec-sum-score score-click" onclick="toggleDetail('${key}')" title="클릭하여 상세보기">
            <span class="${aWin?'wt':bWin?'lt':'pt-z'}">${m.sa||0}</span>
            <span style="color:var(--gray-l);font-size:14px">:</span>
            <span class="${bWin?'wt':aWin?'lt':'pt-z'}">${m.sb||0}</span>
          </div>`:''}
          ${b?`<span class="ubadge${bWin?'':' loser'} clickable-univ" style="background:${cb}" onclick="openUnivModal('${b}')">${b}</span>`:''}
          ${(a&&b)?`<span style="font-size:12px;font-weight:700;color:${aWin?ca:bWin?cb:'#888'}">
            ${aWin?'▶ '+a+' 승':bWin?'▶ '+b+' 승':'무승부'}
          </span>`:''}
        </div>
        <div style="margin-left:auto;display:flex;align-items:center;gap:4px;flex-shrink:0">
          <button class="btn btn-w btn-xs" onclick="copyMatchResult('${escJS(a)}',${m.sa||0},'${escJS(b)}',${m.sb||0},'${m.d||''}','comp',${rIdx>=0?rIdx:'null'})" title="결과 복사" style="padding:3px 8px;font-size:14px">📤</button>
          <div style="display:flex;gap:4px;align-items:center" class="no-export">
            <button id="detbtn-${key}" class="btn-detail" onclick="toggleDetail('${key}')">📂 상세</button>
            ${rIdx>=0?adminBtn(`<button class="btn btn-o btn-xs" onclick="openRE('comp',${rIdx})">✏️ 수정</button>`):''}
            ${rIdx>=0?adminBtn(`<button class="btn btn-r btn-xs" onclick="delRec('comp',${rIdx})">🗑️ 삭제</button>`):''}
            ${m._src==='tour'?adminBtn(`<button class="btn btn-o btn-xs" onclick="leagueEditMatch('${m._tnId}',${m._gi},${m._mi})">✏️ 수정</button>`):''}
          </div>
        </div>
      </div>
      <div id="det-${key}" class="rec-detail-area">
        ${_regDet(key,rIdx>=0?{...m,_editRef:'comp:'+rIdx}:m,'comp',a,b,ca,cb,aWin,bWin)}
        <div style="margin-top:10px;padding-top:10px;border-top:1px solid var(--border)" class="no-export">
          ${m.memo?`<div style="font-size:12px;color:var(--text2);background:var(--gold-bg);border:1px solid var(--gold-b);border-radius:6px;padding:6px 10px;margin-bottom:6px">📝 ${m.memo}</div>`:''}
          <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap">
            <button class="btn btn-p btn-xs" onclick="_shareMode='match';window._shareMatchObj=_getCompMatchObj(${listIdx},'${context}');openShareCardModal();setTimeout(()=>renderShareCardByMatchObj(window._shareMatchObj),80)">🎴 공유 카드</button>
            ${rIdx>=0&&isLoggedIn?`<input type="text" id="memo-${key}" placeholder="경기 메모..." value="${m.memo||''}" style="flex:1;font-size:12px">
            <button class="btn btn-w btn-xs" onclick="saveMemo('comp',${rIdx},'memo-${key}')">💾 메모</button>
            ${m.memo?`<button class="btn btn-r btn-xs" onclick="saveMemo('comp',${rIdx},null)">🗑️ 삭제</button>`:''}`:''}
          </div>
        </div>
      </div>
    </div>`;
  });
  return h||`<div class="empty-state"><div class="empty-state-icon">📅</div><div class="empty-state-title">해당 기간에 기록이 없습니다</div><div class="empty-state-desc">다른 기간을 선택해보세요</div></div>`;
}
// 공유카드용 - context별 캐시된 filtered 배열에서 m 객체 반환 헬퍼
window._compListCache={};
function _getCompMatchObj(listIdx,context){
  // 캐시 없거나 데이터 변경 시 재생성
  if(!window._compListCache||!window._compListCache[context]){
    if(!window._compListCache)window._compListCache={};
    const tourItems=getTourneyMatches();
    const compItems=[...comps].map((m,origIdx)=>({...m,_src:'comps',_origIdx:origIdx}));
    const all=[...tourItems,...compItems].filter(m=>typeof passDateFilter!=='function'||passDateFilter(m.d||''));
    all.sort((a,b)=>recSortDir==='asc'?(a.d||'').localeCompare(b.d||''):(b.d||'').localeCompare(a.d||''));
    window._compListCache[context]=all;
  }
  return window._compListCache[context][listIdx]||null;
}

/* ══════════════════════════════════════
   경기 이동 (탭 간 이동)
══════════════════════════════════════ */
var _movePop=null;
function _showMovePop(btn,opts){
  closeMovePop();
  const pop=document.createElement('div');
  pop.id='_movePop';
  pop.style.cssText='position:fixed;z-index:9999;background:var(--white,#fff);border:1px solid var(--border2,#cbd5e1);border-radius:10px;box-shadow:0 6px 24px rgba(0,0,0,.18);padding:6px;min-width:180px;font-family:\'Noto Sans KR\',sans-serif';
  const r=btn.getBoundingClientRect();
  pop.style.top=(r.bottom+4)+'px';
  pop.style.right=(window.innerWidth-r.right)+'px';
  let html='';
  opts.forEach((o,i)=>{
    html+=`<button onclick="_movePop_pick(${i})" style="display:block;width:100%;text-align:left;padding:8px 12px;border:none;background:none;cursor:pointer;font-size:13px;font-weight:600;border-radius:7px;color:var(--text,#1e293b)" onmouseenter="this.style.background='rgba(37,99,235,.08)'" onmouseleave="this.style.background='none'">${o.l}</button>`;
  });
  html+=`<button onclick="closeMovePop()" style="display:block;width:100%;text-align:left;padding:6px 12px;border:none;background:none;cursor:pointer;font-size:12px;border-radius:7px;color:var(--gray-l,#94a3b8)" onmouseenter="this.style.background='rgba(0,0,0,.04)'" onmouseleave="this.style.background='none'">취소</button>`;
  pop.innerHTML=html;
  document.body.appendChild(pop);
  _movePop=pop;
  window._movePopOpts=opts;
  setTimeout(()=>document.addEventListener('click',_movePopOutside,{once:true}),0);
}
function _movePopOutside(e){ if(_movePop&&!_movePop.contains(e.target)) closeMovePop(); }
function _movePop_pick(i){ const fn=window._movePopOpts&&window._movePopOpts[i]&&window._movePopOpts[i].fn; closeMovePop(); if(fn) fn(); }
function closeMovePop(){ if(_movePop){_movePop.remove();_movePop=null;} document.removeEventListener('click',_movePopOutside); }

// 팀 경기 이동 (mini ↔ univm ↔ civil)
function moveTeamMatch(srcMode, srcIdx, destMode, _batch=false){
  const srcArr=srcMode==='mini'?miniM:univM;
  const m=srcArr[srcIdx];
  if(!m)return;
  const srcType=m.type||'mini'; // 'mini'|'civil' (miniM 전용)
  const oldLabel=srcMode==='univm'?'대학대전':srcType==='civil'?'시빌워':'미니대전';
  const newLabel=destMode==='univm'?'대학대전':destMode==='civil'?'시빌워':'미니대전';
  if(oldLabel===newLabel)return;
  // 배열 이동
  srcArr.splice(srcIdx,1);
  if(destMode==='univm'){
    const {type:_t,...rest}=m; // type 필드 제거
    univM.unshift(rest);
    var moved=rest;
  } else {
    m.type=destMode==='civil'?'civil':'mini';
    miniM.unshift(m);
    var moved=m;
  }
  // player.history mode 레이블 업데이트
  const mid=moved._id;
  players.forEach(p=>(p.history||[]).forEach(h=>{if(h.matchId===mid)h.mode=newLabel;}));
  if(!_batch){if(typeof fixPoints==='function')fixPoints();save();render();}
}

// ── 일괄 선택 이동 ───────────────────────────────────────────
let _bulkModes = {}; // {key:bool} — 'mini'|'civil'|'univm'

function toggleBulkMode(key){
  _bulkModes[key]=!_bulkModes[key];
  render();
}
function bulkToggleAll(key,checked){
  document.querySelectorAll(`.bulk-cb[data-bkey="${key}"]`).forEach(cb=>cb.checked=checked);
  _bulkCountUpdate(key);
}
function _bulkCountUpdate(key){
  const n=[...document.querySelectorAll(`.bulk-cb[data-bkey="${key}"]:checked`)].length;
  const el=document.getElementById('bulk-cnt-'+key);
  if(el)el.textContent=n+'개 선택됨';
  const allCbs=document.querySelectorAll(`.bulk-cb[data-bkey="${key}"]`);
  const allChk=document.getElementById('bulk-all-'+key);
  if(allChk&&allCbs.length) allChk.indeterminate=n>0&&n<allCbs.length, allChk.checked=n===allCbs.length;
}
function bulkMoveTeam(bulkKey,destMode){
  const cbs=[...document.querySelectorAll(`.bulk-cb[data-bkey="${bulkKey}"]:checked`)];
  if(!cbs.length){alert('선택된 경기가 없습니다.');return;}
  const indices=cbs.map(cb=>parseInt(cb.dataset.bidx)).sort((a,b)=>b-a);
  if(!confirm(indices.length+'개 경기를 이동하시겠습니까?'))return;
  const srcMode=bulkKey==='univm'?'univm':'mini';
  indices.forEach(idx=>moveTeamMatch(srcMode,idx,destMode,true));
  _bulkModes[bulkKey]=false;
  if(typeof fixPoints==='function')fixPoints();
  save();render();
}
function bulkDeleteRecs(bulkKey){
  const cbs=[...document.querySelectorAll(`.bulk-cb[data-bkey="${bulkKey}"]:checked`)];
  if(!cbs.length){alert('선택된 경기가 없습니다.');return;}
  const indices=cbs.map(cb=>parseInt(cb.dataset.bidx)).sort((a,b)=>b-a);
  if(!confirm(indices.length+'개 경기를 삭제하시겠습니까?\n\n⚠️ 해당 대전의 모든 경기 결과가 선수 성적에서 차감됩니다.'))return;
  const arr=bulkKey==='univm'?univM:bulkKey==='ck'?ckM:bulkKey==='pro'?proM:bulkKey==='tt'?ttM:miniM;
  const deletedIds=new Set();
  indices.forEach(idx=>{
    const matchObj=arr[idx];
    if(matchObj){
      if(matchObj._id){
        deletedIds.add(matchObj._id);
        // 게임 레벨 ID도 추가 (sets 기반 저장: matchId_sN_gN 포맷)
        (matchObj.sets||[]).forEach((set,si)=>{
          (set.games||[]).forEach((g,gi)=>{
            deletedIds.add(`${matchObj._id}_s${si}_g${gi}`);
          });
        });
      }
      arr.splice(idx,1);
      revertMatchRecord(matchObj);
    }
  });
  // 안전 처리: revertMatchRecord가 놓친 history 항목 직접 정리
  if(deletedIds.size>0){
    players.forEach(p=>{
      if(!p.history)return;
      const removed=p.history.filter(h=>h.matchId&&deletedIds.has(h.matchId));
      if(!removed.length)return;
      p.history=p.history.filter(h=>!h.matchId||!deletedIds.has(h.matchId));
      removed.forEach(hr=>{
        if(hr.result==='승'){p.win=Math.max(0,(p.win||0)-1);p.points=(p.points||0)-3;}
        else if(hr.result==='패'){p.loss=Math.max(0,(p.loss||0)-1);p.points=(p.points||0)+3;}
        if(hr.eloDelta!=null)p.elo=(p.elo||1500)-hr.eloDelta;
      });
    });
  }
  _bulkModes[bulkKey]=false;
  if(typeof fixPoints==='function')fixPoints();
  save();render();
}
// ─────────────────────────────────────────────────────────────

// 팀 경기 이동 팝업 열기
function openMoveMatchPop(btn,srcMode,srcIdx){
  const arr=srcMode==='mini'?miniM:univM;
  const m=arr[srcIdx];if(!m)return;
  const srcType=m.type||'mini';
  const opts=[];
  if(srcMode==='mini'&&srcType==='mini'){
    opts.push({l:'⚔️ 시빌워로 이동',fn:()=>moveTeamMatch('mini',srcIdx,'civil')});
    opts.push({l:'🏟️ 대학대전으로 이동',fn:()=>moveTeamMatch('mini',srcIdx,'univm')});
  } else if(srcMode==='mini'&&srcType==='civil'){
    opts.push({l:'⚡ 미니대전으로 이동',fn:()=>moveTeamMatch('mini',srcIdx,'mini')});
    opts.push({l:'🏟️ 대학대전으로 이동',fn:()=>moveTeamMatch('mini',srcIdx,'univm')});
  } else if(srcMode==='univm'){
    opts.push({l:'⚡ 미니대전으로 이동',fn:()=>moveTeamMatch('univm',srcIdx,'mini')});
    opts.push({l:'⚔️ 시빌워로 이동',fn:()=>moveTeamMatch('univm',srcIdx,'civil')});
  }
  _showMovePop(btn,opts);
}

function delRec(mode,i){
  if(!confirm('삭제하시겠습니까?\n\n⚠️ 해당 대전의 모든 경기 결과가 선수 성적에서 차감됩니다.'))return;
  let matchObj=null;
  if(mode==='mini')     { matchObj=miniM[i];  miniM.splice(i,1); }
  else if(mode==='univm'){ matchObj=univM[i];  univM.splice(i,1); }
  else if(mode==='comp') { matchObj=comps[i];  comps.splice(i,1); }
  else if(mode==='ck')   { matchObj=ckM[i];    ckM.splice(i,1);   }
  else if(mode==='pro')  { matchObj=proM[i];   proM.splice(i,1);  }
  else if(mode==='tt')   { matchObj=ttM[i];    ttM.splice(i,1);   }
  if(matchObj) revertMatchRecord(matchObj);
  if(typeof fixPoints==='function')fixPoints();
  save();render();
}


function toggleDetail(key){
  const area=document.getElementById('det-'+key);
  const btn=document.getElementById('detbtn-'+key);
  if(!area)return;
  const isTR=area.tagName==='TR';
  if(isTR){
    const open=area.style.display==='none'||area.style.display==='';
    area.style.display=open?'table-row':'none';
    if(btn)btn.textContent=open?'▲':'▼';
  } else {
    openDetails[key]=!openDetails[key];
    area.classList.toggle('open',!!openDetails[key]);
    if(btn){btn.classList.toggle('open',!!openDetails[key]);btn.textContent=openDetails[key]?'🔼 닫기':'📂 상세';}
    const card=area.closest('.rec-summary');
    if(card) card.classList.toggle('detail-open',!!openDetails[key]);
  }
}

function savePlayerMemo(name, del=false){
  const p=players.find(x=>x.name===name);
  if(!p)return;
  if(del){
    delete p.memo;
  } else {
    const el=document.getElementById('player-memo-input');
    if(el) p.memo=el.value.trim();
  }
  save();
  document.getElementById('playerModalBody').innerHTML=buildPlayerDetailHTML(p);
}

function saveMemo(mode,idx,inputId){
  let arr;
  if(mode==='mini') arr=miniM;
  else if(mode==='univm') arr=univM;
  else if(mode==='comp') arr=comps;
  else if(mode==='ck') arr=ckM;
  else if(mode==='pro') arr=proM;
  else return;
  if(!arr[idx])return;
  if(inputId===null){
    delete arr[idx].memo;
  } else {
    const el=document.getElementById(inputId);
    if(el) arr[idx].memo=el.value.trim();
  }
  save();render();
}

function buildSingleSetHTML(m, si, labelA, labelB, ca, cb){
  if(!m.sets||!m.sets[si])return`<div style="font-size:11px;color:var(--gray-l)">세트 기록 없음</div>`;
  const set=m.sets[si];
  const isAce=(si===m.sets.length-1&&m.sets.length>=3);
  const sLabel=isAce?'🎯 에이스전':`${si+1}세트`;
  const swA=set.scoreA||0,swB=set.scoreB||0;
  const setAWin=swA>swB,setBWin=swB>swA;
  let h=`<div style="font-size:11px;font-weight:700;color:${isAce?'#7c3aed':'var(--blue)'};margin-bottom:8px">${sLabel} — ${labelA} <span class="${setAWin?'wt':'lt'}">${swA}</span>:<span class="${setBWin?'wt':'lt'}">${swB}</span> ${labelB}</div>`;
  if(set.games&&set.games.length){
    set.games.forEach((g,gi)=>{
      if(!g.playerA&&!g.playerB)return;
      const pA=players.find(p=>p.name===g.playerA);
      const pB=players.find(p=>p.name===g.playerB);
      const aIsWinner=g.winner==='A';const bIsWinner=g.winner==='B';const hasWinner=!!g.winner;
      const winBgA=ca+'22',winBgB=cb+'22',winBorderA=ca+'66',winBorderB=cb+'66';
      const styleA=hasWinner?(aIsWinner?`display:flex;align-items:center;gap:4px;padding:4px 10px;border-radius:6px;background:${winBgA};border:2px solid ${winBorderA};`:`display:flex;align-items:center;gap:4px;padding:4px 10px;border-radius:6px;background:var(--surface);border:1px solid var(--border);opacity:0.45;filter:grayscale(1);`):`display:flex;align-items:center;gap:4px;padding:4px 10px;border-radius:6px;background:var(--surface);border:1px solid var(--border);`;
      const styleB=hasWinner?(bIsWinner?`display:flex;align-items:center;gap:4px;padding:4px 10px;border-radius:6px;background:${winBgB};border:2px solid ${winBorderB};`:`display:flex;align-items:center;gap:4px;padding:4px 10px;border-radius:6px;background:var(--surface);border:1px solid var(--border);opacity:0.45;filter:grayscale(1);`):`display:flex;align-items:center;gap:4px;padding:4px 10px;border-radius:6px;background:var(--surface);border:1px solid var(--border);`;
      const cA=g.playerA?`onclick="openPlayerModal('${g.playerA}')" style="cursor:pointer;text-decoration:underline dotted"`:'';
      const cB=g.playerB?`onclick="openPlayerModal('${g.playerB}')" style="cursor:pointer;text-decoration:underline dotted"`:'';
      const mapStr=g.map?`<span style="background:var(--surface);border:1px solid var(--border);padding:2px 6px;border-radius:4px;font-size:10px">📍${g.map}</span>`:'';
      h+=`<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;flex-wrap:wrap">
        <span style="color:var(--gray-l);font-size:11px;font-weight:700;min-width:44px">G${gi+1}</span>
        <div style="${styleA}">${pA?getPlayerPhotoHTML(pA.name,'30px','margin-right:4px'):''} ${pA?`<span class="rbadge r${pA.race}" style="font-size:11px;padding:2px 6px">${pA.race}</span>`:''}<strong style="font-size:14px" ${cA}>${g.playerA||'?'}</strong>${pA?genderIcon(pA.gender):''}<span style="font-size:11px;color:${ca};font-weight:700;margin-left:2px">(${labelA})</span>${aIsWinner&&hasWinner?`<span style="background:${ca};color:#fff;font-size:10px;font-weight:800;padding:2px 8px;border-radius:4px;margin-left:4px">WIN</span>`:''}</div>
        <span style="color:var(--gray-l);font-size:12px;font-weight:700">vs</span>
        <div style="${styleB}">${pB?getPlayerPhotoHTML(pB.name,'30px','margin-right:4px'):''} ${pB?`<span class="rbadge r${pB.race}" style="font-size:11px;padding:2px 6px">${pB.race}</span>`:''}<strong style="font-size:14px" ${cB}>${g.playerB||'?'}</strong>${pB?genderIcon(pB.gender):''}<span style="font-size:11px;color:${cb};font-weight:700;margin-left:2px">(${labelB})</span>${bIsWinner&&hasWinner?`<span style="background:${cb};color:#fff;font-size:10px;font-weight:800;padding:2px 8px;border-radius:4px;margin-left:4px">WIN</span>`:''}</div>
        ${mapStr}
      </div>`;
    });
  }
  return h;
}

/* ══════════════════════════════════════
   대전 기록 > 프로리그 대회 탭
══════════════════════════════════════ */
function histProCompHTML() {
  // 프로리그 대회 서브탭 바
  const _pcSubBar=`<div class="stabs no-export" style="margin-bottom:10px">
    <button class="stab ${histSub==='procomp'?'on':''}" onclick="histSub='procomp';openDetails={};render()">📅 조별리그</button>
    <button class="stab ${histSub==='procomptn'?'on':''}" onclick="histSub='procomptn';openDetails={};render()">🗂️ 토너먼트</button>
    <button class="stab ${histSub==='procompteam'?'on':''}" onclick="histSub='procompteam';openDetails={};render()">🤝 팀전</button>
    <button class="stab ${histSub==='procompgj'?'on':''}" onclick="histSub='procompgj';openDetails={};render()">⚔️ 끝장전</button>
  </div>`;
  // proTourneys에서 완료된 경기만 추출 (조별리그)
  const allItems = [];
  const _pcSubBarH=_pcSubBar;
  (proTourneys||[]).forEach(tn => {
    // 조별리그 경기
    (tn.groups||[]).forEach((grp, gi) => {
      const gl = 'ABCDEFGHIJ'[gi]||gi;
      const col = ['#2563eb','#dc2626','#16a34a','#d97706','#7c3aed','#0891b2'][gi%6];
      (grp.matches||[]).forEach(m => {
        if (!m.a||!m.b||!m.winner) return;
        if (typeof passDateFilter==='function'&&!passDateFilter(m.d||'')) return;
        allItems.push({...m, _tnName:tn.name, _stage:'조별리그', _stageDetail:`GROUP ${gl}`, _stageColor:col});
      });
    });
  });
  allItems.sort((a,b)=>recSortDir==='asc'?(a.d||'').localeCompare(b.d||''):(b.d||'').localeCompare(a.d||''));
  const sortBar = `<div class="sort-bar no-export">
    <span style="font-size:11px;color:var(--text3)">날짜 정렬</span>
    <button class="sort-btn ${recSortDir==='desc'?'on':''}" onclick="recSortDir='desc';render()">최신순 ↓</button>
    <button class="sort-btn ${recSortDir==='asc'?'on':''}" onclick="recSortDir='asc';render()">오래된순 ↑</button>
    <span style="font-size:11px;color:var(--gray-l);margin-left:4px">${allItems.length}건</span>
  </div>`;
  if (!allItems.length) return _pcSubBarH+sortBar+`<div class="empty-state"><div class="empty-state-icon">🏅</div><div class="empty-state-title">프로리그 대회 기록이 없습니다</div><div class="empty-state-desc">대회 경기를 입력하면 여기에 표시됩니다</div></div>`;

  let h = _pcSubBarH;
  // 대회명별 그룹화
  const groups = {};
  allItems.forEach(m => {
    if (!groups[m._tnName]) groups[m._tnName] = [];
    groups[m._tnName].push(m);
  });

  const _tb = p => p&&p.tier?`<span style="background:${_TIER_BG[p.tier]||'#64748b'};color:${_TIER_TEXT[p.tier]||'#fff'};font-size:9px;font-weight:700;padding:1px 4px;border-radius:3px">${p.tier}</span>`:'';
  const _rb = p => p&&p.race?`<span class="rbadge r${p.race}" style="font-size:9px;padding:0 3px">${p.race}</span>`:'';
  const _photo = p => p&&p.photo?`<img src="${p.photo}" style="width:22px;height:22px;border-radius:50%;object-fit:cover;vertical-align:middle;margin-right:3px" onerror="this.style.display='none'">`:'';

  h += sortBar;
  Object.entries(groups).forEach(([tnName, items]) => {
    h += `<div style="background:linear-gradient(135deg,var(--blue-l) 0%,var(--white) 100%);border:1.5px solid var(--blue-ll);border-left:4px solid #0891b2;border-radius:12px;padding:12px 16px;margin:14px 0 6px;display:flex;align-items:center;gap:8px;flex-wrap:wrap">
      <span style="font-size:16px">🏅</span>
      <span style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:15px;color:#0891b2">${tnName}</span>
      <span style="font-size:11px;font-weight:700;color:#0891b2;background:#e0f2fe;border-radius:20px;padding:2px 10px;margin-left:auto">${items.length}경기</span>
    </div>`;
    items.forEach(m => {
      const pa = players.find(p=>p.name===m.a);
      const pb = players.find(p=>p.name===m.b);
      const aWin = m.winner==='A';
      const bWin = m.winner==='B';
      // 스테이지 배지 (조별리그 GROUP A / 준결승 / 결승 등)
      const stageBadge = `<span style="background:${m._stageColor};color:#fff;font-size:10px;font-weight:700;padding:2px 8px;border-radius:4px;white-space:nowrap">${m._stageDetail}</span>`;
      const stageTypeBadge = m._stage==='조별리그'
        ? `<span style="background:#e0f2fe;color:#0891b2;font-size:9px;font-weight:700;padding:1px 6px;border-radius:10px">조별리그</span>`
        : `<span style="background:#fef3c7;color:#b45309;font-size:9px;font-weight:700;padding:1px 6px;border-radius:10px">대진표</span>`;
      h += `<div class="rec-summary" style="margin-left:8px;border-left:3px solid ${m._stageColor}">
        <div style="padding:5px 12px 0;display:flex;align-items:center;gap:6px">
          <span style="color:var(--text3);font-size:11px;font-weight:600;flex-shrink:0">${m.d?m.d.slice(2).replace(/-/g,'/'):'미정'}</span>
          ${stageTypeBadge}${stageBadge}
          <div class="rec-actions no-export" style="margin-left:auto">
            <button class="btn btn-p btn-xs" onclick="openProCompMatchShare('${(m.a||'').replace(/'/g,"\\'")}','${(m.b||'').replace(/'/g,"\\'")}',${aWin?1:0},${bWin?1:0},'${m.d||''}')">🎴 공유카드</button>
          </div>
        </div>
        <div class="rec-sum-header" style="padding:5px 12px 10px">
          <div class="rec-sum-vs" style="flex:1">
            <div style="display:flex;align-items:center;gap:4px;${aWin?'':'opacity:.7'}">
              ${_photo(pa)}
              <span style="font-weight:${aWin?'800':'500'};font-size:13px;color:${aWin?'#16a34a':'var(--text)'}">${m.a}</span>
              ${_rb(pa)}${_tb(pa)}
              ${pa&&pa.univ?`<span style="font-size:10px;color:var(--gray-l)">${pa.univ}</span>`:''}
              ${aWin?`<span style="font-size:10px;font-weight:800;color:#16a34a;margin-left:2px">WIN</span>`:''}
            </div>
            <span style="font-size:11px;color:var(--gray-l);font-weight:700;flex-shrink:0">vs</span>
            <div style="display:flex;align-items:center;gap:4px;${bWin?'':'opacity:.7'}">
              ${_photo(pb)}
              <span style="font-weight:${bWin?'800':'500'};font-size:13px;color:${bWin?'#16a34a':'var(--text)'}">${m.b}</span>
              ${_rb(pb)}${_tb(pb)}
              ${pb&&pb.univ?`<span style="font-size:10px;color:var(--gray-l)">${pb.univ}</span>`:''}
              ${bWin?`<span style="font-size:10px;font-weight:800;color:#16a34a;margin-left:2px">WIN</span>`:''}
            </div>
            ${m.map?`<span style="font-size:10px;color:var(--gray-l);flex-shrink:0">📍${m.map}</span>`:''}
          </div>
        </div>
      </div>`;
    });
  });
  return h;
}

/* ══════════════════════════════════════
   대전 기록 > 프로리그 토너먼트 탭 (대진표 + 3위전)
══════════════════════════════════════ */
function histProCompTourneyHTML() {
  const _pcSubBar2=`<div class="stabs no-export" style="margin-bottom:10px">
    <button class="stab" onclick="histSub='procomp';openDetails={};render()">📅 조별리그</button>
    <button class="stab on">🗂️ 토너먼트</button>
    <button class="stab" onclick="histSub='procompteam';openDetails={};render()">🤝 팀전</button>
    <button class="stab" onclick="histSub='procompgj';openDetails={};render()">⚔️ 끝장전</button>
  </div>`;
  const allItems = [];
  (proTourneys||[]).forEach(tn => {
    const rounds = tn.bracket||[];
    const totalRounds = rounds.length;
    rounds.forEach((rnd, ri) => {
      const rndLabel = ri===totalRounds-1?'결승':ri===totalRounds-2?'준결승':ri===totalRounds-3?'4강':`${Math.pow(2,totalRounds-ri)}강`;
      const stageColor = ri===totalRounds-1?'#f59e0b':ri===totalRounds-2?'#7c3aed':ri===totalRounds-3?'#dc2626':'#2563eb';
      rnd.forEach(m => {
        if (!m.a||!m.b||!m.winner) return;
        if (typeof passDateFilter==='function'&&!passDateFilter(m.d||'')) return;
        allItems.push({...m, _tnName:tn.name, _stage:'토너먼트', _stageDetail:rndLabel, _stageColor:stageColor, d:m.d||''});
      });
    });
    if (tn.thirdPlace&&tn.thirdPlace.a&&tn.thirdPlace.b&&tn.thirdPlace.winner) {
      if (!(typeof passDateFilter==='function'&&!passDateFilter(tn.thirdPlace.d||''))) {
        allItems.push({...tn.thirdPlace, _tnName:tn.name, _stage:'토너먼트', _stageDetail:'3위전', _stageColor:'#cd7f32', d:tn.thirdPlace.d||''});
      }
    }
  });
  allItems.sort((a,b)=>recSortDir==='asc'?(a.d||'').localeCompare(b.d||''):(b.d||'').localeCompare(a.d||''));
  const sortBar=`<div class="sort-bar no-export">
    <span style="font-size:11px;color:var(--text3)">날짜 정렬</span>
    <button class="sort-btn ${recSortDir==='desc'?'on':''}" onclick="recSortDir='desc';render()">최신순 ↓</button>
    <button class="sort-btn ${recSortDir==='asc'?'on':''}" onclick="recSortDir='asc';render()">오래된순 ↑</button>
    <span style="font-size:11px;color:var(--gray-l);margin-left:4px">${allItems.length}건</span>
  </div>`;
  if (!allItems.length) return _pcSubBar2+sortBar+`<div class="empty-state"><div class="empty-state-icon">🗂️</div><div class="empty-state-title">토너먼트 기록이 없습니다</div><div class="empty-state-desc">대진표 결과를 입력하면 여기에 표시됩니다</div></div>`;
  const groups={};
  allItems.forEach(m=>{if(!groups[m._tnName])groups[m._tnName]=[];groups[m._tnName].push(m);});
  const _tb=p=>p&&p.tier?`<span style="background:${_TIER_BG[p.tier]||'#64748b'};color:${_TIER_TEXT[p.tier]||'#fff'};font-size:9px;font-weight:700;padding:1px 4px;border-radius:3px">${p.tier}</span>`:'';
  const _rb=p=>p&&p.race?`<span class="rbadge r${p.race}" style="font-size:9px;padding:0 3px">${p.race}</span>`:'';
  const _photo=p=>p&&p.photo?`<img src="${p.photo}" style="width:22px;height:22px;border-radius:50%;object-fit:cover;vertical-align:middle;margin-right:3px" onerror="this.style.display='none'">`:'';
  let h=_pcSubBar2+sortBar;
  Object.entries(groups).forEach(([tnName,items])=>{
    h+=`<div style="background:linear-gradient(135deg,#f5f3ff 0%,var(--white) 100%);border:1.5px solid #ddd6fe;border-left:4px solid #7c3aed;border-radius:12px;padding:12px 16px;margin:14px 0 6px;display:flex;align-items:center;gap:8px;flex-wrap:wrap">
      <span style="font-size:16px">🗂️</span>
      <span style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:15px;color:#7c3aed">${tnName}</span>
      <span style="font-size:11px;font-weight:700;color:#7c3aed;background:#f5f3ff;border-radius:20px;padding:2px 10px;margin-left:auto">${items.length}경기</span>
    </div>`;
    items.forEach(m=>{
      const pa=players.find(p=>p.name===m.a), pb=players.find(p=>p.name===m.b);
      const aWin=m.winner==='A', bWin=m.winner==='B';
      const stageBadge=`<span style="background:${m._stageColor};color:#fff;font-size:10px;font-weight:700;padding:2px 8px;border-radius:4px;white-space:nowrap">${m._stageDetail}</span>`;
      h+=`<div class="rec-summary" style="margin-left:8px;border-left:3px solid ${m._stageColor}">
        <div style="padding:5px 12px 0;display:flex;align-items:center;gap:6px">
          <span style="color:var(--text3);font-size:11px;font-weight:600;flex-shrink:0">${m.d?m.d.slice(2).replace(/-/g,'/'):'미정'}</span>
          <span style="background:#f5f3ff;color:#7c3aed;font-size:9px;font-weight:700;padding:1px 6px;border-radius:10px">토너먼트</span>
          ${stageBadge}
          <div class="rec-actions no-export" style="margin-left:auto">
            <button class="btn btn-p btn-xs" onclick="openProCompMatchShare('${(m.a||'').replace(/'/g,"\\'")}','${(m.b||'').replace(/'/g,"\\'")}',${aWin?1:0},${bWin?1:0},'${m.d||''}')">🎴 공유카드</button>
          </div>
        </div>
        <div class="rec-sum-header" style="padding:5px 12px 10px">
          <div class="rec-sum-vs" style="flex:1">
            <div style="display:flex;align-items:center;gap:4px;${aWin?'':'opacity:.7'}">
              ${_photo(pa)}<span style="font-weight:${aWin?'800':'500'};font-size:13px;color:${aWin?'#16a34a':'var(--text)'}">${m.a}</span>
              ${_rb(pa)}${_tb(pa)}${aWin?`<span style="font-size:10px;font-weight:800;color:#16a34a;margin-left:2px">WIN</span>`:''}
            </div>
            <span style="font-size:11px;color:var(--gray-l);font-weight:700;flex-shrink:0">vs</span>
            <div style="display:flex;align-items:center;gap:4px;${bWin?'':'opacity:.7'}">
              ${_photo(pb)}<span style="font-weight:${bWin?'800':'500'};font-size:13px;color:${bWin?'#16a34a':'var(--text)'}">${m.b}</span>
              ${_rb(pb)}${_tb(pb)}${bWin?`<span style="font-size:10px;font-weight:800;color:#16a34a;margin-left:2px">WIN</span>`:''}
            </div>
            ${m.map?`<span style="font-size:10px;color:var(--gray-l);flex-shrink:0">📍${m.map}</span>`:''}
          </div>
        </div>
      </div>`;
    });
  });
  return h;
}

/* ══════════════════════════════════════
   대전 기록 > 프로리그 팀전 탭
══════════════════════════════════════ */
function histProCompTeamHTML() {
  // proTourneys.teamMatches 전체 추출
  const tmList = []; // [{tnName, tm}]
  (proTourneys||[]).forEach(tn => {
    (tn.teamMatches||[]).forEach(tm => {
      const games = (tm.games||[]).filter(g=>g.wName&&g.lName);
      if (!games.length) return;
      if (typeof passDateFilter==='function'&&!passDateFilter(tm.d||'')) return;
      tmList.push({tnName:tn.name, tm});
    });
  });
  tmList.sort((a,b)=>recSortDir==='asc'?(a.tm.d||'').localeCompare(b.tm.d||''):(b.tm.d||'').localeCompare(a.tm.d||''));
  const totalGames = tmList.reduce((s,x)=>s+(x.tm.games||[]).filter(g=>g.wName&&g.lName).length,0);
  const sortBar=`<div class="sort-bar no-export">
    <span style="font-size:11px;color:var(--text3)">날짜 정렬</span>
    <button class="sort-btn ${recSortDir==='desc'?'on':''}" onclick="recSortDir='desc';render()">최신순 ↓</button>
    <button class="sort-btn ${recSortDir==='asc'?'on':''}" onclick="recSortDir='asc';render()">오래된순 ↑</button>
    <span style="font-size:11px;color:var(--gray-l);margin-left:4px">${totalGames}경기 / ${tmList.length}팀전</span>
  </div>`;
  if (!tmList.length) return sortBar+`<div class="empty-state"><div class="empty-state-icon">🤝</div><div class="empty-state-title">팀전 기록이 없습니다</div><div class="empty-state-desc">프로리그 대회 팀전 결과를 입력하면 여기에 표시됩니다</div></div>`;
  const _tb=p=>p&&p.tier?`<span style="background:${_TIER_BG[p.tier]||'#64748b'};color:${_TIER_TEXT[p.tier]||'#fff'};font-size:9px;font-weight:700;padding:1px 4px;border-radius:3px">${p.tier}</span>`:'';
  const _rb=p=>p&&p.race?`<span class="rbadge r${p.race}" style="font-size:9px;padding:0 3px">${p.race}</span>`:'';
  const _photo=p=>p&&p.photo?`<img src="${p.photo}" style="width:22px;height:22px;border-radius:50%;object-fit:cover;vertical-align:middle;margin-right:3px" onerror="this.style.display='none'">`:'';
  const colA='#2563eb', colB='#dc2626';
  let h=sortBar;
  // 대회명별 그룹
  const byTn={};
  tmList.forEach(({tnName,tm})=>{ if(!byTn[tnName])byTn[tnName]=[]; byTn[tnName].push(tm); });
  Object.entries(byTn).forEach(([tnName,tms])=>{
    const gCnt=tms.reduce((s,tm)=>s+(tm.games||[]).filter(g=>g.wName&&g.lName).length,0);
    h+=`<div style="background:linear-gradient(135deg,#ecfdf5 0%,var(--white) 100%);border:1.5px solid #bbf7d0;border-left:4px solid #16a34a;border-radius:12px;padding:12px 16px;margin:14px 0 6px;display:flex;align-items:center;gap:8px;flex-wrap:wrap">
      <span style="font-size:16px">🤝</span>
      <span style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:15px;color:#16a34a">${tnName}</span>
      <span style="font-size:11px;font-weight:700;color:#16a34a;background:#dcfce7;border-radius:20px;padding:2px 10px;margin-left:auto">${tms.length}팀전 · ${gCnt}경기</span>
    </div>`;
    tms.forEach(tm=>{
      const aWin=tm.sa>tm.sb, bWin=tm.sb>tm.sa;
      const games=(tm.games||[]).filter(g=>g.wName&&g.lName);
      h+=`<div style="border:1.5px solid var(--border);border-radius:10px;padding:10px 14px;margin-bottom:10px">
        <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:8px;padding-bottom:8px;border-bottom:1px solid var(--border)">
          <span style="font-size:12px;font-weight:600;color:var(--text3)">${tm.d||'날짜 미정'}</span>
          <span style="background:#e0f2fe;color:#0284c7;font-size:9px;font-weight:700;padding:1px 6px;border-radius:10px">팀전</span>
          <span style="font-weight:${aWin?900:600};color:${aWin?colA:'var(--text)'};font-size:13px">${tm.teamAName||'A팀'}</span>
          <span style="font-size:16px;font-weight:900;background:${aWin?colA:bWin?colB:'var(--border)'};color:#fff;padding:1px 10px;border-radius:6px">${tm.sa||0}:${tm.sb||0}</span>
          <span style="font-weight:${bWin?900:600};color:${bWin?colB:'var(--text)'};font-size:13px">${tm.teamBName||'B팀'}</span>
          <button class="btn btn-p btn-xs no-export" style="margin-left:auto" onclick="openProCompMatchShare('${(tm.teamAName||'A팀').replace(/'/g,"\\'")}','${(tm.teamBName||'B팀').replace(/'/g,"\\'")}',${tm.sa||0},${tm.sb||0},'${tm.d||''}')">🎴 공유카드</button>
        </div>
        ${games.map(g=>{
          const pw=players.find(p=>p.name===g.wName), pl=players.find(p=>p.name===g.lName);
          const sideWin=g._sideW==='A'?tm.teamAName||'A팀':tm.teamBName||'B팀';
          return `<div class="rec-summary" style="margin-left:4px;border-left:3px solid ${g._sideW==='A'?colA:colB}">
            <div class="rec-sum-header">
              <span style="background:${g._sideW==='A'?colA:colB};color:#fff;font-size:9px;font-weight:700;padding:1px 5px;border-radius:4px">${sideWin}</span>
              <div class="rec-sum-vs" style="flex:1">
                <div style="display:flex;align-items:center;gap:4px">
                  ${_photo(pw)}<span style="font-weight:800;font-size:13px;color:#16a34a">${g.wName}</span>
                  ${_rb(pw)}${_tb(pw)}
                  ${pw&&pw.univ?`<span style="font-size:10px;color:var(--gray-l)">${pw.univ}</span>`:''}
                  <span style="font-size:10px;font-weight:800;color:#16a34a;margin-left:2px">WIN</span>
                </div>
                <span style="font-size:11px;color:var(--gray-l);font-weight:700;flex-shrink:0">vs</span>
                <div style="display:flex;align-items:center;gap:4px;opacity:.7">
                  ${_photo(pl)}<span style="font-weight:500;font-size:13px;color:var(--text)">${g.lName}</span>
                  ${_rb(pl)}${_tb(pl)}
                  ${pl&&pl.univ?`<span style="font-size:10px;color:var(--gray-l)">${pl.univ}</span>`:''}
                </div>
                ${g.map?`<span style="font-size:10px;color:var(--gray-l);flex-shrink:0">📍${g.map}</span>`:''}
              </div>
            </div>
          </div>`;
        }).join('')}
      </div>`;
    });
  });
  return h;
}

/* ══════════════════════════════════════
   ⚔️ 프로리그 대회 끝장전 기록
══════════════════════════════════════ */
function histProCompGJHTML(){
  const _pcGjBar=`<div class="stabs no-export" style="margin-bottom:10px">
    <button class="stab" onclick="histSub='procomp';openDetails={};render()">📅 조별리그</button>
    <button class="stab" onclick="histSub='procomptn';openDetails={};render()">🗂️ 토너먼트</button>
    <button class="stab" onclick="histSub='procompteam';openDetails={};render()">🤝 팀전</button>
    <button class="stab on">⚔️ 끝장전</button>
  </div>`;
  const allSess=[];
  (proTourneys||[]).forEach(tn=>{
    (tn.gjMatches||[]).forEach(sess=>{
      allSess.push({...sess,tnName:tn.name});
    });
  });
  if(!allSess.length)return _pcGjBar+`<div class="empty-state"><div class="empty-state-icon">⚔️</div><div class="empty-state-title">프로리그 대회 끝장전 기록이 없습니다</div><div class="empty-state-desc">프로리그 대회 탭 → 끝장전에서 입력하세요</div></div>`;
  allSess.sort((a,b)=>(b.d||'').localeCompare(a.d||''));
  let h=_pcGjBar;
  allSess.forEach(sess=>{
    const p1w=(sess.games||[]).filter(g=>g.winner===sess.a).length;
    const p2w=(sess.games||[]).filter(g=>g.winner===sess.b).length;
    const winner=p1w>p2w?sess.a:p2w>p1w?sess.b:'';
    h+=`<div style="border:1px solid var(--border);border-radius:8px;margin-bottom:8px;overflow:hidden">
      <div style="background:var(--bg2);padding:10px 14px;display:flex;align-items:center;gap:10px;flex-wrap:wrap">
        <span style="font-size:12px;font-weight:600;color:var(--text3)">${sess.d||'날짜 미정'}</span>
        <span style="font-size:11px;background:#0891b2;color:#fff;padding:1px 8px;border-radius:4px;font-weight:700">🎖️ ${sess.tnName||''}</span>
        <span style="font-weight:700;color:var(--blue);cursor:pointer" onclick="openPlayerModal('${(sess.a||'').replace(/'/g,"\'")}'">${sess.a||'?'}</span>
        <span style="font-weight:900;color:var(--blue)">${p1w} - ${p2w}</span>
        <span style="font-weight:700;cursor:pointer" onclick="openPlayerModal('${(sess.b||'').replace(/'/g,"\'")}'">${sess.b||'?'}</span>
        ${winner?`<span style="font-size:11px;color:#16a34a;font-weight:700">(${winner} 승)</span>`:''}
        <span style="font-size:11px;color:var(--gray-l)">${(sess.games||[]).length}게임</span>
      </div>
      <table style="margin:0;border-radius:0"><thead><tr><th>게임</th><th>${sess.a||'A'}</th><th style="color:var(--gray-l)">vs</th><th>${sess.b||'B'}</th><th>맵</th></tr></thead><tbody>
      ${(sess.games||[]).map((g,gi)=>{
        const aWin=g.winner===sess.a;
        return`<tr><td style="font-size:11px;color:var(--gray-l)">${gi+1}게임</td><td style="font-weight:${aWin?'900':'400'};color:${aWin?'var(--blue)':'#aaa'}">${aWin?'▶ '+sess.a:sess.a}</td><td style="color:var(--gray-l);text-align:center">vs</td><td style="font-weight:${!aWin?'900':'400'};color:${!aWin?'var(--blue)':'#aaa'}">${!aWin?'▶ '+sess.b:sess.b}</td><td style="font-size:11px;color:var(--gray-l)">${g.map||''}</td></tr>`;
      }).join('')}
      </tbody></table>
    </div>`;
  });
  return h;
}
