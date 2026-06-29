/* ══════════════════════════════════════
   Match Builder Pro League
══════════════════════════════════════ */

// HTML escape — constants.js의 window.escHTML 위임 (var: 재선언 충돌 방지)
var esc = function(s){ return window.escHTML(s); };

var proSub='records';

function rPro(C,T){
  T.innerText='🏅 프로리그';
  if(typeof players==='undefined' || !Array.isArray(players)){
    C.innerHTML=`<div style="padding:40px 20px;text-align:center;color:var(--gray-l)">데이터 로딩 중...</div>`;
    return;
  }
  if(typeof proM==='undefined' || !Array.isArray(proM)) window.proM = [];
  if(typeof proSub==='undefined') window.proSub = 'records';
  if(typeof recSortDir==='undefined') window.recSortDir = 'desc';
  if(!window.BLD) window.BLD = {};
  const _li = (typeof isLoggedIn!=='undefined' ? !!isLoggedIn : false) || !!window.isLoggedIn;
  if(!_li && proSub==='input') proSub='records';
  const subOpts=(typeof applyTabLabels==='function') ? applyTabLabels('pro', [
    {id:'input',lbl:'📝 경기 입력',fn:`proSub='input';render()`},
    {id:'rank',lbl:'🏆 순위',fn:`proSub='rank';render()`},
    {id:'records',lbl:'📋 기록',fn:`proSub='records';openDetails={};render()`}
  ]) : [
    {id:'input',lbl:'📝 경기 입력',fn:`proSub='input';render()`},
    {id:'rank',lbl:'🏆 순위',fn:`proSub='rank';render()`},
    {id:'records',lbl:'📋 기록',fn:`proSub='records';openDetails={};render()`}
  ];
  let h='';
  const extra = (proSub!=='input' && typeof buildYearMonthFilterControls==='function')
    ? (buildYearMonthFilterControls('pro', true)
      + `<button class="pill ${recSortDir==='desc'?'on':''}" style="flex-shrink:0;white-space:nowrap" onclick="recSortDir='desc';render()">최신순 ↓</button>`
      + `<button class="pill ${recSortDir==='asc'?'on':''}" style="flex-shrink:0;white-space:nowrap" onclick="recSortDir='asc';render()">오래된순 ↑</button>`)
    : '';
  h+=_buildMatchSubtabShell(proSub, subOpts, '_proFilterOpen', extra, 'pro');
  if(proSub==='input'&&_li){
    if(!BLD['pro']){const _sv=J('su_bld_pro')||{};BLD['pro']={date:_sv.date||'',membersA:_sv.membersA||[],membersB:_sv.membersB||[],tierFilters:_sv.tierFilters||[],sets:_sv.sets||[]};}
    h+=buildProInputHTML();
  } else if(proSub==='rank'){
    h+=proRankHTML();
  } else {
    h+=recSummaryListHTML(proM,'pro','tab');
  }
  C.innerHTML=h;
}

