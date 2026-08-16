/* ══════════════════════════════════════════════════════════════
   선수 리포트 - 카드 캔버스 렌더(이스포츠/매거진/티켓) & 이미지 저장 (stats-player-report.js 에서 분리, 2026-07-30)
   ══════════════════════════════════════════════════════════════ */

function _prDrawEsportsCanvas(data){
  const FONT = PR_CANVAS_FONT;
  const W=1080;
  const photoY=96, photoH=640, photoX=56, photoW=W-112;
  const modeRows = (data.modeStats||[]).filter(m=>m.tot>0);
  const chipH=88, chipGap=16;
  const raceBarH=28, raceGap=12, sq=30;

  /* 세로 레이아웃 오프셋을 실제 그리기보다 먼저 계산해 캔버스 전체 높이(H)를 데이터(모드 전적 줄 수)에 맞게 정한다.
     아래 그리기 단계와 반드시 같은 수식을 써야 하므로 이름 붙인 상수로 공유 */
  const nameY = photoY+photoH+62;
  const badgeY = nameY+26;
  const statY = badgeY+74;
  const raceLabelY = statY+170;
  const raceBarsTop = raceLabelY+26;
  const afterRaceBars = raceBarsTop + 3*(raceBarH+raceGap);
  const recentLabelY = afterRaceBars+20;
  const sqTop = recentLabelY+22;
  const modeSecLabelY = sqTop + sq + 40;
  const modeChipRows = Math.ceil(modeRows.length/2);
  const modeSecBottom = modeRows.length ? (modeSecLabelY + 26 + modeChipRows*chipH + (modeChipRows-1)*chipGap) : modeSecLabelY;
  const H = modeSecBottom + 90;

  const out=document.createElement('canvas'); out.width=W; out.height=H;
  const ctx=out.getContext('2d');
  const UNIV = data.univColor || '#3b5bdb';
  const ACCENT = _prShadeColor(UNIV, -0.1);   /* 배지/포인트용 - 대학 컬러를 살짝만 눌러 가독성 확보 */
  const INK = '#1c1917';

  /* 배경: 어두워지는 톤 없이 흰색 ~ 대학 컬러의 아주 옅은 톤으로만 구성 (밝고 화사하게) */
  const bgGrad=ctx.createLinearGradient(0,0,W,H);
  bgGrad.addColorStop(0,_prShadeColor(UNIV,0.95)); bgGrad.addColorStop(1,_prShadeColor(UNIV,0.84));
  ctx.fillStyle=bgGrad; ctx.fillRect(0,0,W,H);

  ctx.fillStyle=ACCENT; ctx.font=`800 15px ${FONT}`;
  _prLetterSpacedText(ctx,'STAR DATA CENTER  ·  PLAYER SPOTLIGHT', 56, 66, 2);

  /* 프로필 사진: 어두워지는 오버레이 없이 깔끔하게, 대학 컬러 보더로만 포인트 */
  ctx.save();
  ctx.shadowColor=_prHexToRgba(UNIV,.35); ctx.shadowBlur=26; ctx.shadowOffsetY=10;
  _prDrawPhotoInRect(ctx, data.photoImg, photoX, photoY, photoW, photoH, 22, '#e7e5e4', 0.1);
  ctx.restore();
  ctx.strokeStyle=ACCENT; ctx.lineWidth=4;
  _prRoundRect(ctx, photoX, photoY, photoW, photoH, 22); ctx.stroke();

  /* 이름 + 배지: 사진 아래 밝은 배경 위에 배치 (사진 위에 검은 그라디언트를 얹지 않음) */
  ctx.textAlign='left';
  ctx.fillStyle=INK; ctx.font=`900 52px ${FONT}`;
  ctx.fillText(data.name, 56, nameY);

  let px=56, py=badgeY;
  /* 대학 로고 — 원형 배지 없이 로고 자체 모양 그대로, 반투명 */
  if (data.univLogoImg) {
    const logoS=38, logoCy=py+17;
    ctx.save();
    ctx.globalAlpha=0.75;
    ctx.shadowColor='rgba(28,25,23,.18)'; ctx.shadowBlur=5;
    ctx.drawImage(data.univLogoImg, px, logoCy-logoS/2, logoS, logoS);
    ctx.restore();
    px = px+logoS+10;
  }
  [[data.univ,ACCENT,'#fff',null],[data.tier,'#fff',ACCENT,ACCENT],[data.eloGrade,'#fff',data.eloGradeColor,data.eloGradeColor]].filter(([t])=>t).forEach(([txt,bg,fg,bd],i)=>{
    ctx.font=`700 16px ${FONT}`;
    const w=ctx.measureText(txt).width+26;
    ctx.fillStyle=bg;
    _prRoundRect(ctx, px, py, w, 34, 17); ctx.fill();
    if(bd){ ctx.strokeStyle=bd; ctx.lineWidth=2; _prRoundRect(ctx, px, py, w, 34, 17); ctx.stroke(); }
    ctx.fillStyle=fg;
    ctx.fillText(txt, px+13, py+23);
    px+=w+10;
  });

  ctx.fillStyle='#78716c'; ctx.font=`700 14px ${FONT}`;
  _prLetterSpacedText(ctx,'WIN RATE', 56, statY, 2);
  ctx.font=`900 96px ${FONT}`; ctx.fillStyle=ACCENT;
  ctx.fillText(`${data.wr}%`, 56, statY+92);
  ctx.font=`700 20px ${FONT}`; ctx.fillStyle='#57534e';
  ctx.fillText(`${data.w}W ${data.l}L  ·  ELO ${data.elo}`, 56, statY+128);

  if(data.rank){
    ctx.textAlign='right';
    ctx.fillStyle='#78716c'; ctx.font=`700 14px ${FONT}`;
    ctx.fillText('TIER RANK', W-56, statY);
    ctx.font=`900 48px ${FONT}`; ctx.fillStyle=INK;
    ctx.fillText(`#${data.rank}`, W-56, statY+56);
    ctx.font=`700 16px ${FONT}`; ctx.fillStyle='#78716c';
    ctx.fillText(`/ ${data.rankTotal}명`, W-56, statY+82);
    ctx.textAlign='left';
  }

  let ry = raceLabelY;
  ctx.font=`800 15px ${FONT}`; ctx.fillStyle='#78716c';
  ctx.fillText('RACE MATCHUP', 56, ry);
  ry+=26;
  ['T','P','Z'].forEach(r=>{
    const rv=data.raceStats[r]||{w:0,l:0}; const tot=rv.w+rv.l; const wr=_prWrOf(rv);
    const rc=_prRaceColor(r);
    const barX=56, barW=W-112, barH=28;
    ctx.fillStyle='rgba(28,25,23,.06)';
    _prRoundRect(ctx, barX, ry, barW, barH, 8); ctx.fill();
    const fillW = tot? Math.max(barW*wr/100, 14) : 0;
    ctx.fillStyle=rc;
    _prRoundRect(ctx, barX, ry, fillW, barH, 8); ctx.fill();
    ctx.fillStyle='#fff'; ctx.font=`800 13px ${FONT}`;
    ctx.fillText(`${PR_RACE_KO[r]}   ${tot?wr+'%':'-'}   (${rv.w}W ${rv.l}L)`, barX+12, ry+19);
    ry+=barH+12;
  });

  ry += 20;
  ctx.fillStyle='#78716c'; ctx.font=`800 15px ${FONT}`;
  ctx.fillText('RECENT FORM', 56, ry);
  ry+=22;
  const gap=8;
  data.recentForm.forEach((r,i)=>{
    const x=56+i*(sq+gap);
    ctx.fillStyle = r==='W' ? '#ef4444' : '#2563eb';
    _prRoundRect(ctx, x, ry, sq, sq, 6); ctx.fill();
    ctx.fillStyle='#fff'; ctx.font=`900 14px ${FONT}`; ctx.textAlign='center';
    ctx.fillText(r, x+sq/2, ry+sq/2+5);
    ctx.textAlign='left';
  });

  /* 모드별 전적: 미니대전/대학대전/대학CK/티어대회/대회(여자) 또는 프로리그/프로리그대회(남자) 등
     실제 기록에 있는 모드만 상위 4개까지, RACE MATCHUP 막대와는 다른 2단 컬러 스탯 칩으로 노출해서 구분감을 줌 */
  if(modeRows.length){
    ry += sq + 40;
    ctx.fillStyle='#78716c'; ctx.font=`800 15px ${FONT}`;
    ctx.fillText('MATCH RECORD', 56, ry);
    ry += 26;
    const chipW = (W-112-24)/2;
    modeRows.forEach((m,i)=>{
      const col=i%2, row=Math.floor(i/2);
      const bx = 56 + col*(chipW+24);
      const by = ry + row*(chipH+chipGap);
      const col2 = (typeof _pdRecentModeColors==='function' && _pdRecentModeColors()[m.mode]) || ACCENT;
      ctx.fillStyle=_prHexToRgba(col2,.08);
      _prRoundRect(ctx, bx, by, chipW, chipH, 14); ctx.fill();
      ctx.strokeStyle=_prHexToRgba(col2,.25); ctx.lineWidth=2;
      _prRoundRect(ctx, bx, by, chipW, chipH, 14); ctx.stroke();
      ctx.fillStyle=col2;
      _prRoundRect(ctx, bx, by, 6, chipH, 3); ctx.fill();
      ctx.font=`700 13px ${FONT}`; ctx.fillStyle=col2;
      ctx.fillText(m.mode, bx+22, by+26);
      ctx.font=`900 30px ${FONT}`; ctx.fillStyle=INK;
      ctx.fillText(`${m.wr}%`, bx+22, by+64);
      ctx.textAlign='right'; ctx.font=`700 13px ${FONT}`; ctx.fillStyle='#57534e';
      ctx.fillText(`${m.w}W ${m.l}L`, bx+chipW-16, by+64);
      ctx.textAlign='left';
    });
    ry += modeChipRows*chipH + (modeChipRows-1)*chipGap;
  }

  ctx.fillStyle='#a8a29e'; ctx.font=`600 13px ${FONT}`;
  ctx.fillText(`STAR DATA CENTER  ·  ${new Date().toLocaleDateString('ko-KR')}`, 56, H-40);

  return out;
}

