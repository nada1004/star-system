function _bindUnivSectionsDelegatedEvents(){
  if(window._univSectionsDelegatedBound) return;
  window._univSectionsDelegatedBound = true;

  document.addEventListener('click', (e)=>{
    const el = e.target && e.target.closest ? e.target.closest('[data-uds-action]') : null;
    if(!el) return;
    const action = el.getAttribute('data-uds-action');
    if(action === 'open-player'){
      e.preventDefault();
      try{ cm('univModal'); }catch(_){}
      const name = el.getAttribute('data-uds-player') || '';
      setTimeout(()=>{
        if(typeof openPlayerModal === 'function') openPlayerModal(name);
      }, 100);
      return;
    }
    if(action === 'open-univ'){
      e.preventDefault();
      try{ cm('univModal'); }catch(_){}
      const univ = el.getAttribute('data-uds-univ') || '';
      setTimeout(()=>{
        if(typeof openUnivModal === 'function') openUnivModal(univ);
      }, 100);
    }
  });

  document.addEventListener('mouseover', (e)=>{
    const el = e.target && e.target.closest ? e.target.closest('[data-uds-hover-bg]') : null;
    if(!el) return;
    el.style.background = el.getAttribute('data-uds-hover-bg') || '';
  });

  document.addEventListener('mouseout', (e)=>{
    const el = e.target && e.target.closest ? e.target.closest('[data-uds-hover-bg]') : null;
    if(!el) return;
    el.style.background = gcHex8(el.getAttribute('data-uds-base-univ') || '', .06);
  });
}

function buildUnivHeaderCardHTML(opts){
  const {
    univName='',
    col='',
    members=[],
    wins=0,
    tot=0,
    pts=0,
    wr=0,
    isMobile=false,
    isTablet=false,
    logoSizeEff='46px'
  } = opts || {};
  const uHdrPad = isMobile ? '14px 14px' : (isTablet ? '16px 18px' : '20px 24px');
  const uHdrR = isMobile ? 14 : 16;
  const uNameFs = isMobile ? 17 : (isTablet ? 18 : 20);
  const uSubFs = isMobile ? 11 : 12;
  const uStatPad = isMobile ? '8px 6px' : '10px 8px';
  const dissolvedBadge = (()=>{ const u=univCfg.find(u=>u.name===univName); return u?.dissolved?`<span style="font-size:12px;font-weight:700;background:rgba(0,0,0,.3);color:#fca5a5;border-radius:6px;padding:2px 8px;margin-left:6px;vertical-align:middle">🏚️ 해체${u.dissolvedDate?' '+u.dissolvedDate:''}</span>`:''; })();
  return `<div style="background:linear-gradient(135deg,${col},${col}cc);border-radius:${uHdrR}px;padding:${uHdrPad};margin-bottom:14px;color:#fff;position:relative;overflow:hidden">
    <div style="position:absolute;top:-20px;right:-20px;width:100px;height:100px;border-radius:50%;background:rgba(255,255,255,.08);pointer-events:none"></div>
    <div style="position:absolute;bottom:-30px;right:40px;width:70px;height:70px;border-radius:50%;background:rgba(255,255,255,.05);pointer-events:none"></div>
    <div style="display:flex;align-items:center;gap:14px;margin-bottom:18px">
      <div style="width:calc(var(--su_univ_logo_box_detail,72px) * var(--su_univ_detail_scale,1));height:calc(var(--su_univ_logo_box_detail,72px) * var(--su_univ_detail_scale,1));border-radius:var(--su_univ_logo_radius,18px);background:rgba(255,255,255,.2);display:flex;align-items:center;justify-content:center;font-size:38px;border:2px solid rgba(255,255,255,.35);flex-shrink:0;overflow:hidden">
        ${gUI(univName,logoSizeEff)}
      </div>
      <div>
        <div style="font-size:${uNameFs}px;font-weight:900;color:#fff;text-shadow:0 1px 6px rgba(0,0,0,.2)">
          ${univName}
          ${dissolvedBadge}
        </div>
        <div style="font-size:${uSubFs}px;color:rgba(255,255,255,.75);margin-top:2px">소속 스트리머 ${members.length}명</div>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px">
      <div style="background:rgba(255,255,255,.15);border-radius:10px;padding:${uStatPad};text-align:center;backdrop-filter:blur(4px)">
        <div style="font-size:10px;color:rgba(255,255,255,.75);margin-bottom:3px">개인 전적</div>
        <div style="font-weight:900;font-size:13px;color:#fff">${wins}승 ${tot-wins}패</div>
      </div>
      <div style="background:rgba(255,255,255,.15);border-radius:10px;padding:${uStatPad};text-align:center;backdrop-filter:blur(4px)">
        <div style="font-size:10px;color:rgba(255,255,255,.75);margin-bottom:3px">개인 승률</div>
        <div style="font-weight:900;font-size:14px;color:${wr>=50?'#bbf7d0':'#fca5a5'}">${tot?wr+'%':'-'}</div>
      </div>
      <div style="background:rgba(255,255,255,.15);border-radius:10px;padding:${uStatPad};text-align:center;backdrop-filter:blur(4px)">
        <div style="font-size:10px;color:rgba(255,255,255,.75);margin-bottom:3px">총 포인트</div>
        <div style="font-weight:900;font-size:13px;color:${pts>0?'#fef08a':pts<0?'#fca5a5':'#fff'}">${pts>0?'+':''}${pts}</div>
      </div>
      <div style="background:rgba(255,255,255,.15);border-radius:10px;padding:${uStatPad};text-align:center;backdrop-filter:blur(4px)">
        <div style="font-size:10px;color:rgba(255,255,255,.75);margin-bottom:3px">선수 수</div>
        <div style="font-weight:900;font-size:14px;color:#fff">${members.length}명</div>
      </div>
    </div>
  </div>`;
}

