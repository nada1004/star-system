function statsMismatchHTML(){
  const proIds=statsProMatchIds();
  const allMatches=[];
  // proM을 제외한 배열만 처리
  const _mini = Array.isArray(window.miniM) ? window.miniM : [];
  const _univm = Array.isArray(window.univM) ? window.univM : [];
  const _ck = Array.isArray(window.ckM) ? window.ckM : [];
  const _comps = Array.isArray(window.comps) ? window.comps : [];
  statsFilterMatches([..._mini,..._univm,..._ck,..._comps]).forEach((m,_)=>{
    (m.sets||[]).forEach(set=>{
      (set.games||[]).forEach(g=>{
        if(!g.playerA||!g.playerB||!g.winner)return;
        const pA=statsP(g.playerA);
        const pB=statsP(g.playerB);
        if(!pA||!pB)return;
        const eA=pA.elo||ELO_DEFAULT,eB=pB.elo||ELO_DEFAULT;
        const diff=Math.abs(eA-eB);
        if(diff<100)return;
        const winner=g.winner==='A'?g.playerA:g.playerB;
        const underdog=(eA<eB?pA:pB);
        const upset=winner===underdog.name;
        allMatches.push({pA:g.playerA,pB:g.playerB,eA,eB,diff,winner,upset,date:m.d||''});
      });
    });
  });
  allMatches.sort((a,b)=>b.diff-a.diff);
  const upsets=allMatches.filter(m=>m.upset).slice(0,10);
  const bigDiff=allMatches.slice(0,20);
  function matchRow(m){
    const winner=statsP(m.winner);
    const loser=statsP(m.winner===m.pA?m.pB:m.pA);
    const wElo=winner?.elo||ELO_DEFAULT;const lElo=loser?.elo||ELO_DEFAULT;
    const wCol=gc(winner?.univ||'');const lCol=gc(loser?.univ||'');
    return`<div class="stats-list-item" style="flex-wrap:wrap">
      <span style="font-size:11px;color:var(--gray-l);min-width:68px">${m.date}</span>
      <span class="stats-inline-badge" style="background:var(--red);color:#fff;cursor:pointer" onclick="openPlayerModal('${escJS(m.winner)}')">${m.winner}</span>
      <span style="font-size:12px;font-weight:700;color:${wElo>=1300?'#7c3aed':wElo>=1200?'var(--green)':'var(--red)'}">${wElo}</span>
      <span style="color:var(--gray-l);font-size:11px">ELO차</span>
      <span class="stats-inline-badge" style="background:var(--red);color:#fff">${m.diff}↑</span>
      <span style="color:var(--gray-l);font-size:11px">vs</span>
      <span class="stats-inline-badge" style="background:var(--blue);color:#fff;cursor:pointer;opacity:.72" onclick="openPlayerModal('${escJS(m.winner===m.pA?m.pB:m.pA)}')">${m.winner===m.pA?m.pB:m.pA}</span>
      <span style="font-size:12px;font-weight:700;color:${lElo>=1300?'#7c3aed':lElo>=1200?'var(--green)':'var(--red)'}">${lElo}</span>
      ${m.upset?'<span class="stats-inline-badge" style="background:#7c3aed;color:#fff">🔥 이변!</span>':''}
    </div>`;
  }
  return`<div style="display:flex;flex-direction:column;gap:16px">
  <div class="ssec" id="stats-mismatch-top">
    <div class="stats-chart-toolbar" style="margin-bottom:12px">
      <div>
        <h4 style="margin:0">🔥 이변 TOP 10 <span style="font-size:11px;color:var(--gray-l);font-weight:400">(하위 ELO가 승리 · 프로리그 제외)</span></h4>
        <div style="font-size:11px;color:var(--gray-l);margin-top:4px">ELO 차이가 컸는데도 하위 ELO 선수가 승리한 경기만 모았습니다.</div>
      </div>
      <button class="btn-capture btn-xs no-export" onclick="captureSection('stats-mismatch-top','mismatch')">📷 이미지 저장</button>
    </div>
    <div class="stats-metric-grid" style="margin-bottom:12px">
      <div class="stats-metric-card"><div class="stats-metric-label">이변 경기</div><div class="stats-metric-value">${upsets.length}</div></div>
      <div class="stats-metric-card"><div class="stats-metric-label">격차 경기</div><div class="stats-metric-value">${bigDiff.length}</div><div class="stats-metric-sub">ELO 차 100 이상</div></div>
      <div class="stats-metric-card"><div class="stats-metric-label">최대 격차</div><div class="stats-metric-value">${bigDiff[0]?.diff||0}</div><div class="stats-metric-sub">현재 필터 기준</div></div>
    </div>
    ${upsets.length?`<div class="stats-list-stack">${upsets.map(matchRow).join('')}</div>`:'<p style="color:var(--gray-l)">이변 기록이 없습니다.</p>'}
  </div>
  <div class="ssec">
    <h4 style="margin-bottom:12px">⚡ ELO 격차 TOP 20 경기 <span style="font-size:11px;color:var(--gray-l);font-weight:400">(프로리그 제외)</span></h4>
    ${bigDiff.length?`<div class="stats-list-stack">${bigDiff.map(matchRow).join('')}</div>`:'<p style="color:var(--gray-l)">ELO 격차 100 이상 경기 없음</p>'}
  </div></div>`;
}

