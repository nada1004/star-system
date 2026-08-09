/* ══════════════════════════════════════════════════════════════
   경기기록 - H2H 카드 스타일 (배너/미니멀/클래식/스택/듀오톤/스플릿/글래스/필) (match-builder-record-views.js 에서 분리, 2026-07-30)
   ══════════════════════════════════════════════════════════════ */

function _h2hBannerCard(s, p1wins, p2wins, winner, p1col, p2col, isMb){
  const p1 = players.find(x=>x.name===s.p1)||{};
  const p2 = players.find(x=>x.name===s.p2)||{};
  const h = isMb ? 80 : 96;
  const p1bg = p1.photo ? `url('${toHttpsUrl(p1.photo)}')` : 'none';
  const p2bg = p2.photo ? `url('${toHttpsUrl(p2.photo)}')` : 'none';
  const p1pos = _h2hPlayerBgPos(s.p1);
  const p2pos = _h2hPlayerBgPos(s.p2);
  const win1 = p1wins > p2wins, win2 = p2wins > p1wins;
  const sc1 = win1 ? p1col : win2 ? '#94a3b8' : 'var(--text2)';
  const sc2 = win2 ? p2col : win1 ? '#94a3b8' : 'var(--text2)';
  const fs = isMb ? 26 : 32;
  return `<div style="display:grid;grid-template-columns:1fr auto 1fr;height:${h}px;position:relative;overflow:hidden;border-radius:var(--h2h-card-radius,12px) var(--h2h-card-radius,12px) 0 0">
    <div style="background-image:${p1bg};background-size:cover;background-position:${p1pos};position:relative;${!p1.photo?`background:linear-gradient(135deg,${p1col}33,${p1col}11);`:''}${!win1&&win2?'filter:grayscale(.14) saturate(1) brightness(.99);opacity:.94;':''}">
      <div style="position:absolute;inset:0;background:linear-gradient(90deg,rgba(15,23,42,.12),rgba(15,23,42,.5))"></div>
      <div style="position:absolute;bottom:8px;left:10px;right:0">
        <div style="font-weight:1000;font-size:${isMb?12:14}px;color:#fff;text-shadow:0 1px 6px rgba(0,0,0,.6);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${s.p1}</div>
        <div style="font-size:10px;color:rgba(255,255,255,.75);font-weight:800">${p1.univ||''}</div>
      </div>
    </div>
    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:0 14px;background:var(--white);border-left:1px solid rgba(255,255,255,.15);border-right:1px solid rgba(255,255,255,.15);z-index:2;min-width:70px">
      <div style="font-size:${fs}px;font-weight:900;letter-spacing:-2px;line-height:1;display:flex;align-items:center;gap:0">
        <span style="color:${sc1}">${p1wins}</span>
        <span style="font-size:${isMb?14:16}px;color:#64748b;font-weight:900;margin:0 5px">:</span>
        <span style="color:${sc2}">${p2wins}</span>
      </div>
      ${(win1||win2)?`<div style="margin-top:3px;font-size:9px;font-weight:800;padding:1px 7px;border-radius:99px;background:${win1?p1col:p2col};color:#fff;white-space:nowrap">${win1?s.p1:s.p2} 승</div>`:''}
    </div>
    <div style="background-image:${p2bg};background-size:cover;background-position:${p2pos};position:relative;${!p2.photo?`background:linear-gradient(225deg,${p2col}33,${p2col}11);`:''}${!win2&&win1?'filter:grayscale(.14) saturate(1) brightness(.99);opacity:.94;':''}">
      <div style="position:absolute;inset:0;background:linear-gradient(270deg,rgba(15,23,42,.12),rgba(15,23,42,.5))"></div>
      <div style="position:absolute;bottom:8px;right:10px;left:0;text-align:right">
        <div style="font-weight:1000;font-size:${isMb?12:14}px;color:#fff;text-shadow:0 1px 6px rgba(0,0,0,.6);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${s.p2}</div>
        <div style="font-size:10px;color:rgba(255,255,255,.75);font-weight:800">${p2.univ||''}</div>
      </div>
    </div>
  </div>`;
}

