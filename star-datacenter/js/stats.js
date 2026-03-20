/* ─── 캐시 (save() → su_last_save_time 변경 시 자동 무효화) ─── */
let _sCacheTime='', _sCache={};
function _scGet(sub){ const t=localStorage.getItem('su_last_save_time')||'0'; if(t!==_sCacheTime){_sCache={};_sCacheTime=t;} return _sCache[sub]||null; }
function _scSet(sub,html){ _sCache[sub]=html; return html; }

function rStats(C,T){
  T.textContent='📊 통계';
  // UX 3: 마지막 방문 서브탭 복원
  const _savedSub=localStorage.getItem('su_statsSub');
  if(_savedSub&&statsSub==='overview'&&_savedSub!=='overview') statsSub=_savedSub;
  const _statsGroups=[
    {label:'🏆 개인',tabs:[
      {id:'overview',lbl:'🏛️ 종합'},
      {id:'elo',lbl:'📈 ELO 그래프'},
      {id:'growth',lbl:'📊 성장 곡선'},
      {id:'award',lbl:'🏆 이달의 선수'},
      {id:'records',lbl:'🎖️ 최다 기록'},
      {id:'killer',lbl:'🗡️ 킬러/피해자'},
      {id:'clutch',lbl:'⚡ 클러치 지수'},
      {id:'streakhist',lbl:'🔥 역대 연속 기록'},
    ]},
    {label:'🏛️ 대학',tabs:[
      {id:'radar',lbl:'🕸️ 대학 레이더'},
      {id:'univmatrix',lbl:'🏛️ 대학 매트릭스'},
      {id:'univmatrix2',lbl:'🏛️ 대학 매트릭스+'},
    ]},
    {label:'📊 경기',tabs:[
      {id:'mismatch',lbl:'⚡ 미스매치'},
      {id:'heatmap',lbl:'📅 활동 히트맵'},
      {id:'tierwin',lbl:'🎯 티어별 승률(개인)'},
      {id:'tiermatch',lbl:'🎖️ 티어별 승률(팀전)'},
      {id:'maprank',lbl:'🗺️ 맵별 특화'},
      {id:'racetrend',lbl:'🔬 종족 트렌드'},
      {id:'seasonal',lbl:'📅 요일/시즌 승률'},
    ]},
    {label:'🔍 기록실',tabs:[
      {id:'sharecard',lbl:'🎴 공유 카드'},
      {id:'advsearch',lbl:'🔍 고급 검색'},
      ...(isLoggedIn?[{id:'csvexport',lbl:'📥 CSV 내보내기'}]:[]),
    ]},
  ];
  let h=`<div class="no-export" style="margin-bottom:12px">`;
  _statsGroups.forEach(grp=>{
    h+=`<div style="margin-bottom:4px;display:flex;align-items:center;flex-wrap:wrap;gap:3px">
      <span style="font-size:10px;font-weight:800;color:var(--gray-l);min-width:52px;white-space:nowrap">${grp.label}</span>`;
    grp.tabs.forEach(o=>{
      h+=`<button class="stab ${statsSub===o.id?'on':''}" onclick="statsSub='${o.id}';localStorage.setItem('su_statsSub','${o.id}');render()" style="margin:1px 1px">${o.lbl}</button>`;
    });
    h+=`</div>`;
  });
  h+=`</div>`;
  // 캐시 가능한 순수 탭 (선택 상태 없음): 데이터 변경 시에만 재계산
  const _CACHEABLE=['overview','records','killer','clutch','streakhist','mismatch','heatmap','tierwin','tiermatch','maprank','univmatrix','univmatrix2','seasonal','award'];
  function _cached(sub, fn){ const c=_scGet(sub); return c||_scSet(sub,fn()); }
  if(statsSub==='overview')    h+=_cached('overview', statsOverviewHTML);
  else if(statsSub==='elo')    h+=statsEloHTML();         // 선수 선택 상태 있음
  else if(statsSub==='growth') h+=statsGrowthHTML();      // 선수 선택 상태 있음
  else if(statsSub==='award')  h+=_cached('award', statsAwardHTML);
  else if(statsSub==='records')h+=_cached('records', statsRecordsHTML);
  else if(statsSub==='radar')  h+=statsRadarHTML();       // 차트 초기화 필요
  else if(statsSub==='mismatch')h+=_cached('mismatch', statsMismatchHTML);
  else if(statsSub==='heatmap')  h+=_cached('heatmap', statsHeatmapHTML);
  else if(statsSub==='tierwin')  h+=_cached('tierwin', statsTierWinHTML);
  else if(statsSub==='maprank')  h+=_cached('maprank', statsMapRankHTML);
  else if(statsSub==='univmatrix')h+=_cached('univmatrix', statsUnivMatrixHTML);
  else if(statsSub==='racetrend')h+=statsRaceTrendHTML(); // 차트 초기화 필요
  else if(statsSub==='csvexport')h+=statsCsvExportHTML();
  else if(statsSub==='sharecard')h+=statsShareCardHTML();
  else if(statsSub==='advsearch')h+=statsAdvSearchHTML(); // 검색 필터 상태 있음
  else if(statsSub==='killer')   h+=_cached('killer', statsKillerHTML);
  else if(statsSub==='seasonal') h+=_cached('seasonal', statsSeasonalHTML);
  else if(statsSub==='clutch')   h+=_cached('clutch', statsClutchHTML);
  else if(statsSub==='streakhist')h+=_cached('streakhist', statsStreakHistHTML);
  else if(statsSub==='tiermatch') h+=_cached('tiermatch', statsTierMatchHTML);
  else if(statsSub==='univmatrix2')h+=_cached('univmatrix2', statsUnivMatrix2HTML);
  C.innerHTML=h;
  // 서브탭별 후처리
  if(statsSub==='elo')         initEloChart();
  else if(statsSub==='growth') initGrowthChart();
  else if(statsSub==='radar')  initRadarChart();
  else if(statsSub==='racetrend') initRaceTrendChart();
}

/* ─── 공통 유틸 ─── */
let _sProIds=null, _sProIdsTime='';
function statsProMatchIds(){
  const t=localStorage.getItem('su_last_save_time')||'0';
  if(t!==_sProIdsTime){_sProIds=null;_sProIdsTime=t;}
  if(_sProIds)return _sProIds;
  _sProIds=new Set(proM.map(m=>m._id).filter(Boolean));
  return _sProIds;
}
function statsNonProHist(p){const s=statsProMatchIds();return(p.history||[]).filter(h=>!s.has(h.matchId));}

/* ══════════════════════════════════════
   1. 종합 (기존 내용 유지)
══════════════════════════════════════ */
function statsOverviewHTML(){
  const proMatchIds=statsProMatchIds();
  const univStats={};
  players.forEach(p=>{
    if(!univStats[p.univ])univStats[p.univ]={w:0,l:0,color:gc(p.univ)};
    const h=statsNonProHist(p);
    univStats[p.univ].w+=h.filter(x=>x.result==='승').length;
    univStats[p.univ].l+=h.filter(x=>x.result==='패').length;
  });
  const univRank=Object.entries(univStats)
    .map(([name,s])=>({name,w:s.w,l:s.l,color:s.color,rate:s.w+s.l===0?0:Math.round(s.w/(s.w+s.l)*100)}))
    .sort((a,b)=>b.rate-a.rate||b.w-a.w);

  const rv={T:{T:{w:0,l:0},Z:{w:0,l:0},P:{w:0,l:0}},Z:{T:{w:0,l:0},Z:{w:0,l:0},P:{w:0,l:0}},P:{T:{w:0,l:0},Z:{w:0,l:0},P:{w:0,l:0}}};
  players.forEach(p=>{
    if(!p.history||!p.race)return;
    statsNonProHist(p).forEach(h=>{
      if(!h.oppRace||!rv[p.race]||!rv[p.race][h.oppRace])return;
      if(h.result==='승')rv[p.race][h.oppRace].w++;
      else if(h.result==='패')rv[p.race][h.oppRace].l++;
    });
  });
  const mapStats={};
  players.forEach(p=>{
    (p.history||[]).forEach(h=>{
      if(!h.map||h.map==='-')return;
      if(!mapStats[h.map])mapStats[h.map]={w:0,l:0};
      if(h.result==='승')mapStats[h.map].w++;
      else if(h.result==='패')mapStats[h.map].l++;
    });
  });
  const mapRank=Object.entries(mapStats).map(([name,s])=>({name,w:s.w,l:s.l,total:s.w+s.l})).sort((a,b)=>b.total-a.total);
  function calcFormPlayers(genderFilter, streakFilter){
    // streakFilter: '승' = 연승자만, '패' = 연패자만, undefined = 전체
    return players.filter(p=>(genderFilter?p.gender===genderFilter:true))
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
  function formRow(p,pi){
    const icons=p.form.map(h=>h.result==='승'
      ?'<span style="display:inline-block;width:20px;height:20px;background:var(--green);color:#fff;font-size:10px;font-weight:800;border-radius:4px;text-align:center;line-height:20px">W</span>'
      :'<span style="display:inline-block;width:20px;height:20px;background:var(--red);color:#fff;font-size:10px;font-weight:800;border-radius:4px;text-align:center;line-height:20px">L</span>').join('');
    const sc=p.streak.type==='승'?'var(--green)':'var(--red)';
    const si=p.streak.type==='승'?'🔥':'❄️';
    return`<div style="display:flex;align-items:center;gap:10px;padding:8px 12px;background:var(--white);border:1px solid var(--border);border-radius:8px">
      <span style="font-weight:700;font-size:11px;color:var(--gray-l);min-width:20px;text-align:right">${pi+1}</span>
      ${getPlayerPhotoHTML(p.name,'38px')}
      <span style="font-weight:800;font-size:14px;cursor:pointer;color:var(--blue);min-width:65px" onclick="openPlayerModal('${p.name}')">${p.name}${getStatusIconHTML(p.name)}</span>
      <span style="font-size:11px;color:${gc(p.univ)};font-weight:700;min-width:55px">${p.univ}</span>
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
    <div style="display:flex;flex-direction:column;gap:6px">
      ${univRank.filter(u=>u.w+u.l>0).map((u,i)=>{
        const medal=i===0?'🥇':i===1?'🥈':i===2?'🥉':`${i+1}위`;
        return`<div style="display:flex;align-items:center;gap:10px;padding:8px 12px;background:var(--white);border:1px solid var(--border);border-radius:8px;cursor:pointer" onclick="openUnivModal('${u.name}')">
          <span style="min-width:32px;font-weight:800;font-size:13px">${medal}</span>
          <span class="ubadge" style="background:${u.color};min-width:80px;text-align:center">${u.name}</span>
          <div style="flex:1;background:var(--border2);border-radius:20px;height:14px;overflow:hidden">
            <div style="width:${u.rate}%;background:${u.color};height:100%;border-radius:20px;transition:.3s"></div>
          </div>
          <span style="min-width:50px;text-align:right;font-weight:700;font-size:13px">${u.rate}%</span>
          <span style="color:var(--gray-l);font-size:11px">${u.w}승${u.l}패</span>
        </div>`;
      }).join('')||'<p style="color:var(--gray-l)">경기 기록이 없습니다.</p>'}
    </div>
  </div>
  <div class="ssec"><h4>⚔️ 종족별 상대전적</h4><div style="overflow-x:auto"><table style="min-width:400px">
    <thead><tr><th>내\상대</th>${['T','Z','P'].map(r=>`<th>${raceEmoji[r]} ${raceName[r]}</th>`).join('')}</tr></thead>
    <tbody>${['T','Z','P'].map(r=>`<tr><td style="font-weight:700;color:${raceColor[r]}">${raceEmoji[r]} ${raceName[r]}</td>${['T','Z','P'].map(o=>{
      const s=rv[r][o];const rate=s.w+s.l===0?'-':Math.round(s.w/(s.w+s.l)*100)+'%';
      const bg=r===o?'background:var(--border2)':s.w>s.l?'background:#16a34a22':s.w<s.l?'background:#dc262622':'';
      return`<td style="${bg}">${r===o?'<span style="color:var(--gray-l)">-</span>':`<span style="font-weight:700">${rate}</span><br><span style="font-size:10px;color:var(--gray-l)">${s.w}승${s.l}패</span>`}</td>`;
    }).join('')}</tr>`).join('')}</tbody>
  </table></div></div>
  <div class="ssec"><h4>🗺️ 맵별 경기 통계</h4><div style="display:flex;flex-wrap:wrap;gap:8px">
    ${mapRank.map(m=>{const rate=m.total===0?0:Math.round(m.w/m.total*100);return`<div style="background:var(--white);border:1px solid var(--border);border-radius:10px;padding:12px 16px;min-width:150px;flex:1;max-width:220px">
      <div style="font-weight:800;font-size:13px;margin-bottom:4px">${m.name}</div>
      <div style="font-size:24px;font-weight:800;color:var(--blue)">${m.total}</div>
      <div style="font-size:10px;color:var(--gray-l);margin-bottom:6px">총 경기</div>
      <div style="height:4px;border-radius:2px;background:var(--border);overflow:hidden;margin-bottom:4px"><div style="height:100%;width:${rate}%;background:var(--blue);border-radius:2px"></div></div>
      <div style="font-size:11px;display:flex;justify-content:space-between"><span style="color:var(--green);font-weight:700">${m.w}승</span><span style="color:var(--gray-l)">${rate}%</span><span style="color:var(--red);font-weight:700">${m.l}패</span></div>
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
let _eloSelPlayer='';
function eloSearchFilter(q){
  const d=document.getElementById('elo-search-drop');if(!d)return;
  const items=d.querySelectorAll('.sitem');
  items.forEach(el=>{el.style.display=el.textContent.toLowerCase().includes(q.toLowerCase())?'':'none';});
}
function statsEloHTML(){
  const allWithHist=players.filter(p=>p.history&&p.history.length>0)
    .sort((a,b)=>(b.elo||ELO_DEFAULT)-(a.elo||ELO_DEFAULT));
  const top20=allWithHist.slice(0,30);
  if(!_eloSelPlayer&&allWithHist.length)_eloSelPlayer=allWithHist[0].name;
  const selP=players.find(p=>p.name===_eloSelPlayer);
  return`<div style="display:flex;flex-direction:column;gap:16px">
  <div class="ssec" id="stats-elo-sec">
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;flex-wrap:wrap">
      <h4 style="margin:0">📈 ELO 랭킹 변동 그래프</h4>
      <div style="position:relative">
        <input id="elo-search-input" type="text" placeholder="🔍 선수 이름 검색..."
          value="${_eloSelPlayer}"
          style="font-size:12px;padding:5px 10px;border:1px solid var(--border2);border-radius:8px;width:200px"
          oninput="eloSearchFilter(this.value)"
          onfocus="document.getElementById('elo-search-drop').style.display='block'"
          onblur="setTimeout(()=>{const d=document.getElementById('elo-search-drop');if(d)d.style.display='none'},200)"
          onkeydown="if(event.key==='Enter'){const q=this.value.trim();const m=players.filter(p=>p.history&&p.history.length>0&&p.name.includes(q));if(m.length===1){_eloSelPlayer=m[0].name;this.value=m[0].name;document.getElementById('elo-search-drop').style.display='none';initEloChart();}else if(q&&m.length>0){_eloSelPlayer=m[0].name;this.value=m[0].name;document.getElementById('elo-search-drop').style.display='none';initEloChart();}}">
        <div id="elo-search-drop" style="display:none;position:absolute;top:34px;left:0;background:var(--white);border:1px solid var(--border2);border-radius:8px;z-index:300;max-height:200px;overflow-y:auto;width:260px;box-shadow:var(--sh2)">
          ${allWithHist.map(p=>`<div class="sitem" onmousedown="_eloSelPlayer='${p.name.replace(/'/g,"\'")}';document.getElementById('elo-search-input').value='${p.name.replace(/'/g,"\'")}';document.getElementById('elo-search-drop').style.display='none';initEloChart()">
            <b>${p.name}</b> <span style="color:${gc(p.univ)};font-size:11px">${p.univ}</span> <span style="color:var(--gray-l);font-size:10px">ELO ${p.elo||1200}</span>
          </div>`).join('')}
        </div>
      </div>
      ${selP?`<span class="ubadge" style="background:${gc(selP.univ)}">${selP.univ}</span>`:''}
      <button class="btn-capture btn-xs no-export" style="margin-left:auto" onclick="captureSection('stats-elo-sec','elo_ranking')">📷 이미지 저장</button>
    </div>
    <canvas id="eloChart" style="width:100%;max-height:300px"></canvas>
    <div id="eloRankTable" style="margin-top:16px"></div>
  </div>
  <div class="ssec">
    <h4>🏅 현재 ELO 랭킹 TOP 20</h4>
    <div style="display:flex;flex-direction:column;gap:4px;margin-top:8px">
      ${top20.map((p,i)=>{
        const elo=p.elo||1200;
        const eloColor=elo>=1400?'#7c3aed':elo>=1300?'#d97706':elo>=1200?'var(--green)':'var(--red)';
        const badge=i===0?'🥇':i===1?'🥈':i===2?'🥉':`${i+1}`;
        const bar=Math.min(100,Math.max(0,((elo-900)/800)*100));
        return`<div style="display:flex;align-items:center;gap:8px;padding:7px 12px;background:var(--white);border:1px solid var(--border);border-radius:8px;cursor:pointer" onclick="_eloSelPlayer='${p.name}';initEloChart()">
          <span style="min-width:28px;font-weight:800;font-size:12px">${badge}</span>
          <span style="font-weight:800;font-size:13px;color:var(--blue);min-width:70px">${p.name}</span>
          <span style="font-size:11px;color:${gc(p.univ)};font-weight:700;min-width:60px">${p.univ}</span>
          <div style="flex:1;background:var(--border2);border-radius:20px;height:10px;overflow:hidden">
            <div style="width:${bar}%;background:${eloColor};height:100%;border-radius:20px"></div>
          </div>
          <span style="font-weight:800;font-size:14px;color:${eloColor};min-width:48px;text-align:right">${elo}</span>
          ${(()=>{const now=new Date();const ym=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;const d=(p.history||[]).filter(h=>h.date&&h.date.startsWith(ym)&&h.eloDelta!=null).reduce((s,h)=>s+(h.eloDelta||0),0);return d!==0?`<span style="font-size:10px;font-weight:700;color:${d>0?'#16a34a':'#dc2626'};background:${d>0?'#dcfce7':'#fee2e2'};padding:1px 6px;border-radius:4px">${d>0?'+':''}${d}</span>`:'';})()} 
        </div>`;
      }).join('')}
    </div>
  </div>
  </div>`;
}
function initEloChart(){
  const canvas=document.getElementById('eloChart');
  if(!canvas)return;
  const p=players.find(x=>x.name===_eloSelPlayer);
  if(!p||!p.history||!p.history.length){canvas.style.display='none';return;}
  canvas.style.display='block';
  const hist=[...p.history].reverse();
  // ELO 재구성: eloAfter 필드 사용
  const pts=[];let elo=ELO_DEFAULT;
  hist.forEach((h,i)=>{
    if(h.eloAfter!=null)pts.push({i,elo:h.eloAfter,date:h.date||'',result:h.result,opp:h.opp||'',eloDelta:h.eloDelta||0});
    else{elo+=(h.eloDelta||0);pts.push({i,elo,date:h.date||'',result:h.result,opp:h.opp||'',eloDelta:h.eloDelta||0});}
  });
  if(!pts.length)return;
  const ctx=canvas.getContext('2d');
  const W=canvas.offsetWidth||600;const H=280;
  canvas.width=W;canvas.height=H;
  const pad={t:20,r:20,b:50,l:55};
  const minE=Math.min(...pts.map(x=>x.elo))-30;
  const maxE=Math.max(...pts.map(x=>x.elo))+30;
  const mapX=i=>(i/(pts.length-1||1))*(W-pad.l-pad.r)+pad.l;
  const mapY=e=>H-pad.b-((e-minE)/(maxE-minE||1))*(H-pad.t-pad.b);
  ctx.clearRect(0,0,W,H);
  // 배경 그리드
  ctx.strokeStyle='#e2e8f0';ctx.lineWidth=1;
  for(let g=0;g<=4;g++){
    const y=pad.t+g*(H-pad.t-pad.b)/4;
    ctx.beginPath();ctx.moveTo(pad.l,y);ctx.lineTo(W-pad.r,y);ctx.stroke();
    const val=Math.round(maxE-g*(maxE-minE)/4);
    ctx.fillStyle='#94a3b8';ctx.font='10px sans-serif';ctx.textAlign='right';
    ctx.fillText(val,pad.l-4,y+4);
  }
  // 1200 기준선
  const baseY=mapY(1200);
  ctx.strokeStyle='#cbd5e1';ctx.setLineDash([4,4]);ctx.lineWidth=1;
  ctx.beginPath();ctx.moveTo(pad.l,baseY);ctx.lineTo(W-pad.r,baseY);ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle='#94a3b8';ctx.font='9px sans-serif';ctx.textAlign='left';
  ctx.fillText('1200',pad.l+2,baseY-3);
  // 그라디언트 채우기
  const grad=ctx.createLinearGradient(0,pad.t,0,H-pad.b);
  grad.addColorStop(0,'rgba(37,99,235,0.25)');grad.addColorStop(1,'rgba(37,99,235,0)');
  ctx.beginPath();ctx.moveTo(mapX(0),mapY(pts[0].elo));
  pts.forEach(pt=>ctx.lineTo(mapX(pt.i),mapY(pt.elo)));
  ctx.lineTo(mapX(pts.length-1),H-pad.b);ctx.lineTo(mapX(0),H-pad.b);
  ctx.closePath();ctx.fillStyle=grad;ctx.fill();
  // 선
  ctx.beginPath();ctx.strokeStyle='#2563eb';ctx.lineWidth=2.5;
  ctx.moveTo(mapX(0),mapY(pts[0].elo));
  pts.forEach(pt=>ctx.lineTo(mapX(pt.i),mapY(pt.elo)));
  ctx.stroke();
  // 점
  pts.forEach(pt=>{
    ctx.beginPath();
    ctx.arc(mapX(pt.i),mapY(pt.elo),4,0,Math.PI*2);
    ctx.fillStyle=pt.result==='승'?'#16a34a':'#dc2626';
    ctx.fill();ctx.strokeStyle='#fff';ctx.lineWidth=1.5;ctx.stroke();
  });
  // X축 날짜 (첫/마지막)
  ctx.fillStyle='#64748b';ctx.font='10px sans-serif';ctx.textAlign='center';
  if(pts.length>0)ctx.fillText(pts[0].date.slice(5)||'',mapX(0),H-pad.b+16);
  if(pts.length>1)ctx.fillText(pts[pts.length-1].date.slice(5)||'',mapX(pts.length-1),H-pad.b+16);
  // 제목
  ctx.fillStyle='#1e293b';ctx.font='bold 13px sans-serif';ctx.textAlign='left';
  ctx.fillText(`${p.name} ELO 변동 (현재: ${p.elo||1200})`,pad.l,14);
  // 검색 인풋 동기화
  const inp=document.getElementById('elo-search-input');
  if(inp)inp.value=_eloSelPlayer;
  // 호버 툴팁
  let _eloTip=document.getElementById('eloChartTip');
  if(!_eloTip){
    _eloTip=document.createElement('div');
    _eloTip.id='eloChartTip';
    _eloTip.style.cssText='position:fixed;display:none;background:rgba(15,23,42,.92);color:#fff;font-size:11px;padding:7px 11px;border-radius:9px;pointer-events:none;white-space:nowrap;z-index:9999;box-shadow:0 4px 16px rgba(0,0,0,.3);line-height:1.6';
    document.body.appendChild(_eloTip);
  }
  canvas.onmousemove=e=>{
    const rect=canvas.getBoundingClientRect();
    const mx=(e.clientX-rect.left)*(W/rect.width);
    let ci=0,md=Infinity;
    pts.forEach((pt,i)=>{const d=Math.abs(mapX(pt.i)-mx);if(d<md){md=d;ci=i;}});
    if(md*(rect.width/W)<32){
      const pt=pts[ci];const sign=(pt.eloDelta||0)>=0?'+':'';
      _eloTip.innerHTML=`<b>${pt.opp||'?'}</b> <span style="color:${pt.result==='승'?'#86efac':'#fca5a5'}">${pt.result}</span><br>${sign}${pt.eloDelta||0} → <b>${pt.elo}</b><br><span style="color:#94a3b8">${pt.date}</span>`;
      _eloTip.style.display='block';
      _eloTip.style.left=(e.clientX>window.innerWidth/2?e.clientX-145:e.clientX+12)+'px';
      _eloTip.style.top=(e.clientY-50)+'px';
    } else _eloTip.style.display='none';
  };
  canvas.onmouseleave=()=>{if(_eloTip)_eloTip.style.display='none';};
}

/* ══════════════════════════════════════
   3. 선수 성장 곡선
══════════════════════════════════════ */
let _growthSel='';
function growthSearchFilter(q){
  const d=document.getElementById('growth-search-drop');if(!d)return;
  d.querySelectorAll('.sitem').forEach(el=>{el.style.display=el.textContent.toLowerCase().includes(q.toLowerCase())?'':'none';});
}
function statsGrowthHTML(){
  const cands=players.filter(p=>p.history&&p.history.length>=2)
    .sort((a,b)=>b.history.length-a.history.length);
  if(!_growthSel&&cands.length)_growthSel=cands[0].name;
  const selP=players.find(p=>p.name===_growthSel);
  return`<div class="ssec" id="stats-growth-sec">
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;flex-wrap:wrap">
      <h4 style="margin:0">📊 선수 성장 곡선</h4>
      <div style="position:relative">
        <input id="growth-search-input" type="text" placeholder="🔍 선수 이름 검색..."
          value="${_growthSel}"
          style="font-size:12px;padding:5px 10px;border:1px solid var(--border2);border-radius:8px;width:200px"
          oninput="growthSearchFilter(this.value)"
          onfocus="document.getElementById('growth-search-drop').style.display='block'"
          onblur="setTimeout(()=>{const d=document.getElementById('growth-search-drop');if(d)d.style.display='none'},200)"
          onkeydown="if(event.key==='Enter'){const q=this.value.trim();const m=players.filter(p=>p.history&&p.history.length>=2&&p.name.includes(q));if(m.length>0){_growthSel=m[0].name;this.value=m[0].name;document.getElementById('growth-search-drop').style.display='none';initGrowthChart();}}">
        <div id="growth-search-drop" style="display:none;position:absolute;top:34px;left:0;background:var(--white);border:1px solid var(--border2);border-radius:8px;z-index:300;max-height:200px;overflow-y:auto;width:260px;box-shadow:var(--sh2)">
          ${cands.map(p=>`<div class="sitem" onmousedown="_growthSel='${p.name.replace(/'/g,"\'")}';document.getElementById('growth-search-input').value='${p.name.replace(/'/g,"\'")}';document.getElementById('growth-search-drop').style.display='none';initGrowthChart()">
            <b>${p.name}</b> <span style="color:${gc(p.univ)};font-size:11px">${p.univ}</span> <span style="color:var(--gray-l);font-size:10px">${p.history.length}경기</span>
          </div>`).join('')}
        </div>
      </div>
      ${selP?`<span class="ubadge" style="background:${gc(selP.univ)}">${selP.univ}</span>`:''}
      <button class="btn-capture btn-xs no-export" style="margin-left:auto" onclick="captureSection('stats-growth-sec','growth_chart')">📷 이미지 저장</button>
    </div>
    <canvas id="growthChart" style="width:100%;max-height:300px"></canvas>
    <div id="growthInfo" style="margin-top:14px;display:flex;gap:10px;flex-wrap:wrap"></div>
  </div>`;
}
function initGrowthChart(){
  const canvas=document.getElementById('growthChart');
  if(!canvas)return;
  const p=players.find(x=>x.name===_growthSel);
  if(!p||!p.history||p.history.length<2){canvas.style.display='none';return;}
  const hist=[...p.history].reverse();
  // 누적 승률 계산
  const pts=[];let w=0,total=0;
  hist.forEach((h,i)=>{
    total++;if(h.result==='승')w++;
    pts.push({i,rate:Math.round(w/total*100),w,l:total-w,date:h.date||''});
  });
  const W=canvas.offsetWidth||600;const H=260;
  canvas.width=W;canvas.height=H;
  const pad={t:20,r:20,b:45,l:45};
  const mapX=i=>(i/(pts.length-1||1))*(W-pad.l-pad.r)+pad.l;
  const mapY=r=>H-pad.b-(r/100)*(H-pad.t-pad.b);
  const ctx=canvas.getContext('2d');
  ctx.clearRect(0,0,W,H);
  // 그리드
  [0,25,50,75,100].forEach(g=>{
    const y=mapY(g);
    ctx.strokeStyle='#e2e8f0';ctx.lineWidth=1;ctx.setLineDash(g===50?[4,4]:[]);
    ctx.beginPath();ctx.moveTo(pad.l,y);ctx.lineTo(W-pad.r,y);ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle='#94a3b8';ctx.font='10px sans-serif';ctx.textAlign='right';
    ctx.fillText(g+'%',pad.l-4,y+4);
  });
  ctx.setLineDash([]);
  // 50% 기준선 강조
  const baseY=mapY(50);
  ctx.fillStyle='#64748b';ctx.font='9px sans-serif';ctx.textAlign='left';
  ctx.fillText('50%',pad.l+2,baseY-3);
  // 채우기
  const col=pts[pts.length-1].rate>=50?'rgba(22,163,74,0.2)':'rgba(220,38,38,0.2)';
  const lineCol=pts[pts.length-1].rate>=50?'#16a34a':'#dc2626';
  ctx.beginPath();ctx.moveTo(mapX(0),mapY(pts[0].rate));
  pts.forEach(pt=>ctx.lineTo(mapX(pt.i),mapY(pt.rate)));
  ctx.lineTo(mapX(pts.length-1),H-pad.b);ctx.lineTo(mapX(0),H-pad.b);
  ctx.closePath();ctx.fillStyle=col;ctx.fill();
  // 선
  ctx.beginPath();ctx.strokeStyle=lineCol;ctx.lineWidth=2.5;ctx.setLineDash([]);
  ctx.moveTo(mapX(0),mapY(pts[0].rate));
  pts.forEach(pt=>ctx.lineTo(mapX(pt.i),mapY(pt.rate)));
  ctx.stroke();
  // 날짜 레이블
  ctx.fillStyle='#64748b';ctx.font='10px sans-serif';ctx.textAlign='center';
  if(pts[0].date)ctx.fillText(pts[0].date.slice(5)||'',mapX(0),H-pad.b+14);
  if(pts[pts.length-1].date)ctx.fillText(pts[pts.length-1].date.slice(5)||'',mapX(pts.length-1),H-pad.b+14);
  ctx.fillStyle='#1e293b';ctx.font='bold 13px sans-serif';ctx.textAlign='left';
  ctx.fillText(`${p.name} 누적 승률 추이`,pad.l,14);
  // 인포
  const info=document.getElementById('growthInfo');
  if(info){
    const last=pts[pts.length-1];
    const early=pts.slice(0,Math.ceil(pts.length/3));
    const late=pts.slice(Math.floor(pts.length*2/3));
    const earlyRate=early.length?early[early.length-1].rate:0;
    const lateRate=late.length?late[late.length-1].rate:0;
    const trend=lateRate-earlyRate;
    info.innerHTML=`
      <div style="background:var(--blue-l);border:1px solid var(--blue-ll);border-radius:10px;padding:12px 16px;flex:1;min-width:120px;text-align:center">
        <div style="font-size:10px;color:var(--blue);font-weight:700;margin-bottom:4px">현재 승률</div>
        <div style="font-size:22px;font-weight:900;color:var(--blue)">${last.rate}%</div>
        <div style="font-size:11px;color:var(--gray-l)">${last.w}승 ${last.l}패</div>
      </div>
      <div style="background:${trend>=0?'#f0fdf4':'#fef2f2'};border:1px solid ${trend>=0?'#bbf7d0':'#fecaca'};border-radius:10px;padding:12px 16px;flex:1;min-width:120px;text-align:center">
        <div style="font-size:10px;color:${trend>=0?'var(--green)':'var(--red)'};font-weight:700;margin-bottom:4px">성장 추세</div>
        <div style="font-size:22px;font-weight:900;color:${trend>=0?'var(--green)':'var(--red)'}">${trend>=0?'📈':'📉'} ${trend>0?'+':''}${trend}%</div>
        <div style="font-size:11px;color:var(--gray-l)">초반→후반 변화</div>
      </div>
      <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:10px;padding:12px 16px;flex:1;min-width:120px;text-align:center">
        <div style="font-size:10px;color:var(--gold);font-weight:700;margin-bottom:4px">총 경기</div>
        <div style="font-size:22px;font-weight:900;color:var(--gold)">${last.w+last.l}</div>
        <div style="font-size:11px;color:var(--gray-l)">경기 기록</div>
      </div>`;
  }
  const inp2=document.getElementById('growth-search-input');
  if(inp2)inp2.value=_growthSel;
}

