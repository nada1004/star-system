function _bindUnivSectionsDelegatedEvents(){
  if(window._univSectionsDelegatedBound) return;
  window._univSectionsDelegatedBound = true;
  document.addEventListener('click', (e)=>{
    const el = e.target && e.target.closest ? e.target.closest('[data-uds-action]') : null;
    if(!el) return;
    const action = el.getAttribute('data-uds-action');
    if(action === 'open-player'){
      e.preventDefault();
      try{ cm('univModal'); }catch(_){}
      const name = el.getAttribute('data-uds-player') || '';
      if(typeof openPlayerModal === 'function') openPlayerModal(name);
      return;
    }
    if(action === 'open-univ'){
      e.preventDefault();
      try{ cm('univModal'); }catch(_){}
      const univ = el.getAttribute('data-uds-univ') || '';
      if(typeof openUnivModal === 'function') openUnivModal(univ);
    }
  });
  document.addEventListener('mouseover', (e)=>{
    const el = e.target && e.target.closest ? e.target.closest('[data-uds-hover-bg]') : null;
    if(!el) return;
    el.style.background = el.getAttribute('data-uds-hover-bg') || '';
  });
  document.addEventListener('mouseout', (e)=>{
    const el = e.target && e.target.closest ? e.target.closest('[data-uds-hover-bg]') : null;
    if(!el) return;
    el.style.background = gcHex8(el.getAttribute('data-uds-base-univ') || '', .04);
  });
}

