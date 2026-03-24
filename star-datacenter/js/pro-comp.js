/* ══════════════════════════════════════
   프로리그 개인 대회
   - proTourneys: [{id,name,groups:[{name,players:[],matches:[{a,b,winner,d,map}]}]}]
   - 조별리그 + 조별순위 + 대진표 + 조편성관리
══════════════════════════════════════ */

/* ── proTourneys 전적 동기화 (기존 데이터 → player.history 반영) ── */
function _proCompSyncSilent() {
  const existing = new Set();
  players.forEach(p => (p.history||[]).forEach(h => { if(h.matchId) existing.add(h.matchId); }));
  let cnt = 0;
  proTourneys.forEach(tn => {
    (tn.groups||[]).forEach(grp => {
      (grp.matches||[]).forEach(m => {
        if (!m.winner || !m.a || !m.b) return;
        if (!m._id) m._id = 'pco_' + Date.now().toString(36) + Math.random().toString(36).slice(2,5);
        if (existing.has(m._id)) return;
        applyGameResult(m.winner==='A'?m.a:m.b, m.winner==='A'?m.b:m.a, m.d||'', m.map||'', m._id, '', '', '프로리그대회');
        existing.add(m._id); cnt++;
      });
    });
    (tn.bracket||[]).forEach((rnd, ri) => {
      rnd.forEach((m, mi) => {
        if (!m.winner || !m.a || !m.b) return;
        const bktId = `pbn_${tn.id}_${ri}_${mi}`;
        if (existing.has(bktId)) return;
        applyGameResult(m.winner==='A'?m.a:m.b, m.winner==='A'?m.b:m.a, m.d||'', m.map||'', bktId, '', '', '프로리그대회');
        existing.add(bktId); cnt++;
      });
    });
    if (tn.thirdPlace && tn.thirdPlace.winner && tn.thirdPlace.a && tn.thirdPlace.b) {
      const thirdId = `pbn_${tn.id}_3rd`;
      if (!existing.has(thirdId)) {
        const tp = tn.thirdPlace;
        applyGameResult(tp.winner==='A'?tp.a:tp.b, tp.winner==='A'?tp.b:tp.a, tp.d||'', tp.map||'', thirdId, '', '', '프로리그대회');
        existing.add(thirdId); cnt++;
      }
    }
    // 팀전 게임
    (tn.teamMatches||[]).forEach(tm => {
      (tm.games||[]).forEach(g => {
        if (!g.wName||!g.lName) return;
        if (!g._id) g._id = 'ptg_'+Date.now().toString(36)+Math.random().toString(36).slice(2,4);
        if (existing.has(g._id)) return;
        applyGameResult(g.wName, g.lName, tm.d||'', g.map||'', g._id, '', '', '프로리그팀전');
        existing.add(g._id); cnt++;
      });
    });
  });
  if (cnt > 0) save();
}

function proCompSyncHistory() {
  // 이미 player.history에 있는 matchId 집합
  const existing = new Set();
  players.forEach(p => (p.history||[]).forEach(h => { if(h.matchId) existing.add(h.matchId); }));
  let cnt = 0;
  proTourneys.forEach(tn => {
    // 조별리그
    (tn.groups||[]).forEach(grp => {
      (grp.matches||[]).forEach(m => {
        if (!m.winner || !m.a || !m.b) return;
        if (!m._id) m._id = 'pco_' + Date.now().toString(36) + Math.random().toString(36).slice(2,5);
        if (existing.has(m._id)) return;
        applyGameResult(m.winner==='A'?m.a:m.b, m.winner==='A'?m.b:m.a, m.d||'', m.map||'', m._id, '', '', '프로리그대회');
        existing.add(m._id);
        cnt++;
      });
    });
    // 대진표
    (tn.bracket||[]).forEach((rnd, ri) => {
      rnd.forEach((m, mi) => {
        if (!m.winner || !m.a || !m.b) return;
        const bktId = `pbn_${tn.id}_${ri}_${mi}`;
        if (existing.has(bktId)) return;
        applyGameResult(m.winner==='A'?m.a:m.b, m.winner==='A'?m.b:m.a, m.d||'', m.map||'', bktId, '', '', '프로리그대회');
        existing.add(bktId);
        cnt++;
      });
    });
    // 3위전
    if (tn.thirdPlace && tn.thirdPlace.winner && tn.thirdPlace.a && tn.thirdPlace.b) {
      const thirdId = `pbn_${tn.id}_3rd`;
      if (!existing.has(thirdId)) {
        const tp = tn.thirdPlace;
        applyGameResult(tp.winner==='A'?tp.a:tp.b, tp.winner==='A'?tp.b:tp.a, tp.d||'', tp.map||'', thirdId, '', '', '프로리그대회');
        existing.add(thirdId);
        cnt++;
      }
    }
    // 팀전 게임
    (tn.teamMatches||[]).forEach(tm => {
      (tm.games||[]).forEach(g => {
        if (!g.wName||!g.lName) return;
        if (!g._id) g._id = 'ptg_'+Date.now().toString(36)+Math.random().toString(36).slice(2,4);
        if (existing.has(g._id)) return;
        applyGameResult(g.wName, g.lName, tm.d||'', g.map||'', g._id, '', '', '프로리그팀전');
        existing.add(g._id);
        cnt++;
      });
    });
  });
  if (cnt > 0) { save(); alert(`✅ ${cnt}경기 전적이 스트리머 상세에 동기화되었습니다.`); render(); }
  else alert('이미 모두 동기화되어 있습니다.');
}

var proCompSub = 'league';
var proCompFilterDate = '';
var proCompFilterGrp = '';
var proCompSortDir = 'desc';
let proCompGrpEditId = null;
let proCompMatchState = {tnId:null, gi:null, mi:null};
let proCompBktState = {tnId:null, rnd:null, mi:null, playerA:'', playerB:''};

function getCurrentProTourney() {
  return proTourneys.find(t=>t.name===curProComp) || proTourneys[0] || null;
}

/* ──────────────────────────────────────
   메인 렌더
────────────────────────────────────── */
function rProComp(C, T) {
  T.innerText = '🎖️ 프로리그 대회';
  if (!isLoggedIn && proCompSub === 'grpedit') proCompSub = 'league';

  const tn = getCurrentProTourney();
  if (tn && !tn.groups) tn.groups = [];

  let h = `<div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;flex-wrap:wrap;padding:12px 16px;background:var(--gold-bg);border:1px solid var(--gold-b);border-radius:10px">
    <span style="font-weight:700;color:var(--gold);white-space:nowrap">🎖️ 대회 선택:</span>
    <select style="flex:1;max-width:220px;font-weight:700" onchange="curProComp=this.value;proCompFilterDate='';proCompFilterGrp='';save();render()">
      <option value="">— 대회를 선택하세요 —</option>
      ${proTourneys.map(t=>{
        const _grpD=(t.groups||[]).flatMap(g=>(g.matches||[]).map(m=>m.d));
        const _bktD=(t.bracket||[]).flat().map(m=>m&&m.d).concat(t.thirdPlace?[t.thirdPlace.d]:[]);
        const _dates=[..._grpD,..._bktD].filter(Boolean).sort();
        const _range=_dates.length?` (${_dates[0].slice(2).replace(/-/g,'.')}~${_dates[_dates.length-1].slice(2).replace(/-/g,'.')})`:t.createdAt?` (${t.createdAt.slice(2).replace(/-/g,'.')} 생성)`:'';
        return`<option value="${t.name}"${curProComp===t.name?' selected':''}>${t.name}${_range}</option>`;
      }).join('')}
    </select>
    ${isLoggedIn?`<button class="btn btn-b btn-xs" onclick="proCompNewTourney()">+ 새 대회</button>`:''}
    ${tn&&isLoggedIn?`<button class="btn btn-w btn-xs" onclick="proCompRenameTourney()" title="대회명 수정">✏️ 이름수정</button><button class="btn btn-r btn-xs" onclick="proCompDelTourney()" title="현재 대회 삭제">🗑️ 삭제</button>`:''}
    ${tn?`<span style="font-size:11px;color:var(--gray-l)">🏆 ${tn.groups.length}개 조 · ${tn.groups.reduce((s,g)=>s+(g.matches||[]).length,0)}경기</span>`:''}
  </div>`;

  const subOpts = [
    {id:'league', lbl:'📅 조별리그 일정'},
    {id:'grprank', lbl:'📊 조별 순위'},
    {id:'tour', lbl:'🗂️ 대진표'},
    {id:'team', lbl:'🤝 팀전'},
    {id:'stats', lbl:'🏅 개인 순위'},
    ...(isLoggedIn?[{id:'grpedit', lbl:'🏗️ 조편성 관리'}]:[]),
  ];
  if (proCompSub === 'progj') proCompSub = 'league';
  h += `<div class="stabs no-export">${subOpts.map(o=>`<button class="stab ${proCompSub===o.id?'on':''}" onclick="proCompSub='${o.id}';render()">${o.lbl}</button>`).join('')}</div>`;

  if (!tn && proCompSub !== 'grpedit') {
    h += `<div style="padding:60px 20px;text-align:center;background:var(--surface);border-radius:12px;border:2px dashed var(--border2)">
      <div style="font-size:44px;margin-bottom:14px">🏆</div>
      <div style="font-size:16px;font-weight:700;margin-bottom:8px">등록된 대회가 없습니다</div>
      <div style="color:var(--gray-l);margin-bottom:20px">새 대회를 만들어 조편성을 시작하세요.</div>
      ${isLoggedIn?`<button class="btn btn-b" onclick="proCompNewTourney()">+ 대회 만들기</button>`:''}
    </div>`;
    C.innerHTML = h; return;
  }

  if (proCompSub === 'league') h += proCompLeague(tn);
  else if (proCompSub === 'grprank') h += proCompGrpRank(tn);
  else if (proCompSub === 'tour') h += proCompBracket(tn);
  else if (proCompSub === 'team') h += proCompTeamSection(tn);
  else if (proCompSub === 'stats') h += proCompTourneyStats(tn);
  else if (proCompSub === 'grpedit') h += proCompGrpEdit();
  C.innerHTML = h;
}

