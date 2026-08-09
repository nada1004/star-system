/* ══════════════════════════════════════════════════════════════
   설정 - H2H 배경 위치 저장/로드 & 나머지 (settings-base.js 에서 분리, 2026-07-30)
   ══════════════════════════════════════════════════════════════ */

function _cfgH2HBgPosLoadAll(){
  try{ return JSON.parse(localStorage.getItem('su_h2h_player_bgpos')||'{}')||{}; }catch(e){ return {}; }
}
function _cfgH2HBgPosSaveAll(map){
  try{ localStorage.setItem('su_h2h_player_bgpos', JSON.stringify(map||{})); }catch(e){}
}
window.cfgH2HBgPosLoad = function(){
  try{
    const name=String(document.getElementById('cfg-h2h-bgpos-name')?.value||'').trim();
    const map=_cfgH2HBgPosLoadAll();
    const it=map[name]||{x:50,y:50};
    const x=Math.max(0,Math.min(100,Number(it.x))); const y=Math.max(0,Math.min(100,Number(it.y)));
    const xi=document.getElementById('cfg-h2h-bgpos-x');
    const yi=document.getElementById('cfg-h2h-bgpos-y');
    if(xi){ xi.value=String(Number.isFinite(x)?x:50); document.getElementById('cfg-h2h-bgpos-xv').textContent=xi.value+'%'; }
    if(yi){ yi.value=String(Number.isFinite(y)?y:50); document.getElementById('cfg-h2h-bgpos-yv').textContent=yi.value+'%'; }
  }catch(e){}
};
window.cfgH2HBgPosSave = function(silent){
  try{
    const name=String(document.getElementById('cfg-h2h-bgpos-name')?.value||'').trim();
    if(!name){ if(!silent) alert('스트리머 이름을 입력하세요.'); return; }
    const x=parseInt(document.getElementById('cfg-h2h-bgpos-x')?.value||'50',10) || 50;
    const y=parseInt(document.getElementById('cfg-h2h-bgpos-y')?.value||'50',10) || 50;
    const map=_cfgH2HBgPosLoadAll();
    map[name]={x:Math.max(0,Math.min(100,x)), y:Math.max(0,Math.min(100,y))};
    _cfgH2HBgPosSaveAll(map);
  }catch(e){}
  try{ if(typeof render==='function') render(); }catch(e){}
};
window.cfgH2HBgPosReset = function(){
  try{
    const name=String(document.getElementById('cfg-h2h-bgpos-name')?.value||'').trim();
    if(!name){ alert('스트리머 이름을 입력하세요.'); return; }
    const map=_cfgH2HBgPosLoadAll();
    delete map[name];
    _cfgH2HBgPosSaveAll(map);
    const xi=document.getElementById('cfg-h2h-bgpos-x');
    const yi=document.getElementById('cfg-h2h-bgpos-y');
    if(xi){ xi.value='50'; document.getElementById('cfg-h2h-bgpos-xv').textContent='50%'; }
    if(yi){ yi.value='50'; document.getElementById('cfg-h2h-bgpos-yv').textContent='50%'; }
  }catch(e){}
  try{ if(typeof render==='function') render(); }catch(e){}
};

// ─────────────────────────────────────────────────────────────
// (요청사항) 스트리머탭 대학 헤더 그라데이션 스타일
// - CSS 변수: --univ-header-bg
// - localStorage: su_univ_header_gradient
// - 옵션: solid, left-to-right, left-to-both, top-to-bottom, both-to-center
// ─────────────────────────────────────────────────────────────
window.applyUnivHeaderGradient = function(){
  try{
    const mode = localStorage.getItem('su_univ_header_gradient') || 'left-to-right';
    let gradient = '';
    switch(mode){
      case 'solid':
        gradient = 'var(--c,#2563eb)';
        break;
      case 'left-to-right':
        gradient = 'linear-gradient(90deg, var(--c,#2563eb), color-mix(in srgb, var(--c,#2563eb) 70%, transparent))';
        break;
      case 'left-to-both':
        gradient = 'linear-gradient(90deg, var(--c,#2563eb) 0%, var(--c,#2563eb) 30%, color-mix(in srgb, var(--c,#2563eb) 50%, transparent) 100%)';
        break;
      case 'top-to-bottom':
        gradient = 'linear-gradient(180deg, var(--c,#2563eb), color-mix(in srgb, var(--c,#2563eb) 70%, transparent))';
        break;
      case 'both-to-center':
        gradient = 'linear-gradient(90deg, color-mix(in srgb, var(--c,#2563eb) 50%, transparent) 0%, var(--c,#2563eb) 50%, color-mix(in srgb, var(--c,#2563eb) 50%, transparent) 100%)';
        break;
      default:
        gradient = 'linear-gradient(90deg, var(--c,#2563eb), color-mix(in srgb, var(--c,#2563eb) 70%, transparent))';
    }
    document.documentElement.style.setProperty('--univ-header-bg', gradient);
  }catch(e){}
};
window.cfgSetUnivHeaderGradient = function(mode){
  try{
    const validModes = ['solid', 'left-to-right', 'left-to-both', 'top-to-bottom', 'both-to-center'];
    const m = validModes.includes(mode) ? mode : 'left-to-right';
    localStorage.setItem('su_univ_header_gradient', m);
  }catch(e){}
  try{ window.applyUnivHeaderGradient && window.applyUnivHeaderGradient(); }catch(e){}
  try{ if(typeof render==='function') render(); }catch(e){}
};
try{
  window.applyUnivHeaderGradient && window.applyUnivHeaderGradient();
}catch(e){}

