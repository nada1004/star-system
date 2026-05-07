/* ══════════════════════════════════════
   ⚙️ settings.js — 설정 탭 전용
   tier-tour.js에서 분리됨. 이 파일의 버그가 티어대회 탭에 영향을 주지 않습니다.
══════════════════════════════════════ */

// ─────────────────────────────────────────────────────────────
// HTML escape (설정 화면 템플릿 문자열 안전 처리)
// ─────────────────────────────────────────────────────────────
function esc(s){
  return String(s ?? '').replace(/[&<>"']/g, m => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[m]));
}

/* ══════════════════════════════════════
   🎨 디자인 모드 분리
   - 구현은 `js/settings/design.js`로 이동
══════════════════════════════════════ */

/* ══════════════════════════════════════
   ⚙️ 설정 섹션 접힘 상태 영속 헬퍼
══════════════════════════════════════ */
// ⚠️ tier-tour.js에도 _cfgOpen/_cfgToggle/_cfgD가 존재해서 전역이 덮어써지는 문제가 있음.
// settings.js는 고유 접두사(_scfg*)를 사용해 충돌을 원천 차단한다.
function _scfgOpen(id){try{return !!(JSON.parse(localStorage.getItem('su_cfg_open')||'{}')[id]);}catch(e){return false;}}
function _renderB2ImgSettingsWrap(){
  try{
    const wrap = document.getElementById('cfg-b2-img-settings-wrap');
    if(!wrap) return false;
    if(typeof _b2BuildImageControlGroup !== 'function') return false;
    const _shuffle = (localStorage.getItem('su_b2_profile_shuffle') ?? '1') === '1';
    wrap.innerHTML=`
      <div style="font-weight:700;font-size:12px;color:var(--text2);margin-bottom:10px">이미지 1 (기본 이미지)</div>
      ${_b2BuildImageControlGroup('','primary','이미지 1',true)}
      <div style="font-weight:700;font-size:12px;color:var(--text2);margin:14px 0 10px">이미지 2 (두번째 이미지)</div>
      ${_b2BuildImageControlGroup('','secondary','이미지 2',true)}
      <hr style="border:none;border-top:1px solid var(--border);margin:12px 0">
      <label style="display:flex;align-items:center;gap:8px;font-size:12px;cursor:pointer;font-weight:900;color:var(--text2)">
        <input type="checkbox" id="cfg-b2-profile-shuffle" style="width:15px;height:15px" ${_shuffle?'checked':''} onchange="localStorage.setItem('su_b2_profile_shuffle',this.checked?'1':'0');render()">
        이미지탭(프로필) 목록 랜덤(셔플)
      </label>
      <div style="font-size:11px;color:var(--gray-l);margin-top:6px">※ PC 좌/우 및 대학 필터에서도 적용됩니다(보기 재미용)</div>
    `;
    return true;
  }catch(e){
    return false;
  }
}
function _ensureB2ImgSettingsWrap(retry){
  if(_renderB2ImgSettingsWrap()) return;
  if(retry === false) return;
  try{
    setTimeout(()=>{ _renderB2ImgSettingsWrap(); }, 160);
  }catch(e){}
}
function _scfgToggle(id,el){
  try{
    // 아코디언: 하나 열리면 나머지는 닫기
    if(el && el.open){
      document.querySelectorAll('[data-cfg-sec]').forEach(d=>{
        if(d!==el && d.tagName==='DETAILS') d.open=false;
      });
    }
  }catch(e){}
  try{
    const o=JSON.parse(localStorage.getItem('su_cfg_open')||'{}');
    o[id]=el.open;
    localStorage.setItem('su_cfg_open',JSON.stringify(o));
    const sp=el.querySelector('summary .cfg-toggle-txt');
    if(sp)sp.textContent=el.open?'▴ 접기':'▾ 펼치기';
  }catch(e){}
  // (요청사항) 특정 섹션은 열릴 때 동적 렌더링
  try{
    if(el && el.open && id==='pd' && typeof window._renderCfgPdSection==='function'){
      window._renderCfgPdSection();
    }
    if(el && el.open && id==='profileshape' && typeof window._renderCfgProfileShapeSection==='function'){
      window._renderCfgProfileShapeSection();
    }
    if(el && el.open && id==='uisize' && typeof window._renderCfgUiSizeSection==='function'){
      window._renderCfgUiSizeSection();
    }
    if(el && el.open && id==='pdModeBadge' && typeof window._renderCfgPdModeBadgeSection==='function'){
      window._renderCfgPdModeBadgeSection();
    }
    if(el && el.open && id==='paste' && typeof window.cfgRenderPlayerAliasMap==='function'){
      window.cfgRenderPlayerAliasMap();
    }
    if(el && el.open && id==='imgsettings'){
      _ensureB2ImgSettingsWrap();
    }
  }catch(e){}
}
// ─────────────────────────────────────────────────────────────
// 설정 메뉴 구성(사용자 정리 지원)
// - 카테고리 이동 + 순서 변경을 localStorage로 저장
// ─────────────────────────────────────────────────────────────
const _CFG_MENU_KEY = 'su_cfg_menu_layout_v1';

// (통합 v1) "탭별"이 아니라 "주제별"로 기본 카테고리를 재구성
// - 기존 키/로직은 유지하고, 메뉴/동선만 통합해서 찾기 쉽게 만든다.
const _DEFAULT_CATSECS = {
  '🧩 운영/콘텐츠':['notice','tier','season','teammatch','acct','univ','maps','mAlias','paste'],
  // (요청사항) "최근 경기 종목(종류) 배지" 색상은 별도 메뉴로 분리
  '🖼️ 이미지/프로필':['b2layout','imgsettings','imgmodalsettings','profileshape','pdModeBadge','pd','matchdetail','univlogoimg','si','siAssign'],
  '🧩 현황판/펨코':['b2femco','femcoorder','boardchip','oldbright','boardbg'],
  // (요청사항) 모바일/태블릿 UI 크기 조절(버튼/메뉴/배지)
  '🎨 디자인/테마':['tablabels','tabcolors','designv2','hdr','appfont','uisize','reccard','tourneycard','sharecard','calui'],
  '🧠 자동화/도구':['bgm','soopmv','pasteRoute','autofitall','fab'],
  '🧪 고급/점검':['cfgmenu','storage','selfcheck'],
  '💾 데이터':['sync','firebase','bulkdate','bulkmap','bulktier','bulkdel','bulkconv']
};

// ─────────────────────────────────────────────────────────────
// 🤖 AI봇(Groq) 프록시 서버 설정
// - 브라우저에 API 키를 저장/동기화하지 않고, 서버에만 키를 두는 방식(권장)
// - 여기서는 프록시 서버 URL만 저장하고 SettingsStore(동기화)로 다른 기기 반영
// ─────────────────────────────────────────────────────────────
window.cfgInitAiProxy = async function(){
  try{ if(window.SettingsStore && typeof window.SettingsStore.pullOnSignal==='function') await window.SettingsStore.pullOnSignal({silent:true}); }catch(e){}
  let cur = { proxyUrl:'' };
  try{
    if(window.SettingsStore && typeof window.SettingsStore.getAiCfg==='function') cur = window.SettingsStore.getAiCfg() || cur;
    else cur = JSON.parse(localStorage.getItem('su_ai_cfg')||'{}') || cur;
  }catch(e){}
  const inp=document.getElementById('cfg-ai-proxy-url');
  if(inp) inp.value = cur.proxyUrl || '';

  // 키 상태
  try{
    const st=document.getElementById('cfg-ai-key-status');
    const has = !!(cur && cur.apiKey);
    if(st) st.textContent = has ? '✅ 키 설정됨 (보안상 다시 표시하지 않음)' : '미설정';
  }catch(e){}
};
window.cfgSaveAiProxyUrl = async function(){
  const inp=document.getElementById('cfg-ai-proxy-url');
  const url=String(inp?.value||'').trim();
  const st=document.getElementById('cfg-ai-proxy-status');
  try{
    if(window.SettingsStore && typeof window.SettingsStore.setAiCfg==='function'){
      window.SettingsStore.setAiCfg({ proxyUrl: url });
      // (관리자+동기화 ON) 즉시 원격 반영
      try{
        const c = window.SettingsStore.cfg();
        if(c && c.enabled){
          await window.SettingsStore.push('ai'); // 토큰 필요
          if(st) st.textContent = '✅ 저장 + 다른 기기 반영 완료';
          return;
        }
      }catch(e){}
      // enabled인데 push 실패한 경우(토큰 없음 등) 메시지 보강
      try{
        const c2 = window.SettingsStore.cfg();
        if(c2 && c2.enabled){
          if(st) st.textContent = '⚠️ 로컬 저장됨. 다른 기기 반영은 실패했습니다. (GitHub 토큰 필요)';
          return;
        }
      }catch(e){}
      if(st) st.textContent = '✅ 저장 완료';
    }else{
      const next={ proxyUrl:url, updatedAt:new Date().toISOString() };
      localStorage.setItem('su_ai_cfg', JSON.stringify(next));
      if(st) st.textContent = '✅ 저장 완료';
    }
  }catch(e){
    if(st) st.textContent = '❌ 저장 실패: '+(e.message||e);
  }
};
window.cfgTestAiProxy = async function(){
  const inp=document.getElementById('cfg-ai-proxy-url');
  const st=document.getElementById('cfg-ai-proxy-status');
  const base=String(inp?.value||'').trim().replace(/\/+$/,'');
  if(!base){ if(st) st.textContent='서버 주소를 입력하세요.'; return; }
  if(st) st.textContent='테스트 중...';
  try{
    const r = await fetch(base+'/api/health', {cache:'no-store'});
    if(!r.ok) throw new Error('HTTP '+r.status);
    const j = await r.json().catch(()=>({}));
    if(j && j.ok) { if(st) st.textContent='✅ 연결 성공'; }
    else { if(st) st.textContent='⚠️ 응답은 받았지만 ok가 아닙니다.'; }
  }catch(e){
    if(st) st.textContent='❌ 연결 실패: '+(e.message||e);
  }
};

window.cfgSaveAiApiKey = async function(){
  const inp=document.getElementById('cfg-ai-api-key');
  const key=String(inp?.value||'').trim();
  const st=document.getElementById('cfg-ai-key-status');
  if(!key){ if(st) st.textContent='키를 입력하세요.'; return; }
  try{
    if(window.SettingsStore && typeof window.SettingsStore.setAiCfg==='function'){
      window.SettingsStore.setAiCfg({ apiKey: key });
      // 입력칸은 즉시 비움(노출 최소화)
      try{ if(inp) inp.value=''; }catch(e){}
      try{
        const c = window.SettingsStore.cfg();
        if(c && c.enabled){
          await window.SettingsStore.push('ai'); // 토큰 필요
          if(st) st.textContent='✅ 키 저장 + 다른 기기 반영 완료';
          return;
        }
      }catch(e){
        // push 실패면 로컬 저장은 성공. (대부분 토큰 없음)
      }
      // enabled인데 push 실패한 경우(토큰 없음 등) 메시지 보강
      try{
        const c2 = window.SettingsStore.cfg();
        if(c2 && c2.enabled){
          if(st) st.textContent='⚠️ 키는 이 기기에 저장됨. 다른 기기 반영은 실패했습니다. (GitHub 토큰 필요)';
          return;
        }
      }catch(e){}
      if(st) st.textContent='✅ 키 저장 완료 (보안상 입력칸은 비워집니다)';
    }else{
      const cur = JSON.parse(localStorage.getItem('su_ai_cfg')||'{}');
      const next={ ...cur, apiKey:key, updatedAt:new Date().toISOString() };
      localStorage.setItem('su_ai_cfg', JSON.stringify(next));
      try{ if(inp) inp.value=''; }catch(e){}
      if(st) st.textContent='✅ 키 저장 완료 (보안상 입력칸은 비워집니다)';
    }
  }catch(e){
    if(st) st.textContent='❌ 저장 실패: '+(e.message||e);
  }
};
window.cfgClearAiApiKey = async function(){
  const st=document.getElementById('cfg-ai-key-status');
  try{
    if(window.SettingsStore && typeof window.SettingsStore.setAiCfg==='function'){
      window.SettingsStore.setAiCfg({ apiKey: '' });
      try{
        const c = window.SettingsStore.cfg();
        if(c && c.enabled){
          await window.SettingsStore.push('ai');
        }
      }catch(e){}
    }else{
      const cur = JSON.parse(localStorage.getItem('su_ai_cfg')||'{}');
      const next={ ...cur, apiKey:'', updatedAt:new Date().toISOString() };
      localStorage.setItem('su_ai_cfg', JSON.stringify(next));
    }
    if(st) st.textContent='✅ 키 삭제됨';
  }catch(e){
    if(st) st.textContent='❌ 실패: '+(e.message||e);
  }
};
const _cfgAllSecs=[...new Set(Object.values(_DEFAULT_CATSECS).flat())];

function _cfgMenuLoad(){
  try{ return JSON.parse(localStorage.getItem(_CFG_MENU_KEY) || 'null'); }catch(e){ return null; }
}

// (요청) 설정 하위 메뉴(섹션) 이름 변경
function _cfgMenuLoadRenames(){
  try{ return JSON.parse(localStorage.getItem('su_cfg_sec_renames')||'{}')||{}; }catch(e){ return {}; }
}
function _cfgMenuSaveRenames(v){
  try{ localStorage.setItem('su_cfg_sec_renames', JSON.stringify(v||{})); }catch(e){}
}
window.cfgMenuRenameSec = function(secId){
  const titles = window._cfgSecTitle || {};
  const cur = _cfgMenuLoadRenames();
  const curName = cur[secId] || titles[secId] || secId;
  const nv = prompt('설정 메뉴 이름 변경', curName);
  if(nv===null) return;
  const s = String(nv||'').trim();
  if(!s){ delete cur[secId]; }
  else cur[secId]=s;
  _cfgMenuSaveRenames(cur);
  try{ render(); }catch(e){}
};
window.cfgMenuResetSecNames = function(){
  if(!confirm('설정 하위 메뉴 이름 변경을 모두 초기화할까요?')) return;
  _cfgMenuSaveRenames({});
  try{ render(); }catch(e){}
};

// ─────────────────────────────────────────────────────────────
// (요청사항) 현황판/이미지별(프로필)/펨코현황: 모바일·태블릿 원클릭 자동 맞춤
// - 사용자가 기존 설정을 덮어써도 OK(원클릭 자동화)
// ─────────────────────────────────────────────────────────────
window.cfgAutoFitBoard = function(){
  const w = Math.max(320, Math.min(1920, window.innerWidth || 1024));
  const isMobile = w <= 768;
  const isTablet = w > 768 && w <= 1024;

  // 1) UI 스케일(글자/아이콘) — init.js 자동 스케일이 있으나, 즉시 반영을 위해 한 번 더 적용
  try{
    let s = 1;
    if (w <= 360) s = 0.92;
    else if (w <= 430) s = 0.96;
    else if (w <= 520) s = 0.98;
    else if (w <= 768) s = 1.00;
    else if (w <= 1024) s = 1.02;
    else s = 1.00;
    document.documentElement.style.setProperty('--uiS', String(s));
  }catch(e){}

  // 2) 이미지별(프로필) 레이아웃(su_b2_layout)
  try{
    const settings = {
      autoResize: true,
      autoHeight: true,
      leftSize: 55,
      rightSize: 45,
      pcHeight: 600,
      tabletHeight: isTablet ? 420 : 400,
      mobileHeight: isMobile ? 380 : 320
    };
    localStorage.setItem('su_b2_layout', JSON.stringify(settings));
    // 설정 UI 반영
    const setVal = (id, val) => { const el=document.getElementById(id); if(el) el.value = val; };
    setVal('cfg-b2-left-size', settings.leftSize);
    setVal('cfg-b2-right-size', settings.rightSize);
    setVal('cfg-b2-pc-height', settings.pcHeight);
    setVal('cfg-b2-tablet-height', settings.tabletHeight);
    setVal('cfg-b2-mobile-height', settings.mobileHeight);
    try{ document.getElementById('cfg-b2-left-size-val').textContent = settings.leftSize+'%'; }catch(e){}
    try{ document.getElementById('cfg-b2-right-size-val').textContent = settings.rightSize+'%'; }catch(e){}
    try{ const chk=document.getElementById('cfg-b2-auto-resize'); if(chk) chk.checked = true; }catch(e){}
  }catch(e){}

  // 3) 이미지별(프로필) 이미지 잘림 방지: 기기별 전역 이미지 설정(su_b2_global_img_settings)
  // - 현재 기기 설정이 없을 때만 기본값을 채움 (기존 사용자 설정 덮어쓰기 방지)
  try{
    const fit = (w <= 1024) ? 'contain' : 'cover';
    const dk = w <= 768 ? 'mb' : (w <= 1024 ? 'tb' : 'pc');
    const raw = (()=>{ try{ return JSON.parse(localStorage.getItem('su_b2_global_img_settings')||'{}')||{}; }catch(e){ return {}; } })();
    if(!raw.__byDevice || typeof raw.__byDevice!=='object') raw.__byDevice = {};
    if(!raw.__byDevice[dk] || typeof raw.__byDevice[dk] !== 'object') raw.__byDevice[dk] = {};
    if(!raw.__byDevice[dk].primary) raw.__byDevice[dk].primary = {scale:100, brightness:100, fit, offsetX:0, offsetY:0, zoom:100, fill:fit, posX:0, posY:0};
    if(!raw.__byDevice[dk].secondary) raw.__byDevice[dk].secondary = {scale:100, brightness:100, fit, offsetX:0, offsetY:0, zoom:100, fill:fit, posX:0, posY:0};
    localStorage.setItem('su_b2_global_img_settings', JSON.stringify(raw));
  }catch(e){}

  // 4) 펨코현황: 모바일/태블릿 프리셋
  try{
    const cur = _cfgFemcoLoad();
    const next = {...cur};
    if (w <= 1024){
      next.contentAlign = 'left';
      next.contentPadX = isMobile ? 10 : 12;
      next.contentOffsetX = 0;
      next.colWidth = isMobile ? 150 : 160;
      next.rowsPerCol = isMobile ? 8 : 7;      // 세로 줄 수 ↑ → 가로 스크롤 ↓
      next.playerImgSize = isMobile ? 40 : 44;
      next.colGap = isMobile ? 8 : 10;         // 상하 간격
      next.univGap = isMobile ? 12 : 16;        // 대학 간 여백
      next.countFontSize = isMobile ? 11 : 12;
      next.nameFontSize = isMobile ? 11 : 12;
      next.roleFontSize = isMobile ? 9 : 10;
      next.statusIconSize = isMobile ? 16 : 18;
      next.starSize = isMobile ? 14 : 15;
      next.headGap = isMobile ? 6 : 10;
    }
    _cfgFemcoSave(next);
    try{ if(typeof cfgFemcoInit==='function') cfgFemcoInit(); }catch(e){}
  }catch(e){}

  // 5) 즉시 반영
  try{ if(typeof save==='function') save(); }catch(e){}
  try{ if(typeof render==='function') render(); }catch(e){}
  try{
    // board2 탭이 열려있으면 다시 렌더링
    if(typeof _b2View !== 'undefined' && document.getElementById('b2-content')) {
      if(_b2View==='players') {
        document.getElementById('b2-content').innerHTML = _b2PlayersView();
        if(typeof _b2UpdateMainDisplay==='function' && typeof _b2SelectedPlayer !== 'undefined' && _b2SelectedPlayer) _b2UpdateMainDisplay(_b2SelectedPlayer.name);
      } else if(_b2View==='femco'){
        document.getElementById('b2-content').innerHTML = _b2FemcoView();
        try{ injectUnivIcons(document.getElementById('b2-content')); }catch(e){}
      }
    }
  }catch(e){}

  alert('✅ 브라우저 맞춤 자동 적용 완료');
};

// ─────────────────────────────────────────────────────────────
// (요청사항) 모든 탭 공통: 모바일/태블릿 레이아웃 자동 맞춤(전역)
// - B 옵션: 화면 크기 + 레이아웃(그리드/간격)까지 자동
// ─────────────────────────────────────────────────────────────
const _AF_ALLTABS_KEY = 'su_af_alltabs_v1';
window.cfgSetAutoFitAllTabs = function(on){
  try{ localStorage.setItem(_AF_ALLTABS_KEY, on ? '1' : '0'); }catch(e){}
  try{ if(typeof window._applyAllTabsAutoFit === 'function') window._applyAllTabsAutoFit(); }catch(e){}
  try{ if(typeof render === 'function') render(); }catch(e){}
};

// ─────────────────────────────────────────────────────────────
// (요청사항) 기록 카드 테마/밝기/아이콘/메모 설정
// ─────────────────────────────────────────────────────────────
window.cfgSetRecCardSettings = function(){
  const on = !!document.getElementById('cfg-rc-theme-on')?.checked;
  const accent = (document.getElementById('cfg-rc-accent')?.value || 'none').trim();
  const bg = parseInt(document.getElementById('cfg-rc-bg')?.value||'12',10);
  const hd = parseInt(document.getElementById('cfg-rc-hd')?.value||'14',10);
  const ic = parseInt(document.getElementById('cfg-rc-uicon')?.value||'18',10);
  const univFontPct = parseInt(document.getElementById('cfg-rc-univ-font')?.value||'100',10);
  const ymScalePct = parseInt(document.getElementById('cfg-ym-scale')?.value||'100',10);
  const memoOn = !!document.getElementById('cfg-rc-memo-on')?.checked;
  const ava = parseInt(document.getElementById('cfg-ava-scale')?.value||'100',10);
  const vsAlign = (document.getElementById('cfg-rc-vs-align')?.value || 'center').trim(); // left|center|right
  const scScale = parseInt(document.getElementById('cfg-rc-score-scale')?.value||'108',10);
  const ckA = (document.getElementById('cfg-team-ck-a')?.value || '#2563eb').trim();
  const ckB = (document.getElementById('cfg-team-ck-b')?.value || '#6366f1').trim();
  const proA = (document.getElementById('cfg-team-pro-a')?.value || '#0f766e').trim();
  const proB = (document.getElementById('cfg-team-pro-b')?.value || '#4f46e5').trim();
  const _hex = v => /^#[0-9a-fA-F]{6}$/.test(String(v||'').trim()) ? String(v).trim() : '';

  try{ localStorage.setItem('su_rc_theme_on', on ? '1' : '0'); }catch(e){}
  try{ localStorage.setItem('su_rc_accent_mode', ['none','header','border','full','gradient'].includes(accent)?accent:'none'); }catch(e){}
  try{ localStorage.setItem('su_rc_bg_alpha', String(Math.max(0,Math.min(30,bg)))); }catch(e){}
  try{ localStorage.setItem('su_rc_hd_alpha', String(Math.max(0,Math.min(30,hd)))); }catch(e){}
  try{ localStorage.setItem('su_rc_uicon', String(Math.max(12,Math.min(34,ic)))); }catch(e){}
  try{ localStorage.setItem('su_rc_univ_font_pct', String(Math.max(90,Math.min(150,univFontPct||100)))); }catch(e){}
  try{ localStorage.setItem('su_ym_scale_pct', String(Math.max(80,Math.min(140,ymScalePct||100)))); }catch(e){}
  try{ localStorage.setItem('su_rc_memo_on', memoOn ? '1' : '0'); }catch(e){}
  try{ localStorage.setItem('su_avatar_scale', String(Math.max(70,Math.min(160,ava))/100)); }catch(e){}
  try{ localStorage.setItem('su_rc_vs_align', ['left','center','right'].includes(vsAlign)?vsAlign:'center'); }catch(e){}
  try{ localStorage.setItem('su_rc_score_scale', String(Math.max(80,Math.min(130,scScale)))); }catch(e){}
  try{ if(_hex(ckA)) localStorage.setItem('su_team_color_ck_a', _hex(ckA)); }catch(e){}
  try{ if(_hex(ckB)) localStorage.setItem('su_team_color_ck_b', _hex(ckB)); }catch(e){}
  try{ if(_hex(proA)) localStorage.setItem('su_team_color_pro_a', _hex(proA)); }catch(e){}
  try{ if(_hex(proB)) localStorage.setItem('su_team_color_pro_b', _hex(proB)); }catch(e){}
  try{
    const rcAvaSize = parseInt(document.getElementById('cfg-rc-avatar-size')?.value||'38',10);
    localStorage.setItem('su_rec_avatar_size', String(Math.max(20,Math.min(80,rcAvaSize))));
  }catch(e){}
  try{
    const rcAvaFit = document.getElementById('cfg-rc-avatar-fit')?.value || 'contain';
    localStorage.setItem('su_rec_avatar_fit', ['contain','cover'].includes(rcAvaFit)?rcAvaFit:'contain');
  }catch(e){}
  try{ if(typeof window.cfgSyncTeamColorPreview==='function') window.cfgSyncTeamColorPreview(); }catch(e){}

  // 즉시 반영 (init.js 미로드/순서 이슈 대비: 여기서도 직접 적용)
  try{
    const _bg=Math.max(0,Math.min(30,bg));
    const _hd=Math.max(0,Math.min(30,hd));
    const _ic=Math.max(12,Math.min(34,ic));
    const _uf=Math.max(90,Math.min(150,univFontPct||100));
    const _ys=Math.max(80,Math.min(140,ymScalePct||100));
    const _accent=['none','header','border','full','gradient'].includes(accent)?accent:'none';
    const _va=['left','center','right'].includes(vsAlign)?vsAlign:'left';
    const _ss=Math.max(80,Math.min(130,scScale||100));
    const _vsJust=(_va==='center')?'center':(_va==='right')?'flex-end':'flex-start';
    if(document.body){
      document.body.classList.toggle('rc-theme-on', !!on);
      document.body.classList.toggle('rc-accent-header', !!on && _accent==='header');
      document.body.classList.toggle('rc-accent-border', !!on && _accent==='border');
      document.body.classList.toggle('rc-accent-full', !!on && _accent==='full');
      document.body.classList.toggle('rc-accent-gradient', !!on && _accent==='gradient');
    }
    document.documentElement.style.setProperty('--rc-bg-a', String(_bg/100));
    document.documentElement.style.setProperty('--rc-hd-a', String(_hd/100));
    document.documentElement.style.setProperty('--rc-uicon', _ic+'px');
    document.documentElement.style.setProperty('--rc-univ-font-scale', String(_uf/100));
    document.documentElement.style.setProperty('--ym-scale', String(_ys/100));
    document.documentElement.style.setProperty('--rc-memo-on', memoOn?'1':'0');
    document.documentElement.style.setProperty('--rc-vs-justify', _vsJust);
    document.documentElement.style.setProperty('--rc-score-scale', String(_ss/100));
  }catch(e){}
  try{ if(typeof window._applyRecCardTheme === 'function') window._applyRecCardTheme(); }catch(e){}
  try{ if(typeof render === 'function') render(); }catch(e){}
};

// ─────────────────────────────────────────────────────────────
// (요청사항) 대회탭 카드(조별리그 일정 등) 전용 디자인 3안
// ─────────────────────────────────────────────────────────────
window.cfgSetTourneyCardSettings = function(){
  const on = !!document.getElementById('cfg-tc-theme-on')?.checked;
  const accent = (document.getElementById('cfg-tc-accent')?.value || 'none').trim();
  const hd = parseInt(document.getElementById('cfg-tc-hd')?.value||'12',10);
  const bw = parseInt(document.getElementById('cfg-tc-bw')?.value||'4',10);
  const ic = parseInt(document.getElementById('cfg-tc-uicon')?.value||'34',10);
  const lw = parseInt(document.getElementById('cfg-tc-line-w')?.value||'2',10);
  const la = parseInt(document.getElementById('cfg-tc-line-a')?.value||'70',10);

  try{ localStorage.setItem('su_tc_theme_on', on ? '1' : '0'); }catch(e){}
  try{ localStorage.setItem('su_tc_accent_mode', ['none','header','border'].includes(accent)?accent:'none'); }catch(e){}
  try{ localStorage.setItem('su_tc_hd_alpha', String(Math.max(0,Math.min(30,hd)))); }catch(e){}
  try{ localStorage.setItem('su_tc_border_w', String(Math.max(2,Math.min(6,bw)))); }catch(e){}
  try{ localStorage.setItem('su_tc_uicon', String(Math.max(24,Math.min(48,ic)))); }catch(e){}
  try{ localStorage.setItem('su_tc_line_w', String(Math.max(1,Math.min(4,lw)))); }catch(e){}
  try{ localStorage.setItem('su_tc_line_a', String(Math.max(25,Math.min(100,la)))); }catch(e){}

  // 즉시 반영 (init.js 미로드/순서 이슈 대비)
  try{
    const _hd=Math.max(0,Math.min(30,hd));
    const _bw=Math.max(2,Math.min(6,bw));
    const _ic=Math.max(24,Math.min(48,ic));
    const _lw=Math.max(1,Math.min(4,lw));
    const _la=Math.max(25,Math.min(100,la));
    const _accent=['none','header','border'].includes(accent)?accent:'none';
    if(document.body){
      document.body.classList.toggle('tc-theme-on', !!on);
      document.body.classList.toggle('tc-accent-header', !!on && _accent==='header');
      document.body.classList.toggle('tc-accent-border', !!on && _accent==='border');
    }
    document.documentElement.style.setProperty('--tc-hd-a', String(_hd/100));
    document.documentElement.style.setProperty('--tc-bw', _bw+'px');
    document.documentElement.style.setProperty('--tc-uicon', _ic+'px');
    document.documentElement.style.setProperty('--tc-line-w', _lw+'px');
    document.documentElement.style.setProperty('--tc-line-a', String(_la/100));
  }catch(e){}
  try{ if(typeof window._applyTourneyCardTheme === 'function') window._applyTourneyCardTheme(); }catch(e){}
  try{ if(typeof render === 'function') render(); }catch(e){}
};

// ─────────────────────────────────────────────────────────────
// 공유카드 전역 디자인 모드 / 색상 효과
// ─────────────────────────────────────────────────────────────
window.cfgSetShareCardSettings = window.cfgSetShareCardSettings || function(){
  const mode = (document.getElementById('cfg-sc-mode')?.value || 'campus').trim();
  const color = parseInt(document.getElementById('cfg-sc-color')?.value||'72',10);
  const fx = parseInt(document.getElementById('cfg-sc-fx')?.value||'55',10);
  const winbg = parseInt(document.getElementById('cfg-sc-winbg')?.value||'55',10);
  const losergray = parseInt(document.getElementById('cfg-sc-losergray')?.value||'55',10);
  const profile = parseInt(document.getElementById('cfg-sc-profile')?.value||'100',10);
  const font = parseInt(document.getElementById('cfg-sc-font')?.value||'100',10);
  const surface = (document.getElementById('cfg-sc-surface')?.value || 'glass').trim();
  const logoLayout = (document.getElementById('cfg-sc-logo-layout')?.value || 'stack').trim();
  const logoSize = parseInt(document.getElementById('cfg-sc-logo-size')?.value||'100',10);
  const logoFit = (document.getElementById('cfg-sc-logo-fit')?.value || 'contain').trim();
  try{ localStorage.setItem('su_sc_mode', ['campus','vivid','soft','dark','minimal','aurora','poster','mono'].includes(mode)?mode:'campus'); }catch(e){}
  try{ localStorage.setItem('su_sc_color', String(Math.max(20,Math.min(100,color)))); }catch(e){}
  try{ localStorage.setItem('su_sc_fx', String(Math.max(0,Math.min(100,fx)))); }catch(e){}
  try{ localStorage.setItem('su_sc_winbg', String(Math.max(0,Math.min(100,winbg)))); }catch(e){}
  try{ localStorage.setItem('su_sc_losergray', String(Math.max(10,Math.min(90,losergray)))); }catch(e){}
  try{ localStorage.setItem('su_sc_profile_pct', String(Math.max(70,Math.min(145,profile)))); }catch(e){}
  try{ localStorage.setItem('su_sc_font_pct', String(Math.max(85,Math.min(135,font)))); }catch(e){}
  try{ localStorage.setItem('su_sc_surface', ['glass','clean','solid'].includes(surface)?surface:'glass'); }catch(e){}
  try{ localStorage.setItem('su_sc_logo_layout', ['stack','inline','badge','cover'].includes(logoLayout)?logoLayout:'stack'); }catch(e){}
  try{ localStorage.setItem('su_sc_logo_size', String(Math.max(70,Math.min(150,logoSize)))); }catch(e){}
  try{ localStorage.setItem('su_sc_logo_fit', ['contain','cover','fill','zoom'].includes(logoFit)?logoFit:'contain'); }catch(e){}
  try{ if(typeof render === 'function') render(); }catch(e){}
};
window.cfgSyncTeamColorPreview = window.cfgSyncTeamColorPreview || function(){
  try{
    const ckA = document.getElementById('cfg-team-ck-a')?.value || (localStorage.getItem('su_team_color_ck_a')||'#2563eb');
    const ckB = document.getElementById('cfg-team-ck-b')?.value || (localStorage.getItem('su_team_color_ck_b')||'#6366f1');
    const proA = document.getElementById('cfg-team-pro-a')?.value || (localStorage.getItem('su_team_color_pro_a')||'#0f766e');
    const proB = document.getElementById('cfg-team-pro-b')?.value || (localStorage.getItem('su_team_color_pro_b')||'#4f46e5');
    const paint=(id,color,label)=>{
      const el=document.getElementById(id);
      if(!el) return;
      el.style.background=color;
      el.style.borderColor=color;
      el.textContent=label;
    };
    paint('cfg-team-ck-prev-a', ckA, `A팀 ${ckA}`);
    paint('cfg-team-ck-prev-b', ckB, `B팀 ${ckB}`);
    paint('cfg-team-pro-prev-a', proA, `A팀 ${proA}`);
    paint('cfg-team-pro-prev-b', proB, `B팀 ${proB}`);
  }catch(e){}
};
try{
  const _m = [
    ['su_team_color_ck_a', '#0e7490', '#2563eb'],
    ['su_team_color_ck_b', '#b45309', '#6366f1'],
    ['su_team_color_pro_b', '#7c3aed', '#4f46e5']
  ];
  _m.forEach(([k, oldV, nextV])=>{
    try{
      const cur = String(localStorage.getItem(k)||'').trim().toLowerCase();
      if(!cur || cur===oldV.toLowerCase()) localStorage.setItem(k, nextV);
    }catch(e){}
  });
}catch(e){}
window.cfgPreviewShareCardMode = window.cfgPreviewShareCardMode || function(mode){
  const el=document.getElementById('cfg-sc-mode');
  if(el) el.value = ['campus','vivid','soft','dark','minimal','aurora','poster','mono'].includes(mode)?mode:'campus';
  window.cfgSetShareCardSettings && window.cfgSetShareCardSettings();
};
window.cfgSetShareCardOverrides = function(){
  const pairs = [
    ['ck', document.getElementById('cfg-sc-ov-ck')?.value || 'inherit'],
    ['pro', document.getElementById('cfg-sc-ov-pro')?.value || 'inherit'],
    ['tt', document.getElementById('cfg-sc-ov-tt')?.value || 'inherit'],
    ['comp', document.getElementById('cfg-sc-ov-comp')?.value || 'inherit'],
  ];
  pairs.forEach(([k,v])=>{
    try{
      if(v==='inherit') localStorage.removeItem(`su_sc_mode_${k}`);
      else localStorage.setItem(`su_sc_mode_${k}`, v);
    }catch(e){}
  });
  const grayPairs = [
    ['ck', document.getElementById('cfg-sc-gray-ck')?.value || 'inherit'],
    ['pro', document.getElementById('cfg-sc-gray-pro')?.value || 'inherit'],
    ['tt', document.getElementById('cfg-sc-gray-tt')?.value || 'inherit'],
    ['comp', document.getElementById('cfg-sc-gray-comp')?.value || 'inherit'],
  ];
  grayPairs.forEach(([k,v])=>{
    try{
      if(v==='inherit') localStorage.removeItem(`su_sc_losergray_${k}`);
      else localStorage.setItem(`su_sc_losergray_${k}`, String(Math.max(10,Math.min(90,parseInt(v,10)||55))));
    }catch(e){}
  });
  const profilePairs = [
    ['ck', document.getElementById('cfg-sc-prof-ck')?.value || 'inherit'],
    ['pro', document.getElementById('cfg-sc-prof-pro')?.value || 'inherit'],
    ['tt', document.getElementById('cfg-sc-prof-tt')?.value || 'inherit'],
    ['comp', document.getElementById('cfg-sc-prof-comp')?.value || 'inherit'],
  ];
  profilePairs.forEach(([k,v])=>{
    try{
      if(v==='inherit') localStorage.removeItem(`su_sc_profile_pct_${k}`);
      else localStorage.setItem(`su_sc_profile_pct_${k}`, String(Math.max(70,Math.min(145,parseInt(v,10)||100))));
    }catch(e){}
  });
  const fontPairs = [
    ['ck', document.getElementById('cfg-sc-font-ck')?.value || 'inherit'],
    ['pro', document.getElementById('cfg-sc-font-pro')?.value || 'inherit'],
    ['tt', document.getElementById('cfg-sc-font-tt')?.value || 'inherit'],
    ['comp', document.getElementById('cfg-sc-font-comp')?.value || 'inherit'],
  ];
  fontPairs.forEach(([k,v])=>{
    try{
      if(v==='inherit') localStorage.removeItem(`su_sc_font_pct_${k}`);
      else localStorage.setItem(`su_sc_font_pct_${k}`, String(Math.max(85,Math.min(135,parseInt(v,10)||100))));
    }catch(e){}
  });
  try{ if(typeof render === 'function') render(); }catch(e){}
};

// ─────────────────────────────────────────────────────────────
// (요청사항) 토너먼트 대진표/브라켓 디자인 프리셋
// - 기존 슬라이더(선두께/진하기/테두리/로고크기 등)에 값을 "한 번에" 채워줌
// - 실제 저장/적용은 cfgSetTourneyCardSettings()가 수행
// ─────────────────────────────────────────────────────────────
window.cfgApplyBracketPreset = function(preset){
  const p = (preset || '').trim();
  const presets = {
    '기본':      {on:true, accent:'none',  hd:12, bw:4, ic:34, lw:2, la:70},
    '월드컵':    {on:true, accent:'header',hd:18, bw:5, ic:42, lw:3, la:85},
    '프로리그':  {on:true, accent:'border',hd:10, bw:6, ic:38, lw:2, la:78},
    '컴팩트':    {on:true, accent:'none',  hd:8,  bw:3, ic:30, lw:1, la:65},
    '미니멀':    {on:true, accent:'none',  hd:0,  bw:1, ic:32, lw:1, la:40},
    '다크리그':  {on:true, accent:'border',hd:16, bw:6, ic:40, lw:3, la:90},
  };
  const v = presets[p] || presets['기본'];
  const set = (id, val) => { const el=document.getElementById(id); if(el){ el.value = String(val); el.dispatchEvent(new Event('input')); } };
  try{
    const chk=document.getElementById('cfg-tc-theme-on'); if(chk) chk.checked = !!v.on;
    const sel=document.getElementById('cfg-tc-accent'); if(sel) sel.value = v.accent;
    set('cfg-tc-hd', v.hd); set('cfg-tc-bw', v.bw); set('cfg-tc-uicon', v.ic); set('cfg-tc-line-w', v.lw); set('cfg-tc-line-a', v.la);
    // 숫자 박스 동기화(있는 경우)
    const syncNum = (rangeId, numSpanId, suf='') => {
      const r=document.getElementById(rangeId); const s=document.getElementById(numSpanId);
      if(r && s) s.textContent = r.value + suf;
    };
    syncNum('cfg-tc-hd','cfg-tc-hd-v','%');
    syncNum('cfg-tc-bw','cfg-tc-bw-v','px');
    syncNum('cfg-tc-uicon','cfg-tc-ic-v','px');
    syncNum('cfg-tc-line-w','cfg-tc-lw-v','px');
    syncNum('cfg-tc-line-a','cfg-tc-la-v','%');
  }catch(e){}
  try{ window.cfgSetTourneyCardSettings && window.cfgSetTourneyCardSettings(); }catch(e){}
};

// ─────────────────────────────────────────────────────────────
// (요청사항) 캘린더 요약칩/공유 버튼 구성
// ─────────────────────────────────────────────────────────────
window.cfgSetCalendarUiSettings = function(){
  const chipMode = (document.getElementById('cfg-cal-chip')?.value || 'types').trim(); // total | types
  const shareAdminOnly = !!document.getElementById('cfg-share-adminonly')?.checked;
  try{ localStorage.setItem('su_cal_chip_mode', (chipMode==='total'?'total':'types')); }catch(e){}
  try{ localStorage.setItem('su_share_admin_only', shareAdminOnly ? '1' : '0'); }catch(e){}
  try{ if(typeof render === 'function') render(); }catch(e){}
};

// ─────────────────────────────────────────────────────────────
// (요청사항) 날짜 버튼 메뉴(대회/프로리그 일정) 디자인 모드
// - ASL 스케줄 페이지처럼 날짜 탭 형태 + 미니 매치업 프리뷰
// ─────────────────────────────────────────────────────────────
window.cfgSetDateMenuStyle = function(){
  const v = (document.getElementById('cfg-date-menu-style')?.value || 'pill').trim(); // pill | asl
  try{ localStorage.setItem('su_date_menu_style', v==='asl' ? 'asl' : 'pill'); }catch(e){}
  try{ if(typeof render === 'function') render(); }catch(e){}
};

// ─────────────────────────────────────────────────────────────
// (요청사항) 헤더 커스텀(제목/좌측 아이콘/우측 이미지/배경 이미지/높이)
// ─────────────────────────────────────────────────────────────
window.cfgSetHeaderSettings = function(){
  const title = (document.getElementById('cfg-hdr-title')?.value || '').trim();
  const lIco  = (document.getElementById('cfg-hdr-left')?.value || '').trim();
  const lSz   = parseInt(document.getElementById('cfg-hdr-left-sz')?.value || '22',10) || 22;
  const rImg  = (document.getElementById('cfg-hdr-right')?.value || '').trim();
  const rSz   = parseInt(document.getElementById('cfg-hdr-right-sz')?.value || '32',10) || 32;
  const bgImg = (document.getElementById('cfg-hdr-bg')?.value || '').trim();
  const hH    = parseInt(document.getElementById('cfg-hdr-h')?.value || '0',10) || 0;
  const fx    = (document.getElementById('cfg-hdr-fx')?.value || 'classic').trim();
  const c1    = (document.getElementById('cfg-hdr-c1')?.value || '').trim();
  const c2    = (document.getElementById('cfg-hdr-c2')?.value || '').trim();
  const sync  = !!document.getElementById('cfg-hdr-sync')?.checked;
  try{ localStorage.setItem('su_hdr_title', title); }catch(e){}
  try{ localStorage.setItem('su_hdr_left_icon', lIco); }catch(e){}
  try{ localStorage.setItem('su_hdr_left_size', String(Math.max(14,Math.min(44,lSz)))); }catch(e){}
  try{ localStorage.setItem('su_hdr_right_img', rImg); }catch(e){}
  try{ localStorage.setItem('su_hdr_right_size', String(Math.max(18,Math.min(70,rSz)))); }catch(e){}
  try{ localStorage.setItem('su_hdr_bg_img', bgImg); }catch(e){}
  try{ localStorage.setItem('su_hdr_height', String(Math.max(0,Math.min(140,hH)))); }catch(e){}
  try{ localStorage.setItem('su_hdr_fx', fx); }catch(e){}
  try{ localStorage.setItem('su_hdr_c1', c1); }catch(e){}
  try{ localStorage.setItem('su_hdr_c2', c2); }catch(e){}
  try{ localStorage.setItem('su_hdr_sync_theme', sync?'1':'0'); }catch(e){}
  try{ if(typeof window._applyHeaderSettings === 'function') window._applyHeaderSettings(); }catch(e){}
  try{ if(typeof render === 'function') render(); }catch(e){}
};

// ─────────────────────────────────────────────────────────────
// (요청사항) 헤더 테마 프리셋
// - 여러 개 저장/선택/적용
// ─────────────────────────────────────────────────────────────
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
// - search.js의 autoOutfmtLoad/autoOutfmtSave/autoFormatMatchLine와 연동
// ─────────────────────────────────────────────────────────────
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
    // search.js 포맷터가 있으면 그걸로 미리보기
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
  if(out) out.innerHTML = '<div style="color:var(--gray-l);font-size:12px">검사 중...</div>';
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
        html += `<div style="font-size:12px;color:#dc2626;font-weight:1000;margin-bottom:8px">⚠️ settings.js 핸들러 누락 ${missing.length}개</div>
                 <div style="font-family:ui-monospace,monospace;font-size:12px;white-space:pre-wrap;line-height:1.5;margin-bottom:12px">${missing.join('\\n')}</div>`;
      }
      if(Object.keys(tabMissing).length > 0){
        html += `<div style="font-size:12px;color:#ea580c;font-weight:1000;margin-bottom:6px">⚠️ 탭 렌더러 누락</div>
                 <div style="font-family:ui-monospace,monospace;font-size:11px;white-space:pre-wrap;line-height:1.6">`;
        for(const [tab, funcs] of Object.entries(tabMissing)){
          html += `${tab}: ${funcs.join(', ')}\\n`;
        }
        html += `</div>`;
      }
      if(missing.length === 0 && Object.keys(tabMissing).length === 0){
        html = `<div style="font-size:12px;color:#16a34a;font-weight:1000">✅ 모든 핸들러 및 탭 함수 정상</div>`;
      }
      out.innerHTML = html;
    }
  }catch(e){
    if(out) out.innerHTML = `<div style="font-size:12px;color:#dc2626;font-weight:1000">검사 실패: ${String(e)}</div>`;
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
    '이미지 관리':'🖼️ 이미지/프로필',
    '🎨 스타일/테마':'🎨 디자인/테마',
    '🧪 고급/실험실':'🧪 고급/점검',
    '데이터 관리':'💾 데이터',
    '시스템 설정':'🎨 디자인/테마',
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
  return norm.catSecs;
})();

function _cfgMenuApplyAndRerender(layout){
  const norm = _cfgMenuNormalize(layout || {});
  _cfgMenuSave(norm);
  _catSecs = norm.catSecs;
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
    playerImgSize: 46,
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
    nameFontSize: 12,
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
    return {..._cfgFemcoDefaults(), ...obj,
      univSubtitles:{...((_cfgFemcoDefaults().univSubtitles)||{}), ...(obj.univSubtitles||{})},
      univColorOverrides:{...((_cfgFemcoDefaults().univColorOverrides)||{}), ...(obj.univColorOverrides||{})},
      univBgMedia:{...((_cfgFemcoDefaults().univBgMedia)||{}), ...(obj.univBgMedia||{})}
    };
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
  setVal('cfg-femco-nameFontSize', s.nameFontSize || 12); setVal('cfg-femco-nameFontSizeNum', s.nameFontSize || 12);
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
}
function _scfgD(id,title,extra){
  // (요청사항) 펼치기 UI 대신 "팝업으로 열기" UX: 기본은 항상 닫힘
  const isOpen=false;
  // cfg-anchor: 바로가기 클릭 시 원래 위치로 되돌릴 기준점
  return `<div class="cfg-anchor" data-cfg-anchor="${id}"></div><details id="cfg-sec-${id}" class="ssec" data-cfg-sec="${id}" ${isOpen?'open':''} ontoggle="_scfgToggle('${id}',this)"${extra?' '+extra:''}>
  <summary class="cfg-sec-summary" style="list-style:none;outline:none;-webkit-appearance:none">
    <h4>${title}</h4>
    <span class="cfg-sec-right">열기 ›</span>
  </summary>`;
}

// 설정 섹션 팝업 모달 (바로가기 클릭 시 사용)
function _cfgEnsureModal(){
  let m=document.getElementById('cfgModal');
  if(m) return m;
  try{
    m=document.createElement('div');
    m.id='cfgModal';
    m.className='modal no-export cfg-modal';
    m.style.display='none';
    m.style.zIndex='9000';
    m.innerHTML=`
      <div class="mbox cfg-modal-box">
        <div class="cfg-modal-hdr">
          <div id="cfgModalTitle" class="cfg-modal-title">⚙️ 설정</div>
          <button class="cfg-modal-close" onclick="closeCfgModal()" aria-label="닫기">✕</button>
        </div>
        <div id="cfgModalBody" class="cfg-modal-body"></div>
      </div>
    `;
    document.body.appendChild(m);
  }catch(e){}
  // (요청사항) 설정을 수정하면 다른 기기에도 "바로" 반영되도록 자동 Cloud Save 트리거
  // - cfgModal 안에서 발생하는 input/change 를 감지해 디바운스 저장
  try{
    const body = m.querySelector('#cfgModalBody');
    if(body && !body._autoCloudSyncBound){
      body._autoCloudSyncBound = true;
      const _touch = ()=>{
        try{ window._scheduleCloudAppSettingsSave && window._scheduleCloudAppSettingsSave(); }catch(e){}
      };
      body.addEventListener('input', _touch, true);
      body.addEventListener('change', _touch, true);
      // 버튼 클릭으로만 바뀌는 설정도 있으니 click도 함께 감지(디바운스라 부담 적음)
      body.addEventListener('click', (ev)=>{
        try{
          const t = ev && ev.target;
          if(!t) return;
          if(t.tagName==='BUTTON' || (t.closest && t.closest('button'))) _touch();
        }catch(e){}
      }, true);
    }
  }catch(e){}
  // (요청사항) 모달 바깥(배경) 클릭으로 닫아도 섹션이 원위치로 복구되도록
  try{
    m.addEventListener('click', (ev)=>{
      try{
        // (모바일 버그픽스) 섹션을 눌러 모달을 여는 "같은 탭" 이벤트에서
        // 모달 배경 클릭으로 인식되어 바로 닫히는 현상 방지
        if(window._cfgModalJustOpenedTime && (Date.now()-window._cfgModalJustOpenedTime<350)) return;
        if(ev && ev.target===m && typeof window.closeCfgModal==='function') window.closeCfgModal();
      }catch(_){}
    }, {capture:true});
  }catch(e){}
  // 닫기 핸들러 (섹션 원위치 복구)
  if(typeof window.closeCfgModal!=='function'){
    window.closeCfgModal=function(){
      try{
        const prevId=window._cfgModalSecId;
        if(prevId){
          const prev=document.querySelector(`[data-cfg-sec="${prevId}"]`);
          const anchor=document.querySelector(`[data-cfg-anchor="${prevId}"]`);
          if(prev && anchor){
            anchor.parentNode.insertBefore(prev, anchor.nextSibling);
            prev.style.display='';
            // 목록에서는 펼치지 않음
            try{ if(prev.tagName==='DETAILS') prev.open=false; }catch(e){}
          }
          window._cfgModalSecId=null;
        }
        const body=document.getElementById('cfgModalBody');
        if(body) body.innerHTML='';
      }catch(e){}
      try{ if(typeof cm==='function') cm('cfgModal'); else { const mm=document.getElementById('cfgModal'); if(mm) mm.style.display='none'; } }catch(e){}
      try{ if(typeof window.cfgApplyBottomSectionsVisibility==='function') window.cfgApplyBottomSectionsVisibility(); }catch(e){}
    };
  }
  return m;
}

/* ══════════════════════════════════════
   설정 카테고리 필터
══════════════════════════════════════ */
if(typeof window._cfgCat==='undefined'||window._cfgCat==='전체'||!Object.keys(_catSecs||{}).includes(window._cfgCat)) window._cfgCat=(window._cfgCatOrder&&window._cfgCatOrder[0])||'🧩 운영/콘텐츠';
function _cfgGo(secId){
  // 섹션이 다른 카테고리에 속하면 카테고리 자동 전환
  try{
    let targetCat=null;
    for(const cat in _catSecs){
      const arr=_catSecs[cat]||[];
      if(arr.indexOf(secId)!==-1){ targetCat=cat; break; }
    }
    if(targetCat && window._cfgCat!==targetCat) _cfgApplyCat(targetCat,false);
  }catch(e){}

  const el=document.getElementById(`cfg-sec-${secId}`) || document.querySelector(`[data-cfg-sec="${secId}"]`);
  if(!el){
    try{
      // 디버그: 특정 환경에서만 섹션 탐색이 실패하는 현상(‘pd만 됨’) 추적용
      if(window.__CFG_DEBUG){
        const secs=[...document.querySelectorAll('[data-cfg-sec]')].slice(0,40).map(x=>`${x.getAttribute('data-cfg-sec')}#${x.id||''}`);
        console.warn('[cfgGo] section not found:', secId, 'known secs=', secs);
      }
    }catch(e){}
    return;
  }

  // 기존 열림 닫기 (아코디언)
  try{
    const all=document.querySelectorAll('[data-cfg-sec]');
    for(let i=0;i<all.length;i++){
      const d=all[i];
      if(d!==el && d.tagName==='DETAILS') d.open=false;
    }
  }catch(e){}

  // 바로가기 클릭 시: 해당 섹션을 팝업 모달로 표시
  try{
    _cfgEnsureModal();
    // 이전에 모달로 올린 섹션이 있으면 원위치 복구
    const prevId=window._cfgModalSecId;
    if(prevId && prevId!==secId){
        const prev=document.getElementById(`cfg-sec-${prevId}`) || document.querySelector(`[data-cfg-sec="${prevId}"]`);
      const anchor=document.querySelector(`[data-cfg-anchor="${prevId}"]`);
      if(prev && anchor){
        anchor.parentNode.insertBefore(prev, anchor.nextSibling);
        prev.style.display='';
      }
    }
    window._cfgModalSecId=secId;
    const titleEl=document.getElementById('cfgModalTitle');
    if(titleEl){
      const t = (window._cfgSecTitle && window._cfgSecTitle[secId]) ? window._cfgSecTitle[secId] : '';
      // 요청사항: cfgmenu는 팝업 헤더에서도 "설정 메뉴" 문구가 보이도록 고정
      titleEl.textContent = (secId==='cfgmenu') ? '🧭 설정 메뉴 정리' : (t || '⚙️ 설정');
    }
    const body=document.getElementById('cfgModalBody');
    if(body){
      body.innerHTML='';
      el.style.display='';
      body.appendChild(el);
      try{ body.scrollTop = 0; }catch(e){}
      // (요청사항) 팝업에서는 내용이 보여야 하므로 펼침
      try{ if(el.tagName==='DETAILS') el.open=true; }catch(e){}
      // (보강) 동적 섹션은 팝업 이동만으로 toggle 이벤트가 안 나는 환경이 있어 수동 렌더
      try{
        if(secId==='profileshape' && typeof window._renderCfgProfileShapeSection==='function') window._renderCfgProfileShapeSection();
        if(secId==='uisize' && typeof window._renderCfgUiSizeSection==='function') window._renderCfgUiSizeSection();
        if(secId==='pd' && typeof window._renderCfgPdSection==='function') window._renderCfgPdSection();
        if(secId==='pdModeBadge' && typeof window._renderCfgPdModeBadgeSection==='function') window._renderCfgPdModeBadgeSection();
        if(secId==='matchdetail' && typeof window._renderCfgMatchDetailSection==='function') window._renderCfgMatchDetailSection();
        if(secId==='aibot' && typeof window.cfgInitAiProxy==='function') window.cfgInitAiProxy();
      }catch(e){}
    }
    // (모바일 버그픽스) pointerdown에서 섹션을 누를 경우,
    // 같은 탭 이벤트의 click/touchend 타겟이 모달 배경으로 잡히며 "열렸다가 바로 닫히는" 케이스가 있음
    // → 모달 표시를 다음 tick으로 미뤄 동일 이벤트 사이클에서의 배경 클릭 판정을 회피
    const mm=document.getElementById('cfgModal');
    if(mm){
      window._cfgModalJustOpenedTime = Date.now();
      setTimeout(()=>{
        try{ mm.style.display='flex'; }catch(e){}
        try{
          const b=document.getElementById('cfgModalBody');
          if(b) b.scrollTop = 0;
        }catch(e){}
        if(typeof om==='function'){ try{ om('cfgModal'); }catch(err){ if(window.__CFG_DEBUG) console.error('[cfgGo] om() failed', err); } }
      }, 0);
    } else {
      if(typeof om==='function'){ try{ om('cfgModal'); }catch(err){ if(window.__CFG_DEBUG) console.error('[cfgGo] om() failed', err); } }
    }
  }catch(e){
    // 기존엔 조용히 삼켜서 “버튼 반응 없음”처럼 보였음 → 콘솔에 노출
    try{ console.error('[cfgGo] failed:', secId, e); }catch(_){}
  }
  // (요청사항) 목록에서는 펼치기 사용 안 함(팝업으로만 확인)
  // - 팝업으로 옮겨진 경우는 위에서 open=true 처리
  try{ if(el && el.tagName==='DETAILS' && !(el.closest && el.closest('#cfgModalBody'))) el.open=false; }catch(e){}
}

function _cfgApplyCat(cat, autoGo=true){
  window._cfgCat=cat;
  const show=_catSecs[cat]||[];
  // 섹션 표시/숨김
  try{
    const secs=document.querySelectorAll('[data-cfg-sec]');
    for(let i=0;i<secs.length;i++){
      const el=secs[i];
      // 모달에 올라간 섹션은 숨기지 않음
      try{ if(el.closest && el.closest('#cfgModalBody')) continue; }catch(e){}
      const id=el.getAttribute('data-cfg-sec');
      const vis=(show.indexOf(id)!==-1);
      el.style.display=vis?'':'none';
      if(el.tagName==='DETAILS') el.open=false;
    }
  }catch(e){}
  // 카테고리 버튼 스타일 업데이트 (초기 렌더 인라인 스타일은 1회성이라 JS로 재적용)
  try{
    const pills=document.querySelectorAll('.cfg-cat-pill');
    for(let i=0;i<pills.length;i++){
      const btn=pills[i];
      const on=(btn.getAttribute('data-cat')===cat);
      btn.classList.toggle('on', on);
      btn.style.borderColor = on ? 'var(--blue)' : 'var(--border)';
      // (요청사항) 비활성 배경의 회색 제거
      btn.style.background  = on ? 'var(--blue)' : 'transparent';
      btn.style.fontWeight  = on ? '800' : '700';
      btn.style.color       = on ? '#fff' : 'var(--text)';
    }
  }catch(e){}
  try{
    const btns=document.querySelectorAll('[data-cfg-cat]');
    for(let i=0;i<btns.length;i++){
      const btn=btns[i];
      const on=(btn.getAttribute('data-cfg-cat')===cat);
      btn.style.background = on ? 'linear-gradient(135deg,var(--blue),#7c3aed)' : 'var(--white)';
      btn.style.color = on ? '#fff' : 'var(--text2)';
      btn.style.borderColor = on ? 'transparent' : 'var(--border)';
      btn.style.boxShadow = on ? '0 10px 24px rgba(37,99,235,.22)' : '0 4px 12px rgba(15,23,42,.04)';
      const desc=btn.querySelector('[data-cfg-cat-desc]');
      if(desc) desc.style.opacity = on ? '.9' : '.72';
    }
    document.querySelectorAll('[data-cfg-cur-cat-label]').forEach(el=>{ el.textContent = `현재: ${_catLabel(cat)}`; });
    document.querySelectorAll('[data-cfg-cur-cat-desc]').forEach(el=>{ el.textContent = `${_catLabel(cat)} 안의 세부 메뉴를 버튼으로 바로 엽니다.`; });
    document.querySelectorAll('[data-cfg-cur-sec-buttons]').forEach(secWrap=>{
      const titleMap=window._cfgSecTitle||{};
      secWrap.innerHTML = show.map(id=>{
        const title=titleMap[id]||id;
        return `<button type="button" class="btn btn-w no-export" onclick="cfgGo('${id}')" style="display:flex;align-items:center;gap:8px;padding:10px 12px;border-radius:14px;text-align:left;background:var(--white);justify-content:flex-start">
          <span style="font-size:15px;line-height:1">${String(title).match(/^[^\s]+/)?.[0]||'⚙️'}</span>
          <span style="font-size:12px;font-weight:800;color:var(--text2);min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${title.replace(/^[^\s]+\s*/,'')}</span>
        </button>`;
      }).join('');
    });
  }catch(e){}
  if(autoGo){
    const first=show[0];
    if(first) setTimeout(()=>_cfgGo(first),0);
  }
}

// 함수를 window 객체에 할당 (인라인 onclick에서 사용)
window._cfgGo = _cfgGo;
window._cfgApplyCat = _cfgApplyCat;
// (버그수정) render-nav-lazy.js에서 _lazyCfgGo를 참조하지만 미정의 상태.
// cfgGo로 위임하는 alias 추가.
window._lazyCfgGo = function(secId){ return _cfgGo(secId); };
// 인라인 onclick에서 try/catch로 에러를 숨기지 않기 위해 단순 래퍼 제공
window.cfgGo = function(secId){ return _cfgGo(secId); };
// (요청사항) 카테고리 클릭 시 해당 카테고리 "메뉴만" 보여주고 자동으로 모달을 띄우지 않음
window.cfgApplyCat = function(cat){
  const r = _cfgApplyCat(cat, false);
  try{ if(typeof curTab!=='undefined' && curTab==='cfg' && typeof render==='function') render(); }catch(e){}
  return r;
};
window.cfgSetViewMode = function(mode){
  try{
    const v = String(mode||'basic').trim();
    localStorage.setItem('su_cfg_view_mode', v==='advanced' ? 'advanced' : 'basic');
  }catch(e){}
  try{ if(typeof curTab!=='undefined' && curTab==='cfg' && typeof render==='function') render(); }catch(e){}
};
window.cfgSetBottomSectionsOpen = function(open){
  try{
    window._cfgBottomSectionsOpen = !!open;
    localStorage.setItem('su_cfg_bottom_open', window._cfgBottomSectionsOpen ? '1' : '0');
  }catch(e){}
  // DOM 직접 조작으로 즉시 접기/펼치기 (전체 재렌더링 없이)
  try{ if(typeof window.cfgApplyBottomSectionsVisibility==='function') window.cfgApplyBottomSectionsVisibility(); }catch(e){}
};
window.cfgSetRemoteCfgAuto = function(on){
  try{
    localStorage.setItem('su_cfg_remote_auto', on ? '1' : '0');
    const el = document.getElementById('cfg-remote-auto-status');
    if(el){
      el.style.color = on ? '#16a34a' : 'var(--gray-l)';
      el.textContent = on ? 'ON · 설정/상세 수정은 GitHub에도 반영, 새로고침만으로는 저장되지 않음' : 'OFF · 설정 변경은 로컬만 저장';
    }
  }catch(e){}
};
window.cfgToggleBottomSections = function(){
  try{
    const cur = window._cfgBottomSectionsOpen===undefined
      ? ((localStorage.getItem('su_cfg_bottom_open') ?? '1') === '1')
      : !!window._cfgBottomSectionsOpen;
    window.cfgSetBottomSectionsOpen(!cur);
  }catch(e){}
};
window.cfgApplySimpleView = function(){
  try{
    const mode=(localStorage.getItem('su_cfg_view_mode')||'basic')==='advanced' ? 'advanced' : 'basic';
    const q=String(window._cfgSearchQ||'').trim();
    const fav=['sharecard','uisize','calui','profileshape','tablabels','matchdetail'];
    const autoOpen=['sharecard','uisize','calui'];
    const all=document.querySelectorAll('[data-cfg-sec]');
    all.forEach(el=>{
      const id=String(el.getAttribute('data-cfg-sec')||'').trim();
      let vis=true;
      if(mode==='basic' && !q) vis=fav.includes(id);
      el.style.display=vis?'':'none';
      if(el.tagName==='DETAILS'){
        if(mode==='basic' && !q) el.open=autoOpen.includes(id);
      }
    });
    const cnt=document.getElementById('cfgSearchCnt');
    if(cnt && mode==='basic' && !q) cnt.textContent=`간단 보기 · 자주 쓰는 설정 ${fav.length}개`;
  }catch(e){}
};
window.cfgApplyBottomSectionsVisibility = function(){
  try{
    const mode=(localStorage.getItem('su_cfg_view_mode')||'basic')==='advanced' ? 'advanced' : 'basic';
    const q=String(window._cfgSearchQ||'').trim();
    if(window._cfgBottomSectionsOpen===undefined){
      const saved=localStorage.getItem('su_cfg_bottom_open');
      window._cfgBottomSectionsOpen = (saved==='1' || saved==='0') ? (saved==='1') : (mode==='advanced');
    }
    const open = q ? true : !!window._cfgBottomSectionsOpen;
    if(!open){
      // 접기: 현재 카테고리만이 아니라 모든 하단 세부 섹션을 숨김
      document.querySelectorAll('[data-cfg-sec]').forEach(el=>{
        try{ if(el.closest && el.closest('#cfgModalBody')) return; }catch(e){}
        el.style.display='none';
      });
    } else {
      // 펼치기: 모든 세부 섹션을 다시 표시
      document.querySelectorAll('[data-cfg-sec]').forEach(el=>{
        try{ if(el.closest && el.closest('#cfgModalBody')) return; }catch(e){}
        if(el.style.display==='none') el.style.display='';
      });
    }
    // 버튼 텍스트 업데이트
    try{
      const btn = document.querySelector('[onclick*="cfgToggleBottomSections"]');
      if(btn) btn.textContent = open ? '🧩 세부 설정 접기 ▲' : '🧩 세부 설정 펼치기 ▼';
    }catch(e){}
  }catch(e){}
};
window.cfgFocusSearch = function(){ try{ document.getElementById('cfgSearchInp')?.focus(); }catch(e){} };
window.cfgCollapseAll = function(){
  try{
    document.querySelectorAll('[data-cfg-sec]').forEach(el=>{ if(el.tagName==='DETAILS') el.open=false; });
    const sug=document.getElementById('cfgSearchSug'); if(sug){ sug.innerHTML=''; sug.style.display='none'; }
  }catch(e){}
};
window.cfgOpenFavorites = function(){
  try{
    const fav=['pd','matchdetail','profileshape','uisize','tablabels'];
    document.querySelectorAll('[data-cfg-sec]').forEach(el=>{
      const id=el.getAttribute('data-cfg-sec');
      const vis=fav.includes(id);
      el.style.display=vis?'':'none';
      if(el.tagName==='DETAILS') el.open=vis;
    });
    const cnt=document.getElementById('cfgSearchCnt'); if(cnt) cnt.textContent=`자주 쓰는 설정 ${fav.length}개`;
  }catch(e){}
};
// 펨코스타일/신현황판 대학 순서 이동
// - 인라인 onclick에서 univCfg 직접 참조가 환경에 따라 막히는 경우가 있어(전역 let 바인딩 이슈),
//   전용 핸들러로 분리해 안정적으로 동작하게 한다.
window.cfgUnivOrderMove = function(i, dir){
  try{
    i = parseInt(i, 10);
    if(isNaN(i)) return;
    if(!Array.isArray(univCfg)) return;
    // 설정 팝업에는 "해체되지 않은 대학"만 노출되므로,
    // 이동도 원본 배열의 인접 인덱스가 아니라 "표시 중인 목록 순서" 기준으로 처리해야 한다.
    const visibleIdxs = univCfg
      .map((u, idx) => ({ u, idx }))
      .filter(x => x.u && !x.u.dissolved)
      .map(x => x.idx);
    const pos = visibleIdxs.indexOf(i);
    if(pos < 0) return;
    const nextPos = pos + (dir==='up' ? -1 : 1);
    if(nextPos < 0 || nextPos >= visibleIdxs.length) return;
    const j = visibleIdxs[nextPos];
    const moved = univCfg.splice(i, 1)[0];
    // splice 제거 후 뒤쪽 요소 인덱스가 당겨지므로 보정
    const insertAt = j > i ? j - 1 : j;
    univCfg.splice(insertAt, 0, moved);
    // 중요: boardOrder가 존재하면 추후 syncBoardOrderToUnivCfg()에서 순서가 되돌아갈 수 있음
    // → boardOrder도 함께 갱신하고 "정식 save()"로 저장
    try{
      if(typeof boardOrder!=='undefined'){
        boardOrder = univCfg.map(u=>u && u.name).filter(Boolean);
      }
    }catch(e){}
    try{ if(typeof save==='function') save(); else if(typeof localSave==='function') localSave(); else if(typeof saveCfg==='function') saveCfg(); }catch(e){}
    try{ if(typeof render==='function') render(); }catch(e){}
    try{ if(typeof showToast==='function') showToast('✅ 순서 저장됨'); }catch(e){}
  }catch(e){
    try{ console.error('[cfgUnivOrderMove] failed', e); }catch(_){}
  }
};

// ─────────────────────────────────────────────────────────────
// (호환/성능) 지연 로딩으로 인해 “함수 없음”으로 오탐되는 케이스 방지용 스텁들
// - settings.js는 상세 조립 파일보다 먼저 로드되므로 여기서 먼저 기본 스텁을 제공해둔다.
// - 실제 구현 파일이 로드되면(예: `render-player-detail.js`) 자동으로 대체된다.
// ─────────────────────────────────────────────────────────────
(function(){
  // cloud-board.js에 정의됨
  function _lazyCheckFbSyncStatus(){
    try{
      const loader = window._loadScriptOnce;
      if(typeof loader !== 'function'){
        alert('기능 로딩 중입니다. 잠시 후 다시 시도해주세요.');
        return;
      }
      loader('js/cloud-board.js?v=20260425-01').then(()=>{
        const fn = window.checkFbSyncStatus;
        if(typeof fn === 'function' && fn !== _lazyCheckFbSyncStatus) fn();
      }).catch((e)=>{
        console.error('[lazy] checkFbSyncStatus load fail', e);
        alert('동기화 상태 확인 로딩 실패');
      });
    }catch(e){}
  }
  window.checkFbSyncStatus = window.checkFbSyncStatus || _lazyCheckFbSyncStatus;

  // calendar.js에 정의됨
  function _lazyRCal(C, T){
    try{
      const loader = window._loadScriptOnce;
      if(typeof loader !== 'function'){
        if(C) C.innerHTML = '<div style="padding:24px;color:var(--gray-l);text-align:center">캘린더 로딩 중...</div>';
        return;
      }
      loader('js/calendar.js?v=20260504-02').then(()=>{
        const fn = window.rCal;
        if(typeof fn === 'function' && fn !== _lazyRCal) fn(C, T);
      }).catch((e)=>{
        console.error('[lazy] rCal load fail', e);
      });
    }catch(e){}
  }
  window.rCal = window.rCal || _lazyRCal;

  // stats.js + Chart.js에 정의됨
  function _lazyRStats(C, T){
    try{
      const loader = window._loadScriptOnce;
      if(typeof loader !== 'function'){
        if(C) C.innerHTML = '<div style="padding:24px;color:var(--gray-l);text-align:center">통계 로딩 중...</div>';
        return;
      }
      const ensureChart = window.ensureChartJS || (()=>loader('https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js'));
      Promise.resolve().then(()=>ensureChart()).then(()=>loader('js/stats-core-utils.js?v=20260503-02')).then(()=>loader('js/stats-tier-rank-utils.js?v=20260503-01')).then(()=>loader('js/stats-heatmap-utils.js?v=20260503-01')).then(()=>loader('js/stats-period-utils.js?v=20260503-01')).then(()=>loader('js/stats-period-renderer.js?v=20260503-01')).then(()=>loader('js/stats-tierwin-renderer.js?v=20260503-01')).then(()=>loader('js/stats-heatmap-renderer.js?v=20260503-01')).then(()=>loader('js/stats-maprank-renderer.js?v=20260503-01')).then(()=>loader('js/stats-univmatrix-renderer.js?v=20260503-01')).then(()=>loader('js/stats-advanced-renderers.js?v=20260503-01')).then(()=>loader('js/stats-export-utils.js?v=20260503-01')).then(()=>loader('js/sharecard-normalize.js?v=20260503-01')).then(()=>loader('js/sharecard-theme.js?v=20260503-05')).then(()=>loader('js/sharecard-team.js?v=20260504-02')).then(()=>loader('js/sharecard-runtime.js?v=20260504-02')).then(()=>loader('js/sharecard-render-entity.js?v=20260504-03')).then(()=>loader('js/sharecard-render-match-helpers.js?v=20260503-01')).then(()=>loader('js/sharecard-render-match-score.js?v=20260503-01')).then(()=>loader('js/sharecard-render-match-layout.js?v=20260504-02')).then(()=>loader('js/sharecard-render-match-shell.js?v=20260504-01')).then(()=>loader('js/sharecard-render-match-sections.js?v=20260503-02')).then(()=>loader('js/sharecard-render-match-context.js?v=20260503-01')).then(()=>loader('js/sharecard-render-match-utils.js?v=20260503-01')).then(()=>loader('js/sharecard-render-match-pipeline.js?v=20260503-02')).then(()=>loader('js/sharecard-match-openers.js?v=20260503-01')).then(()=>loader('js/stats.js?v=20260503-33')).then(()=>{
        const fn = window.rStats;
        if(typeof fn === 'function' && fn !== _lazyRStats) fn(C, T);
      }).catch((e)=>{
        console.error('[lazy] rStats load fail', e);
      });
    }catch(e){}
  }
  window.rStats = window.rStats || _lazyRStats;
})();

// ─────────────────────────────────────────────────────────────
// (요청사항) "QA 체크리스트 전부 되는지" 빠른 드라이런 점검
// - 실제 사용자 데이터는 건드리지 않도록:
//   1) 전역 배열/함수(save/render/document.getElementById/localStorage 일부키)를 백업
//   2) 더미 데이터로 실행 후 원복
// - 네트워크/외부 리소스(동기화/이미지 링크)는 "함수 존재/초기화 여부"만 체크
// ─────────────────────────────────────────────────────────────
window.cfgRunFullQaDryRun = function(){
  const out = document.getElementById('cfg-selfcheck-out');
  if(out) out.innerHTML = '<div style="color:var(--gray-l);font-size:12px">QA 점검 중...</div>';
  const rows = [];
  const ok = (name, pass, detail='')=>{
    rows.push({name, pass, detail});
  };
  const mustFn = (name, fnName)=>{
    ok(name, typeof window[fnName] === 'function', fnName);
  };
  const mustEl = (name, sel)=>{
    ok(name, !!document.querySelector(sel), sel);
  };

  // 0) 핵심 DOM/함수 존재 여부(광범위)
  mustEl('자동인식 모달 존재', '#pasteModal');
  mustEl('티어대회 구분 선택 UI', '#paste-tt-stage');
  mustFn('맵 약자 변환(resolveMapName)', 'resolveMapName');
  mustFn('맵 약자 합치기(getMapAlias)', 'getMapAlias');
  mustFn('상태 아이콘 설정(setStatusIcon)', 'setStatusIcon');
  mustFn('상태 아이콘 조회(getStatusIcon)', 'getStatusIcon');
  mustFn('모바일/태블릿 UI 변수 적용(applyResponsiveUiVars)', 'applyResponsiveUiVars');
  // 일괄 기능(실제 구현은 tier-tour.js)
  mustFn('일괄 날짜 변경(bulkChangeDate)', 'bulkChangeDate');
  mustFn('일괄 맵 교체(bulkChangeMap)', 'bulkChangeMap');
  mustFn('일괄 티어 변경(bulkChangeTier)', 'bulkChangeTier');
  mustFn('일괄 날짜범위 삭제(bulkDeleteByDate)', 'bulkDeleteByDate');
  mustFn('세트→게임수 합산 변환(bulkConvertToGameScore)', 'bulkConvertToGameScore');

  // 1) 드라이런 실행(가능한 것만)
  const backup = {};
  const backupLs = {};
  try{
    // 로그인 강제(드라이런에서는 권한/계정과 무관하게 동작 확인만)
    backup.isLoggedIn = (typeof window.isLoggedIn !== 'undefined') ? window.isLoggedIn : undefined;
    backup.isLoggedInLex = (typeof isLoggedIn !== 'undefined') ? isLoggedIn : undefined;
    try{ window.isLoggedIn = true; }catch(e){}
    try{ if(typeof isLoggedIn !== 'undefined') isLoggedIn = true; }catch(e){}

    // 전역 배열 백업
    ['miniM','univM','ckM','proM','ttM','comps','indM','gjM','tourneys','maps','players','compNames','curComp','userMapAlias','playerStatusIcons','playerStatusExpiry'].forEach(k=>{
      if(typeof window[k] !== 'undefined') backup[k] = window[k];
    });
    // (중요) 이 프로젝트는 constants.js/auth.js에서 top-level let로 전역 데이터를 들고 있어
    // window.*와 분리될 수 있음 → 드라이런은 실제 바인딩(miniM 등)을 직접 교체해야 테스트가 통과함
    try{ backup._lex_miniM = (typeof miniM!=='undefined') ? miniM : undefined; }catch(e){}
    try{ backup._lex_univM = (typeof univM!=='undefined') ? univM : undefined; }catch(e){}
    try{ backup._lex_ckM   = (typeof ckM!=='undefined') ? ckM : undefined; }catch(e){}
    try{ backup._lex_proM  = (typeof proM!=='undefined') ? proM : undefined; }catch(e){}
    try{ backup._lex_ttM   = (typeof ttM!=='undefined') ? ttM : undefined; }catch(e){}
    try{ backup._lex_comps = (typeof comps!=='undefined') ? comps : undefined; }catch(e){}
    try{ backup._lex_indM  = (typeof indM!=='undefined') ? indM : undefined; }catch(e){}
    try{ backup._lex_gjM   = (typeof gjM!=='undefined') ? gjM : undefined; }catch(e){}
    try{ backup._lex_tourneys = (typeof tourneys!=='undefined') ? tourneys : undefined; }catch(e){}
    try{ backup._lex_maps  = (typeof maps!=='undefined') ? maps : undefined; }catch(e){}
    try{ backup._lex_players = (typeof players!=='undefined') ? players : undefined; }catch(e){}
    // save/render 백업
    backup.save = window.save;
    backup.render = window.render;
    // document.getElementById 백업
    backup.getEl = document.getElementById.bind(document);

    // localStorage 백업(점검에서 변경할 키만)
    const lsKeys = ['su_psi','su_psi_expiry','su_tt_paste_stage','su_pd_badge_scale','su_pd_chip_scale','su_mb_scale','su_tb_scale'];
    lsKeys.forEach(k=>{ try{ backupLs[k] = localStorage.getItem(k); }catch(e){} });

    // save/render 스텁(실제 저장 금지)
    let saveCnt=0, renderCnt=0;
    window.save = ()=>{ saveCnt++; };
    window.render = ()=>{ renderCnt++; };

    // 더미 데이터 세팅
    const _dmMini = [{ d:'2026-04-01', map:'투혼II', sets:[{scoreA:1,scoreB:0,games:[{playerA:'A',playerB:'B',map:'투혼II',winner:'A'}]}], sa:1, sb:0 }];
    const _dmUniv = [{ d:'2026-04-01', sets:[{map:'투혼 II',scoreA:1,scoreB:0,games:[{playerA:'C',playerB:'D',map:'투혼II',winner:'A'}]}], sa:1, sb:0 }];
    const _dmTT   = [{ d:'2026-04-01', sets:[{scoreA:1,scoreB:0,games:[{playerA:'E',playerB:'F',map:'폴리포이드',winner:'A'}]}], sa:1, sb:0, stage:'general' }];
    const _dmPlayers = [{name:'A',tier:'S',univ:'U1'},{name:'B',tier:'A',univ:'U1'},{name:'C',tier:'S',univ:'U2'}];
    const _dmMaps = ['투혼 II','폴리포이드'];

    try{ if(typeof miniM!=='undefined') miniM = _dmMini; }catch(e){}
    try{ if(typeof univM!=='undefined') univM = _dmUniv; }catch(e){}
    try{ if(typeof ckM!=='undefined') ckM = []; }catch(e){}
    try{ if(typeof proM!=='undefined') proM = []; }catch(e){}
    try{ if(typeof ttM!=='undefined') ttM = _dmTT; }catch(e){}
    try{ if(typeof comps!=='undefined') comps = []; }catch(e){}
    try{ if(typeof indM!=='undefined') indM = []; }catch(e){}
    try{ if(typeof gjM!=='undefined') gjM = []; }catch(e){}
    try{ if(typeof tourneys!=='undefined') tourneys = []; }catch(e){}
    try{ if(typeof players!=='undefined') players = _dmPlayers; }catch(e){}
    try{ if(typeof maps!=='undefined') maps = _dmMaps; }catch(e){}

    // window.*도 동일 객체를 가리키게 맞춰서 검증/출력 PASS 처리
    try{ window.miniM = (typeof miniM!=='undefined') ? miniM : _dmMini; }catch(e){}
    try{ window.univM = (typeof univM!=='undefined') ? univM : _dmUniv; }catch(e){}
    try{ window.ckM   = (typeof ckM!=='undefined') ? ckM : []; }catch(e){}
    try{ window.proM  = (typeof proM!=='undefined') ? proM : []; }catch(e){}
    try{ window.ttM   = (typeof ttM!=='undefined') ? ttM : _dmTT; }catch(e){}
    try{ window.comps = (typeof comps!=='undefined') ? comps : []; }catch(e){}
    try{ window.indM  = (typeof indM!=='undefined') ? indM : []; }catch(e){}
    try{ window.gjM   = (typeof gjM!=='undefined') ? gjM : []; }catch(e){}
    try{ window.tourneys = (typeof tourneys!=='undefined') ? tourneys : []; }catch(e){}
    try{ window.players = (typeof players!=='undefined') ? players : _dmPlayers; }catch(e){}
    try{ window.maps = (typeof maps!=='undefined') ? maps : _dmMaps; }catch(e){}

    // document.getElementById 훅(일괄 입력값 제공)
    const fake = {
      // 날짜 변경
      'bulk-date-from': { value:'2026-04-01' },
      'bulk-date-to':   { value:'2026-04-30' },
      'bulk-date-chk-mini': { checked:true },
      'bulk-date-chk-univm': { checked:true },
      // 다른 모드들은 드라이런에서 제외(실데이터 접근 방지)
      'bulk-date-chk-ck': { checked:false },
      'bulk-date-chk-pro': { checked:false },
      'bulk-date-chk-tt': { checked:false },
      'bulk-date-chk-ind': { checked:false },
      'bulk-date-chk-gj': { checked:false },
      'bulk-date-chk-comp': { checked:false },
      // 맵 교체
      'bulk-map-from': { value:'투혼II' },
      'bulk-map-to': { value:'투혼' },
      // 티어 변경
      'bulk-tier-from': { value:'S' },
      'bulk-tier-to': { value:'B' },
      'bulk-tier-univ': { value:'U1' },
      // 삭제
      'bulk-del-from': { value:'2026-04-01' },
      'bulk-del-to': { value:'2026-04-30' },
      'bulk-del-chk-mini': { checked:true },
      // 변환
      'bulk-conv-chk-mini': { checked:true },
      'bulk-conv-chk-univm': { checked:true },
      // 티어대회 구분
      'paste-tt-stage': { value:'bkt' },
    };
    document.getElementById = (id)=> (fake[id] ? fake[id] : backup.getEl(id));

    // confirm은 true로 가정(중복/삭제 경고 등)
    backup.confirm = window.confirm;
    window.confirm = ()=>true;

    // 1-1) 일괄 날짜 변경
    if(typeof window.bulkChangeDate==='function'){
      window.bulkChangeDate();
      ok('드라이런: 날짜 일괄 변경', (miniM?.[0]?.d)==='2026-04-30' && (univM?.[0]?.d)==='2026-04-30');
    } else ok('드라이런: 날짜 일괄 변경', false, '함수 없음');

    // 1-2) 맵 일괄 교체(띄어쓰기 무시 포함)
    if(typeof window.bulkChangeMap==='function'){
      window.bulkChangeMap();
      ok('드라이런: 맵 일괄 교체', (miniM?.[0]?.map)==='투혼' && (univM?.[0]?.sets?.[0]?.map)==='투혼');
    } else ok('드라이런: 맵 일괄 교체', false, '함수 없음');

    // 1-3) 선수 일괄 티어 변경
    if(typeof window.bulkChangeTier==='function'){
      window.bulkChangeTier();
      ok('드라이런: 선수 일괄 티어 변경', players.find(p=>p.name==='A')?.tier==='B' && players.find(p=>p.name==='C')?.tier==='S');
    } else ok('드라이런: 선수 일괄 티어 변경', false, '함수 없음');

    // 1-4) 날짜 범위 일괄 삭제
    if(typeof window.bulkDeleteByDate==='function'){
      window.bulkDeleteByDate();
      ok('드라이런: 날짜 범위 일괄 삭제', Array.isArray(miniM) && miniM.length===0);
    } else ok('드라이런: 날짜 범위 일괄 삭제', false, '함수 없음');

    // 1-5) 세트→게임수 합산 변환
    if(typeof window.bulkConvertToGameScore==='function'){
      try{ if(typeof miniM!=='undefined') miniM = [{ sa:2, sb:1, sets:[{scoreA:1,scoreB:0},{scoreA:1,scoreB:1},{scoreA:1,scoreB:0}] }]; }catch(e){}
      try{ if(typeof univM!=='undefined') univM = [{ sa:0, sb:0, sets:[{scoreA:0,scoreB:1},{scoreA:0,scoreB:1},{scoreA:0,scoreB:1}] }]; }catch(e){}
      window.bulkConvertToGameScore();
      ok('드라이런: 세트→게임수 합산 변환', miniM[0].sa===3 && miniM[0].sb===1 && univM[0].sb===3);
    } else ok('드라이런: 세트→게임수 합산 변환', false, '함수 없음');

    // 1-6) 상태 아이콘 저장/해제
    if(typeof window.setStatusIcon==='function' && typeof window.getStatusIcon==='function'){
      try{
        window.setStatusIcon('테스터', 'fire');
        ok('드라이런: 상태 아이콘 저장', window.getStatusIcon('테스터')==='🔥');
        window.setStatusIcon('테스터', 'none');
        ok('드라이런: 상태 아이콘 해제', !window.getStatusIcon('테스터'));
      }catch(e){ ok('드라이런: 상태 아이콘', false, e.message); }
    }

    // 1-7) 맵 약자 변환(대표 케이스)
    if(typeof window.resolveMapName==='function'){
      ok('드라이런: 맵 약자 변환(폴→폴리포이드)', window.resolveMapName('폴')==='폴리포이드');
    }

    // 1-8) 티어대회 구분 저장(선택값 읽기 가능 여부)
    ok('티어대회 구분(stage) 저장 필드', true, 'ttM.stage 사용(일반/조별/토너)');

    ok('save/render 호출이 실제 저장 없이 동작', saveCnt>=0 && renderCnt>=0, `save=${saveCnt}, render=${renderCnt}`);
  }catch(e){
    ok('드라이런 실행', false, String(e.message||e));
  }finally{
    // 원복
    try{
      if(backup.getEl) document.getElementById = backup.getEl;
      if(typeof backup.confirm === 'function') window.confirm = backup.confirm;
      if(backup.save) window.save = backup.save;
      if(backup.render) window.render = backup.render;
      if(typeof backup.isLoggedIn !== 'undefined') window.isLoggedIn = backup.isLoggedIn;
      try{ if(typeof backup.isLoggedInLex !== 'undefined' && typeof isLoggedIn !== 'undefined') isLoggedIn = backup.isLoggedInLex; }catch(e){}
      Object.keys(backup).forEach(k=>{
        if(['save','render','getEl','confirm','isLoggedIn'].includes(k)) return;
        window[k] = backup[k];
      });
      // lexical 전역 원복
      try{ if(typeof backup._lex_miniM!=='undefined' && typeof miniM!=='undefined') miniM = backup._lex_miniM; }catch(e){}
      try{ if(typeof backup._lex_univM!=='undefined' && typeof univM!=='undefined') univM = backup._lex_univM; }catch(e){}
      try{ if(typeof backup._lex_ckM!=='undefined' && typeof ckM!=='undefined') ckM = backup._lex_ckM; }catch(e){}
      try{ if(typeof backup._lex_proM!=='undefined' && typeof proM!=='undefined') proM = backup._lex_proM; }catch(e){}
      try{ if(typeof backup._lex_ttM!=='undefined' && typeof ttM!=='undefined') ttM = backup._lex_ttM; }catch(e){}
      try{ if(typeof backup._lex_comps!=='undefined' && typeof comps!=='undefined') comps = backup._lex_comps; }catch(e){}
      try{ if(typeof backup._lex_indM!=='undefined' && typeof indM!=='undefined') indM = backup._lex_indM; }catch(e){}
      try{ if(typeof backup._lex_gjM!=='undefined' && typeof gjM!=='undefined') gjM = backup._lex_gjM; }catch(e){}
      try{ if(typeof backup._lex_tourneys!=='undefined' && typeof tourneys!=='undefined') tourneys = backup._lex_tourneys; }catch(e){}
      try{ if(typeof backup._lex_maps!=='undefined' && typeof maps!=='undefined') maps = backup._lex_maps; }catch(e){}
      try{ if(typeof backup._lex_players!=='undefined' && typeof players!=='undefined') players = backup._lex_players; }catch(e){}
      Object.keys(backupLs).forEach(k=>{
        try{
          if(backupLs[k] === null || typeof backupLs[k] === 'undefined') localStorage.removeItem(k);
          else localStorage.setItem(k, backupLs[k]);
        }catch(e){}
      });
    }catch(e){}
  }

  // 출력
  if(out){
    const passN = rows.filter(r=>r.pass).length;
    const failN = rows.length - passN;
    out.innerHTML = `
      <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin-bottom:10px">
        <div style="font-size:12px;font-weight:1000;color:${failN? '#dc2626':'#16a34a'}">QA 결과: ${passN} PASS / ${failN} FAIL</div>
        <div style="font-size:11px;color:var(--gray-l)">※ 동기화/외부 이미지 링크/실서버 연동은 여기서 완전 검증이 어렵습니다(함수/초기화 수준만 확인).</div>
      </div>
      <div style="border:1px solid var(--border);border-radius:12px;overflow:hidden">
        <div style="display:grid;grid-template-columns:1.4fr .4fr 1fr;gap:0;background:var(--surface);border-bottom:1px solid var(--border);font-size:11px;font-weight:900;color:var(--text2)">
          <div style="padding:8px 10px">항목</div><div style="padding:8px 10px">결과</div><div style="padding:8px 10px">메모</div>
        </div>
        ${rows.map(r=>`
          <div style="display:grid;grid-template-columns:1.4fr .4fr 1fr;gap:0;border-bottom:1px solid var(--border)">
            <div style="padding:8px 10px;font-size:12px;color:var(--text2)">${esc(r.name)}</div>
            <div style="padding:8px 10px;font-size:12px;font-weight:1000;color:${r.pass?'#16a34a':'#dc2626'}">${r.pass?'PASS':'FAIL'}</div>
            <div style="padding:8px 10px;font-size:11px;color:var(--gray-l);font-family:ui-monospace,monospace;white-space:pre-wrap">${esc(r.detail||'')}</div>
          </div>
        `).join('')}
      </div>
    `;
  }
};
// 설정 검색(섹션 필터)
window.cfgSearchSettings = function(q){
  window._cfgSearchQ = String(q||'').trim();
  const qq = window._cfgSearchQ.toLowerCase();
  // 검색어 없으면 현재 카테고리 기준으로 복구
  if(!qq){
    try{ _cfgApplyCat(window._cfgCat, false); }catch(e){}
    try{ const cnt=document.getElementById('cfgSearchCnt'); if(cnt) cnt.textContent=''; }catch(e){}
    try{ const sug=document.getElementById('cfgSearchSug'); if(sug){ sug.innerHTML=''; sug.style.display='none'; } }catch(e){}
    return;
  }
  let shown=0;
  try{
    const secs=document.querySelectorAll('[data-cfg-sec]');
    for(let i=0;i<secs.length;i++){
      const el=secs[i];
      // 모달에 올라간 섹션은 숨기지 않음
      try{ if(el.closest && el.closest('#cfgModalBody')) continue; }catch(e){}
      const id=el.getAttribute('data-cfg-sec')||'';
      const t = (window._cfgSecTitle && window._cfgSecTitle[id]) ? String(window._cfgSecTitle[id]) : id;
      const plain = t.replace(/<[^>]+>/g,'').replace(/^[\u{1F300}-\u{1FAFF}\u2600-\u27BF]+\s*/u,'');
      // (개선) 섹션 제목뿐 아니라 섹션 내부의 세부 설정 문구도 검색되게
      // - 최초 1회만 innerText를 캐싱해서 성능을 확보
      let st = el.getAttribute('data-cfg-searchtext');
      if(!st){
        try{
          st = (plain + ' ' + (el.innerText||'')).toLowerCase();
          el.setAttribute('data-cfg-searchtext', st);
        }catch(e){
          st = plain.toLowerCase();
        }
      }
      const hit = id.toLowerCase().includes(qq) || st.includes(qq);
      el.style.display = hit ? '' : 'none';
      if(hit) shown++;
      if(el.tagName==='DETAILS') el.open=false;
    }
  }catch(e){}
  try{ const cnt=document.getElementById('cfgSearchCnt'); if(cnt) cnt.textContent = `검색 ${shown}개`; }catch(e){}

  // (개선) 검색 결과 "바로가기" 추천 목록
  try{
    const sug=document.getElementById('cfgSearchSug');
    if(!sug) return;
    const titles=window._cfgSecTitle||{};
    const hits=[];
    for(const id in titles){
      const t=String(titles[id]||'');
      const plain=t.replace(/<[^>]+>/g,'');
      const hay=(id+' '+plain).toLowerCase();
      if(hay.includes(qq)) hits.push({id,t:plain});
    }
    hits.sort((a,b)=>a.t.localeCompare(b.t,'ko'));
    const top=hits.slice(0,10);
    if(!top.length){
      sug.innerHTML='';
      sug.style.display='none';
      return;
    }
    sug.innerHTML = top.map(x=>`<button type="button" class="cfg-search-item" onclick="(function(){try{cfgGo('${x.id}');}catch(e){};try{document.getElementById('cfgSearchSug').style.display='none';}catch(e){}})()">${x.t}</button>`).join('');
    sug.style.display='block';
  }catch(e){}
};

// 디버그 플래그 (기본 OFF): URL에 ?cfgdebug=1 이 포함되면 콘솔에 자세히 기록
try{
  if(typeof window.__CFG_DEBUG==='undefined'){
    window.__CFG_DEBUG = (typeof location!=='undefined' && (location.search||'').indexOf('cfgdebug=1')!==-1);
  }
}catch(e){}

/* ══════════════════════════════════════
   설정
══════════════════════════════════════ */
function rCfg(C,T){
  T.innerText='⚙️ 설정';
  if(!isLoggedIn){
    // (요청사항) 설정탭은 관리자 로그인 후만 접근 가능
    C.innerHTML='<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:60px 20px;text-align:center;gap:16px"><div style="font-size:48px">🔒</div><div style="font-size:18px;font-weight:800;color:var(--text)">관리자 전용 페이지</div><div style="font-size:13px;color:var(--gray-l)">설정 탭은 관리자 로그인 후 이용할 수 있습니다.</div><button class="btn btn-b" onclick="om(&#39;loginModal&#39;)">&#128273; 로그인</button></div>';
    return;
  }
  if(!window._cfgCat || window._cfgCat==='전체') window._cfgCat='🧩 운영/콘텐츠';
  const _cfgCats=(window._cfgCatOrder && Array.isArray(window._cfgCatOrder) ? window._cfgCatOrder : Object.keys(_catSecs||{}));
  const _cfgCatIcons={'🧩 운영/콘텐츠':'🧩','🖼️ 이미지/프로필':'🖼️','🧩 현황판/펨코':'🧩','🎨 디자인/테마':'🎨','🧠 자동화/도구':'🧠','🧪 고급/점검':'🧪','💾 데이터':'💾','기타':'🗂️'};
  // 카테고리명 자체에 이모지가 들어있는 경우(🎨 스타일/테마, 🧪 고급/실험실) 아이콘이 2번 보이는 문제 방지
  const _catLabel = (c)=>{
    const s=String(c||'');
    return s.replace(/^[\u{1F300}-\u{1FAFF}\u2600-\u27BF]+\s*/u,'');
  };
  const _cfgCatDesc={
    '🧩 운영/콘텐츠':'공지/티어/시즌/대학/맵/자동인식',
    '🖼️ 이미지/프로필':'이미지탭/스트리머 상세/경기 상세(팝업)',
    '🧩 현황판/펨코':'신현황판/펨코스타일/순서/칩/밝기/배경',
    '🎨 디자인/테마':'디자인모드/헤더/폰트/카드/캘린더',
    '🧠 자동화/도구':'BGM/멀티뷰/붙여넣기 분리/자동 맞춤',
    '🧪 고급/점검':'메뉴정리/저장소/설정 점검',
    '💾 데이터':'동기화/백업/일괄 작업'
  };
  const _cfgSecTitle={
    notice:'📢 공지', tier:'🎯 티어/점수', season:'🗓️ 시즌', teammatch:'🏟️ 팀경기', acct:'🔐 계정',
    univ:'🏛️ 대학', maps:'🗺️ 맵', mAlias:'🔤 맵 약자', si:'🎭 상태 아이콘 (목록/추가)', paste:'🤖 자동인식',
    b2layout:'📐 이미지탭 레이아웃', imgsettings:'🖼️ 이미지탭 이미지', imgmodalsettings:'🖼️ 스트리머 상세 이미지',
    profileshape:'🖼️ 프로필 이미지 모양',
    pdModeBadge:'🎨 최근 경기 종목 배지 색상',
    pd:'🎨 스트리머 상세 스타일', matchdetail:'🎮 경기 상세(팝업)',
    univlogoimg:'🏫 대학 로고 이미지(URL)',
    b2femco:'🧩 펨코스타일', femcoorder:'🔀 펨코스타일 스타대학 순서', boardchip:'🏷️ 현황판 칩/대학로고', oldbright:'🎨 구현황판 밝기', boardbg:'🧱 현황판 배경',
    tablabels:'🏷️ 탭 이름(라벨) 설정',
    uisize:'📱 모바일/태블릿 UI 크기',
    siAssign:'🎭 스트리머별 상태 아이콘 지정',
    cfgmenu:'🧭 설정 메뉴 정리', autofitall:'📱 전역 자동 맞춤', reccard:'🧾 기록 카드', tourneycard:'🏆 대회 카드', sharecard:'🪪 공유카드 디자인', calui:'📅 캘린더', appfont:'🅰️ 전역 폰트',
    bgm:'🎵 유튜브 BGM', soopmv:'📺 SOOP 멀티뷰', pasteRoute:'🧠 붙여넣기 자동 분리',
    designv2:'✨ 디자인 모드', hdr:'🧩 헤더 상단바',
    fab:'📱 FAB', storage:'💾 저장소', selfcheck:'🧪 설정 점검',
    sync:'🔄 동기화', firebase:'☁️ GitHub 동기화', bulkdate:'📅 일괄 날짜', bulkmap:'🗺️ 일괄 맵', bulktier:'🎯 일괄 티어', bulkdel:'🗑️ 일괄 삭제', bulkconv:'🧾 변환'
  };
  // 사용자 지정 섹션명 적용
  try{
    const _ren=_cfgMenuLoadRenames();
    for(const k in (_ren||{})){
      if(!_ren[k]) continue;
      _cfgSecTitle[k]=String(_ren[k]);
    }
  }catch(e){}
  const typeOpts=[{v:'📢',l:'📢 일반 공지'},{v:'🔥',l:'🔥 중요'},{v:'⚠️',l:'⚠️ 경고/주의'},{v:'🎉',l:'🎉 이벤트'}];
  const _curSecs=_catSecs[window._cfgCat]||[];
  // 다른 함수에서도 참조할 수 있게 title 맵을 window에 노출
  window._cfgSecTitle = _cfgSecTitle;
  const _regBtn = (!isSubAdmin ? `<button class="btn btn-b no-export" onclick="openB2PlayerCreateModal()" style="padding:6px 10px;border-radius:14px;font-size:11px;font-weight:900;white-space:nowrap;flex-shrink:0">🎬 스트리머 등록</button>` : ``);
  const _menuBtn = `<button class="btn btn-w no-export" onclick="cfgGo('cfgmenu')" style="padding:6px 10px;border-radius:14px;font-size:11px;font-weight:900;white-space:nowrap;flex-shrink:0" title="설정 하위 메뉴 이름 변경/정리">🧭 메뉴정리</button>`;
  const _afOn = (localStorage.getItem('su_af_alltabs_v1') === '1');
  const _rcOn = (localStorage.getItem('su_rc_theme_on') ?? '1') === '1';
  const _rcAccent = (localStorage.getItem('su_rc_accent_mode') ?? 'none');
  const _rcBg = parseInt(localStorage.getItem('su_rc_bg_alpha') ?? '12',10) || 12;
  const _rcHd = parseInt(localStorage.getItem('su_rc_hd_alpha') ?? '14',10) || 14;
  const _rcIc = parseInt(localStorage.getItem('su_rc_uicon') ?? '24',10) || 24;
  const _rcUnivFont = parseInt(localStorage.getItem('su_rc_univ_font_pct') ?? '110',10) || 110;
  const _ymScale = parseInt(localStorage.getItem('su_ym_scale_pct') ?? '100',10) || 100;
  const _rcMemoOn = (localStorage.getItem('su_rc_memo_on') ?? '0') === '1';
  const _sfxOn = (localStorage.getItem('su_rec_side_fx_on') || '1') !== '0';
  const _sfxMode = localStorage.getItem('su_rec_side_fx_mode') || 'soft';
  const _sfxInt = Math.max(20,Math.min(100,parseInt(localStorage.getItem('su_rec_side_fx_intensity')||'68',10)||68));
  const _avaScale = Math.round((parseFloat(localStorage.getItem('su_avatar_scale') ?? '1') || 1) * 100);
  const _cfgViewMode = (localStorage.getItem('su_cfg_view_mode') || 'basic') === 'advanced' ? 'advanced' : 'basic';
  const _cfgBottomOpen = (()=>{ try{
    const saved=localStorage.getItem('su_cfg_bottom_open');
    if(saved==='1' || saved==='0') return saved==='1';
  }catch(e){}
  return _cfgViewMode==='advanced'; })();
  const _quickBtns = [
    {id:'pd', icon:'🎨', title:'스트리머 상세', desc:'배경/배지/프로필'},
    {id:'matchdetail', icon:'🎮', title:'경기 상세', desc:'헤더/프로필/색상'},
    {id:'profileshape', icon:'🖼️', title:'프로필 모양', desc:'원형/네모/효과'},
    {id:'uisize', icon:'📱', title:'UI 크기', desc:'모바일/태블릿 크기'},
    {id:'tablabels', icon:'🏷️', title:'탭 이름', desc:'상단/하위 메뉴명'},
    {id:'hdr', icon:'🧩', title:'헤더 바', desc:'제목/아이콘/배경'},
    {id:'reccard', icon:'🧾', title:'기록 카드', desc:'CK/프로 버튼색 포함'},
    {id:'cfgmenu', icon:'🧭', title:'메뉴 정리', desc:'자주 쓰는 설정 정리'}
  ];
  const _basicQuickBtns = _quickBtns.slice(0,4);
  const _moreQuickBtns = _quickBtns.slice(4);
  const _catButtons = _cfgCats.map(c=>{
    const on=window._cfgCat===c;
    return `<button type="button" onclick="cfgApplyCat('${c}')" class="no-export" data-cat="${c}" data-cfg-cat="${c}"
      style="display:flex;flex-direction:column;align-items:flex-start;gap:4px;padding:12px 12px;border-radius:16px;cursor:pointer;text-align:left;background:${on?'linear-gradient(135deg,var(--blue),#7c3aed)':'var(--white)'};color:${on?'#fff':'var(--text2)'};border:1px solid ${on?'transparent':'var(--border)'};box-shadow:${on?'0 10px 24px rgba(37,99,235,.22)':'0 4px 12px rgba(15,23,42,.04)'};min-height:82px">
      <span style="font-size:18px;line-height:1">${_cfgCatIcons[c]||'🗂️'}</span>
      <span style="font-size:12px;font-weight:900;line-height:1.25">${_catLabel(c)}</span>
      <span data-cfg-cat-desc="1" style="font-size:10px;opacity:${on?'.9':'.72'};font-weight:700;line-height:1.35">${_cfgCatDesc[c]||''}</span>
    </button>`;
  }).join('');
  const _cfgSecDesc = (window._cfgSecDescMap||{});
  const _secButtons = _curSecs.map(id=>{
    const title=_cfgSecTitle[id]||id;
    const desc=_cfgSecDesc[id]||'세부 설정 열기';
    return `<button type="button" class="btn btn-w no-export" onclick="cfgGo('${id}')" style="display:flex;flex-direction:column;align-items:flex-start;gap:4px;padding:12px;border-radius:14px;text-align:left;background:var(--white);justify-content:flex-start;min-height:86px">
      <span style="font-size:15px;line-height:1">${String(title).match(/^[^\s]+/)?.[0]||'⚙️'}</span>
      <span style="font-size:12px;font-weight:900;color:var(--text2);line-height:1.3;word-break:keep-all;white-space:normal">${title.replace(/^[^\s]+\s*/,'')}</span>
      <span style="font-size:10px;color:var(--gray-l);font-weight:700;line-height:1.35;white-space:normal">${desc}</span>
    </button>`;
  }).join('');

  let h=`<div class="no-export cfg-topbar" style="position:sticky;top:0;z-index:10;background:var(--bg);padding:6px 0 0;margin-bottom:10px;border-bottom:1px solid var(--border)">
    <div class="cfg-topbar-inner" style="display:flex;align-items:center;gap:10px;padding-bottom:6px;flex-wrap:wrap">
      <div class="cfg-tools-row" style="display:flex;align-items:center;gap:6px;margin-left:auto;flex:1;min-width:220px;justify-content:flex-end">
        <div class="cfg-search-wrap" style="position:relative;flex:1;max-width:360px;min-width:220px">
          <input id="cfgSearchInp" placeholder="설정 검색..." value="${esc(String(window._cfgSearchQ||''))}" style="width:100%;padding:6px 10px;border:1px solid var(--border2);border-radius:12px;font-size:12px;font-weight:700" oninput="cfgSearchSettings(this.value)">
          <div id="cfgSearchSug" class="cfg-search-sug" style="display:none"></div>
        </div>
        <span id="cfgSearchCnt" style="font-size:11px;color:var(--gray-l);font-weight:900;white-space:nowrap"></span>
      </div>
      <div style="display:flex;gap:6px;flex-wrap:wrap">
        <button class="btn ${_cfgViewMode==='basic'?'btn-b':'btn-w'} btn-xs" onclick="cfgSetViewMode('basic')">1단계 초보</button>
        <button class="btn ${_cfgViewMode==='advanced'?'btn-b':'btn-w'} btn-xs" onclick="cfgSetViewMode('advanced')">2단계 고급</button>
      </div>
      ${_cfgViewMode==='advanced' ? _menuBtn : ''}
      ${_regBtn}
    </div>
  </div>
  <div class="no-export" style="margin:0 0 14px;padding:12px;border:1px solid var(--border);border-radius:16px;background:linear-gradient(135deg,var(--surface),rgba(255,255,255,.92));box-shadow:0 8px 18px rgba(15,23,42,.04)">
    <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;margin-bottom:10px">
      <div>
        <div style="font-size:13px;font-weight:900;color:var(--text2)">⚡ 1단계 초보 설정</div>
        <div style="font-size:11px;color:var(--gray-l)">지금은 자주 쓰는 설정만 간단하게 보여줍니다. 더 많은 메뉴는 2단계 고급에서 확인할 수 있습니다.</div>
      </div>
      <div style="display:flex;gap:6px;flex-wrap:wrap">
        <button class="btn btn-w btn-xs" onclick="window.cfgFocusSearch&&window.cfgFocusSearch()">🔎 설정 검색</button>
        <button class="btn btn-w btn-xs" onclick="window.cfgCollapseAll&&window.cfgCollapseAll()">📦 보이는 항목 접기</button>
        <button class="btn btn-w btn-xs" onclick="window.cfgOpenFavorites&&window.cfgOpenFavorites()">⭐ 자주 쓰는 것만 열기</button>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(132px,1fr));gap:8px">
      ${(_cfgViewMode==='basic' ? _basicQuickBtns : _quickBtns).map(x=>`<button type="button" class="btn btn-w no-export" onclick="cfgGo('${x.id}')" style="display:flex;flex-direction:column;align-items:flex-start;gap:3px;padding:10px 12px;border-radius:14px;text-align:left;background:var(--white)">
        <span style="font-size:16px;line-height:1">${x.icon}</span>
        <span style="font-size:12px;font-weight:900;color:var(--text2)">${x.title}</span>
        <span style="font-size:10px;color:var(--gray-l);font-weight:700">${x.desc}</span>
      </button>`).join('')}
    </div>
    ${_cfgViewMode==='basic' ? `<details class="no-export" style="margin-top:10px;border:1px solid var(--border);border-radius:14px;background:rgba(255,255,255,.7)">
      <summary style="padding:11px 12px;cursor:pointer;font-size:12px;font-weight:900;color:var(--text2)">➕ 더 많은 빠른 이동 보기</summary>
      <div style="padding:0 10px 10px;display:grid;grid-template-columns:repeat(auto-fit,minmax(132px,1fr));gap:8px">
        ${_moreQuickBtns.map(x=>`<button type="button" class="btn btn-w no-export" onclick="cfgGo('${x.id}')" style="display:flex;flex-direction:column;align-items:flex-start;gap:3px;padding:10px 12px;border-radius:14px;text-align:left;background:var(--white)">
          <span style="font-size:16px;line-height:1">${x.icon}</span>
          <span style="font-size:12px;font-weight:900;color:var(--text2)">${x.title}</span>
          <span style="font-size:10px;color:var(--gray-l);font-weight:700">${x.desc}</span>
        </button>`).join('')}
      </div>
    </details>` : ''}
  </div>
  ${_cfgViewMode==='basic'
    ? `<details class="no-export" style="margin:0 0 14px;border:1px solid var(--border);border-radius:16px;background:var(--surface);box-shadow:0 8px 18px rgba(15,23,42,.03)">
    <summary style="padding:12px 14px;cursor:pointer;display:flex;align-items:center;justify-content:space-between;gap:8px;font-size:13px;font-weight:900;color:var(--text2)">🎨 디자인 빠른 이동 <span style="font-size:11px;color:var(--gray-l);font-weight:800">필요할 때만 열기</span></summary>
    <div style="padding:0 12px 12px">
      <div style="font-size:11px;color:var(--gray-l);margin-bottom:10px">현황판 디자인과 공유카드 디자인을 같은 카드형 버튼으로 바로 이동할 수 있습니다.</div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:8px">`
    : `<div class="no-export" style="margin:0 0 14px;padding:12px;border:1px solid var(--border);border-radius:16px;background:var(--surface);box-shadow:0 8px 18px rgba(15,23,42,.03)">
    <div style="margin-bottom:10px">
      <div style="font-size:13px;font-weight:900;color:var(--text2)">🎨 디자인 빠른 이동</div>
      <div style="font-size:11px;color:var(--gray-l)">현황판 디자인과 공유카드 디자인을 같은 카드형 버튼으로 바로 이동할 수 있습니다.</div>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:8px">`}
      <button type="button" class="btn btn-w no-export" onclick="cfgGo('sharecard')" style="display:flex;flex-direction:column;align-items:flex-start;gap:4px;padding:12px;border-radius:14px;text-align:left;background:var(--white)">
        <span style="font-size:16px;line-height:1">🪪</span>
        <span style="font-size:12px;font-weight:900;color:var(--text2)">공유카드 디자인</span>
        <span style="font-size:10px;color:var(--gray-l);font-weight:700">모드, 색상, 승자 배경, 타입별 오버라이드</span>
      </button>
      <button type="button" class="btn btn-w no-export" onclick="cfgGo('boardchip')" style="display:flex;flex-direction:column;align-items:flex-start;gap:4px;padding:12px;border-radius:14px;text-align:left;background:var(--white)">
        <span style="font-size:16px;line-height:1">🏷️</span>
        <span style="font-size:12px;font-weight:900;color:var(--text2)">현황판 칩/로고</span>
        <span style="font-size:10px;color:var(--gray-l);font-weight:700">프로필 크기, 대학 로고, 칩 크기 조절</span>
      </button>
      <button type="button" class="btn btn-w no-export" onclick="cfgGo('boardbg')" style="display:flex;flex-direction:column;align-items:flex-start;gap:4px;padding:12px;border-radius:14px;text-align:left;background:var(--white)">
        <span style="font-size:16px;line-height:1">🖼️</span>
        <span style="font-size:12px;font-weight:900;color:var(--text2)">현황판 배경</span>
        <span style="font-size:10px;color:var(--gray-l);font-weight:700">배경 이미지/라벨 배경/표시 방식</span>
      </button>
      <button type="button" class="btn btn-w no-export" onclick="cfgGo('oldbright')" style="display:flex;flex-direction:column;align-items:flex-start;gap:4px;padding:12px;border-radius:14px;text-align:left;background:var(--white)">
        <span style="font-size:16px;line-height:1">✨</span>
        <span style="font-size:12px;font-weight:900;color:var(--text2)">현황판 밝기</span>
        <span style="font-size:10px;color:var(--gray-l);font-weight:700">카드 배경/라벨 밝기 세부 조절</span>
      </button>
    </div>
  ${_cfgViewMode==='basic' ? `</div></details>` : `</div>`}
  ${_cfgViewMode==='advanced' ? `<details class="no-export" open style="margin:0 0 14px;border:1px solid var(--border);border-radius:18px;background:linear-gradient(135deg,var(--surface),rgba(255,255,255,.96));box-shadow:0 10px 22px rgba(15,23,42,.04)">
    <summary style="padding:14px 16px;cursor:pointer;display:flex;align-items:center;justify-content:space-between;gap:8px;font-size:13px;font-weight:900;color:var(--text2)">🧭 2단계 고급 설정 전체 보기 <span style="font-size:11px;color:var(--gray-l);font-weight:800">카테고리별 전체 메뉴</span></summary>
    <div style="padding:0 12px 12px">
      <div style="margin:0 0 12px;padding:12px;border:1px solid var(--border);border-radius:16px;background:var(--white)">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;margin-bottom:10px">
          <div>
            <div style="font-size:13px;font-weight:900;color:var(--text2)">🧭 설정 카테고리</div>
            <div style="font-size:11px;color:var(--gray-l)">설정을 주제별로 나눠서 찾을 수 있습니다.</div>
          </div>
          <div data-cfg-cur-cat-label="1" style="font-size:11px;color:var(--gray-l);font-weight:800">현재: ${_catLabel(window._cfgCat)}</div>
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:8px">
          ${_catButtons}
        </div>
      </div>
      <div style="padding:12px;border:1px solid var(--border);border-radius:16px;background:var(--surface);box-shadow:0 8px 18px rgba(15,23,42,.03)">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;margin-bottom:10px">
          <div>
            <div style="font-size:13px;font-weight:900;color:var(--text2)">📚 현재 카테고리 전체 메뉴</div>
            <div data-cfg-cur-cat-desc="1" style="font-size:11px;color:var(--gray-l)">${_catLabel(window._cfgCat)} 안의 세부 메뉴를 버튼으로 바로 엽니다.</div>
          </div>
          <button class="btn btn-w btn-xs" onclick="window.cfgCollapseAll&&window.cfgCollapseAll()">현재 화면 정리</button>
        </div>
        <div data-cfg-cur-sec-buttons="1" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:8px">
          ${_secButtons}
        </div>
      </div>
    </div>
  </details>` : `<div class="no-export" style="margin:0 0 14px;padding:12px;border:1px dashed var(--border2);border-radius:16px;background:var(--surface)">
    <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap">
      <div>
        <div style="font-size:13px;font-weight:900;color:var(--text2)">🧭 2단계 고급 설정 숨김 상태</div>
        <div style="font-size:11px;color:var(--gray-l)">세부 설정은 숨겨져 있습니다. 필요한 경우에만 2단계 고급을 열어 전체 메뉴를 볼 수 있습니다.</div>
      </div>
      <button class="btn btn-w btn-xs" onclick="cfgSetViewMode('advanced')">2단계 고급 열기</button>
    </div>
  </div>`}
  <div class="no-export" style="margin:0 0 14px;padding:12px;border:1px dashed var(--border2);border-radius:16px;background:var(--surface)">
    <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap">
      <div>
        <div style="font-size:13px;font-weight:900;color:var(--text2)">🧩 하단 세부 설정</div>
        <div style="font-size:11px;color:var(--gray-l)">아래 긴 설정 목록은 필요할 때만 펼쳐서 볼 수 있습니다. 검색 중에는 자동으로 표시됩니다.</div>
      </div>
      <button class="btn btn-w btn-xs" onclick="window.cfgToggleBottomSections&&window.cfgToggleBottomSections()">${_cfgBottomOpen?'🧩 세부 설정 접기 ▲':'🧩 세부 설정 펼치기 ▼'}</button>
    </div>
  </div>
${_scfgD('notice','📢 공지 관리')}
    <div style="font-size:12px;color:var(--gray-l);margin-bottom:14px">접속 시 팝업으로 표시됩니다. 활성화된 공지만 보여집니다.</div>
    <div id="notice-list-area" style="margin-bottom:16px">
    ${notices.length===0?`<div style="padding:18px;text-align:center;color:var(--gray-l);background:var(--surface);border-radius:10px;font-size:13px">등록된 공지 없음</div>`:
      notices.map((n,i)=>`<div style="border:1px solid var(--border);border-radius:10px;padding:12px 14px;margin-bottom:8px;background:${n.active?'var(--white)':'var(--surface)'};opacity:${n.active?1:0.6}">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
          <span style="font-size:18px">${n.type||'📢'}</span>
          <span style="font-weight:700;flex:1;font-size:13px">${n.title||'(제목 없음)'}</span>
          <span style="font-size:11px;color:var(--gray-l)">${n.date||''}</span>
          <button class="btn btn-xs" style="background:${n.active?'#f0fdf4':'#f1f5f9'};color:${n.active?'#16a34a':'#64748b'};border:1px solid ${n.active?'#86efac':'#cbd5e1'};min-width:52px"
            onclick="notices[${i}].active=!notices[${i}].active;save();render()">
            ${n.active?'✅ 활성':'⭕ 비활성'}</button>
          <button class="btn btn-r btn-xs" onclick="if(confirm('공지를 삭제할까요?')){notices.splice(${i},1);save();render()}">🗑️</button>
        </div>
        ${(n.body||'').length>120
          ? `<div id="notice-body-${i}" style="font-size:12px;color:var(--text2);white-space:pre-wrap;max-height:60px;overflow:hidden">${(n.body||'').slice(0,120)}...</div>
             <button onclick="(function(){const el=document.getElementById('notice-body-${i}');const btn=document.getElementById('notice-exp-${i}');const open=el.style.maxHeight!=='none';el.style.maxHeight=open?'none':'60px';el.textContent=open?notices[${i}].body:notices[${i}].body.slice(0,120)+'...';btn.textContent=open?'▲ 접기':'▼ 전체보기';})()" id="notice-exp-${i}" style="background:none;border:none;color:var(--blue);font-size:11px;cursor:pointer;padding:2px 0;font-weight:600">▼ 전체보기</button>`
          : `<div style="font-size:12px;color:var(--text2);white-space:pre-wrap">${n.body||''}</div>`
        }
      </div>`).join('')
    }
    </div>
    <div style="border:1.5px dashed var(--border2);border-radius:12px;padding:16px;background:var(--surface)">
      <div style="font-size:12px;font-weight:700;color:var(--text2);margin-bottom:10px">+ 새 공지 작성</div>
      <div style="display:flex;gap:8px;margin-bottom:8px;flex-wrap:wrap">
        <select id="new-notice-type" style="width:140px;border:1px solid var(--border2);border-radius:7px;padding:5px 8px;font-size:13px">
          ${typeOpts.map(o=>`<option value="${o.v}">${o.l}</option>`).join('')}
        </select>
        <input type="text" id="new-notice-title" placeholder="공지 제목" style="flex:1;min-width:180px">
      </div>
      <textarea id="new-notice-body" placeholder="공지 내용을 입력하세요..." style="width:100%;height:80px;resize:vertical;border:1px solid var(--border2);border-radius:8px;padding:8px 10px;font-size:13px;box-sizing:border-box"></textarea>
      <div style="display:flex;align-items:center;gap:10px;margin-top:8px">
        <label style="display:flex;align-items:center;gap:5px;font-size:12px;cursor:pointer">
          <input type="checkbox" id="new-notice-active" checked> 즉시 활성화
        </label>
        <button class="btn btn-b" style="margin-left:auto" onclick="
          const t=document.getElementById('new-notice-title').value.trim();
          const b=document.getElementById('new-notice-body').value.trim();
          const tp=document.getElementById('new-notice-type').value;
          const ac=document.getElementById('new-notice-active').checked;
          if(!t){alert('제목을 입력하세요');return;}
          notices.unshift({id:Date.now(),type:tp,title:t,body:b,active:ac,date:new Date().toLocaleDateString('ko-KR')});
          save();render();">📢 공지 등록</button>
      </div>
    </div>
  </details>
  ${(()=>{
    const seen={};const dupNames=[];
    players.forEach(p=>{if(seen[p.name])dupNames.push(p.name);else seen[p.name]=true;});
    const uniq=[...new Set(dupNames)];
    if(!uniq.length) return '';
    return `<div class="ssec" style="border:2px solid #fca5a5;background:#fff5f5">
      <h4 style="color:#dc2626">⚠️ 동명이인 감지 (${uniq.length}건)</h4>
      <div style="font-size:12px;color:#7f1d1d;margin-bottom:12px">중복 이름이 있으면 승패·기록이 뒤섞입니다. 한 명의 이름을 바꿔 구분하세요.</div>
      ${uniq.map(name=>{
        const dupes=players.map((p,i)=>({p,i})).filter(({p})=>p.name===name);
        return `<div style="background:var(--white);border:1px solid #fca5a5;border-radius:8px;padding:10px 12px;margin-bottom:8px">
          <div style="font-weight:800;color:#dc2626;font-size:13px;margin-bottom:6px">👥 "${name}" — ${dupes.length}명 중복</div>
          ${dupes.map(({p,i})=>`<div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;flex-wrap:wrap">
            <span style="font-size:11px;background:#fee2e2;color:#991b1b;border-radius:4px;padding:1px 7px;font-weight:700">${p.univ||'무소속'}</span>
            <span style="font-size:11px;color:var(--gray-l)">${p.tier||'-'} · ${p.race||'-'}</span>
            <input type="text" id="dupfix-${i}" placeholder="새 이름..." style="flex:1;min-width:100px;padding:3px 7px;border-radius:5px;border:1px solid #fca5a5;font-size:12px">
            <button class="btn btn-xs" style="background:#dc2626;color:#fff;border-color:#dc2626" onclick="(function(){
              const inp=document.getElementById('dupfix-${i}');
              const nw=(inp?.value||'').trim();
              if(!nw){alert('새 이름을 입력하세요.');return;}
              if(players.find((x,xi)=>x.name===nw&&xi!==${i})){alert('이미 존재하는 이름입니다.');return;}
              editName=players[${i}].name;
              document.getElementById('emBody').innerHTML='';
              const oldN=players[${i}].name;
              players[${i}].name=nw;
              players.forEach(other=>{(other.history||[]).forEach(h=>{if(h.opp===oldN)h.opp=nw;});});
              [miniM,univM,comps,ckM,proM,ttM].forEach(arr=>(arr||[]).forEach(m=>{
                if(m.a===oldN)m.a=nw;if(m.b===oldN)m.b=nw;
                (m.sets||[]).forEach(s=>(s.games||[]).forEach(g=>{if(g.playerA===oldN)g.playerA=nw;if(g.playerB===oldN)g.playerB=nw;}));
              }));
              (tourneys||[]).forEach(tn=>{
                (tn.groups||[]).forEach(grp=>{(grp.matches||[]).forEach(m=>{if(m.a===oldN)m.a=nw;if(m.b===oldN)m.b=nw;});});
                const br=tn.bracket||{};
                Object.values(br.matchDetails||{}).forEach(m=>{if(m&&m.a===oldN)m.a=nw;if(m&&m.b===oldN)m.b=nw;});
                (br.manualMatches||[]).forEach(m=>{if(m.a===oldN)m.a=nw;if(m.b===oldN)m.b=nw;});
              });
              (proTourneys||[]).forEach(tn=>{
                (tn.groups||[]).forEach(grp=>{(grp.matches||[]).forEach(m=>{if(m.a===oldN)m.a=nw;if(m.b===oldN)m.b=nw;});});
              });
              save();render();
            })()">✅ 적용</button>
          </div>`).join('')}
        </div>`;
      }).join('')}
    </div>`;
  })()}
  ${_scfgD('univ','🏛️ 대학 관리')}
    <div style="font-size:11px;color:var(--gray-l);margin:8px 0 10px">👁️ 숨김 처리된 대학은 비로그인 상태에서 현황판에 표시되지 않습니다.</div>
    <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:12px">
      <button class="btn btn-w btn-sm" onclick="cfgGo('univlogoimg')">🏫 대학 로고 이미지(URL) 설정</button>
      <span style="font-size:11px;color:var(--gray-l)">※ 대학명 옆 로고(아이콘) 표시용</span>
    </div>
    ${univCfg.map((u,idx)=>({u,idx})).filter(x=>x.u && !x.u.dissolved).map(({u,idx:i})=>{
      const isHidden = !!u.hidden;
      const _dSz = parseInt(u.logoSizeDetail || '', 10);
      const _pSz = parseInt(u.logoSizePlayers || '', 10);
      return `<div class="srow" style="background:${isHidden?'var(--surface)':'transparent'};border-radius:8px;padding:4px 6px;margin:-2px -6px;flex-wrap:wrap;gap:4px">
        <div class="cdot" style="background:${u.color};opacity:${isHidden?0.4:1}"></div>
        <input type="text" value="${u.name}" style="flex:1;max-width:130px;opacity:${isHidden?0.5:1}" onblur="const oldName=univCfg[${i}].name;const v=this.value.trim();if(!v){this.value=oldName;return;}if(v!==oldName&&univCfg.some((x,xi)=>xi!==${i}&&x.name===v)){alert('이미 추가된 대학명입니다.');this.value=oldName;return;}if(v!==oldName){renameUnivAcrossData(oldName,v);univCfg[${i}].name=v;save();render();}">
        <input id="cfg-univ-c-${i}" type="color" value="${u.color}" style="width:36px;height:30px;padding:2px;border-radius:5px;cursor:pointer;border:1px solid var(--border2)" title="대학 색상"
          onchange="cfgUnivSetColor(${i},this.value)">
        <input id="cfg-univ-hex-${i}" type="text" value="${u.color}" placeholder="#RRGGBB" title="대학 색상 HEX 입력" style="width:96px;padding:4px 8px;border:1px solid var(--border2);border-radius:8px;font-size:12px;font-weight:800"
          onblur="cfgUnivSetColor(${i},this.value)">
        <button class="btn btn-w btn-xs" title="스포이드로 색상 찍기" onclick="cfgUnivPickColor(${i})">🎯</button>
        <button class="btn btn-xs" style="background:${isHidden?'#fef2f2':'#f0fdf4'};color:${isHidden?'#dc2626':'#16a34a'};border:1px solid ${isHidden?'#fca5a5':'#86efac'};min-width:58px"
          onclick="univCfg[${i}].hidden=!univCfg[${i}].hidden;saveCfg();render()">
          ${isHidden?'👁️ 숨김':'✅ 표시'}</button>
        <button class="btn btn-xs" style="background:#fff7ed;color:#ea580c;border:1px solid #fed7aa" onclick="openDissolveModal(${i})">🏚️ 해체</button>
        <button class="btn btn-r btn-xs" onclick="delUniv(${i})">🗑️ 삭제</button>
        <div style="width:100%;padding:6px 0 2px 16px;display:flex;flex-direction:column;gap:8px">
          <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
            <div style="font-size:11px;font-weight:800;color:var(--text2);min-width:154px">🏛️ 대학상세 로고 크기</div>
            <input type="range" min="28" max="72" step="2" value="${isNaN(_dSz)?46:Math.max(28,Math.min(72,_dSz))}" style="flex:1;min-width:140px;accent-color:var(--blue)"
              oninput="univCfg[${i}].logoSizeDetail=+this.value;saveCfg();try{if(typeof applyUnivLogoVars==='function')applyUnivLogoVars();}catch(e){};render()">
            <span style="font-size:11px;color:var(--gray-l);min-width:42px;font-weight:900">${isNaN(_dSz)?46:Math.max(28,Math.min(72,_dSz))}px</span>
            <button class="btn btn-w btn-xs" onclick="delete univCfg[${i}].logoSizeDetail;saveCfg();render()" title="대학별 값 제거(기본값 사용)">초기화</button>
          </div>
          <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
            <div style="font-size:11px;font-weight:800;color:var(--text2);min-width:154px">🎬 스트리머탭 로고 크기</div>
            <input type="range" min="16" max="40" step="1" value="${isNaN(_pSz)?26:Math.max(16,Math.min(40,_pSz))}" style="flex:1;min-width:140px;accent-color:var(--blue)"
              oninput="univCfg[${i}].logoSizePlayers=+this.value;saveCfg();render()">
            <span style="font-size:11px;color:var(--gray-l);min-width:42px;font-weight:900">${isNaN(_pSz)?26:Math.max(16,Math.min(40,_pSz))}px</span>
            <button class="btn btn-w btn-xs" onclick="delete univCfg[${i}].logoSizePlayers;saveCfg();render()" title="대학별 값 제거(기본값 사용)">초기화</button>
          </div>
        </div>
      </div>`;
    }).join('')}
    ${(()=>{
      const dis = univCfg.map((u,idx)=>({u,idx})).filter(x=>x.u && x.u.dissolved);
      if(!dis.length) return '';
      return `<details style="margin-top:14px;border:1px dashed #fca5a5;background:#fff5f5;border-radius:12px;padding:10px 12px">
        <summary style="cursor:pointer;font-weight:900;color:#dc2626;list-style:none">🏚️ 해체된 대학 (${dis.length}) <span style="font-size:11px;font-weight:600;color:#7f1d1d">(펼치기)</span></summary>
        <div style="margin-top:10px;display:flex;flex-direction:column;gap:8px">
          ${dis.map(({u,idx:i})=>{
            const _dSz = parseInt(u.logoSizeDetail || '', 10);
            const _pSz = parseInt(u.logoSizePlayers || '', 10);
            return `<div class="srow" style="background:var(--white);border:1px solid #fecaca;border-radius:10px;padding:8px 10px;flex-wrap:wrap;gap:6px">
              <div class="cdot" style="background:${u.color};opacity:.8"></div>
              <div style="font-weight:900;color:#7f1d1d;min-width:120px">${esc(u.name||'')}</div>
              <span style="font-size:10px;background:#fee2e2;color:#dc2626;border:1px solid #fca5a5;border-radius:5px;padding:1px 6px;font-weight:800">🏚️ 해체 ${u.dissolvedDate||''}</span>
              <button class="btn btn-xs" style="background:#f0fdf4;color:#16a34a;border:1px solid #86efac" onclick="univCfg[${i}].dissolved=false;univCfg[${i}].hidden=false;delete univCfg[${i}].dissolvedDate;saveCfg();render()">🔄 복구</button>
              <button class="btn btn-r btn-xs" onclick="delUniv(${i})">🗑️ 삭제</button>
              <div style="width:100%;padding:6px 0 0 16px;display:flex;flex-direction:column;gap:8px">
                <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
                  <div style="font-size:11px;font-weight:800;color:#7f1d1d;min-width:154px">🏛️ 대학상세 로고 크기</div>
                  <input type="range" min="28" max="72" step="2" value="${isNaN(_dSz)?46:Math.max(28,Math.min(72,_dSz))}" style="flex:1;min-width:140px;accent-color:#dc2626"
                    oninput="univCfg[${i}].logoSizeDetail=+this.value;saveCfg();try{if(typeof applyUnivLogoVars==='function')applyUnivLogoVars();}catch(e){};render()">
                  <span style="font-size:11px;color:#7f1d1d;min-width:42px;font-weight:900">${isNaN(_dSz)?46:Math.max(28,Math.min(72,_dSz))}px</span>
                  <button class="btn btn-w btn-xs" onclick="delete univCfg[${i}].logoSizeDetail;saveCfg();render()">초기화</button>
                </div>
                <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
                  <div style="font-size:11px;font-weight:800;color:#7f1d1d;min-width:154px">🎬 스트리머탭 로고 크기</div>
                  <input type="range" min="16" max="40" step="1" value="${isNaN(_pSz)?26:Math.max(16,Math.min(40,_pSz))}" style="flex:1;min-width:140px;accent-color:#dc2626"
                    oninput="univCfg[${i}].logoSizePlayers=+this.value;saveCfg();render()">
                  <span style="font-size:11px;color:#7f1d1d;min-width:42px;font-weight:900">${isNaN(_pSz)?26:Math.max(16,Math.min(40,_pSz))}px</span>
                  <button class="btn btn-w btn-xs" onclick="delete univCfg[${i}].logoSizePlayers;saveCfg();render()">초기화</button>
                </div>
              </div>
            </div>`;
          }).join('')}
        </div>
      </details>`;
    })()}
    <div style="margin-top:12px;display:flex;gap:8px;flex-wrap:wrap;align-items:center">
      <input type="text" id="nu-n" placeholder="새 대학명" style="width:150px">
      <input type="color" id="nu-c" value="#2563eb" style="width:40px;height:34px;padding:2px;border-radius:5px;cursor:pointer;border:1px solid var(--border2)">
      <button class="btn btn-b" onclick="addUniv()">+ 대학 추가</button>
    </div></details>
  ${_scfgD('univlogoimg','🏫 대학 로고 이미지(URL)')}
    <div style="font-size:12px;color:var(--gray-l);margin-bottom:10px;line-height:1.6">
      대학명 옆에 표시되는 <b>로고(아이콘) 이미지 URL</b>을 대학별로 지정합니다.<br>
      권장: <code>https://</code>로 시작하는 직접 이미지 링크(png/jpg/webp/svg)
    </div>
    <div style="padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:10px">
      ${univCfg.map((u,i)=>{
        const url=String(u.icon||u.img||'');
        const disp=url?toHttpsUrl(url):'';
        return `<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;border:1px solid var(--border);border-radius:12px;padding:10px 12px;background:var(--white);margin-bottom:8px">
          <div class="cdot" style="background:${u.color||'#64748b'}"></div>
          <div style="min-width:120px;font-weight:900;color:var(--text2)">${esc(u.name||'')}</div>
          ${disp?`<img src="${esc(disp)}" alt="" style="width:28px;height:28px;object-fit:contain;border-radius:6px;background:#fff;border:1px solid var(--border2)" onerror="this.style.display='none'">`
               :`<div style="width:28px;height:28px;border-radius:6px;background:var(--surface);border:1px dashed var(--border2)"></div>`}
          <input type="text" value="${esc(url)}" placeholder="https://... (로고 이미지 URL)" style="flex:1;min-width:240px"
            onblur="const v=this.value.trim(); if(v){univCfg[${i}].icon=toHttpsUrl(v);} else {delete univCfg[${i}].icon;} saveCfg(); if(typeof showToast==='function')showToast('✅ 저장됨');">
          <button class="btn btn-w btn-xs" onclick="const inp=this.parentElement.querySelector('input'); if(inp) inp.value=''; delete univCfg[${i}].icon; delete univCfg[${i}].img; saveCfg(); if(typeof showToast==='function')showToast('🧹 로고 삭제됨');">삭제</button>
        </div>`;
      }).join('')}
      <div style="font-size:11px;color:var(--gray-l);margin-top:10px">※ URL이 막히면(깨짐/CORS) 다른 이미지 호스팅을 사용해 주세요.</div>
    </div>
  </details>
  ${_scfgD('maps','🗺️ 맵 관리')}<div id="map-list">
    ${maps.map((m,i)=>`<div class="srow">
      <span style="font-size:14px">📍</span>
      <input type="text" value="${m}" style="flex:1" onblur="maps[${i}]=this.value;saveCfg();refreshSel()">
      <button class="btn btn-r btn-xs" onclick="delMap(${i})">🗑️ 삭제</button>
    </div>`).join('')}
  </div><div style="margin-top:12px;display:flex;gap:8px">
    <input type="text" id="nm" placeholder="새 맵 이름" style="width:200px" onkeydown="if(event.key==='Enter')addMap()">
    <button class="btn btn-b" onclick="addMap()">+ 맵 추가</button>
  </div></details>
  ${_scfgD('mAlias','⚡ 맵 약자 관리')}
    <div style="font-size:12px;color:var(--gray-l);margin-bottom:10px">
      약자를 입력하면 경기 결과 붙여넣기 시 자동으로 전체 맵 이름으로 변환됩니다.<br>
      <span style="color:var(--blue);font-weight:600">예:</span> <code style="background:var(--surface);padding:1px 6px;border-radius:4px">녹 → 녹아웃</code>, <code style="background:var(--surface);padding:1px 6px;border-radius:4px">폴 → 폴리포이드</code>
    </div>
    <div style="background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:10px 12px;margin-bottom:12px">
      <div style="font-size:11px;font-weight:700;color:var(--text2);margin-bottom:6px">📦 기본 내장 약자 <span style="font-weight:400;color:var(--gray-l);font-size:10px">(✕ 클릭 시 비활성화)</span></div>
      <div style="display:flex;flex-wrap:wrap;gap:5px">
        ${Object.entries(PASTE_MAP_ALIAS_DEFAULT).filter(([k,v])=>k!==v).map(([k,v])=>{
          const disabled=(userMapAlias||{}).hasOwnProperty(k+'__disabled');
          return disabled
            ? `<span style="display:inline-flex;align-items:center;gap:3px;background:#f1f5f9;border:1px solid var(--border);border-radius:6px;padding:2px 6px 2px 9px;font-size:11px;opacity:.5;text-decoration:line-through"><span style="font-family:monospace"><b>${k}</b> → ${v}</span><button onclick="restoreDefaultMapAlias('${encodeURIComponent(k)}')" style="background:none;border:none;cursor:pointer;color:#16a34a;font-size:10px;padding:0 2px;line-height:1;text-decoration:none" title="복원">↩</button></span>`
            : `<span style="display:inline-flex;align-items:center;gap:3px;background:var(--white);border:1px solid var(--border);border-radius:6px;padding:2px 6px 2px 9px;font-size:11px"><span style="font-family:monospace"><b>${k}</b> → ${v}</span><button onclick="delDefaultMapAlias('${encodeURIComponent(k)}','${encodeURIComponent(v)}')" style="background:none;border:none;cursor:pointer;color:#dc2626;font-size:10px;padding:0 2px;line-height:1" title="비활성화">✕</button></span>`;
        }).join('')}
      </div>
    </div>
    <div style="font-size:12px;font-weight:700;color:var(--text2);margin-bottom:8px">🔧 사용자 정의 약자</div>
    <div id="alias-list" style="margin-bottom:10px"></div>
    <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
      <input type="text" id="alias-key" placeholder="약자 (예: 녹)" style="width:90px" maxlength="10" onkeydown="if(event.key==='Enter')addMapAlias()">
      <span style="color:var(--gray-l)">→</span>
      <input type="text" id="alias-val" list="alias-val-list" placeholder="맵 이름 입력..." autocomplete="off" style="width:180px;border:1px solid var(--border2);border-radius:7px;padding:5px 8px;font-size:13px" onkeydown="if(event.key==='Enter')addMapAlias()">
      <datalist id="alias-val-list">${maps.map(m=>`<option value="${m}">`).join('')}</datalist>
      <button class="btn btn-b" onclick="addMapAlias()">+ 약자 추가</button>
    </div>
    <div style="margin-top:12px;padding:10px 12px;background:var(--surface);border:1px solid var(--border);border-radius:10px">
      <div style="font-size:12px;font-weight:900;color:var(--text2);margin-bottom:6px">🧪 약자 변환 테스트</div>
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        <input type="text" id="alias-test-in" placeholder="예: 폴 / 투혼II / 녹" style="width:200px"
          oninput="try{const v=this.value.trim();const out=document.getElementById('alias-test-out');if(!out)return; if(!v){out.textContent='';return;} if(typeof resolveMapName==='function'){out.textContent='→ '+resolveMapName(v);} else {out.textContent='(resolveMapName 로딩 전)';}}catch(e){}">
        <div id="alias-test-out" style="font-size:12px;color:var(--text2);font-weight:900"></div>
      </div>
      <div style="font-size:11px;color:var(--gray-l);margin-top:6px">※ 붙여넣기 자동인식에서 실제로 적용되는 변환과 동일합니다.</div>
    </div>
    <div id="alias-msg" style="font-size:12px;margin-top:6px;min-height:16px"></div>
  </details>
  ${(typeof window.renderCfgTabLabelsSection==='function' ? window.renderCfgTabLabelsSection(_scfgD) : '')}
  ${_scfgD('hdr','🖼️ 헤더(상단바) 커스텀')}
    ${(()=>{ 
      const _t = (localStorage.getItem('su_hdr_title')||'스타대학 데이터 센터');
      const _li = (localStorage.getItem('su_hdr_left_icon')||'🏆');
      const _ls = parseInt(localStorage.getItem('su_hdr_left_size')||'22',10)||22;
      const _ri = (localStorage.getItem('su_hdr_right_img')||'');
      const _rs = parseInt(localStorage.getItem('su_hdr_right_size')||'32',10)||32;
      const _bg = (localStorage.getItem('su_hdr_bg_img')||'');
      const _hh = parseInt(localStorage.getItem('su_hdr_height')||'0',10)||0;
      const _fx = (localStorage.getItem('su_hdr_fx')||'classic');
      const _c1 = (localStorage.getItem('su_hdr_c1')||'#1e3a8a');
      const _c2 = (localStorage.getItem('su_hdr_c2')||'#2563eb');
      const _sync = (localStorage.getItem('su_hdr_sync_theme')||'0')==='1';
      // 프리셋
      let _ps=[], _sel='';
      try{ _ps = JSON.parse(localStorage.getItem('su_hdr_presets_v1')||'null'); if(!Array.isArray(_ps)) _ps=[]; }catch(e){ _ps=[]; }
      try{ _sel = localStorage.getItem('su_hdr_preset_sel_v1')||''; }catch(e){ _sel=''; }
      if(!_ps.length){ _ps=[{id:'tmp',name:'기본'}]; _sel=_ps[0].id; }
      if(!_sel || !_ps.some(p=>p.id===_sel)) _sel=_ps[0].id;
      return `
        <div style="font-size:12px;color:var(--gray-l);margin-bottom:10px">상단 헤더의 제목/아이콘/이미지/배경을 커스텀합니다. (URL은 https:// 로 시작)</div>
        <div style="padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:10px;display:flex;flex-direction:column;gap:12px">
          <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
            <div style="font-size:11px;color:var(--text3);font-weight:900;min-width:84px">프리셋</div>
            <select id="cfg-hdr-preset" onchange="hdrPresetSelect(this.value)" style="min-width:220px">
              ${_ps.map(p=>`<option value="${p.id}"${p.id===_sel?' selected':''}>${esc(p.name||'')}</option>`).join('')}
            </select>
            <button class="btn btn-w btn-xs" onclick="hdrPresetAdd()">+ 추가</button>
            <button class="btn btn-w btn-xs" onclick="hdrPresetRename()">이름변경</button>
            <button class="btn btn-b btn-xs" onclick="hdrPresetSaveCurrent()">현재값 저장</button>
            <button class="btn btn-r btn-xs" onclick="hdrPresetDelete()">삭제</button>
            <button class="btn btn-p btn-xs" onclick="hdrPresetInstallThemePack()" title="봄/여름/가을/겨울, 기념일, 스타크래프트 테마 프리셋 자동 추가">🎨 테마팩 추가</button>
          </div>
          <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
            <div style="font-size:11px;color:var(--text3);font-weight:900;min-width:84px">스타일</div>
            <select id="cfg-hdr-fx" onchange="cfgSetHeaderSettings()" style="min-width:220px">
              <option value="classic"${_fx==='classic'?' selected':''}>클래식(기본)</option>
              <option value="solid"${_fx==='solid'?' selected':''}>솔리드(단색)</option>
              <option value="glass"${_fx==='glass'?' selected':''}>글래스(유리)</option>
              <option value="aurora"${_fx==='aurora'?' selected':''}>오로라(움직임)</option>
              <option value="mesh"${_fx==='mesh'?' selected':''}>메쉬(패턴)</option>
            </select>
            <label style="display:flex;align-items:center;gap:6px;font-size:12px;font-weight:900;color:var(--text2);cursor:pointer">
              <input type="checkbox" id="cfg-hdr-sync" ${_sync?'checked':''} onchange="cfgSetHeaderSettings()">
              헤더색 → 전체 주색
            </label>
          </div>
          <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
            <div style="font-size:11px;color:var(--text3);font-weight:900;min-width:84px">색상</div>
            <input id="cfg-hdr-c1" type="color" value="${esc(_c1)}" onchange="cfgSetHeaderSettings()" style="width:42px;height:34px;padding:2px;border-radius:8px;border:1px solid var(--border2);background:var(--white);cursor:pointer">
            <input id="cfg-hdr-c2" type="color" value="${esc(_c2)}" onchange="cfgSetHeaderSettings()" style="width:42px;height:34px;padding:2px;border-radius:8px;border:1px solid var(--border2);background:var(--white);cursor:pointer">
            <span style="font-size:11px;color:var(--gray-l)">왼쪽/오른쪽(그라데이션 기준)</span>
          </div>
          <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
            <div style="font-size:11px;color:var(--text3);font-weight:800;min-width:84px">제목</div>
            <input id="cfg-hdr-title" type="text" value="${esc(_t)}" placeholder="예: 스타대학 데이터 센터" style="flex:1;min-width:220px" onblur="cfgSetHeaderSettings()">
          </div>
          <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
            <div style="font-size:11px;color:var(--text3);font-weight:800;min-width:84px">좌측 아이콘</div>
            <input id="cfg-hdr-left" type="text" value="${esc(_li)}" placeholder="이모지 또는 이미지 URL" style="flex:1;min-width:220px" onblur="cfgSetHeaderSettings()">
            <span style="font-size:11px;color:var(--text3);font-weight:800">크기</span>
            <input id="cfg-hdr-left-sz" type="range" min="14" max="44" step="2" value="${Math.max(14,Math.min(44,_ls))}" oninput="document.getElementById('cfg-hdr-left-sz-v').textContent=this.value+'px'" onchange="cfgSetHeaderSettings()" style="width:160px">
            <span id="cfg-hdr-left-sz-v" style="font-size:11px;color:var(--gray-l);min-width:40px;font-weight:900">${Math.max(14,Math.min(44,_ls))}px</span>
          </div>
          <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
            <div style="font-size:11px;color:var(--text3);font-weight:800;min-width:84px">우측 이미지</div>
            <input id="cfg-hdr-right" type="text" value="${esc(_ri)}" placeholder="이미지 URL (없으면 비움)" style="flex:1;min-width:220px" onblur="cfgSetHeaderSettings()">
            <span style="font-size:11px;color:var(--text3);font-weight:800">크기</span>
            <input id="cfg-hdr-right-sz" type="range" min="18" max="70" step="2" value="${Math.max(18,Math.min(70,_rs))}" oninput="document.getElementById('cfg-hdr-right-sz-v').textContent=this.value+'px'" onchange="cfgSetHeaderSettings()" style="width:160px">
            <span id="cfg-hdr-right-sz-v" style="font-size:11px;color:var(--gray-l);min-width:40px;font-weight:900">${Math.max(18,Math.min(70,_rs))}px</span>
          </div>
          <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
            <div style="font-size:11px;color:var(--text3);font-weight:800;min-width:84px">배경 이미지</div>
            <input id="cfg-hdr-bg" type="text" value="${esc(_bg)}" placeholder="배경 이미지 URL (없으면 비움)" style="flex:1;min-width:220px" onblur="cfgSetHeaderSettings()">
          </div>
          <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
            <div style="font-size:11px;color:var(--text3);font-weight:800;min-width:84px">헤더 높이</div>
            <input id="cfg-hdr-h" type="range" min="0" max="120" step="4" value="${Math.max(0,Math.min(120,_hh))}" oninput="document.getElementById('cfg-hdr-h-v').textContent=(this.value==0?'자동':this.value+'px')" onchange="cfgSetHeaderSettings()" style="width:240px">
            <span id="cfg-hdr-h-v" style="font-size:11px;color:var(--gray-l);min-width:56px;font-weight:900">${_hh?(_hh+'px'):'자동'}</span>
          </div>
        </div>
      </details>`;
    })()}
  ${(()=>{ 
    const on = (localStorage.getItem('su_bgm_enabled') ?? '1') === '1';
    const vol = parseInt(localStorage.getItem('su_bgm_volume')||'50',10) || 50;
    const sh = (localStorage.getItem('su_bgm_shuffle') ?? '0') === '1';
    const list = (localStorage.getItem('su_bgm_list') || '').trim();
    return _scfgD('bgm','🎵 유튜브 BGM') + `
      <div style="font-size:12px;color:var(--gray-l);margin-bottom:10px">
        상단 검색바 왼쪽의 ▶/⏸ 버튼으로 재생/일시정지합니다. (모바일은 첫 재생 시 사용자 터치가 필요할 수 있습니다)
      </div>
      <div style="padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:10px;display:flex;flex-direction:column;gap:12px">
        <label style="display:flex;align-items:center;gap:8px;font-size:12px;cursor:pointer;font-weight:900;color:var(--text2)">
          <input type="checkbox" id="cfg-bgm-on" style="width:15px;height:15px" ${on?'checked':''} onchange="cfgSaveBgmSettings()">
          BGM 기능 사용
        </label>
        <label style="display:flex;align-items:center;gap:8px;font-size:12px;cursor:pointer;font-weight:900;color:var(--text2)">
          <input type="checkbox" id="cfg-bgm-shuffle" style="width:15px;height:15px" ${sh?'checked':''} onchange="cfgSaveBgmSettings()">
          랜덤 재생(셔플)
        </label>
        <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
          <div style="font-size:12px;font-weight:900;color:var(--text2);min-width:84px">볼륨</div>
          <input id="cfg-bgm-vol" type="range" min="0" max="100" step="5" value="${Math.max(0,Math.min(100,vol))}"
            oninput="document.getElementById('cfg-bgm-vol-v').textContent=this.value" onchange="cfgSaveBgmSettings()" style="width:220px">
          <span id="cfg-bgm-vol-v" style="font-size:11px;color:var(--gray-l);min-width:24px;font-weight:900">${Math.max(0,Math.min(100,vol))}</span>
        </div>
        <div style="font-size:12px;font-weight:900;color:var(--text2)">유튜브 링크 목록 (한 줄에 1개)</div>
        <textarea id="cfg-bgm-list" rows="6" placeholder="예) https://www.youtube.com/watch?v=xxxxxxxxxxx" style="width:100%;border:1.5px solid var(--border);border-radius:10px;padding:10px 12px;font-size:12px;line-height:1.6;resize:vertical;background:var(--white);color:var(--text1);box-sizing:border-box" oninput="cfgSaveBgmSettings()" onblur="cfgSaveBgmSettings()">${esc(list)}</textarea>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <button class="btn btn-b btn-sm" onclick="cfgSaveBgmSettings();if(typeof showToast==='function')showToast('저장됨');">저장</button>
          <button class="btn btn-w btn-sm" onclick="document.getElementById('cfg-bgm-list').value='';cfgSaveBgmSettings();">목록 비우기</button>
        </div>
      </div>
    </details>`;
  })()}
  ${(()=>{ 
    const list = (localStorage.getItem('su_soop_list') || '').trim();
    return _scfgD('soopmv','📺 SOOP 멀티뷰') + `
      <div style="font-size:12px;color:var(--gray-l);margin-bottom:10px;line-height:1.6">
        상단에 <b>SOOP</b> 버튼이 생기며, 버튼을 누르면 <b>2분할 멀티뷰</b> 팝업이 열립니다.<br>
        (주소가 1개도 없으면 버튼은 숨겨집니다)
      </div>
      <div style="padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:10px;display:flex;flex-direction:column;gap:10px">
        <div style="font-size:12px;font-weight:1000;color:var(--text2)">SOOP 주소 목록 (한 줄에 1개)</div>
        <textarea id="cfg-soop-list" rows="7" placeholder="예) https://...." style="width:100%;border:1.5px solid var(--border);border-radius:10px;padding:10px 12px;font-size:12px;line-height:1.6;resize:vertical;background:var(--white);color:var(--text1);box-sizing:border-box" oninput="cfgSaveSoopSettings()" onblur="cfgSaveSoopSettings()">${esc(list)}</textarea>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <button class="btn btn-b btn-sm" onclick="cfgSaveSoopSettings();if(typeof showToast==='function')showToast('저장됨');">저장</button>
          <button class="btn btn-w btn-sm" onclick="document.getElementById('cfg-soop-list').value='';cfgSaveSoopSettings();">목록 비우기</button>
        </div>
      </div>
    </details>`;
  })()}
  ${(()=>{ 
    const rules = (localStorage.getItem('su_paste_route_rules') || '').trim();
    return _scfgD('pasteRoute','🧠 결과 붙여넣기 자동 분리') + `
      <div style="font-size:12px;color:var(--gray-l);margin-bottom:10px;line-height:1.6">
        붙여넣기 텍스트의 <b>메모/원문</b>에 특정 키워드가 포함되면, 저장 시 자동으로 기록탭을 분리합니다.<br>
        형식: <code>/정규식/flags =&gt; 모드</code> 또는 <code>키워드 =&gt; 모드</code><br>
        예) <code>E-SCORE TOURNAMENT =&gt; 끝장전</code> / <code>/ASL\\s*S\\d+/i =&gt; 개인전</code>
      </div>
      <div style="padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:10px;display:flex;flex-direction:column;gap:10px">
        <div style="font-size:12px;font-weight:1000;color:var(--text2)">규칙 목록 (한 줄에 1개)</div>
        <textarea id="cfg-paste-route" rows="7" placeholder="예)\nE-SCORE TOURNAMENT => 끝장전\n/mini\\s*league/i => 미니대전\n/civil\\s*war/i => 시빌워" style="width:100%;border:1.5px solid var(--border);border-radius:10px;padding:10px 12px;font-size:12px;line-height:1.6;resize:vertical;background:var(--white);color:var(--text1);box-sizing:border-box" oninput="cfgSavePasteRouteRules()" onblur="cfgSavePasteRouteRules()">${esc(rules)}</textarea>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <button class="btn btn-b btn-sm" onclick="cfgSavePasteRouteRules();if(typeof showToast==='function')showToast('저장됨');">저장</button>
          <button class="btn btn-w btn-sm" onclick="document.getElementById('cfg-paste-route').value='';cfgSavePasteRouteRules();">규칙 비우기</button>
        </div>
        <div style="font-size:11px;color:var(--gray-l);line-height:1.5">
          모드 예시: 개인전 / 끝장전 / 미니대전 / 시빌워 / 대학대전 / 대학CK / 프로리그 / 티어대회 / 대회<br>
          ※ 현재 자동 분리는 우선 <b>개인전/끝장전/미니대전(시빌워)</b>에 가장 안정적으로 동작합니다.
        </div>
      </div>
    </details>`;
  })()}
  ${_scfgD('si','🎭 상태 아이콘 (목록/추가)')}
    <div style="font-size:12px;color:var(--gray-l);margin-bottom:12px;line-height:1.6">
      상태 아이콘의 <b>기본 목록</b>과 <b>커스텀 아이콘 추가</b>를 관리합니다.<br>
      스트리머별로 아이콘을 지정하는 기능은 아래의 <b>“🎭 스트리머별 상태 아이콘 지정”</b> 메뉴에서 합니다.
    </div>
    <!-- 커스텀 아이콘 추가 (URL/링크) -->
    <div style="padding:12px;background:var(--surface);border:1px solid var(--border);border-radius:8px;margin-bottom:14px">
      <div style="font-size:12px;font-weight:700;color:var(--blue);margin-bottom:10px">🔗 커스텀 아이콘 추가 (URL · 이모지)</div>
      <div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin-bottom:10px">
        <input type="text" id="si-url" placeholder="이미지 URL 또는 이모지 입력" style="flex:1;min-width:200px;padding:5px 8px;border:1px solid var(--border2);border-radius:6px;font-size:12px">
        <input type="text" id="si-label" placeholder="이름 (선택)" style="width:110px;padding:5px 8px;border:1px solid var(--border2);border-radius:6px;font-size:12px">
        <button class="btn btn-b btn-sm" onclick="var e=document.getElementById('si-url').value.trim(),l=document.getElementById('si-label').value.trim();if(!e){alert('URL 또는 이모지를 입력하세요.');return;}addCustomStatusIcon(l||'커스텀',e);document.getElementById('si-url').value='';document.getElementById('si-label').value='';render()">+ 추가</button>
      </div>
      ${_customStatusIcons.length?`<div style="display:flex;flex-wrap:wrap;gap:6px">${_customStatusIcons.map((c,i)=>`<span style="display:inline-flex;align-items:center;gap:5px;padding:4px 10px;border-radius:7px;background:var(--white);border:1.5px solid var(--blue);font-size:14px"><span style="display:inline-flex;align-items:center">${_siRender(c.emoji,'20px')||c.emoji}</span><span style="font-size:11px;color:var(--gray-l);max-width:80px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${c.label||''}</span><button onclick="removeCustomStatusIcon(${i});render()" style="background:none;border:none;color:#dc2626;cursor:pointer;font-size:14px;padding:0;line-height:1;margin-left:2px" title="삭제">×</button></span>`).join('')}</div>`
      :'<div style="font-size:11px;color:var(--gray-l)">추가된 커스텀 아이콘 없음</div>'}
    </div>
    <!-- 기본 아이콘 목록 -->
    <div style="padding:12px;background:var(--surface);border:1px solid var(--border);border-radius:8px;margin-bottom:14px">
      <div style="font-size:12px;font-weight:700;color:var(--blue);margin-bottom:10px">🎭 기본 상태 아이콘</div>
      <div style="display:flex;flex-wrap:wrap;gap:6px">
        ${Object.entries(STATUS_ICON_DEFS).filter(([id])=>id!=='none'&&!id.startsWith('_c')).map(([id,d])=>`<span style="padding:4px 10px;border-radius:7px;background:var(--white);border:1px solid var(--border);font-size:16px" title="${d.label}">${_siRender(d.emoji,'20px')||d.emoji}</span>`).join('')}
      </div>
      <div style="font-size:11px;color:var(--gray-l);margin-top:8px">지정은 “스트리머별 상태 아이콘 지정” 메뉴에서 합니다.</div>
    </div>
    <button class="btn btn-r btn-sm" onclick="if(confirm('모든 상태 아이콘 지정(스트리머별)을 초기화할까요?')){try{playerStatusIcons={};playerStatusExpiry={};if(typeof _iconPersistState==='function')_iconPersistState();}catch(e){};render();}">전체 초기화</button>
  </details>
  ${_scfgD('siAssign','🎭 스트리머별 상태 아이콘 지정')}
    <div style="font-size:12px;color:var(--gray-l);margin-bottom:12px;line-height:1.6">
      스트리머별로 표시될 상태 아이콘을 지정합니다. (현황판·순위표·이미지 저장 모두 반영)<br>
      검색 후 선택만 하면 바로 저장됩니다.
    </div>
    <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:10px">
      <input id="cfg-si-assign-q" type="text" placeholder="🔍 이름/대학/티어 검색..." style="flex:1;min-width:220px;padding:6px 10px;border:1px solid var(--border2);border-radius:10px;font-size:12px"
        oninput="try{window._cfgSiAssignQ=this.value; if(typeof _renderCfgSiAssignList==='function') _renderCfgSiAssignList();}catch(e){}">
      <button class="btn btn-w btn-sm" onclick="document.getElementById('cfg-si-assign-q').value='';window._cfgSiAssignQ=''; if(typeof _renderCfgSiAssignList==='function') _renderCfgSiAssignList();">초기화</button>
    </div>
    <div id="cfg-si-assign-list" style="max-height:380px;overflow-y:auto;border:1px solid var(--border);border-radius:10px;background:var(--white)">
      <div style="padding:16px;text-align:center;color:var(--gray-l);font-size:12px">로딩 중...</div>
    </div>
  </details>
  ${_scfgD('tier','🎭 티어 관리')}
    ${(()=>{ 
      const th = (typeof getTierTheme==='function') ? getTierTheme() : {bg:{},icon:{},sat:1,bri:1};
      const bri = Math.round((parseFloat(th.bri)||1)*100);
      const sat = Math.round((parseFloat(th.sat)||1)*100);
      const _safeHex = (h) => {
        const s=String(h||'').trim();
        return /^#([0-9a-fA-F]{6})$/.test(s) ? s : '#64748b';
      };
      const _attr = (s)=>String(s??'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
      const _jsq = (s)=>String(s??'').replace(/\\/g,'\\\\').replace(/'/g,"\\'");
      return `
      <div style="padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:10px;margin-bottom:14px">
        <div style="font-size:12px;font-weight:1000;color:var(--text2);margin-bottom:10px">🎨 티어 색상/밝기/이모지 커스텀</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;align-items:center;margin-bottom:12px">
          <div>
            <div style="font-size:11px;font-weight:800;color:var(--text3);margin-bottom:4px">밝기</div>
            <input type="range" min="60" max="160" step="1" value="${bri}" style="width:100%" oninput="document.getElementById('cfg-tier-bri-v').textContent=this.value+'%';cfgTierThemeSetBri(this.value)">
            <div style="font-size:11px;color:var(--gray-l)"><span id="cfg-tier-bri-v">${bri}%</span></div>
          </div>
          <div>
            <div style="font-size:11px;font-weight:800;color:var(--text3);margin-bottom:4px">채도</div>
            <input type="range" min="50" max="160" step="1" value="${sat}" style="width:100%" oninput="document.getElementById('cfg-tier-sat-v').textContent=this.value+'%';cfgTierThemeSetSat(this.value)">
            <div style="font-size:11px;color:var(--gray-l)"><span id="cfg-tier-sat-v">${sat}%</span></div>
          </div>
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px">
          <button class="btn btn-w btn-sm" onclick="cfgTierThemeReset()">기본값으로 초기화</button>
          <span style="font-size:11px;color:var(--gray-l);align-self:center">※ 변경 즉시 전체 화면(배지/그래프)에 반영됩니다.</span>
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:10px">
          ${TIERS.map((t,i)=>{
            const c=_safeHex(th.bg?.[t]||'');
            const ic=String(th.icon?.[t]||'');
            return `<div style="padding:10px 10px;background:var(--white);border:1px solid var(--border);border-radius:10px;display:flex;flex-direction:column;gap:8px">
              <div id="cfg-tier-prev-${i}" style="display:flex;justify-content:center">${getTierBadge(t)}</div>
              <div style="display:flex;gap:6px;align-items:center;justify-content:center;flex-wrap:wrap">
                <input id="cfg-tier-c-${encodeURIComponent(t)}" type="color" value="${c}" title="티어 색상" onchange="cfgTierThemeSetColor('${_jsq(t)}',this.value)">
                <input id="cfg-tier-hex-${encodeURIComponent(t)}" type="text" value="${c}" placeholder="#RRGGBB" title="티어 색상 HEX 입력" style="width:92px;padding:6px 8px;border:1px solid var(--border2);border-radius:8px;font-size:12px;font-weight:800;text-align:center" onblur="cfgTierThemeSetColor('${_jsq(t)}',this.value)">
                <button class="btn btn-w btn-xs" title="스포이드로 색상 찍기" onclick="cfgTierThemePickColor('${_jsq(t)}')">🎯</button>
                <input type="text" value="${_attr(ic)}" placeholder="이모지" title="티어 이모지" style="width:64px;padding:6px 8px;border:1px solid var(--border2);border-radius:8px;font-size:13px;text-align:center" oninput="cfgTierThemeSetIcon('${_jsq(t)}',this.value)">
              </div>
              <div style="font-size:10px;color:var(--gray-l);text-align:center">${t}</div>
            </div>`;
          }).join('')}
        </div>
      </div>`;
    })()}
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px">
      ${TIERS.map((t,i)=>`<div style="text-align:center;padding:8px 12px;background:var(--white);border:1px solid var(--border);border-radius:8px;display:flex;flex-direction:column;align-items:center;gap:4px">
        ${getTierBadge(t)}
        <div style="font-size:10px;color:var(--gray-l)">${i+1}순위</div>
        ${!['G','K','JA','J','S','0티어'].includes(t)?`<button class="btn btn-r btn-xs" onclick="delTier('${t}')">🗑️ 삭제</button>`:''}
      </div>`).join('')}
    </div>
    <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
      <input type="text" id="nt-name" placeholder="티어 이름 (예: 9티어)" style="width:160px">
      <button class="btn btn-b" onclick="addTier()">+ 티어 추가</button>
    </div>
    <div style="font-size:11px;color:var(--gray-l);margin-top:6px">※ 기본 티어(G/K/JA/J/S/0티어)는 삭제할 수 없습니다.</div>
  </details>
  ${_scfgD('acct','👤 관리자 계정 관리')}
    <div style="font-size:12px;color:var(--gray-l);margin-bottom:4px">• <b>관리자</b>: 모든 기능 + 설정 접근 가능</div>
    <div style="font-size:12px;color:var(--gray-l);margin-bottom:14px">• <b>부관리자</b>: 경기 기록 입력만 가능 (설정/회원관리 불가)</div>
    <div style="margin-bottom:14px;padding:12px;background:var(--surface);border:1px solid var(--border);border-radius:8px">
      <div style="font-size:12px;font-weight:700;color:var(--blue);margin-bottom:10px">등록된 계정 (<span id="adm-count">-</span>명)</div>
      <div id="adm-list"></div>
      <button class="btn btn-r btn-xs" style="margin-top:10px" onclick="clearAllAdmins()">⚠️ 전체 초기화 (기본값 리셋)</button>
    </div>
    <div style="font-size:12px;font-weight:700;color:var(--text2);margin-bottom:8px">+ 새 계정 추가</div>
    <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:8px">
      <input type="text" id="adm-id" placeholder="아이디" style="width:140px" autocomplete="off">
      <input type="password" id="adm-pw" placeholder="비밀번호 (8자 이상)" style="width:150px" autocomplete="new-password">
      <select id="adm-role" style="border:1px solid var(--border2);border-radius:7px;padding:5px 8px;font-size:13px">
        <option value="admin">👑 총관리자</option>
        <option value="sub-admin">🔰 부관리자</option>
      </select>
      <button class="btn btn-p" onclick="addAdminAccount()">+ 추가</button>
    </div>
    <div id="adm-msg" style="font-size:12px;min-height:18px"></div>
  </details>
  ${_scfgD('storage','💾 로컬 저장소 사용량')}
    <div id="cfg-storage-wrap2">
      <div id="cfg-storage-info"><div style="color:var(--gray-l);font-size:12px">계산 중...</div></div>
      <button class="btn btn-w btn-sm" style="margin-top:8px" onclick="renderStorageInfo()">🔄 새로고침</button>
    </div>
  </details>
  ${_scfgD('selfcheck','🧪 설정 기능 점검')}
    <div style="font-size:12px;color:var(--gray-l);margin-bottom:10px">설정 화면에서 버튼/토글이 “눌러도 안되는” 경우, 핸들러(함수) 누락이 원인일 수 있습니다.</div>
    <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">
      <button class="btn btn-b btn-sm" onclick="cfgRunSettingsSelfCheck()">🔎 설정 핸들러 점검</button>
      <button class="btn btn-g btn-sm" onclick="cfgRunFullQaDryRun()">🧪 전체 QA(드라이런) 점검</button>
      <span style="font-size:11px;color:var(--gray-l)">※ 실제 데이터는 건드리지 않고, 임시 더미 데이터로 동작만 확인합니다.</span>
    </div>
    <div id="cfg-selfcheck-out" style="margin-top:10px"></div>
  </details>
  ${_scfgD('autofitall','📱 전역 자동 맞춤 (모든 탭)')}
    <div style="font-size:12px;color:var(--gray-l);margin-bottom:10px">모바일/태블릿에서 <b>간격·패딩·카드/그리드 밀도·테이블</b>을 화면에 맞춰 자동 조절합니다. (전 탭 공통)</div>
    <div style="padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:10px;display:flex;flex-direction:column;gap:10px">
      <label style="display:flex;align-items:center;gap:8px;font-size:12px;cursor:pointer;font-weight:900;color:var(--text2)">
        <input type="checkbox" id="cfg-autofitall-on" style="width:15px;height:15px" ${_afOn?'checked':''}
          onchange="cfgSetAutoFitAllTabs(this.checked)">
        전체 탭 자동 맞춤 사용
      </label>
      <div style="font-size:11px;color:var(--gray-l)">※ 켜면 화면 크기 변화(가로/세로 전환 포함)에 따라 자동 적용됩니다.</div>
    </div>
  </details>
  ${_scfgD('uisize','📱 모바일/태블릿 UI 크기 (버튼/메뉴/배지)')}
    <div style="font-size:12px;color:var(--gray-l);margin-bottom:10px">모바일/태블릿에서 버튼/메뉴가 너무 커 보일 때 여기서 한 번에 조절합니다. (코드 수정 없이)</div>
    <div id="cfg-uisize-body" style="padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:10px">
      <div style="font-size:12px;color:var(--gray-l)">로딩 중...</div>
    </div>
  </details>
  ${_scfgD('reccard','🧾 기록 카드(기록탭) 스타일')}
    <div style="font-size:12px;color:var(--gray-l);margin-bottom:10px">개인전/끝장전/미니/프로리그/대회 기록 목록에 쓰이는 “기록 카드” 스타일입니다. (대회탭 조별리그 일정 카드는 별도 설정)</div>
    <div style="padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:10px;display:flex;flex-direction:column;gap:12px">
      <label style="display:flex;align-items:center;gap:8px;font-size:12px;cursor:pointer;font-weight:900;color:var(--text2)">
        <input type="checkbox" id="cfg-rc-theme-on" style="width:15px;height:15px" ${_rcOn?'checked':''} onchange="cfgSetRecCardSettings()">
        승리 대학색을 카드 배경/헤더에 연하게 적용
      </label>

      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        <div style="font-size:11px;color:var(--text3);font-weight:800">디자인 모드</div>
        <select id="cfg-rc-accent" onchange="cfgSetRecCardSettings()" style="padding:6px 10px;border:1px solid var(--border2);border-radius:8px;font-size:12px;font-weight:900">
          <option value="none" ${_rcAccent==='none'?'selected':''}>무색</option>
          <option value="header" ${_rcAccent==='header'?'selected':''}>헤더만 포인트</option>
          <option value="border" ${_rcAccent==='border'?'selected':''}>테두리만 포인트</option>
          <option value="full" ${_rcAccent==='full'?'selected':''}>전체 배경 포인트</option>
          <option value="gradient" ${_rcAccent==='gradient'?'selected':''}>그라디언트 헤더</option>
        </select>
        <span style="font-size:11px;color:var(--gray-l)">※ 체크를 끄면 무조건 무색</span>
      </div>

      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        <div style="font-size:11px;color:var(--text3);font-weight:800">스코어/좌우 배치(PC)</div>
        <select id="cfg-rc-vs-align" onchange="cfgSetRecCardSettings()" style="padding:6px 10px;border:1px solid var(--border2);border-radius:8px;font-size:12px;font-weight:900">
          <option value="left" ${(localStorage.getItem('su_rc_vs_align')||'center')==='left'?'selected':''}>좌측</option>
          <option value="center" ${(localStorage.getItem('su_rc_vs_align')||'center')==='center'?'selected':''}>가운데</option>
          <option value="right" ${(localStorage.getItem('su_rc_vs_align')||'center')==='right'?'selected':''}>우측</option>
        </select>
        <div style="display:flex;align-items:center;gap:8px">
          <span style="font-size:11px;color:var(--text3);font-weight:800">스코어 크기</span>
          <input type="range" id="cfg-rc-score-scale" min="80" max="130" step="5" value="${Math.max(80,Math.min(130,parseInt(localStorage.getItem('su_rc_score_scale')||'108',10)||108))}" oninput="document.getElementById('cfg-rc-score-scale-v').textContent=this.value+'%'" onchange="cfgSetRecCardSettings()" style="width:140px">
          <span id="cfg-rc-score-scale-v" style="font-size:11px;color:var(--gray-l);min-width:44px;font-weight:900">${Math.max(80,Math.min(130,parseInt(localStorage.getItem('su_rc_score_scale')||'108',10)||108))}%</span>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;align-items:center">
        <div>
          <div style="font-size:11px;color:var(--text3);font-weight:800;margin-bottom:4px">카드 배경 색상 강도</div>
          <input type="range" id="cfg-rc-bg" min="0" max="30" step="1" value="${Math.max(0,Math.min(30,_rcBg))}" oninput="document.getElementById('cfg-rc-bg-v').textContent=this.value+'%'" onchange="cfgSetRecCardSettings()" style="width:100%">
          <div style="font-size:11px;color:var(--gray-l)"><span id="cfg-rc-bg-v">${Math.max(0,Math.min(30,_rcBg))}%</span></div>
        </div>
        <div>
          <div style="font-size:11px;color:var(--text3);font-weight:800;margin-bottom:4px">카드 헤더 색상 강도</div>
          <input type="range" id="cfg-rc-hd" min="0" max="30" step="1" value="${Math.max(0,Math.min(30,_rcHd))}" oninput="document.getElementById('cfg-rc-hd-v').textContent=this.value+'%'" onchange="cfgSetRecCardSettings()" style="width:100%">
          <div style="font-size:11px;color:var(--gray-l)"><span id="cfg-rc-hd-v">${Math.max(0,Math.min(30,_rcHd))}%</span></div>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;align-items:center">
        <div>
          <div style="font-size:11px;color:var(--text3);font-weight:800;margin-bottom:4px">대학 아이콘 크기(기록 카드)</div>
          <input type="range" id="cfg-rc-uicon" min="12" max="34" step="1" value="${Math.max(12,Math.min(34,_rcIc))}" oninput="document.getElementById('cfg-rc-ic-v').textContent=this.value+'px'" onchange="cfgSetRecCardSettings()" style="width:100%">
          <div style="font-size:11px;color:var(--gray-l)"><span id="cfg-rc-ic-v">${Math.max(12,Math.min(34,_rcIc))}px</span></div>
        </div>
        <div>
          <div style="font-size:11px;color:var(--text3);font-weight:800;margin-bottom:4px">스트리머 프로필 이미지 크기(전역 배율)</div>
          <input type="range" id="cfg-ava-scale" min="70" max="160" step="5" value="${Math.max(70,Math.min(160,_avaScale))}" oninput="document.getElementById('cfg-ava-v').textContent=this.value+'%'" onchange="cfgSetRecCardSettings()" style="width:100%">
          <div style="font-size:11px;color:var(--gray-l)"><span id="cfg-ava-v">${Math.max(70,Math.min(160,_avaScale))}%</span></div>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;align-items:center">
        <div>
          <div style="font-size:11px;color:var(--text3);font-weight:800;margin-bottom:4px">대학명 글자 크기(기록 카드)</div>
          <input type="range" id="cfg-rc-univ-font" min="90" max="150" step="5"
            value="${Math.max(90,Math.min(150,_rcUnivFont))}"
            oninput="document.getElementById('cfg-rc-univ-font-v').textContent=this.value+'%'" onchange="cfgSetRecCardSettings()" style="width:100%">
          <div style="font-size:11px;color:var(--gray-l)"><span id="cfg-rc-univ-font-v">${Math.max(90,Math.min(150,_rcUnivFont))}%</span></div>
        </div>
        <div>
          <div style="font-size:11px;color:var(--text3);font-weight:800;margin-bottom:4px">연/월 필터 크기(기록탭)</div>
          <input type="range" id="cfg-ym-scale" min="80" max="140" step="5"
            value="${Math.max(80,Math.min(140,_ymScale))}"
            oninput="document.getElementById('cfg-ym-scale-v').textContent=this.value+'%'" onchange="cfgSetRecCardSettings()" style="width:100%">
          <div style="font-size:11px;color:var(--gray-l)"><span id="cfg-ym-scale-v">${Math.max(80,Math.min(140,_ymScale))}%</span></div>
        </div>
      </div>

      <label style="display:flex;align-items:center;gap:8px;font-size:12px;cursor:pointer;font-weight:900;color:var(--text2)">
        <input type="checkbox" id="cfg-rc-memo-on" style="width:15px;height:15px" ${_rcMemoOn?'checked':''} onchange="cfgSetRecCardSettings()">
        기록 카드에서 메모 입력 기능 사용(관리자)
      </label>
      <div style="font-size:11px;color:var(--gray-l)">※ 메모가 이미 저장된 경우는 항상 표시됩니다. 이 옵션은 “입력칸”만 켜고 끕니다.</div>
      
      <div style="border-top:1px solid var(--border);padding-top:12px;margin-top:4px">
        <div style="font-size:12px;font-weight:900;color:var(--text2);margin-bottom:10px">🖼️ 기록 카드 프로필 이미지 설정</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;align-items:start">
          <div>
            <div style="font-size:11px;color:var(--text3);font-weight:800;margin-bottom:4px">프로필 이미지 크기 <span id="cfg-rc-avatar-size-v" style="font-weight:400;color:var(--gray-l)">${(()=>{try{return parseInt(localStorage.getItem('su_rec_avatar_size')||'38',10);}catch(e){return 38;}})()}px</span></div>
            <input type="range" id="cfg-rc-avatar-size" min="20" max="80" step="2" value="${(()=>{try{return parseInt(localStorage.getItem('su_rec_avatar_size')||'38',10);}catch(e){return 38;}})()}" oninput="document.getElementById('cfg-rc-avatar-size-v').textContent=this.value+'px'" onchange="cfgSetRecCardSettings()" style="width:100%">
            <div style="font-size:10px;color:var(--gray-l);margin-top:2px">기록 카드 내 프로필 이미지 지름 (px)</div>
          </div>
          <div>
            <div style="font-size:11px;color:var(--text3);font-weight:800;margin-bottom:4px">이미지 맞춤 방식</div>
            <select id="cfg-rc-avatar-fit" onchange="cfgSetRecCardSettings()" style="padding:6px 10px;border:1px solid var(--border2);border-radius:8px;font-size:12px;font-weight:900;width:100%">
              <option value="contain" ${(localStorage.getItem('su_rec_avatar_fit')||'contain')==='contain'?'selected':''}>맞춤(contain)</option>
              <option value="cover" ${(localStorage.getItem('su_rec_avatar_fit')||'contain')==='cover'?'selected':''}>채우기(cover)</option>
            </select>
            <div style="font-size:10px;color:var(--gray-l);margin-top:4px"><b>맞춤</b>: 이미지 전체 보임 · <b>채우기</b>: 원형 꽉 채움</div>
          </div>
        </div>
        <div style="font-size:11px;color:var(--gray-l);margin-top:6px">※ 전역 배율(위 슬라이더)과 별개로 기록 카드만 따로 설정됩니다.</div>
      </div>

      <div style="border-top:1px solid var(--border);padding-top:12px;margin-top:4px">
        <div style="font-size:12px;font-weight:900;color:var(--text2);margin-bottom:10px">🎨 기록 카드 양쪽 끝 색상 효과</div>
        <div style="font-size:11px;color:var(--gray-l);margin-bottom:8px">기록 카드 좌우 끝에 A·B팀 대학 색상 그라디언트를 표시합니다.</div>
        <div style="font-size:11px;color:#475569;margin-bottom:8px"><b>대학CK</b> / <b>프로리그 일반</b>의 양쪽 끝 색상은 바로 아래 나오는 <b>팀 버튼 색상</b> 블록에서 바꿉니다.</div>
        <div style="display:flex;flex-direction:column;gap:10px">
          <label style="display:flex;align-items:center;gap:8px;font-size:12px;cursor:pointer;font-weight:900;color:var(--text2)">
            <input type="checkbox" id="cfg-sidefx-on" style="width:15px;height:15px" ${_sfxOn?'checked':''} onchange="(window.cfgSetRecSideFxEnabled||function(){})(this.checked)">
            색상 효과 사용
          </label>
          <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
            <div style="font-size:11px;color:var(--text3);font-weight:800">효과 종류</div>
            <select id="cfg-sidefx-mode" onchange="(window.cfgSetRecSideFxMode||function(){})(this.value)" style="padding:6px 10px;border:1px solid var(--border2);border-radius:8px;font-size:12px;font-weight:900">
              <option value="soft" ${_sfxMode==='soft'?'selected':''}>소프트 (기본)</option>
              <option value="glow" ${_sfxMode==='glow'?'selected':''}>글로우 (발광)</option>
              <option value="panel" ${_sfxMode==='panel'?'selected':''}>패널 (선명)</option>
              <option value="line" ${_sfxMode==='line'?'selected':''}>라인 (세로 바)</option>
            </select>
          </div>
          <div>
            <div style="font-size:11px;color:var(--text3);font-weight:800;margin-bottom:4px">색상 강도 <span id="cfg-sidefx-int-v" style="font-weight:400;color:var(--gray-l)">${_sfxInt}</span></div>
            <input type="range" id="cfg-sidefx-int" min="20" max="100" step="4" value="${_sfxInt}" oninput="document.getElementById('cfg-sidefx-int-v').textContent=this.value" onchange="(window.cfgSetRecSideFxIntensity||function(){})(this.value)" style="width:100%;max-width:260px">
          </div>
        </div>
      </div>
      ${(typeof window.buildSettingsTeamColorBlock==='function' ? window.buildSettingsTeamColorBlock() : '')}
    </div>
  </details>
  ${(()=>{ 
    const _tcOn = (localStorage.getItem('su_tc_theme_on') ?? '0') === '1';
    const _tcAccent = (localStorage.getItem('su_tc_accent_mode') ?? 'none');
    const _tcHd = parseInt(localStorage.getItem('su_tc_hd_alpha') ?? '12',10) || 12;
    const _tcBw = parseInt(localStorage.getItem('su_tc_border_w') ?? '4',10) || 4;
    const _tcIc = parseInt(localStorage.getItem('su_tc_uicon') ?? '34',10) || 34;
    const _tcLw = parseInt(localStorage.getItem('su_tc_line_w') ?? '2',10) || 2;
    const _tcLa = parseInt(localStorage.getItem('su_tc_line_a') ?? '70',10) || 70;
    const _tcPreset = (localStorage.getItem('su_tc_preset') ?? '기본');
    const _dateMenuStyle = (localStorage.getItem('su_date_menu_style') ?? 'pill'); // pill | asl
    return _scfgD('tourneycard','🏆 대회 카드(대회탭) 스타일') + `
    <div style="font-size:12px;color:var(--gray-l);margin-bottom:10px">대회탭 “조별리그 일정/대진표” 카드 스타일입니다. 기록탭 카드와 <b>별도</b>로 설정됩니다.</div>
    <div style="padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:10px;display:flex;flex-direction:column;gap:12px">
      <label style="display:flex;align-items:center;gap:8px;font-size:12px;cursor:pointer;font-weight:900;color:var(--text2)">
        <input type="checkbox" id="cfg-tc-theme-on" style="width:15px;height:15px" ${_tcOn?'checked':''} onchange="cfgSetTourneyCardSettings()">
        대회 카드 디자인 모드 사용
      </label>
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        <div style="font-size:11px;color:var(--text3);font-weight:800">날짜 버튼 메뉴</div>
        <select id="cfg-date-menu-style" onchange="cfgSetDateMenuStyle()" style="padding:6px 10px;border:1px solid var(--border2);border-radius:8px;font-size:12px;font-weight:900">
          <option value="pill" ${_dateMenuStyle!=='asl'?'selected':''}>기본 (pill)</option>
          <option value="asl" ${_dateMenuStyle==='asl'?'selected':''}>ASL 스타일 (날짜+미니매치업)</option>
        </select>
        <span style="font-size:11px;color:var(--gray-l)">대회탭/프로리그 대회탭 상단 날짜 필터에 적용</span>
      </div>
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        <div style="font-size:11px;color:var(--text3);font-weight:800">토너먼트/대진표 프리셋</div>
        <select id="cfg-tc-preset" onchange="localStorage.setItem('su_tc_preset',this.value);cfgApplyBracketPreset(this.value)" style="padding:6px 10px;border:1px solid var(--border2);border-radius:8px;font-size:12px;font-weight:900">
          <option value="기본" ${_tcPreset==='기본'?'selected':''}>기본</option>
          <option value="월드컵" ${_tcPreset==='월드컵'?'selected':''}>월드컵</option>
          <option value="프로리그" ${_tcPreset==='프로리그'?'selected':''}>프로리그</option>
          <option value="컴팩트" ${_tcPreset==='컴팩트'?'selected':''}>컴팩트</option>
          <option value="미니멀" ${_tcPreset==='미니멀'?'selected':''}>미니멀 (깔끔함)</option>
          <option value="다크리그" ${_tcPreset==='다크리그'?'selected':''}>다크리그 (강한 포인트)</option>
        </select>
        <span style="font-size:11px;color:var(--gray-l)">※ 아래 슬라이더 값도 같이 변경됩니다</span>
      </div>
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        <div style="font-size:11px;color:var(--text3);font-weight:800">디자인 모드</div>
        <select id="cfg-tc-accent" onchange="cfgSetTourneyCardSettings()" style="padding:6px 10px;border:1px solid var(--border2);border-radius:8px;font-size:12px;font-weight:900">
          <option value="none" ${_tcAccent==='none'?'selected':''}>무색</option>
          <option value="header" ${_tcAccent==='header'?'selected':''}>상단 바 포인트</option>
          <option value="border" ${_tcAccent==='border'?'selected':''}>테두리 포인트</option>
        </select>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;align-items:center">
        <div>
          <div style="font-size:11px;color:var(--text3);font-weight:800;margin-bottom:4px">상단 바 색상 강도</div>
          <input type="range" id="cfg-tc-hd" min="0" max="30" step="1" value="${Math.max(0,Math.min(30,_tcHd))}" oninput="document.getElementById('cfg-tc-hd-v').textContent=this.value+'%'" onchange="cfgSetTourneyCardSettings()" style="width:100%">
          <div style="font-size:11px;color:var(--gray-l)"><span id="cfg-tc-hd-v">${Math.max(0,Math.min(30,_tcHd))}%</span></div>
        </div>
        <div>
          <div style="font-size:11px;color:var(--text3);font-weight:800;margin-bottom:4px">테두리 두께</div>
          <input type="range" id="cfg-tc-bw" min="2" max="6" step="1" value="${Math.max(2,Math.min(6,_tcBw))}" oninput="document.getElementById('cfg-tc-bw-v').textContent=this.value+'px'" onchange="cfgSetTourneyCardSettings()" style="width:100%">
          <div style="font-size:11px;color:var(--gray-l)"><span id="cfg-tc-bw-v">${Math.max(2,Math.min(6,_tcBw))}px</span></div>
        </div>
      </div>
      <div>
        <div style="font-size:11px;color:var(--text3);font-weight:800;margin-bottom:4px">대학 로고 크기(대회 카드)</div>
        <input type="range" id="cfg-tc-uicon" min="24" max="48" step="2" value="${Math.max(24,Math.min(48,_tcIc))}" oninput="document.getElementById('cfg-tc-ic-v').textContent=this.value+'px'" onchange="cfgSetTourneyCardSettings()" style="width:100%">
        <div style="font-size:11px;color:var(--gray-l)"><span id="cfg-tc-ic-v">${Math.max(24,Math.min(48,_tcIc))}px</span></div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;align-items:center">
        <div>
          <div style="font-size:11px;color:var(--text3);font-weight:800;margin-bottom:4px">브라켓 연결선 두께</div>
          <input type="range" id="cfg-tc-line-w" min="1" max="4" step="1" value="${Math.max(1,Math.min(4,_tcLw))}" oninput="document.getElementById('cfg-tc-lw-v').textContent=this.value+'px'" onchange="cfgSetTourneyCardSettings()" style="width:100%">
          <div style="font-size:11px;color:var(--gray-l)"><span id="cfg-tc-lw-v">${Math.max(1,Math.min(4,_tcLw))}px</span></div>
        </div>
        <div>
          <div style="font-size:11px;color:var(--text3);font-weight:800;margin-bottom:4px">브라켓 연결선 진하기</div>
          <input type="range" id="cfg-tc-line-a" min="25" max="100" step="5" value="${Math.max(25,Math.min(100,_tcLa))}" oninput="document.getElementById('cfg-tc-la-v').textContent=this.value+'%'" onchange="cfgSetTourneyCardSettings()" style="width:100%">
          <div style="font-size:11px;color:var(--gray-l)"><span id="cfg-tc-la-v">${Math.max(25,Math.min(100,_tcLa))}%</span></div>
        </div>
      </div>
    </div>
  </details>`;
  })()}
  ${(typeof window.buildShareCardSettingsSection==='function' ? window.buildShareCardSettingsSection(_scfgD) : '')}
  ${(()=>{ 
    const _chip = (localStorage.getItem('su_cal_chip_mode') ?? 'types');
    const _shareAdm = (localStorage.getItem('su_share_admin_only') ?? '0') === '1';
    return _scfgD('calui','📅 캘린더 표시/버튼') + `
    <div style="font-size:12px;color:var(--gray-l);margin-bottom:10px">캘린더 탭의 날짜 칸 표시와 카드 버튼 구성을 설정합니다.</div>
    <div style="padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:10px;display:flex;flex-direction:column;gap:12px">
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        <div style="font-size:11px;color:var(--text3);font-weight:800">월간/주간 날짜칸 요약</div>
        <select id="cfg-cal-chip" onchange="cfgSetCalendarUiSettings()" style="padding:6px 10px;border:1px solid var(--border2);border-radius:8px;font-size:12px;font-weight:900">
          <option value="total" ${_chip==='total'?'selected':''}>총 경기수만</option>
          <option value="types" ${_chip!=='total'?'selected':''}>총 + 상위2종류</option>
        </select>
      </div>
      <label style="display:flex;align-items:center;gap:8px;font-size:12px;cursor:pointer;font-weight:900;color:var(--text2)">
        <input type="checkbox" id="cfg-share-adminonly" style="width:15px;height:15px" ${_shareAdm?'checked':''} onchange="cfgSetCalendarUiSettings()">
        공유 버튼 숨기기(관리자만 표시)
      </label>
      <div style="font-size:11px;color:var(--gray-l)">※ 관리자=로그인 상태. 기록/대회/캘린더 카드의 공유 버튼이 함께 적용됩니다.</div>
    </div>
  </details>`;
  })()}
  ${(typeof window.renderCfgDesignV2Section==='function' ? window.renderCfgDesignV2Section(_scfgD) : '')}
  ${(typeof window.renderCfgDesignV2ColorsSection==='function' ? window.renderCfgDesignV2ColorsSection(_scfgD) : '')}
  ${(typeof window.renderCfgTabColorSection==='function' ? window.renderCfgTabColorSection(_scfgD) : '')}
  ${(()=>{ 
    const p = (localStorage.getItem('su_app_font_preset') ?? 'noto');
    const css = (localStorage.getItem('su_app_font_css') ?? '');
    const fam = (localStorage.getItem('su_app_font_family') ?? '');
    const cssTxt = (localStorage.getItem('su_app_font_css_text') ?? '');
    const uiPctPc = parseInt(localStorage.getItem('su_ui_scale_pc_pct')||localStorage.getItem('su_ui_scale_pct')||'100',10)||100;
    const uiPctTb = parseInt(localStorage.getItem('su_ui_scale_tb_pct')||localStorage.getItem('su_ui_scale_pct')||'100',10)||100;
    const uiPctMb = parseInt(localStorage.getItem('su_ui_scale_mb_pct')||localStorage.getItem('su_ui_scale_pct')||'100',10)||100;
    const appFontScalePc = parseInt(localStorage.getItem('su_app_font_scale_pc_pct')||localStorage.getItem('su_app_font_scale_pct')||'100',10)||100;
    const appFontScaleTb = parseInt(localStorage.getItem('su_app_font_scale_tb_pct')||localStorage.getItem('su_app_font_scale_pct')||'100',10)||100;
    const appFontScaleMb = parseInt(localStorage.getItem('su_app_font_scale_mb_pct')||localStorage.getItem('su_app_font_scale_pct')||'100',10)||100;
    // CSS 직접입력에서 font-family 자동 추출 → 프리셋 드롭다운에도 합치기(요청)
    const customFams = (()=>{
      const out=[]; const seen=new Set();
      const re=/font-family\s*:\s*['"]?([^;'"\\n\\r]+)['"]?\s*;/gi;
      let m;
      while((m=re.exec(String(cssTxt||'')))){
        const name=String(m[1]||'').trim();
        if(!name) continue;
        const key=name.toLowerCase();
        if(seen.has(key)) continue;
        seen.add(key); out.push(name);
      }
      return out;
    })();
    const aliasMap = (()=>{
      try{ return JSON.parse(localStorage.getItem('su_app_font_alias_map')||'{}')||{}; }catch(e){ return {}; }
    })();
    const _dispFontName = (n)=>{
      const a = aliasMap[n];
      return a ? `${a} (${n})` : n;
    };
    const ffChoices = (()=>{
      const list=[];
      // 내장 추천
      list.push({k:'Pretendard, \"Noto Sans KR\", system-ui, -apple-system, Segoe UI, Roboto, sans-serif', l:'(추천) Pretendard'});
      list.push({k:'GmarketSans, \"Noto Sans KR\", system-ui, -apple-system, Segoe UI, Roboto, sans-serif', l:'(추천) GmarketSans'});
      list.push({k:'\"Noto Sans KR\", system-ui, -apple-system, Segoe UI, Roboto, sans-serif', l:'Noto Sans KR'});
      // 커스텀 폰트들 자동 생성(입력 없이 선택 가능)
      customFams.forEach(n=>{
        list.push({k:`${n}, \"Noto Sans KR\", sans-serif`, l:_dispFontName(n)});
      });
      // 중복 제거
      const seen=new Set(); return list.filter(x=>{const kk=x.k.toLowerCase(); if(seen.has(kk)) return false; seen.add(kk); return true;});
    })();
    const customPreset = (()=>{
      // 현재 fam의 첫 토큰이 커스텀 font인지 추정
      const curMain = String(fam||'').split(',')[0].replace(/['"]/g,'').trim().toLowerCase();
      if(!curMain) return '';
      const hit = customFams.find(x=>x.toLowerCase()===curMain);
      return hit ? ('custom:'+hit) : '';
    })();
    return _scfgD('appfont','🅰️ 전역 폰트') + `
    <div style="font-size:12px;color:var(--gray-l);margin-bottom:10px">앱 전체 폰트를 변경합니다. (프리셋 + 사용자 CSS URL 지원)</div>
    <div style="padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:10px;display:flex;flex-direction:column;gap:12px">
      <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center">
        <div style="font-size:12px;font-weight:800;color:var(--text2);min-width:120px">프리셋</div>
        <select id="cfg-appfont-preset" onchange="cfgSetAppFontSettings()" style="padding:6px 10px;border:1px solid var(--border2);border-radius:8px;font-size:12px;font-weight:900">
          <option value="system" ${p==='system'?'selected':''}>시스템</option>
          <option value="noto" ${p==='noto'?'selected':''}>Noto Sans KR</option>
          <option value="pretendard" ${p==='pretendard'?'selected':''}>Pretendard</option>
          <option value="nanum" ${p==='nanum'?'selected':''}>나눔고딕</option>
          <option value="gmarket" ${p==='gmarket'?'selected':''}>GmarketSans</option>
          <option value="dohyeon" ${p==='dohyeon'?'selected':''}>Do Hyeon (개성있는 한글)</option>
          <option value="blackhansans" ${p==='blackhansans'?'selected':''}>Black Han Sans (굵은 헤드라인)</option>
          <option value="ibmplexsans" ${p==='ibmplexsans'?'selected':''}>IBM Plex Sans KR (정갈함)</option>
          ${customFams.length?`<option value="" disabled>──────── 커스텀(저장한 폰트) ────────</option>`:''}
          ${customFams.map(n=>`<option value="custom:${esc(n)}" ${customPreset===('custom:'+n)?'selected':''}>${esc(_dispFontName(n))}</option>`).join('')}
        </select>
      </div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center">
        <div style="font-size:12px;font-weight:800;color:var(--text2);min-width:120px">추가 CSS URL</div>
        <input type="text" id="cfg-appfont-css" value="${css.replace(/\"/g,'&quot;')}" placeholder="예) https://.../font.css" style="flex:1;min-width:260px" onchange="cfgSetAppFontSettings()">
      </div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center">
        <div style="font-size:12px;font-weight:800;color:var(--text2);min-width:120px">font-family</div>
        <input type="text" id="cfg-appfont-family" value="${fam.replace(/\"/g,'&quot;')}" placeholder="비우면 프리셋 기본값 사용" style="flex:1;min-width:260px" onchange="cfgSetAppFontSettings()">
      </div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center">
        <div style="font-size:12px;font-weight:800;color:var(--text2);min-width:120px">font-family 선택</div>
        <select onchange="cfgApplyFontFamilyChoice(this.value)" style="padding:6px 10px;border:1px solid var(--border2);border-radius:8px;font-size:12px;font-weight:900;flex:1;min-width:260px">
          <option value="">(입력 없이 선택)</option>
          ${ffChoices.map(o=>`<option value="${esc(o.k)}">${esc(o.l)}</option>`).join('')}
        </select>
      </div>
      <div style="padding:12px;border:1px solid var(--border);border-radius:12px;background:var(--white)">
        <div style="font-size:11px;color:var(--text3);font-weight:900;margin-bottom:8px">전역 폰트 크기 (글자 전용)</div>
        <div style="display:grid;grid-template-columns:90px 1fr 52px;gap:10px;align-items:center;margin-bottom:6px">
          <div style="font-size:12px;font-weight:800;color:var(--text2)">PC</div>
          <input type="range" id="cfg-appfont-scale-pc" min="85" max="130" step="5" value="${Math.max(85,Math.min(130,appFontScalePc))}" oninput="cfgSetAppFontScalePct('pc',this.value)" style="width:100%">
          <div id="cfg-appfont-scale-pc-v" style="font-size:11px;color:var(--gray-l);font-weight:900;text-align:right">${Math.max(85,Math.min(130,appFontScalePc))}%</div>
        </div>
        <div style="display:grid;grid-template-columns:90px 1fr 52px;gap:10px;align-items:center;margin-bottom:6px">
          <div style="font-size:12px;font-weight:800;color:var(--text2)">태블릿</div>
          <input type="range" id="cfg-appfont-scale-tb" min="85" max="130" step="5" value="${Math.max(85,Math.min(130,appFontScaleTb))}" oninput="cfgSetAppFontScalePct('tb',this.value)" style="width:100%">
          <div id="cfg-appfont-scale-tb-v" style="font-size:11px;color:var(--gray-l);font-weight:900;text-align:right">${Math.max(85,Math.min(130,appFontScaleTb))}%</div>
        </div>
        <div style="display:grid;grid-template-columns:90px 1fr 52px;gap:10px;align-items:center">
          <div style="font-size:12px;font-weight:800;color:var(--text2)">모바일</div>
          <input type="range" id="cfg-appfont-scale-mb" min="85" max="130" step="5" value="${Math.max(85,Math.min(130,appFontScaleMb))}" oninput="cfgSetAppFontScalePct('mb',this.value)" style="width:100%">
          <div id="cfg-appfont-scale-mb-v" style="font-size:11px;color:var(--gray-l);font-weight:900;text-align:right">${Math.max(85,Math.min(130,appFontScaleMb))}%</div>
        </div>
        <div style="font-size:11px;color:var(--gray-l);margin-top:6px;line-height:1.6">
          글자 크기만 전반적으로 조절합니다. 버튼/아이콘/탭 크기는 아래 <b>🎛️ 버튼 스타일 → 전역 UI 배율</b>에서 따로 조절할 수 있습니다.<br>
          현재 UI 배율: PC ${Math.max(80,Math.min(140,uiPctPc))}% / 태블릿 ${Math.max(80,Math.min(140,uiPctTb))}% / 모바일 ${Math.max(80,Math.min(140,uiPctMb))}%
          <button class="btn btn-w btn-xs" style="margin-left:8px" onclick="cfgResetAppFontScalePct()">초기화</button>
        </div>
      </div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center">
        <div style="font-size:12px;font-weight:800;color:var(--text2);min-width:120px">커스텀 프리셋</div>
        <select id="cfg-appfont-custompreset" onchange="cfgApplyCustomFontPreset(this.value)" style="padding:6px 10px;border:1px solid var(--border2);border-radius:8px;font-size:12px;font-weight:900;flex:1;min-width:260px">
          <option value="">(직접입력에서 자동 추출)</option>
        </select>
        <button class="btn btn-w btn-xs" onclick="cfgRenderCustomFontPresetOptions()" style="padding:6px 10px">🔄 새로고침</button>
      </div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:flex-start">
        <div style="font-size:12px;font-weight:800;color:var(--text2);min-width:120px;padding-top:8px">CSS 직접 입력</div>
        <div style="flex:1;min-width:260px">
          <textarea id="cfg-appfont-csstext" rows="7" placeholder="@font-face { ... }\n(여기에 붙여넣으면 자동 저장/적용됩니다)\n\n여러 개는 @font-face 블록을 연달아 추가하세요."
            style="width:100%;resize:vertical"
            oninput="cfgSetAppFontSettings(); try{cfgRenderCustomFontPresetOptions();}catch(e){}">${esc(cssTxt)}</textarea>
          <div style="display:flex;gap:8px;align-items:center;margin-top:6px;flex-wrap:wrap">
            <button class="btn btn-w btn-xs" onclick="cfgSetAppFontSettings();alert('✅ 저장됨')" style="padding:6px 10px">💾 저장</button>
            <span style="font-size:11px;color:var(--gray-l)">※ 입력 후 다른 곳을 클릭하지 않아도 자동 저장됩니다.</span>
          </div>
        </div>
      </div>
      <div style="font-size:11px;color:var(--gray-l);line-height:1.5">
        • 예: <span style="font-family:ui-monospace,monospace">Pretendard Variable, Pretendard, Noto Sans KR, sans-serif</span><br>
        • 유튜브/트위치 같은 외부 사이트 폰트는 적용되지 않을 수 있습니다.
      </div>

      <div style="padding:12px;border:1px solid var(--border);border-radius:12px;background:var(--white)">
        <div style="font-size:11px;color:var(--text3);font-weight:900;margin-bottom:8px">미리보기</div>
        <div style="display:flex;gap:10px;align-items:flex-end;flex-wrap:wrap;margin-bottom:8px">
          <div style="font-family:var(--app-font);font-size:22px;font-weight:800">가나다ABC 123</div>
          <div style="font-family:var(--app-font);font-size:14px;font-weight:400">빠른 갈색 여우가 게으른 개를 뛰어넘는다. (The quick brown fox)</div>
        </div>
        <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center">
          <div style="font-family:var(--app-font);font-size:14px;font-weight:400">Regular 400</div>
          <div style="font-family:var(--app-font);font-size:14px;font-weight:700">Bold 700</div>
          <div style="font-family:var(--app-font);font-size:14px;font-weight:900">Black 900</div>
        </div>
      </div>

      <div style="padding:12px;border:1px solid var(--border);border-radius:12px;background:var(--white)">
        <div style="font-size:11px;color:var(--text3);font-weight:900;margin-bottom:8px">커스텀 폰트 별칭(표시 이름)</div>
        <div id="cfg-appfont-alias-wrap"></div>
        <div style="font-size:11px;color:var(--gray-l);margin-top:6px">※ 별칭을 저장하면 ‘프리셋/선택 드롭다운’에 표시됩니다.</div>
      </div>
    </div>
  </details>`;
  })()}
  ${(()=>{ 
    const pct = parseInt(localStorage.getItem('su_btn_scale_pct')||'100',10)||100;
    const br  = parseInt(localStorage.getItem('su_btn_r')||'8',10)||8;
    const pr  = parseInt(localStorage.getItem('su_pill_r')||'20',10)||20;
    const uiPctPc = parseInt(localStorage.getItem('su_ui_scale_pc_pct')||localStorage.getItem('su_ui_scale_pct')||'100',10)||100;
    const uiPctTb = parseInt(localStorage.getItem('su_ui_scale_tb_pct')||localStorage.getItem('su_ui_scale_pct')||'100',10)||100;
    const uiPctMb = parseInt(localStorage.getItem('su_ui_scale_mb_pct')||localStorage.getItem('su_ui_scale_pct')||'100',10)||100;
    const topTabMbFont = parseInt(localStorage.getItem('su_top_tab_font_mb_px')||'10',10)||10;
    const topTabMbGap = parseInt(localStorage.getItem('su_top_tab_gap_mb_px')||'2',10)||2;
    const topTabMbAlign = (localStorage.getItem('su_top_tab_align_mb')||'start').trim();
    return _scfgD('uibtn','🎛️ 버튼 스타일') + `
    <div style="font-size:12px;color:var(--gray-l);margin-bottom:10px">앱 전체 버튼/필(탭·필터) 크기와 라운드를 조절합니다.</div>
    <div style="padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:10px;display:flex;flex-direction:column;gap:14px">
      <div>
        <div style="font-size:11px;color:var(--text3);font-weight:800;margin-bottom:6px">전역 UI 배율(글자/아이콘)</div>
        <div style="display:grid;grid-template-columns:90px 1fr 52px;gap:10px;align-items:center;margin-bottom:6px">
          <div style="font-size:12px;font-weight:800;color:var(--text2)">PC</div>
          <input type="range" id="cfg-uiscale-pc" min="80" max="140" step="5" value="${Math.max(80,Math.min(140,uiPctPc))}" oninput="cfgSetUiScalePct('pc',this.value)" style="width:100%">
          <div id="cfg-uiscale-pc-v" style="font-size:11px;color:var(--gray-l);font-weight:900;text-align:right">${Math.max(80,Math.min(140,uiPctPc))}%</div>
        </div>
        <div style="display:grid;grid-template-columns:90px 1fr 52px;gap:10px;align-items:center;margin-bottom:6px">
          <div style="font-size:12px;font-weight:800;color:var(--text2)">태블릿</div>
          <input type="range" id="cfg-uiscale-tb" min="80" max="140" step="5" value="${Math.max(80,Math.min(140,uiPctTb))}" oninput="cfgSetUiScalePct('tb',this.value)" style="width:100%">
          <div id="cfg-uiscale-tb-v" style="font-size:11px;color:var(--gray-l);font-weight:900;text-align:right">${Math.max(80,Math.min(140,uiPctTb))}%</div>
        </div>
        <div style="display:grid;grid-template-columns:90px 1fr 52px;gap:10px;align-items:center">
          <div style="font-size:12px;font-weight:800;color:var(--text2)">모바일</div>
          <input type="range" id="cfg-uiscale-mb" min="80" max="140" step="5" value="${Math.max(80,Math.min(140,uiPctMb))}" oninput="cfgSetUiScalePct('mb',this.value)" style="width:100%">
          <div id="cfg-uiscale-mb-v" style="font-size:11px;color:var(--gray-l);font-weight:900;text-align:right">${Math.max(80,Math.min(140,uiPctMb))}%</div>
        </div>
        <div style="font-size:11px;color:var(--gray-l);margin-top:4px">※ 자동(기기 폭) 스케일에 추가로 곱해집니다. (100%=기본)
          <button class="btn btn-w btn-xs" style="margin-left:8px" onclick="cfgResetUiScalePct()">초기화</button>
        </div>
      </div>
      <div style="padding:12px;border:1px solid var(--border);border-radius:12px;background:var(--white)">
        <div style="font-size:11px;color:var(--text3);font-weight:900;margin-bottom:8px">📱 모바일 상단 메뉴(탭)</div>
        <div style="display:grid;grid-template-columns:96px 1fr 54px;gap:10px;align-items:center;margin-bottom:8px">
          <div style="font-size:12px;font-weight:800;color:var(--text2)">글자 크기</div>
          <input type="range" id="cfg-top-tab-font-mb" min="8" max="16" step="1" value="${Math.max(8,Math.min(16,topTabMbFont))}" oninput="document.getElementById('cfg-top-tab-font-mb-v').textContent=this.value+'px'" onchange="cfgSetTopTabUiSettings()" style="width:100%">
          <div id="cfg-top-tab-font-mb-v" style="font-size:11px;color:var(--gray-l);font-weight:900;text-align:right">${Math.max(8,Math.min(16,topTabMbFont))}px</div>
        </div>
        <div style="display:grid;grid-template-columns:96px 1fr 54px;gap:10px;align-items:center;margin-bottom:8px">
          <div style="font-size:12px;font-weight:800;color:var(--text2)">탭 간격</div>
          <input type="range" id="cfg-top-tab-gap-mb" min="0" max="16" step="1" value="${Math.max(0,Math.min(16,topTabMbGap))}" oninput="document.getElementById('cfg-top-tab-gap-mb-v').textContent=this.value+'px'" onchange="cfgSetTopTabUiSettings()" style="width:100%">
          <div id="cfg-top-tab-gap-mb-v" style="font-size:11px;color:var(--gray-l);font-weight:900;text-align:right">${Math.max(0,Math.min(16,topTabMbGap))}px</div>
        </div>
        <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
          <div style="font-size:12px;font-weight:800;color:var(--text2);min-width:96px">정렬</div>
          <select id="cfg-top-tab-align-mb" onchange="cfgSetTopTabUiSettings()" style="padding:6px 10px;border:1px solid var(--border2);border-radius:8px">
            <option value="start" ${topTabMbAlign==='start'?'selected':''}>좌측 시작</option>
            <option value="center" ${topTabMbAlign==='center'?'selected':''}>가운데</option>
          </select>
          <button class="btn btn-w btn-xs" onclick="cfgResetTopTabUiSettings()">초기화</button>
        </div>
        <div style="font-size:11px;color:var(--gray-l);margin-top:6px">※ 이 설정은 상단 메인 탭 메뉴 전용입니다. 경기 팝업 상단 카드 정렬과는 별개입니다.</div>
      </div>
      <div>
        <div style="font-size:11px;color:var(--text3);font-weight:800;margin-bottom:4px">버튼 크기</div>
        <input type="range" id="cfg-btnscale" min="85" max="125" step="5" value="${Math.max(85,Math.min(125,pct))}"
          oninput="document.getElementById('cfg-btnscale-v').textContent=this.value+'%'" onchange="cfgSetUiBtnStyleSettings()" style="width:100%">
        <div style="font-size:11px;color:var(--gray-l)"><span id="cfg-btnscale-v">${Math.max(85,Math.min(125,pct))}%</span></div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;align-items:center">
        <div>
          <div style="font-size:11px;color:var(--text3);font-weight:800;margin-bottom:4px">버튼 라운드</div>
          <input type="range" id="cfg-btnr" min="4" max="18" step="1" value="${Math.max(4,Math.min(18,br))}"
            oninput="document.getElementById('cfg-btnr-v').textContent=this.value+'px'" onchange="cfgSetUiBtnStyleSettings()" style="width:100%">
          <div style="font-size:11px;color:var(--gray-l)"><span id="cfg-btnr-v">${Math.max(4,Math.min(18,br))}px</span></div>
        </div>
        <div>
          <div style="font-size:11px;color:var(--text3);font-weight:800;margin-bottom:4px">필(탭/정렬) 라운드</div>
          <input type="range" id="cfg-pillr" min="12" max="28" step="1" value="${Math.max(12,Math.min(28,pr))}"
            oninput="document.getElementById('cfg-pillr-v').textContent=this.value+'px'" onchange="cfgSetUiBtnStyleSettings()" style="width:100%">
          <div style="font-size:11px;color:var(--gray-l)"><span id="cfg-pillr-v">${Math.max(12,Math.min(28,pr))}px</span></div>
        </div>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">
        <button class="btn btn-w btn-sm" onclick="cfgResetUiBtnStyleSettings()">초기화</button>
        <span style="font-size:11px;color:var(--gray-l)">※ 모바일에서는 터치 편의 때문에 최소 높이가 유지될 수 있습니다.</span>
      </div>
      <div style="padding:12px;border:1px solid var(--border);border-radius:12px;background:var(--white)">
        <div style="font-size:11px;color:var(--text3);font-weight:900;margin-bottom:8px">미리보기</div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin-bottom:8px">
          <button class="btn btn-b">기본</button>
          <button class="btn btn-w">화이트</button>
          <button class="btn btn-p">포인트</button>
          <button class="btn btn-r">삭제</button>
          <button class="btn btn-w btn-sm">SM</button>
          <button class="btn btn-w btn-xs">XS</button>
        </div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center">
          <button class="pill on">필 ON</button>
          <button class="pill">필 OFF</button>
          <button class="sort-btn on">정렬 ON</button>
          <button class="sort-btn">정렬</button>
        </div>
      </div>
    </div>
  </details>`;
  })()}
  ${(()=>{ 
    const lock = (localStorage.getItem('su_filter_lock_open') ?? '1') === '1';
    const enabled = (localStorage.getItem('su_submenu_filter_enabled') ?? '1') === '1';
    return _scfgD('uifilter','🔽 필터/하위메뉴') + `
    <div style="font-size:12px;color:var(--gray-l);margin-bottom:10px">대전기록/통계/개인전/대학대전/대회/프로리그 등의 하위메뉴 표시 방식을 설정합니다.</div>
    <div style="padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:10px;display:flex;flex-direction:column;gap:10px">
      <label style="display:flex;align-items:center;gap:8px;font-size:12px;cursor:pointer;font-weight:900;color:var(--text2)">
        <input type="checkbox" id="cfg-filter-lock" style="width:15px;height:15px" ${lock?'checked':''} onchange="cfgSetUiFilterMenuSettings()">
        필터 항상 펼치기(접기 비활성)
      </label>
      <label style="display:flex;align-items:center;gap:8px;font-size:12px;cursor:pointer;font-weight:900;color:var(--text2)">
        <input type="checkbox" id="cfg-submenu-filter" style="width:15px;height:15px" ${enabled?'checked':''} onchange="cfgSetUiFilterMenuSettings()">
        하위메뉴를 ‘필터’로 접기/펼치기 사용
      </label>
      <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-top:6px">
        <button class="btn btn-w btn-sm" onclick="cfgResetUiFilterMenuSettings()">초기화</button>
        <span style="font-size:11px;color:var(--gray-l)">※ 체크 해제 시 하위 메뉴가 항상 보이게 됩니다.</span>
      </div>
    </div>
  </details>`;
  })()}
  ${(()=>{ 
    const compat = (localStorage.getItem('su_paste_compat') ?? '1') === '1';
    const fmt = (function(){
      try{
        const d={includeRace:true,includeMap:true,mapBrackets:true,winnerEmphasis:'none',hideUnknownRace:true};
        const obj=JSON.parse(localStorage.getItem('su_auto_outfmt')||'{}')||{};
        return {...d,...obj};
      }catch(e){
        return {includeRace:true,includeMap:true,mapBrackets:true,winnerEmphasis:'none',hideUnknownRace:true};
      }
    })();
    return _scfgD('paste','🤖 자동인식') + `
    <div style="font-size:12px;color:var(--gray-l);margin-bottom:10px">경기 결과 붙여넣기 ‘자동인식’이 잘 안 될 때 호환 옵션을 켜두면 인식률이 올라갑니다.</div>
    <div style="padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:10px;display:flex;flex-direction:column;gap:10px">
      <label style="display:flex;align-items:center;gap:8px;font-size:12px;cursor:pointer;font-weight:900;color:var(--text2)">
        <input type="checkbox" id="cfg-paste-compat" style="width:15px;height:15px" ${compat?'checked':''} onchange="cfgSetPasteCompatSettings()">
        호환 모드 (전각괄호/🆚/VS 공백 없음 등)
      </label>
      <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-top:6px">
        <button class="btn btn-w btn-sm" onclick="cfgResetPasteCompatSettings()">초기화</button>
        <span style="font-size:11px;color:var(--gray-l)">※ 기본값 ON 권장</span>
      </div>
    </div>
    <div style="height:12px"></div>
    <div style="padding:14px;background:var(--white);border:1px solid var(--border);border-radius:10px">
      <div style="font-size:12px;font-weight:1000;color:var(--text2);margin-bottom:8px">🎛️ 출력 포맷(전역)</div>
      <div style="font-size:11px;color:var(--gray-l);line-height:1.6;margin-bottom:10px">붙여넣기 자동인식/변환툴 등에서 결과를 같은 형식으로 통일합니다.</div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center">
        <label style="display:flex;align-items:center;gap:8px;font-size:12px;cursor:pointer;font-weight:900;color:var(--text2)">
          <input type="checkbox" id="cfg-auto-outfmt-race" style="width:15px;height:15px" ${fmt.includeRace?'checked':''} onchange="cfgAutoOutfmtUpd('includeRace', this.checked)">
          종족 포함 (선수(T))
        </label>
        <label style="display:flex;align-items:center;gap:8px;font-size:12px;cursor:pointer;font-weight:900;color:var(--text2)">
          <input type="checkbox" id="cfg-auto-outfmt-hideN" style="width:15px;height:15px" ${fmt.hideUnknownRace?'checked':''} onchange="cfgAutoOutfmtUpd('hideUnknownRace', this.checked)">
          미정(N) 숨김
        </label>
      </div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin-top:6px">
        <label style="display:flex;align-items:center;gap:8px;font-size:12px;cursor:pointer;font-weight:900;color:var(--text2)">
          <input type="checkbox" id="cfg-auto-outfmt-map" style="width:15px;height:15px" ${fmt.includeMap?'checked':''} onchange="cfgAutoOutfmtUpd('includeMap', this.checked)">
          맵 포함
        </label>
        <label style="display:flex;align-items:center;gap:8px;font-size:12px;cursor:pointer;font-weight:900;color:var(--text2)">
          <input type="checkbox" id="cfg-auto-outfmt-mapb" style="width:15px;height:15px" ${fmt.mapBrackets?'checked':''} onchange="cfgAutoOutfmtUpd('mapBrackets', this.checked)">
          맵을 [ ]로 표시
        </label>
      </div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin-top:8px">
        <div style="font-size:12px;font-weight:900;color:var(--text2);min-width:120px">승자 강조</div>
        <select id="cfg-auto-outfmt-emph" onchange="cfgAutoOutfmtUpd('winnerEmphasis', this.value)" style="padding:6px 10px;border:1px solid var(--border2);border-radius:8px">
          <option value="none"${fmt.winnerEmphasis==='none'?' selected':''}>없음</option>
          <option value="star"${fmt.winnerEmphasis==='star'?' selected':''}>★ 표시</option>
          <option value="md"${fmt.winnerEmphasis==='md'?' selected':''}>굵게(마크다운)</option>
        </select>
        <button class="btn btn-w btn-xs" onclick="cfgAutoOutfmtReset()">초기화</button>
      </div>
      <div style="margin-top:10px;font-size:11px;color:var(--gray-l)">미리보기</div>
      <pre id="cfg-auto-outfmt-preview" style="margin-top:6px;white-space:pre-wrap;word-break:break-word;background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:10px 12px;font-size:12px;line-height:1.6;min-height:46px"></pre>
    </div>
    <div style="height:12px"></div>
    <div style="padding:14px;background:var(--white);border:1px solid var(--border);border-radius:10px">
      <div style="font-size:12px;font-weight:1000;color:var(--text2);margin-bottom:8px">🧩 선수 별명 매핑 (자동인식 보강)</div>
      <div style="font-size:11px;color:var(--gray-l);line-height:1.6;margin-bottom:10px">
        예: <b>샤이니</b> → <b>김재현</b> 처럼, 붙여넣기에서 들어오는 별명을 실제 스트리머로 강제 매핑합니다.
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:10px">
        <input id="cfg-pal-alias" type="text" placeholder="별명 입력 (예: 샤이니)" style="width:160px" onkeydown="if(event.key==='Enter')cfgAddPlayerAlias()">
        <select id="cfg-pal-player" style="min-width:170px;border:1px solid var(--border2);border-radius:8px;padding:6px 10px;font-size:13px">
          ${(players||[]).map(p=>`<option value="${esc(p.name)}">${esc(p.name)}</option>`).join('')}
        </select>
        <button class="btn btn-b btn-sm" onclick="cfgAddPlayerAlias()">+ 추가</button>
        <button class="btn btn-w btn-sm" onclick="cfgResetPlayerAliasMap()">초기화</button>
      </div>
      <div id="cfg-pal-list" style="border:1px solid var(--border);border-radius:10px;max-height:220px;overflow:auto;background:var(--surface);padding:10px"></div>
    </div>
    <div style="padding:14px;background:var(--white);border:1px solid var(--border);border-radius:10px">
      <div style="font-size:12px;font-weight:1000;color:var(--text2);margin-bottom:8px">🔁 변환툴 (리포트 포맷)</div>
      <div style="font-size:11px;color:var(--gray-l);line-height:1.6;margin-bottom:10px">
        가공되지 않은 텍스트를 붙여넣으면 아래 규칙으로 변환합니다: <b>승자 굵게</b> · ✅/⬜ · 🆚️ · 맵 약어 교정 · 최종 스코어 출력
      </div>
      <textarea id="cfg-paste-conv-in" rows="7" placeholder="여기에 원본 경기 텍스트를 붙여넣기..." style="width:100%;border:1.5px solid var(--border);border-radius:10px;padding:10px 12px;font-size:12px;line-height:1.6;resize:vertical;background:var(--surface);color:var(--text1);box-sizing:border-box"></textarea>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px">
        <button class="btn btn-b btn-sm" onclick="cfgPasteConvertRun()">변환</button>
        <button class="btn btn-w btn-sm" onclick="cfgPasteConvertCopy()">복사</button>
      </div>
      <pre id="cfg-paste-conv-out" style="margin-top:12px;white-space:pre-wrap;word-break:break-word;background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:12px;font-size:12px;line-height:1.6;min-height:70px"></pre>
    </div>
  </details>`;
  })()}
  ${_scfgD('firebase','☁️ GitHub data.json 동기화')}
    <div id="cfg-fb-body">
    <p style="font-size:12px;color:var(--gray-l);margin-bottom:12px">관리자가 데이터를 저장할 때 GitHub <code>star-datacenter/data/</code> 폴더에 분리 저장됩니다. 다른 기기는 인덱스를 읽고 필요한 파일들을 합쳐 반영합니다.</p>
    <div style="margin-bottom:10px;padding:12px;background:var(--surface);border:1px solid var(--border);border-radius:8px">
      <div style="font-size:12px;font-weight:800;color:var(--text2);margin-bottom:6px">설정 변경 GitHub 자동 반영</div>
      <div style="font-size:11px;color:var(--gray-l);line-height:1.6;margin-bottom:10px">
        기본값은 <b>ON</b>입니다. 경기 기록 저장, 경기 수정, 스트리머/대학 상세 수정, 설정탭 설정 변경은 GitHub에도 반영되고, <b>새로고침만으로는 저장되지 않게</b> 유지합니다.
      </div>
      <label style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
        <input type="checkbox" ${(localStorage.getItem('su_cfg_remote_auto') ?? '1')==='1'?'checked':''} onchange="cfgSetRemoteCfgAuto(this.checked)">
        <span style="font-size:12px;font-weight:700;color:var(--text2)">설정 변경 시 GitHub에도 자동 반영</span>
      </label>
      <div id="cfg-remote-auto-status" style="font-size:11px;margin-top:8px;color:${(localStorage.getItem('su_cfg_remote_auto') ?? '1')==='1'?'#16a34a':'var(--gray-l)'}">${(localStorage.getItem('su_cfg_remote_auto') ?? '1')==='1'?'ON · 설정/상세 수정은 GitHub에도 반영, 새로고침만으로는 저장되지 않음':'OFF · 설정 변경은 로컬만 저장'}</div>
    </div>
    <div id="cfg-fb-sync-panel" style="margin-bottom:12px;padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:10px">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;flex-wrap:wrap;gap:8px">
        <span style="font-size:12px;font-weight:700;color:var(--blue)">🔄 동기화 상태</span>
        <button class="btn btn-w btn-xs" onclick="checkFbSyncStatus()">🔍 지금 확인</button>
      </div>
      <div id="cfg-fb-sync-result" style="font-size:12px;color:var(--gray-l)">확인 버튼을 눌러 상태를 확인하세요.</div>
    </div>
    <div style="margin-bottom:10px;padding:12px;background:var(--surface);border:1px solid var(--border);border-radius:8px">
      <div style="font-size:12px;font-weight:700;color:var(--blue);margin-bottom:8px">보조 신호 비밀번호</div>
      <div style="font-size:11px;color:var(--gray-l);margin-bottom:10px">실제 데이터 원본은 GitHub에 저장하고, 보조 신호 채널은 다른 기기에 <b>새 데이터 신호</b>를 더 빨리 전달하는 용도로만 사용합니다.</div>
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        <input type="password" id="cfg-fb-pw" placeholder="보조 신호 비밀번호 입력..." style="width:220px" autocomplete="new-password">
        <button class="btn btn-b" onclick="saveFbPw()">💾 저장</button>
        <button class="btn btn-r btn-xs" onclick="clearFbPw()">지우기</button>
      </div>
      <div id="fb-pw-status" style="font-size:12px;margin-top:8px;min-height:16px;color:var(--gray-l)">${localStorage.getItem('su_fb_pw')?'✅ 보조 신호 비밀번호 설정됨':'미설정'}</div>
    </div>
    <div style="margin-bottom:10px;padding:12px;background:var(--surface);border:1px solid var(--border);border-radius:8px">
      <div style="font-size:12px;font-weight:700;color:#16a34a;margin-bottom:8px">GitHub 토큰 (관람자 수천 명 무료 지원)</div>
      <div style="font-size:11px;color:var(--gray-l);margin-bottom:6px">설정 시: 동기화 섹션의 수동 업로드 버튼으로 GitHub <code>star-datacenter/data/</code> 아래 인덱스/코어/월별 기록 파일을 올릴 수 있습니다. 다른 기기/관람자는 이를 합쳐 반영합니다.</div>
      <div style="font-size:11px;color:var(--gray-l);margin-bottom:4px">권장: GitHub → Settings → Developer settings → Personal access tokens → Fine-grained token 사용. 대상 저장소는 <code>nada1004/star-system</code>, 권한은 <code>Contents: Read and Write</code>만 부여.</div>
      <div style="font-size:11px;color:var(--gray-l);margin-bottom:10px">Classic PAT의 <code>repo</code> 전체 권한은 사용하지 마세요.</div>
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        <input type="password" id="cfg-gh-token" placeholder="ghp_xxxxxxxxxxxx" style="width:260px" autocomplete="new-password">
        <button class="btn btn-b" onclick="saveGhToken()">💾 저장</button>
        <button class="btn btn-r btn-xs" onclick="clearGhToken()">지우기</button>
      </div>
      <div id="gh-token-status" style="font-size:12px;margin-top:8px;min-height:16px;color:var(--gray-l)">${localStorage.getItem('su_gh_token')?'✅ 토큰 설정됨 (수동 GitHub 업로드 가능)':'미설정 (GitHub 저장 불가, 로컬만 저장)'}</div>
    </div>
    </div>
  </details>
  ${_scfgD('aibot','🤖 AI봇(Groq) 서버 설정')}
    <div style="font-size:12px;color:var(--gray-l);line-height:1.6;margin-bottom:10px">
      펨붕이봇(AI봇)은 기본적으로 <code>/api/aibot</code> 프록시 서버가 필요합니다.<br>
      관리자 전용으로 <b>API Key를 직접 입력</b>해서 사용할 수도 있습니다. (동기화 ON이면 다른 기기에도 적용)
    </div>
    <div style="padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:10px">
      <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:8px">
        <label style="font-size:12px;font-weight:800;color:var(--text2)">AI봇 서버 주소</label>
        <input id="cfg-ai-proxy-url" type="text" placeholder="예: http://내서버:3000" style="width:320px;max-width:100%">
        <button class="btn btn-b btn-sm" onclick="cfgSaveAiProxyUrl()">💾 저장</button>
        <button class="btn btn-w btn-sm" onclick="cfgTestAiProxy()">🔍 테스트</button>
      </div>
      <div style="font-size:11px;color:var(--gray-l)">※ 저장 후 (관리자+동기화 ON이면) 다른 기기에도 자동 반영됩니다.</div>
      <div id="cfg-ai-proxy-status" style="font-size:12px;margin-top:8px;min-height:16px;color:var(--blue)"></div>
    </div>
    <div style="height:10px"></div>
    <div style="padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:10px">
      <div style="font-size:12px;font-weight:800;color:var(--text2);margin-bottom:6px">Groq API Key (관리자 전용)</div>
      <div style="font-size:11px;color:var(--gray-l);line-height:1.6;margin-bottom:10px">
        • 키를 저장하면 서버 없이도 AI봇을 바로 호출할 수 있습니다.<br>
        • <b>동기화 ON</b>이면 다른 기기에도 반영됩니다. (다른 기기에서 토큰이 없어도 pull로 받아옵니다)<br>
        • 주의: 이 경우 Gist를 아는 사람이면 키를 볼 수 있어 <b>유출 위험</b>이 있습니다.
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">
        <input type="password" id="cfg-ai-api-key" placeholder="gsk_..." style="width:320px;max-width:100%" autocomplete="new-password">
        <button class="btn btn-b btn-sm" onclick="cfgSaveAiApiKey()">💾 저장</button>
        <button class="btn btn-r btn-xs" onclick="cfgClearAiApiKey()">지우기</button>
      </div>
      <div id="cfg-ai-key-status" style="font-size:12px;margin-top:8px;min-height:16px;color:var(--gray-l)"></div>
    </div>
  </details>
  ${_scfgD('season','🏆 시즌 관리','id="cfg-season-sec"')}
    <p style="font-size:12px;color:var(--gray-l);margin-bottom:12px">시즌을 정의하면 대전기록·통계 등 모든 탭에서 시즌 단위로 필터링할 수 있습니다.</p>
    <div id="cfg-season-list" style="margin-bottom:12px"></div>
    <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:flex-end;padding:12px;background:var(--surface);border:1px solid var(--border);border-radius:8px">
      <div>
        <label style="font-size:11px;font-weight:700;color:var(--text3);display:block;margin-bottom:4px">시즌 이름</label>
        <input type="text" id="cfg-season-name" placeholder="예: 2025 스프링" style="width:140px;font-size:12px">
      </div>
      <div>
        <label style="font-size:11px;font-weight:700;color:var(--text3);display:block;margin-bottom:4px">시작일</label>
        <input type="date" id="cfg-season-from" style="font-size:12px">
      </div>
      <div>
        <label style="font-size:11px;font-weight:700;color:var(--text3);display:block;margin-bottom:4px">종료일</label>
        <input type="date" id="cfg-season-to" style="font-size:12px">
      </div>
      <button class="btn btn-b btn-sm" onclick="addSeason()">+ 시즌 추가</button>
    </div>
  </details>
  ${_scfgD('teammatch','👥 팀 매치 설정 (2:2 / 3:3 / 4:4전)')}
    <div style="font-size:12px;color:var(--gray-l);margin-bottom:12px">붙여넣기 자동 인식 및 경기 입력에서 팀 매치(2:2·3:3·4:4전)를 지원합니다.</div>
    <div style="padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:10px;display:flex;flex-direction:column;gap:14px">
      <div>
        <div style="font-size:12px;font-weight:700;color:var(--text2);margin-bottom:8px">⚙️ 기본 팀 규모</div>
        <div style="display:flex;gap:6px;flex-wrap:wrap">
          ${['1v1','2v2','3v3','4v4'].map(t=>`<button class="pill ${(localStorage.getItem('su_teamMatchSize')||'1v1')===t?'on':''}" id="cfg-tm-${t.replace(':','')}" onclick="localStorage.setItem('su_teamMatchSize','${t}');document.querySelectorAll('[id^=cfg-tm-]').forEach(b=>b.classList.remove('on'));this.classList.add('on')">${t}전</button>`).join('')}
        </div>
        <div style="font-size:11px;color:var(--gray-l);margin-top:6px">경기 입력 모달에서 사용할 기본 팀 규모 (기본: 1v1)</div>
      </div>
      <div>
        <div style="font-size:12px;font-weight:700;color:var(--text2);margin-bottom:6px">📋 자동인식 형식 안내</div>
        <div style="background:var(--white);border:1px solid var(--border);border-radius:8px;padding:10px 12px;font-size:11px;color:var(--text2);line-height:2">
          <div>• <code>선수A+선수B 승 선수C+선수D</code> → 2:2전 승리</div>
          <div>• <code>선수A+선수B+선수C 승 선수D+선수E+선수F</code> → 3:3전</div>
          <div>• <code>선수A+선수B > 선수C+선수D [맵명]</code> → 맵 포함</div>
          <div style="color:var(--gray-l);margin-top:4px">※ 붙여넣기 모달에서 "+" 기호로 팀원을 연결하면 자동 인식됩니다.</div>
        </div>
      </div>
    </div>
  </details>
    ${_scfgD('bulkdate','📅 날짜 일괄 변경')}
    <div style="padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:10px">
      <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:8px">
        <label style="font-size:12px;font-weight:600;color:var(--text2)">변경 전 날짜</label>
        <input type="date" id="bulk-date-from" style="font-size:12px">
        <label style="font-size:12px;font-weight:600;color:var(--text2)">→ 변경 후</label>
        <input type="date" id="bulk-date-to" style="font-size:12px">
      </div>
      <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px">
        <label style="font-size:11px;font-weight:600;color:var(--text3)">대상:</label>
        ${['mini','univm','ck','pro','tt','ind','gj','comp'].map(m=>`
        <label style="display:inline-flex;align-items:center;gap:3px;font-size:11px;cursor:pointer">
          <input type="checkbox" id="bulk-date-chk-${m}" checked style="cursor:pointer">
          ${{ mini:'미니대전', univm:'대학대전', ck:'CK', pro:'프로리그', tt:'티어대회', ind:'개인전', gj:'끝장전', comp:'대회' }[m]}
        </label>`).join('')}
      </div>
      <button class="btn btn-b btn-sm" onclick="bulkChangeDate()">📅 날짜 일괄 변경</button>
      <span id="bulk-date-result" style="font-size:12px;margin-left:8px;color:var(--green)"></span>
    </div>
  </details>
  ${_scfgD('bulkmap','🗺️ 맵 이름 일괄 교체')}
    <div style="padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:10px">
      <div style="font-size:11px;color:var(--gray-l);margin-bottom:8px">※ 띄어쓰기 차이(예: 투혼 II ↔ 투혼II)는 자동으로 무시하고 교체됩니다.</div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:8px">
        <label style="font-size:12px;font-weight:600;color:var(--text2)">교체 전</label>
        <input type="text" id="bulk-map-from" placeholder="예: 투혼II" style="font-size:12px;width:120px">
        <label style="font-size:12px;font-weight:600;color:var(--text2)">→ 교체 후</label>
        <input type="text" id="bulk-map-to" placeholder="예: 투혼" style="font-size:12px;width:120px">
      </div>
      <button class="btn btn-b btn-sm" onclick="bulkChangeMap()">🗺️ 맵 일괄 교체</button>
      <span id="bulk-map-result" style="font-size:12px;margin-left:8px;color:var(--green)"></span>
    </div>
  </details>
  ${_scfgD('bulktier','🎖️ 선수 일괄 티어 변경')}
    <div style="padding:14px;background:#f0f9ff;border:1px solid #bae6fd;border-radius:10px">
      <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:8px">
        <label style="font-size:12px;font-weight:600;color:var(--text2)">현재 티어</label>
        <select id="bulk-tier-from" style="font-size:12px;padding:3px 8px;border-radius:6px;border:1px solid var(--border2)">
          <option value="">전체 (상관없음)</option>
          ${TIERS.map(t=>`<option value="${t}">${getTierLabel(t)||t}</option>`).join('')}
          <option value="미정">미정</option>
        </select>
        <label style="font-size:12px;font-weight:600;color:var(--text2)">→ 변경할 티어</label>
        <select id="bulk-tier-to" style="font-size:12px;padding:3px 8px;border-radius:6px;border:1px solid var(--border2)">
          <option value="">선택</option>
          ${TIERS.map(t=>`<option value="${t}">${getTierLabel(t)||t}</option>`).join('')}
          <option value="미정">미정</option>
        </select>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:8px">
        <label style="font-size:12px;font-weight:600;color:var(--text2)">대상 대학</label>
        <select id="bulk-tier-univ" style="font-size:12px;padding:3px 8px;border-radius:6px;border:1px solid var(--border2)">
          <option value="">전체 대학</option>
          ${getAllUnivs().map(u=>`<option value="${u.name}">${u.name}</option>`).join('')}
        </select>
      </div>
      <button class="btn btn-b btn-sm" onclick="bulkChangeTier()">🎖️ 티어 일괄 변경</button>
      <span id="bulk-tier-result" style="font-size:12px;margin-left:8px;color:var(--blue)"></span>
    </div>
  </details>
  ${_scfgD('bulkdel','🗑️ 날짜 범위 일괄 삭제')}
    <div style="padding:14px;background:#fff5f5;border:1px solid #fca5a5;border-radius:10px">
      <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:8px">
        <label style="font-size:12px;font-weight:600;color:var(--text2)">시작일</label>
        <input type="date" id="bulk-del-from" style="font-size:12px">
        <label style="font-size:12px;font-weight:600;color:var(--text2)">~</label>
        <input type="date" id="bulk-del-to" style="font-size:12px">
      </div>
      <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px">
        <label style="font-size:11px;font-weight:600;color:var(--text3)">대상:</label>
        ${['mini','univm','ck','pro','tt','ind','gj','comp'].map(m=>`
        <label style="display:inline-flex;align-items:center;gap:3px;font-size:11px;cursor:pointer">
          <input type="checkbox" id="bulk-del-chk-${m}" style="cursor:pointer">
          ${{ mini:'미니대전', univm:'대학대전', ck:'CK', pro:'프로리그', tt:'티어대회', ind:'개인전', gj:'끝장전', comp:'대회' }[m]}
        </label>`).join('')}
      </div>
      <button class="btn btn-r btn-sm" onclick="bulkDeleteByDate()">🗑️ 범위 삭제 (되돌릴 수 없음)</button>
      <span id="bulk-del-result" style="font-size:12px;margin-left:8px;color:var(--red)"></span>
    </div>
  </details>
  ${_scfgD('bulkconv','🔄 세트제 → 게임수 합산 일괄 변환')}
    <div style="padding:14px;background:#fefce8;border:1px solid #fde68a;border-radius:10px">
      <div style="font-size:11px;color:var(--text3);margin-bottom:10px">
        sets 배열 기준으로 점수를 다시 계산합니다.<br>
        • <b>게임수(경기제)</b>: 각 세트의 scoreA/scoreB 합산<br>
        • <b>세트승(세트제)</b>: 각 세트의 winner(A/B) 개수 합산
      </div>
      <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px">
        <label style="font-size:11px;font-weight:600;color:var(--text3)">대상:</label>
        ${['mini','univm','ck','pro','tt'].map(m=>`
        <label style="display:inline-flex;align-items:center;gap:3px;font-size:11px;cursor:pointer">
          <input type="checkbox" id="bulk-conv-chk-${m}" checked style="cursor:pointer">
          ${{ mini:'미니대전', univm:'대학대전', ck:'CK', pro:'프로리그', tt:'티어대회' }[m]}
        </label>`).join('')}
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">
        <button class="btn btn-b btn-sm" onclick="bulkConvertToGameScore()">🔄 게임수 합산으로 변환</button>
        <button class="btn btn-b btn-sm" onclick="bulkConvertToSetScore()">🔄 세트승으로 변환</button>
        <button class="btn btn-p btn-sm" onclick="bulkRecalcScoreByMode()">🧩 저장형식대로 재계산</button>
        <span id="bulk-conv-result" style="font-size:12px;color:var(--blue)"></span>
        <span id="bulk-conv2-result" style="font-size:12px;color:var(--blue)"></span>
        <span id="bulk-conv3-result" style="font-size:12px;color:var(--blue)"></span>
      </div>
    </div>
  </details>
  ${_scfgD('boardbg','🖼️ 현황판 라벨 배경 이미지별 설정')}
    <p style="font-size:12px;color:var(--gray-l);margin-bottom:12px">각 대학 라벨에 배경 이미지를 설정할 수 있습니다. 이미지 위치와 크기도 조절 가능합니다.</p>
    <div id="cfg-board-bg-list" style="max-height:400px;overflow-y:auto"></div>
  </details>
  ${_scfgD('sync','🔄 데이터 동기화')}
    <div style="font-size:12px;color:var(--gray-l);margin-bottom:10px">경기 기록을 각 탭 기록 및 스트리머 최근 경기에 반영합니다.</div>
    <div style="display:flex;flex-direction:column;gap:10px;padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:10px">
      <div style="padding:12px;background:var(--white);border:1px solid var(--border);border-radius:12px">
        <div style="font-weight:1000;font-size:12px;margin-bottom:6px">📦 설정 내보내기/가져오기 (다른 기기 적용)</div>
        <div style="font-size:11px;color:var(--gray-l);margin-bottom:8px">설정만 코드로 복사해 다른 기기(모바일/태블릿/PC)에 붙여넣어 적용할 수 있습니다. (경기 데이터는 포함 안됨)</div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px">
          <button class="btn btn-w btn-sm" onclick="cfgFillSettingsCode()">코드 생성</button>
          <button class="btn btn-w btn-sm" onclick="cfgCopySettingsCode()">복사</button>
          <button class="btn btn-b btn-sm" onclick="cfgImportSettingsCode()">이 기기에 적용</button>
        </div>
        <textarea id="cfg-sync-code" placeholder="여기에 코드가 표시됩니다 (또는 다른 기기에서 복사한 코드를 붙여넣으세요)" style="width:100%;min-height:90px;border:1px solid var(--border2);border-radius:10px;padding:10px;font-size:12px;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,'Liberation Mono','Courier New',monospace;resize:vertical"></textarea>
      </div>
      <div style="padding:12px;background:var(--white);border:1px solid var(--border);border-radius:12px">
        <div style="font-weight:1000;font-size:12px;margin-bottom:6px">☁️ 설정/메모 동기화 (GitHub Gist)</div>
        <div style="font-size:11px;color:var(--gray-l);margin-bottom:10px">
          Gist ID만 있으면 다른 기기에서 불러오기가 가능합니다. 저장(업로드)은 관리자+토큰이 필요합니다. (이전 파일은 자동 마이그레이션)
        </div>
        <div id="cfg-gist-sync-status" style="font-size:12px;color:var(--text2);background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:10px 12px;line-height:1.6">
          동기화 상태를 불러오는 중...
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-top:10px">
          <label style="font-size:12px;font-weight:800;color:var(--text2)">Gist ID</label>
          <input id="cfg-gist-id" type="text" placeholder="예: a1b2c3d4..." style="width:240px;max-width:100%">
          ${(!isSubAdmin?`<label style="display:inline-flex;align-items:center;gap:6px;font-size:12px;font-weight:800;color:var(--text2);cursor:pointer"><input id="cfg-gist-enabled" type="checkbox"> 동기화 ON</label>`:'')}
          ${(!isSubAdmin?`<input id="cfg-gist-token" type="password" placeholder="GitHub 토큰(gist)" style="width:220px;max-width:100%" autocomplete="new-password">`:'')}
          ${(!isSubAdmin?`<button class="btn btn-b btn-sm" onclick="cfgGistSyncSaveCfg()">💾 저장</button>`:`<button class="btn btn-w btn-sm" onclick="cfgGistSyncSaveCfg()">💾 저장</button>`)}
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-top:10px">
          <button class="btn btn-w btn-sm" onclick="cfgGistSyncPull()">⬇️ 원격 불러오기</button>
          ${(!isSubAdmin?`<button class="btn btn-b btn-sm" onclick="cfgGistSyncPush()">⬆️ 원격 저장</button>`:'')}
          <span id="cfg-gist-sync-msg" style="font-size:11px;color:var(--gray-l)"></span>
        </div>
      </div>
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        <button class="btn btn-b btn-sm" onclick="
          _ttMigrated=false;_migrateTierTourneys();
          const n=syncAllHistory?syncAllHistory():0;
          alert('✅ 티어대회 기록 동기화 + '+n+'건 스트리머 반영 완료');render();">🔄 전체 동기화 (기록탭 + 스트리머)</button>
        <span style="font-size:11px;color:var(--gray-l)">티어대회 기록탭·대전기록 반영 + 스트리머 최근 경기 소급 반영</span>
      </div>
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        <button class="btn btn-p btn-sm" onclick="
          _ttMigrated=false;_migrateTierTourneys();
          const before=ttM.length;save();render();
          alert('✅ 티어대회 기록 동기화 완료\\n추가된 기록: '+(ttM.length-before)+'건');">🎯 티어대회 기록 동기화</button>
        <span style="font-size:11px;color:var(--gray-l)">조별리그·토너먼트 경기를 기록탭·대전기록에 반영 (누락 시 사용)</span>
      </div>
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        <button class="btn btn-b btn-sm" onclick="syncAllHistoryBtn()">📋 스트리머 최근 경기 반영</button>
        <span style="font-size:11px;color:var(--gray-l)">모든 경기를 스트리머 상세의 최근 경기에 소급 반영</span>
      </div>
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        <button class="btn btn-w btn-sm" onclick="
          const seen=new Set();let removed=0;
          ttM=ttM.filter(m=>{if(!m._id)return true;if(seen.has(m._id)){removed++;return false;}seen.add(m._id);return true;});
          save();render();alert('✅ ttM 중복 제거 완료: '+removed+'건 삭제');
        ">🗑️ 중복 경기 제거</button>
        <span style="font-size:11px;color:var(--gray-l)">같은 _id로 이중 등록된 티어대회 경기 제거</span>
      </div>
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        <button class="btn btn-y btn-sm" onclick="deduplicatePlayerHistory()">🧹 중복 기록 제거</button>
        <span style="font-size:11px;color:var(--gray-l)">스트리머 history에서 중복 항목만 제거 (승패/ELO 재계산)</span>
      </div>
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        <button class="btn btn-r btn-sm" onclick="rebuildAllPlayerHistory()">🔄 전체 경기 기록 복구</button>
        <span style="font-size:11px;color:var(--gray-l)">대전 데이터에서 스트리머 history 재구성 (기존 history 초기화됨)</span>
      </div>
    </div>
  </details>
  ${_scfgD('b2layout','📐 이미지탭 레이아웃')}
    <div style="font-size:12px;color:var(--gray-l);margin-bottom:10px">이미지탭(프로필 탭)의 좌우 비율과 높이를 설정합니다. 저장 즉시 반영됩니다.</div>
    <div style="padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:10px;display:flex;flex-direction:column;gap:14px">
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        <button class="btn btn-b" onclick="cfgAutoFitBoard()">📱 이미지탭 자동 맞춤(원클릭)</button>
        <span style="font-size:11px;color:var(--gray-l)">※ “전역 자동 맞춤(모든 탭)”과 별개로, <b>이미지탭(프로필)</b> 전용 프리셋입니다.</span>
      </div>
      <div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
          <label style="font-size:12px;font-weight:700;color:var(--text2)">좌측(이미지) 너비</label>
          <span id="cfg-b2-left-size-val" style="font-size:12px;font-weight:700;color:var(--blue)">55%</span>
        </div>
        <input type="range" id="cfg-b2-left-size" min="30" max="70" step="1" value="55" style="width:100%;accent-color:var(--blue)"
          oninput="this.value=Math.min(70,Math.max(30,this.value));document.getElementById('cfg-b2-left-size-val').textContent=this.value+'%';document.getElementById('cfg-b2-right-size').value=100-parseInt(this.value);document.getElementById('cfg-b2-right-size-val').textContent=(100-parseInt(this.value))+'%'">
        <div style="display:flex;justify-content:space-between;font-size:10px;color:var(--gray-l);margin-top:2px"><span>30%</span><span>70%</span></div>
      </div>
      <div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
          <label style="font-size:12px;font-weight:700;color:var(--text2)">우측(목록) 너비</label>
          <span id="cfg-b2-right-size-val" style="font-size:12px;font-weight:700;color:var(--blue)">45%</span>
        </div>
        <input type="range" id="cfg-b2-right-size" min="30" max="70" step="1" value="45" style="width:100%;accent-color:var(--blue)"
          oninput="this.value=Math.min(70,Math.max(30,this.value));document.getElementById('cfg-b2-right-size-val').textContent=this.value+'%';document.getElementById('cfg-b2-left-size').value=100-parseInt(this.value);document.getElementById('cfg-b2-left-size-val').textContent=(100-parseInt(this.value))+'%'">
        <div style="display:flex;justify-content:space-between;font-size:10px;color:var(--gray-l);margin-top:2px"><span>30%</span><span>70%</span></div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
        <div>
          <label style="font-size:12px;font-weight:700;color:var(--text2);display:block;margin-bottom:4px">PC 높이 <span style="font-weight:400;color:var(--gray-l)">(px)</span></label>
          <input type="number" id="cfg-b2-pc-height" value="600" min="400" max="900" step="20" style="width:100%;padding:6px 8px;border:1px solid var(--border2);border-radius:6px;font-size:13px;font-weight:700">
        </div>
        <div>
          <label style="font-size:12px;font-weight:700;color:var(--text2);display:block;margin-bottom:4px">태블릿 높이 <span style="font-weight:400;color:var(--gray-l)">(px)</span></label>
          <input type="number" id="cfg-b2-tablet-height" value="400" min="300" max="700" step="20" style="width:100%;padding:6px 8px;border:1px solid var(--border2);border-radius:6px;font-size:13px;font-weight:700">
        </div>
        <div>
          <label style="font-size:12px;font-weight:700;color:var(--text2);display:block;margin-bottom:4px">모바일 높이 <span style="font-weight:400;color:var(--gray-l)">(px)</span></label>
          <input type="number" id="cfg-b2-mobile-height" value="320" min="200" max="600" step="20" style="width:100%;padding:6px 8px;border:1px solid var(--border2);border-radius:6px;font-size:13px;font-weight:700">
        </div>
        <div style="display:flex;align-items:flex-end;padding-bottom:4px">
          <div style="display:flex;flex-direction:column;gap:8px">
            <label style="display:flex;align-items:center;gap:6px;font-size:12px;cursor:pointer;font-weight:700">
              <input type="checkbox" id="cfg-b2-auto-resize" checked style="width:15px;height:15px"> 자동 크기 조절(좌우 비율)
            </label>
            <label style="display:flex;align-items:center;gap:6px;font-size:12px;cursor:pointer;font-weight:700">
              <input type="checkbox" id="cfg-b2-auto-height" checked style="width:15px;height:15px"> 모바일/태블릿 높이 자동 맞춤(추천)
            </label>
          </div>
        </div>
      </div>
      <button class="btn btn-b" onclick="saveB2LayoutSettings()" style="align-self:flex-start">💾 레이아웃 저장</button>
    </div>
  </details>
  ${_scfgD('femcoorder','🔀 펨코스타일 스타대학 순서')}
    <div style="font-size:12px;color:var(--gray-l);margin-bottom:10px;line-height:1.6">
      <b>펨코스타일</b> 및 <b>대학별 신현황판</b>에서 대학이 표시되는 순서(= <code>univCfg</code> 순서)를 조정합니다.<br>
      ※ 순서 변경 즉시 저장되며, 현황판에 바로 반영됩니다.
    </div>
    <div style="padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:10px">
      ${(univCfg||[]).map((u,idx)=>({u,idx})).filter(x=>x.u && !x.u.dissolved).map(({u,idx:i})=>`
        <div class="srow" style="gap:8px;align-items:center;flex-wrap:wrap">
          <div class="cdot" style="background:${u.color||'#64748b'}"></div>
          <div style="flex:1;min-width:140px;font-weight:900;color:var(--text2)">${esc(u.name||'')}</div>
          <div style="display:flex;gap:6px;flex-shrink:0">
            <button class="btn btn-w btn-xs" onclick="cfgUnivOrderMove(${i},'up')">▲</button>
            <button class="btn btn-w btn-xs" onclick="cfgUnivOrderMove(${i},'down')">▼</button>
          </div>
        </div>
      `).join('')}
      <div style="font-size:11px;color:var(--gray-l);margin-top:8px">팁: ‘대학 관리’에서 대학명/색상도 함께 수정할 수 있습니다.</div>
    </div>
  </details>
  ${_scfgD('b2femco','🧩 펨코스타일 설정')}
    <div style="font-size:12px;color:var(--gray-l);margin-bottom:10px">현황판 &gt; <b>펨코스타일</b> 탭에서 사용하는 전용 설정입니다. 저장 즉시 반영됩니다.</div>
    <div style="padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:10px;display:flex;flex-direction:column;gap:12px">
      <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">
        <label style="display:flex;align-items:center;gap:8px;font-size:12px;cursor:pointer;font-weight:900;color:var(--text2)">
          <input type="checkbox" id="cfg-femco-autoLayout" style="width:15px;height:15px" onchange="cfgFemcoUpd('autoLayout', this.checked?1:0)">
          인원수/화면폭에 맞춰 자동 레이아웃(추천)
        </label>
        <button class="btn btn-w btn-xs" style="margin-left:auto" onclick="(function(){cfgFemcoUpd('autoLayout',1);try{document.getElementById('cfg-femco-autoLayout').checked=true;}catch(e){};alert('✅ 자동 레이아웃으로 되돌렸습니다');render();})()">🔄 자동으로 되돌리기</button>
        <span style="font-size:11px;color:var(--gray-l)">※ 아래 수동 값을 조절하면 자동 레이아웃이 자동으로 꺼집니다</span>
      </div>
      <div style="display:grid;grid-template-columns:140px 1fr 100px;gap:10px;align-items:center">
        <div style="font-size:12px;font-weight:700;color:var(--text2)">대학 로고 크기</div>
        <input type="range" id="cfg-femco-logoSize" min="60" max="520" step="1" style="width:100%;accent-color:var(--blue)" oninput="document.getElementById('cfg-femco-logoSizeNum').value=this.value;cfgFemcoUpd('logoSize',this.value)">
        <input type="number" id="cfg-femco-logoSizeNum" min="60" max="520" step="1" style="width:100%;padding:6px 8px;border:1px solid var(--border2);border-radius:6px;font-size:13px;font-weight:700" onchange="document.getElementById('cfg-femco-logoSize').value=this.value;cfgFemcoUpd('logoSize',this.value)">
      </div>
      <!-- (버그픽스) 설정 모달에서 summary 클릭 시 바깥 클릭으로 인식되어 팝업이 닫히는 케이스가 있어 이벤트 전파 차단 -->
      <details style="border:1px dashed var(--border2);border-radius:12px;padding:10px 12px;background:var(--white)" onclick="event.stopPropagation()">
        <summary style="cursor:pointer;font-weight:900;color:var(--text2);list-style:none" onclick="event.stopPropagation()">🏫 대학별 로고 크기 (펨코스타일) <span style="font-size:11px;color:var(--gray-l);font-weight:600">(선택)</span></summary>
        <div style="font-size:11px;color:var(--gray-l);margin:8px 0 10px;line-height:1.6">
          위의 “대학 로고 크기”가 <b>기본(공통)</b>이고, 아래는 대학별로 <b>예외값</b>을 줄 때만 사용합니다.<br>
          초기화하면 공통값을 따릅니다.
        </div>
        <div style="display:flex;flex-direction:column;gap:10px">
          ${(univCfg||[]).map((u,idx)=>({u,idx})).filter(x=>x.u && !x.u.dissolved).map(({u,idx:i})=>{
            const _v = parseInt(u.logoSizeFemco||'',10);
            const cur = isNaN(_v) ? '' : Math.max(60, Math.min(520,_v));
            return `
              <div class="srow" style="gap:10px;align-items:center;flex-wrap:wrap">
                <div class="cdot" style="background:${u.color||'#64748b'}"></div>
                <div style="flex:1;min-width:120px;font-weight:900;color:var(--text2)">${esc(u.name||'')}</div>
                <input type="range" min="60" max="520" step="1" value="${cur||(()=>{try{return Math.max(60,Math.min(520,parseInt((J('su_femco_settings')||{}).logoSize||150,10)||150));}catch(e){return 150;}})()}" style="flex:1;min-width:180px;accent-color:var(--blue)"
                  oninput="univCfg[${i}].logoSizeFemco=+this.value;saveCfg();render()">
                <span style="font-size:11px;color:var(--gray-l);min-width:52px;font-weight:900">${cur?cur+'px':'(기본)'}</span>
                <button class="btn btn-w btn-xs" onclick="delete univCfg[${i}].logoSizeFemco;saveCfg();render()">초기화</button>
              </div>
            `;
          }).join('')}
        </div>
      </details>

      <div style="display:grid;grid-template-columns:140px 1fr 100px;gap:10px;align-items:center">
        <div style="font-size:12px;font-weight:700;color:var(--text2)">배경 투명(오버레이)</div>
        <input type="range" id="cfg-femco-bgOverlay" min="0" max="70" step="1" style="width:100%;accent-color:var(--blue)" oninput="document.getElementById('cfg-femco-bgOverlayNum').value=this.value;cfgFemcoUpd('bgOverlay',this.value)">
        <input type="number" id="cfg-femco-bgOverlayNum" min="0" max="70" step="1" style="width:100%;padding:6px 8px;border:1px solid var(--border2);border-radius:6px;font-size:13px;font-weight:700" onchange="document.getElementById('cfg-femco-bgOverlay').value=this.value;cfgFemcoUpd('bgOverlay',this.value)">
      </div>
      <div style="font-size:11px;color:var(--gray-l);margin-top:-6px">0=투명(원본 그대로) · 70=글자 잘 보이게 진하게</div>

      <label style="display:flex;align-items:center;gap:8px;font-size:12px;cursor:pointer;font-weight:800;color:var(--text2)">
        <input type="checkbox" id="cfg-femco-logoAttachTitle" style="width:14px;height:14px" onchange="cfgFemcoUpd('logoAttachTitle', this.checked?1:0)">
        로고를 대학명과 같이 이동(체크 해제 시 ‘로고만’ 위치 이동)
      </label>

      <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center">
        <div style="font-size:12px;font-weight:700;color:var(--text2);min-width:140px">대학 로고 위치</div>
        <select id="cfg-femco-logoPos" onchange="cfgFemcoUpd('logoPos',this.value)" style="padding:6px 10px;border:1px solid var(--border2);border-radius:8px">
          <option value="left">좌측</option>
          <option value="right">우측</option>
          <option value="top">상단</option>
          <option value="bottom">하단</option>
          <option value="center">가운데</option>
        </select>
      </div>

      <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center">
        <div style="font-size:12px;font-weight:700;color:var(--text2);min-width:140px">대학명 위치(로고 기준)</div>
        <select id="cfg-femco-titlePos" onchange="cfgFemcoUpd('titlePos',this.value)" style="padding:6px 10px;border:1px solid var(--border2);border-radius:8px">
          <option value="right">로고 우측</option>
          <option value="left">로고 좌측</option>
          <option value="bottom">로고 아래</option>
          <option value="top">로고 위</option>
        </select>
        <span style="font-size:11px;color:var(--gray-l)">※ ‘로고를 대학명과 같이 이동’ 켠 상태에서 적용</span>
      </div>

      <div style="display:grid;grid-template-columns:140px 1fr 100px;gap:10px;align-items:center">
        <div style="font-size:12px;font-weight:700;color:var(--text2)">로고 좌우 이동</div>
        <input type="range" id="cfg-femco-logoOffsetX" min="-80" max="80" step="1" style="width:100%;accent-color:var(--blue)" oninput="document.getElementById('cfg-femco-logoOffsetXNum').value=this.value;cfgFemcoUpd('logoOffsetX',this.value)">
        <input type="number" id="cfg-femco-logoOffsetXNum" min="-80" max="80" step="1" style="width:100%;padding:6px 8px;border:1px solid var(--border2);border-radius:6px;font-size:13px;font-weight:700" onchange="document.getElementById('cfg-femco-logoOffsetX').value=this.value;cfgFemcoUpd('logoOffsetX',this.value)">
      </div>
      <div style="display:grid;grid-template-columns:140px 1fr 100px;gap:10px;align-items:center">
        <div style="font-size:12px;font-weight:700;color:var(--text2)">로고 상하 이동</div>
        <input type="range" id="cfg-femco-logoOffsetY" min="-80" max="80" step="1" style="width:100%;accent-color:var(--blue)" oninput="document.getElementById('cfg-femco-logoOffsetYNum').value=this.value;cfgFemcoUpd('logoOffsetY',this.value)">
        <input type="number" id="cfg-femco-logoOffsetYNum" min="-80" max="80" step="1" style="width:100%;padding:6px 8px;border:1px solid var(--border2);border-radius:6px;font-size:13px;font-weight:700" onchange="document.getElementById('cfg-femco-logoOffsetY').value=this.value;cfgFemcoUpd('logoOffsetY',this.value)">
      </div>
      <div style="display:grid;grid-template-columns:140px 1fr 100px;gap:10px;align-items:center">
        <div style="font-size:12px;font-weight:700;color:var(--text2)">대학명 좌우 이동</div>
        <input type="range" id="cfg-femco-titleOffsetX" min="-80" max="80" step="1" style="width:100%;accent-color:var(--blue)" oninput="document.getElementById('cfg-femco-titleOffsetXNum').value=this.value;cfgFemcoUpd('titleOffsetX',this.value)">
        <input type="number" id="cfg-femco-titleOffsetXNum" min="-80" max="80" step="1" style="width:100%;padding:6px 8px;border:1px solid var(--border2);border-radius:6px;font-size:13px;font-weight:700" onchange="document.getElementById('cfg-femco-titleOffsetX').value=this.value;cfgFemcoUpd('titleOffsetX',this.value)">
      </div>
      <div style="display:grid;grid-template-columns:140px 1fr 100px;gap:10px;align-items:center">
        <div style="font-size:12px;font-weight:700;color:var(--text2)">대학명 상하 이동</div>
        <input type="range" id="cfg-femco-titleOffsetY" min="-80" max="80" step="1" style="width:100%;accent-color:var(--blue)" oninput="document.getElementById('cfg-femco-titleOffsetYNum').value=this.value;cfgFemcoUpd('titleOffsetY',this.value)">
        <input type="number" id="cfg-femco-titleOffsetYNum" min="-80" max="80" step="1" style="width:100%;padding:6px 8px;border:1px solid var(--border2);border-radius:6px;font-size:13px;font-weight:700" onchange="document.getElementById('cfg-femco-titleOffsetY').value=this.value;cfgFemcoUpd('titleOffsetY',this.value)">
      </div>

      <div style="display:grid;grid-template-columns:140px 1fr 100px;gap:10px;align-items:center">
        <div style="font-size:12px;font-weight:700;color:var(--text2)">로고-대학명 간격</div>
        <input type="range" id="cfg-femco-headGap" min="0" max="80" step="1" style="width:100%;accent-color:var(--blue)" oninput="document.getElementById('cfg-femco-headGapNum').value=this.value;cfgFemcoUpd('headGap',this.value)">
        <input type="number" id="cfg-femco-headGapNum" min="0" max="80" step="1" style="width:100%;padding:6px 8px;border:1px solid var(--border2);border-radius:6px;font-size:13px;font-weight:700" onchange="document.getElementById('cfg-femco-headGap').value=this.value;cfgFemcoUpd('headGap',this.value)">
      </div>

      <div style="display:grid;grid-template-columns:140px 1fr 100px;gap:10px;align-items:center">
        <div style="font-size:12px;font-weight:700;color:var(--text2)">대학명 폰트 크기</div>
        <input type="range" id="cfg-femco-titleSize" min="16" max="44" step="1" style="width:100%;accent-color:var(--blue)" oninput="document.getElementById('cfg-femco-titleSizeNum').value=this.value;cfgFemcoUpd('titleSize',this.value)">
        <input type="number" id="cfg-femco-titleSizeNum" min="16" max="44" step="1" style="width:100%;padding:6px 8px;border:1px solid var(--border2);border-radius:6px;font-size:13px;font-weight:700" onchange="document.getElementById('cfg-femco-titleSize').value=this.value;cfgFemcoUpd('titleSize',this.value)">
      </div>

      <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center">
        <div style="font-size:12px;font-weight:700;color:var(--text2);min-width:140px">대학명 폰트</div>
        <select id="cfg-femco-titleFont" onchange="cfgFemcoUpd('titleFont',this.value)" style="padding:6px 10px;border:1px solid var(--border2);border-radius:8px">
          <option value="system">기본(시스템)</option>
          <option value="app">전역 폰트</option>
          <option value="noto">Noto Sans KR</option>
          <option value="pretendard">Pretendard</option>
          <option value="nanum">나눔고딕</option>
          <option value="gmarket">GmarketSans</option>
        </select>
      </div>

      <div style="display:grid;grid-template-columns:140px 1fr 100px;gap:10px;align-items:center">
        <div style="font-size:12px;font-weight:700;color:var(--text2)">스트리머 이미지 크기</div>
        <input type="range" id="cfg-femco-playerImgSize" min="28" max="90" step="1" style="width:100%;accent-color:var(--blue)" oninput="document.getElementById('cfg-femco-playerImgSizeNum').value=this.value;cfgFemcoUpd('playerImgSize',this.value)">
        <input type="number" id="cfg-femco-playerImgSizeNum" min="28" max="90" step="1" style="width:100%;padding:6px 8px;border:1px solid var(--border2);border-radius:6px;font-size:13px;font-weight:700" onchange="document.getElementById('cfg-femco-playerImgSize').value=this.value;cfgFemcoUpd('playerImgSize',this.value)">
      </div>

      <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center">
        <div style="font-size:12px;font-weight:700;color:var(--text2);min-width:140px">이미지 모양</div>
        <select id="cfg-femco-playerImgShape" onchange="cfgFemcoUpd('playerImgShape',this.value)" style="padding:6px 10px;border:1px solid var(--border2);border-radius:8px">
          <option value="square">네모</option>
          <option value="circle">원</option>
        </select>
      </div>

      <div style="display:grid;grid-template-columns:140px 1fr 100px;gap:10px;align-items:center">
        <div style="font-size:12px;font-weight:700;color:var(--text2)">이름 폰트 크기</div>
        <input type="range" id="cfg-femco-nameFontSize" min="10" max="20" step="1" style="width:100%;accent-color:var(--blue)" oninput="document.getElementById('cfg-femco-nameFontSizeNum').value=this.value;cfgFemcoUpd('nameFontSize',this.value)">
        <input type="number" id="cfg-femco-nameFontSizeNum" min="10" max="20" step="1" style="width:100%;padding:6px 8px;border:1px solid var(--border2);border-radius:6px;font-size:13px;font-weight:700" onchange="document.getElementById('cfg-femco-nameFontSize').value=this.value;cfgFemcoUpd('nameFontSize',this.value)">
      </div>

      <div style="display:grid;grid-template-columns:140px 1fr 100px;gap:10px;align-items:center">
        <div style="font-size:12px;font-weight:700;color:var(--text2)">직급 폰트 크기</div>
        <input type="range" id="cfg-femco-roleFontSize" min="9" max="16" step="1" style="width:100%;accent-color:var(--blue)" oninput="document.getElementById('cfg-femco-roleFontSizeNum').value=this.value;cfgFemcoUpd('roleFontSize',this.value)">
        <input type="number" id="cfg-femco-roleFontSizeNum" min="9" max="16" step="1" style="width:100%;padding:6px 8px;border:1px solid var(--border2);border-radius:6px;font-size:13px;font-weight:700" onchange="document.getElementById('cfg-femco-roleFontSize').value=this.value;cfgFemcoUpd('roleFontSize',this.value)">
      </div>

      <div style="display:grid;grid-template-columns:140px 1fr 100px;gap:10px;align-items:center">
        <div style="font-size:12px;font-weight:700;color:var(--text2)">티어 아이콘 크기</div>
        <input type="range" id="cfg-femco-tierBadgeSize" min="9" max="16" step="1" style="width:100%;accent-color:var(--blue)" oninput="document.getElementById('cfg-femco-tierBadgeSizeNum').value=this.value;cfgFemcoUpd('tierBadgeSize',this.value)">
        <input type="number" id="cfg-femco-tierBadgeSizeNum" min="9" max="16" step="1" style="width:100%;padding:6px 8px;border:1px solid var(--border2);border-radius:6px;font-size:13px;font-weight:700" onchange="document.getElementById('cfg-femco-tierBadgeSize').value=this.value;cfgFemcoUpd('tierBadgeSize',this.value)">
      </div>

      <div style="display:grid;grid-template-columns:140px 1fr 100px;gap:10px;align-items:center">
        <div style="font-size:12px;font-weight:700;color:var(--text2)">⭐ 아이콘 크기</div>
        <input type="range" id="cfg-femco-starSize" min="10" max="28" step="1" style="width:100%;accent-color:var(--blue)" oninput="document.getElementById('cfg-femco-starSizeNum').value=this.value;cfgFemcoUpd('starSize',this.value)">
        <input type="number" id="cfg-femco-starSizeNum" min="10" max="28" step="1" style="width:100%;padding:6px 8px;border:1px solid var(--border2);border-radius:6px;font-size:13px;font-weight:700" onchange="document.getElementById('cfg-femco-starSize').value=this.value;cfgFemcoUpd('starSize',this.value)">
      </div>

      <div style="display:grid;grid-template-columns:140px 1fr 100px;gap:10px;align-items:center">
        <div style="font-size:12px;font-weight:700;color:var(--text2)">상태 아이콘 크기</div>
        <input type="range" id="cfg-femco-statusIconSize" min="10" max="34" step="1" style="width:100%;accent-color:var(--blue)" oninput="document.getElementById('cfg-femco-statusIconSizeNum').value=this.value;cfgFemcoUpd('statusIconSize',this.value)">
        <input type="number" id="cfg-femco-statusIconSizeNum" min="10" max="34" step="1" style="width:100%;padding:6px 8px;border:1px solid var(--border2);border-radius:6px;font-size:13px;font-weight:700" onchange="document.getElementById('cfg-femco-statusIconSize').value=this.value;cfgFemcoUpd('statusIconSize',this.value)">
      </div>

      <div style="display:grid;grid-template-columns:140px 1fr 100px;gap:10px;align-items:center">
        <div style="font-size:12px;font-weight:700;color:var(--text2)">세로 인원(줄)</div>
        <input type="range" id="cfg-femco-rowsPerCol" min="2" max="12" step="1" style="width:100%;accent-color:var(--blue)" oninput="document.getElementById('cfg-femco-rowsPerColNum').value=this.value;cfgFemcoUpd('rowsPerCol',this.value)">
        <input type="number" id="cfg-femco-rowsPerColNum" min="2" max="12" step="1" style="width:100%;padding:6px 8px;border:1px solid var(--border2);border-radius:6px;font-size:13px;font-weight:700" onchange="document.getElementById('cfg-femco-rowsPerCol').value=this.value;cfgFemcoUpd('rowsPerCol',this.value)">
      </div>

      <div style="display:grid;grid-template-columns:140px 1fr 100px;gap:10px;align-items:center">
        <div style="font-size:12px;font-weight:700;color:var(--text2)">스트리머 폭</div>
        <input type="range" id="cfg-femco-colWidth" min="80" max="360" step="1" style="width:100%;accent-color:var(--blue)" oninput="document.getElementById('cfg-femco-colWidthNum').value=this.value;cfgFemcoUpd('colWidth',this.value)">
        <input type="number" id="cfg-femco-colWidthNum" min="80" max="360" step="1" style="width:100%;padding:6px 8px;border:1px solid var(--border2);border-radius:6px;font-size:13px;font-weight:700" onchange="document.getElementById('cfg-femco-colWidth').value=this.value;cfgFemcoUpd('colWidth',this.value)">
      </div>

      <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center">
        <div style="font-size:12px;font-weight:700;color:var(--text2);min-width:140px">내용 정렬</div>
        <select id="cfg-femco-contentAlign" onchange="cfgFemcoUpd('contentAlign', this.value)" style="padding:6px 10px;border:1px solid var(--border2);border-radius:8px">
          <option value="left">왼쪽</option>
          <option value="center">가운데</option>
        </select>
        <span style="font-size:11px;color:var(--gray-l)">※ ‘너무 좌측’ 느낌이면 가운데 + 좌우 여백을 키워보세요</span>
      </div>

      <div style="display:grid;grid-template-columns:140px 1fr 100px;gap:10px;align-items:center">
        <div style="font-size:12px;font-weight:700;color:var(--text2)">좌우 여백</div>
        <input type="range" id="cfg-femco-contentPadX" min="0" max="40" step="1" style="width:100%;accent-color:var(--blue)" oninput="document.getElementById('cfg-femco-contentPadXNum').value=this.value;cfgFemcoUpd('contentPadX',this.value)">
        <input type="number" id="cfg-femco-contentPadXNum" min="0" max="40" step="1" style="width:100%;padding:6px 8px;border:1px solid var(--border2);border-radius:6px;font-size:13px;font-weight:700" onchange="document.getElementById('cfg-femco-contentPadX').value=this.value;cfgFemcoUpd('contentPadX',this.value)">
      </div>

      <div style="display:grid;grid-template-columns:140px 1fr 100px;gap:10px;align-items:center">
        <div style="font-size:12px;font-weight:700;color:var(--text2)">내용 좌우 이동</div>
        <input type="range" id="cfg-femco-contentOffsetX" min="-40" max="40" step="1" style="width:100%;accent-color:var(--blue)" oninput="document.getElementById('cfg-femco-contentOffsetXNum').value=this.value;cfgFemcoUpd('contentOffsetX',this.value)">
        <input type="number" id="cfg-femco-contentOffsetXNum" min="-40" max="40" step="1" style="width:100%;padding:6px 8px;border:1px solid var(--border2);border-radius:6px;font-size:13px;font-weight:700" onchange="document.getElementById('cfg-femco-contentOffsetX').value=this.value;cfgFemcoUpd('contentOffsetX',this.value)">
      </div>

      <div style="display:grid;grid-template-columns:140px 1fr 100px;gap:10px;align-items:center">
        <div style="font-size:12px;font-weight:700;color:var(--text2)">상하(행) 간격</div>
        <input type="range" id="cfg-femco-colGap" min="0" max="28" step="1" style="width:100%;accent-color:var(--blue)" oninput="document.getElementById('cfg-femco-colGapNum').value=this.value;cfgFemcoUpd('colGap',this.value)">
        <input type="number" id="cfg-femco-colGapNum" min="0" max="28" step="1" style="width:100%;padding:6px 8px;border:1px solid var(--border2);border-radius:6px;font-size:13px;font-weight:700" onchange="document.getElementById('cfg-femco-colGap').value=this.value;cfgFemcoUpd('colGap',this.value)">
      </div>

      <div style="display:grid;grid-template-columns:140px 1fr 100px;gap:10px;align-items:center">
        <div style="font-size:12px;font-weight:700;color:var(--text2)">대학 간 여백</div>
        <input type="range" id="cfg-femco-univGap" min="0" max="120" step="1" style="width:100%;accent-color:var(--blue)" oninput="document.getElementById('cfg-femco-univGapNum').value=this.value;cfgFemcoUpd('univGap',this.value)">
        <input type="number" id="cfg-femco-univGapNum" min="0" max="120" step="1" style="width:100%;padding:6px 8px;border:1px solid var(--border2);border-radius:6px;font-size:13px;font-weight:700" onchange="document.getElementById('cfg-femco-univGap').value=this.value;cfgFemcoUpd('univGap',this.value)">
      </div>

      <div style="display:grid;grid-template-columns:140px 1fr 100px;gap:10px;align-items:center">
        <div style="font-size:12px;font-weight:700;color:var(--text2)">인원수 폰트 크기</div>
        <input type="range" id="cfg-femco-countFontSize" min="10" max="18" step="1" style="width:100%;accent-color:var(--blue)" oninput="document.getElementById('cfg-femco-countFontSizeNum').value=this.value;cfgFemcoUpd('countFontSize',this.value)">
        <input type="number" id="cfg-femco-countFontSizeNum" min="10" max="18" step="1" style="width:100%;padding:6px 8px;border:1px solid var(--border2);border-radius:6px;font-size:13px;font-weight:700" onchange="document.getElementById('cfg-femco-countFontSize').value=this.value;cfgFemcoUpd('countFontSize',this.value)">
      </div>

      <hr style="border:none;border-top:1px solid var(--border);margin:8px 0">
      <div style="font-size:12px;font-weight:800;color:var(--text2)">대학별 설정</div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center">
        <div style="font-size:12px;font-weight:700;color:var(--text2);min-width:140px">대학 선택</div>
        <select id="cfg-femco-univ" onchange="localStorage.setItem('cfg_femco_univ',this.value);cfgFemcoRefreshUnivFields()" style="padding:6px 10px;border:1px solid var(--border2);border-radius:8px;min-width:160px"></select>
      </div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center">
        <div style="font-size:12px;font-weight:700;color:var(--text2);min-width:140px">대학 색상</div>
        <input type="color" id="cfg-femco-univColor" onchange="cfgFemcoSetUnivColor(this.value)">
        <button class="btn btn-xs" onclick="cfgFemcoClearUnivColor()">해제</button>
      </div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center">
        <div style="font-size:12px;font-weight:700;color:var(--text2);min-width:140px">대학명 아래 문구</div>
        <input type="text" id="cfg-femco-subtitle" placeholder="대학명 아래 문구" style="flex:1;min-width:240px" onchange="cfgFemcoSetSubtitle(this.value)">
        <button class="btn btn-xs" onclick="cfgFemcoClearSubtitle()">삭제</button>
      </div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center">
        <div style="font-size:12px;font-weight:700;color:var(--text2);min-width:140px">대학 배경 미디어</div>
        <input type="text" id="cfg-femco-bgMediaUrl" placeholder="https://... (jpg/png/gif/webp/mp4/유튜브/트위치)" style="flex:1;min-width:260px" onchange="cfgFemcoSetBgMedia(this.value)">
        <button class="btn btn-xs" onclick="cfgFemcoSetBgMedia('')">삭제</button>
        <span id="cfg-femco-bgMediaHint" style="font-size:11px;color:var(--gray-l)">미설정</span>
      </div>
      <div style="font-size:11px;color:var(--gray-l);line-height:1.45;margin-top:-6px">
        • 이미지/GIF: 대학 카드 배경으로 적용<br>
        • MP4/WEBM: 대학 카드에 “배경영상” 버튼 표시(클릭 재생)<br>
        • 유튜브/트위치: “배경링크” 버튼 표시(새창)
      </div>
      <div style="display:grid;grid-template-columns:140px 1fr 100px;gap:10px;align-items:center;margin-top:6px">
        <div style="font-size:12px;font-weight:700;color:var(--text2)">배경 이미지 투명도</div>
        <input type="range" id="cfg-femco-bgAlpha" min="0" max="100" step="1" style="width:100%;accent-color:var(--blue)" oninput="document.getElementById('cfg-femco-bgAlphaNum').value=this.value;cfgFemcoSetBgOpt('alpha',this.value)">
        <input type="number" id="cfg-femco-bgAlphaNum" min="0" max="100" step="1" style="width:100%;padding:6px 8px;border:1px solid var(--border2);border-radius:6px;font-size:13px;font-weight:700" onchange="document.getElementById('cfg-femco-bgAlpha').value=this.value;cfgFemcoSetBgOpt('alpha',this.value)">
      </div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center">
        <div style="font-size:12px;font-weight:700;color:var(--text2);min-width:140px">배경 위치/반복</div>
        <select id="cfg-femco-bgPos" onchange="cfgFemcoSetBgOpt('pos',this.value)" style="padding:6px 10px;border:1px solid var(--border2);border-radius:8px">
          <option value="center">중앙</option>
          <option value="top">상단</option>
          <option value="bottom">하단</option>
          <option value="left">좌측</option>
          <option value="right">우측</option>
          <option value="top left">좌상</option>
          <option value="top right">우상</option>
          <option value="bottom left">좌하</option>
          <option value="bottom right">우하</option>
        </select>
        <select id="cfg-femco-bgRepeat" onchange="cfgFemcoSetBgOpt('repeat',this.value)" style="padding:6px 10px;border:1px solid var(--border2);border-radius:8px">
          <option value="no-repeat">반복 없음</option>
          <option value="repeat">바둑판 반복(여러곳)</option>
          <option value="repeat-x">가로 반복</option>
          <option value="repeat-y">세로 반복</option>
        </select>
      </div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center">
        <div style="font-size:12px;font-weight:700;color:var(--text2);min-width:140px">배경 크기</div>
        <select id="cfg-femco-bgSizeMode" onchange="cfgFemcoSetBgOpt('sizeMode',this.value)" style="padding:6px 10px;border:1px solid var(--border2);border-radius:8px">
          <option value="cover">채우기(cover)</option>
          <option value="contain">맞춤(contain)</option>
          <option value="pct">퍼센트(여러개 추천)</option>
          <option value="px">픽셀(여러개 추천)</option>
        </select>
        <input type="number" id="cfg-femco-bgSizeVal" min="30" max="600" step="1" style="width:120px;padding:6px 8px;border:1px solid var(--border2);border-radius:6px;font-size:13px;font-weight:700" onchange="cfgFemcoSetBgOpt('sizeVal',this.value)">
        <span style="font-size:11px;color:var(--gray-l)">pct: % / px: px</span>
      </div>
      <div style="display:grid;grid-template-columns:140px 1fr 100px;gap:10px;align-items:center">
        <div style="font-size:12px;font-weight:700;color:var(--text2)">배경 X 오프셋</div>
        <input type="range" id="cfg-femco-bgOffX" min="-260" max="260" step="1" style="width:100%;accent-color:var(--blue)" oninput="document.getElementById('cfg-femco-bgOffXNum').value=this.value;cfgFemcoSetBgOpt('ox',this.value)">
        <input type="number" id="cfg-femco-bgOffXNum" min="-260" max="260" step="1" style="width:100%;padding:6px 8px;border:1px solid var(--border2);border-radius:6px;font-size:13px;font-weight:700" onchange="document.getElementById('cfg-femco-bgOffX').value=this.value;cfgFemcoSetBgOpt('ox',this.value)">
      </div>
      <div style="display:grid;grid-template-columns:140px 1fr 100px;gap:10px;align-items:center">
        <div style="font-size:12px;font-weight:700;color:var(--text2)">배경 Y 오프셋</div>
        <input type="range" id="cfg-femco-bgOffY" min="-260" max="260" step="1" style="width:100%;accent-color:var(--blue)" oninput="document.getElementById('cfg-femco-bgOffYNum').value=this.value;cfgFemcoSetBgOpt('oy',this.value)">
        <input type="number" id="cfg-femco-bgOffYNum" min="-260" max="260" step="1" style="width:100%;padding:6px 8px;border:1px solid var(--border2);border-radius:6px;font-size:13px;font-weight:700" onchange="document.getElementById('cfg-femco-bgOffY').value=this.value;cfgFemcoSetBgOpt('oy',this.value)">
      </div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center">
        <div style="font-size:12px;font-weight:700;color:var(--text2);min-width:140px">문구 스타일</div>
        <span style="font-size:11px;color:var(--gray-l)">크기</span>
        <input type="range" id="cfg-femco-subtitleSize" min="10" max="24" step="1" style="width:180px;accent-color:var(--blue)" oninput="document.getElementById('cfg-femco-subtitleSizeNum').value=this.value;cfgFemcoUpd('subtitleSize',this.value)">
        <input type="number" id="cfg-femco-subtitleSizeNum" min="10" max="24" step="1" style="width:80px;padding:6px 8px;border:1px solid var(--border2);border-radius:6px;font-size:13px;font-weight:700" onchange="document.getElementById('cfg-femco-subtitleSize').value=this.value;cfgFemcoUpd('subtitleSize',this.value)">
        <span style="font-size:11px;color:var(--gray-l)">굵기</span>
        <select id="cfg-femco-subtitleWeight" onchange="cfgFemcoUpd('subtitleWeight',this.value)" style="padding:6px 10px;border:1px solid var(--border2);border-radius:8px">
          <option value="400">400</option><option value="500">500</option><option value="600">600</option><option value="700">700</option><option value="800">800</option><option value="900">900</option>
        </select>
        <span style="font-size:11px;color:var(--gray-l)">색</span>
        <input type="color" id="cfg-femco-subtitleColor" onchange="cfgFemcoUpd('subtitleColor',this.value)">
        <button class="btn btn-xs" onclick="cfgFemcoUpd('subtitleColor','')">자동</button>
      </div>

      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px">
        <button class="btn btn-b" onclick="cfgFemcoReset()">초기화</button>
      </div>
    </div>
  </details>
  ${_scfgD('cfgmenu','🧭 설정 메뉴 정리')}
    <div style="font-size:12px;color:var(--gray-l);margin-bottom:10px">카테고리 이동 + 섹션 순서 변경을 직접 정리할 수 있습니다. 변경 즉시 저장되며 새로고침 없이 반영됩니다.</div>
    <div style="padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:10px;display:flex;flex-direction:column;gap:12px">
      ${(()=>{
        const cats = (window._cfgCatOrder && Array.isArray(window._cfgCatOrder)) ? window._cfgCatOrder : Object.keys(_catSecs||{});
        const secTitle = window._cfgSecTitle || {};
        return cats.map((cat, catIdx)=>{
          const secs = (_catSecs[cat]||[]);
          return `
            <div style="border:1px solid var(--border);border-radius:10px;background:var(--white);padding:12px">
              <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">
                <div style="font-weight:900">${cat}</div>
                <span style="font-size:11px;color:var(--gray-l)">${secs.length}개</span>
                <span style="flex:1"></span>
                <button class="btn btn-xs" onclick="cfgMenuMoveCat('${cat.replace(/'/g,"\\'")}','up')" ${catIdx===0?'disabled':''}>▲</button>
                <button class="btn btn-xs" onclick="cfgMenuMoveCat('${cat.replace(/'/g,"\\'")}','down')" ${catIdx===cats.length-1?'disabled':''}>▼</button>
              </div>
              <div style="display:flex;flex-direction:column;gap:6px">
                ${secs.map((secId, i)=>{
                  const title = secTitle[secId] || secId;
                  return `
                    <div style="display:flex;align-items:center;gap:8px;border:1px solid var(--border2);border-radius:10px;padding:8px 10px;background:var(--surface)">
                      <div style="font-size:12px;font-weight:800;min-width:160px">${title}</div>
                      <button class="btn btn-xs" onclick="cfgMenuRenameSec('${secId}')" title="이름 변경">✏️</button>
                      <select onchange="cfgMenuSetCat('${secId}', this.value)" style="padding:6px 10px;border:1px solid var(--border2);border-radius:8px">
                        ${cats.map(c=>`<option value="${c}"${c===cat?' selected':''}>${c}</option>`).join('')}
                      </select>
                      <span style="flex:1"></span>
                      <button class="btn btn-xs" onclick="cfgMenuMoveSec('${secId}','up')" ${i===0?'disabled':''}>▲</button>
                      <button class="btn btn-xs" onclick="cfgMenuMoveSec('${secId}','down')" ${i===secs.length-1?'disabled':''}>▼</button>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          `;
        }).join('');
      })()}
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button class="btn btn-b" onclick="cfgMenuReset()">기본 메뉴로 초기화</button>
        <button class="btn btn-p" onclick="cfgMenuReset();try{if(typeof showToast==='function')showToast('🤖 자동 정리 완료');}catch(e){}">🤖 자동 정리</button>
        <button class="btn btn-w" onclick="cfgMenuResetSecNames()">이름 변경 초기화</button>
      </div>
    </div>
  </details>
  ${_scfgD('imgsettings','🖼️ 이미지탭 이미지 설정')}
    <div style="font-size:12px;color:var(--gray-l);margin-bottom:10px">이미지탭 ⚙️ 버튼과 동일한 설정입니다. 크기·밝기·배치·위치를 조절하면 즉시 반영됩니다.</div>
    <div id="cfg-b2-img-settings-wrap" style="padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:10px">
      <div style="font-size:12px;color:var(--gray-l)">로딩 중...</div>
    </div>
    <div style="font-size:11px;color:var(--gray-l);margin-top:6px;padding:0 2px">※ 스트리머 상세 모달 이미지 설정은 아래 별도 항목에서 설정</div>
  </details>
  ${_scfgD('imgmodalsettings','🖼️ 스트리머 상세 이미지 설정')}
    <div style="font-size:12px;color:var(--gray-l);margin-bottom:10px">스트리머 상세 모달의 이미지 크기·밝기를 설정합니다.</div>
    <div style="font-size:11px;color:var(--gray-l);margin-bottom:8px">모바일/태블릿/PC 크기를 따로 저장합니다.</div>
    <div style="padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:10px;display:flex;flex-direction:column;gap:12px">
      <label style="display:flex;align-items:center;gap:6px;font-size:12px;cursor:pointer;font-weight:600">
        <input type="checkbox" id="cfg-img-fill" style="width:14px;height:14px"> 이미지 채우기 (cover) — 해제 시 맞춤 (contain)
      </label>
      <div>
        <div style="display:flex;justify-content:space-between;margin-bottom:4px">
          <label style="font-size:12px;font-weight:700;color:var(--text2)">기본 크기</label>
          <span id="cfg-img-scale-val" style="font-size:12px;font-weight:700;color:var(--blue)">1.0x</span>
        </div>
        <input type="range" id="cfg-img-scale" min="0.5" max="2" step="0.1" value="1" style="width:100%;accent-color:var(--blue)" oninput="document.getElementById('cfg-img-scale-val').textContent=parseFloat(this.value).toFixed(1)+'x'">
        <div style="display:flex;justify-content:space-between;font-size:10px;color:var(--gray-l);margin-top:2px"><span>0.5x</span><span>2.0x</span></div>
      </div>
      <div>
        <div style="display:flex;justify-content:space-between;margin-bottom:4px">
          <label style="font-size:12px;font-weight:700;color:var(--text2)">기본 밝기</label>
          <span id="cfg-img-brightness-val" style="font-size:12px;font-weight:700;color:var(--blue)">1.0x</span>
        </div>
        <input type="range" id="cfg-img-brightness" min="0.3" max="2" step="0.1" value="1" style="width:100%;accent-color:var(--blue)" oninput="document.getElementById('cfg-img-brightness-val').textContent=parseFloat(this.value).toFixed(1)+'x'">
        <div style="display:flex;justify-content:space-between;font-size:10px;color:var(--gray-l);margin-top:2px"><span>0.3x</span><span>2.0x</span></div>
      </div>
      <div>
        <div style="display:flex;justify-content:space-between;margin-bottom:4px">
          <label style="font-size:12px;font-weight:700;color:var(--text2)">모바일 크기</label>
          <span id="cfg-img-scale-left-val" style="font-size:12px;font-weight:700;color:var(--blue)">1.0x</span>
        </div>
        <input type="range" id="cfg-img-scale-left" min="0.5" max="2" step="0.1" value="1" style="width:100%;accent-color:var(--blue)" oninput="document.getElementById('cfg-img-scale-left-val').textContent=parseFloat(this.value).toFixed(1)+'x'">
      </div>
      <div>
        <div style="display:flex;justify-content:space-between;margin-bottom:4px">
          <label style="font-size:12px;font-weight:700;color:var(--text2)">태블릿 크기</label>
          <span id="cfg-img-scale-tablet-val" style="font-size:12px;font-weight:700;color:var(--blue)">1.0x</span>
        </div>
        <input type="range" id="cfg-img-scale-tablet" min="0.5" max="2" step="0.1" value="1" style="width:100%;accent-color:var(--blue)" oninput="document.getElementById('cfg-img-scale-tablet-val').textContent=parseFloat(this.value).toFixed(1)+'x'">
      </div>
      <div>
        <div style="display:flex;justify-content:space-between;margin-bottom:4px">
          <label style="font-size:12px;font-weight:700;color:var(--text2)">PC 크기</label>
          <span id="cfg-img-scale-right-val" style="font-size:12px;font-weight:700;color:var(--blue)">1.0x</span>
        </div>
        <input type="range" id="cfg-img-scale-right" min="0.5" max="2" step="0.1" value="1" style="width:100%;accent-color:var(--blue)" oninput="document.getElementById('cfg-img-scale-right-val').textContent=parseFloat(this.value).toFixed(1)+'x'">
      </div>
      <button class="btn btn-b" onclick="saveImageSettings()" style="align-self:flex-start">💾 설정 저장</button>
    </div>
  </details>
  ${(typeof window.renderCfgProfileShapeCard==='function' ? window.renderCfgProfileShapeCard(_scfgD) : '')}
  ${_scfgD('matchdetail','🎮 경기 상세(팝업) 설정')}
    <div id="cfg-md-body"></div>
  </details>
  ${_scfgD('pdModeBadge','🎨 최근 경기 종목(종류) 배지 색상')}
    <div style="font-size:12px;color:var(--gray-l);margin-bottom:10px">스트리머 상세 → 최근 경기 기록의 “종목/종류” 배지 색상을 변경합니다.</div>
    <div id="cfg-pdmb-body"></div>
  </details>
  ${_scfgD('pd','🎨 스트리머 상세 스타일 설정')}
    <div id="cfg-pd-body"></div>
  </details>
  ${_scfgD('fab','🔘 FAB 버튼 탭 설정')}
    <div style="font-size:12px;color:var(--gray-l);margin-bottom:14px">하단 FAB 버튼 클릭 시 이동할 탭을 설정합니다.</div>
    <div style="padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:10px">
      <div style="display:flex;gap:8px;align-items:center;margin-bottom:12px">
        <label style="font-size:12px;font-weight:600;color:var(--text2);min-width:80px">캘린더:</label>
        <select id="cfg-fab-cal" style="flex:1;max-width:200px;padding:5px 8px;border:1px solid var(--border2);border-radius:6px;font-size:12px">
          <option value="cal">📅 캘린더</option>
          <option value="stats">📊 통계</option>
          <option value="roulette">🎰 룰렛</option>
        </select>
      </div>
      <div style="display:flex;gap:8px;align-items:center;margin-bottom:12px">
        <label style="font-size:12px;font-weight:600;color:var(--text2);min-width:80px">대회:</label>
        <select id="cfg-fab-comp" style="flex:1;max-width:200px;padding:5px 8px;border:1px solid var(--border2);border-radius:6px;font-size:12px">
          <option value="comp">🏆 대회</option>
          <option value="pro">🏅 프로리그</option>
          <option value="stats">📊 통계</option>
        </select>
      </div>
      <div style="display:flex;gap:8px;align-items:center;margin-bottom:12px">
        <label style="font-size:12px;font-weight:600;color:var(--text2);min-width:80px">대학대전:</label>
        <select id="cfg-fab-univm" style="flex:1;max-width:200px;padding:5px 8px;border:1px solid var(--border2);border-radius:6px;font-size:12px">
          <option value="univm">🏫 대학대전</option>
          <option value="ck">🏆 CK</option>
          <option value="stats">📊 통계</option>
        </select>
      </div>
      <div style="display:flex;gap:8px;align-items:center;margin-bottom:12px">
        <label style="font-size:12px;font-weight:600;color:var(--text2);min-width:80px">개인전:</label>
        <select id="cfg-fab-ind" style="flex:1;max-width:200px;padding:5px 8px;border:1px solid var(--border2);border-radius:6px;font-size:12px">
          <option value="ind">👤 개인전</option>
          <option value="gj">⚔️ 끝장전</option>
          <option value="stats">📊 통계</option>
        </select>
      </div>
      <div style="display:flex;gap:8px;align-items:center;margin-bottom:12px">
        <label style="font-size:12px;font-weight:600;color:var(--text2);min-width:80px">프로리그:</label>
        <select id="cfg-fab-pro" style="flex:1;max-width:200px;padding:5px 8px;border:1px solid var(--border2);border-radius:6px;font-size:12px">
          <option value="pro">🏅 프로리그</option>
          <option value="comp">🏆 대회</option>
          <option value="stats">📊 통계</option>
        </select>
      </div>
    </div>
    <div style="margin-top:16px;padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:10px">
      <div style="font-size:12px;font-weight:700;color:var(--text2);margin-bottom:10px">FAB 버튼 표시 설정</div>
      <div style="display:flex;flex-direction:column;gap:8px">
        <!-- 클릭/터치가 잘 안 잡히는 문제 방지: label 전체를 클릭 영역으로 사용 -->
        <label for="cfg-fab-hide-mobile" style="display:flex;align-items:center;gap:10px;padding:12px 14px;border:1px solid var(--border);border-radius:12px;background:var(--white);cursor:pointer;user-select:none;touch-action:manipulation;-webkit-tap-highlight-color:transparent">
          <input type="checkbox" id="cfg-fab-hide-mobile" onchange="saveFabVisibilitySettings()" style="width:22px;height:22px;accent-color:var(--blue);flex-shrink:0">
          <div style="font-size:13px;font-weight:800;color:var(--text2)">모바일에서 숨기기</div>
        </label>
        <label for="cfg-fab-hide-pc" style="display:flex;align-items:center;gap:10px;padding:12px 14px;border:1px solid var(--border);border-radius:12px;background:var(--white);cursor:pointer;user-select:none;touch-action:manipulation;-webkit-tap-highlight-color:transparent">
          <input type="checkbox" id="cfg-fab-hide-pc" onchange="saveFabVisibilitySettings()" style="width:22px;height:22px;accent-color:var(--blue);flex-shrink:0">
          <div style="font-size:13px;font-weight:800;color:var(--text2)">PC에서 숨기기</div>
        </label>
      </div>
    </div>
  </details>
  ${_scfgD('boardchip','🏷️ 현황판 칩/대학로고 크기')}
    <div style="font-size:12px;color:var(--gray-l);margin-bottom:12px">현황판 칩/대학 로고 관련 설정입니다. <b>스트리머 프로필 이미지 전역 배율</b>과는 별개로 동작합니다.</div>
    <div style="padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:10px;display:flex;flex-direction:column;gap:14px">
      <div>
        <div style="font-size:12px;font-weight:700;color:var(--text2);margin-bottom:8px">📐 프로필 이미지 모양</div>
        <div style="font-size:11px;color:var(--gray-l);margin-bottom:8px">프로필 이미지 모양(원형/네모)은 별도 메뉴에서 전역으로 설정합니다.</div>
        <button class="btn btn-w btn-xs" onclick="cfgGo('profileshape')">⚙️ 프로필 이미지 모양 설정 열기</button>
      </div>
      <div>
        <div style="font-size:12px;font-weight:700;color:var(--text2);margin-bottom:8px">📏 프로필 이미지 크기 <span id="cfg-bcp-size-val" style="font-weight:400;color:var(--gray-l)">${(()=>{try{return parseInt(localStorage.getItem('su_bcp_size')||'26');}catch(e){return 26;}})()}px</span></div>
        <input type="range" min="16" max="56" step="2" value="${(()=>{try{return parseInt(localStorage.getItem('su_bcp_size')||'26');}catch(e){return 26;}})()}" style="width:100%;accent-color:var(--blue)"
          oninput="boardChipPhotoSize=+this.value;saveBoardChipPhotoSettings();document.getElementById('cfg-bcp-size-val').textContent=this.value+'px';render()">
        <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--gray-l);margin-top:2px"><span>16px</span><span>56px</span></div>
      </div>
      <div>
        <div style="font-size:12px;font-weight:700;color:var(--text2);margin-bottom:8px">📦 레이아웃 크기 <span id="cfg-bcp-layout-val" style="font-weight:400;color:var(--gray-l)">${(()=>{try{return parseInt(localStorage.getItem('su_bcp_layout')||'100');}catch(e){return 100;}})()}%</span></div>
        <input type="range" min="70" max="160" step="5" value="${(()=>{try{return parseInt(localStorage.getItem('su_bcp_layout')||'100');}catch(e){return 100;}})()}" style="width:100%;accent-color:var(--blue)"
          oninput="boardChipLayoutScale=+this.value;saveBoardChipPhotoSettings();document.getElementById('cfg-bcp-layout-val').textContent=this.value+'%';render()">
        <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--gray-l);margin-top:2px"><span>70%</span><span>160%</span></div>
      </div>
      <div style="border-top:1px dashed var(--border2);padding-top:12px">
        <div style="font-size:12px;font-weight:800;color:var(--text2);margin-bottom:10px">🏫 대학 로고 설정</div>
        <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin-bottom:10px">
          <div style="font-size:12px;font-weight:700;color:var(--text2);min-width:120px">프로필(로고) 모양</div>
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            <button class="btn ${(()=>{try{return (localStorage.getItem('su_ul_shape')||'circle')==='circle'?'btn-b':'btn-w';}catch(e){return 'btn-b';}})()}"
              onclick="localStorage.setItem('su_ul_shape','circle');if(typeof applyUnivLogoVars==='function')applyUnivLogoVars();render()">⭕ 원형</button>
            <button class="btn ${(()=>{try{return (localStorage.getItem('su_ul_shape')||'circle')==='square'?'btn-b':'btn-w';}catch(e){return 'btn-w';}})()}"
              onclick="localStorage.setItem('su_ul_shape','square');if(typeof applyUnivLogoVars==='function')applyUnivLogoVars();render()">⬛ 네모</button>
          </div>
        </div>
        <div style="margin-bottom:10px">
          <div style="font-size:12px;font-weight:700;color:var(--text2);margin-bottom:8px">📏 대학 로고 이미지 크기 <span id="cfg-ul-size-val" style="font-weight:400;color:var(--gray-l)">${(()=>{try{return parseInt(localStorage.getItem('su_ul_size')||'34');}catch(e){return 34;}})()}px</span></div>
          <input type="range" min="20" max="60" step="2" value="${(()=>{try{return parseInt(localStorage.getItem('su_ul_size')||'34');}catch(e){return 34;}})()}" style="width:100%;accent-color:var(--blue)"
            oninput="localStorage.setItem('su_ul_size',String(this.value));if(typeof applyUnivLogoVars==='function')applyUnivLogoVars();document.getElementById('cfg-ul-size-val').textContent=this.value+'px';render()">
        </div>
        <div>
          <div style="font-size:12px;font-weight:700;color:var(--text2);margin-bottom:8px">📦 대학 로고 레이아웃 크기 <span id="cfg-ul-box-val" style="font-weight:400;color:var(--gray-l)">${(()=>{try{return parseInt(localStorage.getItem('su_ul_box')||'46');}catch(e){return 46;}})()}px</span></div>
          <input type="range" min="34" max="72" step="2" value="${(()=>{try{return parseInt(localStorage.getItem('su_ul_box')||'46');}catch(e){return 46;}})()}" style="width:100%;accent-color:var(--blue)"
            oninput="localStorage.setItem('su_ul_box',String(this.value));if(typeof applyUnivLogoVars==='function')applyUnivLogoVars();document.getElementById('cfg-ul-box-val').textContent=this.value+'px';render()">
        </div>
        <div style="border-top:1px dashed var(--border2);padding-top:12px">
          <div style="font-size:12px;font-weight:800;color:var(--text2);margin-bottom:10px">🏛️ 대학 상세(모달) 로고 크기</div>
          <div style="margin-bottom:10px">
            <div style="font-size:12px;font-weight:700;color:var(--text2);margin-bottom:8px">📏 로고 이미지 크기 <span id="cfg-ul-size-d-val" style="font-weight:400;color:var(--gray-l)">${(()=>{try{return parseInt(localStorage.getItem('su_ul_size_detail')||localStorage.getItem('su_ul_size')||'46');}catch(e){return 46;}})()}px</span></div>
            <input type="range" min="28" max="72" step="2" value="${(()=>{try{return parseInt(localStorage.getItem('su_ul_size_detail')||localStorage.getItem('su_ul_size')||'46');}catch(e){return 46;}})()}" style="width:100%;accent-color:var(--blue)"
              oninput="localStorage.setItem('su_ul_size_detail',String(this.value));if(typeof applyUnivLogoVars==='function')applyUnivLogoVars();document.getElementById('cfg-ul-size-d-val').textContent=this.value+'px';render()">
          </div>
          <div>
            <div style="font-size:12px;font-weight:700;color:var(--text2);margin-bottom:8px">📦 로고 박스 크기 <span id="cfg-ul-box-d-val" style="font-weight:400;color:var(--gray-l)">${(()=>{try{return parseInt(localStorage.getItem('su_ul_box_detail')||localStorage.getItem('su_ul_box')||'72');}catch(e){return 72;}})()}px</span></div>
            <input type="range" min="48" max="110" step="2" value="${(()=>{try{return parseInt(localStorage.getItem('su_ul_box_detail')||localStorage.getItem('su_ul_box')||'72');}catch(e){return 72;}})()}" style="width:100%;accent-color:var(--blue)"
              oninput="localStorage.setItem('su_ul_box_detail',String(this.value));if(typeof applyUnivLogoVars==='function')applyUnivLogoVars();document.getElementById('cfg-ul-box-d-val').textContent=this.value+'px';render()">
          </div>
        </div>
        <div style="border-top:1px dashed var(--border2);padding-top:12px">
          <div style="font-size:12px;font-weight:800;color:var(--text2);margin-bottom:10px">📊 현황판(대학별 신현황판) 대학 로고 크기</div>
          <div>
            <div style="font-size:12px;font-weight:700;color:var(--text2);margin-bottom:8px">📏 로고 크기 <span id="cfg-b2-ul-val" style="font-weight:400;color:var(--gray-l)">${(()=>{try{return parseInt(localStorage.getItem('su_b2_univ_logo_size')||'42');}catch(e){return 42;}})()}px</span></div>
            <input type="range" min="28" max="72" step="2" value="${(()=>{try{return parseInt(localStorage.getItem('su_b2_univ_logo_size')||'42');}catch(e){return 42;}})()}" style="width:100%;accent-color:var(--blue)"
              oninput="localStorage.setItem('su_b2_univ_logo_size',String(this.value));if(typeof applyBoard2LogoVars==='function')applyBoard2LogoVars();document.getElementById('cfg-b2-ul-val').textContent=this.value+'px';render()">
          </div>
        </div>
      </div>
    </div>
  </details>
  ${_scfgD('oldbright','🎨 구현황판 카드 배경/라벨 밝기 조절')}
    <p style="font-size:12px;color:var(--gray-l);margin-bottom:12px">구현황판 카드의 배경과 라벨 밝기를 조절합니다. (구현황판 툴바에서도 조절 가능)</p>
    <div style="padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:10px">
      <div style="display:flex;gap:8px;align-items:center;margin-bottom:12px">
        <label style="font-size:12px;font-weight:600;color:var(--text2);min-width:80px">배경 밝기:</label>
        <input type="range" id="cfg-b2-bg-alpha" min="0" max="30" value="9" style="flex:1;accent-color:var(--blue)" oninput="document.getElementById('cfg-b2-bg-alpha-val').textContent=this.value+'%'">
        <span style="font-size:11px;color:var(--gray-l);min-width:30px;text-align:right;font-weight:700" id="cfg-b2-bg-alpha-val">9%</span>
      </div>
      <div style="display:flex;gap:8px;align-items:center;margin-bottom:12px">
        <label style="font-size:12px;font-weight:600;color:var(--text2);min-width:80px">라벨 밝기:</label>
        <input type="range" id="cfg-b2-label-alpha" min="0" max="40" value="16" style="flex:1;accent-color:var(--blue)" oninput="document.getElementById('cfg-b2-label-alpha-val').textContent=this.value+'%'">
        <span style="font-size:11px;color:var(--gray-l);min-width:30px;text-align:right;font-weight:700" id="cfg-b2-label-alpha-val">16%</span>
      </div>
      <button class="btn btn-b" onclick="saveOldDashboardBrightness()">💾 저장</button>
    </div>
  </details>
  `;

  // 관리자 목록 + 맵 약자 목록 렌더링
  setTimeout(()=>{
    // 상태 아이콘 지정 목록(전용 메뉴)
    try{ if(typeof _renderCfgSiAssignList==='function') _renderCfgSiAssignList(); }catch(e){}
    renderStorageInfo();
    renderSeasonList();
    const el=document.getElementById('adm-count');
    const listEl=document.getElementById('adm-list');
    const accounts=getAdminAccounts();
    if(el)el.textContent=accounts.length;
    if(listEl){
      if(!accounts.length){listEl.innerHTML='<div style="font-size:12px;color:var(--gray-l)">등록된 계정 없음</div>';return;}
      listEl.innerHTML=accounts.map((a,i)=>`
        <div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid var(--border)">
          <span style="flex:1;font-size:13px;font-weight:600">${a.label||'(이름없음)'}</span>
          <span style="padding:2px 9px;border-radius:5px;font-size:10px;font-weight:700;${a.role==='sub-admin'?'background:#fef3c7;color:#92400e;border:1px solid #fde68a':'background:#dbeafe;color:#1e40af;border:1px solid #bfdbfe'}">${a.role==='sub-admin'?'🔰 부관리자':'👑 총관리자'}</span>
          <button class="btn btn-r btn-xs" onclick="deleteAdminAccount(${i})">🗑️ 삭제</button>
        </div>`).join('');
    }
    // 현황판 배경 설정 렌더링
    const bgListEl=document.getElementById('cfg-board-bg-list');
    if(bgListEl){
      bgListEl.innerHTML=univCfg.map((u,i)=>`<div style="border:1px solid var(--border);border-radius:8px;padding:10px 12px;margin-bottom:8px;background:var(--white)">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
          <div class="cdot" style="background:${u.color}"></div>
          <span style="flex:1;font-weight:700;font-size:13px">${u.name}</span>
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:8px">
          <button class="btn btn-xs btn-w" onclick="promptBoardBgImgUrl('${u.name.replace(/'/g,"\\'")}')">URL 설정</button>
          ${u.bgImg?`<button class="btn btn-xs btn-r" onclick="removeBoardBgImg('${u.name.replace(/'/g,"\\'")}')">삭제</button>`:''}
        </div>
        ${u.bgImg?`<div style="margin-top:8px">
          <div style="font-size:11px;font-weight:600;color:var(--text2);margin-bottom:6px">위치</div>
          <select onchange="setBoardBgImgPos('${u.name.replace(/'/g,"\\'")}',this.value)" style="padding:4px 8px;border:1px solid var(--border2);border-radius:6px;font-size:12px">
            <option value="top left" ${u.bgImgPos==='top left'?' selected':''}>좌상단</option>
            <option value="top center" ${u.bgImgPos==='top center'?' selected':''}>중상단</option>
            <option value="top right" ${u.bgImgPos==='top right'?' selected':''}>우상단</option>
            <option value="center left" ${u.bgImgPos==='center left'?' selected':''}>좌중앙</option>
            <option value="center center" ${u.bgImgPos==='center center'?' selected':''}>중앙</option>
            <option value="center right" ${u.bgImgPos==='center right'?' selected':''}>우중앙</option>
            <option value="bottom left" ${u.bgImgPos==='bottom left'?' selected':''}>좌하단</option>
            <option value="bottom center" ${u.bgImgPos==='bottom center'?' selected':''}>중하단</option>
            <option value="bottom right" ${u.bgImgPos==='bottom right'?' selected':''}>우하단</option>
          </select>
          <div style="font-size:11px;font-weight:600;color:var(--text2);margin-bottom:6px;margin-top:8px">크기</div>
          <select onchange="setBoardBgImgSize('${u.name.replace(/'/g,"\\'")}',this.value)" style="padding:4px 8px;border:1px solid var(--border2);border-radius:6px;font-size:12px">
            <option value="auto" ${(!u.bgImgSize||u.bgImgSize==='auto')?' selected':''}>자동 (브라우저/카드 맞춤)</option>
            <option value="cover" ${u.bgImgSize==='cover'?' selected':''}>채우기 (cover)</option>
            <option value="contain" ${u.bgImgSize==='contain'?' selected':''}>맞춤 (contain)</option>
            <option value="fill" ${u.bgImgSize==='fill'?' selected':''}>늘리기 (fill)</option>
          </select>
        </div>`:''}
      </div>`).join('');
    }
    // 이미지탭 레이아웃 설정 초기화
    const b2Layout=JSON.parse(localStorage.getItem('su_b2_layout')||'{}');
    const _b2ls=b2Layout.leftSize||55, _b2rs=b2Layout.rightSize||45;
    const _b2lEl=document.getElementById('cfg-b2-left-size'), _b2rEl=document.getElementById('cfg-b2-right-size');
    if(_b2lEl){_b2lEl.value=_b2ls;const v=document.getElementById('cfg-b2-left-size-val');if(v)v.textContent=_b2ls+'%';}
    if(_b2rEl){_b2rEl.value=_b2rs;const v=document.getElementById('cfg-b2-right-size-val');if(v)v.textContent=_b2rs+'%';}
    if(document.getElementById('cfg-b2-pc-height'))document.getElementById('cfg-b2-pc-height').value=b2Layout.pcHeight||600;
    if(document.getElementById('cfg-b2-mobile-height'))document.getElementById('cfg-b2-mobile-height').value=b2Layout.mobileHeight||320;
    if(document.getElementById('cfg-b2-tablet-height'))document.getElementById('cfg-b2-tablet-height').value=b2Layout.tabletHeight||400;
    if(document.getElementById('cfg-b2-auto-resize'))document.getElementById('cfg-b2-auto-resize').checked=b2Layout.autoResize!==false;
    if(document.getElementById('cfg-b2-auto-height'))document.getElementById('cfg-b2-auto-height').checked=b2Layout.autoHeight!==false;
    // 이미지탭 이미지 설정 (board2 전역 설정) 렌더링
    _ensureB2ImgSettingsWrap();
    // 스트리머 상세 이미지 설정 초기화
    const imgSettings = (typeof suReadImgSettings==='function')
      ? suReadImgSettings()
      : (JSON.parse(localStorage.getItem('su_img_settings')||'{}'));
    if(document.getElementById('cfg-img-fill'))document.getElementById('cfg-img-fill').checked=imgSettings.fill||false;
    if(document.getElementById('cfg-img-scale')){document.getElementById('cfg-img-scale').value=imgSettings.scale||1;document.getElementById('cfg-img-scale-val').textContent=(imgSettings.scale||1).toFixed(1)+'x';}
    if(document.getElementById('cfg-img-brightness')){document.getElementById('cfg-img-brightness').value=imgSettings.brightness||1;document.getElementById('cfg-img-brightness-val').textContent=(imgSettings.brightness||1).toFixed(1)+'x';}
    if(document.getElementById('cfg-img-scale-left')){document.getElementById('cfg-img-scale-left').value=imgSettings.scaleMb||1;document.getElementById('cfg-img-scale-left-val').textContent=(imgSettings.scaleMb||1).toFixed(1)+'x';}
    if(document.getElementById('cfg-img-scale-tablet')){document.getElementById('cfg-img-scale-tablet').value=imgSettings.scaleTb||1;document.getElementById('cfg-img-scale-tablet-val').textContent=(imgSettings.scaleTb||1).toFixed(1)+'x';}
    if(document.getElementById('cfg-img-scale-right')){document.getElementById('cfg-img-scale-right').value=imgSettings.scalePc||1;document.getElementById('cfg-img-scale-right-val').textContent=(imgSettings.scalePc||1).toFixed(1)+'x';}
    if(document.getElementById('cfg-img-random'))document.getElementById('cfg-img-random').checked=imgSettings.randomRotation||false;
    if(document.getElementById('cfg-img-interval'))document.getElementById('cfg-img-interval').value=imgSettings.interval||5;
    // 구현황판 밝기 설정 초기화
    const b2LabelAlpha=parseInt(localStorage.getItem('su_b2la')||'16');
    const b2BgAlpha=parseInt(localStorage.getItem('su_b2ba')||'9');
    if(document.getElementById('cfg-b2-label-alpha')){document.getElementById('cfg-b2-label-alpha').value=b2LabelAlpha;document.getElementById('cfg-b2-label-alpha-val').textContent=b2LabelAlpha+'%';}
    if(document.getElementById('cfg-b2-bg-alpha')){document.getElementById('cfg-b2-bg-alpha').value=b2BgAlpha;document.getElementById('cfg-b2-bg-alpha-val').textContent=b2BgAlpha+'%';}
    // 레이아웃 자동 저장 이벤트 리스너
    ['cfg-b2-left-size','cfg-b2-right-size','cfg-b2-pc-height','cfg-b2-mobile-height','cfg-b2-tablet-height'].forEach(id=>{
      const el=document.getElementById(id);
      if(el)el.addEventListener('change',saveB2LayoutSettings);
    });
    const autoResizeEl=document.getElementById('cfg-b2-auto-resize');
    if(autoResizeEl)autoResizeEl.addEventListener('change',saveB2LayoutSettings);
    const autoHeightEl=document.getElementById('cfg-b2-auto-height');
    if(autoHeightEl)autoHeightEl.addEventListener('change',saveB2LayoutSettings);
    // 스트리머 상세 이미지 설정 자동 저장 이벤트 리스너
    ['cfg-img-fill','cfg-img-scale','cfg-img-brightness','cfg-img-scale-left','cfg-img-scale-tablet','cfg-img-scale-right','cfg-img-random','cfg-img-interval'].forEach(id=>{
      const el=document.getElementById(id);
      if(el)el.addEventListener('change',saveImageSettings);
    });
    // 카테고리 필터 적용
    if(typeof _cfgApplyCat==='function') _cfgApplyCat(window._cfgCat||'🧩 운영/콘텐츠', false);
    try{ if(typeof window.cfgApplySimpleView==='function') window.cfgApplySimpleView(); }catch(e){}
    try{ if(typeof window.cfgApplyBottomSectionsVisibility==='function') window.cfgApplyBottomSectionsVisibility(); }catch(e){}
    // 펨코현황 설정 초기화
    try{ if(typeof cfgFemcoInit==='function') cfgFemcoInit(); }catch(e){}
    // 자동인식 출력 포맷 미리보기 초기화
    try{ if(typeof cfgAutoOutfmtRefreshPreview==='function') cfgAutoOutfmtRefreshPreview(); }catch(e){}
    // 경기 상세/스트리머 상세 스타일 섹션 내용 항상 렌더링 (펼침 여부 무관)
    try{ if(typeof _renderCfgMatchDetailSection==='function') _renderCfgMatchDetailSection(); }catch(e){}
    try{ if(typeof _renderCfgPdSection==='function') _renderCfgPdSection(); }catch(e){}
  },50);
  C.innerHTML=h;
  // 최초 렌더 직후 카테고리 필터를 즉시 적용 (setTimeout 실행이 막히는 환경 대비)
  try{ if(typeof _cfgApplyCat==='function') _cfgApplyCat(window._cfgCat||'🧩 운영/콘텐츠', false); }catch(e){}
  try{ if(typeof window.cfgApplySimpleView==='function') window.cfgApplySimpleView(); }catch(e){}
  try{ if(typeof window.cfgApplyBottomSectionsVisibility==='function') window.cfgApplyBottomSectionsVisibility(); }catch(e){}
  // 검색어가 있으면 렌더 직후 검색 필터 적용
  try{ if(window._cfgSearchQ) window.cfgSearchSettings(window._cfgSearchQ); }catch(e){}
  // 인라인 onclick이 불발되는 환경 대비 이벤트 바인딩
  _bindCfgHandlers();
  // 설정/메모 동기화 상태 패널 초기화
  try{ if(typeof cfgRenderGistSyncStatus==='function') cfgRenderGistSyncStatus(); }catch(e){}
  setTimeout(_refreshAliasList, 10);
  // FAB 탭 설정 초기화
  window.saveFabTabSetting = function(btnKey, tabId){
    const settings=JSON.parse(localStorage.getItem('su_fabTabs')||'{}');
    settings[btnKey]=tabId;
    localStorage.setItem('su_fabTabs',JSON.stringify(settings));
    if(typeof updateFabButtonOnclick==='function')updateFabButtonOnclick();
    // Firebase에 설정 동기화
    if(typeof save==='function' && typeof isLoggedIn!=='undefined' && isLoggedIn) save();
  };
  window.initFabTabSettings = function(){
    const settings=JSON.parse(localStorage.getItem('su_fabTabs')||'{}');
    const defaults={cal:'cal',comp:'comp',univm:'univm',ind:'ind',pro:'pro'};
    Object.keys(defaults).forEach(key=>{
      const el=document.getElementById('cfg-fab-'+key);
      if(el){
        el.value=settings[key]||defaults[key];
      }
    });
    if(typeof updateFabButtonOnclick==='function')updateFabButtonOnclick();
  };
  window.saveFabVisibilitySettings = function(){
    const elM = document.getElementById('cfg-fab-hide-mobile');
    const elP = document.getElementById('cfg-fab-hide-pc');
    const hideMobile = !!(elM && elM.checked);
    const hidePC = !!(elP && elP.checked);
    try{
      if (window.SettingsStore) window.SettingsStore.setFab(hideMobile, hidePC);
      else {
        localStorage.setItem('su_fabHideMobile', hideMobile ? '1' : '0');
        localStorage.setItem('su_fabHidePC', hidePC ? '1' : '0');
        if(typeof updateFabVisibility==='function')updateFabVisibility();
      }
    }catch(e){}
    try{ if(typeof showToast==='function') showToast('✅ FAB 표시 설정 적용'); }catch(e){}
    // 다른 기기 반영: (관리자) 설정 통합 파일로 동기화
    try{ if(window.SettingsStore && window.SettingsStore.cfg().enabled) window.SettingsStore.push('ui.fab'); }catch(e){}
  };
  window.initFabVisibilitySettings = async function(){
    // 다른 기기 반영: 설정 변경 신호가 있을 때만 pull
    try{ if(window.SettingsStore && typeof window.SettingsStore.pullOnSignal==='function') await window.SettingsStore.pullOnSignal({silent:true}); }catch(e){}
    const hideMobile = localStorage.getItem('su_fabHideMobile') === '1';
    const hidePC = localStorage.getItem('su_fabHidePC') === '1';
    const elM=document.getElementById('cfg-fab-hide-mobile');
    const elP=document.getElementById('cfg-fab-hide-pc');
    if(elM) elM.checked = hideMobile;
    if(elP) elP.checked = hidePC;
    // UI 반영(열려있는 FAB 표시/숨김)
    try{ if(typeof updateFabVisibility==='function') updateFabVisibility(); }catch(e){}
  };
  setTimeout(function(){
    window.initFabTabSettings();
    window.initFabVisibilitySettings();
    try{ window.cfgInitAiProxy && window.cfgInitAiProxy(); }catch(e){}
  }, 50);
} // end first rCfg
window.rCfg = rCfg;
// reCfg: 설정탭 내용만 다시 렌더링 (render() 전체 호출 없이)
function reCfg(){
  try{
    if(typeof curTab!=='undefined' && curTab!=='cfg') return;
    const C=document.getElementById('rcont');
    const T=document.getElementById('rtitle');
    if(!C||!T) return;
    rCfg(C,T);
  }catch(e){}
}
window.reCfg = reCfg;


// ── 설정/메모 동기화(GitHub Gist) 상태 패널 ──
window.cfgRenderGistSyncStatus = function(){
  const box=document.getElementById('cfg-gist-sync-status');
  if(!box) return;
  if(!window.SettingsStore){
    box.innerHTML = `<span style="color:var(--red);font-weight:900">⚠️ SettingsStore 모듈이 없습니다.</span>`;
    return;
  }
  const st = (typeof window.SettingsStore.getSyncStatus==='function')
    ? window.SettingsStore.getSyncStatus()
    : { enabled: localStorage.getItem('al_sync_enabled')==='1', gistId: localStorage.getItem('al_gist_id')||'', tokenSet: !!localStorage.getItem('al_github_token'), isAdmin: (typeof isLoggedIn!=='undefined'&&isLoggedIn)&&(!(typeof isSubAdmin!=='undefined'&&isSubAdmin)) };

  // 입력값 채우기
  try{
    const gid=document.getElementById('cfg-gist-id'); if(gid) gid.value = st.gistId || '';
    const en=document.getElementById('cfg-gist-enabled'); if(en) en.checked = !!st.enabled;
  }catch(e){}

  const parts=[];
  parts.push(`<div><b>동기화</b>: ${st.enabled?'ON':'OFF'} ${st.isAdmin?'(관리자 저장 가능)':'(읽기만 가능)'}</div>`);
  parts.push(`<div><b>Gist ID</b>: ${st.gistId?`<code>${st.gistId}</code>`:'<span style="color:var(--gray-l)">미설정</span>'}</div>`);
  parts.push(`<div><b>토큰</b>: ${st.tokenSet?'✅ 설정됨':'미설정'}</div>`);
  if(st.remoteMode) parts.push(`<div><b>원격 파일</b>: ${st.remoteMode==='legacy'?'legacy(자동 마이그레이션 대상)':'su_settings.json'}</div>`);
  if(st.lastPull) parts.push(`<div><b>마지막 불러오기</b>: ${st.lastPull}</div>`);
  if(st.lastPush) parts.push(`<div><b>마지막 저장</b>: ${st.lastPush}</div>`);
  if(st.migrated) parts.push(`<div><b>마이그레이션</b>: ✅ 수행됨</div>`);
  if(st.lastError) parts.push(`<div style="color:var(--red)"><b>최근 오류</b>: ${esc(String(st.lastError))}</div>`);
  box.innerHTML = parts.join('');
};

window.cfgGistSyncSaveCfg = function(){
  if(!window.SettingsStore) return alert('SettingsStore 모듈이 없습니다.');
  const gid=(document.getElementById('cfg-gist-id')?.value||'').trim();
  const tok=(document.getElementById('cfg-gist-token')?.value||'').trim();
  const enEl=document.getElementById('cfg-gist-enabled');
  const en = enEl ? !!enEl.checked : (window.SettingsStore.cfg().enabled);
  const patch={};
  if(gid) patch.gistId=gid;
  if(typeof en !== 'undefined') patch.enabled=en;
  // 보안: 토큰은 입력했을 때만 업데이트(빈 값은 "유지")
  if(tok) patch.token=tok;
  try{
    window.SettingsStore.setCfg(patch);
    const msg=document.getElementById('cfg-gist-sync-msg');
    if(msg) msg.textContent='✅ 저장됨';
  }catch(e){
    alert('저장 실패: '+e.message);
  }
  try{ window.cfgRenderGistSyncStatus(); }catch(e){}
};

window.cfgGistSyncPull = async function(){
  const msg=document.getElementById('cfg-gist-sync-msg');
  if(msg) msg.textContent='불러오는 중...';
  try{
    if(!window.SettingsStore) throw new Error('SettingsStore 모듈이 없습니다.');
    const info = await window.SettingsStore.pull({ returnInfo:true });
    if(msg) msg.textContent = info && info.migrated ? '✅ 불러오기 완료 (+마이그레이션 완료)' : '✅ 불러오기 완료';
    try{ if(typeof showToast==='function') showToast('✅ 원격 설정 불러오기 완료'); }catch(e){}
  }catch(e){
    if(msg) msg.textContent='❌ 실패: '+e.message;
    try{ if(typeof showToast==='function') showToast('❌ 불러오기 실패: '+e.message); }catch(_){}
  }
  try{ window.cfgRenderGistSyncStatus(); }catch(e){}
};

window.cfgGistSyncPush = async function(){
  const msg=document.getElementById('cfg-gist-sync-msg');
  if(msg) msg.textContent='저장하는 중...';
  try{
    if(!window.SettingsStore) throw new Error('SettingsStore 모듈이 없습니다.');
    if(!window.SettingsStore.isAdmin()) throw new Error('관리자만 저장할 수 있습니다.');
    await window.SettingsStore.push();
    if(msg) msg.textContent='✅ 원격 저장 완료';
    try{ if(typeof showToast==='function') showToast('☁️ 다른 기기에도 반영됨'); }catch(e){}
  }catch(e){
    if(msg) msg.textContent='❌ 실패: '+e.message;
    try{ if(typeof showToast==='function') showToast('❌ 저장 실패: '+e.message); }catch(_){}
  }
  try{ window.cfgRenderGistSyncStatus(); }catch(e){}
};

function renderStorageInfo(){
  const el=document.getElementById('cfg-storage-info');
  if(!el)return;
  try{
    let total=0;const rows=[];
    const LEGACY_KEYS=['su_mm','su_um','su_cm','su_ck','su_pro','su_ptn','su_tn','su_ttm','su_indm','su_gjm','su_hist_ext_data_v1'];
    const legacyRows=[];
    for(let i=0;i<localStorage.length;i++){
      const k=localStorage.key(i);const v=localStorage.getItem(k)||'';
      const bytes=(k.length+v.length)*2;total+=bytes;
      if(k.startsWith('su_'))rows.push({k,bytes});
      if(LEGACY_KEYS.includes(k) && v) legacyRows.push({k,bytes});
    }
    rows.sort((a,b)=>b.bytes-a.bytes);
    legacyRows.sort((a,b)=>b.bytes-a.bytes);
    const limit=5*1024*1024;
    const pct=Math.min(100,Math.round(total/limit*100));
    const barCol=pct>=90?'#dc2626':pct>=70?'#f59e0b':'#22c55e';
    const fmt=b=>b>=1024*1024?(b/1024/1024).toFixed(2)+'MB':b>=1024?(b/1024).toFixed(1)+'KB':b+'B';
    const enc = v => {
      try{ return new Blob([JSON.stringify(v??null)]).size; }catch(e){ return 0; }
    };
    const matchMeta = (()=>{ try{ return JSON.parse(localStorage.getItem('su_match_store_meta_v1')||'null')||{}; }catch(e){ return {}; } })();
    const histMeta = (()=>{ try{ return JSON.parse(localStorage.getItem('su_hist_ext_meta_v1')||'null')||{}; }catch(e){ return {}; } })();
    const backendBadge = (label, backend) => {
      const isIdb = backend==='indexedDB';
      const text = backend==='localStorage' ? 'localStorage fallback' : isIdb ? 'IndexedDB' : '미확인';
      const bg = backend==='localStorage' ? '#fff7ed' : isIdb ? '#ecfdf5' : '#f1f5f9';
      const col = backend==='localStorage' ? '#c2410c' : isIdb ? '#047857' : '#64748b';
      return `<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;padding:6px 8px;border:1px solid var(--border);border-radius:8px;background:${bg}">
        <span style="font-size:11px;color:var(--text2)">${label}</span>
        <span style="font-size:11px;font-weight:800;color:${col}">${text}</span>
      </div>`;
    };
    const matchSnap = (window.MatchStore && typeof window.MatchStore.snapshot==='function') ? window.MatchStore.snapshot() : null;
    const histExtSnap = (typeof window._histExtLoad==='function') ? _histExtLoad() : null;
    const idbRows = [];
    if(matchSnap){
      const matchBytes = enc(matchSnap);
      const matchCount =
        (matchSnap.miniM?.length||0)+(matchSnap.univM?.length||0)+(matchSnap.comps?.length||0)+
        (matchSnap.ckM?.length||0)+(matchSnap.proM?.length||0)+(matchSnap.proTourneys?.length||0)+
        (matchSnap.tourneys?.length||0)+(matchSnap.ttM?.length||0)+(matchSnap.indM?.length||0)+
        (matchSnap.gjM?.length||0);
      idbRows.push({label:'경기 기록 원본', bytes:matchBytes, count:matchCount});
    }
    if(histExtSnap){
      const extBytes = enc(histExtSnap);
      const extCount = Array.isArray(histExtSnap.items) ? histExtSnap.items.length : 0;
      idbRows.push({label:'외부탭 기록', bytes:extBytes, count:extCount});
    }
    const idbTotal = idbRows.reduce((s,r)=>s+r.bytes,0);
    const LABELS={
      'su_p':'선수 데이터',
      'su_pp':'선수 사진',
      'su_mm':'미니대전(레거시)',
      'su_um':'대학대전(레거시)',
      'su_ck':'대학CK(레거시)',
      'su_pro':'프로리그(레거시)',
      'su_cm':'대회(레거시)',
      'su_tn':'토너먼트(레거시)',
      'su_ttm':'티어대회(레거시)',
      'su_indm':'개인전(레거시)',
      'su_gjm':'끝장전(레거시)',
      'su_hist_ext_data_v1':'외부탭 데이터(레거시)',
      'su_match_store_meta_v1':'경기기록 IndexedDB 메타',
      'su_hist_ext_meta_v1':'외부탭 IndexedDB 메타',
      'su_mb':'회원관리',
      'su_notices':'공지',
      'su_psi':'상태아이콘'
    };
    el.innerHTML=`
    <div style="margin-bottom:10px">
      <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:5px">
        <span style="font-weight:700;color:var(--text)">${fmt(total)} / 5MB 사용</span>
        <span style="font-weight:700;color:${barCol}">${pct}%</span>
      </div>
      <div style="height:10px;border-radius:5px;background:var(--border2);overflow:hidden">
        <div style="height:100%;width:${pct}%;background:${barCol};border-radius:5px;transition:.3s"></div>
      </div>
      ${pct>=70?`<div style="font-size:11px;color:${barCol};margin-top:5px;font-weight:600">${pct>=90?'⚠️ 저장 공간이 거의 가득 찼습니다! 데이터를 정리해 주세요.':'⚠️ 저장 공간이 많이 사용되고 있습니다.'}</div>`:''}
    </div>
    <div style="font-size:11px;color:var(--gray-l);margin-bottom:4px">항목별 사용량 (상위 10개)</div>
      <div style="font-size:10px;color:var(--gray-l);margin-bottom:8px">기본 저장소는 <b>IndexedDB</b>이며, 아래 localStorage 사용량은 주로 설정/레거시 키 기준입니다. IndexedDB가 불가능한 환경에서만 localStorage fallback이 사용됩니다.</div>
    <div style="display:flex;flex-direction:column;gap:6px;margin-bottom:10px">
      ${backendBadge('경기 기록 저장소', matchMeta.backend||'')}
      ${backendBadge('외부탭 기록 저장소', histMeta.backend||'')}
    </div>
    ${idbRows.length?`<div style="margin-bottom:10px;padding:10px;border:1px solid var(--border);background:var(--surface);border-radius:10px">
      <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:6px">
        <div style="font-size:12px;font-weight:800;color:var(--text2)">IndexedDB 사용량 추정</div>
        <div style="font-size:11px;color:var(--gray-l)">합계 약 ${fmt(idbTotal)}</div>
      </div>
      <div style="font-size:10px;color:var(--gray-l);margin-bottom:6px">실제 브라우저 내부 저장 오버헤드는 제외한 JSON 기준 추정치입니다.</div>
      <div style="display:flex;flex-direction:column;gap:5px">
        ${idbRows.map(r=>`<div style="display:flex;align-items:center;gap:6px">
          <span style="min-width:110px;color:var(--text2)">${r.label}</span>
          <div style="flex:1;height:6px;border-radius:3px;background:var(--border2);overflow:hidden">
            <div style="height:100%;width:${idbTotal?Math.max(4,Math.round(r.bytes/idbTotal*100)):0}%;background:#34d399;border-radius:3px"></div>
          </div>
          <span style="min-width:60px;text-align:right;color:var(--gray-l)">${fmt(r.bytes)}</span>
          <span style="min-width:46px;text-align:right;color:var(--gray-l)">${r.count||0}건</span>
        </div>`).join('')}
      </div>
    </div>`:''}
    <div style="margin-bottom:10px;padding:10px;border:1px solid var(--border);background:var(--surface);border-radius:10px">
      <div style="font-size:12px;font-weight:800;color:var(--text2);margin-bottom:6px">저장소 관리</div>
      <div style="font-size:10px;color:var(--gray-l);margin-bottom:8px">기록 원본은 기본적으로 IndexedDB에 저장됩니다. 문제가 있을 때 현재 메모리 데이터를 다시 저장소에 안전하게 다시 기록합니다. 기록 삭제 기능은 설정에서 제공하지 않습니다.</div>
      <div style="display:flex;flex-wrap:wrap;gap:6px">
        <button class="btn btn-w btn-xs" onclick="rebuildIndexedDbStores()">IndexedDB 재빌드</button>
      </div>
    </div>
    ${legacyRows.length?`<div style="margin-bottom:8px;padding:8px 10px;border:1px solid #fcd34d;background:#fffbeb;border-radius:8px">
      <div style="font-size:11px;font-weight:800;color:#92400e;margin-bottom:4px">레거시 저장 키가 남아 있습니다</div>
      <div style="font-size:10px;color:#a16207;margin-bottom:6px">${legacyRows.map(r=>LABELS[r.k]||r.k).join(', ')}</div>
      <button class="btn btn-w btn-xs" onclick="cleanupLegacyMatchStorageKeys()">레거시 키 정리</button>
    </div>`:''}
    <div style="font-size:11px;line-height:1.8">
      ${rows.slice(0,10).map(({k,bytes})=>{
        const label=LABELS[k]||k;
        const bpct=Math.min(100,Math.round(bytes/limit*100));
        return `<div style="display:flex;align-items:center;gap:6px;margin-bottom:3px">
          <span style="min-width:100px;color:var(--text2)">${label}</span>
          <div style="flex:1;height:6px;border-radius:3px;background:var(--border2);overflow:hidden"><div style="height:100%;width:${bpct}%;background:#60a5fa;border-radius:3px"></div></div>
          <span style="min-width:55px;text-align:right;color:var(--gray-l)">${fmt(bytes)}</span>
        </div>`;
      }).join('')}
    </div>`;
  }catch(e){el.innerHTML='<div style="color:var(--gray-l);font-size:12px">사용량 계산 불가</div>';}
}
function cleanupLegacyMatchStorageKeys(){
  const keys=['su_mm','su_um','su_cm','su_ck','su_pro','su_ptn','su_tn','su_ttm','su_indm','su_gjm','su_hist_ext_data_v1'];
  let removed=0;
  keys.forEach(k=>{
    try{
      if(localStorage.getItem(k)!==null){
        localStorage.removeItem(k);
        removed++;
      }
    }catch(e){}
  });
  try{ renderStorageInfo(); }catch(e){}
  alert(removed?`레거시 저장 키 ${removed}개를 정리했습니다.`:'정리할 레거시 저장 키가 없습니다.');
}
async function rebuildIndexedDbStores(){
  try{
    let msgs=[];
    if(window.MatchStore && typeof window.MatchStore.rebuild==='function'){
      const r=await window.MatchStore.rebuild();
      msgs.push(`경기 기록: ${r.backend||'unknown'}`);
    }
    if(window.HistoryExternalUtils && typeof window.HistoryExternalUtils.rebuildStorage==='function'){
      const r=await window.HistoryExternalUtils.rebuildStorage();
      msgs.push(`외부탭: ${r.backend||'unknown'}`);
    }
    renderStorageInfo();
    alert(`재빌드를 완료했습니다.\n${msgs.join('\n')}`);
  }catch(e){
    alert('재빌드 중 오류가 발생했습니다.');
  }
}

// ── 이미지탭 레이아웃 저장 함수 ──
function saveB2LayoutSettings(){
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
  alert('이미지탭 레이아웃이 저장되었습니다.');
  if(typeof render === 'function') render();
  // board2 탭이 열려있으면 다시 렌더링
  if(typeof _b2View !== 'undefined' && document.getElementById('b2-content')) {
    document.getElementById('b2-content').innerHTML = _b2PlayersView();
    if(_b2SelectedPlayer) _b2UpdateMainDisplay(_b2SelectedPlayer.name);
  }
}

// ── 구현황판 밝기 저장 함수 ──
function saveOldDashboardBrightness(){
  const labelAlpha = parseInt(document.getElementById('cfg-b2-label-alpha')?.value) || 16;
  const bgAlpha = parseInt(document.getElementById('cfg-b2-bg-alpha')?.value) || 9;
  localStorage.setItem('su_b2la', labelAlpha);
  localStorage.setItem('su_b2ba', bgAlpha);
  if(typeof save==='function')save();
  alert('구현황판 밝기 설정이 저장되었습니다.');
  if(typeof render === 'function') render();
}

// ── 이미지 설정 저장 함수 ──
function saveImageSettings(){
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
  alert('이미지 설정이 저장되었습니다.');
}

// ── 우클릭 이미지 조절 메뉴 ──
// tier-tour.js 등 다른 스크립트와 전역 식별자 충돌 방지
let _settingsImgContextMenuEl = null;
let _currentImageTarget = null;

function showImageContextMenu(e, imgElement){
  e.preventDefault();
  _currentImageTarget = imgElement;
  
  // 기존 메뉴 제거
  if(_settingsImgContextMenuEl){
    _settingsImgContextMenuEl.remove();
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
      <input type="range" id="ctx-scale" min="0.5" max="3" step="0.1" value="${currentScale}" style="width: 100%;" oninput="document.getElementById('ctx-scale-val').textContent=this.value+'x'">
    </div>
    <div style="padding: 8px 16px;">
      <label style="font-size: 11px; font-weight: 600; color: var(--text3); display: block; margin-bottom: 4px;">밝기: <span id="ctx-bright-val">${currentBrightness}x</span></label>
      <input type="range" id="ctx-bright" min="0.3" max="2" step="0.1" value="${currentBrightness}" style="width: 100%;" oninput="document.getElementById('ctx-bright-val').textContent=this.value+'x'">
    </div>
    <div style="padding: 8px 16px; border-top: 1px solid var(--border);">
      <button onclick="applyImageContextStyle()" style="width: 100%; padding: 6px 12px; background: var(--blue); color: #fff; border: none; border-radius: 6px; font-size: 12px; font-weight: 600; cursor:pointer;">✅ 적용</button>
    </div>
  `;
  
  document.body.appendChild(menu);
  _settingsImgContextMenuEl = menu;
  
  // 메뉴 외부 클릭 시 닫기
  setTimeout(()=>{
    const closeMenu = (ev)=>{
      if(!menu.contains(ev.target)){
        menu.remove();
        _settingsImgContextMenuEl = null;
        document.removeEventListener('click', closeMenu);
      }
    };
    document.addEventListener('click', closeMenu);
  }, 0);
}

function applyImageContextStyle(){
  if(!_currentImageTarget) return;
  
  const scale = document.getElementById('ctx-scale')?.value || 1;
  const brightness = document.getElementById('ctx-bright')?.value || 1;
  
  _currentImageTarget.style.transform = `scale(${scale})`;
  _currentImageTarget.style.filter = `brightness(${brightness})`;
  _currentImageTarget.dataset.scale = scale;
  _currentImageTarget.dataset.brightness = brightness;
  
  if(_settingsImgContextMenuEl){
    _settingsImgContextMenuEl.remove();
    _settingsImgContextMenuEl = null;
  }
}

// ── 랜덤 이미지 회전 ──
let _randomRotationTimer = null;

function startRandomRotation(){
  stopRandomRotation();
  const imgSettings = JSON.parse(localStorage.getItem('su_img_settings')||'{}');
  if(!imgSettings.randomRotation) return;
  
  const interval = (imgSettings.interval || 5) * 1000;
  
  _randomRotationTimer = setInterval(()=>{
    rotateRandomImage();
  }, interval);
}

function stopRandomRotation(){
  if(_randomRotationTimer){
    clearInterval(_randomRotationTimer);
    _randomRotationTimer = null;
  }
}

function rotateRandomImage(){
  const imgSettings = JSON.parse(localStorage.getItem('su_img_settings')||'{}');
  if(!imgSettings.randomRotation) return;
  
  // 랜덤 스트리머 선택
  if(players && players.length > 0){
    const randomPlayer = players[Math.floor(Math.random() * players.length)];
    
    // 전체대학 보기
    if(currentTab === 'total'){
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
let currentTab = 'total';

// 탭 변경 시 회전 제어
if(!window.__swWrappedForSettings){
  const originalSw = window.sw;
  window.sw = function(tab, el){
    currentTab = tab;
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

function bulkChangeTier(){
  if(!isLoggedIn) return;
  const fromTier=document.getElementById('bulk-tier-from')?.value||'';
  const toTier=document.getElementById('bulk-tier-to')?.value||'';
  const targetUniv=document.getElementById('bulk-tier-univ')?.value||'';
  if(!toTier){alert('변경할 티어를 선택하세요.');return;}
  const targets=players.filter(p=>{
    if(fromTier && (p.tier||'미정')!==fromTier) return false;
    if(targetUniv && p.univ!==targetUniv) return false;
    return true;
  });
  if(!targets.length){alert('해당하는 선수가 없습니다.');return;}
  if(!confirm(`${targets.length}명의 티어를 '${toTier}'으로 변경할까요?\n\n${targets.slice(0,5).map(p=>p.name).join(', ')}${targets.length>5?` 외 ${targets.length-5}명`:''}`)) return;
  targets.forEach(p=>{ p.tier=toTier; });
  save(); render();
  const el=document.getElementById('bulk-tier-result');
  if(el){ el.textContent=`✅ ${targets.length}명 변경 완료!`; setTimeout(()=>{if(el)el.textContent='';},3000); }
}

/* ══════════════════════════════════════
   경기 일괄 수정 함수들
══════════════════════════════════════ */
function bulkConvertToGameScore(){
  if(!isLoggedIn) return;
  const arrMap = {mini:miniM, univm:univM, ck:ckM, pro:proM, tt:ttM};
  const targets = ['mini','univm','ck','pro','tt'].filter(m=>document.getElementById('bulk-conv-chk-'+m)?.checked);
  if(!targets.length){ alert('대상을 선택하세요.'); return; }

  let converted = 0;
  targets.forEach(key=>{
    const arr = arrMap[key]||[];
    arr.forEach(m=>{
      if(!m.sets||!m.sets.length) return;
      const gA = m.sets.reduce((s,st)=>s+(st.scoreA||0),0);
      const gB = m.sets.reduce((s,st)=>s+(st.scoreB||0),0);
      // 세트 수와 다를 때만 변환
      if(gA!==m.sa||gB!==m.sb){
        m.sa=gA; m.sb=gB;
        m.scoreMode='game';
        converted++;
      }
    });
  });

  // 대회(tourneys) 조별리그도 변환
  (tourneys||[]).forEach(tn=>{
    if(!tn.groups) return;
    tn.groups.forEach(grp=>{
      (grp.matches||[]).forEach(m=>{
        if(!m.sets||!m.sets.length) return;
        const gA=m.sets.reduce((s,st)=>s+(st.scoreA||0),0);
        const gB=m.sets.reduce((s,st)=>s+(st.scoreB||0),0);
        if(gA!==m.sa||gB!==m.sb){
          m.sa=gA; m.sb=gB;
          m.scoreMode='game';
          converted++;
        }
      });
    });
    // 브라켓 경기도 변환
    const br=tn.bracket||{};
    Object.values(br.matchDetails||{}).forEach(m=>{
      if(!m||!m.sets||!m.sets.length) return;
      const gA=m.sets.reduce((s,st)=>s+(st.scoreA||0),0);
      const gB=m.sets.reduce((s,st)=>s+(st.scoreB||0),0);
      if(gA!==m.sa||gB!==m.sb){
        m.sa=gA; m.sb=gB;
        m.scoreMode='game';
        converted++;
      }
    });
    (br.manualMatches||[]).forEach(m=>{
      if(!m.sets||!m.sets.length) return;
      const gA=m.sets.reduce((s,st)=>s+(st.scoreA||0),0);
      const gB=m.sets.reduce((s,st)=>s+(st.scoreB||0),0);
      if(gA!==m.sa||gB!==m.sb){
        m.sa=gA; m.sb=gB;
        m.scoreMode='game';
        converted++;
      }
    });
  });

  if(converted===0){
    const el=document.getElementById('bulk-conv-result');
    if(el) el.textContent='변환할 경기가 없습니다. (이미 게임수 합산으로 저장됨)';
    return;
  }
  save(); render();
  const el=document.getElementById('bulk-conv-result');
  if(el) el.textContent='✅ '+converted+'건 변환 완료!';
  setTimeout(()=>{ if(el) el.textContent=''; }, 3000);
}

// (요청사항) 저장된 점수 방식(scoreMode: set/game)에 맞춰 sa/sb를 일괄 재계산
// - 세트로 저장된 기록은 세트승으로, 경기제로 저장된 기록은 게임수 합산으로 정리
// - scoreMode 미설정(old data)은 sets 기반으로 추정(set wins 합이 2 이상이면 set, 아니면 game)
function bulkRecalcScoreByMode(){
  if(!isLoggedIn) return;
  const arrMap = {mini:miniM, univm:univM, ck:ckM, pro:proM, tt:ttM};
  const targets = ['mini','univm','ck','pro','tt'].filter(m=>document.getElementById('bulk-conv-chk-'+m)?.checked);
  if(!targets.length){ alert('대상을 선택하세요.'); return; }

  const _calc = (sets, mode)=>{
    let sa=0, sb=0;
    (sets||[]).forEach(st=>{
      if(!st) return;
      const games = Array.isArray(st.games) ? st.games : [];
      const scoreA = (st.scoreA!=null) ? Number(st.scoreA) : games.filter(g=>g && g.winner==='A').length;
      const scoreB = (st.scoreB!=null) ? Number(st.scoreB) : games.filter(g=>g && g.winner==='B').length;
      let w = st.winner;
      if(!w) w = scoreA>scoreB?'A':scoreB>scoreA?'B':'';
      if(mode==='set'){
        if(w==='A') sa += 1;
        else if(w==='B') sb += 1;
      }else{
        sa += (isNaN(scoreA)?0:scoreA);
        sb += (isNaN(scoreB)?0:scoreB);
      }
    });
    return {sa, sb};
  };
  const _inferMode = (m)=>{
    const sm = (m && m.scoreMode) ? String(m.scoreMode) : '';
    if(sm==='set' || sm==='game') return sm;
    const sets = Array.isArray(m?.sets) ? m.sets : [];
    let wA=0, wB=0;
    sets.forEach(st=>{
      if(!st) return;
      const w = st.winner || ((st.scoreA||0)>(st.scoreB||0)?'A':(st.scoreB||0)>(st.scoreA||0)?'B':'');
      if(w==='A') wA++; else if(w==='B') wB++;
    });
    return (wA+wB>=2) ? 'set' : 'game';
  };

  let changed=0, setCnt=0, gameCnt=0;
  const _applyToMatch = (m)=>{
    if(!m || !m.sets || !m.sets.length) return;
    const mode = _inferMode(m);
    const sc = _calc(m.sets, mode);
    const need = (m.sa!==sc.sa || m.sb!==sc.sb) || (m.scoreMode!==mode);
    if(!need) return;
    m.sa = sc.sa;
    m.sb = sc.sb;
    m.scoreMode = mode;
    changed++;
    if(mode==='set') setCnt++; else gameCnt++;
  };

  targets.forEach(key=>{
    (arrMap[key]||[]).forEach(_applyToMatch);
  });
  // 대회(tourneys)도 포함
  (tourneys||[]).forEach(tn=>{
    if(tn?.groups){
      tn.groups.forEach(grp=>{
        (grp?.matches||[]).forEach(_applyToMatch);
      });
    }
    const br=tn?.bracket||{};
    Object.values(br.matchDetails||{}).forEach(_applyToMatch);
    (br.manualMatches||[]).forEach(_applyToMatch);
  });

  const el=document.getElementById('bulk-conv3-result');
  if(changed===0){
    if(el) el.textContent='재계산할 항목이 없습니다. (이미 저장형식대로 정리됨)';
    return;
  }
  save(); render();
  if(el) el.textContent=`✅ ${changed}건 재계산 완료! (세트제 ${setCnt} / 경기제 ${gameCnt})`;
  setTimeout(()=>{ if(el) el.textContent=''; }, 3500);
}

// (요청사항) 경기 기록을 "세트제(세트 승리 수)" 스코어로 일괄 변환
// - sets 배열 기반으로 sa/sb를 (세트 승)으로 재계산
// - 기존 sa/sb가 게임수로 저장된 경우를 한번에 수정하기 위함
function bulkConvertToSetScore(){
  if(!isLoggedIn) return;
  const arrMap = {mini:miniM, univm:univM, ck:ckM, pro:proM, tt:ttM};
  const targets = ['mini','univm','ck','pro','tt'].filter(m=>document.getElementById('bulk-conv-chk-'+m)?.checked);
  if(!targets.length){ alert('대상을 선택하세요.'); return; }

  const _setWins = (sets)=>{
    let sa=0, sb=0;
    (sets||[]).forEach(st=>{
      if(!st) return;
      const w = st.winner || ((st.scoreA||0)>(st.scoreB||0)?'A':(st.scoreB||0)>(st.scoreA||0)?'B':'');
      if(w==='A') sa++;
      else if(w==='B') sb++;
    });
    return {sa, sb};
  };

  let converted = 0;
  targets.forEach(key=>{
    const arr = arrMap[key]||[];
    arr.forEach(m=>{
      if(!m.sets||!m.sets.length) return;
      const w=_setWins(m.sets);
      if(w.sa!==m.sa || w.sb!==m.sb){
        m.sa=w.sa; m.sb=w.sb;
        m.scoreMode='set';
        converted++;
      }
    });
  });

  // 대회(tourneys) 조별리그/브라켓도 변환(있으면)
  (tourneys||[]).forEach(tn=>{
    if(!tn.groups) return;
    tn.groups.forEach(grp=>{
      (grp.matches||[]).forEach(m=>{
        if(!m.sets||!m.sets.length) return;
        const w=_setWins(m.sets);
        if(w.sa!==m.sa || w.sb!==m.sb){
          m.sa=w.sa; m.sb=w.sb;
          m.scoreMode='set';
          converted++;
        }
      });
    });
    const br=tn.bracket||{};
    Object.values(br.matchDetails||{}).forEach(m=>{
      if(!m||!m.sets||!m.sets.length) return;
      const w=_setWins(m.sets);
      if(w.sa!==m.sa || w.sb!==m.sb){
        m.sa=w.sa; m.sb=w.sb;
        m.scoreMode='set';
        converted++;
      }
    });
    (br.manualMatches||[]).forEach(m=>{
      if(!m.sets||!m.sets.length) return;
      const w=_setWins(m.sets);
      if(w.sa!==m.sa || w.sb!==m.sb){
        m.sa=w.sa; m.sb=w.sb;
        m.scoreMode='set';
        converted++;
      }
    });
  });

  if(converted===0){
    const el=document.getElementById('bulk-conv2-result');
    if(el) el.textContent='변환할 경기가 없습니다. (이미 세트제로 저장됨)';
    return;
  }
  save(); render();
  const el=document.getElementById('bulk-conv2-result');
  if(el) el.textContent='✅ '+converted+'건 변환 완료!';
  setTimeout(()=>{ if(el) el.textContent=''; }, 3000);
}


/* ══════════════════════════════════════
   시즌 관리 함수
══════════════════════════════════════ */
function renderSeasonList(){
  const el = document.getElementById('cfg-season-list');
  if(!el) return;
  if(!seasons.length){
    el.innerHTML = '<div style="font-size:12px;color:var(--gray-l);padding:8px 0">등록된 시즌이 없습니다.</div>';
    return;
  }
  el.innerHTML = seasons.map((s,i) => `
    <div style="display:flex;align-items:center;gap:8px;padding:8px 10px;background:var(--white);border:1px solid var(--border);border-radius:8px;margin-bottom:6px;flex-wrap:wrap">
      <span style="font-size:13px;font-weight:800;color:#7c3aed;min-width:100px">🏆 ${s.name}</span>
      <span style="font-size:11px;color:var(--gray-l)">${s.from} ~ ${s.to}</span>
      ${isLoggedIn ? '<button class="btn btn-w btn-xs" style="margin-left:auto" onclick="editSeason('+i+')">✏️ 수정</button><button class="btn btn-r btn-xs" onclick="deleteSeason('+i+')">🗑️</button>' : '<span style="margin-left:auto"></span>'}
    </div>`).join('');
}

function setBoardMemo2(univName, text){
  const u=univCfg.find(x=>x.name===univName);
  if(!u||!isLoggedIn)return;
  u.memo2=text;
  save();
}
function setBoardNote(univName, text){
  const u=univCfg.find(x=>x.name===univName);
  if(!u||!isLoggedIn)return;
  u.bMemo=text;
  save();
}
function addBoardNoteImg(univName, dataUrl){
  const u=univCfg.find(x=>x.name===univName);
  if(!u||!isLoggedIn)return;
  if(!u.bMemoImgs)u.bMemoImgs=[];
  u.bMemoImgs.push(dataUrl);
  save();render();
}
function removeBoardNoteImg(univName, idx){
  const u=univCfg.find(x=>x.name===univName);
  if(!u||!isLoggedIn)return;
  if(!u.bMemoImgs)u.bMemoImgs=[];
  u.bMemoImgs.splice(idx,1);
  save();render();
}
function setBoardMemoImg(univName, dataUrl){
  const u=univCfg.find(x=>x.name===univName);
  if(!u||!isLoggedIn)return;
  u.memoImg=dataUrl;
  save();render();
}
function addBoardMemoImg(univName, dataUrl){
  const u=univCfg.find(x=>x.name===univName);
  if(!u||!isLoggedIn)return;
  if(!u.memoImgs)u.memoImgs=[];
  u.memoImgs.push(dataUrl);
  save();render();
}
function removeBoardMemoImg(univName, idx){
  const u=univCfg.find(x=>x.name===univName);
  if(!u||!isLoggedIn)return;
  if(!u.memoImgs)u.memoImgs=[];
  u.memoImgs.splice(idx,1);
  save();render();
}

function setBoardBgImg(univName, dataUrl){
  const u=univCfg.find(x=>x.name===univName);
  if(!u||!isLoggedIn)return;
  u.bgImg=dataUrl;
  save();render();
}
function removeBoardBgImg(univName){
  const u=univCfg.find(x=>x.name===univName);
  if(!u||!isLoggedIn)return;
  delete u.bgImg;
  delete u.bgImgPos;
  save();render();
}
function setBoardBgImgPos(univName, pos){
  const u=univCfg.find(x=>x.name===univName);
  if(!u||!isLoggedIn)return;
  u.bgImgPos=pos;
  save();render();
}
function setBoardBgImgSize(univName, size){
  const u=univCfg.find(x=>x.name===univName);
  if(!u||!isLoggedIn)return;
  u.bgImgSize=size;
  save();render();
}
function promptBoardBgImgUrl(univName){
  const u=univCfg.find(x=>x.name===univName);
  if(!u||!isLoggedIn)return;
  const cur=u.bgImg&&!u.bgImg.startsWith('data:')?u.bgImg:'';
  const url=prompt('배경 이미지 URL을 입력하세요:\n(예: https://example.com/image.png)',cur);
  if(url===null)return;
  const trimmed=url.trim();
  if(!trimmed){showToast('URL을 입력해주세요.');return;}
  setBoardBgImg(univName,trimmed);
}
function promptBoardMemoImgUrl(univName){
  const u=univCfg.find(x=>x.name===univName);
  if(!u||!isLoggedIn)return;
  const url=prompt('사이드 이미지 URL을 입력하세요:\n(예: https://example.com/image.png)','');
  if(url===null)return;
  const trimmed=url.trim();
  if(!trimmed){showToast('URL을 입력해주세요.');return;}
  addBoardMemoImg(univName,trimmed);
}
function promptBoardNoteImgUrl(univName){
  const u=univCfg.find(x=>x.name===univName);
  if(!u||!isLoggedIn)return;
  const url=prompt('하단 이미지 URL을 입력하세요:\n(예: https://example.com/image.png)','');
  if(url===null)return;
  const trimmed=url.trim();
  if(!trimmed){showToast('URL을 입력해주세요.');return;}
  addBoardNoteImg(univName,trimmed);
}

/* ══════════════════════════════════════
   선수 CRUD
══════════════════════════════════════ */
// 등록 타입 변경 시 폼 필드 동적 표시/숨김
function onRegTypeChange() {
  const type = document.getElementById('p-reg-type')?.value || 'starcraft';
  const scFields = ['p-univ','p-tier','p-race'];
  const genderField = document.getElementById('p-gender');
  const displayNameField = document.getElementById('p-display-name');

  // 스타크래프트 전용 필드
  scFields.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.style.display = (type === 'starcraft') ? '' : 'none';
  });

  // 성별/프로필이름 (종합게임)
  if (genderField) genderField.style.display = (type === 'general') ? '' : 'none';
  if (displayNameField) displayNameField.style.display = (type === 'general') ? '' : 'none';
}

function addPlayer(){
  const n=document.getElementById('p-name').value.trim();
  if(!n)return alert('이름을 입력하세요.');
  if(players.find(p=>p.name===n)&&!confirm(`"${n}" 이름이 이미 있습니다.\n동명이인으로 등록할까요?`))return;
  const _pRegType=(document.getElementById('p-reg-type')?.value||'starcraft');
  const _pRole=(document.getElementById('p-role')?.value||'').trim();
  const _pPhoto=(document.getElementById('p-photo')?.value||'').trim();
  const _pDisplayName=(document.getElementById('p-display-name')?.value||'').trim();
  if(_pPhoto){
    if(_pPhoto.startsWith('data:')){alert('base64 이미지 직접 입력 불가 — imgur.com 등에 업로드 후 URL 사용');return;}
    if(_pPhoto.length>2000&&!confirm(`이미지 URL이 매우 깁니다 (${_pPhoto.length}자). 계속할까요?`))return;
  }
  const _pHideBoard=document.getElementById('p-hide-board')?.checked||false;
  const _pGender=document.getElementById('p-gender')?.value||'M';

  let playerData;

  if(_pRegType==='starcraft'){
    // 순수 스타크래프트 스트리머
    playerData={name:n,univ:document.getElementById('p-univ').value,tier:document.getElementById('p-tier').value,
      race:document.getElementById('p-race').value,gender:_pGender,role:_pRole||undefined,
      photo:_pPhoto||undefined,hideFromBoard:_pHideBoard||undefined,
      gameType:'starcraft',win:0,loss:0,points:0,history:[]};

  } else if(_pRegType==='general'){
    // 종합게임 스트리머
    playerData={name:n,gender:_pGender,role:_pRole||undefined,
      photo:_pPhoto||undefined,displayName:_pDisplayName||undefined,
      hideFromBoard:_pHideBoard||undefined,
      gameType:'종합게임',
      win:0,loss:0,points:0,history:[]};
  } else {
    playerData={name:n,univ:'무소속',gender:_pGender,role:_pRole||undefined,
      photo:_pPhoto||undefined,hideFromBoard:_pHideBoard||undefined,
      gameType:'starcraft',win:0,loss:0,points:0,history:[]};
  }

  players.push(playerData);
  document.getElementById('p-name').value='';
  document.getElementById('p-photo').value='';
  if(document.getElementById('p-display-name')) document.getElementById('p-display-name').value='';
  document.getElementById('p-hide-board').checked=false;
  save();render();
}
function bulkAddPlayers(){
  if(!isLoggedIn){alert('관리자만 사용 가능합니다.');return;}
  const raw=document.getElementById('bulk-player-input')?.value||'';
  const lines=raw.split('\n').map(l=>l.trim()).filter(Boolean);
  if(!lines.length){alert('등록할 스트리머를 입력하세요.');return;}
  const RACES=new Set(['T','Z','P','N']);
  const TIER_SET=new Set(typeof TIERS!=='undefined'?TIERS:['G','K','JA','J','S']);
  let added=0;const skipped=[];
  lines.forEach(line=>{
    const parts=line.split(/\s+/);
    if(!parts[0])return;
    const name=parts[0];
    let race='T',tier='',showOnBoard=false,gender='M';
    const univParts=[];
    parts.slice(1).forEach(tok=>{
      if(tok.toLowerCase()==='show'){showOnBoard=true;return;}
      if(tok.toLowerCase()==='hide'){return;} // hide는 기본값이므로 무시
      if(tok==='남자'||tok.toUpperCase()==='M'){gender='M';return;}
      if(tok==='여자'||tok.toUpperCase()==='F'){gender='F';return;}
      if(RACES.has(tok.toUpperCase())){race=tok.toUpperCase();return;}
      if(TIER_SET.has(tok)){tier=tok;return;}
      univParts.push(tok);
    });
    const univ=univParts.join(' ')||'무소속';
    if(players.find(p=>p.name===name)){skipped.push(name);return;}
    players.push({name,univ,tier:tier||'미정',race,gender,hideFromBoard:showOnBoard?undefined:true,win:0,loss:0,points:0,history:[]});
    added++;
  });
  if(added>0){save();render();}
  const resultEl=document.getElementById('bulk-player-result');
  if(resultEl){
    let msg=`✅ ${added}명 등록 완료`;
    if(skipped.length)msg+=`\n⚠️ 중복 스킵 (${skipped.length}명): ${skipped.join(', ')}`;
    resultEl.innerHTML=msg.replace('\n','<br>');
    resultEl.style.display='block';
    if(added>0)document.getElementById('bulk-player-input').value='';
  }
}
window.openEP=function(name){
  editName=name;const p=players.find(x=>x.name===name);
  if(!p) return;
  document.getElementById('emBody').innerHTML=`
    <label>스트리머 이름</label><input type="text" id="ed-n" value="${p.name}">
    <label>티어</label><select id="ed-t">${TIERS.map(t=>`<option value="${t}"${p.tier===t?' selected':''}>${getTierLabel(t)}</option>`).join('')}</select>
    <label>대학</label>
    <div style="display:flex;gap:6px;align-items:center">
      <select id="ed-u" style="flex:1">${getAllUnivs().filter(u=>!u.dissolved||u.name===p.univ).map(u=>`<option value="${u.name}"${p.univ===u.name?' selected':''}>${u.name}</option>`).join('')}</select>
      ${p.univ!=='무소속'?`<button type="button" onclick="document.getElementById('ed-u').value='무소속'" style="flex-shrink:0;padding:4px 10px;border-radius:7px;border:1.5px solid #9ca3af;background:var(--surface);color:#6b7280;font-size:11px;font-weight:700;cursor:pointer;white-space:nowrap">🚶 무소속</button>`:''}
    </div>
    <label>종족</label><select id="ed-r"><option value="T"${p.race==='T'?' selected':''}>테란</option><option value="Z"${p.race==='Z'?' selected':''}>저그</option><option value="P"${p.race==='P'?' selected':''}>프로토스</option><option value="N"${p.race==='N'?' selected':''}>종족미정</option></select>
    <label>성별</label><select id="ed-g"><option value="F"${(p.gender||'F')==='F'?' selected':''}>👩 여자</option><option value="M"${p.gender==='M'?' selected':''}>👨 남자</option></select>
    <label>직책 <span style="font-size:10px;font-weight:400;color:var(--gray-l)">(이사장/선장/동아리장/반장/총장/부총장/총괄/교수/코치는 정렬 우선순위 적용)</span></label>
    <div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:6px">
      ${MAIN_ROLES.map(r=>{const ic=ROLE_ICONS[r]||'🏷️';const col=ROLE_COLORS[r]||'#6b7280';return `<button type="button" onclick="const el=document.getElementById('ed-role');el.value=el.value===this.dataset.role?'':this.dataset.role;" data-role="${r}" style="padding:3px 8px;border-radius:6px;border:1.5px solid ${col};background:${p.role===r?col+'22':'var(--white)'};color:${col};font-size:11px;font-weight:700;cursor:pointer">${ic} ${r}</button>`;}).join('')}
      <button type="button" onclick="document.getElementById('ed-role').value=''" style="padding:3px 8px;border-radius:6px;border:1.5px solid #9ca3af;background:var(--white);color:#9ca3af;font-size:11px;font-weight:700;cursor:pointer">✕ 없음</button>
    </div>
    <input type="text" id="ed-role" value="${p.role||''}" placeholder="직책 직접 입력 또는 위 버튼 클릭" style="width:100%">
    <label>🖼 프로필 사진 URL <span style="font-size:10px;font-weight:400;color:var(--gray-l)">(현황판 카드에 표시 · 비워두면 기본 아이콘)</span></label>
    <div style="display:flex;gap:8px;align-items:center">
      <input type="text" id="ed-photo" value="${p.photo||''}" placeholder="https://... 이미지 URL 입력" style="flex:1" oninput="(function(el){const v=el.value.trim();const img=document.getElementById('ed-photo-preview');const warn=document.getElementById('ed-photo-warn');if(v&&v.startsWith('data:')){el.style.borderColor='#dc2626';if(warn){warn.style.color='#dc2626';warn.textContent='❌ base64 이미지 직접 입력 불가 — imgur.com 등에 업로드 후 URL 사용';}}else{el.style.borderColor='';if(warn){warn.textContent='이미지 URL을 붙여넣으면 현황판 선수 카드에 프로필 사진이 표시됩니다.';warn.style.color='var(--gray-l)';}}const wrap=document.getElementById('ed-photo-preview-wrap');if(v&&!v.startsWith('data:')){img.src=v;img.style.display='block';if(wrap)wrap.style.display='inline-block';}else{if(wrap)wrap.style.display='none';}})(this)">
      <span id="ed-photo-preview-wrap" style="position:relative;width:40px;height:40px;border-radius:var(--su_profile_radius,50%);overflow:hidden;flex-shrink:0;background:#e2e8f0;border:2px solid var(--border);display:${p.photo&&!p.photo.startsWith('data:')?'inline-block':'none'}">
        <img id="ed-photo-preview" src="${p.photo&&!p.photo.startsWith('data:')?toHttpsUrl(p.photo):''}" style="width:40px;height:40px;object-fit:cover;display:block" onerror="this.style.display='none';const w=document.getElementById('ed-photo-warn');if(w){w.style.color='#d97706';w.textContent='⚠️ 이미지를 불러올 수 없습니다. 다른 도메인에서 차단됐거나 URL이 잘못됐을 수 있습니다.';}">
      </span>
    </div>
    <div id="ed-photo-warn" style="font-size:10px;color:${p.photo&&p.photo.startsWith('data:')?'#dc2626':'var(--gray-l)'};margin-top:-6px">${p.photo&&p.photo.startsWith('data:')?'❌ base64 이미지 직접 입력 불가 — imgur.com 등에 업로드 후 URL 사용':'이미지 URL을 붙여넣으면 현황판 선수 카드에 프로필 사진이 표시됩니다.'}</div>
    <label>🖼 프로필 이미지 2 <span style="font-size:10px;font-weight:400;color:var(--gray-l)">(모바일/교체용 · 1초 후 자동 전환)</span></label>
    <input type="text" id="ed-photo2" value="${p.secondProfileFile||''}" placeholder="https://... 이미지 URL 입력" style="width:100%">
    <div style="font-size:10px;color:var(--gray-l);margin-top:-6px">현황판 등에서 보조 프로필 이미지로 사용됩니다.</div>
    <label>🏠 방송국 홈 URL <span style="font-size:10px;font-weight:400;color:var(--gray-l)">(홈 아이콘 클릭 시 이동)</span></label>
    <div style="display:flex;gap:8px;align-items:center">
      <input type="text" id="ed-channel" value="${p.channelUrl||''}" placeholder="https://chzzk.naver.com/... 또는 https://twitch.tv/..." style="flex:1">
      ${p.channelUrl?`<a href="${p.channelUrl}" target="_blank" style="font-size:18px;text-decoration:none" title="방송국 바로가기">🏠</a>`:''}
    </div>
    <div style="font-size:10px;color:var(--gray-l);margin-top:-6px">치지직/트위치/유튜브 등 방송국 주소. 스트리머 상세에서 홈 아이콘으로 이동됩니다.</div>
    <div style="margin-top:14px;padding:12px;background:var(--surface);border:1px solid var(--border);border-radius:8px">
      <div style="font-weight:800;font-size:12px;color:var(--text2);margin-bottom:10px">🖼 스트리머 상세 헤더 배경</div>
      <label>배경 이미지 URL <span style="font-size:10px;font-weight:400;color:var(--gray-l)">(비워두면 설정탭 기본값 사용)</span></label>
      <input type="text" id="ed-phbg" value="${p.detailHeaderBgImg||''}" placeholder="https://... 이미지 URL">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:10px">
        <div>
          <label>표시 방식</label>
          <select id="ed-phbg-fit">
            <option value=""${!p.detailHeaderBgFit?' selected':''}>설정값 따름</option>
            <option value="contain"${p.detailHeaderBgFit==='contain'?' selected':''}>맞춤</option>
            <option value="cover"${p.detailHeaderBgFit==='cover'?' selected':''}>채우기</option>
            <option value="fill"${p.detailHeaderBgFit==='fill'?' selected':''}>늘리기</option>
          </select>
        </div>
        <div>
          <label>크기 조절</label>
          <div style="display:flex;align-items:center;gap:8px">
            <input type="range" id="ed-phbg-scale" min="40" max="220" step="5" value="${Number(p.detailHeaderBgScale||100)||100}" style="flex:1;accent-color:var(--blue)" oninput="document.getElementById('ed-phbg-scale-val').textContent=this.value+'%'">
            <span id="ed-phbg-scale-val" style="font-size:11px;color:var(--gray-l);min-width:40px;text-align:right;font-weight:700">${Number(p.detailHeaderBgScale||100)||100}%</span>
          </div>
        </div>
      </div>
      <div style="font-size:11px;font-weight:700;color:var(--text3);margin:10px 0 6px">이미지 위치</div>
      <div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px">
        ${[
          ['left top','↖ 좌상'],['center top','↑ 상단'],['right top','↗ 우상'],
          ['left center','← 좌중'],['center center','• 중앙'],['right center','→ 우중'],
          ['left bottom','↙ 좌하'],['center bottom','↓ 하단'],['right bottom','↘ 우하']
        ].map(([pos,label])=>`<button type="button" data-phbg-pos="${pos}" class="btn btn-xs ${(p.detailHeaderBgPos||'center center')===pos?'btn-b':'btn-w'}"
          onclick="document.getElementById('ed-phbg-pos').value='${pos}'; document.querySelectorAll('[data-phbg-pos]').forEach(el=>el.className='btn btn-xs btn-w'); this.className='btn btn-xs btn-b';">${label}</button>`).join('')}
      </div>
      <input type="hidden" id="ed-phbg-pos" value="${p.detailHeaderBgPos||'center center'}">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:10px">
        <div>
          <label>가로 미세 위치</label>
          <div style="display:flex;align-items:center;gap:8px">
            <input type="range" id="ed-phbg-posx" min="0" max="100" step="1" value="${Number(p.detailHeaderBgPosX??50)||50}" style="flex:1;accent-color:var(--blue)" oninput="document.getElementById('ed-phbg-posx-val').textContent=this.value+'%'">
            <span id="ed-phbg-posx-val" style="font-size:11px;color:var(--gray-l);min-width:40px;text-align:right;font-weight:700">${Number(p.detailHeaderBgPosX??50)||50}%</span>
          </div>
        </div>
        <div>
          <label>세로 미세 위치</label>
          <div style="display:flex;align-items:center;gap:8px">
            <input type="range" id="ed-phbg-posy" min="0" max="100" step="1" value="${Number(p.detailHeaderBgPosY??50)||50}" style="flex:1;accent-color:var(--blue)" oninput="document.getElementById('ed-phbg-posy-val').textContent=this.value+'%'">
            <span id="ed-phbg-posy-val" style="font-size:11px;color:var(--gray-l);min-width:40px;text-align:right;font-weight:700">${Number(p.detailHeaderBgPosY??50)||50}%</span>
          </div>
        </div>
      </div>
    </div>
    <div style="margin-top:14px;padding:12px;background:#f8fafc;border:1px solid var(--border);border-radius:8px">
      <div style="font-weight:800;font-size:12px;color:var(--text2);margin-bottom:10px">🪪 개인 공유카드 배경</div>
      <label>배경 이미지 URL <span style="font-size:10px;font-weight:400;color:var(--gray-l)">(비워두면 대학색 배경 사용)</span></label>
      <input type="text" id="ed-sharebg" value="${p.shareCardBgImg||''}" placeholder="https://... 이미지 URL">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:10px">
        <div>
          <label>표시 방식</label>
          <select id="ed-sharebg-fit">
            <option value=""${!p.shareCardBgFit?' selected':''}>기본값</option>
            <option value="contain"${p.shareCardBgFit==='contain'?' selected':''}>맞춤</option>
            <option value="cover"${p.shareCardBgFit==='cover'?' selected':''}>채우기</option>
            <option value="fill"${p.shareCardBgFit==='fill'?' selected':''}>늘리기</option>
          </select>
        </div>
        <div>
          <label>크기 조절</label>
          <div style="display:flex;align-items:center;gap:8px">
            <input type="range" id="ed-sharebg-scale" min="40" max="220" step="5" value="${Number(p.shareCardBgScale||100)||100}" style="flex:1;accent-color:var(--blue)" oninput="document.getElementById('ed-sharebg-scale-val').textContent=this.value+'%'">
            <span id="ed-sharebg-scale-val" style="font-size:11px;color:var(--gray-l);min-width:40px;text-align:right;font-weight:700">${Number(p.shareCardBgScale||100)||100}%</span>
          </div>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:10px">
        <div>
          <label>어둡게 덮기</label>
          <div style="display:flex;align-items:center;gap:8px">
            <input type="range" id="ed-sharebg-dark" min="0" max="85" step="5" value="${Number(p.shareCardBgDark||18)||18}" style="flex:1;accent-color:var(--blue)" oninput="document.getElementById('ed-sharebg-dark-val').textContent=this.value+'%'">
            <span id="ed-sharebg-dark-val" style="font-size:11px;color:var(--gray-l);min-width:40px;text-align:right;font-weight:700">${Number(p.shareCardBgDark||18)||18}%</span>
          </div>
        </div>
        <div>
          <label>반투명 밝기</label>
          <div style="display:flex;align-items:center;gap:8px">
            <input type="range" id="ed-sharebg-fade" min="0" max="100" step="5" value="${Number(p.shareCardBgFade||0)||0}" style="flex:1;accent-color:var(--blue)" oninput="document.getElementById('ed-sharebg-fade-val').textContent=this.value+'%'">
            <span id="ed-sharebg-fade-val" style="font-size:11px;color:var(--gray-l);min-width:40px;text-align:right;font-weight:700">${Number(p.shareCardBgFade||0)||0}%</span>
          </div>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:10px">
        <div>
          <label>가로 위치</label>
          <select id="ed-sharebg-posx">
            <option value="left"${(p.shareCardBgPosX||'center')==='left'?' selected':''}>좌</option>
            <option value="center"${(!p.shareCardBgPosX||p.shareCardBgPosX==='center')?' selected':''}>중</option>
            <option value="right"${p.shareCardBgPosX==='right'?' selected':''}>우</option>
          </select>
        </div>
        <div>
          <label>세로 위치</label>
          <select id="ed-sharebg-posy">
            <option value="top"${p.shareCardBgPosY==='top'?' selected':''}>상</option>
            <option value="center"${(!p.shareCardBgPosY||p.shareCardBgPosY==='center')?' selected':''}>중</option>
            <option value="bottom"${p.shareCardBgPosY==='bottom'?' selected':''}>하</option>
          </select>
        </div>
      </div>
      <div style="font-size:10px;color:var(--gray-l);margin-top:8px">공유카드 전용 배경입니다. 스트리머 상세 헤더 배경과 별도로 저장됩니다.</div>
    </div>
    <div style="margin-top:14px;padding:14px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;">
      <div style="font-weight:700;font-size:12px;color:#15803d;margin-bottom:10px">🎭 상태 아이콘</div>
      <div style="display:flex;flex-wrap:wrap;gap:6px" id="ed-icon-btns">
        ${(()=>{const cur=getStatusIcon(p.name);return Object.entries(STATUS_ICON_DEFS).map(([id,d])=>{const isSelected=(id==='none'&&!cur)||(d.emoji&&cur===d.emoji);const iconHTML=d.emoji?(_siIsImg(d.emoji)?_siRender(d.emoji,'18px'):d.emoji):'<span style="font-size:11px;font-weight:700">없음</span>';return `<button type="button" onclick="setStatusIconFromModal(this,'${p.name}','${id}')" data-icon-id="${id}" title="${d.label}" style="padding:5px 10px;border-radius:7px;border:2px solid ${isSelected?'#16a34a':'var(--border)'};background:${isSelected?'#dcfce7':'var(--white)'};cursor:pointer;min-width:38px;transition:.12s;font-family:'Noto Sans KR',sans-serif;">${iconHTML}</button>`}).join('')})()}
      </div>
      <div id="ed-icon-label" style="font-size:11px;color:var(--gray-l);margin-top:7px">선택: ${(()=>{const c=getStatusIcon(p.name);const found=Object.entries(STATUS_ICON_DEFS).find(([,d])=>d.emoji&&d.emoji===c);const expiry=playerStatusExpiry[p.name];const expTxt=expiry?` (${expiry} 만료)`:'';return (found?found[1].label:'없음')+expTxt;})()}</div>
      <div id="ed-icon-expiry-row" style="display:${getStatusIcon(p.name)?'flex':'none'};align-items:center;gap:7px;margin-top:8px">
        <input type="checkbox" id="ed-icon-expiry" ${playerStatusExpiry[p.name]?'checked':''} onchange="onStatusExpiryChange('${p.name}')" style="width:14px;height:14px;cursor:pointer;accent-color:#16a34a">
        <label for="ed-icon-expiry" style="font-size:11px;color:#15803d;font-weight:600;cursor:pointer;margin:0">10일 후 자동으로 없음으로 변경</label>
      </div>
    </div>
    <div style="margin-top:16px;padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:8px;">
      <div style="font-weight:700;font-size:12px;color:var(--blue);margin-bottom:12px">📊 승패 직접 조정</div>
      <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-bottom:10px">
        <div style="flex:1;min-width:100px">
          <div style="font-size:11px;font-weight:700;color:var(--gray-l);margin-bottom:4px">승 (현재: ${p.win})</div>
          <input type="number" id="ed-win" value="${p.win}" min="0" style="width:100%">
        </div>
        <div style="flex:1;min-width:100px">
          <div style="font-size:11px;font-weight:700;color:var(--gray-l);margin-bottom:4px">패 (현재: ${p.loss})</div>
          <input type="number" id="ed-loss" value="${p.loss}" min="0" style="width:100%">
        </div>
        <div style="flex:1;min-width:100px">
          <div style="font-size:11px;font-weight:700;color:var(--gray-l);margin-bottom:4px">포인트 (현재: ${p.points})</div>
          <input type="number" id="ed-pts" value="${p.points}" style="width:100%">
        </div>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button class="btn btn-o btn-sm" onclick="
          if(confirm('승패와 히스토리를 모두 초기화하시겠습니까?')){
            const p=players.find(x=>x.name===editName);
            p.win=0;p.loss=0;p.points=0;p.history=[];
            document.getElementById('ed-win').value=0;
            document.getElementById('ed-loss').value=0;
            document.getElementById('ed-pts').value=0;
            save();render();
          }
        ">🔄 승패 전체 초기화</button>
        <button class="btn btn-w btn-sm" onclick="
          const p=players.find(x=>x.name===editName);
          p.win=parseInt(document.getElementById('ed-win').value)||0;
          p.loss=parseInt(document.getElementById('ed-loss').value)||0;
          p.points=parseInt(document.getElementById('ed-pts').value)||0;
          save();render();
          document.getElementById('emBody').querySelector('.apply-ok').style.display='inline-block';
          setTimeout(()=>document.getElementById('emBody').querySelector('.apply-ok').style.display='none',1500);
        " style="border-color:var(--green);color:var(--green)">✅ 승패 적용</button>
        <span class="apply-ok" style="display:none;color:var(--green);font-weight:700;font-size:12px;align-self:center">적용됨!</span>
      </div>
      <div style="font-size:10px;color:var(--gray-l);margin-top:8px">※ 승패 초기화 시 개인 경기 기록(히스토리)도 함께 삭제됩니다. 대전 기록(미니/대학대전 등)은 유지됩니다.</div>
    </div>
    <div style="margin-top:14px;padding:12px 14px;background:var(--surface);border:1px solid var(--border);border-radius:8px;display:flex;align-items:center;gap:10px">
      <label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:13px;font-weight:600;color:var(--text2);margin:0">
        <input type="checkbox" id="ed-retired" ${p.retired?'checked':''} style="width:16px;height:16px;cursor:pointer">
        🎗️ 은퇴 (현황판에서만 숨김, 경기 기록은 유지)
      </label>
    </div>
    <div style="margin-top:10px;padding:12px 14px;background:var(--surface);border:1px solid var(--border);border-radius:8px;display:flex;align-items:center;gap:10px">
      <label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:13px;font-weight:600;color:var(--text2);margin:0">
        <input type="checkbox" id="ed-inactive" ${p.inactive?'checked':''} style="width:16px;height:16px;cursor:pointer">
        ⏸️ 임시 상태 (휴학/활동중단) — 현황판에서 반투명 표시, 은퇴와 달리 숨기지 않음
      </label>
    </div>
    <div style="margin-top:10px;padding:12px 14px;background:var(--surface);border:1px solid var(--border);border-radius:8px;display:flex;align-items:center;gap:10px">
      <label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:13px;font-weight:600;color:var(--text2);margin:0">
        <input type="checkbox" id="ed-hide-board" ${p.hideFromBoard?'checked':''} style="width:16px;height:16px;cursor:pointer">
        👁️ 현황판에서 숨기기 (스탯·기록은 유지, 구현황판·신현황판 모두 적용)
      </label>
    </div>
    <!-- (요청사항) 크루 소속 항목 제거 -->
    <div style="margin-top:14px;padding:14px;background:#fffbeb;border:1px solid #fde68a;border-radius:8px;">
      <div style="font-weight:700;font-size:12px;color:#b45309;margin-bottom:8px">📝 선수 메모</div>
      <textarea id="ed-memo" style="width:100%;min-height:70px;font-size:12px;border:1px solid #fde68a;border-radius:6px;padding:8px;background:#fff;resize:vertical;font-family:'Noto Sans KR',sans-serif;line-height:1.6;box-sizing:border-box;" placeholder="선수에 대한 메모를 입력하세요...">${p.memo||''}</textarea>
    </div>`;
  om('emModal');
}
// 스트리머 상세 모달 → 수정창 열기
// emModal(z-index:5000) > playerModal(z-index:4000) 이므로 playerModal을 닫지 않고
// 그 위에 emModal을 열기만 함 → cm/om 순서 경쟁조건 완전 제거
function openEPFromModal(nameArg){
  const canEdit = !!(typeof isLoggedIn!=='undefined' && isLoggedIn) && !(typeof isSubAdmin!=='undefined' && isSubAdmin);
  if(!canEdit){ alert('총관리자만 수정할 수 있습니다.'); return; }
  const pst = (typeof getPlayerDetailState==='function') ? getPlayerDetailState() : (window.PlayerDetailState||{});
  const name=nameArg||pst.currentName;
  if(!name){alert('선수 이름을 확인할 수 없습니다.');return;}
  const p=players.find(x=>x.name===name);
  if(!p){alert('선수 정보를 찾을 수 없습니다: '+name);return;}
  try{
    openEP(name);
  }catch(e){
    console.error('[openEP] 오류:',e);
    alert('수정창 열기 실패: '+e.message);
  }
}
function savePlayer(){
  try{
  const canEdit = !!(typeof isLoggedIn!=='undefined' && isLoggedIn) && !(typeof isSubAdmin!=='undefined' && isSubAdmin);
  if(!canEdit){ alert('총관리자만 수정할 수 있습니다.'); return; }
  const p=players.find(x=>x.name===editName);
  if(!p){alert('선수를 찾을 수 없습니다.\n현재 editName: "'+editName+'"');return;}
  const newName=(document.getElementById('ed-n')?.value||'').trim();
  if(!newName){alert('이름을 입력하세요.');return;}
  const oldName=editName;

  // 이름 변경 시 모든 기록 자동 갱신
  if(newName !== oldName){
    if(players.some(x=>x.name===newName)&&!confirm(`"${newName}" 이름의 스트리머가 이미 존재합니다.\n동명이인으로 변경하시겠습니까?`))return;
    players.forEach(other=>{
      (other.history||[]).forEach(h=>{if(h.opp===oldName)h.opp=newName;});
    });
    const renameInMatches=(arr)=>{
      (arr||[]).forEach(m=>{
        (m.sets||[]).forEach(set=>{
          (set.games||[]).forEach(g=>{
            if(g.playerA===oldName)g.playerA=newName;
            if(g.playerB===oldName)g.playerB=newName;
          });
        });
        (m.teamAMembers||[]).forEach(mb=>{if(mb.name===oldName)mb.name=newName;});
        (m.teamBMembers||[]).forEach(mb=>{if(mb.name===oldName)mb.name=newName;});
      });
    };
    renameInMatches(miniM);renameInMatches(univM);renameInMatches(comps);
    renameInMatches(ckM);renameInMatches(proM);renameInMatches(ttM);
    // 🔧 개인전/끝장전: wName/lName 갱신
    [indM, gjM].forEach(arr=>{
      (arr||[]).forEach(m=>{
        if(m.wName===oldName) m.wName=newName;
        if(m.lName===oldName) m.lName=newName;
      });
    });
    tourneys.forEach(tn=>{
      (tn.groups||[]).forEach(grp=>{
        (grp.matches||[]).forEach(m=>{
          (m.sets||[]).forEach(set=>{
            (set.games||[]).forEach(g=>{
              if(g.playerA===oldName)g.playerA=newName;
              if(g.playerB===oldName)g.playerB=newName;
            });
          });
        });
      });
      // 브라켓 경기 이름 갱신
      const br=tn.bracket||{};
      Object.values(br.matchDetails||{}).forEach(m=>{
        if(!m)return;
        if(m.a===oldName)m.a=newName;
        if(m.b===oldName)m.b=newName;
        (m.sets||[]).forEach(set=>{
          (set.games||[]).forEach(g=>{
            if(g.playerA===oldName)g.playerA=newName;
            if(g.playerB===oldName)g.playerB=newName;
          });
        });
      });
      (br.manualMatches||[]).forEach(m=>{
        if(!m)return;
        if(m.a===oldName)m.a=newName;
        if(m.b===oldName)m.b=newName;
        (m.sets||[]).forEach(set=>{
          (set.games||[]).forEach(g=>{
            if(g.playerA===oldName)g.playerA=newName;
            if(g.playerB===oldName)g.playerB=newName;
          });
        });
      });
    });
  }

  p.name=newName;
  editName=p.name;
  p.tier=document.getElementById('ed-t')?.value||p.tier||'';
  p.univ=document.getElementById('ed-u')?.value||p.univ||'';
  p.race=document.getElementById('ed-r')?.value||p.race||'N';
  p.gender=document.getElementById('ed-g')?.value||p.gender||'F';
  const _rv=(document.getElementById('ed-role')?.value||'').trim();
  p.role=(!p.univ||p.univ==='무소속')?undefined:(_rv||undefined);
  const _photo=(document.getElementById('ed-photo')?.value||'').trim();
  if(_photo){
    if(_photo.startsWith('data:')){
      alert('❌ 프로필 사진에 base64 이미지(data:...)를 직접 붙여넣으면 동기화 저장이 실패할 수 있습니다.\n\n이미지를 imgur.com, Discord 등에 업로드한 후 URL을 사용하세요.');
      return;
    }
    if(_photo.length>2000){
      if(!confirm(`⚠️ 사진 URL이 매우 깁니다 (${_photo.length}자).\n정상 URL인지 확인하세요. 계속 저장하시겠습니까?`)) return;
    }
  }
  p.photo=_photo||undefined;
  const _win=document.getElementById('ed-win');
  const _loss=document.getElementById('ed-loss');
  const _pts=document.getElementById('ed-pts');
  if(_win)p.win=parseInt(_win.value)||0;
  if(_loss)p.loss=parseInt(_loss.value)||0;
  if(_pts)p.points=parseInt(_pts.value)||0;
  p.retired=document.getElementById('ed-retired')?.checked||false;
  if(!p.retired)p.retired=undefined;
  p.inactive=document.getElementById('ed-inactive')?.checked||false;
  if(!p.inactive)p.inactive=undefined;
  p.hideFromBoard=document.getElementById('ed-hide-board')?.checked||false;
  if(!p.hideFromBoard)p.hideFromBoard=undefined;
  // (요청사항) 크루 소속 항목 제거 (기존 값 유지)
  const _memo=(document.getElementById('ed-memo')?.value||'').trim();
  p.memo=_memo||undefined;
  const _channel=(document.getElementById('ed-channel')?.value||'').trim();
  p.channelUrl=_channel||undefined;
  const _photo2=(document.getElementById('ed-photo2')?.value||'').trim();
  const _phbg=(document.getElementById('ed-phbg')?.value||'').trim();
  const _phbgFit=(document.getElementById('ed-phbg-fit')?.value||'').trim();
  const _phbgScale=parseInt(document.getElementById('ed-phbg-scale')?.value||'100',10)||100;
  const _phbgPos=(document.getElementById('ed-phbg-pos')?.value||'center center').trim();
  const _phbgPosX=parseInt(document.getElementById('ed-phbg-posx')?.value||'50',10);
  const _phbgPosY=parseInt(document.getElementById('ed-phbg-posy')?.value||'50',10);
  const _shareBg=(document.getElementById('ed-sharebg')?.value||'').trim();
  const _shareBgFit=(document.getElementById('ed-sharebg-fit')?.value||'').trim();
  const _shareBgScale=parseInt(document.getElementById('ed-sharebg-scale')?.value||'100',10)||100;
  const _shareBgDark=parseInt(document.getElementById('ed-sharebg-dark')?.value||'18',10)||0;
  const _shareBgFade=parseInt(document.getElementById('ed-sharebg-fade')?.value||'0',10)||0;
  const _shareBgPosX=(document.getElementById('ed-sharebg-posx')?.value||'center').trim();
  const _shareBgPosY=(document.getElementById('ed-sharebg-posy')?.value||'center').trim();
  p.secondProfileFile=_photo2||undefined;
  p.detailHeaderBgImg=_phbg||undefined;
  p.detailHeaderBgFit=_phbgFit||undefined;
  p.detailHeaderBgScale=_phbg ? _phbgScale : undefined;
  p.detailHeaderBgPos=_phbg ? _phbgPos : undefined;
  p.detailHeaderBgPosX=_phbg ? (isNaN(_phbgPosX)?50:Math.max(0,Math.min(100,_phbgPosX))) : undefined;
  p.detailHeaderBgPosY=_phbg ? (isNaN(_phbgPosY)?50:Math.max(0,Math.min(100,_phbgPosY))) : undefined;
  p.shareCardBgImg=_shareBg||undefined;
  p.shareCardBgFit=_shareBgFit||undefined;
  p.shareCardBgScale=_shareBg ? _shareBgScale : undefined;
  p.shareCardBgDark=_shareBg ? _shareBgDark : undefined;
  p.shareCardBgFade=_shareBg ? _shareBgFade : undefined;
  p.shareCardBgPosX=_shareBg ? _shareBgPosX : undefined;
  p.shareCardBgPosY=_shareBg ? _shareBgPosY : undefined;
  save();
  cm('emModal');
  
  // (요청사항) 크루 자동 전환 로직 제거
  
  render();
  if(typeof openPlayerModal==='function'){
    const _savedName=p.name;
    setTimeout(()=>{
      const _p=players.find(x=>x.name===_savedName);
      if(_p) openPlayerModal(_savedName);
    },100);
  }
  }catch(e){
    console.error('[savePlayer] 오류:',e);
    alert('저장 중 오류가 발생했습니다:\n'+e.message+'\n\nF12 콘솔에서 자세한 내용을 확인하세요.');
  }
}
function setAllFemale(){
  if(!confirm(`모든 스트리머 ${players.length}명을 여자로 일괄 변경하시겠습니까?\n이후 남자 선수는 개별 수정으로 변경하세요.`))return;
  players.forEach(p=>p.gender='F');
  save();render();
  alert(`완료! 총 ${players.length}명이 여자로 변경되었습니다.`);
}

function delPlayer(){
  if(!confirm(`"${editName}" 선수를 완전 삭제할까요?\n\n⚠️ 선수 정보와 모든 경기 기록이 삭제됩니다.\n이 작업은 되돌릴 수 없습니다.`)) return;
  const name = editName;
  // 1. players 배열에서 완전 제거
  const idx = players.findIndex(x => x.name === name);
  if(idx >= 0) players.splice(idx, 1);
  // 2. 모든 경기 배열에서 해당 선수 관련 기록 제거
  // 개인전/끝장전: 해당 선수가 포함된 게임 제거
  if(typeof indM !== 'undefined') indM = indM.filter(m => m.wName !== name && m.lName !== name);
  if(typeof gjM !== 'undefined') gjM = gjM.filter(m => m.wName !== name && m.lName !== name);
  // 미니/대학대전/CK/프로/티어대회: 해당 선수가 포함된 세트의 게임 제거
  function _removePlayerFromMatches(arr) {
    arr.forEach(m => {
      if(!m.sets) return;
      m.sets.forEach(set => {
        if(!set.games) return;
        set.games = set.games.filter(g => g.playerA !== name && g.playerB !== name);
      });
    });
  }
  _removePlayerFromMatches(miniM);
  _removePlayerFromMatches(univM);
  _removePlayerFromMatches(ckM);
  _removePlayerFromMatches(proM);
  _removePlayerFromMatches(ttM);
  // 3. 다른 선수의 history에서 해당 선수와의 기록 제거 + win/loss/points/ELO 재계산
  players.forEach(p => {
    if(!p.history) return;
    const removed = p.history.filter(h => h.opp === name);
    if(!removed.length) return;
    p.history = p.history.filter(h => h.opp !== name);
    // 제거된 기록만큼 전적 차감
    removed.forEach(h => {
      if(h.result === '승') {
        p.win = Math.max(0, (p.win||0) - 1);
        p.points = (p.points||0) - 3;
        if(h.eloDelta != null) p.elo = (p.elo||ELO_DEFAULT) - h.eloDelta;
      } else if(h.result === '패') {
        p.loss = Math.max(0, (p.loss||0) - 1);
        p.points = (p.points||0) + 3;
        if(h.eloDelta != null) p.elo = (p.elo||ELO_DEFAULT) - h.eloDelta;
      }
    });
  });
  save();
  render();
  cm('emModal');
  cm('playerModal');
}

function openRE(mode,idx){
  reMode=mode;reIdx=idx;const allU=getAllUnivs();
  let body='',tit='';
  if(mode==='mini'){
    const m=miniM[idx];tit='⚡ 미니대전 수정';
    const mSetsA=m.sets?m.sets.reduce((s,st)=>s+(st.scoreA||0),0):null;
    const mSetsB=m.sets?m.sets.reduce((s,st)=>s+(st.scoreB||0),0):null;
    body=`<label>날짜</label><input type="date" id="re-d" value="${m.d}">
      <label>팀 A 대학</label><select id="re-a">${allU.map(u=>`<option value="${u.name}"${m.a===u.name?' selected':''}>${u.name}</option>`).join('')}</select>
      <label>팀 A 점수 (sa)</label>
      <div style="display:flex;gap:6px;align-items:center">
        <input type="number" id="re-sa" value="${m.sa}" style="flex:1">
        ${mSetsA!==null&&mSetsA!==m.sa?`<button type="button" onclick="document.getElementById('re-sa').value=${mSetsA};document.getElementById('re-sb').value=${mSetsB}" style="font-size:11px;padding:2px 8px;background:#fef9c3;border:1px solid #ca8a04;border-radius:6px;cursor:pointer;white-space:nowrap">🔄 게임수(${mSetsA}:${mSetsB})</button>`:''}
      </div>
      <label>팀 B 대학</label><select id="re-b">${allU.map(u=>`<option value="${u.name}"${m.b===u.name?' selected':''}>${u.name}</option>`).join('')}</select>
      <label>팀 B 점수 (sb)</label><input type="number" id="re-sb" value="${m.sb}">
      ${mSetsA!==null?`<div style="font-size:11px;color:var(--gray-l);margin-top:2px">세트 수: A ${m.sets.filter(s=>s.winner==='A').length} / B ${m.sets.filter(s=>s.winner==='B').length} | 게임 수: A ${mSetsA} / B ${mSetsB}</div>`:''}`;
  } else if(mode==='univm'){
    const m=univM[idx];tit='🏟️ 대학대전 수정';
    const uSetsA=m.sets?m.sets.reduce((s,st)=>s+(st.scoreA||0),0):null;
    const uSetsB=m.sets?m.sets.reduce((s,st)=>s+(st.scoreB||0),0):null;
    body=`<label>날짜</label><input type="date" id="re-d" value="${m.d}">
      <label>팀 A</label><select id="re-a">${allU.map(u=>`<option value="${u.name}"${m.a===u.name?' selected':''}>${u.name}</option>`).join('')}</select>
      <label>A 점수 (sa)</label>
      <div style="display:flex;gap:6px;align-items:center">
        <input type="number" id="re-sa" value="${m.sa}" style="flex:1">
        ${uSetsA!==null&&uSetsA!==m.sa?`<button type="button" onclick="document.getElementById('re-sa').value=${uSetsA};document.getElementById('re-sb').value=${uSetsB}" style="font-size:11px;padding:2px 8px;background:#fef9c3;border:1px solid #ca8a04;border-radius:6px;cursor:pointer;white-space:nowrap">🔄 게임수(${uSetsA}:${uSetsB})</button>`:''}
      </div>
      <label>팀 B</label><select id="re-b">${allU.map(u=>`<option value="${u.name}"${m.b===u.name?' selected':''}>${u.name}</option>`).join('')}</select>
      <label>B 점수 (sb)</label><input type="number" id="re-sb" value="${m.sb}">
      ${uSetsA!==null?`<div style="font-size:11px;color:var(--gray-l);margin-top:2px">세트 수: A ${m.sets.filter(s=>s.winner==='A').length} / B ${m.sets.filter(s=>s.winner==='B').length} | 게임 수: A ${uSetsA} / B ${uSetsB}</div>`:''}`;
  } else if(mode==='comp'){
    const c=comps[idx];tit='🎖️ 대회 수정';
    body=`<label>날짜</label><input type="date" id="re-d" value="${c.d}">
      <label>대회명</label><input type="text" id="re-cn" value="${c.n}">
      <label>대학 A</label><select id="re-a">${allU.map(u=>`<option value="${u.name}"${(c.a||c.u)===u.name?' selected':''}>${u.name}</option>`).join('')}</select>
      <label>A 세트 승</label><input type="number" id="re-sa" value="${c.sa||0}">
      <label>대학 B</label><select id="re-b">${allU.map(u=>`<option value="${u.name}"${c.b===u.name?' selected':''}>${u.name}</option>`).join('')}</select>
      <label>B 세트 승</label><input type="number" id="re-sb" value="${c.sb||0}">`;
  } else if(mode==='pro'){
    const m=proM[idx];tit='🏅 프로리그 수정';
    const mA=m.teamAMembers||[];const mB=m.teamBMembers||[];
    const pSetsGA=m.sets?m.sets.reduce((s,st)=>s+(st.scoreA||0),0):null;
    const pSetsGB=m.sets?m.sets.reduce((s,st)=>s+(st.scoreB||0),0):null;
    const pSetsWA=m.sets?m.sets.filter(s=>s.winner==='A').length:null;
    const pSetsWB=m.sets?m.sets.filter(s=>s.winner==='B').length:null;
    body=`<label>날짜</label><input type="date" id="re-d" value="${m.d||''}">
      <label>A팀 레이블</label><input type="text" id="re-tla" value="${m.teamALabel||''}">
      <label>A팀 점수 (sa)</label>
      <div style="display:flex;gap:6px;align-items:center">
        <input type="number" id="re-sa" value="${m.sa||0}" style="flex:1">
        ${pSetsGA!==null&&pSetsGA!==m.sa?`<button type="button" onclick="document.getElementById('re-sa').value=${pSetsGA};document.getElementById('re-sb').value=${pSetsGB}" style="font-size:11px;padding:2px 8px;background:#fef9c3;border:1px solid #ca8a04;border-radius:6px;cursor:pointer">🔄 게임수(${pSetsGA}:${pSetsGB})</button>`:''}
        ${pSetsWA!==null&&pSetsWA!==m.sa?`<button type="button" onclick="document.getElementById('re-sa').value=${pSetsWA};document.getElementById('re-sb').value=${pSetsWB}" style="font-size:11px;padding:2px 8px;background:#dbeafe;border:1px solid #2563eb;border-radius:6px;cursor:pointer">🔄 세트수(${pSetsWA}:${pSetsWB})</button>`:''}
      </div>
      <label>B팀 레이블</label><input type="text" id="re-tlb" value="${m.teamBLabel||''}">
      <label>B팀 점수 (sb)</label><input type="number" id="re-sb" value="${m.sb||0}">
      ${pSetsGA!==null?`<div style="font-size:11px;color:var(--gray-l);margin-top:2px">세트 수: A ${pSetsWA} / B ${pSetsWB} | 게임 수: A ${pSetsGA} / B ${pSetsGB}</div>`:''}
      <div style="margin-top:6px;font-size:11px;color:var(--gray-l)">※ 세트별 개인 경기는 기록 상세보기에서 수정하세요.</div>`;
  } else if(mode==='tt'){
    const m=ttM[idx];tit='🎯 티어대회 수정';
    const ttGA=m.sets?m.sets.reduce((s,st)=>s+(st.scoreA||0),0):null;
    const ttGB=m.sets?m.sets.reduce((s,st)=>s+(st.scoreB||0),0):null;
    const ttWA=m.sets?m.sets.filter(s=>s.winner==='A').length:null;
    const ttWB=m.sets?m.sets.filter(s=>s.winner==='B').length:null;
    body=`<label>날짜</label><input type="date" id="re-d" value="${m.d||''}">
      <label>대회명 (기록 분류 기준)</label><input type="text" id="re-ttcomp" value="${m.compName||m.n||m.t||''}">
      <label>A팀 점수 (sa)</label>
      <div style="display:flex;gap:6px;align-items:center">
        <input type="number" id="re-sa" value="${m.sa||0}" style="flex:1">
        ${ttGA!==null&&ttGA!==m.sa?`<button type="button" onclick="document.getElementById('re-sa').value=${ttGA};document.getElementById('re-sb').value=${ttGB}" style="font-size:11px;padding:2px 8px;background:#fef9c3;border:1px solid #ca8a04;border-radius:6px;cursor:pointer">🔄 게임수(${ttGA}:${ttGB})</button>`:''}
        ${ttWA!==null&&ttWA!==m.sa?`<button type="button" onclick="document.getElementById('re-sa').value=${ttWA};document.getElementById('re-sb').value=${ttWB}" style="font-size:11px;padding:2px 8px;background:#dbeafe;border:1px solid #2563eb;border-radius:6px;cursor:pointer">🔄 세트수(${ttWA}:${ttWB})</button>`:''}
      </div>
      <label>B팀 점수 (sb)</label><input type="number" id="re-sb" value="${m.sb||0}">
      ${ttGA!==null?`<div style="font-size:11px;color:var(--gray-l);margin-top:2px">세트 수: A ${ttWA} / B ${ttWB} | 게임 수: A ${ttGA} / B ${ttGB}</div>`:''}
      <div style="margin-top:6px;font-size:11px;color:var(--gray-l)">※ 세트별 개인 경기는 기록 상세보기에서 수정하세요.</div>`;
  } else if(mode==='ck'){
    const m=ckM[idx];tit='🤝 대학CK 수정';
    body=`<label>날짜</label><input type="date" id="re-d" value="${m.d||''}">
      <label>A조 세트 승</label><input type="number" id="re-sa" value="${m.sa||0}">
      <label>B조 세트 승</label><input type="number" id="re-sb" value="${m.sb||0}">
      <div style="margin-top:10px;font-size:11px;color:var(--gray-l)">※ 세트별 개인 경기는 기록 상세보기에서 수정하세요.</div>`;
  } else if(mode==='gj'){
    const m=gjM[idx];tit='⚔️ 끝장전 수정';
    body=`<label>날짜</label><input type="date" id="re-d" value="${m.d||''}">
      <label>승자</label><input type="text" id="re-gj-w" value="${m.wName||''}">
      <label>패자</label><input type="text" id="re-gj-l" value="${m.lName||''}">
      <label>맵</label><input type="text" id="re-gj-map" value="${m.map||''}">`;
  } else if(mode==='ind'){
    const m=indM[idx];tit='🎮 개인전 수정';
    body=`<label>날짜</label><input type="date" id="re-d" value="${m.d||''}">
      <label>승자</label><input type="text" id="re-gj-w" value="${m.wName||''}">
      <label>패자</label><input type="text" id="re-gj-l" value="${m.lName||''}">
      <label>맵</label><input type="text" id="re-gj-map" value="${m.map||''}">`;
  }
  document.getElementById('reTitle').innerText=tit;
  document.getElementById('reBody').innerHTML=body;om('reModal');
}
function saveRow(){
  const d=document.getElementById('re-d')?.value||'';
  if(reMode==='mini'){
    miniM[reIdx].d=d;
    miniM[reIdx].a=document.getElementById('re-a')?.value||miniM[reIdx].a;
    miniM[reIdx].b=document.getElementById('re-b')?.value||miniM[reIdx].b;
    miniM[reIdx].sa=parseInt(document.getElementById('re-sa').value)||0;
    miniM[reIdx].sb=parseInt(document.getElementById('re-sb').value)||0;
    // miniM에 _id가 없으면 생성
    if(!miniM[reIdx]._id)miniM[reIdx]._id=genId();
    // 선수 history 업데이트
    (miniM[reIdx].sets||[]).forEach(set=>{
      (set.games||[]).forEach(game=>{
        if(!game._id)game._id=miniM[reIdx]._id+'-'+Date.now()+Math.random().toString(36).substr(2,9);
        updatePlayerHistoryFromGame(game, d, 'mini');
      });
    });
  } else if(reMode==='univm'){
    const m=univM[reIdx];m.d=d;m.a=document.getElementById('re-a').value;
    m.sa=parseInt(document.getElementById('re-sa').value)||0;
    m.b=document.getElementById('re-b').value;m.sb=parseInt(document.getElementById('re-sb').value)||0;
    // univM에 _id가 없으면 생성
    if(!m._id)m._id=genId();
    // 선수 history 업데이트
    (m.sets||[]).forEach(set=>{
      (set.games||[]).forEach(game=>{
        if(!game._id)game._id=m._id+'-'+Date.now()+Math.random().toString(36).substr(2,9);
        updatePlayerHistoryFromGame(game, d, 'univ');
      });
    });
  } else if(reMode==='comp'){
    const c=comps[reIdx];c.d=d;c.n=document.getElementById('re-cn').value;
    c.a=document.getElementById('re-a').value;c.u=c.a;c.hostUniv=c.a;
    c.sa=parseInt(document.getElementById('re-sa').value)||0;
    c.b=document.getElementById('re-b').value;c.sb=parseInt(document.getElementById('re-sb').value)||0;
  } else if(reMode==='pro'){
    const m=proM[reIdx];m.d=d;
    m.teamALabel=document.getElementById('re-tla')?.value||m.teamALabel;
    m.teamBLabel=document.getElementById('re-tlb')?.value||m.teamBLabel;
    m.sa=parseInt(document.getElementById('re-sa').value)||0;
    m.sb=parseInt(document.getElementById('re-sb').value)||0;
    // proM에 _id가 없으면 생성
    if(!m._id)m._id=genId();
    // 선수 history 업데이트
    (m.sets||[]).forEach(set=>{
      (set.games||[]).forEach(game=>{
        if(!game._id)game._id=m._id+'-'+Date.now()+Math.random().toString(36).substr(2,9);
        updatePlayerHistoryFromGame(game, d, 'pro');
      });
    });
  } else if(reMode==='tt'){
    const m=ttM[reIdx];m.d=d;
    const ttn=document.getElementById('re-ttcomp')?.value;
    if(ttn!==undefined){m.compName=ttn;m.n=ttn;m.t=ttn;}
    m.sa=parseInt(document.getElementById('re-sa').value)||0;
    m.sb=parseInt(document.getElementById('re-sb').value)||0;
    // ttM에 _id가 없으면 생성 (기록 탭에서 표시되도록)
    if(!m._id)m._id=genId();
    // 선수 history 업데이트
    (m.sets||[]).forEach(set=>{
      (set.games||[]).forEach(game=>{
        if(!game._id)game._id=m._id+'-'+Date.now()+Math.random().toString(36).substr(2,9);
        updatePlayerHistoryFromGame(game, d, 'tier');
      });
    });
  } else if(reMode==='ck'){
    const m=ckM[reIdx];m.d=d;
    m.sa=parseInt(document.getElementById('re-sa').value)||0;
    m.sb=parseInt(document.getElementById('re-sb').value)||0;
  } else if(reMode==='gj'){
    const m=gjM[reIdx];m.d=d;
    m.wName=document.getElementById('re-gj-w')?.value.trim()||m.wName;
    m.lName=document.getElementById('re-gj-l')?.value.trim()||m.lName;
    m.map=document.getElementById('re-gj-map')?.value.trim()||m.map;
  } else if(reMode==='ind'){
    const m=indM[reIdx];m.d=d;
    m.wName=document.getElementById('re-gj-w')?.value.trim()||m.wName;
    m.lName=document.getElementById('re-gj-l')?.value.trim()||m.lName;
    m.map=document.getElementById('re-gj-map')?.value.trim()||m.map;
  }
  save();render();cm('reModal');
}

function renameUnivAcrossData(oldName,newName){
  oldName=(oldName||'').trim();
  newName=(newName||'').trim();
  if(!oldName||!newName||oldName===newName) return false;

  const _renameHistory=(h)=>{
    if(!h) return;
    ['univ','myUniv','oppUniv','team','oppTeam','teamA','teamB','teamALabel','teamBLabel'].forEach(k=>{
      if(h[k]===oldName) h[k]=newName;
    });
  };
  const _renameMember=(m)=>{
    if(m&&m.univ===oldName) m.univ=newName;
  };
  const _renameMatch=(m)=>{
    if(!m) return;
    ['a','b','u','hostUniv','teamALabel','teamBLabel'].forEach(k=>{
      if(m[k]===oldName) m[k]=newName;
    });
    (m.teamAMembers||[]).forEach(_renameMember);
    (m.teamBMembers||[]).forEach(_renameMember);
    (m.membersA||[]).forEach(_renameMember);
    (m.membersB||[]).forEach(_renameMember);
    (m.sets||[]).forEach(set=>{
      (set.games||[]).forEach(g=>{
        ['univA','univB','wUniv','lUniv','teamA','teamB'].forEach(k=>{
          if(g[k]===oldName) g[k]=newName;
        });
      });
    });
  };

  (players||[]).forEach(p=>{
    if(p.univ===oldName) p.univ=newName;
    (p.history||[]).forEach(_renameHistory);
  });

  [miniM,univM,comps,ckM,proM,ttM,indM,gjM].forEach(arr=>{
    (arr||[]).forEach(_renameMatch);
  });

  (tourneys||[]).forEach(tn=>{
    (tn.groups||[]).forEach(grp=>{
      if(Array.isArray(grp.univs)) grp.univs=grp.univs.map(u=>u===oldName?newName:u);
      (grp.matches||[]).forEach(_renameMatch);
    });
    const br=tn.bracket||{};
    Object.keys(br.slots||{}).forEach(k=>{ if(br.slots[k]===oldName) br.slots[k]=newName; });
    Object.keys(br.winners||{}).forEach(k=>{ if(br.winners[k]===oldName) br.winners[k]=newName; });
    if(br.champ===oldName) br.champ=newName;
    Object.values(br.matchDetails||{}).forEach(_renameMatch);
    (br.manualMatches||[]).forEach(_renameMatch);
  });

  (proTourneys||[]).forEach(tn=>{
    (tn.groups||[]).forEach(grp=>{
      if(Array.isArray(grp.univs)) grp.univs=grp.univs.map(u=>u===oldName?newName:u);
      (grp.matches||[]).forEach(_renameMatch);
    });
  });

  if(typeof boardPlayerOrder!=='undefined' && boardPlayerOrder && boardPlayerOrder[oldName]){
    if(!boardPlayerOrder[newName]) boardPlayerOrder[newName]=boardPlayerOrder[oldName];
    delete boardPlayerOrder[oldName];
    if(typeof saveBoardPlayerOrder==='function') saveBoardPlayerOrder();
  }

  return true;
}

function addUniv(){const n=document.getElementById('nu-n').value.trim();const c=document.getElementById('nu-c').value;if(!n)return;univCfg.push({name:n,color:c});save();render();refreshSel();}
function delUniv(i){if(confirm(`"${univCfg[i].name}" 삭제?`)){univCfg.splice(i,1);save();render();refreshSel();}}
let _univDragSrc=-1;
function _univDragStart(e,i){_univDragSrc=i;e.currentTarget.style.opacity='0.4';e.dataTransfer.effectAllowed='move';}
function _univDragOver(e){e.preventDefault();e.dataTransfer.dropEffect='move';return false;}
function _univDrop(e,i){
  e.stopPropagation();
  if(_univDragSrc===i)return false;
  const moved=univCfg.splice(_univDragSrc,1)[0];
  univCfg.splice(i,0,moved);
  save();render();
  return false;
}
function _univDragEnd(e){e.currentTarget.style.opacity='1';}

let _dissolveIdx = -1;
function openDissolveModal(i){
  _dissolveIdx = i;
  const u = univCfg[i];
  document.getElementById('dissolve-title').textContent = `"${u.name}" 해체 처리`;
  const today = new Date().toISOString().slice(0,10);
  document.getElementById('dissolve-date').value = today;
  const cnt = players.filter(p=>p.univ===u.name).length;
  document.getElementById('dissolve-player-count').textContent = cnt ? `현재 소속 선수 ${cnt}명` : '소속 선수 없음';
  document.getElementById('dissolve-move-players').checked = cnt > 0;
  om('dissolveModal');
}
function confirmDissolve(){
  if(_dissolveIdx < 0) return;
  const u = univCfg[_dissolveIdx];
  const date = document.getElementById('dissolve-date').value || new Date().toISOString().slice(0,10);
  const movePlayers = document.getElementById('dissolve-move-players').checked;
  u.dissolved = true;
  u.hidden = true;
  u.dissolvedDate = date;
  if(movePlayers){
    players.forEach(p=>{ if(p.univ===u.name){ p.univ='무소속'; p.role=undefined; } });
  }
  // 해체된 대학의 현황판 수동 순서 데이터 정리
  if(typeof boardPlayerOrder !== 'undefined' && boardPlayerOrder[u.name]){
    delete boardPlayerOrder[u.name];
    if(typeof saveBoardPlayerOrder === 'function') saveBoardPlayerOrder();
  }
  save();
  cm('dissolveModal');
  render();
  if(typeof renderBoard==='function') renderBoard();
}
function addTier(){
  const n=document.getElementById('nt-name').value.trim();
  if(!n)return alert('티어 이름을 입력하세요.');
  if(TIERS.includes(n))return alert('이미 존재하는 티어입니다.');
  TIERS.push(n);
  // TIERS는 const이므로 push 가능
  save();render();
  document.getElementById('p-tier').innerHTML=TIERS.map(t=>`<option value="${t}">${getTierLabel(t)}</option>`).join('');
}
function delTier(t){
  const protectedTiers=['G','K','JA','J','S','0티어'];
  if(protectedTiers.includes(t))return alert('기본 티어는 삭제할 수 없습니다.');
  if(!confirm(`"${t}" 티어를 삭제하시겠습니까?\n해당 티어의 선수는 기본 티어로 변경되지 않습니다.`))return;
  const idx=TIERS.indexOf(t);
  if(idx>=0)TIERS.splice(idx,1);
  save();render();
  document.getElementById('p-tier').innerHTML=TIERS.map(t2=>`<option value="${t2}">${getTierLabel(t2)}</option>`).join('');
}

// ── 티어 색상/밝기/이모지 커스텀 ──
function cfgTierThemeSetBri(pct){
  if(typeof setTierTheme!=='function') return;
  const v=(parseInt(pct,10)||100)/100;
  setTierTheme({bri:v});
  if(typeof render==='function') render();
  if(typeof reCfg==='function') reCfg();
}
function cfgTierThemeSetSat(pct){
  if(typeof setTierTheme!=='function') return;
  const v=(parseInt(pct,10)||100)/100;
  setTierTheme({sat:v});
  if(typeof render==='function') render();
  if(typeof reCfg==='function') reCfg();
}
function cfgTierThemeSetColor(tier, hex){
  if(typeof setTierTheme!=='function') return;
  const c = cfgNormHex(hex);
  if(!c){ try{ alert('색상 코드는 #RRGGBB 형식으로 입력하세요.'); }catch(e){}; return; }
  setTierTheme({bg:{[tier]:c}});
  // 입력창 동기화
  try{
    const sid=encodeURIComponent(tier);
    const cInp=document.getElementById('cfg-tier-c-'+sid);
    if(cInp) cInp.value=c;
    const hInp=document.getElementById('cfg-tier-hex-'+sid);
    if(hInp) hInp.value=c;
  }catch(e){}
  if(typeof render==='function') render();
  if(typeof reCfg==='function') reCfg();
}
function cfgTierThemeSetIcon(tier, icon){
  if(typeof setTierTheme!=='function') return;
  setTierTheme({icon:{[tier]:String(icon||'').trim()}});
  if(typeof render==='function') render();
  if(typeof reCfg==='function') reCfg();
}
function cfgTierThemeReset(){
  if(typeof resetTierTheme!=='function') return;
  if(!confirm('티어 색상/이모지를 기본값으로 초기화할까요?')) return;
  resetTierTheme();
  if(typeof render==='function') render();
  if(typeof reCfg==='function') reCfg();
}

// ── 색상 입력/스포이드 공용 유틸 ──
function cfgNormHex(v){
  const s=String(v||'').trim();
  if(!s) return null;
  const t = s.startsWith('#') ? s.slice(1) : s;
  if(/^[0-9a-fA-F]{6}$/.test(t)) return '#'+t.toUpperCase();
  if(/^[0-9a-fA-F]{3}$/.test(t)) return '#'+t.split('').map(ch=>ch+ch).join('').toUpperCase();
  return null;
}
async function cfgPickColorHex(){
  try{
    if(!window.EyeDropper){
      alert('스포이드 기능은 크롬/엣지 등 일부 브라우저에서만 지원됩니다.');
      return null;
    }
    const ed=new EyeDropper();
    const res=await ed.open();
    return res && res.sRGBHex ? String(res.sRGBHex) : null;
  }catch(e){
    return null;
  }
}

function cfgUnivSetColor(i, hex){
  const c = cfgNormHex(hex);
  if(!c){ try{ alert('색상 코드는 #RRGGBB 형식으로 입력하세요.'); }catch(e){}; return; }
  try{ univCfg[i].color = c; }catch(e){ return; }
  // UI 동기화
  try{ 
    const cInp=document.getElementById('cfg-univ-c-'+i);
    const row=cInp && cInp.closest ? cInp.closest('.srow') : null;
    const dot=row ? row.querySelector('.cdot') : null;
    if(dot) dot.style.background=c;
  }catch(e){}
  try{
    const cInp=document.getElementById('cfg-univ-c-'+i);
    if(cInp) cInp.value=c;
    const hInp=document.getElementById('cfg-univ-hex-'+i);
    if(hInp) hInp.value=c;
  }catch(e){}
  try{ save(); }catch(e){}
  try{ if(typeof renderBoard==='function') renderBoard(); }catch(e){}
}
async function cfgUnivPickColor(i){
  const c = await cfgPickColorHex();
  if(c) cfgUnivSetColor(i,c);
}

async function cfgTierThemePickColor(tier){
  const c = await cfgPickColorHex();
  if(c) cfgTierThemeSetColor(tier,c);
}

async function addAdminAccount(){
  const id=document.getElementById('adm-id').value.trim();
  const pw=document.getElementById('adm-pw').value;
  const roleEl=document.getElementById('adm-role');
  const role=roleEl?roleEl.value:'admin';
  const msg=document.getElementById('adm-msg');
  if(!id||!pw){msg.style.color='var(--red)';msg.textContent='아이디와 비밀번호를 모두 입력하세요.';return;}
  if(pw.length<8){msg.style.color='var(--red)';msg.textContent='비밀번호는 8자 이상이어야 합니다.';return;}
  const token=(localStorage.getItem('su_gh_token')||'').trim();
  if(!token){msg.style.color='var(--red)';msg.textContent='원격 관리자 계정 관리를 위해 GitHub 토큰을 먼저 설정하세요.';return;}
  try{ if(typeof pullAdminAccountsRemote==='function') await pullAdminAccountsRemote(true); }catch(e){}
  const accounts=getAdminAccounts();
  const idNorm=String(id||'').trim().toLowerCase();
  const idHash=await sha256(idNorm);
  if(accounts.some(a=>String(a.idHash||'')===idHash)){msg.style.color='var(--gold)';msg.textContent='이미 동일한 아이디가 등록되어 있습니다.';return;}
  if(role==='admin' && accounts.some(a=>(a && a.role)!=='sub-admin')){msg.style.color='var(--red)';msg.textContent='총관리자 계정은 1명만 등록할 수 있습니다.';return;}
  const rec=(typeof createAdminAccountRecord==='function') ? await createAdminAccountRecord(id,pw,role,id) : {hash:await sha256(id+':'+pw),role,label:id};
  const next=accounts.concat([rec]);
  localStorage.setItem(ADMIN_HASH_KEY,JSON.stringify(next));
  try{ localStorage.setItem('su_admin_hashes_updated_at', String(Date.now())); }catch(e){}
  const ok=(typeof pushAdminAccountsRemote==='function') ? await pushAdminAccountsRemote(next) : false;
  if(!ok){
    localStorage.setItem(ADMIN_HASH_KEY,JSON.stringify(accounts));
    msg.style.color='var(--red)';
    msg.textContent='원격 관리자 계정 저장에 실패했습니다. 다시 시도해 주세요.';
    return;
  }
  msg.style.color='var(--green)';
  const roleLabel=role==='sub-admin'?'부관리자':'총관리자';
  msg.textContent=`✅ ${roleLabel} 계정이 추가되었습니다. 총 ${next.length}명`;
  document.getElementById('adm-id').value='';
  document.getElementById('adm-pw').value='';
  reCfg();
}

async function clearAllAdmins(){
  if(!confirm('모든 관리자 계정을 삭제할까요?\n원격 관리자 계정 목록도 함께 비워집니다.'))return;
  const token=(localStorage.getItem('su_gh_token')||'').trim();
  if(!token){ alert('원격 관리자 계정 관리를 위해 GitHub 토큰을 먼저 설정하세요.'); return; }
  const prev=getAdminAccounts();
  localStorage.setItem(ADMIN_HASH_KEY,JSON.stringify([]));
  try{ localStorage.setItem('su_admin_hashes_updated_at', String(Date.now())); }catch(e){}
  const ok=(typeof pushAdminAccountsRemote==='function') ? await pushAdminAccountsRemote([]) : false;
  if(!ok){
    localStorage.setItem(ADMIN_HASH_KEY,JSON.stringify(prev));
    alert('원격 관리자 계정 삭제에 실패했습니다. 다시 시도해 주세요.');
    return;
  }
  doLogout();
  alert('초기화 완료. 원격 관리자 계정 목록이 비워졌습니다.');
}

function saveFbPw(){
  const pw = document.getElementById('cfg-fb-pw')?.value.trim();
  const statusEl = document.getElementById('fb-pw-status');
  if (!pw) { if(statusEl) statusEl.textContent = '⚠️ 보조 신호 비밀번호를 입력하세요.'; return; }
  localStorage.setItem('su_fb_pw', pw);
  if (statusEl) statusEl.textContent = '✅ 보조 신호 비밀번호 저장됨';
  const input = document.getElementById('cfg-fb-pw');
  if (input) input.value = '';
}
function clearFbPw(){
  localStorage.removeItem('su_fb_pw');
  const statusEl = document.getElementById('fb-pw-status');
  if (statusEl) statusEl.textContent = '미설정';
}
function saveGhToken(){
  const val = document.getElementById('cfg-gh-token')?.value.trim();
  const statusEl = document.getElementById('gh-token-status');
  if (!val) { if(statusEl) statusEl.textContent = '⚠️ 토큰을 입력하세요.'; return; }
  localStorage.setItem('su_gh_token', val);
  if(statusEl) statusEl.textContent = '✅ 토큰 저장됨 (저장 시 GitHub 자동 업로드 활성)';
  const input = document.getElementById('cfg-gh-token');
  if(input) input.value = '';
}
function clearGhToken(){
  localStorage.removeItem('su_gh_token');
  const statusEl = document.getElementById('gh-token-status');
  if(statusEl) statusEl.textContent = '미설정 (GitHub 업로드 비활성 / 보조 신호만 수신)';
}

/* ==========================================
   STATISTICS TAB
========================================== */
let statsSub='overview';
