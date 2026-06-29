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
  'js/constants.js',
  'js/constants-save.js',
  'js/constants-game.js',
  'js/constants-tab-colors.js',
  'js/constants-player-html.js',
  'js/unified-settings.js',
  'js/modal-open.js',
  'js/modal-drag.js',
  'js/data.js',
  'js/year-utils.js',
  'js/auth.js',
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
  'js/tier-tour-misc.js',
  'js/settings/font-controls.js',
  'js/settings/ui-scale-controls.js',
  'js/settings-base.js',
  'js/settings-presets.js',
  'js/settings-femco-cfg.js',
  'js/settings-cfg-modal.js',
  'js/settings-cfg-apply.js',
  'js/settings-cfg-misc.js',
  'js/settings-render-reccard.js',
  'js/settings-render-tourneycard.js',
  'js/settings-render-cards.js',
  'js/settings-render.js',
  'js/settings-data-ops.js',
  'js/settings-crud.js',
  'js/settings-crud-univ.js',
  'js/settings-map-status.js',
  'js/settings-profile-ui.js',
  'js/settings-match-detail.js',
  'js/settings-player-detail.js',
  'js/render-lazy-utils.js',
  'js/render-core.js',
  'js/render-nav-lazy.js',
  'js/render-iconify-ui.js',
  'js/render-capture-utils.js',
  'js/render-share-utils.js',
  'js/render-merged-tabs.js',
  'js/render-standalone-utils.js',
  'js/render-player-filters.js',
  'js/render-player-header.js',
  'js/render-player-compute.js',
  'js/render-player-style-prep.js',
  'js/render-player-detail.js',
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
  'js/render-univ-recent.js',
  'js/render-univ-actions.js',
  'js/render-player-modal-entry.js',
  'js/render-match-id-prepare.js',
  'js/vs.js',
  'js/rec-side-profiles.js',
  'js/mobile-bar.js',
  'js/fab.js',
  'js/init.js',
];

/** 경기/대전 기록 번들 */
const MATCH_FILES = [
  'js/competition.js',
  'js/competition-detail-modal.js',
  'js/competition-group-records.js',
  'js/competition-bracket-records.js',
  'js/competition-bracket-editor.js',
  'js/competition-group-editor.js',
  'js/competition-normal-matches.js',
  'js/history-share.js',
  'js/history-action-utils.js',
  'js/history-external-utils.js',
  'js/history-external-ui.js',
  'js/history-render-tabs.js',
  'js/history-rec-summary.js',
  'js/history-match-index.js',
  'js/history-search.js',
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
  'js/match-builder-record-views.js',
  'js/match-builder-share-legacy.js',
  'js/match-builder-share-entry.js',
];

/** 검색/선수 번들 */
const SEARCH_FILES = [
  'js/players-search-state.js',
  'js/players-streamer-views.js',
  'js/players-tier-rank.js',
  'js/search-parsing.js',
  'js/search-preview.js',
  'js/search-paste-edit.js',
  'js/search-paste-apply.js',
  'js/search-elo-cleanup.js',
  'js/search-modals.js',
  'js/search-pro-paste.js',
];

/** 프로대회 번들 */
const PROCOMP_FILES = [
  'js/pro-comp-core.js',
  'js/pro-comp-edit-stage.js',
  'js/pro-comp-edit-bracket.js',
  'js/pro-comp-edit-paste.js',
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
  'js/board2-univ-views.js',
  'js/board2-players.js',
  'js/board2-analytics.js',
  'js/board2-heatmap-bubble.js',
  'js/board2-briefing-data.js',
  'js/board2-briefing.js',
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
    'js/stats-period-utils.js',
    'js/stats-period-renderer.js',
    'js/stats-tierwin-renderer.js',
    'js/stats-heatmap-renderer.js',
    'js/stats-maprank-renderer.js',
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
    'js/sharecard-render-match-pipeline.js',
    'js/sharecard-render-match-utils.js',
    'js/sharecard-match-openers.js',
    'js/stats-core.js',
    'js/stats-search.js',
    'js/stats-overview-elo.js',
    'js/stats-sharecard.js',
  ],
  'lazy-roulette.js': [
    'js/wheel.js',
    'js/duck-race.js',
    'js/roulette.js',
  ],
  'lazy-calendar.js': [
    'js/calendar.js',
  ],
  'lazy-chatbot.js': [
    'js/chatbot-utils.js',
    'js/chatbot-fuzzy.js',
    'js/chatbot-formatters.js',
    'js/chatbot-formatters-matches.js',
    'js/chatbot-formatters-player-card.js',
    'js/chatbot-formatters-recent.js',
    'js/chatbot-formatters-records.js',
    'js/chatbot-formatters-search.js',
    'js/chatbot-formatters-stats.js',
    'js/chatbot-formatters-tournaments.js',
    'js/chatbot-formatters-univ.js',
    'js/chatbot-handlers.js',
    'js/chatbot-sync.js',
    'js/chatbot-aibot.js',
    'js/chatbot-ui.js',
    'js/chatbot.js',
  ],
  'lazy-elboard.js': [
    'js/elboard.js',
  ],
  'lazy-vote.js': [
    'js/vote.js',
  ],
};

