function _rpPctToHex(v){
  return Math.max(0,Math.min(255,Math.round(v*2.55))).toString(16).padStart(2,'0');
}

function _playerOppSetSort(name, sortKey){
  const st = (typeof getPlayerDetailState==='function') ? getPlayerDetailState() : (window.PlayerDetailState||{});
  st.oppPage = 0;
  st.oppSort = sortKey;
  if(typeof window._rebuildPlayerDetail === 'function') window._rebuildPlayerDetail(name);
}

function _bindPlayerOppDelegatedEvents(){
  if(window._playerOppDelegatedBound) return;
  window._playerOppDelegatedBound = true;

  document.addEventListener('click', (e)=>{
    const el = e.target && e.target.closest ? e.target.closest('[data-po-action]') : null;
    if(!el || el.disabled) return;
    const action = el.getAttribute('data-po-action');
    const name = el.getAttribute('data-po-name') || '';

    if(action === 'opp-sort'){
      e.preventDefault();
      _playerOppSetSort(name, el.getAttribute('data-po-sort') || 'tot');
      return;
    }
    if(action === 'opp-page'){
      e.preventDefault();
      if(typeof window._goPlayerOppPage === 'function') window._goPlayerOppPage(Number(el.getAttribute('data-po-page') || 0), name);
      return;
    }
    if(action === 'opp-open-player'){
      e.preventDefault();
      try{ cm('playerModal'); }catch(_){}
      setTimeout(()=>{
        if(typeof openPlayerModal === 'function') openPlayerModal(el.getAttribute('data-po-player') || '');
      }, 100);
    }
  });

  document.addEventListener('mouseover', (e)=>{
    const el = e.target && e.target.closest ? e.target.closest('[data-po-hover-bg]') : null;
    if(!el) return;
    el.style.background = el.getAttribute('data-po-hover-bg') || '';
  });

  document.addEventListener('mouseout', (e)=>{
    const el = e.target && e.target.closest ? e.target.closest('[data-po-hover-bg]') : null;
    if(!el) return;
    el.style.background = '';
  });
}

function buildPlayerModeStatsHTML(opts){
  const {
    fixedModes=[],
    modeColors={},
    modeTint=0,
    cWin='#16a34a',
    cLoss='#dc2626'
  } = opts || {};
  let h=`<div class="su-sec" style="--su-sec-accent:#6b7280">
    <div class="su-sec__title">모드별 전적</div>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px">`;
  fixedModes.forEach(({key,w,l})=>{
    const t=w+l;
    const wr=t?Math.round(w/t*100):0;
    const mc=modeColors[key]||'#6b7280';
    const wrCol=t?(wr>=50?cWin:cLoss):'#9ca3af';
    // 낮은 채도 색(파랑/보라 등)이 흐려서 안 보이던 문제 방지용 최소 대비 보장
    const bgA=Math.max(modeTint,14);
    const bdA=Math.max(Math.min(99,modeTint*3.5),55);
    h+=`<div class="pd-mode-card" style="position:relative;background:${mc}${_rpPctToHex(bgA)};border:1.5px solid ${mc}${_rpPctToHex(bdA)};border-radius:12px;padding:10px 6px 8px;text-align:center;overflow:hidden;box-shadow:0 3px 10px ${mc}26;transition:transform .15s,box-shadow .15s">
      <div style="position:absolute;top:0;left:0;right:0;height:3px;background:${mc}"></div>
      <div style="font-size:10px;color:${mc};font-weight:900;margin-bottom:5px;letter-spacing:.2px">${key}</div>
      <div style="font-size:12px;font-weight:700;margin-bottom:2px"><span style="color:${cWin}">${w}승</span> <span style="color:${cLoss}">${l}패</span></div>
      <div style="font-size:13px;font-weight:900;color:${wrCol}">${t?wr+'%':'-'}</div>
    </div>`;
  });
  h+=`</div></div>`;
  return h;
}

function buildPlayerRaceStatsHTML(modeHist){
  const raceAgg={Z:{w:0,l:0},T:{w:0,l:0},P:{w:0,l:0}};
  (modeHist||[]).forEach(hh=>{
    const oppP=players.find(x=>x.name===hh.opp);
    const r=String(hh.oppRace||oppP?.race||'').toUpperCase();
    if(!raceAgg[r]) return;
    if(hh.result==='승') raceAgg[r].w++;
    else if(hh.result==='패') raceAgg[r].l++;
  });
  const raceBox=(r,label,barCol)=>{
    const w=raceAgg[r].w, l=raceAgg[r].l, t=w+l;
    const wr=t?Math.round(w/t*100):0;
    return `<div class="pd-race-card" style="flex:1;min-width:120px;border:1px solid var(--border);border-radius:10px;padding:10px 12px;background:var(--surface)">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:6px">
        <span style="font-weight:1000;font-size:12px;color:var(--text2)">${label}</span>
        <span style="font-size:10px;color:var(--gray-l);font-weight:900">${t}게임</span>
      </div>
      <div style="display:flex;align-items:baseline;gap:6px">
        <span style="font-weight:1000;font-size:14px;color:${t?(wr>=50?'#16a34a':'#dc2626'):'var(--gray-l)'}">${t?wr+'%':'-'}</span>
        <span style="font-size:11px;color:var(--gray-l)">승 ${w} · 패 ${l}</span>
      </div>
      <div style="height:6px;border-radius:999px;background:var(--bg2);overflow:hidden;margin-top:8px">
        <div style="height:100%;width:${t?wr:0}%;background:${barCol}"></div>
      </div>
    </div>`;
  };
  return `<div class="su-sec" style="--su-sec-accent:var(--blue)">
    <div class="su-sec__title">상대 종족별 전적</div>
    <div style="display:flex;gap:8px;flex-wrap:wrap">
      ${raceBox('Z','저그','#a855f7')}
      ${raceBox('T','테란','#3b82f6')}
      ${raceBox('P','프로토스','#f59e0b')}
    </div>
  </div>`;
}

