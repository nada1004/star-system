/* ══════════════════════════════════════
   Match Builder Record Views
══════════════════════════════════════ */

function _safeHeadToHeadSideFx(leftHex, rightHex){
  try{
    if(typeof _getRecSideFxCfg!=='function') return '';
    const cfg = _getRecSideFxCfg();
    if(!cfg || !cfg.on) return '';
    const fx = (typeof _buildRecSideFxMetrics==='function') ? _buildRecSideFxMetrics(cfg) : null;
    const mode = fx ? fx.mode : 'soft';
    const a1 = fx ? fx.a1 : 0.18;
    const a2 = fx ? fx.a2 : 0.08;
    const ae = fx ? fx.aEdge : 0.28;
    const lr = (typeof _recFxHexToRgbStr==='function') ? _recFxHexToRgbStr(leftHex||'#3b82f6') : '59,130,246';
    const rr = (typeof _recFxHexToRgbStr==='function') ? _recFxHexToRgbStr(rightHex||'#ef4444') : '239,68,68';
    const L1 = fx ? fx.len : 25, L2 = fx ? fx.len2 : 11, L3 = fx ? fx.len3 : 18;
    const R1 = fx ? fx.lenR : 75, R2 = fx ? fx.len2R : 89, R3 = fx ? fx.len3R : 82;
    const lineW = fx ? fx.lineW : 8;
    const glowInset = fx ? fx.glowInset : 26;
    const glowBlur = fx ? fx.glowBlur : 34;
    const bandW = fx ? fx.bandW : 14;
    const frameW = fx ? fx.frameW : 3;
    const spot = fx ? fx.spotSize : 56;
    if(mode==='line'){
      return `background:
        linear-gradient(180deg, rgba(${lr},${a1.toFixed(3)}), rgba(${lr},${a2.toFixed(3)})) left center / ${lineW}px 100% no-repeat,
        linear-gradient(180deg, rgba(${rr},${a1.toFixed(3)}), rgba(${rr},${a2.toFixed(3)})) right center / ${lineW}px 100% no-repeat,
        var(--white);`;
    }
    if(mode==='glow'){
      return `background:
        linear-gradient(90deg, rgba(${lr},${ae.toFixed(3)}) 0%, rgba(${lr},0) ${L1}%, rgba(${rr},0) ${R1}%, rgba(${rr},${ae.toFixed(3)}) 100%),
        var(--white);
        box-shadow: inset ${glowInset}px 0 ${glowBlur}px rgba(${lr},${a1.toFixed(3)}), inset -${glowInset}px 0 ${glowBlur}px rgba(${rr},${a1.toFixed(3)});`;
    }
    if(mode==='panel'){
      return `background:
        linear-gradient(90deg, rgba(${lr},${ae.toFixed(3)}) 0%, rgba(${lr},${a2.toFixed(3)}) ${L2}%, rgba(${lr},${a1.toFixed(3)}) ${L3}%, rgba(${lr},0) ${L1}%, rgba(${rr},0) ${R1}%, rgba(${rr},${a1.toFixed(3)}) ${R3}%, rgba(${rr},${a2.toFixed(3)}) ${R2}%, rgba(${rr},${ae.toFixed(3)}) 100%),
        var(--white);`;
    }
    if(mode==='ribbon'){
      return `background:
        linear-gradient(90deg, rgba(${lr},${ae.toFixed(3)}) 0, rgba(${lr},${a2.toFixed(3)}) ${bandW}px, rgba(${lr},0) ${Math.round(bandW*1.8)}px, rgba(${rr},0) calc(100% - ${Math.round(bandW*1.8)}px), rgba(${rr},${a2.toFixed(3)}) calc(100% - ${bandW}px), rgba(${rr},${ae.toFixed(3)}) 100%),
        var(--white);`;
    }
    if(mode==='frame'){
      return `background:
        linear-gradient(90deg, rgba(${lr},${a1.toFixed(3)}) 0%, rgba(${lr},0) ${L1}%, rgba(${rr},0) ${R1}%, rgba(${rr},${a1.toFixed(3)}) 100%),
        var(--white);
        box-shadow: inset ${frameW}px 0 0 rgba(${lr},${ae.toFixed(3)}), inset -${frameW}px 0 0 rgba(${rr},${ae.toFixed(3)}), inset 0 ${frameW}px 0 rgba(${lr},${a2.toFixed(3)}), inset 0 -${frameW}px 0 rgba(${rr},${a2.toFixed(3)});`;
    }
    if(mode==='spotlight'){
      return `background:
        radial-gradient(circle at left center, rgba(${lr},${ae.toFixed(3)}) 0, rgba(${lr},${a2.toFixed(3)}) ${Math.round(spot*0.42)}px, rgba(${lr},0) ${spot}px),
        radial-gradient(circle at right center, rgba(${rr},${ae.toFixed(3)}) 0, rgba(${rr},${a2.toFixed(3)}) ${Math.round(spot*0.42)}px, rgba(${rr},0) ${spot}px),
        var(--white);`;
    }
    return `background:
      linear-gradient(90deg, rgba(${lr},${ae.toFixed(3)}) 0%, rgba(${lr},${a2.toFixed(3)}) ${L2}%, rgba(${lr},0) ${L1}%, rgba(${rr},0) ${R1}%, rgba(${rr},${a2.toFixed(3)}) ${R2}%, rgba(${rr},${ae.toFixed(3)}) 100%),
      var(--white);`;
  }catch(e){
    return '';
  }
}

