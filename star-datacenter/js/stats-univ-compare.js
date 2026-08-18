/* ══════════════════════════════════════════════════════════════
   통계 - 대학 비교 (stats-overview-elo.js 에서 분리, 2026-07-30)
   ══════════════════════════════════════════════════════════════ */

function statsUnivCompareHTML() {
  const _dissSet = new Set((typeof univCfg !== 'undefined' ? univCfg : []).filter(u=>u.dissolved||u.hidden).map(u=>String(u.name||'').trim()));
  const _players = Array.isArray(players) ? players : [];
  const univList = (typeof getAllUnivs==='function'?getAllUnivs():[]).filter(u=>u.name && u.name!=='무소속' && !_dissSet.has(String(u.name||'').trim()) && _players.some(p=>p.univ===u.name));
  if (!_statsCompareA && univList.length>0) _statsCompareA = univList[0]?.name||'';
  if (!_statsCompareB && univList.length>1) _statsCompareB = univList.find(u=>u.name!==_statsCompareA)?.name||'';

  const getStats = (name) => {
    const members = _players.filter(p=>String(p?.univ||'').trim()===name&&!p.hidden&&!p.retired&&!p.hideFromBoard&&!_dissSet.has(name));
    const tiered  = members.filter(p=>!_statsCvHasRole(p));
    const roled   = members.filter(p=>_statsCvHasRole(p));
    const races={P:0,T:0,Z:0,N:0};
    members.forEach(p=>{
      const r=String(p.race||'').trim().toUpperCase();
      if(r==='P'||r==='T'||r==='Z') races[r]++;
      else races.N++;
    });
    const tiers={};
    tiered.forEach(p=>{const t=p.tier||'미정';tiers[t]=(tiers[t]||0)+1;});
    const topTier = tiered.length>0?(tiered.slice().sort((a,b)=>{
      const ti=typeof TIERS!=='undefined'?TIERS:[];
      const ia=ti.indexOf(a.tier||''),ib=ti.indexOf(b.tier||'');
      return (ia>=0?ia:999)-(ib>=0?ib:999);
    })[0]?.tier||'없음'):'없음';

    // 실전 승률 계산 — 마이페이지(선수 상세)와 동일하게 p.win/p.loss 합산 기준 사용
    let tw=0,tl=0;
    tiered.forEach(p=>{
      tw += Number(p.win||0);
      tl += Number(p.loss||0);
    });
    const tg=tw+tl;
    const wr=tg>0?Math.round(tw/tg*100):null;

    return {members,tiered,roled,races,tiers,topTier,total:members.length,tw,tl,tg,wr};
  };

  // 직접 맞대결: A 선수들 history 중 oppUniv === B (또는 opp가 B 소속 선수)
  const getHeadToHead = (nameA, nameB) => {
    const aPlayers = new Set(_players.filter(p=>String(p?.univ||'').trim()===nameA&&!p.hidden&&!p.retired).map(p=>p.name));
    const bPlayers = new Set(_players.filter(p=>String(p?.univ||'').trim()===nameB).map(p=>p.name));
    let aw=0,al=0;
    // p.history 기반
    _players.filter(p=>aPlayers.has(p.name)).forEach(p=>{
      (Array.isArray(p.history)?p.history:[]).forEach(h=>{
        const oppU = String(h.oppUniv||h.univ||'').trim();
        const oppN = String(h.opp||'').trim();
        if (oppU===nameB || bPlayers.has(oppN)) {
          if(h.result==='승')aw++; else if(h.result==='패')al++;
        }
      });
    });
    // indM (개인전)
    try { (typeof indM!=='undefined'&&Array.isArray(indM)?indM:[]).forEach(m=>{
      if(!m||!m.wName||!m.lName) return;
      if(aPlayers.has(m.wName)&&bPlayers.has(m.lName)) aw++;
      else if(aPlayers.has(m.lName)&&bPlayers.has(m.wName)) al++;
    }); } catch(e){}
    // gjM (끝장전)
    try { (typeof gjM!=='undefined'&&Array.isArray(gjM)?gjM:[]).forEach(m=>{
      if(!m||!m.wName||!m.lName||m._proLabel) return;
      if(aPlayers.has(m.wName)&&bPlayers.has(m.lName)) aw++;
      else if(aPlayers.has(m.lName)&&bPlayers.has(m.wName)) al++;
    }); } catch(e){}
    // ttM (티어대회) 게임 단위
    try { (typeof ttM!=='undefined'&&Array.isArray(ttM)?ttM:[]).forEach(m=>{
      (m.sets||[]).forEach(s=>{(s.games||[]).forEach(g=>{
        if(!g||!g.winner) return;
        const gA=g.playerA||g.a1||'', gB=g.playerB||g.b1||'';
        if(!gA||!gB) return;
        const wA=g.winner==='A'; const wB=g.winner==='B';
        if(aPlayers.has(gA)&&bPlayers.has(gB)){if(wA)aw++;else if(wB)al++;}
        else if(aPlayers.has(gB)&&bPlayers.has(gA)){if(wB)aw++;else if(wA)al++;}
      });});
    }); } catch(e){}
    // 팀전 (miniM/univM/ckM) 게임 단위
    try { [
      typeof miniM!=='undefined'?miniM:[],
      typeof univM!=='undefined'?univM:[],
      typeof ckM!=='undefined'?ckM:[]
    ].forEach(arr=>{ (Array.isArray(arr)?arr:[]).forEach(m=>{
      (m.sets||[]).forEach(s=>{(s.games||[]).forEach(g=>{
        if(!g||!g.winner) return;
        const gA=g.playerA||g.a1||'', gB=g.playerB||g.b1||'';
        if(!gA||!gB) return;
        const wA=g.winner==='A'; const wB=g.winner==='B';
        if(aPlayers.has(gA)&&bPlayers.has(gB)){if(wA)aw++;else if(wB)al++;}
        else if(aPlayers.has(gB)&&bPlayers.has(gA)){if(wB)aw++;else if(wA)al++;}
      });});
    }); }); } catch(e){}
    return {aw,al,ag:aw+al};
  };

  // 종목별 성적: 미니대전/대학전/개인전/끝장전/대회·티어/프로리그 — 소속 멤버 전체 기준 집계
  const _svcCategoryRecord = (name) => {
    const memberNames = new Set(_players.filter(p=>String(p?.univ||'').trim()===name).map(p=>p.name));
    const rec = {
      mini:{w:0,l:0,lbl:'⚡ 미니대전'},
      univm:{w:0,l:0,lbl:'🏛️ 대학전'},
      ind:{w:0,l:0,lbl:'🎮 개인전'},
      gj:{w:0,l:0,lbl:'⚔️ 끝장전'},
      comp:{w:0,l:0,lbl:'🎖️ 대회/티어'},
      pro:{w:0,l:0,lbl:'🏅 프로리그'},
    };
    const _teamSrc = (arr, key) => {
      (Array.isArray(arr)?arr:[]).forEach(m=>{
        (m.sets||[]).forEach(s=>{ (s.games||[]).forEach(g=>{
          const sides = (typeof _statsGameSides==='function') ? _statsGameSides(g) : null;
          if(!sides) return;
          sides.a.forEach(pn=>{ if(memberNames.has(pn)){ if(sides.winner==='A') rec[key].w++; else if(sides.winner==='B') rec[key].l++; } });
          sides.b.forEach(pn=>{ if(memberNames.has(pn)){ if(sides.winner==='B') rec[key].w++; else if(sides.winner==='A') rec[key].l++; } });
        });});
      });
    };
    try{ _teamSrc(typeof miniM!=='undefined'?miniM:[], 'mini'); }catch(e){}
    try{ _teamSrc(typeof univM!=='undefined'?univM:[], 'univm'); }catch(e){}
    try{ _teamSrc(typeof comps!=='undefined'?comps:[], 'comp'); }catch(e){}
    try{ _teamSrc(typeof ttM!=='undefined'?ttM:[], 'comp'); }catch(e){}
    try{ if(typeof getTourneyMatches==='function') _teamSrc(getTourneyMatches(), 'comp'); }catch(e){}
    try{ _teamSrc(typeof proM!=='undefined'?proM:[], 'pro'); }catch(e){}
    try{ (typeof indM!=='undefined'&&Array.isArray(indM)?indM:[]).forEach(m=>{
      if(!m||!m.wName||!m.lName) return;
      if(memberNames.has(m.wName)) rec.ind.w++;
      if(memberNames.has(m.lName)) rec.ind.l++;
    }); }catch(e){}
    try{ (typeof gjM!=='undefined'&&Array.isArray(gjM)?gjM:[]).forEach(m=>{
      if(!m||!m.wName||!m.lName||m._proLabel) return;
      if(memberNames.has(m.wName)) rec.gj.w++;
      if(memberNames.has(m.lName)) rec.gj.l++;
    }); }catch(e){}
    return rec;
  };

  const colA = _statsCompareA?gc(_statsCompareA)||'#64748b':'#64748b';
  const colB = _statsCompareB?gc(_statsCompareB)||'#64748b':'#64748b';
  const stA  = _statsCompareA?getStats(_statsCompareA):null;
  const stB  = _statsCompareB?getStats(_statsCompareB):null;
  const h2h  = (_statsCompareA&&_statsCompareB)?getHeadToHead(_statsCompareA,_statsCompareB):{aw:0,al:0,ag:0};
  const h2hB = (_statsCompareA&&_statsCompareB)?getHeadToHead(_statsCompareB,_statsCompareA):{aw:0,al:0,ag:0};
  const catA = _statsCompareA?_svcCategoryRecord(_statsCompareA):null;
  const catB = _statsCompareB?_svcCategoryRecord(_statsCompareB):null;

  const univOptA = univList.map(u=>{const _n=(typeof escAttr==='function'?escAttr(u.name):String(u.name||''));const _nh=(typeof escHTML==='function'?escHTML(u.name):String(u.name||''));return `<option value="${_n}"${_statsCompareA===u.name?' selected':''}>${_nh}</option>`;}).join('');
  const univOptB = univList.map(u=>{const _n=(typeof escAttr==='function'?escAttr(u.name):String(u.name||''));const _nh=(typeof escHTML==='function'?escHTML(u.name):String(u.name||''));return `<option value="${_n}"${_statsCompareB===u.name?' selected':''}>${_nh}</option>`;}).join('');

  const compareRow = (label,valA,valB) => {
    const numA=typeof valA==='number'?valA:null;
    const numB=typeof valB==='number'?valB:null;
    const winA=numA!==null&&numB!==null&&numA>numB;
    const winB=numA!==null&&numB!==null&&numB>numA;
    const tot=numA!==null&&numB!==null?(numA+numB):0;
    const pctA=tot>0?Math.round(numA/tot*100):50;
    const pctB=tot>0?Math.round(numB/tot*100):50;
    const showBar=numA!==null&&numB!==null&&tot>0;
    return `<div style="padding:7px 0;border-bottom:1px solid var(--border2)">
      <div style="display:grid;grid-template-columns:1fr auto 1fr;gap:8px;align-items:center;margin-bottom:${showBar?'5px':'0'}">
        <div style="text-align:right;font-size:var(--fs-base);font-weight:${winA?'900':'600'};color:${winA?colA:'var(--text2)'}">
          ${winA?'▲ ':''}${valA}
        </div>
        <div style="font-size:10px;color:var(--text3);font-weight:700;text-align:center;white-space:nowrap;min-width:58px">${label}</div>
        <div style="text-align:left;font-size:var(--fs-base);font-weight:${winB?'900':'600'};color:${winB?colB:'var(--text2)'}">
          ${valB}${winB?' ▲':''}
        </div>
      </div>
      ${showBar?`<div class="svc-cat-bar">
        <div style="width:${pctA}%;background:${winA?colA:colA+'88'}"></div>
        <div style="width:${pctB}%;background:${winB?colB:colB+'88'}"></div>
      </div>`:''}
    </div>`;
  };

  // 레이더 차트 SVG
  const radarChart = (stA, stB) => {
    if (!stA || !stB) return '';
    const TIERS_LOCAL = typeof TIERS!=='undefined'?TIERS:[];
    const tierScore = t => { const i=TIERS_LOCAL.indexOf(t); return i<0?0:Math.max(0,(TIERS_LOCAL.length-i)*10); };

    const normalize = (val,max) => Math.min(1, max>0?val/max:0);
    const powerScore = st => st.tiered.reduce((s,p)=>s+tierScore(p.tier||''),0) + st.total*5;
    const powA = powerScore(stA), powB = powerScore(stB);
    const axes = [
      { label:'전력',   vA: normalize(powA, Math.max(powA,powB,1)), vB: normalize(powB, Math.max(powA,powB,1)) },
      { label:'승률',  vA: stA.wr!==null?stA.wr/100:0, vB: stB.wr!==null?stB.wr/100:0 },
      { label:'경기수', vA: normalize(stA.tg, Math.max(stA.tg,stB.tg,1)), vB: normalize(stB.tg, Math.max(stA.tg,stB.tg,1)) },
      { label:'프로토스', vA: normalize(stA.races.P, Math.max(stA.races.P,stB.races.P,1)), vB: normalize(stB.races.P, Math.max(stA.races.P,stB.races.P,1)) },
      { label:'테란',   vA: normalize(stA.races.T, Math.max(stA.races.T,stB.races.T,1)), vB: normalize(stB.races.T, Math.max(stA.races.T,stB.races.T,1)) },
      { label:'저그',   vA: normalize(stA.races.Z, Math.max(stA.races.Z,stB.races.Z,1)), vB: normalize(stB.races.Z, Math.max(stA.races.Z,stB.races.Z,1)) },
    ];
    const N = axes.length;
    const cx=120,cy=120,R=90;
    const angleOf = i => (Math.PI*2/N)*i - Math.PI/2;
    const pt = (val,i) => {
      const a=angleOf(i); const r=val*R;
      return `${(cx+Math.cos(a)*r).toFixed(1)},${(cy+Math.sin(a)*r).toFixed(1)}`;
    };
    const webPts = (vFn) => axes.map((_,i)=>pt(vFn(i),i)).join(' ');

    let grid='';
    [0.25,0.5,0.75,1].forEach(s=>{
      const pts=axes.map((_,i)=>{const a=angleOf(i);return `${(cx+Math.cos(a)*R*s).toFixed(1)},${(cy+Math.sin(a)*R*s).toFixed(1)}`;}).join(' ');
      grid+=`<polygon points="${pts}" fill="none" stroke="var(--border2)" stroke-width="1"/>`;
    });
    const axisLines=axes.map((_,i)=>{const a=angleOf(i);return `<line x1="${cx}" y1="${cy}" x2="${(cx+Math.cos(a)*R).toFixed(1)}" y2="${(cy+Math.sin(a)*R).toFixed(1)}" stroke="var(--border2)" stroke-width="1"/>`;}).join('');
    const labels=axes.map((ax,i)=>{
      const a=angleOf(i);const lx=(cx+Math.cos(a)*(R+18)).toFixed(1);const ly=(cy+Math.sin(a)*(R+18)).toFixed(1);
      return `<text x="${lx}" y="${ly}" text-anchor="middle" dominant-baseline="middle" font-size="10" font-weight="700" fill="var(--text3)">${ax.label}</text>`;
    }).join('');

    return `<div style="display:flex;justify-content:center;margin:8px 0 4px">
      <svg width="240" height="240" viewBox="0 0 240 240" style="overflow:visible">
        ${grid}${axisLines}
        <polygon points="${webPts(i=>axes[i].vA)}" fill="${colA}" fill-opacity="0.18" stroke="${colA}" stroke-width="2" stroke-linejoin="round"/>
        <polygon points="${webPts(i=>axes[i].vB)}" fill="${colB}" fill-opacity="0.18" stroke="${colB}" stroke-width="2" stroke-linejoin="round" stroke-dasharray="5 3"/>
        ${labels}
      </svg>
    </div>
    <div style="display:flex;justify-content:center;gap:16px;font-size:var(--fs-caption);font-weight:700">
      <span style="color:${colA}">━ ${escHTML(_statsCompareA)}</span>
      <span style="color:${colB}">╌ ${escHTML(_statsCompareB)}</span>
    </div>`;
  };

  // 대학 로고(리포트탭과 동일한 소스에서 아이콘 참조) — 픽업 카드형 선택 UI에 사용
  const _svcLogo = (name) => {
    if (!name) return '';
    const uCfg = (typeof univCfg!=='undefined'?univCfg:[]).find(u=>u && u.name===name);
    const iconUrl = (uCfg && (uCfg.icon || uCfg.img)) || (typeof UNIV_ICONS!=='undefined'?UNIV_ICONS[name]:'') || '';
    return iconUrl ? (typeof toHttpsUrl==='function'?toHttpsUrl(iconUrl):iconUrl) : '';
  };
  const _svcLogoHTML = (name, col) => {
    const src = _svcLogo(name);
    return src
      ? `<img src="${src}" onerror="this.parentNode.innerHTML='🏫'">`
      : `<span style="font-size:22px">🏫</span>`;
  };

  const _svcInjectStyle = () => {
    if (typeof document==='undefined') return;
    if (document.getElementById('svc-style')) return;
    const s = document.createElement('style');
    s.id = 'svc-style';
    s.textContent = [
      '.svc-wrap{max-width:820px;margin:0 auto}',
      '.svc-pickbar{display:grid;grid-template-columns:1fr 46px 1fr;gap:10px;align-items:center;margin-bottom:14px}',
      '.svc-pick{position:relative;border-radius:18px;padding:14px 14px 12px;overflow:hidden;cursor:pointer;transition:transform .15s,box-shadow .15s}',
      '.svc-pick:hover{transform:translateY(-2px)}',
      '.svc-pick-logo{width:38px;height:38px;border-radius:50%;background:var(--white);display:flex;align-items:center;justify-content:center;overflow:hidden;flex-shrink:0;box-shadow:0 4px 10px rgba(15,23,42,.12)}',
      '.svc-pick-logo img{width:88%;height:88%;object-fit:contain}',
      '.svc-pick-name{font-size:15px;font-weight:900;line-height:1.2}',
      '.svc-pick-sub{font-size:10.5px;font-weight:700;color:var(--text3);margin-top:2px}',
      '.svc-pick select{position:absolute;inset:0;width:100%;height:100%;opacity:0;cursor:pointer;border:none}',
      '.svc-vs{display:flex;flex-direction:column;align-items:center;justify-content:center;font-size:12px;font-weight:950;color:var(--text3)}',
      '.svc-vs-icon{font-size:20px;line-height:1}',
      '.svc-hero{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px}',
      '.svc-hero-col{border-radius:18px;padding:16px 12px;text-align:center;position:relative;overflow:hidden}',
      '.svc-hero-num{font-size:26px;font-weight:950;line-height:1}',
      '.svc-hero-lbl{font-size:10.5px;font-weight:700;color:var(--text3);margin-top:4px}',
      '.svc-hero-wr{font-size:14px;font-weight:900;margin-top:6px;display:inline-block;padding:2px 10px;border-radius:999px}',
      '.svc-panel{background:var(--white);border:1px solid rgba(148,163,184,.16);border-radius:18px;padding:14px;margin-bottom:12px;box-shadow:0 10px 20px rgba(15,23,42,.04)}',
      '.svc-panel-title{font-size:12.5px;font-weight:900;color:var(--text3);margin-bottom:10px;text-align:center;display:flex;align-items:center;justify-content:center;gap:6px}',
      '.svc-cat-row{display:grid;grid-template-columns:1fr 110px 1fr;gap:8px;align-items:center;padding:8px 0}',
      '.svc-cat-row+.svc-cat-row{border-top:1px dashed var(--border2)}',
      '.svc-cat-lbl{text-align:center;font-size:11px;font-weight:800;color:var(--text2);white-space:nowrap}',
      '.svc-cat-val{font-size:13.5px;font-weight:900}',
      /* [UI개선 v2] 듀얼 게이지 바 — 유리광택 하이라이트 + 둥근 캡으로 통일된 스타일 */
      '.svc-bar-track{height:10px;border-radius:999px;overflow:hidden;background:linear-gradient(180deg,rgba(148,163,184,.14),rgba(148,163,184,.26));box-shadow:inset 0 1px 3px rgba(15,23,42,.10);display:flex;position:relative}',
      '.svc-bar-seg{height:100%;position:relative;transition:width .5s cubic-bezier(.4,0,.2,1)}',
      '.svc-bar-seg::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(255,255,255,.35),rgba(255,255,255,0) 60%)}',
      '.svc-bar-seg--a{border-radius:999px 0 0 999px}',
      '.svc-bar-seg--b{border-radius:0 999px 999px 0}',
      '.svc-cat-bar{height:8px;border-radius:999px;overflow:hidden;background:linear-gradient(180deg,rgba(148,163,184,.14),rgba(148,163,184,.24));box-shadow:inset 0 1px 3px rgba(15,23,42,.08);display:flex;margin-top:4px;position:relative}',
      '.svc-cat-bar>div{position:relative;transition:width .5s cubic-bezier(.4,0,.2,1)}',
      '.svc-cat-bar>div::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(255,255,255,.3),rgba(255,255,255,0) 60%)}',
      '.svc-cat-bar>div:first-child{border-radius:999px 0 0 999px}',
      '.svc-cat-bar>div:last-child{border-radius:0 999px 999px 0}',
      '.svc-duel-bar{height:11px;border-radius:999px;position:relative;overflow:visible;background:linear-gradient(180deg,rgba(148,163,184,.14),rgba(148,163,184,.26));box-shadow:inset 0 1px 3px rgba(15,23,42,.10)}',
      '.svc-duel-bar-fill{position:absolute;top:1px;bottom:1px;border-radius:999px;transition:width .5s cubic-bezier(.4,0,.2,1)}',
      '.svc-duel-bar-fill::after{content:"";position:absolute;inset:0;border-radius:inherit;background:linear-gradient(180deg,rgba(255,255,255,.35),rgba(255,255,255,0) 60%)}',
      '.svc-roster-toolbar{display:flex;align-items:center;gap:8px;margin-bottom:10px;flex-wrap:wrap}',
      '.svc-roster-search{flex:1;min-width:140px;padding:7px 11px;border-radius:10px;border:1.5px solid var(--border2);font-size:12px;font-weight:700;background:var(--white);color:var(--text1)}',
      '.svc-roster-search:focus{outline:none;border-color:var(--blue)}',
      '.svc-roster-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(84px,1fr));gap:8px}',
      '.svc-roster-card{display:flex;flex-direction:column;align-items:center;text-align:center;border-radius:14px;padding:8px 4px 8px;border:1.5px solid transparent;cursor:pointer;transition:transform .14s,box-shadow .14s}',
      '.svc-roster-card:hover{transform:translateY(-2px);box-shadow:0 8px 16px rgba(15,23,42,.10)}',
      '.svc-roster-avatar{width:48px;height:48px;border-radius:50%;overflow:hidden;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:900;color:#fff;margin-bottom:5px}',
      '.svc-roster-avatar img{width:100%;height:100%;object-fit:cover}',
      '.svc-roster-name{font-size:11px;font-weight:800;color:var(--text1);max-width:78px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
      '.svc-roster-tier{font-size:9px;font-weight:900;padding:1px 6px;border-radius:999px;margin-top:3px}',
      '.svc-roster-role{font-size:9px;font-weight:700;color:var(--text3);margin-top:2px}',
      'body.dark .svc-panel{background:rgba(15,23,42,.55)!important;border-color:#334155!important}',
      'body.dark .svc-roster-search{background:rgba(15,23,42,.6)!important;border-color:#334155!important}',
      'body.dark .svc-pick-logo{background:rgba(15,23,42,.7)}',
      '@media(max-width:520px){.svc-roster-grid{grid-template-columns:repeat(auto-fill,minmax(70px,1fr))}.svc-cat-row{grid-template-columns:1fr 84px 1fr}}',
    ].join('');
    document.head.appendChild(s);
  };
  _svcInjectStyle();

  const _sortPlayers = arr => arr.slice().sort((a,b)=>{
    const ti=typeof TIERS!=='undefined'?TIERS:[];
    const ia=ti.indexOf(a.tier||''),ib=ti.indexOf(b.tier||'');
    return (ia>=0?ia:999)-(ib>=0?ib:999)||(a.name||'').localeCompare(b.name||'','ko',{sensitivity:'base'});
  });
  const _rosterQuery = String(window._svcRosterQ||'').trim().toLowerCase();
  const _svcRosterCard = (p, col) => {
    const safeName=(p.name||'').replace(/'/g,"\\'");
    const tCol = p.tier && typeof getTierBtnColor==='function' ? getTierBtnColor(p.tier) : col;
    const tTxt = p.tier && typeof getTierBtnTextColor==='function' ? (getTierBtnTextColor(p.tier)||'#fff') : '#fff';
    return `<div class="svc-roster-card" style="background:${col}0a" onmouseover="this.style.borderColor='${col}55'" onmouseout="this.style.borderColor='transparent'" onclick="openPlayerModal('${safeName}')">
      <div class="svc-roster-avatar" style="background:${col}">${typeof getPlayerPhotoHTML==='function'?getPlayerPhotoHTML(p.name,48,'width:100%;height:100%'):escHTML((p.name||'?').slice(0,1))}</div>
      <div class="svc-roster-name" style="${p.inactive?'opacity:.55':''}">${escHTML(p.name||'')}</div>
      ${p.tier?`<div class="svc-roster-tier" style="background:${tCol};color:${tTxt}">${escHTML(p.tier)}</div>`:(p.role?`<div class="svc-roster-role">${escHTML(p.role)}</div>`:'')}
    </div>`;
  };
  const _makeRosterGrid = (st, col) => {
    const all = _sortPlayers([...st.tiered, ...st.roled]);
    const filtered = _rosterQuery ? all.filter(p=>String(p.name||'').toLowerCase().includes(_rosterQuery)) : all;
    if (!filtered.length) return `<div style="text-align:center;padding:16px;color:var(--text3);font-size:12px">${_rosterQuery?'검색 결과 없음':'소속 선수 없음'}</div>`;
    return `<div class="svc-roster-grid">${filtered.map(p=>_svcRosterCard(p,col)).join('')}</div>`;
  };

  // 종목별 성적 스코어보드 한 줄
  const _catRow = (label, a, b) => {
    const ta=a.w+a.l, tb=b.w+b.l;
    const wrA = ta? Math.round(a.w/ta*100) : null;
    const wrB = tb? Math.round(b.w/tb*100) : null;
    const tot = ta+tb;
    const pctA = tot? Math.round(ta/tot*100) : 50;
    return `<div class="svc-cat-row">
      <div style="text-align:right">
        <span class="svc-cat-val" style="color:${ta?colA:'var(--text3)'}">${a.w}승 ${a.l}패</span>
        ${wrA!==null?`<span style="font-size:10px;color:var(--text3);font-weight:700;margin-left:4px">(${wrA}%)</span>`:''}
      </div>
      <div class="svc-cat-lbl">${label}</div>
      <div style="text-align:left">
        <span class="svc-cat-val" style="color:${tb?colB:'var(--text3)'}">${b.w}승 ${b.l}패</span>
        ${wrB!==null?`<span style="font-size:10px;color:var(--text3);font-weight:700;margin-left:4px">(${wrB}%)</span>`:''}
      </div>
      <div class="svc-cat-bar" style="grid-column:1/-1">
        <div style="width:${pctA}%;background:${ta?colA:'var(--border2)'}"></div>
        <div style="width:${100-pctA}%;background:${tb?colB:'var(--border2)'}"></div>
      </div>
    </div>`;
  };

  let h = `<div class="ssec">
  <h4 style="margin-bottom:10px">⚔️ 대학비교</h4>
  <div class="svc-wrap">
    <div class="svc-pickbar">
      <div class="svc-pick" style="background:${colA}14;border:2px solid ${colA}55">
        <div style="display:flex;align-items:center;gap:10px">
          <div class="svc-pick-logo">${_svcLogoHTML(_statsCompareA,colA)}</div>
          <div style="min-width:0">
            <div class="svc-pick-name" style="color:${colA}">${escHTML(_statsCompareA||'선택')}</div>
            <div class="svc-pick-sub">기준 대학 ▾</div>
          </div>
        </div>
        <select onchange="if(this.value===_statsCompareB){this.value=_statsCompareA;return;}; _statsCompareA=this.value;render()">${univOptA}</select>
      </div>
      <div class="svc-vs"><span class="svc-vs-icon">⚔️</span>VS</div>
      <div class="svc-pick" style="background:${colB}14;border:2px solid ${colB}55">
        <div style="display:flex;align-items:center;gap:10px">
          <div class="svc-pick-logo">${_svcLogoHTML(_statsCompareB,colB)}</div>
          <div style="min-width:0">
            <div class="svc-pick-name" style="color:${colB}">${escHTML(_statsCompareB||'선택')}</div>
            <div class="svc-pick-sub">비교 대학 ▾</div>
          </div>
        </div>
        <select onchange="if(this.value===_statsCompareA){this.value=_statsCompareB;return;}; _statsCompareB=this.value;render()">${univOptB}</select>
      </div>
    </div>
    ${_statsCompareA === _statsCompareB ? `<div style="text-align:center;padding:10px;color:#b45309;font-size:var(--fs-sm);font-weight:700;background:#fef9c3;border-radius:var(--r);margin-bottom:8px">⚠️ 같은 대학을 선택하면 비교가 의미 없습니다. 다른 대학을 선택해 주세요.</div>` : ''}`;

  if (stA && stB) {
    h += `<div class="svc-hero">
      <div class="svc-hero-col" style="background:linear-gradient(135deg,${colA}20,${colA}08);border:1px solid ${colA}33">
        <div class="svc-hero-num" style="color:${colA}">${stA.total}</div>
        <div class="svc-hero-lbl">총 인원</div>
        ${stA.wr!==null?`<div class="svc-hero-wr" style="background:${stA.wr>=50?'#10b98122':'#ef444422'};color:${stA.wr>=50?'#10b981':'#ef4444'}">${stA.wr}% 승률</div>`:''}
      </div>
      <div class="svc-hero-col" style="background:linear-gradient(135deg,${colB}20,${colB}08);border:1px solid ${colB}33">
        <div class="svc-hero-num" style="color:${colB}">${stB.total}</div>
        <div class="svc-hero-lbl">총 인원</div>
        ${stB.wr!==null?`<div class="svc-hero-wr" style="background:${stB.wr>=50?'#10b98122':'#ef444422'};color:${stB.wr>=50?'#10b981':'#ef4444'}">${stB.wr}% 승률</div>`:''}
      </div>
    </div>`;

    {
      const totalAg = h2h.aw + h2hB.aw;
      const aWpct = totalAg>0?Math.round(h2h.aw/totalAg*100):50;
      const aWr = totalAg>0?Math.round(h2h.aw/totalAg*100):null;
      const bWr = totalAg>0?Math.round(h2hB.aw/totalAg*100):null;
      if (totalAg > 0) {
        h += `<div class="svc-panel">
          <div class="svc-panel-title">⚔️ 직접 맞대결 전적 <span style="font-weight:600;color:var(--text3)">(총 ${totalAg}전)</span></div>
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:5px">
            <div style="text-align:right;min-width:70px">
              <div style="font-size:16px;font-weight:900;color:${colA}">${h2h.aw}승 ${h2h.al}패</div>
              ${aWr!==null?`<div style="font-size:var(--fs-caption);font-weight:800;color:${aWr>=50?colA:'var(--text3)'}">${aWr}%</div>`:''}
            </div>
            <div class="svc-bar-track" style="flex:1;box-shadow:inset 0 1px 3px rgba(15,23,42,.10), 0 0 0 1px ${aWpct>=50?colA:colB}1a">
              <div class="svc-bar-seg svc-bar-seg--a" style="width:${aWpct}%;background:linear-gradient(90deg,${colA}b3,${colA})"></div>
              <div class="svc-bar-seg svc-bar-seg--b" style="width:${100-aWpct}%;background:linear-gradient(90deg,${colB},${colB}b3)"></div>
            </div>
            <div style="text-align:left;min-width:70px">
              <div style="font-size:16px;font-weight:900;color:${colB}">${h2hB.aw}승 ${h2hB.al}패</div>
              ${bWr!==null?`<div style="font-size:var(--fs-caption);font-weight:800;color:${bWr>=50?colB:'var(--text3)'}">${bWr}%</div>`:''}
            </div>
          </div>
          <div style="display:flex;justify-content:space-between;font-size:var(--fs-caption)">
            <span style="color:${colA};font-weight:800">${escHTML(_statsCompareA)}</span>
            <span style="color:var(--text3)">${aWpct>50?_statsCompareA+'이 우세':aWpct<50?_statsCompareB+'이 우세':'균형'}</span>
            <span style="color:${colB};font-weight:800">${escHTML(_statsCompareB)}</span>
          </div>
        </div>`;
      } else {
        h += `<div class="svc-panel" style="color:var(--text3);font-size:var(--fs-sm);text-align:center">
          ⚔️ 직접 맞대결 기록 없음 <span style="font-size:var(--fs-caption)">(경기 데이터 누적 시 표시)</span>
        </div>`;
      }
    }

    // [신규] 티어별 맞대결 전적 — 두 대학 소속 선수가 "같은 티어끼리" 실제로 맞붙었던
    // 경기만 골라 티어별로 승패를 집계. 종족/인원 등 정적 스펙 비교가 아니라 실제 대결
    // 결과 기반이라 "이 티어대는 어느 대학이 강한가"를 바로 확인할 수 있다.
    if (_statsCompareA && _statsCompareB && _statsCompareA !== _statsCompareB && typeof getStatsUnivHeadToHeadByTier === 'function') {
      const _tierH2H = getStatsUnivHeadToHeadByTier(_statsCompareA, _statsCompareB);
      const _tierKeys = Object.keys(_tierH2H);
      if (_tierKeys.length) {
        const _order = (typeof _univTierOrder === 'function') ? _univTierOrder(_tierKeys) : _tierKeys;
        const _tierTotal = _tierKeys.reduce((s,t)=>s+_tierH2H[t].total,0);
        h += `<div class="svc-panel">
          <div class="svc-panel-title">🎯 티어별 맞대결 전적 <span style="font-weight:600;color:var(--text3)">(같은 티어끼리 맞붙은 경기 · 총 ${_tierTotal}전)</span></div>
          ${_order.map(t=>{
            const r = _tierH2H[t];
            const tCol = typeof getTierBtnColor==='function' ? getTierBtnColor(t) : 'var(--text2)';
            const tTxt = typeof getTierBtnTextColor==='function' ? (getTierBtnTextColor(t)||'#fff') : '#fff';
            const tierLbl = `<span style="display:inline-flex;align-items:center;justify-content:center;padding:2px 9px;border-radius:999px;background:${tCol};color:${tTxt};font-size:10.5px;font-weight:900">${escHTML(t)}</span>`;
            return _catRow(tierLbl, {w:r.aWins,l:r.bWins}, {w:r.bWins,l:r.aWins});
          }).join('')}
        </div>`;
      }
    }

    // 종목별 성적 (미니대전/대학전/개인전/끝장전/대회·티어/프로리그) — 리포트탭과 달리 두 대학을 나란히 놓는 듀얼 스코어보드 형식
    if (catA && catB) {
      h += `<div class="svc-panel">
        <div class="svc-panel-title">🏆 종목별 성적 <span style="font-weight:600;color:var(--text3)">(소속 멤버 전체 합산)</span></div>
        ${_catRow(catA.mini.lbl, catA.mini, catB.mini)}
        ${_catRow(catA.univm.lbl, catA.univm, catB.univm)}
        ${_catRow(catA.ind.lbl, catA.ind, catB.ind)}
        ${_catRow(catA.gj.lbl, catA.gj, catB.gj)}
        ${_catRow(catA.comp.lbl, catA.comp, catB.comp)}
        ${_catRow(catA.pro.lbl, catA.pro, catB.pro)}
      </div>`;
    }

    h += `<div class="svc-panel">
      <div class="svc-panel-title">📡 다차원 비교</div>
      ${radarChart(stA, stB)}
    </div>`;

    h += `<div class="svc-panel">
      <div style="display:grid;grid-template-columns:1fr auto 1fr;gap:8px;align-items:center;padding-bottom:8px;border-bottom:2px solid var(--border2);margin-bottom:4px">
        <div style="text-align:right;font-size:14px;font-weight:900;color:${colA}">${escHTML(_statsCompareA)}</div>
        <div style="width:60px;text-align:center"></div>
        <div style="text-align:left;font-size:14px;font-weight:900;color:${colB}">${escHTML(_statsCompareB)}</div>
      </div>`;
    h += compareRow('선수 수', stA.tiered.length, stB.tiered.length);
    h += compareRow('직책자', stA.roled.length, stB.roled.length);
    h += compareRow('통산 경기', stA.tg, stB.tg);
    h += compareRow('통산 승', stA.tw, stB.tw);
    h += compareRow(stA.wr!==null?`승률 (${stA.wr}%)`:'승률', stA.wr??0, stB.wr??0);
    h += `<div style="text-align:center;font-size:10px;color:var(--text3);font-weight:700;margin:6px 0 2px">🎮 종족 분포 (전체 ${stA.total}명 / ${stB.total}명 기준)</div>`;
    h += compareRow('🔮 프로토스', stA.races.P, stB.races.P);
    h += compareRow('⚔️ 테란', stA.races.T, stB.races.T);
    h += compareRow('🦎 저그', stA.races.Z, stB.races.Z);
    if (stA.races.N>0 || stB.races.N>0) h += compareRow('❔ 종족 미정', stA.races.N, stB.races.N);
    h += compareRow('최상위 티어', stA.topTier, stB.topTier);

    const allTiers=[...new Set([...Object.keys(stA.tiers),...Object.keys(stB.tiers)])];
    const sortedTiers=(typeof TIERS!=='undefined'?TIERS.filter(t=>allTiers.includes(t)):[]).concat(allTiers.filter(t=>typeof TIERS==='undefined'||!TIERS.includes(t)));
    if (sortedTiers.length) {
      h+=`<div style="margin-top:12px;font-size:var(--fs-sm);font-weight:700;color:var(--text3);text-align:center;margin-bottom:8px">티어별 비교</div>`;
      sortedTiers.forEach(t=>{
        const nA=stA.tiers[t]||0,nB=stB.tiers[t]||0;
        const col=typeof getTierBtnColor==='function'?getTierBtnColor(t):'#64748b';
        const tcol=typeof getTierBtnTextColor==='function'?(getTierBtnTextColor(t)||'#fff'):'#fff';
        const maxN=Math.max(nA,nB,1);
        h+=`<div style="display:grid;grid-template-columns:1fr 52px 1fr;gap:6px;align-items:center;margin-bottom:6px">
          <div style="display:flex;justify-content:flex-end">
            <div class="svc-duel-bar" style="width:${Math.round(nA/maxN*100)}%;max-width:100%;min-width:${nA?'8px':'0'}">
              <div class="svc-duel-bar-fill" style="left:0;right:0;background:linear-gradient(90deg,${nA>nB?colA:colA+'88'}b3,${nA>nB?colA:colA+'88'});border-radius:999px 0 0 999px"></div>
            </div>
          </div>
          <div style="text-align:center;font-size:var(--fs-caption);font-weight:800;padding:2px 6px;border-radius:8px;background:${col};color:${tcol}">${escHTML(t)}</div>
          <div>
            <div class="svc-duel-bar" style="width:${Math.round(nB/maxN*100)}%;max-width:100%;min-width:${nB?'8px':'0'}">
              <div class="svc-duel-bar-fill" style="left:0;right:0;background:linear-gradient(90deg,${nB>nA?colB:colB+'88'},${nB>nA?colB:colB+'88'}b3);border-radius:0 999px 999px 0"></div>
            </div>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 52px 1fr;gap:6px;margin-bottom:4px">
          <div style="text-align:right;font-size:var(--fs-caption);color:${nA>nB?colA:'var(--text3)'};font-weight:${nA>nB?'800':'400'}">${nA?nA+'명':''}</div>
          <div></div>
          <div style="font-size:var(--fs-caption);color:${nB>nA?colB:'var(--text3)'};font-weight:${nB>nA?'800':'400'}">${nB?nB+'명':''}</div>
        </div>`;
      });
    }
    h += `</div>`;

    h+=`<div class="svc-panel">
      <div class="svc-panel-title">👥 선수 명단</div>
      <div class="svc-roster-toolbar">
        <input type="text" class="svc-roster-search" placeholder="🔍 이름으로 검색..." value="${escHTML(window._svcRosterQ||'')}" oninput="window._svcRosterQ=this.value;clearTimeout(window._svcRosterQT);window._svcRosterQT=setTimeout(render,180)">
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
        <div>
          <div style="font-size:var(--fs-sm);font-weight:900;color:${colA};margin-bottom:8px;text-align:center;padding:5px 8px;background:${colA}14;border-radius:10px">${escHTML(_statsCompareA)} · ${stA.tiered.length+stA.roled.length}명</div>
          ${_makeRosterGrid(stA, colA)}
        </div>
        <div>
          <div style="font-size:var(--fs-sm);font-weight:900;color:${colB};margin-bottom:8px;text-align:center;padding:5px 8px;background:${colB}14;border-radius:10px">${escHTML(_statsCompareB)} · ${stB.tiered.length+stB.roled.length}명</div>
          ${_makeRosterGrid(stB, colB)}
        </div>
      </div>
    </div>`;
  }

  h += `</div></div>`;
  return h;
}

/* ══════════════════════════════════════
   7. 미스매치 감지
══════════════════════════════════════ */
