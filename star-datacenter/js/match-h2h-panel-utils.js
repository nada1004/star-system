/* ══════════════════════════════════════════════════════════════
   경기기록 - H2H 패널 크기/간격 유틸 (match-builder-record-views.js 에서 분리, 2026-07-30)
   ══════════════════════════════════════════════════════════════ */

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
  // 이미지2(두번째 프로필) 호버 스크럽 미리보기 (PC 마우스 전용)
  const _h2hSecondRaw = String(p.secondProfileFile || '').trim();
  const _h2hSecondIsVideo = /\.(mp4|webm|ogg|mov|m4v)(\?|$)/i.test(_h2hSecondRaw);
  const h2hSecondPhoto = (_h2hSecondRaw && !_h2hSecondIsVideo) ? _h2hSecondRaw : '';
  const h2hHoverAttrs = h2hSecondPhoto ? ` onmousemove="_b2CardHoverScrub(event,this)" onmouseleave="_b2CardHoverLeave(this)"` : '';
  const h2hSecondHtml = h2hSecondPhoto
    ? `<img class="b2-players-card-secondary" style="z-index:0;object-position:${bgPos}" src="${toHttpsUrl(h2hSecondPhoto)}" loading="lazy" decoding="async" alt="" onerror="this.remove()">`
    : '';
  return `<div ${click}${h2hHoverAttrs} style="position:relative;overflow:hidden;border-radius:var(--r2);height:${Math.max(60,sizeH)}px;${wCss}border:2px solid ${frameCol};box-shadow:${frameShadow};cursor:pointer;${bgImg}background-size:${bgSize};background-position:${bgPos};background-repeat:no-repeat;${!p.photo?`background:linear-gradient(135deg,rgba(100,116,139,.28),rgba(100,116,139,.10));`:''}${loseImgFx}">
    ${!p.photo?`<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:${Math.max(28,Math.round(base*0.30))}px;font-weight:1000;color:rgba(255,255,255,.16)">${initial}</div>`:''}
    ${h2hSecondHtml}
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
