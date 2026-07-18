function initPEloChart(name, year){
  const p=players.find(x=>x.name===name);
  const canvas=document.getElementById('pEloChart');
  const tip=document.getElementById('pEloTip');
  if(!p||!canvas)return;
  // 개인전/끝장전/대회 등 외부 매치소스까지 합쳐진 통합 기록(있으면 우선 사용).
  // 캐시가 없으면(모달이 아직 한 번도 렌더링되지 않은 예외적인 경우) p.history로 폴백.
  const _cached = (window._pEloChartDataCache && window._pEloChartDataCache[name]);
  const _src = (Array.isArray(_cached) && _cached.length) ? _cached : (p.history||[]);
  const histAll=[...(_src||[])].reverse();
  let _eloRc=p.elo||ELO_DEFAULT;
  const _eloRcMap=new Map();
  [...histAll].reverse().forEach((h,i)=>{_eloRcMap.set(i,_eloRc);_eloRc-=(h.eloDelta||0);});
  const allPts=[];let elo=ELO_DEFAULT;
  histAll.forEach((h,i)=>{
    const _ea = h.eloAfter != null ? h.eloAfter : (_eloRcMap.get(histAll.length-1-i) ?? null);
    if(_ea!=null){ elo=_ea; allPts.push({elo,date:h.date||'',result:h.result,opp:h.opp||'',delta:h.eloDelta||0}); }
    else{elo+=(h.eloDelta||0);allPts.push({elo,date:h.date||'',result:h.result,opp:h.opp||'',delta:h.eloDelta||0});}
  });
  const st = (typeof getPlayerDetailState==='function') ? getPlayerDetailState() : (window.PlayerDetailState||{});
  const _yr=year||st.year||'';
  const pts=_yr?allPts.filter(pt=>(pt.date||'').startsWith(_yr)):allPts;
  pts.forEach((pt,i)=>pt.i=i);
  if(pts.length<2){canvas.style.display='none';return;}
  const W=canvas.offsetWidth||canvas.parentElement?.offsetWidth||300;
  const H=140;
  canvas.width=W;canvas.height=H;
  const pad={t:14,r:14,b:32,l:46};
  const minE=Math.min(...pts.map(x=>x.elo))-15;
  const maxE=Math.max(...pts.map(x=>x.elo))+15;
  const mapX=i=>(i/(pts.length-1||1))*(W-pad.l-pad.r)+pad.l;
  const mapY=e=>H-pad.b-((e-minE)/(maxE-minE||1))*(H-pad.t-pad.b);
  const ctx=canvas.getContext('2d');
  ctx.clearRect(0,0,W,H);
  ctx.strokeStyle='#e2e8f0';ctx.lineWidth=1;
  for(let g=0;g<=3;g++){
    const y=pad.t+g*(H-pad.t-pad.b)/3;
    ctx.beginPath();ctx.moveTo(pad.l,y);ctx.lineTo(W-pad.r,y);ctx.stroke();
    ctx.fillStyle='#94a3b8';ctx.font='9px sans-serif';ctx.textAlign='right';
    ctx.fillText(Math.round(maxE-(maxE-minE)*g/3), pad.l-6, y+3);
  }
  ctx.strokeStyle='#cbd5e1';ctx.beginPath();
  ctx.moveTo(pad.l,pad.t);ctx.lineTo(pad.l,H-pad.b);ctx.lineTo(W-pad.r,H-pad.b);ctx.stroke();
  ctx.beginPath();
  pts.forEach((pt,i)=>{const x=mapX(i),y=mapY(pt.elo); if(i===0)ctx.moveTo(x,y); else ctx.lineTo(x,y);});
  ctx.strokeStyle='#3b82f6';ctx.lineWidth=2.5;ctx.stroke();
  pts.forEach(pt=>{
    const x=mapX(pt.i),y=mapY(pt.elo);
    ctx.beginPath();ctx.arc(x,y,3.5,0,Math.PI*2);
    ctx.fillStyle=pt.result==='승'?'#22c55e':'#ef4444';ctx.fill();
    ctx.strokeStyle='#fff';ctx.lineWidth=1.5;ctx.stroke();
  });
  ctx.fillStyle='#64748b';ctx.font='10px sans-serif';ctx.textAlign='center';
  const pickIdx=[0,Math.floor((pts.length-1)/2),pts.length-1].filter((v,i,a)=>a.indexOf(v)===i);
  pickIdx.forEach(i=>{
    const x=mapX(i), d=pts[i].date||'';
    const label=d?`${d.slice(2,4)}.${d.slice(5,7)}.${d.slice(8,10)}`:`${i+1}`;
    ctx.fillText(label,x,H-10);
  });
  if(tip){
    canvas.onmousemove=e=>{
      const rect=canvas.getBoundingClientRect();
      const mx=(e.clientX-rect.left)*(W/rect.width);
      let ci=0,md=Infinity;
      pts.forEach((pt,i)=>{const d=Math.abs(mapX(pt.i)-mx);if(d<md){md=d;ci=i;}});
      if(md<28){
        const pt=pts[ci];const sign=pt.delta>=0?'+':'';
        tip.innerHTML=`<b>${pt.opp||'?'}</b> <span style="color:${pt.result==='승'?'#86efac':'#fca5a5'}">${pt.result}</span><br>${sign}${pt.delta} → <b>${pt.elo}</b><br><span style="color:#94a3b8">${pt.date}</span>`;
        const tx=mapX(ci)*(rect.width/W);
        const ty=mapY(pt.elo)*(rect.height/H);
        tip.style.display='block';
        tip.style.left=(tx>rect.width/2?tx-130:tx+10)+'px';
        tip.style.top=Math.max(0,ty-10)+'px';
      } else tip.style.display='none';
    };
    canvas.onmouseleave=()=>{tip.style.display='none';};
  }
}

