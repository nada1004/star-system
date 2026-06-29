const _HDR_PRESETS_KEY = 'su_hdr_presets_v1';
const _HDR_PRESET_SEL_KEY = 'su_hdr_preset_sel_v1';
function _hdrPresetUid(){ return 'hdr_'+Date.now().toString(36)+Math.random().toString(36).slice(2,6); }
function _hdrPresetsLoad(){
  try{
    const v = JSON.parse(localStorage.getItem(_HDR_PRESETS_KEY)||'null');
    return Array.isArray(v) ? v : [];
  }catch(e){ return []; }
}
function _hdrPresetsSave(arr){
  try{ localStorage.setItem(_HDR_PRESETS_KEY, JSON.stringify(Array.isArray(arr)?arr:[])); }catch(e){}
}
function _hdrPresetSelLoad(){ try{ return localStorage.getItem(_HDR_PRESET_SEL_KEY)||''; }catch(e){ return ''; } }
function _hdrPresetSelSave(id){ try{ localStorage.setItem(_HDR_PRESET_SEL_KEY, String(id||'')); }catch(e){} }
function _hdrPresetGetCurrentSnapshot(){
  const get=(k,def='')=>{ try{ return (localStorage.getItem(k)||def); }catch(e){ return def; } };
  let themeVars=null;
  try{ themeVars = JSON.parse(localStorage.getItem('su_theme_vars_v1')||'null'); }catch(e){ themeVars=null; }
  if(!themeVars || typeof themeVars!=='object') themeVars=null;
  return {
    title: get('su_hdr_title','스타대학 데이터 센터'),
    leftIco: get('su_hdr_left_icon','🏆'),
    leftSz: parseInt(get('su_hdr_left_size','22'),10)||22,
    rightImg: get('su_hdr_right_img',''),
    rightSz: parseInt(get('su_hdr_right_size','32'),10)||32,
    bgImg: get('su_hdr_bg_img',''),
    hH: parseInt(get('su_hdr_height','0'),10)||0,
    fx: get('su_hdr_fx','classic'),
    c1: get('su_hdr_c1','#1e3a8a'),
    c2: get('su_hdr_c2','#2563eb'),
    sync: (get('su_hdr_sync_theme','0')==='1'),
    themeVars: themeVars
  };
}
function _hdrPresetApplySnapshot(s){
  if(!s) return;
  try{ localStorage.setItem('su_hdr_title', String(s.title||'')); }catch(e){}
  try{ localStorage.setItem('su_hdr_left_icon', String(s.leftIco||'')); }catch(e){}
  try{ localStorage.setItem('su_hdr_left_size', String(s.leftSz||22)); }catch(e){}
  try{ localStorage.setItem('su_hdr_right_img', String(s.rightImg||'')); }catch(e){}
  try{ localStorage.setItem('su_hdr_right_size', String(s.rightSz||32)); }catch(e){}
  try{ localStorage.setItem('su_hdr_bg_img', String(s.bgImg||'')); }catch(e){}
  try{ localStorage.setItem('su_hdr_height', String(s.hH||0)); }catch(e){}
  try{ localStorage.setItem('su_hdr_fx', String(s.fx||'classic')); }catch(e){}
  try{ localStorage.setItem('su_hdr_c1', String(s.c1||'#1e3a8a')); }catch(e){}
  try{ localStorage.setItem('su_hdr_c2', String(s.c2||'#2563eb')); }catch(e){}
  try{ localStorage.setItem('su_hdr_sync_theme', s.sync ? '1':'0'); }catch(e){}
  // 전체 테마 변수(선택 프리셋에 themeVars가 있으면 적용)
  try{
    if(s.themeVars && typeof s.themeVars==='object'){
      localStorage.setItem('su_theme_vars_v1', JSON.stringify(s.themeVars));
    } else {
      localStorage.removeItem('su_theme_vars_v1');
    }
  }catch(e){}
  try{ window._applyThemeVars && window._applyThemeVars(); }catch(e){}
  try{ if(typeof window._applyHeaderSettings==='function') window._applyHeaderSettings(); }catch(e){}
}
function _hdrEnsurePresets(){
  let presets=_hdrPresetsLoad();
  let sel=_hdrPresetSelLoad();
  if(!presets.length){
    const snap=_hdrPresetGetCurrentSnapshot();
    presets=[{id:_hdrPresetUid(), name:'기본', createdAt:Date.now(), ...snap}];
    sel=presets[0].id;
    _hdrPresetsSave(presets);
    _hdrPresetSelSave(sel);
  }
  if(!sel || !presets.some(p=>p.id===sel)){
    sel=presets[0]?.id||'';
    _hdrPresetSelSave(sel);
  }
  // 테마팩 1회 자동 설치
  try{
    // v2: 신규 프리셋(여름방학 등) 자동 추가를 위해 버전 키를 올림
    if(localStorage.getItem('su_hdr_theme_pack_installed_v3')!=='1'){
      const out = _hdrPresetInstallThemePack(presets);
      if(out && out.changed){
        presets = out.presets;
        _hdrPresetsSave(presets);
      }
      localStorage.setItem('su_hdr_theme_pack_installed_v3','1');
    }
  }catch(e){}
  return {presets, sel};
}

