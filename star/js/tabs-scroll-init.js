// 새로고침 시 탭 가로 스크롤/레이아웃 복원으로 인한 '잠깐 바뀜' 방지
(function () {
  try {
    var t = document.querySelector('.tabs');
    if (t) t.scrollLeft = 0;
  } catch (e) {}
})();
