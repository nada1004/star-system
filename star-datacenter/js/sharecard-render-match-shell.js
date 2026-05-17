(function(){
  function buildShareMatchPersonalShell(args){
    const {
      variant, theme, headerMatchBg, winnerColor, scMixHex, personalMetaBar,
      aWin, bWin, personalPosterSide, summaryHTML, setsHTML
    } = args || {};
    const surfaceBg='linear-gradient(180deg,rgba(255,255,255,.10),rgba(255,255,255,.05))';
    return `<div class="share-shell share-shell--match share-shell--personal" style="background:${variant.outerBg};color:${theme.text};min-width:340px;width:100%;border-radius:24px;overflow:hidden;font-family:'Noto Sans KR',sans-serif;box-shadow:0 24px 52px rgba(15,23,42,.18)">
      <div class="share-personal-header" style="background:${headerMatchBg};padding:18px;position:relative;overflow:hidden">
        <div style="position:absolute;top:-28px;right:-10px;width:180px;height:180px;border-radius:50%;background:${scMixHex(winnerColor||'#475569','#ffffff',.72)}22;filter:blur(2px);pointer-events:none"></div>
        <div style="position:absolute;bottom:-46px;left:-12px;width:150px;height:150px;border-radius:50%;background:${scMixHex(winnerColor||'#475569','#0f172a',.40)}1f;filter:blur(2px);pointer-events:none"></div>
        <div style="position:absolute;inset:0;background:
          radial-gradient(120px 60px at 18% 20%, rgba(255,255,255,.14), transparent 60%),
          radial-gradient(140px 70px at 82% 15%, rgba(255,255,255,.10), transparent 62%);
          pointer-events:none"></div>
        <div class="share-personal-surface" style="position:relative;z-index:1;border:1px solid rgba(255,255,255,.12);border-radius:22px;padding:18px;background:${surfaceBg};backdrop-filter:blur(8px)">
          ${personalMetaBar}
          <div class="share-personal-stage" style="position:relative">
            <div class="share-personal-grid" style="display:grid;grid-template-columns:${aWin?'minmax(0,1.14fr) minmax(0,.86fr)':bWin?'minmax(0,.86fr) minmax(0,1.14fr)':'minmax(0,1fr) minmax(0,1fr)'};gap:12px;align-items:center">
              ${personalPosterSide('A')}
              ${personalPosterSide('B')}
            </div>
          </div>
        </div>
      </div>
      <div class="share-personal-body" style="padding:${setsHTML?'14px 18px 16px':'12px 18px 16px'};background:linear-gradient(180deg,#ffffff,#f8fbff)">
        ${summaryHTML}
        ${setsHTML?`<div style="margin-bottom:2px">${setsHTML}</div>`:''}
        
      </div>
    </div>`;
  }

  function buildShareMatchShell(args){
    const {
      m, variant, theme, headerMatchBg, winnerColor, scMixHex, teamMode,
      scoreInlineHTML, teamHeaderHTML, heroSideBlock, centerVersusHTML,
      summaryHTML, teamRosterHTML, setsHTML
    } = args || {};
    const typeLbl = {mini:'⚔️ 미니대전',univm:'🏫 대학대전',pro:'🏆 프로리그',tt:'🎯 티어대회',ck:'🤝 대학CK','procomp-team':'🤝 팀전','procomp-bkt':'🗂️ 토너먼트'}[m?m._matchType:''] || '';
    const lbl = typeLbl || ((m&&m.n)?`🎖️ ${m.n}`:'');
    const fullLbl = lbl ? `${lbl}${m&&m._subLabel?` · ${m._subLabel}`:''}` : ((m&&m._subLabel)||'');
    return `<div class="share-shell share-shell--match" style="background:${variant.outerBg};color:${theme.text};min-width:340px;width:100%;border-radius:24px;overflow:hidden;font-family:'Noto Sans KR',sans-serif;box-shadow:0 24px 52px rgba(15,23,42,.18)">
      <div style="background:${headerMatchBg};padding:18px;position:relative;overflow:hidden">
        <div style="position:absolute;top:-28px;right:-10px;width:180px;height:180px;border-radius:50%;background:${scMixHex(winnerColor||'#475569','#ffffff',.72)}22;filter:blur(2px);pointer-events:none"></div>
        <div style="position:absolute;bottom:-46px;left:-12px;width:150px;height:150px;border-radius:50%;background:${scMixHex(winnerColor||'#475569','#0f172a',.40)}1f;filter:blur(2px);pointer-events:none"></div>
        <div style="position:absolute;inset:0;background:
          radial-gradient(120px 60px at 18% 20%, rgba(255,255,255,.14), transparent 60%),
          radial-gradient(140px 70px at 82% 15%, rgba(255,255,255,.10), transparent 62%);
          pointer-events:none"></div>
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;position:relative;z-index:1;gap:10px;flex-wrap:wrap">
          ${fullLbl
            ? `<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;min-width:0">
                <div style="font-size:11px;color:rgba(255,255,255,.94);font-weight:700;background:${variant.chipBg};border:1px solid ${variant.chipBd};padding:3px 12px;border-radius:20px;backdrop-filter:blur(4px);white-space:nowrap">${fullLbl}</div>
                ${scoreInlineHTML(teamMode?'team':'default')}
              </div>`
            : '<div></div>'}
          <div style="text-align:right">
            <div style="font-size:11px;color:rgba(255,255,255,.84);font-weight:800">${(m&&m.d)||''}</div>
          </div>
        </div>
        ${teamMode && teamHeaderHTML ? teamHeaderHTML : `
        <div style="display:flex;align-items:flex-start;justify-content:center;gap:10px;position:relative;z-index:1">
          ${heroSideBlock('A')}
          ${centerVersusHTML}
          ${heroSideBlock('B')}
        </div>
        `}
      </div>
      <div style="padding:${setsHTML?'14px 18px 16px':'12px 18px 16px'};background:linear-gradient(180deg,#ffffff,#f8fbff)">
        ${summaryHTML}
        ${teamRosterHTML}
        ${setsHTML?`<div style="margin-bottom:2px">${setsHTML}</div>`:''}
        
      </div>
    </div>`;
  }

  window._buildShareMatchPersonalShell = buildShareMatchPersonalShell;
  window._buildShareMatchShell = buildShareMatchShell;
})();