function buildProInputHTML(){
  const bld=BLD['pro'];
  const mA=bld.membersA||[];const mB=bld.membersB||[];
  const PRO_TIERS=['G','K','JA','J','S','0티어','1티어'];
  if(!bld.tierFilters)bld.tierFilters=[];
  const tf=bld.tierFilters;
  const allAddedNames=new Set([...(bld.membersA||[]),...(bld.membersB||[])].map(m=>m.name));
  const eligible=players.filter(p=>
    PRO_TIERS.includes(p.tier) &&
    (tf.length===0||tf.includes(p.tier)) &&
    (p.gender==='M' || allAddedNames.has(p.name))
  ).sort((a,b)=>{
    const ti=t=>PRO_TIERS.indexOf(t);
    return ti(a.tier)-ti(b.tier)||(a.name||'').localeCompare(b.name||'');
  });

  const actionBar = _mbActionBar([
    `<button class="btn btn-p btn-sm mb-mini-btn" onclick="openProPasteModal()" style="display:inline-flex;align-items:center;gap:5px">📋 자동인식</button>`
  ], '');
  let h = _mbSectionCard('① 기본 정보', `
    <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
      <label style="font-size:12px;font-weight:700;color:var(--blue)">날짜</label>
      <input type="date" value="${bld.date||''}" onchange="BLD['pro'].date=this.value">
    </div>`) + _mbSectionCard('② 참가 티어', `
      <div style="display:flex;gap:5px;flex-wrap:wrap">
        <button class="tier-filter-btn ${tf.length===0?'on':''}" onclick="BLD['pro'].tierFilters=[];BLD['pro'].membersA=[];BLD['pro'].membersB=[];BLD['pro'].sets=[];render()">전체</button>
        ${PRO_TIERS.map(t=>{const _bg=getTierBtnColor(t),_tc=getTierBtnTextColor(t),_on=tf.includes(t);return`<button class="tier-filter-btn ${_on?'on':''}" style="${_on?`background:${_bg};color:${_tc};border-color:${_bg}`:''}" onclick="proToggleTier('${t}')">${getTierLabel(t)}</button>`;}).join('')}
      </div>
      <div style="font-size:11px;color:var(--blue);margin-top:6px">대상 스트리머: <strong>${eligible.length}명</strong></div>
    `, '(복수 선택 · god~1티어 · 검색으로 여성 선수도 추가 가능)') + _mbSectionCard('③ 스트리머 클릭 → 팀 배정', `
      <div style="display:flex;flex-wrap:wrap;gap:6px;padding:10px;background:var(--surface);border:1px solid var(--border);border-radius:8px;max-height:220px;overflow-y:auto">
        ${eligible.length===0
          ?'<span style="color:var(--gray-l);font-size:12px">티어를 선택하면 스트리머 목록이 표시됩니다</span>'
          :eligible.map(p=>{
              const pn=(typeof escJS==='function') ? escJS(p.name) : String(p.name||'').replace(/\\/g,'\\\\').replace(/'/g,"\\'").replace(/\r/g,'\\r').replace(/\n/g,'\\n');
              const inA=mA.some(m=>m.name===p.name);
              const inB=mB.some(m=>m.name===p.name);
              const bg=inA?'#2563eb':inB?'#dc2626':gc(p.univ);
              if(inA||inB){
                return `<span style="display:inline-flex;align-items:center;gap:3px;background:${bg};color:#fff;padding:4px 8px;border-radius:6px;font-size:11px;opacity:0.55">${p.name}${p.gender==='F'?'<span style="font-size:9px;color:#fda4af">♀</span>':''}<span style="opacity:.8;font-size:10px;margin-left:2px">${p.univ}/${p.tier}</span><span style="background:rgba(255,255,255,.3);border-radius:2px;padding:0 4px;font-size:9px;font-weight:800;margin-left:3px">${inA?'A팀':'B팀'}</span></span>`;
              }
              return `<span style="display:inline-flex;align-items:center;gap:4px;background:${bg};color:#fff;padding:3px 6px;border-radius:6px;font-size:11px">
                <span style="font-weight:700">${p.name}${p.gender==='F'?'<span style="font-size:9px;color:#fda4af;margin-left:2px">♀</span>':''}</span><span style="opacity:.8;font-size:10px">${p.univ}/${p.tier}</span>
                <button onclick="proAddPlayer('A','${pn}')" style="background:var(--white);color:#2563eb;border:none;border-radius:3px;padding:1px 6px;font-size:10px;font-weight:800;cursor:pointer;margin-left:2px">A팀</button>
                <button onclick="proAddPlayer('B','${pn}')" style="background:var(--white);color:#dc2626;border:none;border-radius:3px;padding:1px 6px;font-size:10px;font-weight:800;cursor:pointer">B팀</button>
              </span>`;
            }).join('')
        }
      </div>
    `, '(A팀 / B팀 버튼으로 추가)') + _mbSectionCard('④ 팀 구성 확인 + 검색 추가', `
    <div class="mb-split">
      <div class="ck-panel">
        <h4>🔵 팀 A (${mA.length}명)</h4>
        <div style="display:flex;gap:6px;margin-bottom:6px">
          <input type="text" id="pro-a-search" placeholder="🔍 이름·메모/별명 검색..." style="flex:1;padding:5px 8px;border:1px solid var(--border2);border-radius:6px;font-size:12px" oninput="proSearchPlayer('A')" onkeydown="if(event.key==='Enter')proAddByQuery('A')">
        </div>
        <div id="pro-a-drop" style="display:none;max-height:140px;overflow-y:auto;border:1px solid var(--border2);border-radius:6px;background:var(--white);margin-bottom:6px"></div>
        <div>${mA.map((m,i)=>`<span class="mem-tag" style="background:${gc(m.univ)}">${m.name}<span style="font-size:10px;opacity:.8">(${m.univ}${m.tier?'/'+m.tier:''}${m.race?'/'+m.race:''})</span><button onclick="BLD['pro'].membersA.splice(${i},1);BLD['pro'].sets=[];render()">×</button></span>`).join('')||'<span style="color:var(--gray-l);font-size:12px">스트리머 없음</span>'}</div>
      </div>
      <div class="ck-panel">
        <h4>🔴 팀 B (${mB.length}명)</h4>
        <div style="display:flex;gap:6px;margin-bottom:6px">
          <input type="text" id="pro-b-search" placeholder="🔍 이름·메모/별명 검색..." style="flex:1;padding:5px 8px;border:1px solid var(--border2);border-radius:6px;font-size:12px" oninput="proSearchPlayer('B')" onkeydown="if(event.key==='Enter')proAddByQuery('B')">
        </div>
        <div id="pro-b-drop" style="display:none;max-height:140px;overflow-y:auto;border:1px solid var(--border2);border-radius:6px;background:var(--white);margin-bottom:6px"></div>
        <div>${mB.map((m,i)=>`<span class="mem-tag" style="background:${gc(m.univ)}">${m.name}<span style="font-size:10px;opacity:.8">(${m.univ}${m.tier?'/'+m.tier:''}${m.race?'/'+m.race:''})</span><button onclick="BLD['pro'].membersB.splice(${i},1);BLD['pro'].sets=[];render()">×</button></span>`).join('')||'<span style="color:var(--gray-l);font-size:12px">스트리머 없음</span>'}</div>
      </div>
    </div>`) + _mbSectionCard('⑤ 경기 결과 입력', `
      <div style="margin-bottom:10px;padding:10px 12px;border:1px solid rgba(14,165,233,.22);background:linear-gradient(135deg,rgba(239,246,255,.96),rgba(248,250,252,.98));border-radius:10px;font-size:11px;color:#0f172a;line-height:1.6">
        <strong style="color:#0369a1">2대2 수동 입력 가능</strong>
        <span style="color:#475569">각 경기의 </span>
        <span style="display:inline-flex;align-items:center;justify-content:center;min-width:30px;height:20px;padding:0 7px;border-radius:999px;background:#e0f2fe;color:#0369a1;font-size:10px;font-weight:900;vertical-align:middle">2:2</span>
        <span style="color:#475569"> 버튼을 누르면 </span>
        <strong>A1/A2 vs B1/B2</strong>
        <span style="color:#475569"> 형태로 바뀝니다.</span>
      </div>
      ${setBuilderHTML(bld,'pro')}`);
  return _mbFrame('🏅 프로리그 입력', actionBar, h, '');
}