function _rememberStableIndGj(kind, arr){
  try{
    // (버그픽스) 빈 배열도 캐시에 저장 — 삭제 후 전부 비었을 때 캐시가 갱신되지 않아 복원되던 문제 수정
    if(!Array.isArray(arr)) return;
    const key = kind === 'gj' ? '__lastGoodGjM' : '__lastGoodIndM';
    window[key] = arr.slice();
    // 유효한 삭제/변경 상태임을 플래그로 기록 (restore가 덮어쓰지 못하도록)
    window['__indGjCacheSet_' + kind] = true;
  }catch(e){}
}
function _restoreStableIndGj(kind){
  try{
    if(kind === 'ind'){
      if(Array.isArray(indM) && indM.length){
        _rememberStableIndGj('ind', indM);
        return;
      }
      // (버그픽스) 삭제로 인해 indM이 빈 배열이 된 경우에는 복원하지 않음
      // — 캐시가 이미 갱신된 상태(삭제 후)라면 복원을 건너뜀
      if(window.__indGjCacheSet_ind) return;
      const fromMem = Array.isArray(window.__lastGoodIndM) ? window.__lastGoodIndM : [];
      const fromLs = (typeof J==='function' ? (J('su_indm') || []) : []);
      const next = fromMem.length ? fromMem : (Array.isArray(fromLs) ? fromLs : []);
      if(Array.isArray(next) && next.length){
        indM = next.slice();
        try{ window.indM = indM; }catch(e){}
      }
      return;
    }
    if(Array.isArray(gjM) && gjM.length){
      _rememberStableIndGj('gj', gjM);
      return;
    }
    // (버그픽스) 삭제로 인해 gjM이 빈 배열이 된 경우에는 복원하지 않음
    if(window.__indGjCacheSet_gj) return;
    const fromMem = Array.isArray(window.__lastGoodGjM) ? window.__lastGoodGjM : [];
    const fromLs = (typeof J==='function' ? (J('su_gjm') || []) : []);
    const next = fromMem.length ? fromMem : (Array.isArray(fromLs) ? fromLs : []);
    if(Array.isArray(next) && next.length){
      gjM = next.slice();
      try{ window.gjM = gjM; }catch(e){}
    }
  }catch(e){}
}