/* ──────────────────────────────────────
   조별리그 일정
────────────────────────────────────── */
function proCompLeague(tn) {
  if (!tn) return `<div style="padding:30px;text-align:center;color:var(--gray-l)">대회를 선택하세요.</div>`;
  const allMatches = [];
  tn.groups.forEach((grp, gi) => {
    const gl = 'ABCDEFGHIJ'[gi] || gi;
    const col = ['#2563eb','#dc2626','#16a34a','#d97706','#7c3aed','#0891b2'][gi%6];
    (grp.matches||[]).forEach((m, mi) => {
      allMatches.push({...m, grpName:grp.name, grpIdx:gi, grpLetter:gl, matchNum:mi+1, grpColor:col});
    });
  });
  allMatches.sort((a,b)=>proCompSortDir==='asc'?(a.d||'9999').localeCompare(b.d||'9999'):(b.d||'').localeCompare(a.d||''));
  const dates = [...new Set(allMatches.map(m=>m.d).filter(Boolean))].sort();
  const _totalM = allMatches.length, _doneM = allMatches.filter(m=>m.winner).length;
  const _pct = _totalM ? Math.round(_doneM/_totalM*100) : 0;
  const _pctColor = _pct===100?'#16a34a':_pct>=50?'#2563eb':'#d97706';
  let h = '';
  if (_totalM > 0) {
    h += `<div style="margin-bottom:12px;padding:10px 14px;background:var(--surface);border-radius:10px;border:1px solid var(--border)">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
        <span style="font-size:12px;font-weight:700;color:${_pctColor}">📊 진행률</span>
        <span style="font-size:12px;color:var(--gray-l)">${_doneM}/${_totalM}경기 완료</span>
        <span style="margin-left:auto;font-size:13px;font-weight:800;color:${_pctColor}">${_pct}%</span>
      </div>
      <div style="height:8px;background:var(--border);border-radius:4px;overflow:hidden">
        <div style="height:100%;width:${_pct}%;background:${_pctColor};border-radius:4px;transition:.3s"></div>
      </div>
    </div>`;
  }
  h += `<div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;flex-wrap:wrap">
    <div style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:15px;color:var(--blue)">🏆 ${tn.name}</div>
    <div style="margin-left:auto;display:flex;gap:4px">
      <button class="pill ${proCompSortDir==='desc'?'on':''}" onclick="proCompSortDir='desc';render()">최신순</button>
      <button class="pill ${proCompSortDir==='asc'?'on':''}" onclick="proCompSortDir='asc';render()">오래된순</button>
    </div>
  </div>`;
  if (isLoggedIn && tn.groups.length) {
    h += `<div class="no-export" style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px;align-items:center">
      <span style="font-size:11px;font-weight:700;color:var(--gray-l)">경기 추가:</span>`;
    tn.groups.forEach((grp, gi) => {
      const gl = 'ABCDEFGHIJ'[gi];
      const col = ['#2563eb','#dc2626','#16a34a','#d97706','#7c3aed','#0891b2'][gi%6];
      h += `<button class="btn btn-xs" style="background:${col};color:#fff;border-color:${col}" onclick="proCompAddMatch('${tn.id}',${gi})">+ ${gl}조</button>`;
    });
    h += `</div>`;
  }
  h += `<div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:10px;padding-bottom:10px;border-bottom:2px solid var(--border)">
    <button class="pill ${!proCompFilterDate?'on':''}" onclick="proCompFilterDate='';render()">전체</button>`;
  dates.forEach(d => {
    const dt = new Date(d+'T00:00:00'); const days=['일','월','화','수','목','금','토'];
    h += `<button class="pill ${proCompFilterDate===d?'on':''}" onclick="proCompFilterDate='${d}';render()">${dt.getMonth()+1}/${dt.getDate()}(${days[dt.getDay()]})</button>`;
  });
  h += `</div>`;
  if (tn.groups.length > 1) {
    h += `<div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:12px;align-items:center"><span style="font-size:11px;font-weight:700;color:var(--gray-l)">조:</span>
      <button class="pill ${!proCompFilterGrp?'on':''}" onclick="proCompFilterGrp='';render()">전체</button>`;
    tn.groups.forEach((grp, gi) => {
      const gl='ABCDEFGHIJ'[gi]; const col=['#2563eb','#dc2626','#16a34a','#d97706','#7c3aed','#0891b2'][gi%6];
      h += `<button class="pill ${proCompFilterGrp===grp.name?'on':''}" style="${proCompFilterGrp===grp.name?`background:${col};border-color:${col};color:#fff`:''}" onclick="proCompFilterGrp='${grp.name}';render()">GROUP ${gl}</button>`;
    });
    h += `</div>`;
  }
  let filtered = allMatches;
  if (proCompFilterDate) filtered = filtered.filter(m=>m.d===proCompFilterDate);
  if (proCompFilterGrp) filtered = filtered.filter(m=>m.grpName===proCompFilterGrp);
  if (!filtered.length) {
    h += `<div style="padding:40px;text-align:center;color:var(--gray-l);background:var(--surface);border-radius:10px">
      ${allMatches.length?'해당 조건의 경기가 없습니다.':'아직 등록된 경기가 없습니다.'}
      ${isLoggedIn?`<br><br><button class="btn btn-b btn-sm" onclick="proCompSub='grpedit';render()">+ 조편성 관리에서 경기 추가</button>`:''}
    </div>`;
    return h;
  }
  const byDate = {};
  filtered.forEach(m => { const k=m.d||'날짜 미정'; if(!byDate[k])byDate[k]=[]; byDate[k].push(m); });
  Object.keys(byDate).sort((a,b)=>proCompSortDir==='asc'?a.localeCompare(b):b.localeCompare(a)).forEach(date => {
    let dateLabel = date;
    if (date !== '날짜 미정') {
      const dt=new Date(date+'T00:00:00');
      const days=['일요일','월요일','화요일','수요일','목요일','금요일','토요일'];
      dateLabel = `${dt.getFullYear()}년 ${dt.getMonth()+1}월 ${dt.getDate()}일 ${days[dt.getDay()]}`;
    }
    h += `<div style="margin-bottom:22px">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">
        <div style="flex:1;font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:13px;color:#1e3a8a;padding:8px 16px;background:linear-gradient(90deg,#1e3a8a10,transparent);border-left:4px solid #2563eb;border-radius:0 8px 8px 0">📅 ${dateLabel}</div>
        ${isLoggedIn?`<button class="btn btn-b btn-xs no-export" onclick="proCompAddMatchOnDate('${tn.id}','${date}')">+ 경기 추가</button>`:''}
      </div>`;
    byDate[date].forEach(m => {
      const pa = players.find(p=>p.name===m.a);
      const pb = players.find(p=>p.name===m.b);
      const isDone = !!m.winner;
      const aWin = isDone && m.winner==='A';
      const bWin = isDone && m.winner==='B';
      const _tb = p => p&&p.tier?`<span style="background:${_TIER_BG[p.tier]||'#64748b'};color:${_TIER_TEXT[p.tier]||'#fff'};font-size:9px;font-weight:700;padding:1px 5px;border-radius:4px">${p.tier}</span>`:'';
      const _rb = p => p&&p.race?`<span class="rbadge r${p.race}" style="font-size:9px;padding:0 4px">${p.race}</span>`:'';
      const _univ = p => p&&p.univ?`<span style="font-size:9px;color:var(--gray-l);font-weight:600">${p.univ}</span>`:'';
      const _pcard = (p, isWin) => {
        const photo = p&&p.photo?`<img src="${p.photo}" style="width:36px;height:36px;border-radius:50%;object-fit:cover;border:2px solid ${isWin?'#16a34a':'var(--border)'};" onerror="this.style.display='none'">`
          : `<div style="width:36px;height:36px;border-radius:50%;background:var(--border);display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0">👤</div>`;
        return `<div style="display:flex;flex-direction:column;align-items:center;gap:3px;padding:10px 14px;border-radius:12px;background:${isWin?'linear-gradient(135deg,#dcfce7,#bbf7d0)':isDone?'var(--surface)':'var(--blue-l)'};border:2px solid ${isWin?'#16a34a':'var(--border)'};min-width:100px">
          ${photo}
          <span style="font-weight:${isWin?'900':'600'};font-size:13px;color:${isWin?'#16a34a':'var(--text)'};margin-top:2px;cursor:${p?'pointer':'default'}" onclick="${p?`openPlayerModal('${(p.name||'').replace(/'/g,"\\'")}')`:''}">${p?p.name:'—'}</span>
          ${_univ(p)}
          <div style="display:flex;gap:3px;align-items:center;flex-wrap:wrap;justify-content:center">${_rb(p)}${_tb(p)}</div>
        </div>`;
      };
      h += `<div class="grp-match-card" style="background:linear-gradient(135deg,var(--white) 0%,var(--blue-l) 100%);border:1.5px solid ${m.grpColor}22;border-left:4px solid ${m.grpColor};box-shadow:0 2px 12px rgba(0,0,0,.06);margin-bottom:8px">
        <div style="display:flex;flex-direction:column;align-items:center;gap:3px;min-width:60px">
          <span class="grp-badge" style="background:linear-gradient(135deg,${m.grpColor},${m.grpColor}cc);font-size:10px;letter-spacing:.5px;box-shadow:0 2px 6px ${m.grpColor}55">GROUP ${m.grpLetter}</span>
          <span style="font-size:10px;color:var(--gray-l);font-weight:600">${m.matchNum}경기</span>
          ${!isDone?`<span style="background:var(--surface);color:var(--gray-l);font-size:10px;padding:2px 8px;border-radius:10px;border:1px solid var(--border)">예정</span>`:''}
        </div>
        <div style="flex:1;display:flex;align-items:center;gap:10px;justify-content:center;flex-wrap:wrap">
          ${_pcard(pa, aWin)}
          <div style="text-align:center;min-width:60px">
            ${isDone?`<div style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:18px;padding:6px 12px;background:var(--white);border-radius:10px;border:1.5px solid var(--border)">
              <span style="color:${aWin?'#16a34a':'var(--text3)'}">${aWin?'WIN':'—'}</span>
              <span style="color:var(--gray-l);font-size:12px;margin:0 2px">:</span>
              <span style="color:${bWin?'#16a34a':'var(--text3)'}">${bWin?'WIN':'—'}</span>
            </div>
            <div style="font-size:10px;font-weight:700;color:#16a34a;margin-top:4px">${aWin?m.a+' 승':bWin?m.b+' 승':'결과없음'}</div>
            ${m.map?`<div style="font-size:10px;color:var(--gray-l);margin-top:2px">📍${m.map}</div>`:''}
            `:`<div style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:22px;color:${m.grpColor}">VS</div>`}
          </div>
          ${_pcard(pb, bWin)}
        </div>
        ${isLoggedIn?`<div class="no-export" style="display:flex;flex-direction:column;gap:4px">
          <button class="btn btn-b btn-xs" style="white-space:nowrap" onclick="proCompEditMatch('${tn.id}',${m.grpIdx},${m.matchNum-1})">✏️ 결과</button>
          <button class="btn btn-r btn-xs" onclick="proCompDelMatch('${tn.id}',${m.grpIdx},${m.matchNum-1})">🗑️ 삭제</button>
        </div>`:''}
      </div>`;
    });
    h += `</div>`;
  });
  return h;
}

/* ──────────────────────────────────────
   조별 순위
────────────────────────────────────── */
function _calcProGrpRank(grp) {
  const st = {};
  (grp.players||[]).forEach(p => { st[p] = {w:0, l:0}; });
  (grp.matches||[]).forEach(m => {
    if (!m.a || !m.b || !m.winner) return;
    if (!st[m.a]) st[m.a] = {w:0, l:0};
    if (!st[m.b]) st[m.b] = {w:0, l:0};
    if (m.winner==='A') { st[m.a].w++; st[m.b].l++; }
    else { st[m.b].w++; st[m.a].l++; }
  });
  return Object.entries(st).map(([name,s])=>({name,...s})).sort((a,b)=>b.w-a.w||(a.l-b.l));
}

function proCompGrpRank(tn) {
  if (!tn) return `<div style="padding:30px;text-align:center;color:var(--gray-l)">대회를 선택하세요.</div>`;
  const GL = 'ABCDEFGHIJ';
  let h = `<div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;flex-wrap:wrap">
    <div style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:15px;color:var(--blue)">📊 ${tn.name} — 조별 순위</div>
    <button class="btn btn-w btn-xs no-export" onclick="proCompPrintRank()" style="margin-left:auto">🖨️ 결과 인쇄/저장</button>
  </div>`;
  tn.groups.forEach((grp, gi) => {
    const col = ['#2563eb','#dc2626','#16a34a','#d97706','#7c3aed','#0891b2'][gi%6];
    const ranks = _calcProGrpRank(grp);
    h += `<div style="margin-bottom:20px;border-radius:12px;overflow:hidden;border:1px solid ${col}33">
      <div style="padding:10px 16px;background:linear-gradient(135deg,${col},${col}cc);color:#fff;font-weight:900;font-size:13px">GROUP ${GL[gi]} · ${grp.name||GL[gi]+'조'}</div>
      <table style="width:100%;border-collapse:collapse;font-size:13px">
        <thead><tr style="background:${col}11">
          <th style="padding:8px 12px;text-align:center;width:40px;color:var(--text3)">순위</th>
          <th style="padding:8px 12px;text-align:left;color:var(--text3)">선수</th>
          <th style="padding:8px 12px;text-align:center;color:var(--text3)">승</th>
          <th style="padding:8px 12px;text-align:center;color:var(--text3)">패</th>
          <th style="padding:8px 12px;text-align:center;color:var(--text3)">승률</th>
        </tr></thead><tbody>`;
    ranks.forEach((r, idx) => {
      const total = r.w + r.l;
      const wr = total ? Math.round(r.w/total*100) : 0;
      const medal = idx===0?'🥇':idx===1?'🥈':idx===2?'🥉':'';
      const p = players.find(x=>x.name===r.name);
      const _photo = p&&p.photo?`<img src="${p.photo}" style="width:28px;height:28px;border-radius:50%;object-fit:cover;margin-right:6px;vertical-align:middle;flex-shrink:0" onerror="this.style.display='none'">`:'<span style="width:28px;height:28px;border-radius:50%;background:var(--border);display:inline-flex;align-items:center;justify-content:center;margin-right:6px;font-size:13px;flex-shrink:0">👤</span>';
      const _tb = p&&p.tier?`<span style="background:${_TIER_BG[p.tier]||'#64748b'};color:${_TIER_TEXT[p.tier]||'#fff'};font-size:9px;font-weight:700;padding:1px 4px;border-radius:3px">${p.tier}</span>`:'';
      const _rb = p&&p.race?`<span class="rbadge r${p.race}" style="font-size:9px;padding:0 3px">${p.race}</span>`:'';
      const _univ = p&&p.univ?`<span style="font-size:10px;color:var(--gray-l)">${p.univ}</span>`:'';
      h += `<tr style="border-top:1px solid var(--border);${idx===0?'background:'+col+'08':''}">
        <td style="padding:8px 12px;text-align:center;font-size:16px">${medal||idx+1}</td>
        <td style="padding:8px 10px">
          <div style="display:flex;align-items:center;gap:0">
            ${_photo}
            <div style="display:flex;flex-direction:column;gap:2px">
              <div style="display:flex;align-items:center;gap:4px">
                <span style="font-weight:${idx<2?'800':'600'};font-size:13px;cursor:pointer;color:var(--blue)" onclick="openPlayerModal('${r.name.replace(/'/g,"\\'")}')">${r.name}</span>
                ${_rb}${_tb}
              </div>
              ${_univ}
            </div>
          </div>
        </td>
        <td style="padding:8px 12px;text-align:center;font-weight:700;color:#16a34a">${r.w}</td>
        <td style="padding:8px 12px;text-align:center;color:var(--red)">${r.l}</td>
        <td style="padding:8px 12px;text-align:center;font-weight:700">${wr}%</td>
      </tr>`;
    });
    h += `</tbody></table></div>`;
  });
  return h;
}

/* ──────────────────────────────────────
   팀전
────────────────────────────────────── */
function proCompTeamSection(tn) {
  if (!tn) return `<div style="padding:30px;text-align:center;color:var(--gray-l)">대회를 선택하세요.</div>`;
  const tms = tn.teamMatches||[];
  let h = `<div style="font-weight:900;font-size:15px;color:var(--blue);margin-bottom:12px">🤝 ${tn.name} — 팀전</div>`;
  if (isLoggedIn) {
    h += `<div class="no-export" style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px">
      <button class="btn btn-b btn-sm" onclick="proCompCreateTeamMatch('${tn.id}')">+ 팀전 추가</button>
      <button class="btn btn-w btn-sm" onclick="proCompOpenTeamPasteModal('${tn.id}',null)">📋 일괄 입력</button>
    </div>`;
  }
  if (!tms.length) {
    h += `<div class="empty-state"><div class="empty-state-icon">🤝</div><div class="empty-state-title">팀전 기록이 없습니다</div><div class="empty-state-desc">팀을 구성하고 대결 결과를 기록할 수 있습니다</div></div>`;
    return h;
  }
  tms.forEach((tm, tmi) => {
    const aWin = tm.sa > tm.sb, bWin = tm.sb > tm.sa;
    const games = tm.games||[];
    const colA='#2563eb', colB='#dc2626';
    h += `<div style="border:1.5px solid var(--border);border-radius:12px;padding:14px;margin-bottom:14px">
      <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:10px">
        <span style="font-size:11px;color:var(--gray-l);flex-shrink:0">${tm.d||'날짜 미정'}</span>
        <div style="display:flex;align-items:center;gap:10px;flex:1;flex-wrap:wrap">
          <span style="font-weight:${aWin?900:600};color:${aWin?colA:'var(--text)'};font-size:14px">${tm.teamAName||'A팀'}</span>
          <span style="font-size:20px;font-weight:900;background:${aWin?colA:bWin?colB:'var(--border)'};color:#fff;padding:2px 14px;border-radius:8px">${tm.sa||0}:${tm.sb||0}</span>
          <span style="font-weight:${bWin?900:600};color:${bWin?colB:'var(--text)'};font-size:14px">${tm.teamBName||'B팀'}</span>
        </div>
        ${isLoggedIn?`<div style="display:flex;gap:4px;flex-shrink:0;flex-wrap:wrap">
          <button class="btn btn-b btn-xs" onclick="proCompAddTeamGame('${tn.id}',${tmi})">+ 경기</button>
          <button class="btn btn-w btn-xs" onclick="proCompOpenTeamPasteModal('${tn.id}',${tmi})">📋</button>
          <button class="btn btn-r btn-xs" onclick="proCompDeleteTeamMatch('${tn.id}',${tmi})">🗑️</button>
        </div>`:''}
      </div>
      <div style="display:flex;gap:16px;margin-bottom:8px;flex-wrap:wrap">
        <div style="font-size:11px"><span style="color:${colA};font-weight:700">${tm.teamAName||'A팀'}:</span> <span style="color:var(--text3)">${(tm.teamA||[]).map(p=>`<span onclick="openPlayerModal('${p.replace(/'/g,"\\'")}') " style="cursor:pointer;text-decoration:underline dotted">${p}</span>`).join(', ')||'—'}</span></div>
        <div style="font-size:11px"><span style="color:${colB};font-weight:700">${tm.teamBName||'B팀'}:</span> <span style="color:var(--text3)">${(tm.teamB||[]).map(p=>`<span onclick="openPlayerModal('${p.replace(/'/g,"\\'")}') " style="cursor:pointer;text-decoration:underline dotted">${p}</span>`).join(', ')||'—'}</span></div>
      </div>
      ${games.length?`<div style="border-top:1px solid var(--border);padding-top:8px;margin-top:4px">
        ${games.map((g, gi) => {
          const sideWin=g._sideW==='A'?tm.teamAName||'A팀':tm.teamBName||'B팀';
          const pw=players.find(p=>p.name===g.wName), pl=players.find(p=>p.name===g.lName);
          const rb=p=>p&&p.race?`<span class="rbadge r${p.race}" style="font-size:9px;padding:0 3px">${p.race}</span>`:'';
          return `<div style="display:flex;align-items:center;gap:6px;padding:4px 8px;background:var(--surface);border-radius:6px;margin-bottom:3px;font-size:12px">
            <span style="background:${g._sideW==='A'?colA:colB};color:#fff;font-size:9px;font-weight:700;padding:1px 5px;border-radius:4px;flex-shrink:0">${sideWin}</span>
            <span style="font-weight:700;color:#16a34a;cursor:pointer" onclick="openPlayerModal('${g.wName.replace(/'/g,"\\'")}' )">${g.wName||'?'} ${rb(pw)}</span>
            <span style="color:var(--gray-l);font-size:11px">WIN vs</span>
            <span style="color:var(--text3);cursor:pointer" onclick="openPlayerModal('${(g.lName||'').replace(/'/g,"\\'")}' )">${g.lName||'?'} ${rb(pl)}</span>
            ${g.map?`<span style="color:var(--gray-l);font-size:10px;margin-left:auto;flex-shrink:0">📍${g.map}</span>`:''}
            ${isLoggedIn?`<button class="btn btn-r btn-xs" style="margin-left:${g.map?'4px':'auto'};flex-shrink:0" onclick="proCompDeleteTeamGame('${tn.id}',${tmi},${gi})">✕</button>`:''}
          </div>`;
        }).join('')}
      </div>`:''}
    </div>`;
  });
  return h;
}

function proCompCreateTeamMatch(tnId) {
  const tn = proTourneys.find(t=>t.id===tnId);
  if (!tn) return;
  // 조편성 선수 우선 + 전체 players 포함
  const grpPlayers = [...new Set((tn.groups||[]).flatMap(g=>g.players||[]))];
  const allPNames = players.map(p=>p.name);
  const allPlayerList = [...grpPlayers, ...allPNames.filter(n=>!grpPlayers.includes(n))];
  const modal = document.createElement('div');
  modal.id = '_tmModal';
  modal.style.cssText = 'position:fixed;inset:0;background:#0008;z-index:9999;display:flex;align-items:flex-start;justify-content:center;overflow-y:auto;padding:20px;box-sizing:border-box';
  modal.innerHTML = `<div style="background:var(--white);border-radius:16px;padding:24px;width:460px;max-width:100%;box-shadow:0 8px 40px rgba(0,0,0,.3);margin:auto">
    <div style="font-weight:900;font-size:15px;margin-bottom:16px">🤝 팀전 추가</div>
    <div style="display:flex;gap:10px;margin-bottom:12px">
      <div style="flex:1">
        <label style="font-size:12px;font-weight:700;color:var(--text3)">날짜</label>
        <input id="_tm_d" type="date" value="${new Date().toISOString().slice(0,10)}" style="width:100%;padding:7px;border-radius:8px;border:1px solid var(--border);margin-top:4px;box-sizing:border-box">
      </div>
    </div>
    <div style="display:flex;gap:10px;margin-bottom:12px">
      <div style="flex:1">
        <label style="font-size:12px;font-weight:700;color:#2563eb">A팀 이름</label>
        <input id="_tm_an" value="A팀" style="width:100%;padding:7px;border-radius:8px;border:1px solid var(--border);margin-top:4px;box-sizing:border-box">
      </div>
      <div style="flex:1">
        <label style="font-size:12px;font-weight:700;color:#dc2626">B팀 이름</label>
        <input id="_tm_bn" value="B팀" style="width:100%;padding:7px;border-radius:8px;border:1px solid var(--border);margin-top:4px;box-sizing:border-box">
      </div>
    </div>
    <div style="font-size:12px;font-weight:700;color:var(--text3);margin-bottom:6px">팀 구성 (클릭 → A팀 → B팀 → 해제)</div>
    <div style="display:flex;gap:8px;margin-bottom:8px">
      <div style="flex:1;background:#2563eb11;border:1.5px solid #2563eb44;border-radius:8px;padding:8px;min-height:50px">
        <div style="font-size:11px;font-weight:700;color:#2563eb;margin-bottom:4px">A팀</div>
        <div id="_tm_draftA" style="display:flex;flex-wrap:wrap;gap:4px"></div>
      </div>
      <div style="flex:1;background:#dc262611;border:1.5px solid #dc262644;border-radius:8px;padding:8px;min-height:50px">
        <div style="font-size:11px;font-weight:700;color:#dc2626;margin-bottom:4px">B팀</div>
        <div id="_tm_draftB" style="display:flex;flex-wrap:wrap;gap:4px"></div>
      </div>
    </div>
    <div style="margin-bottom:6px">
      <input id="_tm_search" placeholder="🔍 스트리머 검색..." oninput="_tmFilterPool()" style="width:100%;padding:7px 10px;border-radius:8px;border:1px solid var(--border);font-size:12px;box-sizing:border-box">
    </div>
    <div id="_tm_pool" style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:14px;padding:8px;background:var(--surface);border-radius:8px;max-height:160px;overflow-y:auto">
      ${allPlayerList.map(p=>`<button class="_tm_pBtn" data-name="${p}" data-side="none" onclick="_tmCyclePlayer(this,'${p.replace(/'/g,"\\'")}') " style="padding:3px 10px;border-radius:12px;border:1.5px solid var(--border);background:var(--white);font-size:12px;cursor:pointer">${p}</button>`).join('')}
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
    btn.style.cssText='padding:3px 10px;border-radius:12px;border:1.5px solid #2563eb;background:#2563eb;color:#fff;font-size:12px;cursor:pointer;font-weight:700';
    const tag=document.createElement('span');
    tag.className='_tm_draftTag'; tag.setAttribute('data-name',name);
    tag.style.cssText='padding:2px 8px;background:#2563eb;color:#fff;border-radius:10px;font-size:11px;font-weight:600';
    tag.textContent=name; draftA.appendChild(tag);
  } else if (nextSide==='B') {
    btn.style.cssText='padding:3px 10px;border-radius:12px;border:1.5px solid #dc2626;background:#dc2626;color:#fff;font-size:12px;cursor:pointer;font-weight:700';
    const tag=document.createElement('span');
    tag.className='_tm_draftTag'; tag.setAttribute('data-name',name);
    tag.style.cssText='padding:2px 8px;background:#dc2626;color:#fff;border-radius:10px;font-size:11px;font-weight:600';
    tag.textContent=name; draftB.appendChild(tag);
  } else {
    btn.style.cssText='padding:3px 10px;border-radius:12px;border:1.5px solid var(--border);background:var(--white);font-size:12px;cursor:pointer';
  }
}

