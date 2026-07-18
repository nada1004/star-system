function rTierTourTab(C, T){
  _migrateTierTourneys();
  T.innerText = '🎯 티어대회';
  const _li = (typeof isLoggedIn!=='undefined' ? !!isLoggedIn : false) || !!window.isLoggedIn;
  const _tourneys = (typeof tourneys!=='undefined' && Array.isArray(tourneys)) ? tourneys : [];
  const _ttm = (typeof ttM!=='undefined' && Array.isArray(ttM)) ? ttM : [];
  if(!_li && _ttSub==='input') _ttSub='records';
  const tierTourneys = _tourneys.filter(t=>t && t.type==='tier');
  // (보강) ttM 기록의 compName/n/t 값이 누락되거나 공백이 섞여도 현재 대회로 필터링되게
  const _eqComp = (m, compName)=>{
    const c = String(compName||'').trim();
    if(!c) return true;
    const a = String(m?.compName||'').trim();
    const b = String(m?.n||'').trim();
    const d = String(m?.t||'').trim();
    return a===c || b===c || d===c;
  };
  // (보강) tourneys에 없는 "기록만 있는 티어대회(compName)"도 선택 가능하게
  const _ttmCompNames = (() => {
    try{
      const set=new Set();
      _ttm.forEach(m=>{
        const n = String(m?.compName||m?.n||m?.t||'').trim();
        if(n) set.add(n);
      });
      return [...set];
    }catch(e){ return []; }
  })();
  const _allCompNames = (() => {
    const set=new Set((tierTourneys||[]).map(t=>String(t?.name||'').trim()).filter(Boolean));
    _ttmCompNames.forEach(n=>set.add(n));
    return [...set];
  })();

  if(_ttCurComp && !_allCompNames.includes(String(_ttCurComp).trim())) _ttCurComp='';
  if(!_ttCurComp && _allCompNames.length) _ttCurComp=_allCompNames[0];
  let h='';
  h+=`<div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;flex-wrap:wrap;padding:12px 16px;background:#f5f3ff;border:1px solid #ddd6fe;border-radius:var(--r)">
    <span style="font-weight:700;color:#7c3aed;white-space:nowrap">🎯 티어대회 선택:</span>
    <select style="flex:1;max-width:220px;font-weight:700" onchange="_ttCurComp=this.value;render()">
      <option value="">— 대회를 선택하세요 —</option>
      ${_allCompNames.map(name=>{
        const t = (tierTourneys||[]).find(x=>String(x?.name||'').trim()===String(name||'').trim());
        const _tDates=[];
        if(t){
          (t.groups||[]).forEach(g=>(g.matches||[]).forEach(m=>{if(m.d&&m.sa!=null)_tDates.push(m.d);})); 
          // 브라켓/수동 경기 날짜도 포함
          try{
            const br=t.bracket||{};
            Object.values(br.matchDetails||{}).forEach(m=>{if(m&&m.d&&m.sa!=null)_tDates.push(m.d);});
            (br.manualMatches||[]).forEach(m=>{if(m&&m.d&&m.sa!=null)_tDates.push(m.d);});
          }catch(e){}
        }
        _ttm.filter(m=>_eqComp(m,name)&&m.d).forEach(m=>_tDates.push(m.d));
        _tDates.sort();
        const _ds=_tDates.length?` (${_tDates[0].slice(2).replace(/-/g,'/')}${_tDates.length>1&&_tDates[0]!==_tDates[_tDates.length-1]?'~'+_tDates[_tDates.length-1].slice(2).replace(/-/g,'/'):''})`
          :(t && t.createdAt?` (${String(t.createdAt).slice(0,10)})`:'');
        const hint = t ? '' : ' (기록만)';
        return `<option value="${name}"${String(_ttCurComp).trim()===String(name).trim()?' selected':''}>${name}${hint}${_ds}</option>`;
      }).join('')}
    </select>
    ${_li?`<button class="btn btn-p btn-xs" onclick="grpNewTierTourney()">+ 추가</button>`:''}
    ${_ttCurComp&&_li?`<button class="btn btn-w btn-xs" onclick="grpRenameTierTourney()" title="대회명 수정">✏️ 이름수정</button>
    <button class="btn btn-r btn-xs" onclick="grpDelTierTourney()" title="현재 티어대회 삭제">🗑️ 삭제</button>`:''}
  </div>`;
  if(!_allCompNames.length){
    h+=`<div style="padding:60px 20px;text-align:center;color:var(--gray-l)">생성된 티어대회가 없습니다.</div>`;
    C.innerHTML=h; return;
  }
  const _curTierTn=_tourneys.find(t=>t && t.name===_ttCurComp && t.type==='tier') || null;
  // 유효하지 않은 _ttSub 리셋
  const _validSubs=['input','records','rank','league','grprecords','grprank','tourschedule','bktrecords','grpedit'];
  if(!_validSubs.includes(_ttSub)) _ttSub='records';
  if(_ttSub==='input'&&!_li) _ttSub='records';
  if(_ttSub==='grpedit'&&!_li) _ttSub='records';
  // (롤백) 티어대회 서브메뉴: 단일 라인 탭(기록/입력/대진표/관리로 묶지 않음)
  const subOpts=[
    ...(_li?[{id:'input',lbl:'📝 일반',fn:`_ttSub='input';render()`}]:[]),
    {id:'records',lbl:'📋 일반 기록',fn:`_ttSub='records';openDetails={};render()`},
    {id:'rank',lbl:'🏆 개인 순위',fn:`_ttSub='rank';render()`,hasContext:true},
    {id:'league',lbl:'📅 조별리그',fn:`_ttSub='league';render()`},
    {id:'grprecords',lbl:'📋 조별리그 기록',fn:`_ttSub='grprecords';openDetails={};render()`},
    {id:'grprank',lbl:'📊 조별 순위',fn:`_ttSub='grprank';render()`},
    {id:'tourschedule',lbl:'🗂️ 토너먼트',fn:`_ttSub='tourschedule';render()`,hasContext:true},
    {id:'bktrecords',lbl:'🏆 토너먼트 기록',fn:`_ttSub='bktrecords';openDetails={};render()`},
    ...(_li?[{id:'grpedit',lbl:'🏗️ 조편성',fn:`_ttSub='grpedit';grpSub='edit';render()`}]:[]),
  ];
  const _subOpts = (typeof applyTabLabels==='function') ? applyTabLabels('tiertour', subOpts) : subOpts;
  h+=`<div class="fbar utilbar utilbar--scroll merged-subbar no-export" style="overflow-x:auto;flex-wrap:nowrap;-webkit-overflow-scrolling:touch;scrollbar-width:none">
    ${_subOpts.map(o=>`<button class="pill ${_ttSub===o.id?'on':''}" style="flex-shrink:0;white-space:nowrap" onclick="${o.fn}"${o.hasContext?` oncontextmenu="${o.id==='rank'?'showRankContext(event)':'showTournamentContext(event)'};return false"`:''}>${o.lbl}</button>`).join('')}
  </div>`;

  // 조편성 화면 진입 보정(일부 상태값 남는 케이스 방지)
  if(_ttSub==='grpedit'){
    try{ if(typeof grpSub==='undefined') window.grpSub='edit'; }catch(e){}
    try{ if(grpSub!=='edit') grpSub='edit'; }catch(e){ window.grpSub='edit'; }
  }
  const _noTnMsg='<div style="padding:40px;text-align:center;color:var(--gray-l)">대회를 선택하세요.</div>';
  if(_ttSub==='input' && _li){
    if(!BLD['tt'])BLD['tt']={date:'',tiers:[],membersA:[],membersB:[],sets:[]};
    h+=buildTierTourInputHTML();
  } else if(_ttSub==='rank'){
    h+=ttPlayerRankHTML(_ttCurComp);
  } else if(_ttSub==='league'){
    h+=_curTierTn ? rCompLeague(_curTierTn) : _noTnMsg;
  } else if(_ttSub==='grprank'){
    h+=_curTierTn ? rCompGrpRankFull(_curTierTn) : _noTnMsg;
  } else if(_ttSub==='tourschedule'){
    // (원복) 티어대회 토너먼트 대진표를 프로리그 대회 대진표 방식(proCompBracket)으로 통일
    if(_curTierTn){
      try{ _migrateTierBracketToRoundsIfNeeded(_curTierTn); }catch(e){}
      h+= (typeof proCompBracket==='function') ? proCompBracket(_curTierTn) : _noTnMsg;
    } else h+=_noTnMsg;
  } else if(_ttSub==='bktrecords'){
    // [BUGFIX-HIGH-2] _ttCurComp 미선택 시 안내 메시지 표시
    if(!_ttCurComp){
      h+=`<div style="padding:40px;text-align:center;color:var(--gray-l);font-size:14px">📋 대회를 먼저 선택하세요.</div>`;
    } else {
    const _bktRecs=_ttm.filter(m=>_eqComp(m,_ttCurComp)&&m.stage==='bkt');
    // 브라켓 matchDetails에서 아직 ttM에 없는 경기도 포함
    const _bktIds=new Set(_bktRecs.map(m=>m._id));
    const _bktFromBracket=[];
    if(_curTierTn){
      const _br=_curTierTn.bracket||{};
      Object.values(_br.matchDetails||{}).forEach(m=>{
        if(m._id&&!_bktIds.has(m._id)&&m.sa!=null){
          _bktFromBracket.push({_id:m._id,d:m.d,a:m.a,b:m.b,sa:m.sa,sb:m.sb,sets:m.sets,compName:_ttCurComp,stage:'bkt'});
        }
      });
      (_br.manualMatches||[]).forEach(m=>{
        if(m._id&&!_bktIds.has(m._id)&&m.sa!=null){
          _bktFromBracket.push({_id:m._id,d:m.d,a:m.a,b:m.b,sa:m.sa,sb:m.sb,sets:m.sets,compName:_ttCurComp,stage:'bkt',rndLabel:m.rndLabel||'토너먼트 경기'});
        }
      });
    }
    // (버그픽스) 브라켓에만 있고 ttM에 없는 기록은 ttM으로 동기화
    // - 그래야 recSummaryListHTML의 "일괄 선택/삭제"가 인덱스/ID 불일치로 깨지지 않음
    if(_bktFromBracket.length){
      try{
        _bktFromBracket.forEach(m=>{
          if(!m || !m._id) return;
          if(_ttm.some(x=>x && x._id===m._id)) return;
          _ttm.unshift({...m, n:_ttCurComp, compName:_ttCurComp, stage:'bkt'});
        });
        save();
      }catch(e){}
    }
    const _allBkt=_ttm.filter(m=>_eqComp(m,_ttCurComp)&&m.stage==='bkt').sort((a,b)=>(b.d||'').localeCompare(a.d||''));
    if(_ttCurComp) h+=`<div style="background:#f5f3ff;border:1px solid #ddd6fe;border-radius:8px;padding:8px 14px;margin-bottom:10px;font-size:var(--fs-sm);color:#7c3aed;font-weight:700">🏆 ${_ttCurComp} 토너먼트 기록</div>`;
    if(_li && _curTierTn){
      h+=`<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin:-2px 0 12px">
        <button class="btn btn-p btn-sm" onclick="openTierBktPasteModal('${_curTierTn.id}')">📋 경기 결과 붙여넣기(자동인식)</button>
        <span style="font-size:var(--fs-caption);color:var(--gray-l)">결과는 “토너먼트 기록”으로 저장됩니다. (대진표 자동 반영은 하지 않음)</span>
      </div>`;
    }
    h+=_allBkt.length?recSummaryListHTML(_allBkt,'tt','tiertour'):'<div style="padding:40px;text-align:center;color:var(--gray-l)">토너먼트 기록이 없습니다.<br><span style="font-size:var(--fs-caption)">🗂️ 토너먼트 탭에서 경기 결과를 입력하세요.</span></div>';
    } // end guard: _ttCurComp 선택된 경우
  } else if(_ttSub==='grpedit'){
    if(!_curTierTn){ h+=_noTnMsg; C.innerHTML=h; return; }
    // grpSub='list'은 rGrpEditInner의 '← 목록' 버튼에서 발생 → 기록 탭으로 전환
    if(grpSub!=='edit'){ _ttSub='records'; C.innerHTML=h; render(); return; }
    grpEditId=_curTierTn.id;
    h+=rGrpEditInner();
  } else if(_ttSub==='grprecords'){
    const _grpRecs=_ttm.filter(m=>_eqComp(m,_ttCurComp)&&m.stage==='league');
    // tourneys 조별리그에서 아직 ttM에 없는 기존 경기도 포함 (fallback)
    const _grpIds=new Set(_grpRecs.map(m=>m._id));
    const _grpFromTn=[];
    if(_curTierTn){
      (_curTierTn.groups||[]).forEach(grp=>{
        (grp.matches||[]).forEach(m=>{
          if(!m._id||_grpIds.has(m._id)||m.sa==null) return;
          _grpFromTn.push({_id:m._id,d:m.d||'',a:m.a||'',b:m.b||'',sa:m.sa,sb:m.sb,sets:m.sets||[],compName:_ttCurComp,stage:'league'});
        });
      });
    }
    // (버그픽스) 조별리그도 tourneys에만 있고 ttM에 없는 기록은 ttM으로 동기화
    if(_grpFromTn.length){
      try{
        _grpFromTn.forEach(m=>{
          if(!m || !m._id) return;
          if(_ttm.some(x=>x && x._id===m._id)) return;
          _ttm.unshift({...m, n:_ttCurComp, compName:_ttCurComp, stage:'league'});
        });
        save();
      }catch(e){}
    }
    const _allGrp=_ttm.filter(m=>_eqComp(m,_ttCurComp)&&m.stage==='league').sort((a,b)=>(b.d||'').localeCompare(a.d||''));
    if(_ttCurComp) h+=`<div style="background:#f0fdf4;border:1px solid #86efac;border-radius:8px;padding:8px 14px;margin-bottom:10px;font-size:var(--fs-sm);color:#16a34a;font-weight:700">📅 ${_ttCurComp} 조별리그 기록</div>`;
    h+=_allGrp.length?recSummaryListHTML(_allGrp,'tt','tiertour'):'<div style="padding:40px;text-align:center;color:var(--gray-l)">조별리그 기록이 없습니다.<br><span style="font-size:var(--fs-caption)">📅 조별리그 탭에서 경기 결과를 입력하세요.</span></div>';
  } else {
    // records 탭 (일반 기록)
    const _ttGeneralBase = _ttm.filter(m=>!m?.stage || m.stage==='general' || m.stage==='normal');
    let _ttFiltered=_ttCurComp
      ? _ttGeneralBase.filter(m=>_eqComp(m,_ttCurComp))
      : _ttGeneralBase.slice();
    if(_ttCurComp && !_ttFiltered.length){
      const _orphans = _ttGeneralBase.filter(m=>!String(m?.compName||m?.n||m?.t||'').trim());
      if(_orphans.length){
        try{
          _orphans.forEach(m=>{
            if(!m) return;
            m.compName = _ttCurComp;
            if(!String(m.n||'').trim()) m.n = _ttCurComp;
            if(!String(m.t||'').trim()) m.t = _ttCurComp;
          });
          save();
        }catch(e){}
        _ttFiltered = _ttGeneralBase.filter(m=>_eqComp(m,_ttCurComp));
      }
    }
    if(_ttCurComp) h+=`<div style="background:#f5f3ff;border:1px solid #ddd6fe;border-radius:8px;padding:8px 14px;margin-bottom:10px;font-size:var(--fs-sm);color:#7c3aed;font-weight:700">🎯 ${_ttCurComp} 일반 기록</div>`;
    h+=_ttFiltered.length?recSummaryListHTML(_ttFiltered,'tt','tiertour'):'<div style="padding:40px;text-align:center;color:var(--gray-l)">일반 기록이 없습니다.</div>';
  }
  C.innerHTML=h;
}

