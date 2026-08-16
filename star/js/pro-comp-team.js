/* ══════════════════════════════════════════════════════════════
   프로리그 - 팀전 CRUD (pro-comp-core.js 에서 분리, 2026-07-30)
   ══════════════════════════════════════════════════════════════ */

function proCompTeamSection(tn) {
  if (!tn) return `<div style="padding:30px;text-align:center;color:var(--gray-l)">대회를 선택하세요.</div>`;
  const tms = tn.teamMatches||[];
  let h = `<div style="font-weight:900;font-size:var(--fs-md);color:var(--blue);margin-bottom:12px">🏆 ${tn.name} 팀전</div>`;
  if(typeof pcAltViewModeBarHTML==='function'){
    h += `<div class="no-export" style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-bottom:10px">${pcAltViewModeBarHTML('pcteam')}</div>`;
  }
  if (isLoggedIn) {
    h += `<div class="no-export" style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px">
      <button class="btn btn-b btn-sm" onclick="proCompCreateTeamMatch('${tn.id}')">+ 경기 추가</button>
      <button class="btn btn-w btn-sm" onclick="proCompOpenTeamPasteModal('${tn.id}',null)">📋 일괄 입력</button>
    </div>`;
  }
  // (신규기능) 미니 기본/그리드/컴팩트 테이블형 보기모드
  if((typeof pcAltViewMode==='function') && pcAltViewMode('pcteam')!=='basic'){
    return h + pcAltRecordsHTML('pcteam', tn);
  }
  if (!tms.length) {
    h += `<div class="empty-state"><div class="empty-state-icon">👥</div><div class="empty-state-title">팀전 기록이 없습니다</div><div class="empty-state-desc">팀을 구성하고 경기 결과를 기록할 수 있습니다</div></div>`;
    return h;
  }
  tms.forEach((tm, tmi) => {
    const aWin = tm.sa > tm.sb, bWin = tm.sb > tm.sa;
    const games = tm.games||[];
    const colA='#2563eb', colB='#dc2626';
    const _teamDetailPayload = encodeURIComponent(JSON.stringify({
      title:'프로리그 대회 팀전',
      subtitle:`${tn.name||''} · ${tm.teamAName||'A팀'} vs ${tm.teamBName||'B팀'}`,
      p1:tm.teamAName||'A팀', p2:tm.teamBName||'B팀',
      p1Score:tm.sa||0, p2Score:tm.sb||0,
      winner:aWin?(tm.teamAName||'A팀'):(bWin?(tm.teamBName||'B팀'):''),
      date:tm.d||'', games:games.filter(g=>g.wName&&g.lName)
    }));
    const _teamActions = `${games.length?`<button class="btn btn-p btn-xs" onclick="_openProCompTeamShareCard('${tn.id}',${tmi})">🎴 공유</button>`:''}${isLoggedIn?`<button class="btn btn-b btn-xs" onclick="proCompAddTeamGame('${tn.id}',${tmi})">+ 경기</button>
            <button class="btn btn-w btn-xs" onclick="proCompOpenTeamPasteModal('${tn.id}',${tmi})">📋</button>
            <button class="btn btn-w btn-xs" onclick="proCompEditTeamMatch('${tn.id}',${tmi})">✏️</button>
            <button class="btn btn-r btn-xs" onclick="proCompDeleteTeamMatch('${tn.id}',${tmi})">🗑️</button>`:''}`;
    h += _proCompH2HCardHTML({
      p1:tm.teamAName||'A팀', p2:tm.teamBName||'B팀', p1Col:colA, p2Col:colB,
      p1Score:tm.sa||0, p2Score:tm.sb||0,
      winner:aWin?(tm.teamAName||'A팀'):(bWin?(tm.teamBName||'B팀'):''),
      date:tm.d||'', games:games.filter(g=>g.wName&&g.lName),
      badges:[
        `<span style="font-size:var(--fs-caption);color:var(--gray-l)">${tm.d?tm.d.slice(2).replace(/-/g,'/'):'미정'}</span>`,
        `<span style="font-size:10px;font-weight:700;padding:2px 8px;border-radius:99px;background:#e0f2fe;color:#0284c7">팀전</span>`,
        `<span style="font-size:var(--fs-caption);color:var(--gray-l)">${games.length}경기</span>`,
        `<span style="font-size:var(--fs-caption);color:${colA};font-weight:800">${(tm.teamA||[]).length}명</span>`,
        `<span style="font-size:var(--fs-caption);color:${colB};font-weight:800">${(tm.teamB||[]).length}명</span>`
      ],
      detailOnClick:`window.openProCompRecordDetailPopup('${_teamDetailPayload}')`,
      actionHtml:_teamActions
    });
    h += `<div style="margin:-6px 0 14px;border:1px solid var(--border);border-top:none;border-radius:0 0 12px 12px;padding:12px 14px;background:var(--white)">
      <div style="display:flex;gap:10px;flex-wrap:wrap">
        <div style="flex:1;min-width:220px;background:${colA}08;border:1px solid ${colA}22;border-radius:var(--r);padding:10px 12px">
          <div style="font-size:var(--fs-caption);font-weight:900;color:${colA};margin-bottom:6px">${tm.teamAName||'A팀'}</div>
          <div style="font-size:var(--fs-caption);color:var(--text3);line-height:1.6">${(tm.teamA||[]).map(p=>`<span onclick="openPlayerModal('${escJS(p)}')" style="cursor:pointer;text-decoration:underline dotted">${p}</span>`).join(', ')||'미정'}</div>
        </div>
        <div style="flex:1;min-width:220px;background:${colB}08;border:1px solid ${colB}22;border-radius:var(--r);padding:10px 12px">
          <div style="font-size:var(--fs-caption);font-weight:900;color:${colB};margin-bottom:6px">${tm.teamBName||'B팀'}</div>
          <div style="font-size:var(--fs-caption);color:var(--text3);line-height:1.6">${(tm.teamB||[]).map(p=>`<span onclick="openPlayerModal('${escJS(p)}')" style="cursor:pointer;text-decoration:underline dotted">${p}</span>`).join(', ')||'미정'}</div>
        </div>
      </div>
      ${games.length?`<div style="border-top:1px solid var(--border);padding-top:10px;margin-top:10px">
        ${games.map((g, gi) => {
          const sideWin=g._sideW==='A'?tm.teamAName||'A팀':tm.teamBName||'B팀';
          const pw=players.find(p=>p.name===g.wName), pl=players.find(p=>p.name===g.lName);
          const winCol = g._sideW==='A' ? colA : colB;
          const loseCol = g._sideW==='A' ? colB : colA;
          const _detailPayload = encodeURIComponent(JSON.stringify({
            title:'프로리그 대회 팀전 세트',
            subtitle:`${tn.name||''} · ${sideWin}`,
            p1:g.wName, p2:g.lName, p1Score:1, p2Score:0, winner:g.wName, date:tm.d||'', games:[g]
          }));
          return _proCompH2HCardHTML({
            p1:g.wName, p2:g.lName, p1Col:winCol, p2Col:loseCol,
            p1Score:1, p2Score:0, winner:g.wName, date:tm.d||'', games:[g],
            badges:[
              `<span style="font-size:var(--fs-caption);color:var(--gray-l)">${tm.d?tm.d.slice(2).replace(/-/g,'/'):'미정'}</span>`,
              `<span style="font-size:10px;font-weight:700;padding:2px 8px;border-radius:99px;background:${winCol};color:#fff">${sideWin}</span>`,
              `<span style="font-size:10px;font-weight:700;padding:2px 8px;border-radius:99px;background:#e0f2fe;color:#0284c7">팀전</span>`,
              g.map?`<span style="font-size:var(--fs-caption);color:var(--gray-l)">🗺️ ${g.map}</span>`:'',
              pw&&pw.univ?`<span style="font-size:var(--fs-caption);color:${winCol};font-weight:800">${pw.univ}</span>`:'',
              pl&&pl.univ?`<span style="font-size:var(--fs-caption);color:${loseCol};font-weight:800">${pl.univ}</span>`:''
            ],
            detailOnClick:`window.openProCompRecordDetailPopup('${_detailPayload}')`,
            actionHtml:isLoggedIn?`<button class="btn btn-r btn-xs" onclick="proCompDeleteTeamGame('${tn.id}',${tmi},${gi})">삭제</button>`:''
          });
        }).join('')}
      </div>`:''}
    </div>`;
  });
  return h;
}

