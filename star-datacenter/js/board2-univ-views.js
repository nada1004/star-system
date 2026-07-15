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
  const _viewBtn = (mode, label) => `
    <button type="button" class="b2-jump-chip" onclick="_b2SetUnivProfileViewMode('${mode}')" style="border:${_viewMode===mode?'1.5px solid #2563eb':'1.5px solid rgba(148,163,184,.20)'};background:${_viewMode===mode?'linear-gradient(135deg,#eff6ff,#dbeafe)':'linear-gradient(135deg,rgba(255,255,255,.98),rgba(248,250,252,.94))'};color:${_viewMode===mode?'#1d4ed8':'var(--text2)'};box-shadow:${_viewMode===mode?'0 6px 16px rgba(37,99,235,.12)':'0 4px 10px rgba(15,23,42,.04)'}">${label}</button>`;
  const statsBar = `<div style="margin-bottom:12px">
    <div style="padding:14px;border-radius:22px;border:1px solid rgba(148,163,184,.18);background:linear-gradient(180deg,rgba(255,255,255,.99),rgba(248,250,252,.96));box-shadow:0 16px 28px rgba(15,23,42,.05)">
      <div class="b2-univ-statsbar-grid" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:10px">
        <div style="padding:13px 14px;border-radius:18px;border:1px solid rgba(148,163,184,.14);background:linear-gradient(180deg,rgba(255,255,255,.98),rgba(248,250,252,.94))">
          <div style="font-size:11px;font-weight:800;color:var(--text3)">표시 선수</div>
          <div style="margin-top:6px;font-size:22px;font-weight:950;letter-spacing:-.03em;color:var(--text1)">${_allVis.length}</div>
          <div style="margin-top:4px;font-size:11px;font-weight:700;color:var(--text3)">현황판 기준 표시 인원</div>
        </div>
        <div style="padding:13px 14px;border-radius:18px;border:1px solid rgba(148,163,184,.14);background:linear-gradient(180deg,rgba(255,255,255,.98),rgba(248,250,252,.94))">
          <div style="font-size:11px;font-weight:800;color:var(--text3)">이번주 기록 수</div>
          <div style="margin-top:6px;font-size:22px;font-weight:950;letter-spacing:-.03em;color:#2563eb">${_uvWeekG}</div>
          <div style="margin-top:4px;font-size:11px;font-weight:700;color:var(--text3)">개인전·팀전·대회 기준</div>
        </div>
        <div style="padding:13px 14px;border-radius:18px;border:1px solid rgba(148,163,184,.14);background:linear-gradient(180deg,rgba(255,255,255,.98),rgba(248,250,252,.94))">
          <div style="font-size:11px;font-weight:800;color:var(--text3)">이번주 활동 스트리머</div>
          <div style="margin-top:6px;font-size:22px;font-weight:950;letter-spacing:-.03em;color:#f59e0b">${_uvWeekActive}</div>
          <div style="margin-top:4px;font-size:11px;font-weight:700;color:var(--text3)">월~오늘 기록 1회 이상</div>
        </div>
      </div>
      <div class="b2-race-tier-row" style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-top:12px;padding-top:12px;border-top:1px solid rgba(148,163,184,.14)">
        <span class="b2-jump-label">종족 비중</span>
        ${_uvRaceBar||`<span style="font-size:11px;font-weight:700;color:var(--gray-l)">집계 없음</span>`}
        ${_uvTierBtns?`<span style="width:1px;height:20px;background:var(--border2);display:inline-block;margin:0 4px;flex-shrink:0"></span><span class="b2-jump-label">티어</span>${_uvTierBtns}`:''}
      </div>
      <div class="b2-jump-row" style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-top:12px;padding-top:12px;border-top:1px solid rgba(148,163,184,.14)">
        <span class="b2-jump-label">🏛️ 바로가기</span>
        ${_jumpChips}
      </div>
      <div class="b2-mode-row" style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-top:10px;padding-top:10px;border-top:1px dashed rgba(148,163,184,.14)">
        <span class="b2-jump-label">🖼️ 모드</span>
        ${_viewBtn('default','기본')}
        ${_viewBtn('poster','포스터')}
        ${_viewBtn('glass','✨ 글래스')}
        ${_viewBtn('table','📋 테이블')}
      </div>
    </div>
  </div>`;
  const _b2Cols = (typeof boardGridCols!=='undefined'&&boardGridCols===2) ? 'repeat(2,1fr)' : '1fr';
  let h = statsBar + `<style>.b2-bottom-img{max-width:130px;max-height:110px;object-fit:contain;}.b2-side-panel{float:right;width:230px;margin:0 0 6px 10px;border-radius:10px;padding:8px;box-sizing:border-box;}@media(min-width:769px) and (max-width:1024px){.b2-univ-grid{grid-template-columns:1fr!important;}.b2-side-panel{width:180px;}}@media(max-width:900px){.b2-univ-grid{grid-template-columns:1fr!important;}}@media(max-width:640px){.b2-side-panel{display:none!important;}.b2-bottom-img{display:none!important;}.b2-univ-statsbar-grid{display:none!important;}}</style>`;
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
            #b2RaceTierOverlay .b2rt-sub{font-size:11px;font-weight:800;color:var(--text3)}
            #b2RaceTierOverlay .b2rt-summary{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin-top:10px}
            #b2RaceTierOverlay .b2rt-summarycard{padding:12px 13px;border-radius:18px;background:linear-gradient(180deg,rgba(255,255,255,.98),rgba(248,250,252,.94));border:1px solid rgba(148,163,184,.14);box-shadow:0 10px 24px rgba(15,23,42,.06)}
            #b2RaceTierOverlay .b2rt-summarylabel{font-size:10px;font-weight:900;letter-spacing:.08em;color:var(--text3);text-transform:uppercase}
            #b2RaceTierOverlay .b2rt-summaryvalue{margin-top:7px;font-size:20px;font-weight:1000;letter-spacing:-.03em;color:var(--text1)}
            #b2RaceTierOverlay .b2rt-summarymeta{margin-top:4px;font-size:11px;font-weight:800;color:var(--text3)}
            #b2RaceTierOverlay .b2rt-univbar{display:flex;flex-wrap:wrap;gap:8px;margin-top:10px}
            #b2RaceTierOverlay .b2rt-univbtn{display:inline-flex;align-items:center;gap:6px;padding:6px 10px;border-radius:999px;border:1px solid rgba(148,163,184,.16);background:rgba(248,250,252,.98);font-size:11px;font-weight:900;color:var(--text2);cursor:pointer}
            #b2RaceTierOverlay .b2rt-univbtn.on{border-color:rgba(37,99,235,.35);background:linear-gradient(180deg,rgba(239,246,255,.98),rgba(219,234,254,.92));color:#1d4ed8}
            #b2RaceTierOverlay .b2rt-groupgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:10px;margin-top:12px;margin-bottom:2px}
            #b2RaceTierOverlay .b2rt-groupcard{padding:12px 13px;border-radius:18px;background:linear-gradient(180deg,rgba(255,255,255,.99),rgba(248,250,252,.95));border:1px solid rgba(148,163,184,.14);box-shadow:0 10px 22px rgba(15,23,42,.06);cursor:pointer}
            #b2RaceTierOverlay .b2rt-grouphead{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:10px}
            #b2RaceTierOverlay .b2rt-groupname{font-size:13px;font-weight:950;color:var(--text1);display:flex;align-items:center;gap:6px;min-width:0}
            #b2RaceTierOverlay .b2rt-groupcount{font-size:11px;font-weight:900;color:var(--text3);flex-shrink:0}
            #b2RaceTierOverlay .b2rt-groupavatars{display:flex;flex-wrap:wrap;gap:6px}
            #b2RaceTierOverlay .b2rt-av{width:44px;height:44px;border-radius:16px;overflow:hidden;border:1px solid rgba(148,163,184,.16);background:linear-gradient(160deg,rgba(148,163,184,.26),rgba(15,23,42,.12));box-shadow:0 6px 14px rgba(15,23,42,.08);cursor:pointer;padding:0}
            #b2RaceTierOverlay .b2rt-av img{width:100%;height:100%;object-fit:cover;object-position:top center;display:block}
            #b2RaceTierOverlay .b2rt-av span{display:flex;align-items:center;justify-content:center;width:100%;height:100%;font-size:14px;font-weight:1000;color:rgba(255,255,255,.75)}
            #b2RaceTierOverlay .b2rt-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:12px;margin-top:12px}
            #b2RaceTierOverlay .b2rt-card{position:relative;border-radius:18px;overflow:hidden;aspect-ratio:0.78;background:#0b1120;border:1px solid rgba(255,255,255,.14);box-shadow:0 10px 22px rgba(15,23,42,.10);cursor:pointer}
            #b2RaceTierOverlay .b2rt-card img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:top center}
            #b2RaceTierOverlay .b2rt-topbadges{position:absolute;left:10px;right:10px;top:10px;display:flex;align-items:center;justify-content:space-between;gap:8px;z-index:2}
            #b2RaceTierOverlay .b2rt-pill{display:inline-flex;align-items:center;gap:4px;padding:5px 9px;border-radius:999px;background:rgba(15,23,42,.72);border:1px solid rgba(255,255,255,.28);backdrop-filter:blur(10px);font-size:11px;font-weight:900;color:#fff}
            #b2RaceTierOverlay .b2rt-fb{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:26px;font-weight:1000;color:rgba(255,255,255,.85);background:linear-gradient(160deg,rgba(71,85,105,.55),rgba(15,23,42,.42))}
            #b2RaceTierOverlay .b2rt-bottom{position:absolute;left:0;right:0;bottom:0;padding:10px 10px 12px;display:flex;flex-direction:column;gap:4px}
            #b2RaceTierOverlay .b2rt-bottom::before{content:'';position:absolute;left:0;right:0;bottom:0;height:78%;background:linear-gradient(180deg,rgba(15,23,42,0) 0%,rgba(15,23,42,.40) 24%,rgba(4,7,18,.92) 100%);pointer-events:none}
            #b2RaceTierOverlay .b2rt-bottom>*{position:relative;z-index:1}
            #b2RaceTierOverlay .b2rt-name{font-size:13px;font-weight:950;color:#fff;letter-spacing:-.02em;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-shadow:0 2px 8px rgba(0,0,0,.5)}
            #b2RaceTierOverlay .b2rt-meta{display:flex;align-items:center;gap:6px;font-size:11px;font-weight:850;color:rgba(255,255,255,.92);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-shadow:0 1px 5px rgba(0,0,0,.5)}
            #b2RaceTierOverlay .b2rt-ubadge{display:inline-flex;align-items:center;gap:4px;max-width:100%;padding:2px 8px;border-radius:999px;border:1px solid rgba(255,255,255,.3);font-size:10.5px;font-weight:900;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;backdrop-filter:blur(6px);background:rgba(15,23,42,.55)!important}
            @media (max-width:780px){#b2RaceTierOverlay .su-modal{height:min(860px,calc(100vh - 14px));width:min(100vw - 14px,1120px);border-radius:22px}#b2RaceTierOverlay .b2rt-summary{grid-template-columns:1fr}#b2RaceTierOverlay .b2rt-grid{grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px}#b2RaceTierOverlay .b2rt-groupgrid{grid-template-columns:1fr}}
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
                    return `<button type="button" class="b2rt-av" onclick="event.stopPropagation();if(typeof openPlayerModal==='function')openPlayerModal('${nameJs}')" title="${name.replace(/"/g,'&quot;')}">${photo?`<img src="${toHttpsUrl(photo).replace(/\"/g,'&quot;')}" loading="lazy" decoding="async" onerror="this.parentNode.innerHTML='<span>${String(p?.race||'?')}</span>'">`:`<span>${String(p?.race||'?')}</span>`}</button>`;
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
              const img = photo ? `<img src="${toHttpsUrl(photo).replace(/\"/g,'&quot;')}" loading="lazy" decoding="async" onerror="this.style.display='none'">` : '';
              const fb = `<div class="b2rt-fb" style="display:${photo?'none':'flex'}">${String(p?.race||'?')}</div>`;
              return `<div class="b2rt-card" onclick="if(typeof openPlayerModal==='function')openPlayerModal('${nameJs}')">
                <div class="b2rt-topbadges">
                  <span class="b2rt-pill">${tier}티어</span>
                  <span class="b2rt-pill" style="background:${uCol}55;border-color:${uCol}88">${String(p?.race||'?')}</span>
                </div>
                ${img}${fb}
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
            #b2TierUnivOverlay .b2tu-sub{font-size:11px;font-weight:800;color:var(--text3)}
            #b2TierUnivOverlay .b2tu-summary{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin-bottom:12px}
            #b2TierUnivOverlay .b2tu-summarycard{padding:12px 13px;border-radius:18px;background:linear-gradient(180deg,rgba(255,255,255,.98),rgba(248,250,252,.94));border:1px solid rgba(148,163,184,.14);box-shadow:0 10px 24px rgba(15,23,42,.06)}
            #b2TierUnivOverlay .b2tu-summarylabel{font-size:10px;font-weight:900;letter-spacing:.08em;color:var(--text3);text-transform:uppercase}
            #b2TierUnivOverlay .b2tu-summaryvalue{margin-top:7px;font-size:20px;font-weight:1000;letter-spacing:-.03em;color:var(--text1)}
            #b2TierUnivOverlay .b2tu-summarymeta{margin-top:4px;font-size:11px;font-weight:800;color:var(--text3)}
            #b2TierUnivOverlay .b2tu-filter{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:12px}
            #b2TierUnivOverlay .b2tu-filterbtn{display:inline-flex;align-items:center;gap:6px;padding:6px 10px;border-radius:999px;border:1px solid rgba(148,163,184,.16);background:rgba(248,250,252,.98);font-size:11px;font-weight:900;color:var(--text2);cursor:pointer}
            #b2TierUnivOverlay .b2tu-filterbtn.on{border-color:rgba(37,99,235,.35);background:linear-gradient(180deg,rgba(239,246,255,.98),rgba(219,234,254,.92));color:#1d4ed8}
            #b2TierUnivOverlay .b2tu-groupgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:10px;margin-bottom:12px}
            #b2TierUnivOverlay .b2tu-groupcard{padding:12px 13px;border-radius:18px;background:linear-gradient(180deg,rgba(255,255,255,.99),rgba(248,250,252,.95));border:1px solid rgba(148,163,184,.14);box-shadow:0 10px 22px rgba(15,23,42,.06)}
            #b2TierUnivOverlay .b2tu-grouphead{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:10px}
            #b2TierUnivOverlay .b2tu-groupname{font-size:13px;font-weight:950;color:var(--text1);display:flex;align-items:center;gap:6px;min-width:0}
            #b2TierUnivOverlay .b2tu-groupcount{font-size:11px;font-weight:900;color:var(--text3)}
            #b2TierUnivOverlay .b2tu-groupavatars{display:flex;flex-wrap:wrap;gap:6px}
            #b2TierUnivOverlay .b2tu-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:12px}
            #b2TierUnivOverlay .b2tu-card{position:relative;border-radius:18px;overflow:hidden;aspect-ratio:0.78;background:#0b1120;border:1px solid rgba(255,255,255,.14);box-shadow:0 10px 22px rgba(15,23,42,.10);cursor:pointer}
            #b2TierUnivOverlay .b2tu-card img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:top center}
            #b2TierUnivOverlay .b2tu-topbadges{position:absolute;left:10px;right:10px;top:10px;display:flex;align-items:center;justify-content:space-between;gap:8px;z-index:2}
            #b2TierUnivOverlay .b2tu-pill{display:inline-flex;align-items:center;gap:4px;padding:5px 9px;border-radius:999px;background:rgba(15,23,42,.72);border:1px solid rgba(255,255,255,.28);backdrop-filter:blur(10px);font-size:11px;font-weight:900;color:#fff}
            #b2TierUnivOverlay .b2tu-fb{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:26px;font-weight:1000;color:rgba(255,255,255,.85);background:linear-gradient(160deg,rgba(71,85,105,.55),rgba(15,23,42,.42))}
            #b2TierUnivOverlay .b2tu-bottom{position:absolute;left:0;right:0;bottom:0;padding:10px 10px 12px;display:flex;flex-direction:column;gap:4px}
            #b2TierUnivOverlay .b2tu-bottom::before{content:'';position:absolute;left:0;right:0;bottom:0;height:78%;background:linear-gradient(180deg,rgba(15,23,42,0) 0%,rgba(15,23,42,.40) 24%,rgba(4,7,18,.92) 100%);pointer-events:none}
            #b2TierUnivOverlay .b2tu-bottom>*{position:relative;z-index:1}
            #b2TierUnivOverlay .b2tu-name{font-size:13px;font-weight:950;color:#fff;letter-spacing:-.02em;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-shadow:0 2px 8px rgba(0,0,0,.5)}
            #b2TierUnivOverlay .b2tu-meta{display:flex;align-items:center;gap:6px;font-size:11px;font-weight:850;color:rgba(255,255,255,.92);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-shadow:0 1px 5px rgba(0,0,0,.5)}
            #b2TierUnivOverlay .b2tu-ubadge{display:inline-flex;align-items:center;gap:4px;max-width:100%;padding:2px 8px;border-radius:999px;border:1px solid rgba(255,255,255,.3);font-size:10.5px;font-weight:900;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;backdrop-filter:blur(6px);background:rgba(15,23,42,.55)!important}
            #b2TierUnivOverlay .b2tu-heat{display:grid;grid-template-columns:repeat(auto-fill,44px);gap:8px}
            #b2TierUnivOverlay .b2tu-av{width:44px;height:44px;border-radius:16px;overflow:hidden;border:1px solid rgba(148,163,184,.16);background:linear-gradient(160deg,rgba(148,163,184,.26),rgba(15,23,42,.12));box-shadow:0 6px 14px rgba(15,23,42,.08);cursor:pointer;padding:0}
            #b2TierUnivOverlay .b2tu-av img{width:100%;height:100%;object-fit:cover;object-position:top center;display:block}
            #b2TierUnivOverlay .b2tu-av span{display:flex;align-items:center;justify-content:center;width:100%;height:100%;font-size:14px;font-weight:1000;color:rgba(255,255,255,.75)}
            @media (max-width:780px){#b2TierUnivOverlay .su-modal{height:min(920px,calc(100vh - 14px));width:min(100vw - 14px,1120px);border-radius:22px}#b2TierUnivOverlay .b2tu-summary{grid-template-columns:1fr}#b2TierUnivOverlay .b2tu-groupgrid{grid-template-columns:1fr}#b2TierUnivOverlay .b2tu-grid{grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px}}
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
                      return `<button type="button" class="b2tu-av" onclick="if(typeof openPlayerModal==='function')openPlayerModal('${nameJs}')" title="${name.replace(/"/g,'&quot;')}">${photo?`<img src="${toHttpsUrl(photo).replace(/\"/g,'&quot;')}" loading="lazy" decoding="async" onerror="this.parentNode.innerHTML='<span>${String(p?.race||'?')}</span>'">`:`<span>${String(p?.race||'?')}</span>`}</button>`;
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
              const img = photo ? `<img src="${toHttpsUrl(photo).replace(/\"/g,'&quot;')}" loading="lazy" decoding="async" onerror="this.style.display='none'">` : '';
              const fb = `<div class="b2tu-fb" style="display:${photo?'none':'flex'}">${race}</div>`;
              return `<div class="b2tu-card" onclick="if(typeof openPlayerModal==='function')openPlayerModal('${nameJs}')">
                <div class="b2tu-topbadges">
                  <span class="b2tu-pill">${tt}티어</span>
                  <span class="b2tu-pill" style="background:${col}55;border-color:${col}88">${race}</span>
                </div>
                ${img}${fb}
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
function _b2FemcoView() {
  // ─────────────────────────────────────────────────────────────
  // 펨코현황 설정(단일 소스)
  // - settings.js의 _cfgFemcoDefaults/_cfgFemcoLoad/_cfgFemcoSave를 사용
  // - board2.js 내부 중복 defaults/load/save 제거(불일치 버그 방지)
  // ─────────────────────────────────────────────────────────────
  const femcoFallback = () => ({
    autoLayout: 1, logoSize: 150, logoPos: 'top', logoAttachTitle: 1, headGap: 10,
    logoOffsetX: 0, logoOffsetY: 0,
    titleSize: 28, titleFont: 'system', titlePos: 'top',
    titleOffsetX: 0, titleOffsetY: 0,
    playerImgSize: 76, playerImgShape: 'square',
    rowsPerCol: 5, colWidth: 170, colGap: 10, univGap: 18,
    countFontSize: 12, contentPadX: 16, contentAlign: 'left', contentOffsetX: 0,
    univSubtitles: {}, subtitleSize: 12, subtitleWeight: 800, subtitleColor: '',
    nameFontSize: 18, roleFontSize: 10, tierBadgeSize: 10, tierBadgePadX: 6,
    starSize: 15, statusIconSize: 18,
    bgOverlay: 0,
    univColorOverrides: {}, univBgMedia: {}
  });
  let femcoSettings = (typeof window._cfgFemcoLoad === 'function')
    ? window._cfgFemcoLoad()
    : (function(){ try{ return JSON.parse(localStorage.getItem('b2_femco_settings_v1')||'null') || femcoFallback(); }catch(e){ return femcoFallback(); } })();
  // 펨코현황 관련 설정 UI는 "설정 탭 > 이미지 관리 > 펨코현황"에서만 제공합니다.

  // 배경 미디어 열기(영상은 모달, 유튜브/트위치는 새창)
  // [FIX-FEMCO-3] 매 렌더마다 최신 설정 캡처하도록 항상 재할당
  window._b2FemcoOpenBgMedia = function(univName, url){
      const u = String(univName||'');
      const link = String(url||'').trim();
      if(!link) return;
      const low = link.toLowerCase();
      const isVideo = /\.(mp4|webm|ogg)(\?|#|$)/i.test(low);
      const isEmbed = /(youtube\.com|youtu\.be|twitch\.tv)/i.test(low);
      if(isEmbed){
        try{ window.open(link, '_blank', 'noopener'); }catch(e){ location.href = link; }
        return;
      }
      if(!isVideo){
        // 이미지/GIF는 새창
        try{ window.open(link, '_blank', 'noopener'); }catch(e){ location.href = link; }
        return;
      }
      // video modal (클릭 재생 정책)
      const existing = document.getElementById('b2-femco-bg-modal');
      if (existing) existing.remove();
      const ov = document.createElement('div');
      ov.id = 'b2-femco-bg-modal';
      ov.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.60);z-index:var(--z-modal-5);display:flex;align-items:center;justify-content:center;padding:16px';
      const safeTitle = (u||'영상').replace(/</g,'&lt;').replace(/>/g,'&gt;');
      ov.innerHTML = `
        <div style="width:min(980px,96vw);background:var(--white);border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,.16);box-shadow:0 18px 60px rgba(0,0,0,.35)">
          <div style="display:flex;align-items:center;gap:10px;padding:12px 14px;background:linear-gradient(to bottom, rgba(255,255,255,.95), rgba(255,255,255,.85));border-bottom:1px solid var(--border)">
            <div style="font-weight:1000;color:var(--text2)">🎞️ ${safeTitle} 배경 영상</div>
            <span style="color:var(--gray-l);font-size:12px">클릭해서 재생됩니다</span>
            <button style="margin-left:auto;border:1px solid var(--border);background:var(--surface);border-radius:10px;padding:6px 10px;cursor:pointer;font-weight:1000" onclick="document.getElementById('b2-femco-bg-modal')?.remove()">닫기</button>
          </div>
          <div style="padding:12px 14px">
            <video src="${link}" controls playsinline style="width:100%;max-height:72vh;border-radius:12px;background:#000"></video>
          </div>
        </div>
      `;
      ov.addEventListener('click', (e)=>{ if(e.target===ov) ov.remove(); });
      document.body.appendChild(ov);
  };

  // (요청사항) 무소속도 배경 설정/표시 가능
  const univList = _b2VisUnivs().filter(u => u.name);
  if (!univList.length) return `<div style="text-align:center;color:var(--text3);padding:40px">표시할 대학이 없습니다</div>`;

  // univCfg 순서로 정렬 (없으면 이름순)
  if (typeof univCfg !== 'undefined' && univCfg.length) {
    univList.sort((a, b) => {
      const ia = univCfg.findIndex(u => u.name === a.name);
      const ib = univCfg.findIndex(u => u.name === b.name);
      return (ia >= 0 ? ia : 999) - (ib >= 0 ? ib : 999);
    });
  } else {
    univList.sort((a, b) => (a.name || '').localeCompare(b.name || '', 'ko', {sensitivity:'base'}));
  }

  // 표시 대상 선수(현황판 기준과 동일하게 숨김/은퇴/현황판숨김 제외)
  // [FIX-FEMCO-4] membersByUniv 수집 시 dissolved 선수 제외
  const _femcoDissSet = new Set((typeof univCfg !== 'undefined' ? univCfg : []).filter(u=>u.dissolved).map(u=>String(u.name||'').trim()));
  const membersByUniv = {};
  players.forEach(p => {
    const pu = String(p?.univ||'').trim();
    if(!pu || p.hidden || p.retired || p.hideFromBoard || _femcoDissSet.has(pu)) return;
    (membersByUniv[pu] || (membersByUniv[pu]=[])).push(p);
  });

  // 공통 로고 크기(기본)
  const LOGO = Math.max(60, Math.min(520, parseInt(femcoSettings.logoSize || 150, 10) || 150));
  const LOGO_OFF_X = Math.max(-120, Math.min(120, parseInt(femcoSettings.logoOffsetX ?? 0, 10) || 0));
  const LOGO_OFF_Y = Math.max(-120, Math.min(120, parseInt(femcoSettings.logoOffsetY ?? 0, 10) || 0));
  const TITLE_OFF_X = Math.max(-120, Math.min(120, parseInt(femcoSettings.titleOffsetX ?? 0, 10) || 0));
  const TITLE_OFF_Y = Math.max(-120, Math.min(120, parseInt(femcoSettings.titleOffsetY ?? 0, 10) || 0));
  const BG_OVERLAY = Math.max(0, Math.min(70, parseInt(femcoSettings.bgOverlay ?? 0, 10))); // [FIX-FEMCO-1] bgOverlay=0 올바르게 처리
  const OV_TOP = (BG_OVERLAY/70) * 0.22; // 0 → 0.22
  const OV_BOT = (BG_OVERLAY/70) * 0.52; // 0 → 0.52
  const titleSize = Math.max(16, Math.min(44, parseInt(femcoSettings.titleSize || 28, 10) || 28));
  const playerImgSize = Math.max(28, Math.min(160, parseInt(femcoSettings.playerImgSize || 64, 10) || 64));
  const playerRadius = ({
    sharp: '0px',
    roundedsm: '6px',
    square: '10px',
    roundedlg: '22px',
    roundedxl: '34px',
    circle: '50%'
  })[femcoSettings.playerImgShape] || '10px';
  const rowsPerCol = Math.max(2, Math.min(12, parseInt(femcoSettings.rowsPerCol || 5, 10) || 5));
  const colWidth = Math.max(80, Math.min(360, parseInt(femcoSettings.colWidth || 170, 10) || 170));
  const rowGap = Math.max(0, Math.min(28, parseInt(femcoSettings.colGap || 10, 10) || 10)); // UI에서 '상하 간격'
  const colGap = 10; // 가로(컬럼) 간격은 고정(너무 벌어지지 않게)
  const univGap = Math.max(0, Math.min(120, parseInt(femcoSettings.univGap || 18, 10) || 18));
  const countFontSize = Math.max(10, Math.min(18, parseInt(femcoSettings.countFontSize || 12, 10) || 12));
  const contentPadX = Math.max(0, Math.min(40, parseInt(femcoSettings.contentPadX || 16, 10) || 16));
  const contentAlign = (femcoSettings.contentAlign === 'left' || femcoSettings.contentAlign === 'center') ? femcoSettings.contentAlign : 'left';
  const contentOffsetX = Math.max(-40, Math.min(40, parseInt(femcoSettings.contentOffsetX || 0, 10) || 0));
  const headGap = Math.max(0, Math.min(80, parseInt(femcoSettings.headGap || 10, 10) || 10));
  const autoLayout = !(femcoSettings.autoLayout === 0 || femcoSettings.autoLayout === false);
  const vw = (typeof window !== 'undefined') ? (document.documentElement.clientWidth || window.innerWidth || 1280) : 1280; // [FIX-VW] clientWidth 우선, fallback 통일

  const _padL = Math.max(0, Math.min(80, contentPadX + contentOffsetX));
  const _padR = Math.max(0, Math.min(80, contentPadX - contentOffsetX));

  function _autoLayoutForCount(cnt){
    // 인원수 + 화면폭 기준으로 "좌측부터 보기 좋은" 기본값 산출
    let rows = 5;
    if (cnt >= 55) rows = 9;
    else if (cnt >= 45) rows = 8;
    else if (cnt >= 35) rows = 7;
    else if (cnt >= 25) rows = 6;
    else rows = 5;

    let cw = 175;
    if (vw <= 520) { rows = Math.max(rows, 8); cw = 150; }
    else if (vw <= 768) { rows = Math.max(rows, 7); cw = 160; }
    else if (vw <= 1024) { rows = Math.max(rows, 6); cw = 170; }
    else { cw = (cnt >= 45) ? 160 : 175; }

    rows = Math.max(4, Math.min(12, rows));
    cw = Math.max(130, Math.min(220, cw));
    return {rowsPerCol: rows, colWidth: cw};
  }
  const subtitleSize = Math.max(10, Math.min(24, parseInt(femcoSettings.subtitleSize || 12, 10) || 12));
  const subtitleWeight = [400,500,600,700,800,900].includes(parseInt(femcoSettings.subtitleWeight||800,10)) ? parseInt(femcoSettings.subtitleWeight||800,10) : 800;
  const subtitleColor = (typeof femcoSettings.subtitleColor === 'string') ? femcoSettings.subtitleColor : '';
  const nameFontSize = Math.max(10, Math.min(28, parseInt(femcoSettings.nameFontSize || 16, 10) || 16));
  const roleFontSize = Math.max(9, Math.min(16, parseInt(femcoSettings.roleFontSize || 10, 10) || 10));
  const tierBadgeSize = Math.max(9, Math.min(16, parseInt(femcoSettings.tierBadgeSize || 10, 10) || 10));
  const tierBadgePadX = Math.max(4, Math.min(12, parseInt(femcoSettings.tierBadgePadX || 6, 10) || 6));
  const starSize = Math.max(10, Math.min(28, parseInt(femcoSettings.starSize || 15, 10) || 15));
  const titleFontFamily = (() => {
    switch (femcoSettings.titleFont) {
      case 'app': return `var(--app-font)`;
      case 'noto': return `'Noto Sans KR', system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif`;
      case 'pretendard': return `'Pretendard Variable', Pretendard, system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif`;
      case 'nanum': return `'Nanum Gothic', 'Noto Sans KR', system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif`;
      case 'gmarket': return `'GmarketSans', 'Noto Sans KR', system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif`;
      default: return `system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif`;
    }
  })();

  // 타이틀 폰트가 CDN 폰트인 경우, 필요한 CSS를 1회 주입(전역 폰트와 별개)
  (function(){
    const head = document.head || document.getElementsByTagName('head')[0];
    if(!head) return;
    const ensure = (id, href) => {
      if(!href){ const el=document.getElementById(id); if(el) el.remove(); return; }
      let el=document.getElementById(id);
      if(!el){ el=document.createElement('link'); el.id=id; el.rel='stylesheet'; head.appendChild(el); }
      el.href=href;
    };
    const cssMap = {
      noto: 'https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;700;900&display=swap',
      pretendard: 'https://cdn.jsdelivr.net/gh/orioncactus/pretendard@latest/dist/web/variable/pretendardvariable.css',
      nanum: 'https://fonts.googleapis.com/css2?family=Nanum+Gothic:wght@400;700;800&display=swap',
      gmarket: 'https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_2001@1.1/GmarketSans.css',
    };
    const key = femcoSettings.titleFont;
    ensure('femco-titlefont-css', cssMap[key] || '');
  })();

  const tierRank = (p) => {
    const t = p.tier || '';
    const i = (typeof TIERS !== 'undefined' && TIERS.includes(t)) ? TIERS.indexOf(t) : 999;
    return i >= 0 ? i : 999;
  };

  const rolePri = (p) => {
    const r = (p.role || '').trim();
    const order = ['이사장', '총장', '교수', '코치'];
    const i = order.indexOf(r);
    return i >= 0 ? i : 99;
  };

  // (요청) 종족 표기: T / P / Z
  const raceLabel = (p) => p.race === 'P' ? 'P' : p.race === 'T' ? 'T' : p.race === 'Z' ? 'Z' : '?';
  // 종족 색상: 기본 팔레트 + 대학색상(col)과 살짝 블렌딩(대학마다 다르게 보이도록)
  // + 흰 배경(라벨 pill)에서 잘 보이도록 최소 대비 확보
  const _hexToRgb = (hex) => {
    const h = String(hex||'').replace('#','').trim();
    if(h.length < 6) return null;
    const r = parseInt(h.slice(0,2),16), g = parseInt(h.slice(2,4),16), b = parseInt(h.slice(4,6),16);
    if([r,g,b].some(v=>Number.isNaN(v))) return null;
    return {r,g,b};
  };
  const _rgbToHex = (r,g,b) => '#' + [r,g,b].map(v=>Math.max(0,Math.min(255,Math.round(v))).toString(16).padStart(2,'0')).join('');
  const _mixHex = (a,b,t) => {
    const A=_hexToRgb(a), B=_hexToRgb(b);
    if(!A||!B) return a || b || '#94a3b8';
    const tt=Math.max(0,Math.min(1, +t||0));
    return _rgbToHex(A.r*(1-tt)+B.r*tt, A.g*(1-tt)+B.g*tt, A.b*(1-tt)+B.b*tt);
  };
  const _relLum = (hex) => {
    const c=_hexToRgb(hex); if(!c) return 0;
    const f = (v)=>{ v/=255; return v<=0.03928? v/12.92 : Math.pow((v+0.055)/1.055, 2.4); };
    const R=f(c.r), G=f(c.g), B=f(c.b);
    return 0.2126*R + 0.7152*G + 0.0722*B;
  };
  const _contrast = (a,b) => {
    const L1=_relLum(a), L2=_relLum(b);
    const hi=Math.max(L1,L2), lo=Math.min(L1,L2);
    return (hi+0.05)/(lo+0.05);
  };
  const _ensureOnWhite = (hex, min=3.0) => {
    let c = hex || '#94a3b8';
    // 흰색 배경 기준 대비가 부족하면 점점 어둡게(검정쪽으로 블렌딩)
    if(_contrast(c,'#ffffff') >= min) return c;
    const steps=[0.25,0.40,0.55,0.70];
    for(const t of steps){
      const d = _mixHex(c, '#0f172a', t);
      if(_contrast(d,'#ffffff') >= min) return d;
    }
    return _mixHex(c, '#0f172a', 0.75);
  };
  const raceColor = (p, univCol) => {
    const base = p.race === 'P' ? '#c084fc' : p.race === 'T' ? '#38bdf8' : p.race === 'Z' ? '#34d399' : '#94a3b8';
    const themed = univCol ? _mixHex(base, univCol, 0.22) : base;
    return _ensureOnWhite(themed, 3.0);
  };

  function femcoAvatarSquare(p, accent) {
    const img = (p && p.photo) ? toThumbUrl(String(p.photo), playerImgSize) : '';
    const letter = (p && p.name) ? String(p.name).slice(0, 1) : '?';
    const border = `${accent}55`;
    // 상태 아이콘(10시 방향) — 기존 상태 아이콘 시스템 재사용
    let badge = '';
    try{
      const _rawIcon = getStatusIcon(p.name);
      const statusHtml = getStatusIconHTML(p.name);
      const s = playerImgSize;
      // [FIX-FEMCO-2] statusIconSize=0이면 아이콘 숨김
      const _rawIconSize = parseInt(femcoSettings.statusIconSize ?? 18, 10);
      const badgeSize = _rawIconSize === 0 ? 0 : Math.max(10, Math.min(36, _rawIconSize || Math.round(s * 0.38)));
      const _isImgIcon = _rawIcon && (typeof _siIsImg === 'function' ? _siIsImg(_rawIcon) : false);
      const _badgeInner = _isImgIcon
        ? `<img src="${_rawIcon}" style="width:${badgeSize}px;height:${badgeSize}px;border-radius:50%;object-fit:cover;opacity:.86" onerror="this.style.display='none'">`
        : (statusHtml ? statusHtml.replace(/margin-left:[^;]+;/g,'').replace(/font-size:[^;]+;/g,'') : '');
      const _badgeBg = _isImgIcon ? 'rgba(255,255,255,.72)' : 'transparent';
      // 10시 방향(좌상단)
      const _bTop = -Math.round(badgeSize * 0.26);
      const _bLeft = -Math.round(badgeSize * 0.26);
      badge = statusHtml
        ? `<span style="position:absolute;top:${_bTop}px;left:${_bLeft}px;width:${badgeSize}px;height:${badgeSize}px;border-radius:50%;background:${_badgeBg};overflow:hidden;display:flex;align-items:center;justify-content:center;font-size:${Math.round(badgeSize*0.82)}px;line-height:1;filter:drop-shadow(0 1px 2px rgba(0,0,0,.65))">${_badgeInner}</span>`
        : '';
    }catch(e){
      console.warn('[femcoAvatarSquare] 상태 아이콘 생성 실패:', e.message);
    }

    if (img) {
      return `<span style="position:relative;display:block;width:100%;height:100%">
        <img src="${img}" decoding="async" fetchpriority="high" style="width:100%;height:100%;object-fit:cover;border-radius:inherit;border:2px solid ${border};background:rgba(255,255,255,.25)" onerror="this.closest('span').outerHTML='<div style=&quot;position:relative;width:100%;height:100%;border-radius:inherit;background:${accent};display:flex;align-items:center;justify-content:center;font-weight:1000;font-size:22px;color:#fff;border:2px solid ${border}&quot;>${letter}</div>'">
        ${badge}
      </span>`;
    }
    return `<div style="position:relative;width:100%;height:100%;border-radius:inherit;background:${accent};display:flex;align-items:center;justify-content:center;font-weight:1000;font-size:22px;color:#fff;border:2px solid ${border}">${letter}${badge}</div>`;
  }

  let h = `
    <style>
      .b2-femco-wrap{display:flex;flex-direction:column;gap:${univGap}px}
      .b2-femco-univ{border-radius:22px;overflow:hidden;box-shadow:0 4px 28px rgba(0,0,0,.14);transition:background-color .35s ease, box-shadow .35s ease, transform .22s ease}
      .b2-femco-univ:hover{transform:translateY(-2px);box-shadow:0 10px 36px rgba(0,0,0,.20)}
      .b2-femco-head{padding:16px 16px 12px;text-align:center;position:relative}
      .b2-femco-headrow{display:flex;align-items:center;justify-content:center;gap:12px;flex-wrap:wrap}
      .b2-femco-headcol{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:${headGap}px}
      .b2-femco-logo{display:flex;justify-content:center;margin-bottom:0}
      .b2-femco-title-row{display:flex;align-items:center;gap:6px;justify-content:center}
      .b2-femco-title{font-weight:1000;font-size:${titleSize}px;letter-spacing:-.04em;line-height:1.1;font-family:${titleFontFamily}}
      .b2-femco-stars{display:inline-flex;gap:1px;align-items:center;opacity:.95}
      .b2-femco-stars span{font-size:${starSize}px;line-height:1}
      .b2-femco-subtitle{margin-top:6px;font-size:${subtitleSize}px;font-weight:${subtitleWeight};line-height:1.2;opacity:.95}
      /* 인원수: 좌측 상단 고정 (배경 없음) */
      .b2-femco-countbox{
        position:absolute;top:10px;left:10px;
        display:flex;flex-direction:column;gap:2px;align-items:flex-start;justify-content:flex-start;
        padding:0;border-radius:0;background:transparent;border:none;color:inherit;
        max-width:45%;
      }
      .b2-femco-countbox div{font-size:${countFontSize}px;font-weight:1000;line-height:1.15;white-space:nowrap}
      .b2-femco-meta{margin-top:6px;display:flex;justify-content:center;gap:8px;flex-wrap:wrap}
      .b2-femco-pill{font-size:12px;font-weight:1000;padding:3px 10px;border-radius:999px;border:1px solid rgba(255,255,255,.55);background:rgba(255,255,255,.16)}
      .b2-femco-body{padding:12px 12px 16px}
      .b2-femco-group{margin-top:10px}
      .b2-femco-group:first-child{margin-top:0}
      .b2-femco-ghead{display:flex;align-items:center;gap:8px;margin:0 0 8px}
      .b2-femco-glabel{font-size:12px;font-weight:1000;background:rgba(255,255,255,.78);border:1px solid rgba(0,0,0,.10);padding:3px 10px;border-radius:999px}
      .b2-femco-gcount{font-size:11px;font-weight:900;opacity:.85}

      /* ✅ 배치 규칙(요구사항)
         - 1번(첫 컬럼) 위→아래로 5명 채움
         - 5명 되면 우측(다음 컬럼) 1번으로 다시 위→아래로 5명
      */
      .b2-femco-grid{
        display:grid;
        --rowsPerCol:${rowsPerCol};
        --colWidth:${colWidth}px;
        column-gap:${colGap}px;
        row-gap:${rowGap}px;
        grid-auto-flow:column;
        grid-template-rows:repeat(var(--rowsPerCol), minmax(0, auto));
        grid-auto-columns:var(--colWidth);
        overflow-x:auto;
        padding-bottom:6px;
        scrollbar-width:none;
        justify-content:flex-start;
      }
      .b2-femco-grid::-webkit-scrollbar{height:0}

      /* 스트리머 항목(카드형식X): 프로필(네모, 작게) + 우측 텍스트 4줄 */
      /* 카드 느낌 제거: 배경/테두리 최소화 */
      .b2-femco-item{display:flex!important;flex-direction:row!important;align-items:center;gap:10px;padding:8px 10px;border-radius:14px;cursor:pointer;min-width:0;transition:background .15s,transform .18s cubic-bezier(.34,1.56,.64,1),box-shadow .15s;justify-self:start;width:fit-content;max-width:100%}
      .b2-femco-item:hover{background:rgba(255,255,255,.20);transform:translateY(-2px);box-shadow:0 6px 16px rgba(0,0,0,.14)}
      .b2-femco-avatar{width:${playerImgSize}px;height:${playerImgSize}px;border-radius:${playerRadius};overflow:hidden;flex-shrink:0;position:relative}
      .b2-femco-text{display:flex!important;flex-direction:column!important;align-items:flex-start!important;text-align:left!important;gap:2px;min-width:0}
      .b2-femco-tier{font-size:10px;font-weight:1000;display:inline-flex;align-items:center;gap:4px}
      .b2-femco-tierbadge{font-size:${tierBadgeSize}px;padding:2px ${tierBadgePadX}px;border-radius:999px;border:1px solid rgba(0,0,0,.12);display:inline-flex;align-items:center;line-height:1}
      .b2-femco-role{font-size:${roleFontSize}px;font-weight:1000;opacity:.9}
      .b2-femco-name{font-size:${nameFontSize}px;font-weight:1000;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .b2-femco-race-pill{display:inline-flex;align-items:center;gap:4px;font-size:10px;font-weight:1000;padding:1px 6px;border-radius:999px;background:rgba(255,255,255,.85);border:1px solid rgba(0,0,0,.10)}

      @media(max-width:520px){ .b2-femco-title{font-size:20px} }
    </style>
    <div class="b2-femco-wrap">
  `;


  univList.forEach(u => {
    const univName = u.name;
    const all = (membersByUniv[univName] || []);
    if (!all.length) return;

    const overrideCol = (femcoSettings.univColorOverrides || {})[univName];
    const col = overrideCol || gc(univName);
    const textCol = _b2ContrastColor(col);
    const uCfg = (typeof univCfg !== 'undefined' ? univCfg.find(x => x.name === univName) : null) || {};
    // 대학별 로고 크기(옵션): univCfg[i].logoSizeFemco 가 있으면 우선 적용
    const _uLogo = (() => {
      const v = parseInt(uCfg.logoSizeFemco || '', 10);
      if (!isNaN(v) && v > 0) return Math.max(60, Math.min(520, v));
      return LOGO;
    })();
    const iconUrl = uCfg.icon || uCfg.img || '';
    const logoHtml = iconUrl
      ? `<img src="${toHttpsUrl(iconUrl)}" style="width:${_uLogo}px;height:${_uLogo}px;object-fit:contain" onerror="this.style.display='none'">`
      : `<span style="display:inline-flex;align-items:center;justify-content:center;width:${Math.round(_uLogo*0.62)}px;height:${Math.round(_uLogo*0.62)}px;opacity:.85;font-size:${Math.round(_uLogo*0.48)}px;line-height:1">🏫</span>`;

    // 인원 카운트 규칙:
    // - 이사장 인원
    // - 교수 + 코치 인원
    // - 나머지 학생(=전체 - 위 2개)
    const bossCnt = all.filter(p => (p.role || '').trim() === '이사장').length;
    const profCoachCnt = all.filter(p => ['교수','코치'].includes((p.role || '').trim())).length;
    const studentCnt = Math.max(0, all.length - bossCnt - profCoachCnt);

    // 요구사항: 같은 급끼리 섹션으로 나누지 않고, 단일 리스트에서
    // 이사장 → 총장 → 교수 → 코치 우선순위로 정렬 후 5열 배치
    const list = [...all].sort((a, b) => {
      const ra = rolePri(a), rb = rolePri(b);
      if (ra !== rb) return ra - rb;
      // 같은 직급 내에서는 티어→이름
      const ta = tierRank(a), tb = tierRank(b);
      if (ta !== tb) return ta - tb;
      return (a.name || '').localeCompare(b.name || '', 'ko', {sensitivity:'base'});
    });

    const _subTxt = ((femcoSettings.univSubtitles||{})[univName] || '').trim();
    const _subColor = (subtitleColor && subtitleColor.trim()) ? subtitleColor : textCol;

    // 대학별 배경 미디어
    const _bgRaw = ((femcoSettings.univBgMedia||{})[univName]) || '';
    const _bgCfg = (function(){
      const d={url:'',alpha:30,sizeMode:'cover',sizeVal:90,pos:'center',repeat:'no-repeat',ox:0,oy:0};
      if(!_bgRaw) return d;
      if(typeof _bgRaw==='string') return {...d,url:String(_bgRaw).trim()};
      if(typeof _bgRaw==='object') return {...d,..._bgRaw,url:String(_bgRaw.url||'').trim()};
      return d;
    })();
    const _bgUrl = (_bgCfg.url||'').trim();
    const _bgLower = _bgUrl.toLowerCase();
    const _bgIsImage = _bgUrl && /\.(png|jpe?g|webp|gif)(\?|#|$)/i.test(_bgLower);
    const _bgIsVideo = _bgUrl && /\.(mp4|webm|ogg)(\?|#|$)/i.test(_bgLower);
    const _bgIsEmbed = _bgUrl && /(youtube\.com|youtu\.be|twitch\.tv)/i.test(_bgLower);
    const _bgBtn = (_bgIsVideo || _bgIsEmbed || (_bgUrl && !_bgIsImage))
      ? `<button class="b2-femco-pill no-export" style="cursor:pointer" onclick="_b2FemcoOpenBgMedia('${univName.replace(/'/g,"\\'")}', '${_bgUrl.replace(/'/g,"\\'")}');event.stopPropagation();">${_bgIsVideo?'🎞️ 배경영상':_bgIsEmbed?'🔗 배경링크':'🖼️ 배경링크'}</button>`
      : '';

    const _pos = femcoSettings.logoPos || 'top';
    const _posNorm = (['left','right','top','bottom','center'].includes(_pos) ? _pos : 'top');
    const _attach = (femcoSettings.logoAttachTitle ?? 1) ? true : false;
    const _tpos = femcoSettings.titlePos || 'bottom';
    const _tposNorm = (['left','right','top','bottom'].includes(_tpos) ? _tpos : 'bottom');
    const starsHtml = (uCfg.championships || 0) > 0
      ? `<span class="b2-femco-stars">${'<span>⭐</span>'.repeat(uCfg.championships)}</span>`
      : '';
    const titleBlock = `
      <div style="min-width:220px;transform:translate(${TITLE_OFF_X}px,${TITLE_OFF_Y}px)">
        <div class="b2-femco-title-row">
          <div class="b2-femco-title">${univName}</div>
          ${starsHtml}
        </div>
        ${_subTxt?`<div class="b2-femco-subtitle" style="color:${_subColor}">${_subTxt}</div>`:''}
        ${_bgBtn?`<div class="b2-femco-meta">${_bgBtn}</div>`:''}
      </div>
    `;
    const logoOnlyStyle = (() => {
      if (_attach) return '';
      const pad = contentPadX;
      if (_posNorm === 'left') return `position:absolute;left:${pad}px;top:50%;transform:translateY(-50%) translate(${LOGO_OFF_X}px,${LOGO_OFF_Y}px);`;
      if (_posNorm === 'right') return `position:absolute;right:${pad}px;top:50%;transform:translateY(-50%) translate(${LOGO_OFF_X}px,${LOGO_OFF_Y}px);`;
      if (_posNorm === 'bottom') return `position:absolute;left:50%;bottom:10px;transform:translateX(-50%) translate(${LOGO_OFF_X}px,${LOGO_OFF_Y}px);`;
      // top / center
      return `position:absolute;left:50%;top:10px;transform:translateX(-50%) translate(${LOGO_OFF_X}px,${LOGO_OFF_Y}px);`;
    })();

    const headLayout = (() => {
      if (!_attach) {
        // 로고만 이동일 때 제목과 겹치지 않도록 좌/우는 공간을 예약
        const reserve = Math.max(0, Math.round(_uLogo * 0.55) + 16);
        const padL = (_posNorm === 'left') ? reserve : 0;
        const padR = (_posNorm === 'right') ? reserve : 0;
        return `
          <div class="b2-femco-headrow" style="padding-left:${padL}px;padding-right:${padR}px">
            <div class="b2-femco-logo" style="${logoOnlyStyle}">${logoHtml}</div>
            ${titleBlock}
          </div>
        `;
      }
      // 로고 + 대학명이 같이 이동
      const _alignStyle = (_posNorm === 'left')
        ? 'justify-content:flex-start'
        : (_posNorm === 'right') ? 'justify-content:flex-end' : 'justify-content:center';
      const _logoEl = `<div class="b2-femco-logo" style="transform:translate(${LOGO_OFF_X}px,${LOGO_OFF_Y}px)">${logoHtml}</div>`;
      if (_tposNorm === 'left') {
        return `<div class="b2-femco-headrow" style="${_alignStyle}">${titleBlock}${_logoEl}</div>`;
      }
      if (_tposNorm === 'right') {
        return `<div class="b2-femco-headrow" style="${_alignStyle}">${_logoEl}${titleBlock}</div>`;
      }
      if (_tposNorm === 'top') {
        return `<div class="b2-femco-headcol" style="${_alignStyle}">${titleBlock}${_logoEl}</div>`;
      }
      // bottom (default)
      return `<div class="b2-femco-headcol" style="${_alignStyle}">${_logoEl}${titleBlock}</div>`;
    })();

    // 자동 레이아웃(인원수/화면폭)에 따라 대학별로 rows/colWidth를 다르게 적용
    const _lay = autoLayout ? _autoLayoutForCount(all.length) : {rowsPerCol, colWidth};

    const _posToXY = (p)=>{
      const t = String(p||'center');
      const m = {
        'center':[50,50],'top':[50,0],'bottom':[50,100],'left':[0,50],'right':[100,50],
        'top left':[0,0],'top right':[100,0],'bottom left':[0,100],'bottom right':[100,100]
      };
      return m[t] || [50,50];
    };
    const [px,py]=_posToXY(_bgCfg.pos);
    const ox = parseInt(_bgCfg.ox||0,10)||0;
    const oy = parseInt(_bgCfg.oy||0,10)||0;
    const _bgPos = `calc(${px}% + ${ox}px) calc(${py}% + ${oy}px)`;
    let _bgSize = 'cover';
    if(_bgCfg.sizeMode==='contain') _bgSize='contain';
    else if(_bgCfg.sizeMode==='pct') _bgSize=`${Math.max(10,Math.min(220,parseInt(_bgCfg.sizeVal||90,10)||90))}%`;
    else if(_bgCfg.sizeMode==='px') _bgSize=`${Math.max(30,Math.min(900,parseInt(_bgCfg.sizeVal||240,10)||240))}px`;
    const _bgAlpha = Math.max(0, Math.min(100, parseInt(_bgCfg.alpha||30,10)||0)) / 100;
    const _bgRepeat = ['no-repeat','repeat','repeat-x','repeat-y'].includes(_bgCfg.repeat) ? _bgCfg.repeat : 'no-repeat';

    const _bgLayer = (_bgIsImage && _bgUrl)
      ? `<img src="${toHttpsUrl(_bgUrl).replace(/"/g,'&quot;')}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:${_bgSize};object-position:${_bgPos};opacity:${_bgAlpha.toFixed(3)};pointer-events:none;z-index:0" onerror="this.style.display='none'">`
      : (_bgIsVideo || _bgIsEmbed)
        ? `<div style="position:absolute;inset:0;background-image:url('${_bgUrl.replace(/'/g,"%27")}');background-repeat:${_bgRepeat};background-size:${_bgSize};background-position:${_bgPos};opacity:${_bgAlpha.toFixed(3)};pointer-events:none;z-index:0"></div>`
        : '';
    const _ovLayer = (_bgIsImage && _bgUrl && BG_OVERLAY>0)
      ? `<div style="position:absolute;inset:0;background:linear-gradient(180deg, rgba(2,6,23,${OV_TOP.toFixed(3)}), rgba(2,6,23,${OV_BOT.toFixed(3)}));pointer-events:none;z-index:1"></div>`
      : '';

    h += `
      <section class="b2-femco-univ" style="position:relative;overflow:hidden;background:${col};">
        ${_bgLayer}${_ovLayer}
        <div class="b2-femco-head" style="position:relative;z-index:2;color:${textCol};padding-left:${_padL}px;padding-right:${_padR}px">
          <div class="b2-femco-countbox" style="color:${textCol};left:${_padL}px;${textCol==='#ffffff'?'text-shadow:0 1px 2px rgba(0,0,0,.45);':''}">
            <div>총 ${all.length}</div>
            <div>이사장 ${bossCnt}</div>
            <div>교수+코치 ${profCoachCnt}</div>
            <div>학생 ${studentCnt}</div>
          </div>
          ${headLayout}
        </div>

        <div class="b2-femco-body" style="position:relative;z-index:2;background:transparent;padding-left:${_padL}px;padding-right:${_padR}px">
          <div class="b2-femco-grid" style="--rowsPerCol:${_lay.rowsPerCol};--colWidth:${_lay.colWidth}px">
            ${list.map(p => {
              const safeName = (p.name || '').replace(/'/g, "\\'");
              const tier = p.tier || '?';
              const tierBg = tier && tier !== '?' ? (typeof getTierBtnColor === 'function' ? getTierBtnColor(tier) : '#64748b') : '#64748b';
              const tierFg = tier && tier !== '?' ? ((typeof getTierBtnTextColor === 'function' ? getTierBtnTextColor(tier) : '#fff') || '#fff') : '#fff';
              const roleLabel = (p.role || '').trim();
              const rcol = raceColor(p, col);
              return `
                <div class="b2-femco-item" onclick="openPlayerModal('${safeName}');event.stopPropagation();">
                  <div class="b2-femco-avatar">${femcoAvatarSquare(p, rcol)}</div>
                  <div class="b2-femco-text" style="${p.inactive ? 'opacity:.65' : ''};color:${textCol}">
                    <div class="b2-femco-tier">
                      <span class="b2-femco-tierbadge" style="background:${tierBg};color:${tierFg}">${tier}</span>
                    </div>
                    ${roleLabel ? `<div class="b2-femco-role">${roleLabel}</div>` : ''}
                    <div class="b2-femco-name">${p.name || ''}</div>
                    <div><span class="b2-femco-race-pill" style="color:${rcol};border-color:${rcol}88;background:${textCol==='#ffffff'?'rgba(0,0,0,.28)':'rgba(255,255,255,.92)'};box-shadow:0 1px 2px rgba(0,0,0,.18)">${raceLabel(p)}</span></div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </section>
    `;
  });

  h += `</div>`;
  return h;
}

// ─────────────────────────────────────────────────────────────
// ➕ 스트리머 등록(관리자 전용, Players 탭)
// - 저장 시 즉시 반영(save()+render())
// - 저장 후 입력값 초기화 → 연속 등록 가능
// ─────────────────────────────────────────────────────────────
function openB2PlayerCreateModal() {
  if (!isLoggedIn || (typeof isSubAdmin !== 'undefined' && isSubAdmin)) return;
  if (document.getElementById('b2-player-create-modal')) return;

  const univs = (typeof univCfg !== 'undefined' ? univCfg : []).map(u => u.name).filter(Boolean);
  const tierOpts = (typeof TIERS !== 'undefined' && Array.isArray(TIERS) ? TIERS : ['0','1','2','3','4','5','6','7','8','유스']);
  const roleOpts = ['학생','코치','교수','총장','이사장'];

  const modal = document.createElement('div');
  modal.id = 'b2-player-create-modal';
  modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:var(--z-modal-5)';
  modal.innerHTML = `
    <style>
      @media (max-width:480px){
        #b2-player-create-modal > div{ padding:18px 16px calc(18px + env(safe-area-inset-bottom,0px)) !important; width:100% !important; max-width:100% !important; max-height:92vh !important; border-radius:18px !important; }
        #b2-player-create-modal div[style*="grid-template-columns:140px 1fr"]{ grid-template-columns:1fr !important; gap:5px !important; margin-bottom:14px !important; }
        #b2-player-create-modal input, #b2-player-create-modal select{
          font-size:16px !important; min-height:44px !important; padding:10px 12px !important; width:100%; box-sizing:border-box;
        }
      }
    </style>
    <div style="background:var(--white);border-radius:16px;padding:24px;max-width:560px;width:92%;max-height:84vh;overflow-y:auto;box-shadow:0 10px 40px rgba(0,0,0,0.3)">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:18px">
        <h3 style="margin:0;font-size:18px;font-weight:900;color:var(--text1)">🎬 스트리머 등록</h3>
        <button onclick="document.getElementById('b2-player-create-modal').remove()" style="background:none;border:none;font-size:20px;cursor:pointer;color:var(--gray-l)">✕</button>
      </div>

      <div id="b2-newplayer-msg" style="font-size:12px;color:var(--gray-l);margin-bottom:12px">저장 후 자동으로 입력칸이 초기화되어 연속 등록할 수 있습니다.</div>

      <div style="display:grid;grid-template-columns:140px 1fr;gap:10px;align-items:center;margin-bottom:12px">
        <div style="font-size:13px;font-weight:800;color:var(--text2)">이름</div>
        <input id="b2-newplayer-name" type="text" placeholder="예: 홍길동" style="padding:8px 12px;border:1px solid var(--border2);border-radius:10px;font-size:13px">
      </div>

      <div style="display:grid;grid-template-columns:140px 1fr;gap:10px;align-items:center;margin-bottom:12px">
        <div style="font-size:13px;font-weight:800;color:var(--text2)">대학</div>
        <select id="b2-newplayer-univ" style="padding:8px 12px;border:1px solid var(--border2);border-radius:10px;font-size:13px">
          <option value="">(선택)</option>
          ${univs.map(u=>`<option value="${u}">${u}</option>`).join('')}
        </select>
      </div>

      <div style="display:grid;grid-template-columns:140px 1fr;gap:10px;align-items:center;margin-bottom:12px">
        <div style="font-size:13px;font-weight:800;color:var(--text2)">직급</div>
        <select id="b2-newplayer-role" style="padding:8px 12px;border:1px solid var(--border2);border-radius:10px;font-size:13px">
          ${roleOpts.map(r=>`<option value="${r}"${r==='학생'?' selected':''}>${r}</option>`).join('')}
        </select>
      </div>

      <div style="display:grid;grid-template-columns:140px 1fr;gap:10px;align-items:center;margin-bottom:12px">
        <div style="font-size:13px;font-weight:800;color:var(--text2)">종족</div>
        <select id="b2-newplayer-race" style="padding:8px 12px;border:1px solid var(--border2);border-radius:10px;font-size:13px">
          <option value="P">프로토스</option>
          <option value="T">테란</option>
          <option value="Z">저그</option>
          <option value="N" selected>미정</option>
        </select>
      </div>

      <div style="display:grid;grid-template-columns:140px 1fr;gap:10px;align-items:center;margin-bottom:12px">
        <div style="font-size:13px;font-weight:800;color:var(--text2)">티어</div>
        <select id="b2-newplayer-tier" style="padding:8px 12px;border:1px solid var(--border2);border-radius:10px;font-size:13px">
          <option value="?" selected>미정</option>
          ${tierOpts.map(t=>`<option value="${t}">${t}</option>`).join('')}
        </select>
      </div>

      <div style="display:grid;grid-template-columns:140px 1fr;gap:10px;align-items:center;margin-bottom:12px">
        <div style="font-size:13px;font-weight:800;color:var(--text2)">채널 URL</div>
        <input id="b2-newplayer-channel" type="text" placeholder="https://..." style="padding:8px 12px;border:1px solid var(--border2);border-radius:10px;font-size:13px">
      </div>

      <div style="display:grid;grid-template-columns:140px 1fr;gap:10px;align-items:center;margin-bottom:12px">
        <div style="font-size:13px;font-weight:800;color:var(--text2)">프로필 이미지 1</div>
        <input id="b2-newplayer-photo" type="text" placeholder="https://... (base64 불가)" style="padding:8px 12px;border:1px solid var(--border2);border-radius:10px;font-size:13px">
      </div>

      <div style="display:grid;grid-template-columns:140px 1fr;gap:10px;align-items:center;margin-bottom:4px">
        <div style="font-size:13px;font-weight:800;color:var(--text2)">프로필 이미지 2</div>
        <input id="b2-newplayer-photo2" type="text" placeholder="https://... (선택)" style="padding:8px 12px;border:1px solid var(--border2);border-radius:10px;font-size:13px">
      </div>
      <div style="font-size:11px;color:var(--gray-l);margin:0 0 14px 150px">※ 2번 이미지는 이미지별(Players) 메인에서 1초 후 자동 교체용</div>

      <div style="display:flex;gap:10px;margin-top:18px">
        <button onclick="document.getElementById('b2-player-create-modal').remove()" style="flex:1;padding:10px 16px;background:var(--surface);border:1px solid var(--border2);border-radius:10px;color:var(--text2);font-size:13px;font-weight:700;cursor:pointer">닫기</button>
        <button onclick="saveB2NewPlayer()" style="flex:1;padding:10px 16px;background:var(--blue);border:1px solid var(--blue);border-radius:10px;color:#fff;font-size:13px;font-weight:800;cursor:pointer">저장</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

