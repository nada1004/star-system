// board2-univ-views.js에서 분리됨 (현황판 대학 뷰(기본) + 종족/티어 대학 분포 모달) — 원본 라인 1-556
function _b2UnivView() {
  let univList = _b2VisUnivs().filter(u => u.name !== '무소속' && u.name);
  if (!univList.length) return `<div style="text-align:center;color:var(--text3);padding:40px">표시할 대학이 없습니다</div>`;
  // [FIX-UNIV-1] dissolved 대학 선수 제외 공통 필터
  const _dissSet = new Set((typeof univCfg !== 'undefined' ? univCfg : []).filter(u=>u.dissolved).map(u=>String(u.name||'').trim()));
  const _univNameSet = new Set(univList.map(u=>String(u&&u.name||'').trim()).filter(Boolean));
  const membersByUniv = {};
  const _allVis = [];
  (players||[]).forEach(p=>{
    const pu = String(p?.univ||'').trim();
    if(!_univNameSet.has(pu)) return;
    if(p.hidden || p.retired || p.hideFromBoard) return;
    if(_dissSet.has(pu)) return;
    _allVis.push(p);
    (membersByUniv[pu] || (membersByUniv[pu]=[])).push(p);
  });
  const _tierCts = {}; _allVis.forEach(p=>{ const t=p.tier||'?'; _tierCts[t]=(_tierCts[t]||0)+1; });
  // 이번주 활동 인원 계산
  const { fromN: _uvFromN, toN: _uvToN } = _b2ThisWeekRange();
  const _uvWeeklyStats = _b2WeeklyAggregate(
    _allVis,
    String(_uvFromN).replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3'),
    String(_uvToN).replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3')
  );
  const _uvWeekActive = _uvWeeklyStats.filter(s => s.total > 0).length;
  const _uvWeekG = _uvWeeklyStats.reduce((acc, s) => acc + s.total, 0);
  const _uvRaces={P:0,T:0,Z:0};
  _allVis.forEach(p=>{ const r=String(p.race||'').trim().toUpperCase(); if(r==='P'||r==='T'||r==='Z') _uvRaces[r]++; });
  const _uvTotal = _uvRaces.P + _uvRaces.T + _uvRaces.Z;
  const _uvRaceBar = _uvTotal > 0 ? ['T','P','Z'].map(r=>{
    const meta={T:{cls:'race-T',label:'테란'},P:{cls:'race-P',label:'프로토스'},Z:{cls:'race-Z',label:'저그'}}[r];
    if(!_uvRaces[r]) return '';
    const pct = Math.round(_uvRaces[r]/_uvTotal*100);
    return `<button type="button" class="b2-race-badge ${meta.cls}" title="${meta.label} ${pct}%" style="cursor:pointer" onclick="if(typeof openB2RaceTierModal==='function')openB2RaceTierModal('${r}')">${r}<span style="opacity:.75;font-size:10px;margin-left:6px">${pct}%</span></button>`;
  }).filter(Boolean).join('') : '';
  const _uvTierBtns = (Array.isArray(TIERS)?TIERS:[]).filter(t=>_tierCts[t]).map(t=>{
    const col = (typeof getTierBtnColor==='function') ? getTierBtnColor(t) : '#64748b';
    const txt = (typeof getTierBtnTextColor==='function') ? (getTierBtnTextColor(t)||'#fff') : '#fff';
    return `<button type="button" class="b2-tier-badge" title="${t}티어 ${_tierCts[t]}명" style="cursor:pointer;background:${col};color:${txt};border:1px solid ${col}55" onclick="if(typeof openB2TierUnivModal==='function')openB2TierUnivModal('${String(t).replace(/\\/g,'\\\\').replace(/'/g,"\\'")}')">${t}</button>`;
  }).join('');

  try{ window._b2LastAllVisPlayers = _allVis; }catch(e){}
  const _jumpChips = univList.map(u=>{
    const cnt = (membersByUniv[String(u.name||'').trim()]||[]).length;
    if (!cnt) return ''; // [FIX-8] 멤버 없는 대학은 바로가기 칩에서 제외
    const col = gc(u.name);
    const txtCol = _b2ContrastColor(col);
    const anchorId = 'b2-univ-anchor-'+u.name.replace(/[^a-zA-Z0-9가-힣]/g,'_');
    const safeName = (typeof window.escHTML==='function') ? window.escHTML(u.name) : String(u.name||'');
    return `<button class="b2-jump-chip" onclick="const el=document.getElementById('${anchorId}');if(el){el.scrollIntoView({behavior:'smooth',block:'start'});}" style="--chip-color:${col}40;border:1.5px solid ${col}bb;background:linear-gradient(135deg,${col}ee,${col}cc);color:${txtCol}"><span style="letter-spacing:-.01em">${safeName}</span></button>`;
  }).join('');
  const _viewMode = _b2GetUnivProfileViewMode();
  const _viewModes = [['default','기본',''],['poster','포스터',''],['glass','글래스','✨'],['table','테이블','📋']];
  const _viewBtn = _viewModes.map(([mode,label,ico]) =>
    `<button type="button" class="b2-seg-btn${_viewMode===mode?' on':''}" onclick="_b2SetUnivProfileViewMode('${mode}')">${ico?ico+' ':''}${label}</button>`
  ).join('');
  window._b2UnivModeItems = _viewModes.map(([mode,label,ico])=>({id:mode, label:(ico?ico+' ':'')+label, action:`_b2SetUnivProfileViewMode('${mode}')`, active:_viewMode===mode}));
  const _curUnivVm = _viewModes.find(([mode])=>mode===_viewMode) || _viewModes[0];
  const _univModeMobileTrigger = `<button type="button" class="mode-select-trigger mode-select-trigger--block" onclick="_toggleModePopover(this,'대학별 표시 모드',window._b2UnivModeItems)">
    <span class="mode-select-trigger-main"><span class="mode-select-trigger-label">${(_curUnivVm[2]?_curUnivVm[2]+' ':'')+_curUnivVm[1]}</span></span>
    <span class="mode-select-trigger-caret">▾</span>
  </button>`;
  const statsBar = `<div style="margin-bottom:12px">
    <button type="button" class="pill ${window._b2UnivStatsBarOpen?'on':''}" style="width:100%;justify-content:center;padding:10px" onclick="window._b2UnivStatsBarOpen=!window._b2UnivStatsBarOpen;render()">🔍 필터/보기 ${window._b2UnivStatsBarOpen?'▲':'▼'}</button>
    ${window._b2UnivStatsBarOpen?`<div class="b2-univ-statsbar-panel" style="margin-top:8px;padding:14px;border-radius:22px;border:1px solid rgba(148,163,184,.18);background:linear-gradient(180deg,rgba(255,255,255,.99),rgba(248,250,252,.96));box-shadow:0 16px 28px rgba(15,23,42,.05);display:flex;flex-direction:column;gap:8px">
      <div class="b2-race-tier-row b2-stats-subrow">
        <span class="b2-section-label">⚔️ 종족 비중</span>
        ${_uvRaceBar||`<span style="font-size:var(--fs-caption);font-weight:700;color:var(--gray-l)">집계 없음</span>`}
        ${_uvTierBtns?`<span class="b2-subrow-divider"></span><span class="b2-section-label">🏅 티어</span>${_uvTierBtns}`:''}
      </div>
      <div class="b2-jump-row b2-stats-subrow">
        <span class="b2-section-label">🏛️ 바로가기</span>
        ${_jumpChips}
      </div>
      <div class="b2-mode-row b2-stats-subrow b2-univ-mode-desktop">
        <span class="b2-section-label">🖼️ 모드</span>
        <div class="b2-seg-track">${_viewBtn}</div>
      </div>
      ${_univModeMobileTrigger}
    </div>`:''}
  </div>`;
  const _b2Cols = (typeof boardGridCols!=='undefined'&&boardGridCols===2) ? 'repeat(2,1fr)' : '1fr';
  let h = statsBar + `<style>.b2-bottom-img{max-width:130px;max-height:110px;object-fit:contain;}.b2-side-panel{float:right;width:230px;margin:0 0 6px 10px;border-radius:var(--r);padding:8px;box-sizing:border-box;}body.dark .b2-univ-statsbar-panel{background:linear-gradient(180deg,rgba(15,23,42,.72),rgba(15,23,42,.62))!important;border-color:#334155!important}@media(min-width:769px) and (max-width:1024px){.b2-univ-grid{grid-template-columns:1fr!important;}.b2-side-panel{width:180px;}}@media(max-width:900px){.b2-univ-grid{grid-template-columns:1fr!important;}}@media(max-width:640px){.b2-side-panel{display:none!important;}.b2-bottom-img{display:none!important;}.b2-univ-statsbar-grid{display:none!important;}}</style>`;
  h += `<div class="b2-univ-grid" style="display:grid;grid-template-columns:${_b2Cols};gap:12px;align-items:start">`;
  univList.forEach(u => {
    if (!u.name) {
      console.warn('[현황판] 대학 이름이 없는 데이터가 발견되었습니다:', u);
      return;
    }
    const members = membersByUniv[String(u.name||'').trim()] || [];
    const _anchorId = 'b2-univ-anchor-'+u.name.replace(/[^a-zA-Z0-9가-힣]/g,'_');
    h += `<div id="${_anchorId}" style="scroll-margin-top:56px">` + _b2UnivBlock(u.name, gc(u.name), members) + `</div>`;
  });
  h += `</div>`;
  return h;
}

