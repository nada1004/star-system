function pasteApply() {
  if (!window._pasteResults) return;
  if (!isLoggedIn) return alert('로그인이 필요합니다.');
  const _fromHistExt = !!window._pasteFromHistExt;
  const _fromTierBkt = !!window._pasteFromTierBkt;

  // 대회 경기 세트 적용 모드 분기
  if (window._grpPasteMode) {
    const savable = window._pasteResults.filter(r => (r.wPlayer && r.lPlayer) || r._scoreOnly);
    if (!savable.length) return alert('저장 가능한 경기가 없습니다.');

    const _closeGrpPaste = () => {
      window._grpPasteMode = false;
      cm('pasteModal');
      window._pasteResults = null;
      window._pasteErrors  = null;
      const compWrap = document.getElementById('paste-comp-wrap');
      // (버그픽스) 토너먼트/세트 입력(compWrap)을 닫을 때 HTML을 원상복구해야 함
      // - 기존 코드는 innerHTML을 단일 input으로 덮어써서 "티어대회 구분(일반/조별/토너)" UI가 사라짐
      // - 그 결과 티어대회 일반 입력도 localStorage 값(이전 토너 선택)으로 저장되어 토너 탭으로 가는 문제가 발생
      if(compWrap) {
        compWrap.style.display='none';
        compWrap.innerHTML=
          '<input type="text" id="paste-comp-name" placeholder="대회명 입력" style="border:1px solid var(--border2);border-radius:7px;padding:5px 10px;font-size:13px;width:180px">' +
          '<div id="paste-tt-stage-wrap" style="display:none;align-items:center;gap:6px;flex-wrap:wrap">' +
            '<label style="font-size:12px;font-weight:700;color:var(--text2);white-space:nowrap">구분</label>' +
            '<select id="paste-tt-stage" style="border:1px solid var(--border2);border-radius:7px;padding:5px 10px;font-size:13px">' +
              '<option value="general">📝 일반</option>' +
              '<option value="league">📅 조별리그</option>' +
              '<option value="bkt">🏆 토너먼트</option>' +
            '</select>' +
          '</div>';
      }
      const hintEl = document.getElementById('paste-mode-hint');
      if(hintEl) hintEl.textContent='';
      const applyBtn = document.getElementById('paste-apply-btn');
      if(applyBtn) applyBtn.textContent='✅ 저장하기';
    };

    // tier-tour.js는 index.html에서 이미 로드됨. 여기서 다시 로드하면 전역 let 재선언으로 깨질 수 있어 로드 시도하지 않음.
    if (typeof window._grpPasteApplyLogic !== 'function' && typeof _grpPasteApplyLogic === 'function') {
      window._grpPasteApplyLogic = _grpPasteApplyLogic;
    }
    if (typeof window._grpPasteApplyLogic !== 'function') {
      alert('일괄 입력 저장 모듈이 로드되지 않았습니다.\n페이지 새로고침 후 다시 시도해주세요.');
      return;
    }

    const ok = window._grpPasteApplyLogic(savable);
    if (ok) {
      _closeGrpPaste();
      // pcbkt/pcbktbuild 모드는 applyLogic 내부에서 render()를 호출하지 않으므로 여기서 보장
      const _mode = (window._grpPasteState && window._grpPasteState.mode) || '';
      if (_mode === 'pcbkt' || _mode === 'pcbktbuild') {
        try{ render(); }catch(e){}
      }
    }
    return;
  }

  const mode = window._forcedPasteMode || document.getElementById('paste-mode')?.value || 'individual';
  const dateVal = document.getElementById('paste-date')?.value || new Date().toISOString().slice(0, 10);
  const compName = document.getElementById('paste-comp-name')?.value?.trim() || '';

  // (요청사항) YAML 블록 기반 대량입력은 삭제됨 (설정탭 규칙 기반으로 자동 분리 저장)

  if (mode === 'comp' && !compName) return alert('대회명을 입력하세요.');

  const savable = window._pasteResults.filter(r => r.wPlayer && r.lPlayer);
  if (!savable.length) return alert('저장 가능한 경기가 없습니다.');

  // 팀전(2:2 등) 라인은 1:1 전적 모드(개인전/끝장전/미니대전)에서 저장할 수 없음
  if (savable.some(r => r._isTeam) && ['individual','ind','gj','mini'].includes(mode)) {
    alert('⛔ 팀전(2:2) 자동인식 라인이 포함되어 있습니다.\n개인전/끝장전/미니대전 모드에서는 팀전 저장이 지원되지 않습니다.\n\n대학CK/티어대회/프로리그/대학대전/대회 모드로 저장해주세요.');
    return;
  }

  // ── (요청사항) 설정탭 규칙 기반 자동 분리 저장 ──
  // - 규칙: localStorage 'su_paste_route_rules'
  // - 형식(한 줄): /정규식/flags => 모드
  //   또는: 키워드 => 모드
  // - 모드 예: 개인전, 끝장전, 미니대전, 시빌워, 대학대전, 대학CK, 프로리그, 프로리그끝장전, 티어대회, 대회
  // - 동작: 메모/원문에서 규칙을 매칭하여 r._lineType에 저장하고, 기존 "혼합 타입" 저장 로직을 활용
  function _parsePasteRouteRules(){
    const raw = String(localStorage.getItem('su_paste_route_rules')||'').trim();
    if(!raw) return [];
    const out=[];
    raw.split(/\r?\n/).map(l=>l.trim()).filter(l=>l && !l.startsWith('#')).forEach(line=>{
      const parts = line.split('=>').map(s=>s.trim());
      if(parts.length<2) return;
      const pat = parts[0];
      const rhs = parts.slice(1).join('=>').trim();
      // rhs: "mode" 또는 "mode; key=val"
      const segs = rhs.split(';').map(s=>s.trim()).filter(Boolean);
      const modeStr = segs[0]||'';
      const opts={};
      segs.slice(1).forEach(s=>{
        const m=s.match(/^([a-zA-Z0-9_]+)\s*=\s*(.+)\s*$/);
        if(m) opts[m[1]] = m[2];
      });
      let rx=null, isRegex=false;
      const mrx = pat.match(/^\/(.+)\/([gimsuy]*)$/);
      if(mrx){
        try{ rx = new RegExp(mrx[1], mrx[2]||''); isRegex=true; }catch(e){ rx=null; }
      }
      out.push({ pat, rx, isRegex, modeStr, opts });
    });
    return out;
  }
  function _normRouteMode(s){
    const t=String(s||'').trim().toLowerCase();
    if(['ind','individual','개인전','개인전 기록'].includes(t)) return 'ind';
    if(['gj','끝장전','개인전 끝장전','개인전 끝장전 기록'].includes(t)) return 'gj';
    if(['mini','미니','미니대전','미니대전 기록'].includes(t)) return 'mini';
    if(['civil','시빌','시빌워','시빌워 기록'].includes(t)) return 'mini'; // mini.type=civil로 저장(혼합 저장에서 _miniType 사용)
    if(['univm','대학대전','대학대전 기록'].includes(t)) return 'univm';
    if(['ck','대학ck','대학ck 기록'].includes(t)) return 'ck';
    if(['pro','프로리그','프로리그 기록'].includes(t)) return 'pro';
    if(['progj','프로리그끝장전','프로리그 끝장전','프로리그 끝장전 기록'].includes(t)) return 'gj'; // pro flag는 옵션으로 확장
    if(['tt','티어대회','티어대회 일반','티어대회 일반 기록'].includes(t)) return 'tt';
    if(['comp','대회','대회 기록','조별리그','대회 조별리그'].includes(t)) return 'comp';
    return '';
  }
  const _routeRules = _parsePasteRouteRules();
  if(_routeRules.length){
    savable.forEach(r=>{
      const txt = String((r._lineMemo||'') + ' ' + (r.rawLine||'') + ' ' + (r.winName||'') + ' ' + (r.loseName||'')).trim();
      for(const rule of _routeRules){
        let matched=false;
        if(rule.rx){
          matched = rule.rx.test(txt);
        } else {
          matched = rule.pat && txt.toLowerCase().includes(String(rule.pat).toLowerCase());
        }
        if(!matched) continue;
        const nm = _normRouteMode(rule.modeStr);
        if(nm){
          r._lineType = nm; // 혼합 저장 트리거
          // 시빌워는 mini.type=civil로 저장하도록 표시
          if(String(rule.modeStr||'').includes('시빌') || String(rule.modeStr||'').toLowerCase()==='civil') r._miniType='civil';
          // (확장용) 강제 팀명/대회명 등은 추후 적용
        }
        break;
      }
    });
  }

  // 저장 예정 게임 목록(혼합 타입 포함) → 중복 확인
  const _toAdd = savable.map(r => ({
    mode: _normModeKey(r._lineType || mode),
    d: r._lineDate || dateVal,
    w: r.wPlayer?.name || '',
    l: r.lPlayer?.name || '',
    map: r.map || ''
  }));
  if (!_confirmDupBeforeSave(_toAdd)) return;

  const matchId = genId();

  // ── A팀/B팀 결정: 입력(좌/우) 순서를 최우선으로 고정 ──
  // (요청사항) 붙여넣기에서 "A팀 vs B팀"이 뒤집혀 인식되는 경우가 있어,
  // 로스터/소속 기반으로 A/B를 재배치하지 않고 "좌측= A / 우측= B"로 고정합니다.
  const resolveAB = (r) => {
    // (버그수정) r.leftName은 원문 그대로, r.winName은 이름 해석(부분명→정식명) 후
    // 값일 수 있어 단순 문자열 비교로는 좌/우 판정이 어긋날 수 있음.
    // 파싱 시점에 저장해둔 _leftIsWin(해석 전 원문 기준 판정)이 있으면 그것을 우선 사용.
    const leftIsWin = (typeof r._leftIsWin === 'boolean')
      ? r._leftIsWin
      : ((r.leftName||r.winName) === r.winName);
    return {
      playerA: leftIsWin ? r.wPlayer : r.lPlayer, // 좌측 선수
      playerB: leftIsWin ? r.lPlayer : r.wPlayer, // 우측 선수
      winner:  leftIsWin ? 'A' : 'B'
    };
  };

  // A팀/B팀 소속 대학 결정 (빈도 기반, 겹치지 않도록)
  const _univA = {}, _univB = {};
  savable.forEach(r => {
    const ab = resolveAB(r);
    const ua = ab.playerA?.univ||''; const ub = ab.playerB?.univ||'';
    if (ua && ua !== '무소속') _univA[ua] = (_univA[ua]||0)+1;
    if (ub && ub !== '무소속') _univB[ub] = (_univB[ub]||0)+1;
  });
  const _rA = Object.entries(_univA).sort((a,b)=>b[1]-a[1]);
  const _rB = Object.entries(_univB).sort((a,b)=>b[1]-a[1]);
  let finalTeamA = window._pasteForceTeamA || _rA[0]?.[0] || '';
  let finalTeamB = window._pasteForceTeamB || _rB[0]?.[0] || '';
  if (finalTeamA && finalTeamA === finalTeamB) {
    finalTeamB = _rB.find(([u])=>u!==finalTeamA)?.[0] || _rA.find(([u])=>u!==finalTeamA)?.[0] || '';
  }
  const univWins = {};
  savable.forEach(r => {
    const ab = resolveAB(r);
    const wu = ab.winner==='A' ? ab.playerA?.univ : ab.playerB?.univ;
    if (wu) univWins[wu] = (univWins[wu]||0)+1;
  });

  // ── setsSnap 구성 ──
  const setMap = {};
  savable.forEach(r => {
    const sn = r.setNum || 1;
    if (!setMap[sn]) setMap[sn] = [];
    setMap[sn].push(r);
  });

  // (요청사항) 외부 자동인식 메모를 기록에 저장
  const _joinMemos = (rows)=>{
    const uniq = [];
    (rows||[]).forEach(r=>{
      const m = String(r?._lineMemo||'').trim();
      if(m && !uniq.includes(m)) uniq.push(m);
    });
    return uniq.join(' / ');
  };
  const _matchMemo = _joinMemos(savable);

  const setsSnap = Object.keys(setMap).sort((a,b) => a-b).map(sn => {
    const rows = setMap[sn];
    const games = rows.map(r => {
      const ab = resolveAB(r);
      return {
        playerA: ab.playerA?.name||'',
        playerB: ab.playerB?.name||'',
        map: r.map && r.map !== '-' ? r.map : '',
        winner: ab.winner,
        ...(r._lineMemo ? { memo: r._lineMemo } : {}),
        ...(r._isTeam ? { _isTeam: true, teamA: r._teamLeft || null, teamB: r._teamRight || null } : {})
      };
    });
    const scoreA = games.filter(g=>g.winner==='A').length;
    const scoreB = games.filter(g=>g.winner==='B').length;
    return { scoreA, scoreB, winner: scoreA > scoreB ? 'A' : scoreB > scoreA ? 'B' : 'A', games };
  });

  // 경기방식: 'set'=세트제(세트 승리 수), 'game'=경기방식(총 게임 승리 수)
  const _matchMode = window._pasteMatchMode || 'game';
  const isMultiSet = Object.keys(setMap).length > 1;
  let sa, sb;

  if (_matchMode === 'set' || isMultiSet) {
    sa = setsSnap.filter(s => s.winner === 'A').length;
    sb = setsSnap.filter(s => s.winner === 'B').length;
  } else {
    sa = setsSnap.reduce((acc,s)=>acc+s.scoreA,0);
    sb = setsSnap.reduce((acc,s)=>acc+s.scoreB,0);
  }

  // 개인 전적 반영 (경기 시점 대학도 저장)
  // ind/gj는 dup 체크 후 반영해야 하므로 아래 모드별 섹션에서 처리
  const _gjProFlag = !!window._gjProPaste;
  const _pasteModeLabel=mode==='mini'?(window._miniPasteType==='civil'?'시빌워':'미니대전'):mode==='gj'?(_gjProFlag?'프로리그끝장전':'끝장전'):{univm:'대학대전',ck:'대학CK',pro:'프로리그',tt:'티어대회',comp:'조별리그',individual:'개인전',ind:'개인전'}[mode]||'';

  // ── 혼합 타입 모드: _lineType이 하나라도 있으면 타입별 분리 저장 ──
  const _hasMixedTypes = savable.some(r => r._lineType);
  if (_hasMixedTypes) {
    const _mixGroups = { mini: [], gj: [], ind: [] };
    savable.forEach(r => {
      const t = r._lineType || (mode === 'gj' ? 'gj' : mode === 'mini' ? 'mini' : 'ind');
      if (_mixGroups[t]) _mixGroups[t].push(r);
      else _mixGroups.ind.push(r);
    });
    const _normMap2 = s => resolveMapName((s||'').trim()) || (s||'').trim();
    // ind 저장
    if (_mixGroups.ind.length) {
      const _idDup = { count: 0, dup: [] };
      const _indDG = {};
      _mixGroups.ind.forEach(r => { const d=r._lineDate||dateVal; (_indDG[d]||(_indDG[d]=[])).push(r); });
      Object.entries(_indDG).sort(([a],[b])=>b.localeCompare(a)).forEach(([d,grp])=>{
        const sid=genId();
        const gameSet = new Set();
        const dedupedGrp = grp.filter(r => {
          const key = `${r.wPlayer.name}|${r.lPlayer.name}|${r.map||'-'}`;
          if (gameSet.has(key)) {
            _idDup.count++;
            _idDup.dup.push({ w: r.wPlayer.name, l: r.lPlayer.name, m: r.map });
            return false;
          }
          gameSet.add(key);
          return true;
        });
        dedupedGrp.forEach(r=>{r._id=genId();if(!r._isTeam)applyGameResult(r.wPlayer.name,r.lPlayer.name,d,r.map||'-',r._id,'','','개인전');});
        const games=dedupedGrp.map(r=>({_id:r._id,sid,d,wName:r.wPlayer.name,lName:r.lPlayer.name,map:r.map&&r.map!=='-'?r.map:'',...(r._lineMemo?{memo:r._lineMemo}:{})}));
        if(games.length) indM.unshift(...games);
      });
      if (_idDup.count > 0) alert(`개인전(혼합) 중복 ${_idDup.count}건 제거됨`);
    }
    // gj 저장
    if (_mixGroups.gj.length) {
      const _gjDG = {};
      _mixGroups.gj.forEach(r => { const d=r._lineDate||dateVal; (_gjDG[d]||(_gjDG[d]=[])).push(r); });
      Object.entries(_gjDG).sort(([a],[b])=>b.localeCompare(a)).forEach(([d,grp])=>{
        const sid=genId();
        // 중복 허용: 필터링 없이 전체 저장
        grp.forEach(r=>{r._id=genId();if(!r._isTeam)applyGameResult(r.wPlayer.name,r.lPlayer.name,d,r.map||'-',r._id,'','','끝장전');});
        const games=grp.map(r=>({_id:r._id,sid,d,wName:r.wPlayer.name,lName:r.lPlayer.name,map:r.map&&r.map!=='-'?r.map:'',...(r._lineMemo?{memo:r._lineMemo}:{})}));
        if(games.length) gjM.unshift(...games);
      });
    }
    // mini 저장 (시빌워 포함)
    if (_mixGroups.mini.length) {
      const _miniDG = {};
      _mixGroups.mini.forEach(r => { const d=r._lineDate||dateVal; (_miniDG[d]||(_miniDG[d]=[])).push(r); });
      Object.entries(_miniDG).sort(([a],[b])=>b.localeCompare(a)).forEach(([d,grp])=>{
        const sid=genId();
        const _isCivil = grp.some(r=>r._miniType==='civil');
        grp.forEach(r=>{r._id=genId();if(!r._isTeam)applyGameResult(r.wPlayer.name,r.lPlayer.name,d,r.map||'-',r._id,'','',_isCivil?'시빌워':'미니대전');});
        const games=grp.map(r=>({playerA:r.wPlayer?.name||'',playerB:r.lPlayer?.name||'',map:r.map&&r.map!=='-'?r.map:'',winner:'A',...(r._lineMemo?{memo:r._lineMemo}:{})}));
        const mm=_joinMemos(grp);
        miniM.unshift({_id:sid,d,a:'A팀',b:'B팀',sa:grp.filter(r=>true).length,sb:0,sets:[{scoreA:grp.length,scoreB:0,winner:'A',games}],type:_isCivil?'civil':'mini',...(mm?{memo:mm}:{})});
      });
    }
    save();
    const _tot = savable.length;
    const _iC=_mixGroups.ind.length, _gC=_mixGroups.gj.length, _mC=_mixGroups.mini.length;
    alert(`✅ 혼합 저장 완료\n개인전 ${_iC}건 / 끝장전 ${_gC}건 / 미니대전 ${_mC}건 (총 ${_tot}건)`);
    cm('pasteModal');
    // 외부탭(📎/외부2/외부3)에서 넘어온 경우: 저장 후 화면이 리셋(새로고침)되지 않게 render를 생략
    if(!_fromHistExt){
      render();
    }
    try{ window._pasteFromHistExt = false; }catch(e){}
    return;
  }

  if (mode !== 'ind' && mode !== 'gj') {
    // 팀 경기는 동기화 함수에서 처리하므로 저장 시 applyGameResult 호출 제거
    // savable.forEach(r => {
    //   const _ab = resolveAB(r);
    //   const _univW = _ab.winner==='A' ? (finalTeamA||_ab.playerA?.univ||'') : (finalTeamB||_ab.playerB?.univ||'');
    //   const _univL = _ab.winner==='A' ? (finalTeamB||_ab.playerB?.univ||'') : (finalTeamA||_ab.playerA?.univ||'');
    //   applyGameResult(r.wPlayer.name, r.lPlayer.name, dateVal, r.map || '-', matchId, _univW, _univL, _pasteModeLabel);
    // });
  }

  // 모드별 기록 추가
  if (mode === 'mini') {
    const _mType = window._miniPasteType || 'mini';
    let _a = finalTeamA || 'A팀';
    let _b = finalTeamB || (_mType === 'civil' ? 'B팀' : '?');
    if (_mType === 'civil' && (!_b || _a === _b)) { _a = 'A팀'; _b = 'B팀'; }
    miniM.unshift({ _id: matchId, d: dateVal, a: _a, b: _b, sa, sb, sets: setsSnap, type: _mType, ...(_matchMemo?{memo:_matchMemo}:{}) });
    // (추가) 팀전 게임은 개인 ELO/승패에도 반영
    if(typeof applyTeamGameResult==='function'){
      (setsSnap||[]).forEach((s,si)=>{ (s.games||[]).forEach((g,gi)=>{
        if(g._isTeam && Array.isArray(g.teamA) && Array.isArray(g.teamB)){
          const gid = `${matchId}_s${si}_g${gi}`;
          applyTeamGameResult(g.teamA, g.teamB, g.winner||'', dateVal, g.map||'-', gid, _mType==='civil'?'시빌워':'미니대전');
        }
      });});
    }
  } else if (mode === 'univm') {
    univM.unshift({ _id: matchId, d: dateVal, a: finalTeamA, b: finalTeamB, sa, sb, sets: setsSnap, ...(_matchMemo?{memo:_matchMemo}:{}) });
    if(typeof applyTeamGameResult==='function'){
      (setsSnap||[]).forEach((s,si)=>{ (s.games||[]).forEach((g,gi)=>{
        if(g._isTeam && Array.isArray(g.teamA) && Array.isArray(g.teamB)){
          const gid = `${matchId}_s${si}_g${gi}`;
          applyTeamGameResult(g.teamA, g.teamB, g.winner||'', dateVal, g.map||'-', gid, '대학대전');
        }
      });});
    }
  } else if (mode === 'pro') {
    // 프로리그: 좌측=A팀, 우측=B팀 고정 (승/패와 무관하게 입력 순서 유지)
    // (수정) 기존에는 wPlayer(승자)=A팀, lPlayer(패자)=B팀으로 고정되어 있어
    // 우측팀이 이기면 화면상 좌측(A팀)으로 뒤바뀌어 보이는 문제가 있었음.
    // → 다른 모드와 동일하게 resolveAB()로 좌/우 위치를 그대로 유지하도록 수정.
    const proSA = setsSnap.reduce((acc,s)=>acc+s.scoreA,0);
    const proSB = setsSnap.reduce((acc,s)=>acc+s.scoreB,0);
    const mA=[], mB=[];
    savable.forEach(r=>{
      if(r._isTeam) return;
      const ab = resolveAB(r);
      if(ab.playerA && !mA.find(x=>x.name===ab.playerA.name)) mA.push({name:ab.playerA.name,univ:ab.playerA.univ||'',race:ab.playerA.race||'',tier:ab.playerA.tier||''});
      if(ab.playerB && !mB.find(x=>x.name===ab.playerB.name)) mB.push({name:ab.playerB.name,univ:ab.playerB.univ||'',race:ab.playerB.race||'',tier:ab.playerB.tier||''});
    });
    proM.unshift({_id:matchId,d:dateVal,sa:proSA,sb:proSB,
      teamALabel:String(window._pasteForceTeamA||'').trim()||'A팀',teamBLabel:String(window._pasteForceTeamB||'').trim()||'B팀',teamAMembers:mA,teamBMembers:mB,sets:setsSnap,univWins:{},univLosses:{},...(_matchMemo?{memo:_matchMemo}:{})});
    if(typeof applyTeamGameResult==='function'){
      (setsSnap||[]).forEach((s,si)=>{ (s.games||[]).forEach((g,gi)=>{
        if(g._isTeam && Array.isArray(g.teamA) && Array.isArray(g.teamB)){
          const gid = `${matchId}_s${si}_g${gi}`;
          applyTeamGameResult(g.teamA, g.teamB, g.winner||'', dateVal, g.map||'-', gid, '프로리그');
        }
      });});
    }
  } else if (mode === 'ck') {
    // CK: 좌측=A팀, 우측=B팀 절대 고정 (resolveAB 우회)
    const ckAB = (r) => {
      const leftIsWin = (typeof r._leftIsWin === 'boolean')
        ? r._leftIsWin
        : (r.leftName ? (r.leftName === r.winName) : true);
      return {
        playerA: leftIsWin ? r.wPlayer : r.lPlayer,
        playerB: leftIsWin ? r.lPlayer : r.wPlayer,
        winner:  leftIsWin ? 'A' : 'B'
      };
    };
    const ckSetsSnap = Object.keys(setMap).sort((a,b)=>a-b).map(sn=>{
      const rows=setMap[sn];
      const games=rows.map(r=>{
        const ab=ckAB(r);
        return {
          playerA:ab.playerA?.name||'',
          playerB:ab.playerB?.name||'',
          map:r.map && r.map !== '-' ? r.map : '',
          winner:ab.winner,
          ...(r._lineMemo ? { memo: r._lineMemo } : {}),
          ...(r._isTeam ? { _isTeam:true, teamA:r._teamLeft||null, teamB:r._teamRight||null } : {})
        };
      });
      const scoreA=games.filter(g=>g.winner==='A').length;
      const scoreB=games.filter(g=>g.winner==='B').length;
      return {scoreA,scoreB,winner:scoreA>scoreB?'A':scoreB>scoreA?'B':'A',games};
    });
    const mA=[], mB=[];
    savable.forEach(r=>{
      if(r._isTeam) return;
      const ab=ckAB(r);
      if(ab.playerA && !mA.find(x=>x.name===ab.playerA.name)) mA.push({name:ab.playerA.name,univ:ab.playerA.univ||'',race:ab.playerA.race||'',tier:ab.playerA.tier||''});
      if(ab.playerB && !mB.find(x=>x.name===ab.playerB.name)) mB.push({name:ab.playerB.name,univ:ab.playerB.univ||'',race:ab.playerB.race||'',tier:ab.playerB.tier||''});
    });
    const ckSA=ckSetsSnap.filter(s=>s.winner==='A').length;
    const ckSB=ckSetsSnap.filter(s=>s.winner==='B').length;
    ckM.unshift({_id:matchId,d:dateVal,sa:ckSA,sb:ckSB,teamALabel:String(window._pasteForceTeamA||'').trim()||'A조',teamBLabel:String(window._pasteForceTeamB||'').trim()||'B조',teamAMembers:mA,teamBMembers:mB,sets:ckSetsSnap,univWins:{},univLosses:{},...(_matchMemo?{memo:_matchMemo}:{})});
    if(typeof applyTeamGameResult==='function'){
      (ckSetsSnap||[]).forEach((s,si)=>{ (s.games||[]).forEach((g,gi)=>{
        if(g._isTeam && Array.isArray(g.teamA) && Array.isArray(g.teamB)){
          const gid = `${matchId}_s${si}_g${gi}`;
          applyTeamGameResult(g.teamA, g.teamB, g.winner||'', dateVal, g.map||'-', gid, '대학CK');
        }
      });});
    }
  } else if (mode === 'comp') {
    if (compName && !compNames.includes(compName)) compNames.push(compName);
    curComp = compName;
    comps.unshift({ _id: matchId, d: dateVal, n: compName, a: finalTeamA||'', b: finalTeamB||'', sa, sb, sets: setsSnap, ...(_matchMemo?{memo:_matchMemo}:{}) });
    if(typeof applyTeamGameResult==='function'){
      (setsSnap||[]).forEach((s,si)=>{ (s.games||[]).forEach((g,gi)=>{
        if(g._isTeam && Array.isArray(g.teamA) && Array.isArray(g.teamB)){
          const gid = `${matchId}_s${si}_g${gi}`;
          applyTeamGameResult(g.teamA, g.teamB, g.winner||'', dateVal, g.map||'-', gid, '대회');
        }
      });});
    }
  } else if (mode === 'ind') {
    // _lineDate 있으면 날짜별 다른 sid로 분리 저장
    const _indDateGroups = {};
    savable.forEach(r => {
      const d = r._lineDate || dateVal;
      if (!_indDateGroups[d]) _indDateGroups[d] = [];
      _indDateGroups[d].push(r);
    });
    const _idDup = { count: 0, dup: [] };
    Object.entries(_indDateGroups).sort(([a],[b])=>b.localeCompare(a)).forEach(([d,group])=>{
      const indSid = genId();
      // (요청사항) 개인전 입력(자동인식)에서 "입력 내용 자체" 중복이 있으면
      // 중복 제거로 스킵하지 말고, 사용자에게 "그냥 등록/취소(중복 제거)" 선택을 제공
      const gameSet = new Set();
      const dupRows = [];
      group.forEach(r=>{
        const key = `${r.wPlayer.name}|${r.lPlayer.name}|${r.map||'-'}`;
        if(gameSet.has(key)) dupRows.push({ w:r.wPlayer.name, l:r.lPlayer.name, m:r.map||'' });
        else gameSet.add(key);
      });
      let dedupedGames = group;
      if(dupRows.length){
        // (호환) 템플릿 리터럴/중첩 backtick 없이 문자열 생성
        const sample = dupRows.slice(0,5).map(x=>{
          const mm = (x && x.m) ? String(x.m).trim() : '';
          return String(x.w||'') + ' vs ' + String(x.l||'') + (mm ? (' ('+mm+')') : '');
        }).join('\n');
        const extra = (dupRows.length>5) ? ('\n... 외 ' + (dupRows.length-5) + '건') : '';
        // (호환) 중첩 템플릿 리터럴/특수문자 파싱 이슈를 피하기 위해 문자열 결합 사용
        const okAll = confirm(
          '⚠️ 입력 내용에 중복 경기 ' + dupRows.length + '건이 있습니다.\n'
          + sample + extra
          + '\n\n그래도 중복 포함해서 모두 저장할까요?\n(확인=모두 저장 / 취소=중복 제거 후 저장)'
        );
        if(!okAll){
          // 기존 동작(중복 제거)
          const gameSet2 = new Set();
          dedupedGames = group.filter(r => {
            const key = `${r.wPlayer.name}|${r.lPlayer.name}|${r.map||'-'}`;
            if (gameSet2.has(key)) {
              _idDup.count++;
              _idDup.dup.push({ w: r.wPlayer.name, l: r.lPlayer.name, m: r.map });
              return false;
            }
            gameSet2.add(key);
            return true;
          });
        }
      }
      dedupedGames.forEach(r => {
        r._id = genId();
        if(!r._isTeam) applyGameResult(r.wPlayer.name, r.lPlayer.name, d, r.map || '-', r._id, '', '', _pasteModeLabel);
      });
      const games = dedupedGames.map(r => ({ _id: r._id, sid: indSid, d, wName: r.wPlayer.name, lName: r.lPlayer.name, map: r.map && r.map !== '-' ? r.map : '', ...(r._lineMemo ? { memo: r._lineMemo } : {}) }));
      if(games.length) indM.unshift(...games);
    });
    if (_idDup.count > 0){
      const list = (_idDup.dup||[]).map(x=>String(x.w||'')+' vs '+String(x.l||'')).join(', ');
      alert('개인전 중복 ' + _idDup.count + '건 제거됨 (중복: ' + list + ')');
    }
  } else if (mode === 'gj') {
    const _gjPro = !!window._gjProPaste;
    // _lineDate 있으면 날짜별 다른 sid로 분리 저장
    const _gjDateGroups = {};
    savable.forEach(r => {
      const d = r._lineDate || dateVal;
      if (!_gjDateGroups[d]) _gjDateGroups[d] = [];
      _gjDateGroups[d].push(r);
    });
    Object.entries(_gjDateGroups).sort(([a],[b])=>b.localeCompare(a)).forEach(([d,group])=>{
      const gjSid = genId();
      // 중복 허용: 필터링 없이 전체 저장
      group.forEach(r => {
        r._id = genId();
        if(!r._isTeam) applyGameResult(r.wPlayer.name, r.lPlayer.name, d, r.map || '-', r._id, '', '', _pasteModeLabel);
      });
      const games = group.map(r => ({ _id: r._id, sid: gjSid, d, wName: r.wPlayer.name, lName: r.lPlayer.name, map: r.map && r.map !== '-' ? r.map : '', ...(_gjPro?{_proLabel:true}:{}), ...(r._lineMemo ? { memo: r._lineMemo } : {}) }));
      if(games.length) gjM.unshift(...games);
    });
  } else if (mode === 'tt') {
    const ttAB = (r) => {
      const leftIsWin = (typeof r._leftIsWin === 'boolean')
        ? r._leftIsWin
        : (r.leftName ? (r.leftName === r.winName) : true);
      return { playerA: leftIsWin ? r.wPlayer : r.lPlayer, playerB: leftIsWin ? r.lPlayer : r.wPlayer, winner: leftIsWin ? 'A' : 'B' };
    };
    const ttSetsSnap = Object.keys(setMap).sort((a,b)=>a-b).map(sn=>{
      const rows=setMap[sn];
      const games=rows.map(r=>{
        const ab=ttAB(r);
        return {
          playerA:ab.playerA?.name||'',
          playerB:ab.playerB?.name||'',
          map:r.map && r.map !== '-' ? r.map : '',
          winner:ab.winner,
          ...(r._lineMemo ? { memo: r._lineMemo } : {}),
          ...(r._isTeam ? { _isTeam:true, teamA:r._teamLeft||null, teamB:r._teamRight||null } : {})
        };
      });
      const scoreA=games.filter(g=>g.winner==='A').length, scoreB=games.filter(g=>g.winner==='B').length;
      return {scoreA,scoreB,winner:scoreA>scoreB?'A':scoreB>scoreA?'B':'A',games};
    });
    const mA=[], mB=[];
    savable.forEach(r=>{ 
      if(r._isTeam) return;
      const ab=ttAB(r);
      if(ab.playerA&&!mA.find(x=>x.name===ab.playerA.name)) mA.push({name:ab.playerA.name,univ:ab.playerA.univ||'',race:ab.playerA.race||'',tier:ab.playerA.tier||''});
      if(ab.playerB&&!mB.find(x=>x.name===ab.playerB.name)) mB.push({name:ab.playerB.name,univ:ab.playerB.univ||'',race:ab.playerB.race||'',tier:ab.playerB.tier||''});
    });
    const ttSA=ttSetsSnap.filter(s=>s.winner==='A').length, ttSB=ttSetsSnap.filter(s=>s.winner==='B').length;
    // (요청사항) 외부 자동인식 → 티어대회 입력 시, 대회명이 비어도 자동 생성되게
    let _ttSaveComp=compName||(typeof _ttCurComp!=='undefined'?_ttCurComp:'')||'';
    if(!_ttSaveComp){
      _ttSaveComp = `티어대회 ${dateVal||new Date().toISOString().slice(0,10)}`;
    }
    try{
      if(typeof _ttCurComp!=='undefined') _ttCurComp = _ttSaveComp;
      localStorage.setItem('su_ttcur', _ttSaveComp);
    }catch(e){}

    // (요청사항) 티어대회 입력하면 tourneys(티어대회)도 자동 생성
    let _ttTn = null;
    try{
      if(typeof tourneys!=='undefined' && Array.isArray(tourneys)){
        _ttTn = tourneys.find(t=>t && t.type==='tier' && String(t.name||'').trim()===String(_ttSaveComp||'').trim()) || null;
        if(!_ttTn){
          const id = (typeof genId==='function') ? genId() : (Date.now()+'_'+Math.random().toString(16).slice(2));
          _ttTn = {id, name:String(_ttSaveComp||'').trim(), type:'tier', groups:[], createdAt:new Date().toISOString(), bracket:{slots:{},winners:{},champ:''}};
          tourneys.unshift(_ttTn);
        }
      }
    }catch(e){}
    // (요청사항) 티어대회: 일반/조별리그/토너먼트 구분 저장
    // - "대전기록-외부 자동인식"에서만 선택 가능
    // - 티어대회 토너먼트(🗂️) 탭에서 자동인식 버튼으로 열면 'bkt' 강제
    // - 그 외(티어대회탭 일반 자동인식)는 항상 'general'
    let _ttStage = 'general';
    try{
      if(_fromHistExt){
        _ttStage = (document.getElementById('paste-tt-stage')?.value || localStorage.getItem('su_tt_paste_stage') || 'general') + '';
      }else if(_fromTierBkt){
        _ttStage = 'bkt';
      }else{
        _ttStage = 'general';
      }
    }catch(e){ _ttStage='general'; }
    if(_ttStage==='grp') _ttStage='league';
    if(!['general','league','bkt'].includes(_ttStage)) _ttStage='general';

    // (요청사항) "토너먼트" 선택 + 외부 자동인식 데이터는 여러 매치를 한 번에 붙여넣는 경우가 많아서
    // 단일 경기(2명)일 때 a/b(표시용)를 채움 — 기록탭에서 "누가 vs 누가"가 보이도록
    const _uniqNames = (()=>{
      const s=new Set();
      (savable||[]).forEach(r=>{ if(r?.wPlayer?.name) s.add(r.wPlayer.name); if(r?.lPlayer?.name) s.add(r.lPlayer.name); });
      return Array.from(s);
    })();
    const _ttA = _uniqNames.length===2 ? _uniqNames[0] : 'A팀';
    const _ttB = _uniqNames.length===2 ? _uniqNames[1] : 'B팀';

    // - 서로 다른 선수 매치가 섞였을 때 1개 경기로 뭉쳐 저장되는 문제를 방지한다.
    // - 서로 다른 선수 매치가 섞였을 때 1개 경기로 뭉쳐 저장되는 문제를 방지한다.
    // - 우선: (선수A,선수B) 페어별로 그룹핑하여 여러 경기로 저장
    // - 추가: 동일 이름 페어가 현재 티어대회(tourneys) 브라켓 슬롯에 있으면 해당 matchDetails에 기록되게 시도
    const _normPairKey = (a,b)=>{
      const x=String(a||'').trim(), y=String(b||'').trim();
      return [x,y].sort((p,q)=>p.localeCompare(q,'ko')).join('||');
    };
    const _normNameForKey = (s)=>{
      let t = String(s||'').trim();
      if(!t) return '';
      // 이모지/기호 제거
      t = t.replace(/[✅❌⭕⬜🆚🌐⭐★■□●○◆◇]/g,'').trim();
      // 종족/설명 괄호 제거: "이름 (P)" / "이름(프로토스)" 등
      t = t.replace(/\s*\((?:[PTZN]|테란|저그|프로토스|토스|Terran|Zerg|Protoss)\)\s*$/i,'').trim();
      // 다중 공백 정리
      t = t.replace(/\s+/g,' ').trim();
      return t;
    };
    const _ttNameA = (r)=> _normNameForKey(r?.wPlayer?.name || r?.winName || '');
    const _ttNameB = (r)=> _normNameForKey(r?.lPlayer?.name || r?.loseName || '');

    const _ttGroups = {};
    savable.forEach(r=>{
      const aN=_ttNameA(r); const bN=_ttNameB(r);
      const key=_normPairKey(aN,bN);
      if(!_ttGroups[key]) _ttGroups[key]=[];
      _ttGroups[key].push(r);
    });
    const _pairKeys = Object.keys(_ttGroups);

    // (요청사항) 외부 자동인식 "티어대회 토너먼트"에서 대진표(브라켓) 자동 생성/반영 기능 삭제
    // - 토너먼트 기록(ttM.stage='bkt')만 저장하고, tourneys.bracket에는 손대지 않는다.
    const _disableAutoBracket = (_fromHistExt && _ttStage === 'bkt');

    // 브라켓 매칭(토너먼트 탭 반영)은 비활성화
    const _tn = (!_disableAutoBracket && _ttStage==='bkt') ? (_ttTn || null) : null;
    const _br = (_tn && typeof getBracket==='function') ? getBracket(_tn) : null;
    const _getSlotName = (rnd, mi, side)=>{
      if(!_br) return '';
      const k = `${rnd}-${mi}-${side}`;
      if(Object.prototype.hasOwnProperty.call(_br.slots||{}, k)) return String(_br.slots[k]||'');
      if(rnd<=0) return '';
      const pk = `${rnd-1}-${mi*2 + (side==='a'?0:1)}`;
      return String((_br.winners||{})[pk]||'');
    };
    // 라운드/매치 크기 계산(브라켓 overrideSize 사용)
    const _totalRounds = (()=>{
      if(!_tn) return 0;
      const ov = parseInt(_tn.bracketOverrideSize||'0',10)||0;
      const numTeams = ov>1 ? ov : 8; // fallback
      let r=0, n=numTeams;
      while(n>1){ n=Math.ceil(n/2); r++; }
      return r||1;
    })();
    const _findBktPosByPair = (p1,p2)=>{
      if(!_tn || !_br) return null;
      const a=String(p1||'').trim(), b=String(p2||'').trim();
      if(!a || !b) return null;
      for(let rnd=0; rnd<_totalRounds; rnd++){
        const ov = parseInt(_tn.bracketOverrideSize||'0',10)||0;
        const numTeams = ov>1 ? ov : 8;
        const matchCount = Math.ceil(numTeams/Math.pow(2,rnd+1));
        for(let mi=0; mi<matchCount; mi++){
          const ta=_getSlotName(rnd,mi,'a');
          const tb=_getSlotName(rnd,mi,'b');
          if(!ta || !tb) continue;
          if((ta===a && tb===b) || (ta===b && tb===a)) return {rnd,mi,ta,tb};
        }
      }
      return null;
    };

    // (삭제됨) 외부 자동인식 토너먼트 대진표 자동 생성/반영 + 브라켓 매칭 로직
    const _applyAsBktMatch = ()=>false;

    // 날짜별 묶음(요청): 서로 다른 날짜 라인이 섞이면 날짜별로 분리 저장
    // - 내부 입력에서도 라인에 날짜가 들어올 수 있어(_lineDate) 날짜 기준으로 분리
    const _dateOf = (r)=> String(r?._lineDate || dateVal || '').trim();
    const _dateGroups = {};
    (savable||[]).forEach(r=>{
      const d=_dateOf(r) || (dateVal||'');
      if(!_dateGroups[d]) _dateGroups[d]=[];
      _dateGroups[d].push(r);
    });
    const _dates = Object.keys(_dateGroups);

    // ─────────────────────────────────────────────
    // 중요: 티어대회 탭(내부)에서 붙여넣기/자동인식은
    // "여러 줄 = 1경기(팀 매치) 내 여러 게임/세트"인 경우가 대부분이라
    // 외부 자동인식처럼 (페어/날짜 기준)으로 쪼개면 안 된다.
    // → 외부에서 넘어온 경우(_fromHistExt)만 분리/대진표 로직을 적용한다.
    // ─────────────────────────────────────────────
    if(!_fromHistExt){
      const _mm = window._pasteMatchMode || 'game';
      const _isMultiSet = (ttSetsSnap||[]).length > 1;
      const _sa = (_mm==='set' || _isMultiSet) ? (ttSetsSnap||[]).filter(s=>s.winner==='A').length
        : (ttSetsSnap||[]).reduce((acc,s)=>acc+(s.scoreA||0),0);
      const _sb = (_mm==='set' || _isMultiSet) ? (ttSetsSnap||[]).filter(s=>s.winner==='B').length
        : (ttSetsSnap||[]).reduce((acc,s)=>acc+(s.scoreB||0),0);
      ttM.unshift({_id:matchId,d:dateVal,n:_ttSaveComp,compName:_ttSaveComp,
        sa:_sa,sb:_sb,teamALabel:String(window._pasteForceTeamA||'').trim()||'A팀',teamBLabel:String(window._pasteForceTeamB||'').trim()||'B팀',
        teamAMembers:mA,teamBMembers:mB,sets:ttSetsSnap,univWins:{},univLosses:{},stage:'general',...(_matchMemo?{memo:_matchMemo}:{})});
      // 팀전 형태(_isTeam)가 있을 때만 반영
      if(typeof applyTeamGameResult==='function'){
        (ttSetsSnap||[]).forEach((s,si)=>{ (s.games||[]).forEach((g,gi)=>{
          if(g._isTeam && Array.isArray(g.teamA) && Array.isArray(g.teamB)){
            const gid = `${matchId}_s${si}_g${gi}`;
            applyTeamGameResult(g.teamA, g.teamB, g.winner||'', dateVal, g.map||'-', gid, '티어대회');
          }
        });});
      }
    }
    else if(_ttStage==='bkt' && _pairKeys.length>1){
      // 여러 페어면 각각 기록 (대진표/브라켓 반영은 하지 않음)
      _pairKeys.forEach((k,idx)=>{
        const rows=_ttGroups[k]||[];
        const names=k.split('||'); const p1=names[0]||''; const p2=names[1]||'';
        // ttM에 개별 경기로 저장(최소한 "1개로 뭉침" 방지)
        const mid = genId();
        const mm = _joinMemos(rows);
        // 1세트로 저장
        const set = {games:[]};
        rows.forEach(r=>{
          const wn=r.wPlayer?.name||''; const ln=r.lPlayer?.name||'';
          if(!wn || !ln) return;
          // p1을 A로 고정
          const winner = (wn===p1)?'A':(wn===p2)?'B':'A';
          set.games.push({playerA:p1, playerB:p2, winner, map:r.map||'', ...(r._lineMemo?{memo:r._lineMemo}:{})});
        });
        let sA=0,sB=0; (set.games||[]).forEach(g=>{if(g.winner==='A')sA++;else if(g.winner==='B')sB++;});
        set.scoreA=sA; set.scoreB=sB; set.winner=sA>sB?'A':sB>sA?'B':'';
        const rec={_id:mid,d:dateVal,n:_ttSaveComp,compName:_ttSaveComp,a:p1,b:p2,teamALabel:p1,teamBLabel:p2,sets:[set],sa:sA,sb:sB,stage:'bkt', ...(mm?{memo:mm}:{})};
        ttM.unshift(rec);
      });
    } else if (_pairKeys.length>1) {
      // (요청 반영) 일반탭은 "날짜별 묶음"을 우선한다.
      // - 같은 날짜 안에서는 매치가 여러 개라도 1개 기록으로 합치되,
      //   '누가 vs 누가' 표시는 비우고 sets.games에 라인 단위로 누적한다.
      // - 날짜가 여러 개면 날짜별로 여러 기록 생성
      _dates.forEach(d=>{
        const rows = _dateGroups[d] || [];
        const mid = genId();
        const mm = _joinMemos(rows);
        const set = {games:[]};
        rows.forEach(r=>{
          const p1=_ttNameA(r), p2=_ttNameB(r);
          if(!p1 || !p2) return;
          // winner: winName 기준으로 A/B 판정
          const win = _normNameForKey(r?.winName || r?.wPlayer?.name || '');
          const winner = (win===p1) ? 'A' : (win===p2 ? 'B' : 'A');
          set.games.push({playerA:p1, playerB:p2, winner, map:r.map||'', ...(r._lineMemo?{memo:r._lineMemo}:{})});
        });
        let sA=0,sB=0; (set.games||[]).forEach(g=>{if(g.winner==='A')sA++;else if(g.winner==='B')sB++;});
        set.scoreA=sA; set.scoreB=sB; set.winner=sA>sB?'A':sB>sA?'B':'';
        const rec={_id:mid,d:d||dateVal,n:_ttSaveComp,compName:_ttSaveComp,a:'',b:'',teamALabel:'',teamBLabel:'',sets:[set],sa:sA,sb:sB,stage:_ttStage, ...(mm?{memo:mm}:{})};
        ttM.unshift(rec);
      });
    } else {
      // 단일 페어: 기존 방식 유지(한 경기 저장)
      ttM.unshift({_id:matchId,d:dateVal,n:_ttSaveComp,compName:_ttSaveComp,
        a:_ttA,b:_ttB,teamALabel:_ttA,teamBLabel:_ttB,
        sa:ttSA,sb:ttSB,teamAMembers:mA,teamBMembers:mB,sets:ttSetsSnap,univWins:{},univLosses:{},stage:_ttStage,...(_matchMemo?{memo:_matchMemo}:{})});
      if(typeof applyTeamGameResult==='function'){
        (ttSetsSnap||[]).forEach((s,si)=>{ (s.games||[]).forEach((g,gi)=>{
          if(g._isTeam && Array.isArray(g.teamA) && Array.isArray(g.teamB)){
            const gid = `${matchId}_s${si}_g${gi}`;
            applyTeamGameResult(g.teamA, g.teamB, g.winner||'', dateVal, g.map||'-', gid, '티어대회');
          }
        });});
      }
    }
  }
  // individual: 개인 전적만 (이미 applyGameResult 처리됨)

  if (typeof fixPoints === 'function') fixPoints();
  save();
  if(!_fromHistExt){
    render();
  }

  // 모달 닫고 완료 알림
  cm('pasteModal');
  window._pasteResults = null;
  window._pasteErrors  = null;

  // 저장 형식에 따라 해당 탭으로 자동 이동
  if(!_fromHistExt){
    // ✅ 수정: gj 모드는 _gjProPaste 플래그에 따라 이동 대상 탭을 분기
    // - _gjProPaste=true: 프로리그 탭(_mergedProSub='gj')으로 이동 → sw('pro') 호출 전 서브탭 설정
    // - _gjProPaste=false: 개인전 탭(_mergedIndSub='gj')으로 이동 → sw('gj') 호출
    if (mode === 'gj') {
      if (!!window._gjProPaste) {
        // 프로리그 끝장전 저장 후 → 프로리그 탭의 끝장전 서브탭으로 이동
        try{ if(typeof window._mergedProSub !== 'undefined') window._mergedProSub = 'gj'; }catch(e){}
        try{ if(typeof window.gjSub !== 'undefined') window.gjSub = 'records'; }catch(e){}
        if(typeof window._goTopTab === 'function') window._goTopTab('pro');
      } else {
        // 일반 끝장전 저장 후 → 개인전 탭의 끝장전 서브탭으로 이동
        if(typeof window._goTopTab === 'function') window._goTopTab('gj');
      }
    } else {
      const tabMap = { mini:'mini', univm:'univm', pro:'pro', comp:'comp', ck:'univck', ind:'ind' };
      if (tabMap[mode]) {
        if(typeof window._goTopTab === 'function') window._goTopTab(tabMap[mode]);
      }
    }
  }
  try{ window._pasteFromHistExt = false; }catch(e){}
  try{ window._pasteFromTierBkt = false; }catch(e){}

  // 성공 토스트
  const modeLabel = { individual:'개인 전적', mini:'미니대전', univm:'대학대전', pro:'프로리그', comp:'대회' }[mode] || '';
  const toast = document.createElement('div');
  toast.textContent = `✅ ${savable.length}건 저장 완료${modeLabel ? ' → ' + modeLabel : ''}!`;
  toast.style.cssText = 'position:fixed;bottom:32px;left:50%;transform:translateX(-50%);background:#16a34a;color:#fff;padding:12px 24px;border-radius:10px;font-weight:700;font-size:14px;z-index:99999;box-shadow:0 4px 20px rgba(0,0,0,.2)';
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2800);
}