function saveB2NewPlayer() {
  const msg = document.getElementById('b2-newplayer-msg');
  const name = (document.getElementById('b2-newplayer-name')?.value || '').trim();
  const univ = (document.getElementById('b2-newplayer-univ')?.value || '').trim();
  const role = (document.getElementById('b2-newplayer-role')?.value || '').trim();
  const race = (document.getElementById('b2-newplayer-race')?.value || 'N').trim();
  const tier = (document.getElementById('b2-newplayer-tier')?.value || '?').trim();
  const channelUrl = (document.getElementById('b2-newplayer-channel')?.value || '').trim();
  const photo = (document.getElementById('b2-newplayer-photo')?.value || '').trim();
  const photo2 = (document.getElementById('b2-newplayer-photo2')?.value || '').trim();

  if (!name) { alert('이름은 필수입니다.'); return; }
  if (players.find(p => p.name === name)) { alert('이미 존재하는 이름입니다: ' + name); return; }
  if (photo && photo.startsWith('data:')) { alert('❌ base64 이미지(data:...)는 저장/동기화가 실패할 수 있어 금지입니다. URL을 사용하세요.'); return; }

  const p = {
    name,
    univ: univ || '무소속',
    role: role || '학생',
    race,
    tier,
    channelUrl: channelUrl || undefined,
    photo: photo || undefined,
    secondProfileFile: photo2 || undefined,
  };
  players.push(p);
  save();

  // [FIX] 전체 render() 대신 #b2-content만 다시 그려서, 등록 때마다
  // 이미 캐시된 다른 스트리머들의 프로필 이미지가 재로딩되는 것처럼 보이는 문제를 방지.
  const _b2ContentEl = document.getElementById('b2-content');
  if (_b2ContentEl && typeof _b2FemcoView === 'function') {
    _b2ContentEl.innerHTML = _b2FemcoView();
    try{ if(typeof injectUnivIcons === 'function') injectUnivIcons(_b2ContentEl); }catch(e){}
  } else {
    render();
  }

  // 입력 초기화(연속 등록)
  ['b2-newplayer-name','b2-newplayer-channel','b2-newplayer-photo','b2-newplayer-photo2'].forEach(id=>{
    const el = document.getElementById(id); if(el) el.value = '';
  });
  const tierSel = document.getElementById('b2-newplayer-tier'); if(tierSel) tierSel.value = '?';
  const raceSel = document.getElementById('b2-newplayer-race'); if(raceSel) raceSel.value = 'N';
  const roleSel = document.getElementById('b2-newplayer-role'); if(roleSel) roleSel.value = '학생';

  if (msg) { msg.style.color = '#16a34a'; msg.textContent = `✅ 저장됨: ${name} (다음 스트리머를 계속 등록할 수 있습니다)`; }
}

