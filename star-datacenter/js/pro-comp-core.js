/* ══════════════════════════════════════════════════════════════
   프로리그 개인 대회
   - proTourneys: [{id,name,groups:[{name,players:[],matches:[{a,b,winner,d,map}]}]}]
   - 조별리그 + 조별순위 + 대진표 + 조편성 관리
   ══════════════════════════════════════════════════════════════ */

/* 프로리그 proTourneys 실시간 동기화 (기존 데이터 player.history 반영) */
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
        applyGameResult(g.wName, g.lName, tm.d||'', g.map||'', g._id, '', '', '프로리그대회');
        existing.add(g._id); cnt++;
      });
    });
  });
  if (cnt > 0) save();
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

function proCompSyncHistory() {
  // 현재 player.history에 있는 matchId 집합
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
        applyGameResult(g.wName, g.lName, tm.d||'', g.map||'', g._id, '', '', '프로리그대회');
        existing.add(g._id);
        cnt++;
      });
    });
  });
  if (cnt > 0) {
    save();
    alert(`총 ${cnt}경기 전적 동기화`);
    render();
  } else alert('이미 모두 동기화되어 있습니다.');
}

var proCompSub = 'league';
var proCompFilterDate = '';
var proCompFilterGrp = '';
var proCompSortDir = 'desc';
let proCompGrpEditId = null;
let proCompMatchState = {tnId:null, gi:null, mi:null};
let proCompBktState = {tnId:null, rnd:null, mi:null, playerA:'', playerB:''};

// ─────────────────────────────────────────────────────────────
// (요청사항) 프로리그 대회 카드(조별리그/대진표 기록) 프로필 크기: PC/모바일 별도 설정
// - 설정탭에서 su_procomp_avatar_pc / su_procomp_avatar_mb 로 저장
// ─────────────────────────────────────────────────────────────
function _pcReadIntLS(key, def, min, max){
  try{
    const v=parseInt(localStorage.getItem(key)||'',10);
    if(Number.isFinite(v)) return Math.max(min, Math.min(max, v));
  }catch(e){}
  return Math.max(min, Math.min(max, def));
}
function _pcIsMobile(){
  try{ return window.innerWidth <= 768; }catch(e){ return false; }
}
function proCompGetAvatarPx(){
  const pc = _pcReadIntLS('su_procomp_avatar_pc', 88, 28, 200);
  const mb = _pcReadIntLS('su_procomp_avatar_mb', 68, 24, 160);
  return _pcIsMobile() ? mb : pc;
}

function proCompGetAvatarFit(){
  try{
    const v = String(localStorage.getItem('su_procomp_avatar_fit')||'cover').trim();
    return (v==='contain' || v==='cover' || v==='fill') ? v : 'cover';
  }catch(e){
    return 'cover';
  }
}

function proCompGetScoreScale(){
  try{
    const pc = _pcReadIntLS('su_procomp_score_scale_pc', 100, 60, 160);
    const mb = _pcReadIntLS('su_procomp_score_scale_mb', 100, 60, 160);
    const pct = _pcIsMobile() ? mb : pc;
    return Math.max(0.6, Math.min(1.6, (pct||100)/100));
  }catch(e){
    return 1;
  }
}

function proCompGetLayoutScale(){
  try{
    const pc = _pcReadIntLS('su_procomp_layout_scale_pc', 100, 60, 120);
    const mb = _pcReadIntLS('su_procomp_layout_scale_mb', 100, 60, 120);
    const pct = _pcIsMobile() ? mb : pc;
    return Math.max(0.6, Math.min(1.2, (pct||100)/100));
  }catch(e){
    return 1;
  }
}

// ─────────────────────────────────────────────────────────────
// (요청사항) 프로리그 대회 "조별리그"에서는 스테이지(16강/8강/4강/결승) 개념 삭제
// - 기록/순위 탭은 조별리그만 다룸
// - 토너먼트(대진표) 입력/결과는 "🗂️ 대진표 / 📝 입력"에서만 진행
// - 과거 데이터에 grp.stage 값이 있더라도 조별리그 화면에서는 무시함
// ─────────────────────────────────────────────────────────────

function _findTourneyById(tnId) {
  const _pt = (typeof proTourneys!=='undefined' && Array.isArray(proTourneys)) ? proTourneys : [];
  const _t = (typeof tourneys!=='undefined' && Array.isArray(tourneys)) ? tourneys : [];
  return _pt.find(t=>t && t.id===tnId) || _t.find(t=>t && t.id===tnId);
}

function _syncBktMatchToHistory(tn, m, matchId, ri, mi) {
  if (m.winner && m.a && m.b) {
    const d = m.d || new Date().toISOString().slice(0,10);
    const mode = tn.type === 'tier' ? '티어대회' : '프로리그대회';
    // (요청사항) 대진표 기록은 "세부 경기(게임)" 단위로 전부 스트리머 상세/대전기록에 반영
    // - applyGameResult는 matchId 중복을 막기 때문에, 게임별로 고유한 gameId를 만들어 저장
    // - gameId는 "_s?_g?" 패턴을 포함해야 중복 체크가 matchId 단독으로 동작함 (opp/date fallback과 분리)
    if (Array.isArray(m._games) && m._games.length > 0) {
      m._games.forEach((g, gi) => {
        if (!g || !g.winner) return;
        const win = g.winner === 'A' ? m.a : m.b;
        const loss = g.winner === 'A' ? m.b : m.a;
        const gameId = `${matchId}_s0_g${gi}`;
        applyGameResult(win, loss, d, g.map || m.map || '', gameId, '', '', mode);
      });
    } else {
      // 세부 게임이 없으면 매치 1건으로 저장
      const gameId = `${matchId}_s0_g0`;
      applyGameResult(m.winner === 'A' ? m.a : m.b, m.winner === 'A' ? m.b : m.a, d, m.map || '', gameId, '', '', mode);
    }

    if (tn.type === 'tier') {
      let rndLbl = '';
      if (ri === '3rd') {
        rndLbl = '3·4위전';
      } else {
        const totalRnd = tn.bracket.length;
        // 라운드 표기: 16강/8강/4강/결승 (※ 4강=준결승)
        rndLbl = ri === totalRnd - 1 ? '결승' : ri === totalRnd - 2 ? '4강' : ri === totalRnd - 3 ? '8강' : `${Math.pow(2, totalRnd - ri)}강`;
      }
      const games = Array.isArray(m._games) && m._games.length
        ? m._games.map(g => ({ playerA: m.a, playerB: m.b, winner: g.winner, map: g.map || '' }))
        : [{ playerA: m.a, playerB: m.b, winner: m.winner, map: m.map || '' }];
      const scoreA = games.filter(g => g.winner === 'A').length;
      const scoreB = games.filter(g => g.winner === 'B').length;
      const _rec = {
        _id: matchId, _proKey: `ptn_${tn.id}_${ri}_${mi}`,
        d, a: m.a, b: m.b, sa: scoreA, sb: scoreB,
        sets: [{ games, scoreA, scoreB, winner: m.winner, label: rndLbl }],
        n: tn.name, compName: tn.name, teamALabel: m.a, teamBLabel: m.b,
        stage: 'bkt'
      };
      // 기존 동일 ID 기록 제거 후 추가
      const existingIdx = ttM.findIndex(x => x._id === matchId);
      if (existingIdx >= 0) ttM.splice(existingIdx, 1);
      ttM.push(_rec);
      // ttM 변경 후 즉시 저장
      save();
    }
  } else {
  }
}

function getCurrentProTourney() {
  const _pt = (typeof proTourneys!=='undefined' && Array.isArray(proTourneys)) ? proTourneys : [];
  return _pt.find(t=>t && t.name===curProComp) || _pt[0] || null;
}

/* ══════════════════════════════════════════════════════════════
   메인 렌더러
   ══════════════════════════════════════════════════════════════ */
function rProComp(C, T) {
  if (T) T.innerText = '프로리그 대회';
  if (!C) return;
  
  try {
    const _li = (typeof isLoggedIn!=='undefined' ? !!isLoggedIn : false) || !!window.isLoggedIn;
    if(typeof proTourneys==='undefined' || !Array.isArray(proTourneys)) window.proTourneys = [];
    if(typeof proCompSub==='undefined') window.proCompSub = 'league';
    if(typeof curProComp==='undefined') window.curProComp = '';
    if (!_li && proCompSub === 'grpedit') proCompSub = 'league';

    const tn = getCurrentProTourney();
    if (tn && !tn.groups) tn.groups = [];

    const tourneys = (typeof proTourneys!=='undefined' && Array.isArray(proTourneys)) ? proTourneys : [];

    let h = `<div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;flex-wrap:wrap;padding:12px 16px;background:var(--gold-bg);border:1px solid var(--gold-b);border-radius:10px">
      <span style="font-weight:700;color:var(--gold);white-space:nowrap">대회 선택:</span>
      <select style="flex:1;max-width:220px;font-weight:700;padding:6px;border-radius:8px;border:1px solid var(--gold-b)" onchange="curProComp=this.value;proCompFilterDate='';proCompFilterGrp='';localStorage.setItem('su_ptc',curProComp);render()">
        <option value="">대회를 선택하세요</option>
        ${tourneys.map(t=>{
          if (!t) return '';
          const _grpD=(t.groups||[]).flatMap(g=>(g.matches||[]).map(m=>m?m.d:''));
          const _bktD=(t.bracket||[]).flat().map(m=>m&&m.d).concat(t.thirdPlace?[t.thirdPlace.d]:[]);
          const _dates=[..._grpD,..._bktD].filter(d=>typeof d==='string'&&d.length>=2).sort();
          const _range=_dates.length?` (${_dates[0].slice(2).replace(/-/g,'.')}~${_dates[_dates.length-1].slice(2).replace(/-/g,'.')})`:t.createdAt&&t.createdAt.length>=2?` (${t.createdAt.slice(2).replace(/-/g,'.')} 생성)`:'';
          return`<option value="${t.name||''}"${curProComp===t.name?' selected':''}>${t.name||'이름 없음'}${_range}</option>`;
        }).join('')}
      </select>
      ${_li?`<button class="btn btn-b btn-xs" onclick="proCompNewTourney()">+ 새 대회</button>`:''}
      ${tn&&_li?`<button class="btn btn-w btn-xs" onclick="proCompRenameTourney()" title="대회명 수정">✏️ 이름수정</button><button class="btn btn-r btn-xs" onclick="proCompDelTourney()" title="현재 대회 삭제">🗑️ 삭제</button>`:''}
      ${tn?`<span style="font-size:11px;color:var(--gray-l)">총 ${(tn.groups||[]).length}개 조 · ${(tn.groups||[]).reduce((s,g)=>s+(g.matches||[]).length,0)}경기</span>`:''}
    </div>`;

    // 프로리그 대회 서브메뉴
    const subOpts = [
      {id:'league', lbl:'📅 조별리그'},
      {id:'grprank', lbl:'📊 순위'},
      // (요청사항) 대진표(보기) 탭 + 대진표 기록(입력) 탭 모두 제공
      {id:'tour', lbl:'🗂️ 대진표'},
      {id:'tourmatch', lbl:'📋 대진표 기록'},
      {id:'team', lbl:'🤝 팀전'},
      {id:'gj', lbl:'🔥 중장전'},
      {id:'stats', lbl:'📈 통계'},
      ...(_li?[{id:'grpedit', lbl:'🏗️ 관리'}]:[]),
    ];
    const _subOpts = (typeof applyTabLabels==='function') ? applyTabLabels('procomp', subOpts) : subOpts;
    if (!_subOpts.find(o=>o.id===proCompSub)) {
      proCompSub = 'league';
      localStorage.setItem('su_procomp_sub', proCompSub); // [BUGFIX-3] 폴백 시 localStorage 저장
    }
    h += `<div class="fbar no-export" style="overflow-x:auto;flex-wrap:nowrap;-webkit-overflow-scrolling:touch;scrollbar-width:none;gap:4px;margin-bottom:6px">
      ${_subOpts.map(o=>`<button class="pill ${proCompSub===o.id?'on':''}" style="flex-shrink:0;white-space:nowrap" onclick="proCompSub='${o.id}';render()">${o.lbl}</button>`).join('')}
    </div>`;

    if (!tn && proCompSub !== 'grpedit') {
      h += `<div style="padding:60px 20px;text-align:center;background:var(--surface);border-radius:12px;border:2px dashed var(--border2)">
        <div style="font-size:44px;margin-bottom:14px">🏆</div>
        <div style="font-size:16px;font-weight:700;margin-bottom:8px">등록된 대회가 없습니다</div>
        <div style="color:var(--gray-l);margin-bottom:20px">새 대회를 만들고 조편성을 시작해보세요</div>
        ${_li?`<button class="btn btn-b" onclick="proCompNewTourney()">+ 대회 만들기</button>`:''}
      </div>`;
      C.innerHTML = h; return;
    }

    if (proCompSub === 'league') h += proCompLeague(tn);
    else if (proCompSub === 'grprank') h += proCompGrpRank(tn);
    else if (proCompSub === 'tour') {
      h += proCompBracket(tn);
      const _tourRec = proCompTourMatchInput(tn);
      if (_tourRec) h += `<div style="margin-top:18px;padding-top:14px;border-top:2px solid var(--border)">${_tourRec}</div>`;
    }
    else if (proCompSub === 'tourmatch') h += proCompTourMatchInput(tn);
    else if (proCompSub === 'team') h += proCompTeamSection(tn);
    else if (proCompSub === 'gj') h += proCompGJSection(tn);
    else if (proCompSub === 'stats') h += proCompTourneyStats(tn);
    else if (proCompSub === 'grpedit') h += proCompGrpEdit();
    
    C.innerHTML = h;
  } catch (e) {
    console.error(e);
    C.innerHTML = `<div style="padding:30px;color:red;text-align:center">프로리그 대회 렌더링 중 오류가 발생했습니다.<br>${e.message}</div>`;
  }
}

