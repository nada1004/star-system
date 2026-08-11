function _bindPlayerHeaderDelegatedEvents(){
  if(window._playerHeaderDelegatedBound) return;
  window._playerHeaderDelegatedBound = true;
  document.addEventListener('click', (e)=>{
    const el = e.target && e.target.closest ? e.target.closest('[data-pph-action]') : null;
    if(!el) return;
    const action = el.getAttribute('data-pph-action');
    if(action === 'open-univ'){
      e.preventDefault();
      try{ cm('playerModal'); }catch(_){}
      const univ = el.getAttribute('data-pph-univ') || '';
      setTimeout(()=>{ if(typeof openUnivModal === 'function') openUnivModal(univ); }, 100);
    }
  });
}

// pr-level-num은 밝은 배경 기준 어두운 회색이라, 어두운 히어로 헤더 위에서는 흰색으로 덮어씀 (1회만 주입)
// + 게이지 트랙이 밝은 배경(var(--border2)) 기준이라 어두운 히어로 위에서 거의 안 보이던 문제 수정
try{
  if(typeof document !== 'undefined' && !document.getElementById('pd-hero-levelbadge-style')){
    var _pdLvlStyleEl = document.createElement('style');
    _pdLvlStyleEl.id = 'pd-hero-levelbadge-style';
    _pdLvlStyleEl.textContent = '.pd-hero-levelbadge .pr-level-num{color:rgba(255,255,255,.92)}\n.pd-hero-levelbadge .pr-level-badge{border:1px solid rgba(255,255,255,.14)!important;background:rgba(255,255,255,.05)!important;backdrop-filter:blur(6px);padding:2px 10px 2px 4px!important;box-shadow:0 2px 8px rgba(0,0,0,.08)}\n.pd-hero-levelbadge .pr-level-bar{width:56px;height:6px;background:rgba(0,0,0,.22);box-shadow:inset 0 1px 2px rgba(0,0,0,.28)}\n.pd-hero-levelbadge .pr-level-bar-fill{box-shadow:0 0 4px rgba(255,255,255,.4);min-width:2px}';
    document.head.appendChild(_pdLvlStyleEl);
  }
}catch(e){}