// ─────────────────────────────────────────────────────────────
// 🧩 펨코현황 이미지 저장
// - 저장: 현재 렌더된 펨코현황(전체 1장) 캡처
// - 전체 저장: 동일하지만 파일명을 "전체"로 명확히
// ─────────────────────────────────────────────────────────────
async function saveB2FemcoAllImg(){
  return _saveB2FemcoInternal();
}

async function _saveB2FemcoInternal(){
  const btnSel = '[onclick="saveB2FemcoAllImg()"]';
  const btn = document.querySelector(btnSel);
  if (btn) { btn.disabled = true; btn.textContent = '⏳...'; }
  try{
    const a = document.createElement('a');
    const supportsDownload = ('download' in a);
    const ua = String(navigator.userAgent||'');
    const isIOS = /iPad|iPhone|iPod/i.test(ua);
    const isInApp = /KAKAOTALK|Instagram|FBAN|FBAV|NAVER|Whale|Line/i.test(ua);
    if(!supportsDownload || isIOS || isInApp){
      const w = window.open('', '_blank');
      if(w){
        try{
          w.document.write('<html><head><meta charset="utf-8"><title>이미지 생성 중...</title></head>'
            + '<body style="margin:0;font-family:sans-serif;background:#111;color:#fff;padding:14px">'
            + '펨코스타일 이미지 생성 중입니다... 잠시만 기다려주세요.'
            + '</body></html>');
          w.document.close();
        }catch(e){}
        window.__captureDlWin = w;
      }
    }
  }catch(e){}

  const tmpDiv = document.createElement('div');
  // 현재 펨코현황과 동일한 스타일로 전체를 1장으로 캡처
  tmpDiv.style.cssText = `position:fixed;left:-9999px;top:0;padding:24px;background:#0b1220;box-sizing:border-box;`;
  tmpDiv.innerHTML = _b2FemcoView(); // 현재 설정(localStorage) 반영됨
  document.body.appendChild(tmpDiv);
  // 설정/버튼류는 저장 이미지에서 제거
  tmpDiv.querySelectorAll('.b2-femco-subnav,.b2-femco-panel,.no-export,.no-export-movebtns').forEach(el => el.remove());

  await new Promise(r => setTimeout(r, 120));
  try{
    if (typeof injectUnivIcons === 'function') injectUnivIcons(tmpDiv);
  }catch(e){
    console.warn('[saveB2FemcoAllImg] 대학 아이콘 주입 실패:', e.message);
  }

  try{
    if (typeof _imgToDataUrls === 'function') {
      await _imgToDataUrls(tmpDiv, 12000);
    }
  }catch(e){}
  try{
    if (typeof _waitForImages === 'function') {
      await _waitForImages(tmpDiv, 1500);
    }
  }catch(e){}

  const h = tmpDiv.scrollHeight + 32;
  const w = tmpDiv.scrollWidth;
  const fname = '펨코현황판_전체_' + new Date().toISOString().slice(0,10) + '.png';

  try{
    console.log('[펨코] 이미지 저장 시작');
    if (typeof window._captureAndSave !== 'function') throw new Error('이미지 저장 기능을 불러오지 못했습니다.');
    await window._captureAndSave(tmpDiv, w, h, fname);
    
  }catch(e){
    console.error('[펨코현황 이미지 저장 실패]', e);
    alert('❌ 펨코스타일 이미지 저장 실패\n\n' + (e.message || '알 수 없는 오류가 발생했습니다.'));
  }finally{
    document.body.removeChild(tmpDiv);
    if (btn) { btn.disabled = false; btn.textContent = '💾 전체 저장'; }
  }
}

