/* ══════════════════════════════════════════════════════════════
   선수 리포트 - 메인 엔트리 & 캔버스 준비 유틸 (stats-player-report.js 에서 분리, 2026-07-30)
   ══════════════════════════════════════════════════════════════ */

function statsPlayerReportHTML(){
  let h = `<div class="ssec">
    <div class="stats-chart-toolbar" style="margin-bottom:14px">
      <div>
        <h4 style="margin:0">📺 스트리머 리포트</h4>
        <div style="font-size:11px;color:var(--text2);margin-top:4px">스트리머를 검색하면 통산 전적, 종족·맵별 승률, ELO 추이, 월별 승률, 대회·모드별 성적, 동일 티어 상대전적, 1:1 비교까지 한 번에 볼 수 있습니다. 위쪽 필터(기간/최근N경기)를 적용하면 이 리포트에도 함께 반영됩니다.</div>
      </div>
    </div>
    <div class="pr-search-wrap">
      <input id="pr-search-input" class="pr-search-input" type="text" placeholder="🔍 스트리머 이름으로 검색..." value=""
        oninput="_prOnSearchInput(this.value)" onkeydown="if(event.key==='Enter'){_prApplySearch(this.value);}" autocomplete="off">
      <div id="pr-search-drop" class="pr-search-drop" style="display:none"></div>
    </div>`;

  const recent = _prLoadRecent().filter(n=>n!==window._prName);
  if(recent.length){
    h += `<div class="pr-recent-wrap">
      <span class="pr-recent-lbl">🕘 최근 검색</span>
      ${recent.map(n=>`<span class="pr-recent-chip" onclick="_prSelectPlayer('${escJS(n)}')">${escHTML(n)}</span>`).join('')}
    </div>`;
  }
  h += `</div>`;

  const p = window._prName ? (players||[]).find(x=>x && x.name===window._prName) : null;
  if(!p){
    h += `<div class="pr-empty"><div style="font-size:40px;margin-bottom:10px">🔍</div>스트리머를 검색해서 리포트를 확인해보세요</div>`;
    return h;
  }

  const period = window._prPeriod || 'all';
  const periodLabelMap = {'30':'최근 30일','90':'최근 90일','season':'올해','all':'전체'};
  // 상단 통계 필터(기간/최근N경기)를 먼저 적용한 뒤, 리포트 자체 기간 버튼으로 한 번 더 좁힌다
  const histGlobal = (typeof statsNonProHist==='function') ? statsNonProHist(p) : _statsAllHist(p);
  const histAll = _statsAllHist(p); // 전체 경기 스트립/최근 경기표는 전역 필터와 별개로 항상 전체 기록 기준
  const histPeriod = _prFilterHistByPeriod(histGlobal, period);
  const stats = _prRaceStats(histPeriod);
  const mapStats = _prMapStats(histPeriod);

  h += `<div id="pr-report-capture">`;
  h += _prHeroHTML(p);

  h += _prSectionNavHTML();

  h += `<div class="ssec" id="pr-sec-info"><div class="pr-sec-head"><h4>📋 기본 정보</h4></div>${_prInfoGridHTML(p)}</div>`;

  h += `<div class="pr-period-bar">
    ${['30','90','season','all'].map(pk=>`<button class="pr-period-btn ${period===pk?'on':''}" onclick="window._prPeriod='${pk}';render()">${periodLabelMap[pk]}</button>`).join('')}
  </div>`;
  h += `<div class="pr-period-scope-note">⏱️ 이 기간 필터는 아래 <b>승률 요약 · 맵별 성적 · 핵심 분석 · ELO 추이</b> 4개 섹션에 적용됩니다</div>`;

  h += `<div class="ssec" id="pr-sec-winrate"><div class="pr-sec-head"><h4>🎮 ${periodLabelMap[period]} 전체 승률</h4></div>${_prWinRateCardsHTML(stats)}</div>`;

  h += `<div class="ssec" id="pr-sec-map"><div class="pr-sec-head"><h4>🗺️ ${periodLabelMap[period]} 맵별 성적</h4></div>${_prMapBarsHTML(mapStats)}</div>`;

  h += `<div class="ssec" id="pr-sec-insights"><div class="pr-sec-head"><h4>📈 핵심 분석 &amp; AI 코멘트 <span class="pr-sec-sub">(${periodLabelMap[period]})</span></h4></div>${_prKeyInsightsHTML(stats, mapStats, histPeriod)}<div style="margin-top:10px">${_prAiCommentHTML(p, histPeriod, stats, periodLabelMap[period])}</div></div>`;

  h += `<div class="ssec" id="pr-sec-elo"><div class="pr-sec-head"><h4>📉 ELO 추이 <span class="pr-sec-sub">(${periodLabelMap[period]})</span></h4></div>${_prEloTrendHTML(p, period)}</div>`;

  h += `<div class="ssec" id="pr-sec-monthly"><div class="pr-sec-head"><h4>📅 월별 승률 <span class="pr-sec-sub">(전체 기록 기준)</span></h4></div>${_prMonthlyTrendHTML(p)}</div>`;

  h += `<div class="ssec" id="pr-sec-allmatches">
    <div class="pr-sec-head"><h4>📋 전체 경기</h4></div>
    <div style="margin-bottom:10px">${_prExcludeTogglesHTML()}</div>
    ${_prImportantStripHTML(histAll)}
  </div>`;

  h += `<div class="ssec" id="pr-sec-modes"><div class="pr-sec-head"><h4>🏆 대회·모드별 성적 <span class="pr-sec-sub">(전체 기록 기준)</span></h4></div>${_prModeStatsHTML(p)}</div>`;

  h += `<div class="ssec" id="pr-sec-tier"><div class="pr-sec-head"><h4>🎯 티어 성과 &amp; 동일 티어 상대전적</h4></div>${_prTierOpponentsHTML(p)}</div>`;

  h += `<div class="ssec" id="pr-sec-vs"><div class="pr-sec-head"><h4>⚔️ 1:1 상대 비교 &amp; 승부 예측</h4></div>${_prVsCompareHTML(p)}</div>`;

  const recentMapStats = _prMapStats(_prExcludeFilter(histAll));
  h += `<div class="ssec" id="pr-sec-mapwl"><div class="pr-sec-head"><h4>🗺️ 맵별 전적 <span class="pr-sec-sub">(클릭하면 아래 최근 경기가 해당 맵으로 필터링됩니다)</span></h4></div>${_prRecentMapWinLossHTML(recentMapStats)}</div>`;

  h += `<div class="ssec" id="pr-sec-recent"><div class="pr-sec-head"><h4>📋 최근 경기${window._prRecentMapFilter?` · <span style="color:var(--blue)">${escHTML(window._prRecentMapFilter)}</span>`:''}</h4></div>${_prRecentTableHTML(p)}</div>`;
  h += `</div>`;

  return h;
}

