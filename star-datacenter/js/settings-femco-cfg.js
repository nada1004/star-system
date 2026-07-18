function _cfgAutoOutfmtDefault(){
  return { includeRace:true, includeMap:true, mapBrackets:true, winnerEmphasis:'none', hideUnknownRace:true };
}
function _cfgAutoOutfmtLoad(){
  try{
    const raw = localStorage.getItem('su_auto_outfmt');
    if(!raw) return _cfgAutoOutfmtDefault();
    const obj = JSON.parse(raw) || {};
    return {..._cfgAutoOutfmtDefault(), ...obj};
  }catch(e){ return _cfgAutoOutfmtDefault(); }
}
function _cfgAutoOutfmtSave(next){
  try{ localStorage.setItem('su_auto_outfmt', JSON.stringify({..._cfgAutoOutfmtDefault(), ...(next||{})})); }catch(e){}
}
window.cfgAutoOutfmtUpd = function(k,v){
  const cur = _cfgAutoOutfmtLoad();
  const next = {...cur};
  const boolKeys = ['includeRace','includeMap','mapBrackets','hideUnknownRace'];
  next[k] = boolKeys.includes(k) ? (!!v) : v;
  _cfgAutoOutfmtSave(next);
  try{ window.cfgAutoOutfmtRefreshPreview && window.cfgAutoOutfmtRefreshPreview(); }catch(e){}
};
window.cfgAutoOutfmtReset = function(){
  _cfgAutoOutfmtSave(_cfgAutoOutfmtDefault());
  try{ window.cfgAutoOutfmtRefreshPreview && window.cfgAutoOutfmtRefreshPreview(); }catch(e){}
};
window.cfgAutoOutfmtRefreshPreview = function(){
  const s = _cfgAutoOutfmtLoad();
  const el = document.getElementById('cfg-auto-outfmt-preview');
  if(!el) return;
  try{
    // search-core.js 포맷터가 있으면 그걸로 미리보기
    if(typeof window.autoFormatMatchLine==='function'){
      el.textContent = window.autoFormatMatchLine('조기석','변현제','실피드');
      return;
    }
  }catch(e){}
  // fallback
  const emph = (n)=> s.winnerEmphasis==='md'?`**${n}**`:s.winnerEmphasis==='star'?`★${n}`:n;
  const map = s.includeMap ? (s.mapBrackets?'[실피드]':'실피드') : '';
  const raceW = s.includeRace ? '(T)' : '';
  const raceL = s.includeRace ? '(P)' : '';
  el.textContent = `${emph('조기석')}${raceW} ✅ 🆚️ ⬜ 변현제${raceL}${map?(' '+map):''}`.trim();
};