function _tmSaveCreate(tnId) {
  const tn = proTourneys.find(t=>t.id===tnId);
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
  const tn = proTourneys.find(t=>t.id===tnId);
  if (!tn||(tn.teamMatches||[])[tmi]==null) return;
  const tm = tn.teamMatches[tmi];
  const teamA = tm.teamA&&tm.teamA.length ? tm.teamA : [];
  const teamB = tm.teamB&&tm.teamB.length ? tm.teamB : [];
  const colA='#2563eb', colB='#dc2626';
  const _memberBtns = (list, side, inputId) => list.map(p=>`<button type="button" onclick="_tmPickPlayer('${p.replace(/'/g,"\\'")}','${inputId}')" style="padding:2px 8px;border-radius:10px;border:1.5px solid ${side==='A'?colA:colB};background:${side==='A'?colA+'15':colB+'15'};color:${side==='A'?colA:colB};font-size:11px;cursor:pointer;font-weight:600">${p}</button>`).join('');
  const modal = document.createElement('div');
  modal.id = '_tmGameModal';
  modal.style.cssText = 'position:fixed;inset:0;background:#0008;z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px;box-sizing:border-box';
  modal.innerHTML = `<div style="background:var(--white);border-radius:16px;padding:24px;width:380px;max-width:100%;max-height:90vh;overflow-y:auto;box-shadow:0 8px 40px rgba(0,0,0,.3)">
    <div style="font-weight:900;font-size:15px;margin-bottom:14px">⚔️ 경기 추가</div>
    <div style="margin-bottom:12px">
      <label style="font-size:12px;font-weight:700;color:${colA}">${tm.teamAName||'A팀'} 선수</label>
      ${teamA.length?`<div style="display:flex;flex-wrap:wrap;gap:4px;margin:5px 0">${_memberBtns(teamA,'A','_tg_a')}</div>`:''}
      <input id="_tg_a" placeholder="검색하거나 직접 입력" list="_tg_allPlayers" style="width:100%;padding:7px;border-radius:8px;border:1px solid var(--border);margin-top:4px;font-size:12px;box-sizing:border-box">
    </div>
    <div style="margin-bottom:12px">
      <label style="font-size:12px;font-weight:700;color:${colB}">${tm.teamBName||'B팀'} 선수</label>
      ${teamB.length?`<div style="display:flex;flex-wrap:wrap;gap:4px;margin:5px 0">${_memberBtns(teamB,'B','_tg_b')}</div>`:''}
      <input id="_tg_b" placeholder="검색하거나 직접 입력" list="_tg_allPlayers" style="width:100%;padding:7px;border-radius:8px;border:1px solid var(--border);margin-top:4px;font-size:12px;box-sizing:border-box">
    </div>
    <datalist id="_tg_allPlayers">${players.map(p=>`<option value="${p.name}">`).join('')}</datalist>
    <div style="margin-bottom:10px">
      <label style="font-size:12px;font-weight:700;color:var(--text3)">승자</label>
      <div style="display:flex;gap:8px;margin-top:6px">
        <button id="_tg_wA" class="btn btn-w" style="flex:1" onclick="document.getElementById('_tg_wA').className='btn btn-b';document.getElementById('_tg_wB').className='btn btn-w'">${tm.teamAName||'A팀'} 승</button>
        <button id="_tg_wB" class="btn btn-w" style="flex:1" onclick="document.getElementById('_tg_wB').className='btn btn-b';document.getElementById('_tg_wA').className='btn btn-w'">${tm.teamBName||'B팀'} 승</button>
      </div>
    </div>
    <div style="margin-bottom:16px">
      <label style="font-size:12px;font-weight:700;color:var(--text3)">맵 (선택)</label>
      <input id="_tg_map" placeholder="선택입력" list="_tg_allPlayers" style="width:100%;padding:7px;border-radius:8px;border:1px solid var(--border);margin-top:4px;font-size:12px;box-sizing:border-box">
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
  const tn = proTourneys.find(t=>t.id===tnId);
  if (!tn||(tn.teamMatches||[])[tmi]==null) return;
  const tm = tn.teamMatches[tmi];
  const aName = document.getElementById('_tg_a').value;
  const bName = document.getElementById('_tg_b').value;
  const wA = document.getElementById('_tg_wA').className.includes('btn-b');
  const wB = document.getElementById('_tg_wB').className.includes('btn-b');
  const map = document.getElementById('_tg_map').value.trim();
  if (!aName||!bName) { alert('선수를 선택하세요.'); return; }
  if (!wA&&!wB) { alert('승자를 선택하세요.'); return; }
  const wName = wA?aName:bName, lName = wA?bName:aName;
  const gid = 'ptg_'+Date.now().toString(36)+Math.random().toString(36).slice(2,4);
  if (!tm.games) tm.games=[];
  tm.games.push({_id:gid, wName, lName, map, _sideW:wA?'A':'B'});
  tm.sa=(tm.games).filter(g=>g._sideW==='A').length;
  tm.sb=(tm.games).filter(g=>g._sideW==='B').length;
  applyGameResult(wName, lName, tm.d||'', map, gid, '', '', '프로리그팀전');
  document.getElementById('_tmGameModal').remove();
  save(); render();
}

function proCompDeleteTeamGame(tnId, tmi, gi) {
  const tn = proTourneys.find(t=>t.id===tnId);
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

function proCompDeleteTeamMatch(tnId, tmi) {
  if (!confirm('이 팀전을 삭제하시겠습니까? 경기 전적도 취소됩니다.')) return;
  const tn = proTourneys.find(t=>t.id===tnId);
  if (!tn||!tn.teamMatches) return;
  const tm = tn.teamMatches[tmi];
  if (tm) (tm.games||[]).forEach(g=>_revertProMatch(g._id));
  tn.teamMatches.splice(tmi,1);
  save(); render();
}

/* ──────────────────────────────────────
   팀전 일괄 입력 (붙여넣기)
────────────────────────────────────── */
function proCompOpenTeamPasteModal(tnId, tmi) {
  const tn = proTourneys.find(t=>t.id===tnId);
  if (!tn) return;
  const tms = tn.teamMatches||[];
  // tmi=null 이면 팀전 선택 모드
  const isSingle = tmi!=null && tms[tmi];
  const tm = isSingle ? tms[tmi] : null;
  const colA='#2563eb', colB='#dc2626';
  const tmInfoHTML = isSingle
    ? `<div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;padding:8px 12px;background:var(--surface);border-radius:8px">
        <span style="color:${colA};font-weight:700;font-size:13px">${tm.teamAName||'A팀'}</span>
        <span style="color:var(--gray-l);font-size:12px">vs</span>
        <span style="color:${colB};font-weight:700;font-size:13px">${tm.teamBName||'B팀'}</span>
        <span style="font-size:11px;color:var(--gray-l);margin-left:auto">${tm.d||'날짜 미정'}</span>
       </div>`
    : `<div style="margin-bottom:12px">
        <label style="font-size:12px;font-weight:700;color:var(--text3)">팀전 선택</label>
        <select id="_tp_tmi" style="width:100%;padding:7px;border-radius:8px;border:1px solid var(--border);margin-top:4px;box-sizing:border-box">
          <option value="-1">➕ 새 팀전 생성</option>
          ${tms.map((t,i)=>`<option value="${i}">${t.teamAName||'A팀'} vs ${t.teamBName||'B팀'} (${t.d||'날짜 미정'})</option>`).join('')}
        </select>
        <div style="display:flex;gap:8px;margin-top:8px">
          <div style="flex:1">
            <label style="font-size:11px;font-weight:700;color:${colA}">새 팀전 A팀명</label>
            <input id="_tp_an" value="A팀" style="width:100%;padding:5px 8px;border-radius:6px;border:1px solid var(--border);margin-top:3px;font-size:12px;box-sizing:border-box">
          </div>
          <div style="flex:1">
            <label style="font-size:11px;font-weight:700;color:${colB}">새 팀전 B팀명</label>
            <input id="_tp_bn" value="B팀" style="width:100%;padding:5px 8px;border-radius:6px;border:1px solid var(--border);margin-top:3px;font-size:12px;box-sizing:border-box">
          </div>
          <div style="flex:1">
            <label style="font-size:11px;font-weight:700;color:var(--text3)">날짜</label>
            <input id="_tp_nd" type="date" value="${new Date().toISOString().slice(0,10)}" style="width:100%;padding:5px 8px;border-radius:6px;border:1px solid var(--border);margin-top:3px;font-size:12px;box-sizing:border-box">
          </div>
        </div>
       </div>`;
  const modal = document.createElement('div');
  modal.id = '_tmPasteModal';
  modal.style.cssText = 'position:fixed;inset:0;background:#0008;z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px;box-sizing:border-box';
  modal.innerHTML = `<div style="background:var(--white);border-radius:16px;padding:24px;width:450px;max-width:100%;max-height:90vh;overflow-y:auto;box-shadow:0 8px 40px rgba(0,0,0,.3)">
    <div style="font-weight:900;font-size:15px;margin-bottom:10px">📋 팀전 경기 일괄 입력</div>
    ${tmInfoHTML}
    <div style="font-size:11px;color:var(--text3);background:var(--surface);border-radius:8px;padding:10px;margin-bottom:12px;line-height:1.8">
      한 줄에 한 경기 (공백/탭 구분):<br>
      <code>승자이름 패자이름 [맵]</code><br>
      팀 멤버 등록 시 A/B팀 자동 감지. 예) <code>홍길동 이순신 신한은행</code>
    </div>
    <textarea id="_tp_text" rows="9" placeholder="홍길동 이순신 신한은행&#10;강감찬 을지문덕&#10;이순신 강감찬 블리자드리지" style="width:100%;padding:8px;border-radius:8px;border:1px solid var(--border);font-size:12px;box-sizing:border-box;font-family:monospace;resize:vertical"></textarea>
    <div style="display:flex;gap:8px;margin-top:12px">
      <button class="btn btn-b" style="flex:1" onclick="proCompSaveTeamPaste('${tnId}',${isSingle?tmi:'null'})">저장</button>
      <button class="btn btn-w" style="flex:1" onclick="document.getElementById('_tmPasteModal').remove()">취소</button>
    </div>
  </div>`;
  document.body.appendChild(modal);
}

function proCompSaveTeamPaste(tnId, tmi) {
  const tn = proTourneys.find(t=>t.id===tnId);
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
    // _sideW: 팀 멤버 기준 자동 감지, 없으면 A
    let sideW='A';
    if (teamBSet.has(wName)) sideW='B';
    else if (teamASet.has(wName)) sideW='A';
    else if (teamBSet.has(lName)) sideW='A'; // 패자가 B팀 → 승자는 A팀
    else if (teamASet.has(lName)) sideW='B';
    const gid='ptg_'+Date.now().toString(36)+Math.random().toString(36).slice(2,4);
    if (!tm.games) tm.games=[];
    tm.games.push({_id:gid, wName, lName, map:map.trim(), _sideW:sideW});
    applyGameResult(wName, lName, tm.d||'', map.trim(), gid, '', '', '프로리그팀전');
    added++;
  });
  tm.sa=(tm.games||[]).filter(g=>g._sideW==='A').length;
  tm.sb=(tm.games||[]).filter(g=>g._sideW==='B').length;
  save(); render();
  if (added>0) alert(`${added}경기가 추가되었습니다.`);
}

/* ──────────────────────────────────────
   대진표 (단계별 토너먼트)
────────────────────────────────────── */
function proCompBracket(tn) {
  if (!tn) return `<div style="padding:30px;text-align:center;color:var(--gray-l)">대회를 선택하세요.</div>`;
  if (!tn.bracket || !tn.bracket.length) {
    const hasGroups = tn.groups && tn.groups.length>0 && tn.groups.some(g=>(g.players||[]).length>0||(g.matches||[]).length>0);
    return `<div style="padding:40px;text-align:center;background:var(--surface);border-radius:12px;border:2px dashed var(--border2)">
      <div style="font-size:36px;margin-bottom:12px">🗂️</div>
      <div style="font-size:15px;font-weight:700;margin-bottom:8px">대진표가 없습니다</div>
      ${isLoggedIn?`<div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-top:16px">
        ${hasGroups?`<button class="btn btn-b" onclick="proCompInitBracket('${tn.id}')">🏆 조별 순위로 대진표 생성</button>`:''}
        <button class="btn btn-w" onclick="proCompInitBracketManual('${tn.id}')">✍️ 직접 대진표 만들기</button>
      </div>`:''}
    </div>`;
  }
  const rounds = tn.bracket;
  const _pc = name => { const p=players.find(x=>x.name===name); return p||null; };
  const _photo = (name, isWin) => {
    const p=_pc(name); if(!name||name==='TBD') return `<div style="width:28px;height:28px;border-radius:50%;background:var(--border);flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:13px">❓</div>`;
    return p&&p.photo
      ?`<img src="${p.photo}" style="width:28px;height:28px;border-radius:50%;object-fit:cover;flex-shrink:0;border:2px solid ${isWin?'#16a34a':'var(--border)'}" onerror="this.style.display='none'">`
      :`<div style="width:28px;height:28px;border-radius:50%;background:${gc(p?.univ||'')};flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;color:#fff">${name[0]}</div>`;
  };
  const _info = name => {
    const p=_pc(name); if(!p) return '';
    return `<span style="font-size:9px;color:var(--gray-l);white-space:nowrap">${p.univ||''}${p.tier?' · '+p.tier:''}</span>`;
  };
  let h = `<div style="font-weight:900;font-size:15px;color:var(--blue);margin-bottom:12px">🗂️ ${tn.name} — 대진표</div>`;
  // 라운드 레이블 행
  const rndLabel = ri => ri===rounds.length-1?'🏆 결승':ri===rounds.length-2?'준결승':ri===rounds.length-3?'4강':`${Math.pow(2,rounds.length-ri)}강`;
  const rndColor = ri => ri===rounds.length-1?'#f59e0b':ri===rounds.length-2?'#7c3aed':ri===rounds.length-3?'#dc2626':'#2563eb';
  h += `<div style="display:flex;gap:12px;overflow-x:auto;padding-bottom:16px;align-items:flex-start">`;
  rounds.forEach((rnd, ri) => {
    const lbl = rndLabel(ri); const col = rndColor(ri);
    const gap = ri===0?10:(Math.pow(2,ri)*56+10);
    h += `<div style="min-width:180px;flex-shrink:0;display:flex;flex-direction:column;align-items:center">
      <div style="width:100%;text-align:center;font-size:11px;font-weight:800;color:#fff;margin-bottom:10px;padding:5px 8px;background:${col};border-radius:8px;box-shadow:0 2px 6px ${col}55">${lbl}</div>
      <div style="width:100%;display:flex;flex-direction:column;gap:${gap}px">`;
    rnd.forEach((m, mi) => {
      const aWin=m.winner==='A', bWin=m.winner==='B', isDone=!!m.winner;
      const hasBoth = m.a&&m.b&&m.a!=='TBD'&&m.b!=='TBD';
      h += `<div style="border:2px solid ${isDone?col:'var(--border2)'};border-radius:10px;overflow:hidden;background:var(--white);box-shadow:0 2px 12px rgba(0,0,0,.08)">
        <div style="padding:8px 10px;border-bottom:1px solid var(--border);background:${aWin?'#dcfce7':m.a&&m.a!=='TBD'?'var(--white)':'var(--surface)'};display:flex;align-items:center;gap:6px">
          ${_photo(m.a, aWin)}
          <div style="flex:1;min-width:0">
            <div style="font-size:12px;font-weight:${aWin?'800':'500'};color:${aWin?'#16a34a':'var(--blue)'};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;cursor:${m.a&&m.a!=='TBD'?'pointer':'default'}" onclick="${m.a&&m.a!=='TBD'?`openPlayerModal('${(m.a||'').replace(/'/g,"\\'")}')`:''}">${m.a||'TBD'}</div>
            ${_info(m.a)}
          </div>
          ${aWin?'<span style="font-size:10px;font-weight:900;color:#16a34a;flex-shrink:0">WIN</span>':''}
        </div>
        <div style="padding:8px 10px;background:${bWin?'#dcfce7':m.b&&m.b!=='TBD'?'var(--white)':'var(--surface)'};display:flex;align-items:center;gap:6px">
          ${_photo(m.b, bWin)}
          <div style="flex:1;min-width:0">
            <div style="font-size:12px;font-weight:${bWin?'800':'500'};color:${bWin?'#16a34a':'var(--blue)'};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;cursor:${m.b&&m.b!=='TBD'?'pointer':'default'}" onclick="${m.b&&m.b!=='TBD'?`openPlayerModal('${(m.b||'').replace(/'/g,"\\'")}')`:''}">${m.b||'TBD'}</div>
            ${_info(m.b)}
          </div>
          ${bWin?'<span style="font-size:10px;font-weight:900;color:#16a34a;flex-shrink:0">WIN</span>':''}
        </div>
        ${(m.map||m.d)?`<div style="padding:2px 10px;font-size:10px;color:var(--gray-l);background:var(--surface);border-top:1px solid var(--border);display:flex;gap:8px">${m.d?`<span>📅 ${m.d.slice(2).replace(/-/g,'.')}</span>`:''}${m.map?`<span>📍 ${m.map}</span>`:''}</div>`:''}
        ${isLoggedIn?`<div style="padding:5px 6px;background:var(--surface);border-top:1px solid var(--border);display:flex;gap:3px;flex-wrap:wrap">
          ${hasBoth?`<button class="btn btn-xs" style="flex:1;font-size:9px;${aWin?'background:#16a34a;color:#fff;border-color:#16a34a':''}" onclick="proCompSetBktWinner('${tn.id}',${ri},${mi},'A')">${(m.a||'A').slice(0,4)} 승</button>
          <button class="btn btn-xs" style="flex:1;font-size:9px;${bWin?'background:#16a34a;color:#fff;border-color:#16a34a':''}" onclick="proCompSetBktWinner('${tn.id}',${ri},${mi},'B')">${(m.b||'B').slice(0,4)} 승</button>`:''}
          <button class="btn btn-xs" style="font-size:9px;padding:0 5px" onclick="proCompBktSetDate('${tn.id}',${ri},${mi})" title="날짜 입력">📅</button>
          <button class="btn btn-xs" style="font-size:9px;padding:0 5px" onclick="proCompBktSetMap('${tn.id}',${ri},${mi})" title="맵 입력">📍</button>
          <button class="btn btn-xs" style="font-size:9px;padding:0 5px" onclick="proCompBktEditPlayers('${tn.id}',${ri},${mi})" title="선수 수정">✏️</button>
        </div>`:''}
      </div>`;
    });
    h += `</div></div>`;
  });
  h += `</div>`;
  // 3위전
  if (rounds.length >= 2 && tn.thirdPlace) {
    const tp = tn.thirdPlace;
    const tpA = tp.winner==='A', tpB = tp.winner==='B';
    const tpBoth = tp.a&&tp.b&&tp.a!=='TBD'&&tp.b!=='TBD';
    const tpCol = '#78716c';
    h += `<div style="margin-top:16px;padding:14px 16px;background:var(--surface);border:2px solid ${tpCol}44;border-radius:12px;max-width:400px">
      <div style="font-size:12px;font-weight:900;color:${tpCol};margin-bottom:10px;display:flex;align-items:center;gap:6px">🥉 3·4위전</div>
      <div style="border:2px solid ${tp.winner?tpCol:'var(--border2)'};border-radius:10px;overflow:hidden;background:var(--white);max-width:240px">
        <div style="padding:8px 10px;border-bottom:1px solid var(--border);background:${tpA?'#dcfce7':tp.a?'var(--white)':'var(--surface)'};display:flex;align-items:center;gap:6px">
          ${_photo(tp.a, tpA)}
          <div style="flex:1;min-width:0">
            <div style="font-size:12px;font-weight:${tpA?'800':'500'};color:${tpA?'#16a34a':'var(--blue)'};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;cursor:${tp.a&&tp.a!=='TBD'?'pointer':'default'}" onclick="${tp.a&&tp.a!=='TBD'?`openPlayerModal('${(tp.a||'').replace(/'/g,"\\'")}')`:''}">${tp.a||'TBD'}</div>
            ${_info(tp.a)}
          </div>
          ${tpA?'<span style="font-size:10px;font-weight:900;color:#16a34a;flex-shrink:0">3위</span>':''}
        </div>
        <div style="padding:8px 10px;background:${tpB?'#dcfce7':tp.b?'var(--white)':'var(--surface)'};display:flex;align-items:center;gap:6px">
          ${_photo(tp.b, tpB)}
          <div style="flex:1;min-width:0">
            <div style="font-size:12px;font-weight:${tpB?'800':'500'};color:${tpB?'#16a34a':'var(--blue)'};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;cursor:${tp.b&&tp.b!=='TBD'?'pointer':'default'}" onclick="${tp.b&&tp.b!=='TBD'?`openPlayerModal('${(tp.b||'').replace(/'/g,"\\'")}')`:''}">${tp.b||'TBD'}</div>
            ${_info(tp.b)}
          </div>
          ${tpB?'<span style="font-size:10px;font-weight:900;color:#16a34a;flex-shrink:0">3위</span>':''}
        </div>
        ${(tp.map||tp.d)?`<div style="padding:2px 10px;font-size:10px;color:var(--gray-l);background:var(--surface);border-top:1px solid var(--border);display:flex;gap:8px">${tp.d?`<span>📅 ${tp.d.slice(2).replace(/-/g,'.')}</span>`:''}${tp.map?`<span>📍 ${tp.map}</span>`:''}</div>`:''}
        ${isLoggedIn&&tpBoth?`<div style="padding:5px 6px;background:var(--surface);border-top:1px solid var(--border);display:flex;gap:3px;flex-wrap:wrap">
          <button class="btn btn-xs" style="flex:1;font-size:9px;${tpA?'background:#16a34a;color:#fff;border-color:#16a34a':''}" onclick="proCompSetThirdWinner('${tn.id}','A')">${(tp.a||'A').slice(0,4)} 승(3위)</button>
          <button class="btn btn-xs" style="flex:1;font-size:9px;${tpB?'background:#16a34a;color:#fff;border-color:#16a34a':''}" onclick="proCompSetThirdWinner('${tn.id}','B')">${(tp.b||'B').slice(0,4)} 승(3위)</button>
          <button class="btn btn-xs" style="font-size:9px;padding:0 5px" onclick="proCompSetThirdDate('${tn.id}')" title="날짜 입력">📅</button>
          <button class="btn btn-xs" style="font-size:9px;padding:0 5px" onclick="proCompSetThirdMap('${tn.id}')" title="맵 입력">📍</button>
        </div>`:''}
      </div>
    </div>`;
  }
  if (isLoggedIn) h += `<div style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap">
    ${rounds.length >= 2 && !tn.thirdPlace ? `<button class="btn btn-w btn-sm" onclick="proCompAddThirdPlace('${tn.id}')">🥉 3·4위전 추가</button>` : ''}
    ${rounds.length >= 2 && tn.thirdPlace ? `<button class="btn btn-w btn-sm" onclick="proCompRemoveThirdPlace('${tn.id}')">🥉 3·4위전 제거</button>` : ''}
    <button class="btn btn-r btn-sm" onclick="proCompResetBracket('${tn.id}')">🔄 대진표 초기화</button>
  </div>`;
  return h;
}

/* ──────────────────────────────────────
   대진표 초기화 (그룹 순위 기반)
────────────────────────────────────── */
function proCompInitBracket(tnId) {
  const tn = proTourneys.find(t=>t.id===tnId);
  if (!tn) return;
  // 각 조 1,2위 추출
  const seeds = [];
  tn.groups.forEach(grp => {
    const ranks = _calcProGrpRank(grp);
    if (ranks[0]) seeds.push(ranks[0].name);
    if (ranks[1]) seeds.push(ranks[1].name);
  });
  if (seeds.length < 2) { alert('대진표 생성을 위해 각 조에 선수가 필요합니다.'); return; }
  // 올림으로 2의 거듭제곱 맞춤
  let sz = 2;
  while (sz < seeds.length) sz *= 2;
  while (seeds.length < sz) seeds.push('');
  // 1라운드 매치
  const firstRound = [];
  for (let i=0; i<sz; i+=2) firstRound.push({a:seeds[i], b:seeds[i+1], winner:''});
  // 이후 라운드 빈 대진
  const rounds = [firstRound];
  let cur = firstRound.length;
  while (cur > 1) {
    cur = Math.floor(cur/2);
    const rnd = [];
    for (let i=0; i<cur; i++) rnd.push({a:'', b:'', winner:''});
    rounds.push(rnd);
  }
  tn.bracket = rounds;
  save(); render();
}

function proCompSetBktWinner(tnId, ri, mi, winner) {
  const tn = proTourneys.find(t=>t.id===tnId);
  if (!tn||!tn.bracket||!tn.bracket[ri]) return;
  const m = tn.bracket[ri][mi];
  if (!m) return;
  const prevWinner = m.winner;
  m.winner = m.winner===winner ? '' : winner;
  const nextMi = Math.floor(mi/2);
  const isA = mi%2===0;
  if (tn.bracket[ri+1]&&tn.bracket[ri+1][nextMi]) {
    const next = tn.bracket[ri+1][nextMi];
    if (m.winner) {
      // 승자 전파
      const wName = m.winner==='A'?m.a:m.b;
      if (isA) next.a=wName; else next.b=wName;
    } else {
      // 승자 취소 시 다음 라운드 해당 슬롯 초기화 + 이후 라운드 연쇄 초기화
      if (isA) next.a=''; else next.b='';
      next.winner='';
      // 이후 라운드 연쇄 초기화
      let curMi=nextMi;
      for (let r=ri+2; r<tn.bracket.length; r++) {
        const nxt2Mi=Math.floor(curMi/2);
        const isA2=curMi%2===0;
        if (!tn.bracket[r]||!tn.bracket[r][nxt2Mi]) break;
        if (isA2) tn.bracket[r][nxt2Mi].a=''; else tn.bracket[r][nxt2Mi].b='';
        tn.bracket[r][nxt2Mi].winner='';
        curMi=nxt2Mi;
      }
    }
  }
  // 준결승 패자 → 3위전 자동 배정 (3위전이 추가된 경우에만)
  const semiRi = tn.bracket.length - 2;
  if (tn.thirdPlace && ri === semiRi && tn.bracket.length >= 2 && (mi === 0 || mi === 1)) {
    const thirdKey = `pbn_${tnId}_3rd`;
    if (tn.thirdPlace.winner) _revertProMatch(thirdKey);
    tn.thirdPlace.winner = '';
    const loser = m.winner==='A'?m.b:(m.winner==='B'?m.a:'');
    if (mi === 0) tn.thirdPlace.a = loser;
    else tn.thirdPlace.b = loser;
  }
  // player history 반영
  const bktMatchId = `pbn_${tnId}_${ri}_${mi}`;
  if (prevWinner && m.a && m.b) _revertProMatch(bktMatchId);
  if (m.winner && m.a && m.b) {
    const d = m.d||new Date().toISOString().slice(0,10);
    applyGameResult(m.winner==='A'?m.a:m.b, m.winner==='A'?m.b:m.a, d, m.map||'', bktMatchId, '', '', '프로리그대회');
  }
  // ttM 기록 처리
  const proKey = `ptn_${tnId}_${ri}_${mi}`;
  const existIdx = ttM.findIndex(r=>r._proKey===proKey);
  if (existIdx>=0) ttM.splice(existIdx,1);
  if (m.winner && m.a && m.b) {
    const totalRounds = tn.bracket.length;
    let rLabel;
    if (ri===totalRounds-1) rLabel='결승';
    else if (ri===totalRounds-2) rLabel='준결승';
    else if (ri===totalRounds-3) rLabel='4강';
    else rLabel=`${Math.pow(2,totalRounds-ri)}강`;
    const pa=players.find(p=>p.name===m.a)||{name:m.a};
    const pb=players.find(p=>p.name===m.b)||{name:m.b};
    ttM.unshift({
      _id:Date.now().toString(36)+Math.random().toString(36).slice(2,6),
      _proKey:proKey,
      d:new Date().toISOString().slice(0,10),
      a:m.a, b:m.b, winner:m.winner,
      map:m.map||'',
      sa:m.winner==='A'?1:0, sb:m.winner==='B'?1:0,
      compName:tn.name, n:tn.name, t:rLabel,
      tierLabel:'프로리그토너먼트',
      _bktRound:rLabel,
      noSetMode:true,
      teamALabel:m.a, teamBLabel:m.b,
      teamAMembers:[{name:pa.name,univ:pa.univ||'',race:pa.race||'',tier:pa.tier||''}],
      teamBMembers:[{name:pb.name,univ:pb.univ||'',race:pb.race||'',tier:pb.tier||''}],
      sets:[{scoreA:m.winner==='A'?1:0,scoreB:m.winner==='B'?1:0,winner:m.winner,
        games:[{playerA:m.a,playerB:m.b,winner:m.winner,map:m.map||''}]}]
    });
  }
  save(); render();
}

function proCompBktSetDate(tnId, ri, mi) {
  const tn = proTourneys.find(t=>t.id===tnId);
  if (!tn||!tn.bracket||!tn.bracket[ri]) return;
  const m = tn.bracket[ri][mi];
  if (!m) return;
  const modal = document.createElement('div');
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:9999;display:flex;align-items:center;justify-content:center';
  modal.innerHTML = `<div style="background:var(--white);border-radius:14px;padding:20px;min-width:240px;box-shadow:0 8px 32px rgba(0,0,0,.2)">
    <div style="font-weight:900;font-size:14px;margin-bottom:14px">📅 날짜 입력</div>
    <input id="_bktDateInp" type="date" value="${m.d||''}" style="width:100%;padding:8px;border-radius:8px;border:1px solid var(--border);box-sizing:border-box;margin-bottom:14px">
    <div style="display:flex;gap:8px">
      <button class="btn btn-b" style="flex:1" onclick="(function(){const v=document.getElementById('_bktDateInp').value;const t2=proTourneys.find(t=>t.id==='${tnId}');if(t2&&t2.bracket&&t2.bracket[${ri}]&&t2.bracket[${ri}][${mi}])t2.bracket[${ri}][${mi}].d=v;document.body.removeChild(document.getElementById('_bktDateModal'));save();render();})()">저장</button>
      <button class="btn btn-w" style="flex:1" onclick="document.body.removeChild(document.getElementById('_bktDateModal'))">취소</button>
    </div>
  </div>`;
  modal.id = '_bktDateModal';
  document.body.appendChild(modal);
}

function proCompBktSetMap(tnId, ri, mi) {
  const tn = proTourneys.find(t=>t.id===tnId);
  if (!tn||!tn.bracket||!tn.bracket[ri]) return;
  const m = tn.bracket[ri][mi];
  if (!m) return;
  const map = prompt('맵을 입력하세요:', m.map||'');
  if (map===null) return;
  m.map = map.trim();
  save(); render();
}

function proCompBktEditPlayers(tnId, ri, mi) {
  const tn = proTourneys.find(t=>t.id===tnId);
  if (!tn||!tn.bracket||!tn.bracket[ri]) return;
  const m = tn.bracket[ri][mi];
  if (!m) return;
  const pList = players.filter(p=>p.name).sort((a,b)=>(a.name||'').localeCompare(b.name||''));
  const pOpts = (sel) => `<option value="">— 직접 입력 —</option>` + pList.map(p=>`<option value="${p.name}"${p.name===sel?' selected':''}>${p.name}${p.univ?` (${p.univ})`:''}</option>`).join('');
  const modal = document.createElement('div');
  modal.id = '_bktEditModal';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:9999;display:flex;align-items:center;justify-content:center';
  modal.innerHTML = `<div style="background:var(--white);border-radius:14px;padding:20px;min-width:280px;box-shadow:0 8px 32px rgba(0,0,0,.2)">
    <div style="font-weight:900;font-size:14px;margin-bottom:14px">✏️ 대진표 경기 수정</div>
    <div style="margin-bottom:10px">
      <label style="font-size:11px;font-weight:700;color:var(--text3)">A 선수</label>
      <select id="_bktEditA" style="width:100%;padding:6px;border-radius:8px;border:1px solid var(--border);margin-top:4px">${pOpts(m.a||'')}</select>
      <input id="_bktEditAInp" placeholder="직접 입력" value="${pList.some(p=>p.name===m.a)?'':m.a||''}" style="width:100%;padding:6px;border-radius:8px;border:1px solid var(--border);margin-top:4px;box-sizing:border-box;font-size:12px">
    </div>
    <div style="margin-bottom:10px">
      <label style="font-size:11px;font-weight:700;color:var(--text3)">B 선수</label>
      <select id="_bktEditB" style="width:100%;padding:6px;border-radius:8px;border:1px solid var(--border);margin-top:4px">${pOpts(m.b||'')}</select>
      <input id="_bktEditBInp" placeholder="직접 입력" value="${pList.some(p=>p.name===m.b)?'':m.b||''}" style="width:100%;padding:6px;border-radius:8px;border:1px solid var(--border);margin-top:4px;box-sizing:border-box;font-size:12px">
    </div>
    <div style="margin-bottom:10px">
      <label style="font-size:11px;font-weight:700;color:var(--text3)">날짜</label>
      <input id="_bktEditD" type="date" value="${m.d||''}" style="width:100%;padding:6px;border-radius:8px;border:1px solid var(--border);margin-top:4px;box-sizing:border-box">
    </div>
    <div style="margin-bottom:14px">
      <label style="font-size:11px;font-weight:700;color:var(--text3)">맵</label>
      <input id="_bktEditMap" value="${m.map||''}" placeholder="선택 입력" style="width:100%;padding:6px;border-radius:8px;border:1px solid var(--border);margin-top:4px;box-sizing:border-box;font-size:12px">
    </div>
    <div style="display:flex;gap:8px">
      <button class="btn btn-b" style="flex:1" onclick="(function(){
        const aV=(document.getElementById('_bktEditA').value||document.getElementById('_bktEditAInp').value).trim();
        const bV=(document.getElementById('_bktEditB').value||document.getElementById('_bktEditBInp').value).trim();
        const dV=document.getElementById('_bktEditD').value;
        const mapV=document.getElementById('_bktEditMap').value.trim();
        const t2=proTourneys.find(t=>t.id==='${tnId}');
        if(!t2||!t2.bracket||!t2.bracket[${ri}]||!t2.bracket[${ri}][${mi}])return;
        const m2=t2.bracket[${ri}][${mi}];
        const bktId='pbn_${tnId}_${ri}_${mi}';
        if(m2.winner)_revertProMatch(bktId);
        m2.a=aV;m2.b=bV;m2.d=dV;m2.map=mapV;m2.winner='';
        document.body.removeChild(document.getElementById('_bktEditModal'));
        save();render();
      })()">저장</button>
      <button class="btn btn-w" style="flex:1" onclick="document.body.removeChild(document.getElementById('_bktEditModal'))">취소</button>
    </div>
  </div>`;
  document.body.appendChild(modal);
}

function proCompInitBracketManual(tnId) {
  const tn = proTourneys.find(t=>t.id===tnId);
  if (!tn) return;
  const szStr = prompt('대진표 규모를 선택하세요:\n2 = 결승\n4 = 4강\n8 = 8강\n16 = 16강\n\n참가 인원 수를 입력하세요:', '4');
  if (!szStr) return;
  let sz = parseInt(szStr);
  if (isNaN(sz)||sz<2) return alert('2 이상의 숫자를 입력하세요.');
  // 올림으로 2의 거듭제곱
  let p=1; while(p<sz) p*=2; sz=p;
  const firstRound=[];
  for(let i=0;i<sz;i+=2) firstRound.push({a:'',b:'',winner:''});
  const rounds=[firstRound];
  let cur=firstRound.length;
  while(cur>1){cur=Math.floor(cur/2);const rnd=[];for(let i=0;i<cur;i++)rnd.push({a:'',b:'',winner:''});rounds.push(rnd);}
  tn.bracket=rounds;
  save(); render();
}

function proCompAddThirdPlace(tnId) {
  const tn = proTourneys.find(t=>t.id===tnId);
  if (!tn) return;
  tn.thirdPlace = {a:'', b:'', winner:'', map:''};
  // 준결승 결과가 이미 있으면 패자 자동 배정
  const semiRi = (tn.bracket||[]).length - 2;
  if (semiRi >= 0) {
    const semiRnd = tn.bracket[semiRi] || [];
    if (semiRnd[0] && semiRnd[0].winner && semiRnd[0].a && semiRnd[0].b)
      tn.thirdPlace.a = semiRnd[0].winner==='A' ? semiRnd[0].b : semiRnd[0].a;
    if (semiRnd[1] && semiRnd[1].winner && semiRnd[1].a && semiRnd[1].b)
      tn.thirdPlace.b = semiRnd[1].winner==='A' ? semiRnd[1].b : semiRnd[1].a;
  }
  save(); render();
}

function proCompRemoveThirdPlace(tnId) {
  if (!confirm('3·4위전을 제거하시겠습니까?')) return;
  const tn = proTourneys.find(t=>t.id===tnId);
  if (!tn) return;
  const thirdKey = `pbn_${tnId}_3rd`;
  if (tn.thirdPlace && tn.thirdPlace.winner) _revertProMatch(thirdKey);
  tn.thirdPlace = null;
  save(); render();
}

function proCompResetBracket(tnId) {
  if (!confirm('대진표를 초기화하시겠습니까?')) return;
  const tn = proTourneys.find(t=>t.id===tnId);
  if (!tn) return;
  tn.bracket = [];
  tn.thirdPlace = null;
  save(); render();
}

function proCompSetThirdWinner(tnId, winner) {
  const tn = proTourneys.find(t=>t.id===tnId);
  if (!tn||!tn.thirdPlace) return;
  const m = tn.thirdPlace;
  const thirdKey = `pbn_${tnId}_3rd`;
  if (m.winner) _revertProMatch(thirdKey);
  m.winner = m.winner===winner ? '' : winner;
  if (m.winner && m.a && m.b) {
    const d = m.d || new Date().toISOString().slice(0,10);
    applyGameResult(m.winner==='A'?m.a:m.b, m.winner==='A'?m.b:m.a, d, m.map||'', thirdKey, '', '', '프로리그대회');
  }
  save(); render();
}

function proCompSetThirdDate(tnId) {
  const tn = proTourneys.find(t=>t.id===tnId);
  if (!tn||!tn.thirdPlace) return;
  const modal = document.createElement('div');
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:9999;display:flex;align-items:center;justify-content:center';
  modal.id = '_thirdDateModal';
  modal.innerHTML = `<div style="background:var(--white);border-radius:14px;padding:20px;min-width:240px;box-shadow:0 8px 32px rgba(0,0,0,.2)">
    <div style="font-weight:900;font-size:14px;margin-bottom:14px">📅 3위전 날짜 입력</div>
    <input id="_thirdDateInp" type="date" value="${tn.thirdPlace.d||''}" style="width:100%;padding:8px;border-radius:8px;border:1px solid var(--border);box-sizing:border-box;margin-bottom:14px">
    <div style="display:flex;gap:8px">
      <button class="btn btn-b" style="flex:1" onclick="(function(){const v=document.getElementById('_thirdDateInp').value;const t2=proTourneys.find(t=>t.id==='${tnId}');if(t2&&t2.thirdPlace)t2.thirdPlace.d=v;document.body.removeChild(document.getElementById('_thirdDateModal'));save();render();})()">저장</button>
      <button class="btn btn-w" style="flex:1" onclick="document.body.removeChild(document.getElementById('_thirdDateModal'))">취소</button>
    </div>
  </div>`;
  document.body.appendChild(modal);
}

function proCompSetThirdMap(tnId) {
  const tn = proTourneys.find(t=>t.id===tnId);
  if (!tn||!tn.thirdPlace) return;
  const map = prompt('맵을 입력하세요:', tn.thirdPlace.map||'');
  if (map===null) return;
  tn.thirdPlace.map = map.trim();
  save(); render();
}

/* ──────────────────────────────────────
   조편성 관리
────────────────────────────────────── */
function proCompGrpEdit() {
  const tn = getCurrentProTourney();
  let h = `<div style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:15px;color:var(--blue);margin-bottom:14px">🏗️ 조편성 관리${tn?' — '+tn.name:''}</div>`;
  if (!tn) {
    h += `<div style="padding:40px;text-align:center;color:var(--gray-l)">먼저 대회를 선택하거나 생성하세요.</div>`;
    return h;
  }
  h += `<div style="display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap">
    <button class="btn btn-b btn-sm" onclick="proCompAddGrp('${tn.id}')">+ 조 추가</button>
  </div>`;
  const GL = 'ABCDEFGHIJ';
  tn.groups.forEach((grp, gi) => {
    const col = ['#2563eb','#dc2626','#16a34a','#d97706','#7c3aed','#0891b2'][gi%6];
    h += `<div style="margin-bottom:16px;border-radius:12px;overflow:hidden;border:1.5px solid ${col}44">
      <div style="padding:10px 16px;background:linear-gradient(135deg,${col},${col}cc);color:#fff;display:flex;align-items:center;gap:8px">
        <span style="font-weight:900;font-size:13px">GROUP ${GL[gi]}</span>
        <input value="${grp.name||''}" placeholder="조 이름" style="background:#fff3;border:1px solid #fff5;border-radius:6px;padding:3px 8px;font-size:12px;color:#fff;width:120px"
          onchange="proCompRenameGrp('${tn.id}',${gi},this.value)">
        <button class="btn btn-r btn-xs" style="margin-left:auto" onclick="proCompDelGrp('${tn.id}',${gi})">🗑️ 조 삭제</button>
      </div>
      <div style="padding:12px 16px;background:var(--white)">
        <div style="font-size:11px;font-weight:700;color:var(--text3);margin-bottom:8px">선수 목록 (${(grp.players||[]).length}명)</div>
        <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px">
          ${(grp.players||[]).map((p,pi)=>`<div style="display:flex;align-items:center;gap:4px;padding:4px 10px;background:var(--surface);border-radius:20px;border:1px solid var(--border)">
            <span style="font-size:12px;font-weight:600">${p}</span>
            <button onclick="proCompRemovePlayer('${tn.id}',${gi},${pi})" style="background:none;border:none;cursor:pointer;color:var(--gray-l);font-size:12px;padding:0;line-height:1">✕</button>
          </div>`).join('')}
          ${!(grp.players||[]).length?`<span style="color:var(--gray-l);font-size:12px">아직 선수가 없습니다</span>`:''}
        </div>
        <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap">
          <input id="proAddP_${gi}" placeholder="선수 이름 검색" style="padding:6px 10px;border-radius:8px;border:1px solid var(--border);font-size:12px;width:160px"
            oninput="proCompSearchPlayerSug('${tn.id}',${gi})">
          <button class="btn btn-b btn-sm" onclick="proCompAddPlayerManual('${tn.id}',${gi})">+ 추가</button>
        </div>
        <div id="proSug_${gi}" style="display:flex;flex-wrap:wrap;gap:4px;margin-top:6px"></div>
        <div style="margin-top:12px;border-top:1px solid var(--border);padding-top:10px">
          <div style="font-size:11px;font-weight:700;color:var(--text3);margin-bottom:8px">경기 목록 (${(grp.matches||[]).length}경기)</div>
          ${(grp.matches||[]).map((m,mi)=>`<div style="display:flex;align-items:center;gap:8px;padding:6px 10px;background:var(--surface);border-radius:8px;margin-bottom:4px;font-size:12px">
            <span style="font-weight:600">${m.a||'?'}</span>
            <span style="color:var(--gray-l)">vs</span>
            <span style="font-weight:600">${m.b||'?'}</span>
            ${m.winner?`<span style="font-size:10px;background:#dcfce7;color:#16a34a;padding:1px 6px;border-radius:10px;font-weight:700">${m.winner==='A'?m.a:m.b} 승</span>`:'<span style="font-size:10px;color:var(--gray-l)">미완료</span>'}
            ${m.d?`<span style="font-size:10px;color:var(--gray-l)">${m.d}</span>`:''}
            <button class="btn btn-b btn-xs" style="margin-left:auto" onclick="proCompEditMatch('${tn.id}',${gi},${mi})">✏️</button>
            <button class="btn btn-r btn-xs" onclick="proCompDelMatch('${tn.id}',${gi},${mi})">🗑️</button>
          </div>`).join('')}
          <div style="display:flex;gap:6px;margin-top:6px">
            <button class="btn btn-b btn-sm" onclick="proCompAddMatch('${tn.id}',${gi})">+ 경기 추가</button>
            <button class="btn btn-w btn-sm" onclick="proCompOpenPasteModal('${tn.id}',${gi})">📋 일괄 입력</button>
          </div>
        </div>
      </div>
    </div>`;
  });
  return h;
}

