/* ?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═
   ?�로리그 개인 ?�??   - proTourneys: [{id,name,groups:[{name,players:[],matches:[{a,b,winner,d,map}]}]}]
   - 조별리그 + 조별?�위 + ?�진??+ 조편?��?�??�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═ */

/* ?�?�?proTourneys ?�적 ?�기??(기존 ?�이????player.history 반영) ?�?�?*/
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
        applyGameResult(m.winner==='A'?m.a:m.b, m.winner==='A'?m.b:m.a, m.d||'', m.map||'', m._id, '', '', '?�로리그?�??);
        existing.add(m._id); cnt++;
      });
    });
    (tn.bracket||[]).forEach((rnd, ri) => {
      rnd.forEach((m, mi) => {
        if (!m.winner || !m.a || !m.b) return;
        const bktId = `pbn_${tn.id}_${ri}_${mi}`;
        if (existing.has(bktId)) return;
        applyGameResult(m.winner==='A'?m.a:m.b, m.winner==='A'?m.b:m.a, m.d||'', m.map||'', bktId, '', '', '?�로리그?�??);
        existing.add(bktId); cnt++;
      });
    });
    if (tn.thirdPlace && tn.thirdPlace.winner && tn.thirdPlace.a && tn.thirdPlace.b) {
      const thirdId = `pbn_${tn.id}_3rd`;
      if (!existing.has(thirdId)) {
        const tp = tn.thirdPlace;
        applyGameResult(tp.winner==='A'?tp.a:tp.b, tp.winner==='A'?tp.b:tp.a, tp.d||'', tp.map||'', thirdId, '', '', '?�로리그?�??);
        existing.add(thirdId); cnt++;
      }
    }
    // ?�??게임
    (tn.teamMatches||[]).forEach(tm => {
      (tm.games||[]).forEach(g => {
        if (!g.wName||!g.lName) return;
        if (!g._id) g._id = 'ptg_'+Date.now().toString(36)+Math.random().toString(36).slice(2,4);
        if (existing.has(g._id)) return;
        applyGameResult(g.wName, g.lName, tm.d||'', g.map||'', g._id, '', '', '?�로리그?�??);
        existing.add(g._id); cnt++;
      });
    });
  });
  if (cnt > 0) save();
}

function proCompSyncHistory() {
  // ?��? player.history???�는 matchId 집합
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
        applyGameResult(m.winner==='A'?m.a:m.b, m.winner==='A'?m.b:m.a, m.d||'', m.map||'', m._id, '', '', '?�로리그?�??);
        existing.add(m._id);
        cnt++;
      });
    });
    // ?�진??
    (tn.bracket||[]).forEach((rnd, ri) => {
      rnd.forEach((m, mi) => {
        if (!m.winner || !m.a || !m.b) return;
        const bktId = `pbn_${tn.id}_${ri}_${mi}`;
        if (existing.has(bktId)) return;
        applyGameResult(m.winner==='A'?m.a:m.b, m.winner==='A'?m.b:m.a, m.d||'', m.map||'', bktId, '', '', '?�로리그?�??);
        existing.add(bktId);
        cnt++;
      });
    });
    // 3?�전
    if (tn.thirdPlace && tn.thirdPlace.winner && tn.thirdPlace.a && tn.thirdPlace.b) {
      const thirdId = `pbn_${tn.id}_3rd`;
      if (!existing.has(thirdId)) {
        const tp = tn.thirdPlace;
        applyGameResult(tp.winner==='A'?tp.a:tp.b, tp.winner==='A'?tp.b:tp.a, tp.d||'', tp.map||'', thirdId, '', '', '?�로리그?�??);
        existing.add(thirdId);
        cnt++;
      }
    }
    // ?�??게임
    (tn.teamMatches||[]).forEach(tm => {
      (tm.games||[]).forEach(g => {
        if (!g.wName||!g.lName) return;
        if (!g._id) g._id = 'ptg_'+Date.now().toString(36)+Math.random().toString(36).slice(2,4);
        if (existing.has(g._id)) return;
        applyGameResult(g.wName, g.lName, tm.d||'', g.map||'', g._id, '', '', '?�로리그?�??);
        existing.add(g._id);
        cnt++;
      });
    });
  });
  // ttM???�못 ?�?�된 ?�로리그 ?�진??기록 ?�리 (_proKey ?�는 ??�� ?�거)
  const ttOrig = ttM.length;
  for (let i=ttM.length-1; i>=0; i--) { if(ttM[i]._proKey) ttM.splice(i,1); }
  const ttRemoved = ttOrig - ttM.length;
  if (cnt > 0 || ttRemoved > 0) {
    save();
    alert(`??${cnt}경기 ?�적 ?�기??{ttRemoved>0?`, ?�어?�???�염 기록 ${ttRemoved}�??�리`:''}`);
    render();
  } else alert('?��? 모두 ?�기?�되???�습?�다.');
}

var proCompSub = 'league';
var proCompFilterDate = '';
var proCompFilterGrp = '';
var proCompSortDir = 'desc';
let proCompGrpEditId = null;
let proCompMatchState = {tnId:null, gi:null, mi:null};
let proCompBktState = {tnId:null, rnd:null, mi:null, playerA:'', playerB:''};

function _findTourneyById(tnId) {
  return proTourneys.find(t=>t.id===tnId) || tourneys.find(t=>t.id===tnId);
}

function _syncBktMatchToHistory(tn, m, matchId, ri, mi) {
  if (m.winner && m.a && m.b) {
    const d = m.d || new Date().toISOString().slice(0,10);
    const mode = tn.type === 'tier' ? '티어대회' : '프로리그대회';
    applyGameResult(m.winner === 'A' ? m.a : m.b, m.winner === 'A' ? m.b : m.a, d, m.map || '', matchId, '', '', mode);

    if (tn.type === 'tier') {
      const _ei = ttM.findIndex(x => x._id === matchId);
      let rndLbl = '';
      if (ri === '3rd') {
        rndLbl = '3·4위전';
      } else {
        const totalRnd = tn.bracket.length;
        rndLbl = ri === totalRnd - 1 ? '결승' : ri === totalRnd - 2 ? '준결승' : ri === totalRnd - 3 ? '4강' : `${Math.pow(2, totalRnd - ri)}강`;
      }
      const _rec = {
        _id: matchId, _proKey: `ptn_${tn.id}_${ri}_${mi}`,
        d, a: m.a, b: m.b, sa: m.winner === 'A' ? 1 : 0, sb: m.winner === 'B' ? 1 : 0,
        sets: [{ games: [{ playerA: m.a, playerB: m.b, winner: m.winner, map: m.map || '' }], scoreA: m.winner === 'A' ? 1 : 0, scoreB: m.winner === 'B' ? 1 : 0, winner: m.winner, label: rndLbl }],
        n: tn.name, compName: tn.name, teamALabel: m.a, teamBLabel: m.b
      };
      if (_ei >= 0) ttM[_ei] = _rec; else ttM.unshift(_rec);
    }
  } else {
    const _ei = ttM.findIndex(x => x._id === matchId);
    if (_ei >= 0) ttM.splice(_ei, 1);
  }
}

function getCurrentProTourney() {
  return proTourneys.find(t=>t.name===curProComp) || proTourneys[0] || null;
}

