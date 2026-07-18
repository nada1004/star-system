function _getMatchIndex(){
  // 데이터가 자주 바뀌는 앱이라, 없으면 생성 / 너무 오래됐으면 재생성
  const idx = window._matchIndex;
  if(!idx) return _buildMatchIndex();
  // 데이터 로딩/동기화 타이밍 이슈로, 길이 변화가 있으면 즉시 재인덱싱
  const cur = {
    mini: (typeof miniM!=='undefined' && miniM ? miniM.length : 0),
    univm: (typeof univM!=='undefined' && univM ? univM.length : 0),
    ck: (typeof ckM!=='undefined' && ckM ? ckM.length : 0),
    pro: (typeof proM!=='undefined' && proM ? proM.length : 0),
    tt: (typeof ttM!=='undefined' && ttM ? ttM.length : 0),
    comp: (typeof comps!=='undefined' && comps ? comps.length : 0),
    tourney: (typeof tourneys!=='undefined' && tourneys ? tourneys.length : 0),
    procomp: (typeof proTourneys!=='undefined' && proTourneys ? proTourneys.length : 0),
    ind: (typeof indM!=='undefined' && indM ? indM.length : 0),
    gj: (typeof gjM!=='undefined' && gjM ? gjM.length : 0)
  };
  const prev = idx.sizes || {};
  const changed = Object.keys(cur).some(k => (prev[k]||0) !== cur[k]);
  if(changed) return _buildMatchIndex();
  if(!idx.builtAt || (Date.now()-idx.builtAt) > 20000) return _buildMatchIndex(); // 20초 캐시
  return idx;
}

// ─────────────────────────────────────────────────────────────
// 스트리머 상세 "최근 경기"에서 종목(배지) 클릭 → 경기 상세 팝업
// - matchId가 게임ID(_sN_gN)일 수 있어 세션ID로 정규화 후 찾음
// - 찾은 match를 histDetModal(경기 상세)로 표시
// ─────────────────────────────────────────────────────────────
window.openMatchDetailByMatchId = function(matchId, modeLabel){
  return window._openMatchDetailByMatchId(matchId, modeLabel, false);
};

