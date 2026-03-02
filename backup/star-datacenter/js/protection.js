// ── 소스코드 보호 ──────────────────────────────────────────
(function(){
  // 우클릭 방지
  document.addEventListener('contextmenu',function(e){e.preventDefault();});
  // F12, Ctrl+Shift+I, Ctrl+U, Ctrl+S, Ctrl+Shift+J, Ctrl+Shift+C 차단
  document.addEventListener('keydown',function(e){
    if(
      e.key==='F12'||
      (e.ctrlKey&&e.shiftKey&&['I','i','J','j','C','c'].includes(e.key))||
      (e.ctrlKey&&['U','u','S','s'].includes(e.key))
    ){e.preventDefault();e.stopPropagation();return false;}
  });
})();