function proCompSearchPlayerSug(tnId, gi) {
  const input = document.getElementById(`proAddP_${gi}`);
  const sug = document.getElementById(`proSug_${gi}`);
  if (!input||!sug) return;
  const q = input.value.trim();
  if (!q) { sug.innerHTML=''; return; }
  const tn = proTourneys.find(t=>t.id===tnId);
  const already = (tn&&tn.groups[gi]&&tn.groups[gi].players)||[];
  const matched = players.filter(p=>p.name.includes(q)&&!already.includes(p.name)).slice(0,8);
  sug.innerHTML = matched.map(p=>`<button onclick="proCompAddPlayer('${tnId}',${gi},'${p.name.replace(/'/g,"\\'")}',document.getElementById('proAddP_${gi}'))"
    style="padding:4px 10px;border-radius:12px;border:1px solid var(--border);background:var(--white);font-size:12px;cursor:pointer;display:flex;align-items:center;gap:4px">
    ${p.photo?`<img src="${p.photo}" style="width:18px;height:18px;border-radius:50%;object-fit:cover" onerror="this.style.display='none'">`:''}
    ${p.name}
    ${p.tier?`<span style="background:${_TIER_BG[p.tier]||'#64748b'};color:${_TIER_TEXT[p.tier]||'#fff'};font-size:9px;padding:1px 4px;border-radius:3px">${p.tier}</span>`:''}
  </button>`).join('');
}

