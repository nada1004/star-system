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
      <button class="btn btn-w btn-xs rec-morebtn" style="min-width:34px;padding:6px 10px;border-radius:10px;font-weight:900"
        onclick="event.stopPropagation();if(window.HistoryActionUtils&&typeof window.HistoryActionUtils.openSimpleActionMenu==='function'){window.HistoryActionUtils.openSimpleActionMenu(this, window.__compMenuStore['${id}']||[], event);}">⋯</button>
    </div>`;
  }catch(e){
    return '';
  }
}

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
      {id:'tourschedule',lbl:'📋 대진표 기록'},
      {id:'comprank',lbl:'🏅 개인 순위'},
      ...(isLoggedIn?[{id:'grpedit',lbl:'🏗️ 조편성 관리'}]:[]),
    ];
    if(compSub==='tiertour'||compSub==='input') compSub='league';
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

  if(compSub==='league') h+=rCompLeague(tn);
  else if(compSub==='grprank') h+=rCompGrpRankFull(tn);
  else if(compSub==='tour'){
    h+=tn?rCompTourDynamic(tn):'';
    if(tn){
      const _bktSched=typeof rBracketSchedule==='function'?rBracketSchedule(tn):'';
      if(_bktSched) h+=`<div style="margin-top:18px;padding-top:14px;border-top:2px solid var(--border)">${_bktSched}</div>`;
    }
  }
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

/* ══════════════════════════════════════
   (요청사항) 시드/부전승(라운드 합류) + 자동 배치 (대회 토너먼트)
   - 저장: tn.bracket.seedStarts = { "대학명": 16|8|4|2 ... } (숫자는 시작 라운드 강수)
══════════════════════════════════════ */
function _bktRoundLabelBySize(sz){
  if(sz===2) return '결승';
  if(sz===4) return '4강';
  if(sz===8) return '8강';
  if(sz===16) return '16강';
  if(sz===32) return '32강';
  if(sz===64) return '64강';
  return `${sz}강`;
}
function _bktComputeBracketSize(tn){
  // rCompTourDynamic 기준: r1teams 길이(또는 overrideSize)를 기반으로 브라켓 규모 결정
  const grpRanks=(tn.groups&&tn.groups.length>=2)?tn.groups.map((grp,gi)=>({ranked:_calcGrpRank(grp)})):[];
  const numGroups=grpRanks.length;
  const pairCount=Math.floor(numGroups/2)*2;
  const r1teams=[];
  for(let i=0;i<pairCount;i+=2){
    const gA=grpRanks[i],gB=grpRanks[i+1]||grpRanks[0];
    r1teams.push(gA.ranked[0]?.u||'', gB.ranked[1]?.u||'', gB.ranked[0]?.u||'', gA.ranked[1]?.u||'');
  }
  if(numGroups%2===1){
    const last=grpRanks[numGroups-1];
    r1teams.push(last.ranked[0]?.u||'');
  }
  const overrideSize=tn.bracketOverrideSize||0;
  const numTeams=overrideSize>1?overrideSize:(r1teams.length>0?r1teams.length:8);
  // 올림으로 2의 거듭제곱(라운드 합류 옵션 계산용)
  let brSize=2;
  while(brSize<numTeams) brSize*=2;
  return brSize;
}
function _bktCollectTeams(tn){
  const br=getBracket(tn);
  const s=new Set();
  // 조별 순위 기반 1라운드 후보
  try{
    (tn.groups||[]).forEach(grp=>{
      const ranked=_calcGrpRank(grp);
      ranked.slice(0,2).forEach(x=>{ if(x?.u) s.add(x.u); });
    });
  }catch(e){}
  // 슬롯/승자/수동경기/기록에서 추가 수집
  try{ Object.values(br.slots||{}).forEach(v=>{ if(v) s.add(v); }); }catch(e){}
  try{ Object.values(br.winners||{}).forEach(v=>{ if(v) s.add(v); }); }catch(e){}
  try{ (br.manualMatches||[]).forEach(m=>{ if(m?.a) s.add(m.a); if(m?.b) s.add(m.b); }); }catch(e){}
  return Array.from(s).filter(Boolean).sort((a,b)=>a.localeCompare(b));
}
function openBktSeedModal(tnId){
  const tn=tourneys.find(t=>t.id===tnId);
  if(!tn) return;
  const br=getBracket(tn);
  if(!br.seedStarts) br.seedStarts={};
  const firstSize=_bktComputeBracketSize(tn);
  const sizes=[]; for(let s=firstSize;s>=2;s=Math.floor(s/2)) sizes.push(s);
  const cand=_bktCollectTeams(tn);
  if(!cand.length) return alert('시드 후보(대학)를 찾을 수 없습니다.');
  const modal=document.createElement('div');
  modal.id='_bktSeedModal';
  modal.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px;box-sizing:border-box';
  modal.innerHTML=`<div style="background:var(--white);border-radius:14px;padding:18px;width:min(560px,100%);max-height:90vh;overflow:auto;box-shadow:0 10px 40px rgba(0,0,0,.25)">
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">
      <div style="font-weight:900;font-size:14px">🎫 시드/부전승(라운드 합류)</div>
      <div style="margin-left:auto;display:flex;gap:6px">
        <button class="btn btn-b btn-sm" onclick="applyBktSeedStarts('${tnId}')">✅ 적용(자동 배치)</button>
        <button class="btn btn-w btn-sm" onclick="document.getElementById('_bktSeedModal')?.remove()">닫기</button>
      </div>
    </div>
    <div style="font-size:12px;color:var(--gray-l);margin-bottom:12px">
      예: 32강 대회에서 상위 시드가 16강/8강부터 합류(부전승)하는 케이스를 지원합니다.<br>
      <span style="font-size:11px">※ 정확한 위치 재배치는 각 경기의 <b>✏️ 수정</b>에서 팀A/팀B를 바꾸면 됩니다.</span>
    </div>
    <div style="display:flex;flex-direction:column;gap:8px">
      ${cand.map(name=>{
        const cur=parseInt(br.seedStarts[name]||firstSize,10)||firstSize;
        return `<div style="display:flex;align-items:center;gap:10px;border:1px solid var(--border);border-radius:10px;padding:10px 12px;background:var(--surface)">
          <div style="font-weight:900;font-size:12px;min-width:160px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${name}</div>
          <select data-seed-team="${name.replace(/\"/g,'&quot;')}" style="flex:1;padding:6px 10px;border-radius:10px;border:1px solid var(--border2);font-weight:800;font-size:12px">
            ${sizes.map((s,i)=>`<option value="${s}" ${s===cur?'selected':''}>${i===0?`${_bktRoundLabelBySize(s)}(첫 라운드)`:`${_bktRoundLabelBySize(s)}부터`}</option>`).join('')}
          </select>
        </div>`;
      }).join('')}
    </div>
  </div>`;
  document.body.appendChild(modal);
}
function applyBktSeedStarts(tnId){
  const tn=tourneys.find(t=>t.id===tnId);
  if(!tn) return;
  const br=getBracket(tn);
  const wrap=document.getElementById('_bktSeedModal');
  if(!wrap) return;
  const firstSize=_bktComputeBracketSize(tn);
  if(!br.seedStarts) br.seedStarts={};
  wrap.querySelectorAll('select[data-seed-team]').forEach(sel=>{
    const name=sel.getAttribute('data-seed-team')||'';
    const v=parseInt(sel.value,10)||firstSize;
    if(!name) return;
    br.seedStarts[name]=v;
  });
  if(!confirm('선택한 “시작 라운드” 기준으로 자동 배치할까요?\n(첫 라운드가 아닌 팀은 기존 위치에서 제거 후, 해당 라운드의 빈 슬롯에 배치됩니다.)')) return;

  const sizeToR=(sz)=>{
    const ratio = firstSize / sz;
    const r = Math.round(Math.log2(ratio));
    return Math.max(0, r);
  };
  const normEmpty=v=>(v===undefined||v===null||v===''||v==='BYE');

  // 1) 첫 라운드가 아닌 팀은 기존 슬롯에서 제거
  Object.entries(br.seedStarts||{}).forEach(([name,sz])=>{
    const v=parseInt(sz,10)||firstSize;
    if(v>=firstSize) return;
    Object.keys(br.slots||{}).forEach(k=>{ if(br.slots[k]===name) delete br.slots[k]; });
    // 승자도 제거될 수 있어 전체 winners는 보수적으로 초기화
    Object.keys(br.winners||{}).forEach(k=>{ if(br.winners[k]===name) delete br.winners[k]; });
  });

  // 2) 대상 팀들을 라운드별로 채우기
  const targets = Object.entries(br.seedStarts||{})
    .map(([name,sz])=>({name,sz:parseInt(sz,10)||firstSize}))
    .filter(x=>x.name && x.sz<firstSize)
    .sort((a,b)=>a.sz-b.sz||a.name.localeCompare(b.name));

  const failed=[];
  targets.forEach(({name,sz})=>{
    const r=sizeToR(sz);
    const matchCount = Math.max(1, Math.floor(firstSize / Math.pow(2,r+1)));
    let placed=false;
    for(let mi=0;mi<matchCount&&!placed;mi++){
      const ka=`${r}-${mi}-a`, kb=`${r}-${mi}-b`;
      const va=br.slots[ka], vb=br.slots[kb];
      if(normEmpty(va)){ br.slots[ka]=name; placed=true; break; }
      if(normEmpty(vb)){ br.slots[kb]=name; placed=true; break; }
    }
    if(!placed) failed.push(`${name}(${_bktRoundLabelBySize(sz)})`);
  });
  save(); render();
  if(failed.length) alert('빈 슬롯이 부족해 일부 시드를 배치하지 못했습니다:\n- '+failed.join('\n- '));
}

function rCompGrpRankFull(tn){
  if(!tn) return `<div style="padding:30px;text-align:center;color:var(--gray-l)">대회를 선택하세요.</div>`;
  const isTier=tn.type==='tier';
  const GL='ABCDEFGHIJ';
  let filterHTML='';
  if(tn.groups&&tn.groups.length>1){
    filterHTML=`<div style="display:flex;gap:4px;flex-wrap:wrap;align-items:center;margin-left:auto">
      <button class="pill ${!grpRankFilter?'on':''}" onclick="grpRankFilter='';render()">전체</button>`;
    tn.groups.forEach((grp,gi)=>{
      const gl=GL[gi];const col=['#2563eb','#dc2626','#16a34a','#d97706','#7c3aed','#0891b2'][gi%6];
      filterHTML+=`<button class="pill ${grpRankFilter===grp.name?'on':''}" style="${grpRankFilter===grp.name?`background:${col};border-color:${col};color:#fff`:''}" onclick="grpRankFilter='${grp.name}';render()">GROUP ${gl}</button>`;
    });
    filterHTML+=`</div>`;
  }
  let h=`<div style="display:flex;align-items:center;gap:10px;margin-bottom:4px;flex-wrap:wrap">
    <div style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:15px;color:var(--blue)">📊 ${tn.name} — 조별 순위</div>
    ${filterHTML}
  </div>
  <div style="font-size:11px;color:var(--gray-l);margin-bottom:14px">승점 → 세트 득실 → 득점 순 · 상위 2팀 토너먼트 진출</div>`;
  if(!tn.groups||!tn.groups.length){
    return h+`<div style="padding:40px;text-align:center;background:var(--surface);border-radius:12px;border:2px dashed var(--border2);color:var(--gray-l)">
      <div style="font-size:28px;margin-bottom:10px">🏗️</div>
      <div style="font-weight:700;margin-bottom:8px">조편성이 필요합니다</div>
      <div style="font-size:12px;margin-bottom:14px">먼저 <b>조편성</b> 탭에서 조를 만들고 ${isTier?'선수':'대학'}를 배정해주세요.</div>
      ${isLoggedIn?`<button class="btn btn-b btn-sm" onclick="${isTier?`_ttSub='grpedit';grpSub='edit';render()`:`compSub='grpedit';grpEditId='${tn.id}';grpSub='edit';render()`}">🏗️ 조편성 하러 가기</button>`:''}
    </div>`;
  }
  const targetGroups=grpRankFilter?tn.groups.filter(g=>g.name===grpRankFilter):tn.groups;
  targetGroups.forEach(grp=>{
    const gi=tn.groups.indexOf(grp);const gl=GL[gi]||gi;
    const col=['#2563eb','#dc2626','#16a34a','#d97706','#7c3aed','#0891b2'][gi%6];
    const sc={};
    grp.univs.forEach(u=>{sc[u]={w:0,l:0,gw:0,gl2:0,pts:0,played:0};});
    (grp.matches||[]).forEach(m=>{
      if(m.sa==null||m.sb==null)return;
      if(!sc[m.a])sc[m.a]={w:0,l:0,gw:0,gl2:0,pts:0,played:0};
      if(!sc[m.b])sc[m.b]={w:0,l:0,gw:0,gl2:0,pts:0,played:0};
      sc[m.a].played++;sc[m.b].played++;
      sc[m.a].gw+=m.sa;sc[m.a].gl2+=m.sb;sc[m.b].gw+=m.sb;sc[m.b].gl2+=m.sa;
      if(m.sa>m.sb){sc[m.a].w++;sc[m.a].pts+=3;sc[m.b].l++;}
      else if(m.sb>m.sa){sc[m.b].w++;sc[m.b].pts+=3;sc[m.a].l++;}
      else{sc[m.a].pts++;sc[m.b].pts++;}
    });
    const sorted=Object.entries(sc).sort((a,b)=>b[1].pts-a[1].pts||(b[1].gw-b[1].gl2)-(a[1].gw-a[1].gl2)||b[1].gw-a[1].gw);
    const played=grp.matches.filter(m=>m.sa!=null).length;
    h+=`<div style="background:var(--white);border:1.5px solid var(--border);border-radius:12px;padding:16px;margin-bottom:16px;box-shadow:0 2px 8px rgba(0,0,0,.04)">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;flex-wrap:wrap">
        <span style="background:${col};color:#fff;font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:13px;padding:3px 14px;border-radius:20px">GROUP ${gl}</span>
        <span style="font-size:11px;color:var(--gray-l)">${played}/${grp.matches.length}경기 완료</span>
        <div style="margin-left:auto;display:flex;gap:5px;flex-wrap:wrap">${grp.univs.map(u=>`<span class="ubadge" style="background:${gc(u)};font-size:11px">${isTier?'':gUI(u,'10px')}${u}</span>`).join('')}</div>
      </div>
      <table class="grp-rank-table"><thead><tr><th>순위</th><th>${isTier?'선수':'대학'}</th><th>경기</th><th>승</th><th>패</th><th>득</th><th>실</th><th>득실</th><th>승점</th></tr></thead><tbody>`;
    sorted.forEach(([name,s],i)=>{
      const uc=gc(name);const diff=s.gw-s.gl2;const isTop=i<2;
      const rowClass=i===0?'grp-rank-top1':i===1?'grp-rank-top2':'';
      h+=`<tr class="${rowClass}">
        <td>${i===0?`<span class="rk1">1위</span>`:i===1?`<span class="rk2">2위</span>`:i===2?`<span class="rk3">3위</span>`:`${i+1}위`}</td>
        <td><span class="ubadge ${isTier?'':'clickable-univ'}" style="background:${uc};font-size:11px" ${isTier?'':`onclick="openUnivModal('${name}')"`}>${name}</span></td>
        <td style="color:var(--gray-l)">${s.played}</td><td class="wt">${s.w}</td><td class="lt">${s.l}</td>
        <td class="wt">${s.gw}</td><td class="lt">${s.gl2}</td>
        <td style="font-weight:700;color:${diff>0?'var(--green)':diff<0?'var(--red)':'var(--gray-l)'}">${diff>=0?'+':''}${diff}</td>
        <td style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:15px;color:${col}">${s.pts}</td>
      </tr>`;
    });
    h+=`</tbody></table>`;
    if(played===0) h+=`<div style="font-size:12px;color:var(--gray-l);padding:10px 0;text-align:center">⏳ 아직 진행된 경기가 없습니다</div>`;
    h+=`</div>`;
  });
  return h;
}

/* ══════════════════════════════════════
   브라켓 상태 저장 유틸
   tn.bracket = {
     slots: { "r-mi-side": "대학명" },   // 각 라운드 각 경기 슬롯 수동 override
     winners: { "r-mi": "대학명" },       // 각 라운드 각 경기 승자
     champ: "대학명"
   }
══════════════════════════════════════ */
function getBracket(tn){
  if(!tn.bracket)tn.bracket={slots:{},winners:{},champ:''};
  if(!tn.bracket.slots)tn.bracket.slots={};
  if(!tn.bracket.winners)tn.bracket.winners={};
  if(tn.bracket.champ===undefined)tn.bracket.champ='';
  return tn.bracket;
}

/* ── 티어대회(개인전) 전용 동적 브라켓 ──
   - tn.type==='tier'
   - tn.bracket: {slots,winners,champ,matchDetails}
   - slots: "r-mi-side" → 선수명
   - winners: "r-mi" → 선수명
*/
function rTierBracketDynamic(tn){
  if(!tn) return `<div style="padding:30px;text-align:center;color:var(--gray-l)">대회를 선택하세요.</div>`;
  const br=getBracket(tn);
  const overrideSize=parseInt(tn.bracketOverrideSize||'0',10)||0;
  const numTeams = overrideSize>1 ? overrideSize : 8;
  let totalRounds=0;{let n=numTeams;while(n>1){n=Math.ceil(n/2);totalRounds++;}} if(!totalRounds) totalRounds=1;

  const slotName = (rnd,mi,side)=>{
    const k=`${rnd}-${mi}-${side}`;
    if(Object.prototype.hasOwnProperty.call(br.slots||{}, k)) return String(br.slots[k]||'');
    if(rnd<=0) return '';
    const pk=`${rnd-1}-${mi*2 + (side==='a'?0:1)}`;
    return String((br.winners||{})[pk]||'');
  };
  const matchDetail = (rnd,mi)=>{
    // matchDetails는 optional. 없으면 표시용만.
    const k=`${rnd}-${mi}`;
    return (br.matchDetails && br.matchDetails[k]) ? br.matchDetails[k] : null;
  };
  const rndLabel = (ri)=>{
    const sz = Math.pow(2, totalRounds-ri);
    if(sz===2) return '결승';
    if(sz===4) return '4강';
    if(sz===8) return '8강';
    if(sz===16) return '16강';
    if(sz===32) return '32강';
    return `${sz}강`;
  };

  let h = `<div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;flex-wrap:wrap">
    <div style="font-weight:900;font-size:15px;color:var(--blue)">🗂️ ${tn.name} 토너먼트</div>
    <span style="font-size:11px;color:var(--gray-l)">※ 티어대회(개인전) 대진표</span>
    ${isLoggedIn?`
      <div style="display:flex;align-items:center;gap:6px;margin-left:auto;flex-wrap:wrap">
        <button class="btn btn-p btn-sm" onclick="openTierBktPasteModal && openTierBktPasteModal('${tn.id}')" title="여러 경기 결과를 붙여넣어 토너먼트 기록으로 저장">📋 자동인식</button>
        <span style="font-size:11px;color:var(--gray-l);font-weight:800">강수</span>
        <select onchange="setTierBracketSize('${tn.id}', this.value)" style="border:1px solid var(--border2);border-radius:8px;padding:5px 8px;font-size:12px">
          ${[2,4,8,16,32,64].map(x=>`<option value="${x}" ${x===numTeams?'selected':''}>${x}강</option>`).join('')}
        </select>
      </div>
    `:''}
  </div>`;

  h += `<div style="overflow-x:auto;padding-bottom:14px"><div style="display:inline-flex;gap:0;align-items:flex-start;min-width:fit-content">`;
  for(let ri=0; ri<totalRounds; ri++){
    const matchCount = Math.ceil(numTeams/Math.pow(2,ri+1));
    const isLast = ri===totalRounds-1;
    const gap = ri===0?8:(Math.pow(2,ri)*60+8);
    h += `<div style="display:flex;align-items:center">
      <div style="min-width:${isLast?220:200}px;flex-shrink:0">
        <div style="text-align:center;font-size:12px;font-weight:900;color:#fff;margin-bottom:10px;padding:7px 10px;background:linear-gradient(135deg,#3b82f6,#1d4ed8);border-radius:10px;box-shadow:0 3px 8px rgba(37,99,235,.25);letter-spacing:.5px">${rndLabel(ri)}</div>
        <div style="display:flex;flex-direction:column;gap:${gap}px">`;
    for(let mi=0; mi<matchCount; mi++){
      const a = slotName(ri,mi,'a') || 'TBD';
      const b = slotName(ri,mi,'b') || 'TBD';
      const w = (br.winners||{})[`${ri}-${mi}`] || '';
      const aWin = w && w===a, bWin = w && w===b;
      const md = matchDetail(ri,mi);
      const sa = md?.sa, sb = md?.sb;
      const hasScore = (sa!=null && sb!=null);
      const _esc = s => String(s||'').replace(/'/g,"\\'");
      h += `<div style="border-radius:12px;overflow:hidden;background:var(--white);box-shadow:0 1px 6px rgba(0,0,0,.07);border:1.5px solid #e2e8f0">
        <div style="padding:9px 12px;border-bottom:1px solid #f1f5f9;background:${aWin?'#2563eb18':a==='TBD'?'#f8fafc':'#fff'};display:flex;align-items:center;gap:8px;${aWin?`border-left:3px solid #2563eb`:''};${w && !aWin?'opacity:.55':''}">
          <div style="flex:1;min-width:0">
            <div style="font-size:12px;font-weight:${aWin?'900':a==='TBD'?'400':'700'};color:${aWin?'#2563eb':a==='TBD'?'#94a3b8':'#374151'};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;cursor:${a!=='TBD'?'pointer':'default'}" onclick="${a!=='TBD'?`openPlayerModal('${String(a).replace(/'/g,"\\'")}')`:''}">${a}</div>
          </div>
          ${hasScore?`<span style="font-size:11px;font-weight:900;color:${aWin?'#2563eb':'#94a3b8'};flex-shrink:0">${sa}</span>`:''}
          ${isLoggedIn?`<button class="btn btn-xs" style="font-size:10px;padding:0 6px" onclick="(function(){const v=prompt('A 슬롯 선수명 입력(빈칸=삭제, BYE 가능)', '${_esc(a==='TBD'?'':a)}'); if(v===null)return; setBracketSlot('${tn.id}',${ri},${mi},'a', (v||'').trim()); })()">✏️</button>`:''}
        </div>
        <div style="padding:9px 12px;background:${bWin?'#2563eb18':b==='TBD'?'#f8fafc':'#fff'};display:flex;align-items:center;gap:8px;${bWin?`border-left:3px solid #2563eb`:''};${w && !bWin?'opacity:.55':''}">
          <div style="flex:1;min-width:0">
            <div style="font-size:12px;font-weight:${bWin?'900':b==='TBD'?'400':'700'};color:${bWin?'#2563eb':b==='TBD'?'#94a3b8':'#374151'};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;cursor:${b!=='TBD'?'pointer':'default'}" onclick="${b!=='TBD'?`openPlayerModal('${String(b).replace(/'/g,"\\'")}')`:''}">${b}</div>
          </div>
          ${hasScore?`<span style="font-size:11px;font-weight:900;color:${bWin?'#2563eb':'#94a3b8'};flex-shrink:0">${sb}</span>`:''}
          ${isLoggedIn?`<button class="btn btn-xs" style="font-size:10px;padding:0 6px" onclick="(function(){const v=prompt('B 슬롯 선수명 입력(빈칸=삭제, BYE 가능)', '${_esc(b==='TBD'?'':b)}'); if(v===null)return; setBracketSlot('${tn.id}',${ri},${mi},'b', (v||'').trim()); })()">✏️</button>`:''}
        </div>
        ${(md?.d||md?.map)?`<div style="padding:3px 12px;font-size:11px;font-weight:600;color:var(--text3);background:#f8fafc;border-top:1px solid #f1f5f9;display:flex;gap:8px">${md?.d?`<span>🗓️ ${(md.d||'').slice(2).replace(/-/g,'.')}</span>`:''}${md?.map?`<span>🗺️ ${md.map}</span>`:''}</div>`:''}
        ${isLoggedIn?`<div style="padding:5px 8px;background:#f8fafc;border-top:1px solid #f1f5f9;display:flex;gap:3px;flex-wrap:wrap">
          ${(a!=='TBD'&&b!=='TBD')?`<button class="btn btn-xs" style="flex:1;font-size:10px;${aWin?`background:#2563eb;color:#fff;border-color:#2563eb`:''}" onclick="setBracketWinner('${tn.id}',${ri},${mi},'${a.replace(/'/g,"\\'")}')">${a.slice(0,5)} 승</button>
          <button class="btn btn-xs" style="flex:1;font-size:10px;${bWin?`background:#2563eb;color:#fff;border-color:#2563eb`:''}" onclick="setBracketWinner('${tn.id}',${ri},${mi},'${b.replace(/'/g,"\\'")}')">${b.slice(0,5)} 승</button>`:''}
          <button class="btn btn-xs btn-r" style="font-size:10px;padding:0 6px" onclick="clearBracketWinner('${tn.id}',${ri},${mi})" title="승자 초기화">↩️</button>
        </div>`:''}
      </div>`;
    }
    h += `</div></div>`;
    if(ri < totalRounds-1) h += `<div style="width:28px;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:18px;color:#cbd5e1;font-weight:900;align-self:center;padding-top:36px">➔</div>`;
    h += `</div>`;
  }
  h += `</div></div>`;
  return h;
}
function setBracketWinner(tnId,rnd,mi,winner){
  const tn=tourneys.find(t=>t.id===tnId);if(!tn)return;
  const br=getBracket(tn);
  const key=`${rnd}-${mi}`;
  if(br.winners[key]===winner){br.winners[key]='';} // 토글 off
  else{br.winners[key]=winner;}
  save();render();
}
function clearBracketWinner(tnId,rnd,mi){
  const tn=tourneys.find(t=>t.id===tnId);if(!tn)return;
  const br=getBracket(tn);
  const key=`${rnd}-${mi}`;
  if(br.winners && Object.prototype.hasOwnProperty.call(br.winners, key)){
    delete br.winners[key];
  }
  save();render();
}
function setBracketSlot(tnId,rnd,mi,side,val){
  const tn=tourneys.find(t=>t.id===tnId);if(!tn)return;
  const br=getBracket(tn);
  br.slots[`${rnd}-${mi}-${side}`]=val;
  // 슬롯 바꾸면 해당 매치 승자 초기화
  delete br.winners[`${rnd}-${mi}`];
  save();render();
}
function setBracketChamp(tnId,val){
  const tn=tourneys.find(t=>t.id===tnId);if(!tn)return;
  getBracket(tn).champ=val;save();render();
}
function resetBracket(tnId){
  const tn=tourneys.find(t=>t.id===tnId);if(!tn)return;
  if(!confirm('브라켓을 초기화하시겠습니까?\n수동으로 입력한 팀 배치와 결과가 모두 삭제됩니다.'))return;
  tn.bracket={slots:{},winners:{},champ:''};save();render();
}

