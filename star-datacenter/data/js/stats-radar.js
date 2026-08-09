/* ══════════════════════════════════════════════════════════════
   통계 - 대학 레이더 비교 (stats-overview-elo.js 에서 분리, 2026-07-30)
   ══════════════════════════════════════════════════════════════ */

function _radarBaseScore(){
  return {winrate:0,avgElo:1200,pts:0,activity:0,diversity:0,streak:0,w:0,l:0,tot:0,mem:0};
}
function _statsSideNames(side){
  if(Array.isArray(side)){
    return side.map(x => {
      if(x && typeof x === 'object') return String(x.name || '').trim();
      return String(x || '').trim();
    }).filter(Boolean);
  }
  return String(side || '').split(/[,+，]/).map(x=>x.trim()).filter(Boolean);
}
function _statsGameSides(g){
  if(!g || !g.winner) return null;
  const aList = (Array.isArray(g.teamA) && g.teamA.length) ? _statsSideNames(g.teamA) : ((g.a1 || g.a2) ? [g.a1, g.a2].filter(Boolean) : _statsSideNames(g.playerA));
  const bList = (Array.isArray(g.teamB) && g.teamB.length) ? _statsSideNames(g.teamB) : ((g.b1 || g.b2) ? [g.b1, g.b2].filter(Boolean) : _statsSideNames(g.playerB));
  if(!aList.length || !bList.length) return null;
  return { a:aList, b:bList, winner:String(g.winner || '') };
}
function _statsSideUnivs(names){
  const set = new Set();
  (names || []).forEach(name => {
    const p = statsP(name);
    const u = String(p?.univ || '').trim();
    if(u) set.add(u);
  });
  return [...set];
}
function getSortedRadarRows(){
  const _players = Array.isArray(players) ? players : [];
  const univs=getAllUnivs().filter(u=>_players.some(p=>p.univ===u.name));
  const _allScores=getStatsRadarScores();
  const rows=univs.map(u=>({u, scores:_allScores[u.name] || _radarBaseScore()}));
  const sorter = String(_radarSort||'winrate');
  rows.sort((a,b)=>{
    if(sorter==='name') return String(a.u?.name||'').localeCompare(String(b.u?.name||''),'ko');
    if(sorter==='activity') return (b.scores.activity-a.scores.activity)||(b.scores.winrate-a.scores.winrate)||(b.scores.tot-a.scores.tot);
    if(sorter==='elo') return (b.scores.avgElo-a.scores.avgElo)||(b.scores.winrate-a.scores.winrate)||(b.scores.tot-a.scores.tot);
    return (b.scores.winrate-a.scores.winrate)||(b.scores.tot-a.scores.tot)||(b.scores.avgElo-a.scores.avgElo);
  });
  return {rows, scoreMap:_allScores};
}
window.toggleRadarCompareUniv = window.toggleRadarCompareUniv || function(name){
  try{
    const key = String(name||'').trim();
    if(!key) return;
    const arr = Array.isArray(window._radarCompareUnivs) ? [...window._radarCompareUnivs] : [];
    const idx = arr.indexOf(key);
    if(idx >= 0) arr.splice(idx,1);
    else{
      if(arr.length >= 4) arr.shift();
      arr.push(key);
    }
    window._radarCompareUnivs = arr.filter(v=>v && v!==window._radarSelUniv);
    render();
  }catch(e){}
};
function getStatsRadarSourceMatches(){
  const _mini = Array.isArray(window.miniM) ? window.miniM : [];
  const _univm = Array.isArray(window.univM) ? window.univM : [];
  const _ck = Array.isArray(window.ckM) ? window.ckM : [];
  const _comps = Array.isArray(window.comps) ? window.comps : [];
  const _tour = (typeof getTourneyMatches === 'function') ? getTourneyMatches() : [];
  return statsFilterMatches([].concat(_mini, _univm, _ck, _comps, _tour));
}
function getStatsRadarScores(){
  const _players = Array.isArray(players) ? players : [];
  const univNames = [...new Set(_players.map(p=>String(p?.univ||'').trim()).filter(Boolean))];
  const scoreMap = {};
  const memberSets = {};
  // 대학별 소속 선수를 1회 순회로 그룹핑 (기존: 대학 수 × 전체 선수 수 만큼 filter 반복)
  const _membersByUniv = {};
  _players.forEach(p=>{
    const nm = String(p?.univ||'').trim();
    if(!nm) return;
    (_membersByUniv[nm] || (_membersByUniv[nm]=[])).push(p);
  });
  univNames.forEach(name=>{
    const mem=_membersByUniv[name] || [];
    const avgElo=Math.round(mem.reduce((s,p)=>s+(p.elo||1200),0)/Math.max(1, mem.length));
    const pts=mem.reduce((s,p)=>s+(p.points||0),0);
    const races=new Set(mem.map(p=>p.race).filter(Boolean)).size;
    memberSets[name] = new Set();
    let maxS=0;
    mem.forEach(p=>{
      let cs=0, lt='';
      const hist=[...statsNonProHist(p)].sort((a,b)=>(String(b.date||'')).localeCompare(String(a.date||'')));
      for(const h of hist){
        if(h.result===lt || lt===''){ cs++; lt=h.result; }
        else { cs=1; lt=h.result; }
        if(lt==='승') maxS=Math.max(maxS, cs);
      }
    });
    // 활동도: statsNonProHist 기반 전역 날짜 필터가 적용된 게임 참여 수 (30일 하드코딩 제거)
    const actCount = mem.reduce((s,p) => s + (statsNonProHist(p)||[]).length, 0);
    scoreMap[name]={winrate:0,avgElo,pts,activity:actCount,diversity:races,streak:maxS,w:0,l:0,tot:0,mem:mem.length};
  });
  getStatsRadarSourceMatches().forEach(m=>{
    const md = String(m?.d || m?.date || '');
    (m.sets||[]).forEach(set=>{
      (set.games||[]).forEach(g=>{
        const sides = _statsGameSides(g);
        if(!sides) return;
        sides.a.forEach(name => {
          const pA = statsP(name);
          const ua = String(pA?.univ || '').trim();
          if(ua && scoreMap[ua]){
            memberSets[ua] && memberSets[ua].add(String(name).trim());
            if(sides.winner === 'A') scoreMap[ua].w++; else scoreMap[ua].l++;
            scoreMap[ua].tot++;
          }
        });
        sides.b.forEach(name => {
          const pB = statsP(name);
          const ub = String(pB?.univ || '').trim();
          if(ub && scoreMap[ub]){
            memberSets[ub] && memberSets[ub].add(String(name).trim());
            if(sides.winner === 'B') scoreMap[ub].w++; else scoreMap[ub].l++;
            scoreMap[ub].tot++;
          }
        });
      });
    });
  });
  Object.values(scoreMap).forEach(s=>{
    s.winrate = s.tot ? Math.round(s.w / s.tot * 100) : 0;
  });
  Object.keys(scoreMap).forEach(name=>{
    scoreMap[name].mem = memberSets[name] ? memberSets[name].size : 0;
  });
  return scoreMap;
}
function getStatsUnivHeadToHead(nameA, nameB){
  const a = String(nameA || '').trim();
  const b = String(nameB || '').trim();
  const res = { aWins:0, bWins:0, total:0 };
  if(!a || !b || a === b) return res;
  getStatsRadarSourceMatches().forEach(m=>{
    (m.sets || []).forEach(set=>{
      (set.games || []).forEach(g=>{
        const sides = _statsGameSides(g);
        if(!sides) return;
        const uA = _statsSideUnivs(sides.a);
        const uB = _statsSideUnivs(sides.b);
        if(uA.length === 1 && uB.length === 1 && uA[0] === a && uB[0] === b){
          res.total++;
          if(sides.winner === 'A') res.aWins++;
          else if(sides.winner === 'B') res.bWins++;
        }else if(uA.length === 1 && uB.length === 1 && uA[0] === b && uB[0] === a){
          res.total++;
          if(sides.winner === 'A') res.bWins++;
          else if(sides.winner === 'B') res.aWins++;
        }
      });
    });
  });
  return res;
}
function statsRadarHTML(){
  const _players = Array.isArray(players) ? players : [];
  const {rows:_rows, scoreMap:_allScores} = getSortedRadarRows();
  const univs=_rows.map(x=>x.u);
  if((!_radarSelUniv || !univs.some(u=>u.name===_radarSelUniv)) && univs.length) _radarSelUniv=univs[0].name;
  _radarCompareUnivs = (Array.isArray(_radarCompareUnivs)?_radarCompareUnivs:[]).filter(name=>name && name!==_radarSelUniv && univs.some(u=>u.name===name)).slice(0,4);
  const _selectedScores=_allScores[_radarSelUniv] || {tot:0,w:0,l:0};
  const _totalGames=_rows.reduce((sum,row)=>sum+(row.scores.tot||0),0);
  const _quickCompare = Array.from(new Set([_radarSelUniv, ..._radarCompareUnivs, ..._rows.slice(0,5).map(r=>r.u.name)])).filter(Boolean).slice(0,7);
  const _sortBtn = (id, label)=>`<button class="pill ${_radarSort===id?'on':''}" style="flex-shrink:0;white-space:nowrap" onclick="_radarSort='${id}';render()">${label}</button>`;
  const _selectedUnivObj = univs.find(u=>u.name===_radarSelUniv);
  const _selectedColor = gc(_radarSelUniv);
  const _compareName = (_radarCompareUnivs[0] && _radarCompareUnivs[0] !== _radarSelUniv)
    ? _radarCompareUnivs[0]
    : (_rows.find(r=>r.u.name !== _radarSelUniv)?.u.name || '');
  const _compareScores = _compareName ? (_allScores[_compareName] || _radarBaseScore()) : _radarBaseScore();
  const _compareColor = _compareName ? gc(_compareName) : '#64748b';
  const _h2h = _compareName ? getStatsUnivHeadToHead(_radarSelUniv, _compareName) : { aWins:0, bWins:0, total:0 };
  const _fmtSigned = (n, suffix='') => `${n > 0 ? '+' : ''}${n}${suffix}`;
  const _metricCard = (label, a, b, opts={})=>{
    const suffix = opts.suffix || '';
    const signed = !!opts.signed;
    const diff = (Number(a) || 0) - (Number(b) || 0);
    const diffColor = diff === 0 ? 'var(--text3)' : (diff > 0 ? '#16a34a' : '#dc2626');
    const av = signed ? _fmtSigned(Number(a) || 0, suffix) : `${a}${suffix}`;
    const bv = signed ? _fmtSigned(Number(b) || 0, suffix) : `${b}${suffix}`;
    const dv = signed ? _fmtSigned(diff, suffix) : `${diff > 0 ? '+' : ''}${diff}${suffix}`;
    return `<div class="stats-compare-kpi">
      <div class="stats-metric-label">${label}</div>
      <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px">
        <div style="min-width:0">
          <div style="font-size:16px;font-weight:950;color:${_selectedColor}">${av}</div>
          <div style="font-size:11px;color:var(--text3);margin-top:2px">${escHTML(_radarSelUniv)}</div>
        </div>
        <div style="font-size:12px;font-weight:900;color:${diffColor};padding-top:2px">${dv}</div>
      </div>
      <div style="margin-top:8px;padding-top:8px;border-top:1px solid rgba(148,163,184,.14)">
        <div style="font-size:14px;font-weight:900;color:${_compareColor}">${bv}</div>
        <div style="font-size:11px;color:var(--text3);margin-top:2px">${escHTML(_compareName || '비교 없음')}</div>
      </div>
    </div>`;
  };
  const _compareSummary = _compareName
    ? `${_radarSelUniv}와 ${_compareName}를 현재 통계 필터 기준으로 바로 비교할 수 있습니다.`
    : '비교할 대학을 선택하면 핵심 차이를 바로 보여줍니다.';
  return`<div style="display:flex;flex-direction:column;gap:16px">
  <div class="ssec" id="stats-radar-sec">
    <div class="stats-chart-shell">
    <div class="stats-chart-toolbar">
      <div>
        <h4 style="margin:0">🕸️ 대학별 성적 레이더 차트 <span style="font-size:11px;color:var(--gray-l);font-weight:400">(프로리그 제외)</span></h4>
        <div style="font-size:11px;color:var(--gray-l);margin-top:4px">${_compareSummary}</div>
      </div>
      <div class="stats-chart-actions no-export">
        <select id="radar-sel" class="stats-select" onchange="_radarSelUniv=(function(v){try{var t=document.createElement('textarea');t.innerHTML=v;return t.value;}catch(e){return v;}})(this.value);initRadarChart()">
          ${univs.map(u=>`<option value="${escHTML(u.name)}"${_radarSelUniv===u.name?' selected':''}>${escHTML(u.name)}</option>`).join('')}
        </select>
        <select id="radar-compare-sel" class="stats-select" onchange="(function(v){try{var t=document.createElement('textarea');t.innerHTML=v;v=t.value;}catch(e){}var arr=(Array.isArray(window._radarCompareUnivs)?window._radarCompareUnivs:[]).filter(function(name){return name&&name!==window._radarSelUniv&&name!==v;});if(v)arr.unshift(v);window._radarCompareUnivs=arr.slice(0,4);render();})(this.value)">
          <option value="">비교 대학 선택</option>
          ${univs.filter(u=>u.name!==_radarSelUniv).map(u=>`<option value="${escHTML(u.name)}"${_compareName===u.name?' selected':''}>${escHTML(u.name)}</option>`).join('')}
        </select>
        <button class="btn-capture btn-xs no-export" onclick="captureSection('stats-radar-sec','radar')">📷 이미지 저장</button>
      </div>
    </div>
    <div class="fbar utilbar utilbar--scroll no-export" style="overflow-x:auto;flex-wrap:nowrap;-webkit-overflow-scrolling:touch;scrollbar-width:none;gap:6px;margin-bottom:10px">
      ${_sortBtn('winrate','승률순')}
      ${_sortBtn('activity','활동도순')}
      ${_sortBtn('elo','ELO순')}
      ${_sortBtn('name','이름순')}
    </div>
    <div class="stats-legend-wrap no-export" style="margin-bottom:12px">
      ${_quickCompare.map(name=>{
        const on = name===_radarSelUniv || _radarCompareUnivs.includes(name);
        const isMain = name===_radarSelUniv;
        return `<button class="stats-legend-chip" onclick="${isMain?`_radarSelUniv='${escJS(name)}';initRadarChart()`:`toggleRadarCompareUniv('${escJS(name)}')`}" style="border-color:${on?gc(name):'var(--border2)'};background:${on?gc(name)+'18':'var(--white)'};color:${on?gc(name):'var(--text3)'};cursor:pointer">${isMain?'기준 ':(_radarCompareUnivs.includes(name)?'비교 ':'+ 비교 ')}${escHTML(name)}</button>`;
      }).join('')}
    </div>
    <div class="stats-metric-grid">
      <div class="stats-metric-card">
        <div class="stats-metric-label">집계 대학</div>
        <div class="stats-metric-value">${_rows.length}</div>
      </div>
      <div class="stats-metric-card">
        <div class="stats-metric-label">집계 경기 수</div>
        <div class="stats-metric-value">${_totalGames}</div>
      </div>
      <div class="stats-metric-card" style="border-color:${_selectedColor}55">
        <div class="stats-metric-label">선택 대학 전적</div>
        <div class="stats-metric-value" style="font-size:18px;color:${_selectedColor}">${_selectedScores.w||0}승 ${_selectedScores.l||0}패</div>
        <div class="stats-metric-sub">${escHTML(_selectedUnivObj?.name||'-')}</div>
      </div>
      <div class="stats-metric-card">
        <div class="stats-metric-label">비교 대학</div>
        <div class="stats-metric-value">${1+_radarCompareUnivs.length}개</div>
      </div>
    </div>
    ${_compareName ? `
      <div class="stats-chart-board">
        <div class="stats-compare-duel" style="margin-bottom:12px">
          <div class="stats-compare-univ-card" style="border-color:${_selectedColor}55;background:${_selectedColor}0d">
            <div style="font-size:11px;font-weight:900;color:${_selectedColor};letter-spacing:.05em;text-transform:uppercase">기준 대학</div>
            <div style="font-size:20px;font-weight:950;color:${_selectedColor};margin-top:6px">${escHTML(_radarSelUniv)}</div>
            <div style="font-size:12px;color:var(--text3);margin-top:6px">${_selectedScores.w || 0}승 ${_selectedScores.l || 0}패 · 승률 ${_selectedScores.winrate || 0}%</div>
          </div>
          <div class="stats-compare-vs">VS</div>
          <div class="stats-compare-univ-card" style="border-color:${_compareColor}55;background:${_compareColor}0d">
            <div style="font-size:11px;font-weight:900;color:${_compareColor};letter-spacing:.05em;text-transform:uppercase">비교 대학</div>
            <div style="font-size:20px;font-weight:950;color:${_compareColor};margin-top:6px">${escHTML(_compareName)}</div>
            <div style="font-size:12px;color:var(--text3);margin-top:6px">${_compareScores.w || 0}승 ${_compareScores.l || 0}패 · 승률 ${_compareScores.winrate || 0}%</div>
          </div>
        </div>
        <div class="stats-compare-kpi-grid">
          ${_metricCard('집계 선수 수', _selectedScores.mem || 0, _compareScores.mem || 0, { suffix:'명' })}
          ${_metricCard('승률', _selectedScores.winrate || 0, _compareScores.winrate || 0, { suffix:'%' })}
          ${_metricCard('평균 ELO', _selectedScores.avgElo || 0, _compareScores.avgElo || 0)}
          ${_metricCard('활동도', _selectedScores.activity || 0, _compareScores.activity || 0, { suffix:'경기' })}
          ${_metricCard('포인트', _selectedScores.pts || 0, _compareScores.pts || 0, { signed:true })}
          ${_metricCard('종족 다양성', _selectedScores.diversity || 0, _compareScores.diversity || 0, { suffix:'종족' })}
        </div>
        <div class="stats-h2h-board" style="margin-top:12px">
          <div style="font-size:12px;font-weight:900;color:var(--text3);margin-bottom:8px">맞대결</div>
          <div class="stats-h2h-score">
            <div style="text-align:center;min-width:120px">
              <div style="font-size:24px;font-weight:950;color:${_selectedColor}">${_h2h.aWins}</div>
              <div style="font-size:11px;color:var(--text3);margin-top:4px">${escHTML(_radarSelUniv)}</div>
            </div>
            <div style="font-size:13px;color:var(--text3);font-weight:900">${_h2h.total ? `${_h2h.total}전` : '맞대결 없음'}</div>
            <div style="text-align:center;min-width:120px">
              <div style="font-size:24px;font-weight:950;color:${_compareColor}">${_h2h.bWins}</div>
              <div style="font-size:11px;color:var(--text3);margin-top:4px">${escHTML(_compareName)}</div>
            </div>
          </div>
        </div>
      </div>
    ` : ''}
    <div class="stats-chart-board">
      <div style="display:flex;gap:20px;flex-wrap:wrap;align-items:flex-start">
        <div class="stats-chart-wrap" style="flex-shrink:0">
          <canvas id="radarChart" width="280" height="280" style="flex-shrink:0"></canvas>
        </div>
        <div id="radarInfo" style="flex:1;min-width:200px"></div>
      </div>
    </div>
    </div>
  </div>
  <div class="ssec">
    <h4 style="margin-bottom:12px">📊 전체 대학 비교</h4>
    <div class="stats-table-card"><div style="overflow-x:auto"><table class="stats-rank-table">
      <thead><tr><th>대학</th><th>집계 선수수</th><th>승률</th><th>전적</th><th>ELO평균</th><th>포인트</th><th>활동도</th><th>다양성</th></tr></thead>
      <tbody>
        ${_rows.map(({u,scores})=>{
          const _isOn=_radarSelUniv===u.name || _radarCompareUnivs.includes(u.name);
          return`<tr class="${_isOn?'stats-rank-top':''}" style="cursor:pointer;${_isOn?'background:'+u.color+'12;':''}" onclick="_radarSelUniv='${escJS(u.name)}';initRadarChart()">
            <td><span class="ubadge clickable-univ" style="background:${u.color}" onclick="event.stopPropagation();openUnivModal('${escJS(u.name)}')">${escHTML(u.name)}</span></td>
            <td>${scores.mem}명</td>
            <td style="color:${scores.winrate>=50?'var(--red)':'var(--blue)'};font-weight:700">${scores.winrate}%</td>
            <td style="font-weight:700">${scores.w}승 ${scores.l}패</td>
            <td>${scores.avgElo}</td>
            <td class="${scores.pts>=0?'wt':'lt'}">${scores.pts>=0?'+':''}${scores.pts}</td>
            <td>${scores.activity}</td>
            <td style="white-space:nowrap">${scores.diversity}종족 <button class="btn btn-w btn-xs" style="margin-left:6px;padding:2px 6px" onclick="event.stopPropagation();toggleRadarCompareUniv('${escJS(u.name)}')">${_radarCompareUnivs.includes(u.name)?'해제':'비교'}</button></td>
          </tr>`;
        }).join('')}
      </tbody>
    </table></div></div>
  </div></div>`;
}
function calcUnivRadar(univName, proIds){
  const scores = getStatsRadarScores();
  return scores[univName] || {winrate:0,avgElo:1200,pts:0,activity:0,diversity:0,streak:0,w:0,l:0,tot:0,mem:0};
}
function initRadarChart(){
  const canvas=document.getElementById('radarChart');
  const info=document.getElementById('radarInfo');
  if(!canvas)return;
  // HTML entity decode fallback (특수문자 대학명 대응)
  try{const ta=document.createElement('textarea');ta.innerHTML=_radarSelUniv;_radarSelUniv=ta.value;}catch(e){}
  const _players = Array.isArray(players) ? players : [];
  const _univsWithPlayers = new Set(_players.map(p=>p.univ));
  const allUnivs=getAllUnivs().filter(u=>_univsWithPlayers.has(u.name));
  if((!_radarSelUniv || !allUnivs.some(u=>u.name===_radarSelUniv)) && allUnivs.length) _radarSelUniv = allUnivs[0].name;
  const _allScores=getStatsRadarScores();
  const _activeNames = Array.from(new Set([_radarSelUniv, ...((Array.isArray(_radarCompareUnivs)?_radarCompareUnivs:[]).filter(name=>name && name!==_radarSelUniv))])).slice(0,5);
  const _activeRows = _activeNames.map(name=>({name, scores:_allScores[name]||calcUnivRadar(name), col:gc(name)}));
  const scores=_allScores[_radarSelUniv]||calcUnivRadar(_radarSelUniv);
  const _sv=Object.values(_allScores);
  const maxVals={
    winrate:100,
    avgElo:Math.max(..._sv.map(s=>s.avgElo),1500),
    activity:Math.max(..._sv.map(s=>s.activity),1),
    diversity:3,
    streak:Math.max(..._sv.map(s=>s.streak),1),
    mem:Math.max(..._sv.map(s=>s.mem),1),
  };
  const labels=['승률','ELO','활동도','다양성','연승','선수수'];
  const col=gc(_radarSelUniv);
  const W=280,H=280,cx=W/2,cy=H/2,r=100,sides=6;
  const ctx=canvas.getContext('2d');
  ctx.clearRect(0,0,W,H);
  const angle=i=>(-Math.PI/2)+(2*Math.PI/sides)*i;
  // 배경 그물
  [0.2,0.4,0.6,0.8,1.0].forEach(frac=>{
    ctx.beginPath();
    for(let i=0;i<sides;i++){
      const x=cx+r*frac*Math.cos(angle(i));
      const y=cy+r*frac*Math.sin(angle(i));
      if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);
    }
    ctx.closePath();ctx.strokeStyle='#e2e8f0';ctx.lineWidth=1;ctx.stroke();
    if(frac===1||frac===0.5){ctx.fillStyle='#94a3b8';ctx.font='9px sans-serif';ctx.textAlign='center';ctx.fillText(Math.round(frac*100)+'%',cx,cy-r*frac-3);}
  });
  // 축선
  for(let i=0;i<sides;i++){
    ctx.beginPath();ctx.moveTo(cx,cy);
    ctx.lineTo(cx+r*Math.cos(angle(i)),cy+r*Math.sin(angle(i)));
    ctx.strokeStyle='#cbd5e1';ctx.lineWidth=1;ctx.stroke();
  }
  _activeRows.forEach((row, idx)=>{
    const vals=[
      row.scores.winrate/maxVals.winrate,
      row.scores.avgElo/maxVals.avgElo,
      Math.min(1,row.scores.activity/maxVals.activity),
      row.scores.diversity/maxVals.diversity,
      Math.min(1,row.scores.streak/maxVals.streak),
      row.scores.mem/maxVals.mem,
    ];
    ctx.beginPath();
    for(let i=0;i<sides;i++){
      const v=vals[i];
      const x=cx+r*v*Math.cos(angle(i));
      const y=cy+r*v*Math.sin(angle(i));
      if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);
    }
    ctx.closePath();
    ctx.fillStyle=row.col + (idx===0 ? '2e' : '16'); ctx.fill();
    ctx.strokeStyle=row.col; ctx.lineWidth=idx===0?2.8:1.8; ctx.stroke();
    for(let i=0;i<sides;i++){
      const v=vals[i];
      const x=cx+r*v*Math.cos(angle(i));
      const y=cy+r*v*Math.sin(angle(i));
      ctx.beginPath();ctx.arc(x,y,idx===0?4:3,0,Math.PI*2);
      ctx.fillStyle=row.col;ctx.fill();ctx.strokeStyle='#fff';ctx.lineWidth=1.2;ctx.stroke();
    }
  });
  // 레이블
  ctx.fillStyle='#374151';ctx.font='bold 11px sans-serif';ctx.textAlign='center';
  for(let i=0;i<sides;i++){
    const x=cx+(r+18)*Math.cos(angle(i));
    const y=cy+(r+18)*Math.sin(angle(i));
    const va=Math.abs(Math.sin(angle(i)));
    ctx.textAlign=Math.cos(angle(i))>0.1?'left':Math.cos(angle(i))<-0.1?'right':'center';
    ctx.fillText(labels[i],x,y+va*5);
  }
  // 중앙 대학명
  ctx.fillStyle=col;ctx.font='bold 12px sans-serif';ctx.textAlign='center';
  ctx.fillText(_radarSelUniv,cx,cy+4);
  if(info){
    info.innerHTML=`
      <div class="stats-info-stack">
        <div class="stats-legend-wrap">${_activeRows.map((row, idx)=>`<span class="stats-legend-chip" style="background:${row.col}14;border-color:${row.col}55;color:${row.col}"><span style="width:8px;height:8px;border-radius:50%;background:${row.col};display:inline-block"></span>${idx===0?'기준':'비교'} ${escHTML(row.name)}</span>`).join('')}</div>
        ${_activeRows.map((row, idx)=>`
        <div class="stats-detail-card" style="border-color:${idx===0?row.col+'55':'var(--border)'};background:${idx===0?row.col+'0d':'var(--white)'}">
          <div class="stats-detail-title" style="color:${row.col}">${escHTML(row.name)}</div>
          ${[
            ['집계 선수 수',row.scores.mem+'명'],
            ['승률',row.scores.winrate+'%'],
            ['평균 ELO',row.scores.avgElo],
            ['총 포인트',(row.scores.pts>=0?'+':'')+row.scores.pts],
            ['활동도 (경기 수)',row.scores.activity+'경기'],
            ['종족 다양성',row.scores.diversity+'종족'],
            ['최장 연승',row.scores.streak+'연승'],
            ['총 전적',`${row.scores.w}승 ${row.scores.l}패`],
          ].map(([k,v])=>`<div class="stats-detail-row">
            <span>${k}</span>
            <span>${v}</span>
          </div>`).join('')}
        </div>`).join('')}
      </div>`;
  }
  const sel=document.getElementById('radar-sel');
  if(sel)sel.value=_radarSelUniv;
}

