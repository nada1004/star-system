/* ══════════════════════════════════════════════════════════════
   설정 - 프로필 위치(포지션) 편집 유틸 (settings-crud.js 에서 분리, 2026-07-30)
   ══════════════════════════════════════════════════════════════ */

function _edClampPct(v, d){
  const n = parseInt(v, 10);
  if(!Number.isFinite(n)) return d;
  return Math.max(0, Math.min(100, n));
}
function _edResolveUrlInputId(prefix){
  if(prefix==='p3pos') return 'ed-photo3';
  if(prefix==='p4pos') return 'ed-photo4';
  if(prefix==='p5pos') return 'ed-photo5';
  if(prefix==='p6pos') return 'ed-photo6';
  if(prefix==='p7pos') return 'ed-photo7';
  if(prefix==='p8pos') return 'ed-photo8';
  if(prefix==='p9pos') return 'ed-photo9';
  if(prefix==='p10pos') return 'ed-photo10';
  if(prefix==='cardpos') return 'ed-card-photo';
  return '';
}
// 프로필 사진 2~10 위치보정 탭 전환 (하나만 보여주고 나머지는 숨김)
window.edPosTabSelect = function(n){
  try{
    document.querySelectorAll('[data-pos-tab-body]').forEach(el=>{
      el.style.display = (String(el.getAttribute('data-pos-tab-body'))===String(n)) ? 'block' : 'none';
    });
    document.querySelectorAll('[data-pos-tab-btn]').forEach(btn=>{
      btn.className = 'btn btn-xs ' + ((String(btn.getAttribute('data-pos-tab-btn'))===String(n)) ? 'btn-b' : 'btn-w');
    });
  }catch(e){}
};
function _edEnsurePosImg(prefix, url){
  try{
    const prev = document.getElementById(`ed-${prefix}-prev`);
    if(!prev) return null;
    let img = document.getElementById(`ed-${prefix}-img`);
    const u = String(url||'').trim();
    if(!u || u.startsWith('data:')){
      if(img) img.style.display='none';
      return img;
    }
    if(!img){
      img = document.createElement('img');
      img.id = `ed-${prefix}-img`;
      img.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transform:scale(1.02);display:block';
      img.setAttribute('onerror',"this.style.display='none'");
      prev.insertBefore(img, prev.firstChild);
    }
    img.src = toHttpsUrl(u).replace(/\"/g,'&quot;');
    img.style.display='block';
    return img;
  }catch(e){
    return null;
  }
}
function _edPosSync(prefix, defX, defY, refresh){
  try{
    const urlInputId = _edResolveUrlInputId(prefix);
    if(refresh && urlInputId){
      const url = document.getElementById(urlInputId)?.value || '';
      _edEnsurePosImg(prefix, url);
    }
    const x = _edClampPct(document.getElementById(`ed-${prefix}-x`)?.value, defX);
    const y = _edClampPct(document.getElementById(`ed-${prefix}-y`)?.value, defY);
    const img = document.getElementById(`ed-${prefix}-img`);
    if(img) img.style.objectPosition = `${x}% ${y}%`;
    const xv = document.getElementById(`ed-${prefix}-xv`); if(xv) xv.textContent = `${x}%`;
    const yv = document.getElementById(`ed-${prefix}-yv`); if(yv) yv.textContent = `${y}%`;
    const del = document.getElementById(`ed-${prefix}-del`); if(del) del.value = '0';
  }catch(e){}
}
function _edPosCenter(prefix, defX, defY){
  try{
    const xEl = document.getElementById(`ed-${prefix}-x`); if(xEl) xEl.value = String(defX);
    const yEl = document.getElementById(`ed-${prefix}-y`); if(yEl) yEl.value = String(defY);
    _edPosSync(prefix, defX, defY, true);
  }catch(e){}
}
function _edPosDelete(prefix, msg){
  try{
    const del = document.getElementById(`ed-${prefix}-del`);
    if(del) del.value = '1';
    if(msg) alert(msg);
  }catch(e){}
}
function _edBindPosDrag(prefix, defX, defY){
  try{
    const prev = document.getElementById(`ed-${prefix}-prev`);
    if(!prev || prev._dragBound) return;
    prev._dragBound = true;
    const apply = (ev)=>{
      const r = prev.getBoundingClientRect();
      const cx = (ev.clientX - r.left) / Math.max(1, r.width);
      const cy = (ev.clientY - r.top) / Math.max(1, r.height);
      const x = _edClampPct(Math.round(cx*100), defX);
      const y = _edClampPct(Math.round(cy*100), defY);
      const xEl = document.getElementById(`ed-${prefix}-x`); if(xEl) xEl.value = String(x);
      const yEl = document.getElementById(`ed-${prefix}-y`); if(yEl) yEl.value = String(y);
      _edPosSync(prefix, defX, defY, false);
    };
    prev.addEventListener('pointerdown', (ev)=>{
      try{ prev.setPointerCapture(ev.pointerId); }catch(e){}
      apply(ev);
      const mv = (e)=>apply(e);
      const up = ()=>{
        try{ prev.removeEventListener('pointermove', mv); }catch(_){}
        try{ prev.removeEventListener('pointerup', up); }catch(_){}
        try{ prev.removeEventListener('pointercancel', up); }catch(_){}
      };
      prev.addEventListener('pointermove', mv);
      prev.addEventListener('pointerup', up);
      prev.addEventListener('pointercancel', up);
    });
  }catch(e){}
}

window.edP3PosSyncFromInputs = function(refresh){ _edPosSync('p3pos', 50, 50, !!refresh); };
window.edP3PosCenter = function(){ _edPosCenter('p3pos', 50, 50); };
window.edP3PosDelete = function(){ _edPosDelete('p3pos', '프로필 사진 3 위치 보정값을 삭제합니다. (기본 center)'); };
window.edBindP3PosDrag = function(){ _edBindPosDrag('p3pos', 50, 50); };

window.edP4PosSyncFromInputs = function(refresh){ _edPosSync('p4pos', 50, 50, !!refresh); };
window.edP4PosCenter = function(){ _edPosCenter('p4pos', 50, 50); };
window.edP4PosDelete = function(){ _edPosDelete('p4pos', '프로필 사진 4 위치 보정값을 삭제합니다. (기본 center)'); };
window.edBindP4PosDrag = function(){ _edBindPosDrag('p4pos', 50, 50); };

window.edP5PosSyncFromInputs = function(refresh){ _edPosSync('p5pos', 50, 50, !!refresh); };
window.edP5PosCenter = function(){ _edPosCenter('p5pos', 50, 50); };
window.edP5PosDelete = function(){ _edPosDelete('p5pos', '프로필 사진 5 위치 보정값을 삭제합니다. (기본 center)'); };
window.edBindP5PosDrag = function(){ _edBindPosDrag('p5pos', 50, 50); };

window.edP6PosSyncFromInputs = function(refresh){ _edPosSync('p6pos', 50, 50, !!refresh); };
window.edP6PosCenter = function(){ _edPosCenter('p6pos', 50, 50); };
window.edP6PosDelete = function(){ _edPosDelete('p6pos', '프로필 사진 6 위치 보정값을 삭제합니다. (기본 center)'); };
window.edBindP6PosDrag = function(){ _edBindPosDrag('p6pos', 50, 50); };

window.edP7PosSyncFromInputs = function(refresh){ _edPosSync('p7pos', 50, 50, !!refresh); };
window.edP7PosCenter = function(){ _edPosCenter('p7pos', 50, 50); };
window.edP7PosDelete = function(){ _edPosDelete('p7pos', '프로필 사진 7 위치 보정값을 삭제합니다. (기본 center)'); };
window.edBindP7PosDrag = function(){ _edBindPosDrag('p7pos', 50, 50); };

window.edP8PosSyncFromInputs = function(refresh){ _edPosSync('p8pos', 50, 50, !!refresh); };
window.edP8PosCenter = function(){ _edPosCenter('p8pos', 50, 50); };
window.edP8PosDelete = function(){ _edPosDelete('p8pos', '프로필 사진 8 위치 보정값을 삭제합니다. (기본 center)'); };
window.edBindP8PosDrag = function(){ _edBindPosDrag('p8pos', 50, 50); };

window.edP9PosSyncFromInputs = function(refresh){ _edPosSync('p9pos', 50, 50, !!refresh); };
window.edP9PosCenter = function(){ _edPosCenter('p9pos', 50, 50); };
window.edP9PosDelete = function(){ _edPosDelete('p9pos', '프로필 사진 9 위치 보정값을 삭제합니다. (기본 center)'); };
window.edBindP9PosDrag = function(){ _edBindPosDrag('p9pos', 50, 50); };

window.edP10PosSyncFromInputs = function(refresh){ _edPosSync('p10pos', 50, 50, !!refresh); };
window.edP10PosCenter = function(){ _edPosCenter('p10pos', 50, 50); };
window.edP10PosDelete = function(){ _edPosDelete('p10pos', '프로필 사진 10 위치 보정값을 삭제합니다. (기본 center)'); };
window.edBindP10PosDrag = function(){ _edBindPosDrag('p10pos', 50, 50); };

window.edCardPosSyncFromInputs = function(refresh){ _edPosSync('cardpos', 50, 22, !!refresh); };
window.edCardPosCenter = function(){ _edPosCenter('cardpos', 50, 22); };
window.edCardPosDelete = function(){ _edPosDelete('cardpos', '개인/끝장전 카드 얼굴 위치 보정값을 삭제합니다. (기본 center 22%)'); };
window.edBindCardPosDrag = function(){ _edBindPosDrag('cardpos', 50, 22); };

/* ════════════════════════════════════════════════════════
   §4  경기 기록 수정 (openRE / saveRow)
════════════════════════════════════════════════════════ */
// 팀 경기(mini/civil/univm/ck/pro/tt)에서 A팀/B팀 멤버를 수정하는 섹션 HTML 반환
// 끝장전/프로리그 끝장전/개인전 수정창의 승자·패자 입력에 쓰는 스트리머 목록 datalist
// (자유 텍스트 입력은 유지하되, 등록된 스트리머 중에서 바로 골라 다른 사람으로 변경할 수 있게 함)
