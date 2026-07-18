/* ══════════════════════════════════════
   Render Share Utilities
══════════════════════════════════════ */
window._shareBtnHTML = window._shareBtnHTML || function(onclick, label='🎴 공유 카드', extraStyle='', extraClass=''){
  const cls = `btn btn-p btn-xs share-btn-unified ${extraClass||''}`.trim();
  return `<button class="${cls}" style="${extraStyle||''}" onclick="${onclick}">${label}</button>`;
};

function openBoardUnivShareCard(univName){
  if(!univName||univName==='전체')return;
  _shareMode='univ';
  _shareUnivSearch=univName;
  openShareCardModal();
  const _run=()=>renderShareCardByUniv(univName);
  if(typeof window._shareCardDeferRender==='function') window._shareCardDeferRender(_run);
  else setTimeout(_run,0);
}

function openShareCardFromPlayer(){
  const st = (typeof getPlayerDetailState==='function') ? getPlayerDetailState() : (window.PlayerDetailState||{});
  const name=st.currentName;
  if(!name)return;
  cm('playerModal');
  _shareMode='player';
  _sharePlayerSearch=name;
  openShareCardModal();
  const _run=()=>{
    if(typeof window.renderShareCardByPlayer==='function') return window.renderShareCardByPlayer(name);
    Promise.resolve()
      .then(()=>typeof window._ensureStatsLoaded==='function' ? window._ensureStatsLoaded() : null)
      .then(()=>{
        if(typeof window.renderShareCardByPlayer==='function') window.renderShareCardByPlayer(name);
        else{
          const card=document.getElementById('share-card');
          if(card) card.innerHTML='<div style="padding:40px;text-align:center;color:var(--gray-l)">공유카드 기능을 불러오는 중입니다. 다시 눌러주세요.</div>';
        }
      })
      .catch(()=>{
        const card=document.getElementById('share-card');
        if(card) card.innerHTML='<div style="padding:40px;text-align:center;color:#dc2626">공유카드를 불러오지 못했습니다.</div>';
      });
  };
  if(typeof window._shareCardDeferRender==='function') window._shareCardDeferRender(_run);
  else setTimeout(_run,0);
}

function openShareCardFromUniv(){
  const st = (typeof getUnivDetailState==='function') ? getUnivDetailState() : (window.UnivDetailState||{});
  const name=st.currentName;
  if(!name)return;
  cm('univModal');
  _shareMode='univ';
  _shareUnivSearch=name;
  openShareCardModal();
  const _run=()=>renderShareCardByUniv(name);
  if(typeof window._shareCardDeferRender==='function') window._shareCardDeferRender(_run);
  else setTimeout(_run,0);
}

