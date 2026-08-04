/* ══════════════════════════════════════════════════════════════
   선수(전체) - 갤러리/심플 뷰 빌더 (players-streamer-views.js 에서 분리, 2026-07-30)
   ══════════════════════════════════════════════════════════════ */

function _buildGalleryView(rankMap){
  const _pl = (typeof players !== 'undefined' && Array.isArray(players)) ? players : null;
  const _getUnivs = (typeof getAllUnivs === 'function') ? getAllUnivs : null;
  if(!_pl || !_getUnivs){
    const msg = (typeof players === 'undefined')
      ? '데이터 로딩 중...'
      : '스트리머 데이터를 불러올 수 없습니다.';
    return `<div class="empty-state"><div class="empty-state-icon">⏳</div><div class="empty-state-title">${msg}</div><div class="empty-state-desc">새로고침 후 다시 시도해주세요.</div></div>`;
  }
  const RACE_CLR={T:'#2563eb',Z:'#7c3aed',P:'#c2410c',N:'#64748b'};
  let html='<div class="streamer-gallery-grid">';
  let anyShown=false;
  let _gRowIdx=0;
  const _galleryPhotoUrls = [];
  const _univScActiveMap = new Map();
  for(const p of _pl){
    if(!p || p.retired) continue;
    const u = p.univ;
    if(!u) continue;
    const arr = _univScActiveMap.get(u);
    if(arr) arr.push(p);
    else _univScActiveMap.set(u, [p]);
  }
  const _ggFallbackTextPos = localStorage.getItem('su_univ_header_text_pos') || 'right';
  const _ggFallbackGradMode = localStorage.getItem('su_univ_header_gradient') || 'left-to-right';
  const _ggFallbackGradLen = localStorage.getItem('su_univ_header_gradient_length') || '70';
  const _ggFallbackGradColor = localStorage.getItem('su_univ_header_gradient_color') || '#ffffff';
  _getUnivs().filter(u=>isLoggedIn||!u.hidden).forEach(u=>{
    if(totalUnivFilter && u.name!==totalUnivFilter) return;
    let up=_univScActiveMap.get(u.name) || [];
    if(totalRaceFilter!=='전체') up=up.filter(p=>p.race===totalRaceFilter);
    if(totalGenderFilter!=='전체') up=up.filter(p=>p.gender===totalGenderFilter);
    if(totalHideNoRecord) up=up.filter(p=>(Number(p.win||0)+Number(p.loss||0))>0);
    if(!up.length) return;
    anyShown=true;
    const sorted=[...up].sort((a,b)=>getRoleOrder(a.role,a)-getRoleOrder(b.role,b)||TIERS.indexOf(a.tier)-TIERS.indexOf(b.tier)||(b.points||0)-(a.points||0));
    // 대학 헤더: 대학별 설정 적용
    const _gHdrBgImg = u.streamerHeaderBgImg || '';
    const _gHdrBgSize = u.streamerHeaderBgSize || 'cover';
    const _gHdrBgPos = u.streamerHeaderBgPos || 'center center';
    const _gHdrBgOpacity = Math.max(0, Math.min(100, parseInt(u.streamerHeaderBgOpacity, 10) || 30)) / 100;
    const _gHdrGradient = u.streamerHeaderGradient || '';
    const _gHdrText = u.streamerHeaderText || '';
    const _gHdrTextSize = u.streamerHeaderTextSize || '12';
    const _gHdrTextColor = u.streamerHeaderTextColor || 'rgba(255,255,255,0.85)';
    const _gHdrTextPos = u.streamerHeaderTextPos || _ggFallbackTextPos;
    // 그라데이션 스타일 결정
    let _gGradientStyle = '';
    if (_gHdrGradient || (!_gHdrBgImg && !_gHdrGradient)) {
      const gMode = _gHdrGradient || _ggFallbackGradMode;
      // 대학별 설정 우선, 없으면 전역 설정 사용
      const gLen = Math.max(20, Math.min(100, parseInt(u.streamerHeaderGradientLen || _ggFallbackGradLen, 10) || 70));
      const gColorRaw = u.streamerHeaderGradientColor || _ggFallbackGradColor;
      const gColor = (gColorRaw && gColorRaw !== '#ffffff') ? gColorRaw : (u.color || '#6366f1');
      const gMix = `${gColor} ${gLen}%, transparent`;
      switch(gMode){
        case 'solid':
          _gGradientStyle = u.color || '#6366f1';
          break;
        case 'left-to-right':
          _gGradientStyle = `linear-gradient(90deg, ${u.color || '#6366f1'}, color-mix(in srgb, ${gMix}))`;
          break;
        case 'left-to-both':
          _gGradientStyle = `linear-gradient(90deg, ${u.color || '#6366f1'} 0%, ${u.color || '#6366f1'} ${Math.round(gLen/2)}%, color-mix(in srgb, ${u.color || '#6366f1'} ${gLen}%, transparent) 100%)`;
          break;
        case 'top-to-bottom':
          _gGradientStyle = `linear-gradient(180deg, ${u.color || '#6366f1'}, color-mix(in srgb, ${gMix}))`;
          break;
        case 'both-to-center':
          _gGradientStyle = `linear-gradient(90deg, color-mix(in srgb, ${u.color || '#6366f1'} ${Math.round(100-gLen)}%, transparent) 0%, ${u.color || '#6366f1'} 50%, color-mix(in srgb, ${u.color || '#6366f1'} ${Math.round(100-gLen)}%, transparent) 100%)`;
          break;
        default:
          _gGradientStyle = `linear-gradient(90deg, ${u.color || '#6366f1'}, color-mix(in srgb, ${gMix}))`;
      }
    }
    // 배경 이미지가 있으면 그라데이션과 함께 적용
    let _gFinalBgStyle = _gGradientStyle || (u.color || '#6366f1');
    let _gFinalBgSize = 'auto';
    let _gFinalBgPos = 'center center';
    if (_gHdrBgImg) {
      // 이미지가 있으면 그라데이션 위에 이미지 오버레이 (오버레이 블렌딩 사용)
      _gFinalBgStyle = `linear-gradient(rgba(0,0,0,${1 - _gHdrBgOpacity}), rgba(0,0,0,${1 - _gHdrBgOpacity})), url('${_gHdrBgImg.replace(/'/g, "\\'")}'), ${_gGradientStyle || (u.color || '#6366f1')}`;
      _gFinalBgSize = `${_gHdrBgSize}, ${_gHdrBgSize}, auto`;
      _gFinalBgPos = `${_gHdrBgPos}, ${_gHdrBgPos}, center center`;
    }
    // 텍스트 위치에 따른 스타일 결정
    let _gTextHtml = '';
    if (_gHdrText) {
      const _gTextBaseStyle = `font-size:${_gHdrTextSize}px;color:${_gHdrTextColor};font-weight:900;white-space:nowrap;`;
      if (_gHdrTextPos === 'left') {
        _gTextHtml = `<span style="${_gTextBaseStyle}margin-right:8px;">${_gHdrText}</span>`;
      } else if (_gHdrTextPos === 'center') {
        _gTextHtml = `<span style="${_gTextBaseStyle}position:absolute;left:50%;transform:translateX(-50%);">${_gHdrText}</span>`;
      } else {
        // right (default)
        _gTextHtml = `<span style="${_gTextBaseStyle}margin-left:auto;">${_gHdrText}</span>`;
      }
    }
    const _uSafe=(typeof escJS==='function') ? escJS(u.name||'') : String(u.name||'').replace(/\\/g,'\\\\').replace(/'/g,"\\'").replace(/\r/g,'\\r').replace(/\n/g,'\\n');
    html+=`<div class="streamer-gallery-head" data-gallery-univ-header="${u.name}" style="background:${_gFinalBgStyle};background-size:${_gFinalBgSize};background-position:${_gFinalBgPos};background-repeat:no-repeat;margin-top:6px;">
      ${_gHdrTextPos === 'left' ? _gTextHtml : ''}
      <span class="ubadge streamer-gallery-univ clickable-univ" data-icon-done="1" onclick="event.stopPropagation();openUnivModal('${_uSafe}')" style="color:#fff;display:inline-flex;align-items:center;gap:4px;font-size:var(--fs-sm)">${gUI(u.name,(typeof getUnivLogoSizeStr==='function'?getUnivLogoSizeStr(u.name,'players','20px'):'20px'))}${u.name}</span>
      ${_gHdrTextPos === 'center' ? _gTextHtml : ''}
      <span style="font-size:var(--fs-caption);color:rgba(255,255,255,.85);font-weight:700;position:relative;z-index:1">${up.length}명</span>
      ${_gHdrTextPos === 'right' ? _gTextHtml : ''}
    </div>`;
    sorted.forEach(p=>{
      const win = Number(p.win||0);
      const loss = Number(p.loss||0);
      const games = win + loss;
      const wr=games?Math.round(win/games*100):null;
      const points = Number(p.points||0);
      const elo = Number(p.elo||ELO_DEFAULT);
      const clr=RACE_CLR[p.race]||'#64748b';
      const _pSafe=(typeof escJS==='function') ? escJS(p.name) : (p.name||'').replace(/\\/g,'\\\\').replace(/'/g,"\\'").replace(/\r/g,'\\r').replace(/\n/g,'\\n');
      const _pAttr=(typeof escAttr==='function')
        ? escAttr(String(p.name||'').replace(/[\r\n]+/g,' '))
        : String(p.name||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/[\r\n]+/g,' ');
      const q=`${p.name||''} ${(p.univ||'')} ${(p.tier||'')} ${(p.role||'')}`.toLowerCase();
      const _uSafe=(typeof escJS==='function') ? escJS(u.name||'') : String(u.name||'').replace(/\\/g,'\\\\').replace(/'/g,"\\'").replace(/\r/g,'\\r').replace(/\n/g,'\\n');
      const actMeta = _getStreamerActivityMeta(p);
      let _gMvpStats=null;
      try{ _gMvpStats = (typeof _b2GetPlayerMvpStats==='function') ? _b2GetPlayerMvpStats(p.name) : null; }catch(e){}
      const _gHasMvp = !!(_gMvpStats && (_gMvpStats.weekCount||_gMvpStats.monthCount));
      const photoMap=(window.playerPhotos&&typeof window.playerPhotos==='object')?window.playerPhotos:{};
      const photoSrcRaw=(typeof p.photo==='string'&&p.photo.trim())?p.photo.trim():String(photoMap[p.name]||'').trim();
      const _posUse=(p.photoPosUse!==false);
      const _posX=Number(p.photoPosX), _posY=Number(p.photoPosY);
      const photoPos=(_posUse && Number.isFinite(_posX) && Number.isFinite(_posY)) ? `${_posX}% ${_posY}%` : 'top center';
      if(photoSrcRaw) _galleryPhotoUrls.push(photoSrcRaw);
      _gRowIdx++;
      const _gImgLoadAttr = _gRowIdx<=8 ? 'loading="eager" fetchpriority="high"' : 'loading="eager" fetchpriority="low"';
      html+=`<div class="streamer-gallery-card ${p.inactive?'inactive':''} ${p.retired?'retired':''} ${_isTpPlayerSelected(p.name)?'is-selected':''} ${(typeof p.secondProfileFile==='string'&&p.secondProfileFile.trim())?'ph-swap':''}" data-player-card="1" data-univ="${u.name}" data-q="${q.replace(/[\r\n]+/g,' ').replace(/"/g,'&quot;')}" data-r="${p.race||''}" data-g="${p.gender||''}"
        data-tp-action="open-player" data-tp-player="${_pAttr}"
        style="--card-accent:${clr};background:#0b1120;border-color:rgba(255,255,255,.14);backdrop-filter:blur(1px)"
        onmouseenter="try{if(typeof _prewarmPlayerModalImages==='function'){var _pp=window.players&&window.players.find(function(x){return x.name==='${_pSafe}'});if(_pp)_prewarmPlayerModalImages(_pp);}}catch(e){}">
        ${photoSrcRaw
          ? `<img ${_gImgLoadAttr} decoding="async" src="${toScaledUrl(photoSrcRaw,340)}" data-orig="${toHttpsUrl(photoSrcRaw)}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:${photoPos}" onerror="if(this.dataset.orig&&this.src!==this.dataset.orig){this.src=this.dataset.orig;}else{this.parentNode.querySelector('.gc-placeholder').style.display='flex';this.style.display='none';}">`
          : ''}
        ${(typeof p.secondProfileFile==='string'&&p.secondProfileFile.trim()&&typeof _phSwap2ndHTML==='function') ? _phSwap2ndHTML(p.secondProfileFile,{style:`object-position:${photoPos}`}) : ''}
        <div class="gc-placeholder" style="position:absolute;inset:0;display:${photoSrcRaw?'none':'flex'};align-items:center;justify-content:center;font-size:36px;font-weight:900;color:${clr};background:linear-gradient(160deg,${clr}28 0%,${clr}10 100%)">${p.race||'?'}</div>
        ${photoSrcRaw ? '' : '<div class="streamer-gallery-overlay"></div>'}
        <div class="streamer-gallery-bottom streamer-gallery-bottom--compact">
          <div class="streamer-gallery-topline">
            <div class="streamer-gallery-name" title="${p.name}">${p.name}${genderIcon(p.gender)}</div>
            ${getStatusIconHTML(p.name)}
          </div>
          <div class="streamer-gallery-brief">
            ${_gHasMvp ? `<span class="sg-pill" style="background:linear-gradient(135deg,#fef9c3,#fde68a);border-color:#fcd34d;color:#92400e;font-weight:900">🏆 MVP</span>` : ''}
            ${p.role ? `<span class="sg-pill">${p.role}</span>` : ''}
            <span class="sg-pill">${p.tier||'?'}티어</span>
            <span class="sg-pill">${p.race||'?'}</span>
            <span class="sg-pill" ${u.name&&u.name!=='무소속'?`onclick="event.stopPropagation();openUnivModal('${_uSafe}')"`:''}>${u.name || '무소속'}</span>
            ${p.inactive?'<span class="sg-pill" style="background:rgba(249,115,22,.18);border-color:rgba(249,115,22,.26)">휴학</span>':''}
            ${p.retired?'<span class="sg-pill" style="background:rgba(148,163,184,.18);border-color:rgba(148,163,184,.26)">은퇴</span>':''}
          </div>
          <div class="streamer-gallery-metrics">
            <span class="sg-metric">전적 ${games ? `${win}-${loss}` : '-'}</span>
            <span class="sg-dot">·</span>
            <span class="sg-metric">P ${pS(points)}</span>
            <span class="sg-dot">·</span>
            <span class="sg-metric">ELO ${elo}</span>
            ${wr==null?'':`<span class="sg-dot">·</span><span class="sg-metric" style="color:${wr>=50?'#86efac':'#fecaca'}">${wr}%</span>`}
          </div>
        </div>
      </div>`;
    });
  });
  if(!anyShown) html+=`<div style="grid-column:1/-1"><div class="empty-state"><div class="empty-state-icon">🔍</div><div class="empty-state-title">검색 결과가 없습니다</div></div></div>`;
  html+='</div>';
  try{ if(typeof prewarmImageUrls==='function') prewarmImageUrls(_galleryPhotoUrls, 30, 340, 'scaled'); }catch(e){}
  return html;
}

// 심플형 - 여백을 최소화한 한 줄 미니멀 리스트. 카드형(사진 중심)/상세형(분할 화면)/리스트형(다열 표)과
// 구분되는 네번째 보기 방식으로, 순위·프로필·이름·티어·승률만 한 줄에 압축해 빠르게 훑어볼 수 있도록 구성한다.
function _buildSimpleView(rankMap){
  const _pl = (typeof players !== 'undefined' && Array.isArray(players)) ? players : null;
  const _getUnivs = (typeof getAllUnivs === 'function') ? getAllUnivs : null;
  if(!_pl || !_getUnivs){
    const msg = (typeof players === 'undefined')
      ? '데이터 로딩 중...'
      : '스트리머 데이터를 불러올 수 없습니다.';
    return `<div class="empty-state"><div class="empty-state-icon">⏳</div><div class="empty-state-title">${msg}</div><div class="empty-state-desc">새로고침 후 다시 시도해주세요.</div></div>`;
  }
  const _simplePhotoUrls = [];
  const _univScMap = new Map();
  for(const p of _pl){
    if(!p || p.retired) continue;
    const u = p.univ;
    if(!u) continue;
    const arr = _univScMap.get(u);
    if(arr) arr.push(p);
    else _univScMap.set(u, [p]);
  }
  let html='<div class="streamer-simple-list">';
  let anyShown=false;
  let _sRowIdx=0;
  _getUnivs().filter(u=>isLoggedIn||!u.hidden).forEach(u=>{
    if(totalUnivFilter && u.name!==totalUnivFilter) return;
    let up=_univScMap.get(u.name) || [];
    if(totalRaceFilter!=='전체') up=up.filter(p=>p.race===totalRaceFilter);
    if(totalGenderFilter!=='전체') up=up.filter(p=>p.gender===totalGenderFilter);
    if(totalHideNoRecord) up=up.filter(p=>(Number(p.win||0)+Number(p.loss||0))>0);
    if(!up.length) return;
    anyShown=true;
    const sorted=[...up].sort((a,b)=>getRoleOrder(a.role,a)-getRoleOrder(b.role,b)||TIERS.indexOf(a.tier)-TIERS.indexOf(b.tier)||(b.points||0)-(a.points||0));
    const _uSafe=(typeof escJS==='function') ? escJS(u.name||'') : String(u.name||'').replace(/\\/g,'\\\\').replace(/'/g,"\\'").replace(/\r/g,'\\r').replace(/\n/g,'\\n');
    html+=`<div class="streamer-simple-head" data-simple-univ-header="${u.name}" style="--c:${u.color||'#6366f1'}">
      <span class="streamer-simple-univ clickable-univ" onclick="openUnivModal('${_uSafe}')">${gUI(u.name,(typeof getUnivLogoSizeStr==='function'?getUnivLogoSizeStr(u.name,'players','18px'):'18px'))}${u.name}</span>
      <span class="streamer-simple-univ-count">${up.length}명</span>
    </div>`;
    sorted.forEach(p=>{
      const win = Number(p.win||0);
      const loss = Number(p.loss||0);
      const games = win + loss;
      const wr = games?Math.round(win/games*100):null;
      const _pSafe=(typeof escJS==='function') ? escJS(p.name) : (p.name||'').replace(/\\/g,'\\\\').replace(/'/g,"\\'").replace(/\r/g,'\\r').replace(/\n/g,'\\n');
      const _pAttr=(typeof escAttr==='function')
        ? escAttr(String(p.name||'').replace(/[\r\n]+/g,' '))
        : String(p.name||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/[\r\n]+/g,' ');
      const q=`${p.name||''} ${(p.univ||'')} ${(p.tier||'')} ${(p.role||'')}`.toLowerCase();
      const photoSrcRaw=(typeof p.photo==='string'&&p.photo.trim())?p.photo.trim():'';
      if(photoSrcRaw) _simplePhotoUrls.push(photoSrcRaw);
      _sRowIdx++;
      const _sImgLoadAttr = _sRowIdx<=20 ? 'loading="eager" fetchpriority="high"' : 'loading="eager" fetchpriority="low"';
      const _wrIsHot = games>=5 && wr>=70;
      const _raceCode = p.race || 'N';
      const _tierColorRaw = (p.tier && typeof getTierBtnColor==='function') ? getTierBtnColor(p.tier) : '#8b5cf6';
      html+=`<div class="streamer-simple-row ${p.inactive?'inactive':''} ${p.retired?'retired':''}" data-simple-row="1" data-univ="${u.name}" data-q="${q.replace(/[\r\n]+/g,' ').replace(/"/g,'&quot;')}" data-r="${p.race||''}" data-g="${p.gender||''}" data-tp-action="open-player" data-tp-player="${_pAttr}" style="--c:${u.color||'#6366f1'};--i:${_sRowIdx}">
        <span class="streamer-simple-avatar-wrap">
          ${photoSrcRaw?`<span class="streamer-simple-avatar${(typeof p.secondProfileFile==='string'&&p.secondProfileFile.trim())?' ph-swap':''}"><img ${_sImgLoadAttr} decoding="async" src="${toThumbUrl(photoSrcRaw,56)}" data-orig="${toHttpsUrl(photoSrcRaw)}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;border-radius:inherit" onerror="if(this.dataset.orig&&this.src!==this.dataset.orig){this.src=this.dataset.orig;}else{this.style.display='none';this.parentNode.textContent='${p.race||'?'}';}">${(typeof p.secondProfileFile==='string'&&p.secondProfileFile.trim()&&typeof _phSwap2ndHTML==='function')?_phSwap2ndHTML(p.secondProfileFile,{style:'border-radius:inherit'}):''}</span>`:`<span class="streamer-simple-avatar">${p.race||'?'}</span>`}
        </span>
        <span class="streamer-simple-line">
          <span class="streamer-simple-left">
            ${p.role?`<span class="streamer-simple-role">${getRoleBadgeHTML(p.role,'9px')}</span>`:''}
            <span class="streamer-simple-name"><span class="streamer-simple-name-text clickable-name">${p.name}</span>${genderIcon(p.gender)}${p.retired?'<span class="streamer-simple-flag">은퇴</span>':''}${p.inactive?'<span class="streamer-simple-flag">휴학</span>':''}</span>
          </span>
          <span class="streamer-simple-mid">
            <span class="streamer-simple-race race-${_raceCode}">${_raceCode}</span>
            <span class="streamer-simple-tier" style="--tc:${_tierColorRaw}">${p.tier||'미정'}</span>
            <span class="streamer-simple-record">${games?`${win}승${loss}패`:'전적없음'}</span>
          </span>
        </span>
        <span class="streamer-simple-medal ${games?(wr>=50?'is-win':'is-lose'):'is-none'}">
          ${_wrIsHot?'<span class="streamer-simple-medal-hot">HOT</span>':''}
          <span class="streamer-simple-medal-label">승률</span>
          <span class="streamer-simple-medal-value">${games?`${wr}%`:'-'}</span>
        </span>
      </div>`;
    });
  });
  html+='</div>';
  if(!anyShown) html+=`<div class="empty-state"><div class="empty-state-icon">🔍</div><div class="empty-state-title">검색 결과가 없습니다</div><div class="empty-state-desc">다른 검색어나 필터를 사용해보세요</div></div>`;
  try{ if(typeof prewarmImageUrls==='function') prewarmImageUrls(_simplePhotoUrls, 60, 56); }catch(e){}
  return html;
}

// 상세형 - "사진+리스트형" 두번째 레이아웃 전용 스타일 (최초 1회만 주입)
;(function _injectFocusCardStyle(){
  if(typeof document==='undefined') return;
  if(document.getElementById('focus-card-detail-style')) return;
  const s=document.createElement('style');
  s.id='focus-card-detail-style';
  s.textContent=[
    '.streamer-focus-card2{display:flex;gap:0;border-radius:22px;overflow:hidden;background:var(--panel,#fff);border-top:1px solid rgba(148,163,184,.18);border-right:1px solid rgba(148,163,184,.18);border-bottom:1px solid rgba(148,163,184,.18);border-left:none;box-shadow:0 16px 32px rgba(15,23,42,.08);min-height:420px}',
    '.streamer-focus-card2-photo{position:relative;flex:0 0 42%;min-width:220px;overflow:hidden;background:#e2e8f0}',
    '.streamer-focus-card2-photo img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:top center}',
    '.streamer-focus-card2-photo .streamer-focus-photo-fallback{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:64px;font-weight:900;color:rgba(15,23,42,.28)}',
    '.streamer-focus-card2-info{flex:1;min-width:0;padding:22px 26px 18px;display:flex;flex-direction:column}',
    '.streamer-focus-card2-name{font-size:24px;font-weight:950;letter-spacing:-.02em;color:var(--text1);margin-bottom:8px}',
    '.streamer-focus-card2-row{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:9px 2px;border-bottom:1px dashed rgba(148,163,184,.38)}',
    '.streamer-focus-card2-row:last-child{border-bottom:none}',
    '.streamer-focus-card2-label{font-size:var(--fs-base);font-weight:700;color:var(--text3)}',
    '.streamer-focus-card2-value{font-size:var(--fs-md);font-weight:900;color:var(--text1);text-align:right}',
    '.streamer-focus-card2-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}',
    '.streamer-focus-card2-photo2{margin-top:10px;border-radius:22px;overflow:hidden;position:relative;width:100%;aspect-ratio:3/2;background:#e2e8f0;border-top:1px solid rgba(148,163,184,.18);border-right:1px solid rgba(148,163,184,.18);border-bottom:1px solid rgba(148,163,184,.18);border-left:none;box-shadow:0 16px 32px rgba(15,23,42,.08);transition:aspect-ratio .18s ease}',
    '.streamer-focus-card2-photo2 img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}',
    // 자동 맞춤 모드: 이미지를 두 겹으로 겹치지 않고, 박스 자체의 비율을 사진의 실제 비율에 맞춰 자동으로 조절 → 크롭도, 위치 지정도 필요 없음
    '.streamer-focus-card2-photo2.is-autofit{max-height:min(74vh,560px)}',
    '.streamer-focus-card2-photo2.is-autofit .sfc2p2-fg{object-fit:cover;object-position:center 22%}',
    // 수동 위치 모드도 자동 모드와 비슷한 크기감을 갖도록 최소 높이 확보 (전보다 작아 보이지 않게)
    '.streamer-focus-card2-photo2:not(.is-autofit){min-height:320px;max-height:min(64vh,520px)}',
    '@media (max-width:768px){.streamer-focus-card2{flex-direction:column;min-height:0}.streamer-focus-card2-photo{flex:0 0 auto;aspect-ratio:4/3;min-width:0;width:100%}.streamer-focus-card2-info{padding:16px 16px 14px}}',
    'body.dark .streamer-focus-card2{background:#0f172a;border-color:#334155}',
    'body.dark .streamer-focus-card2-row{border-color:#334155}',
    'body.dark .streamer-focus-card2-photo2{background:#1e293b;border-color:#334155}',
    // 이미지2 수동 위치 - 드래그로 직접 조정 (크로스헤어/가이드라인/뱃지)
    '.streamer-focus-card2-photo2.is-manual{cursor:grab;touch-action:none}',
    '.streamer-focus-card2-photo2.is-manual:active{cursor:grabbing}',
    '.sfp2-cross{position:absolute;width:18px;height:18px;border-radius:999px;border:2px solid rgba(255,255,255,.95);box-shadow:0 2px 10px rgba(0,0,0,.4),0 0 0 3px rgba(0,0,0,.15);transform:translate(-50%,-50%);pointer-events:none;z-index:3}',
    '.sfp2-gridline-v{position:absolute;top:0;bottom:0;width:1px;background:rgba(255,255,255,.45);pointer-events:none;z-index:2}',
    '.sfp2-gridline-h{position:absolute;left:0;right:0;height:1px;background:rgba(255,255,255,.45);pointer-events:none;z-index:2}',
    '.sfp2-badge{position:absolute;top:10px;left:10px;background:rgba(15,23,42,.72);color:#fff;font-size:var(--fs-caption);font-weight:800;padding:4px 9px;border-radius:999px;pointer-events:none;z-index:4;letter-spacing:.01em}',
    '.sfp2-hint{position:absolute;bottom:10px;right:12px;background:rgba(15,23,42,.55);color:#fff;font-size:10px;font-weight:700;padding:3px 8px;border-radius:999px;pointer-events:none;z-index:4}',
    // 사이드바 카드 - 이미지2 수동 위치 지정 여부 뱃지
    '.streamer-focus-card-pin{position:absolute;top:7px;left:7px;font-size:var(--fs-sm);line-height:1;background:rgba(15,23,42,.55);border-radius:999px;padding:3px 4px;z-index:2;filter:drop-shadow(0 1px 2px rgba(0,0,0,.4))}'
  ].join('');
  document.head.appendChild(s);
})();

// 심플형(4번째 보기) 및 리스트형 심플모드 전용 스타일 (최초 1회만 주입)
;(function _injectSimpleViewStyle(){
  if(typeof document==='undefined') return;
  if(document.getElementById('streamer-simple-style')) return;
  const s=document.createElement('style');
  s.id='streamer-simple-style';
  s.textContent=[
    // 심플형: 여백·장식·모션을 최소화한 담백한 한 줄 리스트. 그라디언트/그림자/회전 없이 정보 위주로 빠르게 훑을 수 있도록 구성
    '.streamer-simple-list{display:flex;flex-direction:column;gap:6px;font-family:inherit}',
    '.streamer-simple-head{display:flex;align-items:center;gap:8px;padding:6px 10px;margin-top:16px;border-radius:8px 8px 0 0;border-bottom:2px solid color-mix(in srgb, var(--c,#6366f1) 60%, transparent);background:linear-gradient(to right, color-mix(in srgb, var(--c,#6366f1) 78%, transparent) 0%, color-mix(in srgb, var(--c,#6366f1) 78%, transparent) 28%, color-mix(in srgb, var(--c,#6366f1) 34%, transparent) 62%, transparent 100%)}',
    '.streamer-simple-head:first-child{margin-top:0}',
    'body.dark .streamer-simple-head{background:linear-gradient(to right, color-mix(in srgb, var(--c,#6366f1) 84%, transparent) 0%, color-mix(in srgb, var(--c,#6366f1) 84%, transparent) 28%, color-mix(in srgb, var(--c,#6366f1) 40%, transparent) 62%, transparent 100%)}',
    '.streamer-simple-univ{display:inline-flex;align-items:center;gap:5px;font-size:var(--fs-base);font-weight:800;color:#fff;text-shadow:0 1px 3px rgba(0,0,0,.5),0 0 1px rgba(0,0,0,.3);cursor:pointer;letter-spacing:-.01em}',
    '.streamer-simple-univ-count{margin-left:auto;font-size:var(--fs-caption);font-weight:700;color:var(--text3)}',
    '.streamer-simple-row{display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:var(--r);border:1px solid rgba(148,163,184,.16);background:var(--panel,#fff);cursor:pointer;transition:background-color .12s ease,border-color .12s ease}',
    '@media (prefers-reduced-motion:reduce){.streamer-simple-row{transition:none}}',
    '.streamer-simple-row:hover{background:color-mix(in srgb, var(--c,#6366f1) 6%, var(--panel,#fff));border-color:color-mix(in srgb, var(--c,#6366f1) 30%, rgba(148,163,184,.16))}',
    '.streamer-simple-row.inactive{opacity:.6}',
    '.streamer-simple-row.retired{opacity:.5;filter:grayscale(.5)}',
    // 프로필 이미지: 설정탭에서 정한 모양(원형/둥근사각 등)은 그대로 따름. 장식 없는 단일 테두리만
    '.streamer-simple-avatar-wrap{position:relative;flex-shrink:0;line-height:0}',
    '.streamer-simple-avatar{width:40px;height:40px;border-radius:var(--su_profile_radius,50%);clip-path:var(--su_profile_clip,none);overflow:hidden;background:color-mix(in srgb, var(--c,#6366f1) 14%, #eef2ff);display:flex;align-items:center;justify-content:center;font-size:var(--fs-sm);font-weight:800;color:var(--c,#6366f1);position:relative;box-shadow:0 0 0 1.5px color-mix(in srgb, var(--c,#6366f1) 40%, transparent)}',
    '.streamer-simple-avatar img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;border-radius:inherit;clip-path:inherit}',
    // 직책+이름(좌측 고정폭 그룹) / 종족·티어·전적(중간 그룹, 남는 공간에 고르게 분산 배치)으로 분리.
    // 좌측 그룹의 폭을 이름 길이와 무관하게 항상 동일하게 고정해서(내용에 따라 늘어나지 않음),
    // 종족/티어/전적이 시작되는 위치가 카드마다 흔들리지 않고 항상 같은 자리에서 시작하도록 함
    '.streamer-simple-line{min-width:0;flex:1;display:flex;align-items:center;gap:10px;overflow-x:auto;scrollbar-width:none;-ms-overflow-style:none}',
    '.streamer-simple-line::-webkit-scrollbar{display:none}',
    '.streamer-simple-left{flex:0 0 160px;min-width:0;display:flex;align-items:center;gap:6px;overflow:hidden}',
    '.streamer-simple-mid{flex:1 1 auto;min-width:0;display:flex;align-items:center;justify-content:space-evenly;gap:6px}',
    '@media (max-width:768px){.streamer-simple-left{flex-basis:116px}}',
    '.streamer-simple-role{flex:0 0 auto;display:inline-flex}',
    // 이름: 어떤 상태에서도 효과 없이 항상 담백한 굵은 글씨로 표시
    '.streamer-simple-name{flex:0 1 auto;min-width:0;display:flex;align-items:center;gap:3px;overflow:hidden}',
    '.streamer-simple-name-text{font-size:13.5px;font-weight:800;letter-spacing:-.01em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;display:inline-block;max-width:100%;color:var(--text1)}',
    '.streamer-simple-flag{flex:0 0 auto;font-size:9px;font-weight:700;color:var(--text3);background:rgba(148,163,184,.16);border-radius:6px;padding:2px 6px}',
    '.streamer-simple-race{flex:0 0 auto;display:inline-flex;align-items:center;justify-content:center;min-width:20px;font-size:var(--fs-caption);font-weight:900;padding:3px 7px;border-radius:6px;white-space:nowrap;border:1px solid transparent}',
    '.streamer-simple-race.race-T{color:#1e40af;background:#dbe9ff;border-color:#b8d4ff}',
    '.streamer-simple-race.race-Z{color:#6b21a8;background:#ecdcff;border-color:#ddc2fb}',
    '.streamer-simple-race.race-P{color:#92400e;background:#fbe6b0;border-color:#f3d488}',
    '.streamer-simple-race.race-N{color:#475569;background:#e5e9ef;border-color:#cbd5e1}',
    'body.dark .streamer-simple-race.race-T{color:#93c5fd;background:rgba(59,130,246,.22);border-color:rgba(59,130,246,.3)}',
    'body.dark .streamer-simple-race.race-Z{color:#d8b4fe;background:rgba(168,85,247,.22);border-color:rgba(168,85,247,.3)}',
    'body.dark .streamer-simple-race.race-P{color:#fcd34d;background:rgba(245,158,11,.22);border-color:rgba(245,158,11,.3)}',
    'body.dark .streamer-simple-race.race-N{color:#cbd5e1;background:rgba(148,163,184,.2);border-color:rgba(148,163,184,.3)}',
    // 티어/전적: 담백한 플랫 칩이되, 테두리와 진한 배경으로 잘 보이도록
    '.streamer-simple-tier,.streamer-simple-record{flex:0 0 auto;display:inline-flex;align-items:center;font-size:var(--fs-caption);font-weight:900;white-space:nowrap;border-radius:6px;padding:3px 8px;border:1px solid transparent}',
    '.streamer-simple-tier{color:color-mix(in srgb, var(--tc,#8b5cf6) 88%, #000 10%);background:color-mix(in srgb, var(--tc,#8b5cf6) 22%, #fff);border-color:color-mix(in srgb, var(--tc,#8b5cf6) 45%, transparent)}',
    '.streamer-simple-record{color:var(--text2);background:rgba(148,163,184,.16);border-color:rgba(148,163,184,.3)}',
    'body.dark .streamer-simple-tier{color:color-mix(in srgb, var(--tc,#8b5cf6) 90%, #fff 35%);background:color-mix(in srgb, var(--tc,#8b5cf6) 30%, #0f172a);border-color:color-mix(in srgb, var(--tc,#8b5cf6) 50%, transparent)}',
    'body.dark .streamer-simple-record{color:var(--text2);background:rgba(255,255,255,.1);border-color:rgba(255,255,255,.14)}',
    // 승률: 다른 탭과 동일한 승패 색상(--win-col 빨강 / --lose-col 파랑)을 그대로 사용, 옅은 배경 칩으로 시인성 확보
    '.streamer-simple-medal{position:relative;flex-shrink:0;min-width:48px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:0;font-weight:900;text-align:center;padding:3px 6px;border-radius:8px}',
    '.streamer-simple-medal-label{font-size:8.5px;font-weight:700;letter-spacing:.02em;color:var(--text3)}',
    '.streamer-simple-medal-value{font-size:var(--fs-md);font-weight:900;line-height:1.2}',
    '.streamer-simple-medal-hot{position:absolute;top:-8px;right:-2px;font-size:8px;font-weight:800;letter-spacing:.02em;color:#f97316}',
    '.streamer-simple-medal.is-win{background:color-mix(in srgb, var(--win-col,#dc2626) 12%, transparent)}',
    '.streamer-simple-medal.is-win .streamer-simple-medal-value{color:var(--win-col,#dc2626)}',
    '.streamer-simple-medal.is-lose{background:color-mix(in srgb, var(--lose-col,#2563eb) 10%, transparent)}',
    '.streamer-simple-medal.is-lose .streamer-simple-medal-value{color:var(--lose-col,#2563eb)}',
    '.streamer-simple-medal.is-none .streamer-simple-medal-value{color:var(--gray-l)}',
    '@media (max-width:768px){.streamer-simple-row{gap:8px;padding:6px 8px}.streamer-simple-avatar{width:34px;height:34px}.streamer-simple-name-text{font-size:var(--fs-sm)}.streamer-simple-tier,.streamer-simple-record,.streamer-simple-race{font-size:9.5px;padding:2.5px 6px}.streamer-simple-medal{min-width:40px}.streamer-simple-medal-value{font-size:12.5px}.streamer-simple-medal-label{font-size:7px}}',
    'body.dark .streamer-simple-row{background:#0f172a;border-color:rgba(255,255,255,.08)}',
    'body.dark .streamer-simple-avatar{background:color-mix(in srgb, var(--c,#6366f1) 26%, #0f172a)}',
    'body.dark .streamer-simple-row:hover{background:color-mix(in srgb, var(--c,#6366f1) 10%, #0f172a)}'
  ].join('');
  document.head.appendChild(s);
})();

