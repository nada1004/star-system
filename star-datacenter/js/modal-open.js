/* 기본 모달 열기/닫기 함수 */
window.om = function(id) {
  const el = document.getElementById(id);
  if(el) el.style.display = 'flex';
};

window.cm = function(id) {
  const el = document.getElementById(id);
  if(el) el.style.display = 'none';
};
