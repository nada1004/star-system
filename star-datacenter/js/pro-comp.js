/* ══════════════════════════════════════
   프로리그 개인 대회
   - proTourneys: [{id,name,groups:[{name,players:[],matches:[{a,b,winner,d,map}]}]}]
   - 조별리그 + 조별순위 + 대진표 + 조편성관리
══════════════════════════════════════ */

let proCompSub = 'league';
let proCompFilterDate = '';
let proCompFilterGrp = '';
let proCompSortDir = 'desc';
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

  let h = `<div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;flex-wrap:wrap;padding:12px 16px;background:var(--gold-bg);border:1px solid var(--gold-b);border-radius:10px">
    <span style="font-weight:700;color:var(--gold);white-space:nowrap">🎖️ 대회 선택:</span>
    <select style="flex:1;max-width:220px;font-weight:700" onchange="curProComp=this.value;proCompFilterDate='';proCompFilterGrp='';save();render()">
      <option value="">— 대회를 선택하세요 —</option>
      ${proTourneys.map(t=>`<option value="${t.name}"${curProComp===t.name?' selected':''}>${t.name}</option>`).join('')}
    </select>
    ${isLoggedIn?`<button class="btn btn-b btn-xs" onclick="proCompNewTourney()">+ 새 대회</button>`:''}
    ${tn&&isLoggedIn?`<button class="btn btn-w btn-xs" onclick="proCompRenameTourney()" title="대회명 수정">✏️ 이름수정</button><button class="btn btn-r btn-xs" onclick="proCompDelTourney()" title="현재 대회 삭제">🗑️ 삭제</button>`:''}
    ${tn?`<span style="font-size:11px;color:var(--gray-l)">🏆 ${tn.groups.length}개 조 · ${tn.groups.reduce((s,g)=>s+(g.matches||[]).length,0)}경기</span>`:''}
  </div>`;

  const subOpts = [
    {id:'league', lbl:'📅 조별리그 일정'},
    {id:'grprank', lbl:'📊 조별 순위'},
    {id:'tour', lbl:'🗂️ 대진표'},
    ...(isLoggedIn?[{id:'grpedit', lbl:'🏗️ 조편성 관리'}]:[]),
  ];
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
      <div style="flex:1;font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:13px;color:#1e3a8a;padding:8px 16px;margin-bottom:10px;background:linear-gradient(90deg,#1e3a8a10,transparent);border-left:4px solid #2563eb;border-radius:0 8px 8px 0">📅 ${dateLabel}</div>`;
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
          <span style="font-weight:${isWin?'900':'600'};font-size:13px;color:${isWin?'#16a34a':'var(--text)'};margin-top:2px">${p?p.name:'—'}</span>
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
  let h = `<div style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:15px;color:var(--blue);margin-bottom:14px">📊 ${tn.name} — 조별 순위</div>`;
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
                <span style="font-weight:${idx<2?'800':'600'};font-size:13px">${r.name}</span>
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
   대진표 (단계별 토너먼트)
