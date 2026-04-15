/* ══════════════════════════════════════
   📡 elboard.js — 엘보드(최근전적)
   - 기존: 로컬 파일(file://) / 백엔드(/api/recent) 연동 코드
   - 변경: 프로젝트 내부의 정적 HTML(recent-preview.html)을 iframe으로 표시
══════════════════════════════════════ */

function rElboard(C, T) {
  T.innerText = '🧾 최근전적';
  const src = './recent-preview.html';
  C.innerHTML = `
    <div style="border:1px solid var(--border);border-radius:12px;overflow:hidden;background:var(--white)">
      <iframe src="${src}" style="width:100%;height:calc(100vh - 210px);border:0" title="최근전적"></iframe>
    </div>
  `;
}
