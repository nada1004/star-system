// 모바일에서 mobileActionBar 표시
(function(){
  function checkMobile(){
    const bar=document.getElementById('mobileActionBar');
    if(!bar)return;
    bar.style.display=window.innerWidth<=768?'flex':'none';
  }
  checkMobile();
  window.addEventListener('resize',checkMobile);
})();