/* ─── 📰 매거진/에디토리얼 스타일 (2세대 리디자인) ───
   - 이전 버전의 "SEASON WIN RATE" 라벨과 "통산 ○승 ○패" 줄 겹침 버그를 근본적으로 해결
     (좌표를 개별 매직넘버로 흩어놓지 않고, 섹션마다 세로 커서를 순차적으로 내려가며 배치)
   - 승률 히어로 넘버를 훨씬 크게, 연승/연패는 색상+화살표로 방향성을 즉시 인지되게,
     종족전 승률은 숫자 나열 대신 미니 바 차트로, 하단 여백엔 최근 10경기 폼을 채워 넣음 */
function _prDrawMagazineCanvas(data){
  const FONT = PR_CANVAS_FONT;
  const W=1240, H=860;
  const out=document.createElement('canvas'); out.width=W; out.height=H;
  const ctx=out.getContext('2d');
  const UNIV = data.univColor || '#b91c1c';
  const ACCENT = _prShadeColor(UNIV, -0.1); /* 텍스트 대비 확보를 위해 살짝 눌러 사용 */
  ctx.fillStyle='#faf9f6'; ctx.fillRect(0,0,W,H);

  /* 좌측 세로 포인트 바 (학교 컬러) */
  ctx.fillStyle=ACCENT; ctx.fillRect(0,0,10,H);

  /* ── 우측 사진 패널: 사진 → 여백으로 자연스럽게 스며드는 그라디언트 블렌드 ── */
  const photoW = Math.round(W*0.42), photoX = W-photoW;
  if(data.photoImg) _prDrawImageCover(ctx, data.photoImg, photoX, 0, photoW, H, 0.14);
  else { ctx.fillStyle='#1e293b'; ctx.fillRect(photoX,0,photoW,H); }
  /* 대학 컬러 듀오톤 오버레이(하단으로 갈수록 살짝 짙어짐) */
  const duo = ctx.createLinearGradient(0,0,0,H);
  duo.addColorStop(0, _prHexToRgba(UNIV,.10));
  duo.addColorStop(1, _prHexToRgba('#0f172a',.30));
  ctx.fillStyle=duo; ctx.fillRect(photoX,0,photoW,H);
  /* 좌측 경계를 배경색으로 페이드시켜 "패널이 붙어있는" 느낌 대신 스며드는 느낌으로 */
  const blend = ctx.createLinearGradient(photoX-90,0,photoX+40,0);
  blend.addColorStop(0,'rgba(250,249,246,1)');
  blend.addColorStop(1,'rgba(250,249,246,0)');
  ctx.fillStyle=blend; ctx.fillRect(photoX-90,0,130,H);
  ctx.strokeStyle=_prHexToRgba(UNIV,.55); ctx.lineWidth=3;
  ctx.beginPath(); ctx.moveTo(photoX+2,0); ctx.lineTo(photoX+2,H); ctx.stroke();

  const PAD=68;
  const colRight = photoX-48;
  const contentW = colRight-PAD;
  ctx.textAlign='left';
  let cy; /* 세로 커서 — 섹션마다 순차적으로 내려간다 (겹침 방지) */

  /* ── 상단 키커 + 발행 태그 ── */
  ctx.fillStyle='#0f172a'; ctx.font=`800 12px ${FONT}`;
  _prLetterSpacedText(ctx,'STAR DATA CENTER', PAD, 50, 2);
  ctx.textAlign='right';
  ctx.fillStyle=ACCENT; ctx.font=`800 12px ${FONT}`;
  ctx.fillText('ISSUE 01 · PLAYER FEATURE', colRight, 50);
  ctx.textAlign='left';
  ctx.strokeStyle='#0f172a'; ctx.lineWidth=2;
  ctx.beginPath(); ctx.moveTo(PAD,64); ctx.lineTo(colRight,64); ctx.stroke();

  /* ── 선수명 + 언더라인 스와이프 ── */
  ctx.fillStyle='#0f172a'; ctx.font=`900 58px ${FONT}`;
  ctx.fillText(data.name, PAD, 134);
  const nameW = ctx.measureText(data.name).width;
  ctx.fillStyle=ACCENT; ctx.fillRect(PAD, 146, Math.min(nameW, contentW)*0.42, 6);

  /* ── 소속/티어 배지: 소속은 학교 컬러로 꽉 채워 이름과 시각적으로 연결 ── */
  let bx=PAD, by=168;
  /* 대학 로고 — 원형 배지 없이 로고 자체 모양 그대로, 반투명 */
  if (data.univLogoImg) {
    const logoS=36, logoCy=by+16;
    ctx.save();
    ctx.globalAlpha=0.75;
    ctx.shadowColor='rgba(15,23,42,.18)'; ctx.shadowBlur=5;
    ctx.drawImage(data.univLogoImg, bx, logoCy-logoS/2, logoS, logoS);
    ctx.restore();
    bx = bx+logoS+10;
  }
  ctx.font=`700 14px ${FONT}`;
  const univTxt = `${data.univ||'-'} 소속`;
  const univBw = ctx.measureText(univTxt).width+26;
  ctx.fillStyle=UNIV; _prRoundRect(ctx, bx, by, univBw, 32, 16); ctx.fill();
  ctx.fillStyle='#fff'; ctx.fillText(univTxt, bx+13, by+21);
  bx += univBw+10;
  const tierTxt = `${data.tier||'-'} 티어`;
  const tierBw = ctx.measureText(tierTxt).width+26;
  ctx.strokeStyle=_prHexToRgba(ACCENT,.5); ctx.lineWidth=1.5;
  _prRoundRect(ctx, bx, by, tierBw, 32, 16); ctx.stroke();
  ctx.fillStyle=ACCENT; ctx.fillText(tierTxt, bx+13, by+21);
  bx += tierBw+10;
  const gradeTxt = data.eloGrade||'';
  if(gradeTxt){
    ctx.font=`800 14px ${FONT}`;
    const gradeBw = ctx.measureText(gradeTxt).width+26;
    ctx.strokeStyle=_prHexToRgba(data.eloGradeColor||ACCENT,.6); ctx.lineWidth=1.5;
    _prRoundRect(ctx, bx, by, gradeBw, 32, 16); ctx.stroke();
    ctx.fillStyle=data.eloGradeColor||ACCENT; ctx.fillText(gradeTxt, bx+13, by+21);
    bx += gradeBw+10;
  }
  cy = by+32; /* = 200 */

  /* ── 승률 히어로 넘버 (겹침 버그 수정: 라벨→숫자→서브텍스트 순서로 커서를 확실히 내림) ── */
  cy += 34; /* 234: 라벨 baseline */
  ctx.fillStyle='#a8a29e'; ctx.font=`800 13px ${FONT}`;
  _prLetterSpacedText(ctx,'SEASON WIN RATE', PAD, cy, 1.6);
  cy += 92; /* 326: 히어로 숫자 baseline (큰 폰트 캡하이트 고려해 충분히 확보) */
  ctx.fillStyle='#0f172a'; ctx.font=`900 96px ${FONT}`;
  ctx.fillText(`${data.wr}`, PAD, cy);
  const wrNumW = ctx.measureText(`${data.wr}`).width;
  ctx.fillStyle=ACCENT; ctx.font=`900 46px ${FONT}`;
  ctx.fillText('%', PAD+wrNumW+4, cy);
  cy += 38; /* 서브텍스트 baseline — 히어로 숫자와 명확히 분리되는 간격 확보 */
  ctx.fillStyle='#78716c'; ctx.font=`600 17px ${FONT}`;
  ctx.fillText(`통산 ${data.w}승 ${data.l}패  ·  ELO ${data.elo}`, PAD, cy);

  cy += 26;
  ctx.strokeStyle='#d6d3d1'; ctx.lineWidth=1;
  ctx.beginPath(); ctx.moveTo(PAD, cy); ctx.lineTo(colRight, cy); ctx.stroke();

  /* ── 팩트 그리드 2×2: 연승/연패는 색+화살표로 방향성을 즉시 전달 ── */
  const colW=(contentW-30)/2;
  const rowH=60;
  cy += 40;
  const gridTop = cy;
  const facts=[
    ['최고 연승', `▲ ${data.bestWinStreak}연승`, '#dc2626'],
    ['최고 연패', `▼ ${data.bestLoseStreak}연패`, '#2563eb'],
    ['티어 내 순위', data.rank?`${data.rank}위 / ${data.rankTotal}명`:'-', '#0f172a'],
    ['통산 경기수', `${data.tot}전`, '#0f172a']
  ];
  facts.forEach(([lbl,val,valCol],i)=>{
    const col=i%2, row=Math.floor(i/2);
    const fx=PAD+col*(colW+30);
    const yy=gridTop+row*rowH;
    ctx.fillStyle=ACCENT; _prRoundRect(ctx, fx, yy-11, 6, 6, 2); ctx.fill();
    ctx.fillStyle='#a8a29e'; ctx.font=`700 12px ${FONT}`;
    _prLetterSpacedText(ctx, lbl, fx+14, yy, .5);
    ctx.fillStyle=valCol; ctx.font=`800 24px ${FONT}`;
    ctx.fillText(val, fx+14, yy+30);
  });
  ctx.strokeStyle='#e7e5e4'; ctx.lineWidth=1;
  ctx.beginPath(); ctx.moveTo(PAD+colW+15, gridTop-30); ctx.lineTo(PAD+colW+15, gridTop+rowH+6); ctx.stroke();
  cy = gridTop+rowH+30;
  ctx.strokeStyle='#d6d3d1'; ctx.lineWidth=1;
  ctx.beginPath(); ctx.moveTo(PAD, cy); ctx.lineTo(colRight, cy); ctx.stroke();

  /* ── 종족전 승률 미니 바 차트 (숫자 나열 대신 한눈에 비교되도록) ── */
  cy += 32;
  ctx.fillStyle='#a8a29e'; ctx.font=`800 12px ${FONT}`;
  _prLetterSpacedText(ctx,'RACE MATCHUP', PAD, cy, 1.5);
  cy += 24;
  const raceRows=[['T','테란전',data.raceStats.T],['Z','저그전',data.raceStats.Z],['P','프로토스전',data.raceStats.P]];
  const barLabelW=76, barPctW=48, barGap=10;
  const barTrackW=contentW-barLabelW-barPctW-barGap*2;
  raceRows.forEach(([code,lbl,rv])=>{
    const wr=_prWrOf(rv);
    const rc=(typeof _prRaceColor==='function') ? _prRaceColor(code) : '#94a3b8';
    ctx.fillStyle='#57534e'; ctx.font=`700 14px ${FONT}`;
    ctx.fillText(lbl, PAD, cy+13);
    const trackX=PAD+barLabelW+barGap;
    ctx.fillStyle='#e7e5e4'; _prRoundRect(ctx, trackX, cy, barTrackW, 16, 8); ctx.fill();
    ctx.fillStyle=rc; _prRoundRect(ctx, trackX, cy, Math.max(barTrackW*wr/100, wr>0?10:0), 16, 8); ctx.fill();
    ctx.textAlign='right'; ctx.fillStyle='#0f172a'; ctx.font=`800 15px ${FONT}`;
    ctx.fillText(`${wr}%`, colRight, cy+13);
    ctx.textAlign='left';
    cy += 34;
  });

  /* ── 최근 폼 (하단 여백을 데이터로 채움) ── */
  cy += 12;
  ctx.fillStyle='#a8a29e'; ctx.font=`800 12px ${FONT}`;
  _prLetterSpacedText(ctx,'RECENT FORM', PAD, cy, 1.5);
  cy += 14;
  const sq=24, gap=7;
  (data.recentForm||[]).forEach((r,i)=>{
    const x=PAD+i*(sq+gap);
    ctx.fillStyle = r==='W' ? '#dc2626' : '#2563eb';
    _prRoundRect(ctx, x, cy, sq, sq, 5); ctx.fill();
    ctx.fillStyle='#fff'; ctx.font=`800 11px ${FONT}`;
    ctx.textAlign='center';
    ctx.fillText(r, x+sq/2, cy+sq/2+4);
    ctx.textAlign='left';
  });

  /* ── 푸터: 발행 정보 + ISSUE 넘버 ── */
  const footTop = H-76;
  ctx.strokeStyle='#d6d3d1'; ctx.lineWidth=1;
  ctx.beginPath(); ctx.moveTo(PAD, footTop); ctx.lineTo(colRight, footTop); ctx.stroke();
  ctx.fillStyle='#a8a29e'; ctx.font=`600 12px ${FONT}`;
  ctx.fillText(`발행 · star-datacenter · ${new Date().toLocaleDateString('ko-KR')}`, PAD, footTop+30);
  ctx.textAlign='right'; ctx.fillStyle=ACCENT; ctx.font=`900 20px ${FONT}`;
  ctx.fillText('ISSUE 01', colRight, footTop+34);
  ctx.textAlign='left';

  return out;
}