function proSearchPlayer(team){
  const searchEl=document.getElementById(`pro-${team.toLowerCase()}-search`);
  const dropEl=document.getElementById(`pro-${team.toLowerCase()}-drop`);
  if(!searchEl||!dropEl)return;
  const q0=searchEl.value.trim();
  const aliasName=_mbResolveAliasQuery(q0);
  const q=(aliasName||q0).toLowerCase();
  if(!q){dropEl.style.display='none';dropEl.innerHTML='';return;}
  const PRO_TIERS=['G','K','JA','J','S','0티어','1티어'];
  const bld=BLD['pro']||{};
  const tf=bld.tierFilters||[];
  const already=[...(bld.membersA||[]),...(bld.membersB||[])].map(m=>m.name);
  let results=players.filter(p=>
    (PRO_TIERS.includes(p.tier) || p.gender==='F') &&
    (tf.length===0||tf.includes(p.tier)||p.gender==='F') &&
    !already.includes(p.name) &&
    (p.name.toLowerCase().includes(q)||(p.memo||'').toLowerCase().includes(q)||(p.univ||'').toLowerCase().includes(q)||(p.tier||'').toLowerCase().includes(q))
  ).slice(0,20);
  if(aliasName){
    const ap=players.find(p=>p.name===aliasName);
    if(ap && !already.includes(ap.name)){
      results=[ap, ...results.filter(x=>x.name!==ap.name)].slice(0,20);
    }
  }
  if(!results.length){
    dropEl.innerHTML='<div style="padding:10px;color:var(--gray-l);font-size:12px;text-align:center">검색 결과 없음</div>';
    dropEl.style.display='block';return;
  }
  dropEl.innerHTML=results.map(p=>`<div onclick="proAddPlayer('${team}','${escJS(p.name)}');document.getElementById('pro-${team.toLowerCase()}-search').value='';document.getElementById('pro-${team.toLowerCase()}-drop').style.display='none'"
    style="padding:8px 12px;cursor:pointer;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:8px;font-size:12px"
    onmouseover="this.style.background='var(--blue-l)'" onmouseout="this.style.background=''">
    <span style="display:inline-block;width:28px;height:28px;border-radius:6px;background:${gc(p.univ)};color:#fff;text-align:center;line-height:28px;font-size:11px;font-weight:700;flex-shrink:0">${(p.race||'?').charAt(0)}</span>
    <div>
      <div style="font-weight:700">${p.name}${p.gender==='F'?'<span style="color:#ec4899;font-size:10px;margin-left:3px">♀</span>':''}
        ${(aliasName && p.name===aliasName)?`<span style="background:#ecfeff;color:#0e7490;border-radius:3px;padding:1px 5px;font-size:10px;font-weight:800;margin-left:6px">별명: ${esc(q0)}</span>`:''}
        <span style="font-size:10px;background:${gc(p.univ)};color:#fff;padding:1px 5px;border-radius:3px">${p.univ}</span></div>
      <div style="font-size:10px;color:var(--gray-l)">${p.tier||'-'} · ${p.race||'-'}${p.memo?` · ${p.memo.slice(0,20)}`:''}</div>
    </div>
  </div>`).join('');
  dropEl.style.display='block';
}