// 미니멀 카드: 텍스트+아바타, 배경 없음, 정갈한 수평 레이아웃
function _h2hMinimalCard(s, p1wins, p2wins, winner, p1col, p2col, isMb){
  const p1 = players.find(x=>x.name===s.p1)||{};
  const p2 = players.find(x=>x.name===s.p2)||{};
  const win1 = p1wins > p2wins, win2 = p2wins > p1wins;
  const sc1 = win1 ? p1col : win2 ? '#94a3b8' : 'var(--text2)';
  const sc2 = win2 ? p2col : win1 ? '#94a3b8' : 'var(--text2)';
  const av = (pName, col)=>{
    const p = players.find(x=>x.name===pName)||{};
    if(p.photo) return `<img src="${toHttpsUrl(p.photo)}" style="width:${isMb?34:40}px;height:${isMb?34:40}px;border-radius:50%;object-fit:cover;border:2px solid ${col};flex-shrink:0">`;
    return `<div style="width:${isMb?34:40}px;height:${isMb?34:40}px;border-radius:50%;background:${col}22;border:2px solid ${col};display:flex;align-items:center;justify-content:center;font-weight:900;font-size:${isMb?14:16}px;color:${col};flex-shrink:0">${(pName||'?').slice(0,1)}</div>`;
  };
  return `<div style="display:flex;align-items:center;gap:${isMb?10:14}px;padding:${isMb?'10px 12px':'14px 18px'}">
    <div style="display:flex;align-items:center;gap:${isMb?6:8}px;flex:1;min-width:0;justify-content:flex-end">
      <div style="text-align:right;min-width:0">
        <div style="font-weight:1000;font-size:${isMb?13:15}px;color:${win1?p1col:'var(--text)'};white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${s.p1}</div>
        <div style="font-size:10px;color:var(--gray-l)">${p1.univ||''}</div>
      </div>
      ${av(s.p1, p1col)}
    </div>
    <div style="display:flex;flex-direction:column;align-items:center;gap:2px;flex-shrink:0;min-width:${isMb?54:64}px">
      <div style="font-size:${isMb?22:26}px;font-weight:900;letter-spacing:-2px;line-height:1;display:flex;align-items:center">
        <span style="color:${sc1}">${p1wins}</span>
        <span style="font-size:${isMb?13:15}px;color:#94a3b8;margin:0 4px">:</span>
        <span style="color:${sc2}">${p2wins}</span>
      </div>
      ${(win1||win2)?`<div style="font-size:10px;font-weight:800;padding:2px 7px;border-radius:99px;background:${win1?p1col:p2col}22;color:${win1?p1col:p2col};border:1px solid ${win1?p1col:p2col}44;white-space:nowrap">${win1?s.p1:s.p2} 승</div>`:''}
    </div>
    <div style="display:flex;align-items:center;gap:${isMb?6:8}px;flex:1;min-width:0">
      ${av(s.p2, p2col)}
      <div style="min-width:0">
        <div style="font-weight:1000;font-size:${isMb?13:15}px;color:${win2?p2col:'var(--text)'};white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${s.p2}</div>
        <div style="font-size:10px;color:var(--gray-l)">${p2.univ||''}</div>
      </div>
    </div>
  </div>`;
}