/* ══════════════════════════════════════
   4. 이달의 선수
══════════════════════════════════════ */
function statsAwardHTML(){
  const now=new Date();
  const ym=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;
  const prevYm=now.getMonth()===0
    ?`${now.getFullYear()-1}-12`
    :`${now.getFullYear()}-${String(now.getMonth()).padStart(2,'0')}`;
  const proIds=statsProMatchIds();
  function calcMonth(ym2){
    return players.map(p=>{
      // 프로리그 제외한 히스토리만 필터링
      const mh=statsNonProHist(p).filter(h=>(h.date||'').startsWith(ym2));
      const w=mh.filter(h=>h.result==='승').length;
      const l=mh.filter(h=>h.result==='패').length;
      const tot=w+l;
      return{...p,mw:w,ml:l,mt:tot,mrate:tot?Math.round(w/tot*100):0};
    }).filter(p=>p.mt>0).sort((a,b)=>b.mw-a.mw||b.mrate-a.mrate);
  }
  const curList=calcMonth(ym);
  const prevList=calcMonth(prevYm);
  const [y,m]=ym.split('-');
  const [py,pm]=prevYm.split('-');
  function awardCard(title,p,extra='',color='#2563eb'){
    if(!p)return`<div style="background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:24px;text-align:center;flex:1;min-width:200px"><div style="font-size:28px;margin-bottom:8px">🏆</div><div style="color:var(--gray-l)">기록 없음</div></div>`;
    const univColor=gc(p.univ);
    // 대학 아이콘 (gUI 사용 - UNIV_ICONS 또는 univCfg.icon 우선)
    const univIconUrl=UNIV_ICONS[p.univ]||(univCfg.find(x=>x.name===p.univ)||{}).icon||'';
    // 아이콘: URL 있으면 이미지, 없으면 대학명 첫 글자 표시
    const univIconInner=univIconUrl
      ? `<img src="${univIconUrl}" style="width:32px;height:32px;object-fit:contain" onerror="this.outerHTML='<span style=font-size:16px;font-weight:900;color:white>${p.univ[0]||'?'}</span>'">`
      : `<span style="font-size:18px;font-weight:900;color:#fff;font-family:Noto Sans KR,sans-serif">${p.univ[0]||'?'}</span>`;
    return`<div style="background:linear-gradient(135deg,${color}15,${color}08);border:2px solid ${color}44;border-radius:14px;padding:20px;flex:1;min-width:200px;cursor:pointer" onclick="openPlayerModal('${p.name}')">
      <div style="font-size:11px;font-weight:700;color:${color};margin-bottom:8px;letter-spacing:.5px">${title}</div>
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">
        ${p.photo?`<img src="${p.photo}" style="width:44px;height:44px;border-radius:50%;object-fit:cover;border:2px solid ${univColor};flex-shrink:0;box-shadow:0 2px 8px ${univColor}55" onerror="this.style.display='none'">`:`<div style="width:44px;height:44px;border-radius:50%;background:${univColor};display:flex;align-items:center;justify-content:center;flex-shrink:0;box-shadow:0 2px 8px ${univColor}55;overflow:hidden">${univIconInner}</div>`}
        <div style="min-width:0">
          <div style="font-weight:800;font-size:16px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${p.name}</div>
          <div style="display:flex;align-items:center;gap:4px;margin-top:3px;flex-wrap:wrap">
            <span style="display:inline-flex;align-items:center;gap:3px;background:${univColor};color:#fff;font-size:10px;padding:2px 7px;border-radius:4px;font-weight:700">${gUI(p.univ,'0.85em')}${p.univ}</span>
            <span style="font-size:10px;color:var(--gray-l)">${getTierLabel(p.tier||'-')}</span>
          </div>
        </div>
      </div>
      <div style="display:flex;gap:8px;font-size:12px;flex-wrap:wrap">
        <span style="background:var(--green);color:#fff;padding:2px 8px;border-radius:6px;font-weight:700">${p.mw}승</span>
        <span style="background:var(--red);color:#fff;padding:2px 8px;border-radius:6px;font-weight:700">${p.ml}패</span>
        <span style="background:${color};color:#fff;padding:2px 8px;border-radius:6px;font-weight:700">${p.mrate}%</span>
      </div>
      ${extra?`<div style="margin-top:8px;font-size:11px;color:${color};font-weight:600">${extra}</div>`:''}
    </div>`;
  }
  const mostWin=curList[0]||null;
  const highRate=curList.filter(p=>p.mt>=3).sort((a,b)=>b.mrate-a.mrate)[0]||null;
  const mostActive=[...curList].sort((a,b)=>b.mt-a.mt)[0]||null;
  const prevTop=prevList[0];
  return`<div style="display:flex;flex-direction:column;gap:20px">
  <div class="ssec" id="stats-award-sec">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;flex-wrap:wrap;gap:8px">
      <h4 style="margin:0">🏆 이달의 선수 <span style="font-size:12px;color:var(--gray-l);font-weight:400">${y}년 ${m}월</span> <span style="font-size:11px;color:var(--gray-l);font-weight:400">(프로리그 제외)</span></h4>
      <button class="btn-capture btn-xs no-export" onclick="captureSection('stats-award-sec','award')">📷 이미지 저장</button>
    </div>
    <div style="display:flex;gap:12px;flex-wrap:wrap">
      ${awardCard('👑 이달 최다승',mostWin,'이번 달 가장 많은 승리!','#d97706')}
      ${awardCard('🎯 이달 최고 승률',highRate,'(3경기 이상)','#16a34a')}
      ${awardCard('⚡ 이달 최다 경기',mostActive,'가장 활발하게 뛰었어요','#7c3aed')}
    </div>
  </div>
  <div class="ssec">
    <h4 style="margin-bottom:14px">📅 지난달 TOP <span style="font-size:12px;color:var(--gray-l);font-weight:400">${py}년 ${pm}월</span></h4>
    <div style="display:flex;gap:12px;flex-wrap:wrap">
      ${awardCard('🥇 지난달 1위',prevTop,'','#2563eb')}
      ${prevList[1]?awardCard('🥈 지난달 2위',prevList[1],'','#64748b'):''}
      ${prevList[2]?awardCard('🥉 지난달 3위',prevList[2],'','#92400e'):''}
    </div>
  </div>
  <div class="ssec">
    <h4 style="margin-bottom:10px">📋 이달 전체 순위 <span style="font-size:12px;color:var(--gray-l);font-weight:400">${y}년 ${m}월</span></h4>
    ${curList.length===0?'<p style="color:var(--gray-l)">이달 경기 기록이 없습니다.</p>':`
    <table><thead><tr><th>순위</th><th>선수</th><th>대학</th><th>티어</th><th>승</th><th>패</th><th>승률</th><th>경기수</th></tr></thead><tbody>
    ${[...curList].sort((a,b)=>b.mw-a.mw||b.mrate-a.mrate).map((p,i)=>`<tr>
      <td>${i===0?'🥇':i===1?'🥈':i===2?'🥉':i+1+'위'}</td>
      <td style="cursor:pointer;color:var(--blue);font-weight:700" onclick="openPlayerModal('${p.name}')">${p.name}</td>
      <td><span class="ubadge" style="background:${gc(p.univ)}">${p.univ}</span></td>
      <td>${p.tier||'-'}</td>
      <td class="wt">${p.mw}</td><td class="lt">${p.ml}</td>
      <td style="font-weight:700;color:${p.mrate>=50?'var(--green)':'var(--red)'}">${p.mrate}%</td>
      <td>${p.mt}</td>
    </tr>`).join('')}
    </tbody></table>`}
  </div></div>`;
}

/* ══════════════════════════════════════
   5. 최다 기록 보유자
══════════════════════════════════════ */
function statsRecordsHTML(){
  if(!players.length)return`<div class="ssec"><p style="color:var(--gray-l)">선수 데이터가 없습니다.</p></div>`;
  const proIds=statsProMatchIds();
  const withStats=players.map(p=>{
    const h=statsNonProHist(p);
    const ph=(p.history||[]).filter(x=>proIds.has(x.matchId));
    const w=h.filter(x=>x.result==='승').length;
    const l=h.filter(x=>x.result==='패').length;
    const tot=w+l;
    // 최장 연승 계산 (오래된 순으로 반전 후 계산)
    let maxStreak=0,cur=0,lastRes='';
    [...h].reverse().forEach(x=>{if(x.result===lastRes){cur++;}else{cur=1;lastRes=x.result;}if(lastRes==='승')maxStreak=Math.max(maxStreak,cur);});
    // 현재 연승
    let curStreak=0,curStreakType='';
    for(const x of h){if(!curStreakType||x.result===curStreakType){curStreak++;curStreakType=x.result;}else break;}
    return{...p,w,l,tot,rate:tot?Math.round(w/tot*100):0,maxStreak,
      curStreak,curStreakType,elo:p.elo||ELO_DEFAULT,proGames:ph.length,points:p.points||0};
  }).filter(p=>p.tot>0||p.proGames>0);
  if(!withStats.length)return`<div class="ssec"><p style="color:var(--gray-l)">기록이 없습니다.</p></div>`;
  const cats=[
    {title:'🏆 역대 최다승',icon:'🏆',sort:(a,b)=>b.w-a.w,val:p=>`${p.w}승`,sub:p=>`총 ${p.tot}경기`},
    {title:'📊 역대 최고 승률',icon:'📊',sort:(a,b)=>b.rate-a.rate||b.tot-a.tot,val:p=>`${p.rate}%`,sub:p=>`${p.w}승${p.l}패`,filter:p=>p.tot>=5},
    {title:'⚡ 역대 최다 경기',icon:'⚡',sort:(a,b)=>b.tot-a.tot,val:p=>`${p.tot}경기`,sub:p=>`${p.w}승${p.l}패`},
    {title:'🔥 최장 연승 기록',icon:'🔥',sort:(a,b)=>b.maxStreak-a.maxStreak,val:p=>`${p.maxStreak}연승`,sub:p=>`총 ${p.w}승`},
    {title:'💎 최고 ELO',icon:'💎',sort:(a,b)=>b.elo-a.elo,val:p=>`${p.elo}`,sub:p=>`${p.w}승${p.l}패`},
    {title:'🎯 현재 연승중',icon:'🎯',sort:(a,b)=>b.curStreak-a.curStreak,val:p=>`${p.curStreak}연${p.curStreakType==='승'?'승':'패'}`,sub:p=>`현재 진행중`,filter:p=>p.curStreakType==='승'&&p.curStreak>=2},
  ];
  function recordCard(cat){
    const list=(cat.filter?withStats.filter(cat.filter):withStats).sort(cat.sort).slice(0,5);
    return`<div class="ssec" style="flex:1;min-width:280px">
      <h4 style="margin-bottom:12px">${cat.title}</h4>
      ${list.length===0?`<p style="color:var(--gray-l);font-size:12px">기록 없음</p>`:`
      <div style="display:flex;flex-direction:column;gap:6px">
        ${list.map((p,i)=>{
          const badge=i===0?'🥇':i===1?'🥈':i===2?'🥉':`${i+1}`;
          return`<div style="display:flex;align-items:center;gap:8px;padding:8px 12px;background:var(--white);border:1px solid var(--border);border-radius:8px;cursor:pointer;${i===0?'border-color:'+gc(p.univ)+';box-shadow:0 2px 8px '+gc(p.univ)+'33':''}" onclick="openPlayerModal('${p.name}')">
            <span style="font-size:16px;min-width:24px">${badge}</span>
            ${getPlayerPhotoHTML(p.name,'30px')}
            <div style="flex:1;min-width:0">
              <div style="font-weight:800;font-size:13px">${p.name}${getStatusIconHTML(p.name)} <span style="font-size:10px;color:${gc(p.univ)};font-weight:600">${p.univ}</span></div>
              <div style="font-size:10px;color:var(--gray-l)">${cat.sub(p)}</div>
            </div>
            <span style="font-weight:900;font-size:16px;color:${i===0?gc(p.univ):'var(--text2)'};font-family:'Noto Sans KR',sans-serif">${cat.val(p)}</span>
          </div>`;
        }).join('')}
      </div>`}
    </div>`;
  }
  return`<div id="stats-records-sec"><div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;flex-wrap:wrap;gap:8px">
    <span style="font-size:12px;color:var(--gray-l)">(프로리그 제외)</span>
    <button class="btn-capture btn-xs no-export" onclick="captureSection('stats-records-sec','records')">📷 이미지 저장</button>
  </div>
  <div style="display:flex;flex-wrap:wrap;gap:14px">${cats.map(recordCard).join('')}</div></div>`;
}

