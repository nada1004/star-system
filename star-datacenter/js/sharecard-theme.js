(function(){
  window.SharecardModules = window.SharecardModules || {};

  const clamp = (n,a,b)=>Math.max(a, Math.min(b, n));
  const hexNorm = (hex)=>{
    let h=String(hex||'').trim().replace('#','');
    if(h.length===3) h=h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
    return h.length===6 ? '#'+h : '#64748b';
  };
  const mixHex = (a,b,t)=>{
    const ah=hexNorm(a).slice(1), bh=hexNorm(b).slice(1);
    const av=[parseInt(ah.slice(0,2),16),parseInt(ah.slice(2,4),16),parseInt(ah.slice(4,6),16)];
    const bv=[parseInt(bh.slice(0,2),16),parseInt(bh.slice(2,4),16),parseInt(bh.slice(4,6),16)];
    const m=av.map((v,i)=>Math.round(v+(bv[i]-v)*clamp(t,0,1)));
    return '#'+m.map(v=>v.toString(16).padStart(2,'0')).join('');
  };

  window._shareCardShapeStyle = window._shareCardShapeStyle || function(key){
    const map = {
      rounded:{radius:'24px', clip:'none', headerInsetPct:0},
      sharp:{radius:'6px', clip:'none', headerInsetPct:0},
      soft:{radius:'36px', clip:'none', headerInsetPct:0},
      ribbon:{radius:'24px', clip:'polygon(0% 0%,92% 0%,100% 9%,100% 100%,0% 100%)', headerInsetPct:.09},
      tag:{radius:'18px', clip:'polygon(0% 14%,14% 0%,100% 0%,100% 100%,0% 100%)', headerInsetPct:.14},
      ticket:{radius:'24px', clip:'polygon(0% 0%,100% 0%,100% 47%,97% 50%,100% 53%,100% 100%,0% 100%,0% 53%,3% 50%,0% 47%)', headerInsetPct:0}
    };
    return map[key] || map.rounded;
  };

  window._shareCardShapeOptions = window._shareCardShapeOptions || [
    { v:'rounded', label:'기본 라운드', desc:'표준 둥근 모서리(24px)' },
    { v:'sharp',   label:'샤프 엣지',   desc:'각진 모서리(6px)로 딱딱한 느낌' },
    { v:'soft',    label:'더 둥글게',   desc:'더 부드러운 둥근 모서리(36px)' },
    { v:'ribbon',  label:'리본컷',      desc:'우측 상단을 비스듬히 깎은 리본 형태' },
    { v:'tag',     label:'태그컷',      desc:'좌측 상단을 비스듬히 깎은 태그 형태' },
    { v:'ticket',  label:'티켓 노치',   desc:'좌우 중앙에 티켓처럼 둥근 홈' }
  ];

  window._getShareCardPrefs = window._getShareCardPrefs || function(typeKey){
    const t=String(typeKey||'').trim();
    const ov = t ? (localStorage.getItem(`su_sc_mode_${t}`)||'').trim() : '';
    const mode=(localStorage.getItem('su_sc_mode')||'campus').trim();
    const color=clamp(parseInt(localStorage.getItem('su_sc_color')||'72',10)||72,20,100)/100;
    const fx=clamp(parseInt(localStorage.getItem('su_sc_fx')||'55',10)||55,0,100)/100;
    const winbg=clamp(parseInt(localStorage.getItem('su_sc_winbg')||'55',10)||55,0,100)/100;
    const loserGraySrc = (t ? localStorage.getItem(`su_sc_losergray_${t}`) : null) ?? localStorage.getItem('su_sc_losergray') ?? '55';
    const loserGray=clamp(parseInt(loserGraySrc,10)||55,10,90)/100;
    const profileSrc = (t ? localStorage.getItem(`su_sc_profile_pct_${t}`) : null) ?? localStorage.getItem('su_sc_profile_pct') ?? '100';
    const fontSrc = (t ? localStorage.getItem(`su_sc_font_pct_${t}`) : null) ?? localStorage.getItem('su_sc_font_pct') ?? '100';
    const heroBrightSrc = localStorage.getItem('su_sc_hero_bright') ?? '100';
    const loserPhotoBrightSrc = localStorage.getItem('su_sc_loser_photo_bright') ?? '88';
    const titleFontSrc = localStorage.getItem('su_sc_title_pct') ?? '100';
    const univFontSrc = localStorage.getItem('su_sc_univ_pct') ?? '100';
    const profileScale=clamp(parseInt(profileSrc,10)||100,70,145)/100;
    const fontScale=clamp(parseInt(fontSrc,10)||100,85,135)/100;
    const heroBrightness=clamp(parseInt(heroBrightSrc,10)||100,70,135)/100;
    const loserPhotoBrightness=clamp(parseInt(loserPhotoBrightSrc,10)||88,55,120)/100;
    const titleScale=clamp(parseInt(titleFontSrc,10)||100,80,150)/100;
    const univScale=clamp(parseInt(univFontSrc,10)||100,80,160)/100;
    const surface=(localStorage.getItem('su_sc_surface')||'glass').trim();
    const logoLayout=((t ? localStorage.getItem(`su_sc_logo_layout_${t}`) : null) ?? localStorage.getItem('su_sc_logo_layout') ?? 'stack').trim();
    const logoSizeSrc=((t ? localStorage.getItem(`su_sc_logo_size_${t}`) : null) ?? localStorage.getItem('su_sc_logo_size') ?? '100');
    const logoSize=clamp(parseInt(logoSizeSrc,10)||100,70,150)/100;
    const logoFit=((t ? localStorage.getItem(`su_sc_logo_fit_${t}`) : null) ?? localStorage.getItem('su_sc_logo_fit') ?? 'contain').trim();
    const cardShapeSrc=((t ? localStorage.getItem(`su_sc_cardshape_${t}`) : null) ?? localStorage.getItem('su_sc_cardshape') ?? 'rounded').trim();
    const cardShape = ['rounded','sharp','soft','ribbon','tag','ticket'].includes(cardShapeSrc) ? cardShapeSrc : 'rounded';
    const entityLayout=((t ? localStorage.getItem(`su_sc_entity_layout_${t}`) : null) ?? localStorage.getItem('su_sc_entity_layout') ?? 'default').trim();
    const matchLayout=((t ? localStorage.getItem(`su_sc_match_layout_${t}`) : null) ?? localStorage.getItem('su_sc_match_layout') ?? 'default').trim();
    const showTally = (localStorage.getItem('su_sc_show_tally') ?? '0') === '1';
    return { mode: ov||mode, color, fx, winbg, loserGray, profileScale, fontScale, heroBrightness, loserPhotoBrightness, titleScale, univScale, surface, logoLayout, logoSize, logoFit, cardShape, entityLayout, matchLayout, showTally };
  };

  window._makeShareCardTheme = window._makeShareCardTheme || function(hex, opts){
    const color = hexNorm(hex||'#475569');
    const draw = !!(opts&&opts.draw);
    function hexToHsl(raw){
      let h=String(raw||'').replace('#','');
      if(h.length===3) h=h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
      if(h.length!==6) return null;
      let r=parseInt(h.slice(0,2),16)/255;
      let g=parseInt(h.slice(2,4),16)/255;
      let b=parseInt(h.slice(4,6),16)/255;
      const max=Math.max(r,g,b),min=Math.min(r,g,b);
      let hue=0,sat=0,lit=(max+min)/2;
      if(max!==min){
        const d=max-min;
        sat=lit>.5?d/(2-max-min):d/(max+min);
        if(max===r) hue=((g-b)/d+(g<b?6:0))/6;
        else if(max===g) hue=((b-r)/d+2)/6;
        else hue=((r-g)/d+4)/6;
      }
      return {h:Math.round(hue*360),s:Math.round(sat*100),l:Math.round(lit*100)};
    }
    if(draw){
      return {
        headerBg:'#334155', bodyBg:'#f8fafc',
        accentHex:'#475569', accentDark:'#1e293b',
        text:'#1e293b', textDim:'rgba(71,85,105,.6)', divider:'rgba(148,163,184,.2)'
      };
    }
    const hsl=hexToHsl(color);
    if(!hsl){
      return {
        headerBg:'#1e293b', bodyBg:'#f8fafc',
        accentHex:color, accentDark:'#1e293b',
        text:'#1e293b', textDim:'rgba(30,41,59,.55)', divider:'rgba(30,41,59,.12)'
      };
    }
    const {h,s,l}=hsl;
    const headerBg=`hsl(${h},${Math.min(s+5,90)}%,${Math.max(l-5,20)}%)`;
    const bodyBg=`hsl(${h},${Math.min(s*0.25,18)}%,${Math.min(97, l+52)}%)`;
    const accentDark=`hsl(${h},${Math.min(s+10,95)}%,${Math.max(l-15,15)}%)`;
    const divider=`hsla(${h},${Math.min(s*0.5,35)}%,${Math.max(l-20,30)}%,.18)`;
    const textDim=`hsla(${h},${Math.min(s*0.4,30)}%,${Math.max(l-45,12)}%,.6)`;
    return {headerBg, bodyBg, accentHex:color, accentDark, text:`hsl(${h},${Math.min(s*0.6,45)}%,${Math.max(l-52,8)}%)`, textDim, divider};
  };

  window._getShareCardVariantKey = window._getShareCardVariantKey || function(m){
    if(m._matchType==='ck') return 'ck';
    if(m._matchType==='civil') return 'civil';
    if(m._matchType==='mini') return 'mini';
    if(m._matchType==='univm') return 'univm';
    if(m._matchType==='tt' && String(m.stage||'').trim()==='league') return 'tt-league';
    if(m._matchType==='tt') return 'tt';
    if(m._matchType==='pro' || m._matchType==='procomp-team') return 'pro';
    if(m._matchType==='procomp-bkt') return 'procomp-bkt';
    if(m.n || m._subLabel || m.type==='tourney' || m._matchType==='comp') return 'comp';
    return 'default';
  };

  window._buildShareCardVariant = window._buildShareCardVariant || function(params){
    const {matchObj:m, theme, winnerColor, scp, variantKey} = params||{};
    const _variantMap = {
      pro:{ outerBg:'linear-gradient(180deg,#f8fbff,#eef4ff)', headerBg:'linear-gradient(135deg,#0f172a 0%,#1d4ed8 52%,#7c3aed 100%)', setBg:'rgba(37,99,235,.06)', setBorder:'rgba(37,99,235,.14)', chipBg:'rgba(255,255,255,.16)', chipBd:'rgba(255,255,255,.24)', hero:'🏅 프로리그', tone:'공식전 · 리그 스타일' },
      ck:{ outerBg:'linear-gradient(180deg,#fffaf0,#fff7ed)', headerBg:'linear-gradient(135deg,#0f766e 0%,#0891b2 38%,#b45309 100%)', setBg:'rgba(245,158,11,.09)', setBorder:'rgba(217,119,6,.16)', chipBg:'rgba(255,255,255,.17)', chipBd:'rgba(255,255,255,.26)', hero:'🤝 대학CK', tone:'라이벌전 · 대학 대항전' },
      univm:{ outerBg:'linear-gradient(180deg,#ecfeff,#eff6ff)', headerBg:'linear-gradient(135deg,#0f766e 0%,#0891b2 42%,#2563eb 100%)', setBg:'rgba(8,145,178,.08)', setBorder:'rgba(14,116,144,.16)', chipBg:'rgba(255,255,255,.16)', chipBd:'rgba(255,255,255,.24)', hero:'🏟️ 대학대전', tone:'캠퍼스 매치 · 팀 배틀' },
      mini:{ outerBg:'linear-gradient(180deg,#f5f3ff,#eff6ff)', headerBg:'linear-gradient(135deg,#6d28d9 0%,#7c3aed 46%,#2563eb 100%)', setBg:'rgba(124,58,237,.08)', setBorder:'rgba(109,40,217,.16)', chipBg:'rgba(255,255,255,.16)', chipBd:'rgba(255,255,255,.24)', hero:'⚡ 미니대전', tone:'라이트 매치 · 스피드 배틀' },
      civil:{ outerBg:'linear-gradient(180deg,#faf5ff,#fdf2f8)', headerBg:'linear-gradient(135deg,#581c87 0%,#7c3aed 46%,#db2777 100%)', setBg:'rgba(219,39,119,.08)', setBorder:'rgba(124,58,237,.16)', chipBg:'rgba(255,255,255,.16)', chipBd:'rgba(255,255,255,.24)', hero:'⚔️ 시빌워', tone:'라이벌 더비 · 내부전' },
      tt:{ outerBg:'linear-gradient(180deg,#faf5ff,#ecfeff)', headerBg:'linear-gradient(135deg,#581c87 0%,#7c3aed 48%,#0f766e 100%)', setBg:'rgba(124,58,237,.08)', setBorder:'rgba(124,58,237,.16)', chipBg:'rgba(255,255,255,.16)', chipBd:'rgba(255,255,255,.24)', hero:'🎯 티어대회', tone:'티어전 · 브라켓 스타일' },
      'tt-league':{ outerBg:'linear-gradient(180deg,#faf5ff,#f0fdf4)', headerBg:'linear-gradient(135deg,#4c1d95 0%,#7c3aed 44%,#047857 100%)', setBg:'rgba(16,185,129,.08)', setBorder:'rgba(124,58,237,.16)', chipBg:'rgba(255,255,255,.16)', chipBd:'rgba(255,255,255,.24)', hero:'🎯 티어대회 조별리그', tone:'그룹 스테이지 · 티어 리그' },
      comp:{ outerBg:'linear-gradient(180deg,#fff7ed,#faf5ff)', headerBg:'linear-gradient(135deg,#7c2d12 0%,#d97706 44%,#7c3aed 100%)', setBg:'rgba(249,115,22,.08)', setBorder:'rgba(217,119,6,.16)', chipBg:'rgba(255,255,255,.17)', chipBd:'rgba(255,255,255,.26)', hero:'🏆 대회', tone:'이벤트 · 토너먼트 포스터' },
      'procomp-bkt':{ outerBg:'linear-gradient(180deg,#fff7ed,#faf5ff)', headerBg:'linear-gradient(135deg,#92400e 0%,#d97706 44%,#4c1d95 100%)', setBg:'rgba(217,119,6,.08)', setBorder:'rgba(146,64,14,.16)', chipBg:'rgba(255,255,255,.17)', chipBd:'rgba(255,255,255,.26)', hero:'🗂️ 프로리그 대회', tone:'브라켓 · 결선 라운드' },
      default:{ outerBg:theme.bodyBg, headerBg:theme.headerBg, setBg:theme.divider, setBorder:theme.divider, chipBg:'rgba(255,255,255,.18)', chipBd:'rgba(255,255,255,.3)', hero:'🎮 매치', tone:'' }
    };
    let variant = _variantMap[variantKey] || _variantMap.default;
    const _dominantKeys=['mini','univm','civil','tt-league','comp','procomp-bkt','tt','ck','default'];
    if(_dominantKeys.includes(variantKey)){
      const accentBase = variantKey==='ck' ? '#0f172a' : variantKey==='tt' || variantKey==='tt-league' ? '#4c1d95' : variantKey==='comp' || variantKey==='procomp-bkt' ? '#7c2d12' : variantKey==='civil' ? '#6d28d9' : variantKey==='mini' ? '#1d4ed8' : '#0f172a';
      const winnerTone = hexNorm(winnerColor||theme.accentHex||'#475569');
      const mixA = scp.mode==='campus' ? (.56 + scp.color*0.24) : scp.mode==='vivid' ? (.48 + scp.color*0.18) : scp.mode==='soft' ? (.36 + scp.color*0.14) : scp.mode==='minimal' ? (.28 + scp.color*0.10) : scp.mode==='aurora' ? (.52 + scp.color*0.20) : scp.mode==='poster' ? (.62 + scp.color*0.22) : scp.mode==='mono' ? (.18 + scp.color*0.06) : scp.mode==='glacier' ? (.58 + scp.color*0.18) : scp.mode==='rose' ? (.54 + scp.color*0.16) : scp.mode==='midnight' ? (.30 + scp.color*0.08) : (.42 + scp.color*0.16);
      const mixB = scp.mode==='dark' ? '#020617' : scp.mode==='soft' ? '#ffffff' : scp.mode==='aurora' ? '#0f172a' : scp.mode==='poster' ? '#111827' : scp.mode==='mono' ? '#e5e7eb' : scp.mode==='glacier' ? '#e0f2fe' : scp.mode==='rose' ? '#fff1f2' : scp.mode==='midnight' ? '#0f172a' : accentBase;
      const winAlpha = Math.round(4 + scp.winbg*28).toString(16).padStart(2,'0');
      const outerBg = scp.mode==='dark' ? `linear-gradient(180deg,#0b1220,${mixHex(winnerTone,'#020617',.72)})` : scp.mode==='aurora' ? `linear-gradient(160deg,${mixHex(winnerTone,'#ffffff',.72)} 0%,${mixHex(winnerTone,'#0ea5e9',.34)} 50%,${mixHex(winnerTone,'#7c3aed',.30)} 100%)` : scp.mode==='poster' ? `linear-gradient(180deg,${mixHex(winnerTone,'#111827',.20)},${mixHex(winnerTone,'#000000',.54)})` : scp.mode==='mono' ? `linear-gradient(180deg,#f8fafc,${mixHex(winnerTone,'#ffffff',.82)})` : scp.mode==='minimal' ? `linear-gradient(180deg,#ffffff,${winnerTone}0f)` : scp.mode==='glacier' ? `linear-gradient(180deg,${mixHex(winnerTone,'#f0f9ff',.82)},${mixHex(winnerTone,'#dbeafe',.72)})` : scp.mode==='rose' ? `linear-gradient(180deg,${mixHex(winnerTone,'#fff7ed',.78)},${mixHex(winnerTone,'#ffe4e6',.70)})` : scp.mode==='midnight' ? `linear-gradient(180deg,#020617,${mixHex(winnerTone,'#0f172a',.76)})` : `linear-gradient(180deg,#ffffff,${winnerTone}${winAlpha})`;
      const headerBg = scp.mode==='dark' ? `linear-gradient(135deg,${mixHex(winnerTone,'#020617',.48)} 0%,${mixHex(winnerTone,accentBase,.22)} 58%,#111827 100%)` : scp.mode==='aurora' ? `linear-gradient(135deg,${mixHex(winnerTone,'#06b6d4',.18)} 0%,${mixHex(winnerTone,'#7c3aed',.18)} 48%,${mixHex(winnerTone,accentBase,.22)} 100%)` : scp.mode==='poster' ? `linear-gradient(135deg,${mixHex(winnerTone,'#000000',.12)} 0%,${mixHex(winnerTone,accentBase,.10)} 36%,#111827 100%)` : scp.mode==='mono' ? `linear-gradient(135deg,#111827 0%,${mixHex(winnerTone,'#374151',.70)} 100%)` : scp.mode==='glacier' ? `linear-gradient(135deg,${mixHex(winnerTone,'#ecfeff',.36)} 0%,${mixHex(winnerTone,'#38bdf8',.22)} 54%,${mixHex(winnerTone,'#1d4ed8',.18)} 100%)` : scp.mode==='rose' ? `linear-gradient(135deg,${mixHex(winnerTone,'#fff1f2',.24)} 0%,${mixHex(winnerTone,'#fb7185',.18)} 54%,${mixHex(winnerTone,'#7c2d12',.16)} 100%)` : scp.mode==='midnight' ? `linear-gradient(135deg,${mixHex(winnerTone,'#020617',.56)} 0%,${mixHex(winnerTone,'#1e293b',.34)} 56%,#0f172a 100%)` : `linear-gradient(135deg,${mixHex(winnerTone,mixB,mixA)} 0%,${mixHex(winnerTone,accentBase,.30)} 54%,${scp.mode==='soft'?'#ffffffdd':'#ffffff22'} 100%)`;
      variant = {...variant, outerBg, headerBg, setBg:`${winnerTone}${Math.round(6 + scp.winbg*24 + scp.fx*6).toString(16).padStart(2,'0')}`, setBorder:`${winnerTone}${Math.round(18 + scp.winbg*26 + scp.color*10).toString(16).padStart(2,'0')}`, chipBg:`${winnerTone}${Math.round(26+scp.color*14).toString(16).padStart(2,'0')}`, chipBd:`${winnerTone}${Math.round(42+scp.color*16).toString(16).padStart(2,'0')}`};
    }else{
      variant = {...variant, outerBg: scp.mode==='dark' ? 'linear-gradient(180deg,#0b1220,#131b2d)' : scp.mode==='aurora' ? `linear-gradient(160deg,${mixHex(winnerColor,'#ffffff',.76)} 0%,${mixHex(winnerColor,'#38bdf8',.36)} 100%)` : scp.mode==='poster' ? `linear-gradient(180deg,${mixHex(winnerColor,'#111827',.18)},#0f172a)` : scp.mode==='mono' ? 'linear-gradient(180deg,#f8fafc,#e5e7eb)' : scp.mode==='glacier' ? `linear-gradient(180deg,${mixHex(winnerColor,'#f0f9ff',.84)},${mixHex(winnerColor,'#dbeafe',.72)})` : scp.mode==='rose' ? `linear-gradient(180deg,${mixHex(winnerColor,'#fff7ed',.82)},${mixHex(winnerColor,'#ffe4e6',.68)})` : scp.mode==='midnight' ? `linear-gradient(180deg,#020617,${mixHex(winnerColor,'#0f172a',.80)})` : variant.outerBg, setBg: scp.surface==='solid' ? `${winnerColor}${Math.round(6 + scp.winbg*24).toString(16).padStart(2,'0')}` : variant.setBg, setBorder: scp.surface==='solid' ? `${winnerColor}${Math.round(18 + scp.winbg*22).toString(16).padStart(2,'0')}` : variant.setBorder};
    }
    return variant;
  };

  window._buildShareCardHeaderBg = window._buildShareCardHeaderBg || function(params){
    const {winnerColor, ca, cb, aWin, bWin, scp} = params||{};
    const winnerBase = hexNorm(winnerColor||'#475569');
    const loserBase = hexNorm(aWin ? cb : bWin ? ca : mixHex(winnerBase, '#94a3b8', .40));
    if(scp.mode==='dark') return `linear-gradient(135deg, ${mixHex(winnerBase,'#0f172a',.18)} 0%, ${mixHex(winnerBase,loserBase,.18)} 58%, ${mixHex(loserBase,'#111827',.54)} 100%)`;
    if(scp.mode==='mono') return `linear-gradient(135deg, ${mixHex(winnerBase,'#cbd5e1',.20)} 0%, ${mixHex(winnerBase,loserBase,.14)} 55%, ${mixHex(loserBase,'#475569',.42)} 100%)`;
    if(scp.mode==='minimal') return `linear-gradient(135deg, ${mixHex(winnerBase,'#ffffff',.16)} 0%, ${mixHex(winnerBase,loserBase,.12)} 56%, ${mixHex(loserBase,'#0f172a',.18)} 100%)`;
    if(scp.mode==='poster') return `linear-gradient(135deg, ${mixHex(winnerBase,'#dbeafe',.24)} 0%, ${mixHex(winnerBase,loserBase,.16)} 52%, ${mixHex(loserBase,'#7c2d12',.22)} 100%)`;
    if(scp.mode==='soft') return `linear-gradient(135deg, ${mixHex(winnerBase,'#e0ecff',.28)} 0%, ${mixHex(winnerBase,loserBase,.16)} 56%, ${mixHex(loserBase,'#f59e0b',.18)} 100%)`;
    if(scp.mode==='glacier') return `linear-gradient(135deg, ${mixHex(winnerBase,'#ecfeff',.34)} 0%, ${mixHex(winnerBase,loserBase,.16)} 54%, ${mixHex(loserBase,'#1d4ed8',.20)} 100%)`;
    if(scp.mode==='rose') return `linear-gradient(135deg, ${mixHex(winnerBase,'#fff1f2',.28)} 0%, ${mixHex(winnerBase,loserBase,.16)} 52%, ${mixHex(loserBase,'#9f1239',.20)} 100%)`;
    if(scp.mode==='midnight') return `linear-gradient(135deg, ${mixHex(winnerBase,'#020617',.46)} 0%, ${mixHex(winnerBase,loserBase,.12)} 54%, ${mixHex(loserBase,'#1e293b',.40)} 100%)`;
    return `linear-gradient(135deg, ${mixHex(winnerBase,'#dbeafe',.26)} 0%, ${mixHex(winnerBase,loserBase,.15)} 56%, ${mixHex(loserBase,'#c2410c',.18)} 100%)`;
  };

  window.SharecardModules.theme = {
    getPrefs: window._getShareCardPrefs,
    makeTheme: window._makeShareCardTheme,
    getVariantKey: window._getShareCardVariantKey,
    buildVariant: window._buildShareCardVariant,
    buildHeaderBg: window._buildShareCardHeaderBg
  };
})();
