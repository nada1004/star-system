/**
 * build.mjs — 번들 + 압축 빌드 스크립트
 *
 * 전략:
 *  - 전역 변수(window.xxx) 기반 레거시 코드이므로 ES module import로 묶기 불가
 *  - esbuild의 transform API로 각 파일을 minify 후 concat → 청크 파일 생성
 *  - 청크 분리 기준:
 *      chunk-core.js     : 초기 렌더에 필수인 코어 (config, constants, data, settings, render 등)
 *      chunk-match.js    : 경기 기록 관련 (match-builder, history, competition 등)
 *      chunk-search.js   : 검색/선수 관련
 *      chunk-procomp.js  : 프로대회 관련
 *      chunk-board.js    : 랭킹보드/클라우드보드 관련
 *
 *  - 지연 로딩 대상(stats, chatbot, roulette, calendar, vote, elboard 등)은
 *    별도 lazy-*.js로 빌드 → 기존 _loadScriptOnce 경로와 매핑
 *
 * 사용법:
 *   node build.mjs          → dist/ 폴더에 번들 생성
 *   node build.mjs --watch  → 파일 변경 감지 후 자동 재빌드 (미구현, 추후 확장)
 */

import { transform } from 'esbuild';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC = __dirname;
const DIST = path.join(__dirname, 'dist');

// ──────────────────────────────────────────
// 파일 경로 정의 (index.html의 script 로딩 순서 유지)
// ──────────────────────────────────────────

/**
 * 초기 로딩 필수 코어 번들
 * 146개 script 태그 중 즉시 필요한 파일들
 */
const CORE_FILES = [
  'js/config.js',
  'js/match-store-idb.js',
  'js/constants-core.js',
  'js/constants-ui-vars.js',
  'js/constants-tier-theme.js',
  'js/constants-state.js',
  'js/constants-save.js',
  'js/constants-game.js',
  'js/constants-tab-colors.js',
  'js/constants-player-html.js',
  'js/unified-settings.js',
  'js/tts-common.js',
  'js/modal-open.js',
  'js/modal-drag.js',
  'js/data.js',
  'js/year-utils.js',
  'js/auth-crypto.js',
  'js/auth-remote-sync.js',
  'js/auth-session.js',
  'js/auth-login-flow.js',
  'js/auth-game-edit.js',
  'js/auth-ui-utils.js',
  'js/tab-visibility.js',
  'js/settings-sync/merge.js',
  'js/settings-sync/gist-io.js',
  'js/settings-sync/signal.js',
  'js/settings-store.js',
  'js/settings/design.js',
  'js/settings/profile.js',
  'js/settings/tabs.js',
  'js/settings/team-colors.js',
  'js/settings/sharecard.js',
  'js/settings/index.js',
  'js/tier-tour-migrate.js',
  'js/tier-tour-render.js',
  'js/tier-tour-cfg.js',
  'js/tier-tour-cfg-bulkops.js',
  'js/tier-tour-misc.js',
  'js/settings/font-controls.js',
  'js/settings-base-core.js',
  'js/settings-b2img.js',
  'js/settings-cfg-menu.js',
  'js/settings-color-utils.js',
  'js/settings-h2h-bgpos.js',
  'js/settings-presets.js',
  'js/settings-femco-cfg.js',
  'js/settings-cfg-modal.js',
  'js/settings-cfg-nav.js',
  'js/settings-cfg-view-toggle.js',
  'js/settings-tabvis-render.js',
  'js/settings-cfg-univ-order.js',
  'js/settings-cfg-qa-dryrun.js',
  'js/settings-cfg-search.js',
  'js/settings-cfg-misc.js',
  'js/settings-render-reccard.js',
  'js/settings-render-tourneycard.js',
  'js/settings-render-cards.js',
  'js/settings-render-sec1.js',
  'js/settings-render-sec2.js',
  'js/settings-render-sec3.js',
  'js/settings-render-sec4.js',
  'js/settings-render.js',
  'js/settings-data-gistsync.js',
  'js/settings-data-images.js',
  'js/settings-data-bulkops.js',
  'js/settings-data-uiprefs.js',
  'js/settings-crud-add.js',
  'js/settings-crud-editmodal.js',
  'js/settings-crud-save.js',
  'js/settings-crud-photopos.js',
  'js/settings-crud-recedit.js',
  'js/settings-crud-univ.js',
  'js/settings-map-status.js',
  'js/settings-profile-ui.js',
  'js/settings-match-detail.js',
  'js/settings-player-detail.js',
  'js/settings-univ-detail.js',
  'js/render-lazy-utils.js',
  'js/tab-dom-stash.js',
  'js/render-core.js',
  'js/render-nav-lazy.js',
  'js/render-iconify-ui.js',
  'js/render-capture-core.js',
  'js/render-capture-colorfix.js',
  'js/render-capture-news.js',
  'js/render-capture-poster-minimal.js',
  'js/render-capture-basic.js',
  'js/render-capture-briefing-flow.js',
  'js/render-share-utils.js',
  'js/render-merged-tabs.js',
  'js/render-standalone-utils.js',
  'js/render-player-filters.js',
  'js/stats-player-level.js',
  'js/render-player-header.js',
  'js/render-player-compute.js',
  'js/render-player-style-prep.js',
  'js/render-player-detail.js',
  'js/render-player-detail-modes.js',
  'js/render-player-detail-prep.js',
  'js/render-player-stats.js',
  'js/render-player-recent-history.js',
  'js/render-player-extra-sections.js',
  'js/render-player-history-actions.js',
  'js/render-player-history-prune.js',
  'js/render-player-history-collector.js',
  'js/render-univ-sections.js',
  'js/render-univ-compute.js',
  'js/render-univ-style-prep.js',
  'js/render-univ-detail.js',
  'js/render-univ-detail-modes.js',
  'js/render-univ-recent.js',
  'js/render-univ-actions.js',
  'js/render-player-modal-entry.js',
  'js/render-match-id-prepare.js',
  'js/players-search-state.js',
  'js/vs.js',
  'js/rec-side-profiles.js',
  'js/init-error-banner.js',
  'js/init-bootstrap.js',
  'js/init-theme-apply.js',
  'js/init-card-theme.js',
  'js/fab.js',
  'js/mobile-bar.js',
  'js/firebase-init.js',
];