function proAddByQuery(team){
  const searchEl=document.getElementById(`pro-${team.toLowerCase()}-search`);
  if(!searchEl) return;
  const raw=searchEl.value.trim();
  if(!raw) return;
  const aliasName=_mbResolveAliasQuery(raw);
  const name=(aliasName||raw).trim().replace(/\s*[TZPNtzpn]$/i,'').trim();
  const bld=BLD['pro']||{};
  const already=[...(bld.membersA||[]),...(bld.membersB||[])].map(m=>m.name);
  if(name && !already.includes(name) && players.some(p=>p.name===name)){
    proAddPlayer(team, name);
    searchEl.value='';
    return;
  }
  const PRO_TIERS=['G','K','JA','J','S','0티어','1티어'];
  const tf=bld.tierFilters||[];
  const q=name.toLowerCase();
  const results=players.filter(p=>
    (PRO_TIERS.includes(p.tier) || p.gender==='F') &&
    (tf.length===0||tf.includes(p.tier)||p.gender==='F') &&
    !already.includes(p.name) &&
    (p.name.toLowerCase().includes(q)||(p.memo||'').toLowerCase().includes(q))
  ).slice(0,2);
  if(results.length===1){
    proAddPlayer(team, results[0].name);
    searchEl.value='';
  }
}