function _renderShareCardByPlayerFallback(name){
  const card=document.getElementById('share-card');
  if(!card) return;
  const p=(typeof players!=='undefined'?(players||[]).find(x=>x&&x.name===name):null);
  if(!p){
    card.innerHTML='<div style="padding:40px;text-align:center;color:var(--gray-l)">스트리머를 찾을 수 없습니다</div>';
    return;
  }
  const h=Array.isArray(p.history)?p.history:[];
  const w=h.filter(x=>x&&x.result==='승').length;
  const l=h.filter(x=>x&&x.result==='패').length;
  const tot=w+l;
  const rate=tot?Math.round(w/tot*100):0;
  const col=(typeof gc==='function'?gc(p.univ||''):'#64748b')||'#64748b';
  const raceLabel=p.race==='T'?'테란':p.race==='Z'?'저그':p.race==='P'?'프로토스':'-';
  const bgImg=String(p.shareCardBgImg||'').trim();
  const bgFit=String(p.shareCardBgFit||'cover').trim();
  const bgScale=Math.max(40, Math.min(220, Number(p.shareCardBgScale||100)||100));
  const bgDark=Math.max(0, Math.min(85, Number(p.shareCardBgDark??18)||0));
  const bgFade=Math.max(0, Math.min(100, Number(p.shareCardBgFade??0)||0));
  const bgPosX=((p.shareCardBgPosX||'center')+'').trim();
  const bgPosY=((p.shareCardBgPosY||'center')+'').trim();
  const bgPos=`${bgPosX} ${bgPosY}`;
  const recent=h.slice(0,5).map(x=>`<span style="display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:999px;background:${x.result==='승'?'#dc2626':'#2563eb'};color:#fff;font-size:var(--fs-caption);font-weight:900">${x.result==='승'?'W':'L'}</span>`).join('');
  const photo = p.photo ? `<img src="${toHttpsUrl(p.photo)}" style="width:88px;height:88px;border-radius:24px;object-fit:cover;display:block" onerror="this.remove()">` : '';
  const pts=p.points||0;
  const ptsColor=pts>0?'#4ade80':pts<0?'#f87171':'rgba(255,255,255,.8)';
  const scp=(typeof window._getShareCardPrefs==='function'?window._getShareCardPrefs():{mode:'campus',color:.72,fx:.55,profileScale:1,surface:'glass'});
  const profileW=Math.round(92*(scp.profileScale||1));
  const profileH=Math.round(112*(scp.profileScale||1));
  const baseCol=(typeof window._scHexNorm==='function'?window._scHexNorm(col):col)||'#64748b';
  const accentA = scp.mode==='soft' && typeof window._scShadeHex==='function' ? window._scShadeHex(baseCol,.26) : (scp.mode==='dark' && typeof window._scShadeHex==='function' ? window._scShadeHex(baseCol,-.22) : (scp.mode==='aurora' && typeof window._scMixHex==='function' ? window._scMixHex(baseCol,'#38bdf8',.18) : (scp.mode==='poster' && typeof window._scShadeHex==='function' ? window._scShadeHex(baseCol,-.10) : (scp.mode==='mono' ? '#6b7280' : baseCol))));
  const accentB = typeof window._scMixHex==='function' ? window._scMixHex(baseCol, scp.mode==='aurora' ? '#7c3aed' : scp.mode==='poster' ? '#111827' : '#ffffff', scp.mode==='vivid' ? .18 : scp.mode==='aurora' ? .22 : scp.mode==='poster' ? .42 : .34) : baseCol;
  const shellBg = scp.mode==='dark' ? 'linear-gradient(180deg,#020617,#0f172a)' : scp.mode==='aurora' ? `linear-gradient(160deg,${typeof window._scMixHex==='function'?window._scMixHex(baseCol,'#e0f2fe',.72):baseCol},${typeof window._scMixHex==='function'?window._scMixHex(baseCol,'#111827',.18):'#111827'})` : scp.mode==='poster' ? `linear-gradient(180deg,${typeof window._scMixHex==='function'?window._scMixHex(baseCol,'#111827',.18):baseCol},#111827)` : scp.mode==='mono' ? 'linear-gradient(180deg,#1f2937,#111827)' : `linear-gradient(180deg,${accentA},#111827)`;
  const glassBg = scp.surface==='solid' ? `linear-gradient(180deg,${accentA},${accentB})` : scp.surface==='clean' ? 'linear-gradient(180deg,rgba(255,255,255,.16),rgba(255,255,255,.10))' : 'linear-gradient(180deg,rgba(255,255,255,.08),rgba(255,255,255,.04))';
  const surfaceBlur = bgImg ? '0px' : (scp.surface==='glass' ? '10px' : '4px');
  const bgCss = `linear-gradient(135deg,${col}dd,${col}88)`;
  const bgSize = bgFit==='fill' ? `${bgScale}% ${bgScale}%` : `${bgScale}%`;
  card.innerHTML=`<div style="background:${shellBg};padding:16px;border-radius:26px;color:#fff;position:relative;overflow:hidden;box-shadow:0 22px 48px rgba(15,23,42,.26);font-family:'Noto Sans KR',sans-serif">
    <div style="position:absolute;inset:0;background:${bgCss};opacity:.96"></div>
    ${bgImg?`<div style="position:absolute;inset:0;background-image:url('${toHttpsUrl(bgImg)}');background-position:${bgPos};background-size:${bgSize};background-repeat:no-repeat;opacity:1"></div>`:''}
    ${bgImg?`<div style="position:absolute;inset:0;background:linear-gradient(135deg, rgba(15,23,42,${(bgDark/100).toFixed(2)}), rgba(15,23,42,${Math.max(0, (bgDark-12)/100).toFixed(2)})), linear-gradient(135deg, rgba(255,255,255,${(bgFade/100).toFixed(2)}), rgba(255,255,255,${Math.max(0, (bgFade-25)/100).toFixed(2)}));pointer-events:none"></div>`:''}
    <div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(15,23,42,${(0.08+scp.fx*0.10).toFixed(2)}),rgba(15,23,42,${(0.62+scp.fx*0.22).toFixed(2)}));pointer-events:none"></div>
    <div style="position:absolute;top:-32px;right:-28px;width:160px;height:160px;border-radius:50%;background:rgba(255,255,255,.07);pointer-events:none"></div>
    <div style="position:absolute;left:-42px;bottom:-44px;width:160px;height:160px;border-radius:50%;background:${baseCol}${Math.round(20+scp.color*30).toString(16).padStart(2,'0')};pointer-events:none"></div>
    <div style="position:relative;z-index:1;border:1px solid rgba(255,255,255,.12);border-radius:22px;padding:18px;background:${glassBg};backdrop-filter:blur(${surfaceBlur})">
      <div style="display:flex;align-items:flex-start;justify-content:flex-end;gap:12px;margin-bottom:14px">
        <div style="background:rgba(255,255,255,.10);border:1px solid rgba(255,255,255,.16);border-radius:999px;padding:5px 11px;font-size:10px;font-weight:900">${p.tier||'-'}</div>
      </div>
      <div style="display:grid;grid-template-columns:auto minmax(0,1fr) auto;gap:14px;align-items:center">
        <div style="width:${profileW}px;height:${profileH}px;border-radius:24px;background:rgba(255,255,255,.16);border:2px solid rgba(255,255,255,.26);overflow:hidden;box-shadow:0 14px 32px rgba(0,0,0,.24);display:flex;align-items:center;justify-content:center;flex-shrink:0">${photo||`<span style="font-size:${Math.round(34*(scp.profileScale||1))}px;font-weight:1000;color:#fff">${String(name||'?').charAt(0)}</span>`}</div>
        <div style="min-width:0">
          <div style="font-size:27px;font-weight:1000;letter-spacing:.2px;line-height:1.08;white-space:normal;word-break:keep-all">${name}</div>
          <div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin-top:8px">
            <span style="background:rgba(255,255,255,.14);border:1px solid rgba(255,255,255,.2);border-radius:999px;padding:4px 10px;font-size:10px;font-weight:900">${p.univ||'무소속'}</span>
            <span style="background:rgba(255,255,255,.14);border:1px solid rgba(255,255,255,.2);border-radius:999px;padding:4px 10px;font-size:10px;font-weight:900">${raceLabel}</span>
          </div>
          <div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin-top:10px">${recent||'<span style="opacity:.6;font-size:var(--fs-sm)">기록없음</span>'}</div>
        </div>
        <div style="min-width:92px;background:rgba(255,255,255,.10);border:1px solid rgba(255,255,255,.14);border-radius:18px;padding:10px 12px;text-align:center">
          <div style="font-size:9px;letter-spacing:.8px;font-weight:900;color:rgba(255,255,255,.68)">승률</div>
          <div style="font-size:28px;font-weight:1000;line-height:1.02;margin-top:4px">${rate}%</div>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-top:16px">
        <div style="background:rgba(255,255,255,.09);border:1px solid rgba(255,255,255,.12);border-radius:14px;padding:10px 8px;text-align:center"><div style="font-size:9px;color:rgba(255,255,255,.62);font-weight:800">승패</div><div style="margin-top:5px;font-size:16px;font-weight:1000"><span style="color:#4ade80">${w}</span> / <span style="color:#f87171">${l}</span></div></div>
        <div style="background:rgba(255,255,255,.09);border:1px solid rgba(255,255,255,.12);border-radius:14px;padding:10px 8px;text-align:center"><div style="font-size:9px;color:rgba(255,255,255,.62);font-weight:800">포인트</div><div style="margin-top:5px;font-size:var(--fs-lg);font-weight:1000;color:${ptsColor}">${pts>=0?'+':''}${pts}</div></div>
        <div style="background:rgba(255,255,255,.09);border:1px solid rgba(255,255,255,.12);border-radius:14px;padding:10px 8px;text-align:center"><div style="font-size:9px;color:rgba(255,255,255,.62);font-weight:800">총 경기</div><div style="margin-top:5px;font-size:var(--fs-lg);font-weight:1000">${tot}</div></div>
      </div>
    </div>
  </div>`;
}

