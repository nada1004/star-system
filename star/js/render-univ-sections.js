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
    losses=0,
    tot=0,
    pts=0,
    wr=0,
    hdrBg='',
    hdrBgLayer=null,
    isMobile=false,
    isTablet=false,
    logoSizeEff='46px'
  } = opts || {};
  const uNameFs = isMobile ? 18 : (isTablet ? 20 : 22);
  const uSubFs = isMobile ? 11 : 12;
  const dissolvedBadge = (()=>{ const u=univCfg.find(u=>u.name===univName); return u?.dissolved?`<span style="font-size:11px;font-weight:700;background:rgba(0,0,0,.35);color:#fca5a5;border-radius:6px;padding:2px 8px;margin-left:6px;vertical-align:middle">🏚️ 해체${u.dissolvedDate?' '+u.dissolvedDate:''}</span>`:''; })();
  const _bgSize = hdrBgLayer?.fit==='fill' ? '100% 100%' : (hdrBgLayer?.fit==='cover' ? 'cover' : 'contain');
  const _bgScale = Math.max(40, Math.min(220, Number(hdrBgLayer?.scale||100)));
  const topNames = [...members].sort((a,b)=>(b.points||0)-(a.points||0)).slice(0,3);
  const winPct = tot ? wr : 0;
  const winBarW = Math.max(0,Math.min(100,winPct));
  const _hexToRgb = h => { const m=String(h||'').match(/^#([0-9a-f]{6})$/i); if(!m)return '59,130,246'; const n=parseInt(m[1],16); return `${(n>>16)&255},${(n>>8)&255},${n&255}`; };
  const colRgb = _hexToRgb(col);
  const ptColor = pts>0?'#4ade80':pts<0?'#f87171':'rgba(255,255,255,.85)';
  const wrColor = winPct>=60?'#4ade80':winPct>=50?'#86efac':winPct>=40?'#fcd34d':'#f87171';
  const bgLayerHTML = hdrBgLayer?.url ? `<div style="position:absolute;inset:-8%;background-image:url('${toHttpsUrl(hdrBgLayer.url).replace(/'/g,"%27")}');background-repeat:no-repeat;background-position:center center;background-size:${_bgSize};transform:scale(${_bgScale/100});transform-origin:center center;opacity:.28;pointer-events:none"></div>` : '';
  return `<div style="border-radius:20px;overflow:hidden;margin-bottom:20px;box-shadow:0 20px 48px rgba(${colRgb},.20),0 4px 16px rgba(15,23,42,.10);">
    <div style="background:${hdrBg||`linear-gradient(145deg,${col} 0%,${col}bb 60%,${col}88 100%)`};padding:${isMobile?'18px 16px':'22px 26px'};position:relative;overflow:hidden;min-height:${isMobile?'140px':'155px'}">
      ${bgLayerHTML}
      <div style="position:absolute;top:-40px;right:-40px;width:160px;height:160px;border-radius:50%;background:rgba(255,255,255,.07);pointer-events:none"></div>
      <div style="position:absolute;bottom:-50px;left:20%;width:120px;height:120px;border-radius:50%;background:rgba(255,255,255,.04);pointer-events:none"></div>
      <div style="position:absolute;inset:0;background:linear-gradient(160deg,rgba(0,0,0,.06) 0%,rgba(0,0,0,.24) 100%);pointer-events:none"></div>
      <div style="position:absolute;bottom:0;left:0;right:0;height:48px;background:linear-gradient(transparent,rgba(0,0,0,.18));pointer-events:none"></div>
      <div style="position:relative;display:flex;align-items:flex-start;gap:${isMobile?'14px':'18px'}">
        <div style="width:calc(var(--su_univ_logo_box_detail,76px)*var(--su_univ_detail_scale,1));height:calc(var(--su_univ_logo_box_detail,76px)*var(--su_univ_detail_scale,1));flex-shrink:0;border-radius:calc(var(--su_univ_logo_radius,18px)+6px);background:rgba(255,255,255,.92);display:flex;align-items:center;justify-content:center;overflow:hidden;box-shadow:0 8px 28px rgba(0,0,0,.22),0 0 0 3px rgba(255,255,255,.45)">
          ${gUI(univName,logoSizeEff)}
        </div>
        <div style="min-width:0;flex:1;padding-top:4px">
          <div style="font-size:9px;font-weight:900;letter-spacing:2px;color:rgba(255,255,255,.62);text-transform:uppercase;margin-bottom:4px">UNIVERSITY</div>
          <div style="font-size:${uNameFs}px;font-weight:900;color:#fff;text-shadow:0 2px 12px rgba(0,0,0,.3);line-height:1.2;margin-bottom:6px">${univName}${dissolvedBadge}</div>
          <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
            <span style="font-size:${uSubFs}px;color:rgba(255,255,255,.75);font-weight:600">👥 ${members.length}명</span>
            <span style="width:1px;height:12px;background:rgba(255,255,255,.3)"></span>
            <span style="font-size:${uSubFs}px;color:rgba(255,255,255,.75);font-weight:600">${wins}승 ${losses}패</span>
            ${tot?`<span style="width:1px;height:12px;background:rgba(255,255,255,.3)"></span><span style="font-size:${uSubFs}px;color:${wrColor};font-weight:800">승률 ${winPct}%</span>`:''}
          </div>
          <div style="margin-top:10px;display:inline-flex;align-items:center;gap:6px;background:rgba(0,0,0,.28);border:1px solid rgba(255,255,255,.18);border-radius:12px;padding:6px 14px;">
            <span style="font-size:10px;color:rgba(255,255,255,.65);font-weight:700">SCORE</span>
            <span style="font-size:20px;font-weight:900;color:${ptColor};line-height:1">${pts>0?'+':''}${pts}</span>
          </div>
        </div>
        ${!isMobile&&topNames.length?`<div style="flex-shrink:0;display:flex;flex-direction:column;gap:4px">
          ${topNames.map((p,i)=>`<div style="display:flex;align-items:center;gap:6px;background:rgba(0,0,0,.25);border:1px solid rgba(255,255,255,.14);border-radius:10px;padding:5px 10px;">
            <span style="font-size:9px;font-weight:900;color:rgba(255,255,255,.5);min-width:14px">${['🥇','🥈','🥉'][i]||''}</span>
            ${getPlayerPhotoHTML(p.name,'22px')}
            <span style="font-size:11px;font-weight:800;color:#fff;white-space:nowrap">${p.name}</span>
            <span style="font-size:10px;color:${ptColor};font-weight:700">${p.points>0?'+':''}${p.points}pt</span>
          </div>`).join('')}
        </div>`:''}
      </div>
    </div>
    <div style="background:var(--white,#fff);padding:${isMobile?'14px 16px':'16px 26px'}">
      ${tot?`<div style="margin-bottom:14px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
          <span style="font-size:11px;font-weight:800;color:var(--text3,#475569);letter-spacing:.4px">개인 승률</span>
          <span style="font-size:13px;font-weight:900;color:${col}">${winPct}%</span>
        </div>
        <div style="height:8px;background:${col}20;border-radius:99px;overflow:hidden;position:relative">
          <div style="position:absolute;left:0;top:0;height:100%;width:${winBarW}%;background:linear-gradient(90deg,${col}cc,${col});border-radius:99px;transition:.6s ease"></div>
        </div>
      </div>`:''}
      <div style="display:grid;grid-template-columns:repeat(${isMobile?'2':'4'},1fr);gap:${isMobile?'8px':'10px'}">
        <div style="background:${col}0d;border:1.5px solid ${col}28;border-radius:14px;padding:${isMobile?'10px 8px':'12px 10px'};text-align:center;position:relative;overflow:hidden">
          <div style="position:absolute;top:-8px;right:-8px;font-size:28px;opacity:.07">⚔️</div>
          <div style="font-size:9px;color:var(--gray-l,#94a3b8);margin-bottom:5px;font-weight:800;letter-spacing:.8px">개인전적</div>
          <div style="font-weight:900;font-size:${isMobile?'13px':'15px'};color:var(--text,#1e293b)">${wins}<span style="color:var(--green,#16a34a)">승</span> ${losses}<span style="color:var(--red,#dc2626)">패</span></div>
        </div>
        <div style="background:${col}0d;border:1.5px solid ${col}28;border-radius:14px;padding:${isMobile?'10px 8px':'12px 10px'};text-align:center;position:relative;overflow:hidden">
          <div style="position:absolute;top:-8px;right:-8px;font-size:28px;opacity:.07">📈</div>
          <div style="font-size:9px;color:var(--gray-l,#94a3b8);margin-bottom:5px;font-weight:800;letter-spacing:.8px">승률</div>
          <div style="font-weight:900;font-size:${isMobile?'16px':'18px'};color:${tot?wrColor:'var(--gray-l)'}">${tot?winPct+'%':'-'}</div>
        </div>
        <div style="background:${col}0d;border:1.5px solid ${col}28;border-radius:14px;padding:${isMobile?'10px 8px':'12px 10px'};text-align:center;position:relative;overflow:hidden">
          <div style="position:absolute;top:-8px;right:-8px;font-size:28px;opacity:.07">🏆</div>
          <div style="font-size:9px;color:var(--gray-l,#94a3b8);margin-bottom:5px;font-weight:800;letter-spacing:.8px">총 포인트</div>
          <div style="font-weight:900;font-size:${isMobile?'15px':'17px'};color:${pts>0?'#16a34a':pts<0?'#dc2626':'var(--text,#1e293b)'}">${pts>0?'+':''}${pts}</div>
        </div>
        <div style="background:${col}0d;border:1.5px solid ${col}28;border-radius:14px;padding:${isMobile?'10px 8px':'12px 10px'};text-align:center;position:relative;overflow:hidden">
          <div style="position:absolute;top:-8px;right:-8px;font-size:28px;opacity:.07">👥</div>
          <div style="font-size:9px;color:var(--gray-l,#94a3b8);margin-bottom:5px;font-weight:800;letter-spacing:.8px">선수 수</div>
          <div style="font-weight:900;font-size:${isMobile?'16px':'18px'};color:var(--text,#1e293b)">${members.length}<span style="font-size:11px;font-weight:600;color:var(--gray-l)">명</span></div>
        </div>
      </div>
    </div>
  </div>`;
}


function buildUnivMembersTableHTML(opts){
  const {
    members=[],
    univName='',
    col='',
    byPlayer={}
  } = opts || {};
  if(!members.length) return '';
  const _recOf = (p)=>byPlayer[String(p?.name||'').trim()] || {w:0,l:0,tot:0,wr:0,pts:0};
  const sorted=[...members].sort((a,b)=>getRoleOrder(a.role)-getRoleOrder(b.role)||TIERS.indexOf(a.tier)-TIERS.indexOf(b.tier)||((_recOf(b).pts||0)-(_recOf(a).pts||0)));
  const displayList=sorted;
  let h=`<div style="font-weight:900;font-size:12px;color:${col};margin-bottom:10px;display:flex;align-items:center;gap:6px">
    <span style="display:inline-block;width:3px;height:14px;background:${col};border-radius:2px"></span>소속 스트리머 (${displayList.length}명)
  </div>`;
  h+=`<div style="border:1px solid rgba(148,163,184,.18);border-radius:14px;overflow:hidden;margin-bottom:18px;background:linear-gradient(180deg,#ffffff,#f8fafc);box-shadow:0 10px 22px rgba(15,23,42,.05)"><table style="margin:0;border:none;border-radius:0;table-layout:auto"><thead><tr><th style="text-align:center;width:1px;white-space:nowrap;padding:9px 6px;background:${col};color:#fff">직책</th><th style="text-align:center;background:${col};color:#fff">티어</th><th style="text-align:center;width:50px;background:${col};color:#fff">종족</th><th style="text-align:left;padding-left:10px;background:${col};color:#fff">이름</th><th style="text-align:center;width:40px;background:${col};color:#fff">성별</th><th style="text-align:center;width:40px;background:${col};color:#fff">승</th><th style="text-align:center;width:40px;background:${col};color:#fff">패</th><th style="text-align:center;width:52px;background:${col};color:#fff">승률</th><th style="text-align:center;width:60px;background:${col};color:#fff">포인트</th></tr></thead><tbody>`;
  displayList.forEach(p=>{
    const rec=_recOf(p);
    const tw=rec.tot||0;
    const twr=rec.wr||0;
    h+=`<tr style="cursor:pointer" data-uds-action="open-player" data-uds-player="${escJS(p.name)}" data-uds-hover-bg="${gcHex8(p.univ,.12)}" data-uds-base-univ="${String(p.univ).replace(/"/g,'&quot;')}"
        style="border-left:3px solid ${col};background:${gcHex8(p.univ,.06)}">\r\n        <td style="text-align:center;padding:5px 4px;white-space:nowrap">${p.role?getRoleBadgeHTML(p.role,'10px'):''}</td>
      <td style="text-align:center">${getTierBadge(p.tier)}</td>
      <td style="text-align:center"><span class="rbadge r${p.race}">${p.race}</span></td>
      <td style="text-align:left;padding-left:10px;font-weight:600"><span style="display:inline-flex;align-items:center;gap:6px">${getPlayerPhotoHTML(p.name,'32px')}<span class="clickable-name">${p.name}</span>${getStatusIconHTML(p.name)}</span></td>
      <td style="text-align:center">${genderIcon(p.gender)}</td>
      <td style="text-align:center" class="wt">${rec.w||0}</td>
      <td style="text-align:center" class="lt">${rec.l||0}</td>
      <td style="text-align:center;font-weight:700;color:${twr>=50?'#16a34a':'#dc2626'}">${tw?twr+'%':'-'}</td>
      <td style="text-align:center" class="${pC(rec.pts||0)}">${pS(rec.pts||0)}</td>
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
  let h=`<div style="font-weight:900;font-size:12px;color:#7c3aed;margin-bottom:10px;display:flex;align-items:center;gap:6px">
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