/* ══════════════════════════════════════
   6. 대학별 성적 레이더 차트
══════════════════════════════════════ */
let _radarSelUniv='';
function statsRadarHTML(){
  const univs=getAllUnivs().filter(u=>players.some(p=>p.univ===u.name));
  if(!_radarSelUniv&&univs.length)_radarSelUniv=univs[0].name;
  const proIds=statsProMatchIds();
  return`<div style="display:flex;flex-direction:column;gap:16px">
  <div class="ssec" id="stats-radar-sec">
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;flex-wrap:wrap">
      <h4 style="margin:0">🕸️ 대학별 성적 레이더 차트 <span style="font-size:11px;color:var(--gray-l);font-weight:400">(프로리그 제외)</span></h4>
      <select id="radar-sel" style="font-size:12px;padding:4px 10px;border:1px solid var(--border2);border-radius:8px" onchange="_radarSelUniv=this.value;initRadarChart()">
        ${univs.map(u=>`<option value="${u.name}"${_radarSelUniv===u.name?' selected':''}>${u.name}</option>`).join('')}
      </select>
      <button class="btn-capture btn-xs no-export" style="margin-left:auto" onclick="captureSection('stats-radar-sec','radar')">📷 이미지 저장</button>
    </div>
    <div style="display:flex;gap:20px;flex-wrap:wrap;align-items:flex-start">
      <canvas id="radarChart" width="280" height="280" style="flex-shrink:0"></canvas>
      <div id="radarInfo" style="flex:1;min-width:200px"></div>
    </div>
  </div>
  <div class="ssec">
    <h4 style="margin-bottom:12px">📊 전체 대학 비교</h4>
    <div style="overflow-x:auto"><table>
      <thead><tr><th>대학</th><th>선수수</th><th>승률</th><th>ELO평균</th><th>포인트</th><th>활동도</th><th>다양성</th></tr></thead>
      <tbody>
        ${univs.map(u=>{
          const mem=players.filter(p=>p.univ===u.name);
          const scores=calcUnivRadar(u.name,proIds);
          return`<tr style="cursor:pointer" onclick="_radarSelUniv='${u.name}';initRadarChart()">
            <td><span class="ubadge clickable-univ" style="background:${u.color}" onclick="event.stopPropagation();openUnivModal('${u.name}')">${u.name}</span></td>
            <td>${mem.length}명</td>
            <td style="color:${scores.winrate>=50?'var(--green)':'var(--red)'};font-weight:700">${scores.winrate}%</td>
            <td>${scores.avgElo}</td>
            <td class="${scores.pts>=0?'wt':'lt'}">${scores.pts>=0?'+':''}${scores.pts}</td>
            <td>${scores.activity}</td>
            <td>${scores.diversity}종족</td>
          </tr>`;
        }).join('')}
      </tbody>
    </table></div>
  </div></div>`;
}
function calcUnivRadar(univName, proIds){
  const mem=players.filter(p=>p.univ===univName);
  if(!mem.length)return{winrate:0,avgElo:1200,pts:0,activity:0,diversity:0,streak:0};
  const allH=mem.flatMap(p=>statsNonProHist(p));
  const w=allH.filter(h=>h.result==='승').length;
  const l=allH.filter(h=>h.result==='패').length;
  const tot=w+l;
  const avgElo=Math.round(mem.reduce((s,p)=>s+(p.elo||1200),0)/mem.length);
  const pts=mem.reduce((s,p)=>s+(p.points||0),0);
  const races=new Set(mem.map(p=>p.race).filter(Boolean)).size;
  // 최근 30일 활동
  const d30=new Date();d30.setDate(d30.getDate()-30);
  const d30s=d30.toISOString().slice(0,10);
  const activity=allH.filter(h=>(h.date||'')>=d30s).length;
  // 현재 최장 연승
  let maxS=0;
  mem.forEach(p=>{let cs=0,lt='';for(const h of statsNonProHist(p)){if(h.result===lt||lt===''){cs++;lt=h.result;}else{cs=1;lt=h.result;}if(lt==='승')maxS=Math.max(maxS,cs);}});
  return{winrate:tot?Math.round(w/tot*100):0,avgElo,pts,activity,diversity:races,streak:maxS,w,l,tot,mem:mem.length};
}
function initRadarChart(){
  const canvas=document.getElementById('radarChart');
  const info=document.getElementById('radarInfo');
  if(!canvas)return;
  const proIds=statsProMatchIds();
  const scores=calcUnivRadar(_radarSelUniv,proIds);
  const allUnivs=getAllUnivs().filter(u=>players.some(p=>p.univ===u.name));
  const maxVals={
    winrate:100,
    avgElo:Math.max(...allUnivs.map(u=>calcUnivRadar(u.name,proIds).avgElo),1500),
    activity:Math.max(...allUnivs.map(u=>calcUnivRadar(u.name,proIds).activity),1),
    diversity:3,
    streak:Math.max(...allUnivs.map(u=>calcUnivRadar(u.name,proIds).streak),1),
    mem:Math.max(...allUnivs.map(u=>calcUnivRadar(u.name,proIds).mem),1),
  };
  const labels=['승률','ELO','활동도','다양성','연승','선수수'];
  const vals=[
    scores.winrate/maxVals.winrate,
    scores.avgElo/maxVals.avgElo,
    Math.min(1,scores.activity/maxVals.activity),
    scores.diversity/maxVals.diversity,
    Math.min(1,scores.streak/maxVals.streak),
    scores.mem/maxVals.mem,
  ];
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
  // 데이터 폴리곤
  ctx.beginPath();
  for(let i=0;i<sides;i++){
    const v=vals[i];
    const x=cx+r*v*Math.cos(angle(i));
    const y=cy+r*v*Math.sin(angle(i));
    if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);
  }
  ctx.closePath();
  ctx.fillStyle=col+'44';ctx.fill();
  ctx.strokeStyle=col;ctx.lineWidth=2.5;ctx.stroke();
  // 점
  for(let i=0;i<sides;i++){
    const v=vals[i];
    const x=cx+r*v*Math.cos(angle(i));
    const y=cy+r*v*Math.sin(angle(i));
    ctx.beginPath();ctx.arc(x,y,4,0,Math.PI*2);
    ctx.fillStyle=col;ctx.fill();ctx.strokeStyle='#fff';ctx.lineWidth=1.5;ctx.stroke();
  }
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
      <div style="display:flex;flex-direction:column;gap:8px">
        <div style="font-weight:800;font-size:16px;color:${col}">${_radarSelUniv}</div>
        ${[
          ['선수 수',scores.mem+'명'],
          ['승률',scores.winrate+'%'],
          ['평균 ELO',scores.avgElo],
          ['총 포인트',(scores.pts>=0?'+':'')+scores.pts],
          ['최근 30일 활동',scores.activity+'경기'],
          ['종족 다양성',scores.diversity+'종족'],
          ['최장 연승',scores.streak+'연승'],
          ['총 전적',`${scores.w}승 ${scores.l}패`],
        ].map(([k,v])=>`<div style="display:flex;justify-content:space-between;padding:6px 10px;background:var(--white);border:1px solid var(--border);border-radius:8px">
          <span style="font-size:12px;color:var(--text3)">${k}</span>
          <span style="font-weight:700;font-size:12px">${v}</span>
        </div>`).join('')}
      </div>`;
  }
  const sel=document.getElementById('radar-sel');
  if(sel)sel.value=_radarSelUniv;
}

/* ══════════════════════════════════════
   7. 미스매치 감지
══════════════════════════════════════ */
function statsMismatchHTML(){
  const proIds=statsProMatchIds();
  const allMatches=[];
  // proM을 제외한 배열만 처리
  [...miniM,...univM,...ckM,...comps].forEach((m,_)=>{
    (m.sets||[]).forEach(set=>{
      (set.games||[]).forEach(g=>{
        if(!g.playerA||!g.playerB||!g.winner)return;
        const pA=players.find(x=>x.name===g.playerA);
        const pB=players.find(x=>x.name===g.playerB);
        if(!pA||!pB)return;
        const eA=pA.elo||ELO_DEFAULT,eB=pB.elo||ELO_DEFAULT;
        const diff=Math.abs(eA-eB);
        if(diff<100)return;
        const winner=g.winner==='A'?g.playerA:g.playerB;
        const underdog=(eA<eB?pA:pB);
        const upset=winner===underdog.name;
        allMatches.push({pA:g.playerA,pB:g.playerB,eA,eB,diff,winner,upset,date:m.d||''});
      });
    });
  });
  allMatches.sort((a,b)=>b.diff-a.diff);
  const upsets=allMatches.filter(m=>m.upset).slice(0,10);
  const bigDiff=allMatches.slice(0,20);
  function matchRow(m){
    const winner=players.find(p=>p.name===m.winner);
    const loser=players.find(p=>p.name===(m.winner===m.pA?m.pB:m.pA));
    const wElo=winner?.elo||ELO_DEFAULT;const lElo=loser?.elo||ELO_DEFAULT;
    const wCol=gc(winner?.univ||'');const lCol=gc(loser?.univ||'');
    return`<div style="display:flex;align-items:center;gap:8px;padding:8px 12px;background:var(--white);border:1px solid var(--border);border-radius:8px;flex-wrap:wrap">
      <span style="font-size:11px;color:var(--gray-l);min-width:68px">${m.date}</span>
      <span style="background:var(--green);color:#fff;font-weight:800;font-size:11px;padding:2px 8px;border-radius:6px;cursor:pointer" onclick="openPlayerModal('${m.winner}')">${m.winner}</span>
      <span style="font-size:12px;font-weight:700;color:${wElo>=1300?'#7c3aed':wElo>=1200?'var(--green)':'var(--red)'}">${wElo}</span>
      <span style="color:var(--gray-l);font-size:11px">ELO차</span>
      <span style="background:var(--red);color:#fff;font-weight:800;font-size:12px;padding:1px 7px;border-radius:6px">${m.diff}↑</span>
      <span style="color:var(--gray-l);font-size:11px">vs</span>
      <span style="background:var(--red);color:#fff;font-weight:800;font-size:11px;padding:2px 8px;border-radius:6px;cursor:pointer;opacity:.7" onclick="openPlayerModal('${m.winner===m.pA?m.pB:m.pA}')">${m.winner===m.pA?m.pB:m.pA}</span>
      <span style="font-size:12px;font-weight:700;color:${lElo>=1300?'#7c3aed':lElo>=1200?'var(--green)':'var(--red)'}">${lElo}</span>
      ${m.upset?'<span style="background:#7c3aed;color:#fff;font-size:10px;font-weight:800;padding:1px 6px;border-radius:4px">🔥 이변!</span>':''}
    </div>`;
  }
  return`<div style="display:flex;flex-direction:column;gap:16px">
  <div class="ssec" id="stats-mismatch-top">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
      <h4>🔥 이변 TOP 10 (하위 ELO가 승리) <span style="font-size:11px;color:var(--gray-l);font-weight:400">(프로리그 제외)</span></h4>
      <button class="btn-capture btn-xs no-export" onclick="captureSection('stats-mismatch-top','mismatch')">📷 이미지 저장</button>
    </div>
    ${upsets.length?`<div style="display:flex;flex-direction:column;gap:6px">${upsets.map(matchRow).join('')}</div>`:'<p style="color:var(--gray-l)">이변 기록이 없습니다.</p>'}
  </div>
  <div class="ssec">
    <h4 style="margin-bottom:12px">⚡ ELO 격차 TOP 20 경기 <span style="font-size:11px;color:var(--gray-l);font-weight:400">(프로리그 제외)</span></h4>
    ${bigDiff.length?`<div style="display:flex;flex-direction:column;gap:6px">${bigDiff.map(matchRow).join('')}</div>`:'<p style="color:var(--gray-l)">ELO 격차 100 이상 경기 없음</p>'}
  </div></div>`;
}

/* ══════════════════════════════════════
   8. 경기 결과 공유 카드 생성
══════════════════════════════════════ */
let _shareMode='player';
let _sharePlayerSearch='';
let _shareUnivSearch='';
let _shareMatchPage=0; // 경기 결과 페이지 인덱스
const SHARE_MATCH_PER_PAGE=5;
function statsShareCardHTML(){
  const pList=players.filter(p=>p.history&&p.history.length>0).sort((a,b)=>b.history.length-a.history.length);
  const uList=(typeof univCfg!=='undefined'&&univCfg.length)?univCfg.filter(u=>players.some(p=>p.univ===u.name)):getAllUnivs().filter(u=>players.some(p=>p.univ===u.name));
  const filteredP=_sharePlayerSearch
    ?pList.filter(p=>p.name.toLowerCase().includes(_sharePlayerSearch.toLowerCase())||p.univ.toLowerCase().includes(_sharePlayerSearch.toLowerCase()))
    :[];  // 검색하기 전에는 빈 배열 - 아무것도 표시 안 함
  // 모든 경기 최신순 (tourneys 대회 경기 포함)
  const tourMatchesForShare=typeof getTourneyMatches==="function"?getTourneyMatches():[];
  const allMatches=[...miniM,...univM,...ckM,...comps,...tourMatchesForShare].sort((a,b)=>(b.d||"").localeCompare(a.d||""));
  // 캐시 초기화 (페이지 렌더링마다 fresh)
  window._shareAllMatchesCached=null;


  const totalPages=Math.ceil(allMatches.length/SHARE_MATCH_PER_PAGE)||1;
  const safePage=Math.min(_shareMatchPage,totalPages-1);
  const pageMatches=allMatches.slice(safePage*SHARE_MATCH_PER_PAGE,(safePage+1)*SHARE_MATCH_PER_PAGE);

  return`<div class="ssec">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;flex-wrap:wrap;gap:8px">
      <h4 style="margin:0;font-size:16px">🎴 공유 카드 생성</h4>
    </div>
    <!-- 모드 탭 -->
    <div style="display:flex;gap:6px;margin-bottom:16px;flex-wrap:wrap" class="no-export">
      <button class="stab ${_shareMode==='player'?'on':''}" onclick="_shareMode='player';_sharePlayerSearch='';render()">👤 선수 카드</button>
      <button class="stab ${_shareMode==='univ'?'on':''}" onclick="_shareMode='univ';render()">🏛️ 대학 카드</button>
      <button class="stab ${_shareMode==='match'?'on':''}" onclick="_shareMode='match';window._shareMatchObj=null;render()">⚔️ 경기 결과</button>
    </div>

    ${_shareMode==='player'?`
    <div style="margin-bottom:12px" class="no-export">
      <input type="text" id="share-player-q" value="${_sharePlayerSearch}"
        placeholder="🔍 스트리머 이름 또는 대학 이름 검색..."
        oninput="_sharePlayerSearch=this.value;renderShareCardFilterPlayers()"
        style="width:100%;max-width:380px;padding:9px 16px;border:2px solid var(--blue);border-radius:8px;font-size:13px;box-sizing:border-box">
      <div id="share-player-list" style="display:flex;flex-wrap:wrap;gap:5px;margin-top:8px;max-height:160px;overflow-y:auto;padding:2px">
        ${filteredP.length?filteredP.slice(0,50).map(p=>`
          <button onclick="renderShareCardByPlayer('${p.name}')"
            style="padding:4px 13px;border-radius:20px;border:2px solid ${gc(p.univ)};background:${gc(p.univ)}22;font-size:12px;font-weight:600;cursor:pointer;white-space:nowrap;transition:.12s"
            onmouseover="this.style.background='${gc(p.univ)}55'" onmouseout="this.style.background='${gc(p.univ)}22'">
            ${p.name} <span style="font-size:10px;opacity:.65">${p.univ}</span>
          </button>`).join('')
          :(_sharePlayerSearch?'<span style="color:var(--gray-l);font-size:12px;padding:8px">검색 결과 없음</span>'
          :'<span style="color:var(--gray-l);font-size:12px;padding:8px">이름 또는 대학명을 입력하세요</span>')}
      </div>
    </div>`
    :_shareMode==='univ'?`
    <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:14px" class="no-export">
      ${uList.map(u=>`
        <button onclick="renderShareCardByUniv('${u.name}')"
          style="padding:7px 20px;border-radius:20px;background:${u.color};color:#fff;border:none;font-size:13px;font-weight:700;cursor:pointer;box-shadow:0 2px 8px ${u.color}55;transition:.15s"
          onmouseover="this.style.transform='scale(1.06)'" onmouseout="this.style.transform='scale(1)'">
          ${u.name}
        </button>`).join('')||'<span style="color:var(--gray-l);font-size:12px">등록된 대학이 없습니다</span>'}
    </div>`
    :`
    <div style="margin-bottom:14px" class="no-export">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
        <div style="font-size:11px;font-weight:700;color:var(--text3)">⏱️ 최신순 경기 목록 (5개씩 표시)</div>
        <div style="display:flex;gap:4px;align-items:center">
          <button class="btn btn-w btn-xs" onclick="_shareMatchPage=Math.max(0,_shareMatchPage-1);render()" ${safePage===0?'disabled':''}>◀ 이전</button>
          <span style="font-size:11px;color:var(--gray-l);padding:0 6px">${safePage+1} / ${totalPages}</span>
          <button class="btn btn-w btn-xs" onclick="_shareMatchPage=Math.min(${totalPages-1},_shareMatchPage+1);render()" ${safePage>=totalPages-1?'disabled':''}>다음 ▶</button>
        </div>
      </div>
      <div style="display:flex;flex-direction:column;gap:4px;border:1px solid var(--border);border-radius:10px;padding:6px">
        ${pageMatches.length?pageMatches.map((m,pi)=>{
          const globalIdx=safePage*SHARE_MATCH_PER_PAGE+pi;
          const a=m.a||m.u||'A팀',b=m.b||'B팀';
          const ca=gc(a),cb=gc(b);
          const aWin=m.sa>m.sb;
          const isActive=window._shareMatchObj&&window._shareMatchObj===m;
          return`<button onclick="window._shareMatchObj=[...miniM,...univM,...ckM,...comps,...(typeof getTourneyMatches==='function'?getTourneyMatches():[])].sort((a,b)=>(b.d||'').localeCompare(a.d||''))[${globalIdx}]||null;renderShareCardByMatchObj(window._shareMatchObj)"
            style="display:flex;align-items:center;gap:8px;padding:8px 12px;border-radius:7px;border:2px solid ${isActive?'var(--blue)':'var(--border)'};background:${isActive?'var(--blue-l)':'transparent'};cursor:pointer;text-align:left;font-size:12px;transition:.1s"
            onmouseover="this.style.background='var(--blue-l)'" onmouseout="this.style.background='${isActive?'var(--blue-l)':'transparent'}'">
            <span style="color:var(--gray-l);min-width:80px;font-size:10px">${m.d||'-'}</span>
            <span style="background:${ca};color:#fff;padding:2px 9px;border-radius:4px;font-weight:700;font-size:11px">${a}</span>
            <span style="font-weight:900;font-size:15px;color:${aWin?'var(--green)':'#aaa'}">${m.sa}</span>
            <span style="color:var(--gray-l)">:</span>
            <span style="font-weight:900;font-size:15px;color:${(!aWin&&m.sb>m.sa)?'var(--green)':'#aaa'}">${m.sb}</span>
            <span style="background:${cb};color:#fff;padding:2px 9px;border-radius:4px;font-weight:700;font-size:11px">${b}</span>
            ${m.n?`<span style="color:var(--gold);font-size:10px;font-weight:600">🎖️${m.n}</span>`:''}
          </button>`;
        }).join(''):'<span style="color:var(--gray-l);padding:12px;font-size:12px;display:block">경기 기록이 없습니다</span>'}
      </div>
      <div style="font-size:10px;color:var(--gray-l);text-align:right;margin-top:4px">전체 ${allMatches.length}경기</div>
    </div>`}

    <!-- 카드 미리보기 -->
    <div id="sharecard-preview-wrap">
      <div style="font-size:11px;color:var(--gray-l);margin-bottom:6px">💡 카드를 클릭하면 사라집니다</div>
      <div id="share-card" style="width:100%;max-width:420px;min-height:140px;border-radius:18px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,.15);font-family:'Noto Sans KR',sans-serif;display:block;cursor:pointer" title="클릭하여 카드 초기화" onclick="resetShareCard(this)">
        <p style="text-align:center;color:var(--gray-l);padding:36px 20px;font-size:13px">위에서 선택하면 카드가 생성됩니다</p>
      </div>
      <div class="sharecard-modal-actions" style="justify-content:flex-start;margin-top:10px">
        <button class="btn btn-p btn-sm" onclick="downloadShareCardJpg()">📷 이미지 저장</button>
      </div>
    </div>
  </div>`;
}
// 이전 코드 호환용
function renderShareCardFilterPlayers(){
  const q=(document.getElementById('share-player-q')||{}).value||'';
  _sharePlayerSearch=q;
  const pList=players.filter(p=>p.history&&p.history.length>0).sort((a,b)=>b.history.length-a.history.length);
  const filtered=q?pList.filter(p=>p.name.toLowerCase().includes(q.toLowerCase())||p.univ.toLowerCase().includes(q.toLowerCase())):[];
  const list=document.getElementById('share-player-list');
  if(!list)return;
  if(!q){
    list.innerHTML='<span style="color:var(--gray-l);font-size:12px;padding:8px">이름 또는 대학명을 입력하세요</span>';
    return;
  }
  list.innerHTML=filtered.length?filtered.slice(0,50).map(p=>`
    <button onclick="renderShareCardByPlayer('${p.name}')"
      style="padding:4px 13px;border-radius:20px;border:2px solid ${gc(p.univ)};background:${gc(p.univ)}22;font-size:12px;font-weight:600;cursor:pointer;white-space:nowrap;transition:.12s"
      onmouseover="this.style.background='${gc(p.univ)}55'" onmouseout="this.style.background='${gc(p.univ)}22'">
      ${p.name} <span style="font-size:10px;opacity:.65">${p.univ}</span>
    </button>`).join(''):'<span style="color:var(--gray-l);font-size:12px;padding:8px">검색 결과 없음</span>';
}
function renderShareCardDynamic(){renderShareCardFilterPlayers();}
function renderShareCard(){
  const sel=document.getElementById('share-sel');
  if(sel){
    const val=sel.value;
    if(_shareMode==='player')renderShareCardByPlayer(val);
    else if(_shareMode==='univ')renderShareCardByUniv(val);
  }
}
function renderShareCardByPlayer(name){
  const card=document.getElementById('share-card');if(!card)return;
  const p=players.find(x=>x.name===name);
  if(!p){card.innerHTML='<p style="color:var(--gray-l);padding:40px;text-align:center">선수를 찾을 수 없습니다</p>';return;}
  const h=typeof statsNonProHist==='function'?statsNonProHist(p):(p.history||[]);
  const w=h.filter(x=>x.result==='승').length,l=h.filter(x=>x.result==='패').length,tot=w+l;
  const rate=tot?Math.round(w/tot*100):0;
  const elo=p.elo||1200;
  const col=gc(p.univ);
  // history는 unshift로 추가되므로 앞이 최신 — slice(0,5)가 최근 5경기
  const form=h.slice(0,5).map(x=>x.result==='승'
    ?'<span style="display:inline-block;width:26px;height:26px;background:#16a34a;color:#fff;font-size:11px;font-weight:800;border-radius:6px;text-align:center;line-height:26px;box-shadow:0 1px 4px rgba(0,0,0,.2)">W</span>'
    :'<span style="display:inline-block;width:26px;height:26px;background:#dc2626;color:#fff;font-size:11px;font-weight:800;border-radius:6px;text-align:center;line-height:26px;box-shadow:0 1px 4px rgba(0,0,0,.2)">L</span>').join('');
  const pts=p.points||0;
  const raceLabel=p.race==='T'?'테란':p.race==='Z'?'저그':p.race==='P'?'프로토스':'?';
  // 포인트 색상
  const ptsColor=pts>0?'#4ade80':pts<0?'#f87171':'rgba(255,255,255,.6)';
  // 승률 바
  const ratePct=tot?rate:0;
  card.innerHTML=`<div style="background:linear-gradient(135deg,${col}dd,${col}88);padding:24px;color:#fff;position:relative;overflow:hidden">
    <div style="position:absolute;top:-30px;right:-30px;width:120px;height:120px;border-radius:50%;background:rgba(255,255,255,.06);pointer-events:none"></div>
    <!-- 헤더 -->
    <div style="display:flex;align-items:center;gap:14px;margin-bottom:16px">
      <div style="width:54px;height:54px;border-radius:14px;background:rgba(255,255,255,.22);display:flex;align-items:center;justify-content:center;border:2px solid rgba(255,255,255,.4);flex-shrink:0;overflow:hidden">${(()=>{const photoUrl=p.photo||'';const url=UNIV_ICONS[p.univ]||(univCfg.find(x=>x.name===p.univ)||{}).icon||'';if(photoUrl)return`<img src="${photoUrl}" style="width:54px;height:54px;object-fit:cover" onerror="this.onerror=null;this.style.display='none'">`;return url?`<img src="${url}" style="width:38px;height:38px;object-fit:contain" onerror="this.parentElement.innerHTML='<svg xmlns=\\'http://www.w3.org/2000/svg\\' viewBox=\\'0 0 24 24\\' fill=\\'white\\' width=\\'30\\' height=\\'30\\'><path d=\\'M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z\\'/></svg>'">` :`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white' width='30' height='30'><path d='M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z'/></svg>`;})()}</div>
      <div style="flex:1;min-width:0">
        <div style="font-size:20px;font-weight:900;letter-spacing:.3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${p.name}${getStatusIconHTML(p.name)}${p.gender==='M'?'<span style="font-size:11px;background:rgba(255,255,255,.2);padding:1px 6px;border-radius:10px;margin-left:6px">♂</span>':''}</div>
        <div style="font-size:11px;opacity:.8;margin-top:3px">${p.univ} &nbsp;·&nbsp; ${p.tier||'-'} &nbsp;·&nbsp; ${raceLabel}</div>
      </div>
      <div style="text-align:center;background:rgba(0,0,0,.2);border-radius:10px;padding:7px 12px;flex-shrink:0">
        <div style="font-size:9px;opacity:.7;letter-spacing:.5px">ELO</div>
        <div style="font-size:20px;font-weight:900;line-height:1.1">${elo}</div>
      </div>
    </div>
    <!-- 스탯 -->
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:8px;margin-bottom:14px">
      <div style="background:rgba(255,255,255,.15);border-radius:9px;padding:9px 6px;text-align:center">
        <div style="font-size:9px;opacity:.7;margin-bottom:3px">승</div><div style="font-size:22px;font-weight:900;color:#4ade80">${w}</div>
      </div>
      <div style="background:rgba(255,255,255,.15);border-radius:9px;padding:9px 6px;text-align:center">
        <div style="font-size:9px;opacity:.7;margin-bottom:3px">패</div><div style="font-size:22px;font-weight:900;color:#f87171">${l}</div>
      </div>
      <div style="background:rgba(255,255,255,.15);border-radius:9px;padding:9px 6px;text-align:center">
        <div style="font-size:9px;opacity:.7;margin-bottom:3px">승률</div><div style="font-size:18px;font-weight:900">${tot?rate+'%':'-'}</div>
      </div>
      <div style="background:rgba(255,255,255,.15);border-radius:9px;padding:9px 6px;text-align:center">
        <div style="font-size:9px;opacity:.7;margin-bottom:3px">포인트</div><div style="font-size:18px;font-weight:900;color:${ptsColor}">${pts>=0?'+':''}${pts}</div>
      </div>
    </div>
    <!-- 승률 바 -->
    ${tot?`<div style="margin-bottom:12px">
      <div style="height:5px;border-radius:3px;background:rgba(255,255,255,.18);overflow:hidden">
        <div style="height:100%;width:${ratePct}%;background:rgba(255,255,255,.8);border-radius:3px;transition:width .3s"></div>
      </div>
      <div style="display:flex;justify-content:space-between;margin-top:3px;font-size:9px;opacity:.6">
        <span>0%</span><span style="font-weight:700;font-size:10px">${ratePct}%</span><span>100%</span>
      </div>
    </div>`:''}
    <!-- 최근 5경기 -->
    <div>
      <div style="font-size:9px;opacity:.65;margin-bottom:6px;letter-spacing:.5px">최근 5경기 (최신→과거)</div>
      <div style="display:flex;gap:5px">${form||'<span style="opacity:.5;font-size:12px">기록없음</span>'}</div>
    </div>
    <div style="margin-top:14px;text-align:right;font-size:9px;opacity:.35;letter-spacing:.3px">⭐ 스타대학 데이터 센터</div>
  </div>`;
}
function renderShareCardByUniv(univName){
  const card=document.getElementById('share-card');if(!card)return;
  const uList=typeof univCfg!=='undefined'&&univCfg.length?univCfg:getAllUnivs();
  const u=uList.find(x=>x.name===univName)||getAllUnivs().find(x=>x.name===univName);
  if(!u){card.innerHTML='<p style="color:var(--gray-l);padding:40px;text-align:center">대학을 찾을 수 없습니다</p>';return;}
  const proIds=typeof statsProMatchIds==='function'?statsProMatchIds():new Set();
  const sc=typeof calcUnivRadar==='function'?calcUnivRadar(u.name,proIds):{winrate:0,avgElo:0,pts:0,w:0,l:0};
  const mem=players.filter(p=>p.univ===u.name);
  const ptsColor=sc.pts>0?'#4ade80':sc.pts<0?'#f87171':'rgba(255,255,255,.8)';
  const sortedMem=[...mem].sort((a,b)=>TIERS.indexOf(a.tier)-TIERS.indexOf(b.tier)||(b.points||0)-(a.points||0));
  card.innerHTML=`<div style="background:linear-gradient(135deg,${u.color}cc,${u.color}88);padding:24px;color:#fff;position:relative;overflow:hidden">
    <div style="position:absolute;top:-40px;right:-40px;width:160px;height:160px;border-radius:50%;background:rgba(255,255,255,.06);pointer-events:none"></div>
    <!-- 헤더 -->
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px">
      <div style="width:48px;height:48px;border-radius:12px;background:rgba(255,255,255,.2);display:flex;align-items:center;justify-content:center;border:2px solid rgba(255,255,255,.35);flex-shrink:0;overflow:hidden">${(()=>{const url=UNIV_ICONS[u.name]||(univCfg.find(x=>x.name===u.name)||{}).icon||'';return url?`<img src="${url}" style="width:34px;height:34px;object-fit:contain" onerror="this.parentElement.innerHTML='<svg xmlns=\\'http://www.w3.org/2000/svg\\' viewBox=\\'0 0 24 24\\' fill=\\'white\\' width=\\'28\\' height=\\'28\\'><path d=\\'M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z\\'/></svg>'">`:`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white' width='28' height='28'><path d='M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z'/></svg>`;})()}</div>
      <div>
        <div style="font-size:20px;font-weight:900;letter-spacing:.3px">${u.name}</div>
        <div style="font-size:11px;opacity:.75;margin-top:2px">🎓 소속 선수 ${mem.length}명</div>
      </div>
    </div>
    <!-- 스탯 4격자 -->
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:8px;margin-bottom:14px">
      <div style="background:rgba(255,255,255,.15);border-radius:9px;padding:9px 6px;text-align:center">
        <div style="font-size:9px;opacity:.7;margin-bottom:3px">승률</div>
        <div style="font-size:18px;font-weight:900">${sc.winrate}%</div>
      </div>
      <div style="background:rgba(255,255,255,.15);border-radius:9px;padding:9px 6px;text-align:center">
        <div style="font-size:9px;opacity:.7;margin-bottom:3px">전적</div>
        <div style="font-size:13px;font-weight:900">${sc.w}W<br>${sc.l}L</div>
      </div>
      <div style="background:rgba(255,255,255,.15);border-radius:9px;padding:9px 6px;text-align:center">
        <div style="font-size:9px;opacity:.7;margin-bottom:3px">평균ELO</div>
        <div style="font-size:16px;font-weight:900">${sc.avgElo}</div>
      </div>
      <div style="background:rgba(255,255,255,.15);border-radius:9px;padding:9px 6px;text-align:center">
        <div style="font-size:9px;opacity:.7;margin-bottom:3px">포인트</div>
        <div style="font-size:16px;font-weight:900;color:${ptsColor}">${sc.pts>=0?'+':''}${sc.pts}</div>
      </div>
    </div>
    <!-- 선수 목록 -->
    <div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:12px">
      ${sortedMem.slice(0,12).map(p=>`<span style="background:rgba(255,255,255,.18);border:1px solid rgba(255,255,255,.25);border-radius:20px;padding:2px 10px;font-size:10px;font-weight:600">${p.name}</span>`).join('')}
      ${mem.length>12?`<span style="opacity:.6;font-size:10px;padding:2px 6px">+${mem.length-12}명</span>`:''}
    </div>
    <div style="text-align:right;font-size:9px;opacity:.35;letter-spacing:.3px">⭐ 스타대학 데이터 센터</div>
  </div>`;
}
function renderShareCardByMatchObj(m){
  const card=document.getElementById('share-card');if(!card)return;
  if(!m){card.innerHTML='<p style="color:var(--gray-l);padding:40px;text-align:center">경기를 선택하세요</p>';return;}
  const a=m.a||'A팀',b=m.b||'B팀';
  const isCivil=m.type==='civil'||(a==='A팀'&&b==='B팀');
  // 시빌워: 세트 내 선수 소속 대학 색상 사용
  let civUniv=null;
  if(isCivil){
    outer:for(const s of(m.sets||[])){for(const g of(s.games||[])){const pn=g.playerA||g.playerB;if(pn){const p=players.find(x=>x.name===pn);if(p?.univ){civUniv=p.univ;break outer;}}}}
  }
  const civColor=civUniv?gc(civUniv):'#6366f1';
  // 경기 타입별 전용 색상 (대학 색상 사용 안함)
  const _TYPE_COLORS={
    pro:{a:'#1d4ed8',b:'#be123c'},   // 프로리그: 딥블루 vs 크림슨
    tt: {a:'#7c3aed',b:'#047857'},   // 티어대회: 바이올렛 vs 에메랄드
    ck: {a:'#0e7490',b:'#b45309'},   // 대학CK:  시안 vs 앰버
  };
  const _tc=m._matchType&&_TYPE_COLORS[m._matchType]?_TYPE_COLORS[m._matchType]:null;
  let ca=_tc?_tc.a:(isCivil?civColor:gc(a));
  let cb=_tc?_tc.b:(isCivil?civColor:gc(b));
  const aWin=m.sa>m.sb, bWin=m.sb>m.sa;
  const draw=!aWin&&!bWin;

  // ── 배경/색상 시스템: 승리팀 색상 기반 풀 컬러 카드 ──
  function hexToHsl(hex){
    let h=hex.replace('#','');
    if(h.length===3) h=h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
    if(h.length!==6) return null;
    let r=parseInt(h.slice(0,2),16)/255;
    let g=parseInt(h.slice(2,4),16)/255;
    let b=parseInt(h.slice(4,6),16)/255;
    const max=Math.max(r,g,b),min=Math.min(r,g,b);
    let hue=0,sat=0,lit=(max+min)/2;
    if(max!==min){
      const d=max-min;
      sat=lit>.5?d/(2-max-min):d/(max+min);
      if(max===r) hue=((g-b)/d+(g<b?6:0))/6;
      else if(max===g) hue=((b-r)/d+2)/6;
      else hue=((r-g)/d+4)/6;
    }
    return{h:Math.round(hue*360),s:Math.round(sat*100),l:Math.round(lit*100)};
  }
  function makeCardTheme(hex){
    const hsl=hexToHsl(hex);
    if(!hsl) return{
      headerBg:'#1e293b', bodyBg:'#f8fafc',
      accentHex:hex||'#6366f1', accentDark:'#1e293b',
      text:'#1e293b', textDim:'rgba(30,41,59,.55)', divider:'rgba(30,41,59,.12)'
    };
    const {h,s,l}=hsl;
    // 헤더: 팀 원색 (진하게)
    const headerBg=`hsl(${h},${Math.min(s+5,90)}%,${Math.max(l-5,20)}%)`;
    // 바디: 같은 색조 매우 연한 파스텔
    const bodyBgL=Math.min(97, l+52);
    const bodyBgS=Math.min(s*0.25, 18);
    const bodyBg=`hsl(${h},${bodyBgS}%,${bodyBgL}%)`;
    // 강조 어두운 버전
    const accentDark=`hsl(${h},${Math.min(s+10,95)}%,${Math.max(l-15,15)}%)`;
    const divider=`hsla(${h},${Math.min(s*0.5,35)}%,${Math.max(l-20,30)}%,.18)`;
    const textDim=`hsla(${h},${Math.min(s*0.4,30)}%,${Math.max(l-45,12)}%,.6)`;
    return{headerBg, bodyBg, accentHex:hex, accentDark, text:`hsl(${h},${Math.min(s*0.6,45)}%,${Math.max(l-52,8)}%)`, textDim, divider};
  }

  const theme = aWin ? makeCardTheme(ca) : bWin ? makeCardTheme(cb) : {
    headerBg:'#334155', bodyBg:'#f8fafc',
    accentHex:'#475569', accentDark:'#1e293b',
    text:'#1e293b', textDim:'rgba(71,85,105,.6)', divider:'rgba(148,163,184,.2)'
  };
  const winnerTeam=aWin?a:bWin?b:'';
  const winnerColor=aWin?ca:bWin?cb:'#475569';

  function hexToRgb(hex){
    let h=(hex||'').replace('#','');
    if(h.length===3)h=h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
    if(h.length!==6)return '128,128,128';
    return parseInt(h.slice(0,2),16)+','+parseInt(h.slice(2,4),16)+','+parseInt(h.slice(4,6),16);
  }

  const caRgb=hexToRgb(ca), cbRgb=hexToRgb(cb);
  let setsHTML='';
  if(m.sets&&m.sets.length){
    setsHTML=m.sets.map((s,si)=>{
      const isAce=(si===2);
      const sLabel=isAce?'⚡ 에이스결전':`${si+1}세트`;
      const swA=s.scoreA||0,swB=s.scoreB||0;
      const sAW=swA>swB,sBW=swB>swA;
      const gameList=(s.games||[]).filter(g=>g.playerA||g.playerB);
      const games=gameList.map((g,gi)=>{
        const aW=g.winner==='A',bW=g.winner==='B';
        const loserA=!aW&&bW?';filter:blur(1px) grayscale(.2);opacity:.6':'';
        const loserB=!bW&&aW?';filter:blur(1px) grayscale(.2);opacity:.6':'';
        const photoA=g.playerA?getPlayerPhotoHTML(g.playerA,'20px',`border-radius:50%;flex-shrink:0${loserA}`):'';
        const photoB=g.playerB?getPlayerPhotoHTML(g.playerB,'20px',`border-radius:50%;flex-shrink:0${loserB}`):'';
        const winA=aW?`<span style="background:${ca};color:#fff;padding:1px 5px;border-radius:3px;font-size:9px;font-weight:800;flex-shrink:0">WIN</span>`:'';
        const winB=bW?`<span style="background:${cb};color:#fff;padding:1px 5px;border-radius:3px;font-size:9px;font-weight:800;flex-shrink:0">WIN</span>`:'';
        return`<div style="display:flex;align-items:center;gap:4px;padding:3px 0;border-bottom:1px solid ${theme.divider}">
          <span style="color:${theme.textDim};min-width:34px;font-size:9px;text-align:center;flex-shrink:0">경기${gi+1}</span>
          <div style="flex:1;display:flex;align-items:center;justify-content:flex-end;gap:4px;min-width:0;${aW?'':'opacity:.6'}">
            ${winA}
            <span style="font-weight:${aW?'800':'400'};color:${aW?theme.text:theme.textDim};font-size:11px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${g.playerA||'?'}</span>
            ${photoA}
          </div>
          <span style="color:${theme.textDim};font-size:9px;flex-shrink:0">vs</span>
          <div style="flex:1;display:flex;align-items:center;gap:4px;min-width:0;${bW?'':'opacity:.6'}">
            ${photoB}
            <span style="font-weight:${bW?'800':'400'};color:${bW?theme.text:theme.textDim};font-size:11px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${g.playerB||'?'}</span>
            ${winB}
          </div>
          ${g.map?`<span style="color:${theme.textDim};font-size:9px;flex-shrink:0">📍${g.map}</span>`:''}
        </div>`;
      }).join('');
      const setBg=isAce?`${theme.accentDark}15`:`${theme.divider}`;
      const setBorder=isAce?`${theme.accentDark}30`:theme.divider;
      return`<div style="background:${setBg};border:1px solid ${setBorder};border-radius:8px;padding:8px 12px;margin-bottom:6px">
        <div style="display:flex;align-items:center;justify-content:center;gap:6px;flex-wrap:wrap;margin-bottom:${gameList.length?'7':'0'}px">
          <span style="font-size:10px;font-weight:800;color:${isAce?theme.accentDark:theme.textDim};letter-spacing:.5px;min-width:60px;text-align:center">${sLabel}</span>
          <span style="font-weight:800;background:${sAW?ca:'transparent'};${sAW?'':'border:1px solid '+theme.divider};color:${sAW?'#fff':theme.textDim};padding:2px 9px;border-radius:4px;font-size:11px;text-align:center">${a}</span>
          <span style="font-weight:900;font-size:16px;letter-spacing:2px;min-width:48px;text-align:center">
            <span style="color:${sAW?ca:theme.textDim}">${swA}</span>
            <span style="color:${theme.textDim};font-size:12px;margin:0 4px">:</span>
            <span style="color:${sBW?cb:theme.textDim}">${swB}</span>
          </span>
          <span style="font-weight:800;background:${sBW?cb:'transparent'};${sBW?'':'border:1px solid '+theme.divider};color:${sBW?'#fff':theme.textDim};padding:2px 9px;border-radius:4px;font-size:11px;text-align:center">${b}</span>
          <span style="font-size:10px;color:${theme.textDim};white-space:nowrap">${sAW?'▶ '+a:sBW?'▶ '+b:'무승부'}</span>
        </div>
        ${games}
      </div>`;
    }).join('');
  }

  // ── 대학 아이콘 헬퍼 ──
  function univIconHTML(name, size, fallbackColor){
    const url=UNIV_ICONS[name]||(univCfg.find(x=>x.name===name)||{}).icon||'';
    const s=size||'40px';
    if(url) return `<img src="${url}" style="width:${s};height:${s};object-fit:contain" onerror="this.outerHTML='<svg xmlns=\\'http://www.w3.org/2000/svg\\' viewBox=\\'0 0 24 24\\' fill=\\'white\\' width=\\'${s}\\' height=\\'${s}\\'><path d=\\'M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z\\'/></svg>'">`;
    return `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white' width='${s}' height='${s}'><path d='M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z'/></svg>`;
  }

  card.innerHTML=`<div style="background:${theme.bodyBg};color:${theme.text};min-width:340px;border-radius:18px;overflow:hidden;font-family:'Noto Sans KR',sans-serif">

    <!-- 상단 헤더 바: 승리팀 풀컬러 -->
    <div style="background:${theme.headerBg};padding:18px 22px 20px;position:relative;overflow:hidden">
      <!-- 배경 장식 -->
      <div style="position:absolute;top:-30px;right:-30px;width:130px;height:130px;border-radius:50%;background:rgba(255,255,255,.1);pointer-events:none"></div>
      <div style="position:absolute;bottom:-40px;left:20px;width:100px;height:100px;border-radius:50%;background:rgba(255,255,255,.07);pointer-events:none"></div>

      <!-- 대회명 + 날짜 -->
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
        ${(()=>{
          const _typeLbl={pro:'🏆 프로리그',tt:'🎯 티어대회',ck:'🤝 대학CK'}[m._matchType]||'';
          const lbl=_typeLbl||(m.n?`🎖️ ${m.n}`:'');
          return lbl?`<div style="font-size:11px;color:rgba(255,255,255,.9);font-weight:700;background:rgba(255,255,255,.18);border:1px solid rgba(255,255,255,.3);padding:2px 12px;border-radius:20px">${lbl}</div>`:'<div></div>';
        })()}
        <div style="font-size:11px;color:rgba(255,255,255,.65)">${m.d||''}</div>
      </div>

      <!-- 팀 대결 -->
      <div style="display:flex;align-items:center;justify-content:center;gap:10px">
        <!-- A팀 -->
        <div style="text-align:center;flex:1;min-width:0">
          ${!m._noUnivIcon?`<div style="width:58px;height:58px;border-radius:16px;background:${aWin?`rgba(${caRgb},.38)`:`rgba(${caRgb},.14)`};margin:0 auto 8px;display:flex;align-items:center;justify-content:center;${aWin?'box-shadow:0 4px 20px rgba(0,0,0,.25);border:2px solid rgba(255,255,255,.55);':'opacity:.5;'}overflow:hidden">
            ${univIconHTML(isCivil&&civUniv?civUniv:a,'40px')}
          </div>`:'<div style="height:12px"></div>'}
          <div style="font-size:13px;font-weight:${aWin?900:600};color:${aWin?'#fff':'rgba(255,255,255,.65)'};white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${isCivil?'⚔️ A팀':a}</div>
          ${aWin?`<div style="margin-top:5px"><span style="background:rgba(255,255,255,.25);border:1px solid rgba(255,255,255,.5);color:#fff;font-size:9px;font-weight:800;padding:2px 10px;border-radius:20px;letter-spacing:.5px">🏆 승리</span></div>`:`<div style="margin-top:5px;font-size:10px;color:rgba(255,255,255,.5);font-weight:600">패배</div>`}
        </div>

        <!-- 스코어 -->
        <div style="text-align:center;flex-shrink:0;padding:0 6px">
          <div style="font-size:52px;font-weight:900;letter-spacing:2px;line-height:1;color:#fff;text-shadow:0 2px 8px rgba(0,0,0,.25)">
            <span>${m.sa??'-'}</span><span style="font-size:30px;opacity:.6;margin:0 2px">:</span><span>${m.sb??'-'}</span>
          </div>
          ${draw?`<div style="font-size:10px;color:rgba(255,255,255,.7);margin-top:4px;letter-spacing:2px;font-weight:700">무 승 부</div>`:''}
        </div>

        <!-- B팀 -->
        <div style="text-align:center;flex:1;min-width:0">
          ${!m._noUnivIcon?`<div style="width:58px;height:58px;border-radius:16px;background:${bWin?`rgba(${cbRgb},.38)`:`rgba(${cbRgb},.14)`};margin:0 auto 8px;display:flex;align-items:center;justify-content:center;${bWin?'box-shadow:0 4px 20px rgba(0,0,0,.25);border:2px solid rgba(255,255,255,.55);':'opacity:.5;'}overflow:hidden">
            ${univIconHTML(isCivil&&civUniv?civUniv:b,'40px')}
          </div>`:'<div style="height:12px"></div>'}
          <div style="font-size:13px;font-weight:${bWin?900:600};color:${bWin?'#fff':'rgba(255,255,255,.65)'};white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${isCivil?'🛡️ B팀':b}</div>
          ${bWin?`<div style="margin-top:5px"><span style="background:rgba(255,255,255,.25);border:1px solid rgba(255,255,255,.5);color:#fff;font-size:9px;font-weight:800;padding:2px 10px;border-radius:20px;letter-spacing:.5px">🏆 승리</span></div>`:`<div style="margin-top:5px;font-size:10px;color:rgba(255,255,255,.5);font-weight:600">패배</div>`}
        </div>
      </div>
    </div>

    <!-- 바디: 연한 배경 -->
    <div style="padding:${setsHTML?'14px 18px 16px':'10px 18px 14px'}">
      ${setsHTML?`<div style="margin-bottom:2px">${setsHTML}</div>`:''}
      <!-- 푸터 -->
      <div style="text-align:right;font-size:10px;color:${theme.textDim};letter-spacing:.3px">⭐ 스타대학 데이터 센터</div>
    </div>
  </div>`;
}


