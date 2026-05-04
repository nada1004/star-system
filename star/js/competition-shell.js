/* competition-shell.js: rebuilt from v126 competition.js */
/* ══════════════════════════════════════
   대회 (조별리그 + 조편성 관리 + 대진표 + 개인순위)
══════════════════════════════════════ */

// 조별 순위 계산 공통 함수 (rBracketSchedule, rCompTourDynamic 공유)
function _calcGrpRank(grp){
  const st={};
  (grp.univs||[]).forEach(u=>{st[u]={w:0,l:0,sw:0,sl:0};});
  (grp.matches||[]).forEach(m=>{
    if(!m.a||!m.b||m.sa==null||m.sb==null)return;
    if(!st[m.a])st[m.a]={w:0,l:0,sw:0,sl:0};
    if(!st[m.b])st[m.b]={w:0,l:0,sw:0,sl:0};
    if(m.sa>m.sb){st[m.a].w++;st[m.b].l++;}
    else if(m.sb>m.sa){st[m.b].w++;st[m.a].l++;}
    st[m.a].sw+=m.sa;st[m.a].sl+=m.sb;
    st[m.b].sw+=m.sb;st[m.b].sl+=m.sa;
  });
  return Object.entries(st).map(([u,s])=>({u,...s})).sort((a,b)=>b.w-a.w||(b.sw-b.sl)-(a.sw-a.sl)||b.sw-a.sw);
}
var leagueFilterDate='';
var leagueFilterGrp='';
var grpRankFilter='';
var grpSub='list';
var grpEditId=null;
var grpMatchState={tnId:null,gi:null,mi:null};
var bracketMatchState={tnId:null,rnd:null,mi:null,teamA:'',teamB:''};
var bktSchedRound='전체';
var leagueSortDir='desc';
var bktSchedSortDir='desc';

function getCurrentTourney(){
  return tourneys.find(t=>t.name===curComp)||tourneys[0]||null;
}

function rComp(C,T){
  T.innerText='🎖️ 대회';
  const _enableSubFilter = (localStorage.getItem('su_submenu_filter_enabled') ?? '1') === '1';
  const _lockOpen = (localStorage.getItem('su_filter_lock_open') ?? '1') === '1';
  if(window._compFilterOpen===undefined) window._compFilterOpen=_lockOpen;
  if(_lockOpen) window._compFilterOpen=true;
  if(!isLoggedIn && compSub==='grpedit') compSub='league';

  // tier 타입 대회가 curComp에 선택되어 있으면 초기화
  if(curComp && tourneys.find(t=>t.name===curComp&&t.type==='tier')) curComp='';
  const tn=getCurrentTourney();
  const tnType=tn?tn.type||'league':'league'; // 'league' or 'tier'

  let h=`<div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;flex-wrap:wrap;padding:12px 16px;background:var(--gold-bg);border:1px solid var(--gold-b);border-radius:10px">
    <span style="font-weight:700;color:var(--gold);white-space:nowrap">🎖️ 대회 선택:</span>
    <select style="flex:1;max-width:220px;font-weight:700" onchange="curComp=this.value;leagueFilterDate='';leagueFilterGrp='';grpRankFilter='';save();render()">
      <option value="">— 대회를 선택하세요 —</option>
      ${tourneys.filter(t=>t.type!=='tier').map(t=>{
        const _grpDates=(t.groups||[]).flatMap(g=>(g.matches||[]).map(m=>m.d));
        const _br=t.bracket||{};
        const _bktDates=Object.values(_br.matchDetails||{}).map(m=>m.d).concat((_br.manualMatches||[]).map(m=>m&&m.d));
        const _dates=[..._grpDates,..._bktDates].filter(Boolean).sort();
        const _range=_dates.length?` (${_dates[0].slice(2).replace(/-/g,'.')}~${_dates[_dates.length-1].slice(2).replace(/-/g,'.')})` :'';
        return`<option value="${t.name}"${curComp===t.name?' selected':''}>${t.name}${_range}</option>`;
      }).join('')}
    </select>
    ${isLoggedIn?`<button class="btn btn-b btn-xs" onclick="grpNewLeagueTourney()">+ 일반 대회</button>`:''}
    ${tn&&isLoggedIn?`<button class="btn btn-w btn-xs" onclick="grpRenameTourney()" title="대회명 수정">✏️ 이름수정</button><button class="btn btn-r btn-xs" onclick="grpDelCurTourney()" title="현재 대회 삭제">🗑️ 삭제</button>`:''}

    ${tn?`<span style="font-size:11px;color:var(--gray-l)">${tnType==='tier'?'🎯 티어대회':('🏆 '+(tn.groups||[]).length+'개 조 · '+(tn.groups||[]).reduce((s,g)=>s+(g.matches||[]).length,0)+'경기')}</span>`:''}
  </div>`;

  // 대회 타입에 따라 다른 서브메뉴
  let subOpts;
  if(tnType==='tier'){
    // 티어별 대회 전용 메뉴
    subOpts=[{id:'tiertour',lbl:'🎯 티어대회'}];
    if(compSub!=='tiertour') compSub='tiertour';
  } else {
    // 일반 대회 메뉴 (tiertour 제외)
    subOpts=[
      {id:'league',lbl:'📅 조별리그 일정'},
      {id:'grprank',lbl:'📊 조별 순위'},
      {id:'tour',lbl:'🗂️ 대진표'},
      {id:'tourschedule',lbl:'📋 토너먼트'},
      {id:'comprank',lbl:'🏅 개인 순위'},
      ...(isLoggedIn?[{id:'grpedit',lbl:'🏗️ 조편성 관리'}]:[]),
    ];
    if(compSub==='tiertour'||compSub==='input') compSub='league';
  }
  // (요청사항) 대회 하위메뉴도 '필터'로 접기/펼치기
  if(_enableSubFilter && !_lockOpen){
    h+=`<div class="fbar no-export" style="overflow-x:auto;flex-wrap:nowrap;-webkit-overflow-scrolling:touch;scrollbar-width:none;gap:4px;margin:-2px 0 6px;align-items:center">
      <button class="pill ${window._compFilterOpen?'on':''}" style="flex-shrink:0;white-space:nowrap" onclick="window._compFilterOpen=!window._compFilterOpen;render()">🔍 필터 ${window._compFilterOpen?'▲':'▼'}</button>
    </div>`;
  }
  if(!_enableSubFilter || window._compFilterOpen){
    h+=`<div class="fbar no-export" style="overflow-x:auto;flex-wrap:nowrap;-webkit-overflow-scrolling:touch;scrollbar-width:none;gap:4px;margin-bottom:6px">${subOpts.map(o=>`<button class="pill ${compSub===o.id?'on':''}" style="flex-shrink:0;white-space:nowrap" onclick="compSub='${o.id}';render()">${o.lbl}</button>`).join('')}</div>`;
  }

  if(!tn && compSub!=='grpedit'){
    h+=`<div style="padding:60px 20px;text-align:center;background:var(--surface);border-radius:12px;border:2px dashed var(--border2)">
      <div style="font-size:44px;margin-bottom:14px">🏆</div>
      <div style="font-size:16px;font-weight:700;margin-bottom:8px">등록된 대회가 없습니다</div>
      <div style="color:var(--gray-l);margin-bottom:20px">새 대회를 만들어 조편성을 시작하세요.</div>
      ${isLoggedIn?`<button class="btn btn-b" onclick="grpNewLeagueTourney()">+ 일반 대회 만들기</button>`:''}
    </div>`;
    C.innerHTML=h; return;
  }

  if(compSub==='league') h+=rCompLeague(tn);
  else if(compSub==='grprank') h+=rCompGrpRankFull(tn);
  else if(compSub==='tour') h+=tn?rCompTourDynamic(tn):'';
  else if(compSub==='tourschedule') h+=tn?rBracketSchedule(tn):'';
  else if(compSub==='comprank') h+=rCompPlayerRank(tn);
  else if(compSub==='grpedit'){
    // 현재 선택된 대회가 있으면 바로 그 대회 편집 화면으로 이동
    if(tn){grpEditId=tn.id;grpSub='edit';}
    h+=rCompGrpEdit();
  }
  else if(compSub==='tiertour') h+=rTierTour();
  C.innerHTML=h;
}

