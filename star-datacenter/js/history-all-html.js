/* ══════════════════════════════════════════════════════════════
   대전기록 - 전체 통합 탭 HTML (history-render-tabs.js 에서 분리, 2026-07-30)
   ══════════════════════════════════════════════════════════════ */

function histAllHTML(){
  const _mini = (typeof miniM!=='undefined' && Array.isArray(miniM)) ? miniM : [];
  const _ck = (typeof ckM!=='undefined' && Array.isArray(ckM)) ? ckM : [];
  const _univm = (typeof univM!=='undefined' && Array.isArray(univM)) ? univM : [];
  const _pro = (typeof proM!=='undefined' && Array.isArray(proM)) ? proM : [];
  const _ind = (typeof indM!=='undefined' && Array.isArray(indM)) ? indM : [];
  const _gj = (typeof gjM!=='undefined' && Array.isArray(gjM)) ? gjM : [];
  const _tt = (typeof ttM!=='undefined' && Array.isArray(ttM)) ? ttM : [];
  const _comps = (typeof comps!=='undefined' && Array.isArray(comps)) ? comps : [];
  const _proTourneys = (typeof proTourneys!=='undefined' && Array.isArray(proTourneys)) ? proTourneys : [];
  const _sortDir = (typeof recSortDir!=='undefined' && (recSortDir==='asc' || recSortDir==='desc')) ? recSortDir : ((window.recSortDir==='asc'||window.recSortDir==='desc') ? window.recSortDir : 'desc');
  // 각 경기 타입별 레이블과 색상
  // (UI/UX 개선) 타입마다 색이 다 달라 무지개처럼 산만했던 것을 카테고리 3색(팀전/개인전/대회)으로 단순화.
  // 세부 구분은 뱃지 텍스트로 계속 유지.
  const _histCatCol={team:'#2563eb', solo:'#16a34a', comp:'#7c3aed'};
  const typeInfo={
    mini:{lbl:'미니대전',col:_histCatCol.team},
    univm:{lbl:'대학대전',col:_histCatCol.team},
    ck:{lbl:'대학CK',col:_histCatCol.team},
    pro:{lbl:'프로리그',col:_histCatCol.team},
    ind:{lbl:'개인전',col:_histCatCol.solo},
    gj:{lbl:'끝장전',col:_histCatCol.solo},
    tt:{lbl:'티어대회',col:_histCatCol.comp},
    tourney:{lbl:'대회',col:_histCatCol.comp},
    procomp:{lbl:'프로리그대회',col:_histCatCol.comp},
  };
  // 통합 목록 생성
  const allItems=[];
  // 팀전 (mini/ck/univm/pro): m.a, m.b, m.sa, m.sb, m.d
  [[_mini,'mini'],[_ck,'ck'],[_univm,'univm'],[_pro,'pro']].forEach(([arr,type])=>{
    (arr||[]).forEach((m,idx)=>{
      const isCK=(type==='ck'||type==='pro');
      if(isCK){if(!m.teamAMembers||!m.teamBMembers)return;}else{if(!m.a||!m.b)return;}
      if(m.sa==null||m.sb==null||m.sa===''||m.sb==='')return;
      if(typeof passDateFilter==='function' && !passDateFilter(m.d||''))return;
      allItems.push({type,d:m.d||'',m,idx});
    });
  });
  // 개인전/끝장전 (ind/gj): m.wName, m.lName, m.d
  [[_ind,'ind'],[_gj,'gj']].forEach(([arr,type])=>{
    (arr||[]).forEach((m,idx)=>{
      if(!m.wName||!m.lName)return;
      if(typeof passDateFilter==='function' && !passDateFilter(m.d||''))return;
      allItems.push({type,d:m.d||'',m,idx});
    });
  });
  // 티어대회 (tt): m.a, m.b, m.sa, m.sb, m.d
  _tt.forEach((m,idx)=>{
    if(!m.a||!m.b)return;
    if(typeof passDateFilter==='function' && !passDateFilter(m.d||''))return;
    allItems.push({type:'tt',d:m.d||'',m,idx});
  });
  // 대회 tourney
  if(typeof getTourneyMatches==='function'){
    getTourneyMatches().forEach((m,idx)=>{
      if(!m.a||!m.b||m.sa==null||m.sb==null)return;
      if(typeof passDateFilter==='function' && !passDateFilter(m.d||''))return;
      allItems.push({type:'tourney',d:m.d||'',m,idx});
    });
  }
  // 일반대회 일반 경기 (normalMatches)
  if(typeof getNormalMatchesForHistory==='function'){
    getNormalMatchesForHistory().forEach((m,idx)=>{
      if(!m.a||!m.b||m.sa==null||m.sb==null)return;
      if(typeof passDateFilter==='function' && !passDateFilter(m.d||''))return;
      allItems.push({type:'tourney',d:m.d||'',m,idx});
    });
  }
  // 대회 토너먼트 (comps)
  _comps.forEach((m,idx)=>{
    if(!m.a&&!m.u) return; if(!m.b) return;
    if(m.sa==null||m.sa===''||m.sb==null||m.sb==='') return;
    if(isNaN(Number(m.sa))||isNaN(Number(m.sb))) return;
    if(typeof passDateFilter==='function' && !passDateFilter(m.d||'')) return;
    allItems.push({type:'tourney',d:m.d||'',m:{...m,a:m.a||m.u},idx});
  });
  // 프로리그 개인 대회 (procomp)
  _proTourneys.forEach((tn,tnIdx)=>{
    (tn.groups||[]).forEach((grp,grpIdx)=>{
      (grp.matches||[]).forEach((m,matchIdx)=>{
        if(!m.a||!m.b||!m.winner)return;
        if(typeof passDateFilter==='function' && !passDateFilter(m.d||''))return;
        const wName=m.winner==='A'?m.a:m.b;
        const lName=m.winner==='A'?m.b:m.a;
        allItems.push({type:'procomp',d:m.d||'',m:{...m,wName,lName},idx:matchIdx,_ref:`procomp:${tnIdx}:${grpIdx}:${matchIdx}`});
      });
    });
  });
  allItems.sort((a,b)=>_sortDir==='asc'?(a.d).localeCompare(b.d):(b.d).localeCompare(a.d));

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
    {id:'mini',lbl:'미니'},
    {id:'univm',lbl:'대학대전'},
    {id:'ck',lbl:'CK'},
    {id:'pro',lbl:'프로'},
    {id:'tt',lbl:'티어'},
    {id:'ind',lbl:'개인전'},
    {id:'gj',lbl:'끝장전'},
    {id:'tourney',lbl:'대회'},
    {id:'procomp',lbl:'프로리그대회'},
  ].filter(t=>t.id==='전체'||_typeCountMap[t.id]>0);

  // ── 맵 필터 ──
  // allItems에서 맵 목록 추출 (sets.games 포함)
  const _getItemMaps = ({m}) => {
    const found = new Set();
    // 단일 맵 필드
    if(m.map && m.map !== '-') found.add(m.map);
    // sets → games 맵
    (m.sets||[]).forEach(s => {
      if(s.map && s.map !== '-') found.add(s.map);
      (s.games||[]).forEach(g => { if(g.map && g.map !== '-') found.add(g.map); });
    });
    return found;
  };
  const _allMapSet = new Set();
  _typeFiltered.forEach(item => _getItemMaps(item).forEach(mp => _allMapSet.add(mp)));
  const _allMapList = [..._allMapSet].sort((a,b)=>a.localeCompare(b,'ko'));
  // 맵 필터 상태
  if(!window._recMapFilter) window._recMapFilter='전체';
  // 현재 선택 맵이 목록에 없으면 초기화
  if(window._recMapFilter !== '전체' && !_allMapSet.has(window._recMapFilter)) window._recMapFilter='전체';
  // 맵 필터 적용
  const _mapFiltered = (window._recMapFilter === '전체') ? _typeFiltered
    : _typeFiltered.filter(item => _getItemMaps(item).has(window._recMapFilter));
  // 맵별 경기 수
  const _mapCountMap = {};
  _typeFiltered.forEach(item => _getItemMaps(item).forEach(mp => { _mapCountMap[mp]=(_mapCountMap[mp]||0)+1; }));

  // (UI/UX 개선) prev/next 페이지네이션 대신, histPage['all']를 "몇 묶음을 더 불러왔는지"로 재해석해
  // 누적 로드형 "더보기" 방식으로 전환 (다른 파일에서 histPage['all']=0으로 리셋하는 기존 로직과도 호환됨)
  const pageSize=getHistPageSize();
  if(histPage['all']===undefined) histPage['all']=0;
  const _loadedCount=(histPage['all']+1)*pageSize;
  const paged=_mapFiltered.slice(0,_loadedCount);
  const _hasMore=_mapFiltered.length>paged.length;

  // (UI/UX 개선) 상단 요약 스트립: 총 경기 수 / 이번달 경기 수 / 최근 기록 날짜를 한눈에
  const _todayYm=new Date().toISOString().slice(0,7);
  const _thisMonthCnt=_mapFiltered.filter(({d})=>d && d.slice(0,7)===_todayYm).length;
  const _latestD=allItems.length?allItems.reduce((a,b)=>((a.d||'')>(b.d||'')?a:b)).d:'';
  const _latestDLabel=_latestD?_latestD.slice(2).replace(/-/g,'/'):'-';
  let h=`<div style="display:flex;gap:14px;flex-wrap:wrap;align-items:center;margin-bottom:10px;padding:10px 14px;border-radius:12px;background:linear-gradient(120deg,rgba(37,99,235,.08),rgba(124,58,237,.06));border:1px solid var(--border)">
    <span style="font-size:var(--fs-sm);font-weight:800;color:var(--text)">📋 총 <b style="font-size:var(--fs-base)">${_mapFiltered.length}</b>경기</span>
    <span style="width:1px;height:14px;background:var(--border)"></span>
    <span style="font-size:var(--fs-sm);color:var(--text2)">이번 달 <b style="color:var(--text)">${_thisMonthCnt}</b>경기</span>
    <span style="width:1px;height:14px;background:var(--border)"></span>
    <span style="font-size:var(--fs-sm);color:var(--text2)">최근 기록 <b style="color:var(--text)">${_latestDLabel}</b></span>
  </div>`;

  // (UI/UX 개선) 타입/맵 필터를 접이식 패널로 압축. 접혀있을 때도 활성 필터 개수는 뱃지로 표시.
  // (버그 수정) 상단 '필터 ▲/▼' 토글이 닫혀 있으면 이 버튼들 자체가 노출되지 않아야 함
  const _enableSubFilterAll = (localStorage.getItem('su_submenu_filter_enabled') ?? '1') === '1';
  if(!_enableSubFilterAll || window._histFilterOpen){
  if(window._histAllFilterPanelOpen===undefined) window._histAllFilterPanelOpen=false;
  const _activeFilterCnt=(window._recTypeFilter&&window._recTypeFilter!=='전체'?1:0)+(window._recMapFilter&&window._recMapFilter!=='전체'?1:0);
  h+=`<div style="margin-bottom:8px">
    <button class="pill ${window._histAllFilterPanelOpen?'on':''}" onclick="window._histAllFilterPanelOpen=!window._histAllFilterPanelOpen;render()">🔍 타입/맵 필터${_activeFilterCnt?` <span style="font-size:10px;opacity:.8">(${_activeFilterCnt})</span>`:''} ${window._histAllFilterPanelOpen?'▲':'▼'}</button>
  </div>`;
  if(window._histAllFilterPanelOpen){
    h+=`<div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:8px">
      ${_typeButtons.map(t=>`<button class="pill ${window._recTypeFilter===t.id?'on':''}" onclick="window._recTypeFilter='${t.id}';window._recMapFilter='전체';histPage['all']=0;render()">${t.lbl}${t.id!=='전체'&&_typeCountMap[t.id]?` <span style="font-size:10px;opacity:.7">(${_typeCountMap[t.id]})</span>`:''}</button>`).join('')}
    </div>`;
    // 맵 필터 바 (맵이 2개 이상일 때만 표시)
    if(_allMapList.length >= 2){
      h+=`<div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:8px;align-items:center">`;
      h+=`<span style="font-size:var(--fs-caption);color:var(--gray-l);white-space:nowrap;flex-shrink:0">맵</span>`;
      h+=`<button class="pill ${window._recMapFilter==='전체'?'on':''}" style="font-size:var(--fs-caption)" onclick="window._recMapFilter='전체';histPage['all']=0;render()">전체</button>`;
      _allMapList.forEach(mp=>{
        const cnt=_mapCountMap[mp]||0;
        const isOn=window._recMapFilter===mp;
        h+=`<button class="pill ${isOn?'on':''}" style="font-size:var(--fs-caption)" onclick="window._recMapFilter='${mp.replace(/'/g,"\\'")}';histPage['all']=0;render()">${mp}<span style="font-size:10px;opacity:.65;margin-left:3px">${cnt}</span></button>`;
      });
      h+=`</div>`;
    }
  }

  // (UI/UX 개선) 관리자 전용 "맵명 일괄 변경" 도구를 상시 노출 대신 접이식 도구 패널로 분리
  if((typeof isLoggedIn!=='undefined' && isLoggedIn) || !!window.isLoggedIn){
    if(window._histAllAdminToolOpen===undefined) window._histAllAdminToolOpen=false;
    h+=`<div style="margin-bottom:8px">
      <button class="pill" onclick="window._histAllAdminToolOpen=!window._histAllAdminToolOpen;render()">🛠 관리자 도구 ${window._histAllAdminToolOpen?'▲':'▼'}</button>
    </div>`;
    if(window._histAllAdminToolOpen){
      h += `<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin:0 0 10px;padding:10px 12px;border:1px solid var(--border);border-radius:12px;background:var(--surface)">
        <span style="font-size:var(--fs-sm);font-weight:800;color:var(--text2)">맵명 일괄 변경</span>
        <input id="hist-bulk-map-from" type="text" placeholder="교체 전 맵명" value="${window._recMapFilter&&window._recMapFilter!=='전체'?String(window._recMapFilter).replace(/"/g,'&quot;'):''}" style="width:140px;padding:7px 10px;border:1px solid var(--border);border-radius:8px">
        <span style="font-size:var(--fs-sm);color:var(--gray-l)">→</span>
        <input id="hist-bulk-map-to" type="text" placeholder="교체 후 맵명" style="width:140px;padding:7px 10px;border:1px solid var(--border);border-radius:8px">
        <button class="btn btn-w btn-sm" onclick="histBulkPreviewMapFromAllTab()">미리보기</button>
        <button class="btn btn-b btn-sm" onclick="histBulkChangeMapFromAllTab()">일괄 변경</button>
        <span id="hist-bulk-map-result" style="font-size:var(--fs-sm);color:var(--green)"></span>
      </div>`;
    }
  }
  }

  if(!paged.length){
    h+=`<div class="empty-state"><div class="empty-state-title">기록이 없습니다</div></div>`;
    return h;
  }

  // (UI/UX 개선) 긴 가로 막대형 대신 신용카드 비율의 미니 카드를 그리드로 배치.
  // 같은 날짜끼리는 구분선으로 묶어 하루 단위 그리드로 나눔 (날짜 바뀔 때 그리드 새로 오픈)
  let _histAllLastD=null;
  let _histAllGridOpen=false;
  paged.forEach(({type,d,m,idx,_ref}, pageIdx)=>{
    if(d!==_histAllLastD){
      if(_histAllGridOpen){ h+='</div>'; _histAllGridOpen=false; }
      _histAllLastD=d;
      const _dvLabel=d?d.slice(2).replace(/-/g,'/'):'날짜 미정';
      h+=`<div style="display:flex;align-items:center;gap:8px;margin:14px 0 8px;${pageIdx===0?'margin-top:0;':''}">
        <span style="font-size:var(--fs-sm);font-weight:800;color:var(--text2);white-space:nowrap">${_dvLabel}</span>
        <span style="flex:1;height:1px;background:var(--border)"></span>
      </div>`;
    }
    if(!_histAllGridOpen){ h+='<div class="hist-all-cardgrid">'; _histAllGridOpen=true; }
    const ti=typeInfo[type]||{lbl:type,col:'#64748b'};
    const isCK=(type==='ck'||type==='pro');
    const isInd=(type==='ind'||type==='gj'||type==='procomp');
    let teamA='',teamB='',scoreA='',scoreB='';
    // (UI/UX 개선) CK/프로리그처럼 팀원이 많은 경기는 이름을 전부 나열하면 카드가 쓸데없이 길어짐 →
    // 헤더에는 짧은 팀 라벨만 표시하고, 팀원 목록은 "참여자 보기" 버튼으로 팝업(openProMembersPopup, 개별 탭과 동일 컴포넌트 재사용)에서 확인
    let aMembers=[], bMembers=[];
    if(isInd){
      teamA=m.wName||''; teamB=m.lName||'';
    } else if(isCK){
      aMembers=m.teamAMembers||[]; bMembers=m.teamBMembers||[];
      teamA='A팀'; teamB='B팀';
      scoreA=m.sa!=null?m.sa:''; scoreB=m.sb!=null?m.sb:'';
    } else {
      teamA=m.a||''; teamB=m.b||'';
      scoreA=m.sa!=null?m.sa:''; scoreB=m.sb!=null?m.sb:'';
    }
    const winner=isInd?teamA:(!isInd&&scoreA!==''&&scoreB!==''?(Number(scoreA)>Number(scoreB)?teamA:(Number(scoreB)>Number(scoreA)?teamB:'')):'');
    const dLabel=d?d.slice(2).replace(/-/g,'/'):'미정';
    const dColor=d?'var(--text3)':'#f59e0b';
    const winCol=winner===teamA?gc(teamA):winner===teamB?gc(teamB):ti.col;
    const _regIdx = (typeof idx==='number' ? idx : pageIdx);
    // (버그예방) CK/프로리그는 teamA/teamB가 이제 'A팀'/'B팀'으로 고정돼 더 이상 유니크하지 않으므로
    // idx를 포함해 상세토글 키가 서로 충돌하지 않도록 함
    const key=`hist-all-${type}-${d}-${_regIdx}-${(m.a||teamA)}-${(m.b||teamB)}`.replace(/[^\w\-:.]/g,'');
    const labelA=isCK?'A팀':(m.a||teamA);
    const labelB=isCK?'B팀':(m.b||teamB);
    const _sideCols = type==='ck' ? getFixedSideColors('ck') : type==='pro' ? getFixedSideColors('pro') : getFixedSideColors('tt');
    const ca=isCK?_sideCols.a:gc(m.a||teamA);
    const cb=isCK?_sideCols.b:gc(m.b||teamB);
    const aWin=!isInd && Number(scoreA)>Number(scoreB);
    const bWin=!isInd && Number(scoreB)>Number(scoreA);
    const modeMap={mini:'mini',univm:'univm',ck:'ck',pro:'pro',tt:'tt',ind:'ind',gj:'gj',progj:'progj',tourney:'tourney',procomp:'procomp'};
    const mode=modeMap[type]||'comp';
    const _detM = _ref ? {...m, _editRef:_ref} : m;
    const _isIndLike = (type==='ind'||type==='gj'||type==='procomp');
    let dotA=ca, dotB=cb;
    let _raceA='', _raceB='';
    let _thumbA='', _thumbB='';
    if(_isIndLike){
      const _wp=players.find(p=>p.name===(m.wName||teamA||'')); const _lp=players.find(p=>p.name===(m.lName||teamB||''));
      dotA=_wp?gc(_wp.univ):'#94a3b8'; dotB=_lp?gc(_lp.univ):'#94a3b8';
      const _rIcon={'테란':'🔵','저그':'🟣','프로토스':'🟡'};
      _raceA=_wp?(_rIcon[_wp.race]||''):''; _raceB=_lp?(_rIcon[_lp.race]||''):'';
      if(typeof getPlayerPhotoHTML==='function'){
        if(_wp) _thumbA=getPlayerPhotoHTML(_wp.name,'44px','border:none;',{lazy:true});
        if(_lp) _thumbB=getPlayerPhotoHTML(_lp.name,'44px','border:none;',{lazy:true});
      }
    } else if(!isCK){
      // (UI/UX 개선) 대학 대 대학 매치는 선수 얼굴 대신 대학 로고를 카드 양끝 썸네일로 사용
      const _univLogoHTML=(n,side)=>{
        try{
          const url=(typeof UNIV_ICONS!=='undefined'&&UNIV_ICONS[n])||((typeof univCfg!=='undefined'&&univCfg.find(x=>x&&x.name===n))||{}).icon||'';
          if(!url) return '';
          const _src=(typeof toHttpsUrl==='function')?toHttpsUrl(url):url;
          const _won=side==='a'?aWin:bWin;
          const _filt=_won?'none':'grayscale(0.7) opacity(0.8)';
          const _nAttr=String(n).replace(/"/g,'&quot;');
          return `<img src="${_src}" loading="lazy" title="${_nAttr}" style="width:44px;height:44px;object-fit:contain;flex-shrink:0;filter:${_filt}" onerror="this.style.display='none'">`;
        }catch(e){ return ''; }
      };
      _thumbA=_univLogoHTML(teamA,'a'); _thumbB=_univLogoHTML(teamB,'b');
    }
    // (UI/UX 개선) 대학 대 대학 매치: 세트/게임 기록에서 실제 출전한 선수를 게임 순서대로 모아
    // 로고 아래에 프로필 사진 1장을 슬라이드쇼처럼 순환 표시. 팀 승패 × 개인 승패 조합으로 명암 처리:
    //  - 이긴팀 + 개인승  : 정상(효과 없음)
    //  - 이긴팀 + 개인패  : 아주 약하게만 회색 처리
    //  - 진팀   + 개인승  : 살짝만 연하게
    //  - 진팀   + 개인패  : 기본 회색 처리(가장 진하게)
    const _sideOrderedParticipants=(side)=>{
      if(isInd) return [];
      if(!m.sets||!Array.isArray(m.sets)) return [];
      const seen=new Set(); const out=[];
      m.sets.forEach(set=>{
        (set.games||[]).forEach(g=>{
          const n=side==='a'?g.playerA:g.playerB;
          if(!n||seen.has(n)) return;
          seen.add(n);
          const _won=(side==='a')?(g.winner==='A'):(g.winner==='B');
          out.push({name:n,won:_won});
        });
      });
      return out;
    };
    const _individualFilter=(playerWon,teamWon)=>{
      if(teamWon&&playerWon) return '';
      if(teamWon&&!playerWon) return 'grayscale(0.35) opacity(0.9)';
      if(!teamWon&&playerWon) return 'grayscale(0.55) opacity(0.85)';
      return 'grayscale(1) opacity(0.55)';
    };
    const _participantsHTML=(side)=>{
      const list=_sideOrderedParticipants(side);
      if(!list.length || typeof getPlayerPhotoHTML!=='function') return '';
      const teamWon=(side==='a')?aWin:bWin;
      const N=list.length;
      const animName=`rspRot_${key}_${side}`.replace(/[^\w]/g,'_');
      const DUR=Math.max(2.4, N*2.4);
      const frames=list.map((p,i)=>{
        const raw=getPlayerPhotoHTML(p.name,'46px','border:none;display:block;',{lazy:true});
        const filt=_individualFilter(p.won,teamWon);
        const animStyle=N>1?`animation:${animName}_${i} ${DUR}s linear infinite;`:'opacity:1;';
        return `<span class="hist-all-mc-avatar-frame" style="${animStyle}filter:${filt||'none'}">${raw}</span>`;
      }).join('');
      const styleTag=N>1?`<style>${list.map((p,i)=>{
        const start=(i/N*100), end=((i+1)/N*100);
        const fadeGap=Math.min(1.2,(end-start)*0.12);
        return `@keyframes ${animName}_${i}{${start.toFixed(2)}%{opacity:0}${(start+fadeGap).toFixed(2)}%{opacity:1}${(end-fadeGap).toFixed(2)}%{opacity:1}${end.toFixed(2)}%{opacity:0}}`;
      }).join('')}</style>`:'';
      return `${styleTag}<div class="hist-all-mc-participants">${frames}</div>`;
    };
    // (UI/UX 개선) 참여자 보기 버튼 마크업 (CK/프로리그, 팀원 정보 있을 때만) — 카드 하단용 축소 버전
    const _memBtn=(side,members)=>{
      if(!isCK || !members || !members.length) return '';
      const col=side==='a'?ca:cb;
      const lbl=side==='a'?teamA:teamB;
      const memJson=JSON.stringify(members).replace(/"/g,"'");
      return `<button class="btn btn-xs no-export" style="flex-shrink:0;padding:1px 7px;border-radius:12px;border:1px solid ${col}55;background:${col}15;color:${col};font-weight:700;font-size:9px;white-space:nowrap" onclick="event.stopPropagation();openProMembersPopup('${lbl}','${col}',${memJson})">👥${members.length}</button>`;
    };
    const _extraTag = m._src==='tour_normal'?'일반경기':(m._src==='tour_bracket'||m._src==='tour_manual')?'토너먼트':(m._teamMatchType?m._teamMatchType.replace('v',':')+'전':'');
    const _canEdit = (typeof isLoggedIn!=='undefined'&&isLoggedIn&&!(typeof isSubAdmin!=='undefined'&&isSubAdmin)&&_regIdx>=0&&type!=='tourney'&&type!=='procomp');
    const _editBtn = (()=>{
      if(!_canEdit) return '';
      if(type==='ind'||type==='gj'||type==='progj'){
        const _minfo=JSON.stringify({_id:m._id||'',sid:m.sid||'',d:m.d||'',wName:m.wName||'',lName:m.lName||''}).replace(/"/g,"'");
        return `<button class="btn btn-xs no-export" style="border:none;background:transparent;color:var(--text3);font-size:9px;padding:0" onclick="event.stopPropagation();_openAllTabIndEdit('${type}',${_minfo},${_regIdx})">수정</button>`;
      }
      return `<button class="btn btn-xs no-export" style="border:none;background:transparent;color:var(--text3);font-size:9px;padding:0" onclick="event.stopPropagation();openRE('${mode}',${_regIdx})">수정</button>`;
    })();
    const _bottomContent = (_memBtn('a',aMembers)||_memBtn('b',bMembers))
      ? `${_memBtn('a',aMembers)}${_memBtn('b',bMembers)}`
      : (_extraTag ? `<span class="hist-all-mc-map">${_extraTag}</span>`
        : (m.map&&m.map!=='-' ? `<span class="hist-all-mc-map">${m.map}</span>` : ''));
    const _teamAAttr=String(teamA).replace(/"/g,'&quot;');
    const _teamBAttr=String(teamB).replace(/"/g,'&quot;');
    h+=`<div class="hist-all-minicard" data-rec-mode="tierrank" style="--rec-mode-col:${ti.col};border-left-color:${dotA};border-right-color:${dotB};background:linear-gradient(90deg, ${dotA}26 0%, ${dotA}0d 14%, var(--white) 28%, var(--white) 72%, ${dotB}0d 86%, ${dotB}26 100%)" onclick="toggleDetail('${key}')">
      <div class="hist-all-mc-top">
        <span class="hist-all-mc-type" style="background:${ti.col}1f;color:${ti.col}">${ti.lbl}</span>
        <span class="hist-all-mc-date" style="color:${dColor}">${dLabel}</span>
        ${_editBtn}
      </div>
      <div class="hist-all-mc-mid">
        <div class="hist-all-mc-side">
          ${_thumbA || `<span class="hist-all-mc-dot" style="background:${dotA}"></span>`}
          <span class="hist-all-mc-name" title="${_teamAAttr}" style="color:${(!isCK&&!_isIndLike)?dotA:(winner===teamA?'var(--win-col)':winner===teamB?'var(--lose-col)':'var(--text)')}">${_raceA?`${_raceA} `:''}${teamA}</span>
          ${_participantsHTML('a')}
        </div>
        ${isInd
          ?`<span class="hist-all-mc-score" style="color:var(--win-col)">승</span>`
          :`<span class="hist-all-mc-score">
            <span style="color:${Number(scoreA)>Number(scoreB)?'var(--win-col)':Number(scoreB)>Number(scoreA)?'var(--lose-col)':'var(--text)'}">${scoreA}</span><span style="color:var(--gray-l);font-weight:400">:</span><span style="color:${Number(scoreB)>Number(scoreA)?'var(--win-col)':Number(scoreA)>Number(scoreB)?'var(--lose-col)':'var(--text)'}">${scoreB}</span>
          </span>`}
        <div class="hist-all-mc-side right">
          ${_thumbB || `<span class="hist-all-mc-dot" style="background:${dotB}"></span>`}
          <span class="hist-all-mc-name" title="${_teamBAttr}" style="color:${(!isCK&&!_isIndLike)?dotB:(winner===teamB?'var(--win-col)':winner===teamA?'var(--lose-col)':'var(--text)')}">${teamB}${_raceB?` ${_raceB}`:''}</span>
          ${_participantsHTML('b')}
        </div>
      </div>
      <div class="hist-all-mc-bottom">${_bottomContent}</div>
      <div id="det-${key}" class="rec-detail-area">
        ${isInd
          ? (()=> {
              const wp=players.find(p=>p.name===(m.wName||'')); const lp=players.find(p=>p.name===(m.lName||''));
              const wc=wp?gc(wp.univ):'#888'; const lc=lp?gc(lp.univ):'#888';
              const mapStr=m.map&&m.map!=='-'?`<span style="font-size:var(--fs-caption);color:var(--gray-l)">${m.map}</span>`:'';
              return `<div style="padding:8px 10px;display:flex;align-items:center;gap:8px">
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
  if(_histAllGridOpen){ h+='</div>'; _histAllGridOpen=false; }

  // (UI/UX 개선) prev/next 대신 "더보기"로 이어붙이는 피드형 로딩. 여러 페이지를 불러온 뒤엔 "처음으로"도 제공.
  if(_mapFiltered.length>pageSize){
    h+=`<div style="display:flex;justify-content:center;align-items:center;gap:8px;margin-top:14px;flex-wrap:wrap">
      <span style="font-size:var(--fs-sm);color:var(--gray-l)">${paged.length} / ${_mapFiltered.length}건 표시 중</span>
      ${_hasMore?`<button class="btn btn-sm" onclick="histPage['all']=${histPage['all']+1};render()">더 보기 ↓</button>`:''}
      ${histPage['all']>0?`<button class="btn btn-sm btn-w" onclick="histPage['all']=0;render()">처음으로</button>`:''}
    </div>`;
  }
  return h;
}

/* ══════════════════════════════════════
   대전 기록 > 대회 탭: 미니대전처럼 보이는 대회 경기 기록
══════════════════════════════════════ */