try{
  if(!window.openB2RaceTierModal){
    window.openB2RaceTierModal = function(race){
      try{
        const list = Array.isArray(window._b2LastAllVisPlayers) ? window._b2LastAllVisPlayers : [];
        const rc = String(race||'').trim().toUpperCase();
        const label = rc==='P'?'프로토스':rc==='T'?'테란':rc==='Z'?'저그':'종족';
        const pool = list.filter(p=>String(p?.race||'').trim().toUpperCase()===rc);
        const tiers = (Array.isArray(window.TIERS) && window.TIERS.length) ? window.TIERS.slice() : ['S','A','B','C','D','E','F','?'];
        const counts = {};
        const univCounts = {};
        pool.forEach(p=>{
          const t=String(p?.tier||'?');
          const u=String(p?.univ||'무소속');
          counts[t]=(counts[t]||0)+1;
          univCounts[u]=(univCounts[u]||0)+1;
        });
        window._b2RaceTierState = window._b2RaceTierState || {};
        window._b2RaceTierState.race = rc;
        window._b2RaceTierState.tier = window._b2RaceTierState.tier || 'ALL';
        window._b2RaceTierState.univ = window._b2RaceTierState.univ || 'ALL';
        window._b2RaceTierState.list = pool;
        window._b2RaceTierState.counts = counts;
        window._b2RaceTierState.univCounts = univCounts;
        window._b2RaceTierState.tiers = tiers;
        window._b2RaceTierState.label = label;

        if(!document.getElementById('b2RaceTierStyle')){
          const st = document.createElement('style');
          st.id = 'b2RaceTierStyle';
          st.textContent = `
            #b2RaceTierOverlay{display:none;position:fixed;inset:0;z-index:6000;background:rgba(2,6,23,.42);backdrop-filter:blur(6px)}
            #b2RaceTierOverlay .su-modal{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:min(1120px,calc(100vw - 28px));height:min(820px,calc(100vh - 28px));background:linear-gradient(180deg,rgba(255,255,255,.985),rgba(248,250,252,.96));border:1px solid rgba(148,163,184,.18);border-radius:26px;box-shadow:0 30px 64px rgba(15,23,42,.22);display:flex;flex-direction:column;overflow:hidden}
            #b2RaceTierOverlay .su-modal-hd{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:14px 16px;border-bottom:1px solid rgba(148,163,184,.14);background:linear-gradient(135deg,rgba(239,246,255,.96),rgba(255,255,255,.92))}
            #b2RaceTierOverlay .su-modal-bd{padding:14px 14px 16px;overflow:auto;flex:1;min-height:0}
            #b2RaceTierOverlay .b2rt-title{font-size:16px;font-weight:1000;letter-spacing:-.02em;color:var(--text1)}
            #b2RaceTierOverlay .b2rt-sub{font-size:var(--fs-caption);font-weight:800;color:var(--text3)}
            #b2RaceTierOverlay .b2rt-summary{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin-top:10px}
            #b2RaceTierOverlay .b2rt-summarycard{padding:12px 13px;border-radius:18px;background:linear-gradient(180deg,rgba(255,255,255,.98),rgba(248,250,252,.94));border:1px solid rgba(148,163,184,.14);box-shadow:0 10px 24px rgba(15,23,42,.06)}
            #b2RaceTierOverlay .b2rt-summarylabel{font-size:10px;font-weight:900;letter-spacing:.08em;color:var(--text3);text-transform:uppercase}
            #b2RaceTierOverlay .b2rt-summaryvalue{margin-top:7px;font-size:20px;font-weight:1000;letter-spacing:-.03em;color:var(--text1)}
            #b2RaceTierOverlay .b2rt-summarymeta{margin-top:4px;font-size:var(--fs-caption);font-weight:800;color:var(--text3)}
            #b2RaceTierOverlay .b2rt-univbar{display:flex;flex-wrap:wrap;gap:8px;margin-top:10px}
            #b2RaceTierOverlay .b2rt-univbtn{display:inline-flex;align-items:center;gap:6px;padding:6px 10px;border-radius:999px;border:1px solid rgba(148,163,184,.16);background:rgba(248,250,252,.98);font-size:var(--fs-caption);font-weight:900;color:var(--text2);cursor:pointer}
            #b2RaceTierOverlay .b2rt-univbtn.on{border-color:rgba(37,99,235,.35);background:linear-gradient(180deg,rgba(239,246,255,.98),rgba(219,234,254,.92));color:#1d4ed8}
            #b2RaceTierOverlay .b2rt-groupgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:10px;margin-top:12px;margin-bottom:2px}
            #b2RaceTierOverlay .b2rt-groupcard{padding:12px 13px;border-radius:18px;background:linear-gradient(180deg,rgba(255,255,255,.99),rgba(248,250,252,.95));border:1px solid rgba(148,163,184,.14);box-shadow:0 10px 22px rgba(15,23,42,.06);cursor:pointer}
            #b2RaceTierOverlay .b2rt-grouphead{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:10px}
            #b2RaceTierOverlay .b2rt-groupname{font-size:var(--fs-base);font-weight:950;color:var(--text1);display:flex;align-items:center;gap:6px;min-width:0}
            #b2RaceTierOverlay .b2rt-groupcount{font-size:var(--fs-caption);font-weight:900;color:var(--text3);flex-shrink:0}
            #b2RaceTierOverlay .b2rt-groupavatars{display:flex;flex-wrap:wrap;gap:6px}
            #b2RaceTierOverlay .b2rt-av{width:44px;height:44px;border-radius:var(--r2);overflow:hidden;border:1px solid rgba(148,163,184,.16);background:linear-gradient(160deg,rgba(148,163,184,.26),rgba(15,23,42,.12));box-shadow:0 6px 14px rgba(15,23,42,.08);cursor:pointer;padding:0}
            #b2RaceTierOverlay .b2rt-av img{width:100%;height:100%;object-fit:cover;object-position:top center;display:block}
            #b2RaceTierOverlay .b2rt-av span{display:flex;align-items:center;justify-content:center;width:100%;height:100%;font-size:14px;font-weight:1000;color:rgba(255,255,255,.75)}
            #b2RaceTierOverlay .b2rt-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:12px;margin-top:12px}
            #b2RaceTierOverlay .b2rt-card{position:relative;border-radius:18px;overflow:hidden;aspect-ratio:0.78;background:#0b1120;border:1px solid rgba(255,255,255,.14);box-shadow:0 10px 22px rgba(15,23,42,.10);cursor:pointer}
            #b2RaceTierOverlay .b2rt-card img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:top center}
            #b2RaceTierOverlay .b2rt-topbadges{position:absolute;left:10px;right:10px;top:10px;display:flex;align-items:center;justify-content:space-between;gap:8px;z-index:2}
            #b2RaceTierOverlay .b2rt-pill{display:inline-flex;align-items:center;gap:4px;padding:5px 9px;border-radius:999px;background:rgba(15,23,42,.72);border:1px solid rgba(255,255,255,.28);backdrop-filter:blur(10px);font-size:var(--fs-caption);font-weight:900;color:#fff}
            #b2RaceTierOverlay .b2rt-fb{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:26px;font-weight:1000;color:rgba(255,255,255,.85);background:linear-gradient(160deg,rgba(71,85,105,.55),rgba(15,23,42,.42))}
            #b2RaceTierOverlay .b2rt-bottom{position:absolute;left:0;right:0;bottom:0;padding:10px 10px 12px;display:flex;flex-direction:column;gap:4px}
            #b2RaceTierOverlay .b2rt-bottom::before{content:'';position:absolute;left:0;right:0;bottom:0;height:78%;background:linear-gradient(180deg,rgba(15,23,42,0) 0%,rgba(15,23,42,.40) 24%,rgba(4,7,18,.92) 100%);pointer-events:none}
            #b2RaceTierOverlay .b2rt-bottom>*{position:relative;z-index:1}
            #b2RaceTierOverlay .b2rt-name{font-size:var(--fs-base);font-weight:950;color:#fff;letter-spacing:-.02em;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-shadow:0 2px 8px rgba(0,0,0,.5)}
            #b2RaceTierOverlay .b2rt-meta{display:flex;align-items:center;gap:6px;font-size:var(--fs-caption);font-weight:850;color:rgba(255,255,255,.92);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-shadow:0 1px 5px rgba(0,0,0,.5)}
            #b2RaceTierOverlay .b2rt-ubadge{display:inline-flex;align-items:center;gap:4px;max-width:100%;padding:2px 8px;border-radius:999px;border:1px solid rgba(255,255,255,.3);font-size:10.5px;font-weight:900;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;backdrop-filter:blur(6px);background:rgba(15,23,42,.55)!important}
            @media (max-width:780px){#b2RaceTierOverlay .su-modal{height:min(860px,calc(100vh - 14px));width:min(100vw - 14px,1120px);border-radius:22px}#b2RaceTierOverlay .b2rt-summary{grid-template-columns:1fr}#b2RaceTierOverlay .b2rt-grid{grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px}#b2RaceTierOverlay .b2rt-groupgrid{grid-template-columns:1fr}}
            body.dark #b2RaceTierOverlay .su-modal{background:linear-gradient(180deg,rgba(15,23,42,.98),rgba(15,23,42,.96));border-color:#334155}
            body.dark #b2RaceTierOverlay .su-modal-hd{background:linear-gradient(135deg,rgba(30,58,95,.5),rgba(15,23,42,.9));border-bottom-color:#334155}
            body.dark #b2RaceTierOverlay .b2rt-summarycard,
            body.dark #b2RaceTierOverlay .b2rt-groupcard{background:rgba(15,23,42,.6);border-color:#334155}
            body.dark #b2RaceTierOverlay .b2rt-univbtn{background:rgba(15,23,42,.6);border-color:#334155}
            body.dark #b2RaceTierOverlay .b2rt-univbtn.on{background:linear-gradient(180deg,#1e3a5f,#1e293b);color:#93c5fd;border-color:rgba(96,165,250,.35)}
            body.dark #b2RaceTierOverlay .b2rt-av{background:linear-gradient(160deg,rgba(148,163,184,.16),rgba(15,23,42,.3))}
          `;
          document.head.appendChild(st);
        }

        let ov = document.getElementById('b2RaceTierOverlay');
        if(!ov){
          ov = document.createElement('div');
          ov.id = 'b2RaceTierOverlay';
          ov.innerHTML = `
            <div class="su-modal">
              <div class="su-modal-hd">
                <div style="min-width:0;display:flex;flex-direction:column;gap:2px">
                  <div class="b2rt-title" id="b2rtTitle"></div>
                  <div class="b2rt-sub" id="b2rtSub"></div>
                </div>
                <button type="button" class="btn btn-r btn-sm" id="b2rtClose">닫기</button>
              </div>
              <div class="su-modal-bd">
                <div class="b2rt-summary" id="b2rtSummary"></div>
                <div class="b2rt-univbar" id="b2rtUnivBar"></div>
                <div id="b2rtGroup"></div>
                <div class="b2rt-grid" id="b2rtGrid"></div>
              </div>
            </div>
          `;
          document.body.appendChild(ov);
          ov.addEventListener('click', (e)=>{
            try{
              if(e.target && e.target.id==='b2RaceTierOverlay') window.closeB2RaceTierModal();
            }catch(_){}
          });
          const btn = ov.querySelector('#b2rtClose');
          if(btn) btn.addEventListener('click', ()=>window.closeB2RaceTierModal());
          window.closeB2RaceTierModal = function(){
            const el = document.getElementById('b2RaceTierOverlay');
            if(el) el.style.display = 'none';
          };
        }

        window._b2RaceTierRender = function(){
          const st = window._b2RaceTierState || {};
          const ov2 = document.getElementById('b2RaceTierOverlay');
          if(!ov2) return;
          const title = ov2.querySelector('#b2rtTitle');
          const sub = ov2.querySelector('#b2rtSub');
          const summary = ov2.querySelector('#b2rtSummary');
          const bar = ov2.querySelector('#b2rtUnivBar');
          const group = ov2.querySelector('#b2rtGroup');
          const grid = ov2.querySelector('#b2rtGrid');
          if(title) title.textContent = `종족 비중 · ${st.label || ''}`;
          const filtered = (st.univ && st.univ!=='ALL') ? (st.list||[]).filter(p=>String(p?.univ||'무소속')===st.univ) : (st.list||[]);
          if(sub) sub.textContent = `${st.univ && st.univ!=='ALL' ? `${st.univ} · ` : ''}${filtered.length}명`;
          if(summary){
            const topTierEntry = Object.entries(st.counts||{}).sort((a,b)=>(b[1]-a[1]) || a[0].localeCompare(b[0]))[0];
            const univLen = Object.keys(st.univCounts||{}).length;
            summary.innerHTML = `
              <div class="b2rt-summarycard">
                <div class="b2rt-summarylabel">총 인원</div>
                <div class="b2rt-summaryvalue">${filtered.length}</div>
                <div class="b2rt-summarymeta">${st.univ && st.univ!=='ALL' ? '선택 대학 기준' : '전체 표시 기준'}</div>
              </div>
              <div class="b2rt-summarycard">
                <div class="b2rt-summarylabel">분포 대학</div>
                <div class="b2rt-summaryvalue">${st.univ && st.univ!=='ALL' ? '1' : univLen}</div>
                <div class="b2rt-summarymeta">${st.univ && st.univ!=='ALL' ? st.univ : '대학별 분포'}</div>
              </div>
              <div class="b2rt-summarycard">
                <div class="b2rt-summarylabel">핵심 티어</div>
                <div class="b2rt-summaryvalue">${topTierEntry ? topTierEntry[0] : '-'}</div>
                <div class="b2rt-summarymeta">${topTierEntry ? `${topTierEntry[1]}명` : '집계 대기'}</div>
              </div>`;
          }
          if(bar){
            const univs = ['ALL'].concat(Object.keys(st.univCounts||{}).sort((a,b)=>(st.univCounts[b]||0)-(st.univCounts[a]||0) || a.localeCompare(b)));
            bar.innerHTML = univs.map(u=>{
              const cnt = u==='ALL' ? (st.list||[]).length : (st.univCounts||{})[u] || 0;
              const on = (st.univ||'ALL')===u;
              const label2 = u==='ALL' ? `전체 (${cnt})` : `${u} (${cnt})`;
              return `<button type="button" class="b2rt-univbtn ${on?'on':''}" onclick="window._b2RaceTierSetUniv && window._b2RaceTierSetUniv('${String(u).replace(/'/g,'\\\'')}')">${label2}</button>`;
            }).join('');
          }
          if(group){
            if((st.univ||'ALL')==='ALL'){
              const groups = new Map();
              filtered.forEach(p=>{
                const u = String(p?.univ||'무소속');
                if(groups.has(u)) groups.get(u).push(p);
                else groups.set(u,[p]);
              });
              const ordered = Array.from(groups.entries()).sort((a,b)=>b[1].length-a[1].length || a[0].localeCompare(b[0]));
              group.innerHTML = `<div class="b2rt-groupgrid">${ordered.map(([univName, arr])=>{
                const col = (typeof gc==='function') ? (gc(univName)||'#64748b') : '#64748b';
                const logo = (univName && univName!=='무소속' && typeof gUI==='function') ? gUI(univName,(typeof getUnivLogoSizeStr==='function'?getUnivLogoSizeStr(univName,'players','16px'):'16px')) : '';
                return `<div class="b2rt-groupcard" onclick="window._b2RaceTierSetUniv && window._b2RaceTierSetUniv('${String(univName).replace(/'/g,"\\'")}')">
                  <div class="b2rt-grouphead">
                    <div class="b2rt-groupname" title="${String(univName).replace(/"/g,'&quot;')}"><span class="b2rt-pill" style="position:static;background:${col}22;border-color:${col}55;color:${col}">${logo}${univName}</span></div>
                    <div class="b2rt-groupcount">${arr.length}명</div>
                  </div>
                  <div class="b2rt-groupavatars">${arr.slice(0,8).map(p=>{
                    const name = String(p?.name||'');
                    const nameJs = name.replace(/\\/g,'\\\\').replace(/'/g,"\\'");
                    const photo = String(p?.photo||'').trim();
                    const _avSecondRaw = String(p?.secondProfileFile||'').trim();
                    const _avSecondIsVideo = /\.(mp4|webm|ogg|mov|m4v)(\?|$)/i.test(_avSecondRaw);
                    const avSecondPhoto = (_avSecondRaw && !_avSecondIsVideo) ? _avSecondRaw : '';
                    const avSecondHtml = avSecondPhoto
                      ? `<img class="b2-players-card-secondary" src="${toHttpsUrl(avSecondPhoto).replace(/\"/g,'&quot;')}" loading="eager" fetchpriority="high" decoding="async" alt="" onerror="this.remove()">`
                      : '';
                    const avHoverAttrs = avSecondPhoto ? ` onmousemove="_b2CardHoverScrub(event,this)" onmouseleave="_b2CardHoverLeave(this)"` : '';
                    return `<button type="button" class="b2rt-av" style="position:relative"${avHoverAttrs} onclick="event.stopPropagation();if(typeof openPlayerModal==='function')openPlayerModal('${nameJs}')" title="${name.replace(/"/g,'&quot;')}">${photo?`<img src="${toHttpsUrl(photo).replace(/\"/g,'&quot;')}" loading="eager" fetchpriority="high" decoding="async" onerror="this.parentNode.innerHTML='<span>${String(p?.race||'?')}</span>'">`:`<span>${String(p?.race||'?')}</span>`}${avSecondHtml}</button>`;
                  }).join('')}</div>
                </div>`;
              }).join('')}</div>`;
            } else {
              group.innerHTML = '';
            }
          }
          if(grid){
            grid.innerHTML = filtered.map(p=>{
              const name = String(p?.name||'');
              const univ = String(p?.univ||'무소속');
              const tier = String(p?.tier||'?');
              const photo = String(p?.photo||'').trim();
              const uCol = (typeof gc==='function' ? (gc(univ)||'#64748b') : '#64748b');
              const uLogo = (univ && univ!=='무소속' && typeof gUI==='function') ? gUI(univ,(typeof getUnivLogoSizeStr==='function'?getUnivLogoSizeStr(univ,'players','16px'):'16px')) : '';
              const nameJs = name.replace(/\\/g,'\\\\').replace(/'/g,"\\'");
              const img = photo ? `<img src="${toHttpsUrl(photo).replace(/\"/g,'&quot;')}" loading="eager" fetchpriority="high" decoding="async" onerror="this.style.display='none'">` : '';
              const fb = `<div class="b2rt-fb" style="display:${photo?'none':'flex'}">${String(p?.race||'?')}</div>`;
              // (버그픽스) 두번째 프로필 사진 호버 미리보기 — 다른 카드들과 동일하게 secondProfileFile 기반으로 표시
              const _rtSecondRaw = String(p?.secondProfileFile||'').trim();
              const _rtSecondIsVideo = /\.(mp4|webm|ogg|mov|m4v)(\?|$)/i.test(_rtSecondRaw);
              const rtSecondPhoto = (_rtSecondRaw && !_rtSecondIsVideo) ? _rtSecondRaw : '';
              const rtSecondHtml = rtSecondPhoto
                ? `<img class="b2-players-card-secondary" src="${toHttpsUrl(rtSecondPhoto).replace(/\"/g,'&quot;')}" loading="eager" fetchpriority="high" decoding="async" alt="" onerror="this.remove()">`
                : '';
              const rtHoverAttrs = rtSecondPhoto ? ` onmousemove="_b2CardHoverScrub(event,this)" onmouseleave="_b2CardHoverLeave(this)"` : '';
              return `<div class="b2rt-card" onclick="if(typeof openPlayerModal==='function')openPlayerModal('${nameJs}')"${rtHoverAttrs}>
                <div class="b2rt-topbadges">
                  <span class="b2rt-pill">${tier}티어</span>
                  <span class="b2rt-pill" style="background:${uCol}55;border-color:${uCol}88">${String(p?.race||'?')}</span>
                </div>
                ${img}${rtSecondHtml}${fb}
                <div class="b2rt-bottom">
                  <div class="b2rt-name" title="${name.replace(/\"/g,'&quot;')}">${name}</div>
                  <div class="b2rt-meta"><span>${tier}티어</span><span class="b2rt-ubadge" style="background:${uCol}22;border-color:${uCol}55;color:#fff">${uLogo}${univ}</span></div>
                </div>
              </div>`;
            }).join('');
          }
        };
        window._b2RaceTierSetUniv = function(univ){
          window._b2RaceTierState = window._b2RaceTierState || {};
          window._b2RaceTierState.univ = String(univ||'ALL');
          window._b2RaceTierRender && window._b2RaceTierRender();
        };

        const ov3 = document.getElementById('b2RaceTierOverlay');
        if(ov3) ov3.style.display = 'block';
        window._b2RaceTierSetUniv('ALL');
      }catch(e){ console.error(e); }
    };
  }
}catch(e){}

