/* ══════════════════════════════════════
   Render Capture Utilities
══════════════════════════════════════ */
function _showSaveLoading(){
  let t=document.getElementById('_save-toast');
  if(!t){
    t=document.createElement('div');
    t.id='_save-toast';
    t.style.cssText='position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:rgba(15,23,42,.88);color:#fff;padding:10px 22px;border-radius:24px;font-size:13px;font-weight:700;z-index:99999;display:none;align-items:center;gap:8px;backdrop-filter:blur(6px);font-family:"Noto Sans KR",sans-serif;white-space:nowrap;box-shadow:0 4px 20px rgba(0,0,0,.3)';
    document.body.appendChild(t);
  }
  t.innerHTML='<span style="display:inline-block;animation:_spin .8s linear infinite">⏳</span> 저장 중...';
  t.style.display='flex';
  if(!document.getElementById('_spin-style')){
    const s=document.createElement('style');s.id='_spin-style';
    s.textContent='@keyframes _spin{to{transform:rotate(360deg)}}';
    document.head.appendChild(s);
  }
}
function _hideSaveLoading(){
  const t=document.getElementById('_save-toast');
  if(t) t.style.display='none';
}

async function capturePlayerModal(){
  const body=document.getElementById('playerModalBody');
  if(!body){alert('캡처할 영역이 없습니다.');return;}
  const st = (typeof getPlayerDetailState==='function') ? getPlayerDetailState() : (window.PlayerDetailState||{});
  try{
    _showSaveLoading();
    try{ await (window.ensureHtml2Canvas && window.ensureHtml2Canvas()); }catch(e){}
    await _imgToDataUrls(body);
    try{ if(typeof _waitForImages==='function') await _waitForImages(body,1500); }catch(e){}
    const canvas=await html2canvas(body,{backgroundColor:'#ffffff',scale:2,useCORS:true,allowTaint:false,logging:false,imageTimeout:15000});
    await _saveCanvasImage(canvas,`${st.currentName||'player'}_stat.png`,'png');
  }catch(e){alert('이미지 저장 오류: '+e.message);}
  finally{_hideSaveLoading();}
}

async function captureUnivModal(){
  const body=document.getElementById('univModalBody');
  const title=document.getElementById('univModalTitle');
  if(!body){alert('캡처할 영역이 없습니다.');return;}
  try{
    _showSaveLoading();
    try{ await (window.ensureHtml2Canvas && window.ensureHtml2Canvas()); }catch(e){}
    await _imgToDataUrls(body);
    try{ if(typeof _waitForImages==='function') await _waitForImages(body,1500); }catch(e){}
    const canvas=await html2canvas(body,{backgroundColor:'#ffffff',scale:2,useCORS:true,allowTaint:false,logging:false,imageTimeout:15000});
    await _saveCanvasImage(canvas,`${title?title.innerText.replace('🏛️ ',''):'univ'}_대학정보.png`,'png');
  }catch(e){alert('이미지 저장 오류: '+e.message);}
  finally{_hideSaveLoading();}
}

async function captureDetail(id, filename){
  const el=document.getElementById(id);
  if(!el){alert('캡처할 영역이 없습니다.');return;}
  try{
    _showSaveLoading();
    try{ await (window.ensureHtml2Canvas && window.ensureHtml2Canvas()); }catch(e){}
    await _imgToDataUrls(el);
    try{ if(typeof _waitForImages==='function') await _waitForImages(el,1500); }catch(e){}
    const canvas=await html2canvas(el,{backgroundColor:'#ffffff',scale:2,useCORS:true,allowTaint:false,logging:false,imageTimeout:15000});
    await _saveCanvasImage(canvas,`경기상세_${filename}.png`,'png');
  }catch(e){alert('이미지 저장 오류: '+e.message);}
  finally{_hideSaveLoading();}
}

function _getBriefingExportMeta(){
  const presetMap={
    thisWeek:'이번주',
    lastWeek:'지난주',
    thisMonth:'이번달',
    lastMonth:'지난달',
    custom:'기간'
  };
  const _now=new Date();
  const issueDate=_now.toISOString().slice(0,10).replace(/-/g,'.');
  const _weekdayKr=['일','월','화','수','목','금','토'][_now.getDay()];
  const issueDateFull=`${issueDate} (${_weekdayKr})`;
  const presetKey=String(window._b2WeeklyPreset||'thisWeek');
  const presetLabel=presetMap[presetKey]||'브리핑';
  const from=String(window._b2WeeklyDateFrom||'').slice(0,10).replace(/-/g,'.');
  const to=String(window._b2WeeklyDateTo||'').slice(0,10).replace(/-/g,'.');
  const univ=String(window._b2WeeklyUniv||'전체').trim()||'전체';
  return { issueDate, issueDateFull, presetKey, presetLabel, from, to, univ };
}

