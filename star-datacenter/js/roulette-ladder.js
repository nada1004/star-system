/* ══════════════════════════════════════════════════════════════
   룰렛 - 사다리타기 게임 (roulette.js 에서 분리, 2026-07-30)
   ══════════════════════════════════════════════════════════════ */

function _ldSaveNames(val) { _rLsSet('su_ld_names', val); }
function _ldSaveItems(val) { _rLsSet('su_ld_items', val); }

function _ldBuildLadder(names, items) {
  const n = names.length;
  const rowCount = Math.max(8, n * 3);
  const rungs = [];
  for (let row = 1; row < rowCount; row++) {
    let lastCol = -2;
    for (let col = 0; col < n - 1; col++) {
      if (col > lastCol + 1 && Math.random() < 0.45) {
        rungs.push({ row, col });
        lastCol = col;
      }
    }
  }
  return { n, rowCount, names: [...names], items: [...items], rungs };
}

function _ldGetPath(nameIdx, ladder, colX, rowY) {
  let col = nameIdx;
  const pts = [{ x: colX(col), y: rowY(0) }];
  for (let row = 1; row < ladder.rowCount; row++) {
    const y = rowY(row);
    const rRight = ladder.rungs.find(r => r.row === row && r.col === col);
    const rLeft  = ladder.rungs.find(r => r.row === row && r.col === col - 1);
    pts.push({ x: colX(col), y });
    if (rRight)     { col++; pts.push({ x: colX(col), y }); }
    else if (rLeft) { col--; pts.push({ x: colX(col), y }); }
  }
  pts.push({ x: colX(col), y: rowY(ladder.rowCount) });
  return { pts, resultCol: col };
}

function _ldRoundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

function _ldDrawCanvas(ladder, highlightPts, animProgress) {
  const canvas = document.getElementById('ld-canvas');
  if (!canvas || !ladder) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const n = ladder.n;
  const padTop = 50, padBot = 55;
  const lineTop = padTop, lineBot = H - padBot;
  const lineH = lineBot - lineTop;
  const spacing = n > 1 ? (W - 60) / (n - 1) : W - 60;
  const padX = 30;
  const colX  = i => padX + i * spacing;
  const rowY  = r => lineTop + (r / ladder.rowCount) * lineH;
  const bw    = Math.min(spacing * 0.85, 72);
  const bh    = 28;
  const fSize = Math.max(10, Math.min(14, Math.round(bw * 0.22)));

  ctx.clearRect(0, 0, W, H);

  // 세로 줄
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#e2e8f0';
  for (let i = 0; i < n; i++) {
    ctx.beginPath();
    ctx.moveTo(colX(i), lineTop);
    ctx.lineTo(colX(i), lineBot);
    ctx.stroke();
  }

  // 가로 줄 (런그)
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 3;
  for (const rung of ladder.rungs) {
    const y = rowY(rung.row);
    ctx.beginPath();
    ctx.moveTo(colX(rung.col), y);
    ctx.lineTo(colX(rung.col + 1), y);
    ctx.stroke();
  }

  const COLORS = ['#FF4B6E','#a78bfa','#34d399','#fbbf24','#60a5fa','#f472b6','#fb923c','#a3e635','#e879f9','#38bdf8'];

  // 이름 박스 (상단)
  for (let i = 0; i < n; i++) {
    const x = colX(i);
    ctx.fillStyle = COLORS[i % COLORS.length];
    _ldRoundRect(ctx, x - bw/2, 5, bw, bh, 7);
    ctx.fill();
    ctx.fillStyle = 'white';
    ctx.font = `bold ${fSize}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(_ldFitText(ctx, ladder.names[i], bw - 8), x, 5 + bh / 2);
  }

  // 결과 박스 (하단)
  for (let i = 0; i < n; i++) {
    const x = colX(i);
    const y = H - padBot + 10;
    ctx.fillStyle = '#f1f5f9';
    _ldRoundRect(ctx, x - bw/2, y, bw, bh, 7);
    ctx.fill();
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1.5;
    _ldRoundRect(ctx, x - bw/2, y, bw, bh, 7);
    ctx.stroke();
    ctx.fillStyle = '#334155';
    ctx.font = `bold ${fSize}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(_ldFitText(ctx, ladder.items[i], bw - 8), x, y + bh / 2);
  }

  // 경로 하이라이트
  if (highlightPts && highlightPts.length >= 2) {
    let totalLen = 0;
    for (let i = 1; i < highlightPts.length; i++) {
      const dx = highlightPts[i].x - highlightPts[i-1].x;
      const dy = highlightPts[i].y - highlightPts[i-1].y;
      totalLen += Math.sqrt(dx*dx + dy*dy);
    }
    const drawLen = totalLen * (animProgress == null ? 1 : animProgress);
    let rem = drawLen;
    ctx.beginPath();
    ctx.moveTo(highlightPts[0].x, highlightPts[0].y);
    ctx.strokeStyle = '#FF4B6E';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    for (let i = 1; i < highlightPts.length && rem > 0; i++) {
      const dx = highlightPts[i].x - highlightPts[i-1].x;
      const dy = highlightPts[i].y - highlightPts[i-1].y;
      const segLen = Math.sqrt(dx*dx + dy*dy);
      if (rem >= segLen) {
        ctx.lineTo(highlightPts[i].x, highlightPts[i].y);
        rem -= segLen;
      } else {
        const t = rem / segLen;
        ctx.lineTo(highlightPts[i-1].x + dx*t, highlightPts[i-1].y + dy*t);
        rem = 0;
      }
    }
    ctx.stroke();
  }
}