// (요청사항) 티어대회 토너먼트 강수(브라켓 크기) 선택 지원
// - tn.bracketOverrideSize: 2/4/8/16/32/64...
// - 강수를 바꾸면 기존 슬롯/결과가 의미가 없어질 수 있으므로 브라켓을 초기화한다.
function setTierBracketSize(tnId, size){
  const tn=(tourneys||[]).find(t=>t && t.id===tnId); if(!tn) return;
  const sz=parseInt(size,10)||0;
  if(sz<2) return;
  const cur=parseInt(tn.bracketOverrideSize||'0',10)||0;
  if(cur===sz) return;
  if(!confirm(`토너먼트 강수를 ${sz}강으로 변경할까요?\n\n⚠️ 강수를 변경하면 기존 대진표 슬롯/결과가 초기화됩니다.`)) return;
  tn.bracketOverrideSize = sz;
  // 브라켓 데이터 초기화
  tn.bracket = {slots:{},winners:{},champ:'',matchDetails:{}};
  save(); render();
}

/* ── 동적 브라켓 시각화 (스포츠 대진표 스타일) ── */
function rCompTourDynamic(tn){
  const grpRanks=(tn.groups&&tn.groups.length>=2)?tn.groups.map((grp,gi)=>{
    const gl='ABCDEFGHIJ'[gi]||String(gi+1);
    const color=['#2563eb','#dc2626','#16a34a','#d97706','#7c3aed','#0891b2'][gi%6];
    return{grpName:grp.name||('조'+gl),color,ranked:_calcGrpRank(grp)};
  }):[];

  const numGroups=grpRanks.length;
  const pairCount=Math.floor(numGroups/2)*2;
  const r1teams=[];
  for(let i=0;i<pairCount;i+=2){
    const gA=grpRanks[i],gB=grpRanks[i+1]||grpRanks[0];
    r1teams.push(
      {univ:gA.ranked[0]?.u||'',grpName:gA.grpName,color:gA.color,rank:1},
      {univ:gB.ranked[1]?.u||'',grpName:gB.grpName,color:gB.color,rank:2},
      {univ:gB.ranked[0]?.u||'',grpName:gB.grpName,color:gB.color,rank:1},
      {univ:gA.ranked[1]?.u||'',grpName:gA.grpName,color:gA.color,rank:2}
    );
  }
  if(numGroups%2===1){
    const last=grpRanks[numGroups-1];
    r1teams.push(
      {univ:last.ranked[0]?.u||'',grpName:last.grpName,color:last.color,rank:1},
      {univ:'',grpName:'와일드카드',color:'#6b7280',rank:'-'}
    );
  }

  const overrideSize=tn.bracketOverrideSize||0;
  const numTeams=overrideSize>1?overrideSize:(r1teams.length>0?r1teams.length:8);
  let totalRounds=0;
  {let n=numTeams;while(n>1){n=Math.ceil(n/2);totalRounds++;}}
  if(!totalRounds)totalRounds=1;

  const roundLabels={1:'결승',2:'준결승',3:'8강',4:'16강',5:'32강'};
  const br=getBracket(tn);
  const allU=getAllUnivs();
  const tnId=tn.id;
  const BASE_H=130; // px per R0 match slot

  // Build rounds data
  const rounds=[];
  for(let r=0;r<totalRounds;r++){
    const matchCount=Math.ceil(numTeams/Math.pow(2,r+1));
    const pairs=[];
    for(let mi=0;mi<matchCount;mi++){
      let tA=null,tB=null;
      if(r===0){
        const bA=r1teams[mi*2]||null,bB=r1teams[mi*2+1]||null;
        const sA=br.slots[`0-${mi}-a`],sB=br.slots[`0-${mi}-b`];
        tA=sA!==undefined?(sA?{univ:sA,color:gc(sA)}:null):(bA?.univ?bA:null);
        tB=sB!==undefined?(sB?{univ:sB,color:gc(sB)}:null):(bB?.univ?bB:null);
      }else{
        const pA=br.winners[`${r-1}-${mi*2}`]||null,pB=br.winners[`${r-1}-${mi*2+1}`]||null;
        const sA=br.slots[`${r}-${mi}-a`],sB=br.slots[`${r}-${mi}-b`];
        tA=sA!==undefined?(sA?{univ:sA,color:gc(sA)}:null):(pA?{univ:pA,color:gc(pA)}:null);
        tB=sB!==undefined?(sB?{univ:sB,color:gc(sB)}:null):(pB?{univ:pB,color:gc(pB)}:null);
      }
      pairs.push({a:tA,b:tB,winner:br.winners[`${r}-${mi}`]||null});
    }
    rounds.push(pairs);
  }

  // === 팀 슬롯 행 HTML ===
  function teamRow(team,isWin,isLose,rnd,mi,side,score,detailClick){
    const col=team?gc(team.univ):'#e2e8f0';
    const name=team?.univ||'';
    const tbd=!name;
    const bg=isWin?col+'1a':isLose?'#f8fafc':'var(--white)';
    const bc=isWin?col:tbd?'#e2e8f0':col+'55';
    const textCol=tbd?'#b0bec5':isLose?'#94a3b8':isWin?col:'var(--text)';
    const fw=isWin?800:isLose?500:600;
    const detAttr = detailClick ? ` onclick="openCompMatchDetailModal('${tnId}',null,${mi},${rnd},false)"` : '';
    const scoreEl=score!=null?`<span style="min-width:18px;text-align:center;font-size:13px;font-weight:800;color:${isWin?col:isLose?'#cbd5e1':'var(--text3)'};padding-right:8px;${detailClick?'cursor:pointer;text-decoration:underline;text-underline-offset:2px;':''}"${detAttr}>${score}</span>`:'';
    if(isLoggedIn){
      return `<div style="display:flex;align-items:center;height:36px;background:${bg};border-left:4px solid ${bc}">
        ${team?.grpName?`<span style="background:${team.color||col};color:#fff;font-size:9px;font-weight:800;padding:1px 4px;margin:0 3px;border-radius:3px;flex-shrink:0">${team.rank}</span>`:'<span style="width:3px;flex-shrink:0"></span>'}
        <select onchange="setBracketSlot('${tnId}',${rnd},${mi},'${side}',this.value)"
          style="flex:1;height:100%;border:none;background:transparent;font-size:12px;font-weight:${fw};color:${textCol};padding:0 5px;cursor:pointer;outline:none;min-width:0">
          <option value="">— 미정 —</option>
          ${allU.map(u=>`<option value="${u.name}"${name===u.name?' selected':''}>${u.name}</option>`).join('')}
        </select>
        ${scoreEl}
      </div>`;
    }
    return `<div style="display:flex;align-items:center;height:36px;padding:0 0 0 8px;gap:5px;background:${bg};border-left:4px solid ${bc}">
      ${team?.grpName?`<span style="background:${team.color||col};color:#fff;font-size:9px;font-weight:800;padding:1px 4px;border-radius:3px;flex-shrink:0">${team.rank}</span>`:''}
      <span style="flex:1;font-size:12px;font-weight:${fw};color:${textCol};overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${tbd?'미정':name}</span>
      ${scoreEl}
    </div>`;
  }

  // === 매치 카드 HTML ===
  function matchCard(pair,rnd,mi){
    const {a,b,winner}=pair;
    const aC=a?gc(a.univ):'#e2e8f0',bC=b?gc(b.univ):'#e2e8f0';
    const aWin=!!(winner&&winner===a?.univ),bWin=!!(winner&&winner===b?.univ);
    const isDone=!!winner;
    const bktKey=`${rnd}-${mi}`;
    const det=br.matchDetails?.[bktKey];
    const detDone=det&&det.sa!=null;
    const hasGames=det?.sets?.some(s=>(s.games||[]).some(g=>g.playerA||g.playerB));
    const detId=`bkt-det-${rnd}-${mi}`;
    let footer='';
    if(isLoggedIn&&a?.univ&&b?.univ){
      footer=`<div style="display:flex;gap:2px;padding:4px;background:var(--surface);border-top:1px solid var(--border);flex-wrap:wrap">
        <div style="display:flex;gap:2px;flex:1;min-width:0">
          <button onclick="setBracketWinner('${tnId}',${rnd},${mi},'${a.univ}')"
            style="flex:1;padding:2px 4px;border-radius:4px;border:1.5px solid ${aWin?aC:'#e2e8f0'};background:${aWin?aC+'22':'var(--white)'};font-size:10px;font-weight:700;color:${aWin?aC:'#94a3b8'};cursor:pointer;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0">
            ${aWin?'✅ ':''}${a.univ}승
          </button>
          <button onclick="setBracketWinner('${tnId}',${rnd},${mi},'${b.univ}')"
            style="flex:1;padding:2px 4px;border-radius:4px;border:1.5px solid ${bWin?bC:'#e2e8f0'};background:${bWin?bC+'22':'var(--white)'};font-size:10px;font-weight:700;color:${bWin?bC:'#94a3b8'};cursor:pointer;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0">
            ${bWin?'✅ ':''}${b.univ}승
          </button>
        </div>
        <div style="display:flex;gap:2px">
          <button onclick="openBracketMatchModal('${tnId}',${rnd},${mi},'${a.univ}','${b.univ}')"
            style="padding:2px 5px;border-radius:4px;border:1px solid #2563eb;background:#eff6ff;font-size:10px;color:#2563eb;cursor:pointer" title="결과 직접 입력">✏️</button>
          <button onclick="bracketMatchState={tnId:'${tnId}',rnd:${rnd},mi:${mi},teamA:'${a.univ}',teamB:'${b.univ}'};openBktPasteModal()"
            style="padding:2px 5px;border-radius:4px;border:1px solid #16a34a;background:#f0fdf4;font-size:10px;color:#16a34a;cursor:pointer" title="붙여넣기로 입력">📋</button>
          ${detDone?`<button onclick="openBktShareCard('${tnId}',${rnd},${mi})" style="padding:2px 5px;border-radius:4px;border:1px solid #7c3aed;background:#f5f3ff;font-size:10px;color:#7c3aed;cursor:pointer">🎴</button>`:''}
        </div>
      </div>`;
    }else if(!a?.univ||!b?.univ){
      footer=`<div style="font-size:9px;color:#94a3b8;text-align:center;padding:4px;border-top:1px solid #f1f5f9">팀 배정 후 입력</div>`;
    }
    const aSc=detDone?det.sa:null, bSc=detDone?det.sb:null;
    const _winCol = winner ? (winner===a?.univ?aC:winner===b?.univ?bC:'#64748b') : '#64748b';
    const _winRgb = _tcHexToRgbStr(_winCol);
    // 대진표(브라켓) 카드에도 양끝 색상 효과 적용
    const _bktFxCfg=(typeof _getRecSideFxCfg==='function')?_getRecSideFxCfg():{on:true,mode:'soft',intensity:68,length:25};
    const _bktFxOn=!!_bktFxCfg.on;
    const _bktFxMetrics=(typeof _buildRecSideFxMetrics==='function')?_buildRecSideFxMetrics(_bktFxCfg):null;
    const _bktFxMode=_bktFxMetrics?_bktFxMetrics.mode:'soft';
    const _bktFxVars=(_bktFxOn&&a?.univ&&b?.univ&&typeof _recSideFxVarStyle==='function')?_recSideFxVarStyle(aC,bC,_bktFxCfg):'';
    const _hexRgb=(h)=>{const s=String(h||'').replace('#','');if(s.length===6){const r=parseInt(s.slice(0,2),16),g=parseInt(s.slice(2,4),16),b=parseInt(s.slice(4,6),16);if(![r,g,b].some(isNaN))return r+','+g+','+b;}return'100,116,139';};
    const _bktSideRgbVars=`--rec-side-left-rgb:${_hexRgb(aC)};--rec-side-right-rgb:${_hexRgb(bC)};`;
    const _bktFxCls=(_bktFxOn&&a?.univ&&b?.univ)?` grp-sidefx grp-sidefx--${_bktFxMode}`:'';
    return `<div class="tc-card${_bktFxCls}" style="--tc-win-rgb:${_winRgb};${_bktSideRgbVars}${_bktFxVars}background:var(--white);border:1.5px solid ${isDone?aC+'66':'var(--border)'};border-radius:8px;overflow:hidden;width:185px;flex-shrink:0;box-shadow:0 1px 6px rgba(0,0,0,.07)">
      ${teamRow(a,aWin,bWin,rnd,mi,'a',aSc,detDone)}
      <div style="height:1px;background:var(--border)"></div>
      ${teamRow(b,bWin,aWin,rnd,mi,'b',bSc,detDone)}
      ${footer}
    </div>`;
  }

  // 팀 수 선택
  let sizeHTML='';
  if(isLoggedIn){
    sizeHTML=`<div class="no-export" style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-bottom:12px">
      <span style="font-size:12px;font-weight:700;color:var(--text3)">⚙️ 참가 팀 수:</span>
      ${[2,4,8,16].map(s=>`<button onclick="setBracketSize('${tnId}',${s})"
        style="padding:3px 10px;border-radius:6px;border:1.5px solid ${numTeams===s&&overrideSize>0?'var(--blue)':'var(--border2)'};background:${numTeams===s&&overrideSize>0?'var(--blue)':'var(--white)'};color:${numTeams===s&&overrideSize>0?'#fff':'var(--text3)'};font-size:12px;font-weight:700;cursor:pointer">${s}팀</button>`).join('')}
      ${overrideSize>0?`<button onclick="setBracketSize('${tnId}',0)" style="padding:3px 10px;border-radius:6px;border:1.5px solid #6b7280;background:var(--white);color:#6b7280;font-size:12px;cursor:pointer">🔄 자동</button>`:''}
      <span style="font-size:11px;color:var(--gray-l)">현재 ${numTeams}팀 / ${totalRounds}라운드</span>
      <button class="btn btn-w btn-xs" onclick="resetBracket('${tnId}')" title="브라켓 초기화">🔄 초기화</button>
    </div>`;
  }

  // 조별 순위 요약
  const grpSummary=grpRanks.length>0?`<div style="display:flex;flex-wrap:wrap;gap:7px;margin-bottom:14px">
    ${grpRanks.map(g=>`<div style="background:${g.color}10;border:1px solid ${g.color}44;border-radius:8px;padding:7px 11px;min-width:120px">
      <div style="font-size:11px;font-weight:800;color:${g.color};margin-bottom:5px">${g.grpName}</div>
      ${g.ranked.slice(0,2).map((s,ri)=>`<div style="display:flex;align-items:center;gap:4px;margin-bottom:2px">
        <span style="font-size:10px">${ri===0?'🥇':'🥈'}</span>
        <span style="background:${gc(s.u)};color:#fff;font-size:10px;font-weight:700;padding:1px 5px;border-radius:3px">${s.u}</span>
        <span style="font-size:9px;color:var(--gray-l)">${s.w}승${s.l}패</span>
      </div>`).join('')}
    </div>`).join('')}
  </div>`:`<div style="font-size:11px;color:var(--gray-l);margin-bottom:10px;padding:6px 10px;background:var(--surface);border-radius:6px">💡 조편성이 없습니다. 팀 수를 선택하고 슬롯에서 직접 팀을 배치하세요.</div>`;

  // 브라켓 레이아웃
  let bracketHTML=`<div style="display:inline-flex;align-items:flex-start;gap:0;padding-bottom:8px">`;
  for(let r=0;r<totalRounds;r++){
    const rNum=totalRounds-r;
    const rLabel=roundLabels[rNum]||(rNum+'강');
    const unitH=BASE_H*Math.pow(2,r);
    const matchCount=rounds[r].length;
    bracketHTML+=`<div style="display:flex;flex-direction:column">
      <div style="text-align:center;font-size:11px;font-weight:800;color:var(--blue);padding:5px 12px 10px;letter-spacing:.5px;white-space:nowrap">${rLabel}</div>`;
    for(let mi=0;mi<matchCount;mi++){
      bracketHTML+=`<div style="height:${unitH}px;display:flex;align-items:center;justify-content:center;padding:0 8px">
        ${matchCard(rounds[r][mi],r,mi)}
      </div>`;
    }
    bracketHTML+=`</div>`;
    // 연결선 (매치 중심점에서 정확히 연결)
    if(r<totalRounds-1){
      const CL=`var(--tc-line-w) solid rgba(var(--tc-line-rgb), var(--tc-line-a))`;
      const nextMatchCount=rounds[r+1].length;
      // 연결선 컬럼
      bracketHTML+=`<div style="display:flex;flex-direction:column;width:20px;padding-top:31px">`;
      for(let ci=0;ci<matchCount-1;ci+=2){
        // 4분할: 빈칸(상) / 꺾임선(하) / 꺾임선(상) / 빈칸(하)
        bracketHTML+=`<div style="height:${unitH}px;display:flex;flex-direction:column">
          <div style="flex:1"></div>
          <div style="flex:1;border-right:${CL};border-bottom:${CL};border-bottom-right-radius:3px"></div>
        </div>
        <div style="height:${unitH}px;display:flex;flex-direction:column">
          <div style="flex:1;border-right:${CL};border-top:${CL};border-top-right-radius:3px"></div>
          <div style="flex:1"></div>
        </div>`;
        if(ci+2<matchCount&&ci+2!==matchCount-1+(matchCount%2)){
          // 짝수 쌍 사이 여백 없음 (연속)
        }
      }
      if(matchCount%2===1){
        // 홀수 매치: 직선 연결
        bracketHTML+=`<div style="height:${unitH}px;display:flex;align-items:center">
          <div style="width:100%;border-top:${CL}"></div>
        </div>`;
      }
      bracketHTML+=`</div>`;
      // bridge 컬럼 (다음 라운드 매치 입력선)
      bracketHTML+=`<div style="display:flex;flex-direction:column;width:14px;padding-top:31px">`;
      for(let ni=0;ni<nextMatchCount;ni++){
        bracketHTML+=`<div style="height:${unitH*2}px;display:flex;align-items:center">
          <div style="width:100%;border-top:${CL}"></div>
        </div>`;
      }
      bracketHTML+=`</div>`;
    }
  }
  // 챔피언 박스 연결선
  const finalPairs=rounds[totalRounds-1]||[];
  const finalWinner=finalPairs[0]?.winner||br.champ||'';
  const cc=finalWinner?gc(finalWinner):'#d97706';
  const champUnitH=BASE_H*Math.pow(2,totalRounds-1);
  bracketHTML+=`<div style="display:flex;flex-direction:column;width:32px;padding-top:31px">
    <div style="height:${champUnitH}px;display:flex;align-items:center">
      <div style="width:100%;height:var(--tc-line-w);background:linear-gradient(90deg, rgba(var(--tc-line-rgb), var(--tc-line-a)), ${cc})"></div>
    </div>
  </div>`;
  // 챔피언 박스
  bracketHTML+=`<div style="display:flex;flex-direction:column;padding-top:31px">
    <div style="height:${champUnitH}px;display:flex;align-items:center;padding:0 8px">
      <div style="background:${cc}18;border:2.5px solid ${cc};border-radius:14px;padding:18px 22px;text-align:center;min-width:120px">
        <div style="font-size:9px;font-weight:800;color:#d97706;letter-spacing:2px;margin-bottom:6px">🏆 CHAMPION</div>
        <div style="font-size:28px;margin-bottom:6px">🏆</div>
        <div style="font-weight:900;font-size:15px;color:${cc};white-space:nowrap">${finalWinner||'?'}</div>
        ${isLoggedIn?`<select onchange="setBracketChamp('${tnId}',this.value)" style="margin-top:8px;font-size:11px;padding:3px 6px;border:1px solid ${cc}44;border-radius:6px;background:transparent;color:${cc};max-width:120px">
          <option value="">직접 지정...</option>
          ${allU.map(u=>`<option value="${u.name}"${finalWinner===u.name?' selected':''}>${u.name}</option>`).join('')}
        </select>`:''}
      </div>
    </div>
  </div>`;
  bracketHTML+=`</div>`;

  return `<div>
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;flex-wrap:wrap">
      <span style="font-weight:900;font-size:15px;color:var(--blue)">⚔️ ${tn.name} — 토너먼트 브라켓</span>
      ${isLoggedIn?`<span class="no-export" style="font-size:11px;color:var(--gray-l)">💡 슬롯 클릭으로 팀 변경 · 승 버튼으로 결과 입력</span>`:''}
    </div>
    ${finalWinner?`<div style="background:linear-gradient(135deg,#f59e0b,#d97706);border-radius:14px;padding:14px 20px;margin-bottom:16px;display:flex;align-items:center;gap:14px;box-shadow:0 4px 20px rgba(217,119,6,.35)">
      ${gUI(finalWinner,'52px')}
      <div>
        <div style="font-size:10px;color:rgba(255,255,255,.8);font-weight:700;letter-spacing:.5px">🏆 TOURNAMENT CHAMPION</div>
        <div style="font-size:20px;font-weight:900;color:#fff">${finalWinner}</div>
      </div>
      <div style="margin-left:auto;font-size:32px">👑</div>
    </div>`:''}
    ${sizeHTML}
    ${grpSummary}
    <div style="overflow-x:auto;padding-bottom:8px;-webkit-overflow-scrolling:touch;touch-action:pan-x">${bracketHTML}</div>
  </div>`;
}