/** 경기/대전 기록 번들 */
const MATCH_FILES = [
  'js/competition-core.js',
  'js/competition-bracket-seed.js',
  'js/competition-bracket-state.js',
  'js/competition-bracket-views.js',
  'js/competition-player-rank.js',
  'js/competition-detail-modal.js',
  'js/competition-group-records.js',
  'js/competition-bracket-records.js',
  'js/competition-briefing.js',
  'js/competition-bracket-editor.js',
  'js/competition-group-editor.js',
  'js/competition-normal-matches-list.js',
  'js/competition-normal-matches-edit.js',
  'js/competition-normal-matches-detail.js',
  'js/competition-normal-matches-util.js',
  'js/history-share.js',
  'js/history-action-utils.js',
  'js/history-external-utils.js',
  'js/history-external-ui.js',
  'js/history-hist-nav.js',
  'js/history-bulk-map.js',
  'js/history-all-html.js',
  'js/history-tab-alt-views.js',
  'js/history-broadcast-view.js',
  'js/pro-comp-alt-views.js',
  'js/comp-alt-views.js',
  'js/history-tourney-html.js',
  'js/history-univ-stat.js',
  'js/history-render-utils.js',
  'js/history-rec-summary.js',
  'js/history-match-index-core.js',
  'js/history-match-detail-byid.js',
  'js/history-match-detail-fromhist.js',
  'js/history-match-detail-html.js',
  'js/history-psearch.js',
  'js/history-record-list.js',
  'js/history-detail-modal.js',
  'js/history-procomp-tab.js',
  'js/match.js',
  'js/match-builder.js',
  'js/match-builder-core-tabs.js',
  'js/match-builder-common.js',
  'js/match-builder-mini.js',
  'js/match-builder-ck.js',
  'js/match-builder-univ.js',
  'js/match-builder-pro.js',
  'js/match-builder-input-views.js',
  'js/match-builder-bulk-input.js',
  'js/match-builder-ranks.js',
  'js/match-builder-record-actions.js',
  'js/match-builder-record-ops.js',
  'js/match-h2h-session-utils.js',
  'js/match-h2h-panel-utils.js',
  'js/match-h2h-cards-a.js',
  'js/match-h2h-cards-b.js',
  'js/match-ind-records.js',
  'js/match-gj-records.js',
  'js/match-builder-share-legacy.js',
  'js/match-builder-share-entry.js',
];

