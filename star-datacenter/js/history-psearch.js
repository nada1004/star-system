/* ══════════════════════════════════════════════════════════════
   대전기록 검색 - 선수 검색 HTML (history-search.js 에서 분리, 2026-07-30)
   ══════════════════════════════════════════════════════════════ */

/* ══════════════════════════════════════
   대전 기록 > 선수별 검색 탭
══════════════════════════════════════ */
function _histPSearchModeLabel(hh){
  const st=String(hh?._sourceType||'').trim();
  const mode=String(hh?.mode||'').trim();
  const round=String(hh?._stageRound||hh?._sourceRound||'').trim();
  if(st==='proTourGrp') return '프로리그대회 조별리그';
  if(st==='proTourStage') return round ? `프로리그대회 토너먼트(${round})` : '프로리그대회 토너먼트';
  if(st==='proTourGj') return '프로리그대회 끝장전';
  if(st==='tourGrp') return mode==='티어대회' ? '티어대회 조별리그' : '일반대회 조별리그';
  if(st==='tourBkt') return mode==='티어대회' ? '티어대회 토너먼트' : '일반대회 토너먼트';
  if(st==='tourNormal') return '일반대회 일반경기';
  if(mode==='대회(일반경기)') return '일반대회 일반경기';
  if(mode==='조별리그') return '일반대회 조별리그';
  if(mode==='대회') return '일반대회 토너먼트';
  return mode;
}

function _histPSearchModeColor(label){
  const s=String(label||'').trim();
  if(!s) return '#6b7280';
  if(s.indexOf('프로리그대회 조별리그')!==-1) return '#0f766e';
  if(s.indexOf('프로리그대회 토너먼트')!==-1) return '#0f766e';
  if(s.indexOf('프로리그대회 끝장전')!==-1) return '#7c3aed';
  if(s.indexOf('일반대회 조별리그')!==-1) return '#2563eb';
  if(s.indexOf('일반대회 토너먼트')!==-1) return '#7c3aed';
  if(s.indexOf('일반대회 일반경기')!==-1) return '#b45309';
  if(s.indexOf('티어대회 조별리그')!==-1 || s.indexOf('티어대회 토너먼트')!==-1 || s.indexOf('티어대회')!==-1) return '#f59e0b';
  if(s.indexOf('미니대전')!==-1) return '#2563eb';
  if(s.indexOf('시빌워')!==-1) return '#db2777';
  if(s.indexOf('대학대전')!==-1) return '#7c3aed';
  if(s.indexOf('대학CK')!==-1) return '#dc2626';
  if(s.indexOf('프로리그')!==-1) return '#0891b2';
  if(s.indexOf('끝장전')!==-1) return '#8b5cf6';
  if(s.indexOf('개인전')!==-1 || s.indexOf('개인')!==-1) return '#8b5cf6';
  return '#6b7280';
}

function _histPSearchOpponentMeta(hh,p){
  let opp=String(hh?.opp||'').trim();
  let oppP=opp ? players.find(x=>x.name===opp) : null;
  const st=String(hh?._sourceType||'').trim();
  const isTeamSource=(st==='tourNormal' || st==='tourGrp' || st==='tourBkt');
  let kind=(oppP || !isTeamSource) ? 'player' : (opp ? 'team' : 'player');
  if(!opp){
    const a=String(hh?._sourceTeamA||'').trim();
    const b=String(hh?._sourceTeamB||'').trim();
    if(hh?._sourceType==='proTourGrp' || hh?._sourceType==='proTourStage' || hh?._sourceType==='proTourGj'){
      opp = p?.name===a ? b : (p?.name===b ? a : '');
    }else{
      const pu=String(p?.univ||'').trim();
      opp = pu && pu===a ? b : (pu && pu===b ? a : '');
    }
    oppP = opp ? players.find(x=>x.name===opp) : null;
    if(!oppP && opp) kind='team';
  }
  return {
    text: opp || '-',
    clickable: !!oppP,
    race: String(hh?.oppRace||oppP?.race||'').trim(),
    color: oppP ? gc(oppP.univ) : (kind==='team' ? gc(opp||'') : '#6b7280'),
    kind
  };
}