function proCompAddPlayer(tnId, gi, name, inputEl) {
  const tn = proTourneys.find(t=>t.id===tnId);
  if (!tn) return;
  if (!tn.groups[gi].players) tn.groups[gi].players = [];
  if (!tn.groups[gi].players.includes(name)) tn.groups[gi].players.push(name);
  if (inputEl) inputEl.value = '';
  const sug = document.getElementById(`proSug_${gi}`);
  if (sug) sug.innerHTML = '';
  save(); render();
}

function proCompAddPlayerManual(tnId, gi) {
  const input = document.getElementById(`proAddP_${gi}`);
  if (!input) return;
  const name = input.value.trim();
  if (!name) return;
  proCompAddPlayer(tnId, gi, name, input);
}

function proCompRemovePlayer(tnId, gi, pi) {
  const tn = proTourneys.find(t=>t.id===tnId);
  if (!tn||!tn.groups[gi]) return;
  tn.groups[gi].players.splice(pi, 1);
  save(); render();
}

/* ──────────────────────────────────────
   경기 CRUD
────────────────────────────────────── */
function proCompAddMatchOnDate(tnId, date) {
  const tn = proTourneys.find(t=>t.id===tnId);
  if (!tn || !tn.groups.length) { alert('조를 먼저 만들어 주세요.'); return; }
  if (tn.groups.length === 1) {
    proCompAddMatch(tnId, 0, date);
  } else {
    // 조 선택 팝업
    const GL = 'ABCDEFGHIJ';
    const grpOpts = tn.groups.map((g,i)=>`<option value="${i}">GROUP ${GL[i]} · ${g.name||GL[i]+'조'}</option>`).join('');
    const sel = document.createElement('div');
    sel.id = 'proGrpSelModal';
    sel.style.cssText = 'position:fixed;inset:0;background:#0008;z-index:10000;display:flex;align-items:center;justify-content:center';
    sel.innerHTML = `<div style="background:var(--white);border-radius:12px;padding:20px;width:280px;max-width:95vw;box-shadow:0 8px 32px rgba(0,0,0,.25)">
      <div style="font-weight:900;font-size:14px;margin-bottom:12px">어느 조에 추가할까요?</div>
      <select id="proGrpSelSel" style="width:100%;padding:8px;border-radius:8px;border:1px solid var(--border);margin-bottom:14px;box-sizing:border-box">${grpOpts}</select>
      <div style="display:flex;gap:8px">
        <button class="btn btn-b" style="flex:1" onclick="var _gi=parseInt(document.getElementById('proGrpSelSel').value);document.getElementById('proGrpSelModal').remove();proCompAddMatch('${tnId}',_gi,'${date}')">선택</button>
        <button class="btn btn-w" style="flex:1" onclick="document.getElementById('proGrpSelModal').remove()">취소</button>
      </div>
    </div>`;
    document.body.appendChild(sel);
  }
}