// 사진전체 카드: 전면 배경 사진 (좌측 p1, 우측 p2), 중앙 스코어 오버레이
function _h2hPhotoFullCard(s, p1wins, p2wins, winner, p1col, p2col, isMb){
  const p1 = players.find(x=>x.name===s.p1)||{};
  const p2 = players.find(x=>x.name===s.p2)||{};
  const h = isMb ? 100 : 120;
  const p1pos = _h2hPlayerBgPos(s.p1);
  const p2pos = _h2hPlayerBgPos(s.p2);
  const win1 = p1wins > p2wins, win2 = p2wins > p1wins;
  const sc1 = win1 ? '#fff' : 'rgba(255,255,255,.55)';
  const sc2 = win2 ? '#fff' : 'rgba(255,255,255,.55)';
  const p1Shadow = win1 ? `0 0 0 3px ${p1col},0 0 0 5px rgba(255,255,255,.5)` : 'none';
  const p2Shadow = win2 ? `0 0 0 3px ${p2col},0 0 0 5px rgba(255,255,255,.5)` : 'none';
  return `<div style="position:relative;height:${h}px;overflow:hidden;border-radius:var(--h2h-card-radius,12px) var(--h2h-card-radius,12px) 0 0">
    <div style="position:absolute;inset:0;display:grid;grid-template-columns:1fr 1fr">
      <div style="${p1.photo?`background-image:url('${toHttpsUrl(p1.photo)}');background-size:cover;background-position:${p1pos};`:`background:linear-gradient(135deg,${p1col}66,${p1col}22);`}${!win1&&win2?'filter:grayscale(.12) saturate(1.01) brightness(.99);opacity:.93;':''}"></div>
      <div style="${p2.photo?`background-image:url('${toHttpsUrl(p2.photo)}');background-size:cover;background-position:${p2pos};`:`background:linear-gradient(225deg,${p2col}66,${p2col}22);`}${!win2&&win1?'filter:grayscale(.12) saturate(1.01) brightness(.99);opacity:.93;':''}"></div>
    </div>
    <div style="position:absolute;inset:0;background:linear-gradient(90deg,rgba(15,23,42,.55) 0%,rgba(15,23,42,.1) 30%,rgba(15,23,42,.1) 70%,rgba(15,23,42,.55) 100%)"></div>
    <div style="position:absolute;inset:0;display:grid;grid-template-columns:1fr auto 1fr;align-items:center;padding:0 10px">
      <div style="display:flex;flex-direction:column;gap:2px;text-align:left">
        <div style="font-weight:1000;font-size:${isMb?13:15}px;color:${sc1};text-shadow:0 1px 8px rgba(0,0,0,.7)">${s.p1}</div>
        <div style="font-size:10px;color:rgba(255,255,255,.7)">${p1.univ||''}</div>
        ${win1?`<div style="font-size:9px;font-weight:800;padding:1px 7px;border-radius:99px;background:${p1col};color:#fff;display:inline-block;box-shadow:${p1Shadow};width:fit-content">👑 승</div>`:''}
      </div>
      <div style="display:flex;flex-direction:column;align-items:center;gap:2px;padding:0 10px">
        <div style="font-size:${isMb?26:32}px;font-weight:900;color:#fff;line-height:1;letter-spacing:-2px;text-shadow:0 2px 12px rgba(0,0,0,.8)">${p1wins}<span style="font-size:${isMb?15:18}px;color:rgba(255,255,255,.6);margin:0 4px">:</span>${p2wins}</div>
        <div style="font-size:9px;color:rgba(255,255,255,.5);font-weight:700">VS</div>
      </div>
      <div style="display:flex;flex-direction:column;gap:2px;text-align:right;align-items:flex-end">
        <div style="font-weight:1000;font-size:${isMb?13:15}px;color:${sc2};text-shadow:0 1px 8px rgba(0,0,0,.7)">${s.p2}</div>
        <div style="font-size:10px;color:rgba(255,255,255,.7)">${p2.univ||''}</div>
        ${win2?`<div style="font-size:9px;font-weight:800;padding:1px 7px;border-radius:99px;background:${p2col};color:#fff;display:inline-block;box-shadow:${p2Shadow};width:fit-content">👑 승</div>`:''}
      </div>
    </div>
  </div>`;
}

// 클래식 카드: 텍스트 기반, 심플한 좌-이름-스코어-이름-우 한 줄
function _h2hClassicCard(s, p1wins, p2wins, winner, p1col, p2col, isMb){
  const win1 = p1wins > p2wins, win2 = p2wins > p1wins;
  return `<div style="display:flex;align-items:center;gap:${isMb?8:12}px;padding:${isMb?'12px':'14px 18px'};flex-wrap:nowrap">
    <div style="flex:1;min-width:0;text-align:right">
      <div style="font-weight:1000;font-size:${isMb?14:16}px;color:${win1?p1col:'var(--text)'};display:flex;align-items:center;justify-content:flex-end;gap:6px">
        ${getPlayerPhotoHTML?getPlayerPhotoHTML(s.p1,(isMb?'24px':'28px')):''}
        <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${s.p1}</span>
      </div>
      ${win1?`<div style="font-size:9px;color:${p1col};font-weight:800;text-align:right">● 승</div>`:''}
    </div>
    <div style="display:flex;align-items:center;gap:4px;flex-shrink:0">
      <span style="font-size:${isMb?24:30}px;font-weight:900;color:${win1?p1col:'#94a3b8'}">${p1wins}</span>
      <span style="font-size:${isMb?13:16}px;color:#94a3b8;font-weight:900">:</span>
      <span style="font-size:${isMb?24:30}px;font-weight:900;color:${win2?p2col:'#94a3b8'}">${p2wins}</span>
    </div>
    <div style="flex:1;min-width:0;text-align:left">
      <div style="font-weight:1000;font-size:${isMb?14:16}px;color:${win2?p2col:'var(--text)'};display:flex;align-items:center;gap:6px">
        <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${s.p2}</span>
        ${getPlayerPhotoHTML?getPlayerPhotoHTML(s.p2,(isMb?'24px':'28px')):''}
      </div>
      ${win2?`<div style="font-size:9px;color:${p2col};font-weight:800">● 승</div>`:''}
    </div>
  </div>`;
}

