/* ══════════════════════════════════════════════════════════════
   초기화 - 설정 자동동기화 & 폰트/테마/헤더/UI스케일 적용 (init.js 에서 분리, 2026-07-30)
   ══════════════════════════════════════════════════════════════ */

(function(){
  if(window._settingsAutoSyncStarted) return;
  window._settingsAutoSyncStarted = true;

  const doPull = async ()=>{
    try{
      if(!window.SettingsStore || typeof window.SettingsStore.pullOnSignal!=='function') return;
      const c = window.SettingsStore.cfg ? window.SettingsStore.cfg() : { gistId:'' };
      if(!c || !c.gistId) return;
      const info = await window.SettingsStore.pullOnSignal({silent:true, returnInfo:true});
      if(!info || info.skipped) return;
      try{
        if(typeof window.refreshSessionAuthority === 'function'){
          await window.refreshSessionAuthority(true);
        }
      }catch(e){}
      // 설정 팝업이 열려있고 AI 섹션이 보이면 입력값/상태 즉시 반영
      try{
        const m = document.getElementById('cfgModal');
        if(m && m.style.display!=='none'){
          const sec = document.getElementById('cfg-sec-aibot');
          if(sec && sec.closest && sec.closest('#cfgModalBody')){
            if(typeof window.cfgInitAiProxy==='function') window.cfgInitAiProxy();
          }
        }
      }catch(e){}
    }catch(e){}
  };

  // 첫 신호 확인
  setTimeout(doPull, 1200);
  // 설정 변경 신호 확인
  setInterval(doPull, 8000);
  // 포커스/재진입 시 신호 확인
  try{ window.addEventListener('focus', ()=>doPull()); }catch(e){}
  try{
    document.addEventListener('visibilitychange', ()=>{
      if(document.visibilityState === 'visible') doPull();
    });
  }catch(e){}
})();

// ─────────────────────────────────────────────────────────────
// 전역 폰트 설정
// - localStorage:
//   su_app_font_preset: system | noto | pretendard | nanum | gmarket | custom
//   su_app_font_css:    (옵션) 폰트 CSS URL
//   su_app_font_family: (옵션) font-family 문자열
// ─────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────
// 전역 폰트 설정 저장(설정탭 UI ↔ localStorage ↔ _applyAppFont 연결)
// - 기존에 호출부(cfg-appfont-* 컨트롤)만 있고 정의가 없어 아무 동작도 하지 않던 함수를 복원
// ─────────────────────────────────────────────────────────────
window.cfgSetAppFontSettings = function(){
  try{
    let preset = (document.getElementById('cfg-appfont-preset')?.value || 'noto').trim();
    const cssUrl = (document.getElementById('cfg-appfont-css')?.value || '').trim();
    let fam = (document.getElementById('cfg-appfont-family')?.value || '').trim();
    // CSS 직접 입력은 줄바꿈/앞뒤 공백이 의미 있을 수 있어 trim 하지 않음
    const cssTxt = (document.getElementById('cfg-appfont-csstext')?.value || '');
    // 프리셋 드롭다운에서 "custom:폰트명" 형태(저장된 커스텀 폰트)를 선택한 경우
    // → preset은 'custom'으로 정규화하고, 실제 font-family 값을 채워준다.
    if(/^custom:/.test(preset)){
      const name = preset.slice('custom:'.length).trim();
      preset = 'custom';
      if(name){
        fam = `${name}, "Noto Sans KR", sans-serif`;
        const inp = document.getElementById('cfg-appfont-family');
        if(inp) inp.value = fam;
      }
    }
    localStorage.setItem('su_app_font_preset', preset);
    localStorage.setItem('su_app_font_css', cssUrl);
    localStorage.setItem('su_app_font_family', fam);
    localStorage.setItem('su_app_font_css_text', cssTxt);
  }catch(e){}
  try{ if(typeof save === 'function') save(); }catch(e){}
  try{ if(typeof window._applyAppFont === 'function') window._applyAppFont(); }catch(e){}
  try{ if(typeof window._applyAppFontScale === 'function') window._applyAppFontScale(); }catch(e){}
  try{ if(typeof render === 'function') render(); }catch(e){}
  try{ if(typeof window._scheduleCloudAppSettingsSave === 'function') window._scheduleCloudAppSettingsSave(); }catch(e){}
  try{ if(typeof window.cfgTouchPrefsSync === 'function') window.cfgTouchPrefsSync(); }catch(e){}
};