;(function _injectUnivHeroFxStyle(){
  if(typeof document==='undefined') return;
  if(document.getElementById('ud-hero-fx-style')) return;
  const s=document.createElement('style');
  s.id='ud-hero-fx-style';
  s.textContent=[
    // 로고 효과 (기존 '링(원)' 효과는 폐지 — 아래 prism으로 자동 대체)
    '.ud-logo-fx-glow{filter:drop-shadow(0 16px 28px rgba(15,23,42,.24)) drop-shadow(0 0 22px var(--ud-univ-col,rgba(255,255,255,.65))) drop-shadow(0 0 46px var(--ud-univ-col,rgba(255,255,255,.35)))!important}',
    '.ud-logo-fx-shadow{filter:drop-shadow(0 24px 42px rgba(15,23,42,.46)) drop-shadow(0 6px 14px rgba(15,23,42,.30))!important}',
    '.ud-logo-fx-aura{animation:udLogoAura 2.4s ease-in-out infinite}',
    '@keyframes udLogoAura{0%,100%{filter:drop-shadow(0 16px 28px rgba(15,23,42,.24)) drop-shadow(0 0 8px var(--ud-univ-col,rgba(255,255,255,.35)))}50%{filter:drop-shadow(0 16px 28px rgba(15,23,42,.24)) drop-shadow(0 0 30px var(--ud-univ-col,rgba(255,255,255,.85)))}}',
    '.ud-logo-fx-float{animation:udLogoFloat 3.4s ease-in-out infinite}',
    '.ud-logo-fx-shine{position:relative;overflow:hidden;border-radius:22%}',
    '.ud-logo-fx-shine::after{content:"";position:absolute;top:0;left:-60%;width:40%;height:100%;background:linear-gradient(100deg,transparent,rgba(255,255,255,.7),transparent);transform:skewX(-18deg);animation:udLogoShine 2.6s ease-in-out infinite;pointer-events:none}',
    '@keyframes udLogoFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}',
    '@keyframes udLogoShine{0%{left:-60%}100%{left:130%}}',
    '.ud-logo-fx-spotlight{position:relative}',
    '.ud-logo-fx-spotlight::before{content:"";position:absolute;left:50%;top:-28%;width:220%;height:220%;transform:translateX(-50%);background:radial-gradient(circle,var(--ud-univ-col,rgba(255,255,255,.6)) 0%,transparent 60%);filter:blur(3px);z-index:-1;pointer-events:none;animation:udLogoSpotlight 3s ease-in-out infinite}',
    '@keyframes udLogoSpotlight{0%,100%{opacity:.32}50%{opacity:.68}}',
    '.ud-logo-fx-prism{position:relative;border-radius:50%}',
    '.ud-logo-fx-prism::before{content:"";position:absolute;inset:-7px;border-radius:50%;background:conic-gradient(from 0deg,#ff5f6d,#ffc371,#4ade80,#38bdf8,#a78bfa,#ff5f6d);filter:blur(6px);opacity:.85;z-index:-1;animation:udLogoPrismSpin 3.6s linear infinite}',
    '@keyframes udLogoPrismSpin{to{transform:rotate(360deg)}}',
    '.ud-logo-fx-sparkle{position:relative}',
    '.ud-logo-fx-sparkle::before,.ud-logo-fx-sparkle::after{content:"✦";position:absolute;color:#fff;text-shadow:0 0 6px rgba(255,255,255,.95);pointer-events:none;animation:udLogoSparkle 1.8s ease-in-out infinite}',
    '.ud-logo-fx-sparkle::before{top:-6px;right:-2px;font-size:14px;animation-delay:0s}',
    '.ud-logo-fx-sparkle::after{bottom:2px;left:-8px;font-size:10px;animation-delay:.6s}',
    '@keyframes udLogoSparkle{0%,100%{opacity:0;transform:scale(.4) rotate(0deg)}50%{opacity:1;transform:scale(1) rotate(90deg)}}',
    // 로고 효과 (추가분)
    '.ud-logo-fx-pulse{animation:udLogoPulse 2.2s ease-in-out infinite}',
    '@keyframes udLogoPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.08)}}',
    '.ud-logo-fx-tilt{animation:udLogoTilt 3.2s ease-in-out infinite}',
    '@keyframes udLogoTilt{0%,100%{transform:rotate(-4deg)}50%{transform:rotate(4deg)}}',
    '.ud-logo-fx-halo{position:relative}',
    '.ud-logo-fx-halo::before{content:"";position:absolute;inset:-10px;border-radius:50%;border:2px solid var(--ud-univ-col,rgba(255,255,255,.7));opacity:.8;animation:udLogoHalo 2.4s ease-out infinite;pointer-events:none;z-index:-1}',
    '@keyframes udLogoHalo{0%{transform:scale(.85);opacity:.8}100%{transform:scale(1.4);opacity:0}}',
    '.ud-logo-fx-rainbow{animation:udLogoRainbow 4s linear infinite}',
    '@keyframes udLogoRainbow{0%{filter:drop-shadow(0 16px 28px rgba(15,23,42,.24)) hue-rotate(0deg)}100%{filter:drop-shadow(0 16px 28px rgba(15,23,42,.24)) hue-rotate(360deg)}}',
    // 로고 효과 (2차 추가분)
    '.ud-logo-fx-flash{animation:udLogoFlash 1.6s ease-in-out infinite}',
    '@keyframes udLogoFlash{0%,100%{filter:drop-shadow(0 16px 28px rgba(15,23,42,.24)) brightness(1)}50%{filter:drop-shadow(0 16px 28px rgba(15,23,42,.24)) brightness(1.5)}}',
    '.ud-logo-fx-wobble{animation:udLogoWobble 2.8s ease-in-out infinite}',
    '@keyframes udLogoWobble{0%,100%{transform:rotate(0deg) scale(1)}25%{transform:rotate(-3deg) scale(1.03)}75%{transform:rotate(3deg) scale(1.03)}}',
    '.ud-logo-fx-orbit{position:relative}',
    '.ud-logo-fx-orbit::after{content:"";position:absolute;top:50%;left:50%;width:7px;height:7px;margin:-3.5px 0 0 -3.5px;border-radius:50%;background:#fff;box-shadow:0 0 8px 2px rgba(255,255,255,.85);pointer-events:none;animation:udLogoOrbit 3.4s linear infinite}',
    '@keyframes udLogoOrbit{0%{transform:rotate(0deg) translateX(calc(var(--ud-logo-box,60px) / 2 + 5px)) rotate(0deg)}100%{transform:rotate(360deg) translateX(calc(var(--ud-logo-box,60px) / 2 + 5px)) rotate(-360deg)}}',
    // 로고 효과 (3차 추가분)
    '.ud-logo-fx-flip{animation:udLogoFlip 3.6s ease-in-out infinite}',
    '@keyframes udLogoFlip{0%,100%{transform:rotateY(0deg)}50%{transform:rotateY(180deg)}}',
    '.ud-logo-fx-bounce{animation:udLogoBounce 1.4s cubic-bezier(.28,.84,.42,1) infinite}',
    '@keyframes udLogoBounce{0%,100%{transform:translateY(0)}30%{transform:translateY(-14px)}50%{transform:translateY(0)}65%{transform:translateY(-6px)}80%{transform:translateY(0)}}',
    '.ud-logo-fx-flicker{animation:udLogoFlicker 2.4s linear infinite}',
    '@keyframes udLogoFlicker{0%,19%,21%,23%,54%,56%,100%{filter:drop-shadow(0 16px 28px rgba(15,23,42,.24)) brightness(1)}20%,22%,55%{filter:drop-shadow(0 16px 28px rgba(15,23,42,.24)) brightness(.4)}}',
    // 대학명 효과
    '.ud-name-fx-outline{-webkit-text-stroke:1.4px rgba(15,23,42,.4)}',
    '.ud-name-fx-gradient{background:linear-gradient(92deg,#fff 0%,var(--ud-univ-col,#fff) 85%);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent}',
    '.ud-name-fx-neon{text-shadow:0 0 6px currentColor,0 0 16px currentColor,0 0 32px currentColor,0 2px 10px rgba(0,0,0,.35)!important}',
    '.ud-name-fx-shadow3d{text-shadow:1px 1px 0 rgba(0,0,0,.55),2px 2px 0 rgba(0,0,0,.45),3px 3px 0 rgba(0,0,0,.35),4px 5px 10px rgba(0,0,0,.35)!important}',
    '.ud-name-fx-glow{text-shadow:0 0 10px var(--ud-univ-col,rgba(255,255,255,.75)),0 0 24px var(--ud-univ-col,rgba(255,255,255,.45)),0 4px 14px rgba(0,0,0,.3)!important}',
    '.ud-name-fx-shimmer{background:linear-gradient(100deg,#fff 30%,var(--ud-univ-col,#fff) 45%,#fff 60%);background-size:220% 100%;-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;animation:udNameShimmer 2.6s linear infinite}',
    '@keyframes udNameShimmer{0%{background-position:120% 0}100%{background-position:-40% 0}}',
    '.ud-name-fx-holo{background:linear-gradient(92deg,#ff8fab,#ffd97d,#8affc1,#8ec5fc,#c8a2ff,#ff8fab);background-size:280% 100%;-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;animation:udNameHolo 5s linear infinite}',
    '@keyframes udNameHolo{0%{background-position:0% 0}100%{background-position:280% 0}}',
    // 대학명 효과 (추가분)
    '.ud-name-fx-fire{background:linear-gradient(180deg,#fff58a 0%,#ffb703 35%,#fb5607 65%,#d00000 100%);background-size:100% 220%;-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;animation:udNameFire 1.8s ease-in-out infinite;text-shadow:0 4px 20px rgba(251,86,7,.35)!important}',
    '@keyframes udNameFire{0%,100%{background-position:0 0}50%{background-position:0 40%}}',
    '.ud-name-fx-ice{background:linear-gradient(100deg,#e0f7ff 0%,#7dd3fc 45%,#38bdf8 65%,#e0f7ff 100%);background-size:220% 100%;-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;animation:udNameIce 3.4s linear infinite;text-shadow:0 0 16px rgba(125,211,252,.5)!important}',
    '@keyframes udNameIce{0%{background-position:0% 0}100%{background-position:220% 0}}',
    '.ud-name-fx-metallic{background:linear-gradient(100deg,#fef3c7 0%,#fbbf24 20%,#fef9c3 40%,#d97706 60%,#fef3c7 80%,#fbbf24 100%);background-size:260% 100%;-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;animation:udNameMetallic 3.2s linear infinite}',
    '@keyframes udNameMetallic{0%{background-position:0% 0}100%{background-position:260% 0}}',
    '.ud-name-fx-emboss{-webkit-text-fill-color:transparent;background:linear-gradient(180deg,rgba(255,255,255,.98),rgba(226,232,240,.75));-webkit-background-clip:text;background-clip:text;text-shadow:0 1px 0 rgba(255,255,255,.55),0 -1px 1px rgba(15,23,42,.55)!important}',
    // 대학명 효과 (2차 추가분)
    '.ud-name-fx-candy{background:linear-gradient(100deg,#f472b6,#facc15,#34d399,#38bdf8,#a78bfa,#f472b6);background-size:300% 100%;-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;animation:udNameCandy 6s linear infinite}',
    '@keyframes udNameCandy{0%{background-position:0% 0}100%{background-position:300% 0}}',
    '.ud-name-fx-flicker{animation:udNameFlicker 2.6s linear infinite}',
    '@keyframes udNameFlicker{0%,19%,21%,23%,54%,56%,100%{opacity:1;text-shadow:0 0 6px currentColor,0 0 16px currentColor,0 0 32px currentColor}20%,22%,55%{opacity:.4;text-shadow:none}}',
    '.ud-name-fx-stone{text-shadow:0 1px 0 rgba(255,255,255,.25),0 2px 3px rgba(0,0,0,.7),0 -1px 1px rgba(0,0,0,.4)!important}',
    // 대학명 효과 (3차 추가분)
    '.ud-name-fx-glitch{position:relative;animation:udNameGlitch 2.2s infinite}',
    '@keyframes udNameGlitch{0%,100%{text-shadow:0 0 0 transparent}92%{text-shadow:0 0 0 transparent}93%{text-shadow:-2px 0 #ff2d55,2px 0 #22d3ee}95%{text-shadow:2px 0 #ff2d55,-2px 0 #22d3ee}97%{text-shadow:-1px 0 #ff2d55,1px 0 #22d3ee}98%{text-shadow:0 0 0 transparent}}',
    '.ud-name-fx-chrome{background:linear-gradient(100deg,#cbd5e1 0%,#f8fafc 20%,#94a3b8 40%,#e2e8f0 60%,#64748b 80%,#f1f5f9 100%);background-size:260% 100%;-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;animation:udNameChrome 3.4s linear infinite}',
    '@keyframes udNameChrome{0%{background-position:0% 0}100%{background-position:260% 0}}',
    '.ud-name-fx-pastel{background:linear-gradient(100deg,#fbcfe8,#ddd6fe,#bae6fd,#bbf7d0,#fef08a,#fbcfe8);background-size:300% 100%;-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;animation:udNamePastel 7s linear infinite}',
    '@keyframes udNamePastel{0%{background-position:0% 0}100%{background-position:300% 0}}',
    // 상단 배너 전체 효과
    '.ud-hero-fx-aurora::before{content:"";position:absolute;inset:-40%;background:radial-gradient(circle at 30% 30%,rgba(255,255,255,.35),transparent 45%),radial-gradient(circle at 70% 60%,rgba(255,255,255,.22),transparent 50%);filter:blur(18px);animation:udHeroAurora 8s ease-in-out infinite;pointer-events:none;z-index:0}',
    '@keyframes udHeroAurora{0%,100%{transform:translate(0,0) rotate(0deg)}50%{transform:translate(4%,-3%) rotate(8deg)}}',
    '.ud-hero-fx-grid::before{content:"";position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,.08) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.08) 1px,transparent 1px);background-size:26px 26px;pointer-events:none;z-index:0}',
    '.ud-hero-fx-particles::before{content:"";position:absolute;inset:0;pointer-events:none;z-index:0;background-image:radial-gradient(rgba(255,255,255,.55) 1.5px,transparent 1.5px),radial-gradient(rgba(255,255,255,.35) 1.5px,transparent 1.5px),radial-gradient(rgba(255,255,255,.45) 1px,transparent 1px);background-size:120px 90px,160px 130px,90px 70px;background-position:0 0,40px 60px,90px 20px;animation:udHeroParticles 9s linear infinite}',
    '@keyframes udHeroParticles{0%{background-position:0 0,40px 60px,90px 20px}100%{background-position:0 -180px,40px -260px,90px -140px}}',
    '.ud-hero-fx-shine::after{content:"";position:absolute;top:0;left:-60%;width:35%;height:100%;background:linear-gradient(100deg,transparent,rgba(255,255,255,.35),transparent);transform:skewX(-18deg);animation:udHeroShine 3.6s ease-in-out infinite;pointer-events:none;z-index:2}',
    '@keyframes udHeroShine{0%{left:-60%}100%{left:130%}}',
    '.ud-hero-fx-spotlight::before{content:"";position:absolute;top:-40%;left:-10%;width:60%;height:180%;background:radial-gradient(circle,rgba(255,255,255,.28),transparent 65%);filter:blur(4px);pointer-events:none;z-index:0;animation:udHeroSpotlightMove 6s ease-in-out infinite}',
    '@keyframes udHeroSpotlightMove{0%,100%{left:-10%}50%{left:70%}}',
    '.ud-hero-fx-stripes::before{content:"";position:absolute;inset:0;background:repeating-linear-gradient(45deg,rgba(255,255,255,.06) 0 12px,transparent 12px 24px);pointer-events:none;z-index:0}',
    // 상단 배너 전체 효과 (2차 추가분)
    '.ud-hero-fx-confetti::before{content:"";position:absolute;inset:0;pointer-events:none;z-index:0;opacity:.85;background-image:radial-gradient(circle,#fbbf24 2px,transparent 2px),radial-gradient(circle,#f472b6 2px,transparent 2px),radial-gradient(circle,#38bdf8 2px,transparent 2px),radial-gradient(circle,#34d399 2px,transparent 2px);background-size:140px 110px,170px 140px,120px 95px,155px 125px;background-position:10px 0,60px 30px,100px 10px,30px 60px;animation:udHeroConfetti 7s linear infinite}',
    '@keyframes udHeroConfetti{0%{background-position:10px 0,60px 30px,100px 10px,30px 60px}100%{background-position:10px 220px,60px 250px,100px 230px,30px 280px}}',
    '.ud-hero-fx-vignette::before{content:"";position:absolute;inset:0;pointer-events:none;z-index:0;animation:udHeroVignette 3.2s ease-in-out infinite}',
    '@keyframes udHeroVignette{0%,100%{box-shadow:inset 0 0 40px rgba(255,255,255,.06)}50%{box-shadow:inset 0 0 80px rgba(255,255,255,.24)}}',
    '.ud-hero-fx-wavebands::before{content:"";position:absolute;inset:-20% -20%;background:repeating-linear-gradient(115deg,rgba(255,255,255,.10) 0 18px,transparent 18px 46px);animation:udHeroWaveBands 5.5s linear infinite;pointer-events:none;z-index:0}',
    '@keyframes udHeroWaveBands{0%{transform:translateX(0)}100%{transform:translateX(64px)}}',
    // 상단 배너 전체 효과 (3차 추가분)
    '.ud-hero-fx-snow::before{content:"";position:absolute;inset:0;pointer-events:none;z-index:0;background-image:radial-gradient(circle,rgba(255,255,255,.9) 1.5px,transparent 1.5px),radial-gradient(circle,rgba(255,255,255,.7) 1.5px,transparent 1.5px),radial-gradient(circle,rgba(255,255,255,.8) 1px,transparent 1px);background-size:90px 70px,130px 100px,70px 55px;background-position:0 0,50px 30px,20px 10px;animation:udHeroSnow 6s linear infinite}',
    '@keyframes udHeroSnow{0%{background-position:0 0,50px 30px,20px 10px}100%{background-position:0 160px,50px 190px,20px 130px}}',
    '.ud-hero-fx-beam::before{content:"";position:absolute;top:-20%;left:-10%;width:16%;height:160%;background:linear-gradient(180deg,transparent,rgba(255,255,255,.30),transparent);filter:blur(3px);pointer-events:none;z-index:0;animation:udHeroBeamMove 4.6s ease-in-out infinite}',
    '@keyframes udHeroBeamMove{0%,100%{left:-10%}50%{left:90%}}',
    '.ud-hero-fx-glowpulse::before{content:"";position:absolute;inset:0;pointer-events:none;z-index:0;background:radial-gradient(circle at 50% 30%,rgba(255,255,255,.22),transparent 60%);animation:udHeroGlowPulse 3s ease-in-out infinite}',
    '@keyframes udHeroGlowPulse{0%,100%{opacity:.4}50%{opacity:1}}'
  ].join('');
  document.head.appendChild(s);
})();