function _b2UnivBlock(univName, col, members, forExport=false) {
  // Safety check for undefined university name
  if (!univName) {
    return `<div style="border-radius:14px;border:2px dashed #ccc55;padding:16px 18px;background:#f5f5f5;display:flex;align-items:center;gap:10px;opacity:.7">
      <span style="font-weight:900;font-size:15px;color:#999;">[Unknown University]</span>
      <span style="font-size:11px;color:var(--gray-l)"> university name is undefined</span>
    </div>`;
  }
  
  const uCfg = univCfg.find(x => x.name === univName) || {};
  const iconUrl = uCfg.icon || uCfg.img || UNIV_ICONS[univName] || '';
  const textCol = _b2ContrastColor(col);
  const lightCol = col + _b2AlphaHex(b2BgAlpha);
  const labelCol = col + _b2AlphaHex(b2LabelAlpha);
  const _hasBgImg = !!uCfg.bgImg;
  const _softPanel = 'linear-gradient(180deg,rgba(255,255,255,.98),rgba(248,250,252,.94))';
  const _softBorder = _hasBgImg ? 'rgba(255,255,255,.18)' : 'rgba(255,255,255,.55)';
  const _rowPanelBg = _hasBgImg
    ? 'linear-gradient(180deg,rgba(255,255,255,.00),rgba(248,250,252,.00))'
    : _softPanel;
  const _memoPanelBg = _hasBgImg
    ? 'linear-gradient(180deg,rgba(255,255,255,.12),rgba(248,250,252,.04))'
    : _softPanel;
  const _rowPanelBorder = _hasBgImg ? 'rgba(255,255,255,.04)' : _softBorder;
  const _rowPanelShadow = _hasBgImg ? 'none' : '0 10px 18px rgba(15,23,42,.04)';

  // 멤버 없을 때 빈 블록
  if (!members.length) {
    return `<div style="border-radius:14px;border:2px dashed ${col}55;padding:16px 18px;background:${lightCol};display:flex;align-items:center;gap:10px;opacity:.7">
      ${iconUrl?`<img src="${toHttpsUrl(iconUrl)}" style="width:var(--su_univ_logo_size,36px);height:var(--su_univ_logo_size,36px);object-fit:contain;border-radius:var(--su_univ_logo_radius,10px)" onerror="this.style.display='none'">`:''}
      <span style="font-weight:900;font-size:15px;color:${col};cursor:pointer" onclick="if(typeof openUnivModal==='function')openUnivModal('${univName}')">${univName}</span>
      <span style="font-size:11px;color:var(--gray-l)">등록된 선수 없음</span>
    </div>`;
  }

  // 직책 그룹
  const roledMembers = members.filter(p => _B2_ROLE_ORDER.includes(p.role||''));
  roledMembers.sort((a,b) => _b2RoleRank(a) - _b2RoleRank(b));

  // 티어 그룹
  const tieredMembers = members.filter(p => !_B2_ROLE_ORDER.includes(p.role||''));
  const tierGroups = {};
  tieredMembers.forEach(p => {
    const t = p.tier || '?';
    if (!tierGroups[t]) tierGroups[t] = [];
    tierGroups[t].push(p);
  });
  const orderedTierKeys = TIERS.filter(t => tierGroups[t]).concat(
    Object.keys(tierGroups).filter(t => !TIERS.includes(t))
  );

  // 사이드 패널 (현황판 memoImgs/memo) — _tableRow 정의 전에 계산해야 padding-right에 사용 가능
  const _smemo = uCfg.memo || '';
  const _simgs = (uCfg.memoImgs||[]).concat(uCfg.memoImg?[uCfg.memoImg]:[]);
  const hasSide = !!((_smemo||_simgs.length));

  // 새 레이아웃: 왼쪽 라벨 열(대학색) + 오른쪽 스트리머 열(연한 배경)
  const _tableRow = (label, isRole, chips) => `
    <div data-b2-univ-row="1" class="b2-univ-row" style="display:flex;align-items:stretch;gap:0;margin-bottom:8px">
      <div class="b2-univ-row-label" style="background:${labelCol}!important;min-width:70px;width:70px;display:flex;align-items:center;justify-content:center;padding:10px 6px;flex-shrink:0;border-radius:16px 0 0 16px;border:1px solid ${col}33;border-right:none;box-shadow:inset 0 1px 0 rgba(255,255,255,.28)">
        <span style="font-size:11px;font-weight:900;color:${col};text-align:center;line-height:1.35;word-break:keep-all;letter-spacing:-.01em">${label}</span>
      </div>
      <div class="b2-univ-row-body" style="flex:1;min-width:0;background:${_rowPanelBg};padding:10px 12px;border-radius:0 16px 16px 0;border:1px solid ${_rowPanelBorder};box-shadow:${_rowPanelShadow}">
        ${chips}
      </div>
    </div>`;

  // 같은 직책끼리 묶어서 1행
  const roleGroups = {};
  const roleOrder = [];
  roledMembers.forEach(p => {
    const r = p.role || '';
    if (!roleGroups[r]) { roleGroups[r] = []; roleOrder.push(r); }
    roleGroups[r].push(p);
  });
  const _bgPos = uCfg.bgImgPos || 'center center';
  const _bgSize = uCfg.bgImgSize || 'auto';
  const _bgOpacityNum = (uCfg.bgImgAlpha ?? b2BgImgAlpha) / 100;
  const _bgOpacity = (_hasBgImg ? Math.max(0.64, _bgOpacityNum + 0.08) : _bgOpacityNum).toFixed(2);
  const _uKeyRaw = String(univName||'').trim();
  const _uKey = _uKeyRaw.toUpperCase();
  const _logoOverlayCfg = (() => {
    const def = { wmGlobalOn: 1, wmOn: 1, wmScale: 150, wmRight: 120, wmBottom: 30, bgScale: 100 };
    try{
      const raw = String(localStorage.getItem('su_b2_univ_logo_overlay_v1') || '').trim();
      const parsed = raw ? (JSON.parse(raw) || {}) : {};
      const d = (parsed && parsed.default && typeof parsed.default === 'object') ? parsed.default : {};
      const per = (parsed && parsed.perUniv && typeof parsed.perUniv === 'object') ? parsed.perUniv : {};
      const over = (_uKeyRaw && per && per[_uKeyRaw] && typeof per[_uKeyRaw] === 'object') ? per[_uKeyRaw] : {};
      const out = Object.assign({}, def, d, over);
      out.wmGlobalOn = (out.wmGlobalOn==null) ? 1 : (Number(out.wmGlobalOn) ? 1 : 0);
      out.wmOn = (out.wmOn==null) ? 1 : (Number(out.wmOn) ? 1 : 0);
      out.wmScale = Math.max(50, Math.min(250, parseInt(out.wmScale||150, 10) || 150));
      out.wmRight = Math.max(0, Math.min(260, parseInt(out.wmRight||120, 10) || 120));
      out.wmBottom = Math.max(0, Math.min(160, parseInt(out.wmBottom||30, 10) || 30));
      out.bgScale = Math.max(60, Math.min(120, parseInt(out.bgScale||100, 10) || 100));
      return out;
    }catch(e){
      return def;
    }
  })();
  const _logoUnivNames = ['늇캐슬','뉴캣슬','캄몬스타즈','케이대','엠비대','와플대','수술대','흑카데미'];
  const _isMonstarName = _uKeyRaw.includes('몬스타') || _uKey.includes('MONSTAR');
  const _bgIsLogo =
    (_uKey === 'HM' || _uKey === 'DM' || _uKey === 'SSG' || _uKey === 'JSA' || _uKey === 'BGM') ||
    (_logoUnivNames.includes(_uKeyRaw) || _isMonstarName);
  const _bgLogoPos = '44% 50%';
  const _bgLogoSizeBase = (() => {
    const isSmall =
      (_uKey === 'JSA' || _uKey === 'BGM') ||
      _logoUnivNames.includes(_uKeyRaw) ||
      _isMonstarName;
    if (_uKey === 'JSA' || _uKeyRaw === '흑카데미') return 'min(72%,620px) auto';
    if (_uKeyRaw === '수술대' || _uKeyRaw === '엠비대' || _uKeyRaw === '케이대') return 'min(84%,740px) auto';
    return isSmall ? 'min(78%,680px) auto' : 'min(86%,760px) auto';
  })();
  const _bgLogoSize = (() => {
    const sc = (_logoOverlayCfg.bgScale || 100) / 100;
    if (sc === 1) return _bgLogoSizeBase;
    const m = String(_bgLogoSizeBase||'').match(/min\(\s*(\d+)\s*%\s*,\s*(\d+)\s*px\s*\)/i);
    if (!m) return _bgLogoSizeBase;
    const pct = Math.max(10, Math.min(100, Math.round(parseInt(m[1],10) * sc)));
    const px = Math.max(80, Math.min(1200, Math.round(parseInt(m[2],10) * sc)));
    return `min(${pct}%,${px}px) auto`;
  })();
  const _bgOpacity2 = _bgIsLogo ? String(Math.min(0.48, parseFloat(_bgOpacity)||0.48).toFixed(2)) : _bgOpacity;
  const _profileViewMode = _b2GetUnivProfileViewMode();
  const bgImgHtml = uCfg.bgImg
    ? forExport
      ? (_bgIsLogo
        ? `<img src="${uCfg.bgImg}" crossorigin="anonymous" style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:${_bgLogoSize.replace(' auto','')};max-width:760px;max-height:78%;height:auto;object-fit:contain;object-position:${_bgLogoPos};opacity:${_bgOpacity2};pointer-events:none;z-index:0" onerror="this.style.display='none'">`
        : `<img src="${uCfg.bgImg}" crossorigin="anonymous" class="b2-fit-auto" data-fit-kind="bg" data-fit-mode="${_bgSize}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:${_bgSize==='auto'?'cover':_bgSize};object-position:${_bgPos};opacity:${_bgOpacity2};pointer-events:none;z-index:0" onload="_b2ApplyBgAutoSizing(this)">`)
      : (_bgIsLogo
        ? `<div class="b2-bg-layer" data-bg-src="${String(uCfg.bgImg).replace(/"/g,'&quot;')}" data-bg-pos="${_bgLogoPos}" style="position:absolute;inset:0;opacity:${_bgOpacity2};pointer-events:none;z-index:0;background-position:${_bgLogoPos};background-size:${_bgLogoSize};background-repeat:no-repeat"></div>`
        : `<div class="b2-bg-layer" data-bg-src="${String(uCfg.bgImg).replace(/"/g,'&quot;')}" data-bg-pos="${String(_bgPos).replace(/"/g,'&quot;')}" data-bg-size-mode="${_bgSize}" style="position:absolute;inset:0;opacity:${_bgOpacity2};pointer-events:none;z-index:0;background-position:${_bgPos};background-size:${_bgSize==='auto'?'cover':_bgSize};background-repeat:no-repeat"></div>`)
    : '';

  let rows = '';
  let _tableHeadShown = false;
  roleOrder.forEach(role => {
    const group = roleGroups[role];
    const chips = _b2RenderUnivGroupCards(group, col, true, _profileViewMode, _profileViewMode==='table' && _tableHeadShown);
    if (_profileViewMode==='table' && group.length) _tableHeadShown = true;
    rows += _tableRow(role, true, chips);
  });
  orderedTierKeys.forEach(tier => {
    const group = tierGroups[tier];
    group.sort((a,b) => (a.name||'').localeCompare(b.name||'', 'ko', {sensitivity:'base'}));
    const chips = _b2RenderUnivGroupCards(group, col, false, _profileViewMode, _profileViewMode==='table' && _tableHeadShown);
    if (_profileViewMode==='table' && group.length) _tableHeadShown = true;
    rows += _tableRow(tier, false, chips);
  });
  const sidePanelHtml = hasSide ? `<div style="margin-top:10px;background:${_memoPanelBg};padding:12px;box-sizing:border-box;overflow:hidden;border-radius:18px;border:1px solid ${_softBorder};box-shadow:0 14px 26px rgba(15,23,42,.06)">
    <div style="font-size:11px;font-weight:900;color:${col};margin-bottom:${(_simgs.length||_smemo)?'10px':'0'}">사이드 메모</div>
    ${_simgs.map((src,i)=>`<img src="${src}" style="width:100%;max-width:260px;border-radius:12px;${(i<_simgs.length-1||_smemo)?'margin-bottom:8px;':''}display:block;object-fit:contain;border:1px solid rgba(148,163,184,.14);background:#fff" onerror="this.style.display='none'">`).join('')}
    ${_smemo?`<div style="font-size:11px;color:#334155;white-space:pre-wrap;line-height:1.65;margin-top:${_simgs.length?'8px':'0'}">${_smemo}</div>`:''}
  </div>` : '';
  const _wmSpec = (() => {
    const kRaw = String(univName||'').trim();
    const k = kRaw.toUpperCase();
    if (k === 'HM' || k === 'DM' || k === 'SSG') return { pct: 20, max: 148, op1: '.34', op0: '.24' };
    if (k === 'JSA' || kRaw === '흑카데미') return { pct: 22, max: 160, op1: '.36', op0: '.26', right: 66, bottom: 28 };
    if (
      k === 'JSA' || k === 'BGM' ||
      _logoUnivNames.includes(kRaw) ||
      kRaw.includes('몬스타') || k.includes('MONSTAR')
    ) {
      return { pct: 26, max: 182, op1: '.36', op0: '.26', right: 46, bottom: 28 };
    }
    return { pct: 22, max: 160, op1: '.36', op0: '.26' };
  })();
  const _wmScale = (_logoOverlayCfg.wmScale || 100) / 100;
  const _wmPct = Math.max(6, Math.min(60, Math.round(_wmSpec.pct * _wmScale)));
  const _wmMax = Math.max(60, Math.min(520, Math.round(_wmSpec.max * _wmScale)));
  const _wmRightBase = (typeof _wmSpec.right === 'number') ? _wmSpec.right : 18;
  const _wmBottomBase = (typeof _wmSpec.bottom === 'number') ? _wmSpec.bottom : 22;
  const _wmRight = (typeof _logoOverlayCfg.wmRight === 'number') ? _logoOverlayCfg.wmRight : _wmRightBase;
  const _wmBottom = (typeof _logoOverlayCfg.wmBottom === 'number') ? _logoOverlayCfg.wmBottom : _wmBottomBase;
  const _wmMaxH = Math.round(_wmMax * 0.70);
  const _wmOn = ((_logoOverlayCfg.wmGlobalOn==null)?true:!!Number(_logoOverlayCfg.wmGlobalOn)) && ((_logoOverlayCfg.wmOn==null)?true:!!Number(_logoOverlayCfg.wmOn));
  const bodyContent = `<div class="b2-bg-host" style="position:relative;overflow:hidden;background:${_hasBgImg?'transparent':'linear-gradient(180deg,rgba(255,255,255,.92),rgba(248,250,252,.82))'}">
    ${bgImgHtml}
    ${(_wmOn && iconUrl)?`<img src="${toHttpsUrl(iconUrl)}" aria-hidden="true" style="position:absolute;right:${_wmRight}px;bottom:${_wmBottom}px;width:min(${_wmPct}%,${_wmMax}px);max-width:${_wmMax}px;max-height:${_wmMaxH}px;opacity:${_hasBgImg?_wmSpec.op1:_wmSpec.op0};object-fit:contain;pointer-events:none;z-index:0;filter:drop-shadow(0 12px 28px rgba(15,23,42,.18))" onerror="this.style.display='none'">`:''}
    <div data-b2-univ-content="1" style="position:relative;z-index:1;padding:16px 20px 22px 16px;background:${_hasBgImg?'transparent':'transparent'}">
      <div>${rows}</div>
      ${sidePanelHtml}
    </div>
  </div>`;

  const _ubCreatedRaw = String(uCfg.createdAt || uCfg.created || uCfg.createDate || uCfg.since || uCfg.startDate || '').trim();
  const _ubCreatedLabel = (() => {
    if (!_ubCreatedRaw) return '';
    const raw = String(_ubCreatedRaw).trim();
    let m = raw.match(/^(\d{4})[.\-\/](\d{2})[.\-\/](\d{2})/);
    if (!m) m = raw.match(/^(\d{4})(\d{2})(\d{2})/);
    if (!m) return raw.slice(0, 10);
    return `${m[1]}.${m[2]}.${m[3]}`;
  })();

  // 하단 메모/이미지 (bMemo/bMemoImgs)
  const _bnote = uCfg.bMemo || '';
  const _bimgs = (uCfg.bMemoImgs||[]).concat(uCfg.bMemoImg?[uCfg.bMemoImg]:[]);
  const _bimgHtmls = _bimgs.map(src=>`<img class="b2-bottom-img" src="${src}" style="border-radius:12px;display:inline-block;border:1px solid rgba(148,163,184,.14);background:#fff" onerror="this.style.display='none'">`).join('');
  const bottomSection = (_bnote||_bimgs.length) ? `<div style="padding:14px 16px 16px;background:${_hasBgImg?'linear-gradient(180deg,rgba(255,255,255,.28),rgba(248,250,252,.14))':'linear-gradient(180deg,rgba(255,255,255,.92),rgba(248,250,252,.86))'};border-top:1px solid rgba(148,163,184,.16)">
    <div style="font-size:11px;font-weight:900;color:${col};margin-bottom:${(_bimgHtmls||_bnote)?'10px':'0'}">하단 메모</div>
    ${_bimgHtmls?`<div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:${_bnote?'8px':'0'}">${_bimgHtmls}</div>`:''}
    ${_bnote?`<div style="font-size:12px;color:#334155;white-space:pre-wrap;line-height:1.7">${_bnote}</div>`:''}
  </div>` : '';

  return `
    <div data-b2card="${univName.replace(/"/g,'&quot;')}" style="border-radius:22px;overflow:hidden;border:1px solid rgba(148,163,184,.16);background:linear-gradient(180deg,rgba(255,255,255,.98),rgba(248,250,252,.96));box-shadow:0 18px 32px rgba(15,23,42,.06)">
      <div style="background:linear-gradient(135deg,${col} 0%,${col}dd 100%);padding:16px 16px 14px;position:relative;overflow:hidden">
        <div style="position:absolute;inset:0;background:linear-gradient(145deg,rgba(255,255,255,${_hasBgImg?'.08':'.18'}),rgba(255,255,255,0) 58%);pointer-events:none"></div>
        <div style="display:flex;align-items:stretch;gap:12px;position:relative;z-index:1">
          ${iconUrl?`<img src="${toHttpsUrl(iconUrl)}" style="width:clamp(56px,var(--su_univ_logo_size,64px),76px);height:clamp(56px,var(--su_univ_logo_size,64px),76px);object-fit:contain;border-radius:var(--su_univ_logo_radius,16px);flex-shrink:0;cursor:pointer;background:rgba(255,255,255,.22);border:1px solid rgba(255,255,255,.28);padding:6px;box-shadow:0 14px 26px rgba(15,23,42,.12)" onclick="if(typeof openUnivModal==='function')openUnivModal('${univName}')" onerror="this.style.display='none'">`:''}
          <div style="min-width:0;flex:1;display:flex;flex-direction:column;gap:7px">
            <div style="display:flex;align-items:flex-start;gap:10px;justify-content:space-between;flex-wrap:wrap">
              <div style="min-width:0;flex:1">
                <div style="display:flex;align-items:center;gap:8px;flex-wrap:nowrap;min-width:0">
                  <span style="font-weight:950;font-size:20px;color:${textCol};cursor:pointer;letter-spacing:-.03em;line-height:1.08;min-width:0;flex:0 1 auto;max-width:min(420px,62%);overflow:hidden;text-overflow:ellipsis;white-space:nowrap" onclick="if(typeof openUnivModal==='function')openUnivModal('${univName}')">${univName}</span>
                  <span style="display:inline-flex;align-items:center;gap:6px;flex-shrink:0;white-space:nowrap">
                    <span style="background:${textCol}1f;color:${textCol};font-size:11px;font-weight:800;padding:4px 9px;border-radius:999px;border:1px solid ${textCol}26;cursor:pointer;box-shadow:inset 0 1px 0 rgba(255,255,255,.06);white-space:nowrap" onclick="event.stopPropagation();openB2MemberBreakdown(this,'${univName}')">${members.length}명</span>
                    ${_ubCreatedLabel?`<span style="background:${textCol}18;color:${textCol};font-size:10px;font-weight:900;padding:4px 8px;border-radius:999px;border:1px solid ${textCol}22;box-shadow:inset 0 1px 0 rgba(255,255,255,.06);flex-shrink:0;white-space:nowrap">${_ubCreatedLabel}</span>`:''}
                  </span>
                </div>
                ${uCfg.memo2?`<div style="margin-top:5px;font-size:10px;font-weight:700;color:${textCol}dd;line-height:1.45;display:flex;align-items:center;gap:6px;flex-wrap:wrap">
                  <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:0 1 auto;max-width:48%;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.14);border-radius:999px;padding:3px 8px">${uCfg.memo2}</span>
                </div>`:''}
              </div>
              <div style="display:flex;align-items:flex-start;gap:6px;flex-wrap:wrap;justify-content:flex-end">
                ${(uCfg.championships||0)>0?`<span style="display:flex;gap:1px;flex-shrink:0;padding:5px 8px;border-radius:999px;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.12)">${'<span style="font-size:15px">⭐</span>'.repeat(uCfg.championships)}</span>`:''}
                ${isLoggedIn?`<button class="no-export" onclick="event.stopPropagation();_b2ToggleCard(this,'${univName.replace(/'/g,"\\'")}')" style="background:${textCol}22;border:1px solid ${textCol}33;color:${textCol};font-size:11px;cursor:pointer;padding:4px 9px;border-radius:10px;flex-shrink:0;font-weight:800;z-index:var(--z-dropdown);position:relative;box-shadow:inset 0 1px 0 rgba(255,255,255,.08)" title="${_b2Collapsed.has(univName)?'펼치기':'접기'}">${_b2Collapsed.has(univName)?'▶ 접기 해제':'▼ 접기'}</button>`:''}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="b2-card-body" style="${_b2Collapsed.has(univName)?'display:none':''}">
        ${bodyContent}
        ${bottomSection}
      </div>
    </div>`;
}

/* ── 무소속 뷰 ── */
function _b2FreeView() {
  // [FIX-FREE-2] 대학 해체 시 "소속 선수 이동" 옵션을 껐으면(confirmDissolve, movePlayers=false)
  // 선수의 p.univ 값이 해체된 대학명 그대로 남습니다. 이 경우 대학별 화면(univList)에는
  // 해체된 대학이 빠져 있어 표시되지 않고, 기존 무소속 필터는 pu가 ''나 '무소속'일 때만
  // 통과시켜서 이 선수들이 어느 현황판 화면에도 노출되지 않고 사라지는 문제가 있었습니다.
  // → 해체된 대학 소속(미이동) 선수도 무소속 목록에 포함되도록 조건을 넓혔습니다.
  const _freeDissSet = new Set((typeof univCfg !== 'undefined' ? univCfg : []).filter(u=>u.dissolved).map(u=>String(u.name||'').trim()));
  const freeMembers = players.filter(p => {
    const pu = String(p?.univ||'').trim();
    const isFreeOrOrphaned = !pu || pu === '무소속' || _freeDissSet.has(pu);
    return isFreeOrOrphaned && !p.hidden && !p.retired && !p.hideFromBoard;
  });
  if (!freeMembers.length) return `<div style="text-align:center;color:var(--text3);padding:40px">무소속 멤버가 없습니다</div>`;

  const roledFree   = freeMembers.filter(p => _B2_ROLE_ORDER.includes(p.role||''));
  roledFree.sort((a,b) => _b2RoleRank(a) - _b2RoleRank(b));
  const tieredFree  = freeMembers.filter(p => !_B2_ROLE_ORDER.includes(p.role||''));

  const tierGroups = {};
  tieredFree.forEach(p => {
    const t = p.tier || '?';
    if (!tierGroups[t]) tierGroups[t] = [];
    tierGroups[t].push(p);
  });
  const orderedTierKeys = TIERS.filter(t => tierGroups[t]).concat(
    Object.keys(tierGroups).filter(t => !TIERS.includes(t))
  );

  // 이번주 전적 계산
  const _fvNow=new Date(),_fvDay=_fvNow.getDay();
  const _fvMon=new Date(_fvNow); _fvMon.setDate(_fvNow.getDate()+(_fvDay===0?-6:1-_fvDay));
  const _fvFromN=parseInt(_fvMon.toISOString().slice(0,10).replace(/-/g,''));
  const _fvToN  =parseInt(_fvNow.toISOString().slice(0,10).replace(/-/g,''));
  const _fvDN   =s=>parseInt(String(s||'').replace(/[-\.]/g,''))||0;
  let _fvTw=0,_fvTl=0,_fvWw=0,_fvWl=0,_fvActive=0;
  tieredFree.forEach(p=>{
    let acted=false;
    (Array.isArray(p.history)?p.history:[]).forEach(h=>{
      if(h.result==='승')_fvTw++; else if(h.result==='패')_fvTl++;
      const d=_fvDN(h.date||h.d||'');
      if(d>=_fvFromN&&d<=_fvToN){if(h.result==='승')_fvWw++;else if(h.result==='패')_fvWl++;acted=true;}
    });
    if(acted)_fvActive++;
  });
  const _fvTg=_fvTw+_fvTl;
  const _fvWr=_fvTg>0?Math.round(_fvTw/_fvTg*100):null;
  const _fvWrc=_fvWr===null?'#94a3b8':_fvWr>=60?'#10b981':_fvWr>=40?'#f59e0b':'#ef4444';
  const _fvWwT=_fvWw+_fvWl;

  // 종족 카운트
  const rCts={P:0,T:0,Z:0,'?':0};
  tieredFree.forEach(p=>{ const r=p.race||'?'; rCts[r in rCts?r:'?']++; });
  const rTotal=tieredFree.length||1;

  const defCol = '#64748b';
  const _fvMode = _b2GetFreeViewMode();
  const _fvModeBtn = (mode, label) => `
    <button type="button" class="no-export" onclick="_b2SetFreeViewMode('${mode}')" style="padding:4px 11px;border-radius:999px;border:1px solid ${_fvMode===mode?'rgba(255,255,255,.7)':'rgba(255,255,255,.22)'};background:${_fvMode===mode?'rgba(255,255,255,.24)':'rgba(255,255,255,.08)'};color:#fff;font-size:10px;font-weight:900;cursor:pointer">${label}</button>`;
  let h = `<div style="border-radius:22px;overflow:hidden;border:1px solid rgba(148,163,184,.16);background:linear-gradient(180deg,rgba(255,255,255,.99),rgba(248,250,252,.96));box-shadow:0 18px 32px rgba(15,23,42,.06)">
    <div style="background:linear-gradient(135deg,${defCol} 0%,#475569 100%);padding:14px 16px 12px;position:relative;overflow:hidden">
      <div style="position:absolute;inset:0;background:linear-gradient(145deg,rgba(255,255,255,.14),rgba(255,255,255,0) 58%);pointer-events:none"></div>
      <div style="position:relative;z-index:1">
      <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">
        <span style="font-weight:950;font-size:18px;color:#fff;letter-spacing:-.02em">🚶 무소속</span>
        <span style="background:rgba(255,255,255,.18);color:#fff;font-size:11px;font-weight:800;padding:4px 9px;border-radius:999px;border:1px solid rgba(255,255,255,.15)">${freeMembers.length}명</span>
        ${_fvActive>0?`<span style="background:rgba(255,165,0,.35);color:#fef08a;font-size:10px;font-weight:900;padding:4px 8px;border-radius:999px;border:1px solid rgba(255,255,255,.12)">🔥 이번주 ${_fvActive}명</span>`:''}
        ${_fvWwT>0?`<span style="background:rgba(0,0,0,.18);color:${_fvWw>=_fvWl?'#bbf7d0':'#fecaca'};font-size:10px;font-weight:900;padding:4px 8px;border-radius:999px;border:1px solid rgba(255,255,255,.12)">${_fvWw}승${_fvWl}패</span>`:''}
        ${_fvWr!==null?`<span style="background:rgba(0,0,0,.18);color:${_fvWrc};font-size:10px;font-weight:900;padding:4px 8px;border-radius:999px;border:1px solid rgba(255,255,255,.12)" title="통산 ${_fvTw}승 ${_fvTl}패">📊 통산 ${_fvWr}%</span>`:''}
        <div style="margin-left:auto;display:flex;gap:4px;align-items:center">
          ${rCts.P?`<span style="font-size:10px;background:rgba(124,58,237,.4);color:#ede9fe;padding:4px 8px;border-radius:999px;font-weight:900;border:1px solid rgba(255,255,255,.12)">🔮${rCts.P}</span>`:''}
          ${rCts.T?`<span style="font-size:10px;background:rgba(2,132,199,.4);color:#e0f2fe;padding:4px 8px;border-radius:999px;font-weight:900;border:1px solid rgba(255,255,255,.12)">⚔️${rCts.T}</span>`:''}
          ${rCts.Z?`<span style="font-size:10px;background:rgba(5,150,105,.4);color:#d1fae5;padding:4px 8px;border-radius:999px;font-weight:900;border:1px solid rgba(255,255,255,.12)">🦎${rCts.Z}</span>`:''}
        </div>
      </div>
      <div style="display:flex;height:5px;border-radius:3px;overflow:hidden;margin-top:8px;background:rgba(255,255,255,.15)">
        ${rCts.P?`<div style="flex:${rCts.P};background:#7c3aed;opacity:.85"></div>`:''}
        ${rCts.T?`<div style="flex:${rCts.T};background:#0284c7;opacity:.85"></div>`:''}
        ${rCts.Z?`<div style="flex:${rCts.Z};background:#059669;opacity:.85"></div>`:''}
        ${rCts['?']?`<div style="flex:${rCts['?']};background:rgba(255,255,255,.2)"></div>`:''}
      </div>
      <div style="display:flex;align-items:center;gap:5px;flex-wrap:wrap;margin-top:10px;padding-top:10px;border-top:1px dashed rgba(255,255,255,.18)" class="no-export">
        <span style="font-size:10px;font-weight:800;color:rgba(255,255,255,.65);margin-right:2px">🖼️ 모드</span>
        ${_fvModeBtn('default','기본')}
        ${_fvModeBtn('stat','📊 통계카드')}
        ${_fvModeBtn('table','🗂️ 테이블')}
      </div>
      </div>
    </div>
    <div style="background:linear-gradient(180deg,rgba(255,255,255,.96),rgba(248,250,252,.90));padding:16px">`;

  if (_fvMode === 'stat') {
    const _allFree = roledFree.concat(orderedTierKeys.flatMap(t => tierGroups[t].slice().sort((a,b)=>(a.name||'').localeCompare(b.name||'','ko',{sensitivity:'base'}))));
    h += `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:14px">${_allFree.map(p => _b2LineupCard3(p, defCol)).join('')}</div>`;
  } else if (_fvMode === 'table') {
    const _allFree = roledFree.concat(orderedTierKeys.flatMap(t => tierGroups[t].slice().sort((a,b)=>(a.name||'').localeCompare(b.name||'','ko',{sensitivity:'base'}))));
    h += _b2LineupTable(_allFree, defCol);
  } else {
    const _frow = (labelEl, contentEl) => `<div style="display:flex;align-items:stretch;gap:0;margin-bottom:8px">${labelEl}<div style="flex:1;padding:10px 12px;background:linear-gradient(180deg,rgba(255,255,255,.98),rgba(248,250,252,.94));border:1px solid rgba(148,163,184,.14);border-left:none;border-radius:0 16px 16px 0;box-shadow:0 10px 18px rgba(15,23,42,.04)">${contentEl}</div></div>`;
    const _fl = (text, isRole) => `<span style="font-size:12px;font-weight:900;color:${isRole?defCol:'var(--text3)'};width:68px;min-width:68px;text-align:center;flex-shrink:0;display:inline-flex;align-items:center;justify-content:center;background:#64748b${_b2AlphaHex(b2LabelAlpha)}!important;border:1px solid rgba(100,116,139,.28);border-right:none;border-radius:16px 0 0 16px;padding:8px 6px;box-shadow:inset 0 1px 0 rgba(255,255,255,.2)">${text}</span>`;

    roledFree.forEach(p => {
      h += _frow(_fl(p.role||'', true), _b2PlayerRow(p, defCol));
    });
    orderedTierKeys.forEach(tier => {
      const group = tierGroups[tier];
      group.sort((a,b) => (a.name||'').localeCompare(b.name||'', 'ko', {sensitivity:'base'}));
      const col = getTierBtnColor(tier);
      h += _frow(_fl(tier, false), `<div style="display:flex;flex-wrap:wrap;gap:5px;padding:2px 0">${group.map(p => _b2NameTag(p, col, false)).join('')}</div>`);
    });
  }
  h += `</div></div>`;
  return h;
}

