// Global player card building functions for reuse across tabs
function buildGlobalPlayerChip(p, col, forExport=false, chipIdx=0, playerList=[]) {
  // Define fallback constants if not available
  const RACE_CFG = window.RACE_CFG || {T:{bg:'#dbeafe',col:'#1e40af',txt:'T'},Z:{bg:'#ede9fe',col:'#5b21b6',txt:'Z'},P:{bg:'#fef3c7',col:'#92400e',txt:'P'},N:{bg:'#f1f5f9',col:'#475569',txt:'?'}};
  const MAIN_ROLES = window.MAIN_ROLES || [''];
  const ROLE_COLORS = window.ROLE_COLORS || {};
  const ROLE_ICONS = window.ROLE_ICONS || {};
  const _TIER_BG = window._TIER_BG || {};
  const _TIER_TEXT = window._TIER_TEXT || {};
  const hexToRgba = window.hexToRgba || ((h,a)=>{const r=parseInt(h.slice(1,3),16),g=parseInt(h.slice(3,5),16),b=parseInt(h.slice(5,7),16);return`rgba(${r},${g},${b},${a})`;});
  const getStatusIconHTML = window.getStatusIconHTML || (()=>'');
  const isLoggedIn = window.isLoggedIn || false;
  const boardCompactMode = window.boardCompactMode || false;
  
  const rc=RACE_CFG[p.race]||{bg:'#f1f5f9',col:'#475569',txt:p.race||'?'};
  const isMain=p.role&&MAIN_ROLES.includes(p.role);
  const rCol=ROLE_COLORS[p.role]||'';
  const rIcon=ROLE_ICONS[p.role]||'';
  const photoSrcChip = p.photo||'';
  
  // Card view style
  if (window.boardCardView) {
    const rcBg = rc.col || col;
    const cardTierCol = p.tier ? (_TIER_BG[p.tier] || '#64748b') : null;
    const cardTierText = p.tier ? (_TIER_TEXT[p.tier] || '#fff') : '#fff';
    const rTxtCard = rc.txt||p.race||'?';
    const imgInner = photoSrcChip
      ? `<img src="${photoSrcChip}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;border-radius:10px 10px 0 0"${forExport?'':' onerror="this.style.display=\'none\'"'}>`
      + (forExport?'':`<div style="position:absolute;inset:0;background:${rcBg};display:none;align-items:center;justify-content:center;font-size:30px;font-weight:900;color:#fff;border-radius:10px 10px 0 0">${rTxtCard}</div>`)
      : `<div style="position:absolute;inset:0;background:linear-gradient(135deg,${col},${col}aa);display:flex;align-items:center;justify-content:center;font-size:30px;font-weight:900;color:#fff;border-radius:10px 10px 0 0">${rTxtCard}</div>`;
    
    // Top badges (race/tier)
    const topBadges = `<div style="position:absolute;top:5px;left:5px;display:flex;gap:3px;flex-wrap:wrap;z-index:10">`
      + `<span style="font-size:9px;font-weight:900;background:${rc.col||'#64748b'};color:#fff;border-radius:4px;padding:1px 5px;line-height:1.5;text-shadow:0 1px 2px rgba(0,0,0,.4);border:1px solid rgba(255,255,255,0.3)">${rTxtCard}</span>`
      + (p.tier?`<span style="font-size:9px;font-weight:800;background:${cardTierCol||'#64748b'};color:${cardTierText||'#fff'};border-radius:4px;padding:1px 5px;line-height:1.5;text-shadow:0 1px 2px rgba(0,0,0,.3);border:1px solid rgba(255,255,255,0.3)">${p.tier}</span>`:'')
      + `</div>`;
    
    // Overlay with player info
    const overlay = `<div style="position:absolute;bottom:0;left:0;right:0;background:linear-gradient(transparent,rgba(0,0,0,.85));border-radius:0 0 10px 10px;padding:16px 8px 6px;text-align:center">
      ${p.role?`<div style="font-size:8px;font-weight:700;color:#ffffffbb;margin-bottom:2px;letter-spacing:0.5px">${p.role}</div>`:''}
      <div style="font-weight:900;font-size:12px;color:#fff;word-break:break-all;text-shadow:0 1px 3px #000a;line-height:1.2">${p.name}</div>
    </div>`;
    
    const cardInner = `<div style="position:relative;width:100%;aspect-ratio:1/1;overflow:hidden;border-radius:10px 10px 0 0">${imgInner}${topBadges}${overlay}</div>`
      + (p.channelUrl
        ? (forExport
            ? `<div style="display:block;text-align:center;padding:3px;background:${col};color:#fff;font-size:10px;font-weight:700;border-radius:0 0 8px 8px">\'</div>`
            : `<a href="${p.channelUrl}" target="_blank" onclick="event.stopPropagation()" style="display:block;text-align:center;padding:3px;background:${col};color:#fff;font-size:10px;font-weight:700;text-decoration:none;border-radius:0 0 8px 8px">\'</a>`)
        : `<div style="height:4px;background:${col};border-radius:0 0 8px 8px"></div>`);
    
    const pNameSafeCard=p.name.replace(/'/g,"\\'").replace(/"/g,'&quot;');
    const totalInUnivCard=playerList.length;
    const clickFn=isLoggedIn
      ? `openBrdPlayerPopupFromChip(event,'${pNameSafeCard}','${p.univ||''}',${chipIdx},${totalInUnivCard})`
      : `openPlayerModal('${pNameSafeCard}')`;
    
    return `<div style="border-radius:10px;overflow:hidden;border:2px solid ${hexToRgba(col,.5)};cursor:pointer;transition:transform .18s,box-shadow .18s" onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 10px 32px rgba(0,0,0,.22),0 3px 10px rgba(0,0,0,.1)'" onmouseout="this.style.transform='';this.style.boxShadow=''" onclick="event.stopPropagation();${clickFn}">${cardInner}</div>`;
  }
  
  // List view style (fallback)
  const compact=boardCompactMode;
  const pNameSafe=p.name.replace(/'/g,"\\'").replace(/"/g,'&quot;');
  const totalInUniv=playerList.length;
  const clickFn=isLoggedIn
    ? `openBrdPlayerPopupFromChip(event,'${pNameSafe}','${p.univ||''}',${chipIdx},${totalInUniv})`
    : `openPlayerModal('${pNameSafe}')`;

  const chipTierCol = p.tier ? (_TIER_BG[p.tier] || col) : '#9ca3af';
  const chipTierText = p.tier ? (_TIER_TEXT[p.tier] || '#fff') : '#fff';
  const cBgL=hexToRgba(col,.16);
  const cBgH=hexToRgba(col,.28);
  const cBd=hexToRgba(col,.45);
  const rTxt=rc.txt||p.race||'?';
  const photoSz=compact?'36px':'64px';
  const photoFs=compact?'14px':'26px';
  const chipPad=compact?'5px 10px 5px 6px':'10px 18px 10px 10px';
  const chipGap=compact?'7px':'12px';
  const nameFs=compact?'13px':'16px';
  const badgeFs=compact?'10px':'12px';
  const tierBadgeFs=compact?'9px':'11px';
  
  const _photoEl = photoSrcChip
    ? `<span style="width:${photoSz};height:${photoSz};border-radius:50%;flex-shrink:0;position:relative;display:inline-flex;align-items:center;justify-content:center;overflow:hidden;border:${compact?'2':'3'}px solid ${col};box-shadow:0 2px 10px ${hexToRgba(col,.4)};background:${col};color:#fff;font-size:${photoFs};font-weight:900">${rTxt}<img src="${photoSrcChip}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;border-radius:50%" onerror="this.style.display='none'"></span>`
    : `<span style="width:${photoSz};height:${photoSz};border-radius:50%;background:${col};color:#fff;display:inline-flex;align-items:center;justify-content:center;font-size:${photoFs};font-weight:900;flex-shrink:0;border:${compact?'2':'3'}px solid ${hexToRgba(col,.7)}">${rTxt}</span>`;
  
  return `<span class="brd-chip" data-player="${p.name}" data-univ="${p.univ||''}" data-idx="${chipIdx}"${isLoggedIn?' draggable="true"':''} style="display:inline-flex;align-items:center;gap:${chipGap};background:${cBgL};border-radius:16px;padding:${chipPad};margin:${compact?'3px':'5px'};cursor:${isLoggedIn?'grab':'pointer'};transition:all .15s;box-shadow:0 2px 10px rgba(0,0,0,.13);border:2px solid ${cBd}" onmouseover="this.style.background='${cBgH}';this.style.boxShadow='0 5px 18px rgba(0,0,0,.2)';this.style.borderColor='${hexToRgba(col,.65)}'" onmouseout="this.style.background='${cBgL}';this.style.boxShadow='0 2px 10px rgba(0,0,0,.13)';this.style.borderColor='${cBd}'" onclick="event.stopPropagation();${clickFn}" ondragstart="if(isLoggedIn){event.stopPropagation();event.dataTransfer.setData('text/chip',this.dataset.player);}">
    ${_photoEl}
    <span style="display:inline-flex;flex-direction:column;gap:${compact?'2px':'3px'};min-width:0">
      ${isMain&&!compact?`<span style="font-size:11px;font-weight:900;color:#fff;background:${col};border-radius:5px;padding:2px 8px;display:inline-block">${rIcon}${p.role}</span>`:''}
      <span style="font-weight:900;color:#111;font-size:${nameFs};line-height:1.3;white-space:nowrap;${p.inactive?'opacity:.6':''}">${compact&&isMain?`${rIcon}`:''}${p.name}${getStatusIconHTML(p.name)}${p.inactive?'<span style="font-size:9px;background:#fff7ed;color:#9a3412;border-radius:4px;padding:1px 4px;font-weight:700;margin-left:3px">\'</span>':''}${(()=>{if(!p.transferDate||!p.prevUniv)return'';const diff=(new Date()-new Date(p.transferDate))/(864e5);return diff<=30?`<span style="font-size:9px;background:#fef3c7;color:#92400e;border-radius:4px;padding:1px 5px;font-weight:800;margin-left:3px;border:1px solid #fcd34d" title="${p.prevUniv}">\'</span>`:'';})()}</span>
      <span style="display:inline-flex;align-items:center;gap:${compact?'3px':'5px'};line-height:1.2">
        <span style="font-size:${badgeFs};font-weight:900;background:${rc.col};color:#fff;border-radius:6px;padding:${compact?'1px 5px':'2px 8px'}">${rTxt}</span>
        ${p.tier?`<span style="font-size:${tierBadgeFs};font-weight:800;background:${chipTierCol};color:${chipTierText};border-radius:6px;padding:${compact?'1px 5px':'2px 8px'}">${p.tier}</span>`:''}
      </span>
    </span>
  </span>`;
}

function buildGlobalCardLayout(players, col, forExport=false) {
  if (!players || !players.length) return '';
  
  return `<div style="padding:20px">
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:12px">
      ${players.map((p, idx) => buildGlobalPlayerChip(p, col, forExport, idx, players)).join('')}
    </div>
  </div>`;
}