/** 검색/선수 번들 */
const SEARCH_FILES = [
  'js/players-total-nav.js',
  'js/players-total-render.js',
  'js/players-total-views.js',
  'js/players-total-focus.js',
  'js/players-bulk-merge.js',
  'js/players-tierrank-nav.js',
  'js/players-tier-rank.js',
  'js/search-record-filter.js',
  'js/search-player-match.js',
  'js/search-paste-blocks.js',
  'js/search-paste-line-parser.js',
  'js/search-paste-misc.js',
  'js/search-preview-utils.js',
  'js/search-preview-build.js',
  'js/search-preview-render.js',
  'js/search-paste-edit.js',
  'js/search-paste-apply.js',
  'js/search-elo-cleanup.js',
  'js/search-modals.js',
  'js/search-pro-parse.js',
  'js/search-pro-modal.js',
  'js/search-pro-preview-build.js',
  'js/search-pro-preview-render.js',
  'js/search-pro-apply.js',
];

/** 프로대회 번들 */
const PROCOMP_FILES = [
  'js/pro-comp-sync.js',
  'js/pro-comp-league.js',
  'js/pro-comp-team.js',
  'js/pro-comp-bracket.js',
  'js/pro-comp-stage-merge.js',
  'js/pro-comp-edit-stage.js',
  'js/pro-comp-bkt-init.js',
  'js/pro-comp-bkt-simple-paste.js',
  'js/pro-comp-bkt-edit-modal.js',
  'js/pro-comp-bkt-thirdplace.js',
  'js/pro-comp-grp-edit.js',
  'js/pro-comp-bkt-match-paste.js',
  'js/pro-comp-bkt-paste.js',
  'js/pro-comp-league-paste.js',
  'js/pro-comp-auto-preview.js',
  'js/pro-comp-auto-apply.js',
  'js/pro-comp-match-edit.js',
  'js/pro-comp-bkt-batch.js',
  'js/pro-comp-sub.js',
];

/** 랭킹보드/클라우드보드 번들 */
const BOARD_FILES = [
  'js/sync/cloud-apply.js',
  'js/sync/cloud-status.js',
  'js/cloud-board-state.js',
  'js/cloud-board-render.js',
  'js/cloud-board-drag.js',
  'js/cloud-board-rank-sync.js',
  'js/board2-image-utils.js',
  'js/board2-card-utils.js',
  'js/board2-core.js',
  'js/player-bgm.js',
  'js/board2-univ-views-core.js',
  'js/board2-univ-views-femco.js',
  'js/board2-univ-views-freeboard.js',
  'js/board2-univ-views-cards.js',
  'js/board2-univ-views-lineup.js',
  'js/board2-players-hover.js',
  'js/board2-players-view.js',
  'js/board2-players-main-display.js',
  'js/board2-players-edit-modal.js',
  'js/board2-players-save.js',
  'js/board2-analytics.js',
  'js/board2-live-view.js',
  'js/board2-heatmap-bubble.js',
  'js/board2-briefing-data.js',
  'js/board2-briefing-state.js',
  'js/board2-briefing-view.js',
  'js/board2-briefing-tts.js',
  'js/sync/firebase-github.js',
  'js/sync/firebase-signal.js',
];

/**
 * 지연 로딩 청크 (탭 진입 시 동적으로 로드)
 * render-lazy-utils.js의 _loadScriptOnce 경로와 1:1 매핑
 */
