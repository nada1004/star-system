/* ══════════════════════════════════════════════════════════════
   프로리그 대회 브리핑 (재설계, 2026-08-20)
   - 조별리그(개인전) + 대진표 + 팀전 + 중장전, 4개 소스를 한 화면에
     종합해 보여주는 프로리그 전용 브리핑. 데이터 집계 로직(_pcb*Matches/
     _pcbPlayerStats/_pcbUnivStats)은 기존 그대로 두고, 렌더링은 프로리그
     (일반) 브리핑의 plb-* 스코어보드 톤과 짝을 맞춘 전용 pcb-* 디자인
     (딥퍼플+골드, "대회·트로피" 톤)으로 새로 작성 — 일반 대회 브리핑
     (competition-briefing.js의 b2w2 신문 디자인, _cbShell 등)과는 완전히
     분리된 별도 시스템이라 다른 대회 브리핑 화면에는 영향 없음.
   ══════════════════════════════════════════════════════════════ */

/* ── 데이터 수집 ── */

/* 조별리그+대진표+3위전 개인 매치 수집 (m.a/m.b = 선수명, m.winner='A'|'B')
   (버그픽스, 2026-08-20) 대진표 파트: 대전기록 탭〉프로리그 대회〉토너먼트
   (histProCompTourneyHTML)와 동일하게 tn.stageRecords(신규 "대진표 기록" 입력
   시스템)를 최우선으로 사용하고, 해당 대회에 stageRecords 항목이 하나도 없을
   때만 레거시 tn.bracket으로 폴백한다. 기존엔 tn.bracket만 읽어서, 실제로는
   "🗂️ 대진표 기록"(stageRecords)으로 입력된 경기가 브리핑에 전혀 반영되지
   않는 문제가 있었음. */
function _pcbIndivMatches(tn){
  const out=[];
  (tn.groups||[]).forEach((grp,gi)=>{
    const gl='ABCDEFGHIJ'[gi]||String(gi+1);
    (grp.matches||[]).forEach((m,mi)=>{
      if(!m) return;
      if(m._stageRecId||(grp._recTarget||'')==='stage') return; // 대진표 기록으로 반영된 경기 중복 제외
      out.push({...m,phase:'조별리그',phaseTag:`${grp.name||gl+'조'}`,grpIdx:gi,matchNum:mi+1,done:!!m.winner});
    });
  });

  /* (버그픽스, 2026-08-20) 라운드별 독립 폴백으로 변경.
     기존엔 tn.stageRecords에 단 하나의 라운드라도 항목이 있으면(_hasStageItems=true)
     레거시 tn.bracket 전체를 통째로 무시했다. 그 결과 일부 라운드(예: 결승)만 예전
     대진표 UI로 입력되고 나머지 라운드가 새 "대진표 기록" 시스템으로 입력된 대회에서는,
     레거시로 입력된 라운드의 경기가 통계 집계에서 통째로 빠져 선수 승패 총합이
     실제보다 적게 나오는 문제가 있었다(우승자 개인 기록이 조별리그+대진표 전체가
     아니라 일부만 반영되는 것처럼 보이는 원인). 이제 라운드 단위로 병합한다:
     stageRecords에 항목이 있는 라운드는 그것을 쓰고, 없는(또는 비어있는) 라운드만
     레거시 tn.bracket에서 보완한다 — 두 시스템이 라운드별로 섞여 있어도 누락 없다. */
  const usedRoundLabels=new Set();
  if(tn.stageRecords){
    Object.keys(tn.stageRecords).forEach(r=>{
      const list=Array.isArray(tn.stageRecords[r])?tn.stageRecords[r].filter(m=>m&&m.a&&m.b):[];
      if(!list.length) return;
      usedRoundLabels.add(r);
      list.forEach(m=>out.push({...m,phase:'대진표',phaseTag:r,rLabel:r,done:!!m.winner}));
    });
  }
  const _bktRounds=Array.isArray(tn.bracket)?tn.bracket:[];
  const _bktTotalRounds=_bktRounds.length;
  _bktRounds.forEach((rnd,ri)=>{
    const rLabel=ri===_bktTotalRounds-1?'결승':ri===_bktTotalRounds-2?'4강':ri===_bktTotalRounds-3?'8강':`${Math.pow(2,Math.max(1,_bktTotalRounds-ri))}강`;
    if(usedRoundLabels.has(rLabel)) return; // 이 라운드는 stageRecords로 이미 채워짐
    (rnd||[]).forEach(m=>{
      if(!m||!m.a||!m.b||m.a==='TBD'||m.b==='TBD') return;
      out.push({...m,phase:'대진표',phaseTag:rLabel,rLabel,done:!!m.winner});
    });
  });
  if(tn.thirdPlace&&tn.thirdPlace.a&&tn.thirdPlace.b&&tn.thirdPlace.a!=='TBD'&&tn.thirdPlace.b!=='TBD'){
    out.push({...tn.thirdPlace,phase:'3위전',phaseTag:'3위전',rLabel:'3위전',done:!!tn.thirdPlace.winner});
  }
  return out;
}

