/* ══════════════════════════════════════════════════════════════
   경기기록 - H2H 카드 스타일 (스코어바/아웃라인/리본/그리드/포스터/배틀/네온) & 디스패처 (match-builder-record-views.js 에서 분리, 2026-07-30)
   ══════════════════════════════════════════════════════════════ */

function _h2hScoreBarCard(s, p1wins, p2wins, winner, p1col, p2col, isMb){
  const p1 = players.find(x=>x.name===s.p1)||{};
  const p2 = players.find(x=>x.name===s.p2)||{};
  const tot = (p1wins||0) + (p2wins||0);
  const p1r = tot ? Math.round((p1wins / tot) * 100) : 50;
  const win1 = p1wins > p2wins, win2 = p2wins > p1wins;
  const hPad = isMb ? 12 : 14;
  return `<div style="padding:${hPad}px ${hPad}px ${hPad-2}px;display:flex;flex-direction:column;gap:${isMb?10:12}px">
    <div style="display:flex;align-items:center;justify-content:space-between;gap:10px">
      <div style="min-width:0">
        <div style="font-weight:1000;font-size:${isMb?13:15}px;color:${win1?p1col:'var(--text)'};white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${s.p1}</div>
        <div style="font-size:10px;color:var(--gray-l);font-weight:800">${p1.univ||''}</div>
      </div>
      <div style="flex-shrink:0;display:flex;align-items:center;gap:0;font-size:${isMb?24:30}px;font-weight:1000;letter-spacing:-2px;line-height:1">
        <span style="color:${win1?p1col:(win2?'#94a3b8':'var(--text2)')}">${p1wins}</span>
        <span style="font-size:${isMb?14:16}px;color:#94a3b8;font-weight:900;margin:0 5px">:</span>
        <span style="color:${win2?p2col:(win1?'#94a3b8':'var(--text2)')}">${p2wins}</span>
      </div>
      <div style="min-width:0;text-align:right">
        <div style="font-weight:1000;font-size:${isMb?13:15}px;color:${win2?p2col:'var(--text)'};white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${s.p2}</div>
        <div style="font-size:10px;color:var(--gray-l);font-weight:800">${p2.univ||''}</div>
      </div>
    </div>
    <div style="height:8px;border-radius:999px;background:var(--border);overflow:hidden;display:flex">
      <div style="width:${p1r}%;background:${p1col};"></div>
      <div style="width:${100-p1r}%;background:${p2col};"></div>
    </div>
    <div style="display:flex;justify-content:space-between;font-size:10px;color:var(--gray-l);font-weight:900">
      <span style="color:${p1col}">${p1r}%</span>
      <span style="color:${p2col}">${100-p1r}%</span>
    </div>
  </div>`;
}

function _h2hOutlineCard(s, p1wins, p2wins, winner, p1col, p2col, isMb){
  const p1 = players.find(x=>x.name===s.p1)||{};
  const p2 = players.find(x=>x.name===s.p2)||{};
  const win1 = p1wins > p2wins, win2 = p2wins > p1wins;
  const pad = isMb ? 12 : 14;
  const chip = (txt, col, on)=>`<span style="display:inline-flex;align-items:center;gap:6px;padding:7px 10px;border-radius:12px;border:2px solid ${col}66;background:${on?col+'14':'transparent'};min-width:0">
    ${getPlayerPhotoHTML?getPlayerPhotoHTML(txt, isMb?'22px':'26px'):''}
    <span style="font-weight:1000;font-size:${isMb?13:15}px;color:${on?col:'var(--text)'};white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${txt}</span>
  </span>`;
  return `<div style="padding:${pad}px ${pad}px ${pad-2}px;position:relative">
    <div style="position:absolute;left:50%;top:${isMb?14:18}px;transform:translateX(-50%);font-size:${isMb?34:40}px;font-weight:1000;color:rgba(148,163,184,.18);letter-spacing:2px;pointer-events:none">VS</div>
    <div style="display:flex;align-items:center;gap:${isMb?10:14}px;flex-wrap:wrap;justify-content:space-between">
      <div style="display:flex;flex-direction:column;gap:6px;flex:1;min-width:140px">
        ${chip(s.p1, p1col, win1)}
        <div style="font-size:10px;color:var(--gray-l);font-weight:800;margin-left:6px">${p1.univ||''}</div>
      </div>
      <div style="display:flex;align-items:center;gap:0;font-size:${isMb?24:30}px;font-weight:1000;letter-spacing:-2px;line-height:1;flex-shrink:0">
        <span style="color:${win1?p1col:(win2?'#94a3b8':'var(--text2)')}">${p1wins}</span>
        <span style="font-size:${isMb?14:16}px;color:#94a3b8;font-weight:900;margin:0 6px">:</span>
        <span style="color:${win2?p2col:(win1?'#94a3b8':'var(--text2)')}">${p2wins}</span>
      </div>
      <div style="display:flex;flex-direction:column;gap:6px;flex:1;min-width:140px;align-items:flex-end">
        ${chip(s.p2, p2col, win2)}
        <div style="font-size:10px;color:var(--gray-l);font-weight:800;margin-right:6px">${p2.univ||''}</div>
      </div>
    </div>
  </div>`;
}