function proCompCreateTeamMatch(tnId) {
  const tn = _findTourneyById(tnId);
  if (!tn) return;
  // 조편성 선수 우선 + 전체 players 포함
  const grpPlayers = [...new Set((tn.groups||[]).flatMap(g=>g.players||[]))];
  const allPNames = players.map(p=>p.name);
  const allPlayerList = [...grpPlayers, ...allPNames.filter(n=>!grpPlayers.includes(n))];
  const modal = document.createElement('div');
  modal.id = '_tmModal';
  modal.style.cssText = 'position:fixed;inset:0;background:#0008;z-index:9999;display:flex;align-items:flex-start;justify-content:center;overflow-y:auto;padding:20px;box-sizing:border-box';
  modal.innerHTML = `<div style="background:var(--white);border-radius:var(--r2);padding:24px;width:460px;max-width:100%;box-shadow:0 8px 40px rgba(0,0,0,.3);margin:auto">
    <div style="font-weight:900;font-size:var(--fs-md);margin-bottom:16px">팀전 경기 추가</div>
    <div style="display:flex;gap:10px;margin-bottom:12px">
      <div style="flex:1">
        <label style="font-size:var(--fs-sm);font-weight:700;color:var(--text3)">날짜</label>
        <input id="_tm_d" type="date" value="${new Date().toISOString().slice(0,10)}" style="width:100%;padding:7px;border-radius:8px;border:1px solid var(--border);margin-top:4px;box-sizing:border-box">
      </div>
    </div>
    <div style="display:flex;gap:10px;margin-bottom:12px">
      <div style="flex:1">
        <label style="font-size:var(--fs-sm);font-weight:700;color:#2563eb">A팀 이름</label>
        <input id="_tm_an" value="A팀" style="width:100%;padding:7px;border-radius:8px;border:1px solid var(--border);margin-top:4px;box-sizing:border-box">
      </div>
      <div style="flex:1">
        <label style="font-size:var(--fs-sm);font-weight:700;color:#dc2626">B팀 이름</label>
        <input id="_tm_bn" value="B팀" style="width:100%;padding:7px;border-radius:8px;border:1px solid var(--border);margin-top:4px;box-sizing:border-box">
      </div>
    </div>
    <div style="font-size:var(--fs-sm);font-weight:700;color:var(--text3);margin-bottom:6px">팀원 구성 (클릭 시 A팀 -> B팀 -> 삭제)</div>
    <div style="display:flex;gap:8px;margin-bottom:8px">
      <div style="flex:1;background:#2563eb11;border:1.5px solid #2563eb44;border-radius:8px;padding:8px;min-height:50px">
        <div style="font-size:var(--fs-caption);font-weight:700;color:#2563eb;margin-bottom:4px">A팀</div>
        <div id="_tm_draftA" style="display:flex;flex-wrap:wrap;gap:4px"></div>
      </div>
      <div style="flex:1;background:#dc262611;border:1.5px solid #dc262644;border-radius:8px;padding:8px;min-height:50px">
        <div style="font-size:var(--fs-caption);font-weight:700;color:#dc2626;margin-bottom:4px">B팀</div>
        <div id="_tm_draftB" style="display:flex;flex-wrap:wrap;gap:4px"></div>
      </div>
    </div>
    <div style="margin-bottom:6px">
      <input id="_tm_search" placeholder="팀원 스트리머 검색.." oninput="_tmFilterPool()" style="width:100%;padding:7px 10px;border-radius:8px;border:1px solid var(--border);font-size:var(--fs-sm);box-sizing:border-box">
    </div>
    <div id="_tm_pool" style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:14px;padding:8px;background:var(--surface);border-radius:8px;max-height:160px;overflow-y:auto">
      ${allPlayerList.map(p=>`<button class="_tm_pBtn" data-name="${p}" data-side="none" onclick="_tmCyclePlayer(this,'${p.replace(/'/g,"\\'")}') " style="padding:3px 10px;border-radius:12px;border:1.5px solid var(--border);background:var(--white);font-size:var(--fs-sm);cursor:pointer">${p}</button>`).join('')}
    </div>
    <div style="display:flex;gap:8px">
      <button class="btn btn-b" style="flex:1" onclick="_tmSaveCreate('${tnId}')">생성</button>
      <button class="btn btn-w" style="flex:1" onclick="document.getElementById('_tmModal').remove()">취소</button>
    </div>
  </div>`;
  document.body.appendChild(modal);
}

function _tmFilterPool() {
  const q = (document.getElementById('_tm_search')||{}).value||'';
  const pool = document.getElementById('_tm_pool');
  if (!pool) return;
  pool.querySelectorAll('._tm_pBtn').forEach(btn => {
    btn.style.display = q===''||btn.getAttribute('data-name').includes(q) ? '' : 'none';
  });
}

function _tmCyclePlayer(btn, name) {
  const side = btn.getAttribute('data-side')||'none';
  const draftA = document.getElementById('_tm_draftA');
  const draftB = document.getElementById('_tm_draftB');
  document.querySelectorAll(`._tm_draftTag[data-name="${name}"]`).forEach(el=>el.remove());
  let nextSide;
  if (side==='none') nextSide='A';
  else if (side==='A') nextSide='B';
  else nextSide='none';
  btn.setAttribute('data-side', nextSide);
  if (nextSide==='A') {
    btn.style.cssText='padding:3px 10px;border-radius:12px;border:1.5px solid #2563eb;background:#2563eb;color:#fff;font-size:var(--fs-sm);cursor:pointer;font-weight:700';
    const tag=document.createElement('span');
    tag.className='_tm_draftTag'; tag.setAttribute('data-name',name);
    tag.style.cssText='padding:2px 8px;background:#2563eb;color:#fff;border-radius:var(--r);font-size:var(--fs-caption);font-weight:600';
    tag.textContent=name; draftA.appendChild(tag);
  } else if (nextSide==='B') {
    btn.style.cssText='padding:3px 10px;border-radius:12px;border:1.5px solid #dc2626;background:#dc2626;color:#fff;font-size:var(--fs-sm);cursor:pointer;font-weight:700';
    const tag=document.createElement('span');
    tag.className='_tm_draftTag'; tag.setAttribute('data-name',name);
    tag.style.cssText='padding:2px 8px;background:#dc2626;color:#fff;border-radius:var(--r);font-size:var(--fs-caption);font-weight:600';
    tag.textContent=name; draftB.appendChild(tag);
  } else {
    btn.style.cssText='padding:3px 10px;border-radius:12px;border:1.5px solid var(--border);background:var(--white);font-size:var(--fs-sm);cursor:pointer';
  }
}

function _tmSaveCreate(tnId) {
  const tn = _findTourneyById(tnId);
  if (!tn) return;
  const d = document.getElementById('_tm_d').value;
  const teamAName = document.getElementById('_tm_an').value.trim()||'A팀';
  const teamBName = document.getElementById('_tm_bn').value.trim()||'B팀';
  const teamA=[...document.querySelectorAll('#_tm_draftA ._tm_draftTag')].map(el=>el.getAttribute('data-name'));
  const teamB=[...document.querySelectorAll('#_tm_draftB ._tm_draftTag')].map(el=>el.getAttribute('data-name'));
  if (!tn.teamMatches) tn.teamMatches=[];
  tn.teamMatches.push({_id:'ptm_'+Date.now().toString(36)+Math.random().toString(36).slice(2,4), d, teamAName, teamBName, teamA, teamB, games:[], sa:0, sb:0});
  document.getElementById('_tmModal').remove();
  save(); render();
}

function proCompAddTeamGame(tnId, tmi) {
  const tn = _findTourneyById(tnId);
  if (!tn||(tn.teamMatches||[])[tmi]==null) return;
  const tm = tn.teamMatches[tmi];
  const teamA = tm.teamA&&tm.teamA.length ? tm.teamA : [];
  const teamB = tm.teamB&&tm.teamB.length ? tm.teamB : [];
  const colA='#2563eb', colB='#dc2626';
  const _memberBtns = (list, side, inputId) => list.map(p=>`<button type="button" onclick="_tmPickPlayer('${p.replace(/'/g,"\\'")}','${inputId}')" style="padding:2px 8px;border-radius:var(--r);border:1.5px solid ${side==='A'?colA:colB};background:${side==='A'?colA+'15':colB+'15'};color:${side==='A'?colA:colB};font-size:var(--fs-caption);cursor:pointer;font-weight:600">${p}</button>`).join('');
  const modal = document.createElement('div');
  modal.id = '_tmGameModal';
  modal.style.cssText = 'position:fixed;inset:0;background:#0008;z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px;box-sizing:border-box';
  modal.innerHTML = `<div style="background:var(--white);border-radius:var(--r2);padding:24px;width:380px;max-width:100%;max-height:90vh;overflow-y:auto;box-shadow:0 8px 40px rgba(0,0,0,.3)">
    <div style="font-weight:900;font-size:var(--fs-md);margin-bottom:14px">📝 경기 추가</div>
    <div style="margin-bottom:12px">
      <label style="font-size:var(--fs-sm);font-weight:700;color:${colA}">${tm.teamAName||'A팀'} 선수</label>
      ${teamA.length?`<div style="display:flex;flex-wrap:wrap;gap:4px;margin:5px 0">${_memberBtns(teamA,'A','_tg_a')}</div>`:''}
      <input id="_tg_a" placeholder="검색하거나 직접 입력" list="_tg_allPlayers" style="width:100%;padding:7px;border-radius:8px;border:1px solid var(--border);margin-top:4px;font-size:var(--fs-sm);box-sizing:border-box">
    </div>
    <div style="margin-bottom:12px">
      <label style="font-size:var(--fs-sm);font-weight:700;color:${colB}">${tm.teamBName||'B팀'} 선수</label>
      ${teamB.length?`<div style="display:flex;flex-wrap:wrap;gap:4px;margin:5px 0">${_memberBtns(teamB,'B','_tg_b')}</div>`:''}
      <input id="_tg_b" placeholder="검색하거나 직접 입력" list="_tg_allPlayers" style="width:100%;padding:7px;border-radius:8px;border:1px solid var(--border);margin-top:4px;font-size:var(--fs-sm);box-sizing:border-box">
    </div>
    <datalist id="_tg_allPlayers">${players.map(p=>`<option value="${p.name}">`).join('')}</datalist>
    <div style="margin-bottom:10px">
      <label style="font-size:var(--fs-sm);font-weight:700;color:var(--text3)">승자</label>
      <div style="display:flex;gap:8px;margin-top:6px">
        <button id="_tg_wA" class="btn btn-w" style="flex:1" onclick="document.getElementById('_tg_wA').className='btn btn-b';document.getElementById('_tg_wB').className='btn btn-w'">${tm.teamAName||'A팀'} 승</button>
        <button id="_tg_wB" class="btn btn-w" style="flex:1" onclick="document.getElementById('_tg_wB').className='btn btn-b';document.getElementById('_tg_wA').className='btn btn-w'">${tm.teamBName||'B팀'} 승</button>
      </div>
    </div>
    <div style="margin-bottom:16px">
      <label style="font-size:var(--fs-sm);font-weight:700;color:var(--text3)">맵(선택)</label>
      <input id="_tg_map" placeholder="선택입력" style="width:100%;padding:7px;border-radius:8px;border:1px solid var(--border);margin-top:4px;font-size:var(--fs-sm);box-sizing:border-box">
    </div>
    <div style="display:flex;gap:8px">
      <button class="btn btn-b" style="flex:1" onclick="_tmSaveGame('${tnId}',${tmi})">추가</button>
      <button class="btn btn-w" style="flex:1" onclick="document.getElementById('_tmGameModal').remove()">취소</button>
    </div>
  </div>`;
  document.body.appendChild(modal);
}