// ─────────────────────────────────────────────────────────────
// (요청사항) 스트리머탭 대학 헤더 배경 이미지/텍스트 설정
// - CSS 변수: --univ-header-bg-image, --univ-header-bg-size, --univ-header-bg-position, --univ-header-bg-opacity
// - CSS 변수: --univ-header-text, --univ-header-text-size, --univ-header-text-color, --univ-header-text-top, --univ-header-text-right
// - localStorage: su_univ_header_bg_image, su_univ_header_bg_size, su_univ_header_bg_position, su_univ_header_bg_opacity
// - localStorage: su_univ_header_text, su_univ_header_text_size, su_univ_header_text_color, su_univ_header_text_top, su_univ_header_text_right
// ─────────────────────────────────────────────────────────────
window.applyUnivHeaderBgImage = function(){
  try{
    const imageUrl = localStorage.getItem('su_univ_header_bg_image') || '';
    const bgSize = localStorage.getItem('su_univ_header_bg_size') || 'cover';
    const bgPosition = localStorage.getItem('su_univ_header_bg_position') || 'center center';
    const opacity = Math.max(0, Math.min(100, parseInt(localStorage.getItem('su_univ_header_bg_opacity') || '0', 10))) / 100;
    
    document.documentElement.style.setProperty('--univ-header-bg-image', imageUrl ? `url('${imageUrl}')` : 'none');
    document.documentElement.style.setProperty('--univ-header-bg-size', bgSize);
    document.documentElement.style.setProperty('--univ-header-bg-position', bgPosition);
    document.documentElement.style.setProperty('--univ-header-bg-opacity', String(opacity));
  }catch(e){}
};
window.applyUnivHeaderText = function(){
  try{
    const text = localStorage.getItem('su_univ_header_text') || '';
    const fontSize = Math.max(8, Math.min(32, parseInt(localStorage.getItem('su_univ_header_text_size') || '12', 10))) + 'px';
    const textColor = localStorage.getItem('su_univ_header_text_color') || 'rgba(255,255,255,0.8)';
    const textTop = localStorage.getItem('su_univ_header_text_top') || '50%';
    const textRight = localStorage.getItem('su_univ_header_text_right') || '10px';
    const textYTransform = textTop === '50%' ? '-50%' : '0';
    
    document.documentElement.style.setProperty('--univ-header-text', text ? `'${text.replace(/'/g, "\\'")}'` : "''");
    document.documentElement.style.setProperty('--univ-header-text-size', fontSize);
    document.documentElement.style.setProperty('--univ-header-text-color', textColor);
    document.documentElement.style.setProperty('--univ-header-text-top', textTop);
    document.documentElement.style.setProperty('--univ-header-text-right', textRight);
    document.documentElement.style.setProperty('--univ-header-text-y-transform', textYTransform);
  }catch(e){}
};
window.cfgSetUnivHeaderBgImage = function(url){
  try{
    localStorage.setItem('su_univ_header_bg_image', url || '');
  }catch(e){}
  try{ window.applyUnivHeaderBgImage && window.applyUnivHeaderBgImage(); }catch(e){}
  try{ window.SettingsStore && typeof window.SettingsStore.markPrefsChanged==='function' && window.SettingsStore.markPrefsChanged(); }catch(e){}
};
window.cfgSetUnivHeaderBgSize = function(size){
  try{
    const validSizes = ['cover', 'contain', 'auto', '100% 100%', '50% 50%'];
    const s = validSizes.includes(size) ? size : 'cover';
    localStorage.setItem('su_univ_header_bg_size', s);
  }catch(e){}
  try{ window.applyUnivHeaderBgImage && window.applyUnivHeaderBgImage(); }catch(e){}
  try{ window.SettingsStore && typeof window.SettingsStore.markPrefsChanged==='function' && window.SettingsStore.markPrefsChanged(); }catch(e){}
};
window.cfgSetUnivHeaderBgPosition = function(pos){
  try{
    const validPositions = ['center center', 'top center', 'bottom center', 'left center', 'right center', 'top left', 'top right', 'bottom left', 'bottom right'];
    const p = validPositions.includes(pos) ? pos : 'center center';
    localStorage.setItem('su_univ_header_bg_position', p);
  }catch(e){}
  try{ window.applyUnivHeaderBgImage && window.applyUnivHeaderBgImage(); }catch(e){}
  try{ window.SettingsStore && typeof window.SettingsStore.markPrefsChanged==='function' && window.SettingsStore.markPrefsChanged(); }catch(e){}
};
window.cfgSetUnivHeaderBgOpacity = function(opacity){
  try{
    const n = Math.max(0, Math.min(100, parseInt(opacity || '0', 10) || 0));
    localStorage.setItem('su_univ_header_bg_opacity', String(n));
  }catch(e){}
  try{ window.applyUnivHeaderBgImage && window.applyUnivHeaderBgImage(); }catch(e){}
  try{ window.SettingsStore && typeof window.SettingsStore.markPrefsChanged==='function' && window.SettingsStore.markPrefsChanged(); }catch(e){}
};
window.cfgSetUnivHeaderText = function(text){
  try{
    localStorage.setItem('su_univ_header_text', text || '');
  }catch(e){}
  try{ window.applyUnivHeaderText && window.applyUnivHeaderText(); }catch(e){}
  try{ if(typeof render==='function') render(); }catch(e){}
};
window.cfgSetUnivHeaderTextSize = function(size){
  try{
    const n = Math.max(8, Math.min(32, parseInt(size || '12', 10) || 12));
    localStorage.setItem('su_univ_header_text_size', String(n));
  }catch(e){}
  try{ window.applyUnivHeaderText && window.applyUnivHeaderText(); }catch(e){}
  try{ if(typeof render==='function') render(); }catch(e){}
};
window.cfgSetUnivHeaderTextColor = function(color){
  try{
    localStorage.setItem('su_univ_header_text_color', color || 'rgba(255,255,255,0.8)');
  }catch(e){}
  try{ window.applyUnivHeaderText && window.applyUnivHeaderText(); }catch(e){}
  try{ if(typeof render==='function') render(); }catch(e){}
};
window.cfgSetUnivHeaderTextTop = function(top){
  try{
    const validTops = ['0%', '25%', '50%', '75%', '100%'];
    const t = validTops.includes(top) ? top : '50%';
    localStorage.setItem('su_univ_header_text_top', t);
  }catch(e){}
  try{ window.applyUnivHeaderText && window.applyUnivHeaderText(); }catch(e){}
  try{ if(typeof render==='function') render(); }catch(e){}
};
window.cfgSetUnivHeaderTextRight = function(right){
  try{
    const n = Math.max(0, Math.min(50, parseInt(right || '10', 10) || 10));
    localStorage.setItem('su_univ_header_text_right', String(n) + 'px');
  }catch(e){}
  try{ window.applyUnivHeaderText && window.applyUnivHeaderText(); }catch(e){}
  try{ if(typeof render==='function') render(); }catch(e){}
};
window.cfgSetUnivHeaderTextPos = function(pos){
  try{
    const validPos = ['left', 'center', 'right'];
    const p = validPos.includes(pos) ? pos : 'right';
    localStorage.setItem('su_univ_header_text_pos', p);
  }catch(e){}
  try{ if(typeof render==='function') render(); }catch(e){}
};
window.cfgSetUnivHeaderGradientLength = function(len){
  try{
    const n = Math.max(20, Math.min(100, parseInt(len || '70', 10) || 70));
    localStorage.setItem('su_univ_header_gradient_length', String(n));
  }catch(e){}
  try{ if(typeof render==='function') render(); }catch(e){}
};
window.cfgSetUnivHeaderGradientColor = function(color){
  try{
    localStorage.setItem('su_univ_header_gradient_color', String(color || '#ffffff'));
  }catch(e){}
  try{ if(typeof render==='function') render(); }catch(e){}
};
try{
  window.applyUnivHeaderBgImage && window.applyUnivHeaderBgImage();
  window.applyUnivHeaderText && window.applyUnivHeaderText();
}catch(e){}

