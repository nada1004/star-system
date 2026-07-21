/* LAZY-LOADED — index.html에서 직접 로드되지 않음. 동적으로 필요시 로드 필요. */
// ─── 🎡 룰렛 휠 ─────────────────────────────────────────────────────────────

(function _whInjectCSS() {
  if (document.getElementById('wh-style')) return;
  const s = document.createElement('style');
  s.id = 'wh-style';
  s.textContent = [
    '#wh-root{font-family:inherit;width:100%}',
    '.wh-wrap{position:relative;display:flex;flex-direction:column;align-items:center;gap:14px;width:100%}',
    '.wh-wrap::before{content:"";position:absolute;inset:0 auto auto 0;width:220px;height:220px;background:radial-gradient(circle,rgba(251,113,133,.18),transparent 68%);pointer-events:none}',
    '.wh-panel{width:100%;background:linear-gradient(180deg,rgba(255,255,255,.98),rgba(248,250,252,.94));border:1px solid rgba(148,163,184,.18);border-radius:24px;box-shadow:0 18px 38px rgba(15,23,42,.07),inset 0 1px 0 rgba(255,255,255,.9)}',
    '.wh-panel-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;padding:18px 20px 0}',
    '.wh-panel-title{font-size:var(--fs-lg);font-weight:950;letter-spacing:-.03em;color:var(--text1)}',
    '.wh-panel-desc{margin-top:5px;font-size:var(--fs-sm);line-height:1.6;color:var(--text3)}',
    '.wh-badge-row{display:flex;flex-wrap:wrap;gap:8px;justify-content:flex-end}',
    '.wh-badge{display:inline-flex;align-items:center;gap:6px;padding:8px 12px;border-radius:999px;background:rgba(255,255,255,.88);border:1px solid rgba(148,163,184,.16);font-size:var(--fs-caption);font-weight:900;color:var(--text2);box-shadow:0 10px 20px rgba(15,23,42,.05)}',
    '.wh-input-row{width:100%;display:flex;align-items:center;gap:10px;flex-wrap:wrap;padding:14px 20px 0;box-sizing:border-box}',
    '.wh-menu-btn{padding:9px 14px;border-radius:14px;border:1px solid rgba(148,163,184,.22);background:linear-gradient(180deg,#fff,#f8fafc);color:var(--text2);font-size:var(--fs-sm);font-weight:900;cursor:pointer;white-space:nowrap;flex-shrink:0;box-shadow:0 10px 18px rgba(15,23,42,.04)}',
    '.wh-menu-btn:hover{border-color:rgba(37,99,235,.22);color:#2563eb;box-shadow:0 14px 24px rgba(37,99,235,.08)}',
    '.wh-spin-row{display:flex;gap:8px;align-items:center;flex-wrap:wrap;justify-content:center}',
    '.wh-textarea{flex:1;min-width:0;border:1px solid rgba(148,163,184,.24);border-radius:18px;padding:12px 14px;font-size:14px;font-family:inherit;resize:none;height:78px;color:var(--text1);background:linear-gradient(180deg,#fff,#f8fafc);line-height:1.7;outline:none;transition:border-color .18s,box-shadow .18s;background-clip:padding-box;box-shadow:inset 0 1px 0 rgba(255,255,255,.9)}',
    '.wh-textarea:focus{border-color:#fb7185;box-shadow:0 0 0 4px rgba(251,113,133,.12),0 12px 24px rgba(15,23,42,.05)}',
    '.wh-speed-wrap{display:flex;align-items:center;gap:8px;flex-shrink:0;background:linear-gradient(180deg,#fff,#f8fafc);border:1px solid rgba(148,163,184,.22);border-radius:var(--r2);padding:8px 12px;box-shadow:0 10px 18px rgba(15,23,42,.04)}',
    '.wh-speed-lbl{font-size:var(--fs-sm);font-weight:700;color:var(--text3);min-width:60px}',
    '.wh-chipbox{width:100%;display:flex;flex-wrap:wrap;gap:8px;margin:0;padding:10px 20px 0;box-sizing:border-box}',
    '.wh-chip{display:inline-flex;align-items:center;gap:6px;padding:8px 12px;border:1px solid rgba(148,163,184,.18);background:linear-gradient(180deg,#fff,#f8fafc);border-radius:999px;font-size:var(--fs-sm);font-weight:900;color:var(--text2);box-shadow:0 8px 18px rgba(15,23,42,.04)}',
    '.wh-chip-x{border:none;background:transparent;color:var(--gray-l);cursor:pointer;font-weight:1000;font-size:var(--fs-sm);line-height:1}',
    '.wh-stage{width:100%;display:flex;flex-direction:column;align-items:center;padding:16px 20px 20px;box-sizing:border-box}',
    '.wh-stage-card{width:100%;max-width:620px;position:relative;padding:22px 18px 18px;border-radius:28px;background:radial-gradient(circle at top,rgba(255,255,255,.92),rgba(244,247,251,.94));border:1px solid rgba(148,163,184,.18);box-shadow:0 24px 46px rgba(15,23,42,.08),inset 0 1px 0 rgba(255,255,255,.9)}',
    '.wh-stage-card::before{content:"";position:absolute;inset:20px 18px auto 18px;height:140px;border-radius:22px;background:radial-gradient(circle at top left,rgba(244,114,182,.16),transparent 40%),radial-gradient(circle at top right,rgba(96,165,250,.16),transparent 44%);pointer-events:none}',
    '.wh-stage-title{position:relative;font-size:var(--fs-md);font-weight:950;color:var(--text1);text-align:center;letter-spacing:-.02em;margin-bottom:6px}',
    '.wh-stage-desc{position:relative;font-size:var(--fs-sm);color:var(--text3);text-align:center;line-height:1.55;margin-bottom:14px}',
    '.wh-canvas-wrap{position:relative;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin:0 auto}',
    '.wh-pointer{position:absolute;top:-18px;left:50%;transform:translateX(-50%);font-size:30px;z-index:10;filter:drop-shadow(0 4px 8px rgba(0,0,0,.25));animation:whBob 1.2s ease-in-out infinite}',
    '@keyframes whBob{0%,100%{transform:translateX(-50%) translateY(0)}50%{transform:translateX(-50%) translateY(4px)}}',
    '#wh-canvas{border-radius:50%;display:block;box-shadow:0 14px 0 rgba(15,23,42,.12),0 0 0 10px rgba(255,255,255,.92),0 0 0 16px rgba(251,113,133,.16),0 26px 52px rgba(15,23,42,.16)}',
    '.wh-btn-spin{font-size:clamp(16px,2.2vw,22px);font-weight:900;color:#fff;background:linear-gradient(135deg,#fb7185,#f43f5e 52%,#ec4899);border:none;border-radius:999px;padding:13px 44px;cursor:pointer;box-shadow:0 7px 0 #9f1239,0 18px 30px rgba(244,63,94,.24);transition:transform .12s,box-shadow .12s;letter-spacing:.5px;font-family:inherit;flex-shrink:0}',
    '.wh-btn-spin:hover{transform:translateY(-2px);box-shadow:0 7px 0 #C0274A}',
    '.wh-btn-spin:active{transform:translateY(3px);box-shadow:0 2px 0 #C0274A}',
    '.wh-btn-spin:disabled{background:linear-gradient(135deg,#aaa,#888);box-shadow:0 4px 0 #555;cursor:not-allowed;transform:none}',
    '.wh-btn-spin.spinning{animation:whPulse .5s ease-in-out infinite alternate}',
    '@keyframes whPulse{from{box-shadow:0 5px 0 #C0274A}to{box-shadow:0 5px 20px rgba(255,75,110,.5),0 5px 0 #C0274A}}',
    '.wh-result-card{display:none;width:100%;max-width:520px;background:linear-gradient(135deg,#fff1f2,#fff7fb);border:1px solid rgba(251,113,133,.28);border-radius:24px;padding:22px;text-align:center;box-sizing:border-box;animation:whCardAppear 0.4s cubic-bezier(0.175,0.885,0.32,1.35);box-shadow:0 20px 38px rgba(244,63,94,.12),inset 0 1px 0 rgba(255,255,255,.9)}',
    '.wh-hist-box{width:100%;background:linear-gradient(180deg,rgba(255,255,255,.98),rgba(248,250,252,.94));border:1px solid rgba(148,163,184,.18);border-radius:22px;padding:14px 16px;margin-top:2px;box-shadow:0 18px 32px rgba(15,23,42,.06)}',
    '.wh-hist-item{display:flex;align-items:center;gap:8px;padding:9px 4px;border-bottom:1px solid rgba(148,163,184,.12)}',
    '.wh-hist-item:last-child{border-bottom:none}',
    '.wh-particle{position:fixed;pointer-events:none;font-size:22px;z-index:10000;animation:whParticle 1.2s ease-out forwards}',
    '@keyframes whPop{0%{transform:scale(0) rotate(-20deg);opacity:0}100%{transform:scale(1);opacity:1}}',
    '@keyframes whSlideUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:none}}',
    '@keyframes whBounce{from{transform:translateY(0)}to{transform:translateY(-8px)}}',
    '@keyframes whParticle{0%{transform:translate(0,0) scale(1) rotate(0deg);opacity:1}100%{transform:translate(var(--dx),var(--dy)) scale(0) rotate(var(--rot));opacity:0}}',
    '@keyframes whCardAppear{0%{opacity:0;transform:scale(0.7) translateY(20px)}100%{opacity:1;transform:scale(1) translateY(0)}}',
    'body.dark .wh-wrap::before{background:radial-gradient(circle,rgba(244,114,182,.12),transparent 68%)}',
    'body.dark .wh-panel,body.dark .wh-stage-card,body.dark .wh-hist-box{background:linear-gradient(180deg,rgba(15,23,42,.94),rgba(15,23,42,.9));border-color:#2d3f55;box-shadow:0 22px 42px rgba(0,0,0,.28),inset 0 1px 0 rgba(255,255,255,.03)}',
    'body.dark .wh-badge,body.dark .wh-chip,body.dark .wh-speed-wrap,body.dark .wh-menu-btn{background:linear-gradient(180deg,#162234,#0f172a);border-color:#334155;color:#cbd5e1;box-shadow:0 10px 18px rgba(0,0,0,.18)}',
    'body.dark .wh-panel-title,body.dark .wh-stage-title{color:#f8fafc}',
    'body.dark .wh-panel-desc,body.dark .wh-stage-desc,body.dark .wh-speed-lbl{color:#94a3b8}',
    'body.dark .wh-textarea{background:linear-gradient(180deg,#132033,#0f172a);border-color:#334155;color:#f8fafc;box-shadow:inset 0 1px 0 rgba(255,255,255,.03)}',
    'body.dark .wh-result-card{background:linear-gradient(180deg,rgba(61,18,41,.92),rgba(30,41,59,.96));border-color:rgba(251,113,133,.28)}',
    '@media (max-width:720px){.wh-panel-head{flex-direction:column}.wh-badge-row{justify-content:flex-start}.wh-input-row,.wh-chipbox,.wh-stage{padding-left:14px;padding-right:14px}.wh-stage-card{padding:18px 12px 14px;border-radius:22px}.wh-panel{border-radius:20px}}',
  ].join('');
  document.head.appendChild(s);
})();