const LAZY_CHUNKS = {
  'lazy-stats.js': [
    'js/sharecard-normalize.js',
    'js/sharecard-theme.js',
    'js/sharecard-team.js',
    'js/stats-core-utils.js',
    'js/stats-tier-rank-utils.js',
    'js/stats-heatmap-utils.js',
    'js/heatmap-day-popup.js',
    'js/stats-period-utils.js',
    'js/stats-period-renderer.js',
    'js/stats-tierwin-renderer.js',
    'js/stats-heatmap-renderer.js',
    'js/stats-maprank-renderer.js',
    'js/stats-promo-sim-renderer.js',
    'js/stats-univmatrix-renderer.js',
    'js/stats-advanced-renderers.js',
    'js/stats-export-utils.js',
    'js/sharecard-runtime.js',
    'js/sharecard-render-entity.js',
    'js/sharecard-render-match-helpers.js',
    'js/sharecard-render-match-score.js',
    'js/sharecard-render-match-layout.js',
    'js/sharecard-render-match-shell.js',
    'js/sharecard-render-match-sections.js',
    'js/sharecard-render-match-context.js',
    'js/sharecard-render-match-utils.js',
    'js/sharecard-render-match-pipeline.js',
    'js/sharecard-match-openers.js',
    'js/stats-core-cache-utils.js',
    'js/stats-core-render.js',
    'js/stats-tier-rank-mini.js',
    'js/stats-star-system-calc.js',
    'js/stats-star-system-html.js',
    'js/stats-overview.js',
    'js/stats-elo.js',
    'js/stats-growth.js',
    'js/stats-award-records.js',
    'js/stats-radar.js',
    'js/stats-univ-compare.js',
    'js/stats-sharecard.js',
    'js/stats-search.js',
    'js/stats-player-report-data.js',
    'js/stats-player-level.js',
    'js/stats-level-rank.js',
    'js/stats-player-report-sections.js',
    'js/stats-player-report-entry.js',
    'js/stats-player-report-canvas.js',
  ],
  'lazy-roulette.js': [
    'js/wheel.js',
    'js/duck-race.js',
    'js/roulette-nav.js',
    'js/roulette-utils.js',
    'js/roulette-ppg-game.js',
    'js/roulette-gc-panel.js',
    'js/roulette-gc-spin.js',
    'js/roulette-ladder.js',
    'js/roulette-marble.js',
    'js/team-match-game.js',
    'js/tier-match-game.js',
    'js/photo-quiz-game.js',
    'js/memory-match-game.js',
    'js/mole-whack-game.js',
    'js/omok-game.js',
    'js/janggi-game.js',
    'js/othello-game.js',
    'js/roulette-teamsplit.js',
    'js/roulette-bracket.js',
  ],
  'lazy-calendar.js': [
    'js/calendar.js',
    'js/calendar-sched.js',
  ],
  'lazy-chatbot.js': [
    'js/chatbot.js',
    'js/chatbot-utils.js',
    'js/chatbot-fuzzy.js',
    'js/chatbot-sync.js',
    'js/chatbot-aibot.js',
    'js/chatbot-formatters.js',
    'js/chatbot-formatters-player-card.js',
    'js/chatbot-formatters-recent.js',
    'js/chatbot-formatters-stats.js',
    'js/chatbot-formatters-matches.js',
    'js/chatbot-formatters-daily.js',
    'js/chatbot-changelog.js',
    'js/chatbot-formatters-records.js',
    'js/chatbot-formatters-search.js',
    'js/chatbot-formatters-tournaments.js',
    'js/chatbot-formatters-univ.js',
    'js/chatbot-formatters-extra.js',
    'js/chatbot-handlers.js',
    'js/chatbot-ui.js',
  ],
  'lazy-elboard.js': [
    'js/elboard.js',
  ],
  'lazy-vote.js': [
    'js/vote.js',
  ],
};

/**
 * index.html <head>에 개별 <link rel="stylesheet"> 로 걸려있는 CSS 파일들.
 * 전부 render-blocking 요청이라 번들 시 하나로 합쳐 요청 수를 줄인다.
 * ⚠️ 캐스케이드(적용 순서)가 곧 우선순위이므로 반드시 index.html에 등장하는 순서를 그대로 유지한다.
 */
const CSS_FILES = [
  'css/style-core.css',
  'css/style-popups.css',
  'css/style-cards.css',
  'css/style-modes.css',
  'css/ui-improvements.css',
  'css/design-improvements.css',
  'css/ui-fix-empty-classes.css',
  'css/ui-custom-v3.css',
  'css/player-detail-design-modes.css',
  'css/univ-detail-design-modes.css',
  'css/match-detail-design-modes.css',
  'css/rec-card-minimal.css',
  'css/history-broadcast-view.css',
  'css/board2-briefing.css',
  'css/tier-rank.css',
  'css/stats-core.css',
  'css/dark-mode-fixes.css',
];



function fmtSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

async function minifyFile(filePath) {
  try {
    const src = fs.readFileSync(filePath, 'utf8');
    const result = await transform(src, {
      // ⚠️ minifyIdentifiers는 절대 켜지 않는다.
      // esbuild의 transform()은 파일 하나하나를 "독립된 프로그램"으로 보고 최적화하기 때문에,
      // 여러 파일이 결국 한 청크 파일(하나의 전역 스코프)로 그대로 이어붙여지는 이 빌드 구조에서는
      // 서로 다른 파일의 top-level let/const/함수가 우연히 같은 축약 이름(a, e, n, J ...)으로
      // 렌더링되어 충돌할 수 있다. 이 경우 "Identifier 'X' has already been declared" 같은
      // 치명적 SyntaxError(청크 전체 실행 중단)나, 선언 순서에 따른
      // "can't access lexical declaration before initialization"(TDZ) 버그가 발생한다.
      // (board2-core.js의 _b2AutoFitResizeBound 오류가 바로 이 문제였다.)
      // whitespace/syntax 최적화만 해도 용량 절감 효과는 충분하고, 원래 이름을 유지하므로
      // 파일 간 이름 충돌 자체가 발생하지 않는다.
      minifyWhitespace: true,
      minifySyntax: true,
      minifyIdentifiers: false,
      target: 'es2017',
      // 전역 변수 기반 코드이므로 tree-shaking 없이 순수 minify만
    });
    return result.code;
  } catch (e) {
    // minify 실패 시 원본 반환 (SyntaxError 방어)
    console.warn(`  ⚠️  minify 실패, 원본 사용: ${path.basename(filePath)} — ${e.message}`);
    return fs.readFileSync(filePath, 'utf8');
  }
}

