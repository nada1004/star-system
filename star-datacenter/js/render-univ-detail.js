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
    // 포스터형 — 대형 히어로 + 풀와이드 스택 (좌우 분할 없음)
    h = `<div class="ud-layout ud-layout--poster">
      <div class="ud-poster-frame">${_secHeader}</div>
      <div class="ud-poster-stack">${_secMembers}${_secOpp}${_secRecent}${_secAce}</div>
    </div>`;
  }else if(_layoutMode==='photocard'){
    // 포토카드형 — 폭이 좁은 중앙 정렬 카드 한 장
    h = `<div class="ud-layout ud-layout--photocard">
      <div class="ud-photocard-card">
        ${_secHeader}
        ${_secAce ? `<div class="ud-photocard-spotlight">${_secAce}</div>` : ''}
        ${_secMembers}${_secOpp}${_secRecent}
      </div>
    </div>`;
  }else if(_layoutMode==='split'){
    // 매거진형 — 좌측 고정(sticky) 레일 + 우측 기사 흐름
    h = `<div class="ud-layout ud-layout--split">
      <div class="ud-split-left">${_secHeader}${_secOpp}${_secAce}</div>
      <div class="ud-split-right">${_secMembers}${_secRecent}</div>
    </div>`;
  }else if(_layoutMode==='banner'){
    // 신문형 — 마스트헤드 + 다단(newspaper column) 본문
    h = `<div class="ud-layout ud-layout--banner">
      <div class="ud-banner-masthead">${_secHeader}</div>
      <div class="ud-banner-columns">${_secMembers}${_secOpp}${_secRecent}${_secAce}</div>
    </div>`;
  }else if(_layoutMode==='board'){
    // 보드형 — 가로 스크롤 칸반 레인
    h = `<div class="ud-layout ud-layout--board">
      <div class="ud-board-top">${_secHeader}</div>
      <div class="ud-board-lanes">
        <div class="ud-board-lane">${_secMembers}</div>
        <div class="ud-board-lane">${_secOpp}${_secAce}</div>
        <div class="ud-board-lane">${_secRecent}</div>
      </div>
    </div>`;
  }else if(_layoutMode==='showcase'){
    // 쇼케이스형 — 비대칭 벤토(bento) 그리드
    h = `<div class="ud-layout ud-layout--showcase">
      <div class="ud-layout-top">${_secHeader}</div>
      <div class="ud-bento-grid">
        <div class="ud-bento-cell ud-bento-cell--members">${_secMembers}</div>
        <div class="ud-bento-cell ud-bento-cell--ace">${_secAce}</div>
        <div class="ud-bento-cell ud-bento-cell--opp">${_secOpp}</div>
        <div class="ud-bento-cell ud-bento-cell--recent">${_secRecent}</div>
      </div>
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
      if(col) _um.style.setProperty('--ud-univ-col', String(col));
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