try{
  if(!window.openB2TierUnivModal){
    window.openB2TierUnivModal = function(tier){
      try{
        const list = Array.isArray(window._b2LastAllVisPlayers) ? window._b2LastAllVisPlayers : [];
        const tt = String(tier||'?').trim();
        const pool = list.filter(p=>String(p?.tier||'?')===tt);
        const groups = new Map();
        pool.forEach(p=>{
          const u = String(p?.univ||'무소속');
          if(groups.has(u)) groups.get(u).push(p);
          else groups.set(u,[p]);
        });
        const ordered = Array.from(groups.entries()).sort((a,b)=>b[1].length-a[1].length || a[0].localeCompare(b[0]));

        if(!document.getElementById('b2TierUnivStyle')){
          const st = document.createElement('style');
          st.id = 'b2TierUnivStyle';
          st.textContent = `
            #b2TierUnivOverlay{display:none;position:fixed;inset:0;z-index:6000;background:rgba(2,6,23,.42);backdrop-filter:blur(6px)}
            #b2TierUnivOverlay .su-modal{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:min(1120px,calc(100vw - 28px));height:min(860px,calc(100vh - 28px));background:linear-gradient(180deg,rgba(255,255,255,.985),rgba(248,250,252,.96));border:1px solid rgba(148,163,184,.18);border-radius:26px;box-shadow:0 30px 64px rgba(15,23,42,.22);display:flex;flex-direction:column;overflow:hidden}
            #b2TierUnivOverlay .su-modal-hd{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:14px 16px;border-bottom:1px solid rgba(148,163,184,.14);background:linear-gradient(135deg,rgba(239,246,255,.96),rgba(255,255,255,.92))}
            #b2TierUnivOverlay .su-modal-bd{padding:14px 14px 16px;overflow:auto;flex:1;min-height:0}
            #b2TierUnivOverlay .b2tu-title{font-size:16px;font-weight:1000;letter-spacing:-.02em;color:var(--text1)}
            #b2TierUnivOverlay .b2tu-sub{font-size:var(--fs-caption);font-weight:800;color:var(--text3)}
            #b2TierUnivOverlay .b2tu-summary{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin-bottom:12px}
            #b2TierUnivOverlay .b2tu-summarycard{padding:12px 13px;border-radius:18px;background:linear-gradient(180deg,rgba(255,255,255,.98),rgba(248,250,252,.94));border:1px solid rgba(148,163,184,.14);box-shadow:0 10px 24px rgba(15,23,42,.06)}
            #b2TierUnivOverlay .b2tu-summarylabel{font-size:10px;font-weight:900;letter-spacing:.08em;color:var(--text3);text-transform:uppercase}
            #b2TierUnivOverlay .b2tu-summaryvalue{margin-top:7px;font-size:20px;font-weight:1000;letter-spacing:-.03em;color:var(--text1)}
            #b2TierUnivOverlay .b2tu-summarymeta{margin-top:4px;font-size:var(--fs-caption);font-weight:800;color:var(--text3)}
            #b2TierUnivOverlay .b2tu-filter{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:12px}
            #b2TierUnivOverlay .b2tu-filterbtn{display:inline-flex;align-items:center;gap:6px;padding:6px 10px;border-radius:999px;border:1px solid rgba(148,163,184,.16);background:rgba(248,250,252,.98);font-size:var(--fs-caption);font-weight:900;color:var(--text2);cursor:pointer}
            #b2TierUnivOverlay .b2tu-filterbtn.on{border-color:rgba(37,99,235,.35);background:linear-gradient(180deg,rgba(239,246,255,.98),rgba(219,234,254,.92));color:#1d4ed8}
            #b2TierUnivOverlay .b2tu-groupgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:10px;margin-bottom:12px}
            #b2TierUnivOverlay .b2tu-groupcard{padding:12px 13px;border-radius:18px;background:linear-gradient(180deg,rgba(255,255,255,.99),rgba(248,250,252,.95));border:1px solid rgba(148,163,184,.14);box-shadow:0 10px 22px rgba(15,23,42,.06)}
            #b2TierUnivOverlay .b2tu-grouphead{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:10px}
            #b2TierUnivOverlay .b2tu-groupname{font-size:var(--fs-base);font-weight:950;color:var(--text1);display:flex;align-items:center;gap:6px;min-width:0}
            #b2TierUnivOverlay .b2tu-groupcount{font-size:var(--fs-caption);font-weight:900;color:var(--text3)}
            #b2TierUnivOverlay .b2tu-groupavatars{display:flex;flex-wrap:wrap;gap:6px}
            #b2TierUnivOverlay .b2tu-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:12px}
            #b2TierUnivOverlay .b2tu-card{position:relative;border-radius:18px;overflow:hidden;aspect-ratio:0.78;background:#0b1120;border:1px solid rgba(255,255,255,.14);box-shadow:0 10px 22px rgba(15,23,42,.10);cursor:pointer}
            #b2TierUnivOverlay .b2tu-card img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:top center}
            #b2TierUnivOverlay .b2tu-topbadges{position:absolute;left:10px;right:10px;top:10px;display:flex;align-items:center;justify-content:space-between;gap:8px;z-index:2}
            #b2TierUnivOverlay .b2tu-pill{display:inline-flex;align-items:center;gap:4px;padding:5px 9px;border-radius:999px;background:rgba(15,23,42,.72);border:1px solid rgba(255,255,255,.28);backdrop-filter:blur(10px);font-size:var(--fs-caption);font-weight:900;color:#fff}
            #b2TierUnivOverlay .b2tu-fb{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:26px;font-weight:1000;color:rgba(255,255,255,.85);background:linear-gradient(160deg,rgba(71,85,105,.55),rgba(15,23,42,.42))}
            #b2TierUnivOverlay .b2tu-bottom{position:absolute;left:0;right:0;bottom:0;padding:10px 10px 12px;display:flex;flex-direction:column;gap:4px}
            #b2TierUnivOverlay .b2tu-bottom::before{content:'';position:absolute;left:0;right:0;bottom:0;height:78%;background:linear-gradient(180deg,rgba(15,23,42,0) 0%,rgba(15,23,42,.40) 24%,rgba(4,7,18,.92) 100%);pointer-events:none}
            #b2TierUnivOverlay .b2tu-bottom>*{position:relative;z-index:1}
            #b2TierUnivOverlay .b2tu-name{font-size:var(--fs-base);font-weight:950;color:#fff;letter-spacing:-.02em;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-shadow:0 2px 8px rgba(0,0,0,.5)}
            #b2TierUnivOverlay .b2tu-meta{display:flex;align-items:center;gap:6px;font-size:var(--fs-caption);font-weight:850;color:rgba(255,255,255,.92);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-shadow:0 1px 5px rgba(0,0,0,.5)}
            #b2TierUnivOverlay .b2tu-ubadge{display:inline-flex;align-items:center;gap:4px;max-width:100%;padding:2px 8px;border-radius:999px;border:1px solid rgba(255,255,255,.3);font-size:10.5px;font-weight:900;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;backdrop-filter:blur(6px);background:rgba(15,23,42,.55)!important}
            #b2TierUnivOverlay .b2tu-heat{display:grid;grid-template-columns:repeat(auto-fill,44px);gap:8px}
            #b2TierUnivOverlay .b2tu-av{width:44px;height:44px;border-radius:var(--r2);overflow:hidden;border:1px solid rgba(148,163,184,.16);background:linear-gradient(160deg,rgba(148,163,184,.26),rgba(15,23,42,.12));box-shadow:0 6px 14px rgba(15,23,42,.08);cursor:pointer;padding:0}
            #b2TierUnivOverlay .b2tu-av img{width:100%;height:100%;object-fit:cover;object-position:top center;display:block}
            #b2TierUnivOverlay .b2tu-av span{display:flex;align-items:center;justify-content:center;width:100%;height:100%;font-size:14px;font-weight:1000;color:rgba(255,255,255,.75)}
            @media (max-width:780px){#b2TierUnivOverlay .su-modal{height:min(920px,calc(100vh - 14px));width:min(100vw - 14px,1120px);border-radius:22px}#b2TierUnivOverlay .b2tu-summary{grid-template-columns:1fr}#b2TierUnivOverlay .b2tu-groupgrid{grid-template-columns:1fr}#b2TierUnivOverlay .b2tu-grid{grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px}}
            body.dark #b2TierUnivOverlay .su-modal{background:linear-gradient(180deg,rgba(15,23,42,.98),rgba(15,23,42,.96));border-color:#334155}
            body.dark #b2TierUnivOverlay .su-modal-hd{background:linear-gradient(135deg,rgba(30,58,95,.5),rgba(15,23,42,.9));border-bottom-color:#334155}
            body.dark #b2TierUnivOverlay .b2tu-summarycard,
            body.dark #b2TierUnivOverlay .b2tu-groupcard{background:rgba(15,23,42,.6);border-color:#334155}
            body.dark #b2TierUnivOverlay .b2tu-filterbtn{background:rgba(15,23,42,.6);border-color:#334155}
            body.dark #b2TierUnivOverlay .b2tu-filterbtn.on{background:linear-gradient(180deg,#1e3a5f,#1e293b);color:#93c5fd;border-color:rgba(96,165,250,.35)}
            body.dark #b2TierUnivOverlay .b2tu-av{background:linear-gradient(160deg,rgba(148,163,184,.16),rgba(15,23,42,.3))}
          `;
          document.head.appendChild(st);
        }

        let ov = document.getElementById('b2TierUnivOverlay');
        if(!ov){
          ov = document.createElement('div');
          ov.id = 'b2TierUnivOverlay';
          ov.innerHTML = `
            <div class="su-modal">
              <div class="su-modal-hd">
                <div style="min-width:0;display:flex;flex-direction:column;gap:2px">
                  <div class="b2tu-title" id="b2tuTitle"></div>
                  <div class="b2tu-sub" id="b2tuSub"></div>
                </div>
                <button type="button" class="btn btn-r btn-sm" id="b2tuClose">닫기</button>
              </div>
              <div class="su-modal-bd">
                <div class="b2tu-summary" id="b2tuSummary"></div>
                <div class="b2tu-filter" id="b2tuFilter"></div>
                <div id="b2tuBody"></div>
              </div>
            </div>
          `;
          document.body.appendChild(ov);
          ov.addEventListener('click', (e)=>{
            try{ if(e.target && e.target.id==='b2TierUnivOverlay') window.closeB2TierUnivModal(); }catch(_){}
          });
          const btn = ov.querySelector('#b2tuClose');
          if(btn) btn.addEventListener('click', ()=>window.closeB2TierUnivModal());
          window.closeB2TierUnivModal = function(){
            const el = document.getElementById('b2TierUnivOverlay');
            if(el) el.style.display = 'none';
          };
        }

        window._b2TierUnivState = { tier: tt, pool, ordered, selectedUniv:'ALL' };
        const title = ov.querySelector('#b2tuTitle');
        const sub = ov.querySelector('#b2tuSub');
        const body = ov.querySelector('#b2tuBody');
        const filter = ov.querySelector('#b2tuFilter');
        const summary = ov.querySelector('#b2tuSummary');
        if(title) title.textContent = `티어 · ${tt}티어`;
        window._b2TierUnivRender = function(){
          const st2 = window._b2TierUnivState || {};
          const selectedUniv = st2.selectedUniv || 'ALL';
          if(filter){
            filter.innerHTML = ['ALL'].concat((st2.ordered||[]).map(([univName])=>univName)).map(univName=>{
              const cnt = univName==='ALL' ? (st2.pool||[]).length : (((st2.ordered||[]).find(([n])=>n===univName)||[])[1]||[]).length;
              const on = selectedUniv===univName;
              return `<button type="button" class="b2tu-filterbtn ${on?'on':''}" onclick="window._b2TierUnivSetFilter && window._b2TierUnivSetFilter('${String(univName).replace(/'/g,'\\\'')}')">${univName==='ALL' ? `전체 (${cnt})` : `${univName} (${cnt})`}</button>`;
            }).join('');
          }
          const filtered = selectedUniv==='ALL' ? (st2.pool||[]) : (st2.pool||[]).filter(p=>String(p?.univ||'무소속')===selectedUniv);
          if(sub) sub.textContent = `${selectedUniv!=='ALL' ? `${selectedUniv} · ` : ''}${filtered.length}명`;
          if(summary){
            const orderedNow = st2.ordered||[];
            const topUniv = orderedNow[0];
            summary.innerHTML = `
              <div class="b2tu-summarycard">
                <div class="b2tu-summarylabel">총 인원</div>
                <div class="b2tu-summaryvalue">${filtered.length}</div>
                <div class="b2tu-summarymeta">${selectedUniv==='ALL' ? '전체 기준' : '선택 대학 기준'}</div>
              </div>
              <div class="b2tu-summarycard">
                <div class="b2tu-summarylabel">분포 대학</div>
                <div class="b2tu-summaryvalue">${selectedUniv==='ALL' ? orderedNow.length : 1}</div>
                <div class="b2tu-summarymeta">${selectedUniv==='ALL' ? '티어 분포 대학 수' : selectedUniv}</div>
              </div>
              <div class="b2tu-summarycard">
                <div class="b2tu-summarylabel">최다 보유 대학</div>
                <div class="b2tu-summaryvalue">${topUniv ? topUniv[0] : '-'}</div>
                <div class="b2tu-summarymeta">${topUniv ? `${topUniv[1].length}명` : '집계 대기'}</div>
              </div>`;
          }
          if(body){
            const groupedHtml = selectedUniv==='ALL'
              ? `<div class="b2tu-groupgrid">${(st2.ordered||[]).map(([univName, arr])=>{
                  const col = (typeof gc==='function') ? (gc(univName)||'#64748b') : '#64748b';
                  const logo = (univName && univName!=='무소속' && typeof gUI==='function') ? gUI(univName,(typeof getUnivLogoSizeStr==='function'?getUnivLogoSizeStr(univName,'players','16px'):'16px')) : '';
                  return `<div class="b2tu-groupcard">
                    <div class="b2tu-grouphead">
                      <div class="b2tu-groupname" title="${String(univName).replace(/"/g,'&quot;')}"><span class="b2tu-pill" style="background:${col}20;border-color:${col}44;color:${col}">${logo}${univName}</span></div>
                      <div class="b2tu-groupcount">${arr.length}명</div>
                    </div>
                    <div class="b2tu-groupavatars">${arr.slice(0,8).map(p=>{
                      const name = String(p?.name||'');
                      const nameJs = name.replace(/\\/g,'\\\\').replace(/'/g,"\\'");
                      const photo = String(p?.photo||'').trim();
                      const _avSecondRaw = String(p?.secondProfileFile||'').trim();
                      const _avSecondIsVideo = /\.(mp4|webm|ogg|mov|m4v)(\?|$)/i.test(_avSecondRaw);
                      const avSecondPhoto = (_avSecondRaw && !_avSecondIsVideo) ? _avSecondRaw : '';
                      const avSecondHtml = avSecondPhoto
                        ? `<img class="b2-players-card-secondary" src="${toHttpsUrl(avSecondPhoto).replace(/\"/g,'&quot;')}" loading="eager" fetchpriority="high" decoding="async" alt="" onerror="this.remove()">`
                        : '';
                      const avHoverAttrs = avSecondPhoto ? ` onmousemove="_b2CardHoverScrub(event,this)" onmouseleave="_b2CardHoverLeave(this)"` : '';
                      return `<button type="button" class="b2tu-av" style="position:relative"${avHoverAttrs} onclick="if(typeof openPlayerModal==='function')openPlayerModal('${nameJs}')" title="${name.replace(/"/g,'&quot;')}">${photo?`<img src="${toHttpsUrl(photo).replace(/\"/g,'&quot;')}" loading="eager" fetchpriority="high" decoding="async" onerror="this.parentNode.innerHTML='<span>${String(p?.race||'?')}</span>'">`:`<span>${String(p?.race||'?')}</span>`}${avSecondHtml}</button>`;
                    }).join('')}</div>
                  </div>`;
                }).join('')}</div>`
              : '';
            body.innerHTML = filtered.length ? `${groupedHtml}<div class="b2tu-grid">${filtered.map(p=>{
              const name = String(p?.name||'');
              const photo = String(p?.photo||'').trim();
              const race = String(p?.race||'?');
              const univName = String(p?.univ||'무소속');
              const col = (typeof gc==='function') ? (gc(univName)||'#64748b') : '#64748b';
              const logo = (univName && univName!=='무소속' && typeof gUI==='function') ? gUI(univName,(typeof getUnivLogoSizeStr==='function'?getUnivLogoSizeStr(univName,'players','16px'):'16px')) : '';
              const nameJs = name.replace(/\\/g,'\\\\').replace(/'/g,"\\'");
              const img = photo ? `<img src="${toHttpsUrl(photo).replace(/\"/g,'&quot;')}" loading="eager" fetchpriority="high" decoding="async" onerror="this.style.display='none'">` : '';
              const fb = `<div class="b2tu-fb" style="display:${photo?'none':'flex'}">${race}</div>`;
              // (버그픽스) 두번째 프로필 사진 호버 미리보기
              const _tuSecondRaw = String(p?.secondProfileFile||'').trim();
              const _tuSecondIsVideo = /\.(mp4|webm|ogg|mov|m4v)(\?|$)/i.test(_tuSecondRaw);
              const tuSecondPhoto = (_tuSecondRaw && !_tuSecondIsVideo) ? _tuSecondRaw : '';
              const tuSecondHtml = tuSecondPhoto
                ? `<img class="b2-players-card-secondary" src="${toHttpsUrl(tuSecondPhoto).replace(/\"/g,'&quot;')}" loading="eager" fetchpriority="high" decoding="async" alt="" onerror="this.remove()">`
                : '';
              const tuHoverAttrs = tuSecondPhoto ? ` onmousemove="_b2CardHoverScrub(event,this)" onmouseleave="_b2CardHoverLeave(this)"` : '';
              return `<div class="b2tu-card" onclick="if(typeof openPlayerModal==='function')openPlayerModal('${nameJs}')"${tuHoverAttrs}>
                <div class="b2tu-topbadges">
                  <span class="b2tu-pill">${tt}티어</span>
                  <span class="b2tu-pill" style="background:${col}55;border-color:${col}88">${race}</span>
                </div>
                ${img}${tuSecondHtml}${fb}
                <div class="b2tu-bottom">
                  <div class="b2tu-name" title="${name.replace(/\"/g,'&quot;')}">${name}</div>
                  <div class="b2tu-meta"><span>${race}</span><span class="b2tu-ubadge" style="background:${col}22;border-color:${col}55;color:#fff">${logo}${univName}</span></div>
                </div>
              </div>`;
            }).join('')}</div>` : `<div style="padding:24px;text-align:center;color:var(--text3);font-weight:800">표시할 선수가 없습니다.</div>`;
          }
        };
        window._b2TierUnivSetFilter = function(univName){
          window._b2TierUnivState = window._b2TierUnivState || {};
          window._b2TierUnivState.selectedUniv = String(univName||'ALL');
          window._b2TierUnivRender && window._b2TierUnivRender();
        };
        window._b2TierUnivSetFilter('ALL');
        ov.style.display = 'block';
      }catch(e){ console.error(e); }
    };
  }
}catch(e){}

