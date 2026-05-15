/* ══════════════════════════════════════
   Common Player HTML Utilities
══════════════════════════════════════ */
function getPlayerPhotoHTML(playerName, size, extraStyle){
  size=size||'32px'; extraStyle=extraStyle||'';
  let _scale=1;
  try{
    const v=parseFloat(localStorage.getItem('su_avatar_scale')||'1');
    if(!isNaN(v)) _scale=Math.max(0.7, Math.min(1.6, v));
  }catch(e){}
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
  const basePlayer = arr.find(x=>String(x&&x.name||'').trim()===String(playerName||'').trim()) || null;
  const photoMap = (window.playerPhotos && typeof window.playerPhotos==='object') ? window.playerPhotos : {};
  const p = basePlayer ? ({...basePlayer, ...((!basePlayer.photo && photoMap[basePlayer.name]) ? {photo:photoMap[basePlayer.name]} : {})}) : null;
  const hasBorder=extraStyle.includes('border');
  const bdr=hasBorder?'':'border:1.5px solid var(--border);';
  const sz = 'calc('+size+' * var(--su_profile_scale,1))';
  const base='display:inline-block;width:'+sz+';height:'+sz+';border-radius:var(--su_profile_radius,50%);box-shadow:var(--su_profile_fx, none);flex-shrink:0;vertical-align:middle;'+extraStyle;
  const safeName=(playerName||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  const clickStyle='cursor:pointer;';
  const clickAttr='onclick="event.stopPropagation();openPlayerModal(\''+safeName+'\')" title="스트리머 상세"';
  if(!p||!p.photo){
    const RMAP={T:{bg:'#dbeafe',col:'#1e40af'},Z:{bg:'#ede9fe',col:'#5b21b6'},P:{bg:'#fef3c7',col:'#92400e'}};
    const rm=RMAP[p?.race]||{bg:'#e2e8f0',col:'#64748b'};
    const txt=p?.race||'?';
    return '<span '+clickAttr+' style="'+base+';'+bdr+'background:'+rm.bg+';color:'+rm.col+';display:inline-flex;align-items:center;justify-content:center;font-weight:900;font-size:calc('+size+' * var(--su_profile_scale,1) * 0.42);'+clickStyle+'">'+txt+'</span>';
  }
  const src = toHttpsUrl(p.photo);
  let fit = 'contain';
  let pos = null;
  try{
    const hasFit = /object-fit\s*:\s*/.test(extraStyle);
    if(!hasFit){
      const ctx = String(window.__detailCtx||'');
      if(ctx==='compModal' || ctx==='histModal'){
        fit = getMatchDetailAvatarSetting('fit');
      } else if(ctx==='recCard'){
        fit = (localStorage.getItem('su_rec_avatar_fit') || localStorage.getItem('su_avatar_fit') || 'contain').trim();
        if(!['contain','cover'].includes(fit)) fit='contain';
      } else {
        fit = (localStorage.getItem('su_avatar_fit') || 'contain').trim();
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
  return '<img '+clickAttr+' src="'+src+'" decoding="async" fetchpriority="high" style="'+base+';'+(fit?('object-fit:'+fit+';'):'')+(pos?('object-position:'+pos+';'):'')+bdr+clickStyle+'" onerror="this.style.opacity=\'.35\';this.style.filter=\'grayscale(1)\';this.removeAttribute(\'onerror\');">';
}

const _prewarmedImageUrls = new Set();
function prewarmImageUrls(urls, limit){
  try{
    const arr = (Array.isArray(urls) ? urls : [urls])
      .map(v=>toHttpsUrl(v||''))
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
  return `<span style="font-size:13px;margin-left:3px;flex-shrink:0" title="${lbl}">${ic}</span>`;
}

function genderIcon(gender){
  if(gender==='M')return `<span class="male-icon">♂</span>`;
  return '';
}

try{
  window.getPlayerPhotoHTML = getPlayerPhotoHTML;
  window.prewarmImageUrls = prewarmImageUrls;
  window.getStatusIconHTML = getStatusIconHTML;
  window.genderIcon = genderIcon;
}catch(e){}