window._applyAppFont = function(){
  let preset='noto', cssUrl='', fam='';
  try{ preset = (localStorage.getItem('su_app_font_preset') || 'noto').trim(); }catch(e){}
  try{ cssUrl = (localStorage.getItem('su_app_font_css') || '').trim(); }catch(e){}
  try{ fam = (localStorage.getItem('su_app_font_family') || '').trim(); }catch(e){}
  let cssTxt = '';
  try{ cssTxt = (localStorage.getItem('su_app_font_css_text') || '').trim(); }catch(e){}

  const ensureLink = (id, href) => {
    const head = document.head || document.getElementsByTagName('head')[0];
    if(!head) return;
    let el = document.getElementById(id);
    if(!href){
      if(el) el.remove();
      return;
    }
    if(!el){
      el = document.createElement('link');
      el.id = id;
      el.rel = 'stylesheet';
      head.appendChild(el);
    }
    el.href = href;
  };

  // 프리셋별 권장 CSS(없어도 동작하지만, 있으면 품질↑)
  const presetCss = {
    noto: 'https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;600;700;900&display=swap',
    pretendard: 'https://cdn.jsdelivr.net/gh/orioncactus/pretendard@latest/dist/web/variable/pretendardvariable.css',
    nanum: 'https://fonts.googleapis.com/css2?family=Nanum+Gothic:wght@400;700;800&display=swap',
    gmarket: 'https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_2001@1.1/GmarketSans.css',
    dohyeon: 'https://fonts.googleapis.com/css2?family=Do+Hyeon&display=swap',
    blackhansans: 'https://fonts.googleapis.com/css2?family=Black+Han+Sans&display=swap',
    ibmplexsans: 'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+KR:wght@400;600;700&display=swap',
  };
  ensureLink('app-font-preset-css', presetCss[preset] || '');
  ensureLink('app-font-custom-css', cssUrl);

  // CSS 직접 입력(@font-face 등) 지원
  try{
    const head = document.head || document.getElementsByTagName('head')[0];
    if(head){
      let st = document.getElementById('app-font-custom-style');
      if(!cssTxt){
        if(st) st.remove();
      }else{
        if(!st){
          st = document.createElement('style');
          st.id = 'app-font-custom-style';
          head.appendChild(st);
        }
        st.textContent = cssTxt;
      }
    }
  }catch(e){}

  // preset → font-family
  const presetFam = {
    system: 'system-ui, -apple-system, Segoe UI, Roboto, "Noto Sans KR", Arial, sans-serif',
    noto: '"Noto Sans KR", sans-serif',
    pretendard: '"Pretendard Variable", Pretendard, "Noto Sans KR", sans-serif',
    nanum: '"Nanum Gothic", "Noto Sans KR", sans-serif',
    gmarket: '"GmarketSans", "Noto Sans KR", sans-serif',
    dohyeon: '"Do Hyeon", "Noto Sans KR", sans-serif',
    blackhansans: '"Black Han Sans", "Noto Sans KR", sans-serif',
    ibmplexsans: '"IBM Plex Sans KR", "Noto Sans KR", sans-serif',
  };
  const finalFam = fam || presetFam[preset] || presetFam.noto;
  // 이모지(📊📅🏆 등)가 흑백으로 보이는 문제 방지:
  // - 전역 폰트를 강제 적용(body * { font-family: var(--app-font) !important; })하는 구조라
  //   이모지 폰트 폴백을 명시적으로 앞에 둬야 컬러 이모지가 유지됩니다.
  const emojiFam = '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji"';
  const finalFamWithEmoji = `${emojiFam}, ${finalFam}`;
  try{ document.documentElement.style.setProperty('--app-font', finalFamWithEmoji); }catch(e){}
};
window._applyAppFontScale = function(){
  try{
    const w = Math.max(320, Math.min(1920, window.innerWidth || 1024));
    const legacy = parseInt(localStorage.getItem('su_app_font_scale_pct')||'100',10) || 100;
    const key = w <= 768 ? 'su_app_font_scale_mb_pct' : (w <= 1024 ? 'su_app_font_scale_tb_pct' : 'su_app_font_scale_pc_pct');
    const pct = parseInt(localStorage.getItem(key)||String(legacy),10) || legacy;
    const mul = Math.max(85, Math.min(130, pct)) / 100;
    document.documentElement.style.setProperty('--fontS', String(mul));
  }catch(e){}
};
// 초기 1회 적용(렌더 전후 모두 대응)
try{ window._applyAppFont(); }catch(e){}
try{ window._applyAppFontScale(); }catch(e){}