/* 조별리그 일정 */
function proCompLeague(tn) {
  if (!tn) return `<div style="padding:30px;text-align:center;color:var(--gray-l)">대회를 선택하세요.</div>`;
  // (요청사항) 조별리그 탭 하단 '기록:' 영역에서는 조별리그/대진표(보기)만 노출
  // 스테이지(16강/8강/4강/결승) 개념 삭제: 그룹의 stage 값이 있더라도 무시
  const grpList = (tn.groups||[]).map((grp, gi)=>({grp, gi})).filter(x=>x.grp);

  const allMatches = [];
  grpList.forEach(({grp, gi}, idx) => {
    const gl = 'ABCDEFGHIJ'[idx] || idx;
    const col = ['#2563eb','#dc2626','#16a34a','#d97706','#7c3aed','#0891b2'][idx%6];
    (grp.matches||[]).forEach((m, mi) => {
      // (요청사항) 대진표 기록(stage)으로 반영된 경기는 조별리그 화면/순위에서 제외
      if (m && (m._stageRecId || (grp._recTarget||'')==='stage')) return;
      allMatches.push({...m, grpName:grp.name, grpIdx:gi, grpLetter:gl, matchNum:mi+1, grpColor:col});
    });
  });
  allMatches.sort((a,b)=>proCompSortDir==='asc'?(a.d||'9999').localeCompare(b.d||'9999'):(b.d||'').localeCompare(a.d||''));
  const dates = [...new Set(allMatches.map(m=>m.d).filter(Boolean))].sort();
  const _totalM = allMatches.length, _doneM = allMatches.filter(m=>m.winner).length;
  const _pct = _totalM ? Math.round(_doneM/_totalM*100) : 0;
  const _pctColor = _pct===100?'#16a34a':_pct>=50?'#2563eb':'#d97706';
  let h = '';
  // (요청사항) 조별리그 탭 하단의 '기록:' / 조별리그 / 대진표 버튼 영역 제거
  if (_totalM > 0) {
    h += `<div style="margin-bottom:12px;padding:10px 14px;background:var(--surface);border-radius:10px;border:1px solid var(--border)">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
        <span style="font-size:12px;font-weight:700;color:${_pctColor}">전체 진행률</span>
        <span style="font-size:12px;color:var(--gray-l)">${_doneM}/${_totalM}경기 완료</span>
        <span style="margin-left:auto;font-size:13px;font-weight:800;color:${_pctColor}">${_pct}%</span>
      </div>
      <div style="height:8px;background:var(--border);border-radius:4px;overflow:hidden">
        <div style="height:100%;width:${_pct}%;background:${_pctColor};border-radius:4px;transition:.3s"></div>
      </div>
    </div>`;
  }
  h += `<div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;flex-wrap:wrap">
    <div style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:15px;color:var(--blue)">🏆 ${tn.name} <span style="font-size:12px;color:var(--gray-l);font-weight:800">(조별리그)</span></div>
  </div>`;
  if (isLoggedIn && grpList.length) {
    h += `<div class="no-export grp-univ-action-row" style="margin-bottom:6px">
      <span class="grp-univ-action-label">경기 추가:</span>`;
    grpList.forEach(({grp, gi}, idx) => {
      const gl = 'ABCDEFGHIJ'[idx] || idx;
      const col = ['#2563eb','#dc2626','#16a34a','#d97706','#7c3aed','#0891b2'][idx%6];
      const nm = (grp.name||'').trim();
      const lbl = nm || `${gl}조`;
      h += `<button class="btn btn-xs grp-univ-action-btn" style="background:${col};color:#fff;border-color:${col}" onclick="proCompAddMatch('${tn.id}',${gi})">+ ${lbl}</button>`;
    });
    h += `</div>`;
    h += `<div class="no-export grp-univ-action-row" style="margin-bottom:12px">
      <span class="grp-univ-action-label">결과 붙여넣기:</span>`;
    grpList.forEach(({grp, gi}, idx) => {
      const gl = 'ABCDEFGHIJ'[idx] || idx;
      const col = ['#2563eb','#dc2626','#16a34a','#d97706','#7c3aed','#0891b2'][idx%6];
      const nm = (grp.name||'').trim();
      const lbl = nm || `${gl}조`;
      h += `<button class="btn btn-sm grp-univ-action-btn" style="border-color:${col};color:${col}" onclick="proCompOpenPasteModal('${tn.id}',${gi})">📋 ${lbl}</button>`;
    });
    h += `</div>`;
    h += `<div class="no-export" style="margin-bottom:12px;display:flex;align-items:center;gap:8px;flex-wrap:wrap">
      <button class="btn ${window._pcMergeMode?'btn-b':'btn-w'} btn-xs" onclick="proCompToggleMergeMode()">${window._pcMergeMode?'✅ 합치기 모드 종료':'🔀 경기 선택해서 합치기'}</button>
      ${window._pcMergeMode?`<span style="font-size:11px;color:var(--gray-l)">같은 조 · 같은 두 선수의 경기를 선택하세요 (${(window._pcMergeSel&&window._pcMergeSel.size)||0}건 선택됨)</span>
      <button class="btn btn-p btn-xs" onclick="proCompMergeSelectedMatches('${tn.id}')" ${(!window._pcMergeSel||window._pcMergeSel.size<2)?'disabled':''}>선택한 경기 합치기</button>`:''}
    </div>`;
  }
  {
    const days=['일','월','화','수','목','금','토'];
    const fmt=(d)=>{
      if(!d) return '전체';
      const dt=new Date(d+'T00:00:00');
      return `${dt.getMonth()+1}/${dt.getDate()}(${days[dt.getDay()]})`;
    };
    const grpOpts=grpList.map(({grp,gi},idx)=>({name:grp.name,label:(grp.name||`GROUP ${'ABCDEFGHIJ'[idx]||idx+1}`)}));
    h+=`<div class="no-export" style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:10px;padding-bottom:10px;border-bottom:2px solid var(--border)">
      <div class="ym-filter-controls compact">
        <span class="ym-lbl"></span>
        <select class="ym-sel" onchange="proCompFilterDate=this.value;render()">
          <option value=""${!proCompFilterDate?' selected':''}>전체</option>
          ${dates.map(d=>`<option value="${d}"${proCompFilterDate===d?' selected':''}>${fmt(d)}</option>`).join('')}
        </select>
      </div>
      ${grpOpts.length>1?`<div class="ym-filter-controls compact">
        <span class="ym-lbl">조</span>
        <select class="ym-sel" onchange="proCompFilterGrp=this.value;render()">
          <option value=""${!proCompFilterGrp?' selected':''}>전체</option>
          ${grpOpts.map(o=>`<option value="${o.name}"${proCompFilterGrp===o.name?' selected':''}>${o.label}</option>`).join('')}
        </select>
      </div>`:''}
      <div style="margin-left:auto;display:flex;gap:6px;flex-wrap:nowrap">
        <button class="pill ${proCompSortDir==='desc'?'on':''}" style="flex-shrink:0" onclick="proCompSortDir='desc';render()">최신순</button>
        <button class="pill ${proCompSortDir==='asc'?'on':''}" style="flex-shrink:0" onclick="proCompSortDir='asc';render()">오래된순</button>
      </div>
    </div>`;
  }
  if (grpList.length > 1) {
    // 조 선택은 "전체/일자" 메뉴 영역 우측으로 이동됨
    const grpsWithDone = grpList.map(x=>x.grp).filter(g=>(g.matches||[]).some(m=>m.winner));
    if (grpsWithDone.length) {
      h += `<div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:12px;align-items:center"><span style="font-size:11px;font-weight:700;color:var(--gray-l)">조별 공유카드:</span>`;
      grpList.forEach(({grp,gi}, idx) => {
        const gl='ABCDEFGHIJ'[idx]||idx; const col=['#2563eb','#dc2626','#16a34a','#d97706','#7c3aed','#0891b2'][idx%6];
        const gDone=(grp.matches||[]).filter(m=>m.winner).length;
        if (gDone > 0) h += `<button class="btn btn-xs" style="background:${col}15;color:${col};border:1px solid ${col}44;font-size:10px" onclick="_openProCompGrpAllShareCard('${tn.id}',${gi})">📷 GROUP ${gl}</button>`;
      });
      h += `</div>`;
    }
  } else if (grpList.length===1) {
    const gDone=(grpList[0].grp.matches||[]).filter(m=>m.winner).length;
    if (gDone>0) h += `<div style="margin-bottom:10px"><button class="btn btn-w btn-sm" style="min-width:122px;display:inline-flex;align-items:center;justify-content:center" onclick="_openProCompGrpAllShareCard('${tn.id}',${grpList[0].gi})">🎴 공유 카드</button></div>`;
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
      const days=['일','월','화','수','목','금','토'];
      dateLabel = `${dt.getFullYear()}년 ${dt.getMonth()+1}월 ${dt.getDate()}일 ${days[dt.getDay()]}요일`;
    }
    h += `<div style="margin-bottom:22px">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">
        <div style="flex:1;font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:13px;color:#1e3a8a;padding:8px 16px;background:linear-gradient(90deg,#1e3a8a10,transparent);border-left:4px solid #2563eb;border-radius:0 8px 8px 0">📅 ${dateLabel}</div>
        ${isLoggedIn?`<button class="btn btn-b btn-xs no-export" onclick="proCompAddMatchOnDate('${tn.id}','${date}')">+ 경기 추가</button>
        ${date!=='날짜 미정'?`<button class="btn btn-w btn-xs no-export" onclick="proCompOpenDatePaste('${tn.id}','${date}')">📋 결과 입력</button>`:''}`:''}
      </div>`;
    byDate[date].forEach(m => {
      const pa = players.find(p=>p.name===m.a);
      const pb = players.find(p=>p.name===m.b);
      const _ls = (typeof proCompGetLayoutScale==='function') ? proCompGetLayoutScale() : 1;
      const _mainGap = Math.max(6, Math.round(10*_ls));
      const _mainPadT = Math.max(8, Math.round(10*_ls));
      const _mainPadX = Math.max(10, Math.round(12*_ls));
      const _mainPadB = Math.max(10, Math.round(12*_ls));
      const _scoreMinW = Math.max(48, Math.round(60*_ls));
      const _gcByUniv=(name,p)=>{const _u=p&&p.univ?gc(p.univ):'';return(_u&&_u!=='#6b7280')?_u:gc(name||'');};
      const ca = (typeof gc==='function' ? _gcByUniv(m.a,players.find(p=>p.name===m.a)) : '#3b82f6');
      const cb = (typeof gc==='function' ? _gcByUniv(m.b,players.find(p=>p.name===m.b)) : '#ef4444');
      const isDone = !!m.winner;
      const aWin = isDone && m.winner==='A';
      const bWin = isDone && m.winner==='B';
      const winCol = aWin ? gc(pa?.univ||'') : bWin ? gc(pb?.univ||'') : '#64748b';
      const winRgb = _tcHexToRgbStr(winCol);
      const _tb = p => p&&p.tier?`<span style="background:${getTierBtnColor(p.tier)||'#64748b'};color:${getTierBtnTextColor(p.tier)||'#fff'};font-size:9px;font-weight:700;padding:1px 5px;border-radius:4px">${p.tier}</span>`:'';
      const _rb = p => p&&p.race?`<span class="rbadge r${p.race}" style="font-size:9px;padding:0 4px">${p.race}</span>`:'';
      const _univ = p => p&&p.univ?`<span style="font-size:9px;color:var(--gray-l);font-weight:600">${p.univ}</span>`:'';
      const _pcard = (p, isWin) => {
        const isLose = isDone && !isWin;
        const canClick = !!(p && p.name);
        const clickAttr = canClick ? `onclick="openPlayerModal('${escJS(p.name)}')" title="상세 보기"` : '';
        const _isMob = (typeof window!=='undefined' && window.matchMedia && window.matchMedia('(max-width:768px)').matches);
        const av = (typeof proCompGetAvatarPx==='function') ? proCompGetAvatarPx() : 52;
        const fit = (typeof proCompGetAvatarFit==='function') ? proCompGetAvatarFit() : 'cover';
        const bgSize = (fit==='fill') ? '100% 100%' : (fit==='contain' ? 'contain' : 'cover');
        if(_isMob){
          const sz = Math.max(36, Math.round(av * _ls));
          const ring = isWin
            ? 'box-shadow:0 0 0 2px rgba(34,197,94,.55),0 10px 22px rgba(15,23,42,.14);'
            : 'box-shadow:0 10px 22px rgba(15,23,42,.10);';
          const photo = (p && p.photo) ? toHttpsUrl(p.photo) : '';
          const initial = (p && p.name ? p.name : '미').slice(0,1);
          return `<div style="display:flex;flex-direction:column;align-items:center;gap:3px;min-width:80px;flex-shrink:0">
            <div ${clickAttr} style="width:${sz}px;height:${sz}px;flex-shrink:0;border-radius:var(--su_profile_radius,50%);clip-path:var(--su_profile_clip,none);overflow:hidden;background:#e2e8f0;display:flex;align-items:center;justify-content:center;${ring}${isLose?'opacity:.85;filter:grayscale(1);':''}">
              ${photo?`<img src="${photo}" style="width:100%;height:100%;object-fit:${fit};display:block" onerror="this.style.display='none'">`:`<span style="font-size:${Math.max(14,Math.round(sz*0.42))}px;font-weight:1000;color:#94a3b8">${initial}</span>`}
            </div>
            ${p&&p.name?`<div style="font-size:9px;font-weight:800;color:${isLose?'var(--text3)':'var(--text)'};max-width:70px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-align:center">${p.name}</div>`:''}
          </div>`;
        }
        const minW = Math.round(Math.max(148, av + 60) * _ls);
        const minH = Math.round(Math.max(180, av + 80) * _ls);
        const padT = Math.max(6, Math.round(10*_ls));
        const padX = Math.max(6, Math.round(10*_ls));
        const padB = Math.max(8, Math.round(12*_ls));
        const bgImg = (p && p.photo) ? `background-image:url('${toHttpsUrl(p.photo)}');` : '';
        const bgFallback = (!p || !p.photo)
          ? `background:linear-gradient(135deg,${isWin?'#dc2626':'#64748b'}33,${isWin?'#dc2626':'#64748b'}11);`
          : '';
        const name = p ? (p.name||'') : '';
        const initial = (name||'미').slice(0,1);
        return `<div ${clickAttr} style="position:relative;overflow:hidden;display:flex;flex-direction:column;justify-content:flex-end;align-items:center;gap:6px;padding:${padT}px ${padX}px ${padB}px;border-radius:14px;width:${minW}px;height:${minH}px;border:2px solid ${isWin?'#dc2626':'var(--border)'};box-shadow:${isWin?'0 10px 24px rgba(220,38,38,.18)':'0 8px 18px rgba(15,23,42,.08)'};cursor:${canClick?'pointer':'default'};${bgFallback}${bgImg}background-size:${bgSize};background-position:center;background-repeat:no-repeat;${isLose?'opacity:.92;filter:grayscale(1);':''}">
          <div style="position:absolute;inset:0;background:${p&&p.photo
            ? `linear-gradient(180deg, rgba(15,23,42,.06) 0%, rgba(15,23,42,.28) 50%, rgba(15,23,42,.72) 100%)`
            : `linear-gradient(180deg, rgba(255,255,255,.55), rgba(255,255,255,.18))`
          }"></div>
          ${(!p||!p.photo)?`<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:${Math.max(26,Math.round(minH*0.28))}px;font-weight:1000;color:rgba(15,23,42,.20)">${initial}</div>`:''}
          <div style="position:relative;z-index:1;display:flex;flex-direction:column;align-items:center;gap:4px;text-align:center;width:100%">
            <div style="font-weight:1000;font-size:16px;line-height:1.1;color:${p&&p.photo?'#fff':(isWin?'#dc2626':'#0f172a')};text-shadow:${p&&p.photo?'0 2px 10px rgba(0,0,0,.45)':'none'}">${name||'미정'}</div>
            <div style="font-size:11px;font-weight:800;color:${p&&p.photo?'rgba(255,255,255,.85)':'#64748b'};text-shadow:${p&&p.photo?'0 2px 10px rgba(0,0,0,.35)':'none'}">${p?.univ||''}</div>
            <div style="display:flex;gap:4px;align-items:center;justify-content:center;flex-wrap:wrap">
              ${_rb(p)}${_tb(p)}
            </div>
          </div>
        </div>`;
      };
      const _fxCfg=(typeof _getRecSideFxCfg==='function')?_getRecSideFxCfg():{on:true,mode:'soft',intensity:68,length:25};
      const _fxOn=!!_fxCfg.on;
      const _fxMetrics=(typeof _buildRecSideFxMetrics==='function')?_buildRecSideFxMetrics(_fxCfg):null;
      const _fxMode=_fxMetrics?_fxMetrics.mode:'soft';
      const _fxVars=(_fxOn&&typeof _recSideFxVarStyle==='function')?_recSideFxVarStyle(ca||'#3b82f6',cb||'#ef4444',_fxCfg):'';
      const _sideRgbVars=(typeof _tcHexToRgbStr==='function')?`--rec-side-left-rgb:${_tcHexToRgbStr(ca||'#3b82f6')};--rec-side-right-rgb:${_tcHexToRgbStr(cb||'#ef4444')};`:'';
      const _isMob = (typeof window!=='undefined' && window.matchMedia && window.matchMedia('(max-width:768px)').matches);
      const _sc = (typeof proCompGetScoreScale==='function') ? proCompGetScoreScale() : 1;
      const _scoreFont = Math.round((_isMob?13:18) * _sc);
      const _scorePy = Math.round((_isMob?3:6) * _sc);
      const _scorePx = Math.round((_isMob?7:12) * _sc);
      const _scoreSep = _isMob ? 10 : 12;
      const _cardActions = [
        isDone ? (()=>{const _adm=(localStorage.getItem('su_share_admin_only')||'0')==='1'; return (!_adm||isLoggedIn) ? { t:'🎴 공유카드', d:'공유용 카드 생성', kind:'accent', on:()=>_openProCompLeagueShareCard(tn.id,m.grpIdx,m.matchNum-1) } : null;})() : null,
        isLoggedIn ? { t:'✏️ 결과 수정', d:'경기 결과와 세트 수정', kind:'normal', on:()=>proCompEditMatch(tn.id,m.grpIdx,m.matchNum-1) } : null,
        isLoggedIn ? { t:'🗑️ 결과 삭제', d:'이 경기 기록 삭제', kind:'danger', on:()=>proCompDelMatch(tn.id,m.grpIdx,m.matchNum-1) } : null
      ].filter(Boolean);
      const _cardMenu = _cardActions.length ? _compActionMenuHTML(_cardActions) : '';
      const safe = (s)=>String(s??'').replace(/</g,'&lt;').replace(/>/g,'&gt;');
      const _photo = (p, name, isLose)=>{
        const sz=28;
        const url = p && p.photo ? toHttpsUrl(p.photo) : '';
        const click = name ? `onclick="openPlayerModal('${escJS(name)}')"` : '';
        const loseStyle = isLose ? 'filter:grayscale(1);opacity:.55;' : '';
        if(url) return `<img src="${url}" style="width:${sz}px;height:${sz}px;border-radius:var(--su_profile_radius,50%);clip-path:var(--su_profile_clip,none);object-fit:cover;flex-shrink:0;cursor:pointer;${loseStyle}" ${click} onerror="this.style.display='none'">`;
        return `<span style="width:${sz}px;height:${sz}px;border-radius:var(--su_profile_radius,50%);clip-path:var(--su_profile_clip,none);background:var(--surface);border:1px solid var(--border);display:inline-flex;align-items:center;justify-content:center;font-size:12px;font-weight:900;color:var(--gray-l);flex-shrink:0;${loseStyle}">${safe(name).slice(0,1)||'?'}</span>`;
      };
      const _name = (p, name, isWin)=>{
        const click = name ? `onclick="openPlayerModal('${escJS(name)}')"` : '';
        const isLose = isDone && !isWin;
        return `<span style="display:inline-flex;align-items:center;gap:6px;min-width:0;max-width:230px">
          ${_photo(p,name,isLose)}
          <span ${click} style="min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;cursor:pointer;font-weight:${isWin?900:700};color:${isWin?'#dc2626':(isLose?'var(--gray-l)':'var(--text)')};${isLose?'opacity:.75;':''}">${safe(name||'?')}</span>
          ${_rb(p)}${_tb(p)}
          ${_univ(p)}
          ${isDone?`<span style="font-size:10px;font-weight:900;color:${isWin?'#dc2626':'#2563eb'}">${isWin?'WIN':'LOSE'}</span>`:''}
        </span>`;
      };
      const _fxClsLeague = (typeof _recSideFxClass==='function') ? _recSideFxClass('procomp') : (_fxOn ? ` rec-sidefx rec-sidefx--${_fxMode}` : '');
      const _mGames = Array.isArray(m._games) && m._games.length ? m._games : null;
      const _scoreA = _mGames ? _mGames.filter(g=>g.winner==='A').length : (aWin?1:0);
      const _scoreB = _mGames ? _mGames.filter(g=>g.winner==='B').length : (bWin?1:0);
      const _gameCnt = _mGames ? _mGames.length : 1;
      const _detailPayload = encodeURIComponent(JSON.stringify({
        title:'프로리그 대회 조별리그',
        subtitle:`${tn.name||''} · ${m.grpName?m.grpName:`GROUP ${m.grpLetter}`}`,
        p1:m.a, p2:m.b, p1Score:_scoreA, p2Score:_scoreB,
        winner:aWin?m.a:(bWin?m.b:''), date:m.d||'', games:_mGames||[m]
      }));
      const _cardHtml = _proCompH2HCardHTML({
        p1:m.a, p2:m.b, p1Col:ca, p2Col:cb,
        p1Score:_scoreA, p2Score:_scoreB,
        winner:aWin?m.a:(bWin?m.b:''),
        date:m.d||'', games:_mGames||[m],
        badges:[
          `<span style="font-size:11px;color:var(--gray-l)">${m.d?m.d.slice(2).replace(/-/g,'/'):'미정'}</span>`,
          `<span style="font-size:10px;font-weight:700;padding:2px 8px;border-radius:99px;background:linear-gradient(135deg,${m.grpColor},${m.grpColor}cc);color:#fff">${m.grpName?m.grpName:`GROUP ${m.grpLetter}`}</span>`,
          `<span style="font-size:10px;font-weight:700;padding:2px 8px;border-radius:99px;background:#f1f5f9;color:#475569">${_gameCnt>1?`${_gameCnt}경기`:`${m.matchNum}경기`}</span>`,
          m.map?`<span style="font-size:11px;color:var(--gray-l)">🗺️ ${safe(m.map)}</span>`:'',
          pa&&pa.univ?`<span style="font-size:11px;color:${ca};font-weight:800">${pa.univ}</span>`:'',
          pb&&pb.univ?`<span style="font-size:11px;color:${cb};font-weight:800">${pb.univ}</span>`:'',
          !isDone?`<span style="font-size:10px;font-weight:700;padding:2px 8px;border-radius:99px;background:#fff7ed;color:#c2410c">예정</span>`:''
        ],
        detailOnClick:`window.openProCompRecordDetailPopup('${_detailPayload}')`,
        actionHtml:_cardMenu
      });
      if (window._pcMergeMode) {
        const _mKey = `${m.grpIdx}_${m.matchNum-1}`;
        const _mChecked = !!(window._pcMergeSel && window._pcMergeSel.has(_mKey));
        h += `<div style="position:relative;${_mChecked?'outline:2px solid #7c3aed;border-radius:14px;':''}">
          <label style="position:absolute;top:8px;left:8px;z-index:5;display:flex;align-items:center;gap:4px;background:#fff;border:1px solid var(--border);border-radius:8px;padding:3px 8px;cursor:pointer;box-shadow:0 2px 6px rgba(0,0,0,.08)" onclick="event.stopPropagation()">
            <input type="checkbox" ${_mChecked?'checked':''} onchange="proCompToggleMergeSel('${_mKey}')" style="width:16px;height:16px;cursor:pointer">
            <span style="font-size:10px;font-weight:700;color:var(--gray-l)">선택</span>
          </label>
          ${_cardHtml}
        </div>`;
      } else {
        h += _cardHtml;
      }
    });
    h += `</div>`;
  });
  return h;
}

/* ══════════════════════════════════════════════════════════════
   조별 순위 계산 및 렌더링
   ══════════════════════════════════════════════════════════════ */
/* ══════════════════════════════════════════════════════════════
   (요청사항) 조별리그 경기 - 사용자가 직접 선택해서 합치기
   ══════════════════════════════════════════════════════════════ */
function proCompToggleMergeMode(){
  window._pcMergeMode = !window._pcMergeMode;
  window._pcMergeSel = new Set();
  render();
}
function proCompToggleMergeSel(key){
  window._pcMergeSel = window._pcMergeSel || new Set();
  if (window._pcMergeSel.has(key)) window._pcMergeSel.delete(key);
  else window._pcMergeSel.add(key);
  render();
}
function proCompMergeSelectedMatches(tnId){
  const tn = _findTourneyById(tnId); if (!tn) return;
  const sel = [...(window._pcMergeSel || [])];
  if (sel.length < 2) { alert('합칠 경기를 2건 이상 선택하세요.'); return; }
  const parsed = sel.map(k => { const [gi, mi] = k.split('_').map(Number); return { gi, mi }; });
  const gi0 = parsed[0].gi;
  if (parsed.some(p => p.gi !== gi0)) { alert('같은 조의 경기만 합칠 수 있습니다.'); return; }
  const grp = tn.groups && tn.groups[gi0]; if (!grp || !Array.isArray(grp.matches)) { alert('조를 찾을 수 없습니다.'); return; }
  const items = parsed.map(p => grp.matches[p.mi]).filter(Boolean);
  if (items.length < 2) { alert('선택한 경기를 찾을 수 없습니다. (다시 선택해주세요)'); return; }
  const norm = (m) => [m.a, m.b].slice().sort().join('|');
  const key0 = norm(items[0]);
  if (items.some(it => norm(it) !== key0)) { alert('같은 두 선수(팀)의 경기만 합칠 수 있습니다.'); return; }
  if (!confirm(`선택한 ${items.length}건의 경기를 1건으로 합칩니다.\n개인 전적은 자동으로 다시 계산되어 반영됩니다.\n계속하시겠습니까?`)) return;

  const canonA = items[0].a, canonB = items[0].b;
  const recTarget = (grp._recTarget || '').trim();
  const mergedGames = [];
  items.forEach(item => {
    const subGames = (Array.isArray(item._games) && item._games.length)
      ? item._games
      : [{ winner: item.winner, map: item.map || '', d: item.d || '', note: item.note || '' }];
    subGames.forEach(g => {
      if (!g.winner) return;
      const winnerName = g.winner === 'A' ? item.a : item.b;
      const winnerCanon = winnerName === canonA ? 'A' : 'B';
      mergedGames.push({ winner: winnerCanon, map: g.map || '', d: g.d || item.d || '', note: g.note || item.note || '' });
    });
    if (item._stageRecId) {
      try { _revertProMatch(item._stageRecId); } catch(e) {}
      try {
        const rr = item._stageRecRound || '16강';
        if (tn.stageRecords && Array.isArray(tn.stageRecords[rr])) {
          const si = tn.stageRecords[rr].findIndex(x => x && x._id === item._stageRecId);
          if (si >= 0) tn.stageRecords[rr].splice(si, 1);
        }
      } catch(e) {}
    } else if (item._id) {
      try { _revertProMatch(item._id); } catch(e) {}
    }
  });
  if (!mergedGames.length) { alert('합칠 게임 결과가 없습니다.'); return; }

  const mid = 'pco_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const scoreA = mergedGames.filter(g => g.winner === 'A').length;
  const scoreB = mergedGames.filter(g => g.winner === 'B').length;
  const winnerVal = scoreA > scoreB ? 'A' : scoreB > scoreA ? 'B' : '';
  const lastGame = mergedGames[mergedGames.length - 1];
  const dVal = lastGame.d || '';
  const mapVal = mergedGames.length === 1 ? (mergedGames[0].map || '') : '';
  const noteVal = mergedGames.map(g => g.note).filter(Boolean).join(' / ');
  const newObj = { a: canonA, b: canonB, winner: winnerVal, d: dVal, map: mapVal, note: noteVal, _id: mid, _games: mergedGames };

  const recRound = _pcNormalizeStageRound(grp._recRound || '16강');
  if (recTarget === 'pro') {
    mergedGames.forEach((g, idx) => {
      const gameId = `${mid}_s0_g${idx}`;
      applyGameResult(g.winner === 'A' ? canonA : canonB, g.winner === 'A' ? canonB : canonA, g.d, g.map || '', gameId, '', '', '프로리그대회');
    });
  } else if (recTarget === 'stage') {
    _pcEnsureStageRecords(tn);
    const sid = `ptr_${tnId}_${recRound}_${mid}`;
    newObj._stageRecId = sid; newObj._stageRecRound = recRound;
    tn.stageRecords[recRound].push({ a: canonA, b: canonB, winner: winnerVal, d: dVal, map: mapVal, note: noteVal, _id: sid, _games: mergedGames });
    mergedGames.forEach((g, idx) => {
      const gameId = `${sid}_s0_g${idx}`;
      applyGameResult(g.winner === 'A' ? canonA : canonB, g.winner === 'A' ? canonB : canonA, g.d, g.map || '', gameId, '', '', '프로리그대회');
    });
  }

  // 선택한 기존 경기 제거 후 합쳐진 1건 추가 (인덱스가 밀리지 않도록 뒤에서부터 제거)
  parsed.slice().sort((a, b) => b.mi - a.mi).forEach(p => { grp.matches.splice(p.mi, 1); });
  grp.matches.push(newObj);

  window._pcMergeSel = new Set();
  window._pcMergeMode = false;
  save();
  render();
  setTimeout(() => alert(`${items.length}건의 경기를 1건으로 합쳤습니다.`), 100);
}
try {
  window.proCompToggleMergeMode = proCompToggleMergeMode;
  window.proCompToggleMergeSel = proCompToggleMergeSel;
  window.proCompMergeSelectedMatches = proCompMergeSelectedMatches;
} catch(e) {}

function _calcProGrpRank(grp) {
  const st = {};
  const members = grp.players || grp.univs || []; // Tier Tournament uses grp.univs
  members.forEach(p => { st[p] = {w:0, l:0}; });
  (grp.matches||[]).forEach(m => {
    if (!m.a || !m.b || !m.winner) return;
    // (요청사항) stage 반영 경기(대진표 기록용)는 조별 순위에서 제외
    if (m._stageRecId || (grp._recTarget||'')==='stage') return;
    if (!st[m.a]) st[m.a] = {w:0, l:0};
    if (!st[m.b]) st[m.b] = {w:0, l:0};
    if (m.winner==='A') { st[m.a].w++; st[m.b].l++; }
    else { st[m.b].w++; st[m.a].l++; }
  });
  return Object.entries(st).map(([name,s])=>({name,...s})).sort((a,b)=>b.w-a.w||(a.l-b.l));
}

function _proCompH2HCardHTML(opts){
  const o = opts || {};
  const p1 = String(o.p1||'');
  const p2 = String(o.p2||'');
  const p1Col = o.p1Col || '#3b82f6';
  const p2Col = o.p2Col || '#ef4444';
  const p1Score = Number(o.p1Score||0);
  const p2Score = Number(o.p2Score||0);
  const winner = String(o.winner||'');
  const badges = Array.isArray(o.badges) ? o.badges.filter(Boolean) : [];
  const actionHtml = o.actionHtml || '';
  const detailOnClick = o.detailOnClick ? String(o.detailOnClick) : '';
  const isMb = (typeof _h2hIsMobile === 'function') ? _h2hIsMobile() : (window.innerWidth <= 768);
  const scorePad = (typeof _h2hScorePadPx === 'function') ? _h2hScorePadPx() : (isMb ? 6 : 10);
  const scoreGap = (typeof _h2hScoreGapPx === 'function') ? _h2hScoreGapPx() : (isMb ? 8 : 10);
  const isTie = !winner && p1Score === p2Score && (p1Score + p2Score) > 0;
  const p1Bg = (typeof _h2hPlayerBgPanel === 'function')
    ? _h2hPlayerBgPanel(p1, winner === p1, !!winner && winner !== p1)
    : `<div style="padding:10px 12px;font-weight:900">${p1||'?'}</div>`;
  const p2Bg = (typeof _h2hPlayerBgPanel === 'function')
    ? _h2hPlayerBgPanel(p2, winner === p2, !!winner && winner !== p2)
    : `<div style="padding:10px 12px;font-weight:900">${p2||'?'}</div>`;
  const mode = (typeof _h2hCardMode === 'function') ? _h2hCardMode() : 'panel';
  const scoreColP1 = winner === p1 ? 'var(--win-col)' : winner === p2 ? 'var(--lose-col)' : (isTie ? '#b45309' : 'var(--text2)');
  const scoreColP2 = winner === p2 ? 'var(--win-col)' : winner === p1 ? 'var(--lose-col)' : (isTie ? '#b45309' : 'var(--text2)');
  const body = (typeof _h2hCardBody === 'function')
    ? _h2hCardBody(mode, { p1, p2, d:o.date||'', games:o.games||[] }, p1Score, p2Score, winner, p1Col, p2Col, '1fr auto 1fr', isMb, scorePad, scoreGap, '', p1Bg, p2Bg, scoreColP1, scoreColP2)
    : `<div style="display:flex;align-items:center;justify-content:space-between;padding:${isMb?'10px':'14px'}"><div>${p1}</div><div style="font-weight:900">${p1Score}:${p2Score}</div><div>${p2}</div></div>`;
  const wrapFx = (typeof _safeHeadToHeadSideFx === 'function') ? _safeHeadToHeadSideFx(p1Col, p2Col) : 'background:var(--white);';
  return `<div class="h2h-rec-card" style="border:var(--h2h-card-border,1px solid var(--border));border-bottom:var(--h2h-card-border-bottom,none);border-radius:var(--h2h-card-radius,12px);margin-bottom:var(--h2h-card-gap,8px);overflow:hidden;box-shadow:var(--h2h-card-shadow,none);${wrapFx||'background:var(--white);'}">
    <div${detailOnClick?` style="cursor:pointer" onclick="${detailOnClick}" title="경기 상세 열기"`:''}>
      ${body}
    </div>
    <div style="border-top:1px solid var(--border);display:flex;align-items:center;gap:8px;padding:${isMb?'7px 10px':'8px 14px'};background:var(--bg2);flex-wrap:wrap">
      ${badges.join('')}
      <span style="margin-left:auto"></span>
      ${actionHtml?`<span onclick="event.stopPropagation()">${actionHtml}</span>`:''}
    </div>
  </div>`;
}

function proCompGrpRank(tn) {
  if (!tn) return `<div style="padding:30px;text-align:center;color:var(--gray-l)">대회를 선택하세요.</div>`;
  const GL = 'ABCDEFGHIJ';
  // 스테이지 개념 삭제: group.stage 무시하고 모든 조별 그룹을 사용
  const grpList = (tn.groups||[]).filter(g => g);
  let h = `<div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;flex-wrap:wrap">
    <div style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:15px;color:var(--blue)">🏆 ${tn.name} 조별 순위</div>
    <button class="btn btn-w btn-xs no-export" onclick="proCompPrintRank()" style="margin-left:auto">📊 결과 인쇄/저장</button>
  </div>`;
  grpList.forEach((grp, gi) => {
    const col = ['#2563eb','#dc2626','#16a34a','#d97706','#7c3aed','#0891b2'][gi%6];
    const ranks = _calcProGrpRank(grp);
    const _gTotal=(grp.matches||[]).length, _gDone=(grp.matches||[]).filter(m=>m.winner).length;
    const _gPct=_gTotal?Math.round(_gDone/_gTotal*100):0;
    h += `<div style="margin-bottom:20px;border-radius:12px;overflow:hidden;border:1px solid ${col}33">
      <div style="padding:10px 16px;background:linear-gradient(135deg,${col},${col}cc);color:#fff;font-weight:900;font-size:13px;display:flex;align-items:center;gap:8px">
        <span>GROUP ${GL[gi]} · ${grp.name||GL[gi]+'조'}</span>
        <span style="margin-left:auto;font-size:11px;font-weight:600;opacity:.85">${_gDone}/${_gTotal}경기 · ${_gPct}%</span>
        ${_gDone>0?(()=>{const _adm=(localStorage.getItem('su_share_admin_only')||'0')==='1';return(!_adm||isLoggedIn)?`<button class="btn btn-xs no-export" style="background:rgba(255,255,255,.2);color:#fff;border:1px solid rgba(255,255,255,.35);font-size:11px;padding:2px 8px" onclick="_openProCompGrpAllShareCard('${tn.id}',${gi})" title="조 전체 공유카드">📷</button>`:'';})():''}
      </div>
      ${_gTotal>0?`<div style="height:4px;background:${col}33"><div style="height:100%;width:${_gPct}%;background:${col};transition:.3s"></div></div>`:''}
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
      const _photo = p&&p.photo?`<img src="${toHttpsUrl(p.photo)}" style="width:28px;height:28px;border-radius:var(--su_profile_radius,50%);object-fit:cover;margin-right:6px;vertical-align:middle;flex-shrink:0" onerror="this.style.display='none'">`:'<span style="width:28px;height:28px;border-radius:var(--su_profile_radius,50%);background:var(--border);display:inline-flex;align-items:center;justify-content:center;margin-right:6px;font-size:13px;flex-shrink:0">👤</span>';
      const _tb = p&&p.tier?`<span style="background:${getTierBtnColor(p.tier)||'#64748b'};color:${getTierBtnTextColor(p.tier)||'#fff'};font-size:9px;font-weight:700;padding:1px 4px;border-radius:3px">${p.tier}</span>`:'';
      const _rb = p&&p.race?`<span class="rbadge r${p.race}" style="font-size:9px;padding:0 3px">${p.race}</span>`:'';
      const _univ = p&&p.univ?`<span style="font-size:10px;color:var(--gray-l)">${p.univ}</span>`:'';
      h += `<tr style="border-top:1px solid var(--border);${idx===0?'background:'+col+'08':''}">
        <td style="padding:8px 12px;text-align:center;font-size:16px">${medal||idx+1}</td>
        <td style="padding:8px 10px">
          <div style="display:flex;align-items:center;gap:0">
            ${_photo}
            <div style="display:flex;flex-direction:column;gap:2px">
              <div style="display:flex;align-items:center;gap:4px">
                <span style="font-weight:${idx<2?'800':'600'};font-size:13px;cursor:pointer;color:var(--blue)" onclick="openPlayerModal('${escJS(r.name)}')">${r.name}</span>
                ${_rb}${_tb}
              </div>
              ${_univ}
            </div>
          </div>
        </td>
        <td style="padding:8px 12px;text-align:center;font-weight:700;color:#dc2626">${r.w}</td>
        <td style="padding:8px 12px;text-align:center;color:#2563eb">${r.l}</td>
        <td style="padding:8px 12px;text-align:center;font-weight:700">${wr}%</td>
      </tr>`;
    });
    h += `</tbody></table></div>`;
  });
  return h;
}

