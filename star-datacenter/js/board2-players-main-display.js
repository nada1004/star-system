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
  // 처음 순환될 때 항상 콜드 로딩이었다. 이제 실제로 표시되는 원본 URL 그대로,
  // 등록된 모든 이미지 슬롯(1~10, 동영상 제외)을 미리 받아둔다.
  try{
    const _b2PrewarmIsVideo = (u)=>{
      const s = String(u||'').trim().toLowerCase().split('#')[0].split('?')[0];
      return s.endsWith('.mp4') || s.endsWith('.webm') || s.endsWith('.ogg') || s.endsWith('.mov') || s.endsWith('.m4v');
    };
    const _b2PrewarmSlots = [
      player.photo, player.secondProfileFile, player.profileFile3, player.profileFile4,
      player.profileFile5, player.profileFile6, player.profileFile7, player.profileFile8,
      player.profileFile9, player.profileFile10
    ];
    _b2PrewarmSlots.forEach(rawUrl=>{
      const u = _normMediaUrl(rawUrl);
      if(!u || _b2PrewarmIsVideo(u)) return;
      const src = toHttpsUrl(u);
      if(!src) return;
      window._b2PrewarmedFullUrls = window._b2PrewarmedFullUrls || new Set();
      if(window._b2PrewarmedFullUrls.has(src)) return;
      window._b2PrewarmedFullUrls.add(src);
      const _img = new Image();
      try{ _img.decoding = 'async'; }catch(e){}
      _img.src = src;
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
    // [FIX-IMG-BROKEN] 로딩 실패(만료/차단된 링크 등) 시 브라우저 기본 "깨진 이미지" 아이콘이
    // 그대로 노출되던 문제 수정: 화면에 보이는 img의 src는 건드리지 않고 별도의 오프스크린
    // Image로 1회 재시도만 해본 뒤, 성공했을 때만 화면 img의 src를 갱신한다(기존처럼 src를
    // 지웠다가 다시 넣는 방식은 그 사이 화면이 잠깐 공백으로 보이는 원인이었음). 재시도도
    // 실패하면 그때 해당 슬롯을 완전히 숨긴다 (첨부파일 아이콘처럼 보이는 현상 방지).
    const onErrJs = `var _t=this;var _fail=function(){_t.dataset.b2Broken='1';_t.style.opacity='0';_t.style.visibility='hidden';try{if(typeof window._b2HandleMediaFailure==='function'){window._b2HandleMediaFailure(_t);}}catch(e){}};var _n=(parseInt(_t.dataset.b2ErrCount||'0',10)+1);_t.dataset.b2ErrCount=_n;if(_n===1){var _o=_t.src;var _re=new Image();_re.onload=function(){_t.src=_o;};_re.onerror=function(){_fail();};setTimeout(function(){_re.src=_o;},600);}else{_fail();}`;
    if(isVid){
      return `<video ${common} src="${src}" preload="metadata" muted playsinline${evPart} onerror="${onErrJs}"></video>`;
    }
    return `<img ${common} src="${src}" decoding="async" fetchpriority="high"${evPart} onerror="${onErrJs}">`;
  };
  const _nameEsc = player.name.replace(/'/g,"\\'");
  const _hasMediaUrl2 = (v)=>!!_normMediaUrl(v);
  const _slot1 = _hasMediaUrl2(player.photo)
    ? _b2MainMediaHTML(1, player.photo, { z:1, opacity:1, onLoadJs:`_b2SwapStartOnce('${_nameEsc}', this)`, style:'transition:opacity 0.4s ease;' })
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
  const _slot6 = _hasMediaUrl2(player.profileFile6)
    ? _b2MainMediaHTML(6, player.profileFile6, { z:6, opacity:0, style:`object-fit:cover;object-position:${_p6pos};transition:opacity 0.4s ease;` })
    : '';
  const _slot7 = _hasMediaUrl2(player.profileFile7)
    ? _b2MainMediaHTML(7, player.profileFile7, { z:7, opacity:0, style:`object-fit:cover;object-position:${_p7pos};transition:opacity 0.4s ease;` })
    : '';
  const _slot8 = _hasMediaUrl2(player.profileFile8)
    ? _b2MainMediaHTML(8, player.profileFile8, { z:8, opacity:0, style:`object-fit:cover;object-position:${_p8pos};transition:opacity 0.4s ease;` })
    : '';
  const _slot9 = _hasMediaUrl2(player.profileFile9)
    ? _b2MainMediaHTML(9, player.profileFile9, { z:9, opacity:0, style:`object-fit:cover;object-position:${_p9pos};transition:opacity 0.4s ease;` })
    : '';
  const _slot10 = _hasMediaUrl2(player.profileFile10)
    ? _b2MainMediaHTML(10, player.profileFile10, { z:10, opacity:0, style:`object-fit:cover;object-position:${_p10pos};transition:opacity 0.4s ease;` })
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
    // [FIX] 슬롯1의 onload가 캐시 이미지의 경우 발화 안 할 수 있으므로
    // - photo 없음: 즉시 _b2ScheduleImageSwap 호출
    // - photo 있고 이미 로드 완료(캐시): 즉시 호출
    // - photo 있고 아직 로드 중: onload 이벤트에서 자동 호출됨(슬롯 HTML에 onload 속성 포함)
    const _slot1El = document.getElementById('b2-main-img-1');
    const _isSlot1Video = _slot1El && _slot1El.tagName === 'VIDEO';
    if (!_hasMediaUrl2(player.photo)) {
      _b2ScheduleImageSwap(player.name);
    } else if (_slot1El && !_isSlot1Video && _slot1El.complete) {
      // 캐시에서 즉시 로드된 경우 onload가 늦게(또는 다시) 발화할 수 있으므로
      // 동일 엘리먼트에서 중복 호출되지 않도록 _b2SwapStartOnce로 가드한다.
      _b2SwapStartOnce(player.name, _slot1El);
    }
    // 비디오인 경우 onloadedmetadata 이벤트에서 자동 호출됨
  }

  const _selName = String(playerName || '').trim();
  document.querySelectorAll('.b2-players-card').forEach(card => {
    card.classList.remove('active');
  });
}

