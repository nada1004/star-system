/* ══════════════════════════════════════════════════════════════
   통계 - 선수 성장 곡선 (stats-overview-elo.js 에서 분리, 2026-07-30)
   ══════════════════════════════════════════════════════════════ */

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