function renderIfPossible(){
  try{ if(typeof render==='function') render(); }catch(e){}
}

// ─────────────────────────────────────────────────────────────
// 스트리머 상세 수정창(openEP)용: 개인/끝장전 배경 위치(드래그)
// ─────────────────────────────────────────────────────────────
function _edH2HPosLoadAll(){
  try{ return JSON.parse(localStorage.getItem('su_h2h_player_bgpos')||'{}')||{}; }catch(e){ return {}; }
}
function _edH2HPosSaveAll(map){
  try{ localStorage.setItem('su_h2h_player_bgpos', JSON.stringify(map||{})); }catch(e){}
}
window.edH2HPosSyncFromInputs = function(){
  try{
    const xEl=document.getElementById('ed-h2hpos-x');
    const yEl=document.getElementById('ed-h2hpos-y');
    const x=parseInt(xEl?.value||'50',10) || 50;
    const y=parseInt(yEl?.value||'50',10) || 50;
    const prev=document.getElementById('ed-h2hpos-prev');
    if(prev) prev.style.backgroundPosition = `${Math.max(0,Math.min(100,x))}% ${Math.max(0,Math.min(100,y))}%`;
    const xv=document.getElementById('ed-h2hpos-xv'); if(xv) xv.textContent=`${Math.max(0,Math.min(100,x))}%`;
    const yv=document.getElementById('ed-h2hpos-yv'); if(yv) yv.textContent=`${Math.max(0,Math.min(100,y))}%`;
    const del=document.getElementById('ed-h2hpos-del'); if(del) del.value='0';
  }catch(e){}
};
window.edH2HPosCenter = function(){
  try{
    const xEl=document.getElementById('ed-h2hpos-x');
    const yEl=document.getElementById('ed-h2hpos-y');
    if(xEl) xEl.value='50';
    if(yEl) yEl.value='50';
    window.edH2HPosSyncFromInputs && window.edH2HPosSyncFromInputs();
  }catch(e){}
};
window.edH2HPosDelete = function(){
  try{
    const del=document.getElementById('ed-h2hpos-del'); if(del) del.value='1';
    const msg=document.getElementById('ed-h2hpos-msg'); if(msg){ msg.style.display='none'; }
    alert('이 스트리머의 얼굴 위치 보정값을 삭제합니다. (기본 center로 표시)');
  }catch(e){}
};
window.edH2HPosSave = function(){
  try{
    const name=String(document.getElementById('ed-n')?.value||editName||'').trim();
    if(!name){ alert('스트리머 이름을 확인할 수 없습니다.'); return; }
    const x=parseInt(document.getElementById('ed-h2hpos-x')?.value||'50',10) || 50;
    const y=parseInt(document.getElementById('ed-h2hpos-y')?.value||'50',10) || 50;
    const map=_edH2HPosLoadAll();
    map[name]={x:Math.max(0,Math.min(100,x)), y:Math.max(0,Math.min(100,y))};
    _edH2HPosSaveAll(map);
    const del=document.getElementById('ed-h2hpos-del'); if(del) del.value='0';
    const msg=document.getElementById('ed-h2hpos-msg');
    if(msg){ msg.style.display='block'; setTimeout(()=>{ try{ msg.style.display='none'; }catch(e){} }, 1200); }
  }catch(e){}
  try{ if(typeof render==='function') render(); }catch(e){}
};
window.edBindH2HPosDrag = function(){
  try{
    const prev=document.getElementById('ed-h2hpos-prev');
    if(!prev || prev._dragBound) return;
    prev._dragBound = true;
    const applyFromEvent = (ev)=>{
      const r = prev.getBoundingClientRect();
      const cx = (ev.clientX - r.left) / Math.max(1, r.width);
      const cy = (ev.clientY - r.top) / Math.max(1, r.height);
      const x = Math.max(0, Math.min(100, Math.round(cx*100)));
      const y = Math.max(0, Math.min(100, Math.round(cy*100)));
      const xEl=document.getElementById('ed-h2hpos-x');
      const yEl=document.getElementById('ed-h2hpos-y');
      if(xEl) xEl.value=String(x);
      if(yEl) yEl.value=String(y);
      window.edH2HPosSyncFromInputs && window.edH2HPosSyncFromInputs();
    };
    prev.addEventListener('pointerdown', (ev)=>{
      try{ prev.setPointerCapture(ev.pointerId); }catch(e){}
      applyFromEvent(ev);
      const onMove=(e)=>applyFromEvent(e);
      const onUp=(e)=>{
        try{ prev.removeEventListener('pointermove', onMove); }catch(_){}
        try{ prev.removeEventListener('pointerup', onUp); }catch(_){}
        try{ prev.removeEventListener('pointercancel', onUp); }catch(_){}
      };
      prev.addEventListener('pointermove', onMove);
      prev.addEventListener('pointerup', onUp);
      prev.addEventListener('pointercancel', onUp);
    });
  }catch(e){}
};