function _tmPickPlayer(name, inputId) {
  const el = document.getElementById(inputId);
  if (el) el.value = name;
}

function _tmSaveGame(tnId, tmi) {
  const tn = _findTourneyById(tnId);
  if (!tn||(tn.teamMatches||[])[tmi]==null) return;
  const tm = tn.teamMatches[tmi];
  const aName = document.getElementById('_tg_a').value;
  const bName = document.getElementById('_tg_b').value;
  const wA = document.getElementById('_tg_wA').className.includes('btn-b');
  const wB = document.getElementById('_tg_wB').className.includes('btn-b');
  const map = document.getElementById('_tg_map').value.trim();
  if (!aName||!bName) { alert('선수를 선택하세요'); return; }
  if (!wA&&!wB) { alert('승자를 선택하세요'); return; }
  const wName = wA?aName:bName, lName = wA?bName:aName;
  const gid = 'ptg_'+Date.now().toString(36)+Math.random().toString(36).slice(2,4);
  if (!tm.games) tm.games=[];
  tm.games.push({_id:gid, wName, lName, map, _sideW:wA?'A':'B'});
  tm.sa=(tm.games).filter(g=>g._sideW==='A').length;
  tm.sb=(tm.games).filter(g=>g._sideW==='B').length;
  applyGameResult(wName, lName, tm.d||'', map, gid, '', '', '프로리그대회');
  document.getElementById('_tmGameModal').remove();
  save(); render();
}