/* 다음 라운드 예고용 — 아직 선수가 안 정해진(TBD) 대진표 매치 */
function _pcbUpcomingBktMatches(tn){
  const out=[];
  const totalRounds=(tn.bracket||[]).length;
  (tn.bracket||[]).forEach((rnd,ri)=>{
    const rLabel=ri===totalRounds-1?'결승':ri===totalRounds-2?'4강':ri===totalRounds-3?'8강':`${Math.pow(2,Math.max(1,totalRounds-ri))}강`;
    (rnd||[]).forEach(m=>{
      if(!m) return;
      const aOk=m.a&&m.a!=='TBD', bOk=m.b&&m.b!=='TBD';
      if(aOk&&bOk&&!m.winner) out.push({...m,rLabel});
    });
  });
  return out;
}

/* 팀전(대학 vs 대학) 매치 수집 */
function _pcbTeamMatches(tn){
  return (tn.teamMatches||[]).map(tm=>({...tm,done:(tm.sa!=null&&tm.sb!=null)&&((tm.games||[]).length>0)}));
}

/* 중장전(선수 vs 선수 다판) 세션 수집 */
function _pcbGjMatches(tn){
  return (tn.gjMatches||[]).map(sess=>{
    const p1w=(sess.games||[]).filter(g=>g.winner===sess.a).length;
    const p2w=(sess.games||[]).filter(g=>g.winner===sess.b).length;
    return {...sess,p1w,p2w,done:(sess.games||[]).length>0,winner:p1w>p2w?sess.a:(p2w>p1w?sess.b:'')};
  });
}

function _pcbUniv(name){
  try{ const p=(typeof players!=='undefined'?players:[]).find(x=>x.name===name); return p?(p.univ||''):''; }catch(e){ return ''; }
}

/* 대회 우승자 — 반드시 "결승에서 이긴 사람"만 인정한다(순위 기반 추정 금지).
   1순위: tn.stageRecords['결승']에 기록된, 완료된(a/b/winner 모두 있는) 마지막 경기의 승자.
   2순위(레거시 폴백): tn.bracket 마지막 라운드의 첫 번째 경기 승자 — 대진표 화면의
   "FINAL CHAMPION" 배너(_pcBracketMeta, pro-comp-bracket.js)가 쓰는 것과 동일한 소스라
   항상 실제 결승 결과와 일치한다. 두 경로 모두 없으면 우승자 없음(null) — 순위 등으로
   대체 추정하지 않는다(순위 1위가 결승 승자가 아닐 수 있으므로). */
function _pcbChampion(tn){
  if(!tn) return null;
  const build=(f)=>{
    const winName=f.winner==='A'?f.a:f.b;
    if(!winName) return null;
    const loseName=f.winner==='A'?f.b:f.a;
    const games=Array.isArray(f._games)?f._games:[];
    const scoreWin=games.filter(g=>g&&g.winner===f.winner).length;
    const scoreLose=games.filter(g=>g&&g.winner&&g.winner!==f.winner).length;
    return {
      name:winName,univ:_pcbUniv(winName),
      opponent:loseName||'',opponentUniv:loseName?_pcbUniv(loseName):'',
      score:(scoreWin+scoreLose>0)?`${scoreWin}:${scoreLose}`:''
    };
  };
  const stageFinal=Array.isArray(tn.stageRecords&&tn.stageRecords['결승'])?tn.stageRecords['결승']:[];
  const doneStageFinal=stageFinal.filter(m=>m&&m.a&&m.b&&m.winner);
  if(doneStageFinal.length){
    const info=build(doneStageFinal[doneStageFinal.length-1]);
    if(info) return info;
  }
  const rounds=Array.isArray(tn.bracket)?tn.bracket:[];
  const finalMatch=(rounds[rounds.length-1]||[])[0];
  if(finalMatch&&finalMatch.a&&finalMatch.b&&finalMatch.winner){
    const info=build(finalMatch);
    if(info) return info;
  }
  return null;
}

