/* ══════════════════════════════════════
   CONSTANTS - 티어 순서: god > king > jack > joker > spade > 0티어 > 1티어 ...
══════════════════════════════════════ */
let TIERS = (()=>{const t=J('su_tiers')||['G','K','JA','J','S','0티어','1티어','2티어','3티어','4티어','5티어','6티어','7티어','8티어','유스'];if(!t.includes('미정'))t.push('미정');return t;})();
const RACES=['T','Z','P','N'];
const RNAME={T:'테란',Z:'저그',P:'프로토스',N:'종족미정'};
const RANK_PTS={'🥇 1위':3,'🥈 2위':0,'🥉 3위':-3,'4강':0,'8강':0,'출전':0};

/* ══════════════════════════════════════
   탭 라벨(표시 이름) 설정
   - 내부 id는 유지하고 "표시되는 이름만" 설정에서 교체
   - localStorage: su_tab_labels_v1 (LZString/JSON 모두 지원: J/_lsSave 활용)
══════════════════════════════════════ */
const _TAB_LBL_KEY = 'su_tab_labels_v1';
function getTabLabel(ctx, id, def){
  try{
    const m = J(_TAB_LBL_KEY) || {};
    const v = (m[ctx] && m[ctx][id] != null) ? String(m[ctx][id]) : '';
    return v ? v : def;
  }catch(e){
    return def;
  }
}
function setTabLabel(ctx, id, val){
  try{
    const m = J(_TAB_LBL_KEY) || {};
    m[ctx] = m[ctx] || {};
    const v = String(val||'').trim();
    if(!v) delete m[ctx][id];
    else m[ctx][id] = v;
    _lsSave(_TAB_LBL_KEY, m);
  }catch(e){}
}
function resetTabLabels(ctx){
  try{
    if(!ctx){ localStorage.removeItem(_TAB_LBL_KEY); return; }
    const m = J(_TAB_LBL_KEY) || {};
    delete m[ctx];
    _lsSave(_TAB_LBL_KEY, m);
  }catch(e){}
}
try{
  window.getTabLabel = getTabLabel;
  window.setTabLabel = setTabLabel;
  window.resetTabLabels = resetTabLabels;
}catch(e){}

/* ══════════════════════════════════════
   스트리머 프로필 이미지 공통 스타일
   - 현황판 칩 프로필 이미지 설정(su_bcp_shape)을 "프로필 이미지 모양"의 기준으로도 사용
   - 인라인 스타일에서도 적용 가능하도록 CSS 변수로 노출
══════════════════════════════════════ */
function applyProfileShapeVars(){
  try{
    // (보강) 전역 프로필 모양은 su_profile_shape를 우선 사용하고,
    // 없으면 과거 호환으로 su_bcp_shape(현황판 칩 모양)를 사용
    const shape = localStorage.getItem('su_profile_shape') || localStorage.getItem('su_bcp_shape') || 'circle';
    const radius = (shape === 'square') ? '8px' : '50%';
    document.documentElement.style.setProperty('--su_profile_radius', radius);

    // (추가) 기기별 프로필 이미지 크기 배율
    // - PC/태블릿/모바일 각각 %로 저장
    const w = (typeof window!=='undefined' && window.innerWidth) ? window.innerWidth : 1200;
    const pc = parseInt(localStorage.getItem('su_profile_scale_pc')||'100',10) || 100;
    const tb = parseInt(localStorage.getItem('su_profile_scale_tb')||'96',10) || 96;
    const mb = parseInt(localStorage.getItem('su_profile_scale_mb')||'92',10) || 92;
    const pct = (w<=768) ? mb : (w<=1024 ? tb : pc);
    const sc = Math.max(0.7, Math.min(1.3, pct/100));
    document.documentElement.style.setProperty('--su_profile_scale', String(sc));

    // (추가) 프로필 이미지 효과
    const fx = (localStorage.getItem('su_profile_fx')||'none').trim();
    let shadow = 'none';
    if(fx==='shadow') shadow = '0 6px 16px rgba(0,0,0,.18)';
    if(fx==='ring') shadow = '0 0 0 2px rgba(255,255,255,.85)';
    if(fx==='both') shadow = '0 0 0 2px rgba(255,255,255,.85), 0 6px 16px rgba(0,0,0,.18)';
    document.documentElement.style.setProperty('--su_profile_fx', shadow);
  }catch(e){
    console.warn('[applyProfileShapeVars] CSS 변수 설정 실패:', e.message);
  }
}
// 초기 1회 적용
try{ applyProfileShapeVars(); }catch(e){
  console.warn('[applyProfileShapeVars 초기화] 실패:', e.message);
}
// 화면 크기 변경 시도 반영
try{
  if(!window.__suProfileShapeResizeBound){
    window.__suProfileShapeResizeBound=true;
    window.addEventListener('resize', ()=>{ try{ applyProfileShapeVars(); }catch(e){}; }, {passive:true});
  }
}catch(e){}

/* ══════════════════════════════════════
   대학 로고 공통 스타일 (현황판/설정 등)
   - 모양/크기/레이아웃(박스) 크기를 CSS 변수로 노출
══════════════════════════════════════ */
function applyUnivLogoVars(){
  try{
    const shape = localStorage.getItem('su_ul_shape') || 'circle'; // circle|square
    const size  = parseInt(localStorage.getItem('su_ul_size') || '34', 10);
    const box   = parseInt(localStorage.getItem('su_ul_box')  || '46', 10);
    // 대학 상세(대학 모달) 전용 크기 (없으면 기본 크기 사용)
    const dSize = parseInt(localStorage.getItem('su_ul_size_detail') || String(size), 10);
    const dBox  = parseInt(localStorage.getItem('su_ul_box_detail')  || String(box), 10);
    const radius = (shape === 'square') ? '10px' : '50%';
    document.documentElement.style.setProperty('--su_univ_logo_radius', radius);
    document.documentElement.style.setProperty('--su_univ_logo_size', size + 'px');
    document.documentElement.style.setProperty('--su_univ_logo_box', box + 'px');
    // 대학 상세(모달)용
    document.documentElement.style.setProperty('--su_univ_logo_size_detail', dSize + 'px');
    document.documentElement.style.setProperty('--su_univ_logo_box_detail', dBox + 'px');

    // (추가) 모바일/태블릿에서 대학 상세(모달) 헤더가 너무 커 보이는 문제 완화
    // - 저장값(기본 크기)은 유지하고, 화면폭에 따라 "표시용 배율"만 적용한다.
    const w = (typeof window!=='undefined' && window.innerWidth) ? window.innerWidth : 1200;
    const ds = (w<=768) ? 0.82 : (w<=1024 ? 0.90 : 1);
    document.documentElement.style.setProperty('--su_univ_detail_scale', String(ds));
  }catch(e){
    console.warn('[applyUnivLogoVars] CSS 변수 설정 실패:', e.message);
  }
}
try{ applyUnivLogoVars(); }catch(e){
  console.warn('[applyUnivLogoVars 초기화] 실패:', e.message);
}
// 화면 크기 변경 시도 반영
try{
  if(!window.__suUnivLogoResizeBound){
    window.__suUnivLogoResizeBound=true;
    window.addEventListener('resize', ()=>{ try{ applyUnivLogoVars(); }catch(e){}; }, {passive:true});
  }
}catch(e){}

/* ══════════════════════════════════════
   현황판(board2) 대학 로고 크기
══════════════════════════════════════ */
function applyBoard2LogoVars(){
  try{
    const px = parseInt(localStorage.getItem('su_b2_univ_logo_size') || '42', 10);
    const v = Math.max(24, Math.min(80, isNaN(px) ? 42 : px));
    document.documentElement.style.setProperty('--su_b2_univ_logo_size', v + 'px');
  }catch(e){
    console.warn('[applyBoard2LogoVars] CSS 변수 설정 실패:', e.message);
  }
}
try{ applyBoard2LogoVars(); }catch(e){}

/* ══════════════════════════════════════
   📱 반응형 UI 크기(버튼/메뉴/배지) 변수 적용
══════════════════════════════════════ */
function applyResponsiveUiVars(){
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const gf=(k,def)=>{ try{ const v=parseFloat(localStorage.getItem(k)); return isNaN(v)?def:v; }catch(e){ return def; } };
  try{
    // 전체 버튼/메뉴 스케일(모바일/태블릿)
    const mb = clamp(gf('su_mb_scale', 0.88), 0.65, 1.10);
    const tb = clamp(gf('su_tb_scale', 0.92), 0.65, 1.10);
    const mmb = clamp(gf('su_modal_mb_scale', 0.70), 0.55, 1.10);
    const mtb = clamp(gf('su_modal_tb_scale', 0.78), 0.55, 1.10);
    const mbTab = clamp(gf('su_tab_mb_scale', 0.90), 0.65, 1.10);
    const tbTab = clamp(gf('su_tab_tb_scale', 0.94), 0.65, 1.10);
    const mdMb = clamp(gf('su_md_mb_btn_scale', 1.00), 0.70, 1.30);
    const mdTb = clamp(gf('su_md_tb_btn_scale', 1.00), 0.70, 1.30);
    const badge = clamp(gf('su_pd_badge_scale', 1.00), 0.70, 1.30);
    const chip = clamp(gf('su_pd_chip_scale', 1.00), 0.70, 1.30);

    document.documentElement.style.setProperty('--su_mb_scale', String(mb));
    document.documentElement.style.setProperty('--su_tb_scale', String(tb));
    document.documentElement.style.setProperty('--su_modal_mb_scale', String(mmb));
    document.documentElement.style.setProperty('--su_modal_tb_scale', String(mtb));
    document.documentElement.style.setProperty('--su_tab_mb_scale', String(mbTab));
    document.documentElement.style.setProperty('--su_tab_tb_scale', String(tbTab));
    document.documentElement.style.setProperty('--su_md_mb_btn_scale', String(mdMb));
    document.documentElement.style.setProperty('--su_md_tb_btn_scale', String(mdTb));
    document.documentElement.style.setProperty('--su_pd_badge_scale', String(badge));
    document.documentElement.style.setProperty('--su_pd_chip_scale', String(chip));
  }catch(e){}
}
try{ window.applyResponsiveUiVars = applyResponsiveUiVars; }catch(e){}
try{ applyResponsiveUiVars(); }catch(e){}
try{
  if(!window.__suResponsiveUiResizeBound){
    window.__suResponsiveUiResizeBound=true;
    window.addEventListener('resize', ()=>{ try{ applyResponsiveUiVars(); }catch(e){}; }, {passive:true});
  }
}catch(e){}

/* ══════════════════════════════════════
   대학별 로고 크기(대학상세/스트리머탭)
   - univCfg에 대학별로 저장:
     * logoSizeDetail  (대학 상세 모달 로고 크기)
     * logoSizePlayers (스트리머탭(전체) 대학 로고 크기)
══════════════════════════════════════ */
function getUnivLogoSizeStr(univName, ctx, fallback){
  try{
    const u = (univCfg||[]).find(x=>x && x.name===univName) || null;
    if(u){
      if(ctx==='detail' && u.logoSizeDetail)  return String(parseInt(u.logoSizeDetail,10))+'px';
      if(ctx==='players' && u.logoSizePlayers) return String(parseInt(u.logoSizePlayers,10))+'px';
    }
  }catch(e){}
  return fallback;
}
try{ window.getUnivLogoSizeStr = getUnivLogoSizeStr; }catch(e){}