function _b2GetFreeViewMode() {
  try{
    const raw = String(localStorage.getItem('su_b2_free_view') || '').trim();
    return ['default','stat','table'].includes(raw) ? raw : 'default';
  }catch(e){
    return 'default';
  }
}

function _b2SetFreeViewMode(mode) {
  const nextMode = ['default','stat','table'].includes(String(mode||'')) ? String(mode) : 'default';
  try{ localStorage.setItem('su_b2_free_view', nextMode); }catch(e){}
  if (typeof render === 'function') render();
}


function openB2MemberBreakdown(el, univName) {
  const existing = document.getElementById('b2-mbp');
  if (existing) { const wasEl = existing._forEl; existing.remove(); if (wasEl === el) return; }
  const col = gc(univName);
  const members = players.filter(p => String(p?.univ||'').trim() === String(univName||'').trim() && !p.hidden && !p.retired && !p.hideFromBoard);
  const roled = members.filter(p => _B2_ROLE_ORDER.includes(p.role||''));
  const tiered = members.filter(p => !_B2_ROLE_ORDER.includes(p.role||''));
  const tierCounts = {};
  tiered.forEach(p => { const t = p.tier||'?'; tierCounts[t] = (tierCounts[t]||0)+1; });
  const orderedTiers = TIERS.filter(t => tierCounts[t]).concat(Object.keys(tierCounts).filter(t => !TIERS.includes(t)));
  const row = (label, val, c) => `<div style="display:flex;justify-content:space-between;align-items:center;gap:16px;padding:2px 0">
    <span style="color:${c||'var(--text2)'};font-size:12px">${label}</span>
    <span style="font-weight:700;color:var(--text1);font-size:12px">${val}명</span></div>`;
  const popup = document.createElement('div');
  popup.id = 'b2-mbp';
  popup.style.cssText = 'position:fixed;z-index:var(--z-top);background:linear-gradient(180deg,rgba(255,255,255,.99),rgba(248,250,252,.96));border:1px solid rgba(148,163,184,.16);border-radius:18px;box-shadow:0 16px 38px rgba(15,23,42,.16);padding:14px 15px;min-width:220px;backdrop-filter:blur(12px)';
  popup.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:10px">
      <div style="font-weight:900;font-size:14px;color:${col};letter-spacing:-.02em">${univName} 구성</div>
      <div style="font-size:11px;font-weight:900;color:var(--text3)">${members.length}명</div>
    </div>
    <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin-bottom:10px">
      <div style="padding:10px 11px;border-radius:14px;background:${col}12;border:1px solid ${col}22"><div style="font-size:10px;font-weight:900;color:var(--text3)">직책자</div><div style="margin-top:5px;font-size:18px;font-weight:1000;color:${col}">${roled.length}</div></div>
      <div style="padding:10px 11px;border-radius:14px;background:${col}0a;border:1px solid ${col}18"><div style="font-size:10px;font-weight:900;color:var(--text3)">일반 스트리머</div><div style="margin-top:5px;font-size:18px;font-weight:1000;color:var(--text1)">${tiered.length}</div></div>
    </div>
    ${row('직책자', roled.length)}
    ${row('일반 스트리머', tiered.length)}
    ${orderedTiers.length ? `<div style="border-top:1px solid var(--border2);margin:6px 0"></div>${orderedTiers.map(t=>row(t, tierCounts[t], getTierBtnColor(t))).join('')}` : ''}`;
  popup._forEl = el;
  document.body.appendChild(popup);
  const rect = el.getBoundingClientRect();
  popup.style.top = (rect.bottom + 6) + 'px';
  popup.style.left = rect.left + 'px';
  requestAnimationFrame(() => {
    if (rect.left + popup.offsetWidth > window.innerWidth - 8) popup.style.left = (rect.right - popup.offsetWidth) + 'px';
    if (rect.bottom + popup.offsetHeight + 6 > window.innerHeight) popup.style.top = (rect.top - popup.offsetHeight - 6) + 'px';
  });
  setTimeout(() => {
    function _c(e) { if (!popup.contains(e.target) && e.target !== el) { _close(); } }
    function _s() { _close(); }
    function _close() { popup.remove(); document.removeEventListener('click', _c); window.removeEventListener('scroll', _s, true); }
    document.addEventListener('click', _c);
    window.addEventListener('scroll', _s, {capture:true, once:true});
  }, 0);
}

async function saveB2Img() {
  const univList = _b2VisUnivs().filter(u => u.name !== '무소속');
  const targets = _b2SaveUniv === '전체' ? univList : univList.filter(u => u.name === _b2SaveUniv);
  if (!targets.length) { alert('저장할 대학이 없습니다.'); return; }

  const btn = document.querySelector('[onclick="saveB2Img()"]');
  if (btn) { btn.disabled = true; btn.textContent = '⏳...'; }

  const CARD_W = 720;
  const gap = 14;
  const PAD = 24;

  const tmpDiv = document.createElement('div');
  tmpDiv.style.cssText = `position:fixed;left:-9999px;top:0;padding:${PAD}px;background:#f0f2f5;box-sizing:border-box;width:${CARD_W + PAD * 2}px`;
  tmpDiv.innerHTML = `<style>.b2-bottom-img{max-width:160px;max-height:130px;object-fit:contain;}</style>
    <div style="display:flex;flex-direction:column;gap:${gap}px">
      ${targets.map(u => _b2UnivBlock(u.name, gc(u.name), players.filter(p => String(p?.univ||'').trim() === String(u.name||'').trim() && !p.hidden && !p.retired && !p.hideFromBoard), true)).join('')}
    </div>`;
  document.body.appendChild(tmpDiv);
  // no-export 요소 제거 (접기 버튼 등)
  tmpDiv.querySelectorAll('.no-export,.no-export-movebtns').forEach(el => el.remove());

  await new Promise(r => setTimeout(r, 100));
  injectUnivIcons(tmpDiv);

  const h = tmpDiv.scrollHeight + 32;
  const w = tmpDiv.scrollWidth;
  const fname = (_b2SaveUniv === '전체' ? '대학별현황판_전체' : `대학별현황판_${_b2SaveUniv}`) + '_' + new Date().toISOString().slice(0,10) + '.png';

  try {
    if (typeof _captureAndSave !== 'function') throw new Error('이미지 저장 기능을 불러오지 못했습니다.');
    await _captureAndSave(tmpDiv, w, h, fname);
  } catch(e) {
    console.error('[현황판 이미지 저장 실패]', e);
    alert('❌ 이미지 저장 실패\n\n' + (e.message || '알 수 없는 오류가 발생했습니다.'));
  }
  finally {
    document.body.removeChild(tmpDiv);
    if (btn) { btn.disabled = false; btn.textContent = '📷 이미지저장'; }
  }
}