// ─────────────────────────────────────────────────────────────
// (점검) 설정탭 핸들러 누락 체크(“눌러도 안 되는 버튼” 빠르게 찾기)
// - settings 화면에 렌더된 data-cfg-sec 영역에서 onclick/onchange/oninput 을 스캔
// ─────────────────────────────────────────────────────────────
window.cfgRunSettingsSelfCheck = function(){
  const out = document.getElementById('cfg-selfcheck-out');
  if(out) out.innerHTML = '<div style="color:var(--gray-l);font-size:var(--fs-sm)">검사 중...</div>';
  try{
    const JS_KEYWORDS = new Set(['if','for','while','function','typeof','new','return','let','const','var','switch','case','do','break','continue','try','catch','finally','throw','class','extends','super','static','async','await','yield','import','export','default','from','as','delete','in','instanceof','of','void','undefined','null','true','false','this','arguments','eval','isNaN','parseInt','parseFloat','encodeURIComponent','decodeURIComponent']);
    const secs = Array.from(document.querySelectorAll('[data-cfg-sec]'));
    const html = secs.map(el=>el.outerHTML).join('\n');
    const re = /(?:onclick|onchange|oninput)=\"\s*([A-Za-z_][A-Za-z0-9_]*)\s*\(/g;
    const called = new Set();
    let m;
    while((m=re.exec(html))) called.add(m[1]);
    const missing = Array.from(called).filter(fn => !JS_KEYWORDS.has(fn) && typeof window[fn] !== 'function').sort();

    // 각 탭 함수 확인
    const tabFuncs = {
      '기록탭': ['rHist'],
      '미니탭': ['rMini'],
      '대회탭': ['rComp'],
      '현황판탭': ['rBoard2'],
      '티어토너먼트': ['rTierTourTab'],
      '프로리그': ['rPro'],
      '캘린더': ['rCal'],
      '통계': ['rStats'],
      '붙여넣기': ['pastePreview', 'openGrpPasteModal'],
    };
    const tabMissing = {};
    for(const [tab, funcs] of Object.entries(tabFuncs)){
      const missing = funcs.filter(f => typeof window[f] !== 'function');
      if(missing.length > 0) tabMissing[tab] = missing;
    }

    if(out){
      let html = '';
      if(missing.length > 0){
        html += `<div style="font-size:var(--fs-sm);color:#dc2626;font-weight:1000;margin-bottom:8px">⚠️ settings.js 핸들러 누락 ${missing.length}개</div>
                 <div style="font-family:ui-monospace,monospace;font-size:var(--fs-sm);white-space:pre-wrap;line-height:1.5;margin-bottom:12px">${missing.join('\\n')}</div>`;
      }
      if(Object.keys(tabMissing).length > 0){
        html += `<div style="font-size:var(--fs-sm);color:#ea580c;font-weight:1000;margin-bottom:6px">⚠️ 탭 렌더러 누락</div>
                 <div style="font-family:ui-monospace,monospace;font-size:var(--fs-caption);white-space:pre-wrap;line-height:1.6">`;
        for(const [tab, funcs] of Object.entries(tabMissing)){
          html += `${tab}: ${funcs.join(', ')}\\n`;
        }
        html += `</div>`;
      }
      if(missing.length === 0 && Object.keys(tabMissing).length === 0){
        html = `<div style="font-size:var(--fs-sm);color:#16a34a;font-weight:1000">✅ 모든 핸들러 및 탭 함수 정상</div>`;
      }
      out.innerHTML = html;
    }
  }catch(e){
    if(out) out.innerHTML = `<div style="font-size:var(--fs-sm);color:#dc2626;font-weight:1000">검사 실패: ${String(e)}</div>`;
  }
};
function _cfgMenuSave(v){
  try{ localStorage.setItem(_CFG_MENU_KEY, JSON.stringify(v)); }catch(e){}
}
function _cfgMenuNormalize(layout){
  const all = _cfgAllSecs.slice();
  const defCats = Object.keys(_DEFAULT_CATSECS);
  let catOrder = Array.isArray(layout?.catOrder) ? layout.catOrder.filter(c=>typeof c==='string' && c.trim()) : defCats.slice();
  // 구버전 호환: 카테고리명 변경/병합
  const oldToNewCat = {
    '게임 운영':'🧩 운영/콘텐츠',
    '콘텐츠 관리':'🧩 운영/콘텐츠',
    '현황판 관리':'🧩 현황판/펨코',
    '이미지 관리':'🖼️ 스트리머/프로필',
    '🖼️ 이미지/프로필':'🖼️ 스트리머/프로필',
    '🎨 스타일/테마':'🎨 UI/테마',
    '🎨 디자인/테마':'🎨 UI/테마',
    '🧪 고급/실험실':'🧪 점검/고급',
    '🧪 고급/점검':'🧪 점검/고급',
    '데이터 관리':'💾 데이터',
    '시스템 설정':'🎨 UI/테마',
  };
  catOrder = catOrder.map(c => oldToNewCat[c] || c).filter((v,i,a)=>a.indexOf(v)===i);
  // 기본 카테고리 누락 시 추가
  defCats.forEach(c=>{ if(!catOrder.includes(c)) catOrder.push(c); });

  const catSecs = {};
  const legacyCatSecs = layout?.catSecs && typeof layout.catSecs === 'object' ? layout.catSecs : {};
  const aliasCatSecs = {};
  // 구버전/사용자 레이아웃의 카테고리를 신규 카테고리로 병합
  try{
    Object.entries(legacyCatSecs||{}).forEach(([cat, secs])=>{
      const nc = oldToNewCat[cat] || cat;
      if(!Array.isArray(secs)) return;
      if(!aliasCatSecs[nc]) aliasCatSecs[nc] = [];
      secs.forEach(s=>{ if(!aliasCatSecs[nc].includes(s)) aliasCatSecs[nc].push(s); });
    });
  }catch(e){}

  // (구버전 호환) '시스템 설정'을 섹션 단위로 분배하던 로직은
  // 위의 oldToNewCat 병합으로 자연스럽게 해결됨.
  // 사용자 레이아웃 반영
  catOrder.forEach(c=>{
    const arr = (aliasCatSecs && Array.isArray(aliasCatSecs[c])) ? aliasCatSecs[c] : (_DEFAULT_CATSECS[c] || []);
    catSecs[c] = arr.filter(sec => all.includes(sec));
  });
  // 누락된 섹션은 기본 위치에 추가
  const used = new Set(Object.values(catSecs).flat());
  all.forEach(sec=>{
    if(used.has(sec)) return;
    const defCat = Object.keys(_DEFAULT_CATSECS).find(c => (_DEFAULT_CATSECS[c]||[]).includes(sec)) || defCats[0];
    if(!catSecs[defCat]) catSecs[defCat] = [];
    catSecs[defCat].push(sec);
    used.add(sec);
  });
  // 빈 카테고리 제거(단, 기본 카테고리는 유지)
  catOrder.forEach(c=>{ if(!catSecs[c]) catSecs[c] = []; });
  return {catOrder, catSecs};
}