// ─────────────────────────────────────────────────────────────
// (요청사항) 개인전/끝장전/프로리그끝장전: 선수 패널을 "프로필 배경 + 오버레이 텍스트" 형태로
// - 설정탭에서 su_h2h_panel_pc / su_h2h_panel_mb / su_h2h_panel_fit 로 저장
// ─────────────────────────────────────────────────────────────
function _h2hIsMobile(){ try{ return window.innerWidth <= 768; }catch(e){ return false; } }
function _h2hReadInt(key, def, min, max){
  try{ const v=parseInt(localStorage.getItem(key)||'',10); if(Number.isFinite(v)) return Math.max(min,Math.min(max,v)); }catch(e){}
  return Math.max(min,Math.min(max,def));
}
function _h2hPanelSize(){
  const pc=_h2hReadInt('su_h2h_panel_pc', 150, 110, 230);
  const mb=_h2hReadInt('su_h2h_panel_mb', 126, 96, 210);
  return _h2hIsMobile()?mb:pc;
}
function _h2hPanelMul(axis){
  const isMb=_h2hIsMobile();
  // axis: 'w' | 'h'
  const key = axis==='w'
    ? (isMb?'su_h2h_panel_wmul_mb':'su_h2h_panel_wmul_pc')
    : (isMb?'su_h2h_panel_hmul_mb':'su_h2h_panel_hmul_pc');
  const def = axis==='w' ? (isMb?100:105) : 100;
  // 10%까지 허용(요청사항)
  const pct = _h2hReadInt(key, def, 10, 300);
  return pct / 100;
}
function _h2hPanelFit(){
  try{
    const v=String(localStorage.getItem('su_h2h_panel_fit')||'cover').trim();
    return (v==='contain'||v==='cover'||v==='fill')?v:'cover';
  }catch(e){ return 'cover'; }
}
function _h2hScoreGapPx(){
  const isMb=_h2hIsMobile();
  const def=isMb?8:10;
  const v=_h2hReadInt(isMb?'su_h2h_score_gap_mb':'su_h2h_score_gap_pc', def, 0, 120);
  return v;
}
function _h2hScorePadPx(){
  const isMb=_h2hIsMobile();
  const def=isMb?6:10;
  const v=_h2hReadInt(isMb?'su_h2h_score_pad_mb':'su_h2h_score_pad_pc', def, 0, 24);
  return v;
}
function _h2hPlayerBgPos(name){
  try{
    const raw = localStorage.getItem('su_h2h_player_bgpos') || '';
    if(!raw) return 'center';
    const map = JSON.parse(raw) || {};
    const it = map[String(name||'').trim()];
    if(!it) return 'center';
    const x = Number(it.x), y = Number(it.y);
    if(!Number.isFinite(x) || !Number.isFinite(y)) return 'center';
    const xx = Math.max(0, Math.min(100, x));
    const yy = Math.max(0, Math.min(100, y));
    return `${xx}% ${yy}%`;
  }catch(e){
    return 'center';
  }
}
function _h2hPlayerBgPanel(pName, isWin, isLose){
  const p=players.find(x=>x.name===pName)||{};
  const base=_h2hPanelSize();
  const sizeH=Math.round(base * _h2hPanelMul('h'));
  const sizeW=Math.round(base * _h2hPanelMul('w'));
  const fit=_h2hPanelFit();
  const bgSize=(fit==='fill')?'100% 100%':(fit==='contain'?'contain':'cover');
  const bgImg=p.photo?`background-image:url('${toHttpsUrl(p.photo)}');`:'';
  const bgPos=_h2hPlayerBgPos(pName);
  const initial=(pName||'미').slice(0,1);
  const tier=p.tier?getTierBadge(p.tier):'';
  const race=(p.race&&p.race!=='N')?`<span class="rbadge r${p.race}" style="transform:scale(.92);transform-origin:center">${p.race}</span>`:'';
  const univ = p.univ||'';
  const click = pName?`onclick="event.stopPropagation();openPlayerModal('${escJS(pName)}')"`:'';
  const loseFx = isLose ? 'filter:grayscale(.1) saturate(1.01) brightness(.99);opacity:.95;' : '';
  const txtCol = isLose ? 'rgba(255,255,255,.78)' : '#fff';
  const txtCol2 = isLose ? 'rgba(255,255,255,.60)' : 'rgba(255,255,255,.86)';
  const frameCol = isWin ? '#dc2626' : 'rgba(148,163,184,.35)';
  const frameShadow = isWin ? '0 18px 38px rgba(220,38,38,.24)' : '0 10px 24px rgba(15,23,42,.08)';
  const isMb = _h2hIsMobile();
  // (요청사항) 좌우/상하 폭이 "확실히" 바뀌게:
  // - PC: width를 지정하되 max-width:100%로 오버플로 방지
  // - 모바일: 1열이므로 width 100% 유지, height 위주로 변경
  // (버그픽스) 좌우폭 조절이 "작동 안 하는 것처럼" 보이는 문제:
  // - flex:1 1 0 상태에서는 width가 기대대로 반영되지 않는 경우가 있어
  //   flex-basis를 auto로 두고 width를 우선 적용하도록 조정
  // - 모바일은 화면폭에 맞춰 자동으로 줄어들어야 하므로 vw 상한을 두되,
  //   최소폭은 10% 설정이 실제로 체감되게 너무 크게 고정하지 않음
  const wCss = isMb
    ? `width:min(60vw, ${Math.max(40,sizeW)}px);max-width:60vw;flex:0 1 auto;min-width:0;`
    : `width:min(100%, ${Math.max(80,sizeW)}px);flex:0 1 auto;min-width:0;`;
  // 패배자는 눈에 띄게 흑백 처리(예전엔 grayscale(.14)로 거의 표시가 안 됐음)
  const loseImgFx = isLose ? 'filter:grayscale(.9) saturate(.3) brightness(.9) contrast(.96);opacity:.88;' : '';
  return `<div ${click} style="position:relative;overflow:hidden;border-radius:var(--r2);height:${Math.max(60,sizeH)}px;${wCss}border:2px solid ${frameCol};box-shadow:${frameShadow};cursor:pointer;${bgImg}background-size:${bgSize};background-position:${bgPos};background-repeat:no-repeat;${!p.photo?`background:linear-gradient(135deg,rgba(100,116,139,.28),rgba(100,116,139,.10));`:''}${loseImgFx}">
    ${!p.photo?`<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:${Math.max(28,Math.round(base*0.30))}px;font-weight:1000;color:rgba(255,255,255,.16)">${initial}</div>`:''}
    <div style="position:absolute;left:0;right:0;bottom:0;padding:10px 10px 12px;display:flex;flex-direction:column;align-items:center;gap:4px;text-align:center;z-index:1;${loseFx}">
      <div style="font-weight:1000;font-size:16px;line-height:1.1;color:${txtCol};text-shadow:0 1px 3px rgba(0,0,0,.9),0 2px 10px rgba(0,0,0,.7)">${pName||'미정'}</div>
      <div style="font-size:var(--fs-caption);font-weight:800;color:${txtCol2};text-shadow:0 1px 3px rgba(0,0,0,.9),0 2px 8px rgba(0,0,0,.6)">${univ}</div>
      <div style="display:flex;gap:5px;flex-wrap:wrap;justify-content:center;align-items:center">${race}${tier?`<span style="transform:scale(.92);transform-origin:center">${tier}</span>`:''}</div>
    </div>
  </div>`;
}

// ─────────────────────────────────────────────────────────────
// 개인전/끝장전/프로리그 끝장전 기록카드 모드 헬퍼
// su_h2h_card_mode: 'panel'(기존 프로필패널) | 'banner'(배너형) | 'minimal'(미니멀) | 'photo'(사진전체) | 'classic'(텍스트 클래식)
// ─────────────────────────────────────────────────────────────
function _h2hCardMode(){ try{ return localStorage.getItem('su_h2h_card_mode')||'panel'; }catch(e){ return 'panel'; } }

// 배너형 카드: 좌/우 배경사진 + 중앙 스코어
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
        <div style="font-weight:1000;font-size:${isMb?13:15}px;color:#0f172a;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${s.p1}</div>
        <div style="font-size:10px;color:rgba(15,23,42,.62);font-weight:800">${p1.univ||''}</div>
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
        <div style="font-weight:1000;font-size:${isMb?13:15}px;color:#0f172a;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${s.p2}</div>
        <div style="font-size:10px;color:rgba(15,23,42,.62);font-weight:800">${p2.univ||''}</div>
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
    if(p.photo) return `<img src="${toHttpsUrl(p.photo)}" style="width:${sz}px;height:${sz}px;border-radius:999px;object-fit:cover;border:2px solid ${col};flex-shrink:0">`;
    return `<div style="width:${sz}px;height:${sz}px;border-radius:999px;background:${col}22;border:2px solid ${col};display:flex;align-items:center;justify-content:center;font-weight:1000;font-size:${isMb?12:13}px;color:${col};flex-shrink:0">${(pName||'?').slice(0,1)}</div>`;
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

function indRecordsHTML(){
  _restoreStableIndGj('ind');
  if(!indM.length) return `<div style="padding:30px;text-align:center;color:var(--gray-l)">기록 없음</div>`;
  _rememberStableIndGj('ind', indM);
  const sessions=[];
  const sidPairMap=new Map();
  let lastKey=null, lastSess=null;
  indM.forEach((m)=>{
    const pair=[m.wName,m.lName].sort();
    const k = m.sid ? `${m.sid}|${pair[0]}|${pair[1]}` : `${m.d||''}|${pair[0]}|${pair[1]}`;
    if(k!==lastKey||!lastSess){
      if(m.sid && sidPairMap.has(k)){
        lastSess=sidPairMap.get(k);lastKey=k;
      } else {
        const s={key:k,d:m.d||'',p1:pair[0],p2:pair[1],games:[],ids:[],_ord:sessions.length};
        sessions.push(s);lastSess=s;lastKey=k;
        if(m.sid) sidPairMap.set(k,s);
      }
    }
    lastSess.games.push(m);lastSess.ids.push(m._id);
  });
  sessions.forEach(s=>{const ds=s.games.map(g=>g.d||'').filter(Boolean).sort();if(ds.length)s.d=ds[ds.length-1];});
  let filteredSess=sessions.filter(s=>typeof passDateFilter!=='function'||passDateFilter(s.d||''));
  filteredSess.sort((a,b)=>{
    const cmp = recSortDir==='asc' ? (a.d||'').localeCompare(b.d||'') : (b.d||'').localeCompare(a.d||'');
    if(cmp!==0) return cmp;
    // 같은 날짜면 등록순으로 정렬: 최신순=나중에 등록한 게 위, 오래된순=먼저 등록한 게 위
    // indM은 unshift로 채워져 _ord가 작을수록(=sessions에 먼저 등장할수록) 최근 등록임
    return recSortDir==='asc' ? (b._ord - a._ord) : (a._ord - b._ord);
  });

  const _dateMenuStyle = (localStorage.getItem('su_date_menu_style') || 'pill');
  const _datePickKey = 'su_rec_date_pick_hist_ind';
  const _pickedDate = (localStorage.getItem(_datePickKey) || '').trim();
  const _baseSess = filteredSess.slice();
  const _allDates = Array.from(new Set(_baseSess.map(s=>String(s.d||'').trim()).filter(Boolean))).sort((a,b)=>recSortDir==='asc'?a.localeCompare(b):b.localeCompare(a));
  if(_pickedDate && _allDates.includes(_pickedDate)){
    filteredSess = filteredSess.filter(s => String(s.d||'').trim() === _pickedDate);
  }
  const _dateMenuHTML = (()=>{
    if(_dateMenuStyle!=='asl' || !_allDates.length) return '';
    const daysS=['일','월','화','수','목','금','토'];
    const _pLine = (pName)=>{
      const pObj=players.find(x=>x.name===pName)||{};
      const univ=pObj.univ||'';
      const col=univ?gc(univ):'#64748b';
      return `<span style="display:inline-flex;align-items:center;gap:4px;min-width:0">
        ${getPlayerPhotoHTML(pName,'16px')}
        <span style="font-weight:900;font-size:10px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:88px">${pName}</span>
        ${pObj.tier?`<span style="transform:scale(.85);transform-origin:left center">${getTierBadge(pObj.tier)}</span>`:''}
        ${univ?`<span style="width:10px;height:10px;border-radius:3px;background:${col};display:inline-block;flex-shrink:0" title="${univ}"></span>`:''}
      </span>`;
    };
    const _mini = (s)=>`<div style="display:flex;align-items:center;gap:6px;font-size:10px;color:var(--text2);line-height:1.1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">
      <span style="flex:1;min-width:0">${_pLine(s.p1)}</span>
      <span style="color:var(--gray-l);font-weight:900;flex-shrink:0">vs</span>
      <span style="flex:1;min-width:0;display:flex;justify-content:flex-end">${_pLine(s.p2)}</span>
    </div>`;
    let h=`<div class="no-export" style="margin-bottom:10px;padding-bottom:10px;border-bottom:2px solid var(--border)">
      <div style="display:flex;gap:8px;overflow-x:auto;flex-wrap:nowrap;-webkit-overflow-scrolling:touch;scrollbar-width:none">`;
    const _onAll = !_pickedDate;
    h+=`<button type="button" onclick="localStorage.setItem('${_datePickKey}','');histPage['ind']=0;render()" style="flex-shrink:0;min-width:92px;padding:10px 12px;border-radius:12px;border:1px solid ${_onAll?'var(--blue)':'var(--border)'};background:${_onAll?'#eff6ff':'var(--surface)'};cursor:pointer;text-align:left">
      <div style="font-weight:1000;font-size:var(--fs-sm);color:${_onAll?'var(--blue)':'var(--text2)'}">전체</div>
      <div style="margin-top:6px;font-size:10px;color:var(--gray-l)">날짜 필터 해제</div>
    </button>`;
    _allDates.forEach(d0=>{
      const dt=new Date(d0+'T00:00:00');
      const label=`${daysS[dt.getDay()]} ${String(dt.getMonth()+1).padStart(2,'0')}/${String(dt.getDate()).padStart(2,'0')}`;
      const dayS=_baseSess.filter(s=>String(s.d||'').trim()===d0);
      const prev=dayS.length?`<div style="margin-top:6px;display:flex;flex-direction:column;gap:4px">${dayS.slice(0,2).map(_mini).join('')}</div>`:'';
      const on=(_pickedDate===d0);
      h+=`<button type="button" onclick="localStorage.setItem('${_datePickKey}','${d0}');histPage['ind']=0;render()" style="flex-shrink:0;text-align:left;min-width:170px;max-width:280px;padding:10px 12px;border-radius:12px;border:1px solid ${on?'var(--blue)':'var(--border)'};background:${on?'#eff6ff':'var(--surface)'};cursor:pointer">
        <div style="display:flex;align-items:center;gap:8px">
          <span style="font-weight:1000;font-size:var(--fs-sm);color:${on?'var(--blue)':'var(--text2)'}">${label}</span>
          <span style="margin-left:auto;font-size:10px;color:var(--gray-l);font-weight:900">${dayS.length?`세션 ${dayS.length}`:''}</span>
        </div>
        ${prev}
      </button>`;
    });
    h+=`</div></div>`;
    return h;
  })();

  const pageSize=getHistPageSize();
  const total=filteredSess.length;
  const totalPages=Math.ceil(total/pageSize)||1;
  if(histPage['ind']>=totalPages) histPage['ind']=Math.max(0,totalPages-1);
  const cur=histPage['ind'];
  const slice=total>pageSize?filteredSess.slice(cur*pageSize,(cur+1)*pageSize):filteredSess;
  const _indBulkOn=isLoggedIn&&!!_bulkModes['ind'];
  let h=isLoggedIn?`<div class="no-export" style="display:flex;align-items:center;justify-content:flex-end;margin-bottom:4px">
    <button onclick="toggleBulkMode('ind')" style="padding:3px 10px;border-radius:12px;border:1.5px solid ${_indBulkOn?'#dc2626':'var(--border2)'};background:${_indBulkOn?'#fff1f2':'var(--surface)'};color:${_indBulkOn?'#dc2626':'var(--text3)'};font-size:var(--fs-caption);font-weight:700;cursor:pointer">${_indBulkOn?'✕ 선택 해제':'☑ 일괄 선택'}</button>
  </div>`:'';
  h+=_dateMenuHTML;
  if(_indBulkOn){
    h+=`<div class="no-export" style="display:flex;align-items:center;justify-content:flex-end;gap:6px;flex-wrap:wrap;padding:7px 10px;background:#eff6ff;border:1.5px solid var(--blue);border-radius:8px;margin-bottom:6px">
      <label style="display:flex;align-items:center;gap:5px;font-size:var(--fs-sm);font-weight:700;cursor:pointer;color:var(--blue)">
        <input type="checkbox" id="bulk-all-ind" onchange="indBulkToggleAll('ind',this.checked)" style="width:14px;height:14px;cursor:pointer"> 전체
      </label>
      <span id="bulk-cnt-ind" style="font-size:var(--fs-caption);color:var(--blue);font-weight:700;min-width:64px">0개 선택됨</span>
      <span style="color:var(--border2)">│</span>
      <button onclick="bulkMoveInd('ind','gj')" style="padding:3px 12px;border-radius:12px;border:1.5px solid var(--blue);background:var(--blue);color:#fff;font-size:var(--fs-caption);font-weight:700;cursor:pointer">⚔️ 끝장전으로 이동</button>
      <button onclick="bulkMoveInd('ind','progj')" style="padding:3px 12px;border-radius:12px;border:1.5px solid #7c3aed;background:#7c3aed;color:#fff;font-size:var(--fs-caption);font-weight:700;cursor:pointer">🏅 프로리그 끝장전으로 이동</button>
      <button onclick="bulkDeleteInd('ind')" style="padding:3px 12px;border-radius:12px;border:1.5px solid #dc2626;background:#dc2626;color:#fff;font-size:var(--fs-caption);font-weight:700;cursor:pointer">🗑️ 선택 삭제</button>
    </div>`;
  }
  slice.forEach(s=>{
    const p1wins=s.games.filter(m=>m.wName===s.p1).length;
    const p2wins=s.games.filter(m=>m.wName===s.p2).length;
    const winner=p1wins>p2wins?s.p1:(p2wins>p1wins?s.p2:'');
    const idsJson=JSON.stringify(s.ids).replace(/"/g,"'");
    const _indSessKey = ('inds_' + String(s.key||`${s.d||''}|${s.p1||''}|${s.p2||''}`).replace(/[^\w\-]/g,'_')).slice(0,120);
    window._indSessCache = window._indSessCache || {};
    window._indSessCache[_indSessKey] = {...s};
    const actionOpts = [];
    // (중요) onclick 속성 안에 큰따옴표(")가 들어가면 HTML 파싱이 깨져 SyntaxError가 발생할 수 있음.
    // ids 배열(예: ['id1','id2'])을 그대로 넣고, 런타임에 JSON.stringify로 문자열로 변환해서 전달한다.
    // (버그픽스) 비로그인자에게는 공유카드만 표시, 수정/삭제/이동은 관리자(로그인)만 볼 수 있음
    actionOpts.push(`{l:'📷 공유카드',fn:()=>openIndShareCard('${escJS(s.p1)}','${escJS(s.p2)}',${p1wins},${p2wins},'${escJS(s.d)}','${escJS(winner)}',JSON.stringify(${idsJson}))}`);
    if(isLoggedIn){
      actionOpts.push(`{l:'✏️ 수정',fn:()=>openIndSessionEdit('${_indSessKey}')}`);
      actionOpts.push(`{l:'↗ 이동',fn:()=>{window._pendingMoveIds=${idsJson};openMoveIndPop(document.getElementById('_indActionBtn_${cur}_${Math.abs((s.key||'').split('').reduce((a,c)=>a+c.charCodeAt(0),0))}')||document.body,window._pendingMoveIds,'ind');}}`);
      actionOpts.push(`{l:'🗑 삭제',fn:()=>deleteIndSession(${idsJson})}`);
    }
    const _indActionBtnId = `_indActionBtn_${cur}_${Math.abs((s.key||'').split('').reduce((a,c)=>a+c.charCodeAt(0),0))}`;
    const actionBtn=`<button id="${_indActionBtnId}" class="btn btn-w btn-xs" style="white-space:nowrap;padding:2px 8px;font-size:16px;line-height:1;font-weight:900" onclick="event.stopPropagation();openIndSessionActionPop(this,[${actionOpts.join(',')}])">⋯</button>`;
    const bulkCbInd=_indBulkOn?`<input type="checkbox" class="bulk-cb no-export" data-bkey="ind" data-bids="${idsJson}" onchange="_indBulkCountUpdate('ind')" onclick="event.stopPropagation()" style="width:15px;height:15px;cursor:pointer;flex-shrink:0;accent-color:var(--blue)">`:'';
    const p1univ=players.find(x=>x.name===s.p1)?.univ||'';
    const p2univ=players.find(x=>x.name===s.p2)?.univ||'';
    const p1race=players.find(x=>x.name===s.p1)?.race||'';
    const p2race=players.find(x=>x.name===s.p2)?.race||'';
    const p1col=p1univ?gc(p1univ):'#378ADD';
    const p2col=p2univ?gc(p2univ):'#1D9E75';
    const _indP1Win = p1wins > p2wins;
    const _indP2Win = p2wins > p1wins;
    const _indScoreColP1 = _indP1Win ? 'var(--win-col)' : _indP2Win ? 'var(--lose-col)' : 'var(--text2)';
    const _indScoreColP2 = _indP2Win ? 'var(--win-col)' : _indP1Win ? 'var(--lose-col)' : 'var(--text2)';
    const p1bg=_h2hPlayerBgPanel(s.p1, winner===s.p1, winner && winner!==s.p1);
    const p2bg=_h2hPlayerBgPanel(s.p2, winner===s.p2, winner && winner!==s.p2);
    const _indWrapFx = _safeHeadToHeadSideFx(p1col, p2col);
    const _isMb = _h2hIsMobile();
    const _gridCols = _indBulkOn ? 'auto 1fr auto 1fr' : '1fr auto 1fr';
    const _gap = _h2hScoreGapPx();
    const _scorePad = _h2hScorePadPx();
    const _indCardMode = _h2hCardMode();
    const _bodyHTML = _h2hCardBody(_indCardMode, s, p1wins, p2wins, winner, p1col, p2col, _gridCols, _isMb, _scorePad, _gap, bulkCbInd, p1bg, p2bg, _indScoreColP1, _indScoreColP2);
    h+=`<div class="h2h-rec-card" style="border:var(--h2h-card-border,1px solid var(--border));border-bottom:var(--h2h-card-border-bottom,none);border-radius:var(--h2h-card-radius,12px);margin-bottom:var(--h2h-card-gap,8px);overflow:hidden;box-shadow:var(--h2h-card-shadow,none);${_indWrapFx||'background:var(--white);'}">
      <div style="cursor:pointer" onclick="openIndSessionPopup('${_indSessKey}')">${_bodyHTML}</div>
      <div style="border-top:1px solid var(--border);display:flex;align-items:center;gap:8px;padding:${_isMb?'7px 10px':'8px 14px'};background:var(--bg2);flex-wrap:wrap">
        <span style="font-size:var(--fs-caption);color:var(--gray-l)">${s.d||'날짜 미정'}</span>
        <span style="font-size:10px;font-weight:700;padding:2px 8px;border-radius:99px;background:#E6F1FB;color:#185FA5">개인전</span>
        <span style="font-size:var(--fs-caption);color:var(--gray-l)">${s.games.length}경기</span>
        <span style="margin-left:auto"></span>
        <span onclick="event.stopPropagation()">${actionBtn}</span>
      </div>
    </div>`;
  });
  if(totalPages>1){
    h+=`<div style="display:flex;align-items:center;justify-content:center;gap:6px;padding:14px 0;flex-wrap:wrap">`;
    h+=`<button class="btn btn-w btn-xs" style="min-width:32px" onclick="histPage['ind']=0;render()" ${cur===0?'disabled':''}>«</button>`;
    h+=`<button class="btn btn-w btn-xs" style="min-width:32px" onclick="histPage['ind']=Math.max(0,${cur}-1);render()" ${cur===0?'disabled':''}>‹</button>`;
    let s2=Math.max(0,cur-3),e2=Math.min(totalPages-1,s2+6);if(e2-s2<6)s2=Math.max(0,e2-6);
    for(let p=s2;p<=e2;p++) h+=`<button class="btn ${p===cur?'btn-b':'btn-w'} btn-xs" style="min-width:32px" onclick="histPage['ind']=${p};render()">${p+1}</button>`;
    h+=`<button class="btn btn-w btn-xs" style="min-width:32px" onclick="histPage['ind']=Math.min(${totalPages-1},${cur}+1);render()" ${cur===totalPages-1?'disabled':''}>›</button>`;
    h+=`<button class="btn btn-w btn-xs" style="min-width:32px" onclick="histPage['ind']=${totalPages-1};render()" ${cur===totalPages-1?'disabled':''}>»</button>`;
    h+=`<span style="font-size:var(--fs-caption);color:var(--text3);margin-left:6px">${cur+1} / ${totalPages}</span></div>`;
  }
  return h;
}

function gjRecordsHTML(proOnly){
  _restoreStableIndGj('gj');
  window._gjSessCache = window._gjSessCache || {};
  const _gjSrc=proOnly?gjM.filter(m=>m._proLabel):gjM.filter(m=>!m._proLabel);
  if(!_gjSrc.length) return `<div style="padding:30px;text-align:center;color:var(--gray-l)">기록 없음</div>`;
  _rememberStableIndGj('gj', gjM);
  const sessions=[];
  const sidPairMap=new Map();
  let lastKey=null, lastSess=null;
  _gjSrc.forEach((m)=>{
    const pair=[m.wName,m.lName].sort();
    const k = m.sid ? `${m.sid}|${pair[0]}|${pair[1]}` : `${m.d||''}|${pair[0]}|${pair[1]}`;
    if(k!==lastKey||!lastSess){
      if(m.sid && sidPairMap.has(k)){
        lastSess=sidPairMap.get(k);lastKey=k;
      } else {
        const s={key:k,d:m.d||'',p1:pair[0],p2:pair[1],games:[],ids:[],_ord:sessions.length};
        sessions.push(s);lastSess=s;lastKey=k;
        if(m.sid) sidPairMap.set(k,s);
      }
    }
    lastSess.games.push(m);lastSess.ids.push(m._id);
  });
  sessions.forEach(s=>{const ds=s.games.map(g=>g.d||'').filter(Boolean).sort();if(ds.length)s.d=ds[ds.length-1];});
  let filteredSessGj=sessions.filter(s=>typeof passDateFilter!=='function'||passDateFilter(s.d||''));
  filteredSessGj.sort((a,b)=>{
    const cmp = recSortDir==='asc' ? (a.d||'').localeCompare(b.d||'') : (b.d||'').localeCompare(a.d||'');
    if(cmp!==0) return cmp;
    // gjM은 unshift로 채워져 _ord가 작을수록(=sessions에 먼저 등장할수록) 최근 등록임
    return recSortDir==='asc' ? (b._ord - a._ord) : (a._ord - b._ord);
  });

  const _dateMenuStyle = (localStorage.getItem('su_date_menu_style') || 'pill');
  const _datePickKey = proOnly ? 'su_rec_date_pick_hist_progj' : 'su_rec_date_pick_hist_gj';
  const _pickedDate = (localStorage.getItem(_datePickKey) || '').trim();
  const _baseSess = filteredSessGj.slice();
  const _allDates = Array.from(new Set(_baseSess.map(s=>String(s.d||'').trim()).filter(Boolean))).sort((a,b)=>b.localeCompare(a));
  if(_pickedDate && _allDates.includes(_pickedDate)){
    filteredSessGj = filteredSessGj.filter(s => String(s.d||'').trim() === _pickedDate);
  }
  const _dateMenuHTML = (()=>{
    if(_dateMenuStyle!=='asl' || !_allDates.length) return '';
    const daysS=['일','월','화','수','목','금','토'];
    const _pLine = (pName)=>{
      const pObj=players.find(x=>x.name===pName)||{};
      const univ=pObj.univ||'';
      const col=univ?gc(univ):'#64748b';
      return `<span style="display:inline-flex;align-items:center;gap:4px;min-width:0">
        ${getPlayerPhotoHTML(pName,'16px')}
        <span style="font-weight:900;font-size:10px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:88px">${pName}</span>
        ${pObj.tier?`<span style="transform:scale(.85);transform-origin:left center">${getTierBadge(pObj.tier)}</span>`:''}
        ${univ?`<span style="width:10px;height:10px;border-radius:3px;background:${col};display:inline-block;flex-shrink:0" title="${univ}"></span>`:''}
      </span>`;
    };
    const _mini = (s)=>`<div style="display:flex;align-items:center;gap:6px;font-size:10px;color:var(--text2);line-height:1.1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">
      <span style="flex:1;min-width:0">${_pLine(s.p1)}</span>
      <span style="color:var(--gray-l);font-weight:900;flex-shrink:0">vs</span>
      <span style="flex:1;min-width:0;display:flex;justify-content:flex-end">${_pLine(s.p2)}</span>
    </div>`;
    let h=`<div class="no-export" style="margin-bottom:10px;padding-bottom:10px;border-bottom:2px solid var(--border)">
      <div style="display:flex;gap:8px;overflow-x:auto;flex-wrap:nowrap;-webkit-overflow-scrolling:touch;scrollbar-width:none">`;
    const _onAll = !_pickedDate;
    h+=`<button type="button" onclick="localStorage.setItem('${_datePickKey}','');histPage['gj']=0;render()" style="flex-shrink:0;min-width:92px;padding:10px 12px;border-radius:12px;border:1px solid ${_onAll?'var(--blue)':'var(--border)'};background:${_onAll?'#eff6ff':'var(--surface)'};cursor:pointer;text-align:left">
      <div style="font-weight:1000;font-size:var(--fs-sm);color:${_onAll?'var(--blue)':'var(--text2)'}">전체</div>
      <div style="margin-top:6px;font-size:10px;color:var(--gray-l)">날짜 필터 해제</div>
    </button>`;
    _allDates.forEach(d0=>{
      const dt=new Date(d0+'T00:00:00');
      const label=`${daysS[dt.getDay()]} ${String(dt.getMonth()+1).padStart(2,'0')}/${String(dt.getDate()).padStart(2,'0')}`;
      const dayS=_baseSess.filter(s=>String(s.d||'').trim()===d0);
      const prev=dayS.length?`<div style="margin-top:6px;display:flex;flex-direction:column;gap:4px">${dayS.slice(0,2).map(_mini).join('')}</div>`:'';
      const on=(_pickedDate===d0);
      h+=`<button type="button" onclick="localStorage.setItem('${_datePickKey}','${d0}');histPage['gj']=0;render()" style="flex-shrink:0;text-align:left;min-width:170px;max-width:280px;padding:10px 12px;border-radius:12px;border:1px solid ${on?'var(--blue)':'var(--border)'};background:${on?'#eff6ff':'var(--surface)'};cursor:pointer">
        <div style="display:flex;align-items:center;gap:8px">
          <span style="font-weight:1000;font-size:var(--fs-sm);color:${on?'var(--blue)':'var(--text2)'}">${label}</span>
          <span style="margin-left:auto;font-size:10px;color:var(--gray-l);font-weight:900">${dayS.length?`세션 ${dayS.length}`:''}</span>
        </div>
        ${prev}
      </button>`;
    });
    h+=`</div></div>`;
    return h;
  })();

  const pageSize=getHistPageSize();
  const total=filteredSessGj.length;
  const totalPages=Math.ceil(total/pageSize)||1;
  if(histPage['gj']>=totalPages) histPage['gj']=Math.max(0,totalPages-1);
  const cur=histPage['gj'];
  const slice=total>pageSize?filteredSessGj.slice(cur*pageSize,(cur+1)*pageSize):filteredSessGj;
  const _gjBulkKey=proOnly?'pro_gj':'gj';
  const _gjBulkOn=isLoggedIn&&!!_bulkModes[_gjBulkKey];
  const _gjBulkDests=proOnly
    ?[{l:'⚔️ 일반 끝장전',d:'ungj'},{l:'🎮 개인전',d:'ind'}]
    :[{l:'🎮 개인전',d:'ind'},{l:'🏅 프로리그 끝장전',d:'progj'}];
  let h=isLoggedIn?`<div class="no-export" style="display:flex;align-items:center;justify-content:flex-end;margin-bottom:4px">
    <button onclick="toggleBulkMode('${_gjBulkKey}')" style="padding:3px 10px;border-radius:12px;border:1.5px solid ${_gjBulkOn?'#dc2626':'var(--border2)'};background:${_gjBulkOn?'#fff1f2':'var(--surface)'};color:${_gjBulkOn?'#dc2626':'var(--text3)'};font-size:var(--fs-caption);font-weight:700;cursor:pointer">${_gjBulkOn?'✕ 선택 해제':'☑ 일괄 선택'}</button>
  </div>`:'';
  h+=_dateMenuHTML;
  if(_gjBulkOn){
    h+=`<div class="no-export" style="display:flex;align-items:center;justify-content:flex-end;gap:6px;flex-wrap:wrap;padding:7px 10px;background:#eff6ff;border:1.5px solid var(--blue);border-radius:8px;margin-bottom:6px">
      <label style="display:flex;align-items:center;gap:5px;font-size:var(--fs-sm);font-weight:700;cursor:pointer;color:var(--blue)">
        <input type="checkbox" id="bulk-all-${_gjBulkKey}" onchange="indBulkToggleAll('${_gjBulkKey}',this.checked)" style="width:14px;height:14px;cursor:pointer"> 전체
      </label>
      <span id="bulk-cnt-${_gjBulkKey}" style="font-size:var(--fs-caption);color:var(--blue);font-weight:700;min-width:64px">0개 선택됨</span>
      <span style="color:var(--border2)">│</span>
      ${_gjBulkDests.map(bd=>`<button onclick="bulkMoveInd('${_gjBulkKey}','${bd.d}')" style="padding:3px 12px;border-radius:12px;border:1.5px solid var(--blue);background:var(--blue);color:#fff;font-size:var(--fs-caption);font-weight:700;cursor:pointer">${bd.l}로 이동</button>`).join('')}
      <button onclick="bulkDeleteInd('${_gjBulkKey}')" style="padding:3px 12px;border-radius:12px;border:1.5px solid #dc2626;background:#dc2626;color:#fff;font-size:var(--fs-caption);font-weight:700;cursor:pointer">🗑️ 선택 삭제</button>
    </div>`;
  }
  slice.forEach(s=>{
    const p1wins=s.games.filter(m=>m.wName===s.p1).length;
    const p2wins=s.games.filter(m=>m.wName===s.p2).length;
    const winner=p1wins>p2wins?s.p1:(p2wins>p1wins?s.p2:'');
    const idsJson=JSON.stringify(s.ids).replace(/"/g,"'");
    const _gjMoveCtx=proOnly?'pro_gj':'gj';
    const _gjActionBtnId = `_gjActionBtn_${cur}_${Math.abs((s.key||'').split('').reduce((a,c)=>a+c.charCodeAt(0),0))}`;
    // ✅ 버그픽스: 캐시 저장 키와 수정 버튼에 전달하는 키를 동일하게 생성
    const _sidRaw = (s.games.find(x=>x && x.sid)?.sid) || s.key || `${s.d||''}|${s.p1||''}|${s.p2||''}`;
    const _gjSessKey = ('gjs_' + String(_sidRaw).replace(/[^\w\-]/g,'_')).slice(0,120);
    const gjActionOpts = [];
    // (버그픽스) 비로그인자에게는 공유카드만 표시, 수정/삭제/이동은 관리자(로그인)만 볼 수 있음
    gjActionOpts.push(`{l:'🎴 공유카드',fn:()=>openGJShareCard('${escJS(s.p1)}','${escJS(s.p2)}',${p1wins},${p2wins},'${escJS(s.d)}','${escJS(winner)}',{proOnly:${proOnly?'true':'false'}})}`);
    if(isLoggedIn){
      gjActionOpts.push(`{l:'✏️ 수정',fn:()=>openGJSessionEdit('${_gjSessKey}')}`);
      gjActionOpts.push(`{l:'↗ 이동',fn:()=>{window._pendingMoveIds=${idsJson};openMoveIndPop(document.getElementById('${_gjActionBtnId}')||document.body,window._pendingMoveIds,'${_gjMoveCtx}');}}`);
      gjActionOpts.push(`{l:'🗑 삭제',fn:()=>deleteGjSession(${idsJson})}`);
    }
    const actionBtn=`<button id="${_gjActionBtnId}" class="btn btn-w btn-xs" style="white-space:nowrap;padding:2px 8px;font-size:16px;line-height:1;font-weight:900" onclick="event.stopPropagation();openIndSessionActionPop(this,[${gjActionOpts.join(',')}])">⋯</button>`;
    const bulkCbGj=_gjBulkOn?`<input type="checkbox" class="bulk-cb no-export" data-bkey="${_gjBulkKey}" data-bids="${idsJson}" onchange="_indBulkCountUpdate('${_gjBulkKey}')" onclick="event.stopPropagation()" style="width:15px;height:15px;cursor:pointer;flex-shrink:0;accent-color:var(--blue)">`:'';
    // ✅ 버그픽스: _gjSessKey와 동일한 키로 캐시 저장 (수정 버튼과 일치)
    window._gjSessCache[_gjSessKey] = {...s, _proOnly: !!proOnly};

    const gj_p1univ=players.find(x=>x.name===s.p1)?.univ||'';
    const gj_p2univ=players.find(x=>x.name===s.p2)?.univ||'';
    const gj_p1race=players.find(x=>x.name===s.p1)?.race||'';
    const gj_p2race=players.find(x=>x.name===s.p2)?.race||'';
    const _gjP1Win = p1wins > p2wins;
    const _gjP2Win = p2wins > p1wins;
    const _gjP1Col = gj_p1univ?gc(gj_p1univ):'#378ADD';
    const _gjP2Col = gj_p2univ?gc(gj_p2univ):'#1D9E75';
    const _gjScoreColP1 = _gjP1Win ? 'var(--win-col)' : _gjP2Win ? 'var(--lose-col)' : 'var(--text2)';
    const _gjScoreColP2 = _gjP2Win ? 'var(--win-col)' : _gjP1Win ? 'var(--lose-col)' : 'var(--text2)';
    const gj_typeLabel=proOnly?'프로리그 끝장전':'끝장전';
    const gj_typeBg=proOnly?'#E1F5EE':'#FAECE7';
    const gj_typeColor=proOnly?'#085041':'#993C1D';
    const gj_p1bg=_h2hPlayerBgPanel(s.p1, winner===s.p1, winner && winner!==s.p1);
    const gj_p2bg=_h2hPlayerBgPanel(s.p2, winner===s.p2, winner && winner!==s.p2);
    const _gjWrapFx = _safeHeadToHeadSideFx(gj_p1univ?gc(gj_p1univ):'#378ADD', gj_p2univ?gc(gj_p2univ):'#1D9E75');
    const _isMb = _h2hIsMobile();
    const _gridCols = _gjBulkOn ? 'auto 1fr auto 1fr' : '1fr auto 1fr';
    const _gap = _h2hScoreGapPx();
    const _scorePad = _h2hScorePadPx();
    const _gjCardMode = _h2hCardMode();
    const _gjBodyHTML = _h2hCardBody(_gjCardMode, s, p1wins, p2wins, winner, _gjP1Col, _gjP2Col, _gridCols, _isMb, _scorePad, _gap, bulkCbGj, gj_p1bg, gj_p2bg, _gjScoreColP1, _gjScoreColP2);
    h+=`<div class="h2h-rec-card" style="border:var(--h2h-card-border,1px solid var(--border));border-bottom:var(--h2h-card-border-bottom,none);border-radius:var(--h2h-card-radius,12px);margin-bottom:var(--h2h-card-gap,8px);overflow:hidden;box-shadow:var(--h2h-card-shadow,none);${_gjWrapFx||'background:var(--white);'}">
      <div style="cursor:pointer" onclick="openGJSessionPopup('${_gjSessKey}')">${_gjBodyHTML}</div>
      <div style="border-top:1px solid var(--border);display:flex;align-items:center;gap:8px;padding:${_isMb?'7px 10px':'8px 14px'};background:var(--bg2);flex-wrap:wrap">
        <span style="font-size:var(--fs-caption);color:var(--gray-l)">${s.d||'날짜 미정'}</span>
        <span style="font-size:10px;font-weight:700;padding:2px 8px;border-radius:99px;background:${gj_typeBg};color:${gj_typeColor}">${gj_typeLabel}</span>
        <span style="font-size:var(--fs-caption);color:var(--gray-l)">${s.games.length}경기</span>
        <span style="margin-left:auto"></span>
        <span onclick="event.stopPropagation()">${actionBtn}</span>
      </div>
    </div>`;
  });
  if(totalPages>1){
    h+=`<div style="display:flex;align-items:center;justify-content:center;gap:6px;padding:14px 0;flex-wrap:wrap">`;
    h+=`<button class="btn btn-w btn-xs" style="min-width:32px" onclick="histPage['gj']=0;render()" ${cur===0?'disabled':''}>«</button>`;
    h+=`<button class="btn btn-w btn-xs" style="min-width:32px" onclick="histPage['gj']=Math.max(0,${cur}-1);render()" ${cur===0?'disabled':''}>‹</button>`;
    let s2=Math.max(0,cur-3),e2=Math.min(totalPages-1,s2+6);if(e2-s2<6)s2=Math.max(0,e2-6);
    for(let p=s2;p<=e2;p++) h+=`<button class="btn ${p===cur?'btn-b':'btn-w'} btn-xs" style="min-width:32px" onclick="histPage['gj']=${p};render()">${p+1}</button>`;
    h+=`<button class="btn btn-w btn-xs" style="min-width:32px" onclick="histPage['gj']=Math.min(${totalPages-1},${cur}+1);render()" ${cur===totalPages-1?'disabled':''}>›</button>`;
    h+=`<button class="btn btn-w btn-xs" style="min-width:32px" onclick="histPage['gj']=${totalPages-1};render()" ${cur===totalPages-1?'disabled':''}>»</button>`;
    h+=`<span style="font-size:var(--fs-caption);color:var(--text3);margin-left:6px">${cur+1} / ${totalPages}</span></div>`;
  }
  return h;
}