async function buildChunk(outName, files, overrides) {
  const outPath = path.join(DIST, 'js', outName);
  const parts = [];
  let missing = 0;

  for (const f of files) {
    if (overrides && Object.prototype.hasOwnProperty.call(overrides, f)) {
      parts.push(`/* ${path.basename(f)} (patched) */\n${overrides[f]}`);
      continue;
    }
    const full = path.join(SRC, f);
    if (!fs.existsSync(full)) {
      console.warn(`  ⚠️  파일 없음: ${f}`);
      missing++;
      continue;
    }
    const minified = await minifyFile(full);
    // 파일 구분자 주석 (디버깅용, 한 줄)
    parts.push(`/* ${path.basename(f)} */\n${minified}`);
  }

  const combined = parts.join('\n');
  fs.writeFileSync(outPath, combined, 'utf8');

  const origSize = files
    .map(f => { try { return fs.statSync(path.join(SRC, f)).size; } catch { return 0; } })
    .reduce((a, b) => a + b, 0);
  const newSize = Buffer.byteLength(combined, 'utf8');
  const saved = origSize > 0 ? (((origSize - newSize) / origSize) * 100).toFixed(1) : '?';
  const hash = crypto.createHash('md5').update(combined).digest('hex').slice(0, 10);

  console.log(
    `  ✅ ${outName.padEnd(22)} ${String(files.length - missing).padStart(3)}개 파일  ` +
    `${fmtSize(origSize).padStart(9)} → ${fmtSize(newSize).padStart(9)}  (-${saved}%)`
  );
  return { outName, files: files.length - missing, origSize, newSize, hash };
}

async function buildCssBundle(files) {
  const parts = [];
  let origSize = 0;

  for (const f of files) {
    const full = path.join(SRC, f);
    if (!fs.existsSync(full)) {
      console.warn(`  ⚠️  CSS 파일 없음: ${f}`);
      continue;
    }
    const src = fs.readFileSync(full, 'utf8');
    origSize += Buffer.byteLength(src, 'utf8');
    let out = src;
    try {
      const result = await transform(src, { loader: 'css', minifyWhitespace: true, minifySyntax: true });
      out = result.code;
    } catch (e) {
      console.warn(`  ⚠️  CSS minify 실패, 원본 사용: ${path.basename(f)} — ${e.message}`);
    }
    parts.push(`/* ${path.basename(f)} */\n${out}`);
  }

  const combined = parts.join('\n');
  fs.mkdirSync(path.join(DIST, 'css'), { recursive: true });
  fs.writeFileSync(path.join(DIST, 'css', 'bundle.css'), combined, 'utf8');

  const newSize = Buffer.byteLength(combined, 'utf8');
  const saved = origSize > 0 ? (((origSize - newSize) / origSize) * 100).toFixed(1) : '?';
  console.log(
    `  ✅ ${'bundle.css'.padEnd(22)} ${String(files.length).padStart(3)}개 파일  ` +
    `${fmtSize(origSize).padStart(9)} → ${fmtSize(newSize).padStart(9)}  (-${saved}%)`
  );

  // 내용 기반 해시 → 캐시 버스팅용 버전 문자열 (내용이 안 바뀌면 버전도 그대로라 재다운로드 없음)
  const hash = crypto.createHash('md5').update(combined).digest('hex').slice(0, 10);
  return { origSize, newSize, hash };
}