/* ══════════════════════════════════════
   대학 라인업 포스터 ("STARTING XI" 스타일)
══════════════════════════════════════ */
function _b2PastelBg(hex, ratio) {
  const { r, g, b } = (typeof _hexToRgbObj === 'function') ? _hexToRgbObj(hex) : { r: 100, g: 116, b: 139 };
  const t = (typeof ratio === 'number') ? ratio : 0.10;
  const mix = c => Math.round(255 * (1 - t) + c * t);
  return `rgb(${mix(r)},${mix(g)},${mix(b)})`;
}

function _b2GetUnivProfileViewMode() {
  try{
    const raw = String(localStorage.getItem('su_b2_univ_profile_view') || '').trim();
    if (raw === 'card') return 'poster';
    if (raw === 'compact' || raw === 'media' || raw === 'board' || raw === 'split') return 'rank';
    return ['default','poster','rank','glass','table'].includes(raw) ? raw : 'default';
  }catch(e){
    return 'default';
  }
}

function _b2SetUnivProfileViewMode(mode) {
  const nextMode = ['default','poster','rank','glass','table'].includes(String(mode||'')) ? String(mode) : 'default';
  try{ localStorage.setItem('su_b2_univ_profile_view', nextMode); }catch(e){}
  if (typeof render === 'function') render();
}

function _b2UnivRankRow(p, accentCol, showBadge, idx) {
  const safeName = (p.name||'').replace(/'/g,"\\'");
  const photo = p.photo ? toThumbUrl(p.photo,42) : '';
  const raceLetter = (p.race && p.race!=='N') ? p.race : '?';
  const raceCol = { T:'#2563eb', P:'#d97706', Z:'#7c3aed' }[p.race] || '#475569';
  const badgeTxt = showBadge ? (p.tier || p.role || '') : '';
  const badgeBg = (p.tier && typeof getTierBtnColor === 'function') ? getTierBtnColor(p.tier) : accentCol;
  const badgeFg = (p.tier && typeof getTierBtnTextColor === 'function') ? (getTierBtnTextColor(p.tier) || '#fff') : '#fff';
  const win = Number(p.win||0), loss = Number(p.loss||0), games = win+loss;
  const wr = games ? Math.round(win/games*100) : null;
  const wrCol = wr==null ? '#94a3b8' : (wr>=50 ? '#16a34a' : '#dc2626');
  const recordTxt = games ? `${win}승 ${loss}패` : '기록 없음';
  const shapeStyle = 'border-radius:var(--su_profile_radius,50%);clip-path:var(--su_profile_clip,none);';
  return `
    <div style="display:flex;align-items:center;gap:12px;padding:9px 14px;border-radius:16px;border:1px solid ${accentCol}22;background:linear-gradient(120deg,${accentCol}14 0%,${accentCol}05 100%);box-shadow:0 6px 16px rgba(15,23,42,.06);cursor:pointer;transition:transform .16s ease,box-shadow .16s ease,border-color .16s ease"
      onclick="openPlayerModal('${safeName}')"
      onmouseenter="this.style.transform='translateX(3px)';this.style.boxShadow='0 10px 22px rgba(15,23,42,.14)';this.style.borderColor='${accentCol}55'"
      onmouseleave="this.style.transform='';this.style.boxShadow='0 6px 16px rgba(15,23,42,.06)';this.style.borderColor='${accentCol}22'">
      <div style="flex-shrink:0;width:20px;text-align:center;font-size:11px;font-weight:900;color:${accentCol};opacity:.75">${idx}</div>
      <div style="width:42px;height:42px;flex-shrink:0;${shapeStyle}overflow:hidden;border:2px solid ${accentCol}55;background:${accentCol}22;box-shadow:0 4px 10px ${accentCol}26">
        ${photo
          ? `<img src="${photo}" crossorigin="anonymous" loading="lazy" decoding="async" style="width:100%;height:100%;object-fit:cover;object-position:top center" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"><div style="display:none;align-items:center;justify-content:center;width:100%;height:100%;font-size:14px;font-weight:1000;color:${accentCol}">${raceLetter}</div>`
          : `<div style="display:flex;align-items:center;justify-content:center;width:100%;height:100%;font-size:14px;font-weight:1000;color:${accentCol}">${raceLetter}</div>`
        }
      </div>
      <div style="min-width:0;flex:0 0 auto;width:112px">
        <div style="display:flex;align-items:center;gap:6px;min-width:0">
          <span style="font-size:13px;font-weight:950;color:var(--text1);letter-spacing:-.02em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;${p.inactive?'opacity:.6':''}">${p.name||''}</span>
        </div>
        <div style="display:flex;align-items:center;gap:5px;margin-top:3px;flex-wrap:wrap">
          ${(p.race&&p.race!=='N')?`<span style="display:inline-flex;padding:1px 6px;border-radius:999px;background:${raceCol};color:#fff;font-size:9px;font-weight:900">${p.race}</span>`:''}
          ${badgeTxt?`<span style="display:inline-flex;padding:1px 6px;border-radius:999px;background:${badgeBg};color:${badgeFg};font-size:9px;font-weight:900">${badgeTxt}</span>`:''}
        </div>
      </div>
      <div style="flex:1;min-width:100px;display:flex;flex-direction:column;gap:4px">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:6px">
          <span style="font-size:10px;font-weight:800;color:var(--text3);white-space:nowrap">${recordTxt}</span>
          <span style="font-size:11px;font-weight:950;color:${wrCol};flex-shrink:0">${wr==null?'-':wr+'%'}</span>
        </div>
      </div>
    </div>`;
}

// 대학별 뷰 - 신규 "글래스" 모드 전용 카드 (사진은 그대로 노출, 하단에 연한 프로스티드 글래스 정보바)
function _b2UnivGlassCard(p, accentCol, showBadge) {
  const safeName = (p.name||'').replace(/'/g,"\\'");
  const photo = p.photo ? toScaledUrl(p.photo,300) : '';
  const raceLetter = (p.race && p.race!=='N') ? p.race : '?';
  const raceCol = { T:'#2563eb', P:'#d97706', Z:'#7c3aed' }[p.race] || '#475569';
  const badgeTxt = showBadge ? (p.tier || p.role || '') : '';
  const badgeBg = (p.tier && typeof getTierBtnColor === 'function') ? getTierBtnColor(p.tier) : accentCol;
  const win = Number(p.win||0), loss = Number(p.loss||0), games = win+loss;
  const wr = games ? Math.round(win/games*100) : null;
  const wrCol = wr==null ? '#94a3b8' : (wr>=50 ? '#16a34a' : '#dc2626');
  return `
    <div style="width:150px;max-width:100%;border-radius:22px;overflow:hidden;cursor:pointer;background:rgba(255,255,255,.6);box-shadow:0 10px 22px rgba(15,23,42,.12);border:1px solid ${accentCol}2e;transition:transform .18s,box-shadow .18s"
      onclick="openPlayerModal('${safeName}')"
      onmouseenter="this.style.transform='translateY(-4px)';this.style.boxShadow='0 16px 28px rgba(15,23,42,.2)'"
      onmouseleave="this.style.transform='';this.style.boxShadow='0 10px 22px rgba(15,23,42,.12)'">
      <div style="position:relative;width:100%;aspect-ratio:.86;overflow:hidden;background:linear-gradient(160deg,${accentCol}40,${accentCol}12)">
        ${photo
          ? `<img src="${photo}" crossorigin="anonymous" loading="lazy" decoding="async" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:top center" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"><div style="display:none;position:absolute;inset:0;align-items:center;justify-content:center;font-size:34px;font-weight:1000;color:${accentCol}">${raceLetter}</div>`
          : `<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:34px;font-weight:1000;color:${accentCol}">${raceLetter}</div>`
        }
        ${(p.race&&p.race!=='N')?`<div style="position:absolute;top:7px;right:7px;padding:2px 8px;border-radius:999px;background:${raceCol}e6;color:#fff;font-size:10px;font-weight:900;box-shadow:0 2px 6px rgba(0,0,0,.22)">${p.race}</div>`:''}
        ${badgeTxt?`<div style="position:absolute;top:7px;left:7px;padding:2px 8px;border-radius:999px;background:rgba(255,255,255,.85);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);color:${badgeBg};font-weight:900;font-size:10px;box-shadow:0 2px 6px rgba(0,0,0,.12)">${badgeTxt}</div>`:''}
      </div>
      <div style="padding:9px 11px 10px;background:rgba(255,255,255,.7);backdrop-filter:blur(10px) saturate(1.3);-webkit-backdrop-filter:blur(10px) saturate(1.3);border-top:1px solid ${accentCol}20">
        <div style="color:var(--text1);font-weight:950;font-size:13px;letter-spacing:-.02em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${p.name||''}</div>
        <div style="margin-top:6px;display:flex;align-items:center;justify-content:flex-end;gap:6px">
          <span style="font-size:11px;font-weight:900;color:${wrCol};flex-shrink:0">${wr==null?'-':wr+'%'}</span>
        </div>
      </div>
    </div>`;
}

// 대학별 뷰 - 신규 "프레임" 모드 전용 카드 (컬러 테두리 + 솔리드 컬러 하단바)
function _b2UnivFrameCard(p, accentCol, showBadge) {
  const safeName = (p.name||'').replace(/'/g,"\\'");
  const photo = p.photo ? toScaledUrl(p.photo,300) : '';
  const raceLetter = (p.race && p.race!=='N') ? p.race : '?';
  const raceCol = { T:'#2563eb', P:'#d97706', Z:'#7c3aed' }[p.race] || '#475569';
  const badgeTxt = showBadge ? (p.tier || p.role || '') : '';
  const badgeBg = (p.tier && typeof getTierBtnColor === 'function') ? getTierBtnColor(p.tier) : accentCol;
  const badgeFg = (p.tier && typeof getTierBtnTextColor === 'function') ? (getTierBtnTextColor(p.tier) || '#fff') : '#fff';
  const win = Number(p.win||0), loss = Number(p.loss||0), games = win+loss;
  const wr = games ? Math.round(win/games*100) : null;
  return `
    <div style="width:150px;max-width:100%;border-radius:20px;overflow:hidden;cursor:pointer;border:3px solid ${accentCol};box-shadow:0 10px 20px rgba(15,23,42,.14);transition:transform .16s,box-shadow .16s"
      onclick="openPlayerModal('${safeName}')"
      onmouseenter="this.style.transform='translateY(-3px)';this.style.boxShadow='0 14px 26px rgba(15,23,42,.22)'"
      onmouseleave="this.style.transform='';this.style.boxShadow='0 10px 20px rgba(15,23,42,.14)'">
      <div style="position:relative;width:100%;aspect-ratio:.86;overflow:hidden;background:linear-gradient(160deg,${accentCol}45,${accentCol}14)">
        ${photo
          ? `<img src="${photo}" crossorigin="anonymous" loading="lazy" decoding="async" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:top center" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"><div style="display:none;position:absolute;inset:0;align-items:center;justify-content:center;font-size:34px;font-weight:1000;color:${accentCol}">${raceLetter}</div>`
          : `<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:34px;font-weight:1000;color:${accentCol}">${raceLetter}</div>`
        }
        ${badgeTxt?`<div style="position:absolute;top:0;left:0;padding:3px 10px 3px 8px;border-radius:0 0 10px 0;background:${badgeBg};color:${badgeFg};font-weight:900;font-size:10px">${badgeTxt}</div>`:''}
        ${(p.race&&p.race!=='N')?`<div style="position:absolute;top:7px;right:7px;padding:2px 8px;border-radius:999px;background:${raceCol}e6;color:#fff;font-size:10px;font-weight:900;box-shadow:0 2px 6px rgba(0,0,0,.22)">${p.race}</div>`:''}
      </div>
      <div style="padding:8px 10px 9px;background:${accentCol};text-align:center">
        <div style="color:#fff;font-weight:950;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-shadow:0 1px 3px rgba(0,0,0,.22)">${p.name||''}</div>
        <div style="margin-top:4px;font-size:10px;font-weight:800;color:rgba(255,255,255,.92)">${games?`${win}승 ${loss}패 · ${wr}%`:'기록 없음'}</div>
      </div>
    </div>`;
}

function _b2UnivPhotoCard(p, accentCol, showBadge) {
  const safeName = (p.name||'').replace(/'/g,"\\'");
  const photo = p.photo ? toScaledUrl(p.photo,300) : '';
  const raceLetter = (p.race && p.race!=='N') ? p.race : '?';
  const shapeStyle = 'border-radius:var(--su_profile_radius,50%);clip-path:var(--su_profile_clip,none);';
  const badgeTxt = showBadge ? (p.tier || p.role || '') : '';
  const badgeBg = (p.tier && typeof getTierBtnColor === 'function') ? getTierBtnColor(p.tier) : accentCol;
  const badgeFg = (p.tier && typeof getTierBtnTextColor === 'function') ? (getTierBtnTextColor(p.tier) || '#fff') : '#fff';
  const raceCol = { T:'#2563eb', P:'#d97706', Z:'#7c3aed' }[p.race] || '#475569';
  const backdrop = photo
    ? `<img src="${photo}" crossorigin="anonymous" loading="lazy" decoding="async" aria-hidden="true" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:top center;transform:scale(1.16);filter:blur(14px) saturate(1.08) brightness(.88);opacity:.88" onerror="this.style.display='none'">
       <div style="position:absolute;inset:0;background:linear-gradient(180deg,${accentCol}24 0%,rgba(2,6,23,.12) 100%)"></div>`
    : `<div style="position:absolute;inset:0;background:linear-gradient(160deg,${accentCol}44 0%,${accentCol}18 100%)"></div>`;
  const photoHtml = photo
    ? `<img src="${photo}" crossorigin="anonymous" loading="lazy" decoding="async" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:top center" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
       <div style="position:absolute;inset:0;display:none;align-items:center;justify-content:center;font-size:34px;font-weight:1000;color:${accentCol};opacity:.78">${raceLetter}</div>`
    : `<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:34px;font-weight:1000;color:${accentCol};opacity:.78">${raceLetter}</div>`;
  return `
    <div style="position:relative;width:122px;max-width:100%;aspect-ratio:.78;${shapeStyle}overflow:hidden;border:1px solid rgba(255,255,255,.16);background:#0b1120;box-shadow:0 10px 20px rgba(15,23,42,.12);cursor:pointer;transition:transform .18s ease,box-shadow .18s ease" onclick="openPlayerModal('${safeName}')"
      onmouseenter="this.style.transform='translateY(-4px) scale(1.03)';this.style.boxShadow='0 16px 28px rgba(15,23,42,.24)'"
      onmouseleave="this.style.transform='';this.style.boxShadow='0 10px 20px rgba(15,23,42,.12)'">
      ${backdrop}
      ${photoHtml}
      ${p.race&&p.race!=='N'?`<div style="position:absolute;top:8px;right:8px;padding:2px 8px;border-radius:999px;background:${raceCol};color:#fff;font-size:10px;font-weight:900;z-index:2;box-shadow:0 2px 6px rgba(0,0,0,.26)">${p.race}</div>`:''}
      <div style="position:absolute;left:0;right:0;bottom:0;padding:9px 9px 10px;background:linear-gradient(180deg,rgba(2,6,23,0) 0%,rgba(2,6,23,.20) 30%,rgba(2,6,23,.62) 100%);z-index:2">
        ${badgeTxt?`<div style="margin-bottom:3px"><span style="display:inline-flex;align-items:center;padding:2px 7px;border-radius:999px;background:${badgeBg};color:${badgeFg};font-size:10px;font-weight:900;line-height:1.4">${badgeTxt}</span></div>`:''}
        <div style="color:#fff;font-size:12px;font-weight:950;letter-spacing:-.02em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-shadow:0 1px 4px rgba(0,0,0,.5)">${p.name||''}</div>
      </div>
    </div>`;
}

