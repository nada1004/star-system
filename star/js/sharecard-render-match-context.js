(function(){
  function buildShareMatchContext(args){
    const {
      m, statsP, gc, getShareCardPrefs, getFixedSideColors, makeTheme,
      getVariantKey, buildVariant
    } = args || {};
    const a=m.a||'A팀', b=m.b||'B팀';
    const scTypeKey = (() => {
      const mk = m._matchType||'';
      if(mk==='ck') return 'ck';
      if(mk==='procomp-bkt') return 'procomp-bkt';
      if(mk==='pro' || mk==='procomp-team') return 'pro';
      if(mk==='tt') return 'tt';
      if(m.n || m._subLabel || m.type==='tourney' || mk==='comp') return 'comp';
      return 'default';
    })();
    const scpByType = getShareCardPrefs(scTypeKey);
    const scpByMatch = getShareCardPrefs('match');
    const hasTypeMode = !!localStorage.getItem(`su_sc_mode_${scTypeKey}`);
    const hasTypeLayout = !!localStorage.getItem(`su_sc_match_layout_${scTypeKey}`);
    const scp = {
      ...scpByType,
      mode: hasTypeMode ? scpByType.mode : scpByMatch.mode,
      matchLayout: hasTypeLayout ? scpByType.matchLayout : scpByMatch.matchLayout
    };
    const isKnownUnivName = (name)=>{
      const n = String(name||'').trim();
      if(!n) return false;
      try{
        if((window.UNIV_ICONS && window.UNIV_ICONS[n]) || (Array.isArray(window.univCfg) && window.univCfg.find(x=>x&&x.name===n&&(x.icon||window.UNIV_ICONS?.[n])))) return true;
      }catch(e){}
      return false;
    };
    const teamMode = (
      m._matchType==='mini' ||
      m._matchType==='univm' ||
      m._matchType==='ck' ||
      m._matchType==='pro' ||
      m._matchType==='procomp-team' ||
      m._matchType==='procomp-bkt' ||
      (m._matchType==='comp' && (
        !!String(m.stage||'').trim() ||
        !!String(m.grpName||'').trim() ||
        !!String(m.grpLetter||'').trim() ||
        (isKnownUnivName(a) && isKnownUnivName(b))
      )) ||
      (m._matchType==='tt' && (
        (Array.isArray(m.teamAMembers) && m.teamAMembers.length) ||
        (Array.isArray(m.teamBMembers) && m.teamBMembers.length) ||
        ((a||'')==='A팀' && (b||'')==='B팀')
      ))
    );
    const dispA = teamMode ? (m.teamALabel || a || 'A팀') : a;
    const dispB = teamMode ? (m.teamBLabel || b || 'B팀') : b;
    const collectTeamSideNames = (side) => {
      if(typeof window._collectSharecardTeamSideNames==='function'){
        return window._collectSharecardTeamSideNames({m, statsP}, side);
      }
      try{
        const arr = side==='A' ? (m.teamAMembers||[]) : (m.teamBMembers||[]);
        const fromMembers = Array.isArray(arr) ? arr.map(x=>String((x&&x.name)||'').trim()).filter(Boolean) : [];
        if(fromMembers.length) return [...new Set(fromMembers)];
        const out = [];
        (Array.isArray(m.sets)?m.sets:[]).forEach(s=>{
          (Array.isArray(s&&s.games)?s.games:[]).forEach(g=>{
            const nm = String(side==='A' ? (g&&g.playerA) : (g&&g.playerB) || '').trim();
            if(!nm) return;
            if(nm===a || nm===b || nm==='A팀' || nm==='B팀') return;
            if(!out.includes(nm)) out.push(nm);
          });
        });
        return out;
      }catch(e){
        return [];
      }
    };
    const inferTeamRepPlayer = (side) => {
      if(typeof window._inferSharecardTeamRepPlayer==='function'){
        return window._inferSharecardTeamRepPlayer({m, statsP}, side);
      }
      try{
        const names = collectTeamSideNames(side);
        if(!names.length) return null;
        const lastSet = Array.isArray(m.sets) && m.sets.length ? m.sets[m.sets.length-1] : null;
        const lastGames = Array.isArray(lastSet&&lastSet.games) ? lastSet.games : [];
        for(const g of lastGames){
          const nm = String(side==='A' ? (g&&g.playerA) : (g&&g.playerB) || '').trim();
          if(nm && names.includes(nm)){
            const p = typeof statsP==='function' ? (statsP(nm)||null) : null;
            if(p) return {...p, __repReason:'ace'};
          }
        }
        let bestName='', bestWins=-1;
        names.forEach(nm=>{
          let wins=0;
          (Array.isArray(m.sets)?m.sets:[]).forEach(s=>{
            (Array.isArray(s&&s.games)?s.games:[]).forEach(g=>{
              const winnerSide = String((g&&g.winner)||'').trim();
              const wn = String(winnerSide===side ? (side==='A' ? g.playerA : g.playerB) : '').trim();
              if(wn===nm) wins += 1;
            });
          });
          if(wins>bestWins){ bestWins=wins; bestName=nm; }
        });
        const pick = bestName || names[0];
        const p = typeof statsP==='function' ? (statsP(pick)||null) : null;
        return p ? {...p, ...(bestWins>0?{__repReason:'wins',__repWins:bestWins}:{})} : {name:pick};
      }catch(e){
        return null;
      }
    };
    const teamRepPreA = teamMode ? inferTeamRepPlayer('A') : null;
    const teamRepPreB = teamMode ? inferTeamRepPlayer('B') : null;
    const pa = (!teamMode && typeof statsP==='function') ? (statsP(a)||null) : teamRepPreA;
    const pb = (!teamMode && typeof statsP==='function') ? (statsP(b)||null) : teamRepPreB;
    const usePlayerPhoto = !!(
      !teamMode &&
      !m._noUnivIcon &&
      (m._usePlayerPhoto===true || (pa && pa.photo) || (pb && pb.photo))
    );
    const photoOuter = Math.round(104*(scp.profileScale||1));
    const photoCoverH = Math.round(132*(scp.profileScale||1));
    const iconOuter = Math.round(66*(scp.profileScale||1));
    const iconInner = Math.round(46*(scp.profileScale||1));
    const isCivil=m.type==='civil'||(a==='A팀'&&b==='B팀');
    let civUniv=null;
    if(isCivil){
      outer:for(const s of(m.sets||[])){for(const g of(s.games||[])){const pn=g.playerA||g.playerB;if(pn){const p=statsP(pn);if(p?.univ){civUniv=p.univ;break outer;}}}}
    }
    const civColor=civUniv?gc(civUniv):'#6366f1';
    const TYPE_COLORS={
      ck: (typeof getFixedSideColors==='function' ? getFixedSideColors('ck') : {a:'#2563eb',b:'#d97706'}),
      pro: (typeof getFixedSideColors==='function' ? getFixedSideColors('pro') : {a:'#0f766e',b:'#4f46e5'}),
      tt: {a:'#7c3aed',b:'#047857'}
    };
    const tc=m._matchType&&TYPE_COLORS[m._matchType]?TYPE_COLORS[m._matchType]:null;
    const resolveSideColor = (playerObj, label, fallback) => {
      try{
        if(playerObj && playerObj.univ) return gc(playerObj.univ) || fallback || '#64748b';
        return gc(label) || fallback || '#64748b';
      }catch(e){
        return fallback || '#64748b';
      }
    };
    const ca=tc?tc.a:(isCivil?civColor:resolveSideColor(pa, teamMode?dispA:a, gc(teamMode?dispA:a)));
    const cb=tc?tc.b:(isCivil?civColor:resolveSideColor(pb, teamMode?dispB:b, gc(teamMode?dispB:b)));
    const aWin=m.sa>m.sb, bWin=m.sb>m.sa;
    const draw=!aWin&&!bWin;
    const theme = makeTheme(aWin ? ca : bWin ? cb : '#475569', {draw});
    const variantKey = getVariantKey(m);
    const winnerTeam=aWin?a:bWin?b:'';
    const winnerColor=aWin?ca:bWin?cb:'#475569';
    const variant = buildVariant({matchObj:m, theme, winnerColor, scp, variantKey});
    const caRgb=(typeof window._sharecardHexToRgb==='function') ? window._sharecardHexToRgb(ca) : '128,128,128';
    const cbRgb=(typeof window._sharecardHexToRgb==='function') ? window._sharecardHexToRgb(cb) : '128,128,128';
    return {
      a,b,scp,teamMode,dispA,dispB,pa,pb,usePlayerPhoto,photoOuter,photoCoverH,iconOuter,iconInner,
      isCivil,civUniv,civColor,ca,cb,aWin,bWin,draw,theme,variant,variantKey,winnerTeam,winnerColor,caRgb,cbRgb
    };
  }

  window._buildShareMatchContext = buildShareMatchContext;
})();