function setBracketSize(tnId,size){
  const tn=tourneys.find(t=>t.id===tnId);if(!tn)return;
  if(size>0)tn.bracketOverrideSize=size;else delete tn.bracketOverrideSize;
  save();render();
}

function rCompPlayerRank(tn){
  if(!tn) return `<div style="padding:30px;text-align:center;color:var(--gray-l)">대회를 선택하세요.</div>`;
  const pStats={};
  function countGames(m){
    if(m.sa==null)return;
    (m.sets||[]).forEach(set=>{
      (set.games||[]).forEach(g=>{
        if(!g.playerA||!g.playerB||!g.winner)return;
        const wn=g.winner==='A'?g.playerA:g.playerB;const ln=g.winner==='A'?g.playerB:g.playerA;
        if(!pStats[wn])pStats[wn]={w:0,l:0};if(!pStats[ln])pStats[ln]={w:0,l:0};
        pStats[wn].w++;pStats[ln].l++;
      });
    });
  }
  (tn.groups||[]).forEach(grp=>{
    (grp.matches||[]).forEach(m=>countGames(m));
  });
  // 브라켓 경기 포함
  const br=getBracket(tn);
  Object.values(br.matchDetails||{}).forEach(m=>countGames(m));
  (br.manualMatches||[]).forEach(m=>{if(m)countGames(m);});
  if(!window._rankSort)window._rankSort={};
  const sk=window._rankSort['comp']||'rate';
  const sorted=Object.entries(pStats)
    .map(([name,s])=>({name,w:s.w,l:s.l,total:s.w+s.l,rate:s.w+s.l?Math.round(s.w/(s.w+s.l)*100):0}))
    .filter(p=>p.total>0)
    .sort((a,b)=>sk==='w'?b.w-a.w||b.rate-a.rate:sk==='l'?b.l-a.l||a.rate-b.rate:b.rate-a.rate||b.w-a.w);
  const sortBar=`<div class="sort-bar no-export" style="display:flex;align-items:center;gap:6px;margin-bottom:10px;flex-wrap:wrap"><button class="sort-btn ${sk==='rate'?'on':''}" onclick="window._rankSort['comp']='rate';render()">승률순</button><button class="sort-btn ${sk==='w'?'on':''}" onclick="window._rankSort['comp']='w';render()">승순</button><button class="sort-btn ${sk==='l'?'on':''}" onclick="window._rankSort['comp']='l';render()">패순</button></div>`;
  if(!sorted.length) return sortBar+`<div style="padding:40px;text-align:center;color:var(--gray-l);background:var(--surface);border-radius:10px">⏳ 아직 기록된 경기 결과가 없습니다.</div>`;
  if(!window._rankPage)window._rankPage={};
  const _PK='comp_rank';
  const _PAGE=20;
  if(window._rankPage[_PK]===undefined)window._rankPage[_PK]=0;
  const _tot=sorted.length;
  const _totP=Math.ceil(_tot/_PAGE)||1;
  if(window._rankPage[_PK]>=_totP)window._rankPage[_PK]=0;
  const _cp=window._rankPage[_PK];
  const _paged=_tot>_PAGE?sorted.slice(_cp*_PAGE,(_cp+1)*_PAGE):sorted;
  let h=sortBar+`<div style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:15px;color:var(--blue);margin-bottom:14px">🏅 ${tn.name} 개인 순위</div>
  <table><thead><tr><th style="text-align:left">순위</th><th style="text-align:left">이름</th><th style="text-align:left">소속</th><th>승</th><th>패</th><th>승차</th><th>승률</th></tr></thead><tbody>`;
  _paged.forEach((p,i)=>{
    const pObj=players.find(x=>x.name===p.name);const col=pObj?gc(pObj.univ):'#888';
    const diff=p.w-p.l;
    const _ri=_cp*_PAGE+i;
    h+=`<tr>
      <td style="text-align:left">${_ri===0?`<span class="rk1">1등</span>`:_ri===1?`<span class="rk2">2등</span>`:_ri===2?`<span class="rk3">3등</span>`:`${_ri+1}위`}</td>
      <td style="text-align:left"><span style="display:inline-flex;align-items:center;gap:7px">${typeof getPlayerPhotoHTML==='function'?getPlayerPhotoHTML(p.name,'34px'):''}<span class="clickable-name" style="font-weight:700;font-size:14px" onclick="openPlayerModal('${escJS(p.name)}')">${p.name}</span></span></td>
      <td style="text-align:left">${pObj?`<span class="ubadge" style="background:${col};font-size:11px">${pObj.univ}</span>`:'-'}</td>
      <td class="wt" style="font-weight:800">${p.w}</td><td class="lt" style="font-weight:800">${p.l}</td>
      <td style="font-weight:800;color:${diff>0?'var(--green)':diff<0?'var(--red)':'var(--gray-l)'}">${diff>=0?'+':''}${diff}</td>
      <td style="font-weight:700;color:${p.rate>=50?'var(--green)':'var(--red)'}">${p.total?p.rate+'%':'-'}</td>
    </tr>`;
  });
  const _pageNav=_tot>_PAGE?`<div style="display:flex;justify-content:center;align-items:center;gap:10px;margin-top:12px;flex-wrap:wrap">
  <button class="btn btn-sm" ${_cp===0?'disabled':''} onclick="if(!window._rankPage)window._rankPage={};window._rankPage['${_PK}']=${_cp-1};render()">← 이전</button>
  <span style="font-size:12px;color:var(--gray-l)">${_cp+1} / ${_totP} (${_tot}명)</span>
  <button class="btn btn-sm" ${_cp>=_totP-1?'disabled':''} onclick="if(!window._rankPage)window._rankPage={};window._rankPage['${_PK}']=${_cp+1};render()">다음 →</button>
</div>`:'';
  return h+`</tbody></table>`+_pageNav;
}