window.openStarSystemInfo = function(){
  try{
    const titleEl=document.getElementById('reTitle');
    const bodyEl=document.getElementById('reBody');
    if(titleEl) titleEl.textContent='📘 티어표 · 산정기준 안내';
    if(bodyEl){
      bodyEl.innerHTML=`
        <div style="display:flex;flex-direction:column;gap:12px">
          <div style="display:flex;flex-direction:column;gap:6px">
            <div style="font-weight:1000;color:var(--text2)">1) 포함 데이터(출처)</div>
            <div style="font-size:var(--fs-sm);color:var(--text3);line-height:1.65">
              <ul style="margin:0;padding-left:18px">
                <li>앱에 <b>등록된 경기 기록</b>(개인전/대학대전/CK/프로리그/대회/티어대회/토너먼트 등)</li>
                <li><b>펨코 스타 게시판 → 경기결과탭</b>에서 가져와 <b>“기록으로 등록된 항목”</b>도 포함됩니다(등록되어 있는 경우)</li>
                <li><b>여성 스트리머 간 끝장전</b>의 경우, 펨코 스타크래프트 게시판 <b>경기 결과탭</b>에 글이 등록되고 → 그 결과가 <b>우리 앱 기록으로 등록된 경우</b> 반영됩니다</li>
                <li>즉, “외부 사이트를 지금 실시간으로 긁는” 게 아니라 <b>우리 DB(현재 저장된 기록)</b>를 기준으로 계산합니다</li>
              </ul>
            </div>
          </div>

          <div style="display:flex;flex-direction:column;gap:6px">
            <div style="font-weight:1000;color:var(--text2)">2) 공식전 인정 기준</div>
            <div style="font-size:var(--fs-sm);color:var(--text3);line-height:1.6">
              통계 → ⭐ 스타시스템에서 설정한 <b>“공식전 모드 키워드”</b>가 경기 기록의 <code>mode</code>에 포함되면 공식전으로 처리합니다.
            </div>
          </div>

          <div style="display:flex;flex-direction:column;gap:6px">
            <div style="font-weight:1000;color:var(--text2)">3) 점수 로직(제로섬 3점 체제)</div>
            <div style="overflow:auto;border:1px solid var(--border);border-radius:var(--r);background:#fff">
              <table style="width:100%;border-collapse:collapse;font-size:var(--fs-sm)">
                <thead>
                  <tr style="background:var(--surface);color:var(--gray-l)">
                    <th style="padding:8px;border-bottom:1px solid var(--border)">대전 상대</th>
                    <th style="padding:8px;border-bottom:1px solid var(--border)">승리(Win)</th>
                    <th style="padding:8px;border-bottom:1px solid var(--border)">패배(Loss)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td style="padding:8px;border-bottom:1px solid #f1f5f9">동일 티어 (0)</td><td style="padding:8px;border-bottom:1px solid #f1f5f9;color:#16a34a;font-weight:900">+3</td><td style="padding:8px;border-bottom:1px solid #f1f5f9;color:#dc2626;font-weight:900">-3</td></tr>
                  <tr><td style="padding:8px;border-bottom:1px solid #f1f5f9">상위 티어 (+1)</td><td style="padding:8px;border-bottom:1px solid #f1f5f9;color:#16a34a;font-weight:900">+5</td><td style="padding:8px;border-bottom:1px solid #f1f5f9;color:#dc2626;font-weight:900">-5</td></tr>
                  <tr><td style="padding:8px">하위 티어 (-1)</td><td style="padding:8px;color:#16a34a;font-weight:900">+2</td><td style="padding:8px;color:#dc2626;font-weight:900">-2</td></tr>
                </tbody>
              </table>
            </div>
            <div style="font-size:var(--fs-caption);color:var(--gray-l);line-height:1.55">
              ※ 제로섬(Zero-sum): 승자 +X / 패자 -X (경기 단위로 총점 보존)<br>
              ※ 현재 버전은 “현재 티어 기준”으로 상대 티어 차이를 계산합니다. (경기 당시 티어까지 정확히 하려면 기록에 tierAtMatch 저장이 필요)
            </div>
          </div>

          <div style="display:flex;flex-direction:column;gap:6px">
            <div style="font-weight:1000;color:var(--text2)">4) 승강급 기준</div>
            <div style="font-size:var(--fs-sm);color:var(--text3);line-height:1.6">
              시작점수 100점. <b>130점</b> 도달 시 <b>승급 검증</b>, <b>70점 미만</b>이면 <b>강등 위기</b>.
            </div>
          </div>
        </div>
      `;
    }
    if(typeof om==='function') om('reModal');
  }catch(e){
    alert('설명 팝업을 여는 중 오류가 발생했습니다.');
  }
};

try{
  window.initPEloChart = initPEloChart;
}catch(e){}
