/* history-procomp.js: extracted from history.js */
/* ══════════════════════════════════════
   대전 기록 > 프로리그 대회 탭
══════════════════════════════════════ */
function histProCompHTML() {
  // (요청사항) 대전기록 > 프로리그 > 대회 탭 아래 하위메뉴:
  // 조별리그 / 토너먼트 / 팀전 / 중장전
  if(!window._histProCompSub) window._histProCompSub='league'; // league | tourney | team | gj
  const sub = window._histProCompSub;
  const _pcSubBar=`<div class="fbar no-export" style="overflow-x:auto;flex-wrap:nowrap;-webkit-overflow-scrolling:touch;scrollbar-width:none;gap:4px;margin-bottom:6px">
    <button class="pill ${sub==='league'?'on':''}" style="flex-shrink:0;white-space:nowrap" onclick="window._histProCompSub='league';render()">📅 조별리그</button>
    <button class="pill ${sub==='tourney'?'on':''}" style="flex-shrink:0;white-space:nowrap" onclick="window._histProCompSub='tourney';render()">🗂️ 토너먼트</button>
    <button class="pill ${sub==='team'?'on':''}" style="flex-shrink:0;white-space:nowrap" onclick="window._histProCompSub='team';render()">🤝 팀전</button>
    <button class="pill ${sub==='gj'?'on':''}" style="flex-shrink:0;white-space:nowrap" onclick="window._histProCompSub='gj';render()">⚔️ 중장전</button>
  </div>`;
  let inner = '';
  if(sub==='league') inner = _histProCompLeagueListHTML();
  else if(sub==='tourney') inner = histProCompTourneyHTML(true);
  else if(sub==='team') inner = histProCompTeamHTML(true);
  else if(sub==='gj') inner = histProCompGJHTML(true);
  else inner = _histProCompLeagueListHTML();
  return _pcSubBar + inner;
}