// ─── 상수 ────────────────────────────────────────────────────────────────────
const _WH_COLORS = [
  ['#FF6B6B','#fff'],['#FFA502','#fff'],['#2ED573','#fff'],['#1E90FF','#fff'],
  ['#A29BFE','#fff'],['#FD79A8','#fff'],['#00CEC9','#fff'],['#E17055','#fff'],
  ['#6C5CE7','#fff'],['#FDCB6E','#333'],['#55EFC4','#333'],['#FAB1A0','#333'],
];
const _WH_SPEED_DUR   = [6000, 4800, 3500, 2500, 1600];
const _WH_SPEED_LBLS  = ['느리게','천천히','보통','빠르게','매우빠르게'];
const _WH_CONFETTI    = ['🎉','✨','🎊','🎈','💫','🌟','🥳','🎆','🎇','🎁'];

// ─── 상태 ────────────────────────────────────────────────────────────────────
let _whAngle      = 0;
let _whSpinning   = false;
let _whAnimId     = null;
let _whAC         = null;
let _whSpinDur    = _WH_SPEED_DUR[+(localStorage.getItem('su_wh_speed') ?? 2)] ?? 3500;
let _whHistory    = [];
try { _whHistory = JSON.parse(localStorage.getItem('su_wh_hist') || '[]'); } catch(e) {}
let _whStats      = {};
try { _whStats    = JSON.parse(localStorage.getItem('su_wh_stats') || '{}'); } catch(e) {}
let _whInputCache = localStorage.getItem('su_wh_input') || '';
// MiscStore에서 비동기 로드 (IDB 우선)
(async function _whLoadFromIdb(){
  try{
    if(typeof MiscStore === 'undefined') return;
    const speed = await MiscStore.get('su_wh_speed');
    if(speed != null) _whSpinDur = _WH_SPEED_DUR[+speed] ?? 3500;
    const hist = await MiscStore.get('su_wh_hist');
    if(Array.isArray(hist)) _whHistory = hist;
    const stats = await MiscStore.get('su_wh_stats');
    if(stats && typeof stats === 'object') _whStats = stats;
    const inp = await MiscStore.get('su_wh_input');
    if(typeof inp === 'string') _whInputCache = inp;
  }catch(e){}
})();

