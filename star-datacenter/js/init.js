function showNoticePopup(){
  if(typeof notices==='undefined'||!notices.length) return;
  const active=notices.filter(n=>n.active);
  if(!active.length) return;
  const today=new Date().toLocaleDateString('ko-KR').replace(/\./g,'').replace(/ /g,'');
  // 공지별 개별 숨김 키 — 새 공지는 독립적으로 팝업됨
  const n=active.find(n=>!localStorage.getItem('su_nhide_'+n.id+'_'+today));
  if(!n) return;
  const todayKey='su_nhide_'+n.id+'_'+today;
  const titleEl=document.getElementById('notice-popup-title');
  const bodyEl=document.getElementById('notice-popup-body');
  const dateEl=document.getElementById('notice-popup-date');
  const iconEl=document.getElementById('notice-popup-type-icon');
  const headerEl=document.getElementById('notice-popup-header');
  if(!titleEl||!bodyEl) return;
  titleEl.textContent=n.title||'공지';
  bodyEl.textContent=n.body||'';
  dateEl.textContent=n.date||'';
  iconEl.textContent=n.type||'📢';
  // 타입별 헤더 색상
  const colors={'🔥':'linear-gradient(135deg,#991b1b,#dc2626)','⚠️':'linear-gradient(135deg,#92400e,#d97706)','🎉':'linear-gradient(135deg,#065f46,#059669)'};
  if(headerEl) headerEl.style.background=colors[n.type]||'linear-gradient(135deg,#1e3a8a,#2563eb)';
  window._noticePopupHideKey=todayKey;
  om('noticePopupModal');
}
function closeNoticePopup(){
  const chk=document.getElementById('notice-no-show-today');
  if(chk&&chk.checked&&window._noticePopupHideKey){
    localStorage.setItem(window._noticePopupHideKey,'1');
  }
  cm('noticePopupModal');
}

function init(){
  fixPoints();
  // 전역 폰트 설정 적용
  try{ if(typeof window._applyAppFont === 'function') window._applyAppFont(); }catch(e){}
  // ELO 미설정 선수에게 기본값 부여
  if(typeof ELO_DEFAULT!=='undefined'){
    players.forEach(p=>{ if(p.elo===undefined||p.elo===null) p.elo=ELO_DEFAULT; });
  }
  // 대회(tourneys) 기록 자동 소급 반영 (미반영분만, 중복 방지 내장)
  if(typeof syncTourneyHistory==='function') syncTourneyHistory();
  // 티어대회 데이터 마이그레이션 (조별리그/브라켓 기록 → ttM 동기화)
  if(typeof _migrateTierTourneys==='function') _migrateTierTourneys();
  // 티어대전 → 티어대회 명칭 마이그레이션
  if(typeof _migrateTierTourName==='function') _migrateTierTourName();
  // 연도 필터는 getYearOptions()가 렌더링 시 동적으로 계산하므로 별도 추출 불필요
  const ptier=document.getElementById('p-tier');
  if(ptier) ptier.innerHTML=TIERS.map(t=>`<option value="${t}">${getTierLabel(t)}</option>`).join('');
  try{refreshSel();}catch(e){}
  initLoginHash();
  applyLoginState();
  render();
  setTimeout(showNoticePopup, 800);
  // 🆕 URL 파라미터로 선수/대학 자동 오픈
  setTimeout(()=>{
    try{
      const params = new URLSearchParams(window.location.search);
      const playerParam = params.get('player');
      const univParam = params.get('univ');
      const queryParam = params.get('query');
      if(playerParam && typeof openPlayerModal==='function'){
        openPlayerModal(decodeURIComponent(playerParam));
      } else if(univParam && typeof openUnivModal==='function'){
        openUnivModal(decodeURIComponent(univParam));
      } else if(queryParam){
        const q = decodeURIComponent(queryParam);
        const exact = players.find(p=>p.name===q);
        if(exact && typeof openPlayerModal==='function'){
          openPlayerModal(q);
        } else {
          if(typeof sw==='function') sw('stats');
          if(typeof statsSub!=='undefined') statsSub='psearch';
          if(typeof _psearchQ!=='undefined') _psearchQ=q;
          if(typeof render==='function') render();
        }
      }
    }catch(e){}
  }, 1200);
}
init();
initDark();