/* ─── 섹션 바로가기 내비게이션 ─── */
function _prSectionNavHTML(){
  const items=[
    ['pr-sec-info','📋 기본정보'],
    ['pr-sec-winrate','🎮 승률'],
    ['pr-sec-map','🗺️ 맵'],
    ['pr-sec-insights','📈 핵심분석'],
    ['pr-sec-allmatches','📋 전체경기'],
    ['pr-sec-mapwl','🗺️ 맵별전적'],
    ['pr-sec-recent','📋 최근경기'],
  ];
  const chips = items.map(([id,lbl])=>
    `<button type="button" class="pr-nav-chip" onclick="_prScrollToSection('${id}')">${lbl}</button>`
  ).join('');
  return `<div class="pr-nav-bar no-export">${chips}</div>`;
}
function _prCloseNavMore(){
  const d = document.getElementById('pr-nav-more');
  if(d) d.removeAttribute('open');
}
function _prScrollToSection(id){
  const el = document.getElementById(id);
  if(!el) return;
  const y = el.getBoundingClientRect().top + window.scrollY - 70;
  window.scrollTo({ top:y, behavior:'smooth' });
}

/* ─── 리포트 이미지 배경 스타일 (6종: 기본 + 대학 + 보고서 + 완전 신규 3종) ─── */
var PR_BG_STYLES = [
  ['none','⚪ 기본'],
  ['univ','🏫 대학'],
  ['report','📄 보고서'],
  ['esports','🎮 이스포츠'],
  ['magazine','📰 매거진'],
  ['ticket','🎫 티켓']
];
function _prHexToRgba(hex, a){
  try{
    let h = String(hex||'').replace('#','');
    if(h.length===3) h = h.split('').map(c=>c+c).join('');
    const r=parseInt(h.substring(0,2),16), g=parseInt(h.substring(2,4),16), b=parseInt(h.substring(4,6),16);
    if([r,g,b].some(isNaN)) throw 0;
    return `rgba(${r},${g},${b},${a})`;
  }catch(e){ return `rgba(37,99,235,${a})`; }
}
function _prStyleFrameColor(style, p){
  if(style==='univ') return (p && p.univ && typeof gc==='function') ? (gc(p.univ)||'#6366f1') : '#6366f1';
  if(style==='report') return '#0f172a';
  if(style==='esports') return '#22d3ee';
  if(style==='magazine') return '#111827';
  if(style==='ticket') return '#d97706';
  return null; // 기본(효과 없음)
}
/* 리포트 캡처 자체를 스타일별 옅은 색으로 채워서 캡처.
   카드(.ssec 등)는 자체 흰 배경이 있어 그대로 흰색으로 남고, 카드 사이 여백에는
   html2canvas의 backgroundColor 옵션이 그대로 비쳐 보여서 "카드 밖 배경"이 실제로 톤이 바뀜.
   (DOM을 미리 바꿔서 캡처하는 onclone 방식은 클론 레이아웃 재측정 타이밍 이슈로 반영 안 되는 경우가 있어 폐기) */
