/* ══════════════════════════════════════════════════════════════
   대회 CRUD
   ══════════════════════════════════════════════════════════════ */
function proCompNewTourney() {
  const name = prompt('새 대회 이름을 입력하세요', '');
  if (!name || !name.trim()) return;
  if(typeof proTourneys==='undefined' || !Array.isArray(proTourneys)) window.proTourneys = [];
  if(typeof curProComp==='undefined') window.curProComp = '';
  if(typeof proCompSub==='undefined') window.proCompSub = 'league';
  const id = 'ptn_' + Date.now();
  proTourneys.push({id, name:name.trim(), groups:[], bracket:[], createdAt:new Date().toISOString().slice(0,10)});
  curProComp = name.trim();
  proCompSub = 'grpedit'; // 생성 후 조편성 관리로 자동 이동
  save(); render();
}

function proCompRenameTourney() {
  const tn = getCurrentProTourney();
  if (!tn) return;
  const name = prompt('대회 이름 수정', tn.name);
  if (!name || !name.trim()) return;
  if (curProComp === tn.name) curProComp = name.trim();
  tn.name = name.trim();
  save(); render();
}

function proCompDelTourney() {
  const tn = getCurrentProTourney();
  if (!tn) return;
  if (!confirm(`"${tn.name}" 대회를 삭제하시겠습니까?`)) return;
  if(typeof proTourneys==='undefined' || !Array.isArray(proTourneys)) window.proTourneys = [];
  const idx = proTourneys.findIndex(t=>t.id===tn.id);
  if (idx>=0) proTourneys.splice(idx, 1);
  curProComp = proTourneys[0]?.name || '';
  save(); render();
}

function proCompAddGrp(tnId) {
  const tn = _findTourneyById(tnId);
  if (!tn) return;
  const GL = 'ABCDEFGHIJ';
  const name = GL[tn.groups.length] + '조';
  tn.groups.push({name, players:[], matches:[]});
  save(); render();
}

function proCompRenameGrp(tnId, gi, name) {
  const tn = _findTourneyById(tnId);
  if (!tn||!tn.groups[gi]) return;
  tn.groups[gi].name = name;
  save();
}

function proCompDelGrp(tnId, gi) {
  const tn = _findTourneyById(tnId);
  if (!tn) return;
  if (!confirm('해당 조를 삭제하시겠습니까?\n등록된 경기 전적은 모두 취소됩니다.')) return;
  const grp = tn.groups[gi];
  if (grp) (grp.matches||[]).forEach((m,mi) => { if(m.winner) _revertProMatch(`pcg_${tnId}_${gi}_${mi}`); });
  tn.groups.splice(gi, 1);
  save(); render();
}

// 조별 "기록 반영 대상" 설정 (필수)
function proCompSetGrpRecTarget(tnId, gi, v){
  const tn=_findTourneyById(tnId);
  if(!tn||!tn.groups||!tn.groups[gi]) return;
  const val = String(v||'').trim();
  tn.groups[gi]._recTarget = val; // pro | stage | none | ''
  if(val==='stage' && !tn.groups[gi]._recRound) tn.groups[gi]._recRound='16강';
  save(); render();
}
function proCompSetGrpRecRound(tnId, gi, r){
  const tn=_findTourneyById(tnId);
  if(!tn||!tn.groups||!tn.groups[gi]) return;
  const val = _pcNormalizeStageRound(r);
  tn.groups[gi]._recRound = val;
  save(); render();
}

