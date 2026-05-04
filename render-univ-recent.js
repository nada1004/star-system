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
  const urMeta = (typeof suGetRecentChipMetrics==='function')
    ? suGetRecentChipMetrics('univRecent', window.innerWidth)
    : { deviceKey:(window.innerWidth<=768?'mb':(window.innerWidth<=1024?'tb':'pc')), scale:1, base:{date:12, chipFs:10, chipPx:7, chipH:18, chipR:5} };
  const urDevKey = urMeta.deviceKey;
  const urScale = urMeta.scale;
  const urBase = urMeta.base;
  const urChipStyle = (bg, color)=>`background:${bg};color:${color};padding:0 ${(urBase.chipPx*urScale).toFixed(2)}px;border-radius:${(urBase.chipR*urScale).toFixed(2)}px;font-size:${(urBase.chipFs*urScale).toFixed(2)}px;font-weight:800;white-space:nowrap;display:inline-flex;align-items:center;justify-content:center;line-height:${(urBase.chipH*urScale).toFixed(2)}px;height:${(urBase.chipH*urScale).toFixed(2)}px;letter-spacing:0;min-width:${(urBase.chipH*2.4*urScale).toFixed(2)}px`;
  let h=`<div style="font-weight:900;font-size:12px;color:#d97706;margin-bottom:10px;display:flex;align-items:center;gap:6px">
    <span style="display:inline-block;width:3px;height:14px;background:#d97706;border-radius:2px"></span>최근 대전 기록
  </div>`;
  h+=`<div style="border:1px solid rgba(148,163,184,.18);border-radius:14px;overflow:hidden;background:linear-gradient(180deg,#ffffff,#f8fafc);box-shadow:0 10px 22px rgba(15,23,42,.05)">`;
  h+=`<table style="margin:0;border:none;border-radius:0;table-layout:fixed;width:100%"><thead><tr><th style="width:${urDevKey==='mb'?'78px':(urDevKey==='tb'?'92px':'104px')};text-align:center">날짜</th><th style="width:${urDevKey==='mb'?'62px':(urDevKey==='tb'?'78px':'92px')};text-align:center">종류</th><th style="text-align:center">상대</th><th style="width:${urDevKey==='mb'?'64px':(urDevKey==='tb'?'72px':'84px')};text-align:center">결과</th></tr></thead><tbody>`;
  myMatches.slice(0,10).forEach(m=>{
    const isA=m.a===univName;
    const opp=isA?m.b:m.a;
    const myS=isA?m.sa:m.sb;
    const oppS=isA?m.sb:m.sa;
    const win=myS>oppS;
    const oc=gc(opp);
    const modeBg=m.mode==='미니대전'?'#2563eb':'#7c3aed';
    h+=`<tr>
      <td style="color:var(--text3);font-size:${urBase.date}px;font-weight:700;text-align:center;vertical-align:middle">${m.d||''}</td>
      <td style="text-align:center;vertical-align:middle"><span style="${urChipStyle(modeBg,'#fff')}">${m.mode}</span></td>
      <td style="text-align:center;vertical-align:middle"><span class="ubadge clickable-univ" data-ur-action="open-univ" data-ur-univ="${opp.replace(/"/g,'&quot;')}" style="${urChipStyle(oc,'#fff')};min-width:${(urBase.chipH*2.9*urScale).toFixed(2)}px;box-shadow:none;border:0">${opp}</span></td>
      <td style="text-align:center;vertical-align:middle">${win?`<span style="${urChipStyle('#dcfce7','#16a34a')};border:1px solid #bbf7d0">${myS}:${oppS} 승</span>`:`<span style="${urChipStyle('#fee2e2','#dc2626')};border:1px solid #fecaca">${myS}:${oppS} 패</span>`}</td>
    </tr>`;
  });
  h+=`</tbody></table></div>`;
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