// 시즌/기념일/스타크래프트 테마팩 생성
function _hdrPresetInstallThemePack(presets){
  const _existsByName = (nm)=> (presets||[]).some(p=>String(p.name||'')===nm);
  // 색 유틸
  const _hexToRgb=(hex)=>{ const h=String(hex||'').replace('#','').trim(); if(!/^[0-9a-fA-F]{6}$/.test(h)) return null; return {r:parseInt(h.slice(0,2),16),g:parseInt(h.slice(2,4),16),b:parseInt(h.slice(4,6),16)}; };
  const _rgbToHex=(r,g,b)=>{ const to=(n)=>Math.max(0,Math.min(255,Math.round(n))).toString(16).padStart(2,'0'); return `#${to(r)}${to(g)}${to(b)}`; };
  const _mix=(a,b,t)=>{ const A=_hexToRgb(a),B=_hexToRgb(b); if(!A||!B) return a||b||'#2563eb'; return _rgbToHex(A.r+(B.r-A.r)*t,A.g+(B.g-A.g)*t,A.b+(B.b-A.b)*t); };
  const _darken=(hex,t)=>_mix(hex,'#000000',t);
  const _lighten=(hex,t)=>_mix(hex,'#ffffff',t);
  const mkThemeVars=(accent)=>{
    return {
      '--blue': accent,
      '--blue-d': _darken(accent, 0.18),
      '--blue-l': _lighten(accent, 0.86),
      '--blue-ll': _lighten(accent, 0.92),
    };
  };
  const add=(name, opt)=>{
    if(_existsByName(name)) return false;
    const id=_hdrPresetUid();
    const base = _hdrPresetGetCurrentSnapshot();
    const accent = opt.accent || (opt.c2||'#2563eb');
    const themeVars = {
      ...(opt.themeVars||{}),
      ...(opt.fullTheme?{
        '--bg': opt.fullTheme.bg||'#f0f2f5',
        '--surface': opt.fullTheme.surface||'#f7f9fc',
        '--border': opt.fullTheme.border||'#e4e8ee',
        '--border2': opt.fullTheme.border2||'#cdd3dc',
        '--gold': opt.fullTheme.gold||'#d97706',
        '--gold-bg': opt.fullTheme.goldBg||'#fffbeb',
        '--gold-b': opt.fullTheme.goldB||'#fde68a',
      }:{}),
      ...mkThemeVars(accent),
      ...(opt.extraVars||{})
    };
    presets.push({
      ...base,
      id,
      name,
      createdAt: Date.now(),
      fx: opt.fx || base.fx,
      c1: opt.c1 || base.c1,
      c2: opt.c2 || base.c2,
      sync: true,
      themeVars
    });
    return true;
  };
  let changed=false;
  // 4계절
  changed = add('🌸 봄', {fx:'aurora', c1:'#22c55e', c2:'#f472b6', accent:'#22c55e', fullTheme:{bg:'#f3fff6',surface:'#f0fdf4',border:'#d1fae5',border2:'#86efac',gold:'#d97706',goldBg:'#fffbeb',goldB:'#fde68a'}}) || changed;
  changed = add('🏖️ 여름', {fx:'mesh', c1:'#0ea5e9', c2:'#22c55e', accent:'#0ea5e9', fullTheme:{bg:'#f0f9ff',surface:'#eff6ff',border:'#dbeafe',border2:'#93c5fd',gold:'#0891b2',goldBg:'#ecfeff',goldB:'#67e8f9'}}) || changed;
  changed = add('🏝️ 여름방학', {fx:'aurora', c1:'#38bdf8', c2:'#fbbf24', accent:'#f59e0b', fullTheme:{bg:'#f0f9ff',surface:'#ffffff',border:'#dbeafe',border2:'#93c5fd',gold:'#f59e0b',goldBg:'#fffbeb',goldB:'#fde68a'}}) || changed;
  changed = add('⛄ 겨울방학', {fx:'glass', c1:'#2563eb', c2:'#cbd5e1', accent:'#38bdf8', fullTheme:{bg:'#f8fafc',surface:'#f1f5f9',border:'#e2e8f0',border2:'#cbd5e1',gold:'#38bdf8',goldBg:'#eff6ff',goldB:'#93c5fd'}}) || changed;
  changed = add('🍁 가을', {fx:'stripes', c1:'#ea580c', c2:'#b45309', accent:'#ea580c', fullTheme:{bg:'#fff7ed',surface:'#fffbeb',border:'#fed7aa',border2:'#fdba74',gold:'#b45309',goldBg:'#fffbeb',goldB:'#fde68a'}}) || changed;
  changed = add('❄️ 겨울', {fx:'glass', c1:'#2563eb', c2:'#94a3b8', accent:'#2563eb', fullTheme:{bg:'#f8fafc',surface:'#f1f5f9',border:'#e2e8f0',border2:'#cbd5e1',gold:'#2563eb',goldBg:'#eff6ff',goldB:'#93c5fd'}}) || changed;
  // 기념일/데이
  changed = add('🎄 크리스마스', {fx:'mesh', c1:'#16a34a', c2:'#dc2626', accent:'#16a34a', fullTheme:{bg:'#f0fdf4',surface:'#ecfdf5',border:'#bbf7d0',border2:'#86efac',gold:'#16a34a',goldBg:'#f0fdf4',goldB:'#bbf7d0'}, extraVars:{'--red':'#dc2626'}}) || changed;
  changed = add('🧒 어린이날', {fx:'aurora', c1:'#ff4b6e', c2:'#38bdf8', accent:'#ff4b6e', fullTheme:{bg:'#fff1f2',surface:'#ffe4e6',border:'#fecdd3',border2:'#fda4af',gold:'#ff4b6e',goldBg:'#fff1f2',goldB:'#fecdd3'}}) || changed;
  changed = add('🌹 어버이날', {fx:'glass', c1:'#db2777', c2:'#f43f5e', accent:'#db2777', fullTheme:{bg:'#fff1f2',surface:'#ffe4e6',border:'#fecdd3',border2:'#fda4af',gold:'#db2777',goldBg:'#fff1f2',goldB:'#fecdd3'}}) || changed;
  changed = add('🇰🇷 광복절', {fx:'stripes', c1:'#1d4ed8', c2:'#dc2626', accent:'#1d4ed8', fullTheme:{bg:'#f8fafc',surface:'#f1f5f9',border:'#e2e8f0',border2:'#cbd5e1',gold:'#1d4ed8',goldBg:'#eff6ff',goldB:'#93c5fd'}, extraVars:{'--red':'#dc2626'}}) || changed;
  changed = add('🔤 한글날', {fx:'glass', c1:'#7c3aed', c2:'#fbbf24', accent:'#7c3aed', fullTheme:{bg:'#faf5ff',surface:'#f3e8ff',border:'#e9d5ff',border2:'#d8b4fe',gold:'#fbbf24',goldBg:'#fffbeb',goldB:'#fde68a'}}) || changed;
  changed = add('✊ 3.1절', {fx:'stripes', c1:'#111827', c2:'#e5e7eb', accent:'#111827', fullTheme:{bg:'#f8fafc',surface:'#f1f5f9',border:'#e2e8f0',border2:'#cbd5e1',gold:'#111827',goldBg:'#f1f5f9',goldB:'#cbd5e1'}}) || changed;
  changed = add('🪷 석가탄신일', {fx:'aurora', c1:'#a855f7', c2:'#22c55e', accent:'#a855f7', fullTheme:{bg:'#faf5ff',surface:'#f3e8ff',border:'#e9d5ff',border2:'#d8b4fe',gold:'#22c55e',goldBg:'#f0fdf4',goldB:'#bbf7d0'}}) || changed;
  changed = add('🤍 화이트데이', {fx:'glass', c1:'#38bdf8', c2:'#ffffff', accent:'#38bdf8', fullTheme:{bg:'#ffffff',surface:'#f8fafc',border:'#e2e8f0',border2:'#cbd5e1',gold:'#38bdf8',goldBg:'#f0f9ff',goldB:'#bae6fd'}}) || changed;
  changed = add('💘 발렌타인데이', {fx:'aurora', c1:'#e11d48', c2:'#fb7185', accent:'#e11d48', fullTheme:{bg:'#fff1f2',surface:'#ffe4e6',border:'#fecdd3',border2:'#fda4af',gold:'#e11d48',goldBg:'#fff1f2',goldB:'#fecdd3'}}) || changed;
  changed = add('💋 키스데이', {fx:'aurora', c1:'#a855f7', c2:'#fb7185', accent:'#a855f7', fullTheme:{bg:'#faf5ff',surface:'#f3e8ff',border:'#e9d5ff',border2:'#d8b4fe',gold:'#a855f7',goldBg:'#faf5ff',goldB:'#e9d5ff'}}) || changed;
  // 스타크래프트
  changed = add('🛡️ 스타크래프트: 테란', {fx:'mesh', c1:'#0f172a', c2:'#2563eb', accent:'#2563eb', fullTheme:{bg:'#f8fafc',surface:'#f1f5f9',border:'#e2e8f0',border2:'#cbd5e1',gold:'#2563eb',goldBg:'#eff6ff',goldB:'#93c5fd'}}) || changed;
  changed = add('🧬 스타크래프트: 저그', {fx:'aurora', c1:'#7c3aed', c2:'#22c55e', accent:'#7c3aed', fullTheme:{bg:'#faf5ff',surface:'#f3e8ff',border:'#e9d5ff',border2:'#d8b4fe',gold:'#7c3aed',goldBg:'#faf5ff',goldB:'#e9d5ff'}}) || changed;
  changed = add('✨ 스타크래프트: 프로토스', {fx:'glass', c1:'#1d4ed8', c2:'#fbbf24', accent:'#1d4ed8', fullTheme:{bg:'#fffbeb',surface:'#fef3c7',border:'#fde68a',border2:'#fbbf24',gold:'#fbbf24',goldBg:'#fffbeb',goldB:'#fde68a'}}) || changed;
  changed = add('🎲 스타크래프트: 랜덤', {fx:'stripes', c1:'#64748b', c2:'#2563eb', accent:'#64748b', fullTheme:{bg:'#f8fafc',surface:'#f1f5f9',border:'#e2e8f0',border2:'#cbd5e1',gold:'#64748b',goldBg:'#f1f5f9',goldB:'#cbd5e1'}}) || changed;

  return {presets, changed};
}

