/* ══════════════════════════════════════════════════════════════
   대전기록 - 통계카드/사이드FX/참가자 수집 유틸 (history-render-tabs.js 에서 분리, 2026-07-30)
   ══════════════════════════════════════════════════════════════ */

function statCard(label,w,l,d,col){
  const tot=w+l+d;const wr=tot?Math.round(w/tot*100):0;
  const arc=wr/100;
  const r=20;const circ=2*Math.PI*r;const dash=circ*arc;const gap=circ-dash;
  return `<div style="background:var(--card);border:1.5px solid ${col}33;border-radius:14px;padding:14px 12px;text-align:center;position:relative;overflow:hidden;border-top:3px solid ${col}">
    <div style="position:absolute;inset:0;background:${col}06;pointer-events:none"></div>
    <div style="font-size:var(--fs-caption);font-weight:800;color:${col};margin-bottom:8px;letter-spacing:.4px;white-space:nowrap">${label}</div>
    ${tot>0?`<div style="position:relative;display:inline-block;margin-bottom:6px">
      <svg width="52" height="52" viewBox="0 0 52 52" style="transform:rotate(-90deg)">
        <circle cx="26" cy="26" r="${r}" fill="none" stroke="${col}20" stroke-width="5"/>
        <circle cx="26" cy="26" r="${r}" fill="none" stroke="${col}" stroke-width="5" stroke-dasharray="${dash.toFixed(1)} ${gap.toFixed(1)}" stroke-linecap="round"/>
      </svg>
      <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:var(--fs-caption);font-weight:900;color:${col}">${wr}%</div>
    </div>`:'<div style="height:52px;display:flex;align-items:center;justify-content:center;color:var(--gray-l);font-size:var(--fs-sm)">-</div>'}
    <div style="font-family:\'Noto Sans KR\',sans-serif;font-weight:900;font-size:var(--fs-base)"><span style="color:var(--green)">${w}승</span> <span style="color:var(--red)">${l}패</span>${d?` <span style="color:var(--gray-l);font-size:var(--fs-caption)">${d}무</span>`:''}</div>
    <div style="font-size:10px;color:var(--gray-l);margin-top:3px">${tot}경기</div>
  </div>`;
}

