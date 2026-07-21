# 사용되지 않는 파일 (2026-07-18 정리)

아래 파일들은 `index.html`이나 어떤 lazy-loader(`render-lazy-utils.js`, `render-nav-lazy.js`,
`settings-core.js` 등)에서도 로드되지 않는 것을 확인했습니다. 이름으로 볼 때 모듈이
잘게 쪼개지기 전의 구버전 원본 파일로 추정됩니다 (예: `board2.js` → `board2-core.js` 등
`board2-*.js` 모듈들로 대체, `settings-core.js` → `settings*.js` 계열로 대체).

- board2.js
- pro-comp.js
- tier-tour.js
- settings-core.js
- app-state.js
- history-core.js
- pro-comp-edit.js
- search-core.js
- server.js
- history-idb.js
- lazy-roulette.js
- restore-tt-general.js
- ui-premium-v2.css (1,804줄 — index.html에서도, JS 동적 삽입에서도 참조되지 않음)

**삭제하지 않고 이 폴더로만 이동**시켰습니다. 문제 없이 몇 주 운영되는 걸 확인하시면
완전히 삭제하셔도 되고, 혹시 특정 파일이 실제로 필요했던 것으로 밝혀지면 `js/`로
다시 옮기시면 됩니다.
