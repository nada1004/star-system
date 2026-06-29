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
      setTimeout(()=>{ if(typeof openPlayerModal === 'function') openPlayerModal(name); }, 100);
      return;
    }
    if(action === 'open-univ'){
      e.preventDefault();
      try{ cm('univModal'); }catch(_){}
      const univ = el.getAttribute('data-uds-univ') || '';
      setTimeout(()=>{ if(typeof openUnivModal === 'function') openUnivModal(univ); }, 100);
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
    el.style.background = gcHex8(el.getAttribute('data-uds-base-univ') || '', .04);
  });
}

function buildUnivHeaderCardHTML(opts){
  const {
    univName='', col='', members=[], wins=0, losses=0, tot=0, pts=0, wr=0,
    hdrBg='', hdrBgLayer=null, isMobile=false, isTablet=false, logoSizeEff='46px'
  } = opts || {};
  const uNameFs = isMobile ? 34 : (isTablet ? 44 : 52);
  const dissolvedBadge = (()=>{
    const u=univCfg.find(u=>u.name===univName);
    return u?.dissolved?`<span style="font-size:10px;font-weight:800;background:rgba(0,0,0,.38);color:#fca5a5;border-radius:8px;padding:2px 9px;margin-left:7px;vertical-align:middle;letter-spacing:.2px">🏚️ 해체${u.dissolvedDate?' '+u.dissolvedDate:''}</span>`:'';
  })();
  const _bgSize = hdrBgLayer?.fit==='fill' ? '100% 100%' : (hdrBgLayer?.fit==='cover' ? 'cover' : 'contain');
  const _bgScale = Math.max(40, Math.min(220, Number(hdrBgLayer?.scale||100)));
  const _bgPosX = Math.max(0, Math.min(100, Number(hdrBgLayer?.posX ?? 50) || 50));
  const _bgPosY = Math.max(0, Math.min(100, Number(hdrBgLayer?.posY ?? 50) || 50));
  const topNames = [...members].sort((a,b)=>(b.points||0)-(a.points||0)).slice(0,3);
  const winPct = tot ? wr : 0;
  const winBarW = Math.max(0,Math.min(100,winPct));
  const _hexToRgb = h => { const m=String(h||'').match(/^#([0-9a-f]{6})$/i); if(!m)return '59,130,246'; const n=parseInt(m[1],16); return `${(n>>16)&255},${(n>>8)&255},${n&255}`; };
  const colRgb = _hexToRgb(col);
  const ptColor = pts>0?'#4ade80':pts<0?'#f87171':'rgba(255,255,255,.82)';
  const wrColor = winPct>=60?'#4ade80':winPct>=50?'#86efac':winPct>=40?'#fcd34d':'#f87171';
  const bgLayerHTML = hdrBgLayer?.url
    ? `<div style="position:absolute;inset:-8%;background-image:url('${toHttpsUrl(hdrBgLayer.url).replace(/'/g,"%27")}');background-repeat:no-repeat;background-position:${_bgPosX}% ${_bgPosY}%;background-size:${_bgSize};transform:scale(${_bgScale/100});transform-origin:${_bgPosX}% ${_bgPosY}%;opacity:.28;pointer-events:none"></div>`
    : '';

  // 상위 3인 미니 아바타
  const topAvatarsHTML = !isMobile && topNames.length
    ? `<div style="flex-shrink:0;display:flex;flex-direction:column;align-items:flex-end;gap:6px;min-width:auto;margin-left:auto;align-self:flex-end;margin-bottom:2px;margin-right:-2px;transform:translateY(20px)">
        <div style="display:flex;align-items:center;gap:5px;padding:8px 10px;border-radius:18px;background:rgba(15,23,42,.18);border:1px solid rgba(255,255,255,.14);box-shadow:inset 0 1px 0 rgba(255,255,255,.08),0 8px 20px rgba(15,23,42,.14);backdrop-filter:blur(10px)">
          ${topNames.map((p,i)=>`<div style="display:flex;align-items:center;gap:4px;background:rgba(15,23,42,.2);border:1px solid rgba(255,255,255,.16);border-radius:999px;padding:4px 9px;min-width:0">
            <span style="font-size:10px;min-width:14px">${['🥇','🥈','🥉'][i]||''}</span>
            ${getPlayerPhotoHTML(p.name,'18px')}
            <span style="font-size:10px;font-weight:900;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:62px">${p.name}</span>
            <span style="font-size:9px;color:${ptColor};font-weight:800;white-space:nowrap">${p.points>0?'+':''}${p.points}pt</span>
          </div>`).join('')}
        </div>
      </div>`
    : '';

  // 스탯 그리드
  const statItems = [
    { icon:'⚔️', label:'대학전적', value:`<span style="color:#4ade80">${wins}승</span> <span style="color:#f87171">${losses}패</span>`, fs: isMobile?13:15 },
    { icon:'📈', label:'승률', value:`<span style="color:${tot?wrColor:'rgba(255,255,255,.5)'}">${tot?winPct+'%':'-'}</span>`, fs: isMobile?17:20 },
    { icon:'🏆', label:'총 포인트', value:`<span style="color:${pts>0?'#4ade80':pts<0?'#f87171':'rgba(255,255,255,.85)'}">${pts>0?'+':''}${pts}</span>`, fs: isMobile?15:17 },
    { icon:'👥', label:'선수 수', value:`<span style="color:var(--text,#1e293b)">${members.length}<span style="font-size:12px;font-weight:600;color:var(--gray-l,#94a3b8)">명</span></span>`, fs: isMobile?17:19 }
  ];

  // 로고: 등록된 아이콘이 있으면 그대로, 없으면 대학명 첫 글자로 큰 placeholder
  const _univHasIcon = !!((univCfg.find(u=>u.name===univName)||{}).icon || (univCfg.find(u=>u.name===univName)||{}).img);
  const _logoContentHTML = _univHasIcon
    ? gUI(univName,logoSizeEff)
    : `<div style="width:100%;height:100%;border-radius:28%;background:rgba(255,255,255,.16);border:1.5px solid rgba(255,255,255,.32);display:flex;align-items:center;justify-content:center;backdrop-filter:blur(6px)">
        <span style="font-size:calc(${logoSizeEff} * 0.52);font-weight:1000;color:#fff;line-height:1;text-shadow:0 2px 10px rgba(0,0,0,.2)">${univName ? univName.trim().charAt(0) : '?'}</span>
      </div>`;

  return `<div style="border-radius:26px;overflow:hidden;margin-bottom:18px;box-shadow:0 28px 60px rgba(${colRgb},.2),0 8px 22px rgba(15,23,42,.10)">
    <!-- 헤더 배너 -->
    <div style="background:${hdrBg||`linear-gradient(145deg,${col} 0%,${col}bb 60%,${col}88 100%)`};padding:${isMobile?'20px 16px 28px':'26px 22px 34px 18px'};position:relative;overflow:hidden;min-height:${isMobile?'170px':'192px'}">
      ${bgLayerHTML}
      <!-- 장식 원 -->
      <div style="position:absolute;top:-34px;right:-24px;width:200px;height:200px;border-radius:50%;background:rgba(255,255,255,.07);pointer-events:none"></div>
      <div style="position:absolute;bottom:-70px;left:10%;width:160px;height:160px;border-radius:50%;background:rgba(255,255,255,.04);pointer-events:none"></div>
      <div style="position:absolute;top:50%;left:-30px;width:80px;height:160px;transform:translateY(-50%);border-radius:50%;background:rgba(255,255,255,.03);pointer-events:none"></div>
      <!-- 그라디언트 오버레이 -->
      <div style="position:absolute;inset:0;background:linear-gradient(145deg,rgba(15,23,42,.04) 0%,rgba(15,23,42,.18) 55%,rgba(15,23,42,.26) 100%);pointer-events:none"></div>
      <div style="position:absolute;left:0;right:0;top:0;height:60px;background:linear-gradient(180deg,rgba(255,255,255,.08),transparent);pointer-events:none"></div>
      <div style="position:absolute;bottom:0;left:0;right:0;height:80px;background:linear-gradient(transparent,rgba(15,23,42,.20));pointer-events:none"></div>
      <!-- 콘텐츠 -->
      <div style="position:relative;display:flex;align-items:${isMobile?'flex-start':'center'};justify-content:flex-start;gap:${isMobile?'10px':'12px'}">
        <!-- 로고 + 이름 -->
        <div style="display:flex;align-items:center;gap:${isMobile?'6px':'10px'};min-width:0;flex:0 1 auto">
          <div style="width:calc(var(--su_univ_logo_box_detail,160px)*var(--su_univ_detail_scale,1));height:calc(var(--su_univ_logo_box_detail,160px)*var(--su_univ_detail_scale,1));flex-shrink:0;display:flex;align-items:center;justify-content:center;overflow:visible;margin-right:${isMobile?'-6px':'-8px'}">
            <div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;filter:drop-shadow(0 16px 28px rgba(15,23,42,.22)) drop-shadow(0 4px 10px rgba(255,255,255,.08))">
              ${_logoContentHTML}
            </div>
          </div>
          <div style="min-width:0;flex:0 1 auto;margin-left:${isMobile?'6px':'12px'}">
            <div style="font-size:${Math.round(uNameFs*1.1)}px;font-weight:1000;color:#fff;text-shadow:0 4px 20px rgba(0,0,0,.28),0 1px 0 rgba(255,255,255,.08);line-height:1.02;letter-spacing:-.04em;word-break:keep-all">${univName}${dissolvedBadge}</div>
          </div>
        </div>
        ${topAvatarsHTML}
      </div>
    </div>
    <!-- 하단 스탯 -->
    <div style="background:var(--white,#fff);padding:${isMobile?'14px 14px 16px':'16px 20px 18px'}">
      ${tot?`<div style="margin-bottom:14px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:5px">
          <span style="font-size:10.5px;font-weight:900;color:var(--text3,#475569);letter-spacing:.5px">대학 승률</span>
          <span style="font-size:14px;font-weight:1000;color:${col}">${winPct}%</span>
        </div>
        <div style="height:7px;background:${col}18;border-radius:99px;overflow:hidden;position:relative">
          <div style="position:absolute;left:0;top:0;height:100%;width:${winBarW}%;background:linear-gradient(90deg,${col}bb,${col});border-radius:99px;transition:.6s ease"></div>
        </div>
      </div>`:''}
      <div style="display:grid;grid-template-columns:repeat(${isMobile?'2':'4'},1fr);gap:${isMobile?'7px':'9px'}">
        ${statItems.map(s=>`<div style="background:linear-gradient(145deg,${col}0c,${col}06);border:1.5px solid ${col}22;border-radius:16px;padding:${isMobile?'10px 8px':'13px 10px'};text-align:center;position:relative;overflow:hidden;transition:border-color .15s">
          <div style="position:absolute;bottom:-8px;right:-6px;font-size:26px;opacity:.07;line-height:1">${s.icon}</div>
          <div style="font-size:8.5px;color:var(--gray-l,#94a3b8);margin-bottom:5px;font-weight:900;letter-spacing:.9px;text-transform:uppercase">${s.label}</div>
          <div style="font-weight:1000;font-size:${s.fs}px;color:var(--text,#1e293b)">${s.value}</div>
        </div>`).join('')}
      </div>
    </div>
  </div>`;
}


function buildUnivMembersTableHTML(opts){
  const { members=[], univName='', col='', byPlayer={} } = opts || {};
  if(!members.length) return '';
  const _recOf = (p)=>byPlayer[String(p?.name||'').trim()] || {w:0,l:0,tot:0,wr:0,pts:0};
  const sorted=[...members].sort((a,b)=>getRoleOrder(a.role)-getRoleOrder(b.role)||TIERS.indexOf(a.tier)-TIERS.indexOf(b.tier)||((_recOf(b).pts||0)-(_recOf(a).pts||0)));
  const _hexToRgb = h => { const m=String(h||'').match(/^#([0-9a-f]{6})$/i); if(!m)return '59,130,246'; const n=parseInt(m[1],16); return `${(n>>16)&255},${(n>>8)&255},${n&255}`; };
  const colRgb = _hexToRgb(col);
  let h=`<div class="su-sec" style="--su-sec-accent:${col}">
    <div class="su-sec__title">소속 스트리머 <small>(${sorted.length}명)</small></div>
    <div style="border:1px solid rgba(148,163,184,.16);border-radius:14px;overflow:hidden;background:linear-gradient(180deg,#ffffff,#f8fafc);box-shadow:0 8px 24px rgba(${colRgb},.07),0 2px 8px rgba(15,23,42,.04)">
    <table style="margin:0;border:none;border-radius:0;table-layout:auto">
      <thead>
        <tr>
          <th style="text-align:center;width:1px;white-space:nowrap;padding:9px 7px;background:${col}!important;color:#fff!important;font-weight:900;letter-spacing:.3px;font-size:11px">직책</th>
          <th style="text-align:center;background:${col}!important;color:#fff!important;font-weight:900;font-size:11px">티어</th>
          <th style="text-align:center;width:46px;background:${col}!important;color:#fff!important;font-weight:900;font-size:11px">종족</th>
          <th style="text-align:left;padding-left:10px;background:${col}!important;color:#fff!important;font-weight:900;font-size:11px">이름</th>
          <th style="text-align:center;width:36px;background:${col}!important;color:#fff!important;font-weight:900;font-size:11px">성별</th>
          <th style="text-align:center;width:36px;background:${col}!important;color:#fff!important;font-weight:900;font-size:11px">승</th>
          <th style="text-align:center;width:36px;background:${col}!important;color:#fff!important;font-weight:900;font-size:11px">패</th>
          <th style="text-align:center;width:50px;background:${col}!important;color:#fff!important;font-weight:900;font-size:11px">승률</th>
          <th style="text-align:center;width:58px;background:${col}!important;color:#fff!important;font-weight:900;font-size:11px">포인트</th>
        </tr>
      </thead>
      <tbody>`;
  sorted.forEach((p,i)=>{
    const rec=_recOf(p);
    const tw=rec.tot||0;
    const twr=rec.wr||0;
    const isEven = i%2===0;
    h+=`<tr data-uds-action="open-player" data-uds-player="${escJS(p.name)}" data-uds-hover-bg="${gcHex8(p.univ,.14)}" data-uds-base-univ="${String(p.univ).replace(/"/g,'&quot;')}" style="cursor:pointer;transition:background .15s;background:${isEven?gcHex8(p.univ,.04):'rgba(255,255,255,.98)'}">
      <td style="text-align:center;padding:5px 4px;white-space:nowrap">${p.role?getRoleBadgeHTML(p.role,'10px'):''}</td>
      <td style="text-align:center">${getTierBadge(p.tier)}</td>
      <td style="text-align:center"><span class="rbadge r${p.race}">${p.race}</span></td>
      <td style="text-align:left;padding-left:10px;font-weight:700"><span style="display:inline-flex;align-items:center;gap:6px">${getPlayerPhotoHTML(p.name,'30px')}<span class="clickable-name">${p.name}</span>${getStatusIconHTML(p.name)}</span></td>
      <td style="text-align:center;color:var(--gray-l,#cbd5e1)">${genderIcon(p.gender)||'–'}</td>
      <td style="text-align:center" class="wt">${rec.w||0}</td>
      <td style="text-align:center" class="lt">${rec.l||0}</td>
      <td style="text-align:center;font-weight:800;color:${twr>=50?'#16a34a':'#dc2626'}">${tw?twr+'%':'-'}</td>
      <td style="text-align:center" class="${pC(rec.pts||0)}">${pS(rec.pts||0)}</td>
    </tr>`;
  });
  h+=`</tbody></table></div></div>`;
  return h;
}

function buildUnivOppStatsHTML(opts){
  const { oppStats={}, isMobile=false, isTablet=false } = opts || {};
  const oppList=Object.entries(oppStats).filter(([,s])=>s.w+s.l>0).sort((a,b)=>(b[1].w+b[1].l)-(a[1].w+a[1].l));
  if(!oppList.length) return '';
  let h=`<div class="su-sec" style="--su-sec-accent:#7c3aed">
    <div class="su-sec__title">상대 대학 전적</div>
    <div style="display:flex;gap:7px;flex-wrap:wrap">`;
  oppList.forEach(([opp,s])=>{
    const ot=s.w+s.l;
    const ow=ot?Math.round(s.w/ot*100):0;
    const oc=gc(opp);
    const _hexToRgb = h => { const m=String(h||'').match(/^#([0-9a-f]{6})$/i); if(!m)return '59,130,246'; const n=parseInt(m[1],16); return `${(n>>16)&255},${(n>>8)&255},${n&255}`; };
    const ocRgb = _hexToRgb(oc);
    h+=`<div style="background:var(--white);border:1.5px solid rgba(148,163,184,.18);border-radius:14px;padding:${isMobile?'9px 11px':(isTablet?'10px 13px':'11px 15px')};text-align:center;cursor:pointer;min-width:${isMobile?'78px':'92px'};box-shadow:0 4px 12px rgba(${ocRgb},.08),0 1px 4px rgba(0,0,0,.04);transition:box-shadow .15s,transform .15s"
      data-uds-action="open-univ" data-uds-univ="${opp.replace(/"/g,'&quot;')}">
      <span class="ubadge" data-icon-done="1" style="background:${oc};font-size:${isMobile?'9px':'10px'};margin-bottom:7px;display:inline-flex;align-items:center;gap:3px">${gUI(opp,isMobile?'10px':'11px')}${opp}</span>
      <div style="font-size:${isMobile?'11px':'12px'};margin-top:4px;font-weight:700"><span class="wt">${s.w}</span>승 <span class="lt">${s.l}</span>패</div>
      <div style="font-weight:900;font-size:${isMobile?'11px':'12px'};color:${ow>=50?'#16a34a':'#dc2626'};margin-top:2px">${ow}%</div>
    </div>`;
  });
  h+=`</div></div>`;
  return h;
}

try{
  _bindUnivSectionsDelegatedEvents();
  window.buildUnivHeaderCardHTML = buildUnivHeaderCardHTML;
  window.buildUnivMembersTableHTML = buildUnivMembersTableHTML;
  window.buildUnivOppStatsHTML = buildUnivOppStatsHTML;
}catch(e){}