function _sanitizeUnsupportedCssFunctions(root){
  if(!root || typeof root.querySelectorAll!=='function') return;
  // html2canvas가 못 읽는 color-mix()/color() 함수만 안전한 대체색으로 치환한다.
  // (이전에는 해당 함수가 포함된 선언 전체를 지워버려서, 예를 들어 .b2w2-kpi-card의
  //  background 전체가 사라져 카드 배경이 화면과 다르게 밋밋해지는 문제가 있었음)
  const scrub=(text)=>{
    return String(text||'')
      // color-mix(in srgb, A 7%, B) → B (혼합 결과와 가장 가까운 마지막 색상으로 대체)
      .replace(/color-mix\(\s*in\s+[a-z0-9-]+\s*,\s*[^,]+,\s*([^)]+)\)/gi, (m, fallback) => fallback.trim())
      // color(display-p3 ...) 같은 미지원 색상 함수 → 무난한 회색으로 대체 (전체 삭제 대신)
      .replace(/\bcolor\(\s*[a-z0-9-]+[^)]*\)/gi, '#94a3b8');
  };
  try{
    root.querySelectorAll('[style]').forEach((el)=>{
      const raw=el.getAttribute('style')||'';
      const cleaned=scrub(raw);
      if(cleaned!==raw) el.setAttribute('style', cleaned);
    });
  }catch(e){}
  try{
    root.querySelectorAll('style').forEach((el)=>{
      const raw=el.textContent||'';
      const cleaned=scrub(raw);
      if(cleaned!==raw) el.textContent=cleaned;
    });
  }catch(e){}
}