// 캘린더 경기 공유카드 열기
// calView=day 경기 공유카드 - rCal의 allMatches 캐시 이용
function openRCalMatchShareCard(ds, mi){
  const all=(window._rCalAllMatches||[...miniM,...univM,...comps,...ckM,...proM]);
  const dayMatches=all.filter(m=>m.d===ds&&m.sa!=null&&m.sa!=='');
  const m=dayMatches[mi];
  if(!m)return;
  const _mt=ckM.includes(m)?'ck':proM.includes(m)?'pro':ttM.includes(m)?'tt':'';
  const isCKorPro=!!_mt&&_mt!=='';
  window._shareMatchObj={...m, a:isCKorPro?'A팀':(m.a||''), b:isCKorPro?'B팀':(m.b||''), _noUnivIcon:isCKorPro, _matchType:_mt};
  _shareMode='match';
  openShareCardModal();
  setTimeout(()=>{if(window._shareMatchObj)renderShareCardByMatchObj(window._shareMatchObj);},80);
}

// 캘린더 calShowDay 공유카드 - 캐시된 배열의 인덱스로 참조
function openCalMatchShareCardByCache(ds, mi){
  const matches=window._calDayCache&&window._calDayCache[ds];
  if(!matches||mi>=matches.length)return;
  const m=matches[mi];
  if(!m)return;
  const _mt=ckM.includes(m)?'ck':proM.includes(m)?'pro':ttM.includes(m)?'tt':'';
  const isCKorPro=!!_mt;
  window._shareMatchObj={...m, a:isCKorPro?'A팀':(m.a||''), b:isCKorPro?'B팀':(m.b||''), _noUnivIcon:isCKorPro, _matchType:_mt};
  _shareMode='match';
  openShareCardModal();
  setTimeout(()=>{if(window._shareMatchObj)renderShareCardByMatchObj(window._shareMatchObj);},80);
}

function openCalMatchShareCard(mode, idx){
  // mode별 배열에서 직접 인덱스로 참조
  const arr=mode==='mini'?miniM:mode==='univm'?univM:mode==='ck'?ckM:mode==='pro'?proM:comps;
  if(!arr||idx<0||idx>=arr.length){
    // 못 찾으면 tourney에서 시도 (mode==='comp'일 때)
    if(mode==='comp'){
      const tourItems=typeof getTourneyMatches==='function'?getTourneyMatches():[];
      const m=tourItems[idx-comps.length];
      if(m){
        window._shareMatchObj=m;
        _shareMode='match';
        openShareCardModal();
        setTimeout(()=>renderShareCardByMatchObj(window._shareMatchObj),80);
        return;
      }
    }
    return;
  }
  const m=arr[idx];
  if(!m)return;
  const isCKorPro=(mode==='ck'||mode==='pro'||mode==='tt');
  window._shareMatchObj={...m, a:isCKorPro?'A팀':(m.a||''), b:isCKorPro?'B팀':(m.b||''), _noUnivIcon:isCKorPro, _matchType:isCKorPro?mode:''};
  _shareMode='match';
  openShareCardModal();
  setTimeout(()=>{if(window._shareMatchObj)renderShareCardByMatchObj(window._shareMatchObj);},80);
}

// 대회 탭 경기 공유카드 열기
function openCompMatchShareCard(tnId, gi, mi){
  const tn=(tourneys||[]).find(t=>t.id===tnId);
  if(!tn)return;
  const grp=tn.groups&&tn.groups[gi];
  if(!grp)return;
  const m=grp.matches&&grp.matches[mi];
  if(!m)return;
  window._shareMatchObj={a:m.a||'',b:m.b||'',sa:m.sa,sb:m.sb,d:m.d||'',n:tn.name,sets:m.sets||[]};
  _shareMode='match';
  openShareCardModal();
  setTimeout(()=>renderShareCardByMatchObj(window._shareMatchObj),80);
}

// 공유카드 모달 열기
function openShareCardModal(){
  // 기존 모달 제거
  const existing=document.getElementById('sharecard-overlay');
  if(existing)existing.remove();
  
  const overlay=document.createElement('div');
  overlay.id='sharecard-overlay';
  overlay.className='sharecard-modal-overlay';
  overlay.innerHTML=`<div class="sharecard-modal-box" onclick="event.stopPropagation()" style="max-width:460px;width:96vw">
    <button class="sharecard-modal-close" onclick="document.getElementById('sharecard-overlay').remove()" style="z-index:2">✕</button>
    <div style="font-weight:700;font-size:14px;color:var(--blue);margin-bottom:14px;padding-right:30px">🎴 공유 카드</div>
    <div id="modal-share-card" style="display:flex;justify-content:center;overflow:auto;max-height:70vh;padding-bottom:4px">
      <div id="share-card" style="width:100%;max-width:420px;min-height:140px;border-radius:18px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,.22);font-family:'Noto Sans KR',sans-serif;display:block">
        <p style="text-align:center;color:var(--gray-l);padding:36px 20px;font-size:13px">카드를 생성하는 중...</p>
      </div>
    </div>
    <div class="sharecard-modal-actions" style="margin-top:16px">
      <button class="btn btn-p" onclick="downloadShareCardJpg()">📷 JPG 저장</button>
      <button class="btn btn-w" onclick="downloadShareCard()">🖼 PNG 저장</button>
      <button class="btn btn-w" onclick="document.getElementById('sharecard-overlay').remove()">닫기</button>
    </div>
  </div>`;
  // 배경 클릭 시 닫기
  overlay.addEventListener('click', function(e){
    if(e.target===overlay) overlay.remove();
  });
  document.body.appendChild(overlay);
}

// 공유카드 초기화
function resetShareCard(el){
  const c=el||document.getElementById('share-card');
  if(!c)return;
  c.innerHTML='<p style="text-align:center;color:var(--gray-l);padding:36px 20px;font-size:13px">위에서 선택하면 카드가 생성됩니다</p>';
}

// ── 모바일 호환 이미지 다운로드 헬퍼 ──────────────────────────
// iOS Safari에서 a.click()이 동작 안 하는 문제를 해결:
// 1) canvas.toBlob → ObjectURL → a.click() (Android/Chrome)
// _downloadCanvasImage, _saveCanvasImage → render.js로 이동 (로드 순서 버그 수정)

