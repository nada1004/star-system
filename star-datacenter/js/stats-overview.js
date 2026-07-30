/* ══════════════════════════════════════════════════════════════
   통계 - 개요 (stats-overview-elo.js 에서 분리, 2026-07-30)
   ══════════════════════════════════════════════════════════════ */

function statsOverviewHTML(){
  const proMatchIds=statsProMatchIds();
  const univStats={};
  const _players = Array.isArray(players) ? players : [];
  const rv={T:{T:{w:0,l:0},Z:{w:0,l:0},P:{w:0,l:0}},Z:{T:{w:0,l:0},Z:{w:0,l:0},P:{w:0,l:0}},P:{T:{w:0,l:0},Z:{w:0,l:0},P:{w:0,l:0}}};
  const mapStats={};
  _players.forEach(p=>{
    const h=statsNonProHist(p);
    if(!univStats[p.univ])univStats[p.univ]={w:0,l:0,color:gc(p.univ)};
    let _uw=0,_ul=0;
    h.forEach(x=>{
      if(x.result==='승')_uw++; else if(x.result==='패')_ul++;
      if(p.history&&p.race&&x.oppRace&&rv[p.race]&&rv[p.race][x.oppRace]){
        if(x.result==='승')rv[p.race][x.oppRace].w++;
        else if(x.result==='패')rv[p.race][x.oppRace].l++;
      }
      if(x.map&&x.map!=='-'){
        if(!mapStats[x.map])mapStats[x.map]={w:0,l:0};
        if(x.result==='승')mapStats[x.map].w++;
        else if(x.result==='패')mapStats[x.map].l++;
      }
    });
    univStats[p.univ].w+=_uw;
    univStats[p.univ].l+=_ul;
  });
  const univRank=Object.entries(univStats)
    .map(([name,s])=>({name,w:s.w,l:s.l,color:s.color,rate:s.w+s.l===0?0:Math.round(s.w/(s.w+s.l)*100)}))
    .filter(u=>u.w+u.l>=10)
    .sort((a,b)=>b.w-a.w||b.rate-a.rate);

  const mapRank=Object.entries(mapStats).map(([name,s])=>({name,w:s.w,l:s.l,total:s.w+s.l})).sort((a,b)=>b.total-a.total);
  function calcFormPlayers(genderFilter, streakFilter){
    // streakFilter: '승' = 연승자만, '패' = 연패자만, undefined = 전체
    return _players.filter(p=>(genderFilter?p.gender===genderFilter:true))
      .map(p=>{
        const hist=[...(p.history||[])].sort((a,b)=>(b.date||'').localeCompare(a.date||''));
        const rec=hist.slice(0,5);
        if(rec.length<1)return null;
        const streak=(()=>{let s=0,type=rec[0]?.result;for(const h of rec){if(h.result===type)s++;else break;}return{n:s,type};})();
        return{...p,form:rec,streak};
      }).filter(Boolean)
      .filter(p=>streakFilter?p.streak.type===streakFilter:true)
      .sort((a,b)=>b.streak.n-a.streak.n).slice(0,10);
  }
  const formF=calcFormPlayers('F','승'), formM=calcFormPlayers('M','승');
  const worstFormF=calcFormPlayers('F','패'), worstFormM=calcFormPlayers('M','패');
  const raceColor={T:'#2563eb',Z:'#dc2626',P:'#7c3aed'};
  const raceName={T:'테란',Z:'저그',P:'프로토스'};
  const raceEmoji={T:'⚔️',Z:'🦟',P:'🔮'};
  // 대학별 활성 스트리머 수 (최근 30일)
  const _30dAgo=(()=>{const d=new Date();d.setDate(d.getDate()-30);return d.toISOString().slice(0,10);})();
  const _univActive={};
  _players.forEach(p=>{
    if(!p.univ)return;
    const hasRecent=(p.history||[]).some(h=>(h.date||'')>=_30dAgo);
    if(!_univActive[p.univ])_univActive[p.univ]={total:0,active:0};
    _univActive[p.univ].total++;
    if(hasRecent)_univActive[p.univ].active++;
  });
  function formRow(p,pi){
    const icons=p.form.map(h=>h.result==='승'
      ?'<span style="display:inline-block;width:20px;height:20px;background:var(--red);color:#fff;font-size:10px;font-weight:800;border-radius:4px;text-align:center;line-height:20px">W</span>'
      :'<span style="display:inline-block;width:20px;height:20px;background:var(--blue);color:#fff;font-size:10px;font-weight:800;border-radius:4px;text-align:center;line-height:20px">L</span>').join('');
    const sc=p.streak.type==='승'?'var(--red)':'var(--blue)';
    const si=p.streak.type==='승'?'🔥':'❄️';
    return`<div class="stats-list-item">
      <span style="font-weight:700;font-size:11px;color:var(--gray-l);min-width:20px;text-align:right">${pi+1}</span>
      ${getPlayerPhotoHTML(p.name,'38px')}
      <span style="font-weight:800;font-size:14px;cursor:pointer;color:var(--blue);min-width:65px" onclick="openPlayerModal('${escJS(p.name)}')">${escHTML(p.name)}${getStatusIconHTML(p.name)}</span>
      <span style="font-size:11px;color:${gc(p.univ)};font-weight:700;min-width:55px">${escHTML(p.univ)}</span>
      <span style="display:flex;gap:2px">${icons}</span>
      <span style="font-weight:800;font-size:12px;color:${sc};white-space:nowrap">${si} ${p.streak.n}연${p.streak.type==='승'?'승':'패'}</span>
    </div>`;
  }
  return`<div style="display:flex;flex-direction:column;gap:20px">
  <div class="ssec" id="stats-univ-sec">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
      <h4 style="margin:0;font-family:'Noto Sans KR',sans-serif">🏛️ 대학별 승률 랭킹</h4>
      <button class="btn-capture btn-xs no-export" onclick="captureStats()">📷 이미지 저장</button>
    </div>
    <div class="stats-list-stack">
      ${univRank.filter(u=>u.w+u.l>0).map((u,i)=>{
        const medal=i===0?'🥇':i===1?'🥈':i===2?'🥉':`${i+1}위`;
        return`<div class="stats-list-item" style="cursor:pointer" onclick="openUnivModal('${escJS(u.name)}')">
          <span style="min-width:32px;font-weight:800;font-size:13px">${medal}</span>
          <span class="ubadge" style="background:${u.color};min-width:80px;text-align:center">${escHTML(u.name)}</span>
          <div class="stats-progress">
            <div class="stats-progress-bar" style="width:${u.rate}%;background:${u.color}"></div>
          </div>
          <span style="min-width:50px;text-align:right;font-weight:700;font-size:13px">${u.rate}%</span>
          <span style="color:var(--gray-l);font-size:11px">${u.w}승${u.l}패</span>
          <span style="font-size:10px;color:${(_univActive[u.name]?.active||0)>0?'var(--green)':'var(--gray-l)'};white-space:nowrap" title="최근 30일 활성 스트리머">🟢${_univActive[u.name]?.active||0}/${_univActive[u.name]?.total||0}</span>
        </div>`;
      }).join('')||'<p style="color:var(--gray-l)">경기 기록이 없습니다.</p>'}
    </div>
  </div>
  <div class="ssec"><h4>⚔️ 종족별 상대전적</h4><div style="overflow-x:auto"><table class="stats-rank-table" style="min-width:400px">
    <thead><tr><th>내\상대</th>${['T','Z','P'].map(r=>`<th>${raceEmoji[r]} ${raceName[r]}</th>`).join('')}</tr></thead>
    <tbody>${['T','Z','P'].map(r=>`<tr><td style="font-weight:700;color:${raceColor[r]}">${raceEmoji[r]} ${raceName[r]}</td>${['T','Z','P'].map(o=>{
      const s=rv[r][o];const rate=s.w+s.l===0?'-':Math.round(s.w/(s.w+s.l)*100)+'%';
      const bg=r===o?'background:var(--border2)':s.w>s.l?'background:#dc262622':s.w<s.l?'background:#2563eb22':'';
      return`<td style="${bg}">${r===o?'<span style="color:var(--gray-l)">-</span>':`<span style="font-weight:700">${rate}</span><br><span style="font-size:10px;color:var(--gray-l)">${s.w}승${s.l}패</span>`}</td>`;
    }).join('')}</tr>`).join('')}</tbody>
  </table></div>
  <div class="stats-duo-grid" style="margin-top:10px">
    ${[['T','Z'],['T','P'],['Z','P']].map(([a,b])=>{
      const tw=rv[a][b].w, tl=rv[a][b].l, bw=rv[b][a].w, bl=rv[b][a].l;
      const tot=tw+tl+bw+bl;
      const aRate=tot===0?50:Math.round((tw+bl)/(tot)*100);
      const bRate=100-aRate;
      return`<div class="stats-surface-box" style="flex:1;min-width:180px">
        <div style="font-weight:800;font-size:12px;margin-bottom:6px;text-align:center">${raceEmoji[a]} ${raceName[a]} <span style="color:var(--gray-l)">vs</span> ${raceEmoji[b]} ${raceName[b]}</div>
        <div style="display:flex;height:10px;border-radius:5px;overflow:hidden;margin-bottom:4px">
          <div style="width:${aRate}%;background:${raceColor[a]};transition:.3s"></div>
          <div style="width:${bRate}%;background:${raceColor[b]};transition:.3s"></div>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:11px">
          <span style="color:${raceColor[a]};font-weight:700">${aRate}% (${tw+bl}승)</span>
          <span style="color:var(--gray-l);font-size:10px">${tot}경기</span>
          <span style="color:${raceColor[b]};font-weight:700">${bRate}% (${bw+tl}승)</span>
        </div>
      </div>`;
    }).join('')}
  </div></div>
  <div class="ssec"><h4>🗺️ 맵별 경기 통계</h4><div class="stats-duo-grid">
    ${mapRank.map(m=>{const rate=m.total===0?0:Math.round(m.w/m.total*100);return`<div class="stats-surface-box" style="min-width:150px;flex:1;max-width:220px">
      <div style="font-weight:800;font-size:13px;margin-bottom:4px">${m.name}</div>
      <div style="font-size:24px;font-weight:800;color:var(--blue)">${m.total}</div>
      <div style="font-size:10px;color:var(--gray-l);margin-bottom:6px">총 경기</div>
      <div style="height:4px;border-radius:2px;background:var(--border);overflow:hidden;margin-bottom:4px"><div style="height:100%;width:${rate}%;background:var(--blue);border-radius:2px"></div></div>
      <div style="font-size:11px;display:flex;justify-content:space-between"><span style="color:var(--red);font-weight:700">${m.w}승</span><span style="color:var(--gray-l)">${rate}%</span><span style="color:var(--blue);font-weight:700">${m.l}패</span></div>
    </div>`;}).join('')||'<p style="color:var(--gray-l)">기록 없음</p>'}
  </div></div>
  <div class="ssec"><h4>🔥 최근 폼 TOP 10 <span style="font-size:12px;color:#db2777;font-weight:600">👩 여자</span></h4>
    <div style="display:flex;flex-direction:column;gap:4px">${formF.map(formRow).join('')||'<p style="color:var(--gray-l)">기록 없음</p>'}</div>
  </div>
  <div class="ssec"><h4>🔥 최근 폼 TOP 10 <span style="font-size:12px;color:#2563eb;font-weight:600">👨 남자</span></h4>
    <div style="display:flex;flex-direction:column;gap:4px">${formM.map(formRow).join('')||'<p style="color:var(--gray-l)">기록 없음</p>'}</div>
  </div>
  <div class="ssec"><h4>🧊 최악 폼 TOP 10 <span style="font-size:12px;color:#db2777;font-weight:600">👩 여자</span> <span style="font-size:11px;color:var(--gray-l);font-weight:400">(연패 중)</span></h4>
    <div style="display:flex;flex-direction:column;gap:4px">${worstFormF.map(formRow).join('')||'<p style="color:var(--gray-l)">연패 중인 선수 없음</p>'}</div>
  </div>
  <div class="ssec"><h4>🧊 최악 폼 TOP 10 <span style="font-size:12px;color:#2563eb;font-weight:600">👨 남자</span> <span style="font-size:11px;color:var(--gray-l);font-weight:400">(연패 중)</span></h4>
    <div style="display:flex;flex-direction:column;gap:4px">${worstFormM.map(formRow).join('')||'<p style="color:var(--gray-l)">연패 중인 선수 없음</p>'}</div>
  </div>
  </div>`;
}

/* ══════════════════════════════════════
   2. ELO 랭킹 변동 그래프
══════════════════════════════════════ */
var _eloSelPlayer='';