function buildPlayerOppTableHTML(opts){
  const {
    opps={},
    pName='',
    oppSort='tot',
    oppPage=0
  } = opts || {};
  const oppList=Object.entries(opps);
  if(!oppList.length) return '';
  const safeName = (typeof escJS==='function') ? escJS(pName) : String(pName||'').replace(/'/g,"\\'");
  if(oppSort==='wr') oppList.sort((a,b)=>{const ta=a[1].w+a[1].l,tb=b[1].w+b[1].l;const wa=ta?a[1].w/ta:0,wb=tb?b[1].w/tb:0;return wb-wa;});
  else if(oppSort==='w') oppList.sort((a,b)=>b[1].w-a[1].w||a[1].l-b[1].l);
  else oppList.sort((a,b)=>(b[1].w+b[1].l)-(a[1].w+a[1].l));
  const oppPageSize=10;
  const oppTotalPages=Math.ceil(oppList.length/oppPageSize)||1;
  const oppCurPage=Math.max(0,Math.min(oppPage,oppTotalPages-1));
  const oppDisplay=oppList.slice(oppCurPage*oppPageSize,(oppCurPage+1)*oppPageSize);
  return `<div class="su-sec" style="--su-sec-accent:var(--blue)">
    <div class="su-sec__title-row">
      <div class="su-sec__title">상대 전적 <small>(${oppList.length}명)</small></div>
      <div class="su-sec__tools">
        <button data-po-action="opp-sort" data-po-name="${safeName}" data-po-sort="tot" style="padding:2px 8px;border-radius:8px;border:1px solid ${oppSort==='tot'?'var(--blue)':'var(--border2)'};background:${oppSort==='tot'?'var(--blue)':'var(--white)'};color:${oppSort==='tot'?'#fff':'var(--text3)'};font-size:10px;font-weight:700;cursor:pointer">다전순</button>
        <button data-po-action="opp-sort" data-po-name="${safeName}" data-po-sort="w" style="padding:2px 8px;border-radius:8px;border:1px solid ${oppSort==='w'?'var(--blue)':'var(--border2)'};background:${oppSort==='w'?'var(--blue)':'var(--white)'};color:${oppSort==='w'?'#fff':'var(--text3)'};font-size:10px;font-weight:700;cursor:pointer">승리순</button>
        <button data-po-action="opp-sort" data-po-name="${safeName}" data-po-sort="wr" style="padding:2px 8px;border-radius:8px;border:1px solid ${oppSort==='wr'?'var(--blue)':'var(--border2)'};background:${oppSort==='wr'?'var(--blue)':'var(--white)'};color:${oppSort==='wr'?'#fff':'var(--text3)'};font-size:10px;font-weight:700;cursor:pointer">승률순</button>
      </div>
    </div>
    <div style="border:1px solid var(--border);border-radius:10px;overflow:hidden">
      <table class="pd-opp-table" style="margin:0;border:none;border-radius:0">
        <thead><tr>
          <th style="text-align:left;padding:7px 12px">선수</th>
          <th style="text-align:center;width:40px">종족</th>
          <th style="text-align:center;width:80px">대학</th>
          <th style="text-align:center;width:36px">승</th>
          <th style="text-align:center;width:36px">패</th>
          <th style="text-align:center;width:52px">승률</th>
        </tr></thead>
        <tbody>
          ${oppDisplay.map(([opp,s])=>{
            const ot=s.w+s.l;
            const ow=ot?Math.round(s.w/ot*100):0;
            const op=players.find(x=>x.name===opp);
            const oc=gc(op?.univ||'');
            const oppSafe=(typeof escJS==='function') ? escJS(opp) : String(opp||'').replace(/'/g,"\\'");
            return `<tr style="cursor:pointer;transition:.1s" data-po-action="opp-open-player" data-po-player="${oppSafe}" data-po-hover-bg="${oc}12">
              <td style="padding:6px 12px">
                <div style="display:flex;align-items:center;gap:7px">
                  ${getPlayerPhotoHTML(opp,'36px')}
                  <span style="font-weight:700;font-size:13px">${opp}</span>
                </div>
              </td>
              <td style="text-align:center"><span class="rbadge r${s.race||op?.race||'?'}" style="font-size:10px">${s.race||op?.race||'?'}</span></td>
              <td style="text-align:center"><span style="background:${oc};color:#fff;padding:1px 7px;border-radius:4px;font-size:10px;font-weight:700;white-space:nowrap">${op?.univ||'-'}</span></td>
              <td style="text-align:center;font-weight:700;color:#16a34a">${s.w}</td>
              <td style="text-align:center;font-weight:700;color:#dc2626">${s.l}</td>
              <td style="text-align:center;font-weight:800;font-size:12px;color:${ot?(ow>=50?'#16a34a':'#dc2626'):'var(--gray-l)'}">${ot?ow+'%':'-'}</td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>
      ${oppTotalPages>1?`<div style="display:flex;align-items:center;justify-content:center;gap:8px;padding:8px 12px;background:var(--surface);border-top:1px solid var(--border)">
        <button class="btn btn-w btn-xs" ${oppCurPage===0?'disabled':''} data-po-action="opp-page" data-po-name="${safeName}" data-po-page="${oppCurPage-1}">◀ 이전</button>
        <span style="font-size:12px;color:var(--gray-l)">${oppCurPage+1} / ${oppTotalPages} 페이지</span>
        <button class="btn btn-w btn-xs" ${oppCurPage>=oppTotalPages-1?'disabled':''} data-po-action="opp-page" data-po-name="${safeName}" data-po-page="${oppCurPage+1}">다음 ▶</button>
      </div>`:''}
    </div>
  </div>`;
}

function buildPlayerVsUnivSectionHTML(opts){
  const {
    rows=[],
    playerName='',
    maxVisible=6
  } = opts || {};
  if(!Array.isArray(rows) || !rows.length) return '';
  const safeKey = String(playerName||'player').replace(/[^a-zA-Z0-9가-힣_-]/g,'_');
  const visible = rows.slice(0, maxVisible);
  const hidden = rows.slice(maxVisible);
  const card = (row)=>`
    <div class="pd-univ-card" style="border:1px solid rgba(148,163,184,.16);border-radius:12px;background:rgba(255,255,255,.88);padding:9px 10px;box-shadow:0 6px 14px rgba(15,23,42,.03)">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:6px">
        <span class="${row.univ&&row.univ!=='무소속'?'clickable-univ':''}" data-icon-done="1"
          ${row.univ&&row.univ!=='무소속'?`onclick="openUnivModal('${(typeof escJS==='function'?escJS(row.univ):String(row.univ).replace(/'/g,"\\'"))}')"`:''}
          style="background:#f8fafc;color:#0f172a;border:1px solid rgba(148,163,184,.28);font-size:10px;padding:3px 8px;border-radius:999px;font-weight:800;display:inline-flex;align-items:center;gap:4px;line-height:1.2;box-shadow:none${row.univ&&row.univ!=='무소속'?';cursor:pointer':''}">${gUI(row.univ,'11px')}${row.univ}</span>
        <span style="font-size:10px;color:var(--gray-l);font-weight:700">${row.tot?row.wr+'%':'-'}</span>
      </div>
      <div style="margin-top:7px;font-size:13px;font-weight:900;color:#0f172a">
        <span style="color:#16a34a">${row.w}승</span>
        <span style="color:var(--gray-l);margin:0 5px">/</span>
        <span style="color:#dc2626">${row.l}패</span>
      </div>
      <div style="margin-top:4px;font-size:11px;color:var(--gray-l);font-weight:700">${row.tot}전</div>
    </div>`;
  return `<div class="su-sec" style="--su-sec-accent:var(--blue)">
    <div class="su-sec__title">대학별 전적 <small>(${rows.length}개 대학 · 미니대전/대학대전/대회 기준)</small></div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:8px">
      ${visible.map(card).join('')}
    </div>
    ${hidden.length?`<div id="player-vs-univ-more-${safeKey}" style="display:none;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:8px;margin-top:8px">
      ${hidden.map(card).join('')}
    </div>
    <div style="display:flex;justify-content:center;margin-top:10px">
      <button type="button" class="btn btn-w btn-xs" onclick="const box=document.getElementById('player-vs-univ-more-${safeKey}'); const open=box&&box.style.display!=='none'; if(box) box.style.display=open?'none':'grid'; this.textContent=open?'+ ${hidden.length}개 더보기':'접기';">${`+ ${hidden.length}개 더보기`}</button>
    </div>`:''}
  </div>`;
}

try{
  _bindPlayerOppDelegatedEvents();
  window._playerOppSetSort = _playerOppSetSort;
  window.buildPlayerModeStatsHTML = buildPlayerModeStatsHTML;
  window.buildPlayerRaceStatsHTML = buildPlayerRaceStatsHTML;
  window.buildPlayerVsUnivSectionHTML = buildPlayerVsUnivSectionHTML;
  window.buildPlayerOppTableHTML = buildPlayerOppTableHTML;
}catch(e){}