function proCompOpenPasteModal(tnId, gi) {
  const tn = proTourneys.find(t=>t.id===tnId);
  if (!tn||!tn.groups[gi]) return;
  const modal = document.createElement('div');
  modal.id = '_pcPasteModal';
  modal.style.cssText = 'position:fixed;inset:0;background:#0008;z-index:9999;display:flex;align-items:center;justify-content:center';
  modal.innerHTML = `<div style="background:var(--white);border-radius:16px;padding:24px;width:420px;max-width:95vw;max-height:90vh;overflow-y:auto;box-shadow:0 8px 40px rgba(0,0,0,.3)">
    <div style="font-weight:900;font-size:15px;margin-bottom:8px">📋 경기 결과 일괄 입력</div>
    <div style="font-size:11px;color:var(--text3);background:var(--surface);border-radius:8px;padding:10px;margin-bottom:12px;line-height:1.7">
      한 줄에 한 경기. 공백/탭으로 구분:<br>
      <code>[날짜] 선수A 선수B [승자]</code><br>
      승자: A / B / 선수이름 (생략 시 미정)<br>
      예) <code>2024-01-15 홍길동 이순신 A</code>
    </div>
    <div style="margin-bottom:10px">
      <label style="font-size:12px;font-weight:700;color:var(--text3)">기본 날짜</label>
      <input id="_pcPasteDate" type="date" value="${new Date().toISOString().slice(0,10)}" style="width:100%;padding:6px;border-radius:8px;border:1px solid var(--border);margin-top:4px;box-sizing:border-box">
    </div>
    <textarea id="_pcPasteText" rows="8" placeholder="홍길동 이순신 A&#10;이순신 강감찬 B&#10;강감찬 홍길동 홍길동" style="width:100%;padding:8px;border-radius:8px;border:1px solid var(--border);font-size:12px;box-sizing:border-box;font-family:monospace;resize:vertical"></textarea>
    <div style="display:flex;gap:8px;margin-top:12px">
      <button class="btn btn-b" style="flex:1" onclick="proCompSavePaste('${tnId}',${gi})">저장</button>
      <button class="btn btn-w" style="flex:1" onclick="document.getElementById('_pcPasteModal').remove()">취소</button>
    </div>
  </div>`;
  document.body.appendChild(modal);
}

function proCompSavePaste(tnId, gi) {
  const tn = proTourneys.find(t=>t.id===tnId);
  if (!tn||!tn.groups[gi]) return;
  const grp = tn.groups[gi];
  const text = (document.getElementById('_pcPasteText')||{}).value||'';
  const defDate = (document.getElementById('_pcPasteDate')||{}).value || new Date().toISOString().slice(0,10);
  document.getElementById('_pcPasteModal').remove();
  if (!text.trim()) return;
  const lines = text.trim().split('\n').map(l=>l.trim()).filter(Boolean);
  let added = 0;
  lines.forEach(line => {
    const parts = line.split(/[\s\t]+/);
    if (parts.length < 2) return;
    let d = defDate, a = '', b = '', winnerRaw = '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(parts[0])) {
      d = parts[0]; a = parts[1]||''; b = parts[2]||''; winnerRaw = parts[3]||'';
    } else {
      a = parts[0]; b = parts[1]||''; winnerRaw = parts[2]||'';
    }
    if (!a||!b||a===b) return;
    let winner = '';
    if (winnerRaw==='A') winner='A';
    else if (winnerRaw==='B') winner='B';
    else if (winnerRaw===a) winner='A';
    else if (winnerRaw===b) winner='B';
    const newMid = 'pco_'+Date.now().toString(36)+Math.random().toString(36).slice(2,5);
    if (!grp.matches) grp.matches = [];
    grp.matches.push({a,b,winner,d,map:'',_id:newMid});
    if (winner) applyGameResult(winner==='A'?a:b, winner==='A'?b:a, d, '', newMid, '', '', '프로리그대회');
    added++;
  });
  save(); render();
  if (added>0) alert(`${added}개 경기가 추가되었습니다.`);
}

function proCompAddMatch(tnId, gi, preDate) {
  const tn = proTourneys.find(t=>t.id===tnId);
  if (!tn||!tn.groups[gi]) return;
  const grp = tn.groups[gi];
  if ((grp.players||[]).length < 2) { alert('조에 선수가 2명 이상 필요합니다.'); return; }
  proCompMatchState = {tnId, gi, mi: -1}; // -1 = new match
  const pList = grp.players||[];
  const pOpts = pList.map(p=>`<option value="${p}">${p}</option>`).join('');
  const defDate = preDate || new Date().toISOString().slice(0,10);
  const modal = document.createElement('div');
  modal.id = 'proMatchModal';
  modal.style.cssText = 'position:fixed;inset:0;background:#0008;z-index:9999;display:flex;align-items:center;justify-content:center';
  modal.innerHTML = `<div style="background:var(--white);border-radius:16px;padding:24px;width:340px;max-width:95vw;box-shadow:0 8px 40px rgba(0,0,0,.3)">
    <div style="font-weight:900;font-size:15px;margin-bottom:16px">➕ 경기 추가</div>
    <div style="margin-bottom:10px">
      <label style="font-size:12px;font-weight:700;color:var(--text3)">A 선수</label>
      <select id="pm_a" style="width:100%;padding:8px;border-radius:8px;border:1px solid var(--border);margin-top:4px;box-sizing:border-box">
        <option value="">선수 선택</option>${pOpts}
      </select>
    </div>
    <div style="margin-bottom:10px">
      <label style="font-size:12px;font-weight:700;color:var(--text3)">B 선수</label>
      <select id="pm_b" style="width:100%;padding:8px;border-radius:8px;border:1px solid var(--border);margin-top:4px;box-sizing:border-box">
        <option value="">선수 선택</option>${pOpts}
      </select>
    </div>
    <div style="margin-bottom:10px">
      <label style="font-size:12px;font-weight:700;color:var(--text3)">날짜</label>
      <input id="pm_d" type="date" value="${defDate}" style="width:100%;padding:8px;border-radius:8px;border:1px solid var(--border);margin-top:4px;box-sizing:border-box">
    </div>
    <div style="margin-bottom:10px">
      <label style="font-size:12px;font-weight:700;color:var(--text3)">맵 (선택)</label>
      <input id="pm_map" placeholder="선택입력" style="width:100%;padding:8px;border-radius:8px;border:1px solid var(--border);margin-top:4px;box-sizing:border-box">
    </div>
    <div style="margin-bottom:16px">
      <label style="font-size:12px;font-weight:700;color:var(--text3)">승자 (예정 경기면 미정 선택)</label>
      <div style="display:flex;gap:8px;margin-top:6px">
        <button id="pm_winA" class="btn btn-w" style="flex:1" onclick="document.getElementById('pm_winA').className='btn btn-b';document.getElementById('pm_winB').className='btn btn-w';document.getElementById('pm_winNone').className='btn btn-w'">A 승</button>
        <button id="pm_winB" class="btn btn-w" style="flex:1" onclick="document.getElementById('pm_winB').className='btn btn-b';document.getElementById('pm_winA').className='btn btn-w';document.getElementById('pm_winNone').className='btn btn-w'">B 승</button>
        <button id="pm_winNone" class="btn btn-b" style="flex:1" onclick="document.getElementById('pm_winNone').className='btn btn-b';document.getElementById('pm_winA').className='btn btn-w';document.getElementById('pm_winB').className='btn btn-w'">미정</button>
      </div>
    </div>
    <div style="display:flex;gap:8px">
      <button class="btn btn-b" style="flex:1" onclick="proCompSaveMatch()">추가</button>
      <button class="btn btn-w" style="flex:1" onclick="document.getElementById('proMatchModal').remove()">취소</button>
    </div>
  </div>`;
  document.body.appendChild(modal);
}