let _catSecs = (() => {
  const raw = _cfgMenuLoad();
  const norm = _cfgMenuNormalize(raw || {});
  try{ window._cfgCatOrder = norm.catOrder; }catch(e){}
  // catSecs만 rCfg/_cfgApplyCat에서 사용
  const cs = norm.catSecs;
  try{ window._catSecs = cs; }catch(e){}
  return cs;
})();

function _cfgMenuApplyAndRerender(layout){
  const norm = _cfgMenuNormalize(layout || {});
  _cfgMenuSave(norm);
  _catSecs = norm.catSecs;
  try{ window._catSecs = _catSecs; }catch(e){}
  try{ window._cfgCatOrder = norm.catOrder; }catch(e){}
  try{
    if(!Object.keys(_catSecs).includes(window._cfgCat)){
      window._cfgCat = (window._cfgCatOrder && window._cfgCatOrder[0]) || '🧩 운영/콘텐츠';
    }
  }catch(e){}
  try{ render(); }catch(e){}
}

// 섹션을 다른 카테고리로 이동
window.cfgMenuSetCat = function(secId, targetCat){
  const cur = _cfgMenuNormalize(_cfgMenuLoad() || {});
  const cats = cur.catOrder.slice();
  if(!cats.includes(targetCat)) cats.push(targetCat);
  // 제거
  cats.forEach(c=>{
    cur.catSecs[c] = (cur.catSecs[c]||[]).filter(x=>x!==secId);
  });
  cur.catSecs[targetCat] = cur.catSecs[targetCat] || [];
  cur.catSecs[targetCat].push(secId);
  _cfgMenuApplyAndRerender(cur);
};

// 섹션 순서 이동(같은 카테고리 내)
window.cfgMenuMoveSec = function(secId, dir){
  const cur = _cfgMenuNormalize(_cfgMenuLoad() || {});
  const cats = cur.catOrder.slice();
  let foundCat = null;
  cats.forEach(c=>{
    if((cur.catSecs[c]||[]).includes(secId)) foundCat = c;
  });
  if(!foundCat) return;
  const arr = cur.catSecs[foundCat] || [];
  const i = arr.indexOf(secId);
  const j = i + (dir==='up'?-1:1);
  if(i<0 || j<0 || j>=arr.length) return;
  [arr[i], arr[j]] = [arr[j], arr[i]];
  cur.catSecs[foundCat] = arr;
  _cfgMenuApplyAndRerender(cur);
};

// 카테고리 순서 이동
window.cfgMenuMoveCat = function(cat, dir){
  const cur = _cfgMenuNormalize(_cfgMenuLoad() || {});
  const arr = cur.catOrder.slice();
  const i = arr.indexOf(cat);
  const j = i + (dir==='up'?-1:1);
  if(i<0 || j<0 || j>=arr.length) return;
  [arr[i], arr[j]] = [arr[j], arr[i]];
  cur.catOrder = arr;
  _cfgMenuApplyAndRerender(cur);
};

window.cfgMenuReset = function(){
  try{ localStorage.removeItem(_CFG_MENU_KEY); }catch(e){}
  _cfgMenuApplyAndRerender({});
};

// (요청사항) 설정 상단 "바로가기" UI 제거됨.

// closest()/matches()/includes() 미지원 환경 대비: 상위로 올라가며 data-attr 탐색
function _cfgFindUpAttr(el, attrName, maxDepth){
  maxDepth = (typeof maxDepth === 'number') ? maxDepth : 8;
  let cur = el;
  for(let i=0;i<maxDepth && cur;i++){
    try{
      if(cur.getAttribute && cur.getAttribute(attrName)!=null) return cur;
    }catch(e){}
    cur = cur.parentNode;
  }
  return null;
}