// 대전기록 > 프로리그 > 대회 > 조별리그(리스트)
function _histProCompLeagueListHTML(){
  // proTourneys에서 완료된 경기만 추출 (조별리그)
  const allItems = [];
  (proTourneys||[]).forEach(tn => {
    // 조별리그 경기
    (tn.groups||[]).forEach((grp, gi) => {
      const gl = 'ABCDEFGHIJ'[gi]||gi;
      const col = ['#2563eb','#dc2626','#16a34a','#d97706','#7c3aed','#0891b2'][gi%6];
      (grp.matches||[]).forEach((m, mi) => {
        if (!m.a||!m.b||!m.winner) return;
        // (요청사항) 조편성 관리에서 "기록 반영=대진표 기록(stage)"인 경우
        // 조별리그 기록 목록에 중복으로 노출되지 않도록 제외
        if (m._stageRecId || (grp._recTarget||'')==='stage') return;
        if (typeof passDateFilter==='function'&&!passDateFilter(m.d||'')) return;
        allItems.push({...m, _tnName:tn.name, _tnId:tn.id, _gi:gi, _mi:mi, _stage:'조별리그', _stageDetail:`GROUP ${gl}`, _stageColor:col});
      });
    });
  });
  allItems.sort((a,b)=>recSortDir==='asc'?(a.d||'').localeCompare(b.d||''):(b.d||'').localeCompare(a.d||''));
  const sortBar = `<div class="fbar no-export" style="overflow-x:auto;flex-wrap:nowrap;-webkit-overflow-scrolling:touch;scrollbar-width:none;gap:4px;margin-bottom:6px;align-items:center">
    <span style="font-size:11px;color:var(--text3)"></span>
    <button class="pill ${recSortDir==='desc'?'on':''}" style="flex-shrink:0;white-space:nowrap" onclick="recSortDir='desc';render()">최신순 ↓</button>
    <button class="pill ${recSortDir==='asc'?'on':''}" style="flex-shrink:0;white-space:nowrap" onclick="recSortDir='asc';render()">오래된순 ↑</button>
    
  </div>`;
  if (!allItems.length) return sortBar+`<div class="empty-state"><div class="empty-state-icon">🏅</div><div class="empty-state-title">프로리그 대회 기록이 없습니다</div><div class="empty-state-desc">대회 경기를 입력하면 여기에 표시됩니다</div></div>`;

  let h = '';
  // 대회명별 그룹화
  const groups = {};
  allItems.forEach(m => {
    if (!groups[m._tnName]) groups[m._tnName] = [];
    groups[m._tnName].push(m);
  });

  const _tb = p => p&&p.tier?`<span style="background:${getTierBtnColor(p.tier)||'#64748b'};color:${getTierBtnTextColor(p.tier)||'#fff'};font-size:9px;font-weight:700;padding:1px 4px;border-radius:3px">${p.tier}</span>`:'';
  const _rb = p => p&&p.race?`<span class="rbadge r${p.race}" style="font-size:9px;padding:0 3px">${p.race}</span>`:'';
  const _photo = p => p&&p.photo?`<img src="${toHttpsUrl(p.photo)}" style="width:22px;height:22px;border-radius:var(--su_profile_radius,50%);object-fit:cover;vertical-align:middle;margin-right:3px;cursor:pointer" onclick="openPlayerModal('${escJS(p.name)}')" onerror="this.style.display='none'">`:'';

  h += sortBar;
  Object.entries(groups).forEach(([tnName, items]) => {
    h += `<div style="background:linear-gradient(135deg,var(--blue-l) 0%,var(--white) 100%);border:1.5px solid var(--blue-ll);border-left:4px solid #0891b2;border-radius:12px;padding:12px 16px;margin:14px 0 6px;display:flex;align-items:center;gap:8px;flex-wrap:wrap">
      <span style="font-size:16px">🏅</span>
      <span style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:15px;color:#0891b2">${tnName}</span>
      <span style="font-size:11px;font-weight:700;color:#0891b2;background:#e0f2fe;border-radius:20px;padding:2px 10px;margin-left:auto">${items.length}경기</span>
    </div>`;
    items.forEach(m => {
      const pa = players.find(p=>p.name===m.a);
      const pb = players.find(p=>p.name===m.b);
      const aWin = m.winner==='A';
      const bWin = m.winner==='B';
      // 스테이지 배지 (조별리그 GROUP A / 준결승 / 결승 등)
      const stageBadge = `<span style="background:${m._stageColor};color:#fff;font-size:10px;font-weight:700;padding:2px 8px;border-radius:4px;white-space:nowrap">${m._stageDetail}</span>`;
      const stageTypeBadge = m._stage==='조별리그'
        ? `<span style="background:#e0f2fe;color:#0891b2;font-size:9px;font-weight:700;padding:1px 6px;border-radius:10px">조별리그</span>`
        : `<span style="background:#fef3c7;color:#b45309;font-size:9px;font-weight:700;padding:1px 6px;border-radius:10px">대진표</span>`;
      h += `<div class="rec-summary rec-mode-procomptn" data-rec-mode="procomptn" style="--rec-mode-col:${m._stageColor};--rec-mode-rgb:${(function(){const h=String(m._stageColor||'').replace('#','');if(h.length!==6)return'100,116,139';return parseInt(h.slice(0,2),16)+','+parseInt(h.slice(2,4),16)+','+parseInt(h.slice(4,6),16);})()};margin-left:8px;border-left:3px solid ${m._stageColor}">
        <div style="padding:5px 12px 0;display:flex;align-items:center;gap:6px">
          <span style="color:var(--text3);font-size:11px;font-weight:600;flex-shrink:0">${m.d?m.d.slice(2).replace(/-/g,'/'):'미정'}</span>
          ${stageTypeBadge}${stageBadge}
          <div class="rec-actions no-export" style="margin-left:auto">
            <button class="btn btn-p btn-xs" data-share-open="procomp" data-a="${encodeURIComponent(m.a||'')}" data-b="${encodeURIComponent(m.b||'')}" data-sa="${aWin?1:0}" data-sb="${bWin?1:0}" data-d="${encodeURIComponent(m.d||'')}">🎴 공유카드</button>
            ${isLoggedIn?`<button class="btn btn-b btn-xs" onclick="proCompEditMatch('${m._tnId||''}',${m._gi||0},${m._mi||0})">✏️ 결과</button>
            <button class="btn btn-r btn-xs" onclick="proCompDelMatch('${m._tnId||''}',${m._gi||0},${m._mi||0})">🗑️ 삭제</button>`:''}
          </div>
        </div>
        <div class="rec-sum-header" style="padding:5px 12px 10px">
          <div class="rec-sum-vs" style="flex:1">
            <div style="display:flex;align-items:center;gap:4px;${aWin?'':'opacity:.7'}">
              ${_photo(pa)}
              <span style="font-weight:${aWin?'800':'500'};font-size:13px;color:${aWin?'#16a34a':'var(--text)'};cursor:pointer;text-decoration:underline dotted" onclick="openPlayerModal('${escJS(m.a)}')">${m.a}</span>
              ${_rb(pa)}${_tb(pa)}
              ${pa&&pa.univ?`<span style="font-size:10px;color:var(--gray-l)">${pa.univ}</span>`:''}
              ${aWin?`<span style="font-size:10px;font-weight:800;color:#16a34a;margin-left:2px">WIN</span>`:''}
            </div>
            <span style="font-size:11px;color:var(--gray-l);font-weight:700;flex-shrink:0">vs</span>
            <div style="display:flex;align-items:center;gap:4px;${bWin?'':'opacity:.7'}">
              ${_photo(pb)}
              <span style="font-weight:${bWin?'800':'500'};font-size:13px;color:${bWin?'#16a34a':'var(--text)'};cursor:pointer;text-decoration:underline dotted" onclick="openPlayerModal('${escJS(m.b)}')">${m.b}</span>
              ${_rb(pb)}${_tb(pb)}
              ${pb&&pb.univ?`<span style="font-size:10px;color:var(--gray-l)">${pb.univ}</span>`:''}
              ${bWin?`<span style="font-size:10px;font-weight:800;color:#16a34a;margin-left:2px">WIN</span>`:''}
            </div>
            ${m.map?`<span style="font-size:10px;color:var(--gray-l);flex-shrink:0">📍${m.map}</span>`:''}
          </div>
        </div>
      </div>`;
    });
  });
  return h;
}