// ─────────────────────────────────────────────────────────────
// 전역 폰트 설정
// - localStorage:
//   su_app_font_preset: system | noto | pretendard | nanum | gmarket | custom
//   su_app_font_css:    (옵션) 폰트 CSS URL
//   su_app_font_family: (옵션) font-family 문자열
// ─────────────────────────────────────────────────────────────
window._applyAppFont = function(){
  let preset='noto', cssUrl='', fam='';
  try{ preset = (localStorage.getItem('su_app_font_preset') || 'noto').trim(); }catch(e){}
  try{ cssUrl = (localStorage.getItem('su_app_font_css') || '').trim(); }catch(e){}
  try{ fam = (localStorage.getItem('su_app_font_family') || '').trim(); }catch(e){}

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
  try{ document.documentElement.style.setProperty('--app-font', finalFam); }catch(e){}
};
// 초기 1회 적용(렌더 전후 모두 대응)
try{ window._applyAppFont(); }catch(e){}

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
    document.documentElement.style.setProperty('--uiS', String(s));
  }catch(e){}
}
window.addEventListener('resize', ()=>{ _applyUiScale(); }, {passive:true});
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
function _applyRecCardTheme(){
  const onKey='su_rc_theme_on';
  const acKey='su_rc_accent_mode';
  const bgKey='su_rc_bg_alpha';
  const hdKey='su_rc_hd_alpha';
  const iconKey='su_rc_uicon';
  const memoKey='su_rc_memo_on';
  let on=true, accent='none', bg=12, hd=14, uicon=18, memoOn=false;
  try{
    const v=localStorage.getItem(onKey); if(v!=null) on = v==='1';
    const a=localStorage.getItem(acKey); if(a) accent=a;
    const b=parseInt(localStorage.getItem(bgKey)||'',10); if(!isNaN(b)) bg=b;
    const h=parseInt(localStorage.getItem(hdKey)||'',10); if(!isNaN(h)) hd=h;
    const ic=parseInt(localStorage.getItem(iconKey)||'',10); if(!isNaN(ic)) uicon=ic;
    const mo=localStorage.getItem(memoKey); if(mo!=null) memoOn = mo==='1';
  }catch(e){}
  bg=Math.max(0,Math.min(30,bg));
  hd=Math.max(0,Math.min(30,hd));
  uicon=Math.max(12,Math.min(28,uicon));
  accent = ['none','header','border'].includes(accent) ? accent : 'none';

  try{
    if(document.body){
      document.body.classList.toggle('rc-theme-on', !!on);
      document.body.classList.toggle('rc-accent-header', !!on && accent==='header');
      document.body.classList.toggle('rc-accent-border', !!on && accent==='border');
    }
    document.documentElement.style.setProperty('--rc-bg-a', String(bg/100));
    document.documentElement.style.setProperty('--rc-hd-a', String(hd/100));
    document.documentElement.style.setProperty('--rc-uicon', uicon+'px');
    document.documentElement.style.setProperty('--rc-memo-on', memoOn?'1':'0');
  }catch(e){}
}
window._applyRecCardTheme=_applyRecCardTheme;
_applyRecCardTheme();