// 승리 색(대학색) → "r,g,b" 변환 (대회 카드 테마용)
function _tcHexToRgbStr(hex){
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

/* 브라켓 시드/조별 렌더 블록은 `js/competition-bracket-core.js`로 분리됨 */

/* 대회 상세/공유/상세모달 블록은 `js/competition-detail.js`로 분리됨 */

/* 브라켓 동적 렌더/상태 블록은 `js/competition-bracket-dynamic.js`로 분리됨 */

/* 개인 랭킹 블록은 `js/competition-rank.js`로 분리됨 */

/* 조편집/조별 입력 블록은 `js/competition-group-edit.js`로 분리됨 */

function openBktShareCard(tnId,rnd,mi){
  const m=getBktMatch(tnId,rnd,mi);if(!m||m.sa==null)return;
  const tn=tourneys.find(t=>t.id===tnId);if(!tn)return;
  const totalRnd=(tn.bracket||[]).length||0;
  const _lbl = rnd==='3rd' ? '3·4위전' : ((()=>{
    const r=Number(rnd);
    if(!isFinite(r) || totalRnd<=0) return '토너먼트';
    return r===totalRnd-1?'결승':r===totalRnd-2?'4강':r===totalRnd-3?'8강':`${Math.pow(2,totalRnd-r)}강`;
  })());
  window._shareMatchObj={
    ...m,
    a:m.a||'',
    b:m.b||'',
    sa:m.sa,
    sb:m.sb,
    d:m.d||'',
    n:tn.name,
    _matchType:'procomp-bkt',
    _subLabel:(tn.name?`${tn.name} · ${_lbl}`:_lbl),
    _usePlayerPhoto:true,
    _noUnivIcon:false,
    sets:m.sets||[]
  };
  _shareMode='match';
  if(typeof openShareCardModal==='function'){openShareCardModal();setTimeout(()=>renderShareCardByMatchObj(window._shareMatchObj),80);}
}