// ─── 가중치 파서 ("이름*2" 지원) ─────────────────────────────────────────────
function _whParseWeightedCSV(text){
  const raw = String(text||'');
  const tokens = raw.split(',').map(v=>v.trim()).filter(Boolean);
  const map = new Map();
  tokens.forEach(t=>{
    let name=t, w=1;
    const m=t.match(/^(.*?)(?:\*(\d+(?:\.\d+)?))$/);
    if(m){
      name=(m[1]||'').trim();
      const n=parseFloat(m[2]);
      if(!isNaN(n) && isFinite(n)) w=n;
    }
    if(!name) return;
    w=Math.max(0.01, Math.min(1000, w));
    map.set(name, (map.get(name)||0) + w);
  });
  const entries=[...map.entries()].map(([name,weight])=>({name,weight}));
  const total=entries.reduce((s,x)=>s+x.weight,0)||0;
  return {entries,total,tokens};
}

// (요청사항) 확률(%) 표시는 제거됨
function _whRemoveOne(name){
  const ta  = document.getElementById('wh-input');
  if(!ta) return;
  const raw = String(ta.value||'');
  const tokens = raw.split(',').map(v=>v.trim()).filter(Boolean);
  const idx = tokens.findIndex(t=>{
    const m=t.match(/^(.*?)(?:\*(\d+(?:\.\d+)?))?$/);
    return ((m?m[1]:t)||'').trim()===name;
  });
  if(idx>=0) tokens.splice(idx,1);
  const next = tokens.join(', ');
  ta.value = next;
  _whOnInput(next);
}

