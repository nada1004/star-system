// settings-data-ops.js에서 분리됨 (설정 - 이미지 레이아웃/배경/랜덤로테이션)
// ── 이미지탭 레이아웃 저장 함수 (silent=true면 슬라이더/입력 실시간 미리보기용 — 얼럿 생략) ──
function saveB2LayoutSettings(silent){
  const settings = {
    autoResize: document.getElementById('cfg-b2-auto-resize')?.checked !== false,
    autoHeight: document.getElementById('cfg-b2-auto-height')?.checked !== false,
    leftSize: parseInt(document.getElementById('cfg-b2-left-size')?.value) || 55,
    rightSize: parseInt(document.getElementById('cfg-b2-right-size')?.value) || 45,
    pcHeight: parseInt(document.getElementById('cfg-b2-pc-height')?.value) || 600,
    mobileHeight: parseInt(document.getElementById('cfg-b2-mobile-height')?.value) || 320,
    tabletHeight: parseInt(document.getElementById('cfg-b2-tablet-height')?.value) || 400
  };
  localStorage.setItem('su_b2_layout', JSON.stringify(settings));
  if(typeof save==='function')save();
  if(typeof render === 'function') render();
  // board2 탭이 열려있으면 다시 렌더링
  if(typeof _b2View !== 'undefined' && document.getElementById('b2-content')) {
    document.getElementById('b2-content').innerHTML = _b2PlayersView();
    if(_b2SelectedPlayer) _b2UpdateMainDisplay(_b2SelectedPlayer.name);
  }
  if(!silent){
    try{ if(typeof showToast==='function') showToast('📐 이미지탭 레이아웃이 저장되었습니다.'); else alert('이미지탭 레이아웃이 저장되었습니다.'); }catch(e){ alert('이미지탭 레이아웃이 저장되었습니다.'); }
  }
}

// ── 구현황판 밝기 저장 함수 (silent=true면 슬라이더 실시간 미리보기용 — 얼럿 생략) ──
function saveOldDashboardBrightness(silent){
  const labelAlpha = parseInt(document.getElementById('cfg-b2-label-alpha')?.value) || 16;
  const bgAlpha = parseInt(document.getElementById('cfg-b2-bg-alpha')?.value) || 9;
  localStorage.setItem('su_b2la', labelAlpha);
  localStorage.setItem('su_b2ba', bgAlpha);
  if(typeof save==='function')save();
  if(typeof render === 'function') render();
  if(!silent){
    try{ if(typeof showToast==='function') showToast('🎨 구현황판 밝기 설정이 저장되었습니다.'); else alert('구현황판 밝기 설정이 저장되었습니다.'); }catch(e){ alert('구현황판 밝기 설정이 저장되었습니다.'); }
  }
}

