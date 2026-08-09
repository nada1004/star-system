/* ══════════════════════════════════════════════════════════════
   렌더캡처 - 포스터/미니멀 스타일 빌더 (render-capture-utils.js 에서 분리, 2026-07-30)
   ══════════════════════════════════════════════════════════════ */

function _posterAccentColor(ctx){
  try{
    const univ = ctx && ctx.mvp && ctx.mvp.p ? ctx.mvp.p.univ : '';
    if(univ && univ!=='무소속' && typeof gc==='function'){
      const c = gc(univ);
      if(c) return c;
    }
  }catch(e){}
  return '#3b82f6';
}

function _posterCss(){
  return `
  .bp-sheet{width:1000px;box-sizing:border-box;background:radial-gradient(circle at 26% 0%,#1e293b 0%,#0b0f1a 48%,#05070c 100%);color:#fff;font-family:"Noto Sans KR",sans-serif;position:relative;padding:70px 64px 56px}
  .bp-sheet *,.bp-sheet *::before,.bp-sheet *::after{box-sizing:border-box}
  .bp-tag{font-size:14px;font-weight:900;letter-spacing:.16em;color:#fbbf24;margin-bottom:18px}
  .bp-headline{font-size:44px;font-weight:950;line-height:1.25;margin-bottom:26px;max-width:820px}
  .bp-period{font-size:13px;color:rgba(255,255,255,.55);font-weight:700;margin-bottom:48px}
  .bp-mvp-row{display:flex;align-items:stretch;gap:34px;margin-bottom:48px}
  .bp-mvp-photo{width:260px;height:340px;border-radius:28px;overflow:hidden;position:relative;flex-shrink:0;background:#1e293b;display:flex;align-items:center;justify-content:center;box-shadow:0 20px 50px rgba(0,0,0,.4)}
  .bp-mvp-photo img{width:100%;height:100%;object-fit:cover}
  .bp-mvp-photo-fallback{font-size:80px;font-weight:900;color:rgba(255,255,255,.5)}
  .bp-mvp-photo-univ{position:absolute;left:14px;bottom:14px;display:inline-flex;align-items:center;gap:6px;max-width:calc(100% - 28px);background:rgba(5,7,12,.62);backdrop-filter:blur(4px);border-radius:999px;padding:6px 12px 6px 8px;font-size:12px;font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .bp-mvp-photo-univ img,.bp-mvp-photo-univ svg{width:16px;height:16px;flex-shrink:0}
  .bp-mvp-info{display:flex;flex-direction:column;justify-content:center;min-width:0}
  .bp-mvp-info b{display:block;font-size:13px;font-weight:900;color:#fbbf24;margin-bottom:8px}
  .bp-mvp-name{font-size:40px;font-weight:950;margin-bottom:16px;line-height:1.15}
  .bp-mvp-stats{display:flex;gap:10px;flex-wrap:wrap}
  .bp-mvp-stat{background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.14);border-radius:14px;padding:12px 18px;min-width:68px;text-align:center}
  .bp-mvp-stat b{display:block;font-size:22px;font-weight:950;color:#fff;margin-bottom:2px}
  .bp-mvp-stat i{font-size:10px;font-weight:700;color:rgba(255,255,255,.55);font-style:normal}
  .bp-kpi-row{display:flex;gap:16px;margin-bottom:44px}
  .bp-kpi{flex:1;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);border-radius:18px;padding:22px 18px;text-align:center}
  .bp-kpi b{display:block;font-size:34px;font-weight:950}
  .bp-kpi i{font-size:12px;font-weight:700;color:rgba(255,255,255,.55);font-style:normal}
  .bp-section-title{font-size:14px;font-weight:900;color:#fbbf24;margin-bottom:16px;letter-spacing:.06em}
  .bp-hl-list{display:flex;flex-direction:column;gap:8px;margin-bottom:44px}
  .bp-hl-row{display:flex;align-items:center;gap:12px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);border-radius:12px;padding:12px 16px}
  .bp-hl-tag{font-size:11px;font-weight:900;color:#0b0f1a;background:#fbbf24;border-radius:8px;padding:4px 9px;white-space:nowrap;flex-shrink:0}
  .bp-hl-name{font-weight:800;font-size:14px}
  .bp-hl-univ{font-size:11px;color:rgba(255,255,255,.5)}
  .bp-hl-rec{margin-left:auto;font-size:12px;font-weight:800;color:rgba(255,255,255,.8);white-space:nowrap}
  .bp-standings-title{font-size:14px;font-weight:900;color:#fbbf24;margin-bottom:16px;letter-spacing:.06em}
  .bp-st-row{display:flex;align-items:center;gap:14px;padding:13px 0;border-bottom:1px solid rgba(255,255,255,.1)}
  .bp-st-rank{font-size:20px;font-weight:950;width:34px;color:rgba(255,255,255,.4)}
  .bp-st-rank.top{color:#fbbf24}
  .bp-st-name{font-size:17px;font-weight:800;flex:1;display:flex;align-items:center;gap:8px;min-width:0}
  .bp-st-name img,.bp-st-name svg{width:18px;height:18px;flex-shrink:0}
  .bp-st-rec{font-size:13px;color:rgba(255,255,255,.55)}
  .bp-st-wr{font-size:17px;font-weight:950;width:56px;text-align:right}
  .bp-footer{margin-top:44px;padding-top:16px;display:flex;justify-content:space-between;font-size:11px;color:rgba(255,255,255,.4);font-weight:700;border-top:1px solid rgba(255,255,255,.12)}
  `;
}
function _posterBuildHtml(ctx, meta){
  const headline=(typeof _newsHeadline==='function')?_newsHeadline(ctx):((ctx.briefingInfo&&ctx.briefingInfo.title)||'브리핑');
  const mvp=ctx.mvp;
  const mvpUniv=mvp&&mvp.p?(mvp.p.univ||''):'';
  const photo=mvp&&mvp.p?_newsPhotoUrl(mvp.p):'';
  const initial=mvp&&mvp.p?String(mvp.p.name||'-').trim().slice(0,1):'?';
  const streak=(mvp&&mvp.hist&&typeof _b2CalcStreak==='function')?_b2CalcStreak(mvp.hist,'승'):0;
  const univLogo=(mvpUniv&&mvpUniv!=='무소속'&&typeof gUI==='function')?gUI(mvpUniv,'16px'):'';
  const accent=_posterAccentColor(ctx);
  const deep=(typeof _darkenHex==='function')?_darkenHex(accent,.82):'#05070c';
  const bgStyle=`background:radial-gradient(circle at 26% 0%,${accent} 0%,${deep} 46%,#05070c 100%)`;
  const hlItems=[
    ['연승가도',ctx.streakPlayer, ctx.streakPlayer?`${ctx.streakPlayer.streak}연승`:''],
    ['최다승',ctx.mostWinsPlayer,''],
    ['급상승',ctx.hotPlayer, ctx.hotPlayer&&ctx.hotPlayer.wrDelta>0?`▲${ctx.hotPlayer.wrDelta}%p`:''],
    ['최고승률',ctx.bestWrPlayer,'']
  ].filter(([,s])=>s&&s.p);
  const standings=(ctx.rankedUnivs&&ctx.rankedUnivs.length?ctx.rankedUnivs:ctx.topUnivs)||[];
  return `<div class="bp-sheet" style="${bgStyle}">
    <div class="bp-tag">WEEKLY BRIEFING</div>
    <div class="bp-headline">${headline}</div>
    <div class="bp-period">${_esc(meta.presetLabel)} · ${_esc(meta.from)} ~ ${_esc(meta.to)} · ${_esc(meta.univ)}</div>
    <div class="bp-mvp-row">
      <div class="bp-mvp-photo">${photo?`<img src="${photo}" alt="">`:`<span class="bp-mvp-photo-fallback">${_esc(initial)}</span>`}${mvpUniv?`<span class="bp-mvp-photo-univ">${univLogo}${_esc(mvpUniv)}</span>`:''}</div>
      <div class="bp-mvp-info">
        <b>🏆 ${_esc(ctx.mvpLabel||'MVP')}</b>
        <div class="bp-mvp-name">${mvp&&mvp.p?_esc(mvp.p.name):'-'}</div>
        <div class="bp-mvp-stats">
          <div class="bp-mvp-stat"><b>${mvp?mvp.wins??0:0}</b><i>승</i></div>
          <div class="bp-mvp-stat"><b>${mvp?mvp.losses??0:0}</b><i>패</i></div>
          <div class="bp-mvp-stat"><b>${mvp?mvp.winRate??0:0}%</b><i>승률</i></div>
          ${streak>=2?`<div class="bp-mvp-stat"><b>${streak}</b><i>연승</i></div>`:''}
        </div>
      </div>
    </div>
    <div class="bp-kpi-row">
      <div class="bp-kpi"><b>${ctx.totalGames||0}</b><i>총 경기수</i></div>
      <div class="bp-kpi"><b>${ctx.activeUnivs||0}</b><i>활동 대학</i></div>
      <div class="bp-kpi"><b>${ctx.activePlayerCount||0}</b><i>활동 선수</i></div>
    </div>
    <div class="bp-section-title">⚡ 이 주의 기록</div>
    <div class="bp-hl-list">
      ${hlItems.map(([label,s,extra])=>`<div class="bp-hl-row"><span class="bp-hl-tag">${_esc(label)}</span><span class="bp-hl-name">${_esc(s.p.name)}</span><span class="bp-hl-univ">${_esc(s.p.univ||'무소속')}</span><span class="bp-hl-rec">${extra?_esc(extra)+' · ':''}${s.wins??0}승 ${s.losses??0}패</span></div>`).join('') || '<div class="bp-hl-row">집계된 기록이 없습니다</div>'}
    </div>
    <div class="bp-standings-title">🏫 대학 순위</div>
    ${standings.slice(0,5).map((ud,idx)=>{const rank=ud.rank||(idx+1);const uLogo=(typeof gUI==='function')?gUI(ud.u.name,'18px'):'';return `<div class="bp-st-row"><span class="bp-st-rank ${rank<=3?'top':''}">${rank}</span><span class="bp-st-name">${uLogo}${_esc(ud.u.name)}</span><span class="bp-st-rec">${ud.tw}승 ${ud.tl}패</span><span class="bp-st-wr">${ud.wr??0}%</span></div>`;}).join('') || '<div class="bp-st-row">집계된 대학 활동이 없습니다</div>'}
    <div class="bp-footer"><span>STAR DATACENTER</span><span>발행 ${_esc(meta.issueDateFull)}</span></div>
  </div>`;
}

