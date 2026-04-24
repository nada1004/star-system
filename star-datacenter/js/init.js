function showNoticePopup(){
  if(typeof notices==='undefined'||!notices.length) return;
  const active=notices.filter(n=>n.active);
  if(!active.length) return;
  const today=new Date().toLocaleDateString('ko-KR').replace(/\./g,'').replace(/ /g,'');
  // 怨듭?蹂?媛쒕퀎 ?④? ??????怨듭????낅┰?곸쑝濡??앹뾽??  const n=active.find(n=>!localStorage.getItem('su_nhide_'+n.id+'_'+today));
  if(!n) return;
  const todayKey='su_nhide_'+n.id+'_'+today;
  const titleEl=document.getElementById('notice-popup-title');
  const bodyEl=document.getElementById('notice-popup-body');
  const dateEl=document.getElementById('notice-popup-date');
  const iconEl=document.getElementById('notice-popup-type-icon');
  const headerEl=document.getElementById('notice-popup-header');
  if(!titleEl||!bodyEl) return;
  titleEl.textContent=n.title||'怨듭?';
  bodyEl.textContent=n.body||'';
  dateEl.textContent=n.date||'';
  iconEl.textContent=n.type||'?뱼';
  // ??낅퀎 ?ㅻ뜑 ?됱긽
  const colors={'?뵦':'linear-gradient(135deg,#991b1b,#dc2626)','?좑툘':'linear-gradient(135deg,#92400e,#d97706)','?럦':'linear-gradient(135deg,#065f46,#059669)'};
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

// ?????????????????????????????????????????????????????????????
// (?붿껌?ы빆) 媛濡?"?쒕옒洹?硫붾돱" 吏??// - overflow-x:auto ??硫붾돱 諛붾? 留덉슦?ㅻ줈 ?대┃-?쒕옒洹??댁꽌 ?ㅽ겕濡?媛?ν븯寃?// - render() ?댄썑 ?숈쟻?쇰줈 ?앹꽦?섎뒗 ?붿냼?먮룄 ?곸슜??(render.js?먯꽌 ?몄텧)
// ?????????????????????????????????????????????????????????????
window.enableDragScroll = function(root){
  const scope = root || document;
  const bars = scope.querySelectorAll ? scope.querySelectorAll('.hist-inlinebar') : [];
  bars.forEach(el=>{
    if(el.dataset && el.dataset.dragScrollBound==='1') return;
    if(el.dataset) el.dataset.dragScrollBound='1';

    let isDown=false, startX=0, startScroll=0, moved=false;

    const down = (e)=>{
      // 留덉슦??醫뚰겢由?쭔(?고겢由??좏겢由??쒖쇅)
      if(e.pointerType==='mouse' && e.button!==0) return;
      isDown=true;
      moved=false;
      startX=e.clientX;
      startScroll=el.scrollLeft;
      el.classList.add('dragging');
      try{ el.setPointerCapture(e.pointerId); }catch(_){}
    };
    const move = (e)=>{
      if(!isDown) return;
      const dx = e.clientX - startX;
      if(Math.abs(dx)>3) moved=true;
      el.scrollLeft = startScroll - dx;
      if(moved) e.preventDefault();
    };
    const up = (e)=>{
      if(!isDown) return;
      isDown=false;
      el.classList.remove('dragging');
      // ?쒕옒洹몃줈 ?ㅽ겕濡ㅽ븳 寃쎌슦 踰꾪듉 ?대┃ 諛⑹?
      el._dragMoved = moved;
      setTimeout(()=>{ try{ el._dragMoved=false; }catch(_){} }, 0);
      try{ el.releasePointerCapture(e.pointerId); }catch(_){}
    };

    el.addEventListener('pointerdown', down, {passive:true});
    el.addEventListener('pointermove', move, {passive:false});
    el.addEventListener('pointerup', up, {passive:true});
    el.addEventListener('pointercancel', up, {passive:true});
    el.addEventListener('click', (ev)=>{
      if(el._dragMoved){
        ev.preventDefault();
        ev.stopPropagation();
      }
    }, true);
  });
};

function init(){
  fixPoints();
  // ?꾩뿭 ?고듃 ?ㅼ젙 ?곸슜
  try{ if(typeof window._applyAppFont === 'function') window._applyAppFont(); }catch(e){}
  // (?붿껌?ы빆) 踰꾪듉/???ㅽ????ㅼ젙 ?곸슜
  try{ if(typeof window._applyUiBtnStyle === 'function') window._applyUiBtnStyle(); }catch(e){}
  // ?렓 ?붿옄??紐⑤뱶(由щ돱?? ?곸슜
  try{ if(typeof window.applyDesignV2 === 'function') window.applyDesignV2(); }catch(e){}
  // ELO 誘몄꽕???좎닔?먭쾶 湲곕낯媛?遺??  if(typeof ELO_DEFAULT!=='undefined'){
    players.forEach(p=>{ if(p.elo===undefined||p.elo===null) p.elo=ELO_DEFAULT; });
  }
  // ???tourneys) 湲곕줉 ?먮룞 ?뚭툒 諛섏쁺 (誘몃컲?곷텇留? 以묐났 諛⑹? ?댁옣)
  if(typeof syncTourneyHistory==='function') syncTourneyHistory();
  // ?곗뼱????곗씠??留덉씠洹몃젅?댁뀡 (議곕퀎由ш렇/釉뚮씪耳?湲곕줉 ??ttM ?숆린??
  if(typeof _migrateTierTourneys==='function') _migrateTierTourneys();
  // ?곗뼱??????곗뼱???紐낆묶 留덉씠洹몃젅?댁뀡
  if(typeof _migrateTierTourName==='function') _migrateTierTourName();
  // ?곕룄 ?꾪꽣??getYearOptions()媛 ?뚮뜑留????숈쟻?쇰줈 怨꾩궛?섎?濡?蹂꾨룄 異붿텧 遺덊븘??  const ptier=document.getElementById('p-tier');
  if(ptier) ptier.innerHTML=TIERS.map(t=>`<option value="${t}">${getTierLabel(t)}</option>`).join('');
  try{refreshSel();}catch(e){}
  initLoginHash();
  applyLoginState();
  render();
  // ?렦 BGM 踰꾪듉 珥덇린??  try{ if(typeof window.initBgm==='function') window.initBgm(); }catch(e){}
  // ?벟 SOOP 硫?곕럭 踰꾪듉 珥덇린??  try{ if(typeof window.initSoopMulti==='function') window.initSoopMulti(); }catch(e){}
  setTimeout(showNoticePopup, 800);
  // ?넅 URL ?뚮씪誘명꽣濡??좎닔/????먮룞 ?ㅽ뵂
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

// ?????????????????????????????????????????????????????????????
// ?꾩뿭 ?고듃 ?ㅼ젙
// - localStorage:
//   su_app_font_preset: system | noto | pretendard | nanum | gmarket | custom
//   su_app_font_css:    (?듭뀡) ?고듃 CSS URL
//   su_app_font_family: (?듭뀡) font-family 臾몄옄??// ?????????????????????????????????????????????????????????????
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

  // ?꾨━?뗫퀎 沅뚯옣 CSS(?놁뼱???숈옉?섏?留? ?덉쑝硫??덉쭏??
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

  // CSS 吏곸젒 ?낅젰(@font-face ?? 吏??  try{
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

  // preset ??font-family
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
  // ?대え吏(?뱤?뱟?룇 ??媛 ?묐갚?쇰줈 蹂댁씠??臾몄젣 諛⑹?:
  // - ?꾩뿭 ?고듃瑜?媛뺤젣 ?곸슜(body * { font-family: var(--app-font) !important; })?섎뒗 援ъ“??  //   ?대え吏 ?고듃 ?대갚??紐낆떆?곸쑝濡??욎뿉 ?ъ빞 而щ윭 ?대え吏媛 ?좎??⑸땲??
  const emojiFam = '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji"';
  const finalFamWithEmoji = `${emojiFam}, ${finalFam}`;
  try{ document.documentElement.style.setProperty('--app-font', finalFamWithEmoji); }catch(e){}
};
// 珥덇린 1???곸슜(?뚮뜑 ?꾪썑 紐⑤몢 ???
try{ window._applyAppFont(); }catch(e){}

