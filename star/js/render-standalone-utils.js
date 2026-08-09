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
  // 고해상도(레티나) 화면에서 선이 흐릿해지는 것 방지: 실제 캔버스 픽셀은 DPR배로 그리고
  // CSS 크기는 그대로 유지, 컨텍스트를 DPR만큼 확대해서 좌표계는 기존 로직 그대로 사용
  const _DPR=window.devicePixelRatio||1;
  canvas.width=Math.round(W*_DPR);canvas.height=Math.round(H*_DPR);
  canvas.style.width=W+'px';canvas.style.height=H+'px';
  const pad={t:14,r:14,b:32,l:46};
  // 잘못된(NaN) elo 값이 섞여 있으면 조용히 빈 그래프로 그려지는 대신
  // 콘솔에 경고를 남기고 해당 포인트를 제외해서 최소한 나머지는 정상 표시되게 함
  const _badPts = pts.filter(x=>!Number.isFinite(x.elo));
  if(_badPts.length){
    try{ console.warn('[ELO차트] 잘못된 elo 값 감지, 제외됨:', name, _badPts); }catch(e){}
  }
  const pts2 = pts.filter(x=>Number.isFinite(x.elo));
  if(pts2.length<2){ canvas.style.display='none'; return; }
  pts.length=0; pts.push(...pts2); pts.forEach((pt,i)=>pt.i=i);
  // 역산 불일치(직전 값 + 기록된 델타 ≠ 이 포인트 값) 지점을 "비정상 점프"로 표시
  // → 실제 경기 결과가 아니라 그래프 데이터 재구성 과정의 오차일 가능성이 높다는 신호
  pts.forEach((pt,i)=>{
    if(i===0){ pt._anom=false; return; }
    const expected = pts[i-1].elo + (pt.delta||0);
    pt._anom = Math.abs(pt.elo - expected) > 5;
  });
  const minE=Math.min(...pts.map(x=>x.elo))-15;
  const maxE=Math.max(...pts.map(x=>x.elo))+15;
  // 날짜 기반 x축: 실제 경기 간격(공백기 포함)을 반영. 날짜가 없거나 전부 같은 날이면
  // 기존 방식(균등 인덱스 간격)으로 안전하게 폴백.
  const _ts=pts.map(pt=>{const t=Date.parse(pt.date||'');return Number.isFinite(t)?t:NaN;});
  const _tsValid = _ts.every(Number.isFinite) && (Math.max(..._ts)-Math.min(..._ts))>0;
  const _t0=_tsValid?Math.min(..._ts):0, _t1=_tsValid?Math.max(..._ts):1;
  const xs=pts.map((pt,i)=> _tsValid
    ? pad.l + ((_ts[i]-_t0)/(_t1-_t0))*(W-pad.l-pad.r)
    : (i/(pts.length-1||1))*(W-pad.l-pad.r)+pad.l);
  const mapX=i=>xs[i];
  const mapY=e=>H-pad.b-((e-minE)/(maxE-minE||1))*(H-pad.t-pad.b);
  const ctx=canvas.getContext('2d');
  ctx.setTransform(_DPR,0,0,_DPR,0,0);
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
  // 비정상 점프 구간은 점선 주황으로, 나머지는 기존처럼 파란 실선으로
  pts.forEach((pt,i)=>{
    if(i===0) return;
    const x0=mapX(i-1),y0=mapY(pts[i-1].elo),x1=mapX(i),y1=mapY(pt.elo);
    ctx.beginPath();ctx.moveTo(x0,y0);ctx.lineTo(x1,y1);
    if(pt._anom){ctx.strokeStyle='#f59e0b';ctx.setLineDash([4,3]);ctx.lineWidth=2;}
    else{ctx.strokeStyle='#3b82f6';ctx.setLineDash([]);ctx.lineWidth=2.5;}
    ctx.stroke();
  });
  ctx.setLineDash([]);
  // 점(마커)이 너무 많으면(경기수 많음) 서로 겹쳐 뭉개지므로, 일정 개수 이상이면
  // 매 경기 점은 생략하고 시작/끝/이상치 지점만 표시해 가독성을 유지
  const _denseMode = pts.length>80;
  pts.forEach(pt=>{
    const isEndpoint = pt.i===0 || pt.i===pts.length-1;
    if(_denseMode && !pt._anom && !isEndpoint) return;
    const x=mapX(pt.i),y=mapY(pt.elo);
    const r = pt._anom ? 4.5 : 3.5;
    ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);
    ctx.fillStyle=pt._anom?'#f59e0b':(pt.result==='승'?'#22c55e':(pt.result==='무'?'#94a3b8':'#ef4444'));ctx.fill();
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
        const _anomNote = pt._anom ? `<br><span style="color:#fbbf24">⚠ 데이터 불일치 의심 지점</span>` : '';
        tip.innerHTML=`<b>${pt.opp||'?'}</b> <span style="color:${pt.result==='승'?'#86efac':(pt.result==='무'?'#cbd5e1':'#fca5a5')}">${pt.result}</span><br>${sign}${pt.delta} → <b>${pt.elo}</b><br><span style="color:#94a3b8">${pt.date}</span>${_anomNote}`;
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
            <div style="font-weight:1000;color:var(--text2)">3) 점수 로직(제로섬 ${(window.SS_CONST||{PTS_SAME:3}).PTS_SAME}점 체제)</div>
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
                  ${(()=>{ const C=window.SS_CONST||{PTS_SAME:3,PTS_UP:5,PTS_DOWN:2}; return `
                  <tr><td style="padding:8px;border-bottom:1px solid #f1f5f9">동일 티어 (0)</td><td style="padding:8px;border-bottom:1px solid #f1f5f9;color:#16a34a;font-weight:900">+${C.PTS_SAME}</td><td style="padding:8px;border-bottom:1px solid #f1f5f9;color:#dc2626;font-weight:900">-${C.PTS_SAME}</td></tr>
                  <tr><td style="padding:8px;border-bottom:1px solid #f1f5f9">상위 티어 (+1)</td><td style="padding:8px;border-bottom:1px solid #f1f5f9;color:#16a34a;font-weight:900">+${C.PTS_UP}</td><td style="padding:8px;border-bottom:1px solid #f1f5f9;color:#dc2626;font-weight:900">-${C.PTS_UP}</td></tr>
                  <tr><td style="padding:8px">하위 티어 (-1)</td><td style="padding:8px;color:#16a34a;font-weight:900">+${C.PTS_DOWN}</td><td style="padding:8px;color:#dc2626;font-weight:900">-${C.PTS_DOWN}</td></tr>
                  `; })()}
                </tbody>
              </table>
            </div>
            <div style="font-size:var(--fs-caption);color:var(--gray-l);line-height:1.55">
              ※ 제로섬(Zero-sum): 승자 +X / 패자 -X (경기 단위로 총점 보존)<br>
              ※ 2026-08-02 이후 등록된 경기는 “경기 당시 티어” 스냅샷으로 정확히 계산합니다. 그 이전 기록(스냅샷 없음)은 현재 티어로 대체 계산됩니다.
            </div>
          </div>

          <div style="display:flex;flex-direction:column;gap:6px">
            <div style="font-weight:1000;color:var(--text2)">4) 승강급 기준</div>
            <div style="font-size:var(--fs-sm);color:var(--text3);line-height:1.6">
              ${(()=>{ const C=window.SS_CONST||{START:100,PROMO_THRESHOLD:130,DEMOTE_THRESHOLD:70}; return `시작점수 ${C.START}점. <b>${C.PROMO_THRESHOLD}점</b> 도달 시 <b>승급 검증</b>, <b>${C.DEMOTE_THRESHOLD}점 미만</b>이면 <b>강등 위기</b>.`; })()}
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