// ─────────────────────────────────────────
// sw.js의 CACHE_VERSION을 빌드 산출물 해시 기반으로 자동 갱신.
// (예전엔 배포마다 수동으로 CACHE_VERSION 문자열을 올려야 했고, 깜빡하면
//  사용자 브라우저에 이전 캐시가 그대로 남아 새 빌드가 반영되지 않는 문제가 있었다.
//  → 모든 청크/CSS 해시를 합쳐 하나의 버전 문자열을 만들고, 내용이 실제로
//  달라졌을 때만 sw.js 파일을 갱신한다.)
function patchServiceWorker(results, cssHash) {
  const swPath = path.join(SRC, 'sw.js');
  if (!fs.existsSync(swPath)) {
    console.warn('  ⚠️  sw.js 없음 — CACHE_VERSION 자동 갱신 건너뜀');
    return;
  }
  const allHashes = results.map(r => r.hash).concat([cssHash]).join('');
  const combinedHash = crypto.createHash('md5').update(allHashes).digest('hex').slice(0, 10);
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const newVersion = `v${dateStr}-${combinedHash}`;

  let sw = fs.readFileSync(swPath, 'utf8');
  const versionRe = /const CACHE_VERSION = '([^']*)';/;
  const m = sw.match(versionRe);
  if (!m) {
    console.warn('  ⚠️  sw.js에서 CACHE_VERSION 선언을 찾지 못함 — 자동 갱신 건너뜀');
    return;
  }
  if (m[1] === newVersion) {
    console.log(`  ℹ️  sw.js CACHE_VERSION 변경 없음 (${newVersion})`);
    return;
  }
  sw = sw.replace(versionRe, `const CACHE_VERSION = '${newVersion}';`);
  fs.writeFileSync(swPath, sw, 'utf8');
  console.log(`  🔄 sw.js CACHE_VERSION 갱신: ${m[1]} → ${newVersion}`);
}

function patchIndexHtml(stats, cssHash) {
  const htmlPath = path.join(SRC, 'index.html');
  let html = fs.readFileSync(htmlPath, 'utf8');

  // 개별 css <link> 태그들을 제거하고, 첫 번째 태그가 있던 자리에 번들 하나로 교체
  let cssInserted = false;
  for (const f of CSS_FILES) {
    const re = new RegExp(`<link[^>]*href="${f.replace(/\//g, '\\/')}\\?[^"]*"[^>]*>\\n?`);
    if (re.test(html)) {
      html = html.replace(
        re,
        cssInserted ? '' : `<link rel="stylesheet" href="dist/css/bundle.css?v=${cssHash}">\n`
      );
      cssInserted = true;
    }
  }

  // 기존 로컬 script 태그를 모두 제거 (CDN 제외)
  // tabs-scroll-init.js는 defer 없이 body에 있으므로 유지
  html = html.replace(
    /<script\s+defer\s+src="js\/[^"]*"[^>]*><\/script>\n?/g,
    ''
  );
  // settings-sync, settings/, sync/ 서브폴더도 제거
  html = html.replace(
    /<script\s+defer\s+src="js\/[^/][^"]*\/[^"]*"[^>]*><\/script>\n?/g,
    ''
  );

  // 번들 script 태그 삽입 위치: </body> 바로 앞
  const bundleTags = [
    '<!-- ⚡ 번들 빌드 (build.mjs 자동 생성) -->',
    '<script defer src="dist/js/chunk-core.js"></script>',
    '<script defer src="dist/js/chunk-match.js"></script>',
    '<script defer src="dist/js/chunk-search.js"></script>',
    '<script defer src="dist/js/chunk-procomp.js"></script>',
    '<script defer src="dist/js/chunk-board.js"></script>',
    '<!-- 지연 로딩 청크: render-lazy-utils.js에서 동적으로 로드됨 -->',
  ].join('\n');

  html = html.replace('</body>', bundleTags + '\n</body>');

  fs.writeFileSync(path.join(SRC, 'index.dist.html'), html, 'utf8');
  console.log('\n  📄 index.dist.html 생성 완료 (원본 index.html은 유지됨)');
}

/**
 * render-lazy-utils.js의 경로를 dist/js/lazy-*.js 로 재작성
 * 원본 파일은 건드리지 않고 dist/js/render-lazy-utils.patched.js 로 출력
 */