async function _prCaptureBaseForStyle(style, p){
  const frameColor = (style==='univ') ? _prStyleFrameColor(style, p) : null;
  const bgFill = frameColor ? _prHexToRgba(frameColor, 0.16) : (style==='report' ? '#ffffff' : _prPageBgColor());
  const el = document.getElementById('pr-report-capture');
  if(!el) throw new Error('캡처할 리포트가 없습니다.');
  try{ await (window.ensureHtml2Canvas && window.ensureHtml2Canvas()); }catch(e){}
  if(typeof _imgToDataUrls==='function') await _imgToDataUrls(el);
  try{ if(typeof _waitForImages==='function') await _waitForImages(el,1500); }catch(e){}
  try{ if(typeof _sanitizeUnsupportedCssFunctions==='function') _sanitizeUnsupportedCssFunctions(el); }catch(e){}
  return await html2canvas(el,{
    backgroundColor: bgFill, scale:2, useCORS:true, allowTaint:false, logging:false, imageTimeout:15000,
    onclone:(clonedDoc)=>{
      try{ clonedDoc.querySelectorAll('.no-export').forEach(n=>n.remove()); }catch(e){}
      try{ if(typeof _sanitizeUnsupportedColorsInDoc==='function') _sanitizeUnsupportedColorsInDoc(clonedDoc); }catch(e){}
      if(style==='report'){
        try{
          const cloneEl = clonedDoc.getElementById('pr-report-capture');
          if(cloneEl) cloneEl.classList.add('pr-report-mode');
          const styleTag = clonedDoc.createElement('style');
          styleTag.textContent = PR_REPORT_MODE_CSS;
          clonedDoc.head.appendChild(styleTag);
        }catch(e){}
      }
    }
  });
}
/* '기본' 스타일용 배경색: 실제 화면(카드 밖 여백)에 쓰이는 페이지 배경색(--bg)을 그대로 읽어와 사용.
   라이트/다크 모드 등 실제 테마와 항상 일치하도록 하드코딩 대신 computed style에서 가져온다. */
