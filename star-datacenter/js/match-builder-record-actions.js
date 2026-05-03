(function(){
  window.MatchBuilderModules = window.MatchBuilderModules || {};

  function openIndSessionActionPop(btn, opts){
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

  try{
    window.openIndSessionActionPop = openIndSessionActionPop;
    window.MatchBuilderModules.recordActions = {
      openIndSessionActionPop,
      openIndSessionPopup: window.openIndSessionPopup,
      openGJSessionPopup: window.openGJSessionPopup
    };
  }catch(e){}
})();