async function patchLazyUtils() {
  const srcPath = path.join(SRC, 'js/render-lazy-utils.js');
  let src = fs.readFileSync(srcPath, 'utf8');

  // 각 lazy 청크가 커버하는 파일들의 첫 번째 파일 → 청크 경로로 교체
  const replacements = {
    'lazy-stats.js': 'js/sharecard-normalize.js',
    'lazy-roulette.js': 'js/wheel.js',
    'lazy-calendar.js': 'js/calendar.js',
    'lazy-chatbot.js': 'js/chatbot-utils.js',
    'lazy-elboard.js': 'js/elboard.js',
    'lazy-vote.js': 'js/vote.js',
  };

  // 전략: 각 _ensure*Loaded 함수 내부의 loadScriptOnce 호출 묶음을
  // 단일 loadScriptOnce 호출로 교체
  const chunkMap = {};
  for (const [chunk, files] of Object.entries(LAZY_CHUNKS)) {
    for (const f of files) {
      chunkMap[path.basename(f, '.js')] = chunk;
    }
  }

  // 정규식으로 각 ensureXxxLoaded 함수를 탐색해 단순화
  // (복잡한 AST 변환 대신 패턴 기반 치환)
  const lazyFnReplacements = [
    {
      name: '_ensureStatsLoaded',
      chunk: 'lazy-stats.js',
    },
    {
      name: '_ensureRouletteLoaded',
      chunk: 'lazy-roulette.js',
    },
    {
      name: '_ensureCalendarLoaded',
      chunk: 'lazy-calendar.js',
    },
    {
      name: '_ensureChatbotLoaded',
      chunk: 'lazy-chatbot.js',
    },
    {
      name: '_ensureElboardLoaded',
      chunk: 'lazy-elboard.js',
    },
    {
      name: '_ensureVoteLoaded',
      chunk: 'lazy-vote.js',
    },
  ];

  let patched = src;
  for (const { name, chunk } of lazyFnReplacements) {
    // 함수 시작~끝 블록을 찾아 단일 loadScriptOnce 로 교체
    const fnRegex = new RegExp(
      `(async function ${name}\\(\\)\\{)[\\s\\S]*?^\\}`,
      'gm'
    );
    const replacement = `$1\n  await _loadScriptOnce('dist/js/${chunk}');\n}`;
    const result = patched.replace(fnRegex, replacement);
    if (result !== patched) {
      console.log(`  🔧 ${name} → dist/js/${chunk} 로 단순화`);
      patched = result;
    }
  }

  const outPath = path.join(DIST, 'js', 'render-lazy-utils.patched.js');
  const minified = await transform(patched, { minify: true, target: 'es2017' })
    .then(r => r.code)
    .catch(() => patched);
  fs.writeFileSync(outPath, minified, 'utf8');
  return minified;
}

// ──────────────────────────────────────────
// 메인
// ──────────────────────────────────────────

// ──────────────────────────────────────────
// index.html 기준 자동 동기화
//  - dist 번들에서 스크립트가 누락되면(예: 설정 파일 분할 후 목록 갱신 누락)
//    해당 기능(설정 저장/반영 등)이 배포판에서 조용히 죽는다.
//  - 그래서 "무엇을/어떤 순서로" 담을지는 index.html의 defer script 순서를
//    단일 진실 소스(single source of truth)로 사용한다.
// ──────────────────────────────────────────

