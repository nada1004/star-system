function _b2TierLabel(t) {
  const s = String(t || '').trim();
  if (!s) return '?티어';
  return s.endsWith('티어') ? s : s + '티어';
}

function _b2PlayersView() {
  const dissolvedUnivs = typeof univCfg !== 'undefined' ? new Set((univCfg.filter(u => u.dissolved) || []).map(u => u.name)) : new Set();
  const visPlayers = players.filter(p => !p.hidden && !p.retired && !p.hideFromBoard && !dissolvedUnivs.has(p.univ));
  
  // 대학 필터링
  const univFilteredPlayers = _b2PlayersUnivFilter === '전체' 
    ? visPlayers 
    : visPlayers.filter(p => String(p?.univ||'').trim() === String(_b2PlayersUnivFilter||'').trim());
  
  // 종족 필터링
  const filteredPlayers = _b2PlayersFilter === 'all'
    ? univFilteredPlayers
    : univFilteredPlayers.filter(p => p.race === _b2PlayersFilter);

  // 티어 필터링
  let tierFilteredPlayers = (_b2PlayersTierFilter === '전체')
    ? filteredPlayers.filter(p => p.tier && p.tier !== '?' && p.tier !== '미정' && p.tier !== '미확인')
    : filteredPlayers.filter(p => p.tier === _b2PlayersTierFilter);

  // 이번주 날짜 범위
  const { fromN: _b2pFromN, toN: _b2pToN } = _b2ThisWeekRange();
  const _b2pDateNum = _b2DateNum;
  const _b2pWeekStats = (p) => {
    let w=0,l=0;
    (Array.isArray(p.history)?p.history:[]).forEach(h=>{
      const d=_b2pDateNum(h.date||h.d||'');
      if(d>=_b2pFromN&&d<=_b2pToN){ if(h.result==='승')w++; else if(h.result==='패')l++; }
    });
    return {w,l,total:w+l};
  };

  if (!tierFilteredPlayers.length) {
    return `<div style="text-align:center;padding:60px 20px;color:var(--gray-l)">
      <div style="font-size:48px;margin-bottom:12px">👤</div>
      <div style="font-weight:700">표시할 선수가 없습니다</div>
    </div>`;
  }

  // 기본 선택 선수: 없거나 현재 필터 목록에 없으면 랜덤으로 선택
  if (!_b2SelectedPlayer || !tierFilteredPlayers.find(p => p.name === _b2SelectedPlayer.name)) {
    const withPhoto2 = tierFilteredPlayers.filter(p => p.photo || (window.playerPhotos && window.playerPhotos[p.name]));
    const pool2 = withPhoto2.length ? withPhoto2 : tierFilteredPlayers;
    _b2SelectedPlayer = pool2[Math.floor(Math.random() * pool2.length)];
  }

  // 대학 목록 (필터용) - dissolved 대학 제외
  const univList = [...new Set(visPlayers.map(p => String(p?.univ||'').trim()).filter(u => u && u !== '무소속'))];
  // univCfg 순서로 정렬
  if (typeof univCfg !== 'undefined') {
    univList.sort((a, b) => {
      const idxA = univCfg.findIndex(u => u.name === a);
      const idxB = univCfg.findIndex(u => u.name === b);
      return (idxA >= 0 ? idxA : 999) - (idxB >= 0 ? idxB : 999);
    });
  } else {
    univList.sort();
  }
  
  // (요청사항) 이미지탭 목록 랜덤(셔플) 옵션
  // [FIX-12] 선수가 이미 선택된 상태에서 필터만 바꿀 때 셔플이 재발생하면 그리드 위치가 튀므로
  //          셔플 순서는 처음 렌더(또는 필터 변경) 때만 결정하고 그 이후엔 선택 선수를 맨 앞에 고정
  const _shuffleOn = (localStorage.getItem('su_b2_profile_shuffle') ?? '1') === '1';
  if (_shuffleOn) {
    // 셔플 순서 캐시 키 (필터 조합이 바뀌면 재셔플)
    const _sfKey = [_b2PlayersUnivFilter, _b2PlayersFilter, _b2PlayersTierFilter].join('|');
    if (window._b2ShuffleKey !== _sfKey || !Array.isArray(window._b2ShuffledNames)) {
      // 새 셔플 수행
      for (let i = tierFilteredPlayers.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const t = tierFilteredPlayers[i]; tierFilteredPlayers[i] = tierFilteredPlayers[j]; tierFilteredPlayers[j] = t;
      }
      window._b2ShuffleKey = _sfKey;
      window._b2ShuffledNames = tierFilteredPlayers.map(p => p.name);
    } else {
      // 캐시된 순서로 재정렬 (선수 목록 변동 없이 필터 동일할 때)
      const _nameIdx = {};
      window._b2ShuffledNames.forEach((n, i) => { _nameIdx[n] = i; });
      tierFilteredPlayers.sort((a, b) =>
        (_nameIdx[a.name] ?? 9999) - (_nameIdx[b.name] ?? 9999)
      );
    }
  } else {
    // 정렬: 직급 우선 (이사장, 총장, 교수, 코치), 티어 순서 (0,1,2,3,4,5,6,7,8,유스 마지막)
    const roleOrder = ['이사장', '총장', '교수', '코치'];
    const tierOrder = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '유스'];

    tierFilteredPlayers.sort((a, b) => {
      // 직급 우선 정렬 (이사장, 총장, 교수, 코치)
      const aRoleIdx = roleOrder.indexOf(a.role || '');
      const bRoleIdx = roleOrder.indexOf(b.role || '');
      const aHasRole = aRoleIdx >= 0;
      const bHasRole = bRoleIdx >= 0;

      if (aHasRole && !bHasRole) return -1;
      if (!aHasRole && bHasRole) return 1;
      if (aHasRole && bHasRole && aRoleIdx !== bRoleIdx) return aRoleIdx - bRoleIdx;

      // 직급이 같거나 없는 경우 티어 순서 정렬 (숫자 추출)
      const aTier = a.tier || '?';
      const bTier = b.tier || '?';
      const aTierIdx = tierOrder.indexOf(aTier);
      const bTierIdx = tierOrder.indexOf(bTier);

      if (aTierIdx >= 0 && bTierIdx >= 0 && aTierIdx !== bTierIdx) return aTierIdx - bTierIdx;

      // tierOrder에 없는 경우 숫자로 비교
      const aTierNum = parseInt(aTier) || 999;
      const bTierNum = parseInt(bTier) || 999;
      if (aTierNum !== bTierNum) return aTierNum - bTierNum;

      // 티어도 같은 경우 이름 순
      return (a.name || '').localeCompare(b.name || '', 'ko', {sensitivity:'base'});
    });
  }

  const hexToRgba=(h,a)=>{const r=parseInt(h.slice(1,3),16),g=parseInt(h.slice(3,5),16),b=parseInt(h.slice(5,7),16);return`rgba(${r},${g},${b},${a})`;};
  const univColor = gc(_b2SelectedPlayer.univ) || '#6366f1';
  const bgAlpha = (b2ProfileBgAlpha || 10) / 100;
  const theme = {
    glow: hexToRgba(univColor, 0.3),
    bg: hexToRgba(univColor, bgAlpha),
    border: univColor
  };

  const layoutSettings = JSON.parse(localStorage.getItem('su_b2_layout') || '{}');
  const autoResize = layoutSettings.autoResize !== false;
  const autoHeight = layoutSettings.autoHeight !== false;
  const leftSize = layoutSettings.rightSize || layoutSettings.leftSize || 55;
  const pcHeight = layoutSettings.pcHeight || 600;
  const mobileHeight = layoutSettings.mobileHeight || 320;
  const tabletHeight = layoutSettings.tabletHeight || 400;
  const pcMainWide = Math.min(Math.max(leftSize + 7, 60), 76);
  const pcMainMid = Math.min(Math.max(leftSize + 5, 58), 74);
  const pcMainNarrow = Math.min(Math.max(leftSize + 3, 56), 72);
  const tallTabletHeight = tabletHeight + 220;
  
  let h = `
    <style>
      .b2-players-wrapper {
        display: flex;
        gap: 24px;
        height: calc(100vh - 140px);
        min-height: ${pcHeight}px;
        align-items: stretch;
        padding: 0 0 16px 0;
      }
      .b2-players-main {
        flex: 0 0 ${pcMainNarrow}%;
        position: relative;
        min-width: 0;
      }
      .b2-players-grid-wrapper { min-width: 0; }
      ${autoResize ? `
      @media (min-width: 1400px) {
        .b2-players-main {
          flex: 0 0 ${pcMainWide}%;
        }
      }
      @media (min-width: 1200px) and (max-width: 1399px) {
        .b2-players-main {
          flex: 0 0 ${pcMainMid}%;
        }
      }
      @media (min-width: 1025px) and (max-width: 1199px) {
        .b2-players-main {
          flex: 0 0 ${pcMainNarrow}%;
        }
      }
      ` : ''}
      .b2-players-main-content {
        width: 100%;
        height: 100%;
        background: ${theme.bg};
        backdrop-filter: blur(25px);
        border: 1px solid rgba(255,255,255,0.2);
        border-radius: 24px;
        overflow: hidden;
        box-shadow: 0 20px 50px rgba(0,0,0,0.3);
        transition: all 0.5s ease;
        padding: 0;
        box-sizing: border-box;
      }
      .b2-players-main-image {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        min-width: 100%;
        min-height: 100%;
        object-fit: contain;
        object-position: center;
        transition: opacity 0.35s ease, transform 0.25s ease, filter 0.25s ease;
        will-change: transform, filter, opacity;
      }
      /* 모바일/태블릿에서도 사용자가 지정한 이미지별 설정(채우기/맞춤/확대/이동/밝기)을 그대로 사용 */
      .b2-players-img-controls {
        position: absolute;
        top: 16px;
        left: 16px;
        background: rgba(0,0,0,0.75);
        backdrop-filter: blur(10px);
        border-radius: 16px;
        padding: 12px;
        z-index: 10;
        width: min(320px, calc(100% - 32px));
        max-height: calc(100% - 120px);
        overflow-y: auto;
        scrollbar-width: thin;
      }
      .b2-players-controls-title {
        font-size: 13px;
        font-weight: 800;
        color: #fff;
        margin-bottom: 10px;
      }
      .b2-players-slot-card {
        padding: 10px;
        border-radius: 12px;
        background: rgba(255,255,255,0.08);
        border: 1px solid rgba(255,255,255,0.12);
        margin-bottom: 10px;
      }
      .b2-players-slot-card.is-disabled {
        opacity: 0.55;
      }
      .b2-players-slot-title {
        font-size: 12px;
        font-weight: 800;
        color: #fff;
        margin-bottom: 8px;
      }
      .b2-players-slot-title span {
        font-size: 10px;
        color: rgba(255,255,255,0.65);
      }
      .b2-players-img-controls::-webkit-scrollbar {
        width: 4px;
      }
      .b2-players-img-controls::-webkit-scrollbar-thumb {
        background: rgba(255,255,255,0.3);
        border-radius: 4px;
      }
      .b2-players-img-control-group {
        margin-bottom: 10px;
        padding-bottom: 10px;
        border-bottom: 1px solid rgba(255,255,255,0.2);
      }
      .b2-players-img-control-group:last-child {
        margin-bottom: 0;
        padding-bottom: 0;
        border-bottom: none;
      }
      .b2-players-img-label {
        font-size: 11px;
        font-weight: 700;
        color: #fff;
        margin-bottom: 6px;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .b2-players-img-label span {
        font-size: 10px;
        color: rgba(255,255,255,0.7);
      }
      .b2-players-img-slider {
        width: 100%;
        height: 4px;
        -webkit-appearance: none;
        appearance: none;
        background: rgba(255,255,255,0.3);
        border-radius: 2px;
        outline: none;
        margin-bottom: 8px;
      }
      .b2-players-img-slider::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 14px;
        height: 14px;
        background: #3b82f6;
        border-radius: 50%;
        cursor: pointer;
      }
      .b2-players-img-btns {
        display: flex;
        gap: 4px;
        flex-wrap: wrap;
      }
      .b2-players-img-btn {
        padding: 4px 8px;
        border-radius: 6px;
        border: none;
        background: rgba(255,255,255,0.2);
        color: #fff;
        font-size: 11px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
        flex: 1;
        min-width: 45px;
      }
      .b2-players-img-btn:hover {
        background: rgba(255,255,255,0.3);
      }
      .b2-players-img-btn.active {
        background: #3b82f6;
      }
      .b2-players-img-btn-sm {
        padding: 3px 6px;
        font-size: 10px;
        min-width: 30px;
      }
      .b2-players-info {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        padding: 24px;
        z-index: 12;
      }
      .b2-players-info .b2-players-name,
      .b2-players-info .b2-players-race {
        text-shadow: 0 2px 10px rgba(0,0,0,.7), 0 1px 3px rgba(0,0,0,.9);
      }
      .b2-players-name {
        font-size: 36px;
        font-weight: 800;
        margin-bottom: 8px;
        color: #fff;
      }
      .b2-players-details {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        align-items: center;
        margin-bottom: 12px;
      }
      .b2-players-tier {
        background: ${theme.border};
        color: #fff;
        padding: 4px 12px;
        border-radius: 12px;
        font-weight: 700;
        font-size: 13px;
      }
      .b2-players-race {
        font-size: 14px;
        font-weight: 900;
      }
      .b2-players-chip {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 8px 14px;
        border-radius: 999px;
        background: rgba(0,0,0,0.4);
        border: 1.5px solid rgba(255,255,255,0.35);
        color: #fff;
        font-size: 13px;
        font-weight: 900;
      }
      .b2-players-chip img {
        width: 26px;
        height: 26px;
        object-fit: contain;
      }
      .b2-players-grid-wrapper {
        flex: 1;
        background: linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.04));
        backdrop-filter: blur(15px);
        border: 1px solid rgba(255,255,255,0.12);
        border-radius: 26px;
        padding: 22px;
        overflow-y: auto;
        box-shadow: inset 0 1px 0 rgba(255,255,255,0.05);
      }
      .b2-players-grid-wrapper::-webkit-scrollbar {
        width: 6px;
      }
      .b2-players-grid-wrapper::-webkit-scrollbar-thumb {
        background: rgba(255,255,255,0.2);
        border-radius: 10px;
      }
      .b2-players-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
        gap: 13px;
      }
      @media (min-width: 769px) and (max-width: 1024px) {
        .b2-players-wrapper {
          flex-direction: column;
          gap: 16px;
          height: auto;
          min-height: auto;
        }
        .b2-players-main {
          flex: none;
          width: 100%;
          min-height: ${tallTabletHeight}px;
          height: ${autoHeight ? `clamp(${tallTabletHeight}px, 78vh, ${pcHeight + 220}px)` : `${tallTabletHeight}px`};
        }
        .b2-players-grid-wrapper {
          flex: none;
          min-height: 0;
          max-height: none;
        }
      }
      @media (max-width: 768px) {
        .b2-players-main {
          min-height: ${mobileHeight}px;
          height: ${autoHeight ? `clamp(${mobileHeight}px, 52vh, ${mobileHeight + 160}px)` : `${mobileHeight}px`};
        }
      }
      .b2-players-card {
        cursor: pointer;
        transition: all 0.3s cubic-bezier(0.165, 0.84, 0.44, 1);
        position: relative;
      }
      .b2-players-card:hover {
        transform: translateY(-8px);
      }
      .b2-players-card.active {
        transform: translateY(-4px);
      }
      @media (max-width: 768px) {
        .b2-players-wrapper {
          flex-direction: column;
          height: auto;
          min-height: auto;
          gap: 14px;
        }
        .b2-players-main {
          flex: none;
          width: 100%;
          min-height: ${mobileHeight}px;
          height: clamp(${mobileHeight}px, 52vh, ${mobileHeight + 160}px);
          order: 0;
          position: sticky;
          top: 0;
          z-index: 4;
        }
        .b2-players-main-content {
          height: 100%;
          border-radius: 18px;
        }
        .b2-players-img-controls {
          width: calc(100% - 20px);
          padding: 8px;
          top: 10px;
          left: 10px;
          max-height: 48%;
        }
        .b2-players-img-label {
          font-size: 10px;
        }
        .b2-players-img-btn {
          padding: 3px 6px;
          font-size: 10px;
          min-width: 35px;
        }
        .b2-players-grid-wrapper {
          flex: none;
          height: auto;
          max-height: none;
          order: 1;
        }
        .b2-players-grid {
          grid-template-columns: repeat(2, 1fr);
          max-height: none;
          overflow-y: visible;
        }
        .b2-players-name {
          font-size: 24px;
        }
        .b2-players-info {
          padding: 20px;
        }
        .b2-players-thumbnail {
          height: 80px;
          font-size: 28px;
        }
      }
      @media (min-width: 769px) and (max-width: 1024px) {
        .b2-players-main {
          order: 0;
          position: sticky;
          top: 0;
          z-index: 4;
        }
        .b2-players-main-content {
          height: 100%;
          border-radius: 18px;
        }
        .b2-players-img-controls {
          width: calc(100% - 20px);
          padding: 8px;
          top: 10px;
          left: 10px;
          max-height: 48%;
        }
        .b2-players-img-label {
          font-size: 10px;
        }
        .b2-players-img-btn {
          padding: 3px 6px;
          font-size: 10px;
          min-width: 35px;
        }
        .b2-players-grid-wrapper {
          flex: none;
          height: auto;
          order: 1;
          overflow-y: visible;
        }
        .b2-players-grid {
          grid-template-columns: repeat(3, 1fr);
          max-height: none;
          overflow-y: visible;
        }
        .b2-players-name {
          font-size: 24px;
        }
        .b2-players-info {
          padding: 20px;
        }
        .b2-players-thumbnail {
          height: 80px;
          font-size: 28px;
        }
      }
      .b2-players-filter-btn {
        background: rgba(255,255,255,0.1);
        border: 1px solid rgba(255,255,255,0.2);
        color: var(--text3);
        padding: 6px 16px;
        border-radius: 20px;
        cursor: pointer;
        font-size: 13px;
        font-weight: 600;
        transition: all 0.3s ease;
      }
      .b2-players-filter-btn:hover {
        background: rgba(255,255,255,0.2);
        color: var(--text1);
      }
      .b2-players-filter-btn.active {
        background: #3b82f6;
        border-color: #3b82f6;
        color: #fff;
        box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4);
      }
      @media (max-width: 768px) {
        .b2-players-wrapper {
          flex-direction: column;
          height: auto;
        }
        .b2-players-main {
          flex: none;
          max-height: none;
        }
        .b2-players-grid-wrapper {
          height: auto;
          min-height: 0;
        }
      }
    </style>
  `;

  // 메인 래퍼
  h += `<div class="b2-players-wrapper">`;
  
  // 좌측 메인 디스플레이
  const primarySettings = _b2GetImgSettings(_b2SelectedPlayer.name, 'primary');
  const secondarySettings = _b2GetImgSettings(_b2SelectedPlayer.name, 'secondary');
  const imgSettings = primarySettings;
  const safeName = (_b2SelectedPlayer.name || '').replace(/\\/g, '\\\\').replace(/'/g, "\\'");
  const _hasMediaUrl = (v)=>!!String(v || '').trim();
  const hasPrimary = _hasMediaUrl(_b2SelectedPlayer.photo);
  const hasSecondary = _hasMediaUrl(_b2SelectedPlayer.secondProfileFile);
  const _b2PosPct = (useFlag, x, y)=>{
    try{
      if(useFlag === false) return 'center center';
      const xx = Number(x), yy = Number(y);
      if(!Number.isFinite(xx) || !Number.isFinite(yy)) return 'center center';
      const cx = Math.max(0, Math.min(100, xx));
      const cy = Math.max(0, Math.min(100, yy));
      return `${cx}% ${cy}%`;
    }catch(e){
      return 'center center';
    }
  };
  const _p3pos = _b2PosPct(_b2SelectedPlayer.photo3PosUse, _b2SelectedPlayer.photo3PosX, _b2SelectedPlayer.photo3PosY);
  const _p4pos = _b2PosPct(_b2SelectedPlayer.photo4PosUse, _b2SelectedPlayer.photo4PosX, _b2SelectedPlayer.photo4PosY);
  const _p5pos = _b2PosPct(_b2SelectedPlayer.photo5PosUse, _b2SelectedPlayer.photo5PosX, _b2SelectedPlayer.photo5PosY);
  try{
    if(typeof prewarmImageUrls==='function'){
      prewarmImageUrls([
        _b2SelectedPlayer.photo,
        _b2SelectedPlayer.secondProfileFile,
        ...tierFilteredPlayers.map(p=>p.photo).filter(Boolean)
      ], 24);
    }
  }catch(e){}

  const _b2IsVideoUrl = (u)=>{
    const s = String(u||'').trim().toLowerCase().split('#')[0].split('?')[0];
    return s.endsWith('.mp4') || s.endsWith('.webm') || s.endsWith('.ogg') || s.endsWith('.mov') || s.endsWith('.m4v');
  };
  const _b2MainMediaHTML = (slot, rawUrl, opt)=>{
    const url = String(rawUrl||'').trim();
    if(!url) return '';
    const src = toHttpsUrl(url);
    const isVid = _b2IsVideoUrl(url);
    const z = opt && opt.z != null ? opt.z : slot;
    const opacity = opt && opt.opacity != null ? opt.opacity : (slot===1?1:0);
    const style = opt && opt.style ? opt.style : '';
    const onLoadJs = opt && opt.onLoadJs ? String(opt.onLoadJs) : '';
    const evAttr = onLoadJs ? (isVid ? 'onloadedmetadata' : 'onload') : '';
    const evPart = onLoadJs ? ` ${evAttr}="${onLoadJs}"` : '';
    const common = `class="b2-players-main-image" id="b2-main-img-${slot}" style="position:absolute;inset:0;width:100%;height:100%;min-width:100%;min-height:100%;z-index:${z};opacity:${opacity};pointer-events:none;${style}"`;
    if(isVid){
      return `<video ${common} src="${src}" preload="metadata" muted playsinline${evPart}></video>`;
    }
    return `<img ${common} src="${src}" decoding="async" fetchpriority="high"${evPart}>`;
  };
  const _b2NameEsc = _b2SelectedPlayer.name.replace(/'/g,"\\'");
  const _slot1 = _hasMediaUrl(_b2SelectedPlayer.photo)
    ? _b2MainMediaHTML(1, _b2SelectedPlayer.photo, {
      z: 1,
      opacity: 1,
      onLoadJs: `_b2ScheduleImageSwap('${_b2NameEsc}'); if(typeof _b2ApplyImgSettingsToDom==='function'){ _b2ApplyImgSettingsToDom('${_b2NameEsc}', 'primary'); }`,
      style: `object-fit:${primarySettings.fit || 'cover'};object-position:center center;transform:${_b2GetImgTransform(primarySettings)};filter:brightness(${(primarySettings.brightness || 100) / 100});transition:opacity 0.4s ease;`
    })
    : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,0.05);font-size:64px;font-weight:900;color:rgba(255,255,255,0.2)">${(_b2SelectedPlayer.name||'?')[0]}</div>`;
  const _slot2 = _hasMediaUrl(_b2SelectedPlayer.secondProfileFile)
    ? _b2MainMediaHTML(2, _b2SelectedPlayer.secondProfileFile, {
      z: 2,
      opacity: 0,
      onLoadJs: `if(typeof _b2ApplyImgSettingsToDom==='function'){ _b2ApplyImgSettingsToDom('${_b2NameEsc}', 'secondary'); }`,
      style: `object-fit:${secondarySettings.fit || 'cover'};object-position:center center;transform:${_b2GetImgTransform(secondarySettings)};filter:brightness(${(secondarySettings.brightness || 100) / 100});transition:opacity 0.4s ease;`
    })
    : '';
  const _slot3 = _hasMediaUrl(_b2SelectedPlayer.profileFile3)
    ? _b2MainMediaHTML(3, _b2SelectedPlayer.profileFile3, { z:3, opacity:0, style:`object-fit:cover;object-position:${_p3pos};transition:opacity 0.4s ease;` })
    : '';
  const _slot4 = _hasMediaUrl(_b2SelectedPlayer.profileFile4)
    ? _b2MainMediaHTML(4, _b2SelectedPlayer.profileFile4, { z:4, opacity:0, style:`object-fit:cover;object-position:${_p4pos};transition:opacity 0.4s ease;` })
    : '';
  const _slot5 = _hasMediaUrl(_b2SelectedPlayer.profileFile5)
    ? _b2MainMediaHTML(5, _b2SelectedPlayer.profileFile5, { z:5, opacity:0, style:`object-fit:cover;object-position:${_p5pos};transition:opacity 0.4s ease;` })
    : '';
  const _selUnivIcon = (() => {
    const uCfg = univCfg.find(x => x.name === _b2SelectedPlayer.univ) || {};
    return uCfg.icon || uCfg.img || UNIV_ICONS[_b2SelectedPlayer.univ] || '';
  })();
  
  h += `
    <div class="b2-players-main">
      <div class="b2-players-main-content" id="b2-players-main-box" style="--img-zoom:${imgSettings.zoom/100};--img-brightness:${imgSettings.brightness/100};--img-pos-x:${imgSettings.posX}px;--img-pos-y:${imgSettings.posY}px;">
        ${_slot1}
        ${_slot2}
        ${_slot3}
        ${_slot4}
        ${_slot5}
        
        <!-- 이미지 컨트롤 패널 - 관리자(로그인)만 렌더 [BUGFIX-IMG-SETTINGS] -->
        ${isLoggedIn ? `<div class="b2-players-img-controls" id="b2-img-controls" style="display:none">
          <div class="b2-players-controls-title">🎨 이미지 설정</div>
          ${_b2BuildImageControlGroup(safeName, 'primary', '이미지 1', hasPrimary)}
          ${_b2BuildImageControlGroup(safeName, 'secondary', '이미지 2', hasSecondary)}
        </div>` : ''}
        
        <!-- 컨트롤 패널 토글 버튼 - 관리자(로그인 사용자)만 표시 [BUGFIX-IMG-SETTINGS] -->
        ${isLoggedIn ? `<button onclick="document.getElementById('b2-img-controls').style.display=document.getElementById('b2-img-controls').style.display==='none'?'block':'none'" style="position:absolute;top:16px;right:16px;z-index:var(--z-fixed);padding:8px 12px;background:rgba(0,0,0,0.75);backdrop-filter:blur(10px);border-radius:8px;color:#fff;font-size:12px;font-weight:700;cursor:pointer;border:1px solid rgba(255,255,255,0.2)">⚙️ 설정</button>` : ''}
        
        <div class="b2-players-info">
          <div class="b2-players-name">${_b2SelectedPlayer.name || '이름 없음'}</div>
          <div class="b2-players-details">
            <span class="b2-players-tier">${_b2TierLabel(_b2SelectedPlayer.tier)}</span>
            ${(_b2SelectedPlayer.race==='P'||_b2SelectedPlayer.race==='T'||_b2SelectedPlayer.race==='Z') ? `<span class="rbadge r${_b2SelectedPlayer.race}" style="font-size:14px;padding:5px 12px;box-shadow:0 2px 8px rgba(0,0,0,.35)">${_b2SelectedPlayer.race}</span>` : `<span class="b2-players-chip b2-players-race">종족미정</span>`}
            ${_b2SelectedPlayer.univ ? (() => {
              return _selUnivIcon
              ? `<span class="b2-players-chip"><img src="${toHttpsUrl(_selUnivIcon)}" onerror="this.style.display='none'"><span>${_b2SelectedPlayer.univ}</span></span>`
                : `<span class="b2-players-chip">🏫 ${_b2SelectedPlayer.univ}</span>`;
            })() : '<span class="b2-players-chip">🏫 무소속</span>'}
          </div>
          ${isLoggedIn ? `<button onclick="openB2ProfileEditModal('${_b2SelectedPlayer.name.replace(/'/g, "\\'")}')" style="margin-top:12px;padding:8px 16px;background:#fff;border:2px solid rgba(255,255,255,0.5);border-radius:20px;color:var(--text1);font-size:13px;font-weight:700;cursor:pointer;transition:all 0.3s ease;box-shadow:0 2px 8px rgba(0,0,0,0.2)" onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 4px 12px rgba(0,0,0,0.3)'" onmouseout="this.style.transform='';this.style.boxShadow='0 2px 8px rgba(0,0,0,0.2)'">✏️ 프로필 수정</button>` : ''}
        </div>
      </div>
    </div>
  `;

  // 우측 그리드
  const _renderKey = [
    String(_b2PlayersUnivFilter||''),
    String(_b2PlayersFilter||''),
    String(_b2PlayersTierFilter||''),
    _shuffleOn ? '1' : '0'
  ].join('|');
  if(window._b2PlayersRenderKey !== _renderKey){
    window._b2PlayersRenderKey = _renderKey;
    window._b2PlayersRenderLimit = 240;
  }
  const _lim0 = Math.max(60, parseInt(window._b2PlayersRenderLimit||0,10) || 240);
  const _limit = Math.min(tierFilteredPlayers.length, _lim0);
  let _gridList = tierFilteredPlayers.slice();
  const _gridShow = _gridList.slice(0, _limit);
  const _remain = Math.max(0, _gridList.length - _gridShow.length);

  h += `
    <div class="b2-players-grid-wrapper">
      <div class="b2-players-grid">
  `;

  _gridShow.forEach(p => {
    const isActive = _b2SelectedPlayer && _b2SelectedPlayer.name === p.name;
    const encodedPlayerName = encodeURIComponent(String(p.name || ''));
    const playerColor = gc(p.univ) || '#6366f1';
    const playerTheme = {
      bg: hexToRgba(playerColor, 0.1),
      border: playerColor
    };
    const tierCol  = typeof getTierBtnColor==='function'&&p.tier?getTierBtnColor(p.tier):'#64748b';
    const tierTc   = typeof getTierBtnTextColor==='function'&&p.tier?(getTierBtnTextColor(p.tier)||'#fff'):'#fff';
    const raceTxt  = (p.race==='P'||p.race==='T'||p.race==='Z') ? p.race : '';
    const gridUnivIcon = (() => {
      const uCfg = univCfg.find(x => x.name === p.univ) || {};
      return uCfg.icon || uCfg.img || UNIV_ICONS[p.univ] || '';
    })();

    h += `
      <div class="b2-players-card" data-player-name="${(typeof escAttr==='function'?escAttr(p.name||''):String(p.name||'').replace(/"/g,'&quot;'))}" data-player-key="${encodedPlayerName}" onclick="_b2UpdateMainDisplay(decodeURIComponent(this.dataset.playerKey||''))" style="position:relative;cursor:pointer;border-radius:18px;overflow:hidden;aspect-ratio:3/4;background:${playerTheme.bg};border:1.5px solid ${tierCol}66;isolation:isolate">
        ${p.photo
          ? `<img src="${toScaledUrl(p.photo,260)}" data-orig="${toHttpsUrl(p.photo)}" loading="lazy" decoding="async" alt="${p.name}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:top center;z-index:0" onerror="if(this.dataset.orig&&this.src!==this.dataset.orig){this.src=this.dataset.orig;}else{this.style.display='none';this.nextElementSibling.style.display='flex'}">
             <div style="position:absolute;inset:0;display:none;align-items:center;justify-content:center;background:${playerTheme.bg};font-size:44px;font-weight:900;color:${tierCol};z-index:0">${(p.name||'?')[0]}</div>`
          : `<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:${playerTheme.bg};font-size:44px;font-weight:900;color:${tierCol};z-index:0">${(p.name||'?')[0]}</div>`
        }
        ${p.tier?`<span style="position:absolute;top:8px;left:8px;z-index:2;font-size:10px;font-weight:900;padding:1px 6px;border-radius:999px;background:${tierCol};color:${tierTc};line-height:1.5;opacity:.8">${p.tier}</span>`:''}
        <div style="position:absolute;bottom:0;left:0;right:0;z-index:1;height:62%;background:linear-gradient(180deg, transparent 0%, rgba(0,0,0,.15) 35%, rgba(0,0,0,.75) 100%);pointer-events:none"></div>
        <div style="position:absolute;bottom:0;left:0;right:0;z-index:2;padding:9px 10px 10px">
          <div style="display:flex;align-items:center;gap:5px;overflow:hidden">
            ${raceTxt?`<span class="rbadge r${raceTxt}" style="flex-shrink:0;font-size:10px;padding:1px 6px;opacity:.8">${raceTxt}</span>`:''}
            <span style="color:rgba(255,255,255,.85);font-size:13px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;letter-spacing:-.01em;text-shadow:0 2px 8px rgba(0,0,0,.75),0 1px 3px rgba(0,0,0,.9)">${p.name||''}</span>
          </div>
          <div style="display:flex;align-items:center;gap:5px;margin-top:3px;flex-wrap:nowrap;overflow:hidden">
            ${gridUnivIcon?`<img src="${toHttpsUrl(gridUnivIcon)}" onerror="this.style.display='none'" style="flex-shrink:0;width:16px;height:16px;object-fit:contain;opacity:.85;filter:drop-shadow(0 1px 3px rgba(0,0,0,.8))">`:''}
            <span style="font-size:10.5px;color:rgba(255,255,255,.75);font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-shadow:0 2px 8px rgba(0,0,0,.85),0 1px 3px rgba(0,0,0,.95)">${p.univ||'무소속'}</span>
          </div>
        </div>
      </div>
    `;
  });

  h += `
      </div>
      ${_remain>0?`<div style="grid-column:1 / -1;display:flex;justify-content:center;padding:10px 0 16px">
        <button class="btn btn-w" onclick="window._b2PlayersRenderLimit=Math.min(${_gridList.length},(parseInt(window._b2PlayersRenderLimit||0,10)||0)+240);document.getElementById('b2-content').innerHTML=_b2PlayersView();setTimeout(()=>{if(_b2SelectedPlayer)_b2UpdateMainDisplay(_b2SelectedPlayer.name)},0)">▼ ${_remain}명 더 보기</button>
      </div>`:''}
    </div>
  `;

  h += `</div>`;

  return h;
}

function _b2UpdateMainDisplay(playerName) {
  const player = players.find(p => p.name === playerName);
  if (!player) return;
  try{
    if(typeof prewarmImageUrls==='function'){
      prewarmImageUrls([player.photo, player.secondProfileFile], 4);
    }
  }catch(e){}
  
  _b2SelectedPlayer = player;
  // localStorage 저장 제거 - 새로고침 시 랜덤 선수 선택을 위해
  
  const hexToRgba=(h,a)=>{const r=parseInt(h.slice(1,3),16),g=parseInt(h.slice(3,5),16),b=parseInt(h.slice(5,7),16);return`rgba(${r},${g},${b},${a})`;};
  const univColor = gc(player.univ) || '#6366f1';
  const bgAlpha = (b2ProfileBgAlpha || 10) / 100;
  const theme = {
    glow: hexToRgba(univColor, 0.3),
    bg: hexToRgba(univColor, bgAlpha),
    border: univColor
  };
  const _b2PosPct = (useFlag, x, y)=>{
    try{
      if(useFlag === false) return 'center center';
      const xx = Number(x), yy = Number(y);
      if(!Number.isFinite(xx) || !Number.isFinite(yy)) return 'center center';
      const cx = Math.max(0, Math.min(100, xx));
      const cy = Math.max(0, Math.min(100, yy));
      return `${cx}% ${cy}%`;
    }catch(e){
      return 'center center';
    }
  };
  const _p3pos = _b2PosPct(player.photo3PosUse, player.photo3PosX, player.photo3PosY);
  const _p4pos = _b2PosPct(player.photo4PosUse, player.photo4PosX, player.photo4PosY);
  const _p5pos = _b2PosPct(player.photo5PosUse, player.photo5PosX, player.photo5PosY);
  const _b2IsVideoUrl = (u)=>{
    const s = String(u||'').trim().toLowerCase().split('#')[0].split('?')[0];
    return s.endsWith('.mp4') || s.endsWith('.webm') || s.endsWith('.ogg') || s.endsWith('.mov') || s.endsWith('.m4v');
  };
  const _b2MainMediaHTML = (slot, rawUrl, opt)=>{
    const url = String(rawUrl||'').trim();
    if(!url) return '';
    const src = toHttpsUrl(url);
    const isVid = _b2IsVideoUrl(url);
    const z = opt && opt.z != null ? opt.z : slot;
    const opacity = opt && opt.opacity != null ? opt.opacity : (slot===1?1:0);
    const style = opt && opt.style ? opt.style : '';
    const onLoadJs = opt && opt.onLoadJs ? String(opt.onLoadJs) : '';
    const evAttr = onLoadJs ? (isVid ? 'onloadedmetadata' : 'onload') : '';
    const evPart = onLoadJs ? ` ${evAttr}="${onLoadJs}"` : '';
    const common = `class="b2-players-main-image" id="b2-main-img-${slot}" style="position:absolute;inset:0;width:100%;height:100%;min-width:100%;min-height:100%;z-index:${z};opacity:${opacity};pointer-events:none;${style}"`;
    if(isVid){
      return `<video ${common} src="${src}" preload="metadata" muted playsinline${evPart}></video>`;
    }
    return `<img ${common} src="${src}" decoding="async" fetchpriority="high"${evPart}>`;
  };
  const _nameEsc = player.name.replace(/'/g,"\\'");
  const _hasMediaUrl2 = (v)=>!!String(v || '').trim();
  const _slot1 = _hasMediaUrl2(player.photo)
    ? _b2MainMediaHTML(1, player.photo, { z:1, opacity:1, onLoadJs:`_b2ScheduleImageSwap('${_nameEsc}')`, style:'transition:opacity 0.4s ease;' })
    : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,0.05);font-size:64px;font-weight:900;color:rgba(255,255,255,0.2)">${(player.name||'?')[0]}</div>`;
  const _slot2 = _hasMediaUrl2(player.secondProfileFile)
    ? _b2MainMediaHTML(2, player.secondProfileFile, { z:2, opacity:0, style:`object-fit:cover;transition:opacity 0.4s ease;` })
    : '';
  const _slot3 = _hasMediaUrl2(player.profileFile3)
    ? _b2MainMediaHTML(3, player.profileFile3, { z:3, opacity:0, style:`object-fit:cover;object-position:${_p3pos};transition:opacity 0.4s ease;` })
    : '';
  const _slot4 = _hasMediaUrl2(player.profileFile4)
    ? _b2MainMediaHTML(4, player.profileFile4, { z:4, opacity:0, style:`object-fit:cover;object-position:${_p4pos};transition:opacity 0.4s ease;` })
    : '';
  const _slot5 = _hasMediaUrl2(player.profileFile5)
    ? _b2MainMediaHTML(5, player.profileFile5, { z:5, opacity:0, style:`object-fit:cover;object-position:${_p5pos};transition:opacity 0.4s ease;` })
    : '';
  const _updUnivIcon = (() => {
    const uCfg = univCfg.find(x => x.name === player.univ) || {};
    return uCfg.icon || uCfg.img || UNIV_ICONS[player.univ] || '';
  })();
  
  // 메인 디스플레이 업데이트
  const mainBox = document.getElementById('b2-players-main-box');
  const primarySettings = _b2GetImgSettings(player.name, 'primary');
  const secondarySettings = _b2GetImgSettings(player.name, 'secondary');

  const safeName = (player.name || '').replace(/\\/g, '\\\\').replace(/'/g, "\\'");
  const hasPrimary = _hasMediaUrl2(player.photo);
  const hasSecondary = _hasMediaUrl2(player.secondProfileFile);
  
  if (mainBox) {
    _b2ClearSwapTimer(mainBox);
    mainBox.innerHTML = `
      ${_slot1}
      ${_slot2}
      ${_slot3}
      ${_slot4}
      ${_slot5}
      
      <!-- 이미지 컨트롤 패널 (모든 사용자 접근 가능) -->
      <!-- 이미지 컨트롤 패널 - 관리자(로그인)만 렌더 [BUGFIX-IMG-SETTINGS] -->
      ${isLoggedIn ? `<div class="b2-players-img-controls" id="b2-img-controls" style="display:none">
        <div class="b2-players-controls-title">🎨 이미지 설정</div>
        ${_b2BuildImageControlGroup(safeName, 'primary', '이미지 1', hasPrimary)}
        ${_b2BuildImageControlGroup(safeName, 'secondary', '이미지 2', hasSecondary)}
      </div>` : ''}
      
      <!-- 컨트롤 패널 토글 버튼 - 관리자(로그인 사용자)만 표시 [BUGFIX-IMG-SETTINGS] -->
      ${isLoggedIn ? `<button onclick="document.getElementById('b2-img-controls').style.display=document.getElementById('b2-img-controls').style.display==='none'?'block':'none'" style="position:absolute;top:16px;right:16px;z-index:var(--z-fixed);padding:8px 12px;background:rgba(0,0,0,0.75);backdrop-filter:blur(10px);border-radius:8px;color:#fff;font-size:12px;font-weight:700;cursor:pointer;border:1px solid rgba(255,255,255,0.2)">⚙️ 설정</button>` : ''}
      
      <div class="b2-players-info">
        <div class="b2-players-name">${player.name || '이름 없음'}</div>
        <div class="b2-players-details">
          <span class="b2-players-tier" style="background:${theme.border}">${_b2TierLabel(player.tier)}</span>
          ${(player.race==='P'||player.race==='T'||player.race==='Z') ? `<span class="rbadge r${player.race}" style="font-size:14px;padding:5px 12px;box-shadow:0 2px 8px rgba(0,0,0,.35)">${player.race}</span>` : `<span class="b2-players-chip b2-players-race">종족미정</span>`}
          ${player.univ ? (() => {
            return _updUnivIcon
              ? `<span class="b2-players-chip"><img src="${toHttpsUrl(_updUnivIcon)}" onerror="this.style.display='none'"><span>${player.univ}</span></span>`
              : `<span class="b2-players-chip">🏫 ${player.univ}</span>`;
          })() : '<span class="b2-players-chip">🏫 무소속</span>'}
        </div>
        ${isLoggedIn ? `<button onclick="openB2ProfileEditModal('${player.name.replace(/'/g, "\\'")}')" style="margin-top:8px;padding:6px 12px;background:#fff;border:1px solid rgba(255,255,255,0.45);border-radius:12px;color:var(--text1);font-size:12px;font-weight:800;cursor:pointer;transition:all 0.15s ease" onmouseover="this.style.transform='translateY(-1px)'" onmouseout="this.style.transform=''">✏️ 프로필 수정</button>` : ''}
      </div>
    `;
    _b2ApplyImgSettingsToElement(document.getElementById('b2-main-img-1'), primarySettings);
    _b2ApplyImgSettingsToElement(document.getElementById('b2-main-img-2'), secondarySettings);
    // [FIX] 슬롯1의 onload가 캐시 이미지의 경우 발화 안 할 수 있으므로
    // - photo 없음: 즉시 _b2ScheduleImageSwap 호출
    // - photo 있고 이미 로드 완료(캐시): 즉시 호출
    // - photo 있고 아직 로드 중: onload 이벤트에서 자동 호출됨(슬롯 HTML에 onload 속성 포함)
    const _slot1El = document.getElementById('b2-main-img-1');
    const _isSlot1Video = _slot1El && _slot1El.tagName === 'VIDEO';
    if (!_hasMediaUrl2(player.photo)) {
      _b2ScheduleImageSwap(player.name);
    } else if (_slot1El && !_isSlot1Video && _slot1El.complete) {
      // 캐시에서 즉시 로드된 경우 onload가 발화 안 함 → 직접 호출
      _b2ScheduleImageSwap(player.name);
    }
    // 비디오인 경우 onloadedmetadata 이벤트에서 자동 호출됨
  }

  const _selName = String(playerName || '').trim();
  document.querySelectorAll('.b2-players-card').forEach(card => {
    card.classList.remove('active');
  });
}

function openB2ProfileEditModal(playerName) {
  const player = players.find(p => p.name === playerName);
  if (!player) return;
  const _trimMedia = (v)=>String(v || '').trim();
  const _media1 = _trimMedia(player.photo);
  const _media2 = _trimMedia(player.secondProfileFile);
  const _media3 = _trimMedia(player.profileFile3);
  const _media4 = _trimMedia(player.profileFile4);
  const _media5 = _trimMedia(player.profileFile5);
  const _slotOrder = [
    { slot:1, url:_media1 },
    { slot:2, url:_media2 },
    { slot:3, url:_media3 },
    { slot:4, url:_media4 },
    { slot:5, url:_media5 }
  ].filter(item => !!item.url);
  const _swapDelayKey = (from, to)=>{
    if(to === 1){
      if(from === 2) return 'photoDelay21';
      if(from === 3) return 'photoDelay31';
      if(from === 4) return 'photoDelay41';
      return 'photoDelay51';
    }
    if(from === 1) return 'photoDelay12';
    if(from === 2) return 'photoDelay23';
    if(from === 3) return 'photoDelay34';
    if(from === 4) return 'photoDelay45';
    return '';
  };
  const _swapDelayVal = (key)=>{
    const n = parseFloat(player?.[key] ?? 1);
    if(isNaN(n)) return 1;
    return Math.max(0.2, Math.min(60, n));
  };
  const clampDelay = (v)=>{
    const n = parseFloat(v);
    if(isNaN(n)) return 1;
    return Math.max(0.2, Math.min(60, n));
  };
  const _swapDelayInputs = _slotOrder.length < 2
    ? `<div style="font-size:11px;color:var(--gray-l);line-height:1.65">등록된 이미지가 1개라 전환 시간 설정이 필요하지 않습니다.</div>`
    : `<div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px">${_slotOrder.map((item, idx)=>{
        const next = _slotOrder[(idx + 1) % _slotOrder.length];
        const key = _swapDelayKey(item.slot, next.slot);
        if(!key) return '';
        return `<div>
          <div style="font-size:11px;font-weight:800;color:var(--text3);margin-bottom:6px">${item.slot} → ${next.slot}</div>
          <input type="number" data-b2-delay-key="${key}" min="0.2" max="60" step="0.1" value="${_swapDelayVal(key)}" style="width:100%;padding:8px 12px;border:1px solid var(--border2);border-radius:8px;font-size:13px">
        </div>`;
      }).join('')}</div>`;

  const modal = document.createElement('div');
  modal.id = 'b2-profile-edit-modal';
  modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:var(--z-modal-5)';
  
  modal.innerHTML = `
    <div style="background:var(--white);border-radius:16px;padding:24px;max-width:500px;width:90%;max-height:80vh;overflow-y:auto;box-shadow:0 10px 40px rgba(0,0,0,0.3)">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px">
        <h3 style="margin:0;font-size:18px;font-weight:800;color:var(--text1)">✏️ 프로필 수정</h3>
        <button onclick="document.getElementById('b2-profile-edit-modal').remove()" style="background:none;border:none;font-size:20px;cursor:pointer;color:var(--gray-l)">✕</button>
      </div>
      <div style="margin-bottom:16px">
        <label style="font-size:13px;font-weight:700;color:var(--text2);display:block;margin-bottom:6px">선수 이름</label>
        <div style="font-size:14px;color:var(--text3);padding:8px 12px;background:var(--surface);border-radius:8px">${player.name}</div>
      </div>
      <div style="margin-bottom:16px">
        <label style="font-size:13px;font-weight:700;color:var(--text2);display:block;margin-bottom:6px">프로필 이미지 1 (PC/기본) <span style="font-size:10px;font-weight:400;color:var(--gray-l)">(선택 즉시 표시)</span></label>
        <div style="display:flex;gap:8px;align-items:center">
          <input type="text" id="b2-ed-photo" value="${_media1}" placeholder="https://... 이미지 URL 입력" style="flex:1;padding:8px 12px;border:1px solid var(--border2);border-radius:8px;font-size:13px">
          <span id="b2-ed-photo-preview-wrap" style="position:relative;width:40px;height:40px;border-radius:var(--su_profile_radius,50%);overflow:hidden;flex-shrink:0;background:#e2e8f0;border:2px solid var(--border);display:${_media1&&!_media1.startsWith('data:')?'inline-block':'none'}">
            <img id="b2-ed-photo-preview" src="${_media1&&!_media1.startsWith('data:')?toHttpsUrl(_media1):''}" style="width:40px;height:40px;object-fit:cover;display:block" onerror="this.style.display='none'">
          </span>
        </div>
        <div id="b2-ed-photo-warn" style="font-size:10px;color:${_media1&&_media1.startsWith('data:')?'#dc2626':'var(--gray-l)'};margin-top:4px">${_media1&&_media1.startsWith('data:')?'❌ base64 이미지 직접 입력 불가 — imgur.com 등에 업로드 후 URL 사용':'이미지 URL을 붙여넣으면 현황판 선수 카드에 프로필 사진이 표시됩니다.'}</div>
      </div>
      <div style="margin-bottom:16px">
        <label style="font-size:13px;font-weight:700;color:var(--text2);display:block;margin-bottom:6px">프로필 이미지 2 (모바일/교체용) <span style="font-size:10px;font-weight:400;color:var(--gray-l)">(설정한 시간 후 자동 교체)</span></label>
        <div style="display:flex;gap:8px;align-items:center">
          <input type="text" id="b2-ed-second-profile" value="${_media2}" placeholder="https://... 이미지 URL 입력" style="flex:1;padding:8px 12px;border:1px solid var(--border2);border-radius:8px;font-size:13px">
          <span id="b2-ed-photo2-preview-wrap" style="position:relative;width:40px;height:40px;border-radius:12px;overflow:hidden;flex-shrink:0;background:#e2e8f0;border:2px solid var(--border);display:${_media2&&!_media2.startsWith('data:')?'inline-flex':'none'};align-items:center;justify-content:center">
            <img id="b2-ed-photo2-preview" src="${_media2&&!_media2.startsWith('data:')?toHttpsUrl(_media2).replace(/\"/g,'&quot;'):''}" style="width:40px;height:40px;object-fit:cover;display:block" onerror="this.style.display='none'">
            <video id="b2-ed-photo2-preview-vid" src="" muted playsinline loop style="width:40px;height:40px;object-fit:cover;display:none"></video>
          </span>
        </div>
        <div style="font-size:10px;color:var(--gray-l);margin-top:4px">스트리머 선택 후 설정한 시간 뒤 이 이미지로 자동 전환됩니다.</div>
      </div>
      <div style="margin-bottom:16px">
        <label style="font-size:13px;font-weight:700;color:var(--text2);display:block;margin-bottom:6px">프로필 이미지 3 (순환용)</label>
        <div style="display:flex;gap:8px;align-items:center">
          <input type="text" id="b2-ed-photo3" value="${_media3}" placeholder="https://... (gif/mp4 가능)" style="flex:1;padding:8px 12px;border:1px solid var(--border2);border-radius:8px;font-size:13px">
          <span id="b2-ed-photo3-preview-wrap" style="position:relative;width:40px;height:40px;border-radius:12px;overflow:hidden;flex-shrink:0;background:#e2e8f0;border:2px solid var(--border);display:${_media3&&!_media3.startsWith('data:')?'inline-flex':'none'};align-items:center;justify-content:center">
            <img id="b2-ed-photo3-preview" src="${_media3&&!_media3.startsWith('data:')?toHttpsUrl(_media3).replace(/\"/g,'&quot;'):''}" style="width:40px;height:40px;object-fit:cover;display:block" onerror="this.style.display='none'">
            <video id="b2-ed-photo3-preview-vid" src="" muted playsinline loop style="width:40px;height:40px;object-fit:cover;display:none"></video>
          </span>
        </div>
      </div>
      <div style="margin-bottom:16px">
        <label style="font-size:13px;font-weight:700;color:var(--text2);display:block;margin-bottom:6px">프로필 이미지 4 (순환용)</label>
        <div style="display:flex;gap:8px;align-items:center">
          <input type="text" id="b2-ed-photo4" value="${_media4}" placeholder="https://... (gif/mp4 가능)" style="flex:1;padding:8px 12px;border:1px solid var(--border2);border-radius:8px;font-size:13px">
          <span id="b2-ed-photo4-preview-wrap" style="position:relative;width:40px;height:40px;border-radius:12px;overflow:hidden;flex-shrink:0;background:#e2e8f0;border:2px solid var(--border);display:${_media4&&!_media4.startsWith('data:')?'inline-flex':'none'};align-items:center;justify-content:center">
            <img id="b2-ed-photo4-preview" src="${_media4&&!_media4.startsWith('data:')?toHttpsUrl(_media4).replace(/\"/g,'&quot;'):''}" style="width:40px;height:40px;object-fit:cover;display:block" onerror="this.style.display='none'">
            <video id="b2-ed-photo4-preview-vid" src="" muted playsinline loop style="width:40px;height:40px;object-fit:cover;display:none"></video>
          </span>
        </div>
      </div>
      <div style="margin-bottom:16px">
        <label style="font-size:13px;font-weight:700;color:var(--text2);display:block;margin-bottom:6px">프로필 이미지 5 (순환용)</label>
        <div style="display:flex;gap:8px;align-items:center">
          <input type="text" id="b2-ed-photo5" value="${_media5}" placeholder="https://... (gif/mp4 가능)" style="flex:1;padding:8px 12px;border:1px solid var(--border2);border-radius:8px;font-size:13px">
          <span id="b2-ed-photo5-preview-wrap" style="position:relative;width:40px;height:40px;border-radius:12px;overflow:hidden;flex-shrink:0;background:#e2e8f0;border:2px solid var(--border);display:${_media5&&!_media5.startsWith('data:')?'inline-flex':'none'};align-items:center;justify-content:center">
            <img id="b2-ed-photo5-preview" src="${_media5&&!_media5.startsWith('data:')?toHttpsUrl(_media5).replace(/\"/g,'&quot;'):''}" style="width:40px;height:40px;object-fit:cover;display:block" onerror="this.style.display='none'">
            <video id="b2-ed-photo5-preview-vid" src="" muted playsinline loop style="width:40px;height:40px;object-fit:cover;display:none"></video>
          </span>
        </div>
        <div style="font-size:10px;color:var(--gray-l);margin-top:4px">이미지별 탭에서 2→3→4→5(→1) 순서로 전환됩니다.</div>
      </div>
      <div style="margin-top:10px;margin-bottom:16px;padding:12px;background:rgba(37,99,235,.06);border:1px solid rgba(37,99,235,.18);border-radius:10px">
        <div style="font-size:13px;font-weight:800;color:var(--text2);margin-bottom:10px">전환 시간(초)</div>
        ${_swapDelayInputs}
        <div style="font-size:10px;color:var(--gray-l);margin-top:10px">※ 실제 존재하는 이미지 순서만 순환합니다. mp4는 끝까지 재생 후 다음 이미지로 이동합니다.</div>
      </div>
      <div style="display:flex;gap:8px;margin-top:20px">
        <button onclick="document.getElementById('b2-profile-edit-modal').remove()" style="flex:1;padding:10px 16px;background:var(--surface);border:1px solid var(--border2);border-radius:8px;color:var(--text2);font-size:13px;font-weight:600;cursor:pointer">취소</button>
        <button onclick="saveB2Profile('${player.name.replace(/'/g, "\\'")}')" style="flex:1;padding:10px 16px;background:var(--blue);border:1px solid var(--blue);border-radius:8px;color:#fff;font-size:13px;font-weight:600;cursor:pointer">저장</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  const _b2IsVideoUrl = (u)=>{
    const s = String(u||'').trim().toLowerCase().split('#')[0].split('?')[0];
    return s.endsWith('.mp4') || s.endsWith('.webm') || s.endsWith('.ogg') || s.endsWith('.mov') || s.endsWith('.m4v');
  };
  const _b2SyncSmallPreview = (inputId, wrapId, imgId, vidId)=>{
    try{
      const inp = document.getElementById(inputId);
      const wrap = document.getElementById(wrapId);
      const img = document.getElementById(imgId);
      const vid = document.getElementById(vidId);
      if(!wrap || !img || !vid) return;
      const v = String(inp?.value || '').trim();
      if(!v || v.startsWith('data:')){
        wrap.style.display = 'none';
        img.style.display = 'none';
        vid.style.display = 'none';
        img.removeAttribute('src');
        vid.removeAttribute('src');
        try{ vid.pause(); }catch(e){}
        return;
      }
      const src = toHttpsUrl(v);
      wrap.style.display = 'inline-flex';
      if(_b2IsVideoUrl(src)){
        img.style.display = 'none';
        vid.style.display = 'block';
        vid.src = src;
        try{ vid.currentTime = 0; }catch(e){}
        try{ vid.play && vid.play(); }catch(e){}
      }else{
        vid.style.display = 'none';
        try{ vid.pause(); }catch(e){}
        vid.removeAttribute('src');
        img.style.display = 'block';
        img.src = src;
      }
    }catch(e){}
  };
  
  // 첫 번째 프로필 URL 입력 시 미리보기
  const photoInput = document.getElementById('b2-ed-photo');
  if (photoInput) {
    photoInput.addEventListener('input', function() {
      const v = this.value.trim();
      const img = document.getElementById('b2-ed-photo-preview');
      const warn = document.getElementById('b2-ed-photo-warn');
      const wrap = document.getElementById('b2-ed-photo-preview-wrap');
      
      if (v && v.startsWith('data:')) {
        this.style.borderColor = '#dc2626';
        if (warn) {
          warn.style.color = '#dc2626';
          warn.textContent = '❌ base64 이미지 직접 입력 불가 — imgur.com 등에 업로드 후 URL 사용';
        }
      } else {
        this.style.borderColor = '';
        if (warn) {
          warn.textContent = '이미지 URL을 붙여넣으면 현황판 선수 카드에 프로필 사진이 표시됩니다.';
          warn.style.color = 'var(--gray-l)';
        }
      }
      
      if (v && !v.startsWith('data:')) {
        img.src = toHttpsUrl(v);
        img.style.display = 'block';
        if (wrap) wrap.style.display = 'inline-block';
      } else {
        if (wrap) wrap.style.display = 'none';
      }
    });
  }
  ['b2-ed-second-profile','b2-ed-photo3','b2-ed-photo4','b2-ed-photo5'].forEach((id, idx)=>{
    const el = document.getElementById(id);
    if(!el) return;
    const map = [
      ['b2-ed-photo2-preview-wrap','b2-ed-photo2-preview','b2-ed-photo2-preview-vid'],
      ['b2-ed-photo3-preview-wrap','b2-ed-photo3-preview','b2-ed-photo3-preview-vid'],
      ['b2-ed-photo4-preview-wrap','b2-ed-photo4-preview','b2-ed-photo4-preview-vid'],
      ['b2-ed-photo5-preview-wrap','b2-ed-photo5-preview','b2-ed-photo5-preview-vid']
    ][idx] || null;
    if(!map) return;
    el.addEventListener('input', ()=>_b2SyncSmallPreview(id, map[0], map[1], map[2]));
    _b2SyncSmallPreview(id, map[0], map[1], map[2]);
  });
}