// ─────────────────────────────────────────────────────────────
// (요청사항) 버튼/필(탭/필터) 스타일 전역 설정
// - localStorage:
//   su_btn_scale_pct: 85~125 (기본 100)
//   su_btn_r:         px (기본 8)
//   su_pill_r:        px (기본 20)
// ─────────────────────────────────────────────────────────────
window._applyUiBtnStyle = function(){
  let pct=100, br=8, pr=20;
  try{ pct = parseInt(localStorage.getItem('su_btn_scale_pct')||'100',10) || 100; }catch(e){}
  try{ br = parseInt(localStorage.getItem('su_btn_r')||'8',10) || 8; }catch(e){}
  try{ pr = parseInt(localStorage.getItem('su_pill_r')||'20',10) || 20; }catch(e){}
  pct = Math.max(70, Math.min(140, pct));
  br = Math.max(0, Math.min(40, br));
  pr = Math.max(0, Math.min(60, pr));
  const scale = pct/100;
  try{ document.documentElement.style.setProperty('--su_btn_scale', String(scale)); }catch(e){}
  try{ document.documentElement.style.setProperty('--su_btn_r', br+'px'); }catch(e){}
  try{ document.documentElement.style.setProperty('--su_pill_r', pr+'px'); }catch(e){}
};
try{ window._applyUiBtnStyle(); }catch(e){}

// ─────────────────────────────────────────────────────────────
// (요청사항) 전체 테마 변수 적용 (헤더 프리셋과 연동)
// - localStorage: su_theme_vars_v1 (JSON: { "--bg":"...", "--surface":"...", ... })
// - dark 모드에서는 배경 계열은 유지하고, 강조색(--blue 계열)만 적용
// ─────────────────────────────────────────────────────────────
window._applyThemeVars = function(){
  let obj=null;
  try{ obj = JSON.parse(localStorage.getItem('su_theme_vars_v1')||'null'); }catch(e){ obj=null; }
  if(!obj || typeof obj!=='object') obj=null;
  const tgt = document.body || document.documentElement;
  if(!tgt) return;
  // 기존 적용값 제거 후 재적용(없는 키는 제거)
  const keys = ['--bg','--white','--surface','--border','--border2','--blue','--blue-d','--blue-l','--blue-ll','--gold','--gold-bg','--gold-b','--green','--red','--gray','--gray-l'];
  try{
    keys.forEach(k=>{
      // obj가 없거나 해당 키가 없으면 inline 제거
      if(!obj || !Object.prototype.hasOwnProperty.call(obj,k)) tgt.style.removeProperty(k);
    });
  }catch(e){}
  if(!obj) return;
  const isDark = !!document.body?.classList?.contains('dark');
  const allowDark = new Set(['--blue','--blue-d','--blue-l','--blue-ll','--gold','--gold-bg','--gold-b','--green','--red']);
  try{
    Object.keys(obj).forEach(k=>{
      if(typeof obj[k] !== 'string') return;
      if(isDark && !allowDark.has(k)) return;
      tgt.style.setProperty(k, obj[k]);
    });
  }catch(e){}
};
window.setThemeVars = function(vars){
  try{
    if(!vars){ localStorage.removeItem('su_theme_vars_v1'); window._applyThemeVars(); return; }
    localStorage.setItem('su_theme_vars_v1', JSON.stringify(vars));
  }catch(e){}
  try{ window._applyThemeVars(); }catch(e){}
};
try{ window._applyThemeVars(); }catch(e){}

