(function(){
  function statsHeatmapHTML(){
    const selName = String(window._heatmapSelPlayer||'');
    const playersWithHist=(window.players||[]).filter(p=>(p.history||[]).length>0).sort((a,b)=>a.name.localeCompare(b.name,'ko'));
    const isPlayerMode=!!selName;
    const dayCnt={};
    if(isPlayerMode){
      const tp=window.statsP(selName);
      window.statsNonProHist(tp||{history:[]}).forEach(h=>{const d=h.date||'';if(!d)return;dayCnt[d]=(dayCnt[d]||0)+1;});
    }else{
      const _heatTourM=typeof window.getTourneyMatches==='function'?window.getTourneyMatches():[];
      const _heatNmM=typeof window.getNormalMatchesForHistory==='function'?window.getNormalMatchesForHistory():[];
      const allM=window.statsFilterMatches([...(window.miniM||[]),...(window.univM||[]),...(window.ckM||[]),...(window.comps||[]),...(window.proM||[]),..._heatTourM,..._heatNmM]);
      allM.forEach(m=>{
        const d=m.d||'';if(!d)return;
        let cnt=0;
        (m.sets||[]).forEach(s=>(s.games||[]).forEach(()=>cnt++));
        if(cnt>0)dayCnt[d]=(dayCnt[d]||0)+cnt;
        else dayCnt[d]=(dayCnt[d]||0)+1;
      });
      const matchDates=new Set(Object.keys(dayCnt));
      (window.players||[]).forEach(p=>window.statsNonProHist(p).forEach(h=>{
        const d=h.date||'';if(!d||h.result!=='승')return;
        if(!matchDates.has(d))dayCnt[d]=(dayCnt[d]||0)+1;
      }));
    }
    if(!Object.keys(dayCnt).length){
      const msg=isPlayerMode?`${selName} 선수의 경기 기록이 없습니다.`:'경기 기록이 없습니다.';
      return `<div class="ssec"><p style="color:var(--gray-l);padding:40px;text-align:center">${msg}</p></div>`;
    }
    const today=new Date(); today.setHours(0,0,0,0);
    const start=new Date(today); start.setDate(start.getDate()-363);
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
        cells+=`<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" rx="2" fill="${heatColor(cnt)}" data-date="${ds}" data-cnt="${cnt}"><title>${ds}: ${cnt}게임</title></rect>`;
        if(d===0 && cur.getMonth()!==lastMonth){
          lastMonth=cur.getMonth();
          const mLabel=['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'][cur.getMonth()];
          monthLabels+=`<text x="${x}" y="${pad.t-6}" font-size="9" fill="var(--gray-l)">${mLabel}</text>`;
        }
        cur.setDate(cur.getDate()+1);
      }
    }
    const dayLabels=['일','월','화','수','목','금','토'].map((d,i)=>i%2===1?`<text x="${pad.l-6}" y="${pad.t+i*cellTotal+cellSize-2}" font-size="9" fill="var(--gray-l)" text-anchor="end">${d}</text>`:'').join('');
    const totalGames=Object.values(dayCnt).reduce((a,b)=>a+b,0);
    const activeDays=Object.keys(dayCnt).length;
    const topDays=Object.entries(dayCnt).sort((a,b)=>b[1]-a[1]).slice(0,5);
    const selHeatP=window.statsP(selName);
    return`<div style="display:flex;flex-direction:column;gap:16px">
    <div class="ssec" id="stats-heatmap-sec">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;flex-wrap:wrap;gap:8px">
        <h4 style="margin:0">📅 활동량 히트맵 <span style="font-size:11px;color:var(--gray-l);font-weight:400">최근 1년</span></h4>
        <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
          <div style="position:relative">
            <input id="heatmap-search-input" type="text" placeholder="🔍 스트리머 검색 (전체보기: 비워두기)"
              value="${selName}"
              style="font-size:12px;padding:4px 10px;border:1px solid var(--border2);border-radius:8px;width:200px"
              oncompositionstart="window._hsComp=true"
              oncompositionend="window._hsComp=false;heatmapSearchFilter(this.value);if(!this.value){window._heatmapSelPlayer='';render();}"
              oninput="heatmapSearchFilter(this.value);if(!this.value&&!window._hsComp){window._heatmapSelPlayer='';render();}"
              onfocus="document.getElementById('heatmap-search-drop').style.display='block'"
              onblur="setTimeout(()=>{const d=document.getElementById('heatmap-search-drop');if(d)d.style.display='none'},200)">
            <div id="heatmap-search-drop" style="display:none;position:absolute;top:34px;left:0;background:var(--white);border:1px solid var(--border2);border-radius:8px;z-index:300;max-height:200px;overflow-y:auto;width:260px;box-shadow:var(--sh2)">
              <div class="sitem" style="color:var(--gray-l);font-style:italic" onmousedown="window._heatmapSelPlayer='';document.getElementById('heatmap-search-input').value='';document.getElementById('heatmap-search-drop').style.display='none';render()">— 전체 경기 보기 —</div>
              ${playersWithHist.map(p=>`<div class="sitem" onmousedown="window._heatmapSelPlayer='${window.escJS(p.name)}';document.getElementById('heatmap-search-input').value='${window.escAttr(p.name)}';document.getElementById('heatmap-search-drop').style.display='none';render()">
                <b>${p.name}</b> <span style="color:${window.gc(p.univ)};font-size:11px">${p.univ}</span> <span style="color:var(--gray-l);font-size:10px">${(p.history||[]).length}경기</span>
              </div>`).join('')}
            </div>
          </div>
          ${selHeatP?`<span class="ubadge" style="background:${window.gc(selHeatP.univ)}">${selHeatP.univ}</span>`:''}
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
      <h4 style="margin-bottom:12px">🔥 최다 경기일 TOP 5 <span style="font-size:11px;font-weight:600;color:var(--gray-l)">— 숫자 클릭 시 스트리머 목록</span></h4>
      <div style="display:flex;flex-direction:column;gap:8px">
        ${topDays.map(([d,c],i)=>{
          const badge=i===0?'🥇':i===1?'🥈':i===2?'🥉':`${i+1}`;
          const safeD=window.escJS?window.escJS(d):d.replace(/'/g,"\'");
          return`<div style="display:flex;align-items:center;gap:12px;padding:10px 16px;background:var(--white);border:1px solid var(--border);border-radius:12px;transition:box-shadow .15s,transform .15s" onmouseenter="this.style.boxShadow='0 4px 14px rgba(15,23,42,.10)';this.style.transform='translateX(2px)'" onmouseleave="this.style.boxShadow='';this.style.transform=''">
            <span style="font-size:18px;flex-shrink:0">${badge}</span>
            <span class="heatmap-top5-date" style="font-weight:800;font-size:13px;color:var(--blue);min-width:96px" onclick="if(typeof openHeatmapDayPopup==='function')openHeatmapDayPopup('${safeD}',${c})">${d}</span>
            <div style="flex:1;background:var(--border2);border-radius:20px;height:10px;overflow:hidden">
              <div style="width:${Math.round(c/topDays[0][1]*100)}%;background:linear-gradient(90deg,#22c55e,#16a34a);height:100%;border-radius:20px"></div>
            </div>
            <span class="heatmap-top5-count" style="font-weight:900;font-size:14px;color:#16a34a" onclick="if(typeof openHeatmapDayPopup==='function')openHeatmapDayPopup('${safeD}',${c})">${c}경기</span>
          </div>`;
        }).join('')}
      </div>
    </div>
    </div>`;
  }

  window.statsHeatmapHTML = statsHeatmapHTML;
})();