function _recFxHexToRgbStr(hex){
  try{
    const h=String(hex||'').replace('#','').trim();
    if(h.length===3){
      const r=parseInt(h[0]+h[0],16), g=parseInt(h[1]+h[1],16), b=parseInt(h[2]+h[2],16);
      if([r,g,b].some(v=>isNaN(v))) return '100,116,139';
      return `${r},${g},${b}`;
    }
    if(h.length>=6){
      const r=parseInt(h.slice(0,2),16), g=parseInt(h.slice(2,4),16), b=parseInt(h.slice(4,6),16);
      if([r,g,b].some(v=>isNaN(v))) return '100,116,139';
      return `${r},${g},${b}`;
    }
  }catch(e){}
  return '100,116,139';
}
// 기록 카드 양쪽 끝 색상 효과 모드
// - 기존 모드 + 요청사항: 효과 1~2개 추가(fade/double)
const _REC_SIDE_FX_MODES = ['soft','glow','panel','line','ribbon','frame','spotlight','fade','double','neon','wave','prism','vignette','pulse','sheen','aurora','slant','steps','laser','diamond','halo','confetti','circuit','ink','fire','ice','dust','ember','mirror','bars','bracket','corner','diagonal','scanline','sweep','shimmer'];
function _getRecSideFxCfg(){
  let on = true, mode = 'soft', intensity = 68, length = 25, tail = 28, softness = 52, edge = 8;
  try{ on = (localStorage.getItem('su_rec_side_fx_on') || '1') !== '0'; }catch(e){}
  try{
    const raw = String(localStorage.getItem('su_rec_side_fx_mode') || 'soft').trim();
    if(_REC_SIDE_FX_MODES.includes(raw)) mode = raw;
  }catch(e){}
  try{ intensity = Math.max(0, Math.min(140, parseInt(localStorage.getItem('su_rec_side_fx_intensity') || '68', 10) || 68)); }catch(e){}
  try{ length = Math.max(4, Math.min(80, parseInt(localStorage.getItem('su_rec_side_fx_length') || '25', 10) || 25)); }catch(e){}
  try{ tail = Math.max(0, Math.min(140, parseInt(localStorage.getItem('su_rec_side_fx_tail') || '28', 10) || 28)); }catch(e){}
  try{ softness = Math.max(0, Math.min(100, parseInt(localStorage.getItem('su_rec_side_fx_softness') || '52', 10) || 52)); }catch(e){}
  try{ edge = Math.max(2, Math.min(24, parseInt(localStorage.getItem('su_rec_side_fx_edge') || '8', 10) || 8)); }catch(e){}
  return { on, mode, intensity, length, tail, softness, edge };
}
function _buildRecSideFxMetrics(cfg){
  const c = cfg || _getRecSideFxCfg();
  const mode = _REC_SIDE_FX_MODES.includes(String(c.mode||'')) ? String(c.mode) : 'soft';
  const intensity = Math.max(0, Math.min(140, parseInt(c.intensity||68,10) || 68));
  const length = Math.max(4, Math.min(80, parseInt(c.length||25,10) || 25));
  const tail = Math.max(0, Math.min(140, parseInt(c.tail||28,10) || 28));
  const softness = Math.max(0, Math.min(100, parseInt(c.softness||52,10) || 52));
  const edge = Math.max(2, Math.min(24, parseInt(c.edge||8,10) || 8));
  const lengthFactor = (length - 4) / 76;
  const intensityFactor = intensity / 100;
  const softnessFactor = softness / 100;
  const tailFactor = tail / 100;
  const blend = Math.max(0, Math.min(1.4, intensityFactor * 0.62 + lengthFactor * 0.38));
  const a1 = Math.max(0.04, Math.min(0.52, 0.045 + blend * 0.20));
  const a2 = Math.max(0.018, Math.min(0.30, a1 * (0.22 + softnessFactor * 0.82)));
  const aEdge = Math.max(0.08, Math.min(0.84, a1 + (tailFactor * 0.26) + (edge / 220)));
  const len = length;
  const len2 = Math.max(2, Math.min(96, Math.round(len * (0.24 + softnessFactor * 0.42))));
  const len3 = Math.max(len2 + 1, Math.min(98, Math.round(len * (0.55 + softnessFactor * 0.25))));
  const lenR = 100 - len;
  const len2R = 100 - len2;
  const len3R = 100 - len3;
  const lineW = edge;
  const glowInset = Math.max(12, Math.round(10 + lineW * 1.5 + length * 0.22));
  const glowBlur = Math.max(18, Math.round(18 + lineW * 2.2 + length * 0.38));
  const bandW = Math.max(lineW + 4, Math.round(length * 0.35));
  const spotSize = Math.max(24, Math.round(22 + lineW * 1.8 + length * 0.9));
  const frameW = Math.max(1, Math.round(lineW * 0.42));
  return { mode, intensity, length, tail, softness, edge, a1, a2, aEdge, len, len2, len3, lenR, len2R, len3R, lineW, glowInset, glowBlur, bandW, spotSize, frameW };
}
function _recSideFxVarStyle(leftHex, rightHex, cfg){
  const m = _buildRecSideFxMetrics(cfg);
  return `--rec-side-left-rgb:${_recFxHexToRgbStr(leftHex)};--rec-side-right-rgb:${_recFxHexToRgbStr(rightHex)};--rec-side-a1:${m.a1.toFixed(3)};--rec-side-a2:${m.a2.toFixed(3)};--rec-side-ae:${m.aEdge.toFixed(3)};--rec-fx-len:${m.len}%;--rec-fx-len2:${m.len2}%;--rec-fx-len3:${m.len3}%;--rec-fx-len-r:${m.lenR}%;--rec-fx-len2-r:${m.len2R}%;--rec-fx-len3-r:${m.len3R}%;--rec-side-line-w:${m.lineW}px;--rec-side-glow-inset:${m.glowInset}px;--rec-side-glow-blur:${m.glowBlur}px;--rec-side-band:${m.bandW}px;--rec-side-spot:${m.spotSize}px;--rec-side-frame:${m.frameW}px;`;
}
function _canUseRecSideFx(mode){
  return ['ind','gj','progj','mini','civil','univm','ck','pro','tt','comp','tourney','procomp','procompgj','procomptn','procompteam'].includes(String(mode||''));
}
function _recSideFxClass(mode){
  const cfg = _getRecSideFxCfg();
  if(!cfg.on || !_canUseRecSideFx(mode)) return '';
  return ` rec-sidefx rec-sidefx--${cfg.mode}`;
}
function _recSideFxStyle(mode, leftHex, rightHex){
  const cfg = _getRecSideFxCfg();
  if(!cfg.on || !_canUseRecSideFx(mode) || !leftHex || !rightHex) return '';
  const vars = _recSideFxVarStyle(leftHex, rightHex, cfg);
  return vars;
}