function _h2hStackCard(s, p1wins, p2wins, winner, p1col, p2col, isMb){
  const p1 = players.find(x=>x.name===s.p1)||{};
  const p2 = players.find(x=>x.name===s.p2)||{};
  const win1 = p1wins > p2wins, win2 = p2wins > p1wins;
  const topPad = isMb ? 10 : 14;
  const fs = isMb ? 28 : 34;
  const av = (pName, col)=>{
    const p = players.find(x=>x.name===pName)||{};
    const sz = isMb ? 34 : 40;
    if(p.photo) return `<img src="${toHttpsUrl(p.photo)}" style="width:${sz}px;height:${sz}px;border-radius:50%;object-fit:cover;border:2px solid ${col};flex-shrink:0">`;
    return `<div style="width:${sz}px;height:${sz}px;border-radius:50%;background:${col}22;border:2px solid ${col};display:flex;align-items:center;justify-content:center;font-weight:1000;font-size:${isMb?14:16}px;color:${col};flex-shrink:0">${(pName||'?').slice(0,1)}</div>`;
  };
  return `<div style="padding:${topPad}px ${topPad}px ${topPad-2}px;display:flex;flex-direction:column;gap:${isMb?10:12}px">
    <div style="display:flex;align-items:center;justify-content:space-between;gap:10px">
      <div style="display:flex;align-items:center;gap:8px;min-width:0">
        ${av(s.p1, p1col)}
        <div style="min-width:0">
          <div style="font-weight:1000;font-size:${isMb?14:16}px;color:${win1?p1col:'var(--text)'};white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${s.p1}</div>
          <div style="font-size:10px;color:var(--gray-l);font-weight:800">${p1.univ||''}</div>
        </div>
      </div>
      <div style="display:flex;align-items:center;gap:0;font-size:${fs}px;font-weight:1000;letter-spacing:-2px;line-height:1">
        <span style="color:${win1?p1col:(win2?'#94a3b8':'var(--text2)')}">${p1wins}</span>
        <span style="font-size:${isMb?15:18}px;color:#94a3b8;font-weight:900;margin:0 6px">:</span>
        <span style="color:${win2?p2col:(win1?'#94a3b8':'var(--text2)')}">${p2wins}</span>
      </div>
      <div style="display:flex;align-items:center;gap:8px;min-width:0;justify-content:flex-end">
        <div style="min-width:0;text-align:right">
          <div style="font-weight:1000;font-size:${isMb?14:16}px;color:${win2?p2col:'var(--text)'};white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${s.p2}</div>
          <div style="font-size:10px;color:var(--gray-l);font-weight:800">${p2.univ||''}</div>
        </div>
        ${av(s.p2, p2col)}
      </div>
    </div>
    ${(win1||win2)?`<div style="display:flex;justify-content:center"><span style="font-size:9px;font-weight:900;padding:2px 10px;border-radius:999px;background:${win1?p1col:p2col}22;color:${win1?p1col:p2col};border:1px solid ${win1?p1col:p2col}44;white-space:nowrap">${win1?s.p1:s.p2} 승</span></div>`:''}
  </div>`;
}