// 설정 화면에서 수동으로 테마팩 다시 생성/추가하고 싶을 때
window.hdrPresetInstallThemePack = function(){
  const presets=_hdrPresetsLoad();
  const out=_hdrPresetInstallThemePack(presets);
  if(out && out.changed){
    _hdrPresetsSave(out.presets);
    try{ if(typeof showToast==='function') showToast('테마 프리셋이 추가되었습니다.'); }catch(e){}
    try{ render(); }catch(e){}
  } else {
    alert('이미 테마 프리셋이 추가되어 있습니다.');
  }
};
window.hdrPresetSelect = function(id){
  const {presets}=_hdrEnsurePresets();
  const p = presets.find(x=>x.id===id) || presets[0];
  if(!p) return;
  _hdrPresetSelSave(p.id);
  _hdrPresetApplySnapshot(p);
  try{ render(); }catch(e){}
};
window.hdrPresetAdd = function(){
  const name = prompt('헤더 프리셋 이름');
  if(name===null) return;
  const nm=String(name||'').trim();
  if(!nm) return;
  const {presets}=_hdrEnsurePresets();
  const snap=_hdrPresetGetCurrentSnapshot();
  const p={id:_hdrPresetUid(), name:nm, createdAt:Date.now(), ...snap};
  const next=[...presets, p];
  _hdrPresetsSave(next);
  _hdrPresetSelSave(p.id);
  try{ render(); }catch(e){}
};
window.hdrPresetRename = function(){
  const {presets, sel}=_hdrEnsurePresets();
  const idx=presets.findIndex(p=>p.id===sel);
  if(idx<0) return;
  const name = prompt('프리셋 이름 변경', presets[idx].name||'');
  if(name===null) return;
  const nm=String(name||'').trim();
  if(!nm) return;
  presets[idx]={...presets[idx], name:nm};
  _hdrPresetsSave(presets);
  try{ render(); }catch(e){}
};
window.hdrPresetSaveCurrent = function(){
  const {presets, sel}=_hdrEnsurePresets();
  const idx=presets.findIndex(p=>p.id===sel);
  if(idx<0) return;
  const snap=_hdrPresetGetCurrentSnapshot();
  presets[idx]={...presets[idx], ...snap};
  _hdrPresetsSave(presets);
  try{ if(typeof showToast==='function') showToast('프리셋 저장됨'); }catch(e){}
  try{ render(); }catch(e){}
};
window.hdrPresetDelete = function(){
  const {presets, sel}=_hdrEnsurePresets();
  if(presets.length<=1) return alert('프리셋은 최소 1개가 필요합니다.');
  const cur=presets.find(p=>p.id===sel);
  if(!confirm(`"${cur?.name||'프리셋'}" 프리셋을 삭제할까요?`)) return;
  const next=presets.filter(p=>p.id!==sel);
  _hdrPresetsSave(next);
  _hdrPresetSelSave(next[0]?.id||'');
  // 삭제 후 첫 프리셋 적용
  try{ _hdrPresetApplySnapshot(next[0]); }catch(e){}
  try{ render(); }catch(e){}
};

