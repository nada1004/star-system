function onGlobalSearch(val){
  const drop = document.getElementById('globalSearchDrop');
  if(!val || val.trim()===''){drop.style.display='none';return;}
  const _players = Array.isArray(players) ? players : [];
  const q = val.trim().toLowerCase();
  // 다중 조건 파싱: "흑카 테란" → 이름에 "흑카" + 종족 "테란"
  const tokens = q.split(/\s+/).filter(Boolean);
  const RACE_MAP={'테란':'T','테':'T','t':'T','저그':'Z','저':'Z','z':'Z','프로토스':'P','프토':'P','프':'P','p':'P'};
  const GENDER_MAP={'여':'F','여자':'F','f':'F','남':'M','남자':'M','m':'M'};
  let raceFilter='', genderFilter='', univFilter='', tierFilter='', nameTokens=[];
  tokens.forEach(t=>{
    if(RACE_MAP[t]){raceFilter=RACE_MAP[t];}
    else if(GENDER_MAP[t]){genderFilter=GENDER_MAP[t];}
    else{nameTokens.push(t);}
  });
  const results = _players.filter(p=>{
    const nameMatch = nameTokens.length===0 || nameTokens.every(t=>
      p.name.toLowerCase().includes(t) ||
      (p.univ||'').toLowerCase().includes(t) ||
      (p.tier||'').toLowerCase().includes(t) ||
      (p.role||'').toLowerCase().includes(t) ||
      (p.memo||'').toLowerCase().includes(t)
    );
    const raceMatch = !raceFilter || p.race===raceFilter;
    const genderMatch = !genderFilter || p.gender===genderFilter;
    return nameMatch && raceMatch && genderMatch;
  }).slice(0,18);
  // 외부 대진기록(History > 외부탭)도 함께 검색
  let extResults = [];
  try{
    // history-core.js의 데이터는 관리자 탭에서 관리되지만, 검색은 read-only로 누구나 가능하게 처리(데이터가 없으면 0건)
    const items = (typeof _histExtGetViewItems==='function')
      ? (_histExtGetViewItems()||[])
      : (typeof _histExtLoad==='function' ? ((_histExtLoad()||{}).items||[]) : []);
    extResults = (items||[]).filter(it=>{
      const blob = `${it.source||''} ${it.date||''} ${it.winner||''} ${it.loser||''} ${it.map||''} ${it.elo||''} ${it.type||''} ${it.memo||''}`.toLowerCase();
      return nameTokens.length===0 ? blob.includes(q) : nameTokens.every(t=>blob.includes(t));
    }).slice(0,10);
  }catch(e){}

  if(results.length===0 && extResults.length===0){
    drop.innerHTML=`<div style="padding:16px;text-align:center;color:var(--gray-l);font-size:var(--fs-sm)">
      <div style="font-size:20px;margin-bottom:6px">🔍</div>
      검색 결과 없음<br>
      <span style="font-size:10px;color:var(--gray-l);margin-top:4px;display:block">이름 · 대학 · 티어 · 종족(테란/저그/프토) · 성별(남/여) 검색 가능</span>
    </div>`;
    drop.style.display='block';
    return;
  }
  const RACE_CFG={T:{bg:'#dbeafe',col:'#1e40af',label:'테란'},Z:{bg:'#ede9fe',col:'#5b21b6',label:'저그'},P:{bg:'#fef3c7',col:'#92400e',label:'프토'}};
  const TIER_CFG={'S':{bg:'#ede9fe',col:'#7c3aed'},'A':{bg:'#dbeafe',col:'#2563eb'},'B':{bg:'#dcfce7',col:'#16a34a'},'C':{bg:'#fef3c7',col:'#d97706'},'D':{bg:'#fee2e2',col:'#dc2626'}};
  // 검색어 하이라이트 헬퍼
  const hl=(str,q)=>{
    if(!str||!q)return str||'';
    const idx=str.toLowerCase().indexOf(q);
    if(idx<0)return str;
    return str.slice(0,idx)+`<mark style="background:#fef08a;color:inherit;border-radius:2px">`+str.slice(idx,idx+q.length)+`</mark>`+str.slice(idx+q.length);
  };
  const mainQ=nameTokens.join(' ');
  window._gsResults = results;
  window._gsExtResults = extResults;
  window._gsQuery = val.trim();
  let html = '';
  if(results.length){
    html += `<div style="padding:6px 12px 4px;font-size:10px;font-weight:700;color:var(--gray-l);letter-spacing:.5px;border-bottom:1px solid var(--border)">${results.length}명 검색됨</div>` +
    results.map((p,ri)=>{
    const col=gc(p.univ);
    const wr=p.win+p.loss===0?0:Math.round(p.win/(p.win+p.loss)*100);
    const rc=RACE_CFG[p.race]||{bg:'#f1f5f9',col:'#475569',label:p.race};
    return `<div data-gsidx="${ri}" style="padding:9px 14px;cursor:pointer;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px;transition:.1s"
      onmouseover="this.style.background='#f0f6ff'" onmouseout="this.style.background=''"
      onclick="(function(el){const idx=+el.dataset.gsidx;if(window._gsResults&&window._gsResults[idx]){globalSearchSelect(window._gsResults[idx].name);}else{openPlayerModal(el.dataset.name||'');}}).call(this,this)"
    >
      ${p.photo
        ?`<img src="${toHttpsUrl(p.photo)}" style="width:60px;height:60px;border-radius:8px;object-fit:cover;flex-shrink:0;border:2px solid ${col}" onerror="this.outerHTML='<div style=\\'width:60px;height:60px;border-radius:8px;background:${col};display:flex;align-items:center;justify-content:center;font-size:var(--fs-caption);font-weight:800;color:#fff;flex-shrink:0\\'>${rc.label}</div>'">`
        :`<div style="width:60px;height:60px;border-radius:8px;background:${col};display:flex;align-items:center;justify-content:center;font-size:var(--fs-caption);font-weight:800;color:#fff;flex-shrink:0;letter-spacing:.3px">${rc.label}</div>`
      }
      <div style="flex:1;min-width:0">
        <div style="font-weight:700;font-size:var(--fs-base)">${hl(p.name,mainQ)}${p.gender==='M'?'<span style="font-size:9px;background:#2563eb;color:#fff;padding:1px 4px;border-radius:4px;margin-left:4px">♂</span>':''}</div>
        <div style="font-size:var(--fs-caption);color:var(--gray-l);margin-top:1px"><span style="background:${(TIER_CFG[p.tier]||{bg:'#f1f5f9'}).bg};color:${(TIER_CFG[p.tier]||{col:'#475569'}).col};padding:1px 6px;border-radius:4px;font-size:10px;font-weight:800">${hl(p.tier,mainQ)}</span> · ${hl(p.univ,mainQ)}${p.role?` · <span style="color:var(--blue);font-size:10px;font-weight:600">${hl(p.role,mainQ)}</span>`:''} · <span style="background:${rc.bg};color:${rc.col};padding:0 4px;border-radius:3px;font-size:10px;font-weight:700">${rc.label}</span></div>
      </div>
      <div style="text-align:right;flex-shrink:0">
        <div style="font-weight:700;font-size:var(--fs-sm);color:${wr>=50?'#dc2626':'#94a3b8'}">${wr}%</div>
        <div style="font-size:10px;color:var(--gray-l)">${p.win}승${p.loss}패</div>
        ${p.points?`<div style="font-size:10px;color:var(--gold);font-weight:700">${p.points>0?'+':''}${p.points}pt</div>`:''}
      </div>
    </div>`;
    }).join('');
  }
  if(extResults.length){
    const sep = results.length ? `<div style="height:8px;background:var(--surface);border-top:1px solid var(--border);border-bottom:1px solid var(--border)"></div>` : '';
    html += sep;
    html += `<div style="padding:6px 12px 4px;font-size:10px;font-weight:900;color:var(--gray-l);letter-spacing:.5px;border-bottom:1px solid var(--border)">📎 외부 대진기록 ${extResults.length}건</div>` +
      extResults.map((it,ei)=>{
        const line = `${it.winner||''} vs ${it.loser||''}`;
        const sub  = `${it.date||''}${it.map?` · ${it.map}`:''}${it.source?` · ${it.source}`:''}`;
        return `<div data-gsextidx="${ei}" style="padding:9px 14px;cursor:pointer;border-bottom:1px solid var(--border);display:flex;gap:10px;align-items:center"
          onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background=''"
          onclick="(function(el){globalSearchSelectExt(+el.dataset.gsextidx);}).call(this,this)">
          <div style="flex:1;min-width:0">
            <div style="font-weight:800;font-size:var(--fs-sm);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${hl(line, mainQ||q)}</div>
            <div style="font-size:var(--fs-caption);color:var(--gray-l);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${hl(sub, mainQ||q)}</div>
          </div>
          <div style="flex-shrink:0;font-size:10px;color:var(--blue);font-weight:800">열기</div>
        </div>`;
      }).join('');
  }
  drop.innerHTML = html;
  drop.style.display='block';
}