/* ── 집계 ── */

/* 선수별 통합 전적: 조별리그+대진표+3위전(개인전) + 팀전 게임 + 중장전 게임 */
function _pcbPlayerStats(indiv,team,gj){
  const ps={};
  const ens=(n)=>{ if(!n) return null; if(!ps[n]) ps[n]={name:n,w:0,l:0,gjW:0,gjL:0,univ:_pcbUniv(n),form:[]}; return ps[n]; };
  indiv.forEach(m=>{
    if(!m.done||!m.a||!m.b) return;
    const wn=m.winner==='A'?m.a:m.b, ln=m.winner==='A'?m.b:m.a;
    ens(wn).w++; ens(ln).l++;
    ens(wn).form.push({d:m.d||'',win:true}); ens(ln).form.push({d:m.d||'',win:false});
  });
  team.forEach(tm=>{
    (tm.games||[]).forEach(g=>{
      if(!g.wName||!g.lName) return;
      ens(g.wName).w++; ens(g.lName).l++;
      ens(g.wName).form.push({d:tm.d||'',win:true}); ens(g.lName).form.push({d:tm.d||'',win:false});
    });
  });
  gj.forEach(sess=>{
    (sess.games||[]).forEach(g=>{
      if(!g.winner) return;
      const ln=g.winner===sess.a?sess.b:sess.a;
      if(!ln) return;
      ens(g.winner).w++; ens(g.winner).gjW++;
      ens(ln).l++;
      ens(g.winner).form.push({d:sess.d||'',win:true}); ens(ln).form.push({d:sess.d||'',win:false});
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

/* 대학(팀) 순위 — 소속 선수들의 개인전+팀전+중장전 승패를 대학 단위로 합산 (단일 단위: 게임 수) */
function _pcbUnivStats(playerStats){
  const st={};
  playerStats.forEach(p=>{
    if(!p.univ) return;
    if(!st[p.univ]) st[p.univ]={u:p.univ,w:0,l:0};
    st[p.univ].w+=p.w; st[p.univ].l+=p.l;
  });
  return Object.values(st).map(s=>({...s,g:s.w+s.l,rate:(s.w+s.l)?Math.round(s.w/(s.w+s.l)*100):0}))
    .sort((a,b)=>b.w-a.w||b.rate-a.rate);
}

/* ── UI 조각 (pcb-* — 프로리그 "대회" 브리핑 전용, 2026-08-20 재설계)
   프로리그(일반) 브리핑의 plb-* 스코어보드 톤과 짝을 맞추되, "대회·트로피"
   느낌의 딥퍼플+골드 톤으로 차별화. competition-briefing.js의 _cb*는 다른
   대회 브리핑(조별리그/토너먼트 브리핑 등)과 공유되는 헬퍼라 그대로 두고,
   순수 유틸(_cbEsc/_cbFmtD/_cbPct/_cbUcol/_cbPlayerAvatar/_cbTeamChip/
   _cbFormDots)만 재사용한다. ── */

function _pcbEmpty(msg){ return `<div class="pcb-empty">${_cbEsc(msg)}</div>`; }

function _pcbTickerHTML(univStats){
  return `<div class="pcb-ticker">
    <span class="pcb-ticker-dot"></span>
    <span class="pcb-ticker-txt">PRO LEAGUE · TOURNAMENT</span>
  </div>`;
}

function _pcbKpiGrid(items){
  return `<div class="pcb-kpi-grid">${items.map(k=>`<div class="pcb-kpi-card"><i style="background:${k[3]||'#a855f7'}"></i>
    <div class="pcb-kpi-label">${_cbEsc(k[0])}</div>
    <div class="pcb-kpi-value">${k[1]}</div>
    <div class="pcb-kpi-sub">${k[2]||''}</div>
  </div>`).join('')}</div>`;
}

/* 진행률+TTS 통합 패널 — 처음부터 다크 배경을 명시해, 흰 글자/버튼이 밝은
   바깥 배경에 묻혀 안 보이는 일이 없도록 설계 */
function _pcbProgressHTML(pct,doneM,totalM){
  return `<div class="pcb-progress-panel">
    <div class="pcb-progress-head">
      <span class="pcb-progress-title">🏆 대회 진행률</span>
      <button type="button" id="pcb-speak-btn" class="pcb-speak-btn no-export" onclick="_pcbBriefingToggleSpeak()">🔊 음성듣기</button>
    </div>
    <div class="pcb-progress-track"><div class="pcb-progress-fill" style="width:${pct}%"></div></div>
    <div class="pcb-progress-caption"><span>완료 ${doneM} / ${totalM}경기</span><span>${pct}%</span></div>
  </div>`;
}

function _pcbSection(title,sub,inner){
  return `<section class="pcb-section">
    <div class="pcb-section-head">
      <span class="pcb-section-title">${_cbEsc(title)}</span>
      ${sub?`<span class="pcb-section-sub">${_cbEsc(sub)}</span>`:''}
    </div>
    ${inner}
  </section>`;
}

/* 순위 리스트 — top3 메달톤 배지. dark=true면(MVP 후보처럼 어두운 카드
   위에 얹힐 때) 1등 강조 배경이 밝은 색으로 번지지 않게 함 */
function _pcbRankList(rows,dark){
  if(!rows.length) return _pcbEmpty('표시할 기록이 없습니다.');
  const medal=['#fbbf24','#94a3b8','#c17a3f'];
  return `<div class="pcb-rank-list">${rows.map((r,i)=>{
    const col=r.color||'#d8b4fe';
    const top=i===0;
    const badgeBg=i<3?medal[i]:`${col}30`;
    const badgeColor=i<3?'#1d1236':col;
    const topBg=`background:linear-gradient(100deg,${col}38,rgba(255,255,255,.06) 78%)`;
    return `<div class="pcb-rank-row${top?' top1':''}" style="border-left:${top?'5px':'4px'} solid ${col};${top?topBg:''}">
      <span class="pcb-rank-badge" style="background:${badgeBg};color:${badgeColor}">${i+1}</span>
      <span class="pcb-rank-name" style="color:${col}">${r.icon||''}<span>${_cbEsc(r.name)}</span></span>
      ${r.sub?`<span class="pcb-rank-sub">${r.sub}</span>`:''}
      <span class="pcb-rank-value">${r.value}</span>
    </div>`;
  }).join('')}</div>`;
}

/* 대회 우승 — 결승전 승자를 별도의 큰 히어로 카드로 강조 표시 (대회 MVP 카드보다 크게).
   결승 상대·스코어 정보까지 채워 카드 내용 밀도를 MVP 카드(순위 리스트로 꽉 참)와
   맞춰서, 사진만 있고 휑해 보이지 않도록 한다. */
function _pcbChampionHeroHTML(champion,champStat){
  if(!champion) return '';
  const cCol=_cbUcolVivid(champion.univ);
  const oCol=champion.opponentUniv?_cbUcolVivid(champion.opponentUniv):'#c4b5fd';
  const isMobile=(typeof window!=='undefined'&&window.innerWidth<640);
  return `<div class="pcb-champion-hero">
    <span class="pcb-champion-hero-avatar">${_cbPlayerAvatar(champion.name,isMobile?104:150)}</span>
    <div class="pcb-champion-hero-side">
      <div class="pcb-champion-hero-ribbon">🏆 TOURNAMENT CHAMPION</div>
      <div class="pcb-champion-hero-name" style="color:${cCol}">${_cbEsc(champion.name)}</div>
      <div class="pcb-champion-hero-meta">${champion.univ?_cbTeamChip(champion.univ,'',cCol):''}${champStat?`<span>${champStat.w}승 ${champStat.l}패 · 승률 ${champStat.rate}%</span>`:''}</div>
      ${champion.opponent?`<div class="pcb-champion-hero-final">
        <span class="pcb-champion-hero-final-label">⚔️ 결승 상대</span>
        <span class="pcb-champion-hero-final-opp" style="color:${oCol}">${_cbEsc(champion.opponent)}</span>
        ${champion.score?`<span class="pcb-champion-hero-final-score">${_cbEsc(champion.score)}</span>`:''}
      </div>`:''}
    </div>
  </div>`;
}

function _pcbMvpHTML(mvpTop,mvpCands){
  if(!mvpTop) return '';
  const mCol=_cbUcolVivid(mvpTop.univ);
  const isMobile=(typeof window!=='undefined'&&window.innerWidth<640);
  return `<div class="pcb-mvp">
    <span style="position:relative;display:inline-flex;flex-shrink:0">${_cbPlayerAvatar(mvpTop.name,isMobile?104:150)}</span>
    <div class="pcb-mvp-side">
      <div class="pcb-mvp-ribbon">🏆 Tournament MVP</div>
      <div class="pcb-mvp-name" style="color:${mCol}">${_cbEsc(mvpTop.name)}</div>
      <div class="pcb-mvp-meta">${mvpTop.univ?_cbTeamChip(mvpTop.univ,'',_cbUcolVivid(mvpTop.univ)):''}<span>${mvpTop.w}승 ${mvpTop.l}패 · 승률 ${mvpTop.rate}%${mvpTop.gjW?` · 중장전 ${mvpTop.gjW}승`:''}</span></div>
    </div>
    <div class="pcb-mvp-cands">${_pcbRankList(mvpCands.slice(0,5).map(p=>({
      name:p.name,color:_cbUcolVivid(p.univ),sub:`${p.w}승 ${p.l}패`,value:`${Math.round(p.score)}pt`
    })),true)}</div>
  </div>`;
}

/* 개인전 매치 1건 행 (조별리그/대진표/3위전 공용) */
function _pcbIndivRow(m){
  const ca=_cbUcolVivid(_pcbUniv(m.a)), cb=_cbUcolVivid(_pcbUniv(m.b));
  const aWin=m.done&&m.winner==='A', bWin=m.done&&m.winner==='B';
  return `<div class="pcb-match-row">
    ${m.phaseTag?`<span class="pcb-match-tag" style="background:#7c3aed">${_cbEsc(m.phaseTag)}</span>`:''}
    ${m.d?`<span class="pcb-match-date">${_cbFmtD(m.d)}</span>`:''}
    <span style="flex:1;text-align:right;font-weight:${aWin?'900':'700'};opacity:${bWin?'.6':'1'};color:${ca}">${_cbEsc(m.a||'미정')}</span>
    <span class="pcb-match-score">${m.done?'승':'예정'}</span>
    <span style="flex:1;font-weight:${bWin?'900':'700'};opacity:${aWin?'.6':'1'};color:${cb}">${_cbEsc(m.b||'미정')}</span>
  </div>`;
}

/* 팀전 매치 1건 행 */
function _pcbTeamRow(tm){
  const ca=_cbUcolVivid(tm.teamAName), cb=_cbUcolVivid(tm.teamBName);
  const aWin=tm.done&&tm.sa>tm.sb, bWin=tm.done&&tm.sb>tm.sa;
  return `<div class="pcb-match-row">
    <span class="pcb-match-tag" style="background:#0891b2">🤝 팀전</span>
    ${tm.d?`<span class="pcb-match-date">${_cbFmtD(tm.d)}</span>`:''}
    <span style="flex:1;text-align:right;font-weight:${aWin?'900':'700'};opacity:${bWin?'.6':'1'};color:${ca}">${_cbEsc(tm.teamAName||'미정')}</span>
    <span class="pcb-match-score">${tm.done?`${tm.sa}:${tm.sb}`:'예정'}</span>
    <span style="flex:1;font-weight:${bWin?'900':'700'};opacity:${aWin?'.6':'1'};color:${cb}">${_cbEsc(tm.teamBName||'미정')}</span>
  </div>`;
}

/* 중장전 세션 1건 행 */
function _pcbGjRow(sess){
  const ca=_cbUcolVivid(_pcbUniv(sess.a)), cb=_cbUcolVivid(_pcbUniv(sess.b));
  const aWin=sess.winner&&sess.winner===sess.a, bWin=sess.winner&&sess.winner===sess.b;
  return `<div class="pcb-match-row">
    <span class="pcb-match-tag" style="background:#dc2626">🔥 중장전</span>
    ${sess.d?`<span class="pcb-match-date">${_cbFmtD(sess.d)}</span>`:''}
    <span style="flex:1;text-align:right;font-weight:${aWin?'900':'700'};opacity:${bWin?'.6':'1'};color:${ca}">${_cbEsc(sess.a||'미정')}</span>
    <span class="pcb-match-score">${sess.done?`${sess.p1w}:${sess.p2w}`:'예정'}</span>
    <span style="flex:1;font-weight:${bWin?'900':'700'};opacity:${aWin?'.6':'1'};color:${cb}">${_cbEsc(sess.b||'미정')}</span>
  </div>`;
}

/* ══════════ 프로리그 대회 브리핑 (메인, pcb-* 전용 디자인) ══════════ */
function rProCompBriefing(tn){
  if(!tn) return `<div style="padding:30px;text-align:center;color:var(--gray-l)">대회를 선택하세요.</div>`;

  const indiv=_pcbIndivMatches(tn);
  const team=_pcbTeamMatches(tn);
  const gj=_pcbGjMatches(tn);

  const indivDone=indiv.filter(m=>m.done);
  const teamDone=team.filter(m=>m.done);
  const gjDone=gj.filter(m=>m.done);

  const totalM=indiv.length+team.length+gj.length;
  const doneM=indivDone.length+teamDone.length+gjDone.length;

  if(!totalM){
    return `<div class="pcb-wrap">
      <div class="pcb-ticker"><span class="pcb-ticker-dot"></span><span class="pcb-ticker-txt">PRO LEAGUE · TOURNAMENT</span></div>
      <div class="pcb-hero">
        <div class="pcb-hero-kicker">Pro League Briefing</div>
        <div class="pcb-hero-title">${_cbEsc(tn.name)} 프로리그 브리핑</div>
        <div class="pcb-hero-desc">조편성/팀 등록 후 경기를 기록하면 브리핑이 생성됩니다.</div>
      </div>
      <div class="pcb-body">${_pcbEmpty('경기를 기록하면 브리핑이 채워집니다.')}</div>
    </div>`;
  }

  const pct=_cbPct(doneM,totalM);
  const playerStats=_pcbPlayerStats(indiv,team,gj);
  const univStats=_pcbUnivStats(playerStats);
  const lead=univStats[0];

  // 최근 경기: 3개 소스를 한 타임라인으로 합쳐 최신순 정렬
  const timeline=[
    ...indivDone.map(m=>({...m,_kind:'indiv',_d:m.d||''})),
    ...teamDone.map(m=>({...m,_kind:'team',_d:m.d||''})),
    ...gjDone.map(m=>({...m,_kind:'gj',_d:m.d||''}))
  ].sort((a,b)=>String(b._d||'').localeCompare(String(a._d||''))).slice(0,6);

  const dates=[...new Set([...indivDone,...teamDone,...gjDone].map(m=>m.d).filter(Boolean))].sort();

  // 개인 다승/승률 TOP5
  const winTop=playerStats.slice().sort((a,b)=>b.w-a.w||b.rate-a.rate).slice(0,5);
  const rateTop=playerStats.filter(p=>p.total>=3).slice().sort((a,b)=>b.rate-a.rate||b.w-a.w).slice(0,5);

  // 중장전 하이라이트: 최근 완료 세션 중 접전(스코어 차이 작은) 순
  const gjHighlight=gjDone.slice().sort((a,b)=>Math.abs(a.p1w-a.p2w)-Math.abs(b.p1w-b.p2w)).slice(0,3);

  // 대회 MVP — 다승×10 + 중장전승×8(시그니처 포맷 가중) + 승률×0.4 + 소속대학 선두 보너스
  const mvpCands=playerStats.map(p=>({...p,score:p.w*10+p.gjW*8+p.rate*0.4+(lead&&p.univ===lead.u?12:0)}))
    .sort((a,b)=>b.score-a.score);
  const mvpTop=mvpCands[0]||null;
  const champion=_pcbChampion(tn);
  const champStat=champion?(playerStats.find(p=>p.name===champion.name)||null):null;

  // 다음 라운드 예고
  const upcoming=_pcbUpcomingBktMatches(tn).slice(0,5);

  const headline=lead?`${_cbEsc(lead.u)} ${lead.w}승 ${lead.l}패(승률 ${lead.rate}%)로 선두`:'집계 중';

  // 음성듣기(TTS)용 스냅샷 — pro-comp-briefing-tts.js가 이 값을 읽어 낭독 큐를 만든다
  try{
    window._pcbBriefingSpeakSnapshot={
      title:`${tn.name} 프로리그 브리핑`,
      totalM,doneM,pct,
      indivN:indiv.length,teamN:team.length,gjN:gj.length,
      headline,
      winTop:winTop.map(p=>({name:p.name,w:p.w,l:p.l,rate:p.rate})),
      rateTop:rateTop.map(p=>({name:p.name,w:p.w,l:p.l,rate:p.rate})),
      mvp:mvpTop?{name:mvpTop.name,w:mvpTop.w,l:mvpTop.l,rate:mvpTop.rate,gjW:mvpTop.gjW}:null,
      champion:champion?{name:champion.name,w:champStat?champStat.w:null,l:champStat?champStat.l:null}:null,
      upcoming:upcoming.map(m=>({a:m.a,b:m.b,rLabel:m.rLabel}))
    };
  }catch(e){}

  let body=`<div class="pcb-grid2">
    <div>${_pcbSection('개인 승률 TOP 5','3경기 이상 기준',_pcbRankList(rateTop.map(p=>({
      name:p.name,color:_cbUcolVivid(p.univ),
      sub:`${_cbFormDots(p.form)} ${p.w}승 ${p.l}패`,value:`${p.rate}%`
    }))))}</div>
    <div>${_pcbSection('개인 다승 TOP 5','전 포맷 통합 기준',_pcbRankList(winTop.map(p=>({
      name:p.name,color:_cbUcolVivid(p.univ),
      sub:`${_cbFormDots(p.form)} ${p.rate}%`,value:`${p.w}승 ${p.l}패`
    }))))}</div>
  </div>`;

  if(champion||mvpTop){
    body+=`<div class="pcb-champ-mvp-row">
      ${champion?_pcbSection('대회 우승','결승전 승자',_pcbChampionHeroHTML(champion,champStat)):''}
      ${mvpTop?_pcbSection('대회 MVP','다승 · 중장전 기여 · 승률 종합',_pcbMvpHTML(mvpTop,mvpCands)):''}
    </div>`;
  }

  body+=_pcbSection('최근 경기 결과','조별리그·대진표·팀전·중장전 최신 기록',
    timeline.length?timeline.map(m=>
      m._kind==='team'?_pcbTeamRow(m):m._kind==='gj'?_pcbGjRow(m):_pcbIndivRow(m)
    ).join(''):_pcbEmpty('아직 완료된 경기가 없습니다.'));

  if(gjHighlight.length){
    body+=_pcbSection('🔥 중장전 하이라이트','접전으로 끝난 세션 순','<div>'+gjHighlight.map(s=>_pcbGjRow(s)).join('')+'</div>');
  }

  if(upcoming.length){
    body+=_pcbSection('다음 라운드 예고','대진 확정 · 결과 대기',
      '<div>'+upcoming.map(m=>`<div class="pcb-upcoming-row">
        <span class="pcb-upcoming-tag">${_cbEsc(m.rLabel||'')}</span>
        <span style="flex:1;text-align:right;font-weight:800;color:${_cbUcolVivid(_pcbUniv(m.a))}">${_cbEsc(m.a)}</span>
        <span class="pcb-upcoming-vs">VS</span>
        <span style="flex:1;font-weight:800;color:${_cbUcolVivid(_pcbUniv(m.b))}">${_cbEsc(m.b)}</span>
      </div>`).join('')+'</div>');
  }

  return `<div class="pcb-wrap">
    ${_pcbTickerHTML(univStats)}
    <div class="pcb-hero">
      <div class="pcb-hero-kicker">Pro League Briefing</div>
      <div class="pcb-hero-title">${_cbEsc(tn.name)} 프로리그 브리핑</div>
      <div class="pcb-hero-desc">조별리그·대진표·팀전·중장전 전체 ${totalM}경기 중 ${doneM}경기가 기록됐습니다.</div>
    </div>
    ${_pcbKpiGrid([
      ['총 경기',`${totalM}경기`,`조별리그·대진표 ${indiv.length} · 팀전 ${team.length} · 중장전 ${gj.length}`,'#a855f7'],
      ['참가 대학',`${univStats.length}팀`,mvpTop?`MVP 후보 ${_cbEsc(mvpTop.name)}`:'집계 중','#fbbf24'],
      ['완료 경기',`${doneM}경기`,`남은 경기 ${totalM-doneM}경기`,'#818cf8'],
      ['기간',dates.length?`${_cbFmtD(dates[0])} ~ ${_cbFmtD(dates[dates.length-1])}`:'일정 미정','','#f43f5e']
    ])}
    ${_pcbProgressHTML(pct,doneM,totalM)}
    <div class="pcb-body">${body}</div>
  </div>`;
}