/* ══════════════════════════════════════
   6-1. 대학비교 (구 현황판 ⚔️ 대학비교 뷰 이식)
   — 실전승률 + 직접대결 + 레이더차트
══════════════════════════════════════ */
let _statsCompareA = '';
let _statsCompareB = '';

// board2-core.js(현황판 청크)가 로드되지 않은 상태(통계탭에 바로 진입)에서도
// 동작하도록 _b2HasRole과 동일한 로직을 통계탭 전용으로 독립 구현
const _STATS_CV_ROLE_ORDER = ['이사장','동아리 회장','총장','부총장','교수','코치','선장','동아리장','반장','총괄'];
const _STATS_CV_ROLE_ORDER_BY_LEN = [..._STATS_CV_ROLE_ORDER].sort((a,b)=>b.length-a.length);
function _statsCvHasRole(p) {
  if (p && typeof p.roleOrder === 'number' && !isNaN(p.roleOrder)) return true;
  const role = (p && p.role) || '';
  if (!role) return false;
  if (_STATS_CV_ROLE_ORDER.includes(role)) return true;
  return _STATS_CV_ROLE_ORDER_BY_LEN.some(key => role.includes(key));
}
// board2 전용 _b2NameTag 대신 통계탭에서 자체적으로 쓰는 간단한 선수 태그
function _statsCvNameTag(p, accentCol, showTier) {
  const safeName = (p.name||'').replace(/'/g,"\\'");
  return `
    <div style="display:flex;align-items:center;gap:6px;padding:3px 8px 3px 3px;border-radius:20px;cursor:pointer;transition:background .12s"
      onmouseover="this.style.background='${accentCol}14'"
      onmouseout="this.style.background='transparent'"
      onclick="openPlayerModal('${safeName}')">
      ${typeof getPlayerPhotoHTML==='function'?getPlayerPhotoHTML(p.name,26,'border-radius:50%;flex-shrink:0'):''}
      <span style="font-weight:700;font-size:var(--fs-lg);color:var(--text1);white-space:nowrap;${p.inactive?'opacity:.6':''}">${escHTML(p.name||'')}</span>
      ${p.race&&p.race!=='N'?`<span class="rbadge r${p.race}" style="font-size:10px;flex-shrink:0">${p.race}</span>`:''}
      ${showTier&&p.tier?`<span style="font-size:10px;font-weight:700;padding:1px 5px;border-radius:4px;background:${getTierBtnColor(p.tier)};color:${getTierBtnTextColor(p.tier)||'#fff'};flex-shrink:0">${escHTML(p.tier)}</span>`:''}
      ${p.inactive?'<span style="font-size:9px;background:#fff7ed;color:#9a3412;border-radius:4px;padding:1px 4px;font-weight:700;flex-shrink:0">⏸️</span>':''}
    </div>`;
}