// 스트리머 상세 최근 기록에서 티어대회 클릭 → 해당 경기로 이동
function navToTierMatch(matchId){
  let m=(ttM||[]).find(x=>x._id===matchId);
  // [BUGFIX] ttM에 없으면 tourneys 조별리그 + 브라켓에서도 탐색
  if(!m&&matchId){
    for(const tn of (tourneys||[]).filter(t=>t.type==='tier')){
      // 조별리그 탐색
      for(const grp of (tn.groups||[])){
        const found=(grp.matches||[]).find(x=>x._id===matchId);
        if(found&&found.sa!=null){
          const _rec={_id:matchId,d:found.d,a:found.a,b:found.b,sa:found.sa,sb:found.sb,sets:found.sets,n:tn.name,compName:tn.name,teamALabel:found.a,teamBLabel:found.b,stage:'league'};
          if(!ttM)ttM=[];ttM.unshift(_rec);save();m=_rec;break;
        }
      }
      if(m)break;
      // 브라켓(matchDetails) 탐색
      const br=(tn.bracket||{});
      const bktFound=Object.values(br.matchDetails||{}).find(x=>x&&x._id===matchId);
      if(bktFound&&bktFound.sa!=null){
        const _rec={_id:matchId,d:bktFound.d,a:bktFound.a,b:bktFound.b,sa:bktFound.sa,sb:bktFound.sb,sets:bktFound.sets,n:tn.name,compName:tn.name,teamALabel:bktFound.a,teamBLabel:bktFound.b,stage:'bkt'};
        if(!ttM)ttM=[];ttM.unshift(_rec);save();m=_rec;break;
      }
      // manualMatches 탐색
      const manFound=(br.manualMatches||[]).find(x=>x&&x._id===matchId);
      if(manFound&&manFound.sa!=null){
        const _rec={_id:matchId,d:manFound.d,a:manFound.a,b:manFound.b,sa:manFound.sa,sb:manFound.sb,sets:manFound.sets,n:tn.name,compName:tn.name,teamALabel:manFound.a,teamBLabel:manFound.b,stage:'bkt'};
        if(!ttM)ttM=[];ttM.unshift(_rec);save();m=_rec;break;
      }
    }
  }
  if(m&&m.compName) _ttCurComp=m.compName;
  // [BUGFIX] stage에 따라 알맞은 서브탭으로 이동
  const _navStage=m?.stage||'general';
  _ttSub=_navStage==='bkt'?'bktrecords':_navStage==='league'?'grprecords':'records';
  _mergedCompSub='tiertour';
  openDetails={};
  if(!window.histPage) window.histPage={};
  window.histPage['tt']=0;
  cm('playerModal');
  curTab='tiertour';
  document.querySelectorAll('.tab').forEach(b=>{
    const oc=b.getAttribute('onclick')||'';
    b.classList.toggle('on',oc.includes("'tiertour'"));
  });
  render();
  if(matchId&&m){
    // [BUGFIX] 이동한 서브탭 prefix에 맞게 key 생성
    const _navPrefix=_ttSub==='bktrecords'?'tiertour-bkt':_ttSub==='grprecords'?'tiertour-league':'tiertour-tt';
    const idx=(ttM||[]).indexOf(m);
    const key=_navPrefix+'-'+idx;
    setTimeout(()=>{
      const el=document.getElementById('det-'+key);
      if(el){
        if(!openDetails[key]) toggleDetail(key);
        setTimeout(()=>el.scrollIntoView({behavior:'smooth',block:'center'}),80);
      }
    },400);
  }
}

