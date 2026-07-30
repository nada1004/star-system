/* ══════════════════════════════════════════════════════════════
   프로리그 - 대진표 결과 일괄붙여넣기 & 날짜/맵 설정 (pro-comp-edit-bracket.js 에서 분리, 2026-07-30)
   ══════════════════════════════════════════════════════════════ */

function proCompOpenBktPasteModal(tnId) {
  const tn = _findTourneyById(tnId);
  if (!tn||!tn.bracket||!tn.bracket.length) { alert('대진표가 생성되지 않았습니다.\n(대진표 메뉴에서 대진표 생성 버튼)'); return; }
  const rounds = tn.bracket;
  const totalRounds = rounds.length;
  const rndLabel = ri => ri===totalRounds-1?'결승':ri===totalRounds-2?'준결승':ri===totalRounds-3?'4강':`${Math.pow(2,totalRounds-ri)}강`;
  // 진행 가능한 경기 목록 (a, b 모두 있는 경기)
  const pending = [];
  rounds.forEach((rnd, ri) => rnd.forEach((m, mi) => {
    if (m.a&&m.b&&m.a!=='TBD'&&m.b!=='TBD') pending.push({ri, mi, a:m.a, b:m.b, round:rndLabel(ri), done:!!m.winner});
  }));
  const pendHTML = pending.length
    ? `<div style="font-size:var(--fs-caption);color:var(--text3);margin-bottom:8px;padding:8px;background:var(--surface);border-radius:8px;line-height:1.9">
        ${pending.map(p=>`<span style="display:inline-block;margin:1px 4px;padding:1px 8px;border-radius:var(--r);background:${p.done?'#dcfce7':'#fef3c7'};color:${p.done?'#16a34a':'#92400e'};font-size:10px;font-weight:700">${p.round}: ${p.a} vs ${p.b}${p.done?' 완료':''}</span>`).join('')}
       </div>` : '';
  const modal = document.createElement('div');
  modal.id = '_bktPasteModal';
  modal.className = 'modal-compact-overlay';
  modal.innerHTML = `<div class="modal-compact-box" style="width:440px;max-height:90vh;overflow-y:auto">
    <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:8px">
      <div style="font-weight:900;font-size:var(--fs-md)">대진표 결과 일괄 입력</div>
      <span class="btn btn-w btn-xs" style="margin-left:auto">선택 경기 ${pending.length}</span>
    </div>
    <div style="font-size:var(--fs-caption);color:var(--text3);background:var(--surface);border-radius:8px;padding:10px;margin-bottom:10px;line-height:1.8">
      한 줄에 한 경기 (공백/탭 구분):<br>
      <code>승자이름 패자이름 [맵]</code><br>
      대진표에 등록된 선수명과 일치해야 자동 배정됩니다.
    </div>
    ${pendHTML}
    <textarea id="_bkt_text" rows="8" placeholder="${pending.slice(0,3).map(p=>`${p.a} ${p.b} 맵이름`).join('\n')||'승자이름 패자이름 맵이름'}" style="width:100%;padding:8px;border-radius:8px;border:1px solid var(--border);font-size:var(--fs-sm);box-sizing:border-box;font-family:monospace;resize:vertical"></textarea>
    <div id="_bkt_preview" style="margin-top:6px;font-size:var(--fs-caption);color:var(--text3)"></div>
    <div style="display:flex;gap:8px;margin-top:12px">
      <button class="btn btn-b" style="flex:1" onclick="proCompSaveBktPaste('${tnId}')">적용</button>
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

  // (개선) TSV(날짜/승자/패자/맵/...) 입력 지원 + 종족 접미사(Z/P/T) 제거 + 별명 매핑 지원
  const aliasMap = (()=>{ try{ return JSON.parse(localStorage.getItem('su_player_alias_map')||'{}')||{}; }catch(e){ return {}; } })();
  const nfc = (s)=> (s&&s.normalize) ? s.normalize('NFC') : String(s||'');
  const normKey = (s)=> nfc(String(s||'')).replace(/\s+/g,'').toLowerCase();
  const stripRace = (s)=>{
    const t = String(s||'').trim();
    if(!t) return '';
    // "박상현Z" / "박상현 Z" → "박상현"
    return t.replace(/\s*[TZPNtzpn]$/,'').trim();
  };
  const resolveAlias = (name0)=>{
    const name = stripRace(name0);
    if(!name) return '';
    // 직접 일치
    if(aliasMap && (name in aliasMap)) return String(aliasMap[name]||'') || name;
    // 정규화(공백/대소문자/종족접미사 제거) 기반 일치
    const nk = normKey(name);
    for(const k in (aliasMap||{})){
      if(normKey(k)===nk) return String(aliasMap[k]||'') || name;
    }
    return name;
  };

  lines.forEach(line => {
    let wRaw='', lRaw='', mapRaw='';
    // TSV 형식: 2026-04-13\t승자\t패자\t맵\t...
    const cols = line.split('\t').map(x=>x.trim()).filter(x=>x!=='' || x==='' );
    if(cols.length>=4 && /^\d{4}-\d{2}-\d{2}$/.test(cols[0]||'')){
      wRaw = cols[1]||''; lRaw = cols[2]||''; mapRaw = cols[3]||'';
    }else{
      const parts = line.split(/[\s\t]+/).filter(Boolean);
      if (parts.length < 2) return;
      wRaw = parts[0]||''; lRaw = parts[1]||''; mapRaw = parts.slice(2).join(' ');
    }
    const wName = resolveAlias(wRaw);
    const lName = resolveAlias(lRaw);
    const map = (typeof resolveMapName==='function' ? resolveMapName(mapRaw) : mapRaw);
    if (!wName||!lName||wName===lName) return;

    // 브라켓에서 해당 슬롯 찾기
    let found = false;
    for (let ri=0; ri<tn.bracket.length; ri++) {
      for (let mi=0; mi<tn.bracket[ri].length; mi++) {
        const m = tn.bracket[ri][mi];
        if (!m.a||!m.b) continue;

        let winner = '';
        // 1. 선수 이름으로 정확히 매칭 (우선순위)
        if (m.a===wName && m.b===lName) winner='A';
        else if (m.b===wName && m.a===lName) winner='B';
        
        // 2. 대학명으로 매칭 (보조 - 대진표에 선수명이 있어도 대학명으로 붙여넣는 경우 대비)
        if (!winner) {
          const pa = players.find(x=>x.name===m.a)||null, pb = players.find(x=>x.name===m.b)||null;
          if (pa && pb) {
            if (pa.univ===wName && pb.univ===lName) winner='A';
            else if (pb.univ===wName && pa.univ===lName) winner='B';
          }
        }

        if (!winner) continue;
        if (map) m.map = map;
        const prevWinner = m.winner;
        m.winner = winner;
        const nextMi = Math.floor(mi/2), isA = mi%2===0;
        if (tn.bracket[ri+1]&&tn.bracket[ri+1][nextMi]) {
          const next = tn.bracket[ri+1][nextMi];
          const wn = m.winner==='A'?m.a:m.b;
          if (isA) next.a=wn; else next.b=wn;
        }
        // 준결승 패자 시 3위전
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
  alert(`총 ${applied}경기 적용${skipped>0?`, ${skipped}건 미매칭`:''}`);
}

function proCompBktSetDate(tnId, ri, mi) {
  const tn = _findTourneyById(tnId);
  if (!tn||!tn.bracket||!tn.bracket[ri]) return;
  const m = tn.bracket[ri][mi];
  if (!m) return;
  const modal = document.createElement('div');
  modal.className = 'modal-compact-overlay';
  modal.innerHTML = `<div class="modal-compact-box modal-compact-box--sm" style="min-width:230px">
    <div style="font-weight:900;font-size:14px;margin-bottom:10px">🗓️ 날짜 입력</div>
    <input id="_bktDateInp" type="date" value="${m.d||''}" style="width:100%;padding:8px;border-radius:8px;border:1px solid var(--border);box-sizing:border-box;margin-bottom:10px">
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
  modal.className = 'modal-compact-overlay';
  modal.innerHTML = `<div class="modal-compact-box" style="width:320px">
    <div style="font-weight:900;font-size:var(--fs-md);margin-bottom:10px">🗺️ 맵 설정</div>
    <input id="_bktMapInp" value="${(m.map||'').replace(/"/g,'&quot;')}" placeholder="맵 이름 입력" style="width:100%;padding:8px;border-radius:8px;border:1px solid var(--border);font-size:var(--fs-base);box-sizing:border-box;margin-bottom:10px">
    <div style="display:flex;gap:8px">
      <button class="btn btn-b" style="flex:1" onclick="(function(){const v=document.getElementById('_bktMapInp').value.trim();const t2=_findTourneyById('${tnId}');if(t2&&t2.bracket&&t2.bracket[${ri}]&&t2.bracket[${ri}][${mi}]){const m2=t2.bracket[${ri}][${mi}];m2.map=v; if(m2.winner)_syncBktMatchToHistory(t2,m2,'pbn_${tnId}_${ri}_${mi}',${ri},${mi});}document.getElementById('_bktMapModal').remove();save();render();})()">확인</button>
      <button class="btn btn-w" style="flex:1" onclick="document.getElementById('_bktMapModal').remove()">취소</button>
    </div>
  </div>`;
  document.body.appendChild(modal);
  document.getElementById('_bktMapInp').focus();
}

let _bktEditGames = [], _bktEditTnId = '', _bktEditRi = -1, _bktEditMi = -1;

