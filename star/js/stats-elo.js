/* ══════════════════════════════════════════════════════════════
   통계 - ELO 랭킹 변동 그래프 (stats-overview-elo.js 에서 분리, 2026-07-30)
   ══════════════════════════════════════════════════════════════ */

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