/* ══════════════════════════════════════
   🧩 펨코현황 설정 (이미지 관리)
   - localStorage: b2_femco_settings_v1
══════════════════════════════════════ */
const _FEMCO_CFG_KEY = 'b2_femco_settings_v1';
function _cfgFemcoDefaults(){
  return {
    autoLayout: 1,     // 1: 인원수/화면폭에 맞춰 자동 레이아웃, 0: 수동 설정값 사용
    logoSize: 150,
    logoPos: 'top',
    logoAttachTitle: 1, // 1: 로고+대학명 같이 이동, 0: 로고만 이동
    headGap: 10,        // 로고-대학명(세로) 간격
    titleSize: 28,
    titleFont: 'system',
    playerImgSize: 76,
    playerImgShape: 'square',
    rowsPerCol: 5,
    colWidth: 170,
    colGap: 10,
    univGap: 18,
    countFontSize: 12,
    contentPadX: 16,
    contentAlign: 'left', // left | center (기본은 좌측)
    contentOffsetX: 0,      // 좌우 미세 이동(-40~40)
    univSubtitles: {},
    subtitleSize: 12,
    subtitleWeight: 800,
    subtitleColor: '',
    nameFontSize: 18,
    roleFontSize: 10,
    tierBadgeSize: 10,
    tierBadgePadX: 6,
    starSize: 15,
    statusIconSize: 18,
    univColorOverrides: {},
    // 대학별 배경 미디어
    // - 기존 호환: 값이 string이면 URL로 처리
    // - 신규: {url, alpha, sizeMode, sizeVal, pos, repeat, ox, oy}
    univBgMedia: {},
    // (요청) 배경 미디어 오버레이(투명도) — 0(없음) ~ 70(진하게)
    bgOverlay: 22,
    // (요청) 로고/대학명 위치 미세조정(px)
    logoOffsetX: 0,
    logoOffsetY: 0,
    titleOffsetX: 0,
    titleOffsetY: 0,
    // (요청) 대학명 위치(로고 기준) — left/right/top/bottom
    titlePos: 'bottom'
  };
}
function _cfgFemcoLoad(){
  try{
    const raw = localStorage.getItem(_FEMCO_CFG_KEY);
    if(!raw) return _cfgFemcoDefaults();
    const obj = JSON.parse(raw) || {};
    const defs = _cfgFemcoDefaults();
    const merged = {...defs, ...obj,
      univSubtitles:{...((defs.univSubtitles)||{}), ...(obj.univSubtitles||{})},
      univColorOverrides:{...((defs.univColorOverrides)||{}), ...(obj.univColorOverrides||{})},
      univBgMedia:{...((defs.univBgMedia)||{}), ...(obj.univBgMedia||{})}
    };
    if((obj.autoLayout ?? defs.autoLayout) ? true : false){
      if((parseInt(obj.playerImgSize,10) || 0) === 64) merged.playerImgSize = defs.playerImgSize;
      if((parseInt(obj.nameFontSize,10) || 0) === 16) merged.nameFontSize = defs.nameFontSize;
    }
    return merged;
  }catch(e){ return _cfgFemcoDefaults(); }
}
function _cfgFemcoSave(obj){
  try{ localStorage.setItem(_FEMCO_CFG_KEY, JSON.stringify(obj)); }catch(e){}
}

// (리팩터) 펨코 설정 단일 소스(SSOT): 다른 모듈(board2.js 등)에서 재사용할 수 있도록 노출
// - 기존 동작은 그대로 유지하며, 중복 defaults/load/save를 제거하기 위한 목적
try{
  window._cfgFemcoDefaults = _cfgFemcoDefaults;
  window._cfgFemcoLoad = _cfgFemcoLoad;
  window._cfgFemcoSave = _cfgFemcoSave;
}catch(e){}

window.cfgFemcoUpd = function(k, v){
  const cur = _cfgFemcoLoad();
  const next = {...cur};
  const numKeys = ['autoLayout','logoSize','logoAttachTitle','logoPos','headGap','titleSize','playerImgSize','rowsPerCol','colWidth','colGap','univGap','countFontSize','contentPadX','contentOffsetX','starSize','statusIconSize','subtitleSize','subtitleWeight','nameFontSize','roleFontSize','tierBadgeSize','tierBadgePadX','bgOverlay','logoOffsetX','logoOffsetY','titleOffsetX','titleOffsetY'];
  next[k] = numKeys.includes(k) ? parseInt(v, 10) : v;

  // 수동 조절을 건드리면 자동 레이아웃 OFF (원클릭 자동화 요구사항: 사용자가 바꾸면 유지)
  const manualKeys = ['rowsPerCol','colWidth','colGap','univGap','playerImgSize','contentPadX','contentOffsetX','nameFontSize','roleFontSize','countFontSize','headGap','logoSize','statusIconSize','starSize','bgOverlay','logoOffsetX','logoOffsetY','titleOffsetX','titleOffsetY','logoPos','titlePos','logoAttachTitle'];
  if (k !== 'autoLayout' && manualKeys.includes(k)) {
    next.autoLayout = 0;
  }
  _cfgFemcoSave(next);
  // 즉시 반영(로고 위치/오버레이 등이 "안 먹는" 것처럼 보이는 문제 방지)
  try{ if(typeof render === 'function') render(); }catch(e){}
};

