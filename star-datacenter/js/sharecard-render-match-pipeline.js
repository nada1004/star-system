(function(){
  function renderShareMatchCardPipeline(args){
    const { card, matchObj, statsP, gc, getShareCardPrefs, getFixedSideColors, scMixHex, toHttpsUrl, getPlayerPhotoHTML } = args || {};
    if(!card) return;
    let m = matchObj;
    if(!m){
      card.innerHTML='<p style="color:var(--gray-l);padding:40px;text-align:center">경기를 선택하세요</p>';
      return;
    }
    m = (typeof window._normalizeShareMatchObjData==='function')
      ? (window._normalizeShareMatchObjData(m)||m)
      : ((typeof window._normalizeShareMatchObjFallback==='function') ? (window._normalizeShareMatchObjFallback(m)||m) : m);

    const ctx = (typeof window._buildShareMatchContext==='function')
      ? window._buildShareMatchContext({
          m,
          statsP,
          gc,
          getShareCardPrefs,
          getFixedSideColors,
          makeTheme:(base, opts)=>(
            (typeof window._makeShareCardTheme==='function')
              ? window._makeShareCardTheme(base, opts)
              : ((opts && opts.draw)
                ? {headerBg:'#334155', bodyBg:'#f8fafc', accentHex:'#475569', accentDark:'#1e293b', text:'#1e293b', textDim:'rgba(71,85,105,.6)', divider:'rgba(148,163,184,.2)'}
                : {headerBg:'#1e293b', bodyBg:'#f8fafc', accentHex:base, accentDark:'#1e293b', text:'#1e293b', textDim:'rgba(30,41,59,.55)', divider:'rgba(30,41,59,.12)'})
          ),
          getVariantKey:(obj)=>((typeof window._getShareCardVariantKey==='function') ? window._getShareCardVariantKey(obj) : 'default'),
          buildVariant:({matchObj, theme, winnerColor, scp, variantKey})=>(
            (typeof window._buildShareCardVariant==='function')
              ? window._buildShareCardVariant({matchObj, theme, winnerColor, scp, variantKey})
              : { outerBg:theme.bodyBg, headerBg:theme.headerBg, setBg:theme.divider, setBorder:theme.divider, chipBg:'rgba(255,255,255,.18)', chipBd:'rgba(255,255,255,.3)', hero:'🎮 매치', tone:'' }
          )
        })
      : {};

    const { a, b, scp, teamMode, dispA, dispB, pa, pb, usePlayerPhoto, photoOuter, photoCoverH, iconOuter, iconInner, isCivil, civUniv, ca, cb, aWin, bWin, draw, theme, variant, winnerTeam, winnerColor, caRgb, cbRgb } = ctx || {};
    const setsHTML = (typeof window._buildShareMatchSetsHTML==='function')
      ? window._buildShareMatchSetsHTML({ m, theme, variant, ca, cb, a, b, dispA, dispB, getPlayerPhotoHTML })
      : '';
    const univIconHTML = (name, size)=>(typeof window._buildShareMatchUnivIconHTML==='function')
      ? window._buildShareMatchUnivIconHTML({ name, size, scp, toHttpsUrl })
      : `<span style="display:inline-flex;width:${size||'40px'};height:${size||'40px'};align-items:center;justify-content:center;color:#fff">🏫</span>`;
    const matchTypeLabel = ['ind','gj','progj'].includes(String(m&&m._matchType||'')) ? '일반' : variant.hero.replace(/^[^\s]+\s*/,'');
    const summaryCards = [
      {label:'매치 타입', value:matchTypeLabel, tone:winnerColor},
      {label:'승부 결과', value:draw?'무승부':winnerTeam||'결과 대기', tone:draw?'#64748b':winnerColor},
      {label:'세트/경기', value:`${(m.sets||[]).length||1}세트 · ${(Array.isArray(m.sets)?m.sets.reduce((n,s)=>n+((s&&s.games)||[]).filter(g=>g.playerA||g.playerB).length,0):0)||1}경기`, tone:theme.accentDark}
    ];
    const summaryHTML = (typeof window._buildShareMatchSummaryHTML==='function')
      ? window._buildShareMatchSummaryHTML({ variant, theme, winnerColor, summaryCards, setsHTML, teamMode })
      : '';
    const centerVersusHTML = `<div style="text-align:center;min-width:44px"><div style="font-size:12px;font-weight:1000;letter-spacing:1px;color:rgba(255,255,255,.72)">VS</div></div>`;
    const saTxt = (typeof window._shareMatchScoreText==='function') ? window._shareMatchScoreText(m.sa, m._scoreA) : String((m.sa ?? m._scoreA ?? '-'));
    const sbTxt = (typeof window._shareMatchScoreText==='function') ? window._shareMatchScoreText(m.sb, m._scoreB) : String((m.sb ?? m._scoreB ?? '-'));
    const raceLabel = (typeof window._shareMatchRaceLabel==='function') ? window._shareMatchRaceLabel : (r=>String(r||''));
    const tierBg = (typeof window._shareMatchTierBg==='function') ? window._shareMatchTierBg : (()=>'#64748b');
    const tierFg = (typeof window._shareMatchTierFg==='function') ? window._shareMatchTierFg : (()=>'#fff');
    const univLogo = (typeof window._shareMatchUnivLogo==='function') ? window._shareMatchUnivLogo : (()=>'');
    const teamRender = (teamMode && typeof window._buildSharecardTeamRender==='function')
      ? window._buildSharecardTeamRender({m, scp, ca, cb, caRgb, cbRgb, aWin, bWin, _dispA:dispA, _dispB:dispB, statsP, univIconHTML, toHttpsUrl, _scMixHex:scMixHex, _tierBg:tierBg, _tierFg:tierFg, _raceLabel:raceLabel, _univLogo:univLogo, setsHTML})
      : null;
    const teamHeaderHTML = teamMode ? ((teamRender && teamRender.headerHTML) || '') : '';
    const teamRosterHTML = teamMode ? ((teamRender && teamRender.rosterHTML) || '') : '';
    const loserGray = Math.max(.28, Math.min(.82, scp.loserGray||.55));
    const isPersonalScoreCard = ['ind','gj','progj'].includes(String(m._matchType||''));
    const scoreInlineHTML = (kind='default') => (typeof window._buildShareMatchScoreInline==='function')
      ? window._buildShareMatchScoreInline({ kind, scp, ca, cb, aWin, bWin, isPersonalScoreCard, saTxt, sbTxt })
      : `<div class="share-score-inline">${saTxt}:${sbTxt}</div>`;
    const headerMatchBg = (typeof window._buildShareMatchHeaderBg==='function')
      ? window._buildShareMatchHeaderBg({ winnerColor, ca, cb, aWin, bWin, scp, variant })
      : variant.headerBg;
    const heroSideBlock = (side) => (typeof window._buildShareMatchHeroSideBlock==='function')
      ? window._buildShareMatchHeroSideBlock({ side, aWin, bWin, a, b, _dispA:dispA, _dispB:dispB, ca, cb, caRgb, cbRgb, isCivil, civUniv, _usePlayerPhoto:usePlayerPhoto, statsP, pa, pb, _tierBg:tierBg, _tierFg:tierFg, scp, _raceLabel:raceLabel, _univLogo:univLogo, m, _isPersonalScoreCard:isPersonalScoreCard, _photoCoverH:photoCoverH, _photoOuter:photoOuter, _iconOuter:iconOuter, _iconInner:iconInner, getPlayerPhotoHTML, toHttpsUrl, univIconHTML })
      : '';
    const cacheKey = (typeof window._buildShareMatchCacheKey==='function')
      ? window._buildShareMatchCacheKey({ m, teamMode })
      : `match:${JSON.stringify({a:m.a,b:m.b,sa:m.sa,sb:m.sb,d:m.d,n:m.n,t:m._matchType,sub:m._subLabel,sets:m.sets,teamA:m.teamAMembers,teamB:m.teamBMembers,view:teamMode?`${Date.now()}-${Math.random().toString(36).slice(2,8)}`:''})}`;
    const personalPosterSide = (side) => (typeof window._buildShareMatchPersonalPosterSide==='function')
      ? window._buildShareMatchPersonalPosterSide({ side, aWin, bWin, a, b, ca, cb, caRgb, cbRgb, statsP, pa, pb, _dispA:dispA, _dispB:dispB, _loserGray:loserGray, _tierBg:tierBg, _tierFg:tierFg, _raceLabel:raceLabel, _univLogo:univLogo, toHttpsUrl, univIconHTML, m, scp })
      : '';
    const personalMetaBar = (typeof window._buildShareMatchPersonalMetaBar==='function')
      ? window._buildShareMatchPersonalMetaBar({ m, variant, scoreInlineHTML })
      : '';
    const personalPosterHTML = isPersonalScoreCard && !teamMode && typeof window._buildShareMatchPersonalShell==='function'
      ? window._buildShareMatchPersonalShell({ variant, theme, headerMatchBg, winnerColor, scMixHex:scMixHex, personalMetaBar, aWin, bWin, personalPosterSide, summaryHTML, setsHTML })
      : '';
    const html = (typeof window._buildShareMatchShell==='function')
      ? window._buildShareMatchShell({ m, variant, theme, headerMatchBg, winnerColor, scMixHex:scMixHex, teamMode, scoreInlineHTML, teamHeaderHTML, heroSideBlock, centerVersusHTML, summaryHTML, teamRosterHTML, setsHTML })
      : '';
    const finalHtml = personalPosterHTML || html;
    if(typeof window._shareCardRenderCached==='function') window._shareCardRenderCached(card, cacheKey, ()=>finalHtml);
    else card.innerHTML=finalHtml;
    // (버그픽스) innerHTML 내 <script>는 브라우저에서 실행되지 않으므로 렌더 후 타이머 직접 시작
    try{ if(typeof window._shareCardInitSlideTimers==='function') window._shareCardInitSlideTimers(card); }catch(e){}
  }

  window._renderShareMatchCardPipeline = renderShareMatchCardPipeline;
})();