// ?????????????????????????????????????????????????????????????
// (?붿껌?ы빆) 踰꾪듉/?????꾪꽣) ?ㅽ????꾩뿭 ?ㅼ젙
// - localStorage:
//   su_btn_scale_pct: 85~125 (湲곕낯 100)
//   su_btn_r:         px (湲곕낯 8)
//   su_pill_r:        px (湲곕낯 20)
// ?????????????????????????????????????????????????????????????
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

// ?????????????????????????????????????????????????????????????
// (?붿껌?ы빆) ?꾩껜 ?뚮쭏 蹂???곸슜 (?ㅻ뜑 ?꾨━?뗪낵 ?곕룞)
// - localStorage: su_theme_vars_v1 (JSON: { "--bg":"...", "--surface":"...", ... })
// - dark 紐⑤뱶?먯꽌??諛곌꼍 怨꾩뿴? ?좎??섍퀬, 媛뺤“??--blue 怨꾩뿴)留??곸슜
// ?????????????????????????????????????????????????????????????
window._applyThemeVars = function(){
  let obj=null;
  try{ obj = JSON.parse(localStorage.getItem('su_theme_vars_v1')||'null'); }catch(e){ obj=null; }
  if(!obj || typeof obj!=='object') obj=null;
  const tgt = document.body || document.documentElement;
  if(!tgt) return;
  // 湲곗〈 ?곸슜媛??쒓굅 ???ъ쟻???녿뒗 ?ㅻ뒗 ?쒓굅)
  const keys = ['--bg','--white','--surface','--border','--border2','--blue','--blue-d','--blue-l','--blue-ll','--gold','--gold-bg','--gold-b','--green','--red','--gray','--gray-l'];
  try{
    keys.forEach(k=>{
      // obj媛 ?녾굅???대떦 ?ㅺ? ?놁쑝硫?inline ?쒓굅
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

// ?????????????????????????????????????????????????????????????
// (?붿껌?ы빆) ?ㅻ뜑 而ㅼ뒪?(?쒕ぉ/醫뚯륫 ?꾩씠肄??곗륫 ?대?吏/諛곌꼍 ?대?吏/?믪씠)
// - localStorage:
//   su_hdr_title
//   su_hdr_left_icon   (URL ?먮뒗 ?대え吏)
//   su_hdr_left_size   (px)
//   su_hdr_right_img   (URL)
//   su_hdr_right_size  (px)
//   su_hdr_bg_img      (URL)
//   su_hdr_height      (px)
// ?????????????????????????????????????????????????????????????
window._applyHeaderSettings = function(){
  let title='', leftIco='', leftSz=22, rightImg='', rightSz=32, bgImg='', hdrH=0;
  // ?좉퇋: ?ㅻ뜑 ???④낵 + ?뚮쭏 ?숆린??  let fx='classic', c1='', c2='', syncTheme=false;
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
    // ???좏떥
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

    // 湲곕낯 而щ윭
    const base1 = _hexToRgb(c1) ? c1 : '#1e3a8a';
    const base2 = _hexToRgb(c2) ? c2 : '#2563eb';
    const base3 = _darken(base1, 0.15);

    // ?대옒???뺣━
    try{
      hdr.classList.remove('hdr-stripes','hdr-glass','hdr-aurora','hdr-mesh');
      if(fx==='glass') hdr.classList.add('hdr-glass');
      else if(fx==='aurora') hdr.classList.add('hdr-aurora');
      else if(fx==='mesh') hdr.classList.add('hdr-mesh');
      else hdr.classList.add('hdr-stripes'); // classic 湲곕낯
    }catch(e){}

    // CSS 蹂?섎줈 ?꾨떖
    try{
      hdr.style.setProperty('--hdr-c1', base1);
      hdr.style.setProperty('--hdr-c2', base2);
      hdr.style.setProperty('--hdr-c3', base3);
    }catch(e){}

    // 諛곌꼍(?대?吏 ?ы븿)
    try{
      let g = '';
      // fx蹂?湲곕낯 諛곌꼍 (洹몃씪?곗씠??留먭퀬???쒓났)
      if(fx==='solid'){
        g = base2;
      } else if(fx==='glass'){
        // glass??CSS?먯꽌 諛곌꼍/釉붾윭 泥섎━瑜??섎?濡? ?ш린??background瑜???뼱?곗? ?딆쓬
        g = '';
      } else {
        // classic/aurora/mesh??湲곕낯 洹몃씪?곗씠?섏쓣 ?좎??섍퀬, ?④낵??::before濡??쒗쁽
        g = `linear-gradient(135deg,${base1} 0%,${base2} 55%,${base3} 100%)`;
      }
      if(bgImg){
        // glass 紐⑤뱶???뚮뒗 gradient瑜??⑹튂吏 ?딄퀬 諛곌꼍 ?대?吏留?源붽린
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

    // ?꾩껜 ?뚮쭏(二쇱깋) ?숆린??    try{
      if(syncTheme){
        const accent = base2;
        const blue = accent;
        const blueD = _darken(accent, 0.18);
        const blueL = _lighten(accent, 0.86);
        const blueLL = _lighten(accent, 0.92);
        // body??inline?쇰줈 源붾㈃ dark 紐⑤뱶 蹂?섎룄 ??뼱?
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
      // 臾몄꽌 ??댄????④퍡 諛섏쁺
      if(title) document.title = `狩?${title}`;
    }catch(e){}
  }
  if(iEl){
    try{
      const v = leftIco || '?룇';
      // URL?대㈃ ?대?吏, ?꾨땲硫??띿뒪???대え吏)濡?泥섎━
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
// 珥덇린 1???곸슜(?뚮뜑 ?꾪썑 ???
try{ window._applyHeaderSettings(); }catch(e){}
// ?ㅻ뜑 ?곸슜 ???뚮쭏???ㅼ떆 ?곸슜(?곗꽑?쒖쐞: ?뚮쭏 vars ???ㅻ뜑 sync??--blue留?嫄대뱶由?
try{ window._applyThemeVars && window._applyThemeVars(); }catch(e){}

// ?????????????????????????????????????????????????????????????
// 諛섏쓳??UI ?ㅼ????먮룞): 釉뚮씪?곗?/湲곌린 ??뿉 ?곕씪 湲???꾩씠肄??ш린 ?먮룞 議곗젅
// - CSS 蹂??--uiS 濡??쒖뼱 (style.css?먯꽌 ?곸슜)
// ?????????????????????????????????????????????????????????????
function _applyUiScale(){
  try{
    const w = Math.max(320, Math.min(1920, window.innerWidth || 1024));
    // 紐⑤컮?쇱? ?댁쭩 ?묎쾶(?뺣낫 諛?꾟넁), ?쒕툝由?PC??湲곕낯
    let s = 1;
    if (w <= 360) s = 0.92;
    else if (w <= 430) s = 0.96;
    else if (w <= 520) s = 0.98;
    else if (w <= 768) s = 1.00;
    else if (w <= 1024) s = 1.02;
    else s = 1.00;
    // (?좉퇋) ?섎룞 UI ?ㅼ????고듃 ?ш린) ???먮룞媛믪뿉 怨깊빐???꾩뿭 ?곸슜
    // - localStorage: su_ui_scale_pct (80~140, 湲곕낯 100)
    try{
      const pct = parseInt(localStorage.getItem('su_ui_scale_pct')||'100',10) || 100;
      const mul = Math.max(80, Math.min(140, pct)) / 100;
      s = s * mul;
    }catch(e){}
    document.documentElement.style.setProperty('--uiS', String(s));
  }catch(e){}
}
window.addEventListener('resize', ()=>{ _applyUiScale(); }, {passive:true});
// ?ㅼ젙?먯꽌 利됱떆 諛섏쁺?????덈룄濡??몄텧
window._applyUiScale = _applyUiScale;
_applyUiScale();

// ?????????????????????????????????????????????????????????????
// (?붿껌?ы빆) 紐⑤뱺 ??怨듯넻 ?먮룞 留욎땄(紐⑤컮???쒕툝由?
// - 媛꾧꺽/?⑤뵫/移대뱶쨌洹몃━??諛???뚯씠釉??⑤뵫 ?깆쓣 ?붾㈃??留욎떠 議곗젅
// - ?ㅼ젙: localStorage su_af_alltabs_v1 = '1'
// ?????????????????????????????????????????????????????????????
function _applyAllTabsAutoFit(){
  const key = 'su_af_alltabs_v1';
  let on = false;
  try{ on = (localStorage.getItem(key) === '1'); }catch(e){ on = false; }

  try{
    // 紐⑤컮??二쇱냼李?蹂????묒슜 CSS vh 蹂??    const vh = (window.innerHeight || 800) * 0.01;
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

  // 湲곕낯媛?PC)
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
  // 媛濡쒕え???뱁엳 紐⑤컮??媛濡????몃줈怨듦컙??遺議깊븯????珥섏킌?섍쾶
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

// ?????????????????????????????????????????????????????????????
// (?붿껌?ы빆) 湲곕줉 移대뱶(紐⑤뱺 湲곕줉 ?? ?뚮쭏/諛앷린 ?ㅼ젙
// - ?밸━ ??숈깋??移대뱶 諛곌꼍/?ㅻ뜑???고븯寃??곸슜
// ?????????????????????????????????????????????????????????????
function _applyRecCardTheme(){
  const onKey='su_rc_theme_on';
  const acKey='su_rc_accent_mode';
  const bgKey='su_rc_bg_alpha';
  const hdKey='su_rc_hd_alpha';
  const iconKey='su_rc_uicon';
  const univFontKey='su_rc_univ_font_pct';
  const ymScaleKey='su_ym_scale_pct';
  const memoKey='su_rc_memo_on';
  const vsKey='su_rc_vs_align';
  const scKey='su_rc_score_scale';
  let on=true, accent='none', bg=12, hd=14, uicon=24;
  let univFontPct=110, ymScalePct=100;
  let memoOn=false, vsAlign='left', scScale=100;
  try{
    const v=localStorage.getItem(onKey); if(v!=null) on = v==='1';
    const a=localStorage.getItem(acKey); if(a) accent=a;
    const b=parseInt(localStorage.getItem(bgKey)||'',10); if(!isNaN(b)) bg=b;
    const h=parseInt(localStorage.getItem(hdKey)||'',10); if(!isNaN(h)) hd=h;
    const ic=parseInt(localStorage.getItem(iconKey)||'',10); if(!isNaN(ic)) uicon=ic;
    const uf=parseInt(localStorage.getItem(univFontKey)||'',10); if(!isNaN(uf)) univFontPct=uf;
    const ys=parseInt(localStorage.getItem(ymScaleKey)||'',10); if(!isNaN(ys)) ymScalePct=ys;
    const mo=localStorage.getItem(memoKey); if(mo!=null) memoOn = mo==='1';
    const va=localStorage.getItem(vsKey); if(va) vsAlign=va;
    const ss=parseInt(localStorage.getItem(scKey)||'',10); if(!isNaN(ss)) scScale=ss;
  }catch(e){}
  bg=Math.max(0,Math.min(30,bg));
  hd=Math.max(0,Math.min(30,hd));
  uicon=Math.max(12,Math.min(34,uicon));
  univFontPct=Math.max(90,Math.min(150,univFontPct||100));
  ymScalePct=Math.max(80,Math.min(140,ymScalePct||100));
  accent = ['none','header','border','full','gradient'].includes(accent) ? accent : 'none';
  vsAlign = ['left','center','right'].includes(vsAlign) ? vsAlign : 'left';
  scScale = Math.max(80, Math.min(130, scScale||100));
  const vsJust = (vsAlign==='center')?'center':(vsAlign==='right')?'flex-end':'flex-start';

  try{
    if(document.body){
      document.body.classList.toggle('rc-theme-on', !!on);
      document.body.classList.toggle('rc-accent-header', !!on && accent==='header');
      document.body.classList.toggle('rc-accent-border', !!on && accent==='border');
      document.body.classList.toggle('rc-accent-full', !!on && accent==='full');
      document.body.classList.toggle('rc-accent-gradient', !!on && accent==='gradient');
    }
    document.documentElement.style.setProperty('--rc-bg-a', String(bg/100));
    document.documentElement.style.setProperty('--rc-hd-a', String(hd/100));
    document.documentElement.style.setProperty('--rc-uicon', uicon+'px');
    document.documentElement.style.setProperty('--rc-univ-font-scale', String(univFontPct/100));
    document.documentElement.style.setProperty('--ym-scale', String(ymScalePct/100));
    document.documentElement.style.setProperty('--rc-memo-on', memoOn?'1':'0');
    document.documentElement.style.setProperty('--rc-vs-justify', vsJust);
    document.documentElement.style.setProperty('--rc-score-scale', String(scScale/100));
  }catch(e){}
}
window._applyRecCardTheme=_applyRecCardTheme;
_applyRecCardTheme();

// ?????????????????????????????????????????????????????????????
// (?붿껌?ы빆) ??뚰꺆 移대뱶(議곕퀎由ш렇 ?쇱젙 ?? ?뚮쭏/?붿옄??紐⑤뱶
// ?????????????????????????????????????????????????????????????
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

// ?????????????????????????????????????????????????????????????
// ?곷떒 ???꾪꽣諛? ?ㅼ??댄봽/?쒕옒洹몃줈 媛濡??ㅽ겕濡?媛?ν븯寃??대룞 踰꾪듉 ?놁씠??
// - ??? .tabs, .fbar (overflow-x:auto ?곸뿭)
// ?????????????????????????????????????????????????????????????
window.enableDragScroll = function(){
  try{
    document.querySelectorAll('.tabs, .fbar').forEach(el=>{
      if (el.dataset.dragScrollBound === '1') return;
      el.dataset.dragScrollBound = '1';
      el.style.cursor = 'grab';
      let down = false, startX = 0, startLeft = 0, moved = false;
      const onDown = (e) => {
        // 踰꾪듉/?명뭼 ?꾩뿉?쒕뒗 ?쒕옒洹??쒖옉 ????        const t = e.target;
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
      // ?쒕옒洹????대┃ ?ㅻ룞??諛⑹?
      el.addEventListener('click', (e)=>{ if(moved){ e.stopPropagation(); e.preventDefault(); moved=false; } }, true);
    });
  }catch(e){}
};
// 珥덇린 1??setTimeout(()=>{ try{ window.enableDragScroll && window.enableDragScroll(); }catch(e){} }, 400);

// ?? ?ъ씠??泥??묒냽 ???먮룞 遺덈윭?ㅺ린 ??
(async function autoLoad(){
  try{
    // J()瑜??ъ슜??LZ-String ?뺤텞 ?곗씠?곕룄 ?щ컮瑜닿쾶 媛먯?
    const localPlayers = J('su_p');
    if(localPlayers && localPlayers.length > 0) return;
  }catch(e){}
  if (!CONFIG.PROD) console.log('[?먮룞 遺덈윭?ㅺ린] 濡쒖뺄 ?곗씠???놁쓬 ??GitHub ?먮룞 濡쒕뱶');
  const _RAW = 'https://raw.githubusercontent.com/nada1004/star-system/main/data.json';
  const _API = 'https://api.github.com/repos/nada1004/star-system/contents/data.json';
  const _CDN = 'https://cdn.jsdelivr.net/gh/nada1004/star-system@main/data.json';
  const _PROXY = 'https://api.allorigins.win/raw?url=' + encodeURIComponent(_RAW);
  const urls = [_RAW, _CDN, _API, _PROXY];
  gsSetStatus && gsSetStatus('?봽 ?곗씠??遺덈윭?ㅻ뒗 以?..','var(--blue)');
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
      if(d){ console.log('[?먮룞 遺덈윭?ㅺ린] ?깃났:', url); break; }
    }catch(e){ if (!CONFIG.PROD) console.log('[?먮룞 遺덈윭?ㅺ린] ?ㅽ뙣:', url, e.message); continue; }
  }
  if(d){
    // LZString ?뺤텞 ?곗씠???먮룞 ?댁젣
    if(d && typeof d._lz === 'string'){
      try{ d = JSON.parse(LZString.decompressFromBase64(d._lz)); }
      catch(e){ console.warn('[?먮룞 遺덈윭?ㅺ린] ?뺤텞 ?댁젣 ?ㅽ뙣:', e); }
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
      // autoLoad ???곗뼱???留덉씠洹몃젅?댁뀡 ?ъ떎??(flag 由ъ뀑 ???ы샇異?
      if(typeof _migrateTierTourneys==='function'){
        if(typeof _ttMigrated!=='undefined') _ttMigrated=false;
        _migrateTierTourneys();
      }
      // autoLoad ???곗뼱??꾟넂?곗뼱???紐낆묶 留덉씠洹몃젅?댁뀡 ?ъ떎??      if(typeof _migrateTierTourName==='function'){
        if(typeof _tierTourNameMigrated!=='undefined') _tierTourNameMigrated=false;
        _migrateTierTourName();
      }
      save(); render();
      gsSetStatus && gsSetStatus('???먮룞 遺덈윭?ㅺ린 ?꾨즺 ('+new Date().toLocaleTimeString()+')','var(--green)');
    }catch(e){
      console.error('[?먮룞 遺덈윭?ㅺ린] ?곗씠???곸슜 ?ㅻ쪟:', e);
      gsSetStatus && gsSetStatus('','');
    }
  } else {
    gsSetStatus && gsSetStatus('','');
    console.warn('[?먮룞 遺덈윭?ㅺ린] 紐⑤뱺 URL ?ㅽ뙣');
  }
})();

