/* ══════════════════════════════════════════════════════════════
   프로리그 끝장전 브리핑 (신규, 2026-08-20)
   - "프로리그 끝장전"(gjM 중 _proLabel:true인 1:1 다판 세션) 전체를 요약.
     프로리그(일반) 브리핑(pro-league-briefing.js, plb-* 다크 네이비+시안/골드
     스코어보드 톤)의 구조·톤을 그대로 참고하되, "끝장전(결투)" 느낌을 살려
     완전히 다른 색상(다크 차콜+크림슨/앰버, plgb-* 클래스 전용)으로 새로
     작성했다. 데이터 집계(_plgb*)와 렌더링(plgb-*)이 모두 별도 시스템이라
     기존 프로리그/프로리그 대회 브리핑 화면에는 전혀 영향 없음.
   ══════════════════════════════════════════════════════════════ */

/* ── 데이터 수집 ── */

/* gjM(경기 단위, 1게임=1행) 중 "프로리그 끝장전"만(=_proLabel:true) 추출 */
function _plgbGames(){
  const list=(typeof gjM!=='undefined'&&Array.isArray(gjM))?gjM:[];
  return list.filter(g=>g&&g._proLabel&&g.wName&&g.lName);
}

/* 게임(gjM 행)들을 세션(1:1 매치업) 단위로 묶기 — match-gj-records.js의
   세션 그룹핑 로직(대전기록 탭 끝장전 기록)과 동일한 sid/날짜+선수쌍 키 사용 */
function _plgbSessions(games){
  const map=new Map(), order=[];
  games.forEach(g=>{
    const pair=[g.wName,g.lName].sort();
    const key = g.sid ? `sid:${g.sid}` : `${g.d||''}|${pair[0]}|${pair[1]}`;
    if(!map.has(key)){ map.set(key,{key,d:g.d||'',p1:pair[0],p2:pair[1],n:g.n||'',games:[]}); order.push(key); }
    const s=map.get(key);
    if(g.d && !s.d) s.d=g.d;
    if(g.n && !s.n) s.n=g.n;
    s.games.push(g);
  });
  return order.map(k=>{
    const s=map.get(k);
    const p1w=s.games.filter(g=>g.wName===s.p1).length;
    const p2w=s.games.filter(g=>g.wName===s.p2).length;
    return {...s,p1w,p2w,done:s.games.length>0,winner:p1w>p2w?s.p1:(p2w>p1w?s.p2:'')};
  });
}

function _plgbUniv(name){
  try{ const p=(typeof players!=='undefined'?players:[]).find(x=>x.name===name); return p?(p.univ||''):''; }catch(e){ return ''; }
}

/* 선수별 통합 전적 — 게임(gjM 행) 단위 승/패 집계
   (버그픽스, 2026-08-20) 같은 선수를 한 경기는 별명(메모)으로, 다른 경기는 실명으로
   입력하면 raw wName/lName 문자열이 달라 두 명으로 갈라져 집계됐다.
   resolvePlayerName()(constants-game.js, 이름/별명/메모 통합 매칭)으로 정규화한
   등록명을 집계 키로 사용해 합친다. */