// 내부 구현: silent=true면 실패 시 alert 안 띄움
window._openMatchDetailByMatchId = function(matchId, modeLabel, silent){
  try{
    const mid = String(matchId||'').trim();
    if(!mid) return false;
    const lbl = String(modeLabel||'').trim();
    const sessId = (mid.includes('_s') && mid.includes('_g')) ? mid.split('_s')[0] : mid;

    // 0) 인덱스로 우선 탐색 (중첩 대회 포함)
    let _idxSkipToNative = false; // 예: 끝장전(gj)은 세션 묶음 처리가 필요하므로 아래 native 로직으로 넘김
    {
      const idx = _getMatchIndex();
      const cands = (idx.idMap.get(mid) || []).concat(idx.idMap.get(sessId) || []);
      if(cands && cands.length){
        const pick = cands[0];
        // game ref → parent match
        if(pick.refType==='game' && pick.parent){
          const pm = pick.parent;
          const lA = pm.teamALabel || pm.a || 'A';
          const lB = pm.teamBLabel || pm.b || 'B';
          const ca = (typeof gc==='function' ? (gc(lA)||'#3b82f6') : '#3b82f6');
          const cb = (typeof gc==='function' ? (gc(lB)||'#ef4444') : '#ef4444');
          const aW = (pm.sa||0)>(pm.sb||0);
          const bW = (pm.sb||0)>(pm.sa||0);
          const key = 'mid:'+String(pm._id||sessId);
          _regDet(key, pm, pick.modeKey||'comp', lA, lB, ca, cb, aW, bW);
          openHistDetailModal(key);
          return true;
        }
        // procompgj session stored as {a,b,games}
        if(pick.refType==='pcgj' && pick.obj){
          const sess = pick.obj;
          const a = sess.a || 'A';
          const b = sess.b || 'B';
          const games = (sess.games||[]).map((gg,idx2)=>({
            _id: `${sess._id||sessId}_s0_g${idx2}`,
            playerA: a, playerB: b,
            winner: gg.winner===a ? 'A' : gg.winner===b ? 'B' : '',
            map: gg.map || ''
          }));
          const sa = games.filter(g=>g.winner==='A').length;
          const sb = games.filter(g=>g.winner==='B').length;
          const mm = {_id: sess._id||sessId, d: sess.d||'', a, b, sa, sb, sets:[{scoreA:sa, scoreB:sb, winner:sa>sb?'A':sb>sa?'B':'', games}]};
          const ca = (typeof gc==='function' ? (gc(a)||'#3b82f6') : '#3b82f6');
          const cb = (typeof gc==='function' ? (gc(b)||'#ef4444') : '#ef4444');
          const key = 'mid:'+String(mm._id);
          _regDet(key, mm, 'procompgj', a, b, ca, cb, sa>sb, sb>sa);
          openHistDetailModal(key);
          return true;
        }
        if(pick.refType==='obj' && pick.obj){
          const o = pick.obj;
          // sets match
          if(o.sets && (o.a||o.teamALabel) && (o.b||o.teamBLabel)){
            const lA = o.teamALabel || o.a || 'A';
            const lB = o.teamBLabel || o.b || 'B';
            const ca = (typeof gc==='function' ? (gc(lA)||'#3b82f6') : '#3b82f6');
            const cb = (typeof gc==='function' ? (gc(lB)||'#ef4444') : '#ef4444');
            const aW = (o.sa||0)>(o.sb||0);
            const bW = (o.sb||0)>(o.sa||0);
            const key = 'mid:'+String(o._id||sessId);
            _regDet(key, o, pick.modeKey||'comp', lA, lB, ca, cb, aW, bW);
            openHistDetailModal(key);
            return true;
          }
          // ind-like
          if(o.wName && o.lName){
            // 끝장전(gj)은 BO 시리즈(여러 게임)로 묶어서 보여줘야 하므로
            // 인덱스에서 단일 게임으로 바로 열지 않고, 아래 native gj 로직(묶음 처리)로 넘김
            const mk = String(pick.modeKey||'');
            if(mk==='gj' || lbl.indexOf('끝장전') !== -1){
              _idxSkipToNative = true;
            } else {
              const key = 'mid:'+String(o._id||sessId);
              _regDet(key, {_id:key, d:o.d||'', wName:o.wName, lName:o.lName, map:o.map||''}, mk||'ind', 'WIN', 'LOSE', '#3b82f6', '#ef4444', true, false);
              openHistDetailModal(key);
              return true;
            }
          }
          // a/b + winner
          if(o.a && o.b && o.winner){
            const a=o.a, b=o.b;
            const w = (o.winner==='A' || o.winner===a) ? a : (o.winner==='B' || o.winner===b) ? b : '';
            const l = w===a ? b : w===b ? a : '';
            if(w && l){
              const key='mid:'+String(o._id||sessId);
              _regDet(key, {_id:key, d:o.d||'', wName:w, lName:l, map:o.map||''}, 'ind', 'WIN', 'LOSE', '#3b82f6', '#ef4444', true, false);
              openHistDetailModal(key);
              return true;
            }
          }
        }
      }
    }
    // 인덱스에서 찾았지만(주로 gj) 단일 표시 대신 묶음 처리가 필요하면 아래 로직으로 계속 진행

    const pickColor = (label, fallback) => {
      try{ return (typeof gc==='function' ? (gc(label)||fallback) : fallback); }
      catch(_){ return fallback; }
    };
    const openAsSetsMatch = (m, modeKey, lA, lB, ca, cb) => {
      const aW = (m.sa||0)>(m.sb||0);
      const bW = (m.sb||0)>(m.sa||0);
      const key = 'mid:'+String(m._id||sessId);
      _regDet(key, m, modeKey, lA, lB, ca, cb, aW, bW);
      openHistDetailModal(key);
      return true;
    };
    const openAsIndLike = (wName, lName, d, map, modeKey='ind') => {
      const key = 'mid:'+sessId;
      const m = {_id:sessId, d:d||'', wName, lName, map:map||''};
      _regDet(key, m, modeKey, 'WIN', 'LOSE', '#3b82f6', '#ef4444', true, false);
      openHistDetailModal(key);
      return true;
    };

    // 1) 개인전(indM) — _id가 gameId
    if(lbl==='개인전' && typeof indM!=='undefined'){
      const g = (indM||[]).find(x=>x && (x._id===mid || x._id===sessId));
      if(g) return openAsIndLike(g.wName, g.lName, g.d, g.map, 'ind');
    }

    // 2) 끝장전(gjM) / 프로리그끝장전(gjM _proLabel)
    if((lbl==='끝장전' || lbl==='프로리그끝장전') && typeof gjM!=='undefined'){
      const arr=(gjM||[]);
      const g = arr.find(x=>x && (
        x._id===mid || x._id===sessId ||
        x.sid===sessId || x.matchId===sessId ||
        x.sid===mid || x.matchId===mid
      ));
      if(g){
        const sid = g.sid || g.matchId || '';
        if(sid){
          const group = arr.filter(x=>x && (x.sid===sid || x.matchId===sid));
          if(group.length>=2){
            const names=[]; const seen=new Set();
            group.forEach(it=>{ [it.wName,it.lName].forEach(n=>{ if(n && !seen.has(n)){ seen.add(n); names.push(n);} }); });
            const A = names[0] || g.wName || 'A';
            const B = names[1] || g.lName || 'B';
            const games = group.slice().reverse().map((it,idx)=>({
              _id: `${sid}_s0_g${idx}`,
              playerA: A,
              playerB: B,
              winner: it.wName===A ? 'A' : it.wName===B ? 'B' : '',
              map: it.map || ''
            }));
            const sa = games.filter(x=>x.winner==='A').length;
            const sb = games.filter(x=>x.winner==='B').length;
            const m = {_id: sid, d: g.d||'', a: A, b: B, sa, sb, sets:[{scoreA:sa, scoreB:sb, winner:sa>sb?'A':sb>sa?'B':'', games}]};
            return openAsSetsMatch(m, 'gj', A, B, pickColor(A,'#3b82f6'), pickColor(B,'#ef4444'));
          }
        }
        // sid가 없거나 1게임만 잡히는 데이터(과거 저장/마이그레이션 등)는
        // 같은 날짜 + 같은 선수 페어(끝장전 특성상 BO 시리즈)를 한 세션으로 묶어서 표시
        const _pairKey = [g.wName||'', g.lName||''].map(s=>String(s).trim()).sort().join('||');
        const _isProGJ = (lbl==='프로리그끝장전');
        const group2 = arr.filter(x=>{
          if(!x) return false;
          if(String(x.d||'').trim() !== String(g.d||'').trim()) return false;
          const pk = [x.wName||'', x.lName||''].map(s=>String(s).trim()).sort().join('||');
          if(pk !== _pairKey) return false;
          // 프로끝장전/일반끝장전 분리 (가능한 경우)
          if(typeof x._proLabel !== 'undefined'){
            if(_isProGJ && !x._proLabel) return false;
            if(!_isProGJ && x._proLabel) return false;
          }
          return true;
        });
        if(group2.length>=2){
          const names=[]; const seen=new Set();
          group2.forEach(it=>{ [it.wName,it.lName].forEach(n=>{ if(n && !seen.has(n)){ seen.add(n); names.push(n);} }); });
          const A = names[0] || g.wName || 'A';
          const B = names[1] || g.lName || 'B';
          const gid = `gjgrp_${String(g.d||'')}_${_pairKey}`.replace(/[^\w\-|]/g,'');
          const games = group2.slice().reverse().map((it,idx)=>({
            _id: `${gid}_s0_g${idx}`,
            playerA: A,
            playerB: B,
            winner: it.wName===A ? 'A' : it.wName===B ? 'B' : '',
            map: it.map || ''
          }));
          const sa = games.filter(x=>x.winner==='A').length;
          const sb = games.filter(x=>x.winner==='B').length;
          const mm = {_id: gid, d: g.d||'', a: A, b: B, sa, sb, sets:[{scoreA:sa, scoreB:sb, winner:sa>sb?'A':sb>sa?'B':'', games}]};
          return openAsSetsMatch(mm, 'gj', A, B, pickColor(A,'#3b82f6'), pickColor(B,'#ef4444'));
        }
        return openAsIndLike(g.wName, g.lName, g.d, g.map, 'gj');
      }
    }

    // 3) 프로리그 대회 끝장전(proTourneys[].gjMatches) — 세션ID
    if(lbl==='프로리그대회끝장전' || lbl==='프로리그 대회 끝장전'){
      if(typeof proTourneys!=='undefined' && Array.isArray(proTourneys)){
        for(const tn of (proTourneys||[])){
          const sess = (tn?.gjMatches||[]).find(s=>s && s._id===sessId);
          if(sess){
            const a = sess.a || 'A';
            const b = sess.b || 'B';
            const games = (sess.games||[]).map((gg,idx)=>({
              _id: `${sessId}_s0_g${idx}`,
              playerA: a,
              playerB: b,
              winner: gg.winner===a ? 'A' : gg.winner===b ? 'B' : '',
              map: gg.map || ''
            }));
            const sa = games.filter(g=>g.winner==='A').length;
            const sb = games.filter(g=>g.winner==='B').length;
            const m = {_id: sessId, d: sess.d||'', a, b, sa, sb, sets:[{scoreA:sa, scoreB:sb, winner:sa>sb?'A':sb>sa?'B':'', games}]};
            return openAsSetsMatch(m, 'procompgj', a, b, pickColor(a,'#3b82f6'), pickColor(b,'#ef4444'));
          }
        }
      }
    }

    // 4) 세트 기반: mini/univm/ck/pro/tt/comps/tourneys 등
    const pools=[];
    const push=(arr,modeKey)=>{ if(arr && Array.isArray(arr)) pools.push({arr,modeKey}); };
    if(lbl==='미니대전' || lbl==='시빌워') push(typeof miniM!=='undefined'?miniM:[], 'mini');
    if(lbl==='대학대전') push(typeof univM!=='undefined'?univM:[], 'univm');
    if(lbl==='대학CK') push(typeof ckM!=='undefined'?ckM:[], 'ck');
    if(lbl==='프로리그') push(typeof proM!=='undefined'?proM:[], 'pro');
    if(lbl==='티어대회' || lbl==='티어대회 토너먼트') push(typeof ttM!=='undefined'?ttM:[], 'tt');
    if(lbl==='조별리그' || lbl==='대회' || lbl==='토너먼트') push(typeof comps!=='undefined'?comps:[], 'comp');
    // fallback 전체
    push(typeof miniM!=='undefined'?miniM:[], 'mini');
    push(typeof univM!=='undefined'?univM:[], 'univm');
    push(typeof ckM!=='undefined'?ckM:[], 'ck');
    push(typeof proM!=='undefined'?proM:[], 'pro');
    push(typeof ttM!=='undefined'?ttM:[], 'tt');
    push(typeof comps!=='undefined'?comps:[], 'comp');
    // 기존 대회 구조(tourneys)가 있으면 포함
    if(typeof tourneys!=='undefined') push(tourneys, 'tourney');

    for(const p of pools){
      const m = (p.arr||[]).find(x=>x && (x._id===sessId || x.matchId===sessId || x.id===sessId));
      if(m){
        const lA = m.teamALabel || m.a || 'A';
        const lB = m.teamBLabel || m.b || 'B';
        return openAsSetsMatch(m, p.modeKey, lA, lB, pickColor(lA,'#3b82f6'), pickColor(lB,'#ef4444'));
      }
    }

    // 5) 프로리그 대회(조별/토너/팀전) 내부에서 _id 딥서치
    const deepFindById = (root, id, maxDepth=10) => {
      const seen = new WeakSet();
      const walk = (node, depth) => {
        if(!node || depth>maxDepth) return null;
        if(typeof node !== 'object') return null;
        try{ if(seen.has(node)) return null; seen.add(node); }catch(_){}
        if(node._id===id) return node;
        if(Array.isArray(node)){
          for(const it of node){ const r = walk(it, depth+1); if(r) return r; }
        } else {
          for(const k of Object.keys(node)){ const r = walk(node[k], depth+1); if(r) return r; }
        }
        return null;
      };
      return walk(root, 0);
    };
    if(typeof proTourneys!=='undefined'){
      const found = deepFindById(proTourneys, sessId, 10);
      if(found){
        if(found.sets && (found.a||found.teamALabel) && (found.b||found.teamBLabel)){
          const lA = found.teamALabel || found.a || 'A';
          const lB = found.teamBLabel || found.b || 'B';
          return openAsSetsMatch(found, 'procomp', lA, lB, pickColor(lA,'#3b82f6'), pickColor(lB,'#ef4444'));
        }
        if(found.wName && found.lName){
          return openAsIndLike(found.wName, found.lName, found.d||'', found.map||'', 'ind');
        }
        if(found.a && found.b && found.winner){
          const a = found.a, b = found.b;
          const w = (found.winner==='A' || found.winner===a) ? a : (found.winner==='B' || found.winner===b) ? b : '';
          const l = w===a ? b : w===b ? a : '';
          if(w && l) return openAsIndLike(w, l, found.d||'', found.map||'', 'ind');
        }
      }
    }

    if(!silent) alert('해당 경기 상세 데이터를 찾을 수 없습니다.');
    return false;
  }catch(e){
    if(!silent) alert('경기 상세를 여는 중 오류가 발생했습니다.');
    try{ console.error(e); }catch(_){}
    return false;
  }
};

// 외부 프록시 프리셋 UI는 `js/history-external-ui.js`로 분리