function _prPageBgColor(){
  try{
    const el = document.getElementById('pr-report-capture');
    const src = (el && el.parentElement) || document.body;
    const cs = getComputedStyle(src);
    const varBg = cs.getPropertyValue('--bg');
    if(varBg && varBg.trim()) return varBg.trim();
    const bgColor = cs.backgroundColor;
    if(bgColor && bgColor!=='rgba(0, 0, 0, 0)' && bgColor!=='transparent') return bgColor;
  }catch(e){}
  return '#f1f5f9';
}
/* '보고서' 스타일 전용: 캡처되는 실제 카드 UI 자체를 문서 느낌으로 변형.
   화려한 그림자/그라디언트/큰 라운드 대신 얇은 테두리·직각에 가까운 모서리·
   섹션 번호 매김(01, 02 …)을 적용해 컬러풀한 대시보드가 아닌 정식 보고서처럼 보이게 함.
   (승/패, 종족 등 의미를 가진 색상은 정보 손실을 막기 위해 유지) */
var PR_REPORT_MODE_CSS = [
  '#pr-report-capture.pr-report-mode{counter-reset:pr-sec}',
  '.pr-report-mode, .pr-report-mode *{box-shadow:none!important}',
  '.pr-report-mode .pr-hero{background:#fff!important;border:1px solid #cbd5e1!important;border-bottom:3px solid #0f172a!important;border-radius:2px!important}',
  '.pr-report-mode .pr-hero-photo{border-radius:6px!important}',
  '.pr-report-mode .pr-recent-wrap,.pr-report-mode .pr-period-bar{display:none!important}',
  '.pr-report-mode .ssec{background:#fff!important;border:1px solid #e2e8f0!important;border-radius:2px!important;counter-increment:pr-sec;padding-top:20px!important}',
  '.pr-report-mode .pr-sec-head{border-bottom:2px solid #0f172a;padding-bottom:11px;margin:0 0 16px!important}',
  '.pr-report-mode .pr-sec-head h4{font-size:16px!important;letter-spacing:-.01em;display:flex;align-items:center;gap:8px}',
  '.pr-report-mode .pr-sec-head h4::before{content:counter(pr-sec,decimal-leading-zero);color:#fff;background:#0f172a;font-size:11px;font-weight:900;padding:3px 7px;border-radius:2px;letter-spacing:0}',
  '.pr-report-mode .pr-info-card,.pr-report-mode .pr-wr-card{border-radius:2px!important;background:#f8fafc!important;border:1px solid #e2e8f0!important}',
  '.pr-report-mode .pr-gauge-ring::before{background:#fff!important}',
  '.pr-report-mode .pr-ai-box{background:#f8fafc!important;border:1px solid #e2e8f0!important;border-left:3px solid #0f172a!important;border-radius:2px!important}',
  '.pr-report-mode .pr-ai-box.pr-ai-good{border-left-color:#16a34a!important}',
  '.pr-report-mode .pr-ai-box.pr-ai-bad{border-left-color:#ef4444!important}',
  '.pr-report-mode .pr-chip,.pr-report-mode .pr-btn,.pr-report-mode .pr-period-btn,.pr-report-mode .pr-filter-pill,.pr-report-mode .pr-nav-chip,.pr-report-mode .pr-recent-chip{border-radius:3px!important}',
  '.pr-report-mode .pr-highlight-row{border-radius:2px!important}',
  '.pr-report-mode .pr-bar-track,.pr-report-mode .pr-bar-fill{border-radius:2px!important}',
  '.pr-report-mode .pr-mode-chip{border-radius:2px!important}',
  '.pr-report-mode .pr-nav-bar{border-bottom:1px solid #e2e8f0;padding-bottom:14px!important}'
].join('\n');
/* 캡처된 캔버스 바깥에 스타일 색 테두리/배너, 혹은 완전히 다른 레이아웃(보고서 스타일)을 Canvas2D로 합성.
   DOM/레이아웃과 무관하게 항상 100% 반영됨. '기본' 스타일은 효과 없이 그대로 반환. */
