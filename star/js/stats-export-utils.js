(function(){
  function statsCsvExportHTML(){
    if(!window.isLoggedIn)return`<div class="ssec"><div style="padding:40px;text-align:center;color:var(--gray-l)">🔒 관리자만 사용 가능합니다.</div></div>`;
    return`<div style="display:flex;flex-direction:column;gap:14px"><div class="ssec"><h4 style="margin-bottom:14px">📥 CSV / 데이터 내보내기</h4><div style="display:flex;flex-wrap:wrap;gap:10px">
      <div style="background:var(--white);border:1px solid var(--border);border-radius:12px;padding:18px;flex:1;min-width:220px"><div style="font-size:20px;margin-bottom:6px">👤</div><div style="font-weight:800;font-size:14px;margin-bottom:4px">선수 전적 CSV</div><div style="font-size:var(--fs-caption);color:var(--gray-l);margin-bottom:12px">이름, 대학, 티어, 종족, 승, 패, 승률, ELO, 포인트</div><button class="btn btn-b btn-sm" onclick="csvDownloadPlayers()">📥 다운로드</button></div>
      <div style="background:var(--white);border:1px solid var(--border);border-radius:12px;padding:18px;flex:1;min-width:220px"><div style="font-size:20px;margin-bottom:6px">📋</div><div style="font-weight:800;font-size:14px;margin-bottom:4px">경기 히스토리 CSV</div><div style="font-size:var(--fs-caption);color:var(--gray-l);margin-bottom:12px">날짜, 승자, 패자, 맵, ELO변화, 매치ID</div><button class="btn btn-b btn-sm" onclick="csvDownloadHistory()">📥 다운로드</button></div>
      <div style="background:var(--white);border:1px solid var(--border);border-radius:12px;padding:18px;flex:1;min-width:220px"><div style="font-size:20px;margin-bottom:6px">🏛️</div><div style="font-weight:800;font-size:14px;margin-bottom:4px">대학별 통계 CSV</div><div style="font-size:var(--fs-caption);color:var(--gray-l);margin-bottom:12px">대학, 총승, 총패, 승률, 선수수</div><button class="btn btn-b btn-sm" onclick="csvDownloadUniv()">📥 다운로드</button></div>
      <div style="background:var(--white);border:1px solid var(--border);border-radius:12px;padding:18px;flex:1;min-width:220px"><div style="font-size:20px;margin-bottom:6px">🗺️</div><div style="font-weight:800;font-size:14px;margin-bottom:4px">맵별 통계 CSV</div><div style="font-size:var(--fs-caption);color:var(--gray-l);margin-bottom:12px">맵, 총경기, 승횟수, 패횟수</div><button class="btn btn-b btn-sm" onclick="csvDownloadMaps()">📥 다운로드</button></div>
      <div style="background:var(--white);border:1px solid var(--border);border-radius:12px;padding:18px;flex:1;min-width:220px"><div style="font-size:20px;margin-bottom:6px">💾</div><div style="font-weight:800;font-size:14px;margin-bottom:4px">전체 백업 JSON</div><div style="font-size:var(--fs-caption);color:var(--gray-l);margin-bottom:12px">모든 데이터 JSON 백업 (기존 기능)</div><button class="btn btn-w btn-sm" onclick="doExport()">📤 JSON 백업</button></div>
    </div></div></div>`;
  }
  function _csvDownload(filename, rows){
    const BOM='\uFEFF';
    const csv=BOM+rows.map(r=>r.map(v=>{ const s=String(v??''); return s.includes(',')||s.includes('"')||s.includes('\n')?'"'+s.replace(/"/g,'""')+'"':s; }).join(',')).join('\n');
    const b=new Blob([csv],{type:'text/csv;charset=utf-8'}), url=URL.createObjectURL(b), a=document.createElement('a');
    a.href=url; a.download=filename; document.body.appendChild(a); a.click();
    setTimeout(()=>{document.body.removeChild(a);URL.revokeObjectURL(url);},100);
  }
  function csvDownloadPlayers(){
    const rows=[['이름','대학','티어','종족','성별','승(전체)','패(전체)','승률(전체)','ELO','포인트']];
    (window.players||[]).forEach(p=>{ const h=window.statsNonProHist(p); const w=h.filter(x=>x.result==='승').length, l=h.filter(x=>x.result==='패').length; const tot=w+l; rows.push([p.name,p.univ,p.tier||'-',p.race||'-',p.gender==='M'?'남':'여',p.win,p.loss,tot?Math.round(p.win/p.loss||0)+'%':'-',p.elo||1200,p.points||0]); });
    _csvDownload(`선수전적_${new Date().toISOString().slice(0,10)}.csv`, rows);
  }
  function csvDownloadHistory(){
    const rows=[['날짜','승자','승자대학','승자종족','패자','패자대학','패자종족','맵','ELO변화(승자)','매치ID']];
    (window.players||[]).forEach(p=>{ window.statsNonProHist(p).forEach(h=>{ if(h.result!=='승') return; const opp=window.statsP(h.opp); rows.push([h.date||'',p.name,p.univ,p.race||'-',h.opp,opp?.univ||'-',h.oppRace||'-',h.map||'-',h.eloDelta!=null?h.eloDelta:'',h.matchId||'']); }); });
    rows.sort((a,b)=>(a[0]||'').localeCompare(b[0]||'')); _csvDownload(`경기히스토리_${new Date().toISOString().slice(0,10)}.csv`, rows);
  }
  function csvDownloadUniv(){
    const rows=[['대학','선수수','총승','총패','승률']];
    window.getAllUnivs().forEach(u=>{ const mems=(window.players||[]).filter(p=>p.univ===u.name); let w=0,l=0; mems.forEach(p=>{ const h=window.statsNonProHist(p); w+=h.filter(x=>x.result==='승').length; l+=h.filter(x=>x.result==='패').length; }); const rate=w+l?Math.round(w/(w+l)*100):0; rows.push([u.name,mems.length,w,l,rate+'%']); });
    _csvDownload(`대학별통계_${new Date().toISOString().slice(0,10)}.csv`, rows);
  }
  function csvDownloadMaps(){
    const mapStats={}; (window.players||[]).forEach(p=>window.statsNonProHist(p).forEach(h=>{ if(!h.map||h.map==='-') return; if(!mapStats[h.map]) mapStats[h.map]={w:0,l:0}; if(h.result==='승') mapStats[h.map].w++; else mapStats[h.map].l++; }));
    const rows=[['맵','총경기','승횟수','패횟수','승률']];
    Object.entries(mapStats).sort((a,b)=>(b[1].w+b[1].l)-(a[1].w+a[1].l)).forEach(([m,s])=>{ const tot=s.w+s.l; rows.push([m,tot,s.w,s.l,tot?Math.round(s.w/tot*100)+'%':'-']); });
    _csvDownload(`맵별통계_${new Date().toISOString().slice(0,10)}.csv`, rows);
  }
  window.statsCsvExportHTML = statsCsvExportHTML;
  window._csvDownload = _csvDownload;
  window.csvDownloadPlayers = csvDownloadPlayers;
  window.csvDownloadHistory = csvDownloadHistory;
  window.csvDownloadUniv = csvDownloadUniv;
  window.csvDownloadMaps = csvDownloadMaps;
})();