function _ldFitText(ctx, text, maxW) {
  if (!text) return '';
  if (ctx.measureText(text).width <= maxW) return text;
  let s = text;
  while (s.length > 1 && ctx.measureText(s + '…').width > maxW) s = s.slice(0, -1);
  return s + '…';
}

function _ldInit() {
  const canvas = document.getElementById('ld-canvas');
  if (!canvas) return;
  if (_ldAnimId2) { cancelAnimationFrame(_ldAnimId2); _ldAnimId2 = null; }
  _ldAnimating = false;

  const namesText = _rLsGet('su_ld_names', '') || '';
  const itemsText = _rLsGet('su_ld_items', '') || '';
  const names = namesText.split(',').map(v=>v.trim()).filter(v=>v);
  const items = itemsText.split(',').map(v=>v.trim()).filter(v=>v);

  const ctx = canvas.getContext('2d');

  if (names.length < 2) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '16px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('참가자를 2명 이상 입력하세요', canvas.width/2, canvas.height/2);
    return;
  }

  const n = names.length;
  const normItems = Array.from({length: n}, (_, i) => items[i] || `${i+1}번`);

  const instr0 = document.getElementById('ld-instruction');
  if (items.length > 0 && items.length < n && instr0) {
    instr0.innerHTML = `⚠️ 결과 항목이 ${n}명보다 적습니다 (${items.length}개). 부족한 항목은 번호로 자동 채워집니다.`;
    instr0.style.color = '#e67e22';
  }

  if (!_ldLadder || _ldLadder.n !== n) {
    _ldLadder = _ldBuildLadder(names, normItems);
  } else {
    _ldLadder.names = [...names];
    _ldLadder.items = [...normItems];
  }

  _ldDrawCanvas(_ldLadder, null, null);
  _ldRefreshHistory();

  function _ldHandleClick(clientX, clientY) {
    if (_ldAnimating) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const cx = (clientX - rect.left) * scaleX;
    const cy = (clientY - rect.top)  * scaleY;
    if (cy > 50) return;
    const n2 = _ldLadder.n;
    const spacing2 = n2 > 1 ? (canvas.width - 60) / (n2 - 1) : canvas.width - 60;
    const bw2 = Math.min(spacing2 * 0.85, 72);
    for (let i = 0; i < n2; i++) {
      const bx = 30 + i * spacing2;
      if (cx >= bx - bw2/2 && cx <= bx + bw2/2) {
        _ldAnimate(i);
        break;
      }
    }
  }
  canvas.onclick = null;
  canvas.ontouchend = null;
  canvas.onclick = (e) => _ldHandleClick(e.clientX, e.clientY);
  canvas.ontouchend = (e) => {
    e.preventDefault();
    const t = e.changedTouches[0];
    _ldHandleClick(t.clientX, t.clientY);
  };
}

function _ldRebuild() {
  _ldLadder = null; // 강제 초기화 → _ldInit에서 새 사다리 빌드 + onclick 재등록
  _ldInit();
}

