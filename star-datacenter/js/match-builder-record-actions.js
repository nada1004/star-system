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

  try{
    window.openIndSessionActionPop = openIndSessionActionPop;
    window.MatchBuilderModules.recordActions = {
      openIndSessionActionPop,
      openIndSessionPopup: window.openIndSessionPopup,
      openGJSessionPopup: window.openGJSessionPopup
    };
  }catch(e){}
})();
