/* match-builder-rank-utils.js: rebuilt from v126 match-builder.js */
/* 공용 스트리머 선택 유틸은 `js/match-builder-common-ui.js`로 분리됨 */

/* 미니대전 블록은 `js/match-builder-mini.js`로 분리됨 */

/* 개인전 블록은 `js/match-builder-ind.js`로 분리됨 */

/* 끝장전 블록은 `js/match-builder-gj.js`로 분리됨 */

/* 대학CK 블록은 `js/match-builder-ck.js`로 분리됨 */

/* 대학대전 블록은 `js/match-builder-univm.js`로 분리됨 */

/* 끝장전 공유카드 블록은 `js/match-builder-share.js`로 분리됨 */

/* ══════════════════════════════════════
   대학 순위 삭제 (관리자 전용)
══════════════════════════════════════ */
function deleteUnivFromRank(name, mode){
  if(!isLoggedIn) return;
  const label = mode==='univm'?'대학대전':'미니대전';
  if(!confirm(`"${name}" 대학의 모든 ${label} 경기 기록을 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.`)) return;
  if(mode==='univm'){
    univM = univM.filter(m=>m.a!==name&&m.b!==name);
  } else {
    miniM = miniM.filter(m=>m.a!==name&&m.b!==name);
  }
  save(); render();
}
