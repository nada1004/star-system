/* ══════════════════════════════════════════════════════════════
   티어대회 브리핑 (신규, 2026-08-21)
   - 일반대회 브리핑(competition-briefing.js, cbs-* 라이트 종이톤)과
     프로리그 3종 브리핑(plb-/plgb-/pcb-*, 다크 스코어보드/트로피 톤)과는
     또 다른 정체성을 준다: "티어 색상 연동 래더(등급표)" 톤(ttb-*).
     이 대회에 참가한 선수들의 실제 설정된 티어 색상(getTierBtnColor)을
     그대로 헤더 포인트 컬러로 사용해, 브리핑 색만 봐도 "이 대회가 어떤
     티어대"인지 감이 오게 만든다. 설정탭에서 고정 프리셋 테마로 바꿀 수도
     있음(su_ttb_briefing_theme).
   - 데이터 모델은 procomp(그룹+대진표 배열)와 달리 티어대회는 flat한
     ttM 배열 + stage 필드('league'=조별리그,'bkt'=토너먼트,그 외=일반)로
     저장된다. tier-tour-render.js의 각 서브탭(grprecords/bktrecords/records)이
     쓰는 필터링 로직(_eqComp)과 동일한 방식으로 수집한다.
   ══════════════════════════════════════════════════════════════ */

/* ── 데이터 수집 ── */

function _ttbEqComp(m, compName){
  const c = String(compName||'').trim();
  if(!c) return true;
  const a = String(m && m.compName||'').trim();
  const b = String(m && m.n||'').trim();
  const d = String(m && m.t||'').trim();
  return a===c || b===c || d===c;
}

/* 매치 1건(ttM 엔트리)을 게임 단위로 펼침 — sets[].games[]가 있으면 그걸 쓰고,
   없으면(레거시) sa/sb 스코어만으로 판정 1건짜리 가상 게임을 만든다 */
function _ttbFlattenGames(m){
  const games=[];
  const sets=Array.isArray(m.sets)?m.sets:[];
  if(sets.length){
    sets.forEach(s=>{
      (Array.isArray(s.games)?s.games:[]).forEach(g=>{
        if(!g||!g.winner) return;
        games.push({playerA:g.playerA||m.a,playerB:g.playerB||m.b,winner:g.winner,map:g.map||'',d:m.d||''});
      });
    });
  }
  if(!games.length && m.a && m.b && (m.sa!=null && m.sb!=null) && (m.sa!==m.sb)){
    games.push({playerA:m.a,playerB:m.b,winner:m.sa>m.sb?'A':'B',map:'',d:m.d||''});
  }
  return games;
}

function _ttbMatches(ttm, compName){
  const league=[], bkt=[], general=[];
  (Array.isArray(ttm)?ttm:[]).forEach(m=>{
    if(!m || !_ttbEqComp(m,compName)) return;
    const done = m.sa!=null && m.sb!=null;
    const winner = done ? (m.sa>m.sb?'A':(m.sb>m.sa?'B':'')) : '';
    const lastLabel = (()=>{ const sets=Array.isArray(m.sets)?m.sets:[]; return sets.length?(sets[sets.length-1].label||''):''; })();
    const row = {...m, done, winner, rLabel:lastLabel};
    if(m.stage==='league') league.push(row);
    else if(m.stage==='bkt') bkt.push(row);
    else general.push(row);
  });
  return {league, bkt, general};
}

function _ttbUniv(name){
  try{ const p=(typeof players!=='undefined'?players:[]).find(x=>x.name===name); return p?(p.univ||''):''; }catch(e){ return ''; }
}
function _ttbTier(name){
  try{ const p=(typeof players!=='undefined'?players:[]).find(x=>x.name===name); return p?(p.tier||''):''; }catch(e){ return ''; }
}