function saveB2Profile(playerName) {
  const player = players.find(p => p.name === playerName);
  if (!player) return;
  
  const photoUrl = (document.getElementById('b2-ed-photo')?.value || '').trim();
  const secondProfileUrl = (document.getElementById('b2-ed-second-profile')?.value || '').trim();
  const thirdProfileUrl = (document.getElementById('b2-ed-photo3')?.value || '').trim();
  const fourthProfileUrl = (document.getElementById('b2-ed-photo4')?.value || '').trim();
  const fifthProfileUrl = (document.getElementById('b2-ed-photo5')?.value || '').trim();
  const clampDelay = (v)=>{
    const n = parseFloat(v);
    if(isNaN(n)) return 1;
    return Math.max(0.2, Math.min(60, n));
  };
  
  const anyBase64 = [photoUrl, secondProfileUrl, thirdProfileUrl, fourthProfileUrl, fifthProfileUrl].some(u=>u && u.startsWith('data:'));
  if (anyBase64) {
    alert('❌ 프로필 사진에 base64 이미지(data:...)를 직접 붙여넣으면 동기화 저장이 실패할 수 있습니다.\n\n이미지를 imgur.com, Discord 등에 업로드한 후 URL을 사용하세요.');
    return;
  }
  
  player.photo = photoUrl || undefined;
  player.secondProfileFile = secondProfileUrl || undefined;
  player.profileFile3 = thirdProfileUrl || undefined;
  player.profileFile4 = fourthProfileUrl || undefined;
  player.profileFile5 = fifthProfileUrl || undefined;
  try{
    document.querySelectorAll('#b2-profile-edit-modal [data-b2-delay-key]').forEach(inp=>{
      const key = String(inp?.getAttribute('data-b2-delay-key') || '').trim();
      if(!key) return;
      const v = clampDelay(inp?.value || '1');
      if(v === 1) delete player[key];
      else player[key] = v;
    });
  }catch(e){}
  
  save();

  document.getElementById('b2-profile-edit-modal').remove();

  // [FIX] 기존에는 render()로 앱 전체를 다시 그려서, 이미 캐시된 프로필 이미지들까지
  // DOM에서 새로 생성되며 재로딩되는 것처럼 느려지는 문제가 있었음.
  // 스트리머탭(board2) 화면이 열려 있으면 #b2-content만 가볍게 다시 그려서
  // 다른 선수 카드들의 <img>가 불필요하게 재생성되지 않도록 함.
  const _b2ContentEl = document.getElementById('b2-content');
  if (_b2ContentEl && typeof _b2PlayersView === 'function') {
    _b2ContentEl.innerHTML = _b2PlayersView();
    try{ if(typeof injectUnivIcons === 'function') injectUnivIcons(_b2ContentEl); }catch(e){}
    if (_b2SelectedPlayer && _b2SelectedPlayer.name === playerName) {
      _b2UpdateMainDisplay(playerName);
    }
  } else {
    // board2 화면이 아니면(다른 탭에서 저장된 경우 등) 안전하게 전체 렌더
    render();
    if (_b2SelectedPlayer && _b2SelectedPlayer.name === playerName) {
      _b2UpdateMainDisplay(playerName);
    }
  }
}

/* ══════════════════════════════════════
   🏆 티어별 뷰
══════════════════════════════════════ */
/* ══════════════════════════════════════
   🏆 티어별 뷰 v2 — 기본접힘 + 승률 + 이번주활동 + 대학분포바
══════════════════════════════════════ */
/* ══════════════════════════════════════
   🥇 랭킹 뷰 — 대학별 종합 랭킹 리더보드
══════════════════════════════════════ */
/* ══════════════════════════════════════
   🏆 랭킹 뷰 v2 — 정렬기준 전환 + 실전승률 + 순위변동
══════════════════════════════════════ */
window._b2RankingSort = window._b2RankingSort || 'tier';