// ─────────────────────────────────────────────────────────────
// 스트리머 상세 수정창(openEP)용: 프로필 사진1/2 object-position 드래그 보정
// 저장 필드: players[].photoPosX/photoPosY, photo2PosX/photo2PosY
// ─────────────────────────────────────────────────────────────
function _edClamp01(n){ return Math.max(0, Math.min(100, n)); }
window.edP1PosSyncFromInputs = function(){
  try{
    const x=parseInt(document.getElementById('ed-p1pos-x')?.value||'50',10) || 50;
    const y=parseInt(document.getElementById('ed-p1pos-y')?.value||'50',10) || 50;
    const img=document.getElementById('ed-p1pos-img');
    if(img) img.style.objectPosition = `${_edClamp01(x)}% ${_edClamp01(y)}%`;
    const xv=document.getElementById('ed-p1pos-xv'); if(xv) xv.textContent=`${_edClamp01(x)}%`;
    const yv=document.getElementById('ed-p1pos-yv'); if(yv) yv.textContent=`${_edClamp01(y)}%`;
    const del=document.getElementById('ed-p1pos-del'); if(del) del.value='0';
  }catch(e){}
};
window.edP1PosCenter = function(){
  try{
    const xEl=document.getElementById('ed-p1pos-x'); if(xEl) xEl.value='50';
    const yEl=document.getElementById('ed-p1pos-y'); if(yEl) yEl.value='50';
    window.edP1PosSyncFromInputs && window.edP1PosSyncFromInputs();
  }catch(e){}
};
window.edP1PosDelete = function(){
  try{
    const del=document.getElementById('ed-p1pos-del'); if(del) del.value='1';
    alert('프로필 사진 1 위치 보정값을 삭제합니다. (기본 center)');
  }catch(e){}
};
window.edBindP1PosDrag = function(){
  try{
    const prev=document.getElementById('ed-p1pos-prev');
    if(!prev || prev._dragBound) return;
    prev._dragBound=true;
    const apply=(ev)=>{
      const r=prev.getBoundingClientRect();
      const cx=(ev.clientX-r.left)/Math.max(1,r.width);
      const cy=(ev.clientY-r.top)/Math.max(1,r.height);
      const x=_edClamp01(Math.round(cx*100));
      const y=_edClamp01(Math.round(cy*100));
      const xEl=document.getElementById('ed-p1pos-x'); if(xEl) xEl.value=String(x);
      const yEl=document.getElementById('ed-p1pos-y'); if(yEl) yEl.value=String(y);
      window.edP1PosSyncFromInputs && window.edP1PosSyncFromInputs();
    };
    prev.addEventListener('pointerdown',(ev)=>{
      try{ prev.setPointerCapture(ev.pointerId); }catch(e){}
      apply(ev);
      const mv=(e)=>apply(e);
      const up=()=>{ try{prev.removeEventListener('pointermove',mv);}catch(_){}
        try{prev.removeEventListener('pointerup',up);}catch(_){}
        try{prev.removeEventListener('pointercancel',up);}catch(_){}
      };
      prev.addEventListener('pointermove',mv);
      prev.addEventListener('pointerup',up);
      prev.addEventListener('pointercancel',up);
    });
  }catch(e){}
};

window.edP2PosSyncFromInputs = function(){
  try{
    const x=parseInt(document.getElementById('ed-p2pos-x')?.value||'50',10) || 50;
    const y=parseInt(document.getElementById('ed-p2pos-y')?.value||'50',10) || 50;
    const img=document.getElementById('ed-p2pos-img');
    if(img) img.style.objectPosition = `${_edClamp01(x)}% ${_edClamp01(y)}%`;
    const xv=document.getElementById('ed-p2pos-xv'); if(xv) xv.textContent=`${_edClamp01(x)}%`;
    const yv=document.getElementById('ed-p2pos-yv'); if(yv) yv.textContent=`${_edClamp01(y)}%`;
    const del=document.getElementById('ed-p2pos-del'); if(del) del.value='0';
  }catch(e){}
};
window.edP2PosCenter = function(){
  try{
    const xEl=document.getElementById('ed-p2pos-x'); if(xEl) xEl.value='50';
    const yEl=document.getElementById('ed-p2pos-y'); if(yEl) yEl.value='50';
    window.edP2PosSyncFromInputs && window.edP2PosSyncFromInputs();
  }catch(e){}
};
window.edP2PosDelete = function(){
  try{
    const del=document.getElementById('ed-p2pos-del'); if(del) del.value='1';
    alert('프로필 사진 2 위치 보정값을 삭제합니다. (기본 center)');
  }catch(e){}
};
window.edBindP2PosDrag = function(){
  try{
    const prev=document.getElementById('ed-p2pos-prev');
    if(!prev || prev._dragBound) return;
    prev._dragBound=true;
    const apply=(ev)=>{
      const r=prev.getBoundingClientRect();
      const cx=(ev.clientX-r.left)/Math.max(1,r.width);
      const cy=(ev.clientY-r.top)/Math.max(1,r.height);
      const x=_edClamp01(Math.round(cx*100));
      const y=_edClamp01(Math.round(cy*100));
      const xEl=document.getElementById('ed-p2pos-x'); if(xEl) xEl.value=String(x);
      const yEl=document.getElementById('ed-p2pos-y'); if(yEl) yEl.value=String(y);
      window.edP2PosSyncFromInputs && window.edP2PosSyncFromInputs();
    };
    prev.addEventListener('pointerdown',(ev)=>{
      try{ prev.setPointerCapture(ev.pointerId); }catch(e){}
      apply(ev);
      const mv=(e)=>apply(e);
      const up=()=>{ try{prev.removeEventListener('pointermove',mv);}catch(_){}
        try{prev.removeEventListener('pointerup',up);}catch(_){}
        try{prev.removeEventListener('pointercancel',up);}catch(_){}
      };
      prev.addEventListener('pointermove',mv);
      prev.addEventListener('pointerup',up);
      prev.addEventListener('pointercancel',up);
    });
  }catch(e){}
};

