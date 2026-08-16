let _renderScheduled = false;

function _renderImpl(){
  const C=document.getElementById('rcont');
  const T=document.getElementById('rtitle');
  if(!C||!T)return;
  // 최상위 탭이 바뀌면(버튼 클릭/뒤로가기·앞으로가기/로그인·로그아웃/기록에서 탭 점프 등
  // 경로에 관계없이) 재생 중이던 TTS(라인업/브리핑/리포트 등)를 정지.
  // SUTTS는 싱글톤이라 stop()이 speak() 때 등록해둔 onEnd 정리 콜백을 그대로 실행해주므로
  // 여기 한 곳에서만 처리해도 모든 진입 경로가 커버된다.
  if (window._lastRenderedTopTab !== undefined && window._lastRenderedTopTab !== curTab) {
    if (window.SUTTS && ((window.SUTTS.isSpeaking && window.SUTTS.isSpeaking()) || (window.SUTTS.isPaused && window.SUTTS.isPaused()))) {
      try{ window.SUTTS.stop(); }catch(e){}
    }
    // 라인업 "소개 연출"은 SUTTS 상태와 별개로 자체 재생 플래그로 돌아가므로 최상위 탭이
    // 바뀔 때 별도로 정지시켜준다 (그대로 두면 다른 탭 화면 위로 연출이 계속 남는다).
    try{ if (typeof window._b2LineupStopIntroShow === 'function') window._b2LineupStopIntroShow(); }catch(e){}
  }
  window._lastRenderedTopTab = curTab;
  const farea=document.getElementById('farea');if(farea)farea.innerHTML='';
  document.querySelectorAll('.tab').forEach(b=>{
    const oc=b.getAttribute('onclick')||'';
    const active=oc.includes("'"+curTab+"'");
    b.classList.toggle('on',active);
  });
  // [FIX-NO-REFRESH-ON-REENTRY] sw()로 탭을 바꿀 때뿐 아니라, 백그라운드 클라우드
  // 동기화(다른 브라우저 탭에서 돌아왔을 때 등)처럼 curTab이 그대로 'board2'인
  // 채로 render()가 다시 호출되는 경우에도, 아래 C.innerHTML=''이 프로필탭의
  // 이미지 DOM을 통째로 파괴해버렸다. 여기서도 동일하게 파괴 직전에 떼어서
  // 보관해두면, 화면에 실제 영향을 주는 값이 안 바뀌었을 때 board2-core.js의
  // 복원 로직이 새로 그리지 않고 그대로 재사용한다.
  try{ if (typeof window._b2StashPlayersDom === 'function') window._b2StashPlayersDom(); }catch(e){}
  C.innerHTML='';
  window._compListCache={};
  window._histTourneyCache={};
  window._b2LcHoverStatCache={};
  switch(curTab){
    case 'total':   if(typeof rTotal==='function')   rTotal(C,T);   else C.innerHTML='<div class="empty-state">전체 순위를 불러올 수 없습니다.</div>'; break;
    case 'tier':    if(typeof rTier==='function')    rTier(C,T);    else C.innerHTML='<div class="empty-state">티어 순위표를 불러올 수 없습니다.</div>'; break;
    case 'hist':    if(typeof rHist==='function')    rHist(C,T);    else C.innerHTML='<div class="empty-state">대전 기록을 불러올 수 없습니다.</div>'; break;
    case 'ind': case 'gj':               rMergedInd(C,T);   break;
    case 'mini': case 'univm': case 'univck': rMergedUnivM(C,T); break;
    case 'comp': case 'tiertour':        rMergedComp(C,T);  break;
    case 'pro':     rMergedPro(C,T);     break;
    case 'cfg':     if(typeof rCfg==='function')     rCfg(C,T);     else C.innerHTML='<div class="empty-state">설정을 불러올 수 없습니다.</div>'; break;
    case 'stats':
      if(typeof rStats==='function'){
        if(typeof Chart==='undefined'){ window.ensureChartJS().then(()=>render(true)).catch(()=>rStats(C,T)); return; }
        rStats(C,T);
      }else{
        _lazyRunWithFallback(_ensureStatsLoaded, C, T, '통계', '통계 모듈을 불러오는 중...');
      }
      break;
    case 'cal':
      if(typeof rCal==='function'){
        rCal(C,T);
      }else{
        _lazyRunWithFallback(_ensureCalendarLoaded, C, T, '캘린더', '캘린더 모듈을 불러오는 중...');
      }
      break;
    case 'roulette':
      if(typeof rRoulette==='function'){
        rRoulette(C,T);
      }else{
        _lazyRunWithFallback(_ensureRouletteLoaded, C, T, '룰렛/게임', '룰렛/게임 기능을 불러오는 중... (최초 1회만 로드됩니다)');
      }
      break;
    case 'vote':
      if(typeof rVote==='function'){
        rVote(C,T);
      }else{
        _lazyRunWithFallback(_ensureVoteLoaded, C, T, '투표', '투표 모듈을 불러오는 중...');
      }
      break;
    case 'board':
      if(typeof rBoard==='function'){
        rBoard(C,T);
      }else{
        _lazyRunWithFallback(_ensureCloudBoardLoaded, C, T, '현황판', '현황판 모듈을 불러오는 중...');
      }
      break;
    case 'board2':  if(typeof rBoard2==='function')  rBoard2(C,T);  else C.innerHTML='<div class="empty-state">현황판을 불러올 수 없습니다.</div>'; break;
    case 'elboard':
      if(typeof rElboard==='function'){
        rElboard(C,T);
      }else{
        _lazyRunWithFallback(_ensureElboardLoaded, C, T, 'ELO 현황판', 'ELO 현황판 모듈을 불러오는 중...');
      }
      break;
    default: break;
  }
  // [FIX-6] CSS scale/theme 적용: 매 render마다 호출하지 않고 _applyScaleSettings()로 묶음.
  // 이 함수는 sw() 끝과 save() 끝에서만 호출한다. render-core.js에서의 직접 호출은 제거.
  // (sw/save에서 호출하지 않는 경우의 안전망으로 첫 render에 한 번만 실행)
  if(!window.__scaleSettingsApplied){
    window.__scaleSettingsApplied = true;
    try{ window._applyScaleSettings && window._applyScaleSettings(); }catch(e){}
  }
  injectUnivIcons(C);
  try{
    const sl = C.querySelector('.streamer-focus-list');
    if(sl && window._streamerFocusScrollTop != null){
      sl.scrollTop = window._streamerFocusScrollTop;
    }
  }catch(e){}
  requestAnimationFrame(()=>{
    C.querySelectorAll('.rec-summary').forEach(el=>{
      const header=el.querySelector('.rec-sum-header');
      if(!header||header.innerText.trim()==='')el.remove();
    });
    injectUnivIcons(C);
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
    // [FIX-8] _restoreFocus 중복 호출 제거: 첫 rAF 안에서 1회만 실행.
    // 두 번째 rAF(한 프레임 뒤)는 부수 작업(dragScroll, iconify 등)만 담당.
    _restoreFocus();
    requestAnimationFrame(()=>{
      try{ window.enableDragScroll && window.enableDragScroll(); }catch(e){}
      try{ window.iconifyUI && window.iconifyUI(C); }catch(e){}
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
  // [FIX-16] render(true)도 rAF 배치 큐에 합류.
  // 기존: render(true) → 즉시 동기 실행 → 여러 lazy 모듈이 동시 완료 시 중복 렌더
  // 변경: _renderScheduled 플래그로 같은 프레임 내 중복 방지.
  // 단, 이미 rAF가 예약된 상태라면 추가 스케줄 없이 기존 것으로 처리.
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

// [FIX-6] CSS scale/theme 적용 통합 헬퍼.
// render() 내부에서 제거하고, sw()와 save() 끝에서 호출 → 탭 전환/저장 시에만 CSS 변수 재계산.
window._applyScaleSettings = function(){
  try{ window._applyRecCardTheme && window._applyRecCardTheme(); }catch(e){}
  try{ window.applyRecLayoutScale && window.applyRecLayoutScale(); }catch(e){}
  try{ window.applyMatchBtnScale && window.applyMatchBtnScale(); }catch(e){}
  try{ window.applyRecMemBtnScale && window.applyRecMemBtnScale(); }catch(e){}
  try{ window.applyRecVsGap && window.applyRecVsGap(); }catch(e){}
  try{ window.applyTourneyTeamBtnScale && window.applyTourneyTeamBtnScale(); }catch(e){}
  try{ window.applyTourneyTeamBtnDetailScale && window.applyTourneyTeamBtnDetailScale(); }catch(e){}
  try{ window.applyTourneyMemBtnScale && window.applyTourneyMemBtnScale(); }catch(e){}
  try{ window.applyTourneyVsGap && window.applyTourneyVsGap(); }catch(e){}
  try{ window.applyStreamerCardGap && window.applyStreamerCardGap(); }catch(e){}
  try{ window.applyTierCardGap && window.applyTierCardGap(); }catch(e){}
  try{ window.applyScoreColors && window.applyScoreColors(); }catch(e){}
  try{ window._applyTourneyCardTheme && window._applyTourneyCardTheme(); }catch(e){}
  try{ window._applyHeaderSettings && window._applyHeaderSettings(); }catch(e){}
  try{ window.applyProfileShapeVars && window.applyProfileShapeVars(); }catch(e){}
};
// sw() 호출 시 다음 render에서 첫 1회 플래그 초기화 (탭 전환 시 재적용)
window._resetScaleSettingsFlag = function(){ window.__scaleSettingsApplied = false; };

try{
  window.render = render;
}catch(e){}
