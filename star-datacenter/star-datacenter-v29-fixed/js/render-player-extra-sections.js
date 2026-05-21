function _bindPlayerExtraDelegatedEvents(){
  if(window._playerExtraDelegatedBound) return;
  window._playerExtraDelegatedBound = true;

  document.addEventListener('click', (e)=>{
    const el = e.target && e.target.closest ? e.target.closest('[data-px-action]') : null;
    if(!el) return;
    const action = el.getAttribute('data-px-action');
    if(action === 'open-player'){
      e.preventDefault();
      try{ cm('playerModal'); }catch(_){}
      const name = el.getAttribute('data-px-player') || '';
      setTimeout(()=>{
        if(typeof openPlayerModal === 'function') openPlayerModal(name);
      }, 80);
      return;
    }
    if(action === 'save-memo'){
      e.preventDefault();
      if(typeof savePlayerMemo === 'function') savePlayerMemo(el.getAttribute('data-px-player') || '');
      return;
    }
    if(action === 'delete-memo'){
      e.preventDefault();
      if(typeof savePlayerMemo === 'function') savePlayerMemo(el.getAttribute('data-px-player') || '', true);
    }
  });
}

function buildPlayerMapStatsHTML(modeHist){
  const mapStats = {};
  (modeHist||[]).forEach(h=>{
    if(!h.map || h.map==='-' || h.map==='') return;
    if(!mapStats[h.map]) mapStats[h.map]={w:0,l:0};
    if(h.result==='승') mapStats[h.map].w++;
    else mapStats[h.map].l++;
  });
  const mapList = Object.entries(mapStats)
    .filter(([,s])=>s.w+s.l>=2)
    .sort((a,b)=>(b[1].w+b[1].l)-(a[1].w+a[1].l))
    .slice(0,8);
  if(mapList.length<2) return '';
  const mapCards = mapList.map(([mapName,s])=>{
    const t=s.w+s.l;
    const wr=Math.round(s.w/t*100);
    const barCol = wr>=60?'#16a34a':wr>=40?'#f59e0b':'#dc2626';
    return `<div style="background:var(--surface);border:1px solid var(--border);border-radius:8px;padding:8px 10px;min-width:80px;flex:1">
      <div style="font-size:10px;font-weight:700;color:var(--text2);margin-bottom:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${mapName}</div>
      <div style="height:4px;background:var(--border);border-radius:2px;margin-bottom:4px">
        <div style="height:4px;width:${wr}%;background:${barCol};border-radius:2px"></div>
      </div>
      <div style="display:flex;justify-content:space-between;font-size:10px">
        <span style="color:${barCol};font-weight:800">${wr}%</span>
        <span style="color:var(--gray-l)">${s.w}승${s.l}패</span>
      </div>
    </div>`;
  }).join('');
  return `<div style="background:var(--white);border:1.5px solid var(--border2);border-radius:14px;padding:14px 16px;margin-bottom:14px">
    <div style="font-weight:700;font-size:12px;color:var(--text2);margin-bottom:10px;display:flex;align-items:center;gap:6px">
      <span style="display:inline-block;width:3px;height:14px;background:#f59e0b;border-radius:2px"></span>
      맵별 승률
      <span style="font-size:10px;color:var(--gray-l);font-weight:400">(2게임 이상)</span>
    </div>
    <div style="display:flex;gap:6px;flex-wrap:wrap">${mapCards}</div>
  </div>`;
}

function buildPlayerTeammatesHTML(opts){
  const { player, col='' } = opts || {};
  const p = player;
  if(!p || !p.univ || p.univ==='무소속') return '';
  const teammates = players.filter(q=>q.univ===p.univ&&q.name!==p.name&&!q.retired);
  if(!teammates.length) return '';
  const tmSorted = [...teammates].sort((a,b)=>getRoleOrder(a.role)-getRoleOrder(b.role)||(b.points||0)-(a.points||0));
  const tmCards = tmSorted.map(q=>{
    const qCol=gc(q.univ);
    const qSafe=(typeof escJS==='function') ? escJS(q.name) : String(q.name||'').replace(/'/g,"\\'");
    const qPhoto=q.photo
      ?`<img src="${toHttpsUrl(q.photo)}" style="width:32px;height:32px;border-radius:var(--su_profile_radius,50%);object-fit:cover;flex-shrink:0;border:2px solid ${qCol}66" onerror="this.style.display='none'">`
      :`<div style="width:32px;height:32px;border-radius:var(--su_profile_radius,50%);background:${qCol};display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:900;color:#fff;flex-shrink:0">${q.name[0]}</div>`;
    return `<button data-px-action="open-player" data-px-player="${qSafe}" style="display:inline-flex;align-items:center;gap:6px;padding:5px 10px 5px 6px;border-radius:24px;border:1.5px solid ${qCol}44;background:${qCol}10;cursor:pointer;font-family:'Noto Sans KR',sans-serif;font-size:11px;font-weight:700;color:var(--text)">
      ${qPhoto}<span>${q.role?getRoleBadgeHTML(q.role,'9px')+' ':''} ${q.name}</span>${getTierBadge(q.tier)}
    </button>`;
  }).join('');
  return `<details style="background:var(--white);border:1.5px solid var(--border2);border-radius:14px;padding:14px 16px;margin-bottom:14px">
    <summary style="font-weight:700;font-size:12px;color:var(--text2);display:flex;align-items:center;gap:6px;cursor:pointer;list-style:none;user-select:none">
      <span style="display:inline-block;width:3px;height:14px;background:${col};border-radius:2px"></span>
      <span>${p.univ} 팀원 (${teammates.length}명)</span>
      <span style="margin-left:auto;font-size:11px;color:var(--gray-l)">펼치기 / 접기</span>
    </summary>
    <div style="display:flex;flex-wrap:wrap;gap:5px;margin-top:10px">${tmCards}</div>
  </details>`;
}

function buildPlayerMemoHTML(player){
  const p = player;
  if(!p) return '';
  const safeName=(typeof escJS==='function') ? escJS(p.name) : String(p.name||'').replace(/'/g,"\\'");
  return `<div style="background:var(--gold-bg);border:1px solid var(--gold-b);border-radius:12px;padding:14px 16px">
    <div style="font-weight:700;font-size:12px;color:var(--gold);margin-bottom:8px">📝 스트리머 메모</div>
    ${p.memo?`<div style="font-size:12px;color:var(--text2);margin-bottom:10px;line-height:1.7;white-space:pre-wrap">${p.memo}</div>`:'<div style="font-size:12px;color:var(--gray-l);margin-bottom:10px">메모 없음</div>'}
    <textarea id="player-memo-input" style="width:100%;min-height:60px;font-size:12px;border:1px solid var(--gold-b);border-radius:8px;padding:8px 10px;resize:vertical;font-family:'Noto Sans KR',sans-serif;background:var(--surface)" placeholder="스트리머 메모...">${p.memo||''}</textarea>
    <div style="display:flex;gap:6px;margin-top:8px">
      <button class="btn btn-b btn-sm" data-px-action="save-memo" data-px-player="${safeName}">💾 저장</button>
      ${p.memo?`<button class="btn btn-r btn-sm" data-px-action="delete-memo" data-px-player="${safeName}">🗑️ 삭제</button>`:''}
    </div>
  </div>`;
}

try{
  _bindPlayerExtraDelegatedEvents();
  window.buildPlayerMapStatsHTML = buildPlayerMapStatsHTML;
  window.buildPlayerTeammatesHTML = buildPlayerTeammatesHTML;
  window.buildPlayerMemoHTML = buildPlayerMemoHTML;
}catch(e){}