function ttPlayerRankHTML(compName){
  // [BUGFIX] compName 비교를 _eqComp으로 통일 — n/t 필드만 있는 기록도 집계되도록
  const _ttEqComp=(m,c)=>{
    if(!c) return true;
    const a=String(m?.compName||'').trim();
    const b=String(m?.n||'').trim();
    const d=String(m?.t||'').trim();
    return a===c||b===c||d===c;
  };
  const filtered=compName ? ttM.filter(m=>_ttEqComp(m,compName)) : ttM;
  const sc={};
  const _ttSplit=(v)=>String(v||'').split(/[,+，]/).map(x=>x.trim()).filter(Boolean);
  const _ttSides=(g)=>{
    if(g.wName&&g.lName) return {w:[g.wName], l:[g.lName]};
    if(!g.winner) return null;
    const aList=Array.isArray(g.teamA)?g.teamA:(g.a1||g.a2?[g.a1,g.a2].filter(Boolean):_ttSplit(g.playerA));
    const bList=Array.isArray(g.teamB)?g.teamB:(g.b1||g.b2?[g.b1,g.b2].filter(Boolean):_ttSplit(g.playerB));
    if(!aList.length||!bList.length) return null;
    return g.winner==='A' ? {w:aList,l:bList} : {w:bList,l:aList};
  };
  const _ttEnsure=(name)=>{
    if(!name) return;
    if(!sc[name])sc[name]={w:0,l:0,univ:''};
    if(!sc[name].univ){const p=players.find(x=>x.name===name);if(p)sc[name].univ=p.univ||'';}
  };
  const _ttAddScore=(wn,ln)=>{
    if(!wn||!ln)return;
    _ttEnsure(wn); _ttEnsure(ln);
    sc[wn].w++;sc[ln].l++;
  };
  filtered.forEach(m=>{
    const _games=(m.sets||[]).flatMap(st=>st.games||[]);
    if(_games.length){
      // sets.games 기록이 있는 경우: 게임 단위 집계
      _games.forEach(g=>{
        const sides=_ttSides(g);
        if(!sides) return;
        sides.w.forEach(wn=>{ _ttEnsure(wn); sc[wn].w++; });
        sides.l.forEach(ln=>{ _ttEnsure(ln); sc[ln].l++; });
      });
    } else if(m.a&&m.b&&m.winner){
      // [FIX] sets.games 없는 경우: m.winner(1:1 개인전) fallback 집계
      const wn=m.winner==='A'?m.a:m.b;
      const ln=m.winner==='A'?m.b:m.a;
      _ttAddScore(wn,ln);
    }
  });
  if(!window._rankSort)window._rankSort={};
  const sk=window._rankSort['tt']||'w';
  // [UX] 정렬 상태 라벨
  const skLabel=sk==='w'?'🏆 승순':sk==='l'?'📉 패순':'📊 승률순';
  const entries=Object.entries(sc).filter(([,s])=>s.w+s.l>0).map(([name,s])=>({name,w:s.w,l:s.l,total:s.w+s.l,rate:s.w+s.l?Math.round(s.w/(s.w+s.l)*100):0,univ:sc[name].univ}));
  entries.sort((a,b)=>sk==='w'?b.w-a.w||b.rate-a.rate:sk==='l'?b.l-a.l||a.rate-b.rate:b.rate-a.rate||b.w-a.w);
  if(!entries.length) return `<div style="padding:40px;text-align:center;color:var(--gray-l)">기록이 없습니다.<br><span style="font-size:var(--fs-caption)">경기 입력 시 선수 매칭 정보가 있어야 집계됩니다.</span></div>`;
  // [BUGFIX] 공동 순위 계산: 정렬 기준 값이 같으면 같은 순위 부여
  const _rankNums=[];
  entries.forEach((p,i)=>{
    if(i===0){_rankNums.push(1);return;}
    const prev=entries[i-1];
    const same=sk==='w'?(p.w===prev.w&&p.rate===prev.rate)
      :sk==='l'?(p.l===prev.l&&p.rate===prev.rate)
      :(p.rate===prev.rate&&p.w===prev.w);
    _rankNums.push(same?_rankNums[i-1]:i+1);
  });
  if(!window._rankPage)window._rankPage={};
  const _PK='tt_rank';
  const _PAGE=20;
  if(window._rankPage[_PK]===undefined)window._rankPage[_PK]=0;
  const _tot=entries.length;
  const _totP=Math.ceil(_tot/_PAGE)||1;
  if(window._rankPage[_PK]>=_totP)window._rankPage[_PK]=0;
  const _cp=window._rankPage[_PK];
  const _paged=_tot>_PAGE?entries.slice(_cp*_PAGE,(_cp+1)*_PAGE):entries;
  // [UX] 헤더에 현재 정렬 상태 배지 + 우클릭 안내
  let h=`<div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:6px;margin-bottom:10px;padding-bottom:5px;border-bottom:2px solid #ddd6fe">
    <span style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:14px;color:#7c3aed">🏆 티어대회 개인 순위${compName?` — ${compName}`:''}</span>
    <span style="display:flex;align-items:center;gap:5px">
      <span style="font-size:var(--fs-caption);color:var(--gray-l)">정렬:</span>
      <span style="font-size:var(--fs-caption);font-weight:700;background:#f5f3ff;color:#7c3aed;border:1px solid #ddd6fe;border-radius:6px;padding:2px 8px">${skLabel}</span>
      <span style="font-size:10px;color:var(--gray-l)">(우클릭으로 변경)</span>
    </span>
  </div>
  <table><thead><tr><th>순위</th><th style="text-align:left">스트리머</th><th>게임 승</th><th>게임 패</th><th>승률</th></tr></thead><tbody>`;
  _paged.forEach((p,i)=>{
    const col=gc(p.univ);
    const _ri=_cp*_PAGE+i;
    // [BUGFIX] 공동 순위 반영
    const _rnum=_rankNums[_ri]??(_ri+1);
    let rnk=_rnum===1?`<span class="rk1">1등</span>`:_rnum===2?`<span class="rk2">2등</span>`:_rnum===3?`<span class="rk3">3등</span>`:`<span style="font-weight:900">${_rnum}위</span>`;
    h+=`<tr><td>${rnk}</td><td style="text-align:left"><span style="display:inline-flex;align-items:center;gap:6px;cursor:pointer" onclick="openPlayerModal('${p.name.replace(/'/g,"\\'")}')">${getPlayerPhotoHTML(p.name,'32px')}<span style="font-weight:700;font-size:14px">${p.name}</span>${p.univ?`<span class="ubadge" style="background:${col};font-size:9px">${p.univ}</span>`:''}</span></td><td class="wt">${p.w}</td><td class="lt">${p.l}</td><td style="font-weight:700;color:${p.rate>=50?'#16a34a':'#dc2626'}">${p.rate}%</td></tr>`;
  });
  const _pageNav=_tot>_PAGE?`<div style="display:flex;justify-content:center;align-items:center;gap:10px;margin-top:12px;flex-wrap:wrap">
  <button class="btn btn-sm" ${_cp===0?'disabled':''} onclick="if(!window._rankPage)window._rankPage={};window._rankPage['${_PK}']=${_cp-1};render()">← 이전</button>
  <span style="font-size:var(--fs-sm);color:var(--gray-l)">${_cp+1} / ${_totP} (${_tot}명)</span>
  <button class="btn btn-sm" ${_cp>=_totP-1?'disabled':''} onclick="if(!window._rankPage)window._rankPage={};window._rankPage['${_PK}']=${_cp+1};render()">다음 →</button>
</div>`:'';
  return h+`</tbody></table>`+_pageNav;
}

