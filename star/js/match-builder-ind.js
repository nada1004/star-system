/* match-builder-ind.js: extracted from match-builder.js */
/* ══════════════════════════════════════
   개인전
══════════════════════════════════════ */
let _indInput={date:'',playerA:'',playerB:'',games:[]};
let _indEditingIds=null;

function rInd(C,T){
  T.innerText='🎮 개인전';
  const _enableSubFilter = (localStorage.getItem('su_submenu_filter_enabled') ?? '1') === '1';
  const _lockOpen = (localStorage.getItem('su_filter_lock_open') ?? '1') === '1';
  if(window._indFilterOpen===undefined) window._indFilterOpen=_lockOpen;
  if(_lockOpen) window._indFilterOpen=true;
  if(!isLoggedIn && indSub==='input') indSub='records';
  const subOpts=[
    {id:'input',lbl:'📝 경기 입력',fn:`indSub='input';render()`},
    {id:'rank',lbl:'🏆 순위',fn:`indSub='rank';render()`},
    {id:'records',lbl:'📋 기록',fn:`indSub='records';render()`}
  ];
  let h='';
  if(_enableSubFilter && !_lockOpen){
    h+=`<div class="fbar no-export" style="overflow-x:auto;flex-wrap:nowrap;-webkit-overflow-scrolling:touch;scrollbar-width:none;gap:4px;margin-bottom:6px;align-items:center">
      <button class="pill ${window._indFilterOpen?'on':''}" style="flex-shrink:0;white-space:nowrap" onclick="window._indFilterOpen=!window._indFilterOpen;render()">🔍 필터 ${window._indFilterOpen?'▲':'▼'}</button>
    </div>`;
  }
  if(!_enableSubFilter || window._indFilterOpen){
    // (요청사항) 하위메뉴(순위/기록) 바로 우측에 연/월 + 최신/오래된순을 한 줄로 배치
    const extra = (indSub!=='input' && typeof buildYearMonthFilterControls==='function')
      ? (buildYearMonthFilterControls('ind', true)
        + `<button class="pill ${recSortDir==='desc'?'on':''}" style="flex-shrink:0;white-space:nowrap" onclick="recSortDir='desc';render()">최신순 ↓</button>`
        + `<button class="pill ${recSortDir==='asc'?'on':''}" style="flex-shrink:0;white-space:nowrap" onclick="recSortDir='asc';render()">오래된순 ↑</button>`)
      : '';
    h+=typeof stabsInline==='function' ? stabsInline(indSub, subOpts, extra) : stabs(indSub, subOpts) + (extra?`<div>${extra}</div>`:'');
  }
  if(indSub==='input'&&isLoggedIn){
    h+=indInputHTML();
  } else if(indSub==='rank'){
    h+=indRankHTML();
  } else {
    h+=indRecordsHTML();
  }
  C.innerHTML=h;
}