function _ldAnimate(nameIdx) {
  if (!_ldLadder || _ldAnimating) return;
  const canvas = document.getElementById('ld-canvas');
  if (!canvas) return;

  const W = canvas.width, H = canvas.height;
  const n = _ldLadder.n;
  const padTop = 50, padBot = 55;
  const lineTop = padTop, lineBot = H - padBot;
  const lineH = lineBot - lineTop;
  const spacing = n > 1 ? (W - 60) / (n - 1) : W - 60;
  const colX = i => 30 + i * spacing;
  const rowY = r => lineTop + (r / _ldLadder.rowCount) * lineH;

  const { pts, resultCol } = _ldGetPath(nameIdx, _ldLadder, colX, rowY);

  let totalLen = 0;
  for (let i = 1; i < pts.length; i++) {
    const dx = pts[i].x - pts[i-1].x, dy = pts[i].y - pts[i-1].y;
    totalLen += Math.sqrt(dx*dx + dy*dy);
  }
  const duration = Math.max(900, Math.min(2200, totalLen * 1.6));
  const startTime = performance.now();
  _ldAnimating = true;

  const rc = document.getElementById('ld-result-card');
  if (rc) rc.style.display = 'none';
  const instr = document.getElementById('ld-instruction');
  if (instr) instr.textContent = '⏳ 이동 중...';

  // 자동 입력창 접기
  if (_gcInputOpen) _gcToggleInput();

  function frame(now) {
    const progress = Math.min(1, (now - startTime) / duration);
    _ldDrawCanvas(_ldLadder, pts, progress);
    if (progress < 1) {
      _ldAnimId2 = requestAnimationFrame(frame);
    } else {
      _ldAnimating = false;
      _ldAnimId2 = null;
      if (instr) instr.textContent = '이름을 클릭하면 사다리를 타요!';

      const resName = _ldLadder.names[nameIdx];
      const resItem = _ldLadder.items[resultCol];

      if (rc) rc.style.display = 'none';

      // (요청사항) 결과는 팝업으로 표시
      try{
        if(typeof window._rrShowPopup==='function'){
          window._rrShowPopup('🪜 사다리 결과', `<div style="text-align:center;padding:6px 4px">
            <div style="font-size:var(--fs-lg);font-weight:1000;color:var(--text1);margin-bottom:6px">${resName}</div>
            <div style="font-size:var(--fs-sm);color:var(--text3);margin-bottom:6px">▼</div>
            <div style="font-size:20px;font-weight:1000;color:#2563eb">${resItem}</div>
          </div>`);
        }
      }catch(e){}

      // 기록 저장
      const now2 = new Date();
      const timeStr = String(now2.getHours()).padStart(2,'0') + ':' + String(now2.getMinutes()).padStart(2,'0');
      _gcHistory.ladder.push({ name: resName, item: resItem, time: timeStr });
      if (_gcHistory.ladder.length > 30) _gcHistory.ladder = _gcHistory.ladder.slice(-30);
      try{ if(typeof MiscStore!=='undefined') MiscStore.set('su_gc_hist_l', _gcHistory.ladder); else localStorage.setItem('su_gc_hist_l', JSON.stringify(_gcHistory.ladder)); }catch(e){}
      _ldRefreshHistory();

      // 효과음
      try {
        if (!_gcAudioCtx) _gcAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (_gcAudioCtx.state === 'suspended') _gcAudioCtx.resume().catch(()=>{});
      } catch(e) {}
      [0, 0.08, 0.16, 0.27].forEach((t, i) => {
        setTimeout(() => {
          const o = _gcAudioCtx.createOscillator(), g = _gcAudioCtx.createGain();
          o.type = 'sine'; o.frequency.value = [523,659,784,1047][i];
          g.gain.setValueAtTime(0.18, _gcAudioCtx.currentTime);
          g.gain.exponentialRampToValueAtTime(0.01, _gcAudioCtx.currentTime + 0.25);
          o.connect(g); g.connect(_gcAudioCtx.destination);
          o.start(); o.stop(_gcAudioCtx.currentTime + 0.25);
        }, t * 1000);
      });
    }
  }
  requestAnimationFrame(frame);
}

function _ldRefreshHistory() {
  const hist = _gcHistory.ladder;
  const container = document.getElementById('ld-hist-box');
  if (!container) return;
  const fs  = Math.max(12, Math.round(window._GC_DOME * 0.07));
  const pad = Math.max(12, Math.round(window._GC_DOME * 0.08));
  if (!hist.length) { container.innerHTML = ''; return; }
  container.style.cssText = `background:var(--white);border:2px solid var(--border);border-radius:14px;padding:${pad}px;margin-top:${Math.round(pad*0.5)}px`;
  container.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
      <span style="font-size:${fs}px;font-weight:700;color:var(--text2)">📋 결과 기록 (${hist.length})</span>
      <button onclick="_ldClearHistory()" style="font-size:${Math.max(10,fs-2)}px;padding:3px 8px;border-radius:6px;border:1px solid var(--border);background:var(--surface);color:var(--text3);cursor:pointer">전체 삭제</button>
    </div>
    <div style="display:flex;flex-direction:column;gap:4px;max-height:180px;overflow-y:auto">
      ${hist.slice().reverse().map((r,i) => `
      <div style="display:flex;align-items:center;gap:6px;padding:5px 8px;background:var(--surface);border-radius:8px;font-size:${fs}px">
        <span style="color:var(--text3);min-width:18px;text-align:right">${hist.length-i}</span>
        <span style="font-weight:700;color:#FF4B6E">${r.name}</span>
        <span style="color:var(--text3)">→</span>
        <span style="font-weight:700;flex:1;color:var(--text1)">${r.item}</span>
        <span style="color:var(--text3);font-size:${Math.max(10,fs-2)}px">${r.time}</span>
      </div>`).join('')}
    </div>`;
}

function _ldClearHistory() {
  _gcHistory.ladder = [];
  try{ if(typeof MiscStore!=='undefined') MiscStore.delete('su_gc_hist_l'); else localStorage.removeItem('su_gc_hist_l'); }catch(e){}
  _ldRefreshHistory();
}

