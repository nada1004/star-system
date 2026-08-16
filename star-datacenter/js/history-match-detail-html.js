/* ══════════════════════════════════════════════════════════════
   대전기록 - 상세 HTML 빌더 (history-match-index.js 에서 분리, 2026-07-30)
   ══════════════════════════════════════════════════════════════ */

function buildDetailHTML(m, mode, labelA, labelB, ca, cb, aWin, bWin){
  const _mdDesignMode = (()=>{ try{ const v=(localStorage.getItem('su_md_design_mode')||'classic').trim(); return ['classic','glass','editorial','sunset','aurora','mono','retro','paper','holo','league','noir','blueprint'].includes(v)?v:'classic'; }catch(e){ return 'classic'; } })();
  const _mdLayoutMode = (()=>{ try{ const v=(localStorage.getItem('su_md_layout_mode')||'default').trim(); return ['default','compact','focus','broadcast','split','poster','arena','scoreboard','cute','magazine','nintendo'].includes(v)?v:'default'; }catch(e){ return 'default'; } })();
  const _wrapMdDetail = (inner)=>`<div class="cmd-detail-shell" data-md-mode="${_mdDesignMode}" data-md-layout="${_mdLayoutMode}">${inner}</div>`;
  const _modeLabel = (mk)=>{
    const v=String(mk||'').trim();
    if(v==='mini') return '미니대전';
    if(v==='univm') return '대학대전';
    if(v==='ck') return '대학CK';
    if(v==='pro') return '프로리그';
    if(v==='tt') return '티어대회';
    if(v==='comp') return '대회';
    if(v==='tourney') return '토너';
    if(v==='procomp') return '프로대회';
    if(v==='procompgj') return '프로대회끝장전';
    if(v==='gj') return '끝장전';
    if(v==='ind') return '개인전';
    return v;
  };
  const _resolvePlayerCol = (name, fallback) => {
    try{
      const p = (players||[]).find(x=>x && x.name===name);
      return (p && gc(p.univ)) || fallback || '#64748b';
    }catch(e){
      return fallback || '#64748b';
    }
  };
  const _splitSideNames = (v) => String(v||'').split(/[,+，]/).map(s=>s.trim()).filter(Boolean);
  const _escHtml = (v) => String(v==null?'':v)
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;')
    .replace(/'/g,'&#39;');
  const _escJs = (v) => String(v==null?'':v).replace(/\\/g,'\\\\').replace(/'/g,"\\'");
  const _gameSideNames = (g, side) => {
    if(!g) return [];
    if(side==='A'){
      if(Array.isArray(g.teamA) && g.teamA.length) return g.teamA.map(x=>typeof x==='string'?x:(x?.name||'')).filter(Boolean);
      if(g.a1 || g.a2) return [g.a1, g.a2].filter(Boolean);
      return _splitSideNames(g.playerA);
    }
    if(Array.isArray(g.teamB) && g.teamB.length) return g.teamB.map(x=>typeof x==='string'?x:(x?.name||'')).filter(Boolean);
    if(g.b1 || g.b2) return [g.b1, g.b2].filter(Boolean);
    return _splitSideNames(g.playerB);
  };
  const _renderNameList = (names) => {
    const safeNames = (names||[]).filter(Boolean);
    if(!safeNames.length) return '?';
    return safeNames.map(name=>{
      const safeJs = _escJs(name);
      const click = `onclick="(()=>{ const _s=JSON.parse(localStorage.getItem('su_pd_style')||'{}'); if(_s.close_on_match_player!==false){ const _m=document.getElementById('histDetModal'); if(_m) _m.style.display='none'; } openPlayerModal('${safeJs}'); })()" data-player-link="1"`;
      return `<span ${click} style="cursor:pointer;text-decoration:underline dotted">${_escHtml(name)}</span>`;
    }).join(`<span style="color:var(--text3)"> / </span>`);
  };
  const _teamBadge = (names) => (names||[]).length >= 2
    ? `<span style="display:inline-flex;align-items:center;justify-content:center;min-width:30px;height:18px;padding:0 6px;border-radius:999px;background:#e0f2fe;color:#0369a1;font-size:10px;font-weight:900;flex-shrink:0">2:2</span>`
    : '';
  ca = _resolvePlayerCol(labelA, ca);
  cb = _resolvePlayerCol(labelB, cb);
  // ind/gj: (단일 경기) sets 없이 wName/lName/map 구조
  // 단, 끝장전(BO 시리즈)처럼 sets가 존재하는 경우는 아래 세트 렌더링을 사용한다.
  if((mode==='ind'||mode==='gj') && (!m.sets || !m.sets.length)){
    const winNames=_splitSideNames(m.wName);
    const loseNames=_splitSideNames(m.lName);
    const isTeamGame=winNames.length>=2 || loseNames.length>=2;
    const pW=!isTeamGame&&winNames.length===1?players.find(p=>p.name===winNames[0]):null;
    const pL=!isTeamGame&&loseNames.length===1?players.find(p=>p.name===loseNames[0]):null;
    const wc=(pW&&gc(pW.univ))||ca;
    const lc=(pL&&gc(pL.univ))||cb;
    const rW=!isTeamGame&&pW?`<span class="rbadge r${pW.race}" style="font-size:10px">${pW.race}</span>`:'';
    const rL=!isTeamGame&&pL?`<span class="rbadge r${pL.race}" style="font-size:10px">${pL.race}</span>`:'';
    const uW=!isTeamGame&&pW?.univ?`<span class="ubadge" style="background:${wc};font-size:10px">${pW.univ}</span>`:'';
    const uL=!isTeamGame&&pL?.univ?`<span class="ubadge" style="background:${lc};font-size:10px;opacity:.92">${pL.univ}</span>`:'';
    const winNameHtml=isTeamGame?_renderNameList(winNames):_escHtml(m.wName||'');
    const loseNameHtml=isTeamGame?_renderNameList(loseNames):_escHtml(m.lName||'');
    const mapStr=m.map?`<span style="font-size:var(--fs-caption);color:var(--text3);white-space:nowrap">${m.map}</span>`:'';
    const memoStr=m.memo?`<div style="font-size:var(--fs-caption);color:var(--gray-l);margin-top:4px">📝 ${m.memo}</div>`:'';
    return _wrapMdDetail(`<div class="cmd-single-summary">
      <div class="cmd-single-summary__row">
        ${_teamBadge(winNames)}<span class="cmd-single-name">${winNameHtml}</span>${rW}${uW}
        <span class="cmd-single-vs">vs</span>
        <span class="cmd-single-name cmd-single-name--lose">${loseNameHtml}</span>${rL}${uL}
        ${mapStr}
      </div>
      ${memoStr?`<div class="cmd-single-summary__memo">${memoStr}</div>`:''}
    </div>`);
  }
  if(!m.sets||!m.sets.length) return _wrapMdDetail('<div style="font-size:var(--fs-sm);color:var(--gray-l);padding:8px 0">세트 상세 기록 없음</div>');

  const _buildGameCard = (g, si, gi) => {
    if(!g || (!g.playerA && !g.playerB)) return '';
    const namesA=_gameSideNames(g,'A');
    const namesB=_gameSideNames(g,'B');
    const isTeamGame=!!(g._isTeam || namesA.length>=2 || namesB.length>=2);
    const pA=!isTeamGame&&namesA.length===1?players.find(p=>p.name===namesA[0]):null;
    const pB=!isTeamGame&&namesB.length===1?players.find(p=>p.name===namesB[0]):null;
    const pca=(pA&&gc(pA.univ))||ca;
    const pcb=(pB&&gc(pB.univ))||cb;
    const aIsWinner=(g.winner==='A');
    const bIsWinner=(g.winner==='B');
    const hasWinner=!!(g.winner);
    const nameHtmlA=_renderNameList(namesA);
    const nameHtmlB=_renderNameList(namesB);
    const clickA=!isTeamGame&&g.playerA?`onclick="(()=>{ const _s=JSON.parse(localStorage.getItem('su_pd_style')||'{}'); if(_s.close_on_match_player!==false){ const _m=document.getElementById('histDetModal'); if(_m) _m.style.display='none'; } openPlayerModal('${_escJs(g.playerA||'')}'); })()" data-player-link="1"`:'';
    const clickB=!isTeamGame&&g.playerB?`onclick="(()=>{ const _s=JSON.parse(localStorage.getItem('su_pd_style')||'{}'); if(_s.close_on_match_player!==false){ const _m=document.getElementById('histDetModal'); if(_m) _m.style.display='none'; } openPlayerModal('${_escJs(g.playerB||'')}'); })()" data-player-link="1"`:'';
    const _teamColorMode = ['mini','univm','ck','pro','tt','comp','procomp','procomptn'].includes(String(mode||''));
    const sideBaseA = _teamColorMode ? ca : pca;
    const sideBaseB = _teamColorMode ? cb : pcb;
    const raceA=!isTeamGame&&pA?`<span class="rbadge cmd-race-badge r${pA.race}" style="font-size:10px;flex-shrink:0">${pA.race}</span>`:'';
    const raceB=!isTeamGame&&pB?`<span class="rbadge cmd-race-badge r${pB.race}" style="font-size:10px;flex-shrink:0">${pB.race}</span>`:'';
    const univLogoA='';
    const univLogoB='';
    const photoA=!isTeamGame&&pA?getPlayerPhotoHTML(pA.name,'40px','flex-shrink:0;border:2px solid '+sideBaseA+';box-shadow:0 1px 6px '+sideBaseA+'44'):'';
    const photoB=!isTeamGame&&pB?getPlayerPhotoHTML(pB.name,'40px','flex-shrink:0;border:2px solid '+sideBaseB+';box-shadow:0 1px 6px '+sideBaseB+'44'):'';
    const editBtn=isLoggedIn&&m._editRef?`<button class="btn btn-o btn-xs no-export cmd-edit-btn" style="margin-left:4px;flex-shrink:0" onclick="openGameEditModal('${m._editRef}',${si},${gi})">✏️</button>`:'';

    const winA = aIsWinner&&hasWinner;
    const winB = bIsWinner&&hasWinner;
    const _ct = t => t ? t.replace(/티어$/,'') : '';
    const _tierBadge = (tier) => tier ? `<span class="cmd-tier-badge" style="background:${getTierBtnColor(tier)||'#64748b'};color:${getTierBtnTextColor(tier)||'#fff'};font-size:9px;font-weight:700;padding:1px 5px;border-radius:6px;flex-shrink:0"><span class="tier-pc">${tier}</span><span class="tier-mob">${_ct(tier)}</span></span>` : '';
    const tierA = _tierBadge(pA?.tier);
    const tierB = _tierBadge(pB?.tier);

    if((window.__detailCtx||'')==='compModal' || (window.__detailCtx||'')==='histModal'){
      const sideColA = sideBaseA;
      const sideColB = sideBaseB;
      const loseA = hasWinner && !winA;
      const loseB = hasWinner && !winB;
      const pAHtml = photoA ? `<span class="cmd-photo ${loseA?'is-lose':''}">${photoA}</span>` : '';
      const pBHtml = photoB ? `<span class="cmd-photo ${loseB?'is-lose':''}">${photoB}</span>` : '';
      const loseBgA = `linear-gradient(180deg, rgba(248,250,252,.98), rgba(241,245,249,.96))`;
      const loseBgB = `linear-gradient(180deg, rgba(248,250,252,.98), rgba(241,245,249,.96))`;
      const loseBdA = 'rgba(203,213,225,.85)';
      const loseBdB = 'rgba(203,213,225,.85)';
      return `<div class="cmd-game" data-si="${si}" data-gi="${gi}">
        <div class="cmd-game-row">
          <div class="cmd-player ${winA?'is-win':''} ${loseA?'is-lose':''}" style="--cmd-col:${sideColA};background:${winA?(typeof getMatchWinTint==='function'?getMatchWinTint(sideColA):(sideColA+'22')):(loseA?loseBgA:(sideColA+'12'))};border-color:${winA?(sideColA+'55'):(loseA?loseBdA:(sideColA+'33'))};">
            <div class="cmd-player-meta">
              <div class="cmd-player-name" ${clickA} style="display:flex;align-items:center;justify-content:center;gap:8px;text-align:center"><span class="cmd-player-inline" style="display:inline-flex;align-items:center;gap:4px;justify-content:center">${_teamBadge(namesA)}${univLogoA}${tierA}${raceA}</span><span class="cmd-player-name__txt">${nameHtmlA}</span></div>
            </div>
            ${pAHtml}
          </div>
          <div class="cmd-midbox">
            <div class="cmd-gno">경기 ${gi+1}</div>
            ${g.map?`<div class="cmd-gmap">${g.map}</div>`:''}
          </div>
          <div class="cmd-player ${winB?'is-win':''} ${loseB?'is-lose':''} is-right" style="--cmd-col:${sideColB};background:${winB?(typeof getMatchWinTint==='function'?getMatchWinTint(sideColB):(sideColB+'22')):(loseB?loseBgB:(sideColB+'12'))};border-color:${winB?(sideColB+'55'):(loseB?loseBdB:(sideColB+'33'))};">
            ${pBHtml}
            <div class="cmd-player-meta">
              <div class="cmd-player-name" ${clickB} style="display:flex;align-items:center;justify-content:center;gap:8px;text-align:center"><span class="cmd-player-inline" style="display:inline-flex;align-items:center;gap:4px;justify-content:center">${_teamBadge(namesB)}${univLogoB}${tierB}${raceB}</span><span class="cmd-player-name__txt">${nameHtmlB}</span></div>
            </div>
          </div>
          ${editBtn}
        </div>
      </div>`;
    }

    const loseA = hasWinner && !winA;
    const loseB = hasWinner && !winB;
    const mapDot = g.map ? `<span style="font-size:10px;color:var(--text3);white-space:nowrap;flex-shrink:0">${g.map}</span>` : '';
    const photoAHtml = photoA ? `<span class="cmd-photo ${loseA?'is-lose':''}">${photoA}</span>` : '';
    const photoBHtml = photoB ? `<span class="cmd-photo ${loseB?'is-lose':''}">${photoB}</span>` : '';
    const nameStyleA = loseA ? 'opacity:.7;color:var(--text3,#64748b);' : 'opacity:1;';
    const nameStyleB = loseB ? 'opacity:.7;color:var(--text3,#64748b);' : 'opacity:1;';
    return `<div data-si="${si}" data-gi="${gi}" style="display:flex;flex-direction:column;gap:3px;padding:5px 2px;">
      <div style="display:flex;align-items:center;gap:5px;">
        <span style="color:var(--gray-l);font-size:var(--fs-caption);min-width:40px;font-weight:700;flex-shrink:0;text-align:center">경기${gi+1}</span>
        <div style="flex:1;display:flex;align-items:center;gap:5px;padding:6px 8px;border-radius:12px;background:${winA?pca+'18':(loseA?'linear-gradient(180deg, rgba(148,163,184,.14), var(--white))':pca+'12')};border:${winA?'1.5px solid '+pca+'55':(loseA?'1px solid rgba(148,163,184,.26)':'1px solid '+pca+'33')};min-width:0;">
          <div style="flex:1;min-width:0;display:flex;align-items:center;justify-content:flex-end;gap:4px;overflow:hidden">
            ${_teamBadge(namesA)}${univLogoA}${tierA}${raceA}
            <strong style="font-size:var(--fs-base);color:var(--text);white-space:nowrap;${nameStyleA}" ${clickA}>${nameHtmlA}</strong>
          </div>
          ${photoAHtml}
        </div>
        <span style="color:var(--gray-l);font-size:var(--fs-sm);font-weight:800;flex-shrink:0">vs</span>
        <div style="flex:1;display:flex;align-items:center;gap:5px;padding:6px 8px;border-radius:12px;background:${winB?pcb+'18':(loseB?'linear-gradient(180deg, rgba(148,163,184,.14), var(--white))':pcb+'12')};border:${winB?'1.5px solid '+pcb+'55':(loseB?'1px solid rgba(148,163,184,.26)':'1px solid '+pcb+'33')};min-width:0;">
          ${photoBHtml}
          <div style="flex:1;min-width:0;display:flex;align-items:center;gap:4px;overflow:hidden">
            ${_teamBadge(namesB)}${univLogoB}${tierB}${raceB}
            <strong style="font-size:var(--fs-base);color:var(--text);white-space:nowrap;${nameStyleB}" ${clickB}>${nameHtmlB}</strong>
          </div>
        </div>
        ${editBtn}
      </div>
      ${mapDot ? `<div style="padding-left:48px;font-size:10px;color:var(--text3)">${mapDot}</div>` : ''}
    </div>`;
  };

  const setBlocks=[];
  m.sets.forEach((set,si)=>{
    const isAce=(si===m.sets.length-1&&m.sets.length>=3);
    const sLabel=isAce?'🎯 에이스전':`${si+1}세트`;
    const swA=set.scoreA||0, swB=set.scoreB||0;
    const setAWin=swA>swB, setBWin=swB>swA;
    const head=`<div class="cmd-set-head${isAce?' cmd-set-head--ace':''}" style="display:flex;align-items:center;gap:6px;margin-bottom:6px;padding:5px 10px;background:${isAce?'':'var(--blue-l)'};border-radius:7px;border:1px solid ${isAce?'':'var(--blue-ll)'}">
      <span class="set-row-title ${isAce?'ace-t':''}" style="margin-bottom:0;font-size:var(--fs-sm)">${sLabel}</span>
      <span class="ubadge${setAWin?'':' loser'}" style="background:${setAWin?ca:`linear-gradient(135deg, ${typeof getMatchWinTint==='function'?getMatchWinTint(ca):ca+'18'}, var(--white))`};color:${setAWin?'#fff':'var(--text2,#334155)'};border-color:${setAWin?ca:ca+'33'};font-size:10px">${labelA}</span>
      <span style="font-weight:800;font-size:14px">
        <span class="${setAWin?'wt':setBWin?'lt':'pt-z'}">${swA}</span>
        <span style="color:var(--border2)"> : </span>
        <span class="${setBWin?'wt':setAWin?'lt':'pt-z'}">${swB}</span>
      </span>
      <span class="ubadge${setBWin?'':' loser'}" style="background:${setBWin?cb:`linear-gradient(135deg, ${typeof getMatchWinTint==='function'?getMatchWinTint(cb):cb+'18'}, var(--white))`};color:${setBWin?'#fff':'var(--text2,#334155)'};border-color:${setBWin?cb:cb+'33'};font-size:10px">${labelB}</span>
    </div>`;
    const gamesArr=[];
    if(set.games&&set.games.length){
      set.games.forEach((g,gi)=>{
        const card=_buildGameCard(g, si, gi);
        if(card) gamesArr.push(card);
      });
    }
    const gamesHtml = gamesArr.length ? gamesArr.join('') : `<div style="font-size:var(--fs-caption);color:var(--gray-l);padding:4px 0">상세 경기 기록 없음</div>`;
    const id=`md-set-${si+1}`;
    const html=`<div class="set-row cmd-set" id="${id}" data-si="${si}" data-is-ace="${isAce?'1':'0'}">${head}${gamesHtml}</div>`;
    setBlocks.push({si,isAce,sLabel,swA,swB,setAWin,setBWin,gamesArr,html});
  });

  const _matchScore = ()=>{
    const a=(m.sa!=null?m.sa:null);
    const b=(m.sb!=null?m.sb:null);
    if(a!=null && b!=null) return {a:Number(a)||0,b:Number(b)||0};
    let wa=0, wb=0;
    (m.sets||[]).forEach(s=>{
      const sa=Number(s?.scoreA||0), sb=Number(s?.scoreB||0);
      if(sa>sb) wa++;
      else if(sb>sa) wb++;
    });
    return {a:wa,b:wb};
  };

  // (요청사항) 경기 상세 팝업에 "이번 경기 개인 기록" (참가자별 몇승 몇패) 인라인 표시
  const _playerTallyHTML = (()=>{
    const tally = {};
    (m.sets||[]).forEach(set=>{
      (set.games||[]).forEach(g=>{
        if(!g) return;
        const namesA=_gameSideNames(g,'A');
        const namesB=_gameSideNames(g,'B');
        // 팀전(2:2 등)은 개인 집계 대상에서 제외 — 1:1 게임만 집계
        if(namesA.length!==1 || namesB.length!==1) return;
        const nameA=namesA[0], nameB=namesB[0];
        if(!nameA || !nameB || !g.winner) return;
        if(!tally[nameA]) tally[nameA]={w:0,l:0,side:'A'};
        if(!tally[nameB]) tally[nameB]={w:0,l:0,side:'B'};
        if(g.winner==='A'){ tally[nameA].w++; tally[nameB].l++; }
        else if(g.winner==='B'){ tally[nameB].w++; tally[nameA].l++; }
      });
    });
    const entries=Object.entries(tally).filter(([,s])=>s.w+s.l>0);
    if(!entries.length) return '';
    const sortFn=(a,b)=>(b[1].w-b[1].l)-(a[1].w-a[1].l)||b[1].w-a[1].w;
    const sideEntries=(side)=>entries.filter(([,s])=>s.side===side).sort(sortFn);
    const _row=(name,s,col,alignRight,tierBadgeHtml)=>{
      const photoHtml = typeof getPlayerPhotoHTML==='function' ? getPlayerPhotoHTML(name,'26px','border:1.5px solid '+col+';box-shadow:0 1px 5px '+col+'40;') : '';
      const click=`onclick="(()=>{ const _s=JSON.parse(localStorage.getItem('su_pd_style')||'{}'); if(_s.close_on_match_player!==false){ const _m=document.getElementById('histDetModal'); if(_m) _m.style.display='none'; } openPlayerModal('${_escJs(name)}'); })()" data-player-link="1"`;
      const recordHtml=`<span class="cmd-pt-record"><b class="wt">${s.w}승</b>${s.l>0?`<span class="cmd-pt-sep">·</span><b class="lt">${s.l}패</b>`:''}</span>`;
      const nameHtml=`<span class="cmd-pt-name">${_escHtml(name)}</span>${tierBadgeHtml||''}`;
      const idCellHtml=`<span class="cmd-pt-idcell"><span class="cmd-pt-photo">${photoHtml}</span>${nameHtml}</span>`;
      return `<div class="cmd-pt-row${alignRight?' is-right':''}" ${click} style="--pt-col:${col}">
        ${idCellHtml}
        ${recordHtml}
      </div>`;
    };
    const colFor=(name)=>{ const p=(players||[]).find(x=>x&&x.name===name); return (p&&gc(p.univ))||'#64748b'; };
    const tierFor=(name)=>{ const p=(players||[]).find(x=>x&&x.name===name); return p?.tier||''; };
    const _ct=t=>t?t.replace(/티어$/,''):'';
    const _ptTierBadge=(tier)=>tier?`<span class="cmd-tier-badge" style="background:${getTierBtnColor(tier)||'#64748b'};color:${getTierBtnTextColor(tier)||'#fff'};font-size:9px;font-weight:700;padding:1px 5px;border-radius:6px;flex-shrink:0;margin-left:4px"><span class="tier-pc">${tier}</span><span class="tier-mob">${_ct(tier)}</span></span>`:'';
    const listA=sideEntries('A').map(([name,s])=>_row(name,s,colFor(name),false,_ptTierBadge(tierFor(name)))).join('');
    const listB=sideEntries('B').map(([name,s])=>_row(name,s,colFor(name),true,_ptTierBadge(tierFor(name)))).join('');
    if(!listA && !listB) return '';
    return `<div class="cmd-player-tally">
      <div class="cmd-player-tally__head"><span class="cmd-player-tally__icon">🧑‍🤝‍🧑</span><span class="cmd-player-tally__title">이번 경기 개인 기록</span></div>
      <div class="cmd-player-tally__cols">
        <div class="cmd-player-tally__col cmd-player-tally__col--a">
          <div class="cmd-pt-colhead" style="--pt-col:${ca}">${_escHtml(labelA||'A')}</div>
          <div class="cmd-player-tally__list">${listA||'<div class="cmd-pt-empty">기록 없음</div>'}</div>
        </div>
        <div class="cmd-player-tally__div"></div>
        <div class="cmd-player-tally__col cmd-player-tally__col--b">
          <div class="cmd-pt-colhead" style="--pt-col:${cb}">${_escHtml(labelB||'B')}</div>
          <div class="cmd-player-tally__list">${listB||'<div class="cmd-pt-empty">기록 없음</div>'}</div>
        </div>
      </div>
    </div>`;
  })();

  const _posterHero = ()=>{
    const sc=_matchScore();
    const d=_escHtml(String(m.d||'').trim());
    const mk=_escHtml(_modeLabel(mode));
    const aTxt=_escHtml(labelA||'A');
    const bTxt=_escHtml(labelB||'B');
    const scA=`${sc.a}`; const scB=`${sc.b}`;
    const pill = (d||mk) ? `<div class="cmd-poster-meta"><span>${mk}</span>${d?`<span>${d}</span>`:''}</div>` : '';
    return `<div class="cmd-poster-hero" style="--cmdA:${ca};--cmdB:${cb}">
      ${pill}
      <div class="cmd-poster-row">
        <div class="cmd-poster-side cmd-poster-side--a">
          <div class="cmd-poster-name">${aTxt}</div>
        </div>
        <div class="cmd-poster-mid">
          <div class="cmd-poster-score"><span class="cmd-poster-scoreA">${scA}</span><span class="cmd-poster-colon">:</span><span class="cmd-poster-scoreB">${scB}</span></div>
          <div class="cmd-poster-vs">VS</div>
        </div>
        <div class="cmd-poster-side cmd-poster-side--b">
          <div class="cmd-poster-name">${bTxt}</div>
        </div>
      </div>
    </div>`;
  };

  if(_mdLayoutMode==='broadcast'){
    const items=[];
    setBlocks.forEach(sb=>{
      sb.gamesArr.forEach((card,gi)=>{
        items.push(`<div class="cmd-tl-item" data-si="${sb.si}" data-gi="${gi}">
          <div class="cmd-tl-top">
            <span class="cmd-tl-set">${sb.sLabel}</span>
            <span class="cmd-tl-score">${sb.swA}:${sb.swB}</span>
            <span class="cmd-tl-game">경기 ${gi+1}</span>
          </div>
          ${card}
        </div>`);
      });
      if(!sb.gamesArr.length){
        items.push(`<div class="cmd-tl-item" data-si="${sb.si}">
          <div class="cmd-tl-top">
            <span class="cmd-tl-set">${sb.sLabel}</span>
            <span class="cmd-tl-score">${sb.swA}:${sb.swB}</span>
          </div>
          <div class="cmd-tl-empty">상세 경기 기록 없음</div>
        </div>`);
      }
    });
    return _wrapMdDetail(`<div class="cmd-timeline">${items.join('')}</div>${_playerTallyHTML}`);
  }

  if(_mdLayoutMode==='split'){
    const idx=setBlocks.map(sb=>{
      const aW=sb.setAWin?'is-win':'';
      const bW=sb.setBWin?'is-win':'';
      const ace=sb.isAce?'is-ace':'';
      const lab=`${sb.sLabel}`;
      const sc=`${sb.swA}:${sb.swB}`;
      const t=`document.getElementById('md-set-${sb.si+1}')&&document.getElementById('md-set-${sb.si+1}').scrollIntoView({behavior:'smooth',block:'start'});`;
      return `<button type="button" class="cmd-setlink ${ace}" onclick="${t}">
        <span class="cmd-setlink-title">${lab}</span>
        <span class="cmd-setlink-score"><span class="cmd-setlink-a ${aW}">${sb.swA}</span><span class="cmd-setlink-colon">:</span><span class="cmd-setlink-b ${bW}">${sb.swB}</span></span>
        <span class="cmd-setlink-teams"><span class="cmd-setlink-team" style="--c:${ca}">${_escHtml(labelA||'A')}</span><span class="cmd-setlink-team" style="--c:${cb}">${_escHtml(labelB||'B')}</span></span>
      </button>`;
    }).join('');
    const main=setBlocks.map(sb=>sb.html).join('');
    return _wrapMdDetail(`<div class="cmd-split"><div class="cmd-split-index">${idx}</div><div class="cmd-split-main">${main}${_playerTallyHTML}</div></div>`);
  }

  if(_mdLayoutMode==='poster'){
    const main=setBlocks.map(sb=>sb.html).join('');
    return _wrapMdDetail(`<div class="cmd-poster"><div class="cmd-sets">${main}</div>${_playerTallyHTML}</div>`);
  }

  if(_mdLayoutMode==='focus'){
    const ace=setBlocks.filter(x=>x.isAce);
    const rest=setBlocks.filter(x=>!x.isAce);
    const ordered=ace.concat(rest);
    const main=ordered.map(sb=>sb.html).join('');
    return _wrapMdDetail(`<div class="cmd-focus">${main}${_playerTallyHTML}</div>`);
  }

  const main=setBlocks.map(sb=>sb.html).join('');
  return _wrapMdDetail(`<div class="cmd-sets">${main}${_playerTallyHTML}</div>`);
}
