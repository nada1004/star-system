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
    '.ur-univ-picker-wrap{display:flex;flex-direction:column;gap:10px}',
    '.ur-univ-filter-input{width:100%;max-width:320px;padding:9px 12px;border-radius:12px;border:1.5px solid var(--border2);background:var(--white);font-size:12.5px;font-weight:700;color:var(--text1)}',
    '.ur-univ-filter-input:focus{outline:none;border-color:var(--blue)}',
    '.ur-univ-picker-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(92px,1fr));gap:8px}',
    '.ur-univ-btn{display:flex;flex-direction:column;align-items:center;gap:5px;padding:10px 6px 9px;border-radius:14px;border:1.5px solid var(--border2);background:var(--white);cursor:pointer;transition:transform .14s,box-shadow .14s,border-color .14s;font-family:inherit}',
    '.ur-univ-btn:hover{transform:translateY(-2px);box-shadow:0 10px 20px rgba(15,23,42,.1);border-color:var(--ubtn-col)}',
    '.ur-univ-btn:active{transform:translateY(0) scale(.96);transition-duration:.06s}',
    '.ur-univ-btn.is-sel{border-color:var(--ubtn-col);background:linear-gradient(180deg,color-mix(in srgb,var(--ubtn-col) 12%,var(--white)),var(--white));box-shadow:0 0 0 2px color-mix(in srgb,var(--ubtn-col) 30%,transparent)}',
    '.ur-univ-btn-logo{width:32px;height:32px;border-radius:50%;overflow:hidden;display:flex;align-items:center;justify-content:center;font-size:16px;background:var(--surface);flex-shrink:0}',
    '.ur-univ-btn-logo img{width:100%;height:100%;object-fit:cover}',
    '.ur-univ-btn-name{font-size:10.5px;font-weight:800;color:var(--text2);max-width:80px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
    '.ur-univ-btn.is-sel .ur-univ-btn-name{color:var(--ubtn-col)}',
    'body.dark .ur-univ-btn{background:rgba(15,23,42,.7);border-color:#334155}',
    'body.dark .ur-univ-filter-input{background:rgba(15,23,42,.7);border-color:#334155;color:var(--text1)}',
    'body.dark .ur-univ-btn.is-sel{background:linear-gradient(180deg,color-mix(in srgb,var(--ubtn-col) 22%,rgba(15,23,42,.7)),rgba(15,23,42,.7))}',
    '.ur-empty{padding:60px 20px;text-align:center;color:var(--text2)}',
    '.ur-hero{display:flex;align-items:center;flex-wrap:wrap;gap:16px;padding:22px 24px;border-radius:24px;border:1px solid rgba(148,163,184,.18);box-shadow:0 18px 32px rgba(15,23,42,.06);margin:14px 0;position:relative;overflow:hidden;backdrop-filter:blur(18px) saturate(1.3);-webkit-backdrop-filter:blur(18px) saturate(1.3)}',
    '.ur-hero::before{content:"";position:absolute;top:-40%;right:-10%;width:60%;height:180%;background:radial-gradient(circle,var(--ur-hero-glow,rgba(148,163,184,.16)) 0%,transparent 70%);pointer-events:none}',
    '.ur-hero::after{content:"";position:absolute;left:0;top:0;width:5px;height:100%;background:var(--ur-hero-accent,transparent)}',
    '.ur-hero-logo{width:72px;height:72px;flex-shrink:0;display:flex;align-items:center;justify-content:center;background:transparent;box-shadow:none;position:relative;z-index:1}',
    '.ur-hero>div:not(.ur-hero-logo),.ur-hero-actions{position:relative;z-index:1}',
    '.ur-hero-logo img{width:96%;height:96%;object-fit:contain;filter:drop-shadow(0 4px 10px rgba(15,23,42,.18))}',
    '.ur-hero-name{font-size:24px;font-weight:950;letter-spacing:-.03em;color:var(--text1)}',
    '.ur-hero-badges{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}',
    '.ur-hero-actions{display:flex;gap:6px;flex-shrink:0;margin-left:auto;align-self:flex-start}',
    '@media(max-width:640px){.ur-hero-actions{margin-left:0;align-self:stretch;width:100%;justify-content:flex-end;order:3}}',
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
    '.ur-roster-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(112px,1fr));gap:10px}',
    '.ur-roster-card{position:relative;aspect-ratio:.78;border-radius:16px;overflow:hidden;cursor:pointer;background:#0b1120;isolation:isolate;transition:transform .18s ease,box-shadow .18s ease}',
    '.ur-roster-card:hover{transform:translateY(-3px);box-shadow:0 16px 30px rgba(15,23,42,.2)!important}',
    '.ur-roster-card:active{transform:translateY(-1px) scale(.97);transition-duration:.06s}',
    '.ur-roster-photo{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:top center;z-index:0;transition:transform .4s ease}',
    '.ur-roster-card:hover .ur-roster-photo{transform:scale(1.06)}',
    '.ur-roster-fallback{position:absolute;inset:0;align-items:center;justify-content:center;font-size:32px;font-weight:900;color:#fff;z-index:0}',
    '.ur-roster-bottom{position:absolute;left:0;right:0;bottom:0;z-index:2;padding:8px 8px 9px;display:flex;flex-direction:column;gap:4px;background:linear-gradient(180deg,rgba(2,4,14,0) 0%,rgba(2,4,14,.05) 28%,rgba(2,4,14,.32) 56%,rgba(2,4,14,.7) 82%,rgba(2,4,14,.86) 100%)}',
    '.ur-roster-sort-wrap{display:flex;align-items:center;gap:4px;margin-left:auto}',
    '.ur-roster-sort{font-size:10.5px;font-weight:800;color:var(--text2);background:var(--surface);border:1px solid var(--border2);border-radius:8px;padding:4px 8px;cursor:pointer}',
    'body.dark .ur-roster-sort{background:rgba(15,23,42,.7);border-color:#334155;color:var(--text2)}',
    '.ur-rival-logo,.ur-recent-avatar{width:20px;height:20px;border-radius:50%;overflow:hidden;flex-shrink:0;display:inline-flex;align-items:center;justify-content:center;background:var(--surface);font-size:10px}',
    '.ur-rival-logo img,.ur-recent-avatar img{width:100%;height:100%;object-fit:cover}',
    '.ur-recent-table td.ur-recent-name-cell,.ur-recent-table td.ur-recent-opp-cell{display:flex;align-items:center;gap:6px}',
    '.ur-roster-name{font-size:11.5px;font-weight:900;color:#fff;text-shadow:0 1px 3px rgba(0,0,0,.7),0 2px 8px rgba(0,0,0,.5);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
    '.ur-roster-tier{font-size:9px;font-weight:900;padding:1px 7px;border-radius:999px;align-self:flex-start;box-shadow:0 2px 6px rgba(0,0,0,.25)}',
    '.ur-winner-row,.ur-rival-row{display:flex;align-items:center;gap:9px;padding:7px 4px;border-radius:10px;cursor:pointer;transition:background .12s}',
    '.ur-winner-row:hover,.ur-rival-row:hover{background:var(--surface)}',
    '.ur-winner-row+.ur-winner-row,.ur-rival-row+.ur-rival-row{border-top:1px solid var(--border2)}',
    '.ur-mini-avatar{width:28px;height:28px;border-radius:var(--su_profile_radius,50%);clip-path:var(--su_profile_clip,none);overflow:hidden;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:900;color:#fff}',
    '.ur-mini-avatar img{width:100%;height:100%;object-fit:cover}',
    '.ur-bar-track{flex:1;height:9px;border-radius:5px;overflow:hidden;background:var(--border2)}',
    '.ur-recent-table{width:100%;border-collapse:collapse;font-size:12px}',
    '.ur-recent-table td{padding:6px 6px;border-bottom:1px solid var(--border2)}',
    '.ur-recent-table tr:last-child td{border-bottom:none}',
    '.ur-tr-matrix-wrap{overflow-x:auto}',
    '.ur-tr-matrix{width:100%;border-collapse:collapse;font-size:12px;min-width:420px}',
    '.ur-tr-matrix th{padding:6px 8px;font-size:11px;font-weight:800;color:var(--text3);text-align:center;border-bottom:1.5px solid var(--border2)}',
    '.ur-tr-matrix th:first-child{text-align:left}',
    '.ur-tr-matrix td{padding:7px 8px;text-align:center;border-bottom:1px solid var(--border2);font-weight:700;color:var(--text2)}',
    '.ur-tr-matrix td:first-child{text-align:left}',
    '.ur-tr-matrix tr:last-child td{border-bottom:none}',
    '.ur-tr-tier-badge{display:inline-flex;align-items:center;padding:2px 9px;border-radius:7px;font-size:11px;font-weight:900}',
    '.ur-tr-wr{font-weight:900}',
    '.ur-tr-g{display:block;font-size:10px;font-weight:600;color:var(--text3);margin-top:1px}',
    '.ur-tr-dash{color:var(--text3);font-weight:600}',
    'body.dark .ur-tr-matrix th{border-bottom-color:#334155}',
    'body.dark .ur-tr-matrix td{border-bottom-color:#334155}',
    'body.dark .ur-kpi,body.dark .ur-panel,body.dark .ur-btn{background:rgba(15,23,42,.7)!important;border-color:#334155!important}',
    'body.dark .ur-btn-primary{background:var(--blue)!important;border-color:var(--blue)!important;color:#fff!important}',
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
  const filterInput = document.getElementById('ur-univ-filter-input');
  if (filterInput) { filterInput.value=''; }
  if (typeof render==='function') render();
}