// ─────────────────────────────────────────────────────────────
// (요청사항) 설정 동기화: 다른 기기/모바일/태블릿에 적용할 수 있도록 내보내기/가져오기(코드)
// - 데이터(경기 기록)는 포함하지 않고 "설정(localStorage)"만 대상
// ─────────────────────────────────────────────────────────────
window.cfgExportSettingsCode = function(){
  const out = {};
  try{
    for(let i=0;i<localStorage.length;i++){
      const k = localStorage.key(i);
      if(!k) continue;
      if(/^su_/.test(k) || /^cfg_/.test(k)){
        out[k] = localStorage.getItem(k);
      }
    }
  }catch(e){}
  try{
    // LZString은 index.html에 포함되어 있음
    return LZString.compressToBase64(JSON.stringify(out));
  }catch(e){
    return '';
  }
};
window.cfgFillSettingsCode = function(){
  const ta = document.getElementById('cfg-sync-code');
  if(!ta) return;
  const code = window.cfgExportSettingsCode();
  ta.value = code || '';
  try{ ta.focus(); ta.select(); }catch(e){}
};
window.cfgCopySettingsCode = async function(){
  const ta = document.getElementById('cfg-sync-code');
  if(!ta) return;
  try{
    await navigator.clipboard.writeText(ta.value||'');
    alert('복사됨');
  }catch(e){
    alert('복사 실패: 브라우저 권한 문제일 수 있어요.');
  }
};
window.cfgImportSettingsCode = function(){
  const ta = document.getElementById('cfg-sync-code');
  if(!ta) return;
  const code = String(ta.value||'').trim();
  if(!code) return alert('가져올 코드가 없습니다.');
  let obj=null;
  try{
    const json = LZString.decompressFromBase64(code);
    obj = JSON.parse(json||'{}');
  }catch(e){
    return alert('코드 해석 실패: 형식이 올바르지 않습니다.');
  }
  if(!obj || typeof obj!=='object') return alert('코드 해석 실패');
  if(!confirm('이 코드를 현재 기기에 적용할까요?\n(현재 설정은 덮어씁니다)')) return;
  try{
    Object.keys(obj).forEach(k=>{
      if(!( /^su_/.test(k) || /^cfg_/.test(k) )) return;
      const v = obj[k];
      if(v==null) localStorage.removeItem(k);
      else localStorage.setItem(k, String(v));
    });
  }catch(e){}
  try{ if(typeof window._applyHeaderSettings==='function') window._applyHeaderSettings(); }catch(e){}
  try{ if(typeof window.applyProfileShapeVars==='function') window.applyProfileShapeVars(); }catch(e){}
  try{ if(typeof render==='function') render(); }catch(e){}
  alert('✅ 적용 완료');
};