function _h2hDuoToneCard(s, p1wins, p2wins, winner, p1col, p2col, isMb){
  const p1 = players.find(x=>x.name===s.p1)||{};
  const p2 = players.find(x=>x.name===s.p2)||{};
  const win1 = p1wins > p2wins, win2 = p2wins > p1wins;
  const h = isMb ? 92 : 104;
  const av = (pName)=>{
    const p = players.find(x=>x.name===pName)||{};
    const sz = isMb ? 30 : 34;
    if(p.photo) return `<img src="${toHttpsUrl(p.photo)}" style="width:${sz}px;height:${sz}px;border-radius:12px;object-fit:cover;border:2px solid rgba(255,255,255,.55);box-shadow:0 4px 14px rgba(0,0,0,.18)">`;
    return `<div style="width:${sz}px;height:${sz}px;border-radius:12px;background:rgba(255,255,255,.22);border:2px solid rgba(255,255,255,.35);display:flex;align-items:center;justify-content:center;font-weight:1000;font-size:${isMb?13:14}px;color:#fff">${(pName||'?').slice(0,1)}</div>`;
  };
  return `<div style="display:grid;grid-template-columns:1fr auto 1fr;height:${h}px;overflow:hidden;border-radius:var(--h2h-card-radius,12px) var(--h2h-card-radius,12px) 0 0">
    <div style="background:linear-gradient(135deg,${p1col},${p1col}aa);display:flex;flex-direction:column;justify-content:center;padding:${isMb?'10px 10px':'12px 14px'};${!win1&&win2?'filter:grayscale(.1) saturate(1.01) brightness(.99);opacity:.95;':''}">
      <div style="display:flex;align-items:center;gap:8px;min-width:0">
        ${av(s.p1)}
        <div style="min-width:0">
          <div style="font-weight:1000;font-size:${isMb?13:15}px;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${s.p1}</div>
          <div style="font-size:10px;color:rgba(255,255,255,.75);font-weight:800">${p1.univ||''}</div>
        </div>
      </div>
      ${win1?`<div style="margin-top:6px;font-size:9px;font-weight:900;color:#fff;opacity:.95">👑 승</div>`:''}
    </div>
    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;background:var(--white);min-width:${isMb?76:90}px">
      <div style="font-size:${isMb?26:32}px;font-weight:1000;letter-spacing:-2px;line-height:1;display:flex;align-items:center">
        <span style="color:${win1?p1col:(win2?'#94a3b8':'var(--text2)')}">${p1wins}</span>
        <span style="font-size:${isMb?14:16}px;color:#94a3b8;font-weight:900;margin:0 5px">:</span>
        <span style="color:${win2?p2col:(win1?'#94a3b8':'var(--text2)')}">${p2wins}</span>
      </div>
      <div style="font-size:9px;color:#94a3b8;font-weight:900;letter-spacing:1px">VS</div>
    </div>
    <div style="background:linear-gradient(225deg,${p2col},${p2col}aa);display:flex;flex-direction:column;justify-content:center;padding:${isMb?'10px 10px':'12px 14px'};align-items:flex-end;text-align:right;${!win2&&win1?'filter:grayscale(.1) saturate(1.01) brightness(.99);opacity:.95;':''}">
      <div style="display:flex;align-items:center;gap:8px;min-width:0;justify-content:flex-end">
        <div style="min-width:0">
          <div style="font-weight:1000;font-size:${isMb?13:15}px;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${s.p2}</div>
          <div style="font-size:10px;color:rgba(255,255,255,.75);font-weight:800">${p2.univ||''}</div>
        </div>
        ${av(s.p2)}
      </div>
      ${win2?`<div style="margin-top:6px;font-size:9px;font-weight:900;color:#fff;opacity:.95">👑 승</div>`:''}
    </div>
  </div>`;
}