/* ══════════════════════════════════════
   대전 기록 > 프로리그 토너먼트 탭 (대진표 + 3위전)
══════════════════════════════════════ */
function histProCompTourneyHTML(_omitBar) {
  const _pcSubBar2=_omitBar?'':`<div class="fbar no-export" style="overflow-x:auto;flex-wrap:nowrap;-webkit-overflow-scrolling:touch;scrollbar-width:none;gap:4px;margin-bottom:6px">
    <button class="pill" style="flex-shrink:0;white-space:nowrap" onclick="window._histProCompSub='league';histSub='procomp';render()">📅 조별리그</button>
    <button class="pill on" style="flex-shrink:0;white-space:nowrap">🗂️ 토너먼트</button>
    <button class="pill" style="flex-shrink:0;white-space:nowrap" onclick="window._histProCompSub='team';histSub='procomp';render()">🤝 팀전</button>
    <button class="pill" style="flex-shrink:0;white-space:nowrap" onclick="window._histProCompSub='gj';histSub='procomp';render()">⚔️ 중장전</button>
  </div>`;
  const allItems = [];
  (proTourneys||[]).forEach(tn => {
    // 1) (신규) 대진표 기록(라운드 기록) 기반
    if(tn && tn.stageRecords){
      const st = tn.stageRecords || {};
      const order=['16강','8강','4강','결승'];
      const colOf = (r)=>r==='결승'?'#f59e0b':r==='4강'?'#7c3aed':r==='8강'?'#dc2626':'#2563eb';
      order.forEach(r=>{
        (st[r]||[]).forEach((m, idx)=>{
          if(!m||!m.a||!m.b||!m.winner) return;
          if (typeof passDateFilter==='function'&&!passDateFilter(m.d||'')) return;
          allItems.push({...m, _tnName:tn.name, _tnId:tn.id, _round:r, _idx:idx, _stage:'토너먼트', _stageDetail:r, _stageColor:colOf(r), d:m.d||''});
        });
      });
      return;
    }
    // 2) (호환) 기존 대진표(bracket) 기반
    const rounds = tn.bracket||[];
    const totalRounds = rounds.length;
    rounds.forEach((rnd, ri) => {
      // 라운드 표기: 16강/8강/4강/결승 (※ 4강=준결승)
      const rndLabel = ri===totalRounds-1?'결승':ri===totalRounds-2?'4강':ri===totalRounds-3?'8강':`${Math.pow(2,totalRounds-ri)}강`;
      const stageColor = ri===totalRounds-1?'#f59e0b':ri===totalRounds-2?'#7c3aed':ri===totalRounds-3?'#dc2626':'#2563eb';
      rnd.forEach(m => {
        if (!m.a||!m.b) return;
        const scoreA = (m._games||[]).filter(g=>g.winner==='A').length;
        const scoreB = (m._games||[]).filter(g=>g.winner==='B').length;
        const isTieSaved = (!m.winner && Array.isArray(m._games) && m._games.length>0 && scoreA===scoreB && (scoreA+scoreB)>0);
        if (!m.winner && !isTieSaved) return;
        if (typeof passDateFilter==='function'&&!passDateFilter(m.d||'')) return;
        allItems.push({...m, _tnName:tn.name, _tnId:tn.id, _ri:ri, _mi:(m._mi!==undefined?m._mi:null), _stage:'토너먼트', _stageDetail:rndLabel, _stageColor:stageColor, d:m.d||'', _isTie:isTieSaved, _scoreA:scoreA, _scoreB:scoreB});
      });
    });
    if (tn.thirdPlace&&tn.thirdPlace.a&&tn.thirdPlace.b&&tn.thirdPlace.winner) {
      if (!(typeof passDateFilter==='function'&&!passDateFilter(tn.thirdPlace.d||''))) {
        allItems.push({...tn.thirdPlace, _tnName:tn.name, _tnId:tn.id, _ri:'3rd', _mi:0, _stage:'토너먼트', _stageDetail:'3위전', _stageColor:'#cd7f32', d:tn.thirdPlace.d||''});
      }
    }
  });
  allItems.sort((a,b)=>recSortDir==='asc'?(a.d||'').localeCompare(b.d||''):(b.d||'').localeCompare(a.d||''));
  const sortBar=`<div class="fbar no-export" style="overflow-x:auto;flex-wrap:nowrap;-webkit-overflow-scrolling:touch;scrollbar-width:none;gap:4px;margin-bottom:6px;align-items:center">
    <span style="font-size:11px;color:var(--text3)"></span>
    <button class="pill ${recSortDir==='desc'?'on':''}" style="flex-shrink:0;white-space:nowrap" onclick="recSortDir='desc';render()">최신순 ↓</button>
    <button class="pill ${recSortDir==='asc'?'on':''}" style="flex-shrink:0;white-space:nowrap" onclick="recSortDir='asc';render()">오래된순 ↑</button>
    
  </div>`;
  if (!allItems.length) return _pcSubBar2+sortBar+`<div class="empty-state"><div class="empty-state-icon">🗂️</div><div class="empty-state-title">토너먼트 기록이 없습니다</div><div class="empty-state-desc">대진표 기록에서 결과를 입력하면 여기에 표시됩니다</div></div>`;
  const groups={};
  allItems.forEach(m=>{if(!groups[m._tnName])groups[m._tnName]=[];groups[m._tnName].push(m);});
  const _tb=p=>p&&p.tier?`<span style="background:${getTierBtnColor(p.tier)||'#64748b'};color:${getTierBtnTextColor(p.tier)||'#fff'};font-size:9px;font-weight:700;padding:1px 4px;border-radius:3px">${p.tier}</span>`:'';
  const _rb=p=>p&&p.race?`<span class="rbadge r${p.race}" style="font-size:9px;padding:0 3px">${p.race}</span>`:'';
  const _photo=p=>p&&p.photo?`<img src="${toHttpsUrl(p.photo)}" style="width:22px;height:22px;border-radius:var(--su_profile_radius,50%);object-fit:cover;vertical-align:middle;margin-right:3px;cursor:pointer" onclick="openPlayerModal('${escJS(p.name)}')" onerror="this.style.display='none'">`:'';
  let h=_pcSubBar2+sortBar;
  Object.entries(groups).forEach(([tnName,items])=>{
    h+=`<div style="background:linear-gradient(135deg,#f5f3ff 0%,var(--white) 100%);border:1.5px solid #ddd6fe;border-left:4px solid #7c3aed;border-radius:12px;padding:12px 16px;margin:14px 0 6px;display:flex;align-items:center;gap:8px;flex-wrap:wrap">
      <span style="font-size:16px">🗂️</span>
      <span style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:15px;color:#7c3aed">${tnName}</span>
      <span style="font-size:11px;font-weight:700;color:#7c3aed;background:#f5f3ff;border-radius:20px;padding:2px 10px;margin-left:auto">${items.length}경기</span>
    </div>`;
    items.forEach(m=>{
      const pa=players.find(p=>p.name===m.a), pb=players.find(p=>p.name===m.b);
      const aWin=m.winner==='A', bWin=m.winner==='B';
      const stageBadge=`<span style="background:${m._stageColor};color:#fff;font-size:10px;font-weight:700;padding:2px 8px;border-radius:4px;white-space:nowrap">${m._stageDetail}</span>`;
      const tieBadge = m._isTie ? `<span style="background:#fffbeb;color:#b45309;border:1px solid #fde68a;font-size:10px;font-weight:900;padding:2px 8px;border-radius:999px;white-space:nowrap">⚖️ ${m._scoreA||0}:${m._scoreB||0}</span>` : '';
      h+=`<div class="rec-summary rec-mode-procomptn" data-rec-mode="procomptn" style="--rec-mode-col:${m._stageColor};--rec-mode-rgb:${(function(){const h=String(m._stageColor||'').replace('#','');if(h.length!==6)return'100,116,139';return parseInt(h.slice(0,2),16)+','+parseInt(h.slice(2,4),16)+','+parseInt(h.slice(4,6),16);})()};margin-left:8px;border-left:3px solid ${m._stageColor}">
        <div style="padding:5px 12px 0;display:flex;align-items:center;gap:6px">
          <span style="color:var(--text3);font-size:11px;font-weight:600;flex-shrink:0">${m.d?m.d.slice(2).replace(/-/g,'/'):'미정'}</span>
          <span style="background:#f5f3ff;color:#7c3aed;font-size:9px;font-weight:700;padding:1px 6px;border-radius:10px">토너먼트</span>
          ${stageBadge}
          ${tieBadge}
          <div class="rec-actions no-export" style="margin-left:auto">
            <button class="btn btn-p btn-xs" data-share-open="procomp" data-a="${encodeURIComponent(m.a||'')}" data-b="${encodeURIComponent(m.b||'')}" data-sa="${m._isTie?(m._scoreA||0):(aWin?1:0)}" data-sb="${m._isTie?(m._scoreB||0):(bWin?1:0)}" data-d="${encodeURIComponent(m.d||'')}">🎴 공유카드</button>
            ${isLoggedIn?`<button class="btn btn-b btn-xs" onclick="try{ if(typeof openPcStageRecModal==='function' && m._round) openPcStageRecModal('${(m._tnId||'').replace(/'/g,"\\'")}', '${(m._round||'').replace(/'/g,"\\'")}', ${m._idx||0}); else if(typeof openPcBktPasteModal==='function') openPcBktPasteModal('${(m._tnId||'').replace(/'/g,"\\'")}', ${JSON.stringify(m._ri)}, ${m._mi||0}); }catch(e){}">✏️ 기록</button>`:''}
          </div>
        </div>
        <div class="rec-sum-header" style="padding:5px 12px 10px">
          <div class="rec-sum-vs" style="flex:1">
            <div style="display:flex;align-items:center;gap:4px;${(aWin||m._isTie)?'':'opacity:.7'}">
              ${_photo(pa)}<span style="font-weight:${aWin?'800':m._isTie?'800':'500'};font-size:13px;color:${aWin?'#16a34a':m._isTie?'#b45309':'var(--text)'}">${m.a}</span>
              ${_rb(pa)}${_tb(pa)}${aWin?`<span style="font-size:10px;font-weight:800;color:#16a34a;margin-left:2px">WIN</span>`:''}
            </div>
            <span style="font-size:11px;color:var(--gray-l);font-weight:700;flex-shrink:0">vs</span>
            <div style="display:flex;align-items:center;gap:4px;${(bWin||m._isTie)?'':'opacity:.7'}">
              ${_photo(pb)}<span style="font-weight:${bWin?'800':m._isTie?'800':'500'};font-size:13px;color:${bWin?'#16a34a':m._isTie?'#b45309':'var(--text)'}">${m.b}</span>
              ${_rb(pb)}${_tb(pb)}${bWin?`<span style="font-size:10px;font-weight:800;color:#16a34a;margin-left:2px">WIN</span>`:''}
            </div>
            ${m.map?`<span style="font-size:10px;color:var(--gray-l);flex-shrink:0">📍${m.map}</span>`:''}
          </div>
        </div>
      </div>`;
    });
  });
  return h;
}