window.cfgFemcoInit = function(){
  const s = _cfgFemcoLoad();
  const setVal = (id, val) => { const el=document.getElementById(id); if(el) el.value = val; };
  try{ const chk=document.getElementById('cfg-femco-autoLayout'); if(chk) chk.checked = (s.autoLayout ?? 1) ? true : false; }catch(e){}
  setVal('cfg-femco-logoSize', s.logoSize); setVal('cfg-femco-logoSizeNum', s.logoSize);
  setVal('cfg-femco-logoPos', s.logoPos);
  setVal('cfg-femco-titlePos', s.titlePos || 'bottom');
  try{ const chk=document.getElementById('cfg-femco-logoAttachTitle'); if(chk) chk.checked = (s.logoAttachTitle ?? 1) ? true : false; }catch(e){}
  setVal('cfg-femco-headGap', s.headGap || 10); setVal('cfg-femco-headGapNum', s.headGap || 10);
  setVal('cfg-femco-titleSize', s.titleSize); setVal('cfg-femco-titleSizeNum', s.titleSize);
  setVal('cfg-femco-titleFont', s.titleFont);
  setVal('cfg-femco-playerImgSize', s.playerImgSize); setVal('cfg-femco-playerImgSizeNum', s.playerImgSize);
  setVal('cfg-femco-playerImgShape', s.playerImgShape);
  setVal('cfg-femco-rowsPerCol', s.rowsPerCol); setVal('cfg-femco-rowsPerColNum', s.rowsPerCol);
  setVal('cfg-femco-colWidth', s.colWidth); setVal('cfg-femco-colWidthNum', s.colWidth);
  setVal('cfg-femco-colGap', s.colGap); setVal('cfg-femco-colGapNum', s.colGap);
  setVal('cfg-femco-univGap', s.univGap || 18); setVal('cfg-femco-univGapNum', s.univGap || 18);
  setVal('cfg-femco-countFontSize', s.countFontSize || 12); setVal('cfg-femco-countFontSizeNum', s.countFontSize || 12);
  setVal('cfg-femco-contentPadX', s.contentPadX || 16); setVal('cfg-femco-contentPadXNum', s.contentPadX || 16);
  setVal('cfg-femco-contentAlign', s.contentAlign || 'left');
  setVal('cfg-femco-contentOffsetX', s.contentOffsetX || 0); setVal('cfg-femco-contentOffsetXNum', s.contentOffsetX || 0);
  setVal('cfg-femco-nameFontSize', s.nameFontSize || 16); setVal('cfg-femco-nameFontSizeNum', s.nameFontSize || 16);
  setVal('cfg-femco-roleFontSize', s.roleFontSize || 10); setVal('cfg-femco-roleFontSizeNum', s.roleFontSize || 10);
  setVal('cfg-femco-tierBadgeSize', s.tierBadgeSize || 10); setVal('cfg-femco-tierBadgeSizeNum', s.tierBadgeSize || 10);
  setVal('cfg-femco-starSize', s.starSize || 15); setVal('cfg-femco-starSizeNum', s.starSize || 15);
  setVal('cfg-femco-statusIconSize', s.statusIconSize || 18); setVal('cfg-femco-statusIconSizeNum', s.statusIconSize || 18);
  setVal('cfg-femco-subtitleSize', s.subtitleSize); setVal('cfg-femco-subtitleSizeNum', s.subtitleSize);
  setVal('cfg-femco-subtitleWeight', s.subtitleWeight);
  setVal('cfg-femco-subtitleColor', (s.subtitleColor && s.subtitleColor.startsWith('#')) ? s.subtitleColor : '#ffffff');
  setVal('cfg-femco-bgOverlay', s.bgOverlay ?? 22); setVal('cfg-femco-bgOverlayNum', s.bgOverlay ?? 22);
  setVal('cfg-femco-logoOffsetX', s.logoOffsetX ?? 0); setVal('cfg-femco-logoOffsetXNum', s.logoOffsetX ?? 0);
  setVal('cfg-femco-logoOffsetY', s.logoOffsetY ?? 0); setVal('cfg-femco-logoOffsetYNum', s.logoOffsetY ?? 0);
  setVal('cfg-femco-titleOffsetX', s.titleOffsetX ?? 0); setVal('cfg-femco-titleOffsetXNum', s.titleOffsetX ?? 0);
  setVal('cfg-femco-titleOffsetY', s.titleOffsetY ?? 0); setVal('cfg-femco-titleOffsetYNum', s.titleOffsetY ?? 0);

  // 대학 셀렉트 채우기
  const sel = document.getElementById('cfg-femco-univ');
  if (sel) {
    const names = (typeof univCfg !== 'undefined' ? univCfg : []).map(u=>u.name).filter(Boolean);
    if (!names.includes('무소속')) names.push('무소속');
    const curUniv = localStorage.getItem('cfg_femco_univ') || names[0] || '';
    sel.innerHTML = names.map(n=>`<option value="${n}"${n===curUniv?' selected':''}>${n}</option>`).join('');
    localStorage.setItem('cfg_femco_univ', curUniv);
  }
  if (typeof window.cfgFemcoRefreshUnivFields === 'function') window.cfgFemcoRefreshUnivFields();
};

