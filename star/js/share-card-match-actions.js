/* ══════════════════════════════════════
   Share Card Match Actions
══════════════════════════════════════ */
function openRCalMatchShareCard(ds, mi){
  const all=statsFilterMatches(window._rCalAllMatches||[...miniM,...univM,...comps,...ckM,...proM]);
  const dayMatches=all.filter(m=>m.d===ds&&m.sa!=null&&m.sa!=='');
  const m=dayMatches[mi];
  if(!m)return;
  const _mt=ckM.includes(m)?'ck':proM.includes(m)?'pro':(ttM&&ttM.includes(m))?'tt':'';
  const isCKorPro=!!_mt&&_mt!=='';
  window._shareMatchObj={...m, a:isCKorPro?'A팀':(m.a||''), b:isCKorPro?'B팀':(m.b||''), _noUnivIcon:isCKorPro, _matchType:_mt};
  _shareMode='match';
  openShareCardModal();
  setTimeout(()=>{if(window._shareMatchObj)renderShareCardByMatchObj(window._shareMatchObj);},80);
}

function openCalMatchShareCardByCache(ds, mi){
  const matches=window._calDayCache&&window._calDayCache[ds];
  if(!matches||mi>=matches.length)return;
  const m=matches[mi];
  if(!m)return;
  const _mt=ckM.includes(m)?'ck':proM.includes(m)?'pro':(ttM&&ttM.includes(m))?'tt':'';
  const isCKorPro=!!_mt;
  window._shareMatchObj={...m, a:isCKorPro?'A팀':(m.a||''), b:isCKorPro?'B팀':(m.b||''), _noUnivIcon:isCKorPro, _matchType:_mt};
  _shareMode='match';
  openShareCardModal();
  setTimeout(()=>{if(window._shareMatchObj)renderShareCardByMatchObj(window._shareMatchObj);},80);
}

function openCalMatchShareCard(mode, idx){
  const arr=mode==='mini'?miniM:mode==='univm'?univM:mode==='ck'?ckM:mode==='pro'?proM:comps;
  if(!arr||idx<0||idx>=arr.length){
    if(mode==='comp'){
      const tourItems=typeof getTourneyMatches==='function'?getTourneyMatches():[];
      const m=tourItems[idx-comps.length];
      if(m){
        window._shareMatchObj=m;
        _shareMode='match';
        openShareCardModal();
        setTimeout(()=>renderShareCardByMatchObj(window._shareMatchObj),80);
        return;
      }
    }
    return;
  }
  const m=arr[idx];
  if(!m)return;
  const isTypedMode=(mode==='ck'||mode==='pro'||mode==='tt'||mode==='ind'||mode==='gj'||mode==='progj');
  const isTeamTyped=(mode==='ck'||mode==='pro'||mode==='tt');
  window._shareMatchObj={
    ...m,
    a:isTeamTyped?'A팀':(m.a||''),
    b:isTeamTyped?'B팀':(m.b||''),
    _noUnivIcon:isTeamTyped,
    _matchType:isTypedMode?mode:''
  };
  _shareMode='match';
  openShareCardModal();
  setTimeout(()=>{if(window._shareMatchObj)renderShareCardByMatchObj(window._shareMatchObj);},80);
}

function openCompMatchShareCard(tnId, gi, mi){
  const tn=(tourneys||[]).find(t=>t.id===tnId);
  if(!tn)return;
  const grp=tn.groups&&tn.groups[gi];
  if(!grp)return;
  const m=grp.matches&&grp.matches[mi];
  if(!m)return;
  const _mt = tn.type==='tier' ? 'tt' : 'pro';
  const _lbl = grp.stage || grp.name || (tn.type==='tier' ? '티어대회' : '조별리그');
  window._shareMatchObj={
    ...m,
    a:m.a||'',
    b:m.b||'',
    sa:m.sa,
    sb:m.sb,
    d:m.d||'',
    n:tn.name,
    _matchType:_mt,
    _subLabel:(tn.name?`${tn.name} · ${_lbl}`:_lbl),
    _usePlayerPhoto:true,
    _noUnivIcon:false,
    sets:m.sets||[]
  };
  _shareMode='match';
  openShareCardModal();
  setTimeout(()=>renderShareCardByMatchObj(window._shareMatchObj),80);
}

try{
  window.openRCalMatchShareCard = openRCalMatchShareCard;
  window.openCalMatchShareCardByCache = openCalMatchShareCardByCache;
  window.openCalMatchShareCard = openCalMatchShareCard;
  window.__openCompMatchShareCardImpl = openCompMatchShareCard;
  window.openCompMatchShareCard = openCompMatchShareCard;
}catch(e){}
