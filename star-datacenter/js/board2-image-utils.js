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
        <div style="font-size:12px;margin-bottom:4px">크기: <span id="cfg-p-scale">${primarySettings.scale}%</span></div>
        <input type="range" min="50" max="220" value="${primarySettings.scale}" style="width:100%" oninput="_b2UpdateImgSetting('${safeName}','primary','scale',this.value);document.getElementById('cfg-p-scale').textContent=this.value+'%'">
      </div>
      <div style="margin-bottom:10px">
        <div style="font-size:12px;margin-bottom:4px">밝기: <span id="cfg-p-bright">${primarySettings.brightness}%</span></div>
        <input type="range" min="20" max="180" value="${primarySettings.brightness}" style="width:100%" oninput="_b2UpdateImgSetting('${safeName}','primary','brightness',this.value);document.getElementById('cfg-p-bright').textContent=this.value+'%'">
      </div>
      <div style="margin-bottom:10px">
        <div style="font-size:12px;margin-bottom:4px">배치</div>
        <div style="display:flex;gap:4px;flex-wrap:wrap">
          <button class="btn btn-xs ${primarySettings.fit==='cover'?'btn-b':'btn-w'}" onclick="_b2UpdateImgSetting('${safeName}','primary','fit','cover');_renderCfgImgSettings('${safeName}')">채우기</button>
          <button class="btn btn-xs ${primarySettings.fit==='contain'?'btn-b':'btn-w'}" onclick="_b2UpdateImgSetting('${safeName}','primary','fit','contain');_renderCfgImgSettings('${safeName}')">맞춤</button>
          <button class="btn btn-xs ${primarySettings.fit==='fill'?'btn-b':'btn-w'}" onclick="_b2UpdateImgSetting('${safeName}','primary','fit','fill');_renderCfgImgSettings('${safeName}')">늘리기</button>
        </div>
      </div>
      <div style="margin-bottom:10px">
        <div style="font-size:12px;margin-bottom:4px">위치 이동</div>
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
    ` : '<div style="color:var(--gray-l);font-size:12px">등록된 이미지 없음</div>';
  }
  if (secondaryDiv) {
    secondaryDiv.innerHTML = hasSecondary ? `
      <div style="margin-bottom:10px">
        <div style="font-size:12px;margin-bottom:4px">크기: <span id="cfg-s-scale">${secondarySettings.scale}%</span></div>
        <input type="range" min="50" max="220" value="${secondarySettings.scale}" style="width:100%" oninput="_b2UpdateImgSetting('${safeName}','secondary','scale',this.value);document.getElementById('cfg-s-scale').textContent=this.value+'%'">
      </div>
      <div style="margin-bottom:10px">
        <div style="font-size:12px;margin-bottom:4px">밝기: <span id="cfg-s-bright">${secondarySettings.brightness}%</span></div>
        <input type="range" min="20" max="180" value="${secondarySettings.brightness}" style="width:100%" oninput="_b2UpdateImgSetting('${safeName}','secondary','brightness',this.value);document.getElementById('cfg-s-bright').textContent=this.value+'%'">
      </div>
      <div style="margin-bottom:10px">
        <div style="font-size:12px;margin-bottom:4px">배치</div>
        <div style="display:flex;gap:4px;flex-wrap:wrap">
          <button class="btn btn-xs ${secondarySettings.fit==='cover'?'btn-b':'btn-w'}" onclick="_b2UpdateImgSetting('${safeName}','secondary','fit','cover');_renderCfgImgSettings('${safeName}')">채우기</button>
          <button class="btn btn-xs ${secondarySettings.fit==='contain'?'btn-b':'btn-w'}" onclick="_b2UpdateImgSetting('${safeName}','secondary','fit','contain');_renderCfgImgSettings('${safeName}')">맞춤</button>
          <button class="btn btn-xs ${secondarySettings.fit==='fill'?'btn-b':'btn-w'}" onclick="_b2UpdateImgSetting('${safeName}','secondary','fit','fill');_renderCfgImgSettings('${safeName}')">늘리기</button>
        </div>
      </div>
      <div style="margin-bottom:10px">
        <div style="font-size:12px;margin-bottom:4px">위치 이동</div>
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
    ` : '<div style="color:var(--gray-l);font-size:12px">등록된 이미지 없음</div>';
  }
}
function _b2ClearSwapTimer(mainBox) {
  if (mainBox && mainBox._swapTimer) {
    clearTimeout(mainBox._swapTimer);
    mainBox._swapTimer = null;
  }
}
function _b2ScheduleImageSwap(playerName) {
  const mainBox = document.getElementById('b2-players-main-box');
  if (!mainBox) return;
  _b2ClearSwapTimer(mainBox);
  const img1 = document.getElementById('b2-main-img-1');
  const img2 = document.getElementById('b2-main-img-2');
  if (img1) img1.style.opacity = '1';
  if (img2) img2.style.opacity = '0';
  if (!img2) return;
  mainBox._swapTimer = setTimeout(() => {
    const curImg1 = document.getElementById('b2-main-img-1');
    const curImg2 = document.getElementById('b2-main-img-2');
    if (curImg1) curImg1.style.opacity = '0';
    if (curImg2) curImg2.style.opacity = '1';
  }, 1000);
}
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
  s.offsetX += dx;
  s.offsetY += dy;
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
