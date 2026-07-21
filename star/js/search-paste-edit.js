function pasteFlipResult(idx) {
  if (!window._pasteResults || !window._pasteResults[idx]) return;
  const r = window._pasteResults[idx];
  // 승자↔패자 전체 스왑
  [r.winName,  r.loseName]  = [r.loseName,  r.winName];
  [r.wPlayer,  r.lPlayer]   = [r.lPlayer,   r.wPlayer];
  [r.wCandidates, r.lCandidates] = [r.lCandidates, r.wCandidates];
  // 팀전이면 팀 배열도 함께 스왑 (left/right는 그대로 유지)
  if (r._isTeam) {
    [r._teamWin, r._teamLose] = [r._teamLose, r._teamWin];
  }
  renderPastePreview(window._pasteResults, window._pasteErrors || []);
}

// ── 맵 직접 변경 ──
function pasteChangeMap(idx, mapVal) {
  if (!window._pasteResults || !window._pasteResults[idx]) return;
  const r = window._pasteResults[idx];
  r.map = mapVal || '-';
  // 원래 입력한 이름과 선택된 맵이 다르면 alias로 저장 (자동 기억)
  const rawName = (r._rawMapStr||'').trim();
  if(rawName && mapVal && mapVal !== '-' && rawName !== mapVal) {
    if(!userMapAlias) userMapAlias = {};
    if(!userMapAlias[rawName]) {
      userMapAlias[rawName] = mapVal;
      save(); // 자동 저장
    }
  }
  renderPastePreview(window._pasteResults, window._pasteErrors || []);
}

// ── 세트 번호 변경 ──
function pasteChangeSet(idx, setNum) {
  if (!window._pasteResults || !window._pasteResults[idx]) return;
  window._pasteResults[idx].setNum = setNum;
  renderPastePreview(window._pasteResults, window._pasteErrors || []);
}

// ── 행 삭제 ──
function pasteDeleteRow(idx) {
  if (!window._pasteResults) return;
  window._pasteResults.splice(idx, 1);
  renderPastePreview(window._pasteResults, window._pasteErrors || []);
}

