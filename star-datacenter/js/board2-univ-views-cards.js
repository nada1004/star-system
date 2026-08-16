// board2-univ-views.js에서 분리됨 (프로필뷰 헬퍼 + 랭크/글래스/프레임/포토/기본/히트 카드 + 그룹카드 렌더) — 원본 라인 1852-2101

/* ══════════════════════════════════════
   대학 라인업 포스터 ("STARTING XI" 스타일)
══════════════════════════════════════ */
function _b2PastelBg(hex, ratio) {
  const { r, g, b } = (typeof _hexToRgbObj === 'function') ? _hexToRgbObj(hex) : { r: 100, g: 116, b: 139 };
  const t = (typeof ratio === 'number') ? ratio : 0.10;
  const isDark = (typeof document !== 'undefined') && (
    (document.body && document.body.classList && document.body.classList.contains('dark')) ||
    (document.documentElement && document.documentElement.classList && document.documentElement.classList.contains('dark'))
  );
  if (isDark) {
    // 다크모드: 흰색 대신 짙은 남색(#0f172a) 베이스로 혼합
    const base = { r: 15, g: 23, b: 42 };
    const mix = (bc, c) => Math.round(bc * (1 - t) + c * t);
    return `rgb(${mix(base.r, r)},${mix(base.g, g)},${mix(base.b, b)})`;
  }
  const mix = c => Math.round(255 * (1 - t) + c * t);
  return `rgb(${mix(r)},${mix(g)},${mix(b)})`;
}

function _b2GetUnivProfileViewMode() {
  try{
    const raw = String(localStorage.getItem('su_b2_univ_profile_view') || '').trim();
    if (raw === 'card') return 'poster';
    if (raw === 'compact' || raw === 'media' || raw === 'board' || raw === 'split') return 'rank';
    return ['default','poster','rank','glass','table'].includes(raw) ? raw : 'default';
  }catch(e){
    return 'default';
  }
}

function _b2SetUnivProfileViewMode(mode) {
  const nextMode = ['default','poster','rank','glass','table'].includes(String(mode||'')) ? String(mode) : 'default';
  try{ localStorage.setItem('su_b2_univ_profile_view', nextMode); }catch(e){}
  if (typeof render === 'function') render();
}