function _h2hSplitCard(s, p1wins, p2wins, winner, p1col, p2col, isMb){
  const p1 = players.find(x=>x.name===s.p1)||{};
  const p2 = players.find(x=>x.name===s.p2)||{};
  const win1 = p1wins > p2wins, win2 = p2wins > p1wins;
  const h = isMb ? 88 : 100;
  const pad = isMb ? 10 : 12;
  const av = (pName, col)=>{
    const p = players.find(x=>x.name===pName)||{};
    const sz = isMb ? 28 : 32;
    if(p.photo) return `<img src="${toHttpsUrl(p.photo)}" style="width:${sz}px;height:${sz}px;border-radius:50%;object-fit:cover;border:2px solid rgba(255,255,255,.55);flex-shrink:0">`;
    return `<div style="width:${sz}px;height:${sz}px;border-radius:50%;background:rgba(255,255,255,.22);border:2px solid rgba(255,255,255,.35);display:flex;align-items:center;justify-content:center;font-weight:1000;font-size:${isMb?12:13}px;color:#fff;flex-shrink:0">${(pName||'?').slice(0,1)}</div>`;
  };
  return `<div style="display:grid;grid-template-columns:1fr auto 1fr;height:${h}px;overflow:hidden;border-radius:var(--h2h-card-radius,12px) var(--h2h-card-radius,12px) 0 0">
    <div style="background:linear-gradient(135deg,${p1col}66,${p1col}18);display:flex;align-items:center;gap:10px;padding:${pad}px;${!win1&&win2?'filter:grayscale(.1) saturate(1.01) brightness(.99);opacity:.95;':''}">
      ${av(s.p1, p1col)}
      <div style="min-width:0">
        <div style="font-weight:1000;font-size:${isMb?13:15}px;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${s.p1}</div>
        <div style="font-size:10px;color:var(--gray-l);font-weight:800">${p1.univ||''}</div>
      </div>
    </div>
    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;background:var(--white);min-width:${isMb?74:86}px">
      <div style="font-size:${isMb?24:30}px;font-weight:1000;letter-spacing:-2px;line-height:1;display:flex;align-items:center">
        <span style="color:${win1?p1col:(win2?'#94a3b8':'var(--text2)')}">${p1wins}</span>
        <span style="font-size:${isMb?14:16}px;color:#94a3b8;font-weight:900;margin:0 5px">:</span>
        <span style="color:${win2?p2col:(win1?'#94a3b8':'var(--text2)')}">${p2wins}</span>
      </div>
      <div style="font-size:9px;color:#94a3b8;font-weight:900;letter-spacing:1px">VS</div>
    </div>
    <div style="background:linear-gradient(225deg,${p2col}66,${p2col}18);display:flex;align-items:center;gap:10px;padding:${pad}px;justify-content:flex-end;text-align:right;${!win2&&win1?'filter:grayscale(.1) saturate(1.01) brightness(.99);opacity:.95;':''}">
      <div style="min-width:0">
        <div style="font-weight:1000;font-size:${isMb?13:15}px;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${s.p2}</div>
        <div style="font-size:10px;color:var(--gray-l);font-weight:800">${p2.univ||''}</div>
      </div>
      ${av(s.p2, p2col)}
    </div>
  </div>`;
}

function _h2hGlassCard(s, p1wins, p2wins, winner, p1col, p2col, isMb){
  const p1 = players.find(x=>x.name===s.p1)||{};
  const p2 = players.find(x=>x.name===s.p2)||{};
  const win1 = p1wins > p2wins, win2 = p2wins > p1wins;
  const h = isMb ? 104 : 120;
  const p1pos = _h2hPlayerBgPos(s.p1);
  const p2pos = _h2hPlayerBgPos(s.p2);
  const bg1 = p1.photo ? `url('${toHttpsUrl(p1.photo)}')` : '';
  const bg2 = p2.photo ? `url('${toHttpsUrl(p2.photo)}')` : '';
  const sc1 = win1 ? p1col : win2 ? '#94a3b8' : 'var(--text2)';
  const sc2 = win2 ? p2col : win1 ? '#94a3b8' : 'var(--text2)';
  return `<div style="position:relative;height:${h}px;overflow:hidden;border-radius:var(--h2h-card-radius,12px) var(--h2h-card-radius,12px) 0 0">
    <div style="position:absolute;inset:0;display:grid;grid-template-columns:1fr 1fr">
      <div style="${bg1?`background-image:${bg1};background-size:cover;background-position:${p1pos};`:`background:linear-gradient(135deg,${p1col}66,${p1col}22);`}filter:blur(10px) saturate(1.15);transform:scale(1.06);"></div>
      <div style="${bg2?`background-image:${bg2};background-size:cover;background-position:${p2pos};`:`background:linear-gradient(225deg,${p2col}66,${p2col}22);`}filter:blur(10px) saturate(1.15);transform:scale(1.06);"></div>
    </div>
    <div style="position:absolute;inset:0;background:linear-gradient(90deg,rgba(15,23,42,.55),rgba(15,23,42,.10),rgba(15,23,42,.55))"></div>
    <div style="position:absolute;inset:${isMb?'10px 10px 12px':'12px 14px 14px'};border-radius:var(--r2);background:rgba(255,255,255,.62);backdrop-filter:blur(10px) saturate(1.2);-webkit-backdrop-filter:blur(10px) saturate(1.2);border:1px solid rgba(255,255,255,.55);box-shadow:0 12px 28px rgba(15,23,42,.16);display:flex;align-items:center;justify-content:space-between;gap:10px;padding:${isMb?'10px 12px':'12px 16px'}">
      <div style="min-width:0;display:flex;flex-direction:column;gap:3px">
        <div style="font-weight:1000;font-size:${isMb?13:15}px;color:${win1?p1col:'var(--text)'};white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${s.p1}</div>
        <div style="font-size:10px;color:var(--gray-l);font-weight:800">${p1.univ||''}</div>
      </div>
      <div style="display:flex;flex-direction:column;align-items:center;gap:2px;flex-shrink:0">
        <div style="font-size:${isMb?26:32}px;font-weight:1000;letter-spacing:-2px;line-height:1">
          <span style="color:${sc1}">${p1wins}</span>
          <span style="font-size:${isMb?14:16}px;color:#94a3b8;font-weight:900;margin:0 6px">:</span>
          <span style="color:${sc2}">${p2wins}</span>
        </div>
        ${(win1||win2)?`<div style="font-size:10px;font-weight:900;padding:2px 8px;border-radius:999px;background:${win1?p1col:p2col}22;color:${win1?p1col:p2col};border:1px solid ${win1?p1col:p2col}33;white-space:nowrap">${win1?s.p1:s.p2} 승</div>`:''}
      </div>
      <div style="min-width:0;display:flex;flex-direction:column;gap:3px;text-align:right;align-items:flex-end">
        <div style="font-weight:1000;font-size:${isMb?13:15}px;color:${win2?p2col:'var(--text)'};white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${s.p2}</div>
        <div style="font-size:10px;color:var(--gray-l);font-weight:800">${p2.univ||''}</div>
      </div>
    </div>
  </div>`;
}

