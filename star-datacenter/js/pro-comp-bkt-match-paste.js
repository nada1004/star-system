/* ══════════════════════════════════════════════════════════════
   프로리그 - 대진표 경기 개별 붙여넣기 (pro-comp-edit-bracket.js 에서 분리, 2026-07-30)
   ══════════════════════════════════════════════════════════════ */

function proCompOpenBktMatchPaste(tnId, ri, mi) {
  const tn = _findTourneyById(tnId); if (!tn) return;
  const m = (tn.bracket||[])[ri]?.[mi];
  if (!m||!m.a||!m.b||m.a==='TBD'||m.b==='TBD') return alert('양 선수가 모두 확정된 경기에서만 이용 가능합니다.');

  const modal = document.createElement('div');
  modal.id = '_pcBktMatchPaste';
  modal.className = 'modal-compact-overlay';
  const defDate = m.d || new Date().toISOString().slice(0,10);
  modal.innerHTML = `<div class="modal-compact-box" style="width:400px">
    <div style="font-weight:900;font-size:var(--fs-md);margin-bottom:6px">📋 결과 붙여넣기</div>
    <div style="font-size:var(--fs-sm);color:var(--text3);margin-bottom:8px;line-height:1.55">
      <b>${m.a}</b> vs <b>${m.b}</b><br>
      이 경기 결과만 저장합니다. 여러 줄 입력 가능<br>
      형식: <code>A [맵]</code> / <code>B [맵]</code> 또는 <code>승자이름 패자이름 [맵]</code>
    </div>
    <div style="display:flex;gap:10px;align-items:center;margin-bottom:8px">
      <div style="font-size:var(--fs-sm);font-weight:700;color:var(--text3);min-width:44px">날짜</div>
      <input id="_pcBktPasteDate" type="date" value="${defDate}" style="flex:1;padding:8px;border-radius:var(--r);border:1.5px solid var(--border);box-sizing:border-box">
    </div>
    <textarea id="_pcBktPasteText" rows="5" placeholder="A 투혼" style="width:100%;padding:10px;border-radius:12px;border:1.5px solid var(--border);font-size:var(--fs-base);box-sizing:border-box;font-family:monospace;resize:vertical"></textarea>
    <div style="display:flex;gap:10px;margin-top:10px">
      <button class="btn btn-b" style="flex:1" onclick="proCompSaveBktMatchPaste('${tnId}',${ri},${mi})">적용</button>
      <button class="btn btn-w" style="flex:1" onclick="document.getElementById('_pcBktMatchPaste').remove()">취소</button>
    </div>
  </div>`;
  document.body.appendChild(modal);
  const ta = document.getElementById('_pcBktPasteText');
  if (ta) ta.focus();
}