function indRankHTML(){
  const sc={};const vs={};
  players.forEach(p=>{sc[p.name]={w:0,l:0};});
  const _indFiltered=typeof passDateFilter==='function'?indM.filter(m=>passDateFilter(m.d||'')):indM;
  _indFiltered.forEach(m=>{
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
  const sk=window._rankSort['ind']||'rate';
  const sortBar=`<div class="sort-bar no-export" style="display:flex;align-items:center;gap:6px;margin-bottom:10px;flex-wrap:wrap"><button class="sort-btn ${sk==='rate'?'on':''}" onclick="window._rankSort['ind']='rate';render()">승률순</button><button class="sort-btn ${sk==='w'?'on':''}" onclick="window._rankSort['ind']='w';render()">승순</button><button class="sort-btn ${sk==='l'?'on':''}" onclick="window._rankSort['ind']='l';render()">패순</button></div>`;
  const entries=Object.entries(sc).filter(([,s])=>s.w+s.l>0).map(([name,s])=>({name,w:s.w,l:s.l,total:s.w+s.l,rate:s.w+s.l?Math.round(s.w/(s.w+s.l)*100):0}));
  entries.sort((a,b)=>sk==='w'?b.w-a.w||b.rate-a.rate:sk==='l'?b.l-a.l||a.rate-b.rate:b.rate-a.rate||b.w-a.w);
  if(!entries.length) return sortBar+`<div style="padding:30px;text-align:center;color:var(--gray-l)">기록 없음</div>`;
  if(!window._rankPage)window._rankPage={};
  const _PK='ind';
  const _PAGE=20;
  if(window._rankPage[_PK]===undefined)window._rankPage[_PK]=0;
  const _tot=entries.length;
  const _totP=Math.ceil(_tot/_PAGE)||1;
  if(window._rankPage[_PK]>=_totP)window._rankPage[_PK]=0;
  const _cp=window._rankPage[_PK];
  const _paged=_tot>_PAGE?entries.slice(_cp*_PAGE,(_cp+1)*_PAGE):entries;
  let h=sortBar+`<table><thead><tr><th>순위</th><th style="text-align:left">스트리머</th><th>승</th><th>패</th><th>승률</th><th style="text-align:left">상대 전적</th></tr></thead><tbody>`;
  _paged.forEach((p,i)=>{
    const pl=players.find(x=>x.name===p.name);
    const vsEntries=Object.entries(vs[p.name]||{}).sort((a,b)=>(b[1].w-b[1].l)-(a[1].w-a[1].l));
    const mkVsSpan=([opp,r])=>{
      const col=r.w>r.l?'#16a34a':r.l>r.w?'#dc2626':'#6b7280';
      return `<span style="display:inline-flex;align-items:center;gap:3px;margin:1px 3px 1px 0;font-size:11px">${getPlayerPhotoHTML(opp,'18px')}<span style="cursor:pointer;color:var(--blue)" onclick="openPlayerModal('${escJS(opp)}')">${opp}</span><span style="font-weight:700;color:${col}">${r.w}승${r.l}패</span></span>`;
    };
    const vsTop=vsEntries.slice(0,3).map(mkVsSpan).join('');
    const vsRest=vsEntries.slice(3);
    const uid=`indvs_${_cp}_${i}`;
    const vsHTML=!vsEntries.length?''
      : vsRest.length===0 ? vsTop
      : vsTop
        +`<span id="${uid}_m" style="display:none">${vsRest.map(mkVsSpan).join('')}</span>`
        +`<button id="${uid}_b" onclick="var m=document.getElementById('${uid}_m'),b=document.getElementById('${uid}_b');if(m.style.display==='none'){m.style.display='inline';b.textContent='접기'}else{m.style.display='none';b.textContent='+${vsRest.length}명 더보기'}" style="font-size:10px;color:var(--blue);background:none;border:1px solid var(--blue-ll);border-radius:8px;padding:1px 7px;cursor:pointer;margin-left:2px;white-space:nowrap">+${vsRest.length}명 더보기</button>`;
    const _ri=_cp*_PAGE+i;
    let rnk=_ri===0?`<span class="rk1">1등</span>`:_ri===1?`<span class="rk2">2등</span>`:_ri===2?`<span class="rk3">3등</span>`:`<span style="font-weight:900">${_ri+1}위</span>`;
    h+=`<tr>
      <td>${rnk}</td>
      <td style="text-align:left"><span style="display:inline-flex;align-items:center;gap:6px;cursor:pointer" onclick="openPlayerModal('${escJS(p.name)}')">${getPlayerPhotoHTML(p.name,'34px')}<span style="font-weight:700;font-size:14px">${p.name}</span><span style="font-size:11px;color:var(--gray-l)">${pl?.univ||''}</span></span></td>
      <td class="wt">${p.w}</td><td class="lt">${p.l}</td>
      <td style="font-weight:700;color:${p.rate>=50?'#16a34a':'#dc2626'}">${p.rate}%</td>
      <td style="text-align:left;min-width:120px">${vsHTML||'<span style="color:var(--gray-l);font-size:11px">—</span>'}</td>
    </tr>`;
  });
  const _pageNav=_tot>_PAGE?`<div style="display:flex;justify-content:center;align-items:center;gap:10px;margin-top:12px;flex-wrap:wrap">
  <button class="btn btn-sm" ${_cp===0?'disabled':''} onclick="if(!window._rankPage)window._rankPage={};window._rankPage['${_PK}']=${_cp-1};render()">← 이전</button>
  <span style="font-size:12px;color:var(--gray-l)">${_cp+1} / ${_totP} (${_tot}명)</span>
  <button class="btn btn-sm" ${_cp>=_totP-1?'disabled':''} onclick="if(!window._rankPage)window._rankPage={};window._rankPage['${_PK}']=${_cp+1};render()">다음 →</button>
</div>`:'';
  return h+`</tbody></table>`+_pageNav;
}

function indRecordsHTML(){
  if(!indM.length) return `<div style="padding:30px;text-align:center;color:var(--gray-l)">기록 없음</div>`;
  // 세션 그룹화: sid+페어 기준 (비연속 병합), 없으면 연속+날짜+페어 기준
  const sessions=[];
  const sidPairMap=new Map();
  let lastKey=null, lastSess=null;
  indM.forEach((m)=>{
    const pair=[m.wName,m.lName].sort();
    const k = m.sid ? `${m.sid}|${pair[0]}|${pair[1]}` : `${m.d||''}|${pair[0]}|${pair[1]}`;
    if(k!==lastKey||!lastSess){
      if(m.sid && sidPairMap.has(k)){
        lastSess=sidPairMap.get(k);lastKey=k;
      } else {
        const s={key:k,d:m.d||'',p1:pair[0],p2:pair[1],games:[],ids:[]};
        sessions.push(s);lastSess=s;lastKey=k;
        if(m.sid) sidPairMap.set(k,s);
      }
    }
    lastSess.games.push(m);lastSess.ids.push(m._id);
  });
  // 비연속 병합된 세션의 날짜를 가장 최신 게임 날짜로 업데이트
  sessions.forEach(s=>{const ds=s.games.map(g=>g.d||'').filter(Boolean).sort();if(ds.length)s.d=ds[ds.length-1];});
  // 날짜 필터 적용
  let filteredSess=sessions.filter(s=>typeof passDateFilter!=='function'||passDateFilter(s.d||''));
  filteredSess.sort((a,b)=>recSortDir==='asc' ? (a.d||'').localeCompare(b.d||'') : (b.d||'').localeCompare(a.d||''));

  // 날짜(일자) 빠른 선택 메뉴(ASL 스타일) — 설정: su_date_menu_style
  const _dateMenuStyle = (localStorage.getItem('su_date_menu_style') || 'pill');
  const _datePickKey = 'su_rec_date_pick_hist_ind';
  const _pickedDate = (localStorage.getItem(_datePickKey) || '').trim();
  const _baseSess = filteredSess.slice();
  const _allDates = Array.from(new Set(_baseSess.map(s=>String(s.d||'').trim()).filter(Boolean))).sort((a,b)=>recSortDir==='asc'?a.localeCompare(b):b.localeCompare(a));
  if(_pickedDate && _allDates.includes(_pickedDate)){
    filteredSess = filteredSess.filter(s => String(s.d||'').trim() === _pickedDate);
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
    h+=`<button type="button" onclick="localStorage.setItem('${_datePickKey}','');histPage['ind']=0;render()" style="flex-shrink:0;min-width:92px;padding:10px 12px;border-radius:12px;border:1px solid ${_onAll?'var(--blue)':'var(--border)'};background:${_onAll?'#eff6ff':'var(--surface)'};cursor:pointer;text-align:left">
      <div style="font-weight:1000;font-size:12px;color:${_onAll?'var(--blue)':'var(--text2)'}">전체</div>
      <div style="margin-top:6px;font-size:10px;color:var(--gray-l)">날짜 필터 해제</div>
    </button>`;
    _allDates.forEach(d0=>{
      const dt=new Date(d0+'T00:00:00');
      const label=`${daysS[dt.getDay()]} ${String(dt.getMonth()+1).padStart(2,'0')}/${String(dt.getDate()).padStart(2,'0')}`;
      const dayS=_baseSess.filter(s=>String(s.d||'').trim()===d0);
      const prev=dayS.length?`<div style="margin-top:6px;display:flex;flex-direction:column;gap:4px">${dayS.slice(0,2).map(_mini).join('')}</div>`:'';
      const on=(_pickedDate===d0);
      h+=`<button type="button" onclick="localStorage.setItem('${_datePickKey}','${d0}');histPage['ind']=0;render()" style="flex-shrink:0;text-align:left;min-width:170px;max-width:280px;padding:10px 12px;border-radius:12px;border:1px solid ${on?'var(--blue)':'var(--border)'};background:${on?'#eff6ff':'var(--surface)'};cursor:pointer">
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
  const total=filteredSess.length;
  const totalPages=Math.ceil(total/pageSize)||1;
  if(histPage['ind']>=totalPages) histPage['ind']=Math.max(0,totalPages-1);
  const cur=histPage['ind'];
  const slice=total>pageSize?filteredSess.slice(cur*pageSize,(cur+1)*pageSize):filteredSess;
  const _indBulkOn=isLoggedIn&&!!_bulkModes['ind'];
  let h=isLoggedIn?`<div class="no-export" style="display:flex;align-items:center;justify-content:flex-end;margin-bottom:4px">
    <button onclick="toggleBulkMode('ind')" style="padding:3px 10px;border-radius:12px;border:1.5px solid ${_indBulkOn?'#dc2626':'var(--border2)'};background:${_indBulkOn?'#fff1f2':'var(--surface)'};color:${_indBulkOn?'#dc2626':'var(--text3)'};font-size:11px;font-weight:700;cursor:pointer">${_indBulkOn?'✕ 선택 해제':'☑ 일괄 선택'}</button>
  </div>`:'';
  h+=_dateMenuHTML;
  if(_indBulkOn){
    h+=`<div class="no-export" style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;padding:7px 10px;background:#eff6ff;border:1.5px solid var(--blue);border-radius:8px;margin-bottom:6px">
      <label style="display:flex;align-items:center;gap:5px;font-size:12px;font-weight:700;cursor:pointer;color:var(--blue)">
        <input type="checkbox" id="bulk-all-ind" onchange="indBulkToggleAll('ind',this.checked)" style="width:14px;height:14px;cursor:pointer"> 전체
      </label>
      <span id="bulk-cnt-ind" style="font-size:11px;color:var(--blue);font-weight:700;min-width:64px">0개 선택됨</span>
      <span style="color:var(--border2)">│</span>
      <button onclick="bulkMoveInd('ind','gj')" style="padding:3px 12px;border-radius:12px;border:1.5px solid var(--blue);background:var(--blue);color:#fff;font-size:11px;font-weight:700;cursor:pointer">⚔️ 끝장전으로 이동</button>
      <button onclick="bulkMoveInd('ind','progj')" style="padding:3px 12px;border-radius:12px;border:1.5px solid #7c3aed;background:#7c3aed;color:#fff;font-size:11px;font-weight:700;cursor:pointer">🏅 프로리그 끝장전으로 이동</button>
      <button onclick="bulkDeleteInd('ind')" style="padding:3px 12px;border-radius:12px;border:1.5px solid #dc2626;background:#dc2626;color:#fff;font-size:11px;font-weight:700;cursor:pointer">🗑️ 선택 삭제</button>
    </div>`;
  }
  slice.forEach(s=>{
    const p1wins=s.games.filter(m=>m.wName===s.p1).length;
    const p2wins=s.games.filter(m=>m.wName===s.p2).length;
    const winner=p1wins>p2wins?s.p1:(p2wins>p1wins?s.p2:'');
    const idsJson=JSON.stringify(s.ids).replace(/"/g,"'");
    const delBtn=isLoggedIn?`<button class="btn btn-r btn-xs" style="white-space:nowrap;justify-content:flex-start" onclick="deleteIndSession(${idsJson})">🗑️ 삭제</button>`:'';
    const editBtn=isLoggedIn?`<button class="btn btn-o btn-xs" style="white-space:nowrap;justify-content:flex-start" onclick="openEditIndSession(${idsJson})">✏️ 수정</button>`:'';
    const moveBtn=isLoggedIn?`<button class="btn btn-w btn-xs" style="white-space:nowrap;justify-content:flex-start" onclick="event.stopPropagation();window._pendingMoveIds=${idsJson};openMoveIndPop(this,window._pendingMoveIds,'ind')">↗ 이동</button>`:'';
    const _sIdsJson=encodeURIComponent(JSON.stringify(s.ids));
    const shareBtn=`<button class="btn btn-b btn-xs" style="white-space:nowrap;justify-content:flex-start" data-share-open="ind-session" data-p1="${encodeURIComponent(s.p1||'')}" data-p2="${encodeURIComponent(s.p2||'')}" data-sa="${p1wins}" data-sb="${p2wins}" data-d="${encodeURIComponent(s.d||'')}" data-winner="${encodeURIComponent(winner||'')}" data-ids="${_sIdsJson}">📷 공유카드</button>`;
    const menuBtn=_sessionOverflowMenuHTML({ shareBtn, moveBtn, editBtn, deleteBtn: delBtn });
    const bulkCbInd=_indBulkOn?`<input type="checkbox" class="bulk-cb no-export" data-bkey="ind" data-bids="${idsJson}" onchange="_indBulkCountUpdate('ind')" onclick="event.stopPropagation()" style="width:15px;height:15px;cursor:pointer;flex-shrink:0;accent-color:var(--blue)">`:'';
    h+=`<details style="border:1px solid var(--border);border-radius:8px;margin-bottom:8px;overflow:visible">
      <summary style="padding:10px 14px;cursor:pointer;display:flex;align-items:center;gap:10px;flex-wrap:wrap;list-style:none;background:var(--bg2);justify-content:var(--rc-vs-justify,flex-start)">${bulkCbInd}
        <span style="font-size:12px;font-weight:600;color:${s.d?'var(--text3)':'#f59e0b'};min-width:80px">${s.d||'날짜 미정'}</span>
        <span style="display:inline-flex;align-items:center;gap:4px">${getPlayerPhotoHTML(s.p1,'28px')}<span style="font-weight:700;font-size:14px;cursor:pointer;color:var(--blue)" onclick="event.stopPropagation();openPlayerModal('${escJS(s.p1)}')">${s.p1}</span><span style="font-size:10px;color:var(--gray-l)">${players.find(x=>x.name===s.p1)?.univ||''}</span></span>
        <span style="font-size:13px;font-weight:900;color:var(--blue);display:inline-block;transform:scale(var(--rc-score-scale,1));transform-origin:center">${p1wins} - ${p2wins}</span>
        <span style="display:inline-flex;align-items:center;gap:4px"><span style="font-weight:700;font-size:14px;cursor:pointer;color:var(--blue)" onclick="event.stopPropagation();openPlayerModal('${escJS(s.p2)}')">${s.p2}</span><span style="font-size:10px;color:var(--gray-l)">${players.find(x=>x.name===s.p2)?.univ||''}</span>${getPlayerPhotoHTML(s.p2,'28px')}</span>
        ${winner?`<span style="font-size:11px;color:#16a34a;font-weight:700">(${winner} 승)</span>`:''}
        <span style="font-size:11px;color:var(--gray-l)">${s.games.length}경기</span>
        <span style="margin-left:auto;display:flex;gap:4px">${menuBtn}</span>
      </summary>
      <table style="margin:0;border-radius:0"><thead><tr><th style="text-align:left">경기</th><th style="text-align:right">${s.p1}</th><th style="text-align:center;color:var(--gray-l)">vs</th><th style="text-align:left">${s.p2}</th><th style="text-align:left">맵</th>${isLoggedIn?'<th>관리</th>':''}</tr></thead><tbody>`;
    s.games.forEach((m,gi)=>{
      const origIdx=indM.findIndex(x=>x._id===m._id);
      const p1win=m.wName===s.p1;
      const p1photo=getPlayerPhotoHTML(s.p1,'22px',`vertical-align:middle;flex-shrink:0${p1win?'':';filter:blur(1px) grayscale(.2);opacity:.45'}`);
      const p2photo=getPlayerPhotoHTML(s.p2,'22px',`vertical-align:middle;flex-shrink:0${p1win?';filter:blur(1px) grayscale(.2);opacity:.45':''}`);
      h+=`<tr>
        <td style="font-size:11px;color:var(--gray-l)">${gi+1}경기${m._teamMatchType?` <span style="background:#7c3aed;color:#fff;font-size:9px;font-weight:800;padding:0 4px;border-radius:3px;vertical-align:middle">${m._teamMatchType.replace('v',':')+'전'}</span>`:''}</td>
        <td style="text-align:right"><span style="display:inline-flex;align-items:center;justify-content:flex-end;gap:4px">${p1photo}<span style="font-weight:${p1win?'900':'400'};color:${p1win?'var(--blue)':'#aaa'};cursor:pointer" onclick="openPlayerModal('${escJS(s.p1)}')">${s.p1}</span></span></td>
        <td style="text-align:center;font-size:10px;color:var(--gray-l)">vs</td>
        <td><span style="display:inline-flex;align-items:center;gap:4px">${p2photo}<span style="font-weight:${p1win?'400':'900'};color:${p1win?'#aaa':'var(--blue)'};cursor:pointer" onclick="openPlayerModal('${escJS(s.p2)}')">${s.p2}</span></span></td>
        <td style="font-size:11px">${m.map && m.map !== '-' ? m.map : ''}${m.memo?`<span style="font-size:10px;color:var(--gray-l);margin-left:4px">${m.memo.replace(/</g,'&lt;')}</span>`:''}</td>
        ${isLoggedIn?`<td style="display:flex;gap:4px"><button class="btn btn-r btn-xs" onclick="_removeIndResult('${escJS(m.wName)}','${escJS(m.lName)}','${escJS(m.d||'')}','${escJS(m.map||'-')}','${escJS(m._id||'')}');indM.splice(${origIdx},1);save();render()">🗑️ 삭제</button></td>`:''}
      </tr>`;
    });
    h+=`</tbody></table></details>`;
  });
  if(totalPages>1){
    h+=`<div style="display:flex;align-items:center;justify-content:center;gap:6px;padding:14px 0;flex-wrap:wrap">`;
    h+=`<button class="btn btn-w btn-xs" style="min-width:32px" onclick="histPage['ind']=0;render()" ${cur===0?'disabled':''}>«</button>`;
    h+=`<button class="btn btn-w btn-xs" style="min-width:32px" onclick="histPage['ind']=Math.max(0,${cur}-1);render()" ${cur===0?'disabled':''}>‹</button>`;
    let s2=Math.max(0,cur-3),e2=Math.min(totalPages-1,s2+6);if(e2-s2<6)s2=Math.max(0,e2-6);
    for(let p=s2;p<=e2;p++) h+=`<button class="btn ${p===cur?'btn-b':'btn-w'} btn-xs" style="min-width:32px" onclick="histPage['ind']=${p};render()">${p+1}</button>`;
    h+=`<button class="btn btn-w btn-xs" style="min-width:32px" onclick="histPage['ind']=Math.min(${totalPages-1},${cur}+1);render()" ${cur===totalPages-1?'disabled':''}>›</button>`;
    h+=`<button class="btn btn-w btn-xs" style="min-width:32px" onclick="histPage['ind']=${totalPages-1};render()" ${cur===totalPages-1?'disabled':''}>»</button>`;
    h+=`<span style="font-size:11px;color:var(--text3);margin-left:6px">${cur+1} / ${totalPages}</span></div>`;
  }
  return h;
}

function _removeIndResult(wName, lName, date, map, matchId){
  const w=players.find(p=>p.name===wName);
  const l=players.find(p=>p.name===lName);
  if(!w||!l)return;
  if(!w.history)w.history=[];
  if(!l.history)l.history=[];
  const nm=v=>(!v||v==='-')?'-':v;
  let wi=matchId?w.history.findIndex(h=>h.matchId===matchId&&h.result==='승'&&h.opp===lName):-1;
  if(wi<0)wi=w.history.findIndex(h=>h.result==='승'&&h.opp===lName&&h.date===(date||'')&&nm(h.map)===nm(map));
  let delta=0;
  if(wi>=0){delta=w.history[wi].eloDelta||0;w.history.splice(wi,1);}
  let li=matchId?l.history.findIndex(h=>h.matchId===matchId&&h.result==='패'&&h.opp===wName):-1;
  if(li<0)li=l.history.findIndex(h=>h.result==='패'&&h.opp===wName&&h.date===(date||'')&&nm(h.map)===nm(map));
  if(li>=0)l.history.splice(li,1);
  if(wi>=0||li>=0){
    if(w.win>0)w.win--;if(l.loss>0)l.loss--;
    w.points-=3;l.points+=3;
    if(delta){w.elo=(w.elo||ELO_DEFAULT)-delta;l.elo=(l.elo||ELO_DEFAULT)+delta;}
  }
}
function deleteIndSession(ids){
  if(!confirm(`${ids.length}경기를 삭제하시겠습니까?`))return;
  indM.filter(m=>ids.includes(m._id)).forEach(m=>_removeIndResult(m.wName,m.lName,m.d||'',m.map||'-',m._id));
  indM=indM.filter(m=>!ids.includes(m._id));
  save();render();
}

function openEditIndSession(ids){
  if(!isLoggedIn) return alert('로그인이 필요합니다.');
  const games = indM.filter(m=>ids.includes(m._id));
  if(!games.length) return;
  const first = games[0];
  const pA = first.wName || '';
  const pB = first.lName || '';
  const pAObj=players.find(p=>p.name===pA)||{};
  const pBObj=players.find(p=>p.name===pB)||{};
  const dateVal = first.d || new Date().toISOString().slice(0,10);
  _indEditingIds = [...ids];
  _indInput = {
    date: dateVal,
    playerA: pA,
    playerB: pB,
    games: games.map(g=>({ winner:g.wName===pA?'A':'B', map:g.map||'' }))
  };
  BLD['ind'] = {
    date: dateVal,
    membersA:[{name:pA,univ:pAObj.univ||'',race:pAObj.race||'',tier:pAObj.tier||'',gender:pAObj.gender||''}],
    membersB:[{name:pB,univ:pBObj.univ||'',race:pBObj.race||'',tier:pBObj.tier||'',gender:pBObj.gender||''}],
    sets:[],
    noSetMode:true,
    freeGames: games.map(g=>({
      playerA:pA,
      playerB:pB,
      winner:g.wName===pA?'A':'B',
      map:g.map||''
    }))
  };
  indSub='input';
  render();
}

// 개인전/끝장전 세션 이동
function moveIndSession(idsArr, srcMode, destMode, _batch=false){
  const srcArr=(srcMode==='ind')?indM:gjM;
  const games=srcArr.filter(m=>idsArr.includes(m._id));
  if(!games.length)return;
  const sid=games[0].sid||games[0]._id;
  let newLabel='';

  if(destMode==='ind'){
    // → 개인전 배열
    idsArr.forEach(id=>{const idx=srcArr.findIndex(m=>m._id===id);if(idx>=0)srcArr.splice(idx,1);});
    games.forEach(g=>{delete g._proLabel;});
    indM.unshift(...games);
    newLabel='개인전';
  } else if(destMode==='gj'){
    // → 일반 끝장전 배열 (프로 레이블 제거)
    idsArr.forEach(id=>{const idx=srcArr.findIndex(m=>m._id===id);if(idx>=0)srcArr.splice(idx,1);});
    games.forEach(g=>{delete g._proLabel;});
    gjM.unshift(...games);
    newLabel='끝장전';
  } else if(destMode==='progj'){
    // → 프로리그 끝장전 (_proLabel=true, ind면 gjM으로 이동)
    if(srcMode==='ind'){
      idsArr.forEach(id=>{const idx=indM.findIndex(m=>m._id===id);if(idx>=0)indM.splice(idx,1);});
      games.forEach(g=>{g._proLabel=true;});
      gjM.unshift(...games);
    } else {
      games.forEach(g=>{g._proLabel=true;});
    }
    newLabel='프로리그';
  } else if(destMode==='ungj'){
    // 프로리그 끝장전 → 일반 끝장전 (레이블만 제거, gjM 유지)
    games.forEach(g=>{delete g._proLabel;});
    newLabel='끝장전';
  }

  if(newLabel){
    players.forEach(p=>(p.history||[]).forEach(h=>{
      if(h.matchId===sid||idsArr.includes(h.matchId))h.mode=newLabel;
    }));
  }
  if(!_batch){save();render();}
}

// ── 일괄 선택 이동 (개인전/끝장전) ──────────────────────────
function _indBulkCountUpdate(key){
  const n=[...document.querySelectorAll(`.bulk-cb[data-bkey="${key}"]:checked`)].length;
  const el=document.getElementById('bulk-cnt-'+key);
  if(el)el.textContent=n+'개 선택됨';
  const allCbs=document.querySelectorAll(`.bulk-cb[data-bkey="${key}"]`);
  const allChk=document.getElementById('bulk-all-'+key);
  if(allChk&&allCbs.length) allChk.indeterminate=n>0&&n<allCbs.length, allChk.checked=n===allCbs.length;
}
function indBulkToggleAll(key,checked){
  document.querySelectorAll(`.bulk-cb[data-bkey="${key}"]`).forEach(cb=>cb.checked=checked);
  _indBulkCountUpdate(key);
}
function bulkMoveInd(bulkKey,destMode){
  const cbs=[...document.querySelectorAll(`.bulk-cb[data-bkey="${bulkKey}"]:checked`)];
  if(!cbs.length){alert('선택된 세션이 없습니다.');return;}
  const allIds=cbs.map(cb=>JSON.parse(cb.dataset.bids.replace(/'/g,'"')));
  if(!confirm(allIds.length+'개 세션을 이동하시겠습니까?'))return;
  const srcMode=bulkKey==='ind'?'ind':'gj';
  allIds.forEach(ids=>moveIndSession(ids,srcMode,destMode,true));
  if(typeof _bulkModes!=='undefined') _bulkModes[bulkKey]=false;
  save();render();
}
function bulkDeleteInd(bulkKey){
  const cbs=[...document.querySelectorAll(`.bulk-cb[data-bkey="${bulkKey}"]:checked`)];
  if(!cbs.length){alert('선택된 세션이 없습니다.');return;}
  const allIds=cbs.flatMap(cb=>JSON.parse(cb.dataset.bids.replace(/'/g,'"')));
  if(!confirm(cbs.length+'개 세션('+allIds.length+'경기)을 삭제하시겠습니까?\n\n⚠️ 선수 성적에서 차감됩니다.'))return;
  const srcArr=bulkKey==='ind'?indM:gjM; // gj, pro_gj 모두 gjM
  srcArr.filter(m=>allIds.includes(m._id)).forEach(m=>_removeIndResult(m.wName,m.lName,m.d||'',m.map||'-',m._id));
  const keep=new Set(allIds);
  if(bulkKey==='ind') indM=indM.filter(m=>!keep.has(m._id));
  else gjM=gjM.filter(m=>!keep.has(m._id)); // gj, pro_gj 모두 gjM
  if(typeof _bulkModes!=='undefined') _bulkModes[bulkKey]=false;
  save();render();
}
// ─────────────────────────────────────────────────────────────

// 개인전/끝장전 이동 팝업
function openMoveIndPop(btn, idsArr, srcMode){
  const opts=[];
  if(srcMode==='ind'){
    opts.push({l:'⚔️ 끝장전으로 이동',fn:()=>moveIndSession(idsArr,'ind','gj')});
    opts.push({l:'🏅 프로리그 끝장전으로 이동',fn:()=>moveIndSession(idsArr,'ind','progj')});
  } else if(srcMode==='gj'){
    opts.push({l:'🎮 개인전으로 이동',fn:()=>moveIndSession(idsArr,'gj','ind')});
    opts.push({l:'🏅 프로리그 끝장전으로 이동',fn:()=>moveIndSession(idsArr,'gj','progj')});
  } else if(srcMode==='pro_gj'){
    opts.push({l:'⚔️ 일반 끝장전으로 이동',fn:()=>moveIndSession(idsArr,'pro_gj','ungj')});
    opts.push({l:'🎮 개인전으로 이동',fn:()=>moveIndSession(idsArr,'pro_gj','ind')});
  }
  if(typeof _showMovePop==='function') _showMovePop(btn,opts);
}

/* ══════════════════════════════════════
   개인전 직접 입력
══════════════════════════════════════ */
function indInputHTML(){
  const gi=_indInput;
  const pA=gi.playerA, pB=gi.playerB;
  const pAObj=players.find(p=>p.name===pA)||{};
  const pBObj=players.find(p=>p.name===pB)||{};
  const aCol=gc(pAObj.univ)||'#2563eb', bCol=gc(pBObj.univ)||'#dc2626';
  const today=new Date().toISOString().slice(0,10);
  if(pA&&pB){
    const paMem={name:pA,univ:pAObj.univ||'',race:pAObj.race||'',tier:pAObj.tier||'',gender:pAObj.gender||''};
    const pbMem={name:pB,univ:pBObj.univ||'',race:pBObj.race||'',tier:pBObj.tier||'',gender:pBObj.gender||''};
    if(!BLD['ind']||!BLD['ind'].membersA||!BLD['ind'].membersB||BLD['ind'].membersA[0]?.name!==pA||BLD['ind'].membersB[0]?.name!==pB){
      BLD['ind']={date:gi.date||today,membersA:[paMem],membersB:[pbMem],sets:[],noSetMode:true,freeGames:[]};
    } else {
      if(gi.date&&BLD['ind'].date!==gi.date)BLD['ind'].date=gi.date;
      if(!gi.date&&!BLD['ind'].date)BLD['ind'].date=today;
    }
  } else {
    BLD['ind']=null;
  }
  return `<div class="match-builder"><h3>🎮 개인전 입력</h3>
    <div style="margin-bottom:12px;display:flex;align-items:center;gap:8px;flex-wrap:wrap">
      <button class="btn btn-p btn-sm" onclick="openIndPasteModal()" style="display:inline-flex;align-items:center;gap:5px">📋 자동인식</button>
      <button class="btn btn-w btn-sm" onclick="openIndBulkModal()" style="display:inline-flex;align-items:center;gap:5px">➕ 여러 경기 입력</button>
      <span style="font-size:11px;color:var(--gray-l)">텍스트 붙여넣기 지원</span>
    </div>
    <div style="background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:16px;margin-bottom:14px">
      <div style="font-size:12px;font-weight:700;color:var(--blue);margin-bottom:12px">① 날짜 & 대전 스트리머</div>
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:12px">
        <label style="font-size:12px;font-weight:700">날짜</label>
        <input type="date" value="${gi.date||''}" onchange="_indInput.date=this.value;if(BLD['ind'])BLD['ind'].date=this.value" style="padding:5px 8px;border:1px solid var(--border2);border-radius:6px;font-size:12px">
      </div>
      <div style="display:flex;gap:10px;flex-wrap:wrap">
        <div style="flex:1;min-width:140px">
          <div style="font-size:11px;font-weight:700;color:${aCol};margin-bottom:4px">🔵 A 스트리머</div>
          ${pA?`<div style="display:flex;align-items:center;gap:6px;padding:8px;background:${aCol}18;border:2px solid ${aCol};border-radius:8px">
            ${getPlayerPhotoHTML(pA,'28px')}<span style="font-weight:800;color:${aCol}">${pA}</span>
            <span style="font-size:10px;color:var(--gray-l)">${pAObj.univ||''}</span>
            <button onclick="_indInput.playerA='';BLD['ind']=null;render()" style="margin-left:auto;background:none;border:none;color:#94a3b8;cursor:pointer;font-size:12px">✕</button>
          </div>` : ''}
        </div>
        <div style="display:flex;align-items:center;font-weight:900;color:var(--gray-l);padding-top:20px">VS</div>
        <div style="flex:1;min-width:140px">
          <div style="font-size:11px;font-weight:700;color:${bCol};margin-bottom:4px">🔴 B 스트리머</div>
          ${pB?`<div style="display:flex;align-items:center;gap:6px;padding:8px;background:${bCol}18;border:2px solid ${bCol};border-radius:8px">
            ${getPlayerPhotoHTML(pB,'28px')}<span style="font-weight:800;color:${bCol}">${pB}</span>
            <span style="font-size:10px;color:var(--gray-l)">${pBObj.univ||''}</span>
            <button onclick="_indInput.playerB='';BLD['ind']=null;render()" style="margin-left:auto;background:none;border:none;color:#94a3b8;cursor:pointer;font-size:12px">✕</button>
          </div>` : ''}
        </div>
      </div>
      ${!(pA&&pB)?_matchPlayerAssignPoolHTML('ind'):''}
    </div>
    ${pA&&pB&&BLD['ind']?`<div style="background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:16px;margin-bottom:14px">
      <div style="font-size:12px;font-weight:700;color:var(--blue);margin-bottom:10px">② 경기 결과 입력</div>
      ${setBuilderHTML(BLD['ind'],'ind')}
    </div>`:''}
  </div>`;
}

/* ══════════════════════════════════════
   개인전 "여러 경기" 일괄 입력 (1:1 유지)
══════════════════════════════════════ */
window._indBulkRows = window._indBulkRows || null;
function _indBulkDefaultRow(){
  const today = new Date().toISOString().slice(0,10);
  return {date:(_indInput?.date||today), winner:'', loser:'', map:'', memo:''};
}
function openIndBulkModal(){
  if(!isLoggedIn) return alert('로그인이 필요합니다.');
  if(!window._indBulkRows || !Array.isArray(window._indBulkRows) || window._indBulkRows.length===0){
    window._indBulkRows = [_indBulkDefaultRow()];
  }
  _renderIndBulkModal();
}
function closeIndBulkModal(){
  const el=document.getElementById('_indBulkModal');
  if(el) el.remove();
}
function indBulkAddRow(){
  window._indBulkRows = window._indBulkRows || [];
  window._indBulkRows.push(_indBulkDefaultRow());
  _renderIndBulkModal(true);
}
function indBulkDelRow(i){
  window._indBulkRows = window._indBulkRows || [];
  window._indBulkRows.splice(i,1);
  if(window._indBulkRows.length===0) window._indBulkRows=[_indBulkDefaultRow()];
  _renderIndBulkModal(true);
}
function indBulkSet(i, field, val){
  window._indBulkRows = window._indBulkRows || [];
  if(!window._indBulkRows[i]) window._indBulkRows[i]=_indBulkDefaultRow();
  window._indBulkRows[i][field]=val;
}
function indBulkApply(){
  const rows = (window._indBulkRows||[]).map(r=>({
    date:String(r.date||'').trim(),
    winner:String(r.winner||'').trim(),
    loser:String(r.loser||'').trim(),
    map:String(r.map||'').trim(),
    memo:String(r.memo||'').trim(),
  })).filter(r=>r.winner||r.loser||r.map||r.memo||r.date);
  if(!rows.length) return alert('입력된 행이 없습니다.');
  const bad = rows.find(r=>!r.date||!r.winner||!r.loser||r.winner===r.loser);
  if(bad) return alert('날짜/승자/패자를 확인해주세요. (승자와 패자는 달라야 함)');
  if(!confirm(`총 ${rows.length}경기를 개인전에 추가할까요?`)) return;
  const newGames=[];
  rows.forEach(r=>{
    const id=genId();
    const sid=genId();
    const m={_id:id,sid,d:r.date,wName:r.winner,lName:r.loser,map:r.map||''};
    // 메모는 있으면 보관
    if(r.memo) m.memo = r.memo;
    try{ applyGameResult(m.wName,m.lName,r.date,'',m._id,'','','개인전'); }catch(e){}
    newGames.push(m);
  });
  indM.unshift(...newGames);
  save();
  window._indBulkRows = [_indBulkDefaultRow()];
  closeIndBulkModal();
  indSub='records';
  render();
}
function _renderIndBulkModal(keepScroll){
  let el=document.getElementById('_indBulkModal');
  const rows = window._indBulkRows || [];
  if(!el){
    el=document.createElement('div');
    el.id='_indBulkModal';
    el.className='modal no-export';
    el.style.cssText='display:flex;z-index:9999';
    el.onclick=(e)=>{ if(e.target===el) closeIndBulkModal(); };
    document.body.appendChild(el);
  }
  const listId='ind-bulk-player-list';
  const dl = (typeof players!=='undefined' ? players.map(p=>`<option value="${(p.name||'').replace(/"/g,'&quot;')}">`).join('') : '');
  const body = `
    <div class="mbox" style="width:min(760px,96vw);max-height:88vh;overflow:auto">
      <div class="mtitle">➕ 개인전 여러 경기 입력</div>
      <div style="font-size:11px;color:var(--gray-l);margin-bottom:10px">한 번에 여러 경기(1:1)를 추가합니다.</div>
      <datalist id="${listId}">${dl}</datalist>
      <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:10px">
        <button class="btn btn-w btn-sm" onclick="indBulkAddRow()">+ 행 추가</button>
        <button class="btn btn-b btn-sm" onclick="indBulkApply()">저장</button>
        <button class="btn btn-w btn-sm" onclick="closeIndBulkModal()">닫기</button>
      </div>
      <div style="overflow:auto;border:1px solid var(--border);border-radius:12px;background:var(--white)">
        <table style="width:100%;border-collapse:collapse;font-size:12px">
          <thead>
            <tr style="background:var(--surface);color:var(--text3);font-weight:900">
              <th style="padding:10px;text-align:left;white-space:nowrap;width:34px">#</th>
              <th style="padding:10px;text-align:left;white-space:nowrap">날짜</th>
              <th style="padding:10px;text-align:left;white-space:nowrap">승자</th>
              <th style="padding:10px;text-align:left;white-space:nowrap">패자</th>
              <th style="padding:10px;text-align:left;white-space:nowrap">맵</th>
              <th style="padding:10px;text-align:left;white-space:nowrap">메모</th>
              <th style="padding:10px;text-align:right;white-space:nowrap">삭제</th>
            </tr>
          </thead>
          <tbody>
            ${rows.map((r,i)=>`
              <tr style="border-top:1px solid var(--border)">
                <td style="padding:8px 10px;color:var(--gray-l);font-weight:900">${i+1}</td>
                <td style="padding:8px 10px"><input type="date" value="${(r.date||'').replace(/"/g,'&quot;')}" onchange="indBulkSet(${i},'date',this.value)" style="padding:6px 8px;border:1px solid var(--border2);border-radius:8px"></td>
                <td style="padding:8px 10px"><input list="${listId}" value="${(r.winner||'').replace(/"/g,'&quot;')}" onchange="indBulkSet(${i},'winner',this.value)" placeholder="승자" style="width:140px;padding:6px 8px;border:1px solid var(--border2);border-radius:8px"></td>
                <td style="padding:8px 10px"><input list="${listId}" value="${(r.loser||'').replace(/"/g,'&quot;')}" onchange="indBulkSet(${i},'loser',this.value)" placeholder="패자" style="width:140px;padding:6px 8px;border:1px solid var(--border2);border-radius:8px"></td>
                <td style="padding:8px 10px"><input value="${(r.map||'').replace(/"/g,'&quot;')}" onchange="indBulkSet(${i},'map',this.value)" placeholder="맵" style="width:120px;padding:6px 8px;border:1px solid var(--border2);border-radius:8px"></td>
                <td style="padding:8px 10px"><input value="${(r.memo||'').replace(/"/g,'&quot;')}" onchange="indBulkSet(${i},'memo',this.value)" placeholder="" style="width:220px;padding:6px 8px;border:1px solid var(--border2);border-radius:8px"></td>
                <td style="padding:8px 10px;text-align:right"><button class="btn btn-w btn-xs" onclick="indBulkDelRow(${i})">🗑</button></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
  const prevScroll = keepScroll ? el.querySelector('.mbox')?.scrollTop : 0;
  el.innerHTML = body;
  if(keepScroll){
    try{ el.querySelector('.mbox').scrollTop = prevScroll; }catch(e){}
  }
}

