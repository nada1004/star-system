/* match-builder-gj.js: extracted from match-builder.js */
/* ══════════════════════════════════════
   끝장전
══════════════════════════════════════ */
let _gjInput={date:'',playerA:'',playerB:'',games:[]};
let _gjProMode=false;
let _gjEditingIds=null;

function rGJ(C,T,proOnly,proInput){
  const _newProMode=!!(proOnly&&proInput);
  if(_newProMode!==_gjProMode){_gjInput={date:'',playerA:'',playerB:'',games:[]};BLD['gj']=null;}
  _gjProMode=_newProMode;
  T.innerText=proOnly?'🏅 프로리그 끝장전':'⚔️ 끝장전';
  const _enableSubFilter = (localStorage.getItem('su_submenu_filter_enabled') ?? '1') === '1';
  const _lockOpen = (localStorage.getItem('su_filter_lock_open') ?? '1') === '1';
  if(window._gjFilterOpen===undefined) window._gjFilterOpen=_lockOpen;
  if(_lockOpen) window._gjFilterOpen=true;
  if(!isLoggedIn && gjSub==='input') gjSub='records';
  const showInput=!proOnly||proInput;
  const subOpts=showInput
    ?[{id:'input',lbl:'📝 경기 입력',fn:`gjSub='input';render()`},{id:'rank',lbl:'🏆 순위',fn:`gjSub='rank';render()`},{id:'records',lbl:'📋 기록',fn:`gjSub='records';render()`}]
    :[{id:'rank',lbl:'🏆 순위',fn:`gjSub='rank';render()`},{id:'records',lbl:'📋 기록',fn:`gjSub='records';render()`}];
  if(!showInput&&gjSub==='input') gjSub='records';
  let h='';
  if(_enableSubFilter && !_lockOpen){
    h+=`<div class="fbar no-export" style="overflow-x:auto;flex-wrap:nowrap;-webkit-overflow-scrolling:touch;scrollbar-width:none;gap:4px;margin-bottom:6px;align-items:center">
      <button class="pill ${window._gjFilterOpen?'on':''}" style="flex-shrink:0;white-space:nowrap" onclick="window._gjFilterOpen=!window._gjFilterOpen;render()">🔍 필터 ${window._gjFilterOpen?'▲':'▼'}</button>
    </div>`;
  }
  if(!_enableSubFilter || window._gjFilterOpen){
    const extra = (gjSub!=='input' && typeof buildYearMonthFilterControls==='function')
      ? (buildYearMonthFilterControls('gj', true)
        + `<button class="pill ${recSortDir==='desc'?'on':''}" style="flex-shrink:0;white-space:nowrap" onclick="recSortDir='desc';render()">최신순 ↓</button>`
        + `<button class="pill ${recSortDir==='asc'?'on':''}" style="flex-shrink:0;white-space:nowrap" onclick="recSortDir='asc';render()">오래된순 ↑</button>`)
      : '';
    h+=typeof stabsInline==='function' ? stabsInline(gjSub, subOpts, extra) : stabs(gjSub, subOpts) + (extra?`<div>${extra}</div>`:'');
  }
  if(gjSub==='input'&&isLoggedIn&&showInput){
    h+=gjInputHTML();
  } else if(gjSub==='rank'){
    h+=gjRankHTML(proOnly);
  } else {
    h+=gjRecordsHTML(proOnly);
  }
  C.innerHTML=h;
}

function openGJProPasteModal(){
  openGJPasteModal();
  window._gjProPaste=true;
}