function _h2hRibbonCard(s, p1wins, p2wins, winner, p1col, p2col, isMb){
  const p1 = players.find(x=>x.name===s.p1)||{};
  const p2 = players.find(x=>x.name===s.p2)||{};
  const win1 = p1wins > p2wins, win2 = p2wins > p1wins;
  const w = (win1||win2) ? (win1?p1col:p2col) : '#64748b';
  const pad = isMb ? 12 : 14;
  return `<div style="position:relative;overflow:hidden">
    <div style="position:absolute;left:-50px;top:12px;width:180px;height:28px;background:${w};transform:rotate(-18deg);box-shadow:0 8px 18px ${w}44;opacity:${(win1||win2)?0.92:0.45}"></div>
    <div style="padding:${pad}px ${pad}px ${pad-2}px;display:flex;flex-direction:column;gap:${isMb?10:12}px">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:10px">
        <div style="min-width:0">
          <div style="font-weight:1000;font-size:${isMb?13:15}px;color:${win1?p1col:'var(--text)'};white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${s.p1}</div>
          <div style="font-size:10px;color:var(--gray-l);font-weight:800">${p1.univ||''}</div>
        </div>
        <div style="flex-shrink:0;display:flex;align-items:center;gap:0;font-size:${isMb?24:30}px;font-weight:1000;letter-spacing:-2px;line-height:1">
          <span style="color:${win1?p1col:(win2?'#94a3b8':'var(--text2)')}">${p1wins}</span>
          <span style="font-size:${isMb?14:16}px;color:#94a3b8;font-weight:900;margin:0 6px">:</span>
          <span style="color:${win2?p2col:(win1?'#94a3b8':'var(--text2)')}">${p2wins}</span>
        </div>
        <div style="min-width:0;text-align:right">
          <div style="font-weight:1000;font-size:${isMb?13:15}px;color:${win2?p2col:'var(--text)'};white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${s.p2}</div>
          <div style="font-size:10px;color:var(--gray-l);font-weight:800">${p2.univ||''}</div>
        </div>
      </div>
      ${(win1||win2)?`<div style="display:flex;justify-content:flex-end"><span style="font-size:9px;font-weight:900;padding:2px 10px;border-radius:999px;background:${w};color:#fff;white-space:nowrap;box-shadow:0 1px 8px ${w}55">${win1?s.p1:s.p2} 승</span></div>`:''}
    </div>
  </div>`;
}