// ──────────────────────────────────────────
// 유틸리티
// ──────────────────────────────────────────

function fmtSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

async function minifyFile(filePath) {
  try {
    const src = fs.readFileSync(filePath, 'utf8');
    const result = await transform(src, {
      minify: true,
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

async function buildChunk(outName, files) {
  const outPath = path.join(DIST, 'js', outName);
  const parts = [];
  let missing = 0;

  for (const f of files) {
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

  console.log(
    `  ✅ ${outName.padEnd(22)} ${String(files.length - missing).padStart(3)}개 파일  ` +
    `${fmtSize(origSize).padStart(9)} → ${fmtSize(newSize).padStart(9)}  (-${saved}%)`
  );
  return { outName, files: files.length - missing, origSize, newSize };
}

// ──────────────────────────────────────────
// index.html 패치
// ──────────────────────────────────────────

function patchIndexHtml(stats) {
  const htmlPath = path.join(SRC, 'index.html');
  let html = fs.readFileSync(htmlPath, 'utf8');

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
}

// ──────────────────────────────────────────
// 메인
// ──────────────────────────────────────────

async function main() {
  console.log('🚀 빌드 시작...\n');
  const t0 = Date.now();

  // dist 폴더 준비
  fs.mkdirSync(path.join(DIST, 'js'), { recursive: true });

  const chunks = [
    ['chunk-core.js',    CORE_FILES],
    ['chunk-match.js',   MATCH_FILES],
    ['chunk-search.js',  SEARCH_FILES],
    ['chunk-procomp.js', PROCOMP_FILES],
    ['chunk-board.js',   BOARD_FILES],
  ];

  console.log('📦 코어/기능 청크 빌드:');
  const results = [];
  for (const [name, files] of chunks) {
    results.push(await buildChunk(name, files));
  }

  console.log('\n⏳ 지연 로딩 청크 빌드:');
  for (const [name, files] of Object.entries(LAZY_CHUNKS)) {
    results.push(await buildChunk(name, files));
  }

  // 합계
  const totalOrig = results.reduce((a, r) => a + r.origSize, 0);
  const totalNew  = results.reduce((a, r) => a + r.newSize,  0);
  const totalSaved = (((totalOrig - totalNew) / totalOrig) * 100).toFixed(1);

  console.log('\n' + '─'.repeat(60));
  console.log(
    `📊 전체: ${fmtSize(totalOrig)} → ${fmtSize(totalNew)}  (-${totalSaved}%)`
  );
  console.log(
    `   HTTP 요청: ~140개 → ${chunks.length + Object.keys(LAZY_CHUNKS).length}개 (초기 ${chunks.length}개)`
  );

  // index.html 패치
  patchIndexHtml(results);

  console.log(`\n✨ 완료 (${((Date.now() - t0) / 1000).toFixed(1)}s)`);
  console.log('\n사용 방법:');
  console.log('  index.dist.html 을 index.html 대신 서빙하면 번들 버전으로 동작합니다.');
  console.log('  (또는 index.html → index.html.bak 백업 후 index.dist.html → index.html 로 교체)');
}

main().catch(e => {
  console.error('❌ 빌드 실패:', e);
  process.exit(1);
});