function _b2UnivDefaultTag(p, accentCol, showTier) {
  const safeName = (p.name||'').replace(/'/g,"\\'");
  const crewCol = p.crewName && typeof _gcCrew === 'function' ? (_gcCrew(p.crewName) || '') : '';
  return `
    <div class="b2-def-tag-item" style="display:flex;align-items:center;gap:8px;padding:4px 10px 4px 4px;border-radius:24px;cursor:pointer;transition:background .12s;white-space:nowrap;flex-shrink:0"
      onmouseover="this.style.background='${accentCol}14'"
      onmouseout="this.style.background='transparent'">
      <div onclick="openPlayerModal('${safeName}')" style="display:flex;align-items:center;gap:8px;flex:1;min-width:0">
      ${_b2Avatar(p, crewCol||accentCol, 58)}
      <span style="font-weight:800;font-size:20px;color:var(--text1);white-space:nowrap;${p.inactive?'opacity:.6':''}">${p.name||''}</span>
      ${p.race&&p.race!=='N'?`<span class="rbadge r${p.race}" style="font-size:11px;flex-shrink:0">${p.race}</span>`:''}
      ${showTier&&p.tier?`<span style="font-size:11px;font-weight:800;padding:2px 7px;border-radius:6px;background:${getTierBtnColor(p.tier)};color:${getTierBtnTextColor(p.tier)||'#fff'};flex-shrink:0">${p.tier}</span>`:''}
      ${p.inactive?'<span style="font-size:9px;background:#fff7ed;color:#9a3412;border-radius:4px;padding:1px 4px;font-weight:700;flex-shrink:0">⏸️</span>':''}
      </div>
    </div>`;
}

function _b2UnivHeatCard(p, accentCol) {
  const safeName = (p.name||'').replace(/'/g,"\\'");
  const photo = p.photo ? toThumbUrl(p.photo,112) : '';
  const raceLetter = (p.race && p.race!=='N') ? p.race : '?';
  const shapeStyle = 'border-radius:var(--su_profile_radius,50%);clip-path:var(--su_profile_clip,none);';
  return `<button type="button" title="${(p.name||'').replace(/"/g,'&quot;')}" onclick="openPlayerModal('${safeName}')" style="width:112px;height:112px;padding:0;border:none;${shapeStyle}overflow:hidden;background:${accentCol}22;box-shadow:0 8px 20px rgba(15,23,42,.09);cursor:pointer">
    ${photo ? `<img src="${photo}" crossorigin="anonymous" loading="lazy" decoding="async" style="width:100%;height:100%;object-fit:cover;object-position:top center" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"><span style="display:none;align-items:center;justify-content:center;width:100%;height:100%;font-size:32px;font-weight:1000;color:${accentCol}">${raceLetter}</span>` : `<span style="display:flex;align-items:center;justify-content:center;width:100%;height:100%;font-size:32px;font-weight:1000;color:${accentCol}">${raceLetter}</span>`}
  </button>`;
}

function _b2RenderUnivGroupCards(group, accentCol, showBadge, mode, hideTableHead) {
  const items = Array.isArray(group) ? group : [];
  if (mode === 'poster') {
    return `<div style="display:flex;flex-wrap:wrap;gap:14px">${items.map(p => _b2UnivPhotoCard(p, accentCol, showBadge)).join('')}</div>`;
  }
  if (mode === 'rank') {
    const _sorted = items.slice().sort((a,b) => {
      const aw=Number(a.win||0), al=Number(a.loss||0), ag=aw+al, awr=ag?aw/ag:-1;
      const bw=Number(b.win||0), bl=Number(b.loss||0), bg=bw+bl, bwr=bg?bw/bg:-1;
      if (bwr !== awr) return bwr - awr;
      if (bw !== aw) return bw - aw;
      return (a.name||'').localeCompare(b.name||'', 'ko', {sensitivity:'base'});
    });
    return `<div style="display:flex;flex-direction:column;gap:8px">${_sorted.map((p,i) => _b2UnivRankRow(p, accentCol, showBadge, i+1)).join('')}</div>`;
  }
  if (mode === 'glass') {
    return `<div style="display:flex;flex-wrap:wrap;gap:14px">${items.map(p => _b2UnivGlassCard(p, accentCol, showBadge)).join('')}</div>`;
  }
  if (mode === 'table') {
    return (typeof _b2LineupTable === 'function') ? _b2LineupTable(items, accentCol, '', '', hideTableHead) : '';
  }
  return `<div class="b2-def-tag-grid" style="display:grid;grid-template-columns:repeat(5,max-content);align-items:center;justify-content:start;column-gap:10px;row-gap:8px;max-width:100%;overflow-x:auto;overflow-y:hidden;padding-bottom:2px;scrollbar-width:thin">${items.map(p => _b2UnivDefaultTag(p, accentCol, showBadge)).join('')}</div>`;
}

// 라인업 카드 - 모드3 "사진+통계그리드형" 전용 스타일 (사진이 카드 상단을 꽉 채우는 풀블리드 레이아웃)
;(function _injectLineupCard3Style(){
  if(typeof document==='undefined') return;
  const prev = document.getElementById('b2-lineup-card3-style');
  if(prev) prev.remove();
  const s=document.createElement('style');
  s.id='b2-lineup-card3-style';
  s.textContent=[
    '.b2-lc3{position:relative;border-radius:18px;overflow:hidden;background:linear-gradient(165deg,var(--lc-col,#64748b)1f 0%,var(--lc-col,#64748b)08 34%,rgba(255,255,255,.98) 58%);box-shadow:0 4px 16px rgba(15,23,42,.16);cursor:pointer;transition:transform .18s ease,box-shadow .18s ease;border:1px solid var(--lc-col,#64748b)2e}',
    '.b2-lc3:hover{transform:translateY(-4px) scale(1.035);box-shadow:0 16px 30px rgba(15,23,42,.22);z-index:2}',
    '.b2-lc3-photo{position:relative;width:100%;aspect-ratio:.82;overflow:hidden;background:linear-gradient(160deg,var(--lc-col,#64748b)55 0%,var(--lc-col,#64748b)22 100%)}',
    '.b2-lc3-photo img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:top center}',
    '.b2-lc3-backdrop{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:top center;transform:scale(1.2);filter:blur(15px) saturate(1.1) brightness(.82)}',
    '.b2-lc3-fallback{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:40px;font-weight:1000;color:#fff;opacity:.85}',
    '.b2-lc3-overlay{position:absolute;left:0;right:0;bottom:0;z-index:2;padding:28px 12px 10px;text-align:left;background:linear-gradient(180deg,rgba(2,6,23,0) 0%,rgba(2,6,23,.30) 45%,rgba(2,6,23,.76) 100%)}',
    '.b2-lc3-tierchip{display:inline-block;padding:2px 8px;border-radius:999px;font-size:10px;font-weight:900;color:#fff;line-height:1.6;margin-bottom:4px}',
    '.b2-lc3-name{font-size:15px;font-weight:950;color:#fff;letter-spacing:-.02em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-shadow:0 1px 4px rgba(0,0,0,.5)}',
    '.b2-lc3-sub{font-size:10px;font-weight:800;color:rgba(255,255,255,.82);margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
    '.b2-lc3-grid{display:grid;grid-template-columns:1fr 1fr;gap:6px;padding:9px 10px 10px}',
    '.b2-lc3-box{border-radius:10px;padding:7px 4px;background:var(--lc-col,#64748b)14;text-align:center}',
    '.b2-lc3-box-value{font-size:13px;font-weight:950;color:#0f172a}',
    '.b2-lc3-box-label{font-size:10px;font-weight:800;color:#475569;margin-top:2px}'
  ].join('');
  document.head.appendChild(s);
})();

function _b2LineupCard3(p, col) {
  const safeName = (p.name||'').replace(/'/g,"\\'");
  const raceLetter = (p.race && p.race!=='N') ? p.race : '?';
  const photo = p.photo ? toScaledUrl(p.photo,300) : '';
  const win = Number(p.win||0), loss = Number(p.loss||0), games = win+loss;
  const wr = games ? Math.round(win/games*100) : null;
  const wrCol = wr==null ? '#0f172a' : (wr>=50 ? '#16a34a' : '#dc2626');
  const eloDefault = (typeof ELO_DEFAULT!=='undefined'?ELO_DEFAULT:1200);
  const elo = Number(p.elo || eloDefault);
  const eloCol = elo >= eloDefault ? '#2563eb' : '#dc2626';
  const points = Number(p.points||0);
  const tierCol = (p.tier && typeof getTierBtnColor==='function') ? getTierBtnColor(p.tier) : col;
  const tierTxt = (p.tier && typeof getTierBtnTextColor==='function') ? (getTierBtnTextColor(p.tier)||'#fff') : '#fff';
  let dateLine = '';
  try {
    const hist = (typeof _tpHistAllForPlayer==='function') ? _tpHistAllForPlayer(p) : [];
    const sorted = [...hist].sort((a,b)=>(typeof _tpDateNum==='function'?_tpDateNum(b?.date)-_tpDateNum(a?.date):0));
    if (sorted[0] && sorted[0].date) dateLine = `최근 기록 · ${sorted[0].date}`;
  } catch(e){}
  const boxes = [
    [games ? `${win}승 ${loss}패` : '기록 없음', '전적', '#0f172a'],
    [wr==null ? '-' : `${wr}%`, '승률', wrCol],
    [pS(points), '포인트', '#0f172a'],
    [elo, 'ELO', eloCol]
  ];
  return `<div class="b2-lc3" style="--lc-col:${col}" onclick="openPlayerModal('${safeName}')">
    <div class="b2-lc3-photo">
      ${photo
        ? `<img class="b2-lc3-backdrop" src="${photo}" crossorigin="anonymous" loading="lazy" decoding="async" aria-hidden="true" onerror="this.style.display='none'">
           <img src="${photo}" crossorigin="anonymous" loading="lazy" decoding="async" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:top center;z-index:1" onerror="this.style.display='none';this.previousElementSibling.style.display='none';this.nextElementSibling.style.display='flex'">
           <div class="b2-lc3-fallback" style="display:none;z-index:1">${raceLetter}</div>`
        : `<div class="b2-lc3-fallback">${raceLetter}</div>`}
      <div class="b2-lc3-overlay">
        ${p.tier?`<div><span class="b2-lc3-tierchip" style="background:${tierCol};color:${tierTxt}">${p.tier}</span></div>`:''}
        <div class="b2-lc3-name">${p.name||''}</div>
        ${(p.role||dateLine)?`<div class="b2-lc3-sub">${p.role||''}${p.role&&dateLine?' · ':''}${dateLine}</div>`:''}
      </div>
    </div>
    <div class="b2-lc3-grid">
      ${boxes.map(([value,label,vcol])=>`<div class="b2-lc3-box"><div class="b2-lc3-box-value" style="color:${vcol}">${value}</div><div class="b2-lc3-box-label">${label}</div></div>`).join('')}
    </div>
  </div>`;
}

// 라인업 카드 - 모드4 "테이블형" (헤더가 있는 데이터 테이블, 가장 촘촘하고 다른 모드와 구조 자체가 다름)
;(function _injectLineupCard4Style(){
  if(typeof document==='undefined') return;
  const prev = document.getElementById('b2-lineup-card4-style');
  if(prev) prev.remove();
  const s=document.createElement('style');
  s.id='b2-lineup-card4-style';
  s.textContent=[
    '.b2-lc4-wrap{width:100%;overflow-x:auto;border-radius:14px}',
    '.b2-lc4{width:100%;border-collapse:separate;border-spacing:0;font-size:12px;min-width:520px}',
    '.b2-lc4 thead th{position:sticky;top:0;text-align:left;padding:9px 12px;font-size:10px;font-weight:900;color:#64748b;text-transform:uppercase;letter-spacing:.05em;background:transparent!important;background-image:none!important;border-bottom:1px solid rgba(0,0,0,.08);white-space:nowrap}',
    '.b2-lc4 thead th:first-child{border-radius:14px 0 0 0}',
    '.b2-lc4 thead th:last-child{border-radius:0 14px 0 0;text-align:right}',
    '.b2-lc4 tbody td{padding:7px 12px;border-bottom:1px solid rgba(0,0,0,.06);vertical-align:middle;background:transparent!important}',
    '.b2-lc4 tbody tr:last-child td{border-bottom:none}',
    '.b2-lc4 tbody tr:hover td{background:var(--lc-col,#64748b)16!important}',
    '.b2-lc4 tbody tr{cursor:pointer;position:relative;transition:transform .18s cubic-bezier(.2,.8,.2,1),box-shadow .18s ease;transform-origin:center center}',
    '.b2-lc4 tbody tr:hover{transform:scale(1.025);box-shadow:0 10px 22px rgba(15,23,42,.18);z-index:30}',
    '.b2-lc4 tbody tr:hover td{background:var(--white,#fff)!important}',
    '.b2-lc4-head{display:flex;align-items:center;gap:8px;padding:9px 12px}',
    '.b2-lc4-head img{width:24px;height:24px;object-fit:contain;border-radius:6px;flex-shrink:0}',
    '.b2-lc4-head span{font-size:12px;font-weight:900;color:#0f172a}',
    '.b2-lc4-namecell{display:flex;align-items:center;gap:9px;min-width:120px}',
    '.b2-lc4-avatar{position:relative;width:28px;height:28px;flex-shrink:0;border-radius:50%;overflow:hidden;border:1.5px solid var(--lc-col,#64748b)55;background:linear-gradient(160deg,var(--lc-col,#64748b)55,var(--lc-col,#64748b)22)}',
    '.b2-lc4-avatar img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:top center}',
    '.b2-lc4-fallback{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:1000;color:#fff}',
    '.b2-lc4-name{font-weight:900;color:#0f172a;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:130px}',
    '.b2-lc4-chip{display:inline-flex;align-items:center;padding:1px 8px;border-radius:999px;font-size:10px;font-weight:900;color:#fff;line-height:1.6;white-space:nowrap}',
    '.b2-lc4-wrcell{display:flex;align-items:center;justify-content:flex-end;gap:7px}',
    '.b2-lc4-bartrack{width:44px;height:5px;border-radius:999px;background:var(--lc-col,#64748b)18;overflow:hidden}',
    '.b2-lc4-barfill{height:100%;border-radius:999px}',
    '.b2-lc4-wr{font-weight:950;width:32px;text-align:right}'
  ].join('');
  document.head.appendChild(s);
})();

function _b2LineupTableRow(p, col) {
  const safeName = (p.name||'').replace(/'/g,"\\'");
  const raceLetter = (p.race && p.race!=='N') ? p.race : '?';
  const photo = p.photo ? toThumbUrl(p.photo,28) : '';
  const raceCol = { T:'#2563eb', P:'#d97706', Z:'#7c3aed' }[p.race] || '#94a3b8';
  const win = Number(p.win||0), loss = Number(p.loss||0), games = win+loss;
  const wr = games ? Math.round(win/games*100) : null;
  const wrCol = wr==null ? '#94a3b8' : (wr>=50 ? '#16a34a' : '#dc2626');
  const tierCol = (p.tier && typeof getTierBtnColor==='function') ? getTierBtnColor(p.tier) : col;
  const tierTxt = (p.tier && typeof getTierBtnTextColor==='function') ? (getTierBtnTextColor(p.tier)||'#fff') : '#fff';
  return `<tr onclick="openPlayerModal('${safeName}')">
    <td><div class="b2-lc4-namecell">
      <div class="b2-lc4-avatar">
        ${photo
          ? `<img src="${photo}" crossorigin="anonymous" loading="lazy" decoding="async" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"><div class="b2-lc4-fallback" style="display:none">${raceLetter}</div>`
          : `<div class="b2-lc4-fallback">${raceLetter}</div>`}
      </div>
      <span class="b2-lc4-name">${p.name||''}</span>
    </div></td>
    <td>${p.role || '일반'}</td>
    <td>${p.tier?`<span class="b2-lc4-chip" style="background:${tierCol};color:${tierTxt}">${p.tier}</span>`:'미정'}</td>
    <td>${(p.race&&p.race!=='N')?`<span class="b2-lc4-chip" style="background:${raceCol}">${p.race}</span>`:'-'}</td>
    <td>${games ? `${win}승 ${loss}패` : '기록 없음'}</td>
    <td><div class="b2-lc4-wrcell">
      <span class="b2-lc4-wr" style="color:${wrCol}">${wr==null?'-':wr+'%'}</span>
    </div></td>
  </tr>`;
}

function _b2LineupTable(members, col, iconUrl, univName, hideHead) {
  if (!members.length) return '';
  const headBar = iconUrl
    ? `<div class="b2-lc4-head"><img src="${toHttpsUrl(iconUrl)}" alt="" onerror="this.style.display='none'"><span>${univName||''}</span></div>`
    : '';
  return `<div class="b2-lc4-wrap" style="--lc-col:${col}">
    ${headBar}
    <table class="b2-lc4">
      ${hideHead ? '' : '<thead><tr><th>이름</th><th>역할</th><th>티어</th><th>종족</th><th>전적</th><th>승률</th></tr></thead>'}
      <tbody>${members.map(p => _b2LineupTableRow(p, col)).join('')}</tbody>
    </table>
  </div>`;
}

function _b2LineupCard(p, col, big, iconUrl) {
  const safeName = (p.name||'').replace(/'/g,"\\'");
  const raceLetter = (p.race && p.race!=='N') ? p.race : '?';
  const photo = p.photo ? toScaledUrl(p.photo,340) : '';
  const _raceCol = { T:'#2563eb', P:'#d97706', Z:'#7c3aed' }[p.race] || '#475569';
  const badgeTxt = big ? (p.role||'') : (p.tier||'');
  // 티어 배지 색상 — 스트리머탭 티어색상과 동일하게
  const _tierBadgeCol = (!big && p.tier && typeof getTierBtnColor==='function') ? getTierBtnColor(p.tier) : col;
  const _tierBadgeTxt = (!big && p.tier && typeof getTierBtnTextColor==='function') ? (getTierBtnTextColor(p.tier)||'#fff') : '#fff';
  // 배경 blur 레이어
  const _fillBackdrop = photo
    ? `<img src="${photo}" crossorigin="anonymous" loading="lazy" decoding="async" aria-hidden="true" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:top center;transform:scale(1.22);filter:blur(16px) saturate(1.15) brightness(.8);opacity:.85" onerror="this.style.display='none'">
       <div style="position:absolute;inset:0;background:linear-gradient(180deg,${col}33 0%,rgba(0,0,0,.18) 100%)"></div>`
    : `<div style="position:absolute;inset:0;background:linear-gradient(160deg,${col}44 0%,${col}1a 100%)"></div>`;
  // 메인 사진 (전체 꽉 채움, 모양 적용 없이 카드 자체 overflow:hidden으로 처리)
  const photoHtml = photo
    ? `<img src="${photo}" crossorigin="anonymous" loading="lazy" decoding="async" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:top center" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
       <div style="position:absolute;inset:0;display:none;align-items:center;justify-content:center;flex-direction:column;gap:6px">
         <div style="font-size:56px;font-weight:900;color:${col};opacity:.7">${raceLetter}</div>
       </div>`
    : `<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:6px">
         <div style="font-size:56px;font-weight:900;color:${col};opacity:.7">${raceLetter}</div>
       </div>`;
  // 종족 배지 — 우상단
  const _raceBadge = (p.race && p.race!=='N')
    ? `<div style="position:absolute;top:10px;right:10px;padding:3px 10px;border-radius:999px;background:${_raceCol};color:#fff;font-size:12px;font-weight:800;box-shadow:0 2px 8px rgba(0,0,0,.32);z-index:2;letter-spacing:.02em">${p.race}</div>`
    : '';
  const _nameBar = `
    <div style="position:absolute;bottom:0;left:0;right:0;z-index:2;padding:12px 14px 13px">
      ${badgeTxt?`<div style="margin-bottom:4px"><span style="background:${_tierBadgeCol};color:${_tierBadgeTxt};font-weight:900;font-size:13px;padding:2px 9px;border-radius:999px;white-space:nowrap;line-height:1.6;letter-spacing:-.01em">${badgeTxt}</span></div>`:''}
      <div style="color:#fff;font-weight:900;font-size:19px;letter-spacing:-.02em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-shadow:0 1px 4px rgba(0,0,0,.5)">${p.name||''}</div>
    </div>`;
  return `
    <div style="position:relative;cursor:pointer;border-radius:16px;overflow:hidden;background:${_b2PastelBg(col,0.10)};box-shadow:0 4px 16px rgba(15,23,42,.18);border:1px solid ${col}33;transition:transform .15s,box-shadow .15s" onclick="openPlayerModal('${safeName}')"
      onmouseenter="this.style.transform='translateY(-3px)';this.style.boxShadow='0 10px 26px rgba(15,23,42,.28)'"
      onmouseleave="this.style.transform='';this.style.boxShadow='0 4px 16px rgba(15,23,42,.18)'">
      <div style="position:relative;width:100%;aspect-ratio:3/4;overflow:hidden">
        ${_fillBackdrop}
        ${photoHtml}
        ${_raceBadge}
        ${_nameBar}
      </div>
    </div>`;
}

function _b2LineupPoster(univName, col, forExport=false) {
  if (!univName) return `<div style="text-align:center;color:var(--text3);padding:40px">대학을 선택해주세요</div>`;
  const uCfg = (typeof univCfg !== 'undefined' ? univCfg.find(x=>x.name===univName) : null) || {};
  const iconUrl = uCfg.icon || uCfg.img || UNIV_ICONS[univName] || '';
  const members = players.filter(p => String(p?.univ||'').trim() === String(univName||'').trim() && !p.hidden && !p.retired && !p.hideFromBoard);

  if (!members.length) {
    return `<div style="border-radius:18px;border:2px dashed ${col}55;padding:30px;background:${col}10;text-align:center;color:var(--text3)">등록된 선수가 없습니다</div>`;
  }

  // 보직(임원) 그룹 — 큰 카드로 상단에 배치
  const roleMembers = members.filter(p => _B2_ROLE_ORDER.includes(p.role||''));
  roleMembers.sort((a,b) => _b2RoleRank(a) - _b2RoleRank(b));

  // 일반 멤버 — 티어순
  const rosterMembers = members.filter(p => !_B2_ROLE_ORDER.includes(p.role||''));
  rosterMembers.sort((a,b) => {
    const ta = TIERS.indexOf(a.tier||''), tb = TIERS.indexOf(b.tier||'');
    const ra = ta>=0?ta:99, rb = tb>=0?tb:99;
    if (ra!==rb) return ra-rb;
    return (a.name||'').localeCompare(b.name||'', 'ko', {sensitivity:'base'});
  });

  const _lcMode = (typeof _b2LineupCardMode !== 'undefined') ? _b2LineupCardMode : 'default';
  const _cardFn = _lcMode === 'stat' ? _b2LineupCard3 : null;
  const _cardMinW = _lcMode === 'stat' ? 190 : 170;
  const _lcGridCols = (_lcMode === 'table') ? '1fr' : `repeat(auto-fill,minmax(${_cardMinW}px,1fr))`;
  const _lcGridGap = (_lcMode === 'table') ? 0 : 16;
  const roleCardsHtml = _lcMode === 'table'
    ? _b2LineupTable(roleMembers, col, iconUrl, univName)
    : roleMembers.map(p => _cardFn ? _cardFn(p, col) : _b2LineupCard(p, col, true, iconUrl)).join('');
  const rosterCardsHtml = _lcMode === 'table'
    ? _b2LineupTable(rosterMembers, col, roleMembers.length ? '' : iconUrl, univName)
    : rosterMembers.map(p => _cardFn ? _cardFn(p, col) : _b2LineupCard(p, col, false, iconUrl)).join('');

  const dateTxt = new Date().toISOString().slice(0,10).replace(/-/g,'.');

  // 종족 통계 — 로스터(일반 멤버) 기준
  const raceCount = { T: 0, P: 0, Z: 0 };
  rosterMembers.forEach(p => { if (raceCount.hasOwnProperty(p.race)) raceCount[p.race]++; });
  const _raceMeta = [
    { k:'T', ico:'⚔️', col:'#2563eb' },
    { k:'P', ico:'🔮', col:'#d97706' },
    { k:'Z', ico:'🦎', col:'#7c3aed' }
  ];
  const raceStatHtml = _raceMeta.filter(r => raceCount[r.k] > 0).map(r => `
    <span style="display:inline-flex;align-items:center;gap:4px;background:rgba(255,255,255,.14);border:1px solid rgba(255,255,255,.22);border-radius:999px;padding:5px 12px 5px 10px;color:#fff;font-size:12px;font-weight:800">
      <span style="font-size:12px">${r.ico}</span>${r.k} ${raceCount[r.k]}
    </span>`).join('');

  return `
    <div data-b2lineup="${univName.replace(/"/g,'&quot;')}" style="border-radius:24px;overflow:hidden;background:#0b1220;box-shadow:0 20px 40px rgba(15,23,42,.28)">
      <div style="padding:30px 30px 24px;position:relative;overflow:hidden;background:linear-gradient(135deg,${col} 0%,${col}cc 65%,#0b1220 130%)">
        <div style="position:absolute;inset:0;background:linear-gradient(135deg,rgba(255,255,255,.14),transparent 58%);pointer-events:none"></div>
        ${iconUrl?`<img src="${toHttpsUrl(iconUrl)}" aria-hidden="true" style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);max-height:84%;max-width:160px;width:auto;height:auto;opacity:.20;object-fit:contain;pointer-events:none;filter:drop-shadow(0 0 20px ${col})" onerror="this.style.display='none'">`:''}
        <div style="position:relative;z-index:1;display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap">
          <div style="display:flex;align-items:center;gap:14px;min-width:0">
            ${iconUrl?`<img src="${toHttpsUrl(iconUrl)}" style="width:62px;height:62px;object-fit:contain;border-radius:16px;background:rgba(255,255,255,.16);border:1px solid rgba(255,255,255,.26);padding:7px;flex-shrink:0;box-shadow:0 4px 14px rgba(0,0,0,.22)" onerror="this.style.display='none'">`:''}
            <div style="min-width:0">
              <div style="color:rgba(255,255,255,.64);font-size:12px;font-weight:800;letter-spacing:.10em;text-transform:uppercase">SDC MEMBER LINEUP</div>
              <div style="color:#fff;font-weight:950;font-size:32px;letter-spacing:-.03em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-shadow:0 2px 8px rgba(0,0,0,.18)">${univName}</div>
            </div>
          </div>
          <div style="display:flex;align-items:center;gap:8px;flex-shrink:0">
            <span style="background:rgba(255,255,255,.16);color:#fff;font-size:13px;font-weight:800;padding:7px 16px;border-radius:999px;border:1px solid rgba(255,255,255,.24);backdrop-filter:blur(8px)">총 ${members.length}명</span>
            <span style="color:rgba(255,255,255,.55);font-size:12px;font-weight:700">${dateTxt}</span>
          </div>
        </div>
        ${raceStatHtml ? `<div style="position:relative;z-index:1;display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-top:16px">${raceStatHtml}</div>` : ''}
      </div>
      <div style="position:relative;overflow:hidden;background:linear-gradient(180deg,${_b2PastelBg(col,0.26)} 0%,${_b2PastelBg(col,0.18)} 100%);padding:26px 28px 32px">
        ${(iconUrl)?`<img src="${toHttpsUrl(iconUrl)}" style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:58%;max-width:560px;opacity:.16;object-fit:contain;pointer-events:none;z-index:0" onerror="this.style.display='none'">`:''}
        <div style="position:relative;z-index:1">
          ${roleCardsHtml ? `
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px">
            <div style="width:3px;height:14px;border-radius:999px;background:${col};flex-shrink:0"></div>
            <div style="font-size:11px;font-weight:900;color:${col};letter-spacing:.06em;text-transform:uppercase">직급자</div>
          </div>
          <div style="display:grid;grid-template-columns:${_lcGridCols};gap:${_lcGridGap}px;margin-bottom:24px">${roleCardsHtml}</div>
          ${_lcMode === 'table' ? '' : `<div style="height:1px;background:linear-gradient(90deg,${col}44,transparent);margin-bottom:20px"></div>`}
          ` : ''}
          <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:12px;flex-wrap:wrap">
            <div style="display:flex;align-items:center;gap:8px">
              <div style="width:3px;height:14px;border-radius:999px;background:${col}99;flex-shrink:0"></div>
              <div style="font-size:11px;font-weight:900;color:${col};letter-spacing:.06em;text-transform:uppercase">멤버</div>
            </div>
          </div>
          <div style="display:grid;grid-template-columns:${_lcGridCols};gap:${_lcGridGap}px">${rosterCardsHtml}</div>
        </div>
      </div>
    </div>`;
}

function _b2LineupView() {
  const univList = _b2VisUnivs().filter(u => u.name !== '무소속');
  if (!univList.length) return `<div style="text-align:center;color:var(--text3);padding:40px">등록된 대학이 없습니다</div>`;
  if (!_b2LineupUniv || !univList.some(u=>u.name===_b2LineupUniv)) _b2LineupUniv = univList[0].name;
  const col = gc(_b2LineupUniv);
  return `<div style="max-width:1360px;margin:0 auto">${_b2LineupPoster(_b2LineupUniv, col, false)}</div>`;
}

// [REFACTOR] saveB2LineupImg / saveB2FreeImg 공통 캡처 로직
// 두 함수가 거의 동일한 "임시 div 생성 → 아이콘 주입 → 캡처 → 정리" 흐름을 중복 구현하고 있어
// 공통 헬퍼로 묶었습니다. (동작은 기존과 동일, 유지보수 시 한 곳만 고치면 되도록 개선)
async function _b2CaptureBoardHtml({ btnSelector, cardWidth, pad, innerHtml, heightPad, filename, errorLabel }) {
  const btn = document.querySelector(btnSelector);
  if (btn) { btn.disabled = true; btn.textContent = '⏳...'; }

  const tmpDiv = document.createElement('div');
  tmpDiv.style.cssText = `position:fixed;left:-9999px;top:0;padding:${pad}px;background:#f0f2f5;box-sizing:border-box;width:${cardWidth + pad * 2}px`;
  tmpDiv.innerHTML = innerHtml;
  document.body.appendChild(tmpDiv);
  // no-export 요소 제거 (접기 버튼 등)
  tmpDiv.querySelectorAll('.no-export,.no-export-movebtns').forEach(el => el.remove());

  await new Promise(r => setTimeout(r, 100));
  injectUnivIcons(tmpDiv);

  const h = tmpDiv.scrollHeight + heightPad;
  const w = tmpDiv.scrollWidth;

  try {
    if (typeof _captureAndSave !== 'function') throw new Error('이미지 저장 기능을 불러오지 못했습니다.');
    await _captureAndSave(tmpDiv, w, h, filename);
  } catch(e) {
    console.error(`[${errorLabel} 이미지 저장 실패]`, e);
    alert('❌ 이미지 저장 실패\n\n' + (e.message || '알 수 없는 오류가 발생했습니다.'));
  }
  finally {
    document.body.removeChild(tmpDiv);
    if (btn) { btn.disabled = false; btn.textContent = '📷 이미지저장'; }
  }
}