window.renderShareCardByPlayer = window.renderShareCardByPlayer || function _fallbackRenderShareCardByPlayer(name){
  Promise.resolve()
    .then(()=>typeof window._ensureStatsLoaded==='function' ? window._ensureStatsLoaded() : null)
    .then(()=>{
      if(typeof window.renderShareCardByPlayer==='function' && window.renderShareCardByPlayer !== _fallbackRenderShareCardByPlayer){
        window.renderShareCardByPlayer(name);
      }else{
        _renderShareCardByPlayerFallback(name);
      }
    })
    .catch(()=>{
      _renderShareCardByPlayerFallback(name);
    });
};

function openProCompMatchShare(a,b,sa,sb,d){
  const A=String(a||'A팀'), B=String(b||'B팀');
  const ds=String(d||'').slice(0,10);
  const _eq=(x,y)=>String(x||'')===String(y||'');
  const _pairEq=(a1,b1,a2,b2)=>(_eq(a1,a2)&&_eq(b1,b2))||(_eq(a1,b2)&&_eq(b1,a2));
  const _invWinner=w=>w==='A'?'B':w==='B'?'A':w;

  let share={
    a:A,b:B,sa:Number(sa||0),sb:Number(sb||0),d:ds,
    n:'',_matchType:'pro',_subLabel:'프로리그',_noUnivIcon:false,_usePlayerPhoto:true
  };

  try{
    const tourneys=Array.isArray(proTourneys)?proTourneys:[];
    outerTeam:
    for(const tn of tourneys){
      for(const tm of (tn.teamMatches||[])){
        const tmd=String(tm.d||'').slice(0,10);
        if(ds && tmd && tmd!==ds) continue;
        if(!_pairEq(tm.teamAName, tm.teamBName, A, B)) continue;
        const swap = !_eq(tm.teamAName,A);
        const teamAName = swap ? (tm.teamBName||B) : (tm.teamAName||A);
        const teamBName = swap ? (tm.teamAName||A) : (tm.teamBName||B);
        const games=(tm.games||[]).map(g=>{
          const sideW = swap ? _invWinner(g._sideW) : g._sideW;
          if(sideW==='A') return { playerA:g.wName||'', playerB:g.lName||'', winner:'A', map:g.map||'' };
          if(sideW==='B') return { playerA:g.lName||'', playerB:g.wName||'', winner:'B', map:g.map||'' };
          return { playerA:g.lName||'', playerB:g.wName||'', winner:'', map:g.map||'' };
        }).filter(x=>x.playerA||x.playerB);
        const scoreA=games.filter(g=>g.winner==='A').length;
        const scoreB=games.filter(g=>g.winner==='B').length;
        share={
          a:teamAName,b:teamBName,sa:scoreA,sb:scoreB,d:tmd||ds,
          n:tn.name||'',_matchType:'procomp-team',_subLabel:(tn.name?`${tn.name} · 팀전`:'팀전'),
          _noUnivIcon:false,_usePlayerPhoto:true,
          sets:[{label:'팀전',scoreA,scoreB,games}]
        };
        break outerTeam;
      }
    }

    if(!share.sets){
      outerBkt:
      for(const tn of tourneys){
        const totalRnd=(tn.bracket||[]).length||0;
        const rndLabel = (ri)=>{
          if(ri==='3rd') return '3·4위전';
          const r=Number(ri);
          if(!isFinite(r) || totalRnd<=0) return '토너먼트';
          return r===totalRnd-1?'결승':r===totalRnd-2?'4강':r===totalRnd-3?'8강':`${Math.pow(2,totalRnd-r)}강`;
        };
        for(let ri=0; ri<(tn.bracket||[]).length; ri++){
          const rnd=tn.bracket[ri]||[];
          for(let mi=0; mi<rnd.length; mi++){
            const m=rnd[mi];
            if(!m||!m.a||!m.b) continue;
            const md=String(m.d||'').slice(0,10);
            if(ds && md && md!==ds) continue;
            if(!_pairEq(m.a,m.b,A,B)) continue;
            const swapped = _eq(m.a,B) && _eq(m.b,A);
            const setGames = Array.isArray(m.sets) ? m.sets.flatMap(s=>Array.isArray(s&&s.games)?s.games:[]) : [];
            const gamesRaw = setGames.length ? setGames : (Array.isArray(m._games) && m._games.length ? m._games : [{winner:m.winner, map:m.map||''}]);
            const games = gamesRaw.map(g=>{
              const ga = g.playerA || g.wName || A;
              const gb = g.playerB || g.lName || B;
              return {
                playerA: swapped ? gb : ga,
                playerB: swapped ? ga : gb,
                winner: swapped ? _invWinner(g.winner) : (g.winner||''),
                map: g.map||m.map||''
              };
            }).filter(x=>x.playerA||x.playerB);
            const scoreA=games.filter(g=>g.winner==='A').length;
            const scoreB=games.filter(g=>g.winner==='B').length;
            const lbl=rndLabel(ri);
            share={
              a:A,b:B,sa:scoreA,sb:scoreB,d:md||ds,
              n:tn.name||'',_matchType:'procomp-bkt',_subLabel:(tn.name?`${tn.name} · ${lbl}`:lbl),
              _noUnivIcon:false,_usePlayerPhoto:true,
              sets:[{label:lbl,scoreA,scoreB,games}]
            };
            break outerBkt;
          }
        }
        if(tn.thirdPlace && tn.thirdPlace.a && tn.thirdPlace.b){
          const m=tn.thirdPlace;
          const md=String(m.d||'').slice(0,10);
          if(ds && md && md!==ds) continue;
          if(_pairEq(m.a,m.b,A,B)){
            const swapped = _eq(m.a,B) && _eq(m.b,A);
            const setGames = Array.isArray(m.sets) ? m.sets.flatMap(s=>Array.isArray(s&&s.games)?s.games:[]) : [];
            const games = (setGames.length ? setGames : [{playerA:A,playerB:B,winner:m.winner,map:m.map||''}]).map(g=>{
              const ga = g.playerA || g.wName || A;
              const gb = g.playerB || g.lName || B;
              return {playerA: swapped ? gb : ga, playerB: swapped ? ga : gb, winner: swapped ? _invWinner(g.winner) : (g.winner||''), map:g.map||m.map||''};
            });
            const scoreA=games.filter(g=>g.winner==='A').length;
            const scoreB=games.filter(g=>g.winner==='B').length;
            const lbl=rndLabel('3rd');
            share={
              a:A,b:B,sa:scoreA,sb:scoreB,d:md||ds,
              n:tn.name||'',_matchType:'procomp-bkt',_subLabel:(tn.name?`${tn.name} · ${lbl}`:lbl),
              _noUnivIcon:false,_usePlayerPhoto:true,
              sets:[{label:lbl,scoreA,scoreB,games}]
            };
            break;
          }
        }
      }
    }

    if(!share.sets){
      outerGrp:
      for(const tn of tourneys){
        for(const grp of (tn.groups||[])){
          for(const m of (grp.matches||[])){
            if(!m||!m.a||!m.b) continue;
            const md=String(m.d||'').slice(0,10);
            if(ds && md && md!==ds) continue;
            if(!_pairEq(m.a,m.b,A,B)) continue;
            const swapped = _eq(m.a,B) && _eq(m.b,A);
            const winner = swapped ? _invWinner(m.winner) : (m.winner||'');
            const setGames = Array.isArray(m.sets) ? m.sets.flatMap(s=>Array.isArray(s&&s.games)?s.games:[]) : [];
            const games=(setGames.length ? setGames : [{playerA:A,playerB:B,winner,map:m.map||''}]).map(g=>{
              const ga = g.playerA || g.wName || A;
              const gb = g.playerB || g.lName || B;
              return {playerA: swapped ? gb : ga, playerB: swapped ? ga : gb, winner: swapped ? _invWinner(g.winner) : (g.winner||winner||''), map:g.map||m.map||''};
            });
            const scoreA=games.filter(g=>g.winner==='A').length;
            const scoreB=games.filter(g=>g.winner==='B').length;
            const lbl=(grp.stage||grp.name||'조별리그');
            share={
              a:A,b:B,sa:scoreA,sb:scoreB,d:md||ds,
              n:tn.name||'',_matchType:'pro',_subLabel:(tn.name?`${tn.name} · ${lbl}`:lbl),
              _noUnivIcon:false,_usePlayerPhoto:true,
              sets:[{label:lbl,scoreA,scoreB,games}]
            };
            break outerGrp;
          }
        }
      }
    }
  }catch(e){}

  if(typeof window._openShareMatchObjCard==='function') window._openShareMatchObjCard(share);
}

