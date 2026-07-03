(function(){
  function _scClampPct(n, d){
    const v = Number(n);
    if(!Number.isFinite(v)) return d;
    return Math.max(0, Math.min(100, v));
  }
  function _scResolvePersonalFaceUrl(player){
    try{
      const url = String(player && player.shareCardPhoto || '').trim();
      if(url) return url;
    }catch(e){}
    try{
      const nm = String((player && player.name) || '').trim();
      if(nm && Array.isArray(window.players)){
        const p = window.players.find(x=>x && x.name===nm);
        const url = String(p && p.shareCardPhoto || '').trim();
        if(url) return url;
      }
    }catch(e){}
    try{
      const url = String(player && player.photo || '').trim();
      if(url) return url;
    }catch(e){}
    try{
      const nm = String((player && player.name) || '').trim();
      if(nm && Array.isArray(window.players)){
        const p = window.players.find(x=>x && x.name===nm);
        const url = String(p && p.photo || '').trim();
        if(url) return url;
      }
    }catch(e){}
    return '';
  }
  function _scResolvePersonalFacePos(player, fallback){
    const def = fallback || 'center 22%';
    try{
      let src = player;
      try{
        const nm = String((player && player.name) || '').trim();
        if(nm && Array.isArray(window.players)){
          const p = window.players.find(x=>x && x.name===nm);
          if(p) src = p;
        }
      }catch(e){}
      if(src && src.shareCardPhotoPosUse === false) return def;
      const x = _scClampPct(src && src.shareCardPhotoPosX, null);
      const y = _scClampPct(src && src.shareCardPhotoPosY, null);
      if(x==null || y==null) return def;
      return `${x}% ${y}%`;
    }catch(e){
      return def;
    }
  }

  function buildShareMatchHeroSideBlock(args){
    const {
      side, aWin, bWin, a, b, _dispA, _dispB, ca, cb, caRgb, cbRgb, isCivil, civUniv,
      _usePlayerPhoto, statsP, pa, pb, _tierBg, _tierFg, scp, _raceLabel, _univLogo,
      m, _isPersonalScoreCard, _photoCoverH, _photoOuter, _iconOuter, _iconInner,
      getPlayerPhotoHTML, toHttpsUrl, univIconHTML
    } = args || {};
    const isA = side==='A';
    const isWin = isA ? aWin : bWin;
    const name = isA ? a : b;
    const disp = isA ? _dispA : _dispB;
    const col = isA ? ca : cb;
    const rgb = isA ? caRgb : cbRgb;
    const iconName = isCivil && civUniv ? civUniv : name;
    const player = (_usePlayerPhoto ? (statsP(name)|| (isA ? pa : pb) || null) : (isA ? pa : pb));
    const title = isCivil ? (isA?'⚔️ A팀':'🛡️ B팀') : (player?.name || disp);
    const hasUnivLogo = (univName)=>{
      try{
        const key = String(univName||'').trim();
        if(!key) return false;
        return !!((window.UNIV_ICONS && window.UNIV_ICONS[key]) || ((Array.isArray(window.univCfg)?window.univCfg:[]).find(x=>x&&x.name===key&&(x.icon||window.UNIV_ICONS?.[key]))));
      }catch(e){
        return false;
      }
    };
    const hideTeamUnivOnTop = ['tt','pro','procomp-bkt','procomp-team'].includes(String(m&&m._matchType||''));
    const univColor = player?.univ && typeof window.gc==='function' ? (window.gc(player.univ) || col) : col;
    const univLogoTone = isWin ? '' : 'filter:grayscale(1) brightness(.82) contrast(.9);opacity:.82;';
    const loseTone = Math.max(.44, 1-(scp.loserGray||.55)*0.78);
    const textMain = isWin ? '#ffffff' : `rgba(226,232,240,${loseTone.toFixed(2)})`;
    const textMeta = isWin ? 'rgba(255,255,255,.92)' : `rgba(203,213,225,${Math.max(.40, loseTone-.10).toFixed(2)})`;
    const paneBg = isWin ? `linear-gradient(180deg, rgba(${rgb},.18), rgba(255,255,255,.10))` : `linear-gradient(180deg, rgba(${rgb},.12), rgba(15,23,42,.08))`;
    const paneBd = isWin ? `rgba(${rgb},.28)` : 'rgba(255,255,255,.18)';
    const tier = player?.tier ? `<span style="background:${_tierBg(player.tier)};color:${_tierFg(player.tier)};font-size:${Math.round(10*(scp.fontScale||1))}px;font-weight:800;padding:2px 7px;border-radius:999px">${player.tier ? String(player.tier).replace(/티어$/,'') : ''}</span>` : '';
    const race = player?.race ? _raceLabel(player.race||'') : '';
    const raceSpan = race ? `<span class="rbadge r${player.race}" style="font-size:${Math.round(9*(scp.fontScale||1))}px;padding:1px 6px;opacity:${isWin?'1':'.82'}">${race}</span>` : '';
    const titleLogo = (!hideTeamUnivOnTop && player?.univ && hasUnivLogo(player.univ)) ? `<span style="display:inline-flex;align-items:center;justify-content:center;width:${Math.round(24*(scp.fontScale||1))}px;height:${Math.round(24*(scp.fontScale||1))}px;flex-shrink:0;${univLogoTone}">${univIconHTML(player.univ||'',`${Math.round(22*(scp.logoSize||1))}px`)}</span>` : '';
    const univTextColor = isWin ? univColor : `rgba(203,213,225,${Math.max(.40, loseTone-.06).toFixed(2)})`;
    const univLine = (!hideTeamUnivOnTop && player?.univ)
      ? `<div style="margin-top:6px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;text-align:center;max-width:100%">
          ${hasUnivLogo(player.univ) ? `<span style="display:inline-flex;align-items:center;justify-content:center;width:${Math.round(34*(scp.fontScale||1))}px;height:${Math.round(34*(scp.fontScale||1))}px;flex-shrink:0;${univLogoTone}">${univIconHTML(player.univ||'',`${Math.round(30*(scp.logoSize||1))}px`)}</span>` : ''}
          <span style="font-size:${Math.round(12*(scp.fontScale||1)*(scp.univScale||1))}px;font-weight:900;color:${univTextColor};line-height:1.22;word-break:keep-all;white-space:normal;overflow-wrap:anywhere">${player.univ}</span>
        </div>`
      : '';
    const safeName = String(name||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
    const heroCoverH = _isPersonalScoreCard ? _photoCoverH : Math.round(118*(scp.profileScale||1));
    const _faceUrl = _isPersonalScoreCard ? _scResolvePersonalFaceUrl(player) : (player?.photo || '');
    const _facePos = _isPersonalScoreCard ? _scResolvePersonalFacePos(player, 'center 22%') : 'center center';
    const photoHTML = !m._noUnivIcon ? (_usePlayerPhoto
      ? (_faceUrl
        ? `<div style="width:100%;height:${heroCoverH}px;border-radius:18px;overflow:hidden;margin:0 0 12px;position:relative;${_isPersonalScoreCard?'box-shadow:0 6px 18px rgba(15,23,42,.12);border:1px solid rgba(255,255,255,.22);':(isWin?`box-shadow:0 10px 22px rgba(0,0,0,.18), 0 0 0 2px ${univColor}aa`:`opacity:.98;box-shadow:0 6px 16px rgba(2,6,23,.14), 0 0 0 1px ${univColor}66`)}">
            <img onclick="openPlayerModal('${safeName}')" title="스트리머 상세" src="${toHttpsUrl(_faceUrl)}" style="width:100%;height:100%;object-fit:cover;object-position:${_facePos};display:block;cursor:pointer;filter:${isWin?`brightness(${scp.heroBrightness||1})`:`grayscale(${Math.round((scp.loserGray||.55)*100)}%) brightness(${scp.loserPhotoBrightness||.92})`};">
            <div style="position:absolute;inset:0;background:${_isPersonalScoreCard?'linear-gradient(180deg,rgba(255,255,255,.00),rgba(15,23,42,.08))':(isWin?'linear-gradient(180deg,rgba(255,255,255,.00),rgba(15,23,42,.14))':'linear-gradient(180deg,rgba(15,23,42,.03),rgba(15,23,42,.18))')};pointer-events:none"></div>
          </div>`
        : `<div onclick="openPlayerModal('${safeName}')" title="스트리머 상세" style="width:${_photoOuter}px;height:${_photoOuter}px;border-radius:var(--su_profile_radius,50%);margin:0 auto 10px;overflow:hidden;cursor:pointer;${isWin?`box-shadow:0 0 0 2px rgba(255,255,255,.26),0 8px 18px rgba(0,0,0,.12)`:`opacity:.97;filter:grayscale(${(scp.loserGray||.55).toFixed(2)});box-shadow:0 0 0 1px rgba(255,255,255,.18)`}">
          ${getPlayerPhotoHTML(name,`${_photoOuter}px`,'width:100%;height:100%;object-fit:cover;pointer-events:none')}
        </div>`)
      : `<div style="width:${_iconOuter}px;height:${_iconOuter}px;border-radius:18px;background:${isWin?`rgba(${rgb},.38)`:'rgba(148,163,184,.18)'};margin:0 auto 10px;display:flex;align-items:center;justify-content:center;${isWin?'box-shadow:0 4px 20px rgba(0,0,0,.25);border:2px solid rgba(255,255,255,.55);':`opacity:.92;filter:grayscale(1);border:1px solid rgba(148,163,184,.40);`}overflow:hidden">
          ${univIconHTML(iconName,`${_iconInner}px`)}
        </div>`)
      : '<div style="height:12px"></div>';
    const topInline = _isPersonalScoreCard
      ? `<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:7px">
          <div style="display:flex;align-items:center;justify-content:center;gap:6px;flex-wrap:wrap">
            ${raceSpan?`<span style="display:inline-flex;align-items:center;justify-content:center;padding:4px 9px;border-radius:999px;background:rgba(255,255,255,.18);border:1px solid rgba(255,255,255,.20);backdrop-filter:blur(8px)">${raceSpan}</span>`:''}
            ${tier?`<span style="display:inline-flex;align-items:center;justify-content:center;padding:0;border-radius:999px;background:rgba(255,255,255,.14);border:1px solid rgba(255,255,255,.18);backdrop-filter:blur(8px)">${tier}</span>`:''}
          </div>
          <div style="font-size:${Math.round(26*(scp.fontScale||1)*(scp.titleScale||1))}px;font-weight:${isWin?1000:900};color:${textMain};line-height:1.08;word-break:keep-all;white-space:normal;overflow-wrap:anywhere;text-align:center;text-shadow:0 2px 10px rgba(0,0,0,.18)">${title}</div>
        </div>`
      : `<div style="display:flex;align-items:center;justify-content:center;gap:7px;font-size:${Math.round((_isPersonalScoreCard?22:20)*(scp.fontScale||1)*(scp.titleScale||1))}px;font-weight:${isWin?1000:800};color:${textMain};line-height:1.14;word-break:keep-all;white-space:normal;overflow-wrap:anywhere;text-shadow:0 1px 10px rgba(0,0,0,.18)">${titleLogo}<span>${title}</span></div>`;
    return `<div class="share-hero-side ${isWin?'is-win':'is-lose'}" style="text-align:center;flex:1;min-width:0;background:${paneBg};border:1px solid ${paneBd};border-radius:22px;padding:${_isPersonalScoreCard?'10px 10px 12px':'12px 10px 12px'};backdrop-filter:blur(8px);box-shadow:${isWin?'0 14px 28px rgba(2,6,23,.14)':'0 8px 18px rgba(2,6,23,.08)'}">
      ${photoHTML}
      ${topInline}
      <div style="margin-top:6px;display:flex;justify-content:center;align-items:center;gap:6px;flex-wrap:wrap">${_isPersonalScoreCard?'':`${tier}${raceSpan}`}</div>
      <div>${univLine}</div>
      ${isWin?`<div style="margin-top:7px"><span style="background:rgba(255,255,255,.25);border:1px solid rgba(255,255,255,.5);color:#fff;font-size:9px;font-weight:800;padding:2px 10px;border-radius:20px;letter-spacing:.5px">🏆 승리</span></div>`:`<div style="margin-top:7px;font-size:10px;color:${textMeta};font-weight:800">패배</div>`}
    </div>`;
  }

  function buildShareMatchPersonalPosterSide(args){
    const {
      side, aWin, bWin, a, b, ca, cb, caRgb, cbRgb, statsP, pa, pb, _dispA, _dispB,
      _loserGray, _tierBg, _tierFg, _raceLabel, _univLogo, toHttpsUrl, univIconHTML
    } = args || {};
    const isA = side==='A';
    const isWin = isA ? aWin : bWin;
    const playerName = isA ? a : b;
    const player = statsP(playerName) || (isA ? pa : pb) || {};
    const hasUnivLogo = (univName)=>{
      try{
        const key = String(univName||'').trim();
        if(!key) return false;
        return !!((window.UNIV_ICONS && window.UNIV_ICONS[key]) || ((Array.isArray(window.univCfg)?window.univCfg:[]).find(x=>x&&x.name===key&&(x.icon||window.UNIV_ICONS?.[key]))));
      }catch(e){
        return false;
      }
    };
    const hideTeamUnivOnTop = ['progj'].includes(String(args?.m?._matchType||''));
    const sideColor = isA ? ca : cb;
    const rgb = isA ? caRgb : cbRgb;
    const title = String(player?.name || (isA ? _dispA : _dispB) || '').trim() || (isA ? 'A PLAYER' : 'B PLAYER');
    const univColor = player?.univ && typeof window.gc==='function' ? (window.gc(player.univ) || sideColor) : sideColor;
    const univLogoTone = isWin ? '' : 'filter:grayscale(1) brightness(.82) contrast(.9);opacity:.82;';
    const loserInfoTone = `rgba(226,232,240,${Math.max(.58, 1-_loserGray*0.72).toFixed(2)})`;
    const tier = player?.tier ? `<span style="background:${isWin?_tierBg(player.tier):'rgba(255,255,255,.12)'};color:${isWin?_tierFg(player.tier):loserInfoTone};font-size:10px;font-weight:900;padding:3px 8px;border-radius:999px;border:${isWin?'none':'1px solid rgba(255,255,255,.12)'}">${player.tier ? String(player.tier).replace(/티어$/,'') : ''}</span>` : '';
    const race = player?.race ? `<span class="rbadge r${player.race}" style="font-size:9px;padding:1px 6px;${isWin?'':'filter:grayscale(1);opacity:.72;color:'+loserInfoTone}">${_raceLabel(player.race)}</span>` : '';
    const loseTone = Math.max(.44, 1-_loserGray*0.78);
    const univTextColor = isWin ? univColor : `rgba(203,213,225,${Math.max(.40, loseTone-.06).toFixed(2)})`;
    const univ = (!hideTeamUnivOnTop && player?.univ) ? `<div style="display:flex;flex-direction:column;align-items:center;gap:4px;max-width:100%;text-align:center">${hasUnivLogo(player.univ)?`<span style="display:inline-flex;align-items:center;justify-content:center;width:34px;height:34px;flex-shrink:0;${univLogoTone}">${univIconHTML(player.univ||'', '30px')}</span>`:''}<span style="font-size:${Math.round(12*(args?.scp?.fontScale||1)*(args?.scp?.univScale||1))}px;font-weight:900;color:${univTextColor};line-height:1.2;word-break:keep-all;white-space:normal;overflow-wrap:anywhere">${player.univ}</span></div>` : '';
    const titleLogo = (!hideTeamUnivOnTop && player?.univ && hasUnivLogo(player.univ)) ? `<span style="display:inline-flex;align-items:center;justify-content:center;width:24px;height:24px;flex-shrink:0;${univLogoTone}">${univIconHTML(player.univ||'', '22px')}</span>` : '';
    const safeName = String(playerName||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
    const _faceUrl = _scResolvePersonalFaceUrl(player);
    const _facePos = _scResolvePersonalFacePos(player, 'center 22%');
    const media = _faceUrl
      ? `<img class="share-poster-media" onclick="openPlayerModal('${safeName}')" title="스트리머 상세" src="${toHttpsUrl(_faceUrl)}" style="width:100%;height:100%;object-fit:cover;object-position:${_facePos};display:block;cursor:pointer;filter:${isWin?`brightness(${args?.scp?.heroBrightness||1})`:`grayscale(${Math.round(_loserGray*100)}%) brightness(${args?.scp?.loserPhotoBrightness||.92})`};">`
      : `<div onclick="openPlayerModal('${safeName}')" title="스트리머 상세" style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;cursor:pointer;background:${isWin?`linear-gradient(135deg,rgba(${rgb},.58),rgba(15,23,42,.92))`:'linear-gradient(135deg,rgba(100,116,139,.46),rgba(15,23,42,.96))'};">${player?.univ ? univIconHTML(player.univ,'84px') : `<span style="font-size:54px;font-weight:1000;color:#fff">${title.slice(0,1)}</span>`}</div>`;
    return `<div class="share-personal-side ${isWin?'is-win':'is-lose'}" style="position:relative;min-width:0;flex:1;height:${isWin?'236px':'208px'};border-radius:22px;overflow:hidden;border:1px solid rgba(255,255,255,.16);box-shadow:0 10px 24px rgba(2,6,23,.12);transform:translateY(${isWin?'-1':'2'}px) scale(${isWin?'1.005':'.992'});transform-origin:center center">
      ${media}
      <div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(255,255,255,.02),rgba(15,23,42,.04) 18%,rgba(15,23,42,.34));pointer-events:none"></div>
      ${isWin?`<div class="share-personal-winmark" style="position:absolute;top:10px;right:10px;z-index:2;background:rgba(255,255,255,.18);border:1px solid rgba(255,255,255,.28);color:#fff;font-size:17px;line-height:1;padding:8px;border-radius:999px;backdrop-filter:blur(8px)">🏆</div>`:''}
      <div style="position:absolute;inset:auto 0 0 0;padding:16px 14px 14px;display:flex;flex-direction:column;gap:8px">
        <div style="display:flex;align-items:center;justify-content:center;gap:6px;flex-wrap:wrap">
          ${race?`<span style="display:inline-flex;align-items:center;justify-content:center;padding:4px 9px;border-radius:999px;background:rgba(255,255,255,.16);border:1px solid rgba(255,255,255,.18);backdrop-filter:blur(8px)">${race}</span>`:''}
          ${tier?`<span style="display:inline-flex;align-items:center;justify-content:center;background:rgba(255,255,255,.14);border:1px solid rgba(255,255,255,.16);border-radius:999px;padding:0;backdrop-filter:blur(8px)">${tier}</span>`:''}
        </div>
        <div class="share-poster-name" style="font-size:${Math.round((isWin?28:24)*(args?.scp?.titleScale||1))}px;font-weight:${isWin?1000:900};color:${isWin?'#fff':loserInfoTone};line-height:1.08;text-shadow:0 4px 18px rgba(0,0,0,.28);white-space:normal;overflow:visible;text-overflow:clip;text-align:center">${title}</div>
        <div>${univ}</div>
      </div>
    </div>`;
  }

  function buildShareMatchPersonalMetaBar(args){
    const { m, variant, scoreInlineHTML } = args || {};
    const typeLbl = {ind:'🎯 개인전',gj:'⚡ 끝장전',progj:'🏆 프로리그 끝장전'}[m?m._matchType:''] || '🎮 개인전';
    return `<div class="share-personal-meta" style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;margin-bottom:12px">
      <div class="share-personal-meta-left" style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;min-width:0">
        <div style="font-size:11px;color:rgba(255,255,255,.96);font-weight:800;background:${variant.chipBg};border:1px solid ${variant.chipBd};padding:4px 12px;border-radius:999px;backdrop-filter:blur(6px);white-space:nowrap">${typeLbl}${m&&m._subLabel?` · ${m._subLabel}`:''}</div>
        ${scoreInlineHTML('personal')}
      </div>
      <div class="share-personal-meta-date" style="font-size:11px;color:rgba(255,255,255,.84);font-weight:800">${(m&&m.d)||''}</div>
    </div>`;
  }

  window._buildShareMatchHeroSideBlock = buildShareMatchHeroSideBlock;
  window._buildShareMatchPersonalPosterSide = buildShareMatchPersonalPosterSide;
  window._buildShareMatchPersonalMetaBar = buildShareMatchPersonalMetaBar;
})();
