/* ══════════════════════════════════════
   🔧 구버전 티어대회 데이터 1회 마이그레이션
══════════════════════════════════════ */
let _ttMigrated = false;
function _migrateTierTourneys(){
  if(_ttMigrated) return;
  _ttMigrated = true;
  let changed = false;
  (tourneys||[]).filter(t=>t.type==='tier').forEach(tn=>{
    if(!tn.id){tn.id=genId();changed=true;}
    if(!tn.groups){tn.groups=[];changed=true;}
    if(!tn.bracket){tn.bracket={slots:{},winners:{},champ:''};changed=true;}
  });
  // 기존 브라켓 기록(_proKey가 ptn_으로 시작)에 stage:'bkt' 추가 및 _proKey 제거
  (ttM||[]).forEach(r=>{
    if(r._proKey && r._proKey.startsWith('ptn_')){
      if(!r.stage){ r.stage='bkt'; changed=true; }
      delete r._proKey; changed=true;
    }
  });
  if(changed) save();
}

/* ══════════════════════════════════════
   📋 대회 경기 붙여넣기 일괄 입력
══════════════════════════════════════ */
let _grpPasteState = null; // {mode:'grp', tnId, gi, mi} or {mode:'bkt', tnId, rnd, mi}

/* ── 브라켓 경기 붙여넣기 ── */
function rTierTourTab(C, T){
  _migrateTierTourneys();
  T.innerText = '🎯 티어대회';
  if(!isLoggedIn && _ttSub==='input') _ttSub='records';
  const tierTourneys = (tourneys||[]).filter(t=>t.type==='tier');
  if(_ttCurComp && !tierTourneys.find(t=>t.name===_ttCurComp)) _ttCurComp='';
  if(!_ttCurComp && tierTourneys.length) _ttCurComp=tierTourneys[0].name;
  let h='';
  h+=`<div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;flex-wrap:wrap;padding:12px 16px;background:#f5f3ff;border:1px solid #ddd6fe;border-radius:10px">
    <span style="font-weight:700;color:#7c3aed;white-space:nowrap">🎯 티어대회 선택:</span>
    <select style="flex:1;max-width:220px;font-weight:700" onchange="_ttCurComp=this.value;render()">
      <option value="">— 대회를 선택하세요 —</option>
      ${tierTourneys.map(t=>{const _tDates=[];(t.groups||[]).forEach(g=>(g.matches||[]).forEach(m=>{if(m.d&&m.sa!=null)_tDates.push(m.d);}));(ttM||[]).filter(m=>m.compName===t.name&&m.d).forEach(m=>_tDates.push(m.d));_tDates.sort();const _ds=_tDates.length?` (${_tDates[0].slice(2).replace(/-/g,'/')}${_tDates.length>1&&_tDates[0]!==_tDates[_tDates.length-1]?'~'+_tDates[_tDates.length-1].slice(2).replace(/-/g,'/'):''})`:(t.createdAt?` (${t.createdAt.slice(0,10)})`:'');return`<option value="${t.name}"${_ttCurComp===t.name?' selected':''}>${t.name}${_ds}</option>`;}).join('')}
    </select>
    ${isLoggedIn?`<button class="btn btn-p btn-xs" onclick="grpNewTierTourney()">+ 추가</button>`:''}
    ${_ttCurComp&&isLoggedIn?`<button class="btn btn-w btn-xs" onclick="grpRenameTierTourney()" title="대회명 수정">✏️ 이름수정</button>
    <button class="btn btn-r btn-xs" onclick="grpDelTierTourney()" title="현재 티어대회 삭제">🗑️ 삭제</button>`:''}
  </div>`;
  if(!tierTourneys.length){
    h+=`<div style="padding:60px 20px;text-align:center;color:var(--gray-l)">생성된 티어대회가 없습니다.</div>`;
    C.innerHTML=h; return;
  }
  const _curTierTn=(tourneys||[]).find(t=>t.name===_ttCurComp&&t.type==='tier');
  // 유효하지 않은 _ttSub 리셋
  const _validSubs=['input','records','rank','league','grprank','tourschedule','grpedit'];
  if(!_validSubs.includes(_ttSub)) _ttSub='records';
  if(_ttSub==='input'&&!isLoggedIn) _ttSub='records';
  if(_ttSub==='grpedit'&&!isLoggedIn) _ttSub='records';
  const subOpts=[
    ...(isLoggedIn?[{id:'input',lbl:'📝 경기 입력',fn:`_ttSub='input';render()`}]:[]),
    {id:'records',lbl:'📋 기록',fn:`_ttSub='records';openDetails={};render()`},
    {id:'rank',lbl:'🏆 개인 순위',fn:`_ttSub='rank';render()`},
    {id:'league',lbl:'📅 조별리그',fn:`_ttSub='league';render()`},
    {id:'grprank',lbl:'📊 조별 순위',fn:`_ttSub='grprank';render()`},
    {id:'tourschedule',lbl:'🗂️ 토너먼트',fn:`_ttSub='tourschedule';render()`},
    ...(isLoggedIn?[{id:'grpedit',lbl:'🏗️ 조편성',fn:`_ttSub='grpedit';grpSub='edit';render()`}]:[]),
  ];
  h+=`<div class="stabs no-export">${subOpts.map(o=>`<button class="stab ${_ttSub===o.id?'on':''}" onclick="${o.fn}">${o.lbl}</button>`).join('')}</div>`;
  const _noTnMsg='<div style="padding:40px;text-align:center;color:var(--gray-l)">대회를 선택하세요.</div>';
  if(_ttSub==='input' && isLoggedIn){
    if(!BLD['tt'])BLD['tt']={date:'',tiers:[],membersA:[],membersB:[],sets:[]};
    h+=buildTierTourInputHTML();
  } else if(_ttSub==='rank'){
    h+=ttPlayerRankHTML(_ttCurComp);
  } else if(_ttSub==='league'){
    h+=_curTierTn ? rCompLeague(_curTierTn) : _noTnMsg;
  } else if(_ttSub==='grprank'){
    h+=_curTierTn ? rCompGrpRankFull(_curTierTn) : _noTnMsg;
  } else if(_ttSub==='tourschedule'){
    h+=_curTierTn ? proCompBracket(_curTierTn) : _noTnMsg;
  } else if(_ttSub==='grpedit'){
    if(!_curTierTn){ h+=_noTnMsg; C.innerHTML=h; return; }
    // grpSub='list'은 rGrpEditInner의 '← 목록' 버튼에서 발생 → 기록 탭으로 전환
    if(grpSub!=='edit'){ _ttSub='records'; C.innerHTML=h; render(); return; }
    grpEditId=_curTierTn.id;
    h+=rGrpEditInner();
  } else {
    // records 탭
    const _ttFiltered=_ttCurComp ? ttM.filter(m=>m.compName===_ttCurComp) : ttM;
    if(_ttCurComp) h+=`<div style="background:#f5f3ff;border:1px solid #ddd6fe;border-radius:8px;padding:8px 14px;margin-bottom:10px;font-size:12px;color:#7c3aed;font-weight:700">🎯 ${_ttCurComp} 기록</div>`;
    
    h+=_ttFiltered.length?recSummaryListHTML(_ttFiltered,'tt','tiertour'):'<div style="padding:40px;text-align:center;color:var(--gray-l)">기록이 없습니다.</div>';
  }
  C.innerHTML=h;
}

// 스트리머 상세 최근 기록에서 티어대회 클릭 → 해당 경기로 이동
function navToTierMatch(matchId){
  let m=(ttM||[]).find(x=>x._id===matchId);
  if(!m&&matchId){for(const tn of (tourneys||[]).filter(t=>t.type==='tier')){for(const grp of (tn.groups||[])){const found=(grp.matches||[]).find(x=>x._id===matchId);if(found&&found.sa!=null){const _rec={_id:matchId,d:found.d,a:found.a,b:found.b,sa:found.sa,sb:found.sb,sets:found.sets,n:tn.name,compName:tn.name,teamALabel:found.a,teamBLabel:found.b,stage:'league'};if(!ttM)ttM=[];ttM.unshift(_rec);save();m=_rec;break;}}if(m)break;}}
  if(m&&m.compName) _ttCurComp=m.compName;
  _ttSub='records';
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
    const idx=(ttM||[]).indexOf(m);
    const key='tiertour-tt-'+idx;
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
  const filtered=compName ? ttM.filter(m=>m.compName===compName) : ttM;
  const sc={};
  filtered.forEach(m=>{
    (m.sets||[]).forEach(st=>{
      (st.games||[]).forEach(g=>{
        let wn, ln;
        if(g.wName&&g.lName){wn=g.wName;ln=g.lName;}
        else if(g.playerA&&g.playerB&&g.winner){wn=g.winner==='A'?g.playerA:g.playerB;ln=g.winner==='A'?g.playerB:g.playerA;}
        else return;
        if(!sc[wn])sc[wn]={w:0,l:0,univ:''};
        if(!sc[ln])sc[ln]={w:0,l:0,univ:''};
        sc[wn].w++;sc[ln].l++;
        if(!sc[wn].univ){const p=players.find(x=>x.name===wn);if(p)sc[wn].univ=p.univ||'';}
        if(!sc[ln].univ){const p=players.find(x=>x.name===ln);if(p)sc[ln].univ=p.univ||'';}
      });
    });
  });
  if(!window._rankSort)window._rankSort={};
  const sk=window._rankSort['tt']||'rate';
  const sortBar=`<div class="sort-bar no-export" style="display:flex;align-items:center;gap:6px;margin-bottom:10px;flex-wrap:wrap"><span style="font-size:11px;font-weight:700;color:var(--text3)">정렬:</span><button class="sort-btn ${sk==='rate'?'on':''}" onclick="window._rankSort['tt']='rate';render()">승률순</button><button class="sort-btn ${sk==='w'?'on':''}" onclick="window._rankSort['tt']='w';render()">승순</button><button class="sort-btn ${sk==='l'?'on':''}" onclick="window._rankSort['tt']='l';render()">패순</button></div>`;
  const entries=Object.entries(sc).filter(([,s])=>s.w+s.l>0).map(([name,s])=>({name,w:s.w,l:s.l,total:s.w+s.l,rate:s.w+s.l?Math.round(s.w/(s.w+s.l)*100):0,univ:sc[name].univ}));
  entries.sort((a,b)=>sk==='w'?b.w-a.w||b.rate-a.rate:sk==='l'?b.l-a.l||a.rate-b.rate:b.rate-a.rate||b.w-a.w);
  if(!entries.length) return sortBar+`<div style="padding:40px;text-align:center;color:var(--gray-l)">기록이 없습니다.<br><span style="font-size:11px">경기 입력 시 선수 매칭 정보가 있어야 집계됩니다.</span></div>`;
  if(!window._rankPage)window._rankPage={};
  const _PK='tt_rank';
  const _PAGE=20;
  if(window._rankPage[_PK]===undefined)window._rankPage[_PK]=0;
  const _tot=entries.length;
  const _totP=Math.ceil(_tot/_PAGE)||1;
  if(window._rankPage[_PK]>=_totP)window._rankPage[_PK]=0;
  const _cp=window._rankPage[_PK];
  const _paged=_tot>_PAGE?entries.slice(_cp*_PAGE,(_cp+1)*_PAGE):entries;
  let h=sortBar+`<div style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:14px;color:#7c3aed;margin-bottom:10px;padding-bottom:5px;border-bottom:2px solid #ddd6fe">🏆 티어대회 개인 순위${compName?` — ${compName}`:''}</div>
  <table><thead><tr><th>순위</th><th style="text-align:left">스트리머</th><th>게임 승</th><th>게임 패</th><th>승률</th></tr></thead><tbody>`;
  _paged.forEach((p,i)=>{
    const col=gc(p.univ);
    const _ri=_cp*_PAGE+i;
    let rnk=_ri===0?`<span class="rk1">1등</span>`:_ri===1?`<span class="rk2">2등</span>`:_ri===2?`<span class="rk3">3등</span>`:`<span style="font-weight:900">${_ri+1}위</span>`;
    h+=`<tr><td>${rnk}</td><td style="text-align:left"><span style="display:inline-flex;align-items:center;gap:6px;cursor:pointer" onclick="openPlayerModal('${p.name.replace(/'/g,"\\'")}')">${getPlayerPhotoHTML(p.name,'32px')}<span style="font-weight:700;font-size:14px">${p.name}</span>${p.univ?`<span class="ubadge" style="background:${col};font-size:9px">${p.univ}</span>`:''}</span></td><td class="wt">${p.w}</td><td class="lt">${p.l}</td><td style="font-weight:700;color:${p.rate>=50?'#16a34a':'#dc2626'}">${p.rate}%</td></tr>`;
  });
  const _pageNav=_tot>_PAGE?`<div style="display:flex;justify-content:center;align-items:center;gap:10px;margin-top:12px;flex-wrap:wrap">
  <button class="btn btn-sm" ${_cp===0?'disabled':''} onclick="if(!window._rankPage)window._rankPage={};window._rankPage['${_PK}']=${_cp-1};render()">← 이전</button>
  <span style="font-size:12px;color:var(--gray-l)">${_cp+1} / ${_totP} (${_tot}명)</span>
  <button class="btn btn-sm" ${_cp>=_totP-1?'disabled':''} onclick="if(!window._rankPage)window._rankPage={};window._rankPage['${_PK}']=${_cp+1};render()">다음 →</button>
</div>`:'';
  return h+`</tbody></table>`+_pageNav;
}

