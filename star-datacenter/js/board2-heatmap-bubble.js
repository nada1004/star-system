function _b2HeatmapCloseAll(){
  try{ document.querySelectorAll('.b2hm2-popup').forEach(p=>p.classList.remove('show')); }catch(e){}
}
function _b2HeatmapCellClick(el){
  try{
    if(!el || !el.dataset) return;
    const uid = el.dataset.hmUid || '';
    const univName = el.dataset.hmUniv || '';
    const tier = el.dataset.hmTier || '';
    const color = el.dataset.hmColor || '#64748b';
    if(!uid || !univName || !tier) return;
    _b2HeatmapCloseAll();
    if(typeof _b2HeatmapShowPopup === 'function') _b2HeatmapShowPopup(uid, univName, tier, color);
  }catch(e){}
}
function _b2HeatmapTotalClick(el){
  try{
    if(!el || !el.dataset) return;
    const uid = el.dataset.hmUid || '';
    const univName = el.dataset.hmUniv || '';
    const color = el.dataset.hmColor || '#64748b';
    if(!uid || !univName) return;
    _b2HeatmapCloseAll();
    if(typeof _b2HeatmapShowAllPopup === 'function') _b2HeatmapShowAllPopup(uid, univName, color);
  }catch(e){}
}
function _b2HeatmapTierClick(el){
  try{
    if(!el || !el.dataset) return;
    const uid = el.dataset.hmUid || '';
    const tier = el.dataset.hmTier || '';
    const color = el.dataset.hmColor || '#64748b';
    if(!uid || !tier) return;
    _b2HeatmapCloseAll();
    if(typeof _b2HeatmapShowTierPopup === 'function') _b2HeatmapShowTierPopup(uid, tier, color);
  }catch(e){}
}
function _b2HeatmapGrandClick(el){
  try{
    if(!el || !el.dataset) return;
    const uid = el.dataset.hmUid || '';
    if(!uid) return;
    _b2HeatmapCloseAll();
    if(typeof _b2HeatmapShowGrandPopup === 'function') _b2HeatmapShowGrandPopup(uid);
  }catch(e){}
}
// 팝업 상단(헤더) 공통 빌더 — 아바타 + 이름/티어 + 승률을 세로로 쌓아
// 우상단 닫기(X) 버튼과 절대 겹치지 않도록 설계
function _b2HmAvatarHTML(univName, avatarColor, avatarLabel){
  const escH = (typeof escHTML === 'function') ? escHTML : (s)=>String(s||'');
  const cfg = univName ? (Array.isArray(window.univCfg) ? window.univCfg : (typeof univCfg!=='undefined'?univCfg:[])).find(x=>x && x.name===univName) : null;
  const logoUrl = cfg ? (cfg.icon || cfg.img || '') : '';
  if (logoUrl) {
    const safeUrl = (typeof toHttpsUrl==='function') ? toHttpsUrl(logoUrl) : logoUrl;
    const safeUrlA = (typeof escAttr==='function') ? escAttr(safeUrl) : String(safeUrl||'');
    return '<div class="b2hm2-header-avatar b2hm2-header-avatar--logo">'
      + '<img src="'+safeUrlA+'" alt="" style="width:96%;height:96%;object-fit:contain" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'flex\'">'
      + '<span style="display:none;width:100%;height:100%;align-items:center;justify-content:center;font-weight:900;color:'+avatarColor+';background:linear-gradient(145deg,'+avatarColor+'22,'+avatarColor+'11)">'+escH(avatarLabel||'')+'</span>'
      + '</div>';
  }
  return '<div class="b2hm2-header-avatar" style="background:linear-gradient(145deg,'+avatarColor+','+avatarColor+'99)">'+escH(avatarLabel||'')+'</div>';
}
function _b2HmHeaderHTML(opts){
  const escH = (typeof escHTML === 'function') ? escHTML : (s)=>String(s||'');
  const { avatarColor, avatarLabel, univName, title, tierText, tierBg, tierFg, wr, tw, tl, wrc } = opts || {};
  let html = '<div class="b2hm2-header-row">';
  html += _b2HmAvatarHTML(univName, avatarColor, avatarLabel);
  html += '<div class="b2hm2-header-info">';
  html += '<div class="b2hm2-header-title">';
  if (title) html += '<span class="b2hm2-header-name">'+escH(title)+'</span>';
  if (tierText) html += '<span class="b2hm2-header-tierbadge" style="background:'+(tierBg||avatarColor)+';color:'+(tierFg||'#fff')+'">'+escH(tierText)+'</span>';
  html += '</div>';
  html += '<div class="b2hm2-header-wr">';
  if (wr!==null && wr!==undefined) {
    html += '<span class="b2hm2-header-wr-pct" style="color:'+wrc+'">'+wr+'%</span>';
    html += '<span class="b2hm2-header-wr-rec">'+tw+'승 '+tl+'패</span>';
  } else {
    html += '<span class="b2hm2-header-wr-rec">기록 없음</span>';
  }
  html += '</div></div></div>';
  return html;
}
function _b2HeatmapShowPopup(uid, univName, tier, color){
  try{
    const popup  = document.getElementById(uid + '-popup');
    const header = document.getElementById(uid + '-popup-header');
    const body   = document.getElementById(uid + '-popup-body');
    if(!popup || !body) return;
    const escH = (typeof escHTML === 'function') ? escHTML : (s)=>String(s||'');
    const escA = (typeof escAttr === 'function') ? escAttr : (s)=>String(s||'');
    const members = (Array.isArray(window.players) ? window.players : []).filter(p=>{
      const pu = String((p && p.univ) || '').trim();
      const pt = String((p && p.tier) || '미정');
      return pu === univName && pt === tier && !(p && (p.hidden || p.retired || p.hideFromBoard));
    });
    if(!members.length) return;
    let tw=0,tl=0;
    members.forEach(p=>(Array.isArray(p && p.history)?p.history:[]).forEach(h=>{ if(h && h.result==='승') tw++; else if(h && h.result==='패') tl++; }));
    const tg=tw+tl, wr=tg>0?Math.round(tw/tg*100):null;
    const wrc=wr===null?'#94a3b8':wr>=60?'#10b981':wr>=40?'#f59e0b':'#ef4444';
    const { fromN, toN } = _b2ThisWeekRange();
    const dNum = _b2DateNum;
    let ww=0,wl=0;
    members.forEach(p=>(Array.isArray(p && p.history)?p.history:[]).forEach(h=>{
      const d=dNum(h && (h.date||h.d||''));
      if(d>=fromN && d<=toN){
        if(h && h.result==='승') ww++;
        else if(h && h.result==='패') wl++;
      }
    }));
    const tierCol = (typeof getTierBtnColor==='function'&&tier)?getTierBtnColor(tier):'#64748b';
    const tierTc  = (typeof getTierBtnTextColor==='function'&&tier)?(getTierBtnTextColor(tier)||'#fff'):'#fff';
    if(header) header.innerHTML = _b2HmHeaderHTML({
      avatarColor: color, avatarLabel: (univName||'?').slice(0,1), univName,
      title: univName, tierText: tier, tierBg: tierCol, tierFg: tierTc,
      wr, tw, tl, wrc
    });
    let bodyHtml = '';
    bodyHtml += '<div class="b2hm2-stat-row">' +
      '<div class="b2hm2-stat-box" style="background:'+color+'0d;border-color:'+color+'22">' +
        '<div class="b2hm2-stat-val" style="color:'+color+'">'+members.length+'</div>' +
        '<div class="b2hm2-stat-lbl">총 인원</div>' +
      '</div>';
    if (tg>0) bodyHtml +=
      '<div class="b2hm2-stat-box" style="background:'+wrc+'12;border-color:'+wrc+'30">' +
        '<div class="b2hm2-stat-val" style="color:'+wrc+'">'+wr+'%</div>' +
        '<div class="b2hm2-stat-lbl">'+tw+'승 '+tl+'패</div>' +
      '</div>';
    if (ww+wl>0) bodyHtml +=
      '<div class="b2hm2-stat-box" style="background:#fff7ed;border-color:#fed7aa">' +
        '<div class="b2hm2-stat-val" style="color:#c2410c">🔥 '+ww+'승</div>' +
        '<div class="b2hm2-stat-lbl" style="color:#c2410c">이번주 '+wl+'패</div>' +
      '</div>';
    bodyHtml += '</div>';
    bodyHtml += '<div style="font-size:var(--fs-caption);font-weight:800;color:var(--text3);margin-bottom:10px;display:flex;align-items:center;gap:6px">' +
      '<span style="width:20px;height:2px;background:var(--border2);display:inline-block;border-radius:1px"></span>' +
      members.length+'명' +
      '<span style="flex:1;height:1px;background:var(--border2);display:inline-block;border-radius:1px"></span></div>';
    bodyHtml += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(84px,1fr));gap:8px">';
    members.sort((a,b)=>(String(a && a.name || '')).localeCompare(String(b && b.name || ''),'ko',{sensitivity:'base'})).forEach(p=>{
      const rTxt=p && p.race==='P'?'P':p && p.race==='T'?'T':p && p.race==='Z'?'Z':'';
      const rClr={T:'#60a5fa',Z:'#c084fc',P:'#fbbf24'}[rTxt]||'#fff';
      const _isGif = p && p.photo ? /\.gif(\?|$)/i.test(String(p.photo)) : false;
      const rawPhoto = p && p.photo ? (_isGif ? (typeof toHttpsUrl==='function'?toHttpsUrl(p.photo):p.photo) : (typeof toThumbUrl==='function'?toThumbUrl(p.photo,84):p.photo)) : '';
      const rawPhotoOrig = p && p.photo ? (typeof toHttpsUrl==='function'?toHttpsUrl(p.photo):p.photo) : '';
      const safePhoto = rawPhoto ? escA(rawPhoto) : '';
      const safePhotoOrig = rawPhotoOrig ? escA(rawPhotoOrig) : '';
      const _2ndHm1 = (typeof _phSwap2ndHTML==='function') ? _phSwap2ndHTML(p && p.secondProfileFile, {style:'border-radius:inherit'}) : '';
      const initials = String(p && p.name || '?').slice(0,1);
      const safeNameAttr = escA(p && p.name || '');
      bodyHtml += '<div class="b2hm2-pcard" style="border-color:'+color+'55" onclick="_b2LineupCardHoverLeave();openPlayerModal(\''+safeNameAttr.replace(/'/g,"\\'")+'\')" onmouseenter="_b2LineupCardHoverEnter(event,this,\''+safeNameAttr.replace(/'/g,"\\'")+'\',\''+color+'\')" onmouseleave="_b2LineupCardHoverLeave()">';
      if (safePhoto) {
        bodyHtml += '<span class="'+(_2ndHm1?'ph-swap':'')+'" style="position:relative;display:block">'
          + '<img class="b2hm2-pcard-photo" src="'+safePhoto+'" data-orig="'+safePhotoOrig+'" onerror="if(this.dataset.orig&&this.src!==this.dataset.orig){this.src=this.dataset.orig;}else{this.style.display=\'none\';this.nextSibling.style.display=\'flex\'}">'+ 
          '<div class="b2hm2-pcard-avatar" style="display:none;background:linear-gradient(160deg,'+color+'44,'+color+'22);color:'+color+'">'+ escH(initials)+'</div>'
          + _2ndHm1 + '</span>';
      } else {
        bodyHtml += '<div class="b2hm2-pcard-avatar" style="background:linear-gradient(160deg,'+color+'44,'+color+'22);color:'+color+'">'+ escH(initials)+'</div>';
      }
      bodyHtml += '<div class="b2hm2-pcard-info">';
      bodyHtml += '<div class="b2hm2-pcard-name">'+(rTxt?'<span style="color:'+rClr+';font-weight:900;margin-right:3px;text-shadow:0 1px 3px rgba(0,0,0,.6)">'+rTxt+'</span>':'')+escH(p && p.name || '')+'</div>';
      bodyHtml += '</div>';
      bodyHtml += '</div>';
    });
    bodyHtml += '</div>';
    body.innerHTML = bodyHtml;
    popup.classList.add('show');
  }catch(e){}
}
function _b2HeatmapShowAllPopup(uid, univName, color){
  try{
    const popup  = document.getElementById(uid + '-popup');
    const header = document.getElementById(uid + '-popup-header');
    const body   = document.getElementById(uid + '-popup-body');
    if(!popup || !body) return;
    const escH = (typeof escHTML === 'function') ? escHTML : (s)=>String(s||'');
    const escA = (typeof escAttr === 'function') ? escAttr : (s)=>String(s||'');
    const members = (Array.isArray(window.players) ? window.players : []).filter(p=>{
      const pu = String((p && p.univ) || '').trim();
      return pu === univName && !(p && (p.hidden || p.retired || p.hideFromBoard));
    });
    if(!members.length) return;
    let tw=0,tl=0;
    members.forEach(p=>(Array.isArray(p && p.history)?p.history:[]).forEach(h=>{ if(h && h.result==='승') tw++; else if(h && h.result==='패') tl++; }));
    const tg=tw+tl, wr=tg>0?Math.round(tw/tg*100):null;
    const wrc=wr===null?'#94a3b8':wr>=60?'#10b981':wr>=40?'#f59e0b':'#ef4444';
    const { fromN, toN } = _b2ThisWeekRange();
    const dNum = _b2DateNum;
    let ww=0,wl=0;
    members.forEach(p=>(Array.isArray(p && p.history)?p.history:[]).forEach(h=>{
      const d=dNum(h && (h.date||h.d||''));
      if(d>=fromN && d<=toN){
        if(h && h.result==='승') ww++;
        else if(h && h.result==='패') wl++;
      }
    }));
    if(header) header.innerHTML = _b2HmHeaderHTML({
      avatarColor: color, avatarLabel: (univName||'?').slice(0,1), univName,
      title: univName, wr, tw, tl, wrc
    });
    let bodyHtml = '';
    bodyHtml += '<div class="b2hm2-stat-row">' +
      '<div class="b2hm2-stat-box" style="background:'+color+'0d;border-color:'+color+'22">' +
        '<div class="b2hm2-stat-val" style="color:'+color+'">'+members.length+'</div>' +
        '<div class="b2hm2-stat-lbl">총 인원</div>' +
      '</div>';
    if (tg>0) bodyHtml +=
      '<div class="b2hm2-stat-box" style="background:'+wrc+'12;border-color:'+wrc+'30">' +
        '<div class="b2hm2-stat-val" style="color:'+wrc+'">'+wr+'%</div>' +
        '<div class="b2hm2-stat-lbl">'+tw+'승 '+tl+'패</div>' +
      '</div>';
    if (ww+wl>0) bodyHtml +=
      '<div class="b2hm2-stat-box" style="background:#fff7ed;border-color:#fed7aa">' +
        '<div class="b2hm2-stat-val" style="color:#c2410c">🔥 '+ww+'승</div>' +
        '<div class="b2hm2-stat-lbl" style="color:#c2410c">이번주 '+wl+'패</div>' +
      '</div>';
    bodyHtml += '</div>';
    bodyHtml += '<div style="font-size:var(--fs-caption);font-weight:800;color:var(--text3);margin-bottom:10px;display:flex;align-items:center;gap:6px">' +
      '<span style="width:20px;height:2px;background:var(--border2);display:inline-block;border-radius:1px"></span>' +
      members.length+'명' +
      '<span style="flex:1;height:1px;background:var(--border2);display:inline-block;border-radius:1px"></span></div>';
    bodyHtml += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(84px,1fr));gap:8px">';
    members.sort((a,b)=>(String(a && a.name || '')).localeCompare(String(b && b.name || ''),'ko',{sensitivity:'base'})).forEach(p=>{
      const rIco=p && p.race==='P'?'🔮':p && p.race==='T'?'⚔️':p && p.race==='Z'?'🦎':'';
      const _isGif2 = p && p.photo ? /\.gif(\?|$)/i.test(String(p.photo)) : false;
      const rawPhoto = p && p.photo ? (_isGif2 ? (typeof toHttpsUrl==='function'?toHttpsUrl(p.photo):p.photo) : (typeof toThumbUrl==='function'?toThumbUrl(p.photo,84):p.photo)) : '';
      const rawPhotoOrig = p && p.photo ? (typeof toHttpsUrl==='function'?toHttpsUrl(p.photo):p.photo) : '';
      const safePhoto = rawPhoto ? escA(rawPhoto) : '';
      const safePhotoOrig = rawPhotoOrig ? escA(rawPhotoOrig) : '';
      const _2ndHm2 = (typeof _phSwap2ndHTML==='function') ? _phSwap2ndHTML(p && p.secondProfileFile, {style:'border-radius:inherit'}) : '';
      const initials = String(p && p.name || '?').slice(0,1);
      const pColor = (typeof gc === 'function' ? gc(p && p.univ) : null) || color;
      let pw=0,pl=0;
      (Array.isArray(p && p.history)?p.history:[]).forEach(h=>{ if(h && h.result==='승') pw++; else if(h && h.result==='패') pl++; });
      const pg=pw+pl,pwr=pg>0?Math.round(pw/pg*100):null;
      const pc=pwr===null?'#94a3b8':pwr>=60?'#10b981':pwr>=40?'#f59e0b':'#ef4444';
      const safeNameAttr2 = escA(p && p.name || '');
      const tierCol2 = (typeof getTierBtnColor==='function'&&p&&p.tier)?getTierBtnColor(p.tier):'#64748b';
      const tierTxt2 = (typeof getTierBtnTextColor==='function'&&p&&p.tier)?(getTierBtnTextColor(p.tier)||'#fff'):'#fff';
      bodyHtml += '<div class="b2hm2-pcard" style="border-color:'+pColor+'55" onclick="_b2LineupCardHoverLeave();openPlayerModal(\''+safeNameAttr2.replace(/'/g,"\\'")+'\')" onmouseenter="_b2LineupCardHoverEnter(event,this,\''+safeNameAttr2.replace(/'/g,"\\'")+'\',\''+pColor+'\')" onmouseleave="_b2LineupCardHoverLeave()">';
      if (safePhoto) {
        bodyHtml += '<span class="'+(_2ndHm2?'ph-swap':'')+'" style="position:relative;display:block">'
          + '<img class="b2hm2-pcard-photo" src="'+safePhoto+'" data-orig="'+safePhotoOrig+'" onerror="if(this.dataset.orig&&this.src!==this.dataset.orig){this.src=this.dataset.orig;}else{this.style.display=\'none\';this.nextSibling.style.display=\'flex\'}">'+ 
          '<div class="b2hm2-pcard-avatar" style="display:none;background:linear-gradient(160deg,'+pColor+'44,'+pColor+'22);color:'+pColor+'">'+ escH(initials)+'</div>'
          + _2ndHm2 + '</span>';
      } else {
        bodyHtml += '<div class="b2hm2-pcard-avatar" style="background:linear-gradient(160deg,'+pColor+'44,'+pColor+'22);color:'+pColor+'">'+ escH(initials)+'</div>';
      }
      bodyHtml += '<div class="b2hm2-pcard-info">';
      if (p&&p.tier) bodyHtml += '<span style="font-size:9px;font-weight:900;background:'+tierCol2+';color:'+tierTxt2+';border-radius:4px;padding:1px 5px;margin-bottom:2px;line-height:1.6">'+escH(p.tier)+'</span>';
      bodyHtml += '<div class="b2hm2-pcard-name">'+escH(p && p.name || '')+'</div>';
      bodyHtml += '<div class="b2hm2-pcard-sub">'+(rIco?'<span>'+rIco+'</span>':'')+(pwr!==null?'<span style="color:'+pc+';font-weight:900">'+pwr+'%</span>':'')+'</div>';
      bodyHtml += '</div>';
      bodyHtml += '</div>';
    });
    bodyHtml += '</div>';
    body.innerHTML = bodyHtml;
    popup.classList.add('show');
  }catch(e){}
}
function _b2HeatmapShowTierPopup(uid, tier, color){
  try{
    const popup  = document.getElementById(uid + '-popup');
    const header = document.getElementById(uid + '-popup-header');
    const body   = document.getElementById(uid + '-popup-body');
    if(!popup || !body) return;
    const escH = (typeof escHTML === 'function') ? escHTML : (s)=>String(s||'');
    const escA = (typeof escAttr === 'function') ? escAttr : (s)=>String(s||'');
    const _dissSet = new Set((typeof univCfg !== 'undefined' ? univCfg : []).filter(u=>u.dissolved||u.hidden).map(u=>String(u.name||'').trim()));
    const members = (Array.isArray(window.players) ? window.players : []).filter(p=>{
      const pu = String((p && p.univ) || '').trim();
      const pt = String((p && p.tier) || '미정');
      return pt === tier && !(p && (p.hidden || p.retired || p.hideFromBoard)) && !_dissSet.has(pu);
    });
    if(!members.length) return;
    let tw=0,tl=0;
    members.forEach(p=>(Array.isArray(p && p.history)?p.history:[]).forEach(h=>{ if(h && h.result==='승') tw++; else if(h && h.result==='패') tl++; }));
    const tg=tw+tl, wr=tg>0?Math.round(tw/tg*100):null;
    const wrc=wr===null?'#94a3b8':wr>=60?'#10b981':wr>=40?'#f59e0b':'#ef4444';
    const { fromN, toN } = _b2ThisWeekRange();
    const dNum = _b2DateNum;
    let ww=0,wl=0;
    members.forEach(p=>(Array.isArray(p && p.history)?p.history:[]).forEach(h=>{
      const d=dNum(h && (h.date||h.d||''));
      if(d>=fromN && d<=toN){
        if(h && h.result==='승') ww++;
        else if(h && h.result==='패') wl++;
      }
    }));
    if(header) header.innerHTML = _b2HmHeaderHTML({
      avatarColor: color, avatarLabel: tier,
      title: tier+' 티어 전체', wr, tw, tl, wrc
    });
    let bodyHtml = '';
    bodyHtml += '<div class="b2hm2-stat-row">' +
      '<div class="b2hm2-stat-box" style="background:'+color+'0d;border-color:'+color+'22">' +
        '<div class="b2hm2-stat-val" style="color:'+color+'">'+members.length+'</div>' +
        '<div class="b2hm2-stat-lbl">총 인원</div>' +
      '</div>';
    if (tg>0) bodyHtml +=
      '<div class="b2hm2-stat-box" style="background:'+wrc+'12;border-color:'+wrc+'30">' +
        '<div class="b2hm2-stat-val" style="color:'+wrc+'">'+wr+'%</div>' +
        '<div class="b2hm2-stat-lbl">'+tw+'승 '+tl+'패</div>' +
      '</div>';
    if (ww+wl>0) bodyHtml +=
      '<div class="b2hm2-stat-box" style="background:#fff7ed;border-color:#fed7aa">' +
        '<div class="b2hm2-stat-val" style="color:#c2410c">🔥 '+ww+'승</div>' +
        '<div class="b2hm2-stat-lbl" style="color:#c2410c">이번주 '+wl+'패</div>' +
      '</div>';
    bodyHtml += '</div>';
    bodyHtml += '<div style="font-size:var(--fs-caption);font-weight:800;color:var(--text3);margin-bottom:10px;display:flex;align-items:center;gap:6px">' +
      '<span style="width:20px;height:2px;background:var(--border2);display:inline-block;border-radius:1px"></span>' +
      members.length+'명' +
      '<span style="flex:1;height:1px;background:var(--border2);display:inline-block;border-radius:1px"></span></div>';
    bodyHtml += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(84px,1fr));gap:8px">';
    members.sort((a,b)=>{
      const ua=String(a && a.univ||''), ub=String(b && b.univ||'');
      const uc=ua.localeCompare(ub,'ko',{sensitivity:'base'});
      if (uc!==0) return uc;
      return (String(a && a.name || '')).localeCompare(String(b && b.name || ''),'ko',{sensitivity:'base'});
    }).forEach(p=>{
      const rIco=p && p.race==='P'?'🔮':p && p.race==='T'?'⚔️':p && p.race==='Z'?'🦎':'';
      const _isGif3 = p && p.photo ? /\.gif(\?|$)/i.test(String(p.photo)) : false;
      const rawPhoto = p && p.photo ? (_isGif3 ? (typeof toHttpsUrl==='function'?toHttpsUrl(p.photo):p.photo) : (typeof toThumbUrl==='function'?toThumbUrl(p.photo,84):p.photo)) : '';
      const rawPhotoOrig = p && p.photo ? (typeof toHttpsUrl==='function'?toHttpsUrl(p.photo):p.photo) : '';
      const safePhoto = rawPhoto ? escA(rawPhoto) : '';
      const safePhotoOrig = rawPhotoOrig ? escA(rawPhotoOrig) : '';
      const _2ndHm3 = (typeof _phSwap2ndHTML==='function') ? _phSwap2ndHTML(p && p.secondProfileFile, {style:'border-radius:inherit'}) : '';
      const initials = String(p && p.name || '?').slice(0,1);
      const pColor = (typeof gc === 'function' ? gc(p && p.univ) : null) || color;
      let pw=0,pl=0;
      (Array.isArray(p && p.history)?p.history:[]).forEach(h=>{ if(h && h.result==='승') pw++; else if(h && h.result==='패') pl++; });
      const pg=pw+pl,pwr=pg>0?Math.round(pw/pg*100):null;
      const pc=pwr===null?'#94a3b8':pwr>=60?'#10b981':pwr>=40?'#f59e0b':'#ef4444';
      const safeNameAttr = escA(p && p.name || '');
      bodyHtml += '<div class="b2hm2-pcard" style="border-color:'+pColor+'55" onclick="_b2LineupCardHoverLeave();openPlayerModal(\''+safeNameAttr.replace(/'/g,"\\'")+'\')" onmouseenter="_b2LineupCardHoverEnter(event,this,\''+safeNameAttr.replace(/'/g,"\\'")+'\',\''+pColor+'\')" onmouseleave="_b2LineupCardHoverLeave()">';
      if (safePhoto) {
        bodyHtml += '<span class="'+(_2ndHm3?'ph-swap':'')+'" style="position:relative;display:block">'
          + '<img class="b2hm2-pcard-photo" src="'+safePhoto+'" data-orig="'+safePhotoOrig+'" onerror="if(this.dataset.orig&&this.src!==this.dataset.orig){this.src=this.dataset.orig;}else{this.style.display=\'none\';this.nextSibling.style.display=\'flex\'}">'+ 
          '<div class="b2hm2-pcard-avatar" style="display:none;background:linear-gradient(160deg,'+pColor+'44,'+pColor+'22);color:'+pColor+'">'+ escH(initials)+'</div>'
          + _2ndHm3 + '</span>';
      } else {
        bodyHtml += '<div class="b2hm2-pcard-avatar" style="background:linear-gradient(160deg,'+pColor+'44,'+pColor+'22);color:'+pColor+'">'+ escH(initials)+'</div>';
      }
      bodyHtml += '<div class="b2hm2-pcard-info">';
      bodyHtml += '<span style="font-size:9px;font-weight:900;background:'+pColor+';color:#fff;border-radius:4px;padding:1px 5px;margin-bottom:2px;line-height:1.6">'+escH(p && p.univ || '')+'</span>';
      bodyHtml += '<div class="b2hm2-pcard-name">'+(rIco?'<span>'+rIco+'</span> ':'')+escH(p && p.name || '')+'</div>';
      bodyHtml += '<div class="b2hm2-pcard-sub">'+(pwr!==null?'<span style="color:'+pc+';font-weight:900">'+pwr+'%</span>':'')+'</div>';
      bodyHtml += '</div>';
      bodyHtml += '</div>';
    });
    bodyHtml += '</div>';
    body.innerHTML = bodyHtml;
    popup.classList.add('show');
  }catch(e){}
}
function _b2HeatmapShowGrandPopup(uid){
  try{
    const popup  = document.getElementById(uid + '-popup');
    const header = document.getElementById(uid + '-popup-header');
    const body   = document.getElementById(uid + '-popup-body');
    if(!popup || !body) return;
    const escH = (typeof escHTML === 'function') ? escHTML : (s)=>String(s||'');
    const escA = (typeof escAttr === 'function') ? escAttr : (s)=>String(s||'');
    const color = '#3b82f6';
    const _dissSet = new Set((typeof univCfg !== 'undefined' ? univCfg : []).filter(u=>u.dissolved||u.hidden).map(u=>String(u.name||'').trim()));
    const members = (Array.isArray(window.players) ? window.players : []).filter(p=>{
      const pu = String((p && p.univ) || '').trim();
      return !(p && (p.hidden || p.retired || p.hideFromBoard)) && !_dissSet.has(pu);
    });
    if(!members.length) return;
    let tw=0,tl=0;
    members.forEach(p=>(Array.isArray(p && p.history)?p.history:[]).forEach(h=>{ if(h && h.result==='승') tw++; else if(h && h.result==='패') tl++; }));
    const tg=tw+tl, wr=tg>0?Math.round(tw/tg*100):null;
    const wrc=wr===null?'#94a3b8':wr>=60?'#10b981':wr>=40?'#f59e0b':'#ef4444';
    const { fromN, toN } = _b2ThisWeekRange();
    const dNum = _b2DateNum;
    let ww=0,wl=0;
    members.forEach(p=>(Array.isArray(p && p.history)?p.history:[]).forEach(h=>{
      const d=dNum(h && (h.date||h.d||''));
      if(d>=fromN && d<=toN){
        if(h && h.result==='승') ww++;
        else if(h && h.result==='패') wl++;
      }
    }));
    if(header) header.innerHTML = _b2HmHeaderHTML({
      avatarColor: color, avatarLabel: '🏆',
      title: '전체 합계', wr, tw, tl, wrc
    });
    let bodyHtml = '';
    bodyHtml += '<div class="b2hm2-stat-row">' +
      '<div class="b2hm2-stat-box" style="background:'+color+'0d;border-color:'+color+'22">' +
        '<div class="b2hm2-stat-val" style="color:'+color+'">'+members.length+'</div>' +
        '<div class="b2hm2-stat-lbl">총 인원</div>' +
      '</div>';
    if (tg>0) bodyHtml +=
      '<div class="b2hm2-stat-box" style="background:'+wrc+'12;border-color:'+wrc+'30">' +
        '<div class="b2hm2-stat-val" style="color:'+wrc+'">'+wr+'%</div>' +
        '<div class="b2hm2-stat-lbl">'+tw+'승 '+tl+'패</div>' +
      '</div>';
    if (ww+wl>0) bodyHtml +=
      '<div class="b2hm2-stat-box" style="background:#fff7ed;border-color:#fed7aa">' +
        '<div class="b2hm2-stat-val" style="color:#c2410c">🔥 '+ww+'승</div>' +
        '<div class="b2hm2-stat-lbl" style="color:#c2410c">이번주 '+wl+'패</div>' +
      '</div>';
    bodyHtml += '</div>';
    bodyHtml += '<div style="font-size:var(--fs-caption);font-weight:800;color:var(--text3);margin-bottom:10px;display:flex;align-items:center;gap:6px">' +
      '<span style="width:20px;height:2px;background:var(--border2);display:inline-block;border-radius:1px"></span>' +
      members.length+'명' +
      '<span style="flex:1;height:1px;background:var(--border2);display:inline-block;border-radius:1px"></span></div>';
    bodyHtml += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(84px,1fr));gap:8px">';
    const TIERS_LOCAL2 = typeof TIERS !== 'undefined' ? TIERS : [];
    members.sort((a,b)=>{
      const ia=TIERS_LOCAL2.indexOf(a && a.tier||''), ib=TIERS_LOCAL2.indexOf(b && b.tier||'');
      const ta=ia>=0?ia:999, tb=ib>=0?ib:999;
      if (ta!==tb) return ta-tb;
      return (String(a && a.name || '')).localeCompare(String(b && b.name || ''),'ko',{sensitivity:'base'});
    }).forEach(p=>{
      const rIco=p && p.race==='P'?'🔮':p && p.race==='T'?'⚔️':p && p.race==='Z'?'🦎':'';
      const _isGif4 = p && p.photo ? /\.gif(\?|$)/i.test(String(p.photo)) : false;
      const rawPhoto = p && p.photo ? (_isGif4 ? (typeof toHttpsUrl==='function'?toHttpsUrl(p.photo):p.photo) : (typeof toThumbUrl==='function'?toThumbUrl(p.photo,84):p.photo)) : '';
      const rawPhotoOrig = p && p.photo ? (typeof toHttpsUrl==='function'?toHttpsUrl(p.photo):p.photo) : '';
      const safePhoto = rawPhoto ? escA(rawPhoto) : '';
      const safePhotoOrig = rawPhotoOrig ? escA(rawPhotoOrig) : '';
      const _2ndHm4 = (typeof _phSwap2ndHTML==='function') ? _phSwap2ndHTML(p && p.secondProfileFile, {style:'border-radius:inherit'}) : '';
      const initials = String(p && p.name || '?').slice(0,1);
      const pColor = (typeof gc === 'function' ? gc(p && p.univ) : null) || color;
      let pw=0,pl=0;
      (Array.isArray(p && p.history)?p.history:[]).forEach(h=>{ if(h && h.result==='승') pw++; else if(h && h.result==='패') pl++; });
      const pg=pw+pl,pwr=pg>0?Math.round(pw/pg*100):null;
      const pc=pwr===null?'#94a3b8':pwr>=60?'#10b981':pwr>=40?'#f59e0b':'#ef4444';
      const safeNameAttr = escA(p && p.name || '');
      const tierCol3 = (typeof getTierBtnColor==='function'&&p&&p.tier)?getTierBtnColor(p.tier):'#64748b';
      const tierTxt3 = (typeof getTierBtnTextColor==='function'&&p&&p.tier)?(getTierBtnTextColor(p.tier)||'#fff'):'#fff';
      bodyHtml += '<div class="b2hm2-pcard" style="border-color:'+pColor+'55" onclick="_b2LineupCardHoverLeave();openPlayerModal(\''+safeNameAttr.replace(/'/g,"\\'")+'\')" onmouseenter="_b2LineupCardHoverEnter(event,this,\''+safeNameAttr.replace(/'/g,"\\'")+'\',\''+pColor+'\')" onmouseleave="_b2LineupCardHoverLeave()">';
      if (safePhoto) {
        bodyHtml += '<span class="'+(_2ndHm4?'ph-swap':'')+'" style="position:relative;display:block">'
          + '<img class="b2hm2-pcard-photo" src="'+safePhoto+'" data-orig="'+safePhotoOrig+'" onerror="if(this.dataset.orig&&this.src!==this.dataset.orig){this.src=this.dataset.orig;}else{this.style.display=\'none\';this.nextSibling.style.display=\'flex\'}">'+ 
          '<div class="b2hm2-pcard-avatar" style="display:none;background:linear-gradient(160deg,'+pColor+'44,'+pColor+'22);color:'+pColor+'">'+ escH(initials)+'</div>'
          + _2ndHm4 + '</span>';
      } else {
        bodyHtml += '<div class="b2hm2-pcard-avatar" style="background:linear-gradient(160deg,'+pColor+'44,'+pColor+'22);color:'+pColor+'">'+ escH(initials)+'</div>';
      }
      bodyHtml += '<div class="b2hm2-pcard-info">';
      if (p&&p.tier) bodyHtml += '<span style="font-size:9px;font-weight:900;background:'+tierCol3+';color:'+tierTxt3+';border-radius:4px;padding:1px 5px;margin-bottom:2px;line-height:1.6">'+escH(p.tier)+'</span>';
      bodyHtml += '<div class="b2hm2-pcard-name">'+(rIco?'<span>'+rIco+'</span> ':'')+escH(p && p.name || '')+'</div>';
      bodyHtml += '<div class="b2hm2-pcard-sub">'+escH(p && p.univ || '')+' '+(pwr!==null?'<span style="color:'+pc+';font-weight:900">'+pwr+'%</span>':'')+'</div>';
      bodyHtml += '</div>';
      bodyHtml += '</div>';
    });
    bodyHtml += '</div>';
    body.innerHTML = bodyHtml;
    popup.classList.add('show');
  }catch(e){}
}

