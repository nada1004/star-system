// ─── App Namespace ─────────────────────────────────────────────────────────────
// 전역 변수 충돌 방지를 위한 네임스페이스 구조
(function() {
  'use strict';

  window.App = {
    // 데이터 관리
    data: {
      players: [],
      univCfg: [],
      miniM: [],
      univM: [],
      comps: [],
      ckM: [],
      proM: [],
      ttM: [],
      tourneys: [],
      proTourneys: [],
      isLoggedIn: false
    },

    // UI 상태
    ui: {
      currentTab: 'total',
      searchQuery: '',
      filters: {}
    },

    // 매치 관련
    match: {
      pasteMode: 'game',
      pasteResults: null,
      pasteErrors: null
    },

    // 티어 대회 관련
    tier: {
      migrated: false,
      grpPasteState: null
    },

    // 설정 관련
    settings: {
      fabTabSettings: {},
      fabVisibility: {}
    },

    // 유틸리티
    utils: {
      // 전역 변수에서 네임스페이스로 마이그레이션
      migrateGlobals: function() {
        // 기존 전역 변수를 App 네임스페이스로 이동
        if (typeof players !== 'undefined') App.data.players = players;
        if (typeof univCfg !== 'undefined') App.data.univCfg = univCfg;
        if (typeof miniM !== 'undefined') App.data.miniM = miniM;
        if (typeof univM !== 'undefined') App.data.univM = univM;
        if (typeof comps !== 'undefined') App.data.comps = comps;
        if (typeof ckM !== 'undefined') App.data.ckM = ckM;
        if (typeof proM !== 'undefined') App.data.proM = proM;
        if (typeof ttM !== 'undefined') App.data.ttM = ttM;
        if (typeof tourneys !== 'undefined') App.data.tourneys = tourneys;
        if (typeof proTourneys !== 'undefined') App.data.proTourneys = proTourneys;
        if (typeof isLoggedIn !== 'undefined') App.data.isLoggedIn = isLoggedIn;
        if (typeof currentTab !== 'undefined') App.ui.currentTab = currentTab;
        if (typeof _ttMigrated !== 'undefined') App.tier.migrated = _ttMigrated;
        if (typeof _grpPasteState !== 'undefined') App.tier.grpPasteState = _grpPasteState;
      },

      // 안전한 전역 변수 접근
      getGlobal: function(name, defaultValue) {
        return typeof window[name] !== 'undefined' ? window[name] : defaultValue;
      },

      // 전역 변수 설정 (마이그레이션용)
      setGlobal: function(name, value) {
        window[name] = value;
      }
    }
  };

  // 초기화 시 전역 변수 마이그레이션
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      setTimeout(() => App.utils.migrateGlobals(), 100);
    });
  } else {
    setTimeout(() => App.utils.migrateGlobals(), 100);
  }
})();
