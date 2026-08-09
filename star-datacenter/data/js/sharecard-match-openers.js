(function(){
  function openRCalMatchShareCard(ds, mi){
    const all=statsFilterMatches(window._rCalAllMatches||[...miniM,...univM,...comps,...ckM,...proM]);
    const dayMatches=all.filter(m=>m.d===ds&&m.sa!=null&&m.sa!=='');
    const m=dayMatches[mi];
    if(!m)return;
    const _mt=ckM.includes(m)?'ck':proM.includes(m)?'pro':(ttM&&ttM.includes(m))?'tt':'';
    const isCKorPro=!!_mt&&_mt!=='';
    const _payload={...m, a:isCKorPro?'A팀':(m.a||''), b:isCKorPro?'B팀':(m.b||''), _noUnivIcon:isCKorPro, _matchType:_mt};
    if(typeof window._openShareMatchObjCard==='function') window._openShareMatchObjCard(_payload);
  }

  function openCalMatchShareCardByCache(ds, mi){
    const matches=window._calDayCache&&window._calDayCache[ds];
    if(!matches||mi>=matches.length)return;
    const m=matches[mi];
    if(!m)return;
    const _mt=ckM.includes(m)?'ck':proM.includes(m)?'pro':(ttM&&ttM.includes(m))?'tt':'';
    const isCKorPro=!!_mt;
    const _payload={...m, a:isCKorPro?'A팀':(m.a||''), b:isCKorPro?'B팀':(m.b||''), _noUnivIcon:isCKorPro, _matchType:_mt};
    if(typeof window._openShareMatchObjCard==='function') window._openShareMatchObjCard(_payload);
  }

  function openCalMatchShareCard(mode, idx){
    const arr=mode==='mini'?miniM:mode==='univm'?univM:mode==='ck'?ckM:mode==='pro'?proM:comps;
    if(!arr||idx<0||idx>=arr.length){
      if(mode==='comp'){
        const tourItems=typeof getTourneyMatches==='function'?getTourneyMatches():[];
        const m=tourItems[idx-comps.length];
        if(m){
          if(typeof window._openShareMatchObjCard==='function') window._openShareMatchObjCard(m);
          return;
        }
      }
      return;
    }
    const m=arr[idx];
    if(!m)return;
    const isCKorPro=(mode==='ck'||mode==='pro'||mode==='tt');
    const _miniType = mode==='mini' ? (((m&&m.type)||'mini')==='civil' ? 'civil' : 'mini') : '';
    const _matchType = isCKorPro ? mode : (mode==='univm' ? 'univm' : _miniType);
    const _payload={...m, a:isCKorPro?'A팀':(m.a||''), b:isCKorPro?'B팀':(m.b||''), _noUnivIcon:isCKorPro, _matchType:_matchType};
    if(typeof window._openShareMatchObjCard==='function') window._openShareMatchObjCard(_payload);
  }

  window.openRCalMatchShareCard = openRCalMatchShareCard;
  window.openCalMatchShareCardByCache = openCalMatchShareCardByCache;
  window.openCalMatchShareCard = openCalMatchShareCard;
})();