window.cfgFemcoRefreshUnivFields = function(){
  const s = _cfgFemcoLoad();
  const sel = document.getElementById('cfg-femco-univ');
  const u = sel ? sel.value : (localStorage.getItem('cfg_femco_univ') || '');
  const c = (s.univColorOverrides||{})[u] || '#000000';
  const sub = (s.univSubtitles||{})[u] || '';
  const rawBg = (s.univBgMedia||{})[u] || '';
  const bgObj = (function(){
    const d={url:'',alpha:30,sizeMode:'cover',sizeVal:90,pos:'center',repeat:'no-repeat',ox:0,oy:0};
    if(!rawBg) return d;
    if(typeof rawBg==='string') return {...d,url:rawBg};
    if(typeof rawBg==='object') return {...d,...rawBg,url:(rawBg.url||'')};
    return d;
  })();
  const colorEl = document.getElementById('cfg-femco-univColor');
  const subEl = document.getElementById('cfg-femco-subtitle');
  const bgEl = document.getElementById('cfg-femco-bgMediaUrl');
  const bgHint = document.getElementById('cfg-femco-bgMediaHint');
  if (colorEl) colorEl.value = c;
  if (subEl) subEl.value = sub;
  if (bgEl) bgEl.value = bgObj.url || '';
  if (bgHint) bgHint.textContent = bgObj.url ? '설정됨' : '미설정';
  // 배경 옵션
  const setVal=(id,v)=>{const el=document.getElementById(id);if(el!=null) el.value=v;};
  setVal('cfg-femco-bgAlpha', bgObj.alpha);
  setVal('cfg-femco-bgAlphaNum', bgObj.alpha);
  setVal('cfg-femco-bgSizeMode', bgObj.sizeMode);
  setVal('cfg-femco-bgSizeVal', bgObj.sizeVal);
  setVal('cfg-femco-bgPos', bgObj.pos);
  setVal('cfg-femco-bgRepeat', bgObj.repeat);
  setVal('cfg-femco-bgOffX', bgObj.ox);
  setVal('cfg-femco-bgOffXNum', bgObj.ox);
  setVal('cfg-femco-bgOffY', bgObj.oy);
  setVal('cfg-femco-bgOffYNum', bgObj.oy);
};

window.cfgFemcoSetBgMedia = function(url){
  const s = _cfgFemcoLoad();
  const sel = document.getElementById('cfg-femco-univ');
  const u = sel ? sel.value : '';
  if(!u) return;
  s.univBgMedia = s.univBgMedia || {};
  const v = (url || '').trim();
  if(!v) delete s.univBgMedia[u];
  else {
    const prev = s.univBgMedia[u];
    if(prev && typeof prev==='object') s.univBgMedia[u] = {...prev, url:v};
    else s.univBgMedia[u] = {url:v, alpha:30, sizeMode:'cover', sizeVal:90, pos:'center', repeat:'no-repeat', ox:0, oy:0};
  }
  _cfgFemcoSave(s);
  try{ window.cfgFemcoRefreshUnivFields && window.cfgFemcoRefreshUnivFields(); }catch(e){}
  try{ if(typeof render==='function') render(); }catch(e){}
};

window.cfgFemcoSetBgOpt = function(k, v){
  const s = _cfgFemcoLoad();
  const sel = document.getElementById('cfg-femco-univ');
  const u = sel ? sel.value : '';
  if(!u) return;
  s.univBgMedia = s.univBgMedia || {};
  const d={url:'',alpha:30,sizeMode:'cover',sizeVal:90,pos:'center',repeat:'no-repeat',ox:0,oy:0};
  const cur = s.univBgMedia[u];
  const obj = (!cur ? {...d} : (typeof cur==='string' ? {...d,url:cur} : {...d,...cur}));
  const numKeys=['alpha','sizeVal','ox','oy'];
  obj[k] = numKeys.includes(k) ? parseInt(v,10) : v;
  // URL이 없는 상태에서 옵션만 바뀌어도 저장은 허용(추후 URL 입력시 바로 적용)
  s.univBgMedia[u]=obj;
  _cfgFemcoSave(s);
  try{ window.cfgFemcoRefreshUnivFields && window.cfgFemcoRefreshUnivFields(); }catch(e){}
  try{ if(typeof render==='function') render(); }catch(e){}
};