async function _prComposeStyledCanvas(baseCanvas, style, p){
  if(style==='report') return _prDrawReportFrame(baseCanvas, p);

  const frameColor = _prStyleFrameColor(style, p);
  if(!frameColor) return baseCanvas; // 기본: 효과 없음

  const BORDER = 26;
  const BANNER = 56;
  const outW = baseCanvas.width + BORDER*2;
  const outH = baseCanvas.height + BORDER*2 + BANNER;
  const out = document.createElement('canvas');
  out.width = outW; out.height = outH;
  const ctx = out.getContext('2d');
  ctx.fillStyle = frameColor;
  ctx.fillRect(0,0,outW,outH);
  ctx.drawImage(baseCanvas, BORDER, BANNER + BORDER);
  return out;
}
/* 보고서 스타일: 컨설팅 리포트/문서 표지 느낌의 전문적인 레이아웃.
   상단 키커(letter-spaced) + 굵은 타이틀 + 메타 정보 바, 얇은 단일 테두리와 상단 포인트 바,
   하단 3분할 푸터(브랜드 / 리포트 ID / 생성일)로 구성. 순수 Canvas2D 드로잉이라 항상 동일하게 렌더링됨. */
function _prLetterSpacedText(ctx, text, x, y, spacing){
  let cx = x;
  for(const ch of String(text)){
    ctx.fillText(ch, cx, y);
    cx += ctx.measureText(ch).width + spacing;
  }
  return cx - spacing;
}
function _prDrawReportFrame(baseCanvas, p){
  const FONT = '"Apple SD Gothic Neo","Malgun Gothic","Noto Sans KR",-apple-system,sans-serif';
  const INK = '#0f172a';
  const ACCENT = '#1d4ed8';
  const MUTED = '#64748b';
  const FAINT = '#94a3b8';
  const LINE = '#e2e8f0';

  const PAD = 56;
  const ACCENT_BAR_H = 6;
  const HEADER_H = 172;
  const FOOTER_H = 68;
  const name = (p && p.name) || '스트리머';
  const sub = [p && p.univ, p && p.tier].filter(Boolean).join('   ·   ');
  const now = new Date();
  const dateStr = now.toLocaleDateString('ko-KR', {year:'numeric',month:'2-digit',day:'2-digit'});
  const reportId = `SDC-${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}-${String(Math.abs((name||'').split('').reduce((a,c)=>a+c.charCodeAt(0),0))%900+100)}`;

  const outW = baseCanvas.width + PAD*2;
  const outH = ACCENT_BAR_H + baseCanvas.height + PAD*2 + HEADER_H + FOOTER_H;
  const out = document.createElement('canvas');
  out.width = outW; out.height = outH;
  const ctx = out.getContext('2d');
  ctx.textBaseline = 'alphabetic';

  // 배경 + 얇은 단일 테두리
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0,0,outW,outH);
  ctx.strokeStyle = LINE;
  ctx.lineWidth = 1;
  ctx.strokeRect(0.5,0.5,outW-1,outH-1);

  // 상단 포인트 바
  ctx.fillStyle = ACCENT;
  ctx.fillRect(0,0,outW,ACCENT_BAR_H);

  // 헤더: 키커(letter-spaced) + 우측 리포트 ID
  ctx.fillStyle = ACCENT;
  ctx.font = `700 13px ${FONT}`;
  _prLetterSpacedText(ctx, 'STAR DATA CENTER  ·  PLAYER PERFORMANCE REPORT', PAD, ACCENT_BAR_H+PAD-16, 1.4);

  ctx.fillStyle = FAINT;
  ctx.font = `600 13px ${FONT}`;
  ctx.textAlign = 'right';
  ctx.fillText(reportId, outW-PAD, ACCENT_BAR_H+PAD-16);
  ctx.textAlign = 'left';

  // 타이틀
  ctx.fillStyle = INK;
  ctx.font = `800 42px ${FONT}`;
  ctx.fillText(`${name} 스트리머 리포트`, PAD, ACCENT_BAR_H+PAD+38);

  // 메타 정보 (대학/티어 · 생성일) - 캡슐형 배지
  let bx = PAD;
  const by = ACCENT_BAR_H+PAD+64;
  const badges = [sub, `발행일  ${dateStr}`].filter(Boolean);
  ctx.font = `600 15px ${FONT}`;
  badges.forEach((txt, i)=>{
    const w = ctx.measureText(txt).width + 28;
    const bColor = i===0 ? ACCENT : MUTED;
    ctx.fillStyle = i===0 ? _prHexToRgba(ACCENT, 0.09) : '#f1f5f9';
    _prRoundRect(ctx, bx, by, w, 30, 15);
    ctx.fill();
    ctx.fillStyle = bColor;
    ctx.fillText(txt, bx+14, by+20);
    bx += w + 10;
  });

  // 헤더 하단 구분선
  ctx.strokeStyle = LINE;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(PAD, ACCENT_BAR_H+HEADER_H-6);
  ctx.lineTo(outW-PAD, ACCENT_BAR_H+HEADER_H-6);
  ctx.stroke();

  // 본문
  ctx.drawImage(baseCanvas, PAD, ACCENT_BAR_H+HEADER_H+PAD/2);

  // 푸터 구분선
  const footTop = outH-FOOTER_H;
  ctx.strokeStyle = LINE;
  ctx.beginPath();
  ctx.moveTo(PAD, footTop);
  ctx.lineTo(outW-PAD, footTop);
  ctx.stroke();

  // 푸터 3분할: 브랜드 / 페이지 표기 / 생성 시각
  ctx.fillStyle = INK;
  ctx.font = `700 14px ${FONT}`;
  ctx.fillText('STAR DATA CENTER', PAD, footTop+38);

  ctx.fillStyle = FAINT;
  ctx.font = `500 13px ${FONT}`;
  ctx.textAlign = 'center';
  ctx.fillText('본 리포트는 star-datacenter 통계 시스템에서 자동 생성되었습니다', outW/2, footTop+38);

  ctx.textAlign = 'right';
  ctx.fillText(`Page 1 · ${dateStr}`, outW-PAD, footTop+38);
  ctx.textAlign = 'left';

  return out;
}
/* 캔버스 2D 라운드 사각형 헬퍼 (path만 생성, fill/stroke는 호출부에서) */
function _prRoundRect(ctx, x, y, w, h, r){
  ctx.beginPath();
  ctx.moveTo(x+r, y);
  ctx.arcTo(x+w, y, x+w, y+h, r);
  ctx.arcTo(x+w, y+h, x, y+h, r);
  ctx.arcTo(x, y+h, x, y, r);
  ctx.arcTo(x, y, x+w, y, r);
  ctx.closePath();
}
/* ══════════════════════════════════════
   완전히 다른 포맷의 리포트 이미지 (3종)
   기존 카드 UI를 캡처하는 방식이 아니라, 선수 데이터만 뽑아서
   매번 Canvas2D로 처음부터 새로 그리는 독립 렌더러.
   - 🎮 이스포츠: 대학 컬러 기반 다크 방송 그래픽
   - 📰 매거진: 에디토리얼 인터뷰 페이지
   - 🎫 티켓: 보딩패스 스타일 (절취선+바코드)
══════════════════════════════════════ */
var PR_RACE_KO = {T:'테란',Z:'저그',P:'프로토스'};
var PR_CANVAS_FONT = '"Apple SD Gothic Neo","Malgun Gothic","Noto Sans KR",-apple-system,sans-serif';