// ─────────────────────────────────────────────────────────────
// (요청사항) 헤더 커스텀(제목/좌측 아이콘/우측 이미지/배경 이미지/높이)
// - localStorage:
//   su_hdr_title
//   su_hdr_left_icon   (URL 또는 이모지)
//   su_hdr_left_size   (px)
//   su_hdr_right_img   (URL)
//   su_hdr_right_size  (px)
//   su_hdr_bg_img      (URL)
//   su_hdr_height      (px)
// ─────────────────────────────────────────────────────────────
window._applyHeaderSettings = function(){
  let title='', leftIco='', leftSz=22, rightImg='', rightSz=32, bgImg='', hdrH=0;
  // 신규: 헤더 색/효과 + 테마 동기화
  let fx='classic', c1='', c2='', syncTheme=false;
  try{ title=(localStorage.getItem('su_hdr_title')||'').trim(); }catch(e){}
  try{ leftIco=(localStorage.getItem('su_hdr_left_icon')||'').trim(); }catch(e){}
  try{ leftSz=parseInt(localStorage.getItem('su_hdr_left_size')||'22',10)||22; }catch(e){}
  try{ rightImg=(localStorage.getItem('su_hdr_right_img')||'').trim(); }catch(e){}
  try{ rightSz=parseInt(localStorage.getItem('su_hdr_right_size')||'32',10)||32; }catch(e){}
  try{ bgImg=(localStorage.getItem('su_hdr_bg_img')||'').trim(); }catch(e){}
  try{ hdrH=parseInt(localStorage.getItem('su_hdr_height')||'0',10)||0; }catch(e){}
  try{ fx=(localStorage.getItem('su_hdr_fx')||'classic').trim(); }catch(e){}
  try{ c1=(localStorage.getItem('su_hdr_c1')||'').trim(); }catch(e){}
  try{ c2=(localStorage.getItem('su_hdr_c2')||'').trim(); }catch(e){}
  try{ syncTheme=(localStorage.getItem('su_hdr_sync_theme')==='1'); }catch(e){ syncTheme=false; }
  leftSz=Math.max(14,Math.min(44,leftSz));
  rightSz=Math.max(18,Math.min(70,rightSz));
  hdrH=Math.max(0,Math.min(140,hdrH));

  const hdr=document.querySelector('.hdr');
  const tEl=document.querySelector('.hdr-title');
  const iEl=document.querySelector('.hdr-ico');
  const rEl=document.getElementById('hdrRightImg');
  if(hdr){
    try{
      if(hdrH>0) document.documentElement.style.setProperty('--hdr-h', hdrH+'px');
      else document.documentElement.style.removeProperty('--hdr-h');
    }catch(e){}
    // 색 유틸
    const _hexToRgb=(hex)=>{
      const h=String(hex||'').replace('#','').trim();
      if(!/^[0-9a-fA-F]{6}$/.test(h)) return null;
      return {r:parseInt(h.slice(0,2),16), g:parseInt(h.slice(2,4),16), b:parseInt(h.slice(4,6),16)};
    };
    const _rgbToHex=(r,g,b)=>{
      const to=(n)=>Math.max(0,Math.min(255,Math.round(n))).toString(16).padStart(2,'0');
      return `#${to(r)}${to(g)}${to(b)}`;
    };
    const _mix=(a,b,t)=>{
      const A=_hexToRgb(a), B=_hexToRgb(b);
      if(!A||!B) return a||b||'#2563eb';
      return _rgbToHex(A.r+(B.r-A.r)*t, A.g+(B.g-A.g)*t, A.b+(B.b-A.b)*t);
    };
    const _darken=(hex,t)=>_mix(hex,'#000000',t);
    const _lighten=(hex,t)=>_mix(hex,'#ffffff',t);

    // 기본 컬러
    const base1 = _hexToRgb(c1) ? c1 : '#1e3a8a';
    const base2 = _hexToRgb(c2) ? c2 : '#2563eb';
    const base3 = _darken(base1, 0.15);

    // 클래스 정리
    try{
      hdr.classList.remove('hdr-stripes','hdr-glass','hdr-aurora','hdr-mesh');
      if(fx==='glass') hdr.classList.add('hdr-glass');
      else if(fx==='aurora') hdr.classList.add('hdr-aurora');
      else if(fx==='mesh') hdr.classList.add('hdr-mesh');
      else hdr.classList.add('hdr-stripes'); // classic 기본
    }catch(e){}

    // CSS 변수로 전달
    try{
      hdr.style.setProperty('--hdr-c1', base1);
      hdr.style.setProperty('--hdr-c2', base2);
      hdr.style.setProperty('--hdr-c3', base3);
    }catch(e){}

    // 배경(이미지 포함)
    try{
      let g = '';
      // fx별 기본 배경 (그라데이션 말고도 제공)
      if(fx==='solid'){
        g = base2;
      } else if(fx==='glass'){
        // glass는 CSS에서 배경/블러 처리를 하므로, 여기서 background를 덮어쓰지 않음
        g = '';
      } else {
        // classic/aurora/mesh는 기본 그라데이션을 유지하고, 효과는 ::before로 표현
        g = `linear-gradient(135deg,${base1} 0%,${base2} 55%,${base3} 100%)`;
      }
      if(bgImg){
        // glass 모드일 때는 gradient를 합치지 않고 배경 이미지만 깔기
        if(fx==='glass'){
          hdr.style.backgroundImage = `url('${bgImg.replace(/'/g,"%27")}')`;
        }else{
          hdr.style.backgroundImage = `${g}, url('${bgImg.replace(/'/g,"%27")}')`;
        }
        hdr.style.backgroundSize = 'cover';
        hdr.style.backgroundPosition = 'center';
        hdr.style.backgroundRepeat = 'no-repeat';
      }else{
        if(fx==='glass'){
          hdr.style.background = '';
        }else{
          hdr.style.background = g;
        }
        hdr.style.backgroundImage = '';
        hdr.style.backgroundSize = '';
        hdr.style.backgroundPosition = '';
        hdr.style.backgroundRepeat = '';
      }
    }catch(e){}

    // 전체 테마(주색) 동기화
    try{
      if(syncTheme){
        const accent = base2;
        const blue = accent;
        const blueD = _darken(accent, 0.18);
        const blueL = _lighten(accent, 0.86);
        const blueLL = _lighten(accent, 0.92);
        // body에 inline으로 깔면 dark 모드 변수도 덮어씀
        const tgt = document.body || document.documentElement;
        tgt.style.setProperty('--blue', blue);
        tgt.style.setProperty('--blue-d', blueD);
        tgt.style.setProperty('--blue-l', blueL);
        tgt.style.setProperty('--blue-ll', blueLL);
      }else{
        const tgt = document.body || document.documentElement;
        tgt.style.removeProperty('--blue');
        tgt.style.removeProperty('--blue-d');
        tgt.style.removeProperty('--blue-l');
        tgt.style.removeProperty('--blue-ll');
      }
    }catch(e){}
  }
  if(tEl){
    try{
      if(title) tEl.textContent=title;
      // 문서 타이틀도 함께 반영
      if(title) document.title = `⭐ ${title}`;
    }catch(e){}
  }
  if(iEl){
    try{
      const v = leftIco || '🏆';
      // URL이면 이미지, 아니면 텍스트(이모지)로 처리
      if(/^https?:\/\//i.test(v)){
        iEl.innerHTML = `<img alt="" src="${v.replace(/"/g,'&quot;')}" style="width:${leftSz}px;height:${leftSz}px;object-fit:contain;display:block">`;
      }else{
        iEl.textContent = v;
        iEl.style.fontSize = leftSz+'px';
      }
    }catch(e){}
  }
  if(rEl){
    try{
      if(rightImg){
        rEl.src = rightImg;
        rEl.style.display = '';
        rEl.style.width = rightSz+'px';
        rEl.style.height = rightSz+'px';
      }else{
        rEl.style.display = 'none';
      }
    }catch(e){}
  }
};
// 초기 1회 적용(렌더 전후 대응)
try{ window._applyHeaderSettings(); }catch(e){}
// 헤더 적용 후 테마도 다시 적용(우선순위: 테마 vars → 헤더 sync는 --blue만 건드림)
try{ window._applyThemeVars && window._applyThemeVars(); }catch(e){}

