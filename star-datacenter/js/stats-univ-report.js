/* ══════════════════════════════════════════════════════════════
   🏛️ 대학 리포트 — "스트리머 리포트"와 같은 톤의 대학 단위 종합 리포트
   (검색/선택 → 히어로 → 기본 정보 → 종족/티어 구성 → 팀 내 다승왕/연승 리더
    → 라이벌 대학 상대전적 → 로스터 → 최근 경기)
   ══════════════════════════════════════════════════════════════ */

function _urInjectStyle(){
  if (typeof document==='undefined') return;
  if (document.getElementById('ur-report-style')) return;
  const s = document.createElement('style');
  s.id = 'ur-report-style';
  s.textContent = [
    '.ur-search-wrap{position:relative;max-width:480px}',
    '.ur-search-input{width:100%;padding:11px 14px;border-radius:14px;border:1.5px solid var(--border2);background:var(--white);font-size:13px;font-weight:700;color:var(--text1)}',
    '.ur-search-input:focus{outline:none;border-color:var(--blue)}',
    '.ur-search-drop{position:absolute;left:0;right:0;top:calc(100% + 4px);background:var(--white);border:1px solid var(--border2);border-radius:14px;box-shadow:0 12px 28px rgba(15,23,42,.14);z-index:20;max-height:260px;overflow-y:auto}',
    '.ur-search-item{padding:10px 14px;font-size:13px;font-weight:700;color:var(--text1);cursor:pointer}',
    '.ur-search-item:hover{background:var(--surface)}',
    '.ur-recent-wrap{margin-top:8px;display:flex;gap:7px;flex-wrap:wrap;align-items:center;padding:9px 12px;border-radius:14px;background:var(--surface);border:1px solid var(--border2)}',
    '.ur-recent-lbl{font-size:11px;font-weight:800;color:var(--text3);margin-right:2px}',
    '.ur-recent-chip{padding:5px 12px;border-radius:999px;background:var(--white);border:1px solid var(--border2);font-size:12px;font-weight:700;color:var(--text2);cursor:pointer;transition:transform .12s}',
    '.ur-recent-chip:hover{transform:translateY(-1px);border-color:var(--blue)}',
    '.ur-empty{padding:60px 20px;text-align:center;color:var(--text2)}',
    '.ur-hero{display:flex;align-items:center;flex-wrap:wrap;gap:16px;padding:22px 24px;border-radius:24px;border:1px solid rgba(148,163,184,.18);box-shadow:0 18px 32px rgba(15,23,42,.06);margin:14px 0;position:relative;overflow:hidden;backdrop-filter:blur(18px) saturate(1.3);-webkit-backdrop-filter:blur(18px) saturate(1.3)}',
    '.ur-hero-logo{width:72px;height:72px;flex-shrink:0;display:flex;align-items:center;justify-content:center;background:transparent;box-shadow:none}',
    '.ur-hero-logo img{width:96%;height:96%;object-fit:contain;filter:drop-shadow(0 4px 10px rgba(15,23,42,.18))}',
    '.ur-hero-name{font-size:24px;font-weight:950;letter-spacing:-.03em;color:var(--text1)}',
    '.ur-hero-badges{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}',
    '.ur-hero-actions{display:flex;gap:6px;flex-shrink:0;margin-left:auto;align-self:flex-start}',
    '.ur-badge{display:inline-flex;align-items:center;gap:5px;padding:5px 11px;border-radius:999px;background:rgba(255,255,255,.7);border:1px solid rgba(148,163,184,.22);font-size:11.5px;font-weight:800;color:var(--text2)}',
    '.ur-btn{display:inline-flex;align-items:center;gap:5px;padding:8px 13px;border-radius:12px;font-size:12px;font-weight:800;cursor:pointer;border:1.5px solid var(--border2);background:var(--white);color:var(--text2);white-space:nowrap;transition:transform .12s,box-shadow .12s}',
    '.ur-btn:hover{transform:translateY(-1px);box-shadow:0 6px 14px rgba(15,23,42,.12)}',
    '.ur-btn-primary{background:var(--blue);border-color:var(--blue);color:#fff}',
    '.ur-kpi-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:10px;margin-bottom:14px}',
    '@media(max-width:700px){.ur-kpi-grid{grid-template-columns:repeat(3,1fr)}}',
    '@media(max-width:420px){.ur-kpi-grid{grid-template-columns:repeat(2,1fr)}}',
    '.ur-kpi{border-radius:16px;padding:13px 10px;text-align:center;border:1px solid rgba(148,163,184,.16);background:var(--white);box-shadow:0 10px 18px rgba(15,23,42,.04)}',
    '.ur-kpi-num{font-size:20px;font-weight:900;line-height:1.1}',
    '.ur-kpi-lbl{font-size:10.5px;font-weight:700;color:var(--text3);margin-top:3px}',
    '.ur-panel{background:var(--white);border:1px solid rgba(148,163,184,.16);border-radius:20px;padding:16px;box-shadow:0 14px 26px rgba(15,23,42,.04);margin-bottom:14px}',
    '.ur-panel-title{font-size:14px;font-weight:900;color:var(--text1);margin-bottom:12px;display:flex;align-items:center;gap:6px}',
    '.ur-roster-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(96px,1fr));gap:8px}',
    '.ur-roster-card{display:flex;flex-direction:column;align-items:center;text-align:center;border-radius:14px;padding:8px 6px 9px;border:1.5px solid transparent;cursor:pointer;transition:transform .14s,box-shadow .14s}',
    '.ur-roster-card:hover{transform:translateY(-2px);box-shadow:0 10px 20px rgba(15,23,42,.1)}',
    '.ur-roster-avatar{width:56px;height:56px;border-radius:50%;overflow:hidden;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:900;color:#fff;margin-bottom:6px}',
    '.ur-roster-avatar img{width:100%;height:100%;object-fit:cover}',
    '.ur-roster-name{font-size:11.5px;font-weight:800;color:var(--text1);max-width:88px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
    '.ur-roster-tier{font-size:9px;font-weight:900;padding:1px 6px;border-radius:999px;margin-top:3px}',
    '.ur-winner-row,.ur-rival-row{display:flex;align-items:center;gap:9px;padding:7px 4px;border-radius:10px;cursor:pointer;transition:background .12s}',
    '.ur-winner-row:hover,.ur-rival-row:hover{background:var(--surface)}',
    '.ur-winner-row+.ur-winner-row,.ur-rival-row+.ur-rival-row{border-top:1px solid var(--border2)}',
    '.ur-mini-avatar{width:28px;height:28px;border-radius:50%;overflow:hidden;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:900;color:#fff}',
    '.ur-mini-avatar img{width:100%;height:100%;object-fit:cover}',
    '.ur-bar-track{flex:1;height:9px;border-radius:5px;overflow:hidden;background:var(--border2)}',
    '.ur-recent-table{width:100%;border-collapse:collapse;font-size:12px}',
    '.ur-recent-table td{padding:6px 6px;border-bottom:1px solid var(--border2)}',
    '.ur-recent-table tr:last-child td{border-bottom:none}',
    'body.dark .ur-search-input,body.dark .ur-search-drop,body.dark .ur-recent-chip,body.dark .ur-kpi,body.dark .ur-panel,body.dark .ur-btn{background:rgba(15,23,42,.7)!important;border-color:#334155!important}',
    'body.dark .ur-btn-primary{background:var(--blue)!important;border-color:var(--blue)!important;color:#fff!important}',
    'body.dark .ur-recent-wrap{background:rgba(15,23,42,.5);border-color:#334155}',
    'body.dark .ur-badge{background:rgba(15,23,42,.45);border-color:#334155}',
    'body.dark .ur-winner-row+.ur-winner-row,body.dark .ur-rival-row+.ur-rival-row{border-top-color:#334155}',
    'body.dark .ur-bar-track{background:#334155}',
    'body.dark .ur-recent-table td{border-bottom-color:#334155}',
    '.ur-bg-loading .ur-img-preview-body{position:relative}',
    '.ur-bg-loading .ur-img-preview-body img{opacity:.35}',
    '.ur-bg-loading .ur-img-preview-body::after{content:"이미지 생성 중...";position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:12px;font-weight:800;color:var(--text2);background:var(--white);padding:8px 14px;border-radius:999px;box-shadow:0 6px 16px rgba(0,0,0,.15)}'
  ].join('');
  document.head.appendChild(s);
}