// ─── 공개 API ────────────────────────────────────────────────────────────────
function _whInit() {
  const root = document.getElementById('wh-root');
  if (!root) return;
  _whRender(root);
}

// ─── 렌더 ────────────────────────────────────────────────────────────────────
function _whRender(root) {
  const savedInput = (_whInputCache || '');
  const speedIdx   = _WH_SPEED_DUR.indexOf(_whSpinDur);
  const sIdx       = speedIdx >= 0 ? speedIdx : 2;
  const parsed = _whParseWeightedCSV(savedInput);
  const _entryCount = parsed.entries.length;

  root.innerHTML =
    '<div class="wh-wrap">'
    + '<div class="wh-panel">'
    + '<div class="wh-panel-head">'
    + '<div>'
    + '<div class="wh-panel-title">🎡 프리미엄 휠 룰렛</div>'
    + '<div class="wh-panel-desc">이름을 입력하고 룰렛을 돌리면, 더 또렷한 휠 화면과 정돈된 기록 패널로 결과를 확인할 수 있습니다.</div>'
    + '</div>'
    + '<div class="wh-badge-row">'
    + '<span class="wh-badge">✨ 항목 ' + _entryCount + '개</span>'
    + '<span class="wh-badge">⚡ ' + _WH_SPEED_LBLS[sIdx] + '</span>'
    + '<span class="wh-badge">🏆 최근 기록 ' + _whHistory.length + '개</span>'
    + '</div>'
    + '</div>'
    // 입력 + 속도 행
    + '<div class="wh-input-row">'
    + '<textarea class="wh-textarea" id="wh-input" placeholder="이름 입력... (쉼표로 구분, 가중치: 이름*2)" oninput="_whOnInput(this.value,event)" oncompositionend="_whOnInput(this.value)">' + savedInput + '</textarea>'
    + '<button onclick="_whShuffleInput()" class="wh-menu-btn">🔀 섞기</button>'
    + '<div class="wh-speed-wrap"><span style="font-size:var(--fs-sm);font-weight:700;color:var(--text3)">⚡</span><input type="range" id="wh-speed" min="1" max="5" value="' + (sIdx+1) + '" oninput="_whUpdateSpeed(this.value)" style="width:70px;accent-color:#FF4B6E"><span class="wh-speed-lbl" id="wh-speed-lbl">' + _WH_SPEED_LBLS[sIdx] + '</span></div>'
    + '</div>'
    // 칩(입력 편의)
    + '<div class="wh-chipbox">' + (parsed.entries.map(function(it){
        const nmRaw = (it.name||'');
        const nmDisp = nmRaw.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
        const nmJs = nmRaw.replace(/\\/g,'\\\\').replace(/'/g,"\\'");
        return '<span class="wh-chip">' + nmDisp + '<button class="wh-chip-x" onclick="_whRemoveOne(\'' + nmJs + '\')">✕</button></span>';
      }).join('') || '') + '</div>'
    // 캔버스 + 버튼
    + '<div class="wh-stage">'
    + '<div class="wh-stage-card">'
    + '<div class="wh-stage-title">🎯 휠 스테이지</div>'
    + '<div class="wh-stage-desc">포인터가 멈추는 위치로 당첨이 결정됩니다. 항목이 많아도 가독성이 유지되도록 정리했습니다.</div>'
    + '<div class="wh-canvas-wrap" id="wh-canvas-wrap">'
    + '<div class="wh-pointer">▼</div>'
    + '<canvas id="wh-canvas"></canvas>'
    + '</div>'
    + '<div class="wh-spin-row"><button class="wh-btn-spin" id="wh-btn-spin" onclick="_whSpin()">🎡 돌려라!</button></div>'
    + '</div>'
    + '</div>'
    // 결과 카드 (hidden 초기)
    + '<div id="wh-result-card" class="wh-result-card">'
    + '<div style="font-size:var(--fs-md);font-weight:700;color:#FF89AB;letter-spacing:1px;margin-bottom:10px">🎊 당첨!</div>'
    + '<div id="wh-res-icon" style="font-size:52px;margin-bottom:6px;line-height:1.1">🏆</div>'
    + '<div id="wh-res-name" style="font-size:clamp(28px,6vw,48px);font-weight:900;color:#C0274A;word-break:break-all;margin-bottom:6px"></div>'
    + '<button onclick="_whSpin()" style="font-family:inherit;font-size:var(--fs-md);font-weight:700;color:#fff;background:linear-gradient(135deg,#FF4B6E,#FF89AB);border:none;border-radius:22px;padding:10px 28px;cursor:pointer;box-shadow:0 4px 0 #C0274A;transition:transform .12s,box-shadow .12s" onmouseover="this.style.transform=\'translateY(-2px)\'" onmouseout="this.style.transform=\'\'">🎡 다시 돌리기</button>'
    + '</div>'
    // 히스토리
    + _whHistHTML()
    + '</div>'
    + '</div>';

  _whSetSize();
  _whDraw(_whAngle);
}

function _whHistHTML() {
  if (!_whHistory.length) return '';
  const rows = _whHistory.slice(0, 8).map(function(h, i) {
    const medal = i===0?'🥇':i===1?'🥈':i===2?'🥉':(i+1)+'위';
    return '<div class="wh-hist-item">'
      + '<span style="font-size:var(--fs-md);min-width:26px">' + medal + '</span>'
      + '<span style="font-weight:700;color:var(--text1);flex:1">' + h.name + '</span>'
      + '<span style="font-size:var(--fs-caption);color:var(--text3)">' + h.time + '</span>'
      + '</div>';
  }).join('');
  return '<div class="wh-hist-box">'
    + '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">'
    + '<span style="font-size:var(--fs-base);font-weight:700;color:var(--text2)">📋 최근 당첨 기록</span>'
    + '<button onclick="_whClearHistory()" style="font-size:var(--fs-caption);padding:3px 8px;border-radius:6px;border:1px solid var(--border);background:var(--surface);color:var(--text3);cursor:pointer">전체 삭제</button>'
    + '</div>' + rows + '</div>';
}

// ─── 크기 계산 ────────────────────────────────────────────────────────────────
function _whSetSize() {
  const cv = document.getElementById('wh-canvas');
  if (!cv) return;
  const wrap = document.getElementById('wh-canvas-wrap');
  if (!wrap) return;
  const avW  = Math.min(window.innerWidth - 40, 520);
  const avH  = Math.max(200, window.innerHeight - 380);
  const size = Math.max(180, Math.min(avW, avH));
  cv.width = cv.height = size;
  wrap.style.width  = size + 'px';
  wrap.style.height = (size + 20) + 'px';
}

// ─── 휠 그리기 ────────────────────────────────────────────────────────────────
function _whDraw(angle) {
  const cv = document.getElementById('wh-canvas');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  const raw = (document.getElementById('wh-input')||{}).value || ((_whInputCache || ''));
  const parsed = _whParseWeightedCSV(raw);
  const entries = parsed.entries;
  const totalW = parsed.total || 0;
  const n = entries.length;
  ctx.clearRect(0, 0, cv.width, cv.height);
  if (!n) {
    ctx.fillStyle = 'var(--surface, #f8f9fa)';
    ctx.beginPath(); ctx.arc(cv.width/2, cv.height/2, cv.width/2 - 4, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#ccc'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText('이름을 입력하세요', cv.width/2, cv.height/2);
    return;
  }
  const cx = cv.width/2, cy = cx, r = cx - 5;
  let cum = 0;
  for (var i = 0; i < n; i++) {
    const w = entries[i].weight;
    const slice = totalW ? (Math.PI * 2 * (w / totalW)) : (Math.PI * 2 / n);
    const col = _WH_COLORS[i % _WH_COLORS.length];
    const s = angle + cum, e = s + slice;
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, r, s, e); ctx.closePath();
    ctx.fillStyle = col[0]; ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.lineWidth = 2; ctx.stroke();
    // 텍스트
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(s + slice/2);
    ctx.textAlign = 'right'; ctx.fillStyle = col[1];
    const fs = Math.min(18, Math.max(9, Math.round(r * 0.13 * (8 / Math.max(n, 4)))));
    ctx.font = 'bold ' + fs + 'px "Noto Sans KR",sans-serif';
    ctx.shadowColor = 'rgba(0,0,0,.2)'; ctx.shadowBlur = 3;
    ctx.fillText(entries[i].name, r - 12, 5, Math.round(r * 0.55));
    ctx.restore();
    cum += slice;
  }
  // 테두리
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI*2);
  ctx.strokeStyle = 'rgba(255,255,255,.6)'; ctx.lineWidth = 4; ctx.stroke();
  // 중심원
  ctx.beginPath(); ctx.arc(cx, cy, cx * 0.1, 0, Math.PI*2);
  ctx.fillStyle = '#fff'; ctx.shadowBlur = 0; ctx.fill();
  ctx.strokeStyle = '#FF89AB'; ctx.lineWidth = 3; ctx.stroke();
  ctx.font = 'bold ' + Math.round(cx * 0.09) + 'px "Noto Sans KR",sans-serif';
  ctx.fillStyle = '#C0274A'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('GO!', cx, cy);
}