function _plgbPlayerStats(games){
  const ps={};
  const canon=(raw)=>{
    const n=String(raw||'').trim(); if(!n) return '';
    try{ if(typeof resolvePlayerName==='function'){ const info=resolvePlayerName(n); if(info&&info.name) return info.name; } }catch(e){}
    return n;
  };
  const ens=(raw)=>{ const n=canon(raw); if(!n) return null; if(!ps[n]) ps[n]={name:n,w:0,l:0,univ:_plgbUniv(n),form:[]}; return ps[n]; };
  games.forEach(g=>{
    if(!g.wName||!g.lName) return;
    ens(g.wName).w++; ens(g.lName).l++;
    ens(g.wName).form.push({d:g.d||'',win:true});
    ens(g.lName).form.push({d:g.d||'',win:false});
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
function _plgbMapStats(games){
  const st={};
  games.forEach(g=>{
    if(!g.map||g.map==='-') return;
    if(!st[g.map]) st[g.map]={map:g.map,total:0};
    st[g.map].total++;
  });
  return Object.values(st).sort((a,b)=>b.total-a.total);
}

/* ── 기간(연/월) 필터 — 대전기록 탭의 passDateFilter 인프라를 'progj-brief' 섹션으로 재사용 ── */
function _plgbPeriodActive(){
  const y=(window._sectionFilterYear&&window._sectionFilterYear['progj-brief'])||'전체';
  const m=(window._sectionFilterMonth&&window._sectionFilterMonth['progj-brief'])||'전체';
  return y!=='전체'||m!=='전체';
}
function _plgbResetPeriod(){
  window._sectionFilterYear=window._sectionFilterYear||{};
  window._sectionFilterMonth=window._sectionFilterMonth||{};
  window._sectionFilterYear['progj-brief']='전체';
  window._sectionFilterMonth['progj-brief']='전체';
  if(typeof render==='function') render();
}
function _plgbPeriodBarHTML(){
  if(typeof buildYearMonthFilterControls!=='function') return '';
  const ctrl=buildYearMonthFilterControls('progj-brief',true);
  const active=_plgbPeriodActive();
  return `<div class="plgb-period-bar no-export">
    <span class="plgb-period-label">📅 기간 선택</span>
    ${ctrl}
    ${active?`<button type="button" class="plgb-period-reset" onclick="_plgbResetPeriod()">전체 기간 보기</button>`:''}
  </div>`;
}

/* ── UI 조각 (plgb-* — 프로리그 끝장전 브리핑 전용, 다크 차콜+크림슨/앰버 "결투" 톤) ── */

/* 프로리그 끝장전 브리핑 디자인 테마 (설정탭 "브리핑 디자인 & 효과"에서 선택, su_plgb_briefing_theme)
   classic(기본)은 별도 data-theme 없이 .plgb-wrap 기본 토큰(다크 차콜+에메랄드/앰버)을 그대로 사용 */
const _PLGB_BRIEFING_THEMES=['classic','custom','crimson-duel','azure-duel','violet-duel','mono-duel','gold-duel','rose-duel','jade-duel'];
function _plgbBriefingThemeLoad(){
  try{ const v=localStorage.getItem('su_plgb_briefing_theme'); return _PLGB_BRIEFING_THEMES.includes(v)?v:'classic'; }catch(e){ return 'classic'; }
}
function _plgbWrapAttr(){
  const t=_plgbBriefingThemeLoad();
  if(t==='custom'){
    let c='#10b981';
    try{ const v=localStorage.getItem('su_plgb_custom_accent'); if(v && /^#[0-9a-fA-F]{6}$/.test(v)) c=v; }catch(e){}
    const accent2=_deriveComplementary(c);
    const rgb=(typeof _briefHexToRgb==='function')?_briefHexToRgb(c):'16,185,129';
    const rgb2=(typeof _briefHexToRgb==='function')?_briefHexToRgb(accent2):'245,158,11';
    return ` style="--plgb-accent:${c};--plgb-accent-rgb:${rgb};--plgb-accent2:${accent2};--plgb-accent2-rgb:${rgb2};"`;
  }
  return t!=='classic'?` data-theme="${t}"`:'';
}
/* 끝장전 브리핑은 accent(주) + accent2(보조, 보색 계열) 2색을 쓰는 대결 톤이라
   단일 커스텀 색에서 각도를 튼 보색을 만들어 자동으로 채워준다 */
function _deriveComplementary(hex){
  try{
    const h=String(hex||'').replace('#','');
    let r=parseInt(h.slice(0,2),16)/255, g=parseInt(h.slice(2,4),16)/255, b=parseInt(h.slice(4,6),16)/255;
    const max=Math.max(r,g,b), min=Math.min(r,g,b); let hh=0,s=0,l=(max+min)/2;
    if(max!==min){ const d=max-min; s=l>0.5?d/(2-max-min):d/(max+min);
      switch(max){ case r: hh=(g-b)/d+(g<b?6:0); break; case g: hh=(b-r)/d+2; break; case b: hh=(r-g)/d+4; break; } hh/=6; }
    hh=(hh+0.5)%1; // 180도 회전 = 보색
    const hue2rgb=(p,q,t)=>{ if(t<0)t+=1; if(t>1)t-=1; if(t<1/6)return p+(q-p)*6*t; if(t<1/2)return q; if(t<2/3)return p+(q-p)*(2/3-t)*6; return p; };
    const q=l<0.5?l*(1+s):l+s-l*s, p=2*l-q;
    const rr=Math.round(hue2rgb(p,q,hh+1/3)*255), gg=Math.round(hue2rgb(p,q,hh)*255), bb=Math.round(hue2rgb(p,q,hh-1/3)*255);
    const to=(n)=>String(n.toString(16)).padStart(2,'0');
    return `#${to(rr)}${to(gg)}${to(bb)}`;
  }catch(e){ return '#f59e0b'; }
}

function _plgbEmpty(msg){ return `<div class="plgb-empty">${_cbEsc(msg)}</div>`; }

function _plgbTickerHTML(){
  return `<div class="plgb-ticker">
    <span class="plgb-ticker-dot"></span>
    <span class="plgb-ticker-txt">PRO LEAGUE · SUDDEN DEATH</span>
  </div>`;
}

function _plgbKpiGrid(items){
  return `<div class="plgb-kpi-grid">${items.map(k=>`<div class="plgb-kpi-card"><i style="background:${k[3]||'#f59e0b'}"></i>
    <div class="plgb-kpi-label">${_cbEsc(k[0])}</div>
    <div class="plgb-kpi-value">${k[1]}</div>
    <div class="plgb-kpi-sub">${k[2]||''}</div>
  </div>`).join('')}</div>`;
}

function _plgbProgressHTML(pct,doneN,totalN){
  return `<div class="plgb-progress-panel">
    <div class="plgb-progress-head">
      <span class="plgb-progress-title">🔥 끝장전 진행률</span>
      <button type="button" id="plgb-speak-btn" class="plgb-speak-btn no-export" onclick="_plgbBriefingToggleSpeak()">🔊 음성듣기</button>
    </div>
    <div class="plgb-progress-track"><div class="plgb-progress-fill" style="width:${pct}%"></div></div>
    <div class="plgb-progress-caption"><span>완료 ${doneN} / ${totalN}경기</span><span>${pct}%</span></div>
  </div>`;
}

function _plgbSection(title,sub,inner){
  return `<section class="plgb-section">
    <div class="plgb-section-head">
      <span class="plgb-section-title">${_cbEsc(title)}</span>
      ${sub?`<span class="plgb-section-sub">${_cbEsc(sub)}</span>`:''}
    </div>
    ${inner}
  </section>`;
}

function _plgbRankList(rows,dark){
  if(!rows.length) return _plgbEmpty('표시할 기록이 없습니다.');
  const medal=['#f59e0b','#94a3b8','#c17a3f'];
  return `<div class="plgb-rank-list">${rows.map((r,i)=>{
    const col=r.color||'#fbbf24';
    const top=i===0;
    const badgeBg=i<3?medal[i]:`${col}30`;
    const badgeColor=i<3?'#0a1410':col;
    /* (개선, 2026-08-20) 1등만 있던 팀 색 배경 틴트를 전체 순위로 확장 */
    const rowBg=`background:linear-gradient(100deg,${col}${top?'38':'1e'},rgba(255,255,255,.06) 78%)`;
    return `<div class="plgb-rank-row${top?' top1':''}" style="border-left:${top?'5px':'4px'} solid ${col};${rowBg}">
      <span class="plgb-rank-badge" style="background:${badgeBg};color:${badgeColor}">${i+1}</span>
      <span class="plgb-rank-name" style="color:${col}">${r.icon||''}<span>${_cbEsc(r.name)}</span></span>
      ${r.sub?`<span class="plgb-rank-sub">${r.sub}</span>`:''}
      <span class="plgb-rank-value">${r.value}</span>
    </div>`;
  }).join('')}</div>`;
}

/* 세션(1:1 매치업) 1건 행 */
function _plgbSessionRow(s){
  const ca=_cbUcolVivid(_plgbUniv(s.p1)), cb=_cbUcolVivid(_plgbUniv(s.p2));
  const aWin=s.winner&&s.winner===s.p1, bWin=s.winner&&s.winner===s.p2;
  return `<div class="plgb-match-row">
    <span class="plgb-match-tag">🔥 끝장전</span>
    ${s.d?`<span class="plgb-match-date">${_cbFmtD(s.d)}</span>`:''}
    <span style="flex:1;text-align:right;font-weight:${aWin?'900':'700'};opacity:${bWin?'.6':'1'};color:${ca}">${_cbEsc(s.p1||'미정')}</span>
    <span class="plgb-match-score">${s.done?`${s.p1w}:${s.p2w}`:'예정'}</span>
    <span style="flex:1;font-weight:${bWin?'900':'700'};opacity:${aWin?'.6':'1'};color:${cb}">${_cbEsc(s.p2||'미정')}</span>
  </div>`;
}

function _plgbMapBarsHTML(mapStats){
  if(!mapStats.length) return _plgbEmpty('맵 기록이 없습니다.');
  const total=mapStats.reduce((s,x)=>s+x.total,0);
  return `<div>${mapStats.slice(0,8).map(x=>{
    const p=total?Math.round(x.total/total*100):0;
    return `<div class="plgb-map-row">
      <span class="plgb-map-name">${_cbEsc(x.map)}</span>
      <div class="plgb-map-track"><div class="plgb-map-fill" style="width:${p}%"></div></div>
      <span class="plgb-map-val">${x.total}회 (${p}%)</span>
    </div>`;
  }).join('')}</div>`;
}

function _plgbMvpHTML(mvpTop,mvpCands){
  if(!mvpTop) return '';
  const mCol=_cbUcolVivid(mvpTop.univ);
  return `<div class="plgb-mvp">
    <span style="position:relative;display:inline-flex;flex-shrink:0">${_cbPlayerAvatar(mvpTop.name,(typeof window!=='undefined'&&window.innerWidth<640)?104:150)}</span>
    <div class="plgb-mvp-side">
      <div class="plgb-mvp-ribbon">🔥 Sudden Death MVP</div>
      <div class="plgb-mvp-name" style="color:${mCol}">${_cbEsc(mvpTop.name)}</div>
      <div class="plgb-mvp-meta">${mvpTop.univ?_cbTeamChip(mvpTop.univ,'',_cbUcolVivid(mvpTop.univ)):''}<span>${mvpTop.w}승 ${mvpTop.l}패 · 승률 ${mvpTop.rate}%</span></div>
    </div>
    <div class="plgb-mvp-cands">${_plgbRankList(mvpCands.slice(0,5).map(p=>({
      name:p.name,color:_cbUcolVivid(p.univ),sub:`${p.w}승 ${p.l}패`,value:`${Math.round(p.score)}pt`
    })),true)}</div>
  </div>`;
}

/* ══════════ 프로리그 끝장전 브리핑 (메인, plgb-* 전용 디자인) ══════════ */
function rProLeagueGJBriefing(){
  const allGames=_plgbGames();
  const games=(typeof passDateFilter==='function')?allGames.filter(g=>passDateFilter(g.d,'progj-brief')):allGames;
  const periodActive=_plgbPeriodActive();
  const periodBar=_plgbPeriodBarHTML();

  const sessions=_plgbSessions(games);
  const doneSess=sessions.filter(s=>s.done);
  const totalN=sessions.length, doneN=doneSess.length;

  if(!totalN){
    return `<div class="plgb-wrap"${_plgbWrapAttr()}>
      <div class="plgb-ticker"><span class="plgb-ticker-dot"></span><span class="plgb-ticker-txt">PRO LEAGUE SUDDEN DEATH</span></div>
      <div class="plgb-hero">
        <div class="plgb-hero-kicker">Sudden Death Briefing</div>
        <div class="plgb-hero-title">프로리그 끝장전 브리핑</div>
        <div class="plgb-hero-desc">${periodActive?'선택한 기간에 등록된 경기가 없습니다. 다른 기간을 선택해보세요.':'경기를 입력하면 브리핑이 생성됩니다.'}</div>
      </div>
      ${periodBar}
      <div class="plgb-body">${_plgbEmpty(periodActive?'선택한 기간에 경기 기록이 없습니다.':'경기를 기록하면 브리핑이 채워집니다.')}</div>
    </div>`;
  }

  const pct=_cbPct(doneN,totalN);
  const playerStats=_plgbPlayerStats(games);
  const mapStats=_plgbMapStats(games);
  const dates=[...new Set(games.map(g=>g.d).filter(Boolean))].sort();

  const winTop=playerStats.slice().sort((a,b)=>b.w-a.w||b.rate-a.rate).slice(0,5);
  const rateTop=playerStats.filter(p=>p.total>=5).slice().sort((a,b)=>b.rate-a.rate||b.w-a.w).slice(0,5);

  const mvpCands=playerStats.map(p=>({...p,score:p.w*10+p.rate*0.4}))
    .sort((a,b)=>b.score-a.score);
  const mvpTop=mvpCands[0]||null;

  const timeline=doneSess.slice().sort((a,b)=>String(b.d||'').localeCompare(String(a.d||''))).slice(0,6);

  // 접전 하이라이트: 완료 세션 중 스코어 차이가 작은 순
  const closeHighlight=doneSess.slice().sort((a,b)=>Math.abs(a.p1w-a.p2w)-Math.abs(b.p1w-b.p2w)).slice(0,3);

  const lead=winTop[0];
  const headline=lead?`${_cbEsc(lead.name)} ${lead.w}승 ${lead.l}패(승률 ${lead.rate}%)로 선두`:'집계 중';
  const periodLabel=dates.length?`${_cbFmtD(dates[0])} ~ ${_cbFmtD(dates[dates.length-1])}`:'일정 미정';

  /* 음성듣기(TTS)용 스냅샷 — pro-league-gj-briefing-tts.js가 이 값을 읽어 낭독 큐를 만든다 */
  try{
    window._plgbBriefingSpeakSnapshot={
      title:periodActive?`프로리그 끝장전 브리핑 (${periodLabel})`:'프로리그 끝장전 브리핑',
      totalN,doneN,pct,
      headline,
      winTop:winTop.map(p=>({name:p.name,w:p.w,l:p.l,rate:p.rate})),
      rateTop:rateTop.map(p=>({name:p.name,w:p.w,l:p.l,rate:p.rate})),
      mvp:mvpTop?{name:mvpTop.name,w:mvpTop.w,l:mvpTop.l,rate:mvpTop.rate}:null,
      topMap:mapStats[0]?{map:mapStats[0].map,total:mapStats[0].total}:null
    };
  }catch(e){}

  let body=`<div class="plgb-grid2">
    <div>${_plgbSection('개인 승률 TOP 5','5경기 이상 기준',_plgbRankList(rateTop.map(p=>({
      name:p.name,color:_cbUcolVivid(p.univ),
      sub:`${_cbFormDots(p.form)} ${p.w}승 ${p.l}패`,value:`${p.rate}%`
    }))))}</div>
    <div>${_plgbSection('개인 다승 TOP 5','전 경기 통합 기준',_plgbRankList(winTop.map(p=>({
      name:p.name,color:_cbUcolVivid(p.univ),
      sub:`${_cbFormDots(p.form)} ${p.rate}%`,value:`${p.w}승 ${p.l}패`
    }))))}</div>
  </div>`;

  if(mvpTop){
    body+=_plgbSection('끝장전 MVP','다승 · 승률 종합',_plgbMvpHTML(mvpTop,mvpCands));
  }

  body+=_plgbSection('최근 경기 결과','최신 기록 순',
    timeline.length?timeline.map(s=>_plgbSessionRow(s)).join(''):_plgbEmpty('아직 완료된 경기가 없습니다.'));

  if(closeHighlight.length){
    body+=_plgbSection('🔥 접전 하이라이트','스코어 차이가 적은 순','<div>'+closeHighlight.map(s=>_plgbSessionRow(s)).join('')+'</div>');
  }

  if(mapStats.length){
    body+=_plgbSection('인기 맵','전체 게임 기준',_plgbMapBarsHTML(mapStats));
  }

  return `<div class="plgb-wrap"${_plgbWrapAttr()}>
    ${_plgbTickerHTML()}
    <div class="plgb-hero">
      <div class="plgb-hero-kicker">Sudden Death Briefing</div>
      <div class="plgb-hero-title">프로리그 끝장전 브리핑</div>
      <div class="plgb-hero-desc">전체 ${totalN}경기 중 ${doneN}경기가 기록됐습니다.${periodActive?` 선택 기간: ${periodLabel}`:''}</div>
    </div>
    ${periodBar}
    ${_plgbKpiGrid([
      ['총 경기',`${totalN}경기`,`완료 ${doneN} · 진행률 ${pct}%`,'#f59e0b'],
      ['활동 스트리머',`${playerStats.length}명`,mvpTop?`MVP 후보 ${_cbEsc(mvpTop.name)}`:'집계 중','#10b981'],
      ['총 게임',`${games.length}게임`,mapStats.length?`최다 사용맵 ${_cbEsc(mapStats[0].map)}`:'맵 기록 없음','#facc15'],
      ['기간',periodLabel,'','#fb7185']
    ])}
    ${_plgbProgressHTML(pct,doneN,totalN)}
    <div class="plgb-body">${body}</div>
  </div>`;
}