/* ══════════════════════════════════════
   대전 기록 > 프로리그 팀전 탭
══════════════════════════════════════ */
function histProCompTeamHTML(_omitBar) {
  // proTourneys.teamMatches 전체 추출
  const tmList = []; // [{tnName, tm}]
  (proTourneys||[]).forEach(tn => {
    (tn.teamMatches||[]).forEach(tm => {
      const games = (tm.games||[]).filter(g=>g.wName&&g.lName);
      if (!games.length) return;
      if (typeof passDateFilter==='function'&&!passDateFilter(tm.d||'')) return;
      tmList.push({tnName:tn.name, tm});
    });
  });
  tmList.sort((a,b)=>recSortDir==='asc'?(a.tm.d||'').localeCompare(b.tm.d||''):(b.tm.d||'').localeCompare(a.tm.d||''));
  const totalGames = tmList.reduce((s,x)=>s+(x.tm.games||[]).filter(g=>g.wName&&g.lName).length,0);
  const sortBar=`<div class="fbar no-export" style="overflow-x:auto;flex-wrap:nowrap;-webkit-overflow-scrolling:touch;scrollbar-width:none;gap:4px;margin-bottom:6px;align-items:center">
    <span style="font-size:11px;color:var(--text3)"></span>
    <button class="pill ${recSortDir==='desc'?'on':''}" style="flex-shrink:0;white-space:nowrap" onclick="recSortDir='desc';render()">최신순 ↓</button>
    <button class="pill ${recSortDir==='asc'?'on':''}" style="flex-shrink:0;white-space:nowrap" onclick="recSortDir='asc';render()">오래된순 ↑</button>
    <span style="font-size:11px;color:var(--gray-l);margin-left:4px">${totalGames}경기 / ${tmList.length}팀전</span>
  </div>`;
  if (!tmList.length) return sortBar+`<div class="empty-state"><div class="empty-state-icon">🤝</div><div class="empty-state-title">팀전 기록이 없습니다</div><div class="empty-state-desc">프로리그 대회 팀전 결과를 입력하면 여기에 표시됩니다</div></div>`;
  const _tb=p=>p&&p.tier?`<span style="background:${getTierBtnColor(p.tier)||'#64748b'};color:${getTierBtnTextColor(p.tier)||'#fff'};font-size:9px;font-weight:700;padding:1px 4px;border-radius:3px">${p.tier}</span>`:'';
  const _rb=p=>p&&p.race?`<span class="rbadge r${p.race}" style="font-size:9px;padding:0 3px">${p.race}</span>`:'';
  const _photo=p=>p&&p.photo?`<img src="${toHttpsUrl(p.photo)}" style="width:22px;height:22px;border-radius:var(--su_profile_radius,50%);object-fit:cover;vertical-align:middle;margin-right:3px;cursor:pointer" onclick="openPlayerModal('${escJS(p.name)}')" onerror="this.style.display='none'">`:'';
  const colA='#2563eb', colB='#dc2626';
  let h=sortBar;
  // 대회명별 그룹
  const byTn={};
  tmList.forEach(({tnName,tm})=>{ if(!byTn[tnName])byTn[tnName]=[]; byTn[tnName].push(tm); });
  Object.entries(byTn).forEach(([tnName,tms])=>{
    const gCnt=tms.reduce((s,tm)=>s+(tm.games||[]).filter(g=>g.wName&&g.lName).length,0);
    h+=`<div style="background:linear-gradient(135deg,#ecfdf5 0%,var(--white) 100%);border:1.5px solid #bbf7d0;border-left:4px solid #16a34a;border-radius:12px;padding:12px 16px;margin:14px 0 6px;display:flex;align-items:center;gap:8px;flex-wrap:wrap">
      <span style="font-size:16px">🤝</span>
      <span style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:15px;color:#16a34a">${tnName}</span>
      <span style="font-size:11px;font-weight:700;color:#16a34a;background:#dcfce7;border-radius:20px;padding:2px 10px;margin-left:auto">${tms.length}팀전 · ${gCnt}경기</span>
    </div>`;
    tms.forEach(tm=>{
      const aWin=tm.sa>tm.sb, bWin=tm.sb>tm.sa;
      const games=(tm.games||[]).filter(g=>g.wName&&g.lName);
      h+=`<div style="border:1.5px solid var(--border);border-radius:10px;padding:10px 14px;margin-bottom:10px">
        <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:8px;padding-bottom:8px;border-bottom:1px solid var(--border)">
          <span style="font-size:12px;font-weight:600;color:var(--text3)">${tm.d||'날짜 미정'}</span>
          <span style="background:#e0f2fe;color:#0284c7;font-size:9px;font-weight:700;padding:1px 6px;border-radius:10px">팀전</span>
          <span style="font-weight:${aWin?900:600};color:${aWin?colA:'var(--text)'};font-size:13px">${tm.teamAName||'A팀'}</span>
          <span style="font-size:16px;font-weight:900;background:${aWin?colA:bWin?colB:'var(--border)'};color:#fff;padding:1px 10px;border-radius:6px">${tm.sa||0}:${tm.sb||0}</span>
          <span style="font-weight:${bWin?900:600};color:${bWin?colB:'var(--text)'};font-size:13px">${tm.teamBName||'B팀'}</span>
          <button class="btn btn-p btn-xs no-export" style="margin-left:auto" data-share-open="procomp" data-a="${encodeURIComponent(tm.teamAName||'A팀')}" data-b="${encodeURIComponent(tm.teamBName||'B팀')}" data-sa="${tm.sa||0}" data-sb="${tm.sb||0}" data-d="${encodeURIComponent(tm.d||'')}">🎴 공유카드</button>
        </div>
        ${games.map(g=>{
          const pw=players.find(p=>p.name===g.wName), pl=players.find(p=>p.name===g.lName);
          const sideWin=g._sideW==='A'?tm.teamAName||'A팀':tm.teamBName||'B팀';
          return `<div class="rec-summary rec-mode-procompteam" data-rec-mode="procompteam" style="--rec-mode-col:${g._sideW==='A'?colA:colB};--rec-mode-rgb:${(function(){const c=(g._sideW==='A'?colA:colB);const h=String(c||'').replace('#','');if(h.length!==6)return'100,116,139';return parseInt(h.slice(0,2),16)+','+parseInt(h.slice(2,4),16)+','+parseInt(h.slice(4,6),16);})()};margin-left:4px;border-left:3px solid ${g._sideW==='A'?colA:colB}">
            <div class="rec-sum-header">
              <span style="background:${g._sideW==='A'?colA:colB};color:#fff;font-size:9px;font-weight:700;padding:1px 5px;border-radius:4px">${sideWin}</span>
              <div class="rec-sum-vs" style="flex:1">
                <div style="display:flex;align-items:center;gap:4px">
                  ${_photo(pw)}<span style="font-weight:800;font-size:13px;color:#16a34a">${g.wName}</span>
                  ${_rb(pw)}${_tb(pw)}
                  ${pw&&pw.univ?`<span style="font-size:10px;color:var(--gray-l)">${pw.univ}</span>`:''}
                  <span style="font-size:10px;font-weight:800;color:#16a34a;margin-left:2px">WIN</span>
                </div>
                <span style="font-size:11px;color:var(--gray-l);font-weight:700;flex-shrink:0">vs</span>
                <div style="display:flex;align-items:center;gap:4px;opacity:.7">
                  ${_photo(pl)}<span style="font-weight:500;font-size:13px;color:var(--text)">${g.lName}</span>
                  ${_rb(pl)}${_tb(pl)}
                  ${pl&&pl.univ?`<span style="font-size:10px;color:var(--gray-l)">${pl.univ}</span>`:''}
                </div>
                ${g.map?`<span style="font-size:10px;color:var(--gray-l);flex-shrink:0">📍${g.map}</span>`:''}
              </div>
            </div>
          </div>`;
        }).join('')}
      </div>`;
    });
  });
  return h;
}