// ─── 스핀 ────────────────────────────────────────────────────────────────────
function _whSpin() {
  const raw = (document.getElementById('wh-input')||{}).value || ((_whInputCache || ''));
  const parsed = _whParseWeightedCSV(raw);
  const entries = parsed.entries;
  const totalW = parsed.total || 0;
  if (entries.length < 2) { alert('2명 이상 입력해 주세요.'); return; }
  if (_whSpinning) return;
  _whSpinning = true;
  const btn = document.getElementById('wh-btn-spin');
  if (btn) { btn.disabled = true; btn.textContent = '🎡 돌아가는 중...'; btn.classList.add('spinning'); }
  const prevCard = document.getElementById('wh-result-card');
  if (prevCard) prevCard.style.display = 'none';

  // 가중치 기반 승자 선택
  let r = Math.random() * (totalW || entries.length);
  let winIdx = 0;
  for (var i=0;i<entries.length;i++){
    r -= (totalW ? entries[i].weight : 1);
    if (r<=0){ winIdx=i; break; }
  }
  // 승자 세그먼트 중심각 계산(가중치 비율)
  var cum=0;
  for (var j=0;j<winIdx;j++){
    cum += totalW ? (Math.PI*2*(entries[j].weight/totalW)) : (Math.PI*2/entries.length);
  }
  var winSlice = totalW ? (Math.PI*2*(entries[winIdx].weight/totalW)) : (Math.PI*2/entries.length);
  const target  = -Math.PI / 2 - (cum + winSlice/2);
  let   diff    = (target - _whAngle) % (Math.PI * 2);
  if (diff > 0) diff -= Math.PI * 2;
  const totalRot = Math.PI * 2 * (8 + Math.floor(Math.random() * 8)) + diff;
  const dur      = _whSpinDur + Math.random() * 800;
  const startAng = _whAngle;
  let   t0 = null, lastTick = 0;
  const tickStep = (Math.PI * 2 / Math.max(entries.length, 8)) * 0.88;

  function ease(t) { return 1 - Math.pow(1 - t, 3.5); }
  function frame(ts) {
    if (!t0) t0 = ts;
    const p = Math.min((ts - t0) / dur, 1);
    _whAngle = startAng + totalRot * ease(p);
    _whDraw(_whAngle);
    // 틱 사운드
    const na = ((_whAngle % (Math.PI*2)) + Math.PI*2) % (Math.PI*2);
    if (Math.abs(na - lastTick) > tickStep) { lastTick = na; if (p < 0.92) _whPlayTick(); }
    if (p < 1) {
      _whAnimId = requestAnimationFrame(frame);
    } else {
      _whAngle = startAng + totalRot;
      _whSpinning = false;
      if (btn) { btn.disabled = false; btn.textContent = '🎡 돌려라!'; btn.classList.remove('spinning'); }
      const winner = entries[winIdx].name;
      _whAddHistory(winner);
      setTimeout(function() { _whShowResult(winner); }, 250);
    }
  }
  _whAnimId = requestAnimationFrame(frame);
}