function proCompDeleteTeamGame(tnId, tmi, gi) {
  const tn = _findTourneyById(tnId);
  if (!tn||(tn.teamMatches||[])[tmi]==null) return;
  const tm = tn.teamMatches[tmi];
  const g = (tm.games||[])[gi];
  if (!g) return;
  _revertProMatch(g._id);
  tm.games.splice(gi,1);
  tm.sa=(tm.games).filter(g=>g._sideW==='A').length;
  tm.sb=(tm.games).filter(g=>g._sideW==='B').length;
  save(); render();
}

function proCompEditTeamMatch(tnId, tmi) {
  const tn = _findTourneyById(tnId);
  if (!tn||(tn.teamMatches||[])[tmi]==null) return;
  const tm = tn.teamMatches[tmi];
  const pList = players.filter(p=>p.name).sort((a,b)=>(a.name||'').localeCompare(b.name||''));
  const pOpts = () => pList.map(p=>`<option value="${p.name}">${p.name}${p.univ?` (${p.univ})`:''}</option>`).join('');
  const renderMembers = (side) => {
    const members = tm[side]||[];
    return members.map((p,pi)=>`<span style="display:inline-flex;align-items:center;gap:3px;padding:3px 8px;background:var(--surface);border-radius:14px;font-size:var(--fs-caption);font-weight:600;border:1px solid var(--border)">${p}<button onclick="_tmRemoveMember('${tnId}',${tmi},'${side}',${pi})" style="background:none;border:none;cursor:pointer;color:var(--gray-l);font-size:var(--fs-caption);padding:0;line-height:1">✕</button></span>`).join('');
  };
  const modal = document.createElement('div');
  modal.id = '_tmEditModal';
  modal.style.cssText = 'position:fixed;inset:0;background:#0008;z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px;box-sizing:border-box';
  modal.innerHTML = `<div style="background:var(--white);border-radius:var(--r2);padding:24px;width:420px;max-width:100%;max-height:90vh;overflow-y:auto;box-shadow:0 8px 40px rgba(0,0,0,.3)">
    <div style="font-weight:900;font-size:var(--fs-md);margin-bottom:14px">📝 팀전 수정</div>
    <div style="margin-bottom:12px">
      <label style="font-size:var(--fs-sm);font-weight:700;color:var(--text3)">날짜</label>
      <input id="_tme_d" type="date" value="${tm.d||''}" style="width:100%;padding:7px;border-radius:8px;border:1px solid var(--border);margin-top:4px;box-sizing:border-box">
    </div>
    <div style="display:flex;gap:8px;margin-bottom:14px">
      <div style="flex:1">
        <label style="font-size:var(--fs-sm);font-weight:700;color:#2563eb">A팀 이름</label>
        <input id="_tme_an" value="${tm.teamAName||'A팀'}" style="width:100%;padding:7px;border-radius:8px;border:1px solid var(--border);margin-top:4px;box-sizing:border-box">
      </div>
      <div style="flex:1">
        <label style="font-size:var(--fs-sm);font-weight:700;color:#dc2626">B팀 이름</label>
        <input id="_tme_bn" value="${tm.teamBName||'B팀'}" style="width:100%;padding:7px;border-radius:8px;border:1px solid var(--border);margin-top:4px;box-sizing:border-box">
      </div>
    </div>
    <div style="display:flex;gap:8px;margin-bottom:6px">
      <div style="flex:1;border:1px solid #2563eb44;border-radius:var(--r);padding:10px">
        <div style="font-size:var(--fs-caption);font-weight:700;color:#2563eb;margin-bottom:6px">A팀 멤버</div>
        <div id="_tme_aMembers" style="display:flex;flex-wrap:wrap;gap:4px;min-height:24px;margin-bottom:8px">${renderMembers('teamA')}</div>
        <div style="display:flex;gap:4px">
          <select id="_tme_aSel" style="flex:1;padding:5px;border-radius:6px;border:1px solid var(--border);font-size:var(--fs-caption)"><option value="">선수 선택</option>${pOpts()}</select>
          <button class="btn btn-b btn-xs" onclick="_tmAddMember('${tnId}',${tmi},'teamA')">+</button>
        </div>
      </div>
      <div style="flex:1;border:1px solid #dc262644;border-radius:var(--r);padding:10px">
        <div style="font-size:var(--fs-caption);font-weight:700;color:#dc2626;margin-bottom:6px">B팀 멤버</div>
        <div id="_tme_bMembers" style="display:flex;flex-wrap:wrap;gap:4px;min-height:24px;margin-bottom:8px">${renderMembers('teamB')}</div>
        <div style="display:flex;gap:4px">
          <select id="_tme_bSel" style="flex:1;padding:5px;border-radius:6px;border:1px solid var(--border);font-size:var(--fs-caption)"><option value="">선수 선택</option>${pOpts()}</select>
          <button class="btn btn-r btn-xs" onclick="_tmAddMember('${tnId}',${tmi},'teamB')">+</button>
        </div>
      </div>
    </div>
    <div style="display:flex;gap:8px;margin-top:14px">
      <button class="btn btn-b" style="flex:1" onclick="_tmSaveEdit('${tnId}',${tmi})">수정</button>
      <button class="btn btn-w" style="flex:1" onclick="document.getElementById('_tmEditModal').remove()">취소</button>
    </div>
  </div>`;
  document.body.appendChild(modal);
}