function rTierTour(){
  try{
    if((typeof ttM==='undefined' || !Array.isArray(ttM) || !ttM.length) && typeof window.ensureTierTourRecords==='function'){
      window.ensureTierTourRecords();
    }
  }catch(e){}
  if(!isLoggedIn && _ttSub==='input') _ttSub='records';
  const subOpts=[
    {id:'input',lbl:'📝 경기 입력',fn:`_ttSub='input';render()`},
    {id:'records',lbl:'📋 기록',fn:`_ttSub='records';openDetails={};render()`}
  ];
  const _subOpts = (typeof applyTabLabels==='function') ? applyTabLabels('tiertour', subOpts) : subOpts;
  let h=stabs(_ttSub,_subOpts);
  if(_ttSub==='input' && isLoggedIn){
    if(!BLD['tt'])BLD['tt']={date:'',tiers:[],membersA:[],membersB:[],sets:[]};
    h+=buildTierTourInputHTML();
  } else {
    // 현재 선택된 대회의 기록만 표시
    const _curTnName=String(_ttCurComp||'').trim();
    // [BUGFIX] _eqComp과 동일한 로직으로 n/t 필드 기록도 포함
    const _ttFiltered=_curTnName
      ? ttM.filter(m=>{ const a=String(m?.compName||'').trim();const b=String(m?.n||'').trim();const d=String(m?.t||'').trim();return a===_curTnName||b===_curTnName||d===_curTnName; })
      : ttM;
    h+=_ttFiltered.length?recSummaryListHTML(_ttFiltered,'tt','tiertour'):'<div style="padding:40px;text-align:center;color:var(--gray-l)">기록이 없습니다.</div>';
  }
  return h;
}

