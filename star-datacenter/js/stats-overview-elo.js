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
function _statsRebuildHistoryCtaHTML(){
  // history가 비어있으면 통계 대부분이 "스트리머 없음"으로 보임 → 사용자에게 재생성 버튼 제공
  if(_statsHasAnyHistory()) return '';
  if(!_statsHasAnyMatchData()) return `<div style="padding:16px 18px;border:1px dashed var(--border2);border-radius:12px;color:var(--gray-l);font-size:12px">아직 저장된 경기 데이터가 없습니다.</div>`;
  return `
    <div style="padding:14px 16px;border:1px solid #fde68a;background:#fffbeb;border-radius:12px;display:flex;flex-direction:column;gap:8px">
      <div style="font-weight:900;color:#92400e">⚠️ 스트리머 경기 기록(history)이 비어 있습니다</div>
      <div style="font-size:12px;color:#a16207;line-height:1.6">
        통계 탭(ELO/성장/킬러/클러치/연속기록 등)은 <b>스트리머별 history</b>를 기준으로 집계합니다.<br>
        현재는 경기 데이터는 있는데 history가 아직 재생성되지 않아 "스트리머 없음"으로 보입니다.
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button class="btn btn-b btn-sm" onclick="try{if(typeof _rebuildAllPlayerHistoryCore==='function'){_rebuildAllPlayerHistoryCore();window.__stats_hist_ready=true;}render();}catch(e){alert(String(e));}">🛠️ 스트리머 기록 재생성</button>
      </div>
    </div>
  `;
}
function applyEloSearch(q, forceExact){
  const raw=String(q||'').trim();
  if(!raw) return false;
  const _players = Array.isArray(players) ? players : [];
  const cands=_players.filter(p=>_statsAllHist(p).length>0);
  const exact=cands.find(p=>String(p.name||'').trim()===raw);
  const partial=cands.filter(p=>String(p.name||'').toLowerCase().includes(raw.toLowerCase()));
  const hit=exact || ((!forceExact && partial.length) ? partial[0] : null);
  if(!hit) return false;
  _eloSelPlayer=hit.name;
  const inp=document.getElementById('elo-search-input'); if(inp) inp.value=hit.name;
  const drop=document.getElementById('elo-search-drop'); if(drop) drop.style.display='none';
  render();
  return true;
}
function eloSearchFilter(q){
  const d=document.getElementById('elo-search-drop');if(!d)return;
  const items=d.querySelectorAll('.sitem');
  items.forEach(el=>{el.style.display=el.textContent.toLowerCase().includes(q.toLowerCase())?'':'none';});
}
function statsEloHTML(){
  const cta=_statsRebuildHistoryCtaHTML();
  if(cta) return `<div class="ssec">${cta}</div>`;
  const _players = Array.isArray(players) ? players : [];
  const allWithHist=_players.filter(p=>_statsAllHist(p).length>0)
    .sort((a,b)=>(b.elo||ELO_DEFAULT)-(a.elo||ELO_DEFAULT));
  const top20=allWithHist.slice(0,30);
  if(!_eloSelPlayer&&allWithHist.length)_eloSelPlayer=allWithHist[0].name;
  const selP=statsP(_eloSelPlayer);
  const _eloVal=selP?.elo||ELO_DEFAULT;
  const _eloMonthDelta=selP?(()=>{
    const now=new Date();
    const ym=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;
    return (_statsAllHist(selP)||[]).filter(h=>h.date&&h.date.startsWith(ym)&&h.eloDelta!=null).reduce((s,h)=>s+(h.eloDelta||0),0);
  })():0;
  return`<div style="display:flex;flex-direction:column;gap:16px">
  <div class="ssec" id="stats-elo-sec">
    <div class="stats-chart-shell">
      <div class="stats-chart-toolbar">
        <div>
          <h4 style="margin:0">📈 ELO 랭킹 변동 그래프</h4>
          <div style="font-size:11px;color:var(--gray-l);margin-top:4px">선택한 스트리머의 ELO 흐름과 현재 랭킹을 함께 확인합니다.</div>
        </div>
        <div class="stats-chart-actions no-export">
          <div style="position:relative">
            <input id="elo-search-input" type="text" value="${escHTML(_eloSelPlayer||'')}" placeholder="🔍 스트리머 검색"
              class="stats-search-field"
              oninput="eloSearchFilter(this.value)"
              onfocus="document.getElementById('elo-search-drop').style.display='block'"
              onblur="setTimeout(()=>{const d=document.getElementById('elo-search-drop');if(d)d.style.display='none'},200)"
              onkeydown="if(event.key==='Enter'){applyEloSearch(this.value,true);}">
            <div id="elo-search-drop" class="stats-search-drop">
              ${allWithHist.slice().sort((a,b)=>String(a.name||'').localeCompare(String(b.name||''),'ko')).map(p=>`<div class="sitem stats-search-item" onmousedown="applyEloSearch('${escJS(p.name)}',true)"><b>${escHTML(p.name)}</b> <span style="color:var(--gray-l);font-size:10px">${escHTML(p.univ)} · ELO ${p.elo||1200}</span></div>`).join('')}
            </div>
          </div>
          <select id="elo-player-select" class="stats-select" onchange="_eloSelPlayer=(function(v){try{var t=document.createElement('textarea');t.innerHTML=v;return t.value;}catch(e){return v;}})(this.value);render()">
            ${allWithHist.slice().sort((a,b)=>String(a.name||'').localeCompare(String(b.name||''),'ko')).map(p=>`<option value="${escHTML(p.name)}"${_eloSelPlayer===p.name?' selected':''}>${escHTML(p.name)} · ${escHTML(p.univ)} · ELO ${p.elo||1200}</option>`).join('')}
          </select>
          <button class="btn-capture btn-xs no-export" onclick="captureSection('stats-elo-sec','elo_ranking')">📷 이미지 저장</button>
        </div>
      </div>
      <div class="stats-metric-grid">
        <div class="stats-metric-card">
          <div class="stats-metric-label">선택 스트리머</div>
          <div class="stats-metric-value" style="font-size:18px">${escHTML(selP?.name||'-')}</div>
          <div class="stats-metric-sub">${escHTML(selP?.univ||'기록 없음')}</div>
        </div>
        <div class="stats-metric-card">
          <div class="stats-metric-label">현재 ELO</div>
          <div class="stats-metric-value" style="color:${_eloVal>=1400?'#7c3aed':_eloVal>=1300?'#d97706':_eloVal>=1200?'var(--green)':'var(--red)'}">${_eloVal}</div>
          <div class="stats-metric-sub">기본값 ${ELO_DEFAULT}</div>
        </div>
        <div class="stats-metric-card">
          <div class="stats-metric-label">이번달 변동</div>
          <div class="stats-metric-value" style="color:${_eloMonthDelta>=0?'var(--green)':'var(--red)'}">${_eloMonthDelta>0?'+':''}${_eloMonthDelta}</div>
          <div class="stats-metric-sub">현재 월 기준 합산</div>
        </div>
      </div>
      <div class="stats-chart-board">
        <div class="stats-chart-wrap">
          <canvas id="eloChart" style="width:100%;max-height:300px"></canvas>
        </div>
      </div>
      <div id="eloRankTable"></div>
    </div>
  </div>
  <div class="ssec">
    <h4>🏅 현재 ELO 랭킹 TOP 20</h4>
    <div class="stats-list-stack" style="margin-top:8px">
      ${top20.map((p,i)=>{
        const elo=p.elo||1200;
        const eloColor=elo>=1400?'#7c3aed':elo>=1300?'#d97706':elo>=1200?'var(--green)':'var(--red)';
        const badge=i===0?'🥇':i===1?'🥈':i===2?'🥉':`${i+1}`;
        const bar=Math.min(100,Math.max(0,((elo-900)/800)*100));
        return`<div class="stats-list-item" style="cursor:pointer" onclick="_eloSelPlayer='${escJS(p.name)}';render()">
          <span style="min-width:28px;font-weight:800;font-size:12px">${badge}</span>
          <span style="font-weight:800;font-size:13px;color:var(--blue);min-width:70px">${escHTML(p.name)}</span>
          <span style="font-size:11px;color:${gc(p.univ)};font-weight:700;min-width:60px">${escHTML(p.univ)}</span>
          <div class="stats-progress">
            <div class="stats-progress-bar" style="width:${bar}%;background:${eloColor}"></div>
          </div>
          <span style="font-weight:800;font-size:14px;color:${eloColor};min-width:48px;text-align:right">${elo}</span>
          ${(()=>{const now=new Date();const ym=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;const d=(_statsAllHist(p)||[]).filter(h=>h.date&&h.date.startsWith(ym)&&h.eloDelta!=null).reduce((s,h)=>s+(h.eloDelta||0),0);return d!==0?`<span class="stats-inline-badge" style="color:${d>0?'#15803d':'#b91c1c'};background:${d>0?'#dcfce7':'#fee2e2'}">${d>0?'+':''}${d}</span>`:'';})()} 
        </div>`;
      }).join('')}
    </div>
  </div>
  </div>`;
}
function initEloChart(){
  const canvas=document.getElementById('eloChart');
  if(!canvas)return;
  // HTML entity decode fallback (특수문자 이름 대응)
  let _eloKey=_eloSelPlayer;
  try{const ta=document.createElement('textarea');ta.innerHTML=_eloKey;_eloKey=ta.value;}catch(e){}
  let p=statsP(_eloKey);
  // statsP 미발견 시 players 배열 직접 탐색
  if(!p && _eloKey){
    p=(Array.isArray(window.players)?window.players:[]).find(x=>String(x&&x.name||'').trim()===_eloKey)||null;
  }
  const histAll = p ? _statsAllHist(p) : [];
  if(!p||!histAll.length){canvas.style.display='none';return;}
  canvas.style.display='block';
  const hist=[...histAll].sort((a,b)=>(String(a.date||'')).localeCompare(String(b.date||'')));
  const _eloLastN=window._statsChartLastN|0;
  // ELO 재구성: eloAfter 필드를 우선 사용하고, 없는 구간은 직전까지 알려진 ELO에서 델타를 누적한다.
  // (주의) elo 추적 변수를 eloAfter가 있을 때도 동기화해야 함 — 안 그러면 eloAfter가 끊긴 다음 기록부터
  // ELO_DEFAULT 기준으로 다시 누적되어 그래프가 갑자기 뚝 떨어지거나 튀는 오류가 발생한다.
  // (주의2) 최근N경기 필터는 표시 구간만 잘라내며, ELO 누적 계산 자체는 항상 전체 히스토리 기준으로 수행해
  // 필터를 걸어도 ELO 값이 뚝 끊기거나 틀어지지 않도록 한다.
  const ptsAll=[];let elo=ELO_DEFAULT;
  hist.forEach((h,i)=>{
    if(h.eloAfter!=null){ elo=h.eloAfter; ptsAll.push({i,elo,date:h.date||'',result:h.result,opp:h.opp||'',eloDelta:h.eloDelta||0}); }
    else{ elo+=(h.eloDelta||0); ptsAll.push({i,elo,date:h.date||'',result:h.result,opp:h.opp||'',eloDelta:h.eloDelta||0}); }
  });
  const pts=(_eloLastN>0?ptsAll.slice(-_eloLastN):ptsAll).map((pt,i)=>({...pt,i}));
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
    ctx.fillStyle=pt.result==='승'?'#dc2626':'#2563eb';
    ctx.fill();ctx.strokeStyle='#fff';ctx.lineWidth=1.5;ctx.stroke();
  });
  // X축 날짜 (첫/마지막)
  ctx.fillStyle='#64748b';ctx.font='10px sans-serif';ctx.textAlign='center';
  if(pts.length>0)ctx.fillText(pts[0].date.slice(5)||'',mapX(0),H-pad.b+16);
  if(pts.length>1)ctx.fillText(pts[pts.length-1].date.slice(5)||'',mapX(pts.length-1),H-pad.b+16);
  // 제목
  ctx.fillStyle='#1e293b';ctx.font='bold 13px sans-serif';ctx.textAlign='left';
  ctx.fillText(`${p.name} ELO 변동 (현재: ${p.elo||1200})`,pad.l,14);
  // 드롭다운 동기화
  const sel=document.getElementById('elo-player-select');
  if(sel) sel.value=_eloSelPlayer;
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
      _eloTip.innerHTML=`<b>${pt.opp||'?'}</b> <span style="color:${pt.result==='승'?'#fca5a5':'#93c5fd'}">${pt.result}</span><br>${sign}${pt.eloDelta||0} → <b>${pt.elo}</b><br><span style="color:#94a3b8">${pt.date}</span>`;
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
var _growthSel='';
function _statsGrowthCandidates(){
  const _players = Array.isArray(players) ? players : [];
  return _players.filter(p=>{
    try{ return _statsAllHist(p).length >= 2; }catch(e){ return (p.history||[]).length >= 2; }
  }).sort((a,b)=>{
    const ah=_statsAllHist(a).length, bh=_statsAllHist(b).length;
    return bh-ah || String(a.name||'').localeCompare(String(b.name||''),'ko');
  });
}
function growthSearchFilter(q){
  const d=document.getElementById('growth-search-drop');if(!d)return;
  const qq=String(q||'').trim().toLowerCase();
  let first=null, visible=0;
  d.querySelectorAll('.sitem').forEach(el=>{
    const ok=!qq || el.textContent.toLowerCase().includes(qq);
    el.style.display=ok?'':'none';
    if(ok){ visible++; if(!first) first=el; }
  });
  const empty=document.getElementById('growth-search-empty');
  if(empty) empty.style.display = visible ? 'none' : 'block';
  return {first,visible};
}
function applyGrowthSearch(q, forceExact){
  const cands=_statsGrowthCandidates();
  const raw=String(q||'').trim();
  if(!raw) return false;
  const exact=cands.find(p=>String(p.name||'').trim()===raw);
  const partial=cands.filter(p=>String(p.name||'').toLowerCase().includes(raw.toLowerCase()));
  const hit=exact || ((!forceExact && partial.length) ? partial[0] : null);
  if(!hit) return false;
  _growthSel=hit.name;
  const inp=document.getElementById('growth-search-input'); if(inp) inp.value=hit.name;
  const drop=document.getElementById('growth-search-drop'); if(drop) drop.style.display='none';
  render();
  return true;
}
function statsGrowthHTML(){
  const cta=_statsRebuildHistoryCtaHTML();
  if(cta) return `<div class="ssec">${cta}</div>`;
  const cands=_statsGrowthCandidates();
  if(!_growthSel&&cands.length)_growthSel=cands[0].name;
  const selP=statsP(_growthSel);
  const _games=(selP&&_statsAllHist(selP))?_statsAllHist(selP).length:0;
  return`<div class="ssec" id="stats-growth-sec">
    <div class="stats-chart-shell">
      <div class="stats-chart-toolbar">
        <div>
          <h4 style="margin:0">📊 스트리머 성장 곡선</h4>
          <div style="font-size:11px;color:var(--gray-l);margin-top:4px">누적 승률 변화와 최근 성장 흐름을 한눈에 봅니다.</div>
        </div>
        <div class="stats-chart-actions no-export">
          <div style="position:relative">
            <input id="growth-search-input" type="text" value="${escHTML(_growthSel||'')}" placeholder="🔍 스트리머 검색"
              class="stats-search-field"
              oninput="growthSearchFilter(this.value)"
              onfocus="document.getElementById('growth-search-drop').style.display='block'"
              onblur="setTimeout(()=>{const d=document.getElementById('growth-search-drop');if(d)d.style.display='none'},200)"
              onkeydown="if(event.key==='Enter'){applyGrowthSearch(this.value,true);}">
            <div id="growth-search-drop" class="stats-search-drop">
              ${cands.slice().sort((a,b)=>String(a.name||'').localeCompare(String(b.name||''),'ko')).map(p=>`<div class="sitem stats-search-item" onmousedown="applyGrowthSearch('${escJS(p.name)}',true)"><b>${escHTML(p.name)}</b> <span style="color:var(--gray-l);font-size:10px">${escHTML(p.univ)} · ${(_statsAllHist(p)||[]).length}경기</span></div>`).join('')}
              <div id="growth-search-empty" style="display:none;padding:8px 12px;color:var(--gray-l);font-size:12px">검색 결과가 없습니다</div>
            </div>
          </div>
          <select id="growth-player-select" class="stats-select" onchange="_growthSel=(function(v){try{var t=document.createElement('textarea');t.innerHTML=v;return t.value;}catch(e){return v;}})(this.value);render()">
            ${cands.slice().sort((a,b)=>String(a.name||'').localeCompare(String(b.name||''),'ko')).map(p=>`<option value="${escHTML(p.name)}"${_growthSel===p.name?' selected':''}>${escHTML(p.name)} · ${escHTML(p.univ)} · ${(_statsAllHist(p)||[]).length}경기</option>`).join('')}
          </select>
          <button class="btn-capture btn-xs no-export" onclick="captureSection('stats-growth-sec','growth_chart')">📷 이미지 저장</button>
        </div>
      </div>
      <div class="stats-metric-grid">
        <div class="stats-metric-card">
          <div class="stats-metric-label">선택 스트리머</div>
          <div class="stats-metric-value" style="font-size:18px">${escHTML(selP?.name||'-')}</div>
          <div class="stats-metric-sub">${escHTML(selP?.univ||'기록 없음')}</div>
        </div>
        <div class="stats-metric-card">
          <div class="stats-metric-label">누적 경기 수</div>
          <div class="stats-metric-value">${_games}</div>
          <div class="stats-metric-sub">비프로 경기 기준</div>
        </div>
        <div class="stats-metric-card">
          <div class="stats-metric-label">차트 기준</div>
          <div class="stats-metric-value" style="font-size:18px">누적 승률</div>
          <div class="stats-metric-sub">초반부터 현재까지</div>
        </div>
      </div>
      <div class="stats-chart-board">
        <div class="stats-chart-wrap">
          <canvas id="growthChart" style="width:100%;max-height:300px"></canvas>
        </div>
      </div>
      <div id="growthInfo" class="stats-metric-grid"></div>
    </div>
  </div>`;
}
function initGrowthChart(){
  const canvas=document.getElementById('growthChart');
  if(!canvas)return;
  // _growthSel이 HTML 엔티티로 인코딩된 경우 디코딩 후 조회 (특수문자 스트리머명 버그 수정)
  try{const _tmp=document.createElement('textarea');_tmp.innerHTML=_growthSel;if(_tmp.value&&_tmp.value!==_growthSel)_growthSel=_tmp.value;}catch(e){}
  let p=statsP(_growthSel);
  // statsP 미발견 시 이름 부분 매칭 fallback
  if(!p&&_growthSel){p=(Array.isArray(players)?players:[]).find(x=>String(x&&x.name||'').trim()===_growthSel.trim())||null;}
  const histF = p ? statsNonProHist(p) : [];
  const info=document.getElementById('growthInfo');
  if(!p||histF.length<2){
    canvas.style.display='none';
    if(info) info.innerHTML = `<div style="padding:16px 18px;border:1px dashed var(--border2);border-radius:12px;color:var(--gray-l);font-size:12px">선택한 스트리머의 경기 기록이 2경기 이상 있어야 성장 곡선을 표시할 수 있습니다.</div>`;
    return;
  }
  canvas.style.display='block';
  const hist=[...histF].sort((a,b)=>(String(a.date||'')).localeCompare(String(b.date||'')));
  const _growthLastN=window._statsChartLastN|0;
  const _histWindowed = _growthLastN>0 ? hist.slice(-_growthLastN) : hist;
  // 누적 승률 계산 (최근N경기 필터 시 해당 구간만으로 다시 누적)
  const pts=[];let w=0,total=0;
  _histWindowed.forEach((h,i)=>{
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
  const lineCol=pts[pts.length-1].rate>=50?'#dc2626':'#2563eb';
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
  if(info){
    const last=pts[pts.length-1];
    const early=pts.slice(0,Math.ceil(pts.length/3));
    const late=pts.slice(Math.floor(pts.length*2/3));
    const earlyRate=early.length?early[early.length-1].rate:0;
    const lateRate=late.length?late[late.length-1].rate:0;
    const trend=lateRate-earlyRate;
    info.innerHTML=`
      <div class="stats-metric-card" style="text-align:center;background:var(--blue-l);border-color:var(--blue-ll)">
        <div class="stats-metric-label" style="color:var(--blue)">현재 승률</div>
        <div class="stats-metric-value" style="color:var(--blue)">${last.rate}%</div>
        <div class="stats-metric-sub">${last.w}승 ${last.l}패</div>
      </div>
      <div class="stats-metric-card" style="text-align:center;background:${trend>=0?'#f0fdf4':'#fef2f2'};border-color:${trend>=0?'#bbf7d0':'#fecaca'}">
        <div class="stats-metric-label" style="color:${trend>=0?'var(--green)':'var(--red)'}">성장 추세</div>
        <div class="stats-metric-value" style="color:${trend>=0?'var(--green)':'var(--red)'}">${trend>=0?'📈':'📉'} ${trend>0?'+':''}${trend}%</div>
        <div class="stats-metric-sub">초반 → 후반 변화</div>
      </div>
      <div class="stats-metric-card" style="text-align:center;background:#fffbeb;border-color:#fde68a">
        <div class="stats-metric-label" style="color:var(--gold)">총 경기</div>
        <div class="stats-metric-value" style="color:var(--gold)">${last.w+last.l}</div>
        <div class="stats-metric-sub">경기 기록</div>
      </div>`;
  }
  const sel=document.getElementById('growth-player-select');
  if(sel) sel.value=_growthSel;
}

/* ══════════════════════════════════════
   4. 이달의 선수
══════════════════════════════════════ */
function statsAwardHTML(){
  const _players = Array.isArray(players) ? players : [];
  const monthsF=_statsLatestActiveMonths('F');
  const monthsM=_statsLatestActiveMonths('M');
  const monthsAll=_statsLatestActiveMonths('');
  try{
    if(!window._statsAwardRankGender){
      window._statsAwardRankGender = localStorage.getItem('su_stats_award_rank_gender') || 'F';
    }
  }catch(e){
    window._statsAwardRankGender = window._statsAwardRankGender || 'F';
  }

  // ✅ 전역 필터(올해/이번달/최근3개월/최소경기 등)도 "이달의 스트리머"에서 동작하게:
  // - 날짜 From/To가 설정되어 있으면 해당 기간으로 집계
  // - 없으면 월(YYYY-MM)로 집계
  const _toIso = (v)=> (typeof window._toIsoDateStr==='function') ? window._toIsoDateStr(v) : String(v||'').trim();
  const _gfFrom = String(_statsDateFrom||'').trim();
  const _gfTo = String(_statsDateTo||'').trim();
  const _rangeFrom = _gfFrom ? _toIso(_gfFrom) : (_gfTo ? _toIso(_gfTo) : '');
  const _rangeTo = _gfTo ? _toIso(_gfTo) : (_gfFrom ? _toIso(_gfFrom) : '');
  const _useRange = !!(_rangeFrom || _rangeTo);
  const _rangeLabel = _useRange ? `${_rangeFrom||'-'} ~ ${_rangeTo||'-'}` : '';

  const _rankGender = ['F','M','ALL'].includes(String(window._statsAwardRankGender||'').toUpperCase())
    ? String(window._statsAwardRankGender||'').toUpperCase()
    : 'F';
  let ym=(_rankGender==='F' ? monthsF[0] : _rankGender==='M' ? monthsM[0] : monthsAll[0]) || (()=>{const now=new Date(); return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;})();
  if(_useRange){
    const _ym = String((_rangeFrom || _rangeTo || '')).slice(0,7);
    if(/^\d{4}-\d{2}$/.test(_ym)) ym = _ym;
  }
  let _isFullMonth = false;
  if(_rangeFrom && _rangeTo && _rangeFrom === ym + '-01'){
    const [yy,mm]=String(ym).split('-').map(Number);
    if(yy && mm){
      const last = new Date(yy, mm, 0).getDate();
      const toFull = ym + '-' + String(last).padStart(2,'0');
      if(_rangeTo === toFull) _isFullMonth = true;
    }
  }
  const _awardUseRange = _useRange && !_isFullMonth;
  const prevYm=(function(cur){ const [yy,mm]=String(cur).split('-').map(Number); if(!yy||!mm) return ''; return mm===1?`${yy-1}-12`:`${yy}-${String(mm-1).padStart(2,'0')}`; })(ym);

  function calcMonth(ym2, gender){
    const g=_statsNormGender(gender);
    return _players.map(p=>{
      if(g && _statsNormGender(p.gender)!==g) return null;
      const mh=statsNonProHist(p).filter(h=>_statsYmFromDateStr(h&&h.date)===ym2);
      const w=mh.filter(h=>h.result==='승').length;
      const l=mh.filter(h=>h.result==='패').length;
      const tot=w+l;
      return{...p,mw:w,ml:l,mt:tot,mrate:tot?Math.round(w/tot*100):0};
    })
    .filter(Boolean)
    .filter(p=>p.mt>=Math.max(1, Number(_statsMinGames||0)||0))
    .sort((a,b)=>b.mw-a.mw||b.mrate-a.mrate);
  }
  function calcRange(fromIso, toIso, gender){
    const g=_statsNormGender(gender);
    const from = String(fromIso||'').trim();
    const to = String(toIso||'').trim();
    return _players.map(p=>{
      if(g && _statsNormGender(p.gender)!==g) return null;
      const mh=statsNonProHist(p).filter(h=>{
        const d = _toIso(h && h.date);
        if(!d || !/^\d{4}-\d{2}-\d{2}$/.test(d)) return false;
        if(from && d < from) return false;
        if(to && d > to) return false;
        return true;
      });
      const w=mh.filter(h=>h.result==='승').length;
      const l=mh.filter(h=>h.result==='패').length;
      const tot=w+l;
      return{...p,mw:w,ml:l,mt:tot,mrate:tot?Math.round(w/tot*100):0};
    })
    .filter(Boolean)
    .filter(p=>p.mt>=Math.max(1, Number(_statsMinGames||0)||0))
    .sort((a,b)=>b.mw-a.mw||b.mrate-a.mrate);
  }
  const curListF=_awardUseRange ? calcRange(_rangeFrom,_rangeTo,'F') : calcMonth(ym,'F');
  const curListM=_awardUseRange ? calcRange(_rangeFrom,_rangeTo,'M') : calcMonth(ym,'M');
  const prevListF=calcMonth(prevYm,'F');
  const prevListM=calcMonth(prevYm,'M');
  const curList=[...(curListF||[]), ...(curListM||[])];
  const curRankList = _rankGender==='F' ? curListF : _rankGender==='M' ? curListM : curList;
  const [y,m]=ym.split('-');
  const [py,pm]=prevYm.split('-');
  function awardCard(title,p,extra='',color='#2563eb'){
    if(!p)return`<div class="stats-award-card is-empty"><div style="font-size:28px;margin-bottom:8px">🏆</div><div style="color:var(--gray-l)">기록 없음</div></div>`;
    const univColor=gc(p.univ);
    const _univIcons = (typeof UNIV_ICONS!=='undefined' && UNIV_ICONS) ? UNIV_ICONS : (window.UNIV_ICONS||{});
    const _univCfg = (typeof univCfg!=='undefined' && Array.isArray(univCfg)) ? univCfg : [];
    const _gUI = (typeof gUI === 'function') ? gUI : (()=>'');
    // 대학 아이콘 (gUI 사용 - UNIV_ICONS 또는 univCfg.icon 우선)
    const univIconUrl=(_univIcons && _univIcons[p.univ])||((_univCfg.find(x=>x.name===p.univ)||{}).icon)||'';
    const univIconUrlAttr = (typeof escAttr==='function') ? escAttr(univIconUrl) : escHTML(univIconUrl);
    // 아이콘: URL 있으면 이미지, 없으면 대학명 첫 글자 표시
    const univIconInner=univIconUrl
      ? `<img src="${univIconUrlAttr}" style="width:32px;height:32px;object-fit:contain" onerror="this.outerHTML='<span style=font-size:16px;font-weight:900;color:white>${escHTML(p.univ[0]||'?')}</span>'">`
      : `<span style="font-size:18px;font-weight:900;color:#fff;font-family:Noto Sans KR,sans-serif">${escHTML(p.univ[0]||'?')}</span>`;
    return`<div class="stats-award-card" style="background:linear-gradient(135deg,${color}18,${color}08);border:2px solid ${color}44" onclick="openPlayerModal('${escJS(p.name)}')">
      <div class="stats-award-head" style="color:${color}">${title}</div>
      <div class="stats-award-body">
        ${p.photo?(()=>{
          const _2nd=(typeof _phSwap2ndHTML==='function')?_phSwap2ndHTML(p.secondProfileFile,{style:'border-radius:inherit'}):'';
          return `<span class="stats-award-avatar${_2nd?' ph-swap':''}" style="position:relative;overflow:hidden;display:flex"><img src="${toHttpsUrl(p.photo)}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;border:2px solid ${univColor};box-shadow:0 2px 8px ${univColor}55" onerror="this.style.display='none'">${_2nd}</span>`;
        })():`<div class="stats-award-avatar" style="background:${univColor};box-shadow:0 2px 8px ${univColor}55">${univIconInner}</div>`}
        <div style="min-width:0">
          <div class="stats-award-name">${escHTML(p.name)}</div>
          <div class="stats-award-meta">
            <span style="display:inline-flex;align-items:center;gap:3px;background:${univColor};color:#fff;font-size:10px;padding:2px 7px;border-radius:4px;font-weight:700">${_gUI(p.univ,'0.85em')}${escHTML(p.univ)}</span>
            <span style="font-size:10px;color:var(--gray-l)">${getTierLabel(p.tier||'-')}</span>
          </div>
        </div>
      </div>
      <div class="stats-award-stats">
        <span class="stats-award-stat" style="background:var(--red)">${p.mw}승</span>
        <span class="stats-award-stat" style="background:var(--blue)">${p.ml}패</span>
        <span class="stats-award-stat" style="background:${color}">${p.mrate}%</span>
      </div>
      ${extra?`<div style="margin-top:8px;font-size:11px;color:${color};font-weight:600">${extra}</div>`:''}
    </div>`;
  }
  function pickAwards(list){
    const top3=[...(list||[])].sort((a,b)=>b.mw-a.mw||b.mrate-a.mrate||b.mt-a.mt).slice(0,3);
    return { top3 };
  }
  const aF=pickAwards(curListF);
  const aM=pickAwards(curListM);
  const pF=pickAwards(prevListF);
  const pM=pickAwards(prevListM);
  // 전월 대비(표시용)는 남녀 합산(전체 기준)으로 계산
  const prevMap=Object.fromEntries([...(prevListF||[]), ...(prevListM||[])].map(p=>[p.name,p]));
  function trendBadge(p){
    const pp=prevMap[p.name];
    if(!pp)return`<span style="font-size:10px;color:var(--gray-l)">신규</span>`;
    const dw=p.mw-pp.mw,dr=p.mrate-pp.mrate;
    const wStr=dw>0?`<span style="color:#16a34a">▲${dw}승</span>`:dw<0?`<span style="color:#dc2626">▼${Math.abs(dw)}승</span>`:`<span style="color:var(--gray-l)">-</span>`;
    const rStr=dr>0?`<span style="color:#16a34a;font-size:9px">+${dr}%</span>`:dr<0?`<span style="color:#dc2626;font-size:9px">${dr}%</span>`:'';
    return`${wStr}${rStr?` ${rStr}`:''}`;
  }
  return`<div style="display:flex;flex-direction:column;gap:20px">
  <div class="ssec" id="stats-award-sec">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;flex-wrap:wrap;gap:8px">
      <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
        <h4 style="margin:0">🏆 이달의 스트리머 ${
          _awardUseRange
            ? `<span style="font-size:12px;color:var(--gray-l);font-weight:400">${_rangeLabel}</span>`
            : `<span style="font-size:12px;color:var(--gray-l);font-weight:400">${y}년 ${m}월</span>`
        } <span style="font-size:11px;color:var(--gray-l);font-weight:400">(프로리그 제외)</span></h4>
      </div>
      <button class="btn-capture btn-xs no-export" onclick="captureSection('stats-award-sec','award')">📷 이미지 저장</button>
    </div>
    <div style="font-size:11px;color:var(--gray-l);margin:-6px 0 10px;line-height:1.5">
      ${_awardUseRange
        ? `※ 현재는 전역 필터(올해/최근3개월/기간 From~To)로 집계 중입니다. <b>최소경기</b>도 반영됩니다.`
        : `※ 기본은 <b>월 단위</b> 자동 집계이며, 전역 필터(올해/최근3개월/월 입력/기간)를 사용하면 해당 기간 집계로 자동 전환됩니다.`
      }
    </div>
    <div class="stats-award-label" style="color:#db2777">👩 여자</div>
    <div class="stats-award-grid">
      ${awardCard('🥇 1위',aF.top3[0]||null,'이번달 승수 1위','#db2777')}
      ${awardCard('🥈 2위',aF.top3[1]||null,'이번달 승수 2위','#db2777')}
      ${awardCard('🥉 3위',aF.top3[2]||null,'이번달 승수 3위','#db2777')}
    </div>
    <div class="stats-award-label" style="color:#2563eb;margin-top:14px">👨 남자</div>
    <div class="stats-award-grid">
      ${awardCard('🥇 1위',aM.top3[0]||null,'이번달 승수 1위','#2563eb')}
      ${awardCard('🥈 2위',aM.top3[1]||null,'이번달 승수 2위','#2563eb')}
      ${awardCard('🥉 3위',aM.top3[2]||null,'이번달 승수 3위','#2563eb')}
    </div>
  </div>
  <div class="ssec">
    <h4 style="margin-bottom:14px">📅 지난달 TOP <span style="font-size:12px;color:var(--gray-l);font-weight:400">${py}년 ${pm}월</span></h4>
    <div class="stats-award-label" style="color:#db2777">👩 여자</div>
    <div class="stats-award-grid">
      ${awardCard('🥇 1위',pF.top3[0]||null,'','#db2777')}
      ${awardCard('🥈 2위',pF.top3[1]||null,'','#db2777')}
      ${awardCard('🥉 3위',pF.top3[2]||null,'','#db2777')}
    </div>
    <div class="stats-award-label" style="color:#2563eb;margin-top:14px">👨 남자</div>
    <div class="stats-award-grid">
      ${awardCard('🥇 1위',pM.top3[0]||null,'','#2563eb')}
      ${awardCard('🥈 2위',pM.top3[1]||null,'','#2563eb')}
      ${awardCard('🥉 3위',pM.top3[2]||null,'','#2563eb')}
    </div>
  </div>
  <div class="ssec">
    <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;margin-bottom:10px">
      <h4 style="margin:0">📋 이달 전체 순위 ${
        _awardUseRange
          ? `<span style="font-size:12px;color:var(--gray-l);font-weight:400">${_rangeLabel}</span>`
          : `<span style="font-size:12px;color:var(--gray-l);font-weight:400">${y}년 ${m}월</span>`
      }</h4>
      <div class="stats-award-toggle no-export">
        <button class="female ${_rankGender==='F'?'on':''}" onclick="window._statsAwardRankGender='F';try{localStorage.setItem('su_stats_award_rank_gender','F')}catch(e){};render()">👩 여자</button>
        <button class="male ${_rankGender==='M'?'on':''}" onclick="window._statsAwardRankGender='M';try{localStorage.setItem('su_stats_award_rank_gender','M')}catch(e){};render()">👨 남자</button>
        <button class="${_rankGender==='ALL'?'on':''}" onclick="window._statsAwardRankGender='ALL';try{localStorage.setItem('su_stats_award_rank_gender','ALL')}catch(e){};render()">🌐 전체</button>
      </div>
    </div>
    <div style="font-size:11px;color:var(--gray-l);margin:-2px 0 10px;line-height:1.5">현재는 <b>${_rankGender==='F'?'여자':'M'===_rankGender?'남자':'전체'}</b> 기준 순위만 표시됩니다.</div>
    ${curRankList.length===0?'<p style="color:var(--gray-l)">선택한 조건의 경기 기록이 없습니다.</p>':`
    <table class="stats-rank-table"><thead><tr><th>순위</th><th>선수</th><th>대학</th><th>티어</th><th>승</th><th>패</th><th>승률</th><th>경기수</th><th title="전월 대비">전월비</th></tr></thead><tbody>
    ${[...curRankList].sort((a,b)=>b.mw-a.mw||b.mrate-a.mrate).map((p,i)=>`<tr class="${i<3?'stats-rank-top':''}">
      <td>${i===0?'🥇':i===1?'🥈':i===2?'🥉':i+1+'위'}</td>
      <td class="stats-rank-player" onclick="openPlayerModal('${escJS(p.name)}')">${escHTML(p.name)}</td>
      <td><span class="ubadge" style="background:${gc(p.univ)}">${escHTML(p.univ)}</span></td>
      <td>${p.tier||'-'}</td>
      <td class="wt">${p.mw}</td><td class="lt">${p.ml}</td>
      <td style="font-weight:700;color:${p.mrate>=50?'var(--red)':'var(--blue)'}">${p.mrate}%</td>
      <td>${p.mt}</td>
      <td style="font-size:11px;white-space:nowrap">${trendBadge(p)}</td>
    </tr>`).join('')}
    </tbody></table>`}
  </div></div>`;
}

/* ══════════════════════════════════════
   5. 최다 기록 보유자
══════════════════════════════════════ */
function statsRecordsHTML(){
  const _players = Array.isArray(players) ? players : [];
  if(!_players.length)return`<div class="ssec"><p style="color:var(--gray-l)">스트리머 데이터가 없습니다.</p></div>`;
  const proIds=statsProMatchIds();
  const _recLastN=window._recordsLastN|0;
  const withStats=_players.map(p=>{
    let h=statsNonProHist(p);
    if(_recLastN>0) h=[...h].sort((a,b)=>(String(a.date||'')).localeCompare(String(b.date||''))).slice(-_recLastN);
    const ph=(p.history||[]).filter(x=>proIds.has(x.matchId));
    const w=h.filter(x=>x.result==='승').length;
    const l=h.filter(x=>x.result==='패').length;
    const tot=w+l;
    // 최장 연승 계산 (날짜 오름차순 정렬 후 순방향 계산)
    let maxStreak=0,cur=0,lastRes='';
    [...h].sort((a,b)=>(String(a.date||'')).localeCompare(String(b.date||''))).forEach(x=>{if(x.result===lastRes){cur++;}else{cur=1;lastRes=x.result;}if(lastRes==='승')maxStreak=Math.max(maxStreak,cur);});
    // 현재 연승 (최신→과거 내림차순 정렬 후 첫 연속 구간)
    let curStreak=0,curStreakType='';
    for(const x of [...h].sort((a,b)=>(String(b.date||'')).localeCompare(String(a.date||'')))){if(!curStreakType||x.result===curStreakType){curStreak++;curStreakType=x.result;}else break;}
    return{...p,w,l,tot,rate:tot?Math.round(w/tot*100):0,maxStreak,
      curStreak,curStreakType,elo:p.elo||ELO_DEFAULT,proGames:ph.length,points:p.points||0};
  }).filter(p=>p.tot>0||p.proGames>0);
  if(!withStats.length)return`<div class="ssec"><p style="color:var(--gray-l)">기록이 없습니다.</p></div>`;
  const cats=[
    {title:'🏆 역대 최다승',icon:'🏆',sort:(a,b)=>b.w-a.w,val:p=>`${p.w}승`,sub:p=>`총 ${p.tot}경기`},
    {title:'📊 역대 최고 승률',icon:'📊',sort:(a,b)=>b.rate-a.rate||b.tot-a.tot,val:p=>`${p.rate}%`,sub:p=>`${p.w}승${p.l}패`,filter:p=>p.tot>=_statsMinGames},
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
      <div class="stats-list-stack">
        ${list.map((p,i)=>{
          const badge=i===0?'🥇':i===1?'🥈':i===2?'🥉':`${i+1}`;
          return`<div class="stats-record-item ${i===0?'top':''}" style="${i===0?'border-color:'+gc(p.univ)+';box-shadow:0 10px 24px '+gc(p.univ)+'33':''}" onclick="openPlayerModal('${escJS(p.name)}')">
            <span style="font-size:16px;min-width:24px">${badge}</span>
            ${getPlayerPhotoHTML(p.name,'30px')}
            <div style="flex:1;min-width:0">
              <div style="font-weight:800;font-size:13px">${escHTML(p.name)}${getStatusIconHTML(p.name)} <span style="font-size:10px;color:${gc(p.univ)};font-weight:600">${escHTML(p.univ)}</span></div>
              <div style="font-size:10px;color:var(--gray-l)">${cat.sub(p)}</div>
            </div>
            <span style="font-weight:900;font-size:16px;color:${i===0?gc(p.univ):'var(--text2)'};font-family:'Noto Sans KR',sans-serif">${cat.val(p)}</span>
          </div>`;
        }).join('')}
      </div>`}
    </div>`;
  }
  return`<div id="stats-records-sec"><div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;flex-wrap:wrap;gap:8px">
    <span style="font-size:12px;color:var(--gray-l);font-weight:700">(프로리그 제외)</span>
    <button class="btn-capture btn-xs no-export" onclick="captureSection('stats-records-sec','records')">📷 이미지 저장</button>
  </div>
  <div class="stats-records-grid">${cats.map(recordCard).join('')}</div></div>`;
}

/* ══════════════════════════════════════
   6. 대학별 성적 레이더 차트
══════════════════════════════════════ */
var _radarSelUniv='';
var _radarSort='winrate';
var _radarCompareUnivs=[];
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

function statsUnivCompareHTML() {
  const _dissSet = new Set((typeof univCfg !== 'undefined' ? univCfg : []).filter(u=>u.dissolved||u.hidden).map(u=>String(u.name||'').trim()));
  const _players = Array.isArray(players) ? players : [];
  const univList = (typeof getAllUnivs==='function'?getAllUnivs():[]).filter(u=>u.name && u.name!=='무소속' && !_dissSet.has(String(u.name||'').trim()) && _players.some(p=>p.univ===u.name));
  if (!_statsCompareA && univList.length>0) _statsCompareA = univList[0]?.name||'';
  if (!_statsCompareB && univList.length>1) _statsCompareB = univList.find(u=>u.name!==_statsCompareA)?.name||'';

  const getStats = (name) => {
    const members = _players.filter(p=>String(p?.univ||'').trim()===name&&!p.hidden&&!p.retired&&!p.hideFromBoard&&!_dissSet.has(name));
    const tiered  = members.filter(p=>!_statsCvHasRole(p));
    const roled   = members.filter(p=>_statsCvHasRole(p));
    const races={P:0,T:0,Z:0,N:0};
    members.forEach(p=>{
      const r=String(p.race||'').trim().toUpperCase();
      if(r==='P'||r==='T'||r==='Z') races[r]++;
      else races.N++;
    });
    const tiers={};
    tiered.forEach(p=>{const t=p.tier||'미정';tiers[t]=(tiers[t]||0)+1;});
    const topTier = tiered.length>0?(tiered.slice().sort((a,b)=>{
      const ti=typeof TIERS!=='undefined'?TIERS:[];
      const ia=ti.indexOf(a.tier||''),ib=ti.indexOf(b.tier||'');
      return (ia>=0?ia:999)-(ib>=0?ib:999);
    })[0]?.tier||'없음'):'없음';

    // 실전 승률 계산 — 마이페이지(선수 상세)와 동일하게 p.win/p.loss 합산 기준 사용
    let tw=0,tl=0;
    tiered.forEach(p=>{
      tw += Number(p.win||0);
      tl += Number(p.loss||0);
    });
    const tg=tw+tl;
    const wr=tg>0?Math.round(tw/tg*100):null;

    return {members,tiered,roled,races,tiers,topTier,total:members.length,tw,tl,tg,wr};
  };

  // 직접 맞대결: A 선수들 history 중 oppUniv === B (또는 opp가 B 소속 선수)
  const getHeadToHead = (nameA, nameB) => {
    const aPlayers = new Set(_players.filter(p=>String(p?.univ||'').trim()===nameA&&!p.hidden&&!p.retired).map(p=>p.name));
    const bPlayers = new Set(_players.filter(p=>String(p?.univ||'').trim()===nameB).map(p=>p.name));
    let aw=0,al=0;
    // p.history 기반
    _players.filter(p=>aPlayers.has(p.name)).forEach(p=>{
      (Array.isArray(p.history)?p.history:[]).forEach(h=>{
        const oppU = String(h.oppUniv||h.univ||'').trim();
        const oppN = String(h.opp||'').trim();
        if (oppU===nameB || bPlayers.has(oppN)) {
          if(h.result==='승')aw++; else if(h.result==='패')al++;
        }
      });
    });
    // indM (개인전)
    try { (typeof indM!=='undefined'&&Array.isArray(indM)?indM:[]).forEach(m=>{
      if(!m||!m.wName||!m.lName) return;
      if(aPlayers.has(m.wName)&&bPlayers.has(m.lName)) aw++;
      else if(aPlayers.has(m.lName)&&bPlayers.has(m.wName)) al++;
    }); } catch(e){}
    // gjM (끝장전)
    try { (typeof gjM!=='undefined'&&Array.isArray(gjM)?gjM:[]).forEach(m=>{
      if(!m||!m.wName||!m.lName||m._proLabel) return;
      if(aPlayers.has(m.wName)&&bPlayers.has(m.lName)) aw++;
      else if(aPlayers.has(m.lName)&&bPlayers.has(m.wName)) al++;
    }); } catch(e){}
    // ttM (티어대회) 게임 단위
    try { (typeof ttM!=='undefined'&&Array.isArray(ttM)?ttM:[]).forEach(m=>{
      (m.sets||[]).forEach(s=>{(s.games||[]).forEach(g=>{
        if(!g||!g.winner) return;
        const gA=g.playerA||g.a1||'', gB=g.playerB||g.b1||'';
        if(!gA||!gB) return;
        const wA=g.winner==='A'; const wB=g.winner==='B';
        if(aPlayers.has(gA)&&bPlayers.has(gB)){if(wA)aw++;else if(wB)al++;}
        else if(aPlayers.has(gB)&&bPlayers.has(gA)){if(wB)aw++;else if(wA)al++;}
      });});
    }); } catch(e){}
    // 팀전 (miniM/univM/ckM) 게임 단위
    try { [
      typeof miniM!=='undefined'?miniM:[],
      typeof univM!=='undefined'?univM:[],
      typeof ckM!=='undefined'?ckM:[]
    ].forEach(arr=>{ (Array.isArray(arr)?arr:[]).forEach(m=>{
      (m.sets||[]).forEach(s=>{(s.games||[]).forEach(g=>{
        if(!g||!g.winner) return;
        const gA=g.playerA||g.a1||'', gB=g.playerB||g.b1||'';
        if(!gA||!gB) return;
        const wA=g.winner==='A'; const wB=g.winner==='B';
        if(aPlayers.has(gA)&&bPlayers.has(gB)){if(wA)aw++;else if(wB)al++;}
        else if(aPlayers.has(gB)&&bPlayers.has(gA)){if(wB)aw++;else if(wA)al++;}
      });});
    }); }); } catch(e){}
    return {aw,al,ag:aw+al};
  };

  const colA = _statsCompareA?gc(_statsCompareA)||'#64748b':'#64748b';
  const colB = _statsCompareB?gc(_statsCompareB)||'#64748b':'#64748b';
  const stA  = _statsCompareA?getStats(_statsCompareA):null;
  const stB  = _statsCompareB?getStats(_statsCompareB):null;
  const h2h  = (_statsCompareA&&_statsCompareB)?getHeadToHead(_statsCompareA,_statsCompareB):{aw:0,al:0,ag:0};
  const h2hB = (_statsCompareA&&_statsCompareB)?getHeadToHead(_statsCompareB,_statsCompareA):{aw:0,al:0,ag:0};

  const univOptA = univList.map(u=>{const _n=(typeof escAttr==='function'?escAttr(u.name):String(u.name||''));const _nh=(typeof escHTML==='function'?escHTML(u.name):String(u.name||''));return `<option value="${_n}"${_statsCompareA===u.name?' selected':''}>${_nh}</option>`;}).join('');
  const univOptB = univList.map(u=>{const _n=(typeof escAttr==='function'?escAttr(u.name):String(u.name||''));const _nh=(typeof escHTML==='function'?escHTML(u.name):String(u.name||''));return `<option value="${_n}"${_statsCompareB===u.name?' selected':''}>${_nh}</option>`;}).join('');

  const compareRow = (label,valA,valB) => {
    const numA=typeof valA==='number'?valA:null;
    const numB=typeof valB==='number'?valB:null;
    const winA=numA!==null&&numB!==null&&numA>numB;
    const winB=numA!==null&&numB!==null&&numB>numA;
    const tot=numA!==null&&numB!==null?(numA+numB):0;
    const pctA=tot>0?Math.round(numA/tot*100):50;
    const pctB=tot>0?Math.round(numB/tot*100):50;
    const showBar=numA!==null&&numB!==null&&tot>0;
    return `<div style="padding:7px 0;border-bottom:1px solid var(--border2)">
      <div style="display:grid;grid-template-columns:1fr auto 1fr;gap:8px;align-items:center;margin-bottom:${showBar?'5px':'0'}">
        <div style="text-align:right;font-size:var(--fs-base);font-weight:${winA?'900':'600'};color:${winA?colA:'var(--text2)'}">
          ${winA?'▲ ':''}${valA}
        </div>
        <div style="font-size:10px;color:var(--text3);font-weight:700;text-align:center;white-space:nowrap;min-width:58px">${label}</div>
        <div style="text-align:left;font-size:var(--fs-base);font-weight:${winB?'900':'600'};color:${winB?colB:'var(--text2)'}">
          ${valB}${winB?' ▲':''}
        </div>
      </div>
      ${showBar?`<div style="display:flex;height:5px;border-radius:3px;overflow:hidden;background:var(--border2)">
        <div style="width:${pctA}%;background:${winA?colA:colA+'88'};transition:width .5s ease"></div>
        <div style="width:${pctB}%;background:${winB?colB:colB+'88'};transition:width .5s ease"></div>
      </div>`:''}
    </div>`;
  };

  // 레이더 차트 SVG
  const radarChart = (stA, stB) => {
    if (!stA || !stB) return '';
    const TIERS_LOCAL = typeof TIERS!=='undefined'?TIERS:[];
    const tierScore = t => { const i=TIERS_LOCAL.indexOf(t); return i<0?0:Math.max(0,(TIERS_LOCAL.length-i)*10); };

    const normalize = (val,max) => Math.min(1, max>0?val/max:0);
    const powerScore = st => st.tiered.reduce((s,p)=>s+tierScore(p.tier||''),0) + st.total*5;
    const powA = powerScore(stA), powB = powerScore(stB);
    const axes = [
      { label:'전력',   vA: normalize(powA, Math.max(powA,powB,1)), vB: normalize(powB, Math.max(powA,powB,1)) },
      { label:'승률',  vA: stA.wr!==null?stA.wr/100:0, vB: stB.wr!==null?stB.wr/100:0 },
      { label:'경기수', vA: normalize(stA.tg, Math.max(stA.tg,stB.tg,1)), vB: normalize(stB.tg, Math.max(stA.tg,stB.tg,1)) },
      { label:'프로토스', vA: normalize(stA.races.P, Math.max(stA.races.P,stB.races.P,1)), vB: normalize(stB.races.P, Math.max(stA.races.P,stB.races.P,1)) },
      { label:'테란',   vA: normalize(stA.races.T, Math.max(stA.races.T,stB.races.T,1)), vB: normalize(stB.races.T, Math.max(stA.races.T,stB.races.T,1)) },
      { label:'저그',   vA: normalize(stA.races.Z, Math.max(stA.races.Z,stB.races.Z,1)), vB: normalize(stB.races.Z, Math.max(stA.races.Z,stB.races.Z,1)) },
    ];
    const N = axes.length;
    const cx=120,cy=120,R=90;
    const angleOf = i => (Math.PI*2/N)*i - Math.PI/2;
    const pt = (val,i) => {
      const a=angleOf(i); const r=val*R;
      return `${(cx+Math.cos(a)*r).toFixed(1)},${(cy+Math.sin(a)*r).toFixed(1)}`;
    };
    const webPts = (vFn) => axes.map((_,i)=>pt(vFn(i),i)).join(' ');

    let grid='';
    [0.25,0.5,0.75,1].forEach(s=>{
      const pts=axes.map((_,i)=>{const a=angleOf(i);return `${(cx+Math.cos(a)*R*s).toFixed(1)},${(cy+Math.sin(a)*R*s).toFixed(1)}`;}).join(' ');
      grid+=`<polygon points="${pts}" fill="none" stroke="var(--border2)" stroke-width="1"/>`;
    });
    const axisLines=axes.map((_,i)=>{const a=angleOf(i);return `<line x1="${cx}" y1="${cy}" x2="${(cx+Math.cos(a)*R).toFixed(1)}" y2="${(cy+Math.sin(a)*R).toFixed(1)}" stroke="var(--border2)" stroke-width="1"/>`;}).join('');
    const labels=axes.map((ax,i)=>{
      const a=angleOf(i);const lx=(cx+Math.cos(a)*(R+18)).toFixed(1);const ly=(cy+Math.sin(a)*(R+18)).toFixed(1);
      return `<text x="${lx}" y="${ly}" text-anchor="middle" dominant-baseline="middle" font-size="10" font-weight="700" fill="var(--text3)">${ax.label}</text>`;
    }).join('');

    return `<div style="display:flex;justify-content:center;margin:8px 0 4px">
      <svg width="240" height="240" viewBox="0 0 240 240" style="overflow:visible">
        ${grid}${axisLines}
        <polygon points="${webPts(i=>axes[i].vA)}" fill="${colA}" fill-opacity="0.18" stroke="${colA}" stroke-width="2" stroke-linejoin="round"/>
        <polygon points="${webPts(i=>axes[i].vB)}" fill="${colB}" fill-opacity="0.18" stroke="${colB}" stroke-width="2" stroke-linejoin="round" stroke-dasharray="5 3"/>
        ${labels}
      </svg>
    </div>
    <div style="display:flex;justify-content:center;gap:16px;font-size:var(--fs-caption);font-weight:700">
      <span style="color:${colA}">━ ${escHTML(_statsCompareA)}</span>
      <span style="color:${colB}">╌ ${escHTML(_statsCompareB)}</span>
    </div>`;
  };

  let h = `<style>
    .svc-wrap { max-width:800px;margin:0 auto }
    .svc-sel { display:grid;grid-template-columns:1fr 40px 1fr;gap:12px;align-items:center;margin-bottom:16px }
    .svc-header { display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px }
    .svc-col { border-radius:12px;padding:14px;text-align:center }
    .svc-h2h { padding:12px 16px;background:var(--surface);border:1px solid var(--border2);border-radius:14px;margin-bottom:12px;text-align:center }
    @media(max-width:540px){ .svc-sel{grid-template-columns:1fr} .svc-header{grid-template-columns:1fr 1fr;gap:6px} }
  </style>
  <div class="ssec">
  <h4 style="margin-bottom:10px">⚔️ 대학비교</h4>
  <div class="svc-wrap">
    <div class="svc-sel">
      <div>
        <select onchange="if(this.value===_statsCompareB){this.value=_statsCompareA;return;}; _statsCompareA=this.value;render()"
          style="width:100%;padding:8px 12px;border-radius:var(--r);border:2px solid ${colA};font-size:var(--fs-base);font-weight:700;background:var(--white);color:${colA};cursor:pointer">
          ${univOptA}
        </select>
      </div>
      <div style="text-align:center;font-size:var(--fs-lg);font-weight:900;color:var(--text3)">VS</div>
      <div>
        <select onchange="if(this.value===_statsCompareA){this.value=_statsCompareB;return;}; _statsCompareB=this.value;render()"
          style="width:100%;padding:8px 12px;border-radius:var(--r);border:2px solid ${colB};font-size:var(--fs-base);font-weight:700;background:var(--white);color:${colB};cursor:pointer">
          ${univOptB}
        </select>
      </div>
    </div>
    ${_statsCompareA === _statsCompareB ? `<div style="text-align:center;padding:10px;color:#b45309;font-size:var(--fs-sm);font-weight:700;background:#fef9c3;border-radius:var(--r);margin-bottom:8px">⚠️ 같은 대학을 선택하면 비교가 의미 없습니다. 다른 대학을 선택해 주세요.</div>` : ''}`;

  if (stA && stB) {
    h += `<div class="svc-header">
      <div class="svc-col" style="background:${colA}15;border:2px solid ${colA}44">
        <div style="font-size:22px;font-weight:900;color:${colA}">${stA.total}</div>
        <div style="font-size:var(--fs-sm);color:var(--text3)">총 인원</div>
        ${stA.wr!==null?`<div style="font-size:14px;font-weight:900;color:${stA.wr>=50?'#10b981':'#ef4444'};margin-top:4px">${stA.wr}% 승률</div>`:''}
      </div>
      <div class="svc-col" style="background:${colB}15;border:2px solid ${colB}44">
        <div style="font-size:22px;font-weight:900;color:${colB}">${stB.total}</div>
        <div style="font-size:var(--fs-sm);color:var(--text3)">총 인원</div>
        ${stB.wr!==null?`<div style="font-size:14px;font-weight:900;color:${stB.wr>=50?'#10b981':'#ef4444'};margin-top:4px">${stB.wr}% 승률</div>`:''}
      </div>
    </div>`;

    {
      const totalAg = h2h.aw + h2hB.aw;
      const aWpct = totalAg>0?Math.round(h2h.aw/totalAg*100):50;
      const aWr = totalAg>0?Math.round(h2h.aw/totalAg*100):null;
      const bWr = totalAg>0?Math.round(h2hB.aw/totalAg*100):null;
      if (totalAg > 0) {
        h += `<div class="svc-h2h">
          <div style="font-size:var(--fs-sm);font-weight:800;color:var(--text3);margin-bottom:8px">⚔️ 직접 맞대결 전적 <span style="font-size:10px;font-weight:600;color:var(--text3)">(총 ${totalAg}전)</span></div>
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:5px">
            <div style="text-align:right;min-width:70px">
              <div style="font-size:16px;font-weight:900;color:${colA}">${h2h.aw}승 ${h2h.al}패</div>
              ${aWr!==null?`<div style="font-size:var(--fs-caption);font-weight:800;color:${aWr>=50?colA:'var(--text3)'}">${aWr}%</div>`:''}
            </div>
            <div style="flex:1;height:14px;border-radius:7px;overflow:hidden;background:var(--border2);display:flex">
              <div style="width:${aWpct}%;background:${colA};height:100%;transition:width .6s ease"></div>
              <div style="width:${100-aWpct}%;background:${colB};height:100%;transition:width .6s ease"></div>
            </div>
            <div style="text-align:left;min-width:70px">
              <div style="font-size:16px;font-weight:900;color:${colB}">${h2hB.aw}승 ${h2hB.al}패</div>
              ${bWr!==null?`<div style="font-size:var(--fs-caption);font-weight:800;color:${bWr>=50?colB:'var(--text3)'}">${bWr}%</div>`:''}
            </div>
          </div>
          <div style="display:flex;justify-content:space-between;font-size:var(--fs-caption)">
            <span style="color:${colA};font-weight:800">${escHTML(_statsCompareA)}</span>
            <span style="color:var(--text3)">${aWpct>50?_statsCompareA+'이 우세':aWpct<50?_statsCompareB+'이 우세':'균형'}</span>
            <span style="color:${colB};font-weight:800">${escHTML(_statsCompareB)}</span>
          </div>
        </div>`;
      } else {
        h += `<div class="svc-h2h" style="color:var(--text3);font-size:var(--fs-sm)">
          ⚔️ 직접 맞대결 기록 없음 <span style="font-size:var(--fs-caption)">(경기 데이터 누적 시 표시)</span>
        </div>`;
      }
    }

    h += `<div class="svc-col" style="background:var(--surface);border:1px solid var(--border2);border-radius:14px;margin-bottom:12px;padding:14px">
      <div style="font-size:var(--fs-sm);font-weight:800;color:var(--text3);margin-bottom:4px;text-align:center">📡 다차원 비교</div>
      ${radarChart(stA, stB)}
    </div>`;

    h += `<div style="display:grid;grid-template-columns:1fr auto 1fr;gap:8px;align-items:center;padding:8px 0;border-bottom:2px solid var(--border2);margin-bottom:4px">
      <div style="text-align:right;font-size:14px;font-weight:900;color:${colA}">${escHTML(_statsCompareA)}</div>
      <div style="width:60px;text-align:center"></div>
      <div style="text-align:left;font-size:14px;font-weight:900;color:${colB}">${escHTML(_statsCompareB)}</div>
    </div>`;
    h += compareRow('선수 수', stA.tiered.length, stB.tiered.length);
    h += compareRow('직책자', stA.roled.length, stB.roled.length);
    h += compareRow('통산 경기', stA.tg, stB.tg);
    h += compareRow('통산 승', stA.tw, stB.tw);
    h += compareRow(stA.wr!==null?`승률 (${stA.wr}%)`:'승률', stA.wr??0, stB.wr??0);
    h += `<div style="text-align:center;font-size:10px;color:var(--text3);font-weight:700;margin:6px 0 2px">🎮 종족 분포 (전체 ${stA.total}명 / ${stB.total}명 기준)</div>`;
    h += compareRow('🔮 프로토스', stA.races.P, stB.races.P);
    h += compareRow('⚔️ 테란', stA.races.T, stB.races.T);
    h += compareRow('🦎 저그', stA.races.Z, stB.races.Z);
    if (stA.races.N>0 || stB.races.N>0) h += compareRow('❔ 종족 미정', stA.races.N, stB.races.N);
    h += compareRow('최상위 티어', stA.topTier, stB.topTier);

    const allTiers=[...new Set([...Object.keys(stA.tiers),...Object.keys(stB.tiers)])];
    const sortedTiers=(typeof TIERS!=='undefined'?TIERS.filter(t=>allTiers.includes(t)):[]).concat(allTiers.filter(t=>typeof TIERS==='undefined'||!TIERS.includes(t)));
    if (sortedTiers.length) {
      h+=`<div style="margin-top:12px;font-size:var(--fs-sm);font-weight:700;color:var(--text3);text-align:center;margin-bottom:8px">티어별 비교</div>`;
      sortedTiers.forEach(t=>{
        const nA=stA.tiers[t]||0,nB=stB.tiers[t]||0;
        const col=typeof getTierBtnColor==='function'?getTierBtnColor(t):'#64748b';
        const tcol=typeof getTierBtnTextColor==='function'?(getTierBtnTextColor(t)||'#fff'):'#fff';
        const maxN=Math.max(nA,nB,1);
        h+=`<div style="display:grid;grid-template-columns:1fr 52px 1fr;gap:6px;align-items:center;margin-bottom:6px">
          <div style="display:flex;justify-content:flex-end">
            <div style="height:10px;width:${Math.round(nA/maxN*100)}%;max-width:100%;background:${nA>nB?colA:colA+'88'};border-radius:5px 0 0 5px;min-width:${nA?'8px':'0'}"></div>
          </div>
          <div style="text-align:center;font-size:var(--fs-caption);font-weight:800;padding:2px 6px;border-radius:8px;background:${col};color:${tcol}">${escHTML(t)}</div>
          <div>
            <div style="height:10px;width:${Math.round(nB/maxN*100)}%;max-width:100%;background:${nB>nA?colB:colB+'88'};border-radius:0 5px 5px 0;min-width:${nB?'8px':'0'}"></div>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 52px 1fr;gap:6px;margin-bottom:4px">
          <div style="text-align:right;font-size:var(--fs-caption);color:${nA>nB?colA:'var(--text3)'};font-weight:${nA>nB?'800':'400'}">${nA?nA+'명':''}</div>
          <div></div>
          <div style="font-size:var(--fs-caption);color:${nB>nA?colB:'var(--text3)'};font-weight:${nB>nA?'800':'400'}">${nB?nB+'명':''}</div>
        </div>`;
      });
    }

    const _sortPlayers = arr => arr.slice().sort((a,b)=>{
      const ti=typeof TIERS!=='undefined'?TIERS:[];
      const ia=ti.indexOf(a.tier||''),ib=ti.indexOf(b.tier||'');
      return (ia>=0?ia:999)-(ib>=0?ib:999)||(a.name||'').localeCompare(b.name||'','ko',{sensitivity:'base'});
    });
    const _makePlayerList = (st, col) => {
      const tieredHtml = _sortPlayers(st.tiered).map(p=>_statsCvNameTag(p,col,true)).join('');
      const roledHtml = st.roled.length ? `<div style="margin-top:6px;padding-top:6px;border-top:1px dashed var(--border2)">${st.roled.map(p=>_statsCvNameTag(p,col,false)).join('')}</div>` : '';
      return tieredHtml + roledHtml;
    };
    h+=`<div style="background:var(--surface);border:1px solid var(--border2);border-radius:14px;padding:12px;margin-top:14px">
      <div style="font-size:var(--fs-caption);font-weight:800;color:var(--text3);margin-bottom:10px;text-align:center">👥 선수 명단 (클릭하여 상세 보기)</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
        <div>
          <div style="font-size:var(--fs-sm);font-weight:900;color:${colA};margin-bottom:6px;text-align:center;padding:4px 8px;background:${colA}14;border-radius:8px">${escHTML(_statsCompareA)} · ${stA.tiered.length}명</div>
          <div style="display:flex;flex-wrap:wrap;gap:2px">${_makePlayerList(stA, colA)}</div>
        </div>
        <div>
          <div style="font-size:var(--fs-sm);font-weight:900;color:${colB};margin-bottom:6px;text-align:center;padding:4px 8px;background:${colB}14;border-radius:8px">${escHTML(_statsCompareB)} · ${stB.tiered.length}명</div>
          <div style="display:flex;flex-wrap:wrap;gap:2px">${_makePlayerList(stB, colB)}</div>
        </div>
      </div>
    </div>`;
  }

  h += `</div></div>`;
  return h;
}

/* ══════════════════════════════════════
   7. 미스매치 감지
══════════════════════════════════════ */
