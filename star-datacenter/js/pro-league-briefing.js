/* ══════════════════════════════════════════════════════════════
   프로리그(일반) 브리핑 — proM(팀전 경기 기록) 전체를 요약.
   프로리그 대회 브리핑(pro-comp-briefing.js)과 달리 특정 대회(tn)에
   묶이지 않고 전역 proM을 대상으로 하며, competition-briefing.js의
   b2w2 신문 디자인 시스템(_cbShell/_cbSection/_cbRankList/_cbTeamStats/
   _cbMatchRow 등 공용 헬퍼)을 그대로 재사용한다.
   ══════════════════════════════════════════════════════════════ */

/* ── 데이터 수집 ── */

/* proM(경기 단위) → _cb* 공용 헬퍼(a/b/sa/sb/done)가 기대하는 형태로 매핑 */
function _plbMatches(){
  const list=(typeof proM!=='undefined'&&Array.isArray(proM))?proM:[];
  return list.map(m=>({
    ...m,
    a:m.teamALabel||'A팀', b:m.teamBLabel||'B팀',
    sa:m.scoreA||0, sb:m.scoreB||0,
    done:(m.scoreA!=null&&m.scoreB!=null)
  }));
}

/* 선수별 통합 전적 — 각 게임의 승/패 진영(개인전/2인1조 모두 지원)을 선수 단위로 집계 */
function _plbPlayerStats(matches){
  const ps={};
  const split=(v)=>String(v||'').split(/[,+，]/).map(x=>x.trim()).filter(Boolean);
  const ens=(n)=>{ if(!n) return null; if(!ps[n]) ps[n]={name:n,w:0,l:0,univ:(typeof _pcbUniv==='function'?_pcbUniv(n):''),form:[]}; return ps[n]; };
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

/* ══════════ 프로리그(일반) 브리핑 (메인) ══════════ */
function rProLeagueBriefing(){
  const matches=_plbMatches();
  const done=matches.filter(m=>m.done);
  const totalM=matches.length, doneM=done.length;

  if(!totalM){
    return _cbShell('Pro League Briefing','프로리그 브리핑','아직 등록된 경기가 없습니다.','핵심 지표','경기를 입력하면 브리핑이 생성됩니다.',
      [['총 경기','0'],['완료','0'],['진행률','0%'],['참가 팀','0팀']],
      _cbEmpty('경기를 기록하면 브리핑이 채워집니다.'));
  }

  const pct=_cbPct(doneM,totalM);
  const teamStats=(typeof _cbTeamStats==='function')?_cbTeamStats(matches):[];
  const lead=teamStats[0];
  const playerStats=_plbPlayerStats(matches);
  const mapStats=_plbMapStats(matches);
  const dates=[...new Set(matches.map(m=>m.d).filter(Boolean))].sort();

  const winTop=playerStats.slice().sort((a,b)=>b.w-a.w||b.rate-a.rate).slice(0,5);
  const rateTop=playerStats.filter(p=>p.total>=3).slice().sort((a,b)=>b.rate-a.rate||b.w-a.w).slice(0,5);

  const mvpCands=playerStats.map(p=>({...p,score:p.w*10+p.rate*0.4+(lead&&p.univ===lead.u?8:0)}))
    .sort((a,b)=>b.score-a.score);
  const mvpTop=mvpCands[0]||null;

  const timeline=done.slice().sort((a,b)=>String(b.d||'').localeCompare(String(a.d||''))).slice(0,6);

  const headline=lead?`${_cbEsc(lead.u)} ${lead.w}승 ${lead.l}패(승률 ${lead.rate}%)로 선두`:'집계 중';

  // 음성듣기(TTS)용 스냅샷 — pro-league-briefing-tts.js가 이 값을 읽어 낭독 큐를 만든다
  try{
    window._plbBriefingSpeakSnapshot={
      title:'프로리그 브리핑',
      totalM,doneM,pct,
      headline,
      winTop:winTop.map(p=>({name:p.name,w:p.w,l:p.l,rate:p.rate})),
      rateTop:rateTop.map(p=>({name:p.name,w:p.w,l:p.l,rate:p.rate})),
      mvp:mvpTop?{name:mvpTop.name,w:mvpTop.w,l:mvpTop.l,rate:mvpTop.rate}:null,
      topMap:mapStats[0]?{map:mapStats[0].map,total:mapStats[0].total}:null
    };
  }catch(e){}

  let body=_cbKpis([
    ['총 경기',`${totalM}경기`,`완료 ${doneM} · 진행률 ${pct}%`],
    ['참가 팀',`${teamStats.length}팀`,mvpTop?`MVP 후보 ${_cbEsc(mvpTop.name)}`:'집계 중'],
    ['활동 선수',`${playerStats.length}명`,mapStats.length?`최다 사용맵 ${_cbEsc(mapStats[0].map)}`:'맵 기록 없음'],
    ['기간',dates.length?`${_cbFmtD(dates[0])} ~ ${_cbFmtD(dates[dates.length-1])}`:'일정 미정','']
  ]);
  body+=`<div style="margin-top:12px">${_cbBar(pct,pct===100?'#16a34a':pct>=50?'var(--b2w-accent,#2563eb)':'#d97706')}</div>`;
  body+=`<div class="no-export" style="display:flex;justify-content:flex-end;margin-top:10px">
    <button type="button" id="plb-speak-btn" class="b2w2-btn" style="padding:6px 14px;font-size:12px" onclick="_plbBriefingToggleSpeak()">🔊 음성듣기</button>
  </div>`;

  body+=`<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:16px;margin-top:22px">
    <div>${_cbSection('개인 승률 TOP 5','3경기 이상 기준',_cbRankList(rateTop.map(p=>({
      name:p.name,color:_cbUcol(p.univ),
      sub:`${_cbFormDots(p.form)} ${p.w}승 ${p.l}패`,value:`${p.rate}%`
    }))))}</div>
    <div>${_cbSection('개인 다승 TOP 5','전 경기 통합 기준',_cbRankList(winTop.map(p=>({
      name:p.name,color:_cbUcol(p.univ),
      sub:`${_cbFormDots(p.form)} ${p.rate}%`,value:`${p.w}승 ${p.l}패`
    }))))}</div>
  </div>`;

  if(mvpTop){
    const mCol=_cbUcol(mvpTop.univ);
    body+=_cbSection('프로리그 MVP','다승 · 승률 종합',
      `<div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap;padding:14px;background:linear-gradient(135deg,${mCol}12,var(--b2w-paper-alt,#fff) 70%);border:1px solid ${mCol}35;border-radius:12px">
        <span style="position:relative;display:inline-flex;flex-shrink:0">${_cbPlayerAvatar(mvpTop.name,72)}</span>
        <div style="flex:1;min-width:180px">
          <div style="font-size:20px;font-weight:900;color:${mCol};line-height:1.25;word-break:break-word">${_cbEsc(mvpTop.name)}</div>
          <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-top:5px;font-size:13px;font-weight:700;color:var(--b2w-ink-soft,#6b7280)">
            ${mvpTop.univ?_cbTeamChip(mvpTop.univ):''}
            <span>${mvpTop.w}승 ${mvpTop.l}패 · 승률 ${mvpTop.rate}%</span>
          </div>
        </div>
        <div style="min-width:180px">${_cbRankList(mvpCands.slice(0,5).map(p=>({
          name:p.name,color:_cbUcol(p.univ),sub:`${p.w}승 ${p.l}패`,value:`${Math.round(p.score)}pt`
        })))}</div>
      </div>`);
  }

  body+=_cbSection('최근 경기 결과','최신 기록 순',
    timeline.length?timeline.map(m=>_cbMatchRow(m,'🤝 팀전')).join(''):_cbEmpty('아직 완료된 경기가 없습니다.'));

  if(mapStats.length){
    const total=mapStats.reduce((s,x)=>s+x.total,0);
    body+=_cbSection('🗺️ 인기 맵','전체 게임 기준',
      `<div>${mapStats.slice(0,8).map(x=>{
        const p=total?Math.round(x.total/total*100):0;
        return `<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
          <span style="font-size:13px;font-weight:700;min-width:130px;color:var(--b2w-ink,#111827)">📍 ${_cbEsc(x.map)}</span>
          <div style="flex:1;height:8px;background:var(--b2w-rule-soft,#e5e7eb);border-radius:4px;overflow:hidden"><div style="height:100%;width:${p}%;background:#7c3aed;border-radius:4px"></div></div>
          <span style="font-size:12px;font-weight:800;min-width:60px;text-align:right;color:var(--b2w-ink-soft,#6b7280)">${x.total}회 (${p}%)</span>
        </div>`;
      }).join('')}</div>`);
  }

  return _cbShell('Pro League Briefing','프로리그 브리핑',
    `전체 ${totalM}경기 중 ${doneM}경기가 기록됐습니다.`,
    '핵심 지표',headline,
    [['진행률',`${pct}%`],['참가 팀',`${teamStats.length}팀`],['완료 경기',`${doneM}경기`],['MVP 후보',mvpTop?_cbEsc(mvpTop.name):'집계 중']],
    body);
}