function grpToggleTierFilter(t){
  if(!window._grpTierFilters)window._grpTierFilters=[];
  const i=window._grpTierFilters.indexOf(t);
  if(i>=0)window._grpTierFilters.splice(i,1);else window._grpTierFilters.push(t);
  render();
}

function rCompGrpEdit(){
  if(!isLoggedIn) return `<div style="padding:30px;text-align:center;color:var(--gray-l)">로그인 후 이용 가능합니다.</div>`;
  if(grpSub==='edit'&&grpEditId) return rGrpEditInner();
  if(!window._grpTierFilters)window._grpTierFilters=[];
  const tfs=window._grpTierFilters;
  let h=`<div class="grp-edit-header">
    <span style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:15px;color:var(--blue)">🏗️ 대회 조편성 관리</span>
    <button class="btn btn-b btn-sm" onclick="grpNewTourney()">+ 새 대회 만들기</button>
    <div style="margin-left:auto;display:flex;gap:5px;align-items:center;flex-wrap:wrap">
      <span style="font-size:11px;font-weight:700;color:var(--gray-l)">출전 티어 <span style="font-weight:400;font-size:10px">(복수선택)</span>:</span>
      <button class="tier-filter-btn ${tfs.length===0?'on':''}" onclick="window._grpTierFilters=[];render()">전체</button>
      ${TIERS.map(t=>{const _bg=getTierBtnColor(t),_tc=getTierBtnTextColor(t),_on=tfs.includes(t);return`<button class="tier-filter-btn ${_on?'on':''}" style="${_on?`background:${_bg};color:${_tc};border-color:${_bg}`:''}" onclick="grpToggleTierFilter('${t}')">${getTierLabel(t)}</button>`;}).join('')}
    </div>
  </div>`;
  if(!tourneys.length){h+=`<div style="padding:40px;text-align:center;color:var(--gray-l);background:var(--surface);border-radius:10px;border:2px dashed var(--border2)">등록된 대회가 없습니다.</div>`;return h;}
  tourneys.forEach((tn,ti)=>{
    const isActive=tn.name===curComp;
    h+=`<div style="background:${isActive?'var(--blue-l)':'var(--surface)'};border:${isActive?'2px solid var(--blue)':'1px solid var(--border)'};border-radius:12px;padding:16px 20px;margin-bottom:12px">
      <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:10px">
        <span style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:15px">${isActive?'✅ ':''} ${tn.name}</span>
        <span style="font-size:11px;color:var(--gray-l)">${(tn.groups||[]).length}개조 / ${(tn.groups||[]).reduce((s,g)=>s+(g.matches||[]).length,0)}경기</span>
        <div style="margin-left:auto;display:flex;gap:6px;flex-wrap:wrap">
          ${!isActive?`<button class="btn btn-b btn-xs" onclick="curComp='${tn.name}';save();render()">현재 대회로 설정</button>`:'<span style="font-size:11px;color:var(--blue);font-weight:700">📌 현재 대회</span>'}
          <button class="btn btn-w btn-xs" onclick="grpEditId='${tn.id}';grpSub='edit';render()">📝 조편성 입력</button>
          <button class="btn btn-r btn-xs" onclick="grpDelTourney(${ti})">🗑️ 삭제</button>
        </div>
      </div>
      ${tn.groups.length?`<div style="display:flex;gap:6px;flex-wrap:wrap">${tn.groups.map((g,gi)=>{const gl='ABCDEFGHIJ'[gi];const col=['#2563eb','#dc2626','#16a34a','#d97706','#7c3aed','#0891b2'][gi%6];return `<span style="background:${col};color:#fff;padding:2px 12px;border-radius:20px;font-size:11px;font-weight:700">GROUP ${gl}조 (${g.univs.length}팀, ${(g.matches||[]).length}경기)</span>`;}).join('')}</div>`:'<span style="font-size:11px;color:var(--gray-l)">조 없음</span>'}
    </div>`;
  });
  return h;
}