// ─────────────────────────────────────────────────────────────
// 반응형 UI 스케일(자동): 브라우저/기기 폭에 따라 글자/아이콘 크기 자동 조절
// - CSS 변수 --uiS 로 제어 (style.css에서 적용)
// ─────────────────────────────────────────────────────────────
function _applyUiScale(){
  try{
    const w = Math.max(320, Math.min(1920, window.innerWidth || 1024));
    // 모바일은 살짝 작게(정보 밀도↑), 태블릿/PC는 기본
    let s = 1;
    if (w <= 360) s = 0.92;
    else if (w <= 430) s = 0.96;
    else if (w <= 520) s = 0.98;
    else if (w <= 768) s = 1.00;
    else if (w <= 1024) s = 1.02;
    else s = 1.00;
    // (신규) 수동 UI 스케일(폰트 크기) — 자동값에 곱해서 전역 적용
    // - 기기별 분리: su_ui_scale_pc_pct / su_ui_scale_tb_pct / su_ui_scale_mb_pct
    // - 구버전 호환: su_ui_scale_pct
    try{
      const legacy = parseInt(localStorage.getItem('su_ui_scale_pct')||'100',10) || 100;
      const key = w <= 768 ? 'su_ui_scale_mb_pct' : (w <= 1024 ? 'su_ui_scale_tb_pct' : 'su_ui_scale_pc_pct');
      const pct = parseInt(localStorage.getItem(key)||String(legacy),10) || legacy;
      const mul = Math.max(80, Math.min(140, pct)) / 100;
      s = s * mul;
    }catch(e){}
    document.documentElement.style.setProperty('--uiS', String(s));
  }catch(e){}
  try{ if(typeof window._applyAppFontScale === 'function') window._applyAppFontScale(); }catch(e){}
}
window.addEventListener('resize', ()=>{ _applyUiScale(); }, {passive:true});
// 설정에서 즉시 반영할 수 있도록 노출
window._applyUiScale = _applyUiScale;
_applyUiScale();

