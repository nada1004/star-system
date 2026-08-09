/* ══════════════════════════════════════════════════════════════
   검색 - 프로리그 이름수정/팀명교체/적용 (search-pro-paste.js 에서 분리, 2026-07-30)
   ══════════════════════════════════════════════════════════════ */

function proEditName(input, idx, role) {
  const name = input.value.trim();
  if (!name || !window._proPasteResults) return;
  const m = _proPasteResolvePlayer(name);
  const r = window._proPasteResults[idx];
  if (!r) return;
  const origName = role==='w' ? r.winName : r.loseName;
  if (role==='w') {
    r.wPlayer = m.player; r.winName = m.name || name;
    r.wCandidates = m.candidates; r.wSimilar = m.similar||[];
  } else {
    r.lPlayer = m.player; r.loseName = m.name || name;
    r.lCandidates = m.candidates; r.lSimilar = m.similar||[];
  }
  // 별명 자동 저장: 직접 입력해서 매칭에 성공한 경우, 다음부터 자동 인식되도록 등록
  _proAutoSaveAlias(origName, m.player);
  renderProPreview(window._proPasteResults);
}

// 붙여넣기 화면에서 사용자가 직접 입력/선택해 매칭에 성공한 별명을
// 선수 메모에 등록해서 다음 붙여넣기부터 자동 인식되게 함
function _proAutoSaveAlias(origName, player) {
  if (!origName || !player || origName === player.name) return;
  try {
    const memos = (player.memo||'').split(/[\s,\n]+/).map(s=>s.trim()).filter(Boolean);
    if (memos.includes(origName)) return;
    player.memo = memos.length ? player.memo + ' ' + origName : origName;
    save();
    const toast = document.createElement('div');
    toast.textContent = `✅ "${origName}" → "${player.name}" 자동 인식 등록됨`;
    Object.assign(toast.style, {position:'fixed',bottom:'76px',left:'50%',transform:'translateX(-50%)',background:'#1e3a8a',color:'#fff',padding:'9px 18px',borderRadius:'20px',fontSize:'13px',fontWeight:'600',zIndex:'99999',opacity:'0',transition:'opacity .25s',whiteSpace:'nowrap'});
    document.body.appendChild(toast);
    requestAnimationFrame(()=>{ toast.style.opacity='1'; });
    setTimeout(()=>{ toast.style.opacity='0'; setTimeout(()=>toast.remove(),300); },2800);
  } catch(e) {}
}

function proEditTeamName(input, idx, sideKey, slot) {
  if (!window._proPasteResults) return;
  const r = window._proPasteResults[idx];
  if (!r || !r.isTeam) return;
  const name = (input?.value || '').trim();
  const origName = sideKey === 'L' ? (r.leftNames?.[slot] || '') : (r.rightNames?.[slot] || '');
  const m = name ? _proPasteResolvePlayer(name) : { name: '', player: null, candidates: [], similar: [] };
  _proAutoSaveAlias(origName, m.player);
  if (sideKey === 'L') {
    if (!Array.isArray(r.leftNames)) r.leftNames = ['', ''];
    if (!Array.isArray(r.leftPlayers)) r.leftPlayers = [null, null];
    if (!Array.isArray(r.leftMeta)) r.leftMeta = [null, null];
    r.leftNames[slot] = m.name || name;
    r.leftPlayers[slot] = m.player;
    r.leftMeta[slot] = m;
  } else {
    if (!Array.isArray(r.rightNames)) r.rightNames = ['', ''];
    if (!Array.isArray(r.rightPlayers)) r.rightPlayers = [null, null];
    if (!Array.isArray(r.rightMeta)) r.rightMeta = [null, null];
    r.rightNames[slot] = m.name || name;
    r.rightPlayers[slot] = m.player;
    r.rightMeta[slot] = m;
  }
  const ln0 = (r.leftNames?.[0]||'').trim();
  const ln1 = (r.leftNames?.[1]||'').trim();
  const rn0 = (r.rightNames?.[0]||'').trim();
  const rn1 = (r.rightNames?.[1]||'').trim();
  r.leftName = ln0 && ln1 ? `${ln0}, ${ln1}` : (ln0 || ln1 || '');
  r.rightName = rn0 && rn1 ? `${rn0}, ${rn1}` : (rn0 || rn1 || '');
  r.winName = r.winnerSide === 'L' ? r.leftName : r.rightName;
  r.loseName = r.winnerSide === 'L' ? r.rightName : r.leftName;
  renderProPreview(window._proPasteResults);
}

