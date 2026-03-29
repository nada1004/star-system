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
  const el=document.querySelector('.tab[onclick*="\''+tabId+'\'"]')
         ||document.querySelector('.tab[onclick*=\'"'+tabId+'"\']');
  if(el&&typeof sw==='function') sw(tabId,el);
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