// ─────────────────────────────────────────────────────────────
// 스트리머 상세 수정창(openEP)용: 헤더 배경 드래그 보정
// ─────────────────────────────────────────────────────────────
function _edPhbgResolveFit(){
  try{
    const v=String(document.getElementById('ed-phbg-fit')?.value||'').trim();
    if(v==='contain'||v==='cover'||v==='fill') return v;
    // "설정값 따름"일 때는 설정탭 기본값 추정
    const pdStyle=JSON.parse(localStorage.getItem('su_pd_style')||'{}')||{};
    const imgSettings=(typeof suReadImgSettings==='function')
      ? suReadImgSettings()
      : (JSON.parse(localStorage.getItem('su_img_settings')||'{}')||{});
    const hasFill = typeof imgSettings.fill === 'boolean';
    if(hasFill) return imgSettings.fill ? 'cover' : 'contain';
    const legacy=String(pdStyle.header_bg_fit||pdStyle.img_fill||'contain').trim();
    return (legacy==='cover'||legacy==='fill') ? legacy : 'contain';
  }catch(e){ return 'contain'; }
}
window.edPhbgSyncFromInputs = function(){
  try{
    const wrap=document.getElementById('ed-phbg-prev');
    let bg=document.getElementById('ed-phbg-prev-bg');
    if(!wrap) return;
    const url=String(document.getElementById('ed-phbg')?.value||'').trim();
    const fit=_edPhbgResolveFit();
    const size = (fit==='fill') ? '100% 100%' : (fit==='cover' ? 'cover' : 'contain');
    const scale = Math.max(40, Math.min(220, parseInt(document.getElementById('ed-phbg-scale')?.value||'100',10) || 100));
    const x = Math.max(0, Math.min(100, parseInt(document.getElementById('ed-phbg-posx')?.value||'50',10) || 50));
    const y = Math.max(0, Math.min(100, parseInt(document.getElementById('ed-phbg-posy')?.value||'50',10) || 50));
    if(!bg){
      bg=document.createElement('div');
      bg.id='ed-phbg-prev-bg';
      bg.style.position='absolute';
      bg.style.inset='-8%';
      bg.style.pointerEvents='none';
      wrap.prepend(bg);
    }
    if(!url){
      bg.style.backgroundImage='none';
      bg.style.opacity='0';
      return;
    }
    bg.style.opacity='.85';
    bg.style.backgroundImage=`url('${toHttpsUrl(url).replace(/'/g,'%27')}')`;
    bg.style.backgroundRepeat='no-repeat';
    bg.style.backgroundPosition=`${x}% ${y}%`;
    bg.style.backgroundSize=size;
    bg.style.transform=`scale(${scale/100})`;
    bg.style.transformOrigin='center center';
  }catch(e){}
};
window.edBindPhbgDrag = function(){
  try{
    const wrap=document.getElementById('ed-phbg-prev');
    if(!wrap || wrap._dragBound) return;
    wrap._dragBound=true;
    const apply=(ev)=>{
      const r=wrap.getBoundingClientRect();
      const cx=(ev.clientX-r.left)/Math.max(1,r.width);
      const cy=(ev.clientY-r.top)/Math.max(1,r.height);
      const x=Math.max(0,Math.min(100,Math.round(cx*100)));
      const y=Math.max(0,Math.min(100,Math.round(cy*100)));
      const xEl=document.getElementById('ed-phbg-posx'); if(xEl) xEl.value=String(x);
      const yEl=document.getElementById('ed-phbg-posy'); if(yEl) yEl.value=String(y);
      const xv=document.getElementById('ed-phbg-posx-val'); if(xv) xv.textContent=`${x}%`;
      const yv=document.getElementById('ed-phbg-posy-val'); if(yv) yv.textContent=`${y}%`;
      try{ document.getElementById('ed-phbg-pos').value='custom'; }catch(_){}
      try{ document.querySelectorAll('[data-phbg-pos]').forEach(el=>el.className='btn btn-xs btn-w'); }catch(_){}
      window.edPhbgSyncFromInputs && window.edPhbgSyncFromInputs();
    };
    wrap.addEventListener('pointerdown',(ev)=>{
      try{ wrap.setPointerCapture(ev.pointerId); }catch(e){}
      apply(ev);
      const mv=(e)=>apply(e);
      const up=()=>{ try{wrap.removeEventListener('pointermove',mv);}catch(_){}
        try{wrap.removeEventListener('pointerup',up);}catch(_){}
        try{wrap.removeEventListener('pointercancel',up);}catch(_){}
      };
      wrap.addEventListener('pointermove',mv);
      wrap.addEventListener('pointerup',up);
      wrap.addEventListener('pointercancel',up);
    });
  }catch(e){}
};