/* ══════════════════════════════════════
   "저장(1장)" 전용 — 스포츠신문 스타일 단독 렌더링
   화면에 보이는 브리핑 레이아웃을 그대로 캡처하는 대신,
   window._b2BriefingExportCtx(board2-briefing.js에서 저장해둔 통계 스냅샷)를
   바탕으로 완전히 새로운 신문 1면 레이아웃을 만들어 캡처한다.
══════════════════════════════════════ */
function _esc(v){
  try{ return typeof esc==='function' ? esc(v) : String(v==null?'':v).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
  catch(e){ return String(v==null?'':v); }
}
function _newsPhotoUrl(p){
  try{ return p && p.photo ? (typeof toHttpsUrl==='function' ? toHttpsUrl(p.photo) : p.photo) : ''; }
  catch(e){ return ''; }
}
function _newsRankDeltaBadge(rankDelta){
  if(rankDelta===null || rankDelta===undefined) return '<span class="b2n-rd new">신규</span>';
  if(rankDelta>0) return `<span class="b2n-rd up">▲${rankDelta}</span>`;
  if(rankDelta<0) return `<span class="b2n-rd down">▼${Math.abs(rankDelta)}</span>`;
  return '<span class="b2n-rd same">-</span>';
}
function _newsHeadline(ctx){
  const info = ctx.briefingInfo || {};
  const leader = (ctx.isMonthly && ctx.rankedUnivs && ctx.rankedUnivs[0]) ? ctx.rankedUnivs[0] : null;
  const topUniv = (ctx.topUnivs && ctx.topUnivs[0]) || null;
  const mvpName = ctx.mvp && ctx.mvp.p ? ctx.mvp.p.name : null;
  if(leader){
    return `${_esc(leader.u.name)}, ${info.short||''} 선두 질주! ${leader.tw}승 ${leader.tl}패 · 승률 ${leader.wr??0}%`;
  }
  if(topUniv){
    return `${_esc(topUniv.u.name)}, ${info.short||''} 최다 출전 화력 과시!`;
  }
  if(mvpName){
    return `${_esc(mvpName)}, ${info.short||''} 최고의 활약 펼쳐`;
  }
  return `${info.title||'브리핑'} 주요 소식`;
}
function _newsWorstLabel(ctx){
  const map={ thisWeek:'이번주의 아쉬움', lastWeek:'지난주의 아쉬움', thisMonth:'이번달의 아쉬움', lastMonth:'지난달의 아쉬움', custom:'이 기간의 아쉬움' };
  return map[ctx && ctx.preset] || '오늘의 아쉬움';
}
function _newsAnalysisParagraph(ctx){
  const periodWord = ctx.isMonthly ? '한 달' : '한 주';
  const sentences=[];
  if(ctx.totalGames){
    sentences.push(`이번 ${periodWord} 동안 총 <b>${ctx.totalGames}경기</b>가 열렸고, <b>${ctx.activeUnivs}개 대학</b>이 활동을 이어갔습니다.`);
  }
  if(ctx.mvp && ctx.mvp.p){
    sentences.push(`<b>${_esc(ctx.mvp.p.name)}</b>(${_esc(ctx.mvp.p.univ||'무소속')}) 선수가 ${ctx.mvp.wins ?? 0}승 ${ctx.mvp.losses ?? 0}패, 승률 ${ctx.mvp.winRate ?? 0}%로 ${_esc(ctx.mvpLabel||'MVP')}에 올랐습니다.`);
  }
  if(ctx.topUnivs && ctx.topUnivs[0]){
    const tu=ctx.topUnivs[0];
    sentences.push(`대학 중에서는 <b>${_esc(tu.u.name)}</b>이 ${tu.tg}전으로 가장 많은 경기를 치르며 가장 활발한 움직임을 보였습니다.`);
  }
  if(ctx.hotPlayer && ctx.hotPlayer.p && ctx.hotPlayer.wrDelta>0){
    sentences.push(`<b>${_esc(ctx.hotPlayer.p.name)}</b> 선수는 승률이 전 기간 대비 ▲${ctx.hotPlayer.wrDelta}%p 오르며 뚜렷한 상승세를 탔습니다.`);
  }
  if(ctx.streakPlayer && ctx.streakPlayer.p){
    sentences.push(`<b>${_esc(ctx.streakPlayer.p.name)}</b> 선수는 ${ctx.streakPlayer.streak}연승 행진을 이어가는 중입니다.`);
  }
  if(ctx.coldPlayer && ctx.coldPlayer.p){
    sentences.push(`반면 <b>${_esc(ctx.coldPlayer.p.name)}</b> 선수는 승률이 ${ctx.coldPlayer.wrDelta}%p 떨어지며 다소 아쉬운 흐름을 보였습니다.`);
  }
  if(ctx.silentUnivs && ctx.silentUnivs.length){
    const list=ctx.silentUnivs.slice(0,5).map(_esc).join(', ');
    sentences.push(`${list}${ctx.silentUnivs.length>5?' 등':''}은 이번 ${periodWord} 동안 별다른 경기 활동이 없었습니다.`);
  }
  return sentences.join(' ');
}
function _newsStatRow(label, s, extra){
  if(!s || !s.p) return '';
  const p=s.p;
  return `<div class="b2n-row">
    <div class="b2n-row-tag">${_esc(label)}</div>
    <div class="b2n-row-body">
      <b>${_esc(p.name||'-')}</b><span class="b2n-row-univ">${_esc(p.univ||'무소속')}</span>
      <span class="b2n-row-stat">${s.wins ?? 0}승 ${s.losses ?? 0}패</span>
      <span class="b2n-row-wr">승률 ${s.winRate ?? 0}%</span>
      ${extra?`<span class="b2n-row-extra">${extra}</span>`:''}
    </div>
  </div>`;
}
function _newsMvpFeatureHtml(ctx){
  const s = ctx.mvp;
  if(!s || !s.p) return `<div class="b2n-feature b2n-feature-empty">이번 기간에는 MVP 조건을 충족한 선수가 없습니다.</div>`;
  const p=s.p;
  const photo=_newsPhotoUrl(p);
  const initial=String(p.name||'-').trim().slice(0,1);
  // 승패·연승 기록이 승률보다 우선 노출되도록: 승/패는 크게, 연승은 있으면 함께,
  // 승률은 참고 수치로 작게 붙임 (뉴스 기사는 "몇 승 몇 패"가 먼저 눈에 들어와야 함)
  const mvpStreak = (s.hist && typeof _b2CalcStreak==='function') ? _b2CalcStreak(s.hist, '승') : 0;
  return `<div class="b2n-feature">
    <div class="b2n-feature-photo">
      ${photo?`<img src="${photo}" alt="${_esc(p.name)}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`:''}
      <div class="b2n-feature-fallback" style="${photo?'display:none':''}">${_esc(initial)}</div>
      <div class="b2n-feature-ribbon">🏆 ${_esc(ctx.mvpLabel||'MVP')}</div>
    </div>
    <div class="b2n-feature-body">
      <div class="b2n-feature-name">${_esc(p.name||'-')}</div>
      <div class="b2n-feature-univ">${_esc(p.univ||'무소속')}${p.tier?` · ${_esc(p.tier)}`:''}</div>
      <div class="b2n-feature-stats">
        <div class="b2n-fstat"><b>${s.wins ?? 0}</b><i>승</i></div>
        <div class="b2n-fstat"><b>${s.losses ?? 0}</b><i>패</i></div>
        ${mvpStreak>=2?`<div class="b2n-fstat b2n-fstat-streak"><b>${mvpStreak}</b><i>연승</i></div>`:''}
        <div class="b2n-fstat b2n-fstat-sub"><b>${s.winRate ?? 0}%</b><i>승률</i></div>
      </div>
    </div>
  </div>
  ${_newsStatRow('MVP 2위', ctx.mvp2, '')}`;
}
function _newsStandingsHtml(ctx){
  const list = (ctx.rankedUnivs && ctx.rankedUnivs.length ? ctx.rankedUnivs : ctx.topUnivs) || [];
  if(!list.length) return `<div class="b2n-empty">집계된 대학 활동이 없습니다.</div>`;
  const rows = list.slice(0, ctx.isMonthly?7:5).map((ud, idx)=>{
    const rank = ud.rank || (idx+1);
    const rankCls = rank===1?' r1':rank===2?' r2':rank===3?' r3':'';
    return `<div class="b2n-stline">
      <span class="b2n-stline-rank${rankCls}">${rank}</span>
      <span class="b2n-stline-name">${_esc(ud.u.name)}</span>
      <span class="b2n-stline-rec">${ud.tw}승 ${ud.tl}패</span>
      <span class="b2n-stline-wr">${ud.wr??0}%</span>
      ${_newsRankDeltaBadge(ud.rankDelta)}
    </div>`;
  }).join('');
  return `<div class="b2n-standings">${rows}</div>`;
}
function _newsHighlightRows(ctx){
  const rows = [
    _newsStatRow('연승가도', ctx.streakPlayer, ctx.streakPlayer ? `${ctx.streakPlayer.streak}연승` : ''),
    _newsStatRow('연패탈출 시급', ctx.loseStreakPlayer, ctx.loseStreakPlayer ? `${ctx.loseStreakPlayer.streak}연패` : ''),
    _newsStatRow('최다승', ctx.mostWinsPlayer, ''),
    _newsStatRow('최다출전', ctx.mostActivePlayer, `${ctx.mostActivePlayer?ctx.mostActivePlayer.total:0}전`),
    _newsStatRow('급상승', ctx.hotPlayer, ctx.hotPlayer && ctx.hotPlayer.wrDelta>0 ? `승률 ▲${ctx.hotPlayer.wrDelta}%p` : ''),
    _newsStatRow('최고 승률', ctx.bestWrPlayer, ''),
    _newsStatRow('하락세', ctx.coldPlayer, ctx.coldPlayer && ctx.coldPlayer.wrDelta<0 ? `승률 ▼${Math.abs(ctx.coldPlayer.wrDelta)}%p` : '')
  ].filter(Boolean).join('');
  return rows || `<div class="b2n-empty">집계된 기록이 없습니다.</div>`;
}
function _newsTopPlayersHtml(ctx){
  const list = (ctx.monthlyTopPlayers||[]).filter(s=>s && s.p).slice(0,5);
  if(!list.length) return '';
  const rows = list.map((s, idx)=>{
    const p=s.p;
    const rank=idx+1;
    const rankCls = rank===1?' r1':rank===2?' r2':rank===3?' r3':'';
    return `<div class="b2n-stline">
      <span class="b2n-stline-rank${rankCls}">${rank}</span>
      <span class="b2n-stline-name">${_esc(p.name||'-')} <span style="font-weight:600;color:#9ca3af;font-size:10px">${_esc(p.univ||'무소속')}</span></span>
      <span class="b2n-stline-rec">${s.wins ?? 0}승 ${s.losses ?? 0}패</span>
      <span class="b2n-stline-wr">${s.winRate ?? 0}%</span>
    </div>`;
  }).join('');
  return `<div class="b2n-col-title"><i></i>최다 출전 TOP 5</div><div class="b2n-standings">${rows}</div>`;
}
function _newsUnivAceCardHtml(item){
  const col = (typeof gc === 'function' ? (gc(item.u.name) || '#9f1d1d') : '#9f1d1d');
  const ace = item.ace;
  if(!ace || !ace.p){
    return `<div class="b2n-ace-card" style="--_c:${col}">
      <div class="b2n-ace-univ"><span class="b2n-ace-dot" style="background:${col}"></span>${_esc(item.u.name)}</div>
      <div class="b2n-ace-empty">확실한 에이스 없음</div>
    </div>`;
  }
  const wrCol = (ace.winRate ?? 0) >= 60 ? '#15803d' : (ace.winRate ?? 0) >= 50 ? '#9f1d1d' : '#78716c';
  const photo = _newsPhotoUrl(ace.p);
  const initial = String(ace.p.name||'-').trim().slice(0,1);
  return `<div class="b2n-ace-card" style="--_c:${col}">
    <div class="b2n-ace-univ"><span class="b2n-ace-dot" style="background:${col}"></span>${_esc(item.u.name)}</div>
    <div class="b2n-ace-main">
      <div class="b2n-ace-photo" style="--_c:${col}">
        ${photo?`<img src="${photo}" alt="${_esc(ace.p.name)}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`:''}
        <div class="b2n-ace-photo-fallback" style="${photo?'display:none':''}">${_esc(initial)}</div>
      </div>
      <div class="b2n-ace-info">
        <div class="b2n-ace-name">${_esc(ace.p.name||'-')}</div>
        <div class="b2n-ace-rec">${ace.wins ?? 0}승 ${ace.losses ?? 0}패 · <span style="color:${wrCol};font-weight:800">승률 ${ace.winRate ?? 0}%</span></div>
      </div>
    </div>
  </div>`;
}
function _newsUnivAcesHtml(ctx){
  const list = (ctx.univAces || []).filter(item => item && item.u);
  if(!list.length) return '';
  const cards = list.slice(0, 30).map(_newsUnivAceCardHtml).join('');
  return `<div class="b2n-aces-section">
    <div class="b2n-aces-title"><i></i>대학별 우수 스트리머</div>
    <div class="b2n-aces-grid">${cards}</div>
  </div>`;
}
function _newsCss(){
  return `
    .b2n-sheet{
      width:1040px; margin:0 auto; padding:0 0 30px;
      font-family:'Noto Sans KR', -apple-system, sans-serif;
      background:radial-gradient(140% 100% at 50% 0%, #f3efe4 0%, #ece7da 55%, #e6e0d0 100%);
      color:#1c1917;
      border-radius:14px; overflow:hidden;
      box-shadow:0 24px 60px rgba(15,23,42,.20), 0 2px 8px rgba(15,23,42,.08);
    }
    .b2n-sheet *, .b2n-sheet *::before, .b2n-sheet *::after{ box-sizing:border-box }
    .b2n-topband{ height:6px; background:linear-gradient(90deg,#7f1414 0%,#9f1d1d 22%,#c2761f 50%,#9f1d1d 78%,#57534e 100%); background-size:200% 100%; }
    .b2n-topbar{
      display:flex; align-items:center; justify-content:space-between;
      background:#ece7da; color:#57534e; padding:7px 26px; font-size:10px; font-weight:800;
      letter-spacing:.14em; text-transform:uppercase; border-bottom:1px solid rgba(28,25,23,.35);
    }
    .b2n-topbar span:nth-child(2){ color:#9f1d1d }
    .b2n-masthead{ padding:18px 26px 0; background:#ece7da; }
    .b2n-masthead-top{
      display:flex; align-items:center; justify-content:space-between;
      font-size:11px; font-weight:700; color:#57534e; letter-spacing:.04em; margin-bottom:10px;
    }
    .b2n-masthead-brand{
      display:flex; align-items:center; justify-content:center; gap:12px; text-align:center;
    }
    .b2n-brand-name{
      font-family:'Noto Serif KR', Georgia, serif; font-size:44px; font-weight:900;
      letter-spacing:-.01em; color:#1c1917; text-shadow:0 1px 0 rgba(255,255,255,.5);
    }
    .b2n-brand-name b{ color:#9f1d1d }
    .b2n-edition{
      margin-top:7px; text-align:center; font-size:11px; font-weight:800; color:#57534e;
      letter-spacing:.12em; padding-bottom:15px;
    }
    .b2n-rule-double{ border-top:3px solid #1c1917; margin-top:0; }
    .b2n-rule-double-thin{ border-top:1px solid #1c1917; margin-top:3px; }
    .b2n-headline-wrap{ padding:22px 26px 0; background:linear-gradient(180deg,#faf7f0 0%,#f8f5ee 100%); }
    .b2n-headline{
      font-family:'Noto Serif KR', Georgia, serif;
      font-size:39px; font-weight:900; line-height:1.22; letter-spacing:-.02em; color:#1c1917;
    }
    .b2n-dek{
      margin-top:10px; font-size:14px; line-height:1.7; color:#374151; max-width:900px;
      border-left:4px solid #9f1d1d; padding-left:12px;
    }
    .b2n-analysis{
      margin-top:14px; font-size:12.5px; line-height:1.8; color:#292524; max-width:960px;
      background:#faf9f6; border:1px solid rgba(28,25,23,.14); border-radius:8px; padding:12px 16px;
      column-gap:22px;
    }
    .b2n-analysis b{ color:#9f1d1d }
    .b2n-bylinebar{
      display:flex; gap:14px; flex-wrap:wrap; margin-top:14px; padding-top:10px; padding-bottom:16px;
      border-top:1px dashed rgba(28,25,23,.3); font-size:11px; font-weight:700; color:#6b7280;
    }
    .b2n-body{ display:flex; gap:22px; padding:20px 26px 0 }
    .b2n-body > .b2n-col:first-child{ width:638px; flex-shrink:0 }
    .b2n-body > .b2n-col:last-child{ flex:1; min-width:0 }
    .b2n-col-title{
      display:flex; align-items:center; gap:7px;
      font-size:12px; font-weight:900; letter-spacing:.08em; text-transform:uppercase;
      color:#57534e; margin:18px 0 10px; padding-bottom:7px; border-bottom:1.5px solid rgba(28,25,23,.55);
    }
    .b2n-col-title:first-child{ margin-top:0 }
    .b2n-col-title i{ display:inline-block; width:7px; height:7px; border-radius:2px; background:#9f1d1d; flex-shrink:0; font-style:normal }
    .b2n-feature{
      display:flex; gap:18px; background:linear-gradient(155deg,#fefcf8 0%,#fbf8f2 65%,#f5efe1 100%);
      border:1px solid rgba(28,25,23,.14); border-top:3px solid #d4af37;
      border-radius:16px; padding:16px; box-shadow:0 12px 30px rgba(15,23,42,.10), inset 0 1px 0 rgba(255,255,255,.6); margin-bottom:16px;
    }
    .b2n-feature-empty{
      background:#fbf8f2; border:1px dashed rgba(28,25,23,.25); border-radius:12px; padding:20px;
      text-align:center; color:#6b7280; font-size:12px; margin-bottom:16px;
    }
    .b2n-feature-photo{
      position:relative; width:158px; height:192px; flex-shrink:0; border-radius:14px; overflow:hidden;
      background:linear-gradient(160deg,#3f3a33,#171512);
      box-shadow:inset 0 0 0 3px #fefcf8, inset 0 0 0 5px #d4af37, 0 12px 28px rgba(15,23,42,.22);
      display:flex; align-items:center; justify-content:center;
    }
    .b2n-feature-photo::after{
      content:''; position:absolute; inset:0; pointer-events:none;
      background:linear-gradient(185deg,rgba(0,0,0,0) 58%,rgba(0,0,0,.34) 100%);
    }
    .b2n-feature-photo img{ width:100%; height:100%; object-fit:cover; display:block }
    .b2n-feature-fallback{ width:100%; height:100%; align-items:center; justify-content:center; display:flex; font-size:50px; font-weight:900; color:#fff }
    .b2n-feature-ribbon{
      position:absolute; left:0; top:12px; z-index:1; background:linear-gradient(135deg,#dca02f,#9f1d1d); color:#fff; font-size:10.5px; font-weight:900;
      padding:4px 12px 4px 9px; border-radius:0 8px 8px 0; letter-spacing:.03em;
      box-shadow:0 3px 10px rgba(0,0,0,.3), inset 0 1px 0 rgba(255,255,255,.25);
    }
    .b2n-feature-body{ display:flex; flex-direction:column; justify-content:center; gap:7px; min-width:0 }
    .b2n-feature-name{ font-family:'Noto Serif KR', Georgia, serif; font-size:24px; font-weight:900; color:#111827 }
    .b2n-feature-univ{ font-size:12.5px; font-weight:700; color:#6b7280 }
    .b2n-feature-stats{ display:flex; gap:14px; margin-top:6px }
    .b2n-fstat{ display:flex; flex-direction:column; align-items:center; }
    .b2n-fstat b{ font-size:19px; font-weight:900; color:#9f1d1d }
    .b2n-fstat i{ font-style:normal; font-size:10px; font-weight:700; color:#6b7280 }
    .b2n-fstat-streak b{ color:#b45309 }
    .b2n-fstat-sub{ margin-left:2px; padding-left:12px; border-left:1px dashed rgba(28,25,23,.2) }
    .b2n-fstat-sub b{ font-size:13px; color:#8a8578; font-weight:800 }
    .b2n-row{
      display:flex; gap:10px; align-items:flex-start; background:#fbf8f2; border:1px solid rgba(28,25,23,.12);
      border-radius:10px; padding:9px 12px; margin-bottom:8px;
    }
    .b2n-row-tag{
      flex-shrink:0; font-size:10px; font-weight:900; color:#fff; background:#111827;
      border-radius:6px; padding:4px 8px; letter-spacing:.02em; white-space:nowrap;
    }
    .b2n-row-body{ font-size:12px; color:#374151; display:flex; flex-wrap:wrap; gap:6px; align-items:baseline }
    .b2n-row-body b{ font-size:13px; color:#111827 }
    .b2n-row-univ{ color:#9ca3af; font-size:11px }
    .b2n-row-stat{ color:#292524; font-weight:900; font-size:11.5px }
    .b2n-row-wr{ color:#a39d8c; font-weight:700; font-size:10.5px }
    .b2n-row-extra{ color:#9f1d1d; font-weight:800; font-size:11px }
    .b2n-standings{ background:#fbf8f2; border:1px solid rgba(28,25,23,.14); border-radius:14px; overflow:hidden; margin-bottom:16px; box-shadow:0 4px 12px rgba(15,23,42,.05) }
    .b2n-stline{
      display:flex; gap:9px; align-items:center;
      padding:9px 12px; font-size:12px; border-bottom:1px solid rgba(28,25,23,.08);
    }
    .b2n-stline:nth-child(even){ background:rgba(28,25,23,.025) }
    .b2n-stline:last-child{ border-bottom:none }
    .b2n-stline-rank{
      width:22px; height:22px; line-height:22px; flex-shrink:0; font-weight:900; font-size:11px;
      color:#78716c; text-align:center; border-radius:50%; background:rgba(28,25,23,.06);
    }
    .b2n-stline-rank.r1{ background:linear-gradient(160deg,#fde68a,#d97706); color:#78350f; box-shadow:0 2px 6px rgba(217,119,6,.35) }
    .b2n-stline-rank.r2{ background:linear-gradient(160deg,#e7e5e4,#a8a29e); color:#292524; box-shadow:0 2px 6px rgba(120,113,108,.3) }
    .b2n-stline-rank.r3{ background:linear-gradient(160deg,#e7bfa3,#b4623a); color:#431407; box-shadow:0 2px 6px rgba(180,98,58,.3) }
    .b2n-stline-name{ flex:1; min-width:0; font-weight:800; color:#111827; overflow:hidden; text-overflow:ellipsis; white-space:nowrap }
    .b2n-stline-rec{ flex-shrink:0; color:#292524; font-weight:800; font-size:11.5px; white-space:nowrap }
    .b2n-stline-wr{ flex-shrink:0; font-weight:600; color:#a39d8c; font-size:11px; white-space:nowrap }
    .b2n-rd{ font-size:10px; font-weight:800; border-radius:6px; padding:2px 6px; text-align:center; white-space:nowrap }
    .b2n-rd.up{ background:#f0fdf4; color:#15803d }
    .b2n-rd.down{ background:#fef2f2; color:#b91c1c }
    .b2n-rd.same{ background:#f8fafc; color:#64748b }
    .b2n-rd.new{ background:#f5f3ff; color:#5b21b6 }
    .b2n-kpis{ display:flex; gap:10px; margin-bottom:16px }
    .b2n-kpi{
      position:relative; flex:1; min-width:0; color:#111827; border-radius:12px; padding:13px 14px 13px 50px;
      background:linear-gradient(155deg,#fefcf8 0%,#fbf8f2 60%,#f5efe1 100%);
      border:1px solid rgba(28,25,23,.1); border-top:3px solid #9f1d1d;
      box-shadow:0 6px 16px rgba(15,23,42,.07), inset 0 1px 0 rgba(255,255,255,.6);
    }
    .b2n-kpi:nth-child(2){ border-top-color:#0e7490 }
    .b2n-kpi-ico{
      position:absolute; left:12px; top:50%; transform:translateY(-50%);
      width:26px; height:26px; border-radius:50%; font-size:13px;
      display:flex; align-items:center; justify-content:center;
      background:radial-gradient(120% 120% at 30% 25%, #fff 0%, #ede4cf 100%);
      box-shadow:0 2px 6px rgba(15,23,42,.14), inset 0 0 0 1px rgba(28,25,23,.08);
    }
    .b2n-kpi b{ display:block; font-size:23px; font-weight:900; color:#111827; line-height:1.2 }
    .b2n-kpi i{ font-style:normal; font-size:10px; font-weight:800; color:#9ca3af; letter-spacing:.02em }
    .b2n-worst{ background:#fbf8f2; border:1px dashed rgba(28,25,23,.25); border-radius:12px; padding:12px; margin-top:16px }
    .b2n-worst-title{ font-size:11px; font-weight:900; color:#6b7280; margin-bottom:6px }
    .b2n-empty{ font-size:12px; color:#9ca3af; padding:10px 0 }
    .b2n-aces-section{ padding:4px 26px 22px }
    .b2n-aces-title{
      display:flex; align-items:center; gap:7px;
      font-size:12px; font-weight:900; letter-spacing:.08em; text-transform:uppercase;
      color:#57534e; margin:6px 0 12px; padding-bottom:7px; border-bottom:1.5px solid rgba(28,25,23,.55);
    }
    .b2n-aces-title i{ display:inline-block; width:7px; height:7px; border-radius:2px; background:#9f1d1d; flex-shrink:0; font-style:normal }
    .b2n-aces-grid{ display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:12px }
    .b2n-ace-card{
      background:#fbf8f2; border:1px solid rgba(28,25,23,.14); border-top:3px solid var(--_c,#9f1d1d);
      border-radius:12px; padding:11px 12px; display:flex; flex-direction:column; gap:6px; min-width:0;
      box-shadow:0 4px 12px rgba(15,23,42,.05);
    }
    .b2n-ace-main{ display:flex; align-items:center; gap:9px; margin-top:1px }
    .b2n-ace-photo{
      position:relative; width:40px; height:40px; border-radius:var(--su_profile_radius,50%); clip-path:var(--su_profile_clip,none); overflow:hidden; flex-shrink:0;
      background:linear-gradient(160deg,#3f3a33,#171512);
      border:2.5px solid var(--_c,#9f1d1d);
      filter:drop-shadow(0 3px 7px rgba(15,23,42,.22));
      display:flex; align-items:center; justify-content:center;
    }
    .b2n-ace-photo img{ width:100%; height:100%; object-fit:cover; display:block }
    .b2n-ace-photo-fallback{ width:100%; height:100%; align-items:center; justify-content:center; display:flex; font-size:16px; font-weight:900; color:#fff }
    .b2n-ace-info{ min-width:0; flex:1 }
    .b2n-ace-univ{
      display:flex; align-items:center; gap:6px; font-size:10.5px; font-weight:900; color:#57534e;
      text-transform:uppercase; letter-spacing:.02em; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
    }
    .b2n-ace-dot{ width:7px; height:7px; border-radius:50%; flex-shrink:0 }
    .b2n-ace-name{ font-size:14px; font-weight:900; color:#111827; white-space:nowrap; overflow:hidden; text-overflow:ellipsis }
    .b2n-ace-rec{ font-size:11px; font-weight:700; color:#374151; white-space:nowrap; overflow:hidden; text-overflow:ellipsis }
    .b2n-ace-empty{ font-size:11px; color:#9ca3af; font-weight:600 }
    .b2n-footer{
      margin-top:22px; padding:14px 26px 0; border-top:3px double rgba(28,25,23,.5);
      display:flex; justify-content:space-between; align-items:center; font-size:10px; font-weight:700; color:#9ca3af;
    }
    .b2n-footer-dot{ display:inline-block; width:6px; height:6px; border-radius:50%; background:#9f1d1d; margin-right:6px; vertical-align:middle }
  `;
}
function _newsBuildHtml(ctx, meta){
  const info = ctx.briefingInfo || {};
  const headline = _newsHeadline(ctx);
  const editionLabel = ctx.isMonthly ? 'MONTHLY EDITION' : 'WEEKLY EDITION';
  const analysis = _newsAnalysisParagraph(ctx);
  const worstLabel = _newsWorstLabel(ctx);
  return `<style>${_newsCss()}</style>
  <div class="b2n-sheet">
    <div class="b2n-topband"></div>
    <div class="b2n-topbar"><span>STAR DATACENTER SPORTS</span><span>${_esc(editionLabel)}</span><span>ISSUE ${_esc(meta.issueDateFull||meta.issueDate)}</span></div>
    <div class="b2n-masthead">
      <div class="b2n-masthead-top">
        <span>${_esc(info.kicker||'BRIEFING')}</span>
        <span>필터 ${_esc(meta.univ)} · 활동 선수 ${ctx.activePlayerCount||0}명</span>
      </div>
      <div class="b2n-masthead-brand">
        <div class="b2n-brand-name">STAR <b>DATACENTER</b></div>
      </div>
      <div class="b2n-edition">${_esc(info.title||'BRIEFING')} · ${_esc(meta.from)} - ${_esc(meta.to)}</div>
      <div class="b2n-rule-double"></div>
      <div class="b2n-rule-double-thin"></div>
    </div>
    <div class="b2n-headline-wrap">
      <div class="b2n-headline">${headline}</div>
      <div class="b2n-dek">${_esc(ctx.heroSummary||'')}</div>
      ${analysis ? `<div class="b2n-analysis">${analysis}</div>` : ''}
      <div class="b2n-bylinebar">
        <span>발행 ${_esc(meta.issueDateFull||meta.issueDate)}</span>
        <span>집계 ${_esc(meta.from)} ~ ${_esc(meta.to)}</span>
        <span>필터 ${_esc(meta.univ)}</span>
        <span>활동 선수 ${ctx.activePlayerCount||0}명</span>
      </div>
    </div>
    <div class="b2n-body">
      <div class="b2n-col">
        <div class="b2n-col-title"><i></i>${_esc(ctx.mvpLabel||'오늘의 MVP')}</div>
        ${_newsMvpFeatureHtml(ctx)}
        <div class="b2n-col-title"><i></i>이 주의 기록</div>
        ${_newsHighlightRows(ctx)}
      </div>
      <div class="b2n-col">
        <div class="b2n-kpis">
          <div class="b2n-kpi"><span class="b2n-kpi-ico">🎮</span><b>${ctx.totalGames||0}</b><i>총 경기수</i></div>
          <div class="b2n-kpi"><span class="b2n-kpi-ico">🏫</span><b>${ctx.activeUnivs||0}</b><i>활동 대학</i></div>
        </div>
        <div class="b2n-col-title"><i></i>대학 순위</div>
        ${_newsStandingsHtml(ctx)}
        ${_newsTopPlayersHtml(ctx)}
        ${ctx.worstPlayer && ctx.worstPlayer.p ? `<div class="b2n-worst">
          <div class="b2n-worst-title">💧 ${_esc(worstLabel)}</div>
          ${_newsStatRow('최다패', ctx.worstPlayer, '')}
        </div>` : ''}
      </div>
    </div>
    ${_newsUnivAcesHtml(ctx)}
    <div class="b2n-footer">
      <span><span class="b2n-footer-dot"></span>STAR DATACENTER · star-datacenter</span>
      <span>${_esc(meta.univ)} · ${_esc(info.title||'브리핑')}</span>
    </div>
  </div>`;
}
async function _captureBriefingNewspaper(meta){
  const ctx = window._b2BriefingExportCtx;
  if(!ctx){ alert('브리핑 데이터를 아직 불러오지 못했습니다. 브리핑 화면을 한 번 연 뒤 다시 시도해주세요.'); return; }
  const holder=document.createElement('div');
  // html2canvas는 뷰포트 밖(left:-99999px)에 있는 콘텐츠를 렌더 윈도우 밖으로 취급해
  // 잘라내는 경우가 있어, 실제 좌표(0,0)에 두고 opacity:0으로 화면에는 보이지 않게 처리한다.
  holder.style.cssText='position:fixed;left:0;top:0;opacity:0;pointer-events:none;z-index:-1';
  holder.innerHTML=_newsBuildHtml(ctx, meta);
  document.body.appendChild(holder);
  try{
    const sheet=holder.querySelector('.b2n-sheet');
    await _imgToDataUrls(sheet);
    try{ if(typeof _waitForImages==='function') await _waitForImages(sheet,1500); }catch(e){}
    _sanitizeUnsupportedCssFunctions(sheet);
    const w=1040;
    const h=Math.max(1, Math.ceil(sheet.scrollHeight||0));
    const canvas=await html2canvas(sheet,{
      backgroundColor:'#ece7da', scale:2.5, useCORS:true, allowTaint:false, logging:false,
      imageTimeout:20000, width:w, height:h, windowWidth:w+80, windowHeight:h+80, scrollX:0, scrollY:0
    });
    const rawName=`브리핑_신문기사_${meta.presetLabel}_${String(window._b2WeeklyDateFrom||'').slice(0,10)}_${String(window._b2WeeklyDateTo||'').slice(0,10)}${meta.univ!=='전체'?'_'+meta.univ:''}.png`;
    const safeName=rawName.replace(/[\\/:*?"<>|]+/g,'_');
    await _saveCanvasImage(canvas, safeName, 'png');
  } finally {
    try{ if(holder.parentNode) holder.parentNode.removeChild(holder); }catch(e){}
  }
}

// 브리핑 저장 — 화면을 그대로 캡처하지 않고(그리드 레이아웃이 깨지거나 헤더만
// 캡처되는 등 html2canvas 호환성 문제가 있었음), 신문기사 스타일로 별도 렌더링해서
// 안정적으로 캡처한다. (예전 "저장(분할)" 기능은 제거됨)
async function captureBriefingArticle(){
  try{
    _showSaveLoading();
    try{ await (window.ensureHtml2Canvas && window.ensureHtml2Canvas()); }catch(e){}
    if(typeof html2canvas!=='function') throw new Error('html2canvas를 불러오지 못했습니다.');
    await _captureBriefingNewspaper(_getBriefingExportMeta());
  }catch(e){alert('브리핑 이미지 저장 오류: '+e.message);}
  finally{ _hideSaveLoading(); }
}

async function _downloadCanvasImage(canvas, filename, mimeType, quality){
  return new Promise((resolve) => {
    try {
      canvas.toBlob(function(blob){
        if(!blob){ resolve(false); return; }
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(()=>{ document.body.removeChild(a); URL.revokeObjectURL(url); }, 300);
        resolve(true);
      }, mimeType, quality);
    } catch(e) { resolve(false); }
  });
}
async function _saveCanvasImage(canvas, filename, fmt){
  const mime = fmt==='jpg' ? 'image/jpeg' : 'image/png';
  const q = fmt==='jpg' ? 0.95 : undefined;
  const ok = await _downloadCanvasImage(canvas, filename, mime, q);
  if(!ok){
    const dataUrl = fmt==='jpg' ? canvas.toDataURL('image/jpeg', 0.95) : canvas.toDataURL('image/png');
    const w = window.open('', '_blank');
    if(w){
      w.document.write('<html><body style="margin:0;background:#111">'
        + '<p style="color:#fff;font-family:sans-serif;padding:12px;font-size:13px">이미지를 길게 눌러 저장하세요 📥</p>'
        + '<img src="' + dataUrl + '" style="max-width:100%;display:block">'
        + '</body></html>');
    } else {
      window.location.href = fmt==='jpg' ? canvas.toDataURL('image/jpeg', 0.95) : canvas.toDataURL('image/png');
    }
  }
}

try{
  window.capturePlayerModal = capturePlayerModal;
  window.captureUnivModal = captureUnivModal;
  window.captureDetail = captureDetail;
  window.captureBriefingArticle = captureBriefingArticle;
  window._saveCanvasImage = _saveCanvasImage;
  window._downloadCanvasImage = _downloadCanvasImage;
}catch(e){}