function _urDateNum(s){
  const d = String(s||'').replace(/\D/g,'');
  return d.length>=8 ? parseInt(d.slice(0,8),10) : 0;
}

function _urThisWeekRange(){
  const now = new Date();
  const day = now.getDay();
  const mon = new Date(now); mon.setHours(0,0,0,0); mon.setDate(now.getDate()+(day===0?-6:1-day));
  const toD = new Date(now); toD.setHours(23,59,59,999);
  const f = d => parseInt(d.toISOString().slice(0,10).replace(/-/g,''));
  return { fromN:f(mon), toN:f(toD) };
}

function _urVisUnivList(){
  const _diss = new Set((typeof univCfg!=='undefined'?univCfg:[]).filter(u=>u.dissolved||u.hidden).map(u=>String(u.name||'').trim()));
  const list = (typeof _b2VisUnivs==='function') ? _b2VisUnivs() : (typeof univCfg!=='undefined'?univCfg:[]);
  return (list||[]).filter(u=>u && u.name && u.name!=='무소속' && !_diss.has(String(u.name||'').trim()));
}

function _urSelectUniv(name){
  try{ if(window.SUTTS && (window.SUTTS.isSpeaking() || (window.SUTTS.isPaused && window.SUTTS.isPaused()))) window.SUTTS.stop(); }catch(e){}
  window._urName = name;
  try{
    const raw = JSON.parse(localStorage.getItem('su_ur_recent')||'[]');
    const next = [name, ...raw.filter(n=>n!==name)].slice(0,8);
    localStorage.setItem('su_ur_recent', JSON.stringify(next));
  }catch(e){}
  const drop = document.getElementById('ur-search-drop');
  if (drop) { drop.style.display='none'; drop.innerHTML=''; }
  if (typeof render==='function') render();
}

function _urLoadRecent(){
  try{ return JSON.parse(localStorage.getItem('su_ur_recent')||'[]'); }catch(e){ return []; }
}