function _tmAddMember(tnId, tmi, side) {
  const tn = _findTourneyById(tnId);
  if (!tn||(tn.teamMatches||[])[tmi]==null) return;
  const tm = tn.teamMatches[tmi];
  const selId = side==='teamA' ? '_tme_aSel' : '_tme_bSel';
  const name = (document.getElementById(selId)||{}).value||'';
  if (!name) return;
  if (!tm[side]) tm[side]=[];
  if (tm[side].includes(name)) return;
  tm[side].push(name);
  // 멤버 영역 갱신
  const containerId = side==='teamA' ? '_tme_aMembers' : '_tme_bMembers';
  const cont = document.getElementById(containerId);
  if (cont) cont.innerHTML = (tm[side]||[]).map((p,pi)=>`<span style="display:inline-flex;align-items:center;gap:3px;padding:3px 8px;background:var(--surface);border-radius:14px;font-size:var(--fs-caption);font-weight:600;border:1px solid var(--border)">${p}<button onclick="_tmRemoveMember('${tnId}',${tmi},'${side}',${pi})" style="background:none;border:none;cursor:pointer;color:var(--gray-l);font-size:var(--fs-caption);padding:0;line-height:1">✕</button></span>`).join('');
}

function _tmRemoveMember(tnId, tmi, side, pi) {
  const tn = _findTourneyById(tnId);
  if (!tn||(tn.teamMatches||[])[tmi]==null) return;
  const tm = tn.teamMatches[tmi];
  if (!tm[side]) return;
  tm[side].splice(pi,1);
  const containerId = side==='teamA' ? '_tme_aMembers' : '_tme_bMembers';
  const cont = document.getElementById(containerId);
  if (cont) cont.innerHTML = (tm[side]||[]).map((p,pi2)=>`<span style="display:inline-flex;align-items:center;gap:3px;padding:3px 8px;background:var(--surface);border-radius:14px;font-size:var(--fs-caption);font-weight:600;border:1px solid var(--border)">${p}<button onclick="_tmRemoveMember('${tnId}',${tmi},'${side}',${pi2})" style="background:none;border:none;cursor:pointer;color:var(--gray-l);font-size:var(--fs-caption);padding:0;line-height:1">✕</button></span>`).join('');
}