// ─── 결과 카드 ────────────────────────────────────────────────────────────────
function _whShowResult(name) {
  const card = document.getElementById('wh-result-card');
  const nameEl = document.getElementById('wh-res-name');
  const iconEl = document.getElementById('wh-res-icon');
  if (!nameEl) return;
  if (nameEl) nameEl.textContent = name;
  if (iconEl) {
    const icons = ['🏆','🥇','🎖️','👑','🌟'];
    iconEl.textContent = icons[Math.floor(Math.random() * icons.length)];
  }
  if (card) card.style.display = 'none';
  _whFireConfetti();
  _whPlayWin();
  // (요청사항) 결과는 팝업으로 표시
  try{
    const ico = (iconEl && iconEl.textContent) ? iconEl.textContent : '🏆';
    if(typeof window._rrShowPopup==='function'){
      window._rrShowPopup('🎡 휠 결과', `<div style="text-align:center;padding:6px 4px">
        <div style="font-size:46px;line-height:1;margin-bottom:10px">${ico}</div>
        <div style="font-size:24px;font-weight:1000;color:var(--text1)">${name}</div>
      </div>`);
    } else {
      alert('🎡 결과: ' + name);
    }
  }catch(e){}
}

// ─── 히스토리 ────────────────────────────────────────────────────────────────
function _whAddHistory(name) {
  const now = new Date();
  const time = (now.getMonth()+1) + '/' + now.getDate() + ' ' + now.toLocaleTimeString('ko-KR',{hour:'2-digit',minute:'2-digit'});
  _whHistory.unshift({ name: name, time: time });
  if (_whHistory.length > 20) _whHistory = _whHistory.slice(0, 20);
  _whStats[name] = (_whStats[name] || 0) + 1;
  try { if(typeof MiscStore!=='undefined'){ MiscStore.set('su_wh_hist', _whHistory); MiscStore.set('su_wh_stats', _whStats); } else { localStorage.setItem('su_wh_hist', JSON.stringify(_whHistory)); localStorage.setItem('su_wh_stats', JSON.stringify(_whStats)); } } catch(e){}
  // 히스토리 박스 갱신
  const root = document.getElementById('wh-root');
  if (root) {
    let hbox = root.querySelector('.wh-hist-box');
    if (hbox) hbox.outerHTML = _whHistHTML();
    else {
      const wrap = root.querySelector('.wh-wrap');
      if (wrap) wrap.insertAdjacentHTML('beforeend', _whHistHTML());
    }
  }
}
function _whClearHistory() {
  if (!_whHistory.length || !confirm('기록을 모두 삭제할까요?')) return;
  _whHistory = []; _whStats = {};
  try{ if(typeof MiscStore!=='undefined'){ MiscStore.delete('su_wh_hist'); MiscStore.delete('su_wh_stats'); } else { localStorage.removeItem('su_wh_hist'); localStorage.removeItem('su_wh_stats'); } }catch(e){}
  const root = document.getElementById('wh-root');
  if (root) { const hbox = root.querySelector('.wh-hist-box'); if (hbox) hbox.remove(); }
}