/* ══════════════════════════════════════
   ⚔️ 프로리그 대회 중장전 기록
══════════════════════════════════════ */
function histProCompGJHTML(_omitBar){
  const _pcGjBar=_omitBar?'':`<div class="fbar no-export" style="overflow-x:auto;flex-wrap:nowrap;-webkit-overflow-scrolling:touch;scrollbar-width:none;gap:4px;margin-bottom:6px">
    <button class="pill" style="flex-shrink:0;white-space:nowrap" onclick="window._histProCompSub='league';histSub='procomp';render()">📅 조별리그</button>
    <button class="pill" style="flex-shrink:0;white-space:nowrap" onclick="window._histProCompSub='tourney';histSub='procomp';render()">🗂️ 토너먼트</button>
    <button class="pill" style="flex-shrink:0;white-space:nowrap" onclick="window._histProCompSub='team';histSub='procomp';render()">🤝 팀전</button>
    <button class="pill on" style="flex-shrink:0;white-space:nowrap">⚔️ 중장전</button>
  </div>`;
  const allSess=[];
  (proTourneys||[]).forEach(tn=>{
    (tn.gjMatches||[]).forEach(sess=>{
      allSess.push({...sess,tnName:tn.name});
    });
  });
  if(!allSess.length)return _pcGjBar+`<div class="empty-state"><div class="empty-state-icon">⚔️</div><div class="empty-state-title">프로리그 대회 중장전 기록이 없습니다</div><div class="empty-state-desc">프로리그 대회 탭 → 중장전에서 입력하세요</div></div>`;
  allSess.sort((a,b)=>(b.d||'').localeCompare(a.d||''));
  let h=_pcGjBar;
  allSess.forEach(sess=>{
    const p1w=(sess.games||[]).filter(g=>g.winner===sess.a).length;
    const p2w=(sess.games||[]).filter(g=>g.winner===sess.b).length;
    const winner=p1w>p2w?sess.a:p2w>p1w?sess.b:'';
    const _sid = String(sess._id||'').replace(/'/g,"\\'");
    h+=`<div style="border:1px solid var(--border);border-radius:8px;margin-bottom:8px;overflow:hidden">
      <div style="background:var(--bg2);padding:10px 14px;display:flex;align-items:center;gap:10px;flex-wrap:wrap;cursor:pointer" onclick="openMatchDetailByMatchId('${_sid}','프로리그대회끝장전')">
        <span style="font-size:12px;font-weight:600;color:var(--text3)">${sess.d||'날짜 미정'}</span>
        <span style="font-size:11px;background:#0891b2;color:#fff;padding:1px 8px;border-radius:4px;font-weight:700">🎖️ ${sess.tnName||''}</span>
        <span style="font-weight:700;color:var(--blue);cursor:pointer" onclick="event.stopPropagation();openPlayerModal(decodeURIComponent('${encodeURIComponent(sess.a||'')}'))">${sess.a||'?'}</span>
        <span class="score-click" style="font-weight:1000;color:var(--blue);text-decoration:underline;text-underline-offset:3px;text-decoration-style:dotted">${p1w} - ${p2w}</span>
        <span style="font-weight:700;cursor:pointer" onclick="event.stopPropagation();openPlayerModal(decodeURIComponent('${encodeURIComponent(sess.b||'')}'))">${sess.b||'?'}</span>
        ${winner?`<span style="font-size:11px;color:#16a34a;font-weight:700">(${winner} 승)</span>`:''}
        <span style="font-size:11px;color:var(--gray-l)">${(sess.games||[]).length}게임</span>
        <button class="btn btn-w btn-xs no-export" style="margin-left:auto" onclick="event.stopPropagation();openMatchDetailByMatchId('${_sid}','프로리그대회끝장전')">📂 경기 상세</button>
      </div>
      <table style="margin:0;border-radius:0"><thead><tr><th>게임</th><th>${sess.a||'A'}</th><th style="color:var(--gray-l)">vs</th><th>${sess.b||'B'}</th><th>맵</th></tr></thead><tbody>
      ${(sess.games||[]).map((g,gi)=>{
        const aWin=g.winner===sess.a;
        return`<tr><td style="font-size:11px;color:var(--gray-l)">${gi+1}게임</td><td style="font-weight:${aWin?'900':'400'};color:${aWin?'var(--blue)':'#aaa'}">${aWin?'▶ '+sess.a:sess.a}</td><td style="color:var(--gray-l);text-align:center">vs</td><td style="font-weight:${!aWin?'900':'400'};color:${!aWin?'var(--blue)':'#aaa'}">${!aWin?'▶ '+sess.b:sess.b}</td><td style="font-size:11px;color:var(--gray-l)">${g.map||''}</td></tr>`;
      }).join('')}
      </tbody></table>
    </div>`;
  });
  return h;
}
