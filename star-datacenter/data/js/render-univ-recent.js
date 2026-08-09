function _bindUnivRecentDelegatedEvents(){
  if(window._univRecentDelegatedBound) return;
  window._univRecentDelegatedBound = true;
  document.addEventListener('click', (e)=>{
    const el = e.target && e.target.closest ? e.target.closest('[data-ur-action]') : null;
    if(!el) return;
    const action = el.getAttribute('data-ur-action');
    if(action === 'open-univ'){
      e.preventDefault();
      try{ cm('univModal'); }catch(_){}
      const univ = el.getAttribute('data-ur-univ') || '';
      setTimeout(()=>{ if(typeof openUnivModal === 'function') openUnivModal(univ); }, 100);
      return;
    }
    if(action === 'open-player'){
      e.preventDefault();
      try{ cm('univModal'); }catch(_){}
      const name = el.getAttribute('data-ur-player') || '';
      setTimeout(()=>{ if(typeof openPlayerModal === 'function') openPlayerModal(name); }, 100);
    }
  });
}

function buildUnivRecentMatchesHTML(opts){
  const { myMatches=[], univName='', isMobile=false, isTablet=false } = opts || {};
  if(!myMatches.length) return '';
  const _col = gc(univName) || '#2563eb';
  const _hexToRgb = h => { const m=String(h||'').match(/^#([0-9a-f]{6})$/i); if(!m)return '59,130,246'; const n=parseInt(m[1],16); return `${(n>>16)&255},${(n>>8)&255},${n&255}`; };
  const colRgb = _hexToRgb(_col);
  const days=['일','월','화','수','목','금','토'];
  const fmtD = (d) => { if(!d) return ''; try{ const dt=new Date(d+'T00:00:00'); return `${dt.getMonth()+1}/${dt.getDate()}(${days[dt.getDay()]})`; }catch(e){ return d; } };
  const modeColor = (mode) => {
    if(!mode) return '#64748b';
    if(mode.includes('시빌워')) return '#dc2626';
    if(mode.includes('미니')) return '#2563eb';
    if(mode.includes('대학')) return '#7c3aed';
    if(mode.includes('조별리그')) return '#d97706';
    if(mode.includes('일반대회')) return '#0891b2';
    if(mode.includes('대진표')) return '#7c3aed';
    if(mode.includes('대회(구)')) return '#64748b';
    if(mode.includes('프로')) return '#0891b2';
    return '#64748b';
  };
  const recent = myMatches.slice(0,15);
  let h = `<div class="su-sec" style="--su-sec-accent:${_col}">
    <div class="su-sec__title">최근 대전 기록 <small>${recent.length}경기</small></div>
    <div style="display:flex;flex-direction:column;gap:6px">`;

  recent.forEach((m, idx) => {
    const isA = m.a === univName;
    const opp = isA ? m.b : m.a;
    const myS = isA ? m.sa : m.sb;
    const oppS = isA ? m.sb : m.sa;
    const win = myS > oppS;
    const draw = myS === oppS;
    const oc = gc(opp) || '#888';
    const ocRgb = _hexToRgb(oc);
    const mc = modeColor(m.mode||'');
    const _modeShort = (()=>{
      if(m.mode&&m.mode.includes('조별리그')) return '조별리그';
      if(m.mode&&m.mode.includes('일반대회')) return '일반대회';
      if(m.mode&&m.mode.includes('대진표')) return m.mode;
      if(m.mode&&m.mode.includes('대회(구)')) return '대회';
      return m.mode||'대전';
    })();
    const _compSub = (m._compName||m.compName||m.n||'');
    const resultBg = win?'linear-gradient(135deg,#fee2e2,#fecaca)':draw?'linear-gradient(135deg,#fef9c3,#fde68a)':'linear-gradient(135deg,#dbeafe,#bfdbfe)';
    const resultCol = win?'#dc2626':draw?'#d97706':'#2563eb';
    const resultBd = win?'#fca5a5':draw?'#fcd34d':'#93c5fd';
    const leftBarColor = win?'#dc2626':draw?'#f59e0b':'#2563eb';

    const _modeLabel = _compSub
      ? `<div style="display:flex;flex-direction:column;align-items:center;gap:0;background:${mc};color:#fff;font-size:${isMobile?'8.5px':'9.5px'};font-weight:900;padding:3px ${isMobile?'6px':'8px'};border-radius:9px;white-space:nowrap;letter-spacing:.2px;line-height:1.4;text-align:center">${_modeShort}<span style="font-size:7px;font-weight:700;opacity:.88">${_compSub.length>8?_compSub.slice(0,7)+'…':_compSub}</span></div>`
      : `<div style="background:${mc};color:#fff;font-size:${isMobile?'8.5px':'9.5px'};font-weight:900;padding:3px ${isMobile?'7px':'9px'};border-radius:9px;white-space:nowrap;letter-spacing:.2px">${_modeShort}</div>`;

    h += `<div class="ud-match-card" style="background:var(--white,#fff);border:1px solid rgba(148,163,184,.16);border-radius:var(--r2);padding:${isMobile?'10px 12px':'11px 16px'};display:flex;align-items:center;gap:${isMobile?'7px':'11px'};box-shadow:0 2px 10px rgba(${colRgb},.05),0 1px 3px rgba(15,23,42,.04);position:relative;overflow:hidden;transition:box-shadow .15s">
      <!-- 결과 바 -->
      <div style="position:absolute;left:0;top:0;bottom:0;width:4px;background:${leftBarColor};border-radius:2px 0 0 2px"></div>
      <!-- 날짜 -->
      <div style="padding-left:6px;min-width:${isMobile?'48px':'58px'};text-align:center;flex-shrink:0">
        <div style="font-size:${isMobile?'9.5px':'10.5px'};font-weight:800;color:var(--text3,#475569);letter-spacing:.2px">${fmtD(m.d)}</div>
      </div>
      <!-- 종류 배지 -->
      <div style="flex-shrink:0">${_modeLabel}</div>
      <!-- 우리팀 -->
      <div style="display:flex;align-items:center;gap:5px;flex:1;min-width:0;justify-content:flex-end">
        <span style="font-weight:900;font-size:${isMobile?'11.5px':'13px'};color:${_col};white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${univName}</span>
        ${gUI(univName,'14px')}
      </div>
      <!-- 스코어 -->
      <div style="flex-shrink:0;text-align:center;min-width:${isMobile?'62px':'72px'}">
        <div style="font-size:${isMobile?'17px':'20px'};font-weight:1000;line-height:1;letter-spacing:1px">
          <span style="color:${win?'#dc2626':(draw?'var(--text,#1e293b)':'#2563eb')}">${myS}</span>
          <span style="color:rgba(148,163,184,.5);font-size:var(--fs-base);margin:0 2px">:</span>
          <span style="color:${win?'#2563eb':(draw?'var(--text,#1e293b)':'#dc2626')}">${oppS}</span>
        </div>
        <div style="margin-top:4px;display:flex;justify-content:center">
          <span style="font-size:9px;font-weight:900;padding:2px 8px;border-radius:7px;background:${resultBg};color:${resultCol};border:1px solid ${resultBd}">${win?'승':draw?'무':'패'}</span>
        </div>
      </div>
      <!-- 상대팀 -->
      <div style="display:flex;align-items:center;gap:5px;flex:1;min-width:0;justify-content:flex-start">
        ${gUI(opp,'14px')}
        <span style="font-weight:900;font-size:${isMobile?'11.5px':'13px'};color:${oc};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;cursor:pointer" data-ur-action="open-univ" data-ur-univ="${opp.replace(/"/g,'&quot;')}">${opp}</span>
      </div>
    </div>`;
  });
  h += `</div></div>`;
  return h;
}


function buildUnivAceCardsHTML(opts){
  const { members=[], col='' } = opts || {};
  const activeM = members.filter(p=>!p.retired&&(p.win+p.loss)>0);
  if(activeM.length<2) return '';
  const byPoints = [...activeM].sort((a,b)=>(b.points||0)-(a.points||0));
  const byWR = [...activeM].filter(p=>p.win+p.loss>=5).sort((a,b)=>{
    const wa=(a.win+a.loss)?a.win/(a.win+a.loss):0;
    const wb=(b.win+b.loss)?b.win/(b.win+b.loss):0;
    return wb-wa;
  });
  const byElo = [...activeM].sort((a,b)=>(b.elo||ELO_DEFAULT)-(a.elo||ELO_DEFAULT));
  const aces = [
    {label:'🏆 포인트 1위', sub:'Points', p:byPoints[0]},
    {label:'📈 승률 1위', sub:'Win Rate', p:byWR[0]},
    {label:'⚡ ELO 1위', sub:'ELO', p:byElo[0]},
  ].filter(x=>x.p);
  const seen=new Set();
  const uniqueAces=aces.filter(x=>{ if(seen.has(x.p.name))return false; seen.add(x.p.name); return true; });
  if(!uniqueAces.length) return '';
  const rows=uniqueAces.map(({label,sub,p:ap})=>{
    if(!ap) return '';
    const wr=(ap.win+ap.loss)?Math.round(ap.win/(ap.win+ap.loss)*100):0;
    const safeName=escJS(ap.name);
    const _2ndAce = (typeof _phSwap2ndHTML==='function') ? _phSwap2ndHTML(ap.secondProfileFile, {style:`border-radius:var(--su_profile_radius,50%)`}) : '';
    const photoEl=ap.photo
      ?`<span class="${_2ndAce?'ph-swap':''}" style="position:relative;display:inline-flex;width:38px;height:38px;flex-shrink:0"><img src="${toHttpsUrl(ap.photo)}" style="width:38px;height:38px;border-radius:var(--su_profile_radius,50%);object-fit:cover;border:2px solid ${col}55;box-shadow:0 4px 10px rgba(0,0,0,.14)" onerror="this.style.display='none'">${_2ndAce}</span>`
      :`<div style="width:38px;height:38px;border-radius:var(--su_profile_radius,50%);background:linear-gradient(135deg,${col},${col}88);display:flex;align-items:center;justify-content:center;font-size:var(--fs-md);font-weight:1000;color:#fff;box-shadow:0 4px 10px rgba(0,0,0,.12)">${ap.name[0]}</div>`;
    return `<div class="ud-ace-card" style="flex:1;min-width:140px;background:linear-gradient(145deg,${col}14,${col}08);border:1.5px solid ${col}38;border-radius:18px;padding:13px 14px;cursor:pointer;box-shadow:0 8px 22px rgba(15,23,42,.05),0 2px 6px ${col}14;transition:box-shadow .15s,transform .15s" data-ur-action="open-player" data-ur-player="${safeName}">
      <div style="font-size:9px;font-weight:900;color:${col};margin-bottom:8px;letter-spacing:.4px;text-transform:uppercase">${label}</div>
      <div style="display:flex;align-items:center;gap:9px">
        ${photoEl}
        <div>
          <div style="font-weight:900;font-size:13.5px;color:var(--text,#0f172a);margin-bottom:3px">${ap.name}</div>
          <div style="font-size:10.5px;color:var(--gray-l,#94a3b8);font-weight:700">${wr}% · ${ap.points>0?'+':''}${ap.points}pt · <span style="color:${col};font-weight:900">ELO ${ap.elo||ELO_DEFAULT}</span></div>
        </div>
      </div>
    </div>`;
  }).filter(Boolean).join('');
  return `<div class="su-sec" style="--su-sec-accent:${col}">
    <div class="su-sec__title">에이스 스트리머</div>
    <div style="display:flex;gap:8px;flex-wrap:wrap">${rows}</div>
  </div>`;
}

try{
  _bindUnivRecentDelegatedEvents();
  window.buildUnivRecentMatchesHTML = buildUnivRecentMatchesHTML;
  window.buildUnivAceCardsHTML = buildUnivAceCardsHTML;
}catch(e){}
