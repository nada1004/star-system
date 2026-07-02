(function(){
  function renderShareCard(){
    const sel=document.getElementById('share-sel');
    if(sel){
      const val=sel.value;
      if(_shareMode==='player')renderShareCardByPlayer(val);
      else if(_shareMode==='univ')renderShareCardByUniv(val);
    }
  }

  function _scClamp(n,a,b){ return Math.max(a, Math.min(b, n)); }
  function _scHexNorm(hex){
    let h=String(hex||'').trim().replace('#','');
    if(h.length===3) h=h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
    return h.length===6 ? '#'+h : '#64748b';
  }
  function _scMixHex(a,b,t){
    const ah=_scHexNorm(a).slice(1), bh=_scHexNorm(b).slice(1);
    const av=[parseInt(ah.slice(0,2),16),parseInt(ah.slice(2,4),16),parseInt(ah.slice(4,6),16)];
    const bv=[parseInt(bh.slice(0,2),16),parseInt(bh.slice(2,4),16),parseInt(bh.slice(4,6),16)];
    const m=av.map((v,i)=>Math.round(v+(bv[i]-v)*_scClamp(t,0,1)));
    return '#'+m.map(v=>v.toString(16).padStart(2,'0')).join('');
  }
  function _scShadeHex(hex, amt){
    return _scMixHex(hex, amt>=0 ? '#ffffff' : '#000000', Math.abs(amt));
  }

  const _getShareCardPrefs = window._getShareCardPrefs || function(typeKey){
    const t=String(typeKey||'').trim();
    const ov = t ? (localStorage.getItem(`su_sc_mode_${t}`)||'').trim() : '';
    const mode=(localStorage.getItem('su_sc_mode')||'campus').trim();
    const color=_scClamp(parseInt(localStorage.getItem('su_sc_color')||'72',10)||72,20,100)/100;
    const fx=_scClamp(parseInt(localStorage.getItem('su_sc_fx')||'55',10)||55,0,100)/100;
    const winbg=_scClamp(parseInt(localStorage.getItem('su_sc_winbg')||'55',10)||55,0,100)/100;
    const loserGraySrc = (t ? localStorage.getItem(`su_sc_losergray_${t}`) : null) ?? localStorage.getItem('su_sc_losergray') ?? '55';
    const loserGray=_scClamp(parseInt(loserGraySrc,10)||55,10,90)/100;
    const profileSrc = (t ? localStorage.getItem(`su_sc_profile_pct_${t}`) : null) ?? localStorage.getItem('su_sc_profile_pct') ?? '100';
    const fontSrc = (t ? localStorage.getItem(`su_sc_font_pct_${t}`) : null) ?? localStorage.getItem('su_sc_font_pct') ?? '100';
    const heroBrightSrc = localStorage.getItem('su_sc_hero_bright') ?? '100';
    const loserPhotoBrightSrc = localStorage.getItem('su_sc_loser_photo_bright') ?? '88';
    const titleFontSrc = localStorage.getItem('su_sc_title_pct') ?? '100';
    const univFontSrc = localStorage.getItem('su_sc_univ_pct') ?? '100';
    const profileScale=_scClamp(parseInt(profileSrc,10)||100,70,145)/100;
    const fontScale=_scClamp(parseInt(fontSrc,10)||100,85,135)/100;
    const heroBrightness=_scClamp(parseInt(heroBrightSrc,10)||100,70,135)/100;
    const loserPhotoBrightness=_scClamp(parseInt(loserPhotoBrightSrc,10)||88,55,120)/100;
    const titleScale=_scClamp(parseInt(titleFontSrc,10)||100,80,150)/100;
    const univScale=_scClamp(parseInt(univFontSrc,10)||100,80,160)/100;
    const surface=(localStorage.getItem('su_sc_surface')||'glass').trim();
    const logoLayout=((t ? localStorage.getItem(`su_sc_logo_layout_${t}`) : null) ?? localStorage.getItem('su_sc_logo_layout') ?? 'stack').trim();
    const logoSizeSrc=((t ? localStorage.getItem(`su_sc_logo_size_${t}`) : null) ?? localStorage.getItem('su_sc_logo_size') ?? '100');
    const logoSize=_scClamp(parseInt(logoSizeSrc,10)||100,70,150)/100;
    const logoFit=((t ? localStorage.getItem(`su_sc_logo_fit_${t}`) : null) ?? localStorage.getItem('su_sc_logo_fit') ?? 'contain').trim();
    const entityLayout=((t ? localStorage.getItem(`su_sc_entity_layout_${t}`) : null) ?? localStorage.getItem('su_sc_entity_layout') ?? 'default').trim();
    const matchLayout=((t ? localStorage.getItem(`su_sc_match_layout_${t}`) : null) ?? localStorage.getItem('su_sc_match_layout') ?? 'default').trim();
    return { mode: ov||mode, color, fx, winbg, loserGray, profileScale, fontScale, heroBrightness, loserPhotoBrightness, titleScale, univScale, surface, logoLayout, logoSize, logoFit, entityLayout, matchLayout };
  };

  window._getShareCardPrefs = _getShareCardPrefs;
  window._scMixHex = _scMixHex;
  window._scShadeHex = _scShadeHex;
  window._scHexNorm = _scHexNorm;

  function renderShareCardByPlayer(name){
    const card=document.getElementById('share-card');if(!card)return;
    const p=statsP(name);
    if(!p){card.innerHTML='<p style="color:var(--gray-l);padding:40px;text-align:center">스트리머를 찾을 수 없습니다</p>';return;}
    const h=typeof statsNonProHist==='function'?statsNonProHist(p):(p.history||[]);
    const w=h.filter(x=>x.result==='승').length,l=h.filter(x=>x.result==='패').length,tot=w+l;
    const rate=tot?Math.round(w/tot*100):0;
    const elo=p.elo||1200;
    const col=gc(p.univ);
    const form=h.slice(0,5).map(x=>x.result==='승'
      ?'<span style="display:inline-block;width:30px;height:30px;background:#16a34a;color:#fff;font-size:12px;font-weight:900;border-radius:8px;text-align:center;line-height:30px;box-shadow:0 2px 10px rgba(0,0,0,.18)">W</span>'
      :'<span style="display:inline-block;width:30px;height:30px;background:#dc2626;color:#fff;font-size:12px;font-weight:900;border-radius:8px;text-align:center;line-height:30px;box-shadow:0 2px 10px rgba(0,0,0,.18)">L</span>').join('');
    const pts=p.points||0;
    const raceLabel=p.race==='T'?'테란':p.race==='Z'?'저그':p.race==='P'?'프로토스':'?';
    const bgImg=String(p.shareCardBgImg||'').trim();
    const bgFit=String(p.shareCardBgFit||'cover').trim();
    const bgScale=Math.max(40, Math.min(220, Number(p.shareCardBgScale||100)||100));
    const bgDark=Math.max(0, Math.min(85, Number(p.shareCardBgDark??18)||0));
    const bgFade=Math.max(0, Math.min(100, Number(p.shareCardBgFade??0)||0));
    const bgPosX=((p.shareCardBgPosX||'center')+'').trim();
    const bgPosY=((p.shareCardBgPosY||'center')+'').trim();
    const bgPos=`${bgPosX} ${bgPosY}`;
    const bgCss = `linear-gradient(135deg,${col}dd,${col}88)`;
    const bgSize = bgFit==='fill' ? `${bgScale}% ${bgScale}%` : `${bgScale}%`;
    const ptsColor=pts>0?'#4ade80':pts<0?'#f87171':'rgba(255,255,255,.8)';
    const ratePct=tot?rate:0;
    const photoUrl = p.shareCardPhoto || p.photo || ''; // shareCardPhoto 전용 이미지 우선
    const photoPos = (()=>{
      try{
        if(p && p.shareCardPhotoPosUse === false) return '';
        const x = Number(p && p.shareCardPhotoPosX);
        const y = Number(p && p.shareCardPhotoPosY);
        if(!Number.isFinite(x) || !Number.isFinite(y)) return '';
        const xx = Math.max(0, Math.min(100, x));
        const yy = Math.max(0, Math.min(100, y));
        return `${xx}% ${yy}%`;
      }catch(e){
        return '';
      }
    })();
    const universityIcon = UNIV_ICONS[p.univ]||(univCfg.find(x=>x.name===p.univ)||{}).icon||'';
    const scp=_getShareCardPrefs('player');
    const baseCol=_scHexNorm(col||'#64748b');
    const profileW=Math.round(92*scp.profileScale);
    const profileH=Math.round(112*scp.profileScale);
    const profileInner=Math.round(58*scp.profileScale);
    const entityLayout = ['default','photocard','showcase','compact'].includes(String(scp.entityLayout||'')) ? scp.entityLayout : 'default';
    const accentA = scp.mode==='soft' ? _scShadeHex(baseCol,.26) : scp.mode==='dark' ? _scShadeHex(baseCol,-.22) : scp.mode==='minimal' ? _scShadeHex(baseCol,.08) : scp.mode==='aurora' ? _scMixHex(baseCol,'#38bdf8',.18) : scp.mode==='poster' ? _scShadeHex(baseCol,-.10) : scp.mode==='mono' ? '#6b7280' : scp.mode==='glacier' ? _scMixHex(baseCol,'#67e8f9',.28) : scp.mode==='rose' ? _scMixHex(baseCol,'#fb7185',.24) : scp.mode==='midnight' ? _scMixHex(baseCol,'#0f172a',.36) : baseCol;
    const accentB = scp.mode==='vivid' ? _scMixHex(baseCol,'#ffffff',.18) : scp.mode==='dark' ? _scMixHex(baseCol,'#111827',.26) : scp.mode==='aurora' ? _scMixHex(baseCol,'#7c3aed',.22) : scp.mode==='poster' ? _scMixHex(baseCol,'#111827',.42) : scp.mode==='mono' ? '#111827' : scp.mode==='glacier' ? _scMixHex(baseCol,'#e0f2fe',.56) : scp.mode==='rose' ? _scMixHex(baseCol,'#fff1f2',.54) : scp.mode==='midnight' ? '#020617' : _scMixHex(baseCol,'#ffffff',.34);
    const shellBg = scp.mode==='dark' ? 'linear-gradient(180deg,#020617,#0f172a)' : scp.mode==='minimal' ? 'linear-gradient(180deg,#0f172a,#111827)' : scp.mode==='aurora' ? `linear-gradient(160deg,${_scMixHex(baseCol,'#e0f2fe',.72)},${_scMixHex(baseCol,'#111827',.18)})` : scp.mode==='poster' ? `linear-gradient(180deg,${_scMixHex(baseCol,'#111827',.18)},#111827)` : scp.mode==='mono' ? 'linear-gradient(180deg,#1f2937,#111827)' : scp.mode==='glacier' ? `linear-gradient(180deg,${_scMixHex(baseCol,'#f0f9ff',.82)},${_scMixHex(baseCol,'#dbeafe',.56)})` : scp.mode==='rose' ? `linear-gradient(180deg,${_scMixHex(baseCol,'#fff7ed',.76)},${_scMixHex(baseCol,'#ffe4e6',.58)})` : scp.mode==='midnight' ? `linear-gradient(180deg,#020617,${_scMixHex(baseCol,'#0f172a',.74)})` : `linear-gradient(180deg,${_scShadeHex(baseCol,-.22)},#111827)`;
    const glassBg = scp.surface==='solid' ? `linear-gradient(180deg,${_scMixHex(accentA,'#ffffff',.10)},${_scMixHex(accentB,'#ffffff',.04)})` : scp.surface==='clean' ? 'linear-gradient(180deg,rgba(255,255,255,.16),rgba(255,255,255,.10))' : 'linear-gradient(180deg,rgba(255,255,255,.08),rgba(255,255,255,.04))';
    const surfaceBlur = bgImg ? '0px' : (scp.surface==='glass' ? '10px' : '4px');
    const _cacheKey = `player:${name}`;
    const _html = `<div class="share-shell share-shell--player" data-sc-mode="${scp.mode}" data-sc-entity-layout="${entityLayout}" style="background:${shellBg};padding:16px;border-radius:26px;color:#fff;position:relative;overflow:hidden;box-shadow:0 22px 48px rgba(15,23,42,.26)">
    <div style="position:absolute;inset:0;background:${bgCss};opacity:.96"></div>
    ${bgImg?`<div style="position:absolute;inset:0;background-image:url('${toHttpsUrl(bgImg)}');background-position:${bgPos};background-size:${bgSize};background-repeat:no-repeat;opacity:1"></div>`:''}
    ${bgImg?`<div style="position:absolute;inset:0;background:linear-gradient(135deg, rgba(15,23,42,${(bgDark/100).toFixed(2)}), rgba(15,23,42,${Math.max(0, (bgDark-10)/100).toFixed(2)})), linear-gradient(135deg, rgba(255,255,255,${(bgFade/100).toFixed(2)}), rgba(255,255,255,${Math.max(0, (bgFade-25)/100).toFixed(2)}));pointer-events:none"></div>`:''}
    <div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(15,23,42,${(0.08+scp.fx*0.10).toFixed(2)}),rgba(15,23,42,${(0.62+scp.fx*0.22).toFixed(2)}));pointer-events:none"></div>
    <div style="position:absolute;top:-32px;right:-28px;width:160px;height:160px;border-radius:50%;background:rgba(255,255,255,.07);pointer-events:none"></div>
    <div style="position:absolute;left:-42px;bottom:-44px;width:160px;height:160px;border-radius:50%;background:${baseCol}${Math.round(20+scp.color*30).toString(16).padStart(2,'0')};pointer-events:none"></div>
    <div class="share-surface" style="position:relative;z-index:1;border:1px solid rgba(255,255,255,.12);border-radius:22px;padding:18px;background:${glassBg};backdrop-filter:blur(${surfaceBlur})">
      <div style="display:flex;align-items:flex-start;justify-content:flex-end;gap:12px;margin-bottom:14px">
        <div style="background:rgba(255,255,255,.10);border:1px solid rgba(255,255,255,.16);border-radius:999px;padding:5px 11px;font-size:10px;font-weight:900">${p.tier||'-'}</div>
      </div>
      <div class="share-player-top" style="display:grid;grid-template-columns:auto minmax(0,1fr) auto;gap:14px;align-items:center">
        <div class="share-player-photo-wrap" style="width:${profileW}px;height:${profileH}px;border-radius:24px;background:rgba(255,255,255,.16);border:2px solid rgba(255,255,255,.26);overflow:hidden;box-shadow:0 14px 32px rgba(0,0,0,.24);display:flex;align-items:center;justify-content:center;flex-shrink:0">
          ${photoUrl?`<img src="${toHttpsUrl(photoUrl)}" style="width:100%;height:100%;object-fit:cover;${photoPos?`object-position:${photoPos};`:''}" onerror="this.remove()">`:universityIcon?`<img src="${toHttpsUrl(universityIcon)}" style="width:${profileInner}px;height:${profileInner}px;object-fit:contain" onerror="this.remove()">`:`<span style="font-size:${Math.round(36*scp.profileScale)}px;font-weight:1000;color:#fff">${String(p.name||'?').charAt(0)}</span>`}
        </div>
        <div class="share-player-main" style="min-width:0">
          <div class="share-player-name" style="font-size:27px;font-weight:1000;letter-spacing:.2px;line-height:1.08;white-space:normal;word-break:keep-all">${p.name}${getStatusIconHTML(p.name)}</div>
          <div class="share-player-meta" style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin-top:8px">
            <span style="background:rgba(255,255,255,.14);border:1px solid rgba(255,255,255,.2);border-radius:999px;padding:4px 10px;font-size:10px;font-weight:900;display:inline-flex;align-items:center;gap:5px">${gUI(p.univ,'12px')}${p.univ||'무소속'}</span>
            <span style="background:rgba(255,255,255,.14);border:1px solid rgba(255,255,255,.2);border-radius:999px;padding:4px 10px;font-size:10px;font-weight:900">${raceLabel}</span>
          </div>
          <div class="share-player-form" style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin-top:10px">${form||'<span style="opacity:.6;font-size:12px">기록없음</span>'}</div>
        </div>
        <div class="share-hero-metric" style="min-width:92px;background:rgba(255,255,255,.10);border:1px solid rgba(255,255,255,.14);border-radius:18px;padding:10px 12px;text-align:center">
          <div class="share-kicker" style="font-size:9px;letter-spacing:.8px;font-weight:900;color:rgba(255,255,255,.68)">ELO</div>
          <div class="share-hero-number" style="font-size:28px;font-weight:1000;line-height:1.02;margin-top:4px">${elo}</div>
        </div>
      </div>
      <div class="share-stat-grid" style="display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin-top:16px">
        <div class="share-stat-card" style="background:rgba(255,255,255,.09);border:1px solid rgba(255,255,255,.12);border-radius:14px;padding:10px 8px;text-align:center">
          <div class="share-kicker" style="font-size:9px;color:rgba(255,255,255,.62);font-weight:800;letter-spacing:.6px">승패</div>
          <div class="share-stat-value" style="margin-top:5px;font-size:16px;font-weight:1000"><span style="color:#4ade80">${w}</span> / <span style="color:#f87171">${l}</span></div>
        </div>
        <div class="share-stat-card" style="background:rgba(255,255,255,.09);border:1px solid rgba(255,255,255,.12);border-radius:14px;padding:10px 8px;text-align:center">
          <div class="share-kicker" style="font-size:9px;color:rgba(255,255,255,.62);font-weight:800;letter-spacing:.6px">승률</div>
          <div class="share-stat-value" style="margin-top:5px;font-size:18px;font-weight:1000">${tot?rate+'%':'-'}</div>
        </div>
        <div class="share-stat-card" style="background:rgba(255,255,255,.09);border:1px solid rgba(255,255,255,.12);border-radius:14px;padding:10px 8px;text-align:center">
          <div class="share-kicker" style="font-size:9px;color:rgba(255,255,255,.62);font-weight:800;letter-spacing:.6px">포인트</div>
          <div class="share-stat-value" style="margin-top:5px;font-size:18px;font-weight:1000;color:${ptsColor}">${pts>=0?'+':''}${pts}</div>
        </div>
        <div class="share-stat-card" style="background:rgba(255,255,255,.09);border:1px solid rgba(255,255,255,.12);border-radius:14px;padding:10px 8px;text-align:center">
          <div class="share-kicker" style="font-size:9px;color:rgba(255,255,255,.62);font-weight:800;letter-spacing:.6px">최근5경기</div>
          <div class="share-stat-value" style="margin-top:5px;font-size:18px;font-weight:1000">${h.slice(0,5).filter(x=>x.result==='승').length}</div>
        </div>
      </div>
      ${tot?`<div style="margin-top:14px">
        <div style="display:flex;justify-content:space-between;font-size:10px;color:rgba(255,255,255,.64);font-weight:800;margin-bottom:5px"><span>WIN RATE</span><span>${ratePct}%</span></div>
        <div style="height:8px;border-radius:999px;background:rgba(255,255,255,.12);overflow:hidden">
          <div style="height:100%;width:${ratePct}%;background:linear-gradient(90deg,${col},#ffffff);border-radius:999px"></div>
        </div>
      </div>`:''}
    </div>
  </div>`;
    if(typeof window._shareCardRenderCached==='function') window._shareCardRenderCached(card, _cacheKey, ()=>_html);
    else card.innerHTML=_html;
  }

  function renderShareCardByUniv(univName){
    const card=document.getElementById('share-card');if(!card)return;
    const uList=typeof univCfg!=='undefined'&&univCfg.length?univCfg:getAllUnivs();
    const u=uList.find(x=>x.name===univName)||getAllUnivs().find(x=>x.name===univName);
    if(!u){card.innerHTML='<p style="color:var(--gray-l);padding:40px;text-align:center">대학을 찾을 수 없습니다</p>';return;}
    const proIds=typeof statsProMatchIds==='function'?statsProMatchIds():new Set();
    const sc=typeof calcUnivRadar==='function'?calcUnivRadar(u.name,proIds):{winrate:0,avgElo:0,pts:0,w:0,l:0};
    const mem=players.filter(p=>p.univ===u.name);
    const ptsColor=sc.pts>0?'#4ade80':sc.pts<0?'#f87171':'#e2e8f0';
    const _tiIdx=t=>{const i=TIERS.indexOf(t);return i<0?TIERS.length:i;};
    const sortedMem=[...mem].sort((a,b)=>_tiIdx(a.tier)-_tiIdx(b.tier)||(b.points||0)-(a.points||0));
    const iconUrl=UNIV_ICONS[u.name]||(univCfg.find(x=>x.name===u.name)||{}).icon||'';
    const aces=sortedMem.slice(0,3);
    const scp=_getShareCardPrefs('univ');
    const uCol=_scHexNorm(u.color||'#64748b');
    const entityLayout = ['default','photocard','showcase','compact'].includes(String(scp.entityLayout||'')) ? scp.entityLayout : 'default';
    const shellBg = scp.mode==='dark' ? 'linear-gradient(180deg,#020617,#0f172a)' : scp.mode==='aurora' ? `linear-gradient(160deg,${_scMixHex(uCol,'#dbeafe',.70)},${_scMixHex(uCol,'#111827',.16)})` : scp.mode==='poster' ? `linear-gradient(180deg,${_scMixHex(uCol,'#111827',.20)},#111827)` : scp.mode==='mono' ? 'linear-gradient(180deg,#374151,#111827)' : scp.mode==='glacier' ? `linear-gradient(180deg,${_scMixHex(uCol,'#f0f9ff',.84)},${_scMixHex(uCol,'#dbeafe',.62)})` : scp.mode==='rose' ? `linear-gradient(180deg,${_scMixHex(uCol,'#fff7ed',.78)},${_scMixHex(uCol,'#ffe4e6',.62)})` : scp.mode==='midnight' ? `linear-gradient(180deg,#020617,${_scMixHex(uCol,'#0f172a',.76)})` : `linear-gradient(180deg,${_scShadeHex(uCol,-.18)},#111827)`;
    const glassBg = scp.surface==='solid' ? `linear-gradient(180deg,${_scMixHex(uCol,'#ffffff',.08)},${_scMixHex(uCol,'#000000',.08)})` : scp.surface==='clean' ? 'linear-gradient(180deg,rgba(255,255,255,.16),rgba(255,255,255,.10))' : 'linear-gradient(180deg,rgba(255,255,255,.08),rgba(255,255,255,.04))';
    const _cacheKey = `univ:${univName}`;
    const _html = `<div class="share-shell share-shell--univ" data-sc-mode="${scp.mode}" data-sc-entity-layout="${entityLayout}" style="background:${shellBg};padding:16px;color:#fff;position:relative;overflow:hidden;border-radius:26px;box-shadow:0 22px 48px rgba(15,23,42,.26)">
    <div style="position:absolute;inset:0;background:linear-gradient(135deg,${_scMixHex(uCol,'#ffffff',scp.mode==='soft' ? .22 : .08)}ee,${_scMixHex(uCol,'#000000',scp.mode==='dark' ? .18 : .08)}cc);opacity:.98"></div>
    <div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(15,23,42,${(0.08+scp.fx*0.08).toFixed(2)}),rgba(15,23,42,${(0.36+scp.fx*0.16).toFixed(2)}));pointer-events:none"></div>
    <div style="position:absolute;top:-40px;right:-40px;width:160px;height:160px;border-radius:50%;background:rgba(255,255,255,.06);pointer-events:none"></div>
    <div style="position:absolute;left:-42px;bottom:-44px;width:150px;height:150px;border-radius:50%;background:${uCol}${Math.round(18+scp.color*32).toString(16).padStart(2,'0')};pointer-events:none"></div>
    <div class="share-surface" style="position:relative;z-index:1;border-radius:22px;padding:18px;border:1px solid rgba(255,255,255,.12);background:${glassBg};backdrop-filter:blur(${scp.surface==='glass'?'10px':'4px'})">
      <div class="share-univ-top" style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:16px">
        <div class="share-univ-main" style="display:flex;align-items:center;gap:12px;min-width:0">
          <div class="share-univ-icon-wrap" style="width:78px;height:78px;border-radius:22px;background:rgba(255,255,255,.18);display:flex;align-items:center;justify-content:center;border:2px solid rgba(255,255,255,.30);overflow:hidden;box-shadow:0 12px 28px rgba(0,0,0,.18)">
            ${iconUrl?`<img src="${toHttpsUrl(iconUrl)}" style="width:52px;height:52px;object-fit:contain" onerror="this.remove()">`:gUI(u.name,'42px')}
          </div>
          <div style="min-width:0">
            <div class="share-univ-name" style="font-size:28px;font-weight:1000;line-height:1.06;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${u.name}</div>
            <div class="share-univ-sub" style="font-size:11px;color:rgba(255,255,255,.72);font-weight:700;margin-top:5px">소속 선수 ${mem.length}명</div>
          </div>
        </div>
        <div class="share-hero-metric" style="min-width:102px;background:rgba(255,255,255,.10);border:1px solid rgba(255,255,255,.16);border-radius:18px;padding:10px 12px;text-align:center">
          <div class="share-kicker" style="font-size:9px;letter-spacing:.8px;font-weight:900;color:rgba(255,255,255,.68)">TEAM POINT</div>
          <div class="share-hero-number" style="font-size:28px;font-weight:1000;line-height:1.02;margin-top:4px;color:${ptsColor}">${sc.pts>=0?'+':''}${sc.pts}</div>
        </div>
      </div>
      <div class="share-stat-grid" style="display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin-bottom:14px">
        <div class="share-stat-card" style="background:rgba(255,255,255,.10);border:1px solid rgba(255,255,255,.12);border-radius:14px;padding:10px 8px;text-align:center">
          <div class="share-kicker" style="font-size:9px;color:rgba(255,255,255,.64);font-weight:800">승률</div>
          <div class="share-stat-value" style="margin-top:5px;font-size:18px;font-weight:1000">${sc.winrate}%</div>
        </div>
        <div class="share-stat-card" style="background:rgba(255,255,255,.10);border:1px solid rgba(255,255,255,.12);border-radius:14px;padding:10px 8px;text-align:center">
          <div class="share-kicker" style="font-size:9px;color:rgba(255,255,255,.64);font-weight:800">전적</div>
          <div class="share-stat-value share-stat-value--compact" style="margin-top:5px;font-size:15px;font-weight:1000">${sc.w}W / ${sc.l}L</div>
        </div>
        <div class="share-stat-card" style="background:rgba(255,255,255,.10);border:1px solid rgba(255,255,255,.12);border-radius:14px;padding:10px 8px;text-align:center">
          <div class="share-kicker" style="font-size:9px;color:rgba(255,255,255,.64);font-weight:800">평균ELO</div>
          <div class="share-stat-value" style="margin-top:5px;font-size:18px;font-weight:1000">${sc.avgElo}</div>
        </div>
        <div class="share-stat-card" style="background:rgba(255,255,255,.10);border:1px solid rgba(255,255,255,.12);border-radius:14px;padding:10px 8px;text-align:center">
          <div class="share-kicker" style="font-size:9px;color:rgba(255,255,255,.64);font-weight:800">로스터</div>
          <div class="share-stat-value" style="margin-top:5px;font-size:18px;font-weight:1000">${mem.length}</div>
        </div>
      </div>
      ${aces.length?`<div style="margin-bottom:14px">
        <div style="font-size:10px;font-weight:900;letter-spacing:.8px;color:rgba(255,255,255,.72);margin-bottom:8px">ACE LINE</div>
        <div class="share-ace-grid" style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px">
          ${aces.map((p,idx)=>`<div class="share-ace-card" style="background:rgba(255,255,255,.09);border:1px solid rgba(255,255,255,.12);border-radius:16px;padding:10px 9px;text-align:center">
            <div style="font-size:9px;color:rgba(255,255,255,.58);font-weight:900;margin-bottom:6px">${idx===0?'TOP ACE':idx===1?'CORE PLAYER':'KEY MEMBER'}</div>
            <div class="share-ace-photo" style="display:flex;justify-content:center;margin-bottom:7px">${getPlayerPhotoHTML(p.name,'42px')}</div>
            <div style="font-size:12px;font-weight:1000;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${p.name}</div>
            <div style="font-size:10px;color:rgba(255,255,255,.68);margin-top:3px">${p.tier||'-'} · ${pS(p.points)}</div>
          </div>`).join('')}
        </div>
      </div>`:''}
      <div class="share-member-chips" style="display:flex;gap:6px;flex-wrap:wrap">
        ${sortedMem.slice(0,10).map(p=>`<span style="background:rgba(255,255,255,.14);border:1px solid rgba(255,255,255,.18);border-radius:999px;padding:4px 10px;font-size:10px;font-weight:800">${p.name}</span>`).join('')}
        ${mem.length>10?`<span style="opacity:.72;font-size:10px;padding:4px 8px">+${mem.length-10}명</span>`:''}
      </div>
    </div>
  </div>`;
    if(typeof window._shareCardRenderCached==='function') window._shareCardRenderCached(card, _cacheKey, ()=>_html);
    else card.innerHTML=_html;
  }

  window.renderShareCard = renderShareCard;
  window.renderShareCardByPlayer = renderShareCardByPlayer;
  window.renderShareCardByUniv = renderShareCardByUniv;
})();