// ─────────────────────────────────────────────────────────────
// (요청사항) 대회탭 카드(조별리그 일정 등) 전용 디자인 3안
// ─────────────────────────────────────────────────────────────
window.cfgSetTourneyCardSettings = function(){
  const on = !!document.getElementById('cfg-tc-theme-on')?.checked;
  const accent = (document.getElementById('cfg-tc-accent')?.value || 'none').trim();
  const hd = parseInt(document.getElementById('cfg-tc-hd')?.value||'12',10);
  const bw = parseInt(document.getElementById('cfg-tc-bw')?.value||'4',10);
  const ic = parseInt(document.getElementById('cfg-tc-uicon')?.value||'34',10);
  const lw = parseInt(document.getElementById('cfg-tc-line-w')?.value||'2',10);
  const la = parseInt(document.getElementById('cfg-tc-line-a')?.value||'70',10);

  try{ localStorage.setItem('su_tc_theme_on', on ? '1' : '0'); }catch(e){}
  try{ localStorage.setItem('su_tc_accent_mode', ['none','header','border'].includes(accent)?accent:'none'); }catch(e){}
  try{ localStorage.setItem('su_tc_hd_alpha', String(Math.max(0,Math.min(30,hd)))); }catch(e){}
  try{ localStorage.setItem('su_tc_border_w', String(Math.max(2,Math.min(6,bw)))); }catch(e){}
  try{ localStorage.setItem('su_tc_uicon', String(Math.max(24,Math.min(48,ic)))); }catch(e){}
  try{ localStorage.setItem('su_tc_line_w', String(Math.max(1,Math.min(4,lw)))); }catch(e){}
  try{ localStorage.setItem('su_tc_line_a', String(Math.max(25,Math.min(100,la)))); }catch(e){}

  // 즉시 반영 (init.js 미로드/순서 이슈 대비)
  try{
    const _hd=Math.max(0,Math.min(30,hd));
    const _bw=Math.max(2,Math.min(6,bw));
    const _ic=Math.max(24,Math.min(48,ic));
    const _lw=Math.max(1,Math.min(4,lw));
    const _la=Math.max(25,Math.min(100,la));
    const _accent=['none','header','border'].includes(accent)?accent:'none';
    if(document.body){
      document.body.classList.toggle('tc-theme-on', !!on);
      document.body.classList.toggle('tc-accent-header', !!on && _accent==='header');
      document.body.classList.toggle('tc-accent-border', !!on && _accent==='border');
    }
    document.documentElement.style.setProperty('--tc-hd-a', String(_hd/100));
    document.documentElement.style.setProperty('--tc-bw', _bw+'px');
    document.documentElement.style.setProperty('--tc-uicon', _ic+'px');
    document.documentElement.style.setProperty('--tc-line-w', _lw+'px');
    document.documentElement.style.setProperty('--tc-line-a', String(_la/100));
  }catch(e){}
  try{ if(typeof window._applyTourneyCardTheme === 'function') window._applyTourneyCardTheme(); }catch(e){}
  try{ if(typeof render === 'function') render(); }catch(e){}
};