function buildUnivHeaderCardHTML(opts){
  const {
    univName='', col='', members=[], wins=0, losses=0, tot=0, pts=0, wr=0,
    hdrBg='', hdrBgLayer=null, isMobile=false, isTablet=false, logoSizeEff='46px'
  } = opts || {};
  const uNameFs = isMobile ? 44 : (isTablet ? 55 : 64);
  const dissolvedBadge = (()=>{
    const u=univCfg.find(u=>u.name===univName);
    return u?.dissolved?`<span style="font-size:10px;font-weight:800;background:rgba(0,0,0,.38);color:#fca5a5;border-radius:8px;padding:2px 9px;margin-left:7px;vertical-align:middle;letter-spacing:.2px">🏚️ 해체${u.dissolvedDate?' '+u.dissolvedDate:''}</span>`:'';
  })();
  const _bgSize = hdrBgLayer?.fit==='fill' ? '100% 100%' : (hdrBgLayer?.fit==='cover' ? 'cover' : 'contain');
  const _bgScale = Math.max(40, Math.min(220, Number(hdrBgLayer?.scale||100)));
  const _bgPosX = Math.max(0, Math.min(100, Number(hdrBgLayer?.posX ?? 50) || 50));
  const _bgPosY = Math.max(0, Math.min(100, Number(hdrBgLayer?.posY ?? 50) || 50));
  const topNames = [...members].sort((a,b)=>(b.points||0)-(a.points||0)).slice(0,3);
  const winPct = tot ? wr : 0;
  const winBarW = Math.max(0,Math.min(100,winPct));
  const _hexToRgb = h => { const m=String(h||'').match(/^#([0-9a-f]{6})$/i); if(!m)return '59,130,246'; const n=parseInt(m[1],16); return `${(n>>16)&255},${(n>>8)&255},${n&255}`; };
  const colRgb = _hexToRgb(col);
  const ptColor = pts>0?'#4ade80':pts<0?'#f87171':'rgba(255,255,255,.82)';
  const wrColor = winPct>=60?'#4ade80':winPct>=50?'#86efac':winPct>=40?'#fcd34d':'#f87171';
  const bgLayerHTML = hdrBgLayer?.url
    ? `<div style="position:absolute;inset:-8%;background-image:url('${toHttpsUrl(hdrBgLayer.url).replace(/'/g,"%27")}');background-repeat:no-repeat;background-position:${_bgPosX}% ${_bgPosY}%;background-size:${_bgSize};transform:scale(${_bgScale/100});transform-origin:${_bgPosX}% ${_bgPosY}%;opacity:.28;pointer-events:none"></div>`
    : '';
  const tierCounts = {};
  members.forEach(m=>{ const t=String(m?.tier||'?'); tierCounts[t]=(tierCounts[t]||0)+1; });
  const tierSummary = Object.entries(tierCounts).sort((a,b)=>(b[1]-a[1]) || a[0].localeCompare(b[0])).slice(0,2).map(([t,c])=>`${t} ${c}명`).join(' · ');
  const activeCount = members.filter(m=>!m?.retired).length;
  const aceName = topNames[0]?.name || '미정';
  const quickCardBg = 'linear-gradient(180deg,rgba(255,255,255,.98),rgba(248,250,252,.94))';
  const quickCardBd = 'rgba(226,232,240,.92)';
  const quickLabelCol = '#475569';
  const quickValueCol = '#020617';
  const quickMetaCol = '#334155';
  const quickRail = `
    <div class="ud-hero-quickrail" style="display:grid;grid-template-columns:repeat(${isMobile?2:4},minmax(0,1fr));gap:8px;padding:${isMobile?'10px 10px 12px':'12px 14px 14px'};background:linear-gradient(180deg,rgba(255,255,255,.14),rgba(255,255,255,.08));border-top:1px solid rgba(255,255,255,.14)">
      <div class="ud-hero-quickcard" data-kind="members" style="padding:11px 12px;border-radius:var(--r2);background:${quickCardBg};border:1px solid ${quickCardBd};box-shadow:inset 0 1px 0 rgba(255,255,255,.82),0 10px 22px rgba(15,23,42,.10);backdrop-filter:blur(10px)">
        <div style="font-size:10px;font-weight:1000;letter-spacing:.08em;color:${quickLabelCol};text-transform:uppercase">활동 인원</div>
        <div style="margin-top:7px;font-size:${isMobile?13:15}px;font-weight:1000;color:${quickValueCol};text-shadow:0 1px 0 rgba(255,255,255,.35)">${activeCount}명</div>
      </div>
      <div class="ud-hero-quickcard" data-kind="tier" style="padding:11px 12px;border-radius:var(--r2);background:${quickCardBg};border:1px solid ${quickCardBd};box-shadow:inset 0 1px 0 rgba(255,255,255,.82),0 10px 22px rgba(15,23,42,.10);backdrop-filter:blur(10px)">
        <div style="font-size:10px;font-weight:1000;letter-spacing:.08em;color:${quickLabelCol};text-transform:uppercase">핵심 티어</div>
        <div style="margin-top:7px;font-size:${isMobile?13:15}px;font-weight:1000;color:${quickValueCol};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-shadow:0 1px 0 rgba(255,255,255,.35)">${tierSummary||'집계 대기'}</div>
      </div>
      <div class="ud-hero-quickcard" data-kind="ace" style="padding:11px 12px;border-radius:var(--r2);background:${quickCardBg};border:1px solid ${quickCardBd};box-shadow:inset 0 1px 0 rgba(255,255,255,.82),0 10px 22px rgba(15,23,42,.10);backdrop-filter:blur(10px)">
        <div style="font-size:10px;font-weight:1000;letter-spacing:.08em;color:${quickLabelCol};text-transform:uppercase">에이스</div>
        <div style="margin-top:7px;font-size:${isMobile?13:15}px;font-weight:1000;color:${quickValueCol};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-shadow:0 1px 0 rgba(255,255,255,.35)">${aceName}</div>
      </div>
      <div class="ud-hero-quickcard" data-kind="form" style="padding:11px 12px;border-radius:var(--r2);background:${quickCardBg};border:1px solid ${quickCardBd};box-shadow:inset 0 1px 0 rgba(255,255,255,.82),0 10px 22px rgba(15,23,42,.10);backdrop-filter:blur(10px)">
        <div style="font-size:10px;font-weight:1000;letter-spacing:.08em;color:${quickLabelCol};text-transform:uppercase">대학 폼</div>
        <div style="margin-top:7px;font-size:${isMobile?13:15}px;font-weight:1000;color:${wrColor};text-shadow:0 1px 0 rgba(255,255,255,.45)">${tot?`${winPct}%`:'기록 대기'}</div>
        <div style="margin-top:3px;font-size:10px;color:${quickMetaCol};font-weight:900">${wins}승 ${losses}패</div>
      </div>
    </div>`;

  // 상위 3인 스트리머 스트립 (로고/이름 아래, 별도 줄) — 포인트 표기 없이 사진+이름만
  const topAvatarsHTML = topNames.length
    ? `<div class="ud-hero-top-avatars" style="position:relative;display:flex;align-items:center;justify-content:flex-end;gap:${isMobile?'7px':'9px'};flex-wrap:nowrap;overflow-x:auto;padding-top:${isMobile?'2px':'4px'}">
        ${topNames.map((p,i)=>`<div style="flex-shrink:0;display:flex;align-items:center;gap:5px;background:rgba(15,23,42,.24);border:1px solid rgba(255,255,255,.18);border-radius:999px;padding:${isMobile?'4px 11px 4px 5px':'5px 13px 5px 6px'};min-width:0;box-shadow:inset 0 1px 0 rgba(255,255,255,.08),0 6px 16px rgba(15,23,42,.16);backdrop-filter:blur(10px)">
          <span style="font-size:11px;min-width:13px">${['🥇','🥈','🥉'][i]||''}</span>
          ${getPlayerPhotoHTML(p.name, isMobile?'20px':'22px')}
          <span style="font-size:${isMobile?10.5:11.5}px;font-weight:900;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:${isMobile?'80px':'104px'}">${p.name}</span>
        </div>`).join('')}
      </div>`
    : '';

  // 스탯 그리드
  const statItems = [
    { icon:'⚔️', label:'대학전적', value:`<span style="color:#f87171">${wins}승</span> <span style="color:#cbd5e1">${losses}패</span>`, fs: isMobile?13:15 },
    { icon:'📈', label:'승률', value:`<span style="color:${tot?wrColor:'rgba(255,255,255,.5)'}">${tot?winPct+'%':'-'}</span>`, fs: isMobile?17:20 },
    { icon:'🏆', label:'총 포인트', value:`<span style="color:${pts>0?'#4ade80':pts<0?'#f87171':'rgba(255,255,255,.85)'}">${pts>0?'+':''}${pts}</span>`, fs: isMobile?15:17 },
    { icon:'👥', label:'선수 수', value:`<span style="color:var(--text,#1e293b)">${members.length}<span style="font-size:var(--fs-sm);font-weight:600;color:var(--gray-l,#94a3b8)">명</span></span>`, fs: isMobile?17:19 }
  ];

  // 로고: 상세 팝업 전용 대형 사이즈 (현황판/리스트용 작은 로고 설정과 분리) — 관리자가 대학별로 지정한 크기가 있으면 그 값을 우선 사용, 크기 배율(udLogoScale)도 곱해서 적용
  const _univCfgEntry = univCfg.find(u=>u.name===univName) || {};
  const _customLogoPx = parseInt(_univCfgEntry.logoSizeDetail, 10);
  const _baseLogoPx = isMobile ? 168 : (isTablet ? 202 : 232);
  const _logoBasePx = (Number.isFinite(_customLogoPx) && _customLogoPx > 0) ? Math.max(60, _customLogoPx) : _baseLogoPx;
  const _logoScalePct = Math.max(50, Math.min(220, parseInt(_univCfgEntry.udLogoScale, 10) || 100));
  const logoPx = Math.round(_logoBasePx * (_logoScalePct / 100));
  const logoBoxPx = Math.round(logoPx * 1.1);
  const logoPxStr = `${logoPx}px`;
  const _univHasIcon = !!(_univCfgEntry.icon || _univCfgEntry.img);
  const _logoContentHTML = _univHasIcon
    ? gUI(univName,logoPxStr)
    : `<div style="width:100%;height:100%;border-radius:28%;background:rgba(255,255,255,.16);border:1.5px solid rgba(255,255,255,.32);display:flex;align-items:center;justify-content:center;backdrop-filter:blur(6px)">
        <span style="font-size:${Math.round(logoPx*0.52)}px;font-weight:1000;color:#fff;line-height:1;text-shadow:0 2px 10px rgba(0,0,0,.2)">${univName ? univName.trim().charAt(0) : '?'}</span>
      </div>`;

  // 대학 로고 효과 / 대학명 효과·색상·위치 (대학 정보 수정 패널에서 설정)
  // 구버전 '링(원)' 효과는 폐지되어 prism(빛나는 회전 링)으로 자동 대체됨
  const _logoFxRaw = String(_univCfgEntry.udLogoFx || 'none');
  const _logoFx = _logoFxRaw === 'ring' ? 'prism' : _logoFxRaw;
  const _isLogoFilterFx = (_logoFx === 'glow' || _logoFx === 'shadow' || _logoFx === 'aura' || _logoFx === 'rainbow' || _logoFx === 'flash' || _logoFx === 'flicker');
  const _isLogoBoxFx = (_logoFx === 'float' || _logoFx === 'shine' || _logoFx === 'spotlight' || _logoFx === 'prism' || _logoFx === 'sparkle' || _logoFx === 'pulse' || _logoFx === 'tilt' || _logoFx === 'halo' || _logoFx === 'wobble' || _logoFx === 'orbit' || _logoFx === 'flip' || _logoFx === 'bounce');
  const _logoOuterClass = _isLogoBoxFx ? ` ud-logo-fx-${_logoFx}` : '';
  const _logoInnerClass = _isLogoFilterFx ? ` ud-logo-fx-${_logoFx}` : '';

  const _nameFx = String(_univCfgEntry.udNameFx || 'none');
  const _nameScalePct = Math.max(50, Math.min(220, parseInt(_univCfgEntry.udNameScale, 10) || 100));
  const _nameFsFinal = Math.round(uNameFs * (_nameScalePct / 100));
  const _nameColorMode = String(_univCfgEntry.udNameColorMode || 'white');
  const _nameColorCustom = String(_univCfgEntry.udNameColorCustom || '').trim();
  let _nameColor = '#fff';
  if(_nameColorMode === 'univ' && col) _nameColor = col;
  else if(_nameColorMode === 'custom' && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(_nameColorCustom)) _nameColor = _nameColorCustom;
  const _nameClass = _nameFx !== 'none' ? ` ud-name-fx-${_nameFx}` : '';
  const _namePos = _univCfgEntry.udNamePos === 'below' ? 'below' : 'side';
  const _defaultGap = isMobile ? 8 : 12;
  const _brandGapRaw = parseInt(_univCfgEntry.udBrandGap, 10);
  const _brandGap = Number.isFinite(_brandGapRaw) ? Math.max(-40, Math.min(80, _brandGapRaw)) : _defaultGap;

  // 로고 / 대학명 좌우·상하 미세 위치 조정 (대학 정보 수정 패널에서 설정, 마이너스 값 허용)
  const _clampOff = v => Math.max(-60, Math.min(60, v));
  const _defaultLogoOffX = -8;
  const _logoOffXRaw = parseInt(_univCfgEntry.udLogoOffX, 10);
  const _logoOffX = Number.isFinite(_logoOffXRaw) ? _clampOff(_logoOffXRaw) : _defaultLogoOffX;
  const _logoOffYRaw = parseInt(_univCfgEntry.udLogoOffY, 10);
  const _logoOffY = Number.isFinite(_logoOffYRaw) ? _clampOff(_logoOffYRaw) : 0;
  const _nameOffXRaw = parseInt(_univCfgEntry.udNameOffX, 10);
  const _nameOffX = Number.isFinite(_nameOffXRaw) ? _clampOff(_nameOffXRaw) : 0;
  const _nameOffYRaw = parseInt(_univCfgEntry.udNameOffY, 10);
  const _nameOffY = Number.isFinite(_nameOffYRaw) ? _clampOff(_nameOffYRaw) : 0;

  // 기존에는 padding 값에 비율(pct/100)만 곱해서, base 값(20~26px)이 워낙 작아
  // 슬라이더를 50%~200%까지 움직여도 실제 배너 높이가 몇 px밖에 안 바뀌어
  // "조절해도 크기가 안 바뀐다"고 느껴지는 문제가 있었음.
  // → 이후 100% 기준으로 위/아래 각각 비례 증가하도록 고쳤지만, 감소 방향(50~100%)은
  //   변화폭이 너무 커서 곧바로 최소값(4px)에 눌려버려 50~82% 구간이 전부 똑같아
  //   보이는 문제가 있었음.
  // → 50~100%, 100~200% 구간을 각각 별도 기울기로 선형 보간해서, 줄이는 방향도
  //   끝까지 고르게 체감되도록 수정.
  const _hdrPadScalePct = Math.max(50, Math.min(200, parseInt(_univCfgEntry.udHeaderPadY, 10) || 100));
  const _hdrPadBaseTop = isMobile ? 16 : 20;
  const _hdrPadBaseBottom = isMobile ? 18 : 20;
  const _hdrPadCalc = (base, pct) => {
    if (pct <= 100) {
      const floor = Math.max(4, Math.round(base * 0.3));
      return Math.round(floor + (base - floor) * ((pct - 50) / 50));
    }
    return Math.round(base + (pct - 100) * 0.9);
  };
  const _hdrPadTop = _hdrPadCalc(_hdrPadBaseTop, _hdrPadScalePct);
  const _hdrPadBottom = _hdrPadCalc(_hdrPadBaseBottom, _hdrPadScalePct);
  const _hdrPadX = isMobile ? 16 : 24;

  // 상단 배너 전체 효과 (대학 정보 수정 패널에서 설정)
  const _heroFx = String(_univCfgEntry.udHeroFx || 'none');
  const _heroFxClass = _heroFx !== 'none' ? ` ud-hero-fx-${_heroFx}` : '';

  return `<div class="ud-hero" style="border-radius:26px;overflow:hidden;margin-bottom:18px;box-shadow:0 28px 60px rgba(${colRgb},.2),0 8px 22px rgba(15,23,42,.10)">
    <!-- 헤더 배너 -->
    <div class="ud-hero-top${_heroFxClass}" style="background:${hdrBg||`linear-gradient(145deg,${col} 0%,${col}bb 60%,${col}88 100%)`};padding:${_hdrPadTop}px ${_hdrPadX}px ${_hdrPadBottom}px;position:relative;overflow:hidden">
      ${bgLayerHTML}
      <!-- 장식 원 -->
      <div style="position:absolute;top:-34px;right:-24px;width:200px;height:200px;border-radius:50%;background:rgba(255,255,255,.07);pointer-events:none"></div>
      <div style="position:absolute;bottom:-70px;left:10%;width:160px;height:160px;border-radius:50%;background:rgba(255,255,255,.04);pointer-events:none"></div>
      <div style="position:absolute;top:50%;left:-30px;width:80px;height:160px;transform:translateY(-50%);border-radius:50%;background:rgba(255,255,255,.03);pointer-events:none"></div>
      <!-- 그라디언트 오버레이 -->
      <div style="position:absolute;inset:0;background:linear-gradient(145deg,rgba(15,23,42,.04) 0%,rgba(15,23,42,.18) 55%,rgba(15,23,42,.26) 100%);pointer-events:none"></div>
      <div style="position:absolute;left:0;right:0;top:0;height:60px;background:linear-gradient(180deg,rgba(255,255,255,.08),transparent);pointer-events:none"></div>
      <div style="position:absolute;bottom:0;left:0;right:0;height:80px;background:linear-gradient(transparent,rgba(15,23,42,.20));pointer-events:none"></div>
      <!-- 콘텐츠 -->
      <div class="ud-hero-main" style="position:relative;display:flex;flex-direction:column;gap:${isMobile?'12px':'14px'}">
        <!-- 로고 + 이름 -->
        <div class="ud-hero-brand" style="${_namePos==='below'
          ? `display:flex;flex-direction:column;align-items:center;text-align:center;gap:${_brandGap}px;min-width:0`
          : `display:flex;align-items:center;gap:${_brandGap}px;min-width:0`}">
          <div class="${_logoOuterClass.trim()}" style="width:${logoBoxPx}px;height:${logoBoxPx}px;flex-shrink:0;display:flex;align-items:center;justify-content:center;overflow:visible;margin:${_logoOffY}px 0 0 ${_logoOffX}px;--ud-logo-box:${logoBoxPx}px">
            <div class="${_logoInnerClass.trim()}" style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;filter:drop-shadow(0 16px 28px rgba(15,23,42,.24)) drop-shadow(0 4px 10px rgba(255,255,255,.08))">
              ${_logoContentHTML}
            </div>
          </div>
          <div style="min-width:0;max-width:100%;margin:${_nameOffY}px 0 0 ${_nameOffX}px;${_namePos==='below'?'flex:none;width:100%':'flex:1 1 auto'}">
            <div style="font-size:${_nameFsFinal}px;font-weight:1000;color:${_nameColor};text-shadow:0 4px 20px rgba(0,0,0,.28),0 1px 0 rgba(255,255,255,.08);line-height:1.08;letter-spacing:-.03em;word-break:keep-all;overflow-wrap:anywhere;max-width:100%" class="ud-hero-name${_nameClass}">${univName}${dissolvedBadge}</div>
          </div>
        </div>
        ${topAvatarsHTML}
      </div>
    </div>
    ${quickRail}
    <!-- 하단 스탯 -->
    <div class="ud-hero-stats" style="background:var(--white,#fff);padding:${isMobile?'14px 14px 16px':'16px 20px 18px'}">
      ${tot?`<div style="margin-bottom:14px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:5px">
          <span style="font-size:10.5px;font-weight:900;color:var(--text3,#475569);letter-spacing:.5px">대학 승률</span>
          <span style="font-size:14px;font-weight:1000;color:${col}">${winPct}%</span>
        </div>
        <div style="height:7px;background:${col}18;border-radius:99px;overflow:hidden;position:relative">
          <div style="position:absolute;left:0;top:0;height:100%;width:${winBarW}%;background:linear-gradient(90deg,${col}bb,${col});border-radius:99px;transition:.6s ease"></div>
        </div>
      </div>`:''}
      <div style="display:grid;grid-template-columns:repeat(${isMobile?'2':'4'},1fr);gap:${isMobile?'7px':'9px'}">
        ${statItems.map(s=>`<div class="ud-hero-stat" style="background:linear-gradient(145deg,${col}0c,${col}06);border:1.5px solid ${col}22;border-radius:var(--r2);padding:${isMobile?'10px 8px':'13px 10px'};text-align:center;position:relative;overflow:hidden;transition:border-color .15s">
          <div style="position:absolute;bottom:-8px;right:-6px;font-size:26px;opacity:.07;line-height:1">${s.icon}</div>
          <div class="ud-hero-stat-label" style="font-size:8.5px;color:var(--text3,#475569);margin-bottom:5px;font-weight:900;letter-spacing:.9px;text-transform:uppercase">${s.label}</div>
          <div class="ud-hero-stat-val" style="font-weight:900;font-size:${s.fs}px;color:var(--text,#1e293b);text-shadow:0 0 .3px currentColor">${s.value}</div>
        </div>`).join('')}
      </div>
    </div>
  </div>`;
}


function buildUnivMembersTableHTML(opts){
  const { members=[], univName='', col='', byPlayer={} } = opts || {};
  if(!members.length) return '';
  const _recOf = (p)=>byPlayer[String(p?.name||'').trim()] || {w:0,l:0,tot:0,wr:0,pts:0};
  const sorted=[...members].sort((a,b)=>getRoleOrder(a.role,a)-getRoleOrder(b.role,b)||TIERS.indexOf(a.tier)-TIERS.indexOf(b.tier)||((_recOf(b).pts||0)-(_recOf(a).pts||0)));
  const _hexToRgb = h => { const m=String(h||'').match(/^#([0-9a-f]{6})$/i); if(!m)return '59,130,246'; const n=parseInt(m[1],16); return `${(n>>16)&255},${(n>>8)&255},${n&255}`; };
  const colRgb = _hexToRgb(col);
  let h=`<div class="su-sec" style="--su-sec-accent:${col}">
    <div class="su-sec__title">소속 스트리머 <small>(${sorted.length}명)</small></div>
    <div class="ud-members-table-wrap" style="border:1px solid rgba(148,163,184,.16);border-radius:14px;overflow-x:auto;-webkit-overflow-scrolling:touch;background:linear-gradient(180deg,#ffffff,#f8fafc);box-shadow:0 8px 24px rgba(${colRgb},.07),0 2px 8px rgba(15,23,42,.04)">
    <table class="ud-members-table" style="margin:0;border:none;border-radius:0;table-layout:auto">
      <thead>
        <tr>
          <th style="text-align:center;width:1px;white-space:nowrap;padding:9px 7px;background:${col}!important;color:#fff!important;font-weight:900;letter-spacing:.3px;font-size:var(--fs-caption)">직책</th>
          <th style="text-align:center;background:${col}!important;color:#fff!important;font-weight:900;font-size:var(--fs-caption)">티어</th>
          <th style="text-align:center;width:46px;background:${col}!important;color:#fff!important;font-weight:900;font-size:var(--fs-caption)">종족</th>
          <th style="text-align:left;padding-left:10px;background:${col}!important;color:#fff!important;font-weight:900;font-size:var(--fs-caption)">이름</th>
          <th style="text-align:center;width:36px;background:${col}!important;color:#fff!important;font-weight:900;font-size:var(--fs-caption)">성별</th>
          <th style="text-align:center;width:36px;background:${col}!important;color:#fff!important;font-weight:900;font-size:var(--fs-caption)">승</th>
          <th style="text-align:center;width:36px;background:${col}!important;color:#fff!important;font-weight:900;font-size:var(--fs-caption)">패</th>
          <th style="text-align:center;width:50px;background:${col}!important;color:#fff!important;font-weight:900;font-size:var(--fs-caption)">승률</th>
          <th style="text-align:center;width:58px;background:${col}!important;color:#fff!important;font-weight:900;font-size:var(--fs-caption)">포인트</th>
        </tr>
      </thead>
      <tbody>`;
  sorted.forEach((p,i)=>{
    const rec=_recOf(p);
    const tw=rec.tot||0;
    const twr=rec.wr||0;
    const isEven = i%2===0;
    h+=`<tr data-uds-action="open-player" data-uds-player="${escJS(p.name)}" data-uds-hover-bg="${gcHex8(p.univ,.14)}" data-uds-base-univ="${String(p.univ).replace(/"/g,'&quot;')}" style="cursor:pointer;transition:background .15s;background:${isEven?gcHex8(p.univ,.04):'transparent'}">
      <td style="text-align:center;padding:5px 4px;white-space:nowrap">${p.role?getRoleBadgeHTML(p.role,'10px'):''}</td>
      <td style="text-align:center">${getTierBadge(p.tier)}</td>
      <td style="text-align:center"><span class="rbadge r${p.race}">${p.race}</span></td>
      <td style="text-align:left;padding-left:10px;font-weight:700"><span style="display:inline-flex;align-items:center;gap:6px">${getPlayerPhotoHTML(p.name,'30px')}<span class="clickable-name">${p.name}</span>${getStatusIconHTML(p.name)}</span></td>
      <td style="text-align:center;color:var(--gray-l,#cbd5e1)">${genderIcon(p.gender)||'–'}</td>
      <td style="text-align:center" class="wt">${rec.w||0}</td>
      <td style="text-align:center" class="lt">${rec.l||0}</td>
      <td style="text-align:center;font-weight:800;color:${twr>=50?'#16a34a':'#dc2626'}">${tw?twr+'%':'-'}</td>
      <td style="text-align:center" class="${pC(rec.pts||0)}">${pS(rec.pts||0)}</td>
    </tr>`;
  });
  h+=`</tbody></table></div></div>`;
  return h;
}

function buildUnivOppStatsHTML(opts){
  const { oppStats={}, isMobile=false, isTablet=false } = opts || {};
  const oppList=Object.entries(oppStats).filter(([,s])=>s.w+s.l>0).sort((a,b)=>(b[1].w+b[1].l)-(a[1].w+a[1].l));
  if(!oppList.length) return '';
  let h=`<div class="su-sec" style="--su-sec-accent:#7c3aed">
    <div class="su-sec__title">상대 대학 전적</div>
    <div style="display:flex;gap:7px;flex-wrap:wrap">`;
  oppList.forEach(([opp,s])=>{
    const ot=s.w+s.l;
    const ow=ot?Math.round(s.w/ot*100):0;
    const oc=gc(opp);
    const _hexToRgb = h => { const m=String(h||'').match(/^#([0-9a-f]{6})$/i); if(!m)return '59,130,246'; const n=parseInt(m[1],16); return `${(n>>16)&255},${(n>>8)&255},${n&255}`; };
    const ocRgb = _hexToRgb(oc);
    h+=`<div class="ud-opp-card" style="background:var(--white);border:1.5px solid rgba(148,163,184,.18);border-radius:14px;padding:${isMobile?'9px 11px':(isTablet?'10px 13px':'11px 15px')};text-align:center;cursor:pointer;min-width:${isMobile?'78px':'92px'};box-shadow:0 4px 12px rgba(${ocRgb},.08),0 1px 4px rgba(0,0,0,.04);transition:box-shadow .15s,transform .15s"
      data-uds-action="open-univ" data-uds-univ="${opp.replace(/"/g,'&quot;')}">
      <span class="ubadge" data-icon-done="1" style="background:${oc};font-size:${isMobile?'9px':'10px'};margin-bottom:7px;display:inline-flex;align-items:center;gap:3px">${gUI(opp,isMobile?'10px':'11px')}${opp}</span>
      <div style="font-size:${isMobile?'11px':'12px'};margin-top:4px;font-weight:700"><span class="wt">${s.w}</span>승 <span class="lt">${s.l}</span>패</div>
      <div style="font-weight:900;font-size:${isMobile?'11px':'12px'};color:${ow>=50?'#16a34a':'#dc2626'};margin-top:2px">${ow}%</div>
    </div>`;
  });
  h+=`</div></div>`;
  return h;
}

try{
  _bindUnivSectionsDelegatedEvents();
  window.buildUnivHeaderCardHTML = buildUnivHeaderCardHTML;
  window.buildUnivMembersTableHTML = buildUnivMembersTableHTML;
  window.buildUnivOppStatsHTML = buildUnivOppStatsHTML;
}catch(e){}