// 이미지 저장 함수 (JPG)
async function downloadShareCardJpg(){
  const el=document.getElementById('share-card');
  if(!el||el.querySelector('p')){alert('먼저 카드를 생성하세요.');return;}
  try{
    _showSaveLoading();
    await _imgToDataUrls(el);
    const canvas=await html2canvas(el,{backgroundColor:null,scale:3,useCORS:false,allowTaint:false,logging:false});
    await _saveCanvasImage(canvas, `share_card_${new Date().toISOString().slice(0,10)}.jpg`, 'jpg');
  }catch(e){alert('저장 오류: '+e.message);}
  finally{_hideSaveLoading();}
}

// 안전한 match 객체 파싱 헬퍼
function _getMatchObjSafe(jsonObj){
  try{
    if(typeof jsonObj==='string') return JSON.parse(jsonObj);
    return jsonObj;
  }catch(e){return null;}
}

async function downloadShareCard(){
  const el=document.getElementById('share-card');
  if(!el||!el.children.length||el.querySelector('p')){alert('먼저 카드를 생성하세요.');return;}
  try{
    _showSaveLoading();
    await _imgToDataUrls(el);
    const canvas=await html2canvas(el,{backgroundColor:null,scale:3,useCORS:false,allowTaint:false,logging:false});
    await _saveCanvasImage(canvas, `share_card_${new Date().toISOString().slice(0,10)}.png`, 'png');
  }catch(e){alert('저장 오류: '+e.message);}
  finally{_hideSaveLoading();}
}

/* ══════════════════════════════════════
   A. 활동량 히트맵
══════════════════════════════════════ */
let _heatmapSelPlayer='';
function heatmapSearchFilter(q){
  const d=document.getElementById('heatmap-search-drop');if(!d)return;
  d.querySelectorAll('.sitem').forEach(el=>{el.style.display=el.textContent.toLowerCase().includes(q.toLowerCase())?'':'none';});
}
function statsHeatmapHTML(){
  const playersWithHist=players.filter(p=>(p.history||[]).length>0).sort((a,b)=>a.name.localeCompare(b.name,'ko'));
  const isPlayerMode=!!_heatmapSelPlayer;
  const dayCnt={};
  if(isPlayerMode){
    // 선수별 히트맵: history의 날짜 기준 (1경기=1칸)
    const tp=players.find(p=>p.name===_heatmapSelPlayer);
    (tp?.history||[]).forEach(h=>{
      const d=h.date||'';if(!d)return;
      if(h.result==='승')dayCnt[d]=(dayCnt[d]||0)+1; // 승자 기준 1번만 카운트
    });
    // 0이면 패배 포함해서 다시
    if(!Object.keys(dayCnt).length){
      (tp?.history||[]).forEach(h=>{const d=h.date||'';if(!d)return;dayCnt[d]=(dayCnt[d]||0)+1;});
    }
  }else{
    // 전체 경기 히트맵: 매치 날짜 기준 게임 수 (토너먼트 포함)
    const _heatTourM=typeof getTourneyMatches==='function'?getTourneyMatches():[];
    const allM=[...miniM,...univM,...ckM,...comps,...proM,..._heatTourM];
    allM.forEach(m=>{
      const d=m.d||'';if(!d)return;
      // sets.games 카운트
      let cnt=0;
      (m.sets||[]).forEach(s=>(s.games||[]).forEach(()=>cnt++));
      if(cnt>0)dayCnt[d]=(dayCnt[d]||0)+cnt;
      else dayCnt[d]=(dayCnt[d]||0)+1; // 경기 자체도 카운트
    });
    // 개인 히스토리에서도 집계 (매치 데이터 없는 개인전)
    const matchDates=new Set(Object.keys(dayCnt));
    players.forEach(p=>(p.history||[]).forEach(h=>{
      const d=h.date||'';if(!d||h.result!=='승')return;
      // 이미 매치로 집계된 날짜는 추가 집계 안 함 (중복 방지)
      if(!matchDates.has(d))dayCnt[d]=(dayCnt[d]||0)+1;
    }));
  }

  if(!Object.keys(dayCnt).length){
    const msg=isPlayerMode?`${_heatmapSelPlayer} 선수의 경기 기록이 없습니다.`:'경기 기록이 없습니다.';
    return `<div class="ssec"><p style="color:var(--gray-l);padding:40px;text-align:center">${msg}</p></div>`;
  }

  // 최근 52주(364일) 기준
  const today=new Date(); today.setHours(0,0,0,0);
  const start=new Date(today); start.setDate(start.getDate()-363);
  // start를 일요일로 맞춤
  start.setDate(start.getDate()-start.getDay());

  const maxCnt=Math.max(...Object.values(dayCnt),1);
  const cellSize=14, cellGap=2, cellTotal=cellSize+cellGap;
  const weeks=53;
  const svgW=weeks*cellTotal+60, svgH=7*cellTotal+36;
  const pad={l:32,t:20};

  function dateStr(d){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}
  function heatColor(cnt){
    if(!cnt) return 'var(--border)';
    const v=cnt/maxCnt;
    if(v<0.25) return '#bbf7d0';
    if(v<0.5)  return '#4ade80';
    if(v<0.75) return '#16a34a';
    return '#166534';
  }

  let cells='', monthLabels='', lastMonth=-1;
  const cur=new Date(start);
  for(let w=0;w<weeks;w++){
    for(let d=0;d<7;d++){
      const ds=dateStr(cur);
      const cnt=dayCnt[ds]||0;
      const x=pad.l+w*cellTotal, y=pad.t+d*cellTotal;
      cells+=`<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" rx="2" fill="${heatColor(cnt)}" data-date="${ds}" data-cnt="${cnt}">
        <title>${ds}: ${cnt}게임</title></rect>`;
      // 월 레이블 (첫 번째 주 또는 새 월)
      if(d===0 && cur.getMonth()!==lastMonth){
        lastMonth=cur.getMonth();
        const mLabel=['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'][cur.getMonth()];
        monthLabels+=`<text x="${x}" y="${pad.t-6}" font-size="9" fill="var(--gray-l)">${mLabel}</text>`;
      }
      cur.setDate(cur.getDate()+1);
    }
  }

  const dayLabels=['일','월','화','수','목','금','토'].map((d,i)=>
    i%2===1?`<text x="${pad.l-6}" y="${pad.t+i*cellTotal+cellSize-2}" font-size="9" fill="var(--gray-l)" text-anchor="end">${d}</text>`:''
  ).join('');

  const totalGames=Object.values(dayCnt).reduce((a,b)=>a+b,0);
  const activeDays=Object.keys(dayCnt).length;
  const topDays=Object.entries(dayCnt).sort((a,b)=>b[1]-a[1]).slice(0,5);

  const selHeatP=players.find(p=>p.name===_heatmapSelPlayer);
  return`<div style="display:flex;flex-direction:column;gap:16px">
  <div class="ssec" id="stats-heatmap-sec">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;flex-wrap:wrap;gap:8px">
      <h4 style="margin:0">📅 활동량 히트맵 <span style="font-size:11px;color:var(--gray-l);font-weight:400">최근 1년</span></h4>
      <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
        <div style="position:relative">
          <input id="heatmap-search-input" type="text" placeholder="🔍 선수 검색 (전체보기: 비워두기)"
            value="${_heatmapSelPlayer}"
            style="font-size:12px;padding:4px 10px;border:1px solid var(--border2);border-radius:8px;width:200px"
            oninput="heatmapSearchFilter(this.value);if(!this.value){_heatmapSelPlayer='';render();}"
            onfocus="document.getElementById('heatmap-search-drop').style.display='block'"
            onblur="setTimeout(()=>{const d=document.getElementById('heatmap-search-drop');if(d)d.style.display='none'},200)">
          <div id="heatmap-search-drop" style="display:none;position:absolute;top:34px;left:0;background:var(--white);border:1px solid var(--border2);border-radius:8px;z-index:300;max-height:200px;overflow-y:auto;width:260px;box-shadow:var(--sh2)">
            <div class="sitem" style="color:var(--gray-l);font-style:italic" onmousedown="_heatmapSelPlayer='';document.getElementById('heatmap-search-input').value='';document.getElementById('heatmap-search-drop').style.display='none';render()">— 전체 경기 보기 —</div>
            ${playersWithHist.map(p=>`<div class="sitem" onmousedown="_heatmapSelPlayer='${p.name.replace(/'/g,"\'")}';document.getElementById('heatmap-search-input').value='${p.name.replace(/'/g,"\'")}';document.getElementById('heatmap-search-drop').style.display='none';render()">
              <b>${p.name}</b> <span style="color:${gc(p.univ)};font-size:11px">${p.univ}</span> <span style="color:var(--gray-l);font-size:10px">${(p.history||[]).length}경기</span>
            </div>`).join('')}
          </div>
        </div>
        ${selHeatP?`<span class="ubadge" style="background:${gc(selHeatP.univ)}">${selHeatP.univ}</span>`:''}
        <div style="display:flex;gap:12px;font-size:12px;color:var(--gray-l)">
          <span>총 <b style="color:var(--blue)">${totalGames}</b>${isPlayerMode?'경기':'게임'}</span>
          <span>활동일 <b style="color:var(--green)">${activeDays}</b>일</span>
        </div>
      </div>
    </div>
    <div style="overflow-x:auto;padding-bottom:4px">
      <svg width="${svgW}" height="${svgH}" style="display:block">
        ${monthLabels}${dayLabels}${cells}
        <text x="${pad.l}" y="${svgH-2}" font-size="9" fill="var(--gray-l)">적음</text>
        ${[0,1,2,3,4].map((v,i)=>`<rect x="${pad.l+24+i*16}" y="${svgH-12}" width="12" height="12" rx="2" fill="${heatColor(v===0?0:Math.ceil(maxCnt*v/4))}"/>`).join('')}
        <text x="${pad.l+24+5*16}" y="${svgH-2}" font-size="9" fill="var(--gray-l)">많음</text>
      </svg>
    </div>
  </div>
  <div class="ssec">
    <h4 style="margin-bottom:12px">🔥 최다 경기일 TOP 5</h4>
    <div style="display:flex;flex-direction:column;gap:6px">
      ${topDays.map(([d,c],i)=>{
        const badge=i===0?'🥇':i===1?'🥈':i===2?'🥉':`${i+1}`;
        return`<div style="display:flex;align-items:center;gap:12px;padding:8px 14px;background:var(--white);border:1px solid var(--border);border-radius:8px">
          <span style="font-size:16px">${badge}</span>
          <span style="font-weight:700;font-size:13px;color:var(--blue);min-width:96px">${d}</span>
          <div style="flex:1;background:var(--border2);border-radius:20px;height:10px;overflow:hidden">
            <div style="width:${Math.round(c/topDays[0][1]*100)}%;background:#16a34a;height:100%;border-radius:20px"></div>
          </div>
          <span style="font-weight:800;font-size:14px;color:#16a34a;min-width:40px;text-align:right">${c}게임</span>
        </div>`;
      }).join('')}
    </div>
  </div>
  </div>`;
}

/* ══════════════════════════════════════
   B. 티어별 승률 분석
══════════════════════════════════════ */
let _tierWinFilter={race:'',univ:'',gender:''};
function statsTierWinHTML(){
  const f=_tierWinFilter;
  const proIds=statsProMatchIds();
  // 각 선수의 상대 티어별 승률 분석
  // 티어 인덱스 맵
  const tierIdx={};
  TIERS.forEach((t,i)=>tierIdx[t]=i);
  const data=[];
  players.filter(p=>{
    if(f.race&&p.race!==f.race)return false;
    if(f.univ&&p.univ!==f.univ)return false;
    if(f.gender&&p.gender!==f.gender)return false;
    return true;
  }).forEach(p=>{
    const myIdx=tierIdx[p.tier]??99;
    let up={w:0,l:0}, same={w:0,l:0}, down={w:0,l:0};
    // 전체 히스토리 (프로리그 포함) 사용
    (p.history||[]).forEach(h=>{
      const opp=players.find(x=>x.name===h.opp);
      if(!opp) return;
      const oppIdx=tierIdx[opp.tier]??99;
      const diff=myIdx-oppIdx; // 음수=상위, 양수=하위
      const bucket=diff<0?up:diff===0?same:down;
      if(h.result==='승') bucket.w++; else bucket.l++;
    });
    const tot=up.w+up.l+same.w+same.l+down.w+down.l;
    if(tot<1) return; // 최소 1경기
    data.push({...p,up,same,down,tot});
  });
  data.sort((a,b)=>{
    const aUp=a.up.w+a.up.l>0?a.up.w/(a.up.w+a.up.l):0;
    const bUp=b.up.w+b.up.l>0?b.up.w/(b.up.w+b.up.l):0;
    return bUp-aUp;
  });

  const univs=getAllUnivs();
  const bar=(w,l,color)=>{
    const t=w+l; if(!t) return '<span style="color:var(--gray-l);font-size:11px">-</span>';
    const r=Math.round(w/t*100);
    return`<div style="display:flex;flex-direction:column;align-items:center;gap:2px;min-width:52px">
      <div style="font-weight:800;font-size:12px;color:${r>=50?color:'#94a3b8'}">${r}%</div>
      <div style="width:48px;height:6px;background:var(--border2);border-radius:3px;overflow:hidden">
        <div style="width:${r}%;height:100%;background:${r>=50?color:'#e2e8f0'};border-radius:3px"></div>
      </div>
      <div style="font-size:9px;color:var(--gray-l)">${w}W${l}L</div>
    </div>`;
  };

  return`<div style="display:flex;flex-direction:column;gap:14px">
  <div class="ssec" id="stats-tierwin-sec">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;flex-wrap:wrap;gap:8px">
      <h4 style="margin:0">🎯 티어별 승률 분석 <span style="font-size:11px;color:var(--gray-l);font-weight:400">(프로리그·남자 포함 전체)</span></h4>
    </div>
    <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px">
      <select onchange="_tierWinFilter.race=this.value;render()" style="font-size:12px;padding:5px 8px;border:1px solid var(--border2);border-radius:7px">
        <option value="">종족 전체</option>
        <option value="T"${f.race==='T'?' selected':''}>테란</option>
        <option value="Z"${f.race==='Z'?' selected':''}>저그</option>
        <option value="P"${f.race==='P'?' selected':''}>프로토스</option>
      </select>
      <select onchange="_tierWinFilter.univ=this.value;render()" style="font-size:12px;padding:5px 8px;border:1px solid var(--border2);border-radius:7px">
        <option value="">대학 전체</option>
        ${univs.map(u=>`<option value="${u.name}"${f.univ===u.name?' selected':''}>${u.name}</option>`).join('')}
      </select>
      <select onchange="_tierWinFilter.gender=this.value;render()" style="font-size:12px;padding:5px 8px;border:1px solid var(--border2);border-radius:7px">
        <option value="">성별 전체</option>
        <option value="M"${f.gender==='M'?' selected':''}>👨 남자</option>
        <option value="F"${f.gender==='F'?' selected':''}>👩 여자</option>
      </select>
      <button class="btn btn-w btn-sm" onclick="_tierWinFilter={race:'',univ:'',gender:''};render()">🔄 초기화</button>
    </div>
    ${data.length===0?'<p style="color:var(--gray-l);padding:20px;text-align:center">조건에 맞는 데이터 없음</p>':`
    <div style="overflow-x:auto"><table>
      <thead><tr>
        <th style="min-width:30px">순위</th><th style="min-width:80px">선수</th><th>대학</th><th>티어</th>
        <th style="min-width:70px;text-align:center">⬆️ 상위킬</th>
        <th style="min-width:70px;text-align:center">↔️ 동티어</th>
        <th style="min-width:70px;text-align:center">⬇️ 하위전</th>
        <th style="min-width:50px;text-align:center">총경기</th>
      </tr></thead><tbody>
      ${data.map((p,i)=>`<tr style="cursor:pointer" onclick="openPlayerModal('${p.name}')">
        <td>${i===0?'🥇':i===1?'🥈':i===2?'🥉':i+1}</td>
        <td style="font-weight:700;color:var(--blue)">${p.name}</td>
        <td><span class="ubadge" style="background:${gc(p.univ)}">${p.univ}</span></td>
        <td>${getTierLabel(p.tier||'-')}</td>
        <td style="text-align:center">${bar(p.up.w,p.up.l,'#7c3aed')}</td>
        <td style="text-align:center">${bar(p.same.w,p.same.l,'#2563eb')}</td>
        <td style="text-align:center">${bar(p.down.w,p.down.l,'#16a34a')}</td>
        <td style="text-align:center;color:var(--gray-l);font-size:12px">${p.tot}</td>
      </tr>`).join('')}
      </tbody>
    </table></div>`}
  </div></div>`;
}

/* ══════════════════════════════════════
   C. 맵별 선수 특화 분석
══════════════════════════════════════ */
let _mapRankSelMap='';
function statsMapRankHTML(){
  // 맵 이름: 설정된 maps + 경기 히스토리에 있는 맵 모두 합산
  const histMaps=[...new Set(players.flatMap(p=>(p.history||[]).map(h=>h.map).filter(m=>m&&m!=='-')))];
  // maps 설정 배열에서도 추가 (maps = 전체 맵 설정)
  const configMaps=(maps||[]).filter(m=>m&&m!=='-');
  const allMaps=[...new Set([...histMaps,...configMaps])].sort();
  if(!allMaps.length) return`<div class="ssec"><p style="color:var(--gray-l);padding:40px;text-align:center">맵 기록이 없습니다.<br><span style="font-size:11px">설정에서 맵을 등록하거나 경기 기록에 맵 정보를 입력해 주세요.</span></p></div>`;
  if(!_mapRankSelMap||!allMaps.includes(_mapRankSelMap)) _mapRankSelMap=allMaps[0];

  const mapData={};
  allMaps.forEach(m=>mapData[m]={});

  // ── 1차: player.history 기준으로 집계 (주 소스)
  // history의 matchId를 추적해 이중 집계 방지
  const countedMatchIds=new Set();
  players.forEach(p=>{
    (p.history||[]).forEach(h=>{
      if(!h.map||h.map==='-') return;
      if(!mapData[h.map]) mapData[h.map]={};
      if(!mapData[h.map][p.name]) mapData[h.map][p.name]={w:0,l:0,univ:p.univ,tier:p.tier};
      if(h.result==='승') mapData[h.map][p.name].w++;
      else mapData[h.map][p.name].l++;
      if(h.matchId) countedMatchIds.add(h.matchId+'_'+p.name);
    });
  });

  // ── 2차: sets.games 보완 (history에 없는 게임 - matchId 없거나 미매핑)
  const tourMatchSets=[];
  (tourneys||[]).forEach(tn=>(tn.groups||[]).forEach(grp=>(grp.matches||[]).forEach(m=>tourMatchSets.push(m))));
  const allMatchSets=[...miniM,...univM,...ckM,...comps,...proM,...tourMatchSets];
  allMatchSets.forEach(m=>{
    (m.sets||[]).forEach((set,si)=>{
      const setMap=set.map||(m.maps&&m.maps[si])||m.map||'';
      (set.games||[]).forEach(g=>{
        const mapName=g.map||setMap||'';
        if(!mapName||mapName==='-') return;
        const wn=g.winner==='A'?g.playerA:g.playerB;
        const ln=g.winner==='A'?g.playerB:g.playerA;
        // matchId로 이미 history에서 집계된 게임이면 스킵
        const wmKey=g.matchId&&wn?g.matchId+'_'+wn:'';
        const lmKey=g.matchId&&ln?g.matchId+'_'+ln:'';
        if(!mapData[mapName]) mapData[mapName]={};
        if(wn&&!countedMatchIds.has(wmKey)){
          const p=players.find(x=>x.name===wn);
          if(!mapData[mapName][wn])mapData[mapName][wn]={w:0,l:0,univ:p?.univ||'',tier:p?.tier||''};
          mapData[mapName][wn].w++;
        }
        if(ln&&!countedMatchIds.has(lmKey)){
          const p=players.find(x=>x.name===ln);
          if(!mapData[mapName][ln])mapData[mapName][ln]={w:0,l:0,univ:p?.univ||'',tier:p?.tier||''};
          mapData[mapName][ln].l++;
        }
      });
    });
  });

  // 맵 전체 통계 — 승+패 합산 후 /2 (양 선수 모두 집계되므로)
  const mapSummary=allMaps.map(m=>{
    const entries=Object.values(mapData[m]||{});
    const rawTotal=entries.reduce((s,v)=>s+v.w+v.l,0);
    const total=Math.round(rawTotal/2);
    return{name:m,games:total,players:Object.keys(mapData[m]||{}).length};
  }).sort((a,b)=>b.games-a.games||a.name.localeCompare(b.name,'ko'));

  const selData=Object.entries(mapData[_mapRankSelMap]||{})
    .map(([name,s])=>({name,w:s.w,l:s.l,univ:s.univ,tier:s.tier,tot:s.w+s.l,rate:s.w+s.l?Math.round(s.w/(s.w+s.l)*100):0}))
    .filter(p=>p.tot>=2)
    .sort((a,b)=>b.rate-a.rate||b.tot-a.tot);

  return`<div style="display:flex;flex-direction:column;gap:14px">
  <div class="ssec">
    <h4 style="margin-bottom:12px">🗺️ 맵별 경기 수 <span style="font-size:11px;color:var(--gray-l);font-weight:400">클릭하여 선택</span></h4>
    <div style="display:flex;flex-wrap:wrap;gap:6px">
      ${mapSummary.map(m=>`
        <button onclick="_mapRankSelMap='${m.name.replace(/'/g,"\\'")}';render()"
          style="padding:6px 14px;border-radius:8px;border:2px solid ${_mapRankSelMap===m.name?'var(--blue)':'var(--border2)'};background:${_mapRankSelMap===m.name?'var(--blue-l)':'var(--white)'};font-size:12px;font-weight:${_mapRankSelMap===m.name?'700':'500'};color:${_mapRankSelMap===m.name?'var(--blue)':'var(--text3)'};cursor:pointer;transition:.12s">
          ${m.name} <span style="font-size:10px;opacity:.6">${m.games}게임</span>
        </button>`).join('')}
    </div>
  </div>
  <div class="ssec" id="stats-maprank-sec">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;flex-wrap:wrap;gap:8px">
      <h4 style="margin:0">🏆 <span style="color:var(--blue)">${_mapRankSelMap}</span> 맵 강자 <span style="font-size:11px;color:var(--gray-l);font-weight:400">(2경기 이상)</span></h4>
    </div>
    ${selData.length===0?'<p style="color:var(--gray-l)">해당 맵 기록이 없습니다.</p>':`
    <div style="overflow-x:auto"><table>
      <thead><tr><th>순위</th><th>선수</th><th>대학</th><th>티어</th><th>승</th><th>패</th><th>승률</th><th>경기수</th></tr></thead>
      <tbody>
        ${selData.map((p,i)=>`<tr style="cursor:pointer" onclick="openPlayerModal('${p.name}')">
          <td>${i===0?'🥇':i===1?'🥈':i===2?'🥉':i+1}</td>
          <td style="font-weight:700;color:var(--blue)">${p.name}</td>
          <td><span class="ubadge" style="background:${gc(p.univ)}">${p.univ}</span></td>
          <td style="font-size:11px">${p.tier||'-'}</td>
          <td class="wt">${p.w}</td><td class="lt">${p.l}</td>
          <td style="font-weight:800;color:${p.rate>=50?'var(--green)':'var(--red)'}">
            ${p.rate}%
            <div style="width:48px;height:4px;background:var(--border2);border-radius:2px;display:inline-block;margin-left:4px;vertical-align:middle;overflow:hidden">
              <div style="width:${p.rate}%;height:100%;background:${p.rate>=50?'var(--green)':'var(--red)'};border-radius:2px"></div>
            </div>
          </td>
          <td>${p.tot}</td>
        </tr>`).join('')}
      </tbody>
    </table></div>`}
  </div></div>`;
}

