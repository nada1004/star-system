function proCompInitBracket(tnId) {
  const tn = _findTourneyById(tnId);
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
  while (seeds.length < sz) seeds.push('TBD');
  // 1라운드 매치
  const firstRound = [];
  for (let i=0; i<sz; i+=2) firstRound.push({a:seeds[i], b:seeds[i+1], winner:'', d:'', map:''});
  // 이후 라운드 구성
  const rounds = [firstRound];
  let cur = firstRound.length;
  while (cur > 1) {
    cur = Math.floor(cur/2);
    const rnd = [];
    for (let i=0; i<cur; i++) rnd.push({a:'TBD', b:'TBD', winner:'', d:'', map:''});
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
  const _isByeMatch = (x)=>!x||x==='TBD'||String(x).toUpperCase()==='BYE';
  // (요청사항) 부전승(BYE/TBD) 경기: 승자 전파만 하고 개인 전적/대전기록에는 반영하지 않음
  const byeSide =
    (!_isByeMatch(m.a) && _isByeMatch(m.b)) ? 'A'
    : (_isByeMatch(m.a) && !_isByeMatch(m.b)) ? 'B'
    : '';
  const prevWinner = m.winner;
  const tieId = `pbn_${tnId}_${ri}_${mi}_tie`;
  // 이전에 동률 저장이 있었다면, 승자 확정 시 동률 기록은 제거
  const hadTie = (!prevWinner && Array.isArray(m._games) && m._games.length>0 &&
    (m._games.filter(g=>g.winner==='A').length === m._games.filter(g=>g.winner==='B').length));
  m.winner = m.winner===winner ? '' : winner;
  const nextMi = Math.floor(mi/2);
  const isA = mi%2===0;
  if (tn.bracket[ri+1]&&tn.bracket[ri+1][nextMi]) {
    const next = tn.bracket[ri+1][nextMi];
    if (m.winner) {
      // 승자 전파
      const wName = m.winner==='A'?m.a:m.b;
      if (isA) next.a=wName; else next.b=wName;
    } else {
      // 승자 취소 시 다음 라운드 해당 슬롯 초기화 + 이후 라운드 연쇄 초기화
      if (isA) next.a='TBD'; else next.b='TBD';
      next.winner='';
      // 이후 라운드 연쇄 초기화
      let curMi=nextMi;
      for (let r=ri+2; r<tn.bracket.length; r++) {
        const nxt2Mi=Math.floor(curMi/2);
        const isA2=curMi%2===0;
        if (!tn.bracket[r]||!tn.bracket[r][nxt2Mi]) break;
        if (isA2) tn.bracket[r][nxt2Mi].a='TBD'; else tn.bracket[r][nxt2Mi].b='TBD';
        tn.bracket[r][nxt2Mi].winner='';
        curMi=nxt2Mi;
      }
    }
  }
  // 준결승 패자 시 3위전 자동 배정 (3위전이 추가된 경우에만)
  const semiRi = tn.bracket.length - 2;
  if (tn.thirdPlace && ri === semiRi && tn.bracket.length >= 2 && (mi === 0 || mi === 1)) {
    const thirdKey = `pbn_${tnId}_3rd`;
    if (tn.thirdPlace.winner) _revertProMatch(thirdKey);
    tn.thirdPlace.winner = '';
    const loser = m.winner==='A'?m.b:(m.winner==='B'?m.a:'');
    if (mi === 0) tn.thirdPlace.a = loser||'TBD';
    else tn.thirdPlace.b = loser||'TBD';
  }
  // player history 반영
  const bktMatchId = `pbn_${tnId}_${ri}_${mi}`;
  if(!byeSide && !_isByeMatch(m.a) && !_isByeMatch(m.b)){
    if (hadTie && m.winner) { try{ _revertDrawMatch(tieId); }catch(e){} }
    if (prevWinner && m.a && m.b) _revertProMatch(bktMatchId);
    _syncBktMatchToHistory(tn, m, bktMatchId, ri, mi);
  }
  save(); render();
}

// (요청사항) 부전승 자동 처리: BYE/TBD 상대일 때 자동 승자 지정 + 다음 라운드 전파
function proCompApplyBye(tnId, ri, mi){
  const tn=_findTourneyById(tnId);
  const m=tn?.bracket?.[ri]?.[mi];
  if(!tn||!m) return;
  const isBye = (x)=>!x||x==='TBD'||String(x).toUpperCase()==='BYE';
  const side = (!isBye(m.a) && isBye(m.b)) ? 'A' : (isBye(m.a) && !isBye(m.b)) ? 'B' : '';
  if(!side) return alert('부전승 처리 가능한 경기가 아닙니다.');
  m.winner = side;
  const nextMi=Math.floor(mi/2);
  const isA = mi%2===0;
  if (tn.bracket[ri+1]&&tn.bracket[ri+1][nextMi]) {
    const next = tn.bracket[ri+1][nextMi];
    const wName = side==='A'?m.a:m.b;
    if (isA) next.a=wName; else next.b=wName;
  }
  save(); render();
}

// (요청사항) 특정 토너먼트 경기 삭제(초기화) + 히스토리 롤백 + 이후 라운드 전파 초기화
function proCompClearBktMatch(tnId, ri, mi){
  const tn=_findTourneyById(tnId);
  if(!tn||!tn.bracket||!tn.bracket[ri]||!tn.bracket[ri][mi]) return;
  const m=tn.bracket[ri][mi];
  if(!confirm('이 토너먼트 경기 기록을 삭제(초기화)할까요?')) return;
  const isBye = (x)=>!x||x==='TBD'||String(x).toUpperCase()==='BYE';
  const bktMatchId=`pbn_${tnId}_${ri}_${mi}`;
  const tieId = `${bktMatchId}_tie`;
  // 기존 히스토리 롤백 (BYE 제외)
  if(m.winner && !isBye(m.a) && !isBye(m.b)){
    try{ _revertProMatch(bktMatchId); }catch(e){}
  }
  // 동률(무승부) 기록도 롤백
  try{ _revertDrawMatch(tieId); }catch(e){}
  // 3위전 연결된 준결승이면 3위전도 초기화
  const semiRi = tn.bracket.length - 2;
  if(tn.thirdPlace && ri===semiRi && (mi===0||mi===1)){
    const thirdKey=`pbn_${tnId}_3rd`;
    if(tn.thirdPlace.winner) { try{ _revertProMatch(thirdKey); }catch(e){} }
    tn.thirdPlace.winner=''; tn.thirdPlace.map=''; tn.thirdPlace.d=''; tn.thirdPlace._games=[];
    if(mi===0) tn.thirdPlace.a='TBD';
    if(mi===1) tn.thirdPlace.b='TBD';
  }
  // 이 경기 초기화
  m.winner=''; m.map=''; m.d=''; m._games=[];
  // 다음 라운드 슬롯 초기화 + 이후 연쇄 초기화
  const nextMi=Math.floor(mi/2);
  const isA = mi%2===0;
  if (tn.bracket[ri+1]&&tn.bracket[ri+1][nextMi]) {
    const next = tn.bracket[ri+1][nextMi];
    if (isA) next.a='TBD'; else next.b='TBD';
    next.winner=''; next.map=''; next.d=''; next._games=[];
    let curMi=nextMi;
    for (let r=ri+2; r<tn.bracket.length; r++) {
      const nxt2Mi=Math.floor(curMi/2);
      const isA2=curMi%2===0;
      if (!tn.bracket[r]||!tn.bracket[r][nxt2Mi]) break;
      if (isA2) tn.bracket[r][nxt2Mi].a='TBD'; else tn.bracket[r][nxt2Mi].b='TBD';
      tn.bracket[r][nxt2Mi].winner=''; tn.bracket[r][nxt2Mi].map=''; tn.bracket[r][nxt2Mi].d=''; tn.bracket[r][nxt2Mi]._games=[];
      curMi=nxt2Mi;
    }
  }
  save(); render();
}

// (요청사항) 대진표 자체 삭제
function proCompDeleteBracket(tnId){
  const tn=_findTourneyById(tnId);
  if(!tn) return;
  if(!confirm('현재 대회의 대진표(토너먼트)를 삭제할까요?\n\n⚠️ 토너먼트 경기 결과/스트리머 최근 경기 반영도 함께 제거됩니다.')) return;
  const isBye = (x)=>!x||x==='TBD'||String(x).toUpperCase()==='BYE';
  const _rmRecordById = (mid)=>{
    if(!mid) return;
    try{
      const pi = (typeof proM!=='undefined'?proM:[]).findIndex(x=>x && x._id===mid);
      if(pi>=0) proM.splice(pi,1);
    }catch(e){}
    try{
      const ti = (typeof ttM!=='undefined'?ttM:[]).findIndex(x=>x && x._id===mid);
      if(ti>=0) ttM.splice(ti,1);
    }catch(e){}
  };
  const _buildMatchObj = (mid, m)=>{
    // revertMatchRecord가 gameMatchId(mid_s0_g#)까지 지울 수 있게 sets/games 구조로 구성
    const games = (m && Array.isArray(m._games) ? m._games : []);
    return {
      _id: mid,
      d: (m && m.d) ? m.d : '',
      sets: [{
        games: games.map(g=>({
          playerA: g.winName || '',
          playerB: g.loseName || '',
          winner: 'A',
          map: g.map || ''
        }))
      }]
    };
  };
  // 히스토리/기록 롤백 (player history + proM/ttM)
  (tn.bracket||[]).forEach((rnd,ri)=>{
    (rnd||[]).forEach((m,mi)=>{
      const mid = `pbn_${tnId}_${ri}_${mi}`;
      // 동률 저장(무승부) 롤백
      try{
        const hasGames = m && Array.isArray(m._games) && m._games.length>0;
        const sA = hasGames ? m._games.filter(g=>g.winner==='A').length : 0;
        const sB = hasGames ? m._games.filter(g=>g.winner==='B').length : 0;
        if(m && !m.winner && hasGames && sA===sB && (sA+sB)>0 && !isBye(m.a) && !isBye(m.b)){
          _revertDrawMatch(`${mid}_tie`);
        }
      }catch(e){}
      if(m && m.winner && !isBye(m.a) && !isBye(m.b)){
        try{
          if(typeof revertMatchRecord==='function') revertMatchRecord(_buildMatchObj(mid,m));
          else _revertProMatch(mid);
        }catch(e){}
        _rmRecordById(mid);
      }
    });
  });
  if(tn.thirdPlace && tn.thirdPlace.winner){
    const mid = `pbn_${tnId}_3rd`;
    try{
      if(typeof revertMatchRecord==='function') revertMatchRecord(_buildMatchObj(mid, tn.thirdPlace));
      else _revertProMatch(mid);
    }catch(e){}
    _rmRecordById(mid);
  }
  tn.bracket = [];
  tn.thirdPlace = null;
  tn.seedStarts = {};
  save(); render();
}

/* ══════════════════════════════════════════════════════════════
   대진표 결과 일괄 입력 (붙여넣기)
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
    ? `<div style="font-size:11px;color:var(--text3);margin-bottom:8px;padding:8px;background:var(--surface);border-radius:8px;line-height:1.9">
        ${pending.map(p=>`<span style="display:inline-block;margin:1px 4px;padding:1px 8px;border-radius:10px;background:${p.done?'#dcfce7':'#fef3c7'};color:${p.done?'#16a34a':'#92400e'};font-size:10px;font-weight:700">${p.round}: ${p.a} vs ${p.b}${p.done?' 완료':''}</span>`).join('')}
       </div>` : '';
  const modal = document.createElement('div');
  modal.id = '_bktPasteModal';
  modal.className = 'modal-compact-overlay';
  modal.innerHTML = `<div class="modal-compact-box" style="width:440px;max-height:90vh;overflow-y:auto">
    <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:8px">
      <div style="font-weight:900;font-size:15px">대진표 결과 일괄 입력</div>
      <span class="btn btn-w btn-xs" style="margin-left:auto">선택 경기 ${pending.length}</span>
    </div>
    <div style="font-size:11px;color:var(--text3);background:var(--surface);border-radius:8px;padding:10px;margin-bottom:10px;line-height:1.8">
      한 줄에 한 경기 (공백/탭 구분):<br>
      <code>승자이름 패자이름 [맵]</code><br>
      대진표에 등록된 선수명과 일치해야 자동 배정됩니다.
    </div>
    ${pendHTML}
    <textarea id="_bkt_text" rows="8" placeholder="${pending.slice(0,3).map(p=>`${p.a} ${p.b} 맵이름`).join('\n')||'승자이름 패자이름 맵이름'}" style="width:100%;padding:8px;border-radius:8px;border:1px solid var(--border);font-size:12px;box-sizing:border-box;font-family:monospace;resize:vertical"></textarea>
    <div id="_bkt_preview" style="margin-top:6px;font-size:11px;color:var(--text3)"></div>
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
    <div style="font-weight:900;font-size:15px;margin-bottom:10px">🗺️ 맵 설정</div>
    <input id="_bktMapInp" value="${(m.map||'').replace(/"/g,'&quot;')}" placeholder="맵 이름 입력" style="width:100%;padding:8px;border-radius:8px;border:1px solid var(--border);font-size:13px;box-sizing:border-box;margin-bottom:10px">
    <div style="display:flex;gap:8px">
      <button class="btn btn-b" style="flex:1" onclick="(function(){const v=document.getElementById('_bktMapInp').value.trim();const t2=_findTourneyById('${tnId}');if(t2&&t2.bracket&&t2.bracket[${ri}]&&t2.bracket[${ri}][${mi}]){const m2=t2.bracket[${ri}][${mi}];m2.map=v; if(m2.winner)_syncBktMatchToHistory(t2,m2,'pbn_${tnId}_${ri}_${mi}',${ri},${mi});}document.getElementById('_bktMapModal').remove();save();render();})()">확인</button>
      <button class="btn btn-w" style="flex:1" onclick="document.getElementById('_bktMapModal').remove()">취소</button>
    </div>
  </div>`;
  document.body.appendChild(modal);
  document.getElementById('_bktMapInp').focus();
}

let _bktEditGames = [], _bktEditTnId = '', _bktEditRi = -1, _bktEditMi = -1;

function _bktEditRenderGames() {
  const cont = document.getElementById('_bktEditGameList');
  if (!cont) return;
  const tn = _findTourneyById(_bktEditTnId);
  const m = tn && tn.bracket ? tn.bracket[_bktEditRi]?.[_bktEditMi] : null;
  const aV = (document.getElementById('_bktEditA')?.value || document.getElementById('_bktEditAInp')?.value || '').trim() || m?.a || 'A';
  const bV = (document.getElementById('_bktEditB')?.value || document.getElementById('_bktEditBInp')?.value || '').trim() || m?.b || 'B';
  if (!_bktEditGames.length) { cont.innerHTML = '<div style="font-size:11px;color:var(--gray-l);padding:6px 0">게임 없음 — 아래 버튼으로 추가</div>'; return; }
  cont.innerHTML = _bktEditGames.map((g,i)=>`<div style="display:flex;gap:5px;align-items:center;padding:4px 0;border-top:1px solid var(--border)">
    <span style="font-size:11px;color:var(--gray-l);min-width:26px">${i+1}G</span>
    <select onchange="_bktEditGames[${i}].winner=this.value;_bktEditRenderGames()" style="flex:1;min-width:90px;font-size:11px;padding:3px">
      <option value="">승자</option>
      <option value="A"${g.winner==='A'?' selected':''}>🔵 ${aV}</option>
      <option value="B"${g.winner==='B'?' selected':''}>🔴 ${bV}</option>
    </select>
    <input type="text" value="${g.map||''}" placeholder="맵" style="flex:1;min-width:60px;padding:3px 6px;border:1px solid var(--border2);border-radius:5px;font-size:11px" oninput="_bktEditGames[${i}].map=this.value">
    <button class="btn btn-r btn-xs" onclick="_bktEditGames.splice(${i},1);_bktEditRenderGames()">×</button>
  </div>`).join('');
}

function _bktEditAddGame() {
  _bktEditGames.push({winner:'', map:''});
  _bktEditRenderGames();
}

// (요청사항) 붙여넣기 없이 스코어(2:2 / 3:3 등)로 빠른 입력
function _bktEditApplyScore(){
  const a = parseInt(document.getElementById('_bktEditScoreA')?.value||'0',10) || 0;
  const b = parseInt(document.getElementById('_bktEditScoreB')?.value||'0',10) || 0;
  if(a<0||b<0) return alert('스코어는 0 이상이어야 합니다.');
  if(_bktEditGames.length){
    if(!confirm('현재 입력된 게임 목록을 스코어 기준으로 재설정할까요?')) return;
  }
  const games=[];
  for(let i=0;i<a;i++) games.push({winner:'A', map:''});
  for(let i=0;i<b;i++) games.push({winner:'B', map:''});
  _bktEditGames = games;
  _bktEditRenderGames();
}

function openBktEditPasteModal() {
  const tn = _findTourneyById(_bktEditTnId); if (!tn) return;
  const aV = (document.getElementById('_bktEditA')?.value || document.getElementById('_bktEditAInp')?.value || '').trim() || '';
  const bV = (document.getElementById('_bktEditB')?.value || document.getElementById('_bktEditBInp')?.value || '').trim() || '';
  if (!aV || !bV) return alert('A, B 선수를 먼저 선택하세요.');
  window._grpPasteState = {tnId: _bktEditTnId, ri: _bktEditRi, mi: _bktEditMi, mode: 'pcbktedit', aV, bV};
  window._grpPasteMode = true;
  const textarea = document.getElementById('paste-input');
  const previewEl = document.getElementById('paste-preview');
  const applyBtn = document.getElementById('paste-apply-btn');
  const badge = document.getElementById('paste-summary-badge');
  const pendWarn = document.getElementById('paste-pending-warn');
  if (textarea) textarea.value = '';
  if (previewEl) previewEl.innerHTML = '';
  if (applyBtn) { applyBtn.style.display='none'; applyBtn.textContent='✅ 게임 목록에 추가'; }
  if (badge) badge.style.display = 'none';
  if (pendWarn) pendWarn.style.display = 'none';
  window._pasteResults = null; window._pasteErrors = null;
  const dateInput = document.getElementById('paste-date');
  if (dateInput) dateInput.value = document.getElementById('_bktEditD')?.value || new Date().toISOString().slice(0,10);
  const modeSel = document.getElementById('paste-mode');
  if (modeSel) { modeSel.value='comp'; modeSel.style.display='none'; }
  const modeLabel = document.getElementById('paste-mode-label');
  if (modeLabel) modeLabel.style.display = 'none';
  const hintEl = document.getElementById('paste-mode-hint');
  if (hintEl) hintEl.innerHTML = `<div style="background:#eff6ff;border:1px solid #93c5fd;border-radius:8px;padding:8px 12px;margin-bottom:4px"><span style="color:#1d4ed8;font-weight:700">📝 경기 결과 입력 (게임 목록에 추가)</span> — <b>${aV}</b> vs <b>${bV}</b><br><span style="font-size:11px;color:#6b7280">형식: <code>${aV} ${bV} [맵]</code> / <code>${bV} ${aV} [맵]</code></span></div>`;
  const compWrap = document.getElementById('paste-comp-wrap');
  if (compWrap) compWrap.style.display = 'none';
  const _pd = document.querySelector('#pasteModal details');
  if (_pd) _pd.style.display = 'none';
  const _pt = document.querySelector('#pasteModal .mtitle');
  if (_pt) _pt.textContent = '📋 결과 붙여넣기 (경기 수정)';
  if (typeof om === 'function') om('pasteModal');
}

function _pcBktEditPasteApplyLogic(savable) {
  const {aV, bV} = window._grpPasteState;
  const added = [];
  for (const r of savable) {
    if (!r.wPlayer || !r.lPlayer) continue;
    const wn = r.wPlayer.name;
    let winner = '';
    if (wn === aV) winner = 'A';
    else if (wn === bV) winner = 'B';
    else { alert(`"${wn}"은(는) 해당 경기 선수가 아닙니다.\n${aV} vs ${bV}`); return false; }
    added.push({winner, map: r.map || ''});
  }
  if (!added.length) { alert('인식된 게임이 없습니다.'); return false; }
  _bktEditGames.push(...added);
  _bktEditRenderGames();
  return true;
}

function _bktEditSave() {
  const tn = _findTourneyById(_bktEditTnId); if (!tn) return;
  if (!tn.bracket || !tn.bracket[_bktEditRi]) return;
  const m = tn.bracket[_bktEditRi][_bktEditMi]; if (!m) return;
  const aRaw = (document.getElementById('_bktEditA')?.value || document.getElementById('_bktEditAInp')?.value || '').trim();
  const bRaw = (document.getElementById('_bktEditB')?.value || document.getElementById('_bktEditBInp')?.value || '').trim();
  const aInfo = (typeof window.resolvePlayerName==='function') ? window.resolvePlayerName(aRaw) : {name:aRaw};
  const bInfo = (typeof window.resolvePlayerName==='function') ? window.resolvePlayerName(bRaw) : {name:bRaw};
  const aV = aInfo.name || aRaw;
  const bV = bInfo.name || bRaw;
  const dV = document.getElementById('_bktEditD')?.value || '';
  const casterV = (document.getElementById('_bktEditCaster')?.value||'').trim();
  const bktId = `pbn_${_bktEditTnId}_${_bktEditRi}_${_bktEditMi}`;
  const tieId = `${bktId}_tie`;
  if (m.winner) _revertProMatch(bktId);
  m.a = aV; m.b = bV; m.d = dV;
  if(casterV) m.caster=casterV; else delete m.caster;
  // (보완) 사용자 혼동 방지: 스코어 입력칸을 채웠는데 [적용]을 안 눌러도 저장 시 반영
  try{
    const sAEl = document.getElementById('_bktEditScoreA');
    const sBEl = document.getElementById('_bktEditScoreB');
    const sA = parseInt(sAEl?.value||'',10);
    const sB = parseInt(sBEl?.value||'',10);
    if (_bktEditGames.length===0 && (Number.isFinite(sA)||Number.isFinite(sB)) && ((sA||0)>0 || (sB||0)>0)) {
      const games=[];
      for(let i=0;i<(sA||0);i++) games.push({winner:'A', map:''});
      for(let i=0;i<(sB||0);i++) games.push({winner:'B', map:''});
      _bktEditGames = games;
    }
  }catch(e){}
  const validGames = _bktEditGames.filter(g => g.winner);
  if (validGames.length > 0) {
    m._games = validGames;
    const scoreA = validGames.filter(g=>g.winner==='A').length;
    const scoreB = validGames.filter(g=>g.winner==='B').length;
    if (scoreA !== scoreB) {
      // 기존 동률 기록이 있으면 제거
      try{ _revertDrawMatch(tieId); }catch(e){}
      m.winner = scoreA > scoreB ? 'A' : 'B';
      m.map = validGames.length === 1 ? validGames[0].map || '' : '';
      const nextMi = Math.floor(_bktEditMi/2), isA = _bktEditMi%2===0;
      if (tn.bracket[_bktEditRi+1] && tn.bracket[_bktEditRi+1][nextMi]) {
        const next = tn.bracket[_bktEditRi+1][nextMi];
        const wSlot = m.winner==='A' ? m.a : m.b;
        if (isA) next.a = wSlot; else next.b = wSlot;
      }
      const semiRi = tn.bracket.length-2;
      if (tn.thirdPlace && _bktEditRi===semiRi && tn.bracket.length>=2 && (_bktEditMi===0||_bktEditMi===1)) {
        const thirdKey=`pbn_${_bktEditTnId}_3rd`;
        if (tn.thirdPlace.winner) _revertProMatch(thirdKey);
        tn.thirdPlace.winner='';
        const loser=m.winner==='A'?m.b:m.a;
        if (_bktEditMi===0) tn.thirdPlace.a=loser||'TBD'; else tn.thirdPlace.b=loser||'TBD';
      }
    } else {
      m.winner = ''; m.map = '';
      // 동률도 "저장" 처리: 히스토리에 무승부 기록 추가(승/패/ELO 영향 없음)
      try{
        _revertDrawMatch(tieId);
        if(typeof applyDrawResult==='function' && (scoreA+scoreB)>0) applyDrawResult(m.a, m.b, m.d||'', m.map||'-', tieId, '', '', '프로리그대회(토너먼트)', scoreA, scoreB);
      }catch(e){}
    }
  } else {
    m.winner = ''; m._games = []; m.map = '';
    try{ _revertDrawMatch(tieId); }catch(e){}
  }
  // 동률/승자미정일 때는 히스토리 반영하지 않음
  const isBye = (x)=>!x||x==='TBD'||String(x).toUpperCase()==='BYE';
  if(m.winner && !isBye(m.a) && !isBye(m.b)){
    _syncBktMatchToHistory(tn, m, bktId, _bktEditRi, _bktEditMi);
  }
  document.getElementById('_bktEditModal')?.remove();
  save(); render();
  // 저장 확인 토스트 (동률도 "저장됨"을 명확히 표시)
  try{
    const sA = Array.isArray(m._games) ? m._games.filter(g=>g.winner==='A').length : 0;
    const sB = Array.isArray(m._games) ? m._games.filter(g=>g.winner==='B').length : 0;
    if ((sA+sB) > 0) {
      if (sA === sB) showToast(`⚖️ 동률 저장됨 (${sA}:${sB})`, 3200);
      else showToast(`✅ 저장됨 (${sA}:${sB})`, 2200);
    } else {
      showToast('✅ 저장됨', 1800);
    }
  }catch(e){}
}

function proCompBktEditPlayers(tnId, ri, mi) {
  const tn = _findTourneyById(tnId);
  if (!tn||!tn.bracket||!tn.bracket[ri]) return;
  const m = tn.bracket[ri][mi];
  if (!m) return;
  _bktEditTnId = tnId; _bktEditRi = ri; _bktEditMi = mi;
  _bktEditGames = Array.isArray(m._games) ? m._games.map(g=>({...g})) : [];
  const pList = players.filter(p=>p.name).sort((a,b)=>(a.name||'').localeCompare(b.name||''));
  const pOpts = (sel) => `<option value="">직접 입력</option>` + pList.map(p=>`<option value="${p.name}"${p.name===sel?' selected':''}>${p.name}${p.univ?` (${p.univ})`:''}</option>`).join('');
  const modal = document.createElement('div');
  modal.id = '_bktEditModal';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px;box-sizing:border-box';
  modal.innerHTML = `<div style="background:var(--white);border-radius:14px;padding:20px;width:360px;max-width:100%;max-height:90vh;overflow-y:auto;box-shadow:0 8px 32px rgba(0,0,0,.2)">
    <div style="font-weight:900;font-size:14px;margin-bottom:14px">📝 대진표 경기 수정</div>
    <div style="margin-bottom:8px">
      <label style="font-size:11px;font-weight:700;color:var(--text3)">A 선수</label>
      <select id="_bktEditA" onchange="_bktEditRenderGames()" style="width:100%;padding:6px;border-radius:8px;border:1px solid var(--border);margin-top:4px">${pOpts(m.a||'')}</select>
      <input id="_bktEditAInp" placeholder="직접 입력" value="${pList.some(p=>p.name===m.a)?'':m.a||''}" oninput="_bktEditRenderGames()" style="width:100%;padding:6px;border-radius:8px;border:1px solid var(--border);margin-top:4px;box-sizing:border-box;font-size:12px">
    </div>
    <div style="margin-bottom:8px">
      <label style="font-size:11px;font-weight:700;color:var(--text3)">B 선수</label>
      <select id="_bktEditB" onchange="_bktEditRenderGames()" style="width:100%;padding:6px;border-radius:8px;border:1px solid var(--border);margin-top:4px">${pOpts(m.b||'')}</select>
      <input id="_bktEditBInp" placeholder="직접 입력" value="${pList.some(p=>p.name===m.b)?'':m.b||''}" oninput="_bktEditRenderGames()" style="width:100%;padding:6px;border-radius:8px;border:1px solid var(--border);margin-top:4px;box-sizing:border-box;font-size:12px">
    </div>
    <div style="margin-bottom:10px">
      <label style="font-size:11px;font-weight:700;color:var(--text3)">날짜</label>
      <input id="_bktEditD" type="date" value="${m.d||''}" style="width:100%;padding:6px;border-radius:8px;border:1px solid var(--border);margin-top:4px;box-sizing:border-box">
    </div>
    <div style="margin-bottom:10px;display:flex;align-items:center;gap:8px;background:#fef9ee;border:1px solid #f59e0b44;border-radius:8px;padding:8px 12px">
      <label style="font-size:11px;font-weight:700;color:#f59e0b;white-space:nowrap">🎙️ 캐스터/스트리머</label>
      <input type="text" id="_bktEditCaster" value="${m.caster||''}" placeholder="방송 스트리머 이름 (선택)" style="flex:1;min-width:0;padding:5px 9px;border:1px solid var(--border);border-radius:7px;font-size:12px">
    </div>
    <div style="margin-bottom:10px;padding:10px;background:var(--surface);border:1px solid var(--border);border-radius:10px">
      <div style="font-size:11px;font-weight:900;color:var(--text3);margin-bottom:6px">⚖️ 스코어로 빠른 입력 (2:2 / 3:3 등)</div>
      <div style="display:flex;gap:6px;align-items:center">
        <input id="_bktEditScoreA" type="number" min="0" value="0" style="width:70px;padding:6px;border-radius:8px;border:1px solid var(--border);box-sizing:border-box">
        <span style="font-weight:900;color:var(--gray-l)">:</span>
        <input id="_bktEditScoreB" type="number" min="0" value="0" style="width:70px;padding:6px;border-radius:8px;border:1px solid var(--border);box-sizing:border-box">
        <button class="btn btn-w btn-xs" style="margin-left:auto" onclick="_bktEditApplyScore()">적용</button>
      </div>
      <div style="font-size:10px;color:var(--gray-l);margin-top:6px;line-height:1.4">
        • 동률이면 승자 미정으로 저장되며 다음 라운드로 전파되지 않습니다.<br>
        • 이후 승자가 확정되면 게임별 승자를 다시 입력하면 됩니다.
      </div>
    </div>
    <div style="margin-bottom:4px">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">
        <label style="font-size:11px;font-weight:700;color:var(--text3)">게임 결과</label>
        <div style="display:flex;gap:4px">
          <button class="btn btn-b btn-xs" onclick="_bktEditAddGame()">+ 게임 추가</button>
          <button class="btn btn-p btn-xs" onclick="openBktEditPasteModal()">📋 붙여넣기</button>
        </div>
      </div>
      <div id="_bktEditGameList"></div>
    </div>
    <div style="display:flex;gap:8px;margin-top:14px">
      <button class="btn btn-b" style="flex:1" onclick="_bktEditSave()">✅ 저장</button>
      <button class="btn btn-w" style="flex:1" onclick="document.getElementById('_bktEditModal')?.remove()">취소</button>
    </div>
  </div>`;
  document.body.appendChild(modal);
  _bktEditRenderGames();
}

function proCompInitBracketManual(tnId) {
  const tn = _findTourneyById(tnId);
  if (!tn) return;
  const szStr = prompt('대진표 규모를 선택하세요\n2 = 결승\n4 = 4강\n8 = 8강\n16 = 16강\n\n참가 인원을 숫자로 입력하세요', '4');
  if (!szStr) return;
  let sz = parseInt(szStr);
  if (isNaN(sz)||sz<2) return alert('2 이상의 숫자를 입력하세요');
  // 올림으로 2의 거듭제곱
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
  // 준결승 결과가 있을 경우 패자 자동 배정
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
  if (!confirm('3·4위전을 제거하시겠습니까?')) return;
  const tn = _findTourneyById(tnId);
  if (!tn) return;
  const thirdKey = `pbn_${tnId}_3rd`;
  if (tn.thirdPlace && tn.thirdPlace.winner) _revertProMatch(thirdKey);
  tn.thirdPlace = null;
  save(); render();
}

function proCompResetBracket(tnId) {
  if (!confirm('대진표를 초기화하시겠습니까?')) return;
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
    <div style="font-weight:900;font-size:14px;margin-bottom:14px">🗓️ 3·4위전 날짜 입력</div>
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
    <div style="font-weight:900;font-size:15px;margin-bottom:14px">🗺️ 3·4위전 맵 설정</div>
    <input id="_thirdMapInp" value="${((tn.thirdPlace.map)||'').replace(/"/g,'&quot;')}" placeholder="맵 이름 입력" style="width:100%;padding:8px;border-radius:8px;border:1px solid var(--border);font-size:13px;box-sizing:border-box;margin-bottom:14px">
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
  let h = `<div style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:15px;color:var(--blue);margin-bottom:14px">🏗️ 조편성 관리 ${tn?' ('+tn.name+')':''}</div>`;
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
    const recTarget = grp._recTarget || ''; // pro | stage | none
    const recRound = grp._recRound || '16강'; // stage일 때만 사용
    h += `<div style="margin-bottom:16px;border-radius:12px;overflow:hidden;border:1.5px solid ${col}44">
      <div style="padding:10px 16px;background:linear-gradient(135deg,${col},${col}cc);color:#fff;display:flex;align-items:center;gap:8px">
        <span style="font-weight:900;font-size:13px">GROUP ${GL[gi]}</span>
        <input value="${grp.name||''}" placeholder="조 이름" style="background:#fff3;border:1px solid #fff5;border-radius:6px;padding:3px 8px;font-size:12px;color:#fff;width:120px"
          onchange="proCompRenameGrp('${tn.id}',${gi},this.value)">
        <span style="margin-left:8px;font-size:11px;font-weight:900;opacity:.9">기록 반영</span>
        <select style="padding:4px 8px;border-radius:8px;border:1px solid #fff7;background:#0002;color:#fff;font-weight:900;font-size:11px"
          onchange="proCompSetGrpRecTarget('${tn.id}',${gi},this.value)">
          <option value="" ${!recTarget?'selected':''}>선택</option>
          <option value="pro" ${recTarget==='pro'?'selected':''}>프로리그</option>
          <option value="stage" ${recTarget==='stage'?'selected':''}>대진표 기록</option>
          <option value="none" ${recTarget==='none'?'selected':''}>반영안함</option>
        </select>
        ${recTarget==='stage'?`<select style="padding:4px 8px;border-radius:8px;border:1px solid #fff7;background:#0002;color:#fff;font-weight:900;font-size:11px"
          onchange="proCompSetGrpRecRound('${tn.id}',${gi},this.value)">
          ${_PC_STAGE_ROUNDS.map(r=>`<option value="${r}" ${recRound===r?'selected':''}>${r}</option>`).join('')}
        </select>`:''}
        <button class="btn btn-r btn-xs" style="margin-left:auto" onclick="proCompDelGrp('${tn.id}',${gi})">🗑️ 조 삭제</button>
      </div>
      <div style="padding:12px 16px;background:var(--white)">
        <div style="font-size:11px;font-weight:700;color:var(--text3);margin-bottom:8px">선수 목록 (${(grp.players||[]).length}명)</div>
        <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px">
          ${(grp.players||[]).map((p,pi)=>`<div style="display:flex;align-items:center;gap:4px;padding:4px 10px;background:var(--surface);border-radius:20px;border:1px solid var(--border)">
            <span style="font-size:12px;font-weight:600">${p}</span>
            <button onclick="proCompRemovePlayer('${tn.id}',${gi},${pi})" style="background:none;border:none;cursor:pointer;color:var(--gray-l);font-size:12px;padding:0;line-height:1">×</button>
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
            ${m.winner?`<span style="font-size:10px;background:#fee2e2;color:#dc2626;padding:1px 6px;border-radius:10px;font-weight:700">${m.winner==='A'?m.a:m.b} 승</span>`:'<span style="font-size:10px;color:var(--gray-l)">미완료</span>'}
            ${m.d?`<span style="font-size:11px;font-weight:600;color:var(--text3)">${m.d}</span>`:''}
            <button class="btn btn-b btn-xs" style="margin-left:auto" onclick="proCompEditMatch('${tn.id}',${gi},${mi})">✏️</button>
            <button class="btn btn-r btn-xs" onclick="proCompDelMatch('${tn.id}',${gi},${mi})">🗑️</button>
          </div>`).join('')}
          <div style="display:flex;gap:6px;margin-top:6px;flex-wrap:wrap">
            <button class="btn btn-b btn-sm" onclick="proCompAddMatch('${tn.id}',${gi})">+ 경기 추가</button>
            <button class="btn btn-p btn-sm" onclick="proCompOpenPasteModal('${tn.id}',${gi})">📋 경기 결과 붙여넣기</button>
            ${(grp.players||[]).length>=2?`<button class="btn btn-w btn-sm" onclick="proCompGenRoundRobin('${tn.id}',${gi})" title="선수 목록 기반 라운드로빈 경기 자동 생성">🔄 라운드로빈 생성</button>`:''}
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
  if (ps.length < 2) return alert('선수가 2명 이상이어야 합니다.');
  // 기존 미완료 경기 수 확인
  const pairs = [];
  for (let i=0;i<ps.length;i++) for (let j=i+1;j<ps.length;j++) pairs.push({a:ps[i],b:ps[j]});
  // 이미 있는 조합 제외
  const newPairs = pairs.filter(p => !(grp.matches||[]).some(m=>(m.a===p.a&&m.b===p.b)||(m.a===p.b&&m.b===p.a)));
  if (!newPairs.length) { alert('모든 라운드로빈 경기가 이미 등록되어 있습니다.'); return; }
  if (!confirm(`${newPairs.length}경기를 추가하시겠습니까?\n(이미 있는 대진은 제외됩니다)`)) return;
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
    ${p.photo?`<img src="${toHttpsUrl(p.photo)}" style="width:18px;height:18px;border-radius:var(--su_profile_radius,50%);object-fit:cover" onerror="this.style.display='none'">`:''}
    ${p.name}
    ${p.tier?`<span style="background:${getTierBtnColor(p.tier)||'#64748b'};color:${getTierBtnTextColor(p.tier)||'#fff'};font-size:9px;padding:1px 4px;border-radius:3px">${p.tier}</span>`:''}
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
  if (!tn || !tn.groups.length) { alert('조를 먼저 만들어 주세요'); return; }
  if (tn.groups.length === 1) {
    proCompAddMatch(tnId, 0, date);
  } else {
    // 조 선택 팝업
    const GL = 'ABCDEFGHIJ';
    const grpOpts = tn.groups.map((g,i)=>`<option value="${i}">GROUP ${GL[i]} · ${g.name||GL[i]+'조'}</option>`).join('');
    const sel = document.createElement('div');
    sel.id = 'proGrpSelModal';
    sel.style.cssText = 'position:fixed;inset:0;background:#0008;z-index:10000;display:flex;align-items:center;justify-content:center';
    sel.innerHTML = `<div style="background:var(--white);border-radius:12px;padding:20px;width:280px;max-width:95vw;box-shadow:0 8px 32px rgba(0,0,0,.25)">
      <div style="font-weight:900;font-size:14px;margin-bottom:12px">어느 조에 추가할까요?</div>
      <select id="proGrpSelSel" style="width:100%;padding:8px;border-radius:8px;border:1px solid var(--border);margin-bottom:14px;box-sizing:border-box">${grpOpts}</select>
      <div style="display:flex;gap:8px">
        <button class="btn btn-b" style="flex:1" onclick="var _gi=parseInt(document.getElementById('proGrpSelSel').value);document.getElementById('proGrpSelModal').remove();proCompAddMatch('${tnId}',_gi,'${date}')">선택</button>
        <button class="btn btn-w" style="flex:1" onclick="document.getElementById('proGrpSelModal').remove()">취소</button>
      </div>
    </div>`;
    document.body.appendChild(sel);
  }
}

// 대진표 경기에 붙여넣기
function proCompOpenBktMatchPaste(tnId, ri, mi) {
  const tn = _findTourneyById(tnId); if (!tn) return;
  const m = (tn.bracket||[])[ri]?.[mi];
  if (!m||!m.a||!m.b||m.a==='TBD'||m.b==='TBD') return alert('양 선수가 모두 확정된 경기에서만 이용 가능합니다.');

  const modal = document.createElement('div');
  modal.id = '_pcBktMatchPaste';
  modal.className = 'modal-compact-overlay';
  const defDate = m.d || new Date().toISOString().slice(0,10);
  modal.innerHTML = `<div class="modal-compact-box" style="width:400px">
    <div style="font-weight:900;font-size:15px;margin-bottom:6px">📋 결과 붙여넣기</div>
    <div style="font-size:12px;color:var(--text3);margin-bottom:8px;line-height:1.55">
      <b>${m.a}</b> vs <b>${m.b}</b><br>
      이 경기 결과만 저장합니다. 여러 줄 입력 가능<br>
      형식: <code>A [맵]</code> / <code>B [맵]</code> 또는 <code>승자이름 패자이름 [맵]</code>
    </div>
    <div style="display:flex;gap:10px;align-items:center;margin-bottom:8px">
      <div style="font-size:12px;font-weight:700;color:var(--text3);min-width:44px">날짜</div>
      <input id="_pcBktPasteDate" type="date" value="${defDate}" style="flex:1;padding:8px;border-radius:10px;border:1.5px solid var(--border);box-sizing:border-box">
    </div>
    <textarea id="_pcBktPasteText" rows="5" placeholder="A 투혼" style="width:100%;padding:10px;border-radius:12px;border:1.5px solid var(--border);font-size:13px;box-sizing:border-box;font-family:monospace;resize:vertical"></textarea>
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