function _tmSaveEdit(tnId, tmi) {
  const tn = _findTourneyById(tnId);
  if (!tn||(tn.teamMatches||[])[tmi]==null) return;
  const tm = tn.teamMatches[tmi];
  tm.d = document.getElementById('_tme_d').value;
  tm.teamAName = document.getElementById('_tme_an').value.trim()||'A팀';
  tm.teamBName = document.getElementById('_tme_bn').value.trim()||'B팀';
  document.getElementById('_tmEditModal').remove();
  save(); render();
}

function proCompDeleteTeamMatch(tnId, tmi) {
  if (!confirm('팀전 경기를 삭제하시겠습니까? 경기 전적이 취소됩니다.')) return;
  const tn = _findTourneyById(tnId);
  if (!tn||!tn.teamMatches) return;
  const tm = tn.teamMatches[tmi];
  if (tm) (tm.games||[]).forEach(g=>_revertProMatch(g._id));
  tn.teamMatches.splice(tmi,1);
  save(); render();
}

/* ══════════════════════════════════════════════════════════════
   팀전 일괄 입력 (붙여넣기)
   ══════════════════════════════════════════════════════════════ */
function proCompOpenTeamPasteModal(tnId, tmi) {
  const tn = _findTourneyById(tnId);
  if (!tn) return;
  const tms = tn.teamMatches||[];
  // tmi=null이면 팀전 선택/생성 팝업으로 먼저
  if (tmi==null || !tms[tmi]) {
    _proCompTeamSelectThenPaste(tnId);
    return;
  }
  const tm = tms[tmi];
  if (typeof openPasteModal !== 'function') return;
  // 공통 pasteModal 활성화
  _grpPasteState = {mode:'procomp-team', tnId, tmi};
  openPasteModal();
  window._grpPasteMode = true;
  window._pasteForceTeamA = tm.teamAName||'A팀';
  window._pasteForceTeamB = tm.teamBName||'B팀';
  // 팀 멤버 로스터를 미리 등록해 자동 팀 배정 지원
  if ((tm.teamA||[]).length) window._pasteRosterA = {teamName:tm.teamAName||'A팀', members:tm.teamA};
  if ((tm.teamB||[]).length) window._pasteRosterB = {teamName:tm.teamBName||'B팀', members:tm.teamB};
  const sel = document.getElementById('paste-mode');
  const lbl = document.getElementById('paste-mode-label');
  if (sel) { sel.value = 'mini'; sel.style.display = 'none'; if(typeof onPasteModeChange==='function') onPasteModeChange('mini'); }
  if (lbl) lbl.style.display = 'none';
  const hint = document.getElementById('paste-mode-hint');
  if (hint) hint.innerHTML = `<span style="color:#16a34a;font-weight:700">팀전 결과 <span style="color:#2563eb">${tm.teamAName||'A팀'}</span> vs <span style="color:#dc2626">${tm.teamBName||'B팀'}</span></span>`;
  const title = document.querySelector('#pasteModal .mtitle');
  if (title) title.textContent = '팀전 결과 일괄 입력';
  const compWrap = document.getElementById('paste-comp-wrap');
  if (compWrap) compWrap.style.display = 'none';
  const dateEl = document.getElementById('paste-date');
  if (dateEl && tm.d) dateEl.value = tm.d;
}

