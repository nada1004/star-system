/* ══════════════════════════════════════
   Board2 Image Utilities
══════════════════════════════════════ */
let _b2GlobalImgSettings = JSON.parse(localStorage.getItem('su_b2_global_img_settings') || '{}');
const _b2ImgMetaCache = {};
let _b2ImgSettingsSaveTimer = null;
let _b2ImgSettingsSavePending = false;
function _b2FlushImgSettingsSave(){
  if(_b2ImgSettingsSaveTimer){
    clearTimeout(_b2ImgSettingsSaveTimer);
    _b2ImgSettingsSaveTimer = null;
  }
  if(!_b2ImgSettingsSavePending) return;
  _b2ImgSettingsSavePending = false;
  if(typeof save==='function' && typeof isLoggedIn!=='undefined' && isLoggedIn) save();
}
function _b2CancelImgSettingsSave(){
  if(_b2ImgSettingsSaveTimer){
    clearTimeout(_b2ImgSettingsSaveTimer);
    _b2ImgSettingsSaveTimer = null;
  }
  _b2ImgSettingsSavePending = false;
}
function _b2ScheduleImgSettingsSave(){
  if(!(typeof save==='function' && typeof isLoggedIn!=='undefined' && isLoggedIn)) return;
  _b2ImgSettingsSavePending = true;
  if(_b2ImgSettingsSaveTimer) clearTimeout(_b2ImgSettingsSaveTimer);
  _b2ImgSettingsSaveTimer = setTimeout(()=>{
    _b2FlushImgSettingsSave();
  }, 800);
}
try{ window._b2FlushImgSettingsSave = _b2FlushImgSettingsSave; }catch(e){}
try{ window._b2CancelImgSettingsSave = _b2CancelImgSettingsSave; }catch(e){}
try{
  document.addEventListener('visibilitychange', ()=>{
    if(document.visibilityState === 'hidden') _b2CancelImgSettingsSave();
  });
  window.addEventListener('beforeunload', _b2CancelImgSettingsSave);
}catch(e){}
function _b2DeviceKey(){
  const w = Math.max(320, Math.min(1920, window.innerWidth || 1024));
  return w <= 768 ? 'mb' : (w <= 1024 ? 'tb' : 'pc');
}
function _b2EnsureDeviceImgSettings(){
  try{
    if(!_b2GlobalImgSettings || typeof _b2GlobalImgSettings !== 'object') _b2GlobalImgSettings = {};
    const defaults = {
      primary: _b2DefaultSingleImgSettings(),
      secondary: _b2DefaultSingleImgSettings()
    };
    if(!_b2GlobalImgSettings.__byDevice || typeof _b2GlobalImgSettings.__byDevice !== 'object'){
      const legacyPrimary = (_b2GlobalImgSettings.primary && typeof _b2GlobalImgSettings.primary === 'object') ? {...defaults.primary, ..._b2GlobalImgSettings.primary} : {...defaults.primary};
      const legacySecondary = (_b2GlobalImgSettings.secondary && typeof _b2GlobalImgSettings.secondary === 'object') ? {...defaults.secondary, ..._b2GlobalImgSettings.secondary} : {...defaults.secondary};
      _b2GlobalImgSettings.__byDevice = {
        pc: { primary:{...legacyPrimary}, secondary:{...legacySecondary} },
        tb: { primary:{...legacyPrimary}, secondary:{...legacySecondary} },
        mb: { primary:{...legacyPrimary}, secondary:{...legacySecondary} }
      };
    }
    const dk = _b2DeviceKey();
    if(!_b2GlobalImgSettings.__byDevice[dk] || typeof _b2GlobalImgSettings.__byDevice[dk] !== 'object'){
      _b2GlobalImgSettings.__byDevice[dk] = {
        primary: _b2DefaultSingleImgSettings(),
        secondary: _b2DefaultSingleImgSettings()
      };
    }
    ['primary','secondary'].forEach(slot=>{
      if(!_b2GlobalImgSettings.__byDevice[dk][slot] || typeof _b2GlobalImgSettings.__byDevice[dk][slot] !== 'object'){
        _b2GlobalImgSettings.__byDevice[dk][slot] = _b2DefaultSingleImgSettings();
      }
    });
  }catch(e){}
}
function _b2SaveImgSettings() {
  _b2EnsureDeviceImgSettings();
  localStorage.setItem('su_b2_global_img_settings', JSON.stringify(_b2GlobalImgSettings));
  _b2ScheduleImgSettingsSave();
}
function _b2DefaultSingleImgSettings() {
  return {
    scale: 100,
    brightness: 100,
    fit: 'cover',
    autoAdjust: true,
    manualCenter: false,
    offsetX: 0,
    offsetY: 0,
    zoom: 100,
    fill: 'cover',
    posX: 0,
    posY: 0
  };
}
function _b2GetImgSettings(playerName, slot) {
  _b2EnsureDeviceImgSettings();
  const dk = _b2DeviceKey();
  const key = slot === 'secondary' ? 'secondary' : 'primary';
  if (!_b2GlobalImgSettings.__byDevice[dk][key]) {
    _b2GlobalImgSettings.__byDevice[dk][key] = _b2DefaultSingleImgSettings();
  }
  try{
    const s=_b2GlobalImgSettings.__byDevice[dk][key];
    if(s && typeof s==='object'){
      if(s.autoAdjust==null) s.autoAdjust = true;
      if(s.fit==null && typeof s.fill==='string') s.fit=s.fill;
      if(s.scale==null && s.zoom!=null) s.scale=s.zoom;
      if(s.offsetX==null && s.posX!=null) s.offsetX=s.posX;
      if(s.offsetY==null && s.posY!=null) s.offsetY=s.posY;
      // [FIX-IMG-HERO-BLANK] 좌측 메인(히어로) 이미지의 확대/이동 설정은 선수별이
      // 아니라 기기(pc/tb/mb)별 전역 설정이라, 화살표 버튼을 여러 번 눌러
      // offsetX/offsetY가 한없이 누적되면(또는 손상된 값이 들어오면) 이미지 전체가
      // 박스 밖으로 밀려나 "PC에서만 좌측 이미지가 안 보이는" 현상이 모든 선수에게
      // 똑같이 나타난다. 저장된 값을 불러올 때마다 안전 범위로 되돌려서
      // (이미 망가진 기존 설정도) 자동으로 복구되게 한다.
      const _numOr = (v, d) => { const n = Number(v); return Number.isFinite(n) ? n : d; };
      const clampedScale = Math.max(50, Math.min(220, _numOr(s.scale, 100)));
      const clampedOffX = Math.max(-240, Math.min(240, _numOr(s.offsetX, 0)));
      const clampedOffY = Math.max(-240, Math.min(240, _numOr(s.offsetY, 0)));
      if (clampedScale !== s.scale) s.scale = clampedScale;
      if (clampedOffX !== s.offsetX) s.offsetX = clampedOffX;
      if (clampedOffY !== s.offsetY) s.offsetY = clampedOffY;
    }
  }catch(e){
    console.warn('[_b2LoadSingleImgSettings] 레거시 설정 보정 실패:', e.message);
  }
  _b2GlobalImgSettings.__byDevice[dk][key].zoom = _b2GlobalImgSettings.__byDevice[dk][key].scale;
  _b2GlobalImgSettings.__byDevice[dk][key].fill = _b2GlobalImgSettings.__byDevice[dk][key].fit;
  _b2GlobalImgSettings.__byDevice[dk][key].posX = _b2GlobalImgSettings.__byDevice[dk][key].offsetX;
  _b2GlobalImgSettings.__byDevice[dk][key].posY = _b2GlobalImgSettings.__byDevice[dk][key].offsetY;
  return _b2GlobalImgSettings.__byDevice[dk][key];
}
function _b2SetImgSetting(playerName, slot, key, val) {
  if (val === undefined) { val = key; key = slot; slot = 'primary'; }
  const s = _b2GetImgSettings(playerName, slot);
  s[key] = val;
  _b2SaveImgSettings();
}
window._b2ResetImgSettings = function(playerName, slot) {
  _b2EnsureDeviceImgSettings();
  const dk = _b2DeviceKey();
  if (slot === 'primary' || slot === 'secondary') {
    _b2GlobalImgSettings.__byDevice[dk][slot] = _b2DefaultSingleImgSettings();
    _b2SaveImgSettings();
  }
};
function _b2GetImgDomId(slot) {
  return slot === 'secondary' ? 'b2-main-img-2' : 'b2-main-img-1';
}
function _b2GetImgControlPrefix(slot) {
  return slot === 'secondary' ? 'b2-secondary' : 'b2-primary';
}
function _b2GetImgTransform(settings) {
  return `translate(${settings.offsetX || 0}px, ${settings.offsetY || 0}px) scale(${(settings.scale || 100) / 100})`;
}
function _b2LoadImgMeta(src, cb){
  try{
    const url = toHttpsUrl(src||'');
    if(!url){ cb && cb(null); return; }
    if(_b2ImgMetaCache[url] && _b2ImgMetaCache[url].w && _b2ImgMetaCache[url].h){
      cb && cb(_b2ImgMetaCache[url]);
      return;
    }
    const img = new Image();
    img.onload = function(){
      _b2ImgMetaCache[url] = { w: img.naturalWidth||0, h: img.naturalHeight||0 };
      cb && cb(_b2ImgMetaCache[url]);
    };
    img.onerror = function(){ cb && cb(null); };
    img.src = url;
  }catch(e){
    cb && cb(null);
  }
}
function _b2ResolveAutoFit(rect, meta){
  const vw = window.innerWidth || 1280;
  if(!rect || !rect.width || !rect.height) return vw <= 900 ? 'contain' : 'cover';
  if(!meta || !meta.w || !meta.h){
    if(vw <= 640) return 'contain';
    return 'cover';
  }
  const boxRatio = rect.width / rect.height;
  const imgRatio = meta.w / meta.h;
  const diff = Math.abs(Math.log(imgRatio / boxRatio));
  if(vw <= 640) return diff > 0.28 ? 'contain' : 'cover';
  if(vw <= 1024) return diff > 0.3 ? 'contain' : 'cover';
  if(imgRatio > 1.75 || imgRatio < 0.64) return 'contain';
  return diff > 0.36 ? 'contain' : 'cover';
}
function _b2ResolveAutoPosition(rect, meta, fit){
  if(fit !== 'cover') return 'center center';
  const imgRatio = meta && meta.w && meta.h ? (meta.w / meta.h) : 1;
  const boxRatio = rect && rect.width && rect.height ? (rect.width / rect.height) : 1;
  if(!imgRatio || !boxRatio) return 'center center';
  const portraitPressure = boxRatio / imgRatio;
  if(portraitPressure > 1.5) return 'top center';
  return 'center center';
}
function _b2IsAutoFitEligible(settings){
  if(!settings) return true;
  if(settings.autoAdjust === false) return false;
  const fit = String(settings.fit || settings.fill || 'cover');
  const scale = Number(settings.scale ?? settings.zoom ?? 100) || 100;
  const ox = Number(settings.offsetX ?? settings.posX ?? 0) || 0;
  const oy = Number(settings.offsetY ?? settings.posY ?? 0) || 0;
  return !settings.manualCenter && fit === 'cover' && scale === 100 && ox === 0 && oy === 0;
}
function _b2ApplyImgSettingsToElement(el, settings) {
  if (!el || !settings) return;
  el.style.objectFit = settings.fit || 'contain';
  el.style.objectPosition = settings.manualCenter ? 'center center' : 'center';
  el.style.filter = `brightness(${(settings.brightness || 100) / 100})`;
  el.style.transform = _b2GetImgTransform(settings);
  // [FIX-IMG-HERO-BLANK] 안전 클램프를 거쳤어도 특정 컨테이너 크기/비율 조합에서는
  // 여전히 이미지가 눈에 보이는 영역 밖으로 밀려날 수 있다. 적용 직후 실제로 화면에
  // 겹치는지 확인해서, 만약 완전히 벗어났다면 그 기기(pc/tb/mb)의 설정을 기본값으로
  // 되돌리고 다시 적용한다 — "PC에서만(또는 특정 환경에서만) 좌측 이미지가 안 보이는"
  // 현상이 재발해도 화면이 스스로 복구되게 하기 위함.
  try{
    requestAnimationFrame(() => {
      try{
        if (!el.isConnected) return;
        const box = el.parentElement;
        if (!box) return;
        const elRect = el.getBoundingClientRect();
        const boxRect = box.getBoundingClientRect();
        if (!boxRect.width || !boxRect.height) return;
        const overlapW = Math.max(0, Math.min(elRect.right, boxRect.right) - Math.max(elRect.left, boxRect.left));
        const overlapH = Math.max(0, Math.min(elRect.bottom, boxRect.bottom) - Math.max(elRect.top, boxRect.top));
        const overlapArea = overlapW * overlapH;
        const boxArea = boxRect.width * boxRect.height;
        if (boxArea > 0 && (overlapArea / boxArea) < 0.15 && !el.dataset.b2AutoRecovered) {
          el.dataset.b2AutoRecovered = '1';
          const dk = _b2DeviceKey();
          const slotKey = (el.id === 'b2-main-img-2') ? 'secondary' : 'primary';
          _b2GlobalImgSettings.__byDevice[dk][slotKey] = _b2DefaultSingleImgSettings();
          _b2SaveImgSettings();
          const fixed = _b2GlobalImgSettings.__byDevice[dk][slotKey];
          el.style.objectFit = fixed.fit || 'cover';
          el.style.objectPosition = 'center';
          el.style.filter = `brightness(${(fixed.brightness || 100) / 100})`;
          el.style.transform = _b2GetImgTransform(fixed);
        }
      }catch(e){}
    });
  }catch(e){}
  if(_b2IsAutoFitEligible(settings)){
    const rect = el.getBoundingClientRect ? el.getBoundingClientRect() : null;
    _b2LoadImgMeta(el.currentSrc || el.getAttribute('src') || '', (meta)=>{
      try{
        const resolved = _b2ResolveAutoFit(rect, meta);
        el.style.objectFit = resolved;
        el.style.objectPosition = _b2ResolveAutoPosition(rect, meta, resolved);
        el.setAttribute('data-b2-fit-resolved', resolved);
      }catch(e){}
    });
  }
}
function _b2ApplyImgSettingsToDom(playerName, slot) {
  _b2ApplyImgSettingsToElement(document.getElementById(_b2GetImgDomId(slot)), _b2GetImgSettings(playerName, slot));
}
function _b2PreviewImgSetting(playerName, slot, key, val){
  try{
    const keyMap = { zoom:'scale', fill:'fit', posX:'offsetX', posY:'offsetY' };
    key = keyMap[key] || key;
    const s = _b2GetImgSettings(playerName, slot);
    const prev = s[key];
    const numVal = parseInt(val, 10);
    s[key] = isNaN(numVal) ? val : numVal;
    s.zoom = s.scale;
    s.fill = s.fit;
    s.posX = s.offsetX;
    s.posY = s.offsetY;
    _b2ApplyImgSettingsToDom(playerName, slot);
    s[key] = prev;
    s.zoom = s.scale;
    s.fill = s.fit;
    s.posX = s.offsetX;
    s.posY = s.offsetY;
  }catch(e){}
}
function _b2CenterImageCfg(playerName, slot) {
  const s = _b2GetImgSettings(playerName, slot);
  s.autoAdjust = false;
  s.manualCenter = true;
  s.offsetX = 0;
  s.offsetY = 0;
  s.posX = 0;
  s.posY = 0;
  _b2SaveImgSettings();
  try{
    _b2ApplyImgSettingsToDom(playerName, slot);
    if(typeof window._b2RefreshImageControls==='function'){
      window._b2RefreshImageControls(playerName, slot);
    }
  }catch(e){}
  if (typeof _renderCfgImgSettings === 'function') _renderCfgImgSettings(playerName);
}
function _b2ApplySettingsToAll(refPlayerName, slot) {
  const settings = _b2GetImgSettings(refPlayerName, slot);
  _b2SaveImgSettings();
  alert(`이미지 ${slot === 'primary' ? '1' : '2'} 설정이 모든 선수에게 적용되었습니다. (크기: ${settings.scale}%, 밝기: ${settings.brightness}%, 배치: ${settings.fit})`);
  if (typeof _renderCfgImgSettings === 'function') _renderCfgImgSettings(refPlayerName);
}
function _renderCfgImgSettings(playerName) {
  const area = document.getElementById('cfg-img-settings-area');
  if (!playerName) {
    if (area) area.style.display = 'none';
    return;
  }
  if (area) area.style.display = 'block';
  const player = players.find(p => p.name === playerName);
  const hasPrimary = !!(player && player.photo);
  const hasSecondary = !!(player && player.secondProfileFile);
  const primarySettings = _b2GetImgSettings(playerName, 'primary');
  const secondarySettings = _b2GetImgSettings(playerName, 'secondary');
  const safeName = playerName.replace(/'/g, "\\'");
  const primaryDiv = document.getElementById('cfg-img-primary-controls');
  const secondaryDiv = document.getElementById('cfg-img-secondary-controls');
  if (primaryDiv) {
    primaryDiv.innerHTML = hasPrimary ? `
      <div style="margin-bottom:10px">
        <div style="font-size:var(--fs-sm);margin-bottom:4px">크기: <span id="cfg-p-scale">${primarySettings.scale}%</span></div>
        <input type="range" min="50" max="220" value="${primarySettings.scale}" style="width:100%" oninput="_b2UpdateImgSetting('${safeName}','primary','scale',this.value);document.getElementById('cfg-p-scale').textContent=this.value+'%'">
      </div>
      <div style="margin-bottom:10px">
        <div style="font-size:var(--fs-sm);margin-bottom:4px">밝기: <span id="cfg-p-bright">${primarySettings.brightness}%</span></div>
        <input type="range" min="20" max="180" value="${primarySettings.brightness}" style="width:100%" oninput="_b2UpdateImgSetting('${safeName}','primary','brightness',this.value);document.getElementById('cfg-p-bright').textContent=this.value+'%'">
      </div>
      <div style="margin-bottom:10px">
        <div style="font-size:var(--fs-sm);margin-bottom:4px">배치</div>
        <div style="display:flex;gap:4px;flex-wrap:wrap">
          <button class="btn btn-xs ${primarySettings.fit==='cover'?'btn-b':'btn-w'}" onclick="_b2UpdateImgSetting('${safeName}','primary','fit','cover');_renderCfgImgSettings('${safeName}')">채우기</button>
          <button class="btn btn-xs ${primarySettings.fit==='contain'?'btn-b':'btn-w'}" onclick="_b2UpdateImgSetting('${safeName}','primary','fit','contain');_renderCfgImgSettings('${safeName}')">맞춤</button>
          <button class="btn btn-xs ${primarySettings.fit==='fill'?'btn-b':'btn-w'}" onclick="_b2UpdateImgSetting('${safeName}','primary','fit','fill');_renderCfgImgSettings('${safeName}')">늘리기</button>
        </div>
      </div>
      <div style="margin-bottom:10px">
        <div style="font-size:var(--fs-sm);margin-bottom:4px">위치 이동</div>
        <div style="display:flex;gap:4px;flex-wrap:wrap">
          <button class="btn btn-xs btn-w" onclick="_b2MoveImg('${safeName}','primary',0,-12)">↑</button>
          <button class="btn btn-xs btn-w" onclick="_b2MoveImg('${safeName}','primary',0,12)">↓</button>
          <button class="btn btn-xs btn-w" onclick="_b2MoveImg('${safeName}','primary',-12,0)">←</button>
          <button class="btn btn-xs btn-w" onclick="_b2MoveImg('${safeName}','primary',12,0)">→</button>
          <button class="btn btn-xs btn-w" onclick="_b2CenterImageCfg('${safeName}','primary')">중앙</button>
        </div>
      </div>
      <div>
        <button class="btn btn-xs btn-r" onclick="_b2ResetImgSettings('${safeName}','primary');_renderCfgImgSettings('${safeName}')">초기화</button>
      </div>
    ` : '<div style="color:var(--gray-l);font-size:var(--fs-sm)">등록된 이미지 없음</div>';
  }
  if (secondaryDiv) {
    secondaryDiv.innerHTML = hasSecondary ? `
      <div style="margin-bottom:10px">
        <div style="font-size:var(--fs-sm);margin-bottom:4px">크기: <span id="cfg-s-scale">${secondarySettings.scale}%</span></div>
        <input type="range" min="50" max="220" value="${secondarySettings.scale}" style="width:100%" oninput="_b2UpdateImgSetting('${safeName}','secondary','scale',this.value);document.getElementById('cfg-s-scale').textContent=this.value+'%'">
      </div>
      <div style="margin-bottom:10px">
        <div style="font-size:var(--fs-sm);margin-bottom:4px">밝기: <span id="cfg-s-bright">${secondarySettings.brightness}%</span></div>
        <input type="range" min="20" max="180" value="${secondarySettings.brightness}" style="width:100%" oninput="_b2UpdateImgSetting('${safeName}','secondary','brightness',this.value);document.getElementById('cfg-s-bright').textContent=this.value+'%'">
      </div>
      <div style="margin-bottom:10px">
        <div style="font-size:var(--fs-sm);margin-bottom:4px">배치</div>
        <div style="display:flex;gap:4px;flex-wrap:wrap">
          <button class="btn btn-xs ${secondarySettings.fit==='cover'?'btn-b':'btn-w'}" onclick="_b2UpdateImgSetting('${safeName}','secondary','fit','cover');_renderCfgImgSettings('${safeName}')">채우기</button>
          <button class="btn btn-xs ${secondarySettings.fit==='contain'?'btn-b':'btn-w'}" onclick="_b2UpdateImgSetting('${safeName}','secondary','fit','contain');_renderCfgImgSettings('${safeName}')">맞춤</button>
          <button class="btn btn-xs ${secondarySettings.fit==='fill'?'btn-b':'btn-w'}" onclick="_b2UpdateImgSetting('${safeName}','secondary','fit','fill');_renderCfgImgSettings('${safeName}')">늘리기</button>
        </div>
      </div>
      <div style="margin-bottom:10px">
        <div style="font-size:var(--fs-sm);margin-bottom:4px">위치 이동</div>
        <div style="display:flex;gap:4px;flex-wrap:wrap">
          <button class="btn btn-xs btn-w" onclick="_b2MoveImg('${safeName}','secondary',0,-12)">↑</button>
          <button class="btn btn-xs btn-w" onclick="_b2MoveImg('${safeName}','secondary',0,12)">↓</button>
          <button class="btn btn-xs btn-w" onclick="_b2MoveImg('${safeName}','secondary',-12,0)">←</button>
          <button class="btn btn-xs btn-w" onclick="_b2MoveImg('${safeName}','secondary',12,0)">→</button>
          <button class="btn btn-xs btn-w" onclick="_b2CenterImageCfg('${safeName}','secondary')">중앙</button>
        </div>
      </div>
      <div>
        <button class="btn btn-xs btn-r" onclick="_b2ResetImgSettings('${safeName}','secondary');_renderCfgImgSettings('${safeName}')">초기화</button>
      </div>
    ` : '<div style="color:var(--gray-l);font-size:var(--fs-sm)">등록된 이미지 없음</div>';
  }
}
function _b2ClearSwapTimer(mainBox) {
  if (mainBox && mainBox._swapTimer) {
    clearTimeout(mainBox._swapTimer);
    mainBox._swapTimer = null;
  }
  if (mainBox && mainBox._swapEndedEl && mainBox._swapEndedHandler) {
    try{ mainBox._swapEndedEl.removeEventListener('ended', mainBox._swapEndedHandler); }catch(e){}
    mainBox._swapEndedEl = null;
    mainBox._swapEndedHandler = null;
  }
  if (mainBox) mainBox._swapIdx = 0;
}
function _b2ScheduleImageSwap(playerName) {
  // [FEATURE-HERO-NO-IMAGE-REVERTED] 좌측 히어로 이미지 1~10번 슬라이드쇼 순환을
  // 복원한다.
  const mainBox = document.getElementById('b2-players-main-box');
  if (!mainBox) return;
  _b2ClearSwapTimer(mainBox);
  mainBox._swapGen = (mainBox._swapGen || 0) + 1;
  const _myGen = mainBox._swapGen;
  const _normMediaUrl = (v)=>{
    const s = String(v == null ? '' : v).trim();
    if(!s) return '';
    const lower = s.toLowerCase();
    if(lower === 'null' || lower === 'undefined' || lower === 'about:blank' || lower === 'javascript:void(0)' || lower === '#') return '';
    return s;
  };
  const _hasMediaUrl = (v)=>!!_normMediaUrl(v);
  // 현재 선수의 이미지 목록 수집 (photo + profileFile2~5)
  const p = (typeof players !== 'undefined') ? players.find(x => x.name === playerName) : null;
  const imgList = p ? [
    {slot:1, url:p.photo},
    {slot:2, url:p.secondProfileFile},
    {slot:3, url:p.profileFile3},
    {slot:4, url:p.profileFile4},
    {slot:5, url:p.profileFile5},
    {slot:6, url:p.profileFile6},
    {slot:7, url:p.profileFile7},
    {slot:8, url:p.profileFile8},
    {slot:9, url:p.profileFile9},
    {slot:10, url:p.profileFile10}
  ].filter(x=>x && _hasMediaUrl(x.url)) : [];
  const clampSec = (v, d)=>{
    const n = parseFloat(v);
    if(isNaN(n)) return d;
    return Math.max(0.2, Math.min(60, n));
  };
  const getEl = (slot)=>document.getElementById('b2-main-img-' + slot);
  const isBrokenEl = (el)=>{
    if(!el) return true;
    if(String(el.dataset?.b2Broken || '') === '1') return true;
    if(el.style.visibility === 'hidden') return true;
    return false;
  };
  // [FIX-IMG-BLANK] 예전에는 "살아있는(안 깨진) 이미지"가 하나도 없을 때
  // 안전장치로 깨진 이미지 목록(imgList) 전체를 그대로 돌려줬다. 그런데 깨진
  // <img>/<video>는 onerror 처리에서 opacity:0 + visibility:hidden 으로 이미
  // 숨겨진 상태라, 이 "안전장치"가 고른 슬롯을 다시 opacity:1로 되돌려도
  // visibility:hidden 때문에 실제로는 아무것도 안 보이는 완전한 빈 화면(회색 박스)
  // 이 나오는 원인이었다. 이제는 깨지지 않은 이미지만 정직하게 돌려주고
  // (없으면 빈 배열), 호출부에서 빈 배열일 때 이니셜 플레이스홀더를 보여주도록 한다.
  const getLiveImgList = ()=>imgList.filter(item => !isBrokenEl(getEl(item.slot)));
  const isVideo = (el)=>!!(el && el.tagName === 'VIDEO');
  // 비디오 슬롯이 화면에 보일 때 재생 시작(음소거 자동재생) — 전환 타이밍 자체는
  // 항상 아래 delayMs()로 설정한 "전환 시간(초)"을 따르며, 영상 길이와는 무관함.
  const applyMediaForSlot = (slot)=>{
    try{
      const el = getEl(slot);
      if(!isVideo(el)) return;
      try{ el.loop = false; }catch(e){}
      try{ el.muted = true; }catch(e){}
      try{ el.playsInline = true; }catch(e){}
      try{ el.currentTime = 0; }catch(e){}
      try{
        const pr = el.play && el.play();
        if(pr && typeof pr.catch === 'function') pr.catch(()=>{});
      }catch(e){}
    }catch(e){}
  };
  const _delayKeyLegacy = {
    '1_2':'photoDelay12','2_1':'photoDelay21','2_3':'photoDelay23','3_1':'photoDelay31',
    '3_4':'photoDelay34','4_1':'photoDelay41','4_5':'photoDelay45','5_1':'photoDelay51'
  };
  const delayMs = (fromSlot, toSlot)=>{
    try{
      if(!p) return 1000;
      const key = _delayKeyLegacy[`${fromSlot}_${toSlot}`] || `photoDelay${fromSlot}_${toSlot}`;
      // [FIX-DELAY-FALLBACK] 예전에는 "N→1"로 돌아가는 모든 구간의 기본값을 무조건
      // photoDelay51(5번째 이미지에서 1번으로 돌아갈 때 전용 값)로 사용했음.
      // 그래서 이미지가 2장뿐인 선수도 2→1 전환 시 과거에 5장 순환용으로 저장해둔
      // photoDelay51 값을 그대로 빌려써서, 의도치 않게 아주 짧거나 긴 전환 시간이
      // 적용되며 화면이 잠깐 비는 것처럼 보이는 원인이 됐다. 이제는 항상 안전한
      // 공통 기본값(4초)만 사용한다.
      const fallback = 4;
      return Math.round(clampSec(p[key] ?? fallback, 4) * 1000);
    }catch(e){}
    return 1000;
  };
  // [FIX-IMG-GAP] 들어오는 이미지의 z-index를 항상 맨 위로 올려두는 헬퍼.
  // 기존에는 슬롯 번호로 z-index가 고정돼 있어서, 전환 시 "나가는 이미지"와
  // "들어오는 이미지"가 서로 반대 방향(1→0 / 0→1)으로 동시에 opacity 트랜지션을 탔다.
  // 두 레이어가 각각 부분투명 상태를 지나가는 순간(특히 50% 부근) 두 이미지 뒤의
  // 배경(테마색)이 잠깐 비치면서 "공백"처럼 보이는 원인이었다.
  // 이제는 들어오는 이미지만 항상 맨 위에서 0→1로 페이드인하고, 나가는 이미지는
  // 그 아래에서 opacity:1을 그대로 유지(=자연스럽게 가려짐)한 뒤, 트랜지션이
  // 끝난 다음에야 트랜지션 없이 즉시 opacity:0으로 되돌려 다음 전환을 준비한다.
  const CROSSFADE_MS = 400;
  const bringToFront = (slot)=>{
    for (let s = 1; s <= 10; s++) {
      const el = document.getElementById('b2-main-img-' + s);
      if (el) el.style.zIndex = (s === slot) ? '50' : String(s);
    }
  };
  // [FIX-IMG-RESET] 현재 재생 중인 슬롯을 선수별로 기억해뒀다가, 스케줄이 다시 시작될 때
  // (예: 설정 슬라이더 조작·저장 등으로 _b2UpdateMainDisplay가 재호출되는 경우) 항상
  // 1번 이미지로 되돌아가지 않고 마지막으로 보고 있던 이미지부터 이어서 재생한다.
  // "순서대로 넘어가야 하는데 갑자기 처음으로 돌아간다"는 문제의 핵심 원인.
  try{ window._b2SwapResumeState = window._b2SwapResumeState || {}; }catch(e){}
  const _rememberResumeSlot = (slot)=>{
    try{ window._b2SwapResumeState[playerName] = { slot, ts: Date.now() }; }catch(e){}
  };
  const showOnlySlot = (slot)=>{
    bringToFront(slot);
    for (let s = 1; s <= 10; s++) {
      const el = getEl(s);
      if (!el) continue;
      el.style.opacity = (s === slot) ? '1' : '0';
    }
    mainBox._swapCurSlot = slot;
    _rememberResumeSlot(slot);
    applyMediaForSlot(slot);
    if (typeof window._b2HideFallbackLetter === 'function') window._b2HideFallbackLetter(mainBox);
  };
  // [FIX-IMG-BLANK] 등록된 이미지가 전부 깨진(로딩 실패) 상태라면 더는 숨겨진(visibility:hidden)
  // 이미지를 억지로 보여주지 않는다 — 대신 이니셜 플레이스홀더를 띄우고, 잠시 후
  // 깨진 슬롯들을 한 번 더 재시도해서 복구되면 자동으로 순환을 재개한다.
  const initialLiveList = getLiveImgList();
  if (initialLiveList.length === 0) {
    if (typeof window._b2ShowFallbackLetter === 'function') window._b2ShowFallbackLetter(mainBox, playerName);
    if (typeof window._b2RetryBrokenSlots === 'function') window._b2RetryBrokenSlots(mainBox);
    // [FIX-IMG-RETRY-LIMIT] 더 재시도할(포기하지 않은) 슬롯이 없으면 재시도 타이머를
    // 잡지 않고 여기서 멈춘다 — 영구히 죽은 이미지에 계속 요청을 보내지 않기 위함.
    if (typeof window._b2HasRetryableBrokenSlots === 'function' && window._b2HasRetryableBrokenSlots(imgList)) {
      mainBox._swapTimer = setTimeout(()=>{
        if (mainBox._swapGen !== _myGen) return;
        _b2ScheduleImageSwap(playerName);
      }, 5000);
    }
    return;
  }
  if (typeof window._b2HideFallbackLetter === 'function') window._b2HideFallbackLetter(mainBox);
  // 이미지 1장뿐이면 전환 없음 — showSlot을 즉시 opacity:1로 (공백 플리커 방지)
  if (initialLiveList.length < 2) {
    showOnlySlot(initialLiveList[0].slot);
    // [FIX-IMG-STUCK] 등록된 이미지가 원래 2장 이상인데 지금 1장만 살아있는
    // 상황이면(나머지는 일시적으로 깨진 상태), 그 상태로 영원히 멈추지 않도록
    // 주기적으로 재시도해서 복구되면 다시 여러 장 순환으로 돌아가게 한다.
    // (포기한 슬롯만 남았으면 더 재시도하지 않는다.)
    if (imgList.length >= 2 && typeof window._b2HasRetryableBrokenSlots === 'function' && window._b2HasRetryableBrokenSlots(imgList)) {
      mainBox._swapTimer = setTimeout(()=>{
        if (mainBox._swapGen !== _myGen) return;
        if (typeof window._b2RetryBrokenSlots === 'function') window._b2RetryBrokenSlots(mainBox);
        _b2ScheduleImageSwap(playerName);
      }, 8000);
    }
    return;
  }
  // 이어서 재생: 최근(10분 이내)에 이 선수를 보던 중이었고, 그때 보던 슬롯이 지금도
  // 유효한(살아있는) 이미지 목록에 있다면 그 슬롯부터 시작. 아니면 1번부터(신규 진입).
  // [FIX-IMG-RESUME-BROKEN] 예전에는 "그때 보던 슬롯"이 하필 지금 이 순간(반복 요청으로 인한
  // 일시적 로드 실패 등) 깨져 있으면, 곧바로 포기하고 등록 목록의 맨 앞(대개 슬롯1)으로
  // 되돌아갔다. 그래서 화면에 보이던 이미지가 아주 잠깐 깨졌다 살아나는 것만으로도
  // "1 → 다음 → 다시 1로" 처럼 순환이 슬롯1로 계속 튕겨나가는 원인이 됐다.
  // 이제는 그 슬롯 자체가 지금 깨져 있어도, 등록 순서(baseOrder)상 그 다음으로 살아있는
  // 슬롯부터 이어서 시작해서(예: 4번이 잠깐 깨졌으면 5번부터), 순서 자체가 슬롯1로
  // 되돌아가지 않고 원래 흐름을 그대로 유지하도록 한다.
  const _resumeSlotCandidate = (()=>{
    try{
      const st = window._b2SwapResumeState && window._b2SwapResumeState[playerName];
      if(!st) return null;
      if(Date.now() - (st.ts||0) > 10*60*1000) return null; // 너무 오래됐으면 무시
      const rememberedIdx = imgList.findIndex(item => item.slot === st.slot);
      if(rememberedIdx < 0) return null; // 아예 등록되지 않은 슬롯(삭제됨 등)이면 신규 진입
      const stillLive = initialLiveList.find(item=>item.slot === st.slot);
      if(stillLive) return stillLive.slot; // 정상 케이스: 그대로 이어서 재생
      // 기억해둔 슬롯이 지금 깨져 있으면, 등록 순서 안에서 그 다음으로 살아있는 슬롯을 찾는다.
      for(let step = 1; step <= imgList.length; step++){
        const cand = imgList[(rememberedIdx + step) % imgList.length];
        if(initialLiveList.some(item => item.slot === cand.slot)) return cand.slot;
      }
      return null; // 전부 깨져 있으면 아래에서 안전하게 첫 이미지로 폴백
    }catch(e){ return null; }
  })();
  // [FIX-IMG-ORDER] 순환 순서의 "기준"은 여기서 딱 한 번만 고정한다(baseOrder).
  // 예전에는 매 전환마다 getLiveImgList()로 "그 순간 안 깨진 이미지들"을 새로 걸러서
  // 그 배열 안에서의 인덱스(prevIdx)를 기준으로 "다음"을 계산했다. 그런데 이미지 중
  // 하나라도(예: 외부 호스팅 이미지가 반복 요청으로 일시적으로 로드 실패) 나중에
  // "깨짐" 처리되면 그 뒤 슬롯들의 배열 인덱스가 전부 한 칸씩 당겨지면서, 다음 전환이
  // 원래 순서와 다른 슬롯으로 튀는 문제가 있었다(한 바퀴 잘 돌다가 이후부터 순서가
  // 뒤죽박죽되는 원인). 이제는 처음 스케줄을 시작할 때 정해진 "고정 순서(baseOrder)"
  // 안에서만 인덱스를 앞으로 옮기고, 그 슬롯이 깨져 있으면 고정 순서 안에서 다음
  // 후보로 건너뛰는 방식으로 바꿔 순서 자체가 흔들리지 않도록 한다.
  const baseOrder = imgList.map(item => item.slot);
  const _findBaseIdx = (slot)=>{ const i = baseOrder.indexOf(slot); return i >= 0 ? i : 0; };

  // 모든 이미지 초기화: 이어서 볼 슬롯(없으면 첫 번째 이미지)만 보이게
  const firstSlot = _resumeSlotCandidate || initialLiveList[0].slot;
  showOnlySlot(firstSlot);
  try{
    const badge = document.getElementById('b2-cur-img-slot');
    if(badge) badge.textContent = '🖼️ 이미지 ' + firstSlot;
  }catch(e){}
  // 순환 인덱스 (0 = img1)
  mainBox._swapIdx = 0;
  const totalImgs = imgList.length;
  // 첫 이미지가 비디오면 즉시 재생
  applyMediaForSlot(firstSlot);
  // [FEATURE-VIDEO-FULL-PLAY] mp4/webm 등 영상 슬롯은 설정된 전환 시간이 아니라 영상이
  // 실제로 끝까지 재생된 뒤(ended 이벤트)에 다음으로 넘어가도록 한다. gif는 브라우저에서
  // "애니메이션이 끝났다"를 감지할 방법 자체가 없으므로(반복 재생 특성상 ended 이벤트가
  // 없음) 그대로 설정된 전환 시간을 따른다. 자동재생이 막히는 등 예외로 ended가 끝내
  // 발생하지 않는 상황을 대비해 안전장치로 최대 5분 뒤에는 강제로 다음으로 넘어간다.
  const _clearEndedWatcher = () => {
    if (mainBox._swapEndedEl && mainBox._swapEndedHandler) {
      try{ mainBox._swapEndedEl.removeEventListener('ended', mainBox._swapEndedHandler); }catch(e){}
    }
    mainBox._swapEndedEl = null;
    mainBox._swapEndedHandler = null;
  };
  const _scheduleNextSwap = (curSlot, toSlot) => {
    if (mainBox._swapTimer) { clearTimeout(mainBox._swapTimer); mainBox._swapTimer = null; }
    _clearEndedWatcher();
    const curEl = getEl(curSlot);
    if (isVideo(curEl) && !isBrokenEl(curEl)) {
      const handler = () => {
        if (mainBox._swapGen !== _myGen) return;
        _clearEndedWatcher();
        if (mainBox._swapTimer) { clearTimeout(mainBox._swapTimer); mainBox._swapTimer = null; }
        doSwap();
      };
      curEl.addEventListener('ended', handler);
      mainBox._swapEndedEl = curEl;
      mainBox._swapEndedHandler = handler;
      mainBox._swapTimer = setTimeout(() => {
        if (mainBox._swapGen !== _myGen) return;
        _clearEndedWatcher();
        doSwap();
      }, 5 * 60 * 1000);
    } else {
      mainBox._swapTimer = setTimeout(doSwap, delayMs(curSlot, toSlot));
    }
  };
  function doSwap() {
    if (mainBox._swapGen !== _myGen) return; // 더 최신 스케줄이 시작됐으면 이 루프는 중단
    const liveImgList = getLiveImgList();
    // [FIX-IMG-BLANK] 순환 도중 남은 이미지가 전부 깨졌으면(예: 여러 장이 동시에
    // 로딩 실패) 숨겨진 이미지를 억지로 보여주지 않고 이니셜 플레이스홀더로 전환한
    // 뒤, 잠시 후 재시도하여 복구되면 자동으로 순환을 재개한다.
    if (liveImgList.length === 0) {
      if (typeof window._b2ShowFallbackLetter === 'function') window._b2ShowFallbackLetter(mainBox, playerName);
      if (typeof window._b2RetryBrokenSlots === 'function') window._b2RetryBrokenSlots(mainBox);
      if (mainBox._swapTimer) clearTimeout(mainBox._swapTimer);
      // [FIX-IMG-RETRY-LIMIT] 더 재시도할 슬롯이 없으면(전부 포기) 타이머를 잡지 않고 멈춘다.
      if (typeof window._b2HasRetryableBrokenSlots === 'function' && window._b2HasRetryableBrokenSlots(imgList)) {
        mainBox._swapTimer = setTimeout(doSwap, 5000);
      }
      return;
    }
    if (typeof window._b2HideFallbackLetter === 'function') window._b2HideFallbackLetter(mainBox);
    if (liveImgList.length < 2) {
      showOnlySlot(liveImgList[0].slot);
      // [FIX-IMG-STUCK] 순환 도중 이미지가 1장으로 줄어든 경우도 마찬가지로
      // 그대로 멈추지 않고 주기적으로 재시도한다. (포기한 슬롯만 남았으면 멈춤)
      if (imgList.length >= 2 && typeof window._b2HasRetryableBrokenSlots === 'function' && window._b2HasRetryableBrokenSlots(imgList)) {
        if (mainBox._swapTimer) clearTimeout(mainBox._swapTimer);
        mainBox._swapTimer = setTimeout(()=>{
          if (mainBox._swapGen !== _myGen) return;
          if (typeof window._b2RetryBrokenSlots === 'function') window._b2RetryBrokenSlots(mainBox);
          doSwap();
        }, 8000);
      }
      return;
    }
    // [FIX-IMG-ORDER] 고정 순서(baseOrder) 안에서만 한 칸씩 전진하고, 그 자리가
    // 깨져 있으면(isBrokenEl) baseOrder 안에서 다음 후보로만 건너뛴다. liveImgList의
    // 배열 인덱스를 기준으로 삼지 않으므로, 일부 이미지가 깨졌다 살아났다 해도
    // 나머지 이미지들의 상대적 순서(1→2→3→...)는 절대 바뀌지 않는다.
    const prevSlot = mainBox._swapCurSlot || firstSlot;
    const prevBaseIdx = _findBaseIdx(prevSlot);
    let curSlot = null;
    for (let step = 1; step <= baseOrder.length; step++) {
      const candSlot = baseOrder[(prevBaseIdx + step) % baseOrder.length];
      const candEl = getEl(candSlot);
      if (!isBrokenEl(candEl)) { curSlot = candSlot; break; }
    }
    if (curSlot == null) curSlot = liveImgList[0].slot; // 전부 깨졌으면 안전 폴백
    mainBox._swapCurSlot = curSlot;
    _rememberResumeSlot(curSlot);
    // 들어오는 이미지를 맨 위로 올리고 페이드인. 나머지(나가는 이미지 포함)는
    // 그 아래에 그대로 두어(opacity 유지) 자연스럽게 가려지도록 한다.
    bringToFront(curSlot);
    const curEl = getEl(curSlot);
    if (curEl) curEl.style.opacity = '1';
    try{
      const badge = document.getElementById('b2-cur-img-slot');
      if(badge) badge.textContent = '🖼️ 이미지 ' + curSlot;
    }catch(e){}
    // 숨긴 비디오는 정지(재생 중이면 클릭 막힘/리소스 사용 방지)
    try{
      for(let i=0;i<totalImgs;i++){
        const s = imgList[i] ? imgList[i].slot : 1;
        const el = getEl(s);
        if(isVideo(el) && s !== curSlot){
          try{ el.pause && el.pause(); }catch(e){}
        }
      }
    }catch(e){}

    // 새로 보이는 슬롯이 비디오면 재생 시작
    applyMediaForSlot(curSlot);

    // 크로스페이드가 끝난 뒤(들어오는 이미지가 이미 완전히 덮은 뒤), 가려진 나머지
    // 슬롯들을 트랜지션 없이 즉시 opacity:0으로 되돌려 다음 전환을 준비한다.
    // 이미 새 이미지 아래로 완전히 가려진 상태라 시각적으로 아무 변화도 없다.
    // (baseOrder 기반 전환으로 바뀌면서 더는 _swapIdx를 쓰지 않으므로, 대신 이번
    // doSwap 호출을 식별하는 1회용 티켓으로 "더 최신 전환이 이미 시작됐는지" 판단한다.)
    mainBox._swapTick = (mainBox._swapTick || 0) + 1;
    const _myTick = mainBox._swapTick;
    setTimeout(()=>{
      if (mainBox._swapGen !== _myGen || mainBox._swapTick !== _myTick) return;
      for (let slot = 1; slot <= 10; slot++) {
        if (slot === curSlot) continue;
        const el = document.getElementById('b2-main-img-' + slot);
        if (!el) continue;
        const prevTransition = el.style.transition;
        el.style.transition = 'none';
        el.style.opacity = '0';
        void el.offsetWidth;
        el.style.transition = prevTransition || 'opacity 0.4s ease';
      }
    }, CROSSFADE_MS + 40);

    // 다음 전환 예약(현재→다음 기준) — 영상 슬롯이면 재생 완료(ended) 시점, 그 외에는
    // 설정된 전환 시간(초)을 따름.
    // "다음"도 baseOrder 기준 고정 순서에서 그대로 한 칸 더 (지연 시간 계산용일 뿐,
    // 실제 다음 전환 대상은 다음 doSwap() 호출 시점에 다시 동일한 방식으로 정해짐).
    const curBaseIdx = _findBaseIdx(curSlot);
    const toSlot = baseOrder[(curBaseIdx + 1) % baseOrder.length];
    _scheduleNextSwap(curSlot, toSlot);
  }
  // [FIX-IMG-RESUME-DELAY] 이어서 재생(resume)할 때 첫 전환까지의 대기시간을
  // 예전에는 무조건 "1번→2번" 전환 시간(photoDelay12)으로 계산했다. 그런데
  // 실제로 이어서 보여주는 슬롯(firstSlot)은 마지막으로 보던 슬롯일 수 있어서,
  // 예를 들어 4번 이미지부터 이어보는데 1번→2번 전환 시간(예: 2초)이 적용되며
  // 원래 4번 이미지에 설정된 전환 시간(예: 6초)보다 훨씬 빨리 넘어가 버리는
  // 등 설정과 다른 타이밍으로 넘어가는 원인이었다. 이제 firstSlot 기준으로
  // baseOrder 안에서 실제 "다음 슬롯"을 찾아 그 구간에 맞는 시간을 사용한다.
  const _firstBaseIdx = _findBaseIdx(firstSlot);
  const _firstToSlot = baseOrder[(_firstBaseIdx + 1) % baseOrder.length];
  mainBox._swapCurSlot = firstSlot;
  if (baseOrder.length >= 2) {
    _scheduleNextSwap(firstSlot, _firstToSlot);
  } else {
    mainBox._swapTimer = setTimeout(doSwap, 1000);
  }
}
// [FIX-IMG-BLANK] 등록된 이미지가 전부 깨졌을 때 완전히 텅 빈(회색) 화면 대신
// 이름 이니셜 플레이스홀더를 보여준다. photo가 아예 없는 선수의 기본 슬롯1과
// 동일한 스타일을 별도 오버레이 레이어로 그려서, 기존 img/video 슬롯들은
// 건드리지 않고 그 위에만 덮어씌운다.
// [FIX-NO-FALLBACK-LETTER] 이미지가 안 뜰 때 큰 이니셜 글자를 워터마크처럼
// 띄우던 것도 "이상한 게 보인다"는 피드백으로 제거했다. 이제는 이미지가 없거나
// 계속 로딩에 실패해도 아무것도 그리지 않고, 박스의 테마 배경색과 하단의
// 이름/티어/대학 정보만 보이는 깔끔한 상태로 남는다.
window._b2ShowFallbackLetter = function(mainBox, playerName) {
  try {
    if (!mainBox) return;
    const fb = mainBox.querySelector('#b2-main-fallback-letter');
    if (fb) fb.style.display = 'none';
  } catch (e) {}
};
window._b2HideFallbackLetter = function(mainBox) {
  try {
    const fb = mainBox ? mainBox.querySelector('#b2-main-fallback-letter') : document.getElementById('b2-main-fallback-letter');
    if (fb) fb.style.display = 'none';
  } catch (e) {}
};
// [FIX-IMG-BLANK] "깨짐" 처리된 슬롯은 이전까지 영구적으로 순환에서 제외됐다
// (재시도 로직이 없었음). 여기서 깨진 슬롯들을 주기적으로 한 번 더 시도해서,
// 일시적인 네트워크 문제(레이트리밋 등)로 실패했던 이미지가 나중에 다시 열리면
// 자동으로 순환에 복귀하도록 한다.
// [FIX-IMG-RETRY-LIMIT] 무한정 재시도하면 URL이 아예 삭제된 것처럼 영구적으로
// 죽은 이미지도 5~8초마다 계속 네트워크 요청을 보내게 된다. 슬롯마다 재시도
// 횟수를 세어 일정 횟수(MAX)를 넘기면 "포기(b2GiveUp)" 표시를 하고 더 이상
// 재시도하지 않는다. 새로 선수를 선택하면(=엘리먼트가 새로 생성되면) 카운트도
// 초기화되므로, 다음에 다시 볼 때는 또 정상적으로 재시도된다.
window._B2_RETRY_MAX = 5;
window._b2RetryBrokenSlots = function(mainBox) {
  try {
    if (!mainBox) return;
    for (let s = 1; s <= 10; s++) {
      const el = document.getElementById('b2-main-img-' + s);
      if (!el) continue;
      if (String(el.dataset.b2Broken || '') !== '1') continue;
      if (String(el.dataset.b2GiveUp || '') === '1') continue; // 이미 포기한 슬롯은 건너뜀
      const attempts = parseInt(el.dataset.b2RetryAttempts || '0', 10) + 1;
      el.dataset.b2RetryAttempts = String(attempts);
      if (attempts > window._B2_RETRY_MAX) {
        el.dataset.b2GiveUp = '1';
        continue;
      }
      const src = el.getAttribute('src');
      if (!src) continue;
      // [FIX-IMG-RETRY-VIDEO] video 슬롯은 이전까지 이 재시도 대상에서 제외돼 있어서,
      // 한 번 로드 실패하면(순간적 네트워크 오류 등) 선수를 다시 선택하기 전까지
      // 영구히 복구되지 않았다. img와 동일하게 숨겨진 <video>로 먼저 시험 로드해보고
      // 성공하면 실제 슬롯을 복구한다.
      if (el.tagName === 'VIDEO') {
        const _rv = document.createElement('video');
        _rv.muted = true;
        _rv.preload = 'metadata';
        _rv.onloadedmetadata = function () {
          el.dataset.b2Broken = '';
          el.dataset.b2GiveUp = '';
          el.dataset.b2RetryAttempts = '0';
          el.style.visibility = '';
          el.src = src;
          try { el.load(); } catch (e) {}
        };
        _rv.onerror = function () {
          el.dataset.b2Broken = '1';
          el.style.visibility = 'hidden';
        };
        _rv.src = src;
        continue;
      }
      const _re = new Image();
      _re.onload = function () {
        el.dataset.b2Broken = '';
        el.dataset.b2GiveUp = '';
        el.dataset.b2RetryAttempts = '0';
        el.style.visibility = '';
        el.src = src;
      };
      _re.onerror = function () {
        el.dataset.b2Broken = '1';
        el.style.visibility = 'hidden';
      };
      _re.src = src;
    }
  } catch (e) {}
};
// [FIX-IMG-RETRY-LIMIT] 살아있는 슬롯이 하나도 없을 때 재시도를 계속할지 판단.
// 남은 깨진 슬롯이 전부 "포기" 상태면 더 재시도할 게 없으므로 재시도 타이머
// 자체를 잡지 않는다(백그라운드에서 의미 없이 계속 도는 것 방지).
window._b2HasRetryableBrokenSlots = function(imgList) {
  try {
    for (let i = 0; i < imgList.length; i++) {
      const el = document.getElementById('b2-main-img-' + imgList[i].slot);
      if (!el) continue;
      if (String(el.dataset.b2Broken || '') === '1' && String(el.dataset.b2GiveUp || '') !== '1') return true;
    }
  } catch (e) {}
  return false;
};
// [FIX-IMG-RESTART] 슬롯1 <img>의 onload는 원래 "최초 로딩 완료 시 순환 시작"
// 용도였다. 그런데 이 onload 속성은 엘리먼트가 살아있는 한 계속 붙어 있어서,
// (1) 이미지가 캐시에서 즉시 로드돼 _b2UpdateMainDisplay가 img.complete를 보고
// 이미 한 번 _b2ScheduleImageSwap을 호출한 뒤에 브라우저가 load 이벤트를 뒤늦게
// 한 번 더 발생시키거나, (2) 일시적 로딩 실패 후 재시도(onerror 핸들러)가 같은
// src를 다시 대입해 로딩에 성공하는 경우, onload가 두 번 이상 발화해서 그때마다
// _b2ScheduleImageSwap이 재호출됐다. 매번 재호출될 때마다 순환 스케줄이 처음부터
// 다시 시작되며(이어보기로 같은 슬롯을 보여주긴 하지만) 다음 전환까지의 대기시간이
// 엉뚱하게 재계산되고 타이머가 계속 리셋되어, "처음엔 잘 순환되다가 이후부터
// 순서/타이밍이 이상해진다"는 문제의 원인이었다. 엘리먼트당 한 번만 실행되도록
// 가드를 둔다.
window._b2SwapStartOnce = function(playerName, el) {
  try {
    if (el) {
      if (el.dataset.b2SwapStarted === '1') return;
      el.dataset.b2SwapStarted = '1';
    }
    _b2ScheduleImageSwap(playerName);
  } catch (e) {
    try { _b2ScheduleImageSwap(playerName); } catch (_e) {}
  }
};
window._b2HandleMediaFailure = function(mediaEl) {
  try{
    if(!mediaEl) return;
    mediaEl.dataset.b2Broken = '1';
    const playerName = String(window._b2SelectedPlayer?.name || '').trim();
    if(!playerName || typeof window._b2ScheduleImageSwap !== 'function') return;
    // [FIX-IMG-FAIL-SCOPE] 예전에는 10장 중 어느 슬롯이든(지금 화면에 안 보이는 대기 중인
    // 슬롯이라도) 로드 실패하면 전체 순환 스케줄을 처음부터 다시 시작했다. 그러면 실제로는
    // 화면에 아무 변화가 없어야 할 상황에서도 "다음 전환까지 남은 시간"이 계속 리셋되며
    // 타이밍이 설정과 어긋나 보이는 원인이 됐다. 지금 실제로 화면에 보여지고 있는 슬롯이
    // 깨진 경우에만(그 자리를 즉시 벗어나야 하므로) 재시작하고, 대기 중인 슬롯의 실패는
    // baseOrder 순회 시 자동으로 건너뛰도록만 두어 재생 타이밍을 건드리지 않는다.
    const mainBox = document.getElementById('b2-players-main-box');
    const isCurrentlyShown = !!(mainBox && mainBox._swapCurSlot != null && mediaEl.id === ('b2-main-img-' + mainBox._swapCurSlot));
    if(!isCurrentlyShown) return;
    setTimeout(()=>window._b2ScheduleImageSwap(playerName), 0);
  }catch(e){}
};
window._b2RefreshImageControls = function(playerName, slot) {
  const settings = _b2GetImgSettings(playerName, slot);
  settings.zoom = settings.scale;
  settings.fill = settings.fit;
  settings.posX = settings.offsetX;
  settings.posY = settings.offsetY;
  const prefix = _b2GetImgControlPrefix(slot);
  const scaleEl = document.getElementById(`${prefix}-scale-val`);
  const brightnessEl = document.getElementById(`${prefix}-brightness-val`);
  const offsetEl = document.getElementById(`${prefix}-offset-val`);
  if (scaleEl) scaleEl.textContent = `${settings.scale}%`;
  if (brightnessEl) brightnessEl.textContent = `${settings.brightness}%`;
  if (offsetEl) offsetEl.textContent = `${settings.offsetX}px, ${settings.offsetY}px`;
  document.querySelectorAll(`[data-b2-fit-slot="${slot}"]`).forEach(btn => {
    btn.classList.toggle('active', btn.dataset.fit === settings.fit);
  });
  document.querySelectorAll(`[data-b2-auto-slot="${slot}"]`).forEach(btn => {
    const isOn = btn.dataset.autoAdjust === 'on';
    btn.classList.toggle('active', isOn ? settings.autoAdjust !== false : settings.autoAdjust === false);
  });
  _b2ApplyImgSettingsToDom(playerName, slot);
};
window._b2SetImgAutoAdjust = function(playerName, slot, enabled){
  const settings = _b2GetImgSettings(playerName, slot);
  settings.autoAdjust = !!enabled;
  if(enabled){
    settings.manualCenter = false;
  }
  _b2SaveImgSettings();
  if(typeof window._b2RefreshImageControls === 'function'){
    window._b2RefreshImageControls(playerName, slot);
  }else{
    _b2ApplyImgSettingsToDom(playerName, slot);
  }
};
window._b2CenterImage = function(playerName, slot) {
  const settings = _b2GetImgSettings(playerName, slot);
  settings.autoAdjust = false;
  settings.manualCenter = true;
  settings.offsetX = 0;
  settings.offsetY = 0;
  settings.posX = 0;
  settings.posY = 0;
  _b2SaveImgSettings();
  const prefix = _b2GetImgControlPrefix(slot);
  const offsetEl = document.getElementById(`${prefix}-offset-val`);
  if (offsetEl) offsetEl.textContent = `0px, 0px`;
  _b2ApplyImgSettingsToDom(playerName, slot);
};
function _b2BuildImageControlGroup(playerName, slot, label, hasImage) {
  const settings = _b2GetImgSettings(playerName, slot);
  const safeName = (playerName || '').replace(/\\/g, '\\\\').replace(/'/g, "\\'");
  const prefix = _b2GetImgControlPrefix(slot);
  const disabled = hasImage ? '' : 'disabled';
  return `
    <div class="b2-players-slot-card ${hasImage ? '' : 'is-disabled'}">
      <div class="b2-players-slot-title">${label}${hasImage ? '' : ' <span>미등록</span>'}</div>
      <div class="b2-players-img-control-group">
        <div class="b2-players-img-label">자동 보정</div>
        <div class="b2-players-img-btns">
          <button class="b2-players-img-btn ${settings.autoAdjust !== false ? 'active' : ''}" data-b2-auto-slot="${slot}" data-auto-adjust="on" ${disabled} onclick="_b2SetImgAutoAdjust('${safeName}','${slot}',true)">ON</button>
          <button class="b2-players-img-btn ${settings.autoAdjust === false ? 'active' : ''}" data-b2-auto-slot="${slot}" data-auto-adjust="off" ${disabled} onclick="_b2SetImgAutoAdjust('${safeName}','${slot}',false)">OFF</button>
        </div>
      </div>
      <div class="b2-players-img-control-group">
        <div class="b2-players-img-label">크기 <span id="${prefix}-scale-val">${settings.scale}%</span></div>
        <input type="range" class="b2-players-img-slider" min="50" max="220" value="${settings.scale}" ${disabled}
          oninput="document.getElementById('${prefix}-scale-val').textContent=this.value+'%';_b2PreviewImgSetting('${safeName}','${slot}','scale',this.value);this.dataset.pendingValue=this.value"
          onchange="_b2UpdateImgSetting('${safeName}','${slot}','scale',this.value)">
      </div>
      <div class="b2-players-img-control-group">
        <div class="b2-players-img-label">밝기 <span id="${prefix}-brightness-val">${settings.brightness}%</span></div>
        <input type="range" class="b2-players-img-slider" min="20" max="180" value="${settings.brightness}" ${disabled}
          oninput="document.getElementById('${prefix}-brightness-val').textContent=this.value+'%';_b2PreviewImgSetting('${safeName}','${slot}','brightness',this.value);this.dataset.pendingValue=this.value"
          onchange="_b2UpdateImgSetting('${safeName}','${slot}','brightness',this.value)">
      </div>
      <div class="b2-players-img-control-group">
        <div class="b2-players-img-label">배치</div>
        <div class="b2-players-img-btns">
          <button class="b2-players-img-btn ${settings.fit === 'cover' ? 'active' : ''}" data-b2-fit-slot="${slot}" data-fit="cover" ${disabled} onclick="_b2UpdateImgSetting('${safeName}','${slot}','fit','cover')">채우기</button>
          <button class="b2-players-img-btn ${settings.fit === 'contain' ? 'active' : ''}" data-b2-fit-slot="${slot}" data-fit="contain" ${disabled} onclick="_b2UpdateImgSetting('${safeName}','${slot}','fit','contain')">맞춤</button>
          <button class="b2-players-img-btn ${settings.fit === 'fill' ? 'active' : ''}" data-b2-fit-slot="${slot}" data-fit="fill" ${disabled} onclick="_b2UpdateImgSetting('${safeName}','${slot}','fit','fill')">늘리기</button>
          <button class="b2-players-img-btn" ${disabled} onclick="_b2UpdateImgSetting('${safeName}','${slot}','scale',200)">2배 확대</button>
          <button class="b2-players-img-btn" ${disabled} onclick="_b2CenterImage('${safeName}','${slot}')">중앙 정렬</button>
        </div>
      </div>
      <div class="b2-players-img-control-group">
        <div class="b2-players-img-label">위치 <span id="${prefix}-offset-val">${settings.offsetX}px, ${settings.offsetY}px</span></div>
        <div class="b2-players-img-btns">
          <button class="b2-players-img-btn b2-players-img-btn-sm" ${disabled} onclick="_b2MoveImg('${safeName}','${slot}',0,-12)">상</button>
          <button class="b2-players-img-btn b2-players-img-btn-sm" ${disabled} onclick="_b2MoveImg('${safeName}','${slot}',0,12)">하</button>
          <button class="b2-players-img-btn b2-players-img-btn-sm" ${disabled} onclick="_b2MoveImg('${safeName}','${slot}',-12,0)">좌</button>
          <button class="b2-players-img-btn b2-players-img-btn-sm" ${disabled} onclick="_b2MoveImg('${safeName}','${slot}',12,0)">우</button>
          <button class="b2-players-img-btn b2-players-img-btn-sm" ${disabled} onclick="_b2ResetImgSettings('${safeName}','${slot}');_b2RefreshImageControls('${safeName}','${slot}')">초기화</button>
        </div>
      </div>
    </div>
  `;
}
window._b2UpdateImgSetting = function(playerName, slot, key, val) {
  if (val === undefined) {
    val = key;
    key = slot;
    slot = 'primary';
  }
  const keyMap = { zoom: 'scale', fill: 'fit', posX: 'offsetX', posY: 'offsetY' };
  key = keyMap[key] || key;
  const s = _b2GetImgSettings(playerName, slot);
  if(key === 'fit' || key === 'scale' || key === 'offsetX' || key === 'offsetY'){
    s.autoAdjust = false;
    s.manualCenter = false;
  }
  const numVal = parseInt(val, 10);
  s[key] = isNaN(numVal) ? val : numVal;
  // [FIX-IMG-HERO-BLANK] 슬라이더/입력값이 비정상적으로 크거나 작아도 이미지가
  // 박스 밖으로 완전히 밀려나거나 사라지지 않도록 안전 범위로 고정.
  if (key === 'scale') s.scale = Math.max(50, Math.min(220, s.scale));
  if (key === 'offsetX') s.offsetX = Math.max(-240, Math.min(240, s.offsetX));
  if (key === 'offsetY') s.offsetY = Math.max(-240, Math.min(240, s.offsetY));
  s.zoom = s.scale;
  s.fill = s.fit;
  s.posX = s.offsetX;
  s.posY = s.offsetY;
  _b2SaveImgSettings();
  const prefix = _b2GetImgControlPrefix(slot);
  const scaleEl = document.getElementById(`${prefix}-scale-val`);
  const brightnessEl = document.getElementById(`${prefix}-brightness-val`);
  const offsetEl = document.getElementById(`${prefix}-offset-val`);
  if (scaleEl) scaleEl.textContent = `${s.scale}%`;
  if (brightnessEl) brightnessEl.textContent = `${s.brightness}%`;
  if (offsetEl) offsetEl.textContent = `${s.offsetX}px, ${s.offsetY}px`;
  document.querySelectorAll(`[data-b2-fit-slot="${slot}"]`).forEach(btn => {
    btn.classList.toggle('active', btn.dataset.fit === s.fit);
  });
  document.querySelectorAll(`[data-b2-auto-slot="${slot}"]`).forEach(btn => {
    const isOn = btn.dataset.autoAdjust === 'on';
    btn.classList.toggle('active', isOn ? s.autoAdjust !== false : s.autoAdjust === false);
  });
  _b2ApplyImgSettingsToDom(playerName, slot);
};
window._b2MoveImg = function(playerName, slot, dx, dy) {
  if (dy === undefined) {
    dy = dx;
    dx = slot;
    slot = 'primary';
  }
  const s = _b2GetImgSettings(playerName, slot);
  s.autoAdjust = false;
  s.manualCenter = false;
  // [FIX-IMG-HERO-BLANK] 이동 버튼을 계속 누르면 offsetX/Y가 한없이 누적되어
  // 이미지가 박스 밖으로 완전히 밀려나 안 보이게 될 수 있었다. 안전 범위로 제한.
  s.offsetX = Math.max(-240, Math.min(240, s.offsetX + dx));
  s.offsetY = Math.max(-240, Math.min(240, s.offsetY + dy));
  s.posX = s.offsetX;
  s.posY = s.offsetY;
  _b2SaveImgSettings();
  const prefix = _b2GetImgControlPrefix(slot);
  const offsetEl = document.getElementById(`${prefix}-offset-val`);
  if (offsetEl) offsetEl.textContent = `${s.offsetX}px, ${s.offsetY}px`;
  _b2ApplyImgSettingsToDom(playerName, slot);
};

try{
  window.Board2ImageUtils = window.Board2ImageUtils || {
    getImgSettings: _b2GetImgSettings,
    renderCfgImgSettings: _renderCfgImgSettings
  };
}catch(e){}