// 전역 폰트/전역 폰트 크기/전역 UI 배율 관련 로직은
// `js/settings/font-controls.js`, `js/settings/ui-scale-controls.js`로 분리

// ─────────────────────────────────────────────────────────────
// (요청사항) 필터/하위메뉴(접기) 설정
// - su_filter_lock_open:       '1'이면 필터 항상 펼침(접기 버튼 숨김)
// - su_submenu_filter_enabled: '1'이면 하위메뉴를 "필터로 접기" 사용
// ─────────────────────────────────────────────────────────────
window.cfgSetUiFilterMenuSettings = function(){
  const lock = document.getElementById('cfg-filter-lock')?.checked ? '1' : '0';
  const enabled = document.getElementById('cfg-submenu-filter')?.checked ? '1' : '0';
  try{ localStorage.setItem('su_filter_lock_open', lock); }catch(e){}
  try{ localStorage.setItem('su_submenu_filter_enabled', enabled); }catch(e){}
  // 잠금 ON이면 현재 열린 상태로 강제
  if(lock==='1'){
    try{ window._histFilterOpen=true; }catch(e){}
    try{ window._statsFilterOpen=true; }catch(e){}
    try{ window._miniFilterOpen=true; }catch(e){}
    try{ window._indFilterOpen=true; }catch(e){}
    try{ window._gjFilterOpen=true; }catch(e){}
    try{ window._ckFilterOpen=true; }catch(e){}
    try{ window._univmFilterOpen=true; }catch(e){}
    try{ window._proFilterOpen=true; }catch(e){}
    try{ window._compFilterOpen=true; }catch(e){}
  }
  try{ if(typeof render==='function') render(); }catch(e){}
};
window.cfgResetUiFilterMenuSettings = function(){
  try{ localStorage.removeItem('su_filter_lock_open'); }catch(e){}
  try{ localStorage.removeItem('su_submenu_filter_enabled'); }catch(e){}
  try{
    const a=document.getElementById('cfg-filter-lock'); if(a) a.checked=true;
    const b=document.getElementById('cfg-submenu-filter'); if(b) b.checked=true;
  }catch(e){}
  window.cfgSetUiFilterMenuSettings();
};

// ─────────────────────────────────────────────────────────────
// (요청사항) 경기 결과 '자동인식' 호환 옵션
// - su_paste_compat: '1'이면 전각 괄호/🆚/VS 공백 없는 형태 등을 넓게 인식
// ─────────────────────────────────────────────────────────────
window.cfgSetPasteCompatSettings = function(){
  const on = document.getElementById('cfg-paste-compat')?.checked ? '1' : '0';
  try{ localStorage.setItem('su_paste_compat', on); }catch(e){}
};
try{ window.cfgSetPasteCompatSettings(); }catch(e){}
window.cfgResetPasteCompatSettings = function(){
  try{ localStorage.removeItem('su_paste_compat'); }catch(e){}
  try{
    const a=document.getElementById('cfg-paste-compat'); if(a) a.checked=true;
  }catch(e){}
  window.cfgSetPasteCompatSettings();
};

