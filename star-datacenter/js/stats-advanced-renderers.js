(function(){
  function _calcRaceTrendData(){
    const monthData={};
    function addRace(ym,race){if(!ym||ym.length!==7)return;if(!monthData[ym])monthData[ym]={T:0,Z:0,P:0,total:0};if(race&&monthData[ym][race]!==undefined){monthData[ym][race]++;monthData[ym].total++;}}
    const tourMs=[];(window.tourneys||[]).forEach(tn=>{
      (tn.groups||[]).forEach(grp=>(grp.matches||[]).forEach(m=>tourMs.push(m)));
      (tn.normalMatches||[]).forEach(m=>tourMs.push(m));
    });
    const allM=window.statsFilterMatches([...(window.miniM||[]),...(window.univM||[]),...(window.ckM||[]),...(window.comps||[]),...(window.proM||[]),...tourMs]);
    allM.forEach(m=>{
      const ym=(m.d||'').slice(0,7);
      (m.sets||[]).forEach(s=>(s.games||[]).forEach(g=>{
        const pA=window.statsP(g.playerA),pB=window.statsP(g.playerB);
        addRace(ym,pA?.race);addRace(ym,pB?.race);
      }));
    });
    const matchIdsInSets=new Set();
    allM.forEach(m=>(m.sets||[]).forEach(s=>(s.games||[]).forEach(g=>{if(g.matchId)matchIdsInSets.add(g.matchId);})));
    (window.players||[]).forEach(p=>{
      if(!p.race)return;
      window.statsNonProHist(p).forEach(h=>{
        if(h.result!=='승')return;
        if(h.matchId&&matchIdsInSets.has(h.matchId))return;
        const ym=(h.date||'').slice(0,7);
        const opp=window.statsP(h.opp);
        addRace(ym,p.race);addRace(ym,opp?.race);
      });
    });
    return monthData;
  }

  function statsRaceTrendHTML(){
    const monthData=_calcRaceTrendData();
    const months=Object.keys(monthData).sort().slice(-(window._raceTrendMonths||12));
    if(!months.length) return`<div class="ssec"><p style="color:var(--gray-l);padding:40px;text-align:center">경기 기록이 없습니다.<br><span style="font-size:11px">경기 기록에 선수 정보와 종족이 입력되어야 집계됩니다.</span></p></div>`;
    return`<div style="display:flex;flex-direction:column;gap:14px">
    <div class="ssec" id="stats-racetrend-sec">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;flex-wrap:wrap;gap:8px">
        <h4 style="margin:0">🔬 종족 픽률 트렌드</h4>
        <div style="display:flex;gap:6px;align-items:center">
          <select onchange="window._raceTrendMonths=parseInt(this.value);initRaceTrendChart()" style="font-size:12px;padding:4px 8px;border:1px solid var(--border2);border-radius:7px">
            <option value="6"${window._raceTrendMonths===6?' selected':''}>최근 6개월</option>
            <option value="12"${window._raceTrendMonths===12?' selected':''}>최근 12개월</option>
            <option value="24"${window._raceTrendMonths===24?' selected':''}>최근 24개월</option>
          </select>
          <button class="btn-capture btn-xs no-export" onclick="captureSection('stats-racetrend-sec','racetrend')">📷 이미지 저장</button>
        </div>
      </div>
      <canvas id="raceTrendChart" style="width:100%;max-height:280px"></canvas>
    </div>
    <div class="ssec">
      <h4 style="margin-bottom:12px">📊 월별 종족 픽률 상세</h4>
      <div style="overflow-x:auto"><table>
        <thead><tr><th style="text-align:left">월</th><th style="color:#3b82f6;text-align:center">⚔️ 테란</th><th style="color:#7c3aed;text-align:center">🦟 저그</th><th style="color:#d97706;text-align:center">🔮 프로토스</th><th style="text-align:center">총 게임</th></tr></thead><tbody>
        ${months.slice().reverse().map(ym=>{const d=monthData[ym]; const t=d.total||1; const tr=Math.round(d.T/t*100), zr=Math.round(d.Z/t*100), pr=Math.round(d.P/t*100); return`<tr><td style="font-weight:700;color:var(--text2);text-align:left">${ym}</td><td style="color:#3b82f6;font-weight:700;text-align:center">${tr}% <span style="color:var(--gray-l);font-size:10px">(${d.T})</span></td><td style="color:#7c3aed;font-weight:700;text-align:center">${zr}% <span style="color:var(--gray-l);font-size:10px">(${d.Z})</span></td><td style="color:#d97706;font-weight:700;text-align:center">${pr}% <span style="color:var(--gray-l);font-size:10px">(${d.P})</span></td><td style="color:var(--gray-l);text-align:center">${d.total}</td></tr>`;}).join('')}
        </tbody></table></div>
    </div></div>`;
  }

  function initRaceTrendChart(){
    const canvas=document.getElementById('raceTrendChart');
    if(!canvas) return;
    const monthData=_calcRaceTrendData();
    const months=Object.keys(monthData).sort().slice(-(window._raceTrendMonths||12));
    if(!months.length){canvas.style.display='none';return;}
    canvas.style.display='block';
    const ctx=canvas.getContext('2d');
    const W=canvas.offsetWidth||600, H=240;
    canvas.width=W; canvas.height=H;
    const pad={t:20,r:20,b:40,l:40};
    const n=months.length;
    const races=[{k:'T',color:'#3b82f6',label:'테란'},{k:'Z',color:'#7c3aed',label:'저그'},{k:'P',color:'#d97706',label:'프로토스'}];
    ctx.clearRect(0,0,W,H);
    ctx.strokeStyle='#e2e8f0'; ctx.lineWidth=1;
    [0,25,50,75,100].forEach(v=>{ const y=pad.t+(1-v/100)*(H-pad.t-pad.b); ctx.beginPath();ctx.moveTo(pad.l,y);ctx.lineTo(W-pad.r,y);ctx.stroke(); ctx.fillStyle='#94a3b8';ctx.font='10px sans-serif';ctx.textAlign='right';ctx.fillText(v+'%',pad.l-4,y+4); });
    races.forEach(race=>{
      const pts=months.map((ym,i)=>{ const d=monthData[ym]; const t=d.total||1; const r=d[race.k]/t*100; return{x:pad.l+i/(n-1||1)*(W-pad.l-pad.r), y:pad.t+(1-r/100)*(H-pad.t-pad.b)}; });
      const grad=ctx.createLinearGradient(0,pad.t,0,H-pad.b); grad.addColorStop(0,race.color+'44'); grad.addColorStop(1,race.color+'08');
      ctx.beginPath(); ctx.moveTo(pts[0].x,pts[0].y); pts.forEach(p=>ctx.lineTo(p.x,p.y)); ctx.lineTo(pts[pts.length-1].x,H-pad.b); ctx.lineTo(pts[0].x,H-pad.b); ctx.closePath(); ctx.fillStyle=grad; ctx.fill();
      ctx.beginPath(); ctx.strokeStyle=race.color; ctx.lineWidth=2.5; ctx.moveTo(pts[0].x,pts[0].y); pts.forEach(p=>ctx.lineTo(p.x,p.y)); ctx.stroke();
      pts.forEach(pt=>{ ctx.beginPath(); ctx.arc(pt.x,pt.y,3.5,0,Math.PI*2); ctx.fillStyle=race.color; ctx.fill(); ctx.strokeStyle='#fff'; ctx.lineWidth=1.5; ctx.stroke(); });
    });
    ctx.fillStyle='#64748b'; ctx.font='10px sans-serif'; ctx.textAlign='center';
    months.forEach((ym,i)=>{ if(n<=12||i%2===0){ const x=pad.l+i/(n-1||1)*(W-pad.l-pad.r); ctx.fillText(ym.slice(5),x,H-pad.b+14); }});
    let lx=pad.l; races.forEach(race=>{ ctx.fillStyle=race.color; ctx.fillRect(lx,H-12,12,8); ctx.fillStyle='#475569'; ctx.font='10px sans-serif'; ctx.textAlign='left'; ctx.fillText(race.label,lx+16,H-4); lx+=60; });
  }

  function _statsKillerCandidates(){
    return (window.players||[]).filter(p=>(window.statsNonProHist?window.statsNonProHist(p):_statsAllHistLocal(p)).length>0)
      .sort((a,b)=>String(a.name||'').localeCompare(String(b.name||''),'ko'));
  }
  function _statsAllHistLocal(p){
    return Array.isArray(p&&p.history) ? p.history.filter(Boolean) : [];
  }
  function _isAceLikeSet(set){
    const tag = String(set?.name || set?.title || set?.label || set?.type || '').toLowerCase();
    return !!(set && (set.ace || set.isAce || tag.includes('ace') || tag.includes('에이스') || tag.includes('결정전') || tag.includes('타이브레이커')));
  }
  function applyKillerSearch(q){
    const raw=String(q||'').trim();
    if(!raw) return false;
    const cands=_statsKillerCandidates();
    const exact=cands.find(p=>String(p.name||'').trim()===raw);
    const partial=cands.filter(p=>String(p.name||'').toLowerCase().includes(raw.toLowerCase()));
    const hit=exact || (partial.length ? partial[0] : null);
    if(!hit) return false;
    window._killerSelPlayer=hit.name;
    render();
    return true;
  }
  function syncKillerSelection(name){
    const raw=String(name||'').trim();
    if(!raw) return false;
    window._killerSelPlayer=raw;
    const sel=document.getElementById('killer-player-select'); if(sel) sel.value=raw;
    render();
    return true;
  }

  function statsKillerHTML(){
    const playersWithHistory=_statsKillerCandidates();
    if(!window._killerSelPlayer&&playersWithHistory.length) window._killerSelPlayer=playersWithHistory[0].name;
    function calcKiller(targetName){
      const target=window.statsP(targetName); if(!target)return{killers:[],victims:[]};
      const oppMap={};
      (window.statsNonProHist?window.statsNonProHist(target):_statsAllHistLocal(target)).forEach(h=>{ if(!h.opp)return; if(!oppMap[h.opp])oppMap[h.opp]={w:0,l:0}; if(h.result==='승')oppMap[h.opp].w++; else oppMap[h.opp].l++; });
      const entries=Object.entries(oppMap).map(([name,s])=>{ const opp=window.statsP(name); return{name,w:s.w,l:s.l,tot:s.w+s.l,winRate:s.w+s.l?Math.round(s.w/(s.w+s.l)*100):0,univ:opp?.univ||'',elo:opp?.elo||1200,retired:!opp}; }).filter(e=>e.tot>=1);
      const killers=entries.filter(e=>e.l>0).sort((a,b)=>{ const aLR=a.l/(a.w+a.l), bLR=b.l/(b.w+b.l); return bLR-aLR||b.l-a.l; }).slice(0,10);
      const victims=entries.filter(e=>e.w>0).sort((a,b)=>{ const aWR=a.w/(a.w+a.l), bWR=b.w/(b.w+b.l); return bWR-aWR||b.w-a.w; }).slice(0,10);
      return{killers,victims};
    }
    const target=window.statsP(window._killerSelPlayer);
    const {killers,victims}=calcKiller(window._killerSelPlayer);
    const tColor=window.gc(target?.univ||'');
    function oppRow(e,isKiller){
      const col=window.gc(e.univ); const myW=isKiller?e.l:e.w, myL=isKiller?e.w:e.l; const myRate=e.tot?Math.round(myW/e.tot*100):0;
      const retiredTag=e.retired?`<span style="font-size:9px;background:#f1f5f9;color:var(--gray-l);padding:1px 5px;border-radius:4px;margin-left:3px">탈퇴</span>`:'';
      const clickAttr=e.retired?'style="cursor:default"':`onclick="openPlayerModal('${e.name}')"`;
      return`<div style="display:flex;align-items:center;gap:10px;padding:8px 12px;background:var(--white);border:1px solid var(--border);border-radius:8px;${e.retired?'opacity:.7':'cursor:pointer'}" ${clickAttr}>${e.retired?'':window.getPlayerPhotoHTML(e.name,'28px')}<span style="font-weight:800;font-size:13px;color:${e.retired?'var(--text3)':'var(--blue)'};min-width:65px">${e.name}${e.retired?retiredTag:window.getStatusIconHTML(e.name)}</span><span style="font-size:11px;color:${col};font-weight:700;min-width:55px">${e.univ||'-'}</span><div style="flex:1;background:var(--border2);border-radius:20px;height:10px;overflow:hidden"><div style="width:${myRate}%;background:${isKiller?'var(--red)':'var(--green)'};height:100%;border-radius:20px"></div></div><span style="font-weight:800;font-size:12px;color:${isKiller?'var(--red)':'var(--green)'};white-space:nowrap;min-width:52px">${myRate}% (${myW}W${myL}L)</span><span style="font-size:10px;color:var(--gray-l)">${e.tot}경기</span></div>`;
    }
    return`<div style="display:flex;flex-direction:column;gap:14px"><div class="ssec"><h4 style="margin-bottom:12px">🗡️ 킬러 & 피해자 선수</h4><div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:14px"><span style="font-size:12px;font-weight:600;color:var(--text3)">선수 선택:</span><select id="killer-player-select" style="padding:6px 12px;border:1.5px solid var(--border2);border-radius:8px;font-size:13px;font-weight:600;min-width:220px" onchange="syncKillerSelection((function(v){try{var t=document.createElement('textarea');t.innerHTML=v;return t.value;}catch(e){return v;}})(this.value))">${playersWithHistory.map(p=>`<option value="${window.escHTML?window.escHTML(p.name):p.name}"${window._killerSelPlayer===p.name?' selected':''}>${p.name} (${p.univ})</option>`).join('')}</select>${target?`<span class="ubadge" style="background:${tColor}">${target.univ}</span><span style="font-size:12px;color:var(--gray-l)">${target.win||0}승 ${target.loss||0}패</span>`:''}</div><div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;flex-wrap:wrap"><div><div style="font-weight:800;font-size:14px;color:var(--red);margin-bottom:8px;padding:8px 12px;background:#fef2f2;border-radius:8px;border-left:4px solid var(--red)">💀 나를 가장 많이 이긴 선수 (천적)</div><div style="display:flex;flex-direction:column;gap:4px">${killers.length?killers.map(e=>oppRow(e,true)).join(''):'<p style="color:var(--gray-l);padding:16px;text-align:center">천적 없음 👑</p>'}</div></div><div><div style="font-weight:800;font-size:14px;color:var(--green);margin-bottom:8px;padding:8px 12px;background:#f0fdf4;border-radius:8px;border-left:4px solid var(--green)">🏆 내가 가장 많이 이긴 선수 (피해자)</div><div style="display:flex;flex-direction:column;gap:4px">${victims.length?victims.map(e=>oppRow(e,false)).join(''):'<p style="color:var(--gray-l);padding:16px;text-align:center">피해자 없음</p>'}</div></div></div></div></div>`;
  }

  function statsSeasonalHTML(){
    const f=window._seasonalFilter||{gender:'',univ:'',race:''};
    const univs=window.getAllUnivs();
    const dayNames=['일','월','화','수','목','금','토'];
    const dayStats=Array.from({length:7},(_,i)=>({day:dayNames[i],w:0,l:0}));
    const monthStats={};
    (window.players||[]).filter(p=>{ if(f.gender&&p.gender!==f.gender)return false; if(f.univ&&p.univ!==f.univ)return false; if(f.race&&p.race!==f.race)return false; return true; }).forEach(p=>{
      window.statsNonProHist(p).forEach(h=>{ if(!h.date)return; const d=new Date(h.date); if(isNaN(d.getTime()))return; const dow=d.getDay(); const ym=h.date.slice(0,7); if(!monthStats[ym])monthStats[ym]={w:0,l:0}; if(h.result==='승'){dayStats[dow].w++;monthStats[ym].w++;} else{dayStats[dow].l++;monthStats[ym].l++;} });
    });
    const maxDay=Math.max(...dayStats.map(d=>d.w+d.l),1);
    const sortedMonths=Object.entries(monthStats).sort((a,b)=>a[0].localeCompare(b[0]));
    const maxMonth=Math.max(...sortedMonths.map(([,s])=>s.w+s.l),1);
    function dayColor(rate){ if(rate>=60)return'#16a34a';if(rate>=50)return'#2563eb';if(rate>=40)return'#d97706';return'#dc2626'; }
    return`<div style="display:flex;flex-direction:column;gap:14px"><div class="ssec"><div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:12px"><h4 style="margin:0">📅 요일 / 시즌별 승률</h4><div style="display:flex;gap:6px;flex-wrap:wrap;margin-left:auto"><select onchange="window._seasonalFilter.gender=this.value;render()" style="font-size:12px;padding:4px 8px;border:1px solid var(--border2);border-radius:7px"><option value="">성별 전체</option><option value="M"${f.gender==='M'?' selected':''}>👨 남자</option><option value="F"${f.gender==='F'?' selected':''}>👩 여자</option></select><select onchange="window._seasonalFilter.univ=(function(v){try{var t=document.createElement('textarea');t.innerHTML=v;return t.value;}catch(e){return v;}})(this.value);render()" style="font-size:12px;padding:4px 8px;border:1px solid var(--border2);border-radius:7px"><option value="">대학 전체</option>${univs.map(u=>`<option value="${window.escHTML?window.escHTML(u.name):u.name}"${f.univ===u.name?' selected':''}>${u.name}</option>`).join('')}</select><select onchange="window._seasonalFilter.race=this.value;render()" style="font-size:12px;padding:4px 8px;border:1px solid var(--border2);border-radius:7px"><option value="">종족 전체</option><option value="T"${f.race==='T'?' selected':''}>테란</option><option value="Z"${f.race==='Z'?' selected':''}>저그</option><option value="P"${f.race==='P'?' selected':''}>프로토스</option></select><button class="btn btn-w btn-sm" onclick="window._seasonalFilter={gender:'',univ:'',race:''};render()">🔄 초기화</button></div></div><h4 style="font-size:13px;margin-bottom:10px">🗓️ 요일별 승률</h4><div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:20px">${dayStats.map((d,i)=>{ const tot=d.w+d.l;const rate=tot?Math.round(d.w/tot*100):0; const col=dayColor(rate); const isWeekend=i===0||i===6; return`<div style="flex:1;min-width:70px;text-align:center;background:${isWeekend?'#fef3c7':'var(--white)'};border:1px solid var(--border);border-radius:10px;padding:12px 8px"><div style="font-weight:800;font-size:15px;color:${isWeekend?'var(--gold)':'var(--text)'};margin-bottom:4px">${d.day}</div><div style="font-size:22px;font-weight:900;color:${col};margin-bottom:2px">${tot?rate+'%':'-'}</div><div style="height:4px;background:var(--border2);border-radius:2px;overflow:hidden;margin:4px 0"><div style="width:${rate}%;background:${col};height:100%;border-radius:2px"></div></div><div style="font-size:10px;color:var(--gray-l)">${d.w}승 ${d.l}패</div></div>`; }).join('')}</div><h4 style="font-size:13px;margin-bottom:10px">📆 월별 승률 추이</h4>${sortedMonths.length===0?'<p style="color:var(--gray-l)">기록 없음</p>':`<div style="overflow-x:auto"><div style="display:flex;align-items:flex-end;gap:6px;min-width:${sortedMonths.length*56}px;height:120px;padding-bottom:22px;position:relative">${sortedMonths.map(([ym,s])=>{ const tot=s.w+s.l;const rate=tot?Math.round(s.w/tot*100):0; const col=dayColor(rate); const barH=tot?Math.round((tot/maxMonth)*80)+10:4; return`<div style="display:flex;flex-direction:column;align-items:center;flex:1;min-width:48px;position:relative"><span style="font-size:9px;color:${col};font-weight:800;margin-bottom:2px">${rate}%</span><div style="width:100%;height:${barH}px;background:${col};border-radius:4px 4px 0 0;opacity:.8;min-height:4px"></div><span style="font-size:9px;color:var(--gray-l);margin-top:3px;white-space:nowrap">${ym.slice(2)}</span><span style="font-size:9px;color:var(--gray-l)">${s.w}W${s.l}L</span></div>`; }).join('')}</div></div>`}</div></div>`;
  }

  function statsClutchHTML(){
    const aceStats={};
    const _clutchNm=typeof window.getNormalMatchesForHistory==='function'?window.getNormalMatchesForHistory():[];
    const allMatchSets=[...(window.miniM||[]),...(window.univM||[]),...(window.ckM||[]),...(window.comps||[]),...(window.proM||[]),...(window.ttM||[]),..._clutchNm];
    allMatchSets.forEach(m=>(m.sets||[]).forEach(set=>{ if(!_isAceLikeSet(set))return; (set.games||[]).forEach(g=>{ if(!g.playerA||!g.playerB||!g.winner)return; const wName=g.winner==='A'?g.playerA:g.playerB; const lName=g.winner==='A'?g.playerB:g.playerA; if(!aceStats[wName])aceStats[wName]={w:0,l:0}; if(!aceStats[lName])aceStats[lName]={w:0,l:0}; aceStats[wName].w++; aceStats[lName].l++; }); }));
    const aceList=Object.entries(aceStats).map(([name,s])=>{ const p=window.statsP(name); if(!p)return null; const tot=s.w+s.l; const rate=tot?Math.round(s.w/tot*100):0; return{name,w:s.w,l:s.l,tot,rate,univ:p.univ,tier:p.tier,elo:p.elo||1200,totalGames:(p.win||0)+(p.loss||0),clutchRatio:tot>0?(s.w/tot-0.5)*2:0}; }).filter(Boolean).filter(e=>e.tot>=1).sort((a,b)=>b.rate-a.rate||b.tot-a.tot);
    const topClutch=aceList.slice(0,15);
    const worstClutch=[...aceList].filter(e=>e.tot>=2).sort((a,b)=>a.rate-b.rate||b.tot-a.tot).slice(0,10);
    function clutchRow(e,i){ const col=window.gc(e.univ); const rateCol=e.rate>=60?'#7c3aed':e.rate>=50?'var(--green)':e.rate>=40?'var(--gold)':'var(--red)'; const badge=i===0?'🥇':i===1?'🥈':i===2?'🥉':`${i+1}`; return`<div style="display:flex;align-items:center;gap:10px;padding:8px 12px;background:var(--white);border:1px solid var(--border);border-radius:8px;cursor:pointer" onclick="openPlayerModal('${e.name}')"><span style="min-width:24px;font-size:15px">${badge}</span><span style="font-weight:800;font-size:13px;color:var(--blue);min-width:65px">${e.name}</span><span style="font-size:11px;color:${col};font-weight:700;min-width:55px">${e.univ}</span><div style="flex:1;background:var(--border2);border-radius:20px;height:10px;overflow:hidden"><div style="width:${e.rate}%;background:${rateCol};height:100%;border-radius:20px"></div></div><span style="font-weight:900;font-size:14px;color:${rateCol};min-width:40px;text-align:right">${e.rate}%</span><span style="font-size:11px;color:var(--gray-l)">${e.w}W ${e.l}L (${e.tot}경기)</span></div>`; }
    const totalAceGames=aceList.reduce((s,e)=>s+e.tot,0)/2;
    return`<div style="display:flex;flex-direction:column;gap:14px"><div class="ssec"><h4 style="margin-bottom:6px">⚡ 클러치 지수 <span style="font-size:11px;color:var(--gray-l);font-weight:400">에이스 결정전 / 타이브레이커 승률</span></h4><p style="font-size:12px;color:var(--gray-l);margin-bottom:14px">총 에이스전: ${Math.round(totalAceGames)}경기 · 경기 입력 시 세트에 <b>ACE</b> 표시된 경기만 집계됩니다</p>${aceList.length===0?'<p style="color:var(--gray-l);padding:40px;text-align:center">에이스전 기록이 없습니다.<br><span style="font-size:11px">경기 입력 시 세트 설정에서 ACE 세트로 지정해 주세요.</span></p>':`<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px"><div><div style="font-weight:800;font-size:13px;color:#7c3aed;margin-bottom:8px;padding:7px 12px;background:#f5f3ff;border-radius:8px;border-left:4px solid #7c3aed">🎯 클러치 킹 TOP 10</div><div style="display:flex;flex-direction:column;gap:4px">${topClutch.slice(0,10).map(clutchRow).join('')}</div></div><div><div style="font-weight:800;font-size:13px;color:var(--red);margin-bottom:8px;padding:7px 12px;background:#fef2f2;border-radius:8px;border-left:4px solid var(--red)">💧 에이스전 약자 TOP 10</div><div style="display:flex;flex-direction:column;gap:4px">${worstClutch.map(clutchRow).join('')}</div></div></div>`}</div></div>`;
  }

  function statsStreakHistHTML(){
    const allStreaks=[];
    (window.players||[]).forEach(p=>{
      // 역대 연속 기록은 날짜 필터 없이 전체 history 사용 (statsNonProHist 대신 _statsAllHistLocal)
      const hist=[..._statsAllHistLocal(p)].sort((a,b)=>(a.date||'').localeCompare(b.date||''));
      if(!hist.length) return;
      let cur=0, curType='', startDate='', endDate='';
      hist.forEach((h,i)=>{
        if(h.result===curType){
          cur++;
          endDate=h.date||endDate;
        }else{
          if(cur>=3){
            allStreaks.push({name:p.name,univ:p.univ,type:curType,n:cur,start:startDate,end:endDate,elo:p.elo||1200});
          }
          cur=1;
          curType=h.result;
          startDate=h.date||'';
          endDate=h.date||'';
        }
        if(i===hist.length-1&&cur>=3){
          allStreaks.push({name:p.name,univ:p.univ,type:curType,n:cur,start:startDate,end:endDate,elo:p.elo||1200,current:true});
        }
      });
    });
    const winStreaks=allStreaks.filter(s=>s.type==='승').sort((a,b)=>b.n-a.n).slice(0,15);
    const loseStreaks=allStreaks.filter(s=>s.type==='패').sort((a,b)=>b.n-a.n).slice(0,15);
    function streakRow(s,i){ const col=window.gc(s.univ); const isWin=s.type==='승'; const badge=i===0?'🥇':i===1?'🥈':i===2?'🥉':`${i+1}`; return`<div style="display:flex;align-items:center;gap:10px;padding:8px 12px;background:var(--white);border:1px solid var(--border);border-radius:8px;cursor:pointer;${s.current?'border-color:'+( isWin?'#16a34a':'#dc2626')+';box-shadow:0 0 0 2px '+(isWin?'#dcfce7':'#fee2e2'):''}" onclick="openPlayerModal('${s.name}')"><span style="min-width:24px;font-size:15px">${badge}</span><span style="font-weight:900;font-size:20px;color:${isWin?'var(--green)':'var(--red)'};min-width:48px">${s.n}</span><div style="flex:1;min-width:0"><div style="font-weight:800;font-size:13px">${s.name} <span style="font-size:10px;color:${col};font-weight:600">${s.univ}</span>${s.current?`<span style="font-size:10px;background:${isWin?'#dcfce7':'#fee2e2'};color:${isWin?'#16a34a':'#dc2626'};padding:1px 6px;border-radius:4px;font-weight:700;margin-left:4px">진행중</span>`:''}</div><div style="font-size:10px;color:var(--gray-l)">${s.start}${s.end&&s.end!==s.start?' ~ '+s.end:''}</div></div><span style="font-weight:800;font-size:13px;color:${isWin?'var(--green)':'var(--red)'};white-space:nowrap">연${isWin?'승':'패'}</span></div>`; }
    return`<div style="display:flex;flex-direction:column;gap:14px"><div class="ssec"><h4 style="margin-bottom:14px">🔥 역대 연속 기록 히스토리 <span style="font-size:11px;color:var(--gray-l);font-weight:400">(3연속 이상)</span></h4><div style="display:grid;grid-template-columns:1fr 1fr;gap:16px"><div><div style="font-weight:800;font-size:13px;color:var(--green);margin-bottom:8px;padding:7px 12px;background:#f0fdf4;border-radius:8px;border-left:4px solid var(--green)">🏆 역대 최장 연승 TOP 15</div><div style="display:flex;flex-direction:column;gap:4px">${winStreaks.length?winStreaks.map(streakRow).join(''):'<p style="color:var(--gray-l);padding:16px;text-align:center">기록 없음</p>'}</div></div><div><div style="font-weight:800;font-size:13px;color:var(--red);margin-bottom:8px;padding:7px 12px;background:#fef2f2;border-radius:8px;border-left:4px solid var(--red)">❄️ 역대 최장 연패 TOP 15</div><div style="display:flex;flex-direction:column;gap:4px">${loseStreaks.length?loseStreaks.map(streakRow).join(''):'<p style="color:var(--gray-l);padding:16px;text-align:center">기록 없음</p>'}</div></div></div></div></div>`;
  }

  function statsTierMatchHTML(){
    const TIER_PALETTE=['#7c3aed','#dc2626','#2563eb','#16a34a','#0f172a','#0891b2','#d97706','#64748b','#9f1239','#065f46','#1e3a8a','#713f12','#3f3f46','#7c2d12','#166534'];
    const _tiIdx2=t=>{const i=(window.TIERS||[]).indexOf(t);return i<0?(window.TIERS||[]).length:i;};
    const usedTiers=[...new Set((window.players||[]).map(p=>p.tier).filter(Boolean))].sort((a,b)=>_tiIdx2(a)-_tiIdx2(b));
    if(!usedTiers.length)return`<div class="ssec"><p style="color:var(--gray-l);padding:40px;text-align:center">티어 데이터가 없습니다.</p></div>`;
    const tierColor={}; usedTiers.forEach((t,i)=>{ tierColor[t]=(typeof window.getTierBtnColor==='function' ? window.getTierBtnColor(t) : null) || TIER_PALETTE[i%TIER_PALETTE.length]; });
    const matrix={}; usedTiers.forEach(t1=>{matrix[t1]={};usedTiers.forEach(t2=>{matrix[t1][t2]={w:0,l:0};});});
    (window.players||[]).forEach(p=>{ const myTier=p.tier||''; if(!myTier||!matrix[myTier])return; window.statsNonProHist(p).forEach(h=>{ const opp=window.statsP(h.opp); const oppTier=opp?.tier||''; if(!oppTier||!matrix[myTier][oppTier])return; if(h.result==='승')matrix[myTier][oppTier].w++; else matrix[myTier][oppTier].l++; }); });
    const tierOverview=usedTiers.map(t=>{ let w=0,l=0; usedTiers.forEach(t2=>{w+=matrix[t][t2].w;l+=matrix[t][t2].l;}); return{tier:t,w,l,rate:w+l?Math.round(w/(w+l)*100):null}; }).filter(t=>t.w+t.l>0);
    const activeTiers=usedTiers.filter(t=>tierOverview.some(ov=>ov.tier===t));
    function cellStyle(w,l){ if(!w&&!l)return'background:#f8fafc;color:#94a3b8'; const r=w/(w+l); if(r>=0.65)return'background:#dcfce7;color:#16a34a'; if(r>=0.5)return'background:#f0fdf4;color:#16a34a'; if(r<=0.35)return'background:#fee2e2;color:#dc2626'; if(r<0.5)return'background:#fff5f5;color:#dc2626'; return'background:#f8fafc;color:#374151'; }
    if(!activeTiers.length)return`<div class="ssec"><p style="color:var(--gray-l);padding:40px;text-align:center">티어 간 경기 기록이 없습니다.<br><span style="font-size:11px">선수에 티어가 설정되고 경기 기록이 있어야 합니다.</span></p></div>`;
    return`<div style="display:flex;flex-direction:column;gap:14px"><div class="ssec"><h4 style="margin-bottom:6px">🎖️ 티어 간 상대전적 매트릭스 <span style="font-size:11px;color:var(--gray-l);font-weight:400">전 경기 포함 (프로리그·남자 포함)</span></h4><p style="font-size:11px;color:var(--gray-l);margin-bottom:12px">가로=내 티어 / 세로=상대 티어 / 녹색=우세 빨강=열세</p><div style="overflow-x:auto"><table style="border-collapse:collapse;font-size:12px;min-width:${100+activeTiers.length*72}px"><thead><tr><th style="padding:8px 12px;background:var(--surface);border:1px solid var(--border);white-space:nowrap">내↓ / 상대→</th>${activeTiers.map(t=>`<th style="padding:6px 8px;background:${tierColor[t]}22;border:1px solid var(--border);white-space:nowrap;min-width:72px"><span style="background:${tierColor[t]};color:${typeof window.getTierBtnTextColor==='function'?window.getTierBtnTextColor(t):'#fff'};padding:2px 7px;border-radius:4px;font-size:11px;font-weight:700">${window.getTierLabel(t)}</span></th>`).join('')}<th style="padding:6px 8px;background:var(--surface);border:1px solid var(--border);white-space:nowrap">전체</th></tr></thead><tbody>${activeTiers.map(t1=>{ const ov=tierOverview.find(x=>x.tier===t1); return`<tr><td style="padding:6px 10px;background:${tierColor[t1]}22;border:1px solid var(--border);font-weight:700;white-space:nowrap"><span style="background:${tierColor[t1]};color:${typeof window.getTierBtnTextColor==='function'?window.getTierBtnTextColor(t1):'#fff'};padding:2px 7px;border-radius:4px;font-size:11px">${window.getTierLabel(t1)}</span></td>${activeTiers.map(t2=>{ if(t1===t2){ const s=matrix[t1][t2];const tot=s.w+s.l; const r=tot?Math.round(s.w/tot*100):null; return`<td style="padding:6px 8px;border:1px solid var(--border);text-align:center;background:var(--border2)"><div style="font-size:9px;color:var(--gray-l);font-weight:600">동티어</div>${tot?`<div style="font-weight:800;font-size:12px;color:${r>=50?'var(--green)':'var(--red)'}">${r}%</div><div style="font-size:10px;color:var(--gray-l)">${s.w}W${s.l}L</div>`:'<div style="color:var(--gray-l);font-size:11px">-</div>'}</td>`; } const s=matrix[t1][t2];const tot=s.w+s.l; const r=tot?Math.round(s.w/tot*100):null; const cs=cellStyle(s.w,s.l); return`<td style="padding:5px 6px;border:1px solid var(--border);text-align:center;${cs}">${tot?`<div style="font-weight:800;font-size:12px">${r}%</div><div style="font-size:10px;opacity:.7">${s.w}W${s.l}L</div>`:'<span style="color:#94a3b8;font-size:11px">-</span>'}</td>`; }).join('')}<td style="padding:5px 8px;border:1px solid var(--border);text-align:center;background:var(--surface)">${ov&&ov.rate!==null?`<div style="font-weight:800;font-size:12px;color:${ov.rate>=50?'var(--green)':'var(--red)'}">${ov.rate}%</div><div style="font-size:10px;color:var(--gray-l)">${ov.w}W${ov.l}L</div>`:'<span style="color:var(--gray-l)">-</span>'}</td></tr>`; }).join('')}</tbody></table></div></div><div class="ssec"><h4 style="margin-bottom:12px">📊 티어별 전체 승률 요약</h4><div style="display:flex;flex-wrap:wrap;gap:10px">${tierOverview.map(t=>{ const col=tierColor[t.tier]||'#6b7280'; const tot=t.w+t.l; return`<div style="flex:1;min-width:90px;background:var(--white);border:2px solid ${col}33;border-radius:12px;padding:12px;text-align:center"><div style="background:${col};color:${typeof window.getTierBtnTextColor==='function'?window.getTierBtnTextColor(t.tier):'#fff'};padding:2px 9px;border-radius:5px;font-weight:800;font-size:12px;display:inline-block;margin-bottom:6px">${window.getTierLabel(t.tier)}</div><div style="font-size:24px;font-weight:900;color:${col}">${t.rate!==null?t.rate+'%':'-'}</div><div style="font-size:10px;color:var(--gray-l);margin-top:3px">${t.w}승 ${t.l}패</div>${tot?`<div style="height:4px;background:var(--border2);border-radius:2px;overflow:hidden;margin-top:5px"><div style="width:${t.rate||0}%;background:${col};height:100%;border-radius:2px"></div></div>`:''}</div>`; }).join('')}</div></div></div>`;
  }

  function statsUnivMatrix2HTML(){
    const univs=window.getAllUnivs().filter(u=>(window.players||[]).some(p=>p.univ===u.name));
    if(univs.length<2)return`<div class="ssec"><p style="color:var(--gray-l)">대학 데이터 부족</p></div>`;
    const matrix={}, playerMatrix={};
    univs.forEach(a=>{ matrix[a.name]={}; playerMatrix[a.name]={}; univs.forEach(b=>{ matrix[a.name][b.name]={w:0,l:0}; playerMatrix[a.name][b.name]={}; }); });
    (window.players||[]).forEach(p=>{ window.statsNonProHist(p).forEach(h=>{ const opp=window.statsP(h.opp); if(!opp||opp.univ===p.univ)return; if(!matrix[p.univ]||!matrix[p.univ][opp.univ])return; if(h.result==='승')matrix[p.univ][opp.univ].w++; else matrix[p.univ][opp.univ].l++; if(!playerMatrix[p.univ][opp.univ][p.name])playerMatrix[p.univ][opp.univ][p.name]={}; if(!playerMatrix[p.univ][opp.univ][p.name][opp.name])playerMatrix[p.univ][opp.univ][p.name][opp.name]={w:0,l:0}; if(h.result==='승')playerMatrix[p.univ][opp.univ][p.name][opp.name].w++; else playerMatrix[p.univ][opp.univ][p.name][opp.name].l++; }); });
    const univRank=univs.map(u=>{ let w=0,l=0; univs.forEach(v=>{if(u.name!==v.name){w+=matrix[u.name][v.name].w;l+=matrix[u.name][v.name].l;}}); return{...u,w,l,rate:w+l?Math.round(w/(w+l)*100):0}; }).sort((a,b)=>b.rate-a.rate||b.w-a.w);
    if(!window._matrix2Sel.a&&univRank.length) window._matrix2Sel.a=univRank[0].name;
    if(!window._matrix2Sel.b&&univRank.length>1) window._matrix2Sel.b=univRank[1].name;
    let detailHTML='';
    if(window._matrix2Sel.a&&window._matrix2Sel.b&&window._matrix2Sel.a!==window._matrix2Sel.b){
      const pmAB=playerMatrix[window._matrix2Sel.a]?.[window._matrix2Sel.b]||{};
      const sAB=matrix[window._matrix2Sel.a]?.[window._matrix2Sel.b]||{w:0,l:0};
      const sBA=matrix[window._matrix2Sel.b]?.[window._matrix2Sel.a]||{w:0,l:0};
      const colA=window.gc(window._matrix2Sel.a), colB=window.gc(window._matrix2Sel.b);
      const aPlayers=Object.entries(pmAB).map(([pName,opps])=>{ let w=0,l=0;Object.values(opps).forEach(s=>{w+=s.w;l+=s.l;}); return{name:pName,w,l,tot:w+l,rate:w+l?Math.round(w/(w+l)*100):0,opps}; }).sort((a,b)=>b.w-a.w);
      detailHTML=`<div class="ssec" style="margin-top:0"><div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:14px"><select style="padding:6px 10px;border:1.5px solid ${colA};border-radius:8px;font-size:13px;font-weight:700;color:${colA}" onchange="window._matrix2Sel.a=(function(v){try{var t=document.createElement('textarea');t.innerHTML=v;return t.value;}catch(e){return v;}})(this.value);render()">${univRank.map(u=>`<option value="${window.escHTML?window.escHTML(u.name):u.name}"${window._matrix2Sel.a===u.name?' selected':''}>${u.name}</option>`).join('')}</select><span style="font-weight:900;font-size:18px;color:var(--gray-l)">vs</span><select style="padding:6px 10px;border:1.5px solid ${colB};border-radius:8px;font-size:13px;font-weight:700;color:${colB}" onchange="window._matrix2Sel.b=(function(v){try{var t=document.createElement('textarea');t.innerHTML=v;return t.value;}catch(e){return v;}})(this.value);render()">${univRank.map(u=>`<option value="${window.escHTML?window.escHTML(u.name):u.name}"${window._matrix2Sel.b===u.name?' selected':''}>${u.name}</option>`).join('')}</select><div style="margin-left:auto;display:flex;gap:12px;align-items:center"><span style="background:${colA};color:#fff;padding:4px 14px;border-radius:8px;font-weight:800">${window._matrix2Sel.a} ${sAB.w}W ${sAB.l}L</span><span style="font-weight:900;font-size:15px">vs</span><span style="background:${colB};color:#fff;padding:4px 14px;border-radius:8px;font-weight:800">${window._matrix2Sel.b} ${sBA.w}W ${sBA.l}L</span></div></div><div style="overflow-x:auto"><table><thead><tr><th style="background:${colA}22">${window._matrix2Sel.a} 선수</th><th style="background:${colA}22">승</th><th style="background:${colA}22">패</th><th style="background:${colA}22">승률</th><th>vs 상대 선수 (${window._matrix2Sel.b})</th></tr></thead><tbody>${aPlayers.map(p=>{ const oppDetail=Object.entries(p.opps).map(([oName,s])=>`<span style="display:inline-flex;align-items:center;gap:3px;padding:2px 8px;background:${s.w>s.l?'#dcfce7':s.w<s.l?'#fee2e2':'#f1f5f9'};border-radius:6px;font-size:11px;cursor:pointer;margin:1px" onclick="openPlayerModal('${oName}')"><b>${oName}</b> ${s.w}W${s.l}L</span>`).join(''); return`<tr><td style="font-weight:700;cursor:pointer;color:var(--blue)" onclick="openPlayerModal('${p.name}')">${p.name}</td><td class="wt">${p.w}</td><td class="lt">${p.l}</td><td style="font-weight:800;color:${p.rate>=50?'var(--green)':'var(--red)'}">${p.tot?p.rate+'%':'-'}</td><td>${oppDetail||'<span style="color:var(--gray-l);font-size:11px">-</span>'}</td></tr>`; }).join('')}</tbody></table></div></div>`;
    }
    function cellBg(w,l){ if(!w&&!l)return'#f8fafc'; const r=w/(w+l); if(r>=0.6)return'#dcfce7'; if(r>=0.5)return'#f0fdf4'; if(r<=0.4)return'#fee2e2'; if(r<0.5)return'#fff5f5'; return'#f8fafc'; }
    return`<div style="display:flex;flex-direction:column;gap:14px"><div class="ssec" id="stats-univmatrix2-sec"><h4 style="margin-bottom:12px">🏛️ 대학 간 상대전적 매트릭스 (상세)</h4><div style="overflow-x:auto"><table style="border-collapse:collapse;font-size:12px;min-width:${60+univRank.length*72}px"><thead><tr><th style="padding:6px 10px;background:var(--surface);border:1px solid var(--border)">↓나 / 상대→</th>${univRank.map(u=>`<th style="padding:6px 8px;background:${window.gc(u.name)}22;border:1px solid var(--border);white-space:nowrap;min-width:72px"><div style="display:flex;flex-direction:column;align-items:center;gap:2px"><span style="background:${window.gc(u.name)};color:#fff;padding:2px 7px;border-radius:4px;font-size:11px;font-weight:700">${u.name}</span><span style="font-size:10px;color:${u.rate>=50?'var(--green)':'var(--red)'};font-weight:700">${u.rate}%</span></div></th>`).join('')}</tr></thead><tbody>${univRank.map(u=>`<tr><td style="padding:6px 10px;background:${window.gc(u.name)}22;border:1px solid var(--border);font-weight:700;white-space:nowrap"><span style="background:${window.gc(u.name)};color:#fff;padding:2px 7px;border-radius:4px;font-size:11px">${u.name}</span></td>${univRank.map(v=>{ if(u.name===v.name)return`<td style="background:var(--border2);border:1px solid var(--border);text-align:center;color:var(--gray-l)">-</td>`; const s=matrix[u.name][v.name];const t=s.w+s.l;if(!t)return`<td style="background:#f8fafc;border:1px solid var(--border);text-align:center;color:var(--gray-l);font-size:11px">-</td>`; const r=Math.round(s.w/t*100); return`<td style="background:${cellBg(s.w,s.l)};border:1px solid var(--border);text-align:center;padding:5px 4px;cursor:pointer" onclick="window._matrix2Sel.a='${u.name}';window._matrix2Sel.b='${v.name}';render();setTimeout(()=>{const el=document.getElementById('matrix2-detail');if(el)el.scrollIntoView({behavior:'smooth'});},0)"><div style="font-weight:800;font-size:13px;color:${r>=50?'#16a34a':'#dc2626'}">${r}%</div><div style="font-size:10px;color:var(--gray-l)">${s.w}W${s.l}L</div></td>`; }).join('')}</tr>`).join('')}</tbody></table></div><p style="font-size:11px;color:var(--gray-l);margin-top:6px">셀 클릭 시 아래 선수별 상세 표시</p></div><div id="matrix2-detail">${detailHTML}</div></div>`;
  }

  window._calcRaceTrendData = _calcRaceTrendData;
  window.statsRaceTrendHTML = statsRaceTrendHTML;
  window.initRaceTrendChart = initRaceTrendChart;
  window.applyKillerSearch = applyKillerSearch;
  window.syncKillerSelection = syncKillerSelection;
  window.statsKillerHTML = statsKillerHTML;
  window.statsSeasonalHTML = statsSeasonalHTML;
  window.statsClutchHTML = statsClutchHTML;
  window.statsStreakHistHTML = statsStreakHistHTML;
  window.statsTierMatchHTML = statsTierMatchHTML;
  window.statsUnivMatrix2HTML = statsUnivMatrix2HTML;
})();
