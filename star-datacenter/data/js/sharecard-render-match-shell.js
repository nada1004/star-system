(function(){
  // ── 모드별 장식 헬퍼 (기본/캠퍼스를 제외한 모든 모드는 색상만이 아니라
  //    라벨/구분선/VS 표현/카드 프레임 구조 자체가 달라지도록 구성) ──

  function _scLabelChip(mode, fullLbl, variant, winnerColor){
    if(!fullLbl) return '<div></div>';
    switch(mode){
      case 'vivid':
        return `<div style="position:relative;display:inline-block;background:${winnerColor};color:#fff;font-weight:900;font-size:11px;padding:5px 14px;border-radius:6px 14px 6px 14px;transform:rotate(-3deg);box-shadow:0 6px 14px rgba(0,0,0,.32);white-space:nowrap">${fullLbl}</div>`;
      case 'poster':
        return `<div style="font-size:11px;font-weight:900;letter-spacing:3px;color:#fbbf24;text-transform:uppercase;white-space:nowrap">${fullLbl}</div>`;
      case 'mono':
        return `<div style="font-family:'Courier New',monospace;font-size:11px;font-weight:900;color:#111;background:#fff;border:1.5px solid #111;padding:2px 10px;white-space:nowrap">[ ${fullLbl} ]</div>`;
      case 'dark':
        return `<div style="font-size:var(--fs-caption);color:#fff;font-weight:700;background:rgba(255,255,255,.08);border:1px solid ${winnerColor};box-shadow:0 0 10px ${winnerColor}55;padding:3px 12px;border-radius:20px;white-space:nowrap">${fullLbl}</div>`;
      case 'minimal':
        return `<div style="font-size:10px;font-weight:800;letter-spacing:2.5px;color:rgba(255,255,255,.72);text-transform:uppercase;white-space:nowrap">${fullLbl}</div>`;
      case 'aurora':
        return `<div style="font-size:var(--fs-caption);color:#fff;font-weight:700;background:rgba(255,255,255,.22);border:1px solid rgba(255,255,255,.4);padding:3px 12px;border-radius:16px;backdrop-filter:blur(6px);white-space:nowrap">${fullLbl}</div>`;
      case 'soft':
        return `<div style="font-size:var(--fs-caption);color:#fff;font-weight:700;background:${variant.chipBg};border:1px solid ${variant.chipBd};padding:4px 14px;border-radius:999px;white-space:nowrap">${fullLbl}</div>`;
      default:
        return `<div style="font-size:var(--fs-caption);color:rgba(255,255,255,.94);font-weight:700;background:${variant.chipBg};border:1px solid ${variant.chipBd};padding:3px 12px;border-radius:20px;backdrop-filter:blur(4px);white-space:nowrap">${fullLbl}</div>`;
    }
  }

  function _scVersusHTML(mode, winnerColor, fallbackHTML){
    switch(mode){
      case 'vivid':
        return `<div style="width:52px;height:52px;border-radius:50%;background:linear-gradient(135deg,#fff,${winnerColor});display:flex;align-items:center;justify-content:center;font-weight:1000;font-size:14px;color:#1e1e1e;box-shadow:0 8px 18px rgba(0,0,0,.35);border:3px solid rgba(255,255,255,.85);transform:rotate(-6deg);flex-shrink:0">VS</div>`;
      case 'soft':
        return `<div style="width:40px;height:40px;border-radius:50%;background:rgba(255,255,255,.5);display:flex;align-items:center;justify-content:center;font-weight:900;font-size:12px;color:#fff;border:2px solid rgba(255,255,255,.75);flex-shrink:0">VS</div>`;
      case 'dark':
        return `<div style="text-align:center;min-width:44px;flex-shrink:0"><div style="font-size:15px;font-weight:1000;letter-spacing:2px;color:#fff;text-shadow:0 0 10px ${winnerColor},0 0 20px ${winnerColor}">VS</div></div>`;
      case 'minimal':
        return `<div style="font-size:11px;font-weight:700;color:rgba(255,255,255,.55);font-style:italic;align-self:center;min-width:28px;text-align:center;flex-shrink:0">vs</div>`;
      case 'aurora':
        return `<div style="width:46px;height:46px;border-radius:50%;background:radial-gradient(circle at 35% 30%,rgba(255,255,255,.92),rgba(255,255,255,.18));display:flex;align-items:center;justify-content:center;font-weight:900;font-size:12px;color:#334155;box-shadow:0 0 22px rgba(255,255,255,.55);flex-shrink:0">VS</div>`;
      case 'poster':
        return `<div style="text-align:center;min-width:30px;flex-shrink:0"><div style="width:2px;height:26px;background:rgba(251,191,36,.65);margin:0 auto 4px"></div><div style="font-size:13px;font-weight:1000;letter-spacing:3px;color:#fbbf24">VS</div><div style="width:2px;height:26px;background:rgba(251,191,36,.65);margin:4px auto 0"></div></div>`;
      case 'mono':
        return `<div style="min-width:40px;text-align:center;font-family:'Courier New',monospace;font-weight:900;font-size:12px;color:#111;background:#fff;border:2px solid #111;padding:3px 8px;flex-shrink:0">VS</div>`;
      default:
        return fallbackHTML;
    }
  }

  function _scHeaderDecoHTML(mode, winnerColor, scMixHex, hiCss){
    // 기본(campus)과 동일한 은은한 원형 블러 대신, 모드마다 완전히 다른 배경 장식을 사용
    switch(mode){
      case 'vivid':
        return `<div style="position:absolute;inset:0;background:repeating-linear-gradient(135deg,rgba(255,255,255,.08) 0 14px,transparent 14px 28px);pointer-events:none"></div>`;
      case 'soft':
        return `<div style="position:absolute;top:calc(-40px + ${hiCss});right:calc(-30px + ${hiCss});width:220px;height:220px;border-radius:50%;background:${scMixHex(winnerColor||'#475569','#ffffff',.82)}33;filter:blur(6px);pointer-events:none"></div>
        <div style="position:absolute;bottom:-60px;left:calc(-30px + ${hiCss});width:200px;height:200px;border-radius:50%;background:${scMixHex(winnerColor||'#475569','#ffffff',.7)}2b;filter:blur(6px);pointer-events:none"></div>`;
      case 'dark':
        return `<div style="position:absolute;left:0;right:0;top:0;height:3px;background:linear-gradient(90deg,transparent,${winnerColor},transparent)"></div>
        <div style="position:absolute;inset:0;background:radial-gradient(160px 80px at 50% 0%, ${winnerColor}22, transparent 65%);pointer-events:none"></div>`;
      case 'minimal':
        return '';
      case 'aurora':
        return `<div style="position:absolute;inset:0;background:
          radial-gradient(160px 90px at 12% 8%, rgba(255,255,255,.30), transparent 60%),
          radial-gradient(180px 100px at 88% 4%, rgba(255,255,255,.22), transparent 62%),
          radial-gradient(220px 130px at 50% 100%, rgba(255,255,255,.14), transparent 70%);
          pointer-events:none"></div>`;
      case 'poster':
        return `<div style="position:absolute;left:0;right:0;top:0;height:4px;background:linear-gradient(90deg,#fbbf24,#f59e0b,#fbbf24)"></div>`;
      case 'mono':
        return `<div style="position:absolute;inset:6px;border:1px solid rgba(255,255,255,.35);pointer-events:none"></div>`;
      default:
        return `<div style="position:absolute;top:calc(-28px + ${hiCss});right:calc(-10px + ${hiCss});width:180px;height:180px;border-radius:50%;background:${scMixHex(winnerColor||'#475569','#ffffff',.72)}22;filter:blur(2px);pointer-events:none"></div>
        <div style="position:absolute;bottom:-46px;left:calc(-12px + ${hiCss});width:150px;height:150px;border-radius:50%;background:${scMixHex(winnerColor||'#475569','#0f172a',.40)}1f;filter:blur(2px);pointer-events:none"></div>
        <div style="position:absolute;inset:0;background:
          radial-gradient(120px 60px at 18% 20%, rgba(255,255,255,.14), transparent 60%),
          radial-gradient(140px 70px at 82% 15%, rgba(255,255,255,.10), transparent 62%);
          pointer-events:none"></div>`;
    }
  }

  function _scDividerHTML(mode, winnerColor){
    switch(mode){
      case 'mono':
        return `<div style="height:0;border-top:3px double #111"></div>`;
      case 'poster':
        return `<div style="height:2px;background:linear-gradient(90deg,transparent,#fbbf24,transparent)"></div>`;
      case 'dark':
        return `<div style="height:1px;background:linear-gradient(90deg,transparent,${winnerColor},transparent);box-shadow:0 0 8px ${winnerColor}77"></div>`;
      case 'minimal':
        return `<div style="height:1px;background:rgba(0,0,0,.08)"></div>`;
      default:
        return '';
    }
  }

  function _scCardWrapExtra(mode){
    switch(mode){
      case 'mono':
        return { filter:'grayscale(1) contrast(1.05)', shadow:'0 20px 40px rgba(0,0,0,.28)' };
      case 'dark':
        return { filter:'', shadow:'0 26px 56px rgba(0,0,0,.5),0 0 0 1px rgba(255,255,255,.06) inset' };
      case 'poster':
        return { filter:'', shadow:'0 30px 60px rgba(0,0,0,.45)' };
      default:
        return { filter:'', shadow:'0 26px 56px rgba(15,23,42,.22),0 2px 0 rgba(255,255,255,.5) inset' };
    }
  }

  function _scBodyBg(mode){
    switch(mode){
      case 'mono': return 'linear-gradient(180deg,#ffffff,#fafafa)';
      case 'minimal': return '#ffffff';
      case 'poster': return 'linear-gradient(180deg,#ffffff,#fdfaf3)';
      default: return 'linear-gradient(180deg,#ffffff,#f8fbff)';
    }
  }

  function buildShareMatchPersonalShell(args){
    const {
      variant, theme, headerMatchBg, winnerColor, scMixHex, personalMetaBar,
      aWin, bWin, personalPosterSide, summaryHTML, setsHTML, scp
    } = args || {};
    const mode = (scp&&scp.mode)||'campus';
    const surfaceBg = mode==='mono' ? 'linear-gradient(180deg,rgba(255,255,255,.16),rgba(255,255,255,.04))' : 'linear-gradient(180deg,rgba(255,255,255,.10),rgba(255,255,255,.05))';
    const shape = (typeof window._shareCardShapeStyle==='function') ? window._shareCardShapeStyle(scp&&scp.cardShape) : {radius:'24px',clip:'none',headerInsetPct:0};
    const hiPct = shape.headerInsetPct||0;
    const hiCss = hiPct>0 ? `calc(100% * ${hiPct})` : '0px';
    const wrapExtra = _scCardWrapExtra(mode);
    const divider = _scDividerHTML(mode, winnerColor);
    return `<div class="share-shell share-shell--match share-shell--personal" data-sc-mode="${mode}" data-sc-match-layout="${scp&&scp.matchLayout||'default'}" style="background:${variant.outerBg};color:${theme.text};min-width:340px;width:100%;border-radius:${shape.radius};${shape.clip!=='none'?`clip-path:${shape.clip};`:''}overflow:hidden;font-family:'Noto Sans KR',sans-serif;${wrapExtra.filter?`filter:${wrapExtra.filter};`:''}box-shadow:${wrapExtra.shadow}">
      <div class="share-personal-header" style="background:${headerMatchBg};padding:18px;padding-top:calc(18px + ${hiCss});position:relative;overflow:hidden">
        ${_scHeaderDecoHTML(mode, winnerColor, scMixHex, hiCss)}
        <div class="share-personal-surface" style="position:relative;z-index:1;border:1px solid rgba(255,255,255,.12);border-radius:${mode==='mono'?'4px':'22px'};padding:18px;background:${surfaceBg};backdrop-filter:blur(8px)">
          ${personalMetaBar}
          <div class="share-personal-stage" style="position:relative">
            <div class="share-personal-grid" style="display:grid;grid-template-columns:${aWin?'minmax(0,1.14fr) minmax(0,.86fr)':bWin?'minmax(0,.86fr) minmax(0,1.14fr)':'minmax(0,1fr) minmax(0,1fr)'};gap:12px;align-items:center">
              ${personalPosterSide('A')}
              ${personalPosterSide('B')}
            </div>
          </div>
        </div>
      </div>
      ${divider}
      <div class="share-personal-body" style="padding:${setsHTML?'14px 18px 16px':'12px 18px 16px'};background:${_scBodyBg(mode)};box-shadow:inset 0 6px 10px -9px rgba(15,23,42,.35)">
        ${summaryHTML}
        ${setsHTML?`<div class="share-match-sets-wrap" style="margin-bottom:2px">${setsHTML}</div>`:''}
      </div>
    </div>`;
  }

  function buildShareMatchShell(args){
    const {
      m, variant, theme, headerMatchBg, winnerColor, scMixHex, teamMode,
      scoreInlineHTML, teamHeaderHTML, heroSideBlock, centerVersusHTML,
      summaryHTML, teamRosterHTML, setsHTML, scp
    } = args || {};
    const mode = (scp&&scp.mode)||'campus';
    const typeLbl = {mini:'⚔️ 미니대전',univm:'🏫 대학대전',pro:'🏆 프로리그',tt:'🎯 티어대회',ck:'🤝 대학CK','procomp-team':'🤝 팀전','procomp-bkt':'🗂️ 토너먼트'}[m?m._matchType:''] || '';
    const lbl = typeLbl || ((m&&m.n)?`🎖️ ${m.n}`:'');
    const fullLbl = lbl ? `${lbl}${m&&m._subLabel?` · ${m._subLabel}`:''}` : ((m&&m._subLabel)||'');
    const shape = (typeof window._shareCardShapeStyle==='function') ? window._shareCardShapeStyle(scp&&scp.cardShape) : {radius:'24px',clip:'none',headerInsetPct:0};
    const hiPct = shape.headerInsetPct||0;
    const hiCss = hiPct>0 ? `calc(100% * ${hiPct})` : '0px';
    const wrapExtra = _scCardWrapExtra(mode);
    const divider = _scDividerHTML(mode, winnerColor);
    const labelChipHTML = _scLabelChip(mode, fullLbl, variant, winnerColor);
    const vsHTML = _scVersusHTML(mode, winnerColor, centerVersusHTML);
    const dateColor = mode==='minimal' ? 'rgba(255,255,255,.6)' : (mode==='mono' ? '#fff' : 'rgba(255,255,255,.84)');
    return `<div class="share-shell share-shell--match" data-sc-mode="${mode}" data-sc-match-layout="${scp&&scp.matchLayout||'default'}" style="background:${variant.outerBg};color:${theme.text};min-width:340px;width:100%;border-radius:${shape.radius};${shape.clip!=='none'?`clip-path:${shape.clip};`:''}overflow:hidden;font-family:'Noto Sans KR',sans-serif;${wrapExtra.filter?`filter:${wrapExtra.filter};`:''}box-shadow:${wrapExtra.shadow}">
      <div class="share-match-header" style="background:${headerMatchBg};padding:18px;padding-top:calc(18px + ${hiCss});position:relative;overflow:hidden">
        ${_scHeaderDecoHTML(mode, winnerColor, scMixHex, hiCss)}
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;margin-right:${hiCss};position:relative;z-index:1;gap:10px;flex-wrap:wrap">
          ${fullLbl
            ? `<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;min-width:0">
                ${labelChipHTML}
                ${scoreInlineHTML(teamMode?'team':'default')}
              </div>`
            : '<div></div>'}
          <div style="text-align:right">
            <div style="font-size:var(--fs-caption);color:${dateColor};font-weight:800">${(m&&m.d)||''}</div>
          </div>
        </div>
        ${teamMode && teamHeaderHTML ? teamHeaderHTML : `
        <div class="share-match-versus-row" style="display:flex;align-items:flex-start;justify-content:center;gap:10px;position:relative;z-index:1">
          ${heroSideBlock('A')}
          ${vsHTML}
          ${heroSideBlock('B')}
        </div>
        `}
      </div>
      ${divider}
      <div class="share-match-body" style="padding:${setsHTML?'14px 18px 16px':'12px 18px 16px'};background:${_scBodyBg(mode)};box-shadow:inset 0 6px 10px -9px rgba(15,23,42,.35)">
        ${summaryHTML}
        ${teamRosterHTML}
        ${setsHTML?`<div class="share-match-sets-wrap" style="margin-bottom:2px">${setsHTML}</div>`:''}
      </div>
    </div>`;
  }

  window._buildShareMatchPersonalShell = buildShareMatchPersonalShell;
  window._buildShareMatchShell = buildShareMatchShell;
})();