/* ?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?
   ?�???�계 (Feature 3 + 2)
?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?*/
function proCompTourneyStats(tn) {
  if (!tn) return `<div style="padding:30px;text-align:center;color:var(--gray-l)">대회를 선택하세요.</div>`;
  // 전체 경기 수집 (조별리그 + 대진표 + 3위전)
  const allM = [];
  tn.groups.forEach(grp => (grp.matches||[]).forEach(m => {
    // (요청사항) stage 반영 경기(대진표 기록용)는 조별리그 통계에서 제외(중복 방지)
    if (m && (m._stageRecId || (grp._recTarget||'')==='stage')) return;
    allM.push(m);
  }));
  (tn.bracket||[]).forEach(rnd => rnd.forEach(m => { if(m&&m.a&&m.b&&m.a!=='TBD'&&m.b!=='TBD') allM.push(m); }));
  if (tn.thirdPlace&&tn.thirdPlace.a&&tn.thirdPlace.b&&tn.thirdPlace.a!=='TBD'&&tn.thirdPlace.b!=='TBD') allM.push(tn.thirdPlace);
  const doneM = allM.filter(m=>m.winner);
  // 팀전 게임도 allM 유사 형태로 수집 (맵/종족 통계용)
  const allTmGames = (tn.teamMatches||[]).flatMap(tm=>(tm.games||[]).map(g=>({...g, _isTmGame:true, d:tm.d||'', winner:'W'})));
  if (!allM.length && !allTmGames.length) return `<div style="padding:40px;text-align:center;color:var(--gray-l);background:var(--surface);border-radius:12px">아직 등록된 경기가 없습니다.</div>`;

  // 선수별 전적 집계 (조별리그 + 대진표 + 3위전)
  const pSt = {};
  tn.groups.forEach(grp => {
    (grp.players||[]).forEach(p => { if(!pSt[p]) pSt[p]={w:0,l:0}; });
    (grp.matches||[]).forEach(m => {
      if (!m.a||!m.b||!m.winner) return;
      if (!pSt[m.a]) pSt[m.a]={w:0,l:0};
      if (!pSt[m.b]) pSt[m.b]={w:0,l:0};
      if (m.winner==='A'){pSt[m.a].w++;pSt[m.b].l++;}
      else {pSt[m.b].w++;pSt[m.a].l++;}
    });
  });
  (tn.bracket||[]).forEach(rnd => {
    rnd.forEach(m => {
      if (!m||!m.a||!m.b||!m.winner||m.a==='TBD'||m.b==='TBD') return;
      if (!pSt[m.a]) pSt[m.a]={w:0,l:0};
      if (!pSt[m.b]) pSt[m.b]={w:0,l:0};
      if (m.winner==='A'){pSt[m.a].w++;pSt[m.b].l++;}
      else {pSt[m.b].w++;pSt[m.a].l++;}
    });
  });
  if (tn.thirdPlace&&tn.thirdPlace.a&&tn.thirdPlace.b&&tn.thirdPlace.winner&&tn.thirdPlace.a!=='TBD'&&tn.thirdPlace.b!=='TBD') {
    const tp=tn.thirdPlace;
    if (!pSt[tp.a]) pSt[tp.a]={w:0,l:0};
    if (!pSt[tp.b]) pSt[tp.b]={w:0,l:0};
    if (tp.winner==='A'){pSt[tp.a].w++;pSt[tp.b].l++;}
    else {pSt[tp.b].w++;pSt[tp.a].l++;}
  }
  // 팀전 게임 집계
  (tn.teamMatches||[]).forEach(tm => {
    (tm.games||[]).forEach(g => {
      if (!g.wName||!g.lName) return;
      if (!pSt[g.wName]) pSt[g.wName]={w:0,l:0};
      if (!pSt[g.lName]) pSt[g.lName]={w:0,l:0};
      pSt[g.wName].w++; pSt[g.lName].l++;
    });
  });
  // [FIX] 중장전 게임 집계
  (tn.gjMatches||[]).forEach(sess => {
    (sess.games||[]).forEach(g => {
      if (!g.wName||!g.lName) return;
      if (!pSt[g.wName]) pSt[g.wName]={w:0,l:0};
      if (!pSt[g.lName]) pSt[g.lName]={w:0,l:0};
      pSt[g.wName].w++; pSt[g.lName].l++;
    });
  });
  const pArr = Object.entries(pSt).map(([name,s])=>({name,...s,total:s.w+s.l,rate:s.w+s.l?Math.round(s.w/(s.w+s.l)*100):0})).filter(p=>p.total>0).sort((a,b)=>b.w-a.w||b.rate-a.rate);

  // 맵 통계 (조별리그+대진표+3위전 + 팀전 + 중장전)
  const mapSt = {};
  const _addMapSt=(map,winner)=>{
    if(!map) return;
    if(!mapSt[map]) mapSt[map]={total:0,aWin:0,bWin:0};
    mapSt[map].total++;
    if(winner==='A') mapSt[map].aWin++;
    else mapSt[map].bWin++;
  };
  doneM.forEach(m => _addMapSt(m.map, m.winner));
  // [FIX] 팀전 게임 맵 집계
  (tn.teamMatches||[]).forEach(tm=>{
    (tm.games||[]).forEach(g=>{ if(g.map) _addMapSt(g.map,'A'); });
  });
  // [FIX] 중장전 게임 맵 집계
  (tn.gjMatches||[]).forEach(sess=>{
    (sess.games||[]).forEach(g=>{ if(g.map) _addMapSt(g.map,'A'); });
  });
  const mapArr = Object.entries(mapSt).sort((a,b)=>b[1].total-a[1].total);

  // 종족 통계
  const raceSt = {};
  doneM.forEach(m => {
    const pa = players.find(p=>p.name===m.a);
    const pb = players.find(p=>p.name===m.b);
    const ra = pa?.race||'?'; const rb = pb?.race||'?';
    if (!raceSt[ra]) raceSt[ra]={pick:0,w:0,l:0};
    if (!raceSt[rb]) raceSt[rb]={pick:0,w:0,l:0};
    raceSt[ra].pick++; raceSt[rb].pick++;
    if (m.winner==='A'){raceSt[ra].w++;raceSt[rb].l++;}
    else {raceSt[rb].w++;raceSt[ra].l++;}
  });

  let h = `<div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;flex-wrap:wrap">
    <div style="font-weight:900;font-size:var(--fs-md);color:var(--blue)">🏆 ${tn.name} 대회 통계</div>
    ${isLoggedIn?`<button class="btn btn-w btn-xs no-export" onclick="proCompSyncHistory()" title="기존 경기 결과를 스트리머 전적에 반영">🔄 전적 동기화</button>`:''}
  </div>`;

  // 선수 전적 TOP
  h += `<div style="margin-bottom:20px;border-radius:12px;overflow:hidden;border:1px solid var(--border)">
    <div style="padding:10px 16px;background:linear-gradient(135deg,#2563eb,#1d4ed8);color:#fff;font-weight:900;font-size:var(--fs-base)">🥇 선수별 전적</div>
    <table style="width:100%;border-collapse:collapse;font-size:var(--fs-base)">
      <thead><tr style="background:#2563eb11">
        <th style="padding:8px 12px;text-align:center;width:40px;color:var(--text3)">순위</th>
        <th style="padding:8px 12px;text-align:left;color:var(--text3)">선수</th>
        <th style="padding:8px 12px;text-align:center;color:var(--text3)">승</th>
        <th style="padding:8px 12px;text-align:center;color:var(--text3)">패</th>
        <th style="padding:8px 12px;text-align:center;color:var(--text3)">승률</th>
      </tr></thead><tbody>`;
  pArr.slice(0,10).forEach((r,idx)=>{
    const medal = idx===0?'🥇':idx===1?'🥈':idx===2?'🥉':'';
    const p = players.find(x=>x.name===r.name);
    const photo = p&&p.photo?`<img src="${toHttpsUrl(p.photo)}" style="width:28px;height:28px;border-radius:var(--su_profile_radius,50%);object-fit:cover;margin-right:6px;vertical-align:middle" onerror="this.style.display='none'">`:'';
    const rb = p&&p.race?`<span class="rbadge r${p.race}" style="font-size:9px;padding:0 3px">${p.race}</span>`:'';
    const tb = p&&p.tier?`<span style="background:${getTierBtnColor(p.tier)||'#64748b'};color:${getTierBtnTextColor(p.tier)||'#fff'};font-size:9px;font-weight:700;padding:1px 4px;border-radius:3px">${p.tier}</span>`:'';
    h += `<tr style="border-top:1px solid var(--border);${idx===0?'background:#2563eb08':''}">
      <td style="padding:8px 12px;text-align:center;font-size:16px">${medal||idx+1}</td>
      <td style="padding:8px 10px"><div style="display:flex;align-items:center;gap:4px">${photo}<span style="font-weight:${idx<2?'800':'600'};cursor:pointer;color:var(--blue)" onclick="openPlayerModal('${r.name.replace(/'/g,"\\'")}')">${r.name}</span>${rb}${tb}</div></td>
      <td style="padding:8px 12px;text-align:center;font-weight:700;color:#dc2626">${r.w}</td>
      <td style="padding:8px 12px;text-align:center;color:#2563eb">${r.l}</td>
      <td style="padding:8px 12px;text-align:center;font-weight:700">${r.rate}%</td>
    </tr>`;
  });
  h += `</tbody></table></div>`;

  // 맵 통계
  if (mapArr.length) {
    h += `<div style="margin-bottom:20px;border-radius:12px;overflow:hidden;border:1px solid var(--border)">
      <div style="padding:10px 16px;background:linear-gradient(135deg,#7c3aed,#6d28d9);color:#fff;font-weight:900;font-size:var(--fs-base)">🗺️ 맵 통계 (완료 경기 ${doneM.filter(m=>m.map).length}/${doneM.length})</div>
      <table style="width:100%;border-collapse:collapse;font-size:var(--fs-base)">
        <thead><tr style="background:#7c3aed11">
          <th style="padding:8px 12px;text-align:left;color:var(--text3)">맵</th>
          <th style="padding:8px 12px;text-align:center;color:var(--text3)">사용횟수</th>
          <th style="padding:8px 12px;text-align:center;color:var(--text3)">비율</th>
        </tr></thead><tbody>`;
    const totalMapGames = mapArr.reduce((s,[,v])=>s+v.total,0);
    mapArr.forEach(([map,s])=>{
      const pct = totalMapGames ? Math.round(s.total/totalMapGames*100) : 0;
      h += `<tr style="border-top:1px solid var(--border)">
        <td style="padding:8px 12px;font-weight:600">🗺️ ${map}</td>
        <td style="padding:8px 12px;text-align:center">${s.total}</td>
        <td style="padding:8px 12px;text-align:center">
          <div style="display:flex;align-items:center;gap:6px">
            <div style="flex:1;height:6px;background:var(--border);border-radius:3px;min-width:60px"><div style="height:100%;width:${pct}%;background:#7c3aed;border-radius:3px"></div></div>
            <span style="font-size:var(--fs-caption);font-weight:700">${pct}%</span>
          </div>
        </td>
      </tr>`;
    });
    h += `</tbody></table></div>`;
  }

  // 종족 통계
  const races = Object.entries(raceSt).sort((a,b)=>b[1].pick-a[1].pick);
  if (races.length) {
    const totalPicks = races.reduce((s,[,v])=>s+v.pick,0);
    h += `<div style="margin-bottom:20px;border-radius:12px;overflow:hidden;border:1px solid var(--border)">
      <div style="padding:10px 16px;background:linear-gradient(135deg,#dc2626,#b91c1c);color:#fff;font-weight:900;font-size:var(--fs-base)">📊 종족 통계</div>
      <div style="padding:12px 16px;display:flex;gap:12px;flex-wrap:wrap">`;
    const raceColor = {T:'#2563eb', Z:'#7c3aed', P:'#16a34a', R:'#d97706'};
    races.forEach(([race,s])=>{
      const pickPct = totalPicks ? Math.round(s.pick/totalPicks*100) : 0;
      const winRate = s.pick ? Math.round(s.w/s.pick*100) : 0;
      const col = raceColor[race]||'#64748b';
      h += `<div style="flex:1;min-width:120px;padding:12px;background:${col}11;border:1.5px solid ${col}44;border-radius:var(--r);text-align:center">
        <div style="font-weight:900;font-size:16px;color:${col}">${race}</div>
        <div style="font-size:var(--fs-caption);color:var(--gray-l);margin-top:2px">픽률 ${pickPct}%</div>
        <div style="font-size:var(--fs-sm);font-weight:700;color:${col};margin-top:4px">${s.w}승 ${s.l}패</div>
        <div style="font-size:var(--fs-caption);color:var(--gray-l)">승률 ${winRate}%</div>
      </div>`;
    });
    h += `</div></div>`;
  }

  return h;
}