function gjInputHTML(){
  const gi=_gjInput;
  const pA=gi.playerA, pB=gi.playerB;
  const pAObj=players.find(p=>p.name===pA)||{};
  const pBObj=players.find(p=>p.name===pB)||{};
  const aCol=gc(pAObj.univ)||'#2563eb', bCol=gc(pBObj.univ)||'#dc2626';

  const today=new Date().toISOString().slice(0,10);
  if(pA&&pB){
    const paMem={name:pA,univ:pAObj.univ||'',race:pAObj.race||'',tier:pAObj.tier||'',gender:pAObj.gender||''};
    const pbMem={name:pB,univ:pBObj.univ||'',race:pBObj.race||'',tier:pBObj.tier||'',gender:pBObj.gender||''};
    if(!BLD['gj'] || !BLD['gj'].membersA || !BLD['gj'].membersB || BLD['gj'].membersA[0]?.name!==pA || BLD['gj'].membersB[0]?.name!==pB){
      BLD['gj']={date:gi.date||today,membersA:[paMem],membersB:[pbMem],sets:[],noSetMode:true,freeGames:[],_proLabel:!!_gjProMode};
    } else {
      if(BLD['gj']._proLabel!==!!_gjProMode) BLD['gj']._proLabel=!!_gjProMode;
      if(gi.date && BLD['gj'].date!==gi.date) BLD['gj'].date=gi.date;
      if(!gi.date && !BLD['gj'].date) BLD['gj'].date=today;
    }
  } else {
    BLD['gj']=null;
  }

  return `<div class="match-builder"><h3>${_gjProMode?'🏅 프로리그 끝장전 입력':'⚔️ 끝장전 입력'}</h3>
    <div style="margin-bottom:12px"><button class="btn btn-p btn-sm" onclick="${_gjProMode?'openGJProPasteModal':'openGJPasteModal'}()" style="display:inline-flex;align-items:center;gap:5px">📋 자동인식</button></div>
    <div style="background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:16px;margin-bottom:14px">
      <div style="font-size:12px;font-weight:700;color:var(--blue);margin-bottom:12px">① 날짜 & 대전 스트리머</div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin-bottom:12px">
        <div style="display:flex;align-items:center;gap:6px">
          <label style="font-size:12px;font-weight:700">날짜</label>
          <input type="date" value="${gi.date||''}" onchange="_gjInput.date=this.value;if(BLD['gj'])BLD['gj'].date=this.value;render()" style="padding:5px 8px;border:1px solid var(--border2);border-radius:6px;font-size:12px">
        </div>
      </div>
      <div style="display:flex;gap:10px;flex-wrap:wrap">
        <div style="flex:1;min-width:140px">
          <div style="font-size:11px;font-weight:700;color:${aCol};margin-bottom:4px">🔵 A 스트리머</div>
          ${pA?`<div style="display:flex;align-items:center;gap:6px;padding:8px;background:${aCol}18;border:2px solid ${aCol};border-radius:8px">
            ${getPlayerPhotoHTML(pA,'28px')}
            <span style="font-weight:800;color:${aCol}">${pA}</span>
            <span style="font-size:10px;color:var(--gray-l)">${pAObj.univ||''}</span>
            <button onclick="_gjInput.playerA='';BLD['gj']=null;render()" style="margin-left:auto;background:none;border:none;color:#94a3b8;cursor:pointer;font-size:12px">✕</button>
          </div>` : ''}
        </div>
        <div style="display:flex;align-items:center;font-weight:900;color:var(--gray-l);padding-top:20px">VS</div>
        <div style="flex:1;min-width:140px">
          <div style="font-size:11px;font-weight:700;color:${bCol};margin-bottom:4px">🔴 B 스트리머</div>
          ${pB?`<div style="display:flex;align-items:center;gap:6px;padding:8px;background:${bCol}18;border:2px solid ${bCol};border-radius:8px">
            ${getPlayerPhotoHTML(pB,'28px')}
            <span style="font-weight:800;color:${bCol}">${pB}</span>
            <span style="font-size:10px;color:var(--gray-l)">${pBObj.univ||''}</span>
            <button onclick="_gjInput.playerB='';BLD['gj']=null;render()" style="margin-left:auto;background:none;border:none;color:#94a3b8;cursor:pointer;font-size:12px">✕</button>
          </div>` : ''}
        </div>
      </div>
      ${!(pA&&pB)?_matchPlayerAssignPoolHTML('gj'):''}
    </div>
    ${pA&&pB&&BLD['gj']?`<div style="background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:16px;margin-bottom:14px">
      <div style="font-size:12px;font-weight:700;color:var(--blue);margin-bottom:10px">② 경기 결과 입력</div>
      ${setBuilderHTML(BLD['gj'],'gj')}
    </div>`:''}
  </div>`;
}