function swapProTeams() {
  if (!window._proPasteResults) return;
  // 팀명 입력칸도 함께 교체
  const _tmpTeamName = window._proForceTeamA;
  window._proForceTeamA = window._proForceTeamB;
  window._proForceTeamB = _tmpTeamName;
  const tlA = document.getElementById('pro-paste-team-a');
  const tlB = document.getElementById('pro-paste-team-b');
  if (tlA) tlA.value = window._proForceTeamA || '';
  if (tlB) tlB.value = window._proForceTeamB || '';
  window._proPasteResults = window._proPasteResults.map(r => {
    if (r?.isTeam) {
      const leftNames = r.leftNames || ['', ''];
      const rightNames = r.rightNames || ['', ''];
      const leftPlayers = r.leftPlayers || [null, null];
      const rightPlayers = r.rightPlayers || [null, null];
      const leftMeta = r.leftMeta || [null, null];
      const rightMeta = r.rightMeta || [null, null];
      const winnerSide = r.winnerSide === 'L' ? 'R' : 'L';
      const ln0 = (rightNames?.[0]||'').trim();
      const ln1 = (rightNames?.[1]||'').trim();
      const rn0 = (leftNames?.[0]||'').trim();
      const rn1 = (leftNames?.[1]||'').trim();
      const leftName = ln0 && ln1 ? `${ln0}, ${ln1}` : (ln0 || ln1 || '');
      const rightName = rn0 && rn1 ? `${rn0}, ${rn1}` : (rn0 || rn1 || '');
      return {
        ...r,
        leftNames: rightNames,
        rightNames: leftNames,
        leftPlayers: rightPlayers,
        rightPlayers: leftPlayers,
        leftMeta: rightMeta,
        rightMeta: leftMeta,
        winnerSide,
        leftName,
        rightName,
        winName: winnerSide === 'L' ? leftName : rightName,
        loseName: winnerSide === 'L' ? rightName : leftName,
      };
    }
    return {
      ...r,
      winName: r.loseName, loseName: r.winName,
      wPlayer: r.lPlayer, lPlayer: r.wPlayer,
      wCandidates: r.lCandidates||[], lCandidates: r.wCandidates||[],
      wSimilar: r.lSimilar||[], lSimilar: r.wSimilar||[],
    };
  });
  renderProPreview(window._proPasteResults);
}

