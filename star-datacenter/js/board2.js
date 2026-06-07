/* ══════════════════════════════════════
   현황판 — 대학별 컬러블록 로스터 보드
   (구현황판 통합 포함)
══════════════════════════════════════ */

/* innerHTML로 삽입된 <script> 태그는 브라우저가 자동 실행하지 않으므로
   이 헬퍼로 추출해서 수동으로 실행합니다. */
function _b2InjectAndRunScripts(container) {
  const scripts = container.querySelectorAll('script');
  scripts.forEach(oldScript => {
    const newScript = document.createElement('script');
    if (oldScript.src) {
      newScript.src = oldScript.src;
    } else {
      newScript.textContent = oldScript.textContent;
    }
    oldScript.parentNode.replaceChild(newScript, oldScript);
  });
}

// (안정성) 일부 배포/캐시 상황에서 constants.js가 먼저 로드되지 않으면
// 상태 아이콘 헬퍼가 없어 오류가 날 수 있어, 최소 폴백을 준비합니다.
if (typeof window._siIsImg !== 'function') {
  window._siIsImg = function(v){ return typeof v==='string' && (v.startsWith('http') || v.startsWith('data:')); };
}
if (typeof window._siRender !== 'function') {
  window._siRender = function(emoji, size){
    size=size||'16px';
    if(!emoji) return '';
    if(window._siIsImg(emoji)) return `<img src="${emoji}" style="width:${size};height:${size};object-fit:contain;vertical-align:middle;flex-shrink:0" onerror="this.style.display='none'">`;
    return emoji;
  };
}

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
let _b2PlayersWeekBadge = true;  // 이번주 전적 뱃지 표시 여부
const _b2BgImageMeta = {};
let _b2AutoFitResizeBound = false;

function _b2LoadBgImageMeta(url, cb){
  try{
    const src = toHttpsUrl(url||'');
    if(!src){ cb && cb(null); return; }
    if(_b2BgImageMeta[src] && _b2BgImageMeta[src].w && _b2BgImageMeta[src].h){
      cb && cb(_b2BgImageMeta[src]);
      return;
    }
    const img = new Image();
    img.onload = function(){
      _b2BgImageMeta[src] = { w: img.naturalWidth||0, h: img.naturalHeight||0 };
      cb && cb(_b2BgImageMeta[src]);
    };
    img.onerror = function(){ cb && cb(null); };
    img.src = src;
  }catch(e){ cb && cb(null); }
}

function _b2ResolveBgAutoFit(mode, rect, meta){
  const rawMode = String(mode||'auto');
  if(rawMode==='cover' || rawMode==='contain' || rawMode==='fill') return rawMode;
  const vw = window.innerWidth || 1280;
  if(!rect || !rect.width || !rect.height) return vw <= 900 ? 'contain' : 'cover';
  if(!meta || !meta.w || !meta.h){
    if(vw <= 640 || rect.width < 300) return 'contain';
    return 'cover';
  }
  const boxRatio = rect.width / rect.height;
  const imgRatio = meta.w / meta.h;
  const diff = Math.abs(Math.log(imgRatio / boxRatio));
  if(vw <= 640) return diff > 0.32 ? 'contain' : 'cover';
  if(vw <= 1024) return diff > 0.3 ? 'contain' : 'cover';
  if(imgRatio > 1.78 || imgRatio < 0.64) return 'contain';
  return diff > 0.4 ? 'contain' : 'cover';
}

function _b2ResolveImgAutoFit(kind, mode, rect, meta){
  const rawMode = String(mode||'auto');
  if(rawMode==='cover' || rawMode==='contain' || rawMode==='fill') return rawMode;
  const vw = window.innerWidth || 1280;
  if(!rect || !rect.width || !rect.height){
    if(kind==='thumb') return vw <= 900 ? 'contain' : 'cover';
    if(kind==='crew') return vw <= 1024 ? 'contain' : 'cover';
    return vw <= 900 ? 'contain' : 'cover';
  }
  if(!meta || !meta.w || !meta.h){
    if(vw <= 640) return 'contain';
    if(kind==='thumb' && rect.width < 100) return 'contain';
    return 'cover';
  }
  const boxRatio = rect.width / rect.height;
  const imgRatio = meta.w / meta.h;
  const diff = Math.abs(Math.log(imgRatio / boxRatio));
  if(kind==='thumb'){
    if(vw <= 640) return diff > 0.24 ? 'contain' : 'cover';
    if(vw <= 1024) return diff > 0.22 ? 'contain' : 'cover';
    if(imgRatio > 1.32 || imgRatio < 0.76) return 'contain';
    return diff > 0.24 ? 'contain' : 'cover';
  }
  if(kind==='crew'){
    if(vw <= 640) return diff > 0.26 ? 'contain' : 'cover';
    if(vw <= 1024) return diff > 0.24 ? 'contain' : 'cover';
    if(imgRatio > 1.26 || imgRatio < 0.78) return 'contain';
    return diff > 0.27 ? 'contain' : 'cover';
  }
  return _b2ResolveBgAutoFit(mode, rect, meta);
}

function _b2ResolveImgAutoPosition(kind, fit, rect, meta){
  if(fit !== 'cover') return 'center center';
  const imgRatio = meta && meta.w && meta.h ? (meta.w / meta.h) : 1;
  const boxRatio = rect && rect.width && rect.height ? (rect.width / rect.height) : 1;
  if(!imgRatio || !boxRatio) return 'center center';
  const portraitPressure = boxRatio / imgRatio;
  if(kind === 'thumb'){
    if(portraitPressure > 1.25) return 'top center';
    return 'center center';
  }
  if(kind === 'crew'){
    if(portraitPressure > 1.9 && rect && rect.height >= 150) return 'bottom center';
    if(portraitPressure > 1.25) return 'top center';
    return 'center center';
  }
  if(kind === 'bg'){
    if(portraitPressure > 2.1 && rect && rect.height >= 260) return 'bottom center';
    if(portraitPressure > 1.35) return 'top center';
    return 'center center';
  }
  return 'center center';
}

function _b2ApplyBgAutoSizing(root){
  try{
    const scope = root || document;
    const els = [];
    if(scope && scope.matches && scope.matches('.b2-bg-layer[data-bg-size-mode]')) els.push(scope);
    if(scope && scope.querySelectorAll) els.push(...scope.querySelectorAll('.b2-bg-layer[data-bg-size-mode]'));
    els.forEach(el=>{
      const mode = el.getAttribute('data-bg-size-mode') || 'auto';
      const body = el.closest('.b2-bg-host') || el.parentElement;
      const rect = body && body.getBoundingClientRect ? body.getBoundingClientRect() : null;
      const src = el.getAttribute('data-bg-src') || '';
      _b2LoadBgImageMeta(src, (meta)=>{
        try{
          const resolved = _b2ResolveBgAutoFit(mode, rect, meta);
          el.style.backgroundSize = resolved;
          el.setAttribute('data-bg-size-resolved', resolved);
        }catch(e){}
      });
    });
    const imgs = [];
    if(scope && scope.matches && scope.matches('.b2-fit-auto[data-fit-kind]')) imgs.push(scope);
    if(scope && scope.querySelectorAll) imgs.push(...scope.querySelectorAll('.b2-fit-auto[data-fit-kind]'));
    imgs.forEach(el=>{
      const mode = el.getAttribute('data-fit-mode') || 'auto';
      const kind = el.getAttribute('data-fit-kind') || 'thumb';
      const rect = el.getBoundingClientRect ? el.getBoundingClientRect() : null;
      const src = el.currentSrc || el.getAttribute('src') || '';
      _b2LoadBgImageMeta(src, (meta)=>{
        try{
          const resolved = _b2ResolveImgAutoFit(kind, mode, rect, meta);
          el.style.objectFit = resolved;
          const pos = _b2ResolveImgAutoPosition(kind, resolved, rect, meta);
          el.style.objectPosition = pos;
          el.setAttribute('data-fit-resolved', resolved);
        }catch(e){}
      });
    });
  }catch(e){}
}