function readHtmlScriptOrder() {
  const html = fs.readFileSync(path.join(SRC, 'index.html'), 'utf8');
  const re = /<script\s+defer\s+src="(js\/[^"?]+)(?:\?[^"]*)?"[^>]*><\/script>/g;
  const out = [];
  let m;
  while ((m = re.exec(html))) {
    if (!out.includes(m[1])) out.push(m[1]);
  }
  return out;
}

/** 명시 목록에 없는 신규(분할) 파일을 파일명 규칙으로 청크에 배정 */
function guessChunk(file) {
  const n = file.replace(/^js\//, '');
  if (/^(board2|cloud-board)/.test(n) || /^sync\//.test(n)) return 'board';
  if (/^pro-comp/.test(n)) return 'procomp';
  if (/^(competition|history|match)/.test(n)) return 'match';
  if (/^(search|players)/.test(n)) return 'search';
  return 'core';
}

/** index.html 순서를 기준으로 청크 목록을 재구성 */
function syncChunksWithHtml(groups, lazyChunks) {
  const order = readHtmlScriptOrder();
  const idx = new Map(order.map((f, i) => [f, i]));
  const lazySet = new Set(Object.values(lazyChunks).flat());

  const assign = new Map();
  for (const [name, files] of Object.entries(groups)) {
    for (const f of files) {
      if (!idx.has(f)) {
        if (!lazySet.has(f)) console.warn(`  ⚠️  ${name} 목록의 ${f} 는 index.html에 없음 → 번들 제외`);
        continue;
      }
      assign.set(f, name);
    }
  }

  const added = [];
  for (const f of order) {
    // index.html에 defer script로 있으면 lazy 목록에 있어도 반드시 번들에 포함
    if (assign.has(f)) continue;
    if (lazySet.has(f)) console.warn(`  ⚠️  ${f} 는 lazy 목록에도 있으나 index.html 로딩이 우선 → 번들 포함`);
    const g = guessChunk(f);
    assign.set(f, g);
    added.push(`${f} → chunk-${g}`);
  }
  if (added.length) {
    console.log(`  🔄 index.html에만 있던 ${added.length}개 파일을 자동 배정:`);
    added.forEach(t => console.log(`      + ${t}`));
  }

  const synced = {};
  for (const name of Object.keys(groups)) {
    synced[name] = order.filter(f => assign.get(f) === name);
  }
  return synced;
}

async function main() {
  console.log('🚀 빌드 시작...\n');
  const t0 = Date.now();

  // dist 폴더 준비
  fs.mkdirSync(path.join(DIST, 'js'), { recursive: true });

  console.log('🔎 index.html script 순서와 청크 목록 동기화:');
  const synced = syncChunksWithHtml(
    {
      core: CORE_FILES,
      match: MATCH_FILES,
      search: SEARCH_FILES,
      procomp: PROCOMP_FILES,
      board: BOARD_FILES,
    },
    LAZY_CHUNKS
  );

  const chunks = [
    ['chunk-core.js',    synced.core],
    ['chunk-match.js',   synced.match],
    ['chunk-search.js',  synced.search],
    ['chunk-procomp.js', synced.procomp],
    ['chunk-board.js',   synced.board],
  ];
  console.log('');

  console.log('📦 코어/기능 청크 빌드:');
  // (버그픽스, 2026-08-14) patchLazyUtils()가 정의만 되어있고 실제로는 호출되지 않아서,
  // chunk-core.js에 render-lazy-utils.js의 "원본"(개별 js/*.js 경로를 직접 fetch하는 버전)이
  // 그대로 들어가고 있었다. dist만 배포하는 환경(원본 js/ 폴더 없이)에서는 stats/공유카드/
  // 룰렛/캘린더/챗봇/엘보드/투표 등 지연 로딩 기능을 열 때마다 "load fail: js/xxx.js" 오류가
  // 날 수 있는 구조였음 — 이번에 실제로 패치된 버전을 chunk-core.js에 넣도록 연결한다.
  const patchedLazyUtils = await patchLazyUtils();
  const coreOverrides = { 'js/render-lazy-utils.js': patchedLazyUtils };
  const results = [];
  for (const [name, files] of chunks) {
    results.push(await buildChunk(name, files, name === 'chunk-core.js' ? coreOverrides : null));
  }

  console.log('\n⏳ 지연 로딩 청크 빌드:');
  for (const [name, files] of Object.entries(LAZY_CHUNKS)) {
    results.push(await buildChunk(name, files));
  }

  console.log('\n🎨 CSS 번들 빌드:');
  const cssResult = await buildCssBundle(CSS_FILES);

  // 합계
  const totalOrig = results.reduce((a, r) => a + r.origSize, 0) + cssResult.origSize;
  const totalNew  = results.reduce((a, r) => a + r.newSize,  0) + cssResult.newSize;
  const totalSaved = (((totalOrig - totalNew) / totalOrig) * 100).toFixed(1);

  console.log('\n' + '─'.repeat(60));
  console.log(
    `📊 전체: ${fmtSize(totalOrig)} → ${fmtSize(totalNew)}  (-${totalSaved}%)`
  );
  console.log(
    `   HTTP 요청: ~148개 → ${chunks.length + Object.keys(LAZY_CHUNKS).length + 1}개 (초기 ${chunks.length + 1}개)`
  );

  // index.html 패치
  patchIndexHtml(results, cssResult.hash);

  // sw.js CACHE_VERSION 자동 갱신 (내용 해시 기반)
  patchServiceWorker(results, cssResult.hash);

  console.log(`\n✨ 완료 (${((Date.now() - t0) / 1000).toFixed(1)}s)`);
  console.log('\n사용 방법:');
  console.log('  index.dist.html 을 index.html 대신 서빙하면 번들 버전으로 동작합니다.');
  console.log('  (또는 index.html → index.html.bak 백업 후 index.dist.html → index.html 로 교체)');
}

main().catch(e => {
  console.error('❌ 빌드 실패:', e);
  process.exit(1);
});
