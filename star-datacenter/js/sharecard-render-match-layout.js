(function(){
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
    const textMain = isWin ? '#ffffff' : '#9ca3af';
    const textMeta = isWin ? 'rgba(255,255,255,.84)' : '#94a3b8';
    const paneBg = isWin ? `linear-gradient(180deg, rgba(${rgb},.26), rgba(${rgb},.14))` : `linear-gradient(180deg, rgba(${rgb},.16), rgba(15,23,42,.16))`;
    const paneBd = isWin ? `rgba(${rgb},.34)` : 'rgba(255,255,255,.14)';
    const tier = player?.tier ? `<span style="background:${_tierBg(player.tier)};color:${_tierFg(player.tier)};font-size:${Math.round(10*(scp.fontScale||1))}px;font-weight:800;padding:2px 7px;border-radius:999px">${player.tier ? String(player.tier).replace(/티어$/,'') : ''}</span>` : '';
    const race = player?.race ? _raceLabel(player.race||'') : '';
    const raceSpan = race ? `<span class="rbadge r${player.race}" style="font-size:${Math.round(9*(scp.fontScale||1))}px;padding:1px 6px;opacity:${isWin?'1':'.82'}">${race}</span>` : '';
    const univLine = player?.univ ? `<div style="font-size:${Math.round(11*(scp.fontScale||1))}px;color:${textMeta};font-weight:800;display:flex;align-items:center;justify-content:center;gap:4px;line-height:1.2;white-space:normal;word-break:keep-all;overflow-wrap:anywhere">${_univLogo(player.univ||'', col)}<span>${player.univ}</span></div>` : '';
    const safeName = String(name||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
    const heroCoverH = _isPersonalScoreCard ? _photoCoverH : Math.round(118*(scp.profileScale||1));
    const photoHTML = !m._noUnivIcon ? (_usePlayerPhoto
      ? (player?.photo
        ? `<div style="width:100%;height:${heroCoverH}px;border-radius:18px;overflow:hidden;margin:0 0 12px;position:relative;${isWin?'box-shadow:0 14px 30px rgba(0,0,0,.28), 0 0 0 1px rgba(255,255,255,.18)':`opacity:.96;filter:saturate(.88) grayscale(.16);box-shadow:0 10px 24px rgba(2,6,23,.22), 0 0 0 1px rgba(148,163,184,.28)`}">
            <img onclick="openPlayerModal('${safeName}')" title="스트리머 상세" src="${toHttpsUrl(player.photo)}" style="width:100%;height:100%;object-fit:cover;display:block;cursor:pointer">
            <div style="position:absolute;inset:0;background:${isWin?'linear-gradient(180deg,rgba(15,23,42,.02),rgba(15,23,42,.34))':'linear-gradient(180deg,rgba(15,23,42,.08),rgba(15,23,42,.48))'};pointer-events:none"></div>
          </div>`
        : `<div style="width:${_photoOuter}px;height:${_photoOuter}px;border-radius:var(--su_profile_radius,50%);margin:0 auto 10px;overflow:hidden;${isWin?'box-shadow:0 0 0 3px rgba(255,255,255,.85),0 10px 26px rgba(0,0,0,.32)':`opacity:.92;filter:grayscale(1);box-shadow:0 0 0 2px rgba(148,163,184,.42)`}">
          ${getPlayerPhotoHTML(name,`${_photoOuter}px`,'width:100%;height:100%;object-fit:cover')}
        </div>`)
      : `<div style="width:${_iconOuter}px;height:${_iconOuter}px;border-radius:18px;background:${isWin?`rgba(${rgb},.38)`:'rgba(148,163,184,.18)'};margin:0 auto 10px;display:flex;align-items:center;justify-content:center;${isWin?'box-shadow:0 4px 20px rgba(0,0,0,.25);border:2px solid rgba(255,255,255,.55);':`opacity:.92;filter:grayscale(1);border:1px solid rgba(148,163,184,.40);`}overflow:hidden">
          ${univIconHTML(iconName,`${_iconInner}px`)}
        </div>`)
      : '<div style="height:12px"></div>';
    return `<div style="text-align:center;flex:1;min-width:0;background:${paneBg};border:1px solid ${paneBd};border-radius:22px;padding:${_isPersonalScoreCard?'10px 10px 12px':'12px 10px 12px'};backdrop-filter:blur(8px);box-shadow:${isWin?'0 18px 36px rgba(2,6,23,.18)':'0 10px 24px rgba(2,6,23,.10)'}">
      ${photoHTML}
      <div style="font-size:${Math.round((_isPersonalScoreCard?22:20)*(scp.fontScale||1))}px;font-weight:${isWin?1000:800};color:${textMain};line-height:1.14;word-break:keep-all;white-space:normal;overflow-wrap:anywhere;text-shadow:0 1px 10px rgba(0,0,0,.18)">${title}</div>
      <div style="margin-top:6px;display:flex;justify-content:center;align-items:center;gap:6px;flex-wrap:wrap">${tier}${raceSpan}</div>
      <div style="margin-top:4px">${univLine}</div>
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
    const sideColor = isA ? ca : cb;
    const rgb = isA ? caRgb : cbRgb;
    const title = String(player?.name || (isA ? _dispA : _dispB) || '').trim() || (isA ? 'A PLAYER' : 'B PLAYER');
    const loserInfoTone = `rgba(226,232,240,${Math.max(.42, 1-_loserGray).toFixed(2)})`;
    const tier = player?.tier ? `<span style="background:${isWin?_tierBg(player.tier):'rgba(255,255,255,.12)'};color:${isWin?_tierFg(player.tier):loserInfoTone};font-size:10px;font-weight:900;padding:3px 8px;border-radius:999px;border:${isWin?'none':'1px solid rgba(255,255,255,.12)'}">${player.tier ? String(player.tier).replace(/티어$/,'') : ''}</span>` : '';
    const race = player?.race ? `<span class="rbadge r${player.race}" style="font-size:9px;padding:1px 6px;${isWin?'':'filter:grayscale(1);opacity:.72;color:'+loserInfoTone}">${_raceLabel(player.race)}</span>` : '';
    const univ = player?.univ ? `<span style="display:inline-flex;align-items:center;gap:4px;font-size:11px;font-weight:800;color:${isWin?'rgba(255,255,255,.86)':loserInfoTone}">${_univLogo(player.univ||'', sideColor)}<span>${player.univ}</span></span>` : '';
    const safeName = String(playerName||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
    const media = player?.photo
      ? `<img onclick="openPlayerModal('${safeName}')" title="스트리머 상세" src="${toHttpsUrl(player.photo)}" style="width:100%;height:100%;object-fit:cover;object-position:center 22%;display:block;cursor:pointer;${isWin?'':'filter:grayscale(.95) saturate(.18) brightness(.66) contrast(.95)'}">`
      : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:${isWin?`linear-gradient(135deg,rgba(${rgb},.58),rgba(15,23,42,.92))`:'linear-gradient(135deg,rgba(100,116,139,.46),rgba(15,23,42,.96))'};">${player?.univ ? univIconHTML(player.univ,'84px') : `<span style="font-size:54px;font-weight:1000;color:#fff">${title.slice(0,1)}</span>`}</div>`;
    return `<div class="share-personal-side ${isWin?'is-win':'is-lose'}" style="position:relative;min-width:0;flex:1;height:${isWin?'236px':'208px'};border-radius:22px;overflow:hidden;border:1px solid ${isWin?'rgba(255,255,255,.30)':'rgba(255,255,255,.10)'};box-shadow:${isWin?'0 26px 52px rgba(2,6,23,.34)':'0 14px 28px rgba(2,6,23,.16)'};transform:${isWin?'translateY(-6px) scale(1.02)':'translateY(8px) scale(.96)'};transform-origin:center center">
      ${media}
      <div style="position:absolute;inset:0;background:${isWin?`linear-gradient(180deg,rgba(255,255,255,.02),rgba(15,23,42,.06) 18%,rgba(15,23,42,.74))`:`linear-gradient(180deg,rgba(2,6,23,.22),rgba(15,23,42,.54) 26%,rgba(15,23,42,.95))`};pointer-events:none"></div>
      ${isWin?`<div class="share-personal-winmark" style="position:absolute;top:10px;right:10px;z-index:2;background:rgba(255,255,255,.18);border:1px solid rgba(255,255,255,.28);color:#fff;font-size:17px;line-height:1;padding:8px;border-radius:999px;backdrop-filter:blur(8px)">🏆</div>`:''}
      <div style="position:absolute;inset:auto 0 0 0;padding:16px 14px 14px;display:flex;flex-direction:column;gap:8px">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:8px">
          <div style="font-size:${isWin?'28px':'24px'};font-weight:${isWin?1000:900};color:${isWin?'#fff':loserInfoTone};line-height:1.05;text-shadow:0 4px 18px rgba(0,0,0,.34);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${title}</div>
        </div>
        <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">${tier}${race}</div>
        <div>${univ}</div>
      </div>
    </div>`;
  }

  function buildShareMatchPersonalMetaBar(args){
    const { m, variant, scoreInlineHTML } = args || {};
    const typeLbl = {ind:'🎯 개인전',gj:'⚡ 끝장전',progj:'🏆 프로리그 끝장전'}[m?m._matchType:''] || '🎮 개인전';
    return `<div style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;margin-bottom:12px">
      <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;min-width:0">
        <div style="font-size:11px;color:rgba(255,255,255,.96);font-weight:800;background:${variant.chipBg};border:1px solid ${variant.chipBd};padding:4px 12px;border-radius:999px;backdrop-filter:blur(6px);white-space:nowrap">${typeLbl}${m&&m._subLabel?` · ${m._subLabel}`:''}</div>
        ${scoreInlineHTML('personal')}
      </div>
      <div style="font-size:11px;color:rgba(255,255,255,.84);font-weight:800">${(m&&m.d)||''}</div>
    </div>`;
  }

  window._buildShareMatchHeroSideBlock = buildShareMatchHeroSideBlock;
  window._buildShareMatchPersonalPosterSide = buildShareMatchPersonalPosterSide;
  window._buildShareMatchPersonalMetaBar = buildShareMatchPersonalMetaBar;
})();