/* ══════════════════════════════════════
   D. 대학 간 상대전적 매트릭스
══════════════════════════════════════ */
function statsUnivMatrixHTML(){
  const univs=getAllUnivs().filter(u=>players.some(p=>p.univ===u.name));
  if(univs.length<2) return`<div class="ssec"><p style="color:var(--gray-l);padding:40px;text-align:center">대학 데이터가 부족합니다.</p></div>`;

  // 대학 간 전적 매트릭스 구성
  const matrix={};
  univs.forEach(a=>{ matrix[a.name]={}; univs.forEach(b=>{ matrix[a.name][b.name]={w:0,l:0}; }); });

  players.forEach(p=>{
    (p.history||[]).forEach(h=>{
      const opp=players.find(x=>x.name===h.opp);
      if(!opp||opp.univ===p.univ) return;
      if(!matrix[p.univ]||!matrix[p.univ][opp.univ]) return;
      if(h.result==='승') matrix[p.univ][opp.univ].w++;
      else matrix[p.univ][opp.univ].l++;
    });
  });

  // 각 대학의 총 승률 계산 (정렬용)
  const univRank=univs.map(u=>{
    let w=0,l=0;
    univs.forEach(v=>{ if(u.name!==v.name){w+=matrix[u.name][v.name].w;l+=matrix[u.name][v.name].l;}});
    return{...u,w,l,rate:w+l?Math.round(w/(w+l)*100):0};
  }).sort((a,b)=>b.rate-a.rate||b.w-a.w);

  function cellBg(w,l){
    if(!w&&!l) return '#f8fafc';
    const r=w/(w+l);
    if(r>=0.6) return '#dcfce7';
    if(r>=0.5) return '#f0fdf4';
    if(r<=0.4) return '#fee2e2';
    if(r<0.5)  return '#fff5f5';
    return '#f8fafc';
  }

  return`<div class="ssec" id="stats-univmatrix-sec">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;flex-wrap:wrap;gap:8px">
      <h4 style="margin:0">🏛️ 대학 간 상대전적 매트릭스</h4>
      <button class="btn-capture btn-xs no-export" onclick="captureSection('stats-univmatrix-sec','univmatrix')">📷 이미지 저장</button>
    </div>
    <p style="font-size:11px;color:var(--gray-l);margin-bottom:10px">가로=나, 세로=상대 / 녹색=우세 빨강=열세</p>
    <div style="overflow-x:auto">
    <table style="border-collapse:collapse;font-size:12px;min-width:${60+univRank.length*72}px">
      <thead><tr>
        <th style="padding:6px 10px;background:var(--surface);border:1px solid var(--border);white-space:nowrap;min-width:80px"></th>
        ${univRank.map(u=>`<th style="padding:6px 8px;background:${gc(u.name)}22;border:1px solid var(--border);white-space:nowrap;min-width:72px">
          <div style="display:flex;flex-direction:column;align-items:center;gap:2px">
            <span style="background:${gc(u.name)};color:#fff;padding:2px 7px;border-radius:4px;font-size:11px;font-weight:700">${u.name}</span>
            <span style="font-size:10px;color:${u.rate>=50?'var(--green)':'var(--red)'};font-weight:700">${u.rate}%</span>
          </div>
        </th>`).join('')}
        <th style="padding:6px 8px;background:var(--surface);border:1px solid var(--border);white-space:nowrap">총합</th>
      </tr></thead>
      <tbody>
        ${univRank.map(u=>`<tr>
          <td style="padding:6px 10px;background:${gc(u.name)}22;border:1px solid var(--border);font-weight:700;white-space:nowrap">
            <span style="background:${gc(u.name)};color:#fff;padding:2px 7px;border-radius:4px;font-size:11px">${u.name}</span>
          </td>
          ${univRank.map(v=>{
            if(u.name===v.name) return`<td style="background:var(--border2);border:1px solid var(--border);text-align:center;color:var(--gray-l)">-</td>`;
            const s=matrix[u.name][v.name];
            const t=s.w+s.l; if(!t) return`<td style="background:#f8fafc;border:1px solid var(--border);text-align:center;color:var(--gray-l);font-size:11px">-</td>`;
            const r=Math.round(s.w/t*100);
            return`<td style="background:${cellBg(s.w,s.l)};border:1px solid var(--border);text-align:center;padding:5px 4px">
              <div style="font-weight:800;font-size:13px;color:${r>=50?'#16a34a':'#dc2626'}">${r}%</div>
              <div style="font-size:10px;color:var(--gray-l)">${s.w}W${s.l}L</div>
            </td>`;
          }).join('')}
          <td style="background:var(--surface);border:1px solid var(--border);text-align:center;padding:5px 8px">
            <div style="font-weight:800;font-size:13px;color:${u.rate>=50?'#16a34a':'#dc2626'}">${u.rate}%</div>
            <div style="font-size:10px;color:var(--gray-l)">${u.w}W${u.l}L</div>
          </td>
        </tr>`).join('')}
      </tbody>
    </table></div>
  </div>`;
}

/* ══════════════════════════════════════
   E. 종족 픽률 트렌드
══════════════════════════════════════ */
let _raceTrendMonths=12;
function statsRaceTrendHTML(){
  // 월별 종족별 경기 수 집계 (매치 sets.games + 개인 history 승자기준 합산)
  const monthData={};
  function addRace(ym,race){if(!ym||ym.length!==7)return;if(!monthData[ym])monthData[ym]={T:0,Z:0,P:0,total:0};if(race&&monthData[ym][race]!==undefined){monthData[ym][race]++;monthData[ym].total++;}}
  // 매치 sets.games 집계
  const tourMs4=[];(tourneys||[]).forEach(tn=>(tn.groups||[]).forEach(grp=>(grp.matches||[]).forEach(m=>tourMs4.push(m))));
  const allM=[...miniM,...univM,...ckM,...comps,...proM,...tourMs4];
  allM.forEach(m=>{
    const ym=(m.d||'').slice(0,7);
    (m.sets||[]).forEach(s=>(s.games||[]).forEach(g=>{
      const pA=players.find(x=>x.name===g.playerA), pB=players.find(x=>x.name===g.playerB);
      addRace(ym,pA?.race);addRace(ym,pB?.race);
    }));
  });
  // 개인 history 중 위 매치에 없는 개인전 (matchId 기준 중복 방지)
  const matchIdsInSets=new Set();
  allM.forEach(m=>(m.sets||[]).forEach(s=>(s.games||[]).forEach(g=>{if(g.matchId)matchIdsInSets.add(g.matchId);})));
  players.forEach(p=>{
    if(!p.race)return;
    (p.history||[]).forEach(h=>{
      if(h.result!=='승')return; // 승자 기준 1회만
      if(h.matchId&&matchIdsInSets.has(h.matchId))return; // 이미 집계된 것 제외
      const ym=(h.date||'').slice(0,7);
      const opp=players.find(x=>x.name===h.opp);
      addRace(ym,p.race);
      addRace(ym,opp?.race);
    });
  });

  const months=Object.keys(monthData).sort().slice(-_raceTrendMonths);
  if(!months.length) return`<div class="ssec"><p style="color:var(--gray-l);padding:40px;text-align:center">경기 기록이 없습니다.<br><span style="font-size:11px">경기 기록에 선수 정보와 종족이 입력되어야 집계됩니다.</span></p></div>`;

  return`<div style="display:flex;flex-direction:column;gap:14px">
  <div class="ssec" id="stats-racetrend-sec">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;flex-wrap:wrap;gap:8px">
      <h4 style="margin:0">🔬 종족 픽률 트렌드</h4>
      <div style="display:flex;gap:6px;align-items:center">
        <select onchange="_raceTrendMonths=parseInt(this.value);initRaceTrendChart()" style="font-size:12px;padding:4px 8px;border:1px solid var(--border2);border-radius:7px">
          <option value="6"${_raceTrendMonths===6?' selected':''}>최근 6개월</option>
          <option value="12"${_raceTrendMonths===12?' selected':''}>최근 12개월</option>
          <option value="24"${_raceTrendMonths===24?' selected':''}>최근 24개월</option>
        </select>
        <button class="btn-capture btn-xs no-export" onclick="captureSection('stats-racetrend-sec','racetrend')">📷 이미지 저장</button>
      </div>
    </div>
    <canvas id="raceTrendChart" style="width:100%;max-height:280px"></canvas>
  </div>
  <div class="ssec">
    <h4 style="margin-bottom:12px">📊 월별 종족 픽률 상세</h4>
    <div style="overflow-x:auto"><table>
      <thead><tr>
        <th>월</th>
        <th style="color:#3b82f6">⚔️ 테란</th>
        <th style="color:#7c3aed">🦟 저그</th>
        <th style="color:#d97706">🔮 프로토스</th>
        <th>총 게임</th>
      </tr></thead><tbody>
      ${months.slice().reverse().map(ym=>{
        const d=monthData[ym]; const t=d.total||1;
        const tr=Math.round(d.T/t*100), zr=Math.round(d.Z/t*100), pr=Math.round(d.P/t*100);
        return`<tr>
          <td style="font-weight:700;color:var(--text2)">${ym}</td>
          <td style="color:#3b82f6;font-weight:700">${tr}% <span style="color:var(--gray-l);font-size:10px">(${d.T})</span></td>
          <td style="color:#7c3aed;font-weight:700">${zr}% <span style="color:var(--gray-l);font-size:10px">(${d.Z})</span></td>
          <td style="color:#d97706;font-weight:700">${pr}% <span style="color:var(--gray-l);font-size:10px">(${d.P})</span></td>
          <td style="color:var(--gray-l)">${d.total}</td>
        </tr>`;
      }).join('')}
      </tbody>
    </table></div>
  </div></div>`;
}

function initRaceTrendChart(){
  const canvas=document.getElementById('raceTrendChart');
  if(!canvas) return;
  const monthData={};
  function addRace2(ym,race){if(!ym||ym.length!==7)return;if(!monthData[ym])monthData[ym]={T:0,Z:0,P:0,total:0};if(race&&monthData[ym][race]!==undefined){monthData[ym][race]++;monthData[ym].total++;}}
  const tourMs3=[];(tourneys||[]).forEach(tn=>(tn.groups||[]).forEach(grp=>(grp.matches||[]).forEach(m=>tourMs3.push(m))));
  const allM=[...miniM,...univM,...ckM,...comps,...proM,...tourMs3];
  allM.forEach(m=>{
    const ym=(m.d||'').slice(0,7);
    (m.sets||[]).forEach(s=>(s.games||[]).forEach(g=>{
      const pA=players.find(x=>x.name===g.playerA),pB=players.find(x=>x.name===g.playerB);
      addRace2(ym,pA?.race);addRace2(ym,pB?.race);
    }));
  });
  const matchIdsInSets2=new Set();
  allM.forEach(m=>(m.sets||[]).forEach(s=>(s.games||[]).forEach(g=>{if(g.matchId)matchIdsInSets2.add(g.matchId);})));
  players.forEach(p=>{
    if(!p.race)return;
    (p.history||[]).forEach(h=>{
      if(h.result!=='승')return;
      if(h.matchId&&matchIdsInSets2.has(h.matchId))return;
      const ym=(h.date||'').slice(0,7);
      const opp=players.find(x=>x.name===h.opp);
      addRace2(ym,p.race);addRace2(ym,opp?.race);
    });
  });
  const months=Object.keys(monthData).sort().slice(-_raceTrendMonths);
  if(!months.length){canvas.style.display='none';return;}
  canvas.style.display='block';
  const ctx=canvas.getContext('2d');
  const W=canvas.offsetWidth||600, H=240;
  canvas.width=W; canvas.height=H;
  const pad={t:20,r:20,b:40,l:40};
  const n=months.length;
  const races=[{k:'T',color:'#3b82f6',label:'테란'},{k:'Z',color:'#7c3aed',label:'저그'},{k:'P',color:'#d97706',label:'프로토스'}];

  ctx.clearRect(0,0,W,H);
  // 그리드
  ctx.strokeStyle='#e2e8f0'; ctx.lineWidth=1;
  [0,25,50,75,100].forEach(v=>{
    const y=pad.t+(1-v/100)*(H-pad.t-pad.b);
    ctx.beginPath();ctx.moveTo(pad.l,y);ctx.lineTo(W-pad.r,y);ctx.stroke();
    ctx.fillStyle='#94a3b8';ctx.font='10px sans-serif';ctx.textAlign='right';
    ctx.fillText(v+'%',pad.l-4,y+4);
  });

  // 각 종족 꺾은선
  races.forEach(race=>{
    const pts=months.map((ym,i)=>{
      const d=monthData[ym]; const t=d.total||1;
      const r=d[race.k]/t*100;
      return{x:pad.l+i/(n-1||1)*(W-pad.l-pad.r), y:pad.t+(1-r/100)*(H-pad.t-pad.b)};
    });
    // 그라디언트 채우기
    const grad=ctx.createLinearGradient(0,pad.t,0,H-pad.b);
    grad.addColorStop(0,race.color+'44'); grad.addColorStop(1,race.color+'08');
    ctx.beginPath(); ctx.moveTo(pts[0].x,pts[0].y);
    pts.forEach(p=>ctx.lineTo(p.x,p.y));
    ctx.lineTo(pts[pts.length-1].x,H-pad.b); ctx.lineTo(pts[0].x,H-pad.b);
    ctx.closePath(); ctx.fillStyle=grad; ctx.fill();
    // 선
    ctx.beginPath(); ctx.strokeStyle=race.color; ctx.lineWidth=2.5;
    ctx.moveTo(pts[0].x,pts[0].y); pts.forEach(p=>ctx.lineTo(p.x,p.y)); ctx.stroke();
    // 점
    pts.forEach(pt=>{
      ctx.beginPath(); ctx.arc(pt.x,pt.y,3.5,0,Math.PI*2);
      ctx.fillStyle=race.color; ctx.fill();
      ctx.strokeStyle='#fff'; ctx.lineWidth=1.5; ctx.stroke();
    });
  });

  // X축 레이블
  ctx.fillStyle='#64748b'; ctx.font='10px sans-serif'; ctx.textAlign='center';
  months.forEach((ym,i)=>{
    if(n<=12||i%2===0){
      const x=pad.l+i/(n-1||1)*(W-pad.l-pad.r);
      ctx.fillText(ym.slice(5),x,H-pad.b+14);
    }
  });

  // 범례
  let lx=pad.l;
  races.forEach(race=>{
    ctx.fillStyle=race.color; ctx.fillRect(lx,H-12,12,8);
    ctx.fillStyle='#475569'; ctx.font='10px sans-serif'; ctx.textAlign='left';
    ctx.fillText(race.label,lx+16,H-4);
    lx+=60;
  });
}

/* ══════════════════════════════════════
   NEW-1. 킬러 선수 / 피해자 선수
══════════════════════════════════════ */
let _killerSelPlayer='';
function statsKillerHTML(){
  const playersWithHistory=players.filter(p=>(p.history||[]).length>0);
  if(!_killerSelPlayer&&playersWithHistory.length)_killerSelPlayer=playersWithHistory[0].name;
  const univs=getAllUnivs();

  function calcKiller(targetName){
    const target=players.find(p=>p.name===targetName);
    if(!target)return{killers:[],victims:[]};
    const oppMap={};
    (target.history||[]).forEach(h=>{
      if(!h.opp)return;
      if(!oppMap[h.opp])oppMap[h.opp]={w:0,l:0};
      if(h.result==='승')oppMap[h.opp].w++;
      else oppMap[h.opp].l++;
    });
    const entries=Object.entries(oppMap).map(([name,s])=>{
      const opp=players.find(p=>p.name===name);
      return{name,w:s.w,l:s.l,tot:s.w+s.l,
        winRate:s.w+s.l?Math.round(s.w/(s.w+s.l)*100):0,
        univ:opp?.univ||'',elo:opp?.elo||1200};
    }).filter(e=>e.tot>=1);
    const killers=entries.filter(e=>e.l>0).sort((a,b)=>{
      const aLR=a.l/(a.w+a.l), bLR=b.l/(b.w+b.l);
      return bLR-aLR||b.l-a.l;
    }).slice(0,10);
    const victims=entries.filter(e=>e.w>0).sort((a,b)=>{
      const aWR=a.w/(a.w+a.l), bWR=b.w/(b.w+b.l);
      return bWR-aWR||b.w-a.w;
    }).slice(0,10);
    return{killers,victims};
  }

  const target=players.find(p=>p.name===_killerSelPlayer);
  const {killers,victims}=calcKiller(_killerSelPlayer);
  const tColor=gc(target?.univ||'');

  function oppRow(e,isKiller){
    const col=gc(e.univ);
    const myW=isKiller?e.l:e.w, myL=isKiller?e.w:e.l;
    const myRate=e.tot?Math.round(myW/e.tot*100):0;
    return`<div style="display:flex;align-items:center;gap:10px;padding:8px 12px;background:var(--white);border:1px solid var(--border);border-radius:8px;cursor:pointer" onclick="openPlayerModal('${e.name}')">
      ${getPlayerPhotoHTML(e.name,'28px')}
      <span style="font-weight:800;font-size:13px;color:var(--blue);min-width:65px">${e.name}${getStatusIconHTML(e.name)}</span>
      <span style="font-size:11px;color:${col};font-weight:700;min-width:55px">${e.univ}</span>
      <div style="flex:1;background:var(--border2);border-radius:20px;height:10px;overflow:hidden">
        <div style="width:${myRate}%;background:${isKiller?'var(--red)':'var(--green)'};height:100%;border-radius:20px"></div>
      </div>
      <span style="font-weight:800;font-size:12px;color:${isKiller?'var(--red)':'var(--green)'};white-space:nowrap;min-width:52px">${myRate}% (${myW}W${myL}L)</span>
      <span style="font-size:10px;color:var(--gray-l)">${e.tot}경기</span>
    </div>`;
  }

  return`<div style="display:flex;flex-direction:column;gap:14px">
  <div class="ssec">
    <h4 style="margin-bottom:12px">🗡️ 킬러 & 피해자 선수</h4>
    <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:14px">
      <span style="font-size:12px;font-weight:600;color:var(--text3)">선수 선택:</span>
      <select style="padding:6px 12px;border:1.5px solid var(--border2);border-radius:8px;font-size:13px;font-weight:600"
        onchange="_killerSelPlayer=this.value;render()">
        ${playersWithHistory.sort((a,b)=>a.name.localeCompare(b.name,'ko')).map(p=>
          `<option value="${p.name}"${_killerSelPlayer===p.name?' selected':''}>${p.name} (${p.univ})</option>`
        ).join('')}
      </select>
      ${target?`<span class="ubadge" style="background:${tColor}">${target.univ}</span>
      <span style="font-size:12px;color:var(--gray-l)">${target.win||0}승 ${target.loss||0}패</span>`:''}
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;flex-wrap:wrap">
      <div>
        <div style="font-weight:800;font-size:14px;color:var(--red);margin-bottom:8px;padding:8px 12px;background:#fef2f2;border-radius:8px;border-left:4px solid var(--red)">
          💀 나를 가장 많이 이긴 선수 (천적)
        </div>
        <div style="display:flex;flex-direction:column;gap:4px">
          ${killers.length?killers.map(e=>oppRow(e,true)).join(''):'<p style="color:var(--gray-l);padding:16px;text-align:center">천적 없음 👑</p>'}
        </div>
      </div>
      <div>
        <div style="font-weight:800;font-size:14px;color:var(--green);margin-bottom:8px;padding:8px 12px;background:#f0fdf4;border-radius:8px;border-left:4px solid var(--green)">
          🏆 내가 가장 많이 이긴 선수 (피해자)
        </div>
        <div style="display:flex;flex-direction:column;gap:4px">
          ${victims.length?victims.map(e=>oppRow(e,false)).join(''):'<p style="color:var(--gray-l);padding:16px;text-align:center">피해자 없음</p>'}
        </div>
      </div>
    </div>
  </div>
  </div>`;
}

/* ══════════════════════════════════════
   NEW-2. 요일 / 시즌별 승률
══════════════════════════════════════ */
let _seasonalFilter={gender:'',univ:'',race:''};
function statsSeasonalHTML(){
  const f=_seasonalFilter;
  const univs=getAllUnivs();
  const dayNames=['일','월','화','수','목','금','토'];
  const dayStats=Array.from({length:7},(_,i)=>({day:dayNames[i],w:0,l:0}));
  const monthStats={};

  players.filter(p=>{
    if(f.gender&&p.gender!==f.gender)return false;
    if(f.univ&&p.univ!==f.univ)return false;
    if(f.race&&p.race!==f.race)return false;
    return true;
  }).forEach(p=>{
    (p.history||[]).forEach(h=>{
      if(!h.date)return;
      const d=new Date(h.date);
      if(isNaN(d.getTime()))return;
      const dow=d.getDay();
      const ym=h.date.slice(0,7);
      if(!monthStats[ym])monthStats[ym]={w:0,l:0};
      if(h.result==='승'){dayStats[dow].w++;monthStats[ym].w++;}
      else{dayStats[dow].l++;monthStats[ym].l++;}
    });
  });

  const maxDay=Math.max(...dayStats.map(d=>d.w+d.l),1);
  const sortedMonths=Object.entries(monthStats).sort((a,b)=>a[0].localeCompare(b[0]));
  const maxMonth=Math.max(...sortedMonths.map(([,s])=>s.w+s.l),1);

  function dayColor(rate){
    if(rate>=60)return'#16a34a';if(rate>=50)return'#2563eb';if(rate>=40)return'#d97706';return'#dc2626';
  }

  return`<div style="display:flex;flex-direction:column;gap:14px">
  <div class="ssec">
    <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:12px">
      <h4 style="margin:0">📅 요일 / 시즌별 승률</h4>
      <div style="display:flex;gap:6px;flex-wrap:wrap;margin-left:auto">
        <select onchange="_seasonalFilter.gender=this.value;render()" style="font-size:12px;padding:4px 8px;border:1px solid var(--border2);border-radius:7px">
          <option value="">성별 전체</option>
          <option value="M"${f.gender==='M'?' selected':''}>👨 남자</option>
          <option value="F"${f.gender==='F'?' selected':''}>👩 여자</option>
        </select>
        <select onchange="_seasonalFilter.univ=this.value;render()" style="font-size:12px;padding:4px 8px;border:1px solid var(--border2);border-radius:7px">
          <option value="">대학 전체</option>
          ${univs.map(u=>`<option value="${u.name}"${f.univ===u.name?' selected':''}>${u.name}</option>`).join('')}
        </select>
        <select onchange="_seasonalFilter.race=this.value;render()" style="font-size:12px;padding:4px 8px;border:1px solid var(--border2);border-radius:7px">
          <option value="">종족 전체</option>
          <option value="T"${f.race==='T'?' selected':''}>테란</option>
          <option value="Z"${f.race==='Z'?' selected':''}>저그</option>
          <option value="P"${f.race==='P'?' selected':''}>프로토스</option>
        </select>
        <button class="btn btn-w btn-sm" onclick="_seasonalFilter={gender:'',univ:'',race:''};render()">🔄 초기화</button>
      </div>
    </div>
    <h4 style="font-size:13px;margin-bottom:10px">🗓️ 요일별 승률</h4>
    <div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:20px">
      ${dayStats.map((d,i)=>{
        const tot=d.w+d.l;const rate=tot?Math.round(d.w/tot*100):0;
        const col=dayColor(rate);const barH=tot?Math.round((tot/maxDay)*80)+20:0;
        const isWeekend=i===0||i===6;
        return`<div style="flex:1;min-width:70px;text-align:center;background:${isWeekend?'#fef3c7':'var(--white)'};border:1px solid var(--border);border-radius:10px;padding:12px 8px">
          <div style="font-weight:800;font-size:15px;color:${isWeekend?'var(--gold)':'var(--text)'};margin-bottom:4px">${d.day}</div>
          <div style="font-size:22px;font-weight:900;color:${col};margin-bottom:2px">${tot?rate+'%':'-'}</div>
          <div style="height:4px;background:var(--border2);border-radius:2px;overflow:hidden;margin:4px 0">
            <div style="width:${rate}%;background:${col};height:100%;border-radius:2px"></div>
          </div>
          <div style="font-size:10px;color:var(--gray-l)">${d.w}승 ${d.l}패</div>
        </div>`;
      }).join('')}
    </div>
    <h4 style="font-size:13px;margin-bottom:10px">📆 월별 승률 추이</h4>
    ${sortedMonths.length===0?'<p style="color:var(--gray-l)">기록 없음</p>':`
    <div style="overflow-x:auto">
      <div style="display:flex;align-items:flex-end;gap:6px;min-width:${sortedMonths.length*56}px;height:120px;padding-bottom:22px;position:relative">
        ${sortedMonths.map(([ym,s])=>{
          const tot=s.w+s.l;const rate=tot?Math.round(s.w/tot*100):0;
          const col=dayColor(rate);
          const barH=tot?Math.round((tot/maxMonth)*80)+10:4;
          return`<div style="display:flex;flex-direction:column;align-items:center;flex:1;min-width:48px;position:relative">
            <span style="font-size:9px;color:${col};font-weight:800;margin-bottom:2px">${rate}%</span>
            <div style="width:100%;height:${barH}px;background:${col};border-radius:4px 4px 0 0;opacity:.8;min-height:4px"></div>
            <span style="font-size:9px;color:var(--gray-l);margin-top:3px;white-space:nowrap">${ym.slice(2)}</span>
            <span style="font-size:9px;color:var(--gray-l)">${s.w}W${s.l}L</span>
          </div>`;
        }).join('')}
      </div>
    </div>`}
  </div></div>`;
}

