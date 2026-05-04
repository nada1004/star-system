/* ══════════════════════════════════════
   Share Card Split Parts
══════════════════════════════════════ */
function renderShareCardByPlayer(name){
  const card=document.getElementById('share-card');if(!card)return;
  const p=statsP(name);
  if(!p){card.innerHTML='<p style="color:var(--gray-l);padding:40px;text-align:center">스트리머를 찾을 수 없습니다</p>';return;}
  const h=typeof statsNonProHist==='function'?statsNonProHist(p):(p.history||[]);
  const w=h.filter(x=>x.result==='승').length,l=h.filter(x=>x.result==='패').length,tot=w+l;
  const rate=tot?Math.round(w/tot*100):0;
  const elo=p.elo||1200;
  const col=gc(p.univ);
  // history는 unshift로 추가되므로 앞이 최신 — slice(0,5)가 최근 5경기
  const form=h.slice(0,5).map(x=>x.result==='승'
    ?'<span style="display:inline-block;width:30px;height:30px;background:#16a34a;color:#fff;font-size:12px;font-weight:900;border-radius:8px;text-align:center;line-height:30px;box-shadow:0 2px 10px rgba(0,0,0,.18)">W</span>'
    :'<span style="display:inline-block;width:30px;height:30px;background:#dc2626;color:#fff;font-size:12px;font-weight:900;border-radius:8px;text-align:center;line-height:30px;box-shadow:0 2px 10px rgba(0,0,0,.18)">L</span>').join('');
  const pts=p.points||0;
  const raceLabel=p.race==='T'?'테란':p.race==='Z'?'저그':p.race==='P'?'프로토스':'?';
  const ptsColor=pts>0?'#4ade80':pts<0?'#f87171':'rgba(255,255,255,.6)';
  const ratePct=tot?rate:0;
  const _sc = _getShareCardPreset(col, '#0f172a');
  const _vp = _getShareViewportMeta();
  const ptsTextColor = pts>0?'#4ade80':pts<0?'#f87171':_sc.subText;
  const photoHtml = (()=> {
    const photo = typeof getPlayerPhotoHTML === 'function'
      ? getPlayerPhotoHTML(p.name,'74px',`border:3px solid rgba(255,255,255,.55);box-shadow:0 10px 28px ${col}55;object-fit:cover;background:rgba(255,255,255,.18)`)
      : '';
    return photo || `<div style="width:${_vp.narrow?'64px':'74px'};height:${_vp.narrow?'64px':'74px'};border-radius:${_vp.narrow?'18px':'22px'};background:rgba(255,255,255,.18);border:3px solid rgba(255,255,255,.4)"></div>`;
  })();
  card.innerHTML=`<div style="background:${_sc.shellBg};padding:0;color:${_sc.text};position:relative;overflow:hidden;border-radius:22px;box-shadow:${_sc.shellShadow}">
    <div style="position:absolute;top:-20px;right:-20px;width:150px;height:150px;border-radius:50%;background:${_sc.deco1};pointer-events:none"></div>
    <div style="position:absolute;bottom:-28px;left:-10px;width:140px;height:140px;border-radius:50%;background:${_sc.deco2};pointer-events:none"></div>
    <div style="padding:20px 20px 14px;border-bottom:${_sc.headerBorder};background:${_sc.headerBg}">
      <div style="display:flex;align-items:flex-start;gap:${_vp.narrow?'10px':'14px'};flex-direction:${_vp.narrow?'column':'row'}">
        <div style="flex-shrink:0">${photoHtml}</div>
        <div style="flex:1;min-width:0">
          <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
            <span style="font-size:10px;font-weight:900;padding:4px 10px;border-radius:999px;background:${_sc.chipBg};border:${_sc.chipBorder};color:${_sc.chipText}">🎴 스트리머 공유 카드</span>
            <span style="font-size:10px;font-weight:800;padding:4px 9px;border-radius:999px;background:${_sc.subChipBg};color:${_sc.subChipText}">${p.univ}</span>
          </div>
          <div style="font-size:${_vp.narrow?'22px':'26px'};font-weight:1000;letter-spacing:-.3px;margin-top:10px;line-height:1.18;word-break:keep-all;overflow-wrap:anywhere">${p.name}${getStatusIconHTML(p.name)}${p.gender==='M'?`<span style="font-size:12px;background:${_sc.subChipBg};color:${_sc.subChipText};padding:2px 7px;border-radius:999px;margin-left:6px">♂</span>`:''}</div>
          <div style="font-size:${_vp.narrow?'11px':'12px'};color:${_sc.subText};margin-top:4px;line-height:1.45;word-break:keep-all">${p.tier||'-'} · ${raceLabel} · ELO ${elo}</div>
        </div>
      </div>
    </div>
    <div style="padding:${_vp.narrow?'12px 14px 16px':'14px 20px 18px'}">
      <div style="display:grid;grid-template-columns:${_vp.narrow?'repeat(2,minmax(0,1fr))':'repeat(4,1fr)'};gap:8px;margin-bottom:14px">
        <div style="background:${_sc.panelBg};backdrop-filter:blur(6px);border-radius:12px;padding:10px 8px;text-align:center;border:${_sc.panelBorder}">
          <div style="font-size:10px;color:${_sc.muteText};margin-bottom:4px">승</div><div style="font-size:22px;font-weight:1000;color:#86efac">${w}</div>
        </div>
        <div style="background:${_sc.panelBg};backdrop-filter:blur(6px);border-radius:12px;padding:10px 8px;text-align:center;border:${_sc.panelBorder}">
          <div style="font-size:10px;color:${_sc.muteText};margin-bottom:4px">패</div><div style="font-size:22px;font-weight:1000;color:#fca5a5">${l}</div>
        </div>
        <div style="background:${_sc.panelBg};backdrop-filter:blur(6px);border-radius:12px;padding:10px 8px;text-align:center;border:${_sc.panelBorder}">
          <div style="font-size:10px;color:${_sc.muteText};margin-bottom:4px">승률</div><div style="font-size:19px;font-weight:1000">${tot?rate+'%':'-'}</div>
        </div>
        <div style="background:${_sc.panelBg};backdrop-filter:blur(6px);border-radius:12px;padding:10px 8px;text-align:center;border:${_sc.panelBorder}">
          <div style="font-size:10px;color:${_sc.muteText};margin-bottom:4px">포인트</div><div style="font-size:19px;font-weight:1000;color:${ptsTextColor}">${pts>=0?'+':''}${pts}</div>
        </div>
      </div>
      ${tot?`<div style="margin-bottom:14px;background:${_sc.panelBg};border:${_sc.panelBorder};border-radius:12px;padding:10px 12px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:7px">
          <span style="font-size:10px;color:${_sc.muteText}">최근 기준 승률</span>
          <span style="font-size:11px;font-weight:900">${ratePct}%</span>
        </div>
        <div style="height:8px;border-radius:999px;background:${_sc.tone==='dark'?'rgba(255,255,255,.14)':'rgba(148,163,184,.18)'};overflow:hidden">
          <div style="height:100%;width:${ratePct}%;background:linear-gradient(90deg,#86efac,#bbf7d0);border-radius:999px"></div>
        </div>
      </div>`:''}
      <div style="background:${_sc.deepPanelBg};border:${_sc.deepPanelBorder};border-radius:14px;padding:12px 12px 14px">
        <div style="font-size:10px;color:${_sc.muteText};margin-bottom:8px;letter-spacing:.3px">최근 5경기</div>
        <div style="display:flex;gap:6px;flex-wrap:wrap">${form||'<span style="opacity:.55;font-size:12px">기록없음</span>'}</div>
      </div>
      <div style="margin-top:14px;text-align:right;font-size:9px;color:${_sc.footerText};letter-spacing:.3px">${_sc.mode==='glossy'?'✨':'⭐'} 스타대학 데이터 센터</div>
    </div>
  </div>`;
}
function renderShareCardByUniv(univName){
  const card=document.getElementById('share-card');if(!card)return;
  const uList=typeof univCfg!=='undefined'&&univCfg.length?univCfg:getAllUnivs();
  const u=uList.find(x=>x.name===univName)||getAllUnivs().find(x=>x.name===univName);
  if(!u){card.innerHTML='<p style="color:var(--gray-l);padding:40px;text-align:center">대학을 찾을 수 없습니다</p>';return;}
  const proIds=typeof statsProMatchIds==='function'?statsProMatchIds():new Set();
  const sc=typeof calcUnivRadar==='function'?calcUnivRadar(u.name,proIds):{winrate:0,avgElo:0,pts:0,w:0,l:0};
  const mem=players.filter(p=>p.univ===u.name);
  const ptsColor=sc.pts>0?'#4ade80':sc.pts<0?'#f87171':'rgba(255,255,255,.8)';
  const _tiIdx=t=>{const i=TIERS.indexOf(t);return i<0?TIERS.length:i;};
  const sortedMem=[...mem].sort((a,b)=>_tiIdx(a.tier)-_tiIdx(b.tier)||(b.points||0)-(a.points||0));
  const _sc = _getShareCardPreset(u.color, '#0f172a');
  const _vp = _getShareViewportMeta();
  card.innerHTML=`<div style="background:${_sc.shellBg};padding:0;color:${_sc.text};position:relative;overflow:hidden;border-radius:22px;box-shadow:${_sc.shellShadow}">
    <div style="position:absolute;top:-28px;right:-22px;width:152px;height:152px;border-radius:50%;background:${_sc.deco1};pointer-events:none"></div>
    <div style="position:absolute;bottom:-36px;left:-8px;width:140px;height:140px;border-radius:50%;background:${_sc.deco2};pointer-events:none"></div>
    <div style="padding:20px 20px 14px;border-bottom:${_sc.headerBorder};background:${_sc.headerBg}">
      <div style="display:flex;align-items:flex-start;gap:${_vp.narrow?'10px':'14px'};flex-direction:${_vp.narrow?'column':'row'}">
        <div style="width:${_vp.narrow?'64px':'72px'};height:${_vp.narrow?'64px':'72px'};border-radius:${_vp.narrow?'18px':'22px'};background:rgba(255,255,255,.18);display:flex;align-items:center;justify-content:center;border:3px solid rgba(255,255,255,.45);flex-shrink:0;overflow:hidden;box-shadow:0 10px 28px ${u.color}55">${(()=>{const url=UNIV_ICONS[u.name]||(univCfg.find(x=>x.name===u.name)||{}).icon||'';return url?`<img src="${toHttpsUrl(url)}" style="width:${_vp.narrow?'44px':'50px'};height:${_vp.narrow?'44px':'50px'};object-fit:contain" onerror="this.style.display='none'">`:`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white' width='${_vp.narrow?'34':'40'}' height='${_vp.narrow?'34':'40'}'><path d='M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z'/></svg>`;})()}</div>
        <div style="flex:1;min-width:0">
          <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
            <span style="font-size:10px;font-weight:900;padding:4px 10px;border-radius:999px;background:${_sc.chipBg};border:${_sc.chipBorder};color:${_sc.chipText}">🎓 대학 공유 카드</span>
            <span style="font-size:10px;font-weight:800;padding:4px 9px;border-radius:999px;background:${_sc.subChipBg};color:${_sc.subChipText}">소속 선수 ${mem.length}명</span>
          </div>
          <div style="font-size:${_vp.narrow?'21px':'24px'};font-weight:1000;letter-spacing:-.2px;margin-top:10px;line-height:1.18;word-break:keep-all;overflow-wrap:anywhere">${u.name}</div>
          <div style="font-size:${_vp.narrow?'11px':'12px'};color:${_sc.subText};margin-top:4px;line-height:1.45">승률 ${sc.winrate}% · 평균 ELO ${sc.avgElo}</div>
        </div>
      </div>
    </div>
    <div style="padding:${_vp.narrow?'12px 14px 16px':'14px 20px 18px'}">
      <div style="display:grid;grid-template-columns:${_vp.narrow?'repeat(2,minmax(0,1fr))':'repeat(4,1fr)'};gap:8px;margin-bottom:14px">
        <div style="background:${_sc.panelBg};border-radius:12px;padding:10px 8px;text-align:center;border:${_sc.panelBorder}"><div style="font-size:10px;color:${_sc.muteText};margin-bottom:4px">승률</div><div style="font-size:19px;font-weight:1000">${sc.winrate}%</div></div>
        <div style="background:${_sc.panelBg};border-radius:12px;padding:10px 8px;text-align:center;border:${_sc.panelBorder}"><div style="font-size:10px;color:${_sc.muteText};margin-bottom:4px">전적</div><div style="font-size:18px;font-weight:1000">${sc.w}<span style="font-size:12px">W</span> ${sc.l}<span style="font-size:12px">L</span></div></div>
        <div style="background:${_sc.panelBg};border-radius:12px;padding:10px 8px;text-align:center;border:${_sc.panelBorder}"><div style="font-size:10px;color:${_sc.muteText};margin-bottom:4px">평균ELO</div><div style="font-size:18px;font-weight:1000">${sc.avgElo}</div></div>
        <div style="background:${_sc.panelBg};border-radius:12px;padding:10px 8px;text-align:center;border:${_sc.panelBorder}"><div style="font-size:10px;color:${_sc.muteText};margin-bottom:4px">포인트</div><div style="font-size:18px;font-weight:1000;color:${sc.pts>0?'#4ade80':sc.pts<0?'#f87171':_sc.subText}">${sc.pts>=0?'+':''}${sc.pts}</div></div>
      </div>
      <div style="background:${_sc.deepPanelBg};border:${_sc.deepPanelBorder};border-radius:14px;padding:12px 12px 14px">
        <div style="font-size:10px;color:${_sc.muteText};margin-bottom:8px;letter-spacing:.3px">대표 선수</div>
        <div style="display:flex;gap:6px;flex-wrap:wrap">${sortedMem.slice(0,10).map(p=>`<span style="background:${_sc.chipBg};border:${_sc.chipBorder};color:${_sc.chipText};border-radius:999px;padding:5px 10px;font-size:11px;font-weight:800">${p.name}</span>`).join('')}${mem.length>10?`<span style="font-size:10px;color:${_sc.muteText};padding:5px 8px">+${mem.length-10}명</span>`:''}</div>
      </div>
      <div style="margin-top:14px;text-align:right;font-size:9px;color:${_sc.footerText};letter-spacing:.3px">${_sc.mode==='glossy'?'✨':'⭐'} 스타대학 데이터 센터</div>
    </div>
  </div>`;
}

try{
  window.renderShareCardByPlayer = renderShareCardByPlayer;
  window.renderShareCardByUniv = renderShareCardByUniv;
}catch(e){}