────────────────────────────────────── */
function proCompBracket(tn) {
  if (!tn) return `<div style="padding:30px;text-align:center;color:var(--gray-l)">대회를 선택하세요.</div>`;
  if (!tn.bracket || !tn.bracket.length) {
    return `<div style="padding:40px;text-align:center;background:var(--surface);border-radius:12px;border:2px dashed var(--border2)">
      <div style="font-size:36px;margin-bottom:12px">🗂️</div>
      <div style="font-size:15px;font-weight:700;margin-bottom:8px">대진표가 없습니다</div>
      <div style="color:var(--gray-l);margin-bottom:20px;font-size:13px">조별 순위 확정 후 관리자가 대진표를 생성합니다.</div>
      ${isLoggedIn?`<button class="btn btn-b" onclick="proCompInitBracket('${tn.id}')">🎯 대진표 생성</button>`:''}
    </div>`;
  }
  let h = `<div style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:15px;color:var(--blue);margin-bottom:16px">🗂️ ${tn.name} — 대진표</div>`;
  const rounds = tn.bracket;
  h += `<div style="display:flex;gap:16px;overflow-x:auto;padding-bottom:12px">`;
  rounds.forEach((rnd, ri) => {
    const rndLabel = ri===rounds.length-1?'결승':ri===rounds.length-2?'준결승':ri===rounds.length-3?'4강':`${Math.pow(2,rounds.length-ri)}강`;
    h += `<div style="min-width:160px;flex-shrink:0">
      <div style="text-align:center;font-size:11px;font-weight:800;color:var(--blue);margin-bottom:8px;padding:4px;background:var(--blue-l);border-radius:6px">${rndLabel}</div>
      <div style="display:flex;flex-direction:column;gap:${ri===0?8:Math.pow(2,ri)*8+8}px">`;
    rnd.forEach((m, mi) => {
      const aWin = m.winner==='A';
      const bWin = m.winner==='B';
      const isDone = !!m.winner;
      h += `<div style="border:1.5px solid ${isDone?'var(--blue)':'var(--border)'};border-radius:8px;overflow:hidden;background:var(--white);box-shadow:0 2px 8px rgba(0,0,0,.06)">
        <div style="padding:7px 10px;border-bottom:1px solid var(--border);font-size:12px;font-weight:${aWin?'800':'400'};color:${aWin?'#16a34a':'var(--text)'};background:${aWin?'#dcfce7':'var(--white)'};display:flex;align-items:center;justify-content:space-between">
          <span>${m.a||'TBD'}</span>
          ${aWin?'<span style="font-size:10px;font-weight:900;color:#16a34a">WIN</span>':''}
        </div>
        <div style="padding:7px 10px;font-size:12px;font-weight:${bWin?'800':'400'};color:${bWin?'#16a34a':'var(--text)'};background:${bWin?'#dcfce7':'var(--white)'};display:flex;align-items:center;justify-content:space-between">
          <span>${m.b||'TBD'}</span>
          ${bWin?'<span style="font-size:10px;font-weight:900;color:#16a34a">WIN</span>':''}
        </div>
        ${isLoggedIn?`<div style="padding:4px 6px;background:var(--surface);display:flex;gap:3px">
          <button class="btn btn-xs" style="flex:1;font-size:9px;${aWin?'background:#16a34a;color:#fff;border-color:#16a34a':''}" onclick="proCompSetBktWinner('${tn.id}',${ri},${mi},'A')">${m.a||'A'} 승</button>
          <button class="btn btn-xs" style="flex:1;font-size:9px;${bWin?'background:#16a34a;color:#fff;border-color:#16a34a':''}" onclick="proCompSetBktWinner('${tn.id}',${ri},${mi},'B')">${m.b||'B'} 승</button>
        </div>`:''}
      </div>`;
    });
    h += `</div></div>`;
  });
  h += `</div>`;
  if (isLoggedIn) {
    h += `<div style="margin-top:12px;display:flex;gap:8px">
      <button class="btn btn-r btn-sm" onclick="proCompResetBracket('${tn.id}')">🔄 대진표 초기화</button>
    </div>`;
  }
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
  if (!tn||!tn.bracket) return;
  const m = tn.bracket[ri][mi];
  if (!m) return;
  m.winner = m.winner===winner ? '' : winner;
  // 다음 라운드에 승자 전파
  if (m.winner && tn.bracket[ri+1]) {
    const nextMi = Math.floor(mi/2);
    const isA = mi%2===0;
    const winner_name = m.winner==='A' ? m.a : m.b;
    if (!tn.bracket[ri+1][nextMi]) tn.bracket[ri+1][nextMi] = {a:'', b:'', winner:''};
    if (isA) tn.bracket[ri+1][nextMi].a = winner_name;
    else     tn.bracket[ri+1][nextMi].b = winner_name;
  }
  save(); render();
}