// ── 이미지 설정 저장 함수 (silent=true면 슬라이더 실시간 미리보기용 — 얼럿/모달 재오픈 생략) ──
function saveImageSettings(silent){
  const rawPrev = (()=>{ try{ return JSON.parse(localStorage.getItem('su_img_settings')||'{}')||{}; }catch(e){ return {}; } })();
  const settings = {
    fill: document.getElementById('cfg-img-fill')?.checked || false,
    scale: parseFloat(document.getElementById('cfg-img-scale')?.value) || 1,
    brightness: parseFloat(document.getElementById('cfg-img-brightness')?.value) || 1,
    scaleMb: parseFloat(document.getElementById('cfg-img-scale-left')?.value) || 1,
    scaleTb: parseFloat(document.getElementById('cfg-img-scale-tablet')?.value) || 1,
    scalePc: parseFloat(document.getElementById('cfg-img-scale-right')?.value) || 1,
    randomRotation: document.getElementById('cfg-img-random')?.checked || false,
    interval: parseInt(document.getElementById('cfg-img-interval')?.value) || 5,
    __byDevice: {
      mb: { scale: parseFloat(document.getElementById('cfg-img-scale-left')?.value) || 1 },
      tb: { scale: parseFloat(document.getElementById('cfg-img-scale-tablet')?.value) || 1 },
      pc: { scale: parseFloat(document.getElementById('cfg-img-scale-right')?.value) || 1 }
    }
  };
  const normalizedSettings = (typeof suNormalizeImgSettings==='function') ? suNormalizeImgSettings({...rawPrev, ...settings, __byDevice: settings.__byDevice}) : settings;
  localStorage.setItem('su_img_settings', JSON.stringify(normalizedSettings));
  try{
    const pd = JSON.parse(localStorage.getItem('su_pd_style')||'{}')||{};
    delete pd.img_fill;
    localStorage.setItem('su_pd_style', JSON.stringify(pd));
  }catch(e){}
  
  // 이미지탭(board2)과 동기화를 위한 저장
  const raw = (()=>{ try{ return JSON.parse(localStorage.getItem('su_b2_global_img_settings')||'{}')||{}; }catch(e){ return {}; } })();
  const b2Raw = (typeof suBuildBoard2ImgSettingsFromProfile==='function')
    ? suBuildBoard2ImgSettingsFromProfile(normalizedSettings, raw)
    : raw;
  localStorage.setItem('su_b2_global_img_settings', JSON.stringify(b2Raw));
  
  if(typeof save==='function')save();
  if(typeof render === 'function') render();
  try{
    const pm = document.getElementById('playerModal');
    const pst = (typeof getPlayerDetailState==='function') ? getPlayerDetailState() : (window.PlayerDetailState||{});
    if(pm && pm.style.display !== 'none' && pst.currentName && typeof openPlayerModal==='function'){
      openPlayerModal(pst.currentName);
    }
  }catch(e){}
  try{
    const um = document.getElementById('univModal');
    const ust = (typeof getUnivDetailState==='function') ? getUnivDetailState() : (window.UnivDetailState||{});
    if(um && um.style.display !== 'none' && ust.currentName && typeof openUnivModal==='function'){
      openUnivModal(ust.currentName);
    }
  }catch(e){}
  if(!silent){
    try{ if(typeof showToast==='function') showToast('🖼️ 이미지 설정이 저장되었습니다.'); else alert('이미지 설정이 저장되었습니다.'); }catch(e){ alert('이미지 설정이 저장되었습니다.'); }
  }
}

// ── 우클릭 이미지 조절 메뉴 ──
// tier-tour.js 등 다른 스크립트와 전역 식별자 충돌 방지
try{
  if(typeof window._settingsImgContextMenuEl === 'undefined') window._settingsImgContextMenuEl = null;
  if(typeof window._currentImageTarget === 'undefined') window._currentImageTarget = null;
}catch(e){}

function showImageContextMenu(e, imgElement){
  e.preventDefault();
  window._currentImageTarget = imgElement;
  
  // 기존 메뉴 제거
  if(window._settingsImgContextMenuEl){
    window._settingsImgContextMenuEl.remove();
  }
  
  const menu = document.createElement('div');
  menu.style.cssText = `
    position: fixed;
    left: ${e.clientX}px;
    top: ${e.clientY}px;
    background: var(--white);
    border: 1px solid var(--border2);
    border-radius: 8px;
    padding: 8px 0;
    min-width: 180px;
    z-index: 10000;
    box-shadow: 0 4px 20px rgba(0,0,0,0.15);
  `;
  
  const imgSettings = JSON.parse(localStorage.getItem('su_img_settings')||'{}');
  const currentScale = imgElement.dataset.scale || imgSettings.scale || 1;
  const currentBrightness = imgElement.dataset.brightness || imgSettings.brightness || 1;
  
  menu.innerHTML = `
    <div style="padding: 8px 16px; font-size: 12px; font-weight: 700; color: var(--text2); border-bottom: 1px solid var(--border);">
      🖼️ 이미지 조절
    </div>
    <div style="padding: 8px 16px;">
      <label style="font-size: 11px; font-weight: 600; color: var(--text3); display: block; margin-bottom: 4px;">크기: <span id="ctx-scale-val">${currentScale}x</span></label>
      <input type="range" id="ctx-scale" min="0.5" max="3" step="0.1" value="${currentScale}" style="width: 100%;" oninput="document.getElementById('ctx-scale-val').textContent=this.value+'x';if(typeof _ctxImgLivePreview==='function')_ctxImgLivePreview();">
    </div>
    <div style="padding: 8px 16px;">
      <label style="font-size: 11px; font-weight: 600; color: var(--text3); display: block; margin-bottom: 4px;">밝기: <span id="ctx-bright-val">${currentBrightness}x</span></label>
      <input type="range" id="ctx-bright" min="0.3" max="2" step="0.1" value="${currentBrightness}" style="width: 100%;" oninput="document.getElementById('ctx-bright-val').textContent=this.value+'x';if(typeof _ctxImgLivePreview==='function')_ctxImgLivePreview();">
    </div>
    <div style="padding: 8px 16px; border-top: 1px solid var(--border);">
      <button onclick="applyImageContextStyle()" style="width: 100%; padding: 6px 12px; background: var(--blue); color: #fff; border: none; border-radius: 6px; font-size: 12px; font-weight: 600; cursor:pointer;">✅ 적용</button>
    </div>
  `;
  
  document.body.appendChild(menu);
  window._settingsImgContextMenuEl = menu;
  
  // 메뉴 외부 클릭 시 닫기
  setTimeout(()=>{
    const closeMenu = (ev)=>{
      if(!menu.contains(ev.target)){
        menu.remove();
        window._settingsImgContextMenuEl = null;
        document.removeEventListener('click', closeMenu);
      }
    };
    document.addEventListener('click', closeMenu);
  }, 0);
}