// ─────────────────────────────────────────────────────────────
// (요청사항) 자동인식 보강: 선수 별명 → 실제 선수명 매핑
// - localStorage: su_player_alias_map (JSON)
// ─────────────────────────────────────────────────────────────
const _PAL_KEY = 'su_player_alias_map';
function _palLoad(){
  try{ return JSON.parse(localStorage.getItem(_PAL_KEY)||'{}')||{}; }catch(e){ return {}; }
}
function _palSave(obj){
  try{ localStorage.setItem(_PAL_KEY, JSON.stringify(obj||{})); }catch(e){}
}
window.cfgRenderPlayerAliasMap = function(){
  const box = document.getElementById('cfg-pal-list');
  if(!box) return;
  const m = _palLoad();
  const keys = Object.keys(m).sort((a,b)=>a.localeCompare(b));
  if(!keys.length){
    box.innerHTML = `<div style="font-size:12px;color:var(--gray-l);text-align:center;padding:18px">등록된 별명 매핑 없음</div>`;
    return;
  }
  box.innerHTML = keys.map(k=>{
    const v = String(m[k]||'').trim();
    return `<div style="display:flex;align-items:center;gap:8px;padding:6px 8px;border-bottom:1px solid var(--border)">
      <span style="font-family:monospace;font-size:12px;font-weight:900;color:var(--text2);min-width:90px">${esc(k)}</span>
      <span style="color:var(--gray-l)">→</span>
      <span style="font-size:12px;font-weight:900;color:var(--blue);flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(v)}</span>
      <button class="btn btn-r btn-xs" onclick="cfgDelPlayerAlias('${encodeURIComponent(k)}')">삭제</button>
    </div>`;
  }).join('');
};
window.cfgAddPlayerAlias = function(){
  const a = document.getElementById('cfg-pal-alias');
  const p = document.getElementById('cfg-pal-player');
  const alias = String(a?.value||'').trim();
  const player = String(p?.value||'').trim();
  if(!alias){ if(typeof showToast==='function') showToast('별명을 입력해주세요.'); return; }
  if(!player){ if(typeof showToast==='function') showToast('선수를 선택해주세요.'); return; }
  const m = _palLoad();
  m[alias] = player;
  _palSave(m);
  if(a) a.value='';
  // 검색 input·hidden input 초기화
  const ps = document.getElementById('cfg-pal-player-search');
  if(ps) ps.value = '';
  if(p) p.value = '';
  const dd = document.getElementById('cfg-pal-dropdown');
  if(dd) dd.style.display = 'none';
  window.cfgRenderPlayerAliasMap();
  if(typeof showToast==='function') showToast(`✅ 별명 등록: ${alias} → ${player}`);
};
window.cfgDelPlayerAlias = function(encKey){
  const key = decodeURIComponent(encKey||'');
  const m = _palLoad();
  delete m[key];
  _palSave(m);
  window.cfgRenderPlayerAliasMap();
};
window.cfgResetPlayerAliasMap = function(){
  if(!confirm('선수 별명 매핑을 모두 초기화할까요?')) return;
  try{ localStorage.removeItem(_PAL_KEY); }catch(e){}
  window.cfgRenderPlayerAliasMap();
  if(typeof showToast==='function') showToast('초기화 완료');
};

// ─────────────────────────────────────────────────────────────
// openEP 수정창 전용: 해당 선수의 별명 목록 렌더링 / 추가 / 삭제
// ─────────────────────────────────────────────────────────────
window.epRenderAliasesList = function(playerName){
  const box = document.getElementById('ep-alias-list');
  if(!box) return;
  const m = _palLoad();
  const aliases = Object.keys(m).filter(k => m[k] === playerName).sort((a,b)=>a.localeCompare(b));
  if(!aliases.length){
    box.innerHTML = '<span style="font-size:11px;color:var(--gray-l)">등록된 별명 없음</span>';
    return;
  }
  box.innerHTML = aliases.map(alias=>{
    const safe = alias.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    const enc = encodeURIComponent(alias);
    return `<span style="display:inline-flex;align-items:center;gap:5px;font-size:12px;padding:3px 10px 3px 12px;border-radius:99px;background:var(--white);border:1px solid var(--border);color:var(--text2);white-space:nowrap">
      ${safe}
      <button onclick="epAliasDel('${enc}','${encodeURIComponent(playerName)}')" style="display:inline-flex;align-items:center;justify-content:center;width:14px;height:14px;border-radius:50%;border:none;background:var(--border);color:var(--gray-l);cursor:pointer;font-size:10px;padding:0;line-height:1;flex-shrink:0">✕</button>
    </span>`;
  }).join('');
};

window.epAliasAdd = function(playerName){
  const inp = document.getElementById('ep-alias-input');
  const alias = String(inp ? inp.value : '').trim();
  if(!alias){ if(typeof showToast==='function') showToast('별명을 입력해주세요.'); return; }
  if(!playerName){ return; }
  const m = _palLoad();
  if(m[alias] && m[alias] !== playerName){
    if(!confirm("'" + alias + "'\ub294 \uc774\ubbf8 '" + m[alias] + "'\uc5d0 \ub4f1\ub85d\ub418\uc5b4 \uc788\uc2b5\ub2c8\ub2e4.\n'" + playerName + "'\uc73c\ub85c \ubcc0\uacbd\ud560\uae4c\uc694?")) return;
  }
  m[alias] = playerName;
  _palSave(m);
  if(inp) inp.value = '';
  window.epRenderAliasesList(playerName);
  if(typeof window.cfgRenderPlayerAliasMap==='function') window.cfgRenderPlayerAliasMap();
  if(typeof showToast==='function') showToast('\u2705 \ubcc4\uba85 \ub4f1\ub85d: ' + alias + ' \u2192 ' + playerName);
};