// 스트리머 상세의 history 한 줄 정보(날짜/상대/맵/모드)만으로도 경기 상세 찾기
window.openMatchDetailFromHistory = function(selfName, oppName, date, map, modeLabel, matchId, result){
  try{
    const selfN=String(selfName||'').trim();
    const oppN=String(oppName||'').trim();
    const _normDate = (s) => {
      const t = String(s||'').trim();
      if(!t) return '';
      const m = t.match(/(20\\d{2})\\D?(\\d{1,2})\\D?(\\d{1,2})/);
      if(!m) return t;
      const y=m[1], mo=String(m[2]).padStart(2,'0'), da=String(m[3]).padStart(2,'0');
      return `${y}-${mo}-${da}`;
    };
    const d=_normDate(date);
    const m=String(map||'').trim();
    const lbl=String(modeLabel||'').trim();
    const mid=String(matchId||'').trim();
    const res=String(result||'').trim(); // '승' | '패' (없을 수 있음)

    try{
      if(mid && typeof window._openMatchDetailByMatchId === 'function'){
        const ok = window._openMatchDetailByMatchId(mid, lbl, true);
        if(ok) return true;
      }else if(mid && typeof window.openMatchDetailByMatchId === 'function'){
        const ok2 = window.openMatchDetailByMatchId(mid, lbl);
        if(ok2) return true;
      }
    }catch(e){}

    // ── (추가 폴백) 스트리머 history 자체에서 "같은 날짜+상대+종목"을 묶어서 세트로 표시 ──
    // 원본 배열(ttM/tourneys 등)에서 게임을 못 주워오는 환경/데이터에서도, 유저가 보는 history 기준으로는
    // 분명 같은날 여러 경기가 존재하므로 팝업에서는 최소한 "여러 경기"로 묶여서 보이게 한다.
    if(d && selfN && oppN && lbl){
      const pObj = (typeof players!=='undefined' ? (players||[]).find(p=>p && p.name===selfN) : null);
      const hs = (pObj?.history||[]).filter(h=>{
        if(!h) return false;
        const hd=_normDate(h.date||h.d||'');
        if(hd !== d) return false;
        if(String(h.opp||'').trim() !== oppN) return false;
        if(String(h.mode||'').trim() !== lbl) return false;
        return true;
      });
      if(hs.length >= 2){
        // 시간순(있으면)으로 정렬해서 경기1~N으로 보여주기
        hs.sort((a,b)=>(a.time||0)-(b.time||0));
        const games = hs.map((h,i)=>({
          _id: `histgrp_${lbl}_${d}_${[selfN,oppN].sort().join('_')}_g${i}`.replace(/[^\w\-]/g,''),
          playerA: selfN,
          playerB: oppN,
          winner: (h.result==='승') ? 'A' : (h.result==='패') ? 'B' : '',
          map: h.map || ''
        })).filter(g=>g.winner); // 승패 없는 건 제외
        if(games.length >= 2){
          const sa = games.filter(x=>x.winner==='A').length;
          const sb = games.filter(x=>x.winner==='B').length;
          const mm = {_id:`histgrp_${lbl}_${d}_${[selfN,oppN].sort().join('_')}`.replace(/[^\w\-]/g,''), d, a:selfN, b:oppN, sa, sb,
            sets:[{scoreA:sa, scoreB:sb, winner:sa>sb?'A':sb>sa?'B':'', games}]};
          const ca = (typeof gc==='function' ? (gc(selfN)||'#3b82f6') : '#3b82f6');
          const cb = (typeof gc==='function' ? (gc(oppN)||'#ef4444') : '#ef4444');
          const key = 'mid:'+mm._id;
          _regDet(key, mm, (lbl.indexOf('티어대회')!==-1?'tt':lbl.indexOf('끝장전')!==-1?'gj':'comp'), selfN, oppN, ca, cb, sa>sb, sb>sa);
          openHistDetailModal(key);
          return true;
        }
      }
    }

    // ── (중요) 실시간 스캔 기반 "날짜+상대 묶기" ──
    // 인덱스(sigMap)는 캐시/타이밍 이슈로 최신 게임을 놓칠 수 있어,
    // 사용자가 클릭했을 때는 해당 모드의 원본 배열을 직접 스캔해서 "같은 날짜+상대" 게임을 전부 모아준다.
    const _pairOk = (a,b) => {
      const A=String(a||'').trim(), B=String(b||'').trim();
      return (A===selfN && B===oppN) || (A===oppN && B===selfN);
    };
    const _pushGameList = (out, pA, pB, winnerName, gMap, gid) => {
      const A=String(pA||'').trim(), B=String(pB||'').trim();
      const W=String(winnerName||'').trim();
      if(!A || !B || !W) return;
      if(!(W===A || W===B)) return;
      // ⚠️ 맵이 '-'(또는 공백)인 게임이 여러 개면, (A,B,W,map) 기준 중복제거로 인해 1개만 남는 문제가 생김.
      // gameId가 있으면 그것을 키로 우선 사용하고, 없으면 시퀀스를 붙여 유니크 처리한다.
      if(out._seq == null) out._seq = 0;
      const mapKey = String(gMap||'').trim();
      const key = gid ? `gid:${gid}` : `${A}|${B}|${W}|${mapKey}|seq:${++out._seq}`;
      if(out._seen.has(key)) return;
      out._seen.add(key);
      out.games.push({playerA:A, playerB:B, winner: (W===A?'A':'B'), map:gMap||''});
    };
    const _collectFromSetsArr = (arr, out) => {
      if(!Array.isArray(arr)) return;
      for(const mm of arr){
        if(!mm) continue;
        const md = _normDate(mm.d || mm.date || '');
        if(d && md && md !== d) continue;
        const sets = mm.sets || [];
        for(let si=0; si<sets.length; si++){
          const set = sets[si];
          const games = set?.games || [];
          for(let gi=0; gi<games.length; gi++){
            const g = games[gi];
            if(!g || !g.winner) continue;
            if(!_pairOk(g.playerA, g.playerB)) continue;
            const wName = (g.winner==='A') ? g.playerA : (g.winner==='B') ? g.playerB : '';
            const gid = g._id || `${mm._id||mm.id||'m'}_s${si}_g${gi}`;
            _pushGameList(out, g.playerA, g.playerB, wName, g.map||'', gid);
          }
        }
      }
    };
    const _collectFromGjArr = (arr, out, proOnly=null) => {
      if(!Array.isArray(arr)) return;
      for(const gg of arr){
        if(!gg) continue;
        const gd = _normDate(gg.d || gg.date || '');
        if(d && gd && gd !== d) continue;
        if(!_pairOk(gg.wName, gg.lName)) continue;
        if(proOnly === true && !gg._proLabel) continue;
        if(proOnly === false && gg._proLabel) continue;
        _pushGameList(out, gg.wName, gg.lName, gg.wName, gg.map||'', gg._id || gg.sid || gg.matchId || '');
      }
    };
    const _collectDeepSets = (root, out, depth=0, seen=new WeakSet()) => {
      if(!root || depth>10) return;
      if(typeof root !== 'object') return;
      try{ if(seen.has(root)) return; seen.add(root); }catch(_){}
      // match object with sets
      if(root.sets && Array.isArray(root.sets)){
        const rd = _normDate(root.d || root.date || '');
        if(!d || !rd || rd === d){
          for(let si=0; si<root.sets.length; si++){
            const set = root.sets[si];
            const games = set?.games || [];
            for(let gi=0; gi<games.length; gi++){
              const g = games[gi];
              if(!g || !g.winner) continue;
              if(!_pairOk(g.playerA, g.playerB)) continue;
              const wName = (g.winner==='A') ? g.playerA : (g.winner==='B') ? g.playerB : '';
              const gid = g._id || `${root._id||root.id||'r'}_s${si}_g${gi}`;
              _pushGameList(out, g.playerA, g.playerB, wName, g.map||'', gid);
            }
          }
        }
      }
      if(Array.isArray(root)){
        for(const it of root) _collectDeepSets(it, out, depth+1, seen);
      } else {
        for(const k of Object.keys(root)) _collectDeepSets(root[k], out, depth+1, seen);
      }
    };
    const _openGroupedSetPopup = (games, modeKeyFallback) => {
      if(!games || games.length < 2) return false;
      const A=selfN, B=oppN;
      const gs = games.map((g,i)=>({
        _id: `grp_${lbl}_${d}_${[A,B].sort().join('_')}_g${i}`.replace(/[^\w\-]/g,''),
        playerA: A,
        playerB: B,
        winner: ((g.winner==='A'?g.playerA:g.playerB)===A) ? 'A' : 'B',
        map: g.map || ''
      }));
      const sa = gs.filter(x=>x.winner==='A').length;
      const sb = gs.filter(x=>x.winner==='B').length;
      const mm = {_id:`grp_${lbl}_${d}_${[A,B].sort().join('_')}`.replace(/[^\w\-]/g,''), d, a:A, b:B, sa, sb,
        sets:[{scoreA:sa, scoreB:sb, winner:sa>sb?'A':sb>sa?'B':'', games:gs}]};
      const ca = (typeof gc==='function' ? (gc(A)||'#3b82f6') : '#3b82f6');
      const cb = (typeof gc==='function' ? (gc(B)||'#ef4444') : '#ef4444');
      const key='mid:'+mm._id;
      _regDet(key, mm, modeKeyFallback||'comp', A, B, ca, cb, sa>sb, sb>sa);
      openHistDetailModal(key);
      return true;
    };

    // 모드별로 스캔 범위 선택
    if(d && selfN && oppN){
      const out = {games:[], _seen:new Set()};
      if(lbl==='끝장전'){
        _collectFromGjArr(typeof gjM!=='undefined'?gjM:[], out, false);
        if(_openGroupedSetPopup(out.games, 'gj')) return true;
      }
      if(lbl==='프로리그끝장전'){
        _collectFromGjArr(typeof gjM!=='undefined'?gjM:[], out, true);
        if(_openGroupedSetPopup(out.games, 'gj')) return true;
      }
      if(lbl==='대학CK'){
        _collectFromSetsArr(typeof ckM!=='undefined'?ckM:[], out);
        if(_openGroupedSetPopup(out.games, 'ck')) return true;
      }
      if(lbl==='티어대회' || lbl==='티어대회 토너먼트'){
        _collectFromSetsArr(typeof ttM!=='undefined'?ttM:[], out);
        _collectDeepSets(typeof tourneys!=='undefined'?tourneys:[], out);
        if(_openGroupedSetPopup(out.games, 'tt')) return true;
      }
      if(lbl==='프로리그'){
        _collectFromSetsArr(typeof proM!=='undefined'?proM:[], out);
        if(_openGroupedSetPopup(out.games, 'pro')) return true;
      }
      if(lbl==='대학대전'){
        _collectFromSetsArr(typeof univM!=='undefined'?univM:[], out);
        if(_openGroupedSetPopup(out.games, 'univm')) return true;
      }
      if(lbl==='미니대전'){
        _collectFromSetsArr(typeof miniM!=='undefined'?miniM.filter(m=>m&&m.type!=='civil'&&!(m.a==='A팀'&&m.b==='B팀')):[], out);
        if(_openGroupedSetPopup(out.games, 'mini')) return true;
      }
      if(lbl==='시빌워'){
        _collectFromSetsArr(typeof miniM!=='undefined'?miniM.filter(m=>m&&(m.type==='civil'||(m.a==='A팀'&&m.b==='B팀'))):[], out);
        if(_openGroupedSetPopup(out.games, 'civil')) return true;
      }
      if(lbl==='조별리그' || lbl==='대회' || lbl==='토너먼트' || lbl.indexOf('프로리그대회')!==-1 || lbl.indexOf('프로리그 대회')!==-1){
        _collectFromSetsArr(typeof comps!=='undefined'?comps:[], out);
        _collectDeepSets(typeof tourneys!=='undefined'?tourneys:[], out);
        _collectDeepSets(typeof proTourneys!=='undefined'?proTourneys:[], out);
        if(_openGroupedSetPopup(out.games, 'comp')) return true;
      }
    }

    // (요청) A안: 날짜+상대가 같으면 무조건 1매치로 묶기
    // - 스트리머 history는 종종 "개별 게임 1개" 단위로 쌓여있어서 종목 클릭 시 1개만 뜨는 문제가 있었음
    // - 탭에 있는 원본 데이터(세트/대회/끝장전/CK/티어대회 등)에서 "같은 날짜 + 같은 선수 페어" 게임을 전부 모아 세트형으로 표시
    const _labelToModeKeys = (label) => {
      if(!label) return [];
      if(label==='대학CK') return ['ck'];
      if(label==='대학대전') return ['univm'];
      if(label==='미니대전') return ['mini'];
      if(label==='시빌워') return ['civil'];
      if(label==='프로리그') return ['pro'];
      if(label.indexOf('티어대회') !== -1) return ['tt','tourney']; // 티어대회 토너먼트가 tourneys에 들어있는 케이스 대응
      if(label.indexOf('끝장전') !== -1) return ['gj','procompgj'];
      if(label==='조별리그' || label==='대회' || label==='토너먼트' || label.indexOf('프로리그대회') !== -1 || label.indexOf('프로리그 대회') !== -1)
        return ['comp','tourney','procomp'];
      // 기타는 제한하지 않음
      return [];
    };
    const _wantModeKeys = _labelToModeKeys(lbl);
    if(d && selfN && oppN && lbl && lbl!=='개인전'){
      const idx = _getMatchIndex();
      const pair = [selfN, oppN].sort().join('||');
      const sig = [d, pair, ''].join('|');
      const entries = idx.sigMap.get(sig) || [];
      // mode 필터 적용 (필터가 비어있으면 전부 허용)
      const filtered = _wantModeKeys.length ? entries.filter(e => _wantModeKeys.includes(e.modeKey)) : entries;

      // game 수집 (중복 제거)
      const outGames = [];
      const seenGame = new Set();
      let _pgSeq = 0;
      const pushGame = (pA, pB, winnerName, gMap, gid) => {
        const A = String(pA||'').trim(), B = String(pB||'').trim();
        const W = String(winnerName||'').trim();
        if(!A || !B || !W) return;
        if(!(W===A || W===B)) return;
        // gameId가 있으면 그것을 키로 우선 사용.
        // 없으면 seq를 붙여 같은 맵(특히 '-')인 게임 여러 개가 1개로 합산되는 버그를 방지한다.
        const key = gid ? `gid:${gid}` : `${A}|${B}|${W}|${String(gMap||'').trim()}|seq:${++_pgSeq}`;
        if(seenGame.has(key)) return;
        seenGame.add(key);
        outGames.push({
          playerA: A,
          playerB: B,
          winner: W===A ? 'A' : 'B',
          map: gMap || ''
        });
      };

      filtered.forEach(ent=>{
        if(!ent) return;
        if(ent.refType==='game' && ent.game){
          const g = ent.game;
          const wName = (g.winner==='A') ? g.playerA : (g.winner==='B') ? g.playerB : '';
          pushGame(g.playerA, g.playerB, wName, g.map||'', g._id||'');
        } else if(ent.refType==='pcgj' && ent.obj){
          const s = ent.obj;
          const A = s.a, B = s.b;
          (s.games||[]).forEach((gg,gi)=>{
            pushGame(A, B, gg.winner, gg.map||'', gg._id || `${s._id||s.id||'pcgj'}_g${gi}`);
          });
        } else if(ent.refType==='obj' && ent.obj){
          const o = ent.obj;
          if(o.wName && o.lName){
            pushGame(o.wName, o.lName, o.wName, o.map||'', o._id||o.sid||o.matchId||'');
          } else if(o.a && o.b && o.winner){
            const a=o.a, b=o.b;
            const w = (o.winner==='A'||o.winner===a) ? a : (o.winner==='B'||o.winner===b) ? b : '';
            pushGame(a, b, w, o.map||'', o._id||o.id||'');
          }
        }
      });

      // 2게임 이상이면 세트형으로 묶어서 표시
      if(outGames.length >= 2){
        // self/opp를 A/B로 고정해서 표기 (요청: 날짜+상대 기준 묶기)
        const A = selfN, B = oppN;
        const games = outGames.map((g, i)=>({
          _id: `grp_${d}_${[A,B].sort().join('_')}_g${i}`.replace(/[^\w\-]/g,''),
          playerA: A,
          playerB: B,
          winner: (g.winner==='A' ? g.playerA : g.playerB)===A ? 'A' : 'B',
          map: g.map || ''
        }));
        const sa = games.filter(x=>x.winner==='A').length;
        const sb = games.filter(x=>x.winner==='B').length;
        const mm = {_id:`grp_${lbl}_${d}_${[A,B].sort().join('_')}`.replace(/[^\w\-]/g,''), d, a: A, b: B, sa, sb,
          sets:[{scoreA:sa, scoreB:sb, winner:sa>sb?'A':sb>sa?'B':'', games}]};
        const ca = (typeof gc==='function' ? (gc(A)||'#3b82f6') : '#3b82f6');
        const cb = (typeof gc==='function' ? (gc(B)||'#ef4444') : '#ef4444');
        const modeKey = (_wantModeKeys[0] || (lbl.indexOf('끝장전')!==-1?'gj':'comp'));
        const key = 'mid:'+mm._id;
        _regDet(key, mm, modeKey, A, B, ca, cb, sa>sb, sb>sa);
        openHistDetailModal(key);
        return true;
      }
    }

    // 끝장전은 "한 세션(BO5 등)"으로 묶어서 보여주는 게 기본 기대값이라,
    // history의 matchId가 개별 게임ID로 들어와도 날짜+선수페어 기준으로 묶어서 우선 표시한다.
    if((lbl==='끝장전' || lbl==='프로리그끝장전') && typeof gjM!=='undefined'){
      const arr = (gjM||[]);
      const dateOk = (xDate) => !d || _normDate(xDate) === d;
      const playersOk = (a,b) => {
        const A=String(a||'').trim(), B=String(b||'').trim();
        return (A===selfN && B===oppN) || (A===oppN && B===selfN);
      };
      const group = arr.filter(x=>{
        if(!x) return false;
        if(x.d && !dateOk(x.d)) return false;
        // 일부 데이터는 d가 비어있을 수 있어, 그런 경우엔 날짜 필터를 강제하지 않음
        if(x.wName && x.lName){
          if(!playersOk(x.wName, x.lName)) return false;
        } else return false;
        // 프로끝장전/일반끝장전 구분 (가능한 경우)
        if(typeof x._proLabel !== 'undefined'){
          if(lbl==='프로리그끝장전' && !x._proLabel) return false;
          if(lbl==='끝장전' && x._proLabel) return false;
        }
        return true;
      });
      if(group.length >= 2){
        const names=[]; const seen=new Set();
        group.forEach(it=>{ [it.wName,it.lName].forEach(n=>{ if(n && !seen.has(n)){ seen.add(n); names.push(n);} }); });
        const A = names[0] || selfN || 'A';
        const B = names[1] || oppN || 'B';
        const gid = `gjgrp_${d}_${[A,B].sort().join('_')}`.replace(/[^\w\-]/g,'');
        const games = group.slice().reverse().map((it,idx)=>({
          _id: `${gid}_s0_g${idx}`,
          playerA: A,
          playerB: B,
          winner: it.wName===A ? 'A' : it.wName===B ? 'B' : '',
          map: it.map || ''
        }));
        const sa = games.filter(x=>x.winner==='A').length;
        const sb = games.filter(x=>x.winner==='B').length;
        const mm = {_id: gid, d, a: A, b: B, sa, sb, sets:[{scoreA:sa, scoreB:sb, winner:sa>sb?'A':sb>sa?'B':'', games}]};
        const ca = (typeof gc==='function' ? (gc(A)||'#3b82f6') : '#3b82f6');
        const cb = (typeof gc==='function' ? (gc(B)||'#ef4444') : '#ef4444');
        const key = 'mid:'+gid;
        _regDet(key, mm, 'gj', A, B, ca, cb, sa>sb, sb>sa);
        openHistDetailModal(key);
        return true;
      }
    }

    if(mid){
      const ok = window._openMatchDetailByMatchId(mid, lbl, true);
      if(ok) return true;
    }

    // 인덱스 signature 기반 탐색 (날짜+선수쌍+맵)
    {
      const idx = _getMatchIndex();
      const pair = [selfN, oppN].sort().join('||');
      const mKey = (m && m !== '-') ? m : '';
      const sig = [d, pair, mKey].join('|');
      const cands = (idx.sigMap.get(sig) || []).concat(idx.sigMap.get([d,pair,''].join('|')) || []);
      if(cands && cands.length){
        // 가장 먼저 들어온 후보를 id로 다시 열기 (세트 경기면 match._id, game이면 game._id)
        const c = cands[0];
        if(c.refType==='game' && c.parent && c.parent._id){
          return window._openMatchDetailByMatchId(c.parent._id, lbl, false);
        }
        if(c.refType==='obj' && c.obj && (c.obj._id || c.obj.id)){
          return window._openMatchDetailByMatchId(c.obj._id || c.obj.id, lbl, false);
        }
      }
    }

    // fallback: 날짜+선수쌍(+맵)으로 game 포함 여부 검색
    const mapOk = (gMap) => {
      if(!m || m==='-') return true;
      return String(gMap||'').trim() === m;
    };
    const playersOk = (a,b) => {
      const A=String(a||'').trim(), B=String(b||'').trim();
      return (A===selfN && B===oppN) || (A===oppN && B===selfN);
    };
    const dateOk = (xDate) => !d || String(xDate||'').trim() === d;

    // 개인전/끝장전 단일 게임
    if((lbl==='개인전') && typeof indM!=='undefined'){
      const g=(indM||[]).find(x=>x && dateOk(x.d) && playersOk(x.wName,x.lName) && mapOk(x.map));
      if(g) return window._openMatchDetailByMatchId(g._id||'', lbl, false);
    }
    if((lbl==='끝장전' || lbl==='프로리그끝장전') && typeof gjM!=='undefined'){
      const g=(gjM||[]).find(x=>x && dateOk(x.d) && playersOk(x.wName,x.lName) && mapOk(x.map));
      if(g) return window._openMatchDetailByMatchId(g._id||g.sid||'', lbl, false);
    }

    // 프로리그 대회 끝장전 세션
    if((lbl==='프로리그대회끝장전' || lbl==='프로리그 대회 끝장전') && typeof proTourneys!=='undefined'){
      for(const tn of (proTourneys||[])){
        const sess=(tn?.gjMatches||[]).find(s=>s && dateOk(s.d) && playersOk(s.a,s.b));
        if(sess) return window._openMatchDetailByMatchId(sess._id||'', '프로리그대회끝장전', false);
      }
    }

    // 세트 경기들: 특정 모드 풀 우선, 없으면 전체 풀
    const pools=[];
    const push=(arr,modeKey)=>{ if(arr && Array.isArray(arr)) pools.push({arr,modeKey}); };
    if(lbl==='미니대전' || lbl==='시빌워') push(typeof miniM!=='undefined'?miniM:[], 'mini');
    if(lbl==='대학대전') push(typeof univM!=='undefined'?univM:[], 'univm');
    if(lbl==='대학CK') push(typeof ckM!=='undefined'?ckM:[], 'ck');
    if(lbl==='프로리그') push(typeof proM!=='undefined'?proM:[], 'pro');
    if(lbl==='티어대회' || lbl==='티어대회 토너먼트') push(typeof ttM!=='undefined'?ttM:[], 'tt');
    if(lbl==='조별리그' || lbl==='대회' || lbl==='토너먼트') push(typeof comps!=='undefined'?comps:[], 'comp');
    // fallback
    push(typeof miniM!=='undefined'?miniM:[], 'mini');
    push(typeof univM!=='undefined'?univM:[], 'univm');
    push(typeof ckM!=='undefined'?ckM:[], 'ck');
    push(typeof proM!=='undefined'?proM:[], 'pro');
    push(typeof ttM!=='undefined'?ttM:[], 'tt');
    push(typeof comps!=='undefined'?comps:[], 'comp');

    for(const p of pools){
      for(const mm of (p.arr||[])){
        if(!mm || !dateOk(mm.d)) continue;
        const sets = mm.sets || [];
        for(const set of sets){
          const games = set.games || [];
          for(const g of games){
            if(!g) continue;
            if(playersOk(g.playerA,g.playerB) && mapOk(g.map)){
              return window._openMatchDetailByMatchId(mm._id||mm.id||'', lbl, false);
            }
          }
        }
      }
    }

    // 마지막 폴백: 원본 history 한 줄 정보로라도 상세 팝업을 띄움
    // (일부 데이터는 match 배열(gjM/indM/comps/ttM 등)에 없고 history만 존재)
    const wName = (res==='승') ? selfN : (res==='패') ? oppN : selfN;
    const lName = (res==='승') ? oppN  : (res==='패') ? selfN : oppN;
    const key = 'hist:'+ [d, lbl, wName, lName, m].join('|');
    const isGJ = (lbl.indexOf('끝장전') !== -1);
    const modeKey = isGJ ? 'gj' : 'ind';
    const memo = '⚠️ 원본 경기(세트/대회) 데이터를 찾지 못해 history 기반 단일 경기로 표시합니다.';
    const mm = {_id:key, d, wName, lName, map: m||'', memo};
    _regDet(key, mm, modeKey, 'WIN', 'LOSE', '#3b82f6', '#ef4444', true, false);
    openHistDetailModal(key);
    return true;
  }catch(e){
    alert('경기 상세를 여는 중 오류가 발생했습니다.');
    try{ console.error(e); }catch(_){}
    return false;
  }
};