function _histPSearchResultsHTML(q){
  if(!q){
    return`<div class="empty-state"><div class="empty-state-icon"></div><div class="empty-state-title">스트리머 이름을 입력하세요</div><div class="empty-state-desc">선수의 전체 경기 기록에서 검색합니다</div></div>`;
  }
  const ql=q.toLowerCase();
  const matched=players.filter(p=>p.name.toLowerCase().includes(ql));
  if(!matched.length){
    return`<div class="empty-state"><div class="empty-state-icon"></div><div class="empty-state-title">스트리머를 찾을 수 없습니다</div><div class="empty-state-desc">"${q}"와 일치하는 스트리머가 없습니다</div></div>`;
  }
  let h='';
  matched.forEach(p=>{
    const histSource = (typeof _tpHistAllForPlayer === 'function')
      ? _tpHistAllForPlayer(p)
      : (Array.isArray(p.history) ? p.history : []);
    const hist=(histSource||[]).slice().sort((a,b)=>(b.date||'').localeCompare(a.date||'')||(b.time||0)-(a.time||0));
    // 날짜 필터 적용
    const filteredHist=typeof passDateFilter==='function'?hist.filter(h=>passDateFilter(h.date||'')):hist;
    if(!filteredHist.length)return;
    const col=gc(p.univ)||'#6b7280';
    const wins=filteredHist.filter(hh=>hh.result==='승').length;
    const losses=filteredHist.length-wins;
    const wr=filteredHist.length?Math.round(wins/filteredHist.length*100):0;
    h+=`<div style="background:var(--surface);border:1px solid var(--border);border-radius:12px;overflow:hidden;margin-bottom:16px">
      <div style="padding:12px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px;cursor:pointer" onclick="openPlayerModal('${p.name.replace(/'/g,"\\'")}')">
        <span style="width:10px;height:10px;border-radius:50%;background:${col};display:inline-block;flex-shrink:0"></span>
        <span style="font-weight:800;font-size:var(--fs-md);color:var(--text)">${p.name}</span>
        <span style="font-size:var(--fs-sm);color:var(--gray-l)">${p.univ||''}</span>
        <span style="margin-left:auto;font-size:var(--fs-sm);font-weight:700;color:var(--text3)">${filteredHist.length}게임</span>
        <span style="font-size:var(--fs-sm);font-weight:700;color:#dc2626">${wins}승</span>
        <span style="font-size:var(--fs-sm);font-weight:700;color:#2563eb">${losses}패</span>
        <span style="font-size:var(--fs-sm);padding:2px 8px;border-radius:20px;background:${wr>=50?'#dcfce7':'#fee2e2'};color:${wr>=50?'#16a34a':'#dc2626'};font-weight:800">${wr}%</span>
      </div>
      <div style="overflow-x:auto">
        <table style="margin:0;border:none;border-radius:0;font-size:var(--fs-sm)"><thead><tr>
          <th style="white-space:nowrap">날짜</th><th>종류</th><th>결과</th><th>상대 선수/팀</th><th>종족</th><th>맵</th><th>ELO</th>
        </tr></thead><tbody>`;
    filteredHist.forEach(hh=>{
      const isWin=hh.result==='승';
      const modeLabel=_histPSearchModeLabel(hh);
      const mc=_histPSearchModeColor(modeLabel);
      const oppMeta=_histPSearchOpponentMeta(hh,p);
      const eloStr=hh.eloDelta!=null?`<span style="font-weight:700;font-size:var(--fs-caption);color:${hh.eloDelta>0?'#16a34a':'#dc2626'}">${hh.eloDelta>0?'+':''}${hh.eloDelta}</span>`:'-';
      const modeTitle=[modeLabel, hh._compName||''].filter(Boolean).join(' · ');
      const oppKindChip=oppMeta.kind==='team'
        ? `<span style="display:inline-flex;align-items:center;justify-content:center;min-width:26px;height:18px;padding:0 6px;border-radius:999px;background:${oppMeta.color}18;border:1px solid ${oppMeta.color}55;color:${oppMeta.color};font-size:10px;font-weight:900;line-height:1">팀</span>`
        : '';
      const oppCellInner=`<span style="display:inline-flex;align-items:center;gap:6px"><span style="width:10px;height:10px;border-radius:3px;background:${oppMeta.color};display:inline-block;flex-shrink:0"></span><span style="color:${oppMeta.clickable?'var(--blue)':'var(--text)'}">${oppMeta.text}</span>${oppKindChip}</span>`;
      h+=`<tr style="background:${isWin?'#fef2f2':'#eff6ff'}10">
        <td style="color:var(--text3);font-size:var(--fs-sm);font-weight:600;white-space:nowrap">${hh.date||''}</td>
        <td><span title="${modeTitle.replace(/"/g,'&quot;')}" style="background:${mc};color:#fff;padding:1px 5px;border-radius:4px;font-size:10px;font-weight:700;white-space:nowrap">${modeLabel||''}</span></td>
        <td>${isWin?`<span style="background:#fee2e2;color:#dc2626;border:1px solid #fecaca;font-size:10px;font-weight:800;padding:2px 7px;border-radius:20px">WIN</span>`:`<span style="background:#dbeafe;color:#2563eb;border:1px solid #bfdbfe;font-size:10px;font-weight:800;padding:2px 7px;border-radius:20px">LOSE</span>`}</td>
        <td title="${oppMeta.kind==='team'?'선수 정보가 없어 상대 팀명으로 표시 중':''}" style="font-weight:700;${oppMeta.clickable?'cursor:pointer':''}" ${oppMeta.clickable?`onclick="openPlayerModal('${oppMeta.text.replace(/'/g,"\\'")}')"`:''}>${oppCellInner}</td>
        <td>${oppMeta.race?`<span class="rbadge r${oppMeta.race}" style="font-size:10px">${oppMeta.race||''}</span>`:`<span style="color:var(--gray-l);font-size:var(--fs-caption)">-</span>`}</td>
        <td style="color:var(--gray-l);font-size:var(--fs-caption)">${hh.map&&hh.map!=='-'?hh.map:''}</td>
        <td>${eloStr}</td>
      </tr>`;
    });
    h+=`</tbody></table></div></div>`;
  });
  return h||`<div class="empty-state"><div class="empty-state-icon"></div><div class="empty-state-title">경기 기록이 없습니다</div></div>`;
}

function _psearchUpdate(val){
  window._histPSearchQ=val;
  const r=document.getElementById('hist-psearch-results');
  if(r) r.innerHTML=_histPSearchResultsHTML(val.trim());
}

function histPlayerSearchHTML(){
  const q=(window._histPSearchQ||'').trim();
  return`<div style="margin-bottom:12px">
    <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
      <input type="text" id="hist-psearch-input" placeholder="스트리머 이름 입력..." value="${q.replace(/"/g,'&quot;')}"
        oninput="_psearchUpdate(this.value)"
        style="flex:1;min-width:160px;max-width:280px;padding:7px 12px;border:1.5px solid var(--blue);border-radius:8px;font-size:var(--fs-base);font-weight:600;outline:none" autofocus>
      ${q?`<button onclick="window._histPSearchQ='';document.getElementById('hist-psearch-input').value='';document.getElementById('hist-psearch-results').innerHTML=_histPSearchResultsHTML('')" style="background:none;border:none;cursor:pointer;color:var(--gray-l);font-size:var(--fs-lg);line-height:1;padding:0 2px">✕</button>`:''}
    </div>
  </div>
  <div id="hist-psearch-results">${_histPSearchResultsHTML(q)}</div>`;
}

// tourneys에서 완료된 모든 경기를 flat하게 추출