function _proCompTeamSelectThenPaste(tnId) {
  const tn = _findTourneyById(tnId);
  if (!tn) return;
  const tms = tn.teamMatches||[];
  const modal = document.createElement('div');
  modal.id = '_tmSelectModal';
  modal.className = 'modal-compact-overlay';
  modal.innerHTML = `<div class="modal-compact-box" style="width:420px">
    <div style="font-weight:900;font-size:var(--fs-md);margin-bottom:10px">팀전 경기 선택</div>
    <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:4px">
      <label style="font-size:var(--fs-sm);font-weight:700;color:var(--text3)">경기 선택</label>
      <span class="btn btn-w btn-xs" style="margin-left:auto">선택 가능 ${tms.length||1}경기</span>
    </div>
    <select id="_tmSel_tmi" onchange="document.getElementById('_tmSel_newFields').style.display=parseInt(this.value)>=0?'none':'flex'" style="width:100%;padding:7px;border-radius:8px;border:1px solid var(--border);margin-top:4px;margin-bottom:10px;box-sizing:border-box">
      <option value="-1">직접 새 경기 구성</option>
      ${tms.map((t,i)=>`<option value="${i}">${t.teamAName||'A팀'} vs ${t.teamBName||'B팀'} (${t.d||'날짜 미정'})</option>`).join('')}
    </select>
    <div id="_tmSel_newFields" style="display:${tms.length?'none':'flex'};gap:8px;margin-bottom:10px">
      <div style="flex:1"><label style="font-size:var(--fs-caption);font-weight:700;color:#2563eb">A팀 명</label><input id="_tmSel_an" value="A팀" style="width:100%;padding:5px 8px;border-radius:6px;border:1px solid var(--border);margin-top:3px;font-size:var(--fs-sm);box-sizing:border-box"></div>
      <div style="flex:1"><label style="font-size:var(--fs-caption);font-weight:700;color:#dc2626">B팀 명</label><input id="_tmSel_bn" value="B팀" style="width:100%;padding:5px 8px;border-radius:6px;border:1px solid var(--border);margin-top:3px;font-size:var(--fs-sm);box-sizing:border-box"></div>
      <div style="flex:1"><label style="font-size:var(--fs-caption);font-weight:700;color:var(--text3)">날짜</label><input id="_tmSel_nd" type="date" value="${new Date().toISOString().slice(0,10)}" style="width:100%;padding:5px 8px;border-radius:6px;border:1px solid var(--border);margin-top:3px;font-size:var(--fs-sm);box-sizing:border-box"></div>
    </div>
    <div style="display:flex;gap:8px">
      <button class="btn btn-b" style="flex:1" onclick="_tmSelectConfirm('${tnId}')">다음 단계 (결과 입력)</button>
      <button class="btn btn-w" style="flex:1" onclick="document.getElementById('_tmSelectModal').remove()">취소</button>
    </div>
  </div>`;
  document.body.appendChild(modal);
  if (tms.length) document.getElementById('_tmSel_tmi').value = '0';
}