function proAddPlayerDirect(team, name){
  const bld=BLD['pro'];if(!bld)return;
  const arr=team==='A'?bld.membersA:bld.membersB;
  if(arr.find(m=>m.name===name))return;
  const pObj=players.find(p=>p.name===name)||{};
  arr.push({name,univ:pObj.univ||'',race:pObj.race||'',tier:pObj.tier||''});
  bld.sets=[];
  const searchEl=document.getElementById(`pro-${team.toLowerCase()}-search`);
  const dropEl=document.getElementById(`pro-${team.toLowerCase()}-drop`);
  if(searchEl)searchEl.value='';
  if(dropEl){dropEl.style.display='none';dropEl.innerHTML='';}
  render();
}

function proAddPlayer(team, name){
  const bld=BLD['pro'];if(!bld)return;
  const all=[...(bld.membersA||[]),...(bld.membersB||[])];
  if(all.find(m=>m.name===name))return;
  const pObj=players.find(p=>p.name===name)||{};
  const mem={name,univ:pObj.univ||'',race:pObj.race||'',tier:pObj.tier||''};
  if(team==='A')bld.membersA.push(mem);else bld.membersB.push(mem);
  bld.sets=[];render();
}

function proToggleTier(t){
  const bld=BLD['pro'];if(!bld)return;
  if(!bld.tierFilters)bld.tierFilters=[];
  const idx=bld.tierFilters.indexOf(t);
  if(idx>=0)bld.tierFilters.splice(idx,1);else bld.tierFilters.push(t);
  bld.membersA=[];bld.membersB=[];bld.sets=[];render();
}

function proFilterPlayers(team){
  const univSel=document.getElementById(`pro-${team.toLowerCase()}-univ`);
  const playerSel=document.getElementById(`pro-${team.toLowerCase()}-player`);
  if(!univSel||!playerSel)return;
  const univ=univSel.value;
  const bld=BLD['pro']||{};const tf=(bld.tierFilters||[]);
  const mems=univ?players.filter(p=>p.univ===univ&&p.gender==='M'&&(tf.length===0||tf.includes(p.tier))):[];
  playerSel.innerHTML=mems.length?`<option value="">멤버 선택</option>`+mems.map(p=>`<option value="${p.name}">${p.name} [${p.tier||'-'}/${p.race||'-'}]</option>`).join(''):`<option value="">멤버 없음</option>`;
}

function proAddMember(team){
  const univSel=document.getElementById(`pro-${team.toLowerCase()}-univ`);
  const playerSel=document.getElementById(`pro-${team.toLowerCase()}-player`);
  if(!univSel||!playerSel)return;
  const univ=univSel.value;const name=playerSel.value;
  if(!name)return alert('멤버를 선택하세요.');
  const arr=team==='A'?BLD['pro'].membersA:BLD['pro'].membersB;
  if(arr.find(m=>m.name===name))return alert('이미 추가됨');
  const pObj=players.find(p=>p.name===name)||{};
  arr.push({name,univ,race:pObj.race||'',tier:pObj.tier||''});BLD['pro'].sets=[];render();
}

