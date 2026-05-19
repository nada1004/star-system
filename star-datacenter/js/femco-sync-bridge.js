/**
 * femco-sync-bridge.js
 * su_ 접두사 없이 저장되는 펨코 현황판 키들을
 * Firebase 동기화 대상(su_*)에 자동 미러링
 *
 * 대상 키:
 *   b2_femco_settings_v1  → su_b2_femco_settings_v1  (대학 배경 이미지 등 레이아웃 설정)
 *   cfg_femco_univ        → su_cfg_femco_univ         (현재 선택 대학)
 */
(function () {
  const MIRROR_MAP = {
    'b2_femco_settings_v1': 'su_b2_femco_settings_v1',
    'cfg_femco_univ':       'su_cfg_femco_univ',
  };

  const _origSet = localStorage.setItem.bind(localStorage);
  const _origRem = localStorage.removeItem.bind(localStorage);

  // ── 쓰기 시 미러링 ──────────────────────────────────────────
  localStorage.setItem = function (k, v) {
    const r = _origSet(k, v);
    const mirrorKey = MIRROR_MAP[k];
    if (mirrorKey) {
      try { _origSet(mirrorKey, v); } catch(e) {}
      console.log('[femco-bridge] 미러링:', k, '→', mirrorKey);
    }
    return r;
  };

  // ── 삭제 시 미러도 삭제 ────────────────────────────────────
  localStorage.removeItem = function (k) {
    const r = _origRem(k);
    const mirrorKey = MIRROR_MAP[k];
    if (mirrorKey) {
      try { localStorage.removeItem(mirrorKey); } catch(e) {}
    }
    return r;
  };

  // ── 페이지 로드 시 현재 값 즉시 미러링 ───────────────────
  Object.entries(MIRROR_MAP).forEach(([src, dst]) => {
    try {
      const v = localStorage.getItem(src);
      if (v !== null) _origSet(dst, v);
    } catch(e) {}
  });

  // ── 다른 기기에서 동기화된 su_ 값을 원본 키에 역방향 적용 ─
  // (동기화 pull 완료 후 su_b2_femco_settings_v1 → b2_femco_settings_v1 로 복원)
  const REVERSE_MAP = Object.fromEntries(
    Object.entries(MIRROR_MAP).map(([src, dst]) => [dst, src])
  );

  window.femcoBridgeApplyFromSync = function () {
    Object.entries(REVERSE_MAP).forEach(([suKey, origKey]) => {
      try {
        const v = localStorage.getItem(suKey);
        if (v !== null) {
          _origSet(origKey, v);
          console.log('[femco-bridge] 역방향 적용:', suKey, '→', origKey);
        }
      } catch(e) {}
    });
    // 화면 재렌더링
    try { if (typeof renderFemcoBoard === 'function') renderFemcoBoard(); } catch(e) {}
    try { if (typeof renderBoard === 'function') renderBoard(); } catch(e) {}
    try { if (typeof render === 'function') render(); } catch(e) {}
  };

  console.log('[femco-bridge] 초기화 완료');
})();