function openShareCardFromMatch(mode,idx){
  const _detailLikePayload = (entry) => {
    try{
      const src = entry && entry.m ? entry.m : null;
      if(!src) return null;
      const A = entry?.lA || src.a || src.wName || 'A';
      const B = entry?.lB || src.b || src.lName || 'B';
      const base = {...src, a:A, b:B, _matchType:mode};
      if((base.a||base.b) && base.sa!=null && base.sb!=null){
        return base;
      }
      if(Array.isArray(src.games) && src.games.length){
        const games = src.games.map(g=>{
          const w = g.wName || (g.winner==='A'?A:(g.winner==='B'?B:''));
          return {
            playerA: A,
            playerB: B,
            winner: w===A ? 'A' : (w===B ? 'B' : ''),
            map: g.map||''
          };
        });
        const sa = games.filter(g=>g.winner==='A').length;
        const sb = games.filter(g=>g.winner==='B').length;
        return {...base, sa, sb, sets:[{scoreA:sa, scoreB:sb, winner:sa>sb?'A':sb>sa?'B':'', games}]};
      }
      if(src.wName || src.lName){
        const w = src.wName||'';
        const sa = w===A ? 1 : 0;
        const sb = w===B ? 1 : 0;
        return {...base, sa, sb, sets:[{scoreA:sa, scoreB:sb, winner:sa>sb?'A':sb>sa?'B':'', games:[{playerA:A, playerB:B, winner:sa>sb?'A':sb>sa?'B':'', map:src.map||''}]}]};
      }
      return base;
    }catch(e){
      return entry && entry.m ? {...entry.m, _matchType:mode} : null;
    }
  };
  const _shareDefaults = (obj) => {
    const base = obj ? {...obj} : null;
    if(!base) return null;
    if(mode==='ind'){
      if(base._subLabel==null) base._subLabel='개인전';
      base._usePlayerPhoto = true;
    }else if(mode==='gj'){
      if(base._subLabel==null) base._subLabel='끝장전';
      base._usePlayerPhoto = true;
    }else if(mode==='progj'){
      if(base._subLabel==null) base._subLabel='프로리그 끝장전';
      base._usePlayerPhoto = true;
    }
    return base;
  };
  if((mode==='ind' || mode==='gj' || mode==='progj') && window._detReg){
    try{
      const vals = Object.values(window._detReg||{});
      const hit = vals.find(v => v && v.mode===mode && v.idx===idx && v.m && (v.m.a||v.m.b) && v.m.sa!=null && v.m.sb!=null);
      if(hit && typeof window._openShareMatchObjCard==='function'){
        window._openShareMatchObjCard(_shareDefaults(_detailLikePayload(hit)));
        return;
      }
    }catch(e){}
  }
  const arr=mode==='mini'?miniM
    :mode==='univm'?univM
    :mode==='ck'?ckM
    :mode==='comp'?comps
    :mode==='pro'?proM
    :mode==='ind'?(typeof indM!=='undefined'?indM:[])
    :mode==='gj'?(typeof gjM!=='undefined'?(gjM||[]).filter(x=>x && !x._proLabel):[])
    :mode==='progj'?(typeof gjM!=='undefined'?(gjM||[]).filter(x=>x && x._proLabel):[])
    :mode==='tt'?(typeof ttM!=='undefined'?ttM:[])
    :miniM;
  const m=arr[idx]||null;
  const isCKorPro=(mode==='ck'||mode==='pro');
  const isTier = (mode==='tt');
  const _miniType = mode==='mini' ? (((m&&m.type)||'mini')==='civil' ? 'civil' : 'mini') : '';
  const _matchType = isCKorPro ? mode : (isTier ? 'tt' : (mode==='univm' ? 'univm' : _miniType));
  const isTierTeamStyle = isTier && m && (
    (Array.isArray(m.teamAMembers) && m.teamAMembers.length) ||
    (Array.isArray(m.teamBMembers) && m.teamBMembers.length) ||
    (!m.a && !m.b) ||
    (String(m.a||'').trim()==='A팀' && String(m.b||'').trim()==='B팀')
  );
  window._shareMatchObj=m?_shareDefaults({...m,
    _matchType:_matchType,
    _noUnivIcon:isCKorPro || isTierTeamStyle,
    _usePlayerPhoto:isTier ? (!isTierTeamStyle) : (m._usePlayerPhoto||false),
    ...(isTierTeamStyle ? {a:'A팀', b:'B팀'} : {})
  }):null;
  _shareMode='match';
  (async()=>{
    const ok = await _ensureStatsFeatureReady();
    if(!ok) return;
    if(typeof window.openShareCardModal==='function') window.openShareCardModal();
    setTimeout(()=>{
      try{
        if(window._shareMatchObj && typeof window.renderShareCardByMatchObj==='function'){
          window.renderShareCardByMatchObj(window._shareMatchObj);
        }
      }catch(e){}
    },80);
  })();
}

try{
  window.openBoardUnivShareCard = openBoardUnivShareCard;
  window.openShareCardFromPlayer = openShareCardFromPlayer;
  window.openShareCardFromUniv = openShareCardFromUniv;
  window.openProCompMatchShare = openProCompMatchShare;
  window.openShareCardFromMatch = openShareCardFromMatch;
}catch(e){}
