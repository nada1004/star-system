/* ══════════════════════════════════════════════════════════════
   프로리그 - 조별리그 렌더 / 그룹랭크 / 병합모드 (pro-comp-core.js 에서 분리, 2026-07-30)
   ══════════════════════════════════════════════════════════════ */

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

    let h = `<div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;flex-wrap:wrap;padding:12px 16px;background:var(--gold-bg);border:1px solid var(--gold-b);border-radius:var(--r)">
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
      ${tn?`<span style="font-size:var(--fs-caption);color:var(--gray-l)">총 ${(tn.groups||[]).length}개 조 · ${(tn.groups||[]).reduce((s,g)=>s+(g.matches||[]).length,0)}경기</span>`:''}
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
    h += `<div style="margin-bottom:12px;padding:10px 14px;background:var(--surface);border-radius:var(--r);border:1px solid var(--border)">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
        <span style="font-size:var(--fs-sm);font-weight:700;color:${_pctColor}">전체 진행률</span>
        <span style="font-size:var(--fs-sm);color:var(--gray-l)">${_doneM}/${_totalM}경기 완료</span>
        <span style="margin-left:auto;font-size:var(--fs-base);font-weight:800;color:${_pctColor}">${_pct}%</span>
      </div>
      <div style="height:8px;background:var(--border);border-radius:4px;overflow:hidden">
        <div style="height:100%;width:${_pct}%;background:${_pctColor};border-radius:4px;transition:.3s"></div>
      </div>
    </div>`;
  }
  h += `<div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;flex-wrap:wrap">
    <div style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:var(--fs-md);color:var(--blue)">🏆 ${tn.name} <span style="font-size:var(--fs-sm);color:var(--gray-l);font-weight:800">(조별리그)</span></div>
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
      ${window._pcMergeMode?`<span style="font-size:var(--fs-caption);color:var(--gray-l)">같은 조 · 같은 두 선수의 경기를 선택하세요 (${(window._pcMergeSel&&window._pcMergeSel.size)||0}건 선택됨)</span>
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
      <div style="display:flex;gap:6px;flex-wrap:nowrap">
        <button class="pill ${proCompSortDir==='desc'?'on':''}" style="flex-shrink:0" onclick="proCompSortDir='desc';recSortDir='desc';render()">최신순</button>
        <button class="pill ${proCompSortDir==='asc'?'on':''}" style="flex-shrink:0" onclick="proCompSortDir='asc';recSortDir='asc';render()">오래된순</button>
      </div>
      ${(typeof pcAltViewModeBarHTML==='function')?pcAltViewModeBarHTML('pcleague'):''}
    </div>`;
  }
  // (신규기능) 미니 기본/그리드/컴팩트 테이블형 보기모드
  if((typeof pcAltViewMode==='function') && pcAltViewMode('pcleague')!=='basic'){
    return h + pcAltRecordsHTML('pcleague', tn);
  }
  if (grpList.length > 1) {
    // 조 선택은 "전체/일자" 메뉴 영역 우측으로 이동됨
    const grpsWithDone = grpList.map(x=>x.grp).filter(g=>(g.matches||[]).some(m=>m.winner));
    if (grpsWithDone.length) {
      h += `<div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:12px;align-items:center"><span style="font-size:var(--fs-caption);font-weight:700;color:var(--gray-l)">조별 공유카드:</span>`;
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
    h += `<div style="padding:40px;text-align:center;color:var(--gray-l);background:var(--surface);border-radius:var(--r)">
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
        <div style="flex:1;font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:var(--fs-base);color:#1e3a8a;padding:8px 16px;background:linear-gradient(90deg,#1e3a8a10,transparent);border-left:4px solid #2563eb;border-radius:0 8px 8px 0">📅 ${dateLabel}</div>
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
            <div style="font-size:var(--fs-caption);font-weight:800;color:${p&&p.photo?'rgba(255,255,255,.85)':'#64748b'};text-shadow:${p&&p.photo?'0 2px 10px rgba(0,0,0,.35)':'none'}">${p?.univ||''}</div>
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
        return `<span style="width:${sz}px;height:${sz}px;border-radius:var(--su_profile_radius,50%);clip-path:var(--su_profile_clip,none);background:var(--surface);border:1px solid var(--border);display:inline-flex;align-items:center;justify-content:center;font-size:var(--fs-sm);font-weight:900;color:var(--gray-l);flex-shrink:0;${loseStyle}">${safe(name).slice(0,1)||'?'}</span>`;
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
          `<span style="font-size:var(--fs-caption);color:var(--gray-l)">${m.d?m.d.slice(2).replace(/-/g,'/'):'미정'}</span>`,
          `<span style="font-size:10px;font-weight:700;padding:2px 8px;border-radius:99px;background:linear-gradient(135deg,${m.grpColor},${m.grpColor}cc);color:#fff">${m.grpName?m.grpName:`GROUP ${m.grpLetter}`}</span>`,
          `<span style="font-size:10px;font-weight:700;padding:2px 8px;border-radius:99px;background:#f1f5f9;color:#475569">${_gameCnt>1?`${_gameCnt}경기`:`${m.matchNum}경기`}</span>`,
          m.map?`<span style="font-size:var(--fs-caption);color:var(--gray-l)">🗺️ ${safe(m.map)}</span>`:'',
          pa&&pa.univ?`<span style="font-size:var(--fs-caption);color:${ca};font-weight:800">${pa.univ}</span>`:'',
          pb&&pb.univ?`<span style="font-size:var(--fs-caption);color:${cb};font-weight:800">${pb.univ}</span>`:'',
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
    <div style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:var(--fs-md);color:var(--blue)">🏆 ${tn.name} 조별 순위</div>
    <button class="btn btn-w btn-xs no-export" onclick="proCompPrintRank()" style="margin-left:auto">📊 결과 인쇄/저장</button>
  </div>`;
  grpList.forEach((grp, gi) => {
    const col = ['#2563eb','#dc2626','#16a34a','#d97706','#7c3aed','#0891b2'][gi%6];
    const ranks = _calcProGrpRank(grp);
    const _gTotal=(grp.matches||[]).length, _gDone=(grp.matches||[]).filter(m=>m.winner).length;
    const _gPct=_gTotal?Math.round(_gDone/_gTotal*100):0;
    h += `<div style="margin-bottom:20px;border-radius:12px;overflow:hidden;border:1px solid ${col}33">
      <div style="padding:10px 16px;background:linear-gradient(135deg,${col},${col}cc);color:#fff;font-weight:900;font-size:var(--fs-base);display:flex;align-items:center;gap:8px">
        <span>GROUP ${GL[gi]} · ${grp.name||GL[gi]+'조'}</span>
        <span style="margin-left:auto;font-size:var(--fs-caption);font-weight:600;opacity:.85">${_gDone}/${_gTotal}경기 · ${_gPct}%</span>
        ${_gDone>0?(()=>{const _adm=(localStorage.getItem('su_share_admin_only')||'0')==='1';return(!_adm||isLoggedIn)?`<button class="btn btn-xs no-export" style="background:rgba(255,255,255,.2);color:#fff;border:1px solid rgba(255,255,255,.35);font-size:var(--fs-caption);padding:2px 8px" onclick="_openProCompGrpAllShareCard('${tn.id}',${gi})" title="조 전체 공유카드">📷</button>`:'';})():''}
      </div>
      ${_gTotal>0?`<div style="height:4px;background:${col}33"><div style="height:100%;width:${_gPct}%;background:${col};transition:.3s"></div></div>`:''}
      <table style="width:100%;border-collapse:collapse;font-size:var(--fs-base)">
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
      const _photo = p&&p.photo?`<img src="${toHttpsUrl(p.photo)}" style="width:28px;height:28px;border-radius:var(--su_profile_radius,50%);object-fit:cover;margin-right:6px;vertical-align:middle;flex-shrink:0" onerror="this.style.display='none'">`:'<span style="width:28px;height:28px;border-radius:var(--su_profile_radius,50%);background:var(--border);display:inline-flex;align-items:center;justify-content:center;margin-right:6px;font-size:var(--fs-base);flex-shrink:0">👤</span>';
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
                <span style="font-weight:${idx<2?'800':'600'};font-size:var(--fs-base);cursor:pointer;color:var(--blue)" onclick="openPlayerModal('${escJS(r.name)}')">${r.name}</span>
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