function proCompEditMatch(tnId, gi, mi) {
  const tn = proTourneys.find(t=>t.id===tnId);
  if (!tn||!tn.groups[gi]) return;
  const m = tn.groups[gi].matches[mi];
  if (!m) return;
  proCompMatchState = {tnId, gi, mi};
  const pList = (tn.groups[gi].players||[]);
  const pOptsA = pList.map(p=>`<option value="${p}"${m.a===p?' selected':''}>${p}</option>`).join('');
  const pOptsB = pList.map(p=>`<option value="${p}"${m.b===p?' selected':''}>${p}</option>`).join('');
  const modal = document.createElement('div');
  modal.id = 'proMatchModal';
  modal.style.cssText = 'position:fixed;inset:0;background:#0008;z-index:9999;display:flex;align-items:center;justify-content:center';
  modal.innerHTML = `<div style="background:var(--white);border-radius:16px;padding:24px;width:340px;max-width:95vw;box-shadow:0 8px 40px rgba(0,0,0,.3)">
    <div style="font-weight:900;font-size:15px;margin-bottom:16px">✏️ 경기 결과 입력</div>
    <div style="margin-bottom:10px">
      <label style="font-size:12px;font-weight:700;color:var(--text3)">A 선수</label>
      ${pList.length>=2
        ?`<select id="pm_a" style="width:100%;padding:8px;border-radius:8px;border:1px solid var(--border);margin-top:4px;box-sizing:border-box"><option value="">선수 선택</option>${pOptsA}</select>`
        :`<input id="pm_a" value="${m.a||''}" style="width:100%;padding:8px;border-radius:8px;border:1px solid var(--border);margin-top:4px;box-sizing:border-box">`}
    </div>
    <div style="margin-bottom:10px">
      <label style="font-size:12px;font-weight:700;color:var(--text3)">B 선수</label>
      ${pList.length>=2
        ?`<select id="pm_b" style="width:100%;padding:8px;border-radius:8px;border:1px solid var(--border);margin-top:4px;box-sizing:border-box"><option value="">선수 선택</option>${pOptsB}</select>`
        :`<input id="pm_b" value="${m.b||''}" style="width:100%;padding:8px;border-radius:8px;border:1px solid var(--border);margin-top:4px;box-sizing:border-box">`}
    </div>
    <div style="margin-bottom:10px">
      <label style="font-size:12px;font-weight:700;color:var(--text3)">승자</label>
      <div style="display:flex;gap:8px;margin-top:6px">
        <button id="pm_winA" class="btn ${m.winner==='A'?'btn-b':'btn-w'}" style="flex:1" onclick="document.getElementById('pm_winA').className='btn btn-b';document.getElementById('pm_winB').className='btn btn-w';document.getElementById('pm_winNone').className='btn btn-w'">A 승</button>
        <button id="pm_winB" class="btn ${m.winner==='B'?'btn-b':'btn-w'}" style="flex:1" onclick="document.getElementById('pm_winB').className='btn btn-b';document.getElementById('pm_winA').className='btn btn-w';document.getElementById('pm_winNone').className='btn btn-w'">B 승</button>
        <button id="pm_winNone" class="btn ${!m.winner?'btn-b':'btn-w'}" style="flex:1" onclick="document.getElementById('pm_winNone').className='btn btn-b';document.getElementById('pm_winA').className='btn btn-w';document.getElementById('pm_winB').className='btn btn-w'">미정</button>
      </div>
    </div>
    <div style="margin-bottom:10px">
      <label style="font-size:12px;font-weight:700;color:var(--text3)">날짜</label>
      <input id="pm_d" type="date" value="${m.d||''}" style="width:100%;padding:8px;border-radius:8px;border:1px solid var(--border);margin-top:4px;box-sizing:border-box">
    </div>
    <div style="margin-bottom:16px">
      <label style="font-size:12px;font-weight:700;color:var(--text3)">맵</label>
      <input id="pm_map" value="${m.map||''}" placeholder="선택입력" style="width:100%;padding:8px;border-radius:8px;border:1px solid var(--border);margin-top:4px;box-sizing:border-box">
    </div>
    <div style="display:flex;gap:8px">
      <button class="btn btn-b" style="flex:1" onclick="proCompSaveMatch()">저장</button>
      <button class="btn btn-w" style="flex:1" onclick="document.getElementById('proMatchModal').remove()">취소</button>
    </div>
  </div>`;
  document.body.appendChild(modal);
}

function _revertProMatch(matchId) {
  if (!matchId) return;
  players.forEach(p => {
    if (!p.history) return;
    const h = p.history.find(x => x.matchId === matchId);
    if (!h) return;
    if (h.result === '승') { p.win = Math.max(0,(p.win||0)-1); p.points = (p.points||0)-3; }
    else { p.loss = Math.max(0,(p.loss||0)-1); p.points = (p.points||0)+3; }
    p.elo = (p.elo||1200) - h.eloDelta;
    p.history = p.history.filter(x => x.matchId !== matchId);
  });
}

function proCompSaveMatch() {
  const {tnId, gi, mi} = proCompMatchState;
  const tn = proTourneys.find(t=>t.id===tnId);
  if (!tn||!tn.groups[gi]) return;
  const aVal = document.getElementById('pm_a').value.trim();
  const bVal = document.getElementById('pm_b').value.trim();
  if (!aVal || !bVal) { alert('A, B 선수를 모두 선택하세요.'); return; }
  const winA = document.getElementById('pm_winA').classList.contains('btn-b');
  const winB = document.getElementById('pm_winB').classList.contains('btn-b');
  const winVal = winA?'A':winB?'B':'';
  const dVal = document.getElementById('pm_d').value;
  const mapVal = document.getElementById('pm_map').value.trim();
  if (mi === -1) {
    // 새 경기 추가
    if (!tn.groups[gi].matches) tn.groups[gi].matches = [];
    const newMid = 'pco_'+Date.now().toString(36)+Math.random().toString(36).slice(2,5);
    tn.groups[gi].matches.push({a:aVal, b:bVal, winner:winVal, d:dVal, map:mapVal, _id:newMid});
    if (winVal) applyGameResult(winVal==='A'?aVal:bVal, winVal==='A'?bVal:aVal, dVal, mapVal, newMid, '', '', '프로리그대회');
  } else {
    const m = tn.groups[gi].matches[mi];
    if (!m) return;
    if (!m._id) m._id = 'pco_'+Date.now().toString(36)+Math.random().toString(36).slice(2,5);
    if (m.winner) _revertProMatch(m._id);
    m.a = aVal; m.b = bVal; m.d = dVal; m.map = mapVal; m.winner = winVal;
    if (winVal) applyGameResult(winVal==='A'?aVal:bVal, winVal==='A'?bVal:aVal, dVal, mapVal, m._id, '', '', '프로리그대회');
  }
  document.getElementById('proMatchModal').remove();
  save(); render();
}

function proCompDelMatch(tnId, gi, mi) {
  if (!confirm('경기를 삭제하시겠습니까?')) return;
  const tn = proTourneys.find(t=>t.id===tnId);
  if (!tn||!tn.groups[gi]) return;
  const m = tn.groups[gi].matches[mi];
  if (m && m.winner && m._id) _revertProMatch(m._id);
  tn.groups[gi].matches.splice(mi, 1);
  save(); render();
}

/* ──────────────────────────────────────
   대회 CRUD
────────────────────────────────────── */
function proCompNewTourney() {
  const name = prompt('새 대회 이름을 입력하세요', '');
  if (!name || !name.trim()) return;
  const id = 'ptn_' + Date.now();
  proTourneys.push({id, name:name.trim(), groups:[], bracket:[], createdAt:new Date().toISOString().slice(0,10)});
  curProComp = name.trim();
  proCompSub = 'grpedit'; // 생성 후 조편성 관리로 자동 이동
  save(); render();
}

function proCompRenameTourney() {
  const tn = getCurrentProTourney();
  if (!tn) return;
  const name = prompt('새 대회 이름', tn.name);
  if (!name || !name.trim()) return;
  if (curProComp === tn.name) curProComp = name.trim();
  tn.name = name.trim();
  save(); render();
}

function proCompDelTourney() {
  const tn = getCurrentProTourney();
  if (!tn) return;
  if (!confirm(`"${tn.name}" 대회를 삭제하시겠습니까?`)) return;
  const idx = proTourneys.findIndex(t=>t.id===tn.id);
  if (idx>=0) proTourneys.splice(idx, 1);
  curProComp = proTourneys[0]?.name || '';
  save(); render();
}

function proCompAddGrp(tnId) {
  const tn = proTourneys.find(t=>t.id===tnId);
  if (!tn) return;
  const GL = 'ABCDEFGHIJ';
  const name = GL[tn.groups.length] + '조';
  tn.groups.push({name, players:[], matches:[]});
  save(); render();
}

function proCompRenameGrp(tnId, gi, name) {
  const tn = proTourneys.find(t=>t.id===tnId);
  if (!tn||!tn.groups[gi]) return;
  tn.groups[gi].name = name;
  save();
}

function proCompDelGrp(tnId, gi) {
  const tn = proTourneys.find(t=>t.id===tnId);
  if (!tn) return;
  if (!confirm('이 조를 삭제하시겠습니까?')) return;
  tn.groups.splice(gi, 1);
  save(); render();
}

/* ──────────────────────────────────────
   대회 통계 (Feature 3 + 2)
────────────────────────────────────── */
function proCompTourneyStats(tn) {
  if (!tn) return `<div style="padding:30px;text-align:center;color:var(--gray-l)">대회를 선택하세요.</div>`;
  // 전적 자동 동기화 (알림 없이)
  _proCompSyncSilent();
  // 전체 경기 수집 (조별리그 + 대진표 + 3위전)
  const allM = [];
  tn.groups.forEach(grp => (grp.matches||[]).forEach(m => allM.push(m)));
  (tn.bracket||[]).forEach(rnd => rnd.forEach(m => { if(m&&m.a&&m.b&&m.a!=='TBD'&&m.b!=='TBD') allM.push(m); }));
  if (tn.thirdPlace&&tn.thirdPlace.a&&tn.thirdPlace.b&&tn.thirdPlace.a!=='TBD'&&tn.thirdPlace.b!=='TBD') allM.push(tn.thirdPlace);
  const doneM = allM.filter(m=>m.winner);
  // 팀전 게임도 allM 유사 형태로 수집 (맵/종족 통계용)
  const allTmGames = (tn.teamMatches||[]).flatMap(tm=>(tm.games||[]).map(g=>({...g, _isTmGame:true, d:tm.d||'', winner:'W'})));
  if (!allM.length && !allTmGames.length) return `<div style="padding:40px;text-align:center;color:var(--gray-l);background:var(--surface);border-radius:12px">아직 등록된 경기가 없습니다.</div>`;

  // 선수별 승/패 집계 (조별리그 + 대진표 + 3위전)
  const pSt = {};
  tn.groups.forEach(grp => {
    (grp.players||[]).forEach(p => { if(!pSt[p]) pSt[p]={w:0,l:0}; });
    (grp.matches||[]).forEach(m => {
      if (!m.a||!m.b||!m.winner) return;
      if (!pSt[m.a]) pSt[m.a]={w:0,l:0};
      if (!pSt[m.b]) pSt[m.b]={w:0,l:0};
      if (m.winner==='A'){pSt[m.a].w++;pSt[m.b].l++;}
      else {pSt[m.b].w++;pSt[m.a].l++;}
    });
  });
  (tn.bracket||[]).forEach(rnd => {
    rnd.forEach(m => {
      if (!m||!m.a||!m.b||!m.winner||m.a==='TBD'||m.b==='TBD') return;
      if (!pSt[m.a]) pSt[m.a]={w:0,l:0};
      if (!pSt[m.b]) pSt[m.b]={w:0,l:0};
      if (m.winner==='A'){pSt[m.a].w++;pSt[m.b].l++;}
      else {pSt[m.b].w++;pSt[m.a].l++;}
    });
  });
  if (tn.thirdPlace&&tn.thirdPlace.a&&tn.thirdPlace.b&&tn.thirdPlace.winner&&tn.thirdPlace.a!=='TBD'&&tn.thirdPlace.b!=='TBD') {
    const tp=tn.thirdPlace;
    if (!pSt[tp.a]) pSt[tp.a]={w:0,l:0};
    if (!pSt[tp.b]) pSt[tp.b]={w:0,l:0};
    if (tp.winner==='A'){pSt[tp.a].w++;pSt[tp.b].l++;}
    else {pSt[tp.b].w++;pSt[tp.a].l++;}
  }
  // 팀전 게임 집계
  (tn.teamMatches||[]).forEach(tm => {
    (tm.games||[]).forEach(g => {
      if (!g.wName||!g.lName) return;
      if (!pSt[g.wName]) pSt[g.wName]={w:0,l:0};
      if (!pSt[g.lName]) pSt[g.lName]={w:0,l:0};
      pSt[g.wName].w++; pSt[g.lName].l++;
    });
  });
  const pArr = Object.entries(pSt).map(([name,s])=>({name,...s,total:s.w+s.l,rate:s.w+s.l?Math.round(s.w/(s.w+s.l)*100):0})).filter(p=>p.total>0).sort((a,b)=>b.w-a.w||b.rate-a.rate);

  // 맵 통계
  const mapSt = {};
  doneM.forEach(m => {
    if (!m.map) return;
    if (!mapSt[m.map]) mapSt[m.map]={total:0,aWin:0,bWin:0};
    mapSt[m.map].total++;
    if (m.winner==='A') mapSt[m.map].aWin++;
    else mapSt[m.map].bWin++;
  });
  const mapArr = Object.entries(mapSt).sort((a,b)=>b[1].total-a[1].total);

  // 종족 통계
  const raceSt = {};
  doneM.forEach(m => {
    const pa = players.find(p=>p.name===m.a);
    const pb = players.find(p=>p.name===m.b);
    const ra = pa?.race||'?'; const rb = pb?.race||'?';
    if (!raceSt[ra]) raceSt[ra]={pick:0,w:0,l:0};
    if (!raceSt[rb]) raceSt[rb]={pick:0,w:0,l:0};
    raceSt[ra].pick++; raceSt[rb].pick++;
    if (m.winner==='A'){raceSt[ra].w++;raceSt[rb].l++;}
    else {raceSt[rb].w++;raceSt[ra].l++;}
  });

  let h = `<div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;flex-wrap:wrap">
    <div style="font-weight:900;font-size:15px;color:var(--blue)">📈 ${tn.name} — 대회 통계</div>
    ${isLoggedIn?`<button class="btn btn-w btn-xs no-export" onclick="proCompSyncHistory()" title="기존 경기 결과를 스트리머 전적에 반영">🔄 전적 동기화</button>`:''}
  </div>`;

  // 선수 성적 TOP
  h += `<div style="margin-bottom:20px;border-radius:12px;overflow:hidden;border:1px solid var(--border)">
    <div style="padding:10px 16px;background:linear-gradient(135deg,#2563eb,#1d4ed8);color:#fff;font-weight:900;font-size:13px">🏆 선수별 성적</div>
    <table style="width:100%;border-collapse:collapse;font-size:13px">
      <thead><tr style="background:#2563eb11">
        <th style="padding:8px 12px;text-align:center;width:40px;color:var(--text3)">순위</th>
        <th style="padding:8px 12px;text-align:left;color:var(--text3)">선수</th>
        <th style="padding:8px 12px;text-align:center;color:var(--text3)">승</th>
        <th style="padding:8px 12px;text-align:center;color:var(--text3)">패</th>
        <th style="padding:8px 12px;text-align:center;color:var(--text3)">승률</th>
      </tr></thead><tbody>`;
  pArr.slice(0,10).forEach((r,idx)=>{
    const medal = idx===0?'🥇':idx===1?'🥈':idx===2?'🥉':'';
    const p = players.find(x=>x.name===r.name);
    const photo = p&&p.photo?`<img src="${p.photo}" style="width:28px;height:28px;border-radius:50%;object-fit:cover;margin-right:6px;vertical-align:middle" onerror="this.style.display='none'">`:'';
    const rb = p&&p.race?`<span class="rbadge r${p.race}" style="font-size:9px;padding:0 3px">${p.race}</span>`:'';
    const tb = p&&p.tier?`<span style="background:${_TIER_BG[p.tier]||'#64748b'};color:${_TIER_TEXT[p.tier]||'#fff'};font-size:9px;font-weight:700;padding:1px 4px;border-radius:3px">${p.tier}</span>`:'';
    h += `<tr style="border-top:1px solid var(--border);${idx===0?'background:#2563eb08':''}">
      <td style="padding:8px 12px;text-align:center;font-size:16px">${medal||idx+1}</td>
      <td style="padding:8px 10px"><div style="display:flex;align-items:center;gap:4px">${photo}<span style="font-weight:${idx<2?'800':'600'};cursor:pointer;color:var(--blue)" onclick="openPlayerModal('${r.name.replace(/'/g,"\\'")}')">${r.name}</span>${rb}${tb}</div></td>
      <td style="padding:8px 12px;text-align:center;font-weight:700;color:#16a34a">${r.w}</td>
      <td style="padding:8px 12px;text-align:center;color:var(--red)">${r.l}</td>
      <td style="padding:8px 12px;text-align:center;font-weight:700">${r.rate}%</td>
    </tr>`;
  });
  h += `</tbody></table></div>`;

  // 맵 통계
  if (mapArr.length) {
    h += `<div style="margin-bottom:20px;border-radius:12px;overflow:hidden;border:1px solid var(--border)">
      <div style="padding:10px 16px;background:linear-gradient(135deg,#7c3aed,#6d28d9);color:#fff;font-weight:900;font-size:13px">📍 맵 통계 (완료 경기 ${doneM.filter(m=>m.map).length}/${doneM.length})</div>
      <table style="width:100%;border-collapse:collapse;font-size:13px">
        <thead><tr style="background:#7c3aed11">
          <th style="padding:8px 12px;text-align:left;color:var(--text3)">맵</th>
          <th style="padding:8px 12px;text-align:center;color:var(--text3)">사용횟수</th>
          <th style="padding:8px 12px;text-align:center;color:var(--text3)">비율</th>
        </tr></thead><tbody>`;
    const totalMapGames = mapArr.reduce((s,[,v])=>s+v.total,0);
    mapArr.forEach(([map,s])=>{
      const pct = totalMapGames ? Math.round(s.total/totalMapGames*100) : 0;
      h += `<tr style="border-top:1px solid var(--border)">
        <td style="padding:8px 12px;font-weight:600">📍 ${map}</td>
        <td style="padding:8px 12px;text-align:center">${s.total}</td>
        <td style="padding:8px 12px;text-align:center">
          <div style="display:flex;align-items:center;gap:6px">
            <div style="flex:1;height:6px;background:var(--border);border-radius:3px;min-width:60px"><div style="height:100%;width:${pct}%;background:#7c3aed;border-radius:3px"></div></div>
            <span style="font-size:11px;font-weight:700">${pct}%</span>
          </div>
        </td>
      </tr>`;
    });
    h += `</tbody></table></div>`;
  }

  // 종족 통계
  const races = Object.entries(raceSt).sort((a,b)=>b[1].pick-a[1].pick);
  if (races.length) {
    const totalPicks = races.reduce((s,[,v])=>s+v.pick,0);
    h += `<div style="margin-bottom:20px;border-radius:12px;overflow:hidden;border:1px solid var(--border)">
      <div style="padding:10px 16px;background:linear-gradient(135deg,#dc2626,#b91c1c);color:#fff;font-weight:900;font-size:13px">⚔️ 종족 통계</div>
      <div style="padding:12px 16px;display:flex;gap:12px;flex-wrap:wrap">`;
    const raceColor = {T:'#2563eb', Z:'#7c3aed', P:'#16a34a', R:'#d97706'};
    races.forEach(([race,s])=>{
      const pickPct = totalPicks ? Math.round(s.pick/totalPicks*100) : 0;
      const winRate = s.pick ? Math.round(s.w/s.pick*100) : 0;
      const col = raceColor[race]||'#64748b';
      h += `<div style="flex:1;min-width:120px;padding:12px;background:${col}11;border:1.5px solid ${col}44;border-radius:10px;text-align:center">
        <div style="font-weight:900;font-size:16px;color:${col}">${race}</div>
        <div style="font-size:11px;color:var(--gray-l);margin-top:2px">픽률 ${pickPct}%</div>
        <div style="font-size:12px;font-weight:700;color:${col};margin-top:4px">${s.w}승 ${s.l}패</div>
        <div style="font-size:11px;color:var(--gray-l)">승률 ${winRate}%</div>
      </div>`;
    });
    h += `</div></div>`;
  }

  return h;
}