/* 팀전 섹션 */
function proCompTeamSection(tn) {
  if (!tn) return `<div style="padding:30px;text-align:center;color:var(--gray-l)">대회를 선택하세요.</div>`;
  const tms = tn.teamMatches||[];
  let h = `<div style="font-weight:900;font-size:15px;color:var(--blue);margin-bottom:12px">🏆 ${tn.name} 팀전</div>`;
  if (isLoggedIn) {
    h += `<div class="no-export" style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px">
      <button class="btn btn-b btn-sm" onclick="proCompCreateTeamMatch('${tn.id}')">+ 경기 추가</button>
      <button class="btn btn-w btn-sm" onclick="proCompOpenTeamPasteModal('${tn.id}',null)">📋 일괄 입력</button>
    </div>`;
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
        `<span style="font-size:11px;color:var(--gray-l)">${tm.d?tm.d.slice(2).replace(/-/g,'/'):'미정'}</span>`,
        `<span style="font-size:10px;font-weight:700;padding:2px 8px;border-radius:99px;background:#e0f2fe;color:#0284c7">팀전</span>`,
        `<span style="font-size:11px;color:var(--gray-l)">${games.length}경기</span>`,
        `<span style="font-size:11px;color:${colA};font-weight:800">${(tm.teamA||[]).length}명</span>`,
        `<span style="font-size:11px;color:${colB};font-weight:800">${(tm.teamB||[]).length}명</span>`
      ],
      detailOnClick:`window.openProCompRecordDetailPopup('${_teamDetailPayload}')`,
      actionHtml:_teamActions
    });
    h += `<div style="margin:-6px 0 14px;border:1px solid var(--border);border-top:none;border-radius:0 0 12px 12px;padding:12px 14px;background:var(--white)">
      <div style="display:flex;gap:10px;flex-wrap:wrap">
        <div style="flex:1;min-width:220px;background:${colA}08;border:1px solid ${colA}22;border-radius:10px;padding:10px 12px">
          <div style="font-size:11px;font-weight:900;color:${colA};margin-bottom:6px">${tm.teamAName||'A팀'}</div>
          <div style="font-size:11px;color:var(--text3);line-height:1.6">${(tm.teamA||[]).map(p=>`<span onclick="openPlayerModal('${escJS(p)}')" style="cursor:pointer;text-decoration:underline dotted">${p}</span>`).join(', ')||'미정'}</div>
        </div>
        <div style="flex:1;min-width:220px;background:${colB}08;border:1px solid ${colB}22;border-radius:10px;padding:10px 12px">
          <div style="font-size:11px;font-weight:900;color:${colB};margin-bottom:6px">${tm.teamBName||'B팀'}</div>
          <div style="font-size:11px;color:var(--text3);line-height:1.6">${(tm.teamB||[]).map(p=>`<span onclick="openPlayerModal('${escJS(p)}')" style="cursor:pointer;text-decoration:underline dotted">${p}</span>`).join(', ')||'미정'}</div>
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
              `<span style="font-size:11px;color:var(--gray-l)">${tm.d?tm.d.slice(2).replace(/-/g,'/'):'미정'}</span>`,
              `<span style="font-size:10px;font-weight:700;padding:2px 8px;border-radius:99px;background:${winCol};color:#fff">${sideWin}</span>`,
              `<span style="font-size:10px;font-weight:700;padding:2px 8px;border-radius:99px;background:#e0f2fe;color:#0284c7">팀전</span>`,
              g.map?`<span style="font-size:11px;color:var(--gray-l)">🗺️ ${g.map}</span>`:'',
              pw&&pw.univ?`<span style="font-size:11px;color:${winCol};font-weight:800">${pw.univ}</span>`:'',
              pl&&pl.univ?`<span style="font-size:11px;color:${loseCol};font-weight:800">${pl.univ}</span>`:''
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
  modal.innerHTML = `<div style="background:var(--white);border-radius:16px;padding:24px;width:460px;max-width:100%;box-shadow:0 8px 40px rgba(0,0,0,.3);margin:auto">
    <div style="font-weight:900;font-size:15px;margin-bottom:16px">팀전 경기 추가</div>
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
    <div style="font-size:12px;font-weight:700;color:var(--text3);margin-bottom:6px">팀원 구성 (클릭 시 A팀 -> B팀 -> 삭제)</div>
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
      <input id="_tm_search" placeholder="팀원 스트리머 검색.." oninput="_tmFilterPool()" style="width:100%;padding:7px 10px;border-radius:8px;border:1px solid var(--border);font-size:12px;box-sizing:border-box">
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
  const _memberBtns = (list, side, inputId) => list.map(p=>`<button type="button" onclick="_tmPickPlayer('${p.replace(/'/g,"\\'")}','${inputId}')" style="padding:2px 8px;border-radius:10px;border:1.5px solid ${side==='A'?colA:colB};background:${side==='A'?colA+'15':colB+'15'};color:${side==='A'?colA:colB};font-size:11px;cursor:pointer;font-weight:600">${p}</button>`).join('');
  const modal = document.createElement('div');
  modal.id = '_tmGameModal';
  modal.style.cssText = 'position:fixed;inset:0;background:#0008;z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px;box-sizing:border-box';
  modal.innerHTML = `<div style="background:var(--white);border-radius:16px;padding:24px;width:380px;max-width:100%;max-height:90vh;overflow-y:auto;box-shadow:0 8px 40px rgba(0,0,0,.3)">
    <div style="font-weight:900;font-size:15px;margin-bottom:14px">📝 경기 추가</div>
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
      <label style="font-size:12px;font-weight:700;color:var(--text3)">맵(선택)</label>
      <input id="_tg_map" placeholder="선택입력" style="width:100%;padding:7px;border-radius:8px;border:1px solid var(--border);margin-top:4px;font-size:12px;box-sizing:border-box">
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
    return members.map((p,pi)=>`<span style="display:inline-flex;align-items:center;gap:3px;padding:3px 8px;background:var(--surface);border-radius:14px;font-size:11px;font-weight:600;border:1px solid var(--border)">${p}<button onclick="_tmRemoveMember('${tnId}',${tmi},'${side}',${pi})" style="background:none;border:none;cursor:pointer;color:var(--gray-l);font-size:11px;padding:0;line-height:1">✕</button></span>`).join('');
  };
  const modal = document.createElement('div');
  modal.id = '_tmEditModal';
  modal.style.cssText = 'position:fixed;inset:0;background:#0008;z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px;box-sizing:border-box';
  modal.innerHTML = `<div style="background:var(--white);border-radius:16px;padding:24px;width:420px;max-width:100%;max-height:90vh;overflow-y:auto;box-shadow:0 8px 40px rgba(0,0,0,.3)">
    <div style="font-weight:900;font-size:15px;margin-bottom:14px">📝 팀전 수정</div>
    <div style="margin-bottom:12px">
      <label style="font-size:12px;font-weight:700;color:var(--text3)">날짜</label>
      <input id="_tme_d" type="date" value="${tm.d||''}" style="width:100%;padding:7px;border-radius:8px;border:1px solid var(--border);margin-top:4px;box-sizing:border-box">
    </div>
    <div style="display:flex;gap:8px;margin-bottom:14px">
      <div style="flex:1">
        <label style="font-size:12px;font-weight:700;color:#2563eb">A팀 이름</label>
        <input id="_tme_an" value="${tm.teamAName||'A팀'}" style="width:100%;padding:7px;border-radius:8px;border:1px solid var(--border);margin-top:4px;box-sizing:border-box">
      </div>
      <div style="flex:1">
        <label style="font-size:12px;font-weight:700;color:#dc2626">B팀 이름</label>
        <input id="_tme_bn" value="${tm.teamBName||'B팀'}" style="width:100%;padding:7px;border-radius:8px;border:1px solid var(--border);margin-top:4px;box-sizing:border-box">
      </div>
    </div>
    <div style="display:flex;gap:8px;margin-bottom:6px">
      <div style="flex:1;border:1px solid #2563eb44;border-radius:10px;padding:10px">
        <div style="font-size:11px;font-weight:700;color:#2563eb;margin-bottom:6px">A팀 멤버</div>
        <div id="_tme_aMembers" style="display:flex;flex-wrap:wrap;gap:4px;min-height:24px;margin-bottom:8px">${renderMembers('teamA')}</div>
        <div style="display:flex;gap:4px">
          <select id="_tme_aSel" style="flex:1;padding:5px;border-radius:6px;border:1px solid var(--border);font-size:11px"><option value="">선수 선택</option>${pOpts()}</select>
          <button class="btn btn-b btn-xs" onclick="_tmAddMember('${tnId}',${tmi},'teamA')">+</button>
        </div>
      </div>
      <div style="flex:1;border:1px solid #dc262644;border-radius:10px;padding:10px">
        <div style="font-size:11px;font-weight:700;color:#dc2626;margin-bottom:6px">B팀 멤버</div>
        <div id="_tme_bMembers" style="display:flex;flex-wrap:wrap;gap:4px;min-height:24px;margin-bottom:8px">${renderMembers('teamB')}</div>
        <div style="display:flex;gap:4px">
          <select id="_tme_bSel" style="flex:1;padding:5px;border-radius:6px;border:1px solid var(--border);font-size:11px"><option value="">선수 선택</option>${pOpts()}</select>
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
  if (cont) cont.innerHTML = (tm[side]||[]).map((p,pi)=>`<span style="display:inline-flex;align-items:center;gap:3px;padding:3px 8px;background:var(--surface);border-radius:14px;font-size:11px;font-weight:600;border:1px solid var(--border)">${p}<button onclick="_tmRemoveMember('${tnId}',${tmi},'${side}',${pi})" style="background:none;border:none;cursor:pointer;color:var(--gray-l);font-size:11px;padding:0;line-height:1">✕</button></span>`).join('');
}