function _b2BindAutoFitResize(){
  if(_b2AutoFitResizeBound) return;
  _b2AutoFitResizeBound = true;
  const rerun = ()=>{
    try{
      const root = document.getElementById('b2-content');
      if(!root) return;
      requestAnimationFrame(()=>{
        _b2ApplyBgAutoSizing(root);
        try{
          if(_b2View === 'players' && _b2SelectedPlayer && typeof _b2ApplyImgSettingsToDom === 'function'){
            _b2ApplyImgSettingsToDom(_b2SelectedPlayer.name, 'primary');
            _b2ApplyImgSettingsToDom(_b2SelectedPlayer.name, 'secondary');
            if(typeof window._b2RefreshImageControls === 'function'){
              window._b2RefreshImageControls(_b2SelectedPlayer.name, 'primary');
              window._b2RefreshImageControls(_b2SelectedPlayer.name, 'secondary');
            }
          }
        }catch(e){}
      });
    }catch(e){}
  };
  window.addEventListener('resize', rerun);
  window.addEventListener('orientationchange', ()=>setTimeout(rerun, 80));
  document.addEventListener('visibilitychange', ()=>{
    if(document.visibilityState === 'visible') setTimeout(rerun, 60);
  });
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

// 현황판 표시용 대학 리스트
// - 해체된 대학은 항상 제외
// - 숨김(hidden) 대학은 로그인 여부와 무관하게 항상 제외 (요청: 원복)
function _b2VisUnivs() {
  // 해체(해제)된 대학도 현황판에서 제외
  return getAllUnivs().filter(u => !u.hidden && !u.dissolved);
}

function rBoard2(C, T) {
  try {
  T.innerText = '📊 현황판';

  // 대학명 정규화(공백/개행 때문에 소속된 멤버가 현황판에서 누락되는 현상 방지)
  const _normUnivName = (u)=>String(u||'').trim();

  const univList = _b2VisUnivs().filter(u => u.name !== '무소속');

  // 탭 버튼 스타일 헬퍼
  function _b2TabBtn(view, color, label) {
    const on = _b2View === view;
    // (요청사항) 티어 순위표 스타일(pill)로 통일
    return `<button class="pill ${on?'on':''}" style="flex-shrink:0;white-space:nowrap" onclick="_b2View='${view}';render();this.blur()">${label}</button>`;
  }

  // 잘못된 뷰 리셋 (삭제된 탭 or 로그인 필요 탭)
  if (_b2View === 'game' || _b2View === 'crew' || _b2View === 'activity' || _b2View === 'race' || _b2View === 'tierview') _b2View = 'univ';
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
  const dissolvedUnivs = typeof univCfg !== 'undefined' ? new Set((univCfg.filter(u => u.dissolved) || []).map(u => _normUnivName(u.name))) : new Set();
  const hiddenUnivs = typeof univCfg !== 'undefined' ? new Set((univCfg.filter(u => u.hidden) || []).map(u => _normUnivName(u.name))) : new Set();
  const visPlayers = players.filter(p => {
    const pu = _normUnivName(p?.univ);
    return !p.hidden && !p.retired && !p.hideFromBoard &&
      !dissolvedUnivs.has(pu) &&
      !hiddenUnivs.has(pu);
  });
  const playerUnivList = [...new Set(visPlayers.map(p => _normUnivName(p.univ)).filter(u => u && u !== '무소속'))];
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
  const _selBadge = (_b2PlayersUnivFilter && _b2PlayersUnivFilter!=='전체')
    ? `<button class="pill on" style="flex-shrink:0;white-space:nowrap;background:var(--blue);border-color:var(--blue);color:#fff"
        onclick="_b2PlayersUnivFilter='전체';document.getElementById('b2-content').innerHTML=_b2PlayersView();setTimeout(()=>{if(_b2SelectedPlayer)_b2UpdateMainDisplay(_b2SelectedPlayer.name)},0)">현재: ${_b2PlayersUnivFilter} ✕</button>`
    : '';
  const playerFilters = _b2View === 'players' ? `
    <div class="b2-nav-playerfilters" style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;flex-shrink:0">
      <div style="width:1px;height:24px;background:var(--border2);display:inline-block"></div>
      <div style="position:relative">
        <select id="b2-players-univ-sel" onchange="_b2PlayersUnivFilter=this.value;document.getElementById('b2-content').innerHTML=_b2PlayersView();setTimeout(()=>{if(_b2SelectedPlayer)_b2UpdateMainDisplay(_b2SelectedPlayer.name)},0)" style="padding:6px 28px 6px 12px;border-radius:20px;border:1px solid var(--border2);font-size:13px;background:var(--white);color:var(--text2);appearance:none;cursor:pointer">
          <option value="전체" ${_b2PlayersUnivFilter === '전체' ? 'selected' : ''}>🏫 전체 대학</option>
          ${playerUnivList.map(u => `<option value="${u}" ${_b2PlayersUnivFilter === u ? 'selected' : ''}>${u}</option>`).join('')}
        </select>
        <svg style="position:absolute;right:8px;top:50%;transform:translateY(-50%);pointer-events:none;color:var(--gray-l)" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m6 9 6 6 6-6"/></svg>
      </div>
      ${_selBadge}
      <div style="position:relative">
        <select id="b2-players-race-sel" onchange="_b2PlayersFilter=this.value;document.getElementById('b2-content').innerHTML=_b2PlayersView();setTimeout(()=>{if(_b2SelectedPlayer)_b2UpdateMainDisplay(_b2SelectedPlayer.name)},0)" style="padding:6px 28px 6px 12px;border-radius:20px;border:1px solid var(--border2);font-size:13px;background:var(--white);color:var(--text2);appearance:none;cursor:pointer">
          <option value="all" ${_b2PlayersFilter === 'all' ? 'selected' : ''}>🎮 전체 종족</option>
          <option value="P" ${_b2PlayersFilter === 'P' ? 'selected' : ''}>🔮 프로토스</option>
          <option value="T" ${_b2PlayersFilter === 'T' ? 'selected' : ''}>⚔️ 테란</option>
          <option value="Z" ${_b2PlayersFilter === 'Z' ? 'selected' : ''}>🦎 저그</option>
        </select>
        <svg style="position:absolute;right:8px;top:50%;transform:translateY(-50%);pointer-events:none;color:var(--gray-l)" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m6 9 6 6 6-6"/></svg>
      </div>
      <div style="position:relative">
        <select id="b2-players-tier-sel" onchange="_b2PlayersTierFilter=this.value;document.getElementById('b2-content').innerHTML=_b2PlayersView();setTimeout(()=>{if(_b2SelectedPlayer)_b2UpdateMainDisplay(_b2SelectedPlayer.name)},0)" style="padding:6px 28px 6px 12px;border-radius:20px;border:1px solid var(--border2);font-size:13px;background:var(--white);color:var(--text2);appearance:none;cursor:pointer">
          <option value="전체" ${_b2PlayersTierFilter==='전체'?'selected':''}>🏅 전체 티어</option>
          ${(typeof TIERS!=='undefined'?TIERS:[]).map(t=>`<option value="${t}" ${_b2PlayersTierFilter===t?'selected':''}>${t}티어</option>`).join('')}
        </select>
        <svg style="position:absolute;right:8px;top:50%;transform:translateY(-50%);pointer-events:none;color:var(--gray-l)" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m6 9 6 6 6-6"/></svg>
      </div>
      <button onclick="_b2PlayersWeekBadge=!_b2PlayersWeekBadge;render()" style="padding:6px 14px;border-radius:20px;border:1px solid var(--border2);font-size:13px;background:${_b2PlayersWeekBadge?'#f59e0b':'var(--white)'};color:${_b2PlayersWeekBadge?'#fff':'var(--text2)'};cursor:pointer;font-weight:700;transition:all .2s">🔥 이번주</button>
    </div>
  ` : '';
  const weeklyBtn = _b2TabBtn('weekly','#f59e0b', (typeof getTabLabel==='function'?getTabLabel('board2','weekly','📅 주간 브리핑'):'📅 주간 브리핑'));
  const oldBtn = isLoggedIn?_b2TabBtn('old','#64748b', (typeof getTabLabel==='function'?getTabLabel('board2','old','📊 구현황판'):'📊 구현황판')):'';
  const summaryBtn = _b2TabBtn('summary','#10b981', (typeof getTabLabel==='function'?getTabLabel('board2','summary','📊 요약'):'📊 요약'));
  const compareBtn = _b2TabBtn('compare','#ef4444', (typeof getTabLabel==='function'?getTabLabel('board2','compare','⚔️ 대학비교'):'⚔️ 대학비교'));
  const rankingBtn = _b2TabBtn('ranking','#f97316', (typeof getTabLabel==='function'?getTabLabel('board2','ranking','🥇 랭킹'):'🥇 랭킹'));
  const radarBtn   = _b2TabBtn('radar',  '#a855f7', (typeof getTabLabel==='function'?getTabLabel('board2','radar',  '🕸️ 레이더'):'🕸️ 레이더'));
  const heatmapBtn = _b2TabBtn('heatmap','#db2777', (typeof getTabLabel==='function'?getTabLabel('board2','heatmap','🗺️ 히트맵'):'🗺️ 히트맵'));
  const bubbleBtn  = _b2TabBtn('bubble','#0891b2',  (typeof getTabLabel==='function'?getTabLabel('board2','bubble','🌐 버블맵'):'🌐 버블맵'));
  // 우측 버튼: 펨코현황은 "전체 저장"만, 나머지는 기존 저장/기능 버튼
  const rightBtns = saveBar;
  const _navTight = _b2View === 'players' ? '#b2-nav.b2-nav-new { padding-top: 0; }' : '';

  const filterBar = `
    <style>
      #b2-nav.b2-nav-new { flex-wrap:nowrap; overflow-x:auto; -webkit-overflow-scrolling:touch; scrollbar-width:none; }
      #b2-nav.b2-nav-new::-webkit-scrollbar { display:none; }
      #rtitle { caret-color: transparent; }
      #rcont { caret-color: transparent; }
      #rcont input, #rcont textarea, #rcont [contenteditable="true"] { caret-color: auto; }
      ${_navTight}
    </style>
    <div id="b2-nav" class="b2-nav b2-nav-new">
      <div style="display:flex;align-items:center;gap:4px;flex-wrap:nowrap;flex-shrink:0">
        ${weeklyBtn}
        ${_b2TabBtn('femco','var(--blue)', (typeof getTabLabel==='function'?getTabLabel('board2','femco','🧩 펨코'):'🧩 펨코'))}
        ${_b2TabBtn('univ','var(--blue)',  (typeof getTabLabel==='function'?getTabLabel('board2','univ','🏟️ 대학별'):'🏟️ 대학별'))}
        ${_b2TabBtn('free','var(--blue)',  (typeof getTabLabel==='function'?getTabLabel('board2','free','🚶 무소속'):'🚶 무소속'))}
        ${_b2TabBtn('players','var(--purple)', (typeof getTabLabel==='function'?getTabLabel('board2','players',profileTabLabel):profileTabLabel))}
        ${heatmapBtn}
        ${bubbleBtn}
        <span style="width:1px;height:20px;background:var(--border2);display:inline-block;flex-shrink:0"></span>
        ${rankingBtn}
        ${radarBtn}
        ${oldBtn}
        <span style="width:1px;height:20px;background:var(--border2);display:inline-block;flex-shrink:0"></span>
        ${summaryBtn}
        ${compareBtn}
      </div>
      ${playerFilters}
      <span style="flex:1"></span>
      ${rightBtns}
    </div>
    <div id="b2-content"></div>`;

  C.innerHTML = filterBar;

  // 현황판 공통: 뷰 렌더 전에 화면에 표시될 플레이어 사진을 미리 로드
  const _b2PrewarmViewImages = () => {
    try {
      if (typeof prewarmImageUrls !== 'function') return;
      const _dissSet2 = new Set((typeof univCfg !== 'undefined' ? univCfg : []).filter(u=>u.dissolved||u.hidden).map(u=>String(u.name||'').trim()));
      const photoUrls = players
        .filter(p => !p.hidden && !p.retired && !p.hideFromBoard && !_dissSet2.has(String(p?.univ||'').trim()) && p.photo)
        .map(p => p.photo)
        .filter(Boolean);
      prewarmImageUrls(photoUrls, 80);
    } catch(e) {}
  };
  setTimeout(() => { try{ _b2PrewarmViewImages(); }catch(e){} }, 120);

  const sub = document.getElementById('b2-content');
  // (즉시 렌더링 - 로딩 중 메시지 제거)
  const _renderSub = () => {
    const sub = document.getElementById('b2-content');
    if(!sub) return;
    const _known = new Set(['univ','femco','free','players','summary','weekly','ranking','radar','compare','heatmap','bubble','old']);
    if(!_known.has(String(_b2View||''))) _b2View = 'univ';
    if (_b2View === 'univ') {
      sub.innerHTML = _b2UnivView();
      injectUnivIcons(sub);
      _b2BindAutoFitResize();
      setTimeout(() => { try{ _b2ApplyBgAutoSizing(sub); }catch(e){} }, 0);
      setTimeout(() => { try{ window._precacheVisibleImages && window._precacheVisibleImages(sub, 220); }catch(e){} }, 80);
    } else if (_b2View === 'femco') {
      sub.innerHTML = _b2FemcoView();
      injectUnivIcons(sub);
      setTimeout(() => { try{ window._precacheVisibleImages && window._precacheVisibleImages(sub, 260); }catch(e){} }, 80);
      requestAnimationFrame(() => {
        try{
          sub.querySelectorAll('.b2-femco-grid').forEach(g=>{ g.scrollLeft = 0; });
        }catch(e){
          console.warn('[rBoard] 펨코 그리드 스크롤 초기화 실패:', e.message);
        }
      });
    } else if (_b2View === 'free') {
      sub.innerHTML = _b2FreeView();
      injectUnivIcons(sub);
      setTimeout(() => { try{ window._precacheVisibleImages && window._precacheVisibleImages(sub, 180); }catch(e){} }, 80);
    } else if (_b2View === 'players') {
      sub.innerHTML = _b2PlayersView();
      _b2BindAutoFitResize();
      setTimeout(() => {
        try{
          if (_b2SelectedPlayer && typeof _b2ApplyImgSettingsToDom === 'function') {
            _b2ApplyImgSettingsToDom(_b2SelectedPlayer.name, 'primary');
            _b2ApplyImgSettingsToDom(_b2SelectedPlayer.name, 'secondary');
          }
          _b2ApplyBgAutoSizing(sub);
        }catch(e){
          console.error('[rBoard] 이미지 설정 적용 실패:', e.message);
        }
      }, 0);
      setTimeout(() => { try{ window._precacheVisibleImages && window._precacheVisibleImages(sub, 200); }catch(e){} }, 120);
    } else if (_b2View === 'summary') {
      sub.innerHTML = _b2SummaryView();
      injectUnivIcons && injectUnivIcons(sub);
    } else if (_b2View === 'weekly') {
      sub.innerHTML = _b2WeeklyBriefingView();
      injectUnivIcons && injectUnivIcons(sub);
      _b2InjectAndRunScripts(sub);
    } else if (_b2View === 'ranking') {
      sub.innerHTML = _b2RankingView();
      injectUnivIcons && injectUnivIcons(sub);
    } else if (_b2View === 'radar') {
      sub.innerHTML = _b2RadarView();
      _b2InjectAndRunScripts(sub);
    } else if (_b2View === 'compare') {
      sub.innerHTML = _b2CompareView();
      injectUnivIcons && injectUnivIcons(sub);
    } else if (_b2View === 'heatmap') {
      sub.innerHTML = _b2HeatmapView();
      _b2InjectAndRunScripts(sub);
    } else if (_b2View === 'bubble') {
      sub.innerHTML = _b2BubbleView();
      _b2InjectAndRunScripts(sub);
    } else if (_b2View === 'old') {
      if (typeof rBoard === 'function') {
        rBoard(sub, T);
      } else {
        sub.innerHTML = '<div style="padding:40px;text-align:center;color:var(--gray-l)">구현황판 로딩 중...</div>';
        (async()=>{
          try{
            if (typeof window._ensureCloudBoardLoaded === 'function') await window._ensureCloudBoardLoaded();
          }catch(e){}
          try{
            if (_b2View !== 'old') return;
            if (typeof rBoard === 'function') rBoard(sub, T);
            else sub.innerHTML = '<div style="padding:40px;text-align:center;color:var(--gray-l)">구현황판을 불러올 수 없습니다.</div>';
          }catch(e){
            sub.innerHTML = '<div style="padding:40px;text-align:center;color:#dc2626">구현황판 오류: '+String(e && e.message || e)+'</div>';
          }
        })();
      }
    }
  };
  try{
    _renderSub();
  }catch(e){
    console.error('[rBoard2] sub render fail', e);
    try{
      const sub = document.getElementById('b2-content');
      if(sub){
        sub.innerHTML = '<div style="padding:40px;text-align:center;color:#dc2626">현황판 렌더링 오류: ' + String(e && e.message || e) + '</div>';
      }
    }catch(_){}
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
  let univList = _b2VisUnivs().filter(u => u.name !== '무소속' && u.name);
  if (!univList.length) return `<div style="text-align:center;color:var(--text3);padding:40px">표시할 대학이 없습니다</div>`;
  // [FIX-UNIV-1] dissolved 대학 선수 제외 공통 필터
  const _dissSet = new Set((typeof univCfg !== 'undefined' ? univCfg : []).filter(u=>u.dissolved).map(u=>String(u.name||'').trim()));
  const _univNameSet = new Set(univList.map(u=>String(u&&u.name||'').trim()).filter(Boolean));
  const membersByUniv = {};
  const _allVis = [];
  (players||[]).forEach(p=>{
    const pu = String(p?.univ||'').trim();
    if(!_univNameSet.has(pu)) return;
    if(p.hidden || p.retired || p.hideFromBoard) return;
    if(_dissSet.has(pu)) return;
    _allVis.push(p);
    (membersByUniv[pu] || (membersByUniv[pu]=[])).push(p);
  });
  const _tierCts = {}; _allVis.forEach(p=>{ const t=p.tier||'?'; _tierCts[t]=(_tierCts[t]||0)+1; });
  // 이번주 활동 인원 계산
  const _uvNow = new Date(), _uvDay = _uvNow.getDay();
  const _uvMon = new Date(_uvNow); _uvMon.setDate(_uvNow.getDate()+(_uvDay===0?-6:1-_uvDay));
  const _uvFromN = parseInt(_uvMon.toISOString().slice(0,10).replace(/-/g,''));
  const _uvToN   = parseInt(_uvNow.toISOString().slice(0,10).replace(/-/g,''));
  const _uvDN = s => parseInt(String(s||'').replace(/[-\.]/g,''))||0;
  let _uvWeekActive=0, _uvTotalW=0, _uvTotalL=0;
  _allVis.forEach(p=>{
    let acted=false;
    (Array.isArray(p.history)?p.history:[]).forEach(h=>{
      if(h.result==='승')_uvTotalW++; else if(h.result==='패')_uvTotalL++;
      const d=_uvDN(h.date||h.d||'');
      if(d>=_uvFromN&&d<=_uvToN)acted=true;
    });
    if(acted)_uvWeekActive++;
  });
  const _uvTotalG=_uvTotalW+_uvTotalL;
  const _uvWr=_uvTotalG>0?Math.round(_uvTotalW/_uvTotalG*100):null;
  const _uvWrC=_uvWr===null?'#94a3b8':_uvWr>=60?'#10b981':_uvWr>=40?'#f59e0b':'#ef4444';
  const _uvRaces={P:0,T:0,Z:0};
  _allVis.forEach(p=>{ if(p.race in _uvRaces) _uvRaces[p.race]++; });
  const _uvRaceBar = ['P','T','Z'].map(r=>{
    const c={P:'#a855f7',T:'#3b82f6',Z:'#ef4444'}[r];
    const n={P:'🔮P',T:'⚔️T',Z:'🦎Z'}[r];
    return _uvRaces[r]>0?`<span style="font-size:11px;font-weight:700;color:${c}">${n}${_uvRaces[r]}</span>`:'';
  }).filter(Boolean).join('<span style="color:var(--border2);margin:0 2px">·</span>');
  const _jumpChips = univList.map(u=>{
    const cnt = (membersByUniv[String(u.name||'').trim()]||[]).length;
    const col = gc(u.name);
    const ucfg = (typeof univCfg!=='undefined'?univCfg:[]).find(x=>x.name===u.name);
    const iconUrl = ucfg?(ucfg.icon||ucfg.img||''):'';
    const iconEl = iconUrl?`<img src="${iconUrl}" style="width:14px;height:14px;object-fit:contain;border-radius:2px;flex-shrink:0" onerror="this.style.display='none'">`:`<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${col};flex-shrink:0"></span>`;
    const anchorId = 'b2-univ-anchor-'+u.name.replace(/[^a-zA-Z0-9가-힣]/g,'_');
    return `<button onclick="const el=document.getElementById('${anchorId}');if(el){el.scrollIntoView({behavior:'smooth',block:'start'});}" style="display:inline-flex;align-items:center;gap:4px;padding:2px 8px;border-radius:14px;border:1.5px solid ${col}44;background:${col}11;color:var(--text2);font-size:11px;font-weight:700;cursor:pointer;white-space:nowrap;flex-shrink:0">${iconEl}${u.name}<span style="color:var(--gray-l);font-weight:500"> ${cnt}</span></button>`;
  }).join('');
  const statsBar = `<div style="margin-bottom:10px">
    <div style="display:flex;align-items:center;gap:8px;padding:7px 14px;background:var(--surface);border:1px solid var(--border2);border-radius:10px 10px 0 0;flex-wrap:wrap">
      <span style="font-size:12px;font-weight:800;color:var(--text2)">👥 ${_allVis.length}명</span>
      <span style="width:1px;height:14px;background:var(--border2);display:inline-block"></span>
      <span style="font-size:12px;font-weight:800;color:var(--text2)">🏫 ${univList.length}개 대학</span>
      <span style="width:1px;height:14px;background:var(--border2);display:inline-block"></span>
      <span style="font-size:12px;font-weight:800;color:#f59e0b">🔥 이번주 ${_uvWeekActive}명 활동</span>
      ${_uvWr!==null?`<span style="font-size:12px;font-weight:800;color:${_uvWrC}">📊 통산 ${_uvWr}%</span>`:''}
      ${_uvRaceBar?`<span style="width:1px;height:14px;background:var(--border2);display:inline-block"></span>${_uvRaceBar}`:''}
      ${TIERS.filter(t=>_tierCts[t]).length?`<span style="width:1px;height:14px;background:var(--border2);display:inline-block"></span>${TIERS.filter(t=>_tierCts[t]).map(t=>`<span style="font-size:11px;font-weight:700;padding:1px 7px;border-radius:8px;background:${getTierBtnColor(t)};color:${getTierBtnTextColor(t)||'#fff'}">${t} ${_tierCts[t]}</span>`).join('')}`:''}
    </div>
    <div style="display:flex;align-items:center;gap:5px;padding:6px 14px;background:var(--white);border:1px solid var(--border2);border-top:none;border-radius:0 0 10px 10px;flex-wrap:wrap">
      <span style="font-size:10px;font-weight:700;color:var(--gray-l);flex-shrink:0;white-space:nowrap">바로가기 ›</span>
      ${_jumpChips}
    </div>
  </div>`;
  const _b2Cols = (typeof boardGridCols!=='undefined'&&boardGridCols===2) ? 'repeat(2,1fr)' : '1fr';
  let h = statsBar + `<style>.b2-bottom-img{max-width:130px;max-height:110px;object-fit:contain;}.b2-side-panel{float:right;width:230px;margin:0 0 6px 10px;border-radius:10px;padding:8px;box-sizing:border-box;}@media(min-width:769px) and (max-width:1024px){.b2-univ-grid{grid-template-columns:1fr!important;}.b2-side-panel{width:180px;}}@media(max-width:640px){.b2-side-panel{display:none!important;}.b2-bottom-img{display:none!important;}}@media(max-width:768px){.b2-univ-grid{grid-template-columns:1fr!important;}</style>`;
  h += `<div class="b2-univ-grid" style="display:grid;grid-template-columns:${_b2Cols};gap:12px;align-items:start">`;
  univList.forEach(u => {
    if (!u.name) {
      console.warn('[현황판] 대학 이름이 없는 데이터가 발견되었습니다:', u);
      return;
    }
    const members = membersByUniv[String(u.name||'').trim()] || [];
    const _anchorId = 'b2-univ-anchor-'+u.name.replace(/[^a-zA-Z0-9가-힣]/g,'_');
    h += `<div id="${_anchorId}" style="scroll-margin-top:56px">` + _b2UnivBlock(u.name, gc(u.name), members) + `</div>`;
  });
  h += `</div>`;
  return h;
}

/* ── 🧩 펨코현황 뷰 ──
   첨부 이미지처럼 "대학별 컬러 섹션 + 촘촘한 프로필 그리드" 형태로 렌더링
*/
function _b2FemcoView() {
  // ─────────────────────────────────────────────────────────────
  // 펨코현황 설정(단일 소스)
  // - settings.js의 _cfgFemcoDefaults/_cfgFemcoLoad/_cfgFemcoSave를 사용
  // - board2.js 내부 중복 defaults/load/save 제거(불일치 버그 방지)
  // ─────────────────────────────────────────────────────────────
  const femcoFallback = () => ({
    autoLayout: 1, logoSize: 150, logoPos: 'top', logoAttachTitle: 1, headGap: 10,
    logoOffsetX: 0, logoOffsetY: 0,
    titleSize: 28, titleFont: 'system', titlePos: 'top',
    titleOffsetX: 0, titleOffsetY: 0,
    playerImgSize: 46, playerImgShape: 'square',
    rowsPerCol: 5, colWidth: 170, colGap: 10, univGap: 18,
    countFontSize: 12, contentPadX: 16, contentAlign: 'left', contentOffsetX: 0,
    univSubtitles: {}, subtitleSize: 12, subtitleWeight: 800, subtitleColor: '',
    nameFontSize: 12, roleFontSize: 10, tierBadgeSize: 10, tierBadgePadX: 6,
    starSize: 15, statusIconSize: 18,
    bgOverlay: 0,
    univColorOverrides: {}, univBgMedia: {}
  });
  let femcoSettings = (typeof window._cfgFemcoLoad === 'function')
    ? window._cfgFemcoLoad()
    : (function(){ try{ return JSON.parse(localStorage.getItem('b2_femco_settings_v1')||'null') || femcoFallback(); }catch(e){ return femcoFallback(); } })();
  // 펨코현황 관련 설정 UI는 "설정 탭 > 이미지 관리 > 펨코현황"에서만 제공합니다.

  // 배경 미디어 열기(영상은 모달, 유튜브/트위치는 새창)
  // [FIX-FEMCO-3] 매 렌더마다 최신 설정 캡처하도록 항상 재할당
  window._b2FemcoOpenBgMedia = function(univName, url){
      const u = String(univName||'');
      const link = String(url||'').trim();
      if(!link) return;
      const low = link.toLowerCase();
      const isVideo = /\.(mp4|webm|ogg)(\?|#|$)/i.test(low);
      const isEmbed = /(youtube\.com|youtu\.be|twitch\.tv)/i.test(low);
      if(isEmbed){
        try{ window.open(link, '_blank', 'noopener'); }catch(e){ location.href = link; }
        return;
      }
      if(!isVideo){
        // 이미지/GIF는 새창
        try{ window.open(link, '_blank', 'noopener'); }catch(e){ location.href = link; }
        return;
      }
      // video modal (클릭 재생 정책)
      const existing = document.getElementById('b2-femco-bg-modal');
      if (existing) existing.remove();
      const ov = document.createElement('div');
      ov.id = 'b2-femco-bg-modal';
      ov.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.60);z-index:var(--z-modal-5);display:flex;align-items:center;justify-content:center;padding:16px';
      const safeTitle = (u||'영상').replace(/</g,'&lt;').replace(/>/g,'&gt;');
      ov.innerHTML = `
        <div style="width:min(980px,96vw);background:var(--white);border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,.16);box-shadow:0 18px 60px rgba(0,0,0,.35)">
          <div style="display:flex;align-items:center;gap:10px;padding:12px 14px;background:linear-gradient(to bottom, rgba(255,255,255,.95), rgba(255,255,255,.85));border-bottom:1px solid var(--border)">
            <div style="font-weight:1000;color:var(--text2)">🎞️ ${safeTitle} 배경 영상</div>
            <span style="color:var(--gray-l);font-size:12px">클릭해서 재생됩니다</span>
            <button style="margin-left:auto;border:1px solid var(--border);background:var(--surface);border-radius:10px;padding:6px 10px;cursor:pointer;font-weight:1000" onclick="document.getElementById('b2-femco-bg-modal')?.remove()">닫기</button>
          </div>
          <div style="padding:12px 14px">
            <video src="${link}" controls playsinline style="width:100%;max-height:72vh;border-radius:12px;background:#000"></video>
          </div>
        </div>
      `;
      ov.addEventListener('click', (e)=>{ if(e.target===ov) ov.remove(); });
      document.body.appendChild(ov);
  };

  // (요청사항) 무소속도 배경 설정/표시 가능
  const univList = _b2VisUnivs().filter(u => u.name);
  if (!univList.length) return `<div style="text-align:center;color:var(--text3);padding:40px">표시할 대학이 없습니다</div>`;

  // univCfg 순서로 정렬 (없으면 이름순)
  if (typeof univCfg !== 'undefined' && univCfg.length) {
    univList.sort((a, b) => {
      const ia = univCfg.findIndex(u => u.name === a.name);
      const ib = univCfg.findIndex(u => u.name === b.name);
      return (ia >= 0 ? ia : 999) - (ib >= 0 ? ib : 999);
    });
  } else {
    univList.sort((a, b) => (a.name || '').localeCompare(b.name || '', 'ko', {sensitivity:'base'}));
  }

  // 표시 대상 선수(현황판 기준과 동일하게 숨김/은퇴/현황판숨김 제외)
  // [FIX-FEMCO-4] membersByUniv 수집 시 dissolved 선수 제외
  const _femcoDissSet = new Set((typeof univCfg !== 'undefined' ? univCfg : []).filter(u=>u.dissolved).map(u=>String(u.name||'').trim()));
  const membersByUniv = {};
  univList.forEach(u => {
    membersByUniv[u.name] = players.filter(p =>
      String(p?.univ||'').trim() === String(u.name||'').trim()
      && !p.hidden && !p.retired && !p.hideFromBoard
      && !_femcoDissSet.has(String(p?.univ||'').trim())
    );
  });

  // 공통 로고 크기(기본)
  const LOGO = Math.max(60, Math.min(520, parseInt(femcoSettings.logoSize || 150, 10) || 150));
  const LOGO_OFF_X = Math.max(-120, Math.min(120, parseInt(femcoSettings.logoOffsetX ?? 0, 10) || 0));
  const LOGO_OFF_Y = Math.max(-120, Math.min(120, parseInt(femcoSettings.logoOffsetY ?? 0, 10) || 0));
  const TITLE_OFF_X = Math.max(-120, Math.min(120, parseInt(femcoSettings.titleOffsetX ?? 0, 10) || 0));
  const TITLE_OFF_Y = Math.max(-120, Math.min(120, parseInt(femcoSettings.titleOffsetY ?? 0, 10) || 0));
  const BG_OVERLAY = Math.max(0, Math.min(70, parseInt(femcoSettings.bgOverlay ?? 0, 10))); // [FIX-FEMCO-1] bgOverlay=0 올바르게 처리
  const OV_TOP = (BG_OVERLAY/70) * 0.22; // 0 → 0.22
  const OV_BOT = (BG_OVERLAY/70) * 0.52; // 0 → 0.52
  const titleSize = Math.max(16, Math.min(44, parseInt(femcoSettings.titleSize || 28, 10) || 28));
  const playerImgSize = Math.max(28, Math.min(90, parseInt(femcoSettings.playerImgSize || 46, 10) || 46));
  const playerRadius = femcoSettings.playerImgShape === 'circle' ? '50%' : '10px';
  const rowsPerCol = Math.max(2, Math.min(12, parseInt(femcoSettings.rowsPerCol || 5, 10) || 5));
  const colWidth = Math.max(80, Math.min(360, parseInt(femcoSettings.colWidth || 170, 10) || 170));
  const rowGap = Math.max(0, Math.min(28, parseInt(femcoSettings.colGap || 10, 10) || 10)); // UI에서 '상하 간격'
  const colGap = 10; // 가로(컬럼) 간격은 고정(너무 벌어지지 않게)
  const univGap = Math.max(0, Math.min(120, parseInt(femcoSettings.univGap || 18, 10) || 18));
  const countFontSize = Math.max(10, Math.min(18, parseInt(femcoSettings.countFontSize || 12, 10) || 12));
  const contentPadX = Math.max(0, Math.min(40, parseInt(femcoSettings.contentPadX || 16, 10) || 16));
  const contentAlign = (femcoSettings.contentAlign === 'left' || femcoSettings.contentAlign === 'center') ? femcoSettings.contentAlign : 'left';
  const contentOffsetX = Math.max(-40, Math.min(40, parseInt(femcoSettings.contentOffsetX || 0, 10) || 0));
  const headGap = Math.max(0, Math.min(80, parseInt(femcoSettings.headGap || 10, 10) || 10));
  const autoLayout = !(femcoSettings.autoLayout === 0 || femcoSettings.autoLayout === false);
  const vw = (typeof window !== 'undefined') ? (document.documentElement.clientWidth || window.innerWidth || 1280) : 1280; // [FIX-VW] clientWidth 우선, fallback 통일

  const _padL = Math.max(0, Math.min(80, contentPadX + contentOffsetX));
  const _padR = Math.max(0, Math.min(80, contentPadX - contentOffsetX));

  function _autoLayoutForCount(cnt){
    // 인원수 + 화면폭 기준으로 "좌측부터 보기 좋은" 기본값 산출
    let rows = 5;
    if (cnt >= 55) rows = 9;
    else if (cnt >= 45) rows = 8;
    else if (cnt >= 35) rows = 7;
    else if (cnt >= 25) rows = 6;
    else rows = 5;

    let cw = 175;
    if (vw <= 520) { rows = Math.max(rows, 8); cw = 150; }
    else if (vw <= 768) { rows = Math.max(rows, 7); cw = 160; }
    else if (vw <= 1024) { rows = Math.max(rows, 6); cw = 170; }
    else { cw = (cnt >= 45) ? 160 : 175; }

    rows = Math.max(4, Math.min(12, rows));
    cw = Math.max(130, Math.min(220, cw));
    return {rowsPerCol: rows, colWidth: cw};
  }
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
      case 'app': return `var(--app-font)`;
      case 'noto': return `'Noto Sans KR', system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif`;
      case 'pretendard': return `'Pretendard Variable', Pretendard, system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif`;
      case 'nanum': return `'Nanum Gothic', 'Noto Sans KR', system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif`;
      case 'gmarket': return `'GmarketSans', 'Noto Sans KR', system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif`;
      default: return `system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif`;
    }
  })();

  // 타이틀 폰트가 CDN 폰트인 경우, 필요한 CSS를 1회 주입(전역 폰트와 별개)
  (function(){
    const head = document.head || document.getElementsByTagName('head')[0];
    if(!head) return;
    const ensure = (id, href) => {
      if(!href){ const el=document.getElementById(id); if(el) el.remove(); return; }
      let el=document.getElementById(id);
      if(!el){ el=document.createElement('link'); el.id=id; el.rel='stylesheet'; head.appendChild(el); }
      el.href=href;
    };
    const cssMap = {
      noto: 'https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;700;900&display=swap',
      pretendard: 'https://cdn.jsdelivr.net/gh/orioncactus/pretendard@latest/dist/web/variable/pretendardvariable.css',
      nanum: 'https://fonts.googleapis.com/css2?family=Nanum+Gothic:wght@400;700;800&display=swap',
      gmarket: 'https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_2001@1.1/GmarketSans.css',
    };
    const key = femcoSettings.titleFont;
    ensure('femco-titlefont-css', cssMap[key] || '');
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

  // (요청) 종족 표기: T / P / Z
  const raceLabel = (p) => p.race === 'P' ? 'P' : p.race === 'T' ? 'T' : p.race === 'Z' ? 'Z' : '?';
  // 종족 색상: 기본 팔레트 + 대학색상(col)과 살짝 블렌딩(대학마다 다르게 보이도록)
  // + 흰 배경(라벨 pill)에서 잘 보이도록 최소 대비 확보
  const _hexToRgb = (hex) => {
    const h = String(hex||'').replace('#','').trim();
    if(h.length < 6) return null;
    const r = parseInt(h.slice(0,2),16), g = parseInt(h.slice(2,4),16), b = parseInt(h.slice(4,6),16);
    if([r,g,b].some(v=>Number.isNaN(v))) return null;
    return {r,g,b};
  };
  const _rgbToHex = (r,g,b) => '#' + [r,g,b].map(v=>Math.max(0,Math.min(255,Math.round(v))).toString(16).padStart(2,'0')).join('');
  const _mixHex = (a,b,t) => {
    const A=_hexToRgb(a), B=_hexToRgb(b);
    if(!A||!B) return a || b || '#94a3b8';
    const tt=Math.max(0,Math.min(1, +t||0));
    return _rgbToHex(A.r*(1-tt)+B.r*tt, A.g*(1-tt)+B.g*tt, A.b*(1-tt)+B.b*tt);
  };
  const _relLum = (hex) => {
    const c=_hexToRgb(hex); if(!c) return 0;
    const f = (v)=>{ v/=255; return v<=0.03928? v/12.92 : Math.pow((v+0.055)/1.055, 2.4); };
    const R=f(c.r), G=f(c.g), B=f(c.b);
    return 0.2126*R + 0.7152*G + 0.0722*B;
  };
  const _contrast = (a,b) => {
    const L1=_relLum(a), L2=_relLum(b);
    const hi=Math.max(L1,L2), lo=Math.min(L1,L2);
    return (hi+0.05)/(lo+0.05);
  };
  const _ensureOnWhite = (hex, min=3.0) => {
    let c = hex || '#94a3b8';
    // 흰색 배경 기준 대비가 부족하면 점점 어둡게(검정쪽으로 블렌딩)
    if(_contrast(c,'#ffffff') >= min) return c;
    const steps=[0.25,0.40,0.55,0.70];
    for(const t of steps){
      const d = _mixHex(c, '#0f172a', t);
      if(_contrast(d,'#ffffff') >= min) return d;
    }
    return _mixHex(c, '#0f172a', 0.75);
  };
  const raceColor = (p, univCol) => {
    const base = p.race === 'P' ? '#c084fc' : p.race === 'T' ? '#38bdf8' : p.race === 'Z' ? '#34d399' : '#94a3b8';
    const themed = univCol ? _mixHex(base, univCol, 0.22) : base;
    return _ensureOnWhite(themed, 3.0);
  };

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
      // [FIX-FEMCO-2] statusIconSize=0이면 아이콘 숨김
      const _rawIconSize = parseInt(femcoSettings.statusIconSize ?? 18, 10);
      const badgeSize = _rawIconSize === 0 ? 0 : Math.max(10, Math.min(36, _rawIconSize || Math.round(s * 0.38)));
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
    }catch(e){
      console.warn('[femcoAvatarSquare] 상태 아이콘 생성 실패:', e.message);
    }

    if (img) {
      return `<span style="position:relative;display:block;width:100%;height:100%">
        <img src="${img}" decoding="async" fetchpriority="high" style="width:100%;height:100%;object-fit:cover;border-radius:inherit;border:2px solid ${border};background:rgba(255,255,255,.25)" onerror="this.closest('span').outerHTML='<div style=&quot;position:relative;width:100%;height:100%;border-radius:inherit;background:${accent};display:flex;align-items:center;justify-content:center;font-weight:1000;font-size:22px;color:#fff;border:2px solid ${border}&quot;>${letter}</div>'">
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
        --rowsPerCol:${rowsPerCol};
        --colWidth:${colWidth}px;
        column-gap:${colGap}px;
        row-gap:${rowGap}px;
        grid-auto-flow:column;
        grid-template-rows:repeat(var(--rowsPerCol), minmax(0, auto));
        grid-auto-columns:var(--colWidth);
        overflow-x:auto;
        padding-bottom:6px;
        scrollbar-width:none;
        justify-content:flex-start;
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

      @media(max-width:520px){ .b2-femco-title{font-size:20px} }
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
    // 대학별 로고 크기(옵션): univCfg[i].logoSizeFemco 가 있으면 우선 적용
    const _uLogo = (() => {
      const v = parseInt(uCfg.logoSizeFemco || '', 10);
      if (!isNaN(v) && v > 0) return Math.max(60, Math.min(520, v));
      return LOGO;
    })();
    const iconUrl = uCfg.icon || uCfg.img || '';
    const logoHtml = iconUrl
      ? `<img src="${toHttpsUrl(iconUrl)}" style="width:${_uLogo}px;height:${_uLogo}px;object-fit:contain" onerror="this.style.display='none'">`
      : `<span style="display:inline-flex;align-items:center;justify-content:center;width:${Math.round(_uLogo*0.62)}px;height:${Math.round(_uLogo*0.62)}px;opacity:.85;font-size:${Math.round(_uLogo*0.48)}px;line-height:1">🏫</span>`;

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
      return (a.name || '').localeCompare(b.name || '', 'ko', {sensitivity:'base'});
    });

    const _subTxt = ((femcoSettings.univSubtitles||{})[univName] || '').trim();
    const _subColor = (subtitleColor && subtitleColor.trim()) ? subtitleColor : textCol;

    // 대학별 배경 미디어
    const _bgRaw = ((femcoSettings.univBgMedia||{})[univName]) || '';
    const _bgCfg = (function(){
      const d={url:'',alpha:30,sizeMode:'cover',sizeVal:90,pos:'center',repeat:'no-repeat',ox:0,oy:0};
      if(!_bgRaw) return d;
      if(typeof _bgRaw==='string') return {...d,url:String(_bgRaw).trim()};
      if(typeof _bgRaw==='object') return {...d,..._bgRaw,url:String(_bgRaw.url||'').trim()};
      return d;
    })();
    const _bgUrl = (_bgCfg.url||'').trim();
    const _bgLower = _bgUrl.toLowerCase();
    const _bgIsImage = _bgUrl && /\.(png|jpe?g|webp|gif)(\?|#|$)/i.test(_bgLower);
    const _bgIsVideo = _bgUrl && /\.(mp4|webm|ogg)(\?|#|$)/i.test(_bgLower);
    const _bgIsEmbed = _bgUrl && /(youtube\.com|youtu\.be|twitch\.tv)/i.test(_bgLower);
    const _bgBtn = (_bgIsVideo || _bgIsEmbed || (_bgUrl && !_bgIsImage))
      ? `<button class="b2-femco-pill no-export" style="cursor:pointer" onclick="_b2FemcoOpenBgMedia('${univName.replace(/'/g,"\\'")}', '${_bgUrl.replace(/'/g,"\\'")}');event.stopPropagation();">${_bgIsVideo?'🎞️ 배경영상':_bgIsEmbed?'🔗 배경링크':'🖼️ 배경링크'}</button>`
      : '';

    const _pos = femcoSettings.logoPos || 'top';
    const _posNorm = (['left','right','top','bottom','center'].includes(_pos) ? _pos : 'top');
    const _attach = (femcoSettings.logoAttachTitle ?? 1) ? true : false;
    const _tpos = femcoSettings.titlePos || 'bottom';
    const _tposNorm = (['left','right','top','bottom'].includes(_tpos) ? _tpos : 'bottom');
    const starsHtml = (uCfg.championships || 0) > 0
      ? `<span class="b2-femco-stars">${'<span>⭐</span>'.repeat(uCfg.championships)}</span>`
      : '';
    const titleBlock = `
      <div style="min-width:220px;transform:translate(${TITLE_OFF_X}px,${TITLE_OFF_Y}px)">
        <div class="b2-femco-title-row">
          <div class="b2-femco-title">${univName}</div>
          ${starsHtml}
        </div>
        ${_subTxt?`<div class="b2-femco-subtitle" style="color:${_subColor}">${_subTxt}</div>`:''}
        ${_bgBtn?`<div class="b2-femco-meta">${_bgBtn}</div>`:''}
      </div>
    `;
    const logoOnlyStyle = (() => {
      if (_attach) return '';
      const pad = contentPadX;
      if (_posNorm === 'left') return `position:absolute;left:${pad}px;top:50%;transform:translateY(-50%) translate(${LOGO_OFF_X}px,${LOGO_OFF_Y}px);`;
      if (_posNorm === 'right') return `position:absolute;right:${pad}px;top:50%;transform:translateY(-50%) translate(${LOGO_OFF_X}px,${LOGO_OFF_Y}px);`;
      if (_posNorm === 'bottom') return `position:absolute;left:50%;bottom:10px;transform:translateX(-50%) translate(${LOGO_OFF_X}px,${LOGO_OFF_Y}px);`;
      // top / center
      return `position:absolute;left:50%;top:10px;transform:translateX(-50%) translate(${LOGO_OFF_X}px,${LOGO_OFF_Y}px);`;
    })();

    const headLayout = (() => {
      if (!_attach) {
        // 로고만 이동일 때 제목과 겹치지 않도록 좌/우는 공간을 예약
        const reserve = Math.max(0, Math.round(_uLogo * 0.55) + 16);
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
      const _alignStyle = (_posNorm === 'left')
        ? 'justify-content:flex-start'
        : (_posNorm === 'right') ? 'justify-content:flex-end' : 'justify-content:center';
      const _logoEl = `<div class="b2-femco-logo" style="transform:translate(${LOGO_OFF_X}px,${LOGO_OFF_Y}px)">${logoHtml}</div>`;
      if (_tposNorm === 'left') {
        return `<div class="b2-femco-headrow" style="${_alignStyle}">${titleBlock}${_logoEl}</div>`;
      }
      if (_tposNorm === 'right') {
        return `<div class="b2-femco-headrow" style="${_alignStyle}">${_logoEl}${titleBlock}</div>`;
      }
      if (_tposNorm === 'top') {
        return `<div class="b2-femco-headcol" style="${_alignStyle}">${titleBlock}${_logoEl}</div>`;
      }
      // bottom (default)
      return `<div class="b2-femco-headcol" style="${_alignStyle}">${_logoEl}${titleBlock}</div>`;
    })();

    // 자동 레이아웃(인원수/화면폭)에 따라 대학별로 rows/colWidth를 다르게 적용
    const _lay = autoLayout ? _autoLayoutForCount(all.length) : {rowsPerCol, colWidth};

    const _posToXY = (p)=>{
      const t = String(p||'center');
      const m = {
        'center':[50,50],'top':[50,0],'bottom':[50,100],'left':[0,50],'right':[100,50],
        'top left':[0,0],'top right':[100,0],'bottom left':[0,100],'bottom right':[100,100]
      };
      return m[t] || [50,50];
    };
    const [px,py]=_posToXY(_bgCfg.pos);
    const ox = parseInt(_bgCfg.ox||0,10)||0;
    const oy = parseInt(_bgCfg.oy||0,10)||0;
    const _bgPos = `calc(${px}% + ${ox}px) calc(${py}% + ${oy}px)`;
    let _bgSize = 'cover';
    if(_bgCfg.sizeMode==='contain') _bgSize='contain';
    else if(_bgCfg.sizeMode==='pct') _bgSize=`${Math.max(10,Math.min(220,parseInt(_bgCfg.sizeVal||90,10)||90))}%`;
    else if(_bgCfg.sizeMode==='px') _bgSize=`${Math.max(30,Math.min(900,parseInt(_bgCfg.sizeVal||240,10)||240))}px`;
    const _bgAlpha = Math.max(0, Math.min(100, parseInt(_bgCfg.alpha||30,10)||0)) / 100;
    const _bgRepeat = ['no-repeat','repeat','repeat-x','repeat-y'].includes(_bgCfg.repeat) ? _bgCfg.repeat : 'no-repeat';

    const _bgLayer = (_bgIsImage && _bgUrl)
      ? `<img src="${toHttpsUrl(_bgUrl).replace(/"/g,'&quot;')}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:${_bgSize};object-position:${_bgPos};opacity:${_bgAlpha.toFixed(3)};pointer-events:none;z-index:0" onerror="this.style.display='none'">`
      : (_bgIsVideo || _bgIsEmbed)
        ? `<div style="position:absolute;inset:0;background-image:url('${_bgUrl.replace(/'/g,"%27")}');background-repeat:${_bgRepeat};background-size:${_bgSize};background-position:${_bgPos};opacity:${_bgAlpha.toFixed(3)};pointer-events:none;z-index:0"></div>`
        : '';
    const _ovLayer = (_bgIsImage && _bgUrl && BG_OVERLAY>0)
      ? `<div style="position:absolute;inset:0;background:linear-gradient(180deg, rgba(2,6,23,${OV_TOP.toFixed(3)}), rgba(2,6,23,${OV_BOT.toFixed(3)}));pointer-events:none;z-index:1"></div>`
      : '';

    h += `
      <section class="b2-femco-univ" style="position:relative;overflow:hidden;background:${col};">
        ${_bgLayer}${_ovLayer}
        <div class="b2-femco-head" style="position:relative;z-index:2;color:${textCol};padding-left:${_padL}px;padding-right:${_padR}px">
          <div class="b2-femco-countbox" style="color:${textCol};left:${_padL}px;${textCol==='#ffffff'?'text-shadow:0 1px 2px rgba(0,0,0,.45);':''}">
            <div>총 ${all.length}</div>
            <div>이사장 ${bossCnt}</div>
            <div>교수+코치 ${profCoachCnt}</div>
            <div>학생 ${studentCnt}</div>
          </div>
          ${headLayout}
        </div>

        <div class="b2-femco-body" style="position:relative;z-index:2;background:transparent;padding-left:${_padL}px;padding-right:${_padR}px">
          <div class="b2-femco-grid" style="--rowsPerCol:${_lay.rowsPerCol};--colWidth:${_lay.colWidth}px">
            ${list.map(p => {
              const safeName = (p.name || '').replace(/'/g, "\\'");
              const tier = p.tier || '?';
              const tierBg = tier && tier !== '?' ? (typeof getTierBtnColor === 'function' ? getTierBtnColor(tier) : '#64748b') : '#64748b';
              const tierFg = tier && tier !== '?' ? ((typeof getTierBtnTextColor === 'function' ? getTierBtnTextColor(tier) : '#fff') || '#fff') : '#fff';
              const roleLabel = (p.role || '').trim();
              const rcol = raceColor(p, col);
              return `
                <div class="b2-femco-item" onclick="openPlayerModal('${safeName}');event.stopPropagation();">
                  <div class="b2-femco-avatar">${femcoAvatarSquare(p, rcol)}</div>
                  <div class="b2-femco-text" style="${p.inactive ? 'opacity:.65' : ''};color:${textCol}">
                    <div class="b2-femco-tier">
                      <span class="b2-femco-tierbadge" style="background:${tierBg};color:${tierFg}">${tier}</span>
                    </div>
                    ${roleLabel ? `<div class="b2-femco-role">${roleLabel}</div>` : ''}
                    <div class="b2-femco-name">${p.name || ''}</div>
                    <div><span class="b2-femco-race-pill" style="color:${rcol};border-color:${rcol}88;background:${textCol==='#ffffff'?'rgba(0,0,0,.28)':'rgba(255,255,255,.92)'};box-shadow:0 1px 2px rgba(0,0,0,.18)">${raceLabel(p)}</span></div>
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
  modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:var(--z-modal-5)';
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
  try{
    const a = document.createElement('a');
    const supportsDownload = ('download' in a);
    const ua = String(navigator.userAgent||'');
    const isIOS = /iPad|iPhone|iPod/i.test(ua);
    const isInApp = /KAKAOTALK|Instagram|FBAN|FBAV|NAVER|Whale|Line/i.test(ua);
    if(!supportsDownload || isIOS || isInApp){
      const w = window.open('', '_blank');
      if(w){
        try{
          w.document.write('<html><head><meta charset="utf-8"><title>이미지 생성 중...</title></head>'
            + '<body style="margin:0;font-family:sans-serif;background:#111;color:#fff;padding:14px">'
            + '펨코스타일 이미지 생성 중입니다... 잠시만 기다려주세요.'
            + '</body></html>');
          w.document.close();
        }catch(e){}
        window.__captureDlWin = w;
      }
    }
  }catch(e){}

  const tmpDiv = document.createElement('div');
  // 현재 펨코현황과 동일한 스타일로 전체를 1장으로 캡처
  tmpDiv.style.cssText = `position:fixed;left:-9999px;top:0;padding:24px;background:#0b1220;box-sizing:border-box;`;
  tmpDiv.innerHTML = _b2FemcoView(); // 현재 설정(localStorage) 반영됨
  document.body.appendChild(tmpDiv);
  // 설정/버튼류는 저장 이미지에서 제거
  tmpDiv.querySelectorAll('.b2-femco-subnav,.b2-femco-panel,.no-export,.no-export-movebtns').forEach(el => el.remove());

  await new Promise(r => setTimeout(r, 120));
  try{
    if (typeof injectUnivIcons === 'function') injectUnivIcons(tmpDiv);
  }catch(e){
    console.warn('[saveB2FemcoAllImg] 대학 아이콘 주입 실패:', e.message);
  }

  try{
    if (typeof _imgToDataUrls === 'function') {
      await _imgToDataUrls(tmpDiv, 12000);
    }
  }catch(e){}
  try{
    if (typeof _waitForImages === 'function') {
      await _waitForImages(tmpDiv, 1500);
    }
  }catch(e){}

  const h = tmpDiv.scrollHeight + 32;
  const w = tmpDiv.scrollWidth;
  const fname = '펨코현황판_전체_' + new Date().toISOString().slice(0,10) + '.png';

  try{
    console.log('[펨코] 이미지 저장 시작');
    if (typeof window._captureAndSave !== 'function') throw new Error('이미지 저장 기능을 불러오지 못했습니다.');
    await window._captureAndSave(tmpDiv, w, h, fname);
    
  }catch(e){
    console.error('[펨코현황 이미지 저장 실패]', e);
    alert('❌ 펨코스타일 이미지 저장 실패\n\n' + (e.message || '알 수 없는 오류가 발생했습니다.'));
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
      ${iconUrl?`<img src="${toHttpsUrl(iconUrl)}" style="width:var(--su_univ_logo_size,36px);height:var(--su_univ_logo_size,36px);object-fit:contain;border-radius:var(--su_univ_logo_radius,10px)" onerror="this.style.display='none'">`:''}
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
  const _bgSize = uCfg.bgImgSize || 'auto';
  const _bgOpacity = ((uCfg.bgImgAlpha ?? b2BgImgAlpha) / 100).toFixed(2);
  const bgImgHtml = uCfg.bgImg
    ? forExport
      ? `<img src="${uCfg.bgImg}" crossorigin="anonymous" class="b2-fit-auto" data-fit-kind="bg" data-fit-mode="${_bgSize}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:${_bgSize==='auto'?'cover':_bgSize};object-position:${_bgPos};opacity:${_bgOpacity};pointer-events:none;z-index:0" onload="_b2ApplyBgAutoSizing(this)">`
      : `<div class="b2-bg-layer" data-bg-src="${String(uCfg.bgImg).replace(/"/g,'&quot;')}" data-bg-size-mode="${_bgSize}" style="position:absolute;inset:0;background:url('${String(uCfg.bgImg).replace(/'/g,'%27')}') ${_bgPos}/${_bgSize==='auto'?'cover':_bgSize} no-repeat;opacity:${_bgOpacity};pointer-events:none;z-index:0"></div>`
    : '';

  let rows = '';
  roleOrder.forEach(role => {
    const group = roleGroups[role];
    rows += _tableRow(role, true, group.map(p => _b2NameTag(p, col, true)).join(''));
  });
  orderedTierKeys.forEach(tier => {
    const group = tierGroups[tier];
    group.sort((a,b) => (a.name||'').localeCompare(b.name||'', 'ko', {sensitivity:'base'}));
    rows += _tableRow(tier, false, group.map(p => _b2NameTag(p, col, false)).join(''));
  });
  const sidePanelHtml = hasSide ? `<div style="position:absolute;top:0;right:0;width:190px;bottom:0;background:${lightCol};padding:8px;box-sizing:border-box;overflow:hidden">
    ${_simgs.map((src,i)=>`<img src="${src}" style="width:100%;border-radius:7px;${(i<_simgs.length-1||_smemo)?'margin-bottom:5px;':''}display:block;object-fit:contain" onerror="this.style.display='none'">`).join('')}
    ${_smemo?`<div style="font-size:11px;color:#333;white-space:pre-wrap;line-height:1.5;margin-top:${_simgs.length?'5px':'0'}">${_smemo}</div>`:''}
  </div>` : '';
  const bodyContent = `<div class="b2-bg-host" style="position:relative;overflow:hidden">
    ${bgImgHtml}
    <div style="position:relative;z-index:1">
      <div>${rows}</div>
      ${sidePanelHtml}
    </div>
  </div>`;

  // 이번주 전적 계산
  const _ubNow=new Date(),_ubDay=_ubNow.getDay();
  const _ubMon=new Date(_ubNow); _ubMon.setDate(_ubNow.getDate()+(_ubDay===0?-6:1-_ubDay));
  const _ubFromN=parseInt(_ubMon.toISOString().slice(0,10).replace(/-/g,''));
  const _ubToN=parseInt(_ubNow.toISOString().slice(0,10).replace(/-/g,''));
  const _ubDN=s=>parseInt(String(s||'').replace(/[-\.]/g,''))||0;
  let _ubWw=0,_ubWl=0,_ubActive=0,_ubTw=0,_ubTl=0;
  tieredMembers.forEach(p=>{
    let acted=false;
    (Array.isArray(p.history)?p.history:[]).forEach(h=>{
      if(h.result==='승'){_ubTw++;} else if(h.result==='패'){_ubTl++;}
      const d=_ubDN(h.date||h.d||'');
      if(d>=_ubFromN&&d<=_ubToN){if(h.result==='승')_ubWw++;else if(h.result==='패')_ubWl++;acted=true;}
    });
    if(acted)_ubActive++;
  });
  const _ubTg=_ubTw+_ubTl;
  const _ubWr=_ubTg>0?Math.round(_ubTw/_ubTg*100):null;
  const _ubWrc=_ubWr===null?null:_ubWr>=60?'#bbf7d0':_ubWr>=40?'#fef08a':'#fecaca';
  const _ubWwTotal=_ubWw+_ubWl;
  const _ubWeekBadge=_ubWwTotal>0
    ? `<span style="flex-shrink:0;background:rgba(0,0,0,.18);color:${_ubWw>=_ubWl?'#bbf7d0':'#fecaca'};font-size:10px;font-weight:800;padding:2px 7px;border-radius:8px;border:1px solid rgba(255,255,255,.15)">`
      +`🔥 ${_ubWw}승${_ubWl}패</span>`
    : '';
  const _ubWrBadge=_ubWr!==null
    ? `<span style="flex-shrink:0;background:rgba(0,0,0,.18);color:${_ubWrc};font-size:10px;font-weight:800;padding:2px 7px;border-radius:8px;border:1px solid rgba(255,255,255,.15)" title="통산 ${_ubTw}승 ${_ubTl}패">📊 ${_ubWr}%</span>`
    : '';

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
          ${iconUrl?`<img src="${toHttpsUrl(iconUrl)}" style="width:var(--su_univ_logo_size,36px);height:var(--su_univ_logo_size,36px);object-fit:contain;border-radius:var(--su_univ_logo_radius,10px);flex-shrink:0;cursor:pointer" onclick="if(typeof openUnivModal==='function')openUnivModal('${univName}')" onerror="this.style.display='none'">`:''}
          <span style="font-weight:900;font-size:15px;color:${textCol};flex-shrink:0;cursor:pointer" onclick="if(typeof openUnivModal==='function')openUnivModal('${univName}')">${univName}</span>
          ${(uCfg.championships||0)>0?`<span style="display:flex;gap:1px;flex-shrink:0">${'<span style="font-size:15px">⭐</span>'.repeat(uCfg.championships)}</span>`:''}
          ${uCfg.memo2?`<span style="font-size:11px;color:${textCol}bb;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:0 1 auto;max-width:45%;margin-left:2px">${uCfg.memo2}</span>`:''}
          <span style="flex:1"></span>
          ${_ubWeekBadge}
          ${_ubWrBadge}
          <span style="flex-shrink:0;background:${textCol}22;color:${textCol};font-size:11px;font-weight:700;padding:2px 8px;border-radius:10px;border:1px solid ${textCol}33;cursor:pointer" onclick="event.stopPropagation();openB2MemberBreakdown(this,'${univName}')">${members.length}명</span>
          ${isLoggedIn?`<button class="no-export" onclick="event.stopPropagation();_b2ToggleCard(this,'${univName.replace(/'/g,"\\'")}')" style="background:${textCol}22;border:1px solid ${textCol}33;color:${textCol};font-size:11px;cursor:pointer;padding:1px 7px;border-radius:8px;flex-shrink:0;font-weight:700;margin-left:3px;z-index:var(--z-dropdown);position:relative" title="${_b2Collapsed.has(univName)?'펼치기':'접기'}">${_b2Collapsed.has(univName)?'▶':'▼'}</button>`:''}
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
  // [FIX-FREE-1] dissolved 대학 선수 제외
  const _freeDissSet = new Set((typeof univCfg !== 'undefined' ? univCfg : []).filter(u=>u.dissolved).map(u=>String(u.name||'').trim()));
  const freeMembers = players.filter(p => {
    const pu = String(p?.univ||'').trim();
    return (!pu || pu === '무소속') && !p.hidden && !p.retired && !p.hideFromBoard && !_freeDissSet.has(pu);
  });
  if (!freeMembers.length) return `<div style="text-align:center;color:var(--text3);padding:40px">무소속 멤버가 없습니다</div>`;

  const roledFree   = freeMembers.filter(p => _B2_ROLE_ORDER.includes(p.role||''));
  roledFree.sort((a,b) => _b2RoleRank(a) - _b2RoleRank(b));
  const tieredFree  = freeMembers.filter(p => !_B2_ROLE_ORDER.includes(p.role||''));

  const tierGroups = {};
  tieredFree.forEach(p => {
    const t = p.tier || '?';
    if (!tierGroups[t]) tierGroups[t] = [];
    tierGroups[t].push(p);
  });
  const orderedTierKeys = TIERS.filter(t => tierGroups[t]).concat(
    Object.keys(tierGroups).filter(t => !TIERS.includes(t))
  );

  // 이번주 전적 계산
  const _fvNow=new Date(),_fvDay=_fvNow.getDay();
  const _fvMon=new Date(_fvNow); _fvMon.setDate(_fvNow.getDate()+(_fvDay===0?-6:1-_fvDay));
  const _fvFromN=parseInt(_fvMon.toISOString().slice(0,10).replace(/-/g,''));
  const _fvToN  =parseInt(_fvNow.toISOString().slice(0,10).replace(/-/g,''));
  const _fvDN   =s=>parseInt(String(s||'').replace(/[-\.]/g,''))||0;
  let _fvTw=0,_fvTl=0,_fvWw=0,_fvWl=0,_fvActive=0;
  tieredFree.forEach(p=>{
    let acted=false;
    (Array.isArray(p.history)?p.history:[]).forEach(h=>{
      if(h.result==='승')_fvTw++; else if(h.result==='패')_fvTl++;
      const d=_fvDN(h.date||h.d||'');
      if(d>=_fvFromN&&d<=_fvToN){if(h.result==='승')_fvWw++;else if(h.result==='패')_fvWl++;acted=true;}
    });
    if(acted)_fvActive++;
  });
  const _fvTg=_fvTw+_fvTl;
  const _fvWr=_fvTg>0?Math.round(_fvTw/_fvTg*100):null;
  const _fvWrc=_fvWr===null?'#94a3b8':_fvWr>=60?'#10b981':_fvWr>=40?'#f59e0b':'#ef4444';
  const _fvWwT=_fvWw+_fvWl;

  // 종족 카운트
  const rCts={P:0,T:0,Z:0,'?':0};
  tieredFree.forEach(p=>{ const r=p.race||'?'; rCts[r in rCts?r:'?']++; });
  const rTotal=tieredFree.length||1;

  const defCol = '#64748b';
  let h = `<div style="border-radius:14px;overflow:hidden;box-shadow:0 2px 14px #0002">
    <div style="background:${defCol};padding:10px 16px">
      <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">
        <span style="font-weight:900;font-size:15px;color:#fff">🚶 무소속</span>
        <span style="background:rgba(255,255,255,.18);color:#fff;font-size:11px;font-weight:700;padding:2px 8px;border-radius:10px">${freeMembers.length}명</span>
        ${_fvActive>0?`<span style="background:rgba(255,165,0,.35);color:#fef08a;font-size:10px;font-weight:800;padding:2px 7px;border-radius:8px">🔥 이번주 ${_fvActive}명</span>`:''}
        ${_fvWwT>0?`<span style="background:rgba(0,0,0,.18);color:${_fvWw>=_fvWl?'#bbf7d0':'#fecaca'};font-size:10px;font-weight:800;padding:2px 7px;border-radius:8px">${_fvWw}승${_fvWl}패</span>`:''}
        ${_fvWr!==null?`<span style="background:rgba(0,0,0,.18);color:${_fvWrc};font-size:10px;font-weight:800;padding:2px 7px;border-radius:8px" title="통산 ${_fvTw}승 ${_fvTl}패">📊 통산 ${_fvWr}%</span>`:''}
        <div style="margin-left:auto;display:flex;gap:4px;align-items:center">
          ${rCts.P?`<span style="font-size:10px;background:rgba(124,58,237,.4);color:#ede9fe;padding:1px 6px;border-radius:6px;font-weight:800">🔮${rCts.P}</span>`:''}
          ${rCts.T?`<span style="font-size:10px;background:rgba(2,132,199,.4);color:#e0f2fe;padding:1px 6px;border-radius:6px;font-weight:800">⚔️${rCts.T}</span>`:''}
          ${rCts.Z?`<span style="font-size:10px;background:rgba(5,150,105,.4);color:#d1fae5;padding:1px 6px;border-radius:6px;font-weight:800">🦎${rCts.Z}</span>`:''}
        </div>
      </div>
      <div style="display:flex;height:5px;border-radius:3px;overflow:hidden;margin-top:8px;background:rgba(255,255,255,.15)">
        ${rCts.P?`<div style="flex:${rCts.P};background:#7c3aed;opacity:.85"></div>`:''}
        ${rCts.T?`<div style="flex:${rCts.T};background:#0284c7;opacity:.85"></div>`:''}
        ${rCts.Z?`<div style="flex:${rCts.Z};background:#059669;opacity:.85"></div>`:''}
        ${rCts['?']?`<div style="flex:${rCts['?']};background:rgba(255,255,255,.2)"></div>`:''}
      </div>
    </div>
    <div style="background:#64748b${_b2AlphaHex(b2BgAlpha)};padding:6px 14px 12px">`;

  const _frow = (labelEl, contentEl) => `<div style="padding:5px 0;border-bottom:1px solid ${defCol}18"><div style="display:flex;align-items:stretch">${labelEl}<div style="flex:1;padding:2px 4px">${contentEl}</div></div></div>`;
  const _fl = (text, isRole) => `<span style="font-size:12px;font-weight:800;color:${isRole?defCol:'var(--text3)'};width:56px;min-width:56px;text-align:center;flex-shrink:0;display:inline-flex;align-items:center;justify-content:center;background:#64748b${_b2AlphaHex(b2LabelAlpha)}!important;border-right:1px solid ${defCol}33;margin-right:10px">${text}</span>`;

  roledFree.forEach(p => {
    h += _frow(_fl(p.role||'', true), _b2PlayerRow(p, defCol));
  });
  orderedTierKeys.forEach(tier => {
    const group = tierGroups[tier];
    group.sort((a,b) => (a.name||'').localeCompare(b.name||'', 'ko', {sensitivity:'base'}));
    const col = getTierBtnColor(tier);
    h += _frow(_fl(tier, false), `<div style="display:flex;flex-wrap:wrap;gap:5px;padding:2px 0">${group.map(p => _b2NameTag(p, col, false)).join('')}</div>`);
  });
  h += `</div></div>`;
  return h;
}


function openB2MemberBreakdown(el, univName) {
  const existing = document.getElementById('b2-mbp');
  if (existing) { const wasEl = existing._forEl; existing.remove(); if (wasEl === el) return; }
  const col = gc(univName);
  const members = players.filter(p => String(p?.univ||'').trim() === String(univName||'').trim() && !p.hidden && !p.retired && !p.hideFromBoard);
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
  popup.style.cssText = 'position:fixed;z-index:var(--z-top);background:var(--white);border:1px solid var(--border2);border-radius:12px;box-shadow:0 4px 20px #0003;padding:12px 14px;min-width:170px';
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
      ${targets.map(u => _b2UnivBlock(u.name, gc(u.name), players.filter(p => String(p?.univ||'').trim() === String(u.name||'').trim() && !p.hidden && !p.retired && !p.hideFromBoard), true)).join('')}
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
    const c = String(hex||'').replace('#','').trim();
    const r = parseInt(c.slice(0,2),16), g = parseInt(c.slice(2,4),16), b = parseInt(c.slice(4,6),16);
    if([r,g,b].some(v=>Number.isNaN(v))) return '#ffffff';
    const f = (v)=>{ v/=255; return v<=0.03928? v/12.92 : Math.pow((v+0.055)/1.055, 2.4); };
    const L = 0.2126*f(r) + 0.7152*f(g) + 0.0722*f(b);
    // WCAG 대비비율 기준으로 흰/짙은 글자를 선택
    const contrastW = (1.0+0.05)/(L+0.05);
    const contrastD = (L+0.05)/(0.02+0.05); // #0f172a 근사(짙은 글자)
    return (contrastW >= contrastD) ? '#ffffff' : '#0f172a';
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
      h += '<img src="' + toHttpsUrl(c.logo) + '" style="width:var(--su_b2_univ_logo_size,42px);height:var(--su_b2_univ_logo_size,42px);border-radius:var(--su_univ_logo_radius,50%);object-fit:cover;border:2px solid #fff8" onerror="this.style.display=\\\'none\\\'">';
    } else {
      h += '<div style="width:var(--su_b2_univ_logo_size,42px);height:var(--su_b2_univ_logo_size,42px);border-radius:var(--su_univ_logo_radius,50%);background:#fff3;display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:900;color:#fff;border:2px solid #fff5">' + (c.name || '?')[0] + '</div>';
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
    h += '<button class="btn btn-xs" style="background:#ffffff22;color:#fff;border-color:#ffffff44;font-size:11px;padding:2px 6px;z-index:var(--z-dropdown);position:relative" onclick="event.stopPropagation();_b2CrewCollapsed.' + (isCollapsed ? 'delete' : 'add') + '(\'' + safeName + '\');document.getElementById(\'b2-content\').innerHTML=_b2CrewView()" title="' + (isCollapsed ? '펼치기' : '접기') + '">' + (isCollapsed ? '▶' : '▼') + '</button>';
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
    if (c.logo) h += '<img src="' + toHttpsUrl(c.logo) + '" style="width:24px;height:24px;border-radius:var(--su_univ_logo_radius,50%);object-fit:cover;border:1.5px solid #fff8" onerror="this.style.display=\'none\'">';
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
    ? '<img src="' + photo + '" class="b2-fit-auto" data-fit-kind="crew" data-fit-mode="auto" style="position:absolute;inset:0;width:100%;height:100%;object-fit:contain;border-radius:inherit" onload="_b2ApplyBgAutoSizing(this)" onerror="this.style.display=\'none\';this.nextSibling.style.display=\'flex\'">'
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
    html += '<img src="' + toHttpsUrl(c.logo) + '" style="position:relative;width:64px;height:64px;border-radius:var(--su_univ_logo_radius,50%);object-fit:cover;border:3px solid #fffb;flex-shrink:0;box-shadow:0 2px 12px #0004" onerror="this.style.display=\'none\'">';
  } else {
    html += '<div style="position:relative;width:64px;height:64px;border-radius:var(--su_univ_logo_radius,50%);background:#fff3;display:flex;align-items:center;justify-content:center;font-size:28px;font-weight:900;color:#fff;border:3px solid #fff5;flex-shrink:0">' + (c.name || '?')[0] + '</div>';
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
      innerHtml += '<img src="' + toHttpsUrl(c.logo) + '" style="position:relative;width:var(--su_b2_univ_logo_size,42px);height:var(--su_b2_univ_logo_size,42px);border-radius:var(--su_univ_logo_radius,50%);object-fit:cover;border:2px solid #fff8;flex-shrink:0">';
    } else {
      innerHtml += '<div style="position:relative;width:var(--su_b2_univ_logo_size,42px);height:var(--su_b2_univ_logo_size,42px);border-radius:var(--su_univ_logo_radius,50%);background:#fff3;display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:900;color:#fff;border:2px solid #fff5;flex-shrink:0">' + (c.name || '?')[0] + '</div>';
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
    ? '<img src="' + photo + '" class="b2-fit-auto" data-fit-kind="crew" data-fit-mode="auto" style="position:absolute;inset:0;width:100%;height:100%;object-fit:contain;border-radius:10px 10px 0 0" onload="_b2ApplyBgAutoSizing(this)">'
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
      h += '<img src="' + toHttpsUrl(c.logo) + '" style="width:var(--su_b2_univ_logo_size,42px);height:var(--su_b2_univ_logo_size,42px);border-radius:var(--su_univ_logo_radius,50%);object-fit:cover;border:2px solid #fff8" onerror="this.style.display=\\\'none\\\'">';
    } else {
      h += '<div style="width:var(--su_b2_univ_logo_size,42px);height:var(--su_b2_univ_logo_size,42px);border-radius:var(--su_univ_logo_radius,50%);background:#fff3;display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:900;color:#fff;border:2px solid #fff5">' + (c.name||'?')[0] + '</div>';
    }
    h += '</div>';
    h += '<div style="position:relative;flex:1;min-width:0">';
    h += '<div style="font-size:16px;font-weight:900;color:#fff;text-shadow:0 1px 4px #0006">' + c.name + '</div>';
    h += '<div style="font-size:11px;color:#ffffffcc">' + members.total + '명' + (c.desc ? ' · ' + c.desc : '') + '</div>';
    h += '</div>';
    h += '<div class="no-export" style="position:relative;display:flex;gap:4px;align-items:center">';
    h += '<button class="btn btn-xs" style="background:#ffffff22;color:#fff;border-color:#ffffff44;font-size:11px;padding:2px 6px;z-index:var(--z-dropdown);position:relative" onclick="event.stopPropagation();_b2CrewCollapsed[' + (isCollapsed ? 'delete' : 'add') + '](' + "'game_" + safeName + "'" + ');document.getElementById(\'b2-content\').innerHTML=_b2GameView()" title="' + (isCollapsed ? '펼치기' : '접기') + '">' + (isCollapsed ? '▶' : '▼') + '</button>';
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
// 이미지별 탭 진입 시 매번 랜덤 선수 선택 (새로고침해도 매번 다른 선수)
localStorage.removeItem('su_b2SelectedPlayer'); // 저장된 이전 선수 초기화
(function(){
  // photo가 있는 선수 우선, 없으면 전체에서 랜덤
  const all = players.filter(p => p && !p.hidden && !p.retired && !p.hideFromBoard);
  const withPhoto = all.filter(p => p.photo || (window.playerPhotos && window.playerPhotos[p.name]));
  const pool = withPhoto.length ? withPhoto : all;
  if (pool.length) {
    _b2SelectedPlayer = pool[Math.floor(Math.random() * pool.length)];
  }
})();

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
  const _b2pNow = new Date();
  const _b2pDay = _b2pNow.getDay();
  const _b2pMon = new Date(_b2pNow); _b2pMon.setDate(_b2pNow.getDate() + (_b2pDay===0?-6:1-_b2pDay));
  const _b2pFromN = parseInt(_b2pMon.toISOString().slice(0,10).replace(/-/g,''));
  const _b2pToN   = parseInt(_b2pNow.toISOString().slice(0,10).replace(/-/g,''));
  const _b2pDateNum = s => parseInt(String(s||'').replace(/[-\.]/g,''))||0;
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
  const _shuffleOn = (localStorage.getItem('su_b2_profile_shuffle') ?? '1') === '1';
  if (_shuffleOn) {
    for (let i = tierFilteredPlayers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = tierFilteredPlayers[i]; tierFilteredPlayers[i] = tierFilteredPlayers[j]; tierFilteredPlayers[j] = t;
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
        padding: 30px;
        background: linear-gradient(to top, rgba(0,0,0,0.9), transparent);
        z-index: 12;
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
  const hasPrimary = !!_b2SelectedPlayer.photo;
  const hasSecondary = !!_b2SelectedPlayer.secondProfileFile;
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
  const _slot1 = _b2SelectedPlayer.photo
    ? _b2MainMediaHTML(1, _b2SelectedPlayer.photo, {
      z: 1,
      opacity: 1,
      onLoadJs: `_b2ScheduleImageSwap('${_b2NameEsc}'); if(typeof _b2ApplyImgSettingsToDom==='function'){ _b2ApplyImgSettingsToDom('${_b2NameEsc}', 'primary'); }`,
      style: `object-fit:${primarySettings.fit || 'cover'};object-position:center center;transform:${_b2GetImgTransform(primarySettings)};filter:brightness(${(primarySettings.brightness || 100) / 100});`
    })
    : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,0.05);font-size:64px;font-weight:900;color:rgba(255,255,255,0.2)">${(_b2SelectedPlayer.name||'?')[0]}</div>`;
  const _slot2 = _b2SelectedPlayer.secondProfileFile
    ? _b2MainMediaHTML(2, _b2SelectedPlayer.secondProfileFile, {
      z: 2,
      opacity: 0,
      onLoadJs: `if(typeof _b2ApplyImgSettingsToDom==='function'){ _b2ApplyImgSettingsToDom('${_b2NameEsc}', 'secondary'); }`,
      style: `object-fit:${secondarySettings.fit || 'cover'};object-position:center center;transform:${_b2GetImgTransform(secondarySettings)};filter:brightness(${(secondarySettings.brightness || 100) / 100});transition:opacity 0.4s ease;`
    })
    : '';
  const _slot3 = _b2SelectedPlayer.profileFile3
    ? _b2MainMediaHTML(3, _b2SelectedPlayer.profileFile3, { z:3, opacity:0, style:`object-fit:cover;object-position:${_p3pos};transition:opacity 0.4s ease;` })
    : '';
  const _slot4 = _b2SelectedPlayer.profileFile4
    ? _b2MainMediaHTML(4, _b2SelectedPlayer.profileFile4, { z:4, opacity:0, style:`object-fit:cover;object-position:${_p4pos};transition:opacity 0.4s ease;` })
    : '';
  const _slot5 = _b2SelectedPlayer.profileFile5
    ? _b2MainMediaHTML(5, _b2SelectedPlayer.profileFile5, { z:5, opacity:0, style:`object-fit:cover;object-position:${_p5pos};transition:opacity 0.4s ease;` })
    : '';
  
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
          ${_b2BuildImageControlGroup(safeName, 'primary', '첫번째 이미지', hasPrimary)}
          ${_b2BuildImageControlGroup(safeName, 'secondary', '두번째 이미지', hasSecondary)}
        </div>` : ''}
        
        <!-- 컨트롤 패널 토글 버튼 - 관리자(로그인 사용자)만 표시 [BUGFIX-IMG-SETTINGS] -->
        ${isLoggedIn ? `<button onclick="document.getElementById('b2-img-controls').style.display=document.getElementById('b2-img-controls').style.display==='none'?'block':'none'" style="position:absolute;top:16px;right:16px;z-index:var(--z-fixed);padding:8px 12px;background:rgba(0,0,0,0.75);backdrop-filter:blur(10px);border-radius:8px;color:#fff;font-size:12px;font-weight:700;cursor:pointer;border:1px solid rgba(255,255,255,0.2)">⚙️ 설정</button>` : ''}
        
        <div class="b2-players-info">
          <div class="b2-players-name">${_b2SelectedPlayer.name || '이름 없음'}</div>
          <div class="b2-players-details">
            <span class="b2-players-tier">${_b2SelectedPlayer.tier || '?'}티어</span>
            <span class="b2-players-race">${_b2SelectedPlayer.race === 'P' ? '🔮 프로토스' : _b2SelectedPlayer.race === 'T' ? '⚔️ 테란' : _b2SelectedPlayer.race === 'Z' ? '🦎 저그' : '종족미정'}</span>
            ${_b2SelectedPlayer.univ ? (() => {
              const uCfg = univCfg.find(x => x.name === _b2SelectedPlayer.univ) || {};
              const iconUrl = uCfg.icon || uCfg.img || UNIV_ICONS[_b2SelectedPlayer.univ] || '';
              return iconUrl 
              ? `<span style="display:flex;align-items:center;gap:8px"><img src="${toHttpsUrl(iconUrl)}" style="width:32px;height:32px;object-fit:contain;border-radius:6px" onerror="this.style.display='none'"><span>${_b2SelectedPlayer.univ}</span></span>`
                : `<span>🏫 ${_b2SelectedPlayer.univ}</span>`;
            })() : ''}
            ${(() => {
              const ws2 = _b2pWeekStats(_b2SelectedPlayer);
              if (!ws2.total) return '';
              const wr2 = Math.round(ws2.w/ws2.total*100);
              const wc2 = wr2>=60?'#10b981':wr2>=40?'#f59e0b':'#ef4444';
              return `<span style="padding:3px 10px;border-radius:10px;background:rgba(0,0,0,.5);font-size:12px;font-weight:800;color:${wc2}">🔥 이번주 ${ws2.w}승 ${ws2.l}패</span>`;
            })()}
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
    _b2PlayersWeekBadge ? '1' : '0',
    _shuffleOn ? '1' : '0'
  ].join('|');
  if(window._b2PlayersRenderKey !== _renderKey){
    window._b2PlayersRenderKey = _renderKey;
    window._b2PlayersRenderLimit = 240;
  }
  const _lim0 = Math.max(60, parseInt(window._b2PlayersRenderLimit||0,10) || 240);
  const _limit = Math.min(tierFilteredPlayers.length, _lim0);
  let _gridList = tierFilteredPlayers.slice();
  if(_b2SelectedPlayer && _b2SelectedPlayer.name){
    const si = _gridList.findIndex(x=>x && x.name === _b2SelectedPlayer.name);
    if(si > 0){
      const sel = _gridList.splice(si, 1)[0];
      _gridList.unshift(sel);
    }
  }
  const _gridShow = _gridList.slice(0, _limit);
  const _remain = Math.max(0, _gridList.length - _gridShow.length);

  h += `
    <div class="b2-players-grid-wrapper">
      <div class="b2-players-grid">
  `;

  _gridShow.forEach(p => {
    const isActive = _b2SelectedPlayer && _b2SelectedPlayer.name === p.name;
    const playerColor = gc(p.univ) || '#6366f1';
    const playerTheme = {
      bg: hexToRgba(playerColor, 0.1),
      border: playerColor
    };
    const tierCol  = typeof getTierBtnColor==='function'&&p.tier?getTierBtnColor(p.tier):'#64748b';
    const tierTc   = typeof getTierBtnTextColor==='function'&&p.tier?(getTierBtnTextColor(p.tier)||'#fff'):'#fff';
    const raceIco  = p.race==='P'?'🔮':p.race==='T'?'⚔️':p.race==='Z'?'🦎':'';
    const ws = _b2PlayersWeekBadge ? _b2pWeekStats(p) : null;
    const wrColor = ws && ws.total>0 ? (ws.w/ws.total>=0.6?'#10b981':ws.w/ws.total>=0.4?'#f59e0b':'#ef4444') : '#94a3b8';
    
    h += `
      <div class="b2-players-card ${isActive ? 'active' : ''}" onclick="_b2UpdateMainDisplay('${p.name}')" style="width:140px;padding:12px;border-radius:12px;cursor:pointer;transition:all 0.2s ease;display:flex;flex-direction:column;align-items:center;gap:6px;background:var(--white);border:2px solid ${isActive?playerColor:'transparent'};box-shadow:${isActive?'0 4px 12px '+hexToRgba(playerColor,0.3):'0 1px 3px rgba(0,0,0,0.08)'}">
        <div style="position:relative;width:116px;height:116px;flex-shrink:0">
          ${p.photo
            ? `<img src="${toHttpsUrl(p.photo)}" decoding="async" ${isActive?'fetchpriority="high"':'fetchpriority="auto"'} class="b2-players-thumbnail b2-fit-auto" data-fit-kind="thumb" data-fit-mode="auto" alt="${p.name}" style="width:116px;height:116px;border-radius:10px;object-fit:contain;display:block" onload="_b2ApplyBgAutoSizing(this)" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
              <div class="b2-players-thumbnail" style="width:116px;height:116px;border-radius:10px;display:none;align-items:center;justify-content:center;background:${playerTheme.bg};font-size:48px;font-weight:900;color:${playerTheme.border}">${(p.name||'?')[0]}</div>`
            : `<div class="b2-players-thumbnail" style="width:116px;height:116px;border-radius:10px;display:flex;align-items:center;justify-content:center;background:${playerTheme.bg};font-size:48px;font-weight:900;color:${playerTheme.border}">${(p.name||'?')[0]}</div>`
          }
          ${p.tier?`<span style="position:absolute;top:4px;left:4px;font-size:10px;font-weight:800;padding:1px 6px;border-radius:6px;background:${tierCol};color:${tierTc};line-height:1.5">${p.tier}</span>`:''}
          ${ws&&ws.total>0?`<span style="position:absolute;bottom:4px;right:4px;font-size:9px;font-weight:900;padding:2px 5px;border-radius:6px;background:rgba(0,0,0,.72);color:${wrColor};line-height:1.4;backdrop-filter:blur(4px)">${ws.w}승${ws.l}패</span>`:''}
          ${ws&&ws.total>0&&ws.w===ws.total?`<span style="position:absolute;top:4px;right:4px;font-size:12px">🔥</span>`:''}
        </div>
        <div style="width:100%;display:flex;flex-direction:column;align-items:center;gap:2px">
          <div class="b2-players-label" style="font-size:14px;font-weight:700;text-align:center;color:var(--text1);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;width:100%">${p.name || '이름 없음'}</div>
          <div style="display:flex;align-items:center;gap:4px;flex-wrap:wrap;justify-content:center">
            ${raceIco?`<span style="font-size:11px">${raceIco}</span>`:''}
            <span style="font-size:10px;color:var(--text3);font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:100px">${p.univ||''}</span>
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
  const _slot1 = player.photo
    ? _b2MainMediaHTML(1, player.photo, { z:1, opacity:1, onLoadJs:`_b2ScheduleImageSwap('${_nameEsc}')`, style:'' })
    : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,0.05);font-size:64px;font-weight:900;color:rgba(255,255,255,0.2)">${(player.name||'?')[0]}</div>`;
  const _slot2 = player.secondProfileFile
    ? _b2MainMediaHTML(2, player.secondProfileFile, { z:2, opacity:0, style:`object-fit:cover;transition:opacity 0.4s ease;` })
    : '';
  const _slot3 = player.profileFile3
    ? _b2MainMediaHTML(3, player.profileFile3, { z:3, opacity:0, style:`object-fit:cover;object-position:${_p3pos};transition:opacity 0.4s ease;` })
    : '';
  const _slot4 = player.profileFile4
    ? _b2MainMediaHTML(4, player.profileFile4, { z:4, opacity:0, style:`object-fit:cover;object-position:${_p4pos};transition:opacity 0.4s ease;` })
    : '';
  const _slot5 = player.profileFile5
    ? _b2MainMediaHTML(5, player.profileFile5, { z:5, opacity:0, style:`object-fit:cover;object-position:${_p5pos};transition:opacity 0.4s ease;` })
    : '';
  
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
      ${_slot1}
      ${_slot2}
      ${_slot3}
      ${_slot4}
      ${_slot5}
      
      <!-- 이미지 컨트롤 패널 (모든 사용자 접근 가능) -->
      <!-- 이미지 컨트롤 패널 - 관리자(로그인)만 렌더 [BUGFIX-IMG-SETTINGS] -->
      ${isLoggedIn ? `<div class="b2-players-img-controls" id="b2-img-controls" style="display:none">
        <div class="b2-players-controls-title">🎨 이미지 설정</div>
        ${_b2BuildImageControlGroup(safeName, 'primary', '첫번째 이미지', hasPrimary)}
        ${_b2BuildImageControlGroup(safeName, 'secondary', '두번째 이미지', hasSecondary)}
      </div>` : ''}
      
      <!-- 컨트롤 패널 토글 버튼 - 관리자(로그인 사용자)만 표시 [BUGFIX-IMG-SETTINGS] -->
      ${isLoggedIn ? `<button onclick="document.getElementById('b2-img-controls').style.display=document.getElementById('b2-img-controls').style.display==='none'?'block':'none'" style="position:absolute;top:16px;right:16px;z-index:var(--z-fixed);padding:8px 12px;background:rgba(0,0,0,0.75);backdrop-filter:blur(10px);border-radius:8px;color:#fff;font-size:12px;font-weight:700;cursor:pointer;border:1px solid rgba(255,255,255,0.2)">⚙️ 설정</button>` : ''}
      
      <div class="b2-players-info">
        <div class="b2-players-name">${player.name || '이름 없음'}</div>
        <div class="b2-players-details">
          <span class="b2-players-tier" style="background:${theme.border}">${player.tier || '?'}티어</span>
          <span class="b2-players-race">${player.race === 'P' ? '프로토스' : player.race === 'T' ? '테란' : player.race === 'Z' ? '저그' : '종족미정'}</span>
          ${player.univ ? (() => {
            const uCfg = univCfg.find(x => x.name === player.univ) || {};
            const iconUrl = uCfg.icon || uCfg.img || UNIV_ICONS[player.univ] || '';
            return iconUrl
              ? `<span style="display:flex;align-items:center;gap:8px"><img src="${toHttpsUrl(iconUrl)}" style="width:32px;height:32px;object-fit:contain;border-radius:6px" onerror="this.style.display='none'"><span>${player.univ}</span></span>`
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
  const clampDelay = (v)=>{
    const n = parseFloat(v);
    if(isNaN(n)) return 1;
    return Math.max(0.2, Math.min(60, n));
  };
  const d12 = clampDelay(player.photoDelay12 ?? 1);
  const d23 = clampDelay(player.photoDelay23 ?? 1);
  const d34 = clampDelay(player.photoDelay34 ?? 1);
  const d45 = clampDelay(player.photoDelay45 ?? 1);
  const d51 = clampDelay(player.photoDelay51 ?? 1);

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
          <input type="text" id="b2-ed-photo" value="${player.photo||''}" placeholder="https://... 이미지 URL 입력" style="flex:1;padding:8px 12px;border:1px solid var(--border2);border-radius:8px;font-size:13px">
          <span id="b2-ed-photo-preview-wrap" style="position:relative;width:40px;height:40px;border-radius:var(--su_profile_radius,50%);overflow:hidden;flex-shrink:0;background:#e2e8f0;border:2px solid var(--border);display:${player.photo&&!player.photo.startsWith('data:')?'inline-block':'none'}">
            <img id="b2-ed-photo-preview" src="${player.photo&&!player.photo.startsWith('data:')?toHttpsUrl(player.photo):''}" style="width:40px;height:40px;object-fit:cover;display:block" onerror="this.style.display='none'">
          </span>
        </div>
        <div id="b2-ed-photo-warn" style="font-size:10px;color:${player.photo&&player.photo.startsWith('data:')?'#dc2626':'var(--gray-l)'};margin-top:4px">${player.photo&&player.photo.startsWith('data:')?'❌ base64 이미지 직접 입력 불가 — imgur.com 등에 업로드 후 URL 사용':'이미지 URL을 붙여넣으면 현황판 선수 카드에 프로필 사진이 표시됩니다.'}</div>
      </div>
      <div style="margin-bottom:16px">
        <label style="font-size:13px;font-weight:700;color:var(--text2);display:block;margin-bottom:6px">프로필 이미지 2 (모바일/교체용) <span style="font-size:10px;font-weight:400;color:var(--gray-l)">(설정한 시간 후 자동 교체)</span></label>
        <input type="text" id="b2-ed-second-profile" value="${player.secondProfileFile||''}" placeholder="https://... 이미지 URL 입력" style="width:100%;padding:8px 12px;border:1px solid var(--border2);border-radius:8px;font-size:13px">
        <div style="font-size:10px;color:var(--gray-l);margin-top:4px">스트리머 선택 후 설정한 시간 뒤 이 이미지로 자동 전환됩니다.</div>
      </div>
      <div style="margin-bottom:16px">
        <label style="font-size:13px;font-weight:700;color:var(--text2);display:block;margin-bottom:6px">프로필 이미지 3 (순환용)</label>
        <input type="text" id="b2-ed-photo3" value="${player.profileFile3||''}" placeholder="https://... (gif/mp4 가능)" style="width:100%;padding:8px 12px;border:1px solid var(--border2);border-radius:8px;font-size:13px">
      </div>
      <div style="margin-bottom:16px">
        <label style="font-size:13px;font-weight:700;color:var(--text2);display:block;margin-bottom:6px">프로필 이미지 4 (순환용)</label>
        <input type="text" id="b2-ed-photo4" value="${player.profileFile4||''}" placeholder="https://... (gif/mp4 가능)" style="width:100%;padding:8px 12px;border:1px solid var(--border2);border-radius:8px;font-size:13px">
      </div>
      <div style="margin-bottom:16px">
        <label style="font-size:13px;font-weight:700;color:var(--text2);display:block;margin-bottom:6px">프로필 이미지 5 (순환용)</label>
        <input type="text" id="b2-ed-photo5" value="${player.profileFile5||''}" placeholder="https://... (gif/mp4 가능)" style="width:100%;padding:8px 12px;border:1px solid var(--border2);border-radius:8px;font-size:13px">
        <div style="font-size:10px;color:var(--gray-l);margin-top:4px">이미지별 탭에서 2→3→4→5(→1) 순서로 전환됩니다.</div>
      </div>
      <div style="margin-top:10px;margin-bottom:16px;padding:12px;background:rgba(37,99,235,.06);border:1px solid rgba(37,99,235,.18);border-radius:10px">
        <div style="font-size:13px;font-weight:800;color:var(--text2);margin-bottom:10px">전환 시간(초)</div>
        <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px">
          <div>
            <div style="font-size:11px;font-weight:800;color:var(--text3);margin-bottom:6px">1 → 2</div>
            <input type="number" id="b2-ed-delay-12" min="0.2" max="60" step="0.1" value="${d12}" style="width:100%;padding:8px 12px;border:1px solid var(--border2);border-radius:8px;font-size:13px">
          </div>
          <div>
            <div style="font-size:11px;font-weight:800;color:var(--text3);margin-bottom:6px">2 → 3</div>
            <input type="number" id="b2-ed-delay-23" min="0.2" max="60" step="0.1" value="${d23}" style="width:100%;padding:8px 12px;border:1px solid var(--border2);border-radius:8px;font-size:13px">
          </div>
          <div>
            <div style="font-size:11px;font-weight:800;color:var(--text3);margin-bottom:6px">3 → 4</div>
            <input type="number" id="b2-ed-delay-34" min="0.2" max="60" step="0.1" value="${d34}" style="width:100%;padding:8px 12px;border:1px solid var(--border2);border-radius:8px;font-size:13px">
          </div>
          <div>
            <div style="font-size:11px;font-weight:800;color:var(--text3);margin-bottom:6px">4 → 5</div>
            <input type="number" id="b2-ed-delay-45" min="0.2" max="60" step="0.1" value="${d45}" style="width:100%;padding:8px 12px;border:1px solid var(--border2);border-radius:8px;font-size:13px">
          </div>
          <div>
            <div style="font-size:11px;font-weight:800;color:var(--text3);margin-bottom:6px">마지막 → 1</div>
            <input type="number" id="b2-ed-delay-51" min="0.2" max="60" step="0.1" value="${d51}" style="width:100%;padding:8px 12px;border:1px solid var(--border2);border-radius:8px;font-size:13px">
          </div>
        </div>
        <div style="font-size:10px;color:var(--gray-l);margin-top:10px">※ 1/2만 있으면 2에서 멈춥니다. mp4는 끝까지 재생 후 이동합니다.</div>
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
  const thirdProfileUrl = (document.getElementById('b2-ed-photo3')?.value || '').trim();
  const fourthProfileUrl = (document.getElementById('b2-ed-photo4')?.value || '').trim();
  const fifthProfileUrl = (document.getElementById('b2-ed-photo5')?.value || '').trim();
  const clampDelay = (v)=>{
    const n = parseFloat(v);
    if(isNaN(n)) return 1;
    return Math.max(0.2, Math.min(60, n));
  };
  const d12 = clampDelay(document.getElementById('b2-ed-delay-12')?.value || '1');
  const d23 = clampDelay(document.getElementById('b2-ed-delay-23')?.value || '1');
  const d34 = clampDelay(document.getElementById('b2-ed-delay-34')?.value || '1');
  const d45 = clampDelay(document.getElementById('b2-ed-delay-45')?.value || '1');
  const d51 = clampDelay(document.getElementById('b2-ed-delay-51')?.value || '1');
  
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
  if(d12 === 1) delete player.photoDelay12; else player.photoDelay12 = d12;
  if(d23 === 1) delete player.photoDelay23; else player.photoDelay23 = d23;
  if(d34 === 1) delete player.photoDelay34; else player.photoDelay34 = d34;
  if(d45 === 1) delete player.photoDelay45; else player.photoDelay45 = d45;
  if(d51 === 1) delete player.photoDelay51; else player.photoDelay51 = d51;
  
  save();
  render();
  
  document.getElementById('b2-profile-edit-modal').remove();
  
  // 프로필 탭 업데이트
  if (_b2SelectedPlayer && _b2SelectedPlayer.name === playerName) {
    _b2UpdateMainDisplay(playerName);
  }
}

/* ══════════════════════════════════════
   🏁 종족별 뷰 - 프로토스/테란/저그 분류
══════════════════════════════════════ */
/* ══════════════════════════════════════
   🎮 종족별 뷰 v2 — 승률 + 더보기 + 이번주 활동
══════════════════════════════════════ */
function _b2RaceView() {
  const _dissSet = new Set((typeof univCfg !== 'undefined' ? univCfg : []).filter(u=>u.dissolved||u.hidden).map(u=>String(u.name||'').trim()));
  const vis = players.filter(p => !p.hidden && !p.retired && !p.hideFromBoard && !_dissSet.has(String(p?.univ||'').trim()) && !_B2_ROLE_ORDER.includes(p.role||''));

  // 이번주 날짜
  const now = new Date(), day = now.getDay();
  const mon = new Date(now); mon.setDate(now.getDate()+(day===0?-6:1-day));
  const fromN = parseInt(mon.toISOString().slice(0,10).replace(/-/g,''));
  const toN   = parseInt(now.toISOString().slice(0,10).replace(/-/g,''));
  const dNum  = s => parseInt(String(s||'').replace(/[-\.]/g,''))||0;

  const races = [
    { key:'P', label:'🔮 프로토스', color:'#7c3aed', bg:'#ede9fe', dark:'#5b21b6', lightBg:'#f5f3ff' },
    { key:'T', label:'⚔️ 테란',    color:'#0369a1', bg:'#e0f2fe', dark:'#075985', lightBg:'#f0f9ff' },
    { key:'Z', label:'🦎 저그',    color:'#065f46', bg:'#d1fae5', dark:'#064e3b', lightBg:'#ecfdf5' },
    { key:'?', label:'❓ 미정',    color:'#64748b', bg:'#f1f5f9', dark:'#475569', lightBg:'#f8fafc' },
  ];

  const groups = {}; races.forEach(r => { groups[r.key] = []; });
  vis.forEach(p => {
    const r = (p.race==='P'||p.race==='T'||p.race==='Z') ? p.race : '?';
    // 이번주 전적 계산
    let w=0,l=0;
    (Array.isArray(p.history)?p.history:[]).forEach(h=>{
      const d=dNum(h.date||h.d||'');
      if(d>=fromN&&d<=toN){ if(h.result==='승')w++; else if(h.result==='패')l++; }
    });
    // 통산 전적
    let tw=0,tl=0;
    (Array.isArray(p.history)?p.history:[]).forEach(h=>{
      if(h.result==='승')tw++; else if(h.result==='패')tl++;
    });
    groups[r].push({...p, _ww:w, _wl:l, _tw:tw, _tl:tl, _wActive:w+l>0});
  });

  Object.keys(groups).forEach(k => {
    groups[k].sort((a,b) => {
      const ta=(typeof TIERS!=='undefined'&&TIERS.includes(a.tier||''))?TIERS.indexOf(a.tier):999;
      const tb=(typeof TIERS!=='undefined'&&TIERS.includes(b.tier||''))?TIERS.indexOf(b.tier):999;
      return ta!==tb?ta-tb:(a.name||'').localeCompare(b.name||'','ko',{sensitivity:'base'});
    });
  });

  const totalVis = vis.length;
  const pct = n => totalVis>0?Math.round(n/totalVis*100):0;
  const uid = 'race_'+Math.random().toString(36).slice(2,7);

  let h = `<style>
    .b2rv2-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(280px,1fr)); gap:14px; }
    .b2rv2-card { border-radius:16px; overflow:hidden; box-shadow:0 4px 20px #0002; border:1px solid #0000000d; }
    .b2rv2-head { padding:14px 16px; display:flex; align-items:center; gap:10px; }
    .b2rv2-body { padding:12px 14px 16px; }
    .b2rv2-stat { display:flex; align-items:center; gap:8px; margin-bottom:8px; flex-wrap:wrap; }
    .b2rv2-wr-bar { flex:1; height:8px; border-radius:4px; overflow:hidden; background:rgba(0,0,0,.1); min-width:60px; }
    .b2rv2-players { display:flex; flex-wrap:wrap; gap:5px; margin-top:10px; }
    .b2rv2-more-btn { font-size:11px; font-weight:700; padding:3px 10px; border-radius:10px; border:none; cursor:pointer; margin-top:6px; }
    .b2rv2-week-badge { font-size:10px; font-weight:800; padding:1px 6px; border-radius:6px; }
    @media(max-width:640px){ .b2rv2-grid{ grid-template-columns:1fr; } }
  </style>`;

  // 전체 통계 헤더
  h += `<div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;padding:10px 16px;background:var(--surface);border:1px solid var(--border2);border-radius:12px;flex-wrap:wrap">
    <span style="font-size:13px;font-weight:900;color:var(--text1)">👥 전체 ${totalVis}명</span>
    <span style="width:1px;height:16px;background:var(--border2)"></span>
    ${races.filter(r=>groups[r.key].length).map(r=>{
      const grp=groups[r.key];
      const tw=grp.reduce((s,p)=>s+p._tw,0), tl=grp.reduce((s,p)=>s+p._tl,0);
      const tg=tw+tl; const wr=tg>0?Math.round(tw/tg*100):null;
      const wrc=wr===null?'#94a3b8':wr>=60?'#10b981':wr>=40?'#f59e0b':'#ef4444';
      return `<span style="font-size:12px;font-weight:800;color:${r.color}">${r.label} ${grp.length}명${wr!==null?` <span style="color:${wrc}">(${wr}%)</span>`:''}</span>`;
    }).join('<span style="color:var(--border2)">·</span>')}
  </div>`;

  // 전체 비율 바
  h += `<div style="margin-bottom:16px;border-radius:10px;overflow:hidden;height:10px;display:flex;background:var(--border2)">`;
  races.forEach(r => { const w=pct(groups[r.key].length); if(w>0) h+=`<div title="${r.label} ${w}%" style="height:100%;width:${w}%;background:${r.color};transition:width .8s ease"></div>`; });
  h += `</div><div class="b2rv2-grid">`;

  races.forEach(r => {
    const grp = groups[r.key];
    if (!grp.length) return;

    const totalW = grp.reduce((s,p)=>s+p._tw,0), totalL = grp.reduce((s,p)=>s+p._tl,0);
    const totalG = totalW+totalL;
    const wr = totalG>0?Math.round(totalW/totalG*100):null;
    const wrColor = wr===null?'#94a3b8':wr>=60?'#10b981':wr>=40?'#f59e0b':'#ef4444';
    const weekActive = grp.filter(p=>p._wActive).length;
    const weekW = grp.reduce((s,p)=>s+p._ww,0), weekL = grp.reduce((s,p)=>s+p._wl,0);

    // 대학별 분포
    const univCounts = {};
    grp.forEach(p => { const u=String(p?.univ||'').trim()||'무소속'; univCounts[u]=(univCounts[u]||0)+1; });
    const topUnivs = Object.entries(univCounts).sort((a,b)=>b[1]-a[1]).slice(0,5);

    // 대학별 승률
    const univWr = {};
    grp.forEach(p => {
      const u=String(p?.univ||'').trim()||'무소속';
      if(!univWr[u]) univWr[u]={w:0,l:0};
      univWr[u].w+=p._tw; univWr[u].l+=p._tl;
    });

    const cid = `${uid}-${r.key}`;

    h += `<div class="b2rv2-card">
      <div class="b2rv2-head" style="background:${r.color}">
        <span style="font-size:22px">${r.label.split(' ')[0]}</span>
        <div style="flex:1">
          <div style="font-size:15px;font-weight:900;color:#fff">${r.label.split(' ').slice(1).join(' ')}</div>
          <div style="font-size:11px;color:rgba(255,255,255,.8)">${grp.length}명 · 전체의 ${pct(grp.length)}%</div>
        </div>
        <div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px">
          <div style="background:rgba(255,255,255,.2);padding:3px 10px;border-radius:20px;font-size:12px;font-weight:700;color:#fff">
            #${races.findIndex(rx=>rx.key===r.key)+1}위
          </div>
          ${wr!==null?`<div style="background:rgba(255,255,255,.15);padding:2px 8px;border-radius:10px;font-size:11px;font-weight:900;color:${wr>=50?'#bbf7d0':'#fecaca'}">승률 ${wr}%</div>`:''}
        </div>
      </div>
      <div class="b2rv2-body" style="background:${r.lightBg}">
        <div class="b2rv2-stat">
          <span style="font-size:11px;font-weight:800;color:${r.dark}">📊 통산</span>
          <span style="font-size:12px;font-weight:900;color:${r.dark}">${totalG}전</span>
          <span style="font-size:11px;color:#10b981;font-weight:800">${totalW}승</span>
          <span style="font-size:11px;color:#ef4444;font-weight:800">${totalL}패</span>
          ${wr!==null?`<div class="b2rv2-wr-bar"><div style="width:${wr}%;height:100%;background:${wrColor}"></div></div><span style="font-size:11px;font-weight:900;color:${wrColor}">${wr}%</span>`:''}
        </div>
        ${weekActive>0?`<div class="b2rv2-stat" style="margin-bottom:10px">
          <span style="font-size:11px;font-weight:800;color:${r.dark}">🔥 이번주</span>
          <span class="b2rv2-week-badge" style="background:${r.color}22;color:${r.dark}">활동 ${weekActive}명</span>
          ${weekW+weekL>0?`<span class="b2rv2-week-badge" style="background:#10b98122;color:#065f46">${weekW}승</span>
          <span class="b2rv2-week-badge" style="background:#ef444422;color:#991b1b">${weekL}패</span>`:''}
        </div>`:''}
        <div style="font-size:11px;font-weight:800;color:${r.dark};margin-bottom:7px">🏫 TOP 대학</div>
        ${topUnivs.map(([u,n])=>{
          const uw=univWr[u]||{w:0,l:0}; const ug=uw.w+uw.l;
          const uwr=ug>0?Math.round(uw.w/ug*100):null;
          const uwc=uwr===null?'#94a3b8':uwr>=60?'#10b981':uwr>=40?'#f59e0b':'#ef4444';
          return `<div style="display:flex;align-items:center;gap:8px;margin-bottom:5px">
            <span style="font-size:11px;font-weight:700;color:var(--text2);min-width:70px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${u}</span>
            <div style="flex:1;height:5px;border-radius:3px;background:#0001;overflow:hidden">
              <div style="width:${Math.round(n/grp.length*100)}%;height:100%;background:${r.color};border-radius:3px"></div>
            </div>
            <span style="font-size:11px;font-weight:800;color:${r.color};min-width:20px;text-align:right">${n}</span>
            ${uwr!==null?`<span style="font-size:10px;font-weight:800;color:${uwc};min-width:30px">${uwr}%</span>`:'<span style="min-width:30px"></span>'}
          </div>`;
        }).join('')}
        <div class="b2rv2-players" id="${cid}-players">
          ${grp.slice(0,24).map(p=>_b2NameTag(p,r.color,false)).join('')}
        </div>
        ${grp.length>24?`
          <div id="${cid}-more" style="display:none;flex-wrap:wrap;gap:5px;margin-top:4px">
            ${grp.slice(24).map(p=>_b2NameTag(p,r.color,false)).join('')}
          </div>
          <button class="b2rv2-more-btn" style="background:${r.color}18;color:${r.dark}"
            onclick="(function(btn){
              const more=document.getElementById('${cid}-more');
              if(!more)return;
              const shown=more.style.display!=='none';
              more.style.display=shown?'none':'flex';
              btn.textContent=shown?'+ ${grp.length-24}명 더 보기':'접기';
            })(this)">+ ${grp.length-24}명 더 보기</button>
        `:''}
      </div>
    </div>`;
  });

  h += `</div>`;
  return h;
}

/* ══════════════════════════════════════
   🏆 티어별 뷰
══════════════════════════════════════ */
/* ══════════════════════════════════════
   🏆 티어별 뷰 v2 — 기본접힘 + 승률 + 이번주활동 + 대학분포바
══════════════════════════════════════ */
window._b2TierCollapsed = window._b2TierCollapsed || null; // null=초기화 안됨

function _b2TierView() {
  const _dissSet = new Set((typeof univCfg !== 'undefined' ? univCfg : []).filter(u=>u.dissolved||u.hidden).map(u=>String(u.name||'').trim()));
  const vis = players.filter(p => !p.hidden && !p.retired && !p.hideFromBoard && !_dissSet.has(String(p?.univ||'').trim()) && !_B2_ROLE_ORDER.includes(p.role||''));
  const TIERS_LOCAL = typeof TIERS !== 'undefined' ? TIERS : [];
  const univList = (_b2VisUnivs?_b2VisUnivs():[]).filter(u=>u.name&&u.name!=='무소속');

  // 이번주 날짜
  const now = new Date(), day=now.getDay();
  const mon = new Date(now); mon.setDate(now.getDate()+(day===0?-6:1-day));
  const fromN = parseInt(mon.toISOString().slice(0,10).replace(/-/g,''));
  const toN   = parseInt(now.toISOString().slice(0,10).replace(/-/g,''));
  const dNum  = s => parseInt(String(s||'').replace(/[-\.]/g,''))||0;

  const tierGroups = {};
  vis.forEach(p => {
    const t = p.tier||'미정';
    if (!tierGroups[t]) tierGroups[t] = [];
    let tw=0,tl=0,ww=0,wl=0;
    (Array.isArray(p.history)?p.history:[]).forEach(h=>{
      if(h.result==='승')tw++; else if(h.result==='패')tl++;
      const d=dNum(h.date||h.d||'');
      if(d>=fromN&&d<=toN){ if(h.result==='승')ww++; else if(h.result==='패')wl++; }
    });
    tierGroups[t].push({...p,_tw:tw,_tl:tl,_ww:ww,_wl:wl,_wa:ww+wl>0});
  });

  const orderedTiers = TIERS_LOCAL.filter(t=>tierGroups[t])
    .concat(Object.keys(tierGroups).filter(t=>!TIERS_LOCAL.includes(t)));

  // 첫 렌더 시 최상위 티어 1개만 펼침
  if (window._b2TierCollapsed === null) {
    window._b2TierCollapsed = new Set(orderedTiers.slice(1));
  }

  // 전체 대학 색상 맵
  const uColorMap = {};
  univList.forEach(u=>{ uColorMap[u.name]=gc(u.name)||'#64748b'; });

  let h = `<style>
    .b2tv2-section { margin-bottom:10px; border-radius:14px; overflow:hidden; box-shadow:0 2px 12px #0001; }
    .b2tv2-hdr { padding:12px 16px; display:flex; align-items:center; gap:8px; cursor:pointer; user-select:none; transition:filter .15s; }
    .b2tv2-hdr:hover { filter:brightness(.95); }
    .b2tv2-body { padding:12px 16px 16px; background:var(--surface); border:1px solid var(--border2); border-top:none; border-radius:0 0 14px 14px; }
    .b2tv2-chips { display:flex; flex-wrap:wrap; gap:5px; }
    .b2tv2-stat-row { display:flex; align-items:center; gap:6px; flex-wrap:wrap; margin-bottom:10px; }
    .b2tv2-badge { font-size:11px; font-weight:800; padding:2px 8px; border-radius:8px; }
    .b2tv2-wr-bar { height:6px; border-radius:3px; overflow:hidden; background:var(--border2); flex:1; min-width:60px; }
    .b2tv2-univ-bar { display:flex; height:7px; border-radius:4px; overflow:hidden; margin:8px 0 6px; }
    .b2tv2-expand-all { padding:6px 14px; border-radius:20px; border:1.5px solid var(--border2); background:var(--surface); font-size:12px; font-weight:700; color:var(--text2); cursor:pointer; transition:all .15s; }
    .b2tv2-expand-all:hover { border-color:var(--text1); color:var(--text1); }
  </style>`;

  // 상단 헤더
  const totalVis=vis.length;
  h += `<div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;padding:10px 16px;background:var(--surface);border:1px solid var(--border2);border-radius:12px;flex-wrap:wrap">
    <span style="font-size:13px;font-weight:900;color:var(--text1)">🏆 티어별 현황</span>
    <span style="font-size:12px;color:var(--text3)">총 ${totalVis}명</span>
    ${orderedTiers.map(t=>{
      const col=typeof getTierBtnColor==='function'?getTierBtnColor(t):'#64748b';
      const tcol=typeof getTierBtnTextColor==='function'?(getTierBtnTextColor(t)||'#fff'):'#fff';
      const grp=tierGroups[t];
      const tw=grp.reduce((s,p)=>s+p._tw,0), tl=grp.reduce((s,p)=>s+p._tl,0);
      const tg=tw+tl; const wr=tg>0?Math.round(tw/tg*100):null;
      return `<span style="font-size:11px;font-weight:800;padding:2px 8px;border-radius:10px;background:${col};color:${tcol};cursor:pointer" title="${t}티어 ${grp.length}명${wr!==null?' · 승률'+wr+'%':''}" onclick="
        const s=window._b2TierCollapsed;
        if(s.has('${t}'))s.delete('${t}'); else s.add('${t}');
        const b=document.getElementById('b2tv2-body-${t.replace(/'/g,'_')}');
        const ic=document.getElementById('b2tv2-ic-${t.replace(/'/g,'_')}');
        if(b)b.style.display=s.has('${t}')?'none':'block';
        if(ic)ic.textContent=s.has('${t}')?'▶':'▾';
      ">${t} ${grp.length}</span>`;
    }).join('')}
    <div style="margin-left:auto;display:flex;gap:6px">
      <button class="b2tv2-expand-all" onclick="window._b2TierCollapsed.clear();render()">전체 펼치기</button>
      <button class="b2tv2-expand-all" onclick="window._b2TierCollapsed=new Set(${JSON.stringify(orderedTiers)}.slice(1));render()">전체 접기</button>
    </div>
  </div>`;

  orderedTiers.forEach(tier => {
    const grp = tierGroups[tier];
    const col  = typeof getTierBtnColor==='function'?getTierBtnColor(tier):'#64748b';
    const tcol = typeof getTierBtnTextColor==='function'?(getTierBtnTextColor(tier)||'#fff'):'#fff';
    const collapsed = window._b2TierCollapsed.has(tier);
    const tidSafe = tier.replace(/'/g,'_');

    // 통계
    const tw=grp.reduce((s,p)=>s+p._tw,0), tl=grp.reduce((s,p)=>s+p._tl,0);
    const tg=tw+tl; const wr=tg>0?Math.round(tw/tg*100):null;
    const wrColor=wr===null?'#94a3b8':wr>=60?'#10b981':wr>=40?'#f59e0b':'#ef4444';
    const weekActive=grp.filter(p=>p._wa).length;
    const weekW=grp.reduce((s,p)=>s+p._ww,0), weekL=grp.reduce((s,p)=>s+p._wl,0);

    // 종족 카운트
    const rCts={P:0,T:0,Z:0,'?':0};
    grp.forEach(p=>{const r=p.race||'?'; rCts[r in rCts?r:'?']++;});

    // 대학 분포 (상위 8개)
    const uCts={};
    grp.forEach(p=>{ const u=String(p?.univ||'').trim()||'무소속'; uCts[u]=(uCts[u]||0)+1; });
    const topU=Object.entries(uCts).sort((a,b)=>b[1]-a[1]).slice(0,8);
    const total8=topU.reduce((s,[,n])=>s+n,0);

    // 정렬
    grp.sort((a,b)=>(a.name||'').localeCompare(b.name||'','ko',{sensitivity:'base'}));

    h += `<div class="b2tv2-section">
      <div class="b2tv2-hdr" style="background:${col};color:${tcol}" onclick="(function(){
        const s=window._b2TierCollapsed;
        const b=document.getElementById('b2tv2-body-${tidSafe}');
        const ic=document.getElementById('b2tv2-ic-${tidSafe}');
        if(!b)return;
        const wasCollapsed=s.has('${tier}');
        if(wasCollapsed){s.delete('${tier}');b.style.display='block';}else{s.add('${tier}');b.style.display='none';}
        if(ic)ic.textContent=wasCollapsed?'▾':'▶';
      })()">
        <span style="font-size:17px;font-weight:900">${tier}</span>
        <span style="background:rgba(255,255,255,.22);padding:2px 10px;border-radius:20px;font-size:12px;font-weight:700">${grp.length}명</span>
        <div style="display:flex;gap:4px;align-items:center">
          ${rCts.P?`<span style="font-size:11px;background:rgba(255,255,255,.2);padding:1px 6px;border-radius:8px">🔮${rCts.P}</span>`:''}
          ${rCts.T?`<span style="font-size:11px;background:rgba(255,255,255,.2);padding:1px 6px;border-radius:8px">⚔️${rCts.T}</span>`:''}
          ${rCts.Z?`<span style="font-size:11px;background:rgba(255,255,255,.2);padding:1px 6px;border-radius:8px">🦎${rCts.Z}</span>`:''}
        </div>
        ${wr!==null?`<span style="font-size:12px;font-weight:900;background:rgba(255,255,255,.18);padding:2px 10px;border-radius:20px;color:${wr>=50?'#bbf7d0':'#fecaca'}">📈 ${wr}%</span>`:''}
        ${weekActive>0?`<span style="font-size:11px;background:rgba(255,165,0,.3);padding:2px 8px;border-radius:10px">🔥 ${weekActive}명</span>`:''}
        <span style="margin-left:auto;font-size:14px" id="b2tv2-ic-${tidSafe}">${collapsed?'▶':'▾'}</span>
      </div>
      <div id="b2tv2-body-${tidSafe}" style="display:${collapsed?'none':'block'}">
        <div class="b2tv2-body">
          <div class="b2tv2-stat-row">
            ${tg>0?`
              <span class="b2tv2-badge" style="background:#10b98118;color:#10b981">${tw}승</span>
              <span class="b2tv2-badge" style="background:#ef444418;color:#ef4444">${tl}패</span>
              <div class="b2tv2-wr-bar"><div style="width:${wr}%;height:100%;background:${wrColor};border-radius:3px"></div></div>
              <span style="font-size:12px;font-weight:900;color:${wrColor}">${wr}%</span>
            `:`<span style="font-size:11px;color:var(--text3)">전적 없음</span>`}
            ${weekActive>0?`<span class="b2tv2-badge" style="background:#f59e0b18;color:#b45309;margin-left:8px">🔥 이번주 ${weekActive}명 활동 (${weekW}승${weekL}패)</span>`:''}
          </div>
          ${topU.length>1?`
            <div style="font-size:10px;font-weight:700;color:var(--text3);margin-bottom:3px">대학 분포</div>
            <div class="b2tv2-univ-bar">
              ${topU.map(([u,n])=>`<div title="${u} ${n}명" style="flex:${n};background:${uColorMap[u]||'#94a3b8'};opacity:.85"></div>`).join('')}
            </div>
            <div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:10px">
              ${topU.map(([u,n])=>`<span style="font-size:10px;font-weight:700;padding:1px 6px;border-radius:6px;background:${uColorMap[u]||'#94a3b8'}22;color:${uColorMap[u]||'#64748b'};border:1px solid ${uColorMap[u]||'#94a3b8'}44">${u} ${n}</span>`).join('')}
              ${Object.keys(uCts).length>8?`<span style="font-size:10px;color:var(--text3)">외 ${Object.keys(uCts).length-8}개</span>`:''}
            </div>
          `:''}
          <div class="b2tv2-chips">
            ${grp.map(p=>_b2NameTag(p,col,false)).join('')}
          </div>
        </div>
      </div>
    </div>`;
  });

  return h;
}

/* ══════════════════════════════════════
   🥇 랭킹 뷰 — 대학별 종합 랭킹 리더보드
══════════════════════════════════════ */
/* ══════════════════════════════════════
   🏆 랭킹 뷰 v2 — 정렬기준 전환 + 실전승률 + 순위변동
══════════════════════════════════════ */
window._b2RankingSort = window._b2RankingSort || 'tier';

function _b2RankingView() {
  const _dissSet = new Set((typeof univCfg !== 'undefined' ? univCfg : []).filter(u=>u.dissolved||u.hidden).map(u=>String(u.name||'').trim()));
  const tieredVis = players.filter(p =>
    !p.hidden && !p.retired && !p.hideFromBoard &&
    !_dissSet.has(String(p?.univ||'').trim()) &&
    !_B2_ROLE_ORDER.includes(p.role||'')
  );
  const univList = _b2VisUnivs ? _b2VisUnivs().filter(u=>u.name && u.name!=='무소속') : [];
  const TIERS_LOCAL = typeof TIERS !== 'undefined' ? TIERS : [];
  const sortMode = window._b2RankingSort || 'tier';

  const tierScore = (tier) => {
    const idx = TIERS_LOCAL.indexOf(tier);
    return idx < 0 ? 0 : Math.max(0, (TIERS_LOCAL.length - idx) * 10);
  };

  // 이전주 날짜 범위
  const now = new Date();
  const day = now.getDay();
  const diffToMon = (day === 0 ? -6 : 1 - day);
  const thisMon = new Date(now); thisMon.setDate(now.getDate() + diffToMon);
  const prevMon = new Date(thisMon); prevMon.setDate(thisMon.getDate() - 7);
  const prevSun = new Date(thisMon); prevSun.setDate(thisMon.getDate() - 1);
  const fmt = d => d.toISOString().slice(0,10).replace(/-/g,'');
  const thisFromN = parseInt(fmt(thisMon)), thisToN = parseInt(fmt(now));
  const prevFromN = parseInt(fmt(prevMon)), prevToN  = parseInt(fmt(prevSun));
  const dateNum = s => parseInt(String(s||'').replace(/[-\.]/g,'')) || 0;

  const univStats = univList.map(u => {
    const members = tieredVis.filter(p => String(p?.univ||'').trim() === u.name);
    if (!members.length) return null;

    // 티어 점수
    const score = members.reduce((s,p) => s + tierScore(p.tier||''), 0);

    // 이번주 승률
    let tw=0, tl=0, pw=0, pl=0;
    members.forEach(p => {
      (Array.isArray(p.history)?p.history:[]).forEach(h => {
        const d = dateNum(h.date||h.d||'');
        if (d >= thisFromN && d <= thisToN) { h.result==='승'?tw++:h.result==='패'?tl++:null; }
        if (d >= prevFromN && d <= prevToN) { h.result==='승'?pw++:h.result==='패'?pl++:null; }
      });
    });
    const tg = tw+tl, pg = pw+pl;
    const wr = tg > 0 ? Math.round(tw/tg*100) : null;
    const pwr = pg > 0 ? Math.round(pw/pg*100) : null;

    const topMember = members.slice().sort((a,b)=>{
      const ia=TIERS_LOCAL.indexOf(a.tier||''),ib=TIERS_LOCAL.indexOf(b.tier||'');
      return (ia>=0?ia:999)-(ib>=0?ib:999);
    })[0];
    const topTier = topMember?.tier||'없음';
    const topTierCol = typeof getTierBtnColor==='function'?getTierBtnColor(topTier):'#64748b';
    const topTierTc  = typeof getTierBtnTextColor==='function'?(getTierBtnTextColor(topTier)||'#fff'):'#fff';
    const races={P:0,T:0,Z:0};
    members.forEach(p=>{if(p.race in races)races[p.race]++;});
    const dominantRace=Object.entries(races).sort((a,b)=>b[1]-a[1])[0]?.[0]||'?';
    const raceEmoji={P:'🔮',T:'⚔️',Z:'🦎','?':'❓'}[dominantRace]||'❓';

    return { name:u.name, color:gc(u.name)||'#64748b', count:members.length, score, topTier, topTierCol, topTierTc, races, dominantRace, raceEmoji, tw, tl, tg, wr, pwr };
  }).filter(Boolean);

  // 정렬
  const sorted = [...univStats].sort((a,b) => {
    if (sortMode === 'tier')   return b.score - a.score || b.count - a.count;
    if (sortMode === 'count')  return b.count - a.count || b.score - a.score;
    if (sortMode === 'wr')     return (b.wr??-1) - (a.wr??-1) || b.tg - a.tg;
    if (sortMode === 'games')  return b.tg - a.tg || b.tw - a.tw;
    return 0;
  });

  // 이전 순위 맵 (tier 기준 고정)
  const tierSorted = [...univStats].sort((a,b)=>b.score-a.score||b.count-a.count);
  const prevRankMap = {}; tierSorted.forEach((u,i)=>{ prevRankMap[u.name]=i+1; });

  const maxScore = Math.max(...sorted.map(u=>u.score),1);
  const maxCount = Math.max(...sorted.map(u=>u.count),1);
  const maxGames = Math.max(...sorted.map(u=>u.tg),1);
  const medals = ['🥇','🥈','🥉'];

  const sortBtns = [
    { key:'tier',  label:'🏅 티어 점수' },
    { key:'count', label:'👥 인원수' },
    { key:'wr',    label:'📈 이번주 승률' },
    { key:'games', label:'⚔️ 이번주 경기수' },
  ];

  let h = `<style>
    .b2rk2-wrap {}
    .b2rk2-sortbar { display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px }
    .b2rk2-sbtn { padding:6px 14px;border-radius:20px;border:1.5px solid var(--border2);background:var(--surface);font-size:12px;font-weight:700;color:var(--text2);cursor:pointer;transition:all .15s }
    .b2rk2-sbtn.on { background:var(--text1);color:var(--white);border-color:var(--text1) }
    .b2rk2-sbtn:hover:not(.on) { border-color:var(--text2) }
    .b2rk2-row { display:flex;align-items:center;gap:10px;padding:10px 14px;border-radius:14px;margin-bottom:6px;border:1.5px solid var(--border2);background:var(--white);cursor:pointer;position:relative;overflow:hidden;transition:border-color .12s,background .12s }
    .b2rk2-row:hover { background:var(--hover) }
    .b2rk2-row.selected { border-color:var(--text1);background:var(--hover);box-shadow:0 0 0 3px rgba(0,0,0,.06) }
    .b2rk2-row:active { transform:scale(.995) }
    .b2rk2-rank { font-size:22px;min-width:36px;text-align:center;font-weight:900 }
    .b2rk2-name { font-size:14px;font-weight:900;min-width:64px }
    .b2rk2-bar-wrap { flex:1;height:12px;border-radius:6px;background:var(--border2);overflow:hidden }
    .b2rk2-bar { height:100%;border-radius:6px;transition:width .7s ease }
    .b2rk2-score { font-size:13px;font-weight:900;min-width:52px;text-align:right }
    .b2rk2-badges { display:flex;gap:4px;flex-shrink:0;flex-wrap:wrap;align-items:center }
    .b2rk2-glow { position:absolute;inset:0;opacity:.05;pointer-events:none }
    .b2rk2-delta { font-size:11px;font-weight:800;margin-left:2px }
  </style>`;

  // 헤더 배너
  h += `<div style="margin-bottom:14px;padding:12px 16px;background:linear-gradient(135deg,#f97316,#fb923c);border-radius:14px;display:flex;align-items:center;gap:10px">
    <span style="font-size:24px">🏆</span>
    <div>
      <div style="font-size:15px;font-weight:900;color:#fff">대학별 종합 랭킹</div>
      <div style="font-size:11px;color:rgba(255,255,255,.8)">정렬 기준을 선택해 다양한 관점으로 비교</div>
    </div>
    <div style="margin-left:auto;text-align:right">
      <div style="font-size:20px;font-weight:900;color:#fff">${sorted.length}</div>
      <div style="font-size:10px;color:rgba(255,255,255,.8)">대학 참가</div>
    </div>
  </div>`;

  // 정렬 버튼
  h += `<div class="b2rk2-sortbar">
    ${sortBtns.map(b=>`<button class="b2rk2-sbtn${sortMode===b.key?' on':''}" onclick="window._b2RankingSort='${b.key}';render()">${b.label}</button>`).join('')}
  </div>`;

  h += `<div class="b2rk2-wrap">`;
  sorted.forEach((u, i) => {
    const rank = i + 1;
    const prevRank = prevRankMap[u.name] || rank;
    const rankDelta = prevRank - rank; // 양수=상승
    const rankDisplay = medals[i] || `<span style="font-size:14px;font-weight:900;color:var(--text3)">${rank}</span>`;
    const isTop3 = i < 3;

    // 정렬 기준에 따라 바 값 결정
    let barW = 0, scoreLabel = '';
    if (sortMode === 'tier')  { barW=Math.round(u.score/maxScore*100); scoreLabel=`${u.score}pt`; }
    if (sortMode === 'count') { barW=Math.round(u.count/maxCount*100); scoreLabel=`${u.count}명`; }
    if (sortMode === 'wr')    { barW=u.wr??0; scoreLabel=u.wr!==null?`${u.wr}%`:'-'; }
    if (sortMode === 'games') { barW=Math.round(u.tg/Math.max(maxGames,1)*100); scoreLabel=`${u.tg}전`; }

    // 순위 변동 배지
    let deltaHtml = '';
    if (sortMode === 'tier' && rankDelta !== 0) {
      const col = rankDelta>0?'#10b981':'#ef4444';
      const arrow = rankDelta>0?'▲':'▼';
      deltaHtml = `<span class="b2rk2-delta" style="color:${col}">${arrow}${Math.abs(rankDelta)}</span>`;
    }

    // 이번주 승률 뱃지
    const wrBadge = u.wr!==null
      ? `<span style="font-size:10px;padding:2px 7px;border-radius:8px;background:${u.wr>=60?'#10b981':u.wr>=40?'#f59e0b':'#ef4444'};color:#fff;font-weight:800">📈 ${u.wr}%</span>`
      : '';
    const pWrDelta = (u.wr!==null && u.pwr!==null)
      ? `<span style="font-size:10px;color:${u.wr>=u.pwr?'#10b981':'#ef4444'};font-weight:700">${u.wr>=u.pwr?'▲':'▼'}${Math.abs(u.wr-u.pwr)}%</span>`
      : '';

    h += `<div class="b2rk2-row" onclick="(function(el){document.querySelectorAll('.b2rk2-row').forEach(function(r){r.classList.remove('selected')});el.classList.toggle('selected')})(this)" style="${isTop3?`border-color:${u.color}66;background:${u.color}08`:''
    }">
      <div class="b2rk2-glow" style="background:radial-gradient(ellipse at 0% 50%,${u.color},transparent 60%)"></div>
      <div class="b2rk2-rank">${rankDisplay}${deltaHtml}</div>
      <div class="b2rk2-name" style="color:${u.color}">${u.name}</div>
      <div class="b2rk2-bar-wrap">
        <div class="b2rk2-bar" style="width:${barW}%;background:linear-gradient(90deg,${u.color},${u.color}88)"></div>
      </div>
      <div class="b2rk2-score" style="color:${u.color}">${scoreLabel}</div>
      <div class="b2rk2-badges">
        <span style="font-size:10px;font-weight:800;padding:2px 8px;border-radius:8px;background:${u.topTierCol};color:${u.topTierTc}">TOP ${u.topTier}</span>
        <span style="font-size:10px;font-weight:700;padding:2px 8px;border-radius:8px;background:var(--surface);color:var(--text2)">${u.raceEmoji} ${u.count}명</span>
        ${u.tg > 0 ? wrBadge : ''}
        ${pWrDelta}
      </div>
    </div>`;
  });
  h += `</div>`;

  // 점수 기준 설명
  if (sortMode === 'tier') {
    h += `<div style="margin-top:12px;padding:10px 14px;background:var(--surface);border-radius:10px;border:1px solid var(--border2)">
      <div style="font-size:11px;font-weight:700;color:var(--text3);margin-bottom:6px">📌 티어 점수 기준</div>
      <div style="display:flex;flex-wrap:wrap;gap:6px">
        ${TIERS_LOCAL.filter(t=>tieredVis.some(p=>p.tier===t)).map(t=>{
          const col=typeof getTierBtnColor==='function'?getTierBtnColor(t):'#64748b';
          const tc=typeof getTierBtnTextColor==='function'?(getTierBtnTextColor(t)||'#fff'):'#fff';
          return `<span style="font-size:10px;font-weight:800;padding:2px 8px;border-radius:8px;background:${col};color:${tc}">${t} = ${tierScore(t)}pt</span>`;
        }).join('')}
      </div>
    </div>`;
  }

  return h;
}
/* ══════════════════════════════════════
   🕸️ 레이더 뷰 v2 — 전체평균선 + 강점축 하이라이트 + 수치 테이블
══════════════════════════════════════ */
function _b2RadarView() {
  const _dissSet = new Set((typeof univCfg !== 'undefined' ? univCfg : []).filter(u=>u.dissolved||u.hidden).map(u=>String(u.name||'').trim()));
  const tieredVis = players.filter(p =>
    !p.hidden && !p.retired && !p.hideFromBoard &&
    !_dissSet.has(String(p?.univ||'').trim()) &&
    !_B2_ROLE_ORDER.includes(p.role||'')
  );
  const univList = _b2VisUnivs ? _b2VisUnivs().filter(u=>u.name && u.name!=='무소속') : [];
  const TIERS_LOCAL = typeof TIERS !== 'undefined' ? TIERS : [];

  try {
    const sig = (function(){
      try {
        const arrs=[miniM,univM,ckM,proM,ttM,comps,tourneys,proTourneys,indM,gjM];
        return arrs.map(a=>Array.isArray(a)?a.length:0).join('|');
      } catch(e) { return ''; }
    })();
    if (typeof window.__b2_radar_hist_sig === 'undefined') window.__b2_radar_hist_sig = '';
    if (window.__b2_radar_hist_sig !== sig && typeof _rebuildAllPlayerHistoryCore === 'function') {
      _rebuildAllPlayerHistoryCore();
      window.__b2_radar_hist_sig = sig;
    }
  } catch(e) {}

  const tierScore = t => {
    const i = TIERS_LOCAL.indexOf(t);
    return i < 0 ? 0 : Math.max(0, (TIERS_LOCAL.length - i) * 10);
  };
  const _hist = p => Array.isArray(p && p.history) ? p.history : [];
  const _modeKey = m => {
    if (!m) return '';
    m = String(m).trim();
    if (m === '미니' || m === '친선' || m === '미니대전' || m.includes('미니')) return 'mini';
    if (m === '대학대전' || m === '대학' || m.includes('대학대전')) return 'univm';
    if (m === 'CK' || m.includes('CK')) return 'ck';
    if (m === '티어대회' || m.includes('티어')) return 'tt';
    if (m === '대회' || m === '일반대회' || m === '조별리그' || m === '토너먼트' || m === '조별대회' || m.includes('일반대회') || m.includes('대회') || m.includes('조별') || m.includes('토너')) return 'comp';
    return '';
  };

  const _radarCacheSig = (function(){
    try{
      const arrs=[miniM,univM,ckM,proM,ttM,comps,tourneys,proTourneys,indM,gjM];
      const lens = arrs.map(a=>Array.isArray(a)?a.length:0).join('|');
      const pLen = Array.isArray(players)?players.length:0;
      const hLen = (Array.isArray(players)?players:[]).reduce((s,p)=>s+(Array.isArray(p?.history)?p.history.length:0),0);
      const uLen = (typeof univCfg!=='undefined' && Array.isArray(univCfg)) ? univCfg.length : 0;
      return `${pLen}|${hLen}|${uLen}|${lens}`;
    }catch(e){ return ''; }
  })();

  if (!window.__b2_radar_stats_cache) window.__b2_radar_stats_cache = { sig:'', univStats:[] };

  let univStats = window.__b2_radar_stats_cache.sig === _radarCacheSig
    ? (window.__b2_radar_stats_cache.univStats || [])
    : null;

  if (!Array.isArray(univStats)) {
    univStats = univList.map(u => {
      const members = tieredVis.filter(p => String(p?.univ||'').trim() === u.name);
      if (!members.length) return null;
      const total = members.length;
      const avgScore = members.reduce((s,p)=>s+tierScore(p.tier||''),0) / total;
      const part = { mini:0, univm:0, ck:0, tt:0, comp:0 };
      let wins=0, losses=0;
      members.forEach(p => {
        const seen = { mini:false, univm:false, ck:false, tt:false, comp:false };
        _hist(p).forEach(h => {
          const k = _modeKey(h && h.mode);
          if (k && (k in part)) {
            const r2 = String(h && h.result || '').trim();
            if (r2==='승') wins++; else if (r2==='패') losses++;
          }
          if (k && k in seen) seen[k] = true;
        });
        Object.keys(seen).forEach(k=>{ if(seen[k]) part[k]++; });
      });
      const games = wins+losses;
      const wr = games>0?Math.round(wins/games*100):null;
      return { name:u.name, color:gc(u.name)||'#64748b', total, avgScore, wins, losses, wr,
        partMini:part.mini/total, partUnivm:part.univm/total, partCk:part.ck/total,
        partTt:part.tt/total, partComp:part.comp/total };
    }).filter(Boolean).sort((a,b)=>b.total-a.total);
    window.__b2_radar_stats_cache.sig = _radarCacheSig;
    window.__b2_radar_stats_cache.univStats = univStats;
  }

  const maxTotal = Math.max(...univStats.map(u=>u.total), 1);
  const maxAvg   = Math.max(...univStats.map(u=>u.avgScore), 1);
  const maxWins  = Math.max(...univStats.map(u=>u.wins||0), 1);
  const maxLoss  = Math.max(...univStats.map(u=>u.losses||0), 1);

  const AXES      = ['인원','평균티어','승','패','미니','대학대전','대학CK','티어대회','일반대회'];
  const AXES_DESC = ['선수 수','티어 점수 평균','총 승리수','총 패배수','참가율','참가율','참가율','참가율','참가율'];
  const N = AXES.length;

  const getVals = u => [
    u.total/maxTotal, u.avgScore/maxAvg,
    (u.wins||0)/maxWins, (u.losses||0)/maxLoss,
    u.partMini, u.partUnivm, u.partCk, u.partTt, u.partComp
  ];

  // 전체 평균값 계산
  const avgVals = AXES.map((_,i) => {
    const vals = univStats.map(u=>getVals(u)[i]);
    return vals.reduce((s,v)=>s+v,0)/Math.max(vals.length,1);
  });

  // 실제 수치 (테이블용)
  const getRawVals = u => [
    u.total, Math.round(u.avgScore*10)/10,
    u.wins||0, u.losses||0,
    Math.round(u.partMini*100)+'%', Math.round(u.partUnivm*100)+'%',
    Math.round(u.partCk*100)+'%', Math.round(u.partTt*100)+'%',
    Math.round(u.partComp*100)+'%'
  ];

  const univDataJson = JSON.stringify(univStats.map(u=>({ name:u.name, color:u.color, total:u.total, wr:u.wr, wins:u.wins, losses:u.losses, vals:getVals(u), raw:getRawVals(u) })));
  const axesJson     = JSON.stringify(AXES);
  const axesDescJson = JSON.stringify(AXES_DESC);
  const avgJson      = JSON.stringify(avgVals);
  const uid = 'rdr_' + Math.random().toString(36).slice(2,8);

  return `<style>
    #${uid}-wrap {}
    #${uid}-sel { display:flex; flex-wrap:wrap; gap:6px; margin-bottom:12px; }
    .${uid}-chip { padding:5px 12px; border-radius:20px; border:1.5px solid var(--border2); background:var(--surface); font-size:11px; font-weight:700; color:var(--text2); cursor:pointer; transition:all .12s; }
    .${uid}-chip.on { color:#fff; border-color:transparent; }
    .${uid}-chip:hover:not(.on) { border-color:var(--text2); }
    #${uid}-canvas { display:block; max-width:520px; margin:0 auto; cursor:crosshair; }
    #${uid}-legend { display:flex; flex-wrap:wrap; gap:8px; margin-top:10px; justify-content:center; }
    #${uid}-table { width:100%; border-collapse:collapse; margin-top:14px; font-size:11px; }
    #${uid}-table th { padding:5px 8px; background:var(--bg); border-bottom:2px solid var(--border2); font-size:10px; font-weight:800; color:var(--text3); text-align:center; white-space:nowrap; position:sticky; top:0; z-index:1; }
    #${uid}-table th:first-child { text-align:left; }
    #${uid}-table td { padding:5px 8px; border-bottom:1px solid var(--border2); text-align:center; font-weight:700; }
    #${uid}-table td:first-child { text-align:left; font-weight:900; }
    #${uid}-table tr:hover td { background:var(--hover); }
    #${uid}-table td.hi { background:#fef9c366; font-weight:900; }
    .${uid}-avg-note { font-size:10px; color:var(--text3); display:flex; align-items:center; gap:4px; margin-top:4px; }
    #${uid}-tooltip { position:fixed; pointer-events:none; opacity:0; background:var(--white); border:1px solid var(--border2); border-radius:10px; padding:8px 12px; box-shadow:0 4px 20px #0003; font-size:11px; font-weight:700; color:var(--text2); z-index:999; transition:opacity .1s; max-width:180px; }
  </style>
  <div id="${uid}-wrap">
    <div style="margin-bottom:12px;padding:10px 14px;background:linear-gradient(135deg,#a855f7,#9333ea);border-radius:12px;display:flex;align-items:center;gap:8px">
      <span style="font-size:20px">🕸️</span>
      <div>
        <div style="font-size:13px;font-weight:900;color:#fff">대학별 다차원 레이더</div>
        <div style="font-size:11px;color:rgba(255,255,255,.8)">최대 3개 선택 · 점선 = 전체 평균 · 강점 축 자동 하이라이트</div>
      </div>
    </div>
    <div style="margin-bottom:10px;padding:10px 14px;background:var(--surface);border:1px solid var(--border2);border-radius:12px;font-size:11px;color:var(--text3);line-height:1.6">
      <strong style="color:var(--text2)">축 설명</strong> —
      승/패: 공식 기록 기준 · 참가율: 해당 종목 1경기 이상 뛴 비율 · 인원·평균티어: 최대값 기준 정규화
    </div>
    <div id="${uid}-sel"></div>
    <div style="position:relative">
      <canvas id="${uid}-canvas" width="520" height="480"></canvas>
      <div id="${uid}-tooltip"></div>
    </div>
    <div id="${uid}-legend"></div>
    <div style="overflow-x:auto;margin-top:4px">
      <table id="${uid}-table"><thead></thead><tbody></tbody></table>
    </div>
  </div>
  <script>
  (function(){
    const UNIVS    = ${univDataJson};
    const AXES     = ${axesJson};
    const AXES_DESC= ${axesDescJson};
    const AVG_VALS = ${avgJson};
    const N = AXES.length;
    const canvas  = document.getElementById('${uid}-canvas');
    const selEl   = document.getElementById('${uid}-sel');
    const legendEl= document.getElementById('${uid}-legend');
    const tableEl = document.getElementById('${uid}-table');
    const ttipEl  = document.getElementById('${uid}-tooltip');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const _cssVar = k => { try{ return String(getComputedStyle(document.documentElement).getPropertyValue(k)||'').trim(); }catch(e){ return ''; } };
    const TEXT2  = ()=> _cssVar('--text2') || '#475569';
    const TEXT3  = ()=> _cssVar('--text3') || '#64748b';
    const BORDER = ()=> _cssVar('--border2') || '#e2e8f0';
    let selected = [];
    let mousePos = null;

    const W=520,H=480,cx=260,cy=240,R=155;
    const angle = i => (Math.PI*2*i/N) - Math.PI/2;
    const radarPt = (val,i) => { const a=angle(i); return {x:cx+Math.cos(a)*R*val, y:cy+Math.sin(a)*R*val}; };

    // 강점 축 계산 (선택된 대학이 전체 평균 대비 가장 높은 축)
    function getStrengthAxes(u) {
      return u.vals.map((v,i)=>({ i, diff:v-(AVG_VALS[i]||0) })).filter(d=>d.diff>0.12).sort((a,b)=>b.diff-a.diff).slice(0,2).map(d=>d.i);
    }

    // 칩 빌드
    UNIVS.forEach(u => {
      const chip = document.createElement('button');
      chip.className = '${uid}-chip';
      chip.textContent = u.name;
      chip.onclick = () => {
        if (selected.includes(u.name)) {
          selected = selected.filter(n=>n!==u.name);
        } else {
          if (selected.length >= 3) selected.shift();
          selected.push(u.name);
        }
        document.querySelectorAll('.${uid}-chip').forEach(c => {
          const un = UNIVS.find(u2=>u2.name===c.textContent);
          const isOn = selected.includes(c.textContent);
          c.classList.toggle('on', isOn);
          c.style.background = isOn && un ? un.color : '';
        });
        draw(); buildTable();
      };
      selEl.appendChild(chip);
    });

    function draw() {
      ctx.clearRect(0,0,W,H);
      const t2=TEXT2(), t3=TEXT3(), bd=BORDER();
      const activeUnivs = UNIVS.filter(u=>selected.includes(u.name));

      // 배경 링
      for (let r=1;r<=5;r++) {
        const ratio=r/5;
        ctx.beginPath();
        for (let i=0;i<N;i++) { const {x,y}=radarPt(ratio,i); i===0?ctx.moveTo(x,y):ctx.lineTo(x,y); }
        ctx.closePath();
        ctx.strokeStyle=\`rgba(100,116,139,\${r===5?0.25:0.12})\`;
        ctx.lineWidth=r===5?1.5:1; ctx.stroke();
        if(r===5){ ctx.fillStyle='rgba(100,116,139,0.04)'; ctx.fill(); }
        // 링 수치
        ctx.save(); ctx.font='700 9px sans-serif'; ctx.fillStyle=t3; ctx.textAlign='left';
        ctx.fillText((ratio*100).toFixed(0)+'%', cx+4, cy-R*ratio+3);
        ctx.restore();
      }

      // 전체 평균선 (점선)
      ctx.save();
      ctx.beginPath();
      AVG_VALS.forEach((v,i)=>{ const {x,y}=radarPt(Math.max(0.01,v),i); i===0?ctx.moveTo(x,y):ctx.lineTo(x,y); });
      ctx.closePath();
      ctx.setLineDash([4,4]); ctx.strokeStyle='rgba(148,163,184,0.7)'; ctx.lineWidth=1.5; ctx.stroke();
      ctx.fillStyle='rgba(148,163,184,0.06)'; ctx.fill();
      ctx.setLineDash([]); ctx.restore();

      // 강점 축 하이라이트 (선택된 대학 기준)
      const strengthSet = new Set();
      activeUnivs.forEach(u=>{ getStrengthAxes(u).forEach(i=>strengthSet.add(i)); });

      // 축 라인 + 레이블
      for (let i=0;i<N;i++) {
        const {x,y}=radarPt(1,i);
        const isStrength = strengthSet.has(i);
        ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(x,y);
        ctx.strokeStyle = isStrength ? 'rgba(251,191,36,0.7)' : 'rgba(100,116,139,0.2)';
        ctx.lineWidth = isStrength ? 2.5 : 1.2; ctx.stroke();

        const la=angle(i), lx=cx+Math.cos(la)*(R+26), ly=cy+Math.sin(la)*(R+26);
        ctx.textAlign='center'; ctx.textBaseline='middle';
        if (isStrength) {
          ctx.font='900 13px sans-serif'; ctx.fillStyle='#b45309';
        } else {
          ctx.font='800 11px sans-serif'; ctx.fillStyle=t2;
        }
        ctx.fillText(AXES[i], lx, ly-6);
        ctx.font='600 9px sans-serif'; ctx.fillStyle=t3;
        ctx.fillText(AXES_DESC[i]||'', lx, ly+7);
      }

      // 데이터 폴리곤
      if (activeUnivs.length===0) {
        ctx.fillStyle=t3; ctx.textAlign='center'; ctx.textBaseline='middle';
        ctx.font='900 13px sans-serif'; ctx.fillText('대학을 선택하세요', cx, cy-10);
        ctx.font='700 11px sans-serif'; ctx.fillText('최대 3개까지 동시 비교 가능', cx, cy+12);
        legendEl.innerHTML='';
        return;
      }

      activeUnivs.forEach(u => {
        ctx.beginPath();
        u.vals.forEach((v,i)=>{ const {x,y}=radarPt(Math.max(0.01,v),i); i===0?ctx.moveTo(x,y):ctx.lineTo(x,y); });
        ctx.closePath();
        ctx.fillStyle=u.color+'28'; ctx.fill();
        ctx.strokeStyle=u.color; ctx.lineWidth=2.5; ctx.stroke();
        // 점
        u.vals.forEach((v,i)=>{ const {x,y}=radarPt(Math.max(0.01,v),i);
          ctx.beginPath(); ctx.arc(x,y,5,0,Math.PI*2);
          ctx.fillStyle=u.color; ctx.fill();
          ctx.strokeStyle='#fff'; ctx.lineWidth=1.5; ctx.stroke();
        });
      });

      // 마우스 hover → 가장 가까운 점 강조
      if (mousePos) {
        let minDist=Infinity, bestU=null, bestI=-1;
        activeUnivs.forEach(u=>{ u.vals.forEach((v,i)=>{ const {x,y}=radarPt(Math.max(0.01,v),i); const d=Math.hypot(mousePos.x-x,mousePos.y-y); if(d<minDist){minDist=d;bestU=u;bestI=i;} }); });
        if (bestU && minDist<24) {
          const {x,y}=radarPt(Math.max(0.01,bestU.vals[bestI]),bestI);
          ctx.beginPath(); ctx.arc(x,y,9,0,Math.PI*2);
          ctx.strokeStyle=bestU.color; ctx.lineWidth=3; ctx.stroke();
          // 툴팁
          ttipEl.style.opacity='1';
          ttipEl.style.left=(x/W*canvas.getBoundingClientRect().width+canvas.getBoundingClientRect().left+12)+'px';
          ttipEl.style.top=(y/H*canvas.getBoundingClientRect().height+canvas.getBoundingClientRect().top-30)+'px';
          ttipEl.innerHTML=\`<div style="color:\${bestU.color};font-weight:900">\${bestU.name}</div><div style="color:#475569">\${AXES[bestI]}: <strong>\${bestU.raw[bestI]}</strong></div><div style="font-size:10px;color:#94a3b8">정규화 평균 \${Math.round((AVG_VALS[bestI]||0)*100)}%</div>\`;
        } else { ttipEl.style.opacity='0'; }
      }

      // 범례
      legendEl.innerHTML = activeUnivs.map(u=>{
        const str = getStrengthAxes(u).map(i=>AXES[i]).join(', ');
        return \`<div style="display:flex;align-items:center;gap:6px;padding:5px 10px;border-radius:10px;background:var(--surface);border:1.5px solid \${u.color}44">
          <span style="width:12px;height:12px;border-radius:50%;background:\${u.color};flex-shrink:0"></span>
          <span style="font-size:12px;font-weight:900;color:\${u.color}">\${u.name}</span>
          <span style="font-size:11px;color:var(--text3);">\${u.total}명\${u.wr!==null?' · '+u.wr+'%':''}\${(u.wins+u.losses)>0?' · '+(u.wins+u.losses)+'전':''}</span>
          \${str?'<span style="font-size:10px;background:#fef9c3;color:#b45309;padding:1px 5px;border-radius:5px;font-weight:800">강점: '+str+'</span>':''}
        </div>\`;
      }).join('');
    }

    // 수치 테이블 빌드
    function buildTable() {
      const active = UNIVS.filter(u=>selected.includes(u.name));
      if (!tableEl) return;
      if (!active.length) { tableEl.innerHTML=''; return; }
      const thead=tableEl.querySelector('thead'), tbody=tableEl.querySelector('tbody');
      if (!thead || !tbody) {
        // thead/tbody가 없으면 재생성
        tableEl.innerHTML='<thead></thead><tbody></tbody>';
      }
      const th=tableEl.querySelector('thead'), tb=tableEl.querySelector('tbody');
      if (!th || !tb) return;
      // 각 축별 최고값 인덱스
      const maxIdx = AXES.map((_,ai)=>{
        let best=-1, bestV=-Infinity;
        active.forEach((u,ui)=>{ if(u.vals[ai]>bestV){bestV=u.vals[ai];best=ui;} });
        return best;
      });
      th.innerHTML = \`<tr><th>항목</th>\${active.map(u=>\`<th style="color:\${u.color}">\${u.name}</th>\`).join('')}<th style="color:#94a3b8">정규화 평균</th></tr>\`;
      tb.innerHTML = AXES.map((ax,ai)=>{
        const avgRaw=(AVG_VALS[ai]*100).toFixed(0)+'%';
        return \`<tr>
          <td style="font-weight:800;color:var(--text2)">\${ax}<div style="font-size:9px;color:var(--text3);font-weight:600">\${AXES_DESC[ai]}</div></td>
          \${active.map((u,ui)=>\`<td class="\${ui===maxIdx[ai]?'hi':''}" style="color:\${ui===maxIdx[ai]?u.color:'var(--text2)'}">\${u.raw[ai]}\${ui===maxIdx[ai]?'<span style="font-size:9px;margin-left:2px">★</span>':''}</td>\`).join('')}
          <td style="color:#94a3b8">\${avgRaw}</td>
        </tr>\`;
      }).join('');
    }

    canvas.addEventListener('mousemove', e => {
      const rect=canvas.getBoundingClientRect();
      const scX=W/rect.width, scY=H/rect.height;
      mousePos={ x:(e.clientX-rect.left)*scX, y:(e.clientY-rect.top)*scY };
      draw();
    });
    canvas.addEventListener('mouseleave', ()=>{ mousePos=null; ttipEl.style.opacity='0'; draw(); });

    // 반응형
    const ro=new ResizeObserver(()=>draw());
    ro.observe(canvas.parentElement);
    draw(); buildTable();
  })();
  </script>`;
}
/* ══════════════════════════════════════
   📊 요약 통계 뷰 - 인터랙티브 대시보드
══════════════════════════════════════ */
/* ══════════════════════════════════════
   📊 요약 뷰 v2 — 활동인원·통산승률·신입 추가
══════════════════════════════════════ */
function _b2SummaryView() {
  const _dissSet = new Set((typeof univCfg !== 'undefined' ? univCfg : []).filter(u=>u.dissolved||u.hidden).map(u=>String(u.name||'').trim()));
  const vis = players.filter(p => !p.hidden && !p.retired && !p.hideFromBoard && !_dissSet.has(String(p?.univ||'').trim()));
  const tieredVis = vis.filter(p => !_B2_ROLE_ORDER.includes(p.role||''));
  const roledVis  = vis.filter(p => _B2_ROLE_ORDER.includes(p.role||''));
  const univList  = _b2VisUnivs ? _b2VisUnivs().filter(u=>u.name && u.name!=='무소속') : [];

  // 종족 카운트
  const raceCts = {P:0,T:0,Z:0,'?':0};
  tieredVis.forEach(p => { const r=p.race||'?'; raceCts[r in raceCts?r:'?']++; });
  const tierCts = {};
  tieredVis.forEach(p => { const t=p.tier||'미정'; tierCts[t]=(tierCts[t]||0)+1; });

  // 이번주 활동 인원 & 통산 승률
  const now = new Date();
  const day = now.getDay();
  const diffToMon = (day===0?-6:1-day);
  const mon = new Date(now); mon.setDate(now.getDate()+diffToMon);
  const dateNum = s => parseInt(String(s||'').replace(/[-\.]/g,''))||0;
  const thisFromN = dateNum(mon.toISOString().slice(0,10));
  const thisToN   = dateNum(now.toISOString().slice(0,10));

  let totalW=0, totalL=0, weekActive=new Set();
  tieredVis.forEach(p => {
    (Array.isArray(p.history)?p.history:[]).forEach(h => {
      if (h.result==='승') totalW++;
      else if (h.result==='패') totalL++;
      const d = dateNum(h.date||h.d||'');
      if (d>=thisFromN && d<=thisToN) weekActive.add(p.name);
    });
  });
  const totalG = totalW+totalL;
  const totalWr = totalG>0 ? Math.round(totalW/totalG*100) : null;

  // 최근 합류 선수 (history 첫 경기 기준 최근 30일)
  const thirtyDaysAgo = new Date(now); thirtyDaysAgo.setDate(now.getDate()-30);
  const recentN = dateNum(thirtyDaysAgo.toISOString().slice(0,10));
  const newPlayers = tieredVis.filter(p => {
    const hist = Array.isArray(p.history)?p.history:[];
    if (!hist.length) return false;
    const firstD = Math.min(...hist.map(h=>dateNum(h.date||h.d||'')).filter(d=>d>0));
    return firstD >= recentN;
  }).sort((a,b) => {
    const fa = Math.min(...(Array.isArray(a.history)?a.history:[]).map(h=>dateNum(h.date||h.d||'')).filter(d=>d>0));
    const fb = Math.min(...(Array.isArray(b.history)?b.history:[]).map(h=>dateNum(h.date||h.d||'')).filter(d=>d>0));
    return fb - fa;
  }).slice(0, 8);

  // 대학별 스탯
  const univStats = univList.map(u => {
    const members = tieredVis.filter(p => String(p?.univ||'').trim()===String(u.name||'').trim());
    const rCts={P:0,T:0,Z:0};
    members.forEach(p=>{if(p.race in rCts)rCts[p.race]++;});
    const tierDist={};
    members.forEach(p=>{const t=p.tier||'미정';tierDist[t]=(tierDist[t]||0)+1;});
    return {name:u.name,color:gc(u.name),count:members.length,races:rCts,tiers:tierDist};
  }).filter(u=>u.count>0).sort((a,b)=>b.count-a.count);

  const maxCount = univStats.length>0?univStats[0].count:1;
  const orderedTiers = (typeof TIERS!=='undefined'?TIERS:[]).filter(t=>tierCts[t]);
  const total3 = raceCts.P+raceCts.T+raceCts.Z||1;

  // 도넛 차트
  const donutRings = () => {
    const size=110,cx=55,cy=55,r=38,stroke=18;
    const total=raceCts.P+raceCts.T+raceCts.Z||1;
    const segs=[{val:raceCts.P,col:'#7c3aed',label:'P'},{val:raceCts.T,col:'#0284c7',label:'T'},{val:raceCts.Z,col:'#059669',label:'Z'}].filter(s=>s.val>0);
    const circ=2*Math.PI*r;
    let offset=0;
    const paths=segs.map(s=>{
      const dash=(s.val/total)*circ;
      const el=`<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${s.col}" stroke-width="${stroke}" stroke-dasharray="${dash.toFixed(2)} ${circ.toFixed(2)}" stroke-dashoffset="${(-offset).toFixed(2)}" transform="rotate(-90 ${cx} ${cy})"/>`;
      offset+=dash; return el;
    });
    return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="var(--border2)" stroke-width="${stroke}"/>
      ${paths.join('')}
      <text x="${cx}" y="${cy-6}" text-anchor="middle" font-size="18" font-weight="900" fill="var(--text1)">${tieredVis.length}</text>
      <text x="${cx}" y="${cy+10}" text-anchor="middle" font-size="9" font-weight="600" fill="var(--text3)">선수</text>
    </svg>`;
  };

  let h = `<style>
    .b2s-grid7 { display:grid; grid-template-columns:repeat(7,1fr); gap:10px; margin-bottom:16px; }
    @media(max-width:700px){ .b2s-grid7{ grid-template-columns:repeat(4,1fr); } }
    @media(max-width:420px){ .b2s-grid7{ grid-template-columns:repeat(2,1fr); } }
    .b2s-kpi { border-radius:14px; padding:14px 12px; text-align:center; position:relative; overflow:hidden; border:1px solid var(--border2); transition:transform .15s,box-shadow .15s; cursor:default; }
    .b2s-kpi:hover { transform:translateY(-2px); box-shadow:0 6px 24px #0002; }
    .b2s-kpi-num { font-size:26px; font-weight:900; line-height:1.1; }
    .b2s-kpi-lbl { font-size:11px; font-weight:700; margin-top:3px; opacity:.75; }
    .b2s-kpi-sub { font-size:10px; opacity:.6; margin-top:1px; }
    .b2s-kpi-glow { position:absolute;inset:0;opacity:.08;pointer-events:none; }
    .b2s-2col { display:grid; grid-template-columns:1fr 1fr 1fr; gap:14px; margin-bottom:14px; }
    @media(max-width:780px){ .b2s-2col{ grid-template-columns:1fr 1fr; } }
    @media(max-width:520px){ .b2s-2col{ grid-template-columns:1fr; } }
    .b2s-panel { background:var(--surface); border:1px solid var(--border2); border-radius:14px; padding:16px; }
    .b2s-panel-title { font-size:13px; font-weight:900; color:var(--text1); margin-bottom:12px; display:flex; align-items:center; gap:6px; }
    .b2s-univ-row { display:flex; align-items:center; gap:8px; padding:5px 0; }
    .b2s-univ-row + .b2s-univ-row { border-top:1px solid var(--border2); }
    .b2s-bar-track { flex:1; height:12px; border-radius:6px; overflow:hidden; background:var(--border2); display:flex; }
    .b2s-tier-chip { display:inline-flex; flex-direction:column; align-items:center; padding:6px 10px; border-radius:10px; min-width:46px; }
    .b2s-top-univ { display:grid; grid-template-columns:repeat(auto-fill,minmax(130px,1fr)); gap:8px; }
    .b2s-univ-card { border-radius:12px; padding:10px 12px; border:1.5px solid; position:relative; overflow:hidden; transition:transform .12s,box-shadow .12s; cursor:default; }
    .b2s-univ-card:hover { transform:translateY(-2px); box-shadow:0 4px 16px #0002; }
    .b2s-new-player { display:inline-flex;align-items:center;gap:4px;padding:3px 8px;border-radius:20px;background:var(--surface);border:1px solid var(--border2);font-size:11px;font-weight:700;color:var(--text2);margin:2px; }
  </style>`;

  // KPI 7개 (통산승률 + 이번주 활동 추가)
  const kpis = [
    { num: vis.length,           lbl: '전체 선수', col:'#3b82f6', icon:'👥' },
    { num: univList.length,      lbl: '활동 대학', col:'#10b981', icon:'🏫' },
    { num: raceCts.P,            lbl: '프로토스',  col:'#7c3aed', icon:'🔮' },
    { num: raceCts.T,            lbl: '테란',      col:'#0284c7', icon:'⚔️' },
    { num: raceCts.Z,            lbl: '저그',      col:'#059669', icon:'🦎' },
    { num: weekActive.size,      lbl: '이번주 활동', col:'#f59e0b', icon:'🔥', sub:`${totalW}승 ${totalL}패` },
    { num: totalWr!==null?`${totalWr}%`:'-', lbl:'통산 승률', col:'#ec4899', icon:'📊', sub:`${totalG.toLocaleString()}전` },
  ];

  h += `<div class="b2s-grid7">
    ${kpis.map(k=>`
    <div class="b2s-kpi" style="background:${k.col}12">
      <div class="b2s-kpi-glow" style="background:radial-gradient(circle at 50% 0%,${k.col},transparent 70%)"></div>
      <div style="font-size:20px;margin-bottom:2px">${k.icon}</div>
      <div class="b2s-kpi-num" style="color:${k.col}">${k.num}</div>
      <div class="b2s-kpi-lbl" style="color:${k.col}">${k.lbl}</div>
      ${k.sub?`<div class="b2s-kpi-sub" style="color:${k.col}">${k.sub}</div>`:''}
    </div>`).join('')}
  </div>`;

  // 종족 비율 + 티어 분포
  h += `<div class="b2s-2col">
    <div class="b2s-panel">
      <div class="b2s-panel-title">🎮 종족 비율
        <span style="margin-left:auto;font-size:11px;color:var(--text3);font-weight:600">${tieredVis.length}명 기준</span>
      </div>
      <div style="display:flex;align-items:center;gap:16px">
        <div style="flex-shrink:0">${donutRings()}</div>
        <div style="flex:1;display:flex;flex-direction:column;gap:8px">
          ${[{r:'P',c:'#7c3aed',l:'🔮 프로토스'},{r:'T',c:'#0284c7',l:'⚔️ 테란'},{r:'Z',c:'#059669',l:'🦎 저그'}].map(({r,c,l})=>{
            const n=raceCts[r]; const pct=Math.round(n/total3*100);
            return `<div>
              <div style="display:flex;justify-content:space-between;margin-bottom:3px">
                <span style="font-size:11px;font-weight:800;color:${c}">${l}</span>
                <span style="font-size:11px;font-weight:900;color:var(--text2)">${n}<span style="font-weight:600;color:var(--text3)"> (${pct}%)</span></span>
              </div>
              <div style="height:7px;border-radius:4px;background:var(--border2);overflow:hidden">
                <div style="width:${pct}%;height:100%;background:${c};border-radius:4px;transition:width .8s ease"></div>
              </div>
            </div>`;
          }).join('')}
        </div>
      </div>
    </div>
    <div class="b2s-panel">
      <div class="b2s-panel-title">🏆 티어 분포</div>
      <div style="display:flex;flex-wrap:wrap;gap:6px">
        ${orderedTiers.map(t=>{
          const col=typeof getTierBtnColor==='function'?getTierBtnColor(t):'#64748b';
          const tcol=typeof getTierBtnTextColor==='function'?(getTierBtnTextColor(t)||'#fff'):'#fff';
          const n=tierCts[t]; const pct=Math.round(n/tieredVis.length*100);
          return `<div class="b2s-tier-chip" style="background:${col}18;border:1.5px solid ${col}55" title="${t}: ${n}명 (${pct}%)">
            <div style="font-size:12px;font-weight:900;padding:2px 8px;border-radius:6px;background:${col};color:${tcol}">${t}</div>
            <div style="font-size:11px;font-weight:800;color:${col};margin-top:3px">${n}명</div>
            <div style="font-size:10px;color:var(--text3)">${pct}%</div>
          </div>`;
        }).join('')}
      </div>
    </div>
    <div class="b2s-panel">
      <div class="b2s-panel-title">🏫 대학별 현황
        <span style="margin-left:auto;font-size:11px;color:var(--text3);font-weight:600">${univStats.length}개 대학</span>
      </div>
      ${univStats.slice(0,10).map((u,i)=>{
        const barW=Math.round(u.count/maxCount*100);
        return `<div style="display:flex;align-items:center;gap:6px;padding:4px 0;border-bottom:1px solid var(--border2)">
          <span style="font-size:10px;font-weight:900;color:var(--text3);width:16px;text-align:center">${i+1}</span>
          <span style="font-size:11px;font-weight:800;color:${u.color};min-width:60px;max-width:72px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${u.name}</span>
          <div style="flex:1;height:8px;border-radius:4px;overflow:hidden;background:var(--border2);display:flex">
            <div style="width:${Math.round(u.races.P/u.count*barW)}%;background:#7c3aed"></div>
            <div style="width:${Math.round(u.races.T/u.count*barW)}%;background:#0284c7"></div>
            <div style="width:${Math.round(u.races.Z/u.count*barW)}%;background:#059669"></div>
          </div>
          <span style="font-size:11px;font-weight:900;color:${u.color};min-width:20px;text-align:right">${u.count}</span>
        </div>`;
      }).join('')}
      ${univStats.length>10?`<div style="text-align:center;color:var(--text3);font-size:11px;margin-top:6px">외 ${univStats.length-10}개 대학</div>`:''}
    </div>
  </div>`;

  // 최근 합류 선수
  if (newPlayers.length > 0) {
    h += `<div class="b2s-panel" style="margin-bottom:14px">
      <div class="b2s-panel-title">🆕 최근 30일 첫 경기 선수
        <span style="margin-left:auto;font-size:11px;color:var(--text3);font-weight:600">${newPlayers.length}명</span>
      </div>
      <div style="display:flex;flex-wrap:wrap;gap:4px">
        ${newPlayers.map(p=>{
          const col=gc(String(p?.univ||''))||'#64748b';
          const tc=typeof getTierBtnColor==='function'&&p.tier?getTierBtnColor(p.tier):'#64748b';
          const tt=typeof getTierBtnTextColor==='function'&&p.tier?(getTierBtnTextColor(p.tier)||'#fff'):'#fff';
          const rIco=p.race==='P'?'🔮':p.race==='T'?'⚔️':p.race==='Z'?'🦎':'';
          const hist=Array.isArray(p.history)?p.history:[];
          const firstD=hist.length?String(Math.min(...hist.map(h2=>parseInt(String(h2.date||h2.d||'').replace(/[-\.]/g,''))||Infinity))).replace(/(\d{4})(\d{2})(\d{2})/,'$1.$2.$3'):'';
          return `<span class="b2s-new-player" style="border-color:${col}44;background:${col}0d">
            <span style="color:${col};font-weight:900">${p.name}</span>
            ${rIco?`<span style="font-size:10px">${rIco}</span>`:''}
            ${p.tier?`<span style="font-size:9px;padding:1px 4px;border-radius:4px;background:${tc};color:${tt}">${p.tier}</span>`:''}
            <span style="font-size:9px;color:var(--text3)">${p.univ||''}</span>
          </span>`;
        }).join('')}
      </div>
    </div>`;
  }

  // 대학별 인원 현황
  h += `<div class="b2s-panel" style="margin-bottom:14px">
    <div class="b2s-panel-title">🏫 대학별 인원 현황
      <span style="margin-left:auto;font-size:11px;color:var(--text3);font-weight:600">${univStats.length}개 대학</span>
    </div>
    <div class="b2s-top-univ" style="margin-bottom:12px">
      ${univStats.slice(0,6).map((u,i)=>{
        const medal=['🥇','🥈','🥉','4️⃣','5️⃣','6️⃣'][i]||'';
        const pP=u.count>0?Math.round(u.races.P/u.count*100):0;
        const pT=u.count>0?Math.round(u.races.T/u.count*100):0;
        const pZ=u.count>0?Math.round(u.races.Z/u.count*100):0;
        return `<div class="b2s-univ-card" style="border-color:${u.color}44;background:${u.color}0d">
          <div style="display:flex;align-items:center;gap:4px;margin-bottom:6px">
            <span style="font-size:14px">${medal}</span>
            <span style="font-size:12px;font-weight:900;color:${u.color};overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1">${u.name}</span>
            <span style="font-size:15px;font-weight:900;color:${u.color}">${u.count}</span>
          </div>
          <div style="height:6px;border-radius:3px;overflow:hidden;background:var(--border2);display:flex;margin-bottom:4px">
            <div style="width:${pP}%;background:#7c3aed" title="P ${u.races.P}"></div>
            <div style="width:${pT}%;background:#0284c7" title="T ${u.races.T}"></div>
            <div style="width:${pZ}%;background:#059669" title="Z ${u.races.Z}"></div>
          </div>
          <div style="display:flex;gap:3px;flex-wrap:wrap">
            ${u.races.P?`<span style="font-size:9px;background:#ede9fe;color:#5b21b6;padding:1px 5px;border-radius:5px;font-weight:800">P${u.races.P}</span>`:''}
            ${u.races.T?`<span style="font-size:9px;background:#e0f2fe;color:#075985;padding:1px 5px;border-radius:5px;font-weight:800">T${u.races.T}</span>`:''}
            ${u.races.Z?`<span style="font-size:9px;background:#d1fae5;color:#064e3b;padding:1px 5px;border-radius:5px;font-weight:800">Z${u.races.Z}</span>`:''}
          </div>
        </div>`;
      }).join('')}
    </div>
    <div style="border-top:1px solid var(--border2);padding-top:10px">
      ${univStats.slice(0,20).map(u=>{
        const barW=Math.round(u.count/maxCount*100);
        return `<div class="b2s-univ-row">
          <span style="font-size:11px;font-weight:800;color:${u.color};min-width:68px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${u.name}</span>
          <div class="b2s-bar-track">
            <div title="프로토스 ${u.races.P}" style="width:${Math.round(u.races.P/u.count*barW)}%;background:#7c3aed;transition:width .6s ease"></div>
            <div title="테란 ${u.races.T}" style="width:${Math.round(u.races.T/u.count*barW)}%;background:#0284c7;transition:width .6s ease"></div>
            <div title="저그 ${u.races.Z}" style="width:${Math.round(u.races.Z/u.count*barW)}%;background:#059669;transition:width .6s ease"></div>
          </div>
          <span style="font-size:11px;font-weight:900;color:${u.color};min-width:22px;text-align:right">${u.count}</span>
          <div style="display:flex;gap:3px;margin-left:3px;min-width:70px">
            ${u.races.P?`<span style="font-size:9px;background:#ede9fe;color:#5b21b6;padding:1px 4px;border-radius:5px;font-weight:800">P${u.races.P}</span>`:''}
            ${u.races.T?`<span style="font-size:9px;background:#e0f2fe;color:#075985;padding:1px 4px;border-radius:5px;font-weight:800">T${u.races.T}</span>`:''}
            ${u.races.Z?`<span style="font-size:9px;background:#d1fae5;color:#064e3b;padding:1px 4px;border-radius:5px;font-weight:800">Z${u.races.Z}</span>`:''}
          </div>
        </div>`;
      }).join('')}
      ${univStats.length>20?`<div style="text-align:center;color:var(--text3);font-size:12px;margin-top:8px;padding-top:6px;border-top:1px solid var(--border2)">외 ${univStats.length-20}개 대학</div>`:''}
    </div>
  </div>`;

  return h;
}
/* ══════════════════════════════════════
   ⚔️ 비교 뷰 v2 — 실전승률 + 직접대결 + 레이더차트
══════════════════════════════════════ */
let _b2CompareA = '';
let _b2CompareB = '';

function _b2CompareView() {
  const _dissSet = new Set((typeof univCfg !== 'undefined' ? univCfg : []).filter(u=>u.dissolved||u.hidden).map(u=>String(u.name||'').trim()));
  const univList = _b2VisUnivs ? _b2VisUnivs().filter(u=>u.name && u.name!=='무소속') : [];
  if (!_b2CompareA && univList.length>0) _b2CompareA = univList[0]?.name||'';
  if (!_b2CompareB && univList.length>1) _b2CompareB = univList[1]?.name||'';

  const dateNum = s => parseInt(String(s||'').replace(/[-\.]/g,''))||0;

  const getStats = (name) => {
    const members = players.filter(p=>String(p?.univ||'').trim()===name&&!p.hidden&&!p.retired&&!p.hideFromBoard&&!_dissSet.has(name));
    const tiered  = members.filter(p=>!_B2_ROLE_ORDER.includes(p.role||''));
    const roled   = members.filter(p=>_B2_ROLE_ORDER.includes(p.role||''));
    const races={P:0,T:0,Z:0};
    tiered.forEach(p=>{if(p.race in races)races[p.race]++;});
    const tiers={};
    tiered.forEach(p=>{const t=p.tier||'미정';tiers[t]=(tiers[t]||0)+1;});
    const topTier = tiered.length>0?(tiered.slice().sort((a,b)=>{
      const ti=typeof TIERS!=='undefined'?TIERS:[];
      const ia=ti.indexOf(a.tier||''),ib=ti.indexOf(b.tier||'');
      return (ia>=0?ia:999)-(ib>=0?ib:999);
    })[0]?.tier||'없음'):'없음';

    // 실전 승률 계산
    let tw=0,tl=0;
    tiered.forEach(p=>{
      (Array.isArray(p.history)?p.history:[]).forEach(h=>{
        if(h.result==='승')tw++; else if(h.result==='패')tl++;
      });
    });
    const tg=tw+tl;
    const wr=tg>0?Math.round(tw/tg*100):null;

    // 직접 맞대결 (상대 대학 이름이 opp 기록에 있는 경우)
    // 각 선수 history에서 opp가 상대 대학 소속 선수명인 케이스 → oppUniv 필드 사용
    return {members,tiered,roled,races,tiers,topTier,total:members.length,tw,tl,tg,wr};
  };

  // 직접 맞대결: A 선수들 history 중 oppUniv === B (또는 opp가 B 소속 선수)
  const getHeadToHead = (nameA, nameB) => {
    const bPlayers = new Set(players.filter(p=>String(p?.univ||'').trim()===nameB).map(p=>p.name));
    let aw=0,al=0;
    players.filter(p=>String(p?.univ||'').trim()===nameA&&!p.hidden&&!p.retired).forEach(p=>{
      (Array.isArray(p.history)?p.history:[]).forEach(h=>{
        const oppU = String(h.oppUniv||h.univ||'').trim();
        const oppN = String(h.opp||'').trim();
        if (oppU===nameB || bPlayers.has(oppN)) {
          if(h.result==='승')aw++; else if(h.result==='패')al++;
        }
      });
    });
    return {aw,al,ag:aw+al};
  };

  const colA = _b2CompareA?gc(_b2CompareA)||'#64748b':'#64748b';
  const colB = _b2CompareB?gc(_b2CompareB)||'#64748b':'#64748b';
  const stA  = _b2CompareA?getStats(_b2CompareA):null;
  const stB  = _b2CompareB?getStats(_b2CompareB):null;
  const h2h  = (_b2CompareA&&_b2CompareB)?getHeadToHead(_b2CompareA,_b2CompareB):{aw:0,al:0,ag:0};
  const h2hB = (_b2CompareA&&_b2CompareB)?getHeadToHead(_b2CompareB,_b2CompareA):{aw:0,al:0,ag:0};

  const univOptA = univList.map(u=>`<option value="${u.name}"${_b2CompareA===u.name?' selected':''}>${u.name}</option>`).join('');
  const univOptB = univList.map(u=>`<option value="${u.name}"${_b2CompareB===u.name?' selected':''}>${u.name}</option>`).join('');

  const compareRow = (label,valA,valB) => {
    const numA=typeof valA==='number'?valA:null;
    const numB=typeof valB==='number'?valB:null;
    const winA=numA!==null&&numB!==null&&numA>numB;
    const winB=numA!==null&&numB!==null&&numB>numA;
    return `<div style="display:grid;grid-template-columns:1fr auto 1fr;gap:8px;align-items:center;padding:8px 0;border-bottom:1px solid var(--border2)">
      <div style="text-align:right;font-size:13px;font-weight:${winA?'900':'600'};color:${winA?colA:'var(--text2)'}">
        ${winA?'✓ ':''}${valA}
      </div>
      <div style="font-size:11px;color:var(--text3);font-weight:600;text-align:center;white-space:nowrap">${label}</div>
      <div style="text-align:left;font-size:13px;font-weight:${winB?'900':'600'};color:${winB?colB:'var(--text2)'}">
        ${valB}${winB?' ✓':''}
      </div>
    </div>`;
  };

  // 레이더 차트 SVG
  const radarChart = (stA, stB) => {
    if (!stA || !stB) return '';
    const TIERS_LOCAL = typeof TIERS!=='undefined'?TIERS:[];
    const tierScore = t => { const i=TIERS_LOCAL.indexOf(t); return i<0?0:Math.max(0,(TIERS_LOCAL.length-i)*10); };
    const maxTierScore = Math.max(1, ...players.map(p=>tierScore(p.tier||''))) * stA.tiered.length;

    const normalize = (val,max) => Math.min(1, max>0?val/max:0);
    const axes = [
      { label:'인원',  vA: normalize(stA.total, Math.max(stA.total,stB.total,1)),      vB: normalize(stB.total, Math.max(stA.total,stB.total,1)) },
      { label:'티어점수', vA: normalize(stA.tiered.reduce((s,p)=>s+tierScore(p.tier||''),0), Math.max(stA.tiered.reduce((s,p)=>s+tierScore(p.tier||''),0),stB.tiered.reduce((s,p)=>s+tierScore(p.tier||''),0),1)),
                         vB: normalize(stB.tiered.reduce((s,p)=>s+tierScore(p.tier||''),0), Math.max(stA.tiered.reduce((s,p)=>s+tierScore(p.tier||''),0),stB.tiered.reduce((s,p)=>s+tierScore(p.tier||''),0),1)) },
      { label:'승률',  vA: stA.wr!==null?stA.wr/100:0, vB: stB.wr!==null?stB.wr/100:0 },
      { label:'경기수', vA: normalize(stA.tg, Math.max(stA.tg,stB.tg,1)), vB: normalize(stB.tg, Math.max(stA.tg,stB.tg,1)) },
      { label:'프로토스', vA: normalize(stA.races.P, Math.max(stA.total,stB.total,1)), vB: normalize(stB.races.P, Math.max(stA.total,stB.total,1)) },
      { label:'테란',   vA: normalize(stA.races.T, Math.max(stA.total,stB.total,1)), vB: normalize(stB.races.T, Math.max(stA.total,stB.total,1)) },
    ];
    const N = axes.length;
    const cx=120,cy=120,R=90;
    const angleOf = i => (Math.PI*2/N)*i - Math.PI/2;
    const pt = (val,i) => {
      const a=angleOf(i); const r=val*R;
      return `${(cx+Math.cos(a)*r).toFixed(1)},${(cy+Math.sin(a)*r).toFixed(1)}`;
    };
    const webPts = (vFn) => axes.map((_,i)=>pt(vFn(i),i)).join(' ');

    // 격자
    let grid='';
    [0.25,0.5,0.75,1].forEach(s=>{
      const pts=axes.map((_,i)=>{const a=angleOf(i);return `${(cx+Math.cos(a)*R*s).toFixed(1)},${(cy+Math.sin(a)*R*s).toFixed(1)}`;}).join(' ');
      grid+=`<polygon points="${pts}" fill="none" stroke="var(--border2)" stroke-width="1"/>`;
    });
    // 축
    const axisLines=axes.map((_,i)=>{const a=angleOf(i);return `<line x1="${cx}" y1="${cy}" x2="${(cx+Math.cos(a)*R).toFixed(1)}" y2="${(cy+Math.sin(a)*R).toFixed(1)}" stroke="var(--border2)" stroke-width="1"/>`;}).join('');
    // 레이블
    const labels=axes.map((ax,i)=>{
      const a=angleOf(i);const lx=(cx+Math.cos(a)*(R+18)).toFixed(1);const ly=(cy+Math.sin(a)*(R+18)).toFixed(1);
      return `<text x="${lx}" y="${ly}" text-anchor="middle" dominant-baseline="middle" font-size="10" font-weight="700" fill="var(--text3)">${ax.label}</text>`;
    }).join('');

    return `<div style="display:flex;justify-content:center;margin:8px 0 4px">
      <svg width="240" height="240" viewBox="0 0 240 240" style="overflow:visible">
        ${grid}${axisLines}
        <polygon points="${webPts(i=>axes[i].vA)}" fill="${colA}" fill-opacity="0.18" stroke="${colA}" stroke-width="2" stroke-linejoin="round"/>
        <polygon points="${webPts(i=>axes[i].vB)}" fill="${colB}" fill-opacity="0.18" stroke="${colB}" stroke-width="2" stroke-linejoin="round" stroke-dasharray="5 3"/>
        ${labels}
      </svg>
    </div>
    <div style="display:flex;justify-content:center;gap:16px;font-size:11px;font-weight:700">
      <span style="color:${colA}">━ ${_b2CompareA}</span>
      <span style="color:${colB}">╌ ${_b2CompareB}</span>
    </div>`;
  };

  let h = `<style>
    .b2cv2-wrap { max-width:800px;margin:0 auto }
    .b2cv2-sel { display:grid;grid-template-columns:1fr 40px 1fr;gap:12px;align-items:center;margin-bottom:16px }
    .b2cv2-header { display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px }
    .b2cv2-col { border-radius:12px;padding:14px;text-align:center }
    .b2cv2-h2h { padding:12px 16px;background:var(--surface);border:1px solid var(--border2);border-radius:14px;margin-bottom:12px;text-align:center }
    @media(max-width:540px){ .b2cv2-sel{grid-template-columns:1fr} .b2cv2-header{grid-template-columns:1fr 1fr;gap:6px} }
  </style>
  <div class="b2cv2-wrap">
    <div class="b2cv2-sel">
      <div>
        <select onchange="_b2CompareA=this.value;document.getElementById('b2-content').innerHTML=_b2CompareView()"
          style="width:100%;padding:8px 12px;border-radius:10px;border:2px solid ${colA};font-size:13px;font-weight:700;background:var(--white);color:${colA};cursor:pointer">
          ${univOptA}
        </select>
      </div>
      <div style="text-align:center;font-size:18px;font-weight:900;color:var(--text3)">VS</div>
      <div>
        <select onchange="_b2CompareB=this.value;document.getElementById('b2-content').innerHTML=_b2CompareView()"
          style="width:100%;padding:8px 12px;border-radius:10px;border:2px solid ${colB};font-size:13px;font-weight:700;background:var(--white);color:${colB};cursor:pointer">
          ${univOptB}
        </select>
      </div>
    </div>`;

  if (stA && stB) {
    // 헤더 카드
    h += `<div class="b2cv2-header">
      <div class="b2cv2-col" style="background:${colA}15;border:2px solid ${colA}44">
        <div style="font-size:22px;font-weight:900;color:${colA}">${stA.total}</div>
        <div style="font-size:12px;color:var(--text3)">총 인원</div>
        ${stA.wr!==null?`<div style="font-size:14px;font-weight:900;color:${stA.wr>=50?'#10b981':'#ef4444'};margin-top:4px">${stA.wr}% 승률</div>`:''}
      </div>
      <div class="b2cv2-col" style="background:${colB}15;border:2px solid ${colB}44">
        <div style="font-size:22px;font-weight:900;color:${colB}">${stB.total}</div>
        <div style="font-size:12px;color:var(--text3)">총 인원</div>
        ${stB.wr!==null?`<div style="font-size:14px;font-weight:900;color:${stB.wr>=50?'#10b981':'#ef4444'};margin-top:4px">${stB.wr}% 승률</div>`:''}
      </div>
    </div>`;

    // 직접 맞대결
    if (h2h.ag > 0 || h2hB.ag > 0) {
      const totalAg = h2h.aw + h2hB.aw;
      const aWpct = totalAg>0?Math.round(h2h.aw/totalAg*100):50;
      h += `<div class="b2cv2-h2h">
        <div style="font-size:12px;font-weight:800;color:var(--text3);margin-bottom:8px">⚔️ 직접 맞대결 전적</div>
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
          <span style="font-size:13px;font-weight:900;color:${colA};min-width:60px;text-align:right">${h2h.aw}승 ${h2h.al}패</span>
          <div style="flex:1;height:12px;border-radius:6px;overflow:hidden;background:${colB};display:flex">
            <div style="width:${aWpct}%;background:${colA};height:100%;border-radius:6px 0 0 6px;transition:width .6s ease"></div>
          </div>
          <span style="font-size:13px;font-weight:900;color:${colB};min-width:60px;text-align:left">${h2hB.aw}승 ${h2hB.al}패</span>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--text3)">
          <span style="color:${colA};font-weight:700">${_b2CompareA}</span>
          <span>총 ${h2h.aw+h2hB.aw}전</span>
          <span style="color:${colB};font-weight:700">${_b2CompareB}</span>
        </div>
      </div>`;
    }

    // 레이더 차트
    h += `<div class="b2cv2-col" style="background:var(--surface);border:1px solid var(--border2);border-radius:14px;margin-bottom:12px;padding:14px">
      <div style="font-size:12px;font-weight:800;color:var(--text3);margin-bottom:4px;text-align:center">📡 다차원 비교</div>
      ${radarChart(stA, stB)}
    </div>`;

    // 항목별 비교
    h += `<div style="display:grid;grid-template-columns:1fr auto 1fr;gap:8px;align-items:center;padding:8px 0;border-bottom:2px solid var(--border2);margin-bottom:4px">
      <div style="text-align:right;font-size:14px;font-weight:900;color:${colA}">${_b2CompareA}</div>
      <div style="width:60px;text-align:center"></div>
      <div style="text-align:left;font-size:14px;font-weight:900;color:${colB}">${_b2CompareB}</div>
    </div>`;
    h += compareRow('선수 수', stA.tiered.length, stB.tiered.length);
    h += compareRow('직책자', stA.roled.length, stB.roled.length);
    h += compareRow('통산 경기', stA.tg, stB.tg);
    h += compareRow('통산 승', stA.tw, stB.tw);
    h += compareRow(stA.wr!==null?`승률 (${stA.wr}%)`:'승률', stA.wr??0, stB.wr??0);
    h += compareRow('🔮 프로토스', stA.races.P, stB.races.P);
    h += compareRow('⚔️ 테란', stA.races.T, stB.races.T);
    h += compareRow('🦎 저그', stA.races.Z, stB.races.Z);
    h += compareRow('최상위 티어', stA.topTier, stB.topTier);

    // 티어 비교
    const allTiers=[...new Set([...Object.keys(stA.tiers),...Object.keys(stB.tiers)])];
    const sortedTiers=(typeof TIERS!=='undefined'?TIERS.filter(t=>allTiers.includes(t)):[]).concat(allTiers.filter(t=>typeof TIERS==='undefined'||!TIERS.includes(t)));
    if (sortedTiers.length) {
      h+=`<div style="margin-top:12px;font-size:12px;font-weight:700;color:var(--text3);text-align:center;margin-bottom:8px">티어별 비교</div>`;
      sortedTiers.forEach(t=>{
        const nA=stA.tiers[t]||0,nB=stB.tiers[t]||0;
        const col=typeof getTierBtnColor==='function'?getTierBtnColor(t):'#64748b';
        const tcol=typeof getTierBtnTextColor==='function'?(getTierBtnTextColor(t)||'#fff'):'#fff';
        const maxN=Math.max(nA,nB,1);
        h+=`<div style="display:grid;grid-template-columns:1fr 52px 1fr;gap:6px;align-items:center;margin-bottom:6px">
          <div style="display:flex;justify-content:flex-end">
            <div style="height:10px;width:${Math.round(nA/maxN*100)}%;max-width:100%;background:${nA>nB?colA:colA+'88'};border-radius:5px 0 0 5px;min-width:${nA?'8px':'0'}"></div>
          </div>
          <div style="text-align:center;font-size:11px;font-weight:800;padding:2px 6px;border-radius:8px;background:${col};color:${tcol}">${t}</div>
          <div>
            <div style="height:10px;width:${Math.round(nB/maxN*100)}%;max-width:100%;background:${nB>nA?colB:colB+'88'};border-radius:0 5px 5px 0;min-width:${nB?'8px':'0'}"></div>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 52px 1fr;gap:6px;margin-bottom:4px">
          <div style="text-align:right;font-size:11px;color:${nA>nB?colA:'var(--text3)'};font-weight:${nA>nB?'800':'400'}">${nA?nA+'명':''}</div>
          <div></div>
          <div style="font-size:11px;color:${nB>nA?colB:'var(--text3)'};font-weight:${nB>nA?'800':'400'}">${nB?nB+'명':''}</div>
        </div>`;
      });
    }

    // 선수 목록
    h+=`<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:14px">
      <div>
        <div style="font-size:12px;font-weight:800;color:${colA};margin-bottom:6px">${_b2CompareA} 선수</div>
        <div style="display:flex;flex-wrap:wrap;gap:4px">
          ${stA.tiered.slice().sort((a,b)=>{const ti=typeof TIERS!=='undefined'?TIERS:[];const ia=ti.indexOf(a.tier||''),ib=ti.indexOf(b.tier||'');return(ia>=0?ia:999)-(ib>=0?ib:999)||(a.name||'').localeCompare(b.name||'','ko',{sensitivity:'base'});}).map(p=>_b2NameTag(p,colA,false)).join('')}
        </div>
      </div>
      <div>
        <div style="font-size:12px;font-weight:800;color:${colB};margin-bottom:6px">${_b2CompareB} 선수</div>
        <div style="display:flex;flex-wrap:wrap;gap:4px">
          ${stB.tiered.slice().sort((a,b)=>{const ti=typeof TIERS!=='undefined'?TIERS:[];const ia=ti.indexOf(a.tier||''),ib=ti.indexOf(b.tier||'');return(ia>=0?ia:999)-(ib>=0?ib:999)||(a.name||'').localeCompare(b.name||'','ko',{sensitivity:'base'});}).map(p=>_b2NameTag(p,colB,false)).join('')}
        </div>
      </div>
    </div>`;
  }

  h += `</div>`;
  return h;
}
/* ══════════════════════════════════════
   🌡️ 히트맵 뷰 v2 — 승률 모드 + 정렬 버튼
══════════════════════════════════════ */
window._b2HeatmapMode = window._b2HeatmapMode || 'count';
window._b2HeatmapSortRow = window._b2HeatmapSortRow || 'name';
window._b2HeatmapSortCol = window._b2HeatmapSortCol || 'tier';

function _b2HeatmapCellClick(el){
  try{
    if(!el || !el.dataset) return;
    const uid = el.dataset.hmUid || '';
    const univName = el.dataset.hmUniv || '';
    const tier = el.dataset.hmTier || '';
    const color = el.dataset.hmColor || '#64748b';
    if(!uid || !univName || !tier) return;
    if(typeof _b2HeatmapShowPopup === 'function') _b2HeatmapShowPopup(uid, univName, tier, color);
  }catch(e){}
}
function _b2HeatmapTotalClick(el){
  try{
    if(!el || !el.dataset) return;
    const uid = el.dataset.hmUid || '';
    const univName = el.dataset.hmUniv || '';
    const color = el.dataset.hmColor || '#64748b';
    if(!uid || !univName) return;
    if(typeof _b2HeatmapShowAllPopup === 'function') _b2HeatmapShowAllPopup(uid, univName, color);
  }catch(e){}
}
function _b2HeatmapShowPopup(uid, univName, tier, color){
  try{
    const popup  = document.getElementById(uid + '-popup');
    const header = document.getElementById(uid + '-popup-header');
    const body   = document.getElementById(uid + '-popup-body');
    if(!popup || !body) return;
    const escH = (typeof escHTML === 'function') ? escHTML : (s)=>String(s||'');
    const escA = (typeof escAttr === 'function') ? escAttr : (s)=>String(s||'');
    const members = (Array.isArray(window.players) ? window.players : []).filter(p=>{
      const pu = String((p && p.univ) || '').trim();
      const pt = String((p && p.tier) || '미정');
      return pu === univName && pt === tier && !(p && (p.hidden || p.retired || p.hideFromBoard));
    });
    if(!members.length) return;
    let tw=0,tl=0;
    members.forEach(p=>(Array.isArray(p && p.history)?p.history:[]).forEach(h=>{ if(h && h.result==='승') tw++; else if(h && h.result==='패') tl++; }));
    const tg=tw+tl, wr=tg>0?Math.round(tw/tg*100):null;
    const wrc=wr===null?'#94a3b8':wr>=60?'#10b981':wr>=40?'#f59e0b':'#ef4444';
    const now=new Date(), day=now.getDay();
    const mon=new Date(now); mon.setDate(now.getDate()+(day===0?-6:1-day));
    const fromN=parseInt(mon.toISOString().slice(0,10).replace(/-/g,''),10);
    const toN=parseInt(now.toISOString().slice(0,10).replace(/-/g,''),10);
    const dNum=s=>parseInt(String(s||'').replace(/[-\.]/g,''),10)||0;
    let ww=0,wl=0;
    members.forEach(p=>(Array.isArray(p && p.history)?p.history:[]).forEach(h=>{
      const d=dNum(h && (h.date||h.d||''));
      if(d>=fromN && d<=toN){
        if(h && h.result==='승') ww++;
        else if(h && h.result==='패') wl++;
      }
    }));
    const tierCol = (typeof getTierBtnColor==='function'&&tier)?getTierBtnColor(tier):'#64748b';
    const tierTc  = (typeof getTierBtnTextColor==='function'&&tier)?(getTierBtnTextColor(tier)||'#fff'):'#fff';
    if(header) header.innerHTML =
      '<div style="display:flex;align-items:center;gap:10px">' +
        '<div style="width:12px;height:12px;border-radius:50%;background:'+color+';flex-shrink:0;box-shadow:0 0 0 3px '+color+'30"></div>' +
        '<span style="font-size:16px;font-weight:900;color:'+color+';">'+escH(univName)+'</span>' +
        '<span style="font-size:12px;padding:3px 10px;border-radius:20px;background:'+tierCol+';color:'+tierTc+';font-weight:800;letter-spacing:.3px">'+escH(tier)+'</span>' +
        '<div style="margin-left:auto;text-align:right">' +
          (wr!==null?'<div style="font-size:18px;font-weight:900;color:'+wrc+'">'+wr+'%</div><div style="font-size:10px;color:var(--text3);">'+tw+'승 '+tl+'패</div>':'<div style="font-size:13px;color:var(--text3)">기록 없음</div>') +
        '</div>' +
      '</div>';
    let bodyHtml = '';
    bodyHtml += '<div class="b2hm2-stat-row">' +
      '<div class="b2hm2-stat-box" style="background:'+color+'0d;border-color:'+color+'22">' +
        '<div style="font-size:22px;font-weight:900;color:'+color+'">'+members.length+'</div>' +
        '<div style="font-size:10px;color:var(--text3);font-weight:700">총 인원</div>' +
      '</div>';
    if (tg>0) bodyHtml +=
      '<div class="b2hm2-stat-box" style="background:'+wrc+'12;border-color:'+wrc+'30">' +
        '<div style="font-size:22px;font-weight:900;color:'+wrc+'">'+wr+'%</div>' +
        '<div style="font-size:10px;color:var(--text3);font-weight:700">'+tw+'승 '+tl+'패</div>' +
      '</div>';
    if (ww+wl>0) bodyHtml +=
      '<div class="b2hm2-stat-box" style="background:#fff7ed;border-color:#fed7aa">' +
        '<div style="font-size:20px;font-weight:900;color:#c2410c">🔥 '+ww+'승</div>' +
        '<div style="font-size:10px;color:#c2410c;font-weight:700">이번주 '+wl+'패</div>' +
      '</div>';
    bodyHtml += '</div>';
    bodyHtml += '<div style="font-size:11px;font-weight:800;color:var(--text3);margin-bottom:10px;display:flex;align-items:center;gap:6px">' +
      '<span style="width:20px;height:2px;background:var(--border2);display:inline-block;border-radius:1px"></span>' +
      members.length+'명' +
      '<span style="flex:1;height:1px;background:var(--border2);display:inline-block;border-radius:1px"></span></div>';
    bodyHtml += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(84px,1fr));gap:8px">';
    members.sort((a,b)=>(String(a && a.name || '')).localeCompare(String(b && b.name || ''),'ko',{sensitivity:'base'})).forEach(p=>{
      const rIco=p && p.race==='P'?'🔮':p && p.race==='T'?'⚔️':p && p.race==='Z'?'🦎':'';
      const rawPhoto = p && p.photo ? (typeof toHttpsUrl==='function'?toHttpsUrl(p.photo):p.photo) : '';
      const safePhoto = rawPhoto ? escA(rawPhoto) : '';
      const initials = String(p && p.name || '?').slice(0,1);
      let pw=0,pl=0;
      (Array.isArray(p && p.history)?p.history:[]).forEach(h=>{ if(h && h.result==='승') pw++; else if(h && h.result==='패') pl++; });
      const pg=pw+pl,pwr=pg>0?Math.round(pw/pg*100):null;
      const pc=pwr===null?'#94a3b8':pwr>=60?'#10b981':pwr>=40?'#f59e0b':'#ef4444';
      bodyHtml += '<div class="b2hm2-pcard" style="background:'+color+'09;border-color:'+color+'28">';
      if (safePhoto) {
        bodyHtml += '<img class="b2hm2-pcard-photo" src="'+safePhoto+'" onerror="this.style.display=\'none\';this.nextSibling.style.display=\'flex\'">'+
          '<div class="b2hm2-pcard-avatar" style="display:none;background:'+color+'22;color:'+color+'">'+escH(initials)+'</div>';
      } else {
        bodyHtml += '<div class="b2hm2-pcard-avatar" style="background:'+color+'22;color:'+color+'">'+escH(initials)+'</div>';
      }
      bodyHtml += '<div style="font-size:11px;font-weight:900;color:'+color+';line-height:1.2">'+escH(p && p.name || '')+'</div>';
      if (rIco || pwr!==null) {
        bodyHtml += '<div style="font-size:10px;color:var(--text3);display:flex;align-items:center;gap:2px">'+rIco;
        if (pwr!==null) bodyHtml += '<span style="color:'+pc+';font-weight:800;margin-left:2px">'+pwr+'%</span>';
        bodyHtml += '</div>';
      }
      bodyHtml += '</div>';
    });
    bodyHtml += '</div>';
    body.innerHTML = bodyHtml;
    popup.classList.add('show');
  }catch(e){}
}
function _b2HeatmapShowAllPopup(uid, univName, color){
  try{
    const popup  = document.getElementById(uid + '-popup');
    const header = document.getElementById(uid + '-popup-header');
    const body   = document.getElementById(uid + '-popup-body');
    if(!popup || !body) return;
    const escH = (typeof escHTML === 'function') ? escHTML : (s)=>String(s||'');
    const escA = (typeof escAttr === 'function') ? escAttr : (s)=>String(s||'');
    const members = (Array.isArray(window.players) ? window.players : []).filter(p=>{
      const pu = String((p && p.univ) || '').trim();
      return pu === univName && !(p && (p.hidden || p.retired || p.hideFromBoard));
    });
    if(!members.length) return;
    let tw=0,tl=0;
    members.forEach(p=>(Array.isArray(p && p.history)?p.history:[]).forEach(h=>{ if(h && h.result==='승') tw++; else if(h && h.result==='패') tl++; }));
    const tg=tw+tl, wr=tg>0?Math.round(tw/tg*100):null;
    const wrc=wr===null?'#94a3b8':wr>=60?'#10b981':wr>=40?'#f59e0b':'#ef4444';
    const now=new Date(), day=now.getDay();
    const mon=new Date(now); mon.setDate(now.getDate()+(day===0?-6:1-day));
    const fromN=parseInt(mon.toISOString().slice(0,10).replace(/-/g,''),10);
    const toN=parseInt(now.toISOString().slice(0,10).replace(/-/g,''),10);
    const dNum=s=>parseInt(String(s||'').replace(/[-\.]/g,''),10)||0;
    let ww=0,wl=0;
    members.forEach(p=>(Array.isArray(p && p.history)?p.history:[]).forEach(h=>{
      const d=dNum(h && (h.date||h.d||''));
      if(d>=fromN && d<=toN){
        if(h && h.result==='승') ww++;
        else if(h && h.result==='패') wl++;
      }
    }));
    if(header) header.innerHTML =
      '<div style="display:flex;align-items:center;gap:10px">' +
        '<div style="width:12px;height:12px;border-radius:50%;background:'+color+';flex-shrink:0;box-shadow:0 0 0 3px '+color+'30"></div>' +
        '<span style="font-size:16px;font-weight:900;color:'+color+';">'+escH(univName)+'</span>' +
        '<div style="margin-left:auto;text-align:right">' +
          (wr!==null?'<div style="font-size:18px;font-weight:900;color:'+wrc+'">'+wr+'%</div><div style="font-size:10px;color:var(--text3);">'+tw+'승 '+tl+'패</div>':'<div style="font-size:13px;color:var(--text3)">기록 없음</div>') +
        '</div>' +
      '</div>';
    let bodyHtml = '';
    bodyHtml += '<div class="b2hm2-stat-row">' +
      '<div class="b2hm2-stat-box" style="background:'+color+'0d;border-color:'+color+'22">' +
        '<div style="font-size:22px;font-weight:900;color:'+color+'">'+members.length+'</div>' +
        '<div style="font-size:10px;color:var(--text3);font-weight:700">총 인원</div>' +
      '</div>';
    if (tg>0) bodyHtml +=
      '<div class="b2hm2-stat-box" style="background:'+wrc+'12;border-color:'+wrc+'30">' +
        '<div style="font-size:22px;font-weight:900;color:'+wrc+'">'+wr+'%</div>' +
        '<div style="font-size:10px;color:var(--text3);font-weight:700">'+tw+'승 '+tl+'패</div>' +
      '</div>';
    if (ww+wl>0) bodyHtml +=
      '<div class="b2hm2-stat-box" style="background:#fff7ed;border-color:#fed7aa">' +
        '<div style="font-size:20px;font-weight:900;color:#c2410c">🔥 '+ww+'승</div>' +
        '<div style="font-size:10px;color:#c2410c;font-weight:700">이번주 '+wl+'패</div>' +
      '</div>';
    bodyHtml += '</div>';
    bodyHtml += '<div style="font-size:11px;font-weight:800;color:var(--text3);margin-bottom:10px;display:flex;align-items:center;gap:6px">' +
      '<span style="width:20px;height:2px;background:var(--border2);display:inline-block;border-radius:1px"></span>' +
      members.length+'명' +
      '<span style="flex:1;height:1px;background:var(--border2);display:inline-block;border-radius:1px"></span></div>';
    bodyHtml += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(84px,1fr));gap:8px">';
    members.sort((a,b)=>(String(a && a.name || '')).localeCompare(String(b && b.name || ''),'ko',{sensitivity:'base'})).forEach(p=>{
      const rIco=p && p.race==='P'?'🔮':p && p.race==='T'?'⚔️':p && p.race==='Z'?'🦎':'';
      const rawPhoto = p && p.photo ? (typeof toHttpsUrl==='function'?toHttpsUrl(p.photo):p.photo) : '';
      const safePhoto = rawPhoto ? escA(rawPhoto) : '';
      const initials = String(p && p.name || '?').slice(0,1);
      const pColor = (typeof gc === 'function' ? gc(p && p.univ) : null) || color;
      let pw=0,pl=0;
      (Array.isArray(p && p.history)?p.history:[]).forEach(h=>{ if(h && h.result==='승') pw++; else if(h && h.result==='패') pl++; });
      const pg=pw+pl,pwr=pg>0?Math.round(pw/pg*100):null;
      const pc=pwr===null?'#94a3b8':pwr>=60?'#10b981':pwr>=40?'#f59e0b':'#ef4444';
      bodyHtml += '<div class="b2hm2-pcard" style="background:'+pColor+'09;border-color:'+pColor+'28">';
      if (safePhoto) {
        bodyHtml += '<img class="b2hm2-pcard-photo" src="'+safePhoto+'" onerror="this.style.display=\'none\';this.nextSibling.style.display=\'flex\'">'+
          '<div class="b2hm2-pcard-avatar" style="display:none;background:'+pColor+'22;color:'+pColor+'">'+escH(initials)+'</div>';
      } else {
        bodyHtml += '<div class="b2hm2-pcard-avatar" style="background:'+pColor+'22;color:'+pColor+'">'+escH(initials)+'</div>';
      }
      bodyHtml += '<div style="font-size:11px;font-weight:900;color:'+pColor+';line-height:1.2">'+escH(p && p.name || '')+'</div>';
      if (rIco || pwr!==null) {
        bodyHtml += '<div style="font-size:10px;color:var(--text3);display:flex;align-items:center;gap:2px">'+rIco;
        if (pwr!==null) bodyHtml += '<span style="color:'+pc+';font-weight:800;margin-left:2px">'+pwr+'%</span>';
        bodyHtml += '</div>';
      }
      bodyHtml += '</div>';
    });
    bodyHtml += '</div>';
    body.innerHTML = bodyHtml;
    popup.classList.add('show');
  }catch(e){}
}

function _b2HeatmapView() {
  const hmUid = 'hm_' + Math.random().toString(36).slice(2,7);
  const _dissSet = new Set((typeof univCfg !== 'undefined' ? univCfg : []).filter(u=>u.dissolved||u.hidden).map(u=>String(u.name||'').trim()));
  const univList = (_b2VisUnivs ? _b2VisUnivs() : []).filter(u=>u.name && u.name!=='무소속');
  const vis = players.filter(p =>
    !p.hidden && !p.retired && !p.hideFromBoard &&
    !_dissSet.has(String(p?.univ||'').trim())
  );
  const TIERS_LOCAL = typeof TIERS !== 'undefined' ? TIERS : [];
  const mode    = window._b2HeatmapMode    || 'count';
  const sortRow = window._b2HeatmapSortRow || 'name';
  const sortCol = window._b2HeatmapSortCol || 'tier';

  // 사용 중인 티어 목록
  const usedTiers = [...new Set(vis.map(p=>p.tier||'미정'))];
  let orderedTiers = TIERS_LOCAL.filter(t=>usedTiers.includes(t))
    .concat(usedTiers.filter(t=>!TIERS_LOCAL.includes(t)));

  // 대학-티어 교차 집계
  const cellData = {}; // cellData[univ][tier] = { count, wins, losses }
  univList.forEach(u => { cellData[u.name] = {}; });
  vis.forEach(p => {
    const u = String(p?.univ||'').trim();
    const t = p.tier||'미정';
    if (!cellData[u]) cellData[u] = {};
    if (!cellData[u][t]) cellData[u][t] = { count:0, wins:0, losses:0 };
    cellData[u][t].count++;
    (Array.isArray(p.history)?p.history:[]).forEach(h => {
      if (h.result==='승') cellData[u][t].wins++;
      else if (h.result==='패') cellData[u][t].losses++;
    });
  });

  // 대학 합계
  const univTotals = {};
  univList.forEach(u => {
    let cnt=0, w=0, l=0;
    orderedTiers.forEach(t => { const c=cellData[u.name]?.[t]; if(c){cnt+=c.count;w+=c.wins;l+=c.losses;} });
    univTotals[u.name] = { count:cnt, wins:w, losses:l, wr: (w+l)>0?Math.round(w/(w+l)*100):null };
  });

  // 티어 합계
  const tierTotals = {};
  orderedTiers.forEach(t => {
    let cnt=0, w=0, l=0;
    univList.forEach(u => { const c=cellData[u.name]?.[t]; if(c){cnt+=c.count;w+=c.wins;l+=c.losses;} });
    tierTotals[t] = { count:cnt, wins:w, losses:l, wr:(w+l)>0?Math.round(w/(w+l)*100):null };
  });

  // 행(대학) 정렬
  let sortedUnivs = [...univList];
  if (sortRow === 'name')  sortedUnivs.sort((a,b)=>(a.name||'').localeCompare(b.name||'','ko'));
  if (sortRow === 'count') sortedUnivs.sort((a,b)=>(univTotals[b.name]?.count||0)-(univTotals[a.name]?.count||0));
  if (sortRow === 'wr')    sortedUnivs.sort((a,b)=>(univTotals[b.name]?.wr??-1)-(univTotals[a.name]?.wr??-1));

  // 열(티어) 정렬
  let sortedTiers = [...orderedTiers];
  if (sortCol === 'tier')  {} // 기본 티어 순서 유지
  if (sortCol === 'count') sortedTiers.sort((a,b)=>(tierTotals[b]?.count||0)-(tierTotals[a]?.count||0));
  if (sortCol === 'wr')    sortedTiers.sort((a,b)=>(tierTotals[b]?.wr??-1)-(tierTotals[a]?.wr??-1));

  // 색상 보간 (count: 대학 색상 기반 / wr: 빨강↔초록)
  const _hexToRgb = (hex) => {
    const h = String(hex || '').trim().replace('#','');
    if (h.length === 3) {
      const r = parseInt(h[0] + h[0], 16);
      const g = parseInt(h[1] + h[1], 16);
      const b = parseInt(h[2] + h[2], 16);
      if ([r,g,b].some(x=>isNaN(x))) return null;
      return { r, g, b };
    }
    if (h.length >= 6) {
      const r = parseInt(h.slice(0,2), 16);
      const g = parseInt(h.slice(2,4), 16);
      const b = parseInt(h.slice(4,6), 16);
      if ([r,g,b].some(x=>isNaN(x))) return null;
      return { r, g, b };
    }
    return null;
  };
  const heatColor = (val, max, baseHex) => {
    if (!val || max===0) return 'transparent';
    const t = val/max;
    if (mode === 'count') {
      const rgb = _hexToRgb(baseHex) || _hexToRgb('#3b82f6') || { r:59, g:130, b:246 };
      const a = Math.min(0.92, Math.max(0.12, t * 0.78 + 0.12));
      return `rgba(${rgb.r},${rgb.g},${rgb.b},${a.toFixed(2)})`;
    } else {
      // 승률: 빨강(0%)→흰→초록(100%)
      const r = val<50?255:Math.round(255*(1-(val-50)/50));
      const g = val>50?255:Math.round(255*(val/50));
      return `rgba(${r},${g},80,0.55)`;
    }
  };
  const textColor = (val, max) => {
    if (!val || max===0) return 'var(--text3)';
    return val/max > 0.55 ? '#fff' : 'var(--text1)';
  };

  const maxCount = Math.max(1, ...univList.flatMap(u=>orderedTiers.map(t=>cellData[u.name]?.[t]?.count||0)));

  const modeBtns = [
    { key:'count', label:'👥 인원수' },
    { key:'wr',    label:'📈 승률' },
  ];

  let h = `<style>
    .b2hm2-wrap { overflow-x:auto; }
    .b2hm2-ctrl { display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-bottom:12px;padding:10px 12px;background:var(--surface);border:1px solid var(--border2);border-radius:12px }
    .b2hm2-ctrl-group { display:flex;gap:4px;align-items:center;flex-wrap:wrap }
    .b2hm2-lbl { font-size:11px;font-weight:800;color:var(--text3);margin-right:2px }
    .b2hm2-btn { padding:4px 10px;border-radius:8px;border:1.5px solid var(--border2);background:var(--white);font-size:11px;font-weight:700;color:var(--text2);cursor:pointer;transition:all .12s;user-select:none }
    .b2hm2-btn.on { background:var(--text1);color:var(--white);border-color:var(--text1);box-shadow:inset 0 2px 4px rgba(0,0,0,.25) }
    .b2hm2-btn:not(.on):hover { border-color:var(--text1);color:var(--text1) }
    .b2hm2-btn:not(.on):active { background:var(--border2);transform:scale(.97) }
    .b2hm2-sel { padding:4px 10px;border-radius:8px;border:1.5px solid var(--border2);background:var(--white);font-size:11px;font-weight:700;color:var(--text2);cursor:pointer; }
    .b2hm2-sep { width:1px;height:22px;background:var(--border2);margin:0 4px }
    .b2hm2-tbl { border-collapse:separate;border-spacing:3px;min-width:100% }
    .b2hm2-tbl th { font-size:10px;font-weight:800;color:var(--text3);padding:4px 6px;text-align:center;white-space:nowrap;position:sticky }
    .b2hm2-tbl th.row-head { text-align:left;left:0;z-index:3;background:var(--bg) }
    .b2hm2-tbl th.col-head { top:0;z-index:2;background:var(--bg) }
    .b2hm2-tbl td { border-radius:8px;text-align:center;font-size:11px;font-weight:800;padding:6px 4px;min-width:44px;cursor:pointer;position:relative;transition:none }
    .b2hm2-popup { display:none;position:fixed;inset:0;z-index:9999;align-items:center;justify-content:center;background:rgba(0,0,0,.55);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px) }
    .b2hm2-popup.show { display:flex }
    .b2hm2-popup-inner { background:var(--white);border-radius:22px;padding:0;max-width:400px;width:92%;max-height:85vh;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 24px 72px rgba(0,0,0,.28),0 0 0 1px rgba(0,0,0,.06);position:relative;animation:b2hmIn .22s cubic-bezier(.34,1.56,.64,1) }
    .b2hm2-popup-header { padding:18px 20px 14px;border-bottom:1px solid var(--border2);flex-shrink:0;background:var(--surface) }
    .b2hm2-popup-body { padding:16px 20px 20px;overflow-y:auto;flex:1 }
    @keyframes b2hmIn { from{opacity:0;transform:scale(.88) translateY(16px)} to{opacity:1;transform:none} }
    .b2hm2-popup-close { position:absolute;top:14px;right:16px;background:var(--border2);border:none;width:28px;height:28px;border-radius:50%;font-size:14px;cursor:pointer;color:var(--text2);display:flex;align-items:center;justify-content:center;transition:all .15s;z-index:2 }
    .b2hm2-popup-close:hover { background:var(--text1);color:#fff }
    .b2hm2-pcard { display:flex;flex-direction:column;align-items:center;gap:5px;padding:10px 8px;border-radius:12px;border:1.5px solid transparent;text-align:center;transition:all .15s;cursor:pointer }
    .b2hm2-pcard:hover { border-color:var(--border2);box-shadow:0 2px 8px #0001;transform:translateY(-1px) }
    .b2hm2-pcard-photo { width:46px;height:46px;border-radius:10px;object-fit:cover;flex-shrink:0 }
    .b2hm2-pcard-avatar { width:46px;height:46px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:19px;font-weight:900;flex-shrink:0 }
    .b2hm2-stat-row { display:flex;gap:8px;margin-bottom:12px }
    .b2hm2-stat-box { flex:1;padding:10px 8px;border-radius:12px;text-align:center;border:1.5px solid transparent }
    .b2hm2-week-badge { display:inline-flex;align-items:center;gap:5px;padding:5px 12px;border-radius:20px;background:#fff7ed;border:1px solid #fed7aa;font-size:11px;font-weight:800;color:#c2410c;margin-bottom:12px }
    .b2hm2-tbl td:hover { filter:none;box-shadow:none; }
    .b2hm2-tbl tr:hover td { filter:none; box-shadow:none; }
    .b2hm2-tbl td.univ-name { text-align:left;font-size:11px;font-weight:800;padding:4px 8px;white-space:nowrap;background:var(--bg);color:var(--text1);position:sticky;left:0;z-index:2;min-width:72px }
    .b2hm2-tbl td.total-cell { background:var(--surface);border:1px solid var(--border2);font-weight:900 }
    .b2hm2-legend { display:flex;align-items:center;gap:6px;margin-top:8px;font-size:11px;color:var(--text3) }
    .b2hm2-legend-bar { height:12px;width:120px;border-radius:6px }
    .b2hm2-empty { font-size:11px;color:var(--text3);padding:2px 4px }
  </style>`;

  // 컨트롤
  h += `<div class="b2hm2-ctrl">
    <div class="b2hm2-ctrl-group">
      <span class="b2hm2-lbl">표시:</span>
      ${modeBtns.map(b=>`<button class="b2hm2-btn${mode===b.key?' on':''}" onclick="window._b2HeatmapMode='${b.key}';render()">${b.label}</button>`).join('')}
    </div>
    <div class="b2hm2-sep"></div>
    <div class="b2hm2-ctrl-group">
      <span class="b2hm2-lbl">행 정렬:</span>
      <select class="b2hm2-sel" onchange="window._b2HeatmapSortRow=this.value;render()">
        <option value="name"${sortRow==='name'?' selected':''}>🔤 이름</option>
        <option value="count"${sortRow==='count'?' selected':''}>👥 인원</option>
        <option value="wr"${sortRow==='wr'?' selected':''}>📈 승률</option>
      </select>
    </div>
    <div class="b2hm2-sep"></div>
    <div class="b2hm2-ctrl-group">
      <span class="b2hm2-lbl">열 정렬:</span>
      <select class="b2hm2-sel" onchange="window._b2HeatmapSortCol=this.value;render()">
        <option value="tier"${sortCol==='tier'?' selected':''}>🏅 티어</option>
        <option value="count"${sortCol==='count'?' selected':''}>👥 인원</option>
        <option value="wr"${sortCol==='wr'?' selected':''}>📈 승률</option>
      </select>
    </div>
  </div>`;

  h += `<div class="b2hm2-wrap"><table class="b2hm2-tbl">`;

  // 헤더행 (티어)
  const maxWr = 100;
  h += `<thead><tr>
    <th class="row-head col-head">대학 \\ 티어</th>
    ${sortedTiers.map(t => {
      const col   = typeof getTierBtnColor==='function'?getTierBtnColor(t):'#64748b';
      const tcol  = typeof getTierBtnTextColor==='function'?(getTierBtnTextColor(t)||'#fff'):'#fff';
      const tot   = tierTotals[t];
      const sub   = mode==='count'?`${tot.count}명`:tot.wr!==null?`${tot.wr}%`:'-';
      return `<th class="col-head"><div style="display:flex;flex-direction:column;align-items:center;gap:2px">
        <span style="padding:2px 8px;border-radius:6px;background:${col};color:${tcol}">${t}</span>
        <span style="font-size:9px;font-weight:700;color:var(--text3)">${sub}</span>
      </div></th>`;
    }).join('')}
    <th class="col-head" style="border-left:2px solid var(--border2)">합계</th>
  </tr></thead><tbody>`;

  // 데이터 행
  sortedUnivs.forEach(u => {
    const color = gc ? gc(u.name)||'#64748b' : '#64748b';
    const tot   = univTotals[u.name];
    if (!tot.count) return;
    h += `<tr>
      <td class="univ-name" style="border-left:3px solid ${color};background:var(--bg) !important">
        <span style="color:${color}">${u.name}</span>
        <div style="font-size:9px;color:var(--text3);font-weight:600">${mode==='count'?`${tot.count}명`:tot.wr!==null?`${tot.wr}%`:'-'}</div>
      </td>
      ${sortedTiers.map(t => {
        const c = cellData[u.name]?.[t];
        if (!c || !c.count) return `<td style="background:var(--bg) !important"><span class="b2hm2-empty">-</span></td>`;
        const val   = mode==='count' ? c.count : ((c.wins+c.losses>0)?Math.round(c.wins/(c.wins+c.losses)*100):0);
        const max   = mode==='count' ? maxCount : 100;
        let bg      = heatColor(val, max, color);
        let fc      = textColor(val, max);
        const label = mode==='count' ? `${c.count}명` : `${val}%`;
        const sub   = mode==='wr' ? `${c.wins}승${c.losses}패` : '';
        const _au = (typeof escAttr==='function') ? escAttr : (s)=>String(s||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
        const games = (c.wins||0) + (c.losses||0);
        if(mode==='wr' && games>0 && games < 5){
          bg = 'rgba(148,163,184,0.16)';
          fc = 'var(--text3)';
        }
        return `<td style="background:${bg} !important;color:${fc}" title="${u.name} / ${t}: ${c.count}명 ${c.wins}승 ${c.losses}패" data-hm-uid="${hmUid}" data-hm-univ="${_au(u.name)}" data-hm-tier="${_au(t)}" data-hm-color="${_au(color)}" onclick="_b2HeatmapCellClick(this)">
          <div style="font-size:12px;font-weight:900">${label}</div>
          ${sub?`<div style="font-size:9px;opacity:.8">${sub}</div>`:''}
        </td>`;
      }).join('')}
      <td class="total-cell" style="background:var(--surface) !important;color:${color}; cursor: pointer;" data-hm-uid="${hmUid}" data-hm-univ="${(typeof escAttr==='function')?escAttr(u.name):String(u.name||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}" data-hm-color="${(typeof escAttr==='function')?escAttr(color):String(color||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}" onclick="_b2HeatmapTotalClick(this)">
        <div>${mode==='count'?`${tot.count}명`:tot.wr!==null?`${tot.wr}%`:'-'}</div>
        ${mode==='wr'?`<div style="font-size:9px;color:var(--text3)">${tot.wins}승${tot.losses}패</div>`:`<div style="font-size:9px;color:var(--text3)">${tot.wins}승${tot.losses}패</div>`}
      </td>
    </tr>`;
  });

  // 합계 행
  const grandW = Object.values(univTotals).reduce((s,u)=>s+u.wins,0);
  const grandL = Object.values(univTotals).reduce((s,u)=>s+u.losses,0);
  const grandG = grandW+grandL;
  const grandWr = grandG>0?Math.round(grandW/grandG*100):null;
  h += `<tr style="border-top:2px solid var(--border2)">
    <td class="univ-name" style="background:var(--surface) !important;font-weight:900;color:var(--text1)">합계</td>
    ${sortedTiers.map(t=>{
      const tot=tierTotals[t];
      const val=mode==='count'?tot.count:tot.wr??0;
      return `<td style="background:var(--surface);font-weight:900;color:var(--text2)">
        <div>${mode==='count'?`${tot.count}명`:tot.wr!==null?`${tot.wr}%`:'-'}</div>
        <div style="font-size:9px;color:var(--text3)">${tot.wins}승${tot.losses}패</div>
      </td>`;
    }).join('')}
    <td class="total-cell" style="background:var(--surface) !important;font-weight:900;color:var(--text1)">
      <div>${mode==='count'?`${vis.length}명`:grandWr!==null?`${grandWr}%`:'-'}</div>
      <div style="font-size:9px;color:var(--text3)">${grandW}승${grandL}패</div>
    </td>
  </tr>`;

  h += `</tbody></table></div>`;

  // 셀 클릭 인원 팝업
  h += `<div id="${hmUid}-popup" class="b2hm2-popup" onclick="if(event.target===this)this.classList.remove('show')">
    <div class="b2hm2-popup-inner">
      <button class="b2hm2-popup-close" onclick="document.getElementById('${hmUid}-popup').classList.remove('show')">✕</button>
      <div id="${hmUid}-popup-header" class="b2hm2-popup-header"></div>
      <div id="${hmUid}-popup-body" class="b2hm2-popup-body"></div>
    </div>
  </div>`;

  // 범례
  if (mode === 'count') {
    h += `<div class="b2hm2-legend">
      <span>적음</span>
      <div class="b2hm2-legend-bar" style="background:linear-gradient(90deg,rgba(59,130,246,.12),rgba(59,130,246,.9))"></div>
      <span>많음</span>
    </div>`;
  } else {
    h += `<div class="b2hm2-legend">
      <span>0%</span>
      <div class="b2hm2-legend-bar" style="background:linear-gradient(90deg,rgba(255,80,80,.55),rgba(255,255,80,.4),rgba(80,255,80,.55))"></div>
      <span>100%</span>
    </div>`;
  }

  return h;
}
/* ══════════════════════════════════════
   🌐 버블뷰 v2 — 클릭 팝업 + 진입 애니메이션 + 승률 버블 모드
══════════════════════════════════════ */
function _b2BubbleView() {
  const _dissSet = new Set((typeof univCfg !== 'undefined' ? univCfg : []).filter(u=>u.dissolved||u.hidden).map(u=>String(u.name||'').trim()));
  const univList = (_b2VisUnivs ? _b2VisUnivs() : []).filter(u=>u.name && u.name!=='무소속');
  const tieredVis = players.filter(p =>
    !p.hidden && !p.retired && !p.hideFromBoard &&
    !_dissSet.has(String(p?.univ||'').trim()) &&
    !_B2_ROLE_ORDER.includes(p.role||'')
  );

  const univData = univList.map(u => {
    const members = tieredVis.filter(p => String(p?.univ||'').trim() === u.name);
    const P = members.filter(p=>p.race==='P').length;
    const T = members.filter(p=>p.race==='T').length;
    const Z = members.filter(p=>p.race==='Z').length;
    const color = gc(u.name) || '#64748b';
    let wins=0, losses=0;
    members.forEach(p=>{
      (Array.isArray(p.history)?p.history:[]).forEach(h=>{
        if(h.result==='승')wins++; else if(h.result==='패')losses++;
      });
    });
    const games = wins+losses;
    const wr = games>0?Math.round(wins/games*100):null;
    // 최근 활동 (이번주)
    const now = new Date(); const day=now.getDay();
    const mon = new Date(now); mon.setDate(now.getDate()+(day===0?-6:1-day));
    const fromN = parseInt(mon.toISOString().slice(0,10).replace(/-/g,''));
    const toN   = parseInt(now.toISOString().replace(/T.*/,'').replace(/-/g,''));
    let weekActive=0;
    members.forEach(p=>{
      const hist=Array.isArray(p.history)?p.history:[];
      const d=hist.filter(h=>{ const dn=parseInt(String(h.date||h.d||'').replace(/[-\.]/g,''));return dn>=fromN&&dn<=toN; });
      if(d.length>0)weekActive++;
    });
    // Top tier
    const TIERS_LOCAL=typeof TIERS!=='undefined'?TIERS:[];
    const sortedM=members.slice().sort((a,b)=>{const ia=TIERS_LOCAL.indexOf(a.tier||''),ib=TIERS_LOCAL.indexOf(b.tier||'');return(ia>=0?ia:999)-(ib>=0?ib:999);});
    const topTier=sortedM[0]?.tier||null;
    const topTierCol=typeof getTierBtnColor==='function'&&topTier?getTierBtnColor(topTier):'#94a3b8';
    const topTierTc=typeof getTierBtnTextColor==='function'&&topTier?(getTierBtnTextColor(topTier)||'#fff'):'#fff';
    return { name:u.name, total:members.length, P, T, Z, color, wins, losses, games, wr, weekActive, topTier, topTierCol, topTierTc };
  }).filter(u=>u.total>0).sort((a,b)=>b.total-a.total);

  const dataJson = JSON.stringify(univData);
  const uid = 'bbl_' + Math.random().toString(36).slice(2,8);

  return `<style>
    #${uid}-wrap { position:relative; }
    #${uid}-canvas { display:block; width:100%; cursor:pointer; border-radius:12px; }
    #${uid}-tooltip { position:absolute; pointer-events:none; opacity:0; background:var(--white); border:1px solid var(--border2); border-radius:14px; padding:14px 16px; box-shadow:0 8px 32px #0003; transition:opacity .15s ease; min-width:180px; z-index:var(--z-dropdown,100); }
    #${uid}-legend { display:flex; flex-wrap:wrap; gap:6px; margin-top:10px; }
    .${uid}-sort-btn { padding:5px 12px; border-radius:20px; border:1.5px solid var(--border2); background:var(--surface); font-size:12px; font-weight:700; color:var(--text2); cursor:pointer; transition:all .15s; }
    .${uid}-sort-btn.on { background:var(--text1); color:var(--white); border-color:var(--text1); }
    .${uid}-sort-btn:hover:not(.on) { border-color:var(--text2); }
    #${uid}-popup { display:none; position:fixed; inset:0; z-index:999; align-items:center; justify-content:center; background:rgba(0,0,0,.45); }
    #${uid}-popup.show { display:flex; }
    #${uid}-popup-inner { background:var(--white); border-radius:20px; padding:24px; max-width:340px; width:90%; box-shadow:0 20px 60px #0005; position:relative; animation:b2bblIn .25s ease; }
    @keyframes b2bblIn { from{opacity:0;transform:scale(.92) translateY(12px)} to{opacity:1;transform:none} }
    #${uid}-popup-close { position:absolute;top:14px;right:14px;background:none;border:none;font-size:18px;cursor:pointer;color:var(--text3);line-height:1 }
    #${uid}-popup-close:hover { color:var(--text1) }
  </style>
  <div id="${uid}-wrap">
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;flex-wrap:wrap">
      <span style="font-size:13px;font-weight:900;color:var(--text1)">🌐 대학별 버블맵</span>
      <span style="font-size:12px;color:var(--text3)">버블 크기 = 인원 · 파이 = 종족 비율</span>
      <div style="margin-left:auto;display:flex;gap:4px;flex-wrap:wrap">
        <button class="${uid}-sort-btn on" onclick="_${uid}setSort('total',this)">인원순</button>
        <button class="${uid}-sort-btn" onclick="_${uid}setSort('wr',this)">승률순</button>
        <button class="${uid}-sort-btn" onclick="_${uid}setSort('P',this)">P비율</button>
        <button class="${uid}-sort-btn" onclick="_${uid}setSort('T',this)">T비율</button>
        <button class="${uid}-sort-btn" onclick="_${uid}setSort('Z',this)">Z비율</button>
      </div>
    </div>
    <canvas id="${uid}-canvas"></canvas>
    <div id="${uid}-tooltip"></div>
    <div id="${uid}-legend"></div>
  </div>

  <!-- 클릭 상세 팝업 -->
  <div id="${uid}-popup" onclick="if(event.target===this)this.classList.remove('show')">
    <div id="${uid}-popup-inner">
      <button id="${uid}-popup-close" onclick="document.getElementById('${uid}-popup').classList.remove('show')">✕</button>
      <div id="${uid}-popup-body"></div>
    </div>
  </div>

  <script>
  (function(){
    const RAW = ${dataJson};
    const RACE_COLS = { P:'#7c3aed', T:'#0284c7', Z:'#059669', '?':'#94a3b8' };
    let sortKey = 'total';
    let hovIdx  = -1;
    let bubbles = [];
    let animProgress = 0;
    let animId = null;
    const canvas  = document.getElementById('${uid}-canvas');
    const ttip    = document.getElementById('${uid}-tooltip');
    const legendEl= document.getElementById('${uid}-legend');
    const popup   = document.getElementById('${uid}-popup');
    const popBody = document.getElementById('${uid}-popup-body');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    function sortedData() {
      return [...RAW].sort((a,b) => {
        if (sortKey === 'total') return b.total - a.total;
        if (sortKey === 'wr')   return (b.wr??-1) - (a.wr??-1);
        const ra = a.total>0?a[sortKey]/a.total:0, rb = b.total>0?b[sortKey]/b.total:0;
        return rb - ra;
      });
    }

    function layout() {
      const W = canvas.parentElement.offsetWidth || 700;
      const data = sortedData();
      const n = data.length;
      if (!n) return [];
      const maxT = Math.max(...data.map(d=>d.total), 1);
      const minR = 18, maxR = Math.max(44, Math.min(72, W/(Math.sqrt(n)*2.2)));
      const cols = Math.max(3, Math.min(8, Math.floor(W/(maxR*2.4))));
      const cellW = W/cols, cellH = maxR*2.6;
      const H = Math.ceil(n/cols)*cellH + 20;
      canvas.width  = W*devicePixelRatio;
      canvas.height = H*devicePixelRatio;
      canvas.style.height = H+'px';
      ctx.setTransform(1,0,0,1,0,0);
      ctx.scale(devicePixelRatio, devicePixelRatio);
      return data.map((d,i) => {
        const col=i%cols, row=Math.floor(i/cols);
        const cx=cellW*col+cellW/2, cy=row*cellH+cellH/2+10;
        const r=minR+(d.total/maxT)*(maxR-minR);
        return {...d, cx, cy, r, idx:i};
      });
    }

    function easeOut(t){ return 1-(1-t)*(1-t)*(1-t); }

    function drawPie(bbl, scale) {
      const {cx,cy,r,P,T,Z,total,color} = bbl;
      const rr = r*scale;
      const segs=[{val:P,col:RACE_COLS.P},{val:T,col:RACE_COLS.T},{val:Z,col:RACE_COLS.Z},{val:total-P-T-Z,col:RACE_COLS['?']}].filter(s=>s.val>0);
      if (!segs.length) {
        ctx.beginPath(); ctx.arc(cx,cy,rr,0,Math.PI*2);
        ctx.fillStyle=color+'44'; ctx.fill(); return;
      }
      let angle=-Math.PI/2;
      segs.forEach(seg=>{
        const slice=(seg.val/total)*Math.PI*2;
        ctx.beginPath(); ctx.moveTo(cx,cy); ctx.arc(cx,cy,rr,angle,angle+slice); ctx.closePath();
        ctx.fillStyle=seg.col; ctx.fill();
        angle+=slice;
      });
      ctx.beginPath(); ctx.arc(cx,cy,rr,0,Math.PI*2);
      ctx.strokeStyle='rgba(255,255,255,0.55)'; ctx.lineWidth=2.5; ctx.stroke();
    }

    function drawLabel(bbl, isHov, scale) {
      const {cx,cy,r,name,total,wr} = bbl;
      const rr=r*scale;
      ctx.save();
      if (isHov) {
        ctx.beginPath(); ctx.arc(cx,cy,rr+5,0,Math.PI*2);
        ctx.strokeStyle='rgba(0,0,0,0.3)'; ctx.lineWidth=2.5; ctx.stroke();
        // 글로우
        ctx.shadowColor=bbl.color; ctx.shadowBlur=14;
        ctx.beginPath(); ctx.arc(cx,cy,rr,0,Math.PI*2);
        ctx.strokeStyle=bbl.color+'88'; ctx.lineWidth=2; ctx.stroke();
        ctx.shadowBlur=0;
      }
      const fs=Math.max(9,Math.min(12,rr*0.28));
      const shortName=name.length>5?name.slice(0,5)+'…':name;
      ctx.font=\`bold \${fs}px sans-serif\`; ctx.textAlign='center';
      ctx.fillStyle='var(--text2,#334155)';
      ctx.fillText(shortName,cx,cy+rr+fs+2);
      ctx.font=\`900 \${Math.max(10,Math.min(16,rr*0.38))}px sans-serif\`;
      ctx.fillStyle='#fff'; ctx.shadowColor='rgba(0,0,0,0.4)'; ctx.shadowBlur=3;
      ctx.fillText(total,cx,cy+(wr!==null?-4:4));
      ctx.shadowBlur=0;
      if (wr!==null && rr>22) {
        ctx.font=\`700 \${Math.max(8,Math.min(11,rr*0.26))}px sans-serif\`;
        ctx.fillStyle='rgba(255,255,255,0.85)';
        ctx.fillText(wr+'%',cx,cy+10);
      }
      ctx.restore();
    }

    function draw(progress) {
      if (!bubbles.length) return;
      const sc = easeOut(Math.min(progress||1, 1));
      ctx.clearRect(0,0,canvas.width,canvas.height);
      bubbles.forEach((b,i)=>{ drawPie(b,sc); drawLabel(b,i===hovIdx,sc); });
    }

    function startAnim() {
      if(animId) cancelAnimationFrame(animId);
      animProgress=0;
      const start=performance.now(), dur=420;
      function step(now){
        animProgress=Math.min((now-start)/dur,1);
        draw(animProgress);
        if(animProgress<1) animId=requestAnimationFrame(step);
      }
      animId=requestAnimationFrame(step);
    }

    function showTooltip(b, mx, my) {
      const pct=n=>b.total>0?Math.round(n/b.total*100):0;
      const wrCol=b.wr===null?'#94a3b8':b.wr>=60?'#10b981':b.wr>=40?'#f59e0b':'#ef4444';
      ttip.innerHTML=\`
        <div style="font-weight:900;font-size:13px;color:\${b.color};margin-bottom:6px">\${b.name}</div>
        <div style="font-size:12px;font-weight:700;color:#334155;margin-bottom:2px">👥 \${b.total}명 · 활성 \${b.weekActive}명</div>
        \${b.wr!==null?'<div style="font-size:12px;font-weight:800;color:'+wrCol+'">📈 승률 '+b.wr+'% ('+b.wins+'승'+b.losses+'패)</div>':''}
        \${b.topTier?'<div style="font-size:11px;margin-top:4px"><span style="padding:1px 6px;border-radius:5px;background:'+b.topTierCol+';color:'+b.topTierTc+';font-size:10px;font-weight:800">TOP '+b.topTier+'</span></div>':''}
        <div style="font-size:10px;color:#94a3b8;margin-top:6px">클릭 → 상세 정보</div>
      \`;
      const wrap=canvas.parentElement.getBoundingClientRect();
      let left=mx+14,top=my+14;
      if(left+180>wrap.width)left=mx-190;
      if(top+140>wrap.height)top=my-140;
      ttip.style.left=left+'px'; ttip.style.top=top+'px'; ttip.style.opacity='1';
    }
    function hideTooltip(){ ttip.style.opacity='0'; }

    function showPopup(b) {
      const pct=n=>b.total>0?Math.round(n/b.total*100):0;
      const wrCol=b.wr===null?'#94a3b8':b.wr>=60?'#10b981':b.wr>=40?'#f59e0b':'#ef4444';
      popBody.innerHTML=\`
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px">
          <div style="width:14px;height:14px;border-radius:50%;background:\${b.color}"></div>
          <div style="font-size:18px;font-weight:900;color:\${b.color}">\${b.name}</div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px">
          <div style="padding:10px;border-radius:12px;background:\${b.color}12;border:1px solid \${b.color}33;text-align:center">
            <div style="font-size:22px;font-weight:900;color:\${b.color}">\${b.total}</div>
            <div style="font-size:11px;color:#94a3b8">총 인원</div>
          </div>
          <div style="padding:10px;border-radius:12px;background:#f59e0b12;border:1px solid #f59e0b33;text-align:center">
            <div style="font-size:22px;font-weight:900;color:#f59e0b">\${b.weekActive}</div>
            <div style="font-size:11px;color:#94a3b8">이번주 활동</div>
          </div>
          \${b.wr!==null?'<div style="padding:10px;border-radius:12px;background:'+wrCol+'12;border:1px solid '+wrCol+'33;text-align:center"><div style="font-size:22px;font-weight:900;color:'+wrCol+'">'+b.wr+'%</div><div style="font-size:11px;color:#94a3b8">통산 승률</div></div>':''}
          <div style="padding:10px;border-radius:12px;background:#3b82f612;border:1px solid #3b82f633;text-align:center">
            <div style="font-size:15px;font-weight:900;color:#3b82f6">\${b.wins}승 \${b.losses}패</div>
            <div style="font-size:11px;color:#94a3b8">통산 전적</div>
          </div>
        </div>
        \${b.topTier?'<div style="margin-bottom:12px"><span style="padding:2px 10px;border-radius:8px;background:'+b.topTierCol+';color:'+b.topTierTc+';font-size:12px;font-weight:800">🏅 최상위 티어: '+b.topTier+'</span></div>':''}
        <div style="font-size:12px;font-weight:700;color:#94a3b8;margin-bottom:6px">종족 구성</div>
        \${[['🔮','프로토스','#7c3aed',b.P],['⚔️','테란','#0284c7',b.T],['🦎','저그','#059669',b.Z]].filter(function(r){return r[3]>0;}).map(function(r){var ico=r[0],lbl=r[1],col=r[2],n=r[3];return '<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px"><span>'+ico+'</span><span style="font-size:12px;font-weight:700;min-width:52px;color:'+col+'">'+lbl+'</span><div style="flex:1;height:8px;border-radius:4px;background:#f1f5f9;overflow:hidden"><div style="width:'+pct(n)+'%;height:100%;background:'+col+';border-radius:4px"></div></div><span style="font-size:12px;font-weight:900;color:'+col+'">'+n+'명 ('+pct(n)+'%)</span></div>';}).join('')}
      \`;
      popup.classList.add('show');
    }

    function findBubble(mx,my){ return bubbles.findIndex(b=>{ const dx=mx-b.cx,dy=my-b.cy; return Math.sqrt(dx*dx+dy*dy)<b.r+6; }); }

    canvas.addEventListener('mousemove',e=>{
      const rect=canvas.getBoundingClientRect();
      const scX=canvas.width/devicePixelRatio/rect.width, scY=canvas.height/devicePixelRatio/rect.height;
      const mx=(e.clientX-rect.left)*scX, my=(e.clientY-rect.top)*scY;
      const idx=findBubble(mx,my);
      if(idx!==hovIdx){ hovIdx=idx; if(animProgress>=1)draw(1); }
      if(idx>=0){ showTooltip(bubbles[idx],e.clientX-rect.left,e.clientY-rect.top); canvas.style.cursor='pointer'; }
      else { hideTooltip(); canvas.style.cursor='default'; }
    });
    canvas.addEventListener('mouseleave',()=>{ hovIdx=-1; if(animProgress>=1)draw(1); hideTooltip(); });
    canvas.addEventListener('click',e=>{
      const rect=canvas.getBoundingClientRect();
      const mx=(e.clientX-rect.left)*(canvas.width/devicePixelRatio/rect.width);
      const my=(e.clientY-rect.top)*(canvas.height/devicePixelRatio/rect.height);
      const idx=findBubble(mx,my);
      if(idx>=0){ hideTooltip(); showPopup(bubbles[idx]); }
    });

    window['_${uid}setSort']=function(key,btn){
      sortKey=key;
      document.querySelectorAll('.${uid}-sort-btn').forEach(b=>b.classList.remove('on'));
      btn.classList.add('on');
      hovIdx=-1; bubbles=layout(); startAnim();
    };

    function buildLegend(){
      legendEl.innerHTML = '<span style="font-size:11px;font-weight:700;color:var(--text3)">종족 범례:</span>' +
        [['#7c3aed','🔮 프로토스'],['#0284c7','⚔️ 테란'],['#059669','🦎 저그'],['#94a3b8','❓ 미정']].map(function(r){var c=r[0],l=r[1];return '<span style="display:flex;align-items:center;gap:4px;font-size:11px;font-weight:700;color:#334155"><span style="width:10px;height:10px;border-radius:50%;background:'+c+';display:inline-block"></span>'+l+'</span>';}).join('') +
        '<span style="font-size:11px;color:var(--text3);margin-left:6px">버블 안 숫자 = 인원 · % = 승률</span>';
    }

    function tryInit(attempt){
      const w=canvas.parentElement?canvas.parentElement.offsetWidth:0;
      if(w>0){ bubbles=layout(); buildLegend(); startAnim(); }
      else if(attempt<15){ requestAnimationFrame(()=>tryInit(attempt+1)); }
      else { setTimeout(()=>{ bubbles=layout(); buildLegend(); startAnim(); },200); }
    }
    let resizeTimer;
    const ro=new ResizeObserver(()=>{ clearTimeout(resizeTimer); resizeTimer=setTimeout(()=>{ ctx.setTransform(1,0,0,1,0,0); bubbles=layout(); draw(1); },120); });
    ro.observe(canvas.parentElement);
    requestAnimationFrame(()=>tryInit(0));
  })();
  </script>`;
}
function _b2ActivityView() {
  const _dissSet = new Set((typeof univCfg !== 'undefined' ? univCfg : []).filter(u=>u.dissolved||u.hidden).map(u=>String(u.name||'').trim()));
  const vis = players.filter(p =>
    !p.hidden && !p.retired && !p.hideFromBoard &&
    !_dissSet.has(String(p?.univ||'').trim())
  );
  const tieredVis = vis.filter(p => !_B2_ROLE_ORDER.includes(p.role||''));

  // 이번주 활동 집계
  const _avNow=new Date(),_avDay=_avNow.getDay();
  const _avMon=new Date(_avNow); _avMon.setDate(_avNow.getDate()+(_avDay===0?-6:1-_avDay));
  const _avFromN=parseInt(_avMon.toISOString().slice(0,10).replace(/-/g,''));
  const _avToN  =parseInt(_avNow.toISOString().slice(0,10).replace(/-/g,''));
  const _avDN   =s=>parseInt(String(s||'').replace(/[-\.]/g,''))||0;
  let _avWw=0,_avWl=0,_avActive=new Set();
  tieredVis.forEach(p=>{
    (Array.isArray(p.history)?p.history:[]).forEach(h=>{
      const d=_avDN(h.date||h.d||'');
      if(d>=_avFromN&&d<=_avToN){
        if(h.result==='승')_avWw++; else if(h.result==='패')_avWl++;
        _avActive.add(p.name);
      }
    });
  });
  const _avWr=(_avWw+_avWl)>0?Math.round(_avWw/(_avWw+_avWl)*100):null;
  const _avWrc=_avWr===null?'#94a3b8':_avWr>=60?'#10b981':_avWr>=40?'#f59e0b':'#ef4444';
  const statusGroups = {}; // key: emoji or '' → players
  const noStatus = [];
  tieredVis.forEach(p => {
    let icon = '';
    if (typeof getStatusIcon === 'function') {
      try { icon = getStatusIcon(p.name) || ''; } catch(e) {}
    }
    if (!icon) { noStatus.push(p); return; }
    if (!statusGroups[icon]) statusGroups[icon] = [];
    statusGroups[icon].push(p);
  });

  // Sort status groups by count desc
  const sortedStatuses = Object.entries(statusGroups)
    .sort((a,b) => b[1].length - a[1].length);

  // Build tier strip for a player list
  const tierStrip = (members) => {
    if (!members.length) return '';
    const tierCts = {};
    members.forEach(p => { const t=p.tier||'미정'; tierCts[t]=(tierCts[t]||0)+1; });
    const ordered = (typeof TIERS !== 'undefined' ? TIERS : []).filter(t=>tierCts[t])
      .concat(Object.keys(tierCts).filter(t=>typeof TIERS==='undefined'||!TIERS.includes(t)));
    return ordered.map(t => {
      const col = typeof getTierBtnColor==='function'?getTierBtnColor(t):'#64748b';
      const tc = typeof getTierBtnTextColor==='function'?(getTierBtnTextColor(t)||'#fff'):'#fff';
      return `<span style="font-size:10px;font-weight:800;padding:1px 6px;border-radius:8px;background:${col};color:${tc}">${t}×${tierCts[t]}</span>`;
    }).join('');
  };

  // Race mini-bar
  const raceMiniBar = (members) => {
    const P = members.filter(p=>p.race==='P').length;
    const T = members.filter(p=>p.race==='T').length;
    const Z = members.filter(p=>p.race==='Z').length;
    const tot = members.length || 1;
    const seg = (n,c,l) => n ? `<div title="${l} ${n}명" style="flex:${n};background:${c};height:100%"></div>` : '';
    return `<div style="display:flex;height:4px;border-radius:2px;overflow:hidden;margin:5px 0">
      ${seg(P,'#7c3aed','프로토스')}
      ${seg(T,'#0284c7','테란')}
      ${seg(Z,'#059669','저그')}
      ${seg(tot-P-T-Z,'#cbd5e1','미정')}
    </div>`;
  };

  // Render a status card
  const renderStatusCard = (icon, members, accent) => {
    const cnt = members.length;
    members.sort((a,b) => {
      const ti = typeof TIERS!=='undefined'?TIERS:[];
      const ia=ti.indexOf(a.tier||''); const ib=ti.indexOf(b.tier||'');
      return (ia>=0?ia:999)-(ib>=0?ib:999)||((a.name||'').localeCompare(b.name||'','ko',{sensitivity:'base'}));
    });
    const isImg = typeof window._siIsImg === 'function' ? window._siIsImg(icon) : (typeof icon==='string'&&(icon.startsWith('http')||icon.startsWith('data:')));
    const iconEl = isImg
      ? `<img src="${icon}" style="width:28px;height:28px;object-fit:contain;border-radius:6px" onerror="this.style.display='none'">`
      : `<span style="font-size:24px;line-height:1">${icon}</span>`;

    return `<div class="b2-act-card" style="--act-accent:${accent}">
      <div class="b2-act-card-header">
        <div class="b2-act-icon-wrap">${iconEl}</div>
        <div style="flex:1">
          <div style="font-size:13px;font-weight:900;color:var(--text1)">${cnt}명</div>
          ${raceMiniBar(members)}
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:3px;max-width:120px;justify-content:flex-end">
          ${tierStrip(members)}
        </div>
      </div>
      <div class="b2-act-players">
        ${members.map(p => _b2NameTag(p, accent, false)).join('')}
      </div>
    </div>`;
  };

  // Accent colors for status groups (cycle through palette)
  const accentPalette = ['#8b5cf6','#0891b2','#059669','#db2777','#f59e0b','#ef4444','#6366f1','#14b8a6','#f97316'];
  let accentIdx = 0;

  // Summary strip
  const withStatus = tieredVis.length - noStatus.length;
  const noStatusPct = tieredVis.length > 0 ? Math.round(noStatus.length/tieredVis.length*100) : 0;
  const withStatusPct = 100 - noStatusPct;

  let h = `<style>
    .b2-act-wrap { display:grid; grid-template-columns:repeat(auto-fill,minmax(260px,1fr)); gap:12px; }
    .b2-act-card {
      border-radius:14px; border:1.5px solid var(--border2);
      background:var(--white); overflow:hidden;
      box-shadow:0 2px 10px #0001;
      transition:transform .15s ease, box-shadow .15s ease;
    }
    .b2-act-card:hover { transform:translateY(-2px); box-shadow:0 6px 20px #0002; }
    .b2-act-card-header {
      display:flex; align-items:center; gap:10px;
      padding:10px 14px;
      background:color-mix(in srgb, var(--act-accent) 8%, var(--surface));
      border-bottom:1.5px solid color-mix(in srgb, var(--act-accent) 20%, var(--border2));
    }
    .b2-act-icon-wrap {
      width:36px; height:36px; border-radius:10px; display:flex; align-items:center; justify-content:center;
      background:color-mix(in srgb, var(--act-accent) 14%, var(--white));
      border:1.5px solid color-mix(in srgb, var(--act-accent) 25%, var(--border2));
      flex-shrink:0;
    }
    .b2-act-players { display:flex; flex-wrap:wrap; gap:5px; padding:10px 14px 12px; }
    .b2-act-nostatus { border-radius:14px; border:1.5px dashed var(--border2); padding:10px 14px 12px; }
    .b2-act-summary { display:flex; align-items:center; gap:10px; margin-bottom:14px; flex-wrap:wrap; }
    .b2-act-kpi { background:var(--surface); border:1px solid var(--border2); border-radius:12px; padding:10px 14px; }
    @media(max-width:540px){ .b2-act-wrap{ grid-template-columns:1fr; } }
    /* fallback for browsers without color-mix */
    @supports not (color: color-mix(in srgb, red, blue)) {
      .b2-act-card-header { background:var(--surface); }
      .b2-act-icon-wrap { background:var(--surface); }
    }
  </style>`;

  // KPI strip
  h += `<div class="b2-act-summary">
    <div class="b2-act-kpi">
      <div style="font-size:22px;font-weight:900;color:var(--text1)">${tieredVis.length}</div>
      <div style="font-size:11px;color:var(--text3);font-weight:600">전체 선수</div>
    </div>
    <div class="b2-act-kpi" style="border-color:#8b5cf644">
      <div style="font-size:22px;font-weight:900;color:#8b5cf6">${withStatus}</div>
      <div style="font-size:11px;color:var(--text3);font-weight:600">상태 표시 중</div>
    </div>
    <div class="b2-act-kpi">
      <div style="font-size:22px;font-weight:900;color:var(--text3)">${noStatus.length}</div>
      <div style="font-size:11px;color:var(--text3);font-weight:600">상태 없음</div>
    </div>
    <div class="b2-act-kpi" style="border-color:#f59e0b44">
      <div style="font-size:22px;font-weight:900;color:#f59e0b">${_avActive.size}</div>
      <div style="font-size:11px;color:var(--text3);font-weight:600">🔥 이번주 활동</div>
    </div>
    ${_avWr!==null?`<div class="b2-act-kpi" style="border-color:${_avWrc}44">
      <div style="font-size:22px;font-weight:900;color:${_avWrc}">${_avWr}%</div>
      <div style="font-size:11px;color:var(--text3);font-weight:600">이번주 승률</div>
      <div style="font-size:10px;color:var(--text3)">${_avWw}승 ${_avWl}패</div>
    </div>`:''}
    <div style="flex:1;min-width:120px">
      <div style="font-size:11px;font-weight:700;color:var(--text3);margin-bottom:4px">상태 표시 비율</div>
      <div style="height:8px;border-radius:4px;background:var(--border2);overflow:hidden;display:flex">
        <div style="width:${withStatusPct}%;background:linear-gradient(90deg,#8b5cf6,#0891b2);border-radius:4px;transition:width .8s ease"></div>
      </div>
      <div style="font-size:11px;color:var(--text3);margin-top:2px">${withStatusPct}%</div>
    </div>
  </div>`;

  if (!sortedStatuses.length && noStatus.length) {
    h += `<div style="text-align:center;padding:40px;color:var(--text3)">
      <div style="font-size:32px;margin-bottom:8px">📭</div>
      <div style="font-size:14px;font-weight:700">설정된 상태 아이콘이 없습니다</div>
      <div style="font-size:12px;margin-top:4px">현황판 설정에서 선수별 상태 아이콘을 추가해보세요</div>
    </div>`;
  } else {
    h += `<div class="b2-act-wrap">`;
    sortedStatuses.forEach(([icon, members]) => {
      const accent = accentPalette[accentIdx++ % accentPalette.length];
      h += renderStatusCard(icon, members, accent);
    });

    // 상태 없는 선수들
    if (noStatus.length) {
      noStatus.sort((a,b) => {
        const u = (a.univ||'').localeCompare(b.univ||'','ko',{sensitivity:'base'});
        if (u !== 0) return u;
        const ti = typeof TIERS!=='undefined'?TIERS:[];
        const ia=ti.indexOf(a.tier||''); const ib=ti.indexOf(b.tier||'');
        return (ia>=0?ia:999)-(ib>=0?ib:999);
      });
      h += `<div class="b2-act-nostatus">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
          <span style="font-size:16px">📭</span>
          <span style="font-size:12px;font-weight:800;color:var(--text3)">상태 없음 ${noStatus.length}명</span>
          ${raceMiniBar(noStatus)}
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:4px">
          ${noStatus.map(p => _b2NameTag(p, '#94a3b8', false)).join('')}
        </div>
      </div>`;
    }
    h += `</div>`;
  }
  return h;
}
function _b2WeeklyGetDefaultRange(offsetWeeks) {
  const now = new Date();
  const offset = offsetWeeks || 0;
  const day = now.getDay();
  const diffToMon = (day === 0 ? -6 : 1 - day);
  const mon = new Date(now);
  mon.setDate(now.getDate() + diffToMon + offset * 7);
  const sun = new Date(mon);
  sun.setDate(mon.getDate() + 6);
  const fmt = d => d.toISOString().slice(0, 10);
  return { from: fmt(mon), to: fmt(sun) };
}

// ─── 데이터 집계 헬퍼 ─────────────────────────
function _b2WeeklyAggregate(players, dateFrom, dateTo) {
  const dateNum = s => parseInt(String(s || '').replace(/[-\.\/]/g, '')) || 0;
  const fromN = dateNum(dateFrom), toN = dateNum(dateTo);
  const inRange = d => { const dn = dateNum(d); return dn >= fromN && dn <= toN; };
  const isOff   = mode => { const m = String(mode||'').trim(); return m && !['스폰서','스크리미지','연습',''].includes(m); };
  const isPro   = mode => String(mode||'').indexOf('프로리그') !== -1;

  // ── 외부 소스에서 플레이어별 경기 목록 구성 ──────────────────
  // key: playerName → [{date,result,oppRace,mode}]
  const extMap = {};
  const addExt = (name, date, result, oppRace, mode) => {
    if (!name || !date || !result) return;
    if (!inRange(date)) return;
    if (isPro(mode)) return;
    if (!extMap[name]) extMap[name] = [];
    extMap[name].push({ date, result, oppRace: oppRace||'', mode: mode||'' });
  };

  // 개인전 (indM)
  try { (typeof indM!=='undefined'&&Array.isArray(indM)?indM:[]).forEach(m=>{
    if (!m || !m.d || !m.wName || !m.lName) return;
    const wp = players.find(p=>p.name===m.wName), lp = players.find(p=>p.name===m.lName);
    addExt(m.wName, m.d, '승', lp?.race||'', m.mode||'개인전');
    addExt(m.lName, m.d, '패', wp?.race||'', m.mode||'개인전');
  }); } catch(e){}

  // 끝장전 (gjM)
  try { (typeof gjM!=='undefined'&&Array.isArray(gjM)?gjM:[]).forEach(m=>{
    if (!m || !m.d || !m.wName || !m.lName) return;
    if (m._proLabel) return;
    const wp = players.find(p=>p.name===m.wName), lp = players.find(p=>p.name===m.lName);
    addExt(m.wName, m.d, '승', lp?.race||'', m.mode||'끝장전');
    addExt(m.lName, m.d, '패', wp?.race||'', m.mode||'끝장전');
  }); } catch(e){}

  // 티어대회 (ttM)
  try { (typeof ttM!=='undefined'&&Array.isArray(ttM)?ttM:[]).forEach(m=>{
    if (!m || !m.d) return;
    (m.sets||[]).forEach(s=>{
      (s.games||[]).forEach(g=>{
        if (!g || !g.playerA || !g.playerB || !g.winner) return;
        const pA = players.find(p=>p.name===g.playerA), pB = players.find(p=>p.name===g.playerB);
        const wA = g.winner==='A', wB = g.winner==='B';
        addExt(g.playerA, m.d, wA?'승':'패', pB?.race||'', '티어대회');
        addExt(g.playerB, m.d, wB?'승':'패', pA?.race||'', '티어대회');
      });
    });
  }); } catch(e){}

  // 팀전 (miniM/univM/ckM/proM) - 게임 단위 개인 전적 집계
  const _scanTeamMatches = (arr, modeLabel) => {
    try { (Array.isArray(arr)?arr:[]).forEach(m=>{
      if (!m || !m.d) return;
      (m.sets||[]).forEach(s=>{
        (s.games||[]).forEach(g=>{
          if (!g || !g.winner) return;
          // 개인전 형식 (playerA/B)
          if (g.playerA && g.playerB) {
            const pA=players.find(p=>p.name===g.playerA), pB=players.find(p=>p.name===g.playerB);
            addExt(g.playerA, m.d, g.winner==='A'?'승':'패', pB?.race||'', modeLabel);
            addExt(g.playerB, m.d, g.winner==='B'?'승':'패', pA?.race||'', modeLabel);
          }
          // 팀전 형식 (teamA/teamB 배열)
          if (Array.isArray(g.teamA) && Array.isArray(g.teamB)) {
            const winTeam = g.winner==='A' ? g.teamA : g.teamB;
            const loseTeam = g.winner==='A' ? g.teamB : g.teamA;
            winTeam.forEach(name => addExt(name, m.d, '승', '', modeLabel));
            loseTeam.forEach(name => addExt(name, m.d, '패', '', modeLabel));
          }
        });
      });
    }); } catch(e){}
  };
  _scanTeamMatches(typeof miniM!=='undefined'?miniM:[], '미니대전');
  _scanTeamMatches(typeof univM!=='undefined'?univM:[], '대학대전');
  _scanTeamMatches(typeof ckM!=='undefined'?ckM:[], '대학CK');

  // 대회 (tourneys) - 조별/브라켓/일반
  try { (typeof tourneys!=='undefined'&&Array.isArray(tourneys)?tourneys:[]).forEach(tn=>{
    // 조별리그
    (tn.groups||[]).forEach(grp=>{
      (grp.matches||[]).forEach(m=>{
        if (!m || !m.d) return;
        (m.sets||[]).forEach(s=>{
          (s.games||[]).forEach(g=>{
            if (!g || !g.playerA || !g.playerB || !g.winner) return;
            const pA=players.find(p=>p.name===g.playerA), pB=players.find(p=>p.name===g.playerB);
            addExt(g.playerA, m.d, g.winner==='A'?'승':'패', pB?.race||'', '대회');
            addExt(g.playerB, m.d, g.winner==='B'?'승':'패', pA?.race||'', '대회');
          });
        });
      });
    });
    // 브라켓
    Object.values((tn.bracket||{}).matchDetails||{}).forEach(m=>{
      if (!m || !m.d) return;
      (m.sets||[]).forEach(s=>{
        (s.games||[]).forEach(g=>{
          if (!g || !g.playerA || !g.playerB || !g.winner) return;
          const pA=players.find(p=>p.name===g.playerA), pB=players.find(p=>p.name===g.playerB);
          addExt(g.playerA, m.d, g.winner==='A'?'승':'패', pB?.race||'', '대회');
          addExt(g.playerB, m.d, g.winner==='B'?'승':'패', pA?.race||'', '대회');
        });
      });
    });
    // 일반 경기
    (tn.normalMatches||[]).forEach(m=>{
      if (!m || !m.d) return;
      (m.sets||[]).forEach(s=>{
        (s.games||[]).forEach(g=>{
          if (!g || !g.playerA || !g.playerB || !g.winner) return;
          const pA=players.find(p=>p.name===g.playerA), pB=players.find(p=>p.name===g.playerB);
          addExt(g.playerA, m.d, g.winner==='A'?'승':'패', pB?.race||'', '대회');
          addExt(g.playerB, m.d, g.winner==='B'?'승':'패', pA?.race||'', '대회');
        });
      });
    });
  }); } catch(e){}

  return players.map(p => {
    // p.history (직접 기록) + 외부 소스 경기 합산
    const phist = (Array.isArray(p.history) ? p.history : [])
      .filter(h => inRange(h.date || h.d || '') && !isPro(h.mode || h.label || h.type || h.kind || h.cat || ''));
    const extHist = (extMap[p.name] || []).filter(h => !isPro(h.mode || ''));

    // 중복 제거: p.history에 이미 있는 날짜+결과+oppRace 조합은 외부에서 제외
    const histKeys = new Set(phist.map(h => `${h.date||h.d||''}|${h.result||''}`));
    const extFiltered = extHist.filter(h => !histKeys.has(`${h.date||''}|${h.result||''}`));

    const hist = [...phist, ...extFiltered];
    const wins   = hist.filter(h => h.result === '승').length;
    const losses = hist.filter(h => h.result === '패').length;
    const total  = wins + losses;
    const offH   = hist.filter(h => isOff(h.mode));
    const spH    = hist.filter(h => !isOff(h.mode));
    // 종족별 상대 전적
    const vsRace = { P:{w:0,l:0}, T:{w:0,l:0}, Z:{w:0,l:0} };
    hist.forEach(h => {
      const r = String(h.oppRace||'').trim().toUpperCase();
      if (vsRace[r]) { h.result==='승' ? vsRace[r].w++ : vsRace[r].l++; }
    });
    return {
      p, wins, losses, total, winRate: total ? Math.round(wins/total*100) : null,
      offWins: offH.filter(h=>h.result==='승').length, offLosses: offH.filter(h=>h.result==='패').length,
      spWins:  spH.filter(h=>h.result==='승').length,  spLosses:  spH.filter(h=>h.result==='패').length,
      vsRace, hist
    };
  });
}

// ─── 유니브 집계 ──────────────────────────────
function _b2WeeklyUnivStats(players, dateFrom, dateTo, univList) {
  const vis = players.filter(p => !p.hidden && !p.retired && !p.hideFromBoard);
  const stats = _b2WeeklyAggregate(vis, dateFrom, dateTo);
  return univList.map(u => {
    const members = stats.filter(s => String(s.p?.univ||'').trim() === u.name);
    const active  = members.filter(s => s.total > 0);
    const tw = active.reduce((a,s)=>a+s.wins,0);
    const tl = active.reduce((a,s)=>a+s.losses,0);
    const tg = tw + tl;
    const raceCount = { P:{w:0,l:0}, T:{w:0,l:0}, Z:{w:0,l:0} };
    active.forEach(s => { ['P','T','Z'].forEach(r => { raceCount[r].w+=s.vsRace[r].w; raceCount[r].l+=s.vsRace[r].l; }); });
    return { u, members, active, tw, tl, tg, wr: tg ? Math.round(tw/tg*100) : null, raceCount };
  }).sort((a,b) => b.tg - a.tg);
}

// ─── MVP 선정 ─────────────────────────────────
function _b2WeeklyMVP(univStats) {
  let best = null, bestScore = -1;
  univStats.forEach(ud => {
    ud.active.forEach(s => {
      if (s.total < 3) return; // 최소 3경기
      if (String(s.p?.gender||'').trim() !== 'F') return;
      const score = s.wins * 3 + (s.total > 0 ? (s.wins/s.total)*10 : 0) + (s.offWins * 2);
      if (score > bestScore) { bestScore = score; best = s; }
    });
  });
  return best;
}

// ─── 대학별 MVP ───────────────────────────────
function _b2WeeklyUnivMVP(active) {
  let best = null, bestScore = -1;
  active.forEach(s => {
    if (s.total === 0) return;
    const score = s.wins * 3 + (s.total > 0 ? (s.wins/s.total)*10 : 0) + s.offWins * 2;
    if (score > bestScore) { bestScore = score; best = s; }
  });
  return best;
}

// ─── 최근 폼 렌더 ─────────────────────────────
function _b2WeeklyForm(hist) {
  const sorted = [...hist].sort((a,b)=>{
    const da=parseInt(String(a.date||'').replace(/[-\.\/]/g,''))||0;
    const db=parseInt(String(b.date||'').replace(/[-\.\/]/g,''))||0;
    return da!==db?da-db:(a.time||0)-(b.time||0);
  });
  return sorted.slice(-5).map(h => {
    const c = h.result==='승'?'#10b981':h.result==='패'?'#ef4444':'#94a3b8';
    const t = h.result==='승'?'W':h.result==='패'?'L':'-';
    return `<span style="display:inline-flex;align-items:center;justify-content:center;width:16px;height:16px;border-radius:50%;background:${c};font-size:9px;color:#fff;font-weight:900;flex-shrink:0">${t}</span>`;
  }).join('');
}

// ─── 막대 차트 SVG ────────────────────────────
function _b2WeeklyBarChart(univStats) {
  const visible = univStats.filter(ud => ud.tg > 0).slice(0, 10);
  if (!visible.length) return '';
  const maxGames = Math.max(...visible.map(ud => ud.tg), 1);
  const BAR_H = 28, GAP = 6, LEFT = 90, RIGHT = 160, TOP = 14, BOT = 10;
  const H = visible.length * (BAR_H + GAP) + TOP + BOT;
  const W = '100%';
  let rows = '';
  visible.forEach((ud, i) => {
    const y = TOP + i * (BAR_H + GAP);
    const color = (gc ? gc(ud.u.name) : '#64748b') || '#64748b';
    const wBarW = `${Math.round(ud.tw / maxGames * 100)}%`;
    const lBarW = `${Math.round(ud.tl / maxGames * 100)}%`;
    const wr = ud.wr !== null ? `${ud.wr}%` : '-';
    const wrColor = ud.wr===null?'#94a3b8':ud.wr>=60?'#10b981':ud.wr>=40?'#f59e0b':'#ef4444';
    rows += `
      <text x="${LEFT - 6}" y="${y + BAR_H/2 + 4}" text-anchor="end" font-size="11" font-weight="700" fill="var(--text2)" style="font-family:inherit">${ud.u.name.length > 6 ? ud.u.name.slice(0,6)+'…' : ud.u.name}</text>
      <rect x="${LEFT}" y="${y}" width="0" height="${BAR_H * 0.55}" rx="3" fill="${color}" opacity="0.85">
        <animate attributeName="width" from="0" to="${wBarW}" dur="0.5s" fill="freeze" calcMode="spline" keySplines="0.4 0 0.2 1"/>
      </rect>
      <rect x="${LEFT}" y="${y + BAR_H * 0.58}" width="0" height="${BAR_H * 0.38}" rx="3" fill="${color}" opacity="0.35">
        <animate attributeName="width" from="0" to="${lBarW}" dur="0.5s" fill="freeze" calcMode="spline" keySplines="0.4 0 0.2 1"/>
      </rect>
      <text x="${LEFT + 4}" y="${y + BAR_H * 0.55 - 5}" font-size="10" fill="${color}" font-weight="800">${ud.tw}승</text>
      <text x="${LEFT + 4}" y="${y + BAR_H - 4}" font-size="10" fill="${color}" opacity="0.7">${ud.tl}패</text>
      <text x="calc(${LEFT}px + ${wBarW})" y="${y + BAR_H/2 + 4}" font-size="12" font-weight="900" fill="${wrColor}" style="font-family:inherit">${wr}</text>`;
  });

  // foreignObject로 반응형 처리
  return `<div style="width:100%;overflow:hidden;padding:4px 0">
    <svg viewBox="0 0 520 ${H}" width="100%" style="overflow:visible;display:block">
      <defs>
        <style>.b2wchart-label{font-family:inherit}</style>
      </defs>
      ${visible.map((ud, i) => {
        const y = TOP + i * (BAR_H + GAP);
        const color = (gc ? gc(ud.u.name) : '#64748b') || '#64748b';
        const wPct  = Math.round(ud.tw / maxGames * (520 - LEFT - RIGHT));
        const lPct  = Math.round(ud.tl / maxGames * (520 - LEFT - RIGHT));
        const wr = ud.wr !== null ? `${ud.wr}%` : '-';
        const wrColor = ud.wr===null?'#94a3b8':ud.wr>=60?'#10b981':ud.wr>=40?'#f59e0b':'#ef4444';
        const name = ud.u.name.length > 6 ? ud.u.name.slice(0,6)+'…' : ud.u.name;
        const MAX_W = 520 - LEFT - RIGHT;
        return `
          <text x="${LEFT-6}" y="${y+BAR_H*0.62}" text-anchor="end" font-size="11" font-weight="700" fill="var(--text2)">${name}</text>
          <rect x="${LEFT}" y="${y}" width="${wPct}" height="${BAR_H*0.52}" rx="3" fill="${color}" opacity="0.9"/>
          <rect x="${LEFT}" y="${y+BAR_H*0.56}" width="${lPct}" height="${BAR_H*0.38}" rx="3" fill="${color}" opacity="0.3"/>
          ${ud.tw>0?`<text x="${LEFT+wPct+4}" y="${y+BAR_H*0.44}" font-size="10" font-weight="900" fill="${color}">${ud.tw}승</text>`:''}
          ${ud.tl>0?`<text x="${LEFT+lPct+4}" y="${y+BAR_H*0.88}" font-size="10" fill="${color}" opacity="0.7">${ud.tl}패</text>`:''}
          <text x="${520-RIGHT+8}" y="${y+BAR_H*0.62}" font-size="13" font-weight="900" fill="${wrColor}">${wr}</text>
          <text x="${520-RIGHT+50}" y="${y+BAR_H*0.62}" font-size="11" fill="var(--text3)">${ud.tg}전 ${ud.active.length}명</text>`;
      }).join('')}
    </svg>
  </div>`;
}

// ─── 종족별 통계 렌더 ─────────────────────────
function _b2WeeklyRaceStats(raceCount) {
  const races = [
    { key:'P', label:'프로토스', ico:'🔮', color:'#8b5cf6' },
    { key:'T', label:'테란',     ico:'⚔️', color:'#3b82f6' },
    { key:'Z', label:'저그',     ico:'🦎', color:'#f59e0b' }
  ];
  return races.map(({ key, label, ico, color }) => {
    const { w, l } = raceCount[key];
    const t = w + l;
    const wr = t ? Math.round(w/t*100) : null;
    const barW = wr !== null ? wr : 0;
    return `<div style="display:flex;align-items:center;gap:8px;padding:5px 0">
      <span style="font-size:13px;width:20px;text-align:center">${ico}</span>
      <span style="font-size:11px;font-weight:700;color:var(--text2);width:52px">${label}</span>
      <div style="flex:1;height:8px;background:var(--border2);border-radius:4px;overflow:hidden">
        <div style="height:100%;width:${barW}%;background:${color};border-radius:4px;transition:width .4s"></div>
      </div>
      ${t > 0
        ? `<span style="font-size:11px;font-weight:900;color:${wr>=60?'#10b981':wr>=40?'#f59e0b':'#ef4444'};width:34px;text-align:right">${wr}%</span>
           <span style="font-size:10px;color:var(--text3);width:48px">${w}승${l}패</span>`
        : `<span style="font-size:11px;color:var(--text3);width:86px">기록 없음</span>`}
    </div>`;
  }).join('');
}

// ─── 이전주 비교 배지 ─────────────────────────
function _b2WeeklyDelta(curr, prev) {
  if (prev === null || curr === null) return '';
  const d = curr - prev;
  if (d === 0) return `<span style="font-size:10px;color:var(--text3);margin-left:4px">━ ${prev}%</span>`;
  const arrow = d > 0 ? '▲' : '▼';
  const col   = d > 0 ? '#10b981' : '#ef4444';
  return `<span style="font-size:10px;font-weight:800;color:${col};margin-left:4px">${arrow}${Math.abs(d)}%</span><span style="font-size:10px;color:var(--text3);margin-left:2px">vs 전주</span>`;
}

// ═══════════════════════════════════════════════
//  메인 렌더 함수
// ═══════════════════════════════════════════════
function _b2WeeklyBriefingView() {
  try {
    if (!window._b2WeeklyDateFrom || !window._b2WeeklyDateTo) {
      const def = _b2WeeklyGetDefaultRange(0);
      window._b2WeeklyDateFrom = def.from;
      window._b2WeeklyDateTo   = def.to;
    }
    const dateFrom = window._b2WeeklyDateFrom;
    const dateTo   = window._b2WeeklyDateTo;

    // 이전주 범위 계산
    const fmtN = s => parseInt(String(s||'').replace(/[-\.\/]/g,''))||0;
    const diffDays = Math.round((new Date(dateTo) - new Date(dateFrom)) / 86400000) + 1;
    const prevTo   = new Date(dateFrom); prevTo.setDate(prevTo.getDate() - 1);
    const prevFrom = new Date(prevTo);   prevFrom.setDate(prevFrom.getDate() - (diffDays - 1));
    const fmt = d => d.toISOString().slice(0, 10);
    const prevDateFrom = fmt(prevFrom), prevDateTo = fmt(prevTo);

    const _dissSet = new Set((typeof univCfg !== 'undefined' ? univCfg : [])
      .filter(u => u.dissolved || u.hidden).map(u => String(u.name||'').trim()));
    const vis = players.filter(p => !p.hidden && !p.retired && !p.hideFromBoard && !_dissSet.has(String(p?.univ||'').trim()));
    const univList = (_b2VisUnivs ? _b2VisUnivs() : []).filter(u => u.name && u.name !== '무소속');

    const selUniv  = window._b2WeeklyUniv || '전체';
    const fmtDate  = s => String(s||'').slice(0,10).replace(/-/g,'.');

    // 이번주 & 이전주 집계
    const curStats  = _b2WeeklyUnivStats(vis, dateFrom, dateTo, univList);
    const prevStats = _b2WeeklyUnivStats(vis, prevDateFrom, prevDateTo, univList);
    const prevMap   = {};
    prevStats.forEach(ud => { prevMap[ud.u.name] = ud; });

    // 필터
    const targetStats = selUniv === '전체' ? curStats : curStats.filter(ud => ud.u.name === selUniv);

    // 전체 MVP
    const mvp = _b2WeeklyMVP(curStats);

    // CSS
    let h = `<style>
      .b2w2-wrap { max-width:900px }
      .b2w2-hdr  { display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding:14px 16px;background:var(--surface);border:1px solid var(--border2);border-radius:14px;margin-bottom:14px }
      .b2w2-din  { padding:4px 10px;border-radius:8px;border:1px solid var(--border2);font-size:12px;background:var(--white);color:var(--text2) }
      .b2w2-sel  { padding:4px 10px;border-radius:8px;border:1px solid var(--border2);font-size:12px;background:var(--white);color:var(--text2);max-width:140px }
      .b2w2-btn  { padding:5px 14px;border-radius:8px;background:var(--blue);color:#fff;border:none;font-size:12px;font-weight:700;cursor:pointer }
      .b2w2-btn:hover { opacity:.85 }
      .b2w2-mvp  { display:flex;align-items:center;gap:10px;flex-wrap:wrap;padding:12px 16px;background:linear-gradient(135deg,#fef9c355,#fef08a22);border:1px solid #fbbf24;border-radius:14px;margin-bottom:14px }
      .b2w2-chart-box { background:var(--surface);border:1px solid var(--border2);border-radius:14px;padding:14px 16px;margin-bottom:14px }
      .b2w2-chart-title { font-size:12px;font-weight:800;color:var(--text3);margin-bottom:10px }
      .b2w2-card { background:var(--surface);border:1px solid var(--border2);border-radius:14px;margin-bottom:12px;overflow:hidden }
      .b2w2-card-head { display:flex;align-items:center;gap:8px;padding:12px 16px;cursor:pointer;transition:background .15s }
      .b2w2-card-head:hover { background:rgba(0,0,0,.04) }
      .b2w2-chip { font-size:11px;font-weight:700;padding:2px 7px;border-radius:7px }
      .b2w2-tbl  { width:100%;border-collapse:collapse }
      .b2w2-tbl th { font-size:10px;font-weight:800;color:var(--text3);padding:6px 10px;text-align:left;border-bottom:1px solid var(--border2);background:var(--bg);white-space:nowrap }
      .b2w2-tbl td { font-size:11px;font-weight:600;padding:7px 10px;border-bottom:1px solid var(--border2);vertical-align:middle }
      .b2w2-tbl tr:last-child td { border-bottom:none }
      .b2w2-tbl tr:hover td { background:var(--hover) }
      .b2w2-race-box { padding:10px 16px 12px;border-top:1px solid var(--border2) }
      .b2w2-race-title { font-size:11px;font-weight:800;color:var(--text3);margin-bottom:6px }
      .b2w2-empty { text-align:center;padding:32px 16px;color:var(--text3);font-size:13px }
      @media(max-width:600px){
        .b2w2-tbl th:nth-child(5),.b2w2-tbl td:nth-child(5),
        .b2w2-tbl th:nth-child(4),.b2w2-tbl td:nth-child(4){ display:none }
      }
    </style>`;

    // ── 헤더 컨트롤
    h += `<div class="b2w2-wrap"><div class="b2w2-hdr">
      <span style="font-size:16px">📅</span>
      <span style="font-size:14px;font-weight:900;color:var(--text1)">주간 브리핑</span>
      <input type="date" class="b2w2-din" id="b2w2-from" tabindex="-1" value="${dateFrom}">
      <span style="font-size:12px;color:var(--text3);font-weight:700">~</span>
      <input type="date" class="b2w2-din" id="b2w2-to" tabindex="-1" value="${dateTo}">
      <select class="b2w2-sel" id="b2w2-univ">
        <option value="전체"${selUniv==='전체'?' selected':''}>🏫 전체 대학</option>
        ${univList.map(u=>`<option value="${u.name}"${selUniv===u.name?' selected':''}>${u.name}</option>`).join('')}
      </select>
      <button class="b2w2-btn" onclick="(function(){
        const f=document.getElementById('b2w2-from');
        const t=document.getElementById('b2w2-to');
        const s=document.getElementById('b2w2-univ');
        if(f)window._b2WeeklyDateFrom=f.value;
        if(t)window._b2WeeklyDateTo=t.value;
        if(s)window._b2WeeklyUniv=s.value;
        render();
      })()">조회</button>
      <span style="font-size:11px;color:var(--text3);margin-left:auto">${fmtDate(dateFrom)} ~ ${fmtDate(dateTo)}</span>
      <span style="font-size:10px;color:var(--text3)">(전주: ${fmtDate(prevDateFrom)}~${fmtDate(prevDateTo)})</span>
    </div>`;

    const hasData = targetStats.some(ud => ud.tg > 0);
    if (!hasData) {
      h += `<div class="b2w2-empty"><div style="font-size:28px;margin-bottom:8px">📭</div>해당 기간에 기록된 경기가 없습니다.<div style="font-size:11px;margin-top:4px">기간을 변경해보세요</div></div></div>`;
      return h;
    }

    // ── MVP 배너
    if (mvp && selUniv === '전체') {
      const mp = mvp.p;
      const col  = gc ? gc(String(mp?.univ||'')) : '#f59e0b';
      const tc   = typeof getTierBtnColor==='function'&&mp.tier?getTierBtnColor(mp.tier):'#64748b';
      const tt   = typeof getTierBtnTextColor==='function'&&mp.tier?(getTierBtnTextColor(mp.tier)||'#fff'):'#fff';
      const rIco = mp.race==='P'?'🔮':mp.race==='T'?'⚔️':mp.race==='Z'?'🦎':'';
      h += `<div class="b2w2-mvp">
        <span style="font-size:20px">🏆</span>
        <div>
          <div style="font-size:10px;font-weight:800;color:#b45309;letter-spacing:.5px">이번 주 MVP</div>
          <div style="font-size:16px;font-weight:900;color:var(--text1)">${mp.name} ${rIco}
            ${mp.tier?`<span style="font-size:10px;padding:1px 6px;border-radius:5px;background:${tc};color:${tt}">${mp.tier}</span>`:''}
          </div>
          <div style="font-size:11px;color:var(--text3);margin-top:1px">${String(mp?.univ||'')}</div>
        </div>
        <div style="display:flex;gap:10px;flex-wrap:wrap;margin-left:8px">
          <div style="text-align:center">
            <div style="font-size:18px;font-weight:900;color:#10b981">${mvp.wins}</div>
            <div style="font-size:10px;color:var(--text3)">승</div>
          </div>
          <div style="text-align:center">
            <div style="font-size:18px;font-weight:900;color:#ef4444">${mvp.losses}</div>
            <div style="font-size:10px;color:var(--text3)">패</div>
          </div>
          <div style="text-align:center">
            <div style="font-size:18px;font-weight:900;color:${col}">${mvp.winRate}%</div>
            <div style="font-size:10px;color:var(--text3)">승률</div>
          </div>
        </div>
        <div style="margin-left:auto;display:flex;align-items:center;gap:3px">${_b2WeeklyForm(mvp.hist)}</div>
      </div>`;
    }

    // ── 전체 대학 차트 (전체 탭일 때만)
    if (selUniv === '전체' && curStats.some(ud=>ud.tg>0)) {
      h += `<div class="b2w2-chart-box">
        <div class="b2w2-chart-title">📊 대학별 전적 현황 (이번 기간)</div>
        ${_b2WeeklyBarChart(curStats)}
        <div style="display:flex;align-items:center;gap:12px;margin-top:8px;flex-wrap:wrap">
          <div style="display:flex;align-items:center;gap:4px"><div style="width:12px;height:8px;border-radius:2px;background:#10b981;opacity:.9"></div><span style="font-size:10px;color:var(--text3)">승</span></div>
          <div style="display:flex;align-items:center;gap:4px"><div style="width:12px;height:8px;border-radius:2px;background:#64748b;opacity:.3"></div><span style="font-size:10px;color:var(--text3)">패</span></div>
          <span style="font-size:10px;color:var(--text3)">우측: 승률 / 경기수</span>
        </div>
      </div>`;
    }

    // ── 대학별 카드
    targetStats.filter(ud=>ud.tg>0).forEach((ud, ui) => {
      const { u, active, tw, tl, tg, wr, raceCount } = ud;
      const color   = (gc ? gc(u.name) : '#64748b') || '#64748b';
      const prevUd  = prevMap[u.name];
      const prevWr  = prevUd && prevUd.tg > 0 ? prevUd.wr : null;
      const wrClass = wr===null?'':wr>=60?'#10b981':wr>=40?'#f59e0b':'#ef4444';
      const cid     = `b2w2-body-${ui}`;
      const icid    = `b2w2-ic-${ui}`;

      // 대학 MVP
      const univMVP = _b2WeeklyUnivMVP(active);

      // 정렬: 승률→경기수
      const sorted = [...active].sort((a,b) => {
        const ra = a.total?a.wins/a.total:0, rb = b.total?b.wins/b.total:0;
        return ra!==rb?rb-ra:b.total-a.total;
      });

      h += `<div class="b2w2-card" style="border-top:3px solid ${color}">
        <div class="b2w2-card-head" onclick="(function(){
          const b=document.getElementById('${cid}');
          const ic=document.getElementById('${icid}');
          if(!b)return;
          const show=b.style.display==='none';
          b.style.display=show?'':'none';
          if(ic)ic.textContent=show?'▼':'▶';
        })()">
          <span style="width:10px;height:10px;border-radius:50%;background:${color};flex-shrink:0"></span>
          <span style="font-size:14px;font-weight:900;color:var(--text1)">${u.name}</span>
          <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">
            <span class="b2w2-chip" style="background:${color}18;color:${color}">활동 ${active.length}명</span>
            <span class="b2w2-chip" style="background:#3b82f618;color:#3b82f6">${tg}전</span>
            <span class="b2w2-chip" style="background:#10b98118;color:#10b981">${tw}승</span>
            <span class="b2w2-chip" style="background:#ef444418;color:#ef4444">${tl}패</span>
            ${wr!==null?`<span class="b2w2-chip" style="background:${wrClass}18;color:${wrClass};font-size:12px">${wr}%${_b2WeeklyDelta(wr,prevWr)}</span>`:''}
            ${univMVP?`<span class="b2w2-chip" style="background:#fef9c3;color:#b45309">🏆 MVP: ${univMVP.p.name} (${univMVP.wins}승)</span>`:''}
          </div>
          <span id="${icid}" style="margin-left:auto;font-size:12px;color:var(--text3)">▼</span>
        </div>
        <div id="${cid}">`;

      // 선수 테이블
      h += `<table class="b2w2-tbl"><thead><tr>
        <th style="width:28px">#</th>
        <th>선수</th>
        <th>전체 전적</th>
        <th>공식전</th>
        <th>최근 폼</th>
      </tr></thead><tbody>`;

      sorted.forEach((s, i) => {
        const { p, wins, losses, total, winRate, offWins, offLosses } = s;
        const wrCls  = winRate===null?'#94a3b8':winRate>=60?'#10b981':winRate>=40?'#f59e0b':'#ef4444';
        const tc2    = typeof getTierBtnColor==='function'&&p.tier?getTierBtnColor(p.tier):'#64748b';
        const tt2    = typeof getTierBtnTextColor==='function'&&p.tier?(getTierBtnTextColor(p.tier)||'#fff'):'#fff';
        const rIco   = p.race==='P'?'🔮':p.race==='T'?'⚔️':p.race==='Z'?'🦎':'';
        const medal  = i===0?'🥇':i===1?'🥈':i===2?'🥉':`${i+1}`;
        const isMVP  = univMVP && univMVP.p === p;

        // 이전주 비교
        const prevUd2  = prevMap[u.name];
        const prevS    = prevUd2 ? _b2WeeklyAggregate([p], prevDateFrom, prevDateTo).find(x=>x.p===p) : null;
        const prevWr2  = prevS && prevS.total>0 ? prevS.winRate : null;

        h += `<tr ${isMVP?'style="background:#fef9c322"':''}>
          <td style="font-size:11px;font-weight:900;color:var(--text3);text-align:center">${medal}</td>
          <td>
            <span style="font-weight:900;color:var(--text1)">${p.name}</span>
            ${rIco?`<span style="font-size:11px;margin-left:2px">${rIco}</span>`:''}
            ${p.tier?`<span style="font-size:10px;padding:1px 5px;border-radius:4px;background:${tc2};color:${tt2};margin-left:3px">${p.tier}</span>`:''}
            ${isMVP?`<span style="font-size:9px;background:#fef9c3;color:#b45309;padding:1px 4px;border-radius:4px;margin-left:3px;font-weight:800">MVP</span>`:''}
          </td>
          <td>
            <span style="font-weight:900;color:var(--text1)">${total}전</span>
            <span style="color:#10b981;font-size:11px"> ${wins}승</span>
            <span style="color:#ef4444;font-size:11px"> ${losses}패</span>
            ${winRate!==null?`<span style="font-size:11px;font-weight:800;color:${wrCls};margin-left:3px">${winRate}%</span>${_b2WeeklyDelta(winRate,prevWr2)}`:''}
          </td>
          <td>
            ${offWins+offLosses>0
              ?`<span style="font-size:11px">${offWins+offLosses}전 <span style="color:#10b981">${offWins}승</span> <span style="color:#ef4444">${offLosses}패</span></span>`
              :`<span style="font-size:11px;color:var(--text3)">-</span>`}
          </td>
          <td><div style="display:flex;align-items:center;gap:2px">${_b2WeeklyForm(s.hist)}</div></td>
        </tr>`;
      });

      h += `</tbody></table>`;

      // 종족별 통계
      const hasRace = ['P','T','Z'].some(r => raceCount[r].w+raceCount[r].l > 0);
      if (hasRace) {
        h += `<div class="b2w2-race-box">
          <div class="b2w2-race-title">⚔️ 종족별 상대 전적 (대학 전체)</div>
          ${_b2WeeklyRaceStats(raceCount)}
        </div>`;
      }

      h += `</div></div>`;
    });

    h += `</div>`;
    return h;

  } catch(e) {
    console.error('[_b2WeeklyBriefingView v2] 오류:', e);
    return `<div style="padding:40px;text-align:center;color:#dc2626">주간 브리핑 오류: ${e.message}</div>`;
  }
}