/* ─── 🎫 티켓/보딩패스 스타일 (절취선+바코드, 대학 컬러 테마) ─── */
function _prDrawTicketCanvas(data){
  const FONT = PR_CANVAS_FONT;
  const hasLogo = !!data.univLogoImg;
  const W=1400, H=560;
  const out=document.createElement('canvas'); out.width=W; out.height=H;
  const ctx=out.getContext('2d');
  const stubW=340, mainW=W-stubW;
  const UNIV = data.univColor || '#3b5bdb';
  const ACCENT = _prShadeColor(UNIV, -0.06);
  /* 우측 스텁은 대학 컬러 → 점점 어두워지는 그라디언트 (요청대로 여기만 다크 효과 적용) */
  const stubBg1 = UNIV;
  const stubBg2 = _prShadeColor(UNIV, -0.6);

  /* 카드 전체를 둥근 사각형으로 클리핑해 실제 티켓처럼 라운드 처리 */
  ctx.save();
  _prRoundRect(ctx, 0, 0, W, H, 26);
  ctx.clip();

  /* 좌측 본체: 대학 컬러를 아주 옅게 섞은 밝은 톤 (예쁘고 화사하게) */
  const mainGrad=ctx.createLinearGradient(0,0,mainW,H);
  mainGrad.addColorStop(0,_prShadeColor(UNIV,0.94)); mainGrad.addColorStop(1,_prShadeColor(UNIV,0.88));
  ctx.fillStyle=mainGrad; ctx.fillRect(0,0,mainW,H);
  ctx.fillStyle=UNIV; ctx.fillRect(0,0,mainW,10);

  const stubGrad=ctx.createLinearGradient(mainW,0,W,H);
  stubGrad.addColorStop(0,stubBg1); stubGrad.addColorStop(1,stubBg2);
  ctx.fillStyle=stubGrad; ctx.fillRect(mainW,0,stubW,H);

  /* 여백 없는 얇은 대각선 패턴으로 스텁을 항공권 느낌으로 */
  ctx.save();
  ctx.beginPath(); ctx.rect(mainW,0,stubW,H); ctx.clip();
  ctx.globalAlpha=.08; ctx.strokeStyle='#fff'; ctx.lineWidth=2;
  for(let i=mainW-H;i<W;i+=34){ ctx.beginPath(); ctx.moveTo(i,H); ctx.lineTo(i+H,0); ctx.stroke(); }
  ctx.restore();

  const holeR=16;
  ctx.save();
  ctx.globalCompositeOperation='destination-out';
  ctx.beginPath(); ctx.arc(mainW, 0, holeR, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(mainW, H, holeR, 0, Math.PI*2); ctx.fill();
  ctx.restore();
  /* 절취선을 따라 작은 펀치 홀을 촘촘히 배치해 진짜 절취선처럼 보이도록 */
  ctx.save();
  ctx.globalCompositeOperation='destination-out';
  for(let y=holeR*2+6; y<H-holeR*2; y+=16){ ctx.beginPath(); ctx.arc(mainW,y,2.6,0,Math.PI*2); ctx.fill(); }
  ctx.restore();

  const PAD=40;
  ctx.textAlign='left';
  ctx.fillStyle=ACCENT; ctx.font=`800 12px ${FONT}`;
  _prLetterSpacedText(ctx,'STAR DATA CENTER · BOARDING PASS', PAD, 34, 2);

  /* 프로필 사진을 훨씬 크게 - 본체 좌측을 거의 채우는 크기 */
  const phS=460, phY=52;
  ctx.save();
  ctx.shadowColor=_prHexToRgba(UNIV,.3); ctx.shadowBlur=20; ctx.shadowOffsetY=8;
  _prDrawPhotoInRect(ctx, data.photoImg, PAD, phY, phS, phS, 20, '#d6d3d1', 0.18);
  ctx.restore();
  ctx.strokeStyle=ACCENT; ctx.lineWidth=4;
  _prRoundRect(ctx, PAD, phY, phS, phS, 20); ctx.stroke();

  const tx=PAD+phS+36;
  const tw=mainW-tx-28;
  ctx.fillStyle='#292524'; ctx.font=`900 44px ${FONT}`;
  ctx.fillText(data.name, tx, 118);
  ctx.fillStyle='#78716c'; ctx.font=`700 16px ${FONT}`;
  ctx.fillText(`${data.univ||'-'}  ·  ${data.tier||'-'}  ·  ELO ${data.elo} (${data.eloGrade||''})`, tx, 150);

  const tag = data.wr>=60 ? 'PRIORITY BOARDING' : 'STREAMER PASS';
  ctx.font=`800 12px ${FONT}`;
  const tagW=ctx.measureText(tag).width+22;
  ctx.fillStyle=ACCENT; _prRoundRect(ctx, tx, 168, tagW, 28, 14); ctx.fill();
  ctx.fillStyle='#fff'; ctx.fillText(tag, tx+11, 187);

  ctx.strokeStyle=_prHexToRgba(UNIV,.25); ctx.lineWidth=1;
  ctx.beginPath(); ctx.moveTo(tx, 218); ctx.lineTo(tx+tw, 218); ctx.stroke();

  ctx.fillStyle='#a8a29e'; ctx.font=`700 11px ${FONT}`;
  _prLetterSpacedText(ctx,'WIN RATE', tx, 250, 1.5);
  ctx.fillStyle=ACCENT; ctx.font=`900 84px ${FONT}`;
  ctx.fillText(`${data.wr}%`, tx, 330);
  ctx.fillStyle='#57534e'; ctx.font=`700 16px ${FONT}`;
  ctx.fillText(`${data.w}W ${data.l}L`, tx, 358);

  ctx.strokeStyle=_prHexToRgba(UNIV,.25); ctx.lineWidth=1;
  ctx.beginPath(); ctx.moveTo(tx, 384); ctx.lineTo(tx+tw, 384); ctx.stroke();

  const gates=[['RECORD',`${data.w}W ${data.l}L`],['STREAK',`${data.bestWinStreak}연승`]];
  let gx=tx;
  gates.forEach(([lbl,val])=>{
    ctx.fillStyle='#a8a29e'; ctx.font=`700 11px ${FONT}`;
    _prLetterSpacedText(ctx, lbl, gx, 412, 1.5);
    ctx.fillStyle='#292524'; ctx.font=`900 26px ${FONT}`;
    ctx.fillText(val, gx, 444);
    gx+=Math.min(tw/2, 220);
  });

  let fy = 486;
  ctx.fillStyle='#a8a29e'; ctx.font=`700 11px ${FONT}`;
  _prLetterSpacedText(ctx,'RECENT FORM', tx, fy, 1.5);
  const sq=22, gap=6;
  data.recentForm.forEach((r,i)=>{
    const x=tx+i*(sq+gap);
    ctx.fillStyle = r==='W' ? '#dc2626' : '#2563eb';
    _prRoundRect(ctx, x, fy+10, sq, sq, 4); ctx.fill();
  });

  ctx.save();
  ctx.translate(mainW+stubW/2, 0);
  ctx.textAlign='center';
  ctx.fillStyle='rgba(255,255,255,.7)'; ctx.font=`800 11px ${FONT}`;
  ctx.fillText('STREAMER', 0, 40);
  ctx.fillStyle='#fff'; ctx.font=`900 24px ${FONT}`;
  ctx.fillText(data.name.length>7?data.name.slice(0,7)+'…':data.name, 0, 72);
  ctx.font=`700 13px ${FONT}`; ctx.fillStyle='rgba(255,255,255,.7)';
  ctx.fillText([data.tier, data.eloGrade].filter(Boolean).join(' · ') || '-', 0, 98);

  ctx.beginPath(); ctx.strokeStyle='rgba(255,255,255,.25)'; ctx.lineWidth=6;
  ctx.arc(0,180,52, 0, Math.PI*2); ctx.stroke();
  ctx.beginPath(); ctx.strokeStyle='#fff'; ctx.lineWidth=6;
  ctx.arc(0,180,52, -Math.PI/2, -Math.PI/2 + Math.PI*2*(data.wr/100));
  ctx.stroke();
  ctx.fillStyle='#fff'; ctx.font=`900 26px ${FONT}`;
  ctx.fillText(`${data.wr}%`, 0, 189);

  /* 승률 게이지 아래: 대학 로고만 (원형 배지 없이 로고 자체 모양 그대로, 반투명 스탬프 느낌) */
  if (hasLogo) {
    const logoS = 112, logoCy = 316;
    ctx.save();
    ctx.globalAlpha = 0.72;
    ctx.shadowColor='rgba(0,0,0,.28)'; ctx.shadowBlur=10; ctx.shadowOffsetY=3;
    ctx.drawImage(data.univLogoImg, -logoS/2, logoCy-logoS/2, logoS, logoS);
    ctx.restore();
    ctx.fillStyle='rgba(255,255,255,.85)'; ctx.font=`800 13px ${FONT}`;
    ctx.fillText(data.univ||'', 0, logoCy+logoS/2+22);
  }

  ctx.textAlign='left';
  const bcY=H-84; let bcx=-stubW/2+34;
  const seed = String(data.name||'').split('').reduce((a,c)=>a+c.charCodeAt(0),0) || 42;
  for(let i=0;i<28;i++){
    const bw2 = ((seed*(i+1))%3)+1;
    ctx.fillStyle='rgba(255,255,255,.85)';
    ctx.fillRect(bcx, bcY, bw2, 40);
    bcx+=bw2+3;
  }
  ctx.font=`600 9px ${FONT}`; ctx.fillStyle='rgba(255,255,255,.65)'; ctx.textAlign='center';
  ctx.fillText(`SDC-${seed%9000+1000}`, 0, bcY+56);
  ctx.restore();

  ctx.restore(); /* 카드 라운드 클리핑 해제 */

  ctx.strokeStyle='rgba(0,0,0,.08)'; ctx.lineWidth=1.5;
  _prRoundRect(ctx, .75, .75, W-1.5, H-1.5, 26); ctx.stroke();

  return out;
}

/* ─── 캔버스 생성: 스타일이 바뀌면 카드 사이 배경 톤도 달라져야 하므로 매번 새로 캡처 ─── */
async function _prGenerateReportCanvas(style){
  const p = window._prName ? (players||[]).find(x=>x && x.name===window._prName) : null;
  if(!p) throw new Error('선택된 스트리머가 없습니다.');
  if(style==='esports' || style==='magazine' || style==='ticket'){
    const data = await _prBuildCardData(p);
    if(style==='esports') return _prDrawEsportsCanvas(data);
    if(style==='magazine') return _prDrawMagazineCanvas(data);
    return _prDrawTicketCanvas(data);
  }
  const baseCanvas = await _prCaptureBaseForStyle(style, p);
  return await _prComposeStyledCanvas(baseCanvas, style, p);
}
/* ─── 리포트 전체 이미지 저장 ─── */
async function _prSaveReportImage(){
  const el = document.getElementById('pr-report-capture');
  if(!el){ alert('캡처할 리포트가 없습니다.'); return; }
  const name = window._prName || '스트리머';
  const style = window._prReportBgStyle || 'none';
  try{
    if(typeof _showSaveLoading==='function') _showSaveLoading();
    const canvas = await _prGenerateReportCanvas(style);
    window._prPendingSaveCanvas = canvas;
    window._prPendingSaveName = `${name}_리포트.png`;
    _prShowImagePreview(canvas, style);
  }catch(e){ alert('이미지 저장 오류: '+e.message); }
  finally{ if(typeof _hideSaveLoading==='function') _hideSaveLoading(); }
}
/* ─── 미리보기 안에서 배경 스타일 전환 ─── */
async function _prSwitchBgStyle(style){
  if(window._prBgSwitchBusy) return;
  window._prBgSwitchBusy = true;
  const wrap = document.getElementById('pr-img-preview-overlay');
  if(wrap) wrap.classList.add('pr-bg-loading');
  try{
    const canvas = await _prGenerateReportCanvas(style);
    window._prPendingSaveCanvas = canvas;
    window._prReportBgStyle = style;
    const imgEl = wrap ? wrap.querySelector('.pr-img-preview-body img') : null;
    if(imgEl) imgEl.src = canvas.toDataURL('image/png');
    if(wrap) wrap.querySelectorAll('.pr-bgstyle-btn').forEach(b=>b.classList.toggle('on', b.dataset.style===style));
  }catch(e){ alert('배경 변경 오류: '+e.message); }
  finally{ window._prBgSwitchBusy = false; if(wrap) wrap.classList.remove('pr-bg-loading'); }
}
/* ─── 이미지 저장 전 미리보기 모달 ─── */
function _prShowImagePreview(canvas, style){
  _prCloseImagePreview();
  const dataUrl = canvas.toDataURL('image/png');
  const curStyle = style || window._prReportBgStyle || 'none';
  const p = window._prName ? (players||[]).find(x=>x && x.name===window._prName) : null;
  const wrap = document.createElement('div');
  wrap.id = 'pr-img-preview-overlay';
  wrap.className = 'pr-img-preview-overlay';
  wrap.innerHTML = `
    <div class="pr-img-preview-modal">
      <div class="pr-img-preview-hdr">
        <span>🖼️ 리포트 이미지 미리보기</span>
        <button type="button" class="pr-img-preview-x" onclick="_prCloseImagePreview()">✕</button>
      </div>
      <div class="pr-bgstyle-row">
        ${PR_BG_STYLES.map(([k,lbl])=>{
          const col = _prStyleFrameColor(k, p);
          const dot = col ? `<span class="pr-bgstyle-dot" style="background:${col}"></span>` : `<span class="pr-bgstyle-dot pr-bgstyle-dot--none"></span>`;
          return `<button type="button" class="pr-bgstyle-btn ${k===curStyle?'on':''}" data-style="${k}" onclick="_prSwitchBgStyle('${k}')">${dot}${lbl}</button>`;
        }).join('')}
      </div>
      <div class="pr-img-preview-body"><img src="${dataUrl}" alt="리포트 미리보기"></div>
      <div class="pr-img-preview-ftr">
        <button type="button" class="pr-btn pr-btn-ghost" onclick="_prCloseImagePreview()">취소</button>
        <button type="button" class="pr-btn pr-btn-primary" onclick="_prConfirmSaveImage()">📥 다운로드</button>
      </div>
    </div>`;
  wrap.addEventListener('click', (e)=>{ if(e.target===wrap) _prCloseImagePreview(); });
  document.body.appendChild(wrap);
}
function _prCloseImagePreview(){
  const el = document.getElementById('pr-img-preview-overlay');
  if(el) el.remove();
}
async function _prConfirmSaveImage(){
  const canvas = window._prPendingSaveCanvas;
  const filename = window._prPendingSaveName || '리포트.png';
  _prCloseImagePreview();
  if(!canvas) return;
  try{
    if(typeof _showSaveLoading==='function') _showSaveLoading();
    await _saveCanvasImage(canvas, filename, 'png');
  }catch(e){ alert('이미지 저장 오류: '+e.message); }
  finally{
    if(typeof _hideSaveLoading==='function') _hideSaveLoading();
    window._prPendingSaveCanvas = null;
  }
}

try{
  window.statsPlayerReportHTML = statsPlayerReportHTML;
  window._prSelectPlayer = _prSelectPlayer;
  window._prOnSearchInput = _prOnSearchInput;
  window._prSaveReportImage = _prSaveReportImage;
  window._prScrollToSection = _prScrollToSection;
  window._prCloseNavMore = _prCloseNavMore;
  window._prToggleTierOpp = _prToggleTierOpp;
  window._prCloseImagePreview = _prCloseImagePreview;
  window._prConfirmSaveImage = _prConfirmSaveImage;
}catch(e){}