function _prWrOf(rv){ const t=(rv&&rv.w||0)+(rv&&rv.l||0); return t? Math.round(rv.w/t*100):0; }

/* 이미지 로드 (CORS 실패해도 null 반환하고 카드 생성은 계속 진행) */
function _prLoadImageEl(url){
  return new Promise((resolve)=>{
    if(!url){ resolve(null); return; }
    try{
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = ()=>resolve(img);
      img.onerror = ()=>resolve(null);
      img.src = url;
    }catch(e){ resolve(null); }
  });
}
/* object-fit:cover 방식으로 사각형 안에 이미지 그리기.
   vBias(0~1): 세로로 잘릴 때 어느 지점을 기준으로 자를지 (0=위쪽 기준, .5=중앙, 1=아래쪽 기준).
   인물 사진은 얼굴이 보통 상단~중상단에 있으므로 기본값을 중앙보다 위로 두어
   얼굴이 잘리는 것을 방지한다. */
function _prDrawImageCover(ctx, img, x, y, w, h, vBias){
  if(!img || !img.width || !img.height) return;
  if(vBias==null) vBias = 0.5;
  const ir = img.width/img.height, tr = w/h;
  let sx,sy,sw,sh;
  if(ir>tr){ sh=img.height; sw=sh*tr; sx=(img.width-sw)/2; sy=0; }
  else { sw=img.width; sh=sw/tr; sx=0; sy=(img.height-sh)*vBias; }
  ctx.drawImage(img, sx,sy,sw,sh, x,y,w,h);
}
/* 둥근 사각형 안에 사진 클리핑 + cover 배치 (사진 없으면 플레이스홀더) */
function _prDrawPhotoInRect(ctx, img, x, y, w, h, radius, fallbackColor, vBias){
  ctx.save();
  _prRoundRect(ctx, x, y, w, h, radius);
  ctx.clip();
  if(img){
    _prDrawImageCover(ctx, img, x, y, w, h, vBias);
  } else {
    ctx.fillStyle = fallbackColor || '#334155';
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = '#94a3b8';
    ctx.font = `700 ${Math.round(h*0.3)}px ${PR_CANVAS_FONT}`;
    ctx.textAlign = 'center';
    ctx.fillText('?', x+w/2, y+h/2+h*0.1);
    ctx.textAlign = 'left';
  }
  ctx.restore();
}
/* 티어 → 카드 레어도 컬러 (사이트 티어 색상 재사용, 실패 시 골드 기본값) */
function _prCardRarityColor(tier){
  try{ if(typeof getTierBtnColor==='function'){ const c=getTierBtnColor(tier); if(c) return c; } }catch(e){}
  return '#f59e0b';
}
/* hex 색을 검정/흰색 쪽으로 섞어 더 어둡거나 밝은 톤을 만든다.
   percent: -1(가장 어둡게) ~ 0(원본) ~ 1(가장 밝게) */
