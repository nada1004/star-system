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
      setTimeout(()=>{
        if(typeof openUnivModal === 'function') openUnivModal(univ);
      }, 100);
      return;
    }
    if(action === 'open-player'){
      e.preventDefault();
      try{ cm('univModal'); }catch(_){}
      const name = el.getAttribute('data-ur-player') || '';
      setTimeout(()=>{
        if(typeof openPlayerModal === 'function') openPlayerModal(name);
      }, 100);
    }
  });
}

function buildUnivRecentMatchesHTML(opts){
  const {
    myMatches=[],
    univName='',
    isMobile=false,
    isTablet=false
  } = opts || {};
  if(!myMatches.length) return '';
  const _col = gc(univName) || '#2563eb';
  const _hexToRgb = h => { const m=String(h||'').match(/^#([0-9a-f]{6})$/i); if(!m)return '59,130,246'; const n=parseInt(m[1],16); return `${(n>>16)&255},${(n>>8)&255},${n&255}`; };
  const colRgb = _hexToRgb(_col);
  const days=['일','월','화','수','목','금','토'];
  const fmtD = (d) => { if(!d) return ''; try{ const dt=new Date(d+'T00:00:00'); return `${dt.getMonth()+1}/${dt.getDate()}(${days[dt.getDay()]})`; }catch(e){ return d; } };
  const modeColor = (mode) => {
    if(!mode) return '#64748b';
    if(mode.includes('미니')) return '#2563eb';
    if(mode.includes('대학')) return '#7c3aed';
    if(mode.includes('프로')) return '#0891b2';
    return '#64748b';
  };
  const recent = myMatches.slice(0,10);
  let h = `<div style="margin-bottom:18px">
    <div style="font-weight:900;font-size:13px;color:${_col};margin-bottom:12px;display:flex;align-items:center;gap:8px">
      <span style="display:inline-block;width:3px;height:16px;background:${_col};border-radius:2px"></span>
      최근 대전 기록
      <span style="font-size:11px;font-weight:600;color:var(--gray-l,#94a3b8)">${recent.length}경기</span>
    </div>
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
    h += `<div style="background:var(--white,#fff);border:1px solid var(--border,#e2e8f0);border-radius:14px;padding:${isMobile?'10px 12px':'12px 16px'};display:flex;align-items:center;gap:${isMobile?'8px':'12px'};box-shadow:0 2px 8px rgba(${colRgb},.06);transition:box-shadow .2s;position:relative;overflow:hidden">
      <!-- 왼쪽 결과 색상 바 -->
      <div style="position:absolute;left:0;top:0;bottom:0;width:4px;background:${win?'#16a34a':draw?'#d97706':'#dc2626'};border-radius:2px 0 0 2px"></div>
      <!-- 날짜 -->
      <div style="padding-left:4px;min-width:${isMobile?'52px':'62px'};text-align:center;flex-shrink:0">
        <div style="font-size:${isMobile?'10px':'11px'};font-weight:800;color:var(--text3,#475569)">${fmtD(m.d)}</div>
      </div>
      <!-- 종류 배지 -->
      <div style="flex-shrink:0">
        <span style="display:inline-block;background:${mc};color:#fff;font-size:${isMobile?'9px':'10px'};font-weight:800;padding:3px ${isMobile?'7px':'9px'};border-radius:8px;white-space:nowrap;letter-spacing:.2px">${m.mode||'대전'}</span>
      </div>
      <!-- 우리팀 -->
      <div style="display:flex;align-items:center;gap:5px;flex:1;min-width:0;justify-content:flex-end">
        <span style="font-weight:900;font-size:${isMobile?'12px':'13px'};color:${_col};white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${univName}</span>
        ${gUI(univName,'14px')}
      </div>
      <!-- 스코어 중앙 -->
      <div style="flex-shrink:0;text-align:center;min-width:${isMobile?'54px':'64px'}">
        <div style="font-size:${isMobile?'16px':'18px'};font-weight:900;line-height:1;letter-spacing:1px">
          <span style="color:${win?'#16a34a':'var(--text,#1e293b)'}">${myS}</span>
          <span style="color:var(--gray-l,#94a3b8);font-size:12px;margin:0 2px">:</span>
          <span style="color:${!win&&!draw?'#16a34a':'var(--text,#1e293b)'}">${oppS}</span>
        </div>
        <div style="margin-top:3px">
          <span style="font-size:9px;font-weight:900;padding:2px 7px;border-radius:6px;${win?'background:#dcfce7;color:#16a34a':draw?'background:#fef9c3;color:#d97706':'background:#fee2e2;color:#dc2626'}">${win?'승':draw?'무':'패'}</span>
        </div>
      </div>
      <!-- 상대팀 -->
      <div style="display:flex;align-items:center;gap:5px;flex:1;min-width:0;justify-content:flex-start">
        ${gUI(opp,'14px')}
        <span style="font-weight:900;font-size:${isMobile?'12px':'13px'};color:${oc};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;cursor:pointer" data-ur-action="open-univ" data-ur-univ="${opp.replace(/"/g,'&quot;')}">${opp}</span>
      </div>
    </div>`;
  });
  h += `</div></div>`;
  return h;
}


function buildUnivAceCardsHTML(opts){
  const {
    members=[],
    col=''
  } = opts || {};
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
    {label:'🏆 포인트 1위', p:byPoints[0]},
    {label:'📈 승률 1위', p:byWR[0]},
    {label:'⚡ ELO 1위', p:byElo[0]},
  ].filter(x=>x.p);
  const seen=new Set();
  const uniqueAces=aces.filter(x=>{ if(seen.has(x.p.name))return false; seen.add(x.p.name); return true; });
  if(!uniqueAces.length) return '';
  const rows=uniqueAces.map(({label,p:ap})=>{
    if(!ap) return '';
    const wr=(ap.win+ap.loss)?Math.round(ap.win/(ap.win+ap.loss)*100):0;
    const safeName=escJS(ap.name);
    const photoEl=ap.photo
      ?`<img src="${toHttpsUrl(ap.photo)}" style="width:30px;height:30px;border-radius:var(--su_profile_radius,50%);object-fit:cover;border:2px solid ${col}" onerror="this.style.display='none'">`
      :`<div style="width:30px;height:30px;border-radius:var(--su_profile_radius,50%);background:${col};display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:900;color:#fff">${ap.name[0]}</div>`;
    return `<div style="flex:1;min-width:120px;background:linear-gradient(135deg,${col}18,${col}08);border:1.5px solid ${col}44;border-radius:14px;padding:12px 12px;cursor:pointer;box-shadow:0 10px 22px rgba(15,23,42,.05)" data-ur-action="open-player" data-ur-player="${safeName}">
      <div style="font-size:10px;font-weight:700;color:${col};margin-bottom:5px">${label}</div>
      <div style="display:flex;align-items:center;gap:6px">
        ${photoEl}
        <div>
          <div style="font-weight:800;font-size:13px">${ap.name}</div>
          <div style="font-size:10px;color:var(--gray-l)">${wr}% · ${ap.points}pt · ELO ${ap.elo||ELO_DEFAULT}</div>
        </div>
      </div>
    </div>`;
  }).filter(Boolean).join('');
  return `<div style="margin-top:16px">
    <div style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:14px;color:${col};margin-bottom:10px;padding-bottom:6px;border-bottom:2px solid ${col}33">⭐ 에이스 스트리머</div>
    <div style="display:flex;gap:8px;flex-wrap:wrap">${rows}</div>
  </div>`;
}

try{
  _bindUnivRecentDelegatedEvents();
  window.buildUnivRecentMatchesHTML = buildUnivRecentMatchesHTML;
  window.buildUnivAceCardsHTML = buildUnivAceCardsHTML;
}catch(e){}