window.cfgFemcoSetUnivColor = function(color){
  const s = _cfgFemcoLoad();
  const sel = document.getElementById('cfg-femco-univ');
  const u = sel ? sel.value : '';
  if(!u) return;
  s.univColorOverrides = s.univColorOverrides || {};
  s.univColorOverrides[u] = color;
  _cfgFemcoSave(s);
};
window.cfgFemcoClearUnivColor = function(){
  const s = _cfgFemcoLoad();
  const sel = document.getElementById('cfg-femco-univ');
  const u = sel ? sel.value : '';
  if(!u) return;
  s.univColorOverrides = s.univColorOverrides || {};
  delete s.univColorOverrides[u];
  _cfgFemcoSave(s);
  window.cfgFemcoRefreshUnivFields();
};
window.cfgFemcoSetSubtitle = function(text){
  const s = _cfgFemcoLoad();
  const sel = document.getElementById('cfg-femco-univ');
  const u = sel ? sel.value : '';
  if(!u) return;
  s.univSubtitles = s.univSubtitles || {};
  s.univSubtitles[u] = (text || '').trim();
  _cfgFemcoSave(s);
};
window.cfgFemcoClearSubtitle = function(){
  const s = _cfgFemcoLoad();
  const sel = document.getElementById('cfg-femco-univ');
  const u = sel ? sel.value : '';
  if(!u) return;
  s.univSubtitles = s.univSubtitles || {};
  delete s.univSubtitles[u];
  _cfgFemcoSave(s);
  window.cfgFemcoRefreshUnivFields();
};
window.cfgFemcoReset = function(){
  _cfgFemcoSave(_cfgFemcoDefaults());
  window.cfgFemcoInit();
};

