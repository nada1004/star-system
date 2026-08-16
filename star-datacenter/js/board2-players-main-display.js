/* ══════════════════════════════════════════════════════════════
   보드2 - 메인 디스플레이 갱신 (board2-players.js 에서 분리, 2026-07-30)
   ══════════════════════════════════════════════════════════════ */

function _b2UpdateMainDisplay(playerName) {
  const player = players.find(p => p.name === playerName);
  if (!player) return;
  const _normMediaUrl = (v)=>{
    const s = String(v == null ? '' : v).trim();
    if(!s) return '';
    const lower = s.toLowerCase();
    if(lower === 'null' || lower === 'undefined' || lower === 'about:blank' || lower === 'javascript:void(0)' || lower === '#') return '';
    return s;
  };
  // [FIX-IMG-SWAP-PREWARM] 기존에는 prewarmImageUrls()가 썸네일 프록시 URL
  // (images.weserv.nl, 96px webp)만 미리 받아뒀는데, 실제 크로스페이드 슬라이드쇼의
  // <img src>는 toHttpsUrl()로 만든 "원본 그대로의" URL이라 서로 다른 리소스였음.
  // 즉 미리 받아둔 캐시가 실제 화면에 쓰이는 이미지와 전혀 무관해서 전환 시점에
  // 원본이 처음부터 새로 다운로드되며 "화면이 잠깐 비었다가 뚝 끊기듯 나타나는"
  // 현상의 원인이었다. 또한 photo/secondProfileFile(슬롯1~2)만 미리 받고 3~10번
  // (예: 새로 추가한 스트리머용 3번째 이미지)은 아예 미리 받지 않아서 그 슬롯이
  // 처음 순환될 때 항상 콜드 로딩이었다.
  // [FIX-IMG-HERO-SCALED] 그런데 여기서 "실제로 표시되는 원본"을 toHttpsUrl()로만
  // 미리 받다 보니, 원본 사진이 수백KB~수MB인 경우 좌측 메인(히어로) 이미지가 늦게
  // 뜨는 원인이 됐다. 그리드/호버팝업 등 다른 화면은 전부 images.weserv.nl 리사이즈
  // 프록시(toScaledUrl/toThumbUrl)를 쓰는데 이 히어로 슬라이드쇼만 원본을 그대로 썼음.
  // 이제 표시(_b2MainMediaHTML)와 프리웜이 항상 "같은" toScaledUrl() 결과를 쓰도록
  // 통일해서, 리사이즈된(훨씬 가벼운) 이미지를 프리웜 → 즉시 캐시 히트로 표시한다.
  try{
    const _b2PrewarmIsVideo = (u)=>{
      const s = String(u||'').trim().toLowerCase().split('#')[0].split('?')[0];
      return s.endsWith('.mp4') || s.endsWith('.webm') || s.endsWith('.ogg') || s.endsWith('.mov') || s.endsWith('.m4v');
    };
    const _b2PrewarmIsGif = (u)=>{
      const s = String(u||'').trim().toLowerCase().split('#')[0].split('?')[0];
      return s.endsWith('.gif');
    };
    const _b2PrewarmSlots = [
      player.photo, player.secondProfileFile, player.profileFile3, player.profileFile4,
      player.profileFile5, player.profileFile6, player.profileFile7, player.profileFile8,
      player.profileFile9, player.profileFile10
    ];
    // [FIX-IMG-SLOW] 슬롯1(player.photo)은 지금 바로 화면에 그려지는 <img id="b2-main-img-1">이
    // 이미 fetchpriority="high"로 직접 요청하므로 여기서 또 한 번 new Image()로 같은 URL을
    // 동시에 요청하면 같은 순간에 요청이 두 배로 몰려 정작 화면에 보이는 이미지가 늦게 뜨는
    // 원인이 됐다. 슬롯1은 건너뛰고 나머지 슬롯부터 프리웜한다.
    // [FIX-IMG-SLOT-LATE] requestIdleCallback으로 미루면(최대 1.5초 + 브라우저가 바쁠 때는
    // 더 늦게) 슬라이드쇼가 다음 슬롯(보통 4초 뒤)으로 넘어갈 때까지도 프리웜이 안 끝나서
    // "2~10번 이미지가 전환될 때마다 늦게 뜬다"는 원인이 됐다. 이제는 슬롯 순서대로 아주
    // 짧은 간격(80ms)만 두고 곧바로 요청을 시작해서, 슬롯1과 완전히 동시에 몰리는 것만
    // 피하면서도 다음 전환 시점 전에 충분히 미리 받아두게 한다.
    _b2PrewarmSlots.forEach((rawUrl, _slotIdx)=>{
      if(_slotIdx === 0) return; // 슬롯1은 위에서 이미 high-priority로 로딩됨
      const u = _normMediaUrl(rawUrl);
      if(!u || _b2PrewarmIsVideo(u)) return;
      // [FIX-GIF-STATIC] gif는 리사이즈 프록시를 거치면 애니메이션이 사라지므로,
      // 실제 표시(_b2MainMediaHTML)와 동일하게 원본 URL 그대로 프리웜해야 한다.
      const src = _b2PrewarmIsGif(u) ? toHttpsUrl(u) : ((typeof toScaledUrl==='function') ? toScaledUrl(u, 960) : toHttpsUrl(u));
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
  
  _b2SelectedPlayer = player;
  // localStorage 저장 제거 - 새로고침 시 랜덤 선수 선택을 위해
  // 🎵 스트리머 전용 BGM — 현황판 프로필탭에서 스트리머 클릭(선택) 시 자동 재생
  try{ if(typeof _plyrBgmStart==='function') _plyrBgmStart(player); }catch(e){}
  
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
  const _p6pos = _b2PosPct(player.photo6PosUse, player.photo6PosX, player.photo6PosY);
  const _p7pos = _b2PosPct(player.photo7PosUse, player.photo7PosX, player.photo7PosY);
  const _p8pos = _b2PosPct(player.photo8PosUse, player.photo8PosX, player.photo8PosY);
  const _p9pos = _b2PosPct(player.photo9PosUse, player.photo9PosX, player.photo9PosY);
  const _p10pos = _b2PosPct(player.photo10PosUse, player.photo10PosX, player.photo10PosY);
  const _b2IsVideoUrl = (u)=>{
    const s = String(u||'').trim().toLowerCase().split('#')[0].split('?')[0];
    return s.endsWith('.mp4') || s.endsWith('.webm') || s.endsWith('.ogg') || s.endsWith('.mov') || s.endsWith('.m4v');
  };
  // [FIX-GIF-STATIC] gif는 images.weserv.nl 리사이즈 프록시(toScaledUrl)를 거치면
  // webp로 재인코딩되면서 애니메이션이 사라지고 첫 프레임만 남는 정지 이미지가
  // 됐다. 그리드 카드(우측)는 이미 gif를 원본 그대로 쓰도록 처리돼 있었는데
  // 좌측 히어로 슬라이드쇼만 빠져 있었음 — 동일하게 처리한다.
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
    // [FIX-IMG-HERO-RELIABLE] 리사이즈 프록시(images.weserv.nl)를 거치면 더 가볍게
    // 받을 수는 있지만, 여러 차례 확인해본 결과 이 프록시가 큰 이미지를 처리하다
    // 실패/지연되는 경우가 반복적으로 있었고 그때마다 좌측 히어로 이미지가 계속
    // 안 보이는 문제로 이어졌다. 우측 그리드 썸네일처럼 작은 크기는 프록시가 안정적
    // 이지만, 히어로처럼 큰 크기는 신뢰도가 떨어지므로 — 여기서는 아예 프록시를
    // 거치지 않고 원본 URL을 그대로 사용해 "안 보이는 것보다는 확실히 보이는 것"을
    // 우선한다.
    const src = _rawHttps;
    const z = opt && opt.z != null ? opt.z : slot;
    const opacity = opt && opt.opacity != null ? opt.opacity : (slot===1?1:0);
    const style = opt && opt.style ? opt.style : '';
    const onLoadJs = opt && opt.onLoadJs ? String(opt.onLoadJs) : '';
    const evAttr = onLoadJs ? (isVid ? 'onloadedmetadata' : 'onload') : '';
    const evPart = onLoadJs ? ` ${evAttr}="${onLoadJs}"` : '';
    const common = `class="b2-players-main-image" id="b2-main-img-${slot}" data-orig="${_rawHttps}" style="position:absolute;inset:0;width:100%;height:100%;min-width:100%;min-height:100%;z-index:${z};opacity:${opacity};pointer-events:none;${style}"`;
    // [FIX-IMG-HERO-BLANK-PROXY] 예전에는 로딩 실패 시 "같은(리사이즈 프록시) URL"을 그대로
    // 한 번 더 재시도했다. 그런데 원본 사진이 커서(수백KB~수MB) 리사이즈 프록시가 처리 중
    // 타임아웃/일시 오류를 내는 경우, 같은 URL을 다시 시도해도 똑같이 실패해서 결국
    // 화면이 완전히 비어버렸다(그리드 썸네일처럼 작은 크기 요청은 잘 되는데 히어로처럼
    // 큰 크기 요청만 유독 실패하는 경우가 이 패턴과 정확히 일치). 이제는 실패하면 먼저
    // 리사이즈 프록시를 거치지 않은 원본 URL(data-orig)로 바로 전환해서 시도하고,
    // 그것도 실패해야 완전히 숨긴다 — 그리드 카드에서 이미 쓰고 있는 것과 동일한 폴백.
    const onErrJs = `var _t=this;var _fail=function(){_t.dataset.b2Broken='1';_t.style.opacity='0';_t.style.visibility='hidden';try{if(typeof window._b2HandleMediaFailure==='function'){window._b2HandleMediaFailure(_t);}}catch(e){}};var _n=(parseInt(_t.dataset.b2ErrCount||'0',10)+1);_t.dataset.b2ErrCount=_n;var _o=_t.dataset.orig||'';if(_n===1&&_o&&_t.src!==_o){_t.src=_o;}else{_fail();}`;
    if(isVid){
      // [FIX-VIDEO-NOT-PLAYING] preload="metadata"만 쓰면 실제 프레임 데이터를 전혀
      // 미리 받아두지 않아서, 이 슬롯이 활성화되어 play()가 호출되는 순간부터에서야
      // 데이터를 받기 시작해 "재생이 안 되는" 것처럼 멈춰 보였다. 지금 바로 보이는
      // 슬롯(opacity 1)은 auto로 미리 버퍼링해서 즉시 재생되게 하고, 아직 안 보이는
      // 슬롯은 metadata만 받아 불필요한 트래픽을 피한다.
      const _vidPreload = (Number(opacity) === 1) ? 'auto' : 'metadata';
      return `<video ${common} src="${src}" preload="${_vidPreload}" muted playsinline${evPart} onerror="${onErrJs}"></video>`;
    }
    // [REMOVED-BLUR-UP] 로딩 중 작은 썸네일을 흐릿하게 먼저 깔아두던 블러업 레이어를
    // 제거했다(전환 때마다 사진이 흐릿하게 보인다는 피드백). 이제 원본 <img>만 바로
    // 그려서 로드가 끝나기 전까지는 그냥 투명(opacity 0)한 채로 있다가, 로드가 끝나면
    // 곧바로 선명하게 나타난다.
    const _combinedEvPart = onLoadJs ? ` onload="${onLoadJs}"` : '';
    return `<img ${common} src="${src}" decoding="async" fetchpriority="high"${_combinedEvPart} onerror="${onErrJs}">`;
  };
  const _nameEsc = player.name.replace(/'/g,"\\'");
  // [FEATURE-HERO-NO-IMAGE-REVERTED] 좌측 히어로 이미지를 항상 숨기던 처리를
  // 되돌려, 실제 등록된 사진/영상이 있으면 다시 표시하도록 복원한다.
  const _hasMediaUrl2 = _normMediaUrl;
  // [FIX-IMG-FIRST-SLOT-EMPTY] 예전에는 슬롯1(player.photo)에만 opacity:1과
  // 순환 시작 트리거(onLoadJs)를 하드코딩해뒀다. 그래서 슬롯1(대표 사진)이
  // 비어있고 2~10번에만 사진이 등록된 선수는 아무 슬롯도 opacity:1이 아니라서
  // 히어로 영역에 아무것도 안 보이고, 순환 시작 트리거도 없어 슬라이드쇼 자체가
  // 켜지지 않는 문제가 있었다. 이제는 "실제로 등록된 첫 번째 슬롯"을 찾아 그
  // 슬롯이 opacity:1과 순환 시작 트리거를 갖도록 한다(슬롯1이 있으면 기존과 동일).
  const _mediaSlots = [
    { slot:1, url:player.photo }, { slot:2, url:player.secondProfileFile },
    { slot:3, url:player.profileFile3 }, { slot:4, url:player.profileFile4 },
    { slot:5, url:player.profileFile5 }, { slot:6, url:player.profileFile6 },
    { slot:7, url:player.profileFile7 }, { slot:8, url:player.profileFile8 },
    { slot:9, url:player.profileFile9 }, { slot:10, url:player.profileFile10 }
  ];
  const _firstMediaSlot = (_mediaSlots.find(x => _hasMediaUrl2(x.url)) || {}).slot;
  // 슬롯1/2는 _b2ApplyImgSettingsToElement가 object-fit을 별도 관리하므로 제외하고,
  // 3~10번이 "첫 표시 슬롯"이 될 때만 object-fit:cover를 명시해 찌그러짐을 막는다.
  const _slotOpt = (slot, extraStyle) => (slot === _firstMediaSlot)
    ? { z:slot, opacity:1, onLoadJs:`_b2SwapStartOnce('${_nameEsc}', this)`, style:`${slot>=3?'object-fit:cover;':''}transition:opacity 0.4s ease;${extraStyle||''}` }
    : { z:slot, opacity:0, style:`object-fit:cover;transition:opacity 0.4s ease;${extraStyle||''}` };
  const _slot1 = _hasMediaUrl2(player.photo)
    ? _b2MainMediaHTML(1, player.photo, _slotOpt(1))
    : '';
  const _slot2 = _hasMediaUrl2(player.secondProfileFile)
    ? _b2MainMediaHTML(2, player.secondProfileFile, _slotOpt(2))
    : '';
  const _slot3 = _hasMediaUrl2(player.profileFile3)
    ? _b2MainMediaHTML(3, player.profileFile3, _slotOpt(3, `object-position:${_p3pos};`))
    : '';
  const _slot4 = _hasMediaUrl2(player.profileFile4)
    ? _b2MainMediaHTML(4, player.profileFile4, _slotOpt(4, `object-position:${_p4pos};`))
    : '';
  const _slot5 = _hasMediaUrl2(player.profileFile5)
    ? _b2MainMediaHTML(5, player.profileFile5, _slotOpt(5, `object-position:${_p5pos};`))
    : '';
  const _slot6 = _hasMediaUrl2(player.profileFile6)
    ? _b2MainMediaHTML(6, player.profileFile6, _slotOpt(6, `object-position:${_p6pos};`))
    : '';
  const _slot7 = _hasMediaUrl2(player.profileFile7)
    ? _b2MainMediaHTML(7, player.profileFile7, _slotOpt(7, `object-position:${_p7pos};`))
    : '';
  const _slot8 = _hasMediaUrl2(player.profileFile8)
    ? _b2MainMediaHTML(8, player.profileFile8, _slotOpt(8, `object-position:${_p8pos};`))
    : '';
  const _slot9 = _hasMediaUrl2(player.profileFile9)
    ? _b2MainMediaHTML(9, player.profileFile9, _slotOpt(9, `object-position:${_p9pos};`))
    : '';
  const _slot10 = _hasMediaUrl2(player.profileFile10)
    ? _b2MainMediaHTML(10, player.profileFile10, _slotOpt(10, `object-position:${_p10pos};`))
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
      ${_slot6}
      ${_slot7}
      ${_slot8}
      ${_slot9}
      ${_slot10}
      
      <!-- 이미지 컨트롤 패널 (모든 사용자 접근 가능) -->
      <!-- 이미지 컨트롤 패널 - 관리자(로그인)만 렌더 [BUGFIX-IMG-SETTINGS] -->
      ${isLoggedIn ? `<div class="b2-players-img-controls" id="b2-img-controls" style="display:none">
        <div class="b2-players-controls-title">🎨 이미지 설정</div>
        ${_b2BuildImageControlGroup(safeName, 'primary', '이미지 1', hasPrimary)}
        ${_b2BuildImageControlGroup(safeName, 'secondary', '이미지 2', hasSecondary)}
      </div>` : ''}
      
      <!-- 컨트롤 패널 토글 버튼 - 관리자(로그인 사용자)만 표시 [BUGFIX-IMG-SETTINGS] -->
      ${isLoggedIn ? `<button onclick="document.getElementById('b2-img-controls').style.display=document.getElementById('b2-img-controls').style.display==='none'?'block':'none'" style="position:absolute;top:16px;right:16px;z-index:var(--z-fixed);padding:8px 12px;background:rgba(0,0,0,0.75);backdrop-filter:blur(10px);border-radius:8px;color:#fff;font-size:var(--fs-sm);font-weight:700;cursor:pointer;border:1px solid rgba(255,255,255,0.2)">⚙️ 설정</button>` : ''}
      
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
        ${isLoggedIn ? `<button onclick="openB2ProfileEditModal('${player.name.replace(/'/g, "\\'")}')" style="margin-top:8px;padding:6px 12px;background:#fff;border:1px solid rgba(255,255,255,0.45);border-radius:12px;color:var(--text1);font-size:var(--fs-sm);font-weight:800;cursor:pointer;transition:all 0.15s ease" onmouseover="this.style.transform='translateY(-1px)'" onmouseout="this.style.transform=''">✏️ 프로필 수정</button>` : ''}
      </div>
    `;
    _b2ApplyImgSettingsToElement(document.getElementById('b2-main-img-1'), primarySettings);
    _b2ApplyImgSettingsToElement(document.getElementById('b2-main-img-2'), secondarySettings);
    // [FEATURE-HERO-NO-IMAGE] 위에서 _hasMediaUrl2가 항상 false라 슬롯1~10 모두
    // 이미지/영상을 시도하지 않으므로, "안 뜨면 다음 슬롯으로 넘어가기" 같은
    // 폴백/감시 로직도 더 이상 필요 없다 (해당 <img>가 애초에 생성되지 않음).
    // [FEATURE-HERO-NO-IMAGE] 히어로 영역에서 사진/영상을 아예 시도하지 않기로
    // 했으므로, 사진 슬라이드쇼 스케줄러(_b2ScheduleImageSwap)도 더 이상 돌릴
    // 필요가 없다 — 그대로 두면 "표시할 이미지가 없다"고 판단해 이니셜 글자
    // 플레이스홀더를 자체적으로 띄워버리는데, 그것도 원치 않는다는 피드백이라
    // 아예 호출하지 않는다.
  }

  const _selName = String(playerName || '').trim();
  document.querySelectorAll('.b2-players-card').forEach(card => {
    card.classList.remove('active');
  });
}

// [FIX-NO-REFRESH-ON-SAVE] 사진/영상 등 미디어는 그대로인데 이름·티어·종족·대학 같은
// 텍스트 정보만 바뀐 경우, 이미지 DOM(슬라이드쇼 진행 상태 포함)은 건드리지 않고
// 이름/뱃지 영역만 다시 그려서 "저장하면 이미지가 새로고침되는" 현상을 없앤다.
function _b2UpdateMainDisplayInfoOnly(playerName) {
  try {
    const player = players.find(p => p.name === playerName);
    if (!player) return;
    const mainBox = document.getElementById('b2-players-main-box');
    if (!mainBox) return;
    const infoEl = mainBox.querySelector('.b2-players-info');
    if (!infoEl) { _b2UpdateMainDisplay(playerName); return; }

    const univColor = gc(player.univ) || '#6366f1';
    const _updUnivIcon = (() => {
      const uCfg = univCfg.find(x => x.name === player.univ) || {};
      return uCfg.icon || uCfg.img || UNIV_ICONS[player.univ] || '';
    })();

    const nameEl = infoEl.querySelector('.b2-players-name');
    if (nameEl) nameEl.textContent = player.name || '이름 없음';

    const tierEl = infoEl.querySelector('.b2-players-tier');
    if (tierEl) {
      tierEl.textContent = _b2TierLabel(player.tier);
      tierEl.style.background = univColor;
    }

    const detailsEl = infoEl.querySelector('.b2-players-details');
    if (detailsEl) {
      const raceHTML = (player.race==='P'||player.race==='T'||player.race==='Z')
        ? `<span class="rbadge r${player.race}" style="font-size:14px;padding:5px 12px;box-shadow:0 2px 8px rgba(0,0,0,.35)">${player.race}</span>`
        : `<span class="b2-players-chip b2-players-race">종족미정</span>`;
      const univHTML = player.univ
        ? (_updUnivIcon
            ? `<span class="b2-players-chip"><img src="${toHttpsUrl(_updUnivIcon)}" onerror="this.style.display='none'"><span>${player.univ}</span></span>`
            : `<span class="b2-players-chip">🏫 ${player.univ}</span>`)
        : '<span class="b2-players-chip">🏫 무소속</span>';
      const tierHTML = tierEl ? tierEl.outerHTML : `<span class="b2-players-tier" style="background:${univColor}">${_b2TierLabel(player.tier)}</span>`;
      detailsEl.innerHTML = tierHTML + raceHTML + univHTML;
    }
  } catch (e) {
    // 안전하게 실패하면 기존처럼 전체 재그리기로 폴백
    try { _b2UpdateMainDisplay(playerName); } catch (e2) {}
  }
}

