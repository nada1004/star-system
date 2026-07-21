/* ══════════════════════════════════════
   Board2 Card Utilities
══════════════════════════════════════ */
function _b2NameTag(p, accentCol, showTier) {
  const crewCol = p.crewName && typeof _gcCrew === 'function' ? (_gcCrew(p.crewName) || '') : '';
  const safeName = (p.name||'').replace(/'/g,"\\'");
  return `
    <div style="display:flex;align-items:center;gap:6px;padding:3px 8px 3px 3px;border-radius:20px;cursor:pointer;transition:background .12s"
      onmouseover="this.style.background='${accentCol}14'"
      onmouseout="this.style.background='transparent'">
      <div onclick="openPlayerModal('${safeName}')" style="display:flex;align-items:center;gap:6px;flex:1">
      ${_b2Avatar(p, crewCol||accentCol, 58)}
      <span style="font-weight:700;font-size:var(--fs-lg);color:var(--text1);white-space:nowrap;${p.inactive?'opacity:.6':''}">${p.name||''}</span>
      ${p.race&&p.race!=='N'?`<span class="rbadge r${p.race}" style="font-size:10px;flex-shrink:0">${p.race}</span>`:''}
      ${showTier&&p.tier?`<span style="font-size:10px;font-weight:700;padding:1px 5px;border-radius:4px;background:${getTierBtnColor(p.tier)};color:${getTierBtnTextColor(p.tier)||'#fff'};flex-shrink:0">${p.tier}</span>`:''}
      ${p.inactive?'<span style="font-size:9px;background:#fff7ed;color:#9a3412;border-radius:4px;padding:1px 4px;font-weight:700;flex-shrink:0">⏸️</span>':''}
      </div>
    </div>`;
}

function _b2PlayerRowCompact(p, accentCol) {
  const tierCol = getTierBtnColor(p.tier||'');
  const tierTextCol = getTierBtnTextColor(p.tier||'') || '#fff';
  const safeName = (p.name||'').replace(/'/g,"\\'");
  return `
    <div style="display:flex;align-items:center;gap:8px;cursor:pointer;flex:1"
      onmouseover="this.querySelector('.b2name').style.color='${accentCol}'"
      onmouseout="this.querySelector('.b2name').style.color='var(--text1)'">
      <div onclick="openPlayerModal('${safeName}')" style="display:flex;align-items:center;gap:8px;flex:1">
      ${_b2Avatar(p, accentCol, 58)}
      <span class="b2name" style="font-weight:700;font-size:var(--fs-lg);color:var(--text1);transition:color .1s;${p.inactive?'opacity:.6':''}">${p.name||''}</span>
      ${p.inactive?'<span style="font-size:9px;background:#fff7ed;color:#9a3412;border-radius:4px;padding:1px 4px;font-weight:700;flex-shrink:0">⏸️</span>':''}
      ${p.race&&p.race!=='N'?`<span class="rbadge r${p.race}" style="font-size:var(--fs-caption);flex-shrink:0">${p.race}</span>`:''}
      <span style="font-size:var(--fs-caption);font-weight:700;padding:2px 8px;border-radius:6px;background:${tierCol};color:${tierTextCol}">${p.tier||'?'}</span>
      </div>
    </div>`;
}

function _b2Chip(p, accentCol) {
  const crewCol = p.crewName && typeof _gcCrew === 'function' ? (_gcCrew(p.crewName) || '') : '';
  const borderStyle = `border:1.5px solid ${accentCol}44`;
  return `
    <div onclick="openPlayerModal('${(p.name||'').replace(/'/g,"\\'")}')"
      style="display:flex;align-items:center;gap:7px;padding:5px 13px 5px 5px;border-radius:24px;background:var(--white);${borderStyle};cursor:pointer;box-shadow:0 1px 3px #0001;transition:transform .1s,box-shadow .1s"
      onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 4px 10px ${accentCol}33'"
      onmouseout="this.style.transform='';this.style.boxShadow='0 1px 3px #0001'">
      ${_b2Avatar(p, crewCol||accentCol, 36)}
      <span style="font-weight:700;font-size:var(--fs-base);color:var(--text1);white-space:nowrap">${p.name||''}</span>
    </div>`;
}

function _b2Avatar(p, col, size) {
  const raceShort = {'T':'T','Z':'Z','P':'P','N':'?'}[p.race||'N'] || '?';
  const _escAttr = (typeof window.escAttr === 'function') ? window.escAttr : (s)=>String(s||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  const _escJS = (typeof window.escJS === 'function') ? window.escJS : (s)=>String(s||'').replace(/\\/g,'\\\\').replace(/'/g,"\\'").replace(/\r/g,'\\r').replace(/\n/g,'\\n');
  const base = size || 28;
  let mult = 1;
  try{
    const chipPx = parseInt(localStorage.getItem('su_bcp_size') || '26', 10);
    mult = Math.max(0.6, Math.min(2.4, chipPx / 26));
  }catch(e){
    console.warn('[_b2Avatar] 아바타 크기 설정 로드 실패:', e.message);
  }
  const s = Math.round(base * mult);
  const badgeSize = Math.round(s * 0.38);
  const _rawIcon = getStatusIcon(p.name);
  const statusHtml = getStatusIconHTML(p.name);
  const _safeColAttr = _escAttr(col);
  const _safeColJs = _escJS(col);
  const _safeRaceJs = _escJS(raceShort);
  const _safeNameJs = _escJS(p && p.name ? p.name : '');
  const r = s / 2, br = badgeSize / 2;
  const _bTop   = Math.round(r * 0.134 - br);
  const _bRight = Math.round(r * 0.5   - br);
  const _isImgIcon = _rawIcon && (typeof window._siIsImg === 'function' ? window._siIsImg(_rawIcon) : false);
  const _badgeInner = _isImgIcon
    ? `<img src="${_escAttr(_rawIcon)}" crossorigin="anonymous" style="width:${badgeSize}px;height:${badgeSize}px;border-radius:50%;object-fit:cover;opacity:.82" onerror="this.style.display='none';console.warn('[현황판] 상태 아이콘 로드 실패:', this.src)">`
    : statusHtml.replace(/margin-left:[^;]+;/g,'').replace(/font-size:[^;]+;/g,'');
  const _badgeBg = _isImgIcon ? 'rgba(255,255,255,.72)' : 'transparent';
  const badge = statusHtml
    ? `<span style="position:absolute;top:${_bTop}px;right:${_bRight}px;width:${badgeSize}px;height:${badgeSize}px;border-radius:50%;background:${_badgeBg};overflow:hidden;display:flex;align-items:center;justify-content:center;font-size:${Math.round(badgeSize*0.82)}px;line-height:1;filter:drop-shadow(0 1px 2px rgba(0,0,0,.65));z-index:2" >${_badgeInner}</span>`
    : '';
  if (p.photo) {
    const _avatarShapeStyle = `border-radius:var(--su_profile_radius,6px);clip-path:var(--su_profile_clip,none)`;
    const _2nd = (typeof _phSwap2ndHTML === 'function') ? _phSwap2ndHTML(p.secondProfileFile, { style: `width:${s}px;height:${s}px;${_avatarShapeStyle};object-fit:cover` }) : '';
    return `<span class="${_2nd ? 'ph-swap ' : ''}" style="width:${s}px;height:${s}px;flex-shrink:0;display:inline-flex;position:relative">
      <img src="${_escAttr(toThumbUrl(p.photo,s))}" data-orig="${_escAttr(toHttpsUrl(p.photo))}" crossorigin="anonymous" loading="lazy" decoding="async" fetchpriority="low" data-b2-photo="1" style="width:${s}px;height:${s}px;${_avatarShapeStyle};object-fit:cover;flex-shrink:0" onerror="if(this.dataset.orig&&this.src!==this.dataset.orig){this.removeAttribute('crossorigin');this.src=this.dataset.orig;}else{console.warn('[현황판] 선수 프로필 이미지 로드 실패:', this.src, '선수:', '${_safeNameJs}');this.parentNode.innerHTML=_b2AvatarFallback('${_safeRaceJs}','${_safeColJs}',${s})}">
      ${_2nd}
      ${badge}
    </span>`;
  }
  return `<span style="width:${s}px;height:${s}px;border-radius:var(--su_profile_radius,6px);clip-path:var(--su_profile_clip,none);background:${_safeColAttr};display:inline-flex;align-items:center;justify-content:center;font-weight:900;font-size:${Math.round(s*0.45)}px;color:#fff;flex-shrink:0;position:relative">${raceShort}${badge}</span>`;
}

function _b2AvatarFallback(letter, col, size) {
  const s = size || 28;
  return `<span style="width:${s}px;height:${s}px;border-radius:var(--su_profile_radius,6px);clip-path:var(--su_profile_clip,none);background:${col};display:inline-flex;align-items:center;justify-content:center;font-weight:900;font-size:${Math.round(s*0.45)}px;color:#fff;flex-shrink:0;border:2px solid ${col}88">${letter}</span>`;
}

try{
  window._b2NameTag = _b2NameTag;
  window._b2PlayerRowCompact = _b2PlayerRowCompact;
  window._b2Chip = _b2Chip;
  window._b2Avatar = _b2Avatar;
  window.Board2CardUtils = window.Board2CardUtils || {
    nameTag: _b2NameTag,
    playerRowCompact: _b2PlayerRowCompact,
    chip: _b2Chip,
    avatar: _b2Avatar
  };
}catch(e){}
