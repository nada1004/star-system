/* ══════════════════════════════════════
   Render Share Basic Openers
══════════════════════════════════════ */
function openBoardUnivShareCard(univName){
  if(!univName||univName==='전체')return;
  _shareMode='univ';
  _shareUnivSearch=univName;
  _shareEnsureStatsAndOpen().then((ok)=>{
    if(!ok) return;
    openShareCardModal();
    setTimeout(()=>{ try{ if(typeof window.renderShareCardByUniv==='function') window.renderShareCardByUniv(univName); }catch(e){} },80);
  });
}

async function openShareCardFromPlayer(){
  const st = (typeof getPlayerDetailState==='function') ? getPlayerDetailState() : (window.PlayerDetailState||{});
  const name=st.currentName;
  if(!name)return;
  cm('playerModal');
  _shareMode='player';
  _sharePlayerSearch=name;
  const ok = await _shareEnsureStatsAndOpen();
  if(!ok) return;
  openShareCardModal();
  setTimeout(()=>{ try{ if(typeof window.renderShareCardByPlayer==='function') window.renderShareCardByPlayer(name); }catch(e){} },80);
}

async function openShareCardFromUniv(){
  const st = (typeof getUnivDetailState==='function') ? getUnivDetailState() : (window.UnivDetailState||{});
  const name=st.currentName;
  if(!name)return;
  cm('univModal');
  _shareMode='univ';
  _shareUnivSearch=name;
  const ok = await _shareEnsureStatsAndOpen();
  if(!ok) return;
  openShareCardModal();
  setTimeout(()=>{ try{ if(typeof window.renderShareCardByUniv==='function') window.renderShareCardByUniv(name); }catch(e){} },80);
}

try{
  window.openBoardUnivShareCard = openBoardUnivShareCard;
  window.openShareCardFromPlayer = openShareCardFromPlayer;
  window.openShareCardFromUniv = openShareCardFromUniv;
}catch(e){}