function indDirectSave(){
  const gi=_indInput;
  if(!gi.playerA||!gi.playerB){alert('스트리머 두 명을 선택하세요.');return;}
  if(!gi.games.length){alert('경기 결과를 1경기 이상 입력하세요.');return;}
  const sid=genId();
  const dateVal=gi.date||'';
  const newGames=gi.games.map(g=>({
    _id:genId(),sid,d:dateVal,
    wName:g.winner==='A'?gi.playerA:gi.playerB,
    lName:g.winner==='A'?gi.playerB:gi.playerA,
    map:g.map||''
  }));
  newGames.forEach(m=>{
    applyGameResult(m.wName,m.lName,dateVal,'',m._id,'','','개인전');
  });
  indM.unshift(...newGames);
  _indInput={date:gi.date,playerA:gi.playerA,playerB:gi.playerB,games:[]};
  save();
  indSub='records';
  render();
}

/* ══════════════════════════════════════
   개인전 공유카드
══════════════════════════════════════ */
function openIndShareCard(p1, p2, p1wins, p2wins, date, winner, idsJson) {
  try{
    const ids = idsJson ? JSON.parse(idsJson.replace(/'/g,'"')) : null;
    const games = ids
      ? indM.filter(m => ids.includes(m._id))
      : indM.filter(m => {
          const pair = [m.wName, m.lName].sort();
          const pair2 = [p1, p2].sort();
          return (m.d||'') === date && pair[0] === pair2[0] && pair[1] === pair2[1];
        });
    const shareObj = {
      a: p1||'',
      b: p2||'',
      wName: winner||'',
      lName: winner===p1 ? (p2||'') : (p1||''),
      sa: Number(p1wins||0),
      sb: Number(p2wins||0),
      d: date||'',
      _matchType: 'ind',
      _subLabel: '개인전',
      _shareCardStyle: 'solo-match',
      _usePlayerPhoto: true,
      sets: [{
        label:'개인전',
        scoreA:Number(p1wins||0),
        scoreB:Number(p2wins||0),
        winner: winner===p1 ? 'A' : winner===p2 ? 'B' : '',
        games: games.map(g=>({
          playerA:p1||'',
          playerB:p2||'',
          winner:g.wName===p1?'A':g.wName===p2?'B':'',
          map:g.map||''
        }))
      }]
    };
    if(typeof window.HistoryActionUtils?.normalizeMatchShareObjForCard === 'function' &&
       typeof window.HistoryActionUtils?.openUnifiedMatchShareCard === 'function'){
      return window.HistoryActionUtils.openUnifiedMatchShareCard(
        window.HistoryActionUtils.normalizeMatchShareObjForCard(shareObj, 'ind')
      );
    }
  }catch(e){}
  _shareMode = 'match';
  openShareCardModal();
  const ids = idsJson ? JSON.parse(idsJson.replace(/'/g,'"')) : null;
  setTimeout(() => renderIndShareCard(p1, p2, p1wins, p2wins, date, winner, ids), 80);
}

function _sessionOverflowMenuHTML(opts) {
  const items = [
    opts?.shareBtn || '',
    opts?.moveBtn || '',
    opts?.editBtn || '',
    opts?.deleteBtn || ''
  ].filter(Boolean).join('');
  if (!items) return '';
  return `<details class="no-export su-more-menu" style="position:relative" onclick="event.stopPropagation()">
    <summary style="list-style:none;cursor:pointer;width:30px;height:30px;border-radius:10px;border:1px solid var(--border);background:var(--white);display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:900;color:var(--text2)">⋯</summary>
    <div class="su-more-menu-pop" style="position:absolute;right:0;top:36px;min-width:150px;padding:6px;background:var(--white);border:1px solid var(--border);border-radius:12px;display:flex;flex-direction:column;gap:6px">
      ${items}
    </div>
  </details>`;
}

function renderIndShareCard(p1, p2, p1wins, p2wins, date, winner, ids) {
  const card = document.getElementById('share-card');
  if (!card) return;
  const pp1 = players.find(x => x.name === p1) || {};
  const pp2 = players.find(x => x.name === p2) || {};

  const games = ids
    ? indM.filter(m => ids.includes(m._id))
    : indM.filter(m => {
        const pair = [m.wName, m.lName].sort();
        const pair2 = [p1, p2].sort();
        return (m.d||'') === date && pair[0] === pair2[0] && pair[1] === pair2[1];
      });

  const WC = '#111';
  const LC = '#94a3b8';

  const raceLabel = r => r==='T'?'테란':r==='Z'?'저그':r==='P'?'프로토스':'';
  const ct = t => t ? t.replace(/티어$/,'') : '';

  const playerInfoBlock = (name, pObj, isWinner, side) => {
    const photo = getPlayerPhotoHTML(name, '64px', `border:3px solid ${isWinner?'#0ea5e9':'#bae6fd'};box-shadow:${isWinner?'0 4px 16px rgba(14,165,233,.45)':'0 2px 8px rgba(0,0,0,.07)'};${!isWinner&&winner?'opacity:.4;filter:grayscale(.5)':''}`);
    const race = raceLabel(pObj.race||'');
    const tier = pObj.tier ? `<span style="background:${getTierBtnColor(pObj.tier)||'#64748b'};color:${getTierBtnTextColor(pObj.tier)||'#fff'};font-size:9px;font-weight:700;padding:1px 5px;border-radius:4px">${ct(pObj.tier)}</span>` : '';
    const raceSpan = race ? `<span style="font-size:10px;color:#94a3b8">${race}</span>` : '';
    const isRight = side === 'right';
    const badges = isRight ? `${raceSpan}${tier}` : `${tier}${raceSpan}`;
    return `<div style="flex:1;display:flex;flex-direction:column;align-items:${isRight?'flex-end':'flex-start'};gap:6px;min-width:0">
      <div style="flex-shrink:0;position:relative">
        ${photo}
        ${isWinner&&winner?`<div style="position:absolute;bottom:-2px;${isRight?'left:-2px':'right:-2px'};font-size:13px;filter:drop-shadow(0 1px 2px rgba(0,0,0,.2))">🏆</div>`:''}
      </div>
      <div style="text-align:${isRight?'right':'left'};width:100%;min-width:0">
        <div style="font-size:13px;font-weight:${isWinner?'800':'500'};color:${isWinner?WC:LC};white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${name}</div>
        <div style="display:flex;align-items:center;justify-content:${isRight?'flex-end':'flex-start'};gap:4px;flex-wrap:wrap;margin-top:3px">${badges}</div>
      </div>
    </div>`;
  };

  const gameRows = games.map((m, gi) => {
    const p1win = m.wName === p1;
    const p1Photo = getPlayerPhotoHTML(p1, '16px', `flex-shrink:0;${!p1win?'opacity:.35;filter:grayscale(.5)':''}`);
    const p2Photo = getPlayerPhotoHTML(p2, '16px', `flex-shrink:0;${p1win?'opacity:.35;filter:grayscale(.5)':''}`);
    const mapTxt = m.map && m.map !== '-' ? `<span style="color:#94a3b8;font-size:9px;margin-left:2px">📍${m.map}</span>` : '';
    return `<div style="display:flex;align-items:center;gap:5px;padding:5px 8px;border-radius:8px;background:${p1win?'rgba(14,165,233,.08)':'rgba(255,255,255,.5)'};margin-bottom:3px">
      <span style="font-size:9px;color:#0ea5e9;min-width:26px;font-weight:700">${gi+1}G</span>
      <span style="display:inline-flex;align-items:center;gap:3px;flex:1;justify-content:flex-end">
        ${p1Photo}<span style="font-size:11px;font-weight:${p1win?'700':'400'};color:${p1win?WC:LC}">${p1}</span>
      </span>
      <span style="font-size:9px;color:#bae6fd;flex-shrink:0">vs</span>
      <span style="display:inline-flex;align-items:center;gap:3px;flex:1">
        ${p2Photo}<span style="font-size:11px;font-weight:${p1win?'400':'700'};color:${p1win?LC:WC}">${p2}</span>
      </span>
      ${mapTxt}
    </div>`;
  }).join('');

  card.innerHTML = `<div style="background:linear-gradient(135deg,#f0f9ff 0%,#e0f2fe 40%,#f0fdf4 100%);border-radius:22px;padding:20px 18px;font-family:'Noto Sans KR',sans-serif;color:#111;overflow:hidden;position:relative;box-shadow:0 8px 40px rgba(14,165,233,.15)">
    <div style="position:absolute;top:0;left:0;right:0;height:5px;background:linear-gradient(90deg,#38bdf8,#0ea5e9,#6366f1);border-radius:22px 22px 0 0"></div>
    <div style="position:absolute;top:-40px;right:-40px;width:160px;height:160px;border-radius:50%;background:linear-gradient(135deg,#7dd3fc20,#38bdf810);pointer-events:none"></div>
    <div style="position:absolute;bottom:-30px;left:-30px;width:110px;height:110px;border-radius:50%;background:linear-gradient(135deg,#bae6fd15,#6366f110);pointer-events:none"></div>
    <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;margin-bottom:16px;margin-top:4px">
      <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">
        <div style="font-size:11px;font-weight:900;color:#0369a1;background:linear-gradient(90deg,#e0f2fe,#ede9fe);padding:5px 12px;border-radius:999px;border:1.5px solid #7dd3fc">🎮 개인전</div>
        <div style="font-size:10px;font-weight:800;color:#4338ca;background:rgba(255,255,255,.7);padding:5px 10px;border-radius:999px;border:1px solid rgba(99,102,241,.14)">공유 카드</div>
      </div>
      <div style="font-size:10px;color:#0ea5e9;font-weight:700;background:rgba(255,255,255,.65);padding:5px 10px;border-radius:999px;border:1px solid rgba(14,165,233,.18)">${date||''}</div>
    </div>
    <div style="display:flex;align-items:flex-start;gap:6px;margin-bottom:${games.length?'14':'0'}px">
      ${playerInfoBlock(p1, pp1, p1===winner, 'left')}
      <div style="text-align:center;flex-shrink:0;padding:10px 2px 0">
        <div style="font-size:40px;font-weight:900;line-height:1;letter-spacing:-2px">
          <span style="color:${p1===winner?'#0369a1':'#bae6fd'}">${p1wins}</span>
          <span style="color:#bae6fd;font-size:22px;margin:0 1px">:</span>
          <span style="color:${p2===winner?'#0369a1':'#bae6fd'}">${p2wins}</span>
        </div>
        ${winner?`<div style="font-size:8px;background:linear-gradient(90deg,#0ea5e9,#6366f1);-webkit-background-clip:text;-webkit-text-fill-color:transparent;font-weight:800;margin-top:5px;letter-spacing:1px">WIN</div>`:''}
      </div>
      ${playerInfoBlock(p2, pp2, p2===winner, 'right')}
    </div>
    ${games.length ? `<div style="background:rgba(255,255,255,.7);backdrop-filter:blur(4px);border-radius:14px;padding:10px;border:1px solid rgba(125,211,252,.4)">
      <div style="font-size:9px;color:#0ea5e9;font-weight:700;margin-bottom:8px;letter-spacing:.5px">경기 상세</div>
      ${gameRows}
    </div>` : ''}
    <div style="margin-top:12px;text-align:right;font-size:8px;color:#bae6fd;letter-spacing:.3px">⭐ 스타대학 데이터 센터</div>
  </div>`;
}

/* ══════════════════════════════════════
   끝장전 — 삭제 헬퍼
══════════════════════════════════════ */
function _removeGjResult(wName, lName, date, map, matchId){
  const w=players.find(p=>p.name===wName);
  const l=players.find(p=>p.name===lName);
  if(!w||!l)return;
  if(!w.history)w.history=[];
  if(!l.history)l.history=[];
  const nm=v=>(!v||v==='-')?'-':v;
  const wi=matchId
    ? w.history.findIndex(h=>h.matchId===matchId)
    : w.history.findIndex(h=>h.result==='승'&&h.opp===lName&&(date===''||h.date===date)&&nm(h.map)===nm(map));
  let delta=0;
  if(wi>=0){delta=w.history[wi].eloDelta||0;w.history.splice(wi,1);}
  const li=matchId
    ? l.history.findIndex(h=>h.matchId===matchId)
    : l.history.findIndex(h=>h.result==='패'&&h.opp===wName&&(date===''||h.date===date)&&nm(h.map)===nm(map));
  if(li>=0)l.history.splice(li,1);
  if(wi>=0||li>=0){
    if(w.win>0)w.win--;if(l.loss>0)l.loss--;
    w.points-=3;l.points+=3;
    if(delta){w.elo=(w.elo||ELO_DEFAULT)-delta;l.elo=(l.elo||ELO_DEFAULT)+delta;}
  }
}
function deleteGjGame(idx){
  const m=gjM[idx];if(!m)return;
  _removeGjResult(m.wName,m.lName,m.d||'',m.map||'-',m.matchId||undefined);
  gjM.splice(idx,1);save();render();
}
function deleteGjSession(idsArr){
  gjM.filter(m=>idsArr.includes(m._id)).forEach(m=>_removeGjResult(m.wName,m.lName,m.d||'',m.map||'-',m.matchId||undefined));
  gjM=gjM.filter(m=>!idsArr.includes(m._id));save();render();
}

function openEditGjSession(idsArr, proOnly){
  if(!isLoggedIn) return alert('로그인이 필요합니다.');
  const games = gjM.filter(m=>idsArr.includes(m._id) && (!!m._proLabel===!!proOnly));
  if(!games.length) return;
  const first = games[0];
  const pA = first.wName || '';
  const pB = first.lName || '';
  const pAObj=players.find(p=>p.name===pA)||{};
  const pBObj=players.find(p=>p.name===pB)||{};
  const dateVal = first.d || new Date().toISOString().slice(0,10);
  _gjEditingIds = [...idsArr];
  _gjProMode = !!proOnly;
  _gjInput = {
    date: dateVal,
    playerA: pA,
    playerB: pB,
    games: games.map(g=>g.wName===pA?'A':'B')
  };
  BLD['gj'] = {
    date: dateVal,
    membersA:[{name:pA,univ:pAObj.univ||'',race:pAObj.race||'',tier:pAObj.tier||'',gender:pAObj.gender||''}],
    membersB:[{name:pB,univ:pBObj.univ||'',race:pBObj.race||'',tier:pBObj.tier||'',gender:pBObj.gender||''}],
    sets:[],
    noSetMode:true,
    freeGames: games.map(g=>({
      playerA:pA,
      playerB:pB,
      winner:g.wName===pA?'A':'B',
      map:g.map||''
    })),
    _proLabel:!!proOnly
  };
  gjSub='input';
  render();
}