/* 대회 우승 — 토너먼트(stage='bkt') 매치 중 마지막 세트 라벨이 "결승"인
   완료된 경기의 승자. 순위 등으로 대체 추정하지 않는다. */
function _ttbChampion(bkt){
  const finals = bkt.filter(m=>m.done && m.rLabel==='결승');
  if(!finals.length) return null;
  const f = finals[finals.length-1];
  const winName = f.winner==='A'?f.a:f.b;
  if(!winName) return null;
  const loseName = f.winner==='A'?f.b:f.a;
  return {
    name:winName, univ:_ttbUniv(winName),
    opponent:loseName||'', opponentUniv:loseName?_ttbUniv(loseName):'',
    score:`${f.sa}:${f.sb}`
  };
}

/* 선수별 통합 전적: 조별리그+토너먼트+일반 전부(게임 단위) 합산 */
function _ttbPlayerStats(league,bkt,general){
  const ps={};
  const canon=(raw)=>{
    const n=String(raw||'').trim(); if(!n) return '';
    try{ if(typeof resolvePlayerName==='function'){ const info=resolvePlayerName(n); if(info&&info.name) return info.name; } }catch(e){}
    return n;
  };
  const ens=(raw)=>{ const n=canon(raw); if(!n) return null; if(!ps[n]) ps[n]={name:n,w:0,l:0,univ:_ttbUniv(n),tier:_ttbTier(n),form:[]}; return ps[n]; };
  [...league,...bkt,...general].forEach(m=>{
    _ttbFlattenGames(m).forEach(g=>{
      if(!g.winner) return;
      const wn=g.winner==='A'?g.playerA:g.playerB, ln=g.winner==='A'?g.playerB:g.playerA;
      if(!wn||!ln) return;
      ens(wn).w++; ens(ln).l++;
      ens(wn).form.push({d:g.d||'',win:true}); ens(ln).form.push({d:g.d||'',win:false});
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

/* 참가자들의 실제 설정 티어 중 가장 많이 나온 티어의 색상을 브리핑 포인트
   컬러로 사용(= "티어 색상 연동 래더톤"). 참가자 티어 정보가 전혀 없으면
   중립 스틸톤으로 폴백. */
function _ttbTierAccent(playerStats){
  const freq={};
  playerStats.forEach(p=>{ const t=String(p.tier||'').trim(); if(!t) return; freq[t]=(freq[t]||0)+1; });
  const tiers=Object.keys(freq).sort((a,b)=>freq[b]-freq[a]);
  if(!tiers.length || typeof getTierBtnColor!=='function') return {accent:'#64748b',accent2:'#94a3b8',tierLabel:''};
  const top=tiers[0];
  const accent=getTierBtnColor(top);
  const second=tiers[1]?getTierBtnColor(tiers[1]):accent;
  const label=(typeof getTierLabel==='function')?getTierLabel(top):top;
  return {accent,accent2:second,tierLabel:label};
}

/* ── UI 조각 (ttb-* — 티어대회 브리핑 전용) ── */

const _TTB_BRIEFING_THEMES=['dynamic','custom','sage','slate','plum','sand','mono','rose'];
function _ttbBriefingThemeLoad(){
  try{ const v=localStorage.getItem('su_ttb_briefing_theme'); return _TTB_BRIEFING_THEMES.includes(v)?v:'dynamic'; }catch(e){ return 'dynamic'; }
}
/* 사용자가 직접 고른 색(su_ttb_custom_accent, hex)에 흰색을 섞어 은은한
   보조색(accent2)을 자동으로 만들어준다 — 사용자는 색 하나만 고르면 됨 */
function _ttbLighten(hex, amt){
  try{
    const h=String(hex||'').replace('#','');
    const r=parseInt(h.slice(0,2),16), g=parseInt(h.slice(2,4),16), b=parseInt(h.slice(4,6),16);
    const mix=(c)=>Math.round(c+(255-c)*amt);
    const to=(n)=>String(Math.max(0,Math.min(255,n)).toString(16)).padStart(2,'0');
    return `#${to(mix(r))}${to(mix(g))}${to(mix(b))}`;
  }catch(e){ return hex||'#94a3b8'; }
}
/* dynamic(기본)은 고정 CSS 테마가 아니라 매 렌더마다 참가자 티어색을 읽어
   인라인 스타일 변수로 주입한다 — 그래서 data-theme 속성 대신 style을 반환.
   custom도 같은 방식으로, 사용자가 설정탭에서 고른 색을 인라인 주입한다. */
function _ttbWrapAttrs(tierAccent){
  const t=_ttbBriefingThemeLoad();
  if(t==='dynamic'){
    const a=tierAccent||{accent:'#64748b',accent2:'#94a3b8'};
    return ` style="--ttb-accent:${a.accent};--ttb-accent2:${a.accent2};"`;
  }
  if(t==='custom'){
    let c='#64748b';
    try{ const v=localStorage.getItem('su_ttb_custom_accent'); if(v && /^#[0-9a-fA-F]{6}$/.test(v)) c=v; }catch(e){}
    return ` style="--ttb-accent:${c};--ttb-accent2:${_ttbLighten(c,0.42)};"`;
  }
  return ` data-theme="${t}"`;
}

function _ttbEmpty(msg){ return `<div class="ttb-empty">${_cbEsc(msg)}</div>`; }

function _ttbTickerHTML(tierLabel){
  return `<div class="ttb-ticker">
    <span class="ttb-ticker-dot"></span>
    <span class="ttb-ticker-txt">TIER TOURNAMENT${tierLabel?' · '+_cbEsc(tierLabel):''}</span>
  </div>`;
}

function _ttbKpiGrid(items){
  return `<div class="ttb-kpi-grid">${items.map(k=>`<div class="ttb-kpi-card"><i style="background:${k[3]||'var(--ttb-accent)'}"></i>
    <div class="ttb-kpi-label">${_cbEsc(k[0])}</div>
    <div class="ttb-kpi-value">${k[1]}</div>
    <div class="ttb-kpi-sub">${k[2]||''}</div>
  </div>`).join('')}</div>`;
}

function _ttbProgressHTML(pct,doneM,totalM){
  return `<div class="ttb-progress-panel">
    <div class="ttb-progress-head">
      <span class="ttb-progress-title">🎯 대회 진행률</span>
      <button type="button" id="ttb-speak-btn" class="ttb-speak-btn no-export" onclick="_ttbBriefingToggleSpeak()">🔊 음성듣기</button>
    </div>
    <div class="ttb-progress-track"><div class="ttb-progress-fill" style="width:${pct}%"></div></div>
    <div class="ttb-progress-caption"><span>완료 ${doneM} / ${totalM}경기</span><span>${pct}%</span></div>
  </div>`;
}

function _ttbSection(title,sub,inner){
  return `<section class="ttb-section">
    <div class="ttb-section-head">
      <span class="ttb-section-title">${_cbEsc(title)}</span>
      ${sub?`<span class="ttb-section-sub">${_cbEsc(sub)}</span>`:''}
    </div>
    ${inner}
  </section>`;
}

function _ttbRankList(rows,dark){
  if(!rows.length) return _ttbEmpty('표시할 기록이 없습니다.');
  const medal=['#fbbf24','#94a3b8','#c17a3f'];
  return `<div class="ttb-rank-list">${rows.map((r,i)=>{
    const col=r.color||'var(--ttb-accent)';
    const top=i===0;
    const badgeBg=i<3?medal[i]:`${col}30`;
    const badgeColor=i<3?'#151a1f':col;
    const rowBg=`background:linear-gradient(100deg,${col}${top?'38':'1e'},transparent 78%)`;
    return `<div class="ttb-rank-row${top?' top1':''}" style="border-left:${top?'5px':'4px'} solid ${col};${rowBg}">
      <span class="ttb-rank-badge" style="background:${badgeBg};color:${badgeColor}">${i+1}</span>
      <span class="ttb-rank-name" style="color:${col}">${r.icon||''}<span>${_cbEsc(r.name)}</span></span>
      ${r.sub?`<span class="ttb-rank-sub">${r.sub}</span>`:''}
      <span class="ttb-rank-value">${r.value}</span>
    </div>`;
  }).join('')}</div>`;
}

function _ttbChampionHeroHTML(champion,champStat){
  if(!champion) return '';
  const cCol=_cbUcolVivid(champion.univ||champion.name);
  const oCol=champion.opponentUniv?_cbUcolVivid(champion.opponentUniv):'var(--ttb-accent2)';
  const isMobile=(typeof window!=='undefined'&&window.innerWidth<640);
  return `<div class="ttb-champion-hero">
    <span class="ttb-champion-hero-avatar">${_cbPlayerAvatar(champion.name,isMobile?104:150)}</span>
    <div class="ttb-champion-hero-side">
      <div class="ttb-champion-hero-ribbon">🏆 TIER CHAMPION</div>
      <div class="ttb-champion-hero-name" style="color:${cCol}">${_cbEsc(champion.name)}</div>
      <div class="ttb-champion-hero-meta">${champion.univ?_cbTeamChip(champion.univ,'',cCol):''}${champStat?`<span>${champStat.w}승 ${champStat.l}패 · 승률 ${champStat.rate}%</span>`:''}</div>
      ${champion.opponent?`<div class="ttb-champion-hero-final">
        <span class="ttb-champion-hero-final-label">⚔️ 결승 상대</span>
        <span class="ttb-champion-hero-final-opp" style="color:${oCol}">${_cbEsc(champion.opponent)}</span>
        ${champion.score?`<span class="ttb-champion-hero-final-score">${_cbEsc(champion.score)}</span>`:''}
      </div>`:''}
    </div>
  </div>`;
}

function _ttbMvpHTML(mvpTop,mvpCands){
  if(!mvpTop) return '';
  const mCol=_cbUcolVivid(mvpTop.univ||mvpTop.name);
  const isMobile=(typeof window!=='undefined'&&window.innerWidth<640);
  return `<div class="ttb-mvp">
    <span style="position:relative;display:inline-flex;flex-shrink:0">${_cbPlayerAvatar(mvpTop.name,isMobile?104:150)}</span>
    <div class="ttb-mvp-side">
      <div class="ttb-mvp-ribbon">🎯 Tier MVP</div>
      <div class="ttb-mvp-name" style="color:${mCol}">${_cbEsc(mvpTop.name)}</div>
      <div class="ttb-mvp-meta">${mvpTop.univ?_cbTeamChip(mvpTop.univ,'',mCol):''}<span>${mvpTop.w}승 ${mvpTop.l}패 · 승률 ${mvpTop.rate}%</span></div>
    </div>
    <div class="ttb-mvp-cands">${_ttbRankList(mvpCands.slice(0,5).map(p=>({
      name:p.name,color:_cbUcolVivid(p.univ||p.name),sub:`${p.w}승 ${p.l}패`,value:`${Math.round(p.score)}pt`
    })),true)}</div>
  </div>`;
}

function _ttbMatchRow(m,tag,tagColor){
  const ca=_cbUcolVivid(_ttbUniv(m.a)||m.a), cb=_cbUcolVivid(_ttbUniv(m.b)||m.b);
  const aWin=m.done&&m.winner==='A', bWin=m.done&&m.winner==='B';
  return `<div class="ttb-match-row">
    <span class="ttb-match-tag" style="background:${tagColor||'var(--ttb-accent)'}">${_cbEsc(tag||m.rLabel||'')}</span>
    ${m.d?`<span class="ttb-match-date">${_cbFmtD(m.d)}</span>`:''}
    <span style="flex:1;text-align:right;font-weight:${aWin?'900':'700'};opacity:${bWin?'.6':'1'};color:${ca}">${_cbEsc(m.a||'미정')}</span>
    <span class="ttb-match-score">${m.done?`${m.sa}:${m.sb}`:'예정'}</span>
    <span style="flex:1;font-weight:${bWin?'900':'700'};opacity:${aWin?'.6':'1'};color:${cb}">${_cbEsc(m.b||'미정')}</span>
  </div>`;
}

/* ══════════ 티어대회 브리핑 (메인, ttb-* 전용 디자인) ══════════ */
function rTierTourBriefing(compName){
  const _ttm=(typeof ttM!=='undefined'&&Array.isArray(ttM))?ttM:[];
  if(!compName) return `<div style="padding:30px;text-align:center;color:var(--gray-l)">대회를 선택하세요.</div>`;

  const {league,bkt,general}=_ttbMatches(_ttm,compName);
  const leagueDone=league.filter(m=>m.done), bktDone=bkt.filter(m=>m.done), generalDone=general.filter(m=>m.done);
  const totalM=league.length+bkt.length+general.length;
  const doneM=leagueDone.length+bktDone.length+generalDone.length;

  const playerStats=_ttbPlayerStats(league,bkt,general);
  const tierAccent=_ttbTierAccent(playerStats);
  const wrapAttrs=_ttbWrapAttrs(tierAccent);

  if(!totalM){
    return `<div class="ttb-wrap"${wrapAttrs}>
      ${_ttbTickerHTML(tierAccent.tierLabel)}
      <div class="ttb-hero">
        <div class="ttb-hero-kicker">Tier Tournament Briefing</div>
        <div class="ttb-hero-title">${_cbEsc(compName)} 티어대회 브리핑</div>
        <div class="ttb-hero-desc">경기를 입력하면 브리핑이 생성됩니다.</div>
      </div>
      <div class="ttb-body">${_ttbEmpty('경기를 기록하면 브리핑이 채워집니다.')}</div>
    </div>`;
  }

  const pct=_cbPct(doneM,totalM);
  const dates=[...new Set([...leagueDone,...bktDone,...generalDone].map(m=>m.d).filter(Boolean))].sort();

  const winTop=playerStats.slice().sort((a,b)=>b.w-a.w||b.rate-a.rate).slice(0,5);
  const rateTop=playerStats.filter(p=>p.total>=3).slice().sort((a,b)=>b.rate-a.rate||b.w-a.w).slice(0,5);

  const timeline=[
    ...leagueDone.map(m=>({...m,_tag:'조별리그',_tagColor:'#0891b2'})),
    ...bktDone.map(m=>({...m,_tag:m.rLabel||'토너먼트',_tagColor:'#7c3aed'})),
    ...generalDone.map(m=>({...m,_tag:'일반전',_tagColor:'#64748b'}))
  ].sort((a,b)=>String(b.d||'').localeCompare(String(a.d||''))).slice(0,6);

  const champion=_ttbChampion(bkt);
  const champStat=champion?(playerStats.find(p=>p.name===champion.name)||null):null;

  const mvpCands=playerStats.map(p=>({...p,score:p.w*10+p.rate*0.4}))
    .sort((a,b)=>b.score-a.score);
  const mvpTop=mvpCands[0]||null;

  const lead=(()=>{ const u={}; playerStats.forEach(p=>{ if(!p.univ) return; if(!u[p.univ]) u[p.univ]={u:p.univ,w:0,l:0}; u[p.univ].w+=p.w; u[p.univ].l+=p.l; }); const arr=Object.values(u).map(s=>({...s,rate:(s.w+s.l)?Math.round(s.w/(s.w+s.l)*100):0})).sort((a,b)=>b.w-a.w||b.rate-a.rate); return arr[0]||null; })();
  const headline=lead?`${_cbEsc(lead.u)} ${lead.w}승 ${lead.l}패(승률 ${lead.rate}%)로 선두`:'집계 중';

  try{
    window._ttbBriefingSpeakSnapshot={
      title:`${compName} 티어대회 브리핑`,
      totalM,doneM,pct,
      leagueN:league.length,bktN:bkt.length,generalN:general.length,
      headline,
      winTop:winTop.map(p=>({name:p.name,w:p.w,l:p.l,rate:p.rate})),
      rateTop:rateTop.map(p=>({name:p.name,w:p.w,l:p.l,rate:p.rate})),
      mvp:mvpTop?{name:mvpTop.name,w:mvpTop.w,l:mvpTop.l,rate:mvpTop.rate}:null,
      champion:champion?{name:champion.name,w:champStat?champStat.w:null,l:champStat?champStat.l:null}:null
    };
  }catch(e){}

  let body=`<div class="ttb-grid2">
    <div>${_ttbSection('개인 승률 TOP 5','3경기 이상 기준',_ttbRankList(rateTop.map(p=>({
      name:p.name,color:_cbUcolVivid(p.univ||p.name),
      sub:`${_cbFormDots(p.form)} ${p.w}승 ${p.l}패`,value:`${p.rate}%`
    }))))}</div>
    <div>${_ttbSection('개인 다승 TOP 5','전 단계 통합 기준',_ttbRankList(winTop.map(p=>({
      name:p.name,color:_cbUcolVivid(p.univ||p.name),
      sub:`${_cbFormDots(p.form)} ${p.rate}%`,value:`${p.w}승 ${p.l}패`
    }))))}</div>
  </div>`;

  if(champion||mvpTop){
    body+=`<div class="ttb-champ-mvp-row">
      ${champion?_ttbSection('대회 우승','토너먼트 결승 승자',_ttbChampionHeroHTML(champion,champStat)):''}
      ${mvpTop?_ttbSection('대회 MVP','다승 · 승률 종합',_ttbMvpHTML(mvpTop,mvpCands)):''}
    </div>`;
  }

  body+=_ttbSection('최근 경기 결과','조별리그·토너먼트·일반전 최신 기록',
    timeline.length?timeline.map(m=>_ttbMatchRow(m,m._tag,m._tagColor)).join(''):_ttbEmpty('아직 완료된 경기가 없습니다.'));

  return `<div class="ttb-wrap"${wrapAttrs}>
    ${_ttbTickerHTML(tierAccent.tierLabel)}
    <div class="ttb-hero">
      <div class="ttb-hero-kicker">Tier Tournament Briefing</div>
      <div class="ttb-hero-title">${_cbEsc(compName)} 티어대회 브리핑</div>
      <div class="ttb-hero-desc">조별리그·토너먼트·일반전 전체 ${totalM}경기 중 ${doneM}경기가 기록됐습니다.</div>
      <div class="ttb-hero-headline"><span class="ttb-hero-dot"></span>${headline}</div>
    </div>
    ${_ttbKpiGrid([
      ['총 경기',`${totalM}경기`,`조별리그 ${league.length} · 토너먼트 ${bkt.length} · 일반 ${general.length}`,'var(--ttb-accent)'],
      ['참가자',`${playerStats.length}명`,mvpTop?`MVP 후보 ${_cbEsc(mvpTop.name)}`:'집계 중','var(--ttb-accent2)'],
      ['완료 경기',`${doneM}경기`,`남은 경기 ${totalM-doneM}경기`,'var(--ttb-accent)'],
      ['기간',dates.length?`${_cbFmtD(dates[0])} ~ ${_cbFmtD(dates[dates.length-1])}`:'일정 미정','','var(--ttb-accent2)']
    ])}
    ${_ttbProgressHTML(pct,doneM,totalM)}
    <div class="ttb-body">${body}</div>
  </div>`;
}