window.epAliasDel = function(encAlias, encPlayer){
  const alias = decodeURIComponent(encAlias||'');
  const playerName = decodeURIComponent(encPlayer||'');
  const m = _palLoad();
  delete m[alias];
  _palSave(m);
  window.epRenderAliasesList(playerName);
  if(typeof window.cfgRenderPlayerAliasMap==='function') window.cfgRenderPlayerAliasMap();
};

// ─────────────────────────────────────────────────────────────
// (요청사항) 자동인식 변환툴: 가공되지 않은 텍스트 → 리포트 포맷
// 규칙은 사용자 메시지의 [출력 가이드라인]을 따른다.
// ─────────────────────────────────────────────────────────────
window.cfgPasteConvertRun = function(){
  const inp = document.getElementById('cfg-paste-conv-in');
  const out = document.getElementById('cfg-paste-conv-out');
  if(!inp || !out) return;
  const raw = String(inp.value||'').trim();
  if(!raw){ out.textContent=''; return; }
  const lines = raw.split(/\r?\n/).map(l=>l.trim()).filter(Boolean);
  const mapFix = (m)=>{
    const s = String(m||'').trim();
    if(!s) return '-';
    const t = s.replace(/[\[\]]/g,'').trim();
    const d = {
      '실피':'실피드','실피드':'실피드',
      '폴':'폴리포이드','폴스':'폴리포이드','폴리':'폴리포이드','폴리포이드':'폴리포이드',
      '제인':'제인스','제인스':'제인스',
      '녹아':'녹아웃','녹아웃':'녹아웃',
      '에티':'애티튜드','애티':'애티튜드','애티튜드':'애티튜드',
      '매치':'매치포인트','매치포인트':'매치포인트'
    };
    return d[t] || t;
  };
  const raceOf = (name)=>{
    try{
      if(typeof players !== 'undefined' && Array.isArray(players)){
        const p = players.find(x=>x && x.name===name);
        const r = (p && p.race) ? String(p.race).trim().toUpperCase() : '';
        if(r==='T'||r==='Z'||r==='P') return r;
      }
    }catch(e){}
    return 'N';
  };
  const parsed = [];
  lines.forEach(line=>{
    // 순번/불필요 텍스트 제거
    line = line
      // [1SET] / [2SET] 같은 세트 표기 제거 (맵 []와 혼동 방지)
      .replace(/^\[\s*\d+\s*set\s*\]\s*/i, '')
      .replace(/^\d+\s*set\s*/i, '')
      // "1경기", "1세트" 제거
      .replace(/^[\d]+\s*(?:경기|세트)\s*/,'')
      .trim();
    // 맵 추출: [맵]
    let map='-';
    const mm = line.match(/\[([^\]]+)\]/);
    if(mm){ map = mapFix(mm[1]); line = line.replace(mm[0],'').trim(); }
    // 전각 괄호/VS 정규화
    line = line.replace(/[（]/g,'(').replace(/[）]/g,')').replace(/🆚/g,'vs');
    // '조기석(승) vs (패)변현제' / '(승)조기석 vs 변현제(패)' 등 대응
    const vs = line.split(/\s*vs\s*/i);
    if(vs.length<2) return;
    const L = vs[0].trim();
    const R = vs.slice(1).join('vs').trim();
    const pick = (s)=>{
      s = s.replace(/\s+/g,' ').trim();
      // 불필요 점수/주석 제거
      s = s.replace(/\b\d+\/\d+\b.*$/,'').trim();
      // (승)/(패) + 이름
      let m = s.match(/^\((승|패)\)\s*(.+)$/);
      if(m) return {res:m[1], name:m[2].trim().replace(/\((승|패)\)/g,'').trim()};
      // 이름 + (승)/(패)
      m = s.match(/^(.+?)\s*\((승|패)\)\s*$/);
      if(m) return {res:m[2], name:m[1].trim().replace(/\((승|패)\)/g,'').trim()};
      return null;
    };
    const p1 = pick(L), p2 = pick(R);
    if(!p1 || !p2 || !p1.name || !p2.name) return;
    let win='', lose='';
    if(p1.res==='승' && p2.res==='패'){ win=p1.name; lose=p2.name; }
    else if(p1.res==='패' && p2.res==='승'){ win=p2.name; lose=p1.name; }
    else return;
    parsed.push({win,lose,map});
  });
  if(!parsed.length){
    out.textContent = '인식된 경기 없음 (형식을 확인해주세요)';
    return;
  }
  // 최종 스코어(첫 경기의 두 선수 기준)
  const A = parsed[0].win;
  const B = parsed[0].lose;
  let aW=0,bW=0;
  parsed.forEach(g=>{
    if(g.win===A) aW++;
    else if(g.win===B) bW++;
  });
  const body = parsed.map(g=>{
    // (요청사항) 전역 자동인식 출력 포맷을 따름
    if(typeof window.autoFormatMatchLine === 'function'){
      return window.autoFormatMatchLine(g.win, g.lose, g.map);
    }
    const wR = raceOf(g.win), lR = raceOf(g.lose);
    return `${g.win}(${wR}) ✅ 🆚️ ⬜ ${g.lose}(${lR}) [${g.map}]`;
  }).filter(Boolean).join('\n');
  const tail = `\n\n[최종 결과] ${A}(${raceOf(A)}) ${aW} : ${bW} ${B}(${raceOf(B)})`;
  out.textContent = body + tail;
};

