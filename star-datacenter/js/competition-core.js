/* ══════════════════════════════════════
   competition-core.js — 대회 코어 (조별 순위 계산, 메뉴, 대회 조회, rComp 진입점)
   competition.js에서 분리됨
══════════════════════════════════════ */

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
var leagueViewMode='card';
var bktSchedSortDir='desc';
var bktViewMode='card';
var compBriefView='overall'; // 대회 브리핑 탭 내부 보기 전환: overall | league | tour

function _compMenuTint(hex, alpha){
  try{
    const h=String(hex||'').trim();
    const m=h.match(/^#?([0-9a-f]{6})$/i);
    if(!m) return `rgba(148,163,184,${alpha})`;
    const s=m[1];
    const r=parseInt(s.slice(0,2),16), g=parseInt(s.slice(2,4),16), b=parseInt(s.slice(4,6),16);
    return `rgba(${r},${g},${b},${alpha})`;
  }catch(e){
    return `rgba(148,163,184,${alpha})`;
  }
}
function _compActionMenuHTML(items){
  try{
    const list=(Array.isArray(items)?items:[]).filter(Boolean);
    if(!list.length) return '';
    window.__compMenuSeq = (window.__compMenuSeq||0)+1;
    const id = `comp-act-menu-${window.__compMenuSeq}`;
    window.__compMenuStore = window.__compMenuStore || {};
    window.__compMenuStore[id] = list;
    return `<div class="no-export" style="display:inline-flex;align-items:flex-start;justify-content:flex-end">
      <button class="btn btn-w btn-xs rec-morebtn" style="min-width:34px;padding:6px 10px;border-radius:var(--r);font-weight:900"
        onclick="event.stopPropagation();if(window.HistoryActionUtils&&typeof window.HistoryActionUtils.openSimpleActionMenu==='function'){window.HistoryActionUtils.openSimpleActionMenu(this, window.__compMenuStore['${id}']||[], event);}">⋯</button>
    </div>`;
  }catch(e){
    return '';
  }
}

function getCurrentTourney(){
  // [BUGFIX] curComp가 비어있을 때(=대회를 아직 선택 안 한 상태) _tourneys[0]으로
  // 폴백하면, 배열의 첫 대회가 하필 type:'tier'인 경우 선택도 안 했는데 티어대회
  // 서브메뉴/최근 기록이 자동으로 표시되는 문제가 있었음. 선택된 게 없으면 null.
  if(!curComp) return null;
  const _tourneys = (typeof tourneys!=='undefined' && Array.isArray(tourneys)) ? tourneys : [];
  return _tourneys.find(t=>t && t.name===curComp) || null;
}

function rComp(C,T){
  T.innerText='🎖️ 대회';
  const _tourneys = (typeof tourneys!=='undefined' && Array.isArray(tourneys)) ? tourneys : [];
  const _enableSubFilter = (localStorage.getItem('su_submenu_filter_enabled') ?? '1') === '1';
  const _lockOpen = (localStorage.getItem('su_filter_lock_open') ?? '0') === '1'
    || (typeof window._shouldLockSubFilter==='function' && window._shouldLockSubFilter('comp'));
  if(window._compFilterOpen===undefined) window._compFilterOpen=_lockOpen;
  if(_lockOpen) window._compFilterOpen=true;
  // [BUGFIX-HIGH-4] 비로그인 시 grpedit 진입 차단 - URL 파라미터/외부링크 직접 진입도 포함
  if(!isLoggedIn && (compSub==='grpedit' || (new URLSearchParams(location.search).get('csub')==='grpedit'))) compSub='league';

  // tier 타입 대회가 curComp에 선택되어 있으면 curComp와 compSub 함께 초기화 [BUGFIX-1]
  if(curComp && _tourneys.find(t=>t && t.name===curComp && t.type==='tier')){
    curComp=''; compSub='league';
  }
  const tn=getCurrentTourney();
  const tnType=tn?tn.type||'league':'league'; // 'league' or 'tier'

  let h=`<div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;flex-wrap:wrap;padding:12px 16px;background:var(--gold-bg);border:1px solid var(--gold-b);border-radius:var(--r)">
    <span style="font-weight:700;color:var(--gold);white-space:nowrap">🎖️ 대회 선택:</span>
    <select style="flex:1;max-width:220px;font-weight:700" onchange="curComp=this.value;leagueFilterDate='';leagueFilterGrp='';grpRankFilter='';bktSchedRound='전체';bktSchedSortDir='desc';save();render()">
      <option value="">— 대회를 선택하세요 —</option>
      ${_tourneys.filter(t=>t && t.type!=='tier').map(t=>{
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

    ${tn?`<span style="font-size:var(--fs-caption);color:var(--gray-l)">${tnType==='tier'?'🎯 티어대회':('🏆 '+(tn.groups||[]).length+'개 조 · '+(tn.groups||[]).reduce((s,g)=>s+(g.matches||[]).length,0)+'경기')}</span>`:''}
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
      {id:'normal',lbl:'🎮 일반'},
      {id:'league',lbl:'📅 조별리그 일정'},
      {id:'grprank',lbl:'📊 조별 순위'},
      {id:'tour',lbl:'🗂️ 대진표'},
      {id:'tourschedule',lbl:'📋 대진표 기록'},
      {id:'comprank',lbl:'🏅 개인 순위'},
      {id:'compbrief',lbl:'📰 대회 브리핑'},
      ...(isLoggedIn?[{id:'grpedit',lbl:'🏗️ 조편성 관리'}]:[]),
    ];
    if(compSub==='tiertour'||compSub==='input'||compSub==='leaguebrief'||compSub==='tourbrief') compSub='league';
  }
  subOpts = (typeof applyTabLabels==='function') ? applyTabLabels('comp', subOpts) : subOpts;
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

  if(compSub==='normal') h+=typeof rCompNormalMatches==='function'?rCompNormalMatches(tn):'';
  else if(compSub==='league') h+=rCompLeague(tn);
  else if(compSub==='grprank') h+=rCompGrpRankFull(tn);
  else if(compSub==='tour'){
    h+=tn?rCompTourDynamic(tn):'';
    // [BUGFIX-2] rBracketSchedule은 tourschedule 탭에서만 렌더 - 중복 렌더 제거
  }
  else if(compSub==='tourschedule') h+=tn?rBracketSchedule(tn):'';
  else if(compSub==='comprank') h+=rCompPlayerRank(tn);
  else if(compSub==='compbrief') h+=_rCompBriefingWithSwitcher(tn);
  else if(compSub==='grpedit'){
    // 현재 선택된 대회가 있으면 바로 그 대회 편집 화면으로 이동
    if(tn){grpEditId=tn.id;grpSub='edit';}
    h+=rCompGrpEdit();
  }
  else if(compSub==='tiertour') h+=rTierTour();
  C.innerHTML=h;
}

/* ── 대회 브리핑: 종합/조별리그/토너먼트 3종 보기 전환 스위처 ──
   기존에는 rCompLeagueBriefing / rCompTourBriefing이 화면 어디서도 호출되지
   않아 완성된 화면이 있어도 사용자가 접근할 방법이 없었다. 종합 브리핑 위에
   보기 전환 카드를 얹어 세 가지 브리핑을 모두 오갈 수 있게 한다.
   (b2w2 브리핑 디자인 시스템의 모드카드 패턴을 그대로 재사용해 시각적 일관성 유지) */
function _rCompBriefingWithSwitcher(tn){
  if(!tn) return typeof rCompOverallBriefing==='function'?rCompOverallBriefing(tn):'';
  const view = ['overall','league','tour'].includes(compBriefView) ? compBriefView : 'overall';
  const theme = (typeof _b2BriefingThemeLoad==='function') ? _b2BriefingThemeLoad() : 'paper';
  const modes = [
    {id:'overall', kicker:'전체 요약', icon:'🏆', title:'종합 브리핑', badgeOn:'보는 중', badgeOff:'대회 전체',
      desc:'조별리그와 대진표를 합쳐 대회 전체 흐름·MVP·우승팀을 한 화면에서 봅니다.'},
    {id:'league', kicker:'조별리그', icon:'📅', title:'조별리그 브리핑', badgeOn:'보는 중', badgeOff:'조 편성',
      desc:'조별 순위, 팀·개인 다승, 무패 팀과 접전 경기를 조별리그 기준으로 짚어봅니다.'},
    {id:'tour', kicker:'대진표', icon:'🗂️', title:'토너먼트 브리핑', badgeOn:'보는 중', badgeOff:'토너먼트',
      desc:'라운드별 진행, 우승·준우승, 완승과 접전 경기를 토너먼트 기준으로 봅니다.'}
  ];
  let sw = `<div class="b2w2-wrap" data-theme="${theme}" style="margin-bottom:16px">
    <div class="b2w2-modebar" role="tablist" aria-label="대회 브리핑 보기 전환">
      ${modes.map(m=>`<div class="b2w2-modecard${view===m.id?' is-active':''}" role="tab" aria-selected="${view===m.id}"
          tabindex="0" onclick="compBriefView='${m.id}';render()"
          onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();compBriefView='${m.id}';render()}">
        <div class="b2w2-modehead">
          <div>
            <div class="b2w2-modekicker">${m.kicker}</div>
            <div class="b2w2-modetitle">${m.icon} ${m.title}</div>
          </div>
          <span class="b2w2-modebadge">${view===m.id?m.badgeOn:m.badgeOff}</span>
        </div>
        <div class="b2w2-modedesc">${m.desc}</div>
      </div>`).join('')}
    </div>
  </div>`;
  const body = view==='league' ? (typeof rCompLeagueBriefing==='function'?rCompLeagueBriefing(tn):'')
    : view==='tour' ? (typeof rCompTourBriefing==='function'?rCompTourBriefing(tn):'')
    : (typeof rCompOverallBriefing==='function'?rCompOverallBriefing(tn):'');
  return sw + body;
}

// 승리 색(대학색) → "r,g,b" 변환 (대회 카드 테마용)
// NOTE: pro-comp-core.js에 동일 함수 존재 (각 파일 독립성을 위해 로컬 복사본 유지)
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

/* ══════════════════════════════════════
   (요청사항) 시드/부전승(라운드 합류) + 자동 배치 (대회 토너먼트)
   - 저장: tn.bracket.seedStarts = { "대학명": 16|8|4|2 ... } (숫자는 시작 라운드 강수)
══════════════════════════════════════ */
