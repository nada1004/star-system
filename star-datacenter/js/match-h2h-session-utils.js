/* ══════════════════════════════════════════════════════════════
   경기기록 - 세션캐시/개인끝장전 복원 유틸 (match-builder-record-views.js 에서 분리, 2026-07-30)
   ══════════════════════════════════════════════════════════════ */

/* ══════════════════════════════════════
   Match Builder Record Views
══════════════════════════════════════ */

// 세션 키 충돌 방지용 짧은 해시 (FNV-1a 32bit 간이)
function _sessHashKey(v){
  const str = String(v||'');
  let h = 2166136261;
  for(let i=0;i<str.length;i++){
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h>>>0).toString(36);
}

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
