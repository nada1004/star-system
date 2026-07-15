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

if (typeof _b2NameTag !== 'function') {
  var _b2NameTag = function(p, accentCol, showTier) {
    try{
      if (window.Board2CardUtils && typeof window.Board2CardUtils.nameTag === 'function') {
        return window.Board2CardUtils.nameTag(p, accentCol, showTier);
      }
      if (typeof window._b2NameTag === 'function') {
        return window._b2NameTag(p, accentCol, showTier);
      }
    }catch(e){}
    const name = (p && p.name) || '';
    const safeName = String(name).replace(/'/g, "\\'");
    const tier = (p && p.tier) || '';
    const race = (p && p.race) || '';
    const inactive = !!(p && p.inactive);
    const tierBg = typeof getTierBtnColor === 'function' ? getTierBtnColor(tier) : '#64748b';
    const tierFg = typeof getTierBtnTextColor === 'function' ? (getTierBtnTextColor(tier) || '#fff') : '#fff';
    return `
      <div style="display:flex;align-items:center;gap:6px;padding:6px 10px;border-radius:20px;cursor:pointer;transition:background .12s"
        onmouseover="this.style.background='${accentCol}14'"
        onmouseout="this.style.background='transparent'"
        onclick="openPlayerModal('${safeName}')">
        <span style="font-weight:700;font-size:18px;color:var(--text1);white-space:nowrap;${inactive?'opacity:.6':''}">${name}</span>
        ${race&&race!=='N'?`<span class="rbadge r${race}" style="font-size:10px;flex-shrink:0">${race}</span>`:''}
        ${showTier&&tier?`<span style="font-size:10px;font-weight:700;padding:1px 5px;border-radius:4px;background:${tierBg};color:${tierFg};flex-shrink:0">${tier}</span>`:''}
      </div>`;
  };
}

var _b2View = 'univ';
var _b2SaveUniv = '전체';
var _b2LineupUniv = '';
var _b2LineupCardMode = (()=>{try{const m=localStorage.getItem('su_b2_lineup_card_mode')||'default';return m==='list'?'default':m;}catch(e){return 'default';}})(); // 라인업 카드 스타일: 'default'(기본) | 'stat'(사진+통계그리드형) | 'table'(테이블형)
function _b2SetLineupCardMode(mode){
  _b2LineupCardMode = ['default','stat','table'].includes(String(mode||'')) ? String(mode) : 'default';
  try{ localStorage.setItem('su_b2_lineup_card_mode', _b2LineupCardMode); }catch(e){}
  const el = document.getElementById('b2-content');
  if (el) { el.innerHTML = _b2LineupView(); if (typeof injectUnivIcons === 'function') injectUnivIcons(el); }
  if (typeof render === 'function') render();
}
var _b2Collapsed = new Set();
// 프로필 탭 필터 변수
var _b2PlayersUnivFilter = '전체';
var _b2PlayersFilter = 'all'; // 'all' | 'P' | 'T' | 'Z'
var _b2PlayersTierFilter = '전체'; // '전체' | '0' | '1' | '2' | '3' | '4' | '유스'
var _b2SelectedPlayer = null;
var _b2PlayersSort = 'default'; // 'default' | 'name' | 'tier'
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

function _b2ApplyUnivWatermarkSizing(root){}

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

let _b2BgLazyIO = null;
function _b2LazyLoadBgLayers(root){
  try{
    const scope = root || document;
    const els = [];
    if(scope && scope.matches && scope.matches('.b2-bg-layer[data-bg-src]')) els.push(scope);
    if(scope && scope.querySelectorAll) els.push(...scope.querySelectorAll('.b2-bg-layer[data-bg-src]'));
    if(!els.length) return;

    const loadOne = (el)=>{
      try{
        if(!el || el.getAttribute('data-bg-loaded') === '1') return;
        let src = el.getAttribute('data-bg-src') || '';
        if(typeof toHttpsUrl === 'function'){
          const u = toHttpsUrl(src);
          if(u) src = u;
        }
        const pos = el.getAttribute('data-bg-pos') || 'center center';
        if(src){
          el.style.backgroundImage = `url("${String(src).replace(/"/g,'\\"')}")`;
          el.style.backgroundPosition = pos;
          el.style.backgroundRepeat = 'no-repeat';
          el.setAttribute('data-bg-loaded','1');
          try{ _b2ApplyBgAutoSizing(el); }catch(e){}
        }
      }catch(e){}
    };

    if(!(window && 'IntersectionObserver' in window)){
      els.forEach(loadOne);
      return;
    }
    if(!_b2BgLazyIO){
      _b2BgLazyIO = new IntersectionObserver((entries)=>{
        entries.forEach(ent=>{
          if(ent && (ent.isIntersecting || (ent.intersectionRatio||0) > 0)){
            loadOne(ent.target);
            try{ _b2BgLazyIO.unobserve(ent.target); }catch(e){}
          }
        });
      }, { root: null, rootMargin: '600px 0px', threshold: 0.01 });
    }
    els.forEach(el=>{
      if(!el || el.getAttribute('data-bg-loaded') === '1') return;
      try{ _b2BgLazyIO.observe(el); }catch(e){ loadOne(el); }
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

// ── 이번주 날짜 범위 헬퍼 (월~오늘, YYYYMMDD 숫자) ──────────────────────
function _b2ThisWeekRange() {
  const now = new Date();
  const day = now.getDay();
  const mon = new Date(now);
  mon.setHours(0, 0, 0, 0);
  mon.setDate(now.getDate() + (day === 0 ? -6 : 1 - day));
  const toD = new Date(now);
  toD.setHours(23, 59, 59, 999);
  const _fmt = d => parseInt(d.toISOString().slice(0, 10).replace(/-/g, ''));
  return { fromN: _fmt(mon), toN: _fmt(toD) };
}
// 날짜 문자열 → YYYYMMDD 숫자 변환 헬퍼
// `2026-06-17`, `2026.06.17`, `2026/06/17 22:10`, ISO 문자열 모두 안전하게 처리
function _b2DateNum(s) {
  const digits = String(s || '').replace(/\D/g, '');
  if (digits.length < 8) return 0;
  return parseInt(digits.slice(0, 8), 10) || 0;
}

// 대학별 현황판 색상 진하기 (0~100, %)
var b2LabelAlpha  = typeof b2LabelAlpha  !== 'undefined' ? b2LabelAlpha  : (J('su_b2la')  ?? 16);
var b2BgAlpha     = typeof b2BgAlpha     !== 'undefined' ? b2BgAlpha     : (J('su_b2ba')  ?? 9);
var b2BgImgAlpha      = typeof b2BgImgAlpha      !== 'undefined' ? b2BgImgAlpha      : (J('su_b2bia')  ?? 12);
var b2FreeBgAlpha     = typeof b2FreeBgAlpha     !== 'undefined' ? b2FreeBgAlpha     : (J('su_b2fba')  ?? 25);
var b2FreeTierBgAlpha = typeof b2FreeTierBgAlpha !== 'undefined' ? b2FreeTierBgAlpha : (J('su_b2ftba') ?? 15);
var b2ProfileBgAlpha  = typeof b2ProfileBgAlpha  !== 'undefined' ? b2ProfileBgAlpha  : (J('su_b2pba') ?? 10);
if(typeof _b2AlphaHex !== 'function'){
  var _b2AlphaHex = function(pct){ return Math.round((pct||0)/100*255).toString(16).padStart(2,'0'); };
}

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

  // 해체/숨김 대학 Set — 각 뷰에서 중복 생성하지 않도록 여기서 한번만 계산
  if (!window._b2DissSet || typeof window._b2DissSetSig === 'undefined' ||
      window._b2DissSetSig !== (typeof univCfg !== 'undefined' ? univCfg.length : 0)) {
    window._b2DissSet = new Set(
      (typeof univCfg !== 'undefined' ? univCfg : [])
        .filter(u => u.dissolved || u.hidden)
        .map(u => String(u.name || '').trim())
    );
    window._b2DissSetSig = (typeof univCfg !== 'undefined' ? univCfg.length : 0);
  }

  const univList = _b2VisUnivs().filter(u => u.name !== '무소속');

  // 탭 버튼 스타일 헬퍼
  function _b2TabBtn(view, color, label) {
    const on = _b2View === view;
    // (요청사항) 티어 순위표 스타일(pill)로 통일
    return `<button class="pill b2-tab-pill ${on?'on':''}" style="flex-shrink:0;white-space:nowrap" onclick="_b2View='${view}';render();this.blur()">${label}</button>`;
  }

  // 잘못된 뷰 리셋 (삭제된 탭 or 로그인 필요 탭)
  if (_b2View === 'old' && !isLoggedIn) _b2View = 'univ';

  // 저장/초기화 바
  let saveBar = '';
  if (_b2View === 'univ') {
    saveBar = `<div style="display:flex;align-items:center;gap:6px;flex-shrink:0">
      <div style="position:relative">
        <select id="b2-save-sel" class="b2-toolbar-select" onchange="_b2SaveUniv=this.value" style="padding:4px 28px 4px 10px;border-radius:8px;border:1px solid var(--border2);font-size:12px;background:var(--white);color:var(--text2);appearance:none;cursor:pointer">
          <option value="전체">🏫 전체</option>
          ${univList.map(u=>`<option value="${u.name}"${_b2SaveUniv===u.name?' selected':''}>${u.name}</option>`).join('')}
        </select>
        <svg style="position:absolute;right:6px;top:50%;transform:translateY(-50%);pointer-events:none;color:var(--gray-l)" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m6 9 6 6 6-6"/></svg>
      </div>
      <button class="b2-toolbar-btn" onclick="saveB2Img()" style="padding:4px 12px;border-radius:8px;border:1px solid var(--border2);background:var(--white);color:var(--text2);font-size:12px;font-weight:700;cursor:pointer;display:flex;align-items:center;gap:4px;margin-bottom:0">📷 이미지저장</button>
    </div>`;
  } else if (_b2View === 'free') {
    saveBar = `<div style="flex-shrink:0">
      <button class="b2-toolbar-btn" onclick="saveB2FreeImg()" style="padding:4px 12px;border-radius:8px;border:1px solid var(--border2);background:var(--white);color:var(--text2);font-size:12px;font-weight:700;cursor:pointer;display:flex;align-items:center;gap:4px">📷 이미지저장</button>
    </div>`;
  } else if (_b2View === 'femco') {
    saveBar = `<div style="display:flex;gap:6px;flex-shrink:0">
      <button class="b2-toolbar-btn" onclick="saveB2FemcoAllImg()" style="padding:4px 12px;border-radius:8px;border:1px solid var(--border2);background:var(--white);color:var(--text2);font-size:12px;font-weight:700;cursor:pointer;display:flex;align-items:center;gap:4px">💾 전체 저장</button>
    </div>`;
  } else if (_b2View === 'lineup') {
    if (!_b2LineupUniv || !univList.some(u=>u.name===_b2LineupUniv)) _b2LineupUniv = univList[0] ? univList[0].name : '';
    const _lcModeBtn = (mode, label) => `<button type="button" class="b2-toolbar-btn" onclick="_b2SetLineupCardMode('${mode}')" style="padding:4px 10px;border-radius:8px;border:1px solid ${_b2LineupCardMode===mode?'#2563eb':'var(--border2)'};background:${_b2LineupCardMode===mode?'linear-gradient(135deg,#eff6ff,#dbeafe)':'var(--white)'};color:${_b2LineupCardMode===mode?'#1d4ed8':'var(--text2)'};font-size:12px;font-weight:${_b2LineupCardMode===mode?900:700};cursor:pointer;margin-bottom:0">${label}</button>`;
    saveBar = `<div style="display:flex;align-items:center;gap:6px;flex-shrink:0;flex-wrap:wrap">
      <div style="position:relative">
        <select id="b2-lineup-sel" class="b2-toolbar-select" onchange="_b2LineupUniv=this.value;document.getElementById('b2-content').innerHTML=_b2LineupView();injectUnivIcons(document.getElementById('b2-content'));render();" style="padding:4px 28px 4px 10px;border-radius:8px;border:1px solid var(--border2);font-size:12px;background:var(--white);color:var(--text2);appearance:none;cursor:pointer">
          ${univList.map(u=>`<option value="${u.name}"${_b2LineupUniv===u.name?' selected':''}>${u.name}</option>`).join('')}
        </select>
        <svg style="position:absolute;right:6px;top:50%;transform:translateY(-50%);pointer-events:none;color:var(--gray-l)" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m6 9 6 6 6-6"/></svg>
      </div>
      <div style="display:flex;align-items:center;gap:6px">
        <span style="font-size:11px;font-weight:800;color:var(--text3);flex-shrink:0">모드</span>
        <div style="display:flex;gap:4px">
          ${_lcModeBtn('default','🖼️ 기본')}
          ${_lcModeBtn('stat','📊 통계카드')}
          ${_lcModeBtn('table','🗂️ 테이블')}
        </div>
      </div>
      <button class="b2-toolbar-btn" onclick="saveB2LineupImg()" style="padding:4px 12px;border-radius:8px;border:1px solid var(--border2);background:var(--white);color:var(--text2);font-size:12px;font-weight:700;cursor:pointer;display:flex;align-items:center;gap:4px;margin-bottom:0">📷 이미지저장</button>
    </div>`;
  }

  const profileTabLabel = '👤 프로필';
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
    ? `<button class="pill b2-current-filter" style="flex-shrink:0;white-space:nowrap"
        onclick="_b2PlayersUnivFilter='전체';document.getElementById('b2-content').innerHTML=_b2PlayersView();setTimeout(()=>{if(_b2SelectedPlayer)_b2UpdateMainDisplay(_b2SelectedPlayer.name)},0)">현재: ${_b2PlayersUnivFilter} ✕</button>`
    : '';
  const playerFilters = _b2View === 'players' ? `
    <div class="b2-nav-playerfilters" style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;flex-shrink:0">
      <div style="width:1px;height:24px;background:var(--border2);display:inline-block"></div>
      <div style="position:relative">
        <select id="b2-players-univ-sel" class="b2-toolbar-select" onchange="_b2PlayersUnivFilter=this.value;document.getElementById('b2-content').innerHTML=_b2PlayersView();setTimeout(()=>{if(_b2SelectedPlayer)_b2UpdateMainDisplay(_b2SelectedPlayer.name)},0)" style="padding:6px 28px 6px 12px;border-radius:20px;border:1px solid var(--border2);font-size:13px;background:var(--white);color:var(--text2);appearance:none;cursor:pointer">
          <option value="전체" ${_b2PlayersUnivFilter === '전체' ? 'selected' : ''}>🏫 전체 대학</option>
          ${playerUnivList.map(u => `<option value="${u}" ${_b2PlayersUnivFilter === u ? 'selected' : ''}>${u}</option>`).join('')}
        </select>
        <svg style="position:absolute;right:8px;top:50%;transform:translateY(-50%);pointer-events:none;color:var(--gray-l)" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m6 9 6 6 6-6"/></svg>
      </div>
      ${_selBadge}
      <div style="position:relative">
        <select id="b2-players-race-sel" class="b2-toolbar-select" onchange="_b2PlayersFilter=this.value;document.getElementById('b2-content').innerHTML=_b2PlayersView();setTimeout(()=>{if(_b2SelectedPlayer)_b2UpdateMainDisplay(_b2SelectedPlayer.name)},0)" style="padding:6px 28px 6px 12px;border-radius:20px;border:1px solid var(--border2);font-size:13px;background:var(--white);color:var(--text2);appearance:none;cursor:pointer">
          <option value="all" ${_b2PlayersFilter === 'all' ? 'selected' : ''}>🎮 전체 종족</option>
          <option value="P" ${_b2PlayersFilter === 'P' ? 'selected' : ''}>🔮 프로토스</option>
          <option value="T" ${_b2PlayersFilter === 'T' ? 'selected' : ''}>⚔️ 테란</option>
          <option value="Z" ${_b2PlayersFilter === 'Z' ? 'selected' : ''}>🦎 저그</option>
        </select>
        <svg style="position:absolute;right:8px;top:50%;transform:translateY(-50%);pointer-events:none;color:var(--gray-l)" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m6 9 6 6 6-6"/></svg>
      </div>
      <div style="position:relative">
        <select id="b2-players-tier-sel" class="b2-toolbar-select" onchange="_b2PlayersTierFilter=this.value;document.getElementById('b2-content').innerHTML=_b2PlayersView();setTimeout(()=>{if(_b2SelectedPlayer)_b2UpdateMainDisplay(_b2SelectedPlayer.name)},0)" style="padding:6px 28px 6px 12px;border-radius:20px;border:1px solid var(--border2);font-size:13px;background:var(--white);color:var(--text2);appearance:none;cursor:pointer">
          <option value="전체" ${_b2PlayersTierFilter==='전체'?'selected':''}>🏅 전체 티어</option>
          ${(typeof TIERS!=='undefined'?TIERS:[]).map(t=>`<option value="${t}" ${_b2PlayersTierFilter===t?'selected':''}>${t}티어</option>`).join('')}
        </select>
        <svg style="position:absolute;right:8px;top:50%;transform:translateY(-50%);pointer-events:none;color:var(--gray-l)" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m6 9 6 6 6-6"/></svg>
      </div>
    </div>
  ` : '';
  const weeklyBtn = _b2TabBtn('weekly','#f59e0b', (typeof getTabLabel==='function'?getTabLabel('board2','weekly','📅 브리핑'):'📅 브리핑'));
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
  const { fromN: _heroFromN, toN: _heroToN } = _b2ThisWeekRange();
  const _heroDateNum = _b2DateNum;
  try{
    const sig = (function(){
      try{
        const arrs=[miniM,univM,ckM,proM,ttM,comps,tourneys,proTourneys,indM,gjM];
        return arrs.map(a=>Array.isArray(a)?a.length:0).join('|');
      }catch(e){ return ''; }
    })();
    if (typeof window.__b2_hist_sig === 'undefined') window.__b2_hist_sig = '';
    if (window.__b2_hist_sig !== sig && typeof _rebuildAllPlayerHistoryCore === 'function') {
      const hasMatchData = sig.split('|').some(n => Number(n) > 0);
      const hasAnyHistory = (typeof players !== 'undefined' && Array.isArray(players))
        ? players.some(p => Array.isArray(p?.history) && p.history.length)
        : false;
      if (hasMatchData && !hasAnyHistory) _rebuildAllPlayerHistoryCore();
      window.__b2_hist_sig = sig;
    }
  }catch(e){}
  const _heroWeekActive = (() => {
    const actedNames = new Set();
    const addName = (v) => { const n = String(v||'').trim(); if(n) actedNames.add(n); };
    const scanTeam = (arr) => {
      (arr||[]).forEach(x => addName(typeof x === 'string' ? x : (x?.name||x)));
    };
    const scanSets = (m) => {
      (m?.sets||[]).forEach(s=>{
        (s?.games||[]).forEach(g=>{
          addName(g?.playerA); addName(g?.playerB);
          addName(g?.a1); addName(g?.a2); addName(g?.b1); addName(g?.b2);
          addName(g?.a); addName(g?.b);
          scanTeam(g?.teamA); scanTeam(g?.teamB);
        });
      });
    };
    const scanMatchArr = (arr) => {
      if(!Array.isArray(arr) || !arr.length) return;
      arr.forEach(m=>{
        const d = _heroDateNum(m?.d || m?.date || '');
        if(d < _heroFromN || d > _heroToN) return;
        addName(m?.wName); addName(m?.lName);
        scanSets(m);
      });
    };
    scanMatchArr(typeof miniM!=='undefined'?miniM:[]);
    scanMatchArr(typeof univM!=='undefined'?univM:[]);
    scanMatchArr(typeof ckM!=='undefined'?ckM:[]);
    scanMatchArr(typeof proM!=='undefined'?proM:[]);
    scanMatchArr(typeof ttM!=='undefined'?ttM:[]);
    scanMatchArr(typeof comps!=='undefined'?comps:[]);
    scanMatchArr(typeof indM!=='undefined'?indM:[]);
    scanMatchArr(typeof gjM!=='undefined'?gjM:[]);

    const visNameSet = new Set(visPlayers.map(p=>String(p?.name||'').trim()).filter(Boolean));
    let cnt = 0;
    actedNames.forEach(n => { if(visNameSet.has(n)) cnt++; });
    return cnt;
  })();
  const _heroViewMeta = {
    univ:    { label:'대학별', desc:'대학 카드 중심으로 소속 현황과 활동 흐름을 빠르게 살펴볼 수 있습니다.' },
    free:    { label:'무소속', desc:'무소속 스트리머만 모아서 현재 공백 구간과 개별 상태를 보기 쉽게 정리합니다.' },
    femco:   { label:'펨코', desc:'컬러 중심의 현황판 레이아웃으로 한눈에 보기 좋은 구성을 제공합니다.' },
    players: { label:'프로필', desc:'프로필 중심으로 필터를 바꿔가며 스트리머별 상태를 직관적으로 확인합니다.' },
    weekly:  { label:'브리핑', desc:'이번 주와 이번 달 활동 흐름을 요약 카드 위주로 빠르게 훑어볼 수 있습니다.' },
    ranking: { label:'랭킹', desc:'대학별 성과를 리더보드 형태로 정리해 비교가 쉽도록 구성합니다.' },
    heatmap: { label:'히트맵', desc:'분포와 집중 구간을 색 밀도로 확인할 수 있게 정리합니다.' },
    bubble:  { label:'버블맵', desc:'규모와 비중을 시각적으로 비교하기 쉽게 배치합니다.' },
    radar:   { label:'레이더', desc:'대학별 강점과 균형감을 다차원으로 비교해서 보여줍니다.' },
    summary: { label:'요약', desc:'핵심 숫자와 흐름만 모아 간결하게 확인할 수 있도록 구성합니다.' },
    compare: { label:'대학비교', desc:'여러 대학 지표를 한 자리에서 비교하기 좋게 정리합니다.' },
    old:     { label:'구현황판', desc:'기존 현황판 레이아웃을 그대로 유지하면서 현재 데이터와 연결합니다.' }
  };
  const _curViewMeta = _heroViewMeta[_b2View] || { label:'현황판', desc:'여러 시각화와 카드형 화면으로 현황을 빠르게 탐색할 수 있습니다.' };
  const _heroStyle = `
    <style>
      #rtitle { caret-color: transparent; }
      #rcont { caret-color: transparent; }
      #rcont input, #rcont textarea, #rcont [contenteditable="true"] { caret-color: auto; }
      .b2-shell{display:flex;flex-direction:column;gap:14px}
      .b2-hero{display:flex;align-items:flex-start;justify-content:space-between;gap:18px;padding:22px 24px;border-radius:28px;border:1px solid rgba(148,163,184,.18);background:linear-gradient(180deg,rgba(255,255,255,.99),rgba(248,250,252,.97));box-shadow:0 20px 36px rgba(15,23,42,.06)}
      .b2-hero-main{display:flex;flex-direction:column;gap:10px;min-width:0}
      .b2-hero-kicker{font-size:11px;font-weight:900;letter-spacing:.08em;color:#2563eb;text-transform:uppercase}
      .b2-hero-title{font-size:30px;font-weight:950;letter-spacing:-.04em;color:var(--text1);line-height:1.08}
      .b2-hero-desc{font-size:13px;line-height:1.65;color:var(--text3);max-width:760px}
      .b2-hero-stats{display:grid;grid-template-columns:repeat(3,minmax(112px,1fr));gap:10px;min-width:min(100%,360px)}
      .b2-hero-stat{padding:14px 14px 12px;border-radius:20px;border:1px solid rgba(148,163,184,.18);background:linear-gradient(180deg,rgba(255,255,255,.98),rgba(248,250,252,.94));box-shadow:0 10px 20px rgba(15,23,42,.05)}
      .b2-hero-stat-label{font-size:11px;font-weight:800;color:var(--text3);margin-bottom:6px}
      .b2-hero-stat-value{font-size:22px;font-weight:950;letter-spacing:-.03em;color:var(--text1);line-height:1}
      .b2-hero-stat-sub{margin-top:5px;font-size:11px;font-weight:700;color:var(--text3)}
      .b2-toolbar-card{padding:12px;border-radius:24px;border:1px solid rgba(148,163,184,.18);background:linear-gradient(180deg,rgba(255,255,255,.98),rgba(248,250,252,.95));box-shadow:0 14px 28px rgba(15,23,42,.05)}
      #b2-nav.b2-nav-new{display:flex;align-items:center;gap:10px;flex-wrap:wrap;overflow-x:auto;-webkit-overflow-scrolling:touch;scrollbar-width:none}
      #b2-nav.b2-nav-new::-webkit-scrollbar{display:none}
      .b2-toolbar-main{display:flex;align-items:center;gap:4px;flex-wrap:nowrap;flex-shrink:0}
      .b2-toolbar-actions{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-left:auto}
      .b2-nav-playerfilters{display:flex;align-items:center;gap:6px;flex-wrap:wrap;min-width:0}
      .b2-tab-pill{border-color:rgba(148,163,184,.18);background:rgba(255,255,255,.88);box-shadow:0 6px 12px rgba(15,23,42,.04)}
      .b2-tab-pill.on{box-shadow:0 10px 18px rgba(37,99,235,.14)}
      .b2-toolbar-select{box-shadow:0 6px 14px rgba(15,23,42,.04)}
      .b2-toolbar-btn{box-shadow:0 8px 16px rgba(15,23,42,.05)}
      .b2-current-filter{background:rgba(37,99,235,.10)!important;border-color:rgba(37,99,235,.20)!important;color:#1d4ed8!important}
      .b2-filter-toggle{box-shadow:0 6px 14px rgba(15,23,42,.04)}
      .b2-filter-toggle.is-on{box-shadow:0 10px 18px rgba(245,158,11,.20)}
      .b2-content-shell{padding:14px;border-radius:26px;border:1px solid rgba(148,163,184,.18);background:linear-gradient(180deg,rgba(255,255,255,.99),rgba(248,250,252,.96));box-shadow:0 20px 34px rgba(15,23,42,.05)}
      #b2-content{min-height:260px}
      ${_navTight}
      body.dark .b2-hero,
      body.dark .b2-toolbar-card,
      body.dark .b2-content-shell{background:linear-gradient(180deg,rgba(15,23,42,.95),rgba(15,23,42,.90));border-color:#334155;box-shadow:0 20px 34px rgba(0,0,0,.24),inset 0 1px 0 rgba(255,255,255,.03)}
      body.dark .b2-hero-stat{background:linear-gradient(180deg,rgba(30,41,59,.90),rgba(15,23,42,.88));border-color:#334155;box-shadow:none}
      body.dark .b2-tab-pill{background:rgba(15,23,42,.82);border-color:#334155;box-shadow:none}
      body.dark .b2-current-filter{background:rgba(59,130,246,.16)!important;border-color:rgba(96,165,250,.28)!important;color:#bfdbfe!important}
      @media (max-width:980px){
        .b2-hero{flex-direction:column}
        .b2-hero-stats{width:100%;grid-template-columns:repeat(3,minmax(0,1fr))}
      }
      @media (max-width:760px){
        .b2-shell{overflow-x:hidden;max-width:100%}
        .b2-hero{display:none}
        .b2-toolbar-card,.b2-content-shell{padding:10px;border-radius:20px;overflow-x:hidden}
        #b2-content{overflow-x:hidden;max-width:100%}
      }
    </style>`;

  const filterBar = `
    ${_heroStyle}
    <div class="b2-shell">
      <section class="b2-hero">
        <div class="b2-hero-main">
          <div class="b2-hero-kicker">Board Dashboard</div>
          <div class="b2-hero-title">현황판</div>
          <div class="b2-hero-desc">${_curViewMeta.desc}</div>
        </div>
        <div class="b2-hero-stats">
          <div class="b2-hero-stat">
            <div class="b2-hero-stat-label">현재 보기</div>
            <div class="b2-hero-stat-value">${_curViewMeta.label}</div>
            <div class="b2-hero-stat-sub">자주 쓰는 하위 화면으로 즉시 전환</div>
          </div>
          <div class="b2-hero-stat">
            <div class="b2-hero-stat-label">표시 인원</div>
            <div class="b2-hero-stat-value">${visPlayers.length}</div>
            <div class="b2-hero-stat-sub">숨김·은퇴 제외 기준</div>
          </div>
          <div class="b2-hero-stat">
            <div class="b2-hero-stat-label">활성 대학</div>
            <div class="b2-hero-stat-value">${univList.length}</div>
            <div class="b2-hero-stat-sub">이번주 활동 ${_heroWeekActive}명</div>
          </div>
        </div>
      </section>
      <div class="b2-toolbar-card">
        <div id="b2-nav" class="b2-nav b2-nav-new">
          <div class="b2-toolbar-main">
        ${weeklyBtn}
        ${_b2TabBtn('lineup','#dc2626', (typeof getTabLabel==='function'?getTabLabel('board2','lineup','🎽 라인업'):'🎽 라인업'))}
        ${_b2TabBtn('univ','var(--blue)',  (typeof getTabLabel==='function'?getTabLabel('board2','univ','🏟️ 대학별'):'🏟️ 대학별'))}
        ${_b2TabBtn('femco','var(--blue)', (typeof getTabLabel==='function'?getTabLabel('board2','femco','🧩 펨코'):'🧩 펨코'))}
        ${_b2TabBtn('free','var(--blue)',  (typeof getTabLabel==='function'?getTabLabel('board2','free','🚶 무소속'):'🚶 무소속'))}
        ${_b2TabBtn('players','var(--purple)', (typeof getTabLabel==='function'?getTabLabel('board2','players',profileTabLabel):profileTabLabel))}
        <span style="width:1px;height:20px;background:var(--border2);display:inline-block;flex-shrink:0"></span>
        ${heatmapBtn}
        ${bubbleBtn}
        ${radarBtn}
        <span style="width:1px;height:20px;background:var(--border2);display:inline-block;flex-shrink:0"></span>
        ${summaryBtn}
        ${compareBtn}
        ${oldBtn}
          </div>
          ${playerFilters}
          <div class="b2-toolbar-actions">${rightBtns}</div>
        </div>
      </div>
      ${_b2View === 'lineup' ? `
      <div style="display:flex;align-items:center;gap:8px;margin:-6px 0 14px;padding:8px 12px;background:var(--surface);border:1px solid var(--border);border-radius:12px;overflow-x:auto;scrollbar-width:none" class="b2-lineup-jumpbar">
        <span style="font-size:11px;font-weight:800;color:var(--gray-l);flex-shrink:0;white-space:nowrap">🏫 바로가기</span>
        <span style="width:1px;height:14px;background:var(--border2);flex-shrink:0"></span>
        ${univList.map(u=>{
          const _uc = gc(u.name);
          const _on = u.name===_b2LineupUniv;
          return `<button type="button" onclick="_b2LineupUniv='${u.name.replace(/'/g,"\\'")}';document.getElementById('b2-content').innerHTML=_b2LineupView();injectUnivIcons(document.getElementById('b2-content'));render();" style="padding:2px 9px;border-radius:999px;border:1px solid ${_on?_uc:'transparent'};background:${_on?_uc+'1a':'var(--white)'};color:${_on?_uc:'var(--text3)'};font-size:10px;font-weight:${_on?900:700};cursor:pointer;white-space:nowrap;flex-shrink:0;transition:all .15s">${u.name}</button>`;
        }).join('')}
      </div>
      ` : ''}
      <div class="b2-content-shell">
        <div id="b2-content"></div>
      </div>
    </div>
  `;

  C.innerHTML = filterBar;

  try{
    const _b2SchedulePrewarm = () => {
      try{
        if (typeof prewarmImageUrls !== 'function') return;
        const _dissSet2 = new Set((typeof univCfg !== 'undefined' ? univCfg : []).filter(u=>u.dissolved||u.hidden).map(u=>String(u.name||'').trim()));
        const photoUrls = [];
        (Array.isArray(players)?players:[])
          .filter(p => p && !p.hidden && !p.retired && !p.hideFromBoard && !_dissSet2.has(String(p?.univ||'').trim()))
          .slice(0, 220)
          .forEach(p => {
            if(p.photo) photoUrls.push(p.photo);
          });
        prewarmImageUrls(photoUrls, 180);
      }catch(e){}
    };
    if(typeof window.requestIdleCallback === 'function'){
      window.requestIdleCallback(_b2SchedulePrewarm, { timeout: 1200 });
    }else{
      setTimeout(_b2SchedulePrewarm, 450);
    }
  }catch(e){}

  const sub = document.getElementById('b2-content');
  // (즉시 렌더링 - 로딩 중 메시지 제거)
  const _renderSub = () => {
    const sub = document.getElementById('b2-content');
    if(!sub) return;
    const _known = new Set(['univ','femco','free','players','lineup','summary','weekly','ranking','radar','compare','heatmap','bubble','old']);
    if(!_known.has(String(_b2View||''))) _b2View = 'univ';
    if (_b2View === 'univ') {
      sub.innerHTML = _b2UnivView();
      injectUnivIcons(sub);
      _b2BindAutoFitResize();
      try{ _b2LazyLoadBgLayers(sub); }catch(e){}
      setTimeout(() => { try{ window._precacheVisibleImages && window._precacheVisibleImages(sub, 60); }catch(e){} }, 120);
    } else if (_b2View === 'femco') {
      sub.innerHTML = _b2FemcoView();
      injectUnivIcons(sub);
      setTimeout(() => { try{ window._precacheVisibleImages && window._precacheVisibleImages(sub, 80); }catch(e){} }, 120);
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
      setTimeout(() => { try{ window._precacheVisibleImages && window._precacheVisibleImages(sub, 60); }catch(e){} }, 120);
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
      setTimeout(() => { try{ window._precacheVisibleImages && window._precacheVisibleImages(sub, 80); }catch(e){} }, 160);
    } else if (_b2View === 'lineup') {
      sub.innerHTML = _b2LineupView();
      injectUnivIcons && injectUnivIcons(sub);
      setTimeout(() => { try{ window._precacheVisibleImages && window._precacheVisibleImages(sub, 60); }catch(e){} }, 120);
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
