/* ══════════════════════════════════════════════════════════════
   프로리그(일반) 브리핑 — proM(팀전 경기 기록) 전체를 요약.
   (재설계, 2026-08-20) 기존 b2w2 신문 디자인 대신, 프로리그 브리핑탭만
   방송 중계 스코어보드 톤(다크 네이비 + 시안/골드 포인트, plb-* 클래스)
   으로 전용 디자인. 데이터 집계 로직(_plbMatches/_plbPlayerStats/
   _plbMapStats)은 기존 그대로 두고, 렌더링 헬퍼(_plb*)만 새로 작성.
   추가: ① 상단 기간(연/월) 선택 필터 — 대전기록 탭과 동일한
   passDateFilter 인프라를 'pro-brief' 섹션으로 재사용
   ② 개인 승률 TOP5 기준을 100경기 이상으로 변경
   ══════════════════════════════════════════════════════════════ */

/* ── 데이터 수집 ── */

/* proM(경기 단위) → _cb* 공용 헬퍼(a/b/sa/sb/done)가 기대하는 형태로 매핑
   (버그픽스, 2026-08-20) proM 항목의 실제 점수 필드명은 scoreA/scoreB가 아니라
   sa/sb다(match.js/search-paste-apply.js/search-pro-apply.js가 실제로 저장하는
   필드 확인). scoreA/scoreB로 읽으면 항상 undefined라 sa/sb가 0으로, done이 항상
   false로 계산돼 — 완료 경기가 하나도 없는 것처럼 보이고("최근 경기 결과"가 항상
   빔), 팀 순위/진행률도 전부 집계가 안 되는 문제가 있었다. */
function _plbMatches(){
  const list=(typeof proM!=='undefined'&&Array.isArray(proM))?proM:[];
  return list.map(m=>({
    ...m,
    a:m.teamALabel||'A팀', b:m.teamBLabel||'B팀',
    sa:m.sa||0, sb:m.sb||0,
    done:(m.sa!=null&&m.sb!=null)
  }));
}

/* 선수별 통합 전적 — 각 게임의 승/패 진영(개인전/2인1조 모두 지원)을 선수 단위로 집계
   (버그픽스, 2026-08-20) split(g.playerA) 경로는 이름을 trim()하지만 g.teamA/g.teamB
   배열이나 g.a1/g.a2 필드는 trim 없이 그대로 썼다. 입력 경로(수동 입력 vs 붙여넣기)에
   따라 이름 앞뒤 공백이 섞여 들어가면 같은 사람이 "이영호"와 "이영호 " 두 명으로 갈라져
   집계돼 "활동 선수" 수가 실제보다 부풀려질 수 있었다. ens()에서 항상 trim해서 통일.
   (버그픽스, 2026-08-20) 위 trim 처리와 별개로, 같은 선수를 한 경기는 별명(메모)으로
   다른 경기는 실명으로 입력하면 raw 문자열이 서로 달라 여전히 두 명으로 갈라졌다.
   resolvePlayerName()(constants-game.js, 이름/별명/메모 통합 매칭)으로 먼저 정규화한
   뒤 그 결과(선수부 등록명)를 집계 키로 써서 별명 입력도 실명과 동일 인물로 합쳐지게
   했다. */
function _plbPlayerStats(matches){
  const ps={};
  const split=(v)=>String(v||'').split(/[,+，]/).map(x=>x.trim()).filter(Boolean);
  const canon=(raw)=>{
    const n=String(raw||'').trim(); if(!n) return '';
    try{ if(typeof resolvePlayerName==='function'){ const info=resolvePlayerName(n); if(info&&info.name) return info.name; } }catch(e){}
    return n;
  };
  const ens=(raw)=>{ const n=canon(raw); if(!n) return null; if(!ps[n]) ps[n]={name:n,w:0,l:0,univ:(typeof _pcbUniv==='function'?_pcbUniv(n):''),form:[]}; return ps[n]; };
  matches.forEach(m=>{
    (m.sets||[]).forEach(set=>{
      (set.games||[]).forEach(g=>{
        if(!g.winner) return;
        const aList=Array.isArray(g.teamA)?g.teamA:((g.a1||g.a2)?[g.a1,g.a2].filter(Boolean):split(g.playerA));
        const bList=Array.isArray(g.teamB)?g.teamB:((g.b1||g.b2)?[g.b1,g.b2].filter(Boolean):split(g.playerB));
        if(!aList.length||!bList.length) return;
        const wList=g.winner==='A'?aList:bList, lList=g.winner==='A'?bList:aList;
        wList.forEach(n=>{ const p=ens(n); if(p){ p.w++; p.form.push({d:m.d||'',win:true}); } });
        lList.forEach(n=>{ const p=ens(n); if(p){ p.l++; p.form.push({d:m.d||'',win:false}); } });
      });
    });
  });
  return Object.values(ps).map(p=>{
    const total=p.w+p.l;
    const all=p.form.slice().sort((a,b)=>(a.d||'').localeCompare(b.d||''));
    let streak=0,sw=null;
    for(let i=all.length-1;i>=0;i--){ if(sw===null){sw=all[i].win;streak=1;} else if(all[i].win===sw){streak++;} else break; }
    return {...p,total,rate:total?Math.round(p.w/total*100):0,streak,streakWin:sw};
  }).filter(p=>p.total>0);
}

