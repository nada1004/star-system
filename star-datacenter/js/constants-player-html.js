/* ══════════════════════════════════════
   Common Player HTML Utilities
══════════════════════════════════════ */
// ── render-cycle localStorage 캐시 (동일 rAF 내 반복 읽기 방지) ──
let _pphCache = null;
function _getPPHCache() {
  if (_pphCache) return _pphCache;
  try {
    const scale = Math.max(0.7, Math.min(1.6, parseFloat(localStorage.getItem('su_avatar_scale')||'1')||1));
    const fit = (localStorage.getItem('su_avatar_fit')||'contain').trim();
    const recFit = (localStorage.getItem('su_rec_avatar_fit')||fit).trim();
    _pphCache = {
      scale: isNaN(scale) ? 1 : scale,
      fit: ['contain','cover'].includes(fit) ? fit : 'contain',
      recFit: ['contain','cover'].includes(recFit) ? recFit : 'contain'
    };
  } catch(e) { _pphCache = { scale:1, fit:'contain', recFit:'contain' }; }
  // 次の render() 呼び出し時にキャッシュをクリア
  requestAnimationFrame(() => { _pphCache = null; });
  return _pphCache;
}

function getPlayerPhotoHTML(playerName, size, extraStyle, opts){
  size=size||'32px'; extraStyle=extraStyle||'';
  opts = opts || {};
  // opts.lazy === true → 리스트/순위표 컨텍스트. 뷰포트 바깥 이미지는 지연 로드.
  //                    → 한꺼번에 high priority로 폭주하는 것 방지.
  const _pph = _getPPHCache();
  let _scale = _pph.scale;
  try{
    const m=String(size).match(/^(\d+(?:\.\d+)?)px$/);
    if(m && _scale!==1){
      const n=parseFloat(m[1]);
      size=(n*_scale).toFixed(2).replace(/\.00$/,'')+'px';
    }
  }catch(e){}
  try{
    const ctx = String(window.__detailCtx||'');
    if(ctx==='compModal' || ctx==='histModal'){
      const mdPct = parseFloat(getMatchDetailAvatarSetting('scale') || '100');
      const mdScale = Math.max(0.8, Math.min(2.0, isNaN(mdPct) ? 1 : (mdPct/100)));
      const m2=String(size).match(/^(\d+(?:\.\d+)?)px$/);
      if(m2 && mdScale!==1){
        const n2=parseFloat(m2[1]);
        size=(n2*mdScale).toFixed(2).replace(/\.00$/,'')+'px';
      }
    }
  }catch(e){}
  const arr = Array.isArray(window.players) ? window.players : [];
  if(!window._playerByNameCache) window._playerByNameCache = { ref:null, len:-1, map:null };
  const _cache = window._playerByNameCache;
  if(_cache.ref !== arr || _cache.len !== arr.length || !_cache.map){
    const m = new Map();
    arr.forEach(x=>{
      const nm = String(x&&x.name||'').trim();
      if(nm) m.set(nm, x);
    });
    _cache.ref = arr;
    _cache.len = arr.length;
    _cache.map = m;
  }
  const _key = String(playerName||'').trim();
  const basePlayer = (_key && _cache.map && _cache.map.get) ? (_cache.map.get(_key) || null) : null;
  const photoMap = (window.playerPhotos && typeof window.playerPhotos==='object') ? window.playerPhotos : {};
  const p = basePlayer ? ({...basePlayer, ...((!basePlayer.photo && photoMap[basePlayer.name]) ? {photo:photoMap[basePlayer.name]} : {})}) : null;
  const hasBorder=extraStyle.includes('border');
  const bdr=hasBorder?'':'border:1.5px solid var(--border);';
  const sz = 'calc('+size+' * var(--su_profile_scale,1))';
  const base='display:inline-block;width:'+sz+';height:'+sz+';border-radius:var(--su_profile_radius,50%);clip-path:var(--su_profile_clip,none);box-shadow:var(--su_profile_fx, none);flex-shrink:0;vertical-align:middle;'+extraStyle;
  const safeName=(playerName||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  const clickStyle='cursor:pointer;';
  const clickAttr='onclick="event.stopPropagation();openPlayerModal(\''+safeName+'\')" title="스트리머 상세"';
  if(!p||!p.photo){
    const RMAP={T:{bg:'#dbeafe',col:'#1e40af'},Z:{bg:'#ede9fe',col:'#5b21b6'},P:{bg:'#fef3c7',col:'#92400e'}};
    const rm=RMAP[p?.race]||{bg:'#e2e8f0',col:'#64748b'};
    const txt=p?.race||'?';
    return '<span '+clickAttr+' style="'+base+';'+bdr+'background:'+rm.bg+';color:'+rm.col+';display:inline-flex;align-items:center;justify-content:center;font-weight:900;font-size:calc('+size+' * var(--su_profile_scale,1) * 0.42);'+clickStyle+'">'+txt+'</span>';
  }
  const origSrc = toHttpsUrl(p.photo);
  let _sizeNum = 64;
  try{ const m = String(size).match(/(\d+(?:\.\d+)?)/); if(m) _sizeNum = parseFloat(m[1]); }catch(e){}
  // var(--su_profile_scale) 런타임 배율 대응 여유값 포함
  const src = (typeof toThumbUrl==='function') ? toThumbUrl(p.photo, Math.round(_sizeNum*1.4)) : origSrc;
  let fit = 'contain';
  let pos = null;
  try{
    const hasFit = /object-fit\s*:\s*/.test(extraStyle);
    if(!hasFit){
      const ctx = String(window.__detailCtx||'');
      if(ctx==='compModal' || ctx==='histModal'){
        fit = getMatchDetailAvatarSetting('fit');
      } else if(ctx==='recCard'){
        fit = _pph.recFit;
      } else {
        fit = _pph.fit;
      }
      if(!['contain','cover'].includes(fit)) fit='contain';
    } else {
      fit = null;
    }
  }catch(e){ fit='contain'; }
  try{
    const hasPos = /object-position\s*:\s*/.test(extraStyle);
    const use = (p && p.photoPosUse !== false); // 기본: 사용(하위호환)
    if(!hasPos && p && use){
      const x = Number(p.photoPosX);
      const y = Number(p.photoPosY);
      if(Number.isFinite(x) && Number.isFinite(y)){
        const xx = Math.max(0, Math.min(100, x));
        const yy = Math.max(0, Math.min(100, y));
        pos = `${xx}% ${yy}%`;
      }
    }
  }catch(e){}
  const _lazyAttr = opts.lazy ? ' loading="lazy"' : '';
  // lazy 컨텍스트는 priority를 'auto'로 강제 → high-priority 폭주 방지
  const _prio = opts.lazy ? 'auto' : (opts.priority || 'high');
  const _prioAttr = ' fetchpriority="' + _prio + '"';
  const _origAttr = ' data-orig="'+String(origSrc).replace(/"/g,'&quot;')+'"';
  return '<img '+clickAttr+_lazyAttr+_prioAttr+_origAttr+' src="'+src+'" decoding="async" style="'+base+';'+(fit?('object-fit:'+fit+';'):'')+(pos?('object-position:'+pos+';'):'')+bdr+clickStyle+'" onerror="if(this.dataset.orig&&this.src!==this.dataset.orig){this.src=this.dataset.orig;}else{this.style.opacity=\'.35\';this.style.filter=\'grayscale(1)\';this.removeAttribute(\'onerror\');}">';
}

const _prewarmedImageUrls = new Set();
function prewarmImageUrls(urls, limit, px, mode){
  try{
    const useScaled = mode === 'scaled';
    const arr = (Array.isArray(urls) ? urls : [urls])
      .map(v=>{
        if(useScaled && typeof toScaledUrl==='function') return toScaledUrl(v||'', px||480);
        if(typeof toThumbUrl==='function') return toThumbUrl(v||'', px||96);
        return toHttpsUrl(v||'');
      })
      .filter(Boolean);
    const max = Math.max(1, parseInt(limit, 10) || 12);
    arr.slice(0, max).forEach(src=>{
      if(_prewarmedImageUrls.has(src)) return;
      _prewarmedImageUrls.add(src);
      const img = new Image();
      try{ img.decoding = 'async'; }catch(e){}
      img.src = src;
    });
  }catch(e){}
}

function getStatusIconHTML(name){
  const ic=getStatusIcon(name);
  if(!ic) return '';
  const def=Object.values(STATUS_ICON_DEFS).find(d=>d.emoji===ic);
  const lbl=def?def.label:ic;
  if(_siIsImg(ic)) return `<span style="margin-left:3px;flex-shrink:0;display:inline-flex;align-items:center" title="${lbl}">${_siRender(ic,'18px')}</span>`;
  return `<span style="font-size:var(--fs-base);margin-left:3px;flex-shrink:0" title="${lbl}">${ic}</span>`;
}

function genderIcon(gender){
  // 남자 이모지(♂) 표시 제거 - 요청에 따라 항상 빈 문자열 반환
  return '';
}

try{
  window.getPlayerPhotoHTML = getPlayerPhotoHTML;
  window.prewarmImageUrls = prewarmImageUrls;
  window.getStatusIconHTML = getStatusIconHTML;
  window.genderIcon = genderIcon;
}catch(e){}