function _h2hGridCard(s, p1wins, p2wins, winner, p1col, p2col, isMb){
  const p1 = players.find(x=>x.name===s.p1)||{};
  const p2 = players.find(x=>x.name===s.p2)||{};
  const win1 = p1wins > p2wins, win2 = p2wins > p1wins;
  const pad = isMb ? 12 : 14;
  const av = (pName, col)=>{
    const p = players.find(x=>x.name===pName)||{};
    const sz = isMb ? 34 : 40;
    if(p.photo) return `<img src="${toHttpsUrl(p.photo)}" style="width:${sz}px;height:${sz}px;border-radius:14px;object-fit:cover;border:2px solid ${col};flex-shrink:0">`;
    return `<div style="width:${sz}px;height:${sz}px;border-radius:14px;background:${col}22;border:2px solid ${col};display:flex;align-items:center;justify-content:center;font-weight:1000;font-size:${isMb?14:16}px;color:${col};flex-shrink:0">${(pName||'?').slice(0,1)}</div>`;
  };
  return `<div style="padding:${pad}px ${pad}px ${pad-2}px">
    <div style="display:grid;grid-template-columns:1fr auto 1fr;gap:${isMb?10:14}px;align-items:center">
      <div style="display:flex;align-items:center;gap:10px;min-width:0">
        ${av(s.p1, p1col)}
        <div style="min-width:0">
          <div style="font-weight:1000;font-size:${isMb?13:15}px;color:${win1?p1col:'var(--text)'};white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${s.p1}</div>
          <div style="font-size:10px;color:var(--gray-l);font-weight:800">${p1.univ||''}</div>
        </div>
      </div>
      <div style="display:flex;flex-direction:column;align-items:center;gap:4px;flex-shrink:0">
        <div style="font-size:${isMb?24:30}px;font-weight:1000;letter-spacing:-2px;line-height:1">
          <span style="color:${win1?p1col:(win2?'#94a3b8':'var(--text2)')}">${p1wins}</span>
          <span style="font-size:${isMb?14:16}px;color:#94a3b8;font-weight:900;margin:0 6px">:</span>
          <span style="color:${win2?p2col:(win1?'#94a3b8':'var(--text2)')}">${p2wins}</span>
        </div>
        ${(win1||win2)?`<span style="font-size:10px;font-weight:900;padding:2px 8px;border-radius:999px;background:${win1?p1col:p2col}22;color:${win1?p1col:p2col};border:1px solid ${win1?p1col:p2col}33;white-space:nowrap">${win1?s.p1:s.p2} 승</span>`:''}
      </div>
      <div style="display:flex;align-items:center;gap:10px;min-width:0;justify-content:flex-end;text-align:right">
        <div style="min-width:0">
          <div style="font-weight:1000;font-size:${isMb?13:15}px;color:${win2?p2col:'var(--text)'};white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${s.p2}</div>
          <div style="font-size:10px;color:var(--gray-l);font-weight:800">${p2.univ||''}</div>
        </div>
        ${av(s.p2, p2col)}
      </div>
    </div>
  </div>`;
}

function _h2hPosterCard(s, p1wins, p2wins, winner, p1col, p2col, isMb){
  const p1 = players.find(x=>x.name===s.p1)||{};
  const p2 = players.find(x=>x.name===s.p2)||{};
  const win1 = p1wins > p2wins, win2 = p2wins > p1wins;
  const h = isMb ? 126 : 148;
  const p1pos = _h2hPlayerBgPos(s.p1);
  const p2pos = _h2hPlayerBgPos(s.p2);
  const bg = (p1.photo || p2.photo)
    ? `linear-gradient(90deg, ${p1col}55, rgba(15,23,42,.22), ${p2col}55), url('${toHttpsUrl(p1.photo||p2.photo)}')`
    : `linear-gradient(90deg, ${p1col}66, rgba(255,255,255,.15), ${p2col}66)`;
  return `<div style="position:relative;height:${h}px;overflow:hidden;border-radius:var(--h2h-card-radius,12px) var(--h2h-card-radius,12px) 0 0">
    <div style="position:absolute;inset:0;background-image:${bg};background-size:cover;background-position:${p1.photo?p1pos:p2pos};filter:blur(2px) saturate(1.1);transform:scale(1.02)"></div>
    <div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(15,23,42,.35),rgba(15,23,42,.60))"></div>
    <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;padding:${isMb?'12px':'16px'}">
      <div style="display:grid;grid-template-columns:1fr auto 1fr;gap:${isMb?10:14}px;align-items:center;width:100%;max-width:${isMb?'520px':'720px'}">
        <div style="background:rgba(255,255,255,.14);border:1px solid rgba(255,255,255,.22);border-radius:18px;padding:${isMb?'10px 10px':'12px 14px'};backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);box-shadow:0 10px 24px rgba(0,0,0,.18)">
          <div style="font-weight:1000;font-size:${isMb?13:15}px;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${s.p1}</div>
          <div style="font-size:10px;color:rgba(255,255,255,.72);font-weight:800">${p1.univ||''}</div>
          ${win1?`<div style="margin-top:6px;font-size:9px;font-weight:900;color:${p1col}">👑 승</div>`:''}
        </div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:4px">
          <div style="font-size:${isMb?30:38}px;font-weight:1000;color:#fff;letter-spacing:-2px;line-height:1;text-shadow:0 2px 16px rgba(0,0,0,.55)">${p1wins}<span style="font-size:${isMb?16:20}px;color:rgba(255,255,255,.55);margin:0 6px">:</span>${p2wins}</div>
          <div style="font-size:9px;color:rgba(255,255,255,.55);font-weight:900;letter-spacing:2px">VS</div>
        </div>
        <div style="background:rgba(255,255,255,.14);border:1px solid rgba(255,255,255,.22);border-radius:18px;padding:${isMb?'10px 10px':'12px 14px'};backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);box-shadow:0 10px 24px rgba(0,0,0,.18);text-align:right">
          <div style="font-weight:1000;font-size:${isMb?13:15}px;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${s.p2}</div>
          <div style="font-size:10px;color:rgba(255,255,255,.72);font-weight:800">${p2.univ||''}</div>
          ${win2?`<div style="margin-top:6px;font-size:9px;font-weight:900;color:${p2col}">👑 승</div>`:''}
        </div>
      </div>
    </div>
  </div>`;
}