/* ══════════════════════════════════════
   8. 경기 결과 공유 카드 생성
══════════════════════════════════════ */
var _shareMode='player';
var _sharePlayerSearch='';
var _shareUnivSearch='';
var _shareMatchPage=0; // 경기 결과 페이지 인덱스
var SHARE_MATCH_PER_PAGE=5;
function statsShareCardHTML(){
  const _players = Array.isArray(players) ? players : [];
  const pList=_players.filter(p=>p.history&&p.history.length>0).sort((a,b)=>b.history.length-a.history.length);
  const uList=(typeof univCfg!=='undefined'&&univCfg.length)?univCfg.filter(u=>_players.some(p=>p.univ===u.name)):getAllUnivs().filter(u=>_players.some(p=>p.univ===u.name));
  const filteredP=_sharePlayerSearch
    ?pList.filter(p=>p.name.toLowerCase().includes(_sharePlayerSearch.toLowerCase())||p.univ.toLowerCase().includes(_sharePlayerSearch.toLowerCase()))
    :[];  // 검색하기 전에는 빈 배열 - 아무것도 표시 안 함
  // 모든 경기 최신순 (tourneys 대회 경기 포함)
  const tourMatchesForShare=typeof getTourneyMatches==="function"?getTourneyMatches():[];
  // (보강) 티어대회(tourneys.type==='tier') 공유 카드에서는 "대학 로고"를 숨김
  // getTourneyMatches()의 결과는 tn.type이 없어서 tnId로 역참조하여 플래그 주입
  try{
    const tnMap = new Map((tourneys||[]).map(tn=>[tn.id, tn]));
    tourMatchesForShare.forEach(m=>{
      const tn = tnMap.get(m._tnId);
      if(tn && tn.type==='tier'){
        m._matchType = 'tt';
        m._noUnivIcon = true;
      }
    });
  }catch(e){}
  const _mini = Array.isArray(window.miniM) ? window.miniM : [];
  const _univm = Array.isArray(window.univM) ? window.univM : [];
  const _ck = Array.isArray(window.ckM) ? window.ckM : [];
  const _comps = Array.isArray(window.comps) ? window.comps : [];
  const allMatches=statsFilterMatches([..._mini,..._univm,..._ck,..._comps,...tourMatchesForShare]).sort((a,b)=>(b.d||"").localeCompare(a.d||""));
  // 인덱스 일치/성능 위해 리스트를 전역에 보관
  try{ window._shareMatchList = allMatches; }catch(e){}
  const totalPages=Math.ceil(allMatches.length/SHARE_MATCH_PER_PAGE)||1;
  const safePage=Math.min(_shareMatchPage,totalPages-1);
  const pageMatches=allMatches.slice(safePage*SHARE_MATCH_PER_PAGE,(safePage+1)*SHARE_MATCH_PER_PAGE);

  return`<div class="ssec">
    <div class="stats-chart-toolbar" style="margin-bottom:16px">
      <div>
        <h4 style="margin:0;font-size:16px">🎴 공유 카드 생성</h4>
        <div style="font-size:11px;color:var(--gray-l);margin-top:4px">스트리머, 대학, 경기 결과를 카드로 빠르게 만들어 저장할 수 있습니다.</div>
      </div>
    </div>
    <!-- 모드 탭 -->
    <div class="fbar no-export" style="overflow-x:auto;flex-wrap:nowrap;-webkit-overflow-scrolling:touch;scrollbar-width:none;gap:4px;margin-bottom:16px">
      <button class="pill ${_shareMode==='player'?'on':''}" style="flex-shrink:0;white-space:nowrap" onclick="_shareMode='player';_sharePlayerSearch='';render()">👤 스트리머 카드</button>
      <button class="pill ${_shareMode==='univ'?'on':''}" style="flex-shrink:0;white-space:nowrap" onclick="_shareMode='univ';render()">🏛️ 대학 카드</button>
      <button class="pill ${_shareMode==='match'?'on':''}" style="flex-shrink:0;white-space:nowrap" onclick="_shareMode='match';window._shareMatchObj=null;render()">⚔️ 경기 결과</button>
    </div>

    ${_shareMode==='player'?`
    <div class="stats-chart-shell no-export" style="margin-bottom:12px">
      <input type="text" id="share-player-q" value="${(typeof escAttr==='function')?escAttr(_sharePlayerSearch):escHTML(_sharePlayerSearch)}"
        placeholder="🔍 스트리머 이름 또는 대학 이름 검색..."
        oninput="_sharePlayerSearch=this.value;renderShareCardFilterPlayers()"
        class="stats-search-field"
        style="width:100%;max-width:380px;border-color:var(--blue);box-sizing:border-box">
      <div id="share-player-list" class="stats-chip-pool" style="margin-top:8px;max-height:160px;overflow-y:auto;padding:2px">
        ${filteredP.length?filteredP.slice(0,50).map(p=>`
          <button onclick="renderShareCardByPlayer('${escJS(p.name)}')"
            class="stats-choice-chip"
            style="border-color:${gc(p.univ)};background:${gc(p.univ)}22"
            onmouseover="this.style.background='${gc(p.univ)}55'" onmouseout="this.style.background='${gc(p.univ)}22'">
            ${escHTML(p.name)} <span style="font-size:10px;opacity:.65">${escHTML(p.univ)}</span>
          </button>`).join('')
          :(_sharePlayerSearch?'<span style="color:var(--gray-l);font-size:12px;padding:8px">검색 결과 없음</span>'
          :'<span style="color:var(--gray-l);font-size:12px;padding:8px">이름 또는 대학명을 입력하세요</span>')}
      </div>
    </div>`
    :_shareMode==='univ'?`
    <div class="stats-chip-pool no-export" style="margin-bottom:14px">
      ${uList.map(u=>`
        <button onclick="renderShareCardByUniv('${escJS(u.name)}')"
          class="stats-choice-chip"
          style="background:${u.color};color:#fff;border:none;box-shadow:0 2px 8px ${u.color}55"
          onmouseover="this.style.transform='scale(1.06)'" onmouseout="this.style.transform='scale(1)'">
          ${escHTML(u.name)}
        </button>`).join('')||'<span style="color:var(--gray-l);font-size:12px">등록된 대학이 없습니다</span>'}
    </div>`
    :`
    <div style="margin-bottom:14px" class="no-export">
      <div class="stats-chart-toolbar" style="margin-bottom:8px">
        <div style="font-size:11px;font-weight:700;color:var(--text3)">⏱️ 최신순 경기 목록 (5개씩 표시)</div>
        <div style="display:flex;gap:4px;align-items:center">
          <button class="btn btn-w btn-xs" onclick="_shareMatchPage=Math.max(0,_shareMatchPage-1);render()" ${safePage===0?'disabled':''}>◀ 이전</button>
          <span style="font-size:11px;color:var(--gray-l);padding:0 6px">${safePage+1} / ${totalPages}</span>
          <button class="btn btn-w btn-xs" onclick="_shareMatchPage=Math.min(${totalPages-1},_shareMatchPage+1);render()" ${safePage>=totalPages-1?'disabled':''}>다음 ▶</button>
        </div>
      </div>
      <div class="stats-selection-list">
        ${pageMatches.length?pageMatches.map((m,pi)=>{
          const globalIdx=safePage*SHARE_MATCH_PER_PAGE+pi;
          const a=m.a||m.u||'A팀',b=m.b||'B팀';
          const ca=gc(a),cb=gc(b);
          const aWin=m.sa>m.sb;
          const isActive=window._shareMatchObj&&window._shareMatchObj===m;
          return`<button onclick="window._shareMatchObj=(window._shareMatchList||[])[${globalIdx}]||null;renderShareCardByMatchObj(window._shareMatchObj)"
            class="stats-selection-item"
            style="border-color:${isActive?'var(--blue)':'var(--border)'};background:${isActive?'var(--blue-l)':'transparent'}"
            onmouseover="this.style.background='var(--blue-l)'" onmouseout="this.style.background='${isActive?'var(--blue-l)':'transparent'}'">
            <span style="color:var(--text3);min-width:80px;font-size:12px;font-weight:600">${escHTML(m.d||'-')}</span>
            <span style="background:${ca};color:#fff;padding:2px 9px;border-radius:4px;font-weight:700;font-size:11px">${escHTML(a)}</span>
            <span style="font-weight:900;font-size:15px;color:${aWin?'var(--green)':'#aaa'}">${m.sa}</span>
            <span style="color:var(--gray-l)">:</span>
            <span style="font-weight:900;font-size:15px;color:${(!aWin&&m.sb>m.sa)?'var(--green)':'#aaa'}">${m.sb}</span>
            <span style="background:${cb};color:#fff;padding:2px 9px;border-radius:4px;font-weight:700;font-size:11px">${escHTML(b)}</span>
            ${m.n?`<span style="color:var(--gold);font-size:10px;font-weight:600">🎖️${escHTML(m.n)}</span>`:''}
          </button>`;
        }).join(''):'<span style="color:var(--gray-l);padding:12px;font-size:12px;display:block">경기 기록이 없습니다</span>'}
      </div>
      <div style="font-size:10px;color:var(--gray-l);text-align:right;margin-top:4px">전체 ${allMatches.length}경기</div>
    </div>`}

    <!-- 카드 미리보기 -->
    <div id="sharecard-preview-wrap" class="sharecard-preview-wrap">
      <div class="sharecard-preview-tip">💡 카드를 클릭하면 사라집니다</div>
      <div id="share-card" class="share-card-host stats-preview-frame" title="클릭하여 카드 초기화" onclick="resetShareCard(this)">
        <p style="text-align:center;color:var(--gray-l);padding:36px 20px;font-size:13px">위에서 선택하면 카드가 생성됩니다</p>
      </div>
      <div class="sharecard-modal-actions sharecard-modal-actions--left" style="justify-content:flex-start;margin-top:10px">
        <button class="btn btn-p btn-sm" onclick="downloadShareCardJpg()">📷 이미지 저장</button>
      </div>
    </div>
  </div>`;
}
// 이전 코드 호환용
function renderShareCardFilterPlayers(){
  const q=(document.getElementById('share-player-q')||{}).value||'';
  _sharePlayerSearch=q;
  const _players = Array.isArray(players) ? players : [];
  const pList=_players.filter(p=>p.history&&p.history.length>0).sort((a,b)=>b.history.length-a.history.length);
  const filtered=q?pList.filter(p=>p.name.toLowerCase().includes(q.toLowerCase())||p.univ.toLowerCase().includes(q.toLowerCase())):[];
  const list=document.getElementById('share-player-list');
  if(!list)return;
  if(!q){
    list.innerHTML='<span style="color:var(--gray-l);font-size:12px;padding:8px">이름 또는 대학명을 입력하세요</span>';
    return;
  }
  list.innerHTML=filtered.length?filtered.slice(0,50).map(p=>`
    <button onclick="renderShareCardByPlayer('${escJS(p.name)}')"
      class="stats-choice-chip"
      style="border-color:${gc(p.univ)};background:${gc(p.univ)}22"
      onmouseover="this.style.background='${gc(p.univ)}55'" onmouseout="this.style.background='${gc(p.univ)}22'">
      ${escHTML(p.name)} <span style="font-size:10px;opacity:.65">${escHTML(p.univ)}</span>
    </button>`).join(''):'<span style="color:var(--gray-l);font-size:12px;padding:8px">검색 결과 없음</span>';
}
function renderShareCardDynamic(){renderShareCardFilterPlayers();}
// 선수/대학 공유카드 렌더 및 색상 helper는 `sharecard-render-entity.js`로 분리
function renderShareCardByMatchObj(m){
  const card=document.getElementById('share-card');if(!card)return;
  if(typeof window._renderShareMatchCardPipeline==='function'){
    window._renderShareMatchCardPipeline({
      card,
      matchObj:m,
      statsP,
      gc,
      getShareCardPrefs:_getShareCardPrefs,
      getFixedSideColors:(typeof getFixedSideColors==='function' ? getFixedSideColors : null),
      scMixHex:_scMixHex,
      toHttpsUrl,
      getPlayerPhotoHTML
    });
    return;
  }
  if(!m){card.innerHTML='<p style="color:var(--gray-l);padding:40px;text-align:center">경기를 선택하세요</p>';return;}
}


