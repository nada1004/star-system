/* ══════════════════════════════════════════════════════════════
   룰렛 - 대진표 뽑기 (참가자를 랜덤으로 섞어 1라운드 대진 매칭 생성)
   ══════════════════════════════════════════════════════════════ */

let _bkLastMatches = null;

function _bkSaveNames(val) {
  _rLsSet('su_bk_names', val);
}

function _bkShuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function _bkDraw() {
  const text = _rLsGet('su_bk_names', '');
  const names = text.split(',').map(v => v.trim()).filter(Boolean);
  if (names.length < 2) { alert('참가자를 2명 이상 입력해주세요.'); return; }

  const shuffled = _bkShuffle(names);
  const matches = [];
  let i = 0;
  while (i < shuffled.length) {
    if (i + 1 < shuffled.length) { matches.push([shuffled[i], shuffled[i + 1]]); i += 2; }
    else { matches.push([shuffled[i], null]); i += 1; }
  }
  _bkLastMatches = matches;
  _bkRenderResult(matches);
}

function _bkRenderResult(matches) {
  const box = document.getElementById('bk-result');
  if (!box) return;
  if (!matches || !matches.length) { box.innerHTML = ''; return; }
  box.innerHTML = `<div style="font-size:13px;font-weight:900;color:var(--text3);margin:2px 0 10px">🏆 1라운드 대진 (${matches.length}경기)</div>
  <div style="display:flex;flex-direction:column;gap:8px">
    ${matches.map((m, i) => {
      const [a, b] = m;
      if (b == null) {
        return `<div class="gc-card gc-card-soft" style="padding:12px 16px;display:flex;align-items:center;gap:10px">
          <span style="font-size:12px;font-weight:900;color:var(--text3);min-width:20px">${i + 1}</span>
          <span style="flex:1;font-weight:900;font-size:15px;color:var(--text1)">${_rEscHTML(a)}</span>
          <span style="font-size:12px;font-weight:800;color:#16a34a;background:rgba(22,163,74,.12);padding:4px 10px;border-radius:999px;white-space:nowrap">부전승</span>
        </div>`;
      }
      return `<div class="gc-card gc-card-soft" style="padding:12px 16px;display:flex;align-items:center;gap:10px">
        <span style="font-size:12px;font-weight:900;color:var(--text3);min-width:20px">${i + 1}</span>
        <span style="flex:1;text-align:right;font-weight:900;font-size:15px;color:var(--text1)">${_rEscHTML(a)}</span>
        <span style="font-size:12px;font-weight:900;color:#fff;background:linear-gradient(135deg,#f59e0b,#ef4444);padding:4px 10px;border-radius:999px;flex-shrink:0">VS</span>
        <span style="flex:1;font-weight:900;font-size:15px;color:var(--text1)">${_rEscHTML(b)}</span>
      </div>`;
    }).join('')}
  </div>
  <button onclick="_bkDraw()" style="margin-top:12px;font-size:13px;padding:7px 16px;border-radius:8px;border:1.5px solid var(--border);background:var(--surface);color:var(--text3);cursor:pointer;font-weight:700">🔀 다시 뽑기</button>`;
}

function _bkRender() {
  const root = document.getElementById('bk-root');
  if (!root) return;
  root.innerHTML = `
  <div class="gc-stage-card" style="margin-bottom:14px">
    <div class="gc-stage-head">
      <div>
        <div class="gc-stage-title">🏆 대진표 뽑기</div>
        <div class="gc-stage-desc">참가자를 랜덤으로 섞어 1라운드 대진을 만들어줍니다. 인원이 홀수면 한 명은 부전승 처리돼요.</div>
      </div>
    </div>
    <div style="font-size:13px;font-weight:700;color:var(--text3);margin-bottom:8px">참가자 이름 (쉼표 구분, 2명 이상)</div>
    <textarea id="bk-names-input" rows="4" oninput="_bkSaveNames(this.value)"
      style="width:100%;border:2px solid var(--border);border-radius:var(--r);padding:10px 12px;font-size:14px;line-height:1.6;resize:none;color:var(--text1);background:var(--surface);font-family:inherit;box-sizing:border-box"></textarea>
    <button onclick="_bkDraw()" style="margin-top:12px;background:linear-gradient(135deg,#f59e0b,#ef4444);color:#fff;border:none;border-radius:12px;padding:9px 20px;font-size:14px;font-weight:800;cursor:pointer;box-shadow:0 6px 16px rgba(239,68,68,.28)">🎲 대진표 뽑기</button>
  </div>
  <div id="bk-result"></div>`;

  const inp = document.getElementById('bk-names-input');
  if (inp) inp.value = _rLsGet('su_bk_names', '');
  if (_bkLastMatches) _bkRenderResult(_bkLastMatches);
}

function _bkInit() {
  _bkRender();
}

function _bkCleanup() {
  // 별도 타이머/리소스 없음
}