// ──────────────────────────────────────────────────────────────
// 배틀(battle) 카드: ⚔️ 대결 모드 — 사선 분할선 + 컬러 에너지 스트라이프
// su_h2h_card_mode = 'battle'
// ──────────────────────────────────────────────────────────────
function _h2hBattleCard(s, p1wins, p2wins, winner, p1col, p2col, isMb){
  const p1 = players.find(x=>x.name===s.p1)||{};
  const p2 = players.find(x=>x.name===s.p2)||{};
  const win1 = p1wins > p2wins, win2 = p2wins > p1wins;
  const h = isMb ? 108 : 126;
  const p1pos = _h2hPlayerBgPos(s.p1);
  const p2pos = _h2hPlayerBgPos(s.p2);
  const loser1 = !win1 && win2, loser2 = !win2 && win1;
  const totalGames = p1wins + p2wins;
  const barW1 = totalGames > 0 ? Math.round((p1wins / totalGames) * 100) : 50;
  const diag = isMb ? 28 : 36;

  const av = (pName, col)=>{
    const p = players.find(x=>x.name===pName)||{};
    const sz = isMb ? 40 : 48;
    if(p.photo) return `<div style="width:${sz}px;height:${sz}px;border-radius:var(--r);overflow:hidden;border:2.5px solid rgba(255,255,255,.55);box-shadow:0 0 0 2px ${col}66,0 6px 18px rgba(0,0,0,.28);flex-shrink:0"><img src="${toHttpsUrl(p.photo)}" style="width:100%;height:100%;object-fit:cover"></div>`;
    return `<div style="width:${sz}px;height:${sz}px;border-radius:var(--r);background:${col}33;border:2.5px solid rgba(255,255,255,.4);display:flex;align-items:center;justify-content:center;font-weight:1000;font-size:${isMb?17:20}px;color:rgba(255,255,255,.9);flex-shrink:0">${(pName||'?').slice(0,1)}</div>`;
  };

  return `<div style="position:relative;height:${h}px;overflow:hidden;border-radius:var(--h2h-card-radius,12px) var(--h2h-card-radius,12px) 0 0">
    <div style="position:absolute;inset:0;display:grid;grid-template-columns:1fr 1fr">
      <div style="background:linear-gradient(135deg,${p1col},${p1col}cc,${p1col}88);${loser1?'filter:grayscale(.08) saturate(1.02) brightness(.97);':''}"></div>
      <div style="background:linear-gradient(225deg,${p2col},${p2col}cc,${p2col}88);${loser2?'filter:grayscale(.08) saturate(1.02) brightness(.97);':''}"></div>
    </div>
    <svg style="position:absolute;inset:0;width:100%;height:100%;pointer-events:none" preserveAspectRatio="none" viewBox="0 0 400 ${h}">
      <polygon points="${200-diag},0 ${200+diag},0 ${200+diag},${h} ${200-diag},${h}" fill="rgba(0,0,0,.30)"/>
      <line x1="${200-diag}" y1="0" x2="${200-diag}" y2="${h}" stroke="rgba(255,255,255,.18)" stroke-width="1"/>
      <line x1="${200+diag}" y1="0" x2="${200+diag}" y2="${h}" stroke="rgba(255,255,255,.18)" stroke-width="1"/>
    </svg>
    <div style="position:absolute;top:0;left:0;right:0;height:${isMb?4:5}px;display:flex">
      <div style="height:100%;background:${p1col};width:${barW1}%;box-shadow:0 0 8px ${p1col}88"></div>
      <div style="height:100%;background:${p2col};flex:1;box-shadow:0 0 8px ${p2col}88"></div>
    </div>
    <div style="position:absolute;inset:0;display:grid;grid-template-columns:1fr auto 1fr;align-items:center;padding:${isMb?'12px 10px':'14px 14px'}">
      <div style="display:flex;align-items:center;gap:${isMb?7:9}px;min-width:0">
        ${av(s.p1, p1col)}
        <div style="min-width:0">
          <div style="font-weight:1000;font-size:${isMb?13:15}px;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-shadow:0 1px 6px rgba(0,0,0,.5)">${s.p1}</div>
          <div style="font-size:${isMb?9:10}px;color:rgba(255,255,255,.75);font-weight:800">${p1.univ||''}</div>
          ${win1?`<div style="margin-top:3px;font-size:9px;font-weight:900;color:#fff;background:rgba(255,255,255,.22);border:1px solid rgba(255,255,255,.35);border-radius:99px;padding:1px 7px;display:inline-block">👑 승</div>`:''}
        </div>
      </div>
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:${isMb?3:4}px;min-width:${isMb?68:82}px">
        <div style="font-size:${isMb?9:10}px;font-weight:900;letter-spacing:2.5px;color:rgba(255,255,255,.6)">VS</div>
        <div style="display:flex;align-items:center;gap:0;font-size:${isMb?28:36}px;font-weight:1000;letter-spacing:-2px;line-height:1">
          <span style="color:#fff;text-shadow:0 0 18px ${win1?p1col+'cc':'rgba(255,255,255,.3)'}">${p1wins}</span>
          <span style="font-size:${isMb?14:17}px;color:rgba(255,255,255,.45);font-weight:900;margin:0 5px">:</span>
          <span style="color:#fff;text-shadow:0 0 18px ${win2?p2col+'cc':'rgba(255,255,255,.3)'}">${p2wins}</span>
        </div>
        ${(win1||win2)?`<div style="font-size:9px;font-weight:900;color:rgba(255,255,255,.55);background:rgba(255,255,255,.12);border-radius:99px;padding:1px 8px;white-space:nowrap">${win1?s.p1:s.p2}</div>`:
        `<div style="font-size:9px;font-weight:900;color:rgba(255,255,255,.4)">무승부</div>`}
      </div>
      <div style="display:flex;align-items:center;gap:${isMb?7:9}px;justify-content:flex-end;min-width:0">
        <div style="min-width:0;text-align:right">
          <div style="font-weight:1000;font-size:${isMb?13:15}px;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-shadow:0 1px 6px rgba(0,0,0,.5)">${s.p2}</div>
          <div style="font-size:${isMb?9:10}px;color:rgba(255,255,255,.75);font-weight:800">${p2.univ||''}</div>
          ${win2?`<div style="margin-top:3px;font-size:9px;font-weight:900;color:#fff;background:rgba(255,255,255,.22);border:1px solid rgba(255,255,255,.35);border-radius:99px;padding:1px 7px;display:inline-block">👑 승</div>`:''}
        </div>
        ${av(s.p2, p2col)}
      </div>
    </div>
  </div>`;
}