function buildPlayerHeaderCardHTML(opts){
  const {
    player, hdrBg='', hdrBgLayer=null, photoHTML='', channelHTML='', col='',
    p2h=(v=>'00'), statsTint=8, pmCardR=18, pmHdrPad='18px 18px 16px',
    pmPhotoSz=76, pmPhotoR=16, pmNameFs=20, pmMetaFs=11,
    pmMetaPad='3px 10px', pmMetaPad2='3px 9px', pmStatsPad='14px 6px',
    pmStatsNum1=14, pmStatsBig=22, tot=0, wr=0,
    cWin='#dc2626', cLoss='#2563eb', histAll=[], eloVal=1000,
    eloColor='#16a34a', eloSparkHTML='', isMobile=false, layoutMode='default'
  } = opts || {};
  const _isMobile = isMobile || (typeof window!=='undefined' && window.innerWidth<=768);
  const p = player;
  if(!p) return '';
  // [보안 강화] 선수명/소속대학명은 innerHTML 텍스트로 그대로 삽입되므로 이스케이프 처리
  const _esc = (typeof window.escHTML==='function') ? window.escHTML : (s)=>String(s==null?'':s);
  const pNameSafe = _esc(p.name);
  const pUnivSafe = _esc(p.univ||'무소속');

  const _bgSize = hdrBgLayer?.fit==='fill' ? '100% 100%' : (hdrBgLayer?.fit==='cover' ? 'cover' : 'contain');
  const _bgScale = Math.max(40, Math.min(220, Number(hdrBgLayer?.scale||100)));
  const _bgPos = String(hdrBgLayer?.pos || 'center center').trim() || 'center center';
  const recent10 = histAll.slice(0,10);
  const recent10Wins = recent10.filter(h=>h?.result==='승').length;
  const recent10Losses = recent10.length - recent10Wins;
  const recent10Rate = recent10.length ? Math.round((recent10Wins/recent10.length)*100) : 0;

  // 상태(활동중/비활동) — 최근 6개월 내 경기 기록이 있어야 '활동중'으로 표시
  const _SIX_MONTHS_MS = 183 * 24 * 60 * 60 * 1000;
  let _lastMatchMs = null;
  for (let i = 0; i < histAll.length; i++) {
    const _dStr = histAll[i] && histAll[i].date;
    if (typeof _dStr === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(_dStr)) {
      const _ms = new Date(_dStr + 'T00:00:00').getTime();
      if (!isNaN(_ms) && (_lastMatchMs === null || _ms > _lastMatchMs)) _lastMatchMs = _ms;
    }
  }
  const _isRecentlyActive = _lastMatchMs !== null && (Date.now() - _lastMatchMs) <= _SIX_MONTHS_MS;
  const _statusLabel = p.retired ? '은퇴' : (_isRecentlyActive ? '활동중' : '비활동');
  const _statusColor = p.retired ? '#94a3b8' : (_isRecentlyActive ? '#0f172a' : '#94a3b8');
  const quickCardBg = 'linear-gradient(180deg,rgba(255,255,255,.98),rgba(248,250,252,.94))';
  const quickCardBd = 'rgba(226,232,240,.92)';
  const quickLabelCol = '#475569';
  const quickValueCol = '#020617';
  const quickMetaCol = '#334155';
  const statCardBg = 'linear-gradient(180deg,rgba(255,255,255,.98),rgba(248,250,252,.95))';
  const statCardBd = 'rgba(226,232,240,.92)';
  const statCardAccent = 'rgba(148,163,184,.38)';
  const statCardShadow = '0 10px 24px rgba(15,23,42,.06)';
  const raceTheme = {
    T: { chip:'#2563eb' },
    Z: { chip:'#7c3aed' },
    P: { chip:'#d97706' },
    N: { chip:'#475569' }
  }[p.race] || { chip:'#475569' };
  const univAccent = /^#|^rgb|^hsl/i.test(String(col||'')) ? String(col) : quickValueCol;
  const gradeTheme = eloVal>=1500
    ? { color:'#9a3412' }
    : eloVal>=1400
      ? { color:'#6b21a8' }
      : eloVal>=1300
        ? { color:'#075985' }
        : eloVal>=1200
          ? { color:'#854d0e' }
          : eloVal>=1100
            ? { color:'#475569' }
            : { color:'#7c2d12' };
  const pointsVal = Number(p.points||0);
  const pointsColor = pointsVal>0 ? cWin : pointsVal<0 ? cLoss : '#64748b';

  // 기록(경기) 자체가 없는 선수는 ELO가 기본값(1200)이라 '골드'처럼 보이는 게 부적절 → 등급 자체를 비워서 표시
  const _hasRecord = tot > 0;

  // ELO 등급 레이블
  const eloGrade = !_hasRecord ? '-' : (eloVal>=1500?'LEGEND':eloVal>=1400?'MASTER':eloVal>=1300?'DIAMOND':eloVal>=1200?'GOLD':eloVal>=1100?'SILVER':'BRONZE');
  const eloGradeColor = !_hasRecord ? '#94a3b8' : gradeTheme.color;

  // ELO 패널(어두운 글래스 패널, 히어로 사진 위)용 별도 밝은 톤 — 위 eloGradeColor는 밝은 배경(등급 퀵카드)
  // 기준이라 어두운 패널 위에선 대비가 낮음(특히 SILVER 슬레이트 그레이가 거의 안 보임)
  const eloGradeColorOnDark = !_hasRecord ? 'rgba(255,255,255,.55)' : (
    eloVal>=1500 ? '#ff8095' :
    eloVal>=1400 ? '#e879f9' :
    eloVal>=1300 ? '#38bdf8' :
    eloVal>=1200 ? '#fcd34d' :
    eloVal>=1100 ? '#f8fafc' :
    '#fb923c'
  );

  // 승률 바
  const wrBarW = Math.max(0, Math.min(100, wr));
  const wrColor = wr>=60 ? '#16a34a' : wr>=50 ? '#0f766e' : wr>=40 ? '#b45309' : '#dc2626';

  // 승수 기반 레벨/등급 배지 (통계탭 레벨/등급 순위표와 동일 로직) — 이름 옆에 간단히 표시
  const _levelBadgeHTML = (typeof _prLevelBadgeHTML === 'function') ? `<span class="pd-hero-levelbadge">${_prLevelBadgeHTML(p)}</span>` : '';

  const statsBlock = `
    <div class="pd-hero-stats" data-pd-layout="${layoutMode}" style="display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;padding:14px 16px 16px;background:linear-gradient(180deg,#ffffff,${col}${p2h(statsTint)})">
      <div class="pd-hero-stat" data-pd-stat="record" style="text-align:center;padding:10px 6px 11px;border:1.5px solid ${statCardBd};border-radius:18px;background:${statCardBg};box-shadow:${statCardShadow};position:relative;overflow:hidden">
        <div style="position:absolute;left:0;top:0;right:0;height:4px;background:${statCardAccent}"></div>
        <div class="pd-hero-stat-label" style="font-size:8.5px;font-weight:1000;color:${quickLabelCol};letter-spacing:.9px;margin-bottom:5px;text-transform:uppercase">전적</div>
        <div class="pd-hero-stat-val" style="font-weight:1000;font-size:${pmStatsNum1}px"><span style="color:${cWin}">${p.win}승</span>&nbsp;<span style="color:${cLoss}">${p.loss}패</span></div>
      </div>
      <div class="pd-hero-stat" data-pd-stat="winrate" style="text-align:center;padding:10px 6px 11px;border:1.5px solid ${statCardBd};border-radius:18px;background:${statCardBg};box-shadow:${statCardShadow};position:relative;overflow:hidden">
        <div style="position:absolute;left:0;top:0;right:0;height:4px;background:${statCardAccent}"></div>
        <div class="pd-hero-stat-label" style="font-size:8.5px;font-weight:1000;color:${quickLabelCol};letter-spacing:.9px;margin-bottom:5px;text-transform:uppercase">승률</div>
        <div class="pd-hero-stat-val" style="font-weight:1000;font-size:${pmStatsBig}px;line-height:1;color:${tot?wrColor:'var(--gray-l)'}">${tot?wr+'%':'-'}</div>
        ${tot?`<div class="pd-hero-stat-bar" style="height:3px;border-radius:99px;background:rgba(148,163,184,.2);margin:5px 6px 0;overflow:hidden"><div style="height:100%;width:${wrBarW}%;background:${wrColor};border-radius:99px"></div></div>`:''}
      </div>
      <div class="pd-hero-stat" data-pd-stat="points" style="text-align:center;padding:10px 6px 11px;border:1.5px solid ${statCardBd};border-radius:18px;background:${statCardBg};box-shadow:${statCardShadow};position:relative;overflow:hidden">
        <div style="position:absolute;left:0;top:0;right:0;height:4px;background:${statCardAccent}"></div>
        <div class="pd-hero-stat-label" style="font-size:8.5px;font-weight:1000;color:${quickLabelCol};letter-spacing:.9px;margin-bottom:5px;text-transform:uppercase">포인트</div>
        <div class="pd-hero-stat-val" style="font-weight:1000;font-size:20px;line-height:1;color:${pointsColor}">${pS(p.points)}</div>
      </div>
      <div class="pd-hero-stat" data-pd-stat="status" style="text-align:center;padding:10px 6px 11px;border:1.5px solid ${statCardBd};border-radius:18px;background:${statCardBg};box-shadow:${statCardShadow};position:relative;overflow:hidden">
        <div style="position:absolute;left:0;top:0;right:0;height:4px;background:${statCardAccent}"></div>
        <div class="pd-hero-stat-label" style="font-size:8.5px;font-weight:1000;color:${quickLabelCol};letter-spacing:.9px;margin-bottom:5px;text-transform:uppercase">상태</div>
        <div class="pd-hero-stat-val" style="font-weight:1000;font-size:${pmStatsNum1+1}px;line-height:1;color:${_statusColor}">${_statusLabel}</div>
      </div>
    </div>`;

  // ELO 패널 (PC) — 레이팅과 추이를 하나의 카드로 통합해 붕 뜨는 느낌 제거
  const eloPanel = `
    <div class="pd-elo-panel" style="display:flex;flex-direction:column;min-width:118px;align-self:stretch;justify-content:center">
      <div class="pd-elo-panel-inner" style="background:rgba(255,255,255,.13);border:1px solid rgba(255,255,255,.24);border-radius:var(--r2);padding:10px 12px ${eloSparkHTML?'8px':'10px'};text-align:center;backdrop-filter:blur(10px)">
        <div class="pd-elo-label" style="font-size:8px;letter-spacing:1.2px;font-weight:900;color:rgba(255,255,255,.6);margin-bottom:2px">ELO RATING</div>
        <div class="pd-elo-value" style="font-size:28px;font-weight:1000;color:#fff;line-height:1.05;letter-spacing:-1px">${eloVal}</div>
        <div class="pd-elo-grade" style="font-size:10px;font-weight:1000;color:${eloGradeColorOnDark};letter-spacing:.8px;margin-top:2px;text-shadow:0 1px 3px rgba(0,0,0,.6)">${eloGrade}</div>
        ${eloSparkHTML?`<div style="margin-top:7px;padding-top:7px;border-top:1px solid rgba(255,255,255,.16);display:flex;align-items:center;justify-content:center">${eloSparkHTML}</div>`:''}
      </div>
    </div>`;

  // ELO 패널 (모바일)
  const eloMobilePanel = `
    <div class="pd-elo-panel pd-elo-panel--mb" style="display:flex;gap:8px;align-items:stretch">
      <div class="pd-elo-panel-inner" style="flex:1;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.22);border-radius:14px;padding:8px 10px;text-align:center;backdrop-filter:blur(8px)">
        <div class="pd-elo-label" style="font-size:8px;letter-spacing:1px;font-weight:900;color:rgba(255,255,255,.6);margin-bottom:1px">ELO RATING</div>
        <div class="pd-elo-value" style="font-size:24px;font-weight:1000;color:#fff;line-height:1.1">${eloVal}</div>
        <div class="pd-elo-grade" style="font-size:10px;font-weight:1000;color:${eloGradeColorOnDark};letter-spacing:.8px;text-shadow:0 1px 3px rgba(0,0,0,.6)">${eloGrade}</div>
      </div>
      ${eloSparkHTML?`<div style="flex:1;background:rgba(255,255,255,.10);border:1px solid rgba(255,255,255,.18);border-radius:14px;padding:7px 8px;backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center">${eloSparkHTML}</div>`:''}
    </div>`;

  const photoBorder = `width:${pmPhotoSz+14}px;height:${pmPhotoSz+14}px;border-radius:var(--su_profile_radius,${pmPhotoR+6}px);clip-path:var(--su_profile_clip,none);background:rgba(255,255,255,.14);border:2.5px solid rgba(255,255,255,.5);display:flex;align-items:center;justify-content:center;flex-shrink:0;overflow:hidden;position:relative;box-shadow:var(--su_profile_fx, 0 10px 28px rgba(0,0,0,.22),0 0 0 1px rgba(255,255,255,.1));backdrop-filter:blur(8px)`;

  // 프로필 이미지·이름·배너 효과 (스트리머 정보 수정 패널에서 설정, 대학 상세와 동일한 효과 세트 공유)
  const _pdPhotoFx = String(p.pdPhotoFx || 'none');
  const _pdPhotoFilterFxSet = ['glow','shadow','aura','rainbow','flash','flicker'];
  const _pdPhotoBoxFxSet = ['float','shine','spotlight','prism','sparkle','pulse','tilt','halo','wobble','orbit','flip','bounce'];
  const _pdPhotoInnerClass = _pdPhotoFilterFxSet.includes(_pdPhotoFx) ? ` ud-logo-fx-${_pdPhotoFx}` : '';
  const _pdPhotoOuterClass = _pdPhotoBoxFxSet.includes(_pdPhotoFx) ? ` ud-logo-fx-${_pdPhotoFx}` : '';
  const _pdNameFx = String(p.pdNameFx || 'none');
  const _pdNameClass = _pdNameFx !== 'none' ? ` ud-name-fx-${_pdNameFx}` : '';
  const _pdHeroFx = String(p.pdHeroFx || 'none');
  const _pdHeroFxClass = _pdHeroFx !== 'none' ? ` ud-hero-fx-${_pdHeroFx}` : '';
  const _pdPhotoWrap = (boxPx, borderStyle) => `<span class="pd-hero-photo-fxwrap${_pdPhotoOuterClass}" style="position:relative;display:inline-flex;flex-shrink:0;--ud-logo-box:${boxPx}px"><div class="pd-hero-photo ph-swap${_pdPhotoInnerClass}" style="${borderStyle}">${photoHTML}</div></span>`;

  const _glassChipShadow = 'box-shadow:0 2px 8px rgba(0,0,0,.08);';
  const univBadge = `<span class="ubadge pd-chip${p.univ&&p.univ!=='무소속'?' clickable-univ':''}" data-icon-done="1"
    ${p.univ&&p.univ!=='무소속'?`data-pph-action="open-univ" data-pph-univ="${String(p.univ).replace(/"/g,'&quot;')}"`:''} 
    style="background:rgba(255,255,255,.05);color:rgba(255,255,255,.92);border:1px solid rgba(255,255,255,.14);font-size:${pmMetaFs}px;padding:2px 10px;display:inline-flex;align-items:center;gap:4px;border-radius:999px;font-weight:600;backdrop-filter:blur(6px);${_glassChipShadow}${p.univ&&p.univ!=='무소속'?'cursor:pointer':''}">
    ${gUI(p.univ,'12px')}${pUnivSafe}</span>`;

  const _raceAccent = { T:'#60a5fa', Z:'#c084fc', P:'#fbbf24', N:'#cbd5e1' }[p.race] || '#cbd5e1';
  // 티어 + 종족을 하나의 유리질감 칩으로 묶어 ELO 패널과 톤을 통일 (따로 떠 있던 플레인 텍스트 → 그룹핑된 칩)
  const tierRaceBadge = (p.tier || p.race) ? `<span style="display:inline-flex;align-items:center;gap:6px;padding:2px 11px;border-radius:999px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.14);backdrop-filter:blur(6px);font-size:${pmMetaFs}px;font-weight:600;color:rgba(255,255,255,.92);text-shadow:0 1px 2px rgba(0,0,0,.2);${_glassChipShadow}">
    ${p.tier?`<span>${(typeof _TIER_LABEL_MAP!=='undefined' && _TIER_LABEL_MAP[p.tier]) || p.tier}</span>`:''}${(p.tier&&p.race)?'<span style="opacity:.4">·</span>':''}${p.race?`<span>${p.race} ${RNAME[p.race]||''}</span>`:''}
  </span>` : '';
  const quickRail = `
    <div class="pd-hero-quickrail" data-pd-layout="${layoutMode}" style="display:grid;grid-template-columns:repeat(${_isMobile?2:4},minmax(0,1fr));gap:8px;padding:${_isMobile?'10px 10px 12px':'12px 14px 14px'};background:linear-gradient(180deg,rgba(255,255,255,.14),rgba(255,255,255,.08));border-top:1px solid rgba(255,255,255,.14)">
      <div class="pd-hero-quickcard" data-kind="univ" style="padding:11px 12px;border-radius:var(--r2);background:${quickCardBg};border:1px solid ${quickCardBd};box-shadow:inset 0 1px 0 rgba(255,255,255,.82),0 10px 22px rgba(15,23,42,.10);backdrop-filter:blur(10px)">
        <div style="font-size:10px;font-weight:1000;letter-spacing:.08em;color:${quickLabelCol};text-transform:uppercase">소속</div>
        <div style="margin-top:7px;font-size:${_isMobile?13:15}px;font-weight:1000;color:${univAccent};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-shadow:0 1px 0 rgba(255,255,255,.35)">${pUnivSafe}</div>
      </div>
      <div class="pd-hero-quickcard" data-kind="race" style="padding:11px 12px;border-radius:var(--r2);background:${quickCardBg};border:1px solid ${quickCardBd};box-shadow:inset 0 1px 0 rgba(255,255,255,.82),0 10px 22px rgba(15,23,42,.10);backdrop-filter:blur(10px)">
        <div style="font-size:10px;font-weight:1000;letter-spacing:.08em;color:${quickLabelCol};text-transform:uppercase">종족</div>
        <div style="margin-top:7px;font-size:${_isMobile?13:15}px;font-weight:1000;color:${raceTheme.chip};text-shadow:0 1px 0 rgba(255,255,255,.35)">${RNAME[p.race]||p.race||'-'}</div>
      </div>
      <div class="pd-hero-quickcard" data-kind="elo" style="padding:11px 12px;border-radius:var(--r2);background:${quickCardBg};border:1px solid ${quickCardBd};box-shadow:inset 0 1px 0 rgba(255,255,255,.82),0 10px 22px rgba(15,23,42,.10);backdrop-filter:blur(10px)">
        <div style="font-size:10px;font-weight:1000;letter-spacing:.08em;color:${quickLabelCol};text-transform:uppercase">등급</div>
        <div style="margin-top:7px;font-size:${_isMobile?13:15}px;font-weight:1000;color:${eloGradeColor};text-shadow:0 1px 0 rgba(255,255,255,.45)">${eloGrade}</div>
      </div>
      <div class="pd-hero-quickcard" data-kind="form" style="padding:11px 12px;border-radius:var(--r2);background:${quickCardBg};border:1px solid ${quickCardBd};box-shadow:inset 0 1px 0 rgba(255,255,255,.82),0 10px 22px rgba(15,23,42,.10);backdrop-filter:blur(10px)">
        <div style="font-size:10px;font-weight:1000;letter-spacing:.08em;color:${quickLabelCol};text-transform:uppercase">최근 폼</div>
        <div style="margin-top:7px;font-size:${_isMobile?13:15}px;font-weight:1000;text-shadow:0 1px 0 rgba(255,255,255,.45)">${recent10.length?`<span style="color:${cWin}">${recent10Wins}승</span> <span style="color:${cLoss}">${recent10Losses}패</span>`:'<span style="color:'+quickMetaCol+'">기록 대기</span>'}</div>
      </div>
    </div>`;

  const bgLayerHTML = hdrBgLayer?.url
    ? `<div style="position:absolute;inset:-8%;background-image:url('${toHttpsUrl(hdrBgLayer.url).replace(/'/g,"%27")}');background-repeat:no-repeat;background-position:${_bgPos};background-size:${_bgSize};transform:scale(${_bgScale/100});transform-origin:center center;opacity:.42;pointer-events:none"></div>`
    : '';

  // 노이즈 텍스처 오버레이 (고급감)
  const noiseOverlay = `<div style="position:absolute;inset:0;background:url('data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22><filter id=%22n%22><feTurbulence type=%22fractalNoise%22 baseFrequency=%220.75%22 numOctaves=%224%22 stitchTiles=%22stitch%22/><feColorMatrix type=%22saturate%22 values=%220%22/></filter><rect width=%22200%22 height=%22200%22 filter=%22url(%23n)%22 opacity=%220.04%22/></svg>');opacity:.5;pointer-events:none;mix-blend-mode:overlay"></div>`;

  const hdrContent_PC = `
    <div class="pd-hero-main pd-hero-main--pc" style="display:grid;grid-template-columns:auto minmax(0,1fr) auto;align-items:center;gap:16px;position:relative">
      ${_pdPhotoWrap(pmPhotoSz+14, photoBorder)}
      <div class="pd-hero-meta" style="min-width:0">
        <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:8px">
          <span class="pd-hero-name${_pdNameClass}" style="font-size:${pmNameFs+4}px;font-weight:1000;color:#fff;text-shadow:0 2px 12px rgba(0,0,0,.28);letter-spacing:-.02em;line-height:1">${pNameSafe}${genderIcon(p.gender)}</span>
          ${p.role?getRoleBadgeHTML(p.role,'11px'):''}
        </div>
        <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:8px">
          ${tierRaceBadge}
        </div>
        <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-bottom:8px">
          ${_levelBadgeHTML}
        </div>
        <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">
          ${univBadge}${channelHTML}
        </div>
      </div>
      ${eloPanel}
    </div>`;

  const hdrContent_MB = `
    <div class="pd-hero-main pd-hero-main--mb" style="display:flex;flex-direction:column;gap:11px;position:relative">
      <div class="pd-hero-row" style="display:flex;align-items:center;gap:12px">
        ${_pdPhotoWrap(pmPhotoSz+8, photoBorder.replace(`${pmPhotoSz+14}px`,`${pmPhotoSz+8}px`).replace(`${pmPhotoSz+14}px`,`${pmPhotoSz+8}px`))}
        <div class="pd-hero-meta" style="min-width:0;flex:1">
          <div class="pd-hero-name${_pdNameClass}" style="font-size:${pmNameFs+1}px;font-weight:1000;color:#fff;text-shadow:0 1px 8px rgba(0,0,0,.22);line-height:1.2;word-break:keep-all;margin-bottom:6px">${pNameSafe}${genderIcon(p.gender)}</div>
          <div style="display:flex;align-items:center;gap:5px;flex-wrap:wrap;margin-bottom:5px">
            ${p.role?getRoleBadgeHTML(p.role,'10px'):''}${tierRaceBadge}
          </div>
          <div style="display:flex;align-items:center;gap:5px;flex-wrap:wrap;margin-bottom:5px">
            ${_levelBadgeHTML}
          </div>
          <div style="display:flex;align-items:center;gap:5px;flex-wrap:wrap">
            ${univBadge}${channelHTML}
          </div>
        </div>
      </div>
      ${eloMobilePanel}
    </div>`;

  return `<div class="pd-hero" data-pd-layout="${layoutMode}" style="background:linear-gradient(180deg,#ffffff,#f8fafc);border:1px solid rgba(148,163,184,.16);border-radius:${pmCardR+6}px;margin-bottom:16px;overflow:hidden;box-shadow:0 20px 52px rgba(15,23,42,.12),0 4px 16px rgba(15,23,42,.06)">
    <div class="pd-hero-top${_pdHeroFxClass}" style="background:${hdrBg};padding:${pmHdrPad};position:relative;overflow:hidden">
      ${bgLayerHTML}
      ${noiseOverlay}
      <div style="position:absolute;inset:0;background:linear-gradient(145deg,rgba(15,23,42,.06),rgba(15,23,42,.26));pointer-events:none"></div>
      <div style="position:absolute;top:-32px;right:-28px;width:140px;height:140px;border-radius:50%;background:rgba(255,255,255,.08);pointer-events:none"></div>
      <div style="position:absolute;bottom:-48px;left:8%;width:120px;height:120px;border-radius:50%;background:rgba(255,255,255,.05);pointer-events:none"></div>
      <div style="position:absolute;top:50%;left:-20px;transform:translateY(-50%);width:60px;height:120px;border-radius:50%;background:rgba(255,255,255,.04);pointer-events:none"></div>
      ${_isMobile ? hdrContent_MB : hdrContent_PC}
    </div>
    ${quickRail}
    ${statsBlock}
  </div>`;
}

function buildPlayerSummaryStripHTML(opts){
  const { histAll=[], player, cWin='#dc2626', cLoss='#2563eb' } = opts || {};
  const p = player;
  if(!p) return '';
  const hist = histAll.slice();
  let streak = 0, streakType = '';
  for(const h of hist){
    if(streak===0){ streak=1; streakType=h.result; }
    else if(h.result===streakType) streak++;
    else break;
  }
  const isWinStreak = streakType==='승';
  const streakBg = isWinStreak ? 'linear-gradient(135deg,#dcfce7,#bbf7d0)' : 'linear-gradient(135deg,#fee2e2,#fecaca)';
  const streakCol = isWinStreak ? cWin : cLoss;
  const streakBd = isWinStreak ? '#86efac' : '#fca5a5';
  const streakHTML = streak>=2
    ? `<span style="font-size:var(--fs-caption);font-weight:900;padding:4px 11px;border-radius:99px;background:${streakBg};color:${streakCol};border:1.5px solid ${streakBd};box-shadow:0 2px 8px ${streakCol}28">${streak}연${streakType}</span>`
    : '';
  const allRanked=[...players].filter(q=>!q.retired).sort((a,b)=>(b.points||0)-(a.points||0)||(b.win||0)-(a.win||0));
  const myRank = allRanked.findIndex(q=>q.name===p.name)+1;
  const rankChange = typeof getRankChangeBadge==='function' ? getRankChangeBadge(p.name, myRank) : '';
  const rankHTML = myRank ? `<span style="font-size:var(--fs-caption);font-weight:900;color:var(--text2,#334155);display:inline-flex;align-items:center;gap:4px"><span style="color:var(--text3)">전체</span> ${myRank}위</span> ${rankChange}` : '';
  let mvpHTML = '';
  try{
    if(typeof _b2EnsureMvpHistoryFresh==='function') _b2EnsureMvpHistoryFresh(true);
    const mvpStats = (typeof _b2GetPlayerMvpStats==='function') ? _b2GetPlayerMvpStats(p.name) : null;
    if(mvpStats && (mvpStats.weekCount || mvpStats.monthCount)){
      const parts=[];
      if(mvpStats.weekCount) parts.push(`주간 ${mvpStats.weekCount}회`);
      if(mvpStats.monthCount) parts.push(`월간 ${mvpStats.monthCount}회`);
      mvpHTML = `<span style="font-size:var(--fs-caption);font-weight:900;padding:4px 11px;border-radius:99px;background:linear-gradient(135deg,#fef9c3,#fde68a);color:#b45309;border:1.5px solid #fcd34d;box-shadow:0 2px 8px rgba(217,119,6,.16);display:inline-flex;align-items:center;gap:4px">MVP ${parts.join(' · ')}</span>`;
    }
  }catch(e){}
  const recent10 = hist.slice(0,10);
  const formHTML = recent10.length>=3 ? `<div style="display:flex;gap:3px;align-items:center">
    ${recent10.map(h=>`<span style="width:13px;height:13px;border-radius:50%;background:${h.result==='승'?cWin:(h.result==='무'?'#94a3b8':cLoss)};display:inline-block;flex-shrink:0;box-shadow:0 1px 4px rgba(0,0,0,.12)" title="${h.result} vs ${h.opp||''}"></span>`).join('')}
    <span style="font-size:10px;color:var(--gray-l);margin-left:4px;font-weight:700">최근${recent10.length}</span>
  </div>` : '';
  if(!(streakHTML||rankHTML||formHTML||mvpHTML)) return '';
  return `<div class="pd-strip" style="background:linear-gradient(135deg,#ffffff,#f8fafc);border:1px solid rgba(148,163,184,.15);border-radius:var(--r2);padding:11px 14px;margin-bottom:10px;box-shadow:0 6px 18px rgba(15,23,42,.04)">
    <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
      ${rankHTML}${mvpHTML}${streakHTML}${formHTML}
    </div>
  </div>`;
}

try{
  _bindPlayerHeaderDelegatedEvents();
  window.buildPlayerHeaderCardHTML = buildPlayerHeaderCardHTML;
  window.buildPlayerSummaryStripHTML = buildPlayerSummaryStripHTML;
}catch(e){}