function globalSearchSelect(name){
  document.getElementById('globalSearch').value='';
  document.getElementById('globalSearchDrop').style.display='none';
  window._gsResults = null;
  openPlayerModal(name);
}

function globalSearchSelectExt(idx){
  const it = window._gsExtResults && window._gsExtResults[idx];
  document.getElementById('globalSearch').value='';
  document.getElementById('globalSearchDrop').style.display='none';
  window._gsResults = null;
  if(!it) return;
  // (요청사항) 외부탭 접근은 관리자만 허용. 일반 사용자는 상세 팝업만 노출.
  const canOpenExtTab = (typeof isLoggedIn!=='undefined' && isLoggedIn) && !(typeof isSubAdmin!=='undefined' && isSubAdmin);
  if(canOpenExtTab){
    try{ curTab='hist'; histSub='ext'; }catch(e){}
    try{ if(typeof window.histExtSetKeyword==='function') window.histExtSetKeyword(window._gsQuery||''); }catch(e){}
    try{ render(); }catch(e){}
    return;
  }
  // read-only 상세 모달
  try{
    const old=document.getElementById('_gsExtModal'); if(old) old.remove();
    const modal=document.createElement('div');
    modal.id='_gsExtModal';
    modal.style.cssText='position:fixed;inset:0;background:#0008;z-index:99999;display:flex;align-items:center;justify-content:center;padding:16px;box-sizing:border-box';
    const line=`${it.winner||''} vs ${it.loser||''}`;
    const sub=`${it.date||''}${it.map?` · ${it.map}`:''}${it.elo?` · ELO ${it.elo}`:''}${it.type?` · ${it.type}`:''}`;
    const memo=(it.memo||'').trim();
    const src=(it.source||'').trim();
    modal.innerHTML=`<div style="background:var(--white);border-radius:16px;padding:18px 18px 14px;width:420px;max-width:95vw;box-shadow:0 8px 40px rgba(0,0,0,.3)">
      <div style="font-weight:1000;font-size:14px;margin-bottom:6px">📎 외부 대진기록</div>
      <div style="font-weight:900;font-size:var(--fs-base);color:var(--text);margin-bottom:4px">${line}</div>
      <div style="font-size:var(--fs-caption);color:var(--gray-l);line-height:1.6;margin-bottom:10px">${sub}${src?`<br>출처: ${src}`:''}</div>
      ${memo?`<div style="background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:10px;font-size:var(--fs-sm);line-height:1.7;margin-bottom:10px;white-space:pre-wrap">${memo.replace(/</g,'&lt;').replace(/>/g,'&gt;')}</div>`:''}
      <div style="display:flex;gap:8px">
        <button class="btn btn-w" style="flex:1" onclick="document.getElementById('_gsExtModal').remove()">닫기</button>
      </div>
      <div style="margin-top:8px;font-size:10px;color:var(--gray-l);text-align:center">※ 외부탭은 관리자만 접근 가능합니다</div>
    </div>`;
    modal.addEventListener('click',e=>{ if(e.target===modal) modal.remove(); });
    document.body.appendChild(modal);
  }catch(e){}
}

