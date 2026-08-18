/* ══════════════════════════════════════════════════════════════
   룰렛 - 마블 룰렛 (roulette.js 에서 분리, 2026-07-30)
   - lazygyu/roulette(물리 기반 마블 룰렛)을 roulette-app/ 에 정적 빌드로 배치하고
     roulette-gc-panel.js 에서 iframe(#mb-root)으로 임베드해서 사용합니다.
   - GitHub Pages 등 서브경로 배포에서도 깨지지 않도록 전부 "상대경로"로 참조합니다
     (절대경로 "/roulette-app/..."를 쓰면 저장소가 도메인 루트가 아닌 서브경로에
     배포됐을 때 엉뚱한 위치를 가리키게 되어 404가 납니다).
   - iframe이 404/네트워크 오류로 비어버리면 화면이 "완전히 새까맣게"만 보이고
     원인을 알 수 없으므로, _mbInit()에서 roulette-app/index.html 이 실제로
     서버에 존재/응답하는지 fetch로 한 번 확인해서 문제가 있으면 안내 배너를 띄웁니다.
   ══════════════════════════════════════════════════════════════ */

function _mbInit() {
  const root = document.getElementById('mb-root');
  if (!root) return;

  const MB_URL = 'roulette-app/index.html';

  fetch(MB_URL, { method: 'GET', cache: 'no-store' })
    .then(function (res) {
      if (!res.ok) {
        _mbShowError(root, MB_URL, '서버 응답: HTTP ' + res.status
          + (res.status === 404
            ? ' (파일을 찾을 수 없음 — roulette-app 폴더가 실제로 배포되지 않았거나, GitHub Pages 소스 브랜치/폴더 설정이 이 경로를 포함하지 않을 가능성이 높습니다)'
            : ''));
      }
      // 200 정상이면 이미 렌더링된 iframe을 그대로 둡니다.
    })
    .catch(function (err) {
      _mbShowError(root, MB_URL, '네트워크 오류: ' + (err && err.message ? err.message : String(err))
        + ' (file:// 로 직접 연 경우에도 이 오류가 납니다 — 반드시 http(s):// 로 접속해야 합니다)');
    });
}

function _mbShowError(root, url, reasonText) {
  root.innerHTML = ''
    + '<div style="height:100%;min-height:520px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;padding:24px;text-align:center;background:#0b0f1a;color:#e2e8f0">'
    + '<div style="font-size:34px">⚠️</div>'
    + '<div style="font-size:16px;font-weight:800">마블룰렛을 불러오지 못했습니다</div>'
    + '<div style="font-size:13px;line-height:1.7;color:#94a3b8;max-width:440px">'
    +   '<code style="color:#fbbf24">' + url + '</code> 경로를 확인할 수 없습니다.<br>'
    +   _rEscHTML(reasonText) + '<br><br>'
    +   '<code style="color:#93c5fd">roulette-app/</code> 폴더(빌드된 마블룰렛 정적 파일)가 '
    +   '이 페이지와 같은 위치에 실제로 배포되어 있는지 확인해 주세요.'
    + '</div>'
    + '<button onclick="_mbInit()" style="margin-top:6px;padding:9px 20px;border-radius:999px;border:none;background:linear-gradient(135deg,#818cf8,#8b5cf6);color:#fff;font-weight:800;font-size:13px;cursor:pointer">🔄 다시 확인</button>'
    + '</div>';
}