function rGrpEditInner(){
  const tn=tourneys.find(t=>t.id===grpEditId);
  if(!tn){grpSub='list';render();return '';}
  const isTier=tn.type==='tier';
  const _memberLbl=isTier?'선수':'대학';
  const _memberUnit=isTier?'명':'개';
  const GL='ABCDEFGHIJ';
  let h=`<div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;flex-wrap:wrap">
    <button class="btn btn-w btn-sm" onclick="grpSub='list';render()">← 목록</button>
    <span style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:16px">🏆 ${tn.name} — 조편성</span>
    <button class="btn btn-b btn-sm" style="margin-left:auto" onclick="grpAddGroup('${tn.id}')">+ ${GL[tn.groups.length]||'?'}조 추가</button>
  </div>`;
  if(!tn.groups.length){
    h+=`<div style="text-align:center;padding:50px;background:var(--surface);border-radius:12px;border:2px dashed var(--border2)">
      <div style="font-size:32px;margin-bottom:12px">🏆</div>
      <div style="font-weight:700;margin-bottom:10px">A조부터 순차적으로 조를 만들어주세요</div>
      <button class="btn btn-b" onclick="grpAddGroup('${tn.id}')">+ GROUP A조 만들기</button>
    </div>`;
    return h;
  }
  tn.groups.forEach((grp,gi)=>{
    const gl=GL[gi]||gi;const col=['#2563eb','#dc2626','#16a34a','#d97706','#7c3aed','#0891b2'][gi%6];
    const availU=isTier
      ?(players||[]).filter(p=>p.name&&!grp.univs.includes(p.name)).map(p=>p.name)
      :getAllUnivs().map(u=>u.name).filter(n=>!grp.univs.includes(n));
    const _badgeCol=(name)=>isTier?gc((players||[]).find(p=>p.name===name)?.univ||''):gc(name);
    h+=`<div style="background:${col}08;border:2px solid ${col}44;border-radius:12px;padding:16px;margin-bottom:16px">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:14px;flex-wrap:wrap">
        <span style="background:${col};color:#fff;font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:14px;padding:3px 16px;border-radius:20px">GROUP ${gl}조</span>
        <span style="font-size:11px;color:var(--gray-l)">${grp.univs.length}${_memberUnit} ${_memberLbl} · ${(grp.matches||[]).length}경기</span>
        <button class="btn btn-r btn-xs" style="margin-left:auto" onclick="grpDelGroup('${tn.id}',${gi})">조 삭제</button>
      </div>
      <div style="margin-bottom:14px">
        <div style="font-size:12px;font-weight:700;color:${col};margin-bottom:8px">① ${_memberLbl} 선택</div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px">
          ${grp.univs.map((u,ui)=>`<span class="ubadge" style="background:${_badgeCol(u)};font-size:12px">${u}<button onclick="grpRemoveUniv('${tn.id}',${gi},${ui})" style="background:rgba(255,255,255,.3);border:none;border-radius:50%;color:#fff;width:16px;height:16px;font-size:9px;cursor:pointer;margin-left:3px;line-height:16px;text-align:center">×</button></span>`).join('')}
          ${!grp.univs.length?`<span style="color:var(--gray-l);font-size:12px">아직 없음</span>`:''}
        </div>
        ${availU.length?`<div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap">
          <div style="position:relative;flex:1;min-width:150px">
            <input type="text" id="grp-univ-search-${gi}" placeholder="🔍 ${_memberLbl} 검색..." style="width:100%;padding:6px 10px;font-size:12px;border:1px solid var(--border2);border-radius:6px" oninput="grpFilterUnivSel(${gi})">
          </div>
          <select id="grp-univ-sel-${gi}" style="max-width:200px"><option value="">— ${_memberLbl} 선택 —</option>${availU.map(u=>`<option value="${u}">${u}</option>`).join('')}</select>
          <button class="btn btn-b btn-sm" onclick="grpAddUniv('${tn.id}',${gi})">+ 추가</button>
        </div>`:`<div style="font-size:11px;color:var(--gray-l)">모든 ${_memberLbl}이 추가됨</div>`}
      </div>
      <div>
        <div style="font-size:12px;font-weight:700;color:${col};margin-bottom:8px">② 경기 일정 (${(grp.matches||[]).length}경기 등록)</div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;margin:-2px 0 10px">
          <button class="btn btn-p btn-xs" onclick="openCompLeaguePasteModal('${tn.id}',${gi})">📋 경기 결과 붙여넣기</button>
          <span style="font-size:11px;color:var(--gray-l);align-self:center">※ 해당 조에 경기(1줄=1게임)를 일괄 추가</span>
        </div>
        ${(grp.matches||[]).length?`<div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px">${grp.matches.map((m,mi)=>{
          const isDone=m.sa!=null&&m.sb!=null;
          const ca=isTier?gc((players||[]).find(p=>p.name===m.a)?.univ||''):gc(m.a||'');
          const cb=isTier?gc((players||[]).find(p=>p.name===m.b)?.univ||''):gc(m.b||'');
          const aWin=isDone&&Number(m.sa)>Number(m.sb), bWin=isDone&&Number(m.sb)>Number(m.sa);
          const aLogo = isTier ? '' : gUI(m.a||'', '14px');
          const bLogo = isTier ? '' : gUI(m.b||'', '14px');
          return `<div style="background:var(--white);border:1px solid var(--border);border-radius:8px;padding:7px 12px;font-size:12px;display:flex;align-items:center;gap:6px;flex-wrap:wrap">
            <span style="font-size:10px;font-weight:700;color:${col}">${gl}조 ${mi+1}경기</span>
            ${m.d?`<span style="font-size:11px;font-weight:600;color:var(--text3)">${m.d.slice(2).replace(/-/g,'/')}</span>`:''}
            <span style="display:inline-flex;align-items:center;gap:5px;background:${ca||'#888'};color:#fff;padding:${aWin?'2px 9px':'1px 7px'};border-radius:6px;font-size:${aWin?'11px':'10px'};font-weight:900;transform:${bWin?'scale(.94)':'none'};opacity:${bWin?'.76':'1'}">${aLogo}${m.a||'?'}</span>
            <span style="color:var(--gray-l)">vs</span>
            <span style="display:inline-flex;align-items:center;gap:5px;background:${cb||'#888'};color:#fff;padding:${bWin?'2px 9px':'1px 7px'};border-radius:6px;font-size:${bWin?'11px':'10px'};font-weight:900;transform:${aWin?'scale(.94)':'none'};opacity:${aWin?'.76':'1'}">${bLogo}${m.b||'?'}</span>
            ${isDone?`<span style="font-weight:800;font-size:12px"><span class="wt">${m.sa}</span>:<span class="lt">${m.sb}</span></span>`:'<span style="font-size:10px;color:var(--gray-l)">예정</span>'}
            <button class="btn btn-b btn-xs" onclick="grpEditMatch('${tn.id}',${gi},${mi})">✏️ 결과입력</button>
            <button class="btn btn-r btn-xs" onclick="grpDelMatch('${tn.id}',${gi},${mi})">×</button>
          </div>`;
        }).join('')}</div>`:''}
        ${grp.univs.length>=2?`<button class="btn btn-b btn-sm" onclick="grpAddMatch('${tn.id}',${gi})">+ ${gl}조 경기 추가</button>`:`<span style="font-size:11px;color:var(--gray-l)">※ ${_memberLbl} 2${_memberUnit} 이상 추가 후 경기 등록 가능</span>`}
      </div>
    </div>`;
  });
  return h;
}


/* ══════════════════════════════════════
   브라켓 경기 상세 입력
══════════════════════════════════════ */