// 공유카드 런타임은 `sharecard-runtime.js`로 분리

/* ══════════════════════════════════════
   A. 활동량 히트맵
══════════════════════════════════════ */
if(typeof window._heatmapSelPlayer!=='string') window._heatmapSelPlayer='';
var statsHeatmapHTML = (typeof window.statsHeatmapHTML==='function')
  ? window.statsHeatmapHTML
  : (()=>'<div class="ssec"><div style="color:var(--gray-l);font-size:13px">히트맵을 불러오지 못했습니다.</div></div>');

/* ══════════════════════════════════════
   B. 티어별 승률 분석
══════════════════════════════════════ */
var _tierWinFilter={race:'',univ:'',gender:''};
var statsTierWinHTML = (typeof window.statsTierWinHTML==='function')
  ? window.statsTierWinHTML
  : (()=>'<div class="ssec"><div style="color:var(--gray-l);font-size:13px">티어별 승률 분석을 불러오지 못했습니다.</div></div>');

/* ══════════════════════════════════════
   C. 맵별 선수 특화 분석
══════════════════════════════════════ */
if(typeof window._mapRankSelMap!=='string') window._mapRankSelMap='';
var statsMapRankHTML = (typeof window.statsMapRankHTML==='function')
  ? window.statsMapRankHTML
  : (()=>'<div class="ssec"><div style="color:var(--gray-l);font-size:13px">맵별 특화 분석을 불러오지 못했습니다.</div></div>');