// 설정 탭 버튼이 "반응 없음"처럼 보일 때를 대비한 이벤트 바인딩(인라인 onclick 불발 대비)
let _cfgLastTapHandledAt = 0;
let _cfgLastTapHandledKey = '';
let _cfgPointerDownAt = 0;
let _cfgPointerDownKey = '';
function _cfgShouldIgnoreDuplicateTap(e, key){
  try{
    const now = Date.now();
    const type = String(e && e.type || '');
    const safeKey = String(key || '');
    // pointerdown은 별도 추적 — 실제 처리(pointerup/click)와 분리
    if(type === 'pointerdown'){
      _cfgPointerDownAt = now;
      _cfgPointerDownKey = safeKey;
      return false; // pointerdown 단계에서는 차단하지 않음
    }
    // pointerup/click: pointerdown으로 이미 처리된 경우만 중복으로 간주
    if(safeKey && _cfgLastTapHandledKey === safeKey && (now - _cfgLastTapHandledAt) < 400){
      return true;
    }
    if(safeKey && (type === 'pointerup' || type === 'click' || type === 'touchend')){
      _cfgLastTapHandledAt = now;
      _cfgLastTapHandledKey = safeKey;
    }
  }catch(_){}
  return false;
}
function _cfgHandleCfgClick(e){
  // 설정탭이 실제로 렌더된 상태에서만 처리
  // (바로가기 UI를 삭제했으므로 cfg-shortcuts는 더 이상 존재하지 않음)
  // 설정 화면이 아닌 경우에는 무시
  try{
    if(!document.querySelector('.cfg-cat-pill') && !document.querySelector('[data-cfg-sec]')) return;
  }catch(_){}
  const t = e.target;
  const catBtn = _cfgFindUpAttr(t, 'data-cfg-cat');
  if(catBtn){
    // preventDefault 제거 - 인라인 onclick도 작동하도록
    const cat = catBtn.getAttribute('data-cfg-cat');
    if(_cfgShouldIgnoreDuplicateTap(e, 'cat:' + String(cat||''))) return;
    if(cat){ _cfgApplyCat(cat, false); }
    return;
  }
  const goBtn = _cfgFindUpAttr(t, 'data-cfg-go');
  if(goBtn){
    // preventDefault 제거 - 인라인 onclick도 작동하도록
    const sec = goBtn.getAttribute('data-cfg-go');
    if(_cfgShouldIgnoreDuplicateTap(e, 'go:' + String(sec||''))) return;
    if(sec){ _cfgGo(sec); }
    return;
  }
  // (요청사항) 섹션(summary) 클릭 시 "펼치기" 대신 팝업(모달)로 열기
  // - 모달 안(#cfgModalBody)에서는 토글 대신 '팝업 닫기'
  try{
    const secWrap = _cfgFindUpAttr(t, 'data-cfg-sec');
    if(secWrap && secWrap.tagName === 'DETAILS'){
      const inModal = !!(secWrap.closest && secWrap.closest('#cfgModalBody'));
      // summary 영역 클릭인지 확인
      let cur = t, inSummary = false, sumEl = null;
      for(let i=0;i<8 && cur && cur!==secWrap;i++){
        if(cur.tagName === 'SUMMARY'){ inSummary = true; sumEl = cur; break; }
        cur = cur.parentNode;
      }
      if(inSummary){
        // (버그픽스) 섹션(details[data-cfg-sec]) 내부에 또 다른 <details><summary> UI가 있을 수 있음.
        // 그 경우 중첩 summary 클릭까지 "섹션 요약 클릭"으로 오인하여 모달이 닫히는 문제가 발생.
        // → summary의 직접 부모가 secWrap(섹션 details)일 때만 섹션 요약 클릭으로 처리한다.
        try{
          if(sumEl && sumEl.parentNode !== secWrap){
            return; // 중첩 details/summary는 기본 토글 동작 허용
          }
        }catch(_){}
        if(inModal){
          try{ if(e && e.preventDefault) e.preventDefault(); }catch(_){}
          try{ if(e && e.stopPropagation) e.stopPropagation(); }catch(_){}
          try{ if(typeof closeCfgModal==='function') closeCfgModal(); }catch(_){}
          return;
        }
        const secId = secWrap.getAttribute('data-cfg-sec');
        if(secId){
          if(_cfgShouldIgnoreDuplicateTap(e, 'sec:' + String(secId||''))) return;
          try{ if(e && e.preventDefault) e.preventDefault(); }catch(_){}
          try{ if(e && e.stopPropagation) e.stopPropagation(); }catch(_){}
          // (요청사항) '펼치기' 동작은 하지 않고 팝업만 띄우기
          try{ secWrap.open = false; }catch(_){}
          _cfgGo(secId);
          return;
        }
      }
    }
  }catch(_){}
}
function _bindCfgHandlers(){
  if(window._cfgGlobalBound) return;
  window._cfgGlobalBound = true;
  // 일부 웹뷰/확장환경에서 document 캡처 클릭이 차단되는 케이스가 있어
  // window 캡처(pointerup)를 우선으로 바인딩한다.
  // details/summary 토글을 확실히 막기 위해 pointerdown도 캡처로 선 바인딩
  // 모바일에서는 touchend + click 중복 발화가 있어 touchend는 바인딩하지 않음
  try{ document.addEventListener('pointerdown', _cfgHandleCfgClick, true); }catch(e){}
  try{ window.addEventListener('pointerup', _cfgHandleCfgClick, true); }catch(e){}
  try{ document.addEventListener('click', _cfgHandleCfgClick, true); }catch(e){}

  // (요청사항) 설정 변경 → 다른 기기 반영(동기화 ON + 자동 저장 ON일 때)
  // - settings 모달 내부에서 발생하는 input/change를 감지해 prefs 변경을 기록
  // - 펨코스타일(슬라이더 oninput)도 여기로 같이 잡힘
  try{
    const _touch = (ev)=>{
      try{
        if(typeof curTab!=='undefined' && curTab!=='cfg') return;
        const t = ev && ev.target;
        if(!t) return;
        // 토큰/비밀번호 입력 등은 자동 저장 제외
        const id = String(t.id||'');
        if(id.startsWith('cfg-gist-') || id.startsWith('cfg-gh-') || id.startsWith('cfg-fb-')) return;
        if(t.type==='password') return;
        // 설정 영역의 입력만
        if(!id.startsWith('cfg-') && !(t.closest && t.closest('#cfgModalBody'))) return;
        if(typeof window.cfgTouchPrefsSync==='function') window.cfgTouchPrefsSync();
      }catch(e){}
    };
    document.addEventListener('input', _touch, true);
    document.addEventListener('change', _touch, true);
    document.addEventListener('click', (ev)=>{
      try{
        if(typeof curTab!=='undefined' && curTab!=='cfg') return;
        const t = ev && ev.target;
        if(!t) return;
        if(t.tagName==='BUTTON' || (t.closest && t.closest('button'))){
          const btn = t.tagName==='BUTTON'?t:(t.closest('button'));
          const id = String(btn && btn.id || '');
          if(id.startsWith('cfg-gist-') || id.startsWith('cfg-gh-') || id.startsWith('cfg-fb-')) return;
          if(typeof window.cfgTouchPrefsSync==='function') window.cfgTouchPrefsSync();
        }
      }catch(e){}
    }, true);
  }catch(e){}
}