/* ── 🧩 펨코현황 뷰 ──
   첨부 이미지처럼 "대학별 컬러 섹션 + 촘촘한 프로필 그리드" 형태로 렌더링
*/
;(function _injectImg2HoverStyle(){
  if(typeof document==='undefined') return;
  if(document.getElementById('b2-img2-hover-style')) return;
  const s=document.createElement('style');
  s.id='b2-img2-hover-style';
  s.textContent=[
    '.b2-players-card-secondary{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:top center;z-index:5;opacity:0;pointer-events:none;transition:opacity .22s ease}',
    '@media (hover: hover) and (pointer: fine){ .b2-players-card-secondary.is-visible{opacity:1} }'
  ].join('');
  document.head.appendChild(s);
})();

;(function _injectUnivPosterCardStyle(){
  if(typeof document==='undefined') return;
  if(document.getElementById('b2-univ-poster-card-style')) return;
  const s=document.createElement('style');
  s.id='b2-univ-poster-card-style';
  s.textContent=[
    '.b2-univ-poster-card{transition:transform .18s ease,box-shadow .18s ease}',
    '@media (hover: hover) and (pointer: fine){ .b2-univ-poster-card:hover{transform:translateY(-4px) scale(1.03);box-shadow:0 16px 28px rgba(15,23,42,.24)} }',
    '@media (max-width:480px){ .b2-univ-poster-card{width:100px} }'
  ].join('');
  document.head.appendChild(s);
})();
