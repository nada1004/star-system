/* ══════════════════════════════════════════════════════════════
   보드2 - 선수 목록 메인 뷰 렌더러 (board2-players.js 에서 분리, 2026-07-30)
   ══════════════════════════════════════════════════════════════ */

// [FIX-NO-GRID-REFRESH] 우측 그리드의 카드 1장을 그리는 로직을 별도 함수로 분리.
// _b2PlayersView() 전체 렌더와, 저장 후 카드 1장만 갱신하는 _b2UpdatePlayerCard()가
// 이 함수를 함께 재사용해서, "카드 1개만 바뀌었는데 그리드 전체가 다시 그려지며
// 모든 사진이 새로고침되는" 문제 없이 항상 동일한 마크업을 보장한다.
// [FIX-IMG-SLOW] 그리드 카드 이미지의 loading/fetchpriority를 카드 순서에 따라
// 다르게 준다. 처음 화면에 보이는 만큼(대략 상단 2줄)만 eager+high로 즉시 받고,
// 그 아래(스크롤해야 보이는) 카드들은 lazy로 미뤄서 한꺼번에 수십~수백 장이
// 동시에 "높은 우선순위"로 요청되며 정작 화면에 보이는 이미지까지 늦게 뜨는
// 현상을 막는다.
const _B2_GRID_EAGER_COUNT = 18;
function _b2PlayersCardHTML(p, hexToRgba, idx) {
  hexToRgba = hexToRgba || ((h,a)=>{const r=parseInt(h.slice(1,3),16),g=parseInt(h.slice(3,5),16),b=parseInt(h.slice(5,7),16);return`rgba(${r},${g},${b},${a})`;});
  const _eager = (typeof idx === 'number' && idx >= 0) ? (idx < _B2_GRID_EAGER_COUNT) : true;
  const _loadAttr = _eager ? 'loading="eager" fetchpriority="high"' : 'loading="lazy"';
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
  // 우측 호버 스크럽 미리보기용 두번째 프로필 이미지 (PC 전용, 동영상 제외)
  const _gridSecondRaw = String(p.secondProfileFile || '').trim();
  const _gridSecondIsVideo = /\.(mp4|webm|ogg|mov|m4v)(\?|$)/i.test(_gridSecondRaw);
  const gridSecondPhoto = (_gridSecondRaw && !_gridSecondIsVideo) ? _gridSecondRaw : '';
  const _gridSecondIsGif = /\.gif(\?|$)/i.test(_gridSecondRaw);
  // gif는 toScaledUrl(webp 변환 프록시)을 거치면 정지 이미지가 되므로 원본 URL을 그대로 사용
  const gridSecondSrc = gridSecondPhoto ? (_gridSecondIsGif ? toHttpsUrl(gridSecondPhoto) : toScaledUrl(gridSecondPhoto,260)) : '';

  return `
      <div class="b2-players-card" data-player-name="${(typeof escAttr==='function'?escAttr(p.name||''):String(p.name||'').replace(/"/g,'&quot;'))}" data-player-key="${encodedPlayerName}" onclick="_b2UpdateMainDisplay(decodeURIComponent(this.dataset.playerKey||''))"${gridSecondPhoto ? ` onmousemove="_b2CardHoverScrub(event,this)" onmouseleave="_b2CardHoverLeave(this)"` : ''} style="position:relative;cursor:pointer;border-radius:18px;overflow:hidden;aspect-ratio:3/4;background:${playerTheme.bg};border:1.5px solid ${tierCol}66;isolation:isolate">
        ${p.photo
          ? `<img src="${toScaledUrl(p.photo,260)}" data-orig="${toHttpsUrl(p.photo)}" ${_loadAttr} decoding="async" alt="${p.name}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:top center;z-index:0" onerror="if(this.dataset.orig&&this.src!==this.dataset.orig){this.src=this.dataset.orig;}else{this.style.display='none';this.nextElementSibling.style.display='flex'}">
             <div style="position:absolute;inset:0;display:none;align-items:center;justify-content:center;background:${playerTheme.bg};font-size:44px;font-weight:900;color:${tierCol};z-index:0">${(p.name||'?')[0]}</div>`
          : `<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:${playerTheme.bg};font-size:44px;font-weight:900;color:${tierCol};z-index:0">${(p.name||'?')[0]}</div>`
        }
        ${gridSecondPhoto
          ? `<img class="b2-players-card-secondary" src="${gridSecondSrc}" data-orig="${toHttpsUrl(gridSecondPhoto)}" loading="lazy" decoding="async" alt="" onerror="if(this.dataset.orig&&this.src!==this.dataset.orig){this.src=this.dataset.orig;}else{this.remove()}">`
          : ''
        }
        ${p.tier?`<span style="position:absolute;top:8px;left:8px;z-index:2;font-size:10px;font-weight:900;padding:1px 6px;border-radius:999px;background:${tierCol};color:${tierTc};line-height:1.5;opacity:.8">${p.tier}</span>`:''}
        <div style="position:absolute;bottom:0;left:0;right:0;z-index:2;padding:9px 10px 10px">
          <div style="display:flex;align-items:center;gap:5px;overflow:hidden">
            ${raceTxt?`<span class="rbadge r${raceTxt}" style="flex-shrink:0;font-size:10px;padding:1px 6px;opacity:.8">${raceTxt}</span>`:''}
            <span style="color:rgba(255,255,255,.85);font-size:var(--fs-base);font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;letter-spacing:-.01em;text-shadow:0 2px 8px rgba(0,0,0,.75),0 1px 3px rgba(0,0,0,.9)">${p.name||''}</span>
          </div>
          <div style="display:flex;align-items:center;gap:5px;margin-top:3px;flex-wrap:nowrap;overflow:hidden">
            ${gridUnivIcon?`<img src="${toHttpsUrl(gridUnivIcon)}" onerror="this.style.display='none'" style="flex-shrink:0;width:16px;height:16px;object-fit:contain;opacity:.85;filter:drop-shadow(0 1px 3px rgba(0,0,0,.8))">`:''}
            <span style="font-size:10.5px;color:rgba(255,255,255,.75);font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-shadow:0 2px 8px rgba(0,0,0,.85),0 1px 3px rgba(0,0,0,.95)">${p.univ||'무소속'}</span>
          </div>
        </div>
      </div>
    `;
}

// [FIX-NO-GRID-REFRESH] 프로필 저장 후 "이 선수 카드 1장"만 그리드에서 교체한다.
// 기존에는 저장할 때마다 #b2-content 전체(=그리드의 모든 <img>)를 innerHTML로
// 다시 만들어서, 방금 수정한 선수뿐 아니라 화면에 있던 다른 모든 스트리머의 사진까지
// 브라우저가 새로 요청/디코딩하며 "전체가 새로고침되는" 것처럼 보였다.
// 이제는 해당 선수의 카드 엘리먼트만 찾아 outerHTML을 교체해서 나머지 카드는
// DOM에 전혀 손대지 않는다(=이미지 재요청 없음).
function _b2UpdatePlayerCard(playerName) {
  try {
    const p = players.find(x => x.name === playerName);
    if (!p) return false;
    const key = encodeURIComponent(String(playerName || ''));
    const cardEl = document.querySelector(`.b2-players-card[data-player-key="${key}"]`);
    if (!cardEl) return false;
    const wrap = document.createElement('div');
    wrap.innerHTML = _b2PlayersCardHTML(p);
    const newCard = wrap.firstElementChild;
    if (!newCard) return false;
    cardEl.replaceWith(newCard);
    return true;
  } catch (e) {
    return false;
  }
}
try{ window._b2UpdatePlayerCard = _b2UpdatePlayerCard; }catch(e){}

function _b2PlayersView() {
  const dissolvedUnivs = typeof univCfg !== 'undefined' ? new Set((univCfg.filter(u => u.dissolved) || []).map(u => u.name)) : new Set();
  const visPlayers = players.filter(p => {
    if (p.hidden || p.retired || p.hideFromBoard) return false;
    if (dissolvedUnivs.has(p.univ)) return false;
    const _u = String(p?.univ || '').trim();
    if (_u === 'YB' || _u === '무소속' || !_u) return false;
    return true;
  });
  
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
  // (대학 소속 스트리머만 대상 — YB/무소속은 위 visPlayers 단계에서 이미 제외됨)
  // [복원] 이전 요청으로 "고정"으로 바꿨었으나, 이 랜덤은 이미지 순환 버그와 무관한
  // 의도된 기능(탭 진입 시 매번 다른 대학 소속 스트리머 노출)이라 원복함.
  // 대신 render-nav-lazy.js의 _TAB_ENTER.board2 훅에서 board2 탭에 "새로 진입할 때"만
  // _b2SelectedPlayer/셔플 캐시를 초기화해서, 같은 탭 안에서 필터만 바꿀 때는
  // 화면이 계속 랜덤으로 튀지 않고 유지되도록 한다.
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
  // [복원] 이 옵션도 이미지 순환 버그와 무관한 의도된 랜덤 기능이라 원복함.
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
    const roleOrderByLen = [...roleOrder].sort((a,b)=>b.length-a.length);
    const _roleIdx = (p) => {
      // 직책 편집에서 "표시 순서 직접 지정"(roleOrder 숫자)을 해뒀으면 자동 판정보다 우선한다.
      if (p && typeof p.roleOrder === 'number' && !isNaN(p.roleOrder)) return p.roleOrder;
      const r = (p && p.role) || '';
      const exact = roleOrder.indexOf(r);
      if (exact >= 0) return exact;
      // 직책란에 두 직책을 함께 적어도(예: "이사장 & 회장") 알려진 키워드가 포함돼 있으면
      // 그 순위를 그대로 적용해 현황판 순서가 바뀌지 않게 한다.
      for (const key of roleOrderByLen) { if (r.includes(key)) return roleOrder.indexOf(key); }
      return -1;
    };
    const tierOrder = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '유스'];

    tierFilteredPlayers.sort((a, b) => {
      // 직급 우선 정렬 (이사장, 총장, 교수, 코치)
      const aRoleIdx = _roleIdx(a);
      const bRoleIdx = _roleIdx(b);
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
        border-radius:var(--r2);
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
        z-index: 60;
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
        border-radius:var(--r);
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
      .b2-players-card-secondary {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: top center;
        z-index: 0;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.22s ease;
      }
      @media (hover: hover) and (pointer: fine) {
        .b2-players-card-secondary.is-visible {
          opacity: 1;
        }
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
  const _normMediaUrl = (v)=>{
    const s = String(v == null ? '' : v).trim();
    if(!s) return '';
    const lower = s.toLowerCase();
    if(lower === 'null' || lower === 'undefined' || lower === 'about:blank' || lower === 'javascript:void(0)' || lower === '#') return '';
    return s;
  };
  const _hasMediaUrl = (v)=>!!_normMediaUrl(v);
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
  const _p6pos = _b2PosPct(_b2SelectedPlayer.photo6PosUse, _b2SelectedPlayer.photo6PosX, _b2SelectedPlayer.photo6PosY);
  const _p7pos = _b2PosPct(_b2SelectedPlayer.photo7PosUse, _b2SelectedPlayer.photo7PosX, _b2SelectedPlayer.photo7PosY);
  const _p8pos = _b2PosPct(_b2SelectedPlayer.photo8PosUse, _b2SelectedPlayer.photo8PosX, _b2SelectedPlayer.photo8PosY);
  const _p9pos = _b2PosPct(_b2SelectedPlayer.photo9PosUse, _b2SelectedPlayer.photo9PosX, _b2SelectedPlayer.photo9PosY);
  const _p10pos = _b2PosPct(_b2SelectedPlayer.photo10PosUse, _b2SelectedPlayer.photo10PosX, _b2SelectedPlayer.photo10PosY);
  try{
    // [FIX-IMG-SWAP-PREWARM] 우측 그리드 썸네일은 기존처럼 썸네일 프록시로 미리 받고,
    // 좌측 메인 슬라이드쇼(선수 탭 최초 진입 시 표시되는 선수)의 이미지도 실제 표시에
    // 쓰이는 URL 그대로 미리 받아야 전환 시 콜드 로딩으로 인한
    // "화면이 비었다가 뚝 끊기듯 나타나는" 현상이 없다 (board2-players-main-display.js의
    // _b2UpdateMainDisplay와 동일한 수정).
    // [FIX-IMG-HERO-SCALED] 예전엔 여기서 toHttpsUrl(원본)을 그대로 프리웜해서,
    // 원본 사진이 수백KB~수MB인 경우 프로필탭 좌측 히어로 이미지가 늦게 뜨는 원인이
    // 됐다. 아래 _b2MainMediaHTML과 동일하게 리사이즈 프록시(toScaledUrl)를 써서
    // "프리웜 URL === 실제 표시 URL"을 유지하면서도 훨씬 가벼운 이미지를 받는다.
    if(typeof prewarmImageUrls==='function'){
      prewarmImageUrls(tierFilteredPlayers.map(p=>p.photo).filter(Boolean), 24);
    }
    const _b2InitPrewarmIsVideo = (u)=>{
      const s = String(u||'').trim().toLowerCase().split('#')[0].split('?')[0];
      return s.endsWith('.mp4') || s.endsWith('.webm') || s.endsWith('.ogg') || s.endsWith('.mov') || s.endsWith('.m4v');
    };
    const _b2InitPrewarmIsGif = (u)=>{
      const s = String(u||'').trim().toLowerCase().split('#')[0].split('?')[0];
      return s.endsWith('.gif');
    };
    // [FIX-IMG-SLOW] 슬롯1(선택된 선수의 대표 사진)은 아래 _slot1의 <img>가
    // fetchpriority="high"로 바로 요청하므로, 여기서 동시에 new Image()로 같은 URL을
    // 또 요청하면 지금 화면에 보이는 이미지 요청과 우선순위를 다투게 돼 오히려 늦게
    // 뜨는 원인이 됐다. 슬롯1은 건너뛰고 나머지 슬라이드쇼용 슬롯부터 프리웜한다.
    // [FIX-IMG-SLOT-LATE] requestIdleCallback으로 미루면 브라우저가 바쁠 때 다음 전환
    // 시점까지도 프리웜이 안 끝나 "2~10번 이미지가 늦게 뜬다"는 원인이 됐다 — 슬롯 순서대로
    // 짧은 간격(80ms)만 두고 곧바로 요청을 시작하도록 바꾼다.
    [
      _b2SelectedPlayer.photo, _b2SelectedPlayer.secondProfileFile, _b2SelectedPlayer.profileFile3,
      _b2SelectedPlayer.profileFile4, _b2SelectedPlayer.profileFile5, _b2SelectedPlayer.profileFile6,
      _b2SelectedPlayer.profileFile7, _b2SelectedPlayer.profileFile8, _b2SelectedPlayer.profileFile9,
      _b2SelectedPlayer.profileFile10
    ].forEach((rawUrl, _slotIdx)=>{
      if(_slotIdx === 0) return; // 슬롯1은 아래에서 이미 high-priority로 로딩됨
      const u = _normMediaUrl(rawUrl);
      if(!u || _b2InitPrewarmIsVideo(u)) return;
      // [FIX-GIF-STATIC] gif는 실제 표시(_b2MainMediaHTML)와 동일하게 원본 그대로 프리웜
      const src = _b2InitPrewarmIsGif(u) ? toHttpsUrl(u) : ((typeof toScaledUrl==='function') ? toScaledUrl(u, 960) : toHttpsUrl(u));
      if(!src) return;
      window._b2PrewarmedFullUrls = window._b2PrewarmedFullUrls || new Set();
      if(window._b2PrewarmedFullUrls.has(src)) return;
      window._b2PrewarmedFullUrls.add(src);
      setTimeout(()=>{
        try{
          const _img = new Image();
          try{ _img.decoding = 'async'; }catch(e){}
          _img.src = src;
        }catch(e){}
      }, _slotIdx * 80);
    });
  }catch(e){}

  const _b2IsVideoUrl = (u)=>{
    const s = String(u||'').trim().toLowerCase().split('#')[0].split('?')[0];
    return s.endsWith('.mp4') || s.endsWith('.webm') || s.endsWith('.ogg') || s.endsWith('.mov') || s.endsWith('.m4v');
  };
  // [FIX-GIF-STATIC] gif는 리사이즈 프록시를 거치면 webp로 재인코딩되며 애니메이션이
  // 사라지므로(첫 프레임만 남는 정지 이미지) 원본 URL을 그대로 사용한다.
  const _b2IsGifUrl = (u)=>{
    const s = String(u||'').trim().toLowerCase().split('#')[0].split('?')[0];
    return s.endsWith('.gif');
  };
  const _b2MainMediaHTML = (slot, rawUrl, opt)=>{
    const url = String(rawUrl||'').trim();
    if(!url) return '';
    const isVid = _b2IsVideoUrl(url);
    const isGif = !isVid && _b2IsGifUrl(url);
    // [FIX-IMG-HERO-SCALED] 비디오/gif는 원본 그대로, 일반 사진은 리사이즈 프록시로 —
    // 위 프리웜 루프와 동일한 toScaledUrl(u,960)을 써야 프리웜 캐시가 그대로 적중한다.
    const _rawHttps = toHttpsUrl(url);
    const src = (isVid || isGif) ? _rawHttps : ((typeof toScaledUrl==='function') ? toScaledUrl(url, 960) : _rawHttps);
    const z = opt && opt.z != null ? opt.z : slot;
    const opacity = opt && opt.opacity != null ? opt.opacity : (slot===1?1:0);
    const style = opt && opt.style ? opt.style : '';
    const onLoadJs = opt && opt.onLoadJs ? String(opt.onLoadJs) : '';
    const evAttr = onLoadJs ? (isVid ? 'onloadedmetadata' : 'onload') : '';
    const evPart = onLoadJs ? ` ${evAttr}="${onLoadJs}"` : '';
    const common = `class="b2-players-main-image" id="b2-main-img-${slot}" data-orig="${_rawHttps}" style="position:absolute;inset:0;width:100%;height:100%;min-width:100%;min-height:100%;z-index:${z};opacity:${opacity};pointer-events:none;${style}"`;
    // [FIX-IMG-HERO-BLANK-PROXY] 리사이즈 프록시가 큰 이미지 처리 중 실패하는 경우
    // 같은 URL을 재시도해봐야 또 실패해 화면이 완전히 비어버렸다. 이제는 실패 시
    // 프록시를 거치지 않은 원본 URL(data-orig)로 바로 전환해서 시도하고, 그것도
    // 실패해야 완전히 숨긴다 — 그리드 카드와 동일한 폴백 방식.
    const onErrJs = `var _t=this;var _fail=function(){_t.dataset.b2Broken='1';_t.style.opacity='0';_t.style.visibility='hidden';try{if(typeof window._b2HandleMediaFailure==='function'){window._b2HandleMediaFailure(_t);}}catch(e){}};var _n=(parseInt(_t.dataset.b2ErrCount||'0',10)+1);_t.dataset.b2ErrCount=_n;var _o=_t.dataset.orig||'';if(_n===1&&_o&&_t.src!==_o){_t.src=_o;}else{_fail();}`;
    if(isVid){
      // [FIX-VIDEO-NOT-PLAYING] 지금 바로 보이는 슬롯(opacity 1)은 preload="auto"로
      // 미리 버퍼링해서 즉시 재생되게 하고, 아직 안 보이는 슬롯은 metadata만 받는다.
      const _vidPreload = (Number(opacity) === 1) ? 'auto' : 'metadata';
      return `<video ${common} src="${src}" preload="${_vidPreload}" muted playsinline${evPart} onerror="${onErrJs}"></video>`;
    }
    return `<img ${common} src="${src}" decoding="async" fetchpriority="high"${evPart} onerror="${onErrJs}">`;
  };
  const _b2NameEsc = _b2SelectedPlayer.name.replace(/'/g,"\\'");
  // [FEATURE-HERO-NO-IMAGE-REVERTED] 좌측 히어로 이미지 표시를 복원한다.
  const _b2HeroShowMedia = true;
  const _slot1 = (_b2HeroShowMedia && _hasMediaUrl(_b2SelectedPlayer.photo))
    ? _b2MainMediaHTML(1, _b2SelectedPlayer.photo, {
      z: 1,
      opacity: 1,
      onLoadJs: `if(typeof _b2SwapStartOnce==='function'){ _b2SwapStartOnce('${_b2NameEsc}', this); }else if(typeof _b2ScheduleImageSwap==='function'){ _b2ScheduleImageSwap('${_b2NameEsc}'); } if(typeof _b2ApplyImgSettingsToDom==='function'){ _b2ApplyImgSettingsToDom('${_b2NameEsc}', 'primary'); }`,
      style: `object-fit:${primarySettings.fit || 'cover'};object-position:center center;transform:${_b2GetImgTransform(primarySettings)};filter:brightness(${(primarySettings.brightness || 100) / 100});transition:opacity 0.4s ease;`
    })
    : '';
  const _slot2 = (_b2HeroShowMedia && _hasMediaUrl(_b2SelectedPlayer.secondProfileFile))
    ? _b2MainMediaHTML(2, _b2SelectedPlayer.secondProfileFile, {
      z: 2,
      opacity: 0,
      onLoadJs: `if(typeof _b2ApplyImgSettingsToDom==='function'){ _b2ApplyImgSettingsToDom('${_b2NameEsc}', 'secondary'); }`,
      style: `object-fit:${secondarySettings.fit || 'cover'};object-position:center center;transform:${_b2GetImgTransform(secondarySettings)};filter:brightness(${(secondarySettings.brightness || 100) / 100});transition:opacity 0.4s ease;`
    })
    : '';
  const _slot3 = (_b2HeroShowMedia && _hasMediaUrl(_b2SelectedPlayer.profileFile3))
    ? _b2MainMediaHTML(3, _b2SelectedPlayer.profileFile3, { z:3, opacity:0, style:`object-fit:cover;object-position:${_p3pos};transition:opacity 0.4s ease;` })
    : '';
  const _slot4 = (_b2HeroShowMedia && _hasMediaUrl(_b2SelectedPlayer.profileFile4))
    ? _b2MainMediaHTML(4, _b2SelectedPlayer.profileFile4, { z:4, opacity:0, style:`object-fit:cover;object-position:${_p4pos};transition:opacity 0.4s ease;` })
    : '';
  const _slot5 = (_b2HeroShowMedia && _hasMediaUrl(_b2SelectedPlayer.profileFile5))
    ? _b2MainMediaHTML(5, _b2SelectedPlayer.profileFile5, { z:5, opacity:0, style:`object-fit:cover;object-position:${_p5pos};transition:opacity 0.4s ease;` })
    : '';
  const _slot6 = (_b2HeroShowMedia && _hasMediaUrl(_b2SelectedPlayer.profileFile6))
    ? _b2MainMediaHTML(6, _b2SelectedPlayer.profileFile6, { z:6, opacity:0, style:`object-fit:cover;object-position:${_p6pos};transition:opacity 0.4s ease;` })
    : '';
  const _slot7 = (_b2HeroShowMedia && _hasMediaUrl(_b2SelectedPlayer.profileFile7))
    ? _b2MainMediaHTML(7, _b2SelectedPlayer.profileFile7, { z:7, opacity:0, style:`object-fit:cover;object-position:${_p7pos};transition:opacity 0.4s ease;` })
    : '';
  const _slot8 = (_b2HeroShowMedia && _hasMediaUrl(_b2SelectedPlayer.profileFile8))
    ? _b2MainMediaHTML(8, _b2SelectedPlayer.profileFile8, { z:8, opacity:0, style:`object-fit:cover;object-position:${_p8pos};transition:opacity 0.4s ease;` })
    : '';
  const _slot9 = (_b2HeroShowMedia && _hasMediaUrl(_b2SelectedPlayer.profileFile9))
    ? _b2MainMediaHTML(9, _b2SelectedPlayer.profileFile9, { z:9, opacity:0, style:`object-fit:cover;object-position:${_p9pos};transition:opacity 0.4s ease;` })
    : '';
  const _slot10 = (_b2HeroShowMedia && _hasMediaUrl(_b2SelectedPlayer.profileFile10))
    ? _b2MainMediaHTML(10, _b2SelectedPlayer.profileFile10, { z:10, opacity:0, style:`object-fit:cover;object-position:${_p10pos};transition:opacity 0.4s ease;` })
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
        ${_slot6}
        ${_slot7}
        ${_slot8}
        ${_slot9}
        ${_slot10}
        
        <!-- 이미지 컨트롤 패널 - 관리자(로그인)만 렌더 [BUGFIX-IMG-SETTINGS] -->
        ${isLoggedIn ? `<div class="b2-players-img-controls" id="b2-img-controls" style="display:none">
          <div class="b2-players-controls-title">🎨 이미지 설정</div>
          ${_b2BuildImageControlGroup(safeName, 'primary', '이미지 1', hasPrimary)}
          ${_b2BuildImageControlGroup(safeName, 'secondary', '이미지 2', hasSecondary)}
        </div>` : ''}
        
        <!-- 컨트롤 패널 토글 버튼 - 관리자(로그인 사용자)만 표시 [BUGFIX-IMG-SETTINGS] -->
        ${isLoggedIn ? `<button onclick="document.getElementById('b2-img-controls').style.display=document.getElementById('b2-img-controls').style.display==='none'?'block':'none'" style="position:absolute;top:16px;right:16px;z-index:var(--z-fixed);padding:8px 12px;background:rgba(0,0,0,0.75);backdrop-filter:blur(10px);border-radius:8px;color:#fff;font-size:var(--fs-sm);font-weight:700;cursor:pointer;border:1px solid rgba(255,255,255,0.2)">⚙️ 설정</button>` : ''}
        
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
          ${isLoggedIn ? `<button onclick="openB2ProfileEditModal('${_b2SelectedPlayer.name.replace(/'/g, "\\'")}')" style="margin-top:12px;padding:8px 16px;background:#fff;border:2px solid rgba(255,255,255,0.5);border-radius:20px;color:var(--text1);font-size:var(--fs-base);font-weight:700;cursor:pointer;transition:all 0.3s ease;box-shadow:0 2px 8px rgba(0,0,0,0.2)" onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 4px 12px rgba(0,0,0,0.3)'" onmouseout="this.style.transform='';this.style.boxShadow='0 2px 8px rgba(0,0,0,0.2)'">✏️ 프로필 수정</button>` : ''}
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

  _gridShow.forEach((p, idx) => {
    h += _b2PlayersCardHTML(p, hexToRgba, idx);
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