/* ?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?
   메인 ?�더
?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?*/
function rProComp(C, T) {
  T.innerText = '?���??�로리그 ?�??;
  if (!isLoggedIn && proCompSub === 'grpedit') proCompSub = 'league';

  const tn = getCurrentProTourney();
  if (tn && !tn.groups) tn.groups = [];

  let h = `<div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;flex-wrap:wrap;padding:12px 16px;background:var(--gold-bg);border:1px solid var(--gold-b);border-radius:10px">
    <span style="font-weight:700;color:var(--gold);white-space:nowrap">?���??�???�택:</span>
    <select style="flex:1;max-width:220px;font-weight:700" onchange="curProComp=this.value;proCompFilterDate='';proCompFilterGrp='';save();render()">
      <option value="">???�?��? ?�택?�세????/option>
      ${proTourneys.map(t=>{
        const _grpD=(t.groups||[]).flatMap(g=>(g.matches||[]).map(m=>m.d));
        const _bktD=(t.bracket||[]).flat().map(m=>m&&m.d).concat(t.thirdPlace?[t.thirdPlace.d]:[]);
        const _dates=[..._grpD,..._bktD].filter(Boolean).sort();
        const _range=_dates.length?` (${_dates[0].slice(2).replace(/-/g,'.')}~${_dates[_dates.length-1].slice(2).replace(/-/g,'.')})`:t.createdAt?` (${t.createdAt.slice(2).replace(/-/g,'.')} ?�성)`:'';
        return`<option value="${t.name}"${curProComp===t.name?' selected':''}>${t.name}${_range}</option>`;
      }).join('')}
    </select>
    ${isLoggedIn?`<button class="btn btn-b btn-xs" onclick="proCompNewTourney()">+ ???�??/button>`:''}
    ${tn&&isLoggedIn?`<button class="btn btn-w btn-xs" onclick="proCompRenameTourney()" title="?�?�명 ?�정">?�️ ?�름?�정</button><button class="btn btn-r btn-xs" onclick="proCompDelTourney()" title="?�재 ?�????��">?���???��</button>`:''}
    ${tn?`<span style="font-size:11px;color:var(--gray-l)">?�� ${tn.groups.length}�?�?· ${tn.groups.reduce((s,g)=>s+(g.matches||[]).length,0)}경기</span>`:''}
  </div>`;

  const subOpts = [
    {id:'league', lbl:'?�� 조별리그 ?�정'},
    {id:'grprank', lbl:'?�� 조별 ?�위'},
    {id:'tour', lbl:'?���??�너먼트'},
    {id:'team', lbl:'?�� ?�??},
    {id:'gj', lbl:'?�️ ?�장??},
    {id:'stats', lbl:'?�� 개인 ?�위'},
    ...(isLoggedIn?[{id:'grpedit', lbl:'?���?조편??관�?}]:[]),
  ];
  if (proCompSub === 'progj') proCompSub = 'league';
  h += `<div class="stabs no-export">${subOpts.map(o=>`<button class="stab ${proCompSub===o.id?'on':''}" onclick="proCompSub='${o.id}';render()">${o.lbl}</button>`).join('')}</div>`;

  if (!tn && proCompSub !== 'grpedit') {
    h += `<div style="padding:60px 20px;text-align:center;background:var(--surface);border-radius:12px;border:2px dashed var(--border2)">
      <div style="font-size:44px;margin-bottom:14px">?��</div>
      <div style="font-size:16px;font-weight:700;margin-bottom:8px">?�록???�?��? ?�습?�다</div>
      <div style="color:var(--gray-l);margin-bottom:20px">???�?��? 만들??조편?�을 ?�작?�세??</div>
      ${isLoggedIn?`<button class="btn btn-b" onclick="proCompNewTourney()">+ ?�??만들�?/button>`:''}
    </div>`;
    C.innerHTML = h; return;
  }

  if (proCompSub === 'league') h += proCompLeague(tn);
  else if (proCompSub === 'grprank') h += proCompGrpRank(tn);
  else if (proCompSub === 'tour') h += proCompBracket(tn);
  else if (proCompSub === 'team') h += proCompTeamSection(tn);
  else if (proCompSub === 'gj') h += proCompGJSection(tn);
  else if (proCompSub === 'stats') h += proCompTourneyStats(tn);
  else if (proCompSub === 'grpedit') h += proCompGrpEdit();
  C.innerHTML = h;
}

/* ?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?
   조별리그 ?�정
?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?*/
function proCompLeague(tn) {
  if (!tn) return `<div style="padding:30px;text-align:center;color:var(--gray-l)">?�?��? ?�택?�세??</div>`;
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
        <span style="font-size:12px;font-weight:700;color:${_pctColor}">?�� 진행�?/span>
        <span style="font-size:12px;color:var(--gray-l)">${_doneM}/${_totalM}경기 ?�료</span>
        <span style="margin-left:auto;font-size:13px;font-weight:800;color:${_pctColor}">${_pct}%</span>
      </div>
      <div style="height:8px;background:var(--border);border-radius:4px;overflow:hidden">
        <div style="height:100%;width:${_pct}%;background:${_pctColor};border-radius:4px;transition:.3s"></div>
      </div>
    </div>`;
  }
  h += `<div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;flex-wrap:wrap">
    <div style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:15px;color:var(--blue)">?�� ${tn.name}</div>
    <div style="margin-left:auto;display:flex;gap:4px">
      <button class="pill ${proCompSortDir==='desc'?'on':''}" onclick="proCompSortDir='desc';render()">최신??/button>
      <button class="pill ${proCompSortDir==='asc'?'on':''}" onclick="proCompSortDir='asc';render()">?�래?�순</button>
    </div>
  </div>`;
  if (isLoggedIn && tn.groups.length) {
    h += `<div class="no-export" style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:6px;align-items:center">
      <span style="font-size:11px;font-weight:700;color:var(--gray-l)">경기 추�?:</span>`;
    tn.groups.forEach((grp, gi) => {
      const gl = 'ABCDEFGHIJ'[gi];
      const col = ['#2563eb','#dc2626','#16a34a','#d97706','#7c3aed','#0891b2'][gi%6];
      h += `<button class="btn btn-xs" style="background:${col};color:#fff;border-color:${col}" onclick="proCompAddMatch('${tn.id}',${gi})">+ ${gl}�?/button>`;
    });
    h += `</div>`;
    h += `<div class="no-export" style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px;align-items:center">
      <span style="font-size:11px;font-weight:700;color:var(--gray-l)">결과 붙여?�기:</span>`;
    tn.groups.forEach((grp, gi) => {
      const gl = 'ABCDEFGHIJ'[gi];
      const col = ['#2563eb','#dc2626','#16a34a','#d97706','#7c3aed','#0891b2'][gi%6];
      h += `<button class="btn btn-sm" style="border-color:${col};color:${col}" onclick="proCompOpenPasteModal('${tn.id}',${gi})">?�� ${gl}�?/button>`;
    });
    h += `</div>`;
  }
  h += `<div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:10px;padding-bottom:10px;border-bottom:2px solid var(--border)">
    <button class="pill ${!proCompFilterDate?'on':''}" onclick="proCompFilterDate='';render()">?�체</button>`;
  dates.forEach(d => {
    const dt = new Date(d+'T00:00:00'); const days=['??,'??,'??,'??,'�?,'�?,'??];
    h += `<button class="pill ${proCompFilterDate===d?'on':''}" onclick="proCompFilterDate='${d}';render()">${dt.getMonth()+1}/${dt.getDate()}(${days[dt.getDay()]})</button>`;
  });
  h += `</div>`;
  if (tn.groups.length > 1) {
    h += `<div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:6px;align-items:center"><span style="font-size:11px;font-weight:700;color:var(--gray-l)">�?</span>
      <button class="pill ${!proCompFilterGrp?'on':''}" onclick="proCompFilterGrp='';render()">?�체</button>`;
    tn.groups.forEach((grp, gi) => {
      const gl='ABCDEFGHIJ'[gi]; const col=['#2563eb','#dc2626','#16a34a','#d97706','#7c3aed','#0891b2'][gi%6];
      h += `<button class="pill ${proCompFilterGrp===grp.name?'on':''}" style="${proCompFilterGrp===grp.name?`background:${col};border-color:${col};color:#fff`:''}" onclick="proCompFilterGrp='${grp.name}';render()">GROUP ${gl}</button>`;
    });
    h += `</div>`;
    // 조별 공유카드 버튼 ??    const grpsWithDone = tn.groups.filter(g=>(g.matches||[]).some(m=>m.winner));
    if (grpsWithDone.length) {
      h += `<div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:12px;align-items:center"><span style="font-size:11px;font-weight:700;color:var(--gray-l)">�?공유카드:</span>`;
      tn.groups.forEach((grp, gi) => {
        const gl='ABCDEFGHIJ'[gi]; const col=['#2563eb','#dc2626','#16a34a','#d97706','#7c3aed','#0891b2'][gi%6];
        const gDone=(grp.matches||[]).filter(m=>m.winner).length;
        if (gDone > 0) h += `<button class="btn btn-xs" style="background:${col}15;color:${col};border:1px solid ${col}44;font-size:10px" onclick="_openProCompGrpAllShareCard('${tn.id}',${gi})">?�� GROUP ${gl}</button>`;
      });
      h += `</div>`;
    }
  } else if (tn.groups.length===1) {
    const gDone=(tn.groups[0].matches||[]).filter(m=>m.winner).length;
    if (gDone>0) h += `<div style="margin-bottom:10px"><button class="btn btn-w btn-sm" onclick="_openProCompGrpAllShareCard('${tn.id}',0)">?�� �??�체 공유카드</button></div>`;
  }
  let filtered = allMatches;
  if (proCompFilterDate) filtered = filtered.filter(m=>m.d===proCompFilterDate);
  if (proCompFilterGrp) filtered = filtered.filter(m=>m.grpName===proCompFilterGrp);
  if (!filtered.length) {
    h += `<div style="padding:40px;text-align:center;color:var(--gray-l);background:var(--surface);border-radius:10px">
      ${allMatches.length?'?�당 조건??경기가 ?�습?�다.':'?�직 ?�록??경기가 ?�습?�다.'}
      ${isLoggedIn?`<br><br><button class="btn btn-b btn-sm" onclick="proCompSub='grpedit';render()">+ 조편??관리에??경기 추�?</button>`:''}
    </div>`;
    return h;
  }
  const byDate = {};
  filtered.forEach(m => { const k=m.d||'?�짜 미정'; if(!byDate[k])byDate[k]=[]; byDate[k].push(m); });
  Object.keys(byDate).sort((a,b)=>proCompSortDir==='asc'?a.localeCompare(b):b.localeCompare(a)).forEach(date => {
    let dateLabel = date;
    if (date !== '?�짜 미정') {
      const dt=new Date(date+'T00:00:00');
      const days=['?�요??,'?�요??,'?�요??,'?�요??,'목요??,'금요??,'?�요??];
      dateLabel = `${dt.getFullYear()}??${dt.getMonth()+1}??${dt.getDate()}??${days[dt.getDay()]}`;
    }
    h += `<div style="margin-bottom:22px">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">
        <div style="flex:1;font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:13px;color:#1e3a8a;padding:8px 16px;background:linear-gradient(90deg,#1e3a8a10,transparent);border-left:4px solid #2563eb;border-radius:0 8px 8px 0">?�� ${dateLabel}</div>
        ${isLoggedIn?`<button class="btn btn-b btn-xs no-export" onclick="proCompAddMatchOnDate('${tn.id}','${date}')">+ 경기 추�?</button>
        ${date!=='?�짜 미정'?`<button class="btn btn-w btn-xs no-export" onclick="proCompOpenDatePaste('${tn.id}','${date}')">?�� 결과 ?�력</button>`:''}`:''}
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
          : `<div style="width:36px;height:36px;border-radius:50%;background:var(--border);display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0">?��</div>`;
        return `<div style="display:flex;flex-direction:column;align-items:center;gap:3px;padding:10px 14px;border-radius:12px;background:${isWin?'linear-gradient(135deg,#dcfce7,#bbf7d0)':isDone?'var(--surface)':'var(--blue-l)'};border:2px solid ${isWin?'#16a34a':'var(--border)'};min-width:100px">
          ${photo}
          <span style="font-weight:${isWin?'900':'600'};font-size:13px;color:${isWin?'#16a34a':'var(--text)'};margin-top:2px;cursor:${p?'pointer':'default'}" onclick="${p?`openPlayerModal('${(p.name||'').replace(/'/g,"\\'")}')`:''}">${p?p.name:'??}</span>
          ${_univ(p)}
          <div style="display:flex;gap:3px;align-items:center;flex-wrap:wrap;justify-content:center">${_rb(p)}${_tb(p)}</div>
        </div>`;
      };
      h += `<div class="grp-match-card" style="background:linear-gradient(135deg,var(--white) 0%,var(--blue-l) 100%);border:1.5px solid ${m.grpColor}22;border-left:4px solid ${m.grpColor};box-shadow:0 2px 12px rgba(0,0,0,.06);margin-bottom:8px">
        <div style="display:flex;flex-direction:column;align-items:center;gap:3px;min-width:60px">
          <span class="grp-badge" style="background:linear-gradient(135deg,${m.grpColor},${m.grpColor}cc);font-size:10px;letter-spacing:.5px;box-shadow:0 2px 6px ${m.grpColor}55">GROUP ${m.grpLetter}</span>
          <span style="font-size:10px;color:var(--gray-l);font-weight:600">${m.matchNum}경기</span>
          ${!isDone?`<span style="background:var(--surface);color:var(--gray-l);font-size:10px;padding:2px 8px;border-radius:10px;border:1px solid var(--border)">?�정</span>`:''}
        </div>
        <div style="flex:1;display:flex;align-items:center;gap:10px;justify-content:center;flex-wrap:wrap">
          ${_pcard(pa, aWin)}
          <div style="text-align:center;min-width:60px">
            ${isDone?`<div style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:18px;padding:6px 12px;background:var(--white);border-radius:10px;border:1.5px solid var(--border)">
              <span style="color:${aWin?'#16a34a':'var(--text3)'}">${aWin?'WIN':'??}</span>
              <span style="color:var(--gray-l);font-size:12px;margin:0 2px">:</span>
              <span style="color:${bWin?'#16a34a':'var(--text3)'}">${bWin?'WIN':'??}</span>
            </div>
            <div style="font-size:10px;font-weight:700;color:#16a34a;margin-top:4px">${aWin?m.a+' ??:bWin?m.b+' ??:'결과?�음'}</div>
            ${m.map?`<div style="font-size:10px;color:var(--gray-l);margin-top:2px">?��${m.map}</div>`:''}
            `:`<div style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:22px;color:${m.grpColor}">VS</div>`}
          </div>
          ${_pcard(pb, bWin)}
        </div>
        <div class="no-export" style="display:flex;flex-direction:column;gap:4px">
          ${isDone?`<button class="btn btn-p btn-xs" onclick="_openProCompLeagueShareCard('${tn.id}',${m.grpIdx},${m.matchNum-1})">?��</button>`:''}
          ${isLoggedIn?`<button class="btn btn-b btn-xs" style="white-space:nowrap" onclick="proCompEditMatch('${tn.id}',${m.grpIdx},${m.matchNum-1})">?�️ 결과</button>
          <button class="btn btn-r btn-xs" onclick="proCompDelMatch('${tn.id}',${m.grpIdx},${m.matchNum-1})">?���???��</button>`:''}
        </div>
      </div>`;
    });
    h += `</div>`;
  });
  return h;
}

/* ?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?
   조별 ?�위
?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?*/
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
  if (!tn) return `<div style="padding:30px;text-align:center;color:var(--gray-l)">?�?��? ?�택?�세??</div>`;
  const GL = 'ABCDEFGHIJ';
  let h = `<div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;flex-wrap:wrap">
    <div style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:15px;color:var(--blue)">?�� ${tn.name} ??조별 ?�위</div>
    <button class="btn btn-w btn-xs no-export" onclick="proCompPrintRank()" style="margin-left:auto">?���?결과 ?�쇄/?�??/button>
  </div>`;
  tn.groups.forEach((grp, gi) => {
    const col = ['#2563eb','#dc2626','#16a34a','#d97706','#7c3aed','#0891b2'][gi%6];
    const ranks = _calcProGrpRank(grp);
    const _gTotal=(grp.matches||[]).length, _gDone=(grp.matches||[]).filter(m=>m.winner).length;
    const _gPct=_gTotal?Math.round(_gDone/_gTotal*100):0;
    h += `<div style="margin-bottom:20px;border-radius:12px;overflow:hidden;border:1px solid ${col}33">
      <div style="padding:10px 16px;background:linear-gradient(135deg,${col},${col}cc);color:#fff;font-weight:900;font-size:13px;display:flex;align-items:center;gap:8px">
        <span>GROUP ${GL[gi]} · ${grp.name||GL[gi]+'�?}</span>
        <span style="margin-left:auto;font-size:11px;font-weight:600;opacity:.85">${_gDone}/${_gTotal}경기 · ${_gPct}%</span>
        ${_gDone>0?`<button class="btn btn-xs no-export" style="background:rgba(255,255,255,.2);color:#fff;border:1px solid rgba(255,255,255,.35);font-size:11px;padding:2px 8px" onclick="_openProCompGrpAllShareCard('${tn.id}',${gi})" title="�??�체 공유카드">?��</button>`:''}
      </div>
      ${_gTotal>0?`<div style="height:4px;background:${col}33"><div style="height:100%;width:${_gPct}%;background:${col};transition:.3s"></div></div>`:''}
      <table style="width:100%;border-collapse:collapse;font-size:13px">
        <thead><tr style="background:${col}11">
          <th style="padding:8px 12px;text-align:center;width:40px;color:var(--text3)">?�위</th>
          <th style="padding:8px 12px;text-align:left;color:var(--text3)">?�수</th>
          <th style="padding:8px 12px;text-align:center;color:var(--text3)">??/th>
          <th style="padding:8px 12px;text-align:center;color:var(--text3)">??/th>
          <th style="padding:8px 12px;text-align:center;color:var(--text3)">?�률</th>
        </tr></thead><tbody>`;
    ranks.forEach((r, idx) => {
      const total = r.w + r.l;
      const wr = total ? Math.round(r.w/total*100) : 0;
      const medal = idx===0?'?��':idx===1?'?��':idx===2?'?��':'';
      const p = players.find(x=>x.name===r.name);
      const _photo = p&&p.photo?`<img src="${p.photo}" style="width:28px;height:28px;border-radius:50%;object-fit:cover;margin-right:6px;vertical-align:middle;flex-shrink:0" onerror="this.style.display='none'">`:'<span style="width:28px;height:28px;border-radius:50%;background:var(--border);display:inline-flex;align-items:center;justify-content:center;margin-right:6px;font-size:13px;flex-shrink:0">?��</span>';
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

/* ?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?
   ?�???�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?*/
function proCompTeamSection(tn) {
  if (!tn) return `<div style="padding:30px;text-align:center;color:var(--gray-l)">?�?��? ?�택?�세??</div>`;
  const tms = tn.teamMatches||[];
  let h = `<div style="font-weight:900;font-size:15px;color:var(--blue);margin-bottom:12px">?�� ${tn.name} ???�??/div>`;
  if (isLoggedIn) {
    h += `<div class="no-export" style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px">
      <button class="btn btn-b btn-sm" onclick="proCompCreateTeamMatch('${tn.id}')">+ ?�??추�?</button>
      <button class="btn btn-w btn-sm" onclick="proCompOpenTeamPasteModal('${tn.id}',null)">?�� ?�괄 ?�력</button>
    </div>`;
  }
  if (!tms.length) {
    h += `<div class="empty-state"><div class="empty-state-icon">?��</div><div class="empty-state-title">?�??기록???�습?�다</div><div class="empty-state-desc">?�??구성?�고 ?��?결과�?기록?????�습?�다</div></div>`;
    return h;
  }
  tms.forEach((tm, tmi) => {
    const aWin = tm.sa > tm.sb, bWin = tm.sb > tm.sa;
    const games = tm.games||[];
    const colA='#2563eb', colB='#dc2626';
    h += `<div style="border:1.5px solid var(--border);border-radius:12px;padding:14px;margin-bottom:14px">
      <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:10px">
        <span style="font-size:11px;color:var(--gray-l);flex-shrink:0">${tm.d||'?�짜 미정'}</span>
        <div style="display:flex;align-items:center;gap:10px;flex:1;flex-wrap:wrap">
          <span style="font-weight:${aWin?900:600};color:${aWin?colA:'var(--text)'};font-size:14px">${tm.teamAName||'A?�?}</span>
          <span style="font-size:20px;font-weight:900;background:${aWin?colA:bWin?colB:'var(--border)'};color:#fff;padding:2px 14px;border-radius:8px">${tm.sa||0}:${tm.sb||0}</span>
          <span style="font-weight:${bWin?900:600};color:${bWin?colB:'var(--text)'};font-size:14px">${tm.teamBName||'B?�?}</span>
        </div>
        <div style="display:flex;gap:4px;flex-shrink:0;flex-wrap:wrap" class="no-export">
          ${games.length?`<button class="btn btn-p btn-xs" onclick="_openProCompTeamShareCard('${tn.id}',${tmi})">?��</button>`:''}
          ${isLoggedIn?`<button class="btn btn-b btn-xs" onclick="proCompAddTeamGame('${tn.id}',${tmi})">+ 경기</button>
          <button class="btn btn-w btn-xs" onclick="proCompOpenTeamPasteModal('${tn.id}',${tmi})">?��</button>
          <button class="btn btn-w btn-xs" onclick="proCompEditTeamMatch('${tn.id}',${tmi})">?�️</button>
          <button class="btn btn-r btn-xs" onclick="proCompDeleteTeamMatch('${tn.id}',${tmi})">?���?/button>`:''}
        </div>
      </div>
      <div style="display:flex;gap:16px;margin-bottom:8px;flex-wrap:wrap">
        <div style="font-size:11px"><span style="color:${colA};font-weight:700">${tm.teamAName||'A?�?}:</span> <span style="color:var(--text3)">${(tm.teamA||[]).map(p=>`<span onclick="openPlayerModal('${p.replace(/'/g,"\\'")}') " style="cursor:pointer;text-decoration:underline dotted">${p}</span>`).join(', ')||'??}</span></div>
        <div style="font-size:11px"><span style="color:${colB};font-weight:700">${tm.teamBName||'B?�?}:</span> <span style="color:var(--text3)">${(tm.teamB||[]).map(p=>`<span onclick="openPlayerModal('${p.replace(/'/g,"\\'")}') " style="cursor:pointer;text-decoration:underline dotted">${p}</span>`).join(', ')||'??}</span></div>
      </div>
      ${games.length?`<div style="border-top:1px solid var(--border);padding-top:8px;margin-top:4px">
        ${games.map((g, gi) => {
          const sideWin=g._sideW==='A'?tm.teamAName||'A?�?:tm.teamBName||'B?�?;
          const pw=players.find(p=>p.name===g.wName), pl=players.find(p=>p.name===g.lName);
          const rb=p=>p&&p.race?`<span class="rbadge r${p.race}" style="font-size:9px;padding:0 3px">${p.race}</span>`:'';
          return `<div style="display:flex;align-items:center;gap:6px;padding:4px 8px;background:var(--surface);border-radius:6px;margin-bottom:3px;font-size:12px">
            <span style="background:${g._sideW==='A'?colA:colB};color:#fff;font-size:9px;font-weight:700;padding:1px 5px;border-radius:4px;flex-shrink:0">${sideWin}</span>
            <span style="font-weight:700;color:#16a34a;cursor:pointer" onclick="openPlayerModal('${g.wName.replace(/'/g,"\\'")}' )">${g.wName||'?'} ${rb(pw)}</span>
            <span style="color:var(--gray-l);font-size:11px">WIN vs</span>
            <span style="color:var(--text3);cursor:pointer" onclick="openPlayerModal('${(g.lName||'').replace(/'/g,"\\'")}' )">${g.lName||'?'} ${rb(pl)}</span>
            ${g.map?`<span style="color:var(--gray-l);font-size:10px;margin-left:auto;flex-shrink:0">?��${g.map}</span>`:''}
            ${isLoggedIn?`<button class="btn btn-r btn-xs" style="margin-left:${g.map?'4px':'auto'};flex-shrink:0" onclick="proCompDeleteTeamGame('${tn.id}',${tmi},${gi})">??/button>`:''}
          </div>`;
        }).join('')}
      </div>`:''}
    </div>`;
  });
  return h;
}

function proCompCreateTeamMatch(tnId) {
  const tn = _findTourneyById(tnId);
  if (!tn) return;
  // 조편???�수 ?�선 + ?�체 players ?�함
  const grpPlayers = [...new Set((tn.groups||[]).flatMap(g=>g.players||[]))];
  const allPNames = players.map(p=>p.name);
  const allPlayerList = [...grpPlayers, ...allPNames.filter(n=>!grpPlayers.includes(n))];
  const modal = document.createElement('div');
  modal.id = '_tmModal';
  modal.style.cssText = 'position:fixed;inset:0;background:#0008;z-index:9999;display:flex;align-items:flex-start;justify-content:center;overflow-y:auto;padding:20px;box-sizing:border-box';
  modal.innerHTML = `<div style="background:var(--white);border-radius:16px;padding:24px;width:460px;max-width:100%;box-shadow:0 8px 40px rgba(0,0,0,.3);margin:auto">
    <div style="font-weight:900;font-size:15px;margin-bottom:16px">?�� ?�??추�?</div>
    <div style="display:flex;gap:10px;margin-bottom:12px">
      <div style="flex:1">
        <label style="font-size:12px;font-weight:700;color:var(--text3)">?�짜</label>
        <input id="_tm_d" type="date" value="${new Date().toISOString().slice(0,10)}" style="width:100%;padding:7px;border-radius:8px;border:1px solid var(--border);margin-top:4px;box-sizing:border-box">
      </div>
    </div>
    <div style="display:flex;gap:10px;margin-bottom:12px">
      <div style="flex:1">
        <label style="font-size:12px;font-weight:700;color:#2563eb">A?�??�름</label>
        <input id="_tm_an" value="A?�? style="width:100%;padding:7px;border-radius:8px;border:1px solid var(--border);margin-top:4px;box-sizing:border-box">
      </div>
      <div style="flex:1">
        <label style="font-size:12px;font-weight:700;color:#dc2626">B?�??�름</label>
        <input id="_tm_bn" value="B?�? style="width:100%;padding:7px;border-radius:8px;border:1px solid var(--border);margin-top:4px;box-sizing:border-box">
      </div>
    </div>
    <div style="font-size:12px;font-weight:700;color:var(--text3);margin-bottom:6px">?�?구성 (?�릭 ??A?�???B?�????�제)</div>
    <div style="display:flex;gap:8px;margin-bottom:8px">
      <div style="flex:1;background:#2563eb11;border:1.5px solid #2563eb44;border-radius:8px;padding:8px;min-height:50px">
        <div style="font-size:11px;font-weight:700;color:#2563eb;margin-bottom:4px">A?�?/div>
        <div id="_tm_draftA" style="display:flex;flex-wrap:wrap;gap:4px"></div>
      </div>
      <div style="flex:1;background:#dc262611;border:1.5px solid #dc262644;border-radius:8px;padding:8px;min-height:50px">
        <div style="font-size:11px;font-weight:700;color:#dc2626;margin-bottom:4px">B?�?/div>
        <div id="_tm_draftB" style="display:flex;flex-wrap:wrap;gap:4px"></div>
      </div>
    </div>
    <div style="margin-bottom:6px">
      <input id="_tm_search" placeholder="?�� ?�트리머 검??.." oninput="_tmFilterPool()" style="width:100%;padding:7px 10px;border-radius:8px;border:1px solid var(--border);font-size:12px;box-sizing:border-box">
    </div>
    <div id="_tm_pool" style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:14px;padding:8px;background:var(--surface);border-radius:8px;max-height:160px;overflow-y:auto">
      ${allPlayerList.map(p=>`<button class="_tm_pBtn" data-name="${p}" data-side="none" onclick="_tmCyclePlayer(this,'${p.replace(/'/g,"\\'")}') " style="padding:3px 10px;border-radius:12px;border:1.5px solid var(--border);background:var(--white);font-size:12px;cursor:pointer">${p}</button>`).join('')}
    </div>
    <div style="display:flex;gap:8px">
      <button class="btn btn-b" style="flex:1" onclick="_tmSaveCreate('${tnId}')">?�성</button>
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
  const tn = _findTourneyById(tnId);
  if (!tn) return;
  const d = document.getElementById('_tm_d').value;
  const teamAName = document.getElementById('_tm_an').value.trim()||'A?�?;
  const teamBName = document.getElementById('_tm_bn').value.trim()||'B?�?;
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
  const _memberBtns = (list, side, inputId) => list.map(p=>`<button type="button" onclick="_tmPickPlayer('${p.replace(/'/g,"\\'")}','${inputId}')" style="padding:2px 8px;border-radius:10px;border:1.5px solid ${side==='A'?colA:colB};background:${side==='A'?colA+'15':colB+'15'};color:${side==='A'?colA:colB};font-size:11px;cursor:pointer;font-weight:600">${p}</button>`).join('');
  const modal = document.createElement('div');
  modal.id = '_tmGameModal';
  modal.style.cssText = 'position:fixed;inset:0;background:#0008;z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px;box-sizing:border-box';
  modal.innerHTML = `<div style="background:var(--white);border-radius:16px;padding:24px;width:380px;max-width:100%;max-height:90vh;overflow-y:auto;box-shadow:0 8px 40px rgba(0,0,0,.3)">
    <div style="font-weight:900;font-size:15px;margin-bottom:14px">?�️ 경기 추�?</div>
    <div style="margin-bottom:12px">
      <label style="font-size:12px;font-weight:700;color:${colA}">${tm.teamAName||'A?�?} ?�수</label>
      ${teamA.length?`<div style="display:flex;flex-wrap:wrap;gap:4px;margin:5px 0">${_memberBtns(teamA,'A','_tg_a')}</div>`:''}
      <input id="_tg_a" placeholder="검?�하거나 직접 ?�력" list="_tg_allPlayers" style="width:100%;padding:7px;border-radius:8px;border:1px solid var(--border);margin-top:4px;font-size:12px;box-sizing:border-box">
    </div>
    <div style="margin-bottom:12px">
      <label style="font-size:12px;font-weight:700;color:${colB}">${tm.teamBName||'B?�?} ?�수</label>
      ${teamB.length?`<div style="display:flex;flex-wrap:wrap;gap:4px;margin:5px 0">${_memberBtns(teamB,'B','_tg_b')}</div>`:''}
      <input id="_tg_b" placeholder="검?�하거나 직접 ?�력" list="_tg_allPlayers" style="width:100%;padding:7px;border-radius:8px;border:1px solid var(--border);margin-top:4px;font-size:12px;box-sizing:border-box">
    </div>
    <datalist id="_tg_allPlayers">${players.map(p=>`<option value="${p.name}">`).join('')}</datalist>
    <div style="margin-bottom:10px">
      <label style="font-size:12px;font-weight:700;color:var(--text3)">?�자</label>
      <div style="display:flex;gap:8px;margin-top:6px">
        <button id="_tg_wA" class="btn btn-w" style="flex:1" onclick="document.getElementById('_tg_wA').className='btn btn-b';document.getElementById('_tg_wB').className='btn btn-w'">${tm.teamAName||'A?�?} ??/button>
        <button id="_tg_wB" class="btn btn-w" style="flex:1" onclick="document.getElementById('_tg_wB').className='btn btn-b';document.getElementById('_tg_wA').className='btn btn-w'">${tm.teamBName||'B?�?} ??/button>
      </div>
    </div>
    <div style="margin-bottom:16px">
      <label style="font-size:12px;font-weight:700;color:var(--text3)">�?(?�택)</label>
      <input id="_tg_map" placeholder="?�택?�력" style="width:100%;padding:7px;border-radius:8px;border:1px solid var(--border);margin-top:4px;font-size:12px;box-sizing:border-box">
    </div>
    <div style="display:flex;gap:8px">
      <button class="btn btn-b" style="flex:1" onclick="_tmSaveGame('${tnId}',${tmi})">추�?</button>
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
  if (!aName||!bName) { alert('?�수�??�택?�세??'); return; }
  if (!wA&&!wB) { alert('?�자�??�택?�세??'); return; }
  const wName = wA?aName:bName, lName = wA?bName:aName;
  const gid = 'ptg_'+Date.now().toString(36)+Math.random().toString(36).slice(2,4);
  if (!tm.games) tm.games=[];
  tm.games.push({_id:gid, wName, lName, map, _sideW:wA?'A':'B'});
  tm.sa=(tm.games).filter(g=>g._sideW==='A').length;
  tm.sb=(tm.games).filter(g=>g._sideW==='B').length;
  applyGameResult(wName, lName, tm.d||'', map, gid, '', '', '?�로리그?�??);
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
    return members.map((p,pi)=>`<span style="display:inline-flex;align-items:center;gap:3px;padding:3px 8px;background:var(--surface);border-radius:14px;font-size:11px;font-weight:600;border:1px solid var(--border)">${p}<button onclick="_tmRemoveMember('${tnId}',${tmi},'${side}',${pi})" style="background:none;border:none;cursor:pointer;color:var(--gray-l);font-size:11px;padding:0;line-height:1">??/button></span>`).join('');
  };
  const modal = document.createElement('div');
  modal.id = '_tmEditModal';
  modal.style.cssText = 'position:fixed;inset:0;background:#0008;z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px;box-sizing:border-box';
  modal.innerHTML = `<div style="background:var(--white);border-radius:16px;padding:24px;width:420px;max-width:100%;max-height:90vh;overflow-y:auto;box-shadow:0 8px 40px rgba(0,0,0,.3)">
    <div style="font-weight:900;font-size:15px;margin-bottom:14px">?�️ ?�???�정</div>
    <div style="margin-bottom:12px">
      <label style="font-size:12px;font-weight:700;color:var(--text3)">?�짜</label>
      <input id="_tme_d" type="date" value="${tm.d||''}" style="width:100%;padding:7px;border-radius:8px;border:1px solid var(--border);margin-top:4px;box-sizing:border-box">
    </div>
    <div style="display:flex;gap:8px;margin-bottom:14px">
      <div style="flex:1">
        <label style="font-size:12px;font-weight:700;color:#2563eb">A?�??�름</label>
        <input id="_tme_an" value="${tm.teamAName||'A?�?}" style="width:100%;padding:7px;border-radius:8px;border:1px solid var(--border);margin-top:4px;box-sizing:border-box">
      </div>
      <div style="flex:1">
        <label style="font-size:12px;font-weight:700;color:#dc2626">B?�??�름</label>
        <input id="_tme_bn" value="${tm.teamBName||'B?�?}" style="width:100%;padding:7px;border-radius:8px;border:1px solid var(--border);margin-top:4px;box-sizing:border-box">
      </div>
    </div>
    <div style="display:flex;gap:8px;margin-bottom:6px">
      <div style="flex:1;border:1px solid #2563eb44;border-radius:10px;padding:10px">
        <div style="font-size:11px;font-weight:700;color:#2563eb;margin-bottom:6px">A?�?멤버</div>
        <div id="_tme_aMembers" style="display:flex;flex-wrap:wrap;gap:4px;min-height:24px;margin-bottom:8px">${renderMembers('teamA')}</div>
        <div style="display:flex;gap:4px">
          <select id="_tme_aSel" style="flex:1;padding:5px;border-radius:6px;border:1px solid var(--border);font-size:11px"><option value="">?�수 ?�택</option>${pOpts()}</select>
          <button class="btn btn-b btn-xs" onclick="_tmAddMember('${tnId}',${tmi},'teamA')">+</button>
        </div>
      </div>
      <div style="flex:1;border:1px solid #dc262644;border-radius:10px;padding:10px">
        <div style="font-size:11px;font-weight:700;color:#dc2626;margin-bottom:6px">B?�?멤버</div>
        <div id="_tme_bMembers" style="display:flex;flex-wrap:wrap;gap:4px;min-height:24px;margin-bottom:8px">${renderMembers('teamB')}</div>
        <div style="display:flex;gap:4px">
          <select id="_tme_bSel" style="flex:1;padding:5px;border-radius:6px;border:1px solid var(--border);font-size:11px"><option value="">?�수 ?�택</option>${pOpts()}</select>
          <button class="btn btn-r btn-xs" onclick="_tmAddMember('${tnId}',${tmi},'teamB')">+</button>
        </div>
      </div>
    </div>
    <div style="display:flex;gap:8px;margin-top:14px">
      <button class="btn btn-b" style="flex:1" onclick="_tmSaveEdit('${tnId}',${tmi})">?�??/button>
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
  // 멤버 ?�역 갱신
  const containerId = side==='teamA' ? '_tme_aMembers' : '_tme_bMembers';
  const cont = document.getElementById(containerId);
  if (cont) cont.innerHTML = (tm[side]||[]).map((p,pi)=>`<span style="display:inline-flex;align-items:center;gap:3px;padding:3px 8px;background:var(--surface);border-radius:14px;font-size:11px;font-weight:600;border:1px solid var(--border)">${p}<button onclick="_tmRemoveMember('${tnId}',${tmi},'${side}',${pi})" style="background:none;border:none;cursor:pointer;color:var(--gray-l);font-size:11px;padding:0;line-height:1">??/button></span>`).join('');
}

function _tmRemoveMember(tnId, tmi, side, pi) {
  const tn = _findTourneyById(tnId);
  if (!tn||(tn.teamMatches||[])[tmi]==null) return;
  const tm = tn.teamMatches[tmi];
  if (!tm[side]) return;
  tm[side].splice(pi,1);
  const containerId = side==='teamA' ? '_tme_aMembers' : '_tme_bMembers';
  const cont = document.getElementById(containerId);
  if (cont) cont.innerHTML = (tm[side]||[]).map((p,pi2)=>`<span style="display:inline-flex;align-items:center;gap:3px;padding:3px 8px;background:var(--surface);border-radius:14px;font-size:11px;font-weight:600;border:1px solid var(--border)">${p}<button onclick="_tmRemoveMember('${tnId}',${tmi},'${side}',${pi2})" style="background:none;border:none;cursor:pointer;color:var(--gray-l);font-size:11px;padding:0;line-height:1">??/button></span>`).join('');
}

function _tmSaveEdit(tnId, tmi) {
  const tn = _findTourneyById(tnId);
  if (!tn||(tn.teamMatches||[])[tmi]==null) return;
  const tm = tn.teamMatches[tmi];
  tm.d = document.getElementById('_tme_d').value;
  tm.teamAName = document.getElementById('_tme_an').value.trim()||'A?�?;
  tm.teamBName = document.getElementById('_tme_bn').value.trim()||'B?�?;
  document.getElementById('_tmEditModal').remove();
  save(); render();
}

function proCompDeleteTeamMatch(tnId, tmi) {
  if (!confirm('???�?�을 ??��?�시겠습?�까? 경기 ?�적??취소?�니??')) return;
  const tn = _findTourneyById(tnId);
  if (!tn||!tn.teamMatches) return;
  const tm = tn.teamMatches[tmi];
  if (tm) (tm.games||[]).forEach(g=>_revertProMatch(g._id));
  tn.teamMatches.splice(tmi,1);
  save(); render();
}

/* ?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?
   ?�???�괄 ?�력 (붙여?�기)
?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?*/
function proCompOpenTeamPasteModal(tnId, tmi) {
  const tn = _findTourneyById(tnId);
  if (!tn) return;
  const tms = tn.teamMatches||[];
  // tmi=null?�면 ?�???�택/?�성 ?�이?�로�?먼�?
  if (tmi==null || !tms[tmi]) {
    _proCompTeamSelectThenPaste(tnId);
    return;
  }
  const tm = tms[tmi];
  if (typeof openPasteModal !== 'function') return;
  // 공통 pasteModal ?�활??  _grpPasteState = {mode:'procomp-team', tnId, tmi};
  openPasteModal();
  window._grpPasteMode = true;
  window._pasteForceTeamA = tm.teamAName||'A?�?;
  window._pasteForceTeamB = tm.teamBName||'B?�?;
  // ?�?멤버 로스???�전 ?�록 ???�동 ?�?배정 지??  if ((tm.teamA||[]).length) window._pasteRosterA = {teamName:tm.teamAName||'A?�?, members:tm.teamA};
  if ((tm.teamB||[]).length) window._pasteRosterB = {teamName:tm.teamBName||'B?�?, members:tm.teamB};
  const sel = document.getElementById('paste-mode');
  const lbl = document.getElementById('paste-mode-label');
  if (sel) { sel.value = 'mini'; sel.style.display = 'none'; if(typeof onPasteModeChange==='function') onPasteModeChange('mini'); }
  if (lbl) lbl.style.display = 'none';
  const hint = document.getElementById('paste-mode-hint');
  if (hint) hint.innerHTML = `<span style="color:#16a34a;font-weight:700">?�� ?�?? <span style="color:#2563eb">${tm.teamAName||'A?�?}</span> vs <span style="color:#dc2626">${tm.teamBName||'B?�?}</span></span>`;
  const title = document.querySelector('#pasteModal .mtitle');
  if (title) title.textContent = '?�� ?�??결과 ?�괄 ?�력';
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
  modal.style.cssText = 'position:fixed;inset:0;background:#0008;z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px;box-sizing:border-box';
  modal.innerHTML = `<div style="background:var(--white);border-radius:16px;padding:24px;width:420px;max-width:100%;box-shadow:0 8px 40px rgba(0,0,0,.3)">
    <div style="font-weight:900;font-size:15px;margin-bottom:12px">?�� ?�???�택</div>
    <label style="font-size:12px;font-weight:700;color:var(--text3)">?�??/label>
    <select id="_tmSel_tmi" onchange="document.getElementById('_tmSel_newFields').style.display=parseInt(this.value)>=0?'none':'flex'" style="width:100%;padding:7px;border-radius:8px;border:1px solid var(--border);margin-top:4px;margin-bottom:10px;box-sizing:border-box">
      <option value="-1">?????�???�성</option>
      ${tms.map((t,i)=>`<option value="${i}">${t.teamAName||'A?�?} vs ${t.teamBName||'B?�?} (${t.d||'?�짜 미정'})</option>`).join('')}
    </select>
    <div id="_tmSel_newFields" style="display:${tms.length?'none':'flex'};gap:8px;margin-bottom:10px">
      <div style="flex:1"><label style="font-size:11px;font-weight:700;color:#2563eb">A?��?/label><input id="_tmSel_an" value="A?�? style="width:100%;padding:5px 8px;border-radius:6px;border:1px solid var(--border);margin-top:3px;font-size:12px;box-sizing:border-box"></div>
      <div style="flex:1"><label style="font-size:11px;font-weight:700;color:#dc2626">B?��?/label><input id="_tmSel_bn" value="B?�? style="width:100%;padding:5px 8px;border-radius:6px;border:1px solid var(--border);margin-top:3px;font-size:12px;box-sizing:border-box"></div>
      <div style="flex:1"><label style="font-size:11px;font-weight:700;color:var(--text3)">?�짜</label><input id="_tmSel_nd" type="date" value="${new Date().toISOString().slice(0,10)}" style="width:100%;padding:5px 8px;border-radius:6px;border:1px solid var(--border);margin-top:3px;font-size:12px;box-sizing:border-box"></div>
    </div>
    <div style="display:flex;gap:8px">
      <button class="btn btn-b" style="flex:1" onclick="_tmSelectConfirm('${tnId}')">?�음 ??결과 ?�력</button>
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
    const an=(document.getElementById('_tmSel_an')||{}).value||'A?�?;
    const bn=(document.getElementById('_tmSel_bn')||{}).value||'B?�?;
    const nd=(document.getElementById('_tmSel_nd')||{}).value||new Date().toISOString().slice(0,10);
    tn.teamMatches.push({_id:'ptm_'+Date.now().toString(36)+Math.random().toString(36).slice(2,4), d:nd, teamAName:an, teamBName:bn, teamA:[], teamB:[], games:[], sa:0, sb:0});
    tmi = tn.teamMatches.length-1;
    save();
  }
  document.getElementById('_tmSelectModal').remove();
  proCompOpenTeamPasteModal(tnId, tmi);
}

// 공통 pasteModal ???�로리그 ?�???�?�에 ?�??function _proCompTeamPasteApplyLogic(savable) {
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
    applyGameResult(wName, lName, tm.d||'', map, gid, '', '', '?�로리그?�??);
    added++;
  });
  tm.sa=(tm.games||[]).filter(g=>g._sideW==='A').length;
  tm.sb=(tm.games||[]).filter(g=>g._sideW==='B').length;
  save(); render();
  if (added>0) setTimeout(()=>alert(`${added}경기가 추�??�었?�니??`), 100);
  return true;
}

function proCompSaveTeamPaste(tnId, tmi) {
  const tn = _findTourneyById(tnId);
  if (!tn) return;
  if (!tn.teamMatches) tn.teamMatches=[];
  const text = (document.getElementById('_tp_text')||{}).value||'';
  // tmi=null?�면 ?�택/?�성 모드
  if (tmi==null) {
    const sel = document.getElementById('_tp_tmi');
    const selVal = sel ? parseInt(sel.value) : -1;
    if (selVal>=0 && tn.teamMatches[selVal]) {
      tmi = selVal;
    } else {
      const an=(document.getElementById('_tp_an')||{}).value||'A?�?;
      const bn=(document.getElementById('_tp_bn')||{}).value||'B?�?;
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
    // _sideW: ?�?멤버 기�? ?�동 감�?, ?�으�?A
    let sideW='A';
    if (teamBSet.has(wName)) sideW='B';
    else if (teamASet.has(wName)) sideW='A';
    else if (teamBSet.has(lName)) sideW='A'; // ?�자가 B?�????�자??A?�?
    else if (teamASet.has(lName)) sideW='B';
    const gid='ptg_'+Date.now().toString(36)+Math.random().toString(36).slice(2,4);
    if (!tm.games) tm.games=[];
    tm.games.push({_id:gid, wName, lName, map:map.trim(), _sideW:sideW});
    applyGameResult(wName, lName, tm.d||'', map.trim(), gid, '', '', '?�로리그?�??);
    added++;
  });
  tm.sa=(tm.games||[]).filter(g=>g._sideW==='A').length;
  tm.sb=(tm.games||[]).filter(g=>g._sideW==='B').length;
  save(); render();
  if (added>0) alert(`${added}경기가 추�??�었?�니??`);
}

/* ?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?
   ?�진??(?�계�??�너먼트)
?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?*/
function proCompBracket(tn) {
  if (!tn) return `<div style="padding:30px;text-align:center;color:var(--gray-l)">?�?��? ?�택?�세??</div>`;
  if (!tn.bracket || !tn.bracket.length) {
    const hasGroups = tn.groups && tn.groups.length>0 && tn.groups.some(g=>(g.players||[]).length>0||(g.matches||[]).length>0);
    return `<div style="padding:40px;text-align:center;background:var(--surface);border-radius:12px;border:2px dashed var(--border2)">
      <div style="font-size:36px;margin-bottom:12px">?���?/div>
      <div style="font-size:15px;font-weight:700;margin-bottom:8px">?�진?��? ?�습?�다</div>
      ${isLoggedIn?`<div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-top:16px">
        ${hasGroups?`<button class="btn btn-b" onclick="proCompInitBracket('${tn.id}')">?�� 조별 ?�위�??�진???�성</button>`:''}
        <button class="btn btn-w" onclick="proCompInitBracketManual('${tn.id}')">?�️ 직접 ?�진??만들�?/button>
      </div>`:''}
    </div>`;
  }
  const rounds = tn.bracket;
  const _pc = name => players.find(x=>x.name===name)||null;
  const _photo = (name, isWin, col) => {
    const p=_pc(name);
    if (!name||name==='TBD') return `<div style="width:36px;height:36px;border-radius:50%;background:#e2e8f0;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:14px;color:#94a3b8">?</div>`;
    const ring = isWin?`box-shadow:0 0 0 2px ${col},0 0 0 4px ${col}33`:`border:2px solid #e2e8f0`;
    return p&&p.photo
      ?`<img src="${p.photo}" style="width:36px;height:36px;border-radius:50%;object-fit:cover;flex-shrink:0;${ring}" onerror="this.style.display='none'">`
      :`<div style="width:36px;height:36px;border-radius:50%;background:${gc(p?.univ||'')||col};flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:900;color:#fff;${ring}">${name[0]}</div>`;
  };
  const _info = name => {
    const p=_pc(name); if(!p) return '';
    const rb = p.race?`<span style="font-size:8px;padding:1px 4px;border-radius:2px;font-weight:700;background:${p.race==='T'?'#dbeafe':p.race==='Z'?'#ede9fe':'#fef3c7'};color:${p.race==='T'?'#1e40af':p.race==='Z'?'#5b21b6':'#92400e'}">${p.race}</span>`:'';
    return `<div style="display:flex;align-items:center;gap:3px;margin-top:1px">${rb}<span style="font-size:9px;color:#94a3b8;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:90px">${p.univ||''}${p.tier?' · '+p.tier:''}</span></div>`;
  };
  const rndLabel = ri => ri===rounds.length-1?'?�� 결승':ri===rounds.length-2?'?�� 준결승':ri===rounds.length-3?'?�️ 4�?:`${Math.pow(2,rounds.length-ri)}�?;
  const rndColor = ri => ri===rounds.length-1?'#d97706':ri===rounds.length-2?'#7c3aed':ri===rounds.length-3?'#dc2626':'#2563eb';
  const rndBg   = ri => ri===rounds.length-1?'linear-gradient(135deg,#f59e0b,#d97706)':ri===rounds.length-2?'linear-gradient(135deg,#8b5cf6,#6d28d9)':ri===rounds.length-3?'linear-gradient(135deg,#ef4444,#b91c1c)':'linear-gradient(135deg,#3b82f6,#1d4ed8)';

  // 챔피??배너
  let h = `<div style="font-weight:900;font-size:15px;color:var(--blue);margin-bottom:12px">?���?${tn.name} ???�진??/div>`;
  const finalMatch = (rounds[rounds.length-1]||[])[0];
  const champion = finalMatch?.winner==='A'?finalMatch.a:finalMatch?.winner==='B'?finalMatch.b:null;
  if (champion) {
    const cp = _pc(champion);
    const cpPhoto = cp?.photo?`<img src="${cp.photo}" style="width:52px;height:52px;border-radius:50%;object-fit:cover;border:3px solid rgba(255,255,255,.8)" onerror="this.outerHTML=''">`:
      `<div style="width:52px;height:52px;border-radius:50%;background:rgba(255,255,255,.3);display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:900;color:#fff">${champion[0]}</div>`;
    h += `<div style="background:linear-gradient(135deg,#f59e0b,#d97706);border-radius:14px;padding:14px 20px;margin-bottom:16px;display:flex;align-items:center;gap:14px;box-shadow:0 4px 20px rgba(217,119,6,.35)">
      ${cpPhoto}
      <div>
        <div style="font-size:10px;color:rgba(255,255,255,.8);font-weight:700;letter-spacing:.5px">?�� ?�승</div>
        <div style="font-size:20px;font-weight:900;color:#fff;letter-spacing:.5px">${champion}</div>
        ${cp?.univ?`<div style="font-size:11px;color:rgba(255,255,255,.7)">${cp.univ}${cp.race?' · '+cp.race:''}</div>`:''}
      </div>
      <div style="margin-left:auto;font-size:32px">?��</div>
    </div>`;
  }

  h += `<div style="overflow-x:auto;padding-bottom:16px"><div style="display:inline-flex;gap:0;align-items:flex-start;min-width:fit-content">`;
  rounds.forEach((rnd, ri) => {
    const lbl=rndLabel(ri), col=rndColor(ri), bg=rndBg(ri);
    const isLast=ri===rounds.length-1;
    const gap=ri===0?8:(Math.pow(2,ri)*60+8);
    h += `<div style="display:flex;align-items:center">
      <div style="min-width:${isLast?220:200}px;flex-shrink:0">
        <div style="text-align:center;font-size:12px;font-weight:900;color:#fff;margin-bottom:10px;padding:7px 10px;background:${bg};border-radius:10px;box-shadow:0 3px 8px ${col}44;letter-spacing:.5px">${lbl}</div>
        <div style="display:flex;flex-direction:column;gap:${gap}px">`;
    rnd.forEach((m, mi) => {
      const aWin=m.winner==='A', bWin=m.winner==='B', isDone=!!m.winner;
      const hasBoth=m.a&&m.b&&m.a!=='TBD'&&m.b!=='TBD';
      const aTBD=!m.a||m.a==='TBD', bTBD=!m.b||m.b==='TBD';
      const winnerName=aWin?m.a:bWin?m.b:'';
      h += `<div style="border-radius:12px;overflow:hidden;background:var(--white);box-shadow:${isDone?`0 4px 16px ${col}28,0 1px 4px rgba(0,0,0,.08)`:isLast?`0 2px 12px rgba(0,0,0,.1)`:'0 1px 6px rgba(0,0,0,.07)'};border:${isLast&&isDone?`2px solid ${col}66`:isDone?`1.5px solid ${col}44`:'1.5px solid #e2e8f0'}">
        <!-- A ?�수 -->
        <div style="padding:9px 12px;border-bottom:1px solid #f1f5f9;background:${aWin?col+'18':aTBD?'#f8fafc':'#fff'};display:flex;align-items:center;gap:8px;${aWin?`border-left:3px solid ${col}`:''};${!isDone||aWin?'':'opacity:.55'}">
          ${_photo(m.a, aWin, col)}
          <div style="flex:1;min-width:0">
            <div style="font-size:12px;font-weight:${aWin?'800':aTBD?'400':'550'};color:${aWin?col:aTBD?'#94a3b8':'#374151'};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;cursor:${m.a&&!aTBD?'pointer':'default'}" onclick="${m.a&&!aTBD?`openPlayerModal('${(m.a||'').replace(/'/g,"\\'")}')`:''}">${m.a||'TBD'}</div>
            ${!aTBD?_info(m.a):''}
          </div>
          ${aWin?`<span style="font-size:9px;font-weight:900;color:#fff;background:${col};padding:2px 7px;border-radius:6px;flex-shrink:0">WIN</span>`:''}
        </div>
        <!-- B ?�수 -->
        <div style="padding:9px 12px;background:${bWin?col+'18':bTBD?'#f8fafc':'#fff'};display:flex;align-items:center;gap:8px;${bWin?`border-left:3px solid ${col}`:''};${!isDone||bWin?'':'opacity:.55'}">
          ${_photo(m.b, bWin, col)}
          <div style="flex:1;min-width:0">
            <div style="font-size:12px;font-weight:${bWin?'800':bTBD?'400':'550'};color:${bWin?col:bTBD?'#94a3b8':'#374151'};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;cursor:${m.b&&!bTBD?'pointer':'default'}" onclick="${m.b&&!bTBD?`openPlayerModal('${(m.b||'').replace(/'/g,"\\'")}')`:''}">${m.b||'TBD'}</div>
            ${!bTBD?_info(m.b):''}
          </div>
          ${bWin?`<span style="font-size:9px;font-weight:900;color:#fff;background:${col};padding:2px 7px;border-radius:6px;flex-shrink:0">WIN</span>`:''}
        </div>
        <!-- ?�짜/�?-->
        ${(m.map||m.d)?`<div style="padding:3px 12px;font-size:9px;color:#94a3b8;background:#f8fafc;border-top:1px solid #f1f5f9;display:flex;gap:8px">${m.d?`<span>?�� ${m.d.slice(2).replace(/-/g,'.')}</span>`:''}${m.map?`<span>?�� ${m.map}</span>`:''}</div>`:''}
        <!-- ?�션 버튼 -->
        <div style="padding:5px 8px;background:#f8fafc;border-top:1px solid #f1f5f9;display:flex;gap:3px;flex-wrap:wrap">
          ${isDone?`<button class="btn btn-xs no-export" style="font-size:9px;padding:1px 6px;background:${col}18;color:${col};border-color:${col}44" onclick="_openProCompBktShareCard('${tn.id}',${ri},${mi})">?��</button>`:''}
          ${isLoggedIn?`${hasBoth?`<button class="btn btn-xs" style="flex:1;font-size:9px;${aWin?`background:${col};color:#fff;border-color:${col}`:''}" onclick="proCompSetBktWinner('${tn.id}',${ri},${mi},'A')">${(m.a||'A').slice(0,5)} ??/button>
            <button class="btn btn-xs" style="flex:1;font-size:9px;${bWin?`background:${col};color:#fff;border-color:${col}`:''}" onclick="proCompSetBktWinner('${tn.id}',${ri},${mi},'B')">${(m.b||'B').slice(0,5)} ??/button>
            <button class="btn btn-xs" style="font-size:9px;padding:0 5px" onclick="proCompOpenBktMatchPaste('${tn.id}',${ri},${mi})" title="붙여?�기">?��</button>`:''}
            <button class="btn btn-xs" style="font-size:9px;padding:0 5px" onclick="proCompBktSetDate('${tn.id}',${ri},${mi})" title="?�짜">?��</button>
            <button class="btn btn-xs" style="font-size:9px;padding:0 5px" onclick="proCompBktSetMap('${tn.id}',${ri},${mi})" title="�?>?��</button>
            <button class="btn btn-xs" style="font-size:9px;padding:0 5px" onclick="proCompBktEditPlayers('${tn.id}',${ri},${mi})" title="?�수 ?�정">?�️</button>`:''}
        </div>
      </div>`;
    });
    h += `</div></div>`;
    // ?�운??�??�살??커넥??    if (ri < rounds.length-1) h += `<div style="width:28px;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:18px;color:#cbd5e1;font-weight:900;align-self:center;padding-top:36px">??/div>`;
    h += `</div>`;
  });
  h += `</div></div>`;
  // 3?�전
  if (rounds.length >= 2 && tn.thirdPlace) {
    const tp = tn.thirdPlace;
    const tpA = tp.winner==='A', tpB = tp.winner==='B';
    const tpBoth = tp.a&&tp.b&&tp.a!=='TBD'&&tp.b!=='TBD';
    const tpCol = '#78716c';
    const tpWinner = tpA?tp.a:tpB?tp.b:null;
    h += `<div style="margin-top:20px">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
        <span style="font-size:13px;font-weight:900;color:${tpCol}">?�� 3·4?�전</span>
        ${tpWinner?`<span style="font-size:11px;background:#78716c18;color:#78716c;padding:2px 10px;border-radius:20px;font-weight:700">3??· ${tpWinner}</span>`:''}
      </div>
      <div style="border-radius:12px;overflow:hidden;background:var(--white);box-shadow:0 2px 10px rgba(0,0,0,.08);border:${tp.winner?`1.5px solid ${tpCol}44`:'1.5px solid #e2e8f0'};max-width:230px">
        <div style="padding:9px 12px;border-bottom:1px solid #f1f5f9;background:${tpA?tpCol+'18':'#fff'};display:flex;align-items:center;gap:8px;${tpA?`border-left:3px solid ${tpCol}`:''};${tp.winner&&!tpA?'opacity:.55':''}">
          ${_photo(tp.a, tpA, tpCol)}
          <div style="flex:1;min-width:0">
            <div style="font-size:12px;font-weight:${tpA?'800':'550'};color:${tpA?tpCol:'#374151'};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;cursor:${tp.a&&tp.a!=='TBD'?'pointer':'default'}" onclick="${tp.a&&tp.a!=='TBD'?`openPlayerModal('${(tp.a||'').replace(/'/g,"\\'")}')`:''}">${tp.a||'TBD'}</div>
            ${tp.a&&tp.a!=='TBD'?_info(tp.a):''}
          </div>
          ${tpA?`<span style="font-size:9px;font-weight:900;color:#fff;background:${tpCol};padding:2px 7px;border-radius:6px;flex-shrink:0">?�� 3??/span>`:''}
        </div>
        <div style="padding:9px 12px;background:${tpB?tpCol+'18':'#fff'};display:flex;align-items:center;gap:8px;${tpB?`border-left:3px solid ${tpCol}`:''};${tp.winner&&!tpB?'opacity:.55':''}">
          ${_photo(tp.b, tpB, tpCol)}
          <div style="flex:1;min-width:0">
            <div style="font-size:12px;font-weight:${tpB?'800':'550'};color:${tpB?tpCol:'#374151'};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;cursor:${tp.b&&tp.b!=='TBD'?'pointer':'default'}" onclick="${tp.b&&tp.b!=='TBD'?`openPlayerModal('${(tp.b||'').replace(/'/g,"\\'")}')`:''}">${tp.b||'TBD'}</div>
            ${tp.b&&tp.b!=='TBD'?_info(tp.b):''}
          </div>
          ${tpB?`<span style="font-size:9px;font-weight:900;color:#fff;background:${tpCol};padding:2px 7px;border-radius:6px;flex-shrink:0">?�� 3??/span>`:''}
        </div>
        ${(tp.map||tp.d)?`<div style="padding:3px 12px;font-size:9px;color:#94a3b8;background:#f8fafc;border-top:1px solid #f1f5f9;display:flex;gap:8px">${tp.d?`<span>?�� ${tp.d.slice(2).replace(/-/g,'.')}</span>`:''}${tp.map?`<span>?�� ${tp.map}</span>`:''}</div>`:''}
        <div style="padding:5px 8px;background:#f8fafc;border-top:1px solid #f1f5f9;display:flex;gap:3px;flex-wrap:wrap">
          ${tp.winner?`<button class="btn btn-xs no-export" style="font-size:9px;padding:1px 6px;background:${tpCol}18;color:${tpCol};border-color:${tpCol}44" onclick="_openProCompBktShareCard('${tn.id}','3rd',0)" title="공유카드">?��</button>`:''}
          ${isLoggedIn&&tpBoth?`<button class="btn btn-xs" style="flex:1;font-size:9px;${tpA?`background:${tpCol};color:#fff;border-color:${tpCol}`:''}" onclick="proCompSetThirdWinner('${tn.id}','A')">${(tp.a||'A').slice(0,5)} ??/button>
            <button class="btn btn-xs" style="flex:1;font-size:9px;${tpB?`background:${tpCol};color:#fff;border-color:${tpCol}`:''}" onclick="proCompSetThirdWinner('${tn.id}','B')">${(tp.b||'B').slice(0,5)} ??/button>
            <button class="btn btn-xs" style="font-size:9px;padding:0 5px" onclick="proCompSetThirdDate('${tn.id}')">?��</button>
            <button class="btn btn-xs" style="font-size:9px;padding:0 5px" onclick="proCompSetThirdMap('${tn.id}')">?��</button>`:''}
        </div>
      </div>
    </div>`;
  }
  if (isLoggedIn) h += `<div style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap">
    ${rounds.length >= 2 && !tn.thirdPlace ? `<button class="btn btn-w btn-sm" onclick="proCompAddThirdPlace('${tn.id}')">?�� 3·4?�전 추�?</button>` : ''}
    ${rounds.length >= 2 && tn.thirdPlace ? `<button class="btn btn-w btn-sm" onclick="proCompRemoveThirdPlace('${tn.id}')">?�� 3·4?�전 ?�거</button>` : ''}
    <button class="btn btn-r btn-sm" onclick="proCompResetBracket('${tn.id}')">?�� ?�진??초기??/button>
  </div>`;
  return h;
}

/* ?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?
   ?�진??초기??(그룹 ?�위 기반)
?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?*/
function proCompInitBracket(tnId) {
  const tn = _findTourneyById(tnId);
  if (!tn) return;
  // �?�?1,2??추출
  const seeds = [];
  tn.groups.forEach(grp => {
    const ranks = _calcProGrpRank(grp);
    if (ranks[0]) seeds.push(ranks[0].name);
    if (ranks[1]) seeds.push(ranks[1].name);
  });
  if (seeds.length < 2) { alert('?�진???�성???�해 �?조에 ?�수가 ?�요?�니??'); return; }
  // ?�림?�로 2??거듭?�곱 맞춤
  let sz = 2;
  while (sz < seeds.length) sz *= 2;
  while (seeds.length < sz) seeds.push('');
  // 1?�운??매치
  const firstRound = [];
  for (let i=0; i<sz; i+=2) firstRound.push({a:seeds[i], b:seeds[i+1], winner:''});
  // ?�후 ?�운??�??��?  const rounds = [firstRound];
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
  const tn = _findTourneyById(tnId);
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
      // ?�자 ?�파
      const wName = m.winner==='A'?m.a:m.b;
      if (isA) next.a=wName; else next.b=wName;
    } else {
      // ?�자 취소 ???�음 ?�운???�당 ?�롯 초기??+ ?�후 ?�운???�쇄 초기??      if (isA) next.a=''; else next.b='';
      next.winner='';
      // ?�후 ?�운???�쇄 초기??      let curMi=nextMi;
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
  // 준결승 ?�자 ??3?�전 ?�동 배정 (3?�전??추�???경우?�만)
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
  _syncBktMatchToHistory(tn, m, bktMatchId, ri, mi);
  save(); render();
}

/* ?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?
   ?�진??결과 ?�괄 ?�력 (붙여?�기)
?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?*/
function proCompOpenBktPasteModal(tnId) {
  const tn = _findTourneyById(tnId);
  if (!tn||!tn.bracket||!tn.bracket.length) { alert('?�진?��?먼�? ?�성?�세??\n(?�진???????�진???�성 버튼)'); return; }
  const rounds = tn.bracket;
  const totalRounds = rounds.length;
  const rndLabel = ri => ri===totalRounds-1?'결승':ri===totalRounds-2?'준결승':ri===totalRounds-3?'4�?:`${Math.pow(2,totalRounds-ri)}�?;
  // 진행 가?�한 경기 목록 (a, b 모두 ?�는 경기)
  const pending = [];
  rounds.forEach((rnd, ri) => rnd.forEach((m, mi) => {
    if (m.a&&m.b&&m.a!=='TBD'&&m.b!=='TBD') pending.push({ri, mi, a:m.a, b:m.b, round:rndLabel(ri), done:!!m.winner});
  }));
  const pendHTML = pending.length
    ? `<div style="font-size:11px;color:var(--text3);margin-bottom:8px;padding:8px;background:var(--surface);border-radius:8px;line-height:1.9">
        ${pending.map(p=>`<span style="display:inline-block;margin:1px 4px;padding:1px 8px;border-radius:10px;background:${p.done?'#dcfce7':'#fef3c7'};color:${p.done?'#16a34a':'#92400e'};font-size:10px;font-weight:700">${p.round}: ${p.a} vs ${p.b}${p.done?' ??:''}</span>`).join('')}
       </div>` : '';
  const modal = document.createElement('div');
  modal.id = '_bktPasteModal';
  modal.style.cssText = 'position:fixed;inset:0;background:#0008;z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px;box-sizing:border-box';
  modal.innerHTML = `<div style="background:var(--white);border-radius:16px;padding:24px;width:440px;max-width:100%;max-height:90vh;overflow-y:auto;box-shadow:0 8px 40px rgba(0,0,0,.3)">
    <div style="font-weight:900;font-size:15px;margin-bottom:8px">?�� ?�진??결과 ?�괄 ?�력</div>
    <div style="font-size:11px;color:var(--text3);background:var(--surface);border-radius:8px;padding:10px;margin-bottom:10px;line-height:1.8">
      ??줄에 ??경기 (공백/??구분):<br>
      <code>?�자?�름 ?�자?�름 [�?</code><br>
      ?�진????�록???�수명과 ?�치?�야 ?�동 배정?�니??
    </div>
    ${pendHTML}
    <textarea id="_bkt_text" rows="8" placeholder="${pending.slice(0,3).map(p=>`${p.a} ${p.b} 맵이�?).join('\n')||'?�길???�순??n강감�??��?문덕'}" style="width:100%;padding:8px;border-radius:8px;border:1px solid var(--border);font-size:12px;box-sizing:border-box;font-family:monospace;resize:vertical"></textarea>
    <div id="_bkt_preview" style="margin-top:6px;font-size:11px;color:var(--text3)"></div>
    <div style="display:flex;gap:8px;margin-top:12px">
      <button class="btn btn-b" style="flex:1" onclick="proCompSaveBktPaste('${tnId}')">?�??/button>
      <button class="btn btn-w" style="flex:1" onclick="document.getElementById('_bktPasteModal').remove()">취소</button>
    </div>
  </div>`;
  document.body.appendChild(modal);
}

function proCompSaveBktPaste(tnId) {
  const tn = _findTourneyById(tnId);
  if (!tn||!tn.bracket) return;
  const text = (document.getElementById('_bkt_text')||{}).value||'';
  document.getElementById('_bktPasteModal').remove();
  if (!text.trim()) return;
  const lines = text.trim().split('\n').map(l=>l.trim()).filter(Boolean);
  let applied = 0, skipped = 0;
  lines.forEach(line => {
    const parts = line.split(/[\s\t]+/);
    if (parts.length < 2) return;
    const wName = parts[0], lName = parts[1], map = parts.slice(2).join(' ');
    if (!wName||!lName||wName===lName) return;
    // 브라켓에???�당 ?�롯 찾기
    let found = false;
    for (let ri=0; ri<tn.bracket.length; ri++) {
      for (let mi=0; mi<tn.bracket[ri].length; mi++) {
        const m = tn.bracket[ri][mi];
        if (!m.a||!m.b) continue;
        let winner = '';
        if (m.a===wName&&m.b===lName) winner='A';
        else if (m.b===wName&&m.a===lName) winner='B';
        if (!winner) continue;
        if (map) m.map = map;
        // proCompSetBktWinner 로직 ?�라??(모달 ?�이)
        const prevWinner = m.winner;
        m.winner = winner;
        const nextMi = Math.floor(mi/2), isA = mi%2===0;
        if (tn.bracket[ri+1]&&tn.bracket[ri+1][nextMi]) {
          const next = tn.bracket[ri+1][nextMi];
          const wn = m.winner==='A'?m.a:m.b;
          if (isA) next.a=wn; else next.b=wn;
        }
        // 준결승 ?�자 ??3?�전
        const semiRi = tn.bracket.length-2;
        if (tn.thirdPlace&&ri===semiRi&&tn.bracket.length>=2&&(mi===0||mi===1)) {
          if (tn.thirdPlace.winner) _revertProMatch(`pbn_${tnId}_3rd`);
          tn.thirdPlace.winner='';
          const loser=m.winner==='A'?m.b:m.a;
          if (mi===0) tn.thirdPlace.a=loser; else tn.thirdPlace.b=loser;
        }
        // player history 반영
        const bktMatchId=`pbn_${tnId}_${ri}_${mi}`;
        if (prevWinner&&m.a&&m.b) _revertProMatch(bktMatchId);
        _syncBktMatchToHistory(tn, m, bktMatchId, ri, mi);
        applied++; found=true; break;
      }
      if (found) break;
    }
    if (!found) skipped++;
  });
  save(); render();
  alert(`??${applied}경기 ?�용${skipped>0?`, ${skipped}�?미매�?:''}`);
}

function proCompBktSetDate(tnId, ri, mi) {
  const tn = _findTourneyById(tnId);
  if (!tn||!tn.bracket||!tn.bracket[ri]) return;
  const m = tn.bracket[ri][mi];
  if (!m) return;
  const modal = document.createElement('div');
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:9999;display:flex;align-items:center;justify-content:center';
  modal.innerHTML = `<div style="background:var(--white);border-radius:14px;padding:20px;min-width:240px;box-shadow:0 8px 32px rgba(0,0,0,.2)">
    <div style="font-weight:900;font-size:14px;margin-bottom:14px">?�� ?�짜 ?�력</div>
    <input id="_bktDateInp" type="date" value="${m.d||''}" style="width:100%;padding:8px;border-radius:8px;border:1px solid var(--border);box-sizing:border-box;margin-bottom:14px">
    <div style="display:flex;gap:8px">
      <button class="btn btn-b" style="flex:1" onclick="(function(){const v=document.getElementById('_bktDateInp').value;const t2=_findTourneyById('${tnId}');if(t2&&t2.bracket&&t2.bracket[${ri}]&&t2.bracket[${ri}][${mi}]){const m2=t2.bracket[${ri}][${mi}];m2.d=v; if(m2.winner)_syncBktMatchToHistory(t2,m2,'pbn_${tnId}_${ri}_${mi}',${ri},${mi});}document.body.removeChild(document.getElementById('_bktDateModal'));save();render();})()">확인</button>
      <button class="btn btn-w" style="flex:1" onclick="document.body.removeChild(document.getElementById('_bktDateModal'))">취소</button>
    </div>
  </div>`;
  modal.id = '_bktDateModal';
  document.body.appendChild(modal);
}

function proCompBktSetMap(tnId, ri, mi) {
  const tn = _findTourneyById(tnId);
  if (!tn||!tn.bracket||!tn.bracket[ri]) return;
  const m = tn.bracket[ri][mi];
  if (!m) return;
  const modal = document.createElement('div');
  modal.id = '_bktMapModal';
  modal.style.cssText = 'position:fixed;inset:0;background:#0008;z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px;box-sizing:border-box';
  modal.innerHTML = `<div style="background:var(--white);border-radius:16px;padding:24px;width:320px;max-width:100%;box-shadow:0 8px 40px rgba(0,0,0,.3)">
    <div style="font-weight:900;font-size:15px;margin-bottom:14px">?���?�??�정</div>
    <input id="_bktMapInp" value="${(m.map||'').replace(/"/g,'&quot;')}" placeholder="�??�름 ?�력" style="width:100%;padding:8px;border-radius:8px;border:1px solid var(--border);font-size:13px;box-sizing:border-box;margin-bottom:14px">
    <div style="display:flex;gap:8px">
      <button class="btn btn-b" style="flex:1" onclick="(function(){const v=document.getElementById('_bktMapInp').value.trim();const t2=_findTourneyById('${tnId}');if(t2&&t2.bracket&&t2.bracket[${ri}]&&t2.bracket[${ri}][${mi}]){const m2=t2.bracket[${ri}][${mi}];m2.map=v; if(m2.winner)_syncBktMatchToHistory(t2,m2,'pbn_${tnId}_${ri}_${mi}',${ri},${mi});}document.getElementById('_bktMapModal').remove();save();render();})()">확인</button>
      <button class="btn btn-w" style="flex:1" onclick="document.getElementById('_bktMapModal').remove()">취소</button>
    </div>
  </div>`;
  document.body.appendChild(modal);
  document.getElementById('_bktMapInp').focus();
}

function proCompBktEditPlayers(tnId, ri, mi) {
  const tn = _findTourneyById(tnId);
  if (!tn||!tn.bracket||!tn.bracket[ri]) return;
  const m = tn.bracket[ri][mi];
  if (!m) return;
  const pList = players.filter(p=>p.name).sort((a,b)=>(a.name||'').localeCompare(b.name||''));
  const pOpts = (sel) => `<option value="">??직접 ?�력 ??/option>` + pList.map(p=>`<option value="${p.name}"${p.name===sel?' selected':''}>${p.name}${p.univ?` (${p.univ})`:''}</option>`).join('');
  const modal = document.createElement('div');
  modal.id = '_bktEditModal';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:9999;display:flex;align-items:center;justify-content:center';
  modal.innerHTML = `<div style="background:var(--white);border-radius:14px;padding:20px;min-width:280px;box-shadow:0 8px 32px rgba(0,0,0,.2)">
    <div style="font-weight:900;font-size:14px;margin-bottom:14px">?�️ ?�진??경기 ?�정</div>
    <div style="margin-bottom:10px">
      <label style="font-size:11px;font-weight:700;color:var(--text3)">A ?�수</label>
      <select id="_bktEditA" style="width:100%;padding:6px;border-radius:8px;border:1px solid var(--border);margin-top:4px">${pOpts(m.a||'')}</select>
      <input id="_bktEditAInp" placeholder="직접 ?�력" value="${pList.some(p=>p.name===m.a)?'':m.a||''}" style="width:100%;padding:6px;border-radius:8px;border:1px solid var(--border);margin-top:4px;box-sizing:border-box;font-size:12px">
    </div>
    <div style="margin-bottom:10px">
      <label style="font-size:11px;font-weight:700;color:var(--text3)">B ?�수</label>
      <select id="_bktEditB" style="width:100%;padding:6px;border-radius:8px;border:1px solid var(--border);margin-top:4px">${pOpts(m.b||'')}</select>
      <input id="_bktEditBInp" placeholder="직접 ?�력" value="${pList.some(p=>p.name===m.b)?'':m.b||''}" style="width:100%;padding:6px;border-radius:8px;border:1px solid var(--border);margin-top:4px;box-sizing:border-box;font-size:12px">
    </div>
    <div style="margin-bottom:10px">
      <label style="font-size:11px;font-weight:700;color:var(--text3)">?�짜</label>
      <input id="_bktEditD" type="date" value="${m.d||''}" style="width:100%;padding:6px;border-radius:8px;border:1px solid var(--border);margin-top:4px;box-sizing:border-box">
    </div>
    <div style="margin-bottom:14px">
      <label style="font-size:11px;font-weight:700;color:var(--text3)">�?/label>
      <input id="_bktEditMap" value="${m.map||''}" placeholder="?�택 ?�력" style="width:100%;padding:6px;border-radius:8px;border:1px solid var(--border);margin-top:4px;box-sizing:border-box;font-size:12px">
    </div>
    <div style="display:flex;gap:8px">
      <button class="btn btn-b" style="flex:1" onclick="(function(){
        const aV=(document.getElementById('_bktEditA').value||document.getElementById('_bktEditAInp').value).trim();
        const bV=(document.getElementById('_bktEditB').value||document.getElementById('_bktEditBInp').value).trim();
        const dV=document.getElementById('_bktEditD').value;
        const mapV=document.getElementById('_bktEditMap').value.trim();
        const t2=_findTourneyById('${tnId}');
        if(!t2||!t2.bracket||!t2.bracket[${ri}]||!t2.bracket[${ri}][${mi}])return;
        const m2=t2.bracket[${ri}][${mi}];
        const bktId='pbn_${tnId}_${ri}_${mi}';
        if(m2.winner)_revertProMatch(bktId);
        m2.a=aV;m2.b=bV;m2.d=dV;m2.map=mapV;m2.winner='';
        _syncBktMatchToHistory(t2,m2,bktId,${ri},${mi});
        document.body.removeChild(document.getElementById('_bktEditModal'));
        save();render();
      })()">확인</button>
      <button class="btn btn-w" style="flex:1" onclick="document.body.removeChild(document.getElementById('_bktEditModal'))">취소</button>
    </div>
  </div>`;
  document.body.appendChild(modal);
}

function proCompInitBracketManual(tnId) {
  const tn = _findTourneyById(tnId);
  if (!tn) return;
  const szStr = prompt('?�진??규모�??�택?�세??\n2 = 결승\n4 = 4�?n8 = 8�?n16 = 16�?n\n참�? ?�원 ?��? ?�력?�세??', '4');
  if (!szStr) return;
  let sz = parseInt(szStr);
  if (isNaN(sz)||sz<2) return alert('2 ?�상???�자�??�력?�세??');
  // ?�림?�로 2??거듭?�곱
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
  const tn = _findTourneyById(tnId);
  if (!tn) return;
  tn.thirdPlace = {a:'', b:'', winner:'', map:''};
  // 준결승 결과가 ?��? ?�으�??�자 ?�동 배정
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
  if (!confirm('3·4?�전???�거?�시겠습?�까?')) return;
  const tn = _findTourneyById(tnId);
  if (!tn) return;
  const thirdKey = `pbn_${tnId}_3rd`;
  if (tn.thirdPlace && tn.thirdPlace.winner) _revertProMatch(thirdKey);
  tn.thirdPlace = null;
  save(); render();
}

function proCompResetBracket(tnId) {
  if (!confirm('?�진?��?초기?�하?�겠?�니�?')) return;
  const tn = _findTourneyById(tnId);
  if (!tn) return;
  tn.bracket = [];
  tn.thirdPlace = null;
  save(); render();
}

function proCompSetThirdWinner(tnId, winner) {
  const tn = _findTourneyById(tnId);
  if (!tn||!tn.thirdPlace) return;
  const m = tn.thirdPlace;
  const thirdKey = `pbn_${tnId}_3rd`;
  if (m.winner) _revertProMatch(thirdKey);
  m.winner = m.winner===winner ? '' : winner;
  _syncBktMatchToHistory(tn, m, thirdKey, '3rd', 0);
  save(); render();
}

function proCompSetThirdDate(tnId) {
  const tn = _findTourneyById(tnId);
  if (!tn||!tn.thirdPlace) return;
  const modal = document.createElement('div');
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:9999;display:flex;align-items:center;justify-content:center';
  modal.id = '_thirdDateModal';
  modal.innerHTML = `<div style="background:var(--white);border-radius:14px;padding:20px;min-width:240px;box-shadow:0 8px 32px rgba(0,0,0,.2)">
    <div style="font-weight:900;font-size:14px;margin-bottom:14px">?�� 3?�전 ?�짜 ?�력</div>
    <input id="_thirdDateInp" type="date" value="${tn.thirdPlace.d||''}" style="width:100%;padding:8px;border-radius:8px;border:1px solid var(--border);box-sizing:border-box;margin-bottom:14px">
    <div style="display:flex;gap:8px">
      <button class="btn btn-b" style="flex:1" onclick="(function(){const v=document.getElementById('_thirdDateInp').value;const t2=_findTourneyById('${tnId}');if(t2&&t2.thirdPlace){const tp=t2.thirdPlace;tp.d=v;if(tp.winner)_syncBktMatchToHistory(t2,tp,'pbn_${tnId}_3rd','3rd',0);}document.body.removeChild(document.getElementById('_thirdDateModal'));save();render();})()">확인</button>
      <button class="btn btn-w" style="flex:1" onclick="document.body.removeChild(document.getElementById('_thirdDateModal'))">취소</button>
    </div>
  </div>`;
  document.body.appendChild(modal);
}

function proCompSetThirdMap(tnId) {
  const tn = _findTourneyById(tnId);
  if (!tn||!tn.thirdPlace) return;
  const modal = document.createElement('div');
  modal.id = '_thirdMapModal';
  modal.style.cssText = 'position:fixed;inset:0;background:#0008;z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px;box-sizing:border-box';
  modal.innerHTML = `<div style="background:var(--white);border-radius:16px;padding:24px;width:320px;max-width:100%;box-shadow:0 8px 40px rgba(0,0,0,.3)">
    <div style="font-weight:900;font-size:15px;margin-bottom:14px">?���?3?�전 �??�정</div>
    <input id="_thirdMapInp" value="${((tn.thirdPlace.map)||'').replace(/"/g,'&quot;')}" placeholder="�??�름 ?�력" style="width:100%;padding:8px;border-radius:8px;border:1px solid var(--border);font-size:13px;box-sizing:border-box;margin-bottom:14px">
    <div style="display:flex;gap:8px">
      <button class="btn btn-b" style="flex:1" onclick="(function(){const v=document.getElementById('_thirdMapInp').value.trim();const t2=_findTourneyById('${tnId}');if(t2&&t2.thirdPlace){const tp=t2.thirdPlace;tp.map=v;if(tp.winner)_syncBktMatchToHistory(t2,tp,'pbn_${tnId}_3rd','3rd',0);}document.getElementById('_thirdMapModal').remove();save();render();})()">확인</button>
      <button class="btn btn-w" style="flex:1" onclick="document.getElementById('_thirdMapModal').remove()">취소</button>
    </div>
  </div>`;
  document.body.appendChild(modal);
  document.getElementById('_thirdMapInp').focus();
}

/* ?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?
   조편??관�??�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?*/
function proCompGrpEdit() {
  const tn = getCurrentProTourney();
  let h = `<div style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:15px;color:var(--blue);margin-bottom:14px">?���?조편??관�?{tn?' ??'+tn.name:''}</div>`;
  if (!tn) {
    h += `<div style="padding:40px;text-align:center;color:var(--gray-l)">먼�? ?�?��? ?�택?�거???�성?�세??</div>`;
    return h;
  }
  h += `<div style="display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap">
    <button class="btn btn-b btn-sm" onclick="proCompAddGrp('${tn.id}')">+ �?추�?</button>
  </div>`;
  const GL = 'ABCDEFGHIJ';
  tn.groups.forEach((grp, gi) => {
    const col = ['#2563eb','#dc2626','#16a34a','#d97706','#7c3aed','#0891b2'][gi%6];
    h += `<div style="margin-bottom:16px;border-radius:12px;overflow:hidden;border:1.5px solid ${col}44">
      <div style="padding:10px 16px;background:linear-gradient(135deg,${col},${col}cc);color:#fff;display:flex;align-items:center;gap:8px">
        <span style="font-weight:900;font-size:13px">GROUP ${GL[gi]}</span>
        <input value="${grp.name||''}" placeholder="�??�름" style="background:#fff3;border:1px solid #fff5;border-radius:6px;padding:3px 8px;font-size:12px;color:#fff;width:120px"
          onchange="proCompRenameGrp('${tn.id}',${gi},this.value)">
        <button class="btn btn-r btn-xs" style="margin-left:auto" onclick="proCompDelGrp('${tn.id}',${gi})">?���?�???��</button>
      </div>
      <div style="padding:12px 16px;background:var(--white)">
        <div style="font-size:11px;font-weight:700;color:var(--text3);margin-bottom:8px">?�수 목록 (${(grp.players||[]).length}�?</div>
        <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px">
          ${(grp.players||[]).map((p,pi)=>`<div style="display:flex;align-items:center;gap:4px;padding:4px 10px;background:var(--surface);border-radius:20px;border:1px solid var(--border)">
            <span style="font-size:12px;font-weight:600">${p}</span>
            <button onclick="proCompRemovePlayer('${tn.id}',${gi},${pi})" style="background:none;border:none;cursor:pointer;color:var(--gray-l);font-size:12px;padding:0;line-height:1">??/button>
          </div>`).join('')}
          ${!(grp.players||[]).length?`<span style="color:var(--gray-l);font-size:12px">?�직 ?�수가 ?�습?�다</span>`:''}
        </div>
        <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap">
          <input id="proAddP_${gi}" placeholder="?�수 ?�름 검?? style="padding:6px 10px;border-radius:8px;border:1px solid var(--border);font-size:12px;width:160px"
            oninput="proCompSearchPlayerSug('${tn.id}',${gi})">
          <button class="btn btn-b btn-sm" onclick="proCompAddPlayerManual('${tn.id}',${gi})">+ 추�?</button>
        </div>
        <div id="proSug_${gi}" style="display:flex;flex-wrap:wrap;gap:4px;margin-top:6px"></div>
        <div style="margin-top:12px;border-top:1px solid var(--border);padding-top:10px">
          <div style="font-size:11px;font-weight:700;color:var(--text3);margin-bottom:8px">경기 목록 (${(grp.matches||[]).length}경기)</div>
          ${(grp.matches||[]).map((m,mi)=>`<div style="display:flex;align-items:center;gap:8px;padding:6px 10px;background:var(--surface);border-radius:8px;margin-bottom:4px;font-size:12px">
            <span style="font-weight:600">${m.a||'?'}</span>
            <span style="color:var(--gray-l)">vs</span>
            <span style="font-weight:600">${m.b||'?'}</span>
            ${m.winner?`<span style="font-size:10px;background:#dcfce7;color:#16a34a;padding:1px 6px;border-radius:10px;font-weight:700">${m.winner==='A'?m.a:m.b} ??/span>`:'<span style="font-size:10px;color:var(--gray-l)">미완�?/span>'}
            ${m.d?`<span style="font-size:10px;color:var(--gray-l)">${m.d}</span>`:''}
            <button class="btn btn-b btn-xs" style="margin-left:auto" onclick="proCompEditMatch('${tn.id}',${gi},${mi})">?�️</button>
            <button class="btn btn-r btn-xs" onclick="proCompDelMatch('${tn.id}',${gi},${mi})">?���?/button>
          </div>`).join('')}
          <div style="display:flex;gap:6px;margin-top:6px;flex-wrap:wrap">
            <button class="btn btn-b btn-sm" onclick="proCompAddMatch('${tn.id}',${gi})">+ 경기 추�?</button>
            <button class="btn btn-w btn-sm" onclick="proCompOpenPasteModal('${tn.id}',${gi})">?�� ?�괄 ?�력</button>
            ${(grp.players||[]).length>=2?`<button class="btn btn-w btn-sm" onclick="proCompGenRoundRobin('${tn.id}',${gi})" title="?�수 목록 기반 ?�운?�로�?경기 ?�동 ?�성">?�� ?�운?�로�??�성</button>`:''}
          </div>
        </div>
      </div>
    </div>`;
  });
  return h;
}

function proCompGenRoundRobin(tnId, gi) {
  const tn = _findTourneyById(tnId);
  if (!tn||!tn.groups[gi]) return;
  const grp = tn.groups[gi];
  const ps = grp.players||[];
  if (ps.length < 2) return alert('?�수가 2�??�상?�어???�니??');
  // 기존 미완�?경기 ???�인
  const existing = (grp.matches||[]).filter(m=>!m.winner);
  const pairs = [];
  for (let i=0;i<ps.length;i++) for (let j=i+1;j<ps.length;j++) pairs.push({a:ps[i],b:ps[j]});
  // ?��? ?�는 ?��??�외
  const newPairs = pairs.filter(p => !(grp.matches||[]).some(m=>(m.a===p.a&&m.b===p.b)||(m.a===p.b&&m.b===p.a)));
  if (!newPairs.length) { alert('모든 ?�운?�로�?경기가 ?��? ?�록?�어 ?�습?�다.'); return; }
  if (!confirm(`${newPairs.length}경기�?추�??�시겠습?�까?\n(?��? ?�는 ?�진�? ?�외?�니??`)) return;
  if (!grp.matches) grp.matches=[];
  newPairs.forEach(p => grp.matches.push({a:p.a,b:p.b,winner:'',map:'',d:''}));
  save(); render();
}

function proCompSearchPlayerSug(tnId, gi) {
  const input = document.getElementById(`proAddP_${gi}`);
  const sug = document.getElementById(`proSug_${gi}`);
  if (!input||!sug) return;
  const q = input.value.trim();
  if (!q) { sug.innerHTML=''; return; }
  const tn = _findTourneyById(tnId);
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
  const tn = _findTourneyById(tnId);
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
  const tn = _findTourneyById(tnId);
  if (!tn||!tn.groups[gi]) return;
  tn.groups[gi].players.splice(pi, 1);
  save(); render();
}

/* ?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?
   경기 CRUD
?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?*/
function proCompAddMatchOnDate(tnId, date) {
  const tn = _findTourneyById(tnId);
  if (!tn || !tn.groups.length) { alert('조�? 먼�? 만들??주세??'); return; }
  if (tn.groups.length === 1) {
    proCompAddMatch(tnId, 0, date);
  } else {
    // �??�택 ?�업
    const GL = 'ABCDEFGHIJ';
    const grpOpts = tn.groups.map((g,i)=>`<option value="${i}">GROUP ${GL[i]} · ${g.name||GL[i]+'�?}</option>`).join('');
    const sel = document.createElement('div');
    sel.id = 'proGrpSelModal';
    sel.style.cssText = 'position:fixed;inset:0;background:#0008;z-index:10000;display:flex;align-items:center;justify-content:center';
    sel.innerHTML = `<div style="background:var(--white);border-radius:12px;padding:20px;width:280px;max-width:95vw;box-shadow:0 8px 32px rgba(0,0,0,.25)">
      <div style="font-weight:900;font-size:14px;margin-bottom:12px">?�느 조에 추�??�까??</div>
      <select id="proGrpSelSel" style="width:100%;padding:8px;border-radius:8px;border:1px solid var(--border);margin-bottom:14px;box-sizing:border-box">${grpOpts}</select>
      <div style="display:flex;gap:8px">
        <button class="btn btn-b" style="flex:1" onclick="var _gi=parseInt(document.getElementById('proGrpSelSel').value);document.getElementById('proGrpSelModal').remove();proCompAddMatch('${tnId}',_gi,'${date}')">?�택</button>
        <button class="btn btn-w" style="flex:1" onclick="document.getElementById('proGrpSelModal').remove()">취소</button>
      </div>
    </div>`;
    document.body.appendChild(sel);
  }
}

// ?�진??경기�?붙여?�기
function proCompOpenBktMatchPaste(tnId, ri, mi) {
  const tn = _findTourneyById(tnId); if (!tn) return;
  const m = (tn.bracket||[])[ri]?.[mi];
  if (!m||!m.a||!m.b||m.a==='TBD'||m.b==='TBD') return alert('???�수가 모두 ?�정??경기?�만 ?�용 가?�합?�다.');
  if (typeof openPasteModal !== 'function') return;
  _grpPasteState = {mode:'procomp-bkt', tnId, ri, mi};
  openPasteModal();
  window._grpPasteMode = true;
  window._pasteForceTeamA = m.a;
  window._pasteForceTeamB = m.b;
  const sel = document.getElementById('paste-mode');
  const lbl = document.getElementById('paste-mode-label');
  if (sel) { sel.value = 'ind'; sel.style.display = 'none'; if(typeof onPasteModeChange==='function') onPasteModeChange('ind'); }
  if (lbl) lbl.style.display = 'none';
  const hint = document.getElementById('paste-mode-hint');
  if (hint) hint.innerHTML = `<span style="color:#7c3aed;font-weight:700">?���??�진?? <b>${m.a}</b> vs <b>${m.b}</b> ???�자 ?�름 ?�력</span>`;
  const title = document.querySelector('#pasteModal .mtitle');
  if (title) title.textContent = '?�� ?�진??결과 ?�력';
  const compWrap = document.getElementById('paste-comp-wrap');
  if (compWrap) compWrap.style.display = 'none';
  if (m.d) { const dateEl = document.getElementById('paste-date'); if (dateEl) dateEl.value = m.d; }
}

function _proCompBktPasteApplyLogic(savable) {
  const {tnId, ri, mi} = _grpPasteState;
  if (!savable.length) return false;
  const r = savable[0];
  const winName = r.wPlayer?.name; if (!winName) return false;
  const tn = _findTourneyById(tnId); if (!tn) return false;
  const m = (tn.bracket||[])[ri]?.[mi]; if (!m) return false;
  let winner;
  if (winName===m.a) winner='A';
  else if (winName===m.b) winner='B';
  else { alert(`"${winName}"?�??? ??경기 ?�수가 ?�닙?�다.\n${m.a} vs ${m.b}`); return false; }
  const dateEl = document.getElementById('paste-date');
  if (dateEl?.value) m.d = dateEl.value;
  proCompSetBktWinner(tnId, ri, mi, winner);
  return true;
}

// 조별리그 ?�짜�?붙여?�기
function proCompOpenDatePaste(tnId, date) {
  const tn = _findTourneyById(tnId); if (!tn) return;
  const groups = tn.groups||[];
  if (!groups.length) return alert('조편?�을 먼�? ?�정?�세??');
  if (groups.length === 1) {
    proCompOpenPasteModal(tnId, 0, date);
    return;
  }
  // ?�러 �???�??�택 ?�이?�로�?  const modal = document.createElement('div');
  modal.id = '_pcDatePasteGrpSel';
  modal.style.cssText = 'position:fixed;inset:0;background:#0008;z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px;box-sizing:border-box';
  const GL='ABCDEFGHIJ';
  const btns = groups.map((_,gi)=>{
    const col=['#2563eb','#dc2626','#16a34a','#d97706','#7c3aed','#0891b2'][gi%6];
    return `<button class="btn btn-sm" style="background:${col};color:#fff;border-color:${col}" onclick="document.getElementById('_pcDatePasteGrpSel').remove();proCompOpenPasteModal('${tnId}',${gi},'${date}')">GROUP ${GL[gi]}</button>`;
  }).join('');
  modal.innerHTML = `<div style="background:var(--white);border-radius:16px;padding:24px;width:340px;max-width:100%;box-shadow:0 8px 40px rgba(0,0,0,.3)">
    <div style="font-weight:900;font-size:15px;margin-bottom:4px">?�� �??�택</div>
    <div style="font-size:11px;color:var(--gray-l);margin-bottom:14px">${date} 경기 결과�??�력??조�? ?�택?�세??/div>
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px">${btns}</div>
    <button class="btn btn-w" style="width:100%" onclick="document.getElementById('_pcDatePasteGrpSel').remove()">취소</button>
  </div>`;
  document.body.appendChild(modal);
}

function proCompOpenPasteModal(tnId, gi, preDate) {
  const tn = _findTourneyById(tnId);
  if (!tn||!tn.groups[gi]) return;
  if (typeof openPasteModal !== 'function') return;
  // 공통 pasteModal ?�활??(경기?�력 붙여?�기?�??�일??UI)
  _grpPasteState = {mode:'procomp-league', tnId, gi};
  openPasteModal();
  window._grpPasteMode = true;
  // 개인???�식 고정 (?�자?�름 ?�자?�름 [�?)
  const sel = document.getElementById('paste-mode');
  const lbl = document.getElementById('paste-mode-label');
  if (sel) { sel.value = 'ind'; sel.style.display = 'none'; if(typeof onPasteModeChange==='function') onPasteModeChange('ind'); }
  if (lbl) lbl.style.display = 'none';
  const gl = 'ABCDEFGHIJ'[gi];
  const hint = document.getElementById('paste-mode-hint');
  if (hint) hint.innerHTML = `<span style="color:#1d4ed8;font-weight:700">?�� ${tn.name} ??${gl}�?결과 ?�력</span>`;
  const title = document.querySelector('#pasteModal .mtitle');
  if (title) title.textContent = `?�� 조별리그 결과 ?�괄 ?�력 ??${gl}�?;
  const compWrap = document.getElementById('paste-comp-wrap');
  if (compWrap) compWrap.style.display = 'none';
  if (preDate) { const dateEl = document.getElementById('paste-date'); if (dateEl) dateEl.value = preDate; }
}

// 공통 pasteModal ???�로리그 ?�??조별리그???�??function _proCompLeaguePasteApplyLogic(savable) {
  const {tnId, gi} = _grpPasteState;
  const tn = _findTourneyById(tnId);
  if (!tn||!tn.groups[gi]) return false;
  const grp = tn.groups[gi];
  const dateEl = document.getElementById('paste-date');
  const defDate = dateEl?.value || new Date().toISOString().slice(0,10);
  if (!grp.matches) grp.matches = [];
  let added = 0;
  savable.forEach(r => {
    if (!r.wPlayer||!r.lPlayer) return;
    const newMid = 'pco_'+Date.now().toString(36)+Math.random().toString(36).slice(2,5);
    grp.matches.push({a:r.wPlayer.name, b:r.lPlayer.name, winner:'A', d:defDate, map:r.map&&r.map!=='-'?r.map:'', _id:newMid});
    applyGameResult(r.wPlayer.name, r.lPlayer.name, defDate, r.map&&r.map!=='-'?r.map:'', newMid, '', '', '?�로리그?�??);
    added++;
  });
  save(); render();
  if (added > 0) setTimeout(()=>alert(`${added}�?경기가 추�??�었?�니??`), 100);
  return true;
}

function proCompSavePaste(tnId, gi) {
  const tn = _findTourneyById(tnId);
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
    if (winner) applyGameResult(winner==='A'?a:b, winner==='A'?b:a, d, '', newMid, '', '', '?�로리그?�??);
    added++;
  });
  save(); render();
  if (added>0) alert(`${added}�?경기가 추�??�었?�니??`);
}

function proCompAddMatch(tnId, gi, preDate) {
  const tn = _findTourneyById(tnId);
  if (!tn||!tn.groups[gi]) return;
  const grp = tn.groups[gi];
  if ((grp.players||[]).length < 2) { alert('조에 ?�수가 2�??�상 ?�요?�니??'); return; }
  proCompMatchState = {tnId, gi, mi: -1}; // -1 = new match
  const pList = grp.players||[];
  const pOpts = pList.map(p=>`<option value="${p}">${p}</option>`).join('');
  const defDate = preDate || new Date().toISOString().slice(0,10);
  const modal = document.createElement('div');
  modal.id = 'proMatchModal';
  modal.style.cssText = 'position:fixed;inset:0;background:#0008;z-index:9999;display:flex;align-items:center;justify-content:center';
  modal.innerHTML = `<div style="background:var(--white);border-radius:16px;padding:24px;width:340px;max-width:95vw;box-shadow:0 8px 40px rgba(0,0,0,.3)">
    <div style="font-weight:900;font-size:15px;margin-bottom:16px">??경기 추�?</div>
    <div style="margin-bottom:10px">
      <label style="font-size:12px;font-weight:700;color:var(--text3)">A ?�수</label>
      <select id="pm_a" style="width:100%;padding:8px;border-radius:8px;border:1px solid var(--border);margin-top:4px;box-sizing:border-box">
        <option value="">?�수 ?�택</option>${pOpts}
      </select>
    </div>
    <div style="margin-bottom:10px">
      <label style="font-size:12px;font-weight:700;color:var(--text3)">B ?�수</label>
      <select id="pm_b" style="width:100%;padding:8px;border-radius:8px;border:1px solid var(--border);margin-top:4px;box-sizing:border-box">
        <option value="">?�수 ?�택</option>${pOpts}
      </select>
    </div>
    <div style="margin-bottom:10px">
      <label style="font-size:12px;font-weight:700;color:var(--text3)">?�짜</label>
      <input id="pm_d" type="date" value="${defDate}" style="width:100%;padding:8px;border-radius:8px;border:1px solid var(--border);margin-top:4px;box-sizing:border-box">
    </div>
    <div style="margin-bottom:10px">
      <label style="font-size:12px;font-weight:700;color:var(--text3)">�?(?�택)</label>
      <input id="pm_map" placeholder="?�택?�력" style="width:100%;padding:8px;border-radius:8px;border:1px solid var(--border);margin-top:4px;box-sizing:border-box">
    </div>
    <div style="margin-bottom:16px">
      <label style="font-size:12px;font-weight:700;color:var(--text3)">?�자 (?�정 경기�?미정 ?�택)</label>
      <div style="display:flex;gap:8px;margin-top:6px">
        <button id="pm_winA" class="btn btn-w" style="flex:1" onclick="document.getElementById('pm_winA').className='btn btn-b';document.getElementById('pm_winB').className='btn btn-w';document.getElementById('pm_winNone').className='btn btn-w'">A ??/button>
        <button id="pm_winB" class="btn btn-w" style="flex:1" onclick="document.getElementById('pm_winB').className='btn btn-b';document.getElementById('pm_winA').className='btn btn-w';document.getElementById('pm_winNone').className='btn btn-w'">B ??/button>
        <button id="pm_winNone" class="btn btn-b" style="flex:1" onclick="document.getElementById('pm_winNone').className='btn btn-b';document.getElementById('pm_winA').className='btn btn-w';document.getElementById('pm_winB').className='btn btn-w'">미정</button>
      </div>
    </div>
    <div style="display:flex;gap:8px">
      <button class="btn btn-b" style="flex:1" onclick="proCompSaveMatch()">추�?</button>
      <button class="btn btn-w" style="flex:1" onclick="document.getElementById('proMatchModal').remove()">취소</button>
    </div>
  </div>`;
  document.body.appendChild(modal);
}

function proCompEditMatch(tnId, gi, mi) {
  const tn = _findTourneyById(tnId);
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
    <div style="font-weight:900;font-size:15px;margin-bottom:16px">?�️ 경기 결과 ?�력</div>
    <div style="margin-bottom:10px">
      <label style="font-size:12px;font-weight:700;color:var(--text3)">A ?�수</label>
      ${pList.length>=2
        ?`<select id="pm_a" style="width:100%;padding:8px;border-radius:8px;border:1px solid var(--border);margin-top:4px;box-sizing:border-box"><option value="">?�수 ?�택</option>${pOptsA}</select>`
        :`<input id="pm_a" value="${m.a||''}" style="width:100%;padding:8px;border-radius:8px;border:1px solid var(--border);margin-top:4px;box-sizing:border-box">`}
    </div>
    <div style="margin-bottom:10px">
      <label style="font-size:12px;font-weight:700;color:var(--text3)">B ?�수</label>
      ${pList.length>=2
        ?`<select id="pm_b" style="width:100%;padding:8px;border-radius:8px;border:1px solid var(--border);margin-top:4px;box-sizing:border-box"><option value="">?�수 ?�택</option>${pOptsB}</select>`
        :`<input id="pm_b" value="${m.b||''}" style="width:100%;padding:8px;border-radius:8px;border:1px solid var(--border);margin-top:4px;box-sizing:border-box">`}
    </div>
    <div style="margin-bottom:10px">
      <label style="font-size:12px;font-weight:700;color:var(--text3)">?�자</label>
      <div style="display:flex;gap:8px;margin-top:6px">
        <button id="pm_winA" class="btn ${m.winner==='A'?'btn-b':'btn-w'}" style="flex:1" onclick="document.getElementById('pm_winA').className='btn btn-b';document.getElementById('pm_winB').className='btn btn-w';document.getElementById('pm_winNone').className='btn btn-w'">A ??/button>
        <button id="pm_winB" class="btn ${m.winner==='B'?'btn-b':'btn-w'}" style="flex:1" onclick="document.getElementById('pm_winB').className='btn btn-b';document.getElementById('pm_winA').className='btn btn-w';document.getElementById('pm_winNone').className='btn btn-w'">B ??/button>
        <button id="pm_winNone" class="btn ${!m.winner?'btn-b':'btn-w'}" style="flex:1" onclick="document.getElementById('pm_winNone').className='btn btn-b';document.getElementById('pm_winA').className='btn btn-w';document.getElementById('pm_winB').className='btn btn-w'">미정</button>
      </div>
    </div>
    <div style="margin-bottom:10px">
      <label style="font-size:12px;font-weight:700;color:var(--text3)">?�짜</label>
      <input id="pm_d" type="date" value="${m.d||''}" style="width:100%;padding:8px;border-radius:8px;border:1px solid var(--border);margin-top:4px;box-sizing:border-box">
    </div>
    <div style="margin-bottom:16px">
      <label style="font-size:12px;font-weight:700;color:var(--text3)">�?/label>
      <input id="pm_map" value="${m.map||''}" placeholder="?�택?�력" style="width:100%;padding:8px;border-radius:8px;border:1px solid var(--border);margin-top:4px;box-sizing:border-box">
    </div>
    <div style="display:flex;gap:8px">
      <button class="btn btn-b" style="flex:1" onclick="proCompSaveMatch()">?�??/button>
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
    if (h.result === '??) { p.win = Math.max(0,(p.win||0)-1); p.points = (p.points||0)-3; }
    else { p.loss = Math.max(0,(p.loss||0)-1); p.points = (p.points||0)+3; }
    p.elo = (p.elo||1200) - h.eloDelta;
    p.history = p.history.filter(x => x.matchId !== matchId);
  });
}

function proCompSaveMatch() {
  const {tnId, gi, mi} = proCompMatchState;
  const tn = _findTourneyById(tnId);
  if (!tn||!tn.groups[gi]) return;
  const aVal = document.getElementById('pm_a').value.trim();
  const bVal = document.getElementById('pm_b').value.trim();
  if (!aVal || !bVal) { alert('A, B ?�수�?모두 ?�택?�세??'); return; }
  const winA = document.getElementById('pm_winA').classList.contains('btn-b');
  const winB = document.getElementById('pm_winB').classList.contains('btn-b');
  const winVal = winA?'A':winB?'B':'';
  const dVal = document.getElementById('pm_d').value;
  const mapVal = document.getElementById('pm_map').value.trim();
  if (mi === -1) {
    // ??경기 추�?
    if (!tn.groups[gi].matches) tn.groups[gi].matches = [];
    const newMid = 'pco_'+Date.now().toString(36)+Math.random().toString(36).slice(2,5);
    tn.groups[gi].matches.push({a:aVal, b:bVal, winner:winVal, d:dVal, map:mapVal, _id:newMid});
    if (winVal) applyGameResult(winVal==='A'?aVal:bVal, winVal==='A'?bVal:aVal, dVal, mapVal, newMid, '', '', '?�로리그?�??);
  } else {
    const m = tn.groups[gi].matches[mi];
    if (!m) return;
    if (!m._id) m._id = 'pco_'+Date.now().toString(36)+Math.random().toString(36).slice(2,5);
    if (m.winner) _revertProMatch(m._id);
    m.a = aVal; m.b = bVal; m.d = dVal; m.map = mapVal; m.winner = winVal;
    if (winVal) applyGameResult(winVal==='A'?aVal:bVal, winVal==='A'?bVal:aVal, dVal, mapVal, m._id, '', '', '?�로리그?�??);
  }
  document.getElementById('proMatchModal').remove();
  save(); render();
}

function proCompDelMatch(tnId, gi, mi) {
  if (!confirm('경기�???��?�시겠습?�까?')) return;
  const tn = _findTourneyById(tnId);
  if (!tn||!tn.groups[gi]) return;
  const m = tn.groups[gi].matches[mi];
  if (m && m.winner && m._id) _revertProMatch(m._id);
  tn.groups[gi].matches.splice(mi, 1);
  save(); render();
}

/* ?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?
   ?�??CRUD
?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?*/
function proCompNewTourney() {
  const name = prompt('???�???�름???�력?�세??, '');
  if (!name || !name.trim()) return;
  const id = 'ptn_' + Date.now();
  proTourneys.push({id, name:name.trim(), groups:[], bracket:[], createdAt:new Date().toISOString().slice(0,10)});
  curProComp = name.trim();
  proCompSub = 'grpedit'; // ?�성 ??조편??관리로 ?�동 ?�동
  save(); render();
}

function proCompRenameTourney() {
  const tn = getCurrentProTourney();
  if (!tn) return;
  const name = prompt('???�???�름', tn.name);
  if (!name || !name.trim()) return;
  if (curProComp === tn.name) curProComp = name.trim();
  tn.name = name.trim();
  save(); render();
}

function proCompDelTourney() {
  const tn = getCurrentProTourney();
  if (!tn) return;
  if (!confirm(`"${tn.name}" ?�?��? ??��?�시겠습?�까?`)) return;
  const idx = proTourneys.findIndex(t=>t.id===tn.id);
  if (idx>=0) proTourneys.splice(idx, 1);
  curProComp = proTourneys[0]?.name || '';
  save(); render();
}

function proCompAddGrp(tnId) {
  const tn = _findTourneyById(tnId);
  if (!tn) return;
  const GL = 'ABCDEFGHIJ';
  const name = GL[tn.groups.length] + '�?;
  tn.groups.push({name, players:[], matches:[]});
  save(); render();
}

function proCompRenameGrp(tnId, gi, name) {
  const tn = _findTourneyById(tnId);
  if (!tn||!tn.groups[gi]) return;
  tn.groups[gi].name = name;
  save();
}

function proCompDelGrp(tnId, gi) {
  const tn = _findTourneyById(tnId);
  if (!tn) return;
  if (!confirm('??조�? ??��?�시겠습?�까?\n?�록??경기 ?�적??모두 취소?�니??')) return;
  const grp = tn.groups[gi];
  if (grp) (grp.matches||[]).forEach((m,mi) => { if(m.winner) _revertProMatch(`pcg_${tnId}_${gi}_${mi}`); });
  tn.groups.splice(gi, 1);
  save(); render();
}

/* ?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?
   ?�???�계 (Feature 3 + 2)
?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?*/
function proCompTourneyStats(tn) {
  if (!tn) return `<div style="padding:30px;text-align:center;color:var(--gray-l)">?�?��? ?�택?�세??</div>`;
  // ?�적 ?�동 ?�기??(?�림 ?�이)
  _proCompSyncSilent();
  // ?�체 경기 ?�집 (조별리그 + ?�진??+ 3?�전)
  const allM = [];
  tn.groups.forEach(grp => (grp.matches||[]).forEach(m => allM.push(m)));
  (tn.bracket||[]).forEach(rnd => rnd.forEach(m => { if(m&&m.a&&m.b&&m.a!=='TBD'&&m.b!=='TBD') allM.push(m); }));
  if (tn.thirdPlace&&tn.thirdPlace.a&&tn.thirdPlace.b&&tn.thirdPlace.a!=='TBD'&&tn.thirdPlace.b!=='TBD') allM.push(tn.thirdPlace);
  const doneM = allM.filter(m=>m.winner);
  // ?�??게임??allM ?�사 ?�태�??�집 (�?종족 ?�계??
  const allTmGames = (tn.teamMatches||[]).flatMap(tm=>(tm.games||[]).map(g=>({...g, _isTmGame:true, d:tm.d||'', winner:'W'})));
  if (!allM.length && !allTmGames.length) return `<div style="padding:40px;text-align:center;color:var(--gray-l);background:var(--surface);border-radius:12px">?�직 ?�록??경기가 ?�습?�다.</div>`;

  // ?�수�?????집계 (조별리그 + ?�진??+ 3?�전)
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
  // ?�??게임 집계
  (tn.teamMatches||[]).forEach(tm => {
    (tm.games||[]).forEach(g => {
      if (!g.wName||!g.lName) return;
      if (!pSt[g.wName]) pSt[g.wName]={w:0,l:0};
      if (!pSt[g.lName]) pSt[g.lName]={w:0,l:0};
      pSt[g.wName].w++; pSt[g.lName].l++;
    });
  });
  const pArr = Object.entries(pSt).map(([name,s])=>({name,...s,total:s.w+s.l,rate:s.w+s.l?Math.round(s.w/(s.w+s.l)*100):0})).filter(p=>p.total>0).sort((a,b)=>b.w-a.w||b.rate-a.rate);

  // �??�계
  const mapSt = {};
  doneM.forEach(m => {
    if (!m.map) return;
    if (!mapSt[m.map]) mapSt[m.map]={total:0,aWin:0,bWin:0};
    mapSt[m.map].total++;
    if (m.winner==='A') mapSt[m.map].aWin++;
    else mapSt[m.map].bWin++;
  });
  const mapArr = Object.entries(mapSt).sort((a,b)=>b[1].total-a[1].total);

  // 종족 ?�계
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
    <div style="font-weight:900;font-size:15px;color:var(--blue)">?�� ${tn.name} ???�???�계</div>
    ${isLoggedIn?`<button class="btn btn-w btn-xs no-export" onclick="proCompSyncHistory()" title="기존 경기 결과�??�트리머 ?�적??반영">?�� ?�적 ?�기??/button>`:''}
  </div>`;

  // ?�수 ?�적 TOP
  h += `<div style="margin-bottom:20px;border-radius:12px;overflow:hidden;border:1px solid var(--border)">
    <div style="padding:10px 16px;background:linear-gradient(135deg,#2563eb,#1d4ed8);color:#fff;font-weight:900;font-size:13px">?�� ?�수�??�적</div>
    <table style="width:100%;border-collapse:collapse;font-size:13px">
      <thead><tr style="background:#2563eb11">
        <th style="padding:8px 12px;text-align:center;width:40px;color:var(--text3)">?�위</th>
        <th style="padding:8px 12px;text-align:left;color:var(--text3)">?�수</th>
        <th style="padding:8px 12px;text-align:center;color:var(--text3)">??/th>
        <th style="padding:8px 12px;text-align:center;color:var(--text3)">??/th>
        <th style="padding:8px 12px;text-align:center;color:var(--text3)">?�률</th>
      </tr></thead><tbody>`;
  pArr.slice(0,10).forEach((r,idx)=>{
    const medal = idx===0?'?��':idx===1?'?��':idx===2?'?��':'';
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

  // �??�계
  if (mapArr.length) {
    h += `<div style="margin-bottom:20px;border-radius:12px;overflow:hidden;border:1px solid var(--border)">
      <div style="padding:10px 16px;background:linear-gradient(135deg,#7c3aed,#6d28d9);color:#fff;font-weight:900;font-size:13px">?�� �??�계 (?�료 경기 ${doneM.filter(m=>m.map).length}/${doneM.length})</div>
      <table style="width:100%;border-collapse:collapse;font-size:13px">
        <thead><tr style="background:#7c3aed11">
          <th style="padding:8px 12px;text-align:left;color:var(--text3)">�?/th>
          <th style="padding:8px 12px;text-align:center;color:var(--text3)">?�용?�수</th>
          <th style="padding:8px 12px;text-align:center;color:var(--text3)">비율</th>
        </tr></thead><tbody>`;
    const totalMapGames = mapArr.reduce((s,[,v])=>s+v.total,0);
    mapArr.forEach(([map,s])=>{
      const pct = totalMapGames ? Math.round(s.total/totalMapGames*100) : 0;
      h += `<tr style="border-top:1px solid var(--border)">
        <td style="padding:8px 12px;font-weight:600">?�� ${map}</td>
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

  // 종족 ?�계
  const races = Object.entries(raceSt).sort((a,b)=>b[1].pick-a[1].pick);
  if (races.length) {
    const totalPicks = races.reduce((s,[,v])=>s+v.pick,0);
    h += `<div style="margin-bottom:20px;border-radius:12px;overflow:hidden;border:1px solid var(--border)">
      <div style="padding:10px 16px;background:linear-gradient(135deg,#dc2626,#b91c1c);color:#fff;font-weight:900;font-size:13px">?�️ 종족 ?�계</div>
      <div style="padding:12px 16px;display:flex;gap:12px;flex-wrap:wrap">`;
    const raceColor = {T:'#2563eb', Z:'#7c3aed', P:'#16a34a', R:'#d97706'};
    races.forEach(([race,s])=>{
      const pickPct = totalPicks ? Math.round(s.pick/totalPicks*100) : 0;
      const winRate = s.pick ? Math.round(s.w/s.pick*100) : 0;
      const col = raceColor[race]||'#64748b';
      h += `<div style="flex:1;min-width:120px;padding:12px;background:${col}11;border:1.5px solid ${col}44;border-radius:10px;text-align:center">
        <div style="font-weight:900;font-size:16px;color:${col}">${race}</div>
        <div style="font-size:11px;color:var(--gray-l);margin-top:2px">?�률 ${pickPct}%</div>
        <div style="font-size:12px;font-weight:700;color:${col};margin-top:4px">${s.w}??${s.l}??/div>
        <div style="font-size:11px;color:var(--gray-l)">?�률 ${winRate}%</div>
      </div>`;
    });
    h += `</div></div>`;
  }

  return h;
}

/* ?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?
   조별 ?�위 ?�쇄 ?�??(Feature 4)
?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?*/
function proCompPrintRank() {
  const tn = getCurrentProTourney();
  if (!tn) return;
  const GL = 'ABCDEFGHIJ';
  let body = `<style>body{font-family:'Noto Sans KR',sans-serif;margin:20px}table{width:100%;border-collapse:collapse;margin-bottom:20px}th,td{border:1px solid #ddd;padding:8px 12px;text-align:left}th{background:#f0f4ff;font-weight:700}h1{color:#1e3a8a;font-size:20px;margin-bottom:4px}h2{color:#2563eb;font-size:14px;margin:16px 0 6px}.medal{font-size:16px}.wr{font-weight:700}.win{color:#16a34a}.loss{color:#dc2626}</style>`;
  body += `<h1>?�� ${tn.name} ??조별 ?�위</h1><p style="color:#888;font-size:12px">출력?? ${new Date().toLocaleDateString('ko-KR')}</p>`;
  tn.groups.forEach((grp, gi) => {
    const col = ['#2563eb','#dc2626','#16a34a','#d97706','#7c3aed','#0891b2'][gi%6];
    const ranks = _calcProGrpRank(grp);
    body += `<h2 style="color:${col}">GROUP ${GL[gi]} · ${grp.name||GL[gi]+'�?}</h2>`;
    body += `<table><thead><tr><th>?�위</th><th>?�수</th><th>??/th><th>??/th><th>?�률</th></tr></thead><tbody>`;
    ranks.forEach((r,idx)=>{
      const total=r.w+r.l; const wr=total?Math.round(r.w/total*100):0;
      const medal=idx===0?'?��':idx===1?'?��':idx===2?'?��':'';
      body+=`<tr><td class="medal">${medal||idx+1}</td><td>${r.name}</td><td class="win">${r.w}</td><td class="loss">${r.l}</td><td class="wr">${wr}%</td></tr>`;
    });
    body += `</tbody></table>`;
  });
  const w = window.open('','_blank','width=700,height=900');
  if (!w) { alert('?�업??차단?�었?�니?? ?�업 ?�용 ???�시 ?�도?�세??'); return; }
  w.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${tn.name} ?�위</title>${body.match(/<style>[\s\S]*<\/style>/)[0]}</head><body>${body.replace(/<style>[\s\S]*<\/style>/,'')}<script>window.onload=function(){window.print();}<\/script></body></html>`);
  w.document.close();
}

/* ?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═
   ?�합 �?(Feature 7) ???�반 + ?�???�합
?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═ */
function rProAll(C, T) {
  T.innerText = '?�� ?�로리그 ?�합';
  // ?�반 proM?�서 경기 ?�집
  const proItems = [];
  proM.forEach(m => {
    proItems.push({
      d: m.d||'', type:'?�반', label:`${m.teamALabel||'A?�?} vs ${m.teamBLabel||'B?�?}`,
      scoreA: m.scoreA||0, scoreB: m.scoreB||0,
      aLabel: m.teamALabel||'A?�?, bLabel: m.teamBLabel||'B?�?,
      note: m.n||''
    });
  });
  // ?�??proTourneys?�서 경기 ?�집
  proTourneys.forEach(tn => {
    (tn.groups||[]).forEach(grp => {
      (grp.matches||[]).forEach(m => {
        if (!m.a||!m.b) return;
        proItems.push({
          d: m.d||'', type:'?�??, label:`${m.a} vs ${m.b}`,
          winner: m.winner||'', aLabel: m.a, bLabel: m.b,
          map: m.map||'', note: tn.name
        });
      });
    });
    (tn.bracket||[]).forEach((rnd, ri) => {
      const totalRounds = (tn.bracket||[]).length;
      const rLabel = ri===totalRounds-1?'결승':ri===totalRounds-2?'준결승':ri===totalRounds-3?'4�?:`${Math.pow(2,totalRounds-ri)}�?;
      (rnd||[]).forEach(m => {
        if (!m.a||!m.b||m.a==='TBD'||m.b==='TBD') return;
        proItems.push({
          d: m.d||'', type:'?�??, label:`${m.a} vs ${m.b}`,
          winner: m.winner||'', aLabel: m.a, bLabel: m.b,
          map: m.map||'', note: `${tn.name} ${rLabel}`
        });
      });
    });
  });
  proItems.sort((a,b)=>(b.d||'').localeCompare(a.d||''));

  // ?�료 경기�??�계??반영
  const compItems = proItems.filter(item => item.winner || item.scoreA > 0 || item.scoreB > 0);

  // ?�합 ?�수�?????  const pAll = {};
  proM.forEach(m => {
    (m.sets||[]).forEach(set=>{(set.games||[]).forEach(g=>{
      if(!g.playerA||!g.playerB||!g.winner)return;
      const w=g.winner==='A'?g.playerA:g.playerB; const l=g.winner==='A'?g.playerB:g.playerA;
      if(!pAll[w])pAll[w]={w:0,l:0,src:new Set()};if(!pAll[l])pAll[l]={w:0,l:0,src:new Set()};
      pAll[w].w++;pAll[l].l++;pAll[w].src.add('?�반');pAll[l].src.add('?�반');
    });});
  });
  proTourneys.forEach(tn=>{(tn.groups||[]).forEach(grp=>{(grp.matches||[]).forEach(m=>{
    if(!m.a||!m.b||!m.winner)return;
    const w=m.winner==='A'?m.a:m.b; const l=m.winner==='A'?m.b:m.a;
    if(!pAll[w])pAll[w]={w:0,l:0,src:new Set()};if(!pAll[l])pAll[l]={w:0,l:0,src:new Set()};
    pAll[w].w++;pAll[l].l++;pAll[w].src.add('?�??);pAll[l].src.add('?�??);
  });});});

  const pArr = Object.entries(pAll).map(([name,s])=>({name,w:s.w,l:s.l,total:s.w+s.l,rate:s.w+s.l?Math.round(s.w/(s.w+s.l)*100):0,src:[...s.src]})).filter(p=>p.total>0).sort((a,b)=>b.w-a.w||b.rate-a.rate);

  const compCnt = proTourneys.reduce((s,t)=>s+(t.groups||[]).reduce((ss,g)=>ss+(g.matches||[]).length,0),0);

  // ?�이???�음
  if (!proM.length && !compCnt) {
    C.innerHTML = `<div style="padding:60px 20px;text-align:center;background:var(--surface);border-radius:12px;border:2px dashed var(--border2)">
      <div style="font-size:44px;margin-bottom:14px">?��</div>
      <div style="font-size:16px;font-weight:700;margin-bottom:8px">?�직 ?�로리그 ?�이?��? ?�습?�다</div>
      <div style="color:var(--gray-l);font-size:13px">?�� ?�반 ??��??경기�??�력?�거??br>?���??�????��???�?��? 만들�?경기�??�록?�세??</div>
    </div>`;
    return;
  }

  let h = `<div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;flex-wrap:wrap">
    <div style="font-weight:900;font-size:15px;color:var(--blue)">?�� ?�로리그 ?�합 ?�황</div>
    <div style="display:flex;gap:6px;flex-wrap:wrap">
      <span style="font-size:11px;font-weight:700;padding:2px 10px;border-radius:10px;background:#dbeafe;color:#2563eb">?�� ?�반 ${proM.length}경기</span>
      <span style="font-size:11px;font-weight:700;padding:2px 10px;border-radius:10px;background:#f3e8ff;color:#7c3aed">?���??�??${compCnt}경기</span>
      <span style="font-size:11px;font-weight:700;padding:2px 10px;border-radius:10px;background:#f0fdf4;color:#16a34a">?�료 ${compItems.length}경기</span>
    </div>
  </div>`;

  // ?�합 ?�수 ?�위
  h += `<div style="margin-bottom:20px;border-radius:12px;overflow:hidden;border:1px solid var(--border)">
    <div style="padding:10px 16px;background:linear-gradient(135deg,#0f172a,#1e3a8a);color:#fff;font-weight:900;font-size:13px">?�� ?�합 개인 ?�위 (?�리 기�?)</div>`;
  if (!pArr.length) {
    h += `<div style="padding:24px;text-align:center;color:var(--gray-l);font-size:13px">?�직 ?�료??경기가 ?�습?�다.<br><span style="font-size:11px">경기 결과�??�력?�면 ?�위가 ?�시?�니??</span></div>`;
  } else {
    h += `<table style="width:100%;border-collapse:collapse;font-size:13px">
      <thead><tr style="background:#1e3a8a0f">
        <th style="padding:8px 12px;text-align:center;width:40px;color:var(--text3)">?�위</th>
        <th style="padding:8px 12px;text-align:left;color:var(--text3)">?�수</th>
        <th style="padding:8px 12px;text-align:center;color:var(--text3)">??/th>
        <th style="padding:8px 12px;text-align:center;color:var(--text3)">??/th>
        <th style="padding:8px 12px;text-align:center;color:var(--text3)">?�률</th>
        <th style="padding:8px 12px;text-align:center;color:var(--text3)">출처</th>
      </tr></thead><tbody>`;
    pArr.slice(0,15).forEach((r,idx)=>{
      const medal=idx===0?'?��':idx===1?'?��':idx===2?'?��':'';
      const p=players.find(x=>x.name===r.name);
      const photo=p&&p.photo?`<img src="${p.photo}" style="width:26px;height:26px;border-radius:50%;object-fit:cover;margin-right:5px;vertical-align:middle" onerror="this.style.display='none'">`:'';
      const rb=p&&p.race?`<span class="rbadge r${p.race}" style="font-size:9px;padding:0 3px">${p.race}</span>`:'';
      const srcBadges=r.src.map(s=>`<span style="font-size:9px;padding:1px 5px;border-radius:8px;font-weight:700;${s==='?�반'?'background:#dbeafe;color:#2563eb':'background:#f3e8ff;color:#7c3aed'}">${s}</span>`).join(' ');
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

  // 최근 ?�합 경기 ?�?�라??  h += `<div style="border-radius:12px;overflow:hidden;border:1px solid var(--border)">
    <div style="padding:10px 16px;background:linear-gradient(135deg,#475569,#334155);color:#fff;font-weight:900;font-size:13px">?�� ?�체 경기 목록 (�?${proItems.length}경기)</div>`;
  if (!proItems.length) {
    h += `<div style="padding:24px;text-align:center;color:var(--gray-l);font-size:13px">?�록??경기가 ?�습?�다.</div>`;
  } else {
    h += `<div style="padding:6px 0">`;
    proItems.slice(0,50).forEach(item=>{
      const typeBg=item.type==='?�반'?'#dbeafe':'#f3e8ff';
      const typeCol=item.type==='?�반'?'#2563eb':'#7c3aed';
      let result='';
      if(item.type==='?�반'){
        const sa=item.scoreA||0;const sb=item.scoreB||0;
        if(sa>0||sb>0) result=`<span style="font-weight:800;color:${sa>sb?'#16a34a':'var(--text3)'}">${sa}</span><span style="color:var(--gray-l);margin:0 2px">:</span><span style="font-weight:800;color:${sb>sa?'#16a34a':'var(--text3)'}">${sb}</span>`;
        else result='<span style="color:var(--gray-l);font-size:11px">기록?�음</span>';
      } else {
        result=item.winner?`<span style="font-size:11px;font-weight:700;color:#16a34a;background:#dcfce7;padding:1px 8px;border-radius:10px">${item.winner==='A'?item.aLabel:item.bLabel} ??/span>`:`<span style="font-size:11px;color:var(--gray-l);background:var(--surface);padding:1px 8px;border-radius:10px">?�정</span>`;
      }
      h+=`<div style="display:flex;align-items:center;gap:8px;padding:7px 14px;border-bottom:1px solid var(--border);flex-wrap:wrap">
        <span style="font-size:10px;color:var(--gray-l);min-width:76px;white-space:nowrap">${item.d||'?�짜미정'}</span>
        <span style="font-size:10px;font-weight:700;padding:1px 7px;border-radius:10px;background:${typeBg};color:${typeCol}">${item.type}</span>
        <span style="font-size:12px;font-weight:600;flex:1;min-width:0">${item.label}</span>
        <span>${result}</span>
        ${item.note?`<span style="font-size:10px;color:var(--gray-l);white-space:nowrap">${item.note}</span>`:''}
        ${item.map?`<span style="font-size:10px;color:var(--gray-l)">?��${item.map}</span>`:''}
      </div>`;
    });
    h+=`</div>`;
  }
  h+=`</div>`;
  C.innerHTML = h;
}

/* ?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?
   공유카드 ?�퍼 (?�로리그 ?�??
?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?*/
function _openProCompLeagueShareCard(tnId, gi, mi) {
  const tn = _findTourneyById(tnId);
  if (!tn) return;
  const grp = (tn.groups||[])[gi];
  const m = grp?.matches?.[mi];
  if (!m || !m.winner) return;
  const aWin = m.winner==='A';
  const gl = 'ABCDEFGHIJ'[gi]||gi;
  // 조별리그: ?�수 ?�속 ?�???�상 ?�용 ??경기마다 ?�른 컬러
  const shareObj = {
    a: m.a||'', b: m.b||'',
    sa: aWin?1:0, sb: aWin?0:1,
    d: m.d||'', n: `${tn.name}`,
    _subLabel: `GROUP ${gl}`,
    sets: [{
      scoreA: aWin?1:0, scoreB: aWin?0:1,
      winner: m.winner,
      games: [{playerA:m.a||'', playerB:m.b||'', winner:m.winner, map:m.map||''}]
    }],
    _noUnivIcon: false, _usePlayerPhoto: true, _matchType: ''  // ?�수 ?�로???�진 + ?�???�상
  };
  window._shareMatchObj = shareObj;
  window._shareMode = 'match';
  openShareCardModal();
  setTimeout(() => renderShareCardByMatchObj(shareObj), 80);
}

function _openProCompTeamShareCard(tnId, tmi) {
  const tn = _findTourneyById(tnId);
  if (!tn) return;
  const tm = (tn.teamMatches||[])[tmi];
  if (!tm || !(tm.games||[]).length) return;
  const games = (tm.games||[]).map(g => ({
    playerA: g._sideW==='A' ? g.wName : g.lName,
    playerB: g._sideW==='A' ? g.lName : g.wName,
    winner: g._sideW||'A',
    map: g.map||''
  }));
  // ?�?? ?�이�?vs ?�크?�드 (?�??��??�낌)
  const shareObj = {
    a: tm.teamAName||'A?�?, b: tm.teamBName||'B?�?,
    sa: tm.sa||0, sb: tm.sb||0,
    d: tm.d||'', n: tn.name,
    sets: [{scoreA:tm.sa||0, scoreB:tm.sb||0, winner:tm.sa>tm.sb?'A':tm.sb>tm.sa?'B':'', games}],
    _noUnivIcon: true, _matchType: 'procomp-team'
  };
  window._shareMatchObj = shareObj;
  window._shareMode = 'match';
  openShareCardModal();
  setTimeout(() => renderShareCardByMatchObj(shareObj), 80);
}

function _openProCompBktShareCard(tnId, ri, mi) {
  const tn = _findTourneyById(tnId);
  if (!tn) return;
  const rounds = tn.bracket||[];
  const m = (rounds[ri]||[])[mi];
  if (!m || !m.winner) return;
  const rndLabel = ri===rounds.length-1?'결승':ri===rounds.length-2?'준결승':ri===rounds.length-3?'4�?:`${Math.pow(2,rounds.length-ri)}�?;
  const aWin = m.winner==='A';
  // ?�진?? ?�버(골드) vs ?�퍼??(?�너먼트/챔피?�십 ?�낌)
  const shareObj = {
    a: m.a||'', b: m.b||'',
    sa: aWin?1:0, sb: aWin?0:1,
    d: m.d||'', n: `${tn.name}`,
    _subLabel: rndLabel,
    sets: [{
      scoreA: aWin?1:0, scoreB: aWin?0:1,
      winner: m.winner,
      games: [{playerA:m.a||'', playerB:m.b||'', winner:m.winner, map:m.map||''}]
    }],
    _noUnivIcon: false, _usePlayerPhoto: true, _matchType: 'procomp-bkt'
  };
  window._shareMatchObj = shareObj;
  window._shareMode = 'match';
  openShareCardModal();
  setTimeout(() => renderShareCardByMatchObj(shareObj), 80);
}

/* ?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?
   �??�체 공유카드
?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?*/
function _openProCompGrpAllShareCard(tnId, gi) {
  const tn = _findTourneyById(tnId);
  if (!tn) return;
  const grp = (tn.groups||[])[gi];
  if (!grp) return;
  openShareCardModal();
  setTimeout(() => _renderProCompGrpShareCard(tnId, gi), 80);
}

function _renderProCompGrpShareCard(tnId, gi) {
  const card = document.getElementById('share-card');
  if (!card) return;
  const tn = _findTourneyById(tnId);
  if (!tn) return;
  const grp = (tn.groups||[])[gi];
  if (!grp) return;
  const GL = 'ABCDEFGHIJ';
  const col = ['#2563eb','#dc2626','#16a34a','#d97706','#7c3aed','#0891b2'][gi%6];
  const ranks = _calcProGrpRank(grp);
  const allM = grp.matches||[];
  const doneM = allM.filter(m=>m.winner);
  const pendM = allM.filter(m=>!m.winner);
  const pct = allM.length ? Math.round(doneM.length/allM.length*100) : 0;

  // ?�수 ?�바?�???  const avatarRow = ranks.map(r => {
    const p = players.find(x=>x.name===r.name);
    const photo = p&&p.photo
      ? `<img src="${p.photo}" style="width:36px;height:36px;border-radius:50%;object-fit:cover;border:2px solid ${col}66" onerror="this.style.display='none'">`
      : `<span style="width:36px;height:36px;border-radius:50%;background:${col}22;border:2px solid ${col}44;display:inline-flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;color:${col}">${(r.name||'?').slice(0,1)}</span>`;
    return `<div style="display:flex;flex-direction:column;align-items:center;gap:3px;min-width:40px">
      ${photo}
      <span style="font-size:9px;font-weight:600;color:rgba(255,255,255,.75);white-space:nowrap;max-width:46px;overflow:hidden;text-overflow:ellipsis">${r.name}</span>
    </div>`;
  }).join('');

  // ?�위????  const rankRows = ranks.map((r, idx) => {
    const total = r.w + r.l;
    const wr = total ? Math.round(r.w/total*100) : 0;
    const medal = idx===0?'?��':idx===1?'?��':idx===2?'?��':'';
    const p = players.find(x=>x.name===r.name);
    const photoCell = p&&p.photo
      ? `<img src="${p.photo}" style="width:26px;height:26px;border-radius:50%;object-fit:cover;border:1.5px solid ${idx===0?col+'aa':'#ddd'}" onerror="this.outerHTML=''">`
      : `<span style="width:26px;height:26px;border-radius:50%;background:${col}18;display:inline-flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:${col};flex-shrink:0">${(r.name||'?').slice(0,1)}</span>`;
    const raceBadge = p&&p.race?`<span style="font-size:8px;padding:1px 4px;border-radius:3px;font-weight:700;background:${p.race==='T'?'#dbeafe':p.race==='Z'?'#ede9fe':'#fef3c7'};color:${p.race==='T'?'#1e40af':p.race==='Z'?'#5b21b6':'#92400e'}">${p.race}</span>`:'';
    return `<tr style="border-top:1px solid ${col}18;${idx===0?'background:'+col+'0a':''}">
      <td style="padding:6px 8px;text-align:center;font-size:14px;width:28px">${medal||String(idx+1)}</td>
      <td style="padding:6px 6px">
        <div style="display:flex;align-items:center;gap:5px">
          ${photoCell}
          <span style="font-weight:${idx<2?'800':'600'};font-size:12px;color:#1e293b">${r.name}</span>
          ${raceBadge}
        </div>
      </td>
      <td style="padding:6px 8px;text-align:center;font-weight:700;color:#16a34a;font-size:12px">${r.w}</td>
      <td style="padding:6px 8px;text-align:center;color:#dc2626;font-size:12px">${r.l}</td>
      <td style="padding:6px 8px;text-align:center;font-weight:700;font-size:12px;color:${wr>=70?col:'#64748b'}">${wr}%</td>
    </tr>`;
  }).join('');

  // 경기 결과 목록
  const matchRows = doneM.map(m => {
    const winner = m.winner==='A'?m.a:m.b;
    const loser  = m.winner==='A'?m.b:m.a;
    const wp = players.find(x=>x.name===winner);
    const lp = players.find(x=>x.name===loser);
    const wPhoto = wp&&wp.photo
      ? `<img src="${wp.photo}" style="width:20px;height:20px;border-radius:50%;object-fit:cover" onerror="this.style.display='none'">`
      : `<span style="width:20px;height:20px;border-radius:50%;background:${col}22;display:inline-flex;align-items:center;justify-content:center;font-size:9px;font-weight:700;color:${col}">${(winner||'?').slice(0,1)}</span>`;
    const lPhoto = lp&&lp.photo
      ? `<img src="${lp.photo}" style="width:20px;height:20px;border-radius:50%;object-fit:cover;opacity:.55" onerror="this.style.display='none'">`
      : `<span style="width:20px;height:20px;border-radius:50%;background:#94a3b822;display:inline-flex;align-items:center;justify-content:center;font-size:9px;font-weight:700;color:#94a3b8">${(loser||'?').slice(0,1)}</span>`;
    return `<div style="display:flex;align-items:center;gap:5px;padding:4px 0;border-bottom:1px solid ${col}12">
      <div style="display:flex;align-items:center;gap:3px;flex:1;min-width:0">
        ${wPhoto}
        <span style="font-weight:700;font-size:11px;color:#1e293b;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${winner}</span>
      </div>
      <span style="font-size:10px;font-weight:900;color:${col};flex-shrink:0;padding:1px 7px;background:${col}15;border-radius:4px">WIN</span>
      <div style="display:flex;align-items:center;gap:3px;flex:1;min-width:0;justify-content:flex-end">
        <span style="font-size:11px;color:#94a3b8;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${loser}</span>
        ${lPhoto}
      </div>
      ${m.map?`<span style="font-size:9px;color:#94a3b8;flex-shrink:0;margin-left:3px">?��${m.map}</span>`:''}
    </div>`;
  }).join('');

  card.innerHTML = `<div style="background:#f8fafc;color:#1e293b;min-width:320px;border-radius:18px;overflow:hidden;font-family:'Noto Sans KR',sans-serif">

    <!-- ?�더 -->
    <div style="background:linear-gradient(135deg,${col},${col}dd);padding:18px 20px 16px;position:relative;overflow:hidden">
      <div style="position:absolute;top:-20px;right:-20px;width:100px;height:100px;border-radius:50%;background:rgba(255,255,255,.1)"></div>
      <div style="position:absolute;bottom:-30px;left:10px;width:80px;height:80px;border-radius:50%;background:rgba(255,255,255,.07)"></div>
      <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:12px">
        <div>
          <div style="font-size:10px;color:rgba(255,255,255,.7);font-weight:600;letter-spacing:.5px;margin-bottom:2px">?�� ${tn.name}</div>
          <div style="font-size:20px;font-weight:900;color:#fff;letter-spacing:1px">GROUP ${GL[gi]}</div>
          ${grp.name?`<div style="font-size:11px;color:rgba(255,255,255,.75);margin-top:1px">${grp.name}</div>`:''}
        </div>
        <div style="text-align:right">
          <div style="font-size:22px;font-weight:900;color:#fff">${pct}%</div>
          <div style="font-size:9px;color:rgba(255,255,255,.65)">${doneM.length}/${allM.length} ?�료</div>
        </div>
      </div>
      <div style="height:4px;background:rgba(255,255,255,.2);border-radius:2px;margin-bottom:14px">
        <div style="height:100%;width:${pct}%;background:rgba(255,255,255,.85);border-radius:2px"></div>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">${avatarRow}</div>
    </div>

    <!-- ?�위??-->
    <div style="padding:14px 16px 10px">
      <div style="font-size:10px;font-weight:800;color:${col};letter-spacing:.5px;margin-bottom:8px">?�� ?�재 ?�위</div>
      <table style="width:100%;border-collapse:collapse">
        <thead><tr style="background:${col}10">
          <th style="padding:5px 8px;text-align:center;width:28px;font-size:10px;color:#64748b;font-weight:700">?�위</th>
          <th style="padding:5px 6px;text-align:left;font-size:10px;color:#64748b;font-weight:700">?�수</th>
          <th style="padding:5px 8px;text-align:center;font-size:10px;color:#16a34a;font-weight:700">??/th>
          <th style="padding:5px 8px;text-align:center;font-size:10px;color:#dc2626;font-weight:700">??/th>
          <th style="padding:5px 8px;text-align:center;font-size:10px;color:#64748b;font-weight:700">?�률</th>
        </tr></thead>
        <tbody>${rankRows}</tbody>
      </table>
    </div>

    ${doneM.length?`<div style="padding:0 16px 14px">
      <div style="font-size:10px;font-weight:800;color:${col};letter-spacing:.5px;margin-bottom:8px">?�� 경기 결과</div>
      ${matchRows}
    </div>`:''}

    ${pendM.length?`<div style="padding:4px 16px 12px;font-size:10px;color:#94a3b8;text-align:center">??${pendM.length}경기 ?�음</div>`:''}

    <div style="background:${col}0d;padding:8px 16px;display:flex;align-items:center;justify-content:flex-end">
      <span style="font-size:9px;color:#94a3b8">?�� ?��??�???�이???�터</span>
    </div>
  </div>`;
}

/* ?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═
   ?�️ ?�로리그 ?�???�장???�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═?�═ */
function proCompGJSection(tn) {
  if (!tn) return `<div style="padding:30px;text-align:center;color:var(--gray-l)">?�?��? ?�택?�세??</div>`;
  if (!tn.gjMatches) tn.gjMatches = [];
  const _pOpts = (players||[]).map(p=>`<option value="${p.name}">${p.name}${p.univ?` (${p.univ})`:''}</option>`).join('');
  let h = '';
  if (isLoggedIn) {
    h += `<div style="background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:14px;margin-bottom:14px">
      <div style="font-weight:700;font-size:13px;margin-bottom:10px">?�️ ?�장??추�?</div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:flex-end">
        <div>
          <div style="font-size:11px;font-weight:700;color:var(--blue);margin-bottom:3px">?�� ?�수 A</div>
          <select id="pcgj-a" style="min-width:120px"><option value="">???�수 ?�택 ??/option>${_pOpts}</select>
        </div>
        <div style="font-size:16px;font-weight:800;color:var(--gray-l);padding-bottom:4px">VS</div>
        <div>
          <div style="font-size:11px;font-weight:700;color:var(--red);margin-bottom:3px">?�� ?�수 B</div>
          <select id="pcgj-b" style="min-width:120px"><option value="">???�수 ?�택 ??/option>${_pOpts}</select>
        </div>
        <div>
          <div style="font-size:11px;font-weight:700;color:var(--gray-l);margin-bottom:3px">?�� ?�짜</div>
          <input type="date" id="pcgj-date" value="${new Date().toISOString().slice(0,10)}" style="width:140px">
        </div>
      </div>
      <div id="pcgj-games" style="margin-top:10px"></div>
      <div style="display:flex;gap:6px;margin-top:8px;flex-wrap:wrap">
        <button class="btn btn-b btn-sm" onclick="pcgjAddGame()">+ 게임 추�?</button>
        <button class="btn btn-g btn-sm" onclick="proCompGJSave('${tn.id}')">???�??/button>
      </div>
    </div>`;
  }
  if (!tn.gjMatches.length) {
    h += `<div class="empty-state"><div class="empty-state-icon">?�️</div><div class="empty-state-title">?�장??기록???�습?�다</div><div class="empty-state-desc">?�에??경기�?추�??�세??/div></div>`;
    return h;
  }
  tn.gjMatches.slice().reverse().forEach((sess, ri) => {
    const si = tn.gjMatches.length - 1 - ri;
    const p1w = (sess.games||[]).filter(g=>g.winner===sess.a).length;
    const p2w = (sess.games||[]).filter(g=>g.winner===sess.b).length;
    const winner = p1w>p2w?sess.a:p2w>p1w?sess.b:'';
    h += `<div style="border:1px solid var(--border);border-radius:8px;margin-bottom:8px;overflow:hidden">
      <div style="background:var(--bg2);padding:10px 14px;display:flex;align-items:center;gap:10px;flex-wrap:wrap">
        <span style="font-size:11px;color:var(--gray-l)">${sess.d||'?�짜 미정'}</span>
        <span style="font-weight:700;color:var(--blue);cursor:pointer" onclick="openPlayerModal('${(sess.a||'').replace(/'/g,"\\'")}'">${sess.a||'?'}</span>
        <span style="font-weight:900;color:var(--blue)">${p1w} - ${p2w}</span>
        <span style="font-weight:700;cursor:pointer" onclick="openPlayerModal('${(sess.b||'').replace(/'/g,"\\'")}'">${sess.b||'?'}</span>
        ${winner?`<span style="font-size:11px;color:#16a34a;font-weight:700">(${winner} ??</span>`:''}
        <span style="font-size:11px;color:var(--gray-l)">${(sess.games||[]).length}게임</span>
        ${isLoggedIn?`<button class="btn btn-r btn-xs" style="margin-left:auto" onclick="proCompGJDel('${tn.id}',${si})">?���???��</button>`:'<span style="margin-left:auto"></span>'}
      </div>
      <table style="margin:0;border-radius:0"><thead><tr><th>게임</th><th>${sess.a||'A'}</th><th style="color:var(--gray-l)">vs</th><th>${sess.b||'B'}</th><th>�?/th></tr></thead><tbody>
      ${(sess.games||[]).map((g,gi)=>{
        const aWin=g.winner===sess.a;
        return `<tr>
          <td style="font-size:11px;color:var(--gray-l)">${gi+1}게임</td>
          <td style="font-weight:${aWin?'900':'400'};color:${aWin?'var(--blue)':'#aaa'}">${aWin?'??'+sess.a:sess.a}</td>
          <td style="color:var(--gray-l);text-align:center">vs</td>
          <td style="font-weight:${!aWin?'900':'400'};color:${!aWin?'var(--blue)':'#aaa'}">${!aWin?'??'+sess.b:sess.b}</td>
          <td style="font-size:11px;color:var(--gray-l)">${g.map||''}</td>
        </tr>`;
      }).join('')}
      </tbody></table>
    </div>`;
  });
  return h;
}

let _pcgjGames = [];
function pcgjAddGame() {
  _pcgjGames.push({winner:'', map:''});
  _pcgjRender();
}
function _pcgjRender() {
  const cont = document.getElementById('pcgj-games');
  if (!cont) return;
  const a = document.getElementById('pcgj-a')?.value||'A?�수';
  const b = document.getElementById('pcgj-b')?.value||'B?�수';
  cont.innerHTML = _pcgjGames.map((g,i)=>`
    <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;padding:6px 0;border-top:1px solid var(--border)">
      <span style="font-size:11px;color:var(--gray-l);min-width:40px">${i+1}게임</span>
      <select onchange="_pcgjGames[${i}].winner=this.value" style="flex:1;min-width:120px">
        <option value="">???�자 ?�택 ??/option>
        <option value="${a}"${g.winner===a?' selected':''}>?�� ${a} ??/option>
        <option value="${b}"${g.winner===b?' selected':''}>?�� ${b} ??/option>
      </select>
      <input type="text" value="${g.map||''}" placeholder="맵명" style="flex:1;min-width:80px;padding:4px 8px;border:1px solid var(--border2);border-radius:5px;font-size:12px" oninput="_pcgjGames[${i}].map=this.value">
      <button class="btn btn-r btn-xs" onclick="_pcgjGames.splice(${i},1);_pcgjRender()">×</button>
    </div>`).join('');
}
function proCompGJSave(tnId) {
  const tn = _findTourneyById(tnId); if (!tn) return;
  const a = document.getElementById('pcgj-a')?.value||'';
  const b = document.getElementById('pcgj-b')?.value||'';
  const d = document.getElementById('pcgj-date')?.value||'';
  if (!a||!b) return alert('?�수 A?�?B�??�택?�세??');
  if (!_pcgjGames.length) return alert('게임??1�??�상 추�??�세??');
  const matchId = genId();
  if (!tn.gjMatches) tn.gjMatches = [];
  const sess = {_id:matchId, d, a, b, games:_pcgjGames.map(g=>({...g}))};
  tn.gjMatches.unshift(sess);
  // ?�수 ?�적 반영
  sess.games.forEach(g => {
    if (!g.winner) return;
    const wn = g.winner; const ln = wn===a?b:a;
    applyGameResult(wn, ln, d, g.map||'', matchId, '', '', '?�로리그?�?�끝?�전');
  });
  _pcgjGames = [];
  save(); render();
}
function proCompGJDel(tnId, si) {
  if (!confirm('?�장??기록????��?�니??\n?�️ ?�수 ?�적??롤백?�니??')) return;
  const tn = _findTourneyById(tnId); if (!tn||!tn.gjMatches) return;
  const sess = tn.gjMatches[si]; if (!sess) return;
  // ?�적 롤백
  if (sess._id) {
    (players||[]).forEach(p => {
      if (!p.history) return;
      p.history = p.history.filter(h => h.matchId !== sess._id);
    });
  }
  tn.gjMatches.splice(si, 1);
  save(); render();
}
