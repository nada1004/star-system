// 모바일에서 mobileActionBar 표시 + FAB 설정 반영
(function(){
  function checkMobile(){
    const bar=document.getElementById('mobileActionBar');
    if(bar) bar.style.display=window.innerWidth<=768?'flex':'none';
  }
  checkMobile();
  window.addEventListener('resize',checkMobile);
  // FAB 표시 여부 설정 반영 (PC/모바일 분리)
  updateFabVisibility();
})();

// FAB 표시 여부 업데이트 함수 (PC/모바일 분리)
function updateFabVisibility(){
  const fab=document.getElementById('mobileFab');
  if(!fab)return;
  
  const isMobile=window.innerWidth<=768;
  const hideMobile=localStorage.getItem('su_fabHideMobile')==='1';
  const hidePC=localStorage.getItem('su_fabHidePC')==='1';
  
  if(isMobile){
    fab.style.display=hideMobile?'none':'flex';
  }else{
    fab.style.display=hidePC?'none':'flex';
  }
  // 로그인 상태에 따라 설정 옵션 표시/숨김
  const settingsItem=document.querySelector('.fab-sub-item[onclick*="_fabGo(\'cfg\')"]');
  if(settingsItem){
    settingsItem.style.display=typeof isLoggedIn!=='undefined'&&isLoggedIn?'flex':'none';
  }
}

// 창 크기 변경 시 FAB 표시 여부 재계산
window.addEventListener('resize',updateFabVisibility);

// 페이지 로드 시 FAB 설정 옵션 표시 상태 초기화
window.addEventListener('DOMContentLoaded',updateFabVisibility);

/* ══════════════════════════════════════
   💻 PC 탭 스크롤 화살표
══════════════════════════════════════ */
(function(){
  var tabs=document.querySelector('.tabs');
  if(!tabs)return;
  // 래퍼로 감싸기
  var wrap=document.createElement('div');
  wrap.className='tabs-scroll-wrap no-export';
  tabs.parentNode.insertBefore(wrap,tabs);
  wrap.appendChild(tabs);
  // 화살표 버튼
  var btnL=document.createElement('button');
  btnL.className='tabs-arrow';btnL.innerHTML='&#9664;';btnL.title='이전 탭';
  btnL.addEventListener('click',function(){tabs.scrollBy({left:-200,behavior:'smooth'});});
  var btnR=document.createElement('button');
  btnR.className='tabs-arrow';btnR.innerHTML='&#9654;';btnR.title='다음 탭';
  btnR.addEventListener('click',function(){tabs.scrollBy({left:200,behavior:'smooth'});});
  wrap.insertBefore(btnL,tabs);
  wrap.appendChild(btnR);
  function update(){
    var canL=tabs.scrollLeft>4;
    var canR=tabs.scrollLeft<tabs.scrollWidth-tabs.clientWidth-4;
    btnL.classList.toggle('visible',canL);
    btnR.classList.toggle('visible',canR);
  }
  tabs.addEventListener('scroll',update,{passive:true});
  window.addEventListener('resize',update);
  setTimeout(update,200);
})();

/* ══════════════════════════════════════
   📱 FAB (플로팅 액션 버튼)
══════════════════════════════════════ */
var _fabOpen=false;
function toggleFab(){
  _fabOpen=!_fabOpen;
  const btn=document.getElementById('fabMain');
  const list=document.getElementById('fabSubList');
  if(!btn||!list)return;
  btn.classList.toggle('open',_fabOpen);
  list.classList.toggle('open',_fabOpen);
}
function closeFab(){
  _fabOpen=false;
  const btn=document.getElementById('fabMain');
  const list=document.getElementById('fabSubList');
  if(btn) btn.classList.remove('open');
  if(list) list.classList.remove('open');
}
function _fabGo(tabId){
  if(typeof sw!=='function') return;
  // 탭 버튼 직접 찾기 (onclick 속성 순회)
  let el=null;
  document.querySelectorAll('.tab').forEach(function(b){
    const oc=b.getAttribute('onclick')||'';
    if(oc.indexOf("'"+tabId+"'")!==-1||oc.indexOf('"'+tabId+'"')!==-1) el=b;
  });
  if(el){
    sw(tabId,el);
    setTimeout(function(){window.scrollTo({top:0,behavior:'smooth'});},80);
  }
}
// FAB 외부 클릭 시 닫기
document.addEventListener('click',function(e){
  if(_fabOpen&&!e.target.closest('#mobileFab')) closeFab();
});


/* ══════════════════════════════════════
   📱 대진표 핀치줌
══════════════════════════════════════ */
(function(){
  var _pinchScale=1,_pinchStartDist=0,_pinchEl=null;

  function dist(t){
    var dx=t[0].clientX-t[1].clientX, dy=t[0].clientY-t[1].clientY;
    return Math.sqrt(dx*dx+dy*dy);
  }

  document.addEventListener('touchstart',function(e){
    if(e.touches.length!==2){return;}
    var wrap=e.target.closest('.tour-wrap');
    if(!wrap)return;
    e.preventDefault();
    _pinchEl=wrap.querySelector('.tour-inner')||wrap;
    _pinchStartDist=dist(e.touches);
    var cur=parseFloat(_pinchEl.style.transform&&_pinchEl.style.transform.match(/scale\(([^)]+)\)/)?_pinchEl.style.transform.match(/scale\(([^)]+)\)/)[1]:1)||1;
    _pinchScale=cur;
  },{passive:false});

  document.addEventListener('touchmove',function(e){
    if(e.touches.length!==2||!_pinchEl)return;
    e.preventDefault();
    var ratio=dist(e.touches)/_pinchStartDist;
    var ns=Math.min(Math.max(_pinchScale*ratio,0.4),3);
    _pinchEl.style.transformOrigin='top left';
    _pinchEl.style.transform='scale('+ns+')';
  },{passive:false});

  document.addEventListener('touchend',function(e){
    if(e.touches.length<2&&_pinchEl){
      var cur=parseFloat(_pinchEl.style.transform&&_pinchEl.style.transform.match(/scale\(([^)]+)\)/)?_pinchEl.style.transform.match(/scale\(([^)]+)\)/)[1]:1)||1;
      _pinchScale=cur;
      _pinchEl=null;
    }
  },{passive:true});
})();

/* ══════════════════════════════════════
   📱 현황판 칩 길게 누르기 (longpress → 선수 상세)
══════════════════════════════════════ */
(function(){
  var _lpTimer=null,_lpEl=null;
  var LONG_MS=500;

  document.addEventListener('touchstart',function(e){
    var chip=e.target.closest('.brd-chip');
    if(!chip)return;
    _lpEl=chip;
    _lpTimer=setTimeout(function(){
      if(!_lpEl)return;
      var name=_lpEl.dataset.player;
      if(!name)return;
      // 진동 피드백 (지원 기기)
      if(navigator.vibrate) navigator.vibrate(40);
      // 항상 선수 상세 (관리자도 롱프레스 = 선수보기)
      if(typeof openPlayerModal==='function') openPlayerModal(name);
      _lpEl=null;
    },LONG_MS);
  },{passive:true});

  document.addEventListener('touchmove',function(){
    if(_lpTimer){clearTimeout(_lpTimer);_lpTimer=null;_lpEl=null;}
  },{passive:true});

  document.addEventListener('touchend',function(){
    if(_lpTimer){clearTimeout(_lpTimer);_lpTimer=null;_lpEl=null;}
  },{passive:true});
})();
