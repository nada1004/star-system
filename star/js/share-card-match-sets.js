/* ══════════════════════════════════════
   Share Card Match Sets
══════════════════════════════════════ */
function __shareCardBuildSetsHTML(ctx){
  const { m, _vp, theme, _sc, _soloHero, ca, cb, _dispA, _dispB, a, b } = ctx;
  if(!(m && m.sets && m.sets.length)) return '';
  return m.sets.map((s,si)=>{
    const isAce=(si===2);
    const sLabel=s.label ? String(s.label) : (isAce?'⚡ 에이스결전':`${si+1}세트`);
    const swA=s.scoreA||0, swB=s.scoreB||0;
    const sAW=swA>swB, sBW=swB>swA;
    const gameList=(s.games||[]).filter(g=>g.playerA||g.playerB);
    const games=gameList.map((g,gi)=>{
      const aW=g.winner==='A', bW=g.winner==='B';
      const loserA=!aW&&bW?';filter:blur(1px) grayscale(.2);opacity:.6':'';
      const loserB=!bW&&aW?';filter:blur(1px) grayscale(.2);opacity:.6':'';
      const photoA=g.playerA?getPlayerPhotoHTML(g.playerA,_vp.narrow?'24px':'28px',`flex-shrink:0;border-radius:999px;box-shadow:0 0 0 1.5px rgba(255,255,255,.72);object-fit:cover;object-position:center top${loserA}`):'';
      const photoB=g.playerB?getPlayerPhotoHTML(g.playerB,_vp.narrow?'24px':'28px',`flex-shrink:0;border-radius:999px;box-shadow:0 0 0 1.5px rgba(255,255,255,.72);object-fit:cover;object-position:center top${loserB}`):'';
      const winA=aW?`<span style="background:${ca};color:#fff;padding:2px 7px;border-radius:999px;font-size:9px;font-weight:900;flex-shrink:0;letter-spacing:.2px">WIN</span>`:'';
      const winB=bW?`<span style="background:${cb};color:#fff;padding:2px 7px;border-radius:999px;font-size:9px;font-weight:900;flex-shrink:0;letter-spacing:.2px">WIN</span>`:'';
      return `<div style="display:flex;align-items:center;gap:${_vp.narrow?'4px':'6px'};padding:${_vp.narrow?'7px 8px':'8px 10px'};border:1px solid ${theme.divider};border-radius:12px;background:${_sc.mode==='dark'?'rgba(255,255,255,.05)':'rgba(255,255,255,.72)'};flex-wrap:${_vp.narrow?'wrap':'nowrap'};margin-top:${gi?6:0}px">
        <span style="color:${theme.textDim};min-width:${_vp.narrow?'34px':'42px'};font-size:10px;text-align:center;flex-shrink:0;font-weight:900;background:${_sc.mode==='dark'?'rgba(255,255,255,.08)':'rgba(15,23,42,.04)'};padding:4px 0;border-radius:999px">G${gi+1}</span>
        <div style="flex:1;display:flex;align-items:center;justify-content:flex-end;gap:4px;min-width:0;${aW?'':'opacity:.6'}">
          ${winA}
          <span style="font-weight:${aW?'900':'600'};color:${aW?theme.text:theme.textDim};font-size:${_vp.narrow?'11.5px':'12.5px'};white-space:${_vp.tiny?'normal':'nowrap'};overflow:hidden;text-overflow:ellipsis;word-break:keep-all">${g.playerA||'?'}</span>
          ${photoA}
        </div>
        <span style="color:${theme.textDim};font-size:10px;flex-shrink:0;font-weight:900">vs</span>
        <div style="flex:1;display:flex;align-items:center;gap:4px;min-width:0;${bW?'':'opacity:.6'}">
          ${photoB}
          <span style="font-weight:${bW?'900':'600'};color:${bW?theme.text:theme.textDim};font-size:${_vp.narrow?'11.5px':'12.5px'};white-space:${_vp.tiny?'normal':'nowrap'};overflow:hidden;text-overflow:ellipsis;word-break:keep-all">${g.playerB||'?'}</span>
          ${winB}
        </div>
        ${g.map?`<span style="color:${theme.textDim};font-size:10px;flex-shrink:0;max-width:${_vp.narrow?'100%':'110px'};overflow:hidden;text-overflow:ellipsis;white-space:nowrap;background:${_sc.mode==='dark'?'rgba(255,255,255,.08)':'rgba(255,255,255,.78)'};border:1px solid ${theme.divider};padding:2px 7px;border-radius:999px;margin-left:${_vp.narrow?'34px':'0'}">📍${g.map}</span>`:''}
      </div>`;
    }).join('');
    const setBorder=isAce?`${theme.accentDark}30`:theme.divider;
    return `<div style="background:${_soloHero ? (_sc.mode==='minimal'?'#ffffff':_sc.mode==='dark'?'rgba(255,255,255,.06)':_sc.mode==='glass'?'rgba(255,255,255,.78)':'linear-gradient(180deg, rgba(255,255,255,.98), rgba(248,250,252,.96))') : (_sc.mode==='dark'?'rgba(255,255,255,.06)':'linear-gradient(180deg, rgba(255,255,255,.95), rgba(248,250,252,.92))')};border:1px solid ${setBorder};border-radius:${_soloHero?'16px':'14px'};padding:${_soloHero?'12px 14px':'11px 12px'};margin-bottom:${_soloHero?'10px':'9px'};box-shadow:${_soloHero?'0 10px 24px rgba(15,23,42,.08)':'0 8px 18px rgba(15,23,42,.05)'}">
      <div style="display:flex;align-items:center;justify-content:center;gap:${_soloHero?'8px':'6px'};flex-wrap:wrap;margin-bottom:${gameList.length?(_soloHero?'9':'7'):'0'}px">
        <span style="font-size:${_soloHero?'10px':'11px'};font-weight:900;color:${isAce?theme.accentDark:theme.textDim};letter-spacing:.4px;min-width:${_soloHero?'70px':'60px'};text-align:center;background:${_soloHero?'rgba(255,255,255,.85)':'rgba(15,23,42,.04)'};border:1px solid ${theme.divider};padding:${_soloHero?'3px 10px':'3px 9px'};border-radius:999px">${sLabel}</span>
        <span style="font-weight:900;background:${sAW?ca:'rgba(255,255,255,.85)'};${sAW?'':'border:1px solid '+theme.divider};color:${sAW?'#fff':theme.textDim};padding:${_soloHero?'4px 12px':'2px 10px'};border-radius:${_soloHero?'999px':'6px'};font-size:${_soloHero?'11px':'12px'};text-align:center;box-shadow:${sAW&&_soloHero?'0 6px 14px '+ca+'33':'none'}">${_dispA}</span>
        <span style="font-weight:900;font-size:${_soloHero?'18px':'16px'};letter-spacing:${_soloHero?'1px':'2px'};min-width:${_soloHero?'58px':'48px'};text-align:center">
          <span style="color:${sAW?ca:theme.textDim}">${swA}</span>
          <span style="color:${theme.textDim};font-size:12px;margin:0 4px">:</span>
          <span style="color:${sBW?cb:theme.textDim}">${swB}</span>
        </span>
        <span style="font-weight:900;background:${sBW?cb:'rgba(255,255,255,.85)'};${sBW?'':'border:1px solid '+theme.divider};color:${sBW?'#fff':theme.textDim};padding:${_soloHero?'4px 12px':'2px 10px'};border-radius:${_soloHero?'999px':'6px'};font-size:${_soloHero?'11px':'12px'};text-align:center;box-shadow:${sBW&&_soloHero?'0 6px 14px '+cb+'33':'none'}">${_dispB}</span>
        <span style="font-size:${_soloHero?'10px':'11px'};color:${theme.textDim};white-space:nowrap;font-weight:800;background:${_soloHero?'rgba(15,23,42,.04)':'transparent'};padding:${_soloHero?'3px 9px':'0'};border-radius:${_soloHero?'999px':'0'}">${sAW?'▶ '+a:sBW?'▶ '+b:'무승부'}</span>
      </div>
      ${games}
    </div>`;
  }).join('');
}

try{
  window.__shareCardBuildSetsHTML = __shareCardBuildSetsHTML;
}catch(e){}