function _tmSelectConfirm(tnId) {
  const tn = _findTourneyById(tnId);
  if (!tn) return;
  if (!tn.teamMatches) tn.teamMatches=[];
  const selVal = parseInt(document.getElementById('_tmSel_tmi')?.value);
  let tmi;
  if (selVal>=0 && tn.teamMatches[selVal]) {
    tmi = selVal;
  } else {
    const an=(document.getElementById('_tmSel_an')||{}).value||'A팀';
    const bn=(document.getElementById('_tmSel_bn')||{}).value||'B팀';
    const nd=(document.getElementById('_tmSel_nd')||{}).value||new Date().toISOString().slice(0,10);
    tn.teamMatches.push({_id:'ptm_'+Date.now().toString(36)+Math.random().toString(36).slice(2,4), d:nd, teamAName:an, teamBName:bn, teamA:[], teamB:[], games:[], sa:0, sb:0});
    tmi = tn.teamMatches.length-1;
    save();
  }
  document.getElementById('_tmSelectModal').remove();
  proCompOpenTeamPasteModal(tnId, tmi);
}

// 공통 pasteModal 연동 시 프로리그 팀전 적용 로직
function _proCompTeamPasteApplyLogic(savable) {
  const {tnId, tmi} = _grpPasteState;
  const tn = _findTourneyById(tnId);
  if (!tn) return false;
  const tm = (tn.teamMatches||[])[tmi];
  if (!tm) return false;
  const teamASet = new Set(tm.teamA||[]);
  const teamBSet = new Set(tm.teamB||[]);
  if (!tm.games) tm.games=[];
  let added=0;
  savable.forEach(r => {
    if (!r.wPlayer||!r.lPlayer) return;
    const wName=r.wPlayer.name, lName=r.lPlayer.name;
    let sideW='A';
    if (teamBSet.has(wName)) sideW='B';
    else if (teamASet.has(wName)) sideW='A';
    else if (teamBSet.has(lName)) sideW='A';
    else if (teamASet.has(lName)) sideW='B';
    else sideW = (r.rightName && r.rightName===wName) ? 'B' : 'A';
    const gid='ptg_'+Date.now().toString(36)+Math.random().toString(36).slice(2,4);
    const map=r.map&&r.map!=='-'?r.map:'';
    tm.games.push({_id:gid, wName, lName, map, _sideW:sideW});
    applyGameResult(wName, lName, tm.d||'', map, gid, '', '', '프로리그대회');
    added++;
  });
  tm.sa=(tm.games||[]).filter(g=>g._sideW==='A').length;
  tm.sb=(tm.games||[]).filter(g=>g._sideW==='B').length;
  save(); render();
  if (added>0) setTimeout(()=>alert(`${added}경기가 추가되었습니다.`), 100);
  return true;
}

function proCompSaveTeamPaste(tnId, tmi) {
  const tn = _findTourneyById(tnId);
  if (!tn) return;
  if (!tn.teamMatches) tn.teamMatches=[];
  const text = (document.getElementById('_tp_text')||{}).value||'';
  // tmi=null이면 선택/생성 모드
  if (tmi==null) {
    const sel = document.getElementById('_tp_tmi');
    const selVal = sel ? parseInt(sel.value) : -1;
    if (selVal>=0 && tn.teamMatches[selVal]) {
      tmi = selVal;
    } else {
      const an=(document.getElementById('_tp_an')||{}).value||'A팀';
      const bn=(document.getElementById('_tp_bn')||{}).value||'B팀';
      const nd=(document.getElementById('_tp_nd')||{}).value||new Date().toISOString().slice(0,10);
      tn.teamMatches.push({_id:'ptm_'+Date.now().toString(36)+Math.random().toString(36).slice(2,4), d:nd, teamAName:an, teamBName:bn, teamA:[], teamB:[], games:[], sa:0, sb:0});
      tmi = tn.teamMatches.length-1;
    }
  }
  const tm = tn.teamMatches[tmi];
  if (!tm) return;
  document.getElementById('_tmPasteModal').remove();
  if (!text.trim()) return;
  const teamASet = new Set(tm.teamA||[]);
  const teamBSet = new Set(tm.teamB||[]);
  const lines = text.trim().split('\n').map(l=>l.trim()).filter(Boolean);
  let added=0;
  lines.forEach(line => {
    const parts = line.split(/[\s\t]+/);
    if (parts.length<2) return;
    const wName=parts[0], lName=parts[1], map=parts.slice(2).join(' ');
    if (!wName||!lName||wName===lName) return;
    // _sideW: 팀원 기반 자동 감지, 아니면 A
    let sideW='A';
    if (teamBSet.has(wName)) sideW='B';
    else if (teamASet.has(wName)) sideW='A';
    else if (teamBSet.has(lName)) sideW='A';
    else if (teamASet.has(lName)) sideW='B';
    const gid='ptg_'+Date.now().toString(36)+Math.random().toString(36).slice(2,4);
    if (!tm.games) tm.games=[];
    tm.games.push({_id:gid, wName, lName, map:map.trim(), _sideW:sideW});
    applyGameResult(wName, lName, tm.d||'', map.trim(), gid, '', '', '프로리그대회');
    added++;
  });
  tm.sa=(tm.games||[]).filter(g=>g._sideW==='A').length;
  tm.sb=(tm.games||[]).filter(g=>g._sideW==='B').length;
  save(); render();
  if (added>0) alert(`${added}경기가 추가되었습니다.`);
}

/* 대진표(연계형 토너먼트) */