function buildDetailHTML(m, mode, labelA, labelB, ca, cb, aWin, bWin){
  const _mdDesignMode = (()=>{ try{ const v=(localStorage.getItem('su_md_design_mode')||'classic').trim(); return ['classic','glass','editorial','neon','midnight','sunset','aurora','mono'].includes(v)?v:'classic'; }catch(e){ return 'classic'; } })();
  const _mdLayoutMode = (()=>{ try{ const v=(localStorage.getItem('su_md_layout_mode')||'default').trim(); return ['default','compact','focus','broadcast','split','poster'].includes(v)?v:'default'; }catch(e){ return 'default'; } })();
  const _wrapMdDetail = (inner)=>`<div class="cmd-detail-shell" data-md-mode="${_mdDesignMode}" data-md-layout="${_mdLayoutMode}">${inner}</div>`;
  const _modeLabel = (mk)=>{
    const v=String(mk||'').trim();
    if(v==='mini') return '미니대전';
    if(v==='univm') return '대학대전';
    if(v==='ck') return '대학CK';
    if(v==='pro') return '프로리그';
    if(v==='tt') return '티어대회';
    if(v==='comp') return '대회';
    if(v==='tourney') return '토너';
    if(v==='procomp') return '프로대회';
    if(v==='procompgj') return '프로대회끝장전';
    if(v==='gj') return '끝장전';
    if(v==='ind') return '개인전';
    return v;
  };
  const _resolvePlayerCol = (name, fallback) => {
    try{
      const p = (players||[]).find(x=>x && x.name===name);
      return (p && gc(p.univ)) || fallback || '#64748b';
    }catch(e){
      return fallback || '#64748b';
    }
  };
  const _splitSideNames = (v) => String(v||'').split(/[,+，]/).map(s=>s.trim()).filter(Boolean);
  const _escHtml = (v) => String(v==null?'':v)
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;')
    .replace(/'/g,'&#39;');
  const _escJs = (v) => String(v==null?'':v).replace(/\\/g,'\\\\').replace(/'/g,"\\'");
  const _gameSideNames = (g, side) => {
    if(!g) return [];
    if(side==='A'){
      if(Array.isArray(g.teamA) && g.teamA.length) return g.teamA.map(x=>typeof x==='string'?x:(x?.name||'')).filter(Boolean);
      if(g.a1 || g.a2) return [g.a1, g.a2].filter(Boolean);
      return _splitSideNames(g.playerA);
    }
    if(Array.isArray(g.teamB) && g.teamB.length) return g.teamB.map(x=>typeof x==='string'?x:(x?.name||'')).filter(Boolean);
    if(g.b1 || g.b2) return [g.b1, g.b2].filter(Boolean);
    return _splitSideNames(g.playerB);
  };
  const _renderNameList = (names) => {
    const safeNames = (names||[]).filter(Boolean);
    if(!safeNames.length) return '?';
    return safeNames.map(name=>{
      const safeJs = _escJs(name);
      const click = `onclick="(()=>{ const _s=JSON.parse(localStorage.getItem('su_pd_style')||'{}'); if(_s.close_on_match_player!==false){ const _m=document.getElementById('histDetModal'); if(_m) _m.style.display='none'; } openPlayerModal('${safeJs}'); })()" data-player-link="1"`;
      return `<span ${click} style="cursor:pointer;text-decoration:underline dotted">${_escHtml(name)}</span>`;
    }).join(`<span style="color:var(--text3)"> / </span>`);
  };
  const _teamBadge = (names) => (names||[]).length >= 2
    ? `<span style="display:inline-flex;align-items:center;justify-content:center;min-width:30px;height:18px;padding:0 6px;border-radius:999px;background:#e0f2fe;color:#0369a1;font-size:10px;font-weight:900;flex-shrink:0">2:2</span>`
    : '';
  ca = _resolvePlayerCol(labelA, ca);
  cb = _resolvePlayerCol(labelB, cb);
  // ind/gj: (단일 경기) sets 없이 wName/lName/map 구조
  // 단, 끝장전(BO 시리즈)처럼 sets가 존재하는 경우는 아래 세트 렌더링을 사용한다.
  if((mode==='ind'||mode==='gj') && (!m.sets || !m.sets.length)){
    const winNames=_splitSideNames(m.wName);
    const loseNames=_splitSideNames(m.lName);
    const isTeamGame=winNames.length>=2 || loseNames.length>=2;
    const pW=!isTeamGame&&winNames.length===1?players.find(p=>p.name===winNames[0]):null;
    const pL=!isTeamGame&&loseNames.length===1?players.find(p=>p.name===loseNames[0]):null;
    const wc=(pW&&gc(pW.univ))||ca;
    const lc=(pL&&gc(pL.univ))||cb;
    const rW=!isTeamGame&&pW?`<span class="rbadge r${pW.race}" style="font-size:10px">${pW.race}</span>`:'';
    const rL=!isTeamGame&&pL?`<span class="rbadge r${pL.race}" style="font-size:10px">${pL.race}</span>`:'';
    const uW=!isTeamGame&&pW?.univ?`<span class="ubadge" style="background:${wc};font-size:10px">${pW.univ}</span>`:'';
    const uL=!isTeamGame&&pL?.univ?`<span class="ubadge" style="background:${lc};font-size:10px;opacity:.92">${pL.univ}</span>`:'';
    const winNameHtml=isTeamGame?_renderNameList(winNames):_escHtml(m.wName||'');
    const loseNameHtml=isTeamGame?_renderNameList(loseNames):_escHtml(m.lName||'');
    const mapStr=m.map?`<span style="font-size:var(--fs-caption);color:var(--text3);white-space:nowrap">${m.map}</span>`:'';
    const memoStr=m.memo?`<div style="font-size:var(--fs-caption);color:var(--gray-l);margin-top:4px">📝 ${m.memo}</div>`:'';
    return _wrapMdDetail(`<div class="cmd-single-summary">
      <div class="cmd-single-summary__row">
        ${_teamBadge(winNames)}<span class="cmd-single-name">${winNameHtml}</span>${rW}${uW}
        <span class="cmd-single-vs">vs</span>
        <span class="cmd-single-name cmd-single-name--lose">${loseNameHtml}</span>${rL}${uL}
        ${mapStr}
      </div>
      ${memoStr?`<div class="cmd-single-summary__memo">${memoStr}</div>`:''}
    </div>`);
  }
  if(!m.sets||!m.sets.length) return _wrapMdDetail('<div style="font-size:var(--fs-sm);color:var(--gray-l);padding:8px 0">세트 상세 기록 없음</div>');

  const _buildGameCard = (g, si, gi) => {
    if(!g || (!g.playerA && !g.playerB)) return '';
    const namesA=_gameSideNames(g,'A');
    const namesB=_gameSideNames(g,'B');
    const isTeamGame=!!(g._isTeam || namesA.length>=2 || namesB.length>=2);
    const pA=!isTeamGame&&namesA.length===1?players.find(p=>p.name===namesA[0]):null;
    const pB=!isTeamGame&&namesB.length===1?players.find(p=>p.name===namesB[0]):null;
    const pca=(pA&&gc(pA.univ))||ca;
    const pcb=(pB&&gc(pB.univ))||cb;
    const aIsWinner=(g.winner==='A');
    const bIsWinner=(g.winner==='B');
    const hasWinner=!!(g.winner);
    const nameHtmlA=_renderNameList(namesA);
    const nameHtmlB=_renderNameList(namesB);
    const clickA=!isTeamGame&&g.playerA?`onclick="(()=>{ const _s=JSON.parse(localStorage.getItem('su_pd_style')||'{}'); if(_s.close_on_match_player!==false){ const _m=document.getElementById('histDetModal'); if(_m) _m.style.display='none'; } openPlayerModal('${_escJs(g.playerA||'')}'); })()" data-player-link="1"`:'';
    const clickB=!isTeamGame&&g.playerB?`onclick="(()=>{ const _s=JSON.parse(localStorage.getItem('su_pd_style')||'{}'); if(_s.close_on_match_player!==false){ const _m=document.getElementById('histDetModal'); if(_m) _m.style.display='none'; } openPlayerModal('${_escJs(g.playerB||'')}'); })()" data-player-link="1"`:'';
    const _teamColorMode = ['mini','univm','ck','pro','tt','comp','procomp','procomptn'].includes(String(mode||''));
    const sideBaseA = _teamColorMode ? ca : pca;
    const sideBaseB = _teamColorMode ? cb : pcb;
    const raceA=!isTeamGame&&pA?`<span class="rbadge cmd-race-badge r${pA.race}" style="font-size:10px;flex-shrink:0">${pA.race}</span>`:'';
    const raceB=!isTeamGame&&pB?`<span class="rbadge cmd-race-badge r${pB.race}" style="font-size:10px;flex-shrink:0">${pB.race}</span>`:'';
    const univLogoA='';
    const univLogoB='';
    const photoA=!isTeamGame&&pA?getPlayerPhotoHTML(pA.name,'40px','flex-shrink:0;border:2px solid '+sideBaseA+';box-shadow:0 1px 6px '+sideBaseA+'44'):'';
    const photoB=!isTeamGame&&pB?getPlayerPhotoHTML(pB.name,'40px','flex-shrink:0;border:2px solid '+sideBaseB+';box-shadow:0 1px 6px '+sideBaseB+'44'):'';
    const editBtn=isLoggedIn&&m._editRef?`<button class="btn btn-o btn-xs no-export cmd-edit-btn" style="margin-left:4px;flex-shrink:0" onclick="openGameEditModal('${m._editRef}',${si},${gi})">✏️</button>`:'';

    const winA = aIsWinner&&hasWinner;
    const winB = bIsWinner&&hasWinner;
    const _ct = t => t ? t.replace(/티어$/,'') : '';
    const _tierBadge = (tier) => tier ? `<span class="cmd-tier-badge" style="background:${getTierBtnColor(tier)||'#64748b'};color:${getTierBtnTextColor(tier)||'#fff'};font-size:9px;font-weight:700;padding:1px 5px;border-radius:6px;flex-shrink:0"><span class="tier-pc">${tier}</span><span class="tier-mob">${_ct(tier)}</span></span>` : '';
    const tierA = _tierBadge(pA?.tier);
    const tierB = _tierBadge(pB?.tier);

    if((window.__detailCtx||'')==='compModal' || (window.__detailCtx||'')==='histModal'){
      const sideColA = sideBaseA;
      const sideColB = sideBaseB;
      const loseA = hasWinner && !winA;
      const loseB = hasWinner && !winB;
      const pAHtml = photoA ? `<span class="cmd-photo ${loseA?'is-lose':''}">${photoA}</span>` : '';
      const pBHtml = photoB ? `<span class="cmd-photo ${loseB?'is-lose':''}">${photoB}</span>` : '';
      const loseBgA = `linear-gradient(180deg, rgba(248,250,252,.98), rgba(241,245,249,.96))`;
      const loseBgB = `linear-gradient(180deg, rgba(248,250,252,.98), rgba(241,245,249,.96))`;
      const loseBdA = 'rgba(203,213,225,.85)';
      const loseBdB = 'rgba(203,213,225,.85)';
      return `<div class="cmd-game" data-si="${si}" data-gi="${gi}">
        <div class="cmd-game-row">
          <div class="cmd-player ${winA?'is-win':''} ${loseA?'is-lose':''}" style="--cmd-col:${sideColA};background:${winA?(typeof getMatchWinTint==='function'?getMatchWinTint(sideColA):(sideColA+'22')):(loseA?loseBgA:(sideColA+'12'))};border-color:${winA?(sideColA+'55'):(loseA?loseBdA:(sideColA+'33'))};">
            <div class="cmd-player-meta">
              <div class="cmd-player-name" ${clickA} style="display:flex;align-items:center;justify-content:center;gap:8px;text-align:center"><span class="cmd-player-inline" style="display:inline-flex;align-items:center;gap:4px;justify-content:center">${_teamBadge(namesA)}${univLogoA}${tierA}${raceA}</span><span class="cmd-player-name__txt">${nameHtmlA}</span></div>
            </div>
            ${pAHtml}
          </div>
          <div class="cmd-midbox">
            <div class="cmd-gno">경기 ${gi+1}</div>
            ${g.map?`<div class="cmd-gmap">${g.map}</div>`:''}
          </div>
          <div class="cmd-player ${winB?'is-win':''} ${loseB?'is-lose':''} is-right" style="--cmd-col:${sideColB};background:${winB?(typeof getMatchWinTint==='function'?getMatchWinTint(sideColB):(sideColB+'22')):(loseB?loseBgB:(sideColB+'12'))};border-color:${winB?(sideColB+'55'):(loseB?loseBdB:(sideColB+'33'))};">
            ${pBHtml}
            <div class="cmd-player-meta">
              <div class="cmd-player-name" ${clickB} style="display:flex;align-items:center;justify-content:center;gap:8px;text-align:center"><span class="cmd-player-inline" style="display:inline-flex;align-items:center;gap:4px;justify-content:center">${_teamBadge(namesB)}${univLogoB}${tierB}${raceB}</span><span class="cmd-player-name__txt">${nameHtmlB}</span></div>
            </div>
          </div>
          ${editBtn}
        </div>
      </div>`;
    }

    const loseA = hasWinner && !winA;
    const loseB = hasWinner && !winB;
    const mapDot = g.map ? `<span style="font-size:10px;color:var(--text3);white-space:nowrap;flex-shrink:0">${g.map}</span>` : '';
    const photoAHtml = photoA ? `<span class="cmd-photo ${loseA?'is-lose':''}">${photoA}</span>` : '';
    const photoBHtml = photoB ? `<span class="cmd-photo ${loseB?'is-lose':''}">${photoB}</span>` : '';
    const nameStyleA = loseA ? 'opacity:.7;color:#64748b;' : 'opacity:1;';
    const nameStyleB = loseB ? 'opacity:.7;color:#64748b;' : 'opacity:1;';
    return `<div data-si="${si}" data-gi="${gi}" style="display:flex;flex-direction:column;gap:3px;padding:5px 2px;">
      <div style="display:flex;align-items:center;gap:5px;">
        <span style="color:var(--gray-l);font-size:var(--fs-caption);min-width:40px;font-weight:700;flex-shrink:0;text-align:center">경기${gi+1}</span>
        <div style="flex:1;display:flex;align-items:center;gap:5px;padding:6px 8px;border-radius:12px;background:${winA?pca+'18':(loseA?'linear-gradient(180deg, rgba(148,163,184,.14), rgba(255,255,255,.96))':pca+'12')};border:${winA?'1.5px solid '+pca+'55':(loseA?'1px solid rgba(148,163,184,.26)':'1px solid '+pca+'33')};min-width:0;">
          <div style="flex:1;min-width:0;display:flex;align-items:center;justify-content:flex-end;gap:4px;overflow:hidden">
            ${_teamBadge(namesA)}${univLogoA}${tierA}${raceA}
            <strong style="font-size:var(--fs-base);color:var(--text);white-space:nowrap;${nameStyleA}" ${clickA}>${nameHtmlA}</strong>
          </div>
          ${photoAHtml}
        </div>
        <span style="color:var(--gray-l);font-size:var(--fs-sm);font-weight:800;flex-shrink:0">vs</span>
        <div style="flex:1;display:flex;align-items:center;gap:5px;padding:6px 8px;border-radius:12px;background:${winB?pcb+'18':(loseB?'linear-gradient(180deg, rgba(148,163,184,.14), rgba(255,255,255,.96))':pcb+'12')};border:${winB?'1.5px solid '+pcb+'55':(loseB?'1px solid rgba(148,163,184,.26)':'1px solid '+pcb+'33')};min-width:0;">
          ${photoBHtml}
          <div style="flex:1;min-width:0;display:flex;align-items:center;gap:4px;overflow:hidden">
            ${_teamBadge(namesB)}${univLogoB}${tierB}${raceB}
            <strong style="font-size:var(--fs-base);color:var(--text);white-space:nowrap;${nameStyleB}" ${clickB}>${nameHtmlB}</strong>
          </div>
        </div>
        ${editBtn}
      </div>
      ${mapDot ? `<div style="padding-left:48px;font-size:10px;color:var(--text3)">${mapDot}</div>` : ''}
    </div>`;
  };

  const setBlocks=[];
  m.sets.forEach((set,si)=>{
    const isAce=(si===m.sets.length-1&&m.sets.length>=3);
    const sLabel=isAce?'🎯 에이스전':`${si+1}세트`;
    const swA=set.scoreA||0, swB=set.scoreB||0;
    const setAWin=swA>swB, setBWin=swB>swA;
    const head=`<div class="cmd-set-head" style="display:flex;align-items:center;gap:6px;margin-bottom:6px;padding:5px 10px;background:${isAce?'#f5f3ff':'var(--blue-l)'};border-radius:7px;border:1px solid ${isAce?'#ddd6fe':'var(--blue-ll)'}">
      <span class="set-row-title ${isAce?'ace-t':''}" style="margin-bottom:0;font-size:var(--fs-sm)">${sLabel}</span>
      <span class="ubadge${setAWin?'':' loser'}" style="background:${setAWin?ca:`linear-gradient(135deg, ${typeof getMatchWinTint==='function'?getMatchWinTint(ca):ca+'18'}, rgba(255,255,255,.92))`};color:${setAWin?'#fff':'#334155'};border-color:${setAWin?ca:ca+'33'};font-size:10px">${labelA}</span>
      <span style="font-weight:800;font-size:14px">
        <span class="${setAWin?'wt':setBWin?'lt':'pt-z'}">${swA}</span>
        <span style="color:var(--border2)"> : </span>
        <span class="${setBWin?'wt':setAWin?'lt':'pt-z'}">${swB}</span>
      </span>
      <span class="ubadge${setBWin?'':' loser'}" style="background:${setBWin?cb:`linear-gradient(135deg, ${typeof getMatchWinTint==='function'?getMatchWinTint(cb):cb+'18'}, rgba(255,255,255,.92))`};color:${setBWin?'#fff':'#334155'};border-color:${setBWin?cb:cb+'33'};font-size:10px">${labelB}</span>
    </div>`;
    const gamesArr=[];
    if(set.games&&set.games.length){
      set.games.forEach((g,gi)=>{
        const card=_buildGameCard(g, si, gi);
        if(card) gamesArr.push(card);
      });
    }
    const gamesHtml = gamesArr.length ? gamesArr.join('') : `<div style="font-size:var(--fs-caption);color:var(--gray-l);padding:4px 0">상세 경기 기록 없음</div>`;
    const id=`md-set-${si+1}`;
    const html=`<div class="set-row cmd-set" id="${id}" data-si="${si}" data-is-ace="${isAce?'1':'0'}">${head}${gamesHtml}</div>`;
    setBlocks.push({si,isAce,sLabel,swA,swB,setAWin,setBWin,gamesArr,html});
  });

  const _matchScore = ()=>{
    const a=(m.sa!=null?m.sa:null);
    const b=(m.sb!=null?m.sb:null);
    if(a!=null && b!=null) return {a:Number(a)||0,b:Number(b)||0};
    let wa=0, wb=0;
    (m.sets||[]).forEach(s=>{
      const sa=Number(s?.scoreA||0), sb=Number(s?.scoreB||0);
      if(sa>sb) wa++;
      else if(sb>sa) wb++;
    });
    return {a:wa,b:wb};
  };

  // (요청사항) 경기 상세 팝업에 "이번 경기 개인 기록" (참가자별 몇승 몇패) 인라인 표시
  const _playerTallyHTML = (()=>{
    const tally = {};
    (m.sets||[]).forEach(set=>{
      (set.games||[]).forEach(g=>{
        if(!g) return;
        const namesA=_gameSideNames(g,'A');
        const namesB=_gameSideNames(g,'B');
        // 팀전(2:2 등)은 개인 집계 대상에서 제외 — 1:1 게임만 집계
        if(namesA.length!==1 || namesB.length!==1) return;
        const nameA=namesA[0], nameB=namesB[0];
        if(!nameA || !nameB || !g.winner) return;
        if(!tally[nameA]) tally[nameA]={w:0,l:0,side:'A'};
        if(!tally[nameB]) tally[nameB]={w:0,l:0,side:'B'};
        if(g.winner==='A'){ tally[nameA].w++; tally[nameB].l++; }
        else if(g.winner==='B'){ tally[nameB].w++; tally[nameA].l++; }
      });
    });
    const entries=Object.entries(tally).filter(([,s])=>s.w+s.l>0);
    if(!entries.length) return '';
    const sortFn=(a,b)=>(b[1].w-b[1].l)-(a[1].w-a[1].l)||b[1].w-a[1].w;
    const sideEntries=(side)=>entries.filter(([,s])=>s.side===side).sort(sortFn);
    const _row=(name,s,col,alignRight)=>{
      const photoHtml = typeof getPlayerPhotoHTML==='function' ? getPlayerPhotoHTML(name,'26px','border:1.5px solid '+col+';box-shadow:0 1px 5px '+col+'40;') : '';
      const click=`onclick="(()=>{ const _s=JSON.parse(localStorage.getItem('su_pd_style')||'{}'); if(_s.close_on_match_player!==false){ const _m=document.getElementById('histDetModal'); if(_m) _m.style.display='none'; } openPlayerModal('${_escJs(name)}'); })()" data-player-link="1"`;
      const recordHtml=`<span class="cmd-pt-record"><b class="wt">${s.w}승</b>${s.l>0?`<span class="cmd-pt-sep">·</span><b class="lt">${s.l}패</b>`:''}</span>`;
      const nameHtml=`<span class="cmd-pt-name">${_escHtml(name)}</span>`;
      const idCellHtml=`<span class="cmd-pt-idcell"><span class="cmd-pt-photo">${photoHtml}</span>${nameHtml}</span>`;
      return `<div class="cmd-pt-row${alignRight?' is-right':''}" ${click} style="--pt-col:${col}">
        ${idCellHtml}
        ${recordHtml}
      </div>`;
    };
    const colFor=(name)=>{ const p=(players||[]).find(x=>x&&x.name===name); return (p&&gc(p.univ))||'#64748b'; };
    const listA=sideEntries('A').map(([name,s])=>_row(name,s,colFor(name),false)).join('');
    const listB=sideEntries('B').map(([name,s])=>_row(name,s,colFor(name),true)).join('');
    if(!listA && !listB) return '';
    return `<div class="cmd-player-tally">
      <div class="cmd-player-tally__head"><span class="cmd-player-tally__icon">🧑‍🤝‍🧑</span><span class="cmd-player-tally__title">이번 경기 개인 기록</span></div>
      <div class="cmd-player-tally__cols">
        <div class="cmd-player-tally__col cmd-player-tally__col--a">
          <div class="cmd-pt-colhead" style="--pt-col:${ca}">${_escHtml(labelA||'A')}</div>
          <div class="cmd-player-tally__list">${listA||'<div class="cmd-pt-empty">기록 없음</div>'}</div>
        </div>
        <div class="cmd-player-tally__div"></div>
        <div class="cmd-player-tally__col cmd-player-tally__col--b">
          <div class="cmd-pt-colhead" style="--pt-col:${cb}">${_escHtml(labelB||'B')}</div>
          <div class="cmd-player-tally__list">${listB||'<div class="cmd-pt-empty">기록 없음</div>'}</div>
        </div>
      </div>
    </div>`;
  })();

  const _posterHero = ()=>{
    const sc=_matchScore();
    const d=_escHtml(String(m.d||'').trim());
    const mk=_escHtml(_modeLabel(mode));
    const aTxt=_escHtml(labelA||'A');
    const bTxt=_escHtml(labelB||'B');
    const scA=`${sc.a}`; const scB=`${sc.b}`;
    const pill = (d||mk) ? `<div class="cmd-poster-meta"><span>${mk}</span>${d?`<span>${d}</span>`:''}</div>` : '';
    return `<div class="cmd-poster-hero" style="--cmdA:${ca};--cmdB:${cb}">
      ${pill}
      <div class="cmd-poster-row">
        <div class="cmd-poster-side cmd-poster-side--a">
          <div class="cmd-poster-name">${aTxt}</div>
        </div>
        <div class="cmd-poster-mid">
          <div class="cmd-poster-score"><span class="cmd-poster-scoreA">${scA}</span><span class="cmd-poster-colon">:</span><span class="cmd-poster-scoreB">${scB}</span></div>
          <div class="cmd-poster-vs">VS</div>
        </div>
        <div class="cmd-poster-side cmd-poster-side--b">
          <div class="cmd-poster-name">${bTxt}</div>
        </div>
      </div>
    </div>`;
  };

  if(_mdLayoutMode==='broadcast'){
    const items=[];
    setBlocks.forEach(sb=>{
      sb.gamesArr.forEach((card,gi)=>{
        items.push(`<div class="cmd-tl-item" data-si="${sb.si}" data-gi="${gi}">
          <div class="cmd-tl-top">
            <span class="cmd-tl-set">${sb.sLabel}</span>
            <span class="cmd-tl-score">${sb.swA}:${sb.swB}</span>
            <span class="cmd-tl-game">경기 ${gi+1}</span>
          </div>
          ${card}
        </div>`);
      });
      if(!sb.gamesArr.length){
        items.push(`<div class="cmd-tl-item" data-si="${sb.si}">
          <div class="cmd-tl-top">
            <span class="cmd-tl-set">${sb.sLabel}</span>
            <span class="cmd-tl-score">${sb.swA}:${sb.swB}</span>
          </div>
          <div class="cmd-tl-empty">상세 경기 기록 없음</div>
        </div>`);
      }
    });
    return _wrapMdDetail(`<div class="cmd-timeline">${items.join('')}</div>${_playerTallyHTML}`);
  }

  if(_mdLayoutMode==='split'){
    const idx=setBlocks.map(sb=>{
      const aW=sb.setAWin?'is-win':'';
      const bW=sb.setBWin?'is-win':'';
      const ace=sb.isAce?'is-ace':'';
      const lab=`${sb.sLabel}`;
      const sc=`${sb.swA}:${sb.swB}`;
      const t=`document.getElementById('md-set-${sb.si+1}')&&document.getElementById('md-set-${sb.si+1}').scrollIntoView({behavior:'smooth',block:'start'});`;
      return `<button type="button" class="cmd-setlink ${ace}" onclick="${t}">
        <span class="cmd-setlink-title">${lab}</span>
        <span class="cmd-setlink-score"><span class="cmd-setlink-a ${aW}">${sb.swA}</span><span class="cmd-setlink-colon">:</span><span class="cmd-setlink-b ${bW}">${sb.swB}</span></span>
        <span class="cmd-setlink-teams"><span class="cmd-setlink-team" style="--c:${ca}">${_escHtml(labelA||'A')}</span><span class="cmd-setlink-team" style="--c:${cb}">${_escHtml(labelB||'B')}</span></span>
      </button>`;
    }).join('');
    const main=setBlocks.map(sb=>sb.html).join('');
    return _wrapMdDetail(`<div class="cmd-split"><div class="cmd-split-index">${idx}</div><div class="cmd-split-main">${main}${_playerTallyHTML}</div></div>`);
  }

  if(_mdLayoutMode==='poster'){
    const main=setBlocks.map(sb=>sb.html).join('');
    return _wrapMdDetail(`<div class="cmd-poster">${_posterHero()}<div class="cmd-sets">${main}</div>${_playerTallyHTML}</div>`);
  }

  if(_mdLayoutMode==='focus'){
    const ace=setBlocks.filter(x=>x.isAce);
    const rest=setBlocks.filter(x=>!x.isAce);
    const ordered=ace.concat(rest);
    const main=ordered.map(sb=>sb.html).join('');
    return _wrapMdDetail(`<div class="cmd-focus">${main}${_playerTallyHTML}</div>`);
  }

  const main=setBlocks.map(sb=>sb.html).join('');
  return _wrapMdDetail(`<div class="cmd-sets">${main}${_playerTallyHTML}</div>`);
}