/* ══════════════════════════════════════
   NEW-3. 클러치 지수 (에이스전 승률)
══════════════════════════════════════ */
function statsClutchHTML(){
  // 에이스 세트(ace:true) 의 게임에서 플레이한 선수들의 승률
  const aceStats={};
  const allMatchSets=[...miniM,...univM,...ckM,...comps,...proM];
  allMatchSets.forEach(m=>{
    (m.sets||[]).forEach(set=>{
      if(!set.ace)return; // ace 세트만
      (set.games||[]).forEach(g=>{
        if(!g.playerA||!g.playerB||!g.winner)return;
        const wName=g.winner==='A'?g.playerA:g.playerB;
        const lName=g.winner==='A'?g.playerB:g.playerA;
        if(!aceStats[wName])aceStats[wName]={w:0,l:0};
        if(!aceStats[lName])aceStats[lName]={w:0,l:0};
        aceStats[wName].w++;
        aceStats[lName].l++;
      });
    });
  });

  // history에서도 ace 경기 추적 (matchType이나 메모 기반은 없으니 세트 기반만 사용)
  const aceList=Object.entries(aceStats).map(([name,s])=>{
    const p=players.find(x=>x.name===name);
    if(!p)return null;
    const tot=s.w+s.l;
    const rate=tot?Math.round(s.w/tot*100):0;
    return{name,w:s.w,l:s.l,tot,rate,univ:p.univ,tier:p.tier,elo:p.elo||1200,
      totalGames:(p.win||0)+(p.loss||0),
      clutchRatio:tot>0?(s.w/tot-0.5)*2:0
    };
  }).filter(Boolean).filter(e=>e.tot>=1).sort((a,b)=>b.rate-a.rate||b.tot-a.tot);

  const topClutch=aceList.slice(0,15);
  const worstClutch=[...aceList].filter(e=>e.tot>=2).sort((a,b)=>a.rate-b.rate||b.tot-a.tot).slice(0,10);

  function clutchRow(e,i){
    const col=gc(e.univ);
    const rateCol=e.rate>=60?'#7c3aed':e.rate>=50?'var(--green)':e.rate>=40?'var(--gold)':'var(--red)';
    const badge=i===0?'🥇':i===1?'🥈':i===2?'🥉':`${i+1}`;
    return`<div style="display:flex;align-items:center;gap:10px;padding:8px 12px;background:var(--white);border:1px solid var(--border);border-radius:8px;cursor:pointer" onclick="openPlayerModal('${e.name}')">
      <span style="min-width:24px;font-size:15px">${badge}</span>
      <span style="font-weight:800;font-size:13px;color:var(--blue);min-width:65px">${e.name}</span>
      <span style="font-size:11px;color:${col};font-weight:700;min-width:55px">${e.univ}</span>
      <div style="flex:1;background:var(--border2);border-radius:20px;height:10px;overflow:hidden">
        <div style="width:${e.rate}%;background:${rateCol};height:100%;border-radius:20px"></div>
      </div>
      <span style="font-weight:900;font-size:14px;color:${rateCol};min-width:40px;text-align:right">${e.rate}%</span>
      <span style="font-size:11px;color:var(--gray-l)">${e.w}W ${e.l}L (${e.tot}경기)</span>
    </div>`;
  }

  const totalAceGames=aceList.reduce((s,e)=>s+e.tot,0)/2;

  return`<div style="display:flex;flex-direction:column;gap:14px">
  <div class="ssec">
    <h4 style="margin-bottom:6px">⚡ 클러치 지수 <span style="font-size:11px;color:var(--gray-l);font-weight:400">에이스 결정전 / 타이브레이커 승률</span></h4>
    <p style="font-size:12px;color:var(--gray-l);margin-bottom:14px">총 에이스전: ${Math.round(totalAceGames)}경기 · 경기 입력 시 세트에 <b>ACE</b> 표시된 경기만 집계됩니다</p>
    ${aceList.length===0?'<p style="color:var(--gray-l);padding:40px;text-align:center">에이스전 기록이 없습니다.<br><span style="font-size:11px">경기 입력 시 세트 설정에서 ACE 세트로 지정해 주세요.</span></p>':`
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
      <div>
        <div style="font-weight:800;font-size:13px;color:#7c3aed;margin-bottom:8px;padding:7px 12px;background:#f5f3ff;border-radius:8px;border-left:4px solid #7c3aed">🎯 클러치 킹 TOP 10</div>
        <div style="display:flex;flex-direction:column;gap:4px">${topClutch.slice(0,10).map(clutchRow).join('')}</div>
      </div>
      <div>
        <div style="font-weight:800;font-size:13px;color:var(--red);margin-bottom:8px;padding:7px 12px;background:#fef2f2;border-radius:8px;border-left:4px solid var(--red)">💧 에이스전 약자 TOP 10</div>
        <div style="display:flex;flex-direction:column;gap:4px">${worstClutch.map(clutchRow).join('')}</div>
      </div>
    </div>`}
  </div></div>`;
}

/* ══════════════════════════════════════
   NEW-4. 역대 최장 연승/연패 기록 히스토리
══════════════════════════════════════ */
function statsStreakHistHTML(){
  const allStreaks=[];
  players.forEach(p=>{
    const hist=[...(p.history||[])].sort((a,b)=>(a.date||'').localeCompare(b.date||''));
    if(!hist.length)return;
    let cur=0, curType='', startDate='', endDate='';
    hist.forEach((h,i)=>{
      if(h.result===curType){
        cur++;endDate=h.date||endDate;
      }else{
        if(cur>=3){
          allStreaks.push({name:p.name,univ:p.univ,type:curType,n:cur,start:startDate,end:endDate,elo:p.elo||1200});
        }
        cur=1;curType=h.result;startDate=h.date||'';endDate=h.date||'';
      }
      if(i===hist.length-1&&cur>=3){
        allStreaks.push({name:p.name,univ:p.univ,type:curType,n:cur,start:startDate,end:endDate,elo:p.elo||1200,current:true});
      }
    });
  });

  const winStreaks=allStreaks.filter(s=>s.type==='승').sort((a,b)=>b.n-a.n).slice(0,15);
  const loseStreaks=allStreaks.filter(s=>s.type==='패').sort((a,b)=>b.n-a.n).slice(0,15);

  function streakRow(s,i){
    const col=gc(s.univ);
    const isWin=s.type==='승';
    const badge=i===0?'🥇':i===1?'🥈':i===2?'🥉':`${i+1}`;
    return`<div style="display:flex;align-items:center;gap:10px;padding:8px 12px;background:var(--white);border:1px solid var(--border);border-radius:8px;cursor:pointer;${s.current?'border-color:'+( isWin?'#16a34a':'#dc2626')+';box-shadow:0 0 0 2px '+(isWin?'#dcfce7':'#fee2e2'):''}" onclick="openPlayerModal('${s.name}')">
      <span style="min-width:24px;font-size:15px">${badge}</span>
      <span style="font-weight:900;font-size:20px;color:${isWin?'var(--green)':'var(--red)'};min-width:48px">${s.n}</span>
      <div style="flex:1;min-width:0">
        <div style="font-weight:800;font-size:13px">${s.name} <span style="font-size:10px;color:${col};font-weight:600">${s.univ}</span>
          ${s.current?`<span style="font-size:10px;background:${isWin?'#dcfce7':'#fee2e2'};color:${isWin?'#16a34a':'#dc2626'};padding:1px 6px;border-radius:4px;font-weight:700;margin-left:4px">진행중</span>`:''}
        </div>
        <div style="font-size:10px;color:var(--gray-l)">${s.start}${s.end&&s.end!==s.start?' ~ '+s.end:''}</div>
      </div>
      <span style="font-weight:800;font-size:13px;color:${isWin?'var(--green)':'var(--red)'};white-space:nowrap">연${isWin?'승':'패'}</span>
    </div>`;
  }

  return`<div style="display:flex;flex-direction:column;gap:14px">
  <div class="ssec">
    <h4 style="margin-bottom:14px">🔥 역대 연속 기록 히스토리 <span style="font-size:11px;color:var(--gray-l);font-weight:400">(3연속 이상)</span></h4>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
      <div>
        <div style="font-weight:800;font-size:13px;color:var(--green);margin-bottom:8px;padding:7px 12px;background:#f0fdf4;border-radius:8px;border-left:4px solid var(--green)">
          🏆 역대 최장 연승 TOP 15
        </div>
        <div style="display:flex;flex-direction:column;gap:4px">
          ${winStreaks.length?winStreaks.map(streakRow).join(''):'<p style="color:var(--gray-l);padding:16px;text-align:center">기록 없음</p>'}
        </div>
      </div>
      <div>
        <div style="font-weight:800;font-size:13px;color:var(--red);margin-bottom:8px;padding:7px 12px;background:#fef2f2;border-radius:8px;border-left:4px solid var(--red)">
          ❄️ 역대 최장 연패 TOP 15
        </div>
        <div style="display:flex;flex-direction:column;gap:4px">
          ${loseStreaks.length?loseStreaks.map(streakRow).join(''):'<p style="color:var(--gray-l);padding:16px;text-align:center">기록 없음</p>'}
        </div>
      </div>
    </div>
  </div></div>`;
}

/* ══════════════════════════════════════
   NEW-5. 티어별 승률 (상대 티어 기준 매트릭스)
══════════════════════════════════════ */
function statsTierMatchHTML(){
  // 실제 TIERS 배열 기반 (G, K, JA, J, S, 유스, 숫자티어 등)
  const TIER_PALETTE=['#7c3aed','#dc2626','#2563eb','#16a34a','#0f172a','#0891b2','#d97706','#64748b','#9f1239','#065f46','#1e3a8a','#713f12','#3f3f46','#7c2d12','#166534'];
  // 실제 사용된 티어만 추출 (모든 선수의 tier 중 실제 데이터 있는 것)
  const usedTiers=[...new Set(players.map(p=>p.tier).filter(Boolean))].sort((a,b)=>TIERS.indexOf(a)-TIERS.indexOf(b));
  if(!usedTiers.length)return`<div class="ssec"><p style="color:var(--gray-l);padding:40px;text-align:center">티어 데이터가 없습니다.</p></div>`;

  const tierColor={};
  usedTiers.forEach((t,i)=>{
    const presets={G:'#091540',K:'#102058',JA:'#182d80',J:'#2040a8',S:'#2d52c8',
      '0티어':'#3860d8',
      '1티어':'#4070e0','2티어':'#5888f0','3티어':'#6e9ef8','4티어':'#84b4ff',
      '5티어':'#9ecaff','6티어':'#b2dcff','7티어':'#c6ecff','8티어':'#d8f4ff','유스':'#fbbf24'};
    tierColor[t]=presets[t]||TIER_PALETTE[i%TIER_PALETTE.length];
  });

  // 모든 히스토리 포함 (프로리그 포함, 남자 포함)
  const matrix={};
  usedTiers.forEach(t1=>{matrix[t1]={};usedTiers.forEach(t2=>{matrix[t1][t2]={w:0,l:0};});});

  players.forEach(p=>{
    const myTier=p.tier||'';
    if(!myTier||!matrix[myTier])return;
    (p.history||[]).forEach(h=>{
      const opp=players.find(x=>x.name===h.opp);
      const oppTier=opp?.tier||'';
      if(!oppTier||!matrix[myTier][oppTier])return;
      if(h.result==='승')matrix[myTier][oppTier].w++;
      else matrix[myTier][oppTier].l++;
    });
  });

  const tierOverview=usedTiers.map(t=>{
    let w=0,l=0;
    usedTiers.forEach(t2=>{w+=matrix[t][t2].w;l+=matrix[t][t2].l;});
    return{tier:t,w,l,rate:w+l?Math.round(w/(w+l)*100):null};
  }).filter(t=>t.w+t.l>0); // 경기 없는 티어 제외

  const activeTiers=usedTiers.filter(t=>tierOverview.some(ov=>ov.tier===t));

  function cellStyle(w,l){
    if(!w&&!l)return'background:#f8fafc;color:#94a3b8';
    const r=w/(w+l);
    if(r>=0.65)return'background:#dcfce7;color:#16a34a';
    if(r>=0.5)return'background:#f0fdf4;color:#16a34a';
    if(r<=0.35)return'background:#fee2e2;color:#dc2626';
    if(r<0.5)return'background:#fff5f5;color:#dc2626';
    return'background:#f8fafc;color:#374151';
  }

  if(!activeTiers.length)return`<div class="ssec"><p style="color:var(--gray-l);padding:40px;text-align:center">티어 간 경기 기록이 없습니다.<br><span style="font-size:11px">선수에 티어가 설정되고 경기 기록이 있어야 합니다.</span></p></div>`;

  return`<div style="display:flex;flex-direction:column;gap:14px">
  <div class="ssec">
    <h4 style="margin-bottom:6px">🎖️ 티어 간 상대전적 매트릭스 <span style="font-size:11px;color:var(--gray-l);font-weight:400">전 경기 포함 (프로리그·남자 포함)</span></h4>
    <p style="font-size:11px;color:var(--gray-l);margin-bottom:12px">가로=내 티어 / 세로=상대 티어 / 녹색=우세 빨강=열세</p>
    <div style="overflow-x:auto">
    <table style="border-collapse:collapse;font-size:12px;min-width:${100+activeTiers.length*72}px">
      <thead><tr>
        <th style="padding:8px 12px;background:var(--surface);border:1px solid var(--border);white-space:nowrap">내↓ / 상대→</th>
        ${activeTiers.map(t=>`<th style="padding:6px 8px;background:${tierColor[t]}22;border:1px solid var(--border);white-space:nowrap;min-width:72px">
          <span style="background:${tierColor[t]};color:#fff;padding:2px 7px;border-radius:4px;font-size:11px;font-weight:700">${getTierLabel(t)}</span>
        </th>`).join('')}
        <th style="padding:6px 8px;background:var(--surface);border:1px solid var(--border);white-space:nowrap">전체</th>
      </tr></thead>
      <tbody>
        ${activeTiers.map(t1=>{
          const ov=tierOverview.find(x=>x.tier===t1);
          return`<tr>
            <td style="padding:6px 10px;background:${tierColor[t1]}22;border:1px solid var(--border);font-weight:700;white-space:nowrap">
              <span style="background:${tierColor[t1]};color:#fff;padding:2px 7px;border-radius:4px;font-size:11px">${getTierLabel(t1)}</span>
            </td>
            ${activeTiers.map(t2=>{
              if(t1===t2){
                const s=matrix[t1][t2];const tot=s.w+s.l;
                const r=tot?Math.round(s.w/tot*100):null;
                return`<td style="padding:6px 8px;border:1px solid var(--border);text-align:center;background:var(--border2)">
                  <div style="font-size:9px;color:var(--gray-l);font-weight:600">동티어</div>
                  ${tot?`<div style="font-weight:800;font-size:12px;color:${r>=50?'var(--green)':'var(--red)'}">${r}%</div>
                  <div style="font-size:10px;color:var(--gray-l)">${s.w}W${s.l}L</div>`:'<div style="color:var(--gray-l);font-size:11px">-</div>'}
                </td>`;
              }
              const s=matrix[t1][t2];const tot=s.w+s.l;
              const r=tot?Math.round(s.w/tot*100):null;
              const cs=cellStyle(s.w,s.l);
              return`<td style="padding:5px 6px;border:1px solid var(--border);text-align:center;${cs}">
                ${tot?`<div style="font-weight:800;font-size:12px">${r}%</div>
                <div style="font-size:10px;opacity:.7">${s.w}W${s.l}L</div>`:'<span style="color:#94a3b8;font-size:11px">-</span>'}
              </td>`;
            }).join('')}
            <td style="padding:5px 8px;border:1px solid var(--border);text-align:center;background:var(--surface)">
              ${ov&&ov.rate!==null?`<div style="font-weight:800;font-size:12px;color:${ov.rate>=50?'var(--green)':'var(--red)'}">${ov.rate}%</div>
              <div style="font-size:10px;color:var(--gray-l)">${ov.w}W${ov.l}L</div>`:'<span style="color:var(--gray-l)">-</span>'}
            </td>
          </tr>`;
        }).join('')}
      </tbody>
    </table></div>
  </div>
  <div class="ssec">
    <h4 style="margin-bottom:12px">📊 티어별 전체 승률 요약</h4>
    <div style="display:flex;flex-wrap:wrap;gap:10px">
      ${tierOverview.map(t=>{
        const col=tierColor[t.tier]||'#6b7280';
        const tot=t.w+t.l;
        return`<div style="flex:1;min-width:90px;background:var(--white);border:2px solid ${col}33;border-radius:12px;padding:12px;text-align:center">
          <div style="background:${col};color:#fff;padding:2px 9px;border-radius:5px;font-weight:800;font-size:12px;display:inline-block;margin-bottom:6px">${getTierLabel(t.tier)}</div>
          <div style="font-size:24px;font-weight:900;color:${col}">${t.rate!==null?t.rate+'%':'-'}</div>
          <div style="font-size:10px;color:var(--gray-l);margin-top:3px">${t.w}승 ${t.l}패</div>
          ${tot?`<div style="height:4px;background:var(--border2);border-radius:2px;overflow:hidden;margin-top:5px">
            <div style="width:${t.rate||0}%;background:${col};height:100%;border-radius:2px"></div>
          </div>`:''}
        </div>`;
      }).join('')}
    </div>
  </div></div>`;
}

/* ══════════════════════════════════════
   NEW-6. 대학 간 상대전적 매트릭스 상세 (+ 선수별 드릴다운)
══════════════════════════════════════ */
let _matrix2Sel={a:'',b:''};
function statsUnivMatrix2HTML(){
  const univs=getAllUnivs().filter(u=>players.some(p=>p.univ===u.name));
  if(univs.length<2)return`<div class="ssec"><p style="color:var(--gray-l)">대학 데이터 부족</p></div>`;

  const matrix={};
  const playerMatrix={}; // playerMatrix[univA][univB]={playerA:{vs_playerB:{w,l}}}
  univs.forEach(a=>{
    matrix[a.name]={};
    playerMatrix[a.name]={};
    univs.forEach(b=>{
      matrix[a.name][b.name]={w:0,l:0};
      playerMatrix[a.name][b.name]={};
    });
  });

  players.forEach(p=>{
    (p.history||[]).forEach(h=>{
      const opp=players.find(x=>x.name===h.opp);
      if(!opp||opp.univ===p.univ)return;
      if(!matrix[p.univ]||!matrix[p.univ][opp.univ])return;
      if(h.result==='승')matrix[p.univ][opp.univ].w++;
      else matrix[p.univ][opp.univ].l++;
      // 선수별 매트릭스
      if(!playerMatrix[p.univ][opp.univ][p.name])playerMatrix[p.univ][opp.univ][p.name]={};
      if(!playerMatrix[p.univ][opp.univ][p.name][opp.name])playerMatrix[p.univ][opp.univ][p.name][opp.name]={w:0,l:0};
      if(h.result==='승')playerMatrix[p.univ][opp.univ][p.name][opp.name].w++;
      else playerMatrix[p.univ][opp.univ][p.name][opp.name].l++;
    });
  });

  const univRank=univs.map(u=>{
    let w=0,l=0;
    univs.forEach(v=>{if(u.name!==v.name){w+=matrix[u.name][v.name].w;l+=matrix[u.name][v.name].l;}});
    return{...u,w,l,rate:w+l?Math.round(w/(w+l)*100):0};
  }).sort((a,b)=>b.rate-a.rate||b.w-a.w);

  if(!_matrix2Sel.a&&univRank.length)_matrix2Sel.a=univRank[0].name;
  if(!_matrix2Sel.b&&univRank.length>1)_matrix2Sel.b=univRank[1].name;

  // 선택된 두 대학의 선수별 상세
  let detailHTML='';
  if(_matrix2Sel.a&&_matrix2Sel.b&&_matrix2Sel.a!==_matrix2Sel.b){
    const pmAB=playerMatrix[_matrix2Sel.a]?.[_matrix2Sel.b]||{};
    const pmBA=playerMatrix[_matrix2Sel.b]?.[_matrix2Sel.a]||{};
    const sAB=matrix[_matrix2Sel.a]?.[_matrix2Sel.b]||{w:0,l:0};
    const sBA=matrix[_matrix2Sel.b]?.[_matrix2Sel.a]||{w:0,l:0};
    const colA=gc(_matrix2Sel.a), colB=gc(_matrix2Sel.b);

    // A팀 선수별 vs B팀
    const aPlayers=Object.entries(pmAB).map(([pName,opps])=>{
      let w=0,l=0;Object.values(opps).forEach(s=>{w+=s.w;l+=s.l;});
      return{name:pName,w,l,tot:w+l,rate:w+l?Math.round(w/(w+l)*100):0,opps};
    }).sort((a,b)=>b.w-a.w);

    detailHTML=`
    <div class="ssec" style="margin-top:0">
      <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:14px">
        <select style="padding:6px 10px;border:1.5px solid ${colA};border-radius:8px;font-size:13px;font-weight:700;color:${colA}"
          onchange="_matrix2Sel.a=this.value;render()">
          ${univRank.map(u=>`<option value="${u.name}"${_matrix2Sel.a===u.name?' selected':''}>${u.name}</option>`).join('')}
        </select>
        <span style="font-weight:900;font-size:18px;color:var(--gray-l)">vs</span>
        <select style="padding:6px 10px;border:1.5px solid ${colB};border-radius:8px;font-size:13px;font-weight:700;color:${colB}"
          onchange="_matrix2Sel.b=this.value;render()">
          ${univRank.map(u=>`<option value="${u.name}"${_matrix2Sel.b===u.name?' selected':''}>${u.name}</option>`).join('')}
        </select>
        <div style="margin-left:auto;display:flex;gap:12px;align-items:center">
          <span style="background:${colA};color:#fff;padding:4px 14px;border-radius:8px;font-weight:800">${_matrix2Sel.a} ${sAB.w}W ${sAB.l}L</span>
          <span style="font-weight:900;font-size:15px">vs</span>
          <span style="background:${colB};color:#fff;padding:4px 14px;border-radius:8px;font-weight:800">${_matrix2Sel.b} ${sBA.w}W ${sBA.l}L</span>
        </div>
      </div>
      <div style="overflow-x:auto">
      <table>
        <thead><tr>
          <th style="background:${colA}22">${_matrix2Sel.a} 선수</th>
          <th style="background:${colA}22">승</th><th style="background:${colA}22">패</th><th style="background:${colA}22">승률</th>
          <th>vs 상대 선수 (${_matrix2Sel.b})</th>
        </tr></thead>
        <tbody>
          ${aPlayers.map(p=>{
            const oppDetail=Object.entries(p.opps).map(([oName,s])=>`
              <span style="display:inline-flex;align-items:center;gap:3px;padding:2px 8px;background:${s.w>s.l?'#dcfce7':s.w<s.l?'#fee2e2':'#f1f5f9'};border-radius:6px;font-size:11px;cursor:pointer;margin:1px" onclick="openPlayerModal('${oName}')">
                <b>${oName}</b> ${s.w}W${s.l}L
              </span>`).join('');
            return`<tr>
              <td style="font-weight:700;cursor:pointer;color:var(--blue)" onclick="openPlayerModal('${p.name}')">${p.name}</td>
              <td class="wt">${p.w}</td><td class="lt">${p.l}</td>
              <td style="font-weight:800;color:${p.rate>=50?'var(--green)':'var(--red)'}">${p.tot?p.rate+'%':'-'}</td>
              <td>${oppDetail||'<span style="color:var(--gray-l);font-size:11px">-</span>'}</td>
            </tr>`;
          }).join('')}
        </tbody>
      </table></div>
    </div>`;
  }

  function cellBg(w,l){
    if(!w&&!l)return'#f8fafc';const r=w/(w+l);
    if(r>=0.6)return'#dcfce7';if(r>=0.5)return'#f0fdf4';if(r<=0.4)return'#fee2e2';if(r<0.5)return'#fff5f5';return'#f8fafc';
  }

  return`<div style="display:flex;flex-direction:column;gap:14px">
  <div class="ssec" id="stats-univmatrix2-sec">
    <h4 style="margin-bottom:12px">🏛️ 대학 간 상대전적 매트릭스 (상세)</h4>
    <div style="overflow-x:auto">
    <table style="border-collapse:collapse;font-size:12px;min-width:${60+univRank.length*72}px">
      <thead><tr>
        <th style="padding:6px 10px;background:var(--surface);border:1px solid var(--border)">↓나 / 상대→</th>
        ${univRank.map(u=>`<th style="padding:6px 8px;background:${gc(u.name)}22;border:1px solid var(--border);white-space:nowrap;min-width:72px">
          <div style="display:flex;flex-direction:column;align-items:center;gap:2px">
            <span style="background:${gc(u.name)};color:#fff;padding:2px 7px;border-radius:4px;font-size:11px;font-weight:700">${u.name}</span>
            <span style="font-size:10px;color:${u.rate>=50?'var(--green)':'var(--red)'};font-weight:700">${u.rate}%</span>
          </div>
        </th>`).join('')}
      </tr></thead>
      <tbody>
        ${univRank.map(u=>`<tr>
          <td style="padding:6px 10px;background:${gc(u.name)}22;border:1px solid var(--border);font-weight:700;white-space:nowrap">
            <span style="background:${gc(u.name)};color:#fff;padding:2px 7px;border-radius:4px;font-size:11px">${u.name}</span>
          </td>
          ${univRank.map(v=>{
            if(u.name===v.name)return`<td style="background:var(--border2);border:1px solid var(--border);text-align:center;color:var(--gray-l)">-</td>`;
            const s=matrix[u.name][v.name];const t=s.w+s.l;if(!t)return`<td style="background:#f8fafc;border:1px solid var(--border);text-align:center;color:var(--gray-l);font-size:11px">-</td>`;
            const r=Math.round(s.w/t*100);
            return`<td style="background:${cellBg(s.w,s.l)};border:1px solid var(--border);text-align:center;padding:5px 4px;cursor:pointer"
              onclick="_matrix2Sel.a='${u.name}';_matrix2Sel.b='${v.name}';document.getElementById('matrix2-detail').scrollIntoView({behavior:'smooth'})">
              <div style="font-weight:800;font-size:13px;color:${r>=50?'#16a34a':'#dc2626'}">${r}%</div>
              <div style="font-size:10px;color:var(--gray-l)">${s.w}W${s.l}L</div>
            </td>`;
          }).join('')}
        </tr>`).join('')}
      </tbody>
    </table></div>
    <p style="font-size:11px;color:var(--gray-l);margin-top:6px">셀 클릭 시 아래 선수별 상세 표시</p>
  </div>
  <div id="matrix2-detail">${detailHTML}</div>
  </div>`;
}

