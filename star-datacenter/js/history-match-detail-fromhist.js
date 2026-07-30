/* ══════════════════════════════════════════════════════════════
   대전기록 - history 항목으로 상세 찾기 (history-match-index.js 에서 분리, 2026-07-30)
   ══════════════════════════════════════════════════════════════ */

window.openMatchDetailFromHistory = function(selfName, oppName, date, map, modeLabel, matchId, result){
  try{
    const selfN=String(selfName||'').trim();
    const oppN=String(oppName||'').trim();
    const _pairEq = (a1,b1,a2,b2) => {
      const A1=String(a1||'').trim(), B1=String(b1||'').trim();
      const A2=String(a2||'').trim(), B2=String(b2||'').trim();
      if(!A1 || !B1 || !A2 || !B2) return false;
      return (A1===A2 && B1===B2) || (A1===B2 && B1===A2);
    };
    const _openedMatchHasPair = ()=>{
      try{
        const st = window._lastHistDetailState || null;
        if(!st || !st.key) return false;
        const reg = (window._detReg||{})[st.key];
        if(!reg || !reg.m) return false;
        const mm = reg.m || {};
        // mm.a/mm.b(세트형) 또는 mm.wName/mm.lName(단일) 기준으로 비교
        const A = mm.a || mm.teamALabel || mm.wName || '';
        const B = mm.b || mm.teamBLabel || mm.lName || '';
        return _pairEq(A, B, selfN, oppN);
      }catch(e){
        return false;
      }
    };
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
        // ⚠️ (버그픽스) 끝장전/개인전 자동인식 '배치 sid'가 여러 선수쌍에 공유되면,
        // matchId(sid)만으로는 엉뚱한 선수쌍의 상세가 열릴 수 있음.
        // -> 열리더라도 실제 (selfN, oppN) 쌍과 일치할 때만 성공으로 간주한다.
        if(ok && _openedMatchHasPair()) return true;
      }else if(mid && typeof window.openMatchDetailByMatchId === 'function'){
        const ok2 = window.openMatchDetailByMatchId(mid, lbl);
        if(ok2 && _openedMatchHasPair()) return true;
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

