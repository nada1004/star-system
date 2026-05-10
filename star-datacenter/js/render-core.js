let _renderScheduled = false;

function _renderImpl(){
  const C=document.getElementById('rcont');
  const T=document.getElementById('rtitle');
  if(!C||!T)return;
  const farea=document.getElementById('farea');if(farea)farea.innerHTML='';
  document.querySelectorAll('.tab').forEach(b=>{
    const oc=b.getAttribute('onclick')||'';
    const active=oc.includes("'"+curTab+"'");
    b.classList.toggle('on',active);
  });
  C.innerHTML='';
  window._compListCache={};
  window._histTourneyCache={};
  switch(curTab){
    case 'total':   if(typeof rTotal==='function')   rTotal(C,T);   else C.innerHTML='<div class="empty-state">전체 순위를 불러올 수 없습니다.</div>'; break;
    case 'tier':    if(typeof rTier==='function')    rTier(C,T);    else C.innerHTML='<div class="empty-state">티어 순위표를 불러올 수 없습니다.</div>'; break;
    case 'hist':    if(typeof rHist==='function')    rHist(C,T);    break;
    case 'ind': case 'gj':               rMergedInd(C,T);   break;
    case 'mini': case 'univm': case 'univck': rMergedUnivM(C,T); break;
    case 'comp': case 'tiertour':        rMergedComp(C,T);  break;
    case 'pro':     rMergedPro(C,T);     break;
    case 'cfg':     if(typeof rCfg==='function')     rCfg(C,T);     break;
    case 'stats':
      if(typeof rStats==='function'){
        if(typeof Chart==='undefined'){ window.ensureChartJS().then(()=>render(true)).catch(()=>rStats(C,T)); return; }
        rStats(C,T);
      }else{
        _lazyLoadingView(T,C,'통계','통계 모듈을 불러오는 중...');
        (async()=>{ try{ await _ensureStatsLoaded(); render(true); }catch(e){ console.error('[lazy] stats load fail', e); } })();
      }
      break;
    case 'cal':
      if(typeof rCal==='function'){
        rCal(C,T);
      }else{
        _lazyLoadingView(T,C,'캘린더','캘린더 모듈을 불러오는 중...');
        (async()=>{ try{ await _ensureCalendarLoaded(); render(true); }catch(e){ console.error('[lazy] calendar load fail', e); } })();
      }
      break;
    case 'roulette':
      if(typeof rRoulette==='function'){
        rRoulette(C,T);
      }else{
        T.textContent = '룰렛';
        C.innerHTML = '<div class="empty-state"><div class="empty-state-icon">⏳</div><div class="empty-state-title">룰렛 기능 로딩 중...</div><div class="empty-state-desc">최초 1회만 로드됩니다.</div></div>';
        (async()=>{
          try{
            await _ensureRouletteLoaded();
            render(true);
          }catch(e){
            console.error('[lazy] roulette load fail', e);
            C.innerHTML = '<div class="empty-state"><div class="empty-state-icon">⚠️</div><div class="empty-state-title">룰렛 로딩 실패</div><div class="empty-state-desc">콘솔 에러를 확인해주세요.</div></div>';
          }
        })();
      }
      break;
    case 'vote':
      if(typeof rVote==='function'){
        rVote(C,T);
      }else{
        _lazyLoadingView(T,C,'투표','투표 모듈을 불러오는 중...');
        (async()=>{ try{ await _ensureVoteLoaded(); render(true); }catch(e){ console.error('[lazy] vote load fail', e); } })();
      }
      break;
    case 'board':
      if(typeof rBoard==='function'){
        rBoard(C,T);
      }else{
        _lazyLoadingView(T,C,'현황판','현황판 모듈을 불러오는 중...');
        (async()=>{ try{ await _ensureCloudBoardLoaded(); render(true); }catch(e){ console.error('[lazy] board load fail', e); } })();
      }
      break;
    case 'board2':  if(typeof rBoard2==='function')  rBoard2(C,T);  else C.innerHTML='<div class="empty-state">현황판을 불러올 수 없습니다.</div>'; break;
    case 'elboard':
      if(typeof rElboard==='function'){
        rElboard(C,T);
      }else{
        _lazyLoadingView(T,C,'ELO 현황판','ELO 현황판 모듈을 불러오는 중...');
        (async()=>{ try{ await _ensureElboardLoaded(); render(true); }catch(e){ console.error('[lazy] elboard load fail', e); } })();
      }
      break;
    default: break;
  }
  try{ window._applyRecCardTheme && window._applyRecCardTheme(); }catch(e){}
  try{ window.applyMatchBtnScale && window.applyMatchBtnScale(); }catch(e){}
  try{ window.applyRecMemBtnScale && window.applyRecMemBtnScale(); }catch(e){}
  try{ window.applyRecVsGap && window.applyRecVsGap(); }catch(e){}
  try{ window.applyTourneyTeamBtnScale && window.applyTourneyTeamBtnScale(); }catch(e){}
  try{ window.applyTourneyTeamBtnDetailScale && window.applyTourneyTeamBtnDetailScale(); }catch(e){}
  try{ window.applyTourneyMemBtnScale && window.applyTourneyMemBtnScale(); }catch(e){}
  try{ window.applyTourneyVsGap && window.applyTourneyVsGap(); }catch(e){}
  try{ window.applyScoreColors && window.applyScoreColors(); }catch(e){}
  try{ window._applyTourneyCardTheme && window._applyTourneyCardTheme(); }catch(e){}
  try{ window._applyHeaderSettings && window._applyHeaderSettings(); }catch(e){}
  injectUnivIcons(C);
  try{ window.iconifyUI && window.iconifyUI(document.body); }catch(e){}
  requestAnimationFrame(()=>{
    C.querySelectorAll('.rec-summary').forEach(el=>{
      const header=el.querySelector('.rec-sum-header');
      if(!header||header.innerText.trim()==='')el.remove();
    });
    injectUnivIcons(C);
    try{ window.iconifyUI && window.iconifyUI(document.body); }catch(e){}
    const _restoreFocus=()=>{
      if(window._searchFocusId){
        const el=document.getElementById(window._searchFocusId);
        if(el){el.focus();el.setSelectionRange(el.value.length,el.value.length);return;}
      }
      if(window._recQ){
        Object.keys(window._recQ).forEach(mode=>{
          if(!window._recQ[mode]) return;
          const el=document.getElementById('rq-'+mode);
          if(el&&document.activeElement!==el){el.focus();el.setSelectionRange(el.value.length,el.value.length);}
        });
      }
      const tsi=document.getElementById('total-search');
      if(tsi&&typeof totalSearch!=='undefined'&&totalSearch&&document.activeElement!==tsi){tsi.focus();tsi.setSelectionRange(tsi.value.length,tsi.value.length);}
    };
    _restoreFocus();
    requestAnimationFrame(()=>{
      _restoreFocus();
      try{ window.enableDragScroll && window.enableDragScroll(); }catch(e){}
      try{ window.iconifyUI && window.iconifyUI(document.body); }catch(e){}
      try{
        document.querySelectorAll('#rcont table input[type="checkbox"]').forEach(cb=>{
          cb.onchange = function(){
            const tr = cb.closest('tr');
            if(tr) tr.classList.toggle('is-selected', cb.checked);
          };
          const tr = cb.closest('tr');
          if(tr) tr.classList.toggle('is-selected', cb.checked);
        });
      }catch(e){}
      try{ if(typeof window._syncTabUrlFromState==='function') window._syncTabUrlFromState(); }catch(e){}
      try{ if(typeof window._applyDeepLinkFromUrl==='function') window._applyDeepLinkFromUrl(); }catch(e){}
    });
  });
}

window.renderNow = window.renderNow || _renderImpl;

function render(immediate){
  if(immediate===true) return window.renderNow();
  if(_renderScheduled) return;
  _renderScheduled = true;
  requestAnimationFrame(()=>{
    _renderScheduled = false;
    try{ window.renderNow(); }catch(e){
      console.error('[render] fail', e);
      try{
        if(typeof window._showGlobalAppError === 'function'){
          window._showGlobalAppError(`렌더링 오류: ${(e&&e.message)||'알 수 없는 오류'}`, { renderFallback:true });
        }
      }catch(_){}
    }
  });
}

try{
  window.render = render;
}catch(e){}
