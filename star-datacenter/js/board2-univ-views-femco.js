// board2-univ-views.js에서 분리됨 (펨코스타일 뷰 + 스트리머 신규 등록) — 원본 라인 557-1345

function _b2FemcoView() {
  // ─────────────────────────────────────────────────────────────
  // 펨코현황 설정(단일 소스)
  // - settings.js의 _cfgFemcoDefaults/_cfgFemcoLoad/_cfgFemcoSave를 사용
  // - board2.js 내부 중복 defaults/load/save 제거(불일치 버그 방지)
  // ─────────────────────────────────────────────────────────────
  const femcoFallback = () => ({
    autoLayout: 1, logoSize: 150, logoPos: 'top', logoAttachTitle: 1, headGap: 10,
    logoOffsetX: 0, logoOffsetY: 0,
    titleSize: 28, titleFont: 'system', titlePos: 'top',
    titleOffsetX: 0, titleOffsetY: 0,
    playerImgSize: 76, playerImgShape: 'square',
    rowsPerCol: 5, colWidth: 170, colGap: 10, univGap: 18,
    countFontSize: 12, contentPadX: 16, contentAlign: 'left', contentOffsetX: 0,
    univSubtitles: {}, subtitleSize: 12, subtitleWeight: 800, subtitleColor: '',
    nameFontSize: 18, roleFontSize: 10, tierBadgeSize: 10, tierBadgePadX: 6,
    starSize: 15, statusIconSize: 18,
    bgOverlay: 0,
    univColorOverrides: {}, univBgMedia: {}
  });
  let femcoSettings = (typeof window._cfgFemcoLoad === 'function')
    ? window._cfgFemcoLoad()
    : (function(){ try{ return JSON.parse(localStorage.getItem('b2_femco_settings_v1')||'null') || femcoFallback(); }catch(e){ return femcoFallback(); } })();
  // 펨코현황 관련 설정 UI는 "설정 탭 > 이미지 관리 > 펨코현황"에서만 제공합니다.

  // 배경 미디어 열기(영상은 모달, 유튜브/트위치는 새창)
  // [FIX-FEMCO-3] 매 렌더마다 최신 설정 캡처하도록 항상 재할당
  window._b2FemcoOpenBgMedia = function(univName, url){
      const u = String(univName||'');
      const link = String(url||'').trim();
      if(!link) return;
      const low = link.toLowerCase();
      const isVideo = /\.(mp4|webm|ogg)(\?|#|$)/i.test(low);
      const isEmbed = /(youtube\.com|youtu\.be|twitch\.tv)/i.test(low);
      if(isEmbed){
        try{ window.open(link, '_blank', 'noopener'); }catch(e){ location.href = link; }
        return;
      }
      if(!isVideo){
        // 이미지/GIF는 새창
        try{ window.open(link, '_blank', 'noopener'); }catch(e){ location.href = link; }
        return;
      }
      // video modal (클릭 재생 정책)
      const existing = document.getElementById('b2-femco-bg-modal');
      if (existing) existing.remove();
      const ov = document.createElement('div');
      ov.id = 'b2-femco-bg-modal';
      ov.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.60);z-index:var(--z-modal-5);display:flex;align-items:center;justify-content:center;padding:16px';
      const safeTitle = (u||'영상').replace(/</g,'&lt;').replace(/>/g,'&gt;');
      ov.innerHTML = `
        <div style="width:min(980px,96vw);background:var(--white);border-radius:var(--r2);overflow:hidden;border:1px solid rgba(255,255,255,.16);box-shadow:0 18px 60px rgba(0,0,0,.35)">
          <div style="display:flex;align-items:center;gap:10px;padding:12px 14px;background:linear-gradient(to bottom, rgba(255,255,255,.95), rgba(255,255,255,.85));border-bottom:1px solid var(--border)">
            <div style="font-weight:1000;color:var(--text2)">🎞️ ${safeTitle} 배경 영상</div>
            <span style="color:var(--gray-l);font-size:var(--fs-sm)">클릭해서 재생됩니다</span>
            <button style="margin-left:auto;border:1px solid var(--border);background:var(--surface);border-radius:var(--r);padding:6px 10px;cursor:pointer;font-weight:1000" onclick="document.getElementById('b2-femco-bg-modal')?.remove()">닫기</button>
          </div>
          <div style="padding:12px 14px">
            <video src="${link}" controls playsinline style="width:100%;max-height:72vh;border-radius:12px;background:#000"></video>
          </div>
        </div>
      `;
      ov.addEventListener('click', (e)=>{ if(e.target===ov) ov.remove(); });
      document.body.appendChild(ov);
  };

  // (요청사항) 무소속도 배경 설정/표시 가능
  const univList = _b2VisUnivs().filter(u => u.name);
  if (!univList.length) return `<div style="text-align:center;color:var(--text3);padding:40px">표시할 대학이 없습니다</div>`;

  // univCfg 순서로 정렬 (없으면 이름순)
  if (typeof univCfg !== 'undefined' && univCfg.length) {
    univList.sort((a, b) => {
      const ia = univCfg.findIndex(u => u.name === a.name);
      const ib = univCfg.findIndex(u => u.name === b.name);
      return (ia >= 0 ? ia : 999) - (ib >= 0 ? ib : 999);
    });
  } else {
    univList.sort((a, b) => (a.name || '').localeCompare(b.name || '', 'ko', {sensitivity:'base'}));
  }

  // 표시 대상 선수(현황판 기준과 동일하게 숨김/은퇴/현황판숨김 제외)
  // [FIX-FEMCO-4] membersByUniv 수집 시 dissolved 선수 제외
  const _femcoDissSet = new Set((typeof univCfg !== 'undefined' ? univCfg : []).filter(u=>u.dissolved).map(u=>String(u.name||'').trim()));
  const membersByUniv = {};
  players.forEach(p => {
    const pu = String(p?.univ||'').trim();
    if(!pu || p.hidden || p.retired || p.hideFromBoard || _femcoDissSet.has(pu)) return;
    (membersByUniv[pu] || (membersByUniv[pu]=[])).push(p);
  });

  // 공통 로고 크기(기본)
  const LOGO = Math.max(60, Math.min(520, parseInt(femcoSettings.logoSize || 150, 10) || 150));
  const LOGO_OFF_X = Math.max(-120, Math.min(120, parseInt(femcoSettings.logoOffsetX ?? 0, 10) || 0));
  const LOGO_OFF_Y = Math.max(-120, Math.min(120, parseInt(femcoSettings.logoOffsetY ?? 0, 10) || 0));
  const TITLE_OFF_X = Math.max(-120, Math.min(120, parseInt(femcoSettings.titleOffsetX ?? 0, 10) || 0));
  const TITLE_OFF_Y = Math.max(-120, Math.min(120, parseInt(femcoSettings.titleOffsetY ?? 0, 10) || 0));
  const BG_OVERLAY = Math.max(0, Math.min(70, parseInt(femcoSettings.bgOverlay ?? 0, 10))); // [FIX-FEMCO-1] bgOverlay=0 올바르게 처리
  const OV_TOP = (BG_OVERLAY/70) * 0.22; // 0 → 0.22
  const OV_BOT = (BG_OVERLAY/70) * 0.52; // 0 → 0.52
  const titleSize = Math.max(16, Math.min(44, parseInt(femcoSettings.titleSize || 28, 10) || 28));
  const playerImgSize = Math.max(28, Math.min(160, parseInt(femcoSettings.playerImgSize || 64, 10) || 64));
  const playerRadius = ({
    sharp: '0px',
    roundedsm: '6px',
    square: '10px',
    roundedlg: '22px',
    roundedxl: '34px',
    circle: '50%'
  })[femcoSettings.playerImgShape] || '10px';
  const rowsPerCol = Math.max(2, Math.min(12, parseInt(femcoSettings.rowsPerCol || 5, 10) || 5));
  const colWidth = Math.max(80, Math.min(360, parseInt(femcoSettings.colWidth || 170, 10) || 170));
  const rowGap = Math.max(0, Math.min(28, parseInt(femcoSettings.colGap || 10, 10) || 10)); // UI에서 '상하 간격'
  const colGap = 10; // 가로(컬럼) 간격은 고정(너무 벌어지지 않게)
  const univGap = Math.max(0, Math.min(120, parseInt(femcoSettings.univGap || 18, 10) || 18));
  const countFontSize = Math.max(10, Math.min(18, parseInt(femcoSettings.countFontSize || 12, 10) || 12));
  const contentPadX = Math.max(0, Math.min(40, parseInt(femcoSettings.contentPadX || 16, 10) || 16));
  const contentAlign = (femcoSettings.contentAlign === 'left' || femcoSettings.contentAlign === 'center') ? femcoSettings.contentAlign : 'left';
  const contentOffsetX = Math.max(-40, Math.min(40, parseInt(femcoSettings.contentOffsetX || 0, 10) || 0));
  const headGap = Math.max(0, Math.min(80, parseInt(femcoSettings.headGap || 10, 10) || 10));
  const autoLayout = !(femcoSettings.autoLayout === 0 || femcoSettings.autoLayout === false);
  const vw = (typeof window !== 'undefined') ? (document.documentElement.clientWidth || window.innerWidth || 1280) : 1280; // [FIX-VW] clientWidth 우선, fallback 통일

  const _padL = Math.max(0, Math.min(80, contentPadX + contentOffsetX));
  const _padR = Math.max(0, Math.min(80, contentPadX - contentOffsetX));

  function _autoLayoutForCount(cnt){
    // 인원수 + 화면폭 기준으로 "좌측부터 보기 좋은" 기본값 산출
    let rows = 5;
    if (cnt >= 55) rows = 9;
    else if (cnt >= 45) rows = 8;
    else if (cnt >= 35) rows = 7;
    else if (cnt >= 25) rows = 6;
    else rows = 5;

    let cw = 175;
    if (vw <= 520) { rows = Math.max(rows, 8); cw = 150; }
    else if (vw <= 768) { rows = Math.max(rows, 7); cw = 160; }
    else if (vw <= 1024) { rows = Math.max(rows, 6); cw = 170; }
    else { cw = (cnt >= 45) ? 160 : 175; }

    rows = Math.max(4, Math.min(12, rows));
    cw = Math.max(130, Math.min(220, cw));
    return {rowsPerCol: rows, colWidth: cw};
  }
  const subtitleSize = Math.max(10, Math.min(24, parseInt(femcoSettings.subtitleSize || 12, 10) || 12));
  const subtitleWeight = [400,500,600,700,800,900].includes(parseInt(femcoSettings.subtitleWeight||800,10)) ? parseInt(femcoSettings.subtitleWeight||800,10) : 800;
  const subtitleColor = (typeof femcoSettings.subtitleColor === 'string') ? femcoSettings.subtitleColor : '';
  const nameFontSize = Math.max(10, Math.min(28, parseInt(femcoSettings.nameFontSize || 16, 10) || 16));
  const roleFontSize = Math.max(9, Math.min(16, parseInt(femcoSettings.roleFontSize || 10, 10) || 10));
  const tierBadgeSize = Math.max(9, Math.min(16, parseInt(femcoSettings.tierBadgeSize || 10, 10) || 10));
  const tierBadgePadX = Math.max(4, Math.min(12, parseInt(femcoSettings.tierBadgePadX || 6, 10) || 6));
  const starSize = Math.max(10, Math.min(28, parseInt(femcoSettings.starSize || 15, 10) || 15));
  const titleFontFamily = (() => {
    switch (femcoSettings.titleFont) {
      case 'app': return `var(--app-font)`;
      case 'noto': return `'Noto Sans KR', system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif`;
      case 'pretendard': return `'Pretendard Variable', Pretendard, system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif`;
      case 'nanum': return `'Nanum Gothic', 'Noto Sans KR', system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif`;
      case 'gmarket': return `'GmarketSans', 'Noto Sans KR', system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif`;
      default: return `system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif`;
    }
  })();

  // 타이틀 폰트가 CDN 폰트인 경우, 필요한 CSS를 1회 주입(전역 폰트와 별개)
  (function(){
    const head = document.head || document.getElementsByTagName('head')[0];
    if(!head) return;
    const ensure = (id, href) => {
      if(!href){ const el=document.getElementById(id); if(el) el.remove(); return; }
      let el=document.getElementById(id);
      if(!el){ el=document.createElement('link'); el.id=id; el.rel='stylesheet'; head.appendChild(el); }
      el.href=href;
    };
    const cssMap = {
      noto: 'https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;700;900&display=swap',
      pretendard: 'https://cdn.jsdelivr.net/gh/orioncactus/pretendard@latest/dist/web/variable/pretendardvariable.css',
      nanum: 'https://fonts.googleapis.com/css2?family=Nanum+Gothic:wght@400;700;800&display=swap',
      gmarket: 'https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_2001@1.1/GmarketSans.css',
    };
    const key = femcoSettings.titleFont;
    ensure('femco-titlefont-css', cssMap[key] || '');
  })();

  const tierRank = (p) => {
    const t = p.tier || '';
    const i = (typeof TIERS !== 'undefined' && TIERS.includes(t)) ? TIERS.indexOf(t) : 999;
    return i >= 0 ? i : 999;
  };

  const rolePri = (p) => {
    if (p && typeof p.roleOrder === 'number' && !isNaN(p.roleOrder)) return p.roleOrder;
    const r = (p.role || '').trim();
    const order = ['이사장', '총장', '교수', '코치'];
    const i = order.indexOf(r);
    if (i >= 0) return i;
    if (r) {
      // 부총장이 총장의 부분 문자열이므로 긴 키워드부터 검사
      for (const key of [...order].sort((a,b)=>b.length-a.length)) {
        if (r.includes(key)) return order.indexOf(key);
      }
    }
    return 99;
  };

  // (요청) 종족 표기: T / P / Z
  const raceLabel = (p) => p.race === 'P' ? 'P' : p.race === 'T' ? 'T' : p.race === 'Z' ? 'Z' : '?';
  // 종족 색상: 기본 팔레트 + 대학색상(col)과 살짝 블렌딩(대학마다 다르게 보이도록)
  // + 흰 배경(라벨 pill)에서 잘 보이도록 최소 대비 확보
  const _hexToRgb = (hex) => {
    const h = String(hex||'').replace('#','').trim();
    if(h.length < 6) return null;
    const r = parseInt(h.slice(0,2),16), g = parseInt(h.slice(2,4),16), b = parseInt(h.slice(4,6),16);
    if([r,g,b].some(v=>Number.isNaN(v))) return null;
    return {r,g,b};
  };
  const _rgbToHex = (r,g,b) => '#' + [r,g,b].map(v=>Math.max(0,Math.min(255,Math.round(v))).toString(16).padStart(2,'0')).join('');
  const _mixHex = (a,b,t) => {
    const A=_hexToRgb(a), B=_hexToRgb(b);
    if(!A||!B) return a || b || '#94a3b8';
    const tt=Math.max(0,Math.min(1, +t||0));
    return _rgbToHex(A.r*(1-tt)+B.r*tt, A.g*(1-tt)+B.g*tt, A.b*(1-tt)+B.b*tt);
  };
  const _relLum = (hex) => {
    const c=_hexToRgb(hex); if(!c) return 0;
    const f = (v)=>{ v/=255; return v<=0.03928? v/12.92 : Math.pow((v+0.055)/1.055, 2.4); };
    const R=f(c.r), G=f(c.g), B=f(c.b);
    return 0.2126*R + 0.7152*G + 0.0722*B;
  };
  const _contrast = (a,b) => {
    const L1=_relLum(a), L2=_relLum(b);
    const hi=Math.max(L1,L2), lo=Math.min(L1,L2);
    return (hi+0.05)/(lo+0.05);
  };
  const _ensureOnWhite = (hex, min=3.0) => {
    let c = hex || '#94a3b8';
    // 흰색 배경 기준 대비가 부족하면 점점 어둡게(검정쪽으로 블렌딩)
    if(_contrast(c,'#ffffff') >= min) return c;
    const steps=[0.25,0.40,0.55,0.70];
    for(const t of steps){
      const d = _mixHex(c, '#0f172a', t);
      if(_contrast(d,'#ffffff') >= min) return d;
    }
    return _mixHex(c, '#0f172a', 0.75);
  };
  const raceColor = (p, univCol) => {
    const base = p.race === 'P' ? '#c084fc' : p.race === 'T' ? '#38bdf8' : p.race === 'Z' ? '#34d399' : '#94a3b8';
    const themed = univCol ? _mixHex(base, univCol, 0.22) : base;
    return _ensureOnWhite(themed, 3.0);
  };

  function femcoAvatarSquare(p, accent) {
    const img = (p && p.photo) ? toThumbUrl(String(p.photo), playerImgSize) : '';
    const imgOrig = (p && p.photo) ? toHttpsUrl(String(p.photo)) : '';
    const letter = (p && p.name) ? String(p.name).slice(0, 1) : '?';
    const border = `${accent}55`;
    // 상태 아이콘(10시 방향) — 기존 상태 아이콘 시스템 재사용
    let badge = '';
    try{
      const _rawIcon = getStatusIcon(p.name);
      const statusHtml = getStatusIconHTML(p.name);
      const s = playerImgSize;
      // [FIX-FEMCO-2] statusIconSize=0이면 아이콘 숨김
      const _rawIconSize = parseInt(femcoSettings.statusIconSize ?? 18, 10);
      const badgeSize = _rawIconSize === 0 ? 0 : Math.max(10, Math.min(36, _rawIconSize || Math.round(s * 0.38)));
      const _isImgIcon = _rawIcon && (typeof _siIsImg === 'function' ? _siIsImg(_rawIcon) : false);
      const _badgeInner = _isImgIcon
        ? `<img src="${_rawIcon}" style="width:${badgeSize}px;height:${badgeSize}px;border-radius:50%;object-fit:cover;opacity:.86" onerror="this.style.display='none'">`
        : (statusHtml ? statusHtml.replace(/margin-left:[^;]+;/g,'').replace(/font-size:[^;]+;/g,'') : '');
      const _badgeBg = _isImgIcon ? 'rgba(255,255,255,.72)' : 'transparent';
      // 10시 방향(좌상단)
      const _bTop = -Math.round(badgeSize * 0.26);
      const _bLeft = -Math.round(badgeSize * 0.26);
      badge = statusHtml
        ? `<span style="position:absolute;top:${_bTop}px;left:${_bLeft}px;width:${badgeSize}px;height:${badgeSize}px;border-radius:50%;background:${_badgeBg};overflow:hidden;display:flex;align-items:center;justify-content:center;font-size:${Math.round(badgeSize*0.82)}px;line-height:1;filter:drop-shadow(0 1px 2px rgba(0,0,0,.65))">${_badgeInner}</span>`
        : '';
    }catch(e){
      console.warn('[femcoAvatarSquare] 상태 아이콘 생성 실패:', e.message);
    }

    // 이미지2(두번째 프로필) 호버 스크럽 미리보기 — 프로필탭 그리드 카드와 동일한 방식(PC 마우스 전용)
    const _femcoSecondRaw = (p && p.secondProfileFile) ? String(p.secondProfileFile).trim() : '';
    const _femcoSecondIsVideo = /\.(mp4|webm|ogg|mov|m4v)(\?|$)/i.test(_femcoSecondRaw);
    const femcoSecondPhoto = (_femcoSecondRaw && !_femcoSecondIsVideo) ? _femcoSecondRaw : '';
    const _femcoSecondIsGif = /\.gif(\?|$)/i.test(_femcoSecondRaw);
    const femcoSecondSrc = femcoSecondPhoto ? (_femcoSecondIsGif ? toHttpsUrl(femcoSecondPhoto) : toThumbUrl(femcoSecondPhoto, playerImgSize)) : '';
    const femcoSecondHtml = femcoSecondPhoto
      ? `<img class="b2-players-card-secondary" src="${femcoSecondSrc}" data-orig="${toHttpsUrl(femcoSecondPhoto)}" loading="lazy" decoding="async" alt="" style="border-radius:inherit;z-index:0" onerror="if(this.dataset.orig&&this.src!==this.dataset.orig){this.src=this.dataset.orig;}else{this.remove()}">`
      : '';

    if (img) {
      return `<span style="position:relative;display:block;width:100%;height:100%">
        <img src="${img}" data-orig="${imgOrig}" decoding="async" fetchpriority="high" style="width:100%;height:100%;object-fit:cover;border-radius:inherit;border:2px solid ${border};background:rgba(255,255,255,.25)" onerror="if(this.dataset.orig&&this.src!==this.dataset.orig){this.src=this.dataset.orig;}else{this.closest('span').outerHTML='<div style=&quot;position:relative;width:100%;height:100%;border-radius:inherit;background:${accent};display:flex;align-items:center;justify-content:center;font-weight:1000;font-size:22px;color:#fff;border:2px solid ${border}&quot;>${letter}</div>'}">
        ${femcoSecondHtml}
        ${badge}
      </span>`;
    }
    return `<div style="position:relative;width:100%;height:100%;border-radius:inherit;background:${accent};display:flex;align-items:center;justify-content:center;font-weight:1000;font-size:22px;color:#fff;border:2px solid ${border}">${letter}${femcoSecondHtml}${badge}</div>`;
  }

  let h = `
    <style>
      .b2-femco-wrap{display:flex;flex-direction:column;gap:${univGap}px}
      .b2-femco-univ{border-radius:22px;overflow:hidden;box-shadow:0 4px 28px rgba(0,0,0,.14);transition:background-color .35s ease, box-shadow .35s ease, transform .22s ease}
      .b2-femco-univ:hover{transform:translateY(-2px);box-shadow:0 10px 36px rgba(0,0,0,.20)}
      .b2-femco-head{padding:16px 16px 12px;text-align:center;position:relative}
      .b2-femco-headrow{display:flex;align-items:center;justify-content:center;gap:12px;flex-wrap:wrap}
      .b2-femco-headcol{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:${headGap}px}
      .b2-femco-logo{display:flex;justify-content:center;margin-bottom:0}
      .b2-femco-title-row{display:flex;align-items:center;gap:6px;justify-content:center}
      .b2-femco-title{font-weight:1000;font-size:${titleSize}px;letter-spacing:-.04em;line-height:1.1;font-family:${titleFontFamily}}
      .b2-femco-stars{display:inline-flex;gap:1px;align-items:center;opacity:.95}
      .b2-femco-stars span{font-size:${starSize}px;line-height:1}
      .b2-femco-subtitle{margin-top:6px;font-size:${subtitleSize}px;font-weight:${subtitleWeight};line-height:1.2;opacity:.95}
      /* 인원수: 좌측 상단 고정 (배경 없음) */
      .b2-femco-countbox{
        position:absolute;top:10px;left:10px;
        display:flex;flex-direction:column;gap:2px;align-items:flex-start;justify-content:flex-start;
        padding:0;border-radius:0;background:transparent;border:none;color:inherit;
        max-width:45%;
      }
      .b2-femco-countbox div{font-size:${countFontSize}px;font-weight:1000;line-height:1.15;white-space:nowrap}
      .b2-femco-meta{margin-top:6px;display:flex;justify-content:center;gap:8px;flex-wrap:wrap}
      .b2-femco-pill{font-size:var(--fs-sm);font-weight:1000;padding:3px 10px;border-radius:999px;border:1px solid rgba(255,255,255,.55);background:rgba(255,255,255,.16)}
      .b2-femco-body{padding:12px 12px 16px}
      .b2-femco-group{margin-top:10px}
      .b2-femco-group:first-child{margin-top:0}
      .b2-femco-ghead{display:flex;align-items:center;gap:8px;margin:0 0 8px}
      .b2-femco-glabel{font-size:var(--fs-sm);font-weight:1000;background:rgba(255,255,255,.78);border:1px solid rgba(0,0,0,.10);padding:3px 10px;border-radius:999px}
      .b2-femco-gcount{font-size:var(--fs-caption);font-weight:900;opacity:.85}

      /* ✅ 배치 규칙(요구사항)
         - 1번(첫 컬럼) 위→아래로 5명 채움
         - 5명 되면 우측(다음 컬럼) 1번으로 다시 위→아래로 5명
      */
      .b2-femco-grid{
        display:grid;
        --rowsPerCol:${rowsPerCol};
        --colWidth:${colWidth}px;
        column-gap:${colGap}px;
        row-gap:${rowGap}px;
        grid-auto-flow:column;
        grid-template-rows:repeat(var(--rowsPerCol), minmax(0, auto));
        grid-auto-columns:var(--colWidth);
        overflow-x:auto;
        padding-bottom:6px;
        scrollbar-width:none;
        justify-content:flex-start;
      }
      .b2-femco-grid::-webkit-scrollbar{height:0}

      /* 스트리머 항목(카드형식X): 프로필(네모, 작게) + 우측 텍스트 4줄 */
      /* 카드 느낌 제거: 배경/테두리 최소화 */
      .b2-femco-item{display:flex!important;flex-direction:row!important;align-items:center;gap:10px;padding:8px 10px;border-radius:14px;cursor:pointer;min-width:0;transition:background .15s,transform .18s cubic-bezier(.34,1.56,.64,1),box-shadow .15s;justify-self:start;width:fit-content;max-width:100%}
      .b2-femco-item:hover{background:rgba(255,255,255,.20);transform:translateY(-2px);box-shadow:0 6px 16px rgba(0,0,0,.14)}
      .b2-femco-avatar{width:${playerImgSize}px;height:${playerImgSize}px;border-radius:${playerRadius};overflow:hidden;flex-shrink:0;position:relative}
      .b2-femco-text{display:flex!important;flex-direction:column!important;align-items:flex-start!important;text-align:left!important;gap:2px;min-width:0}
      .b2-femco-tier{font-size:10px;font-weight:1000;display:inline-flex;align-items:center;gap:4px}
      .b2-femco-tierbadge{font-size:${tierBadgeSize}px;padding:2px ${tierBadgePadX}px;border-radius:999px;border:1px solid rgba(0,0,0,.12);display:inline-flex;align-items:center;line-height:1}
      .b2-femco-role{font-size:${roleFontSize}px;font-weight:1000;opacity:.9}
      .b2-femco-name{font-size:${nameFontSize}px;font-weight:1000;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .b2-femco-race-pill{display:inline-flex;align-items:center;gap:4px;font-size:10px;font-weight:1000;padding:1px 6px;border-radius:999px;background:rgba(255,255,255,.85);border:1px solid rgba(0,0,0,.10)}

      @media(max-width:520px){ .b2-femco-title{font-size:20px} }
    </style>
    <div class="b2-femco-wrap">
  `;


  univList.forEach(u => {
    const univName = u.name;
    const all = (membersByUniv[univName] || []);
    if (!all.length) return;

    const overrideCol = (femcoSettings.univColorOverrides || {})[univName];
    const col = overrideCol || gc(univName);
    const textCol = _b2ContrastColor(col);
    const uCfg = (typeof univCfg !== 'undefined' ? univCfg.find(x => x.name === univName) : null) || {};
    // 대학별 로고 크기(옵션): univCfg[i].logoSizeFemco 가 있으면 우선 적용
    const _uLogo = (() => {
      const v = parseInt(uCfg.logoSizeFemco || '', 10);
      if (!isNaN(v) && v > 0) return Math.max(60, Math.min(520, v));
      return LOGO;
    })();
    const iconUrl = uCfg.icon || uCfg.img || '';
    const logoHtml = iconUrl
      ? `<img src="${toHttpsUrl(iconUrl)}" style="width:${_uLogo}px;height:${_uLogo}px;object-fit:contain" onerror="this.style.display='none'">`
      : `<span style="display:inline-flex;align-items:center;justify-content:center;width:${Math.round(_uLogo*0.62)}px;height:${Math.round(_uLogo*0.62)}px;opacity:.85;font-size:${Math.round(_uLogo*0.48)}px;line-height:1">🏫</span>`;

    // 인원 카운트 규칙:
    // - 이사장 인원
    // - 교수 + 코치 인원
    // - 나머지 학생(=전체 - 위 2개)
    const bossCnt = all.filter(p => (p.role || '').trim() === '이사장').length;
    const profCoachCnt = all.filter(p => ['교수','코치'].includes((p.role || '').trim())).length;
    const studentCnt = Math.max(0, all.length - bossCnt - profCoachCnt);

    // 요구사항: 같은 급끼리 섹션으로 나누지 않고, 단일 리스트에서
    // 이사장 → 총장 → 교수 → 코치 우선순위로 정렬 후 5열 배치
    const list = [...all].sort((a, b) => {
      const ra = rolePri(a), rb = rolePri(b);
      if (ra !== rb) return ra - rb;
      // 같은 직급 내에서는 티어→이름
      const ta = tierRank(a), tb = tierRank(b);
      if (ta !== tb) return ta - tb;
      return (a.name || '').localeCompare(b.name || '', 'ko', {sensitivity:'base'});
    });

    const _subTxt = ((femcoSettings.univSubtitles||{})[univName] || '').trim();
    const _subColor = (subtitleColor && subtitleColor.trim()) ? subtitleColor : textCol;

    // 대학별 배경 미디어
    // [FIX-FEMCO-BG-1] 펨코 전용 배경(univBgMedia)이 따로 설정되지 않았으면
    // 현황판에 설정된 대학 배경(uCfg.bgImg / 로고)을 그대로 가져와 보여준다.
    const _bgRawExplicit = ((femcoSettings.univBgMedia||{})[univName]) || '';
    const _bgRaw = _bgRawExplicit || (uCfg.bgImg ? {
      url: uCfg.bgImg,
      alpha: (uCfg.bgImgAlpha ?? (typeof b2BgImgAlpha!=='undefined' ? b2BgImgAlpha : 64)),
      // [FIX-FEMCO-LOGO-SIZE] 로고형 배경은 contain(카드 가득)이 아니라 작은 비율로 중앙 배치
      sizeMode: uCfg.bgIsLogo ? 'pct' : (uCfg.bgImgSize && uCfg.bgImgSize!=='auto' && uCfg.bgImgSize!=='fill' ? uCfg.bgImgSize : 'cover'),
      sizeVal: uCfg.bgIsLogo ? (parseInt(uCfg.femcoBgLogoPct||'',10) || parseInt(femcoSettings.bgLogoPct||'',10) || 42) : 90,
      pos: 'center',
      repeat: 'no-repeat', ox:0, oy:0,
      __fromBoard: true
    } : '');
    const _bgCfg = (function(){
      const d={url:'',alpha:30,sizeMode:'cover',sizeVal:90,pos:'center',repeat:'no-repeat',ox:0,oy:0};
      if(!_bgRaw) return d;
      if(typeof _bgRaw==='string') return {...d,url:String(_bgRaw).trim()};
      if(typeof _bgRaw==='object') return {...d,..._bgRaw,url:String(_bgRaw.url||'').trim()};
      return d;
    })();
    // [FEMCO-BG-SIZE] 설정탭 > 펨코스타일 > 배경 크기(공통/대학별) 적용
    (function(){
      const uPct = parseInt(uCfg.femcoBgLogoPct||'',10);
      if(!isNaN(uPct) && uPct>0){ _bgCfg.sizeMode='pct'; _bgCfg.sizeVal=uPct; return; }
      const gPct = parseInt(femcoSettings.bgLogoPct||'',10);
      if(!isNaN(gPct) && gPct>0 && _bgCfg.sizeMode==='pct'){ _bgCfg.sizeVal=gPct; }
    })();
    const _bgUrl = (_bgCfg.url||'').trim();
    const _bgLower = _bgUrl.toLowerCase();
    const _bgIsVideo = _bgUrl && /\.(mp4|webm|ogg)(\?|#|$)/i.test(_bgLower);
    const _bgIsEmbed = _bgUrl && /(youtube\.com|youtu\.be|twitch\.tv)/i.test(_bgLower);
    // 이미지 CDN/스토리지 URL은 확장자가 없거나 쿼리 뒤에 숨는 경우가 많다.
    // 명백한 영상/임베드가 아니면 이미지로 취급해야 배경과 오버레이가 함께 적용된다.
    const _bgIsImage = !!(_bgUrl && !_bgIsVideo && !_bgIsEmbed);
    const _bgBtn = (_bgIsVideo || _bgIsEmbed || (_bgUrl && !_bgIsImage))
      ? `<button class="b2-femco-pill no-export" style="cursor:pointer" onclick="_b2FemcoOpenBgMedia('${univName.replace(/'/g,"\\'")}', '${_bgUrl.replace(/'/g,"\\'")}');event.stopPropagation();">${_bgIsVideo?'🎞️ 배경영상':_bgIsEmbed?'🔗 배경링크':'🖼️ 배경링크'}</button>`
      : '';

    const _pos = femcoSettings.logoPos || 'top';
    const _posNorm = (['left','right','top','bottom','center'].includes(_pos) ? _pos : 'top');
    const _attach = (femcoSettings.logoAttachTitle ?? 1) ? true : false;
    const _tpos = femcoSettings.titlePos || 'bottom';
    const _tposNorm = (['left','right','top','bottom'].includes(_tpos) ? _tpos : 'bottom');
    const starsHtml = (uCfg.championships || 0) > 0
      ? `<span class="b2-femco-stars">${'<span>⭐</span>'.repeat(uCfg.championships)}</span>`
      : '';
    const titleBlock = `
      <div style="min-width:220px;transform:translate(${TITLE_OFF_X}px,${TITLE_OFF_Y}px)">
        <div class="b2-femco-title-row">
          <div class="b2-femco-title">${univName}</div>
          ${starsHtml}
        </div>
        ${_subTxt?`<div class="b2-femco-subtitle" style="color:${_subColor}">${_subTxt}</div>`:''}
        ${_bgBtn?`<div class="b2-femco-meta">${_bgBtn}</div>`:''}
      </div>
    `;
    const logoOnlyStyle = (() => {
      if (_attach) return '';
      const pad = contentPadX;
      if (_posNorm === 'left') return `position:absolute;left:${pad}px;top:50%;transform:translateY(-50%) translate(${LOGO_OFF_X}px,${LOGO_OFF_Y}px);`;
      if (_posNorm === 'right') return `position:absolute;right:${pad}px;top:50%;transform:translateY(-50%) translate(${LOGO_OFF_X}px,${LOGO_OFF_Y}px);`;
      if (_posNorm === 'bottom') return `position:absolute;left:50%;bottom:10px;transform:translateX(-50%) translate(${LOGO_OFF_X}px,${LOGO_OFF_Y}px);`;
      // top / center
      return `position:absolute;left:50%;top:10px;transform:translateX(-50%) translate(${LOGO_OFF_X}px,${LOGO_OFF_Y}px);`;
    })();

    const headLayout = (() => {
      if (!_attach) {
        // 로고만 이동일 때 제목과 겹치지 않도록 좌/우는 공간을 예약
        const reserve = Math.max(0, Math.round(_uLogo * 0.55) + 16);
        const padL = (_posNorm === 'left') ? reserve : 0;
        const padR = (_posNorm === 'right') ? reserve : 0;
        return `
          <div class="b2-femco-headrow" style="padding-left:${padL}px;padding-right:${padR}px">
            <div class="b2-femco-logo" style="${logoOnlyStyle}">${logoHtml}</div>
            ${titleBlock}
          </div>
        `;
      }
      // 로고 + 대학명이 같이 이동
      const _alignStyle = (_posNorm === 'left')
        ? 'justify-content:flex-start'
        : (_posNorm === 'right') ? 'justify-content:flex-end' : 'justify-content:center';
      const _logoEl = `<div class="b2-femco-logo" style="transform:translate(${LOGO_OFF_X}px,${LOGO_OFF_Y}px)">${logoHtml}</div>`;
      if (_tposNorm === 'left') {
        return `<div class="b2-femco-headrow" style="${_alignStyle}">${titleBlock}${_logoEl}</div>`;
      }
      if (_tposNorm === 'right') {
        return `<div class="b2-femco-headrow" style="${_alignStyle}">${_logoEl}${titleBlock}</div>`;
      }
      if (_tposNorm === 'top') {
        return `<div class="b2-femco-headcol" style="${_alignStyle}">${titleBlock}${_logoEl}</div>`;
      }
      // bottom (default)
      return `<div class="b2-femco-headcol" style="${_alignStyle}">${_logoEl}${titleBlock}</div>`;
    })();

    // 자동 레이아웃(인원수/화면폭)에 따라 대학별로 rows/colWidth를 다르게 적용
    const _lay = autoLayout ? _autoLayoutForCount(all.length) : {rowsPerCol, colWidth};

    const _posToXY = (p)=>{
      const t = String(p||'center');
      const m = {
        'center':[50,50],'top':[50,0],'bottom':[50,100],'left':[0,50],'right':[100,50],
        'top left':[0,0],'top right':[100,0],'bottom left':[0,100],'bottom right':[100,100]
      };
      return m[t] || [50,50];
    };
    const [px,py]=_posToXY(_bgCfg.pos);
    const ox = parseInt(_bgCfg.ox||0,10)||0;
    const oy = parseInt(_bgCfg.oy||0,10)||0;
    const _bgPos = `calc(${px}% + ${ox}px) calc(${py}% + ${oy}px)`;
    let _bgSize = 'cover';
    if(_bgCfg.sizeMode==='contain') _bgSize='contain';
    else if(_bgCfg.sizeMode==='pct') _bgSize=`${Math.max(10,Math.min(220,parseInt(_bgCfg.sizeVal||90,10)||90))}%`;
    else if(_bgCfg.sizeMode==='px') _bgSize=`${Math.max(30,Math.min(900,parseInt(_bgCfg.sizeVal||240,10)||240))}px`;
    const _bgAlpha = Math.max(0, Math.min(100, parseInt(_bgCfg.alpha||30,10)||0)) / 100;
    const _bgRepeat = ['no-repeat','repeat','repeat-x','repeat-y'].includes(_bgCfg.repeat) ? _bgCfg.repeat : 'no-repeat';

    const _bgLayer = (_bgIsImage && _bgUrl)
      ? `<img src="${toHttpsUrl(_bgUrl).replace(/"/g,'&quot;')}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:${_bgSize};object-position:${_bgPos};opacity:${_bgAlpha.toFixed(3)};pointer-events:none;z-index:0" onerror="this.style.display='none'">`
      : (_bgIsVideo || _bgIsEmbed)
        ? `<div style="position:absolute;inset:0;background-image:url('${_bgUrl.replace(/'/g,"%27")}');background-repeat:${_bgRepeat};background-size:${_bgSize};background-position:${_bgPos};opacity:${_bgAlpha.toFixed(3)};pointer-events:none;z-index:0"></div>`
        : '';
    const _ovLayer = (_bgUrl && !_bgIsVideo && !_bgIsEmbed && BG_OVERLAY>0)
      ? `<div style="position:absolute;inset:0;background:linear-gradient(180deg, rgba(2,6,23,${OV_TOP.toFixed(3)}), rgba(2,6,23,${OV_BOT.toFixed(3)}));pointer-events:none;z-index:1"></div>`
      : '';

    h += `
      <section class="b2-femco-univ" style="position:relative;overflow:hidden;background:${col};">
        ${_bgLayer}${_ovLayer}
        <div class="b2-femco-head" style="position:relative;z-index:2;color:${textCol};padding-left:${_padL}px;padding-right:${_padR}px">
          <div class="b2-femco-countbox" style="color:${textCol};left:${_padL}px;${textCol==='#ffffff'?'text-shadow:0 1px 2px rgba(0,0,0,.45);':''}">
            <div>총 ${all.length}</div>
            <div>이사장 ${bossCnt}</div>
            <div>교수+코치 ${profCoachCnt}</div>
            <div>학생 ${studentCnt}</div>
          </div>
          ${headLayout}
        </div>

        <div class="b2-femco-body" style="position:relative;z-index:2;background:transparent;padding-left:${_padL}px;padding-right:${_padR}px">
          <div class="b2-femco-grid" style="--rowsPerCol:${_lay.rowsPerCol};--colWidth:${_lay.colWidth}px">
            ${list.map(p => {
              const safeName = (p.name || '').replace(/'/g, "\\'");
              const tier = p.tier || '?';
              const tierBg = tier && tier !== '?' ? (typeof getTierBtnColor === 'function' ? getTierBtnColor(tier) : '#64748b') : '#64748b';
              const tierFg = tier && tier !== '?' ? ((typeof getTierBtnTextColor === 'function' ? getTierBtnTextColor(tier) : '#fff') || '#fff') : '#fff';
              const roleLabel = (p.role || '').trim();
              const rcol = raceColor(p, col);
              return `
                <div class="b2-femco-item" onclick="openPlayerModal('${safeName}');event.stopPropagation();">
                  <div class="b2-femco-avatar"${String(p.secondProfileFile||'').trim() ? ` onmousemove="_b2CardHoverScrub(event,this)" onmouseleave="_b2CardHoverLeave(this)"` : ''}>${femcoAvatarSquare(p, rcol)}</div>
                  <div class="b2-femco-text" style="${p.inactive ? 'opacity:.65' : ''};color:${textCol}">
                    <div class="b2-femco-tier">
                      <span class="b2-femco-tierbadge" style="background:${tierBg};color:${tierFg}">${tier}</span>
                    </div>
                    ${roleLabel ? `<div class="b2-femco-role">${roleLabel}</div>` : ''}
                    <div class="b2-femco-name">${p.name || ''}</div>
                    <div><span class="b2-femco-race-pill" style="color:${rcol};border-color:${rcol}88;background:${textCol==='#ffffff'?'rgba(0,0,0,.28)':'rgba(255,255,255,.92)'};box-shadow:0 1px 2px rgba(0,0,0,.18)">${raceLabel(p)}</span></div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </section>
    `;
  });

  h += `</div>`;
  return h;
}

// ─────────────────────────────────────────────────────────────
// ➕ 스트리머 등록(관리자 전용, Players 탭)
// - 저장 시 즉시 반영(save()+render())
// - 저장 후 입력값 초기화 → 연속 등록 가능
// ─────────────────────────────────────────────────────────────
function openB2PlayerCreateModal() {
  if (!isLoggedIn || (typeof isSubAdmin !== 'undefined' && isSubAdmin)) return;
  if (document.getElementById('b2-player-create-modal')) return;

  const univs = (typeof univCfg !== 'undefined' ? univCfg : []).map(u => u.name).filter(Boolean);
  const tierOpts = (typeof TIERS !== 'undefined' && Array.isArray(TIERS) ? TIERS : ['0','1','2','3','4','5','6','7','8','유스']);
  const roleOpts = ['학생','코치','교수','총장','이사장'];

  const modal = document.createElement('div');
  modal.id = 'b2-player-create-modal';
  modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:var(--z-modal-5)';
  modal.innerHTML = `
    <style>
      @media (max-width:480px){
        #b2-player-create-modal > div{ padding:18px 16px calc(18px + env(safe-area-inset-bottom,0px)) !important; width:100% !important; max-width:100% !important; max-height:92vh !important; border-radius:18px !important; }
        #b2-player-create-modal div[style*="grid-template-columns:140px 1fr"]{ grid-template-columns:1fr !important; gap:5px !important; margin-bottom:14px !important; }
        #b2-player-create-modal input, #b2-player-create-modal select{
          font-size:16px !important; min-height:44px !important; padding:10px 12px !important; width:100%; box-sizing:border-box;
        }
      }
    </style>
    <div style="background:var(--white);border-radius:var(--r2);padding:24px;max-width:560px;width:92%;max-height:84vh;overflow-y:auto;box-shadow:0 10px 40px rgba(0,0,0,0.3)">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:18px">
        <h3 style="margin:0;font-size:var(--fs-lg);font-weight:900;color:var(--text1)">🎬 스트리머 등록</h3>
        <button onclick="document.getElementById('b2-player-create-modal').remove()" style="background:none;border:none;font-size:20px;cursor:pointer;color:var(--gray-l)">✕</button>
      </div>

      <div id="b2-newplayer-msg" style="font-size:var(--fs-sm);color:var(--gray-l);margin-bottom:12px">저장 후 자동으로 입력칸이 초기화되어 연속 등록할 수 있습니다.</div>

      <div style="display:grid;grid-template-columns:140px 1fr;gap:10px;align-items:center;margin-bottom:12px">
        <div style="font-size:var(--fs-base);font-weight:800;color:var(--text2)">이름</div>
        <input id="b2-newplayer-name" type="text" placeholder="예: 홍길동" style="padding:8px 12px;border:1px solid var(--border2);border-radius:var(--r);font-size:var(--fs-base)">
      </div>

      <div style="display:grid;grid-template-columns:140px 1fr;gap:10px;align-items:center;margin-bottom:12px">
        <div style="font-size:var(--fs-base);font-weight:800;color:var(--text2)">대학</div>
        <select id="b2-newplayer-univ" style="padding:8px 12px;border:1px solid var(--border2);border-radius:var(--r);font-size:var(--fs-base)">
          <option value="">(선택)</option>
          ${univs.map(u=>`<option value="${u}">${u}</option>`).join('')}
        </select>
      </div>

      <div style="display:grid;grid-template-columns:140px 1fr;gap:10px;align-items:center;margin-bottom:12px">
        <div style="font-size:var(--fs-base);font-weight:800;color:var(--text2)">직급</div>
        <select id="b2-newplayer-role" style="padding:8px 12px;border:1px solid var(--border2);border-radius:var(--r);font-size:var(--fs-base)">
          ${roleOpts.map(r=>`<option value="${r}"${r==='학생'?' selected':''}>${r}</option>`).join('')}
        </select>
      </div>

      <div style="display:grid;grid-template-columns:140px 1fr;gap:10px;align-items:center;margin-bottom:12px">
        <div style="font-size:var(--fs-base);font-weight:800;color:var(--text2)">종족</div>
        <select id="b2-newplayer-race" style="padding:8px 12px;border:1px solid var(--border2);border-radius:var(--r);font-size:var(--fs-base)">
          <option value="P">프로토스</option>
          <option value="T">테란</option>
          <option value="Z">저그</option>
          <option value="N" selected>미정</option>
        </select>
      </div>

      <div style="display:grid;grid-template-columns:140px 1fr;gap:10px;align-items:center;margin-bottom:12px">
        <div style="font-size:var(--fs-base);font-weight:800;color:var(--text2)">티어</div>
        <select id="b2-newplayer-tier" style="padding:8px 12px;border:1px solid var(--border2);border-radius:var(--r);font-size:var(--fs-base)">
          <option value="?" selected>미정</option>
          ${tierOpts.map(t=>`<option value="${t}">${t}</option>`).join('')}
        </select>
      </div>

      <div style="display:grid;grid-template-columns:140px 1fr;gap:10px;align-items:center;margin-bottom:12px">
        <div style="font-size:var(--fs-base);font-weight:800;color:var(--text2)">채널 URL</div>
        <input id="b2-newplayer-channel" type="text" placeholder="https://..." style="padding:8px 12px;border:1px solid var(--border2);border-radius:var(--r);font-size:var(--fs-base)">
      </div>

      <div style="display:grid;grid-template-columns:140px 1fr;gap:10px;align-items:center;margin-bottom:12px">
        <div style="font-size:var(--fs-base);font-weight:800;color:var(--text2)">프로필 이미지 1</div>
        <input id="b2-newplayer-photo" type="text" placeholder="https://... (base64 불가)" style="padding:8px 12px;border:1px solid var(--border2);border-radius:var(--r);font-size:var(--fs-base)">
      </div>

      <div style="display:grid;grid-template-columns:140px 1fr;gap:10px;align-items:center;margin-bottom:4px">
        <div style="font-size:var(--fs-base);font-weight:800;color:var(--text2)">프로필 이미지 2</div>
        <input id="b2-newplayer-photo2" type="text" placeholder="https://... (선택)" style="padding:8px 12px;border:1px solid var(--border2);border-radius:var(--r);font-size:var(--fs-base)">
      </div>
      <div style="font-size:var(--fs-caption);color:var(--gray-l);margin:0 0 14px 150px">※ 2번 이미지는 이미지별(Players) 메인에서 1초 후 자동 교체용</div>

      <div style="display:flex;gap:10px;margin-top:18px">
        <button onclick="document.getElementById('b2-player-create-modal').remove()" style="flex:1;padding:10px 16px;background:var(--surface);border:1px solid var(--border2);border-radius:var(--r);color:var(--text2);font-size:var(--fs-base);font-weight:700;cursor:pointer">닫기</button>
        <button onclick="saveB2NewPlayer()" style="flex:1;padding:10px 16px;background:var(--blue);border:1px solid var(--blue);border-radius:var(--r);color:#fff;font-size:var(--fs-base);font-weight:800;cursor:pointer">저장</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

function saveB2NewPlayer() {
  const msg = document.getElementById('b2-newplayer-msg');
  const name = (document.getElementById('b2-newplayer-name')?.value || '').trim();
  const univ = (document.getElementById('b2-newplayer-univ')?.value || '').trim();
  const role = (document.getElementById('b2-newplayer-role')?.value || '').trim();
  const race = (document.getElementById('b2-newplayer-race')?.value || 'N').trim();
  const tier = (document.getElementById('b2-newplayer-tier')?.value || '?').trim();
  const channelUrl = (document.getElementById('b2-newplayer-channel')?.value || '').trim();
  const photo = (document.getElementById('b2-newplayer-photo')?.value || '').trim();
  const photo2 = (document.getElementById('b2-newplayer-photo2')?.value || '').trim();

  if (!name) { alert('이름은 필수입니다.'); return; }
  if (players.find(p => p.name === name)) { alert('이미 존재하는 이름입니다: ' + name); return; }
  if (photo && photo.startsWith('data:')) { alert('❌ base64 이미지(data:...)는 저장/동기화가 실패할 수 있어 금지입니다. URL을 사용하세요.'); return; }

  const p = {
    name,
    univ: univ || '무소속',
    role: role || '학생',
    race,
    tier,
    channelUrl: channelUrl || undefined,
    photo: photo || undefined,
    secondProfileFile: photo2 || undefined,
  };
  players.push(p);
  save();

  // [FIX] 전체 render() 대신 #b2-content만 다시 그려서, 등록 때마다
  // 이미 캐시된 다른 스트리머들의 프로필 이미지가 재로딩되는 것처럼 보이는 문제를 방지.
  const _b2ContentEl = document.getElementById('b2-content');
  if (_b2ContentEl && typeof _b2FemcoView === 'function') {
    _b2ContentEl.innerHTML = _b2FemcoView();
    try{ if(typeof injectUnivIcons === 'function') injectUnivIcons(_b2ContentEl); }catch(e){}
  } else {
    render();
  }

  // 입력 초기화(연속 등록)
  ['b2-newplayer-name','b2-newplayer-channel','b2-newplayer-photo','b2-newplayer-photo2'].forEach(id=>{
    const el = document.getElementById(id); if(el) el.value = '';
  });
  const tierSel = document.getElementById('b2-newplayer-tier'); if(tierSel) tierSel.value = '?';
  const raceSel = document.getElementById('b2-newplayer-race'); if(raceSel) raceSel.value = 'N';
  const roleSel = document.getElementById('b2-newplayer-role'); if(roleSel) roleSel.value = '학생';

  if (msg) { msg.style.color = '#16a34a'; msg.textContent = `✅ 저장됨: ${name} (다음 스트리머를 계속 등록할 수 있습니다)`; }
}

// ─────────────────────────────────────────────────────────────
// 🧩 펨코현황 이미지 저장
// - 저장: 현재 렌더된 펨코현황(전체 1장) 캡처
// - 전체 저장: 동일하지만 파일명을 "전체"로 명확히
// ─────────────────────────────────────────────────────────────
async function saveB2FemcoAllImg(){
  return _saveB2FemcoInternal();
}

async function _saveB2FemcoInternal(){
  const btnSel = '[onclick="saveB2FemcoAllImg()"]';
  const btn = document.querySelector(btnSel);
  if (btn) { btn.disabled = true; btn.textContent = '⏳...'; }
  try{
    const a = document.createElement('a');
    const supportsDownload = ('download' in a);
    const ua = String(navigator.userAgent||'');
    const isIOS = /iPad|iPhone|iPod/i.test(ua);
    const isInApp = /KAKAOTALK|Instagram|FBAN|FBAV|NAVER|Whale|Line/i.test(ua);
    if(!supportsDownload || isIOS || isInApp){
      const w = window.open('', '_blank');
      if(w){
        try{
          w.document.write('<html><head><meta charset="utf-8"><title>이미지 생성 중...</title></head>'
            + '<body style="margin:0;font-family:sans-serif;background:#111;color:#fff;padding:14px">'
            + '펨코스타일 이미지 생성 중입니다... 잠시만 기다려주세요.'
            + '</body></html>');
          w.document.close();
        }catch(e){}
        window.__captureDlWin = w;
      }
    }
  }catch(e){}

  const tmpDiv = document.createElement('div');
  // 현재 펨코현황과 동일한 스타일로 전체를 1장으로 캡처
  tmpDiv.style.cssText = `position:fixed;left:-9999px;top:0;padding:24px;background:#0b1220;box-sizing:border-box;`;
  tmpDiv.innerHTML = _b2FemcoView(); // 현재 설정(localStorage) 반영됨
  document.body.appendChild(tmpDiv);
  // 설정/버튼류는 저장 이미지에서 제거
  tmpDiv.querySelectorAll('.b2-femco-subnav,.b2-femco-panel,.no-export,.no-export-movebtns').forEach(el => el.remove());

  await new Promise(r => setTimeout(r, 120));
  try{
    if (typeof injectUnivIcons === 'function') injectUnivIcons(tmpDiv);
  }catch(e){
    console.warn('[saveB2FemcoAllImg] 대학 아이콘 주입 실패:', e.message);
  }

  try{
    if (typeof _imgToDataUrls === 'function') {
      await _imgToDataUrls(tmpDiv, 12000);
    }
  }catch(e){}
  try{
    if (typeof _waitForImages === 'function') {
      await _waitForImages(tmpDiv, 1500);
    }
  }catch(e){}

  const h = tmpDiv.scrollHeight + 32;
  const w = tmpDiv.scrollWidth;
  const fname = '펨코현황판_전체_' + new Date().toISOString().slice(0,10) + '.png';

  try{
    window.LOG('펨코', '이미지 저장 시작');
    if (typeof window._captureAndSave !== 'function') throw new Error('이미지 저장 기능을 불러오지 못했습니다.');
    await window._captureAndSave(tmpDiv, w, h, fname);
    
  }catch(e){
    console.error('[펨코현황 이미지 저장 실패]', e);
    alert('❌ 펨코스타일 이미지 저장 실패\n\n' + (e.message || '알 수 없는 오류가 발생했습니다.'));
  }finally{
    document.body.removeChild(tmpDiv);
    if (btn) { btn.disabled = false; btn.textContent = '💾 전체 저장'; }
  }
}