function buildTierTourInputHTML(){
  const bld=BLD['tt'];
  if(!bld.tiers)bld.tiers=[];
  const tfs=bld.tiers;
  const eligible=players.filter(p=>tfs.length===0||tfs.includes(p.tier));
  const mA=bld.membersA||[];const mB=bld.membersB||[];
  const addedNames=[...mA,...mB].map(m=>m.name);

  let h=`<div class="match-builder"><h3>🎯 티어대회 입력</h3>
    <div style="margin-bottom:12px"><button class="btn btn-p btn-sm" onclick="openTTPasteModal()" style="display:inline-flex;align-items:center;gap:5px">📋 자동인식</button></div>
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;flex-wrap:wrap">
      <label style="font-size:var(--fs-sm);font-weight:700;color:var(--blue)">날짜</label>
      <input type="date" value="${bld.date||''}" onchange="BLD['tt'].date=this.value">
    </div>

    <!-- 참가 티어 선택 -->
    <div style="background:var(--blue-l);border:1px solid var(--blue-ll);border-radius:var(--r);padding:10px 14px;margin-bottom:14px">
      <div style="font-size:var(--fs-sm);font-weight:700;color:var(--blue);margin-bottom:8px">① 참가 티어 <span style="font-weight:400;color:var(--gray-l)">(복수 선택)</span></div>
      <div style="display:flex;gap:5px;flex-wrap:wrap">
        <button class="tier-filter-btn ${tfs.length===0?'on':''}" onclick="BLD['tt'].tiers=[];BLD['tt'].membersA=[];BLD['tt'].membersB=[];BLD['tt'].sets=[];render()">전체</button>
        ${TIERS.map(t=>{const _bg=getTierBtnColor(t),_tc=getTierBtnTextColor(t),_on=tfs.includes(t);return`<button class="tier-filter-btn ${_on?'on':''}" style="${_on?`background:${_bg};color:${_tc};border-color:${_bg}`:''}" onclick="ttToggleTier('${t}')">${getTierLabel(t)}</button>`;}).join('')}
      </div>
      <div style="font-size:var(--fs-caption);color:var(--blue);margin-top:6px">대상 선수: <strong>${eligible.length}명</strong></div>
    </div>

    <!-- 선수 목록 클릭으로 팀 배정 -->
    <div style="margin-bottom:14px">
      <div style="font-size:var(--fs-sm);font-weight:700;color:var(--text2);margin-bottom:8px">② 선수 클릭 → 팀 배정 <span style="font-weight:400;color:var(--gray-l);font-size:var(--fs-caption)">(A팀 버튼 / B팀 버튼으로 추가)</span></div>
      <div style="display:flex;flex-wrap:wrap;gap:6px;padding:10px;background:var(--surface);border:1px solid var(--border);border-radius:8px;max-height:200px;overflow-y:auto">
        ${eligible.length===0
          ?'<span style="color:var(--gray-l);font-size:var(--fs-sm)">티어를 선택하면 선수 목록이 표시됩니다</span>'
          :eligible.map(p=>{
              const inA=mA.some(m=>m.name===p.name);
              const inB=mB.some(m=>m.name===p.name);
              const bg=inA?'#2563eb':inB?'#dc2626':gc(p.univ);
              if(inA||inB){
                return `<span style="display:inline-flex;align-items:center;gap:3px;background:${bg};color:#fff;padding:4px 8px;border-radius:6px;font-size:var(--fs-caption);opacity:0.55">${p.name}<span style="opacity:.8;font-size:10px;margin-left:2px">${p.univ}/${p.tier}</span><span style="background:rgba(255,255,255,.3);border-radius:2px;padding:0 4px;font-size:9px;font-weight:800;margin-left:3px">${inA?'A팀':'B팀'}</span></span>`;
              }
              return `<span style="display:inline-flex;align-items:center;gap:4px;background:${bg};color:#fff;padding:3px 6px;border-radius:6px;font-size:var(--fs-caption)">
                <span style="font-weight:700">${p.name}</span><span style="opacity:.8;font-size:10px">${p.univ}/${p.tier}</span>
                <button onclick="ttAddPlayer('A','${p.name}')" style="background:var(--white);color:#2563eb;border:none;border-radius:3px;padding:1px 6px;font-size:10px;font-weight:800;cursor:pointer;margin-left:2px">A팀</button>
                <button onclick="ttAddPlayer('B','${p.name}')" style="background:var(--white);color:#dc2626;border:none;border-radius:3px;padding:1px 6px;font-size:10px;font-weight:800;cursor:pointer">B팀</button>
              </span>`;
            }).join('')
        }
      </div>
    </div>

    <!-- 팀 구성 확인 + 검색 추가 -->
    <div style="display:flex;gap:14px;flex-wrap:wrap;margin-bottom:16px">
      <div class="ck-panel">
        <h4>🔵 팀 A (${mA.length}명)</h4>
        <input type="text" id="tt-tla-input" value="${(bld.teamNameA||'').replace(/"/g,'&quot;')}" placeholder="팀명 (미입력 시 A팀)" style="width:100%;padding:5px 8px;border:1px solid var(--border2);border-radius:6px;font-size:var(--fs-sm);margin-bottom:6px;font-weight:700" onchange="BLD['tt'].teamNameA=this.value">
        <div style="display:flex;gap:6px;margin-bottom:6px">
          <input type="text" id="tt-a-search" placeholder="🔍 이름·메모 검색..." style="flex:1;padding:5px 8px;border:1px solid var(--border2);border-radius:6px;font-size:var(--fs-sm)" oninput="ttSearchPlayer('A')">
        </div>
        <div id="tt-a-drop" style="display:none;max-height:140px;overflow-y:auto;border:1px solid var(--border2);border-radius:6px;background:var(--white);margin-bottom:6px"></div>
        <div>${mA.map((m,i)=>`<span class="mem-tag" style="background:${gc(m.univ)}">${m.name}<span style="font-size:10px;opacity:.8">(${m.univ}${m.tier?'/'+m.tier:''})</span><button onclick="BLD['tt'].membersA.splice(${i},1);BLD['tt'].sets=[];render()">×</button></span>`).join('')||'<span style="color:var(--gray-l);font-size:var(--fs-sm)">선수 없음</span>'}</div>
      </div>
      <div class="ck-panel">
        <h4>🔴 팀 B (${mB.length}명)</h4>
        <input type="text" id="tt-tlb-input" value="${(bld.teamNameB||'').replace(/"/g,'&quot;')}" placeholder="팀명 (미입력 시 B팀)" style="width:100%;padding:5px 8px;border:1px solid var(--border2);border-radius:6px;font-size:var(--fs-sm);margin-bottom:6px;font-weight:700" onchange="BLD['tt'].teamNameB=this.value">
        <div style="display:flex;gap:6px;margin-bottom:6px">
          <input type="text" id="tt-b-search" placeholder="🔍 이름·메모 검색..." style="flex:1;padding:5px 8px;border:1px solid var(--border2);border-radius:6px;font-size:var(--fs-sm)" oninput="ttSearchPlayer('B')">
        </div>
        <div id="tt-b-drop" style="display:none;max-height:140px;overflow-y:auto;border:1px solid var(--border2);border-radius:6px;background:var(--white);margin-bottom:6px"></div>
        <div>${mB.map((m,i)=>`<span class="mem-tag" style="background:${gc(m.univ)}">${m.name}<span style="font-size:10px;opacity:.8">(${m.univ}${m.tier?'/'+m.tier:''})</span><button onclick="BLD['tt'].membersB.splice(${i},1);BLD['tt'].sets=[];render()">×</button></span>`).join('')||'<span style="color:var(--gray-l);font-size:var(--fs-sm)">선수 없음</span>'}</div>
      </div>
    </div>`;
  h+=setBuilderHTML(bld,'tt');h+=`</div>`;return h;
}