function proTeamResultsHTML(){
  if(!proM||!proM.length) return `<div style="padding:40px;text-align:center;color:var(--gray-l)">기록 없음</div>`;
  const teamSt={};
  proM.forEach(m=>{
    const a=m.teamALabel||'A팀'; const b=m.teamBLabel||'B팀';
    const key=[a,b].sort().join('|||');
    if(!teamSt[key])teamSt[key]={a,b,aW:0,bW:0,draw:0};
    const sa=m.scoreA||0; const sb=m.scoreB||0;
    if(sa>sb)teamSt[key].aW++;
    else if(sb>sa)teamSt[key].bW++;
    else if(sa>0||sb>0)teamSt[key].draw++;
  });
  const mapSt={};
  proM.forEach(m=>{
    (m.sets||[]).forEach(set=>{
      (set.games||[]).forEach(g=>{
        if(!g.map)return;
        if(!mapSt[g.map])mapSt[g.map]={total:0};
        mapSt[g.map].total++;
      });
    });
  });
  const mapArr=Object.entries(mapSt).sort((a,b)=>b[1].total-a[1].total);
  let h=`<div style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:15px;color:var(--blue);margin-bottom:14px;padding-bottom:6px;border-bottom:2px solid var(--blue-ll)">⚔️ 팀전 결과 집계</div>`;
  const pairs=Object.values(teamSt);
  if(pairs.length){
    h+=`<div style="margin-bottom:20px;border-radius:12px;overflow:hidden;border:1px solid var(--border)">
      <div style="padding:10px 16px;background:linear-gradient(135deg,#1e3a8a,#2563eb);color:#fff;font-weight:900;font-size:13px">🏆 팀 간 대결 기록</div>
      <table style="width:100%;border-collapse:collapse;font-size:13px">
        <thead><tr style="background:#2563eb0f">
          <th style="padding:8px 12px;text-align:left;color:var(--text3)">A팀</th>
          <th style="padding:8px 4px;text-align:center;color:var(--text3)">승패</th>
          <th style="padding:8px 12px;text-align:right;color:var(--text3)">B팀</th>
          <th style="padding:8px 12px;text-align:center;color:var(--text3)">총 경기</th>
        </tr></thead><tbody>`;
    pairs.forEach(({a,b,aW,bW,draw})=>{
      const total=aW+bW+draw;
      const aLead=aW>bW; const bLead=bW>aW;
      h+=`<tr style="border-top:1px solid var(--border)">
        <td style="padding:8px 12px">
          <div style="display:flex;align-items:center;gap:4px">
            ${getPlayerPhotoHTML?getPlayerPhotoHTML(a,'24px'):''}
            <span style="font-weight:${aLead?'800':'500'};color:${aLead?'#16a34a':'var(--text)'}">${a}</span>
            <span style="font-size:13px;font-weight:800;color:#16a34a;margin-left:4px">${aW}승</span>
          </div>
        </td>
        <td style="padding:8px 4px;text-align:center;font-weight:900;color:var(--gray-l)">vs</td>
        <td style="padding:8px 12px;text-align:right">
          <div style="display:flex;align-items:center;justify-content:flex-end;gap:4px">
            <span style="font-size:13px;font-weight:800;color:#16a34a;margin-right:4px">${bW}승</span>
            <span style="font-weight:${bLead?'800':'500'};color:${bLead?'#16a34a':'var(--text)'}">${b}</span>
            ${getPlayerPhotoHTML?getPlayerPhotoHTML(b,'24px'):''}
          </div>
        </td>
        <td style="padding:8px 12px;text-align:center;color:var(--gray-l)">${total}${draw?` (무${draw})`:''}경기</td>
      </tr>`;
    });
    h+=`</tbody></table></div>`;
  }
  const sorted=[...proM].sort((a,b)=>(b.d||'').localeCompare(a.d||''));
  h+=`<div style="margin-bottom:20px;border-radius:12px;overflow:hidden;border:1px solid var(--border)">
    <div style="padding:10px 16px;background:linear-gradient(135deg,#0891b2,#0e7490);color:#fff;font-weight:900;font-size:13px">📋 경기별 팀전 결과 (${proM.length}경기)</div>
    <div style="padding:8px 0">`;
  sorted.forEach(m=>{
    const a=m.teamALabel||'A팀'; const b=m.teamBLabel||'B팀';
    const sa=m.scoreA||0; const sb=m.scoreB||0;
    const aWin=sa>sb; const bWin=sb>sa; const draw=sa===sb&&sa>0;
    const aCol=aWin?'#16a34a':aWin===false&&bWin?'var(--gray-l)':'var(--text)';
    const bCol=bWin?'#16a34a':bWin===false&&aWin?'var(--gray-l)':'var(--text)';
    h+=`<div style="display:flex;align-items:center;gap:8px;padding:8px 14px;border-bottom:1px solid var(--border);flex-wrap:wrap">
      <span style="font-size:12px;font-weight:600;color:var(--text3);white-space:nowrap;min-width:80px">${m.d||'날짜미정'}</span>
      <div style="flex:1;display:flex;align-items:center;gap:6px;justify-content:center;flex-wrap:wrap">
        <span style="font-weight:${aWin?'800':'500'};color:${aCol}">${a}</span>
        <div style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:15px;padding:3px 10px;background:var(--surface);border-radius:8px;border:1px solid var(--border)">
          <span style="color:${aWin?'#16a34a':'var(--text3)'}">${sa}</span>
          <span style="color:var(--gray-l);font-size:11px;margin:0 2px">:</span>
          <span style="color:${bWin?'#16a34a':'var(--text3)'}">${sb}</span>
        </div>
        <span style="font-weight:${bWin?'800':'500'};color:${bCol}">${b}</span>
      </div>
      ${m.n?`<span style="font-size:10px;color:var(--gray-l);white-space:nowrap">${m.n}</span>`:''}
    </div>`;
  });
  h+=`</div></div>`;
  if(mapArr.length){
    const total=mapArr.reduce((s,[,v])=>s+v.total,0);
    h+=`<div style="margin-bottom:20px;border-radius:12px;overflow:hidden;border:1px solid var(--border)">
      <div style="padding:10px 16px;background:linear-gradient(135deg,#7c3aed,#6d28d9);color:#fff;font-weight:900;font-size:13px">📍 맵 사용 통계 (총 ${total}게임)</div>
      <div style="padding:12px 16px;display:flex;flex-direction:column;gap:8px">`;
    mapArr.slice(0,15).forEach(([map,s])=>{
      const pct=total?Math.round(s.total/total*100):0;
      h+=`<div style="display:flex;align-items:center;gap:10px">
        <span style="font-size:12px;font-weight:600;min-width:140px;color:var(--text)">📍 ${map}</span>
        <div style="flex:1;height:8px;background:var(--border);border-radius:4px"><div style="height:100%;width:${pct}%;background:#7c3aed;border-radius:4px"></div></div>
        <span style="font-size:11px;font-weight:700;min-width:50px;text-align:right">${s.total}회 (${pct}%)</span>
      </div>`;
    });
    h+=`</div></div>`;
  }
  return h;
}

