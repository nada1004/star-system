/* ══════════════════════════════════════════════════════════════
   룰렛 - 팀 나누기 (참가자를 N개 팀으로 랜덤 분배)
   ══════════════════════════════════════════════════════════════ */

let _tsLastTeams = null;

function _tsSaveNames(val) {
  _rLsSet('su_ts_names', val);
}

function _tsGetCount() {
  return Math.max(2, Math.min(8, parseInt(_rLsGet('su_ts_count', '2'), 10) || 2));
}

function _tsAdjustCount(delta) {
  const count = Math.max(2, Math.min(8, _tsGetCount() + delta));
  _rLsSet('su_ts_count', String(count));
  const el = document.getElementById('ts-count-display');
  if (el) el.textContent = String(count);
}

function _tsShuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function _tsSplit() {
  const text = _rLsGet('su_ts_names', '');
  const names = text.split(',').map(v => v.trim()).filter(Boolean);
  if (names.length < 2) { alert('참가자를 2명 이상 입력해주세요.'); return; }
  const count = _tsGetCount();
  if (names.length < count) { alert('팀 수보다 참가자 수가 많아야 해요.'); return; }

  const shuffled = _tsShuffle(names);
  const teams = Array.from({ length: count }, () => []);
  shuffled.forEach((n, i) => { teams[i % count].push(n); });
  _tsLastTeams = teams;
  _tsRenderResult(teams);
}

function _tsRenderResult(teams) {
  const box = document.getElementById('ts-result');
  if (!box) return;
  if (!teams || !teams.length) { box.innerHTML = ''; return; }
  box.innerHTML = `<div style="font-size:13px;font-weight:900;color:var(--text3);margin:2px 0 10px">🎉 팀이 나뉘었어요!</div>
  <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:10px">
    ${teams.map((team, i) => {
      const c = _GC_COLORS[i % _GC_COLORS.length];
      return `<div class="gc-card" style="padding:14px;border-top:4px solid ${c[1]}">
        <div style="font-size:13px;font-weight:900;color:${c[1]};margin-bottom:8px">TEAM ${i + 1} <span style="color:var(--text3);font-weight:700">(${team.length}명)</span></div>
        <div style="display:flex;flex-direction:column;gap:4px">
          ${team.map(n => `<div style="font-size:14px;font-weight:700;color:var(--text1);padding:4px 2px;border-bottom:1px solid rgba(148,163,184,.14)">${_rEscHTML(n)}</div>`).join('') || `<div style="font-size:13px;color:var(--text3)">-</div>`}
        </div>
      </div>`;
    }).join('')}
  </div>
  <button onclick="_tsSplit()" style="margin-top:12px;font-size:13px;padding:7px 16px;border-radius:8px;border:1.5px solid var(--border);background:var(--surface);color:var(--text3);cursor:pointer;font-weight:700">🔀 다시 나누기</button>`;
}

function _tsRender() {
  const root = document.getElementById('ts-root');
  if (!root) return;
  const count = _tsGetCount();
  root.innerHTML = `
  <div class="gc-stage-card" style="margin-bottom:14px">
    <div class="gc-stage-head">
      <div>
        <div class="gc-stage-title">👥 팀 나누기</div>
        <div class="gc-stage-desc">참가자를 넣고 원하는 팀 수를 고르면 랜덤으로 균등하게 나눠줍니다.</div>
      </div>
    </div>
    <div style="font-size:13px;font-weight:700;color:var(--text3);margin-bottom:8px">참가자 이름 (쉼표 구분, 2명 이상)</div>
    <textarea id="ts-names-input" rows="4" oninput="_tsSaveNames(this.value)"
      style="width:100%;border:2px solid var(--border);border-radius:var(--r);padding:10px 12px;font-size:14px;line-height:1.6;resize:none;color:var(--text1);background:var(--surface);font-family:inherit;box-sizing:border-box"></textarea>
    <div style="display:flex;align-items:center;gap:10px;margin-top:12px;flex-wrap:wrap">
      <span style="font-size:13px;font-weight:700;color:var(--text3)">팀 수</span>
      <div style="display:flex;align-items:center;gap:6px">
        <button onclick="_tsAdjustCount(-1)" style="width:32px;height:32px;border-radius:8px;border:1.5px solid var(--border);background:var(--surface);color:var(--text2);font-weight:900;cursor:pointer">−</button>
        <span id="ts-count-display" style="min-width:24px;text-align:center;font-weight:900;font-size:15px;color:var(--text1)">${count}</span>
        <button onclick="_tsAdjustCount(1)" style="width:32px;height:32px;border-radius:8px;border:1.5px solid var(--border);background:var(--surface);color:var(--text2);font-weight:900;cursor:pointer">+</button>
      </div>
      <button onclick="_tsSplit()" style="margin-left:auto;background:linear-gradient(135deg,#60a5fa,#6366f1);color:#fff;border:none;border-radius:12px;padding:9px 20px;font-size:14px;font-weight:800;cursor:pointer;box-shadow:0 6px 16px rgba(37,99,235,.28)">🎲 팀 나누기</button>
    </div>
  </div>
  <div id="ts-result"></div>`;

  const inp = document.getElementById('ts-names-input');
  if (inp) inp.value = _rLsGet('su_ts_names', '');
  if (_tsLastTeams) _tsRenderResult(_tsLastTeams);
}

function _tsInit() {
  _tsRender();
}

function _tsCleanup() {
  // 별도 타이머/리소스 없음
}