/* 맵 사용 통계 */
function _plbMapStats(matches){
  const st={};
  matches.forEach(m=>(m.sets||[]).forEach(set=>(set.games||[]).forEach(g=>{
    if(!g.map) return;
    if(!st[g.map]) st[g.map]={map:g.map,total:0};
    st[g.map].total++;
  })));
  return Object.values(st).sort((a,b)=>b.total-a.total);
}

/* ── 기간(연/월) 필터 — 대전기록 탭의 passDateFilter 인프라를 'pro-brief' 섹션으로 재사용 ── */
function _plbPeriodActive(){
  const y=(window._sectionFilterYear&&window._sectionFilterYear['pro-brief'])||'전체';
  const m=(window._sectionFilterMonth&&window._sectionFilterMonth['pro-brief'])||'전체';
  return y!=='전체'||m!=='전체';
}
function _plbResetPeriod(){
  window._sectionFilterYear=window._sectionFilterYear||{};
  window._sectionFilterMonth=window._sectionFilterMonth||{};
  window._sectionFilterYear['pro-brief']='전체';
  window._sectionFilterMonth['pro-brief']='전체';
  if(typeof render==='function') render();
}
function _plbPeriodBarHTML(){
  if(typeof buildYearMonthFilterControls!=='function') return '';
  const ctrl=buildYearMonthFilterControls('pro-brief',true);
  const active=_plbPeriodActive();
  return `<div class="plb-period-bar no-export">
    <span class="plb-period-label">📅 기간 선택</span>
    ${ctrl}
    ${active?`<button type="button" class="plb-period-reset" onclick="_plbResetPeriod()">전체 기간 보기</button>`:''}
  </div>`;
}

/* ── UI 조각 (plb-* — 프로리그 브리핑 전용) ── */

/* 프로리그 브리핑 디자인 테마 (설정탭 "브리핑 디자인 & 효과"에서 선택, su_plb_briefing_theme)
   classic(기본)은 별도 data-theme 없이 .plb-wrap 기본 토큰(다크 네이비+시안/골드)을 그대로 사용 */