function proRankHTML(){
  const pStats={};
  const _proSplit=(v)=>String(v||'').split(/[,+，]/).map(x=>x.trim()).filter(Boolean);
  const _proSides=(g)=>{
    if(!g.winner) return null;
    const aList=Array.isArray(g.teamA)?g.teamA:(g.a1||g.a2?[g.a1,g.a2].filter(Boolean):_proSplit(g.playerA));
    const bList=Array.isArray(g.teamB)?g.teamB:(g.b1||g.b2?[g.b1,g.b2].filter(Boolean):_proSplit(g.playerB));
    if(!aList.length||!bList.length) return null;
    return g.winner==='A' ? {w:aList,l:bList} : {w:bList,l:aList};
  };
  proM.forEach(m=>{
    (m.sets||[]).forEach(set=>{
      (set.games||[]).forEach(g=>{
        const sides=_proSides(g);
        if(!sides) return;
        sides.w.forEach(wName=>{
          if(!pStats[wName])pStats[wName]={w:0,l:0};
          pStats[wName].w++;
        });
        sides.l.forEach(lName=>{
          if(!pStats[lName])pStats[lName]={w:0,l:0};
          pStats[lName].l++;
        });
      });
    });
  });
  if(!window._rankSort)window._rankSort={};
  const sk=window._rankSort['pro']||'w';
  const sorted=Object.entries(pStats)
    .map(([name,s])=>({name,w:s.w,l:s.l,total:s.w+s.l,rate:s.w+s.l===0?0:Math.round(s.w/(s.w+s.l)*100)}))
    .filter(p=>p.total>0)
    .sort((a,b)=>sk==='w'?b.w-a.w||b.rate-a.rate:sk==='l'?b.l-a.l||a.rate-b.rate:b.rate-a.rate||b.w-a.w);
  if(!window._rankPage)window._rankPage={};
  const _PK='pro';
  const _PAGE=20;
  if(window._rankPage[_PK]===undefined)window._rankPage[_PK]=0;
  const _tot=sorted.length;
  const _totP=Math.ceil(_tot/_PAGE)||1;
  if(window._rankPage[_PK]>=_totP)window._rankPage[_PK]=0;
  const _cp=window._rankPage[_PK];
  const _paged=_tot>_PAGE?sorted.slice(_cp*_PAGE,(_cp+1)*_PAGE):sorted;
  let h=`<div style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:15px;color:var(--blue);margin-bottom:10px;padding-bottom:6px;border-bottom:2px solid var(--blue-ll)">🏅 프로 순위</div>
  <div class="sort-bar no-export" style="display:flex;align-items:center;gap:6px;margin-bottom:10px;flex-wrap:wrap"><button class="sort-btn ${sk==='w'?'on':''}" onclick="window._rankSort['pro']='w';render()">승순</button><button class="sort-btn ${sk==='rate'?'on':''}" onclick="window._rankSort['pro']='rate';render()">승률순</button><button class="sort-btn ${sk==='l'?'on':''}" onclick="window._rankSort['pro']='l';render()">패순</button></div>
  <table><thead><tr><th style="text-align:left">순위</th><th style="text-align:left">선수</th><th style="text-align:left">대학</th><th>티어</th><th>승</th><th>패</th><th>승률</th></tr></thead><tbody>`;
  if(!sorted.length)h+=`<tr><td colspan="7" style="padding:30px;color:var(--gray-l)">기록 없음</td></tr>`;
  _paged.forEach((p,i)=>{
    const pObj=players.find(x=>x.name===p.name)||{};
    const col=gc(pObj.univ);
    const _ri=_cp*_PAGE+i;
    let rnkHTML;
    if(_ri===0)rnkHTML=`<span class="rk1">1등</span>`;
    else if(_ri===1)rnkHTML=`<span class="rk2">2등</span>`;
    else if(_ri===2)rnkHTML=`<span class="rk3">3등</span>`;
    else rnkHTML=`<span style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:13px">${_ri+1}위</span>`;
    h+=`<tr>
      <td style="text-align:left">${rnkHTML}</td>
      <td style="font-weight:700;cursor:pointer;color:var(--blue);text-align:left" onclick="openPlayerModal('${escJS(p.name)}')"><span style="display:inline-flex;align-items:center;gap:6px">${getPlayerPhotoHTML(p.name,'32px')}${p.name}${getStatusIconHTML(p.name)}</span></td>
      <td style="text-align:left"><span class="ubadge clickable-univ" style="background:${col}" onclick="openUnivModal('${escJS(pObj.univ||'')}')">${pObj.univ||'-'}</span></td>
      <td style="text-align:center">${pObj.tier?getTierBadge(pObj.tier):'-'}</td>
      <td class="wt" style="font-size:15px;font-weight:800">${p.w}</td>
      <td class="lt" style="font-size:15px;font-weight:800">${p.l}</td>
      <td class="${p.rate>=50?'wt':'lt'}" style="font-weight:800">${p.rate}%</td>
    </tr>`;
  });
  const _pageNav=_tot>_PAGE?`<div style="display:flex;justify-content:center;align-items:center;gap:10px;margin-top:12px;flex-wrap:wrap">
  <button class="btn btn-sm" ${_cp===0?'disabled':''} onclick="if(!window._rankPage)window._rankPage={};window._rankPage['${_PK}']=${_cp-1};render()">← 이전</button>
  <span style="font-size:12px;color:var(--gray-l)">${_cp+1} / ${_totP} (${_tot}명)</span>
  <button class="btn btn-sm" ${_cp>=_totP-1?'disabled':''} onclick="if(!window._rankPage)window._rankPage={};window._rankPage['${_PK}']=${_cp+1};render()">다음 →</button>
</div>`:'';
  return h+`</tbody></table>`+_pageNav;
}