function _prShadeColor(hex, percent){
  try{
    let h = String(hex||'').replace('#','');
    if(h.length===3) h = h.split('').map(c=>c+c).join('');
    let r=parseInt(h.substring(0,2),16), g=parseInt(h.substring(2,4),16), b=parseInt(h.substring(4,6),16);
    if([r,g,b].some(isNaN)) throw 0;
    const t = percent<0 ? 0 : 255;
    const p = Math.abs(percent);
    r = Math.round((t-r)*p)+r; g = Math.round((t-g)*p)+g; b = Math.round((t-b)*p)+b;
    return `rgb(${r},${g},${b})`;
  }catch(e){ return hex || '#0b1220'; }
}
/* 3종 신규 스타일 공용 데이터 수집: 화면 캡처가 아니라 선수 원본 데이터를 직접 취합 */
/* 카드용 모드별(미니대전/대학대전/대학CK/티어대회/대회/프로리그 등) 승패 집계.
   성별로 하드코딩하지 않고 실제 기록에 있는 모드만 뽑아 보여줌(여자는 자연히 대학계열, 남자는 자연히 프로리그계열이 나옴) */
var PR_CARD_MODE_ORDER = ['프로리그','프로리그대회','미니대전','대학대전','대학CK','티어대회','대회','끝장전'];
function _prCardModeStats(p){
  const hist = (typeof _statsAllHist==='function' ? _statsAllHist(p) : []).filter(h=>(h.result==='승'||h.result==='패') && (typeof _pdNormalizeRecentModeLabel!=='function' || _pdNormalizeRecentModeLabel(h.mode)!=='시빌워'));
  const byMode = {};
  hist.forEach(h=>{
    let lbl = (typeof _pdNormalizeRecentModeLabel==='function') ? (_pdNormalizeRecentModeLabel(h.mode)||'기타') : (h.mode||'기타');
    /* 프로리그 대회 끝장전도 조별리그/대진표와 함께 '프로리그대회' 한 칩으로 합산 (HTML 리포트 섹션과 동일하게) */
    if(lbl==='프로리그대회끝장전') lbl='프로리그대회';
    if(!byMode[lbl]) byMode[lbl]={w:0,l:0};
    if(h.result==='승') byMode[lbl].w++; else byMode[lbl].l++;
  });
  /* 예전엔 상위 4개만 잘라서 보여줬는데, 그러면 정렬 순서상 뒤로 밀리는 '대회'(공통)나
     '프로리그'(남자)가 기록이 있어도 카드에서 통째로 빠지는 문제가 있었다.
     PR_CARD_MODE_ORDER에 정의된 실제 기록이 있는 모드는 자르지 않고 전부 보여준다
     (카드 높이는 _prDrawEsportsCanvas에서 modeRows.length 기준으로 항상 동적으로 계산됨). */
  return Object.entries(byMode).map(([mode,rec])=>{
    const tot=rec.w+rec.l; return {mode, ...rec, tot, wr: tot?Math.round(rec.w/tot*100):0};
  }).sort((a,b)=>{
    const ia=PR_CARD_MODE_ORDER.indexOf(a.mode), ib=PR_CARD_MODE_ORDER.indexOf(b.mode);
    if(ia>=0 && ib>=0) return ia-ib;
    if(ia>=0) return -1;
    if(ib>=0) return 1;
    return b.tot-a.tot;
  });
}
async function _prBuildCardData(p){
  const histAll = (typeof _statsAllHist==='function') ? _statsAllHist(p) : [];
  const raceStats = _prRaceStats(histAll);
  const w = p.win||0, l = p.loss||0, tot = w+l;
  const wr = tot ? Math.round(w/tot*100) : 0;
  const streak = _prBestStreak(histAll);
  const rankInfo = _prTierRank(p);
  const sorted = (histAll||[]).filter(h=>h.result==='승'||h.result==='패')
    .slice().sort((a,b)=>String(b.date||'').localeCompare(String(a.date||'')));
  const recentForm = sorted.slice(0,10).map(h=>h.result==='승'?'W':'L').reverse();
  const rawPhoto = p.photo || '';
  const photoUrl = (typeof toHttpsUrl==='function') ? toHttpsUrl(rawPhoto) : rawPhoto;
  const photoImg = await _prLoadImageEl(photoUrl);
  const univLogoRaw = (typeof univCfg!=='undefined' ? (univCfg.find(x=>x.name===p.univ)||{}) : {});
  const univLogoUrl0 = univLogoRaw.icon || univLogoRaw.img || '';
  const univLogoUrl = univLogoUrl0 ? ((typeof toHttpsUrl==='function') ? toHttpsUrl(univLogoUrl0) : univLogoUrl0) : '';
  const univLogoImg = univLogoUrl ? await _prLoadImageEl(univLogoUrl) : null;
  const univColor = (p.univ && typeof gc==='function') ? (gc(p.univ)||'#3b5bdb') : '#3b5bdb';
  // 스트리머 상세 팝업과 동일한 ELO 등급(LEGEND/MASTER/DIAMOND/GOLD/SILVER/BRONZE)
  const eloValForGrade = Number(p.elo||1200);
  const eloGrade = eloValForGrade>=1500?'LEGEND':eloValForGrade>=1400?'MASTER':eloValForGrade>=1300?'DIAMOND':eloValForGrade>=1200?'GOLD':eloValForGrade>=1100?'SILVER':'BRONZE';
  const eloGradeColor = eloValForGrade>=1500?'#b45309':eloValForGrade>=1400?'#7e22ce':eloValForGrade>=1300?'#0369a1':eloValForGrade>=1200?'#a16207':eloValForGrade>=1100?'#64748b':'#92400e';
  return {
    name: p.name||'스트리머', univ: p.univ||'', tier: p.tier||'', race: p.race||'', elo: p.elo||1200,
    eloGrade, eloGradeColor,
    univColor, photoImg, univLogoImg, w, l, tot, wr,
    raceStats: raceStats.rv,
    bestWinStreak: (streak.win&&streak.win.n)||0,
    bestLoseStreak: (streak.lose&&streak.lose.n)||0,
    rank: rankInfo.rank, rankTotal: rankInfo.total,
    recentForm,
    modeStats: _prCardModeStats(p)
  };
}

/* ─── 🎮 이스포츠 스포트라이트 스타일 (대학 컬러 기반의 밝고 화사한 톤) ─── */