function gjDirectSave(){
  const gi=_gjInput;
  if(!gi.playerA||!gi.playerB){alert('스트리머 두 명을 선택하세요.');return;}
  if(!gi.games.length){alert('경기 결과를 1경기 이상 입력하세요.');return;}
  const sid=genId();
  const dateVal=gi.date||new Date().toISOString().slice(0,10);
  const newGames=gi.games.map(w=>({
    _id:genId(),sid,d:dateVal,
    wName:w==='A'?gi.playerA:gi.playerB,
    lName:w==='A'?gi.playerB:gi.playerA,
    map:'',
    ...(_gjProMode?{_proLabel:true}:{})
  }));
  // 개인 전적 반영
  newGames.forEach(m=>{
    applyGameResult(m.wName,m.lName,dateVal,'',sid,'','',_gjProMode?'프로리그끝장전':'끝장전');
  });
  gjM.unshift(...newGames);
  const p1w=gi.games.filter(g=>g==='A').length, p2w=gi.games.filter(g=>g==='B').length;
  const winner=p1w>p2w?gi.playerA:p2w>p1w?gi.playerB:'';
  _gjInput={date:gi.date,playerA:gi.playerA,playerB:gi.playerB,games:[]};
  save();
  gjSub='records';
  render();
  // 저장 직후 공유카드 열기 제안
  setTimeout(()=>{
    if(confirm(`✅ ${gi.games.length}경기 저장 완료!\n공유카드를 열겠습니까?`)){
      openGJShareCard(gi.playerA,gi.playerB,p1w,p2w,dateVal,winner,'gj');
    }
  },200);
}

