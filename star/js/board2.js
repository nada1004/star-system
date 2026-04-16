/* ══════════════════════════════════════
   현황판 — 대학별 컬러블록 로스터 보드
   (구현황판 통합 포함)
══════════════════════════════════════ */

let _b2View = 'univ';
let _b2SaveUniv = '전체';
let _b2Collapsed = new Set();
let _b2ShowSolo = false;
let _b2CrewCollapsed = new Set();
let _b2CrewCardSize = 'm'; // 's' | 'm' | 'l'
let _b2CrewListMode = 'grid'; // 'grid' | 'list'
// 종합게임 뷰 전역 변수
window._b2GameListMode = 'grid'; // 'grid' | 'list'
window._b2GameCardSize = 'm'; // 's' | 'm' | 'l'
// 프로필 탭 필터 변수
let _b2PlayersUnivFilter = '전체';
let _b2PlayersFilter = 'all'; // 'all' | 'P' | 'T' | 'Z'
let _b2PlayersTierFilter = '전체'; // '전체' | '0' | '1' | '2' | '3' | '4' | '유스'
let _b2SelectedPlayer = null;
let _b2PlayersSort = 'default'; // 'default' | 'name' | 'tier'

// 프로필 탭 이미지 조절 설정 (전역 설정 - 모든 선수 동일)
let _b2GlobalImgSettings = JSON.parse(localStorage.getItem('su_b2_global_img_settings') || '{}');
function _b2SaveImgSettings() {
  localStorage.setItem('su_b2_global_img_settings', JSON.stringify(_b2GlobalImgSettings));
  // Firebase에 설정 동기화
  if(typeof save==='function' && typeof isLoggedIn!=='undefined' && isLoggedIn) save();
}
function _b2DefaultSingleImgSettings() {
  return {
    scale: 100,
    brightness: 100,
    fit: 'cover',
    offsetX: 0,
    offsetY: 0,
    zoom: 100,
    fill: 'cover',
    posX: 0,
    posY: 0
  };
}
function _b2GetImgSettings(playerName, slot) {
  // 전역 설정 사용 (모든 선수 동일)
  const key = slot === 'secondary' ? 'secondary' : 'primary';
  if (!_b2GlobalImgSettings[key]) {
    _b2GlobalImgSettings[key] = _b2DefaultSingleImgSettings();
  }
  // 동기화
  _b2GlobalImgSettings[key].zoom = _b2GlobalImgSettings[key].scale;
  _b2GlobalImgSettings[key].fill = _b2GlobalImgSettings[key].fit;
  _b2GlobalImgSettings[key].posX = _b2GlobalImgSettings[key].offsetX;
  _b2GlobalImgSettings[key].posY = _b2GlobalImgSettings[key].offsetY;
  return _b2GlobalImgSettings[key];
}
function _b2SetImgSetting(playerName, key, val) {
  // 전역 설정 사용
  const s = _b2GetImgSettings(playerName, 'primary');
  s[key] = val;
  _b2SaveImgSettings();
}
window._b2ResetImgSettings = function(playerName, slot) {
  // 전역 설정 초기화 (모든 선수 동일하게 적용)
  if (slot === 'primary' || slot === 'secondary') {
    _b2GlobalImgSettings[slot] = _b2DefaultSingleImgSettings();
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
function _b2ApplyImgSettingsToElement(el, settings) {
  if (!el || !settings) return;
  el.style.objectFit = settings.fit || 'contain';
  el.style.objectPosition = 'center';
  el.style.filter = `brightness(${(settings.brightness || 100) / 100})`;
  el.style.transform = _b2GetImgTransform(settings);
}
function _b2ApplyImgSettingsToDom(playerName, slot) {
  _b2ApplyImgSettingsToElement(document.getElementById(_b2GetImgDomId(slot)), _b2GetImgSettings(playerName, slot));
}

// 설정 탭용 이미지 설정 함수
function _b2CenterImageCfg(playerName, slot) {
  // 전역 설정 사용
  const s = _b2GetImgSettings(playerName, slot);
  s.offsetX = 0;
  s.offsetY = 0;
  s.posX = 0;
  s.posY = 0;
  _b2SaveImgSettings();
  if (typeof _renderCfgImgSettings === 'function') _renderCfgImgSettings(playerName);
}

// 현재 설정을 모든 선수에게 적용 (전역 설정이므로 이미 적용됨)
function _b2ApplySettingsToAll(refPlayerName, slot) {
  // 전역 설정은 이미 모든 선수에 적용됨
  const settings = _b2GetImgSettings(refPlayerName, slot);
  _b2SaveImgSettings();
  alert(`이미지 ${slot === 'primary' ? '1' : '2'} 설정이 모든 선수에게 적용되었습니다. (크기: ${settings.scale}%, 밝기: ${settings.brightness}%, 배치: ${settings.fit})`);
  if (typeof _renderCfgImgSettings === 'function') _renderCfgImgSettings(refPlayerName);
}

// 설정 탭용 이미지 설정 UI 렌더링 함수
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
  _b2ApplyImgSettingsToDom(playerName, slot);
};
window._b2CenterImage = function(playerName, slot) {
  const settings = _b2GetImgSettings(playerName, slot);
  settings.offsetX = 0;
  settings.offsetY = 0;
  settings.posX = 0;
  settings.posY = 0;
  _b2SaveImgSettings();
  
  // 직접 offset 값 표시 업데이트
  const prefix = _b2GetImgControlPrefix(slot);
  const offsetEl = document.getElementById(`${prefix}-offset-val`);
  if (offsetEl) offsetEl.textContent = `0px, 0px`;
  
  // 이미지에 즉시 적용
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
        <div class="b2-players-img-label">크기 <span id="${prefix}-scale-val">${settings.scale}%</span></div>
        <input type="range" class="b2-players-img-slider" min="50" max="220" value="${settings.scale}" ${disabled}
          oninput="document.getElementById('${prefix}-scale-val').textContent=this.value+'%';_b2ApplyImgSettingsToDom('${safeName}','${slot}');this.dataset.pendingValue=this.value"
          onchange="_b2UpdateImgSetting('${safeName}','${slot}','scale',this.value)">
      </div>
      <div class="b2-players-img-control-group">
        <div class="b2-players-img-label">밝기 <span id="${prefix}-brightness-val">${settings.brightness}%</span></div>
        <input type="range" class="b2-players-img-slider" min="20" max="180" value="${settings.brightness}" ${disabled}
          oninput="document.getElementById('${prefix}-brightness-val').textContent=this.value+'%';_b2ApplyImgSettingsToDom('${safeName}','${slot}');this.dataset.pendingValue=this.value"
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

// 대학별 현황판 색상 진하기 (0~100, %)
let b2LabelAlpha  = J('su_b2la')  ?? 16;
let b2BgAlpha     = J('su_b2ba')  ?? 9;
let b2BgImgAlpha      = J('su_b2bia')  ?? 12; // 배경 이미지 진하기 기본값 (0~100, %)
let b2FreeBgAlpha     = J('su_b2fba')  ?? 25; // 무소속 배경 진하기 (기본 25%)
let b2FreeTierBgAlpha = J('su_b2ftba') ?? 15; // 무소속 티어 우측 배경 진하기 (기본 15%)
let b2ProfileBgAlpha  = J('su_b2pba') ?? 10; // 프로필 탭 배경 밝기 (기본 10%)
function _b2AlphaHex(pct){ return Math.round((pct||0)/100*255).toString(16).padStart(2,'0'); }

function _b2ToggleCard(btn, univName) {
  if (_b2Collapsed.has(univName)) _b2Collapsed.delete(univName); else _b2Collapsed.add(univName);
  const card = btn.closest('[data-b2card]');
  if (!card) return;
  const body = card.querySelector('.b2-card-body');
  if (body) body.style.display = _b2Collapsed.has(univName) ? 'none' : '';
  btn.textContent = _b2Collapsed.has(univName) ? '▶' : '▼';
}
function _b2CollapseAll() {
  _b2VisUnivs().filter(u=>u.name!=='무소속').forEach(u=>_b2Collapsed.add(u.name));
  const s=document.getElementById('b2-content'); if(s){s.innerHTML=_b2UnivView();injectUnivIcons(s);}
}
function _b2ExpandAll() {
  _b2Collapsed.clear();
  const s=document.getElementById('b2-content'); if(s){s.innerHTML=_b2UnivView();injectUnivIcons(s);}
}

const _B2_ROLE_ORDER = ['이사장','동아리 회장','총장','부총장','교수','코치','선장','동아리장','반장','총괄'];

function _b2RoleRank(p) {
  const i = _B2_ROLE_ORDER.indexOf(p.role||'');
  return i >= 0 ? i : 99;
}

// 숨김 대학 항상 제외 (로그인 여부 관계없이 board2에서는 hidden=true인 대학 숨김)
function _b2VisUnivs() {
  return getAllUnivs().filter(u => !u.hidden);
}

function rBoard2(C, T) {
  try {
  T.innerText = '📊 현황판';

  const univList = _b2VisUnivs().filter(u => u.name !== '무소속');

  // 탭 버튼 스타일 헬퍼
  function _b2TabBtn(view, color, label) {
    const on = _b2View === view;
    const c = color || 'var(--blue)';
    // 활성 상태일 때 배경색을 직접 색상으로 설정 (모든 탭 파란색 통일)
    const bgColor = on ? '#3b82f6' : '#fff';
    return `<button onclick="_b2View='${view}';render()" style="padding:5px 16px;border-radius:20px;border:2px solid ${on?bgColor:'var(--border2)'};background:${bgColor};color:${on?'#fff':'#1e293b'};font-weight:700;font-size:12px;cursor:pointer">${label}</button>`;
  }

  // 잘못된 뷰 리셋 (삭제된 탭 or 로그인 필요 탭)
  if (_b2View === 'game' || _b2View === 'crew') _b2View = 'univ';
  if (_b2View === 'old' && !isLoggedIn) _b2View = 'univ';

  // 저장/초기화 바
  let saveBar = '';
  if (_b2View === 'univ') {
    saveBar = `<div style="display:flex;align-items:center;gap:6px;flex-shrink:0">
      <div style="position:relative">
        <select id="b2-save-sel" onchange="_b2SaveUniv=this.value" style="padding:4px 28px 4px 10px;border-radius:8px;border:1px solid var(--border2);font-size:12px;background:var(--white);color:var(--text2);appearance:none;cursor:pointer">
          <option value="전체">🏫 전체</option>
          ${univList.map(u=>`<option value="${u.name}"${_b2SaveUniv===u.name?' selected':''}>${u.name}</option>`).join('')}
        </select>
        <svg style="position:absolute;right:6px;top:50%;transform:translateY(-50%);pointer-events:none;color:var(--gray-l)" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m6 9 6 6 6-6"/></svg>
      </div>
      <button onclick="saveB2Img()" style="padding:4px 12px;border-radius:8px;border:1px solid var(--border2);background:var(--white);color:var(--text2);font-size:12px;font-weight:700;cursor:pointer;display:flex;align-items:center;gap:4px;margin-bottom:0">📷 이미지저장</button>
    </div>`;
  } else if (_b2View === 'free') {
    saveBar = `<div style="flex-shrink:0">
      <button onclick="saveB2FreeImg()" style="padding:4px 12px;border-radius:8px;border:1px solid var(--border2);background:var(--white);color:var(--text2);font-size:12px;font-weight:700;cursor:pointer;display:flex;align-items:center;gap:4px">📷 이미지저장</button>
    </div>`;
  } else if (_b2View === 'femco') {
    saveBar = `<div style="display:flex;gap:6px;flex-shrink:0">
      <button onclick="saveB2FemcoAllImg()" style="padding:4px 12px;border-radius:8px;border:1px solid var(--border2);background:var(--white);color:var(--text2);font-size:12px;font-weight:700;cursor:pointer;display:flex;align-items:center;gap:4px">💾 전체 저장</button>
    </div>`;
  }

  const profileTabLabel = '👤 이미지별';
  // 이미지별 필터를 상단 탭에 포함
  const dissolvedUnivs = typeof univCfg !== 'undefined' ? new Set((univCfg.filter(u => u.dissolved) || []).map(u => u.name)) : new Set();
  const visPlayers = players.filter(p => !p.hidden && !p.retired && !p.hideFromBoard && !dissolvedUnivs.has(p.univ));
  const playerUnivList = [...new Set(visPlayers.map(p => p.univ).filter(u => u && u !== '무소속'))];
  // univCfg 순서로 정렬
  if (typeof univCfg !== 'undefined') {
    playerUnivList.sort((a, b) => {
      const idxA = univCfg.findIndex(u => u.name === a);
      const idxB = univCfg.findIndex(u => u.name === b);
      return (idxA >= 0 ? idxA : 999) - (idxB >= 0 ? idxB : 999);
    });
  } else {
    playerUnivList.sort();
  }
  const playerFilters = _b2View === 'players' ? `
    <div style="width:1px;height:24px;background:var(--border2);display:inline-block"></div>
    <div style="position:relative">
      <select id="b2-players-univ-sel" onchange="_b2PlayersUnivFilter=this.value;document.getElementById('b2-content').innerHTML=_b2PlayersView();setTimeout(()=>{if(_b2SelectedPlayer)_b2UpdateMainDisplay(_b2SelectedPlayer.name)},0)" style="padding:6px 28px 6px 12px;border-radius:20px;border:1px solid var(--border2);font-size:13px;background:var(--white);color:var(--text2);appearance:none;cursor:pointer">
        <option value="전체" ${_b2PlayersUnivFilter === '전체' ? 'selected' : ''}>🏫 전체 대학</option>
        ${playerUnivList.map(u => `<option value="${u}" ${_b2PlayersUnivFilter === u ? 'selected' : ''}>${u}</option>`).join('')}
      </select>
      <svg style="position:absolute;right:8px;top:50%;transform:translateY(-50%);pointer-events:none;color:var(--gray-l)" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m6 9 6 6 6-6"/></svg>
    </div>
    <div style="position:relative">
      <select id="b2-players-race-sel" onchange="_b2PlayersFilter=this.value;document.getElementById('b2-content').innerHTML=_b2PlayersView();setTimeout(()=>{if(_b2SelectedPlayer)_b2UpdateMainDisplay(_b2SelectedPlayer.name)},0)" style="padding:6px 28px 6px 12px;border-radius:20px;border:1px solid var(--border2);font-size:13px;background:var(--white);color:var(--text2);appearance:none;cursor:pointer">
        <option value="all" ${_b2PlayersFilter === 'all' ? 'selected' : ''}>🎮 전체 종족</option>
        <option value="P" ${_b2PlayersFilter === 'P' ? 'selected' : ''}>🔮 프로토스</option>
        <option value="T" ${_b2PlayersFilter === 'T' ? 'selected' : ''}>⚔️ 테란</option>
        <option value="Z" ${_b2PlayersFilter === 'Z' ? 'selected' : ''}>🦎 저그</option>
      </select>
      <svg style="position:absolute;right:8px;top:50%;transform:translateY(-50%);pointer-events:none;color:var(--gray-l)" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m6 9 6 6 6-6"/></svg>
    </div>
  ` : '';
  const oldBtn = isLoggedIn?_b2TabBtn('old','#64748b','📊 구현황판'):'';
  // 우측 버튼: 펨코현황은 "전체 저장"만, 나머지는 기존 저장/기능 버튼
  const rightBtns = saveBar;

  const filterBar = `
    <div id="b2-nav" style="display:flex;align-items:center;gap:8px;margin-bottom:16px;flex-wrap:wrap">
      ${_b2TabBtn('univ','var(--blue)','🏟️ 대학별')}
      ${_b2TabBtn('femco','var(--blue)','🧩 펨코현황')}
      ${_b2TabBtn('free','var(--blue)','🚶 무소속')}
      ${_b2TabBtn('players','var(--purple)',profileTabLabel)}
      ${oldBtn}
      ${playerFilters}
      <span style="flex:1"></span>
      ${rightBtns}
    </div>
    <div id="b2-content"></div>`;

  C.innerHTML = filterBar;

  const sub = document.getElementById('b2-content');
  if (_b2View === 'univ') {
    sub.innerHTML = _b2UnivView();
    injectUnivIcons(sub);
  } else if (_b2View === 'femco') {
    sub.innerHTML = _b2FemcoView();
    injectUnivIcons(sub);
  } else if (_b2View === 'free') {
    sub.innerHTML = _b2FreeView();
    injectUnivIcons(sub);
  } else if (_b2View === 'players') {
    sub.innerHTML = _b2PlayersView();
    // 이미지별 탭: 최초 진입 시에도 저장된 이미지 설정(크기/밝기/배치/오프셋)이 바로 적용되도록
    setTimeout(() => {
      try{
        if (_b2SelectedPlayer && typeof _b2ApplyImgSettingsToDom === 'function') {
          _b2ApplyImgSettingsToDom(_b2SelectedPlayer.name, 'primary');
          _b2ApplyImgSettingsToDom(_b2SelectedPlayer.name, 'secondary');
        }
      }catch(e){}
    }, 0);
  } else if (_b2View === 'old') {
    if (typeof rBoard === 'function') rBoard(sub, T);
    else sub.innerHTML = '<div style="padding:40px;text-align:center;color:var(--gray-l)">구현황판을 불러올 수 없습니다.</div>';
  }
  } catch(e) {
    console.error('[rBoard2] 오류:', e);
    C.innerHTML = `<div style="padding:40px;text-align:center;color:#dc2626">
      <div style="font-weight:700;margin-bottom:8px">현황판 로딩 중 오류가 발생했습니다</div>
      <div style="font-size:12px;color:var(--gray-l)">${e.message}</div>
    </div>`;
  }
}

/* ── 대학별 뷰 ── */
function _b2UnivView() {
  const univList = _b2VisUnivs().filter(u => u.name !== '무소속' && u.name);
  if (!univList.length) return `<div style="text-align:center;color:var(--text3);padding:40px">표시할 대학이 없습니다</div>`;
  const _allVis = players.filter(p => univList.some(u=>u.name===p.univ) && !p.hidden && !p.retired && !p.hideFromBoard);
  const _tierCts = {}; _allVis.forEach(p=>{ const t=p.tier||'?'; _tierCts[t]=(_tierCts[t]||0)+1; });
  const statsBar = `<div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;padding:7px 14px;background:var(--surface);border:1px solid var(--border2);border-radius:10px;flex-wrap:wrap">
    <span style="font-size:12px;font-weight:800;color:var(--text2)">👥 ${_allVis.length}명</span>
    <span style="width:1px;height:14px;background:var(--border2);display:inline-block"></span>
    <span style="font-size:12px;font-weight:800;color:var(--text2)">🏫 ${univList.length}개 대학</span>
    ${TIERS.filter(t=>_tierCts[t]).length?`<span style="width:1px;height:14px;background:var(--border2);display:inline-block"></span>${TIERS.filter(t=>_tierCts[t]).map(t=>`<span style="font-size:11px;font-weight:700;padding:1px 7px;border-radius:8px;background:${getTierBtnColor(t)};color:${getTierBtnTextColor(t)||'#fff'}">${t} ${_tierCts[t]}</span>`).join('')}`:''}
  </div>`;
  const _b2Cols = (typeof boardGridCols!=='undefined'&&boardGridCols===2) ? 'repeat(2,1fr)' : '1fr';
  let h = statsBar + `<style>.b2-bottom-img{max-width:130px;max-height:110px;object-fit:contain;}.b2-side-panel{float:right;width:230px;margin:0 0 6px 10px;border-radius:10px;padding:8px;box-sizing:border-box;}@media(min-width:769px) and (max-width:1024px){.b2-univ-grid{grid-template-columns:1fr!important;}.b2-side-panel{width:180px;}}@media(max-width:640px){.b2-side-panel{display:none!important;}.b2-bottom-img{display:none!important;}}@media(max-width:768px){.b2-univ-grid{grid-template-columns:1fr!important;}</style>`;
  h += `<div class="b2-univ-grid" style="display:grid;grid-template-columns:${_b2Cols};gap:12px;align-items:start">`;
  univList.forEach(u => {
    if (!u.name) {
      console.warn('[현황판] 대학 이름이 없는 데이터가 발견되었습니다:', u);
      return;
    }
    const members = players.filter(p => p.univ === u.name && !p.hidden && !p.retired && !p.hideFromBoard);
    h += _b2UnivBlock(u.name, gc(u.name), members);
  });
  h += `</div>`;
  return h;
}

/* ── 🧩 펨코현황 뷰 ──
   첨부 이미지처럼 "대학별 컬러 섹션 + 촘촘한 프로필 그리드" 형태로 렌더링
*/
function _b2FemcoView() {
  // ─────────────────────────────────────────────────────────────
  // 펨코현황 전용 설정(로컬 저장)
  // ─────────────────────────────────────────────────────────────
  const FEMCO_STORE_KEY = 'b2_femco_settings_v1';
  const femcoDefaultSettings = () => ({
    logoSize: 150,            // 대학 로고(px)
    logoPos: 'top',           // top | bottom | left | right | center
    logoAttachTitle: 1,       // 1: 로고+대학명 같이 이동, 0: 로고만 이동
    headGap: 10,              // 로고-대학명(세로) 간격
    titleSize: 28,            // 대학명 폰트(px)
    titleFont: 'system',      // system | noto | pretendard
    playerImgSize: 46,        // 스트리머 이미지(px)
    playerImgShape: 'square', // square | circle
    rowsPerCol: 5,            // 한 컬럼(세로) 당 표시 인원(=줄 수)
    colWidth: 170,            // 컬럼(좌우) 너비(px)
    colGap: 10,               // (legacy) 간격(px) - UI에서는 '상하 간격'으로 사용
    univGap: 18,              // 대학 섹션 간격(px)
    countFontSize: 12,        // 인원수 폰트(px)
    contentPadX: 16,          // 좌우 여백(px)
    contentAlign: 'center',   // left | center
    contentOffsetX: 0,        // 좌우 미세 이동(-40~40)
    univSubtitles: {},        // { [univName]: "대학명 아래 문구" }
    subtitleSize: 12,         // 서브문구 폰트(px)
    subtitleWeight: 800,      // 서브문구 굵기
    subtitleColor: '',        // ''이면 자동(대학 글자색), 아니면 CSS 색
    // 스트리머 표시 스타일
    nameFontSize: 12,
    roleFontSize: 10,
    tierBadgeSize: 10,
    tierBadgePadX: 6,
    starSize: 15,            // ⭐ 크기(px)
    statusIconSize: 18,      // 상태 아이콘 크기(px)
    univColorOverrides: {},   // { [univName]: "#RRGGBB" }
  });
  function femcoLoad(){
    try{
      const raw = localStorage.getItem(FEMCO_STORE_KEY);
      if (!raw) return femcoDefaultSettings();
      const obj = JSON.parse(raw) || {};
      return {
        ...femcoDefaultSettings(),
        ...obj,
        univColorOverrides: { ...(femcoDefaultSettings().univColorOverrides||{}), ...(obj.univColorOverrides||{}) }
      };
    }catch(e){ return femcoDefaultSettings(); }
  }
  function femcoSave(next){
    try{ localStorage.setItem(FEMCO_STORE_KEY, JSON.stringify(next)); }catch(e){}
  }
  let femcoSettings = femcoLoad();
  // 펨코현황 관련 설정 UI는 "설정 탭 > 현황판 관리 > 펨코현황"에서만 제공합니다.

  const univList = _b2VisUnivs().filter(u => u.name && u.name !== '무소속');
  if (!univList.length) return `<div style="text-align:center;color:var(--text3);padding:40px">표시할 대학이 없습니다</div>`;

  // univCfg 순서로 정렬 (없으면 이름순)
  if (typeof univCfg !== 'undefined' && univCfg.length) {
    univList.sort((a, b) => {
      const ia = univCfg.findIndex(u => u.name === a.name);
      const ib = univCfg.findIndex(u => u.name === b.name);
      return (ia >= 0 ? ia : 999) - (ib >= 0 ? ib : 999);
    });
  } else {
    univList.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  }

  // 표시 대상 선수(현황판 기준과 동일하게 숨김/은퇴/현황판숨김 제외)
  const membersByUniv = {};
  univList.forEach(u => {
    membersByUniv[u.name] = players.filter(p => p.univ === u.name && !p.hidden && !p.retired && !p.hideFromBoard);
  });

  const LOGO = Math.max(60, Math.min(340, parseInt(femcoSettings.logoSize || 150, 10) || 150));
  const titleSize = Math.max(16, Math.min(44, parseInt(femcoSettings.titleSize || 28, 10) || 28));
  const playerImgSize = Math.max(28, Math.min(90, parseInt(femcoSettings.playerImgSize || 46, 10) || 46));
  const playerRadius = femcoSettings.playerImgShape === 'circle' ? '50%' : '10px';
  const rowsPerCol = Math.max(2, Math.min(12, parseInt(femcoSettings.rowsPerCol || 5, 10) || 5));
  const colWidth = Math.max(80, Math.min(360, parseInt(femcoSettings.colWidth || 170, 10) || 170));
  const rowGap = Math.max(0, Math.min(28, parseInt(femcoSettings.colGap || 10, 10) || 10)); // UI에서 '상하 간격'
  const colGap = 10; // 가로(컬럼) 간격은 고정(너무 벌어지지 않게)
  const univGap = Math.max(0, Math.min(40, parseInt(femcoSettings.univGap || 18, 10) || 18));
  const countFontSize = Math.max(10, Math.min(18, parseInt(femcoSettings.countFontSize || 12, 10) || 12));
  const contentPadX = Math.max(0, Math.min(40, parseInt(femcoSettings.contentPadX || 16, 10) || 16));
  const contentAlign = (femcoSettings.contentAlign === 'left' || femcoSettings.contentAlign === 'center') ? femcoSettings.contentAlign : 'center';
  const contentOffsetX = Math.max(-40, Math.min(40, parseInt(femcoSettings.contentOffsetX || 0, 10) || 0));
  const headGap = Math.max(0, Math.min(30, parseInt(femcoSettings.headGap || 10, 10) || 10));

  const _padL = Math.max(0, Math.min(80, contentPadX + contentOffsetX));
  const _padR = Math.max(0, Math.min(80, contentPadX - contentOffsetX));
  const subtitleSize = Math.max(10, Math.min(24, parseInt(femcoSettings.subtitleSize || 12, 10) || 12));
  const subtitleWeight = [400,500,600,700,800,900].includes(parseInt(femcoSettings.subtitleWeight||800,10)) ? parseInt(femcoSettings.subtitleWeight||800,10) : 800;
  const subtitleColor = (typeof femcoSettings.subtitleColor === 'string') ? femcoSettings.subtitleColor : '';
  const nameFontSize = Math.max(10, Math.min(20, parseInt(femcoSettings.nameFontSize || 12, 10) || 12));
  const roleFontSize = Math.max(9, Math.min(16, parseInt(femcoSettings.roleFontSize || 10, 10) || 10));
  const tierBadgeSize = Math.max(9, Math.min(16, parseInt(femcoSettings.tierBadgeSize || 10, 10) || 10));
  const tierBadgePadX = Math.max(4, Math.min(12, parseInt(femcoSettings.tierBadgePadX || 6, 10) || 6));
  const starSize = Math.max(10, Math.min(28, parseInt(femcoSettings.starSize || 15, 10) || 15));
  const titleFontFamily = (() => {
    switch (femcoSettings.titleFont) {
      case 'noto': return `'Noto Sans KR', system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif`;
      case 'pretendard': return `'Pretendard', system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif`;
      default: return `system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif`;
    }
  })();

  const tierRank = (p) => {
    const t = p.tier || '';
    const i = (typeof TIERS !== 'undefined' && TIERS.includes(t)) ? TIERS.indexOf(t) : 999;
    return i >= 0 ? i : 999;
  };

  const rolePri = (p) => {
    const r = (p.role || '').trim();
    const order = ['이사장', '총장', '교수', '코치'];
    const i = order.indexOf(r);
    return i >= 0 ? i : 99;
  };

  const raceLabel = (p) => p.race === 'P' ? '프로토스' : p.race === 'T' ? '테란' : p.race === 'Z' ? '저그' : '종족미정';
  const raceColor = (p) => p.race === 'P' ? '#c084fc' : p.race === 'T' ? '#38bdf8' : p.race === 'Z' ? '#34d399' : '#94a3b8';

  function femcoAvatarSquare(p, accent) {
    const img = (p && p.photo) ? String(p.photo) : '';
    const letter = (p && p.name) ? String(p.name).slice(0, 1) : '?';
    const border = `${accent}55`;
    // 상태 아이콘(10시 방향) — 기존 상태 아이콘 시스템 재사용
    let badge = '';
    try{
      const _rawIcon = getStatusIcon(p.name);
      const statusHtml = getStatusIconHTML(p.name);
      const s = playerImgSize;
      const badgeSize = Math.max(10, Math.min(36, parseInt(femcoSettings.statusIconSize || 0, 10) || Math.round(s * 0.38)));
      const _isImgIcon = _rawIcon && (typeof _siIsImg === 'function' ? _siIsImg(_rawIcon) : false);
      const _badgeInner = _isImgIcon
        ? `<img src="${_rawIcon}" style="width:${badgeSize}px;height:${badgeSize}px;border-radius:50%;object-fit:cover;opacity:.86" onerror="this.style.display='none'">`
        : (statusHtml ? statusHtml.replace(/margin-left:[^;]+;/g,'').replace(/font-size:[^;]+;/g,'') : '');
      const _badgeBg = _isImgIcon ? 'rgba(255,255,255,.72)' : 'transparent';
      // 10시 방향(좌상단)
      const _bTop = -Math.round(badgeSize * 0.26);
      const _bLeft = -Math.round(badgeSize * 0.26);
      badge = statusHtml
        ? `<span style="position:absolute;top:${_bTop}px;left:${_bLeft}px;width:${badgeSize}px;height:${badgeSize}px;border-radius:50%;background:${_badgeBg};overflow:hidden;display:flex;align-items:center;justify-content:center;font-size:${Math.round(badgeSize*0.82)}px;line-height:1;filter:drop-shadow(0 1px 2px rgba(0,0,0,.65))">${_badgeInner}</span>`
        : '';
    }catch(e){}

    if (img) {
      return `<span style="position:relative;display:block;width:100%;height:100%">
        <img src="${img}" style="width:100%;height:100%;object-fit:cover;border-radius:inherit;border:2px solid ${border};background:rgba(255,255,255,.25)" onerror="this.closest('span').outerHTML='<div style=&quot;position:relative;width:100%;height:100%;border-radius:inherit;background:${accent};display:flex;align-items:center;justify-content:center;font-weight:1000;font-size:22px;color:#fff;border:2px solid ${border}&quot;>${letter}</div>'">
        ${badge}
      </span>`;
    }
    return `<div style="position:relative;width:100%;height:100%;border-radius:inherit;background:${accent};display:flex;align-items:center;justify-content:center;font-weight:1000;font-size:22px;color:#fff;border:2px solid ${border}">${letter}${badge}</div>`;
  }

  let h = `
    <style>
      .b2-femco-wrap{display:flex;flex-direction:column;gap:${univGap}px}
      .b2-femco-univ{border-radius:16px;overflow:hidden;box-shadow:0 2px 22px rgba(0,0,0,.12);transition:background-color .35s ease, box-shadow .35s ease, transform .2s ease}
      .b2-femco-univ:hover{transform:translateY(-1px);box-shadow:0 6px 26px rgba(0,0,0,.18)}
      .b2-femco-head{padding:16px 16px 12px;text-align:center;position:relative}
      .b2-femco-headrow{display:flex;align-items:center;justify-content:center;gap:12px;flex-wrap:wrap}
      .b2-femco-headcol{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:${headGap}px}
      .b2-femco-logo{display:flex;justify-content:center;margin-bottom:0}
      .b2-femco-title-row{display:flex;align-items:center;gap:6px;justify-content:center}
      .b2-femco-title{font-weight:1000;font-size:${titleSize}px;letter-spacing:-.04em;line-height:1.1;font-family:${titleFontFamily}}
      .b2-femco-stars{display:inline-flex;gap:1px;align-items:center;opacity:.95}
      .b2-femco-stars span{font-size:${starSize}px;line-height:1}
      .b2-femco-subtitle{margin-top:6px;font-size:${subtitleSize}px;font-weight:${subtitleWeight};line-height:1.2;opacity:.95}
      /* 인원수: 좌측 상단 고정 (배경 없음) */
      .b2-femco-countbox{
        position:absolute;top:10px;left:10px;
        display:flex;flex-direction:column;gap:2px;align-items:flex-start;justify-content:flex-start;
        padding:0;border-radius:0;background:transparent;border:none;color:inherit;
        max-width:45%;
      }
      .b2-femco-countbox div{font-size:${countFontSize}px;font-weight:1000;line-height:1.15;white-space:nowrap}
      .b2-femco-meta{margin-top:6px;display:flex;justify-content:center;gap:8px;flex-wrap:wrap}
      .b2-femco-pill{font-size:12px;font-weight:1000;padding:3px 10px;border-radius:999px;border:1px solid rgba(255,255,255,.55);background:rgba(255,255,255,.16)}
      .b2-femco-body{padding:12px 12px 16px}
      .b2-femco-group{margin-top:10px}
      .b2-femco-group:first-child{margin-top:0}
      .b2-femco-ghead{display:flex;align-items:center;gap:8px;margin:0 0 8px}
      .b2-femco-glabel{font-size:12px;font-weight:1000;background:rgba(255,255,255,.78);border:1px solid rgba(0,0,0,.10);padding:3px 10px;border-radius:999px}
      .b2-femco-gcount{font-size:11px;font-weight:900;opacity:.85}

      /* ✅ 배치 규칙(요구사항)
         - 1번(첫 컬럼) 위→아래로 5명 채움
         - 5명 되면 우측(다음 컬럼) 1번으로 다시 위→아래로 5명
      */
      .b2-femco-grid{
        display:grid;
        column-gap:${colGap}px;
        row-gap:${rowGap}px;
        grid-auto-flow:column;
        grid-template-rows:repeat(${rowsPerCol}, minmax(0, auto));
        grid-auto-columns:${colWidth}px;
        overflow-x:auto;
        padding-bottom:6px;
        scrollbar-width:none;
        justify-content:${contentAlign==='center'?'center':'start'};
      }
      .b2-femco-grid::-webkit-scrollbar{height:0}

      /* 스트리머 항목(카드형식X): 프로필(네모, 작게) + 우측 텍스트 4줄 */
      /* 카드 느낌 제거: 배경/테두리 최소화 */
      .b2-femco-item{display:flex;align-items:center;gap:10px;padding:6px 4px;border-radius:10px;cursor:pointer;min-width:0;transition:background .1s;justify-self:start;width:fit-content;max-width:100%}
      .b2-femco-item:hover{background:rgba(255,255,255,.12)}
      .b2-femco-avatar{width:${playerImgSize}px;height:${playerImgSize}px;border-radius:${playerRadius};overflow:hidden;flex-shrink:0;position:relative}
      .b2-femco-text{display:flex;flex-direction:column;gap:2px;min-width:0}
      .b2-femco-tier{font-size:10px;font-weight:1000;display:inline-flex;align-items:center;gap:4px}
      .b2-femco-tierbadge{font-size:${tierBadgeSize}px;padding:2px ${tierBadgePadX}px;border-radius:999px;border:1px solid rgba(0,0,0,.12);display:inline-flex;align-items:center;line-height:1}
      .b2-femco-role{font-size:${roleFontSize}px;font-weight:1000;opacity:.9}
      .b2-femco-name{font-size:${nameFontSize}px;font-weight:1000;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .b2-femco-race-pill{display:inline-flex;align-items:center;gap:4px;font-size:10px;font-weight:1000;padding:1px 6px;border-radius:999px;background:rgba(255,255,255,.85);border:1px solid rgba(0,0,0,.10)}

      /* 컬럼 수는 데이터에 따라 자동 증가(가로 스크롤). 작은 화면에서는 컬럼 폭을 줄여 가독성 유지 */
      @media(max-width:900px){  .b2-femco-grid{grid-auto-columns:${Math.max(150, colWidth-20)}px;} }
      @media(max-width:520px){
        .b2-femco-title{font-size:20px}
        .b2-femco-grid{grid-auto-columns:${Math.max(140, colWidth-30)}px;}
      }
    </style>
    <div class="b2-femco-wrap">
  `;


  univList.forEach(u => {
    const univName = u.name;
    const all = (membersByUniv[univName] || []);
    if (!all.length) return;

    const overrideCol = (femcoSettings.univColorOverrides || {})[univName];
    const col = overrideCol || gc(univName);
    const textCol = _b2ContrastColor(col);
    const uCfg = (typeof univCfg !== 'undefined' ? univCfg.find(x => x.name === univName) : null) || {};
    const iconUrl = uCfg.icon || uCfg.img || '';
    const logoHtml = iconUrl
      ? `<img src="${iconUrl}" style="width:${LOGO}px;height:${LOGO}px;object-fit:contain" onerror="this.style.display='none'">`
      : `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style="width:${Math.round(LOGO*0.62)}px;height:${Math.round(LOGO*0.62)}px;opacity:.75"><path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z"/></svg>`;

    // 인원 카운트 규칙:
    // - 이사장 인원
    // - 교수 + 코치 인원
    // - 나머지 학생(=전체 - 위 2개)
    const bossCnt = all.filter(p => (p.role || '').trim() === '이사장').length;
    const profCoachCnt = all.filter(p => ['교수','코치'].includes((p.role || '').trim())).length;
    const studentCnt = Math.max(0, all.length - bossCnt - profCoachCnt);

    // 요구사항: 같은 급끼리 섹션으로 나누지 않고, 단일 리스트에서
    // 이사장 → 총장 → 교수 → 코치 우선순위로 정렬 후 5열 배치
    const list = [...all].sort((a, b) => {
      const ra = rolePri(a), rb = rolePri(b);
      if (ra !== rb) return ra - rb;
      // 같은 직급 내에서는 티어→이름
      const ta = tierRank(a), tb = tierRank(b);
      if (ta !== tb) return ta - tb;
      return (a.name || '').localeCompare(b.name || '');
    });

    const _subTxt = ((femcoSettings.univSubtitles||{})[univName] || '').trim();
    const _subColor = (subtitleColor && subtitleColor.trim()) ? subtitleColor : textCol;

    const _pos = femcoSettings.logoPos || 'top';
    const _posNorm = (['left','right','top','bottom','center'].includes(_pos) ? _pos : 'top');
    const _attach = (femcoSettings.logoAttachTitle ?? 1) ? true : false;
    const starsHtml = (uCfg.championships || 0) > 0
      ? `<span class="b2-femco-stars">${'<span>⭐</span>'.repeat(uCfg.championships)}</span>`
      : '';
    const titleBlock = `
      <div style="min-width:220px">
        <div class="b2-femco-title-row">
          <div class="b2-femco-title">${univName}</div>
          ${starsHtml}
        </div>
        ${_subTxt?`<div class="b2-femco-subtitle" style="color:${_subColor}">${_subTxt}</div>`:''}
      </div>
    `;
    const logoOnlyStyle = (() => {
      if (_attach) return '';
      const pad = contentPadX;
      if (_posNorm === 'left') return `position:absolute;left:${pad}px;top:50%;transform:translateY(-50%);`;
      if (_posNorm === 'right') return `position:absolute;right:${pad}px;top:50%;transform:translateY(-50%);`;
      if (_posNorm === 'bottom') return `position:absolute;left:50%;bottom:10px;transform:translateX(-50%);`;
      // top / center
      return `position:absolute;left:50%;top:10px;transform:translateX(-50%);`;
    })();

    const headLayout = (() => {
      if (!_attach) {
        // 로고만 이동일 때 제목과 겹치지 않도록 좌/우는 공간을 예약
        const reserve = Math.max(0, Math.round(LOGO * 0.55) + 16);
        const padL = (_posNorm === 'left') ? reserve : 0;
        const padR = (_posNorm === 'right') ? reserve : 0;
        return `
          <div class="b2-femco-headrow" style="padding-left:${padL}px;padding-right:${padR}px">
            <div class="b2-femco-logo" style="${logoOnlyStyle}">${logoHtml}</div>
            ${titleBlock}
          </div>
        `;
      }
      // 로고 + 대학명이 같이 이동
      if (_posNorm === 'left') {
        return `<div class="b2-femco-headrow"><div class="b2-femco-logo">${logoHtml}</div>${titleBlock}</div>`;
      }
      if (_posNorm === 'right') {
        return `<div class="b2-femco-headrow">${titleBlock}<div class="b2-femco-logo">${logoHtml}</div></div>`;
      }
      if (_posNorm === 'bottom') {
        return `<div class="b2-femco-headcol">${titleBlock}<div class="b2-femco-logo">${logoHtml}</div></div>`;
      }
      // top / center
      return `<div class="b2-femco-headcol"><div class="b2-femco-logo">${logoHtml}</div>${titleBlock}</div>`;
    })();

    h += `
      <section class="b2-femco-univ" style="background:${col}">
        <div class="b2-femco-head" style="color:${textCol};padding-left:${_padL}px;padding-right:${_padR}px">
          <div class="b2-femco-countbox" style="color:${textCol};left:${_padL}px;${textCol==='#ffffff'?'text-shadow:0 1px 2px rgba(0,0,0,.45);':''}">
            <div>총 ${all.length}</div>
            <div>이사장 ${bossCnt}</div>
            <div>교수+코치 ${profCoachCnt}</div>
            <div>학생 ${studentCnt}</div>
          </div>
          ${headLayout}
        </div>

        <div class="b2-femco-body" style="background:${col}18;padding-left:${_padL}px;padding-right:${_padR}px">
          <div class="b2-femco-grid">
            ${list.map(p => {
              const safeName = (p.name || '').replace(/'/g, "\\'");
              const tier = p.tier || '?';
              const tierBg = tier && tier !== '?' ? (typeof getTierBtnColor === 'function' ? getTierBtnColor(tier) : '#64748b') : '#64748b';
              const tierFg = tier && tier !== '?' ? ((typeof getTierBtnTextColor === 'function' ? getTierBtnTextColor(tier) : '#fff') || '#fff') : '#fff';
              const roleLabel = (p.role || '').trim();
              const rcol = raceColor(p);
              return `
                <div class="b2-femco-item" onclick="openPlayerModal('${safeName}');event.stopPropagation();">
                  <div class="b2-femco-avatar">${femcoAvatarSquare(p, rcol)}</div>
                  <div class="b2-femco-text" style="${p.inactive ? 'opacity:.65' : ''};color:${textCol}">
                    <div class="b2-femco-tier">
                      <span class="b2-femco-tierbadge" style="background:${tierBg};color:${tierFg}">${tier}</span>
                    </div>
                    <div class="b2-femco-role">${roleLabel || ''}</div>
                    <div class="b2-femco-name">${p.name || ''}</div>
                    <div><span class="b2-femco-race-pill" style="color:${rcol};border-color:${rcol}55">${raceLabel(p)}</span></div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </section>
    `;
  });

  h += `</div>`;
  return h;
}

// ─────────────────────────────────────────────────────────────
// ➕ 스트리머 등록(관리자 전용, Players 탭)
// - 저장 시 즉시 반영(save()+render())
// - 저장 후 입력값 초기화 → 연속 등록 가능
// ─────────────────────────────────────────────────────────────
function openB2PlayerCreateModal() {
  if (!isLoggedIn || (typeof isSubAdmin !== 'undefined' && isSubAdmin)) return;
  if (document.getElementById('b2-player-create-modal')) return;

  const univs = (typeof univCfg !== 'undefined' ? univCfg : []).map(u => u.name).filter(Boolean);
  const tierOpts = (typeof TIERS !== 'undefined' && Array.isArray(TIERS) ? TIERS : ['0','1','2','3','4','5','6','7','8','유스']);
  const roleOpts = ['학생','코치','교수','총장','이사장'];

  const modal = document.createElement('div');
  modal.id = 'b2-player-create-modal';
  modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:10000';
  modal.innerHTML = `
    <div style="background:var(--white);border-radius:16px;padding:24px;max-width:560px;width:92%;max-height:84vh;overflow-y:auto;box-shadow:0 10px 40px rgba(0,0,0,0.3)">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:18px">
        <h3 style="margin:0;font-size:18px;font-weight:900;color:var(--text1)">🎬 스트리머 등록</h3>
        <button onclick="document.getElementById('b2-player-create-modal').remove()" style="background:none;border:none;font-size:20px;cursor:pointer;color:var(--gray-l)">✕</button>
      </div>

      <div id="b2-newplayer-msg" style="font-size:12px;color:var(--gray-l);margin-bottom:12px">저장 후 자동으로 입력칸이 초기화되어 연속 등록할 수 있습니다.</div>

      <div style="display:grid;grid-template-columns:140px 1fr;gap:10px;align-items:center;margin-bottom:12px">
        <div style="font-size:13px;font-weight:800;color:var(--text2)">이름</div>
        <input id="b2-newplayer-name" type="text" placeholder="예: 홍길동" style="padding:8px 12px;border:1px solid var(--border2);border-radius:10px;font-size:13px">
      </div>

      <div style="display:grid;grid-template-columns:140px 1fr;gap:10px;align-items:center;margin-bottom:12px">
        <div style="font-size:13px;font-weight:800;color:var(--text2)">대학</div>
        <select id="b2-newplayer-univ" style="padding:8px 12px;border:1px solid var(--border2);border-radius:10px;font-size:13px">
          <option value="">(선택)</option>
          ${univs.map(u=>`<option value="${u}">${u}</option>`).join('')}
        </select>
      </div>

      <div style="display:grid;grid-template-columns:140px 1fr;gap:10px;align-items:center;margin-bottom:12px">
        <div style="font-size:13px;font-weight:800;color:var(--text2)">직급</div>
        <select id="b2-newplayer-role" style="padding:8px 12px;border:1px solid var(--border2);border-radius:10px;font-size:13px">
          ${roleOpts.map(r=>`<option value="${r}"${r==='학생'?' selected':''}>${r}</option>`).join('')}
        </select>
      </div>

      <div style="display:grid;grid-template-columns:140px 1fr;gap:10px;align-items:center;margin-bottom:12px">
        <div style="font-size:13px;font-weight:800;color:var(--text2)">종족</div>
        <select id="b2-newplayer-race" style="padding:8px 12px;border:1px solid var(--border2);border-radius:10px;font-size:13px">
          <option value="P">프로토스</option>
          <option value="T">테란</option>
          <option value="Z">저그</option>
          <option value="N" selected>미정</option>
        </select>
      </div>

      <div style="display:grid;grid-template-columns:140px 1fr;gap:10px;align-items:center;margin-bottom:12px">
        <div style="font-size:13px;font-weight:800;color:var(--text2)">티어</div>
        <select id="b2-newplayer-tier" style="padding:8px 12px;border:1px solid var(--border2);border-radius:10px;font-size:13px">
          <option value="?" selected>미정</option>
          ${tierOpts.map(t=>`<option value="${t}">${t}</option>`).join('')}
        </select>
      </div>

      <div style="display:grid;grid-template-columns:140px 1fr;gap:10px;align-items:center;margin-bottom:12px">
        <div style="font-size:13px;font-weight:800;color:var(--text2)">채널 URL</div>
        <input id="b2-newplayer-channel" type="text" placeholder="https://..." style="padding:8px 12px;border:1px solid var(--border2);border-radius:10px;font-size:13px">
      </div>

      <div style="display:grid;grid-template-columns:140px 1fr;gap:10px;align-items:center;margin-bottom:12px">
        <div style="font-size:13px;font-weight:800;color:var(--text2)">프로필 이미지 1</div>
        <input id="b2-newplayer-photo" type="text" placeholder="https://... (base64 불가)" style="padding:8px 12px;border:1px solid var(--border2);border-radius:10px;font-size:13px">
      </div>

      <div style="display:grid;grid-template-columns:140px 1fr;gap:10px;align-items:center;margin-bottom:4px">
        <div style="font-size:13px;font-weight:800;color:var(--text2)">프로필 이미지 2</div>
        <input id="b2-newplayer-photo2" type="text" placeholder="https://... (선택)" style="padding:8px 12px;border:1px solid var(--border2);border-radius:10px;font-size:13px">
      </div>
      <div style="font-size:11px;color:var(--gray-l);margin:0 0 14px 150px">※ 2번 이미지는 이미지별(Players) 메인에서 1초 후 자동 교체용</div>

      <div style="display:flex;gap:10px;margin-top:18px">
        <button onclick="document.getElementById('b2-player-create-modal').remove()" style="flex:1;padding:10px 16px;background:var(--surface);border:1px solid var(--border2);border-radius:10px;color:var(--text2);font-size:13px;font-weight:700;cursor:pointer">닫기</button>
        <button onclick="saveB2NewPlayer()" style="flex:1;padding:10px 16px;background:var(--blue);border:1px solid var(--blue);border-radius:10px;color:#fff;font-size:13px;font-weight:800;cursor:pointer">저장</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

function saveB2NewPlayer() {
  const msg = document.getElementById('b2-newplayer-msg');
  const name = (document.getElementById('b2-newplayer-name')?.value || '').trim();
  const univ = (document.getElementById('b2-newplayer-univ')?.value || '').trim();
  const role = (document.getElementById('b2-newplayer-role')?.value || '').trim();
  const race = (document.getElementById('b2-newplayer-race')?.value || 'N').trim();
  const tier = (document.getElementById('b2-newplayer-tier')?.value || '?').trim();
  const channelUrl = (document.getElementById('b2-newplayer-channel')?.value || '').trim();
  const photo = (document.getElementById('b2-newplayer-photo')?.value || '').trim();
  const photo2 = (document.getElementById('b2-newplayer-photo2')?.value || '').trim();

  if (!name) { alert('이름은 필수입니다.'); return; }
  if (players.find(p => p.name === name)) { alert('이미 존재하는 이름입니다: ' + name); return; }
  if (photo && photo.startsWith('data:')) { alert('❌ base64 이미지(data:...)는 저장/동기화가 실패할 수 있어 금지입니다. URL을 사용하세요.'); return; }

  const p = {
    name,
    univ: univ || '무소속',
    role: role || '학생',
    race,
    tier,
    gameType: 'general',
    channelUrl: channelUrl || undefined,
    photo: photo || undefined,
    secondProfileFile: photo2 || undefined,
  };
  players.push(p);
  save();
  render();

  // 입력 초기화(연속 등록)
  ['b2-newplayer-name','b2-newplayer-channel','b2-newplayer-photo','b2-newplayer-photo2'].forEach(id=>{
    const el = document.getElementById(id); if(el) el.value = '';
  });
  const tierSel = document.getElementById('b2-newplayer-tier'); if(tierSel) tierSel.value = '?';
  const raceSel = document.getElementById('b2-newplayer-race'); if(raceSel) raceSel.value = 'N';
  const roleSel = document.getElementById('b2-newplayer-role'); if(roleSel) roleSel.value = '학생';

  if (msg) { msg.style.color = '#16a34a'; msg.textContent = `✅ 저장됨: ${name} (다음 스트리머를 계속 등록할 수 있습니다)`; }
}

// ─────────────────────────────────────────────────────────────
// 🧩 펨코현황 이미지 저장
// - 저장: 현재 렌더된 펨코현황(전체 1장) 캡처
// - 전체 저장: 동일하지만 파일명을 "전체"로 명확히
// ─────────────────────────────────────────────────────────────
async function saveB2FemcoAllImg(){
  return _saveB2FemcoInternal();
}

async function _saveB2FemcoInternal(){
  const btnSel = '[onclick="saveB2FemcoAllImg()"]';
  const btn = document.querySelector(btnSel);
  if (btn) { btn.disabled = true; btn.textContent = '⏳...'; }

  const tmpDiv = document.createElement('div');
  // 현재 펨코현황과 동일한 스타일로 전체를 1장으로 캡처
  tmpDiv.style.cssText = `position:fixed;left:-9999px;top:0;padding:24px;background:#0b1220;box-sizing:border-box;`;
  tmpDiv.innerHTML = _b2FemcoView(); // 현재 설정(localStorage) 반영됨
  document.body.appendChild(tmpDiv);
  // 설정/버튼류는 저장 이미지에서 제거
  tmpDiv.querySelectorAll('.b2-femco-subnav,.b2-femco-panel,.no-export,.no-export-movebtns').forEach(el => el.remove());

  await new Promise(r => setTimeout(r, 120));
  try{ if (typeof injectUnivIcons === 'function') injectUnivIcons(tmpDiv); }catch(e){}

  const h = tmpDiv.scrollHeight + 32;
  const w = tmpDiv.scrollWidth;
  const fname = '펨코현황판_전체_' + new Date().toISOString().slice(0,10) + '.png';

  try{
    if (typeof _captureAndSave !== 'function') throw new Error('이미지 저장 기능을 불러오지 못했습니다.');
    await _captureAndSave(tmpDiv, w, h, fname);
  }catch(e){
    console.error('[펨코현황 이미지 저장 실패]', e);
    alert('❌ 이미지 저장 실패\n\n' + (e.message || '알 수 없는 오류가 발생했습니다.'));
  }finally{
    document.body.removeChild(tmpDiv);
    if (btn) { btn.disabled = false; btn.textContent = '💾 전체 저장'; }
  }
}

function _b2UnivBlock(univName, col, members, forExport=false) {
  // Safety check for undefined university name
  if (!univName) {
    return `<div style="border-radius:14px;border:2px dashed #ccc55;padding:16px 18px;background:#f5f5f5;display:flex;align-items:center;gap:10px;opacity:.7">
      <span style="font-weight:900;font-size:15px;color:#999;">[Unknown University]</span>
      <span style="font-size:11px;color:var(--gray-l)"> university name is undefined</span>
    </div>`;
  }
  
  const uCfg = univCfg.find(x => x.name === univName) || {};
  const iconUrl = uCfg.icon || uCfg.img || UNIV_ICONS[univName] || '';
  const textCol = _b2ContrastColor(col);
  const lightCol = col + _b2AlphaHex(b2BgAlpha);
  const labelCol = col + _b2AlphaHex(b2LabelAlpha);

  // 멤버 없을 때 빈 블록
  if (!members.length) {
    return `<div style="border-radius:14px;border:2px dashed ${col}55;padding:16px 18px;background:${lightCol};display:flex;align-items:center;gap:10px;opacity:.7">
      ${iconUrl?`<img src="${iconUrl}" style="width:var(--su_univ_logo_size,36px);height:var(--su_univ_logo_size,36px);object-fit:contain;border-radius:var(--su_univ_logo_radius,10px)" onerror="this.style.display='none'">`:''}
      <span style="font-weight:900;font-size:15px;color:${col};cursor:pointer" onclick="if(typeof openUnivModal==='function')openUnivModal('${univName}')">${univName}</span>
      <span style="font-size:11px;color:var(--gray-l)">등록된 선수 없음</span>
    </div>`;
  }

  // 직책 그룹
  const roledMembers = members.filter(p => _B2_ROLE_ORDER.includes(p.role||''));
  roledMembers.sort((a,b) => _b2RoleRank(a) - _b2RoleRank(b));

  // 티어 그룹
  const tieredMembers = members.filter(p => !_B2_ROLE_ORDER.includes(p.role||''));
  const tierGroups = {};
  tieredMembers.forEach(p => {
    const t = p.tier || '?';
    if (!tierGroups[t]) tierGroups[t] = [];
    tierGroups[t].push(p);
  });
  const orderedTierKeys = TIERS.filter(t => tierGroups[t]).concat(
    Object.keys(tierGroups).filter(t => !TIERS.includes(t))
  );

  // 사이드 패널 (현황판 memoImgs/memo) — _tableRow 정의 전에 계산해야 padding-right에 사용 가능
  const _smemo = uCfg.memo || '';
  const _simgs = (uCfg.memoImgs||[]).concat(uCfg.memoImg?[uCfg.memoImg]:[]);
  const hasSide = !!((_smemo||_simgs.length));

  // 새 레이아웃: 왼쪽 라벨 열(대학색) + 오른쪽 스트리머 열(연한 배경)
  // hasSide 시 padding-right:190px → border-bottom 선이 사이드 패널 영역까지 이어짐
  const _tableRow = (label, isRole, chips) => `
    <div style="display:flex;align-items:stretch;border-bottom:1px solid ${col}44${hasSide?';padding-right:190px':''}">
      <div style="background:${labelCol}!important;min-width:62px;width:62px;display:flex;align-items:center;justify-content:center;padding:7px 4px;flex-shrink:0">
        <span style="font-size:11px;font-weight:800;color:${col};text-align:center;line-height:1.3;word-break:keep-all">${label}</span>
      </div>
      <div style="flex:1;background:${lightCol};padding:7px 10px;display:flex;flex-wrap:wrap;gap:6px;align-items:center">
        ${chips}
      </div>
    </div>`;

  // 같은 직책끼리 묶어서 1행
  const roleGroups = {};
  const roleOrder = [];
  roledMembers.forEach(p => {
    const r = p.role || '';
    if (!roleGroups[r]) { roleGroups[r] = []; roleOrder.push(r); }
    roleGroups[r].push(p);
  });
  const _bgPos = uCfg.bgImgPos || 'center center';
  const _bgSize = uCfg.bgImgSize || 'cover';
  const _bgOpacity = ((uCfg.bgImgAlpha ?? b2BgImgAlpha) / 100).toFixed(2);
  const bgImgHtml = uCfg.bgImg
    ? forExport
      ? `<img src="${uCfg.bgImg}" crossorigin="anonymous" style="position:absolute;inset:0;width:100%;height:100%;object-fit:${_bgSize};opacity:${_bgOpacity};pointer-events:none;z-index:0">`
      : `<div style="position:absolute;inset:0;background:url('${uCfg.bgImg}') ${_bgPos}/${_bgSize} no-repeat;opacity:${_bgOpacity};pointer-events:none;z-index:0"></div>`
    : '';

  let rows = '';
  roleOrder.forEach(role => {
    const group = roleGroups[role];
    rows += _tableRow(role, true, group.map(p => _b2NameTag(p, col, true)).join(''));
  });
  orderedTierKeys.forEach(tier => {
    const group = tierGroups[tier];
    group.sort((a,b) => (a.name||'').localeCompare(b.name||''));
    rows += _tableRow(tier, false, group.map(p => _b2NameTag(p, col, false)).join(''));
  });
  const sidePanelHtml = hasSide ? `<div style="position:absolute;top:0;right:0;width:190px;bottom:0;background:${lightCol};padding:8px;box-sizing:border-box;overflow:hidden">
    ${_simgs.map((src,i)=>`<img src="${src}" style="width:100%;border-radius:7px;${(i<_simgs.length-1||_smemo)?'margin-bottom:5px;':''}display:block;object-fit:contain" onerror="this.style.display='none'">`).join('')}
    ${_smemo?`<div style="font-size:11px;color:#333;white-space:pre-wrap;line-height:1.5;margin-top:${_simgs.length?'5px':'0'}">${_smemo}</div>`:''}
  </div>` : '';
  const bodyContent = `<div style="position:relative;overflow:hidden">
    ${bgImgHtml}
    <div style="position:relative;z-index:1">
      <div>${rows}</div>
      ${sidePanelHtml}
    </div>
  </div>`;

  // 하단 메모/이미지 (bMemo/bMemoImgs)
  const _bnote = uCfg.bMemo || '';
  const _bimgs = (uCfg.bMemoImgs||[]).concat(uCfg.bMemoImg?[uCfg.bMemoImg]:[]);
  const _bimgHtmls = _bimgs.map(src=>`<img class="b2-bottom-img" src="${src}" style="border-radius:8px;display:inline-block" onerror="this.style.display='none'">`).join('');
  const bottomSection = (_bnote||_bimgs.length) ? `<div style="padding:6px 14px 10px;background:${col}15;border-top:1px solid ${col}22">
    ${_bimgHtmls?`<div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:${_bnote?'6px':'0'}">${_bimgHtmls}</div>`:''}
    ${_bnote?`<div style="font-size:12px;color:#333;white-space:pre-wrap;line-height:1.6">${_bnote}</div>`:''}
  </div>` : '';

  return `
    <div data-b2card="${univName.replace(/"/g,'&quot;')}" style="border-radius:14px;overflow:hidden;box-shadow:0 2px 16px ${col}30">
      <div style="background:${col};padding:10px 16px">
        <div style="display:flex;align-items:center;gap:6px;flex-wrap:nowrap;overflow:hidden">
          ${iconUrl?`<img src="${iconUrl}" style="width:var(--su_univ_logo_size,36px);height:var(--su_univ_logo_size,36px);object-fit:contain;border-radius:var(--su_univ_logo_radius,10px);flex-shrink:0;cursor:pointer" onclick="if(typeof openUnivModal==='function')openUnivModal('${univName}')" onerror="this.style.display='none'">`:''}
          <span style="font-weight:900;font-size:15px;color:${textCol};flex-shrink:0;cursor:pointer" onclick="if(typeof openUnivModal==='function')openUnivModal('${univName}')">${univName}</span>
          ${(uCfg.championships||0)>0?`<span style="display:flex;gap:1px;flex-shrink:0">${'<span style="font-size:15px">⭐</span>'.repeat(uCfg.championships)}</span>`:''}
          ${uCfg.memo2?`<span style="font-size:11px;color:${textCol}bb;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:0 1 auto;max-width:45%;margin-left:2px">${uCfg.memo2}</span>`:''}
          <span style="flex:1"></span>
          <span style="flex-shrink:0;background:${textCol}22;color:${textCol};font-size:11px;font-weight:700;padding:2px 8px;border-radius:10px;border:1px solid ${textCol}33;cursor:pointer" onclick="event.stopPropagation();openB2MemberBreakdown(this,'${univName}')">${members.length}명</span>
          ${isLoggedIn?`<button class="no-export" onclick="event.stopPropagation();_b2ToggleCard(this,'${univName.replace(/'/g,"\\'")}')" style="background:${textCol}22;border:1px solid ${textCol}33;color:${textCol};font-size:11px;cursor:pointer;padding:1px 7px;border-radius:8px;flex-shrink:0;font-weight:700;margin-left:3px;z-index:1000;position:relative" title="${_b2Collapsed.has(univName)?'펼치기':'접기'}">${_b2Collapsed.has(univName)?'▶':'▼'}</button>`:''}
        </div>
      </div>
      <div class="b2-card-body" style="${_b2Collapsed.has(univName)?'display:none':''}">
        ${bodyContent}
        ${bottomSection}
      </div>
    </div>`;
}

/* ── 무소속 뷰 ── */
function _b2FreeView() {
  const freeMembers = players.filter(p => (!p.univ || p.univ === '무소속') && !p.hidden && !p.retired && !p.hideFromBoard);
  if (!freeMembers.length) return `<div style="text-align:center;color:var(--text3);padding:40px">무소속 멤버가 없습니다</div>`;

  const roledFree = freeMembers.filter(p => _B2_ROLE_ORDER.includes(p.role||''));
  roledFree.sort((a,b) => _b2RoleRank(a) - _b2RoleRank(b));
  const tieredFree = freeMembers.filter(p => !_B2_ROLE_ORDER.includes(p.role||''));

  const tierGroups = {};
  tieredFree.forEach(p => {
    const t = p.tier || '?';
    if (!tierGroups[t]) tierGroups[t] = [];
    tierGroups[t].push(p);
  });
  const orderedTierKeys = TIERS.filter(t => tierGroups[t]).concat(
    Object.keys(tierGroups).filter(t => !TIERS.includes(t))
  );

  const defCol = '#64748b';
  let h = `<div style="border-radius:14px;overflow:hidden;box-shadow:0 2px 14px #0002">
    <div style="background:${defCol};padding:10px 16px;display:flex;align-items:center;gap:8px">
      <span style="font-weight:900;font-size:15px;color:#fff">🚶 무소속</span>
      <span style="margin-left:auto;background:#fff2;color:#fff;font-size:11px;font-weight:700;padding:2px 8px;border-radius:10px;border:1px solid #fff4">${freeMembers.length}명</span>
    </div>
    <div style="background:#64748b${_b2AlphaHex(b2BgAlpha)};padding:6px 14px 12px">`;

  const _frow = (labelEl, contentEl) => `<div style="padding:5px 0;border-bottom:1px solid ${defCol}18"><div style="display:flex;align-items:stretch">${labelEl}<div style="flex:1;padding:2px 4px">${contentEl}</div></div></div>`;
  const _fl = (text, isRole) => `<span style="font-size:12px;font-weight:800;color:${isRole?defCol:'var(--text3)'};width:56px;min-width:56px;text-align:center;flex-shrink:0;display:inline-flex;align-items:center;justify-content:center;background:#64748b${_b2AlphaHex(b2LabelAlpha)}!important;border-right:1px solid ${defCol}33;margin-right:10px">${text}</span>`;

  // 직책 그룹
  roledFree.forEach(p => {
    h += _frow(_fl(p.role||'', true), _b2PlayerRow(p, defCol));
  });
  orderedTierKeys.forEach(tier => {
    const group = tierGroups[tier];
    group.sort((a,b) => (a.name||'').localeCompare(b.name||''));
    const col = getTierBtnColor(tier);
    h += _frow(_fl(tier, false), `<div style="display:flex;flex-wrap:wrap;gap:5px;padding:2px 0">${group.map(p => _b2NameTag(p, col, false)).join('')}</div>`);
  });
  h += `</div></div>`;
  return h;
}


/* ── 버튼 없는 이름 태그 (티어 멤버용) ── */
function _b2NameTag(p, accentCol, showTier) {
  const crewCol = p.crewName ? _gcCrew(p.crewName) : '';
  const safeName = (p.name||'').replace(/'/g,"\\'");
  return `
    <div style="display:flex;align-items:center;gap:6px;padding:3px 8px 3px 3px;border-radius:20px;cursor:pointer;transition:background .12s"
      onmouseover="this.style.background='${accentCol}14'"
      onmouseout="this.style.background='transparent'">
      <div onclick="openPlayerModal('${safeName}')" style="display:flex;align-items:center;gap:6px;flex:1">
      ${_b2Avatar(p, crewCol||accentCol, 58)}
      <span style="font-weight:700;font-size:18px;color:var(--text1);white-space:nowrap;${p.inactive?'opacity:.6':''}">${p.name||''}</span>
      ${p.race&&p.race!=='N'?`<span class="rbadge r${p.race}" style="font-size:10px;flex-shrink:0">${p.race}</span>`:''}
      ${showTier&&p.tier?`<span style="font-size:10px;font-weight:700;padding:1px 5px;border-radius:4px;background:${getTierBtnColor(p.tier)};color:${getTierBtnTextColor(p.tier)||'#fff'};flex-shrink:0">${p.tier}</span>`:''}
      ${p.inactive?'<span style="font-size:9px;background:#fff7ed;color:#9a3412;border-radius:4px;padding:1px 4px;font-weight:700;flex-shrink:0">⏸️</span>':''}
      </div>
    </div>`;
}

/* ── 직책 1행 표시 ── */
function _b2PlayerRowCompact(p, accentCol) {
  const tierCol = getTierBtnColor(p.tier||'');
  const tierTextCol = getTierBtnTextColor(p.tier||'') || '#fff';
  const safeName = (p.name||'').replace(/'/g,"\\'");
  return `
    <div style="display:flex;align-items:center;gap:8px;cursor:pointer;flex:1"
      onmouseover="this.querySelector('.b2name').style.color='${accentCol}'"
      onmouseout="this.querySelector('.b2name').style.color='var(--text1)'">
      <div onclick="openPlayerModal('${safeName}')" style="display:flex;align-items:center;gap:8px;flex:1">
      ${_b2Avatar(p, accentCol, 58)}
      <span class="b2name" style="font-weight:700;font-size:18px;color:var(--text1);transition:color .1s;${p.inactive?'opacity:.6':''}">${p.name||''}</span>
      ${p.inactive?'<span style="font-size:9px;background:#fff7ed;color:#9a3412;border-radius:4px;padding:1px 4px;font-weight:700;flex-shrink:0">⏸️</span>':''}
      ${p.race&&p.race!=='N'?`<span class="rbadge r${p.race}" style="font-size:11px;flex-shrink:0">${p.race}</span>`:''}
      <span style="font-size:11px;font-weight:700;padding:2px 8px;border-radius:6px;background:${tierCol};color:${tierTextCol}">${p.tier||'?'}</span>
      </div>
    </div>`;
}

/* ── 칩 ── */
function _b2Chip(p, accentCol) {
  const crewCol = p.crewName ? _gcCrew(p.crewName) : '';
  const borderStyle = `border:1.5px solid ${accentCol}44`;
  return `
    <div onclick="openPlayerModal('${(p.name||'').replace(/'/g,"\\'")}')"
      style="display:flex;align-items:center;gap:7px;padding:5px 13px 5px 5px;border-radius:24px;background:var(--white);${borderStyle};cursor:pointer;box-shadow:0 1px 3px #0001;transition:transform .1s,box-shadow .1s"
      onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 4px 10px ${accentCol}33'"
      onmouseout="this.style.transform='';this.style.boxShadow='0 1px 3px #0001'">
      ${_b2Avatar(p, crewCol||accentCol, 36)}
      <span style="font-weight:700;font-size:13px;color:var(--text1);white-space:nowrap">${p.name||''}</span>
    </div>`;
}

/* ── 아바타 ── */
function _b2Avatar(p, col, size) {
  const raceShort = {'T':'T','Z':'Z','P':'P','N':'?'}[p.race||'N'] || '?';
  // 설정(현황판 칩 프로필 이미지 크기) 값을 board2에도 반영
  const base = size || 28;
  let mult = 1;
  try{
    const chipPx = parseInt(localStorage.getItem('su_bcp_size') || '26', 10);
    mult = Math.max(0.6, Math.min(2.4, chipPx / 26));
  }catch(e){}
  const s = Math.round(base * mult);
  const badgeSize = Math.round(s * 0.38);
  const _rawIcon = getStatusIcon(p.name);
  const statusHtml = getStatusIconHTML(p.name);
  // 1시 방향(30°), 배지 중심을 원 테두리 위에 걸치게
  const r = s / 2, br = badgeSize / 2;
  const _bTop   = Math.round(r * 0.134 - br); // ≈ -7px (s=58 기준)
  const _bRight = Math.round(r * 0.5   - br); // ≈  4px
  const _isImgIcon = _rawIcon && _siIsImg(_rawIcon);
  const _badgeInner = _isImgIcon
    ? `<img src="${_rawIcon}" style="width:${badgeSize}px;height:${badgeSize}px;border-radius:50%;object-fit:cover;opacity:.82" onerror="this.style.display='none';console.warn('[현황판] 상태 아이콘 로드 실패:', this.src)">`
    : statusHtml.replace(/margin-left:[^;]+;/g,'').replace(/font-size:[^;]+;/g,'');
  const _badgeBg = _isImgIcon ? 'rgba(255,255,255,.72)' : 'transparent';
  const badge = statusHtml
    ? `<span style="position:absolute;top:${_bTop}px;right:${_bRight}px;width:${badgeSize}px;height:${badgeSize}px;border-radius:50%;background:${_badgeBg};overflow:hidden;display:flex;align-items:center;justify-content:center;font-size:${Math.round(badgeSize*0.82)}px;line-height:1;filter:drop-shadow(0 1px 2px rgba(0,0,0,.65))">${_badgeInner}</span>`
    : '';
  if (p.photo) {
    return `<span style="width:${s}px;height:${s}px;flex-shrink:0;display:inline-flex;position:relative">
      <img src="${p.photo}" style="width:${s}px;height:${s}px;border-radius:var(--su_profile_radius,50%);object-fit:cover;flex-shrink:0;border:2px solid ${col}88" onerror="console.warn('[현황판] 선수 프로필 이미지 로드 실패:', this.src, '선수:', '${p.name||''}');this.parentNode.innerHTML=_b2AvatarFallback('${raceShort}','${col}',${s})">
      ${badge}
    </span>`;
  }
  return `<span style="width:${s}px;height:${s}px;border-radius:var(--su_profile_radius,50%);background:${col};display:inline-flex;align-items:center;justify-content:center;font-weight:900;font-size:${Math.round(s*0.45)}px;color:#fff;flex-shrink:0;border:2px solid ${col}88;position:relative">${raceShort}${badge}</span>`;
}

function _b2AvatarFallback(letter, col, size) {
  const s = size || 28;
  return `<span style="width:${s}px;height:${s}px;border-radius:var(--su_profile_radius,50%);background:${col};display:inline-flex;align-items:center;justify-content:center;font-weight:900;font-size:${Math.round(s*0.45)}px;color:#fff;flex-shrink:0;border:2px solid ${col}88">${letter}</span>`;
}


function openB2MemberBreakdown(el, univName) {
  const existing = document.getElementById('b2-mbp');
  if (existing) { const wasEl = existing._forEl; existing.remove(); if (wasEl === el) return; }
  const col = gc(univName);
  const members = players.filter(p => p.univ === univName && !p.hidden && !p.retired && !p.hideFromBoard);
  const roled = members.filter(p => _B2_ROLE_ORDER.includes(p.role||''));
  const tiered = members.filter(p => !_B2_ROLE_ORDER.includes(p.role||''));
  const tierCounts = {};
  tiered.forEach(p => { const t = p.tier||'?'; tierCounts[t] = (tierCounts[t]||0)+1; });
  const orderedTiers = TIERS.filter(t => tierCounts[t]).concat(Object.keys(tierCounts).filter(t => !TIERS.includes(t)));
  const row = (label, val, c) => `<div style="display:flex;justify-content:space-between;align-items:center;gap:16px;padding:2px 0">
    <span style="color:${c||'var(--text2)'};font-size:12px">${label}</span>
    <span style="font-weight:700;color:var(--text1);font-size:12px">${val}명</span></div>`;
  const popup = document.createElement('div');
  popup.id = 'b2-mbp';
  popup.style.cssText = 'position:fixed;z-index:9999;background:var(--white);border:1px solid var(--border2);border-radius:12px;box-shadow:0 4px 20px #0003;padding:12px 14px;min-width:170px';
  popup.innerHTML = `
    <div style="font-weight:800;font-size:13px;color:${col};margin-bottom:8px">${univName} 구성</div>
    ${row('직책자', roled.length)}
    ${row('일반 스트리머', tiered.length)}
    ${orderedTiers.length ? `<div style="border-top:1px solid var(--border2);margin:6px 0"></div>${orderedTiers.map(t=>row(t, tierCounts[t], getTierBtnColor(t))).join('')}` : ''}`;
  popup._forEl = el;
  document.body.appendChild(popup);
  const rect = el.getBoundingClientRect();
  popup.style.top = (rect.bottom + 6) + 'px';
  popup.style.left = rect.left + 'px';
  requestAnimationFrame(() => {
    if (rect.left + popup.offsetWidth > window.innerWidth - 8) popup.style.left = (rect.right - popup.offsetWidth) + 'px';
    if (rect.bottom + popup.offsetHeight + 6 > window.innerHeight) popup.style.top = (rect.top - popup.offsetHeight - 6) + 'px';
  });
  setTimeout(() => {
    function _c(e) { if (!popup.contains(e.target) && e.target !== el) { _close(); } }
    function _s() { _close(); }
    function _close() { popup.remove(); document.removeEventListener('click', _c); window.removeEventListener('scroll', _s, true); }
    document.addEventListener('click', _c);
    window.addEventListener('scroll', _s, {capture:true, once:true});
  }, 0);
}

async function saveB2Img() {
  const univList = _b2VisUnivs().filter(u => u.name !== '무소속');
  const targets = _b2SaveUniv === '전체' ? univList : univList.filter(u => u.name === _b2SaveUniv);
  if (!targets.length) { alert('저장할 대학이 없습니다.'); return; }

  const btn = document.querySelector('[onclick="saveB2Img()"]');
  if (btn) { btn.disabled = true; btn.textContent = '⏳...'; }

  const CARD_W = 720;
  const gap = 14;
  const PAD = 24;

  const tmpDiv = document.createElement('div');
  tmpDiv.style.cssText = `position:fixed;left:-9999px;top:0;padding:${PAD}px;background:#f0f2f5;box-sizing:border-box;width:${CARD_W + PAD * 2}px`;
  tmpDiv.innerHTML = `<style>.b2-bottom-img{max-width:160px;max-height:130px;object-fit:contain;}</style>
    <div style="display:flex;flex-direction:column;gap:${gap}px">
      ${targets.map(u => _b2UnivBlock(u.name, gc(u.name), players.filter(p => p.univ === u.name && !p.hidden && !p.retired && !p.hideFromBoard), true)).join('')}
    </div>`;
  document.body.appendChild(tmpDiv);
  // no-export 요소 제거 (접기 버튼 등)
  tmpDiv.querySelectorAll('.no-export,.no-export-movebtns').forEach(el => el.remove());

  await new Promise(r => setTimeout(r, 100));
  injectUnivIcons(tmpDiv);

  const h = tmpDiv.scrollHeight + 32;
  const w = tmpDiv.scrollWidth;
  const fname = (_b2SaveUniv === '전체' ? '대학별현황판_전체' : `대학별현황판_${_b2SaveUniv}`) + '_' + new Date().toISOString().slice(0,10) + '.png';

  try {
    if (typeof _captureAndSave !== 'function') throw new Error('이미지 저장 기능을 불러오지 못했습니다.');
    await _captureAndSave(tmpDiv, w, h, fname);
  } catch(e) {
    console.error('[현황판 이미지 저장 실패]', e);
    alert('❌ 이미지 저장 실패\n\n' + (e.message || '알 수 없는 오류가 발생했습니다.'));
  }
  finally {
    document.body.removeChild(tmpDiv);
    if (btn) { btn.disabled = false; btn.textContent = '📷 이미지저장'; }
  }
}

async function saveB2FreeImg() {
  const btn = document.querySelector('[onclick="saveB2FreeImg()"]');
  if (btn) { btn.disabled = true; btn.textContent = '⏳...'; }

  const CARD_W = 720;
  const PAD = 24;

  const tmpDiv = document.createElement('div');
  tmpDiv.style.cssText = `position:fixed;left:-9999px;top:0;padding:${PAD}px;background:#f0f2f5;box-sizing:border-box;width:${CARD_W + PAD * 2}px`;
  tmpDiv.innerHTML = `<style>.b2-bottom-img{max-width:160px;max-height:130px;object-fit:contain;}</style>${_b2FreeView()}`;
  document.body.appendChild(tmpDiv);
  // no-export 요소 제거 (접기 버튼 등)
  tmpDiv.querySelectorAll('.no-export,.no-export-movebtns').forEach(el => el.remove());

  await new Promise(r => setTimeout(r, 100));
  injectUnivIcons(tmpDiv);

  const h = tmpDiv.scrollHeight + 32;
  const w = tmpDiv.scrollWidth;
  const fname = '무소속현황판_' + new Date().toISOString().slice(0,10) + '.png';

  try {
    if (typeof _captureAndSave !== 'function') throw new Error('이미지 저장 기능을 불러오지 못했습니다.');
    await _captureAndSave(tmpDiv, w, h, fname);
  } catch(e) {
    console.error('[무소속 현황판 이미지 저장 실패]', e);
    alert('❌ 이미지 저장 실패\n\n' + (e.message || '알 수 없는 오류가 발생했습니다.'));
  }
  finally {
    document.body.removeChild(tmpDiv);
    if (btn) { btn.disabled = false; btn.textContent = '📷 이미지저장'; }
  }
}

function _b2ContrastColor(hex) {
  try {
    const c = (hex||'').replace('#','');
    const r = parseInt(c.slice(0,2),16), g = parseInt(c.slice(2,4),16), b = parseInt(c.slice(4,6),16);
    return (r*299+g*587+b*114)/1000 > 128 ? '#1e293b' : '#ffffff';
  } catch(e){ return '#ffffff'; }
}



/* ════════════════════════════════════════
   💜 보라크루 현황판 — 크루별 블록
════════════════════════════════════════ */

function _gcCrew(crewName) {
  const c = (typeof crewCfg !== 'undefined' ? crewCfg : []).find(x => x.name === crewName);
  return (c && c.color) ? c.color : '#7c3aed';
}

/* ── 카드 너비 설정 ── */
function _crewCardMinWidth() {
  return _b2CrewCardSize === 's' ? 88 : _b2CrewCardSize === 'l' ? 150 : 110;
}

function _b2CrewView() {
  // 보라크루 타입 크루만 필터링 (하위 호환: type이 없으면 보라크루로 간주)
  const cfg = (typeof crewCfg !== 'undefined' ? crewCfg : []).filter(c => !c.type || c.type === '보라크루');
  const crewArr = typeof crew !== 'undefined' ? crew : [];
  const scPlayers = players || [];

  function getMembersOf(crewName) {
    const sc = scPlayers.filter(p => p.crewName === crewName);
    const pure = crewArr.filter(m => m.crewName === crewName);
    // 이름으로 중복 제거 (SC 선수와 순수 크루 멤버가 같은 사람일 경우)
    const seenNames = new Set(sc.map(p => p.name));
    const uniquePure = pure.filter(m => !seenNames.has(m.name));
    return { sc, pure: uniquePure, total: sc.length + uniquePure.length };
  }

  const knownNames = cfg.map(c => c.name);
  // 솔로: crew 배열에서 크루명 없는 사람만 (SC선수 제외)
  const soloPure = crewArr.filter(m => !m.crewName || !knownNames.includes(m.crewName));
  // 미배정 SC: crewName 있지만 cfg에 없음
  const unassignedSC = scPlayers.filter(p => p.crewName && !knownNames.includes(p.crewName));
  const totalAll = cfg.reduce((s, c) => s + getMembersOf(c.name).total, 0);

  // 뷰 모드: 'grid'=크루별 | 'list'=전체목록
  const isListMode = _b2CrewListMode === 'list';

  const cardSizeBtns = `
    <div style="display:flex;gap:2px;background:var(--surface);border:1px solid var(--border2);border-radius:8px;padding:2px">
      <button class="btn btn-xs" style="${_b2CrewCardSize==='s'?'background:#7c3aed;color:#fff;border-color:#7c3aed':'background:none;border:none;color:var(--gray-l)'}" onclick="_b2CrewCardSize='s';document.getElementById('b2-content').innerHTML=_b2CrewView()" title="소">S</button>
      <button class="btn btn-xs" style="${_b2CrewCardSize==='m'?'background:#7c3aed;color:#fff;border-color:#7c3aed':'background:none;border:none;color:var(--gray-l)'}" onclick="_b2CrewCardSize='m';document.getElementById('b2-content').innerHTML=_b2CrewView()" title="중">M</button>
      <button class="btn btn-xs" style="${_b2CrewCardSize==='l'?'background:#7c3aed;color:#fff;border-color:#7c3aed':'background:none;border:none;color:var(--gray-l)'}" onclick="_b2CrewCardSize='l';document.getElementById('b2-content').innerHTML=_b2CrewView()" title="대">L</button>
    </div>`;

  let h = '<div style="padding:16px 0">';
  h += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:20px;flex-wrap:wrap">';
  h += '<span style="font-size:18px;font-weight:900;color:#7c3aed">💜 보라크루</span>';
  h += '<span style="font-size:12px;color:var(--gray-l)">' + cfg.length + '개 크루 · ' + totalAll + '명</span>';
  // 뷰 토글
  h += '<div style="display:flex;gap:2px;background:var(--surface);border:1px solid var(--border2);border-radius:8px;padding:2px">';
  h += '<button class="btn btn-xs" style="' + (!isListMode ? 'background:#7c3aed;color:#fff;border-color:#7c3aed' : 'background:none;border:none;color:var(--gray-l)') + '" onclick="_b2CrewListMode=\'grid\';document.getElementById(\'b2-content\').innerHTML=_b2CrewView()">크루별</button>';
  h += '<button class="btn btn-xs" style="' + (isListMode ? 'background:#7c3aed;color:#fff;border-color:#7c3aed' : 'background:none;border:none;color:var(--gray-l)') + '" onclick="_b2CrewListMode=\'list\';document.getElementById(\'b2-content\').innerHTML=_b2CrewView()">전체목록</button>';
  h += '</div>';
  h += cardSizeBtns;
  h += '<div style="margin-left:auto;display:flex;gap:6px;flex-wrap:wrap">';
  // 솔로 토글
  if (soloPure.length) {
    h += '<button class="btn btn-xs" style="' + (_b2ShowSolo ? 'background:#7c3aed;color:#fff;border-color:#7c3aed' : 'border-color:#7c3aed;color:#7c3aed') + '" onclick="_b2ShowSolo=!_b2ShowSolo;document.getElementById(\'b2-content\').innerHTML=_b2CrewView()">🎙️ 솔로 ' + soloPure.length + '명</button>';
  }
  h += '<button class="btn btn-xs no-export" style="border-color:#7c3aed;color:#7c3aed" onclick="saveCrewImg(\'전체\',this)">📷 전체저장</button>';
  if (isLoggedIn) {
    h += '<button class="btn btn-xs no-export" style="background:#7c3aed;color:#fff;border-color:#7c3aed" onclick="openCrewCfgAddModal()">+ 크루 추가</button>';
    h += '<button class="btn btn-xs no-export" style="background:#6d28d9;color:#fff;border-color:#6d28d9" onclick="openCrewAddModal()">+ 크루원 추가</button>';
  }
  h += '</div></div>';

  if (!cfg.length) {
    h += '<div style="text-align:center;padding:60px 20px;color:var(--gray-l);background:var(--surface);border-radius:12px;border:2px dashed #ddd6fe">';
    h += '<div style="font-size:40px;margin-bottom:12px">💜</div>';
    h += '<div style="font-weight:700;margin-bottom:6px">등록된 크루가 없습니다</div>';
    if (isLoggedIn) h += '<div style="font-size:12px">+ 크루 추가로 크루를 먼저 만드세요</div>';
    h += '</div>';
    if (_b2ShowSolo && soloPure.length) h += _b2SoloSection(soloPure);
    h += '</div>';
    return h;
  }

  // ── 전체목록 뷰 ──
  if (isListMode) {
    h += _b2CrewListView(cfg, crewArr, scPlayers);
    if (_b2ShowSolo && soloPure.length) h += _b2SoloSection(soloPure);
    h += '</div>';
    return h;
  }

  // ── 크루별 그리드 뷰 ──
  cfg.forEach(function(c, ci) {
    const col = c.color || '#7c3aed';
    const bgAlpha = Math.round(((c.bgAlpha != null ? c.bgAlpha : 10) / 100) * 255).toString(16).padStart(2, '0');
    const labelAlpha = Math.round(((c.labelAlpha != null ? c.labelAlpha : 18) / 100) * 255).toString(16).padStart(2, '0');
    const members = getMembersOf(c.name);
    // 헤더: 항상 단색 배경 (크루 컬러) - labelAlpha 적용
    const hdrStyle = 'background:linear-gradient(135deg,' + col + ',' + col + labelAlpha + ')!important;';
    // 본문(스트리머 영역): bgImage 적용
    const bodyBgStyle = c.bgImage
      ? 'background:url(' + JSON.stringify(c.bgImage) + ') center/cover no-repeat;'
      : 'background:' + col + Math.round(((c.cardAlpha != null ? c.cardAlpha : 8) / 100) * 255).toString(16).padStart(2, '0') + ';';
    const bodyOverlay = c.bgImage
      ? '<div style="position:absolute;inset:0;background:' + col + Math.round(((c.bgAlpha != null ? c.bgAlpha : 10) / 100) * 255).toString(16).padStart(2, '0') + ';pointer-events:none"></div>'
      : '';
    const safeName = c.name.replace(/\\/g,'\\\\').replace(/'/g,"\\'");
    const isCollapsed = _b2CrewCollapsed.has(c.name);
    const minW = _crewCardMinWidth();

    h += '<div style="margin-bottom:18px;border-radius:12px;overflow:hidden;border:1.5px solid ' + col + '40;box-shadow:0 2px 12px ' + col + '22">';
    // 헤더 (단색)
    h += '<div style="position:relative;padding:14px 18px;' + hdrStyle + 'min-height:56px;display:flex;align-items:center;gap:12px">';
    // 로고 (클릭 → 상세)
    h += '<div style="position:relative;cursor:pointer;flex-shrink:0" onclick="openCrewDetailModal(\'' + safeName + '\')" title="크루 상세보기">';
    if (c.logo) {
      h += '<img src="' + c.logo + '" style="width:42px;height:42px;border-radius:50%;object-fit:cover;border:2px solid #fff8" onerror="this.style.display=\'none\'">';
    } else {
      h += '<div style="width:42px;height:42px;border-radius:50%;background:#fff3;display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:900;color:#fff;border:2px solid #fff5">' + (c.name || '?')[0] + '</div>';
    }
    h += '</div>';
    // 이름 (클릭 → 상세)
    h += '<div style="position:relative;flex:1;cursor:pointer;min-width:0" onclick="openCrewDetailModal(\'' + safeName + '\')">';
    h += '<div style="font-size:16px;font-weight:900;color:#fff;text-shadow:0 1px 4px #0006">' + c.name + '</div>';
    h += '<div style="font-size:11px;color:#ffffffcc">' + members.total + '명' + (c.desc ? ' · ' + c.desc : '') + '</div>';
    h += '</div>';
    // 버튼들
    h += '<div class="no-export" style="position:relative;display:flex;gap:4px;align-items:center">';
    // 순서 이동
    if (isLoggedIn) {
      h += '<div style="display:flex;flex-direction:column;gap:1px">';
      h += '<button class="btn btn-xs" style="background:#ffffff22;color:#fff;border-color:#ffffff44;font-size:9px;padding:1px 5px;line-height:1" onclick="event.stopPropagation();moveCrewCfg(' + ci + ',-1)" title="위로">▲</button>';
      h += '<button class="btn btn-xs" style="background:#ffffff22;color:#fff;border-color:#ffffff44;font-size:9px;padding:1px 5px;line-height:1" onclick="event.stopPropagation();moveCrewCfg(' + ci + ',1)" title="아래로">▼</button>';
      h += '</div>';
    }
    h += '<button class="btn btn-xs" style="background:#ffffff22;color:#fff;border-color:#ffffff55;font-size:10px" onclick="event.stopPropagation();saveCrewImg(\'' + safeName + '\',this)">📷</button>';
    if (isLoggedIn) {
      h += '<button class="btn btn-xs" style="background:#10b98133;color:#fff;border-color:#10b98155;font-size:10px" onclick="event.stopPropagation();openCrewBulkMoveModal(\'' + safeName + '\')" title="크루 전체 종합게임으로 이동">🎮</button>';
      h += '<button class="btn btn-xs" style="background:#ffffff33;color:#fff;border-color:#ffffff55;font-size:10px" onclick="event.stopPropagation();openCrewCfgEditModal(\'' + safeName + '\')">⚙️</button>';
      h += '<button class="btn btn-xs" style="background:#ef444433;color:#fff;border-color:#ef444455;font-size:10px" onclick="event.stopPropagation();deleteCrewCfg(\'' + safeName + '\')">🗑</button>';
    }
    // 접기/펼치기
    h += '<button class="btn btn-xs" style="background:#ffffff22;color:#fff;border-color:#ffffff44;font-size:11px;padding:2px 6px;z-index:1000;position:relative" onclick="event.stopPropagation();_b2CrewCollapsed.' + (isCollapsed ? 'delete' : 'add') + '(\'' + safeName + '\');document.getElementById(\'b2-content\').innerHTML=_b2CrewView()" title="' + (isCollapsed ? '펼치기' : '접기') + '">' + (isCollapsed ? '▶' : '▼') + '</button>';
    h += '</div>';
    h += '</div>';

    // 멤버 그리드 (접혀있으면 숨김)
    if (!isCollapsed) {
      // 본문: bgImage 있으면 이미지 배경 + 반투명 오버레이, 없으면 단색
      h += '<div style="position:relative;' + bodyBgStyle + 'padding:14px">';
      if (bodyOverlay) h += bodyOverlay;
      if (!members.total) {
        h += '<div style="position:relative;text-align:center;padding:20px;color:var(--gray-l);font-size:12px">아직 크루원이 없습니다';
        if (isLoggedIn) h += '<br><button class="btn btn-xs no-export" style="margin-top:6px;border-color:' + col + ';color:' + col + '" onclick="openCrewAddModal(\'' + safeName + '\')">+ 크루원 추가</button>';
        h += '</div>';
      } else {
        h += '<div style="position:relative;display:grid;grid-template-columns:repeat(auto-fill,minmax(' + minW + 'px,1fr));gap:10px">';
        // 직책 순서: 대표(0) > 부대표(1) > 리더/매니저 > 나머지
        const _crewRankOrder = function(p) {
          const cr = (p.crewRole||p.role||'').replace(/\s/g,'');
          if(cr==='대표'||cr==='리더'||p.role==='representative') return 0;
          if(cr==='부대표'||cr==='부리더') return 1;
          if(cr==='매니저') return 2;
          return 99;
        };
        const _allMembers = [
          ...members.sc.map(p=>({...p, _isSC:true, _idx:-1})),
          ...members.pure.map(m=>({...m, _isSC:false, _idx:crewArr.findIndex(x=>x===m)}))
        ].sort((a,b) => _crewRankOrder(a) - _crewRankOrder(b));
        _allMembers.forEach(function(m) {
          if(m._isSC) h += _crewMemberCard(m.name, m.photo, m.channelUrl, true, -1, col, m.crewName, m.crewRole||'');
          else h += _crewMemberCard(m.name, m.photo, m.link, false, m._idx, col, m.crewName, m.crewRole||'');
        });
        h += '</div>';
      }
      h += '</div>';
    }
    h += '</div>';
  });

  // 미배정 SC
  if (unassignedSC.length) {
    h += '<div style="margin-bottom:18px;border-radius:12px;overflow:hidden;border:1.5px solid var(--border2)">';
    h += '<div style="padding:10px 16px;background:var(--surface);font-size:13px;font-weight:700;color:var(--gray-l)">📌 미배정 크루원</div>';
    h += '<div style="background:var(--white);padding:14px"><div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(' + _crewCardMinWidth() + 'px,1fr));gap:10px">';
    unassignedSC.forEach(function(p) { h += _crewMemberCard(p.name,p.photo,p.channelUrl,true,-1,'#6b7280','',p.crewRole||''); });
    h += '</div></div></div>';
  }

  // 솔로 방송 (crew배열 미배정)
  if (_b2ShowSolo && soloPure.length) {
    h += '<div style="margin-bottom:18px;border-radius:12px;overflow:hidden;border:1.5px solid #8b5cf640">';
    h += '<div style="padding:12px 16px;background:linear-gradient(135deg,#8b5cf620,#7c3aed15);display:flex;align-items:center;gap:8px;border-bottom:1px solid #8b5cf620">';
    h += '<span style="font-size:14px;font-weight:900;color:#7c3aed">🎙️ 무소속</span>';
    h += '<span style="font-size:11px;color:var(--gray-l)">크루 미소속 ' + soloPure.length + '명</span>';
    h += '</div>';
    h += '<div style="background:var(--white);padding:14px"><div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(' + _crewCardMinWidth() + 'px,1fr));gap:10px">';
    soloPure.forEach(function(m) {
      const idx = (typeof crew !== 'undefined' ? crew : []).findIndex(x => x === m);
      h += _crewMemberCard(m.name, m.photo, m.link, false, idx, '#7c3aed', '', '');
    });
    h += '</div></div></div>';
  }

  h += '</div>';
  return h;
}

/* ── 전체목록 뷰 ── */
function _b2CrewListView(cfg, crewArr, scPlayers) {
  const minW = _crewCardMinWidth();
  // 크루별로 그룹핑
  let h = '';
  cfg.forEach(function(c) {
    const col = c.color || '#7c3aed';
    const labelAlpha = Math.round(((c.labelAlpha != null ? c.labelAlpha : 18) / 100) * 255).toString(16).padStart(2, '0');
    const sc = scPlayers.filter(p => p.crewName === c.name);
    const pure = crewArr.filter(m => m.crewName === c.name);
    if (!sc.length && !pure.length) return;
    const rankOrder = {'대표':0,'부대표':1,'리더':0,'부리더':1,'매니저':2};
    const allMembers = [
      ...sc.map(p=>({name:p.name,photo:p.photo,link:p.channelUrl,isSC:true,idx:-1,crewRole:p.crewRole||'',role:p.role||''})),
      ...pure.map(m=>({name:m.name,photo:m.photo,link:m.link,isSC:false,idx:crewArr.findIndex(x=>x===m),crewRole:m.crewRole||'',role:m.role||''}))
    ].sort((a,b)=>{
      // Check main role first (representative gets highest priority)
      const aRoleOrder = a.role === 'representative' ? 0 : (a.role && MAIN_ROLES.includes(a.role) ? getRoleOrder(a.role) : 99);
      const bRoleOrder = b.role === 'representative' ? 0 : (b.role && MAIN_ROLES.includes(b.role) ? getRoleOrder(b.role) : 99);
      if (aRoleOrder !== bRoleOrder) return aRoleOrder - bRoleOrder;
      
      // Then check crew role
      return (rankOrder[a.crewRole]??99)-(rankOrder[b.crewRole]??99);
    });

    h += '<div style="margin-bottom:18px;border-radius:12px;overflow:hidden;border:1.5px solid ' + col + '40">';
    h += '<div style="padding:10px 16px;background:' + col + labelAlpha + ';display:flex;align-items:center;gap:8px">';
    if (c.logo) h += '<img src="' + c.logo + '" style="width:24px;height:24px;border-radius:50%;object-fit:cover;border:1.5px solid #fff8" onerror="this.style.display=\'none\'">';
    h += '<span style="font-size:13px;font-weight:900;color:#fff;text-shadow:0 1px 3px #0005">' + c.name + '</span>';
    h += '<span style="font-size:11px;color:#ffffffbb">' + allMembers.length + '명</span>';
    h += '</div>';
    h += '<div style="background:var(--white);padding:12px"><div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(' + minW + 'px,1fr));gap:8px">';
    allMembers.forEach(m => { h += _crewMemberCard(m.name, m.photo, m.link, m.isSC, m.idx, col, c.name, m.crewRole); });
    h += '</div></div></div>';
  });
  return h;
}

/* ── 솔로 섹션 (crew 배열 미배정) ── */
function _b2SoloSection(soloPure) {
  const minW = _crewCardMinWidth();
  let h = '<div style="margin-bottom:18px;border-radius:12px;overflow:hidden;border:1.5px solid #8b5cf640">';
  h += '<div style="padding:12px 16px;background:linear-gradient(135deg,#8b5cf620,#7c3aed15);display:flex;align-items:center;gap:8px;border-bottom:1px solid #8b5cf620">';
  h += '<span style="font-size:14px;font-weight:900;color:#7c3aed">🎙️ 솔로 방송</span>';
  h += '<span style="font-size:11px;color:var(--gray-l)">크루 미소속 ' + soloPure.length + '명</span>';
  h += '</div>';
  h += '<div style="background:var(--white);padding:14px"><div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(' + minW + 'px,1fr));gap:10px">';
  soloPure.forEach(function(m) {
    const idx = (typeof crew !== 'undefined' ? crew : []).findIndex(x => x === m);
    h += _crewMemberCard(m.name, m.photo, m.link, false, idx, '#7c3aed', '', '');
  });
  h += '</div></div></div>';
  return h;
}

/* ── 크루원 카드 (전체 이미지 채우기, 원형) ── */
function _crewMemberCard(name, photo, link, isSC, crewIdx, accentColor, currentCrew, crewRole) {
  const col = accentColor || '#7c3aed';
  const safeName = (name || '').replace(/\\/g,'\\\\').replace(/'/g,"\\'");
  const isLarge = _b2CrewCardSize === 'l';
  const isSmall = _b2CrewCardSize === 's';
  // 카드 높이: S=120 M=150 L=185
  const cardH = isLarge ? 185 : isSmall ? 120 : 150;
  const nameFontSize = isLarge ? 13 : isSmall ? 10 : 12;
  const roleFontSize = isLarge ? 10 : 9;

  // 이미지: 카드 전체를 원형으로 꽉 채움 (aspect-ratio 1:1, 둥근 모서리)
  const imgInner = photo
    ? '<img src="' + photo + '" style="position:absolute;inset:0;width:100%;height:100%;object-fit:contain;border-radius:inherit" onerror="this.style.display=\'none\';this.nextSibling.style.display=\'flex\'">'
      + '<div style="position:absolute;inset:0;background:linear-gradient(135deg,' + col + ',' + col + '99);border-radius:inherit;display:none;align-items:center;justify-content:center;font-size:' + (cardH*0.35|0) + 'px;font-weight:900;color:#fff">' + (name||'?')[0] + '</div>'
    : '<div style="position:absolute;inset:0;background:linear-gradient(135deg,' + col + ',' + col + '99);border-radius:inherit;display:flex;align-items:center;justify-content:center;font-size:' + (cardH*0.35|0) + 'px;font-weight:900;color:#fff">' + (name||'?')[0] + '</div>';

  // 하단 그라데이션 오버레이 + 이름
  const scDot = isSC ? '<span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:#60a5fa;margin-right:3px;vertical-align:middle;flex-shrink:0"></span>' : '';
  const roleTag = crewRole ? '<div style="font-size:' + roleFontSize + 'px;color:#ffffffbb;font-weight:700;line-height:1.2;margin-bottom:1px">' + crewRole + '</div>' : '';

  const nameClickAttr = isSC ? 'onclick="openPlayerModal(\'' + safeName + '\')" style="cursor:pointer"' : '';
  const overlay = '<div style="position:absolute;bottom:0;left:0;right:0;background:linear-gradient(transparent,rgba(0,0,0,.72));border-radius:0 0 inherit inherit;padding:' + (isSmall?'14px 6px 6px':'18px 8px 8px') + ';display:flex;flex-direction:column;align-items:center">'
    + roleTag
    + '<div ' + nameClickAttr + ' style="font-weight:800;font-size:' + nameFontSize + 'px;color:#fff;text-align:center;word-break:break-all;line-height:1.2;text-shadow:0 1px 3px #000a;display:flex;align-items:center;gap:2px">' + scDot + (name||'') + '</div>'
    + '</div>';

  // 방송 링크 버튼 (카드 외부 하단)
  const linkBtn = link
    ? '<a href="' + link + '" target="_blank" rel="noopener" style="display:block;text-align:center;padding:4px 6px;background:' + col + ';color:#fff;font-size:10px;font-weight:700;text-decoration:none;border-radius:0 0 10px 10px">▶ 방송</a>'
    : '';

  // 관리자 버튼 (카드 우상단, hover 시에만 표시 / 이미지저장 시 숨김)
  let adminBtns = '';
  if (isLoggedIn) {
    const moveBtn = '<button class="btn btn-xs no-export" style="padding:1px 4px;font-size:9px;background:#7c3aed;color:#fff;border-color:#7c3aed" onclick="event.stopPropagation();openQuickCrewMoveModal(\'' + safeName + '\',' + (isSC?'true':'false') + ',' + crewIdx + ')" title="크루 이동">🔀</button>';
    const editBtn = isSC
      ? '<button class="btn btn-xs no-export" style="padding:1px 4px;font-size:9px;background:#374151;color:#fff;border-color:#374151" onclick="event.stopPropagation();openEP(\'' + safeName + '\');cm(\'playerModal\')" title="수정">✏️</button>'
      : '<button class="btn btn-xs no-export" style="padding:1px 4px;font-size:9px;background:#374151;color:#fff;border-color:#374151" onclick="event.stopPropagation();openCrewEditModal(' + crewIdx + ')" title="수정">✏️</button>';
    const delBtn = isSC ? '' : '<button class="btn btn-xs no-export" style="padding:1px 4px;font-size:9px;background:#dc2626;color:#fff;border-color:#dc2626" onclick="event.stopPropagation();deleteCrew(' + crewIdx + ')" title="삭제">🗑</button>';
    adminBtns = '<div class="no-export b2-admin-btns" style="position:absolute;top:5px;right:5px;display:flex;gap:2px;z-index:2;opacity:0;transition:opacity .18s">' + editBtn + moveBtn + delBtn + '</div>';
  }

  const cardInner = '<div style="position:relative;width:100%;aspect-ratio:1/1;border-radius:' + (link?'10px 10px 0 0':'10px') + ';overflow:hidden;box-shadow:0 2px 8px ' + col + '30">'
    + imgInner + overlay + adminBtns
    + '</div>';

  const _showBtns = 'var _ab=this.querySelector(\'.b2-admin-btns\');if(_ab)_ab.style.opacity=\'1\'';
  const _hideBtns = 'var _ab=this.querySelector(\'.b2-admin-btns\');if(_ab)_ab.style.opacity=\'0\'';
  return '<div style="border-radius:10px;overflow:hidden;border:1.5px solid ' + col + '33;transition:box-shadow .15s;cursor:' + (isSC?'pointer':'default') + '" onmouseover="this.style.boxShadow=\'0 4px 16px ' + col + '44\';' + _showBtns + '" onmouseout="this.style.boxShadow=\'\';' + _hideBtns + '"' + (isSC?' onclick="openPlayerModal(\'' + safeName + '\')"':'') + '>'
    + cardInner + linkBtn + '</div>';
}

/* ── 크루 상세 모달 ── */
function openCrewDetailModal(crewName) {
  const cfg = typeof crewCfg !== 'undefined' ? crewCfg : [];
  const c = cfg.find(x => x.name === crewName);
  if (!c) return;
  const crewArr = typeof crew !== 'undefined' ? crew : [];
  const scPlayers = typeof players !== 'undefined' ? players : [];
  const sc = scPlayers.filter(p => p.gameType === 'general' && p.crewName === crewName);
  const pure = crewArr.filter(m => m.gameType === 'general' && m.crewName === crewName);

  const col = c.color || '#7c3aed';
  const bgAlpha = Math.round(((c.bgAlpha != null ? c.bgAlpha : 10) / 100) * 255).toString(16).padStart(2, '0');
  const bgStyle = c.bgImage
    ? 'background:url(' + JSON.stringify(c.bgImage) + ') center/cover no-repeat;'
    : 'background:linear-gradient(135deg,' + col + ',' + col + 'cc);';
  const overlay = c.bgImage
    ? '<div style="position:absolute;inset:0;background:' + col + bgAlpha + ';pointer-events:none;border-radius:12px 12px 0 0"></div>'
    : '';
  const rankOrder = {'대표':0,'부대표':1,'리더':0,'부리더':1,'매니저':2};

  let html = '<div style="border-radius:12px;overflow:hidden;margin-bottom:14px;border:1.5px solid ' + col + '40">';
  html += '<div style="position:relative;padding:22px 20px;' + bgStyle + 'display:flex;align-items:center;gap:14px">';
  html += overlay;
  if (c.logo) {
    html += '<img src="' + c.logo + '" style="position:relative;width:64px;height:64px;border-radius:50%;object-fit:cover;border:3px solid #fffb;flex-shrink:0;box-shadow:0 2px 12px #0004" onerror="this.style.display=\'none\'">';
  } else {
    html += '<div style="position:relative;width:64px;height:64px;border-radius:50%;background:#fff3;display:flex;align-items:center;justify-content:center;font-size:28px;font-weight:900;color:#fff;border:3px solid #fff5;flex-shrink:0">' + (c.name || '?')[0] + '</div>';
  }
  html += '<div style="position:relative;flex:1;min-width:0">';
  html += '<div style="font-size:22px;font-weight:900;color:#fff;text-shadow:0 1px 6px #0008;margin-bottom:2px">' + c.name + '</div>';
  if (c.desc) html += '<div style="font-size:12px;color:#ffffffcc;margin-bottom:4px">' + c.desc + '</div>';
  html += '<div style="font-size:12px;color:#ffffffcc">' + (sc.length + pure.length) + '명</div>';
  html += '</div>';
  if (isLoggedIn) {
    const safeName = crewName.replace(/\\/g,'\\\\').replace(/'/g,"\\'");
    html += '<div style="position:relative;flex-shrink:0">';
    html += '<button class="btn btn-xs no-export" style="background:#ffffff33;color:#fff;border-color:#ffffff55;font-size:10px" onclick="cm(\'crewDetailModal\');openCrewCfgEditModal(\'' + safeName + '\')">⚙️ 설정</button>';
    html += '</div>';
  }
  html += '</div>';
  html += '<div style="background:var(--white);padding:14px">';
  if (!sc.length && !pure.length) {
    html += '<div style="text-align:center;padding:20px;color:var(--gray-l);font-size:12px">크루원이 없습니다</div>';
  } else {
    const allMem = [
      ...sc.map(p=>({name:p.name,photo:p.photo,link:p.channelUrl,isSC:true,idx:-1,role:p.crewRole||'',mainRole:p.role||''})),
      ...pure.map(m=>({name:m.name,photo:m.photo,link:m.link,isSC:false,idx:crewArr.findIndex(x=>x===m),role:m.crewRole||'',mainRole:m.role||''}))
    ].sort((a,b)=>{
      // Check main role first (representative gets highest priority)
      const aRoleOrder = a.mainRole === 'representative' ? 0 : (a.mainRole && MAIN_ROLES.includes(a.mainRole) ? getRoleOrder(a.mainRole) : 99);
      const bRoleOrder = b.mainRole === 'representative' ? 0 : (b.mainRole && MAIN_ROLES.includes(b.mainRole) ? getRoleOrder(b.mainRole) : 99);
      if (aRoleOrder !== bRoleOrder) return aRoleOrder - bRoleOrder;
      
      // Then check crew role
      return (rankOrder[a.role]??99)-(rankOrder[b.role]??99);
    });
    html += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(110px,1fr));gap:10px">';
    allMem.forEach(m => { html += _crewMemberCard(m.name, m.photo, m.link, m.isSC, m.idx, col, crewName, m.role); });
    html += '</div>';
  }
  html += '</div></div>';

  document.getElementById('crewDetailBody').innerHTML = html;
  document.getElementById('crewDetailTitle').textContent = c.name + ' 크루 상세';
  om('crewDetailModal');
}

/* ── 크루 이미지 저장 ── */
async function saveCrewImg(target, btn) {
  if (btn) { btn.disabled = true; btn.textContent = '⏳...'; }
  const cfg = typeof crewCfg !== 'undefined' ? crewCfg : [];
  const crewArr = typeof crew !== 'undefined' ? crew : [];
  const scPlayers = typeof players !== 'undefined' ? players : [];

  const targets = target === '전체' ? cfg : cfg.filter(c => c.name === target);
  if (!targets.length) {
    if (btn) { btn.disabled = false; btn.textContent = target === '전체' ? '📷 전체저장' : '📷'; }
    return;
  }

  const CARD_W = 720; const PAD = 24;
  const tmpDiv = document.createElement('div');
  tmpDiv.style.cssText = 'position:fixed;left:-9999px;top:0;padding:' + PAD + 'px;background:#f0f2f5;box-sizing:border-box;width:' + (CARD_W + PAD * 2) + 'px';

  let innerHtml = '';
  targets.forEach(function(c) {
    const col = c.color || '#7c3aed';
    const bgAlphaHex = Math.round(((c.bgAlpha != null ? c.bgAlpha : 10) / 100) * 255).toString(16).padStart(2, '0');
    const labelAlphaHex = Math.round(((c.labelAlpha != null ? c.labelAlpha : 18) / 100) * 255).toString(16).padStart(2, '0');
    const sc = scPlayers.filter(p => p.crewName === c.name);
    const pure = crewArr.filter(m => m.crewName === c.name);
    const bgStyle = c.bgImage
      ? 'background:url(' + JSON.stringify(c.bgImage) + ') center/cover no-repeat;'
      : 'background:' + col + labelAlphaHex + ';';
    const overlay = c.bgImage
      ? '<div style="position:absolute;inset:0;background:' + col + bgAlphaHex + ';border-radius:12px 12px 0 0;pointer-events:none"></div>'
      : '';

    innerHtml += '<div style="margin-bottom:18px;border-radius:12px;overflow:hidden;border:1.5px solid ' + col + '40;box-shadow:0 2px 12px ' + col + '22">';
    innerHtml += '<div style="position:relative;padding:14px 18px;' + bgStyle + 'display:flex;align-items:center;gap:12px">' + overlay;
    if (c.logo) {
      innerHtml += '<img src="' + c.logo + '" style="position:relative;width:42px;height:42px;border-radius:50%;object-fit:cover;border:2px solid #fff8;flex-shrink:0">';
    } else {
      innerHtml += '<div style="position:relative;width:42px;height:42px;border-radius:50%;background:#fff3;display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:900;color:#fff;border:2px solid #fff5;flex-shrink:0">' + (c.name || '?')[0] + '</div>';
    }
    innerHtml += '<div style="position:relative;flex:1"><div style="font-size:16px;font-weight:900;color:#fff;text-shadow:0 1px 4px #0006">' + c.name + '</div>';
    if (c.desc) innerHtml += '<div style="font-size:11px;color:#ffffffcc">' + c.desc + '</div>';
    innerHtml += '<div style="font-size:11px;color:#ffffffcc">' + (sc.length + pure.length) + '명</div></div></div>';
    innerHtml += '<div style="background:#fff;padding:14px">';
    if (!sc.length && !pure.length) {
      innerHtml += '<div style="text-align:center;padding:20px;color:#9ca3af;font-size:12px">크루원이 없습니다</div>';
    } else {
      innerHtml += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(110px,1fr));gap:10px">';
      sc.forEach(p => { innerHtml += _crewMemberCardStatic(p.name, p.photo, p.channelUrl, col, p.crewRole||''); });
      pure.forEach(m => { innerHtml += _crewMemberCardStatic(m.name, m.photo, m.link, col, m.crewRole||''); });
      innerHtml += '</div>';
    }
    innerHtml += '</div></div>';
  });

  tmpDiv.innerHTML = '<style>.no-export{display:none!important}</style><div style="display:flex;flex-direction:column;gap:0">' + innerHtml + '</div>';
  document.body.appendChild(tmpDiv);
  await new Promise(r => setTimeout(r, 300));
  if (typeof _imgToDataUrls === 'function') await _imgToDataUrls(tmpDiv, 8000);
  await new Promise(r => setTimeout(r, 100));

  const h = tmpDiv.scrollHeight + 32;
  const w = tmpDiv.scrollWidth;
  const fname = (target === '전체' ? '보라크루_전체' : '보라크루_' + target) + '_' + new Date().toISOString().slice(0, 10) + '.png';

  try {
    if (typeof _captureAndSave !== 'function') throw new Error('이미지 저장 기능을 불러오지 못했습니다.');
    await _captureAndSave(tmpDiv, w, h, fname);
  } catch(e) { alert('저장 실패: ' + e.message); }
  finally {
    document.body.removeChild(tmpDiv);
    if (btn) { btn.disabled = false; btn.textContent = target === '전체' ? '📷 전체저장' : '📷'; }
  }
}

// 이미지 저장용 정적 카드 (전체 이미지 채우기)
function _crewMemberCardStatic(name, photo, link, col, crewRole) {
  const roleTag = crewRole ? '<div style="font-size:9px;color:#ffffffbb;font-weight:700;margin-bottom:1px">' + crewRole + '</div>' : '';
  const imgInner = photo
    ? '<img src="' + photo + '" style="position:absolute;inset:0;width:100%;height:100%;object-fit:contain;border-radius:10px 10px 0 0">'
    : '<div style="position:absolute;inset:0;background:linear-gradient(135deg,' + col + ',' + col + '99);display:flex;align-items:center;justify-content:center;font-size:42px;font-weight:900;color:#fff">' + (name||'?')[0] + '</div>';
  const overlay = '<div style="position:absolute;bottom:0;left:0;right:0;background:linear-gradient(transparent,rgba(0,0,0,.72));border-radius:0 0 10px 10px;padding:18px 8px 8px;text-align:center">'
    + roleTag
    + '<div style="font-weight:800;font-size:12px;color:#fff;word-break:break-all;text-shadow:0 1px 3px #000a">' + (name||'') + '</div>'
    + '</div>';
  const linkLabel = link ? '<div style="text-align:center;padding:4px;background:' + col + ';border-radius:0 0 10px 10px"><span style="font-size:10px;font-weight:700;color:#fff">▶ 방송</span></div>' : '';
  return '<div style="border-radius:10px;overflow:hidden;border:1.5px solid ' + col + '33">'
    + '<div style="position:relative;width:100%;aspect-ratio:1/1;border-radius:' + (link?'10px 10px 0 0':'10px') + ';overflow:hidden">' + imgInner + overlay + '</div>'
    + linkLabel + '</div>';
}

/* ── 크루 순서 이동 ── */
function moveCrewCfg(idx, dir) {
  if (!isLoggedIn) return;
  const cfg = typeof crewCfg !== 'undefined' ? crewCfg : [];
  const newIdx = idx + dir;
  if (newIdx < 0 || newIdx >= cfg.length) return;
  const tmp = cfg[idx]; cfg[idx] = cfg[newIdx]; cfg[newIdx] = tmp;
  save();
  const sub = document.getElementById('b2-content'); if (sub) sub.innerHTML = _b2CrewView();
}

/* ── 크루 빠른 이동 ── */
function openQuickCrewMoveModal(name, isSC, idx) {
  if (!isLoggedIn) return;
  const currentCrew = isSC
    ? ((typeof players !== 'undefined' ? players : []).find(p => p.name === name) || {}).crewName || ''
    : ((typeof crew !== 'undefined' ? crew : [])[idx] || {}).crewName || '';
  document.getElementById('crewMoveModalName').value = name;
  document.getElementById('crewMoveModalIsSC').value = isSC ? '1' : '0';
  document.getElementById('crewMoveModalIdx').value = idx;
  document.getElementById('crewMoveModalLabel').textContent = name;
  _refreshCrewSelect('crewMoveCrewSelect', currentCrew);
  om('crewMoveModal');
}

/* ── 크루 전체 종합게임/보라크루 이동 ── */
function openCrewBulkMoveModal(crewName) {
  if (!isLoggedIn) return;
  const cfg = typeof crewCfg !== 'undefined' ? crewCfg : [];
  const sc = (typeof players !== 'undefined' ? players : []).filter(p => p.crewName === crewName);
  const pure = (typeof crew !== 'undefined' ? crew : []).filter(m => m.crewName === crewName);
  const totalCount = sc.length + pure.length;
  if (!totalCount) { alert('이 크루에 소속된 멤버가 없습니다.'); return; }

  const gameTypes = ['starcraft','general','보라크루'];
  const currentType = sc.length > 0 ? (sc[0].gameType || 'starcraft') : 'starcraft';

  const choice = prompt(
    `"${crewName}" 크루 전체(${totalCount}명) gameType 일괄 변경\n\n` +
    `현재: ${currentType}\n\n` +
    `변경할 타입을 입력하세요:\n` +
    `  starcraft — 스타크래프트\n` +
    `  종합게임  — 종합게임\n` +
    `  보라크루  — 보라크루`,
    currentType
  );
  if (choice === null) return;
  const newType = choice.trim();
  if (!['starcraft','종합게임','보라크루'].includes(newType)) {
    alert('올바른 타입을 입력하세요: starcraft / 종합게임 / 보라크루');
    return;
  }
  if (!confirm(`"${crewName}" 크루 ${totalCount}명을 모두 "${newType}"으로 변경할까요?`)) return;

  sc.forEach(p => { p.gameType = newType; });
  // pure(crew 배열) 는 별도 데이터이므로 gameType 미지원이지만 참고로 기록
  save();
  const sub = document.getElementById('b2-content');
  if (sub) sub.innerHTML = _b2CrewView();
  alert(`완료: ${sc.length}명 변경됨`);
}

function saveQuickCrewMove() {
  if (!isLoggedIn) return;
  const name = document.getElementById('crewMoveModalName').value;
  const isSC = document.getElementById('crewMoveModalIsSC').value === '1';
  const idx = parseInt(document.getElementById('crewMoveModalIdx').value);
  const newCrew = document.getElementById('crewMoveCrewSelect').value || '';
  if (isSC) {
    const p = (typeof players !== 'undefined' ? players : []).find(x => x.name === name);
    if (p) { p.crewName = newCrew || undefined; p.isCrew = newCrew ? true : undefined; }
  } else {
    const m = (typeof crew !== 'undefined' ? crew : [])[idx];
    if (m) m.crewName = newCrew || undefined;
  }
  save();
  cm('crewMoveModal');
  const sub = document.getElementById('b2-content'); if (sub) sub.innerHTML = _b2CrewView();
}

/* ── 크루 설정 관리 ── */
function openCrewCfgAddModal() {
  if (!isLoggedIn) return;
  document.getElementById('crewCfgModalTitle').textContent = '+ 크루 추가';
  document.getElementById('crewCfgModalIdx').value = '-1';
  // 현재 뷰에 따라 크루 타입 자동 설정
  const crewType = _b2View === 'game' ? 'general' : '보라크루';
  document.getElementById('crewCfgType').value = crewType;
  document.getElementById('crewCfgName').value = '';
  document.getElementById('crewCfgColor').value = crewType === 'general' ? '#10b981' : '#7c3aed';
  document.getElementById('crewCfgLogo').value = '';
  document.getElementById('crewCfgBgImage').value = '';
  document.getElementById('crewCfgBgAlpha').value = '10';
  document.getElementById('crewCfgLabelAlpha').value = '18';
  document.getElementById('crewCfgCardAlpha').value = '8';
  document.getElementById('crewCfgDesc').value = '';
  const va = document.getElementById('crewCfgLabelAlphaVal'); if (va) va.textContent = '18';
  const vb = document.getElementById('crewCfgBgAlphaVal'); if (vb) vb.textContent = '10';
  const vc = document.getElementById('crewCfgCardAlphaVal'); if (vc) vc.textContent = '8';
  om('crewCfgModal');
}
function openCrewCfgEditModal(crewName) {
  if (!isLoggedIn) return;
  const idx = (typeof crewCfg !== 'undefined' ? crewCfg : []).findIndex(function(c) { return c.name === crewName; });
  if (idx < 0) return;
  const c = crewCfg[idx];
  document.getElementById('crewCfgModalTitle').textContent = '⚙️ 크루 설정 — ' + crewName;
  document.getElementById('crewCfgModalIdx').value = idx;
  document.getElementById('crewCfgName').value = c.name || '';
  document.getElementById('crewCfgColor').value = c.color || '#7c3aed';
  document.getElementById('crewCfgLogo').value = c.logo || '';
  document.getElementById('crewCfgBgImage').value = c.bgImage || '';
  document.getElementById('crewCfgBgAlpha').value = c.bgAlpha != null ? c.bgAlpha : 10;
  document.getElementById('crewCfgLabelAlpha').value = c.labelAlpha != null ? c.labelAlpha : 18;
  document.getElementById('crewCfgCardAlpha').value = c.cardAlpha != null ? c.cardAlpha : 8;
  document.getElementById('crewCfgDesc').value = c.desc || '';
  const va = document.getElementById('crewCfgLabelAlphaVal'); if (va) va.textContent = c.labelAlpha != null ? c.labelAlpha : 18;
  const vb = document.getElementById('crewCfgBgAlphaVal'); if (vb) vb.textContent = c.bgAlpha != null ? c.bgAlpha : 10;
  const vc = document.getElementById('crewCfgCardAlphaVal'); if (vc) vc.textContent = c.cardAlpha != null ? c.cardAlpha : 8;
  om('crewCfgModal');
}
function saveCrewCfgModal() {
  if (!isLoggedIn) return;
  const idx = parseInt(document.getElementById('crewCfgModalIdx').value);
  const name = document.getElementById('crewCfgName').value.trim();
  if (!name) { alert('크루명을 입력하세요.'); return; }
  const entry = {
    id: (idx >= 0 && crewCfg[idx]) ? crewCfg[idx].id : ('crew_' + Date.now().toString(36)),
    name: name,
    type: document.getElementById('crewCfgType').value || '보라크루', // 크루 타입: '보라크루' 또는 'general'
    color: document.getElementById('crewCfgColor').value || '#7c3aed',
    logo: document.getElementById('crewCfgLogo').value.trim(),
    bgImage: document.getElementById('crewCfgBgImage').value.trim(),
    bgAlpha: parseInt(document.getElementById('crewCfgBgAlpha').value) || 10,
    labelAlpha: parseInt(document.getElementById('crewCfgLabelAlpha').value) || 18,
    cardAlpha: parseInt(document.getElementById('crewCfgCardAlpha').value) || 8,
    desc: document.getElementById('crewCfgDesc').value.trim(),
  };
  if (typeof crewCfg === 'undefined') window.crewCfg = [];
  if (idx === -1) crewCfg.push(entry);
  else crewCfg[idx] = entry;
  save(); cm('crewCfgModal');
  const sub = document.getElementById('b2-content'); if (sub) sub.innerHTML = _b2CrewView();
}
function deleteCrewCfg(crewName) {
  if (!isLoggedIn) return;
  if (!confirm('"' + crewName + '" 크루를 삭제할까요?\n크루원들은 미배정 상태가 됩니다.')) return;
  const idx = (typeof crewCfg !== 'undefined' ? crewCfg : []).findIndex(function(c) { return c.name === crewName; });
  if (idx >= 0) crewCfg.splice(idx, 1);
  save();
  const sub = document.getElementById('b2-content'); if (sub) sub.innerHTML = _b2CrewView();
}

/* ── 크루원 관리 ── */
function _refreshCrewSelect(selId, defaultName) {
  const sel = document.getElementById(selId); if (!sel) return;
  sel.innerHTML = '<option value="">— 미배정 —</option>'
    + (typeof crewCfg !== 'undefined' ? crewCfg : []).map(function(c) {
        return '<option value="' + c.name + '"' + (c.name === defaultName ? ' selected' : '') + '>' + c.name + '</option>';
      }).join('');
}
function openCrewAddModal(defaultCrew) {
  if (!isLoggedIn) return;
  document.getElementById('crewModalTitle').textContent = '+ 크루원 추가';
  document.getElementById('crewModalIdx').value = '-1';
  document.getElementById('crewModalName').value = '';
  document.getElementById('crewModalPhoto').value = '';
  document.getElementById('crewModalLink').value = '';
  document.getElementById('crewModalRole').value = '';
  _refreshCrewSelect('crewModalCrewName', defaultCrew || '');
  om('crewModal');
}
function openCrewEditModal(idx) {
  if (!isLoggedIn) return;
  const m = (typeof crew !== 'undefined' ? crew : [])[idx];
  if (!m) return;
  document.getElementById('crewModalTitle').textContent = '✏️ 크루원 수정';
  document.getElementById('crewModalIdx').value = idx;
  document.getElementById('crewModalName').value = m.name || '';
  document.getElementById('crewModalPhoto').value = m.photo || '';
  document.getElementById('crewModalLink').value = m.link || '';
  document.getElementById('crewModalRole').value = m.crewRole || '';
  _refreshCrewSelect('crewModalCrewName', m.crewName || '');
  om('crewModal');
}
function saveCrewModal() {
  if (!isLoggedIn) return;
  const idx = parseInt(document.getElementById('crewModalIdx').value);
  const name = document.getElementById('crewModalName').value.trim();
  if (!name) { alert('이름을 입력하세요.'); return; }
  const photo = document.getElementById('crewModalPhoto').value.trim();
  const link = document.getElementById('crewModalLink').value.trim();
  const crewName = (document.getElementById('crewModalCrewName') || {}).value || '';
  const crewRole = document.getElementById('crewModalRole').value.trim();
  const entry = { name, photo, link, crewName: crewName || undefined, crewRole: crewRole || undefined };
  if (typeof crew === 'undefined') window.crew = [];
  if (idx === -1) crew.push(entry);
  else crew[idx] = entry;
  save(); cm('crewModal');
  const sub = document.getElementById('b2-content'); if (sub) sub.innerHTML = _b2CrewView();
}
function deleteCrew(idx) {
  if (!isLoggedIn) return;
  if (!confirm('크루원을 삭제할까요?')) return;
  if (typeof crew !== 'undefined') crew.splice(idx, 1);
  save();
  const sub = document.getElementById('b2-content'); if (sub) sub.innerHTML = _b2CrewView();
}

/* ════════════════════════════════════════
   🎮 종합게임 현황판 — 크루별 블록 (보라크루 스타일)
════════════════════════════════════════ */

function _b2GameView() {
  // 종합게임 타입 크루만 필터링
  const cfg = (typeof crewCfg !== 'undefined' ? crewCfg : []).filter(c => c.type === 'general');
  const crewArr = typeof crew !== 'undefined' ? crew : [];
  // 종합게임/general 타입 선수만
  const gamePlayers = (players || [])
    .filter(p => !p.hidden && !p.retired && !p.hideFromBoard &&
      p.gameType === 'general');

  function getGameMembersOf(crewName) {
    const sc = gamePlayers.filter(p => p.crewName === crewName);
    const pure = crewArr.filter(m => m.crewName === crewName);
    // 이름으로 중복 제거 (종합게임 선수와 순수 크루 멤버가 같은 사람일 경우)
    const seenNames = new Set(sc.map(p => p.name));
    const uniquePure = pure.filter(m => !seenNames.has(m.name));
    return { sc, pure: uniquePure, total: sc.length + uniquePure.length };
  }

  const knownNames = cfg.map(c => c.name);
  const soloPure = crewArr.filter(m => !m.crewName || !knownNames.includes(m.crewName));
  const unassignedGame = gamePlayers.filter(p => p.crewName && !knownNames.includes(p.crewName));
  const noCrewGame = gamePlayers.filter(p => !p.crewName);
  // 중복 제거된 전체 멤버 수 계산
  const totalAll = cfg.reduce((s, c) => s + getGameMembersOf(c.name).total, 0) + soloPure.length + unassignedGame.length + noCrewGame.length;

  const isListMode = window._b2GameListMode === 'list';
  const cardSize = window._b2GameCardSize || 'm';
  const minW = cardSize === 's' ? 88 : cardSize === 'l' ? 150 : 110;

  const cardSizeBtns = `
    <div style="display:flex;gap:2px;background:var(--surface);border:1px solid var(--border2);border-radius:8px;padding:2px">
      <button class="btn btn-xs" style="${cardSize==='s'?'background:#10b981;color:#fff;border-color:#10b981':'background:none;border:none;color:var(--gray-l)'}" onclick="window._b2GameCardSize='s';document.getElementById('b2-content').innerHTML=_b2GameView()" title="소">S</button>
      <button class="btn btn-xs" style="${cardSize==='m'?'background:#10b981;color:#fff;border-color:#10b981':'background:none;border:none;color:var(--gray-l)'}" onclick="window._b2GameCardSize='m';document.getElementById('b2-content').innerHTML=_b2GameView()" title="중">M</button>
      <button class="btn btn-xs" style="${cardSize==='l'?'background:#10b981;color:#fff;border-color:#10b981':'background:none;border:none;color:var(--gray-l)'}" onclick="window._b2GameCardSize='l';document.getElementById('b2-content').innerHTML=_b2GameView()" title="대">L</button>
    </div>`;

  let h = '<div style="padding:16px 0">';
  h += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:20px;flex-wrap:wrap">';
  h += '<span style="font-size:18px;font-weight:900;color:#10b981">🎮 종합게임</span>';
  h += '<span style="font-size:12px;color:var(--gray-l)">' + totalAll + '명</span>';
  h += '<div style="display:flex;gap:2px;background:var(--surface);border:1px solid var(--border2);border-radius:8px;padding:2px">';
  h += '<button class="btn btn-xs" style="' + (!isListMode ? 'background:#10b981;color:#fff;border-color:#10b981' : 'background:none;border:none;color:var(--gray-l)') + '" onclick="window._b2GameListMode=\'grid\';document.getElementById(\'b2-content\').innerHTML=_b2GameView()">크루별</button>';
  h += '<button class="btn btn-xs" style="' + (isListMode ? 'background:#10b981;color:#fff;border-color:#10b981' : 'background:none;border:none;color:var(--gray-l)') + '" onclick="window._b2GameListMode=\'list\';document.getElementById(\'b2-content\').innerHTML=_b2GameView()">전체목록</button>';
  h += '</div>';
  h += cardSizeBtns;
  h += '<div style="margin-left:auto;display:flex;gap:6px;flex-wrap:wrap">';
  // 솔로 토글
  if (soloPure.length) {
    h += '<button class="btn btn-xs" style="' + (_b2ShowSolo ? 'background:#10b981;color:#fff;border-color:#10b981' : 'border-color:#10b981;color:#10b981') + '" onclick="_b2ShowSolo=!_b2ShowSolo;document.getElementById(\'b2-content\').innerHTML=_b2GameView()">🎙️ 솔로 ' + soloPure.length + '명</button>';
  }
  h += '<button class="btn btn-xs no-export" style="border-color:#10b981;color:#10b981" onclick="saveGameImg(this)">📷 전체저장</button>';
  if (isLoggedIn) {
    h += '<button class="btn btn-xs no-export" style="background:#10b981;color:#fff;border-color:#10b981" onclick="openCrewCfgAddModal()">+ 크루 추가</button>';
    h += '<button class="btn btn-xs no-export" style="background:#059669;color:#fff;border-color:#059669" onclick="openCrewAddModal()">+ 크루원 추가</button>';
  }
  h += '</div></div>';

  if (!gamePlayers.length && !crewArr.length) {
    h += '<div style="text-align:center;padding:60px 20px;color:var(--gray-l);background:var(--surface);border-radius:12px;border:2px dashed #10b98140">';
    h += '<div style="font-size:40px;margin-bottom:12px">🎮</div>';
    h += '<div style="font-weight:700;margin-bottom:6px">등록된 종합게임 스트리머가 없습니다</div>';
    if (isLoggedIn) h += '<div style="font-size:12px">스트리머 등록 시 gameType을 general로 설정하세요</div>';
    h += '</div></div>';
    return h;
  }

  // ── 전체목록 뷰 ──
  if (isListMode) {
    h += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(' + minW + 'px,1fr));gap:10px">';
    // gamePlayers(players 배열) 표시
    gamePlayers.forEach(function(p) {
      const col = p.crewName ? _gcCrew(p.crewName) : '#10b981';
      h += _crewMemberCard(p.name, p.photo, p.channelUrl, true, -1, col, p.crewName, p.crewRole||'');
    });
    // crewArr(순수 크루 멤버) 표시 - 중복 제거
    const gamePlayerNames = new Set(gamePlayers.map(p => p.name));
    crewArr.forEach(function(m, mi) {
      if (!gamePlayerNames.has(m.name)) {
        const col = m.crewName ? _gcCrew(m.crewName) : '#10b981';
        h += _crewMemberCard(m.name, m.photo, m.link, false, mi, col, m.crewName, m.role||'');
      }
    });
    h += '</div>';
    // 솔로 섹션 표시
    if (_b2ShowSolo && soloPure.length) h += _b2SoloSection(soloPure);
    h += '</div>';
    return h;
  }

  // ── 크루별 그리드 뷰 ──
  cfg.forEach(function(c, ci) {
    const members = getGameMembersOf(c.name);
    if (!members.total) return; // 이 크루에 종합게임 멤버 없으면 건너뜀
    const col = c.color || '#10b981';
    const bgAlpha = Math.round(((c.bgAlpha != null ? c.bgAlpha : 10) / 100) * 255).toString(16).padStart(2, '0');
    const labelAlpha = Math.round(((c.labelAlpha != null ? c.labelAlpha : 18) / 100) * 255).toString(16).padStart(2, '0');
    const bgStyle = c.bgImage
      ? 'background:url(' + JSON.stringify(c.bgImage) + ') center/cover no-repeat;'
      : 'background:' + col + labelAlpha + ';';
    const overlay = c.bgImage
      ? '<div style="position:absolute;inset:0;background:linear-gradient(135deg,' + col + bgAlpha + ' 0%,' + col + ' 100%);border-radius:12px 12px 0 0;pointer-events:none;z-index:1"></div>'
      : '';
    const safeName = c.name.replace(/\\/g,'\\\\').replace(/'/g,"\\'");
    const isCollapsed = _b2CrewCollapsed.has('game_' + c.name);

    h += '<div style="margin-bottom:18px;border-radius:12px;overflow:hidden;border:1.5px solid ' + col + '40;box-shadow:0 2px 12px ' + col + '22">';
    h += '<div style="position:relative;padding:14px 18px;' + bgStyle + 'min-height:56px;display:flex;align-items:center;gap:12px">';
    h += overlay;
    h += '<div style="position:relative;flex-shrink:0">';
    if (c.logo) {
      h += '<img src="' + c.logo + '" style="width:42px;height:42px;border-radius:50%;object-fit:cover;border:2px solid #fff8" onerror="this.style.display=\'none\'">';
    } else {
      h += '<div style="width:42px;height:42px;border-radius:50%;background:#fff3;display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:900;color:#fff;border:2px solid #fff5">' + (c.name||'?')[0] + '</div>';
    }
    h += '</div>';
    h += '<div style="position:relative;flex:1;min-width:0">';
    h += '<div style="font-size:16px;font-weight:900;color:#fff;text-shadow:0 1px 4px #0006">' + c.name + '</div>';
    h += '<div style="font-size:11px;color:#ffffffcc">' + members.total + '명' + (c.desc ? ' · ' + c.desc : '') + '</div>';
    h += '</div>';
    h += '<div class="no-export" style="position:relative;display:flex;gap:4px;align-items:center">';
    h += '<button class="btn btn-xs" style="background:#ffffff22;color:#fff;border-color:#ffffff44;font-size:11px;padding:2px 6px;z-index:1000;position:relative" onclick="event.stopPropagation();_b2CrewCollapsed[' + (isCollapsed ? 'delete' : 'add') + '](' + "'game_" + safeName + "'" + ');document.getElementById(\'b2-content\').innerHTML=_b2GameView()" title="' + (isCollapsed ? '펼치기' : '접기') + '">' + (isCollapsed ? '▶' : '▼') + '</button>';
    h += '</div>';
    h += '</div>';

    if (!isCollapsed) {
      const cardBgAlpha = Math.round(((c.cardAlpha != null ? c.cardAlpha : 8) / 100) * 255).toString(16).padStart(2, '0');
      h += '<div style="background:' + col + cardBgAlpha + ';padding:14px">';
      h += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(' + minW + 'px,1fr));gap:10px">';
      members.sc.forEach(function(p) { h += _crewMemberCard(p.name, p.photo, p.channelUrl, true, -1, col, p.crewName, p.crewRole||''); });
      members.pure.forEach(function(m) {
        const realIdx = crewArr.findIndex(function(x) { return x === m; });
        h += _crewMemberCard(m.name, m.photo, m.link, false, realIdx, col, m.crewName, m.crewRole||'');
      });
      h += '</div></div>';
    }
    h += '</div>';
  });

  // 크루 없는 종합게임 선수 (솔로 토글과 연결)
  if (_b2ShowSolo && (noCrewGame.length || unassignedGame.length)) {
    const soloList = [...noCrewGame, ...unassignedGame];
    h += '<div style="margin-bottom:18px;border-radius:12px;overflow:hidden;border:1.5px solid #10b98140">';
    h += '<div style="padding:12px 16px;background:linear-gradient(135deg,#10b98120,#05966915);display:flex;align-items:center;gap:8px;border-bottom:1px solid #10b98120">';
    h += '<span style="font-size:14px;font-weight:900;color:#10b981">🎮 미배정</span>';
    h += '<span style="font-size:11px;color:var(--gray-l)">크루 미소속 ' + soloList.length + '명</span>';
    h += '</div>';
    h += '<div style="padding:14px;background:var(--white)">';
    h += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(' + minW + 'px,1fr));gap:10px">';
    soloList.forEach(function(p) { h += _crewMemberCard(p.name, p.photo, p.channelUrl, true, -1, '#10b981', '', p.crewRole||''); });
    h += '</div></div></div>';
  }

  h += '</div>';
  return h;
}

async function saveGameImg(btn) {
  if (btn) { btn.disabled = true; btn.textContent = '저장 중...'; }
  const PAD = 24;
  const CARD_W = 720;
  const tmpDiv = document.createElement('div');
  tmpDiv.style.cssText = `position:fixed;left:-9999px;top:0;padding:${PAD}px;background:#f0f2f5;box-sizing:border-box;width:${CARD_W + PAD * 2}px`;
  tmpDiv.innerHTML = _b2GameView();
  // no-export 요소 숨기기
  tmpDiv.querySelectorAll('.no-export').forEach(el => { el.style.display = 'none'; });
  document.body.appendChild(tmpDiv);
  await new Promise(r => setTimeout(r, 100));
  injectUnivIcons(tmpDiv);
  const h = tmpDiv.scrollHeight + 32;
  const w = tmpDiv.scrollWidth;
  const fname = '종합게임_' + new Date().toISOString().slice(0,10) + '.png';
  try {
    if (typeof _captureAndSave !== 'function') throw new Error('이미지 저장 함수를 찾을 수 없습니다.');
    await _captureAndSave(tmpDiv, w, h, fname);
  } catch(e) { alert('저장 실패: ' + e.message); }
  finally {
    document.body.removeChild(tmpDiv);
    if (btn) { btn.disabled = false; btn.textContent = '📷 전체저장'; }
  }
}

/* ══════════════════════════════════════
   👤 프로필 뷰 — 좌측 메인 디스플레이 + 우측 그리드
════════════════════════════════════════ */

// 프로필 탭에서 선택한 선수 이름 저장/로드
const savedSelectedPlayerName = localStorage.getItem('su_b2SelectedPlayer');
if (savedSelectedPlayerName) {
  const savedPlayer = players.find(p => p.name === savedSelectedPlayerName);
  if (savedPlayer && !savedPlayer.hidden && !savedPlayer.retired) {
    _b2SelectedPlayer = savedPlayer;
  }
}

function _b2PlayersView() {
  const dissolvedUnivs = typeof univCfg !== 'undefined' ? new Set((univCfg.filter(u => u.dissolved) || []).map(u => u.name)) : new Set();
  const visPlayers = players.filter(p => !p.hidden && !p.retired && !p.hideFromBoard && !dissolvedUnivs.has(p.univ));
  
  // 대학 필터링
  const univFilteredPlayers = _b2PlayersUnivFilter === '전체' 
    ? visPlayers 
    : visPlayers.filter(p => p.univ === _b2PlayersUnivFilter);
  
  // 종족 필터링
  const filteredPlayers = _b2PlayersFilter === 'all'
    ? univFilteredPlayers
    : univFilteredPlayers.filter(p => p.race === _b2PlayersFilter);

  // 티어 미정(미확인) 필터링
  const tierFilteredPlayers = filteredPlayers.filter(p => p.tier && p.tier !== '?' && p.tier !== '미정' && p.tier !== '미확인');

  if (!tierFilteredPlayers.length) {
    return `<div style="text-align:center;padding:60px 20px;color:var(--gray-l)">
      <div style="font-size:48px;margin-bottom:12px">👤</div>
      <div style="font-weight:700">표시할 선수가 없습니다</div>
    </div>`;
  }

  // 기본 선택 선수
  // - _b2SelectedPlayer가 null이면 첫 번째 선수로 초기화
  // - 필터 변경으로 현재 선택 선수가 목록에서 사라지면 첫 번째 선수로 대체
  if (!_b2SelectedPlayer) {
    _b2SelectedPlayer = tierFilteredPlayers[0];
  } else if (!tierFilteredPlayers.find(p => p.name === _b2SelectedPlayer.name)) {
    _b2SelectedPlayer = tierFilteredPlayers[0];
  }

  // 대학 목록 (필터용) - dissolved 대학 제외
  const univList = [...new Set(visPlayers.map(p => p.univ).filter(u => u && u !== '무소속'))];
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
    return (a.name || '').localeCompare(b.name || '');
  });

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
  const leftSize = layoutSettings.rightSize || layoutSettings.leftSize || 55;
  const pcHeight = layoutSettings.pcHeight || 600;
  const mobileHeight = layoutSettings.mobileHeight || 320;
  const tabletHeight = layoutSettings.tabletHeight || 400;
  
  let h = `
    <style>
      .b2-players-wrapper {
        display: flex;
        gap: 24px;
        height: calc(100vh - 140px);
        min-height: ${pcHeight}px;
      }
      .b2-players-main {
        flex: 0 0 ${leftSize}%;
        position: relative;
      }
      ${autoResize ? `
      @media (min-width: 1400px) {
        .b2-players-main {
          flex: 0 0 ${leftSize - 5}%;
        }
      }
      @media (min-width: 1200px) and (max-width: 1399px) {
        .b2-players-main {
          flex: 0 0 ${leftSize - 3}%;
        }
      }
      @media (min-width: 1025px) and (max-width: 1199px) {
        .b2-players-main {
          flex: 0 0 ${leftSize}%;
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
        box-shadow: 0 20px 50px rgba(0,0,0,0.3), 0 0 30px ${theme.glow};
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
        padding: 30px;
        background: linear-gradient(to top, rgba(0,0,0,0.9), transparent);
        z-index: 2;
      }
      .b2-players-name {
        font-size: 36px;
        font-weight: 800;
        margin-bottom: 8px;
        color: #fff;
        text-shadow: 0 2px 8px rgba(0,0,0,0.8);
      }
      .b2-players-details {
        font-size: 14px;
        color: rgba(255,255,255,0.8);
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        align-items: center;
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
        font-size: 16px;
        font-weight: 800;
        margin-left: auto; /* 종족을 우측으로 */
      }
      .b2-players-grid-wrapper {
        flex: 1;
        background: rgba(255,255,255,0.05);
        backdrop-filter: blur(15px);
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 24px;
        padding: 20px;
        overflow-y: auto;
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
        grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
        gap: 14px;
      }
      @media (max-width: 1024px) {
        .b2-players-wrapper {
          flex-direction: column;
          height: auto;
          min-height: auto;
        }
        .b2-players-main {
          flex: 0 0 auto;
          width: 100%;
          height: 400px;
          min-height: 400px;
        }
        .b2-players-grid-wrapper {
          flex: 1;
          min-height: 300px;
        }
      }
      @media (max-width: 768px) {
        .b2-players-main {
          height: 350px;
          min-height: 350px;
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
        .b2-players-wrapper {
          flex-direction: column;
          height: auto;
          min-height: auto;
          gap: 14px;
        }
        .b2-players-main {
          flex: none;
          width: 100%;
          min-height: ${tabletHeight}px;
          height: clamp(${tabletHeight}px, 55vh, ${tabletHeight + 150}px);
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
  const hasPrimary = !!_b2SelectedPlayer.photo;
  const hasSecondary = !!_b2SelectedPlayer.secondProfileFile;
  
  h += `
    <div class="b2-players-main">
      <div class="b2-players-main-content" id="b2-players-main-box" style="--img-zoom:${imgSettings.zoom/100};--img-brightness:${imgSettings.brightness/100};--img-pos-x:${imgSettings.posX}px;--img-pos-y:${imgSettings.posY}px;">
        ${_b2SelectedPlayer.photo 
          ? `<img src="${_b2SelectedPlayer.photo}" class="b2-players-main-image" id="b2-main-img-1" alt="${_b2SelectedPlayer.name}" onload="_b2ScheduleImageSwap('${_b2SelectedPlayer.name.replace(/'/g,"\\'")}')" style="position:absolute;inset:0;width:100%;height:100%;min-width:100%;min-height:100%;z-index:1;opacity:1;transform:translate(var(--img-pos-x,0), var(--img-pos-y,0)) scale(var(--img-zoom,1));filter:brightness(var(--img-brightness,1))">`
          : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,0.05);font-size:64px;font-weight:900;color:rgba(255,255,255,0.2)">${(_b2SelectedPlayer.name||'?')[0]}</div>`
        }
        ${_b2SelectedPlayer.secondProfileFile ? `<img src="${_b2SelectedPlayer.secondProfileFile}" class="b2-players-main-image" id="b2-main-img-2" alt="${_b2SelectedPlayer.name} 2" style="position:absolute;inset:0;width:100%;height:100%;min-width:100%;min-height:100%;z-index:2;opacity:0;transform:translate(var(--img-pos-x,0), var(--img-pos-y,0)) scale(var(--img-zoom,1));filter:brightness(var(--img-brightness,1))">` : ''}
        
        ${isLoggedIn ? `
        <!-- 이미지 컨트롤 패널 -->
        <div class="b2-players-img-controls" id="b2-img-controls" style="display:none">
          <div class="b2-players-controls-title">🎨 이미지 설정</div>
          ${_b2BuildImageControlGroup(safeName, 'primary', '첫번째 이미지', hasPrimary)}
          ${_b2BuildImageControlGroup(safeName, 'secondary', '두번째 이미지', hasSecondary)}
        </div>
        
        <!-- 컨트롤 패널 토글 버튼 -->
        <button onclick="document.getElementById('b2-img-controls').style.display=document.getElementById('b2-img-controls').style.display==='none'?'block':'none'" style="position:absolute;top:16px;right:16px;z-index:11;padding:8px 12px;background:rgba(0,0,0,0.75);backdrop-filter:blur(10px);border-radius:8px;color:#fff;font-size:12px;font-weight:700;cursor:pointer;border:1px solid rgba(255,255,255,0.2)">⚙️ 설정</button>
        ` : ''}
        
        <div class="b2-players-info">
          <div class="b2-players-name">${_b2SelectedPlayer.name || '이름 없음'}</div>
          <div class="b2-players-details">
            <span class="b2-players-tier">${_b2SelectedPlayer.tier || '?'}티어</span>
            <span class="b2-players-race">${_b2SelectedPlayer.race === 'P' ? '프로토스' : _b2SelectedPlayer.race === 'T' ? '테란' : _b2SelectedPlayer.race === 'Z' ? '저그' : '종족미정'}</span>
            ${_b2SelectedPlayer.univ ? (() => {
              const uCfg = univCfg.find(x => x.name === _b2SelectedPlayer.univ) || {};
              const iconUrl = uCfg.icon || uCfg.img || UNIV_ICONS[_b2SelectedPlayer.univ] || '';
              return iconUrl 
                ? `<span style="display:flex;align-items:center;gap:8px"><img src="${iconUrl}" style="width:32px;height:32px;object-fit:contain;border-radius:6px" onerror="this.style.display='none'"><span>${_b2SelectedPlayer.univ}</span></span>`
                : `<span>🏫 ${_b2SelectedPlayer.univ}</span>`;
            })() : ''}
          </div>
          ${isLoggedIn ? `<button onclick="openB2ProfileEditModal('${_b2SelectedPlayer.name.replace(/'/g, "\\'")}')" style="margin-top:12px;padding:8px 16px;background:#fff;border:2px solid rgba(255,255,255,0.5);border-radius:20px;color:var(--text1);font-size:13px;font-weight:700;cursor:pointer;transition:all 0.3s ease;box-shadow:0 2px 8px rgba(0,0,0,0.2)" onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 4px 12px rgba(0,0,0,0.3)'" onmouseout="this.style.transform='';this.style.boxShadow='0 2px 8px rgba(0,0,0,0.2)'">✏️ 프로필 수정</button>` : ''}
        </div>
      </div>
    </div>
  `;

  // 우측 그리드
  h += `
    <div class="b2-players-grid-wrapper">
      <div class="b2-players-grid">
  `;

  tierFilteredPlayers.forEach(p => {
    const isActive = _b2SelectedPlayer && _b2SelectedPlayer.name === p.name;
    const playerColor = gc(p.univ) || '#6366f1';
    const playerTheme = {
      bg: hexToRgba(playerColor, 0.1),
      border: playerColor
    };
    
    h += `
      <div class="b2-players-card ${isActive ? 'active' : ''}" onclick="_b2UpdateMainDisplay('${p.name}')" style="width:140px;padding:12px;border-radius:12px;cursor:pointer;transition:all 0.2s ease;display:flex;flex-direction:column;align-items:center;gap:8px;background:var(--white);border:2px solid transparent;box-shadow:${isActive?'0 4px 12px '+playerTheme.glow:'0 1px 3px rgba(0,0,0,0.08)'}">
        ${p.photo
          ? `<img src="${p.photo}" class="b2-players-thumbnail" alt="${p.name}" style="width:116px;height:116px;border-radius:10px;object-fit:contain;display:block" onerror="console.warn('[프로필 탭] 썸네일 이미지 로드 실패:', this.src, '선수:', '${p.name||''}');this.style.display='none';this.nextElementSibling.style.display='flex'">
          <div class="b2-players-thumbnail" style="width:116px;height:116px;border-radius:10px;display:none;align-items:center;justify-content:center;background:${playerTheme.bg};font-size:48px;font-weight:900;color:${playerTheme.border}">${(p.name||'?')[0]}</div>`
          : `<div class="b2-players-thumbnail" style="width:116px;height:116px;border-radius:10px;display:flex;align-items:center;justify-content:center;background:${playerTheme.bg};font-size:48px;font-weight:900;color:${playerTheme.border}">${(p.name||'?')[0]}</div>`
        }
        <div class="b2-players-label" style="font-size:14px;font-weight:600;text-align:center;color:var(--text2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;width:100%">${p.name || '이름 없음'}</div>
      </div>
    `;
  });

  h += `
      </div>
    </div>
  `;

  h += `</div>`;

  return h;
}

// 이미지 설정 실시간 업데이트 함수
window._b2UpdateImgSetting = function(playerName, slot, key, val) {
  if (val === undefined) {
    val = key;
    key = slot;
    slot = 'primary';
  }
  const keyMap = { zoom: 'scale', fill: 'fit', posX: 'offsetX', posY: 'offsetY' };
  key = keyMap[key] || key;
  const s = _b2GetImgSettings(playerName, slot);
  const numVal = parseInt(val, 10);
  s[key] = isNaN(numVal) ? val : numVal;
  s.zoom = s.scale;
  s.fill = s.fit;
  s.posX = s.offsetX;
  s.posY = s.offsetY;
  _b2SaveImgSettings();
  
  // 슬라이더/버튼 클릭 시에만 컨트롤 UI 업데이트
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
  
  // 이미지에 즉시 적용
  _b2ApplyImgSettingsToDom(playerName, slot);
};

// 이미지 위치 이동 함수
window._b2MoveImg = function(playerName, slot, dx, dy) {
  if (dy === undefined) {
    dy = dx;
    dx = slot;
    slot = 'primary';
  }
  const s = _b2GetImgSettings(playerName, slot);
  s.offsetX += dx;
  s.offsetY += dy;
  s.posX = s.offsetX;
  s.posY = s.offsetY;
  _b2SaveImgSettings();
  
  // 직접 offset 값 표시 업데이트
  const prefix = _b2GetImgControlPrefix(slot);
  const offsetEl = document.getElementById(`${prefix}-offset-val`);
  if (offsetEl) offsetEl.textContent = `${s.offsetX}px, ${s.offsetY}px`;
  
  // 이미지에 즉시 적용
  _b2ApplyImgSettingsToDom(playerName, slot);
};

function _b2UpdateMainDisplay(playerName) {
  const player = players.find(p => p.name === playerName);
  if (!player) return;
  
  _b2SelectedPlayer = player;
  localStorage.setItem('su_b2SelectedPlayer', playerName);
  
  const hexToRgba=(h,a)=>{const r=parseInt(h.slice(1,3),16),g=parseInt(h.slice(3,5),16),b=parseInt(h.slice(5,7),16);return`rgba(${r},${g},${b},${a})`;};
  const univColor = gc(player.univ) || '#6366f1';
  const bgAlpha = (b2ProfileBgAlpha || 10) / 100;
  const theme = {
    glow: hexToRgba(univColor, 0.3),
    bg: hexToRgba(univColor, bgAlpha),
    border: univColor
  };
  
  // 메인 디스플레이 업데이트
  const mainBox = document.getElementById('b2-players-main-box');
  const imgSettings = _b2GetImgSettings(player.name);
  const primarySettings = _b2GetImgSettings(player.name, 'primary');
  const secondarySettings = _b2GetImgSettings(player.name, 'secondary');
  const hasSecondProfile = !!(player.secondProfileFile && player.secondProfileFile.length > 0);

  const safeName = (player.name || '').replace(/\\/g, '\\\\').replace(/'/g, "\\'");
  const hasPrimary = !!player.photo;
  const hasSecondary = !!player.secondProfileFile;
  
  if (mainBox) {
    _b2ClearSwapTimer(mainBox);
    mainBox.innerHTML = `
      ${player.photo
        ? `<img src="${player.photo}" class="b2-players-main-image" id="b2-main-img-1" alt="${player.name}" onload="_b2ScheduleImageSwap('${player.name.replace(/'/g, "\\'")}')" style="position:absolute;inset:0;width:100%;height:100%;min-width:100%;min-height:100%;z-index:1;opacity:1" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`
        : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,0.05);font-size:64px;font-weight:900;color:rgba(255,255,255,0.2)">${(player.name||'?')[0]}</div>`
      }
      ${hasSecondProfile ? `<img src="${player.secondProfileFile}" class="b2-players-main-image" id="b2-main-img-2" alt="${player.name} 2" style="position:absolute;inset:0;width:100%;height:100%;min-width:100%;min-height:100%;z-index:2;opacity:0">` : ''}
      
      ${isLoggedIn ? `
      <!-- 이미지 컨트롤 패널 -->
      <div class="b2-players-img-controls" id="b2-img-controls" style="display:none">
        <div class="b2-players-controls-title">🎨 이미지 설정</div>
        ${_b2BuildImageControlGroup(safeName, 'primary', '첫번째 이미지', hasPrimary)}
        ${_b2BuildImageControlGroup(safeName, 'secondary', '두번째 이미지', hasSecondary)}
      </div>
      
      <!-- 컨트롤 패널 토글 버튼 -->
      <button onclick="document.getElementById('b2-img-controls').style.display=document.getElementById('b2-img-controls').style.display==='none'?'block':'none'" style="position:absolute;top:16px;right:16px;z-index:11;padding:8px 12px;background:rgba(0,0,0,0.75);backdrop-filter:blur(10px);border-radius:8px;color:#fff;font-size:12px;font-weight:700;cursor:pointer;border:1px solid rgba(255,255,255,0.2)">⚙️ 설정</button>
      ` : ''}
      
      <div class="b2-players-info">
        <div class="b2-players-name">${player.name || '이름 없음'}</div>
        <div class="b2-players-details">
          <span class="b2-players-tier" style="background:${theme.border}">${player.tier || '?'}티어</span>
          <span class="b2-players-race">${player.race === 'P' ? '프로토스' : player.race === 'T' ? '테란' : player.race === 'Z' ? '저그' : '종족미정'}</span>
          ${player.univ ? (() => {
            const uCfg = univCfg.find(x => x.name === player.univ) || {};
            const iconUrl = uCfg.icon || uCfg.img || UNIV_ICONS[player.univ] || '';
            return iconUrl
              ? `<span style="display:flex;align-items:center;gap:8px"><img src="${iconUrl}" style="width:32px;height:32px;object-fit:contain;border-radius:6px" onerror="this.style.display='none'"><span>${player.univ}</span></span>`
              : `<span>🏫 ${player.univ}</span>`;
          })() : ''}
        </div>
        ${isLoggedIn ? `<button onclick="openB2ProfileEditModal('${player.name.replace(/'/g, "\\'")}')" style="margin-top:8px;padding:6px 12px;background:#fff;border:1px solid rgba(255,255,255,0.45);border-radius:12px;color:var(--text1);font-size:12px;font-weight:800;cursor:pointer;transition:all 0.15s ease" onmouseover="this.style.transform='translateY(-1px)'" onmouseout="this.style.transform=''">✏️ 프로필 수정</button>` : ''}
      </div>
    `;
    _b2ApplyImgSettingsToElement(document.getElementById('b2-main-img-1'), primarySettings);
    _b2ApplyImgSettingsToElement(document.getElementById('b2-main-img-2'), secondarySettings);
    _b2ScheduleImageSwap(player.name);
  }

  document.querySelectorAll('.b2-players-card').forEach(card => {
    card.classList.remove('active');
    const cardName = card.querySelector('.b2-players-label')?.textContent;
    const thumbnail = card.querySelector('.b2-players-thumbnail');
    if (cardName === playerName) {
      card.classList.add('active');
      if (thumbnail) {
        thumbnail.style.borderColor = theme.border;
        thumbnail.style.boxShadow = `0 8px 25px ${theme.glow}`;
      }
    } else if (thumbnail) {
      thumbnail.style.borderColor = 'transparent';
      thumbnail.style.boxShadow = 'none';
    }
  });
  return;

  if (mainBox) {
    mainBox.style.setProperty('--theme-glow', theme.glow);
    mainBox.style.setProperty('--theme-bg', theme.bg);
    mainBox.style.setProperty('--img-zoom', imgSettings.zoom / 100);
    mainBox.style.setProperty('--img-brightness', imgSettings.brightness / 100);
    mainBox.style.setProperty('--img-pos-x', imgSettings.posX + 'px');
    mainBox.style.setProperty('--img-pos-y', imgSettings.posY + 'px');
    
    // 기존 타이머 정리
    if (mainBox._videoTimeout) {
      clearTimeout(mainBox._videoTimeout);
      mainBox._videoTimeout = null;
    }
    
    const hasSecondProfile = player.secondProfileFile && player.secondProfileFile.length > 0;
    const ext = hasSecondProfile ? player.secondProfileFile.toLowerCase().split('.').pop() : '';
    const isGif = ext === 'gif';
    const isVideo = ['mp4', 'webm', 'mov', 'avi', 'mkv'].includes(ext);
    const isImage = ['jpg', 'jpeg', 'png', 'webp', 'bmp'].includes(ext);
    
    mainBox.innerHTML = `
      ${player.photo
        ? `<img src="${player.photo}" class="b2-players-main-image" id="b2-main-img-1" alt="${player.name}" style="position:absolute;inset:0;width:100%;height:100%;min-width:100%;min-height:100%;object-fit:${imgSettings.fill};object-position:center;z-index:1;opacity:1;transition:opacity 0.5s ease" onerror="console.warn('[프로필 탭] 메인 이미지 로드 실패:', this.src, '선수:', '${player.name||''}');this.style.display='none';this.nextElementSibling.style.display='flex'">
        <div style="width:100%;height:100%;display:none;align-items:center;justify-content:center;background:rgba(255,255,255,0.05);font-size:64px;font-weight:900;color:rgba(255,255,255,0.2)">${(player.name||'?')[0]}</div>`
        : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,0.05);font-size:64px;font-weight:900;color:rgba(255,255,255,0.2)">${(player.name||'?')[0]}</div>`
      }
      ${hasSecondProfile ? `<img src="${player.secondProfileFile}" class="b2-players-main-image" id="b2-main-img-2" alt="${player.name} 2" style="position:absolute;inset:0;width:100%;height:100%;min-width:100%;min-height:100%;object-fit:${imgSettings.fill};object-position:center;z-index:2;opacity:0;transition:opacity 0.5s ease">` : ''}
      <div class="b2-players-info">
        <div class="b2-players-name">${player.name || '이름 없음'}</div>
        <div class="b2-players-details">
          <span class="b2-players-tier" style="background:${theme.border}">${player.tier || '?'}티어</span>
          <span class="b2-players-race">${player.race === 'P' ? '프로토스' : player.race === 'T' ? '테란' : player.race === 'Z' ? '저그' : '종족미정'}</span>
          ${player.univ ? (() => {
            const uCfg = univCfg.find(x => x.name === player.univ) || {};
            const iconUrl = uCfg.icon || uCfg.img || UNIV_ICONS[player.univ] || '';
            return iconUrl 
              ? `<span style="display:flex;align-items:center;gap:8px"><img src="${iconUrl}" style="width:32px;height:32px;object-fit:contain;border-radius:6px" onerror="this.style.display='none'"><span>${player.univ}</span></span>`
              : `<span>🏫 ${player.univ}</span>`;
          })() : ''}
        </div>
        ${isLoggedIn ? `<button onclick="openB2ProfileEditModal('${player.name.replace(/'/g, "\\'")}')" style="margin-top:12px;padding:8px 16px;background:#fff;border:2px solid rgba(255,255,255,0.5);border-radius:20px;color:var(--text1);font-size:13px;font-weight:700;cursor:pointer;transition:all 0.3s ease;box-shadow:0 2px 8px rgba(0,0,0,0.2)" onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 4px 12px rgba(0,0,0,0.3)'" onmouseout="this.style.transform='';this.style.boxShadow='0 2px 8px rgba(0,0,0,0.2)'">✏️ 프로필 수정</button>` : ''}
      </div>
    `;
    
    // 1초 후 두번째 프로필 표시
    if (hasSecondProfile) {
      mainBox._videoTimeout = setTimeout(() => {
        const img1 = document.getElementById('b2-main-img-1');
        const img2 = document.getElementById('b2-main-img-2');
        if (img1) img1.style.opacity = '0';
        if (img2) img2.style.opacity = '1';
      }, 1000);
    }
  }
  
  // 활성 카드 스타일 업데이트
  document.querySelectorAll('.b2-players-card').forEach(card => {
    card.classList.remove('active');
    const cardName = card.querySelector('.b2-players-label')?.textContent;
    if (cardName === playerName) {
      card.classList.add('active');
      const thumbnail = card.querySelector('.b2-players-thumbnail');
      if (thumbnail) {
        thumbnail.style.borderColor = theme.border;
        thumbnail.style.boxShadow = `0 8px 25px ${theme.glow}`;
      }
    } else {
      const thumbnail = card.querySelector('.b2-players-thumbnail');
      if (thumbnail) {
        thumbnail.style.borderColor = 'transparent';
        thumbnail.style.boxShadow = 'none';
      }
    }
  });
}

function openB2ProfileEditModal(playerName) {
  const player = players.find(p => p.name === playerName);
  if (!player) return;

  const modal = document.createElement('div');
  modal.id = 'b2-profile-edit-modal';
  modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:10000';
  
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
          <input type="text" id="b2-ed-photo" value="${player.photo||''}" placeholder="https://... 이미지 URL 입력" style="flex:1;padding:8px 12px;border:1px solid var(--border2);border-radius:8px;font-size:13px">
          <span id="b2-ed-photo-preview-wrap" style="position:relative;width:40px;height:40px;border-radius:var(--su_profile_radius,50%);overflow:hidden;flex-shrink:0;background:#e2e8f0;border:2px solid var(--border);display:${player.photo&&!player.photo.startsWith('data:')?'inline-block':'none'}">
            <img id="b2-ed-photo-preview" src="${player.photo&&!player.photo.startsWith('data:')?player.photo:''}" style="width:40px;height:40px;object-fit:cover;display:block" onerror="this.style.display='none'">
          </span>
        </div>
        <div id="b2-ed-photo-warn" style="font-size:10px;color:${player.photo&&player.photo.startsWith('data:')?'#dc2626':'var(--gray-l)'};margin-top:4px">${player.photo&&player.photo.startsWith('data:')?'❌ base64 이미지 직접 입력 불가 — imgur.com 등에 업로드 후 URL 사용':'이미지 URL을 붙여넣으면 현황판 선수 카드에 프로필 사진이 표시됩니다.'}</div>
      </div>
      <div style="margin-bottom:16px">
        <label style="font-size:13px;font-weight:700;color:var(--text2);display:block;margin-bottom:6px">프로필 이미지 2 (모바일/교체용) <span style="font-size:10px;font-weight:400;color:var(--gray-l)">(1초 후 자동 교체)</span></label>
        <input type="text" id="b2-ed-second-profile" value="${player.secondProfileFile||''}" placeholder="https://... 이미지 URL 입력" style="width:100%;padding:8px 12px;border:1px solid var(--border2);border-radius:8px;font-size:13px">
        <div style="font-size:10px;color:var(--gray-l);margin-top:4px">스트리머 선택 후 1초 뒤 이 이미지로 자동 전환됩니다.</div>
      </div>
      <div style="display:flex;gap:8px;margin-top:20px">
        <button onclick="document.getElementById('b2-profile-edit-modal').remove()" style="flex:1;padding:10px 16px;background:var(--surface);border:1px solid var(--border2);border-radius:8px;color:var(--text2);font-size:13px;font-weight:600;cursor:pointer">취소</button>
        <button onclick="saveB2Profile('${player.name.replace(/'/g, "\\'")}')" style="flex:1;padding:10px 16px;background:var(--blue);border:1px solid var(--blue);border-radius:8px;color:#fff;font-size:13px;font-weight:600;cursor:pointer">저장</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
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
        img.src = v;
        img.style.display = 'block';
        if (wrap) wrap.style.display = 'inline-block';
      } else {
        if (wrap) wrap.style.display = 'none';
      }
    });
  }
}

function saveB2Profile(playerName) {
  const player = players.find(p => p.name === playerName);
  if (!player) return;
  
  const photoUrl = (document.getElementById('b2-ed-photo')?.value || '').trim();
  const secondProfileUrl = (document.getElementById('b2-ed-second-profile')?.value || '').trim();
  
  // base64 체크
  if (photoUrl && photoUrl.startsWith('data:')) {
    alert('❌ 프로필 사진에 base64 이미지(data:...)를 직접 붙여넣으면 Firebase 동기화가 실패합니다.\n\n이미지를 imgur.com, Discord 등에 업로드한 후 URL을 사용하세요.');
    return;
  }
  
  player.photo = photoUrl || undefined;
  player.secondProfileFile = secondProfileUrl || undefined;
  
  save();
  render();
  
  document.getElementById('b2-profile-edit-modal').remove();
  
  // 프로필 탭 업데이트
  if (_b2SelectedPlayer && _b2SelectedPlayer.name === playerName) {
    _b2UpdateMainDisplay(playerName);
  }
}
