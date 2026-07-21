function buildUnivDetailHTML(univName){
  const _style = (typeof prepareUnivDetailStyleData==='function')
    ? prepareUnivDetailStyleData(univName)
    : null;
  const col = _style?.col || gc(univName);
  const _isMobile = _style?.isMobile || false;
  const _isTablet = _style?.isTablet || false;
  const members = _style?.members || getMembers(univName);
  const _logoSizeEff = _style?.logoSizeEff || 'var(--su_univ_logo_size_detail,46px)';
  const _hdrBg = _style?.hdrBg || `linear-gradient(135deg,${col},${col}cc)`;
  const _hdrBgLayer = _style?.hdrBgLayer || null;
  const _layoutMode = _style?.layoutMode || 'default';
  const _univComputed = (typeof prepareUnivDetailComputedData==='function')
    ? prepareUnivDetailComputedData({ univName, members })
    : null;
  const oppStats = _univComputed?.oppStats || {};
  const wins = _univComputed?.wins || 0;
  const losses = _univComputed?.losses || 0;
  const tot = _univComputed?.tot || 0;
  const pts = _univComputed?.pts || members.reduce((s,p)=>s+p.points,0);
  const wr = _univComputed?.wr || (tot?Math.round(wins/tot*100):0);
  const byPlayer = _univComputed?.byPlayer || {};

  const _secHeader = (typeof buildUnivHeaderCardHTML==='function')
    ? buildUnivHeaderCardHTML({
        univName,
        col,
        members,
        wins,
        losses,
        tot,
        pts,
        wr,
        hdrBg:_hdrBg,
        hdrBgLayer:_hdrBgLayer,
        isMobile:_isMobile,
        isTablet:_isTablet,
        logoSizeEff:_logoSizeEff,
        layoutMode:_layoutMode
      })
    : '';

  const _secMembers = (typeof buildUnivMembersTableHTML==='function')
    ? buildUnivMembersTableHTML({ members, univName, col, byPlayer })
    : '';

  const _secOpp = (typeof buildUnivOppStatsHTML==='function')
    ? buildUnivOppStatsHTML({ oppStats, isMobile:_isMobile, isTablet:_isTablet })
    : '';

  const myMatches=_univComputed?.myMatches || [];
  const _secRecent = (typeof buildUnivRecentMatchesHTML==='function')
    ? buildUnivRecentMatchesHTML({
        myMatches,
        univName,
        isMobile:_isMobile,
        isTablet:_isTablet
      })
    : '';

  const _secAce = (typeof buildUnivAceCardsHTML==='function')
    ? buildUnivAceCardsHTML({ members, col })
    : '';

  let h='';
  if(_layoutMode==='poster'){
    h = `<div class="ud-layout ud-layout--poster">
      <div class="ud-layout-top">${_secHeader}</div>
      <div class="ud-layout-grid">
        <div class="ud-layout-main">${_secMembers}${_secRecent}</div>
        <div class="ud-layout-side">${_secOpp}${_secAce}</div>
      </div>
    </div>`;
  }else if(_layoutMode==='split'){
    h = `<div class="ud-layout ud-layout--split">
      <div class="ud-split-left">${_secHeader}${_secOpp}${_secAce}</div>
      <div class="ud-split-right">${_secMembers}${_secRecent}</div>
    </div>`;
  }else if(_layoutMode==='timeline'){
    h = `<div class="ud-layout ud-layout--timeline">
      <div class="ud-layout-top">${_secHeader}</div>
      <div class="ud-layout-grid">
        <div class="ud-layout-main">${_secRecent}</div>
        <div class="ud-layout-side">${_secMembers}${_secOpp}${_secAce}</div>
      </div>
    </div>`;
  }else if(_layoutMode==='board'){
    h = `<div class="ud-layout ud-layout--board">
      ${_secHeader}
      <div class="ud-board-grid">${_secOpp}${_secAce}${_secRecent}</div>
      ${_secMembers}
    </div>`;
  }else{
    h = `${_secHeader}${_secMembers}${_secOpp}${_secRecent}${_secAce}`;
  }

  const _udMode = _style?.designMode || 'classic';
  const _udDecor = (typeof buildUnivDetailModeDecorHTML==='function') ? buildUnivDetailModeDecorHTML(_udMode) : '';
  try{
    const _um = document.getElementById('univModal');
    if(_um){
      _um.setAttribute('data-ud-mode', _udMode);
      _um.setAttribute('data-ud-layout', _layoutMode);
      _um.setAttribute('data-ud-univbg-enabled', _style?.modalBgVars ? '1' : '0');
      _um.setAttribute('data-ud-univbg-scope', _style?.bgScope || 'body');
      _um.setAttribute('data-ud-univbtn-enabled', (_style?.modalBgVars && _style?.univBtnEnabled) ? '1' : '0');
      const keys=['--su-pastel-bg1','--su-pastel-bg2','--su-pastel-card','--su-pastel-border','--su-pastel-accent1','--su-pastel-accent2','--su-pastel-accent3','--su-pastel-text1','--su-pastel-text2','--su-pastel-shadow','--su-pastel-glow'];
      const modalKeys=['--su-ud-modal-box-bg','--su-ud-modal-box-border','--su-ud-modal-title-bg','--su-ud-modal-body-bg','--su-ud-hero-bg','--su-ud-card-bg','--su-ud-card-border','--su-ud-card-btn-bg','--su-ud-card-btn-border','--su-ud-card-btn-text'];
      if(_udMode==='pastel' && _style?.pastelVars){
        keys.forEach(k=>{
          const v=_style.pastelVars[k];
          if(v!=null && v!=='') _um.style.setProperty(k, String(v));
        });
      }else{
        keys.forEach(k=>{ try{ _um.style.removeProperty(k); }catch(e){} });
      }
      if(_style?.modalBgVars){
        modalKeys.forEach(k=>{
          const v=_style.modalBgVars[k];
          if(v!=null && v!=='') _um.style.setProperty(k, String(v));
          else try{ _um.style.removeProperty(k); }catch(e){}
        });
      }else{
        modalKeys.forEach(k=>{ try{ _um.style.removeProperty(k); }catch(e){} });
      }
    }
  }catch(e){}
  return `<div class="ud-premium-shell" data-ud-mode="${_udMode}" data-ud-layout="${_layoutMode}">${_udDecor}${h}</div>`;
}

try{
  window.buildUnivDetailHTML = buildUnivDetailHTML;
}catch(e){}
