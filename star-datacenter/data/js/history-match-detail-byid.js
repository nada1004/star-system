/* ══════════════════════════════════════════════════════════════
   대전기록 - matchId로 상세 열기 (history-match-index.js 에서 분리, 2026-07-30)
   ══════════════════════════════════════════════════════════════ */

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
          // (버그픽스) sid는 "같은 날 붙여넣기 배치" 단위로 부여되어 서로 다른 선수쌍이
          // 같은 sid를 공유할 수 있음. sid만으로 묶으면 배치 내 다른 쌍(예: A vs B)의 경기가
          // 지금 클릭한 쌍(C vs D)의 상세팝업/공유카드에 섞여 나오는 문제가 있었음.
          // -> sid가 같아도 실제 선수쌍(and 프로/일반 구분)이 일치하는 경기만 묶는다.
          const _sidPairKey = [g.wName||'', g.lName||''].map(s=>String(s).trim()).sort().join('||');
          const _sidIsProGJ = (lbl==='프로리그끝장전');
          const group = arr.filter(x=>{
            if(!x || (x.sid!==sid && x.matchId!==sid)) return false;
            const pk = [x.wName||'', x.lName||''].map(s=>String(s).trim()).sort().join('||');
            if(pk !== _sidPairKey) return false;
            if(typeof x._proLabel !== 'undefined'){
              if(_sidIsProGJ && !x._proLabel) return false;
              if(!_sidIsProGJ && x._proLabel) return false;
            }
            return true;
          });
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