// ── 미등록 선수 즉시 등록 ──
function pasteQuickRegister(idx, role, name) {
  if (!isLoggedIn) return alert('로그인이 필요합니다.');

  // 간단 입력 폼 모달 (인라인 생성)
  const allUnivs = getAllUnivs().filter(u => !u.dissolved).map(u => `<option value="${u.name}">${u.name}</option>`).join('');
  const tierOpts = TIERS.map(t => `<option value="${t}">${t}</option>`).join('');

  const overlay = document.createElement('div');
  overlay.className = 'modal-compact-overlay';
  overlay.innerHTML = `
    <div class="modal-compact-box" style="width:320px;font-family:'Noto Sans KR',sans-serif">
      <div style="font-weight:900;font-size:var(--fs-md);margin-bottom:12px;color:#1a202c">👤 선수 즉시 등록</div>
      <div style="display:flex;flex-direction:column;gap:10px;font-size:var(--fs-base)">
        <div><label style="font-size:var(--fs-caption);font-weight:700;color:#2563eb;display:block;margin-bottom:3px">이름</label>
          <input id="qreg-name" value="${name.replace(/"/g,'&quot;')}" style="width:100%;padding:7px 10px;border:1px solid #cdd3dc;border-radius:7px;font-size:var(--fs-base);box-sizing:border-box"></div>
        <div><label style="font-size:var(--fs-caption);font-weight:700;color:#2563eb;display:block;margin-bottom:3px">대학</label>
          <select id="qreg-univ" style="width:100%;padding:7px 10px;border:1px solid #cdd3dc;border-radius:7px;font-size:var(--fs-base)"><option value="">선택 안함</option>${allUnivs}</select></div>
        <div style="display:flex;gap:8px">
          <div style="flex:1"><label style="font-size:var(--fs-caption);font-weight:700;color:#2563eb;display:block;margin-bottom:3px">티어</label>
            <select id="qreg-tier" style="width:100%;padding:7px 6px;border:1px solid #cdd3dc;border-radius:7px;font-size:var(--fs-sm)">${tierOpts}</select></div>
          <div style="flex:1"><label style="font-size:var(--fs-caption);font-weight:700;color:#2563eb;display:block;margin-bottom:3px">종족</label>
            <select id="qreg-race" style="width:100%;padding:7px 6px;border:1px solid #cdd3dc;border-radius:7px;font-size:var(--fs-sm)">
              <option value="T">테란</option><option value="Z">저그</option><option value="P">프로토스</option></select></div>
        </div>
      </div>
      <div style="display:flex;gap:8px;margin-top:12px;justify-content:flex-end">
        <button id="qreg-cancel" style="padding:7px 16px;border-radius:7px;border:1px solid #cdd3dc;background:#f7f9fc;font-size:var(--fs-base);font-weight:600;cursor:pointer">취소</button>
        <button id="qreg-ok" style="padding:7px 16px;border-radius:7px;border:none;background:#2563eb;color:#fff;font-size:var(--fs-base);font-weight:700;cursor:pointer">등록하기</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);
  document.getElementById('qreg-cancel').onclick = () => overlay.remove();
  overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
  document.getElementById('qreg-ok').onclick = () => {
    const newName = document.getElementById('qreg-name').value.trim();
    if (!newName) return alert('이름을 입력하세요.');
    if (players.find(p => p.name === newName)) return alert('이미 등록된 선수입니다.');
    const newPlayer = {
      name: newName,
      univ: document.getElementById('qreg-univ').value,
      tier: document.getElementById('qreg-tier').value,
      race: document.getElementById('qreg-race').value,
      gender: 'M', win: 0, loss: 0, points: 0, history: []
    };
    players.push(newPlayer);
    save();
    overlay.remove();
    // 등록한 선수를 해당 행에 자동 반영
    if (window._pasteResults && window._pasteResults[idx]) {
      const r = window._pasteResults[idx];
      if (role === 'w') {
        r.winName = newPlayer.name; r.wPlayer = newPlayer; r.wCandidates = [newPlayer];
      } else {
        r.loseName = newPlayer.name; r.lPlayer = newPlayer; r.lCandidates = [newPlayer];
      }
    }
    renderPastePreview(window._pasteResults, window._pasteErrors || []);
  };
}

// 중복 선수 선택 — 재파싱 없이 렌더링만 갱신
function pasteSelectPlayer(idx, role, name) {
  if (!window._pasteResults || !window._pasteResults[idx]) return;
  const r = window._pasteResults[idx];
  const p = players.find(pl => pl.name === name);
  if (!p) return;

  // ── 선택 시 → 메모에 별칭 자동 저장 (다음번 자동 인식) ──
  // 유사이름(혹시:) 선택뿐 아니라 후보 목록에서 선택할 때도 저장
  const originalName = (role === 'w' ? r.winName : r.loseName) || '';
  const shouldSaveAlias = originalName && originalName !== p.name;

  if (shouldSaveAlias) {
    const alias = originalName.trim();
    if (alias && alias !== p.name) {
      const existingMemo = (p.memo || '').trim();
      const memoTokens = existingMemo ? existingMemo.split(/[\s,\n]+/).map(s=>s.trim()).filter(Boolean) : [];
      if (!memoTokens.includes(alias)) {
        p.memo = memoTokens.length ? existingMemo + ' ' + alias : alias;
        save();
        // 토스트 안내
        (function(){
          const t = document.createElement('div');
          t.textContent = '✅ "' + alias + '" → "' + p.name + '" 자동 인식 등록됨';
          Object.assign(t.style, {
            position:'fixed', bottom:'76px', left:'50%', transform:'translateX(-50%)',
            background:'#1e3a8a', color:'#fff', padding:'9px 18px', borderRadius:'20px',
            fontSize:'13px', fontWeight:'600', zIndex:'99999', pointerEvents:'none',
            opacity:'0', transition:'opacity .25s', fontFamily:'"Noto Sans KR",sans-serif',
            whiteSpace:'nowrap', boxShadow:'0 4px 20px rgba(0,0,0,.3)'
          });
          document.body.appendChild(t);
          requestAnimationFrame(()=>{ t.style.opacity='1'; });
          setTimeout(()=>{ t.style.opacity='0'; setTimeout(()=>t.remove(), 300); }, 2800);
        })();
      }
    }
  }

  if (role === 'w') {
    r.winName = p.name; r.wPlayer = p; r.wCandidates = [p]; r.wSimilar = [];
  } else {
    r.loseName = p.name; r.lPlayer = p; r.lCandidates = [p]; r.lSimilar = [];
  }

  // 다른 모든 행에서 같은 선수를 가리키는 항목 자동 처리
  // 조건 1: 원본이름 일치(공백 정규화 포함)  OR  조건 2: candidates/similar 중 같은 선수 포함
  const origNoSpace = originalName ? originalName.replace(/\s+/g,'') : '';
  const _sameOrig = (rawName) => {
    if (!originalName || !rawName) return false;
    if (rawName === originalName) return true;
    // 공백 제거 후 비교: "안    아" vs "안아"
    return rawName.replace(/\s+/g,'') === origNoSpace && origNoSpace.length >= 1;
  };
  window._pasteResults.forEach((row, ri) => {
    if (ri === idx) return;
    // 승자 칸
    if (!row.wPlayer) {
      const inCands = row.wCandidates?.some(c => c.name === p.name);
      const inSimilar = row.wSimilar?.some(c => c.name === p.name);
      if (_sameOrig(row.winName) || inCands || inSimilar) {
        row.winName = p.name; row.wPlayer = p; row.wCandidates = [p]; row.wSimilar = [];
      }
    }
    // 패자 칸
    if (!row.lPlayer) {
      const inCands = row.lCandidates?.some(c => c.name === p.name);
      const inSimilar = row.lSimilar?.some(c => c.name === p.name);
      if (_sameOrig(row.loseName) || inCands || inSimilar) {
        row.loseName = p.name; row.lPlayer = p; row.lCandidates = [p]; row.lSimilar = [];
      }
    }
  });

  renderPastePreview(window._pasteResults, window._pasteErrors || []);
}

// ─────────────────────────────────────────────────────────────
// (요청사항) 자동인식 저장 전 "중복 경기" 확인 (공용)
// - 게임 키: 날짜|승자|패자|맵 (맵은 resolveMapName로 정규화)
// - toAdd: [{mode,d,w,l,map}]
// ─────────────────────────────────────────────────────────────
function _normMapDup(s){
  const t = (s || '').trim();
  if (!t) return '';
  try { return resolveMapName(t) || t; } catch (e) { return t; }
}
function _dupKey(d, w, l, map){
  return `${d || ''}|${w || ''}|${l || ''}|${_normMapDup(map)}`;
}
function _normModeKey(m){
  return (m === 'individual' ? 'ind' : (m || ''));
}
function _buildExistingPasteKeySet(mode){
  const mm = _normModeKey(mode);
  const set = new Set();
  const addMatchArr = (arr) => {
    (arr || []).forEach(mat => {
      const d = mat?.d || '';
      (mat?.sets || []).forEach(st => {
        (st?.games || []).forEach(g => {
          const a = g?.playerA || '';
          const b = g?.playerB || '';
          const win = g?.winner || 'A';
          const w = win === 'A' ? a : b;
          const l = win === 'A' ? b : a;
          if (!w || !l) return;
          set.add(_dupKey(d, w, l, g?.map || ''));
        });
      });
    });
  };
  try {
    if (mm === 'ind') {
      (typeof indM !== 'undefined' ? indM : []).forEach(g => { if (g?.wName && g?.lName) set.add(_dupKey(g.d || '', g.wName, g.lName, g.map || '')); });
    } else if (mm === 'gj') {
      (typeof gjM !== 'undefined' ? gjM : []).forEach(g => { if (g?.wName && g?.lName) set.add(_dupKey(g.d || '', g.wName, g.lName, g.map || '')); });
    } else if (mm === 'mini') {
      addMatchArr(typeof miniM !== 'undefined' ? miniM : []);
    } else if (mm === 'univm') {
      addMatchArr(typeof univM !== 'undefined' ? univM : []);
    } else if (mm === 'ck') {
      addMatchArr(typeof ckM !== 'undefined' ? ckM : []);
    } else if (mm === 'tt') {
      addMatchArr(typeof ttM !== 'undefined' ? ttM : []);
    } else if (mm === 'comp') {
      addMatchArr(typeof comps !== 'undefined' ? comps : []);
    } else if (mm === 'pro') {
      addMatchArr(typeof proM !== 'undefined' ? proM : []);
    }
  } catch (e) {}
  return set;
}
function _confirmDupBeforeSave(toAdd){
  const rows = (toAdd || []).map(x => ({
    mode: _normModeKey(x.mode),
    d: x.d || '',
    w: x.w || '',
    l: x.l || '',
    map: x.map || ''
  })).filter(x => x.mode && x.w && x.l);
  if (!rows.length) return true;

  const byMode = {};
  rows.forEach(x => {
    if (!byMode[x.mode]) byMode[x.mode] = { set: _buildExistingPasteKeySet(x.mode), count: 0 };
    if (byMode[x.mode].set.has(_dupKey(x.d, x.w, x.l, x.map))) byMode[x.mode].count++;
  });
  const entries = Object.entries(byMode).map(([k,v])=>({k,count:v.count})).filter(x=>x.count>0);
  const total = entries.reduce((s,x)=>s+x.count,0);
  if (total <= 0) return true;
  const nm = (k) => ({ ind:'개인전', gj:'끝장전', mini:'미니대전', univm:'대학대전', ck:'대학CK', tt:'티어대회', comp:'대회', pro:'프로리그' }[k] || k);
  const detail = entries.map(x => `- ${nm(x.k)}: ${x.count}건`).join('\n');
  return confirm(`⚠️ 이미 저장된 중복 경기가 ${total}건 있습니다.\n${detail}\n\n그래도 저장할까요?\n(확인=저장 / 취소=중단)`);
}