// ─────────────────────────────────────────────────────────────
// (요청사항) 대회탭 카드(조별리그 일정 등) 테마/디자인 모드
// ─────────────────────────────────────────────────────────────
function _applyTourneyCardTheme(){
  const onKey='su_tc_theme_on';
  const acKey='su_tc_accent_mode';
  const hdKey='su_tc_hd_alpha';
  const bwKey='su_tc_border_w';
  const icKey='su_tc_uicon';
  const lwKey='su_tc_line_w';
  const laKey='su_tc_line_a';
  let on=false, accent='none', hd=12, bw=4, ic=34;
  let lw=2, la=70;
  try{
    const v=localStorage.getItem(onKey); if(v!=null) on = v==='1';
    const a=localStorage.getItem(acKey); if(a) accent=a;
    const h=parseInt(localStorage.getItem(hdKey)||'',10); if(!isNaN(h)) hd=h;
    const b=parseInt(localStorage.getItem(bwKey)||'',10); if(!isNaN(b)) bw=b;
    const i=parseInt(localStorage.getItem(icKey)||'',10); if(!isNaN(i)) ic=i;
    const w=parseInt(localStorage.getItem(lwKey)||'',10); if(!isNaN(w)) lw=w;
    const o=parseInt(localStorage.getItem(laKey)||'',10); if(!isNaN(o)) la=o;
  }catch(e){}
  hd=Math.max(0,Math.min(30,hd));
  bw=Math.max(2,Math.min(6,bw));
  ic=Math.max(24,Math.min(48,ic));
  lw=Math.max(1,Math.min(4,lw));
  la=Math.max(25,Math.min(100,la));
  accent = ['none','header','border'].includes(accent) ? accent : 'none';

  try{
    if(document.body){
      document.body.classList.toggle('tc-theme-on', !!on);
      document.body.classList.toggle('tc-accent-header', !!on && accent==='header');
      document.body.classList.toggle('tc-accent-border', !!on && accent==='border');
    }
    document.documentElement.style.setProperty('--tc-hd-a', String(hd/100));
    document.documentElement.style.setProperty('--tc-bw', bw+'px');
    document.documentElement.style.setProperty('--tc-uicon', ic+'px');
    document.documentElement.style.setProperty('--tc-line-w', lw+'px');
    document.documentElement.style.setProperty('--tc-line-a', String(la/100));
  }catch(e){}
}
window._applyTourneyCardTheme=_applyTourneyCardTheme;
_applyTourneyCardTheme();

// ─────────────────────────────────────────────────────────────
// 상단 탭/필터바: 스와이프/드래그로 가로 스크롤 가능하게(이동 버튼 없이도)
// - 대상: .tabs, .fbar (overflow-x:auto 영역)
// ─────────────────────────────────────────────────────────────
window.enableDragScroll = function(){
  try{
    document.querySelectorAll('.tabs, .fbar').forEach(el=>{
      if (el.dataset.dragScrollBound === '1') return;
      el.dataset.dragScrollBound = '1';
      el.style.cursor = 'grab';
      let down = false, startX = 0, startLeft = 0, moved = false;
      const onDown = (e) => {
        // 버튼/인풋 위에서는 드래그 시작 안 함
        const t = e.target;
        if (t && (t.closest('button') || t.closest('input') || t.closest('select') || t.closest('textarea'))) return;
        down = true; moved = false;
        startX = (e.touches ? e.touches[0].clientX : e.clientX);
        startLeft = el.scrollLeft;
        el.style.cursor = 'grabbing';
      };
      const onMove = (e) => {
        if (!down) return;
        const x = (e.touches ? e.touches[0].clientX : e.clientX);
        const dx = x - startX;
        if (Math.abs(dx) > 4) moved = true;
        el.scrollLeft = startLeft - dx;
        if (moved) e.preventDefault && e.preventDefault();
      };
      const onUp = () => { down = false; el.style.cursor = 'grab'; };
      el.addEventListener('mousedown', onDown);
      el.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
      el.addEventListener('touchstart', onDown, {passive:true});
      el.addEventListener('touchmove', onMove, {passive:false});
      el.addEventListener('touchend', onUp, {passive:true});
      // 드래그 후 클릭 오동작 방지
      el.addEventListener('click', (e)=>{ if(moved){ e.stopPropagation(); e.preventDefault(); moved=false; } }, true);
    });
  }catch(e){}
};
// 초기 1회
setTimeout(()=>{ try{ window.enableDragScroll && window.enableDragScroll(); }catch(e){} }, 400);