function proCompSaveBktMatchPaste(tnId, ri, mi) {
  const tn = _findTourneyById(tnId); if (!tn) return;
  const m = (tn.bracket||[])[ri]?.[mi];
  if (!m||!m.a||!m.b) return;

  const text = (document.getElementById('_pcBktPasteText')||{}).value||'';
  if (!text.trim()) return;
  const lines = text.split('\n').map(l=>l.trim()).filter(Boolean);
  if (!lines.length) return;

  const games = [];
  // TSV(날짜/승자/패자/맵/...) 지원 + 종족 접미사 제거 + 별명 매핑
  const aliasMap = (()=>{ try{ return JSON.parse(localStorage.getItem('su_player_alias_map')||'{}')||{}; }catch(e){ return {}; } })();
  const nfc = (s)=> (s&&s.normalize) ? s.normalize('NFC') : String(s||'');
  const normKey = (s)=> nfc(String(s||'')).replace(/\s+/g,'').toLowerCase();
  const stripRace = (s)=> String(s||'').trim().replace(/\s*[TZPNtzpn]$/,'').trim();
  const resolveAlias = (name0)=>{
    const name = stripRace(name0);
    if(!name) return '';
    if(aliasMap && (name in aliasMap)) return String(aliasMap[name]||'') || name;
    const nk = normKey(name);
    for(const k in (aliasMap||{})){
      if(normKey(k)===nk) return String(aliasMap[k]||'') || name;
    }
    return name;
  };

  for (const line of lines) {
    // TSV(외부표) 입력이면: 날짜/승자/패자/맵...
    let raw = line;
    const cols = line.split('\t').map(x=>x.trim());
    if(cols.length>=4 && /^\d{4}-\d{2}-\d{2}$/.test(cols[0]||'')){
      raw = `${cols[1]||''}\t${cols[2]||''}\t${cols[3]||''}`;
    }
    const parts = raw.split(/[\s\t]+/).filter(Boolean);
    if (!parts.length) continue;

    let wName = resolveAlias(parts[0] || '');
    const wTok = (wName||'').toUpperCase();
    let winner = '';
    let lName = '';
    let map = '';

    if (wTok === 'A' || wTok === 'B') {
      winner = wTok;
      map = parts.slice(1).join(' ').trim();
    } else {
      if (parts.length >= 2) {
        lName = resolveAlias(parts[1] || '');
        map = parts.slice(2).join(' ').trim();
      } else {
        map = parts.slice(1).join(' ').trim();
      }

      if (!wName) continue;
      // 입력이 별명/본명 등으로 들어와도 매칭되게: m.a/m.b도 정규화해서 비교
      const aN = resolveAlias(m.a);
      const bN = resolveAlias(m.b);
      const inMatch = (wName===aN || wName===bN || wName===m.a || wName===m.b);
      if (!inMatch) return alert(`"${wName}"은(는) 해당 경기 선수가 아닙니다.\n${m.a} vs ${m.b}`);

      winner = (wName === aN || wName === m.a) ? 'A' : 'B';
      const expectedLoser = winner === 'A' ? m.b : m.a;
      if (lName && lName !== resolveAlias(expectedLoser) && lName !== expectedLoser) return alert(`패자 이름이 일치하지 않습니다.\n입력: ${wName} ${lName}\n대상: ${m.a} vs ${m.b}`);
    }

    if (!winner) continue;
    if (typeof resolveMapName === 'function') map = resolveMapName(map);
    games.push({ winner, map });
  }

  if (!games.length) return alert('저장 가능한 경기가 없습니다.');
  const scoreA = games.filter(g => g.winner === 'A').length;
  const scoreB = games.filter(g => g.winner === 'B').length;
  if (scoreA === scoreB) return alert(`승패가 동률입니다.\nA:${scoreA} / B:${scoreB}\n한 줄 더 추가하거나 수동으로 승자를 지정하세요.`);

  const winner = scoreA > scoreB ? 'A' : 'B';

  const dateVal = (document.getElementById('_pcBktPasteDate')||{}).value || '';
  if (dateVal) m.d = dateVal;
  m._games = games.map(g => ({ winner: g.winner, map: g.map || '' }));
  const onlyOne = games.length === 1;
  if (onlyOne && games[0].map) m.map = games[0].map;
  else if (!onlyOne) m.map = '';

  const bktMatchId = `pbn_${tnId}_${ri}_${mi}`;
  if (m.winner) _revertProMatch(bktMatchId);
  m.winner = winner;

  const nextMi = Math.floor(mi/2);
  const isA = mi%2===0;
  if (tn.bracket[ri+1] && tn.bracket[ri+1][nextMi]) {
    const next = tn.bracket[ri+1][nextMi];
    const wSlot = winner==='A'?m.a:m.b;
    if (isA) next.a = wSlot; else next.b = wSlot;
  }

  const semiRi = tn.bracket.length - 2;
  if (tn.thirdPlace && ri === semiRi && tn.bracket.length >= 2 && (mi === 0 || mi === 1)) {
    const thirdKey = `pbn_${tnId}_3rd`;
    if (tn.thirdPlace.winner) _revertProMatch(thirdKey);
    tn.thirdPlace.winner = '';
    const loser = winner==='A'?m.b:m.a;
    if (mi === 0) tn.thirdPlace.a = loser||'TBD';
    else tn.thirdPlace.b = loser||'TBD';
  }

  _syncBktMatchToHistory(tn, m, bktMatchId, ri, mi);
  const modal = document.getElementById('_pcBktMatchPaste');
  if (modal) modal.remove();
  save(); render();
}