// ─────────────────────────────────────────────────────────────
// 🎵 유튜브 BGM 설정 저장
// ─────────────────────────────────────────────────────────────
window.cfgSaveBgmSettings = function(){
  const on = document.getElementById('cfg-bgm-on')?.checked ? '1' : '0';
  const sh = document.getElementById('cfg-bgm-shuffle')?.checked ? '1' : '0';
  const vol = parseInt(document.getElementById('cfg-bgm-vol')?.value||'50',10) || 50;
  const list = String(document.getElementById('cfg-bgm-list')?.value||'').trim();
  try{ localStorage.setItem('su_bgm_enabled', on); }catch(e){}
  try{ localStorage.setItem('su_bgm_shuffle', sh); }catch(e){}
  try{ localStorage.setItem('su_bgm_volume', String(Math.max(0,Math.min(100,vol)))); }catch(e){}
  try{ localStorage.setItem('su_bgm_list', list); }catch(e){}
  try{ window.bgmApplySettings && window.bgmApplySettings(); }catch(e){}
  try{ window._scheduleCloudAppSettingsSave && window._scheduleCloudAppSettingsSave(); }catch(e){}
};

// ─────────────────────────────────────────────────────────────
// 📺 SOOP 멀티뷰 설정 저장
// ─────────────────────────────────────────────────────────────
window.cfgSaveSoopSettings = function(){
  let list = String(document.getElementById('cfg-soop-list')?.value||'');
  // (버그픽스) 동일 SOOP 링크 중복 저장 방지 (공백/끝 슬래시 차이 포함)
  const norm = (u)=>{
    u = String(u||'').trim();
    if(!u) return '';
    // 끝 슬래시 제거
    u = u.replace(/\/+$/,'');
    // 해시 제거
    u = u.replace(/#.*$/,'');
    return u;
  };
  const lines = list.split(/\r?\n/).map(norm).filter(Boolean);
  const uniq = [...new Set(lines)];
  list = uniq.join('\n').trim();
  try{
    const ta = document.getElementById('cfg-soop-list');
    if(ta) ta.value = list;
  }catch(e){}
  try{ localStorage.setItem('su_soop_list', list); }catch(e){}
  try{ window.soopApplySettings && window.soopApplySettings(); }catch(e){}
  try{ window._scheduleCloudAppSettingsSave && window._scheduleCloudAppSettingsSave(); }catch(e){}
};

// ─────────────────────────────────────────────
// (요청사항) 결과 붙여넣기 자동 분리 저장 규칙
// - localStorage: su_paste_route_rules
// - 형식(한 줄): /정규식/flags => 모드
//   또는: 키워드 => 모드
// - 모드 예: 개인전, 끝장전, 미니대전, 시빌워, 대학대전, 대학CK, 프로리그, 티어대회, 대회 ...
// ─────────────────────────────────────────────
window.cfgSavePasteRouteRules = function(){
  const v = String(document.getElementById('cfg-paste-route')?.value||'');
  try{ localStorage.setItem('su_paste_route_rules', v); }catch(e){}
};

// ─────────────────────────────────────────────────────────────
// (요청사항) 설정 변경 시 다른 기기 반영: 관리자면 자동 Cloud Save(디바운스)
// - 사용자가 "저장 버튼"을 누르지 않아도 일정 시간 후 fbCloudSave 실행
// ─────────────────────────────────────────────────────────────
window._scheduleCloudAppSettingsSave = function(){
  try{
    if(typeof isLoggedIn==='undefined' || !isLoggedIn) return;
    if(typeof saveCfg!=='function') return;
    // 클라우드 데이터 수신/적용 중 또는 저장 중이면 재업로드(에코) 방지
    if(window._applyingCloudData) return;
    if(window._isSaving) return;
    clearTimeout(window._autoAppSettingsSaveT);
    window._autoAppSettingsSaveT = setTimeout(()=>{
      try{ saveCfg(); }catch(e){}
    }, 450);
  }catch(e){}
};
window.cfgPasteConvertCopy = function(){
  const out = document.getElementById('cfg-paste-conv-out');
  if(!out) return;
  const txt = out.textContent || '';
  if(!txt) return;
  try{
    navigator.clipboard.writeText(txt);
    alert('✅ 복사 완료');
  }catch(e){
    prompt('아래 내용을 복사하세요:', txt);
  }
};

// ─────────────────────────────────────────────────────────────
// (요청사항) 자동인식 출력 포맷(전역) 설정
// - localStorage: su_auto_outfmt (JSON)
// - search-core.js의 autoOutfmtLoad/autoOutfmtSave/autoFormatMatchLine와 연동
// ─────────────────────────────────────────────────────────────