// ── 사이트 첫 접속 시 자동 불러오기 ──
(async function autoLoad(){
  try{
    // J()를 사용해 LZ-String 압축 데이터도 올바르게 감지
    const localPlayers = J('su_p');
    if(localPlayers && localPlayers.length > 0) return;
  }catch(e){}
  console.log('[자동 불러오기] 로컬 데이터 없음 → GitHub 자동 로드');
  const _RAW = 'https://raw.githubusercontent.com/nada1004/star-system/main/data.json';
  const _API = 'https://api.github.com/repos/nada1004/star-system/contents/data.json';
  const _CDN = 'https://cdn.jsdelivr.net/gh/nada1004/star-system@main/data.json';
  const _PROXY = 'https://api.allorigins.win/raw?url=' + encodeURIComponent(_RAW);
  const urls = [_RAW, _CDN, _API, _PROXY];
  gsSetStatus && gsSetStatus('🔄 데이터 불러오는 중...','var(--blue)');
  let d = null;
  for(const url of urls){
    try{
      const res = await Promise.race([
        fetch(url, {cache:'no-store', mode:'cors'}),
        new Promise((_,r)=>setTimeout(()=>r(new Error('timeout')),10000))
      ]);
      if(!res || !res.ok) continue;
      const text = await res.text();
      if(!text || !text.trim()) continue;
      let raw;
      try{ raw = JSON.parse(text); }catch(e){ continue; }
      if(raw && raw.content && raw.encoding==='base64'){
        try{
          const b64 = raw.content.replace(/\s/g,'');
          const bin = atob(b64);
          const bytes = new Uint8Array(bin.length);
          for(let i=0;i<bin.length;i++) bytes[i]=bin.charCodeAt(i);
          d = JSON.parse(new TextDecoder('utf-8').decode(bytes));
        }catch(e){ continue; }
      } else {
        d = raw;
      }
      if(d){ console.log('[자동 불러오기] 성공:', url); break; }
    }catch(e){ console.log('[자동 불러오기] 실패:', url, e.message); continue; }
  }
  if(d){
    // LZString 압축 데이터 자동 해제
    if(d && typeof d._lz === 'string'){
      try{ d = JSON.parse(LZString.decompressFromBase64(d._lz)); }
      catch(e){ console.warn('[자동 불러오기] 압축 해제 실패:', e); }
    }
    try{
      players  = d.players  || d.player  || [];
      univCfg  = d.univCfg  || d.univConfig || d.universities || univCfg;
      maps     = d.maps     || d.map     || maps;
      tourD    = d.tourD    || d.tournamentDates || Array(15).fill('');
      miniM    = d.miniM    || d.mini    || d.miniMatches || [];
      univM    = d.univM    || d.univ    || d.univMatches || [];
      comps    = d.comps    || d.comp    || d.competitions || [];
      ckM      = d.ckM      || d.ck      || d.ckMatches   || [];
      compNames= d.compNames|| d.competitionNames || [];
      curComp  = d.curComp  || d.currentComp || '';
      proM     = d.proM     || d.pro     || d.proMatches  || [];
      tourneys = d.tourneys || d.tournaments || d.tourney || [];
      ttM      = d.ttM      || d.tt      || [];
      if(d.notices && d.notices.length) notices = d.notices;
      if(d.tiers && d.tiers.length) TIERS.splice(0, TIERS.length, ...d.tiers);
      const allD=[...miniM,...univM,...comps,...ckM,...proM];
      const years=new Set(allD.map(m=>(m.d||'').slice(0,4)).filter(y=>/^\d{4}$/.test(y)));
      years.forEach(y=>{if(!yearOptions.includes(y))yearOptions.push(y);});
      yearOptions.sort();
      fixPoints();
      // autoLoad 후 티어대회 마이그레이션 재실행 (flag 리셋 후 재호출)
      if(typeof _migrateTierTourneys==='function'){
        if(typeof _ttMigrated!=='undefined') _ttMigrated=false;
        _migrateTierTourneys();
      }
      // autoLoad 후 티어대전→티어대회 명칭 마이그레이션 재실행
      if(typeof _migrateTierTourName==='function'){
        if(typeof _tierTourNameMigrated!=='undefined') _tierTourNameMigrated=false;
        _migrateTierTourName();
      }
      save(); render();
      gsSetStatus && gsSetStatus('✅ 자동 불러오기 완료 ('+new Date().toLocaleTimeString()+')','var(--green)');
    }catch(e){
      console.error('[자동 불러오기] 데이터 적용 오류:', e);
      gsSetStatus && gsSetStatus('','');
    }
  } else {
    gsSetStatus && gsSetStatus('','');
    console.warn('[자동 불러오기] 모든 URL 실패');
  }
})();