/* ══════════════════════════════════════
   D. 대학 간 상대전적 매트릭스
══════════════════════════════════════ */
var statsUnivMatrixHTML = (typeof window.statsUnivMatrixHTML==='function')
  ? window.statsUnivMatrixHTML
  : (()=>'<div class="ssec"><div style="color:var(--gray-l);font-size:13px">대학 매트릭스를 불러오지 못했습니다.</div></div>');

/* ══════════════════════════════════════
   E. 종족 픽률 트렌드
══════════════════════════════════════ */
if(typeof window._raceTrendMonths!=='number') window._raceTrendMonths=12;
var statsRaceTrendHTML = (typeof window.statsRaceTrendHTML==='function') ? window.statsRaceTrendHTML : (()=>'<div class="ssec"><div style="color:var(--gray-l)">종족 트렌드를 불러오지 못했습니다.</div></div>');
var initRaceTrendChart = (typeof window.initRaceTrendChart==='function') ? window.initRaceTrendChart : (()=>{});

/* ══════════════════════════════════════
   NEW-1. 킬러 선수 / 피해자 선수
══════════════════════════════════════ */
if(typeof window._killerSelPlayer!=='string') window._killerSelPlayer='';
var statsKillerHTML = (typeof window.statsKillerHTML==='function') ? window.statsKillerHTML : (()=>'<div class="ssec"><div style="color:var(--gray-l)">킬러 분석을 불러오지 못했습니다.</div></div>');

