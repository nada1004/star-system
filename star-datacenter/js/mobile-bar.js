// 모바일에서 mobileActionBar 표시
(function(){
  function checkMobile(){
    const bar=document.getElementById('mobileActionBar');
    if(bar) bar.style.display=window.innerWidth<=768?'flex':'none';
  }
  checkMobile();
  window.addEventListener('resize',checkMobile);
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
  const el=document.querySelector('.tab[onclick*="\''+tabId+'\'"]')
         ||document.querySelector('.tab[onclick*=\'"'+tabId+'"\']');
  if(el&&typeof sw==='function') sw(tabId,el);
}
// FAB 외부 클릭 시 닫기
document.addEventListener('click',function(e){
  if(_fabOpen&&!e.target.closest('#mobileFab')) closeFab();
});

/* ══════════════════════════════════════
   📱 스와이프 탭 전환
══════════════════════════════════════ */
(function(){
  // 탭 순서 (sw 함수에 쓰이는 id)
  var TAB_IDS=['total','board2','tier','hist','ind','univm','comp','pro','stats','cal','cfg'];
  var _swX=0,_swY=0,_swActive=false;
  var rcont=document.getElementById('rcont')||document.querySelector('.main');
  if(!rcont)return;

  rcont.addEventListener('touchstart',function(e){
    if(e.touches.length!==1)return;
    _swX=e.touches[0].clientX;
    _swY=e.touches[0].clientY;
    _swActive=true;
  },{passive:true});

  rcont.addEventListener('touchend',function(e){
    if(!_swActive||e.changedTouches.length!==1){_swActive=false;return;}
    var dx=e.changedTouches[0].clientX-_swX;
    var dy=e.changedTouches[0].clientY-_swY;
    _swActive=false;
    // 가로 스와이프 조건: |dx|>60, |dx|>|dy|*1.5
    if(Math.abs(dx)<60||Math.abs(dx)<Math.abs(dy)*1.5)return;
    // 스크롤 가능한 요소 내에서는 무시
    var t=e.target;
    while(t&&t!==rcont){
      var style=window.getComputedStyle(t);
      var ox=style.overflowX;
      if((ox==='auto'||ox==='scroll')&&t.scrollWidth>t.clientWidth+4){return;}
      t=t.parentElement;
    }
    var cur=typeof curTab!=='undefined'?curTab:'total';
    var idx=TAB_IDS.indexOf(cur);
    if(idx<0)return;
    var next=dx<0?Math.min(idx+1,TAB_IDS.length-1):Math.max(idx-1,0);
    if(next===idx)return;
    var targetId=TAB_IDS[next];
    var el=document.querySelector('.tab[onclick*="\''+targetId+'\'"]');
    if(el&&typeof sw==='function') sw(targetId,el);
  },{passive:true});
})();

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