/* ══════════════════════════════════════
   경기 상세(팝업) 승/패 배경 강도 설정
   - 승자: 대학색 tint(투명도) 조절 (localStorage: su_md_win_tint)
   - 패자: 회색 배경 강도 조절 (localStorage: su_md_lose_gray)
══════════════════════════════════════ */
function applyMatchDetailVars(){
  try{
    const losePct = parseInt(localStorage.getItem('su_md_lose_gray') || '12', 10);
    const lp = Math.max(0, Math.min(30, isNaN(losePct) ? 12 : losePct));
    document.documentElement.style.setProperty('--su_md_lose_gray', String(lp/100));

    // 상단 대학 로고(대학 카드) 크기
    const logoSize = parseInt(localStorage.getItem('su_md_logo_size') || '42', 10);
    const ls = Math.max(28, Math.min(64, isNaN(logoSize) ? 42 : logoSize));
    document.documentElement.style.setProperty('--su_md_logo_size', ls + 'px');

    // 상단 대학 카드 정렬/폰트
    const align = (localStorage.getItem('su_md_head_align') || 'center').trim();
    const justify =
      align === 'left' ? 'flex-start' :
      align === 'right' ? 'flex-end' : 'center';
    const textAlign =
      align === 'left' ? 'left' :
      align === 'right' ? 'right' : 'center';
    const teamFont = parseInt(localStorage.getItem('su_md_team_font') || '16', 10);
    const tf = Math.max(11, Math.min(26, isNaN(teamFont) ? 16 : teamFont));
    const titleFont = parseInt(localStorage.getItem('su_md_title_font') || '15', 10);
    const ttf = Math.max(12, Math.min(24, isNaN(titleFont) ? 15 : titleFont));
    const subFont = parseInt(localStorage.getItem('su_md_sub_font') || '11', 10);
    const sf = Math.max(10, Math.min(18, isNaN(subFont) ? 11 : subFont));
    document.documentElement.style.setProperty('--su_md_head_justify', justify);
    document.documentElement.style.setProperty('--su_md_head_text_align', textAlign);
    document.documentElement.style.setProperty('--su_md_team_font', tf + 'px');
    document.documentElement.style.setProperty('--su_md_title_font', ttf + 'px');
    document.documentElement.style.setProperty('--su_md_sub_font', sf + 'px');

    // ── 헤더 애니메이션/효과 설정 ──
    const fxOn = (localStorage.getItem('su_md_fx_on') ?? '1') !== '0';
    const fxPreset = (localStorage.getItem('su_md_fx_preset') || 'classic').trim(); // classic|aurora|sunset|minimal
    const fxAnim = (localStorage.getItem('su_md_fx_anim') || 'both').trim(); // both|wave|shimmer|pulse|glint
    const fxSpeedMul = parseFloat(localStorage.getItem('su_md_fx_speed_mul') || '1');
    const sm = isNaN(fxSpeedMul) ? 1 : Math.max(0.5, Math.min(2.2, fxSpeedMul));
    const fxIntPct = parseInt(localStorage.getItem('su_md_fx_int') || '100', 10);
    const ip = Math.max(0, Math.min(150, isNaN(fxIntPct) ? 100 : fxIntPct)) / 100;

    // 기본값 (파랑)
    let headC1='#1e3a8a', headC2='#2563eb';
    let scoreC1='rgba(2,132,199,.09)', scoreC2='rgba(2,132,199,.02)';
    if(fxPreset==='aurora'){
      headC1='#4c1d95'; headC2='#0ea5e9';
      scoreC1='rgba(139,92,246,.10)'; scoreC2='rgba(14,165,233,.03)';
    }else if(fxPreset==='sunset'){
      headC1='#9f1239'; headC2='#f97316';
      scoreC1='rgba(244,63,94,.10)'; scoreC2='rgba(249,115,22,.03)';
    }else if(fxPreset==='minimal'){
      headC1='#0f172a'; headC2='#334155';
      scoreC1='rgba(148,163,184,.08)'; scoreC2='rgba(148,163,184,.02)';
    }

    // 애니메이션 이름 결정 (CSS 변수로 제어)
    let scoreAnim = 'cmdScoreWave';
    let scoreSparkleAnim = 'cmdScoreSparkle';
    let shimmerAnim = 'cmdTeamShimmer';
    if(fxAnim==='pulse'){
      scoreAnim = 'cmdScoreWave';
      scoreSparkleAnim = 'cmdScorePulse';
      shimmerAnim = 'cmdTeamPulse';
    }else if(fxAnim==='glint'){
      scoreAnim = 'cmdScoreWave';
      scoreSparkleAnim = 'cmdScoreSparkle';
      shimmerAnim = 'cmdTeamGlint';
    }else if(fxAnim==='wave'){
      scoreAnim = 'cmdScoreWave';
      scoreSparkleAnim = 'cmdScoreSparkle';
      shimmerAnim = 'none';
    }else if(fxAnim==='shimmer'){
      scoreAnim = 'none';
      scoreSparkleAnim = 'none';
      shimmerAnim = 'cmdTeamShimmer';
    }else{ // both
      scoreAnim = 'cmdScoreWave';
      scoreSparkleAnim = 'cmdScoreSparkle';
      shimmerAnim = 'cmdTeamShimmer';
    }

    if(!fxOn){
      scoreAnim = 'none';
      scoreSparkleAnim = 'none';
      shimmerAnim = 'none';
    }

    document.documentElement.style.setProperty('--su_md_fx_speed_mul', String(sm));
    document.documentElement.style.setProperty('--su_md_fx_int', String(ip));
    document.documentElement.style.setProperty('--su_md_fx_head_c1', headC1);
    document.documentElement.style.setProperty('--su_md_fx_head_c2', headC2);
    document.documentElement.style.setProperty('--su_md_fx_score_c1', scoreC1);
    document.documentElement.style.setProperty('--su_md_fx_score_c2', scoreC2);
    document.documentElement.style.setProperty('--su_md_fx_score_anim', scoreAnim);
    document.documentElement.style.setProperty('--su_md_fx_score_sparkle_anim', scoreSparkleAnim);
    document.documentElement.style.setProperty('--su_md_fx_shimmer_anim', shimmerAnim);
  }catch(e){
    console.warn('[applyMatchDetailVars] CSS 변수 설정 실패:', e.message);
  }
}

// (추가) 2:2 팀전(2명 vs 2명)도 개인 ELO/승패에 반영
// - teamA/teamB: ["영희","철수"] 형태의 선수명 배열
// - winnerSide: 'A' 또는 'B' (A팀 승 / B팀 승)
// - 개별 전적은 "상대팀(콤마)"를 opp로 기록 (예: "민수,영지수")
function applyTeamGameResult(teamA, teamB, winnerSide, date, map, matchId, mode){
  try{
    const A = Array.isArray(teamA) ? teamA.map(s=>String(s||'').trim()).filter(Boolean) : [];
    const B = Array.isArray(teamB) ? teamB.map(s=>String(s||'').trim()).filter(Boolean) : [];
    if(A.length < 2 || B.length < 2) return;
    const _find = (name) => players.find(x=>x.name===name) || null;
    const pA = A.map(_find).filter(Boolean);
    const pB = B.map(_find).filter(Boolean);
    if(pA.length < 2 || pB.length < 2) return;

    const d = date || new Date().toISOString().slice(0,10);
    const m = map || '-';
    const mid = String(matchId||'').trim();
    const oppA = B.join(',');
    const oppB = A.join(',');

    // 중복 방지: 각 선수 history에 동일 matchId 있으면 중단
    const hasDup = (p) => !!(mid && (p.history||[]).some(h => h.matchId === mid));
    if(pA.some(hasDup) || pB.some(hasDup)) return;

    // 팀 ELO는 평균으로 계산 (단순)
    const avg = (arr) => arr.reduce((s,x)=>s+(x.elo||ELO_DEFAULT),0) / (arr.length||1);
    const eloA = avg(pA);
    const eloB = avg(pB);
    const aWin = (winnerSide === 'A');
    const wElo = aWin ? eloA : eloB;
    const lElo = aWin ? eloB : eloA;
    const delta = calcElo(wElo, lElo);
    const t = Date.now();

    const applyOne = (p, isWin, oppStr) => {
      if(!p.history) p.history=[];
      if(isWin){ p.win++; p.points+=3; }
      else { p.loss++; p.points-=3; }
      const cur = p.elo || ELO_DEFAULT;
      p.elo = cur + (isWin ? delta : -delta);
      p.history.unshift({
        date:d,time:t,
        result:isWin?'승':'패',
        opp:oppStr, oppRace:'',
        map:m, matchId:mid,
        eloDelta: isWin ? delta : -delta,
        eloAfter: p.elo,
        univ: p.univ||'',
        mode: mode||'',
        _team:true
      });
    };

    pA.forEach(p => applyOne(p, aWin, oppA));
    pB.forEach(p => applyOne(p, !aWin, oppB));
  }catch(e){}
}
try{ applyMatchDetailVars(); }catch(e){
  console.warn('[applyMatchDetailVars 초기화] 실패:', e.message);
}

