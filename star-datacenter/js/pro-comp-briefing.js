/* ══════════════════════════════════════════════════════════════
   프로리그 대회 브리핑
   - 조별리그(개인전) + 대진표 + 팀전 + 중장전, 4개 소스를 한 화면에
     종합해 보여주는 프로리그 전용 브리핑. 일반대회 브리핑(competition-
     briefing.js)의 b2w2 신문 디자인 시스템(_cbShell/_cbSection/
     _cbRankList 등 공용 헬퍼)을 그대로 재사용해 톤을 통일하되,
     프로리그 데이터 구조(개인전 조별리그/대진표 + 별도 팀전 + 별도
     중장전)에 맞춰 집계 로직은 새로 작성.
   ══════════════════════════════════════════════════════════════ */

/* ── 데이터 수집 ── */

/* 조별리그+대진표+3위전 개인 매치 수집 (m.a/m.b = 선수명, m.winner='A'|'B') */
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
  const totalRounds=(tn.bracket||[]).length;
  (tn.bracket||[]).forEach((rnd,ri)=>{
    const rLabel=ri===totalRounds-1?'결승':ri===totalRounds-2?'4강':ri===totalRounds-3?'8강':`${Math.pow(2,Math.max(1,totalRounds-ri))}강`;
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

/* ── UI 조각 (프로리그 전용 — competition-briefing.js의 _cb* 공용 헬퍼와 조합해 사용) ── */

/* 개인전 매치 1건 행 (조별리그/대진표/3위전 공용) */
function _pcbIndivRow(m){
  const ca=_cbUcol(_pcbUniv(m.a)), cb=_cbUcol(_pcbUniv(m.b));
  const aWin=m.done&&m.winner==='A', bWin=m.done&&m.winner==='B';
  return `<div style="display:flex;align-items:center;gap:9px;padding:9px 12px;border:1px solid var(--b2w-rule-soft,#e5e7eb);border-radius:10px;background:var(--b2w-paper-alt,#fff);margin-bottom:6px">
    ${m.phaseTag?`<span style="flex-shrink:0;font-size:10px;font-weight:900;color:#fff;background:var(--b2w-accent,#2563eb);padding:2px 8px;border-radius:99px">${_cbEsc(m.phaseTag)}</span>`:''}
    ${m.d?`<span style="flex-shrink:0;font-size:10px;font-weight:700;color:var(--b2w-ink-soft,#6b7280)">${_cbFmtD(m.d)}</span>`:''}
    <span style="flex:1;text-align:right;font-weight:${aWin?'900':'700'};opacity:${bWin?'.6':'1'};color:${ca}">${_cbEsc(m.a||'미정')}</span>
    <span style="flex-shrink:0;font-weight:900;padding:2px 9px;border-radius:99px;background:var(--b2w-tag-bg,#f1f5f9);border:1px solid var(--b2w-tag-border,#e2e8f0);font-size:11px">${m.done?'승':'예정'}</span>
    <span style="flex:1;font-weight:${bWin?'900':'700'};opacity:${aWin?'.6':'1'};color:${cb}">${_cbEsc(m.b||'미정')}</span>
  </div>`;
}

/* 팀전 매치 1건 행 */
function _pcbTeamRow(tm){
  const ca=_cbUcol(tm.teamAName), cb=_cbUcol(tm.teamBName);
  const aWin=tm.done&&tm.sa>tm.sb, bWin=tm.done&&tm.sb>tm.sa;
  return `<div style="display:flex;align-items:center;gap:9px;padding:9px 12px;border:1px solid var(--b2w-rule-soft,#e5e7eb);border-radius:10px;background:var(--b2w-paper-alt,#fff);margin-bottom:6px">
    <span style="flex-shrink:0;font-size:10px;font-weight:900;color:#fff;background:#0891b2;padding:2px 8px;border-radius:99px">🤝 팀전</span>
    ${tm.d?`<span style="flex-shrink:0;font-size:10px;font-weight:700;color:var(--b2w-ink-soft,#6b7280)">${_cbFmtD(tm.d)}</span>`:''}
    <span style="flex:1;text-align:right;font-weight:${aWin?'900':'700'};opacity:${bWin?'.6':'1'};color:${ca}">${_cbEsc(tm.teamAName||'미정')}</span>
    <span style="flex-shrink:0;font-weight:900;padding:2px 9px;border-radius:99px;background:var(--b2w-tag-bg,#f1f5f9);border:1px solid var(--b2w-tag-border,#e2e8f0)">${tm.done?`${tm.sa}:${tm.sb}`:'예정'}</span>
    <span style="flex:1;font-weight:${bWin?'900':'700'};opacity:${aWin?'.6':'1'};color:${cb}">${_cbEsc(tm.teamBName||'미정')}</span>
  </div>`;
}

/* 중장전 세션 1건 행 */
function _pcbGjRow(sess){
  const ca=_cbUcol(_pcbUniv(sess.a)), cb=_cbUcol(_pcbUniv(sess.b));
  const aWin=sess.winner&&sess.winner===sess.a, bWin=sess.winner&&sess.winner===sess.b;
  return `<div style="display:flex;align-items:center;gap:9px;padding:9px 12px;border:1px solid var(--b2w-rule-soft,#e5e7eb);border-radius:10px;background:var(--b2w-paper-alt,#fff);margin-bottom:6px">
    <span style="flex-shrink:0;font-size:10px;font-weight:900;color:#fff;background:#dc2626;padding:2px 8px;border-radius:99px">🔥 중장전</span>
    ${sess.d?`<span style="flex-shrink:0;font-size:10px;font-weight:700;color:var(--b2w-ink-soft,#6b7280)">${_cbFmtD(sess.d)}</span>`:''}
    <span style="flex:1;text-align:right;font-weight:${aWin?'900':'700'};opacity:${bWin?'.6':'1'};color:${ca}">${_cbEsc(sess.a||'미정')}</span>
    <span style="flex-shrink:0;font-weight:900;padding:2px 9px;border-radius:99px;background:var(--b2w-tag-bg,#f1f5f9);border:1px solid var(--b2w-tag-border,#e2e8f0)">${sess.done?`${sess.p1w}:${sess.p2w}`:'예정'}</span>
    <span style="flex:1;font-weight:${bWin?'900':'700'};opacity:${aWin?'.6':'1'};color:${cb}">${_cbEsc(sess.b||'미정')}</span>
  </div>`;
}

/* ══════════ 프로리그 대회 브리핑 (메인) ══════════ */
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
    return _cbShell('Pro League Briefing',`${tn.name} 프로리그 브리핑`,'아직 등록된 경기가 없습니다.','핵심 지표','조편성/팀 등록 후 경기를 기록하면 브리핑이 생성됩니다.',
      [['조 수',(tn.groups||[]).length+'개'],['경기','0'],['완료','0'],['진행률','0%']],
      _cbEmpty('경기를 기록하면 브리핑이 채워집니다.'));
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
      upcoming:upcoming.map(m=>({a:m.a,b:m.b,rLabel:m.rLabel}))
    };
  }catch(e){}

  let body=_cbKpis([
    ['총 경기',`${totalM}경기`,`조별리그·대진표 ${indiv.length} · 팀전 ${team.length} · 중장전 ${gj.length}`],
    ['완료',`${doneM}경기`,`남은 경기 ${totalM-doneM}경기`],
    ['진행률',`${pct}%`,dates.length?`${_cbFmtD(dates[0])} ~ ${_cbFmtD(dates[dates.length-1])}`:'일정 미정'],
    ['참가 대학',`${univStats.length}팀`,mvpTop?`MVP 후보 ${_cbEsc(mvpTop.name)}`:'집계 중']
  ]);
  body+=`<div style="margin-top:12px">${_cbBar(pct,pct===100?'#16a34a':pct>=50?'var(--b2w-accent,#2563eb)':'#d97706')}</div>`;
  body+=`<div class="no-export" style="display:flex;justify-content:flex-end;margin-top:10px">
    <button type="button" id="pcb-speak-btn" class="b2w2-btn" style="padding:6px 14px;font-size:12px" onclick="_pcbBriefingToggleSpeak()">🔊 음성듣기</button>
  </div>`;

  body+=`<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:16px;margin-top:22px">
    <div>${_cbSection('개인 승률 TOP 5','3경기 이상 기준',_cbRankList(rateTop.map(p=>({
      name:p.name,color:_cbUcol(p.univ),
      sub:`${_cbFormDots(p.form)} ${p.w}승 ${p.l}패`,value:`${p.rate}%`
    }))))}</div>
    <div>${_cbSection('개인 다승 TOP 5','전 포맷 통합 기준',_cbRankList(winTop.map(p=>({
      name:p.name,color:_cbUcol(p.univ),
      sub:`${_cbFormDots(p.form)} ${p.rate}%`,value:`${p.w}승 ${p.l}패`
    }))))}</div>
  </div>`;

  if(mvpTop){
    const mCol=_cbUcol(mvpTop.univ);
    body+=_cbSection('대회 MVP','다승 · 중장전 기여 · 승률 종합',
      `<div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap;padding:14px;background:linear-gradient(135deg,${mCol}12,var(--b2w-paper-alt,#fff) 70%);border:1px solid ${mCol}35;border-radius:12px">
        <span style="position:relative;display:inline-flex;flex-shrink:0">${_cbPlayerAvatar(mvpTop.name,72)}</span>
        <div style="flex:1;min-width:180px">
          <div style="font-size:20px;font-weight:900;color:${mCol};line-height:1.25;word-break:break-word">${_cbEsc(mvpTop.name)}</div>
          <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-top:5px;font-size:13px;font-weight:700;color:var(--b2w-ink-soft,#6b7280)">
            ${mvpTop.univ?_cbTeamChip(mvpTop.univ):''}
            <span>${mvpTop.w}승 ${mvpTop.l}패 · 승률 ${mvpTop.rate}%${mvpTop.gjW?` · 중장전 ${mvpTop.gjW}승`:''}</span>
          </div>
        </div>
        <div style="min-width:180px">${_cbRankList(mvpCands.slice(0,5).map(p=>({
          name:p.name,color:_cbUcol(p.univ),sub:`${p.w}승 ${p.l}패`,value:`${Math.round(p.score)}pt`
        })))}</div>
      </div>`);
  }

  body+=_cbSection('최근 경기 결과','조별리그·대진표·팀전·중장전 최신 기록',
    timeline.length?timeline.map(m=>
      m._kind==='team'?_pcbTeamRow(m):m._kind==='gj'?_pcbGjRow(m):_pcbIndivRow(m)
    ).join(''):_cbEmpty('아직 완료된 경기가 없습니다.'));

  if(gjHighlight.length){
    body+=_cbSection('🔥 중장전 하이라이트','접전으로 끝난 세션 순','<div>'+gjHighlight.map(s=>_pcbGjRow(s)).join('')+'</div>');
  }

  if(upcoming.length){
    body+=_cbSection('다음 라운드 예고','대진 확정 · 결과 대기',
      '<div>'+upcoming.map(m=>`<div style="display:flex;align-items:center;gap:9px;padding:9px 12px;border:1px dashed var(--b2w-rule-soft,#e5e7eb);border-radius:10px;margin-bottom:6px">
        <span style="flex-shrink:0;font-size:10px;font-weight:900;color:#fff;background:#7c3aed;padding:2px 8px;border-radius:99px">${_cbEsc(m.rLabel||'')}</span>
        <span style="flex:1;text-align:right;font-weight:800;color:${_cbUcol(_pcbUniv(m.a))}">${_cbEsc(m.a)}</span>
        <span style="flex-shrink:0;font-weight:900;color:var(--b2w-ink-soft,#6b7280)">VS</span>
        <span style="flex:1;font-weight:800;color:${_cbUcol(_pcbUniv(m.b))}">${_cbEsc(m.b)}</span>
      </div>`).join('')+'</div>');
  }

  return _cbShell('Pro League Briefing',`${tn.name} 프로리그 브리핑`,
    `조별리그·대진표·팀전·중장전 전체 ${totalM}경기 중 ${doneM}경기가 기록됐습니다.`,
    '핵심 지표',headline,
    [['진행률',`${pct}%`],['참가 대학',`${univStats.length}팀`],['완료 경기',`${doneM}경기`],['MVP 후보',mvpTop?_cbEsc(mvpTop.name):'집계 중']],
    body);
}
