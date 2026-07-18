(function(){
  window.MatchBuilderModules = window.MatchBuilderModules || {};

  function openIndSessionActionPop(btn, opts){
    try{
      if(window.HistoryActionUtils && typeof window.HistoryActionUtils.openSimpleActionMenu==='function'){
        const _list=(Array.isArray(opts)?opts:[]).map(it=>{
          const label=String(it?.l||it?.t||'').trim();
          let kind='normal';
          let desc='';
          if(label.includes('공유카드')){ kind='accent'; desc='공유용 카드 생성'; }
          else if(label.includes('수정')){ kind='normal'; desc='기록 내용 수정'; }
          else if(label.includes('이동')){ kind='normal'; desc='다른 기록 분류로 이동'; }
          else if(label.includes('삭제')){ kind='danger'; desc='이 기록을 완전히 삭제'; }
          else if(label.includes('복사')){ kind='normal'; desc='점수와 결과 텍스트 복사'; }
          return { t:label, d:desc, kind, on:()=>{ try{ if(typeof it?.fn==='function') it.fn(); else if(typeof it?.on==='function') it.on(); }catch(e){} } };
        }).filter(it=>it.t);
        window.HistoryActionUtils.openSimpleActionMenu(btn, _list);
        return;
      }
    }catch(e){}
    try{
      if(typeof _showMovePop==='function'){
        _showMovePop(btn, opts||[]);
        return;
      }
    }catch(e){}
  }

  window.openIndSessionPopup = window.openIndSessionPopup || function(sessKey){
    try{
      const s = (window._indSessCache||{})[sessKey];
      if(!s || !s.games || !s.games.length) return;
      const A = s.p1 || 'A';
      const B = s.p2 || 'B';
      const games = (s.games||[]).map((it, idx)=>({
        _id: `${sessKey}_s0_g${idx}`,
        playerA: A,
        playerB: B,
        winner: it.wName===A ? 'A' : it.wName===B ? 'B' : '',
        map: it.map || ''
      })).filter(g=>g.winner);
      const sa = games.filter(g=>g.winner==='A').length;
      const sb = games.filter(g=>g.winner==='B').length;
      const winner = sa>sb?'A':sb>sa?'B':'';
      const mm = {
        _id: sessKey, d: s.d || '', a: A, b: B, sa, sb,
        _matchType:'ind', _usePlayerPhoto:true, _subLabel:'개인전',
        sets:[{ label:'개인전', scoreA: sa, scoreB: sb, winner, games }]
      };
      const ca = (typeof gc==='function' ? (gc(A)||'#3b82f6') : '#3b82f6');
      const cb = (typeof gc==='function' ? (gc(B)||'#ef4444') : '#ef4444');
      const key = 'mid:'+String(sessKey);
      if(typeof _regDet==='function') _regDet(key, mm, 'ind', A, B, ca, cb, sa>sb, sb>sa);
      if(typeof openHistDetailModal==='function') openHistDetailModal(key);
    }catch(e){}
  };

  window.openGJSessionPopup = window.openGJSessionPopup || function(sessKey){
    try{
      const s = (window._gjSessCache||{})[sessKey];
      if(!s || !s.games || !s.games.length) return;
      const A = s.p1 || 'A';
      const B = s.p2 || 'B';
      const games = (s.games||[]).map((it, idx)=>({
        _id: `${sessKey}_s0_g${idx}`,
        playerA: A,
        playerB: B,
        winner: it.wName===A ? 'A' : it.wName===B ? 'B' : '',
        map: it.map || ''
      })).filter(g=>g.winner);
      const sa = games.filter(g=>g.winner==='A').length;
      const sb = games.filter(g=>g.winner==='B').length;
      const winner = sa>sb?'A':sb>sa?'B':'';
      const mm = {
        _id: sessKey,
        d: s.d || '',
        a: A,
        b: B,
        sa, sb,
        _matchType: s._proOnly ? 'progj' : 'gj',
        _usePlayerPhoto: true,
        _subLabel: s._proOnly ? '프로리그끝장전' : '끝장전',
        sets: [{ label: s._proOnly ? '프로리그 끝장전' : '끝장전', scoreA: sa, scoreB: sb, winner, games }]
      };
      const ca = (typeof gc==='function' ? (gc(A)||'#3b82f6') : '#3b82f6');
      const cb = (typeof gc==='function' ? (gc(B)||'#ef4444') : '#ef4444');
      const key = 'mid:'+String(sessKey);
      if(typeof _regDet==='function') _regDet(key, mm, s._proOnly ? 'progj' : 'gj', A, B, ca, cb, sa>sb, sb>sa);
      if(typeof openHistDetailModal==='function') openHistDetailModal(key);
    }catch(e){}
  };

  // ── 개선된 인라인 수정 모달 ─────────────────────────────────────
  // ⋯ 메뉴의 "수정"을 클릭하면 탭 이동 대신 모달로 날짜/결과를 빠르게 수정할 수 있게 함
  function _openInlineEditModal(sessKey, cacheKey){
    try{
      const s = ((cacheKey==='ind' ? window._indSessCache : window._gjSessCache)||{})[sessKey];
      if(!s || !Array.isArray(s.games) || !s.games.length) return false;
      const A = s.p1||'A', B = s.p2||'B';
      const proOnly = !!(s._proOnly);
      const typeName = cacheKey==='ind' ? '개인전' : (proOnly ? '프로리그 끝장전' : '끝장전');
      const typeColor = cacheKey==='ind' ? '#1d4ed8' : (proOnly ? '#6d28d9' : '#b45309');
      const p1Obj = (window.players||[]).find(p=>p.name===A)||{};
      const p2Obj = (window.players||[]).find(p=>p.name===B)||{};
      const p1Col = (typeof gc==='function' ? (gc(p1Obj.univ||'')||'#3b82f6') : '#3b82f6');
      const p2Col = (typeof gc==='function' ? (gc(p2Obj.univ||'')||'#ef4444') : '#ef4444');
      // 기존 모달 제거
      try{ document.getElementById('__inlineEditModal')?.remove(); }catch(e){}

      const modal = document.createElement('div');
      modal.id = '__inlineEditModal';
      const games = s.games.slice();
      const dateVal = s.d||'';

      function _buildGameRows(){
        return games.map((g,i)=>{
          const isW_A = g.wName===A, isW_B = g.wName===B;
          const mapVal = g.map||'';
          return `<div data-gi="${i}" style="display:flex;align-items:center;gap:8px;padding:6px 10px;border-radius:8px;background:var(--surface);border:1px solid var(--border)">
            <span style="font-size:var(--fs-caption);color:var(--gray-l);font-weight:700;min-width:20px">${i+1}G</span>
            <button type="button" onclick="_iem_setWinner(${i},'A')" style="flex:1;padding:5px 6px;border-radius:7px;font-size:var(--fs-caption);font-weight:900;cursor:pointer;border:2px solid ${isW_A?p1Col:'var(--border2)'};background:${isW_A?p1Col+'22':'var(--white)'};color:${isW_A?p1Col:'var(--text2)'};">${A}${isW_A?' 🏆':''}</button>
            <button type="button" onclick="_iem_setWinner(${i},'B')" style="flex:1;padding:5px 6px;border-radius:7px;font-size:var(--fs-caption);font-weight:900;cursor:pointer;border:2px solid ${isW_B?p2Col:'var(--border2)'};background:${isW_B?p2Col+'22':'var(--white)'};color:${isW_B?p2Col:'var(--text2)'};">${B}${isW_B?' 🏆':''}</button>
            <input value="${mapVal}" placeholder="맵" oninput="_iem_setMap(${i},this.value)" style="width:80px;padding:4px 7px;border:1px solid var(--border2);border-radius:6px;font-size:var(--fs-caption)">
            <button type="button" onclick="_iem_delGame(${i})" style="padding:3px 7px;border:1px solid #fca5a5;border-radius:6px;background:#fff1f2;color:#dc2626;font-size:var(--fs-caption);cursor:pointer;font-weight:900">✕</button>
          </div>`;
        }).join('');
      }

      function _addGame(winner){
        games.push({wName: winner===A ? A : B, lName: winner===A ? B : A, map:'', d: dateVal});
        _iem_refresh();
      }

      window._iem_setWinner = function(i, side){
        if(!games[i]) return;
        games[i].wName = side==='A' ? A : B;
        games[i].lName = side==='A' ? B : A;
        _iem_refresh();
      };
      window._iem_setMap = function(i, v){ if(games[i]) games[i].map = v; };
      window._iem_delGame = function(i){ games.splice(i,1); _iem_refresh(); };
      window._iem_addA = function(){ _addGame(A); };
      window._iem_addB = function(){ _addGame(B); };
      window._iem_refresh = function(){
        const rowsEl = document.getElementById('__iem_rows');
        if(rowsEl) rowsEl.innerHTML = _buildGameRows();
        const p1w = games.filter(g=>g.wName===A).length;
        const p2w = games.filter(g=>g.wName===B).length;
        const scoreEl = document.getElementById('__iem_score');
        if(scoreEl) scoreEl.textContent = `${p1w} : ${p2w}`;
      };
      window._iem_save = function(){
        try{
          const newDate = document.getElementById('__iem_date')?.value || dateVal;
          const ids = Array.isArray(s.ids) ? s.ids.slice() : s.games.map(g=>g?g._id:undefined).filter(Boolean);
          const sid = (s.games.find(g=>g&&g.sid)?.sid) || (s.games[0]?.sid||s.games[0]?._id) || '';
          if(!games.length){ alert('경기 결과가 없습니다.'); return; }
          // 기존 레코드 삭제 후 재저장 (silent=true: confirm없이 즉시 삭제, save/render는 뒤에서 한번만)
          if(cacheKey==='ind'){
            if(typeof deleteIndSession==='function') deleteIndSession(ids, true);
            const newSid = sid || (typeof genId==='function' ? genId() : Date.now()+'');
            const newGames = games.map(g=>({
              _id: typeof genId==='function' ? genId() : Date.now()+Math.random(),
              sid: newSid, d: newDate,
              wName: g.wName, lName: g.lName, map: g.map||''
            }));
            if(Array.isArray(window.indM)){
              // (버그픽스) g.map을 applyGameResult에 전달해야 선수 history에 맵이 기록됨
              newGames.forEach(g=>{ try{ if(typeof applyGameResult==='function') applyGameResult(g.wName,g.lName,newDate,g.map||'',g._id,'','','개인전'); }catch(e){} });
              window.indM.unshift(...newGames);
              if(typeof save==='function') save();
            }
          } else {
            if(typeof deleteGjSession==='function') deleteGjSession(ids, true);
            const newSid = sid || (typeof genId==='function' ? genId() : Date.now()+'');
            const newGames = games.map(g=>({
              _id: typeof genId==='function' ? genId() : Date.now()+Math.random(),
              sid: newSid, d: newDate,
              wName: g.wName, lName: g.lName, map: g.map||'',
              _proLabel: proOnly ? true : undefined
            }));
            if(Array.isArray(window.gjM)){
              // (버그픽스) g.map을 applyGameResult에 전달해야 선수 history에 맵이 기록됨
              newGames.forEach(g=>{ try{ if(typeof applyGameResult==='function') applyGameResult(g.wName,g.lName,newDate,g.map||'',g._id,'','',proOnly?'프로리그 끝장전':'끝장전'); }catch(e){} });
              window.gjM.unshift(...newGames);
              if(typeof save==='function') save();
            }
          }
          // (버그픽스) 저장 후 선수 history 완전 동기화 + 선수 모달 갱신
          try{ if(typeof _rebuildAllPlayerHistoryCore==='function') _rebuildAllPlayerHistoryCore(); }catch(e){}
          modal.remove();
          try{ if(typeof render==='function') render(); }catch(e){}
          try{ if(typeof window.refreshPlayerModalIfOpen==='function') window.refreshPlayerModalIfOpen(); }catch(e){}
        }catch(e){ alert('저장 중 오류: '+e.message); }
      };
      window._iem_close = function(){ modal.remove(); };

      const p1w0 = games.filter(g=>g.wName===A).length;
      const p2w0 = games.filter(g=>g.wName===B).length;

      modal.style.cssText = 'position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;background:rgba(15,23,42,.48);backdrop-filter:blur(4px);padding:16px';
      modal.innerHTML = `
        <div style="background:var(--white);border-radius:18px;padding:0;width:100%;max-width:480px;max-height:90vh;display:flex;flex-direction:column;box-shadow:0 24px 80px rgba(15,23,42,.22);overflow:hidden">
          <div style="padding:18px 20px 14px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px">
            <div style="width:8px;height:28px;border-radius:4px;background:${typeColor};flex-shrink:0"></div>
            <div style="flex:1;min-width:0">
              <div style="font-size:var(--fs-md);font-weight:1000;color:var(--text)">✏️ 경기 기록 수정</div>
              <div style="font-size:var(--fs-caption);color:var(--gray-l);margin-top:2px"><span style="font-weight:800;color:${typeColor}">${typeName}</span> · ${A} vs ${B}</div>
            </div>
            <button type="button" onclick="_iem_close()" style="padding:6px 10px;border:none;background:none;font-size:var(--fs-lg);color:var(--gray-l);cursor:pointer;border-radius:8px;line-height:1">✕</button>
          </div>

          <div style="overflow-y:auto;flex:1;padding:16px 20px;display:flex;flex-direction:column;gap:14px">
            <div style="display:flex;align-items:center;gap:10px">
              <label style="font-size:var(--fs-sm);font-weight:800;color:var(--text2);white-space:nowrap">📅 날짜</label>
              <input type="date" id="__iem_date" value="${dateVal}" style="padding:7px 10px;border:1.5px solid var(--border2);border-radius:8px;font-size:var(--fs-base);font-weight:900;flex:1">
            </div>

            <div style="display:flex;align-items:center;justify-content:center;gap:12px;padding:10px 16px;background:var(--bg2);border-radius:var(--r);border:1px solid var(--border)">
              <div style="text-align:center">
                <div style="font-size:var(--fs-sm);font-weight:900;color:${p1Col}">${A}</div>
                <div style="font-size:10px;color:var(--gray-l)">${p1Obj.univ||''}</div>
              </div>
              <div id="__iem_score" style="font-size:28px;font-weight:900;letter-spacing:-2px;color:var(--text)">${p1w0} : ${p2w0}</div>
              <div style="text-align:center">
                <div style="font-size:var(--fs-sm);font-weight:900;color:${p2Col}">${B}</div>
                <div style="font-size:10px;color:var(--gray-l)">${p2Obj.univ||''}</div>
              </div>
            </div>

            <div style="display:flex;flex-direction:column;gap:6px" id="__iem_rows">${_buildGameRows()}</div>

            <div style="display:flex;gap:6px;flex-wrap:wrap">
              <button type="button" onclick="_iem_addA()" style="flex:1;padding:8px;border-radius:8px;border:1.5px dashed ${p1Col};background:${p1Col}11;color:${p1Col};font-size:var(--fs-caption);font-weight:900;cursor:pointer">+ ${A} 승 추가</button>
              <button type="button" onclick="_iem_addB()" style="flex:1;padding:8px;border-radius:8px;border:1.5px dashed ${p2Col};background:${p2Col}11;color:${p2Col};font-size:var(--fs-caption);font-weight:900;cursor:pointer">+ ${B} 승 추가</button>
            </div>
          </div>

          <div style="padding:14px 20px;border-top:1px solid var(--border);display:flex;gap:8px">
            <button type="button" onclick="_iem_close()" style="flex:1;padding:10px;border-radius:var(--r);border:1.5px solid var(--border2);background:var(--surface);font-size:var(--fs-base);font-weight:900;cursor:pointer;color:var(--text2)">취소</button>
            <button type="button" onclick="_iem_save()" style="flex:2;padding:10px;border-radius:var(--r);border:none;background:${typeColor};color:#fff;font-size:var(--fs-base);font-weight:900;cursor:pointer;box-shadow:0 2px 10px ${typeColor}44">💾 저장</button>
          </div>
        </div>`;
      document.body.appendChild(modal);
      modal.addEventListener('click', e=>{ if(e.target===modal) _iem_close(); });
      return true;
    }catch(e){ return false; }
  }


  function _buildFreeGamesFromSession(sess, A, B){
    const games = Array.isArray(sess?.games) ? sess.games : [];
    return games.map(g=>{
      const w = g?.wName || '';
      const winner = (w === A) ? 'A' : (w === B) ? 'B' : '';
      return {
        playerA: A,
        playerB: B,
        winner,
        map: g?.map || ''
      };
    }).filter(g=>g.winner);
  }

  window.openIndSessionEdit = function(sessKey){
    // 인라인 수정 모달 우선 시도
    if(_openInlineEditModal(sessKey, 'ind')) return;
    // 폴백: 탭 이동 방식
    try{
      const s = (window._indSessCache||{})[sessKey];
      if(!s || !Array.isArray(s.games) || !s.games.length) return;
      const A = s.p1 || 'A';
      const B = s.p2 || 'B';
      const sid = (s.games.find(g=>g && g.sid)?.sid) || (s.games[0]? (s.games[0].sid||s.games[0]._id) : '') || '';
      const ids = Array.isArray(s.ids) ? s.ids.slice() : s.games.map(g=>g?g._id:undefined).filter(Boolean);
      const freeGames = _buildFreeGamesFromSession(s, A, B);
      const aObj = (window.players||[]).find(p=>p.name===A) || {};
      const bObj = (window.players||[]).find(p=>p.name===B) || {};
      const memA = {name:A,univ:aObj.univ||'',race:aObj.race||'',tier:aObj.tier||'',gender:aObj.gender||''};
      const memB = {name:B,univ:bObj.univ||'',race:bObj.race||'',tier:bObj.tier||'',gender:bObj.gender||''};
      window.BLD = window.BLD || {};
      window.BLD['ind'] = {
        date: s.d || '',
        membersA: [memA],
        membersB: [memB],
        sets: [],
        noSetMode: true,
        freeGames,
        _editCtx: { mode:'ind', sessKey, sid, ids }
      };
      try{ if(typeof window._indInput!=='undefined'){ window._indInput.playerA=A; window._indInput.playerB=B; window._indInput.date=s.d||''; } }catch(e){}
      try{ window.curTab = 'ind'; }catch(e){}
      try{ if(typeof window._mergedIndSub!=='undefined') window._mergedIndSub = 'ind'; }catch(e){}
      try{ if(typeof window.indSub!=='undefined') window.indSub = 'input'; }catch(e){}
      try{ if(typeof window._syncTabUrlFromState==='function') window._syncTabUrlFromState('replace'); }catch(e){}
      if(typeof window.render==='function') window.render();
    }catch(e){}
  };

  window.openGJSessionEdit = function(sessKey){
    // 인라인 수정 모달 우선 시도
    if(_openInlineEditModal(sessKey, 'gj')) return;
    // 폴백: 탭 이동 방식
    try{
      const s = (window._gjSessCache||{})[sessKey];
      if(!s || !Array.isArray(s.games) || !s.games.length) return;
      const A = s.p1 || 'A';
      const B = s.p2 || 'B';
      const proOnly = !!(s._proOnly || s._proLabel || s.games.find(g=>g && g._proLabel));
      const sid = (s.games.find(g=>g && g.sid)?.sid) || (s.games[0]? (s.games[0].sid||s.games[0]._id) : '') || '';
      const ids = Array.isArray(s.ids) ? s.ids.slice() : s.games.map(g=>g?g._id:undefined).filter(Boolean);
      const freeGames = _buildFreeGamesFromSession(s, A, B);
      const aObj = (window.players||[]).find(p=>p.name===A) || {};
      const bObj = (window.players||[]).find(p=>p.name===B) || {};
      const memA = {name:A,univ:aObj.univ||'',race:aObj.race||'',tier:aObj.tier||'',gender:aObj.gender||''};
      const memB = {name:B,univ:bObj.univ||'',race:bObj.race||'',tier:bObj.tier||'',gender:bObj.gender||''};
      window.BLD = window.BLD || {};
      window.BLD['gj'] = {
        date: s.d || '',
        membersA: [memA],
        membersB: [memB],
        sets: [],
        noSetMode: true,
        freeGames,
        _proLabel: proOnly,
        _editCtx: { mode:'gj', sessKey, sid, ids, proOnly }
      };
      try{ if(typeof window._gjInput!=='undefined'){ window._gjInput.playerA=A; window._gjInput.playerB=B; window._gjInput.date=s.d||''; } }catch(e){}
      try{ window._gjProMode = proOnly; }catch(e){}
      if(proOnly){
        try{ window.curTab = 'pro'; }catch(e){}
        try{ if(typeof window._mergedProSub!=='undefined') window._mergedProSub = 'gj'; }catch(e){}
        try{ if(typeof window.gjSub!=='undefined') window.gjSub = 'input'; }catch(e){}
      } else {
        try{ window.curTab = 'ind'; }catch(e){}
        try{ if(typeof window._mergedIndSub!=='undefined') window._mergedIndSub = 'gj'; }catch(e){}
        try{ if(typeof window.gjSub!=='undefined') window.gjSub = 'input'; }catch(e){}
      }
      try{ if(typeof window._syncTabUrlFromState==='function') window._syncTabUrlFromState('replace'); }catch(e){}
      if(typeof window.render==='function') window.render();
    }catch(e){}
  };

  try{
    window.openIndSessionActionPop = openIndSessionActionPop;
    window.MatchBuilderModules.recordActions = {
      openIndSessionActionPop,
      openIndSessionPopup: window.openIndSessionPopup,
      openGJSessionPopup: window.openGJSessionPopup,
      openIndSessionEdit: window.openIndSessionEdit,
      openGJSessionEdit: window.openGJSessionEdit
    };
  }catch(e){}
})();