// ──────────────────────────────────────────────────────────────
// 네온(neon) 카드: 형광 테두리 + 다크 배경 대결 스타일
// su_h2h_card_mode = 'neon'
// ──────────────────────────────────────────────────────────────
function _h2hNeonCard(s, p1wins, p2wins, winner, p1col, p2col, isMb){
  const p1 = players.find(x=>x.name===s.p1)||{};
  const p2 = players.find(x=>x.name===s.p2)||{};
  const win1 = p1wins > p2wins, win2 = p2wins > p1wins;
  const h = isMb ? 96 : 112;
  const totalGames = p1wins + p2wins;
  const barW1 = totalGames > 0 ? Math.round((p1wins / totalGames) * 100) : 50;

  const av = (pName, col)=>{
    const p = players.find(x=>x.name===pName)||{};
    const sz = isMb ? 36 : 42;
    if(p.photo) return `<div style="width:${sz}px;height:${sz}px;border-radius:50%;overflow:hidden;border:2px solid ${col};box-shadow:0 0 12px ${col}99,0 0 4px ${col}66;flex-shrink:0"><img src="${toHttpsUrl(p.photo)}" style="width:100%;height:100%;object-fit:cover"></div>`;
    return `<div style="width:${sz}px;height:${sz}px;border-radius:50%;background:${col}22;border:2px solid ${col};box-shadow:0 0 12px ${col}88;display:flex;align-items:center;justify-content:center;font-weight:1000;font-size:${isMb?15:17}px;color:${col};flex-shrink:0">${(pName||'?').slice(0,1)}</div>`;
  };

  return `<div style="position:relative;height:${h}px;overflow:hidden;border-radius:var(--h2h-card-radius,12px) var(--h2h-card-radius,12px) 0 0;background:linear-gradient(135deg,#0a0f1e,#0f172a,#0a0f1e)">
    <div style="position:absolute;top:-20%;left:-10%;width:55%;height:140%;background:radial-gradient(ellipse,${p1col}22 0%,transparent 70%);pointer-events:none"></div>
    <div style="position:absolute;top:-20%;right:-10%;width:55%;height:140%;background:radial-gradient(ellipse,${p2col}22 0%,transparent 70%);pointer-events:none"></div>
    <div style="position:absolute;bottom:0;left:0;right:0;height:${isMb?3:4}px;background:#111827">
      <div style="height:100%;background:linear-gradient(90deg,${p1col} ${barW1}%,${p2col} ${barW1}%);box-shadow:0 0 8px ${win1?p1col:p2col}88"></div>
    </div>
    <div style="position:absolute;inset:0;display:grid;grid-template-columns:1fr auto 1fr;align-items:center;padding:${isMb?'12px 10px':'14px 14px'}">
      <div style="display:flex;align-items:center;gap:${isMb?7:9}px;min-width:0">
        ${av(s.p1, win1?p1col:'#334155')}
        <div style="min-width:0">
          <div style="font-weight:1000;font-size:${isMb?13:15}px;color:${win1?p1col:'#94a3b8'};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;${win1?`text-shadow:0 0 12px ${p1col}88;`:''}">${s.p1}</div>
          <div style="font-size:${isMb?9:10}px;color:#475569;font-weight:800">${p1.univ||''}</div>
          ${win1?`<div style="margin-top:3px;font-size:9px;font-weight:900;color:${p1col};text-shadow:0 0 8px ${p1col}">⚡ 승리</div>`:''}
        </div>
      </div>
      <div style="display:flex;flex-direction:column;align-items:center;gap:${isMb?3:4}px;min-width:${isMb?70:84}px">
        <div style="width:${isMb?36:44}px;height:${isMb?36:44}px;border-radius:50%;background:#0f172a;border:2px solid rgba(255,255,255,.10);display:flex;align-items:center;justify-content:center">
          <span style="font-size:${isMb?10:12}px;font-weight:900;color:rgba(255,255,255,.5);letter-spacing:1px">VS</span>
        </div>
        <div style="display:flex;align-items:center;font-size:${isMb?26:32}px;font-weight:1000;letter-spacing:-2px;line-height:1">
          <span style="color:${win1?p1col:'#64748b'};${win1?`text-shadow:0 0 20px ${p1col}99;`:''}">${p1wins}</span>
          <span style="font-size:${isMb?13:15}px;color:#334155;font-weight:900;margin:0 5px">:</span>
          <span style="color:${win2?p2col:'#64748b'};${win2?`text-shadow:0 0 20px ${p2col}99;`:''}">${p2wins}</span>
        </div>
      </div>
      <div style="display:flex;align-items:center;gap:${isMb?7:9}px;justify-content:flex-end;min-width:0">
        <div style="min-width:0;text-align:right">
          <div style="font-weight:1000;font-size:${isMb?13:15}px;color:${win2?p2col:'#94a3b8'};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;${win2?`text-shadow:0 0 12px ${p2col}88;`:''}">${s.p2}</div>
          <div style="font-size:${isMb?9:10}px;color:#475569;font-weight:800">${p2.univ||''}</div>
          ${win2?`<div style="margin-top:3px;font-size:9px;font-weight:900;color:${p2col};text-shadow:0 0 8px ${p2col}">⚡ 승리</div>`:''}
        </div>
        ${av(s.p2, win2?p2col:'#334155')}
      </div>
    </div>
  </div>`;
}