function gjRankHTML(proOnly){
  const sc={};
  const vs={};
  const _gjSrc=proOnly?gjM.filter(m=>m._proLabel):gjM.filter(m=>!m._proLabel);
  _gjSrc.forEach(m=>{
    if(!sc[m.wName])sc[m.wName]={w:0,l:0};
    if(!sc[m.lName])sc[m.lName]={w:0,l:0};
    sc[m.wName].w++; sc[m.lName].l++;
    if(!vs[m.wName])vs[m.wName]={};
    if(!vs[m.wName][m.lName])vs[m.wName][m.lName]={w:0,l:0};
    vs[m.wName][m.lName].w++;
    if(!vs[m.lName])vs[m.lName]={};
    if(!vs[m.lName][m.wName])vs[m.lName][m.wName]={w:0,l:0};
    vs[m.lName][m.wName].l++;
  });
  if(!window._rankSort)window._rankSort={};
  const sk=window._rankSort['gj']||'rate';
  const sortBar=`<div class="sort-bar no-export" style="display:flex;align-items:center;gap:6px;margin-bottom:10px;flex-wrap:wrap"><button class="sort-btn ${sk==='rate'?'on':''}" onclick="window._rankSort['gj']='rate';render()">승률순</button><button class="sort-btn ${sk==='w'?'on':''}" onclick="window._rankSort['gj']='w';render()">승순</button><button class="sort-btn ${sk==='l'?'on':''}" onclick="window._rankSort['gj']='l';render()">패순</button></div>`;
  const entries=Object.entries(sc).filter(([,s])=>s.w+s.l>0).map(([name,s])=>({name,w:s.w,l:s.l,total:s.w+s.l,rate:s.w+s.l?Math.round(s.w/(s.w+s.l)*100):0}));
  entries.sort((a,b)=>sk==='w'?b.w-a.w||b.rate-a.rate:sk==='l'?b.l-a.l||a.rate-b.rate:b.rate-a.rate||b.w-a.w);
  if(!entries.length) return sortBar+`<div style="padding:30px;text-align:center;color:var(--gray-l)">기록 없음</div>`;
  if(!window._rankPage)window._rankPage={};
  const _PK='gj';
  const _PAGE=20;
  if(window._rankPage[_PK]===undefined)window._rankPage[_PK]=0;
  const _tot=entries.length;
  const _totP=Math.ceil(_tot/_PAGE)||1;
  if(window._rankPage[_PK]>=_totP)window._rankPage[_PK]=0;
  const _cp=window._rankPage[_PK];
  const _paged=_tot>_PAGE?entries.slice(_cp*_PAGE,(_cp+1)*_PAGE):entries;
  if(!window._gjVsOpen) window._gjVsOpen={};
  let h=sortBar+`<table><thead><tr><th>순위</th><th style="text-align:left">스트리머</th><th>승</th><th>패</th><th>승률</th><th style="text-align:left">상대 전적</th></tr></thead><tbody>`;
  _paged.forEach((p,i)=>{
    const pl=players.find(x=>x.name===p.name);
    // 총 대결 수 내림차순 정렬
    const vsEntries=Object.entries(vs[p.name]||{}).sort((a,b)=>(b[1].w+b[1].l)-(a[1].w+a[1].l)||(b[1].w-b[1].l)-(a[1].w-a[1].l));
    const mkVsSpan=([opp,r])=>{
      const col=r.w>r.l?'#16a34a':r.l>r.w?'#dc2626':'#6b7280';
      return `<span style="display:inline-flex;align-items:center;gap:3px;margin:1px 3px 1px 0;font-size:11px;white-space:nowrap">${getPlayerPhotoHTML(opp,'18px')}<span style="cursor:pointer;color:var(--blue)" onclick="openPlayerModal('${escJS(opp)}')">${opp}</span><span style="font-weight:700;color:${col}">${r.w}승${r.l}패</span></span>`;
    };
    const isOpen=!!window._gjVsOpen[p.name];
    const top3HTML=vsEntries.slice(0,3).map(mkVsSpan).join('');
    const rest=vsEntries.slice(3);
    const moreBtn=rest.length?`<span style="display:${isOpen?'inline':'none'}">${rest.map(mkVsSpan).join('')}</span><button onclick="event.stopPropagation();window._gjVsOpen['${escJS(p.name)}'] =!window._gjVsOpen['${escJS(p.name)}'];render()" style="font-size:10px;padding:1px 7px;border-radius:10px;border:1px solid var(--border2);background:var(--surface);cursor:pointer;color:var(--blue);margin-left:3px;white-space:nowrap">${isOpen?'▲ 접기':'▼ +'+rest.length+'명'}</button>`:'';
    const vsHTML=(top3HTML||moreBtn)?top3HTML+moreBtn:'<span style="color:var(--gray-l);font-size:11px">—</span>';
    const _ri=_cp*_PAGE+i;
    let rnk=_ri===0?`<span class="rk1">1등</span>`:_ri===1?`<span class="rk2">2등</span>`:_ri===2?`<span class="rk3">3등</span>`:`<span style="font-weight:900">${_ri+1}위</span>`;
    h+=`<tr>
      <td>${rnk}</td>
      <td style="text-align:left"><span style="display:inline-flex;align-items:center;gap:6px;cursor:pointer" onclick="openPlayerModal('${p.name.replace(/'/g,"\\'")}')">${getPlayerPhotoHTML(p.name,'34px')}<span style="font-weight:700;font-size:14px">${p.name}</span><span style="font-size:11px;color:var(--gray-l)">${pl?.univ||''}</span></span></td>
      <td class="wt">${p.w}</td><td class="lt">${p.l}</td>
      <td style="font-weight:700;color:${p.rate>=50?'#16a34a':'#dc2626'}">${p.rate}%</td>
      <td style="text-align:left;max-width:260px">${vsHTML}</td>
    </tr>`;
  });
  const _pageNav=_tot>_PAGE?`<div style="display:flex;justify-content:center;align-items:center;gap:10px;margin-top:12px;flex-wrap:wrap">
  <button class="btn btn-sm" ${_cp===0?'disabled':''} onclick="if(!window._rankPage)window._rankPage={};window._rankPage['${_PK}']=${_cp-1};render()">← 이전</button>
  <span style="font-size:12px;color:var(--gray-l)">${_cp+1} / ${_totP} (${_tot}명)</span>
  <button class="btn btn-sm" ${_cp>=_totP-1?'disabled':''} onclick="if(!window._rankPage)window._rankPage={};window._rankPage['${_PK}']=${_cp+1};render()">다음 →</button>
</div>`:'';
  return h+`</tbody></table>`+_pageNav;
}