// ─────────────────────────────────────────────────────────────
// (요청사항) 모든 탭 공통 자동 맞춤(모바일/태블릿)
// - 간격/패딩/카드·그리드 밀도/테이블 패딩 등을 화면에 맞춰 조절
// - 설정: localStorage su_af_alltabs_v1 = '1'
// ─────────────────────────────────────────────────────────────
function _applyAllTabsAutoFit(){
  const key = 'su_af_alltabs_v1';
  let on = false;
  try{ on = (localStorage.getItem(key) === '1'); }catch(e){ on = false; }

  try{
    // 모바일 주소창 변동 대응용 CSS vh 변수
    const vh = (window.innerHeight || 800) * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  }catch(e){}

  try{
    if(document.body) document.body.classList.toggle('af-on', !!on);
  }catch(e){}
  if(!on) return;

  const w = Math.max(320, Math.min(1920, window.innerWidth || 1024));
  const h = Math.max(480, Math.min(2160, window.innerHeight || 800));
  const landscape = w > h;
  const isMobile = w <= 768;
  const isTablet = w > 768 && w <= 1024;

  // 기본값(PC)
  let bodyPad = 16, mainPad = 18, gap = 12, cardMin = 120, cardPad = 14;
  let tdx = 12, tdy = 8;

  if(isTablet){
    bodyPad = 12; mainPad = 14; gap = 10; cardMin = 110; cardPad = 12;
    tdx = 10; tdy = 7;
  }
  if(isMobile){
    bodyPad = 10; mainPad = 12; gap = 8; cardMin = 92; cardPad = 10;
    tdx = 8; tdy = 6;
  }
  // 가로모드(특히 모바일 가로)는 세로공간이 부족하니 더 촘촘하게
  if(landscape && w <= 1024){
    bodyPad = Math.max(6, bodyPad - 2);
    mainPad = Math.max(8, mainPad - 2);
    gap = Math.max(6, gap - 1);
    tdy = Math.max(5, tdy - 1);
  }

  try{
    const r = document.documentElement;
    r.style.setProperty('--af-body-pad', bodyPad+'px');
    r.style.setProperty('--af-main-pad', mainPad+'px');
    r.style.setProperty('--af-gap', gap+'px');
    r.style.setProperty('--af-card-min', cardMin+'px');
    r.style.setProperty('--af-card-pad', cardPad+'px');
    r.style.setProperty('--af-tdx', tdx+'px');
    r.style.setProperty('--af-tdy', tdy+'px');
  }catch(e){}
}
window._applyAllTabsAutoFit = _applyAllTabsAutoFit;
window.addEventListener('resize', ()=>{ _applyAllTabsAutoFit(); }, {passive:true});
window.addEventListener('orientationchange', ()=>{ setTimeout(_applyAllTabsAutoFit, 50); }, {passive:true});
_applyAllTabsAutoFit();

// ─────────────────────────────────────────────────────────────
// (요청사항) 기록 카드(모든 기록 탭) 테마/밝기 설정
// - 승리 대학색을 카드 배경/헤더에 연하게 적용
// ─────────────────────────────────────────────────────────────