const _PLB_BRIEFING_THEMES=['classic','custom','crimson','emerald','violet','mono','amber','ice','indigo'];
function _plbBriefingThemeLoad(){
  try{ const v=localStorage.getItem('su_plb_briefing_theme'); return _PLB_BRIEFING_THEMES.includes(v)?v:'classic'; }catch(e){ return 'classic'; }
}
function _briefLighten(hex, amt){
  try{
    const h=String(hex||'').replace('#','');
    const r=parseInt(h.slice(0,2),16), g=parseInt(h.slice(2,4),16), b=parseInt(h.slice(4,6),16);
    const mix=(c)=>Math.round(c+(255-c)*amt);
    const to=(n)=>String(Math.max(0,Math.min(255,n)).toString(16)).padStart(2,'0');
    return `#${to(mix(r))}${to(mix(g))}${to(mix(b))}`;
  }catch(e){ return hex||'#94a3b8'; }
}
function _briefHexToRgb(hex){
  try{ const h=String(hex||'').replace('#',''); return `${parseInt(h.slice(0,2),16)},${parseInt(h.slice(2,4),16)},${parseInt(h.slice(4,6),16)}`; }catch(e){ return '148,163,184'; }
}
function _plbWrapAttr(){
  const t=_plbBriefingThemeLoad();
  if(t==='custom'){
    let c='#38bdf8';
    try{ const v=localStorage.getItem('su_plb_custom_accent'); if(v && /^#[0-9a-fA-F]{6}$/.test(v)) c=v; }catch(e){}
    const c2=_briefLighten(c,0.30);
    return ` style="--plb-accent:${c};--plb-accent-rgb:${_briefHexToRgb(c)};--plb-accent2:${c2};"`;
  }
  return t!=='classic'?` data-theme="${t}"`:'';
}

function _plbEmpty(msg){ return `<div class="plb-empty">${_cbEsc(msg)}</div>`; }

function _plbTickerHTML(teamStats){
  return `<div class="plb-ticker">
    <span class="plb-ticker-dot"></span>
    <span class="plb-ticker-txt">PRO LEAGUE · STANDINGS</span>
  </div>`;
}

function _plbKpiGrid(items){
  return `<div class="plb-kpi-grid">${items.map(k=>`<div class="plb-kpi-card"><i style="background:${k[3]||'#38bdf8'}"></i>
    <div class="plb-kpi-label">${_cbEsc(k[0])}</div>
    <div class="plb-kpi-value">${k[1]}</div>
    <div class="plb-kpi-sub">${k[2]||''}</div>
  </div>`).join('')}</div>`;
}

/* 진행률 + 음성듣기(TTS) — 한 패널로 통합. 예전엔 진행바와 TTS 버튼이
   각각 배경색 없이 떠 있어 밝은 배경(카드 바깥)에 흰 글자가 묻히는
   문제가 있었음 → plb-progress-panel에 다크 배경을 명시해서 항상 또렷하게 보이도록 함. */
function _plbProgressHTML(pct,doneM,totalM){
  return `<div class="plb-progress-panel">
    <div class="plb-progress-head">
      <span class="plb-progress-title">🏁 경기 진행률</span>
      <button type="button" id="plb-speak-btn" class="plb-speak-btn no-export" onclick="_plbBriefingToggleSpeak()">🔊 음성듣기</button>
    </div>
    <div class="plb-progress-track"><div class="plb-progress-fill" style="width:${pct}%"></div></div>
    <div class="plb-progress-caption"><span>완료 ${doneM} / ${totalM}경기</span><span>${pct}%</span></div>
  </div>`;
}

function _plbSection(title,sub,inner){
  return `<section class="plb-section">
    <div class="plb-section-head">
      <span class="plb-section-title">${_cbEsc(title)}</span>
      ${sub?`<span class="plb-section-sub">${_cbEsc(sub)}</span>`:''}
    </div>
    ${inner}
  </section>`;
}

/* 순위 리스트 — top3는 메달톤 배지, 그 외는 대학색 배지.
   dark=true면(MVP 후보 리스트처럼 어두운 카드 위에 얹힐 때) 1등 강조 배경이
   var(--surface) 같은 밝은 색으로 번지지 않도록 어두운 톤 그라디언트를 사용 —
   그렇지 않으면 흰 글자(plb-rank-value)가 밝은 배경 위에서 안 보이는 문제가 생김. */
function _plbRankList(rows,dark){
  if(!rows.length) return _plbEmpty('표시할 기록이 없습니다.');
  const medal=['#f59e0b','#94a3b8','#c17a3f'];
  return `<div class="plb-rank-list">${rows.map((r,i)=>{
    const col=r.color||'#7dd3fc';
    const top=i===0;
    const badgeBg=i<3?medal[i]:`${col}30`;
    const badgeColor=i<3?'#0b1220':col;
    /* (개선, 2026-08-20) 예전엔 1등만 팀 색 배경 그라디언트가 있고 2~5등은 무채색
       배경이었다. 전체 순위에 같은 팀 색 틴트를 주되, 1등만 살짝 더 진하게 해서
       순위 서열감은 유지한다. */
    const rowBg=`background:linear-gradient(100deg,${col}${top?'38':'1e'},rgba(255,255,255,.06) 78%)`;
    return `<div class="plb-rank-row${top?' top1':''}" style="border-left:${top?'5px':'4px'} solid ${col};${rowBg}">
      <span class="plb-rank-badge" style="background:${badgeBg};color:${badgeColor}">${i+1}</span>
      <span class="plb-rank-name" style="color:${col}">${r.icon||''}<span>${_cbEsc(r.name)}</span></span>
      ${r.sub?`<span class="plb-rank-sub">${r.sub}</span>`:''}
      <span class="plb-rank-value">${r.value}</span>
    </div>`;
  }).join('')}</div>`;
}

function _plbMatchRow(m,label){
  const ca=_cbUcolVivid(m.a), cb=_cbUcolVivid(m.b);
  const aWin=m.done&&m.sa>m.sb, bWin=m.done&&m.sb>m.sa;
  return `<div class="plb-match-row">
    ${label?`<span class="plb-match-tag">${_cbEsc(label)}</span>`:''}
    ${m.d?`<span class="plb-match-date">${_cbFmtD(m.d)}</span>`:''}
    <span style="flex:1;text-align:right;font-weight:${aWin?'900':'700'};opacity:${bWin?'.6':'1'};color:${ca}">${_cbEsc(m.a||'미정')}</span>
    <span class="plb-match-score">${m.done?`${m.sa}:${m.sb}`:'예정'}</span>
    <span style="flex:1;font-weight:${bWin?'900':'700'};opacity:${aWin?'.6':'1'};color:${cb}">${_cbEsc(m.b||'미정')}</span>
  </div>`;
}

function _plbMapBarsHTML(mapStats){
  if(!mapStats.length) return _plbEmpty('맵 기록이 없습니다.');
  const total=mapStats.reduce((s,x)=>s+x.total,0);
  return `<div>${mapStats.slice(0,8).map(x=>{
    const p=total?Math.round(x.total/total*100):0;
    return `<div class="plb-map-row">
      <span class="plb-map-name">${_cbEsc(x.map)}</span>
      <div class="plb-map-track"><div class="plb-map-fill" style="width:${p}%"></div></div>
      <span class="plb-map-val">${x.total}회 (${p}%)</span>
    </div>`;
  }).join('')}</div>`;
}

function _plbMvpHTML(mvpTop,mvpCands){
  if(!mvpTop) return '';
  const mCol=_cbUcolVivid(mvpTop.univ);
  return `<div class="plb-mvp">
    <span style="position:relative;display:inline-flex;flex-shrink:0">${_cbPlayerAvatar(mvpTop.name,(typeof window!=='undefined'&&window.innerWidth<640)?104:150)}</span>
    <div class="plb-mvp-side">
      <div class="plb-mvp-ribbon">Pro League MVP</div>
      <div class="plb-mvp-name" style="color:${mCol}">${_cbEsc(mvpTop.name)}</div>
      <div class="plb-mvp-meta">${mvpTop.univ?_cbTeamChip(mvpTop.univ,'',_cbUcolVivid(mvpTop.univ)):''}<span>${mvpTop.w}승 ${mvpTop.l}패 · 승률 ${mvpTop.rate}%</span></div>
    </div>
    <div class="plb-mvp-cands">${_plbRankList(mvpCands.slice(0,5).map(p=>({
      name:p.name,color:_cbUcolVivid(p.univ),sub:`${p.w}승 ${p.l}패`,value:`${Math.round(p.score)}pt`
    })),true)}</div>
  </div>`;
}

/* ══════════ 프로리그(일반) 브리핑 (메인) ══════════ */
function rProLeagueBriefing(){
  const allMatches=_plbMatches();
  const matches=(typeof passDateFilter==='function')?allMatches.filter(m=>passDateFilter(m.d,'pro-brief')):allMatches;
  const periodActive=_plbPeriodActive();
  const periodBar=_plbPeriodBarHTML();

  const done=matches.filter(m=>m.done);
  const totalM=matches.length, doneM=done.length;

  if(!totalM){
    return `<div class="plb-wrap"${_plbWrapAttr()}>
      <div class="plb-ticker"><span class="plb-ticker-dot"></span><span class="plb-ticker-txt">PRO LEAGUE BRIEFING</span></div>
      <div class="plb-hero">
        <div class="plb-hero-kicker">Pro League Briefing</div>
        <div class="plb-hero-title">프로리그 브리핑</div>
        <div class="plb-hero-desc">${periodActive?'선택한 기간에 등록된 경기가 없습니다. 다른 기간을 선택해보세요.':'경기를 입력하면 브리핑이 생성됩니다.'}</div>
      </div>
      ${periodBar}
      <div class="plb-body">${_plbEmpty(periodActive?'선택한 기간에 경기 기록이 없습니다.':'경기를 기록하면 브리핑이 채워집니다.')}</div>
    </div>`;
  }

  const pct=_cbPct(doneM,totalM);
  const teamStats=(typeof _cbTeamStats==='function')?_cbTeamStats(matches):[];
  const lead=teamStats[0];
  const playerStats=_plbPlayerStats(matches);
  const mapStats=_plbMapStats(matches);
  const dates=[...new Set(matches.map(m=>m.d).filter(Boolean))].sort();

  const winTop=playerStats.slice().sort((a,b)=>b.w-a.w||b.rate-a.rate).slice(0,5);
  const rateTop=playerStats.filter(p=>p.total>=100).slice().sort((a,b)=>b.rate-a.rate||b.w-a.w).slice(0,5);

  const mvpCands=playerStats.map(p=>({...p,score:p.w*10+p.rate*0.4+(lead&&p.univ===lead.u?8:0)}))
    .sort((a,b)=>b.score-a.score);
  const mvpTop=mvpCands[0]||null;

  const timeline=done.slice().sort((a,b)=>String(b.d||'').localeCompare(String(a.d||''))).slice(0,6);

  const headline=lead?`${_cbEsc(lead.u)} ${lead.w}승 ${lead.l}패(승률 ${lead.rate}%)로 선두`:'집계 중';
  const periodLabel=dates.length?`${_cbFmtD(dates[0])} ~ ${_cbFmtD(dates[dates.length-1])}`:'일정 미정';

  /* 음성듣기(TTS)용 스냅샷 — pro-league-briefing-tts.js가 이 값을 읽어 낭독 큐를 만든다 */
  try{
    window._plbBriefingSpeakSnapshot={
      title:periodActive?`프로리그 브리핑 (${periodLabel})`:'프로리그 브리핑',
      totalM,doneM,pct,
      headline,
      winTop:winTop.map(p=>({name:p.name,w:p.w,l:p.l,rate:p.rate})),
      rateTop:rateTop.map(p=>({name:p.name,w:p.w,l:p.l,rate:p.rate})),
      mvp:mvpTop?{name:mvpTop.name,w:mvpTop.w,l:mvpTop.l,rate:mvpTop.rate}:null,
      topMap:mapStats[0]?{map:mapStats[0].map,total:mapStats[0].total}:null
    };
  }catch(e){}

  let body=`<div class="plb-grid2">
    <div>${_plbSection('개인 승률 TOP 5','100경기 이상 기준',_plbRankList(rateTop.map(p=>({
      name:p.name,color:_cbUcolVivid(p.univ),
      sub:`${_cbFormDots(p.form)} ${p.w}승 ${p.l}패`,value:`${p.rate}%`
    }))))}</div>
    <div>${_plbSection('개인 다승 TOP 5','전 경기 통합 기준',_plbRankList(winTop.map(p=>({
      name:p.name,color:_cbUcolVivid(p.univ),
      sub:`${_cbFormDots(p.form)} ${p.rate}%`,value:`${p.w}승 ${p.l}패`
    }))))}</div>
  </div>`;

  if(mvpTop){
    body+=_plbSection('프로리그 MVP','다승 · 승률 종합',_plbMvpHTML(mvpTop,mvpCands));
  }

  body+=_plbSection('최근 경기 결과','최신 기록 순',
    timeline.length?timeline.map(m=>_plbMatchRow(m,'팀전')).join(''):_plbEmpty('아직 완료된 경기가 없습니다.'));

  if(mapStats.length){
    body+=_plbSection('인기 맵','전체 게임 기준',_plbMapBarsHTML(mapStats));
  }

  return `<div class="plb-wrap"${_plbWrapAttr()}>
    ${_plbTickerHTML(teamStats)}
    <div class="plb-hero">
      <div class="plb-hero-kicker">Pro League Briefing</div>
      <div class="plb-hero-title">프로리그 브리핑</div>
      <div class="plb-hero-desc">전체 ${totalM}경기 중 ${doneM}경기가 기록됐습니다.${periodActive?` 선택 기간: ${periodLabel}`:''}</div>
    </div>
    ${periodBar}
    ${_plbKpiGrid([
      ['총 경기',`${totalM}경기`,`완료 ${doneM} · 진행률 ${pct}%`,'#38bdf8'],
      ['참가 팀',`${teamStats.length}팀`,mvpTop?`MVP 후보 ${_cbEsc(mvpTop.name)}`:'집계 중','#fbbf24'],
      ['참가 스트리머',`${playerStats.length}명`,mapStats.length?`최다 사용맵 ${_cbEsc(mapStats[0].map)}`:'맵 기록 없음','#818cf8'],
      ['기간',periodLabel,'','#f43f5e']
    ])}
    ${_plbProgressHTML(pct,doneM,totalM)}
    <div class="plb-body">${body}</div>
  </div>`;
}