// ─────────────────────────────────────────────────────────────
// 공유카드 전역 디자인 모드 / 색상 효과
// ─────────────────────────────────────────────────────────────
window.cfgSetShareCardSettings = window.cfgSetShareCardSettings || function(){
  const mode = (document.getElementById('cfg-sc-mode')?.value || 'campus').trim();
  const color = parseInt(document.getElementById('cfg-sc-color')?.value||'72',10);
  const fx = parseInt(document.getElementById('cfg-sc-fx')?.value||'55',10);
  const winbg = parseInt(document.getElementById('cfg-sc-winbg')?.value||'55',10);
  const losergray = parseInt(document.getElementById('cfg-sc-losergray')?.value||'55',10);
  const profile = parseInt(document.getElementById('cfg-sc-profile')?.value||'100',10);
  const font = parseInt(document.getElementById('cfg-sc-font')?.value||'100',10);
  const surface = (document.getElementById('cfg-sc-surface')?.value || 'glass').trim();
  const logoLayout = (document.getElementById('cfg-sc-logo-layout')?.value || 'stack').trim();
  const logoSize = parseInt(document.getElementById('cfg-sc-logo-size')?.value||'100',10);
  const logoFit = (document.getElementById('cfg-sc-logo-fit')?.value || 'contain').trim();
  try{ localStorage.setItem('su_sc_mode', ['campus','vivid','soft','dark','minimal','aurora','poster','mono'].includes(mode)?mode:'campus'); }catch(e){}
  try{ localStorage.setItem('su_sc_color', String(Math.max(20,Math.min(100,color)))); }catch(e){}
  try{ localStorage.setItem('su_sc_fx', String(Math.max(0,Math.min(100,fx)))); }catch(e){}
  try{ localStorage.setItem('su_sc_winbg', String(Math.max(0,Math.min(100,winbg)))); }catch(e){}
  try{ localStorage.setItem('su_sc_losergray', String(Math.max(10,Math.min(90,losergray)))); }catch(e){}
  try{ localStorage.setItem('su_sc_profile_pct', String(Math.max(70,Math.min(145,profile)))); }catch(e){}
  try{ localStorage.setItem('su_sc_font_pct', String(Math.max(85,Math.min(135,font)))); }catch(e){}
  try{ localStorage.setItem('su_sc_surface', ['glass','clean','solid'].includes(surface)?surface:'glass'); }catch(e){}
  try{ localStorage.setItem('su_sc_logo_layout', ['stack','inline','badge','cover'].includes(logoLayout)?logoLayout:'stack'); }catch(e){}
  try{ localStorage.setItem('su_sc_logo_size', String(Math.max(70,Math.min(150,logoSize)))); }catch(e){}
  try{ localStorage.setItem('su_sc_logo_fit', ['contain','cover','fill','zoom'].includes(logoFit)?logoFit:'contain'); }catch(e){}
  try{ if(typeof render === 'function') render(); }catch(e){}
};
window.cfgSyncTeamColorPreview = window.cfgSyncTeamColorPreview || function(){
  try{
    const ckA = document.getElementById('cfg-team-ck-a')?.value || (localStorage.getItem('su_team_color_ck_a')||'#2563eb');
    const ckB = document.getElementById('cfg-team-ck-b')?.value || (localStorage.getItem('su_team_color_ck_b')||'#d97706');
    const proA = document.getElementById('cfg-team-pro-a')?.value || (localStorage.getItem('su_team_color_pro_a')||'#0f766e');
    const proB = document.getElementById('cfg-team-pro-b')?.value || (localStorage.getItem('su_team_color_pro_b')||'#4f46e5');
    const paint=(id,color,label)=>{
      const el=document.getElementById(id);
      if(!el) return;
      el.style.background=color;
      el.style.borderColor=color;
      el.textContent=label;
    };
    paint('cfg-team-ck-prev-a', ckA, `A팀 ${ckA}`);
    paint('cfg-team-ck-prev-b', ckB, `B팀 ${ckB}`);
    paint('cfg-team-pro-prev-a', proA, `A팀 ${proA}`);
    paint('cfg-team-pro-prev-b', proB, `B팀 ${proB}`);
  }catch(e){}
};
try{
  const _m = [
    ['su_team_color_ck_a', '#0e7490', '#2563eb'],
    // (재수정) 블루/인디고 조합이 서로 비슷해 보인다는 피드백으로 B팀을 대비되는 앰버로 되돌림
    ['su_team_color_ck_b', '#6366f1', '#d97706'],
    ['su_team_color_pro_b', '#7c3aed', '#4f46e5']
  ];
  _m.forEach(([k, oldV, nextV])=>{
    try{
      const cur = String(localStorage.getItem(k)||'').trim().toLowerCase();
      if(!cur || cur===oldV.toLowerCase()) localStorage.setItem(k, nextV);
    }catch(e){}
  });
}catch(e){}
window.cfgPreviewShareCardMode = window.cfgPreviewShareCardMode || function(mode){
  const el=document.getElementById('cfg-sc-mode');
  if(el) el.value = ['campus','vivid','soft','dark','minimal','aurora','poster','mono'].includes(mode)?mode:'campus';
  window.cfgSetShareCardSettings && window.cfgSetShareCardSettings();
};
window.cfgSetShareCardOverrides = function(){
  const pairs = [
    ['default', document.getElementById('cfg-sc-ov-def')?.value || 'inherit'],
    ['ck', document.getElementById('cfg-sc-ov-ck')?.value || 'inherit'],
    ['pro', document.getElementById('cfg-sc-ov-pro')?.value || 'inherit'],
    ['tt', document.getElementById('cfg-sc-ov-tt')?.value || 'inherit'],
    ['comp', document.getElementById('cfg-sc-ov-comp')?.value || 'inherit'],
    ['procomp-bkt', document.getElementById('cfg-sc-ov-bkt')?.value || 'inherit'],
  ];
  pairs.forEach(([k,v])=>{
    try{
      if(v==='inherit') localStorage.removeItem(`su_sc_mode_${k}`);
      else localStorage.setItem(`su_sc_mode_${k}`, v);
    }catch(e){}
  });
  const grayPairs = [
    ['default', document.getElementById('cfg-sc-gray-def')?.value || 'inherit'],
    ['ck', document.getElementById('cfg-sc-gray-ck')?.value || 'inherit'],
    ['pro', document.getElementById('cfg-sc-gray-pro')?.value || 'inherit'],
    ['tt', document.getElementById('cfg-sc-gray-tt')?.value || 'inherit'],
    ['comp', document.getElementById('cfg-sc-gray-comp')?.value || 'inherit'],
    ['procomp-bkt', document.getElementById('cfg-sc-gray-bkt')?.value || 'inherit'],
  ];
  grayPairs.forEach(([k,v])=>{
    try{
      if(v==='inherit') localStorage.removeItem(`su_sc_losergray_${k}`);
      else localStorage.setItem(`su_sc_losergray_${k}`, String(Math.max(10,Math.min(90,parseInt(v,10)||55))));
    }catch(e){}
  });
  const profilePairs = [
    ['default', document.getElementById('cfg-sc-prof-def')?.value || 'inherit'],
    ['ck', document.getElementById('cfg-sc-prof-ck')?.value || 'inherit'],
    ['pro', document.getElementById('cfg-sc-prof-pro')?.value || 'inherit'],
    ['tt', document.getElementById('cfg-sc-prof-tt')?.value || 'inherit'],
    ['comp', document.getElementById('cfg-sc-prof-comp')?.value || 'inherit'],
    ['procomp-bkt', document.getElementById('cfg-sc-prof-bkt')?.value || 'inherit'],
  ];
  profilePairs.forEach(([k,v])=>{
    try{
      if(v==='inherit') localStorage.removeItem(`su_sc_profile_pct_${k}`);
      else localStorage.setItem(`su_sc_profile_pct_${k}`, String(Math.max(70,Math.min(145,parseInt(v,10)||100))));
    }catch(e){}
  });
  const fontPairs = [
    ['default', document.getElementById('cfg-sc-font-def')?.value || 'inherit'],
    ['ck', document.getElementById('cfg-sc-font-ck')?.value || 'inherit'],
    ['pro', document.getElementById('cfg-sc-font-pro')?.value || 'inherit'],
    ['tt', document.getElementById('cfg-sc-font-tt')?.value || 'inherit'],
    ['comp', document.getElementById('cfg-sc-font-comp')?.value || 'inherit'],
    ['procomp-bkt', document.getElementById('cfg-sc-font-bkt')?.value || 'inherit'],
  ];
  fontPairs.forEach(([k,v])=>{
    try{
      if(v==='inherit') localStorage.removeItem(`su_sc_font_pct_${k}`);
      else localStorage.setItem(`su_sc_font_pct_${k}`, String(Math.max(85,Math.min(135,parseInt(v,10)||100))));
    }catch(e){}
  });
  const shapePairs = [
    ['default', document.getElementById('cfg-sc-shape-def')?.value || 'inherit'],
    ['ck', document.getElementById('cfg-sc-shape-ck')?.value || 'inherit'],
    ['pro', document.getElementById('cfg-sc-shape-pro')?.value || 'inherit'],
    ['tt', document.getElementById('cfg-sc-shape-tt')?.value || 'inherit'],
    ['comp', document.getElementById('cfg-sc-shape-comp')?.value || 'inherit'],
    ['procomp-bkt', document.getElementById('cfg-sc-shape-bkt')?.value || 'inherit'],
  ];
  shapePairs.forEach(([k,v])=>{
    try{
      if(v==='inherit') localStorage.removeItem(`su_sc_cardshape_${k}`);
      else localStorage.setItem(`su_sc_cardshape_${k}`, ['rounded','sharp','soft','ribbon','tag','ticket'].includes(v)?v:'rounded');
    }catch(e){}
  });
  try{ if(typeof render === 'function') render(); }catch(e){}
};