/* ══════════════════════════════════════
   NEW-2. 요일 / 시즌별 승률
══════════════════════════════════════ */
if(!window._seasonalFilter) window._seasonalFilter={gender:'',univ:'',race:''};
var statsSeasonalHTML = (typeof window.statsSeasonalHTML==='function') ? window.statsSeasonalHTML : (()=>'<div class="ssec"><div style="color:var(--gray-l)">요일/시즌 통계를 불러오지 못했습니다.</div></div>');

/* ══════════════════════════════════════
   NEW-3. 클러치 지수 (에이스전 승률)
══════════════════════════════════════ */
var statsClutchHTML = (typeof window.statsClutchHTML==='function') ? window.statsClutchHTML : (()=>'<div class="ssec"><div style="color:var(--gray-l)">클러치 지수를 불러오지 못했습니다.</div></div>');

/* ══════════════════════════════════════
   NEW-4. 역대 최장 연승/연패 기록 히스토리
══════════════════════════════════════ */
var statsStreakHistHTML = (typeof window.statsStreakHistHTML==='function') ? window.statsStreakHistHTML : (()=>'<div class="ssec"><div style="color:var(--gray-l)">연속 기록을 불러오지 못했습니다.</div></div>');

/* ══════════════════════════════════════
   NEW-5. 티어별 승률 (상대 티어 기준 매트릭스)
══════════════════════════════════════ */
var statsTierMatchHTML = (typeof window.statsTierMatchHTML==='function') ? window.statsTierMatchHTML : (()=>'<div class="ssec"><div style="color:var(--gray-l)">티어 매트릭스를 불러오지 못했습니다.</div></div>');

/* ══════════════════════════════════════
   NEW-6. 대학 간 상대전적 매트릭스 상세 (+ 선수별 드릴다운)
══════════════════════════════════════ */
if(!window._matrix2Sel) window._matrix2Sel={a:'',b:''};
var statsUnivMatrix2HTML = (typeof window.statsUnivMatrix2HTML==='function') ? window.statsUnivMatrix2HTML : (()=>'<div class="ssec"><div style="color:var(--gray-l)">대학 상세 매트릭스를 불러오지 못했습니다.</div></div>');

/* ══════════════════════════════════════
   F. CSV / 엑셀 내보내기
══════════════════════════════════════ */
var statsCsvExportHTML = (typeof window.statsCsvExportHTML==='function') ? window.statsCsvExportHTML : (()=>'<div class="ssec"><div style="color:var(--gray-l)">CSV 내보내기를 불러오지 못했습니다.</div></div>');