// ── 우클릭 이미지 조절: 슬라이더 실시간 미리보기(메뉴는 유지) ──
function _ctxImgLivePreview(){
  if(!window._currentImageTarget) return;
  const scale = document.getElementById('ctx-scale')?.value || 1;
  const brightness = document.getElementById('ctx-bright')?.value || 1;
  window._currentImageTarget.style.transform = `scale(${scale})`;
  window._currentImageTarget.style.filter = `brightness(${brightness})`;
}

function applyImageContextStyle(){
  if(!window._currentImageTarget) return;
  
  const scale = document.getElementById('ctx-scale')?.value || 1;
  const brightness = document.getElementById('ctx-bright')?.value || 1;
  
  window._currentImageTarget.style.transform = `scale(${scale})`;
  window._currentImageTarget.style.filter = `brightness(${brightness})`;
  window._currentImageTarget.dataset.scale = scale;
  window._currentImageTarget.dataset.brightness = brightness;
  
  if(window._settingsImgContextMenuEl){
    window._settingsImgContextMenuEl.remove();
    window._settingsImgContextMenuEl = null;
  }
}

// ── 랜덤 이미지 회전 ──
try{ if(typeof window._randomRotationTimer === 'undefined') window._randomRotationTimer = null; }catch(e){}

// [REMOVED-RANDOM] "이미지 랜덤 회전" 기능 완전 비활성화.
// 이 기능은 설정에서 켜져 있으면 일정 시간마다 완전히 다른(무작위) 선수의 프로필로
// 화면을 바꿔치기했는데, 사용자 입장에서는 "프로필 이미지가 순서 없이 랜덤으로 나온다"로
// 보였던 원인 중 하나였다. 요청에 따라 코드 자체를 무력화(no-op)해서 저장된 설정값(과거에
// 켜져 있던 값 포함)과 무관하게 다시는 실행되지 않도록 한다.
function startRandomRotation(){
  stopRandomRotation();
  return;
}

function stopRandomRotation(){
  if(window._randomRotationTimer){
    clearInterval(window._randomRotationTimer);
    window._randomRotationTimer = null;
  }
}

function rotateRandomImage(){
  return;
}