/* ══════════════════════════════════════════════════════════════
   조별 순위 인쇄 기능
   ══════════════════════════════════════════════════════════════ */
function proCompPrintRank() {
  const tn = getCurrentProTourney();
  if (!tn) return;
  const GL = 'ABCDEFGHIJ';
  let body = `<style>body{font-family:'Noto Sans KR',sans-serif;margin:20px}table{width:100%;border-collapse:collapse;margin-bottom:20px}th,td{border:1px solid #ddd;padding:8px 12px;text-align:left}th{background:#f0f4ff;font-weight:700}h1{color:#1e3a8a;font-size:20px;margin-bottom:4px}h2{color:#2563eb;font-size:14px;margin:16px 0 6px}.medal{font-size:16px}.wr{font-weight:700}.win{color:#dc2626}.loss{color:#2563eb}</style>`;
  body += `<h1>🏆 ${tn.name} 대회 조별 순위</h1><p style="color:#888;font-size:var(--fs-sm)">출력일: ${new Date().toLocaleDateString('ko-KR')}</p>`;
  tn.groups.forEach((grp, gi) => {
    const col = ['#2563eb','#dc2626','#16a34a','#d97706','#7c3aed','#0891b2'][gi%6];
    const ranks = _calcProGrpRank(grp);
    body += `<h2 style="color:${col}">GROUP ${GL[gi]} · ${grp.name||GL[gi]+'조'}</h2>`;
    body += `<table><thead><tr><th>순위</th><th>선수</th><th>승</th><th>패</th><th>승률</th></tr></thead><tbody>`;
    ranks.forEach((r,idx)=>{
      const total=r.w+r.l; const wr=total?Math.round(r.w/total*100):0;
      const medal=idx===0?'🥇':idx===1?'🥈':idx===2?'🥉':'';
      body+=`<tr><td class="medal">${medal||idx+1}</td><td>${r.name}</td><td class="win">${r.w}</td><td class="loss">${r.l}</td><td class="wr">${wr}%</td></tr>`;
    });
    body += `</tbody></table>`;
  });
  const w = window.open('','_blank','width=700,height=900');
  if (!w) { alert('팝업이 차단되었습니다. 팝업 허용 후 다시 시도해주세요.'); return; }
  w.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${tn.name} 순위</title>${body.match(/<style>[\s\S]*<\/style>/)[0]}</head><body>${body.replace(/<style>[\s\S]*<\/style>/,'')}<script>window.onload=function(){window.print();}<\/script></body></html>`);
  w.document.close();
}

/* ══════════════════════════════════════════════════════════════
   종합 현황 (프로리그 일반 + 대회 통합)
   ══════════════════════════════════════════════════════════════ */
function rProAll(C, T) {
  T.innerText = '⭐ 프로리그 종합';
  if(typeof players==='undefined' || !Array.isArray(players)){
    C.innerHTML = `<div style="padding:40px 20px;text-align:center;color:var(--gray-l)">데이터 로딩 중...</div>`;
    return;
  }
  const _proM = (typeof proM!=='undefined' && Array.isArray(proM)) ? proM : [];
  const _proTourneys = (typeof proTourneys!=='undefined' && Array.isArray(proTourneys)) ? proTourneys : [];
  const _players = players;
  // 일반 proM에서 경기 수집
  const proItems = [];
  _proM.forEach(m => {
    proItems.push({
      d: m.d||'', type:'일반', label:`${m.teamALabel||'A팀'} vs ${m.teamBLabel||'B팀'}`,
      scoreA: m.scoreA||0, scoreB: m.scoreB||0,
      aLabel: m.teamALabel||'A팀', bLabel: m.teamBLabel||'B팀',
      note: m.n||''
    });
  });
  // 대회 proTourneys에서 경기 수집
  _proTourneys.forEach(tn => {
    (tn.groups||[]).forEach(grp => {
      (grp.matches||[]).forEach(m => {
        if (!m.a||!m.b) return;
        proItems.push({
          d: m.d||'', type:'대회', label:`${m.a} vs ${m.b}`,
          winner: m.winner||'', aLabel: m.a, bLabel: m.b,
          map: m.map||'', note: tn.name
        });
      });
    });
    (tn.bracket||[]).forEach((rnd, ri) => {
      const totalRounds = (tn.bracket||[]).length;
      const rLabel = ri===totalRounds-1?'결승':ri===totalRounds-2?'4강':ri===totalRounds-3?'8강':`${Math.pow(2,totalRounds-ri)}강`;
      (rnd||[]).forEach(m => {
        if (!m.a||!m.b||m.a==='TBD'||m.b==='TBD') return;
        proItems.push({
          d: m.d||'', type:'대회', label:`${m.a} vs ${m.b}`,
          winner: m.winner||'', aLabel: m.a, bLabel: m.b,
          map: m.map||'', note: `${tn.name} ${rLabel}`
        });
      });
    });
  });
  // [FIX] 중장전 경기목록 추가
  _proTourneys.forEach(tn=>{
    (tn.gjMatches||[]).forEach(sess=>{
      const totalG=(sess.games||[]).length;
      const doneG=(sess.games||[]).filter(g=>g.wName&&g.lName).length;
      proItems.push({
        d: sess.d||'', type:'중장전', label:`${sess.a||'?'} vs ${sess.b||'?'}`,
        winner: doneG>0?'done':'', aLabel: sess.a||'?', bLabel: sess.b||'?',
        note: `${tn.name} (${doneG}/${totalG}게임)`
      });
    });
  });
  proItems.sort((a,b)=>(b.d||'').localeCompare(a.d||''));

  // 완료 경기만 통계에 반영
  const compItems = proItems.filter(item => item.winner || item.scoreA > 0 || item.scoreB > 0);

  // 통합 선수 순위
  const pAll = {};
  _proM.forEach(m => {
    (m.sets||[]).forEach(set=>{(set.games||[]).forEach(g=>{
      if(!g.playerA||!g.playerB||!g.winner)return;
      const w=g.winner==='A'?g.playerA:g.playerB; const l=g.winner==='A'?g.playerB:g.playerA;
      if(!pAll[w])pAll[w]={w:0,l:0,src:new Set()};if(!pAll[l])pAll[l]={w:0,l:0,src:new Set()};
      pAll[w].w++;pAll[l].l++;pAll[w].src.add('일반');pAll[l].src.add('일반');
    });});
  });
  _proTourneys.forEach(tn=>{(tn.groups||[]).forEach(grp=>{(grp.matches||[]).forEach(m=>{
    if(!m.a||!m.b||!m.winner)return;
    const w=m.winner==='A'?m.a:m.b; const l=m.winner==='A'?m.b:m.a;
    if(!pAll[w])pAll[w]={w:0,l:0,src:new Set()};if(!pAll[l])pAll[l]={w:0,l:0,src:new Set()};
    pAll[w].w++;pAll[l].l++;pAll[w].src.add('대회');pAll[l].src.add('대회');
  });});});
  // [FIX] 중장전 게임 집계
  _proTourneys.forEach(tn=>{(tn.gjMatches||[]).forEach(sess=>{(sess.games||[]).forEach(g=>{
    if(!g.wName||!g.lName)return;
    if(!pAll[g.wName])pAll[g.wName]={w:0,l:0,src:new Set()};
    if(!pAll[g.lName])pAll[g.lName]={w:0,l:0,src:new Set()};
    pAll[g.wName].w++;pAll[g.lName].l++;
    pAll[g.wName].src.add('중장전');pAll[g.lName].src.add('중장전');
  });});});

  const pArr = Object.entries(pAll).map(([name,s])=>({name,w:s.w,l:s.l,total:s.w+s.l,rate:s.w+s.l?Math.round(s.w/(s.w+s.l)*100):0,src:[...s.src]})).filter(p=>p.total>0).sort((a,b)=>b.w-a.w||b.rate-a.rate);

  const compCnt = _proTourneys.reduce((s,t)=>s+(t.groups||[]).reduce((ss,g)=>ss+(g.matches||[]).length,0),0);

  // 데이터 없음
  if (!_proM.length && !compCnt) {
    C.innerHTML = `<div style="padding:60px 20px;text-align:center;background:var(--surface);border-radius:12px;border:2px dashed var(--border2)">
      <div style="font-size:44px;margin-bottom:14px">📉</div>
      <div style="font-size:16px;font-weight:700;margin-bottom:8px">아직 프로리그 데이터가 없습니다</div>
      <div style="color:var(--gray-l);font-size:var(--fs-base)">일반 프로리그 경기를 입력하거나<br>대회 탭에서 대회를 만들어 경기를 등록해보세요.</div>
    </div>`;
    return;
  }

  let h = `<div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;flex-wrap:wrap">
    <div style="font-weight:900;font-size:var(--fs-md);color:var(--blue)">⭐ 프로리그 통합 현황</div>
    <div style="display:flex;gap:6px;flex-wrap:wrap">
      <span style="font-size:var(--fs-caption);font-weight:700;padding:2px 10px;border-radius:var(--r);background:#dbeafe;color:#2563eb">일반 ${_proM.length}경기</span>
      <span style="font-size:var(--fs-caption);font-weight:700;padding:2px 10px;border-radius:var(--r);background:#f3e8ff;color:#7c3aed">대회 ${compCnt}경기</span>
      <span style="font-size:var(--fs-caption);font-weight:700;padding:2px 10px;border-radius:var(--r);background:#f0fdf4;color:#16a34a">완료 ${compItems.length}경기</span>
    </div>
  </div>`;

  // 통합 선수 순위
  h += `<div style="margin-bottom:20px;border-radius:12px;overflow:hidden;border:1px solid var(--border)">
    <div style="padding:10px 16px;background:linear-gradient(135deg,#0f172a,#1e3a8a);color:#fff;font-weight:900;font-size:var(--fs-base)">🏆 통합 개인 순위 (승리 기준)</div>`;
  if (!pArr.length) {
    h += `<div style="padding:24px;text-align:center;color:var(--gray-l);font-size:var(--fs-base)">아직 완료된 경기가 없습니다.<br><span style="font-size:var(--fs-caption)">경기 결과를 입력하면 순위가 표시됩니다.</span></div>`;
  } else {
    h += `<table style="width:100%;border-collapse:collapse;font-size:var(--fs-base)">
      <thead><tr style="background:#1e3a8a0f">
        <th style="padding:8px 12px;text-align:center;width:40px;color:var(--text3)">순위</th>
        <th style="padding:8px 12px;text-align:left;color:var(--text3)">선수</th>
        <th style="padding:8px 12px;text-align:center;color:var(--text3)">승</th>
        <th style="padding:8px 12px;text-align:center;color:var(--text3)">패</th>
        <th style="padding:8px 12px;text-align:center;color:var(--text3)">승률</th>
        <th style="padding:8px 12px;text-align:center;color:var(--text3)">출처</th>
      </tr></thead><tbody>`;
    pArr.slice(0,15).forEach((r,idx)=>{
      const medal=idx===0?'🥇':idx===1?'🥈':idx===2?'🥉':'';
      const p=_players.find(x=>x.name===r.name);
      const photo=p&&p.photo?`<img src="${toHttpsUrl(p.photo)}" style="width:26px;height:26px;border-radius:var(--su_profile_radius,50%);object-fit:cover;margin-right:5px;vertical-align:middle" onerror="this.style.display='none'">`:'';
      const rb=p&&p.race?`<span class="rbadge r${p.race}" style="font-size:9px;padding:0 3px">${p.race}</span>`:'';
      const srcBadges=r.src.map(s=>`<span style="font-size:9px;padding:1px 5px;border-radius:8px;font-weight:700;${s==='일반'?'background:#dbeafe;color:#2563eb':'background:#f3e8ff;color:#7c3aed'}">${s}</span>`).join(' ');
      h+=`<tr style="border-top:1px solid var(--border)">
        <td style="padding:8px 12px;text-align:center;font-size:16px">${medal||idx+1}</td>
        <td style="padding:8px 10px"><div style="display:flex;align-items:center;gap:4px">${photo}<span style="font-weight:${idx<2?'800':'600'};cursor:pointer;color:var(--blue)" onclick="openPlayerModal('${escJS(r.name)}')">${r.name}</span>${rb}</div></td>
        <td style="padding:8px 12px;text-align:center;font-weight:700;color:#dc2626">${r.w}</td>
        <td style="padding:8px 12px;text-align:center;color:#2563eb">${r.l}</td>
        <td style="padding:8px 12px;text-align:center;font-weight:700">${r.rate}%</td>
        <td style="padding:8px 12px;text-align:center">${srcBadges}</td>
      </tr>`;
    });
    h+=`</tbody></table>`;
  }
  h+=`</div>`;

  // 최근 통합 경기 타임라인
  h += `<div style="border-radius:12px;overflow:hidden;border:1px solid var(--border)">
    <div style="padding:10px 16px;background:linear-gradient(135deg,#475569,#334155);color:#fff;font-weight:900;font-size:var(--fs-base)">📅 전체 경기 목록 (총 ${proItems.length}경기)</div>`;
  if (!proItems.length) {
    h += `<div style="padding:24px;text-align:center;color:var(--gray-l);font-size:var(--fs-base)">등록된 경기가 없습니다.</div>`;
  } else {
    h += `<div style="padding:6px 0">`;
    proItems.slice(0,50).forEach(item=>{
      const typeBg=item.type==='일반'?'#dbeafe':item.type==='중장전'?'#dcfce7':'#f3e8ff';
      const typeCol=item.type==='일반'?'#2563eb':item.type==='중장전'?'#166534':'#7c3aed';
      let result='';
      if(item.type==='일반'){
        const sa=item.scoreA||0;const sb=item.scoreB||0;
        if(sa>0||sb>0) result=`<span style="font-weight:800;color:${sa>sb?'#dc2626':sb>sa?'#2563eb':'var(--text3)'}">${sa}</span><span style="color:var(--gray-l);margin:0 2px">:</span><span style="font-weight:800;color:${sb>sa?'#dc2626':sa>sb?'#2563eb':'var(--text3)'}">${sb}</span>`;
        else result='<span style="color:var(--gray-l);font-size:var(--fs-caption)">기록없음</span>';
      } else if(item.type==='중장전'){
        // [FIX] 중장전은 개인 게임 단위이므로 note에 게임 수 표시
        result=item.winner==='done'?`<span style="font-size:var(--fs-caption);font-weight:700;color:#166534;background:#dcfce7;padding:1px 8px;border-radius:var(--r)">기록완료</span>`:`<span style="font-size:var(--fs-caption);color:var(--gray-l);background:var(--surface);padding:1px 8px;border-radius:var(--r)">미정</span>`;
      } else {
        result=item.winner?`<span style="font-size:var(--fs-caption);font-weight:700;color:#dc2626;background:#fee2e2;padding:1px 8px;border-radius:var(--r)">${item.winner==='A'?item.aLabel:item.bLabel} 승</span>`:`<span style="font-size:var(--fs-caption);color:var(--gray-l);background:var(--surface);padding:1px 8px;border-radius:var(--r)">미정</span>`;
      }
      h+=`<div style="display:flex;align-items:center;gap:8px;padding:7px 14px;border-bottom:1px solid var(--border);flex-wrap:wrap">
        <span style="font-size:var(--fs-sm);font-weight:600;color:var(--text3);min-width:76px;white-space:nowrap">${item.d||'날짜미정'}</span>
        <span style="font-size:10px;font-weight:700;padding:1px 7px;border-radius:var(--r);background:${typeBg};color:${typeCol}">${item.type}</span>
        <span style="font-size:var(--fs-sm);font-weight:600;flex:1;min-width:0">${item.label}</span>
        <span>${result}</span>
        ${item.note?`<span style="font-size:10px;color:var(--gray-l);white-space:nowrap">${item.note}</span>`:''}
        ${item.map?`<span style="font-size:10px;color:var(--gray-l)">🗺️ ${item.map}</span>`:''}
      </div>`;
    });
    h+=`</div>`;
  }
  h+=`</div>`;
  C.innerHTML = h;
}

/* ?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?
   공유카드 ?�퍼 (?�로리그 ?�??
?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?*/
function _openProCompLeagueShareCard(tnId, gi, mi) {
  const tn = _findTourneyById(tnId);
  if (!tn) return;
  const grp = (tn.groups||[])[gi];
  const m = grp?.matches?.[mi];
  if (!m || !m.winner) return;
  const aWin = m.winner==='A';
  const gl = 'ABCDEFGHIJ'[gi]||gi;
  // 조별리그: ?�수 ?�속 ?�???�상 ?�용 ??경기마다 ?�른 컬러
  const shareObj = {
    a: m.a||'', b: m.b||'',
    sa: aWin?1:0, sb: aWin?0:1,
    d: m.d||'', n: `${tn.name}`,
    _subLabel: `GROUP ${gl}`,
    sets: [{
      scoreA: aWin?1:0, scoreB: aWin?0:1,
      winner: m.winner,
      games: [{playerA:m.a||'', playerB:m.b||'', winner:m.winner, map:m.map||''}]
    }],
    _noUnivIcon: false, _usePlayerPhoto: true, _matchType: 'pro'  // 프로리그 일반 카드 스타일 사용
  };
  if(typeof window._openShareMatchObjCard==='function') window._openShareMatchObjCard(shareObj);
}

function _openProCompTeamShareCard(tnId, tmi) {
  const tn = _findTourneyById(tnId);
  if (!tn) return;
  const tm = (tn.teamMatches||[])[tmi];
  if (!tm || !(tm.games||[]).length) return;
  const games = (tm.games||[]).map(g => ({
    playerA: g._sideW==='A' ? g.wName : g.lName,
    playerB: g._sideW==='A' ? g.lName : g.wName,
    winner: g._sideW||'A',
    map: g.map||''
  }));
  // ?�?? ?�이�?vs ?�크?�드 (?�??��??�낌)
  const shareObj = {
    a: tm.teamAName||'A팀', b: tm.teamBName||'B팀',
    sa: tm.sa||0, sb: tm.sb||0,
    d: tm.d||'', n: tn.name,
    sets: [{scoreA:tm.sa||0, scoreB:tm.sb||0, winner:tm.sa>tm.sb?'A':tm.sb>tm.sa?'B':'', games}],
    _noUnivIcon: true, _matchType: 'procomp-team'
  };
  if(typeof window._openShareMatchObjCard==='function') window._openShareMatchObjCard(shareObj);
}

function _openProCompBktShareCard(tnId, ri, mi) {
  const tn = _findTourneyById(tnId);
  if (!tn) return;
  const rounds = tn.bracket||[];
  const m = ri === '3rd' ? tn.thirdPlace : (rounds[ri]||[])[mi];
  if (!m || !m.winner) return;
  const rndLabel = ri === '3rd' ? '3·4위전' : ri===rounds.length-1?'결승':ri===rounds.length-2?'4강':ri===rounds.length-3?'8강':`${Math.pow(2,rounds.length-ri)}강`;
  const games = Array.isArray(m._games) && m._games.length
    ? m._games.map(g => ({ playerA: m.a||'', playerB: m.b||'', winner: g.winner, map: g.map||'' }))
    : [{ playerA: m.a||'', playerB: m.b||'', winner: m.winner, map: m.map||'' }];
  const scoreA = games.filter(g => g.winner==='A').length;
  const scoreB = games.filter(g => g.winner==='B').length;
  const shareObj = {
    a: m.a||'', b: m.b||'',
    sa: scoreA, sb: scoreB,
    d: m.d||'', n: `${tn.name}`,
    _subLabel: rndLabel,
    sets: [{ scoreA, scoreB, winner: m.winner, games }],
    _noUnivIcon: false, _usePlayerPhoto: true, _matchType: 'procomp-bkt'
  };
  if(typeof window._openShareMatchObjCard==='function') window._openShareMatchObjCard(shareObj);
}

/* ?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?
   �??�체 공유카드
?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?*/
function _openProCompGrpAllShareCard(tnId, gi) {
  const tn = _findTourneyById(tnId);
  if (!tn) return;
  const grp = (tn.groups||[])[gi];
  if (!grp) return;
  if(typeof openShareCardModal==='function') openShareCardModal();
  setTimeout(() => _renderProCompGrpShareCard(tnId, gi), 80);
}

function _renderProCompGrpShareCard(tnId, gi) {
  const card = document.getElementById('share-card');
  if (!card) return;
  const tn = _findTourneyById(tnId);
  if (!tn) return;
  const grp = (tn.groups||[])[gi];
  if (!grp) return;
  const GL = 'ABCDEFGHIJ';
  const col = ['#2563eb','#dc2626','#16a34a','#d97706','#7c3aed','#0891b2'][gi%6];
  const ranks = _calcProGrpRank(grp);
  const allM = grp.matches||[];
  const doneM = allM.filter(m=>m.winner);
  const pendM = allM.filter(m=>!m.winner);
  const pct = allM.length ? Math.round(doneM.length/allM.length*100) : 0;

  // 선수 아바타들
  const avatarRow = ranks.map(r => {
    const p = players.find(x=>x.name===r.name);
    const photo = p&&p.photo
      ? `<img src="${toHttpsUrl(p.photo)}" style="width:36px;height:36px;border-radius:var(--su_profile_radius,50%);object-fit:cover;border:2px solid ${col}66" onerror="this.style.display='none'">`
      : `<span style="width:36px;height:36px;border-radius:var(--su_profile_radius,50%);background:${col}22;border:2px solid ${col}44;display:inline-flex;align-items:center;justify-content:center;font-size:var(--fs-base);font-weight:700;color:${col}">${(r.name||'?').slice(0,1)}</span>`;
    return `<div style="display:flex;flex-direction:column;align-items:center;gap:3px;min-width:40px">
      ${photo}
      <span style="font-size:9px;font-weight:600;color:rgba(255,255,255,.75);white-space:nowrap;max-width:46px;overflow:hidden;text-overflow:ellipsis">${r.name}</span>
    </div>`;
  }).join('');

  // 순위표 행
  const rankRows = ranks.map((r, idx) => {
    const total = r.w + r.l;
    const wr = total ? Math.round(r.w/total*100) : 0;
    const medal = idx===0?'?��':idx===1?'?��':idx===2?'?��':'';
    const p = players.find(x=>x.name===r.name);
    const photoCell = p&&p.photo
      ? `<img src="${toHttpsUrl(p.photo)}" style="width:26px;height:26px;border-radius:var(--su_profile_radius,50%);object-fit:cover;border:1.5px solid ${idx===0?col+'aa':'#ddd'}" onerror="this.outerHTML=''">`
      : `<span style="width:26px;height:26px;border-radius:var(--su_profile_radius,50%);background:${col}18;display:inline-flex;align-items:center;justify-content:center;font-size:var(--fs-caption);font-weight:700;color:${col};flex-shrink:0">${(r.name||'?').slice(0,1)}</span>`;
    const raceBadge = p&&p.race?`<span style="font-size:8px;padding:1px 4px;border-radius:3px;font-weight:700;background:${p.race==='T'?'#dbeafe':p.race==='Z'?'#ede9fe':'#fef3c7'};color:${p.race==='T'?'#1e40af':p.race==='Z'?'#5b21b6':'#92400e'}">${p.race}</span>`:'';
    return `<tr style="border-top:1px solid ${col}18;${idx===0?'background:'+col+'0a':''}">
      <td style="padding:6px 8px;text-align:center;font-size:14px;width:28px">${medal||String(idx+1)}</td>
      <td style="padding:6px 6px">
        <div style="display:flex;align-items:center;gap:5px">
          ${photoCell}
          <span style="font-weight:${idx<2?'800':'600'};font-size:var(--fs-sm);color:#1e293b">${r.name}</span>
          ${raceBadge}
        </div>
      </td>
      <td style="padding:6px 8px;text-align:center;font-weight:700;color:#dc2626;font-size:var(--fs-sm)">${r.w}</td>
      <td style="padding:6px 8px;text-align:center;color:#2563eb;font-size:var(--fs-sm)">${r.l}</td>
      <td style="padding:6px 8px;text-align:center;font-weight:700;font-size:var(--fs-sm);color:${wr>=70?col:'#64748b'}">${wr}%</td>
    </tr>`;
  }).join('');

  // 경기 결과 목록
  const matchRows = doneM.map(m => {
    const winner = m.winner==='A'?m.a:m.b;
    const loser  = m.winner==='A'?m.b:m.a;
    const wp = players.find(x=>x.name===winner);
    const lp = players.find(x=>x.name===loser);
    const wPhoto = wp&&wp.photo
      ? `<img src="${toHttpsUrl(wp.photo)}" style="width:20px;height:20px;border-radius:var(--su_profile_radius,50%);object-fit:cover" onerror="this.style.display='none'">`
      : `<span style="width:20px;height:20px;border-radius:var(--su_profile_radius,50%);background:${col}22;display:inline-flex;align-items:center;justify-content:center;font-size:9px;font-weight:700;color:${col}">${(winner||'?').slice(0,1)}</span>`;
    const lPhoto = lp&&lp.photo
      ? `<img src="${toHttpsUrl(lp.photo)}" style="width:20px;height:20px;border-radius:var(--su_profile_radius,50%);object-fit:cover;opacity:.55" onerror="this.style.display='none'">`
      : `<span style="width:20px;height:20px;border-radius:var(--su_profile_radius,50%);background:#94a3b822;display:inline-flex;align-items:center;justify-content:center;font-size:9px;font-weight:700;color:#94a3b8">${(loser||'?').slice(0,1)}</span>`;
    return `<div style="display:flex;align-items:center;gap:5px;padding:4px 0;border-bottom:1px solid ${col}12">
      <div style="display:flex;align-items:center;gap:3px;flex:1;min-width:0">
        ${wPhoto}
        <span style="font-weight:700;font-size:var(--fs-caption);color:#1e293b;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${winner}</span>
      </div>
      <span style="font-size:10px;font-weight:900;color:${col};flex-shrink:0;padding:1px 7px;background:${col}15;border-radius:4px">WIN</span>
      <div style="display:flex;align-items:center;gap:3px;flex:1;min-width:0;justify-content:flex-end">
        <span style="font-size:var(--fs-caption);color:#94a3b8;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${loser}</span>
        ${lPhoto}
      </div>
      ${m.map?`<span style="font-size:var(--fs-caption);font-weight:600;color:var(--text3);flex-shrink:0;margin-left:3px">?��${m.map}</span>`:''}
    </div>`;
  }).join('');

  card.innerHTML = `<div style="background:linear-gradient(180deg,#f8fbff,#eef4ff);color:#1e293b;min-width:320px;border-radius:18px;overflow:hidden;font-family:'Noto Sans KR',sans-serif;box-shadow:0 18px 40px rgba(15,23,42,.12)">

    <!-- ?�더 -->
    <div style="background:linear-gradient(135deg,#0f172a 0%,${col} 58%,#7c3aed 100%);padding:18px 20px 16px;position:relative;overflow:hidden">
      <div style="position:absolute;top:-20px;right:-20px;width:100px;height:100px;border-radius:50%;background:rgba(255,255,255,.1)"></div>
      <div style="position:absolute;bottom:-30px;left:10px;width:80px;height:80px;border-radius:50%;background:rgba(255,255,255,.07)"></div>
      <div style="position:absolute;right:14px;bottom:12px;font-size:54px;line-height:1;opacity:.08">🏅</div>
      <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:12px">
        <div>
          <div style="font-size:10px;color:rgba(255,255,255,.72);font-weight:800;letter-spacing:.7px;margin-bottom:5px">🏅 프로리그 그룹 스테이지</div>
          <div style="font-size:10px;color:rgba(255,255,255,.7);font-weight:600;letter-spacing:.5px;margin-bottom:2px">${tn.name}</div>
          <div style="font-size:20px;font-weight:900;color:#fff;letter-spacing:1px">GROUP ${GL[gi]}</div>
          ${grp.name?`<div style="font-size:var(--fs-caption);color:rgba(255,255,255,.75);margin-top:1px">${grp.name}</div>`:''}
        </div>
        <div style="text-align:right">
          <div style="font-size:22px;font-weight:900;color:#fff">${pct}%</div>
          <div style="font-size:9px;color:rgba(255,255,255,.65)">${doneM.length}/${allM.length} ?�료</div>
        </div>
      </div>
      <div style="height:4px;background:rgba(255,255,255,.2);border-radius:2px;margin-bottom:14px">
        <div style="height:100%;width:${pct}%;background:rgba(255,255,255,.85);border-radius:2px"></div>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">${avatarRow}</div>
    </div>

    <!-- ?�위??-->
    <div style="padding:14px 16px 10px">
      <div style="font-size:10px;font-weight:800;color:${col};letter-spacing:.5px;margin-bottom:8px">?�� ?�재 ?�위</div>
      <table style="width:100%;border-collapse:collapse;background:rgba(255,255,255,.76);border:1px solid ${col}18;border-radius:14px;overflow:hidden">
        <thead><tr style="background:${col}10">
          <th style="padding:5px 8px;text-align:center;width:28px;font-size:10px;color:#64748b;font-weight:700">?�위</th>
          <th style="padding:5px 6px;text-align:left;font-size:10px;color:#64748b;font-weight:700">?�수</th>
          <th style="padding:5px 8px;text-align:center;font-size:10px;color:#16a34a;font-weight:700">승</th>
          <th style="padding:5px 8px;text-align:center;font-size:10px;color:#dc2626;font-weight:700">패</th>
          <th style="padding:5px 8px;text-align:center;font-size:10px;color:#64748b;font-weight:700">?�률</th>
        </tr></thead>
        <tbody>${rankRows}</tbody>
      </table>
    </div>

    ${doneM.length?`<div style="padding:0 16px 14px">
      <div style="font-size:10px;font-weight:800;color:${col};letter-spacing:.5px;margin-bottom:8px">?�� 경기 결과</div>
      <div style="background:rgba(255,255,255,.76);border:1px solid ${col}18;border-radius:14px;padding:8px 10px">${matchRows}</div>
    </div>`:''}

    ${pendM.length?`<div style="padding:4px 16px 12px;font-size:10px;color:#94a3b8;text-align:center">??${pendM.length}경기 ?�음</div>`:''}

    <div style="background:${col}0d;padding:8px 16px;display:flex;align-items:center;justify-content:flex-end">
      <span style="font-size:var(--fs-caption);font-weight:600;color:var(--text3)">?�� ?��??�???�이???�터</span>
    </div>
  </div>`;
}

/* ══════════════════════════════════════════════════════════════
   ⭐ 프로리그 대회 중장전
   ══════════════════════════════════════════════════════════════ */
function proCompGJSection(tn) {
  if (!tn) return `<div style="padding:30px;text-align:center;color:var(--gray-l)">대회를 선택하세요.</div>`;
  if (!tn.gjMatches) tn.gjMatches = [];
  let h = '';
  if (isLoggedIn) {
    const pA = _pcgjA, pB = _pcgjB;
    const pAObj = players.find(p=>p.name===pA)||{}, pBObj = players.find(p=>p.name===pB)||{};
    const aCol = gc(pAObj.univ)||'#2563eb', bCol = gc(pBObj.univ)||'#dc2626';
    h += `<div style="background:var(--surface);border:1px solid var(--border);border-radius:var(--r);padding:14px;margin-bottom:14px">
      <div style="font-weight:700;font-size:var(--fs-base);margin-bottom:10px">📢 중장전 추가</div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:flex-start">
        <div style="flex:1;min-width:140px">
          <div style="font-size:var(--fs-caption);font-weight:700;color:${aCol};margin-bottom:4px">🔵 A 스트리머</div>
          ${pA?`<div style="display:flex;align-items:center;gap:6px;padding:8px;background:${aCol}18;border:2px solid ${aCol};border-radius:8px">
            ${getPlayerPhotoHTML(pA,'28px')}<span style="font-weight:800;color:${aCol}">${pA}</span>
            <span style="font-size:10px;color:var(--gray-l)">${pAObj.univ||''}</span>
            <button onclick="_pcgjA='';_pcgjGames=[];render()" style="margin-left:auto;background:none;border:none;color:#94a3b8;cursor:pointer;font-size:var(--fs-sm)">✕</button>
          </div>` : _matchPlayerPoolHTML('A', 'pcgj')}
        </div>
        <div style="font-size:16px;font-weight:800;color:var(--gray-l);padding-top:20px">VS</div>
        <div style="flex:1;min-width:140px">
          <div style="font-size:var(--fs-caption);font-weight:700;color:${bCol};margin-bottom:4px">🔴 B 스트리머</div>
          ${pB?`<div style="display:flex;align-items:center;gap:6px;padding:8px;background:${bCol}18;border:2px solid ${bCol};border-radius:8px">
            ${getPlayerPhotoHTML(pB,'28px')}<span style="font-weight:800;color:${bCol}">${pB}</span>
            <span style="font-size:10px;color:var(--gray-l)">${pBObj.univ||''}</span>
            <button onclick="_pcgjB='';_pcgjGames=[];render()" style="margin-left:auto;background:none;border:none;color:#94a3b8;cursor:pointer;font-size:var(--fs-sm)">✕</button>
          </div>` : _matchPlayerPoolHTML('B', 'pcgj')}
        </div>
        <div>
          <div style="font-size:var(--fs-caption);font-weight:700;color:var(--gray-l);margin-bottom:3px">📅 날짜</div>
          <input type="date" id="pcgj-date" value="${new Date().toISOString().slice(0,10)}" style="width:140px">
        </div>
      </div>
      <div id="pcgj-games" style="margin-top:10px"></div>
      <div style="display:flex;gap:6px;margin-top:8px;flex-wrap:wrap;align-items:center">
        <button class="btn btn-b btn-sm" onclick="pcgjAddGame()">+ 게임 추가</button>
        <button class="btn btn-p btn-sm" onclick="openPcGJPasteModal('${tn.id}')">📋 자동인식</button>
        <button class="btn btn-g btn-sm" onclick="proCompGJSave('${tn.id}')">💾 저장</button>
      </div>
    </div>`;
  }
  if (!tn.gjMatches.length) {
    h += `<div class="empty-state"><div class="empty-state-icon">📢</div><div class="empty-state-title">중장전 기록이 없습니다</div><div class="empty-state-desc">위에서 경기를 추가해보세요</div></div>`;
    return h;
  }
  tn.gjMatches.slice().reverse().forEach((sess, ri) => {
    const si = tn.gjMatches.length - 1 - ri;
    const p1w = (sess.games||[]).filter(g=>g.winner===sess.a).length;
    const p2w = (sess.games||[]).filter(g=>g.winner===sess.b).length;
    const winner = p1w>p2w?sess.a:p2w>p1w?sess.b:'';
    const _ca = gc(sess.a||'') || '#2563eb';
    const _cb = gc(sess.b||'') || '#dc2626';
    const _sid = String(sess._id||'').replace(/'/g,"\\'");
    const _detailBtn = `<button class="btn btn-w btn-xs" onclick="openMatchDetailByMatchId('${_sid}','프로리그대회끝장전')">📂 경기 상세</button>`;
    const _delBtn = isLoggedIn?`<button class="btn btn-r btn-xs" onclick="proCompGJDel('${tn.id}',${si})">🗑️ 삭제</button>`:'';
    h += _proCompH2HCardHTML({
      p1:sess.a, p2:sess.b, p1Col:_ca, p2Col:_cb,
      p1Score:p1w, p2Score:p2w, winner:winner,
      date:sess.d||'', games:(sess.games||[]),
      badges:[
        `<span style="font-size:var(--fs-caption);color:var(--gray-l)">${sess.d?String(sess.d).slice(2).replace(/-/g,'/'):'미정'}</span>`,
        `<span style="font-size:10px;font-weight:700;padding:2px 8px;border-radius:99px;background:#dcfce7;color:#166534">중장전</span>`,
        `<span style="font-size:var(--fs-caption);color:var(--gray-l)">${(sess.games||[]).length}게임</span>`,
        winner?`<span style="font-size:10px;font-weight:800;padding:2px 8px;border-radius:99px;background:${gc(winner)||'#16a34a'};color:#fff">${winner} 승</span>`:''
      ],
      detailOnClick:`openMatchDetailByMatchId('${_sid}','프로리그대회끝장전')`,
      actionHtml:`${_detailBtn}${_delBtn}`
    });
  });
  return h;
}

let _pcgjGames = [], _pcgjA = '', _pcgjB = '';
function pcgjAddGame() {
  _pcgjGames.push({winner:'', map:''});
  _pcgjRender();
}
function openPcGJPasteModal(tnId) {
  const tn = _findTourneyById(tnId); if (!tn) return;
  window._grpPasteState = {tnId, mode: 'pcgj'};
  window._grpPasteMode = true;
  openPasteModal();
  window._forcedPasteMode = 'gj';
  const sel = document.getElementById('paste-mode');
  const lbl = document.getElementById('paste-mode-label');
  if (sel) { sel.value = 'ind'; sel.style.display = 'none'; onPasteModeChange('ind'); }
  if (lbl) lbl.style.display = 'none';
  const hint = document.getElementById('paste-mode-hint');
  if (hint) {
    const _a = _pcgjA, _b = _pcgjB;
    hint.innerHTML = _a && _b
      ? `<div style="background:#eff6ff;border:1px solid #93c5fd;border-radius:8px;padding:8px 12px;margin-bottom:4px"><span style="color:#1d4ed8;font-weight:700">📢 중장전 결과 입력</span> — <b>${_a}</b> vs <b>${_b}</b><br><span style="font-size:var(--fs-caption);color:#6b7280">형식: <code>${_a} ${_b} [맵]</code> / <code>${_b} ${_a} [맵]</code> — 여러 줄 입력 가능</span></div>`
      : `<div style="background:#f0fdf4;border:1px solid #86efac;border-radius:8px;padding:8px 12px;margin-bottom:4px"><span style="color:#16a34a;font-weight:700">🤖 자동인식</span> — 선수 선택 없이 입력하면, 붙여넣기 내용에서 <b>두 선수(A/B)</b>를 자동으로 확정합니다.<br><span style="font-size:var(--fs-caption);color:#6b7280">형식: <code>승자이름 패자이름 [맵]</code> — 여러 줄 입력 가능 (두 선수만 등장해야 저장 가능)</span></div>`;
  }
  const dateInput = document.getElementById('paste-date');
  if (dateInput) dateInput.value = document.getElementById('pcgj-date')?.value || new Date().toISOString().slice(0,10);
  const compWrap = document.getElementById('paste-comp-wrap');
  if (compWrap) compWrap.style.display = 'none';
  const _pt = document.querySelector('#pasteModal .mtitle');
  if (_pt) _pt.textContent = '📋 중장전 결과 붙여넣기';
  if (typeof om === 'function') om('pasteModal');
}

function _pcGJPasteApplyLogic(savable, tn) {
  // (요청) 자동인식 붙여넣기:
  // 1) A/B를 이미 선택했으면 해당 1매치로 저장
  // 2) A/B 미선택이면, 입력된 결과를 "선수 페어"별로 자동 분리하여 여러 매치로 저장
  const dateEl = document.getElementById('paste-date');
  const d = dateEl?.value || new Date().toISOString().slice(0,10);
  if (!tn.gjMatches) tn.gjMatches = [];

  const selA = _pcgjA, selB = _pcgjB;
  if (selA && selB) {
    const a = selA, b = selB;
    const games = [];
    for (const r of savable) {
      if (!r.wPlayer || !r.lPlayer) continue;
      const wn = r.wPlayer.name;
      let winner = '';
      if (wn === a) winner = a;
      else if (wn === b) winner = b;
      else { alert(`"${wn}"은(는) 해당 경기 선수가 아닙니다.\n${a} vs ${b}`); return false; }
      games.push({ winner, map: r.map || '' });
    }
    if (!games.length) { alert('저장 가능한 경기가 없습니다.'); return false; }
    const matchId = genId();
    tn.gjMatches.unshift({_id: matchId, d, a, b, games});
    games.forEach(g => {
      if (!g.winner) return;
      const win = g.winner, loss = g.winner===a ? b : a;
      applyGameResult(win, loss, d, g.map||'', matchId, '', '', '프로리그대회끝장전');
    });
    _pcgjGames = []; _pcgjA = ''; _pcgjB = '';
    save();
    return true;
  }

  // A/B 미선택: 페어별 자동 저장
  const pairMap = {}; // key -> {a,b,games:[]}
  let totalGames = 0;
  for (const r of savable) {
    if (!r.wPlayer || !r.lPlayer) continue;
    const a = r.wPlayer.name;
    const b = r.lPlayer.name;
    if (!a || !b || a === b) continue;
    const key = [a, b].sort().join('||');
    if (!pairMap[key]) {
      const [x, y] = key.split('||');
      pairMap[key] = {a: x, b: y, games: []};
    }
    const sess = pairMap[key];
    // winner는 원문 winName 기준
    const winner = r.wPlayer.name;
    sess.games.push({winner, map: r.map || ''});
    totalGames++;
  }

  const pairs = Object.values(pairMap).filter(s => s.games && s.games.length);
  if (!pairs.length) { alert('저장 가능한 경기가 없습니다.'); return false; }

  pairs.forEach(sess => {
    const matchId = genId();
    const a = sess.a, b = sess.b;
    // winner 이름이 a/b 이외면 스킵 (이론상 발생X 방어)
    const games = (sess.games||[]).filter(g => g.winner === a || g.winner === b)
      .map(g => ({winner: g.winner, map: g.map || ''}));
    if (!games.length) return;
    tn.gjMatches.unshift({_id: matchId, d, a, b, games});
    games.forEach(g => {
      const win = g.winner, loss = (g.winner === a) ? b : a;
      applyGameResult(win, loss, d, g.map||'', matchId, '', '', '프로리그대회끝장전');
    });
  });

  _pcgjGames = []; _pcgjA = ''; _pcgjB = '';
  save();
  alert(`중장전 저장 완료: ${pairs.length}매치 / ${totalGames}게임`);
  return true;
}
function _pcgjRender() {
  const cont = document.getElementById('pcgj-games');
  if (!cont) return;
  const a = _pcgjA||'A선수', b = _pcgjB||'B선수';
  cont.innerHTML = _pcgjGames.map((g,i)=>`
    <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;padding:6px 0;border-top:1px solid var(--border)">
      <span style="font-size:var(--fs-caption);color:var(--gray-l);min-width:40px">${i+1}게임</span>
      <select onchange="_pcgjGames[${i}].winner=this.value" style="flex:1;min-width:120px">
        <option value="">승자 선택</option>
        <option value="${a}"${g.winner===a?' selected':''}>🔵 ${a} 승</option>
        <option value="${b}"${g.winner===b?' selected':''}>🔴 ${b} 승</option>
      </select>
      <input type="text" value="${g.map||''}" placeholder="맵명" style="flex:1;min-width:80px;padding:4px 8px;border:1px solid var(--border2);border-radius:5px;font-size:var(--fs-sm)" oninput="_pcgjGames[${i}].map=this.value">
      <button class="btn btn-r btn-xs" onclick="_pcgjGames.splice(${i},1);_pcgjRender()">×</button>
    </div>`).join('');
}
function proCompGJSave(tnId) {
  const tn = _findTourneyById(tnId); if (!tn) return;
  const a = _pcgjA, b = _pcgjB;
  const d = document.getElementById('pcgj-date')?.value||'';
  if (!a||!b) return alert('선수 A와 B를 선택하세요.');
  if (!_pcgjGames.length) return alert('게임을 1개 이상 추가하세요.');
  const matchId = genId();
  if (!tn.gjMatches) tn.gjMatches = [];
  const sess = {_id:matchId, d, a, b, games:_pcgjGames.map(g=>({...g}))};
  tn.gjMatches.unshift(sess);
  // 선수 전적 반영
  sess.games.forEach(g => {
    if (!g.winner) return;
    const win = g.winner, loss = g.winner===a?b:a;
    applyGameResult(win, loss, d, g.map||'', matchId, '', '', '프로리그대회끝장전');
  });
  _pcgjGames=[]; _pcgjA=''; _pcgjB='';
  save(); render();
}

function proCompGJDel(tnId, si) {
  if (!confirm('중장전 기록을 삭제하시겠습니까?\n⚠️ 선수 전적도 롤백됩니다.')) return;
  const tn = _findTourneyById(tnId); if (!tn||!tn.gjMatches) return;
  const sess = tn.gjMatches[si]; if (!sess) return;
  // 전적 롤백
  if (sess._id) {
    (players||[]).forEach(p => {
      if (!p.history) return;
      p.history = p.history.filter(h => h.matchId !== sess._id);
    });
  }
  tn.gjMatches.splice(si, 1);
  save(); render();
}