function ttToggleTier(t){
  const bld=BLD['tt'];if(!bld)return;
  if(!bld.tiers)bld.tiers=[];
  const i=bld.tiers.indexOf(t);
  if(i>=0)bld.tiers.splice(i,1);else bld.tiers.push(t);
  bld.membersA=[];bld.membersB=[];bld.sets=[];render();
}

function ttAddPlayer(team, name){
  const bld=BLD['tt'];if(!bld)return;
  const all=[...(bld.membersA||[]),...(bld.membersB||[])];
  if(all.find(m=>m.name===name))return;
  const pObj=players.find(p=>p.name===name)||{};
  const mem={name,univ:pObj.univ||'',race:pObj.race||'',tier:pObj.tier||''};
  if(team==='A')bld.membersA.push(mem);else bld.membersB.push(mem);
  bld.sets=[];render();
}

function ttSearchPlayer(team){
  const searchEl=document.getElementById(`tt-${team.toLowerCase()}-search`);
  const dropEl=document.getElementById(`tt-${team.toLowerCase()}-drop`);
  if(!searchEl||!dropEl)return;
  const q=searchEl.value.trim().toLowerCase();
  if(!q){dropEl.style.display='none';dropEl.innerHTML='';return;}
  const bld=BLD['tt']||{};
  const tfs=bld.tiers||[];
  const already=[...(bld.membersA||[]),...(bld.membersB||[])].map(m=>m.name);
  const results=players.filter(p=>
    (tfs.length===0||tfs.includes(p.tier)) &&
    !already.includes(p.name) &&
    (p.name.toLowerCase().includes(q)||(p.memo||'').toLowerCase().includes(q)||(p.univ||'').toLowerCase().includes(q))
  ).slice(0,15);
  if(!results.length){dropEl.innerHTML='<div style="padding:8px 12px;color:var(--gray-l);font-size:var(--fs-sm)">결과 없음</div>';dropEl.style.display='block';return;}
  dropEl.innerHTML=results.map(p=>`<div onclick="ttAddPlayer('${team}','${p.name}')"
    style="padding:7px 12px;cursor:pointer;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:7px;font-size:var(--fs-sm)"
    onmouseover="this.style.background='#f0f6ff'" onmouseout="this.style.background=''">
    <span style="width:26px;height:26px;border-radius:5px;background:${gc(p.univ)};color:#fff;font-size:10px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0">${p.race||'?'}</span>
    <div><div style="font-weight:700">${p.name} <span style="font-size:10px;color:var(--gray-l)">${p.univ} · ${p.tier||'-'}</span></div></div>
  </div>`).join('');
  dropEl.style.display='block';
}