// 경기(세트/게임)에서 "참여자"를 최대한 수집 (팀 구분 없이 전체 인원)
function _collectMatchParticipantsAny(m){
  try{
    const set = new Set();
    const add = (v)=>{
      if(!v) return;
      String(v).split(',').map(s=>s.trim()).filter(Boolean).forEach(x=>set.add(x));
    };
    // 사전 저장된 멤버
    (m?.teamAMembers||[]).forEach(x=>add(typeof x==='string'?x:(x?.name||x)));
    (m?.teamBMembers||[]).forEach(x=>add(typeof x==='string'?x:(x?.name||x)));
    // 세트/게임
    (m?.sets||[]).forEach(s=>{
      (s?.games||[]).forEach(g=>{
        add(g?.playerA); add(g?.playerB);
        add(g?.wName); add(g?.lName);
        add(g?.a1); add(g?.a2); add(g?.b1); add(g?.b2);
      });
    });
    return Array.from(set).map(name=>({name}));
  }catch(e){
    return [];
  }
}

// 경기 데이터에서 A/B 팀 멤버를 최대한 수집 (조별리그/토너먼트/티어대회 팀전 등)
function _collectMatchTeamMembersAB(m){
  try{
    const aSet=new Set(), bSet=new Set();
    const addSet=(set,v)=>{
      if(!v) return;
      String(v).split(',').map(s=>s.trim()).filter(Boolean).forEach(x=>set.add(x));
    };
    // 1) 저장된 멤버 우선
    (m?.teamAMembers||[]).forEach(x=>addSet(aSet, typeof x==='string'?x:(x?.name||x)));
    (m?.teamBMembers||[]).forEach(x=>addSet(bSet, typeof x==='string'?x:(x?.name||x)));
    // 2) sets.games 기반 수집
    (m?.sets||[]).forEach(s=>{
      (s?.games||[]).forEach(g=>{
        // 팀전 편집기에서 a1/a2/b1/b2 쓰는 케이스
        addSet(aSet, g?.a1); addSet(aSet, g?.a2);
        addSet(bSet, g?.b1); addSet(bSet, g?.b2);
        // 일반적으로 playerA=왼쪽, playerB=오른쪽
        addSet(aSet, g?.playerA);
        addSet(bSet, g?.playerB);
        // 일부 데이터는 a/b 키를 쓸 수 있음
        addSet(aSet, g?.a);
        addSet(bSet, g?.b);
      });
    });
    return {
      a: Array.from(aSet).map(name=>({name})),
      b: Array.from(bSet).map(name=>({name})),
    };
  }catch(e){
    return {a:[], b:[]};
  }
}