function proApply() {
  if (!isLoggedIn) return alert('로그인이 필요합니다.');
  if (!window._proPasteResults) return;
  const _proCompName = (document.getElementById('pro-paste-comp-name')?.value || '').trim();
  const isSavableRow = (r) => {
    if (r?.isTeam) {
      const lp = Array.isArray(r.leftPlayers) ? r.leftPlayers : [];
      const rp = Array.isArray(r.rightPlayers) ? r.rightPlayers : [];
      return lp.length === 2 && rp.length === 2 && lp.every(Boolean) && rp.every(Boolean) && (r.winnerSide === 'L' || r.winnerSide === 'R');
    }
    return !!(r?.wPlayer && r?.lPlayer);
  };
  const savable = window._proPasteResults.filter(isSavableRow);
  if (!savable.length) return alert('저장 가능한 경기가 없습니다.');
  const defaultDate = document.getElementById('pro-paste-date')?.value || new Date().toISOString().slice(0,10);
  const mode = window._proPasteMode || 'game';
  const fmt = window._proFormat || 0;

  // (요청사항) 프로리그 자동인식 저장 전 중복 확인
  const _toAdd = savable.map(r => {
    const d = (window._proMatchDates||{})[(r.matchGroup||0)] || defaultDate;
    const leftN = r.leftName || r.winName;
    const rightN = r.rightName || r.loseName;
    const isLeftWinner = r.isTeam ? (r.winnerSide === 'L') : (leftN === r.winName);
    const w = isLeftWinner ? leftN : rightN;
    const l = isLeftWinner ? rightN : leftN;
    return { mode:'pro', d, w, l, map: r.map || '' };
  });
  if (!_confirmDupBeforeSave(_toAdd)) return;

  // A조/B조 판별 헬퍼
  const resolveTeam = (r) => {
    if (r?.isTeam) {
      const aPlayers = Array.isArray(r.leftPlayers) ? r.leftPlayers : [null, null];
      const bPlayers = Array.isArray(r.rightPlayers) ? r.rightPlayers : [null, null];
      const winner = r.winnerSide === 'L' ? 'A' : 'B';
      return { isTeam: true, aPlayers, bPlayers, winner };
    }
    const leftN = r.leftName || r.winName;
    const rightN = r.rightName || r.loseName;
    const leftPlayerObj = players.find(p => p.name === leftN) || r.wPlayer;
    const rightPlayerObj = players.find(p => p.name === rightN) || r.lPlayer;
    const playerA = leftPlayerObj || r.wPlayer;
    const playerB = rightPlayerObj || r.lPlayer;
    const isLeftWinner = (leftN === r.winName);
    return { playerA, playerB, winner: isLeftWinner ? 'A' : 'B' };
  };

  // matchGroup별로 그룹핑
  const matchGroupNums = [...new Set(savable.map(r => r.matchGroup||0))].sort((a,b)=>a-b);
  let totalSaved = 0;

  matchGroupNums.forEach(mg => {
    const groupRows = savable.filter(r => (r.matchGroup||0) === mg);
    if (!groupRows.length) return;
    const matchId = genId();
    const dateVal = (window._proMatchDates||{})[mg] || defaultDate;

    // setsSnap 구성
    const setMap2 = {};
    groupRows.forEach(r => {
      const sn = r.setNum||1;
      if(!setMap2[sn]) setMap2[sn]=[];
      setMap2[sn].push(r);
    });
    const setsSnap = Object.keys(setMap2).sort((a,b)=>a-b).map(sn => {
      const rows = setMap2[sn];
      const games = rows.map(r => {
        const t = resolveTeam(r);
        if (t.isTeam) {
          const a1 = t.aPlayers?.[0]?.name || '';
          const a2 = t.aPlayers?.[1]?.name || '';
          const b1 = t.bPlayers?.[0]?.name || '';
          const b2 = t.bPlayers?.[1]?.name || '';
          return {
            _isTeam: true,
            a1, a2, b1, b2,
            playerA: [a1, a2].filter(Boolean).join(','),
            playerB: [b1, b2].filter(Boolean).join(','),
            map: r.map||'-',
            winner: t.winner
          };
        }
        return { playerA: t.playerA.name, playerB: t.playerB.name, map: r.map||'-', winner: t.winner };
      });
      const scoreA = games.filter(g=>g.winner==='A').length;
      const scoreB = games.filter(g=>g.winner==='B').length;
      const setWinner = scoreA > scoreB ? 'A' : scoreB > scoreA ? 'B' : 'A';
      return { scoreA, scoreB, winner: setWinner, games };
    });

    // 경기방식 스코어
    const isMultiSet = Object.keys(setMap2).length > 1;
    let sa, sb;
    if (mode==='set' || isMultiSet) {
      sa = setsSnap.filter(s=>s.winner==='A').length;
      sb = setsSnap.filter(s=>s.winner==='B').length;
    } else {
      sa = setsSnap.reduce((s,st)=>s+st.scoreA,0);
      sb = setsSnap.reduce((s,st)=>s+st.scoreB,0);
    }

    // A조/B조 멤버 목록
    const mA=[], mB=[];
    groupRows.forEach(r => {
      const t = resolveTeam(r);
      if (t.isTeam) {
        (t.aPlayers||[]).forEach(p => {
          if (!p) return;
          if(!mA.find(x=>x.name===p.name)) mA.push({name:p.name,univ:p.univ||'',race:p.race||'',tier:p.tier||''});
        });
        (t.bPlayers||[]).forEach(p => {
          if (!p) return;
          if(!mB.find(x=>x.name===p.name)) mB.push({name:p.name,univ:p.univ||'',race:p.race||'',tier:p.tier||''});
        });
      } else {
        if(!mA.find(x=>x.name===t.playerA.name)) mA.push({name:t.playerA.name,univ:t.playerA.univ||'',race:t.playerA.race||'',tier:t.playerA.tier||''});
        if(!mB.find(x=>x.name===t.playerB.name)) mB.push({name:t.playerB.name,univ:t.playerB.univ||'',race:t.playerB.race||'',tier:t.playerB.tier||''});
      }
    });

    proM.unshift({_id:matchId, d:dateVal, sa, sb,
      teamALabel:String(window._proForceTeamA||'').trim()||'A팀',
      teamBLabel:String(window._proForceTeamB||'').trim()||'B팀',
      teamAMembers:mA, teamBMembers:mB,
      sets:setsSnap, univWins:{}, univLosses:{},
      scoreMode: (mode==='set' || isMultiSet) ? 'set' : 'game',
      ...(_proCompName ? {n:_proCompName} : {}),
      ...(fmt > 0 ? {fmt} : {})
    });
    totalSaved += groupRows.length;
  });

  if (typeof fixPoints==='function') fixPoints();
  save();
  if (typeof syncProM==='function') syncProM();
  render();
  closeProPasteModal();

  // 프로리그 탭으로 이동
  if(typeof window._goTopTab === 'function') window._goTopTab('pro');

  // 성공 토스트
  const matchCount = matchGroupNums.length;
  const toast = document.createElement('div');
  toast.textContent = matchCount > 1
    ? `✅ ${matchCount}경기 (${totalSaved}게임) 프로리그 저장 완료!`
    : `✅ ${totalSaved}건 프로리그 저장 완료!`;
  toast.style.cssText = 'position:fixed;bottom:32px;left:50%;transform:translateX(-50%);background:#7c3aed;color:#fff;padding:12px 24px;border-radius:var(--r);font-weight:700;font-size:14px;z-index:99999;box-shadow:0 4px 20px rgba(0,0,0,.2)';
  document.body.appendChild(toast);
  setTimeout(()=>toast.remove(), 2800);
}