function _rotateRandomImage_DISABLED(){
  const imgSettings = JSON.parse(localStorage.getItem('su_img_settings')||'{}');
  if(!imgSettings.randomRotation) return;
  
  // 랜덤 스트리머 선택
  if(players && players.length > 0){
    const randomPlayer = players[Math.floor(Math.random() * players.length)];
    
    // 전체대학 보기
    if((window._settingsCurrentTab||'total') === 'total'){
      const imgContainer = document.querySelector('.random-image-container');
      if(imgContainer && randomPlayer.photo){
        imgContainer.src = toHttpsUrl(randomPlayer.photo);
      }
    }
    
    // 이미지탭(board2)
    const b2MainImg = document.getElementById('b2-main-img-1');
    if(b2MainImg && randomPlayer.photo && typeof _b2UpdateMainDisplay === 'function'){
      _b2UpdateMainDisplay(randomPlayer.name);
    }
  }
}

// 현재 탭 추적
try{ if(typeof window._settingsCurrentTab !== 'string') window._settingsCurrentTab = 'total'; }catch(e){}

// 탭 변경 시 회전 제어
if(!window.__swWrappedForSettings){
  const originalSw = window.sw;
  window.sw = function(tab, el){
    try{ window._settingsCurrentTab = tab; }catch(e){}
    const ret = originalSw ? originalSw.apply(this, arguments) : undefined;
    let imgSettings = {};
    try{
      imgSettings = JSON.parse(localStorage.getItem('su_img_settings')||'{}') || {};
    }catch(e){
      imgSettings = {};
    }
    try{
      if(imgSettings.randomRotation){
        startRandomRotation();
      } else {
        stopRandomRotation();
      }
    }catch(e){}
    return ret;
  };
  window._cfgSecDescMap={
    notice:'팝업 공지와 공지 노출 관리',
    tier:'점수, 티어 기준, 랭킹 규칙',
    season:'시즌 구간과 기간 관리',
    teammatch:'팀전/대학전 경기 규칙',
    acct:'관리자 계정과 접근 설정',
    univ:'대학 정보와 기본 색상',
    maps:'맵 목록과 표시명 관리',
    mAlias:'맵 별칭/약자 자동 인식',
    si:'상태 아이콘 목록 관리',
    paste:'붙여넣기 자동 인식 규칙',
    b2layout:'이미지 탭 레이아웃 조절',
    imgsettings:'이미지 탭 이미지 표시 설정',
    b2trans:'슬라이드쇼 전환 효과 on/off, 시네마틱 모드',
    imgmodalsettings:'스트리머 상세 이미지 설정',
    profileshape:'프로필 모양/반경/표시 방식',
    pdModeBadge:'최근 경기 종목 배지 색상',
    pd:'스트리머 상세 카드 디자인',
    matchdetail:'경기 상세 팝업 디자인',
    univlogoimg:'대학 로고 URL과 로고 자산',
    b2femco:'펨코/신현황판 표시 방식',
    femcoorder:'현황판 대학 순서 정렬',
    boardchip:'현황판 프로필/로고/칩 크기',
    oldbright:'현황판 밝기/배경 톤',
    boardbg:'현황판 배경 이미지와 라벨 배경',
    tablabels:'메인/서브 탭 이름 변경',
    uisize:'PC/태블릿/모바일 UI 크기',
    siAssign:'스트리머별 상태 아이콘 지정',
    cfgmenu:'설정 하위 메뉴 이름/순서 정리',
    autofitall:'화면별 자동 맞춤',
    reccard:'기록 카드 스타일',
    tourneycard:'대회 카드 스타일',
    sharecard:'공유카드 모드/색상/프로필 크기',
    calui:'캘린더 날짜칩/공유 버튼',
    appfont:'전역 폰트와 크기',
    bgm:'유튜브 BGM 관리',
    soopmv:'SOOP 멀티뷰',
    pasteRoute:'붙여넣기 분기 자동화',
    designv2:'전역 디자인 모드',
    hdr:'헤더 상단바 디자인',
    fab:'플로팅 버튼 구성',
    storage:'저장소/백업 확인',
    selfcheck:'설정 진단과 점검',
    sync:'동기화 기본 설정',
    firebase:'GitHub 동기화',
    bulkdate:'날짜 일괄 수정',
    bulkmap:'맵 일괄 수정',
    bulktier:'티어 일괄 수정',
    bulkdel:'기록 일괄 삭제',
    bulkconv:'기록 형식 변환'
  };
  window.__swWrappedForSettings = true;
}