function tierTourAutoGroup(){
  const st=_tierTourState;
  if(!st.groups.length){
    const n=parseInt(prompt('몇 조로 나눌까요?','4')||'0');
    if(!n||n<2)return;
    st.groups=[];
    for(let i=0;i<n;i++) st.groups.push({name:'GROUP '+String.fromCharCode(65+i),players:[],matches:[]});
  }
  // 선택된 티어 선수들 섞어서 배정
  const eligible=players.filter(p=>st.tiers.length===0||st.tiers.includes(p.tier));
  const shuffled=[...eligible].sort(()=>Math.random()-0.5);
  st.groups.forEach(g=>g.players=[]);
  if(st.groups.length>0)shuffled.forEach((p,i)=>{
    st.groups[i%st.groups.length].players.push(p.name);
  });
  render();
}

function grpRenameTourney(){
  const tn=tourneys.find(t=>t.name===curComp);
  if(!tn){alert('대회를 먼저 선택하세요.');return;}
  const newName=prompt('새 대회명을 입력하세요:',tn.name);
  if(!newName||!newName.trim()||newName.trim()===tn.name)return;
  const trimmed=newName.trim();
  if(tourneys.find(t=>t.name===trimmed&&t.id!==tn.id)){alert('이미 같은 이름의 대회가 있습니다.');return;}
  // comps에서도 대회명 업데이트
  comps.forEach(m=>{if(m.n===tn.name)m.n=trimmed;if(m.a===tn.name)m.a=trimmed;});
  curComp=trimmed;
  tn.name=trimmed;
  save();render();
}

function grpDelCurTourney(){
  const tn=tourneys.find(t=>t.name===curComp);
  if(!tn){alert('대회를 먼저 선택하세요.');return;}
  const matchCount=(tn.groups||[]).reduce((s,g)=>s+(g.matches||[]).length,0);
  if(!confirm(`"${tn.name}" 대회를 삭제하시겠습니까?\n(${(tn.groups||[]).length}개 조 · ${matchCount}경기 모두 삭제됩니다)`))return;
  const ti=tourneys.indexOf(tn);
  tourneys.splice(ti,1);
  curComp=tourneys.length?tourneys[0].name:'';
  save();render();
}