// 카드 모드별 본문 렌더링 디스패처
function _h2hCardBody(mode, s, p1wins, p2wins, winner, p1col, p2col, gridCols, isMb, scorePad, scoreGap, bulkCb, p1bgPanel, p2bgPanel, scoreColP1, scoreColP2){
  if(mode === 'banner') return _h2hBannerCard(s, p1wins, p2wins, winner, p1col, p2col, isMb);
  if(mode === 'minimal') return _h2hMinimalCard(s, p1wins, p2wins, winner, p1col, p2col, isMb);
  if(mode === 'photo') return _h2hPhotoFullCard(s, p1wins, p2wins, winner, p1col, p2col, isMb);
  if(mode === 'classic') return _h2hClassicCard(s, p1wins, p2wins, winner, p1col, p2col, isMb);
  if(mode === 'stack') return _h2hStackCard(s, p1wins, p2wins, winner, p1col, p2col, isMb);
  if(mode === 'duotone') return _h2hDuoToneCard(s, p1wins, p2wins, winner, p1col, p2col, isMb);
  if(mode === 'split') return _h2hSplitCard(s, p1wins, p2wins, winner, p1col, p2col, isMb);
  if(mode === 'glass') return _h2hGlassCard(s, p1wins, p2wins, winner, p1col, p2col, isMb);
  if(mode === 'pill') return _h2hPillCard(s, p1wins, p2wins, winner, p1col, p2col, isMb);
  if(mode === 'bar') return _h2hScoreBarCard(s, p1wins, p2wins, winner, p1col, p2col, isMb);
  if(mode === 'outline') return _h2hOutlineCard(s, p1wins, p2wins, winner, p1col, p2col, isMb);
  if(mode === 'ribbon') return _h2hRibbonCard(s, p1wins, p2wins, winner, p1col, p2col, isMb);
  if(mode === 'grid') return _h2hGridCard(s, p1wins, p2wins, winner, p1col, p2col, isMb);
  if(mode === 'poster') return _h2hPosterCard(s, p1wins, p2wins, winner, p1col, p2col, isMb);
  if(mode === 'battle') return _h2hBattleCard(s, p1wins, p2wins, winner, p1col, p2col, isMb);
  if(mode === 'neon') return _h2hNeonCard(s, p1wins, p2wins, winner, p1col, p2col, isMb);
  // 기본: panel 모드
  const win1 = p1wins > p2wins, win2 = p2wins > p1wins;
  const scoreFs = isMb ? 26 : 32, dashFs = isMb ? 16 : 18;
  const rowScroll = isMb ? 'overflow-x:auto;-webkit-overflow-scrolling:touch;' : '';
  return `<div style="display:grid;grid-template-columns:${gridCols};align-items:center;padding:${isMb?'10px 10px':'14px 14px'};gap:${scoreGap}px;${rowScroll}">
    ${bulkCb||''}
    <div style="display:flex;align-items:center;justify-content:flex-end;width:100%">${p1bgPanel}</div>
    <div style="display:flex;flex-direction:column;align-items:center;gap:4px;padding:0 ${scorePad}px;flex-shrink:0">
      <div style="font-size:${scoreFs}px;font-weight:900;letter-spacing:-2px;line-height:1;display:flex;align-items:center;gap:0">
        <span style="color:${scoreColP1};transition:color .15s;text-shadow:${win1?'0 1px 8px '+p1col+'55':''}">${p1wins}</span>
        <span style="font-size:${dashFs}px;color:#64748b;font-weight:900;margin:0 6px">:</span>
        <span style="color:${scoreColP2};transition:color .15s;text-shadow:${win2?'0 1px 8px '+p2col+'55':''}">${p2wins}</span>
      </div>
      ${(win1||win2)?`<div style="font-size:9px;font-weight:800;padding:2px 8px;border-radius:99px;background:${win1?p1col:p2col};color:#fff;white-space:nowrap;letter-spacing:.3px;box-shadow:0 1px 6px ${win1?p1col:p2col}55">${win1?s.p1:s.p2} 승</div>`:''}
    </div>
    <div style="display:flex;align-items:center;justify-content:flex-start;width:100%">${p2bgPanel}</div>
  </div>`;
}