function _urOnSearchInput(v){
  const q = String(v||'').trim().toLowerCase();
  const drop = document.getElementById('ur-search-drop');
  if (!drop) return;
  if (!q) { drop.style.display='none'; drop.innerHTML=''; return; }
  const list = _urVisUnivList().filter(u=>String(u.name||'').toLowerCase().includes(q));
  if (!list.length) { drop.style.display='none'; drop.innerHTML=''; return; }
  drop.innerHTML = list.slice(0,8).map(u=>{
    const safe = String(u.name||'').replace(/'/g,"\\'");
    return `<div class="ur-search-item" onclick="_urSelectUniv('${safe}')">${escHTML(u.name)}</div>`;
  }).join('');
  drop.style.display='block';
}

// 대학 소속 인원의 통산 승수 상위 (팀 내 다승왕)
function _urTopWinners(playerAgg, n){
  return playerAgg.filter(x=>x.win>0).sort((a,b)=>b.win-a.win||(b.wr??-1)-(a.wr??-1)).slice(0,n||6);
}
// 대학 소속 인원의 연승 리더
function _urTopStreaks(playerAgg, n){
  return playerAgg.filter(x=>x.streak>=3).sort((a,b)=>b.streak-a.streak).slice(0,n||6);
}

// 라이벌 대학 상대전적 (상대 닉네임 → 상대 소속 대학으로 역매핑해서 집계)
function _urRivalStats(members, ownUnivName){
  const nameToUniv = {};
  (players||[]).forEach(p=>{ if (p && p.name) nameToUniv[p.name] = String(p.univ||'').trim(); });
  const rivalMap = {};
  members.forEach(p=>{
    (Array.isArray(p.history)?p.history:[]).forEach(h=>{
      if (!h || (h.result!=='승' && h.result!=='패')) return;
      const oppName = String(h.opp||'').trim();
      if (!oppName) return;
      const oppUniv = nameToUniv[oppName] || '';
      if (!oppUniv || oppUniv===ownUnivName || oppUniv==='무소속') return;
      if (!rivalMap[oppUniv]) rivalMap[oppUniv] = {w:0,l:0};
      if (h.result==='승') rivalMap[oppUniv].w++; else rivalMap[oppUniv].l++;
    });
  });
  return Object.entries(rivalMap)
    .map(([name,v])=>({name, w:v.w, l:v.l, tot:v.w+v.l, wr:(v.w+v.l)>0?Math.round(v.w/(v.w+v.l)*100):null}))
    .sort((a,b)=>b.tot-a.tot);
}

// 팀 전체 최근 경기 (모든 소속 인원의 경기를 합쳐 날짜순 정렬)
function _urRecentMatches(members, limit){
  const rows = [];
  members.forEach(p=>{
    (Array.isArray(p.history)?p.history:[]).forEach(h=>{
      if (!h || (h.result!=='승' && h.result!=='패')) return;
      rows.push({ name:p.name, date:h.date||h.d||'', result:h.result, opp:h.opp||'', map:h.map||'' });
    });
  });
  rows.sort((a,b)=>_urDateNum(b.date)-_urDateNum(a.date));
  return rows.slice(0, limit||15);
}

function _urAvatarHTML(p, col, size){
  const s = size||56;
  const photo = p.photo ? (typeof toThumbUrl==='function'?toThumbUrl(p.photo,s):p.photo) : '';
  const photoOrig = p.photo ? (typeof toHttpsUrl==='function'?toHttpsUrl(p.photo):p.photo) : '';
  const initials = (p.name||'?').slice(0,1);
  if (photo) {
    return `<span class="ur-mini-avatar" style="width:${s}px;height:${s}px;background:${col}33"><img src="${photo}" data-orig="${photoOrig}" onerror="if(this.dataset.orig&&this.src!==this.dataset.orig){this.src=this.dataset.orig}else{this.style.display='none'}"></span>`;
  }
  return `<span class="ur-mini-avatar" style="width:${s}px;height:${s}px;background:${col}">${initials}</span>`;
}

function statsUnivReportHTML(){
  _urInjectStyle();

  let h = `<div class="ssec">
    <div class="stats-chart-toolbar" style="margin-bottom:14px">
      <div>
        <h4 style="margin:0">🏛️ 대학 리포트</h4>
        <div style="font-size:11px;color:var(--text2);margin-top:4px">대학을 검색하면 로스터, 종족·티어 구성, 종족별 승률, 최근 7일 활동 추이, 팀 내 다승왕·연승 리더, 라이벌 대학 상대전적, 최근 경기까지 한 번에 볼 수 있습니다.</div>
      </div>
    </div>
    <div class="ur-search-wrap">
      <input id="ur-search-input" class="ur-search-input" type="text" placeholder="🔍 대학 이름으로 검색..." value=""
        oninput="_urOnSearchInput(this.value)" autocomplete="off">
      <div id="ur-search-drop" class="ur-search-drop" style="display:none"></div>
    </div>
  </div>`;

  const recent = _urLoadRecent().filter(n=>n!==window._urName);
  if (recent.length) {
    h += `<div class="ur-recent-wrap">
      <span class="ur-recent-lbl">🕘 최근 검색</span>
      ${recent.map(n=>`<span class="ur-recent-chip" onclick="_urSelectUniv('${(n||'').replace(/'/g,"\\'")}')">${escHTML(n)}</span>`).join('')}
    </div>`;
  }

  const univName = window._urName || '';
  const uCfg = univName ? (typeof univCfg!=='undefined'?univCfg:[]).find(u=>u && u.name===univName) : null;

  if (!univName || !uCfg) {
    h += `<div class="ur-empty"><div style="font-size:40px;margin-bottom:10px">🏛️</div>대학을 검색해서 리포트를 확인해보세요</div>`;
    const quick = _urVisUnivList();
    if (quick.length) {
      h += `<div class="ur-recent-wrap" style="margin-top:8px">
        <span class="ur-recent-lbl">🏫 대학 선택</span>
        ${quick.map(u=>`<span class="ur-recent-chip" onclick="_urSelectUniv('${(u.name||'').replace(/'/g,"\\'")}')">${escHTML(u.name)}</span>`).join('')}
      </div>`;
    }
    return h;
  }

  const col = (typeof gc==='function' ? gc(univName) : '') || '#64748b';
  const _dissOwn = !!(uCfg.dissolved || uCfg.hidden);
  const allMembers = (players||[]).filter(p => p && !p.hidden && !p.retired && !p.hideFromBoard && String(p?.univ||'').trim()===univName);
  const hasRoleFn = (typeof _b2HasRole==='function') ? _b2HasRole : (()=>false);
  const roledMembers = allMembers.filter(p=>hasRoleFn(p));
  const tieredMembers = allMembers.filter(p=>!hasRoleFn(p));

  if (!allMembers.length) {
    h += `<div class="ur-empty"><div style="font-size:40px;margin-bottom:10px">🏛️</div>${escHTML(univName)}에 등록된 선수가 없습니다</div>`;
    return h;
  }

  // 선수별 통산 승/패·연승 집계
  const playerAgg = tieredMembers.map(p=>{
    const decided = (Array.isArray(p.history)?p.history:[]).filter(x=>x && (x.result==='승'||x.result==='패'));
    const sortedDesc = [...decided].sort((a,b)=>_urDateNum(b.date||b.d||'')-_urDateNum(a.date||a.d||''));
    let streak = 0;
    for (const x of sortedDesc) { if (x.result==='승') streak++; else break; }
    const win = decided.filter(x=>x.result==='승').length;
    const loss = decided.length - win;
    return { p, win, loss, games:decided.length, wr:decided.length?Math.round(win/decided.length*100):null, streak };
  });
  let totalW=0, totalL=0;
  playerAgg.forEach(x=>{ totalW+=x.win; totalL+=x.loss; });
  const totalG = totalW+totalL;
  const totalWr = totalG>0 ? Math.round(totalW/totalG*100) : null;
  const wrCol = totalWr===null?'#94a3b8':totalWr>=55?'#10b981':totalWr>=45?'#f59e0b':'#ef4444';

  const { fromN, toN } = _urThisWeekRange();
  const weekActive = new Set();
  tieredMembers.forEach(p=>(Array.isArray(p.history)?p.history:[]).forEach(x=>{
    const d = _urDateNum(x.date||x.d||'');
    if (d>=fromN && d<=toN) weekActive.add(p.name);
  }));

  const TIERS_LOCAL = typeof TIERS!=='undefined' ? TIERS : [];
  const sortedByTier = [...tieredMembers].sort((a,b)=>{
    const ia=TIERS_LOCAL.indexOf(a.tier||''), ib=TIERS_LOCAL.indexOf(b.tier||'');
    return (ia>=0?ia:999)-(ib>=0?ib:999);
  });
  const topTier = sortedByTier[0]?.tier || null;
  const topTierCol = (typeof getTierBtnColor==='function' && topTier) ? getTierBtnColor(topTier) : '#64748b';
  const topTierTc = (typeof getTierBtnTextColor==='function' && topTier) ? (getTierBtnTextColor(topTier)||'#fff') : '#fff';

  const raceCts = {P:0,T:0,Z:0,'?':0};
  tieredMembers.forEach(p=>{ const r=p.race||'?'; raceCts[r in raceCts?r:'?']++; });
  const raceTotal = raceCts.P+raceCts.T+raceCts.Z || 1;

  const tierCts = {};
  tieredMembers.forEach(p=>{ const t=p.tier||'미정'; tierCts[t]=(tierCts[t]||0)+1; });
  const orderedTiers = TIERS_LOCAL.filter(t=>tierCts[t]).concat(Object.keys(tierCts).filter(t=>!TIERS_LOCAL.includes(t)));

  // 종족별 승률 (인원 비율과 별개로 실제 승률 비교용)
  const raceRecord = {P:{w:0,l:0},T:{w:0,l:0},Z:{w:0,l:0}};
  tieredMembers.forEach(p=>{
    if (!(p.race in raceRecord)) return;
    (Array.isArray(p.history)?p.history:[]).forEach(h=>{
      if (h.result==='승') raceRecord[p.race].w++;
      else if (h.result==='패') raceRecord[p.race].l++;
    });
  });

  // 최근 7일 일별 활동량 (경기 수)
  const last7Days = [];
  { const _nowD = new Date();
    for (let i=6;i>=0;i--) {
      const d = new Date(_nowD); d.setDate(_nowD.getDate()-i); d.setHours(0,0,0,0);
      last7Days.push({ dn:parseInt(d.toISOString().slice(0,10).replace(/-/g,'')), label:`${d.getMonth()+1}/${d.getDate()}`, isToday:i===0, count:0 });
    }
  }
  const last7Map = new Map(last7Days.map(x=>[x.dn, x]));
  tieredMembers.forEach(p=>{
    (Array.isArray(p.history)?p.history:[]).forEach(h=>{
      if (!h || (h.result!=='승' && h.result!=='패')) return;
      const row = last7Map.get(_urDateNum(h.date||h.d||''));
      if (row) row.count++;
    });
  });
  const last7Max = Math.max(1, ...last7Days.map(x=>x.count));

  const iconUrl = uCfg.icon || uCfg.img || (typeof UNIV_ICONS!=='undefined'?UNIV_ICONS[univName]:'') || '';
  const logoSrc = iconUrl ? (typeof toHttpsUrl==='function'?toHttpsUrl(iconUrl):iconUrl) : '';
  const logoHtml = logoSrc
    ? `<img src="${logoSrc}" onerror="this.parentNode.style.display='none'">`
    : `<span style="font-size:26px">🏫</span>`;

  h += `<div id="ur-report-capture">`;
  h += `<div class="ur-hero" style="background:linear-gradient(135deg,${col}22,${col}08);border-color:${col}33">
    <div class="ur-hero-logo">${logoHtml}</div>
    <div style="min-width:0;flex:1">
      <div class="ur-hero-name" style="color:${col}">${escHTML(univName)}</div>
      <div class="ur-hero-badges">
        <span class="ur-badge">👥 총원 ${allMembers.length}명</span>
        <span class="ur-badge">일반 ${tieredMembers.length}명 · 직책 ${roledMembers.length}명</span>
        ${totalWr!==null?`<span class="ur-badge" style="color:${wrCol}">📈 통산 ${totalWr}% (${totalW}승 ${totalL}패)</span>`:''}
        <span class="ur-badge">🔥 이번주 활동 ${weekActive.size}명</span>
        ${topTier?`<span class="ur-badge" style="background:${topTierCol};color:${topTierTc};border-color:transparent">TOP 티어 ${topTier}</span>`:''}
        ${_dissOwn?`<span class="ur-badge" style="color:#dc2626">해체됨</span>`:''}
      </div>
    </div>
    <div class="ur-hero-actions no-export">
      <button type="button" id="ur-report-speak-btn" class="ur-btn" title="리포트 음성으로 듣기" onclick="_urToggleSpeak()">🔊<span>음성듣기</span></button>
      <button type="button" class="ur-btn ur-btn-primary" title="리포트 이미지 저장" onclick="_urSaveReportImage()">📸<span>이미지 저장</span></button>
    </div>
  </div>`;

  // 기본 정보 KPI
  h += `<div class="ur-kpi-grid">
    <div class="ur-kpi"><div class="ur-kpi-num" style="color:${col}">${allMembers.length}</div><div class="ur-kpi-lbl">총 인원</div></div>
    <div class="ur-kpi"><div class="ur-kpi-num" style="color:#7c3aed">${raceCts.P}</div><div class="ur-kpi-lbl">🔮 프로토스</div></div>
    <div class="ur-kpi"><div class="ur-kpi-num" style="color:#0284c7">${raceCts.T}</div><div class="ur-kpi-lbl">⚔️ 테란</div></div>
    <div class="ur-kpi"><div class="ur-kpi-num" style="color:#059669">${raceCts.Z}</div><div class="ur-kpi-lbl">🦎 저그</div></div>
    <div class="ur-kpi"><div class="ur-kpi-num" style="color:${wrCol}">${totalWr!==null?totalWr+'%':'-'}</div><div class="ur-kpi-lbl">통산 승률</div></div>
  </div>`;

  // 종족 비율 + 티어 분포
  h += `<div class="ur-panel">
    <div class="ur-panel-title">🎮 종족 비율 &amp; 🏆 티어 분포</div>
    <div style="display:flex;flex-direction:column;gap:7px;margin-bottom:14px">
      ${[{r:'P',c:'#7c3aed',l:'🔮 프로토스'},{r:'T',c:'#0284c7',l:'⚔️ 테란'},{r:'Z',c:'#059669',l:'🦎 저그'}].map(({r,c,l})=>{
        const n=raceCts[r]; const pct=Math.round(n/raceTotal*100);
        return `<div>
          <div style="display:flex;justify-content:space-between;margin-bottom:3px">
            <span style="font-size:12px;font-weight:800;color:${c}">${l}</span>
            <span style="font-size:12px;font-weight:900;color:var(--text2)">${n}<span style="font-weight:600;color:var(--text3)"> (${pct}%)</span></span>
          </div>
          <div class="ur-bar-track"><div style="width:${pct}%;height:100%;background:${c};border-radius:5px;transition:width .6s ease"></div></div>
        </div>`;
      }).join('')}
    </div>
    <div style="display:flex;flex-wrap:wrap;gap:6px">
      ${orderedTiers.map(t=>{
        const tc = typeof getTierBtnColor==='function' ? getTierBtnColor(t) : '#64748b';
        const tcol = typeof getTierBtnTextColor==='function' ? (getTierBtnTextColor(t)||'#fff') : '#fff';
        const n = tierCts[t];
        return `<span style="display:inline-flex;align-items:center;gap:5px;padding:5px 10px;border-radius:999px;background:${tc}18;border:1.5px solid ${tc}55">
          <span style="font-size:11px;font-weight:900;padding:1px 7px;border-radius:6px;background:${tc};color:${tcol}">${t}</span>
          <span style="font-size:11px;font-weight:800;color:${tc}">${n}명</span>
        </span>`;
      }).join('')}
    </div>
  </div>`;

  // ⚔️ 종족별 승률
  h += `<div class="ur-panel">
    <div class="ur-panel-title">⚔️ 종족별 승률</div>
    <div style="display:flex;flex-direction:column;gap:11px">
      ${[{r:'P',c:'#7c3aed',l:'🔮 프로토스'},{r:'T',c:'#0284c7',l:'⚔️ 테란'},{r:'Z',c:'#059669',l:'🦎 저그'}].map(({r,c,l})=>{
        const rec=raceRecord[r]; const g=rec.w+rec.l; const wr=g>0?Math.round(rec.w/g*100):null;
        const rWrCol = wr===null?'#94a3b8':wr>=55?'#10b981':wr>=45?'#f59e0b':'#ef4444';
        return `<div>
          <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:4px">
            <span style="font-size:12px;font-weight:800;color:${c}">${l}</span>
            <span style="font-size:12px;font-weight:900;color:${rWrCol}">${wr!==null?wr+'%':'-'}<span style="font-weight:600;color:var(--text3);margin-left:5px">${rec.w}승 ${rec.l}패</span></span>
          </div>
          <div class="ur-bar-track"><div style="width:${wr??0}%;height:100%;background:${rWrCol};border-radius:5px;transition:width .6s ease"></div></div>
        </div>`;
      }).join('')}
    </div>
  </div>`;

  // 📈 최근 7일 활동 추이
  h += `<div class="ur-panel">
    <div class="ur-panel-title">📈 최근 7일 활동 추이 <span style="margin-left:auto;font-size:11px;color:var(--text3);font-weight:600">일별 경기 수</span></div>
    <div style="display:flex;align-items:flex-end;gap:6px;height:88px;padding-top:6px">
      ${last7Days.map(d=>{
        const hPct = Math.max(4, Math.round(d.count/last7Max*100));
        return `<div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;height:100%;gap:5px" title="${d.label}: ${d.count}경기">
          <span style="font-size:10px;font-weight:900;color:var(--text2)">${d.count}</span>
          <div style="width:100%;max-width:28px;border-radius:6px 6px 3px 3px;min-height:3px;height:${hPct}%;background:${d.isToday?'linear-gradient(180deg,#fbbf24,#f59e0b)':`linear-gradient(180deg,${col}bb,${col})`};transition:height .5s ease"></div>
          <span style="font-size:9px;font-weight:800;color:var(--text3)">${d.isToday?'오늘':d.label}</span>
        </div>`;
      }).join('')}
    </div>
  </div>`;

  // 🗒️ 대학 메모 (설정된 경우에만 노출)
  if (uCfg.memo || uCfg.bMemo) {
    h += `<div class="ur-panel">
      <div class="ur-panel-title">🗒️ 대학 메모</div>
      <div style="font-size:12.5px;line-height:1.7;color:var(--text2);white-space:pre-wrap">${escHTML(uCfg.memo||uCfg.bMemo||'')}</div>
    </div>`;
  }

  // 팀 내 다승왕 TOP
  const topWinners = _urTopWinners(playerAgg, 6);
  if (topWinners.length) {
    h += `<div class="ur-panel">
      <div class="ur-panel-title">🏆 팀 내 다승왕 TOP</div>
      ${topWinners.map((x,i)=>{
        const p=x.p;
        const medal = i<3 ? ['🥇','🥈','🥉'][i] : `${i+1}`;
        const wrColP = x.wr===null?'#94a3b8':x.wr>=60?'#10b981':x.wr>=40?'#f59e0b':'#ef4444';
        const safeName = (p.name||'').replace(/'/g,"\\'");
        return `<div class="ur-winner-row" onclick="if(typeof openPlayerModal==='function')openPlayerModal('${safeName}')">
          <span style="width:20px;text-align:center;font-size:12px;font-weight:900;color:var(--text3);flex-shrink:0">${medal}</span>
          ${_urAvatarHTML(p, col, 28)}
          <span style="font-size:12px;font-weight:800;color:${col};min-width:64px;max-width:110px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${escHTML(p.name||'')}</span>
          <div class="ur-bar-track" style="margin:0 6px"><div style="width:${x.wr}%;height:100%;background:${wrColP};border-radius:5px"></div></div>
          <span style="font-size:11.5px;font-weight:900;color:var(--text2);flex-shrink:0">${x.win}승 ${x.loss}패</span>
          <span style="font-size:11.5px;font-weight:900;color:${wrColP};min-width:36px;text-align:right;flex-shrink:0">${x.wr}%</span>
        </div>`;
      }).join('')}
    </div>`;
  }

  // 팀 내 연승 리더
  const topStreaks = _urTopStreaks(playerAgg, 6);
  if (topStreaks.length) {
    const maxStreak = topStreaks[0].streak || 1;
    h += `<div class="ur-panel">
      <div class="ur-panel-title">🔥 팀 내 연승 리더 <span style="margin-left:auto;font-size:11px;color:var(--text3);font-weight:600">3연승 이상</span></div>
      ${topStreaks.map((x,i)=>{
        const p=x.p;
        const medal = i<3 ? ['🥇','🥈','🥉'][i] : `${i+1}`;
        const t = Math.min(1, x.streak/Math.max(maxStreak,1));
        const hue = Math.round(38 - t*20);
        const badgeBg = `linear-gradient(135deg,hsl(${hue} 92% 56%),hsl(${Math.max(hue-16,0)} 85% 46%))`;
        const safeName = (p.name||'').replace(/'/g,"\\'");
        return `<div class="ur-winner-row" onclick="if(typeof openPlayerModal==='function')openPlayerModal('${safeName}')">
          <span style="width:20px;text-align:center;font-size:12px;font-weight:900;color:var(--text3);flex-shrink:0">${medal}</span>
          ${_urAvatarHTML(p, col, 28)}
          <span style="font-size:12px;font-weight:800;color:${col};min-width:64px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1">${escHTML(p.name||'')}</span>
          <span style="display:inline-flex;align-items:center;gap:3px;padding:4px 11px;border-radius:999px;font-size:11px;font-weight:900;color:#fff;background:${badgeBg};flex-shrink:0">🔥 ${x.streak}연승</span>
        </div>`;
      }).join('')}
    </div>`;
  }

  // 라이벌 대학 상대전적
  const rivals = _urRivalStats(tieredMembers, univName).slice(0,6);
  if (rivals.length) {
    h += `<div class="ur-panel">
      <div class="ur-panel-title">⚔️ 라이벌 대학 상대전적</div>
      ${rivals.map(r=>{
        const rCol = (typeof gc==='function' ? gc(r.name) : '') || '#64748b';
        const rWrCol = r.wr===null?'#94a3b8':r.wr>=55?'#10b981':r.wr>=45?'#f59e0b':'#ef4444';
        const safeRival = String(r.name||'').replace(/'/g,"\\'");
        return `<div class="ur-rival-row" onclick="if(typeof openUnivModal==='function')openUnivModal('${safeRival}')">
          <span style="font-size:12px;font-weight:800;color:${rCol};min-width:70px;max-width:90px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${escHTML(r.name)}</span>
          <div class="ur-bar-track"><div style="width:${r.wr??0}%;height:100%;background:${rWrCol};border-radius:5px"></div></div>
          <span style="font-size:11.5px;font-weight:900;color:${rWrCol};min-width:38px;text-align:right">${r.wr!==null?r.wr+'%':'-'}</span>
          <span style="font-size:10.5px;color:var(--text3);min-width:64px;text-align:right">${r.w}승 ${r.l}패</span>
        </div>`;
      }).join('')}
    </div>`;
  }

  // 로스터
  h += `<div class="ur-panel">
    <div class="ur-panel-title">📋 로스터 <span style="margin-left:auto;font-size:11px;color:var(--text3);font-weight:600">${allMembers.length}명</span></div>
    <div class="ur-roster-grid">
      ${[...roledMembers, ...sortedByTier].map(p=>{
        const tc = typeof getTierBtnColor==='function' && p.tier ? getTierBtnColor(p.tier) : '#64748b';
        const tcol = typeof getTierBtnTextColor==='function' && p.tier ? (getTierBtnTextColor(p.tier)||'#fff') : '#fff';
        const rIco = p.race==='P'?'🔮':p.race==='T'?'⚔️':p.race==='Z'?'🦎':'';
        const safeName = (p.name||'').replace(/'/g,"\\'");
        const photo = p.photo ? (typeof toThumbUrl==='function'?toThumbUrl(p.photo,56):p.photo) : '';
        const photoOrig = p.photo ? (typeof toHttpsUrl==='function'?toHttpsUrl(p.photo):p.photo) : '';
        const initials = (p.name||'?').slice(0,1);
        const avatarHtml = photo
          ? `<img src="${photo}" data-orig="${photoOrig}" onerror="if(this.dataset.orig&&this.src!==this.dataset.orig){this.src=this.dataset.orig}else{this.style.display='none'}">`
          : initials;
        return `<div class="ur-roster-card" style="border-color:${col}33;background:${col}0a" onclick="if(typeof openPlayerModal==='function')openPlayerModal('${safeName}')">
          <span class="ur-roster-avatar" style="background:${col}">${avatarHtml}</span>
          <span class="ur-roster-name">${rIco?rIco+' ':''}${escHTML(p.name||'')}</span>
          ${p.role?`<span class="ur-roster-tier" style="background:${col}22;color:${col}">${escHTML(p.role)}</span>`:(p.tier?`<span class="ur-roster-tier" style="background:${tc};color:${tcol}">${escHTML(p.tier)}</span>`:'')}
        </div>`;
      }).join('')}
    </div>
  </div>`;

  // 최근 경기
  const recentMatches = _urRecentMatches(tieredMembers, 15);
  if (recentMatches.length) {
    h += `<div class="ur-panel">
      <div class="ur-panel-title">📅 최근 경기</div>
      <table class="ur-recent-table"><tbody>
        ${recentMatches.map(m=>{
          const isWin = m.result==='승';
          return `<tr>
            <td style="width:76px;color:var(--text3);font-weight:700">${escHTML(String(m.date||'').slice(0,10))}</td>
            <td style="font-weight:800;color:${col}">${escHTML(m.name)}</td>
            <td style="width:34px;text-align:center;font-weight:900;color:${isWin?'#16a34a':'#dc2626'}">${m.result}</td>
            <td style="color:var(--text2)">vs ${escHTML(m.opp||'-')}</td>
            <td style="width:70px;text-align:right;color:var(--text3);font-size:11px">${escHTML(m.map||'')}</td>
          </tr>`;
        }).join('')}
      </tbody></table>
    </div>`;
  }

  h += `</div>`;

  return h;
}

try{
  window.statsUnivReportHTML = statsUnivReportHTML;
}catch(e){}

/* ─── 🔊 대학 리포트 음성듣기(TTS) ─── */
function _urPushSpoken(queue, text){
  if (!text) return;
  const parts = String(text).split(/,\s+/).map(s=>s.trim()).filter(Boolean);
  parts.forEach((part,i)=>{
    const isLast = (i === parts.length-1);
    queue.push(isLast ? {text:part} : {text:part, gapMs:140});
  });
}

function _urBuildSpeakQueue(){
  const univName = window._urName;
  const uCfg = univName ? (typeof univCfg!=='undefined'?univCfg:[]).find(u=>u && u.name===univName) : null;
  if (!univName || !uCfg) return [];

  const allMembers = (players||[]).filter(p => p && !p.hidden && !p.retired && !p.hideFromBoard && String(p?.univ||'').trim()===univName);
  const hasRoleFn = (typeof _b2HasRole==='function') ? _b2HasRole : (()=>false);
  const roledMembers = allMembers.filter(p=>hasRoleFn(p));
  const tieredMembers = allMembers.filter(p=>!hasRoleFn(p));
  if (!allMembers.length) return [];

  const playerAgg = tieredMembers.map(p=>{
    const decided = (Array.isArray(p.history)?p.history:[]).filter(x=>x && (x.result==='승'||x.result==='패'));
    const sortedDesc = [...decided].sort((a,b)=>_urDateNum(b.date||b.d||'')-_urDateNum(a.date||a.d||''));
    let streak = 0;
    for (const x of sortedDesc) { if (x.result==='승') streak++; else break; }
    const win = decided.filter(x=>x.result==='승').length;
    const loss = decided.length - win;
    return { p, win, loss, games:decided.length, wr:decided.length?Math.round(win/decided.length*100):null, streak };
  });
  let totalW=0, totalL=0;
  playerAgg.forEach(x=>{ totalW+=x.win; totalL+=x.loss; });
  const totalG = totalW+totalL;
  const totalWr = totalG>0 ? Math.round(totalW/totalG*100) : null;

  const queue = [];
  queue.push({text:`${univName} 대학 리포트를 읽어드리겠습니다.`});
  _urPushSpoken(queue, `총 ${allMembers.length}명이 소속되어 있고, 일반 ${tieredMembers.length}명, 직책 ${roledMembers.length}명입니다.`);

  if (totalG>0) {
    _urPushSpoken(queue, `통산 전적은 ${totalG}전 ${totalW}승 ${totalL}패, 승률 ${totalWr}%입니다.`);
  } else {
    queue.push({text:`아직 등록된 통산 전적이 없습니다.`});
  }

  const RACE_KO = {P:'프로토스', T:'테란', Z:'저그'};
  const raceCts = {P:0,T:0,Z:0,'?':0};
  tieredMembers.forEach(p=>{ const r=p.race||'?'; raceCts[r in raceCts?r:'?']++; });
  const raceParts = ['P','T','Z'].filter(r=>raceCts[r]>0).map(r=>`${RACE_KO[r]} ${raceCts[r]}명`);
  if (raceParts.length) _urPushSpoken(queue, `종족 구성은 ${raceParts.join(', ')}입니다.`);

  const topWinners = _urTopWinners(playerAgg, 1);
  if (topWinners.length) {
    const x = topWinners[0];
    const spName = (window.SUTTS && window.SUTTS.speakName) ? window.SUTTS.speakName(x.p) : x.p.name;
    _urPushSpoken(queue, `팀 내 다승왕은 ${spName}로, ${x.win}승 ${x.loss}패를 기록했습니다.`);
  }

  const topStreaks = _urTopStreaks(playerAgg, 1);
  if (topStreaks.length) {
    const x = topStreaks[0];
    const spName = (window.SUTTS && window.SUTTS.speakName) ? window.SUTTS.speakName(x.p) : x.p.name;
    _urPushSpoken(queue, `현재 연승 리더는 ${spName}로, ${x.streak}연승을 달리고 있습니다.`);
  }

  const rivals = _urRivalStats(tieredMembers, univName);
  if (rivals.length) {
    const top = rivals[0];
    _urPushSpoken(queue, `가장 많이 맞붙은 라이벌 대학은 ${top.name}로, ${top.w}승 ${top.l}패를 기록했습니다.`);
  }

  queue.push({text:`이상으로 ${univName} 대학 리포트를 마칩니다.`});
  return queue;
}

function _urSpeakBtnLabel(){
  const btn = document.getElementById('ur-report-speak-btn');
  if (!btn) return;
  const speaking = !!(window.SUTTS && window.SUTTS.isSpeaking());
  const paused = !speaking && !!(window.SUTTS && window.SUTTS.isPaused && window.SUTTS.isPaused());
  btn.innerHTML = speaking ? '⏸<span>일시정지</span>' : (paused ? '▶<span>이어듣기</span>' : '🔊<span>음성듣기</span>');
}

function _urToggleSpeak(){
  if (!window.SUTTS || !('speechSynthesis' in window)) { alert('이 브라우저는 음성 안내를 지원하지 않습니다.'); return; }
  if (window.SUTTS.isSpeaking()) { window.SUTTS.pause(); _urSpeakBtnLabel(); return; }
  if (window.SUTTS.isPaused && window.SUTTS.isPaused()) { window.SUTTS.resume(); _urSpeakBtnLabel(); return; }
  const queue = _urBuildSpeakQueue();
  if (!queue.length) { alert('음성으로 읽어줄 리포트 내용이 없습니다.'); return; }
  window.SUTTS.speak(queue, { onEnd:_urSpeakBtnLabel });
  _urSpeakBtnLabel();
}

/* ─── 📸 대학 리포트 이미지 저장 (스트리머 리포트처럼 배경 스타일 여러 개 선택 가능) ─── */
var UR_BG_STYLES = [
  ['none','⚪ 기본'],
  ['univ','🏫 대학색'],
  ['report','📄 보고서']
];
function _urHexToRgba(hex, a){
  try{
    let h = String(hex||'').replace('#','');
    if (h.length===3) h = h.split('').map(c=>c+c).join('');
    const r=parseInt(h.substring(0,2),16), g=parseInt(h.substring(2,4),16), b=parseInt(h.substring(4,6),16);
    if ([r,g,b].some(isNaN)) throw 0;
    return `rgba(${r},${g},${b},${a})`;
  }catch(e){ return `rgba(37,99,235,${a})`; }
}
function _urStyleFrameColor(style, univName){
  if (style==='univ') return (univName && typeof gc==='function') ? (gc(univName)||'#6366f1') : '#6366f1';
  if (style==='report') return '#0f172a';
  return null;
}
function _urPageBgColor(){
  try{
    const el = document.getElementById('ur-report-capture');
    const src = (el && el.parentElement) || document.body;
    const cs = getComputedStyle(src);
    const varBg = cs.getPropertyValue('--bg');
    if (varBg && varBg.trim()) return varBg.trim();
    const bgColor = cs.backgroundColor;
    if (bgColor && bgColor!=='rgba(0, 0, 0, 0)' && bgColor!=='transparent') return bgColor;
  }catch(e){}
  return '#f1f5f9';
}
/* '보고서' 스타일 전용: 화려한 그림자/그라디언트/큰 라운드 대신 얇은 테두리·직각 모서리로 변형 */
var UR_REPORT_MODE_CSS = [
  '.ur-report-mode .ur-hero{background:#fff!important;border:1px solid #cbd5e1!important;border-bottom:3px solid #0f172a!important;border-radius:2px!important;backdrop-filter:none!important}',
  '.ur-report-mode .ur-panel{background:#fff!important;border:1px solid #e2e8f0!important;border-radius:2px!important;box-shadow:none!important}',
  '.ur-report-mode .ur-panel-title{border-bottom:2px solid #0f172a;padding-bottom:9px}',
  '.ur-report-mode .ur-kpi{border-radius:2px!important;background:#f8fafc!important;border:1px solid #e2e8f0!important;box-shadow:none!important}',
  '.ur-report-mode .ur-badge,.ur-report-mode .ur-roster-tier,.ur-report-mode .ur-winner-row,.ur-report-mode .ur-rival-row{border-radius:3px!important}',
  '.ur-report-mode .ur-roster-card{border-radius:4px!important}',
  '.ur-report-mode .ur-bar-track{border-radius:2px!important}',
  '.ur-report-mode, .ur-report-mode *{box-shadow:none!important}'
].join('');

async function _urGenerateReportCanvas(style){
  const el = document.getElementById('ur-report-capture');
  if (!el) throw new Error('캡처할 리포트가 없습니다.');
  const univName = window._urName;
  const frameColor = (style==='univ') ? _urStyleFrameColor(style, univName) : null;
  const bgFill = frameColor ? _urHexToRgba(frameColor, 0.16) : (style==='report' ? '#ffffff' : _urPageBgColor());
  try{ await (window.ensureHtml2Canvas && window.ensureHtml2Canvas()); }catch(e){}
  if (typeof _imgToDataUrls==='function') await _imgToDataUrls(el);
  try{ if (typeof _waitForImages==='function') await _waitForImages(el,1500); }catch(e){}
  try{ if (typeof _sanitizeUnsupportedCssFunctions==='function') _sanitizeUnsupportedCssFunctions(el); }catch(e){}
  return await html2canvas(el, {
    backgroundColor:bgFill, scale:2, useCORS:true, allowTaint:false, logging:false, imageTimeout:15000,
    onclone:(clonedDoc)=>{
      try{ clonedDoc.querySelectorAll('.no-export').forEach(n=>n.remove()); }catch(e){}
      try{ if (typeof _sanitizeUnsupportedColorsInDoc==='function') _sanitizeUnsupportedColorsInDoc(clonedDoc); }catch(e){}
      if (style==='report') {
        try{
          const cloneEl = clonedDoc.getElementById('ur-report-capture');
          if (cloneEl) cloneEl.classList.add('ur-report-mode');
          const styleTag = clonedDoc.createElement('style');
          styleTag.textContent = UR_REPORT_MODE_CSS;
          clonedDoc.head.appendChild(styleTag);
        }catch(e){}
      }
    }
  });
}

async function _urSaveReportImage(){
  const el = document.getElementById('ur-report-capture');
  if (!el) { alert('캡처할 리포트가 없습니다.'); return; }
  const name = window._urName || '대학';
  const style = window._urReportBgStyle || 'none';
  try{
    if (typeof _showSaveLoading==='function') _showSaveLoading();
    const canvas = await _urGenerateReportCanvas(style);
    window._urPendingSaveCanvas = canvas;
    window._urPendingSaveName = `${name}_대학리포트.png`;
    _urShowImagePreview(canvas, style);
  }catch(e){ alert('이미지 저장 오류: '+e.message); }
  finally{ if (typeof _hideSaveLoading==='function') _hideSaveLoading(); }
}

async function _urSwitchBgStyle(style){
  if (window._urBgSwitchBusy) return;
  window._urBgSwitchBusy = true;
  const wrap = document.getElementById('ur-img-preview-overlay');
  if (wrap) wrap.classList.add('ur-bg-loading');
  try{
    const canvas = await _urGenerateReportCanvas(style);
    window._urPendingSaveCanvas = canvas;
    window._urReportBgStyle = style;
    const imgEl = wrap ? wrap.querySelector('.ur-img-preview-body img') : null;
    if (imgEl) imgEl.src = canvas.toDataURL('image/png');
    if (wrap) wrap.querySelectorAll('.ur-bgstyle-btn').forEach(b=>b.classList.toggle('on', b.dataset.style===style));
  }catch(e){ alert('배경 변경 오류: '+e.message); }
  finally{ window._urBgSwitchBusy = false; if (wrap) wrap.classList.remove('ur-bg-loading'); }
}

function _urShowImagePreview(canvas, style){
  _urCloseImagePreview();
  const dataUrl = canvas.toDataURL('image/png');
  const curStyle = style || window._urReportBgStyle || 'none';
  const univName = window._urName;
  const wrap = document.createElement('div');
  wrap.id = 'ur-img-preview-overlay';
  wrap.style.cssText = 'position:fixed;inset:0;z-index:99999;background:rgba(15,23,42,.6);display:flex;align-items:center;justify-content:center;padding:20px';
  wrap.innerHTML = `
    <div style="background:var(--white);border-radius:20px;max-width:520px;width:100%;max-height:88vh;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 30px 60px rgba(0,0,0,.3)">
      <div style="display:flex;align-items:center;justify-content:space-between;padding:14px 16px;border-bottom:1px solid var(--border2);font-weight:900;font-size:14px;color:var(--text1)">
        <span>🖼️ 대학 리포트 이미지 미리보기</span>
        <button type="button" onclick="_urCloseImagePreview()" style="border:none;background:none;font-size:16px;cursor:pointer;color:var(--text3)">✕</button>
      </div>
      <div style="display:flex;gap:6px;flex-wrap:wrap;padding:10px 14px;border-bottom:1px solid var(--border2)">
        ${UR_BG_STYLES.map(([k,lbl])=>{
          const c = _urStyleFrameColor(k, univName);
          const dot = c ? `<span style="width:9px;height:9px;border-radius:50%;background:${c};display:inline-block;margin-right:5px"></span>` : `<span style="width:9px;height:9px;border-radius:50%;background:var(--border2);display:inline-block;margin-right:5px"></span>`;
          return `<button type="button" class="ur-btn ur-bgstyle-btn${k===curStyle?' on':''}" data-style="${k}" onclick="_urSwitchBgStyle('${k}')" style="${k===curStyle?'background:var(--blue);border-color:var(--blue);color:#fff':''}">${dot}${lbl}</button>`;
        }).join('')}
      </div>
      <div class="ur-img-preview-body" style="flex:1;overflow:auto;padding:14px;background:var(--surface)"><img src="${dataUrl}" style="width:100%;border-radius:10px;display:block" alt="대학 리포트 미리보기"></div>
      <div style="display:flex;gap:8px;justify-content:flex-end;padding:12px 16px;border-top:1px solid var(--border2)">
        <button type="button" class="ur-btn" onclick="_urCloseImagePreview()">취소</button>
        <button type="button" class="ur-btn ur-btn-primary" onclick="_urConfirmSaveImage()">📥 다운로드</button>
      </div>
    </div>`;
  wrap.addEventListener('click', (e)=>{ if (e.target===wrap) _urCloseImagePreview(); });
  document.body.appendChild(wrap);
}

function _urCloseImagePreview(){
  const el = document.getElementById('ur-img-preview-overlay');
  if (el) el.remove();
}

async function _urConfirmSaveImage(){
  const canvas = window._urPendingSaveCanvas;
  const filename = window._urPendingSaveName || '대학리포트.png';
  _urCloseImagePreview();
  if (!canvas) return;
  try{
    if (typeof _showSaveLoading==='function') _showSaveLoading();
    if (typeof _saveCanvasImage==='function') {
      await _saveCanvasImage(canvas, filename, 'png');
    } else {
      const a = document.createElement('a');
      a.href = canvas.toDataURL('image/png');
      a.download = filename;
      a.click();
    }
  }catch(e){ alert('이미지 저장 오류: '+e.message); }
  finally{
    if (typeof _hideSaveLoading==='function') _hideSaveLoading();
    window._urPendingSaveCanvas = null;
  }
}

try{
  window._urToggleSpeak = _urToggleSpeak;
  window._urSaveReportImage = _urSaveReportImage;
  window._urSwitchBgStyle = _urSwitchBgStyle;
  window._urCloseImagePreview = _urCloseImagePreview;
  window._urConfirmSaveImage = _urConfirmSaveImage;
}catch(e){}