function gjRecordsHTML(proOnly){
  // 끝장전 세션 → 팝업용 캐시
  window._gjSessCache = window._gjSessCache || {};
  window.openGJSessionPopup = window.openGJSessionPopup || function(sessKey){
    try{
      const s = (window._gjSessCache||{})[sessKey];
      if(!s || !s.games || !s.games.length) return;
      const A = s.p1 || 'A';
      const B = s.p2 || 'B';
      const games = (s.games||[]).map((it, idx)=>({
        _id: `${sessKey}_s0_g${idx}`,
        playerA: A,
        playerB: B,
        winner: it.wName===A ? 'A' : it.wName===B ? 'B' : '',
        map: it.map || ''
      })).filter(g=>g.winner);
      const sa = games.filter(g=>g.winner==='A').length;
      const sb = games.filter(g=>g.winner==='B').length;
      const winner = sa>sb?'A':sb>sa?'B':'';
      const mm = {
        _id: sessKey,
        d: s.d || '',
        a: A,
        b: B,
        sa, sb,
        _subLabel: s._proOnly ? '프로리그끝장전' : '끝장전',
        sets: [{ label: s._proOnly ? '프로리그 끝장전' : '끝장전', scoreA: sa, scoreB: sb, winner, games }]
      };
      const ca = (typeof gc==='function' ? (gc(A)||'#3b82f6') : '#3b82f6');
      const cb = (typeof gc==='function' ? (gc(B)||'#ef4444') : '#ef4444');
      const key = 'mid:'+String(sessKey);
      if(typeof _regDet==='function') _regDet(key, mm, 'gj', A, B, ca, cb, sa>sb, sb>sa);
      if(typeof openHistDetailModal==='function') openHistDetailModal(key);
    }catch(e){}
  };

  const _gjSrc=proOnly?gjM.filter(m=>m._proLabel):gjM.filter(m=>!m._proLabel);
  if(!_gjSrc.length) return `<div style="padding:30px;text-align:center;color:var(--gray-l)">기록 없음</div>`;
  // 세션 그룹화
  const sessions=[];
  const sidPairMap=new Map();
  let lastKey=null, lastSess=null;
  _gjSrc.forEach((m)=>{
    const pair=[m.wName,m.lName].sort();
    const k = m.sid ? `${m.sid}|${pair[0]}|${pair[1]}` : `${m.d||''}|${pair[0]}|${pair[1]}`;
    if(k!==lastKey||!lastSess){
      if(m.sid && sidPairMap.has(k)){
        // 같은 sid+페어 세션이 이미 존재하면 (비연속) 그쪽에 병합
        lastSess=sidPairMap.get(k);lastKey=k;
      } else {
        const s={key:k,d:m.d||'',p1:pair[0],p2:pair[1],games:[],ids:[]};
        sessions.push(s);lastSess=s;lastKey=k;
        if(m.sid) sidPairMap.set(k,s);
      }
    }
    lastSess.games.push(m);lastSess.ids.push(m._id);
  });
  sessions.forEach(s=>{const ds=s.games.map(g=>g.d||'').filter(Boolean).sort();if(ds.length)s.d=ds[ds.length-1];});
  let filteredSessGj=sessions.filter(s=>typeof passDateFilter!=='function'||passDateFilter(s.d||''));
  filteredSessGj.sort((a,b)=>recSortDir==='asc' ? (a.d||'').localeCompare(b.d||'') : (b.d||'').localeCompare(a.d||''));

  // 날짜(일자) 빠른 선택 메뉴(ASL 스타일) — 설정: su_date_menu_style
  const _dateMenuStyle = (localStorage.getItem('su_date_menu_style') || 'pill');
  const _datePickKey = proOnly ? 'su_rec_date_pick_hist_progj' : 'su_rec_date_pick_hist_gj';
  const _pickedDate = (localStorage.getItem(_datePickKey) || '').trim();
  const _baseSess = filteredSessGj.slice();
  const _allDates = Array.from(new Set(_baseSess.map(s=>String(s.d||'').trim()).filter(Boolean))).sort((a,b)=>b.localeCompare(a));
  if(_pickedDate && _allDates.includes(_pickedDate)){
    filteredSessGj = filteredSessGj.filter(s => String(s.d||'').trim() === _pickedDate);
  }
  const _dateMenuHTML = (()=>{
    if(_dateMenuStyle!=='asl' || !_allDates.length) return '';
    const daysS=['일','월','화','수','목','금','토'];
    const _pLine = (pName)=>{
      const pObj=players.find(x=>x.name===pName)||{};
      const univ=pObj.univ||'';
      const col=univ?gc(univ):'#64748b';
      return `<span style="display:inline-flex;align-items:center;gap:4px;min-width:0">
        ${getPlayerPhotoHTML(pName,'16px')}
        <span style="font-weight:900;font-size:10px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:88px">${pName}</span>
        ${pObj.tier?`<span style="transform:scale(.85);transform-origin:left center">${getTierBadge(pObj.tier)}</span>`:''}
        ${univ?`<span style="width:10px;height:10px;border-radius:3px;background:${col};display:inline-block;flex-shrink:0" title="${univ}"></span>`:''}
      </span>`;
    };
    const _mini = (s)=>`<div style="display:flex;align-items:center;gap:6px;font-size:10px;color:var(--text2);line-height:1.1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">
      <span style="flex:1;min-width:0">${_pLine(s.p1)}</span>
      <span style="color:var(--gray-l);font-weight:900;flex-shrink:0">vs</span>
      <span style="flex:1;min-width:0;display:flex;justify-content:flex-end">${_pLine(s.p2)}</span>
    </div>`;
    let h=`<div class="no-export" style="margin-bottom:10px;padding-bottom:10px;border-bottom:2px solid var(--border)">
      <div style="display:flex;gap:8px;overflow-x:auto;flex-wrap:nowrap;-webkit-overflow-scrolling:touch;scrollbar-width:none">`;
    const _onAll = !_pickedDate;
    h+=`<button type="button" onclick="localStorage.setItem('${_datePickKey}','');histPage['gj']=0;render()" style="flex-shrink:0;min-width:92px;padding:10px 12px;border-radius:12px;border:1px solid ${_onAll?'var(--blue)':'var(--border)'};background:${_onAll?'#eff6ff':'var(--surface)'};cursor:pointer;text-align:left">
      <div style="font-weight:1000;font-size:12px;color:${_onAll?'var(--blue)':'var(--text2)'}">전체</div>
      <div style="margin-top:6px;font-size:10px;color:var(--gray-l)">날짜 필터 해제</div>
    </button>`;
    _allDates.forEach(d0=>{
      const dt=new Date(d0+'T00:00:00');
      const label=`${daysS[dt.getDay()]} ${String(dt.getMonth()+1).padStart(2,'0')}/${String(dt.getDate()).padStart(2,'0')}`;
      const dayS=_baseSess.filter(s=>String(s.d||'').trim()===d0);
      const prev=dayS.length?`<div style="margin-top:6px;display:flex;flex-direction:column;gap:4px">${dayS.slice(0,2).map(_mini).join('')}</div>`:'';
      const on=(_pickedDate===d0);
      h+=`<button type="button" onclick="localStorage.setItem('${_datePickKey}','${d0}');histPage['gj']=0;render()" style="flex-shrink:0;text-align:left;min-width:170px;max-width:280px;padding:10px 12px;border-radius:12px;border:1px solid ${on?'var(--blue)':'var(--border)'};background:${on?'#eff6ff':'var(--surface)'};cursor:pointer">
        <div style="display:flex;align-items:center;gap:8px">
          <span style="font-weight:1000;font-size:12px;color:${on?'var(--blue)':'var(--text2)'}">${label}</span>
          <span style="margin-left:auto;font-size:10px;color:var(--gray-l);font-weight:900">${dayS.length?`세션 ${dayS.length}`:''}</span>
        </div>
        ${prev}
      </button>`;
    });
    h+=`</div></div>`;
    return h;
  })();

  const pageSize=getHistPageSize();
  const total=filteredSessGj.length;
  const totalPages=Math.ceil(total/pageSize)||1;
  if(histPage['gj']>=totalPages) histPage['gj']=Math.max(0,totalPages-1);
  const cur=histPage['gj'];
  const slice=total>pageSize?filteredSessGj.slice(cur*pageSize,(cur+1)*pageSize):filteredSessGj;
  const _gjBulkKey=proOnly?'pro_gj':'gj';
  const _gjBulkOn=isLoggedIn&&!!_bulkModes[_gjBulkKey];
  const _gjBulkDests=proOnly
    ?[{l:'⚔️ 일반 끝장전',d:'ungj'},{l:'🎮 개인전',d:'ind'}]
    :[{l:'🎮 개인전',d:'ind'},{l:'🏅 프로리그 끝장전',d:'progj'}];
  let h=isLoggedIn?`<div class="no-export" style="display:flex;align-items:center;justify-content:flex-end;margin-bottom:4px">
    <button onclick="toggleBulkMode('${_gjBulkKey}')" style="padding:3px 10px;border-radius:12px;border:1.5px solid ${_gjBulkOn?'#dc2626':'var(--border2)'};background:${_gjBulkOn?'#fff1f2':'var(--surface)'};color:${_gjBulkOn?'#dc2626':'var(--text3)'};font-size:11px;font-weight:700;cursor:pointer">${_gjBulkOn?'✕ 선택 해제':'☑ 일괄 선택'}</button>
  </div>`:'';
  h+=_dateMenuHTML;
  if(_gjBulkOn){
    h+=`<div class="no-export" style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;padding:7px 10px;background:#eff6ff;border:1.5px solid var(--blue);border-radius:8px;margin-bottom:6px">
      <label style="display:flex;align-items:center;gap:5px;font-size:12px;font-weight:700;cursor:pointer;color:var(--blue)">
        <input type="checkbox" id="bulk-all-${_gjBulkKey}" onchange="indBulkToggleAll('${_gjBulkKey}',this.checked)" style="width:14px;height:14px;cursor:pointer"> 전체
      </label>
      <span id="bulk-cnt-${_gjBulkKey}" style="font-size:11px;color:var(--blue);font-weight:700;min-width:64px">0개 선택됨</span>
      <span style="color:var(--border2)">│</span>
      ${_gjBulkDests.map(bd=>`<button onclick="bulkMoveInd('${_gjBulkKey}','${bd.d}')" style="padding:3px 12px;border-radius:12px;border:1.5px solid var(--blue);background:var(--blue);color:#fff;font-size:11px;font-weight:700;cursor:pointer">${bd.l}로 이동</button>`).join('')}
      <button onclick="bulkDeleteInd('${_gjBulkKey}')" style="padding:3px 12px;border-radius:12px;border:1.5px solid #dc2626;background:#dc2626;color:#fff;font-size:11px;font-weight:700;cursor:pointer">🗑️ 선택 삭제</button>
    </div>`;
  }
  slice.forEach(s=>{
    const p1wins=s.games.filter(m=>m.wName===s.p1).length;
    const p2wins=s.games.filter(m=>m.wName===s.p2).length;
    const winner=p1wins>p2wins?s.p1:(p2wins>p1wins?s.p2:'');
    const idsJson=JSON.stringify(s.ids).replace(/"/g,"'");
    const delBtn=isLoggedIn?`<button class="btn btn-r btn-xs" style="white-space:nowrap;justify-content:flex-start" onclick="deleteGjSession(${idsJson})">🗑️ 삭제</button>`:'';
    const editBtn=isLoggedIn?`<button class="btn btn-o btn-xs" style="white-space:nowrap;justify-content:flex-start" onclick="openEditGjSession(${idsJson},${proOnly?'true':'false'})">✏️ 수정</button>`:'';
    const _gjMoveCtx=proOnly?'pro_gj':'gj';
    const moveBtn=isLoggedIn?`<button class="btn btn-w btn-xs" style="white-space:nowrap;justify-content:flex-start" onclick="event.stopPropagation();window._pendingMoveIds=${idsJson};openMoveIndPop(this,window._pendingMoveIds,'${_gjMoveCtx}')">↗ 이동</button>`:'';
    const shareBtn=`<button class="btn btn-p btn-xs" style="white-space:nowrap;justify-content:flex-start" data-share-open="gj-session" data-p1="${encodeURIComponent(s.p1||'')}" data-p2="${encodeURIComponent(s.p2||'')}" data-sa="${p1wins}" data-sb="${p2wins}" data-d="${encodeURIComponent(s.d||'')}" data-winner="${encodeURIComponent(winner||'')}" data-mode="${proOnly?'progj':'gj'}">🎴 공유카드</button>`;
    const menuBtn=_sessionOverflowMenuHTML({ shareBtn, moveBtn, editBtn, deleteBtn: delBtn });
    const bulkDateBtn=''; // 요청: 날짜 버튼 삭제
    const bulkCbGj=_gjBulkOn?`<input type="checkbox" class="bulk-cb no-export" data-bkey="${_gjBulkKey}" data-bids="${idsJson}" onchange="_indBulkCountUpdate('${_gjBulkKey}')" onclick="event.stopPropagation()" style="width:15px;height:15px;cursor:pointer;flex-shrink:0;accent-color:var(--blue)">`:'';
    // 세션ID(팝업용) 생성 + 캐시 저장
    const _sidRaw = (s.games.find(x=>x && x.sid)?.sid) || s.key || `${s.d||''}|${s.p1||''}|${s.p2||''}`;
    const _sessKey = ('gjs_' + String(_sidRaw).replace(/[^\w\-]/g,'_')).slice(0,120);
    window._gjSessCache[_sessKey] = {...s, _proOnly: !!proOnly};

    h+=`<div style="border:1px solid var(--border);border-radius:10px;margin-bottom:8px;overflow:visible;background:var(--white);position:relative">
      <div style="padding:10px 14px;cursor:pointer;display:flex;align-items:center;gap:10px;flex-wrap:wrap;background:#f1f5f9;justify-content:var(--rc-vs-justify,flex-start)" onclick="openGJSessionPopup('${_sessKey}')">${bulkCbGj}
        <span style="font-size:12px;font-weight:600;color:${s.d?'var(--text3)':'#f59e0b'};min-width:80px">${s.d||'날짜 미정'}</span>
        <span style="display:inline-flex;align-items:center;gap:4px">${getPlayerPhotoHTML(s.p1,'28px')}<span style="font-weight:800;font-size:15px;cursor:pointer;color:var(--blue)" onclick="event.stopPropagation();openPlayerModal('${s.p1.replace(/'/g,"\\'")}')">${s.p1}</span><span style="font-size:11px;color:var(--gray-l)">${players.find(x=>x.name===s.p1)?.univ||''}</span></span>
        <span class="score-click" style="font-size:13px;font-weight:1000;color:var(--blue);display:inline-block;transform:scale(var(--rc-score-scale,1));transform-origin:center;text-decoration:underline;text-underline-offset:3px;text-decoration-style:dotted">${p1wins} - ${p2wins}</span>
        <span style="display:inline-flex;align-items:center;gap:4px"><span style="font-weight:800;font-size:15px;cursor:pointer;color:var(--blue)" onclick="event.stopPropagation();openPlayerModal('${s.p2.replace(/'/g,"\\'")}')">${s.p2}</span><span style="font-size:11px;color:var(--gray-l)">${players.find(x=>x.name===s.p2)?.univ||''}</span>${getPlayerPhotoHTML(s.p2,'28px')}</span>
        ${winner?`<span style="font-size:11px;color:#16a34a;font-weight:700">(${winner} 승)</span>`:''}
        <span style="font-size:11px;color:var(--gray-l)">${s.games.length}경기</span>
        <span style="margin-left:auto;display:flex;gap:4px" onclick="event.stopPropagation()">${menuBtn}</span>
      </div>
    </div>`;
  });
  if(totalPages>1){
    h+=`<div style="display:flex;align-items:center;justify-content:center;gap:6px;padding:14px 0;flex-wrap:wrap">`;
    h+=`<button class="btn btn-w btn-xs" style="min-width:32px" onclick="histPage['gj']=0;render()" ${cur===0?'disabled':''}>«</button>`;
    h+=`<button class="btn btn-w btn-xs" style="min-width:32px" onclick="histPage['gj']=Math.max(0,${cur}-1);render()" ${cur===0?'disabled':''}>‹</button>`;
    let s2=Math.max(0,cur-3),e2=Math.min(totalPages-1,s2+6);if(e2-s2<6)s2=Math.max(0,e2-6);
    for(let p=s2;p<=e2;p++) h+=`<button class="btn ${p===cur?'btn-b':'btn-w'} btn-xs" style="min-width:32px" onclick="histPage['gj']=${p};render()">${p+1}</button>`;
    h+=`<button class="btn btn-w btn-xs" style="min-width:32px" onclick="histPage['gj']=Math.min(${totalPages-1},${cur}+1);render()" ${cur===totalPages-1?'disabled':''}>›</button>`;
    h+=`<button class="btn btn-w btn-xs" style="min-width:32px" onclick="histPage['gj']=${totalPages-1};render()" ${cur===totalPages-1?'disabled':''}>»</button>`;
    h+=`<span style="font-size:11px;color:var(--text3);margin-left:6px">${cur+1} / ${totalPages}</span></div>`;
  }
  return h;
}

function bulkEditGjDate(idsJson, curDate){
  const nd=prompt('날짜 일괄 변경 (YYYY-MM-DD)', curDate||'');
  if(nd===null)return;
  const ids=JSON.parse(idsJson.replace(/'/g,'"'));
  gjM.forEach(m=>{if(ids.includes(m._id))m.d=nd;});
  save();render();
}

