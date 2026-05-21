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

  // ✅ 기록 카드(⋯)의 "수정"은 상세 팝업이 아니라 "경기 수정(입력) 화면"으로 진입해야 함
  // - 개인전/끝장전/프로리그 끝장전 공통
  // - 기존 기록 세션의 games를 BLD[mode].freeGames로 변환해 입력 UI에 프리필
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

  window.openIndSessionEdit = window.openIndSessionEdit || function(sessKey){
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
      // 탭 이동
      try{ window.curTab = 'ind'; }catch(e){}
      try{ if(typeof window._mergedIndSub!=='undefined') window._mergedIndSub = 'ind'; }catch(e){}
      try{ if(typeof window.indSub!=='undefined') window.indSub = 'input'; }catch(e){}
      try{ if(typeof window._syncTabUrlFromState==='function') window._syncTabUrlFromState('replace'); }catch(e){}
      if(typeof window.render==='function') window.render();
    }catch(e){}
  };

  window.openGJSessionEdit = window.openGJSessionEdit || function(sessKey){
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

      // 탭 이동 (프로 끝장전이면 프로리그 탭의 "프로 끝장전"으로)
      try{
        if(proOnly){
          window.curTab = 'pro';
          if(typeof window._mergedProSub!=='undefined') window._mergedProSub = 'gj';
        }else{
          window.curTab = 'ind';
          if(typeof window._mergedIndSub!=='undefined') window._mergedIndSub = 'gj';
        }
      }catch(e){}
      try{ if(typeof window.gjSub!=='undefined') window.gjSub = 'input'; }catch(e){}
      try{ window._gjProMode = proOnly; }catch(e){}
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