function _minimalCss(){
  return `
  .bm-sheet{width:860px;box-sizing:border-box;background:#ffffff;color:#18181b;font-family:"Noto Sans KR",sans-serif;padding:54px 58px 46px}
  .bm-sheet *,.bm-sheet *::before,.bm-sheet *::after{box-sizing:border-box}
  .bm-head{display:flex;justify-content:space-between;align-items:baseline;padding-bottom:14px;border-bottom:1px solid #18181b;margin-bottom:28px}
  .bm-title{font-size:20px;font-weight:900;letter-spacing:-.01em}
  .bm-period{font-size:12px;color:#71717a;font-weight:600}
  .bm-mvp{display:flex;align-items:center;gap:16px;padding:18px 0;border-bottom:1px solid #e4e4e7;margin-bottom:22px}
  .bm-mvp-photo{width:104px;height:104px;border-radius:14px;overflow:hidden;background:#f4f4f5;display:flex;align-items:center;justify-content:center;flex-shrink:0}
  .bm-mvp-photo img{width:100%;height:100%;object-fit:cover}
  .bm-mvp-photo-fallback{font-size:38px;font-weight:800;color:#a1a1aa}
  .bm-mvp-label{font-size:10px;font-weight:800;color:#71717a;text-transform:uppercase;letter-spacing:.06em;margin-bottom:3px}
  .bm-mvp-name{font-size:18px;font-weight:900}
  .bm-mvp-sub{font-size:12px;color:#71717a;font-weight:600;display:flex;align-items:center;gap:4px}
  .bm-mvp-rec{margin-left:auto;font-size:13px;font-weight:800;text-align:right}
  .bm-sec-title{font-size:12px;font-weight:800;color:#71717a;text-transform:uppercase;letter-spacing:.06em;margin:22px 0 10px}
  .bm-row{display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid #f4f4f5;font-size:13px}
  .bm-row-tag{font-size:10px;font-weight:800;color:#3f3f46;background:#f4f4f5;border-radius:5px;padding:3px 8px}
  .bm-row-name{font-weight:800}
  .bm-row-univ{color:#a1a1aa;font-size:11px}
  .bm-row-rec{margin-left:auto;color:#52525b}
  .bm-st-row{display:flex;align-items:center;gap:10px;padding:7px 0;font-size:13px;border-bottom:1px solid #f4f4f5}
  .bm-st-rank{width:18px;font-weight:900;color:#a1a1aa}
  .bm-st-name{font-weight:800;flex:1}
  .bm-st-rec{color:#71717a;font-size:12px}
  .bm-st-wr{font-weight:900;width:42px;text-align:right}
  .bm-footer{margin-top:24px;padding-top:14px;border-top:1px solid #18181b;font-size:10px;color:#a1a1aa;font-weight:700;text-align:right}
  `;
}
function _minimalBuildHtml(ctx, meta){
  const mvp=ctx.mvp;
  const mvpUniv=mvp&&mvp.p?(mvp.p.univ||''):'';
  const photo=mvp&&mvp.p?_newsPhotoUrl(mvp.p):'';
  const initial=mvp&&mvp.p?String(mvp.p.name||'-').trim().slice(0,1):'?';
  const univLogo=(mvpUniv&&mvpUniv!=='무소속'&&typeof gUI==='function')?gUI(mvpUniv,'13px'):'';
  const hlItems=[
    ['연승',ctx.streakPlayer, ctx.streakPlayer?`${ctx.streakPlayer.streak}연승`:''],
    ['최다승',ctx.mostWinsPlayer,''],
    ['급상승',ctx.hotPlayer, ctx.hotPlayer&&ctx.hotPlayer.wrDelta>0?`▲${ctx.hotPlayer.wrDelta}%p`:''],
    ['최고승률',ctx.bestWrPlayer,''],
    ['하락세',ctx.coldPlayer, ctx.coldPlayer&&ctx.coldPlayer.wrDelta<0?`▼${Math.abs(ctx.coldPlayer.wrDelta)}%p`:'']
  ].filter(([,s])=>s&&s.p);
  const standings=(ctx.rankedUnivs&&ctx.rankedUnivs.length?ctx.rankedUnivs:ctx.topUnivs)||[];
  return `<div class="bm-sheet">
    <div class="bm-head"><span class="bm-title">${_esc((ctx.briefingInfo&&ctx.briefingInfo.title)||'브리핑')}</span><span class="bm-period">${_esc(meta.presetLabel)} · ${_esc(meta.from)} ~ ${_esc(meta.to)} · ${_esc(meta.univ)}</span></div>
    <div class="bm-mvp">
      <div class="bm-mvp-photo">${photo?`<img src="${photo}" alt="">`:`<span class="bm-mvp-photo-fallback">${_esc(initial)}</span>`}</div>
      <div>
        <div class="bm-mvp-label">${_esc(ctx.mvpLabel||'MVP')}</div>
        <div class="bm-mvp-name">${mvp&&mvp.p?_esc(mvp.p.name):'-'}</div>
        <div class="bm-mvp-sub">${univLogo}${mvp&&mvp.p?_esc(mvpUniv||'무소속'):''}</div>
      </div>
      <div class="bm-mvp-rec">${mvp?mvp.wins??0:0}승 ${mvp?mvp.losses??0:0}패<br>승률 ${mvp?mvp.winRate??0:0}%</div>
    </div>
    <div class="bm-sec-title">이 주의 기록</div>
    ${hlItems.map(([label,s,extra])=>`<div class="bm-row"><span class="bm-row-tag">${_esc(label)}</span><span class="bm-row-name">${_esc(s.p.name)}</span><span class="bm-row-univ">${_esc(s.p.univ||'무소속')}</span><span class="bm-row-rec">${extra?_esc(extra)+' · ':''}${s.wins??0}승 ${s.losses??0}패</span></div>`).join('') || '<div class="bm-row">집계된 기록이 없습니다</div>'}
    <div class="bm-sec-title">대학 순위</div>
    ${standings.slice(0,10).map((ud,idx)=>`<div class="bm-st-row"><span class="bm-st-rank">${ud.rank||(idx+1)}</span><span class="bm-st-name">${_esc(ud.u.name)}</span><span class="bm-st-rec">${ud.tw}승 ${ud.tl}패</span><span class="bm-st-wr">${ud.wr??0}%</span></div>`).join('') || '<div class="bm-st-row">집계된 대학 활동이 없습니다</div>'}
    <div class="bm-footer">STAR DATACENTER · 발행 ${_esc(meta.issueDateFull)}</div>
  </div>`;
}