// ─── 입력 관리 ────────────────────────────────────────────────────────────────
function _whRefreshChips(){
  const box = document.querySelector('#wh-root .wh-chipbox');
  if(!box) return;
  const raw = (document.getElementById('wh-input')||{}).value || ((_whInputCache || ''));
  const parsed = _whParseWeightedCSV(raw);
  box.innerHTML = (parsed.entries.map(function(it){
    const nmRaw = (it.name||'');
    const nmDisp = nmRaw.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    const nmJs = nmRaw.replace(/\\/g,'\\\\').replace(/'/g,"\\'");
    return '<span class="wh-chip">' + nmDisp + '<button class="wh-chip-x" onclick="_whRemoveOne(\'' + nmJs + '\')">✕</button></span>';
  }).join('') || '');
}

function _whOnInput(val, ev) {
  _whInputCache = val;
  try { if(typeof MiscStore!=='undefined') MiscStore.set('su_wh_input', val); else localStorage.setItem('su_wh_input', val); } catch(e) {}
  // (IME 한글 입력) 조합 중에는 DOM 변경을 최소화
  if(ev && ev.isComposing) return;
  _whRefreshChips();
  _whDraw(_whAngle);
}
function _whShuffleInput() {
  if (_whSpinning) return;
  const inp = document.getElementById('wh-input');
  const raw = inp ? inp.value : ((_whInputCache || ''));
  const tokens = raw.split(',').map(function(v){return v.trim();}).filter(Boolean);
  const arr = tokens;
  for (var i = arr.length-1; i > 0; i--) { var j = Math.floor(Math.random()*(i+1)); var t=arr[i]; arr[i]=arr[j]; arr[j]=t; }
  if (inp) { inp.value = arr.join(', '); try{ if(typeof MiscStore!=='undefined') MiscStore.set('su_wh_input', inp.value); else localStorage.setItem('su_wh_input', inp.value); }catch(e){} }
  _whOnInput(inp.value);
}
function _whUpdateSpeed(val) {
  const idx = parseInt(val) - 1;
  _whSpinDur = _WH_SPEED_DUR[idx];
  const lbl = document.getElementById('wh-speed-lbl');
  if (lbl) lbl.textContent = _WH_SPEED_LBLS[idx];
  try { if(typeof MiscStore!=='undefined') MiscStore.set('su_wh_speed', idx); else localStorage.setItem('su_wh_speed', idx); } catch(e) {}
}

// ─── 사운드 ────────────────────────────────────────────────────────────────────
function _whPlayTick() {
  try {
    if (!_whAC) _whAC = new (window.AudioContext || window.webkitAudioContext)();
    const o = _whAC.createOscillator(), g = _whAC.createGain();
    o.connect(g); g.connect(_whAC.destination);
    o.frequency.value = 500 + Math.random()*200; o.type = 'sine';
    g.gain.setValueAtTime(0.08, _whAC.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, _whAC.currentTime + 0.07);
    o.start(); o.stop(_whAC.currentTime + 0.07);
  } catch(e){}
}
function _whPlayWin() {
  try {
    if (!_whAC) _whAC = new (window.AudioContext || window.webkitAudioContext)();
    [523,659,784,1047].forEach(function(f, i) {
      setTimeout(function() {
        const o = _whAC.createOscillator(), g = _whAC.createGain();
        o.connect(g); g.connect(_whAC.destination);
        o.frequency.value = f; o.type = 'triangle';
        g.gain.setValueAtTime(0.15, _whAC.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, _whAC.currentTime + 0.32);
        o.start(); o.stop(_whAC.currentTime + 0.32);
      }, i * 120);
    });
  } catch(e){}
}

// ─── 컨페티 ────────────────────────────────────────────────────────────────────
function _whFireConfetti() {
  const cx = window.innerWidth/2, cy = window.innerHeight/2;
  for (var i = 0; i < 22; i++) {
    (function(i) {
      setTimeout(function() {
        const el = document.createElement('div');
        el.className = 'wh-particle';
        el.textContent = _WH_CONFETTI[Math.floor(Math.random()*_WH_CONFETTI.length)];
        el.style.left = cx + 'px'; el.style.top = cy + 'px';
        const a = Math.random()*Math.PI*2, d = 80 + Math.random()*260;
        el.style.setProperty('--dx', Math.cos(a)*d + 'px');
        el.style.setProperty('--dy', Math.sin(a)*d + 'px');
        el.style.setProperty('--rot', (Math.random()*720-360) + 'deg');
        document.body.appendChild(el);
        setTimeout(function() { el.remove(); }, 1300);
      }, i * 50);
    })(i);
  }
}
