/* ══════════════════════════════════════════════════════════════
   선수(전체) - 티어랭크 이력 이동 (players-streamer-views.js 에서 분리, 2026-07-30)
   ══════════════════════════════════════════════════════════════ */

function tierRankGoHist(modeId, playerName){
  const mode=(modeId||'').toLowerCase();
  let type='전체';
  if(mode.startsWith('mini_')||mode.startsWith('civ_')) type='mini';
  else if(mode.startsWith('univm_')) type='univm';
  else if(mode.startsWith('ck_')) type='ck';
  else if(mode.startsWith('pro_')) type='pro';
  else if(mode.startsWith('tt_')) type='tt';
  else if(mode.startsWith('ind_')) type='ind';
  else if(mode.startsWith('gj_')) type='gj';
  else if(mode.startsWith('comp_')) type='tourney';
  if(!window._recQ) window._recQ={};
  window._recQ['all']=playerName||'';
  window._recTypeFilter=type;
  curTab='hist';
  histSub='all';
  openDetails={};
  if(window.histPage && window.histPage['all']!==undefined) window.histPage['all']=0;
  render();
}

/* ══════════════════════════════════════
   티어 순위표
══════════════════════════════════════ */