async function saveB2LineupImg() {
  const univList = _b2VisUnivs().filter(u => u.name !== '무소속');
  if (!_b2LineupUniv || !univList.some(u=>u.name===_b2LineupUniv)) _b2LineupUniv = univList[0] ? univList[0].name : '';
  if (!_b2LineupUniv) { alert('저장할 대학이 없습니다.'); return; }

  const col = gc(_b2LineupUniv);
  await _b2CaptureBoardHtml({
    btnSelector: '[onclick="saveB2LineupImg()"]',
    cardWidth: 1360,
    pad: 0,
    innerHtml: _b2LineupPoster(_b2LineupUniv, col, true),
    heightPad: 8,
    filename: `대학라인업_${_b2LineupUniv}_` + new Date().toISOString().slice(0,10) + '.png',
    errorLabel: '라인업'
  });
}

async function saveB2FreeImg() {
  await _b2CaptureBoardHtml({
    btnSelector: '[onclick="saveB2FreeImg()"]',
    cardWidth: 720,
    pad: 24,
    innerHtml: `<style>.b2-bottom-img{max-width:160px;max-height:130px;object-fit:contain;}</style>${_b2FreeView()}`,
    heightPad: 32,
    filename: '무소속현황판_' + new Date().toISOString().slice(0,10) + '.png',
    errorLabel: '무소속 현황판'
  });
}

function _b2ContrastColor(hex) {
  try {
    const c = String(hex||'').replace('#','').trim();
    const r = parseInt(c.slice(0,2),16), g = parseInt(c.slice(2,4),16), b = parseInt(c.slice(4,6),16);
    if([r,g,b].some(v=>Number.isNaN(v))) return '#ffffff';
    const f = (v)=>{ v/=255; return v<=0.03928? v/12.92 : Math.pow((v+0.055)/1.055, 2.4); };
    const L = 0.2126*f(r) + 0.7152*f(g) + 0.0722*f(b);
    // WCAG 대비비율 기준으로 흰/짙은 글자를 선택
    const contrastW = (1.0+0.05)/(L+0.05);
    const contrastD = (L+0.05)/(0.02+0.05); // #0f172a 근사(짙은 글자)
    return (contrastW >= contrastD) ? '#ffffff' : '#0f172a';
  } catch(e){ return '#ffffff'; }
}


/* ══════════════════════════════════════
   👤 프로필 뷰 — 좌측 메인 디스플레이 + 우측 그리드
════════════════════════════════════════ */

// 프로필 탭에서 선택한 선수 이름 저장/로드
// 이미지별 탭 진입 시 매번 랜덤 선수 선택 (새로고침해도 매번 다른 선수)
localStorage.removeItem('su_b2SelectedPlayer'); // 저장된 이전 선수 초기화
(function(){
  // photo가 있는 선수 우선, 없으면 전체에서 랜덤
  const all = players.filter(p => p && !p.hidden && !p.retired && !p.hideFromBoard);
  const withPhoto = all.filter(p => p.photo || (window.playerPhotos && window.playerPhotos[p.name]));
  const pool = withPhoto.length ? withPhoto : all;
  if (pool.length) {
    _b2SelectedPlayer = pool[Math.floor(Math.random() * pool.length)];
  }
})();