// Lazy 로더가 먼저 프록시를 등록하는 경로에서도 실제 구현을 전역에 확실히 연결한다.
try{
  window.onGlobalSearch = onGlobalSearch;
  window.globalSearchSelect = globalSearchSelect;
  window.globalSearchSelectExt = globalSearchSelectExt;
  window.rStats = rStats;
}catch(e){}

// 외부 클릭 시 드롭다운 닫기
document.addEventListener('click', e=>{
  if(!e.target.closest('#globalSearch') && !e.target.closest('#globalSearchDrop')){
    const d=document.getElementById('globalSearchDrop');
    if(d) d.style.display='none';
  }
});


/* ══════════════════════════════════════
   선수 vs 선수 비교
══════════════════════════════════════ */
var _vsSelA='', _vsSelB='';
function _vsSearchDrop(id, val){
  const d=document.getElementById(id);if(!d)return;
  d.querySelectorAll('.sitem').forEach(el=>{el.style.display=el.textContent.toLowerCase().includes(val.toLowerCase())?'':'none';});
}
function statsPlayerVsHTML(){
  const _players = Array.isArray(players) ? players : [];
  const pAll=_players.filter(p=>(p.history||[]).length>0).sort((a,b)=>a.name.localeCompare(b.name,'ko'));
  function selDropHTML(selId,dropId,inputId,selName){
    return`<div style="position:relative">
      <input id="${inputId}" type="text" value="${(typeof escAttr==='function')?escAttr(selName):escHTML(selName)}" placeholder="🔍 스트리머 검색..."
        class="stats-search-field"
        style="border-color:${selName?gc(statsP(selName)?.univ||''):'var(--border2)'}"
        oninput="_vsSearchDrop('${dropId}',this.value)"
        onfocus="document.getElementById('${dropId}').style.display='block'"
        onblur="setTimeout(()=>{const d=document.getElementById('${dropId}');if(d)d.style.display='none'},200)">
      <div id="${dropId}" class="stats-search-drop">
        ${pAll.map(p=>`<div class="sitem stats-search-item" onmousedown="${selId==='A'?'_vsSelA':'_vsSelB'}='${escJS(p.name)}';document.getElementById('${inputId}').value='${escJS(p.name)}';document.getElementById('${dropId}').style.display='none';render()">
          <b>${escHTML(p.name)}</b> <span style="color:${gc(p.univ)};font-size:var(--fs-caption)">${escHTML(p.univ)}</span> <span style="color:var(--gray-l);font-size:10px">${p.history.length}경기</span>
        </div>`).join('')}
      </div>
    </div>`;
  }

  const pA=statsP(_vsSelA);
  const pB=statsP(_vsSelB);
  const colA=pA?gc(pA.univ):'#2563eb';
  const colB=pB?gc(pB.univ):'#dc2626';

  // 직접 대결 기록
  let h2hAwin=0,h2hBwin=0;
  if(pA&&pB){
    statsNonProHist(pA).forEach(h=>{if(h.opp===_vsSelB){if(h.result==='승')h2hAwin++;else h2hBwin++;}});
  }
  const h2hTotal=h2hAwin+h2hBwin;

  // 개인 통계
  function getStats(p){
    if(!p)return null;
    const h=statsNonProHist(p);
    const w=h.filter(x=>x.result==='승').length;
    const l=h.filter(x=>x.result==='패').length;
    const tot=w+l;
    // 최근 5경기 폼
    const rec=[...h].sort((a,b)=>(b.date||'').localeCompare(a.date||'')).slice(0,5);
    // 현재 연속 (최신→과거 내림차순 정렬 후 첫 연속 구간)
    let streak=0,sType='';
    for(const x of [...h].sort((a,b)=>(String(b.date||'')).localeCompare(String(a.date||'')))){if(!sType||x.result===sType){streak++;sType=x.result;}else break;}
    // 종족 상성
    const rv={T:{w:0,l:0},Z:{w:0,l:0},P:{w:0,l:0}};
    h.forEach(x=>{if(x.oppRace&&rv[x.oppRace]){if(x.result==='승')rv[x.oppRace].w++;else rv[x.oppRace].l++;}});
    // 월별 추이 최근 6개월
    const now=new Date();
    const months=Array.from({length:6},(_,i)=>{
      const d=new Date(now);d.setMonth(d.getMonth()-5+i);
      return`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
    });
    const mStats=Object.fromEntries(months.map(ym=>[ym,{w:0,l:0}]));
    h.forEach(x=>{const ym=(x.date||'').slice(0,7);if(mStats[ym]){if(x.result==='승')mStats[ym].w++;else mStats[ym].l++;}});
    return{w,l,tot,rate:tot?Math.round(w/tot*100):0,elo:p.elo||1200,rec,streak,sType,rv,mStats,months};
  }
  const stA=getStats(pA), stB=getStats(pB);

  function formDots(rec){
    return(rec||[]).map(h=>`<span title="${h.date} vs ${h.opp}" style="display:inline-block;width:18px;height:18px;border-radius:50%;background:${h.result==='승'?'#dc2626':'#94a3b8'};color:#fff;font-size:9px;font-weight:900;text-align:center;line-height:18px">${h.result==='승'?'W':'L'}</span>`).join('');
  }
  function raceTbl(rv,race,col){
    const r=rv[race]||{w:0,l:0};const t=r.w+r.l;
    return`<td style="text-align:center;font-size:var(--fs-caption);font-weight:700;color:${t?col:'var(--gray-l)'}">${t?Math.round(r.w/t*100)+'%':'-'}<br><span style="font-weight:400;font-size:10px;color:var(--gray-l)">${r.w}W${r.l}L</span></td>`;
  }
  function statRow(label,valA,valB,higherIsBetter=true){
    const numA=parseFloat(valA),numB=parseFloat(valB);
    const aWins=!isNaN(numA)&&!isNaN(numB)&&(higherIsBetter?numA>numB:numA<numB);
    const bWins=!isNaN(numA)&&!isNaN(numB)&&(higherIsBetter?numB>numA:numB<numA);
    return`<tr>
      <td style="text-align:right;font-weight:${aWins?'800':'400'};color:${aWins?colA:'var(--text)'};">${valA}${aWins?` <span style="color:${colA}">◀</span>`:''}</td>
      <td style="text-align:center;font-size:var(--fs-caption);color:var(--gray-l);padding:4px 12px;white-space:nowrap">${label}</td>
      <td style="text-align:left;font-weight:${bWins?'800':'400'};color:${bWins?colB:'var(--text)'};">${bWins?`<span style="color:${colB}">▶</span> `:''} ${valB}</td>
    </tr>`;
  }

  const noSel=!pA&&!pB;
  return`<div class="stats-compare-shell">
  <div class="ssec">
    <div class="stats-chart-toolbar" style="margin-bottom:14px">
      <div>
        <h4 style="margin:0">⚔️ 스트리머 vs 스트리머 비교</h4>
        <div style="font-size:var(--fs-caption);color:var(--gray-l);margin-top:4px">직접 대결, 최근 폼, 종족 상성, 월별 흐름을 한 화면에서 비교합니다.</div>
      </div>
      ${pA&&pB?`<button onclick="_vsSelA='';_vsSelB='';render()" class="btn btn-w btn-xs no-export">초기화</button>`:''}
    </div>
    <div class="stats-compare-hero">
      <div class="stats-vs-card">
        ${getPlayerPhotoHTML(_vsSelA||'','44px',`border:2px solid ${colA};`)}
        ${selDropHTML('A','vs-drop-a','vs-inp-a',_vsSelA)}
        ${pA?`<span class="ubadge" style="background:${colA}">${pA.univ}</span>`:''}
      </div>
      <div class="stats-vs-mark">VS</div>
      <div class="stats-vs-card">
        ${getPlayerPhotoHTML(_vsSelB||'','44px',`border:2px solid ${colB};`)}
        ${selDropHTML('B','vs-drop-b','vs-inp-b',_vsSelB)}
        ${pB?`<span class="ubadge" style="background:${colB}">${pB.univ}</span>`:''}
      </div>
    </div>
    ${noSel?`<div class="stats-note-box">두 선수를 선택하면 비교 분석이 시작됩니다.</div>`:
    (!pA||!pB)?`<div class="stats-note-box">나머지 선수를 선택하세요.</div>`:`

    <!-- 직접 대결 -->
    <div class="stats-h2h-board">
      <div style="font-size:var(--fs-caption);font-weight:700;color:var(--text3);margin-bottom:8px">⚔️ 직접 대결 기록</div>
      ${h2hTotal===0?`<span style="color:var(--gray-l);font-size:var(--fs-sm)">직접 대결 기록 없음</span>`:`
      <div class="stats-h2h-score">
        <div style="text-align:center">
          <div style="font-size:28px;font-weight:900;color:${colA}">${h2hAwin}</div>
          <div style="font-size:var(--fs-caption);color:var(--gray-l)">${_vsSelA}</div>
        </div>
        <div style="font-size:var(--fs-base);color:var(--gray-l)">:&nbsp;</div>
        <div style="text-align:center">
          <div style="font-size:28px;font-weight:900;color:${colB}">${h2hBwin}</div>
          <div style="font-size:var(--fs-caption);color:var(--gray-l)">${_vsSelB}</div>
        </div>
      </div>
      <div style="margin-top:8px;height:8px;border-radius:4px;overflow:hidden;background:${colB};display:flex">
        <div style="width:${Math.round(h2hAwin/h2hTotal*100)}%;background:${colA};transition:width .4s"></div>
      </div>
      <div style="font-size:10px;color:var(--gray-l);margin-top:4px">총 ${h2hTotal}게임</div>`}
    </div>

    <!-- 스탯 비교표 -->
    <div class="stats-table-card" style="margin-bottom:14px"><div style="overflow-x:auto">
    <table class="stats-compare-table">
      <thead><tr>
        <th style="text-align:right;color:${colA};padding:6px 12px;font-size:var(--fs-base)">${_vsSelA}</th>
        <th style="text-align:center;color:var(--text3);font-size:var(--fs-caption);padding:4px 0">항목</th>
        <th style="text-align:left;color:${colB};padding:6px 12px;font-size:var(--fs-base)">${_vsSelB}</th>
      </tr></thead>
      <tbody>
        ${statRow('승률',stA.rate+'%',stB.rate+'%')}
        ${statRow('총 승',stA.w+'승',stB.w+'승')}
        ${statRow('총 경기',stA.tot+'경기',stB.tot+'경기')}
        ${statRow('ELO',stA.elo,stB.elo)}
        ${statRow('현재 연속',stA.streak+'연'+(stA.sType==='승'?'승':'패'),stB.streak+'연'+(stB.sType==='승'?'승':'패'),true)}
        ${statRow('티어',getTierLabel(pA.tier||'-'),getTierLabel(pB.tier||'-'),false)}
      </tbody>
    </table>
    </div></div>

    <!-- 최근 폼 -->
    <div class="stats-panel-grid" style="margin-bottom:14px">
      <div class="stats-surface-box">
        <div style="font-size:var(--fs-caption);font-weight:700;color:var(--text3);margin-bottom:6px">${_vsSelA} 최근 폼</div>
        <div style="display:flex;gap:4px;flex-wrap:wrap">${formDots(stA.rec)}</div>
      </div>
      <div class="stats-surface-box">
        <div style="font-size:var(--fs-caption);font-weight:700;color:var(--text3);margin-bottom:6px">${_vsSelB} 최근 폼</div>
        <div style="display:flex;gap:4px;flex-wrap:wrap">${formDots(stB.rec)}</div>
      </div>
    </div>

    <!-- 종족 상성 비교 -->
    <div class="stats-table-card" style="margin-bottom:14px"><div style="overflow-x:auto">
      <div style="font-size:var(--fs-caption);font-weight:700;color:var(--text3);margin-bottom:6px">🎭 종족 상성 (vs 상대 종족 승률)</div>
      <table class="stats-compare-table">
        <thead><tr><th>선수</th><th style="color:#3b82f6">vs 테란</th><th style="color:#7c3aed">vs 저그</th><th style="color:#d97706">vs 프로토스</th></tr></thead>
        <tbody>
          <tr><td style="font-weight:700;color:${colA}">${_vsSelA}</td>${raceTbl(stA.rv,'T',colA)}${raceTbl(stA.rv,'Z',colA)}${raceTbl(stA.rv,'P',colA)}</tr>
          <tr><td style="font-weight:700;color:${colB}">${_vsSelB}</td>${raceTbl(stB.rv,'T',colB)}${raceTbl(stB.rv,'Z',colB)}${raceTbl(stB.rv,'P',colB)}</tr>
        </tbody>
      </table>
    </div></div>

    <!-- 월별 승수 비교 -->
    <div class="stats-table-card"><div style="overflow-x:auto">
      <div style="font-size:var(--fs-caption);font-weight:700;color:var(--text3);margin-bottom:6px">📅 최근 6개월 월별 승수</div>
      <table class="stats-compare-table">
        <thead><tr><th>월</th>${stA.months.map(ym=>`<th style="font-size:10px">${ym.slice(5)}</th>`).join('')}</tr></thead>
        <tbody>
          <tr><td style="font-weight:700;color:${colA}">${_vsSelA}</td>${stA.months.map(ym=>{const s=stA.mStats[ym];return`<td style="text-align:center;font-weight:700;color:${s.w>0?colA:'var(--gray-l)'}">${s.w>0?s.w+'W':'-'}<br><span style="font-size:9px;color:var(--gray-l)">${(s.w+s.l)>0?Math.round(s.w/(s.w+s.l)*100)+'%':''}</span></td>`;}).join('')}</tr>
          <tr><td style="font-weight:700;color:${colB}">${_vsSelB}</td>${stB.months.map(ym=>{const s=stB.mStats[ym];return`<td style="text-align:center;font-weight:700;color:${s.w>0?colB:'var(--gray-l)'}">${s.w>0?s.w+'W':'-'}<br><span style="font-size:9px;color:var(--gray-l)">${(s.w+s.l)>0?Math.round(s.w/(s.w+s.l)*100)+'%':''}</span></td>`;}).join('')}</tr>
        </tbody>
      </table>
    </div></div>
    `}
  </div></div>`;
}

/* ══════════════════════════════════════
   📊 대학별 승률 비교 차트
══════════════════════════════════════ */
var _uwbSort='wr'; // 'wr'=승률순, 'total'=경기수순, 'name'=이름순
function statsUnivWinBarHTML(){
  return `<div id="uwb-wrap" class="stats-chart-shell">
    <div class="stats-chart-toolbar">
      <div>
        <div style="font-weight:800;font-size:var(--fs-base)">📊 대학별 개인 승률 비교</div>
        <div style="font-size:var(--fs-caption);color:var(--gray-l);margin-top:4px">(개인 미니/대학대전/CK/프로 합산)</div>
      </div>
      <select class="stats-select" onchange="_uwbSort=this.value;initUnivWinBarChart()" style="min-width:140px">
        <option value="wr"${_uwbSort==='wr'?' selected':''}>승률순</option>
        <option value="total"${_uwbSort==='total'?' selected':''}>경기수순</option>
        <option value="name"${_uwbSort==='name'?' selected':''}>이름순</option>
      </select>
    </div>
    <div class="stats-chart-board"><div class="stats-chart-wrap"><canvas id="uwbCanvas" style="width:100%;display:block"></canvas></div></div>
    <div id="uwbTrendList" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px;margin-top:12px"></div>
  </div>`;
}
function initUnivWinBarChart(){
  const canvas=document.getElementById('uwbCanvas');
  const trendList=document.getElementById('uwbTrendList');
  if(!canvas)return;
  // 데이터 수집
  const _li = (typeof isLoggedIn!=='undefined' ? !!isLoggedIn : false) || !!window.isLoggedIn;
  const _players = Array.isArray(players) ? players : [];
  const univs=getAllUnivs().filter(u=>((u.name!=='무소속'&&!u.hidden)||_li)).filter(u=>_players.some(p=>p.univ===u.name&&!p.retired));
  const data=univs.map(u=>{
    const mem=_players.filter(p=>p.univ===u.name&&!p.retired);
    const w=mem.reduce((s,p)=>s+(p.win||0),0);
    const l=mem.reduce((s,p)=>s+(p.loss||0),0);
    const tot=w+l;
    const wr=tot?Math.round(w/tot*100):0;
    return{name:u.name,col:gc(u.name),w,l,tot,wr};
  }).filter(d=>d.tot>0);
  if(!data.length){canvas.style.display='none';return;}
  // 정렬
  if(_uwbSort==='wr') data.sort((a,b)=>b.wr-a.wr);
  else if(_uwbSort==='total') data.sort((a,b)=>b.tot-a.tot);
  else data.sort((a,b)=>a.name.localeCompare(b.name,'ko'));

  const dpr=window.devicePixelRatio||1;
  const ROW_H=34, PAD_L=90, PAD_R=55, PAD_T=28, PAD_B=24;
  const W=canvas.parentElement.clientWidth||300;
  const H=PAD_T+data.length*ROW_H+PAD_B;
  canvas.width=W*dpr; canvas.height=H*dpr;
  canvas.style.width=W+'px'; canvas.style.height=H+'px';
  const ctx=canvas.getContext('2d');
  ctx.scale(dpr,dpr);
  // 배경
  const isDark=document.body.classList.contains('dark')||document.documentElement.getAttribute('data-theme')==='dark';
  const bgCol=isDark?'#1e293b':'#f8fafc';
  const textCol=isDark?'#e2e8f0':'#1e293b';
  const gridCol=isDark?'rgba(255,255,255,.08)':'rgba(0,0,0,.07)';
  ctx.fillStyle=bgCol; ctx.fillRect(0,0,W,H);
  // 헤더: %축
  const chartW=W-PAD_L-PAD_R;
  const pctTicks=[0,25,50,75,100];
  ctx.font=`bold ${10*1}px 'Noto Sans KR',sans-serif`;
  ctx.textAlign='center';
  ctx.fillStyle=isDark?'#94a3b8':'#64748b';
  pctTicks.forEach(t=>{
    const x=PAD_L+chartW*t/100;
    ctx.fillText(t+'%',x,PAD_T-8);
    ctx.beginPath(); ctx.strokeStyle=gridCol; ctx.lineWidth=1;
    ctx.moveTo(x,PAD_T); ctx.lineTo(x,H-PAD_B); ctx.stroke();
  });
  // 50% 기준선 강조
  const x50=PAD_L+chartW*0.5;
  ctx.beginPath(); ctx.strokeStyle=isDark?'rgba(255,255,255,.18)':'rgba(0,0,0,.15)'; ctx.lineWidth=1.5;
  ctx.setLineDash([4,3]); ctx.moveTo(x50,PAD_T); ctx.lineTo(x50,H-PAD_B); ctx.stroke(); ctx.setLineDash([]);

  data.forEach((d,i)=>{
    const y=PAD_T+i*ROW_H;
    const barH=20, barY=y+7;
    const barW=Math.max(2,chartW*d.wr/100);
    // 대학명
    ctx.font=`bold ${12}px 'Noto Sans KR',sans-serif`;
    ctx.textAlign='right'; ctx.fillStyle=textCol;
    ctx.fillText(d.name,PAD_L-6,barY+14);
    // 바 배경
    ctx.fillStyle=isDark?'rgba(255,255,255,.06)':'rgba(0,0,0,.05)';
    ctx.beginPath(); ctx.roundRect?ctx.roundRect(PAD_L,barY,chartW,barH,4):ctx.rect(PAD_L,barY,chartW,barH); ctx.fill();
    // 승률 바
    const hex=d.col;
    ctx.fillStyle=hex+'cc';
    ctx.beginPath(); ctx.roundRect?ctx.roundRect(PAD_L,barY,barW,barH,4):ctx.rect(PAD_L,barY,barW,barH); ctx.fill();
    // 테두리
    ctx.strokeStyle=hex; ctx.lineWidth=1.2;
    ctx.beginPath(); ctx.roundRect?ctx.roundRect(PAD_L,barY,barW,barH,4):ctx.rect(PAD_L,barY,barW,barH); ctx.stroke();
    // 수치 레이블
    ctx.font=`bold ${11}px 'Noto Sans KR',sans-serif`;
    ctx.textAlign='left'; ctx.fillStyle=textCol;
    ctx.fillText(`${d.wr}%  (${d.w}승 ${d.l}패)`,PAD_L+barW+5,barY+14);
  });

  if(trendList){
    const recentMap = {};
    const allMatches = statsFilterMatches([...(window.miniM||[]), ...(window.univM||[]), ...(window.ckM||[]), ...(window.comps||[]), ...(window.proM||[])])
      .sort((a,b)=>String(a?.d||a?.date||'').localeCompare(String(b?.d||b?.date||'')));
    allMatches.forEach(m=>{
      (m.sets||[]).forEach(set=>{
        (set.games||[]).forEach(g=>{
          const sides = _statsGameSides(g);
          if(!sides) return;
          sides.a.forEach(name => {
            const pA = statsP(name);
            const ua = String(pA?.univ||'').trim();
            if(ua){ if(!recentMap[ua]) recentMap[ua]=[]; recentMap[ua].push(sides.winner==='A'?1:0); }
          });
          sides.b.forEach(name => {
            const pB = statsP(name);
            const ub = String(pB?.univ||'').trim();
            if(ub){ if(!recentMap[ub]) recentMap[ub]=[]; recentMap[ub].push(sides.winner==='B'?1:0); }
          });
        });
      });
    });
    const sparkline = (arr, col)=>{
      const vals = (arr||[]).slice(-10);
      if(!vals.length) return `<div style="font-size:var(--fs-caption);color:var(--gray-l)">최근 10경기 데이터 없음</div>`;
      const W=140,H=34,P=4;
      const pts = vals.map((v,i)=>{
        const x = P + ((W-P*2) * (vals.length===1?0.5:i/(vals.length-1)));
        const y = H-P - (H-P*2) * v;
        return `${x},${y}`;
      }).join(' ');
      const dots = vals.map((v,i)=>{
        const x = P + ((W-P*2) * (vals.length===1?0.5:i/(vals.length-1)));
        const y = H-P - (H-P*2) * v;
        return `<circle cx="${x}" cy="${y}" r="2.5" fill="${v?col:'#94a3b8'}" />`;
      }).join('');
      return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" style="display:block">
        <line x1="${P}" y1="${H/2}" x2="${W-P}" y2="${H/2}" stroke="rgba(148,163,184,.45)" stroke-dasharray="3 3"/>
        <polyline fill="none" stroke="${col}" stroke-width="2.2" points="${pts}" />
        ${dots}
      </svg>`;
    };
    trendList.innerHTML = data.slice(0, Math.min(8, data.length)).map(d=>{
      const last = (recentMap[d.name]||[]).slice(-10);
      const streak = last.map(v=>v?'승':'패').join(' ');
      return `<div class="stats-surface-box">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:6px">
          <span style="font-size:var(--fs-base);font-weight:900;color:${d.col}">${d.name}</span>
          <span style="font-size:var(--fs-caption);color:var(--gray-l)">최근 ${Math.min(10,last.length)}경기</span>
        </div>
        ${sparkline(last, d.col)}
        <div style="display:flex;justify-content:space-between;gap:10px;margin-top:6px;font-size:var(--fs-caption)">
          <span style="color:var(--text3)">추세</span>
          <span style="font-weight:700;color:var(--text2)">${streak || '-'}</span>
        </div>
      </div>`;
    }).join('');
  }
}

/* ══════════════════════════════════════
   📅 경기 캘린더
══════════════════════════════════════ */