function _urFilterUnivButtons(v){
  const q = String(v||'').trim().toLowerCase();
  const grid = document.getElementById('ur-univ-picker-grid');
  if (!grid) return;
  grid.querySelectorAll('.ur-univ-btn').forEach(btn=>{
    const name = String(btn.dataset.uname||'').toLowerCase();
    btn.style.display = (!q || name.includes(q)) ? '' : 'none';
  });
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

// 팀 전체 최근 경기 (모든 소속 인원의 경기를 합쳐서 반환 — 정렬/필터/페이지는 렌더 단계에서 처리)
function _urRecentMatches(members){
  // 상대 닉네임 → 상대 선수 객체 (프로필 사진 조회용)
  const nameToPlayer = {};
  (typeof players!=='undefined' ? players : []).forEach(p=>{ if (p && p.name) nameToPlayer[p.name] = p; });
  const rows = [];
  members.forEach(p=>{
    (Array.isArray(p.history)?p.history:[]).forEach(h=>{
      if (!h || (h.result!=='승' && h.result!=='패')) return;
      const oppName = h.opp||'';
      const oppP = nameToPlayer[String(oppName).trim()] || null;
      rows.push({
        name:p.name, photo:p.photo||'', secondProfileFile:p.secondProfileFile||'',
        date:h.date||h.d||'', result:h.result,
        opp:oppName, oppPhoto: oppP ? (oppP.photo||'') : '', oppSecondProfileFile: oppP ? (oppP.secondProfileFile||'') : '',
        map:h.map||''
      });
    });
  });
  return rows;
}

function _urAvatarHTML(p, col, size){
  const s = size||56;
  const photo = p.photo ? (typeof toThumbUrl==='function'?toThumbUrl(p.photo,s):p.photo) : '';
  const photoOrig = p.photo ? (typeof toHttpsUrl==='function'?toHttpsUrl(p.photo):p.photo) : '';
  const initials = (p.name||'?').slice(0,1);
  const _2nd = (typeof _phSwap2ndHTML==='function' && p.secondProfileFile) ? _phSwap2ndHTML(p.secondProfileFile, {style:'width:100%;height:100%;object-fit:cover;border-radius:inherit'}) : '';
  if (photo) {
    return `<span class="ur-mini-avatar${_2nd?' ph-swap':''}" style="width:${s}px;height:${s}px;background:${col}33"><img src="${photo}" data-orig="${photoOrig}" onerror="if(this.dataset.orig&&this.src!==this.dataset.orig){this.src=this.dataset.orig}else{this.style.display='none'}">${_2nd}</span>`;
  }
  return `<span class="ur-mini-avatar" style="width:${s}px;height:${s}px;background:${col}">${initials}</span>`;
}

// 최근 경기 표용 미니 아바타 (본인/상대 공통, 마우스 오버 시 두번째 프로필 사진 프리뷰)
function _urRecentAvatarHTML(name, photo, secondProfileFile, col){
  const src = photo ? (typeof toThumbUrl==='function'?toThumbUrl(photo,20):photo) : '';
  const srcOrig = photo ? (typeof toHttpsUrl==='function'?toHttpsUrl(photo):photo) : '';
  const initial = (name||'?').slice(0,1);
  const _2nd = (typeof _phSwap2ndHTML==='function' && secondProfileFile) ? _phSwap2ndHTML(secondProfileFile, {style:'width:100%;height:100%;object-fit:cover;border-radius:inherit'}) : '';
  const inner = src
    ? `<img src="${src}" data-orig="${srcOrig}" onerror="if(this.dataset.orig&&this.src!==this.dataset.orig){this.src=this.dataset.orig}else{this.style.display='none'}">${_2nd}`
    : initial;
  return `<span class="ur-recent-avatar${_2nd?' ph-swap':''}" style="background:${col}">${inner}</span>`;
}

function statsUnivReportHTML(){
  _urInjectStyle();

  const univName = window._urName || '';
  const allUnivList = _urVisUnivList();

  let h = `<div class="ssec">
    <div class="stats-chart-toolbar" style="margin-bottom:14px">
      <div>
        <h4 style="margin:0">🏛️ 대학 리포트</h4>
        <div style="font-size:11px;color:var(--text2);margin-top:4px">대학 버튼을 누르면 로스터, 종족·티어 구성, 종족별 승률, 티어별 종족 승률, 최근 7일 활동 추이, 팀 내 다승왕·연승 리더, 라이벌 대학 상대전적, 최근 경기까지 한 번에 볼 수 있습니다.</div>
      </div>
    </div>
    <div class="ur-univ-picker-wrap">
      ${allUnivList.length>10?`<input id="ur-univ-filter-input" class="ur-univ-filter-input" type="text" placeholder="🔍 목록 필터링..." value="" oninput="_urFilterUnivButtons(this.value)" autocomplete="off">`:''}
      <div id="ur-univ-picker-grid" class="ur-univ-picker-grid">
        ${allUnivList.map(u=>{
          const uCol = (typeof gc==='function' ? gc(u.name) : '') || '#64748b';
          const uIconUrl = u.icon || u.img || (typeof UNIV_ICONS!=='undefined'?UNIV_ICONS[u.name]:'') || '';
          const uLogoSrc = uIconUrl ? (typeof toHttpsUrl==='function'?toHttpsUrl(uIconUrl):uIconUrl) : '';
          const isSel = u.name===univName;
          const safeU = String(u.name||'').replace(/'/g,"\\'");
          return `<button type="button" class="ur-univ-btn${isSel?' is-sel':''}" data-uname="${escHTML(u.name)}" style="--ubtn-col:${uCol}" onclick="_urSelectUniv('${safeU}')">
            <span class="ur-univ-btn-logo">${uLogoSrc?`<img src="${uLogoSrc}" onerror="this.parentNode.textContent='🏫'">`:'🏫'}</span>
            <span class="ur-univ-btn-name">${escHTML(u.name)}</span>
          </button>`;
        }).join('')}
      </div>
    </div>
  </div>`;

  const uCfg = univName ? (typeof univCfg!=='undefined'?univCfg:[]).find(u=>u && u.name===univName) : null;

  if (!univName || !uCfg) {
    h += `<div class="ur-empty"><div style="font-size:40px;margin-bottom:10px">🏛️</div>대학 버튼을 눌러서 리포트를 확인해보세요</div>`;
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
  // (수정) 종족 미정('?') 선수의 전적이 위 "통산 승률" 배지에는 포함되는데
  // 여기서는 누락돼 숫자가 안 맞는 문제가 있었음 → '?' 버킷도 함께 집계.
  const raceRecord = {P:{w:0,l:0},T:{w:0,l:0},Z:{w:0,l:0},'?':{w:0,l:0}};
  tieredMembers.forEach(p=>{
    const r = (p.race in raceRecord) ? p.race : '?';
    (Array.isArray(p.history)?p.history:[]).forEach(h=>{
      if (h.result==='승') raceRecord[r].w++;
      else if (h.result==='패') raceRecord[r].l++;
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
  h += `<div class="ur-hero" style="background:linear-gradient(135deg,${col}22,${col}08);border-color:${col}33;--ur-hero-glow:${col}2e;--ur-hero-accent:${col}">
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

  // 티어별 × 종족별 승률 매트릭스
  const tierRaceMatrix = orderedTiers.map(t=>{
    const tMembers = tieredMembers.filter(p=>(p.tier||'미정')===t);
    const rec = {P:{w:0,l:0},T:{w:0,l:0},Z:{w:0,l:0}};
    tMembers.forEach(p=>{
      if (!(p.race in rec)) return;
      (Array.isArray(p.history)?p.history:[]).forEach(h=>{
        if (h.result==='승') rec[p.race].w++;
        else if (h.result==='패') rec[p.race].l++;
      });
    });
    return { tier:t, n:tMembers.length, rec };
  });

  // ⚔️ 종족별 승률
  h += `<div class="ur-panel">
    <div class="ur-panel-title">⚔️ 종족별 승률 <span style="margin-left:auto;font-size:11px;color:var(--text3);font-weight:600">전체 기간 통산</span></div>
    <div style="display:flex;flex-direction:column;gap:11px">
      ${[{r:'P',c:'#7c3aed',l:'🔮 프로토스'},{r:'T',c:'#0284c7',l:'⚔️ 테란'},{r:'Z',c:'#059669',l:'🦎 저그'}]
        .concat(raceRecord['?'].w+raceRecord['?'].l>0 ? [{r:'?',c:'#64748b',l:'❔ 종족 미정'}] : [])
        .map(({r,c,l})=>{
        const rec=raceRecord[r]; const g=rec.w+rec.l; const wr=g>0?Math.round(rec.w/g*100):null;
        // (수정) 단순 alpha 투명도 대신, 스트리머 리포트(맵별 성적/다승왕/라이벌전)에서
        // 이미 검증된 HSL 기반 틴트 헬퍼(_prTintByPercent)를 재사용 — hue를 고정한 채
        // 채도·명도만 승률에 따라 움직여서, alpha blending에서 생기는 탁한 중간톤 없이
        // "그 종족색의 옅은 버전 ~ 진한 버전"으로 자연스럽게 표현됨.
        const rWrBarColor = (typeof _prTintByPercent==='function')
          ? _prTintByPercent(wr===null?1:wr, c, 95).css
          : ((typeof _urHexToRgba==='function') ? _urHexToRgba(c, wr===null?0.14:0.22+(wr/100)*0.78) : c);
        return `<div>
          <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:4px">
            <span style="font-size:12px;font-weight:800;color:${c}">${l}</span>
            <span style="font-size:12px;font-weight:900;color:${c}">${wr!==null?wr+'%':'-'}<span style="font-weight:600;color:var(--text3);margin-left:5px">${rec.w}승 ${rec.l}패</span></span>
          </div>
          <div class="ur-bar-track"><div style="width:${wr??0}%;height:100%;background:${rWrBarColor};border-radius:5px;transition:width .6s ease,background .3s ease"></div></div>
        </div>`;
      }).join('')}
    </div>
  </div>`;

  // 🏆 티어별 종족 승률 (매트릭스)
  if (tierRaceMatrix.length) {
    h += `<div class="ur-panel">
      <div class="ur-panel-title">🏆 티어별 종족 승률 <span style="margin-left:auto;font-size:11px;color:var(--text3);font-weight:600">전체 기간 통산</span></div>
      <div class="ur-tr-matrix-wrap"><table class="ur-tr-matrix"><thead><tr>
        <th>티어</th>
        <th style="color:#7c3aed">🔮 P</th>
        <th style="color:#0284c7">⚔️ T</th>
        <th style="color:#059669">🦎 Z</th>
      </tr></thead><tbody>
        ${tierRaceMatrix.map(({tier,n,rec})=>{
          const tc = typeof getTierBtnColor==='function' ? getTierBtnColor(tier) : '#64748b';
          const tcol = typeof getTierBtnTextColor==='function' ? (getTierBtnTextColor(tier)||'#fff') : '#fff';
          const cellHtml = r=>{
            const x=rec[r]; const g=x.w+x.l;
            if (!g) return `<span class="ur-tr-dash">-</span>`;
            const wr=Math.round(x.w/g*100);
            const wc = wr>=55?'#10b981':wr>=45?'#f59e0b':'#ef4444';
            return `<span class="ur-tr-wr" style="color:${wc}">${wr}%</span><span class="ur-tr-g">${x.w}승${x.l}패</span>`;
          };
          return `<tr>
            <td><span class="ur-tr-tier-badge" style="background:${tc};color:${tcol}">${escHTML(tier)}</span><span style="margin-left:6px;font-size:11px;font-weight:700;color:var(--text3)">${n}명</span></td>
            <td>${cellHtml('P')}</td>
            <td>${cellHtml('T')}</td>
            <td>${cellHtml('Z')}</td>
          </tr>`;
        }).join('')}
      </tbody></table></div>
      <div style="font-size:10.5px;color:var(--text3);margin-top:8px">※ 해당 티어 소속 부원들의 전체 커리어 전적(대회 구분 없이 통합) 기준</div>
    </div>`;
  }

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
        const wrColBar = (typeof _prTintByPercent==='function') ? _prTintByPercent(x.wr, col, 95).css : (x.wr===null?'#94a3b8':x.wr>=60?'#10b981':x.wr>=40?'#f59e0b':'#ef4444');
        // 퍼센트 숫자는 카드 배경(흰색 계열) 위에 직접 얹히는 텍스트라, 배경용과 달리
        // 너무 옅어지면(대학색이 연할 때) 안 보이므로 명도 상한을 낮게 잡아 항상 읽히게 함
        const wrColText = (typeof _prTintByPercent==='function') ? _prTintByPercent(x.wr, col, 58).css : wrColBar;
        const safeName = (p.name||'').replace(/'/g,"\\'");
        return `<div class="ur-winner-row" onclick="if(typeof openPlayerModal==='function')openPlayerModal('${safeName}')">
          <span style="width:20px;text-align:center;font-size:12px;font-weight:900;color:var(--text3);flex-shrink:0">${medal}</span>
          ${_urAvatarHTML(p, col, 28)}
          <span style="font-size:12px;font-weight:800;color:${col};min-width:64px;max-width:110px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${escHTML(p.name||'')}</span>
          <div class="ur-bar-track" style="margin:0 6px"><div style="width:${x.wr}%;height:100%;background:${wrColBar};border-radius:5px"></div></div>
          <span style="font-size:11.5px;font-weight:900;color:var(--text2);flex-shrink:0">${x.win}승 ${x.loss}패</span>
          <span style="font-size:11.5px;font-weight:900;color:${wrColText};min-width:36px;text-align:right;flex-shrink:0">${x.wr}%</span>
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
        // (2026-08-19) 라이벌 상대전적 바는 "우리 팀"의 성적을 보여주는 것이라
        // 상대(rCol) 색이 아니라 우리 대학 고유색(col)을 승률에 따라 옅게~진하게
        const rWrColBar = (typeof _prTintByPercent==='function') ? _prTintByPercent(r.wr??0, col, 95).css : (r.wr===null?'#94a3b8':r.wr>=55?'#10b981':r.wr>=45?'#f59e0b':'#ef4444');
        // 퍼센트 숫자는 흰색 카드 배경 위 텍스트라 너무 옅어지면 안 보이므로 명도 상한을 낮춤
        const rWrColText = (typeof _prTintByPercent==='function') ? _prTintByPercent(r.wr??0, col, 58).css : rWrColBar;
        const safeRival = String(r.name||'').replace(/'/g,"\\'");
        const rUCfg = (typeof univCfg!=='undefined'?univCfg:[]).find(u=>u && u.name===r.name);
        const rIconUrl = rUCfg ? (rUCfg.icon || rUCfg.img || (typeof UNIV_ICONS!=='undefined'?UNIV_ICONS[r.name]:'') || '') : '';
        const rLogoSrc = rIconUrl ? (typeof toHttpsUrl==='function'?toHttpsUrl(rIconUrl):rIconUrl) : '';
        const rLogoHtml = rLogoSrc
          ? `<span class="ur-rival-logo"><img src="${rLogoSrc}" onerror="this.parentNode.style.display='none'"></span>`
          : `<span class="ur-rival-logo" style="color:${rCol};font-weight:900">${escHTML((r.name||'?').slice(0,1))}</span>`;
        return `<div class="ur-rival-row" onclick="if(typeof openUnivModal==='function')openUnivModal('${safeRival}')">
          ${rLogoHtml}
          <span style="font-size:12px;font-weight:800;color:${rCol};min-width:70px;max-width:90px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${escHTML(r.name)}</span>
          <div class="ur-bar-track"><div style="width:${r.wr??0}%;height:100%;background:${rWrColBar};border-radius:5px"></div></div>
          <span style="font-size:11.5px;font-weight:900;color:${rWrColText};min-width:38px;text-align:right">${r.wr!==null?r.wr+'%':'-'}</span>
          <span style="font-size:10.5px;color:var(--text3);min-width:64px;text-align:right">${r.w}승 ${r.l}패</span>
        </div>`;
      }).join('')}
    </div>`;
  }

  // 로스터
  const rosterSortKey = (typeof localStorage!=='undefined' && localStorage.getItem('su_ur_roster_sort')) || 'tier';
  const wrByName = new Map(playerAgg.map(x=>[x.p.name, x]));
  const _urRosterSortFn = (a,b)=>{
    if (rosterSortKey==='wr') {
      const wa = wrByName.get(a.name)?.wr, wb = wrByName.get(b.name)?.wr;
      if (wa===null || wa===undefined) return 1;
      if (wb===null || wb===undefined) return -1;
      return wb-wa;
    }
    if (rosterSortKey==='recent') {
      const ha = Array.isArray(a.history)?a.history:[], hb = Array.isArray(b.history)?b.history:[];
      const da = ha.reduce((m,x)=>Math.max(m,_urDateNum(x.date||x.d||'')),0);
      const db = hb.reduce((m,x)=>Math.max(m,_urDateNum(x.date||x.d||'')),0);
      return db-da;
    }
    if (rosterSortKey==='name') return String(a.name||'').localeCompare(String(b.name||''),'ko');
    const ia=TIERS_LOCAL.indexOf(a.tier||''), ib=TIERS_LOCAL.indexOf(b.tier||'');
    return (ia>=0?ia:999)-(ib>=0?ib:999);
  };
  const rosterOrdered = [...roledMembers, ...[...tieredMembers].sort(_urRosterSortFn)];
  const rosterSortOptions = [
    {v:'tier', l:'🏆 티어순'}, {v:'wr', l:'📈 승률순'}, {v:'recent', l:'🕘 최근활동순'}, {v:'name', l:'가나다순'}
  ];
  h += `<div class="ur-panel">
    <div class="ur-panel-title">📋 로스터
      <div class="ur-roster-sort-wrap">
        <select class="ur-roster-sort" onchange="localStorage.setItem('su_ur_roster_sort',this.value);if(typeof render==='function')render();">
          ${rosterSortOptions.map(o=>`<option value="${o.v}" ${o.v===rosterSortKey?'selected':''}>${o.l}</option>`).join('')}
        </select>
        <span style="font-size:11px;color:var(--text3);font-weight:600">${allMembers.length}명</span>
      </div>
    </div>
    <div class="ur-roster-grid">
      ${rosterOrdered.map(p=>{
        const tc = typeof getTierBtnColor==='function' && p.tier ? getTierBtnColor(p.tier) : '#64748b';
        const tcol = typeof getTierBtnTextColor==='function' && p.tier ? (getTierBtnTextColor(p.tier)||'#fff') : '#fff';
        const rIco = p.race==='P'?'🔮':p.race==='T'?'⚔️':p.race==='Z'?'🦎':'';
        const safeName = (p.name||'').replace(/'/g,"\\'");
        const photoUrl = p.photo ? (typeof toThumbUrl==='function'?toThumbUrl(p.photo,220):p.photo) : '';
        const photoOrig = p.photo ? (typeof toHttpsUrl==='function'?toHttpsUrl(p.photo):p.photo) : '';
        const hasPhoto = !!photoUrl;
        const initials = (p.name||'?').slice(0,1);
        const _2ndRoster = (hasPhoto && typeof _phSwap2ndHTML==='function' && p.secondProfileFile)
          ? _phSwap2ndHTML(p.secondProfileFile, {extraClass:'ur-roster-photo', style:'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:top center;z-index:1'})
          : '';
        return `<div class="ur-roster-card${_2ndRoster?' ph-swap':''}" style="box-shadow:0 0 0 1.5px ${col}33,0 8px 18px rgba(15,23,42,.08)" onclick="if(typeof openPlayerModal==='function')openPlayerModal('${safeName}')">
          ${hasPhoto?`<img class="ur-roster-photo" src="${photoUrl}" data-orig="${photoOrig}" loading="lazy" alt="${escHTML(p.name||'')}" onerror="if(this.dataset.orig&&this.src!==this.dataset.orig){this.src=this.dataset.orig}else{this.style.display='none';this.nextElementSibling.style.display='flex'}">`:''}
          ${_2ndRoster}
          <div class="ur-roster-fallback" style="${hasPhoto?'display:none':'display:flex'};background:${col}">${initials}</div>
          <div class="ur-roster-bottom">
            <span class="ur-roster-name">${rIco?rIco+' ':''}${escHTML(p.name||'')}</span>
            ${p.role?`<span class="ur-roster-tier" style="background:${col}cc;color:#fff">${escHTML(p.role)}</span>`:(p.tier?`<span class="ur-roster-tier" style="background:${tc};color:${tcol}">${escHTML(p.tier)}</span>`:'')}
          </div>
        </div>`;
      }).join('')}
    </div>
  </div>`;

  // 최근 경기 (대전기록 탭처럼 연도/월 필터 + 정렬 + 더보기 페이지네이션)
  const _urRecentSection = 'ur-recent';
  const _urAllRecent = _urRecentMatches(tieredMembers);
  const _urRecentFiltered = _urAllRecent.filter(m => typeof passDateFilter!=='function' || passDateFilter(m.date||'', _urRecentSection));
  const _urRecentDir = (typeof recSortDir!=='undefined' && (recSortDir==='asc'||recSortDir==='desc')) ? recSortDir : 'desc';
  const _urRecentSorted = [..._urRecentFiltered].sort((a,b)=> _urRecentDir==='asc' ? (a.date||'').localeCompare(b.date||'') : (b.date||'').localeCompare(a.date||''));
  const _urRecentPageSize = 15;
  window._urRecentPage = window._urRecentPage || {};
  if (window._urRecentPage[univName]===undefined) window._urRecentPage[univName]=0;
  const _urRecentLoaded = (window._urRecentPage[univName]+1)*_urRecentPageSize;
  const recentMatches = _urRecentSorted.slice(0, _urRecentLoaded);
  const _urRecentHasMore = _urRecentSorted.length>recentMatches.length;
  const _urUnivNameEsc = univName.replace(/'/g,"\\'");

  if (_urAllRecent.length) {
    const _urRecentFilterBar = (typeof buildYearMonthFilterControls==='function')
      ? `<div class="hist-inlinebar no-export" style="margin-bottom:10px">
          ${buildYearMonthFilterControls(_urRecentSection, true)}
          <span class="hist-inline-sep"></span>
          <div class="hist-ctrl-group">
            <button class="pill ${_urRecentDir==='desc'?'on':''}" style="flex-shrink:0;white-space:nowrap" onclick="recSortDir='desc';window._urRecentPage=window._urRecentPage||{};window._urRecentPage['${_urUnivNameEsc}']=0;render()">최신순 ↓</button>
            <button class="pill ${_urRecentDir==='asc'?'on':''}" style="flex-shrink:0;white-space:nowrap" onclick="recSortDir='asc';window._urRecentPage=window._urRecentPage||{};window._urRecentPage['${_urUnivNameEsc}']=0;render()">오래된순 ↑</button>
          </div>
        </div>`
      : '';
    h += `<div class="ur-panel">
      <div class="ur-panel-title">📅 최근 경기 <small style="font-weight:700;color:var(--text3);margin-left:4px">${_urRecentSorted.length}경기</small></div>
      ${_urRecentFilterBar}
      ${!recentMatches.length?`<div style="padding:24px;text-align:center;color:var(--gray-l)">선택한 기간에 기록이 없습니다.</div>`:`<table class="ur-recent-table"><tbody>
        ${recentMatches.map(m=>{
          const isWin = m.result==='승';
          const safeMName = String(m.name||'').replace(/'/g,"\\'");
          const safeOppName = String(m.opp||'').replace(/'/g,"\\'");
          const oppAvatarHtml = m.opp ? _urRecentAvatarHTML(m.opp, m.oppPhoto, m.oppSecondProfileFile, '#94a3b8') : '';
          return `<tr>
            <td style="width:76px;color:var(--text3);font-weight:700">${escHTML(String(m.date||'').slice(0,10))}</td>
            <td class="ur-recent-name-cell" style="font-weight:800;color:${col};cursor:pointer" onclick="if(typeof openPlayerModal==='function')openPlayerModal('${safeMName}')">
              ${_urRecentAvatarHTML(m.name, m.photo, m.secondProfileFile, col)}${escHTML(m.name)}
            </td>
            <td style="width:34px;text-align:center;font-weight:900;color:${isWin?'#16a34a':'#dc2626'}">${m.result}</td>
            <td class="ur-recent-opp-cell" style="color:var(--text2);${m.opp?'cursor:pointer':''}" ${m.opp?`onclick="if(typeof openPlayerModal==='function')openPlayerModal('${safeOppName}')"`:''}>
              vs ${oppAvatarHtml}${escHTML(m.opp||'-')}
            </td>
            <td style="width:70px;text-align:right;color:var(--text3);font-size:11px">${escHTML(m.map||'')}</td>
          </tr>`;
        }).join('')}
      </tbody></table>`}
      ${_urRecentSorted.length>_urRecentPageSize?`<div class="no-export" style="display:flex;justify-content:center;align-items:center;gap:8px;margin-top:12px;flex-wrap:wrap">
        <span style="font-size:var(--fs-sm);color:var(--gray-l)">${recentMatches.length} / ${_urRecentSorted.length}건 표시 중</span>
        ${_urRecentHasMore?`<button class="btn btn-sm" onclick="window._urRecentPage=window._urRecentPage||{};window._urRecentPage['${_urUnivNameEsc}']=(window._urRecentPage['${_urUnivNameEsc}']||0)+1;render()">더 보기 ↓</button>`:''}
        ${window._urRecentPage[univName]>0?`<button class="btn btn-sm btn-w" onclick="window._urRecentPage=window._urRecentPage||{};window._urRecentPage['${_urUnivNameEsc}']=0;render()">처음으로</button>`:''}
      </div>`:''}
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