function _tmRemoveMember(tnId, tmi, side, pi) {
  const tn = _findTourneyById(tnId);
  if (!tn||(tn.teamMatches||[])[tmi]==null) return;
  const tm = tn.teamMatches[tmi];
  if (!tm[side]) return;
  tm[side].splice(pi,1);
  const containerId = side==='teamA' ? '_tme_aMembers' : '_tme_bMembers';
  const cont = document.getElementById(containerId);
  if (cont) cont.innerHTML = (tm[side]||[]).map((p,pi2)=>`<span style="display:inline-flex;align-items:center;gap:3px;padding:3px 8px;background:var(--surface);border-radius:14px;font-size:11px;font-weight:600;border:1px solid var(--border)">${p}<button onclick="_tmRemoveMember('${tnId}',${tmi},'${side}',${pi2})" style="background:none;border:none;cursor:pointer;color:var(--gray-l);font-size:11px;padding:0;line-height:1">✕</button></span>`).join('');
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
    <div style="font-weight:900;font-size:15px;margin-bottom:10px">팀전 경기 선택</div>
    <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:4px">
      <label style="font-size:12px;font-weight:700;color:var(--text3)">경기 선택</label>
      <span class="btn btn-w btn-xs" style="margin-left:auto">선택 가능 ${tms.length||1}경기</span>
    </div>
    <select id="_tmSel_tmi" onchange="document.getElementById('_tmSel_newFields').style.display=parseInt(this.value)>=0?'none':'flex'" style="width:100%;padding:7px;border-radius:8px;border:1px solid var(--border);margin-top:4px;margin-bottom:10px;box-sizing:border-box">
      <option value="-1">직접 새 경기 구성</option>
      ${tms.map((t,i)=>`<option value="${i}">${t.teamAName||'A팀'} vs ${t.teamBName||'B팀'} (${t.d||'날짜 미정'})</option>`).join('')}
    </select>
    <div id="_tmSel_newFields" style="display:${tms.length?'none':'flex'};gap:8px;margin-bottom:10px">
      <div style="flex:1"><label style="font-size:11px;font-weight:700;color:#2563eb">A팀 명</label><input id="_tmSel_an" value="A팀" style="width:100%;padding:5px 8px;border-radius:6px;border:1px solid var(--border);margin-top:3px;font-size:12px;box-sizing:border-box"></div>
      <div style="flex:1"><label style="font-size:11px;font-weight:700;color:#dc2626">B팀 명</label><input id="_tmSel_bn" value="B팀" style="width:100%;padding:5px 8px;border-radius:6px;border:1px solid var(--border);margin-top:3px;font-size:12px;box-sizing:border-box"></div>
      <div style="flex:1"><label style="font-size:11px;font-weight:700;color:var(--text3)">날짜</label><input id="_tmSel_nd" type="date" value="${new Date().toISOString().slice(0,10)}" style="width:100%;padding:5px 8px;border-radius:6px;border:1px solid var(--border);margin-top:3px;font-size:12px;box-sizing:border-box"></div>
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
function proCompBracket(tn) {
  if (!tn) return `<div style="padding:30px;text-align:center;color:var(--gray-l)">대회를 선택하세요.</div>`;
  if (!tn.bracket || !tn.bracket.length) {
    const hasGroups = tn.groups && tn.groups.length>0 && tn.groups.some(g=>(g.players||g.univs||[]).length>0||(g.matches||[]).length>0);
    return `<div style="padding:40px;text-align:center;background:var(--surface);border-radius:12px;border:2px dashed var(--border2)">
      <div style="font-size:36px;margin-bottom:12px">🗂️</div>
      <div style="font-size:15px;font-weight:700;margin-bottom:8px">대진표가 없습니다</div>
      ${isLoggedIn?`<div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-top:16px">
        ${hasGroups?`<button class="btn btn-b" onclick="proCompInitBracket('${tn.id}')">📊 조별 순위로 대진표 생성</button>`:''}
        <button class="btn btn-w" onclick="proCompInitBracketManual('${tn.id}')">✏️ 직접 대진표 만들기</button>
      </div>`:''}
    </div>`;
  }
  const rounds = tn.bracket;
  const _pc = name => players.find(x=>x.name===name)||null;
  const isTierTourney = tn.type === 'tier';
  const _ls = (typeof proCompGetLayoutScale==='function') ? proCompGetLayoutScale() : 1;
  const _s = (n, min)=>Math.max(min||0, Math.round(n*_ls));
  const _photo = (name, isWin, isDone, col) => {
    const p=_pc(name);
    const isLose = !!isDone && !isWin;
    const sz = _s(36, 22);
    if (!name||name==='TBD') return `<div style="width:${sz}px;height:${sz}px;border-radius:var(--su_profile_radius,50%);background:#e2e8f0;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:${_s(14,11)}px;color:#94a3b8">?</div>`;
    const ring = isWin?`box-shadow:0 0 0 2px ${col},0 0 0 4px ${col}33`:`border:2px solid #e2e8f0`;
    const safe = escJS(name);
    const click = `onclick="openPlayerModal('${safe}')"`;
    const pointer = `cursor:pointer;`;
    return p&&p.photo
      ?`<img ${click} src="${toHttpsUrl(p.photo)}" style="${pointer}width:${sz}px;height:${sz}px;border-radius:var(--su_profile_radius,50%);object-fit:cover;flex-shrink:0;${ring};${isLose?'filter:grayscale(1);opacity:.58;':''}" onerror="this.style.display='none'">`
      :`<div ${click} style="${pointer}width:${sz}px;height:${sz}px;border-radius:var(--su_profile_radius,50%);background:${isLose?'#cbd5e1':col};flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:${_s(13,11)}px;font-weight:900;color:${isLose?'#64748b':'#fff'};${ring};${isLose?'opacity:.7;':''}">${name[0]}</div>`;
  };
  const _info = name => {
    const p=_pc(name); if(!p) return '';
    const rb = p.race?`<span style="font-size:8px;padding:1px 4px;border-radius:2px;font-weight:700;background:${p.race==='T'?'#dbeafe':p.race==='Z'?'#ede9fe':'#fef3c7'};color:${p.race==='T'?'#1e40af':p.race==='Z'?'#5b21b6':'#92400e'}">${p.race}</span>`:'';
    const meta = isTierTourney ? (p.tier||'') : `${p.tier?p.tier+' · ':''}${p.univ||''}`;
    return meta ? `<div style="display:flex;align-items:center;gap:3px;margin-top:1px">${rb}<span style="font-size:11px;font-weight:600;color:var(--text3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:120px">${meta}</span></div>`
      : (rb ? `<div style="display:flex;align-items:center;gap:3px;margin-top:1px">${rb}</div>` : '');
  };
  // 라운드 표기: 16강/8강/4강/결승 (※ 4강=준결승)
  const rndLabel = ri => ri===rounds.length-1?'🏆 결승':ri===rounds.length-2?'🥈 4강':ri===rounds.length-3?'🥉 8강':`${Math.pow(2,rounds.length-ri)}강`;
  const rndColor = ri => ri===rounds.length-1?'#d97706':ri===rounds.length-2?'#7c3aed':ri===rounds.length-3?'#dc2626':'#2563eb';
  const rndBg   = ri => ri===rounds.length-1?'linear-gradient(135deg,#f59e0b,#d97706)':ri===rounds.length-2?'linear-gradient(135deg,#8b5cf6,#6d28d9)':ri===rounds.length-3?'linear-gradient(135deg,#ef4444,#b91c1c)':'linear-gradient(135deg,#3b82f6,#1d4ed8)';

  // 브라켓 경기 목록 (매치 셀렉터용)
  const _allBktMatches = [];
  (rounds||[]).forEach((rnd,ri)=>{
    (rnd||[]).forEach((m,mi)=>{
      if(m.a&&m.b&&m.a!=='TBD'&&m.b!=='TBD') _allBktMatches.push({ri,mi,a:m.a,b:m.b,label:`${rnd.length>1?`${Math.pow(2,rounds.length-ri)}강 경기${mi+1}`:ri===rounds.length-1?'결승':'준결승'} — ${m.a} vs ${m.b}`});
    });
  });

  let h = `<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;flex-wrap:wrap">
    <div style="font-weight:900;font-size:15px;color:var(--blue)">🏆 ${tn.name} 토너먼트</div>
    ${isLoggedIn?`<button class="btn btn-w btn-sm" onclick="proCompOpenSeedModal('${tn.id}')" title="상위시드(부전승/라운드 합류) 및 배치 지원">🎫 시드/부전승</button>`:''}
    ${isLoggedIn&&_allBktMatches.length?`<button class="btn btn-p btn-sm" onclick="openPcBktBulkPasteModal('${tn.id}')" style="display:inline-flex;align-items:center;gap:5px">📋 자동인식</button><span style="font-size:11px;color:var(--gray-l)">여러 경기 한번에 입력 가능</span>`:''}
    ${isLoggedIn?`<button class="btn btn-b btn-sm" onclick="openPcBktAutoBuildModal('${tn.id}')" title="결과 붙여넣기로 대진표를 자동 생성">🧠 대진표 자동인식</button>`:''}
    ${isLoggedIn?`<button class="btn btn-r btn-sm" onclick="proCompDeleteBracket('${tn.id}')" title="대진표(토너먼트) 삭제">🗑️ 대진표 삭제</button>`:''}
  </div>`;

  // 챔피언 배너
  const finalMatch = (rounds[rounds.length-1]||[])[0];
  const champion = finalMatch?.winner==='A'?finalMatch.a:finalMatch?.winner==='B'?finalMatch.b:null;
  if (champion) {
    const cp = _pc(champion);
    const cpSz = _s(52, 34);
    const cpPhoto = cp?.photo?`<img src="${toHttpsUrl(cp.photo)}" style="width:${cpSz}px;height:${cpSz}px;border-radius:var(--su_profile_radius,50%);object-fit:cover;border:3px solid rgba(255,255,255,.8)" onerror="this.outerHTML=''">`:
      `<div style="width:${cpSz}px;height:${cpSz}px;border-radius:var(--su_profile_radius,50%);background:rgba(255,255,255,.3);display:flex;align-items:center;justify-content:center;font-size:${_s(22,16)}px;font-weight:900;color:#fff">${champion[0]}</div>`;
    h += `<div style="background:linear-gradient(135deg,#f59e0b,#d97706);border-radius:14px;padding:${_s(14,10)}px ${_s(20,14)}px;margin-bottom:${_s(16,12)}px;display:flex;align-items:center;gap:${_s(14,10)}px;box-shadow:0 4px 20px rgba(217,119,6,.35)">
      ${cpPhoto}
      <div>
        <div style="font-size:10px;color:rgba(255,255,255,.8);font-weight:700;letter-spacing:.5px">FINAL CHAMPION</div>
        <div style="font-size:20px;font-weight:900;color:#fff;letter-spacing:.5px">${champion}</div>
        ${isTierTourney ? (cp?.tier?`<div style="font-size:11px;color:rgba(255,255,255,.7)">${cp.tier}${cp.race?' · '+cp.race:''}</div>`:'') : (cp?.univ?`<div style="font-size:11px;color:rgba(255,255,255,.7)">${cp.univ}${cp.race?' · '+cp.race:''}</div>`:'')}
      </div>
    </div>`;
  }

  h += `<div style="overflow-x:auto;padding-bottom:16px"><div style="display:inline-flex;gap:0;align-items:flex-start;min-width:fit-content">`;
  rounds.forEach((rnd, ri) => {
    const lbl=rndLabel(ri), col=rndColor(ri), bg=rndBg(ri);
    const isLast=ri===rounds.length-1;
    const gap=ri===0?_s(8,6):(Math.pow(2,ri)*_s(60,40)+_s(8,6));
    h += `<div style="display:flex;align-items:center">
      <div style="min-width:${isLast?_s(220,160):_s(200,150)}px;flex-shrink:0">
        <div style="text-align:center;font-size:12px;font-weight:900;color:#fff;margin-bottom:${_s(10,8)}px;padding:${_s(7,6)}px ${_s(10,8)}px;background:${bg};border-radius:10px;box-shadow:0 3px 8px ${col}44;letter-spacing:.5px">${lbl}</div>
        <div style="display:flex;flex-direction:column;gap:${gap}px">`;
    rnd.forEach((m, mi) => {
      const aWin=m.winner==='A', bWin=m.winner==='B', isDone=!!m.winner;
      const hasBoth=m.a&&m.b&&m.a!=='TBD'&&m.b!=='TBD';
      const aTBD=!m.a||m.a==='TBD', bTBD=!m.b||m.b==='TBD';
      const _isBye = (x)=>!x||x==='TBD'||String(x).toUpperCase()==='BYE';
      const _canBye = (!aTBD && _isBye(m.b)) || (!bTBD && _isBye(m.a));
      const winnerName=aWin?m.a:bWin?m.b:'';
      const scoreA=(m._games||[]).filter(g=>g.winner==='A').length;
      const scoreB=(m._games||[]).filter(g=>g.winner==='B').length;
      const hasGames = Array.isArray(m._games) && m._games.length>0;
      const isTieSaved = !isDone && hasGames && scoreA===scoreB && (scoreA+scoreB)>0;
      const showScore=(isDone||isTieSaved) && hasGames && m._games.length>1;
      h += `<div style="border-radius:12px;overflow:hidden;background:var(--white);box-shadow:${isDone?`0 4px 16px ${col}28,0 1px 4px rgba(0,0,0,.08)`:isLast?`0 2px 12px rgba(0,0,0,.1)`:'0 1px 6px rgba(0,0,0,.07)'};border:${isLast&&isDone?`2px solid ${col}66`:isDone?`1.5px solid ${col}44`:'1.5px solid #e2e8f0'}">
        <!-- A 선수 -->
        <div style="padding:${_s(9,7)}px ${_s(12,10)}px;border-bottom:1px solid #f1f5f9;background:${aWin?col+'18':aTBD?'#f8fafc':'#fff'};display:flex;align-items:center;gap:${_s(8,6)}px;${aWin?`border-left:3px solid ${col}`:''};${!isDone||aWin?'':'opacity:.55'}">
          ${_photo(m.a, aWin, isDone, col)}
          <div style="flex:1;min-width:0">
            <div style="font-size:12px;font-weight:${aWin?'800':aTBD?'400':'550'};color:${aWin?col:aTBD?'#94a3b8':isDone?'#94a3b8':'#374151'};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;cursor:${m.a&&!aTBD?'pointer':'default'}" onclick="${m.a&&!aTBD?`openPlayerModal('${(m.a||'').replace(/'/g,"\\'")}')`:''}">${m.a||'TBD'}</div>
            ${!aTBD?_info(m.a):''}
          </div>
          ${showScore?`<span style="font-size:11px;font-weight:900;color:${aWin?col:'#94a3b8'};flex-shrink:0">${scoreA}</span>`:''}
          ${aWin?`<span style="font-size:9px;font-weight:900;color:#fff;background:${col};padding:2px 7px;border-radius:6px;flex-shrink:0">WIN</span>`:''}
        </div>
        <!-- B 선수 -->
        <div style="padding:${_s(9,7)}px ${_s(12,10)}px;background:${bWin?col+'18':bTBD?'#f8fafc':'#fff'};display:flex;align-items:center;gap:${_s(8,6)}px;${bWin?`border-left:3px solid ${col}`:''};${!isDone||bWin?'':'opacity:.55'}">
          ${_photo(m.b, bWin, isDone, col)}
          <div style="flex:1;min-width:0">
            <div style="font-size:12px;font-weight:${bWin?'800':bTBD?'400':'550'};color:${bWin?col:bTBD?'#94a3b8':isDone?'#94a3b8':'#374151'};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;cursor:${m.b&&!bTBD?'pointer':'default'}" onclick="${m.b&&!bTBD?`openPlayerModal('${(m.b||'').replace(/'/g,"\\'")}')`:''}">${m.b||'TBD'}</div>
            ${!bTBD?_info(m.b):''}
          </div>
          ${showScore?`<span style="font-size:11px;font-weight:900;color:${bWin?col:'#94a3b8'};flex-shrink:0">${scoreB}</span>`:''}
          ${bWin?`<span style="font-size:9px;font-weight:900;color:#fff;background:${col};padding:2px 7px;border-radius:6px;flex-shrink:0">WIN</span>`:''}
        </div>
        <!-- 맵 -->
        ${m.map?`<div style="padding:${_s(3,3)}px ${_s(12,10)}px;font-size:11px;font-weight:600;color:var(--text3);background:#f8fafc;border-top:1px solid #f1f5f9;display:flex;gap:${_s(8,6)}px;flex-wrap:wrap"><span>🗺️ ${m.map}</span></div>`:''}
        ${m.note?`<div style="padding:${_s(4,4)}px ${_s(12,10)}px;font-size:10px;color:#64748b;background:#f8fafc;border-top:1px solid #f1f5f9;line-height:1.5;word-break:break-word">📝 ${String(m.note).replace(/</g,'&lt;').replace(/>/g,'&gt;')}</div>`:''}
        ${isTieSaved?`<div style="padding:${_s(3,3)}px ${_s(12,10)}px;font-size:11px;font-weight:900;color:#b45309;background:#fffbeb;border-top:1px solid #f1f5f9;display:flex;gap:${_s(8,6)}px;align-items:center">
          <span>⚖️ 동률 저장</span><span style="margin-left:auto">${scoreA}:${scoreB}</span>
        </div>`:''}
        <!-- 게임 상세 -->
        ${hasGames?`<div style="padding:${_s(3,3)}px ${_s(12,10)}px ${_s(4,4)}px;font-size:9px;background:#f8fafc;border-top:1px solid #f1f5f9;color:#64748b;line-height:1.9">${m._games.map((g,gi)=>`<span style="margin-right:${_s(8,6)}px">${gi+1}G·<b style="color:${g.winner==='A'?col:'#dc2626'}">${g.winner==='A'?m.a||'A':m.b||'B'}</b>${g.map?` <span style="color:#94a3b8">${g.map}</span>`:''}</span>`).join('')}</div>`:''}
        <!-- 옵션 버튼 -->
        <div style="padding:${_s(5,5)}px ${_s(8,7)}px;background:#f8fafc;border-top:1px solid #f1f5f9;display:flex;gap:${_s(3,3)}px;flex-wrap:wrap">
          ${isDone?(()=>{const _adm=(localStorage.getItem('su_share_admin_only')||'0')==='1';return(!_adm||isLoggedIn)?`<button class="btn btn-p btn-xs no-export" style="min-width:98px;display:inline-flex;align-items:center;justify-content:center" onclick="_openProCompBktShareCard('${tn.id}',${ri},${mi})">🎴 공유 카드</button>`:'';})():''}
          ${isLoggedIn?`${hasBoth?`<button class="btn btn-xs" style="flex:1;font-size:9px;${aWin?`background:${col};color:#fff;border-color:${col}`:''}" onclick="proCompSetBktWinner('${tn.id}',${ri},${mi},'A')">${(m.a||'A').slice(0,5)} 승</button>
            <button class="btn btn-xs" style="flex:1;font-size:9px;${bWin?`background:${col};color:#fff;border-color:${col}`:''}" onclick="proCompSetBktWinner('${tn.id}',${ri},${mi},'B')">${(m.b||'B').slice(0,5)} 승</button>`:''}
            ${_canBye?`<button class="btn btn-xs" style="font-size:9px;padding:0 6px;border-color:#f59e0b;color:#b45309;background:#fffbeb" onclick="proCompApplyBye('${tn.id}',${ri},${mi})" title="부전승 처리">부전승</button>`:''}
            <button class="btn btn-xs btn-p" style="font-size:9px;padding:0 6px;${hasBoth?'':'opacity:.35'}" onclick="${hasBoth?`openPcBktPasteModal('${tn.id}',${ri},${mi})`:'alert(\"선수 확정 후 사용\")'}" title="자동인식">📋 자동인식</button>
            <button class="btn btn-xs" style="font-size:9px;padding:0 5px" onclick="proCompBktEditPlayers('${tn.id}',${ri},${mi})" title="경기 추가/수정">✏️ 경기수정</button>
            <button class="btn btn-xs btn-r" style="font-size:9px;padding:0 6px" onclick="proCompClearBktMatch('${tn.id}',${ri},${mi})" title="경기 삭제(초기화)">🗑</button>`:''}
        </div>
      </div>`;
    });
    h += `</div></div>`;
    // 라운드 간 화살표 커넥터
    if (ri < rounds.length-1) h += `<div style="width:${_s(28,22)}px;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:${_s(18,14)}px;color:#cbd5e1;font-weight:900;align-self:center;padding-top:${_s(36,26)}px">➔</div>`;
    h += `</div>`;
  });
  h += `</div></div>`;
  // 3위전
  if (rounds.length >= 2 && tn.thirdPlace) {
    const tp = tn.thirdPlace;
    const tpA = tp.winner==='A', tpB = tp.winner==='B';
    const tpBoth = tp.a&&tp.b&&tp.a!=='TBD'&&tp.b!=='TBD';
    const tpCol = '#78716c';
    const tpWinner = tpA?tp.a:tpB?tp.b:null;
    h += `<div style="margin-top:20px">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
        <span style="font-size:13px;font-weight:900;color:${tpCol}">🥉 3·4위전</span>
        ${tpWinner?`<span style="font-size:11px;background:#78716c18;color:#78716c;padding:2px 10px;border-radius:20px;font-weight:700">3위 · ${tpWinner}</span>`:''}
      </div>
      <div style="border-radius:12px;overflow:hidden;background:var(--white);box-shadow:0 2px 10px rgba(0,0,0,.08);border:${tp.winner?`1.5px solid ${tpCol}44`:'1.5px solid #e2e8f0'};max-width:230px">
        <div style="padding:9px 12px;border-bottom:1px solid #f1f5f9;background:${tpA?tpCol+'18':'#fff'};display:flex;align-items:center;gap:8px;${tpA?`border-left:3px solid ${tpCol}`:''};${tp.winner&&!tpA?'opacity:.55':''}">
          ${_photo(tp.a, tpA, !!tp.winner, tpCol)}
          <div style="flex:1;min-width:0">
            <div style="font-size:12px;font-weight:${tpA?'800':'550'};color:${tpA?tpCol:'#374151'};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;cursor:${tp.a&&tp.a!=='TBD'?'pointer':'default'}" onclick="${tp.a&&tp.a!=='TBD'?`openPlayerModal('${(tp.a||'').replace(/'/g,"\\'")}')`:''}">${tp.a||'TBD'}</div>
            ${tp.a&&tp.a!=='TBD'?_info(tp.a):''}
          </div>
          ${tpB?`<span style="font-size:9px;font-weight:900;color:#fff;background:${tpCol};padding:2px 7px;border-radius:6px;flex-shrink:0">🏆 3위</span>`:''}
        </div>
        <div style="padding:9px 12px;background:${tpB?tpCol+'18':'#fff'};display:flex;align-items:center;gap:8px;${tpB?`border-left:3px solid ${tpCol}`:''};${tp.winner&&!tpB?'opacity:.55':''}">
          ${_photo(tp.b, tpB, !!tp.winner, tpCol)}
          <div style="flex:1;min-width:0">
            <div style="font-size:12px;font-weight:${tpB?'800':'550'};color:${tpB?tpCol:'#374151'};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;cursor:${tp.b&&tp.b!=='TBD'?'pointer':'default'}" onclick="${tp.b&&tp.b!=='TBD'?`openPlayerModal('${(tp.b||'').replace(/'/g,"\\'")}')`:''}">${tp.b||'TBD'}</div>
            ${tp.b&&tp.b!=='TBD'?_info(tp.b):''}
          </div>
          ${tpB?`<span style="font-size:9px;font-weight:900;color:#fff;background:${tpCol};padding:2px 7px;border-radius:6px;flex-shrink:0">🏆 3위</span>`:''}
        </div>
        ${(tp.map||tp.d)?`<div style="padding:3px 12px;font-size:11px;font-weight:600;color:var(--text3);background:#f8fafc;border-top:1px solid #f1f5f9;display:flex;gap:8px">${tp.d?`<span>🗓️ ${tp.d.slice(2).replace(/-/g,'.')}</span>`:''}${tp.map?`<span>🗺️ ${tp.map}</span>`:''}</div>`:''}
        <div style="padding:5px 8px;background:#f8fafc;border-top:1px solid #f1f5f9;display:flex;gap:3px;flex-wrap:wrap">
          ${tp.winner?(()=>{const _adm=(localStorage.getItem('su_share_admin_only')||'0')==='1';return(!_adm||isLoggedIn)?`<button class="btn btn-xs no-export" style="font-size:9px;padding:1px 6px;background:${tpCol}18;color:${tpCol};border-color:${tpCol}44" onclick="_openProCompBktShareCard('${tn.id}','3rd',0)" title="공유카드">📷</button>`:'';})():''}
          ${isLoggedIn?`${tpBoth?`<button class="btn btn-xs" style="flex:1;font-size:9px;${tpA?`background:${tpCol};color:#fff;border-color:${tpCol}`:''}" onclick="proCompSetThirdWinner('${tn.id}','A')">${(tp.a||'A').slice(0,5)} 승</button>
            <button class="btn btn-xs" style="flex:1;font-size:9px;${tpB?`background:${tpCol};color:#fff;border-color:${tpCol}`:''}" onclick="proCompSetThirdWinner('${tn.id}','B')">${(tp.b||'B').slice(0,5)} 승</button>`:''}
            <button class="btn btn-xs" style="font-size:9px;padding:0 5px;${tpBoth?'':'opacity:.35'}" onclick="proCompOpenThirdPaste('${tn.id}')" title="${tpBoth?'결과 붙여넣기':'선수 확정 후 사용'}">📋</button>
            <button class="btn btn-xs" style="font-size:9px;padding:0 5px" onclick="proCompSetThirdDate('${tn.id}')">🗓️</button>
            <button class="btn btn-xs" style="font-size:9px;padding:0 5px" onclick="proCompSetThirdMap('${tn.id}')">🗺️</button>`:''}
        </div>
      </div>
    </div>`;
  }
  if (isLoggedIn) h += `<div style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap">
    ${rounds.length >= 2 && !tn.thirdPlace ? `<button class="btn btn-w btn-sm" onclick="proCompAddThirdPlace('${tn.id}')">+ 3·4위전 추가</button>` : ''}
    ${rounds.length >= 2 && tn.thirdPlace ? `<button class="btn btn-w btn-sm" onclick="proCompRemoveThirdPlace('${tn.id}')">🗑️ 3·4위전 제거</button>` : ''}
    <button class="btn btn-r btn-sm" onclick="proCompResetBracket('${tn.id}')">🔄 대진표 초기화</button>
  </div>`;
  return h;
}

/* ══════════════════════════════════════════════════════════════
   (요청사항) 시드/부전승(라운드 합류) + 자동 배치
   - 예: 32강 대회에서 일부 선수가 16강/8강부터 합류
   - 저장: tn.seedStarts = { "선수명": 16|8|4|2 ... } (숫자는 시작 라운드 강수)
══════════════════════════════════════════════════════════════ */
function _pcRoundLabelBySize(sz){
  if(sz===2) return '결승';
  if(sz===4) return '4강';
  if(sz===8) return '8강';
  if(sz===16) return '16강';
  if(sz===32) return '32강';
  if(sz===64) return '64강';
  return `${sz}강`;
}
const _PC_STAGE_ROUNDS = ['64강','32강','16강','8강','4강','결승'];
function _pcEnsureStageRecords(tn){
  if(!tn.stageRecords) tn.stageRecords = {};
  _PC_STAGE_ROUNDS.forEach(r=>{ if(!Array.isArray(tn.stageRecords[r])) tn.stageRecords[r] = []; });
}
function _pcNormalizeStageRound(round){
  const r = String(round||'').trim();
  return _PC_STAGE_ROUNDS.includes(r) ? r : '16강';
}

// (요청사항) 붙여넣기 결과로 대진표(토너먼트) 자동 생성
// - 입력은 "승자 패자 [맵]" 여러 줄(게임 단위) 또는 세트 구분을 허용
// - 동일한 두 선수 조합은 한 매치로 묶어서 점수 계산 후 winner 결정
function _pcBktBuildFromPasteApplyLogic(savable, tn){
  if(!tn) return false;
  const dateEl = document.getElementById('paste-date');
  const dateVal = dateEl ? (dateEl.value||'') : '';

  // 1) 게임들을 매치(선수쌍)로 묶기
  const matchMap = {}; // key => {a,b,games:[{w,l,map}]}
  const _extractRound = (txt)=>{
    const s=String(txt||'');
    const m=s.match(/(64강|32강|16강|8강|4강|준결승|결승)/);
    return m ? m[1] : null;
  };
  savable.forEach(r=>{
    const w = r.wPlayer?.name; const l = r.lPlayer?.name;
    if(!w || !l) return;
    const k = [w,l].sort().join('|');
    const rndHint = r._rndLabel || r.rndLabel || r._roundLabel || _extractRound(r._lineMemo) || _extractRound(r.memo) || null;
    if(!matchMap[k]) matchMap[k] = { p1: w, p2: l, games: [], rnd: rndHint };
    // 라운드 정보는 첫 등장 라인 기준
    if(!matchMap[k].rnd && rndHint) matchMap[k].rnd = rndHint;
    matchMap[k].games.push({ w, l, map: r.map||'' });
  });
  const matches = Object.values(matchMap);
  if(!matches.length){ alert('저장 가능한 경기가 없습니다.'); return false; }

  // 2) 대진표 크기 추정: (라운드 라벨 우선) → 없으면 참가자 수 기준
  const playersSet = new Set();
  matches.forEach(m=>{ playersSet.add(m.p1); playersSet.add(m.p2); });
  const nPlayers = playersSet.size;
  // (요청사항) 티어대회(개인전)일 때: 붙여넣기에 등장한 선수들을 조편성에 자동 반영
  try{
    if(tn.type==='tier'){
      if(!tn.groups) tn.groups=[];
      if(!tn.groups.length) tn.groups.push({name:'A조',univs:[],matches:[]});
      const g0=tn.groups[0];
      if(!g0.univs) g0.univs=[];
      playersSet.forEach(n=>{ if(n && !g0.univs.includes(n)) g0.univs.push(n); });
    }
  }catch(e){}
  const _lblToSize = (lbl)=>{
    const s=String(lbl||'').replace(/\s+/g,'');
    if(!s) return null;
    if(s==='결승') return 2;
    if(s==='준결승') return 4;
    if(s==='4강') return 4;
    const m=s.match(/^(\d{1,3})강$/);
    if(m) return parseInt(m[1],10);
    return null;
  };
  let firstSizeFromLabel = 0;
  matches.forEach(m=>{ const sz=_lblToSize(m.rnd); if(sz) firstSizeFromLabel=Math.max(firstSizeFromLabel, sz); });
  let firstSize = firstSizeFromLabel || 2;
  while(firstSize < nPlayers) firstSize *= 2;
  const totalRounds = Math.round(Math.log2(firstSize));
  if(!totalRounds || totalRounds<1){ alert('대진표 크기를 계산할 수 없습니다.'); return false; }

  // 3) 빈 브라켓 생성
  const rounds = [];
  for(let r=0;r<totalRounds;r++){
    const len = Math.max(1, Math.floor(firstSize / Math.pow(2, r+1)));
    const arr=[];
    for(let i=0;i<len;i++) arr.push({a:'TBD', b:'TBD', winner:'', d:'', map:'', _games:[]});
    rounds.push(arr);
  }
  tn.bracket = rounds;

  // 4) 매치를 라운드 라벨 기준으로 배치 (없으면 1라운드로)
  //    - winner를 A/B로 계산하고, 다음 라운드로 전파
  const miCounter = {};
  matches.forEach(m=>{
    const sz = _lblToSize(m.rnd) || firstSize; // 라벨 없으면 최상위(예: 64강)로 처리
    const ri = Math.max(0, Math.min(totalRounds-1, Math.round(Math.log2(firstSize / sz))));
    miCounter[ri] = (miCounter[ri]||0);
    const mi = miCounter[ri]++;
    if(!tn.bracket[ri] || mi >= tn.bracket[ri].length) return;
    const slot = tn.bracket[ri][mi];
    // 참가자
    const pA = m.p1;
    const pB = m.p2;
    slot.a = pA; slot.b = pB;
    if(dateVal) slot.d = dateVal;
    // 게임 목록
    slot._games = m.games.map(g=>{
      const winner = (g.w === pA) ? 'A' : (g.w === pB) ? 'B' : '';
      return { winner, map: g.map||'' };
    }).filter(g=>g.winner);
    const scoreA = slot._games.filter(g=>g.winner==='A').length;
    const scoreB = slot._games.filter(g=>g.winner==='B').length;
    if(scoreA===scoreB){
      // 동률이면 winner 비움
      slot.winner = '';
    } else {
      slot.winner = scoreA>scoreB ? 'A' : 'B';
    }
    // 맵 필드: 단판이면 사용
    if(slot._games.length===1 && slot._games[0].map) slot.map = slot._games[0].map;
    else slot.map = '';

    // 다음 라운드 전파
    if(slot.winner && tn.bracket[ri+1] && tn.bracket[ri+1][Math.floor(mi/2)]){
      const next = tn.bracket[ri+1][Math.floor(mi/2)];
      const isA = (mi%2===0);
      const wName = slot.winner==='A' ? slot.a : slot.b;
      if(isA && (next.a==='TBD' || !next.a)) next.a = wName;
      if(!isA && (next.b==='TBD' || !next.b)) next.b = wName;
    }

    // 개인 최근경기/대전기록 반영
    if(slot.winner){
      try{ _syncBktMatchToHistory(tn, slot, `pbn_${tn.id}_${ri}_${mi}`, ri, mi); }catch(e){}
    }
  });

  save();
  try{ render(); }catch(e){}
  return true;
}

/* ─────────────────────────────────────────────
   (요청사항) 토너먼트 경기 입력 메뉴
   - "대진표(브라켓) 작성"이 아니라 "토너먼트 기록(16강/8강/4강/결승)"을 입력하는 화면
   - 저장 시: player.history 반영 + 대전기록(프로리그 대회 > 토너먼트) 반영
   - (옵션) 대진표(bracket)가 있는 경우에도 별개로 기록 입력 가능
───────────────────────────────────────────── */
function proCompTourMatchInput(tn){
  if(!tn) return `<div style="padding:30px;text-align:center;color:var(--gray-l)">대회를 선택하세요.</div>`;
  _pcEnsureStageRecords(tn);
  const _roundList = (typeof _PC_STAGE_ROUNDS !== 'undefined' && Array.isArray(_PC_STAGE_ROUNDS)) ? _PC_STAGE_ROUNDS : ['64강','32강','16강','8강','4강','결승'];
  const _defaultRound = '16강';
  const _viewRound0 = String(window._pcStageRecRound||'').trim();
  const viewRound = (_viewRound0==='ALL' || _roundList.includes(_viewRound0)) ? _viewRound0 : _defaultRound;
  window._pcStageRecRound = viewRound;

  // ── (요청사항) "대진표에서 기록"한 내용도 이 탭에 자동 반영되도록: 브라켓에서 게임 단위로 수집
  const _getBracketRoundLabel = (tn, ri)=>{
    const total = (tn && Array.isArray(tn.bracket)) ? tn.bracket.length : 0;
    if (!total) return '';
    if (ri === total-1) return '결승';
    if (ri === total-2) return '4강';
    if (ri === total-3) return '8강';
    const n = Math.pow(2, total - ri);
    return `${n}강`;
  };
  const _bracketItems = [];
  let _stageRecSortSeq = 0;
  try{
    if (tn && Array.isArray(tn.bracket)) {
      tn.bracket.forEach((rnd, ri)=>{
        const lbl = _getBracketRoundLabel(tn, ri);
        // 모든 라운드 표시 (round 필터 제거)
        (rnd||[]).forEach((m, mi)=>{
          if (!m || !m.a || !m.b) return;
          const baseId = `pbn_${tn.id}_${ri}_${mi}`;
          const d = m.d || '';
          // (요청사항) 같은 대결(같은 라운드/같은 두 선수)의 게임들은 여러 카드로 쪼개지 않고 매치 1건으로 합쳐서 표시
          const games = (Array.isArray(m._games) && m._games.length)
            ? m._games.filter(g=>g && g.winner)
            : (m.winner ? [{winner:m.winner, map:m.map||'', d:m.d||''}] : []);
          if (!games.length) return;
          const scoreA = games.filter(g=>g.winner==='A').length;
          const scoreB = games.filter(g=>g.winner==='B').length;
          const overallWinner = scoreA>scoreB ? 'A' : scoreB>scoreA ? 'B' : (m.winner||'');
          _bracketItems.push({
            m:{a:m.a,b:m.b,winner:overallWinner,d,map:(games.length===1?(games[0].map||m.map||''):''), _id:`${baseId}_s0_g0`, _roundLabel:lbl, _games:games},
            src:'bkt',
            ri, mi,
            key: baseId,
            _dateKey: d || '',
            _sortSeq: _stageRecSortSeq++
          });
        });
      });
    }
  }catch(e){}

  // 모든 라운드의 stageRecords 수집
  const _stageList = [];
  const _PC_ALL_ROUNDS = Object.keys(tn.stageRecords||{});
  _PC_ALL_ROUNDS.forEach(rndKey => {
    (tn.stageRecords[rndKey]||[]).forEach((m,i) => {
      _stageList.push({
        m: {...m, _roundLabel: rndKey},
        src:'stage',
        idx:i,
        key:(m&&m._id)||`stage_${rndKey}_${i}`,
        mergeKey:`${rndKey}__${(m&&m._id)?m._id:('idx_'+i)}`,
        _dateKey:(m&&m.d)||'',
        _sortSeq: _stageRecSortSeq++,
        _rnd: rndKey
      });
    });
  });

  const sorted = [..._bracketItems, ..._stageList]
    .sort((a,b)=>(b._dateKey||'').localeCompare(a._dateKey||'')||((a._sortSeq??0)-(b._sortSeq??0))||String(a.key).localeCompare(String(b.key)));

  const _getItemRound = (it)=> String(it?._rnd || it?.m?._roundLabel || '').trim();
  const _filtered = (viewRound === 'ALL') ? sorted : sorted.filter(it => _getItemRound(it) === viewRound);
  const _counts = (() => {
    const c = { ALL: sorted.length };
    _roundList.forEach(r => { c[r] = 0; });
    sorted.forEach(it => {
      const r = _getItemRound(it);
      if (r && (r in c)) c[r] += 1;
    });
    return c;
  })();
  const roundBtns = `<div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:10px">
    <button class="btn ${viewRound==='ALL'?'btn-b':'btn-w'} btn-xs" onclick="window._pcStageRecRound='ALL';render()">전체 <span style="opacity:.8">(${_counts.ALL||0})</span></button>
    ${_roundList.map(r=>`<button class="btn ${viewRound===r?'btn-b':'btn-w'} btn-xs" onclick="window._pcStageRecRound='${r}';render()">${r} <span style="opacity:.8">(${_counts[r]||0})</span></button>`).join('')}
  </div>`;

  const card = (item, displayNo)=>{
    const m = item.m;
    const _cardRound = item._rnd || m._roundLabel || _defaultRound;
    const pa = players.find(p=>p.name===m.a);
    const pb = players.find(p=>p.name===m.b);
    const _ls = (typeof proCompGetLayoutScale==='function') ? proCompGetLayoutScale() : 1;
    const _mainGap = Math.max(6, Math.round(10*_ls));
    const _mainPadT = Math.max(8, Math.round(10*_ls));
    const _mainPadX = Math.max(10, Math.round(12*_ls));
    const _mainPadB = Math.max(10, Math.round(12*_ls));
    const _scoreMinW = Math.max(48, Math.round(60*_ls));
    const isDone = !!m.winner;
    const aWin = isDone && m.winner==='A';
    const bWin = isDone && m.winner==='B';
    const _mGames = Array.isArray(m._games) && m._games.length ? m._games : null;
    const _scoreA = _mGames ? _mGames.filter(g=>g.winner==='A').length : (aWin?1:0);
    const _scoreB = _mGames ? _mGames.filter(g=>g.winner==='B').length : (bWin?1:0);
    const _gameCnt = _mGames ? _mGames.length : 1;
    const col = _cardRound==='결승'?'#f59e0b':_cardRound==='4강'?'#7c3aed':_cardRound==='8강'?'#dc2626':'#2563eb';
    const winRgb = _tcHexToRgbStr(col);
    const _tb = p => p&&p.tier?`<span style="background:${getTierBtnColor(p.tier)||'#64748b'};color:${getTierBtnTextColor(p.tier)||'#fff'};font-size:9px;font-weight:700;padding:1px 5px;border-radius:4px">${p.tier}</span>`:'';
    const _rb = p => p&&p.race?`<span class="rbadge r${p.race}" style="font-size:9px;padding:0 4px">${p.race}</span>`:'';
    const _univ = p => p&&p.univ?`<span style="font-size:9px;color:var(--gray-l);font-weight:600">${p.univ}</span>`:'';
    const dLabel = (m.d||'') ? (m.d||'').slice(2).replace(/-/g,'/') : '미정';
    const _gcByUniv2=(name,p)=>{const _u=p&&p.univ?gc(p.univ):'';return(_u&&_u!=='#6b7280')?_u:gc(name||'');};
    const ca = (typeof gc==='function' ? _gcByUniv2(m.a,players.find(p=>p.name===m.a)) : '#3b82f6');
    const cb = (typeof gc==='function' ? _gcByUniv2(m.b,players.find(p=>p.name===m.b)) : '#ef4444');
    const _fxCfg=(typeof _getRecSideFxCfg==='function')?_getRecSideFxCfg():{on:true,mode:'soft',intensity:68,length:25};
    const _fxOn=!!_fxCfg.on;
    const _fxMetrics=(typeof _buildRecSideFxMetrics==='function')?_buildRecSideFxMetrics(_fxCfg):null;
    const _fxMode=_fxMetrics?_fxMetrics.mode:'soft';
    const _fxVars=(_fxOn&&typeof _recSideFxVarStyle==='function')?_recSideFxVarStyle(ca||'#3b82f6',cb||'#ef4444',_fxCfg):'';
    const _hexRgb2=(h)=>{const s=String(h||'').replace('#','');if(s.length===6){const r=parseInt(s.slice(0,2),16),g=parseInt(s.slice(2,4),16),b=parseInt(s.slice(4,6),16);if(![r,g,b].some(isNaN))return r+','+g+','+b;}return'100,116,139';};
    const _sideRgbVars2=`--rec-side-left-rgb:${_hexRgb2(ca||'#3b82f6')};--rec-side-right-rgb:${_hexRgb2(cb||'#ef4444')};`;
    const _menuBtn = `<button class="btn btn-w btn-xs" style="white-space:nowrap;padding:2px 8px;font-size:16px;line-height:1;font-weight:900" onclick="event.stopPropagation();openPcStageActionMenu(this,'${tn.id}','${_cardRound}',${item.src==='stage'?item.idx:-1},'${item.src}',${item.ri??-1},${item.mi??-1})">⋯</button>`;
    const safe = (s)=>String(s??'').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    const _photo = (p, name, isLose)=>{
      const sz=28;
      const url = p && p.photo ? toHttpsUrl(p.photo) : '';
      const click = name ? `onclick="openPlayerModal('${escJS(name)}')"` : '';
      const loseStyle = isLose ? 'filter:grayscale(1);opacity:.55;' : '';
      if(url) return `<img src="${url}" style="width:${sz}px;height:${sz}px;border-radius:var(--su_profile_radius,50%);clip-path:var(--su_profile_clip,none);object-fit:cover;flex-shrink:0;cursor:pointer;${loseStyle}" ${click} onerror="this.style.display='none'">`;
      return `<span style="width:${sz}px;height:${sz}px;border-radius:var(--su_profile_radius,50%);clip-path:var(--su_profile_clip,none);background:var(--surface);border:1px solid var(--border);display:inline-flex;align-items:center;justify-content:center;font-size:12px;font-weight:900;color:var(--gray-l);flex-shrink:0;${loseStyle}">${safe(name).slice(0,1)||'?'}</span>`;
    };
    const _name = (name, col, isWin, p)=>{
      const click = name ? `onclick="openPlayerModal('${escJS(name)}')"` : '';
      const isLose = isDone && !isWin;
      return `<span style="display:inline-flex;align-items:center;gap:6px;min-width:0;max-width:230px">
        ${_photo(p,name,isLose)}
        <span ${click} style="min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;cursor:pointer;font-weight:${isWin?900:700};color:${isWin?'#dc2626':(isLose?'var(--gray-l)':'var(--text)')};${isLose?'opacity:.75;':''}">${safe(name||'?')}</span>
        ${_rb(p)}${_tb(p)}
        ${_univ(p)}
        ${isDone?`<span style="font-size:10px;font-weight:900;color:${isWin?'#dc2626':'#2563eb'}">${isWin?'WIN':'LOSE'}</span>`:''}
      </span>`;
    };
    const _srcChip = item.src==='bkt'
      ? `<span class="rec-meta-chip" style="background:#eef2ff;border-color:#c7d2fe;color:#4338ca">🗂️ 대진표</span>`
      : `<span class="rec-meta-chip" style="background:#f1f5f9;border-color:#cbd5e1;color:#475569">📝 입력</span>`;
    const _detailPayload = encodeURIComponent(JSON.stringify({
      title:'프로리그 대회 조별리그 대진표 기록',
      subtitle:`${tn.name||''} · ${_cardRound} · ${displayNo}경기`,
      p1:m.a, p2:m.b, p1Score:_scoreA, p2Score:_scoreB,
      winner:aWin?m.a:(bWin?m.b:''), date:m.d||'', games:_mGames||[m]
    }));
    return _proCompH2HCardHTML({
      p1:m.a, p2:m.b, p1Col:ca, p2Col:cb,
      p1Score:_scoreA, p2Score:_scoreB,
      winner:aWin?m.a:(bWin?m.b:''),
      date:m.d||'', games:_mGames||[m],
      badges:[
        `<span style="font-size:11px;color:var(--gray-l)">${dLabel}</span>`,
        `<span style="font-size:10px;font-weight:700;padding:2px 8px;border-radius:99px;background:linear-gradient(135deg,${col},${col}cc);color:#fff">${_cardRound}</span>`,
        _srcChip,
        `<span style="font-size:10px;font-weight:700;padding:2px 8px;border-radius:99px;background:#f1f5f9;color:#475569">${_gameCnt>1?`${_gameCnt}경기`:`${displayNo}경기`}</span>`,
        m.map?`<span style="font-size:11px;color:var(--gray-l)">🗺️ ${safe(m.map)}</span>`:'',
        m.note?`<span style="font-size:11px;color:var(--gray-l)">📝 ${safe(m.note)}</span>`:'',
        pa&&pa.univ?`<span style="font-size:11px;color:${ca};font-weight:800">${pa.univ}</span>`:'',
        pb&&pb.univ?`<span style="font-size:11px;color:${cb};font-weight:800">${pb.univ}</span>`:'',
        !isDone?`<span style="font-size:10px;font-weight:700;padding:2px 8px;border-radius:99px;background:#fff7ed;color:#c2410c">예정</span>`:''
      ],
      detailOnClick:`window.openProCompRecordDetailPopup('${_detailPayload}')`,
      actionHtml:_menuBtn
    });
  };

  // 날짜별 그룹화하여 날짜 헤더 카드 추가
  let listHTML;
  if (!_filtered.length) {
    listHTML = `<div style="margin-top:10px;font-size:12px;color:var(--gray-l)">등록된 기록이 없습니다.</div>`;
  } else {
    const _tByDate = {};
    _filtered.forEach((it, idx) => {
      const k = it._dateKey || '날짜 미정';
      if (!_tByDate[k]) _tByDate[k] = [];
      _tByDate[k].push({it, idx});
    });
    const _tDayKeys = Object.keys(_tByDate).sort((a,b) => b.localeCompare(a));
    const _tDayLabels = ['일요일','월요일','화요일','수요일','목요일','금요일','토요일'];
    let _tNo = 0;
    let _tHtml = '';
    _tDayKeys.forEach(dk => {
      let _tDkLabel = dk;
      if (dk !== '날짜 미정') {
        const dt = new Date(dk + 'T00:00:00');
        _tDkLabel = `${dt.getFullYear()}년 ${dt.getMonth()+1}월 ${dt.getDate()}일 ${_tDayLabels[dt.getDay()]}`;
      }
      _tHtml += `<div style="margin-bottom:22px"><div style="display:flex;align-items:center;gap:10px;margin-bottom:10px"><div style="flex:1;font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:13px;color:#1e3a8a;padding:8px 16px;background:linear-gradient(90deg,#1e3a8a10,transparent);border-left:4px solid #2563eb;border-radius:0 8px 8px 0">📅 ${_tDkLabel}</div></div>`;
      _tByDate[dk].forEach(({it}) => {
        const _cardHtml = card(it, ++_tNo);
        if (window._pcStageMergeMode && it.src === 'stage') {
          const _mChecked = !!(window._pcStageMergeSel && window._pcStageMergeSel.has(it.mergeKey));
          _tHtml += `<div style="position:relative;${_mChecked?'outline:2px solid #7c3aed;border-radius:14px;':''}">
            <label style="position:absolute;top:8px;left:8px;z-index:5;display:flex;align-items:center;gap:4px;background:#fff;border:1px solid var(--border);border-radius:8px;padding:3px 8px;cursor:pointer;box-shadow:0 2px 6px rgba(0,0,0,.08)" onclick="event.stopPropagation()">
              <input type="checkbox" ${_mChecked?'checked':''} onchange="proCompToggleStageMergeSel('${it.mergeKey}')" style="width:16px;height:16px;cursor:pointer">
              <span style="font-size:10px;font-weight:700;color:var(--gray-l)">선택</span>
            </label>
            ${_cardHtml}
          </div>`;
        } else {
          _tHtml += _cardHtml;
        }
      });
      _tHtml += `</div>`;
    });
    listHTML = `<div style="margin-top:10px;display:flex;flex-direction:column;gap:0">${_tHtml}</div>`;
  }

  return `<div style="background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:14px 16px;margin-bottom:12px">
    <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
      <div style="font-weight:900;color:#1d4ed8">🗂️ 대진표 기록(토너먼트 기록)</div>
      <div style="font-size:12px;color:var(--gray-l)">대진표 작성이 아니라, 라운드별 경기 결과를 기록합니다 (64강/32강/16강/8강/4강/결승)</div>
      <div style="margin-left:auto;display:flex;gap:8px;flex-wrap:wrap">
        ${isLoggedIn?`<button class="btn btn-b btn-sm" onclick="openPcStageAddMenu(this,'${tn.id}')">+ 대진표 추가</button>
        <button class="btn btn-p btn-sm" onclick="openPcStageBulkPasteModal('${tn.id}','ALL')">📋 붙여넣기(자동인식)</button>
        <button class="btn ${window._pcStageMergeMode?'btn-b':'btn-w'} btn-sm" onclick="proCompToggleStageMergeMode()">${window._pcStageMergeMode?'✅ 합치기 모드 종료':'🔀 경기 선택해서 합치기'}</button>
        ${window._pcStageMergeMode?`<button class="btn btn-p btn-sm" onclick="proCompMergeSelectedStageMatches('${tn.id}')" ${(!window._pcStageMergeSel||window._pcStageMergeSel.size<2)?'disabled':''}>선택 합치기 (${(window._pcStageMergeSel&&window._pcStageMergeSel.size)||0})</button>`:''}`:''}
      </div>
    </div>
    ${window._pcStageMergeMode?`<div style="font-size:11px;color:var(--gray-l);margin-top:6px">같은 라운드 · 같은 두 선수(팀)의 "📝 입력" 기록만 선택해서 합칠 수 있습니다. (🗂️ 대진표에서 온 기록은 이미 자동으로 합쳐져 있습니다)</div>`:''}
    ${roundBtns}
    ${listHTML}
  </div>`;
}

/* ══════════════════════════════════════════════════════════════
   (요청사항) 대진표 기록(토너먼트 기록) - 사용자가 직접 선택해서 합치기
   - "📝 입력"으로 등록된 stageRecords 항목만 대상 (🗂️ 대진표 항목은 슬롯 단위로 이미 자동 합쳐짐)
   ══════════════════════════════════════════════════════════════ */
function proCompToggleStageMergeMode(){
  window._pcStageMergeMode = !window._pcStageMergeMode;
  window._pcStageMergeSel = new Set();
  render();
}
function proCompToggleStageMergeSel(key){
  window._pcStageMergeSel = window._pcStageMergeSel || new Set();
  if (window._pcStageMergeSel.has(key)) window._pcStageMergeSel.delete(key);
  else window._pcStageMergeSel.add(key);
  render();
}
function proCompMergeSelectedStageMatches(tnId){
  const tn = _findTourneyById(tnId); if (!tn) return;
  _pcEnsureStageRecords(tn);
  const sel = [...(window._pcStageMergeSel || [])];
  if (sel.length < 2) { alert('합칠 경기를 2건 이상 선택하세요.'); return; }
  const parsed = sel.map(k => { const p = k.indexOf('__'); return { rnd: k.slice(0, p), id: k.slice(p + 2) }; });
  const rnd0 = parsed[0].rnd;
  if (parsed.some(p => p.rnd !== rnd0)) { alert('같은 라운드의 경기만 합칠 수 있습니다.'); return; }
  const arr = tn.stageRecords[rnd0] || [];
  const items = parsed.map(p => p.id.startsWith('idx_') ? arr[Number(p.id.slice(4))] : arr.find(x => x && x._id === p.id)).filter(Boolean);
  if (items.length < 2) { alert('선택한 경기를 찾을 수 없습니다. (다시 선택해주세요)'); return; }
  const norm = (m) => [m.a, m.b].slice().sort().join('|');
  const key0 = norm(items[0]);
  if (items.some(it => norm(it) !== key0)) { alert('같은 두 선수(팀)의 경기만 합칠 수 있습니다.'); return; }
  if (!confirm(`선택한 ${items.length}건의 경기를 1건으로 합칩니다.\n개인 전적은 자동으로 다시 계산되어 반영됩니다.\n계속하시겠습니까?`)) return;

  const canonA = items[0].a, canonB = items[0].b;
  const mergedGames = [];
  items.forEach(item => {
    const subGames = (Array.isArray(item._games) && item._games.length)
      ? item._games
      : [{ winner: item.winner, map: item.map || '', d: item.d || '', note: item.note || '' }];
    subGames.forEach(g => {
      if (!g.winner) return;
      const winnerName = g.winner === 'A' ? item.a : item.b;
      const winnerCanon = winnerName === canonA ? 'A' : 'B';
      mergedGames.push({ winner: winnerCanon, map: g.map || '', d: g.d || item.d || '', note: g.note || item.note || '' });
    });
    if (item._id) { try { _revertProMatch(item._id); } catch(e) {} }
  });
  if (!mergedGames.length) { alert('합칠 게임 결과가 없습니다.'); return; }

  items.forEach(item => { const i = arr.indexOf(item); if (i >= 0) arr.splice(i, 1); });

  const mid = `ptr_${tnId}_${rnd0}_` + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const scoreA = mergedGames.filter(g => g.winner === 'A').length;
  const scoreB = mergedGames.filter(g => g.winner === 'B').length;
  const winnerVal = scoreA > scoreB ? 'A' : scoreB > scoreA ? 'B' : '';
  const lastGame = mergedGames[mergedGames.length - 1];
  const dVal = lastGame.d || '';
  const mapVal = mergedGames.length === 1 ? (mergedGames[0].map || '') : '';
  const noteVal = mergedGames.map(g => g.note).filter(Boolean).join(' / ');
  arr.push({ a: canonA, b: canonB, winner: winnerVal, d: dVal, map: mapVal, note: noteVal, _id: mid, _games: mergedGames });
  mergedGames.forEach((g, idx) => {
    const gameId = `${mid}_s0_g${idx}`;
    applyGameResult(g.winner === 'A' ? canonA : canonB, g.winner === 'A' ? canonB : canonA, g.d, g.map || '', gameId, '', '', '프로리그대회');
  });

  window._pcStageMergeSel = new Set();
  window._pcStageMergeMode = false;
  save();
  render();
  setTimeout(() => alert(`${items.length}건의 경기를 1건으로 합쳤습니다.`), 100);
}
try {
  window.proCompToggleStageMergeMode = proCompToggleStageMergeMode;
  window.proCompToggleStageMergeSel = proCompToggleStageMergeSel;
  window.proCompMergeSelectedStageMatches = proCompMergeSelectedStageMatches;
} catch(e) {}