function proCompResetBracket(tnId) {
  if (!confirm('대진표를 초기화하시겠습니까?')) return;
  const tn = proTourneys.find(t=>t.id===tnId);
  if (!tn) return;
  tn.bracket = [];
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
          <button class="btn btn-b btn-sm" style="margin-top:6px" onclick="proCompAddMatch('${tn.id}',${gi})">+ 경기 추가</button>
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
function proCompAddMatch(tnId, gi) {
  const tn = proTourneys.find(t=>t.id===tnId);
  if (!tn||!tn.groups[gi]) return;
  const grp = tn.groups[gi];
  const players_list = grp.players||[];
  if (players_list.length < 2) { alert('조에 선수가 2명 이상 필요합니다.'); return; }
  const pA = prompt(`A 선수 이름 (조 선수: ${players_list.join(', ')})`,'');
  if (pA===null) return;
  const pB = prompt(`B 선수 이름`,'');
  if (pB===null) return;
  const d = prompt('경기 날짜 (YYYY-MM-DD)', new Date().toISOString().slice(0,10));
  if (d===null) return;
  if (!grp.matches) grp.matches = [];
  grp.matches.push({a:pA.trim(), b:pB.trim(), winner:'', d:d.trim(), map:''});
  save(); render();
}

function proCompEditMatch(tnId, gi, mi) {
  const tn = proTourneys.find(t=>t.id===tnId);
  if (!tn||!tn.groups[gi]) return;
  const m = tn.groups[gi].matches[mi];
  if (!m) return;
  proCompMatchState = {tnId, gi, mi};
  // 간단한 인라인 모달
  const modal = document.createElement('div');
  modal.id = 'proMatchModal';
  modal.style.cssText = 'position:fixed;inset:0;background:#0008;z-index:9999;display:flex;align-items:center;justify-content:center';
  modal.innerHTML = `<div style="background:var(--white);border-radius:16px;padding:24px;width:320px;max-width:95vw;box-shadow:0 8px 40px rgba(0,0,0,.3)">
    <div style="font-weight:900;font-size:15px;margin-bottom:16px">✏️ 경기 결과 입력</div>
    <div style="margin-bottom:10px">
      <label style="font-size:12px;font-weight:700;color:var(--text3)">A 선수</label>
      <input id="pm_a" value="${m.a||''}" style="width:100%;padding:8px;border-radius:8px;border:1px solid var(--border);margin-top:4px;box-sizing:border-box">
    </div>
    <div style="margin-bottom:10px">
      <label style="font-size:12px;font-weight:700;color:var(--text3)">B 선수</label>
      <input id="pm_b" value="${m.b||''}" style="width:100%;padding:8px;border-radius:8px;border:1px solid var(--border);margin-top:4px;box-sizing:border-box">
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

function proCompSaveMatch() {
  const {tnId, gi, mi} = proCompMatchState;
  const tn = proTourneys.find(t=>t.id===tnId);
  if (!tn||!tn.groups[gi]) return;
  const m = tn.groups[gi].matches[mi];
  if (!m) return;
  m.a = document.getElementById('pm_a').value.trim();
  m.b = document.getElementById('pm_b').value.trim();
  m.d = document.getElementById('pm_d').value;
  m.map = document.getElementById('pm_map').value.trim();
  const winA = document.getElementById('pm_winA').classList.contains('btn-b');
  const winB = document.getElementById('pm_winB').classList.contains('btn-b');
  m.winner = winA?'A':winB?'B':'';
  document.getElementById('proMatchModal').remove();
  save(); render();
}

function proCompDelMatch(tnId, gi, mi) {
  if (!confirm('경기를 삭제하시겠습니까?')) return;
  const tn = proTourneys.find(t=>t.id===tnId);
  if (!tn||!tn.groups[gi]) return;
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
  proTourneys.push({id, name:name.trim(), groups:[], bracket:[]});
  curProComp = name.trim();
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