function buildUnivMembersTableHTML(opts){
  const {
    members=[],
    univName='',
    col=''
  } = opts || {};
  if(!members.length) return '';
  const sorted=[...members].sort((a,b)=>getRoleOrder(a.role)-getRoleOrder(b.role)||TIERS.indexOf(a.tier)-TIERS.indexOf(b.tier)||b.points-a.points);
  const displayList=sorted;
  let h=`<div style="font-weight:700;font-size:12px;color:${col};margin-bottom:10px;display:flex;align-items:center;gap:6px">
    <span style="display:inline-block;width:3px;height:14px;background:${col};border-radius:2px"></span>소속 스트리머 (${displayList.length}명)
  </div>`;
  h+=`<div style="border:1px solid var(--border);border-radius:10px;overflow:hidden;margin-bottom:18px"><table style="margin:0;border:none;border-radius:0;table-layout:auto"><thead><tr><th style="text-align:center;width:1px;white-space:nowrap;padding:7px 6px">직책</th><th style="text-align:center">티어</th><th style="text-align:center;width:50px">종족</th><th style="text-align:left;padding-left:10px">이름</th><th style="text-align:center;width:40px">성별</th><th style="text-align:center;width:40px">승</th><th style="text-align:center;width:40px">패</th><th style="text-align:center;width:52px">승률</th><th style="text-align:center;width:60px">포인트</th></tr></thead><tbody>`;
  displayList.forEach(p=>{
    const tw=p.win+p.loss;
    const twr=tw?Math.round(p.win/tw*100):0;
    h+=`<tr style="cursor:pointer" data-uds-action="open-player" data-uds-player="${escJS(p.name)}" data-uds-hover-bg="${gcHex8(p.univ,.12)}" data-uds-base-univ="${String(p.univ).replace(/"/g,'&quot;')}"
        style="border-left:3px solid ${col};background:${gcHex8(p.univ,.06)}">\r\n        <td style="text-align:center;padding:5px 4px;white-space:nowrap">${p.role?getRoleBadgeHTML(p.role,'10px'):''}</td>
      <td style="text-align:center">${getTierBadge(p.tier)}</td>
      <td style="text-align:center"><span class="rbadge r${p.race}">${p.race}</span></td>
      <td style="text-align:left;padding-left:10px;font-weight:600"><span style="display:inline-flex;align-items:center;gap:6px">${getPlayerPhotoHTML(p.name,'32px')}<span class="clickable-name">${p.name}</span>${getStatusIconHTML(p.name)}</span></td>
      <td style="text-align:center">${genderIcon(p.gender)}</td>
      <td style="text-align:center" class="wt">${p.win}</td>
      <td style="text-align:center" class="lt">${p.loss}</td>
      <td style="text-align:center;font-weight:700;color:${twr>=50?'#16a34a':'#dc2626'}">${tw?twr+'%':'-'}</td>
      <td style="text-align:center" class="${pC(p.points)}">${pS(p.points)}</td>
    </tr>`;
  });
  h+=`</tbody></table></div>`;
  return h;
}

function buildUnivOppStatsHTML(opts){
  const {
    oppStats={},
    isMobile=false,
    isTablet=false
  } = opts || {};
  const oppList=Object.entries(oppStats).filter(([,s])=>s.w+s.l>0).sort((a,b)=>(b[1].w+b[1].l)-(a[1].w+a[1].l));
  if(!oppList.length) return '';
  let h=`<div style="font-weight:700;font-size:12px;color:#7c3aed;margin-bottom:10px;display:flex;align-items:center;gap:6px">
    <span style="display:inline-block;width:3px;height:14px;background:#7c3aed;border-radius:2px"></span>상대 대학 전적
  </div>`;
  h+=`<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:18px">`;
  oppList.forEach(([opp,s])=>{
    const ot=s.w+s.l;
    const ow=ot?Math.round(s.w/ot*100):0;
    const oc=gc(opp);
    h+=`<div style="background:var(--white);border:1px solid var(--border);border-radius:10px;padding:${isMobile?'8px 10px':(isTablet?'9px 12px':'10px 14px')};text-align:center;cursor:pointer;min-width:${isMobile?'76px':'90px'};box-shadow:0 1px 4px rgba(0,0,0,.04)"
      data-uds-action="open-univ" data-uds-univ="${opp.replace(/"/g,'&quot;')}">
      <span class="ubadge" data-icon-done="1" style="background:${oc};font-size:${isMobile?'9px':'10px'};margin-bottom:6px;display:inline-flex;align-items:center;gap:3px">${gUI(opp,isMobile?'10px':'11px')}${opp}</span>
      <div style="font-size:${isMobile?'10px':'11px'};margin-top:4px"><span class="wt">${s.w}</span>승 <span class="lt">${s.l}</span>패</div>
      <div style="font-weight:800;font-size:${isMobile?'10px':'11px'};color:${ow>=50?'#16a34a':'#dc2626'}">${ow}%</div>
    </div>`;
  });
  h+=`</div>`;
  return h;
}

try{
  _bindUnivSectionsDelegatedEvents();
  window.buildUnivHeaderCardHTML = buildUnivHeaderCardHTML;
  window.buildUnivMembersTableHTML = buildUnivMembersTableHTML;
  window.buildUnivOppStatsHTML = buildUnivOppStatsHTML;
}catch(e){}
