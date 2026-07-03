(function(){
  function statsUnivMatrixHTML(){
    const univs=window.getAllUnivs().filter(u=>(window.players||[]).some(p=>p.univ===u.name));
    if(univs.length<2) return`<div class="ssec"><p style="color:var(--gray-l);padding:40px;text-align:center">대학 데이터가 부족합니다.</p></div>`;
    const matrix={};
    univs.forEach(a=>{ matrix[a.name]={}; univs.forEach(b=>{ matrix[a.name][b.name]={w:0,l:0}; }); });
    (window.players||[]).forEach(p=>{
      window.statsNonProHist(p).forEach(h=>{
        const opp=window.statsP(h.opp);
        if(!opp||opp.univ===p.univ) return;
        if(!matrix[p.univ]||!matrix[p.univ][opp.univ]) return;
        if(h.result==='승') matrix[p.univ][opp.univ].w++;
        else matrix[p.univ][opp.univ].l++;
      });
    });
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
          ${univRank.map(u=>`<th style="padding:6px 8px;background:${window.gc(u.name)}22;border:1px solid var(--border);white-space:nowrap;min-width:72px">
            <div style="display:flex;flex-direction:column;align-items:center;gap:2px">
              <span style="background:${window.gc(u.name)};color:#fff;padding:2px 7px;border-radius:4px;font-size:11px;font-weight:700">${u.name}</span>
              <span style="font-size:10px;color:${u.rate>=50?'var(--red)':'var(--text3)'};font-weight:700">${u.rate}%</span>
            </div>
          </th>`).join('')}
          <th style="padding:6px 8px;background:var(--surface);border:1px solid var(--border);white-space:nowrap">총합</th>
        </tr></thead>
        <tbody>
          ${univRank.map(u=>`<tr>
            <td style="padding:6px 10px;background:${window.gc(u.name)}22;border:1px solid var(--border);font-weight:700;white-space:nowrap">
              <span style="background:${window.gc(u.name)};color:#fff;padding:2px 7px;border-radius:4px;font-size:11px">${u.name}</span>
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
              <div style="font-weight:800;font-size:13px;color:${u.rate>=50?'#dc2626':'#94a3b8'}">${u.rate}%</div>
              <div style="font-size:10px;color:var(--gray-l)">${u.w}W${u.l}L</div>
            </td>
          </tr>`).join('')}
        </tbody>
      </table></div>
    </div>`;
  }

  window.statsUnivMatrixHTML = statsUnivMatrixHTML;
})();