function _b2UnivRankRow(p, accentCol, showBadge, idx) {
  const safeName = (p.name||'').replace(/'/g,"\\'");
  const photo = p.photo ? toThumbUrl(p.photo,42) : '';
  const photoOrig = p.photo ? toHttpsUrl(p.photo) : '';
  const raceLetter = (p.race && p.race!=='N') ? p.race : '?';
  const raceCol = { T:'#2563eb', P:'#d97706', Z:'#7c3aed' }[p.race] || '#475569';
  const badgeTxt = showBadge ? (p.tier || p.role || '') : '';
  const badgeBg = (p.tier && typeof getTierBtnColor === 'function') ? getTierBtnColor(p.tier) : accentCol;
  const badgeFg = (p.tier && typeof getTierBtnTextColor === 'function') ? (getTierBtnTextColor(p.tier) || '#fff') : '#fff';
  const win = Number(p.win||0), loss = Number(p.loss||0), games = win+loss;
  const wr = games ? Math.round(win/games*100) : null;
  const wrCol = wr==null ? '#94a3b8' : (wr>=50 ? '#16a34a' : '#dc2626');
  const recordTxt = games ? `${win}승 ${loss}패` : '기록 없음';
  const shapeStyle = 'border-radius:var(--su_profile_radius,50%);clip-path:var(--su_profile_clip,none);';
  return `
    <div class="b2-univ-rank-row" style="display:flex;align-items:center;gap:12px;padding:9px 14px;border-radius:var(--r2);border:1px solid ${accentCol}22;background:linear-gradient(120deg,${accentCol}14 0%,${accentCol}05 100%);box-shadow:0 6px 16px rgba(15,23,42,.06);cursor:pointer;transition:transform .16s ease,box-shadow .16s ease,border-color .16s ease"
      onclick="_b2LineupCardHoverLeave();openPlayerModal('${safeName}')"
      onmouseenter="this.style.transform='translateX(3px)';this.style.boxShadow='0 10px 22px rgba(15,23,42,.14)';this.style.borderColor='${accentCol}55';_b2LineupCardHoverEnter(event,this,'${safeName}','${accentCol}')"
      onmouseleave="this.style.transform='';this.style.boxShadow='0 6px 16px rgba(15,23,42,.06)';this.style.borderColor='${accentCol}22';_b2LineupCardHoverLeave()">
      <div style="flex-shrink:0;width:20px;text-align:center;font-size:var(--fs-caption);font-weight:900;color:${accentCol};opacity:.75">${idx}</div>
      <div style="width:42px;height:42px;flex-shrink:0;${shapeStyle}overflow:hidden;border:2px solid ${accentCol}55;background:${accentCol}22;box-shadow:0 4px 10px ${accentCol}26">
        ${photo
          ? `<img src="${photo}" data-orig="${photoOrig}" crossorigin="anonymous" loading="lazy" decoding="async" style="width:100%;height:100%;object-fit:cover;object-position:top center" onerror="if(this.dataset.orig&&this.src!==this.dataset.orig){this.removeAttribute('crossorigin');this.src=this.dataset.orig;}else{this.style.display='none';this.nextElementSibling.style.display='flex'}"><div style="display:none;align-items:center;justify-content:center;width:100%;height:100%;font-size:14px;font-weight:1000;color:${accentCol}">${raceLetter}</div>`
          : `<div style="display:flex;align-items:center;justify-content:center;width:100%;height:100%;font-size:14px;font-weight:1000;color:${accentCol}">${raceLetter}</div>`
        }
      </div>
      <div style="min-width:0;flex:0 0 auto;width:112px">
        <div style="display:flex;align-items:center;gap:6px;min-width:0">
          <span style="font-size:var(--fs-base);font-weight:950;color:var(--text1);letter-spacing:-.02em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;${p.inactive?'opacity:.6':''}">${p.name||''}</span>
        </div>
        <div style="display:flex;align-items:center;gap:5px;margin-top:3px;flex-wrap:wrap">
          ${(p.race&&p.race!=='N')?`<span style="display:inline-flex;padding:1px 6px;border-radius:999px;background:${raceCol};color:#fff;font-size:9px;font-weight:900">${p.race}</span>`:''}
          ${badgeTxt?`<span style="display:inline-flex;padding:1px 6px;border-radius:999px;background:${badgeBg};color:${badgeFg};font-size:9px;font-weight:900">${badgeTxt}</span>`:''}
        </div>
      </div>
      <div style="flex:1;min-width:100px;display:flex;flex-direction:column;gap:4px">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:6px">
          <span style="font-size:10px;font-weight:800;color:var(--text3);white-space:nowrap">${recordTxt}</span>
          <span style="font-size:var(--fs-caption);font-weight:950;color:${wrCol};flex-shrink:0">${wr==null?'-':wr+'%'}</span>
        </div>
      </div>
    </div>`;
}

// 대학별 뷰 - 신규 "글래스" 모드 전용 카드 (사진은 그대로 노출, 하단에 연한 프로스티드 글래스 정보바)
function _b2UnivGlassCard(p, accentCol, showBadge) {
  const safeName = (p.name||'').replace(/'/g,"\\'");
  const photo = p.photo ? toScaledUrl(p.photo,300) : '';
  const photoOrig = p.photo ? toHttpsUrl(p.photo) : '';
  const raceLetter = (p.race && p.race!=='N') ? p.race : '?';
  const raceCol = { T:'#2563eb', P:'#d97706', Z:'#7c3aed' }[p.race] || '#475569';
  const badgeTxt = showBadge ? (p.tier || p.role || '') : '';
  const badgeBg = (p.tier && typeof getTierBtnColor === 'function') ? getTierBtnColor(p.tier) : accentCol;
  const win = Number(p.win||0), loss = Number(p.loss||0), games = win+loss;
  const wr = games ? Math.round(win/games*100) : null;
  const wrCol = wr==null ? '#94a3b8' : (wr>=50 ? '#16a34a' : '#dc2626');
  // (버그픽스) 두번째 프로필 사진 호버 미리보기 지원
  const _glassSecondRaw = String(p?.secondProfileFile||'').trim();
  const _glassHasSecond = !!_glassSecondRaw;
  const _glass2ndHtml = (_glassHasSecond && typeof _phSwap2ndHTML==='function') ? _phSwap2ndHTML(p.secondProfileFile, {style:'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:top center'}) : '';
  return `
    <div class="b2-univ-glass-card" style="width:150px;max-width:100%;border-radius:22px;overflow:hidden;cursor:pointer;background:rgba(255,255,255,.6);box-shadow:0 10px 22px rgba(15,23,42,.12);border:1px solid ${accentCol}2e;transition:transform .18s,box-shadow .18s"
      onclick="_b2LineupCardHoverLeave();openPlayerModal('${safeName}')"
      onmouseenter="this.style.transform='translateY(-4px)';this.style.boxShadow='0 16px 28px rgba(15,23,42,.2)';_b2LineupCardHoverEnter(event,this,'${safeName}','${accentCol}')"
      onmouseleave="this.style.transform='';this.style.boxShadow='0 10px 22px rgba(15,23,42,.12)';_b2LineupCardHoverLeave()">
      <div class="${_glassHasSecond?'ph-swap':''}" style="position:relative;width:100%;aspect-ratio:.86;overflow:hidden;background:linear-gradient(160deg,${accentCol}40,${accentCol}12)">
        ${photo
          ? `<img src="${photo}" data-orig="${photoOrig}" crossorigin="anonymous" loading="lazy" decoding="async" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:top center" onerror="if(this.dataset.orig&&this.src!==this.dataset.orig){this.removeAttribute('crossorigin');this.src=this.dataset.orig;}else{this.style.display='none';this.nextElementSibling.style.display='flex'}"><div style="display:none;position:absolute;inset:0;align-items:center;justify-content:center;font-size:34px;font-weight:1000;color:${accentCol}">${raceLetter}</div>`
          : `<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:34px;font-weight:1000;color:${accentCol}">${raceLetter}</div>`
        }
        ${_glass2ndHtml}
        ${(p.race&&p.race!=='N')?`<div style="position:absolute;top:7px;right:7px;padding:2px 8px;border-radius:999px;background:${raceCol}e6;color:#fff;font-size:10px;font-weight:900;box-shadow:0 2px 6px rgba(0,0,0,.22);z-index:6">${p.race}</div>`:''}
        ${badgeTxt?`<div style="position:absolute;top:7px;left:7px;padding:2px 8px;border-radius:999px;background:rgba(255,255,255,.85);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);color:${badgeBg};font-weight:900;font-size:10px;box-shadow:0 2px 6px rgba(0,0,0,.12);z-index:6">${badgeTxt}</div>`:''}
      </div>
      <div style="padding:9px 11px 10px;background:rgba(255,255,255,.7);backdrop-filter:blur(10px) saturate(1.3);-webkit-backdrop-filter:blur(10px) saturate(1.3);border-top:1px solid ${accentCol}20">
        <div style="color:var(--text1);font-weight:950;font-size:var(--fs-base);letter-spacing:-.02em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${p.name||''}</div>
        <div style="margin-top:6px;display:flex;align-items:center;justify-content:flex-end;gap:6px">
          <span style="font-size:var(--fs-caption);font-weight:900;color:${wrCol};flex-shrink:0">${wr==null?'-':wr+'%'}</span>
        </div>
      </div>
    </div>`;
}

// 대학별 뷰 - 신규 "프레임" 모드 전용 카드 (컬러 테두리 + 솔리드 컬러 하단바)
function _b2UnivFrameCard(p, accentCol, showBadge) {
  const safeName = (p.name||'').replace(/'/g,"\\'");
  const photo = p.photo ? toScaledUrl(p.photo,300) : '';
  const photoOrig = p.photo ? toHttpsUrl(p.photo) : '';
  const raceLetter = (p.race && p.race!=='N') ? p.race : '?';
  const raceCol = { T:'#2563eb', P:'#d97706', Z:'#7c3aed' }[p.race] || '#475569';
  const badgeTxt = showBadge ? (p.tier || p.role || '') : '';
  const badgeBg = (p.tier && typeof getTierBtnColor === 'function') ? getTierBtnColor(p.tier) : accentCol;
  const badgeFg = (p.tier && typeof getTierBtnTextColor === 'function') ? (getTierBtnTextColor(p.tier) || '#fff') : '#fff';
  const win = Number(p.win||0), loss = Number(p.loss||0), games = win+loss;
  const wr = games ? Math.round(win/games*100) : null;
  return `
    <div class="b2-univ-frame-card" style="width:150px;max-width:100%;border-radius:20px;overflow:hidden;cursor:pointer;border:3px solid ${accentCol};box-shadow:0 10px 20px rgba(15,23,42,.14);transition:transform .16s,box-shadow .16s"
      onclick="_b2LineupCardHoverLeave();openPlayerModal('${safeName}')"
      onmouseenter="this.style.transform='translateY(-3px)';this.style.boxShadow='0 14px 26px rgba(15,23,42,.22)';_b2LineupCardHoverEnter(event,this,'${safeName}','${accentCol}')"
      onmouseleave="this.style.transform='';this.style.boxShadow='0 10px 20px rgba(15,23,42,.14)';_b2LineupCardHoverLeave()">
      <div style="position:relative;width:100%;aspect-ratio:.86;overflow:hidden;background:linear-gradient(160deg,${accentCol}45,${accentCol}14)"
        ${photo
          ? `<img src="${photo}" data-orig="${photoOrig}" crossorigin="anonymous" loading="lazy" decoding="async" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:top center" onerror="if(this.dataset.orig&&this.src!==this.dataset.orig){this.removeAttribute('crossorigin');this.src=this.dataset.orig;}else{this.style.display='none';this.nextElementSibling.style.display='flex'}"><div style="display:none;position:absolute;inset:0;align-items:center;justify-content:center;font-size:34px;font-weight:1000;color:${accentCol}">${raceLetter}</div>`
          : `<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:34px;font-weight:1000;color:${accentCol}">${raceLetter}</div>`
        }
        ${badgeTxt?`<div style="position:absolute;top:0;left:0;padding:3px 10px 3px 8px;border-radius:0 0 10px 0;background:${badgeBg};color:${badgeFg};font-weight:900;font-size:10px">${badgeTxt}</div>`:''}
        ${(p.race&&p.race!=='N')?`<div style="position:absolute;top:7px;right:7px;padding:2px 8px;border-radius:999px;background:${raceCol}e6;color:#fff;font-size:10px;font-weight:900;box-shadow:0 2px 6px rgba(0,0,0,.22)">${p.race}</div>`:''}
      </div>
      <div style="padding:8px 10px 9px;background:${accentCol};text-align:center">
        <div style="color:#fff;font-weight:950;font-size:var(--fs-base);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-shadow:0 1px 3px rgba(0,0,0,.22)">${p.name||''}</div>
        <div style="margin-top:4px;font-size:10px;font-weight:800;color:rgba(255,255,255,.92)">${games?`${win}승 ${loss}패 · ${wr}%`:'기록 없음'}</div>
      </div>
    </div>`;
}

function _b2UnivPhotoCard(p, accentCol, showBadge) {
  const safeName = (p.name||'').replace(/'/g,"\\'");
  const photo = p.photo ? toScaledUrl(p.photo,300) : '';
  const photoOrig = p.photo ? toHttpsUrl(p.photo) : '';
  const raceLetter = (p.race && p.race!=='N') ? p.race : '?';
  const shapeStyle = 'border-radius:var(--su_profile_radius,50%);clip-path:var(--su_profile_clip,none);';
  const badgeTxt = showBadge ? (p.tier || p.role || '') : '';
  const badgeBg = (p.tier && typeof getTierBtnColor === 'function') ? getTierBtnColor(p.tier) : accentCol;
  const badgeFg = (p.tier && typeof getTierBtnTextColor === 'function') ? (getTierBtnTextColor(p.tier) || '#fff') : '#fff';
  const raceCol = { T:'#2563eb', P:'#d97706', Z:'#7c3aed' }[p.race] || '#475569';
  const backdrop = photo
    ? `<img src="${photo}" data-orig="${photoOrig}" crossorigin="anonymous" loading="lazy" decoding="async" aria-hidden="true" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:top center;transform:scale(1.16);filter:blur(14px) saturate(1.08) brightness(.88);opacity:.88" onerror="if(this.dataset.orig&&this.src!==this.dataset.orig){this.removeAttribute('crossorigin');this.src=this.dataset.orig;}else{this.style.display='none'}">
       <div style="position:absolute;inset:0;background:linear-gradient(180deg,${accentCol}24 0%,rgba(2,6,23,.12) 100%)"></div>`
    : `<div style="position:absolute;inset:0;background:linear-gradient(160deg,${accentCol}44 0%,${accentCol}18 100%)"></div>`;
  const photoHtml = photo
    ? `<img src="${photo}" data-orig="${photoOrig}" crossorigin="anonymous" loading="lazy" decoding="async" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:top center" onerror="if(this.dataset.orig&&this.src!==this.dataset.orig){this.removeAttribute('crossorigin');this.src=this.dataset.orig;}else{this.style.display='none';this.nextElementSibling.style.display='flex'}">
       <div style="position:absolute;inset:0;display:none;align-items:center;justify-content:center;font-size:34px;font-weight:1000;color:${accentCol};opacity:.78">${raceLetter}</div>`
    : `<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:34px;font-weight:1000;color:${accentCol};opacity:.78">${raceLetter}</div>`;
  return `
    <div class="b2-univ-poster-card" style="position:relative;width:122px;max-width:100%;aspect-ratio:.78;${shapeStyle}overflow:hidden;border:1px solid rgba(255,255,255,.16);background:#0b1120;box-shadow:0 10px 20px rgba(15,23,42,.12);cursor:pointer" onclick="_b2LineupCardHoverLeave();openPlayerModal('${safeName}')" onmouseenter="_b2LineupCardHoverEnter(event,this,'${safeName}','${accentCol}')" onmouseleave="_b2LineupCardHoverLeave()">
      ${backdrop}
      ${photoHtml}
      ${p.race&&p.race!=='N'?`<div style="position:absolute;top:8px;right:8px;padding:2px 8px;border-radius:999px;background:${raceCol};color:#fff;font-size:10px;font-weight:900;z-index:2;box-shadow:0 2px 6px rgba(0,0,0,.26)">${p.race}</div>`:''}
      <div style="position:absolute;left:0;right:0;bottom:0;padding:9px 9px 10px;background:linear-gradient(180deg,rgba(2,6,23,0) 0%,rgba(2,6,23,.20) 30%,rgba(2,6,23,.62) 100%);z-index:2">
        ${badgeTxt?`<div style="margin-bottom:3px"><span style="display:inline-flex;align-items:center;padding:2px 7px;border-radius:999px;background:${badgeBg};color:${badgeFg};font-size:10px;font-weight:900;line-height:1.4">${badgeTxt}</span></div>`:''}
        <div style="color:#fff;font-size:var(--fs-sm);font-weight:950;letter-spacing:-.02em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-shadow:0 1px 4px rgba(0,0,0,.5)">${p.name||''}</div>
      </div>
    </div>`;
}

function _b2UnivDefaultTag(p, accentCol, showTier) {
  const safeName = (p.name||'').replace(/'/g,"\\'");
  const crewCol = p.crewName && typeof _gcCrew === 'function' ? (_gcCrew(p.crewName) || '') : '';
  return `
    <div class="b2-def-tag-item" style="display:flex;align-items:center;gap:8px;padding:4px 10px 4px 4px;border-radius:24px;cursor:pointer;transition:background .12s;white-space:nowrap;flex-shrink:0"
      onmouseover="this.style.background='${accentCol}14'"
      onmouseout="this.style.background='transparent'">
      <div onclick="_b2LineupCardHoverLeave();openPlayerModal('${safeName}')" onmouseenter="_b2LineupCardHoverEnter(event,this,'${safeName}','${accentCol}')" onmouseleave="_b2LineupCardHoverLeave()" style="display:flex;align-items:center;gap:8px;flex:1;min-width:0">
      ${_b2Avatar(p, crewCol||accentCol, 58)}
      <span style="font-weight:800;font-size:20px;color:var(--text1);white-space:nowrap;${p.inactive?'opacity:.6':''}">${p.name||''}</span>
      ${p.race&&p.race!=='N'?`<span class="rbadge r${p.race}" style="font-size:var(--fs-caption);flex-shrink:0">${p.race}</span>`:''}
      ${showTier&&p.tier?`<span style="font-size:var(--fs-caption);font-weight:800;padding:2px 7px;border-radius:6px;background:${getTierBtnColor(p.tier)};color:${getTierBtnTextColor(p.tier)||'#fff'};flex-shrink:0">${p.tier}</span>`:''}
      ${p.inactive?'<span style="font-size:9px;background:#fff7ed;color:#9a3412;border-radius:4px;padding:1px 4px;font-weight:700;flex-shrink:0">⏸️</span>':''}
      </div>
    </div>`;
}

function _b2UnivHeatCard(p, accentCol) {
  const safeName = (p.name||'').replace(/'/g,"\\'");
  const photo = p.photo ? toThumbUrl(p.photo,112) : '';
  const photoOrig = p.photo ? toHttpsUrl(p.photo) : '';
  const raceLetter = (p.race && p.race!=='N') ? p.race : '?';
  const shapeStyle = 'border-radius:var(--su_profile_radius,50%);clip-path:var(--su_profile_clip,none);';
  return `<button type="button" class="b2-univ-heat-card" title="${(p.name||'').replace(/"/g,'&quot;')}" onclick="_b2LineupCardHoverLeave();openPlayerModal('${safeName}')" onmouseenter="_b2LineupCardHoverEnter(event,this,'${safeName}','${accentCol}')" onmouseleave="_b2LineupCardHoverLeave()" style="width:112px;height:112px;padding:0;border:none;${shapeStyle}overflow:hidden;background:${accentCol}22;box-shadow:0 8px 20px rgba(15,23,42,.09);cursor:pointer">
    ${photo ? `<img src="${photo}" data-orig="${photoOrig}" crossorigin="anonymous" loading="lazy" decoding="async" style="width:100%;height:100%;object-fit:cover;object-position:top center" onerror="if(this.dataset.orig&&this.src!==this.dataset.orig){this.removeAttribute('crossorigin');this.src=this.dataset.orig;}else{this.style.display='none';this.nextElementSibling.style.display='flex'}"><span style="display:none;align-items:center;justify-content:center;width:100%;height:100%;font-size:32px;font-weight:1000;color:${accentCol}">${raceLetter}</span>` : `<span style="display:flex;align-items:center;justify-content:center;width:100%;height:100%;font-size:32px;font-weight:1000;color:${accentCol}">${raceLetter}</span>`}
  </button>`;
}

function _b2RenderUnivGroupCards(group, accentCol, showBadge, mode, hideTableHead) {
  const items = Array.isArray(group) ? group : [];
  if (mode === 'poster') {
    return `<div style="display:flex;flex-wrap:wrap;gap:14px">${items.map(p => _b2UnivPhotoCard(p, accentCol, showBadge)).join('')}</div>`;
  }
  if (mode === 'rank') {
    const _sorted = items.slice().sort((a,b) => {
      const aw=Number(a.win||0), al=Number(a.loss||0), ag=aw+al, awr=ag?aw/ag:-1;
      const bw=Number(b.win||0), bl=Number(b.loss||0), bg=bw+bl, bwr=bg?bw/bg:-1;
      if (bwr !== awr) return bwr - awr;
      if (bw !== aw) return bw - aw;
      return (a.name||'').localeCompare(b.name||'', 'ko', {sensitivity:'base'});
    });
    return `<div style="display:flex;flex-direction:column;gap:8px">${_sorted.map((p,i) => _b2UnivRankRow(p, accentCol, showBadge, i+1)).join('')}</div>`;
  }
  if (mode === 'glass') {
    return `<div style="display:flex;flex-wrap:wrap;gap:14px">${items.map(p => _b2UnivGlassCard(p, accentCol, showBadge)).join('')}</div>`;
  }
  if (mode === 'table') {
    return (typeof _b2LineupTable === 'function') ? _b2LineupTable(items, accentCol, '', '', hideTableHead) : '';
  }
  return `<div class="b2-def-tag-grid" style="display:grid;grid-template-columns:repeat(5,max-content);align-items:center;justify-content:start;column-gap:10px;row-gap:8px;max-width:100%;overflow-x:auto;overflow-y:hidden;padding-bottom:2px;scrollbar-width:thin">${items.map(p => _b2UnivDefaultTag(p, accentCol, showBadge)).join('')}</div>`;
}

// 라인업 카드 - 모드3 "사진+통계그리드형" 전용 스타일 (사진이 카드 상단을 꽉 채우는 풀블리드 레이아웃)
;(function _injectLineupCard3Style(){
  if(typeof document==='undefined') return;
  const prev = document.getElementById('b2-lineup-card3-style');
  if(prev) prev.remove();
  const s=document.createElement('style');
  s.id='b2-lineup-card3-style';
  s.textContent=[
    '.b2-lc3{position:relative;border-radius:18px;overflow:hidden;background:linear-gradient(165deg,var(--lc-col,#64748b)1f 0%,var(--lc-col,#64748b)08 34%,rgba(255,255,255,.98) 58%);box-shadow:0 4px 16px rgba(15,23,42,.16);cursor:pointer;transition:transform .18s ease,box-shadow .18s ease;border:1px solid var(--lc-col,#64748b)2e}',
    '.b2-lc3:hover{transform:translateY(-4px) scale(1.035);box-shadow:0 16px 30px rgba(15,23,42,.22);z-index:2}',
    '.b2-lc3-photo{position:relative;width:100%;aspect-ratio:.82;overflow:hidden;background:linear-gradient(160deg,var(--lc-col,#64748b)55 0%,var(--lc-col,#64748b)22 100%)}',
    '.b2-lc3-photo img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:top center}',
    '.b2-lc3-backdrop{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:top center;transform:scale(1.2);filter:blur(15px) saturate(1.1) brightness(.82)}',
    '.b2-lc3-fallback{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:40px;font-weight:1000;color:#fff;opacity:.85}',
    '.b2-lc3-overlay{position:absolute;left:0;right:0;bottom:0;z-index:2;padding:28px 12px 10px;text-align:left;background:linear-gradient(180deg,rgba(2,6,23,0) 0%,rgba(2,6,23,.30) 45%,rgba(2,6,23,.76) 100%)}',
    '.b2-lc3-tierchip{display:inline-block;padding:2px 8px;border-radius:999px;font-size:10px;font-weight:900;color:#fff;line-height:1.6;margin-bottom:4px}',
    '.b2-lc3-name{font-size:var(--fs-md);font-weight:950;color:#fff;letter-spacing:-.02em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-shadow:0 1px 4px rgba(0,0,0,.5)}',
    '.b2-lc3-sub{font-size:10px;font-weight:800;color:rgba(255,255,255,.82);margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
    '.b2-lc3-grid{display:grid;grid-template-columns:1fr 1fr;gap:6px;padding:9px 10px 10px}',
    '.b2-lc3-box{border-radius:var(--r);padding:7px 4px;background:var(--lc-col,#64748b)14;text-align:center}',
    '.b2-lc3-box-value{font-size:var(--fs-base);font-weight:950;color:#0f172a}',
    '.b2-lc3-box-label{font-size:10px;font-weight:800;color:#475569;margin-top:2px}',
    ':is(body.dark,html.dark) .b2-lc3{background:linear-gradient(165deg,var(--lc-col,#64748b)33 0%,var(--lc-col,#64748b)14 34%,rgba(15,23,42,.88) 58%);border-color:var(--lc-col,#64748b)44}',
    ':is(body.dark,html.dark) .b2-lc3-photo{background:linear-gradient(160deg,var(--lc-col,#64748b)3d 0%,var(--lc-col,#64748b)1a 100%)}',
    ':is(body.dark,html.dark) .b2-lc3-box{background:rgba(15,23,42,.55)}',
    ':is(body.dark,html.dark) .b2-lc3-box-value{color:#e2e8f0}',
    ':is(body.dark,html.dark) .b2-lc3-box-label{color:#94a3b8}'
  ].join('');
  document.head.appendChild(s);
})();