function _b2HeatmapView() {
  const hmUid = 'hm_' + Math.random().toString(36).slice(2,7);
  const _dissSet = new Set((typeof univCfg !== 'undefined' ? univCfg : []).filter(u=>u.dissolved||u.hidden).map(u=>String(u.name||'').trim()));
  const univList = (_b2VisUnivs ? _b2VisUnivs() : []).filter(u=>u.name && u.name!=='무소속');
  const vis = players.filter(p =>
    !p.hidden && !p.retired && !p.hideFromBoard &&
    !_dissSet.has(String(p?.univ||'').trim())
  );
  const TIERS_LOCAL = typeof TIERS !== 'undefined' ? TIERS : [];
  const mode    = window._b2HeatmapMode    || 'count';
  const sortRow = window._b2HeatmapSortRow || 'name';
  const sortCol = window._b2HeatmapSortCol || 'tier';

  // 사용 중인 티어 목록
  const usedTiers = [...new Set(vis.map(p=>p.tier||'미정'))];
  let orderedTiers = TIERS_LOCAL.filter(t=>usedTiers.includes(t))
    .concat(usedTiers.filter(t=>!TIERS_LOCAL.includes(t)));

  // 대학-티어 교차 집계
  const cellData = {}; // cellData[univ][tier] = { count, wins, losses }
  univList.forEach(u => { cellData[u.name] = {}; });
  vis.forEach(p => {
    const u = String(p?.univ||'').trim();
    const t = p.tier||'미정';
    if (!cellData[u]) cellData[u] = {};
    if (!cellData[u][t]) cellData[u][t] = { count:0, wins:0, losses:0 };
    cellData[u][t].count++;
    (Array.isArray(p.history)?p.history:[]).forEach(h => {
      if (h.result==='승') cellData[u][t].wins++;
      else if (h.result==='패') cellData[u][t].losses++;
    });
  });

  // 대학 합계
  const univTotals = {};
  univList.forEach(u => {
    let cnt=0, w=0, l=0;
    orderedTiers.forEach(t => { const c=cellData[u.name]?.[t]; if(c){cnt+=c.count;w+=c.wins;l+=c.losses;} });
    univTotals[u.name] = { count:cnt, wins:w, losses:l, wr: (w+l)>0?Math.round(w/(w+l)*100):null };
  });

  // 티어 합계
  const tierTotals = {};
  orderedTiers.forEach(t => {
    let cnt=0, w=0, l=0;
    univList.forEach(u => { const c=cellData[u.name]?.[t]; if(c){cnt+=c.count;w+=c.wins;l+=c.losses;} });
    tierTotals[t] = { count:cnt, wins:w, losses:l, wr:(w+l)>0?Math.round(w/(w+l)*100):null };
  });

  // 행(대학) 정렬
  let sortedUnivs = [...univList];
  if (sortRow === 'name')  sortedUnivs.sort((a,b)=>(a.name||'').localeCompare(b.name||'','ko'));
  if (sortRow === 'count') sortedUnivs.sort((a,b)=>(univTotals[b.name]?.count||0)-(univTotals[a.name]?.count||0));
  if (sortRow === 'wr')    sortedUnivs.sort((a,b)=>(univTotals[b.name]?.wr??-1)-(univTotals[a.name]?.wr??-1));

  // 열(티어) 정렬
  let sortedTiers = [...orderedTiers];
  if (sortCol === 'tier')  {} // 기본 티어 순서 유지
  if (sortCol === 'count') sortedTiers.sort((a,b)=>(tierTotals[b]?.count||0)-(tierTotals[a]?.count||0));
  if (sortCol === 'wr')    sortedTiers.sort((a,b)=>(tierTotals[b]?.wr??-1)-(tierTotals[a]?.wr??-1));

  // 색상 보간 (count: 대학 색상 기반 / wr: 빨강↔초록)
  const _hexToRgb = (hex) => {
    const h = String(hex || '').trim().replace('#','');
    if (h.length === 3) {
      const r = parseInt(h[0] + h[0], 16);
      const g = parseInt(h[1] + h[1], 16);
      const b = parseInt(h[2] + h[2], 16);
      if ([r,g,b].some(x=>isNaN(x))) return null;
      return { r, g, b };
    }
    if (h.length >= 6) {
      const r = parseInt(h.slice(0,2), 16);
      const g = parseInt(h.slice(2,4), 16);
      const b = parseInt(h.slice(4,6), 16);
      if ([r,g,b].some(x=>isNaN(x))) return null;
      return { r, g, b };
    }
    return null;
  };
  const heatColor = (val, max, baseHex) => {
    if (!val || max===0) return 'transparent';
    const t = val/max;
    if (mode === 'count') {
      const rgb = _hexToRgb(baseHex) || _hexToRgb('#3b82f6') || { r:59, g:130, b:246 };
      const a = Math.min(0.92, Math.max(0.12, t * 0.78 + 0.12));
      return `rgba(${rgb.r},${rgb.g},${rgb.b},${a.toFixed(2)})`;
    } else {
      // 승률: 빨강(0%)→흰→초록(100%)
      const r = val<50?255:Math.round(255*(1-(val-50)/50));
      const g = val>50?255:Math.round(255*(val/50));
      return `rgba(${r},${g},80,0.55)`;
    }
  };
  const textColor = (val, max) => {
    if (!val || max===0) return 'var(--text3)';
    return val/max > 0.55 ? '#fff' : 'var(--text1)';
  };

  const maxCount = Math.max(1, ...univList.flatMap(u=>orderedTiers.map(t=>cellData[u.name]?.[t]?.count||0)));

  const modeBtns = [
    { key:'count', label:'👥 인원수' },
    { key:'wr',    label:'📈 승률' },
  ];

  let h = `<style>
    .b2hm2-wrap { overflow-x:auto; }
    .b2hm2-ctrl { display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-bottom:12px;padding:10px 12px;background:var(--surface);border:1px solid var(--border2);border-radius:12px }
    .b2hm2-ctrl-group { display:flex;gap:4px;align-items:center;flex-wrap:wrap }
    .b2hm2-lbl { font-size:var(--fs-caption);font-weight:800;color:var(--text3);margin-right:2px }
    .b2hm2-btn { padding:4px 10px;border-radius:8px;border:1.5px solid var(--border2);background:var(--white);font-size:var(--fs-caption);font-weight:700;color:var(--text2);cursor:pointer;transition:all .12s;user-select:none }
    .b2hm2-btn.on { background:var(--text1);color:var(--white);border-color:var(--text1);box-shadow:inset 0 2px 4px rgba(0,0,0,.25) }
    .b2hm2-btn:not(.on):hover { border-color:var(--text1);color:var(--text1) }
    .b2hm2-btn:not(.on):active { background:var(--border2);transform:scale(.97) }
    .b2hm2-sel { padding:4px 10px;border-radius:8px;border:1.5px solid var(--border2);background:var(--white);font-size:var(--fs-caption);font-weight:700;color:var(--text2);cursor:pointer; }
    .b2hm2-sep { width:1px;height:22px;background:var(--border2);margin:0 4px }
    .b2hm2-tbl { border-collapse:separate;border-spacing:3px;min-width:100% }
    .b2hm2-tbl th { font-size:10px;font-weight:800;color:var(--text3);padding:4px 6px;text-align:center;white-space:nowrap;position:sticky }
    .b2hm2-tbl th.row-head { text-align:left;left:0;top:0;z-index:4;background:var(--bg) }
    .b2hm2-tbl th.col-head { top:0;z-index:2;background:var(--bg) }
    .b2hm2-tbl td { border-radius:8px;text-align:center;font-size:var(--fs-caption);font-weight:800;padding:6px 4px;min-width:44px;cursor:pointer;position:relative;transition:none }
    .b2hm2-popup { display:none;position:fixed;inset:0;z-index:9999;align-items:center;justify-content:center;background:rgba(0,0,0,.55);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px) }
    .b2hm2-popup.show { display:flex }
    .b2hm2-popup-inner { background:color-mix(in srgb, var(--white) 82%, transparent);backdrop-filter:blur(16px) saturate(1.4);-webkit-backdrop-filter:blur(16px) saturate(1.4);border-radius:22px;padding:0;max-width:400px;width:92%;max-height:85vh;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 24px 72px rgba(0,0,0,.28),0 0 0 1px rgba(0,0,0,.06);position:relative;animation:b2hmIn .22s cubic-bezier(.34,1.56,.64,1) }
    .b2hm2-popup-header { position:relative;padding:20px 48px 16px 18px;border-bottom:1px solid var(--border2);flex-shrink:0;background:transparent }
    .b2hm2-popup-body { padding:16px 20px 20px;overflow-y:auto;flex:1 }
    @keyframes b2hmIn { from{opacity:0;transform:scale(.88) translateY(16px)} to{opacity:1;transform:none} }
    .b2hm2-popup-close { position:absolute;top:14px;right:14px;background:var(--white);border:1px solid var(--border2);width:30px;height:30px;border-radius:50%;font-size:13px;cursor:pointer;color:var(--text2);display:flex;align-items:center;justify-content:center;transition:all .18s;z-index:3;box-shadow:0 2px 8px rgba(0,0,0,.1) }
    .b2hm2-popup-close:hover { background:var(--text1);color:#fff;border-color:var(--text1);transform:rotate(90deg) }
    .b2hm2-header-row { display:flex;align-items:center;gap:11px }
    .b2hm2-header-avatar { width:44px;height:44px;border-radius:13px;display:flex;align-items:center;justify-content:center;font-size:15px;font-weight:900;color:#fff;flex-shrink:0;box-shadow:0 3px 8px rgba(0,0,0,.14) }
    .b2hm2-header-avatar--logo { background:transparent;box-shadow:none;width:64px;height:64px;border-radius:16px }
    .b2hm2-header-info { flex:1;min-width:0 }
    .b2hm2-header-title { display:flex;align-items:center;gap:6px;flex-wrap:wrap;line-height:1.3 }
    .b2hm2-header-name { font-size:16px;font-weight:900;color:var(--text1);letter-spacing:-.2px }
    .b2hm2-header-tierbadge { font-size:10.5px;font-weight:800;padding:2px 8px;border-radius:20px;letter-spacing:.2px }
    .b2hm2-header-wr { margin-top:3px;display:flex;align-items:baseline;gap:6px }
    .b2hm2-header-wr-pct { font-size:14px;font-weight:900 }
    .b2hm2-header-wr-rec { font-size:10.5px;color:var(--text3);font-weight:700 }
    .b2hm2-pcard { display:flex;flex-direction:column;align-items:center;gap:0;padding:0;border-radius:14px;border:1.5px solid transparent;text-align:center;transition:all .18s;cursor:pointer;overflow:hidden;position:relative }
    .b2hm2-pcard:hover { border-color:var(--border2);box-shadow:0 4px 16px rgba(0,0,0,.14);transform:translateY(-2px) scale(1.03) }
    .b2hm2-pcard-photo { width:100%;aspect-ratio:3/4;object-fit:cover;object-position:center top;flex-shrink:0;display:block }
    .b2hm2-pcard-avatar { width:100%;aspect-ratio:3/4;display:flex;align-items:center;justify-content:center;font-size:28px;font-weight:900;flex-shrink:0 }
    .b2hm2-pcard-info { position:absolute;bottom:0;left:0;right:0;padding:18px 6px 7px;background:linear-gradient(transparent,rgba(0,0,0,.78));display:flex;flex-direction:column;gap:2px;align-items:center }
    .b2hm2-pcard-name { font-size:var(--fs-caption);font-weight:900;line-height:1.2;color:#fff;text-shadow:0 1px 4px rgba(0,0,0,.5) }
    .b2hm2-pcard-sub { font-size:10px;color:rgba(255,255,255,.8);display:flex;align-items:center;gap:3px;flex-wrap:wrap;justify-content:center }
    .b2hm2-stat-row { display:flex;gap:6px;margin:12px 0 10px }
    .b2hm2-stat-box { flex:1;padding:7px 6px;border-radius:11px;text-align:center;border:1.5px solid transparent;transition:transform .15s ease;min-width:0 }
    .b2hm2-stat-box:hover { transform:translateY(-1px) }
    .b2hm2-stat-box .b2hm2-stat-val { font-size:15px;font-weight:900;line-height:1.25;white-space:nowrap;overflow:hidden;text-overflow:ellipsis }
    .b2hm2-stat-box .b2hm2-stat-lbl { font-size:9px;font-weight:700;color:var(--text3);margin-top:1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis }
    .b2hm2-week-badge { display:inline-flex;align-items:center;gap:5px;padding:5px 12px;border-radius:20px;background:#fff7ed;border:1px solid #fed7aa;font-size:var(--fs-caption);font-weight:800;color:#c2410c;margin-bottom:12px }
    .b2hm2-tbl td:hover { filter:none;box-shadow:none; }
    .b2hm2-tbl tr:hover td { filter:none; box-shadow:none; }
    .b2hm2-tbl td.univ-name { text-align:left;font-size:var(--fs-caption);font-weight:800;padding:4px 6px;white-space:nowrap;background:var(--bg);color:var(--text1);position:sticky;left:0;z-index:2;min-width:56px }
    .b2hm2-tbl td.total-cell { background:var(--surface);border:1px solid var(--border2);font-weight:900 }
    .b2hm2-legend { display:flex;align-items:center;gap:6px;margin-top:8px;font-size:var(--fs-caption);color:var(--text3) }
    .b2hm2-legend-bar { height:12px;width:120px;border-radius:6px }
    .b2hm2-empty { font-size:var(--fs-caption);color:var(--text3);padding:2px 4px }
  </style>`;

  // 컨트롤
  h += `<div class="b2hm2-ctrl">
    <div class="b2hm2-ctrl-group">
      <span class="b2hm2-lbl">표시:</span>
      ${modeBtns.map(b=>`<button class="b2hm2-btn${mode===b.key?' on':''}" onclick="window._b2HeatmapMode='${b.key}';render()">${b.label}</button>`).join('')}
    </div>
    <div class="b2hm2-sep"></div>
    <div class="b2hm2-ctrl-group">
      <span class="b2hm2-lbl">행 정렬:</span>
      <select class="b2hm2-sel" onchange="window._b2HeatmapSortRow=this.value;render()">
        <option value="name"${sortRow==='name'?' selected':''}>🔤 이름</option>
        <option value="count"${sortRow==='count'?' selected':''}>👥 인원</option>
        <option value="wr"${sortRow==='wr'?' selected':''}>📈 승률</option>
      </select>
    </div>
    <div class="b2hm2-sep"></div>
    <div class="b2hm2-ctrl-group">
      <span class="b2hm2-lbl">열 정렬:</span>
      <select class="b2hm2-sel" onchange="window._b2HeatmapSortCol=this.value;render()">
        <option value="tier"${sortCol==='tier'?' selected':''}>🏅 티어</option>
        <option value="count"${sortCol==='count'?' selected':''}>👥 인원</option>
        <option value="wr"${sortCol==='wr'?' selected':''}>📈 승률</option>
      </select>
    </div>
  </div>`;

  h += `<div class="b2hm2-wrap"><table class="b2hm2-tbl">`;

  // 헤더행 (티어)
  const maxWr = 100;
  h += `<thead><tr>
    <th class="row-head col-head">대학 \\ 티어</th>
    ${sortedTiers.map(t => {
      const col   = typeof getTierBtnColor==='function'?getTierBtnColor(t):'#64748b';
      const tcol  = typeof getTierBtnTextColor==='function'?(getTierBtnTextColor(t)||'#fff'):'#fff';
      const tot   = tierTotals[t];
      const sub   = mode==='count'?`${tot.count}명`:tot.wr!==null?`${tot.wr}%`:'-';
      const _au2 = (typeof escAttr==='function') ? escAttr : (s)=>String(s||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
      return `<th class="col-head" style="cursor:pointer" data-hm-uid="${hmUid}" data-hm-tier="${_au2(t)}" data-hm-color="${_au2(col)}" onclick="_b2HeatmapTierClick(this)"><div style="display:flex;flex-direction:column;align-items:center;gap:2px">
        <span style="padding:2px 8px;border-radius:6px;background:${col};color:${tcol}">${t}</span>
        <span style="font-size:9px;font-weight:700;color:var(--text3)">${sub}</span>
      </div></th>`;
    }).join('')}
    <th class="col-head" style="border-left:2px solid var(--border2);cursor:pointer" data-hm-uid="${hmUid}" onclick="_b2HeatmapGrandClick(this)">합계</th>
  </tr></thead><tbody>`;

  // 데이터 행
  sortedUnivs.forEach(u => {
    const color = gc ? gc(u.name)||'#64748b' : '#64748b';
    const tot   = univTotals[u.name];
    if (!tot.count) return;
    h += `<tr>
      <td class="univ-name" style="border-left:3px solid ${color};background:var(--bg) !important">
        <span style="color:${color};display:inline-flex;align-items:center;gap:3px">${typeof gUI==='function'?gUI(u.name,'18px'):''}${u.name}</span>
        <div style="font-size:9px;color:var(--text3);font-weight:600">${mode==='count'?`${tot.count}명`:tot.wr!==null?`${tot.wr}%`:'-'}</div>
      </td>
      ${sortedTiers.map(t => {
        const c = cellData[u.name]?.[t];
        if (!c || !c.count) return `<td style="background:var(--bg) !important"><span class="b2hm2-empty">-</span></td>`;
        const val   = mode==='count' ? c.count : ((c.wins+c.losses>0)?Math.round(c.wins/(c.wins+c.losses)*100):0);
        const max   = mode==='count' ? maxCount : 100;
        let bg      = heatColor(val, max, color);
        let fc      = textColor(val, max);
        const label = mode==='count' ? `${c.count}명` : `${val}%`;
        const sub   = mode==='wr' ? `${c.wins}승${c.losses}패` : '';
        const _au = (typeof escAttr==='function') ? escAttr : (s)=>String(s||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
        const games = (c.wins||0) + (c.losses||0);
        if(mode==='wr' && games>0 && games < 5){
          bg = 'rgba(148,163,184,0.16)';
          fc = 'var(--text3)';
        }
        return `<td style="background:${bg} !important;color:${fc}" title="${u.name} / ${t}: ${c.count}명 ${c.wins}승 ${c.losses}패" data-hm-uid="${hmUid}" data-hm-univ="${_au(u.name)}" data-hm-tier="${_au(t)}" data-hm-color="${_au(color)}" onclick="_b2HeatmapCellClick(this)">
          <div style="font-size:var(--fs-sm);font-weight:900">${label}</div>
          ${sub?`<div style="font-size:9px;opacity:.8">${sub}</div>`:''}
        </td>`;
      }).join('')}
      <td class="total-cell" style="background:var(--surface) !important;color:${color}; cursor: pointer;" data-hm-uid="${hmUid}" data-hm-univ="${(typeof escAttr==='function')?escAttr(u.name):String(u.name||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}" data-hm-color="${(typeof escAttr==='function')?escAttr(color):String(color||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}" onclick="_b2HeatmapTotalClick(this)">
        <div>${mode==='count'?`${tot.count}명`:tot.wr!==null?`${tot.wr}%`:'-'}</div>
        ${mode==='wr'?`<div style="font-size:9px;color:var(--text3)">${tot.wins}승${tot.losses}패</div>`:`<div style="font-size:9px;color:var(--text3)">${tot.wins}승${tot.losses}패</div>`}
      </td>
    </tr>`;
  });

  // 합계 행
  const grandW = Object.values(univTotals).reduce((s,u)=>s+u.wins,0);
  const grandL = Object.values(univTotals).reduce((s,u)=>s+u.losses,0);
  const grandG = grandW+grandL;
  const grandWr = grandG>0?Math.round(grandW/grandG*100):null;
  h += `<tr style="border-top:2px solid var(--border2)">
    <td class="univ-name" style="background:var(--surface) !important;font-weight:900;color:var(--text1)">합계</td>
    ${sortedTiers.map(t=>{
      const tot=tierTotals[t];
      const val=mode==='count'?tot.count:tot.wr??0;
      const colT = typeof getTierBtnColor==='function'?getTierBtnColor(t):'#64748b';
      const _au3 = (typeof escAttr==='function') ? escAttr : (s)=>String(s||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
      return `<td style="background:var(--surface);font-weight:900;color:var(--text2);cursor:pointer" data-hm-uid="${hmUid}" data-hm-tier="${_au3(t)}" data-hm-color="${_au3(colT)}" onclick="_b2HeatmapTierClick(this)">
        <div>${mode==='count'?`${tot.count}명`:tot.wr!==null?`${tot.wr}%`:'-'}</div>
        <div style="font-size:9px;color:var(--text3)">${tot.wins}승${tot.losses}패</div>
      </td>`;
    }).join('')}
    <td class="total-cell" style="background:var(--surface) !important;font-weight:900;color:var(--text1);cursor:pointer" data-hm-uid="${hmUid}" onclick="_b2HeatmapGrandClick(this)">
      <div>${mode==='count'?`${vis.length}명`:grandWr!==null?`${grandWr}%`:'-'}</div>
      <div style="font-size:9px;color:var(--text3)">${grandW}승${grandL}패</div>
    </td>
  </tr>`;

  h += `</tbody></table></div>`;

  // 셀 클릭 인원 팝업
  h += `<div id="${hmUid}-popup" class="b2hm2-popup" onclick="if(event.target===this)this.classList.remove('show')">
    <div class="b2hm2-popup-inner">
      <button class="b2hm2-popup-close" onclick="document.getElementById('${hmUid}-popup').classList.remove('show')">✕</button>
      <div id="${hmUid}-popup-header" class="b2hm2-popup-header"></div>
      <div id="${hmUid}-popup-body" class="b2hm2-popup-body"></div>
    </div>
  </div>`;

  // 범례
  if (mode === 'count') {
    h += `<div class="b2hm2-legend">
      <span>적음</span>
      <div class="b2hm2-legend-bar" style="background:linear-gradient(90deg,rgba(59,130,246,.12),rgba(59,130,246,.9))"></div>
      <span>많음</span>
    </div>`;
  } else {
    h += `<div class="b2hm2-legend">
      <span>0%</span>
      <div class="b2hm2-legend-bar" style="background:linear-gradient(90deg,rgba(255,80,80,.55),rgba(255,255,80,.4),rgba(80,255,80,.55))"></div>
      <span>100%</span>
    </div>`;
  }

  return h;
}
/* ══════════════════════════════════════
   🌐 버블뷰 v2 — 클릭 팝업 + 진입 애니메이션 + 승률 버블 모드
══════════════════════════════════════ */
function _b2BubbleView() {
  const _dissSet = new Set((typeof univCfg !== 'undefined' ? univCfg : []).filter(u=>u.dissolved||u.hidden).map(u=>String(u.name||'').trim()));
  const univList = (_b2VisUnivs ? _b2VisUnivs() : []).filter(u=>u.name && u.name!=='무소속');
  const tieredVis = players.filter(p =>
    !p.hidden && !p.retired && !p.hideFromBoard &&
    !_dissSet.has(String(p?.univ||'').trim()) &&
    !_b2HasRole(p)
  );

  const univData = univList.map(u => {
    const members = tieredVis.filter(p => String(p?.univ||'').trim() === u.name);
    const P = members.filter(p=>p.race==='P').length;
    const T = members.filter(p=>p.race==='T').length;
    const Z = members.filter(p=>p.race==='Z').length;
    const color = gc(u.name) || '#64748b';
    const iconUrl = u.icon || u.img || (typeof UNIV_ICONS!=='undefined' ? UNIV_ICONS[u.name] : '') || '';
    let wins=0, losses=0;
    members.forEach(p=>{
      (Array.isArray(p.history)?p.history:[]).forEach(h=>{
        if(h.result==='승')wins++; else if(h.result==='패')losses++;
      });
    });
    const games = wins+losses;
    const wr = games>0?Math.round(wins/games*100):null;
    // 최근 활동 (이번주)
    const { fromN, toN } = _b2ThisWeekRange();
    let weekActive=0;
    members.forEach(p=>{
      const hist=Array.isArray(p.history)?p.history:[];
      const d=hist.filter(h=>{ const dn=_b2DateNum(h.date||h.d||'');return dn>=fromN&&dn<=toN; });
      if(d.length>0)weekActive++;
    });
    // Top tier
    const TIERS_LOCAL=typeof TIERS!=='undefined'?TIERS:[];
    const sortedM=members.slice().sort((a,b)=>{const ia=TIERS_LOCAL.indexOf(a.tier||''),ib=TIERS_LOCAL.indexOf(b.tier||'');return(ia>=0?ia:999)-(ib>=0?ib:999);});
    const topTier=sortedM[0]?.tier||null;
    const topTierCol=typeof getTierBtnColor==='function'&&topTier?getTierBtnColor(topTier):'#94a3b8';
    const topTierTc=typeof getTierBtnTextColor==='function'&&topTier?(getTierBtnTextColor(topTier)||'#fff'):'#fff';
    // 티어 구성 (파이차트 티어모드용)
    const tierCountMap={};
    members.forEach(p=>{ const t=p.tier||'미정'; tierCountMap[t]=(tierCountMap[t]||0)+1; });
    const usedTiersForUniv=[...new Set(members.map(p=>p.tier||'미정'))];
    const orderedTiersForUniv=TIERS_LOCAL.filter(t=>usedTiersForUniv.includes(t)).concat(usedTiersForUniv.filter(t=>!TIERS_LOCAL.includes(t)));
    const tierSegs=orderedTiersForUniv.map(t=>({
      tier:t, count:tierCountMap[t]||0,
      color:(typeof getTierBtnColor==='function'?getTierBtnColor(t):'#64748b')
    }));
    return { name:u.name, total:members.length, P, T, Z, color, icon:iconUrl, wins, losses, games, wr, weekActive, topTier, topTierCol, topTierTc, tierSegs };
  }).filter(u=>u.total>0).sort((a,b)=>b.total-a.total);

  const dataJson = JSON.stringify(univData);
  const uid = 'bbl_' + Math.random().toString(36).slice(2,8);

  return `<style>
    #${uid}-wrap { position:relative; }
    #${uid}-canvas { display:block; width:100%; cursor:pointer; border-radius:12px; }
    #${uid}-tooltip { position:absolute; pointer-events:none; opacity:0; background:color-mix(in srgb, var(--white) 90%, transparent); backdrop-filter:blur(14px) saturate(1.3); -webkit-backdrop-filter:blur(14px) saturate(1.3); border:1px solid var(--border2); border-radius:16px; padding:13px 14px 11px; box-shadow:0 14px 36px rgba(15,23,42,.16); transition:opacity .15s ease,transform .15s ease; transform:translateY(4px); min-width:210px; max-width:230px; z-index:var(--z-dropdown,100); }
    #${uid}-legend { display:flex; flex-wrap:wrap; gap:6px; margin-top:10px; align-items:center; }
    .${uid}-sort-btn, .${uid}-pie-btn { padding:5px 12px; border-radius:20px; border:1.5px solid var(--border2); background:var(--surface); font-size:var(--fs-sm); font-weight:700; color:var(--text2); cursor:pointer; transition:all .15s; }
    .${uid}-sort-btn.on, .${uid}-pie-btn.on { background:var(--text1); color:var(--white); border-color:var(--text1); }
    .${uid}-sort-btn:hover:not(.on), .${uid}-pie-btn:hover:not(.on) { border-color:var(--text2); }
    #${uid}-popup { display:none; position:fixed; inset:0; z-index:999; align-items:center; justify-content:center; background:rgba(15,23,42,.5); backdrop-filter:blur(3px); -webkit-backdrop-filter:blur(3px); animation:b2bblFade .2s ease; }
    #${uid}-popup.show { display:flex; }
    @keyframes b2bblFade { from{opacity:0} to{opacity:1} }
    #${uid}-popup-inner { background:var(--white); border-radius:22px; padding:22px; max-width:400px; width:92%; max-height:82vh; overflow-y:auto; box-shadow:0 24px 70px rgba(0,0,0,.28); position:relative; animation:b2bblIn .28s cubic-bezier(.2,.9,.3,1.2); border:1px solid var(--border2); }
    @keyframes b2bblIn { from{opacity:0;transform:scale(.9) translateY(16px)} to{opacity:1;transform:none} }
    #${uid}-popup-close { position:sticky;float:right;top:0;right:0;background:var(--border2);border:none;width:28px;height:28px;border-radius:50%;font-size:var(--fs-base);cursor:pointer;color:var(--text2);line-height:1;display:flex;align-items:center;justify-content:center;z-index:2;transition:all .15s ease;box-shadow:0 2px 6px rgba(0,0,0,.08) }
    #${uid}-popup-close:hover { background:var(--text1);color:#fff;transform:rotate(90deg) scale(1.05) }
    .${uid}-pcard { display:flex;flex-direction:column;align-items:center;padding:0;border-radius:13px;border:1.5px solid transparent;text-align:center;transition:all .18s cubic-bezier(.2,.8,.3,1.1);cursor:pointer;overflow:hidden;position:relative;box-shadow:0 1px 4px rgba(0,0,0,.06) }
    .${uid}-pcard:hover { box-shadow:0 6px 18px rgba(0,0,0,.18);transform:translateY(-3px) scale(1.03) }
    .${uid}-pcard-photo { width:100%;aspect-ratio:3/4;object-fit:cover;object-position:center top;display:block }
    .${uid}-pcard-avatar { width:100%;aspect-ratio:3/4;display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:900 }
    .${uid}-pcard-info { position:absolute;bottom:0;left:0;right:0;padding:14px 4px 5px;background:linear-gradient(transparent,rgba(0,0,0,.78));display:flex;flex-direction:column;gap:1px;align-items:center }
    .${uid}-pcard-name { font-size:10px;font-weight:900;line-height:1.2;color:#fff;text-shadow:0 1px 4px rgba(0,0,0,.5) }
    .${uid}-sizeleg-dot { border-radius:50%;background:#94a3b8;display:inline-block;flex-shrink:0 }
  </style>
  <div id="${uid}-wrap">
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;flex-wrap:wrap">
      <span style="font-size:var(--fs-base);font-weight:900;color:var(--text1)">🌐 대학별 버블맵</span>
      <span id="${uid}-desc" style="font-size:var(--fs-sm);color:var(--text3)">버블 크기 = 인원 · 파이 = 종족 비율</span>
      <div style="margin-left:auto;display:flex;gap:8px;flex-wrap:wrap;align-items:center">
        <div style="display:flex;gap:4px;align-items:center">
          <span style="font-size:var(--fs-caption);font-weight:800;color:var(--text3);margin-right:2px">파이:</span>
          <button class="${uid}-pie-btn on" onclick="_${uid}setPie('race',this)">종족</button>
          <button class="${uid}-pie-btn" onclick="_${uid}setPie('tier',this)">티어</button>
        </div>
        <div style="display:flex;gap:4px;flex-wrap:wrap">
          <button class="${uid}-sort-btn on" onclick="_${uid}setSort('total',this)">인원순</button>
          <button class="${uid}-sort-btn" onclick="_${uid}setSort('wr',this)">승률순</button>
          <button class="${uid}-sort-btn" onclick="_${uid}setSort('weekActive',this)">활동순</button>
          <button class="${uid}-sort-btn" onclick="_${uid}setSort('P',this)">P비율</button>
          <button class="${uid}-sort-btn" onclick="_${uid}setSort('T',this)">T비율</button>
          <button class="${uid}-sort-btn" onclick="_${uid}setSort('Z',this)">Z비율</button>
        </div>
      </div>
    </div>
    <canvas id="${uid}-canvas"></canvas>
    <div id="${uid}-tooltip"></div>
    <div id="${uid}-legend"></div>
  </div>

  <!-- 클릭 상세 팝업 -->
  <div id="${uid}-popup" onclick="if(event.target===this)this.classList.remove('show')">
    <div id="${uid}-popup-inner">
      <button id="${uid}-popup-close" onclick="document.getElementById('${uid}-popup').classList.remove('show')">✕</button>
      <div id="${uid}-popup-body" style="clear:both"></div>
    </div>
  </div>

  <script>
  (function(){
    const RAW = ${dataJson};
    const RACE_COLS = { P:'#7c3aed', T:'#0284c7', Z:'#059669', '?':'#94a3b8' };
    const _cssVar = function(name, fallback){
      try{ const v=getComputedStyle(document.documentElement).getPropertyValue(name).trim(); return v||fallback; }catch(e){ return fallback; }
    };
    let TEXT2_COL = _cssVar('--text2', '#334155');
    let sortKey = 'total';
    let pieMode = 'race';
    let hovIdx  = -1;
    let touchIdx = -1;
    let bubbles = [];
    let animProgress = 0;
    let animId = null;
    const canvas  = document.getElementById('${uid}-canvas');
    const ttip    = document.getElementById('${uid}-tooltip');
    const legendEl= document.getElementById('${uid}-legend');
    const descEl  = document.getElementById('${uid}-desc');
    const popup   = document.getElementById('${uid}-popup');
    const popBody = document.getElementById('${uid}-popup-body');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    function sortedData() {
      return [...RAW].sort((a,b) => {
        if (sortKey === 'total') return b.total - a.total;
        if (sortKey === 'wr')   return (b.wr??-1) - (a.wr??-1);
        if (sortKey === 'weekActive') return b.weekActive - a.weekActive;
        const ra = a.total>0?a[sortKey]/a.total:0, rb = b.total>0?b[sortKey]/b.total:0;
        return rb - ra;
      });
    }

    function layout() {
      const W = canvas.parentElement.offsetWidth || 700;
      const data = sortedData();
      const n = data.length;
      if (!n) return [];
      const maxT = Math.max(...data.map(d=>d.total), 1);
      const minR = 18, maxR = Math.max(44, Math.min(72, W/(Math.sqrt(n)*2.2)));
      const cols = Math.max(3, Math.min(8, Math.floor(W/(maxR*2.4))));
      const cellW = W/cols, cellH = maxR*2.6;
      const H = Math.ceil(n/cols)*cellH + 20;
      canvas.width  = W*devicePixelRatio;
      canvas.height = H*devicePixelRatio;
      canvas.style.height = H+'px';
      ctx.setTransform(1,0,0,1,0,0);
      ctx.scale(devicePixelRatio, devicePixelRatio);
      return data.map((d,i) => {
        const col=i%cols, row=Math.floor(i/cols);
        const cx=cellW*col+cellW/2, cy=row*cellH+cellH/2+10;
        let r=minR+((d.total||0)/maxT)*(maxR-minR);
        if (!(typeof r==='number' && isFinite(r) && r>0)) r=minR;
        return {...d, cx, cy, r, idx:i};
      });
    }

    function easeOut(t){ return 1-(1-t)*(1-t)*(1-t); }
    // 부동소수점 오차나 이상 데이터(0명 대학 등)로 반지름이 아주 작은 음수/NaN이
    // 되는 경우를 방어해서 "Negative radius" 캔버스 크래시를 막는다.
    function _safeR(v){ return (typeof v==='number' && isFinite(v) && v>0) ? v : 0; }

    function drawPie(bbl, scale) {
      const {cx,cy,r,P,T,Z,total,color} = bbl;
      const rr = _safeR(r*scale);
      let segs;
      if (pieMode === 'tier' && Array.isArray(bbl.tierSegs) && bbl.tierSegs.length) {
        segs = bbl.tierSegs.filter(s=>s.count>0).map(s=>({val:s.count,col:s.color}));
      } else {
        segs=[{val:P,col:RACE_COLS.P},{val:T,col:RACE_COLS.T},{val:Z,col:RACE_COLS.Z},{val:total-P-T-Z,col:RACE_COLS['?']}].filter(s=>s.val>0);
      }
      if (!segs.length || !(total>0)) {
        ctx.beginPath(); ctx.arc(cx,cy,rr,0,Math.PI*2);
        ctx.fillStyle=color+'44'; ctx.fill(); return;
      }
      let angle=-Math.PI/2;
      segs.forEach(seg=>{
        const slice=(seg.val/total)*Math.PI*2;
        if (!isFinite(slice)) return;
        ctx.beginPath(); ctx.moveTo(cx,cy); ctx.arc(cx,cy,rr,angle,angle+slice); ctx.closePath();
        ctx.fillStyle=seg.col; ctx.fill();
        angle+=slice;
      });
      ctx.beginPath(); ctx.arc(cx,cy,rr,0,Math.PI*2);
      ctx.strokeStyle='rgba(255,255,255,0.55)'; ctx.lineWidth=2.5; ctx.stroke();
    }

    function drawLabel(bbl, isHov, scale) {
      const {cx,cy,r,name,total,wr} = bbl;
      const rr=_safeR(r*scale);
      ctx.save();
      if (isHov) {
        ctx.beginPath(); ctx.arc(cx,cy,rr+5,0,Math.PI*2);
        ctx.strokeStyle='rgba(0,0,0,0.3)'; ctx.lineWidth=2.5; ctx.stroke();
        // 글로우
        ctx.shadowColor=bbl.color; ctx.shadowBlur=14;
        ctx.beginPath(); ctx.arc(cx,cy,rr,0,Math.PI*2);
        ctx.strokeStyle=bbl.color+'88'; ctx.lineWidth=2; ctx.stroke();
        ctx.shadowBlur=0;
      }
      const fs=Math.max(9,Math.min(12,rr*0.28));
      const shortName=name.length>5?name.slice(0,5)+'…':name;
      ctx.font=\`bold \${fs}px sans-serif\`; ctx.textAlign='center';
      ctx.fillStyle=TEXT2_COL;
      ctx.fillText(shortName,cx,cy+rr+fs+2);
      ctx.font=\`900 \${Math.max(10,Math.min(16,rr*0.38))}px sans-serif\`;
      ctx.fillStyle='#fff'; ctx.shadowColor='rgba(0,0,0,0.4)'; ctx.shadowBlur=3;
      ctx.fillText(total,cx,cy+(wr!==null?-4:4));
      ctx.shadowBlur=0;
      if (wr!==null && rr>22) {
        ctx.font=\`700 \${Math.max(8,Math.min(11,rr*0.26))}px sans-serif\`;
        ctx.fillStyle='rgba(255,255,255,0.85)';
        ctx.fillText(wr+'%',cx,cy+10);
      }
      ctx.restore();
    }

    function draw(progress) {
      if (!bubbles.length) return;
      const sc = easeOut(Math.min(progress||1, 1));
      ctx.clearRect(0,0,canvas.width,canvas.height);
      bubbles.forEach((b,i)=>{ drawPie(b,sc); drawLabel(b,i===hovIdx,sc); });
    }

    function startAnim() {
      if(animId) cancelAnimationFrame(animId);
      animProgress=0;
      const start=performance.now(), dur=420;
      function step(now){
        animProgress=Math.min((now-start)/dur,1);
        draw(animProgress);
        if(animProgress<1) animId=requestAnimationFrame(step);
      }
      animId=requestAnimationFrame(step);
    }

    function showTooltip(b, mx, my) {
      const pct=n=>b.total>0?Math.round(n/b.total*100):0;
      const wrCol=b.wr===null?'#94a3b8':b.wr>=60?'#10b981':b.wr>=40?'#f59e0b':'#ef4444';
      const logoSrc = b.icon ? (typeof toHttpsUrl==='function'?toHttpsUrl(b.icon):b.icon) : '';
      const logoHtml = logoSrc
        ? \`<div style="width:36px;height:36px;flex-shrink:0;display:flex;align-items:center;justify-content:center"><img src="\${logoSrc}" style="width:100%;height:100%;object-fit:contain;filter:drop-shadow(0 2px 5px \${b.color}55)" onerror="this.parentNode.style.display='none'"></div>\`
        : \`<div style="width:36px;height:36px;flex-shrink:0;border-radius:11px;background:linear-gradient(160deg,\${b.color},\${b.color}aa);display:flex;align-items:center;justify-content:center;font-size:15px;box-shadow:0 4px 10px \${b.color}40">🌐</div>\`;
      ttip.innerHTML=\`
        <div style="display:flex;align-items:center;gap:9px;margin-bottom:10px">
          \${logoHtml}
          <div style="min-width:0;flex:1">
            <div style="font-weight:900;font-size:var(--fs-md);color:\${b.color};white-space:nowrap;overflow:hidden;text-overflow:ellipsis">\${b.name}</div>
            \${b.topTier?'<span style="display:inline-flex;margin-top:2px;padding:1px 7px;border-radius:999px;background:'+b.topTierCol+';color:'+b.topTierTc+';font-size:9px;font-weight:900">TOP '+b.topTier+'</span>':''}
          </div>
        </div>
        <div style="display:flex;gap:5px">
          <div style="flex:1;min-width:0;text-align:center;padding:6px 3px;border-radius:10px;background:\${b.color}14">
            <div style="font-size:13px;font-weight:900;color:\${b.color}">\${b.total}</div>
            <div style="font-size:9px;font-weight:700;color:var(--text3);white-space:nowrap">총원</div>
          </div>
          <div style="flex:1;min-width:0;text-align:center;padding:6px 3px;border-radius:10px;background:#fff7ed">
            <div style="font-size:13px;font-weight:900;color:#c2410c">\${b.weekActive}</div>
            <div style="font-size:9px;font-weight:700;color:#c2410c;white-space:nowrap">활성</div>
          </div>
          \${b.wr!==null?'<div style="flex:1;min-width:0;text-align:center;padding:6px 3px;border-radius:10px;background:'+wrCol+'16"><div style="font-size:13px;font-weight:900;color:'+wrCol+'">'+b.wr+'%</div><div style="font-size:9px;font-weight:700;color:'+wrCol+';white-space:nowrap">승률</div></div>':''}
        </div>
        \${b.wr!==null?'<div style="font-size:10px;color:var(--text3);text-align:center;font-weight:700;margin-top:6px">'+b.wins+'승 '+b.losses+'패</div>':''}
        <div style="font-size:9px;color:#94a3b8;font-weight:700;text-align:center;margin-top:8px;padding-top:7px;border-top:1px dashed var(--border2)">클릭(탭) → 상세 정보</div>
      \`;
      const wrap=canvas.parentElement.getBoundingClientRect();
      let left=mx+14,top=my+14;
      if(left+230>wrap.width)left=mx-240;
      if(top+180>wrap.height)top=my-180;
      ttip.style.left=left+'px'; ttip.style.top=top+'px'; ttip.style.opacity='1'; ttip.style.transform='translateY(0)';
    }
    function hideTooltip(){ ttip.style.opacity='0'; ttip.style.transform='translateY(4px)'; }

    function memberCardsHTML(univName, color) {
      try{
        const escH = (typeof escHTML==='function')?escHTML:function(s){return String(s||'');};
        const escA = (typeof escAttr==='function')?escAttr:function(s){return String(s||'');};
        const members = (Array.isArray(window.players)?window.players:[]).filter(function(p){
          const pu=String((p&&p.univ)||'').trim();
          return pu===univName && !(p&&(p.hidden||p.retired||p.hideFromBoard)) && !(typeof _b2HasRole==='function'&&_b2HasRole(p));
        });
        if(!members.length) return '';
        members.sort(function(a,b){ return String(a&&a.name||'').localeCompare(String(b&&b.name||''),'ko',{sensitivity:'base'}); });
        let html = '<div style="font-size:var(--fs-sm);font-weight:700;color:#94a3b8;margin:14px 0 8px">소속 인원 ('+members.length+'명)</div>';
        html += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(72px,1fr));gap:8px">';
        members.forEach(function(p){
          const rIco=p&&p.race==='P'?'🔮':p&&p.race==='T'?'⚔️':p&&p.race==='Z'?'🦎':'';
          const isGif=p&&p.photo?/\\.gif(\\?|$)/i.test(String(p.photo)):false;
          const rawPhoto=p&&p.photo?(isGif?(typeof toHttpsUrl==='function'?toHttpsUrl(p.photo):p.photo):(typeof toThumbUrl==='function'?toThumbUrl(p.photo,72):p.photo)):'';
          const rawPhotoOrig=p&&p.photo?(typeof toHttpsUrl==='function'?toHttpsUrl(p.photo):p.photo):'';
          const safePhoto=rawPhoto?escA(rawPhoto):'';
          const safePhotoOrig=rawPhotoOrig?escA(rawPhotoOrig):'';
          const initials=String(p&&p.name||'?').slice(0,1);
          const tCol=(typeof getTierBtnColor==='function'&&p&&p.tier)?getTierBtnColor(p.tier):'#64748b';
          const tTxt=(typeof getTierBtnTextColor==='function'&&p&&p.tier)?(getTierBtnTextColor(p.tier)||'#fff'):'#fff';
          const safeNameAttr=escA(p&&p.name||'');
          const _2ndBbl=(typeof _phSwap2ndHTML==='function')?_phSwap2ndHTML(p&&p.secondProfileFile,{style:'border-radius:inherit'}):'';
          html += '<div class="${uid}-pcard" style="border-color:'+color+'55" onclick="openPlayerModal(\\''+safeNameAttr.replace(/'/g,"\\\\'")+'\\')">';
          if (safePhoto) {
            html += '<span class="'+(_2ndBbl?'ph-swap':'')+'" style="position:relative;display:block">'
              + '<img class="${uid}-pcard-photo" src="'+safePhoto+'" data-orig="'+safePhotoOrig+'" onerror="if(this.dataset.orig&&this.src!==this.dataset.orig){this.src=this.dataset.orig;}else{this.style.display=\\'none\\';this.nextSibling.style.display=\\'flex\\'}">'
              + '<div class="${uid}-pcard-avatar" style="display:none;background:linear-gradient(160deg,'+color+'44,'+color+'22);color:'+color+'">'+escH(initials)+'</div>'
              + _2ndBbl + '</span>';
          } else {
            html += '<div class="${uid}-pcard-avatar" style="background:linear-gradient(160deg,'+color+'44,'+color+'22);color:'+color+'">'+escH(initials)+'</div>';
          }
          html += '<div class="${uid}-pcard-info">';
          if (p&&p.tier) html += '<span style="font-size:8px;font-weight:900;background:'+tCol+';color:'+tTxt+';border-radius:4px;padding:1px 4px;margin-bottom:1px">'+escH(p.tier)+'</span>';
          html += '<div class="${uid}-pcard-name">'+(rIco?'<span>'+rIco+'</span> ':'')+escH(p&&p.name||'')+'</div>';
          html += '</div></div>';
        });
        html += '</div>';
        return html;
      }catch(e){ return ''; }
    }

    function showPopup(b) {
      const pct=n=>b.total>0?Math.round(n/b.total*100):0;
      const wrCol=b.wr===null?'#94a3b8':b.wr>=60?'#10b981':b.wr>=40?'#f59e0b':'#ef4444';
      const iconSrc=b.icon?(typeof toHttpsUrl==='function'?toHttpsUrl(b.icon):b.icon):'';
      const iconHtml=iconSrc
        ? '<div style="position:relative;width:60px;height:60px;flex-shrink:0;display:flex;align-items:center;justify-content:center;overflow:visible"><img src="'+iconSrc+'" alt="" style="width:100%;height:100%;object-fit:contain;filter:drop-shadow(0 4px 10px '+b.color+'55)" onerror="this.parentNode.style.background=\\'linear-gradient(160deg,'+b.color+','+b.color+'aa)\\';this.parentNode.style.borderRadius=\\'16px\\';this.parentNode.style.boxShadow=\\'0 6px 14px '+b.color+'40\\';this.parentNode.innerHTML=\\'🌐\\';this.parentNode.style.fontSize=\\'22px\\'"></div>'
        : '<div style="position:relative;width:60px;height:60px;border-radius:16px;flex-shrink:0;background:linear-gradient(160deg,'+b.color+','+b.color+'aa);display:flex;align-items:center;justify-content:center;font-size:24px;box-shadow:0 6px 14px '+b.color+'40, inset 0 1px 0 rgba(255,255,255,.3)">🌐</div>';
      popBody.innerHTML=\`
        <div style="display:flex;align-items:center;gap:12px;padding:15px 16px;margin-bottom:14px;border-radius:18px;background:linear-gradient(135deg,\${b.color}2e,\${b.color}0a);border:1px solid \${b.color}33;position:relative;overflow:hidden;box-shadow:0 4px 18px \${b.color}1a">
          <div style="position:absolute;top:-30px;right:-30px;width:100px;height:100px;border-radius:50%;background:\${b.color}1c;pointer-events:none"></div>
          <div style="position:absolute;bottom:-34px;left:30%;width:80px;height:80px;border-radius:50%;background:\${b.color}12;pointer-events:none"></div>
          \${iconHtml}
          <div style="position:relative;min-width:0;flex:1">
            <div style="font-size:var(--fs-lg);font-weight:900;color:var(--text1);line-height:1.25;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">\${b.name}</div>
            <div style="display:inline-flex;align-items:center;gap:4px;font-size:var(--fs-caption);font-weight:800;color:\${b.color};margin-top:3px;padding:2px 8px 2px 2px;border-radius:20px;background:rgba(255,255,255,.5)"><span style="width:6px;height:6px;border-radius:50%;background:\${b.color};display:inline-block"></span>총 \${b.total}명 소속</div>
          </div>
          \${b.topTier?'<div title="대학 내 가장 높은 티어의 선수" style="position:relative;flex-shrink:0;display:flex;flex-direction:column;align-items:center;gap:1px;padding:7px 10px;border-radius:12px;background:'+b.topTierCol+';box-shadow:0 5px 14px '+b.topTierCol+'55, inset 0 1px 0 rgba(255,255,255,.35)">'
            +'<span style="font-size:8px;font-weight:900;color:'+b.topTierTc+';opacity:.85;white-space:nowrap;line-height:1.2">최상위티어</span>'
            +'<span style="font-size:14px;font-weight:900;color:'+b.topTierTc+';white-space:nowrap;line-height:1.2">'+b.topTier+'</span></div>':''}
        </div>
        <div style="display:flex;gap:7px;margin-bottom:16px">
          <div style="flex:1;min-width:0;text-align:center;padding:10px 3px;border-radius:14px;background:var(--surface);border:1px solid var(--border2);transition:transform .15s">
            <div style="font-size:17px;font-weight:900;color:var(--text1)">\${b.total}</div>
            <div style="font-size:9px;font-weight:700;color:#94a3b8;margin-top:1px;white-space:nowrap">총 인원</div>
          </div>
          <div style="flex:1;min-width:0;text-align:center;padding:10px 3px;border-radius:14px;background:#fff7ed;border:1px solid #fed7aa55">
            <div style="font-size:17px;font-weight:900;color:#c2410c">\${b.weekActive}</div>
            <div style="font-size:9px;font-weight:700;color:#c2410c;margin-top:1px;white-space:nowrap">주간활동</div>
          </div>
          \${b.wr!==null?'<div style="flex:1;min-width:0;text-align:center;padding:10px 3px;border-radius:14px;background:'+wrCol+'16;border:1px solid '+wrCol+'30"><div style="font-size:17px;font-weight:900;color:'+wrCol+'">'+b.wr+'%</div><div style="font-size:9px;font-weight:700;color:'+wrCol+';margin-top:1px;white-space:nowrap">승률</div></div>':''}
          <div style="flex:1;min-width:0;text-align:center;padding:10px 3px;border-radius:14px;background:#eff6ff;border:1px solid #bfdbfe55">
            <div style="font-size:13px;font-weight:900;color:#2563eb;white-space:nowrap">\${b.wins}승\${b.losses}패</div>
            <div style="font-size:9px;font-weight:700;color:#2563eb;margin-top:1px;white-space:nowrap">통산전적</div>
          </div>
        </div>
        <div style="font-size:var(--fs-sm);font-weight:700;color:#94a3b8;margin-bottom:6px">종족 구성</div>
        \${[['🔮','프로토스','#7c3aed',b.P],['⚔️','테란','#0284c7',b.T],['🦎','저그','#059669',b.Z]].filter(function(r){return r[3]>0;}).map(function(r){var ico=r[0],lbl=r[1],col=r[2],n=r[3];return '<div style="display:flex;align-items:center;gap:8px;margin-bottom:7px"><span>'+ico+'</span><span style="font-size:var(--fs-sm);font-weight:700;min-width:52px;color:'+col+'">'+lbl+'</span><div style="flex:1;height:9px;border-radius:6px;background:#f1f5f9;overflow:hidden;box-shadow:inset 0 1px 2px rgba(0,0,0,.04)"><div style="width:'+pct(n)+'%;height:100%;background:linear-gradient(90deg,'+col+'cc,'+col+');border-radius:6px;transition:width .3s ease"></div></div><span style="font-size:var(--fs-sm);font-weight:900;color:'+col+';white-space:nowrap">'+n+'명 ('+pct(n)+'%)</span></div>';}).join('')}
        \${memberCardsHTML(b.name, b.color)}
      \`;
      popup.classList.add('show');
    }

    function findBubble(mx,my){ return bubbles.findIndex(b=>{ const dx=mx-b.cx,dy=my-b.cy; return Math.sqrt(dx*dx+dy*dy)<b.r+6; }); }

    canvas.addEventListener('mousemove',e=>{
      const rect=canvas.getBoundingClientRect();
      const scX=canvas.width/devicePixelRatio/rect.width, scY=canvas.height/devicePixelRatio/rect.height;
      const mx=(e.clientX-rect.left)*scX, my=(e.clientY-rect.top)*scY;
      const idx=findBubble(mx,my);
      if(idx!==hovIdx){ hovIdx=idx; if(animProgress>=1)draw(1); }
      if(idx>=0){ showTooltip(bubbles[idx],e.clientX-rect.left,e.clientY-rect.top); canvas.style.cursor='pointer'; }
      else { hideTooltip(); canvas.style.cursor='default'; }
    });
    canvas.addEventListener('mouseleave',()=>{ hovIdx=-1; if(animProgress>=1)draw(1); hideTooltip(); });
    canvas.addEventListener('click',e=>{
      const rect=canvas.getBoundingClientRect();
      const mx=(e.clientX-rect.left)*(canvas.width/devicePixelRatio/rect.width);
      const my=(e.clientY-rect.top)*(canvas.height/devicePixelRatio/rect.height);
      const idx=findBubble(mx,my);
      if(idx>=0){ hideTooltip(); showPopup(bubbles[idx]); }
    });

    // 모바일 터치: 1차 탭=툴팁, 같은 버블 2차 탭=상세 팝업
    canvas.addEventListener('touchstart', e=>{
      if (e.touches.length!==1) return;
      const t=e.touches[0];
      const rect=canvas.getBoundingClientRect();
      const scX=canvas.width/devicePixelRatio/rect.width, scY=canvas.height/devicePixelRatio/rect.height;
      const mx=(t.clientX-rect.left)*scX, my=(t.clientY-rect.top)*scY;
      const idx=findBubble(mx,my);
      if(idx<0){ hideTooltip(); if(hovIdx!==-1){hovIdx=-1; if(animProgress>=1)draw(1);} touchIdx=-1; return; }
      e.preventDefault();
      if(idx===touchIdx){
        hideTooltip(); showPopup(bubbles[idx]);
        touchIdx=-1; hovIdx=-1; if(animProgress>=1)draw(1);
      } else {
        touchIdx=idx; hovIdx=idx; if(animProgress>=1)draw(1);
        showTooltip(bubbles[idx], t.clientX-rect.left, t.clientY-rect.top);
      }
    }, {passive:false});
    document.addEventListener('touchstart', e=>{
      if (canvas && !canvas.contains(e.target)) { hideTooltip(); touchIdx=-1; if(hovIdx!==-1){hovIdx=-1; if(animProgress>=1)draw(1);} }
    }, {passive:true});

    window['_${uid}setSort']=function(key,btn){
      sortKey=key;
      document.querySelectorAll('.${uid}-sort-btn').forEach(b=>b.classList.remove('on'));
      btn.classList.add('on');
      hovIdx=-1; touchIdx=-1; bubbles=layout(); startAnim();
    };

    window['_${uid}setPie']=function(mode,btn){
      pieMode=mode;
      document.querySelectorAll('.${uid}-pie-btn').forEach(b=>b.classList.remove('on'));
      btn.classList.add('on');
      if (descEl) descEl.textContent = mode==='tier' ? '버블 크기 = 인원 · 파이 = 티어 비율' : '버블 크기 = 인원 · 파이 = 종족 비율';
      buildLegend();
      if(animProgress>=1) draw(1); else draw(animProgress);
    };

    function buildLegend(){
      let html = '';
      if (pieMode === 'tier') {
        html += '<span style="font-size:var(--fs-caption);font-weight:700;color:var(--text3)">파이 색상 = 소속 티어 (각 대학 상세 배지 색과 동일)</span>';
      } else {
        html += '<span style="font-size:var(--fs-caption);font-weight:700;color:var(--text3)">종족 범례:</span>' +
          [['#7c3aed','🔮 프로토스'],['#0284c7','⚔️ 테란'],['#059669','🦎 저그'],['#94a3b8','❓ 미정']].map(function(r){var c=r[0],l=r[1];return '<span style="display:flex;align-items:center;gap:4px;font-size:var(--fs-caption);font-weight:700;color:#334155"><span style="width:10px;height:10px;border-radius:50%;background:'+c+';display:inline-block"></span>'+l+'</span>';}).join('');
      }
      html += '<span style="display:flex;align-items:center;gap:5px;font-size:var(--fs-caption);color:var(--text3);margin-left:10px">' +
        '버블 크기:' +
        '<span class="${uid}-sizeleg-dot" style="width:8px;height:8px"></span>적음' +
        '<span class="${uid}-sizeleg-dot" style="width:18px;height:18px"></span>많음' +
        '</span>';
      html += '<span style="font-size:var(--fs-caption);color:var(--text3);margin-left:6px">버블 안 숫자 = 인원 · % = 승률</span>';
      legendEl.innerHTML = html;
    }

    function tryInit(attempt){
      const w=canvas.parentElement?canvas.parentElement.offsetWidth:0;
      if(w>0){ bubbles=layout(); buildLegend(); startAnim(); }
      else if(attempt<15){ requestAnimationFrame(()=>tryInit(attempt+1)); }
      else { setTimeout(()=>{ bubbles=layout(); buildLegend(); startAnim(); },200); }
    }
    let resizeTimer;
    const ro=new ResizeObserver(()=>{ clearTimeout(resizeTimer); resizeTimer=setTimeout(()=>{ ctx.setTransform(1,0,0,1,0,0); bubbles=layout(); draw(1); },120); });
    ro.observe(canvas.parentElement);
    requestAnimationFrame(()=>tryInit(0));
  })();
  </script>`;
}