function rTierTour(){
  if(!isLoggedIn && _ttSub==='input') _ttSub='records';
  const subOpts=[
    {id:'input',lbl:'📝 경기 입력',fn:`_ttSub='input';render()`},
    {id:'records',lbl:'📋 기록',fn:`_ttSub='records';openDetails={};render()`}
  ];
  let h=stabs(_ttSub,subOpts);
  if(_ttSub==='input' && isLoggedIn){
    if(!BLD['tt'])BLD['tt']={date:'',tiers:[],membersA:[],membersB:[],sets:[]};
    h+=buildTierTourInputHTML();
  } else {
    // 현재 선택된 대회의 기록만 표시
    const _curTnName=_ttCurComp||'';
    const _ttFiltered=_curTnName
      ? ttM.filter(m=>m.compName===_curTnName)
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
    <div style="margin-bottom:12px"><button class="btn btn-p btn-sm" onclick="openTTPasteModal()" style="display:inline-flex;align-items:center;gap:5px">📋 자동인식</button><span style="font-size:11px;color:var(--gray-l);margin-left:8px">텍스트 붙여넣기 지원</span></div>
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;flex-wrap:wrap">
      <label style="font-size:12px;font-weight:700;color:var(--blue)">날짜</label>
      <input type="date" value="${bld.date||''}" onchange="BLD['tt'].date=this.value">
    </div>

    <!-- 참가 티어 선택 -->
    <div style="background:var(--blue-l);border:1px solid var(--blue-ll);border-radius:10px;padding:10px 14px;margin-bottom:14px">
      <div style="font-size:12px;font-weight:700;color:var(--blue);margin-bottom:8px">① 참가 티어 <span style="font-weight:400;color:var(--gray-l)">(복수 선택)</span></div>
      <div style="display:flex;gap:5px;flex-wrap:wrap">
        <button class="tier-filter-btn ${tfs.length===0?'on':''}" onclick="BLD['tt'].tiers=[];BLD['tt'].membersA=[];BLD['tt'].membersB=[];BLD['tt'].sets=[];render()">전체</button>
        ${TIERS.map(t=>{const _bg=getTierBtnColor(t),_tc=getTierBtnTextColor(t),_on=tfs.includes(t);return`<button class="tier-filter-btn ${_on?'on':''}" style="${_on?`background:${_bg};color:${_tc};border-color:${_bg}`:''}" onclick="ttToggleTier('${t}')">${getTierLabel(t)}</button>`;}).join('')}
      </div>
      <div style="font-size:11px;color:var(--blue);margin-top:6px">대상 선수: <strong>${eligible.length}명</strong></div>
    </div>

    <!-- 선수 목록 클릭으로 팀 배정 -->
    <div style="margin-bottom:14px">
      <div style="font-size:12px;font-weight:700;color:var(--text2);margin-bottom:8px">② 선수 클릭 → 팀 배정 <span style="font-weight:400;color:var(--gray-l);font-size:11px">(A팀 버튼 / B팀 버튼으로 추가)</span></div>
      <div style="display:flex;flex-wrap:wrap;gap:6px;padding:10px;background:var(--surface);border:1px solid var(--border);border-radius:8px;max-height:200px;overflow-y:auto">
        ${eligible.length===0
          ?'<span style="color:var(--gray-l);font-size:12px">티어를 선택하면 선수 목록이 표시됩니다</span>'
          :eligible.map(p=>{
              const inA=mA.some(m=>m.name===p.name);
              const inB=mB.some(m=>m.name===p.name);
              const bg=inA?'#2563eb':inB?'#dc2626':gc(p.univ);
              if(inA||inB){
                return `<span style="display:inline-flex;align-items:center;gap:3px;background:${bg};color:#fff;padding:4px 8px;border-radius:6px;font-size:11px;opacity:0.55">${p.name}<span style="opacity:.8;font-size:10px;margin-left:2px">${p.univ}/${p.tier}</span><span style="background:rgba(255,255,255,.3);border-radius:2px;padding:0 4px;font-size:9px;font-weight:800;margin-left:3px">${inA?'A팀':'B팀'}</span></span>`;
              }
              return `<span style="display:inline-flex;align-items:center;gap:4px;background:${bg};color:#fff;padding:3px 6px;border-radius:6px;font-size:11px">
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
        <div style="display:flex;gap:6px;margin-bottom:6px">
          <input type="text" id="tt-a-search" placeholder="🔍 이름·메모 검색..." style="flex:1;padding:5px 8px;border:1px solid var(--border2);border-radius:6px;font-size:12px" oninput="ttSearchPlayer('A')">
        </div>
        <div id="tt-a-drop" style="display:none;max-height:140px;overflow-y:auto;border:1px solid var(--border2);border-radius:6px;background:var(--white);margin-bottom:6px"></div>
        <div>${mA.map((m,i)=>`<span class="mem-tag" style="background:${gc(m.univ)}">${m.name}<span style="font-size:10px;opacity:.8">(${m.univ}${m.tier?'/'+m.tier:''})</span><button onclick="BLD['tt'].membersA.splice(${i},1);BLD['tt'].sets=[];render()">×</button></span>`).join('')||'<span style="color:var(--gray-l);font-size:12px">선수 없음</span>'}</div>
      </div>
      <div class="ck-panel">
        <h4>🔴 팀 B (${mB.length}명)</h4>
        <div style="display:flex;gap:6px;margin-bottom:6px">
          <input type="text" id="tt-b-search" placeholder="🔍 이름·메모 검색..." style="flex:1;padding:5px 8px;border:1px solid var(--border2);border-radius:6px;font-size:12px" oninput="ttSearchPlayer('B')">
        </div>
        <div id="tt-b-drop" style="display:none;max-height:140px;overflow-y:auto;border:1px solid var(--border2);border-radius:6px;background:var(--white);margin-bottom:6px"></div>
        <div>${mB.map((m,i)=>`<span class="mem-tag" style="background:${gc(m.univ)}">${m.name}<span style="font-size:10px;opacity:.8">(${m.univ}${m.tier?'/'+m.tier:''})</span><button onclick="BLD['tt'].membersB.splice(${i},1);BLD['tt'].sets=[];render()">×</button></span>`).join('')||'<span style="color:var(--gray-l);font-size:12px">선수 없음</span>'}</div>
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
  if(!results.length){dropEl.innerHTML='<div style="padding:8px 12px;color:var(--gray-l);font-size:12px">결과 없음</div>';dropEl.style.display='block';return;}
  dropEl.innerHTML=results.map(p=>`<div onclick="ttAddPlayer('${team}','${p.name}')"
    style="padding:7px 12px;cursor:pointer;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:7px;font-size:12px"
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
  const tn=tourneys.find(t=>t.name===_ttCurComp&&t.type==='tier');
  if(!tn){alert('삭제할 티어대회를 선택하세요.');return;}
  if(!confirm(`"${tn.name}" 티어대회를 삭제하시겠습니까?`))return;
  const ti=tourneys.indexOf(tn);
  tourneys.splice(ti,1);
  _ttCurComp=tourneys.filter(t=>t.type==='tier').length?(tourneys.find(t=>t.type==='tier')?.name||''):'';
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
  if(!val){alert('대학을 선택하세요.');return;}
  if(tn.groups[gi].univs.includes(val)){alert('이미 추가된 대학입니다.');return;}
  tn.groups[gi].univs.push(val);save();render();
}
function grpRemoveUniv(tnId,gi,ui){
  const tn=tourneys.find(t=>t.id===tnId);if(!tn)return;
  tn.groups[gi].univs.splice(ui,1);save();render();
}
/* ══════════════════════════════════════
   ⚙️ 설정 섹션 접힘 상태 영속 헬퍼
══════════════════════════════════════ */
function _cfgOpen(id){try{return !!(JSON.parse(localStorage.getItem('su_cfg_open')||'{}')[id]);}catch(e){return false;}}
function _cfgToggle(id,el){try{const o=JSON.parse(localStorage.getItem('su_cfg_open')||'{}');o[id]=el.open;localStorage.setItem('su_cfg_open',JSON.stringify(o));}catch(e){}}
function _cfgD(id,title,extra){return `<details class="ssec" ${_cfgOpen(id)?'open':''} ontoggle="_cfgToggle('${id}',this)"${extra?' '+extra:''}><summary style="cursor:pointer;list-style:none;outline:none;display:flex;align-items:center;gap:6px;-webkit-appearance:none"><h4 style="margin:0;display:inline">${title}</h4><span style="font-size:11px;color:var(--gray-l);font-weight:400">▾ 펼치기</span></summary>`;}

/* ══════════════════════════════════════
   설정
══════════════════════════════════════ */
function rCfg(C,T){
  T.innerText='⚙️ 설정';
  if(!isLoggedIn){
    C.innerHTML='<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:60px 20px;text-align:center;gap:16px"><div style="font-size:48px">🔒</div><div style="font-size:18px;font-weight:800;color:var(--text)">관리자 전용 페이지</div><div style="font-size:13px;color:var(--gray-l)">설정 탭은 관리자 로그인 후 이용할 수 있습니다.</div><button class="btn btn-b" onclick="om(\'loginModal\')">&#128273; 로그인</button></div>';
    return;
  }
  const typeOpts=[{v:'📢',l:'📢 일반 공지'},{v:'🔥',l:'🔥 중요'},{v:'⚠️',l:'⚠️ 경고/주의'},{v:'🎉',l:'🎉 이벤트'}];
  let h=`${_cfgD('notice','📢 공지 관리')}
    <div style="font-size:12px;color:var(--gray-l);margin-bottom:14px">접속 시 팝업으로 표시됩니다. 활성화된 공지만 보여집니다.</div>
    <div id="notice-list-area" style="margin-bottom:16px">
    ${notices.length===0?`<div style="padding:18px;text-align:center;color:var(--gray-l);background:var(--surface);border-radius:10px;font-size:13px">등록된 공지 없음</div>`:
      notices.map((n,i)=>`<div style="border:1px solid var(--border);border-radius:10px;padding:12px 14px;margin-bottom:8px;background:${n.active?'var(--white)':'var(--surface)'};opacity:${n.active?1:0.6}">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
          <span style="font-size:18px">${n.type||'📢'}</span>
          <span style="font-weight:700;flex:1;font-size:13px">${n.title||'(제목 없음)'}</span>
          <span style="font-size:11px;color:var(--gray-l)">${n.date||''}</span>
          <button class="btn btn-xs" style="background:${n.active?'#f0fdf4':'#f1f5f9'};color:${n.active?'#16a34a':'#64748b'};border:1px solid ${n.active?'#86efac':'#cbd5e1'};min-width:52px"
            onclick="notices[${i}].active=!notices[${i}].active;save();render()">
            ${n.active?'✅ 활성':'⭕ 비활성'}</button>
          <button class="btn btn-r btn-xs" onclick="if(confirm('공지를 삭제할까요?')){notices.splice(${i},1);save();render()}">🗑️</button>
        </div>
        ${(n.body||'').length>120
          ? `<div id="notice-body-${i}" style="font-size:12px;color:var(--text2);white-space:pre-wrap;max-height:60px;overflow:hidden">${(n.body||'').slice(0,120)}...</div>
             <button onclick="(function(){const el=document.getElementById('notice-body-${i}');const btn=document.getElementById('notice-exp-${i}');const open=el.style.maxHeight!=='none';el.style.maxHeight=open?'none':'60px';el.textContent=open?notices[${i}].body:notices[${i}].body.slice(0,120)+'...';btn.textContent=open?'▲ 접기':'▼ 전체보기';})()" id="notice-exp-${i}" style="background:none;border:none;color:var(--blue);font-size:11px;cursor:pointer;padding:2px 0;font-weight:600">▼ 전체보기</button>`
          : `<div style="font-size:12px;color:var(--text2);white-space:pre-wrap">${n.body||''}</div>`
        }
      </div>`).join('')
    }
    </div>
    <div style="border:1.5px dashed var(--border2);border-radius:12px;padding:16px;background:var(--surface)">
      <div style="font-size:12px;font-weight:700;color:var(--text2);margin-bottom:10px">+ 새 공지 작성</div>
      <div style="display:flex;gap:8px;margin-bottom:8px;flex-wrap:wrap">
        <select id="new-notice-type" style="width:140px;border:1px solid var(--border2);border-radius:7px;padding:5px 8px;font-size:13px">
          ${typeOpts.map(o=>`<option value="${o.v}">${o.l}</option>`).join('')}
        </select>
        <input type="text" id="new-notice-title" placeholder="공지 제목" style="flex:1;min-width:180px">
      </div>
      <textarea id="new-notice-body" placeholder="공지 내용을 입력하세요..." style="width:100%;height:80px;resize:vertical;border:1px solid var(--border2);border-radius:8px;padding:8px 10px;font-size:13px;box-sizing:border-box"></textarea>
      <div style="display:flex;align-items:center;gap:10px;margin-top:8px">
        <label style="display:flex;align-items:center;gap:5px;font-size:12px;cursor:pointer">
          <input type="checkbox" id="new-notice-active" checked> 즉시 활성화
        </label>
        <button class="btn btn-b" style="margin-left:auto" onclick="
          const t=document.getElementById('new-notice-title').value.trim();
          const b=document.getElementById('new-notice-body').value.trim();
          const tp=document.getElementById('new-notice-type').value;
          const ac=document.getElementById('new-notice-active').checked;
          if(!t){alert('제목을 입력하세요');return;}
          notices.unshift({id:Date.now(),type:tp,title:t,body:b,active:ac,date:new Date().toLocaleDateString('ko-KR')});
          save();render();">📢 공지 등록</button>
      </div>
    </div>
  </details>
  ${(()=>{
    const seen={};const dupNames=[];
    players.forEach(p=>{if(seen[p.name])dupNames.push(p.name);else seen[p.name]=true;});
    const uniq=[...new Set(dupNames)];
    if(!uniq.length) return '';
    return `<div class="ssec" style="border:2px solid #fca5a5;background:#fff5f5">
      <h4 style="color:#dc2626">⚠️ 동명이인 감지 (${uniq.length}건)</h4>
      <div style="font-size:12px;color:#7f1d1d;margin-bottom:12px">중복 이름이 있으면 승패·기록이 뒤섞입니다. 한 명의 이름을 바꿔 구분하세요.</div>
      ${uniq.map(name=>{
        const dupes=players.map((p,i)=>({p,i})).filter(({p})=>p.name===name);
        return `<div style="background:var(--white);border:1px solid #fca5a5;border-radius:8px;padding:10px 12px;margin-bottom:8px">
          <div style="font-weight:800;color:#dc2626;font-size:13px;margin-bottom:6px">👥 "${name}" — ${dupes.length}명 중복</div>
          ${dupes.map(({p,i})=>`<div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;flex-wrap:wrap">
            <span style="font-size:11px;background:#fee2e2;color:#991b1b;border-radius:4px;padding:1px 7px;font-weight:700">${p.univ||'무소속'}</span>
            <span style="font-size:11px;color:var(--gray-l)">${p.tier||'-'} · ${p.race||'-'}</span>
            <input type="text" id="dupfix-${i}" placeholder="새 이름..." style="flex:1;min-width:100px;padding:3px 7px;border-radius:5px;border:1px solid #fca5a5;font-size:12px">
            <button class="btn btn-xs" style="background:#dc2626;color:#fff;border-color:#dc2626" onclick="(function(){
              const inp=document.getElementById('dupfix-${i}');
              const nw=(inp?.value||'').trim();
              if(!nw){alert('새 이름을 입력하세요.');return;}
              if(players.find((x,xi)=>x.name===nw&&xi!==${i})){alert('이미 존재하는 이름입니다.');return;}
              editName=players[${i}].name;
              document.getElementById('emBody').innerHTML='';
              const oldN=players[${i}].name;
              players[${i}].name=nw;
              players.forEach(other=>{(other.history||[]).forEach(h=>{if(h.opp===oldN)h.opp=nw;});});
              [miniM,univM,comps,ckM,proM,ttM].forEach(arr=>(arr||[]).forEach(m=>{
                if(m.a===oldN)m.a=nw;if(m.b===oldN)m.b=nw;
                (m.sets||[]).forEach(s=>(s.games||[]).forEach(g=>{if(g.playerA===oldN)g.playerA=nw;if(g.playerB===oldN)g.playerB=nw;}));
              }));
              (tourneys||[]).forEach(tn=>{
                (tn.groups||[]).forEach(grp=>{(grp.matches||[]).forEach(m=>{if(m.a===oldN)m.a=nw;if(m.b===oldN)m.b=nw;});});
                const br=tn.bracket||{};
                Object.values(br.matchDetails||{}).forEach(m=>{if(m&&m.a===oldN)m.a=nw;if(m&&m.b===oldN)m.b=nw;});
                (br.manualMatches||[]).forEach(m=>{if(m.a===oldN)m.a=nw;if(m.b===oldN)m.b=nw;});
              });
              (proTourneys||[]).forEach(tn=>{
                (tn.groups||[]).forEach(grp=>{(grp.matches||[]).forEach(m=>{if(m.a===oldN)m.a=nw;if(m.b===oldN)m.b=nw;});});
              });
              save();render();
            })()">✅ 적용</button>
          </div>`).join('')}
        </div>`;
      }).join('')}
    </div>`;
  })()}
  ${_cfgD('univ','🏛️ 대학 관리')}
    <div style="font-size:11px;color:var(--gray-l);margin:8px 0 10px">👁️ 숨김 처리된 대학은 비로그인 상태에서 현황판에 표시되지 않습니다.</div>`;
  univCfg.forEach((u,i)=>{
    const isHidden = !!u.hidden;
    const isDissolved = !!u.dissolved;
    h+=`<div class="srow" style="background:${isHidden?'var(--surface)':'transparent'};border-radius:8px;padding:4px 6px;margin:-2px -6px;flex-wrap:wrap;gap:4px">
      <div class="cdot" style="background:${u.color};opacity:${isHidden?0.4:1}"></div>
      <input type="text" value="${u.name}" style="flex:1;max-width:130px;opacity:${isHidden?0.5:1}" onblur="const oldName=univCfg[${i}].name;const v=this.value.trim();if(!v){this.value=oldName;return;}if(v!==oldName&&univCfg.some((x,xi)=>xi!==${i}&&x.name===v)){alert('이미 추가된 대학명입니다.');this.value=oldName;return;}if(v!==oldName){renameUnivAcrossData(oldName,v);univCfg[${i}].name=v;save();render();}">
      ${isDissolved?`<span style="font-size:10px;background:#fef2f2;color:#dc2626;border:1px solid #fca5a5;border-radius:5px;padding:1px 6px;font-weight:700">🏚️ 해체 ${u.dissolvedDate||''}</span>`:''}
      <input type="color" value="${u.color}" style="width:36px;height:30px;padding:2px;border-radius:5px;cursor:pointer;border:1px solid var(--border2)" title="대학 색상" onchange="univCfg[${i}].color=this.value;this.previousElementSibling.previousElementSibling${isDissolved?'.previousElementSibling':''}.style.background=this.value;save();if(typeof renderBoard==='function')renderBoard()">
      ${isDissolved
        ? `<button class="btn btn-xs" style="background:#f0fdf4;color:#16a34a;border:1px solid #86efac" onclick="univCfg[${i}].dissolved=false;univCfg[${i}].hidden=false;delete univCfg[${i}].dissolvedDate;saveCfg();render()">🔄 복구</button>`
        : `<button class="btn btn-xs" style="background:${isHidden?'#fef2f2':'#f0fdf4'};color:${isHidden?'#dc2626':'#16a34a'};border:1px solid ${isHidden?'#fca5a5':'#86efac'};min-width:58px"
            onclick="univCfg[${i}].hidden=!univCfg[${i}].hidden;saveCfg();render()">
            ${isHidden?'👁️ 숨김':'✅ 표시'}</button>
          <button class="btn btn-xs" style="background:#fff7ed;color:#ea580c;border:1px solid #fed7aa" onclick="openDissolveModal(${i})">🏚️ 해체</button>`
      }
      <button class="btn btn-r btn-xs" onclick="delUniv(${i})">🗑️ 삭제</button>
    </div>`;
  });
  h+=`<div style="margin-top:12px;display:flex;gap:8px;flex-wrap:wrap;align-items:center">
    <input type="text" id="nu-n" placeholder="새 대학명" style="width:150px">
    <input type="color" id="nu-c" value="#2563eb" style="width:40px;height:34px;padding:2px;border-radius:5px;cursor:pointer;border:1px solid var(--border2)">
    <button class="btn btn-b" onclick="addUniv()">+ 대학 추가</button>
  </div></details>
  ${_cfgD('maps','🗺️ 맵 관리')}<div id="map-list">`;
  maps.forEach((m,i)=>{
    h+=`<div class="srow">
      <span style="font-size:14px">📍</span>
      <input type="text" value="${m}" style="flex:1" onblur="maps[${i}]=this.value;saveCfg();refreshSel()">
      <button class="btn btn-r btn-xs" onclick="delMap(${i})">🗑️ 삭제</button>
    </div>`;
  });
  h+=`</div><div style="margin-top:12px;display:flex;gap:8px">
    <input type="text" id="nm" placeholder="새 맵 이름" style="width:200px" onkeydown="if(event.key==='Enter')addMap()">
    <button class="btn btn-b" onclick="addMap()">+ 맵 추가</button>
  </div></details>
      <div class="ssec">
      <h4>🎮 크루 관리</h4>
      <div id="crew-list" style="margin-bottom:12px"></div>
      ${isLoggedIn?`<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:8px">
        <input type="text" id="crew-name" placeholder="크루 이름" style="width:120px;padding:4px 8px;border:1px solid var(--border2);border-radius:6px;font-size:12px">
        <input type="text" id="crew-icon" placeholder="아이콘 (이모지)" style="width:90px;padding:4px 8px;border:1px solid var(--border2);border-radius:6px;font-size:12px">
        <input type="color" id="crew-color" value="#6366f1" style="width:40px;height:30px;border:1px solid var(--border2);border-radius:6px;cursor:pointer">
        <input type="text" id="crew-desc" placeholder="설명 (선택)" style="width:150px;padding:4px 8px;border:1px solid var(--border2);border-radius:6px;font-size:12px">
        <button class="btn btn-b btn-sm" onclick="addCrew()">+ 크루 추가</button>
      </div>`:``}
    </div>

    ${_cfgD('mAlias','⚡ 맵 약자 관리 <span style="font-size:11px;font-weight:400;color:var(--gray-l)">붙여넣기 입력 시 자동 변환</span>')}
    <div style="font-size:12px;color:var(--gray-l);margin-bottom:10px">
      약자를 입력하면 경기 결과 붙여넣기 시 자동으로 전체 맵 이름으로 변환됩니다.<br>
      <span style="color:var(--blue);font-weight:600">예:</span> <code style="background:var(--surface);padding:1px 6px;border-radius:4px">녹 → 녹아웃</code>, <code style="background:var(--surface);padding:1px 6px;border-radius:4px">폴 → 폴리포이드</code>
    </div>
    <div style="background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:10px 12px;margin-bottom:12px">
      <div style="font-size:11px;font-weight:700;color:var(--text2);margin-bottom:6px">📦 기본 내장 약자 <span style="font-weight:400;color:var(--gray-l);font-size:10px">(✕ 클릭 시 비활성화)</span></div>
      <div style="display:flex;flex-wrap:wrap;gap:5px">
        ${Object.entries(PASTE_MAP_ALIAS_DEFAULT).filter(([k,v])=>k!==v).map(([k,v])=>{
          const disabled=(userMapAlias||{}).hasOwnProperty(k+'__disabled');
          return disabled
            ? `<span style="display:inline-flex;align-items:center;gap:3px;background:#f1f5f9;border:1px solid var(--border);border-radius:6px;padding:2px 6px 2px 9px;font-size:11px;opacity:.5;text-decoration:line-through"><span style="font-family:monospace"><b>${k}</b> → ${v}</span><button onclick="restoreDefaultMapAlias('${encodeURIComponent(k)}')" style="background:none;border:none;cursor:pointer;color:#16a34a;font-size:10px;padding:0 2px;line-height:1;text-decoration:none" title="복원">↩</button></span>`
            : `<span style="display:inline-flex;align-items:center;gap:3px;background:var(--white);border:1px solid var(--border);border-radius:6px;padding:2px 6px 2px 9px;font-size:11px"><span style="font-family:monospace"><b>${k}</b> → ${v}</span><button onclick="delDefaultMapAlias('${encodeURIComponent(k)}','${encodeURIComponent(v)}')" style="background:none;border:none;cursor:pointer;color:#dc2626;font-size:10px;padding:0 2px;line-height:1" title="비활성화">✕</button></span>`;
        }).join('')}
      </div>
    </div>
    <div style="font-size:12px;font-weight:700;color:var(--text2);margin-bottom:8px">🔧 사용자 정의 약자</div>
    <div id="alias-list" style="margin-bottom:10px"></div>
    <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
      <input type="text" id="alias-key" placeholder="약자 (예: 녹)" style="width:90px" maxlength="10" onkeydown="if(event.key==='Enter')addMapAlias()">
      <span style="color:var(--gray-l)">→</span>
      <input type="text" id="alias-val" list="alias-val-list" placeholder="맵 이름 입력..." autocomplete="off" style="width:180px;border:1px solid var(--border2);border-radius:7px;padding:5px 8px;font-size:13px" onkeydown="if(event.key==='Enter')addMapAlias()">
      <datalist id="alias-val-list">${maps.map(m=>`<option value="${m}">`).join('')}</datalist>
      <button class="btn btn-b" onclick="addMapAlias()">+ 약자 추가</button>
    </div>
    <div id="alias-msg" style="font-size:12px;margin-top:6px;min-height:16px"></div>
  </details>
  <div class="ssec">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">
      <h4 style="margin:0">🏷️ 스트리머 상태 아이콘 관리</h4>
      <button id="cfg-si-toggle" class="btn btn-w btn-xs" onclick="(function(){const c=document.getElementById('cfg-si-body');const btn=document.getElementById('cfg-si-toggle');if(c.style.display==='none'){c.style.display='';_renderCfgSiList();btn.textContent='▲ 접기';}else{c.style.display='none';btn.textContent='▼ 펼치기';}})()">▼ 펼치기</button>
    </div>
    <div id="cfg-si-body" style="display:none">
    <div style="font-size:12px;color:var(--gray-l);margin-bottom:12px">이름 우측에 표시될 상태 아이콘을 스트리머별로 지정합니다. 현황판·순위표·이미지 저장 모두 반영됩니다.</div>
    <!-- 커스텀 아이콘 추가 (URL/링크) -->
    <div style="padding:12px;background:var(--surface);border:1px solid var(--border);border-radius:8px;margin-bottom:14px">
      <div style="font-size:12px;font-weight:700;color:var(--blue);margin-bottom:10px">🔗 커스텀 아이콘 추가 (URL · 이모지)</div>
      <div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin-bottom:10px">
        <input type="text" id="si-url" placeholder="이미지 URL 또는 이모지 입력" style="flex:1;min-width:200px;padding:5px 8px;border:1px solid var(--border2);border-radius:6px;font-size:12px">
        <input type="text" id="si-label" placeholder="이름 (선택)" style="width:110px;padding:5px 8px;border:1px solid var(--border2);border-radius:6px;font-size:12px">
        <button class="btn btn-b btn-sm" onclick="var e=document.getElementById('si-url').value.trim(),l=document.getElementById('si-label').value.trim();if(!e){alert('URL 또는 이모지를 입력하세요.');return;}addCustomStatusIcon(l||'커스텀',e);document.getElementById('si-url').value='';document.getElementById('si-label').value='';render()">+ 추가</button>
      </div>
      ${_customStatusIcons.length?`<div style="display:flex;flex-wrap:wrap;gap:6px">${_customStatusIcons.map((c,i)=>`<span style="display:inline-flex;align-items:center;gap:5px;padding:4px 10px;border-radius:7px;background:var(--white);border:1.5px solid var(--blue);font-size:14px"><span style="display:inline-flex;align-items:center">${_siRender(c.emoji,'20px')||c.emoji}</span><span style="font-size:11px;color:var(--gray-l);max-width:80px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${c.label||''}</span><button onclick="removeCustomStatusIcon(${i});render()" style="background:none;border:none;color:#dc2626;cursor:pointer;font-size:14px;padding:0;line-height:1;margin-left:2px" title="삭제">×</button></span>`).join('')}</div>`
      :'<div style="font-size:11px;color:var(--gray-l)">추가된 커스텀 아이콘 없음</div>'}
    </div>
    <!-- 기본 아이콘 목록 -->
    <div style="padding:12px;background:var(--surface);border:1px solid var(--border);border-radius:8px;margin-bottom:14px">
      <div style="font-size:12px;font-weight:700;color:var(--blue);margin-bottom:10px">🎭 기본 상태 아이콘</div>
      <div style="display:flex;flex-wrap:wrap;gap:6px">
        ${Object.entries(STATUS_ICON_DEFS).filter(([id])=>id!=='none'&&!id.startsWith('_c')).map(([id,d])=>`<span style="padding:4px 10px;border-radius:7px;background:var(--white);border:1px solid var(--border);font-size:16px" title="${d.label}">${_siRender(d.emoji,'20px')||d.emoji}</span>`).join('')}
      </div>
      <div style="font-size:11px;color:var(--gray-l);margin-top:8px">스트리머 정보 수정 또는 현황판 클릭 팝업에서 아이콘을 설정하세요.</div>
    </div>
    <!-- 스트리머별 아이콘 지정 -->
    <div style="font-size:12px;font-weight:700;color:var(--text2);margin-bottom:8px">스트리머별 상태 아이콘 지정</div>
    <div id="cfg-si-list" style="max-height:320px;overflow-y:auto;border:1px solid var(--border);border-radius:8px">
      <div style="padding:16px;text-align:center;color:var(--gray-l);font-size:12px">로딩 중...</div>
    </div>
    <button class="btn btn-r btn-sm" style="margin-top:10px" onclick="if(confirm('모든 상태 아이콘을 초기화할까요?')){playerStatusIcons={};localStorage.setItem('su_psi','{}');render();}">전체 초기화</button>
    </div>
  </div>
  ${_cfgD('tier','🎭 티어 관리')}
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px">
      ${TIERS.map((t,i)=>`<div style="text-align:center;padding:8px 12px;background:var(--white);border:1px solid var(--border);border-radius:8px;display:flex;flex-direction:column;align-items:center;gap:4px">
        ${getTierBadge(t)}
        <div style="font-size:10px;color:var(--gray-l)">${i+1}순위</div>
        ${!['G','K','JA','J','S','0티어'].includes(t)?`<button class="btn btn-r btn-xs" onclick="delTier('${t}')">🗑️ 삭제</button>`:''}
      </div>`).join('')}
    </div>
    <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
      <input type="text" id="nt-name" placeholder="티어 이름 (예: 9티어)" style="width:160px">
      <button class="btn btn-b" onclick="addTier()">+ 티어 추가</button>
    </div>
    <div style="font-size:11px;color:var(--gray-l);margin-top:6px">※ 기본 티어(G/K/JA/J/S/0티어)는 삭제할 수 없습니다.</div>
  </details>
  ${_cfgD('acct','👤 관리자 계정 관리')}
    <div style="font-size:12px;color:var(--gray-l);margin-bottom:4px">• <b>관리자</b>: 모든 기능 + 설정 접근 가능</div>
    <div style="font-size:12px;color:var(--gray-l);margin-bottom:14px">• <b>부관리자</b>: 경기 기록 입력만 가능 (설정/회원관리 불가)</div>
    <div style="margin-bottom:14px;padding:12px;background:var(--surface);border:1px solid var(--border);border-radius:8px">
      <div style="font-size:12px;font-weight:700;color:var(--blue);margin-bottom:10px">등록된 계정 (<span id="adm-count">-</span>명)</div>
      <div id="adm-list"></div>
      <button class="btn btn-r btn-xs" style="margin-top:10px" onclick="clearAllAdmins()">⚠️ 전체 초기화 (기본값 리셋)</button>
    </div>
    <div style="font-size:12px;font-weight:700;color:var(--text2);margin-bottom:8px">+ 새 계정 추가</div>
    <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:8px">
      <input type="text" id="adm-id" placeholder="아이디" style="width:140px" autocomplete="off">
      <input type="password" id="adm-pw" placeholder="비밀번호 (4자 이상)" style="width:150px" autocomplete="new-password">
      <select id="adm-role" style="border:1px solid var(--border2);border-radius:7px;padding:5px 8px;font-size:13px">
        <option value="admin">👑 관리자</option>
        <option value="sub-admin">🔰 부관리자</option>
      </select>
      <button class="btn btn-p" onclick="addAdminAccount()">+ 추가</button>
    </div>
    <div id="adm-msg" style="font-size:12px;min-height:18px"></div>
  </details>
  <div class="ssec">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">
      <h4 style="margin:0">💾 로컬 저장소 사용량</h4>
      <button id="cfg-storage-toggle2" class="btn btn-w btn-xs" onclick="(function(){const c=document.getElementById('cfg-storage-wrap2');const btn=document.getElementById('cfg-storage-toggle2');if(c.style.display==='none'){c.style.display='';btn.textContent='▲ 접기';renderStorageInfo();}else{c.style.display='none';btn.textContent='▼ 펼치기';}})()">▼ 펼치기</button>
    </div>
    <div id="cfg-storage-wrap2" style="display:none">
      <div id="cfg-storage-info"><div style="color:var(--gray-l);font-size:12px">계산 중...</div></div>
      <button class="btn btn-w btn-sm" style="margin-top:8px" onclick="renderStorageInfo()">🔄 새로고침</button>
    </div>
  </div>
  <div class="ssec">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">
      <h4 style="margin:0">☁️ Firebase 실시간 동기화</h4>
      <button id="cfg-fb-toggle" class="btn btn-w btn-xs" onclick="(function(){const c=document.getElementById('cfg-fb-body');const btn=document.getElementById('cfg-fb-toggle');if(c.style.display==='none'){c.style.display='';btn.textContent='▲ 접기';}else{c.style.display='none';btn.textContent='▼ 펼치기';}})()">▼ 펼치기</button>
    </div>
    <div id="cfg-fb-body" style="display:none">
    <p style="font-size:12px;color:var(--gray-l);margin-bottom:12px">관리자가 데이터를 저장할 때 Firebase에 자동으로 업로드됩니다. 다른 기기에서도 실시간으로 반영됩니다.</p>
    <div id="cfg-fb-sync-panel" style="margin-bottom:12px;padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:10px">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;flex-wrap:wrap;gap:8px">
        <span style="font-size:12px;font-weight:700;color:var(--blue)">🔄 동기화 상태</span>
        <button class="btn btn-w btn-xs" onclick="checkFbSyncStatus()">🔍 지금 확인</button>
      </div>
      <div id="cfg-fb-sync-result" style="font-size:12px;color:var(--gray-l)">확인 버튼을 눌러 상태를 확인하세요.</div>
    </div>
    <div style="margin-bottom:10px;padding:12px;background:var(--surface);border:1px solid var(--border);border-radius:8px">
      <div style="font-size:12px;font-weight:700;color:var(--blue);margin-bottom:8px">Firebase 비밀번호</div>
      <div style="font-size:11px;color:var(--gray-l);margin-bottom:10px">Firebase Security Rules에서 설정한 admin_pw 값을 입력하세요. 저장 시 이 비밀번호로 쓰기 인증됩니다.</div>
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        <input type="password" id="cfg-fb-pw" placeholder="Firebase 비밀번호 입력..." style="width:220px" autocomplete="new-password">
        <button class="btn btn-b" onclick="saveFbPw()">💾 저장</button>
        <button class="btn btn-r btn-xs" onclick="clearFbPw()">지우기</button>
      </div>
      <div id="fb-pw-status" style="font-size:12px;margin-top:8px;min-height:16px;color:var(--gray-l)">${localStorage.getItem('su_fb_pw')?'✅ 비밀번호 설정됨':'미설정'}</div>
    </div>
    <div style="margin-bottom:10px;padding:12px;background:var(--surface);border:1px solid var(--border);border-radius:8px">
      <div style="font-size:12px;font-weight:700;color:#16a34a;margin-bottom:8px">GitHub 토큰 (관람자 수천 명 무료 지원)</div>
      <div style="font-size:11px;color:var(--gray-l);margin-bottom:6px">설정 시: 저장할 때 GitHub data.json도 자동 업로드 → 관람자들이 GitHub CDN에서 데이터를 받아 Firebase 동시접속 100명 제한 없이 수천 명도 무료로 지원됩니다.</div>
      <div style="font-size:11px;color:var(--gray-l);margin-bottom:10px">GitHub → Settings → Developer settings → Personal access tokens → Fine-grained token → Contents: Read and Write 권한 발급</div>
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        <input type="password" id="cfg-gh-token" placeholder="ghp_xxxxxxxxxxxx" style="width:260px" autocomplete="new-password">
        <button class="btn btn-b" onclick="saveGhToken()">💾 저장</button>
        <button class="btn btn-r btn-xs" onclick="clearGhToken()">지우기</button>
      </div>
      <div id="gh-token-status" style="font-size:12px;margin-top:8px;min-height:16px;color:var(--gray-l)">${localStorage.getItem('su_gh_token')?'✅ 토큰 설정됨 (저장 시 GitHub 자동 업로드 활성)':'미설정 (관람자는 Firebase 사용 중)'}</div>
    </div>
    </div>
  </div>
  ${_cfgD('season','🏆 시즌 관리','id="cfg-season-sec"')}
    <p style="font-size:12px;color:var(--gray-l);margin-bottom:12px">시즌을 정의하면 대전기록·통계 등 모든 탭에서 시즌 단위로 필터링할 수 있습니다.</p>
    <div id="cfg-season-list" style="margin-bottom:12px"></div>
    <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:flex-end;padding:12px;background:var(--surface);border:1px solid var(--border);border-radius:8px">
      <div>
        <label style="font-size:11px;font-weight:700;color:var(--text3);display:block;margin-bottom:4px">시즌 이름</label>
        <input type="text" id="cfg-season-name" placeholder="예: 2025 스프링" style="width:140px;font-size:12px">
      </div>
      <div>
        <label style="font-size:11px;font-weight:700;color:var(--text3);display:block;margin-bottom:4px">시작일</label>
        <input type="date" id="cfg-season-from" style="font-size:12px">
      </div>
      <div>
        <label style="font-size:11px;font-weight:700;color:var(--text3);display:block;margin-bottom:4px">종료일</label>
        <input type="date" id="cfg-season-to" style="font-size:12px">
      </div>
      <button class="btn btn-b btn-sm" onclick="addSeason()">+ 시즌 추가</button>
    </div>
  </details>
    <div class="ssec" id="cfg-bulk-edit-sec">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">
      <h4 style="margin:0">✏️ 경기 일괄 수정</h4>
      <button id="cfg-me-toggle" class="btn btn-w btn-xs" onclick="(function(){const c=document.getElementById('cfg-me-body');const btn=document.getElementById('cfg-me-toggle');if(c.style.display==='none'){c.style.display='';btn.textContent='▲ 접기';}else{c.style.display='none';btn.textContent='▼ 펼치기';}})()">▼ 펼치기</button>
    </div>
    <div id="cfg-me-body" style="display:none">
    <p style="font-size:12px;color:var(--gray-l);margin-bottom:12px">특정 날짜 범위의 경기 날짜·맵을 한 번에 수정하거나, 맵 이름 오타를 전체 교체합니다.</p>

    <div style="display:flex;flex-direction:column;gap:14px">

      <!-- 날짜 일괄 변경 -->
      <div style="padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:10px">
        <div style="font-weight:700;font-size:13px;color:var(--blue);margin-bottom:10px">📅 날짜 일괄 변경</div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:8px">
          <label style="font-size:12px;font-weight:600;color:var(--text2)">변경 전 날짜</label>
          <input type="date" id="bulk-date-from" style="font-size:12px">
          <label style="font-size:12px;font-weight:600;color:var(--text2)">→ 변경 후</label>
          <input type="date" id="bulk-date-to" style="font-size:12px">
        </div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px">
          <label style="font-size:11px;font-weight:600;color:var(--text3)">대상:</label>
          ${['mini','univm','ck','pro','tt','ind','gj','comp'].map(m=>`
          <label style="display:inline-flex;align-items:center;gap:3px;font-size:11px;cursor:pointer">
            <input type="checkbox" id="bulk-date-chk-${m}" checked style="cursor:pointer">
            ${{ mini:'미니대전', univm:'대학대전', ck:'CK', pro:'프로리그', tt:'티어대회', ind:'개인전', gj:'끝장전', comp:'대회' }[m]}
          </label>`).join('')}
        </div>
        <button class="btn btn-b btn-sm" onclick="bulkChangeDate()">📅 날짜 일괄 변경</button>
        <span id="bulk-date-result" style="font-size:12px;margin-left:8px;color:var(--green)"></span>
      </div>

      <!-- 맵 이름 일괄 교체 -->
      <div style="padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:10px">
        <div style="font-weight:700;font-size:13px;color:var(--blue);margin-bottom:10px">🗺️ 맵 이름 일괄 교체</div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:10px">
          <label style="font-size:12px;font-weight:600;color:var(--text2)">교체 전</label>
          <input type="text" id="bulk-map-from" placeholder="예: 투혼II" style="font-size:12px;width:120px">
          <label style="font-size:12px;font-weight:600;color:var(--text2)">→ 교체 후</label>
          <input type="text" id="bulk-map-to" placeholder="예: 투혼" style="font-size:12px;width:120px">
        </div>
        <button class="btn btn-b btn-sm" onclick="bulkChangeMap()">🗺️ 맵 일괄 교체</button>
        <span id="bulk-map-result" style="font-size:12px;margin-left:8px;color:var(--green)"></span>
      </div>

      <!-- 선수 일괄 티어 변경 -->
      <div style="padding:14px;background:#f0f9ff;border:1px solid #bae6fd;border-radius:10px">
        <div style="font-weight:700;font-size:13px;color:#0369a1;margin-bottom:10px">🎖️ 선수 일괄 티어 변경</div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:10px">
          <label style="font-size:12px;font-weight:600;color:var(--text2)">현재 티어</label>
          <select id="bulk-tier-from" style="font-size:12px;padding:3px 8px;border-radius:6px;border:1px solid var(--border2)">
            <option value="">전체 (상관없음)</option>
            ${TIERS.map(t=>`<option value="${t}">${getTierLabel(t)||t}</option>`).join('')}
            <option value="미정">미정</option>
          </select>
          <label style="font-size:12px;font-weight:600;color:var(--text2)">→ 변경할 티어</label>
          <select id="bulk-tier-to" style="font-size:12px;padding:3px 8px;border-radius:6px;border:1px solid var(--border2)">
            <option value="">선택</option>
            ${TIERS.map(t=>`<option value="${t}">${getTierLabel(t)||t}</option>`).join('')}
            <option value="미정">미정</option>
          </select>
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:10px">
          <label style="font-size:12px;font-weight:600;color:var(--text2)">대상 대학</label>
          <select id="bulk-tier-univ" style="font-size:12px;padding:3px 8px;border-radius:6px;border:1px solid var(--border2)">
            <option value="">전체 대학</option>
            ${getAllUnivs().map(u=>`<option value="${u.name}">${u.name}</option>`).join('')}
          </select>
        </div>
        <button class="btn btn-b btn-sm" onclick="bulkChangeTier()">🎖️ 티어 일괄 변경</button>
        <span id="bulk-tier-result" style="font-size:12px;margin-left:8px;color:var(--blue)"></span>
      </div>

      <!-- 날짜 범위 일괄 삭제 -->
      <div style="padding:14px;background:#fff5f5;border:1px solid #fca5a5;border-radius:10px">
        <div style="font-weight:700;font-size:13px;color:#dc2626;margin-bottom:10px">🗑️ 날짜 범위 일괄 삭제</div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:8px">
          <label style="font-size:12px;font-weight:600;color:var(--text2)">시작일</label>
          <input type="date" id="bulk-del-from" style="font-size:12px">
          <label style="font-size:12px;font-weight:600;color:var(--text2)">~</label>
          <input type="date" id="bulk-del-to" style="font-size:12px">
        </div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px">
          <label style="font-size:11px;font-weight:600;color:var(--text3)">대상:</label>
          ${['mini','univm','ck','pro','tt','ind','gj','comp'].map(m=>`
          <label style="display:inline-flex;align-items:center;gap:3px;font-size:11px;cursor:pointer">
            <input type="checkbox" id="bulk-del-chk-${m}" style="cursor:pointer">
            ${{ mini:'미니대전', univm:'대학대전', ck:'CK', pro:'프로리그', tt:'티어대회', ind:'개인전', gj:'끝장전', comp:'대회' }[m]}
          </label>`).join('')}
        </div>
        <button class="btn btn-r btn-sm" onclick="bulkDeleteByDate()">🗑️ 범위 삭제 (되돌릴 수 없음)</button>
        <span id="bulk-del-result" style="font-size:12px;margin-left:8px;color:var(--red)"></span>
      </div>

      <!-- 세트제→게임수 합산 일괄 변환 -->
      <div style="padding:14px;background:#fefce8;border:1px solid #fde68a;border-radius:10px">
        <div style="font-weight:700;font-size:13px;color:#92400e;margin-bottom:6px">🔄 세트제 → 게임수 합산 일괄 변환</div>
        <div style="font-size:11px;color:var(--text3);margin-bottom:10px">sets 배열의 게임 수 합산으로 sa/sb를 재계산합니다.<br>세트 수와 게임 수가 다른 경기만 변환됩니다.</div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px">
          <label style="font-size:11px;font-weight:600;color:var(--text3)">대상:</label>
          ${['mini','univm','ck','pro','tt'].map(m=>`
          <label style="display:inline-flex;align-items:center;gap:3px;font-size:11px;cursor:pointer">
            <input type="checkbox" id="bulk-conv-chk-${m}" checked style="cursor:pointer">
            ${{ mini:'미니대전', univm:'대학대전', ck:'CK', pro:'프로리그', tt:'티어대회' }[m]}
          </label>`).join('')}
        </div>
        <button class="btn btn-b btn-sm" onclick="bulkConvertToGameScore()">🔄 게임수 합산으로 변환</button>
        <span id="bulk-conv-result" style="font-size:12px;margin-left:8px;color:var(--blue)"></span>
      </div>

    </div>
  </div>
  `;

  // 관리자 목록 + 맵 약자 목록 렌더링
  setTimeout(()=>{
    renderStorageInfo();
    renderSeasonList();
    _refreshCrewList();
    const el=document.getElementById('adm-count');
    const listEl=document.getElementById('adm-list');
    const accounts=getAdminAccounts();
    if(el)el.textContent=accounts.length;
    if(listEl){
      if(!accounts.length){listEl.innerHTML='<div style="font-size:12px;color:var(--gray-l)">등록된 계정 없음</div>';return;}
      listEl.innerHTML=accounts.map((a,i)=>`
        <div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid var(--border)">
          <span style="flex:1;font-size:13px;font-weight:600">${a.label||'(이름없음)'}</span>
          <span style="padding:2px 9px;border-radius:5px;font-size:10px;font-weight:700;${a.role==='sub-admin'?'background:#fef3c7;color:#92400e;border:1px solid #fde68a':'background:#dbeafe;color:#1e40af;border:1px solid #bfdbfe'}">${a.role==='sub-admin'?'🔰 부관리자':'👑 관리자'}</span>
          <button class="btn btn-r btn-xs" onclick="deleteAdminAccount(${i})">🗑️ 삭제</button>
        </div>`).join('');
    }
  },50);
  C.innerHTML=h;
  setTimeout(function(){ if(typeof _refreshAliasList === 'function') _refreshAliasList(); }, 10);
  // FAB 탭 설정 초기화
  window.saveFabTabSetting = function(btnKey, tabId){
    const settings=JSON.parse(localStorage.getItem('su_fabTabs')||'{}');
    settings[btnKey]=tabId;
    localStorage.setItem('su_fabTabs',JSON.stringify(settings));
    if(typeof updateFabButtonOnclick==='function')updateFabButtonOnclick();
    // Firebase에 설정 동기화
    if(typeof save==='function' && typeof isLoggedIn!=='undefined' && isLoggedIn) save();
  };
  window.initFabTabSettings = function(){
    const settings=JSON.parse(localStorage.getItem('su_fabTabs')||'{}');
    const defaults={cal:'cal',comp:'comp',univm:'univm',ind:'ind',pro:'pro'};
    Object.keys(defaults).forEach(key=>{
      const el=document.getElementById('cfg-fab-'+key);
      if(el){
        el.value=settings[key]||defaults[key];
      }
    });
    if(typeof updateFabButtonOnclick==='function')updateFabButtonOnclick();
  };
  setTimeout(function(){window.initFabTabSettings();}, 50);
} // end first rCfg

function renderStorageInfo(){
  const el=document.getElementById('cfg-storage-info');
  if(!el)return;
  try{
    let total=0;const rows=[];
    for(let i=0;i<localStorage.length;i++){
      const k=localStorage.key(i);const v=localStorage.getItem(k)||'';
      const bytes=(k.length+v.length)*2;total+=bytes;
      if(k.startsWith('su_'))rows.push({k,bytes});
    }
    rows.sort((a,b)=>b.bytes-a.bytes);
    const limit=5*1024*1024;
    const pct=Math.min(100,Math.round(total/limit*100));
    const barCol=pct>=90?'#dc2626':pct>=70?'#f59e0b':'#22c55e';
    const fmt=b=>b>=1024*1024?(b/1024/1024).toFixed(2)+'MB':b>=1024?(b/1024).toFixed(1)+'KB':b+'B';
    const LABELS={'su_p':'선수 데이터','su_pp':'선수 사진','su_mm':'미니대전','su_um':'대학대전','su_ck':'대학CK','su_pro':'프로리그','su_cm':'대회','su_tn':'토너먼트','su_mb':'회원관리','su_notices':'공지','su_psi':'상태아이콘'};
    el.innerHTML=`
    <div style="margin-bottom:10px">
      <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:5px">
        <span style="font-weight:700;color:var(--text)">${fmt(total)} / 5MB 사용</span>
        <span style="font-weight:700;color:${barCol}">${pct}%</span>
      </div>
      <div style="height:10px;border-radius:5px;background:var(--border2);overflow:hidden">
        <div style="height:100%;width:${pct}%;background:${barCol};border-radius:5px;transition:.3s"></div>
      </div>
      ${pct>=70?`<div style="font-size:11px;color:${barCol};margin-top:5px;font-weight:600">${pct>=90?'⚠️ 저장 공간이 거의 가득 찼습니다! 데이터를 정리해 주세요.':'⚠️ 저장 공간이 많이 사용되고 있습니다.'}</div>`:''}
    </div>
    <div style="font-size:11px;color:var(--gray-l);margin-bottom:4px">항목별 사용량 (상위 10개)</div>
    <div style="font-size:11px;line-height:1.8">
      ${rows.slice(0,10).map(({k,bytes})=>{
        const label=LABELS[k]||k;
        const bpct=Math.min(100,Math.round(bytes/limit*100));
        return `<div style="display:flex;align-items:center;gap:6px;margin-bottom:3px">
          <span style="min-width:100px;color:var(--text2)">${label}</span>
          <div style="flex:1;height:6px;border-radius:3px;background:var(--border2);overflow:hidden"><div style="height:100%;width:${bpct}%;background:#60a5fa;border-radius:3px"></div></div>
          <span style="min-width:55px;text-align:right;color:var(--gray-l)">${fmt(bytes)}</span>
        </div>`;
      }).join('')}
    </div>`;
  }catch(e){el.innerHTML='<div style="color:var(--gray-l);font-size:12px">사용량 계산 불가</div>';}
}

// ── 이미지탭 레이아웃 저장 함수 ──
function saveB2LayoutSettings(){
  const settings = {
    autoResize: document.getElementById('cfg-b2-auto-resize')?.checked !== false,
    leftSize: parseInt(document.getElementById('cfg-b2-left-size')?.value) || 55,
    pcHeight: parseInt(document.getElementById('cfg-b2-pc-height')?.value) || 600,
    mobileHeight: parseInt(document.getElementById('cfg-b2-mobile-height')?.value) || 320,
    tabletHeight: parseInt(document.getElementById('cfg-b2-tablet-height')?.value) || 400
  };
  localStorage.setItem('su_b2_layout', JSON.stringify(settings));
  if(typeof save==='function')save();
  alert('이미지탭 레이아웃이 저장되었습니다.');
  if(typeof render === 'function') render();
}

// ── 이미지 설정 저장 함수 ──
function saveImageSettings(){
  const settings = {
    fill: document.getElementById('cfg-img-fill')?.checked || false,
    scale: parseFloat(document.getElementById('cfg-img-scale')?.value) || 1,
    brightness: parseFloat(document.getElementById('cfg-img-brightness')?.value) || 1,
    scaleLeft: parseFloat(document.getElementById('cfg-img-scale-left')?.value) || 1,
    scaleRight: parseFloat(document.getElementById('cfg-img-scale-right')?.value) || 1,
    randomRotation: document.getElementById('cfg-img-random')?.checked || false,
    interval: parseInt(document.getElementById('cfg-img-interval')?.value) || 5
  };
  localStorage.setItem('su_img_settings', JSON.stringify(settings));
  
  // 이미지탭(board2)과 동기화를 위한 저장
  const b2Settings = {
    primary: {
      fill: settings.fill ? 'contain' : 'cover',
      scale: settings.scale * 100,
      brightness: settings.brightness * 100,
      offsetX: 0,
      offsetY: 0,
      zoom: settings.scale * 100,
      posX: 0,
      posY: 0
    },
    secondary: {
      fill: settings.fill ? 'contain' : 'cover',
      scale: settings.scale * 100,
      brightness: settings.brightness * 100,
      offsetX: 0,
      offsetY: 0,
      zoom: settings.scale * 100,
      posX: 0,
      posY: 0
    }
  };
  localStorage.setItem('su_b2_global_img_settings', JSON.stringify(b2Settings));
  
  if(typeof save==='function')save();
  alert('이미지 설정이 저장되었습니다.');
  if(typeof render === 'function') render();
}

// ── 우클릭 이미지 조절 메뉴 ──
let _imgContextMenuEl = null;
let _currentImageTarget = null;

function showImageContextMenu(e, imgElement){
  e.preventDefault();
  _currentImageTarget = imgElement;
  
  // 기존 메뉴 제거
  if(_imgContextMenuEl){
    _imgContextMenuEl.remove();
  }
  
  const menu = document.createElement('div');
  menu.style.cssText = `
    position: fixed;
    left: ${e.clientX}px;
    top: ${e.clientY}px;
    background: var(--white);
    border: 1px solid var(--border2);
    border-radius: 8px;
    padding: 8px 0;
    min-width: 180px;
    z-index: 10000;
    box-shadow: 0 4px 20px rgba(0,0,0,0.15);
  `;
  
  const imgSettings = JSON.parse(localStorage.getItem('su_img_settings')||'{}');
  const currentScale = imgElement.dataset.scale || imgSettings.scale || 1;
  const currentBrightness = imgElement.dataset.brightness || imgSettings.brightness || 1;
  
  menu.innerHTML = `
    <div style="padding: 8px 16px; font-size: 12px; font-weight: 700; color: var(--text2); border-bottom: 1px solid var(--border);">
      🖼️ 이미지 조절
    </div>
    <div style="padding: 8px 16px;">
      <label style="font-size: 11px; font-weight: 600; color: var(--text3); display: block; margin-bottom: 4px;">크기: <span id="ctx-scale-val">${currentScale}x</span></label>
      <input type="range" id="ctx-scale" min="0.5" max="3" step="0.1" value="${currentScale}" style="width: 100%;" oninput="document.getElementById('ctx-scale-val').textContent=this.value+'x'">
    </div>
    <div style="padding: 8px 16px;">
      <label style="font-size: 11px; font-weight: 600; color: var(--text3); display: block; margin-bottom: 4px;">밝기: <span id="ctx-bright-val">${currentBrightness}x</span></label>
      <input type="range" id="ctx-bright" min="0.3" max="2" step="0.1" value="${currentBrightness}" style="width: 100%;" oninput="document.getElementById('ctx-bright-val').textContent=this.value+'x'">
    </div>
    <div style="padding: 8px 16px; border-top: 1px solid var(--border);">
      <button onclick="applyImageContextStyle()" style="width: 100%; padding: 6px 12px; background: var(--blue); color: #fff; border: none; border-radius: 6px; font-size: 12px; font-weight: 600; cursor:pointer;">✅ 적용</button>
    </div>
  `;
  
  document.body.appendChild(menu);
  _imgContextMenuEl = menu;
  
  // 메뉴 외부 클릭 시 닫기
  setTimeout(()=>{
    const closeMenu = (ev)=>{
      if(!menu.contains(ev.target)){
        menu.remove();
        _imgContextMenuEl = null;
        document.removeEventListener('click', closeMenu);
      }
    };
    document.addEventListener('click', closeMenu);
  }, 0);
}

function applyImageContextStyle(){
  if(!_currentImageTarget) return;
  
  const scale = document.getElementById('ctx-scale')?.value || 1;
  const brightness = document.getElementById('ctx-bright')?.value || 1;
  
  _currentImageTarget.style.transform = `scale(${scale})`;
  _currentImageTarget.style.filter = `brightness(${brightness})`;
  _currentImageTarget.dataset.scale = scale;
  _currentImageTarget.dataset.brightness = brightness;
  
  if(_imgContextMenuEl){
    _imgContextMenuEl.remove();
    _imgContextMenuEl = null;
  }
}

// ── 랜덤 이미지 회전 ──
let _randomRotationTimer = null;

function startRandomRotation(){
  stopRandomRotation();
  const imgSettings = JSON.parse(localStorage.getItem('su_img_settings')||'{}');
  if(!imgSettings.randomRotation) return;
  
  const interval = (imgSettings.interval || 5) * 1000;
  
  _randomRotationTimer = setInterval(()=>{
    rotateRandomImage();
  }, interval);
}

function stopRandomRotation(){
  if(_randomRotationTimer){
    clearInterval(_randomRotationTimer);
    _randomRotationTimer = null;
  }
}

function rotateRandomImage(){
  const imgSettings = JSON.parse(localStorage.getItem('su_img_settings')||'{}');
  if(!imgSettings.randomRotation) return;
  
  // 랜덤 스트리머 선택
  if(players && players.length > 0){
    const randomPlayer = players[Math.floor(Math.random() * players.length)];
    
    // 전체대학 보기
    if(currentTab === 'total'){
      const imgContainer = document.querySelector('.random-image-container');
      if(imgContainer && randomPlayer.photo){
        imgContainer.src = randomPlayer.photo;
      }
    }
    
    // 이미지탭(board2)
    const b2MainImg = document.getElementById('b2-main-img-1');
    if(b2MainImg && randomPlayer.photo && typeof _b2UpdateMainDisplay === 'function'){
      _b2UpdateMainDisplay(randomPlayer.name);
    }
  }
}

// 현재 탭 추적
let currentTab = 'total';

// 탭 변경 시 회전 제어
const originalSw = window.sw;
window.sw = function(tab, el){
  currentTab = tab;
  if(originalSw) originalSw(tab, el);
  
  const imgSettings = JSON.parse(localStorage.getItem('su_img_settings')||'{}');
  if(tab === 'total' && imgSettings.randomRotation){
    startRandomRotation();
  } else {
    stopRandomRotation();
  }
};

// ── 맵 약자 목록 렌더링 ──
function _refreshAliasList(){
  const el=document.getElementById('alias-list');
  if(!el)return;
  const aliases=Object.entries(userMapAlias||{}).filter(([k])=>!k.endsWith('__disabled'));
  if(!aliases.length){
    el.innerHTML='<div style="font-size:12px;color:var(--gray-l)">추가된 약자가 없습니다.</div>';
    return;
  }
  el.innerHTML=aliases.map(([k,v])=>
    `<span style="display:inline-flex;align-items:center;gap:4px;background:var(--white);border:1px solid var(--border);border-radius:6px;padding:2px 8px;font-size:12px;margin-bottom:4px">
      <span style="font-family:monospace"><b>${k}</b> → ${v}</span>
      <button onclick="delMapAlias('${encodeURIComponent(k)}')" style="background:none;border:none;cursor:pointer;color:#dc2626;font-size:11px;padding:0 2px;line-height:1" title="삭제">✕</button>
    </span>`
  ).join('');
}

// ── 크루 관리 함수들 ──
function _refreshCrewList(){
  const el=document.getElementById('crew-list');
  if(!el) return;
  if(typeof crews==='undefined'||!crews||!crews.length){el.innerHTML='<div style="font-size:12px;color:var(--gray-l)">아직 추가된 크루가 없습니다.</div>';return;}
  el.innerHTML=crews.map((c,ci)=>{
    const col=c.color||'#6b7280';
    const memberBtns=(c.members||[]).map((m,mi)=>`
      <span style="display:inline-flex;align-items:center;gap:3px;background:var(--surface);border:1px solid var(--border);border-radius:6px;padding:2px 6px;font-size:11px">
        ${m.name}${m.role?`<span style="color:${col};font-size:10px;margin-left:2px">(${m.role})</span>`:''}
        ${isLoggedIn?`<button onclick="delCrewMember(${ci},${mi})" style="background:none;border:none;cursor:pointer;color:#dc2626;font-size:10px;padding:0 2px">✕</button>`:''}
      </span>`).join('');
    return `<div style="border:1.5px solid ${col}55;border-radius:10px;padding:10px 12px;margin-bottom:8px;background:${col}08">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
        ${c.icon?`<span style="font-size:20px">${c.icon}</span>`:''}
        <span style="font-weight:800;font-size:14px;color:${col}">${c.name}</span>
        ${c.desc?`<span style="font-size:11px;color:var(--gray-l)">${c.desc}</span>`:''}
        <span style="font-size:11px;color:var(--gray-l)">${(c.members||[]).length}명</span>
        ${isLoggedIn?`<button class="btn btn-r btn-xs" style="margin-left:auto" onclick="delCrew(${ci})">🗑️ 삭제</button>`:''}
      </div>
      <div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:8px">${memberBtns}</div>
      ${isLoggedIn?`<div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center">
        <select id="crew-add-mem-${ci}" style="font-size:11px;padding:3px 6px;border:1px solid var(--border2);border-radius:5px">
          <option value="">멤버 추가...</option>
          ${players.filter(p=>!(c.members||[]).some(m=>m.name===p.name)).map(p=>{
              const hasUniv=p.univ&&p.univ!=='무소속';
              return `<option value="${p.name}">${p.name} (${p.univ||'무소속'})${hasUniv?' ⚠️대학있음':''}`;
            }).join('')}
        </select>
        <input type="text" id="crew-add-role-${ci}" placeholder="역할 (선택, 예:리더)" style="width:100px;font-size:11px;padding:3px 6px;border:1px solid var(--border2);border-radius:5px">
        <button class="btn btn-b btn-xs" onclick="addCrewMember(${ci})">+ 추가</button>
      </div>`:''}
    </div>`;
  }).join('');
}

function addCrew(){
  const name=(document.getElementById('crew-name')?.value||'').trim();
  if(!name){alert('크루 이름을 입력하세요.');return;}
  if(crews.find(c=>c.name===name)){alert('같은 이름의 크루가 있습니다.');return;}
  const color=document.getElementById('crew-color')?.value||'#6366f1';
  const icon=(document.getElementById('crew-icon')?.value||'').trim();
  const desc=(document.getElementById('crew-desc')?.value||'').trim();
  const id='crew_'+Date.now();
  crews.push({id,name,color,icon,desc,members:[]});
  save();
  document.getElementById('crew-name').value='';
  document.getElementById('crew-icon').value='';
  document.getElementById('crew-desc').value='';
  _refreshCrewList();
}

function delCrew(ci){
  if(!confirm(`"${crews[ci]?.name}" 크루를 삭제할까요?`)) return;
  crews.splice(ci,1);
  save(); render();
}

function addCrewMember(ci){
  const name=document.getElementById(`crew-add-mem-${ci}`)?.value||'';
  if(!name) return;
  const role=(document.getElementById(`crew-add-role-${ci}`)?.value||'').trim();
  if(!(crews[ci].members)) crews[ci].members=[];
  crews[ci].members.push({name,role});
  // 크루 소속 = 자동 무소속 처리
  const p=players.find(x=>x.name===name);
  if(p && p.univ && p.univ!=='무소속'){
    if(confirm(`"${name}"의 대학 소속(${p.univ})을 무소속으로 변경할까요?`)){
      delete p.role;
      p.univ='무소속';
    }
  }
  save(); _refreshCrewList();
}

function delCrewMember(ci,mi){
  crews[ci].members.splice(mi,1);
  save(); _refreshCrewList();
}

function bulkChangeTier(){
  if(!isLoggedIn) return;
  const fromTier=document.getElementById('bulk-tier-from')?.value||'';
  const toTier=document.getElementById('bulk-tier-to')?.value||'';
  const targetUniv=document.getElementById('bulk-tier-univ')?.value||'';
  if(!toTier){alert('변경할 티어를 선택하세요.');return;}
  const targets=players.filter(p=>{
    if(fromTier && (p.tier||'미정')!==fromTier) return false;
    if(targetUniv && p.univ!==targetUniv) return false;
    return true;
  });
  if(!targets.length){alert('해당하는 선수가 없습니다.');return;}
  if(!confirm(`${targets.length}명의 티어를 '${toTier}'으로 변경할까요?\n\n${targets.slice(0,5).map(p=>p.name).join(', ')}${targets.length>5?` 외 ${targets.length-5}명`:''}`)) return;
  targets.forEach(p=>{ p.tier=toTier; });
  save(); render();
  const el=document.getElementById('bulk-tier-result');
  if(el){ el.textContent=`✅ ${targets.length}명 변경 완료!`; setTimeout(()=>{if(el)el.textContent='';},3000); }
}

/* ══════════════════════════════════════
   경기 일괄 수정 함수들
══════════════════════════════════════ */
function bulkConvertToGameScore(){
  if(!isLoggedIn) return;
  const arrMap = {mini:miniM, univm:univM, ck:ckM, pro:proM, tt:ttM};
  const targets = ['mini','univm','ck','pro','tt'].filter(m=>document.getElementById('bulk-conv-chk-'+m)?.checked);
  if(!targets.length){ alert('대상을 선택하세요.'); return; }

  let converted = 0;
  targets.forEach(key=>{
    const arr = arrMap[key]||[];
    arr.forEach(m=>{
      if(!m.sets||!m.sets.length) return;
      const gA = m.sets.reduce((s,st)=>s+(st.scoreA||0),0);
      const gB = m.sets.reduce((s,st)=>s+(st.scoreB||0),0);
      // 세트 수와 다를 때만 변환
      if(gA!==m.sa||gB!==m.sb){
        m.sa=gA; m.sb=gB;
        converted++;
      }
    });
  });

  // 대회(tourneys) 조별리그도 변환
  (tourneys||[]).forEach(tn=>{
    if(!tn.groups) return;
    tn.groups.forEach(grp=>{
      (grp.matches||[]).forEach(m=>{
        if(!m.sets||!m.sets.length) return;
        const gA=m.sets.reduce((s,st)=>s+(st.scoreA||0),0);
        const gB=m.sets.reduce((s,st)=>s+(st.scoreB||0),0);
        if(gA!==m.sa||gB!==m.sb){
          m.sa=gA; m.sb=gB;
          converted++;
        }
      });
    });
    // 브라켓 경기도 변환
    const br=tn.bracket||{};
    Object.values(br.matchDetails||{}).forEach(m=>{
      if(!m||!m.sets||!m.sets.length) return;
      const gA=m.sets.reduce((s,st)=>s+(st.scoreA||0),0);
      const gB=m.sets.reduce((s,st)=>s+(st.scoreB||0),0);
      if(gA!==m.sa||gB!==m.sb){
        m.sa=gA; m.sb=gB;
        converted++;
      }
    });
    (br.manualMatches||[]).forEach(m=>{
      if(!m.sets||!m.sets.length) return;
      const gA=m.sets.reduce((s,st)=>s+(st.scoreA||0),0);
      const gB=m.sets.reduce((s,st)=>s+(st.scoreB||0),0);
      if(gA!==m.sa||gB!==m.sb){
        m.sa=gA; m.sb=gB;
        converted++;
      }
    });
  });

  if(converted===0){
    const el=document.getElementById('bulk-conv-result');
    if(el) el.textContent='변환할 경기가 없습니다. (이미 게임수 합산으로 저장됨)';
    return;
  }
  save(); render();
  const el=document.getElementById('bulk-conv-result');
  if(el) el.textContent='✅ '+converted+'건 변환 완료!';
  setTimeout(()=>{ if(el) el.textContent=''; }, 3000);
}


/* ══════════════════════════════════════
   시즌 관리 함수
══════════════════════════════════════ */
function renderSeasonList(){
  const el = document.getElementById('cfg-season-list');
  if(!el) return;
  if(!seasons.length){
    el.innerHTML = '<div style="font-size:12px;color:var(--gray-l);padding:8px 0">등록된 시즌이 없습니다.</div>';
    return;
  }
  el.innerHTML = seasons.map((s,i) => `
    <div style="display:flex;align-items:center;gap:8px;padding:8px 10px;background:var(--white);border:1px solid var(--border);border-radius:8px;margin-bottom:6px;flex-wrap:wrap">
      <span style="font-size:13px;font-weight:800;color:#7c3aed;min-width:100px">🏆 ${s.name}</span>
      <span style="font-size:11px;color:var(--gray-l)">${s.from} ~ ${s.to}</span>
      ${isLoggedIn ? '<button class="btn btn-w btn-xs" style="margin-left:auto" onclick="editSeason('+i+')">✏️ 수정</button><button class="btn btn-r btn-xs" onclick="deleteSeason('+i+')">🗑️</button>' : '<span style="margin-left:auto"></span>'}
    </div>`).join('');
}


/* ── 브라켓 경기 붙여넣기 ── */
function openBktPasteModal(){
  const {tnId,rnd,mi,teamA,teamB}=bracketMatchState;
  _grpPasteState={mode:'bkt',tnId,rnd,mi};
  const m=getBktMatch(tnId,rnd,mi);if(!m)return;
  const tA=document.getElementById('gm-a')?.value||teamA||m.a||'';
  const tB=document.getElementById('gm-b')?.value||teamB||m.b||'';
  window._grpPasteMode=true;
  const textarea=document.getElementById('paste-input');
  const previewEl=document.getElementById('paste-preview');
  const applyBtn=document.getElementById('paste-apply-btn');
  const badge=document.getElementById('paste-summary-badge');
  const pendWarn=document.getElementById('paste-pending-warn');
  if(textarea)textarea.value='';
  if(previewEl)previewEl.innerHTML='';
  if(applyBtn){applyBtn.style.display='none';applyBtn.textContent='✅ 세트에 적용';}
  if(badge)badge.style.display='none';
  if(pendWarn)pendWarn.style.display='none';
  window._pasteResults=null;window._pasteErrors=null;
  const dateInput=document.getElementById('paste-date');
  if(dateInput)dateInput.value=m.d||'';
  const modeSel=document.getElementById('paste-mode');
  if(modeSel){modeSel.value='comp';modeSel.style.display='none';}
  const modeLabel=document.getElementById('paste-mode-label');
  if(modeLabel)modeLabel.style.display='none';
  const hintEl=document.getElementById('paste-mode-hint');
  if(hintEl)hintEl.innerHTML=`<span style="color:#1d4ed8;font-weight:700">⚔️ 브라켓 경기 입력 모드</span>${tA||tB?` — <b>팀A: ${tA}</b> vs <b>팀B: ${tB}</b>`:''}`;
  const compWrap=document.getElementById('paste-comp-wrap');
  if(compWrap){
    const setOpts=(m.sets||[]).map((s,i)=>{const lbl=i===2?'🎯 에이스전':`${i+1}세트`;return`<option value="${i}">${lbl}</option>`;}).join('');
    const teamInputs=(!tA&&!tB)?`<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:8px">
      <label style="font-size:12px;font-weight:700">팀A:</label>
      <input id="bkt-paste-ta" placeholder="대학명 입력" style="font-size:12px;padding:3px 8px;border:1px solid var(--border2);border-radius:6px;width:100px">
      <label style="font-size:12px;font-weight:700">팀B:</label>
      <input id="bkt-paste-tb" placeholder="대학명 입력" style="font-size:12px;padding:3px 8px;border:1px solid var(--border2);border-radius:6px;width:100px">
    </div>`:'';
    compWrap.innerHTML=teamInputs+`<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
      <label style="font-size:12px;font-weight:700">적용 세트:</label>
      <select id="grp-paste-set-sel" style="font-size:12px;padding:3px 8px;border:1px solid var(--border2);border-radius:6px">
        <option value="new">새 세트 추가</option>${setOpts}
      </select></div>`;
    compWrap.style.display='block';
  }
  om('pasteModal');
}

/* ── 대회 경기 붙여넣기: 일반 pasteModal을 재활용 ── */
function openGrpPasteModal(){
  _grpPasteState = {...grpMatchState, mode:'grp'};
  const tn = tourneys.find(t=>t.id===grpMatchState.tnId); if(!tn) return;
  const autoDetect = (grpMatchState.gi===null||grpMatchState.gi===undefined);
  const grp = autoDetect ? null : tn.groups[grpMatchState.gi];
  const m = (grp&&grpMatchState.mi!=null) ? grp.matches[grpMatchState.mi] : null;
  const teamA = document.getElementById('gm-a')?.value||(m?m.a:'')||'';
  const teamB = document.getElementById('gm-b')?.value||(m?m.b:'')||'';

  // 일반 pasteModal을 열되 대회 세트 적용 모드로 표시
  window._grpPasteMode = true; // pasteApply에서 대회 세트 적용으로 분기

  // pasteModal 초기화 (openPasteModal 로직 인라인)
  const textarea  = document.getElementById('paste-input');
  const previewEl = document.getElementById('paste-preview');
  const applyBtn  = document.getElementById('paste-apply-btn');
  const badge     = document.getElementById('paste-summary-badge');
  const pendWarn  = document.getElementById('paste-pending-warn');
  if (textarea)  textarea.value  = '';
  if (previewEl) previewEl.innerHTML = '';
  if (applyBtn)  { applyBtn.style.display = 'none'; applyBtn.textContent = '✅ 세트에 적용'; }
  if (badge)     badge.style.display = 'none';
  if (pendWarn)  pendWarn.style.display = 'none';
  window._pasteResults = null;
  window._pasteErrors  = null;

  const dateInput = document.getElementById('paste-date');
  if (dateInput) dateInput.value = (m&&m.d) || '';

  // 저장형식 영역에 대회 팀 정보 안내로 대체 (숨김 처리)
  const modeWrap = document.querySelector('#pasteModal [id="paste-mode"]')?.closest('div');
  // 모드 선택 숨기고 대회 안내 배너 추가
  const modeSel = document.getElementById('paste-mode');
  if(modeSel){ modeSel.value='comp'; modeSel.style.display='none'; }
  const modeLabel = document.getElementById('paste-mode-label');
  if(modeLabel) modeLabel.style.display='none';
  const hintEl = document.getElementById('paste-mode-hint');
  if(hintEl){
    if(autoDetect)
      hintEl.innerHTML=`<div style="background:#f0fdf4;border:1px solid #86efac;border-radius:8px;padding:8px 12px;margin-bottom:4px"><span style="color:#16a34a;font-weight:700">🤖 자동인식 모드</span> — 선수 소속 대학을 자동으로 인식해 해당 조 경기에 저장합니다.<br><span style="font-size:11px;color:#6b7280">팀이 다른 조일 경우 교류전으로 추가할지 확인합니다.</span></div>`;
    else
      hintEl.innerHTML=`<div style="background:#eff6ff;border:1px solid #93c5fd;border-radius:8px;padding:8px 12px;margin-bottom:4px"><span style="color:#1d4ed8;font-weight:700">🏆 경기 지정 모드</span> — <b>${teamA||'팀A'}</b> vs <b>${teamB||'팀B'}</b><br><span style="font-size:11px;color:#6b7280">세트 선택 후 붙여넣기하면 해당 세트에 저장됩니다.</span></div>`;
  }

  // 세트 선택 드롭다운 (경기 지정 모드에서 항상 표시)
  const compWrap = document.getElementById('paste-comp-wrap');
  if(compWrap){
    if(!autoDetect){
      const setOpts = (m?.sets||[]).map((s,i)=>{
        const lbl = i===2?'🎯 에이스전':`${i+1}세트`;
        const cnt=(s.games||[]).length;
        return `<option value="${i}">${lbl}${cnt?` (${cnt}게임 기존)`:''}  ← 덮어쓰기</option>`;
      }).join('');
      compWrap.style.display='flex';
      compWrap.innerHTML = `
        <label style="font-size:12px;font-weight:700;white-space:nowrap">추가할 세트:</label>
        <select id="grp-paste-set-sel" style="padding:5px 10px;border-radius:6px;border:1px solid var(--border2);font-size:12px">
          <option value="new">+ 새 세트 추가</option>
          ${setOpts}
        </select>`;
    } else {
      compWrap.style.display='none';
    }
  }

  // 불필요한 섹션 숨기기
  const _pasteDetails=document.querySelector('#pasteModal details');
  if(_pasteDetails)_pasteDetails.style.display='none';
  // 경기 방식(승차수/세트제) 선택은 대회에서도 사용 — 표시 유지
  const _matchModeDiv=document.getElementById('paste-match-mode-game')?.closest('div[style]');
  if(_matchModeDiv)_matchModeDiv.style.display='flex';
  // 세트제 기본값으로 초기화
  setPasteMatchMode('set');
  const _pTitle=document.querySelector('#pasteModal .mtitle');
  if(_pTitle)_pTitle.textContent='📋 결과 붙여넣기';

  om('pasteModal');
}

// grpPasteApply: 대회 세트 적용 버튼 핸들러 (HTML에서 직접 호출)
function grpPasteApply(){
  if(!window._pasteResults) return;
  const savable = window._pasteResults.filter(r=>r.wPlayer&&r.lPlayer);
  if(!savable.length){ alert('저장 가능한 경기가 없습니다.'); return; }
  const ok = _grpPasteApplyLogic(savable);
  if(ok){
    window._grpPasteMode = false;
    cm('pasteModal');
    window._pasteResults = null;
    window._pasteErrors  = null;
  }
}

// grpPasteApply 내부 로직
function _grpPasteApplyLogic(savable){
  if(!_grpPasteState && window._grpPasteState) _grpPasteState = window._grpPasteState;
  if(!_grpPasteState){ alert('붙여넣기 상태가 초기화되지 않았습니다. 다시 시도해주세요.'); return false; }
  const tn = (typeof _findTourneyById==='function' ? _findTourneyById(_grpPasteState.tnId) : null) || tourneys.find(t=>t.id===_grpPasteState.tnId);
  if(!tn) return false;
  // 프로컴프 브라켓 모드 분기
  if(_grpPasteState.mode==='pcbkt'){
    return typeof _pcBktPasteApplyLogic==='function' ? _pcBktPasteApplyLogic(savable,tn) : false;
  }
  if(_grpPasteState.mode==='pcgj'){
    return typeof _pcGJPasteApplyLogic==='function' ? _pcGJPasteApplyLogic(savable,tn) : false;
  }
  if(_grpPasteState.mode==='pcbktedit'){
    return typeof _pcBktEditPasteApplyLogic==='function' ? _pcBktEditPasteApplyLogic(savable) : false;
  }
  // 브라켓 모드 분기
  if(_grpPasteState.mode==='bkt'){
    return _bktPasteApplyLogic(savable,tn);
  }

  // 자동인식 모드: gi가 null이면 선수 소속 대학으로 팀/조 자동 탐지
  let gi = _grpPasteState.gi, mi = _grpPasteState.mi;
  const autoDetect = (gi===null||gi===undefined);
  if(autoDetect){
    // 1. 선수 소속 대학에서 팀A/B 추출
    const univCount={};
    savable.forEach(r=>{
      [r.wPlayer?.univ,r.lPlayer?.univ].forEach(u=>{if(u&&u!=='무소속')univCount[u]=(univCount[u]||0)+1;});
    });
    const univRanked=Object.entries(univCount).sort((a,b)=>b[1]-a[1]);
    if(univRanked.length<2){alert('선수 소속 대학을 인식할 수 없습니다.\n조편성에 등록된 선수를 입력해주세요.');return false;}
    const autoA=univRanked[0][0], autoB=univRanked[1][0];
    // 2. 두 팀이 같은 조에 있는지 확인
    const groupIdx=tn.groups.findIndex(g=>g.univs.includes(autoA)&&g.univs.includes(autoB));
    if(groupIdx<0){
      // 같은 조가 아니면 autoA의 조에 교류전으로 추가
      const giA=tn.groups.findIndex(g=>g.univs.includes(autoA));
      const giB=tn.groups.findIndex(g=>g.univs.includes(autoB));
      if(giA<0&&giB<0){alert(`"${autoA}"와 "${autoB}" 모두 조편성에 없습니다.\n조편성에서 해당 대학을 추가해주세요.`);return false;}
      const targetGi=giA>=0?giA:giB;
      const GL='ABCDEFGHIJ';
      const msg=(giA>=0&&giB>=0)
        ?`"${autoA}"(${GL[giA]}조)와 "${autoB}"(${GL[giB]}조)는 다른 조입니다.\n${GL[targetGi]}조에 교류전으로 추가하시겠습니까?`
        :`"${giA<0?autoA:autoB}"는 조편성에 없습니다.\n${GL[targetGi]}조에 경기를 추가하시겠습니까?`;
      if(!confirm(msg))return false;
      gi=targetGi;
    } else {
      gi=groupIdx;
    }
    // 3. 기존 경기 찾기 또는 새로 생성
    const grpM=tn.groups[gi].matches;
    let existIdx=grpM.findIndex(m=>(m.a===autoA&&m.b===autoB)||(m.a===autoB&&m.b===autoA));
    if(existIdx<0){
      grpM.push({a:autoA,b:autoB,sa:null,sb:null,sets:[]});
      existIdx=grpM.length-1;
    }
    mi=existIdx;
    _grpPasteState.gi=gi;_grpPasteState.mi=mi;
  }

  const m = tn.groups[gi].matches[mi];
  const teamA = document.getElementById('gm-a')?.value||m.a||'';
  const teamB = document.getElementById('gm-b')?.value||m.b||'';
  const isGameMode = window._pasteMatchMode !== 'set'; // 승차수 모드 여부

  const teamANamesSet = new Set(players.filter(p=>p.univ===teamA).map(p=>p.name));
  const teamBNamesSet = new Set(players.filter(p=>p.univ===teamB).map(p=>p.name));
  // 팀 배정: 소속 대학 우선, 무소속 등 어느 팀에도 없으면 붙여넣기 좌측 위치(leftName)로 판단
  const _isWinnerInA = (r) => {
    const wn = r.wPlayer.name;
    if(teamANamesSet.has(wn)) return true;
    if(teamBNamesSet.has(wn)) return false;
    return (r.leftName||r.winName) === wn; // 무소속: 붙여넣기 좌측=A팀 기준
  };

  if(!m.sets) m.sets=[];
  if(!m.a) m.a=teamA;
  if(!m.b) m.b=teamB;

  let toastMsg='';

  if(isGameMode){
    // ── 승차수 모드: 모든 게임을 단일 세트에 누적 ──
    if(!m.sets[0]) m.sets.unshift({games:[],scoreA:0,scoreB:0,winner:'',label:'경기 기록'});
    const gset = m.sets[0];
    if(!gset.games) gset.games=[];
    savable.forEach(r=>{
      const wn=r.wPlayer.name; const ln=r.lPlayer.name;
      const wInA=_isWinnerInA(r);
      gset.games.push({playerA:wInA?wn:ln, playerB:wInA?ln:wn, winner:wInA?'A':'B', map:r.map||''});
    });
    let gA=0,gB=0;
    gset.games.forEach(g=>{ if(g.winner==='A')gA++; else if(g.winner==='B')gB++; });
    gset.scoreA=gA; gset.scoreB=gB; gset.winner=gA>gB?'A':gB>gA?'B':'';
    // 경기 점수 = 총 게임 승수
    m.sa=gA; m.sb=gB;
    toastMsg=`✅ ${savable.length}건 추가됨! (경기 방식: ${gA}:${gB})`;
  } else {
    // ── 세트제 모드: 각 붙여넣기 = 새 세트 ──
    let setIdxEl = document.getElementById('grp-paste-set-sel');
    let setIdx = setIdxEl ? setIdxEl.value : 'new';
    if(setIdx==='new'||setIdx===undefined){
      if(m.sets.length>=3){ alert('최대 3세트까지만 가능합니다.'); return false; }
      m.sets.push({games:[],scoreA:0,scoreB:0,winner:''});
      setIdx = m.sets.length-1;
    } else {
      setIdx = parseInt(setIdx);
      // 기존 세트에 데이터가 있으면 덮어쓰기 확인 후 초기화
      const existSet = m.sets[setIdx];
      if(existSet && existSet.games && existSet.games.length>0){
        if(!confirm(`${setIdx===2?'에이스전':(setIdx+1)+'세트'}에 이미 ${existSet.games.length}게임이 있습니다.\n기존 기록을 지우고 새로 입력하시겠습니까?`))return false;
        existSet.games=[];
      }
    }
    const set = m.sets[setIdx];
    if(!set.games) set.games=[];
    savable.forEach(r=>{
      const wn=r.wPlayer.name; const ln=r.lPlayer.name;
      const wInA=_isWinnerInA(r);
      set.games.push({playerA:wInA?wn:ln, playerB:wInA?ln:wn, winner:wInA?'A':'B', map:r.map||''});
    });
    let sA=0,sB=0;
    set.games.forEach(g=>{ if(g.winner==='A')sA++; else if(g.winner==='B')sB++; });
    set.scoreA=sA; set.scoreB=sB; set.winner=sA>sB?'A':sB>sA?'B':'';
    // 경기 점수 = 세트 승수
    let mSA=0,mSB=0;
    m.sets.forEach(s=>{ if(s.winner==='A')mSA++; else if(s.winner==='B')mSB++; });
    m.sa=mSA; m.sb=mSB;
    toastMsg=`✅ ${savable.length}건 ${setIdx===2?'에이스전':(setIdx+1)+'세트'}에 추가됨!`;
  }

  const dateEl = document.getElementById('paste-date');
  if(dateEl&&dateEl.value) m.d=dateEl.value;

  // 개인 전적 반영: 기존 기록 먼저 롤백 후 전체 세트 재적용 (grpSaveMatch와 동일 패턴 → 이중저장 방지)
  if(m._id) revertMatchRecord({...m, _id:m._id});
  const matchId = genId();
  m._id = matchId;
  const dateStr = dateEl?.value || m.d || '';
  (m.sets||[]).forEach(set=>{
    (set.games||[]).forEach(g=>{
      if(!g.playerA||!g.playerB||!g.winner) return;
      const wn=g.winner==='A'?g.playerA:g.playerB;
      const ln=g.winner==='A'?g.playerB:g.playerA;
      const univW=g.winner==='A'?(teamA||m.a||''):(teamB||m.b||'');
      const univL=g.winner==='A'?(teamB||m.b||''):(teamA||m.a||'');
      applyGameResult(wn,ln,dateStr,g.map||'',matchId,univW,univL,tn.type==='tier'?'티어대회':'조별리그');
    });
  });
  // 티어대회: ttM에도 동기화 (기록 탭에서 표시되도록)
  if(tn.type==='tier'){
    const _ei=ttM.findIndex(x=>x._id===matchId);
    const _rec={_id:matchId,d:dateStr||m.d,a:m.a,b:m.b,sa:m.sa,sb:m.sb,sets:m.sets,n:tn.name,compName:tn.name,teamALabel:m.a,teamBLabel:m.b};
    if(_ei>=0)ttM[_ei]=_rec;else ttM.unshift(_rec);
  }

  save();
  // 이중저장 방지: 편집 모달 + 붙여넣기 모달 모두 닫기
  window._grpPasteMode = false;
  cm('grpMatchModal');
  cm('pasteModal');
  window._pasteResults = null;
  render();

  const toast=document.createElement('div');
  toast.textContent=toastMsg;
  toast.style.cssText='position:fixed;bottom:32px;left:50%;transform:translateX(-50%);background:#16a34a;color:#fff;padding:12px 24px;border-radius:10px;font-weight:700;font-size:14px;z-index:99999;box-shadow:0 4px 20px rgba(0,0,0,.2)';
  document.body.appendChild(toast);
  setTimeout(()=>toast.remove(),2500);
  return true;
}

function _bktPasteApplyLogic(savable, tn){
  const {rnd,mi}=_grpPasteState;
  const m=getBktMatch(tn.id,rnd,mi);if(!m)return false;
  let teamA=document.getElementById('gm-a')?.value||document.getElementById('bkt-paste-ta')?.value||m.a||bracketMatchState?.teamA||'';
  let teamB=document.getElementById('gm-b')?.value||document.getElementById('bkt-paste-tb')?.value||m.b||bracketMatchState?.teamB||'';
  // 팀명 미설정 시 선수 소속 대학으로 자동 감지 (붙여넣기 좌측=A팀, 우측=B팀)
  if(!teamA&&!teamB&&savable.length>0){
    const leftCnt={},rightCnt={};
    savable.forEach(r=>{
      const isWinLeft=(r.leftName||r.winName)===r.wPlayer.name;
      const lpName=isWinLeft?r.wPlayer.name:r.lPlayer.name;
      const rpName=isWinLeft?r.lPlayer.name:r.wPlayer.name;
      const lu=players.find(p=>p.name===lpName)?.univ;
      const ru=players.find(p=>p.name===rpName)?.univ;
      if(lu)leftCnt[lu]=(leftCnt[lu]||0)+1;
      if(ru)rightCnt[ru]=(rightCnt[ru]||0)+1;
    });
    const topL=Object.entries(leftCnt).sort((a,b)=>b[1]-a[1])[0];
    const topR=Object.entries(rightCnt).sort((a,b)=>b[1]-a[1])[0];
    if(topL)teamA=topL[0];
    if(topR&&topR[0]!==teamA)teamB=topR[0];
  }
  let setIdxEl=document.getElementById('grp-paste-set-sel');
  let setIdx=setIdxEl?setIdxEl.value:'new';
  if(!m.sets)m.sets=[];
  if(setIdx==='new'||setIdx===undefined){
    if(m.sets.length>=3){alert('최대 3세트까지만 가능합니다.');return false;}
    m.sets.push({games:[],scoreA:0,scoreB:0,winner:''});
    setIdx=m.sets.length-1;
  } else {
    setIdx=parseInt(setIdx);
    // 기존 세트에 데이터가 있으면 덮어쓰기 확인 후 초기화
    const existSet=m.sets[setIdx];
    if(existSet&&existSet.games&&existSet.games.length>0){
      if(!confirm(`${setIdx===2?'에이스전':(setIdx+1)+'세트'}에 이미 ${existSet.games.length}게임이 있습니다.\n기존 기록을 지우고 새로 입력하시겠습니까?`))return false;
      existSet.games=[];
    }
  }
  const set=m.sets[setIdx];
  if(!set.games)set.games=[];
  const teamANamesSet=new Set(players.filter(p=>p.univ===teamA).map(p=>p.name));
  const teamBNamesSet=new Set(players.filter(p=>p.univ===teamB).map(p=>p.name));
  const _isWinnerInA=(r)=>{
    const wn=r.wPlayer.name;
    if(teamANamesSet.has(wn))return true;
    if(teamBNamesSet.has(wn))return false;
    return (r.leftName||r.winName)===wn;
  };
  savable.forEach(r=>{
    const wn=r.wPlayer.name;const ln=r.lPlayer.name;
    let pA='',pB='',winner='';
    if(_isWinnerInA(r)){pA=wn;pB=ln;winner='A';}
    else{pA=ln;pB=wn;winner='B';}
    set.games.push({playerA:pA,playerB:pB,winner:winner,map:r.map||''});
  });
  let sA=0,sB=0;
  set.games.forEach(g=>{if(g.winner==='A')sA++;else if(g.winner==='B')sB++;});
  set.scoreA=sA;set.scoreB=sB;set.winner=sA>sB?'A':sB>sA?'B':'';
  if(!m.a)m.a=teamA;if(!m.b)m.b=teamB;
  const dateEl=document.getElementById('paste-date');
  if(dateEl&&dateEl.value)m.d=dateEl.value;
  if(!m.d)m.d=new Date().toISOString().slice(0,10);
  // 전체 세트 집계로 경기 최종 스코어 갱신
  let mSA=0,mSB=0;
  (m.sets||[]).forEach(s=>{if(s.winner==='A')mSA++;else if(s.winner==='B')mSB++;});
  m.sa=mSA;m.sb=mSB;
  // 브라켓 승자 자동 업데이트 (수동 추가 경기 rnd===-1은 스킵)
  if(_grpPasteState.rnd!==-1){
    const _bw=mSA>mSB?m.a:mSB>mSA?m.b:'';
    if(_bw){const _bbr=getBracket(tn);_bbr.winners[`${_grpPasteState.rnd}-${_grpPasteState.mi}`]=_bw;}
  }
  // 개인 전적 반영: 기존 기록 먼저 롤백 후 전체 세트 재적용 (이중저장 방지)
  if(m._id) revertMatchRecord({...m, _id:m._id});
  const matchId=genId();
  m._id=matchId;
  const dateStr=m.d;
  (m.sets||[]).forEach(s=>{
    (s.games||[]).forEach(g=>{
      if(!g.playerA||!g.playerB||!g.winner)return;
      const wn=g.winner==='A'?g.playerA:g.playerB;
      const ln=g.winner==='A'?g.playerB:g.playerA;
      const univW=g.winner==='A'?(m.a||''):(m.b||'');
      const univL=g.winner==='A'?(m.b||''):(m.a||'');
      applyGameResult(wn,ln,dateStr,g.map||'',matchId,univW,univL,'대회');
    });
  });
  save();
  const _matchModal=document.getElementById('grpMatchModal');
  if(_matchModal&&_matchModal.style.display!=='none'&&_matchModal.offsetParent!==null){
    bktRefreshSets();
  } else {
    render();
  }
  const toast=document.createElement('div');
  toast.textContent=`✅ ${savable.length}건 ${setIdx===2?'에이스전':(setIdx+1)+'세트'}에 추가됨!`;
  toast.style.cssText='position:fixed;bottom:32px;left:50%;transform:translateX(-50%);background:#16a34a;color:#fff;padding:12px 24px;border-radius:10px;font-weight:700;font-size:14px;z-index:99999;box-shadow:0 4px 20px rgba(0,0,0,.2)';
  document.body.appendChild(toast);
  setTimeout(()=>toast.remove(),2500);
  return true;
}

function ttFixOrphanRecords(compName,includeWrong){
  const orphans=ttM.filter(m=>!m.compName||m.compName==='');
  const wrongComp=includeWrong?ttM.filter(m=>m.compName&&m.compName!==compName):[];
  const targets=[...orphans,...wrongComp];
  if(!targets.length){alert('연결할 기록이 없습니다.');return;}
  const wrongNames=[...new Set(wrongComp.map(m=>m.compName))].join(', ');
  const msg=`기록 ${targets.length}건을 "${compName}"에 연결합니다.${wrongNames?`\n(다른 대회명: ${wrongNames})`:''}\n계속할까요?`;
  if(!confirm(msg))return;
  targets.forEach(m=>{m.compName=compName;if(!m.n)m.n=compName;});
  save();render();
}