function _h2hPillCard(s, p1wins, p2wins, winner, p1col, p2col, isMb){
  const p1 = players.find(x=>x.name===s.p1)||{};
  const p2 = players.find(x=>x.name===s.p2)||{};
  const win1 = p1wins > p2wins, win2 = p2wins > p1wins;
  const av = (pName, col)=>{
    const p = players.find(x=>x.name===pName)||{};
    const sz = isMb ? 26 : 30;
    if(p.photo) return `<img src="${toHttpsUrl(p.photo)}" style="width:${sz}px;height:${sz}px;border-radius:var(--su_profile_radius,999px);clip-path:var(--su_profile_clip,none);object-fit:cover;border:2px solid ${col};flex-shrink:0">`;
    return `<div style="width:${sz}px;height:${sz}px;border-radius:var(--su_profile_radius,999px);clip-path:var(--su_profile_clip,none);background:${col}22;border:2px solid ${col};display:flex;align-items:center;justify-content:center;font-weight:1000;font-size:${isMb?12:13}px;color:${col};flex-shrink:0">${(pName||'?').slice(0,1)}</div>`;
  };
  return `<div style="padding:${isMb?'12px 12px 14px':'14px 14px 16px'}">
    <div style="border-radius:999px;border:1.5px solid var(--border);background:linear-gradient(90deg,${p1col}12,rgba(255,255,255,.92),${p2col}12);box-shadow:0 10px 24px rgba(15,23,42,.08);display:flex;align-items:center;gap:10px;padding:${isMb?'10px 12px':'12px 14px'}">
      <div style="display:flex;align-items:center;gap:8px;flex:1;min-width:0">
        ${av(s.p1, p1col)}
        <div style="min-width:0">
          <div style="font-weight:1000;font-size:${isMb?13:15}px;color:${win1?p1col:'var(--text)'};white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${s.p1}</div>
          <div style="font-size:10px;color:var(--gray-l);font-weight:800">${p1.univ||''}</div>
        </div>
      </div>
      <div style="flex-shrink:0;display:flex;align-items:center;gap:0;font-size:${isMb?24:30}px;font-weight:1000;letter-spacing:-2px;line-height:1">
        <span style="color:${win1?p1col:(win2?'#94a3b8':'var(--text2)')}">${p1wins}</span>
        <span style="font-size:${isMb?14:16}px;color:#94a3b8;font-weight:900;margin:0 5px">:</span>
        <span style="color:${win2?p2col:(win1?'#94a3b8':'var(--text2)')}">${p2wins}</span>
      </div>
      <div style="display:flex;align-items:center;gap:8px;flex:1;min-width:0;justify-content:flex-end">
        <div style="min-width:0;text-align:right">
          <div style="font-weight:1000;font-size:${isMb?13:15}px;color:${win2?p2col:'var(--text)'};white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${s.p2}</div>
          <div style="font-size:10px;color:var(--gray-l);font-weight:800">${p2.univ||''}</div>
        </div>
        ${av(s.p2, p2col)}
      </div>
    </div>
  </div>`;
}