/* ══════════════════════════════════════
   F. CSV / 엑셀 내보내기
══════════════════════════════════════ */
function statsCsvExportHTML(){
  if(!isLoggedIn)return`<div class="ssec"><div style="padding:40px;text-align:center;color:var(--gray-l)">🔒 관리자만 사용 가능합니다.</div></div>`;
  return`<div style="display:flex;flex-direction:column;gap:14px">
  <div class="ssec">
    <h4 style="margin-bottom:14px">📥 CSV / 데이터 내보내기</h4>
    <div style="display:flex;flex-wrap:wrap;gap:10px">

      <!-- 선수 전적 -->
      <div style="background:var(--white);border:1px solid var(--border);border-radius:12px;padding:18px;flex:1;min-width:220px">
        <div style="font-size:20px;margin-bottom:6px">👤</div>
        <div style="font-weight:800;font-size:14px;margin-bottom:4px">선수 전적 CSV</div>
        <div style="font-size:11px;color:var(--gray-l);margin-bottom:12px">이름, 대학, 티어, 종족, 승, 패, 승률, ELO, 포인트</div>
        <button class="btn btn-b btn-sm" onclick="csvDownloadPlayers()">📥 다운로드</button>
      </div>

      <!-- 경기 히스토리 -->
      <div style="background:var(--white);border:1px solid var(--border);border-radius:12px;padding:18px;flex:1;min-width:220px">
        <div style="font-size:20px;margin-bottom:6px">📋</div>
        <div style="font-weight:800;font-size:14px;margin-bottom:4px">경기 히스토리 CSV</div>
        <div style="font-size:11px;color:var(--gray-l);margin-bottom:12px">날짜, 승자, 패자, 맵, ELO변화, 매치ID</div>
        <button class="btn btn-b btn-sm" onclick="csvDownloadHistory()">📥 다운로드</button>
      </div>

      <!-- 대학별 통계 -->
      <div style="background:var(--white);border:1px solid var(--border);border-radius:12px;padding:18px;flex:1;min-width:220px">
        <div style="font-size:20px;margin-bottom:6px">🏛️</div>
        <div style="font-weight:800;font-size:14px;margin-bottom:4px">대학별 통계 CSV</div>
        <div style="font-size:11px;color:var(--gray-l);margin-bottom:12px">대학, 총승, 총패, 승률, 선수수</div>
        <button class="btn btn-b btn-sm" onclick="csvDownloadUniv()">📥 다운로드</button>
      </div>

      <!-- 맵별 통계 -->
      <div style="background:var(--white);border:1px solid var(--border);border-radius:12px;padding:18px;flex:1;min-width:220px">
        <div style="font-size:20px;margin-bottom:6px">🗺️</div>
        <div style="font-weight:800;font-size:14px;margin-bottom:4px">맵별 통계 CSV</div>
        <div style="font-size:11px;color:var(--gray-l);margin-bottom:12px">맵, 총경기, 승횟수, 패횟수</div>
        <button class="btn btn-b btn-sm" onclick="csvDownloadMaps()">📥 다운로드</button>
      </div>

      <!-- 전체 백업 JSON -->
      <div style="background:var(--white);border:1px solid var(--border);border-radius:12px;padding:18px;flex:1;min-width:220px">
        <div style="font-size:20px;margin-bottom:6px">💾</div>
        <div style="font-weight:800;font-size:14px;margin-bottom:4px">전체 백업 JSON</div>
        <div style="font-size:11px;color:var(--gray-l);margin-bottom:12px">모든 데이터 JSON 백업 (기존 기능)</div>
        <button class="btn btn-w btn-sm" onclick="doExport()">📤 JSON 백업</button>
      </div>
    </div>
  </div>
  </div>`;
}

function _csvDownload(filename, rows){
  const BOM='\uFEFF'; // 한글 깨짐 방지
  const csv=BOM+rows.map(r=>r.map(v=>{
    const s=String(v??'');
    return s.includes(',')||s.includes('"')||s.includes('\n')?'"'+s.replace(/"/g,'""')+'"':s;
  }).join(',')).join('\n');
  const b=new Blob([csv],{type:'text/csv;charset=utf-8'});
  const url=URL.createObjectURL(b);
  const a=document.createElement('a');
  a.href=url; a.download=filename;
  document.body.appendChild(a); a.click();
  setTimeout(()=>{document.body.removeChild(a);URL.revokeObjectURL(url);},100);
}

function csvDownloadPlayers(){
  const proIds=statsProMatchIds();
  const rows=[['이름','대학','티어','종족','성별','승(전체)','패(전체)','승률(전체)','ELO','포인트']];
  players.forEach(p=>{
    const h=statsNonProHist(p);
    const w=h.filter(x=>x.result==='승').length, l=h.filter(x=>x.result==='패').length;
    const tot=w+l;
    rows.push([p.name,p.univ,p.tier||'-',p.race||'-',p.gender==='M'?'남':'여',
      p.win,p.loss,tot?Math.round(p.win/p.loss||0)+'%':'-',p.elo||1200,p.points||0]);
  });
  _csvDownload(`선수전적_${new Date().toISOString().slice(0,10)}.csv`, rows);
}

function csvDownloadHistory(){
  const rows=[['날짜','승자','승자대학','승자종족','패자','패자대학','패자종족','맵','ELO변화(승자)','매치ID']];
  players.forEach(p=>{
    (p.history||[]).forEach(h=>{
      if(h.result!=='승') return; // 승자 기준 1회만
      const opp=players.find(x=>x.name===h.opp);
      rows.push([h.date||'',p.name,p.univ,p.race||'-',
        h.opp,opp?.univ||'-',h.oppRace||'-',
        h.map||'-',h.eloDelta!=null?h.eloDelta:'',h.matchId||'']);
    });
  });
  rows.sort((a,b)=>(a[0]||'').localeCompare(b[0]||''));
  _csvDownload(`경기히스토리_${new Date().toISOString().slice(0,10)}.csv`, rows);
}

function csvDownloadUniv(){
  const univs=getAllUnivs();
  const rows=[['대학','선수수','총승','총패','승률']];
  univs.forEach(u=>{
    const mems=players.filter(p=>p.univ===u.name);
    let w=0,l=0;
    mems.forEach(p=>{ const h=statsNonProHist(p); w+=h.filter(x=>x.result==='승').length; l+=h.filter(x=>x.result==='패').length; });
    const rate=w+l?Math.round(w/(w+l)*100):0;
    rows.push([u.name,mems.length,w,l,rate+'%']);
  });
  _csvDownload(`대학별통계_${new Date().toISOString().slice(0,10)}.csv`, rows);
}

function csvDownloadMaps(){
  const mapStats={};
  players.forEach(p=>(p.history||[]).forEach(h=>{
    if(!h.map||h.map==='-') return;
    if(!mapStats[h.map]) mapStats[h.map]={w:0,l:0};
    if(h.result==='승') mapStats[h.map].w++; else mapStats[h.map].l++;
  }));
  const rows=[['맵','총경기','승횟수','패횟수','승률']];
  Object.entries(mapStats).sort((a,b)=>(b[1].w+b[1].l)-(a[1].w+a[1].l)).forEach(([m,s])=>{
    const tot=s.w+s.l;
    rows.push([m,tot,s.w,s.l,tot?Math.round(s.w/tot*100)+'%':'-']);
  });
  _csvDownload(`맵별통계_${new Date().toISOString().slice(0,10)}.csv`, rows);
}

/* ══════════════════════════════════════
   9. 선수 검색 고급 필터
══════════════════════════════════════ */
let _advFilter={tier:'',race:'',univ:'',gender:'',minElo:'',maxElo:'',minGames:'',name:'',sort:'elo', shuffle: false};
function statsAdvSearchHTML(){
  const f=_advFilter;
  const univs=getAllUnivs();
  let list=[...players].filter(p=>{
    if(f.name&&!p.name.includes(f.name))return false;
    if(f.tier&&p.tier!==f.tier)return false;
    if(f.race&&p.race!==f.race)return false;
    if(f.univ&&p.univ!==f.univ)return false;
    if(f.gender&&p.gender!==f.gender)return false;
    const elo=p.elo||1200;
    if(f.minElo&&elo<parseInt(f.minElo))return false;
    if(f.maxElo&&elo>parseInt(f.maxElo))return false;
    const tot=(p.history||[]).length;
    if(f.minGames&&tot<parseInt(f.minGames))return false;
    return true;
  });
  const proIds=statsProMatchIds();
  list=list.map(p=>{
    let w,l,tot;
    if(tierRankModeFilter==='전체'){
      const hh=statsNonProHist(p);
      w=hh.filter(x=>x.result==='승').length;l=hh.filter(x=>x.result==='패').length;
    } else if(tierRankModeFilter==='대회(조별리그)'){
      const mh=(p.history||[]).filter(x=>x.mode==='대회'||x.mode==='조별리그'||x.mode==='토너먼트');
      w=mh.filter(x=>x.result==='승').length;l=mh.filter(x=>x.result==='패').length;
    } else if(tierRankModeFilter==='대학CK'){
      const mh=(p.history||[]).filter(x=>x.mode==='대학CK');
      w=mh.filter(x=>x.result==='승').length;l=mh.filter(x=>x.result==='패').length;
    } else {
      const mh=(p.history||[]).filter(x=>x.mode===tierRankModeFilter);
      w=mh.filter(x=>x.result==='승').length;l=mh.filter(x=>x.result==='패').length;
    }
    tot=w+l;
    return{...p,_w:w,_l:l,_tot:tot,_rate:tot?Math.round(w/tot*100):0,_elo:p.elo||1200};
  });
  if(f.sort==='elo') list.sort((a,b)=>b._elo-a._elo);
  else if(f.sort==='win') list.sort((a,b)=>b._w-a._w);
  else if(f.sort==='loss') list.sort((a,b)=>b._l-a._l);
  else if(f.sort==='rate') list.sort((a,b)=>b._rate-a._rate||b._tot-a._tot);
  else if(f.sort==='games') list.sort((a,b)=>b._tot-a._tot);
  else if(f.sort==='name') list.sort((a,b)=>a.name.localeCompare(b.name));
  else if(f.sort==='shuffle') list.sort(()=>Math.random()-0.5);
  return`<div style="display:flex;flex-direction:column;gap:14px">
  <div class="ssec" id="stats-advsearch-sec">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;flex-wrap:wrap;gap:8px">
      <h4 style="margin:0">🔍 선수 고급 검색 필터</h4>
      <button class="btn-capture btn-xs no-export" onclick="captureSection('stats-advsearch-sec','advsearch')">📷 이미지 저장</button>
    </div>
    <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:6px">
      ${['전체','미니대전','대학대전','대학CK','대회(조별리그)','프로리그'].map(m=>`<button onclick="tierRankModeFilter='${m}';render()" style="padding:5px 14px;border-radius:20px;border:2px solid ${tierRankModeFilter===m?'var(--blue)':'var(--border2)'};background:${tierRankModeFilter===m?'var(--blue)':'var(--white)'};color:${tierRankModeFilter===m?'#fff':'var(--text3)'};font-size:12px;font-weight:${tierRankModeFilter===m?'700':'500'};cursor:pointer;transition:.12s">${m}</button>`).join('')}
    </div>
    <div style="display:flex;gap:5px;flex-wrap:wrap;margin-bottom:10px">
      ${[['미니대전','win','미니대전 승순','#7c3aed'],['미니대전','loss','미니대전 패순','#7c3aed'],['대학CK','win','대학CK 승순','#dc2626'],['대학CK','loss','대학CK 패순','#dc2626'],['대회(조별리그)','win','대회 승순','#d97706'],['대회(조별리그)','loss','대회 패순','#d97706']].map(([mode,sort,lbl,col])=>{
        const on=tierRankModeFilter===mode&&_advFilter.sort===sort;
        return`<button onclick="tierRankModeFilter='${mode}';_advFilter.sort='${sort}';render()" style="padding:3px 10px;border-radius:14px;border:1.5px solid ${on?col:'var(--border2)'};background:${on?col+'22':'var(--white)'};color:${on?col:'var(--text3)'};font-size:11px;font-weight:${on?'700':'500'};cursor:pointer;transition:.12s">${lbl}</button>`;
      }).join('')}
    </div>
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px">
      <input type="text" placeholder="🔍 이름 검색..." value="${f.name}" oninput="_advFilter.name=this.value;render()" style="padding:6px 12px;border:1px solid var(--border2);border-radius:8px;font-size:12px;width:150px">
      <select onchange="_advFilter.univ=this.value;render()" style="font-size:12px;padding:6px 10px;border:1px solid var(--border2);border-radius:8px">
        <option value="">대학 전체</option>
        ${univs.map(u=>`<option value="${u.name}"${f.univ===u.name?' selected':''}>${u.name}</option>`).join('')}
      </select>
      <select onchange="_advFilter.tier=this.value;render()" style="font-size:12px;padding:6px 10px;border:1px solid var(--border2);border-radius:8px">
        <option value="">티어 전체</option>
        ${TIERS.map(t=>`<option value="${t}"${f.tier===t?' selected':''}>${getTierLabel(t)}</option>`).join('')}
      </select>
      <select onchange="_advFilter.race=this.value;render()" style="font-size:12px;padding:6px 10px;border:1px solid var(--border2);border-radius:8px">
        <option value="">종족 전체</option>
        <option value="T"${f.race==='T'?' selected':''}>테란</option>
        <option value="Z"${f.race==='Z'?' selected':''}>저그</option>
        <option value="P"${f.race==='P'?' selected':''}>프로토스</option>
      </select>
      <select onchange="_advFilter.gender=this.value;render()" style="font-size:12px;padding:6px 10px;border:1px solid var(--border2);border-radius:8px">
        <option value="">성별 전체</option>
        <option value="M"${f.gender==='M'?' selected':''}>남자</option>
        <option value="F"${f.gender==='F'?' selected':''}>여자</option>
      </select>
      <input type="number" placeholder="최소ELO" value="${f.minElo}" oninput="_advFilter.minElo=this.value;render()" style="width:80px;padding:6px 8px;border:1px solid var(--border2);border-radius:8px;font-size:12px">
      <input type="number" placeholder="최대ELO" value="${f.maxElo}" oninput="_advFilter.maxElo=this.value;render()" style="width:80px;padding:6px 8px;border:1px solid var(--border2);border-radius:8px;font-size:12px">
      <input type="number" placeholder="최소경기수" value="${f.minGames}" oninput="_advFilter.minGames=this.value;render()" style="width:90px;padding:6px 8px;border:1px solid var(--border2);border-radius:8px;font-size:12px">
      <select onchange="_advFilter.sort=this.value;render()" style="font-size:12px;padding:6px 10px;border:1px solid var(--border2);border-radius:8px">
        <option value="elo"${f.sort==='elo'?' selected':''}>ELO순</option>
        <option value="win"${f.sort==='win'?' selected':''}>승수순</option>
        <option value="loss"${f.sort==='loss'?' selected':''}>패수순</option>
        <option value="rate"${f.sort==='rate'?' selected':''}>승률순</option>
        <option value="games"${f.sort==='games'?' selected':''}>경기수순</option>
        <option value="name"${f.sort==='name'?' selected':''}>이름순</option>
        <option value="shuffle"${f.sort==='shuffle'?' selected':''}>무작위</option>
      </select>
      <button class="btn btn-w btn-sm" onclick="_advFilter={tier:'',race:'',univ:'',gender:'',minElo:'',maxElo:'',minGames:'',name:'',sort:'elo', shuffle: false};render()">🔄 초기화</button>
    </div>
    <div style="font-size:12px;color:var(--gray-l);margin-bottom:8px">검색 결과: <strong>${list.length}명</strong></div>
    ${list.length===0?'<p style="color:var(--gray-l);padding:20px;text-align:center">조건에 맞는 선수가 없습니다.</p>':`
    <div style="overflow-x:auto"><table>
      <thead><tr><th>순위</th><th>이름</th><th>대학</th><th>티어</th><th>종족</th><th>성별</th><th>ELO</th><th>승</th><th>패</th><th>승률</th><th>경기수</th></tr></thead>
      <tbody>
        ${list.map((p,i)=>{
          const eloColor=p._elo>=1400?'#7c3aed':p._elo>=1300?'#d97706':p._elo>=1200?'var(--green)':'var(--red)';
          return`<tr style="cursor:pointer" onclick="openPlayerModal('${p.name}')">
            <td>${i+1}</td>
            <td style="font-weight:700;color:var(--blue)">${p.name}</td>
            <td><span class="ubadge" style="background:${gc(p.univ)}">${p.univ}</span></td>
            <td>${getTierLabel(p.tier||'-')}</td>
            <td><span class="rbadge r${p.race||'T'}">${p.race||'-'}</span></td>
            <td>${p.gender==='M'?'👨':'👩'}</td>
            <td style="font-weight:800;color:${eloColor}">${p._elo}</td>
            <td class="wt">${p._w}</td>
            <td class="lt">${p._l}</td>
            <td style="font-weight:700;color:${p._rate>=50?'var(--green)':'var(--red)'}">${p._tot?p._rate+'%':'-'}</td>
            <td>${p._tot}</td>
          </tr>`;
        }).join('')}
      </tbody>
    </table></div>`}
  </div></div>`;
}



/* ══════════════════════════════════════
   🔍 전체 선수 검색
══════════════════════════════════════ */
function onGlobalSearch(val){
  const drop = document.getElementById('globalSearchDrop');
  if(!val || val.trim()===''){drop.style.display='none';return;}
  const q = val.trim().toLowerCase();
  // 다중 조건 파싱: "흑카 테란" → 이름에 "흑카" + 종족 "테란"
  const tokens = q.split(/\s+/).filter(Boolean);
  const RACE_MAP={'테란':'T','테':'T','t':'T','저그':'Z','저':'Z','z':'Z','프로토스':'P','프토':'P','프':'P','p':'P'};
  const GENDER_MAP={'여':'F','여자':'F','f':'F','남':'M','남자':'M','m':'M'};
  let raceFilter='', genderFilter='', univFilter='', tierFilter='', nameTokens=[];
  tokens.forEach(t=>{
    if(RACE_MAP[t]){raceFilter=RACE_MAP[t];}
    else if(GENDER_MAP[t]){genderFilter=GENDER_MAP[t];}
    else{nameTokens.push(t);}
  });
  const results = players.filter(p=>{
    const nameMatch = nameTokens.length===0 || nameTokens.every(t=>
      p.name.toLowerCase().includes(t) ||
      (p.univ||'').toLowerCase().includes(t) ||
      (p.tier||'').toLowerCase().includes(t) ||
      (p.role||'').toLowerCase().includes(t) ||
      (p.memo||'').toLowerCase().includes(t)
    );
    const raceMatch = !raceFilter || p.race===raceFilter;
    const genderMatch = !genderFilter || p.gender===genderFilter;
    return nameMatch && raceMatch && genderMatch;
  }).slice(0,18);
  if(results.length===0){
    drop.innerHTML=`<div style="padding:16px;text-align:center;color:var(--gray-l);font-size:12px">
      <div style="font-size:20px;margin-bottom:6px">🔍</div>
      검색 결과 없음<br>
      <span style="font-size:10px;color:var(--gray-l);margin-top:4px;display:block">이름 · 대학 · 티어 · 종족(테란/저그/프토) · 성별(남/여) 검색 가능</span>
    </div>`;
    drop.style.display='block';return;
  }
  const RACE_CFG={T:{bg:'#dbeafe',col:'#1e40af',label:'테란'},Z:{bg:'#ede9fe',col:'#5b21b6',label:'저그'},P:{bg:'#fef3c7',col:'#92400e',label:'프토'}};
  // 검색어 하이라이트 헬퍼
  const hl=(str,q)=>{
    if(!str||!q)return str||'';
    const idx=str.toLowerCase().indexOf(q);
    if(idx<0)return str;
    return str.slice(0,idx)+`<mark style="background:#fef08a;color:inherit;border-radius:2px">`+str.slice(idx,idx+q.length)+`</mark>`+str.slice(idx+q.length);
  };
  const mainQ=nameTokens.join(' ');
  window._gsResults = results;
  drop.innerHTML = `<div style="padding:6px 12px 4px;font-size:10px;font-weight:700;color:var(--gray-l);letter-spacing:.5px;border-bottom:1px solid var(--border)">${results.length}명 검색됨</div>` +
  results.map((p,ri)=>{
    const col=gc(p.univ);
    const wr=p.win+p.loss===0?0:Math.round(p.win/(p.win+p.loss)*100);
    const rc=RACE_CFG[p.race]||{bg:'#f1f5f9',col:'#475569',label:p.race};
    return `<div data-gsidx="${ri}" style="padding:9px 14px;cursor:pointer;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px;transition:.1s"
      onmouseover="this.style.background='#f0f6ff'" onmouseout="this.style.background=''"
      onclick="(function(el){const idx=+el.dataset.gsidx;if(window._gsResults&&window._gsResults[idx]){globalSearchSelect(window._gsResults[idx].name);}else{openPlayerModal(el.dataset.name||'');}}).call(this,this)"
    >
      ${p.photo
        ?`<img src="${p.photo}" style="width:36px;height:36px;border-radius:8px;object-fit:cover;flex-shrink:0;border:2px solid ${col}" onerror="this.outerHTML='<div style=\\'width:36px;height:36px;border-radius:8px;background:${col};display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;color:#fff;flex-shrink:0\\'>${rc.label}</div>'">`
        :`<div style="width:36px;height:36px;border-radius:8px;background:${col};display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;color:#fff;flex-shrink:0;letter-spacing:.3px">${rc.label}</div>`
      }
      <div style="flex:1;min-width:0">
        <div style="font-weight:700;font-size:13px">${hl(p.name,mainQ)}${p.gender==='M'?'<span style="font-size:9px;background:#2563eb;color:#fff;padding:1px 4px;border-radius:4px;margin-left:4px">♂</span>':''}</div>
        <div style="font-size:11px;color:var(--gray-l);margin-top:1px">${hl(p.univ,mainQ)} · ${hl(p.tier,mainQ)} · <span style="background:${rc.bg};color:${rc.col};padding:0 4px;border-radius:3px;font-size:10px;font-weight:700">${rc.label}</span>${p.role?` · <span style="color:var(--blue);font-size:10px">${hl(p.role,mainQ)}</span>`:''}</div>
      </div>
      <div style="text-align:right;flex-shrink:0">
        <div style="font-weight:700;font-size:12px;color:${wr>=50?'#16a34a':'#dc2626'}">${wr}%</div>
        <div style="font-size:10px;color:var(--gray-l)">${p.win}승${p.loss}패</div>
        ${p.points?`<div style="font-size:10px;color:var(--gold);font-weight:700">${p.points>0?'+':''}${p.points}pt</div>`:''}
      </div>
    </div>`;
  }).join('');
  drop.style.display='block';
}

function globalSearchSelect(name){
  document.getElementById('globalSearch').value='';
  document.getElementById('globalSearchDrop').style.display='none';
  window._gsResults = null;
  openPlayerModal(name);
}

// 외부 클릭 시 드롭다운 닫기
document.addEventListener('click', e=>{
  if(!e.target.closest('#globalSearch') && !e.target.closest('#globalSearchDrop')){
    const d=document.getElementById('globalSearchDrop');
    if(d) d.style.display='none';
  }
});


/* ══════════════════════════════════════
   📅 경기 캘린더
══════════════════════════════════════ */

// 캘린더 주간/일간 뷰를 위한 상태
let calWeekOffset=0; // 현재 주 기준 오프셋 (0=이번주, -1=지난주 ...)
let calDayDate=''; // 일간뷰 현재 날짜