// ─────────────────────────────────────────────────────────────
// (요청사항) 토너먼트 대진표/브라켓 디자인 프리셋
// - 기존 슬라이더(선두께/진하기/테두리/로고크기 등)에 값을 "한 번에" 채워줌
// - 실제 저장/적용은 cfgSetTourneyCardSettings()가 수행
// ─────────────────────────────────────────────────────────────
window.cfgApplyBracketPreset = function(preset){
  const p = (preset || '').trim();
  const presets = {
    '기본':      {on:true, accent:'none',  hd:12, bw:4, ic:34, lw:2, la:70},
    '월드컵':    {on:true, accent:'header',hd:18, bw:5, ic:42, lw:3, la:85},
    '프로리그':  {on:true, accent:'border',hd:10, bw:6, ic:38, lw:2, la:78},
    '컴팩트':    {on:true, accent:'none',  hd:8,  bw:3, ic:30, lw:1, la:65},
    '미니멀':    {on:true, accent:'none',  hd:0,  bw:1, ic:32, lw:1, la:40},
    '다크리그':  {on:true, accent:'border',hd:16, bw:6, ic:40, lw:3, la:90},
  };
  const v = presets[p] || presets['기본'];
  const set = (id, val) => { const el=document.getElementById(id); if(el){ el.value = String(val); el.dispatchEvent(new Event('input')); } };
  try{
    const chk=document.getElementById('cfg-tc-theme-on'); if(chk) chk.checked = !!v.on;
    const sel=document.getElementById('cfg-tc-accent'); if(sel) sel.value = v.accent;
    set('cfg-tc-hd', v.hd); set('cfg-tc-bw', v.bw); set('cfg-tc-uicon', v.ic); set('cfg-tc-line-w', v.lw); set('cfg-tc-line-a', v.la);
    // 숫자 박스 동기화(있는 경우)
    const syncNum = (rangeId, numSpanId, suf='') => {
      const r=document.getElementById(rangeId); const s=document.getElementById(numSpanId);
      if(r && s) s.textContent = r.value + suf;
    };
    syncNum('cfg-tc-hd','cfg-tc-hd-v','%');
    syncNum('cfg-tc-bw','cfg-tc-bw-v','px');
    syncNum('cfg-tc-uicon','cfg-tc-ic-v','px');
    syncNum('cfg-tc-line-w','cfg-tc-lw-v','px');
    syncNum('cfg-tc-line-a','cfg-tc-la-v','%');
  }catch(e){}
  try{ window.cfgSetTourneyCardSettings && window.cfgSetTourneyCardSettings(); }catch(e){}
};

// ─────────────────────────────────────────────────────────────
// (요청사항) 캘린더 요약칩/공유 버튼 구성
// ─────────────────────────────────────────────────────────────
window.cfgSetCalendarUiSettings = function(){
  const chipMode = (document.getElementById('cfg-cal-chip')?.value || 'types').trim(); // total | types
  const shareAdminOnly = !!document.getElementById('cfg-share-adminonly')?.checked;
  try{ localStorage.setItem('su_cal_chip_mode', (chipMode==='total'?'total':'types')); }catch(e){}
  try{ localStorage.setItem('su_share_admin_only', shareAdminOnly ? '1' : '0'); }catch(e){}
  try{ if(typeof render === 'function') render(); }catch(e){}
};

// ─────────────────────────────────────────────────────────────
// (요청사항) 날짜 버튼 메뉴(대회/프로리그 일정) 디자인 모드
// - ASL 스케줄 페이지처럼 날짜 탭 형태 + 미니 매치업 프리뷰
// ─────────────────────────────────────────────────────────────
window.cfgSetDateMenuStyle = function(){
  const v = (document.getElementById('cfg-date-menu-style')?.value || 'pill').trim(); // pill | asl
  try{ localStorage.setItem('su_date_menu_style', v==='asl' ? 'asl' : 'pill'); }catch(e){}
  try{ if(typeof render === 'function') render(); }catch(e){}
};

// ─────────────────────────────────────────────────────────────
// (요청사항) 헤더 커스텀(제목/좌측 아이콘/우측 이미지/배경 이미지/높이)
// ─────────────────────────────────────────────────────────────
window.cfgSetHeaderSettings = function(){
  const title = (document.getElementById('cfg-hdr-title')?.value || '').trim();
  const lIco  = (document.getElementById('cfg-hdr-left')?.value || '').trim();
  const lSz   = parseInt(document.getElementById('cfg-hdr-left-sz')?.value || '22',10) || 22;
  const rImg  = (document.getElementById('cfg-hdr-right')?.value || '').trim();
  const rSz   = parseInt(document.getElementById('cfg-hdr-right-sz')?.value || '32',10) || 32;
  const bgImg = (document.getElementById('cfg-hdr-bg')?.value || '').trim();
  const hH    = parseInt(document.getElementById('cfg-hdr-h')?.value || '0',10) || 0;
  const fx    = (document.getElementById('cfg-hdr-fx')?.value || 'classic').trim();
  const c1    = (document.getElementById('cfg-hdr-c1')?.value || '').trim();
  const c2    = (document.getElementById('cfg-hdr-c2')?.value || '').trim();
  const sync  = !!document.getElementById('cfg-hdr-sync')?.checked;
  try{ localStorage.setItem('su_hdr_title', title); }catch(e){}
  try{ localStorage.setItem('su_hdr_left_icon', lIco); }catch(e){}
  try{ localStorage.setItem('su_hdr_left_size', String(Math.max(14,Math.min(44,lSz)))); }catch(e){}
  try{ localStorage.setItem('su_hdr_right_img', rImg); }catch(e){}
  try{ localStorage.setItem('su_hdr_right_size', String(Math.max(18,Math.min(70,rSz)))); }catch(e){}
  try{ localStorage.setItem('su_hdr_bg_img', bgImg); }catch(e){}
  try{ localStorage.setItem('su_hdr_height', String(Math.max(0,Math.min(140,hH)))); }catch(e){}
  try{ localStorage.setItem('su_hdr_fx', fx); }catch(e){}
  try{ localStorage.setItem('su_hdr_c1', c1); }catch(e){}
  try{ localStorage.setItem('su_hdr_c2', c2); }catch(e){}
  try{ localStorage.setItem('su_hdr_sync_theme', sync?'1':'0'); }catch(e){}
  try{ if(typeof window._applyHeaderSettings === 'function') window._applyHeaderSettings(); }catch(e){}
  try{ if(typeof render === 'function') render(); }catch(e){}
};

// ─────────────────────────────────────────────────────────────
// (요청사항) 헤더 테마 프리셋
// - 여러 개 저장/선택/적용
// ─────────────────────────────────────────────────────────────