function grpNewLeagueTourney(){
  const name=prompt('일반 대회명을 입력하세요:');if(!name||!name.trim())return;
  const id=genId();tourneys.unshift({id,name:name.trim(),type:'league',groups:[],createdAt:new Date().toISOString()});
  curComp=name.trim();save();grpEditId=tourneys[0].id;grpSub='edit';compSub='grpedit';render();
}
function grpNewTierTourney(){
  const name=prompt('티어 대회명을 입력하세요:');if(!name||!name.trim())return;
  const id=genId();tourneys.unshift({id,name:name.trim(),type:'tier',groups:[],createdAt:new Date().toISOString()});
  _ttCurComp=name.trim();curTab='tiertour';save();render();
}
function grpRenameTierTourney(){
  const tn=tourneys.find(t=>t.name===_ttCurComp&&t.type==='tier');
  if(!tn){alert('대회를 먼저 선택하세요.');return;}
  const newName=prompt('새 대회명을 입력하세요:',tn.name);
  if(!newName||!newName.trim()||newName.trim()===tn.name)return;
  const trimmed=newName.trim();
  if(tourneys.find(t=>t.name===trimmed&&t.id!==tn.id)){alert('이미 같은 이름의 대회가 있습니다.');return;}
  ttM.forEach(m=>{if(m.compName===tn.name){m.compName=trimmed;if(m.n===tn.name)m.n=trimmed;if(m.t===tn.name)m.t=trimmed;}});
  tn.name=trimmed;
  _ttCurComp=trimmed;
  save();render();
}
function grpDelTierTourney(){
  const compName = String(_ttCurComp||'').trim();
  if(!compName){ alert('삭제할 티어대회를 선택하세요.'); return; }

  // tourneys에 없는 "기록만(ttM만)" 대회도 삭제 지원
  const tn = (tourneys||[]).find(t=>t && t.type==='tier' && String(t.name||'').trim()===compName) || null;
  const _eqComp = (m)=>{
    const c = compName;
    const a = String(m?.compName||'').trim();
    const b = String(m?.n||'').trim();
    const d = String(m?.t||'').trim();
    return a===c || b===c || d===c;
  };

  const msg = tn
    ? `"${compName}" 티어대회를 삭제하시겠습니까?\n(대회 정보 + 기록(ttM) + 스트리머 최근 경기 반영까지 모두 제거됩니다)`
    : `"${compName}" 티어대회 기록을 삭제하시겠습니까?\n(tourneys에는 없고 기록(ttM)만 있는 상태입니다)`;
  if(!confirm(msg)) return;

  // 1) 삭제 대상 경기(롤백용) 수집
  const byId = new Set();
  const toRevert = [];
  // ttM 기반
  try{
    (ttM||[]).forEach(m=>{
      if(!m || !_eqComp(m)) return;
      const id = String(m._id||'');
      if(id && byId.has(id)) return;
      if(id) byId.add(id);
      toRevert.push(m);
    });
  }catch(e){}
  // tourneys 기반(조별/브라켓) — ttM에 없는 경기까지 포함
  try{
    if(tn){
      (tn.groups||[]).forEach(g=>{
        (g.matches||[]).forEach(m=>{
          if(!m || !m._id) return;
          if(byId.has(m._id)) return;
          byId.add(m._id);
          toRevert.push({...m, _id:m._id, d:m.d||'', sets:m.sets||[]});
        });
      });
      const br = tn.bracket || {};
      Object.values(br.matchDetails||{}).forEach(m=>{
        if(!m || !m._id) return;
        if(byId.has(m._id)) return;
        byId.add(m._id);
        toRevert.push({...m, _id:m._id, d:m.d||'', sets:m.sets||[]});
      });
      (br.manualMatches||[]).forEach(m=>{
        if(!m || !m._id) return;
        if(byId.has(m._id)) return;
        byId.add(m._id);
        toRevert.push({...m, _id:m._id, d:m.d||'', sets:m.sets||[]});
      });
    }
  }catch(e){}

  // 2) 스트리머 history/포인트/ELO 롤백 + ttM에서 제거(revertMatchRecord 내부에서 처리)
  try{
    if(typeof revertMatchRecord==='function'){
      toRevert.forEach(m=>{ try{ revertMatchRecord(m); }catch(e){} });
    }
  }catch(e){}

  // 3) 남아있는 ttM 중 compName 같은 것 정리(혹시 _id 없는 레코드 등)
  // [BUGFIX] ttM = filter(...) 재할당 대신 splice로 원본 배열 직접 변경
  try{
    if(typeof ttM!=='undefined' && Array.isArray(ttM)){
      for(let _i=ttM.length-1;_i>=0;_i--){
        if(ttM[_i] && _eqComp(ttM[_i])) ttM.splice(_i,1);
      }
    }
  }catch(e){}

  // 4) tourneys에서 삭제
  try{
    if(tn){
      const ti = (tourneys||[]).indexOf(tn);
      if(ti>=0) tourneys.splice(ti,1);
    }
  }catch(e){}

  // 5) 현재 선택 대회 갱신
  try{
    const remainTier = (tourneys||[]).filter(t=>t && t.type==='tier').map(t=>String(t.name||'').trim()).filter(Boolean);
    const remainFromTtM = (()=>{ const s=new Set(); (ttM||[]).forEach(m=>{ const n=String(m?.compName||m?.n||m?.t||'').trim(); if(n) s.add(n); }); return [...s]; })();
    const all = [...new Set([...remainTier, ...remainFromTtM])];
    _ttCurComp = all.length ? all[0] : '';
  }catch(e){ _ttCurComp=''; }

  save();render();
}
function grpNewTourney(){grpNewLeagueTourney();}
function grpDelTourney(ti){
  if(!confirm(`"${tourneys[ti].name}" 대회를 삭제하시겠습니까?`))return;
  if(curComp===tourneys[ti].name)curComp='';tourneys.splice(ti,1);save();render();
}
function grpFilterUnivSel(gi){
  const searchEl=document.getElementById(`grp-univ-search-${gi}`);
  const selEl=document.getElementById(`grp-univ-sel-${gi}`);
  if(!searchEl||!selEl)return;
  const q=searchEl.value.trim().toLowerCase();
  Array.from(selEl.options).forEach(opt=>{
    if(!opt.value)return;
    opt.style.display=(!q||opt.text.toLowerCase().includes(q))?'':'none';
  });
  // 첫 번째 매칭 옵션 자동 선택
  const firstMatch=Array.from(selEl.options).find(o=>o.value&&o.style.display!=='none');
  if(firstMatch)selEl.value=firstMatch.value;
}

function grpAddGroup(tnId){
  const tn=tourneys.find(t=>t.id===tnId);if(!tn)return;
  const name=`${'ABCDEFGHIJ'[tn.groups.length]||tn.groups.length+1}조`;
  tn.groups.push({name,univs:[],matches:[]});save();render();
}
function grpDelGroup(tnId,gi){
  const tn=tourneys.find(t=>t.id===tnId);if(!tn)return;
  if(!confirm(`"${tn.groups[gi].name}"을 삭제하시겠습니까?`))return;
  tn.groups.splice(gi,1);save();render();
}
function grpAddUniv(tnId,gi){
  const tn=tourneys.find(t=>t.id===tnId);if(!tn)return;
  const sel=document.getElementById(`grp-univ-sel-${gi}`);const val=sel?sel.value:'';
  if(!val){alert(tn.type==='tier'?'선수를 선택하세요.':'대학을 선택하세요.');return;}
  if(tn.groups[gi].univs.includes(val)){alert(tn.type==='tier'?'이미 추가된 선수입니다.':'이미 추가된 대학입니다.');return;}
  tn.groups[gi].univs.push(val);save();render();
}
function grpRemoveUniv(tnId,gi,ui){
  const tn=tourneys.find(t=>t.id===tnId);if(!tn)return;
  tn.groups[gi].univs.splice(ui,1);save();render();
}
/* ══════════════════════════════════════

/* ══════════════════════════════════════
   ⚙️ 설정 섹션 접힘 상태 영속 헬퍼
══════════════════════════════════════ */
function _cfgOpen(id){try{return !!(JSON.parse(localStorage.getItem('su_cfg_open')||'{}')[id]);}catch(e){return false;}}
function _cfgToggle(id,el){try{const o=JSON.parse(localStorage.getItem('su_cfg_open')||'{}');o[id]=el.open;localStorage.setItem('su_cfg_open',JSON.stringify(o));const sp=el.querySelector('summary .cfg-toggle-txt');if(sp)sp.textContent=el.open?'▴ 접기':'▾ 펼치기';}catch(e){}}
function _cfgD(id,title,extra){const isOpen=_cfgOpen(id);return `<details class="ssec" ${isOpen?'open':''} ontoggle="_cfgToggle('${id}',this)"${extra?' '+extra:''}><summary style="cursor:pointer;list-style:none;outline:none;display:flex;align-items:center;gap:6px;-webkit-appearance:none"><h4 style="margin:0;display:inline">${title}</h4><span class="cfg-toggle-txt" style="font-size:var(--fs-caption);color:var(--gray-l);font-weight:400">${isOpen?'▴ 접기':'▾ 펼치기'}</span></summary>`;}

/* ══════════════════════════════════════
   설정
══════════════════════════════════════ */