/* ══════════════════════════════════════
   9. 선수 검색 고급 필터
══════════════════════════════════════ */
/* ══════════════════════════════════════
   스트리머 검색
══════════════════════════════════════ */
var _psearchQ = '';
function _statsPlayerSearchRowHTML(p){
  const wr=(p.win+p.loss)?Math.round(p.win/(p.win+p.loss)*100):null;
  const safeName = (typeof escJS === 'function')
    ? escJS(p.name)
    : String(p.name||'').replace(/\\/g,'\\\\').replace(/'/g,"\\'").replace(/\r/g,'\\r').replace(/\n/g,'\\n');
  return`<div class="stats-result-card" onclick="openPlayerModal('${safeName}')">
    ${p.photo?`<img src="${toHttpsUrl(p.photo)}" style="width:38px;height:38px;border-radius:var(--su_profile_radius,50%);object-fit:cover;flex-shrink:0;border:2px solid var(--border)" onerror="this.style.display='none'">`:`<div style="width:38px;height:38px;border-radius:var(--su_profile_radius,50%);background:var(--border2);border:2px solid var(--border);flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:var(--gray-l)">${p.race||'?'}</div>`}
    <div style="flex:1;min-width:0">
      <div style="font-weight:800;font-size:14px">${escHTML(p.name)}${getStatusIconHTML(p.name)}</div>
      <div style="font-size:11px;color:var(--text3);margin-top:1px">${escHTML(p.univ||'무소속')} · ${escHTML(p.race||'?')}</div>
    </div>
    ${p.tier?`<div>${getTierBadge(p.tier)}</div>`:''}
    <div style="text-align:right;font-size:11px;color:var(--text3)">
      <div style="font-weight:700;color:${wr===null?'var(--gray-l)':wr>=50?'var(--red)':'var(--blue)'}">${wr===null?'-':wr+'%'}</div>
      <div>${p.win}승 ${p.loss}패</div>
    </div>
  </div>`;
}
function statsPlayerSearchHTML(){
  const q = _psearchQ.trim().toLowerCase();
  const _players = Array.isArray(players) ? players : [];
  const list = q
    ? _players.filter(p => p.name.toLowerCase().includes(q) || (p.univ||'').toLowerCase().includes(q) || (p.tier||'').toLowerCase().includes(q) ||
        (p.memo||'').split(/[\s,，\n]+/).some(m=>m.trim()&&m.trim().toLowerCase().includes(q)))
    : [];
  return `<div class="ssec">
    <div class="stats-chart-toolbar" style="margin-bottom:12px">
      <div>
        <h4 style="margin:0">🔍 스트리머 검색</h4>
        <div style="font-size:11px;color:var(--gray-l);margin-top:4px">이름, 대학, 티어, 메모 키워드로 빠르게 찾아서 바로 상세를 열 수 있습니다.</div>
      </div>
    </div>
    <div style="position:relative;max-width:400px;margin-bottom:14px">
      <input id="psearch-input" type="text" value="${(typeof escAttr==='function')?escAttr(_psearchQ):escHTML(_psearchQ)}"
        placeholder="🔍 스트리머 이름 / 대학 / 티어 검색..."
        oninput="_psearchQ=this.value;_statsPlayerSearchUpdate()"
        class="stats-search-field"
        style="width:100%;box-sizing:border-box;font-family:'Noto Sans KR',sans-serif"
        autofocus>
      ${_psearchQ?`<button onclick="_psearchQ='';render()" style="position:absolute;right:10px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:var(--gray-l);font-size:16px;line-height:1">✕</button>`:''}
    </div>
    <div id="psearch-results" class="stats-results-stack">
      ${q && !list.length ? `<div style="color:var(--gray-l);padding:20px;text-align:center">검색 결과가 없습니다</div>` : ''}
      ${list.map(_statsPlayerSearchRowHTML).join('')}
    </div>
    <div style="font-size:11px;color:var(--gray-l);margin-top:6px">
      💡 URL에 <code>?query=이름</code> 을 붙이면 바로 해당 스트리머 정보가 열립니다
    </div>
  </div>`;
}
function _statsPlayerSearchUpdate(){
  const q = _psearchQ.trim().toLowerCase();
  const _players = Array.isArray(players) ? players : [];
  const list = q
    ? _players.filter(p => p.name.toLowerCase().includes(q) || (p.univ||'').toLowerCase().includes(q) || (p.tier||'').toLowerCase().includes(q) ||
        (p.memo||'').split(/[\s,，\n]+/).some(m=>m.trim()&&m.trim().toLowerCase().includes(q)))
    : [];
  const res = document.getElementById('psearch-results');
  if(!res) return;
  res.innerHTML = (q && !list.length)
    ? `<div style="color:var(--gray-l);padding:20px;text-align:center">검색 결과가 없습니다</div>`
    : list.map(_statsPlayerSearchRowHTML).join('');
}

function _advFilterName(val){
  _advFilter.name=val;
  clearTimeout(window._advNameTimer);
  window._advNameTimer=setTimeout(()=>{
    const id='advsearch-name-input';
    const el=document.getElementById(id);
    const pos=el?el.selectionStart:null;
    render();
    const el2=document.getElementById(id);
    if(el2){el2.focus();if(pos!==null)try{el2.setSelectionRange(pos,pos);}catch(e){}}
  },300);
}
var _advFilter={tier:'',race:'',univ:'',gender:'',minElo:'',maxElo:'',minGames:'',name:'',sort:'elo', shuffle: false};
function statsAdvSearchHTML(){
  const f=_advFilter;
  const univs=getAllUnivs();
  const _players = Array.isArray(players) ? players : [];
  let list=_players.slice().filter(p=>{
    if(f.name&&!p.name.includes(f.name))return false;
    if(f.tier&&p.tier!==f.tier)return false;
    if(f.race&&p.race!==f.race)return false;
    if(f.univ&&p.univ!==f.univ)return false;
    if(f.gender&&p.gender!==f.gender)return false;
    const elo=p.elo||1200;
    if(f.minElo&&elo<parseInt(f.minElo))return false;
    if(f.maxElo&&elo>parseInt(f.maxElo))return false;
    const tot=(p.history||[]).length;
    if(f.minGames&&tot<parseInt(f.minGames))return false;
    return true;
  });
  const proIds=statsProMatchIds();
  list=list.map(p=>{
    let w,l,tot;
    if(tierRankModeFilter==='전체'){
      const hh=statsNonProHist(p);
      w=hh.filter(x=>x.result==='승').length;l=hh.filter(x=>x.result==='패').length;
    } else if(tierRankModeFilter==='대회(조별리그)'){
      const mh=(p.history||[]).filter(x=>x.mode==='대회'||x.mode==='조별리그'||x.mode==='토너먼트');
      w=mh.filter(x=>x.result==='승').length;l=mh.filter(x=>x.result==='패').length;
    } else if(tierRankModeFilter==='대학CK'){
      const mh=(p.history||[]).filter(x=>x.mode==='대학CK');
      w=mh.filter(x=>x.result==='승').length;l=mh.filter(x=>x.result==='패').length;
    } else {
      const mh=(p.history||[]).filter(x=>x.mode===tierRankModeFilter);
      w=mh.filter(x=>x.result==='승').length;l=mh.filter(x=>x.result==='패').length;
    }
    tot=w+l;
    return{...p,_w:w,_l:l,_tot:tot,_rate:tot?Math.round(w/tot*100):0,_elo:p.elo||1200};
  });
  if(f.sort==='elo') list.sort((a,b)=>b._elo-a._elo);
  else if(f.sort==='win') list.sort((a,b)=>b._w-a._w);
  else if(f.sort==='loss') list.sort((a,b)=>b._l-a._l);
  else if(f.sort==='rate') list.sort((a,b)=>b._rate-a._rate||b._tot-a._tot);
  else if(f.sort==='games') list.sort((a,b)=>b._tot-a._tot);
  else if(f.sort==='name') list.sort((a,b)=>a.name.localeCompare(b.name));
  else if(f.sort==='shuffle') list.sort(()=>Math.random()-0.5);
  return`<div style="display:flex;flex-direction:column;gap:14px">
  <div class="ssec" id="stats-advsearch-sec">
    <div class="stats-chart-toolbar" style="margin-bottom:12px">
      <div>
      <h4 style="margin:0">🔍 스트리머 고급 검색 필터</h4>
      <div style="font-size:11px;color:var(--gray-l);margin-top:4px">모드, 대학, 티어, 종족, 성별, ELO, 경기수까지 조합해서 세밀하게 찾습니다.</div>
      </div>
      <button class="btn-capture btn-xs no-export" onclick="captureSection('stats-advsearch-sec','advsearch')">📷 이미지 저장</button>
    </div>
    <div class="stats-chip-pool" style="margin-bottom:6px">
      ${['전체','미니대전','대학대전','대학CK','대회(조별리그)','프로리그'].map(m=>`<button onclick="tierRankModeFilter='${m}';render()" style="padding:5px 14px;border-radius:20px;border:2px solid ${tierRankModeFilter===m?'var(--blue)':'var(--border2)'};background:${tierRankModeFilter===m?'var(--blue)':'var(--white)'};color:${tierRankModeFilter===m?'#fff':'var(--text3)'};font-size:12px;font-weight:${tierRankModeFilter===m?'700':'500'};cursor:pointer;transition:.12s">${m}</button>`).join('')}
    </div>
    <div class="stats-chip-pool" style="margin-bottom:10px">
      ${[['미니대전','win','미니대전 승순','#7c3aed'],['미니대전','loss','미니대전 패순','#7c3aed'],['대학CK','win','대학CK 승순','#dc2626'],['대학CK','loss','대학CK 패순','#dc2626'],['대회(조별리그)','win','대회 승순','#d97706'],['대회(조별리그)','loss','대회 패순','#d97706']].map(([mode,sort,lbl,col])=>{
        const on=tierRankModeFilter===mode&&_advFilter.sort===sort;
        return`<button onclick="tierRankModeFilter='${mode}';_advFilter.sort='${sort}';render()" style="padding:3px 10px;border-radius:14px;border:1.5px solid ${on?col:'var(--border2)'};background:${on?col+'22':'var(--white)'};color:${on?col:'var(--text3)'};font-size:11px;font-weight:${on?'700':'500'};cursor:pointer;transition:.12s">${lbl}</button>`;
      }).join('')}
    </div>
    <div class="stats-filter-grid">
      <input id="advsearch-name-input" type="text" placeholder="🔍 스트리머 이름 검색..." value="${f.name}" oninput="_advFilterName(this.value)" class="stats-search-field" style="width:100%">
      <select onchange="_advFilter.univ=(function(v){try{var t=document.createElement('textarea');t.innerHTML=v;return t.value;}catch(e){return v;}})(this.value);render()" class="stats-select" style="min-width:0">
        <option value="">대학 전체</option>
        ${univs.map(u=>`<option value="${escHTML(u.name)}"${f.univ===u.name?' selected':''}>${escHTML(u.name)}</option>`).join('')}
      </select>
      <select onchange="_advFilter.tier=(function(v){try{var t=document.createElement('textarea');t.innerHTML=v;return t.value;}catch(e){return v;}})(this.value);render()" class="stats-select" style="min-width:0">
        <option value="">티어 전체</option>
        ${(((typeof TIERS!=='undefined' && Array.isArray(TIERS)) ? TIERS : (Array.isArray(window.TIERS) ? window.TIERS : []))).map(t=>`<option value="${escHTML(t)}"${f.tier===t?' selected':''}>${escHTML(getTierLabel(t))}</option>`).join('')}
      </select>
      <select onchange="_advFilter.race=this.value;render()" class="stats-select" style="min-width:0">
        <option value="">종족 전체</option>
        <option value="T"${f.race==='T'?' selected':''}>테란</option>
        <option value="Z"${f.race==='Z'?' selected':''}>저그</option>
        <option value="P"${f.race==='P'?' selected':''}>프로토스</option>
      </select>
      <select onchange="_advFilter.gender=this.value;render()" class="stats-select" style="min-width:0">
        <option value="">성별 전체</option>
        <option value="M"${f.gender==='M'?' selected':''}>남자</option>
        <option value="F"${f.gender==='F'?' selected':''}>여자</option>
      </select>
      <input type="number" placeholder="최소ELO" value="${f.minElo}" oninput="_advFilter.minElo=this.value;render()" class="stats-search-field" style="width:100%">
      <input type="number" placeholder="최대ELO" value="${f.maxElo}" oninput="_advFilter.maxElo=this.value;render()" class="stats-search-field" style="width:100%">
      <input type="number" placeholder="최소경기수" value="${f.minGames}" oninput="_advFilter.minGames=this.value;render()" class="stats-search-field" style="width:100%">
      <select onchange="_advFilter.sort=this.value;render()" class="stats-select" style="min-width:0">
        <option value="elo"${f.sort==='elo'?' selected':''}>ELO순</option>
        <option value="win"${f.sort==='win'?' selected':''}>승수순</option>
        <option value="loss"${f.sort==='loss'?' selected':''}>패수순</option>
        <option value="rate"${f.sort==='rate'?' selected':''}>승률순</option>
        <option value="games"${f.sort==='games'?' selected':''}>경기수순</option>
        <option value="name"${f.sort==='name'?' selected':''}>이름순</option>
        <option value="shuffle"${f.sort==='shuffle'?' selected':''}>무작위</option>
      </select>
      <button class="btn btn-w btn-sm" onclick="_advFilter={tier:'',race:'',univ:'',gender:'',minElo:'',maxElo:'',minGames:'',name:'',sort:'elo', shuffle: false};render()">🔄 초기화</button>
    </div>
    <div class="stats-metric-grid" style="margin-bottom:8px">
      <div class="stats-metric-card"><div class="stats-metric-label">검색 결과</div><div class="stats-metric-value">${list.length}</div><div class="stats-metric-sub">현재 조건 기준</div></div>
    </div>
    ${list.length===0?'<p style="color:var(--gray-l);padding:20px;text-align:center">조건에 맞는 스트리머가 없습니다.</p>':`
    <div class="stats-table-card"><div style="overflow-x:auto"><table class="stats-rank-table">
      <thead><tr><th>순위</th><th>이름</th><th>대학</th><th>티어</th><th>종족</th><th>성별</th><th>ELO</th><th>승</th><th>패</th><th>승률</th><th>경기수</th></tr></thead>
      <tbody>
        ${list.map((p,i)=>{
          const eloColor=p._elo>=1400?'#7c3aed':p._elo>=1300?'#d97706':p._elo>=1200?'var(--green)':'var(--red)';
          return`<tr class="${i<3?'stats-rank-top':''}" style="cursor:pointer" onclick="openPlayerModal('${escJS(p.name)}')">
            <td>${i+1}</td>
            <td style="font-weight:700;color:var(--blue)">${escHTML(p.name)}</td>
            <td><span class="ubadge" style="background:${gc(p.univ)}">${escHTML(p.univ)}</span></td>
            <td>${getTierLabel(p.tier||'-')}</td>
            <td><span class="rbadge r${p.race||'T'}">${p.race||'-'}</span></td>
            <td>${p.gender==='M'?'👨':'👩'}</td>
            <td style="font-weight:800;color:${eloColor}">${p._elo}</td>
            <td class="wt">${p._w}</td>
            <td class="lt">${p._l}</td>
            <td style="font-weight:700;color:${p._rate>=50?'var(--red)':'var(--blue)'}">${p._tot?p._rate+'%':'-'}</td>
            <td>${p._tot}</td>
          </tr>`;
        }).join('')}
      </tbody>
    </table></div></div>`}
  </div></div>`;
}



/* ══════════════════════════════════════
   🔍 전체 선수 검색
══════════════════════════════════════ */