/* ──────────────────────────────────────
   조별 순위 인쇄 저장 (Feature 4)
────────────────────────────────────── */
function proCompPrintRank() {
  const tn = getCurrentProTourney();
  if (!tn) return;
  const GL = 'ABCDEFGHIJ';
  let body = `<style>body{font-family:'Noto Sans KR',sans-serif;margin:20px}table{width:100%;border-collapse:collapse;margin-bottom:20px}th,td{border:1px solid #ddd;padding:8px 12px;text-align:left}th{background:#f0f4ff;font-weight:700}h1{color:#1e3a8a;font-size:20px;margin-bottom:4px}h2{color:#2563eb;font-size:14px;margin:16px 0 6px}.medal{font-size:16px}.wr{font-weight:700}.win{color:#16a34a}.loss{color:#dc2626}</style>`;
  body += `<h1>📊 ${tn.name} — 조별 순위</h1><p style="color:#888;font-size:12px">출력일: ${new Date().toLocaleDateString('ko-KR')}</p>`;
  tn.groups.forEach((grp, gi) => {
    const col = ['#2563eb','#dc2626','#16a34a','#d97706','#7c3aed','#0891b2'][gi%6];
    const ranks = _calcProGrpRank(grp);
    body += `<h2 style="color:${col}">GROUP ${GL[gi]} · ${grp.name||GL[gi]+'조'}</h2>`;
    body += `<table><thead><tr><th>순위</th><th>선수</th><th>승</th><th>패</th><th>승률</th></tr></thead><tbody>`;
    ranks.forEach((r,idx)=>{
      const total=r.w+r.l; const wr=total?Math.round(r.w/total*100):0;
      const medal=idx===0?'🥇':idx===1?'🥈':idx===2?'🥉':'';
      body+=`<tr><td class="medal">${medal||idx+1}</td><td>${r.name}</td><td class="win">${r.w}</td><td class="loss">${r.l}</td><td class="wr">${wr}%</td></tr>`;
    });
    body += `</tbody></table>`;
  });
  const w = window.open('','_blank','width=700,height=900');
  if (!w) { alert('팝업이 차단되었습니다. 팝업 허용 후 다시 시도하세요.'); return; }
  w.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${tn.name} 순위</title>${body.match(/<style>[\s\S]*<\/style>/)[0]}</head><body>${body.replace(/<style>[\s\S]*<\/style>/,'')}<script>window.onload=function(){window.print();}<\/script></body></html>`);
  w.document.close();
}

/* ══════════════════════════════════════
   통합 뷰 (Feature 7) — 일반 + 대회 통합
══════════════════════════════════════ */
function rProAll(C, T) {
  T.innerText = '🔗 프로리그 통합';
  // 일반 proM에서 경기 수집
  const proItems = [];
  proM.forEach(m => {
    proItems.push({
      d: m.d||'', type:'일반', label:`${m.teamALabel||'A팀'} vs ${m.teamBLabel||'B팀'}`,
      scoreA: m.scoreA||0, scoreB: m.scoreB||0,
      aLabel: m.teamALabel||'A팀', bLabel: m.teamBLabel||'B팀',
      note: m.n||''
    });
  });
  // 대회 proTourneys에서 경기 수집
  proTourneys.forEach(tn => {
    (tn.groups||[]).forEach(grp => {
      (grp.matches||[]).forEach(m => {
        if (!m.a||!m.b) return;
        proItems.push({
          d: m.d||'', type:'대회', label:`${m.a} vs ${m.b}`,
          winner: m.winner||'', aLabel: m.a, bLabel: m.b,
          map: m.map||'', note: tn.name
        });
      });
    });
    (tn.bracket||[]).forEach((rnd, ri) => {
      const totalRounds = (tn.bracket||[]).length;
      const rLabel = ri===totalRounds-1?'결승':ri===totalRounds-2?'준결승':ri===totalRounds-3?'4강':`${Math.pow(2,totalRounds-ri)}강`;
      (rnd||[]).forEach(m => {
        if (!m.a||!m.b||m.a==='TBD'||m.b==='TBD') return;
        proItems.push({
          d: m.d||'', type:'대회', label:`${m.a} vs ${m.b}`,
          winner: m.winner||'', aLabel: m.a, bLabel: m.b,
          map: m.map||'', note: `${tn.name} ${rLabel}`
        });
      });
    });
  });
  proItems.sort((a,b)=>(b.d||'').localeCompare(a.d||''));

  // 완료 경기만 통계에 반영
  const compItems = proItems.filter(item => item.winner || item.scoreA > 0 || item.scoreB > 0);

  // 통합 선수별 승/패
  const pAll = {};
  proM.forEach(m => {
    (m.sets||[]).forEach(set=>{(set.games||[]).forEach(g=>{
      if(!g.playerA||!g.playerB||!g.winner)return;
      const w=g.winner==='A'?g.playerA:g.playerB; const l=g.winner==='A'?g.playerB:g.playerA;
      if(!pAll[w])pAll[w]={w:0,l:0,src:new Set()};if(!pAll[l])pAll[l]={w:0,l:0,src:new Set()};
      pAll[w].w++;pAll[l].l++;pAll[w].src.add('일반');pAll[l].src.add('일반');
    });});
  });
  proTourneys.forEach(tn=>{(tn.groups||[]).forEach(grp=>{(grp.matches||[]).forEach(m=>{
    if(!m.a||!m.b||!m.winner)return;
    const w=m.winner==='A'?m.a:m.b; const l=m.winner==='A'?m.b:m.a;
    if(!pAll[w])pAll[w]={w:0,l:0,src:new Set()};if(!pAll[l])pAll[l]={w:0,l:0,src:new Set()};
    pAll[w].w++;pAll[l].l++;pAll[w].src.add('대회');pAll[l].src.add('대회');
  });});});

  const pArr = Object.entries(pAll).map(([name,s])=>({name,w:s.w,l:s.l,total:s.w+s.l,rate:s.w+s.l?Math.round(s.w/(s.w+s.l)*100):0,src:[...s.src]})).filter(p=>p.total>0).sort((a,b)=>b.w-a.w||b.rate-a.rate);

  const compCnt = proTourneys.reduce((s,t)=>s+(t.groups||[]).reduce((ss,g)=>ss+(g.matches||[]).length,0),0);

  // 데이터 없음
  if (!proM.length && !compCnt) {
    C.innerHTML = `<div style="padding:60px 20px;text-align:center;background:var(--surface);border-radius:12px;border:2px dashed var(--border2)">
      <div style="font-size:44px;margin-bottom:14px">🔗</div>
      <div style="font-size:16px;font-weight:700;margin-bottom:8px">아직 프로리그 데이터가 없습니다</div>
      <div style="color:var(--gray-l);font-size:13px">🏅 일반 탭에서 경기를 입력하거나<br>🎖️ 대회 탭에서 대회를 만들고 경기를 등록하세요.</div>
    </div>`;
    return;
  }

  let h = `<div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;flex-wrap:wrap">
    <div style="font-weight:900;font-size:15px;color:var(--blue)">🔗 프로리그 통합 현황</div>
    <div style="display:flex;gap:6px;flex-wrap:wrap">
      <span style="font-size:11px;font-weight:700;padding:2px 10px;border-radius:10px;background:#dbeafe;color:#2563eb">🏅 일반 ${proM.length}경기</span>
      <span style="font-size:11px;font-weight:700;padding:2px 10px;border-radius:10px;background:#f3e8ff;color:#7c3aed">🎖️ 대회 ${compCnt}경기</span>
      <span style="font-size:11px;font-weight:700;padding:2px 10px;border-radius:10px;background:#f0fdf4;color:#16a34a">완료 ${compItems.length}경기</span>
    </div>
  </div>`;

  // 통합 선수 순위
  h += `<div style="margin-bottom:20px;border-radius:12px;overflow:hidden;border:1px solid var(--border)">
    <div style="padding:10px 16px;background:linear-gradient(135deg,#0f172a,#1e3a8a);color:#fff;font-weight:900;font-size:13px">🏆 통합 개인 순위 (승리 기준)</div>`;
  if (!pArr.length) {
    h += `<div style="padding:24px;text-align:center;color:var(--gray-l);font-size:13px">아직 완료된 경기가 없습니다.<br><span style="font-size:11px">경기 결과를 입력하면 순위가 표시됩니다.</span></div>`;
  } else {
    h += `<table style="width:100%;border-collapse:collapse;font-size:13px">
      <thead><tr style="background:#1e3a8a0f">
        <th style="padding:8px 12px;text-align:center;width:40px;color:var(--text3)">순위</th>
        <th style="padding:8px 12px;text-align:left;color:var(--text3)">선수</th>
        <th style="padding:8px 12px;text-align:center;color:var(--text3)">승</th>
        <th style="padding:8px 12px;text-align:center;color:var(--text3)">패</th>
        <th style="padding:8px 12px;text-align:center;color:var(--text3)">승률</th>
        <th style="padding:8px 12px;text-align:center;color:var(--text3)">출처</th>
      </tr></thead><tbody>`;
    pArr.slice(0,15).forEach((r,idx)=>{
      const medal=idx===0?'🥇':idx===1?'🥈':idx===2?'🥉':'';
      const p=players.find(x=>x.name===r.name);
      const photo=p&&p.photo?`<img src="${p.photo}" style="width:26px;height:26px;border-radius:50%;object-fit:cover;margin-right:5px;vertical-align:middle" onerror="this.style.display='none'">`:'';
      const rb=p&&p.race?`<span class="rbadge r${p.race}" style="font-size:9px;padding:0 3px">${p.race}</span>`:'';
      const srcBadges=r.src.map(s=>`<span style="font-size:9px;padding:1px 5px;border-radius:8px;font-weight:700;${s==='일반'?'background:#dbeafe;color:#2563eb':'background:#f3e8ff;color:#7c3aed'}">${s}</span>`).join(' ');
      h+=`<tr style="border-top:1px solid var(--border)">
        <td style="padding:8px 12px;text-align:center;font-size:16px">${medal||idx+1}</td>
        <td style="padding:8px 10px"><div style="display:flex;align-items:center;gap:4px">${photo}<span style="font-weight:${idx<2?'800':'600'}">${r.name}</span>${rb}</div></td>
        <td style="padding:8px 12px;text-align:center;font-weight:700;color:#16a34a">${r.w}</td>
        <td style="padding:8px 12px;text-align:center;color:var(--red)">${r.l}</td>
        <td style="padding:8px 12px;text-align:center;font-weight:700">${r.rate}%</td>
        <td style="padding:8px 12px;text-align:center">${srcBadges}</td>
      </tr>`;
    });
    h+=`</tbody></table>`;
  }
  h+=`</div>`;

  // 최근 통합 경기 타임라인
  h += `<div style="border-radius:12px;overflow:hidden;border:1px solid var(--border)">
    <div style="padding:10px 16px;background:linear-gradient(135deg,#475569,#334155);color:#fff;font-weight:900;font-size:13px">📅 전체 경기 목록 (총 ${proItems.length}경기)</div>`;
  if (!proItems.length) {
    h += `<div style="padding:24px;text-align:center;color:var(--gray-l);font-size:13px">등록된 경기가 없습니다.</div>`;
  } else {
    h += `<div style="padding:6px 0">`;
    proItems.slice(0,50).forEach(item=>{
      const typeBg=item.type==='일반'?'#dbeafe':'#f3e8ff';
      const typeCol=item.type==='일반'?'#2563eb':'#7c3aed';
      let result='';
      if(item.type==='일반'){
        const sa=item.scoreA||0;const sb=item.scoreB||0;
        if(sa>0||sb>0) result=`<span style="font-weight:800;color:${sa>sb?'#16a34a':'var(--text3)'}">${sa}</span><span style="color:var(--gray-l);margin:0 2px">:</span><span style="font-weight:800;color:${sb>sa?'#16a34a':'var(--text3)'}">${sb}</span>`;
        else result='<span style="color:var(--gray-l);font-size:11px">기록없음</span>';
      } else {
        result=item.winner?`<span style="font-size:11px;font-weight:700;color:#16a34a;background:#dcfce7;padding:1px 8px;border-radius:10px">${item.winner==='A'?item.aLabel:item.bLabel} 승</span>`:`<span style="font-size:11px;color:var(--gray-l);background:var(--surface);padding:1px 8px;border-radius:10px">예정</span>`;
      }
      h+=`<div style="display:flex;align-items:center;gap:8px;padding:7px 14px;border-bottom:1px solid var(--border);flex-wrap:wrap">
        <span style="font-size:10px;color:var(--gray-l);min-width:76px;white-space:nowrap">${item.d||'날짜미정'}</span>
        <span style="font-size:10px;font-weight:700;padding:1px 7px;border-radius:10px;background:${typeBg};color:${typeCol}">${item.type}</span>
        <span style="font-size:12px;font-weight:600;flex:1;min-width:0">${item.label}</span>
        <span>${result}</span>
        ${item.note?`<span style="font-size:10px;color:var(--gray-l);white-space:nowrap">${item.note}</span>`:''}
        ${item.map?`<span style="font-size:10px;color:var(--gray-l)">📍${item.map}</span>`:''}
      </div>`;
    });
    h+=`</div>`;
  }
  h+=`</div>`;
  C.innerHTML = h;
}