function _hexToRgbObj(hex){
  const h=String(hex||'').replace('#','').trim();
  if(h.length===3){
    const r=parseInt(h[0]+h[0],16), g=parseInt(h[1]+h[1],16), b=parseInt(h[2]+h[2],16);
    return {r:isNaN(r)?100:r, g:isNaN(g)?116:g, b:isNaN(b)?139:b};
  }
  if(h.length>=6){
    const r=parseInt(h.slice(0,2),16), g=parseInt(h.slice(2,4),16), b=parseInt(h.slice(4,6),16);
    return {r:isNaN(r)?100:r, g:isNaN(g)?116:g, b:isNaN(b)?139:b};
  }
  return {r:100,g:116,b:139};
}
function getMatchWinTint(hex){
  try{
    const pct = parseInt(localStorage.getItem('su_md_win_tint') || '13', 10);
    const p = Math.max(0, Math.min(30, isNaN(pct) ? 13 : pct));
    const a = p/100;
    const {r,g,b}=_hexToRgbObj(hex);
    return `rgba(${r},${g},${b},${a})`;
  }catch(e){
    // fallback: 기존 0x22(약 13%)
    return String(hex||'#64748b') + '22';
  }
}
function escJS(s){
  return String(s??'')
    .replace(/\\/g,'\\\\')
    .replace(/'/g,"\\'")
    .replace(/\r/g,'\\r')
    .replace(/\n/g,'\\n');
}
function escAttr(s){
  return String(s??'')
    .replace(/&/g,'&amp;')
    .replace(/"/g,'&quot;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;');
}

function getTierBadge(tier){
  if(!tier) return '';
  const ic=(_TIER_ICON&&_TIER_ICON[tier])||'';
  const bg=getTierBtnColor(tier)||'#64748b';
  const col=getTierBtnTextColor(tier)||'#fff';
  // 현황판과 동일한 그라디언트 스타일 (box-shadow 포함)
  const shadowMap={
    'G':'0 2px 14px rgba(124,58,237,.55),0 0 0 1px rgba(167,139,250,.3)',
    'K':'0 2px 10px rgba(26,42,82,.5),0 0 0 1px rgba(226,201,126,.2)',
    'JA':'0 2px 10px rgba(12,74,92,.5)',
    'J':'0 2px 10px rgba(6,78,59,.5)',
    'S':'0 2px 10px rgba(30,58,95,.5)',
  };
  const shadow=shadowMap[tier]||'0 1px 5px rgba(0,0,0,.25)';
  return `<span class="tbadge" style="background:${bg};color:${col};box-shadow:${shadow};border-radius:6px;padding:3px 8px;font-size:11px;font-weight:800;letter-spacing:.3px;white-space:nowrap;display:inline-flex;align-items:center;gap:3px">${ic?ic+' ':''}${tier}</span>`;
}

function getTierLabel(tier){
  const icons=_TIER_ICON||{G:'✨',K:'👑',JA:'⚔️',J:'🃏',S:'♠',유스:'🐣',미정:'❓'};
  const labels={G:'G (God)',K:'K (King)',JA:'JA (Jack)',J:'J (Joker)',S:'S (Spade)',유스:'유스',미정:'미정 (미확인)'};
  const ic=icons[tier]||'';
  return ic?`${ic} ${labels[tier]||tier}`:tier;
}

function getTierPillLabel(tier){
  const icons=_TIER_ICON||{G:'✨',K:'👑',JA:'⚔️',J:'🃏',S:'♠️',유스:'🐣',미정:'❓'};
  const labels={G:'G (God)',K:'K (King)',JA:'JA (Jack)',J:'J (Joker)',S:'S (Spade)',유스:'유스',미정:'미정 (미확인)'};
  return icons[tier]?`${icons[tier]} ${labels[tier]||tier}`:tier;
}

// ── (설정) 티어 색상/이모지 커스텀 ──
const _TIER_THEME_KEY = 'su_tier_theme_v1';
const _TIER_DEFAULT_BG = {
  'G':'#5b21b6','K':'#1e3a8a','JA':'#0e6280','J':'#065f46','S':'#2952a3',
  '0티어':'#1d4ed8','1티어':'#2558d0','2티어':'#3268d8','3티어':'#4a7ee8',
  '4티어':'#6092f4','5티어':'#74a4f4','6티어':'#86b2ec','7티어':'#98bee4','8티어':'#a8c8dc',
  '유스':'#b45309','미정':'#94a3b8'
};
const _TIER_DEFAULT_TEXT = {
  '4티어':'#1a3a8a','5티어':'#1a3a8a','6티어':'#1d4ed8','7티어':'#1a4070','8티어':'#1a4070','미정':'#fff'
};
const _TIER_DEFAULT_ICON = {G:'✨',K:'👑',JA:'⚔️',J:'🃏',S:'♠',유스:'🐣',미정:'❓'};

let _TIER_BG = {..._TIER_DEFAULT_BG};      // base
let _TIER_TEXT = {..._TIER_DEFAULT_TEXT}; // base (optional overrides)
let _TIER_ICON = {..._TIER_DEFAULT_ICON};
let _TIER_SAT = 1.0; // 0.5~1.6
let _TIER_BRI = 1.0; // 0.6~1.6 (lightness multiplier)

function _clamp01(x){ return Math.max(0, Math.min(1, x)); }
function _rgbToHsl(r,g,b){
  r/=255; g/=255; b/=255;
  const max=Math.max(r,g,b), min=Math.min(r,g,b);
  let h=0, s=0, l=(max+min)/2;
  if(max!==min){
    const d=max-min;
    s = l>0.5 ? d/(2-max-min) : d/(max+min);
    switch(max){
      case r: h=(g-b)/d + (g<b?6:0); break;
      case g: h=(b-r)/d + 2; break;
      case b: h=(r-g)/d + 4; break;
    }
    h/=6;
  }
  return {h,s,l};
}
function _hslToRgb(h,s,l){
  const hue2rgb=(p,q,t)=>{
    if(t<0) t+=1; if(t>1) t-=1;
    if(t<1/6) return p+(q-p)*6*t;
    if(t<1/2) return q;
    if(t<2/3) return p+(q-p)*(2/3-t)*6;
    return p;
  };
  let r,g,b;
  if(s===0){ r=g=b=l; }
  else{
    const q = l<0.5 ? l*(1+s) : l+s-l*s;
    const p = 2*l-q;
    r=hue2rgb(p,q,h+1/3);
    g=hue2rgb(p,q,h);
    b=hue2rgb(p,q,h-1/3);
  }
  return {r:Math.round(r*255), g:Math.round(g*255), b:Math.round(b*255)};
}
function _rgbToHex(r,g,b){
  const to=(n)=>String(n.toString(16)).padStart(2,'0');
  return `#${to(Math.max(0,Math.min(255,r)))}${to(Math.max(0,Math.min(255,g)))}${to(Math.max(0,Math.min(255,b)))}`;
}
function _hexToRgb(hex){
  const {r,g,b}=_hexToRgbObj(hex);
  return {r,g,b};
}
function _tierFiltered(hex){
  try{
    const {r,g,b}=_hexToRgb(hex);
    const hsl=_rgbToHsl(r,g,b);
    const s=_clamp01(hsl.s * (isNaN(_TIER_SAT)?1:_TIER_SAT));
    const l=_clamp01(hsl.l * (isNaN(_TIER_BRI)?1:_TIER_BRI));
    const rgb=_hslToRgb(hsl.h, s, l);
    return _rgbToHex(rgb.r, rgb.g, rgb.b);
  }catch(e){
    return hex||'#64748b';
  }
}
function _autoTextColor(bgHex){
  try{
    const {r,g,b}=_hexToRgb(bgHex);
    // relative luminance
    const lum = (0.2126*r + 0.7152*g + 0.0722*b)/255;
    return lum > 0.62 ? '#0f172a' : '#ffffff';
  }catch(e){ return '#fff'; }
}

function getTierBtnColor(tier){
  const base = _TIER_BG[tier] || '#64748b';
  return _tierFiltered(base);
}
function getTierBtnTextColor(tier){
  const base = _TIER_TEXT[tier];
  if(base) return base;
  return _autoTextColor(getTierBtnColor(tier));
}

function getTierTheme(){
  return {
    bg: {..._TIER_BG},
    text: {..._TIER_TEXT},
    icon: {..._TIER_ICON},
    sat: _TIER_SAT,
    bri: _TIER_BRI
  };
}
function setTierTheme(patch){
  try{
    const cur=getTierTheme();
    const next={
      ...cur,
      ...patch,
      bg: {...cur.bg, ...(patch?.bg||{})},
      text: {...cur.text, ...(patch?.text||{})},
      icon: {...cur.icon, ...(patch?.icon||{})}
    };
    _TIER_BG = {..._TIER_DEFAULT_BG, ...next.bg};
    _TIER_TEXT = {..._TIER_DEFAULT_TEXT, ...next.text};
    _TIER_ICON = {..._TIER_DEFAULT_ICON, ...next.icon};
    _TIER_SAT = Math.max(0.5, Math.min(1.6, parseFloat(next.sat)||1));
    _TIER_BRI = Math.max(0.6, Math.min(1.6, parseFloat(next.bri)||1));
    localStorage.setItem(_TIER_THEME_KEY, JSON.stringify({
      bg:_TIER_BG, text:_TIER_TEXT, icon:_TIER_ICON, sat:_TIER_SAT, bri:_TIER_BRI
    }));
  }catch(e){}
}
function resetTierTheme(){
  try{
    localStorage.removeItem(_TIER_THEME_KEY);
    _TIER_BG = {..._TIER_DEFAULT_BG};
    _TIER_TEXT = {..._TIER_DEFAULT_TEXT};
    _TIER_ICON = {..._TIER_DEFAULT_ICON};
    _TIER_SAT = 1.0;
    _TIER_BRI = 1.0;
  }catch(e){}
}
// init
try{
  const raw = localStorage.getItem(_TIER_THEME_KEY);
  if(raw){
    const obj = JSON.parse(raw)||{};
    setTierTheme(obj);
  }
}catch(e){}
// expose for settings
window.getTierTheme = getTierTheme;
window.setTierTheme = setTierTheme;
window.resetTierTheme = resetTierTheme;

/* ══════════════════════════════════════
   직책 시스템
   - MAIN_ROLES: 정렬 순서에 영향, 표시+정렬
   - SUB_ROLES: 표시만 (학생회장, 오락부장 등)
══════════════════════════════════════ */
const MAIN_ROLES = ['이사장','동아리 회장','총장','부총장','총괄','교수','코치','대표'];
const ROLE_ICONS = {'이사장':'👔','동아리 회장':'🏅','총장':'🎓','부총장':'📚','총괄':'🏛️','교수':'🏫','코치':'🎯','대표':'👥'};
const ROLE_COLORS = {'이사장':'#6d28d9','동아리 회장':'#0f766e','총장':'#b91c1c','부총장':'#b45309','총괄':'#0c6e9e','교수':'#1d4ed8','코치':'#0e7490','대표':'#8b5cf6'};

function getRoleOrder(role){
  // Representative=0, President=0, Captain=0, Club President=0, Class President=0, Dean=1, Vice Dean=2, Director=2(tie), Professor=3, Coach=4, Other=99
  const ORDER = {'대표':0,'이사장':0,'선장':0,'동아리장':0,'동아리 회장':0,'반장':0,'총장':1,'부총장':2,'총괄':2,'교수':3,'코치':4};
  if(!role) return 99;
  return role in ORDER ? ORDER[role] : 99;
}
function getRoleBadgeHTML(role, size='11px'){
  if(!role) return '';
  const icon = ROLE_ICONS[role]||'🏷️';
  const col = ROLE_COLORS[role]||'#6b7280';
  // MAIN_ROLES는 진한 배경색, 그 외는 연한 배경
  const isMain = MAIN_ROLES.includes(role);
  if(isMain){
    return `<span style="font-size:${size};padding:2px 7px;border-radius:5px;background:${col};color:#fff;font-weight:800;white-space:nowrap;flex-shrink:0;letter-spacing:.3px;text-shadow:0 1px 2px rgba(0,0,0,.2)">${icon} ${role}</span>`;
  }
  return `<span style="font-size:${size};padding:1px 6px;border-radius:4px;background:${col}20;color:${col};border:1px solid ${col}44;font-weight:700;white-space:nowrap;flex-shrink:0">${icon} ${role}</span>`;
}

/* ══════════════════════════════════════
   DATA LOAD
══════════════════════════════════════ */
function J(k){
  try{
    const v=localStorage.getItem(k);
    if(!v)return null;
    // LZ-String 압축 여부 자동 감지: 압축된 데이터는 JSON으로 파싱 불가
    if(typeof LZString!=='undefined'){
      try{return JSON.parse(v);}catch{
        const d=LZString.decompressFromUTF16(v);
        return d?JSON.parse(d):null;
      }
    }
    return JSON.parse(v);
  }catch{return null;}
}
function _lsSave(k,obj){
  const s=JSON.stringify(obj);
  if(typeof LZString!=='undefined'){
    localStorage.setItem(k,LZString.compressToUTF16(s));
  }else{
    localStorage.setItem(k,s);
  }
}

// (복구/호환) su_p가 {v:2,p:[...],d:{...}} 형태여도 정상 동작하도록 unpack
function _unpackPlayers(raw){
  try{
    if(!raw) return [];
    if(Array.isArray(raw)) return raw;
    if(typeof raw!=='object') return [];
    if(raw.v!==2 || !Array.isArray(raw.p) || !raw.d) return [];
    const d=raw.d||{};
    const res=d.res||[], opp=d.opp||[], race=d.race||[], map=d.map||[], univ=d.univ||[], mode=d.mode||[];
    const get=(arr,i)=> (i==null||i<0)?'':(arr[i]||'');
    return raw.p.map(pp=>{
      const p={...pp};
      const hp=Array.isArray(p.h)?p.h:[];
      p.history = hp.map(r=>({
        date: r[0]||'',
        time: r[1]||0,
        result: get(res, r[2]),
        opp: get(opp, r[3]),
        oppRace: get(race, r[4]),
        map: get(map, r[5]),
        matchId: r[6]||'',
        eloDelta: (r[7]===undefined?null:r[7]),
        univ: get(univ, r[8]),
        mode: get(mode, r[9]),
        score: r[10]||'',
        ...(r[11]?{_team:true}:{})
      }));
      delete p.h;
      return p;
    });
  }catch(e){
    return [];
  }
}

let playersRaw = J('su_p')  || [];
let players    = _unpackPlayers(playersRaw) || [];
// 사진 분리 저장 지원: su_pp에 {이름:base64} 형태로 저장된 사진을 players에 병합
(function(){const _pp=J('su_pp');if(_pp&&typeof _pp==='object'&&Array.isArray(players))players.forEach(p=>{if(!p.photo&&_pp[p.name])p.photo=_pp[p.name];});})();
let boardOrder = J('su_boardOrder') || []; // 현황판 대학 순서
let univCfg    = J('su_u')  || [{name:'흑카데미',color:'#1e3a8a'},{name:'JSA',color:'#c2410c'},{name:'늪지대',color:'#15803d'},{name:'무소속',color:'#6b7280'}];
let maps       = J('su_m')  || ['투혼','서킷','블리츠','신 개마고원'];
let userMapAlias = J('su_mAlias') || {};   // 사용자 정의 맵 약자 { '약자': '전체이름' }
let tourD      = J('su_t')  || Array(15).fill('');
let miniM      = J('su_mm') || [];
let univM      = J('su_um') || [];
let comps      = J('su_cm') || [];
let ckM        = J('su_ck') || [];
let compNames  = J('su_cn') || [];
let curComp    = J('su_cc') || '';
// 프로리그 데이터
let proM       = J('su_pro') || [];
// 프로리그 개인 대회: [{id,name,groups:[{name,players:[],matches:[{a,b,winner,d,map}]}]}]
let proTourneys = J('su_ptn') || [];
let curProComp  = J('su_ptc') || '';
// 대회 조편성: [{id,name,groups:[{name,univs:[],matches:[{a,b,sa,sb,sets:[]}]}]}]
let tourneys   = J('su_tn') || [];
let ttM        = J('su_ttm') || [];
let _ttCurComp = J('su_ttcur') || '';
let _ttSub     = 'records';
let indM       = J('su_indm') || [];
let gjM        = J('su_gjm')  || [];
let notices    = J('su_notices') || [];
// (요청사항) 보라크루 기능 삭제: 기존 저장 키 정리
try{ localStorage.removeItem('su_crew'); localStorage.removeItem('su_crewcfg'); }catch(e){}

let BLD = {};
let openDetails = {};
let tierRankModeFilter = '전체';

// ── 선수별 상태 아이콘 시스템 ──────────────────────────────
let playerStatusIcons = J('su_psi') || {};
let playerStatusExpiry = J('su_psi_expiry') || {};
const STATUS_ICON_DEFS = {
  none:    { label: '없음',     emoji: '' },
  fire:    { label: '🔥 불',    emoji: '🔥' },
  water:   { label: '💧 물',    emoji: '💧' },
  cloud:   { label: '☁️ 구름',  emoji: '☁️' },
  ice:     { label: '🧊 얼음',  emoji: '🧊' },
  up:      { label: '⬆️ 상승',  emoji: '⬆️' },
  down:    { label: '⬇️ 하락',  emoji: '⬇️' },
  lightning:{ label: '⚡ 벼락', emoji: '⚡' },
  chick:   { label: '🐣 병아리', emoji: '🐣' },
  tiger:   { label: '🐯 호랑이', emoji: '🐯' },
  lion:    { label: '🦁 사자',  emoji: '🦁' },
  cloudy:  { label: '🌥️ 흐림',  emoji: '🌥️' },
  smile:   { label: '😊 웃음',  emoji: '😊' },
  cry:     { label: '😭 울음',  emoji: '😭' },
  blank:   { label: '😐 생각없음', emoji: '😐' },
  sad:     { label: '😢 슬픔',  emoji: '😢' },
  sob:     { label: '😩 통곡',  emoji: '😩' },
  cool:    { label: '😎 COOL',  emoji: '😎' },
  star2:   { label: '⭐ 스타',  emoji: '⭐' },
  crown:   { label: '👑 왕관',  emoji: '👑' },
  hot2:    { label: '🥵 핫',    emoji: '🥵' },
  star3:   { label: '🌟 빛나는별',emoji: '🌟' },
  new2:    { label: '🆕 NEW',   emoji: '🆕' },
  trophy:  { label: '🏆 트로피', emoji: '🏆' },
  diamond: { label: '💎 다이아', emoji: '💎' },
  skull:   { label: '💀 해골',  emoji: '💀' },
  muscle:  { label: '💪 강함',  emoji: '💪' },
  think:   { label: '🤔 생각중',emoji: '🤔' },
  sleep:   { label: '😴 수면',  emoji: '😴' },
  boom:    { label: '🤯 폭발',  emoji: '🤯' },
  cold:    { label: '🥶 추움',  emoji: '🥶' },
  party:   { label: '🎉 파티',  emoji: '🎉' },
  dizzy:   { label: '💫 어지러움',emoji:'💫' },
  clown:   { label: '🤡 광대',  emoji: '🤡' },
  angry:   { label: '😤 화남',  emoji: '😤' },
  target:  { label: '🎯 집중',  emoji: '🎯' },
  ghost:   { label: '👻 유령',  emoji: '👻' },
  game:    { label: '🎮 게임',  emoji: '🎮' },
  sword:   { label: '🗡️ 검',    emoji: '🗡️' },
  gold:    { label: '🥇 금메달',emoji: '🥇' },
  princess:{ label: '👸 공주',  emoji: '👸' },
  sprout:  { label: '🌱 새싹',  emoji: '🌱' },
  chick:   { label: '🐥 병아리',emoji: '🐥' },
};
// ── 커스텀 URL 아이콘 ──
let _customStatusIcons = J('su_si_customs') || [];
(function _loadCustomIcons(){
  _customStatusIcons.forEach((c,i)=>{ STATUS_ICON_DEFS['_c'+i]={label:c.label||'커스텀'+(i+1),emoji:c.emoji}; });
})();
function addCustomStatusIcon(label, emoji){
  if(!emoji) return;
  _customStatusIcons.push({label:label||'커스텀',emoji});
  const i=_customStatusIcons.length-1;
  STATUS_ICON_DEFS['_c'+i]={label:_customStatusIcons[i].label,emoji};
  localStorage.setItem('su_si_customs',JSON.stringify(_customStatusIcons));
}
function removeCustomStatusIcon(idx){
  _customStatusIcons.splice(idx,1);
  Object.keys(STATUS_ICON_DEFS).filter(k=>k.startsWith('_c')).forEach(k=>delete STATUS_ICON_DEFS[k]);
  _customStatusIcons.forEach((c,i)=>{STATUS_ICON_DEFS['_c'+i]={label:c.label,emoji:c.emoji};});
  localStorage.setItem('su_si_customs',JSON.stringify(_customStatusIcons));
}
function _siIsImg(v){ return typeof v==='string'&&(v.startsWith('http')||v.startsWith('data:')); }
function _siRender(emoji, size){ size=size||'16px'; if(!emoji)return''; if(_siIsImg(emoji))return`<img src="${emoji}" style="width:${size};height:${size};object-fit:contain;vertical-align:middle;flex-shrink:0" onerror="this.style.display='none'">`; return emoji; }

// (혼합 콘텐츠 방지) http:// 이미지를 https://로 자동 보정 (가능한 경우)
function toHttpsUrl(u){
  const s = String(u||'');
  return s.startsWith('http://') ? ('https://' + s.slice('http://'.length)) : s;
}
function getStatusIcon(name){
  const expiry = playerStatusExpiry[name];
  if(expiry && expiry < new Date().toISOString().slice(0,10)){
    delete playerStatusIcons[name];
    delete playerStatusExpiry[name];
    localStorage.setItem('su_psi', JSON.stringify(playerStatusIcons));
    localStorage.setItem('su_psi_expiry', JSON.stringify(playerStatusExpiry));
    return '';
  }
  return playerStatusIcons[name]||'';
}
function setStatusIcon(name, iconId, expiryDate){
  if(!iconId||iconId==='none'){
    delete playerStatusIcons[name];
    delete playerStatusExpiry[name];
  } else {
    playerStatusIcons[name]=STATUS_ICON_DEFS[iconId]?.emoji||iconId;
    if(expiryDate) playerStatusExpiry[name]=expiryDate;
    else delete playerStatusExpiry[name];
  }
  localStorage.setItem('su_psi', JSON.stringify(playerStatusIcons));
  localStorage.setItem('su_psi_expiry', JSON.stringify(playerStatusExpiry));
}
function onStatusExpiryChange(playerName){
  const expiryChk = document.getElementById('ed-icon-expiry');
  const curIcon = playerStatusIcons[playerName];
  if(!curIcon) return;
  let expiryDate = null;
  if(expiryChk && expiryChk.checked){
    const d = new Date(); d.setDate(d.getDate()+10);
    expiryDate = d.toISOString().slice(0,10);
  }
  if(expiryDate) playerStatusExpiry[playerName] = expiryDate;
  else delete playerStatusExpiry[playerName];
  localStorage.setItem('su_psi_expiry', JSON.stringify(playerStatusExpiry));
  const lbl = document.getElementById('ed-icon-label');
  if(lbl){
    const found = Object.entries(STATUS_ICON_DEFS).find(([,d])=>d.emoji&&d.emoji===curIcon);
    const expTxt = expiryDate ? ` (${expiryDate} 만료)` : '';
    lbl.textContent = '선택: ' + (found ? found[1].label : '없음') + expTxt;
  }
}
function setStatusIconFromModal(btn, playerName, iconId){
  const expiryChk = document.getElementById('ed-icon-expiry');
  let expiryDate = null;
  if(expiryChk && expiryChk.checked && iconId && iconId !== 'none'){
    const d = new Date(); d.setDate(d.getDate()+10);
    expiryDate = d.toISOString().slice(0,10);
  }
  setStatusIcon(playerName, iconId, expiryDate);
  const container = btn.closest('#ed-icon-btns') || btn.parentElement;
  if(container){
    container.querySelectorAll('button[data-icon-id]').forEach(b=>{
      const sel = b.dataset.iconId === iconId;
      b.style.border = '2px solid '+(sel?'#16a34a':'var(--border)');
      b.style.background = sel?'#dcfce7':'var(--white)';
    });
  }
  const lbl = document.getElementById('ed-icon-label');
  if(lbl){
    const d=STATUS_ICON_DEFS[iconId];
    const expTxt = expiryDate ? ` (${expiryDate} 만료)` : '';
    lbl.textContent='선택: '+(d?d.label:'없음')+expTxt;
  }
  // 만료 체크박스 표시 제어
  const expiryRow = document.getElementById('ed-icon-expiry-row');
  if(expiryRow) expiryRow.style.display = (!iconId||iconId==='none') ? 'none' : 'flex';
}
function saveCustomStatusIcon(slot, emoji){
  localStorage.setItem('su_si_c'+slot, emoji);
  const k='custom'+slot;
  if(STATUS_ICON_DEFS[k]) STATUS_ICON_DEFS[k].emoji=emoji;
}
function getPlayerPhotoHTML(playerName, size, extraStyle){
  size=size||'32px'; extraStyle=extraStyle||'';
  // (요청사항) 프로필 이미지 크기 배율(전역) — 설정에서 조절
  // - 기존 코드가 size 문자열(예: "22px")을 넘기므로, 숫자만 뽑아 배율 적용
  let _scale=1;
  try{
    const v=parseFloat(localStorage.getItem('su_avatar_scale')||'1');
    if(!isNaN(v)) _scale=Math.max(0.7, Math.min(1.6, v));
  }catch(e){}
  try{
    const m=String(size).match(/^(\d+(?:\.\d+)?)px$/);
    if(m && _scale!==1){
      const n=parseFloat(m[1]);
      size=(n*_scale).toFixed(2).replace(/\.00$/,'')+'px';
    }
  }catch(e){}

  // (요청사항) 경기 상세 전용 프로필 배율/채우기 설정
  try{
    const ctx = String(window.__detailCtx||'');
    if(ctx==='compModal' || ctx==='histModal'){
      const mdPct = parseFloat(localStorage.getItem('su_md_avatar_scale') || '100');
      const mdScale = Math.max(0.8, Math.min(2.0, isNaN(mdPct) ? 1 : (mdPct/100)));
      const m2=String(size).match(/^(\d+(?:\.\d+)?)px$/);
      if(m2 && mdScale!==1){
        const n2=parseFloat(m2[1]);
        size=(n2*mdScale).toFixed(2).replace(/\.00$/,'')+'px';
      }
    }
  }catch(e){}
  const p=players.find(x=>x.name===playerName);
  const hasBorder=extraStyle.includes('border');
  const bdr=hasBorder?'':'border:1.5px solid var(--border);';
  const sz = 'calc('+size+' * var(--su_profile_scale,1))';
  const base='display:inline-block;width:'+sz+';height:'+sz+';border-radius:var(--su_profile_radius,50%);box-shadow:var(--su_profile_fx, none);flex-shrink:0;vertical-align:middle;'+extraStyle;
  const safeName=(playerName||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  const clickStyle='cursor:pointer;';
  const clickAttr='onclick="openPlayerModal(\''+safeName+'\')" title="스트리머 상세"';
  if(!p||!p.photo){
    const RMAP={T:{bg:'#dbeafe',col:'#1e40af'},Z:{bg:'#ede9fe',col:'#5b21b6'},P:{bg:'#fef3c7',col:'#92400e'}};
    const rm=RMAP[p?.race]||{bg:'#e2e8f0',col:'#64748b'};
    const txt=p?.race||'?';
    return '<span '+clickAttr+' style="'+base+';'+bdr+'background:'+rm.bg+';color:'+rm.col+';display:inline-flex;align-items:center;justify-content:center;font-weight:900;font-size:calc('+size+' * var(--su_profile_scale,1) * 0.42);'+clickStyle+'">'+txt+'</span>';
  }
  const src = toHttpsUrl(p.photo);
  // object-fit: 기본 contain, 경기 상세에서는 설정에 따라 cover 가능
  let fit = 'contain';
  try{
    const hasFit = /object-fit\s*:\s*/.test(extraStyle);
    if(!hasFit){
      const ctx = String(window.__detailCtx||'');
      if(ctx==='compModal' || ctx==='histModal'){
        // 경기 상세: 기본은 "가득 채우기(cover)" 쪽이 더 보기 좋음
        fit = (localStorage.getItem('su_md_avatar_fit') || 'cover').trim();
      } else {
        fit = (localStorage.getItem('su_avatar_fit') || 'contain').trim();
      }
      if(!['contain','cover'].includes(fit)) fit='contain';
    } else {
      fit = null;
    }
  }catch(e){ fit='contain'; }
  return '<img '+clickAttr+' src="'+src+'" style="'+base+';'+(fit?('object-fit:'+fit+';'):'')+bdr+clickStyle+'" onerror="this.style.display=\'none\'">';
}
function getStatusIconHTML(name){
  const ic=getStatusIcon(name);
  if(!ic) return '';
  const def=Object.values(STATUS_ICON_DEFS).find(d=>d.emoji===ic);
  const lbl=def?def.label:ic;
  if(_siIsImg(ic)) return `<span style="margin-left:3px;flex-shrink:0;display:inline-flex;align-items:center" title="${lbl}">${_siRender(ic,'18px')}</span>`;
  return `<span style="font-size:13px;margin-left:3px;flex-shrink:0" title="${lbl}">${ic}</span>`;
}

function fixPoints(){
  // 구 티어명 → 새 약어 마이그레이션
  const tierMap={god:'G',king:'K',jack:'JA',joker:'J',spade:'S'};
  players.forEach(p=>{
    if(!p.history)p.history=[];
    if(p.points===undefined)p.points=0;
    if(!p.win)p.win=0; if(!p.loss)p.loss=0;
    if(!p.gender || !['M','F'].includes(p.gender))p.gender='M';
    if(tierMap[p.tier])p.tier=tierMap[p.tier]; // 기존 데이터 자동 변환
  });
}

function localSave(){
  try{
    _lsSave('su_tiers',TIERS);
    // 사진(base64)을 su_pp로 분리해서 su_p 크기 감소
    const _pPhotoMap={};
    const _pNoPhoto=players.map(p=>{
      const c={...p};
      if(p.photo){_pPhotoMap[p.name]=p.photo;delete c.photo;}
      // eloAfter(render.js fallback으로 재계산 가능)만 제거, time은 중복 dedup에 필요하므로 유지
      if(c.history&&c.history.length){
        // eslint-disable-next-line no-unused-vars
        c.history=c.history.map(({eloAfter,...h})=>h);
      }
      return c;
    });
    // teamAMembers/teamBMembers에서 tier·race 제거 (표시 시 players 배열 조회)
    const _trimM=arr=>arr.map(m=>{
      if(!m.teamAMembers&&!m.teamBMembers)return m;
      const r={...m};
      if(r.teamAMembers)r.teamAMembers=r.teamAMembers.map(x=>({name:x.name,univ:x.univ}));
      if(r.teamBMembers)r.teamBMembers=r.teamBMembers.map(x=>({name:x.name,univ:x.univ}));
      return r;
    });
    _lsSave('su_pp',_pPhotoMap);
    _lsSave('su_p',_pNoPhoto);
    _lsSave('su_u',univCfg);
    _lsSave('su_m',maps);
    _lsSave('su_mAlias',userMapAlias);
    _lsSave('su_t',tourD);
    _lsSave('su_mm',miniM);
    _lsSave('su_um',univM);
    _lsSave('su_cm',comps);
    _lsSave('su_ck',_trimM(ckM));
    _lsSave('su_cn',compNames);
    _lsSave('su_cc',curComp);
    _lsSave('su_pro',_trimM(proM));
    _lsSave('su_ptn',proTourneys);
    _lsSave('su_ptc',curProComp);
    _lsSave('su_tn',tourneys);
    _lsSave('su_ttm',_trimM(ttM));
    _lsSave('su_ttcur',_ttCurComp);
    _lsSave('su_indm',indM);
    _lsSave('su_gjm',gjM);
    if(typeof boardOrder!=='undefined') _lsSave('su_boardOrder',boardOrder);
    if(typeof boardPlayerOrder!=='undefined') _lsSave('su_bpo',boardPlayerOrder);
    if(typeof playerStatusIcons!=='undefined') _lsSave('su_psi',playerStatusIcons);
    _lsSave('su_notices',notices);
    _lsSave('su_seasons',seasons);
    _lsSave('su_cal_sched',calScheduled);
    localStorage.setItem('su_last_save_time',Date.now().toString());
    if(BLD['ck'])_lsSave('su_bld_ck',{membersA:BLD['ck'].membersA||[],membersB:BLD['ck'].membersB||[]});
    if(BLD['pro'])_lsSave('su_bld_pro',{date:BLD['pro'].date||'',membersA:BLD['pro'].membersA||[],membersB:BLD['pro'].membersB||[],tierFilters:BLD['pro'].tierFilters||[],sets:BLD['pro'].sets||[]});
  }catch(e){
    if(e.name==='QuotaExceededError'||e.name==='NS_ERROR_DOM_QUOTA_REACHED'){
      if(typeof showToast==='function')showToast('⚠️ 저장 공간이 부족합니다! 일부 데이터가 저장되지 않았을 수 있습니다.',5000);
      else alert('⚠️ 저장 공간이 부족합니다! 브라우저 저장소를 정리해 주세요.');
    }else{
      console.error('[localSave error]',e);
    }
  }
}

// 설정 전용 경량 저장 — 선수 기록·대전 데이터 직렬화 없음, Firebase 스킵
// 맵·약자·상태아이콘·티어·대학 설정 변경 시 사용
function saveCfg(){
  try{
    _lsSave('su_tiers',TIERS);
    _lsSave('su_u',univCfg);
    _lsSave('su_m',maps);
    _lsSave('su_mAlias',userMapAlias);
    if(typeof playerStatusIcons!=='undefined') _lsSave('su_psi',playerStatusIcons);
    localStorage.setItem('su_last_save_time',Date.now().toString());

    // 설정 변경도 다른 기기에 반영되도록 GitHub data.json 부분 업데이트
    try{
      const statusEl = document.getElementById('cloudStatus');
      if (typeof isLoggedIn !== 'undefined' && isLoggedIn) {
        const token = localStorage.getItem('su_gh_token') || '';
        if (token && typeof window.fbUpdate === 'function') {
          // su_* 키 일부(큰 값/비밀 값 제외)도 함께 동기화 → 설정탭 변경이 다른 기기에 바로 적용
          const _syncLs = {};
          try{
            for(let i=0;i<localStorage.length;i++){
              const k = localStorage.key(i);
              if(!k || typeof k!=='string') continue;
              if(!k.startsWith('su_')) continue;
              if(k.startsWith('su_pp')) continue;
              if(k==='su_fb_pw' || k==='su_gh_token' || k==='su_admin_hash') continue;
              if(k==='su_last_admin_save' || k==='su_last_save_time') continue;
              const v = localStorage.getItem(k);
              if(v==null) continue;
              if(String(v).length > 200000) continue;
              _syncLs[k] = v;
            }
          }catch(e){}

          const patch = {
            tiers: TIERS,
            univCfg,
            maps,
            userMapAlias,
            playerStatusIcons: (typeof playerStatusIcons!=='undefined' ? playerStatusIcons : {}),
            appSettings: { ls: _syncLs },
          };
          if(statusEl){ statusEl.style.color=''; statusEl.textContent='⏫ 설정 GitHub 저장 중...'; }
          window.fbUpdate(patch)
            .then(()=>{ if(statusEl){ statusEl.style.color='#16a34a'; statusEl.textContent='✅ 설정 GitHub 반영됨'; setTimeout(()=>{ if(statusEl){statusEl.textContent='';statusEl.style.color='';} }, 2500);} })
            .catch((e)=>{ if(statusEl){ statusEl.style.color='#dc2626'; statusEl.textContent='❌ 설정 GitHub 실패'; } console.error('[fbUpdate cfg]',e); });
        } else {
          // GitHub 토큰 미설정이면 로컬만 저장
          if(statusEl && !token){
            statusEl.style.color='#d97706';
            statusEl.textContent='⚠️ 로컬만 저장 (설정탭→GitHub 토큰 필요)';
            setTimeout(()=>{ if(statusEl){statusEl.textContent='';statusEl.style.color='';} }, 4000);
          }
        }
      }
    }catch(e){}
  }catch(e){console.error('[saveCfg error]',e);}
}
// 프로필 사진만 저장 — su_pp만 갱신 (history 직렬화 없음)
function savePhotos(){
  try{
    const _ppm={};
    players.forEach(p=>{if(p.photo)_ppm[p.name]=p.photo;});
    _lsSave('su_pp',_ppm);
    localStorage.setItem('su_last_save_time',Date.now().toString());
  }catch(e){console.error('[savePhotos error]',e);}
}
function save(){
  localSave();
  const statusEl = document.getElementById('cloudStatus');
  if (typeof isLoggedIn !== 'undefined' && isLoggedIn) {
    if (!localStorage.getItem('su_gh_token')) {
      if (statusEl) { statusEl.style.color='#d97706'; statusEl.textContent='⚠️ 로컬만 저장 (설정탭→GitHub 토큰 필요)'; setTimeout(()=>{if(statusEl){statusEl.textContent='';statusEl.style.color='';}},5000); }
      return;
    }
    if (typeof fbCloudSave !== 'function' || typeof window.fbSet !== 'function') {
      if (statusEl) { statusEl.style.color='#dc2626'; statusEl.textContent='❌ GitHub 저장 모듈 미연결'; setTimeout(()=>{if(statusEl){statusEl.textContent='';statusEl.style.color='';}},4000); }
      return;
    }
    if (statusEl) { statusEl.style.color=''; statusEl.textContent='⏫ GitHub 저장 중...'; }
    // 경기 기록 저장은 "데이터"만 우선 빠르게 업로드
    // - 설정 동기화는 saveCfg()/자동 설정 저장 경로에서 별도로 처리
    fbCloudSave({ includeSettings:false })
      .then(() => { if(statusEl){statusEl.style.color='#16a34a';statusEl.textContent='✅ GitHub 저장됨'; setTimeout(()=>{if(statusEl){statusEl.textContent='';statusEl.style.color='';}},3000);} })
      .catch(e => { if(statusEl){statusEl.style.color='#dc2626';statusEl.textContent='❌ GitHub 저장 실패';} console.error('[fbCloudSave]',e); });
  }
}

let curTab='total', editName='', reMode='', reIdx=-1;
let histPage={mini:0, ck:0, univm:0, comp:0, pro:0, tiertour:0, tt:0, ind:0, gj:0, procomp:0}; // 대전기록 탭 페이지 상태
let playerHistPage=0; // 스트리머 상세 페이지 상태
const HIST_PAGE_SIZE=20;
const HIST_PAGE_SIZE_MOBILE=10;
function getHistPageSize(){return window.innerWidth<=768?HIST_PAGE_SIZE_MOBILE:HIST_PAGE_SIZE;}
const PLAYER_HIST_PAGE_SIZE=10; // REQ4: 스트리머 상세 10개 이상일 때 페이지네이션
let calYear=new Date().getFullYear(), calMonth=new Date().getMonth(), calView=localStorage.getItem('su_cal_view')||'month';
let calTypeFilter='all';
let voteData=JSON.parse(localStorage.getItem('su_votes')||'{}');
let fUniv='전체', fTier='전체';
var miniSub='input', univmSub='input', ckSub='input', indSub='input', gjSub='input', compSub='league', histSub='mini';
var miniType='mini'; // 'mini' | 'civil'
var histUniv='';
var recSortDir='desc'; // 날짜 정렬: 'desc'=최신순, 'asc'=오래된순
var vsNameA='', vsNameB=''; // 1:1 상대전적 조회

// 공통 연도/월 필터 상태
let yearOptions=[]; // 하위호환용 — buildYearMonthFilter는 getYearOptions()로 동적 계산
let filterYear='전체';
let filterMonth='전체'; // '전체' 또는 '01'~'12'

// 🆕 시즌 관리: [{id, name, from, to}] — from/to: 'YYYY-MM-DD'
let seasons = J('su_seasons') || [];
let filterSeason = '전체'; // '전체' 또는 시즌 id

// 🆕 캘린더 예정 경기 (Firebase 동기화)
let calScheduled = J('su_cal_sched') || [];

// 🆕 랭킹 변동 스냅샷 (points 기준 순위)
// { playerName: rank } 형태로 저장
let _rankSnapshot = J('su_rank_snap') || {};
let _rankSnapDate = localStorage.getItem('su_rank_snap_date') || '';

// 랭킹 스냅샷 업데이트 (하루 1회)
function updateRankSnapshot() {
  const today = new Date().toISOString().slice(0,10);
  if(_rankSnapDate === today) return; // 오늘 이미 업데이트됨
  // 현재 순위 계산 (points 기준)
  const ranked = [...players]
    .filter(p => !p.retired)
    .sort((a,b) => (b.points||0)-(a.points||0) || (b.win||0)-(a.win||0));
  const snap = {};
  ranked.forEach((p,i) => { snap[p.name] = i+1; });
  localStorage.setItem('su_rank_snap', JSON.stringify(snap));
  localStorage.setItem('su_rank_snap_date', today);
  _rankSnapshot = snap;
  _rankSnapDate = today;
}

// 랭킹 변동 HTML 반환 (▲3 / ▼2 / NEW / -)
function getRankChangeBadge(playerName, currentRank) {
  const prev = _rankSnapshot[playerName];
  if(!prev) return '<span style="font-size:9px;color:#7c3aed;font-weight:700;padding:1px 4px;background:#ede9fe;border-radius:3px">NEW</span>';
  const diff = prev - currentRank; // 양수 = 상승
  if(diff === 0) return '<span style="font-size:9px;color:var(--gray-l)">-</span>';
  if(diff > 0)  return `<span style="font-size:9px;color:#16a34a;font-weight:800">▲${diff}</span>`;
  return `<span style="font-size:9px;color:#dc2626;font-weight:800">▼${Math.abs(diff)}</span>`;
}

function gc(n){const u=univCfg.find(x=>x.name===n);return u?u.color:'#6b7280';}
// Get univ color with alpha hex suffix for row tinting
function gcHex8(n,alpha){
  const c=gc(n);
  const a=Math.round((alpha||0.06)*255).toString(16).padStart(2,'0');
  return c+a;
}
function gcHex8Hover(n,alpha){
  const c=gc(n);
  const a=Math.round((alpha||0.12)*255).toString(16).padStart(2,'0');
  return c+a;
}
// ⚠️ 대학 아이콘(로고)은 코드에 하드코딩하지 않습니다.
// - 저작권/출처 이슈가 발생할 수 있어, 로고 URL은 data.json(univCfg.icon / univCfg.img)로만 관리합니다.
const UNIV_ICONS = {};
// 기본 대학 아이콘 SVG (아이콘이 없는 대학에 사용)
const DEFAULT_UNIV_ICON_SVG=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" data-univ-icon="1" style="flex-shrink:0;opacity:0.75;vertical-align:middle"><path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z"/></svg>`;
// 대학명 옆에 아이콘 img 태그 반환 (아이콘 없으면 기본 SVG 반환)
function gUI(n,size='1em'){
  const url=(univCfg.find(x=>x.name===n)||{}).icon || (univCfg.find(x=>x.name===n)||{}).img || '';
  if(url)return `<img src="${toHttpsUrl(url)}" alt="" data-univ-icon="1" style="width:${size};height:${size};object-fit:contain;vertical-align:middle;margin-right:3px;border-radius:var(--su_univ_logo_radius,2px);flex-shrink:0" onerror="this.style.display='none'">`;
  // 기본 아이콘 SVG
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" data-univ-icon="1" style="width:${size};height:${size};flex-shrink:0;opacity:0.75;vertical-align:middle;margin-right:3px"><path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z"/></svg>`;
}
// 대학명 + 아이콘 HTML 반환 (아이콘이 좌측에 위치)
function univNameWithIcon(n,fontSize){const icon=gUI(n,fontSize||'1em');return icon+n;}
// DOM 요소 내 ubadge에 대학 아이콘 주입 (항상 좌측에, 기본 아이콘 포함)
function injectUnivIcons(container){
  if(!container)return;
  container.querySelectorAll('.ubadge').forEach(el=>{
    if(el.querySelector('[data-univ-icon]')||el.getAttribute('data-icon-done'))return;
    let name='';
    el.childNodes.forEach(node=>{if(node.nodeType===3)name+=node.textContent;});
    name=name.trim().replace(/\s+/g,' ');
    if(!name)return;
    el.setAttribute('data-icon-done','1');
    // inline-flex 레이아웃으로 정렬
    if(!el.style.display||el.style.display==='inline-block')el.style.display='inline-flex';
    el.style.alignItems='center';
    el.style.gap='3px';
    const url=(univCfg.find(x=>x.name===name)||{}).icon || (univCfg.find(x=>x.name===name)||{}).img || '';
    if(url){
      const img=document.createElement('img');
      img.src=url; img.setAttribute('data-univ-icon','1');
      img.style.cssText='width:1em;height:1em;object-fit:contain;vertical-align:middle;border-radius:var(--su_univ_logo_radius,2px);flex-shrink:0';
      img.onerror=function(){this.style.display='none';};
      el.insertBefore(img,el.firstChild);
    } else {
      // 기본 아이콘 SVG 삽입
      const svgWrap=document.createElement('span');
      svgWrap.setAttribute('data-univ-icon','1');
      svgWrap.style.cssText='display:inline-flex;align-items:center;flex-shrink:0';
      svgWrap.innerHTML=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style="width:1em;height:1em;opacity:0.75"><path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z"/></svg>`;
      el.insertBefore(svgWrap,el.firstChild);
    }
  });
}
function pC(n){return n>0?'pt-p':n<0?'pt-n':'pt-z';}
function pS(n){return (n>0?'+':'')+n;}
function getAllUnivs(){
  const r=[...univCfg];const s=new Set(univCfg.map(u=>u.name));
  players.forEach(p=>{if(!s.has(p.univ)){r.push({name:p.univ,color:'#6b7280'});s.add(p.univ);}});
  const seen=new Set();
  return r.filter(u=>{if(seen.has(u.name))return false;seen.add(u.name);return true;});
}

// 현황판 boardOrder → univCfg 순서 동기화 (현황판에서 이동하면 스트리머 목록도 같이 이동)
function syncBoardOrderToUnivCfg(){
  if(!boardOrder||!boardOrder.length) return;
  const newCfg=[];
  boardOrder.forEach(name=>{const u=univCfg.find(x=>x.name===name);if(u)newCfg.push(u);});
  univCfg.forEach(u=>{if(!boardOrder.includes(u.name))newCfg.push(u);});
  if(newCfg.length===univCfg.length){univCfg=newCfg;save();}
}
function getMembers(univ){return players.filter(p=>p.univ===univ);}

function genderIcon(gender){
  if(gender==='M')return `<span class="male-icon">♂</span>`;
  return '';
}

/* ELO 상수 */
const ELO_DEFAULT=1200;
const ELO_K=32;

function calcElo(winnerElo, loserElo){
  const exp=1/(1+Math.pow(10,(loserElo-winnerElo)/400));
  return Math.round(ELO_K*(1-exp));
}

// ─────────────────────────────────────────────
// 스트리머 이름 정규화/별명(메모) 매칭
// - 예: 김재현 memo에 "샤이니"가 있으면, 입력에 "샤이니"를 넣어도 "김재현"으로 저장되게
// - 별명/메모가 애매하거나 부분일치만 되면 후보 리스트를 반환
// ─────────────────────────────────────────────
function _cleanPlayerInputName(name){
  const raw = (name||'').trim();
  // 종족 접미사 제거: "김명운Z", "샤이니T"
  return raw.replace(/\s*[TZPN]$/i,'').trim();
}
function resolvePlayerName(rawName){
  const raw = (rawName||'').trim();
  const cleaned = _cleanPlayerInputName(raw);
  if(!cleaned) return {name:'', player:null, match:'empty', candidates:[]};

  // 1) 정확한 이름
  let p = (players||[]).find(x=>x && x.name===cleaned) || (players||[]).find(x=>x && x.name===raw);
  if(p) return {name:p.name, player:p, match:'name', candidates:[p]};

  // 2) 메모(별명) 정확 일치
  const low = cleaned.toLowerCase();
  const memoExact = (players||[]).filter(x=>x && x.memo && String(x.memo).split(/[\s,，\n]+/).some(m=>m.trim().toLowerCase()===low));
  if(memoExact.length===1) return {name:memoExact[0].name, player:memoExact[0], match:'memo', candidates:memoExact};

  // 3) 공백 제거 후 이름 일치
  const ns = cleaned.replace(/\s+/g,'');
  const nsMatches = (players||[]).filter(x=>x && x.name && x.name.replace(/\s+/g,'')===ns);
  if(nsMatches.length===1) return {name:nsMatches[0].name, player:nsMatches[0], match:'space', candidates:nsMatches};

  // 4) 후보 추천(부분 일치)
  const cand = [];
  const push = (pp, why)=>{
    if(!pp || !pp.name) return;
    if(cand.some(x=>x.p.name===pp.name)) return;
    cand.push({p:pp, why});
  };
  (players||[]).forEach(pp=>{
    if(!pp || !pp.name) return;
    const n = String(pp.name);
    if(n.includes(cleaned) || n.replace(/\s+/g,'').includes(ns)) push(pp,'name');
    else if(pp.memo){
      const toks = String(pp.memo).split(/[\s,，\n]+/).map(x=>x.trim()).filter(Boolean);
      if(toks.some(t=>t.toLowerCase().includes(low))) push(pp,'memo');
    }
  });
  cand.sort((a,b)=>(a.why===b.why? a.p.name.localeCompare(b.p.name) : (a.why==='name'?-1:1)));
  const candidates = cand.slice(0,8).map(x=>x.p);
  return {name: raw, player:null, match:'none', candidates};
}
// 전역 노출(모달/인라인 onclick에서 사용)
try{ window.resolvePlayerName = resolvePlayerName; }catch(e){}

function applyGameResult(winName, loseName, date, map, matchId, univW, univL, mode){
  // 정확한 이름 일치 우선, 없으면 메모 별명 fallback, 그 다음 공백 제거 후 일치
  function _findPlayer(name){
    // 종족 접미사 제거: "김명운Z", "샤이니T" 같이 이름 뒤에 종족이 붙은 입력도 허용
    // (붙여넣기/자동인식에서 자주 등장)
    const raw = (name||'').trim();
    const cleanedRace = raw.replace(/\s*[TZPN]$/i,'').trim();
    let p=players.find(x=>x.name===name);
    if(p)return p;
    // cleanedRace 우선으로도 재시도
    if (cleanedRace && cleanedRace !== name) {
      p = players.find(x => x.name === cleanedRace);
      if (p) return p;
    }
    const low=cleanedRace.toLowerCase();
    p=players.find(x=>x.memo&&x.memo.split(/[\s,，\n]+/).some(m=>m.trim().toLowerCase()===low));
    if(p)return p;
    const ns=cleanedRace.replace(/\s+/g,'');
    return players.find(x=>x.name.replace(/\s+/g,'')===ns)||null;
  }
  const w=_findPlayer(winName);
  const l=_findPlayer(loseName);
  if(!w||!l||w===l)return;
  if(!w.history)w.history=[];
  if(!l.history)l.history=[];
  // 중복 체크
  // - matchId가 있으면 matchId가 곧 고유키(게임 단위)라고 가정하고 matchId만으로 중복 판단
  //   (티어대회/대학CK 등에서 같은 날짜/같은 맵/같은 상대가 여러 번 나올 수 있어 date+map+opp로 막으면 누락됨)
  // - matchId가 없을 때만 date+map+opp로 중복 방지
  const d=date||new Date().toISOString().slice(0,10);
  const m=map||'-';
  // matchId 기반 체크
  const wDupMatch = matchId ? (w.history||[]).find(h=>h.matchId===matchId) : null;
  const lDupMatch = matchId ? (l.history||[]).find(h=>h.matchId===matchId) : null;
  if(wDupMatch||lDupMatch) return;
  // matchId가 없을 때만 fallback 사용
  if(!matchId){
    const wDupFallback=(w.history||[]).find(h=>h.date===d&&h.map===m&&h.opp===l.name);
    const lDupFallback=(l.history||[]).find(h=>h.date===d&&h.map===m&&h.opp===w.name);
    if(wDupFallback||lDupFallback) return;
  }
  w.win++;l.loss++;w.points+=3;l.points-=3;
  // ELO 계산
  const wElo=w.elo||ELO_DEFAULT;
  const lElo=l.elo||ELO_DEFAULT;
  const delta=calcElo(wElo,lElo);
  w.elo=wElo+delta;
  l.elo=lElo-delta;
  const t=Date.now();
  // 경기 시점 대학 저장 (나중에 대학을 옮겨도 당시 소속 대학으로 집계)
  const wu=univW||w.univ||'';
  const lu=univL||l.univ||'';
  w.history.unshift({date:d,time:t,result:'승',opp:l.name,oppRace:l.race,map:m,matchId:matchId||'',eloDelta:delta,eloAfter:w.elo,univ:wu,mode:mode||''});
  l.history.unshift({date:d,time:t,result:'패',opp:w.name,oppRace:w.race,map:m,matchId:matchId||'',eloDelta:-delta,eloAfter:l.elo,univ:lu,mode:mode||''});
}

// (요청사항) 동률(2:2 등)도 "저장"되도록 — 무승부 기록
// - 승/패/포인트/ELO에는 영향 없음
// - 스트리머 상세(최근 경기 기록) 및 대전기록 탭에서 확인 가능
// - matchId는 충돌 방지를 위해 호출부에서 기존 matchId에 "_tie" 같은 suffix를 붙이는 것을 권장
function applyDrawResult(nameA, nameB, date, map, matchId, univA, univB, mode, scoreA, scoreB){
  function _findPlayer(name){
    const raw = (name||'').trim();
    const cleanedRace = raw.replace(/\s*[TZPN]$/i,'').trim();
    let p=players.find(x=>x.name===name);
    if(p)return p;
    if (cleanedRace && cleanedRace !== name) {
      p = players.find(x => x.name === cleanedRace);
      if (p) return p;
    }
    const low=cleanedRace.toLowerCase();
    p=players.find(x=>x.memo&&x.memo.split(/[\s,，\n]+/).some(m=>m.trim().toLowerCase()===low));
    if(p)return p;
    const ns=cleanedRace.replace(/\s+/g,'');
    return players.find(x=>x.name.replace(/\s+/g,'')===ns)||null;
  }
  const a=_findPlayer(nameA);
  const b=_findPlayer(nameB);
  if(!a||!b||a===b) return;
  if(!a.history)a.history=[];
  if(!b.history)b.history=[];
  const d=date||new Date().toISOString().slice(0,10);
  const m=map||'-';
  // 중복 체크: matchId가 있으면 matchId만으로 판단(게임 단위 중복 허용 방지)
  const aDup = matchId ? (a.history||[]).find(h=>h.matchId===matchId) : null;
  const bDup = matchId ? (b.history||[]).find(h=>h.matchId===matchId) : null;
  if(aDup||bDup) return;
  // matchId 없을 때만 fallback
  if(!matchId){
    const aDupFallback=(a.history||[]).find(h=>h.date===d&&h.map===m&&h.opp===b.name&&h.result==='무');
    const bDupFallback=(b.history||[]).find(h=>h.date===d&&h.map===m&&h.opp===a.name&&h.result==='무');
    if(aDupFallback||bDupFallback) return;
  }
  const t=Date.now();
  const au=univA||a.univ||'';
  const bu=univB||b.univ||'';
  const scoreStr = (scoreA!=null && scoreB!=null) ? `${scoreA}:${scoreB}` : '';
  // eloDelta는 null로 두어 UI에서 "-" 처리되게 함
  a.history.unshift({date:d,time:t,result:'무',opp:b.name,oppRace:b.race,map:m,matchId:matchId||'',eloDelta:null,eloAfter:a.elo||ELO_DEFAULT,univ:au,mode:mode||'',score:scoreStr});
  b.history.unshift({date:d,time:t,result:'무',opp:a.name,oppRace:a.race,map:m,matchId:matchId||'',eloDelta:null,eloAfter:b.elo||ELO_DEFAULT,univ:bu,mode:mode||'',score:scoreStr});
}

function rebuildAllPlayerHistory() {
  if(!confirm('모든 스트리머의 경기 기록을 대전 데이터에서 다시 생성합니다.\n\n⚠️ 기존 history가 초기화되고 대전 기록 기반으로 재구성됩니다.\n\n계속하시겠습니까?')) return;

  // 1. 모든 선수의 history, win, loss, points, elo 초기화
  players.forEach(p => {
    p.history = [];
    p.win = 0;
    p.loss = 0;
    p.points = 0;
    p.elo = ELO_DEFAULT;
  });

  let count = 0;

  // 2. miniM에서 복구
  (miniM || []).forEach(m => {
    if(!m._id) return;
    (m.sets || []).forEach((set, setIdx) => {
      (set.games || []).forEach((g, gameIdx) => {
        if(!g.playerA || !g.playerB || !g.winner) return;
        const wName = g.winner === 'A' ? g.playerA : g.playerB;
        const lName = g.winner === 'A' ? g.playerB : g.playerA;
        // (요청/수정) 시빌워(내전)는 팀 라벨(A/B)과 무관하게 "선수 실제 소속 대학"을 기록
        // → univW/univL을 비워두면 applyGameResult가 w.univ / l.univ를 사용
        const isCivil = (m.type === 'civil') || (m.a === 'A팀' && m.b === 'B팀');
        const univW = isCivil ? '' : (g.winner === 'A' ? (m.a || '') : (m.b || ''));
        const univL = isCivil ? '' : (g.winner === 'A' ? (m.b || '') : (m.a || ''));
        const gameId = g._id || `${m._id}_s${setIdx}_g${gameIdx}`;
        if(g._isTeam && typeof applyTeamGameResult==='function' && Array.isArray(g.teamA) && Array.isArray(g.teamB)){
          applyTeamGameResult(g.teamA, g.teamB, g.winner, m.d, g.map || '-', gameId, m.type === 'civil' ? '시빌워' : '미니대전');
        } else {
          applyGameResult(wName, lName, m.d, g.map || '-', gameId, univW, univL, m.type === 'civil' ? '시빌워' : '미니대전');
        }
        count++;
      });
    });
  });

  // 3. univM에서 복구
  (univM || []).forEach(m => {
    if(!m._id) return;
    (m.sets || []).forEach((set, setIdx) => {
      (set.games || []).forEach((g, gameIdx) => {
        if(!g.playerA || !g.playerB || !g.winner) return;
        const wName = g.winner === 'A' ? g.playerA : g.playerB;
        const lName = g.winner === 'A' ? g.playerB : g.playerA;
        const univW = g.winner === 'A' ? m.a : m.b;
        const univL = g.winner === 'A' ? m.b : m.a;
        const gameId = g._id || `${m._id}_s${setIdx}_g${gameIdx}`;
        if(g._isTeam && typeof applyTeamGameResult==='function' && Array.isArray(g.teamA) && Array.isArray(g.teamB)){
          applyTeamGameResult(g.teamA, g.teamB, g.winner, m.d, g.map || '-', gameId, '대학대전');
        } else {
          applyGameResult(wName, lName, m.d, g.map || '-', gameId, univW, univL, '대학대전');
        }
        count++;
      });
    });
  });

  // 4. ckM에서 복구
  (ckM || []).forEach(m => {
    if(!m._id) return;
    (m.sets || []).forEach((set, setIdx) => {
      (set.games || []).forEach((g, gameIdx) => {
        if(!g.playerA || !g.playerB || !g.winner) return;
        const wName = g.winner === 'A' ? g.playerA : g.playerB;
        const lName = g.winner === 'A' ? g.playerB : g.playerA;
        const gameId = g._id || `${m._id}_s${setIdx}_g${gameIdx}`;
        if(g._isTeam && typeof applyTeamGameResult==='function' && Array.isArray(g.teamA) && Array.isArray(g.teamB)){
          applyTeamGameResult(g.teamA, g.teamB, g.winner, m.d, g.map || '-', gameId, '대학CK');
        } else {
          applyGameResult(wName, lName, m.d, g.map || '-', gameId, '', '', '대학CK');
        }
        count++;
      });
    });
  });

  // 5. proM에서 복구
  (proM || []).forEach(m => {
    if(!m._id) return;
    (m.sets || []).forEach((set, setIdx) => {
      (set.games || []).forEach((g, gameIdx) => {
        if(!g.playerA || !g.playerB || !g.winner) return;
        const wName = g.winner === 'A' ? g.playerA : g.playerB;
        const lName = g.winner === 'A' ? g.playerB : g.playerA;
        const gameId = g._id || `${m._id}_s${setIdx}_g${gameIdx}`;
        if(g._isTeam && typeof applyTeamGameResult==='function' && Array.isArray(g.teamA) && Array.isArray(g.teamB)){
          applyTeamGameResult(g.teamA, g.teamB, g.winner, m.d, g.map || '-', gameId, '프로리그');
        } else {
          applyGameResult(wName, lName, m.d, g.map || '-', gameId, '', '', '프로리그');
        }
        count++;
      });
    });
  });

  // 6. ttM에서 복구
  (ttM || []).forEach(m => {
    if(!m._id) return;
    (m.sets || []).forEach((set, setIdx) => {
      (set.games || []).forEach((g, gameIdx) => {
        if(!g.playerA || !g.playerB || !g.winner) return;
        const wName = g.winner === 'A' ? g.playerA : g.playerB;
        const lName = g.winner === 'A' ? g.playerB : g.playerA;
        const gameId = g._id || `${m._id}_s${setIdx}_g${gameIdx}`;
        if(g._isTeam && typeof applyTeamGameResult==='function' && Array.isArray(g.teamA) && Array.isArray(g.teamB)){
          applyTeamGameResult(g.teamA, g.teamB, g.winner, m.d, g.map || '-', gameId, '티어대회');
        } else {
          applyGameResult(wName, lName, m.d, g.map || '-', gameId, '', '', '티어대회');
        }
        count++;
      });
    });
  });

  // 7. indM에서 복구
  (indM || []).forEach(m => {
    if(!m.wName || !m.lName) return;
    applyGameResult(m.wName, m.lName, m.d, m.map || '-', m._id || genId(), '', '', m._proLabel ? '프로리그' : '개인전');
    count++;
  });

  // 8. gjM에서 복구
  (gjM || []).forEach(m => {
    if(!m.wName || !m.lName) return;
    applyGameResult(m.wName, m.lName, m.d, m.map || '-', m._id || genId(), '', '', m._proLabel ? '프로리그끝장전' : '끝장전');
    count++;
  });

  // 9. comps에서 복구
  (comps || []).forEach(m => {
    if(!m._id) return;
    (m.sets || []).forEach((set, setIdx) => {
      (set.games || []).forEach((g, gameIdx) => {
        if(!g.playerA || !g.playerB || !g.winner) return;
        const wName = g.winner === 'A' ? g.playerA : g.playerB;
        const lName = g.winner === 'A' ? g.playerB : g.playerA;
        const univW = g.winner === 'A' ? m.a : m.b;
        const univL = g.winner === 'A' ? m.b : m.a;
        const gameId = g._id || `${m._id}_s${setIdx}_g${gameIdx}`;
        if(g._isTeam && typeof applyTeamGameResult==='function' && Array.isArray(g.teamA) && Array.isArray(g.teamB)){
          applyTeamGameResult(g.teamA, g.teamB, g.winner, m.d, g.map || '-', gameId, '대회');
        } else {
          applyGameResult(wName, lName, m.d, g.map || '-', gameId, univW, univL, '대회');
        }
        count++;
      });
    });
  });

  // 10. tourneys에서 복구
  if (typeof tourneys !== 'undefined') {
    tourneys.forEach(tn => {
      const isTier = tn.type === 'tier';
      (tn.groups || []).forEach(grp => {
        (grp.matches || []).forEach(m => {
          if (!m._id) return;
          (m.sets || []).forEach((set, setIdx) => {
            (set.games || []).forEach((g, gameIdx) => {
              if (!g.playerA || !g.playerB || !g.winner) return;
              const wName = g.winner === 'A' ? g.playerA : g.playerB;
              const lName = g.winner === 'A' ? g.playerB : g.playerA;
              const gameId = g._id || `${m._id}_s${setIdx}_g${gameIdx}`;
              if(g._isTeam && typeof applyTeamGameResult==='function' && Array.isArray(g.teamA) && Array.isArray(g.teamB)){
                applyTeamGameResult(g.teamA, g.teamB, g.winner, m.d, g.map || '-', gameId, isTier ? '티어대회' : '조별리그');
              } else {
                applyGameResult(wName, lName, m.d, g.map || '', gameId, m.a || '', m.b || '', isTier ? '티어대회' : '조별리그');
              }
              count++;
            });
          });
        });
      });
      Object.values((tn.bracket || {}).matchDetails || {}).forEach(m => {
        if (!m._id) return;
        (m.sets || []).forEach((set, setIdx) => {
          (set.games || []).forEach((g, gameIdx) => {
            if (!g.playerA || !g.playerB || !g.winner) return;
            const wName = g.winner === 'A' ? g.playerA : g.playerB;
            const lName = g.winner === 'A' ? g.playerB : g.playerA;
            const gameId = g._id || `${m._id}_s${setIdx}_g${gameIdx}`;
            if(g._isTeam && typeof applyTeamGameResult==='function' && Array.isArray(g.teamA) && Array.isArray(g.teamB)){
              applyTeamGameResult(g.teamA, g.teamB, g.winner, m.d, g.map || '-', gameId, isTier ? '티어대회' : '대회');
            } else {
              applyGameResult(wName, lName, m.d, g.map || '', gameId, m.a || '', m.b || '', isTier ? '티어대회' : '대회');
            }
            count++;
          });
        });
      });
      ((tn.bracket || {}).manualMatches || []).forEach(m => {
        if (!m._id) return;
        (m.sets || []).forEach((set, setIdx) => {
          (set.games || []).forEach((g, gameIdx) => {
            if (!g.playerA || !g.playerB || !g.winner) return;
            const wName = g.winner === 'A' ? g.playerA : g.playerB;
            const lName = g.winner === 'A' ? g.playerB : g.playerA;
            const gameId = g._id || `${m._id}_s${setIdx}_g${gameIdx}`;
            if(g._isTeam && typeof applyTeamGameResult==='function' && Array.isArray(g.teamA) && Array.isArray(g.teamB)){
              applyTeamGameResult(g.teamA, g.teamB, g.winner, m.d, g.map || '-', gameId, isTier ? '티어대회' : '대회');
            } else {
              applyGameResult(wName, lName, m.d, g.map || '', gameId, m.a || '', m.b || '', isTier ? '티어대회' : '대회');
            }
            count++;
          });
        });
      });
    });
  }

  // 11. proTourneys에서 복구
  if (typeof proTourneys !== 'undefined') {
    proTourneys.forEach(tn => {
      (tn.groups || []).forEach(grp => {
        (grp.matches || []).forEach((m, matchIdx) => {
          if (!m._id) return;
          (m.sets || []).forEach((set, setIdx) => {
            (set.games || []).forEach((g, gameIdx) => {
              if (!g.playerA || !g.playerB || !g.winner) return;
              const wName = g.winner === 'A' ? g.playerA : g.playerB;
              const lName = g.winner === 'A' ? g.playerB : g.playerA;
              const gameId = g._id || `${m._id}_s${setIdx}_g${gameIdx}`;
              applyGameResult(wName, lName, m.d || '', g.map || '', gameId, '', '', '프로리그대회');
              count++;
            });
          });
        });
      });
      (tn.bracket || []).forEach((rnd, rndIdx) => {
        rnd.forEach((m, matchIdx) => {
          if (!m || !m._id) return;
          (m.sets || []).forEach((set, setIdx) => {
            (set.games || []).forEach((g, gameIdx) => {
              if (!g.playerA || !g.playerB || !g.winner) return;
              const wName = g.winner === 'A' ? g.playerA : g.playerB;
              const lName = g.winner === 'A' ? g.playerB : g.playerA;
              const gameId = g._id || `${m._id}_s${setIdx}_g${gameIdx}`;
              applyGameResult(wName, lName, m.d || '', g.map || '', gameId, '', '', '프로리그대회');
              count++;
            });
          });
        });
      });
      if (tn.thirdPlace && tn.thirdPlace._id) {
        const tp = tn.thirdPlace;
        (tp.sets || []).forEach((set, setIdx) => {
          (set.games || []).forEach((g, gameIdx) => {
            if (!g.playerA || !g.playerB || !g.winner) return;
            const wName = g.winner === 'A' ? g.playerA : g.playerB;
            const lName = g.winner === 'A' ? g.playerB : g.playerA;
            const gameId = g._id || `${tp._id}_s${setIdx}_g${gameIdx}`;
            applyGameResult(wName, lName, tp.d || '', g.map || '', gameId, '', '', '프로리그대회');
            count++;
          });
        });
      }
      (tn.teamMatches || []).forEach((tm, tmIdx) => {
        (tm.games || []).forEach((g, gameIdx) => {
          if (!g.wName || !g.lName) return;
          const gameId = tm._id ? `${tm._id}_g${gameIdx}` : genId();
          applyGameResult(g.wName, g.lName, tm.d || '', g.map || '', gameId, '', '', '프로리그대회');
          count++;
        });
      });
    });
  }

  save();
  alert(`✅ ${count}개의 경기가 스트리머 기록에 복구되었습니다!`);
  render();
}

function deduplicatePlayerHistory(){
  if(!confirm('중복 경기 기록을 제거합니다.\n\n완전히 동일한 항목(같은 게임 ID 또는 같은 time+matchId+상대+결과+맵)만 제거합니다.\n계속하시겠습니까?')) return;

  let totalRemoved=0;
  players.forEach(p=>{
    if(!p.history||!p.history.length)return;
    const seen=new Set();
    const before=p.history.length;
    p.history=p.history.filter(h=>{
      const mid=h.matchId||'';
      // 게임 단위 고유 ID(_sN_gN 포함)면 matchId 자체가 고유 키
      const isGameId=mid.includes('_s')&&mid.includes('_g');
      let key;
      if(isGameId){
        key=mid;
      } else if(h.time){
        // time이 있으면 포함하여 진짜 중복만 제거 (합법적 재매치와 구분)
        key=`${mid}|${h.opp||''}|${h.result||''}|${h.map||'-'}|${h.time}`;
      } else {
        // time도 없고 bare matchId면 건드리지 않음 (합법적 재매치와 구분 불가)
        return true;
      }
      if(seen.has(key))return false;
      seen.add(key);
      return true;
    });
    totalRemoved+=before-p.history.length;
  });

  // 승패/포인트/ELO 재계산 (날짜 오름차순으로 delta 누적)
  players.forEach(p=>{
    p.win=0;p.loss=0;p.points=0;p.elo=ELO_DEFAULT;
    const sorted=[...(p.history||[])].sort((a,b)=>(a.date||'').localeCompare(b.date||''));
    sorted.forEach(h=>{
      if(h.result==='승'){p.win++;p.points+=3;}
      else if(h.result==='패'){p.loss++;p.points-=3;}
      if(h.eloDelta!=null)p.elo=(p.elo||ELO_DEFAULT)+h.eloDelta;
    });
  });

  if(typeof fixPoints==='function')fixPoints();
  save();
  alert(`🧹 중복 제거 완료: ${totalRemoved}개 항목 삭제`);
  render();
}

// game 객체에서 playerA, playerB, winner 정보를 추출해서
// applyGameResult를 호출한다.
function updatePlayerHistoryFromGame(game, date, mode){
  if(!game.playerA || !game.playerB || !game.winner) return;

  const winName = game.winner === 'A' ? game.playerA : 
                  game.winner === 'B' ? game.playerB : game.winner;
  const loseName = game.winner === 'A' ? game.playerB : 
                   game.winner === 'B' ? game.playerA : '';

  if(!winName || !loseName) return;

  // applyGameResult 내부에서 history 추가와 중복 방지를 처리함
  applyGameResult(winName, loseName, date, game.map||'', game._id||'', 
                  game.univA||'', game.univB||'', mode);
}
