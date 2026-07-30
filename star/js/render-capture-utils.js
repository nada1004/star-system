/* ══════════════════════════════════════
   Render Capture Utilities
══════════════════════════════════════ */
function _showSaveLoading(){
  let t=document.getElementById('_save-toast');
  if(!t){
    t=document.createElement('div');
    t.id='_save-toast';
    t.style.cssText='position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:rgba(15,23,42,.88);color:#fff;padding:10px 22px;border-radius:24px;font-size:var(--fs-base);font-weight:700;z-index:99999;display:none;align-items:center;gap:8px;backdrop-filter:blur(6px);font-family:"Noto Sans KR",sans-serif;white-space:nowrap;box-shadow:0 4px 20px rgba(0,0,0,.3)';
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

/* html2canvas는 캡처 대상을 별도 iframe 문서로 복제(clone)한 뒤 그 복제본을 그리는데,
   복제 과정에서 요소가 새로 DOM에 삽입되는 셈이 되어 CSS keyframe 등장 애니메이션
   (예: 카드 fade-up)이 처음부터 다시 재생된다. html2canvas는 이 재생이 끝나길
   기다리지 않고 거의 즉시 스냅샷을 뜨기 때문에, 애니메이션 중간(투명도 낮음·위치 이동 중)
   상태가 그대로 캡처되어 글자/카드가 겹쳐 보이거나 흐릿하게 번지는 현상이 생긴다.
   복제 문서 전체에 애니메이션·트랜지션을 강제로 끄는 스타일을 주입해 방지한다. */
function _killCloneAnimations(clonedDoc){
  if(!clonedDoc) return;
  const s = clonedDoc.createElement('style');
  s.textContent = `*, *::before, *::after {
    animation-play-state: paused !important;
    animation-delay: 0s !important;
    animation-duration: 0s !important;
    transition-duration: 0s !important;
    transition-delay: 0s !important;
  }`;
  (clonedDoc.head || clonedDoc.documentElement).appendChild(s);
}
/* 웹폰트(Noto Sans/Serif KR)가 브라우저에 완전히 로드되기 전에 html2canvas가
   먼저 캡처해버리면, 대체 폰트로 그려지거나 폰트 교체 도중 상태가 찍혀서
   글자 획이 겹치거나 색이 번져 보이는("글자 깨짐") 현상이 생긴다.
   캡처 직전에 document.fonts.ready를 짧은 타임아웃과 함께 기다려서 방지한다. */
async function _waitForFonts(timeoutMs){
  timeoutMs = timeoutMs || 2000;
  try{
    if(!document.fonts || !document.fonts.ready) return;
    await Promise.race([
      document.fonts.ready,
      new Promise(res => setTimeout(res, timeoutMs))
    ]);
    // 폰트가 늦게 붙는 환경 대비, ready 이후에도 한 프레임 더 그리도록 소폭 대기
    await new Promise(res => setTimeout(res, 50));
  }catch(e){}
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
    try{ await _waitForFonts(2000); }catch(e){}
    const canvas=await html2canvas(body,{backgroundColor:'#ffffff',scale:2,useCORS:true,allowTaint:false,logging:false,imageTimeout:15000,onclone:(d)=>{try{_killCloneAnimations(d);}catch(e){}}});
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
    try{ await _waitForFonts(2000); }catch(e){}
    const canvas=await html2canvas(body,{backgroundColor:'#ffffff',scale:2,useCORS:true,allowTaint:false,logging:false,imageTimeout:15000,onclone:(d)=>{try{_killCloneAnimations(d);}catch(e){}}});
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
  try{ await _waitForFonts(2000); }catch(e){}
    const canvas=await html2canvas(el,{backgroundColor:'#ffffff',scale:2,useCORS:true,allowTaint:false,logging:false,imageTimeout:15000,onclone:(d)=>{try{_killCloneAnimations(d);}catch(e){}}});
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

// color-mix()/color() 등 html2canvas가 못 읽는 함수를, 브라우저 자신의 canvas 2D 색상
// 파서에 맡겨 실제 계산된 legacy rgb()/hex 값으로 정확히 치환한다. 캔버스 fillStyle은
// 브라우저가 이해하는 어떤 CSS <color> 문법이든(color-mix, oklch, oklab, lab, color() 등)
// 항상 sRGB 8bit "rgb()"/"#hex" 문자열로 정규화해 돌려주는 스펙 특성을 이용한 것으로,
// 우리가 직접 색상 수식을 재구현하는 것보다 훨씬 정확하고 안전하다.
var _colorProbeCtx=null;
function _tryResolveColorViaCanvas(str){
  try{
    if(typeof document==='undefined' || typeof document.createElement!=='function') return null;
    if(!_colorProbeCtx){
      const c=document.createElement('canvas');
      _colorProbeCtx = c.getContext && c.getContext('2d');
    }
    const ctx=_colorProbeCtx;
    if(!ctx) return null;
    const SENTINEL='rgba(1, 2, 3, 0.5)'; // 파싱 실패 시 fillStyle이 이 값 그대로 유지됨을 이용한 판별용
    ctx.fillStyle=SENTINEL;
    ctx.fillStyle=str;
    const resolved=ctx.fillStyle;
    if(!resolved || resolved===SENTINEL) return null;
    return resolved;
  }catch(e){ return null; }
}
// 문자열 s에서 openIdx가 가리키는 '(' 와 짝이 맞는 ')' 의 인덱스를 찾는다 (중첩 괄호 지원).
function _matchParenIdx(s, openIdx){
  let depth=0;
  for(let i=openIdx;i<s.length;i++){
    if(s[i]==='(') depth++;
    else if(s[i]===')'){ depth--; if(depth===0) return i; }
  }
  return -1;
}
// s를 "괄호 깊이 0인 위치의 콤마"만 기준으로 분리한다.
// (var(--x,#fallback)처럼 인자 자체에 콤마가 들어있는 경우를 안전하게 통과시키기 위함)
function _splitTopLevelCommas(s){
  const parts=[]; let depth=0, last=0;
  for(let i=0;i<s.length;i++){
    const c=s[i];
    if(c==='(') depth++;
    else if(c===')') depth--;
    else if(c===',' && depth===0){ parts.push(s.slice(last,i)); last=i+1; }
  }
  parts.push(s.slice(last));
  return parts;
}
// color-mix()의 한 인자(예: "black 15%", "15% black", "var(--x,#hex) 75%")에서
// 앞/뒤에 붙은 퍼센트 토큰만 제거하고 순수 색상 부분만 남긴다.
// (이걸 안 하면 "black 15%"가 그대로 대체색으로 쓰여 "color: black 15%;" 같은
//  무효한 선언이 되고, 결국 color-mix가 완전히 안 지워진 것과 같은 효과가 남는다)
function _stripMixPercent(part){
  let p=String(part||'').trim();
  p=p.replace(/^[\d.]+%\s+/, '');
  p=p.replace(/\s+[\d.]+%$/, '');
  return p.trim();
}
// html2canvas가 못 읽는 color-mix()/color() 함수 호출을 안전한 대체색으로 치환한다.
// 정규식([^,]+, [^)]+ 등)은 var(--x,#fallback)처럼 인자 안에 콤마·괄호가 중첩되면
// 첫 번째 안쪽 ')'에서 매칭이 끊겨 "10%, #fff)" 같은 깨진 CSS 조각을 남겼음
// (color-mix가 완전히 치환되지 않아 Safari가 계산값을 color(...)로 직렬화 →
//  "Attempting to parse an unsupported color function \"color\"" 캡처 오류로 이어짐).
// 괄호 깊이를 직접 세어 정확한 함수 호출 범위를 찾고, 우선 canvas로 실제 계산값을 구하며,
// canvas를 못 쓰는 상황에서만 top-level 콤마 기반 텍스트 휴리스틱으로 대체한다.
function _scrubUnsupportedColors(text){
  const s=String(text||'');
  let out='', i=0;
  while(i<s.length){
    const prev = i>0 ? s[i-1] : '';
    const boundaryOk = !/[a-zA-Z0-9_-]/.test(prev); // background-color( 등의 일부가 아닌지 확인
    if(boundaryOk && /^color-mix\(/i.test(s.slice(i))){
      const openIdx=i+9; // 'color-mix'.length
      const closeIdx=_matchParenIdx(s, openIdx);
      if(closeIdx!==-1){
        const whole=s.slice(i, closeIdx+1);
        let fallback=_tryResolveColorViaCanvas(whole);
        if(!fallback){
          const inner=s.slice(openIdx+1, closeIdx);
          const parts=_splitTopLevelCommas(inner);
          fallback=_stripMixPercent(parts[parts.length-1]||'');
          if(!fallback) fallback='#94a3b8';
          // fallback 자체가 또 다른 color-mix()/color()를 담고 있을 수 있으므로 재귀적으로 정리
          if(/color-mix\(|(?:^|[^-\w])color\(/i.test(fallback)) fallback=_scrubUnsupportedColors(fallback);
        }
        out+=fallback;
        i=closeIdx+1;
        continue;
      }
    } else if(boundaryOk && /^color\(/i.test(s.slice(i))){
      const openIdx=i+5; // 'color'.length
      const closeIdx=_matchParenIdx(s, openIdx);
      if(closeIdx!==-1){
        const whole=s.slice(i, closeIdx+1);
        out+= _tryResolveColorViaCanvas(whole) || '#94a3b8';
        i=closeIdx+1;
        continue;
      }
    } else if(boundaryOk && /^(oklch|oklab|lab|lch|hwb)\(/i.test(s.slice(i))){
      // Safari 등에서 계산값이 이 형태로 직렬화되는 경우까지 대비한 추가 방어선
      const fname=/^(oklch|oklab|lab|lch|hwb)\(/i.exec(s.slice(i))[1];
      const openIdx=i+fname.length;
      const closeIdx=_matchParenIdx(s, openIdx);
      if(closeIdx!==-1){
        const whole=s.slice(i, closeIdx+1);
        out+= _tryResolveColorViaCanvas(whole) || '#94a3b8';
        i=closeIdx+1;
        continue;
      }
    }
    out+=s[i];
    i++;
  }
  return out;
}
function _sanitizeUnsupportedCssFunctions(root){
  if(!root || typeof root.querySelectorAll!=='function') return;
  // html2canvas가 못 읽는 color-mix()/color() 함수만 안전한 대체색으로 치환한다.
  // (이전에는 해당 함수가 포함된 선언 전체를 지워버려서, 예를 들어 .b2w2-kpi-card의
  //  background 전체가 사라져 카드 배경이 화면과 다르게 밋밋해지는 문제가 있었음)
  const scrub=_scrubUnsupportedColors;
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
/* 위 _sanitizeUnsupportedCssFunctions는 "캡처 대상 요소 안"의 인라인 style/<style> 태그만
   본다 — '전체' 모드처럼 실제 화면 전체(#b2w2-export-root)를 캡처할 때는 대부분의 색상이
   <link>로 불러온 외부 시트(css/style.css)의 클래스 규칙에서 오는데, 이건 root의 자손이 아니라
   <head> 쪽에 있어서 위 함수가 전혀 손대지 못한다. color-mix()가 있는 그 규칙들을 CSSOM으로
   직접 순회하며 값을 고쳐써서, "Attempting to parse an unsupported color function" 캡처 실패를 막는다. */
function _sanitizeUnsupportedColorsInDoc(doc){
  if(!doc) return;
  const scrub=_scrubUnsupportedColors;
  try{
    Array.from(doc.styleSheets||[]).forEach((sheet)=>{
      let rules;
      try{ rules = sheet.cssRules; }catch(e){ return; } // 크로스오리진 등으로 접근 불가하면 skip
      if(!rules) return;
      const walk=(ruleList)=>{
        Array.from(ruleList).forEach((rule)=>{
          try{
            if(rule.cssRules){ walk(rule.cssRules); return; } // @media 등 중첩 규칙
            if(!rule.style) return;
            const props=[];
            for(let i=0;i<rule.style.length;i++) props.push(rule.style[i]);
            props.forEach((prop)=>{
              const val=rule.style.getPropertyValue(prop);
              if(val && /color-mix\(|(?:^|[^-\w])color\(|oklch\(|oklab\(|(?:^|[^-\w])lab\(|(?:^|[^-\w])lch\(|hwb\(/i.test(val)){
                try{ rule.style.setProperty(prop, scrub(val), rule.style.getPropertyPriority(prop)); }catch(e){}
              }
            });
          }catch(e){}
        });
      };
      walk(rules);
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
  const rows = list.map((ud, idx)=>{
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
function _newsSilentUnivsHtml(ctx){
  const list = ctx.silentUnivs || [];
  if(!list.length) return '';
  const shown = list.slice(0, 10);
  const rest = list.length - shown.length;
  return `<div class="b2n-silent-row">
    <span class="b2n-silent-label">기록 없는 대학</span>
    ${shown.map(name=>`<span class="b2n-silent-chip">${_esc(name)}</span>`).join('')}
    ${rest>0?`<span class="b2n-silent-more">외 ${rest}곳</span>`:''}
  </div>`;
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
function _newsRaceStatsHtml(ctx){
  const rc = ctx.raceCountGlobal;
  if(!rc) return '';
  const mc = ctx.mirrorRaceCountGlobal || {};
  const races = [
    { key:'P', label:'프로토스', ico:'🔮' },
    { key:'T', label:'테란',     ico:'⚔️' },
    { key:'Z', label:'저그',     ico:'🦎' }
  ];
  const hasAny = races.some(({key})=> (rc[key].w + rc[key].l) > 0);
  if(!hasAny) return '';
  const rows = races.map(({key,label,ico})=>{
    const { w, l } = rc[key];
    const t = w + l;
    const wr = t ? Math.round(w/t*100) : null;
    const wrCol = wr===null ? '#a8a29e' : wr>=60 ? '#15803d' : wr>=50 ? '#9f1d1d' : '#a8a29e';
    const mm = mc[key] || { w:0, l:0 };
    return `<div class="b2n-stline" style="flex-wrap:wrap">
      <span class="b2n-stline-name">${ico} ${_esc(label)} 상대</span>
      <span class="b2n-stline-rec">${w}승 ${l}패</span>
      <span class="b2n-stline-wr" style="color:${wrCol}">${wr!==null?`${wr}%`:'-'}</span>
      <span style="flex-basis:100%;height:4px;border-radius:2px;background:rgba(28,25,23,.08);overflow:hidden;margin-top:4px">
        <span style="display:block;height:100%;width:${wr!==null?wr:0}%;background:${wrCol};border-radius:2px"></span>
      </span>
      <span style="flex-basis:100%;font-size:9px;color:#a8a29e;margin-top:2px">└ 동족전(${_esc(label)} vs ${_esc(label)}) ${mm.w}승 ${mm.l}패</span>
    </div>`;
  }).join('');
  return `<div class="b2n-col-title"><i></i>종족별 상대 전적 <span style="font-size:9px;font-weight:700;color:#78716c">(동족전 포함)</span></div><div class="b2n-standings">${rows}</div>`;
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
function _newsUnivRosterCardHtml(item){
  const col = (typeof gc === 'function' ? (gc(item.u.name) || '#9f1d1d') : '#9f1d1d');
  const roster = [...(item.active||[])].sort((a,b)=> (b.wins - a.wins) || (b.total - a.total) || ((b.winRate ?? -1) - (a.winRate ?? -1)));
  const head = `<div class="b2n-roster-head" style="background:${col}1a;border-top:3px solid ${col}">
      <span class="b2n-ace-dot" style="background:${col}"></span>
      <span style="font-size:11px;font-weight:900;color:#292524;text-transform:uppercase;letter-spacing:.02em">${_esc(item.u.name)}</span>
      <span class="b2n-roster-count">${roster.length}명</span>
    </div>`;
  if(!roster.length){
    return `<div class="b2n-roster-card">${head}<div class="b2n-ace-empty" style="padding:10px 13px">활동 기록 없음</div></div>`;
  }
  const rows = roster.map(s=>{
    const wrCol = (s.winRate ?? 0) >= 60 ? '#15803d' : (s.winRate ?? 0) >= 50 ? '#9f1d1d' : '#a8a29e';
    return `<div class="b2n-roster-row">
      <span class="b2n-roster-name">${_esc(s.p && s.p.name || '-')}</span>
      <span class="b2n-roster-rec">${s.wins ?? 0}승 ${s.losses ?? 0}패</span>
      <span class="b2n-roster-wr" style="color:${wrCol}">${s.winRate ?? 0}%</span>
    </div>`;
  }).join('');
  return `<div class="b2n-roster-card">${head}<div class="b2n-roster-list">${rows}</div></div>`;
}
function _newsUnivRostersHtml(ctx){
  const list = (ctx.univAces || []).filter(item => item && item.u).slice(0, 30);
  if(!list.length) return '';
  // 카드 높이가 팀마다 크게 달라(스트리머 20명 vs 3명) 2열 그리드에 그대로 넣으면
  // 짝이 된 카드끼리 높이가 맞춰지며 아래쪽에 큰 여백이 남는 문제가 있었다.
  // → 로스터 크기 기준으로 내림차순 정렬 후, 매번 "누적 인원이 더 적은 열"에
  //   카드를 채우는 그리디 방식으로 두 열의 높이를 최대한 맞춘다(신문 다단 편집과 동일한 방식).
  const withWeight = list.map(item => ({ item, weight: Math.max(1, (item.active||[]).length) }))
    .sort((a,b)=> b.weight - a.weight);
  const cols = [ { items:[], total:0 }, { items:[], total:0 } ];
  withWeight.forEach(({item, weight})=>{
    const target = cols[0].total <= cols[1].total ? cols[0] : cols[1];
    target.items.push(item);
    target.total += weight;
  });
  const colHtml = cols.map(c => `<div class="b2n-roster-col">${c.items.map(_newsUnivRosterCardHtml).join('')}</div>`).join('');
  return `<div class="b2n-aces-section">
    <div class="b2n-aces-title"><i></i>대학별 스트리머 성적</div>
    <div class="b2n-roster-grid">${colHtml}</div>
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
      --ink:#1c1917; --ink2:#6b6a63; --accent:#9f1d1d;
      width:1280px; margin:0 auto; padding:0 0 40px;
      font-family:'Noto Sans KR', -apple-system, sans-serif;
      background:radial-gradient(140% 100% at 50% 0%, #f3efe4 0%, #ece7da 55%, #e6e0d0 100%);
      color:var(--ink);
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
      font-size:var(--fs-caption); font-weight:700; color:var(--ink2); letter-spacing:.04em; margin-bottom:10px;
    }
    .b2n-masthead-brand{
      display:flex; align-items:center; justify-content:center; gap:12px; text-align:center;
    }
    .b2n-brand-name{
      font-family:'Noto Serif KR', Georgia, serif; font-size:26px; font-weight:900;
      letter-spacing:.05em; color:var(--ink2);
    }
    .b2n-brand-name b{ color:var(--ink) }
    .b2n-edition{
      margin-top:7px; text-align:center; font-size:var(--fs-caption); font-weight:800; color:var(--ink2);
      letter-spacing:.12em; padding-bottom:15px;
    }
    .b2n-rule-double{ border-top:3px solid #1c1917; margin-top:0; }
    .b2n-rule-double-thin{ border-top:1px solid #1c1917; margin-top:3px; }
    .b2n-headline-wrap{ padding:22px 26px 0; background:linear-gradient(180deg,#faf7f0 0%,#f8f5ee 100%); }
    .b2n-headline{
      font-family:'Noto Serif KR', Georgia, serif;
      font-size:44px; font-weight:900; line-height:1.18; letter-spacing:-.02em; color:var(--ink);
    }
    .b2n-dek{
      margin-top:10px; font-size:14px; line-height:1.7; color:var(--ink2); max-width:1100px;
      border-left:4px solid var(--accent); padding-left:12px;
    }
    .b2n-analysis{
      margin-top:14px; font-size:12.5px; line-height:1.8; color:var(--ink); max-width:1180px;
      background:#faf9f6; border:1px solid rgba(28,25,23,.14); border-radius:8px; padding:12px 16px;
      column-gap:22px;
    }
    .b2n-analysis b{ color:var(--ink); font-weight:900 }
    .b2n-bylinebar{
      display:flex; gap:14px; flex-wrap:wrap; margin-top:14px; padding-top:10px; padding-bottom:16px;
      border-top:1px dashed rgba(28,25,23,.3); font-size:var(--fs-caption); font-weight:700; color:var(--ink2);
    }
    .b2n-body{ display:flex; gap:26px; padding:26px 30px 0 }
    .b2n-body > .b2n-col:first-child{ width:785px; flex-shrink:0 }
    .b2n-body > .b2n-col:last-child{ flex:1; min-width:0 }
    .b2n-col-title{
      display:flex; align-items:center; gap:7px;
      font-size:var(--fs-sm); font-weight:900; letter-spacing:.08em; text-transform:uppercase;
      color:var(--ink2); margin:18px 0 10px; padding-bottom:7px; border-bottom:1.5px solid rgba(28,25,23,.55);
    }
    .b2n-col-title:first-child{ margin-top:0 }
    .b2n-col-title i{ display:inline-block; width:7px; height:7px; border-radius:2px; background:var(--accent); flex-shrink:0; font-style:normal }
    .b2n-feature{
      display:flex; gap:18px; background:linear-gradient(155deg,#fefcf8 0%,#fbf8f2 65%,#f5efe1 100%);
      border:1px solid rgba(28,25,23,.14); border-top:3px solid #d4af37;
      border-radius:var(--r2); padding:16px; box-shadow:0 12px 30px rgba(15,23,42,.10), inset 0 1px 0 rgba(255,255,255,.6); margin-bottom:16px;
    }
    .b2n-feature-empty{
      background:#fbf8f2; border:1px dashed rgba(28,25,23,.25); border-radius:12px; padding:20px;
      text-align:center; color:var(--ink2); font-size:var(--fs-sm); margin-bottom:16px;
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
    .b2n-feature-univ{ font-size:12.5px; font-weight:700; color:var(--ink2) }
    .b2n-feature-stats{ display:flex; gap:14px; margin-top:6px }
    .b2n-fstat{ display:flex; flex-direction:column; align-items:center; }
    .b2n-fstat b{ font-size:19px; font-weight:900; color:var(--ink) }
    .b2n-fstat i{ font-style:normal; font-size:10px; font-weight:700; color:var(--ink2) }
    .b2n-fstat-streak b{ color:#b45309 }
    .b2n-fstat-sub{ margin-left:2px; padding-left:12px; border-left:1px dashed rgba(28,25,23,.2) }
    .b2n-fstat-sub b{ font-size:var(--fs-base); color:#8a8578; font-weight:800 }
    .b2n-row{
      display:flex; gap:10px; align-items:flex-start; background:#fbf8f2; border:1px solid rgba(28,25,23,.12);
      border-radius:var(--r); padding:9px 12px; margin-bottom:8px;
    }
    .b2n-row-tag{
      flex-shrink:0; font-size:10px; font-weight:900; color:#fff; background:#111827;
      border-radius:6px; padding:4px 8px; letter-spacing:.02em; white-space:nowrap;
    }
    .b2n-row-body{ font-size:var(--fs-sm); color:var(--ink2); display:flex; flex-wrap:wrap; gap:6px; align-items:baseline }
    .b2n-row-body b{ font-size:var(--fs-base); color:var(--ink) }
    .b2n-row-univ{ color:var(--ink2); font-size:var(--fs-caption) }
    .b2n-row-stat{ color:var(--ink); font-weight:900; font-size:11.5px }
    .b2n-row-wr{ color:var(--ink2); font-weight:700; font-size:10.5px }
    .b2n-row-extra{ color:var(--ink); font-weight:800; font-size:var(--fs-caption) }
    .b2n-standings{ background:#fbf8f2; border:1px solid rgba(28,25,23,.14); border-radius:14px; overflow:hidden; margin-bottom:16px; box-shadow:0 4px 12px rgba(15,23,42,.05) }
    .b2n-stline{
      display:flex; gap:9px; align-items:center;
      padding:9px 12px; font-size:var(--fs-sm); border-bottom:1px solid rgba(28,25,23,.08);
    }
    .b2n-stline:nth-child(even){ background:rgba(28,25,23,.025) }
    .b2n-stline:last-child{ border-bottom:none }
    .b2n-stline-rank{
      width:22px; height:22px; line-height:22px; flex-shrink:0; font-weight:900; font-size:var(--fs-caption);
      color:var(--ink2); text-align:center; border-radius:50%; background:rgba(28,25,23,.06);
    }
    .b2n-stline-rank.r1{ background:linear-gradient(160deg,#fde68a,#d97706); color:#78350f; box-shadow:0 2px 6px rgba(217,119,6,.35) }
    .b2n-stline-rank.r2{ background:linear-gradient(160deg,#e7e5e4,#a8a29e); color:#292524; box-shadow:0 2px 6px rgba(120,113,108,.3) }
    .b2n-stline-rank.r3{ background:linear-gradient(160deg,#e7bfa3,#b4623a); color:#431407; box-shadow:0 2px 6px rgba(180,98,58,.3) }
    .b2n-stline-name{ flex:1; min-width:0; font-weight:800; color:var(--ink); overflow:hidden; text-overflow:ellipsis; white-space:nowrap }
    .b2n-stline-rec{ flex-shrink:0; color:var(--ink); font-weight:800; font-size:11.5px; white-space:nowrap }
    .b2n-stline-wr{ flex-shrink:0; font-weight:600; color:var(--ink2); font-size:var(--fs-caption); white-space:nowrap }
    .b2n-rd{ font-size:10px; font-weight:800; border-radius:6px; padding:2px 6px; text-align:center; white-space:nowrap }
    .b2n-rd.up{ background:#f0fdf4; color:#15803d }
    .b2n-rd.down{ background:#fef2f2; color:#b91c1c }
    .b2n-rd.same{ background:#f8fafc; color:#64748b }
    .b2n-rd.new{ background:#f5f3ff; color:#5b21b6 }
    .b2n-kpis{ display:flex; gap:10px; margin-bottom:16px }
    .b2n-kpi{
      position:relative; flex:1; min-width:0; color:var(--ink); border-radius:12px; padding:13px 14px 13px 50px;
      background:linear-gradient(155deg,#fefcf8 0%,#fbf8f2 60%,#f5efe1 100%);
      border:1px solid rgba(28,25,23,.1); border-top:3px solid rgba(28,25,23,.22);
      box-shadow:0 6px 16px rgba(15,23,42,.07), inset 0 1px 0 rgba(255,255,255,.6);
    }
    .b2n-kpi-ico{
      position:absolute; left:12px; top:50%; transform:translateY(-50%);
      width:26px; height:26px; border-radius:50%; font-size:var(--fs-base);
      display:flex; align-items:center; justify-content:center;
      background:radial-gradient(120% 120% at 30% 25%, #fff 0%, #ede4cf 100%);
      box-shadow:0 2px 6px rgba(15,23,42,.14), inset 0 0 0 1px rgba(28,25,23,.08);
    }
    .b2n-kpi b{ display:block; font-size:23px; font-weight:900; color:var(--ink); line-height:1.2 }
    .b2n-kpi i{ font-style:normal; font-size:10px; font-weight:800; color:var(--ink2); letter-spacing:.02em }
    .b2n-silent-row{ display:flex; align-items:center; flex-wrap:wrap; gap:6px; margin-top:12px; padding-top:12px; border-top:1px dashed var(--rule2,#d6d0c4) }
    .b2n-silent-label{ font-size:9px; font-weight:900; color:var(--ink2); margin-right:2px }
    .b2n-silent-chip{ font-size:10px; font-weight:700; color:var(--ink2); background:var(--paper2,#f4f1ea); border:1px solid var(--rule2,#d6d0c4); border-radius:999px; padding:3px 9px }
    .b2n-silent-more{ font-size:10px; font-weight:700; color:var(--ink2) }
    .b2n-worst{ background:#fbf8f2; border:1px dashed rgba(28,25,23,.25); border-radius:12px; padding:12px; margin-top:16px }
    .b2n-worst-title{ font-size:var(--fs-caption); font-weight:900; color:var(--ink2); margin-bottom:6px }
    .b2n-empty{ font-size:var(--fs-sm); color:var(--ink2); padding:10px 0 }
    .b2n-aces-section{ padding:4px 26px 22px }
    .b2n-aces-title{
      display:flex; align-items:center; gap:7px;
      font-size:var(--fs-sm); font-weight:900; letter-spacing:.08em; text-transform:uppercase;
      color:var(--ink2); margin:6px 0 12px; padding-bottom:7px; border-bottom:1.5px solid rgba(28,25,23,.55);
    }
    .b2n-aces-title i{ display:inline-block; width:7px; height:7px; border-radius:2px; background:var(--accent); flex-shrink:0; font-style:normal }
    .b2n-aces-grid{ display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:12px }
    .b2n-roster-grid{ display:flex; align-items:flex-start; gap:12px }
    .b2n-roster-col{ flex:1; min-width:0; display:flex; flex-direction:column; gap:12px }
    .b2n-roster-card{
      --_c:#9f1d1d;
      background:#fff; border:1px solid rgba(28,25,23,.12); border-radius:14px;
      padding:0 0 6px; box-shadow:0 4px 12px rgba(15,23,42,.05); overflow:hidden;
    }
    .b2n-roster-head{
      display:flex; align-items:center; gap:6px; padding:9px 13px;
      background:rgba(28,25,23,.035);
      border-bottom:1px solid rgba(28,25,23,.1);
    }
    .b2n-roster-count{ font-size:10px; font-weight:700; color:var(--ink2); margin-left:auto }
    .b2n-roster-list{ display:flex; flex-direction:column; padding:2px 13px 0 }
    .b2n-roster-row{
      display:flex; align-items:center; gap:8px; padding:5.5px 0;
      border-bottom:1px solid rgba(28,25,23,.06); font-size:var(--fs-caption);
    }
    .b2n-roster-row:nth-child(even){ background:rgba(28,25,23,.022); margin:0 -13px; padding-left:13px; padding-right:13px }
    .b2n-roster-row:last-child{ border-bottom:none }
    .b2n-roster-name{ flex:1; min-width:0; font-weight:800; color:#111827; overflow:hidden; text-overflow:ellipsis; white-space:nowrap }
    .b2n-roster-rec{ flex-shrink:0; color:var(--ink2); font-weight:700; white-space:nowrap }
    .b2n-roster-wr{ flex-shrink:0; font-weight:900; min-width:34px; text-align:right; white-space:nowrap }
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
      display:flex; align-items:center; gap:6px; font-size:10.5px; font-weight:900; color:var(--ink2);
      text-transform:uppercase; letter-spacing:.02em; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
    }
    .b2n-ace-dot{ width:7px; height:7px; border-radius:50%; flex-shrink:0 }
    .b2n-ace-name{ font-size:14px; font-weight:900; color:var(--ink); white-space:nowrap; overflow:hidden; text-overflow:ellipsis }
    .b2n-ace-rec{ font-size:var(--fs-caption); font-weight:700; color:var(--ink2); white-space:nowrap; overflow:hidden; text-overflow:ellipsis }
    .b2n-ace-empty{ font-size:var(--fs-caption); color:var(--ink2); font-weight:600 }
    .b2n-footer{
      margin-top:22px; padding:14px 26px 0; border-top:3px double rgba(28,25,23,.5);
      display:flex; justify-content:space-between; align-items:center; font-size:10px; font-weight:700; color:var(--ink2);
    }
    .b2n-footer-dot{ display:inline-block; width:6px; height:6px; border-radius:50%; background:var(--accent); margin-right:6px; vertical-align:middle }
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
        ${_newsRaceStatsHtml(ctx)}
        ${ctx.worstPlayer && ctx.worstPlayer.p ? `<div class="b2n-worst">
          <div class="b2n-worst-title">💧 ${_esc(worstLabel)}</div>
          ${_newsStatRow('최다패', ctx.worstPlayer, '')}
        </div>` : ''}
      </div>
      <div class="b2n-col">
        <div class="b2n-kpis">
          <div class="b2n-kpi"><span class="b2n-kpi-ico">🎮</span><b>${ctx.totalGames||0}</b><i>총 경기수</i></div>
          <div class="b2n-kpi"><span class="b2n-kpi-ico">🏫</span><b>${ctx.activeUnivs||0}</b><i>활동 대학</i></div>
        </div>
        <div class="b2n-col-title"><i></i>대학 순위</div>
        ${_newsStandingsHtml(ctx)}
        ${_newsSilentUnivsHtml(ctx)}
      </div>
    </div>
    ${_newsUnivAcesHtml(ctx)}
    ${_newsUnivRostersHtml(ctx)}
    <div class="b2n-footer">
      <span><span class="b2n-footer-dot"></span>STAR DATACENTER · star-datacenter</span>
      <span>${_esc(meta.univ)} · ${_esc(info.title||'브리핑')}</span>
    </div>
  </div>`;
}
/* ══════════════════════════════════════
   브리핑 저장 — 다양한 모드(기본/신문기사/포스터/미니멀)
   통계탭 스트리머 리포트의 "미리보기 → 스타일 전환 → 다운로드" 흐름을 그대로 차용.
   각 모드는 window._b2BriefingExportCtx(board2-briefing.js가 저장해둔 통계 스냅샷)를
   바탕으로 완전히 독립된 레이아웃을 렌더링해 캡처한다.
══════════════════════════════════════ */
var BRIEF_MODES = [
  ['basic','📋 기본'],
  ['newspaper','📰 신문기사'],
  ['poster','🎬 포스터'],
  ['minimal','⬜ 미니멀']
];

// MVP가 속한 대학의 브랜드컬러(포스터 배경/사진 배지에 사용). 대학 정보가 없으면 기본 남색.
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

function _briefModeConfig(mode){
  switch(mode){
    case 'basic':   return { buildHtml:null, css:null, sheetClass:null, width:null, scale:4, bg:'#ffffff', fixedHeight:null, label:'기본' };
    case 'poster':  return { buildHtml:_posterBuildHtml,  css:_posterCss,  sheetClass:'bp-sheet', width:1000, scale:2,   bg:'#05070c',  fixedHeight:null, label:'포스터' };
    case 'minimal': return { buildHtml:_minimalBuildHtml, css:_minimalCss, sheetClass:'bm-sheet', width:860,  scale:2,   bg:'#ffffff',  fixedHeight:null, label:'미니멀' };
    default:        return { buildHtml:_newsBuildHtml,    css:_newsCss,    sheetClass:'b2n-sheet', width:1280, scale:2.5, bg:'#ece7da',  fixedHeight:null, label:'신문기사' };
  }
}

// [3차 방어선] `background-clip:text` + `-webkit-text-fill-color:transparent` 조합으로 만든
// 그라디언트 글자(예: 브리핑 헤드라인)는 html2canvas가 텍스트 클리핑을 지원하지 않아,
// 글자 모양대로 잘리지 않은 배경(그라디언트/단색)이 통째로 칠해지고 글자 자체는 투명 처리되어
// "까맣게(어둡게) 뭉개진 네모 블록"으로 캡처되는 버그가 있다. 캡처 직전 클론 문서에서 이런 요소를
// 찾아 그라디언트 배경을 제거하고, 원래 선언돼 있던 solid color(대개 color 속성)로 텍스트를
// 그대로 그려지도록 강제한다.
function _fixGradientTextClipInDoc(rootEl){
  try{
    if(!rootEl) return;
    const doc = rootEl.ownerDocument;
    const win = doc && doc.defaultView;
    if(!win || typeof win.getComputedStyle!=='function') return;
    const TRANSPARENT_RE=/^transparent$|rgba?\(\s*0\s*,\s*0\s*,\s*0\s*,\s*0\s*\)/i;
    const walk=(el)=>{
      if(!el || el.nodeType!==1) return;
      let cs=null;
      try{ cs=win.getComputedStyle(el); }catch(e){}
      if(cs){
        const clip = cs.webkitBackgroundClip || cs.backgroundClip || '';
        const fill = cs.webkitTextFillColor || '';
        if(/text/i.test(clip) && fill && TRANSPARENT_RE.test(fill)){
          let solid = cs.color;
          if(!solid || TRANSPARENT_RE.test(solid)) solid = '#1e293b';
          el.style.background = 'none';
          el.style.backgroundImage = 'none';
          el.style.webkitBackgroundClip = 'border-box';
          el.style.backgroundClip = 'border-box';
          el.style.webkitTextFillColor = solid;
          el.style.color = solid;
        }
      }
      const kids = el.children;
      for(let i=0;i<(kids?kids.length:0);i++) walk(kids[i]);
    };
    walk(rootEl);
  }catch(e){}
}

// [2차 방어선] 위의 텍스트 기반 스캔(_sanitizeUnsupportedCssFunctions / _sanitizeUnsupportedColorsInDoc)은
// style 속성과 접근 가능한 스타일시트 규칙의 "원문 텍스트"만 본다. 크로스오리진이라 CSSOM 접근이
// 막힌 시트가 있거나 텍스트 스캔이 놓친 경우를 대비해, 실제 계산된 스타일(getComputedStyle)을
// 한 번 더 검사해서 여전히 미지원 색 함수가 남아있으면 캔버스로 계산한 값으로 강제 덮어쓴다.
function _forceResolveComputedColors(rootEl){
  try{
    if(!rootEl) return;
    const doc = rootEl.ownerDocument;
    const win = doc && doc.defaultView;
    if(!win || typeof win.getComputedStyle!=='function') return;
    const RISKY=/color-mix\(|(?:^|[^-\w])color\(|oklch\(|oklab\(|(?:^|[^-\w])lab\(|(?:^|[^-\w])lch\(|hwb\(/i;
    const SIMPLE_PROPS=['color','backgroundColor','borderTopColor','borderRightColor','borderBottomColor','borderLeftColor','outlineColor','textDecorationColor','caretColor','columnRuleColor'];
    const TEXT_PROPS=['boxShadow','backgroundImage','borderImage'];
    const walk=(el)=>{
      if(!el || el.nodeType!==1) return;
      let cs=null;
      try{ cs=win.getComputedStyle(el); }catch(e){}
      if(cs){
        SIMPLE_PROPS.forEach((p)=>{
          try{
            const v=cs[p];
            if(v && RISKY.test(v)) el.style[p]=_tryResolveColorViaCanvas(v)||_scrubUnsupportedColors(v);
          }catch(e){}
        });
        TEXT_PROPS.forEach((p)=>{
          try{
            const v=cs[p];
            if(v && RISKY.test(v)) el.style[p]=_scrubUnsupportedColors(v);
          }catch(e){}
        });
      }
      try{
        if(el.namespaceURI==='http://www.w3.org/2000/svg'){
          ['fill','stroke'].forEach((attr)=>{
            const v=el.getAttribute && el.getAttribute(attr);
            if(v && RISKY.test(v)) el.setAttribute(attr, _scrubUnsupportedColors(v));
          });
        }
      }catch(e){}
      const kids=el.children;
      for(let i=0;i<(kids?kids.length:0);i++) walk(kids[i]);
    };
    walk(rootEl);
  }catch(e){}
}
/* html2canvas로 만들 캔버스가 브라우저의 최대 캔버스 크기를 넘지 않도록 scale을
   안전한 값으로 낮춘다. 브라우저마다 한도가 달라(Firefox는 한 변 32767px 또는
   전체 픽셀 수 한도, Safari 구형 기기는 한 변 4096px, Chrome도 메모리 한도가 있음)
   보수적인 기준값으로 계산한다. 브리핑 '전체' 모드처럼 콘텐츠가 길어질수록 실제
   렌더링 높이가 커지는 경우, 고정 scale(2배)을 그대로 곱하면 한 변 또는 전체 픽셀 수가
   한도를 넘어 "Canvas exceeds max size" 오류가 발생했던 문제를 막기 위함이다. */
var CAPTURE_MAX_DIM = 14000;      // 캔버스 한 변 최대 픽셀
var CAPTURE_MAX_AREA = 80000000;  // 캔버스 전체 최대 픽셀 수 (약 8000x10000)
function _safeExportScale(w, h, desiredScale){
  w = Math.max(1, w||1); h = Math.max(1, h||1);
  desiredScale = desiredScale || 1;
  let scale = desiredScale;
  if(w*scale > CAPTURE_MAX_DIM) scale = Math.min(scale, CAPTURE_MAX_DIM/w);
  if(h*scale > CAPTURE_MAX_DIM) scale = Math.min(scale, CAPTURE_MAX_DIM/h);
  if((w*scale)*(h*scale) > CAPTURE_MAX_AREA) scale = Math.min(scale, Math.sqrt(CAPTURE_MAX_AREA/(w*h)));
  if(!isFinite(scale) || scale<=0) scale = 0.1;
  return Math.max(0.1, Math.min(desiredScale, scale));
}
/* '기본' 모드: 브리핑 화면 전체가 아니라, "데이터 범위" 아래의 본문(#b2w2-basic-export-root)만
   실제 렌더링된 화면 그대로 캡처한다. */
async function _basicCaptureBase(){
  const el = document.getElementById('b2w2-basic-export-root') || document.getElementById('b2w2-export-root');
  if(!el) throw new Error('브리핑 본문 화면을 찾을 수 없습니다. 브리핑 탭을 연 상태에서 다시 시도해주세요.');
  try{ await (window.ensureHtml2Canvas && window.ensureHtml2Canvas()); }catch(e){}
  await _imgToDataUrls(el);
  try{ if(typeof _waitForImages==='function') await _waitForImages(el,1500); }catch(e){}
  try{ await _waitForFonts(2000); }catch(e){}
  try{ _sanitizeUnsupportedCssFunctions(el); }catch(e){}
  // '기본' 저장본 배경색: 예전엔 무조건 흰색으로 고정했는데, 다크모드(body.dark)나
  // 어두운 브리핑 테마(네온/이스포츠 등)에서는 카드 자체는 어두운 톤 그대로 나오면서
  // 카드 사이 여백/전체 배경만 흰색으로 붕 떠 보이는 문제가 있었다.
  // 현재 적용된 테마의 --b2w-paper 토큰(라이트 테마=밝은 색, 다크 테마=어두운 색)을
  // 그대로 읽어와서 배경으로 쓰면, 화면에서 보던 톤과 저장 이미지 톤이 항상 일치한다.
  const wrapEl = (el.closest ? el.closest('.b2w2-wrap') : null) || el;
  let bg = '#ffffff';
  try{
    const paperVar = getComputedStyle(wrapEl).getPropertyValue('--b2w-paper').trim();
    if(paperVar) bg = _tryResolveColorViaCanvas(paperVar) || paperVar;
  }catch(e){}
  // 브리핑 화면(.b2w2-wrap)은 반응형 레이아웃이라, 사용자가 좁은 창(모바일 폭 등)에서
  // 저장 버튼을 눌러도 그 화면 그대로 캡처하면 글자와 카드가 모두 작게 찌그러진 채로
  // 저장됨. '기본' 모드는 항상 데스크톱 디자인 폭(1320px)으로 강제 렌더링해서
  // 실제 화면 크기와 무관하게 큼직하고 읽기 좋은 이미지가 저장되도록 한다.
  const BASIC_CAPTURE_WIDTH = 1320;
  const onclone = (clonedDoc)=>{
    try{ clonedDoc.querySelectorAll('.no-export').forEach(n=>n.remove()); }catch(e){}
    // '기본' 이미지 저장본에서는 MVP 카드 위에 얹히는 가독성 보조 효과(그라디언트/비네트/틴트 등)를
    // 빼고 사진을 그대로 보여달라는 요청 반영 — data-fx만 "none"으로 바꿔 오버레이 CSS를 끄고,
    // 카드 레이아웃(디자인 모드) 자체는 그대로 유지한다.
    try{
      clonedDoc.querySelectorAll('[data-fx]').forEach(card=>{
        card.setAttribute('data-fx','none');
        card.style.setProperty('--b2mvp-fx-op','0');
      });
    }catch(e){}
    // 카드 모서리의 장식용 원형 블롭과 box-shadow가 overflow:hidden과 함께 쓰이는데,
    // html2canvas가 이 조합을 완벽히 클리핑하지 못해 카드 모서리/하단에 회색 얼룩이 찍히는
    // 경우가 있었다. '기본' 저장본에서는 순수 장식 요소이므로 꺼서 깨끗하게 캡처되도록 한다.
    // (실제 회색 원인은 캔버스 바탕색이 배경 토큰과 안 맞았던 것 — 위에서 --b2w-paper로 해결.
    //  카드 상단 포인트 컬러 바(.b2w2-highlight-card::after)는 원인이 아니었고 화면과 동일하게 살려둔다.)
    // 장식용 원형 블롭은 카드마다 ::before/::after로 위치가 제각각이라(하이라이트 카드는
    // ::before, KPI 카드는 ::after) 둘 다 꺼야 한다 — 하나만 끄면 overflow:visible 상태에서
    // 나머지 하나가 카드 밖(그리드 간격/이웃 카드 위)으로 그대로 새어나온다.
    // MVP 카드의 ::after(호버 시 스윽 지나가는 대각선 샤인 스윕)는 정지 상태에서도 카드
    // 왼쪽 밖으로 translateX(-130%)만큼 밀려나 있어 캡처에 불필요하므로 함께 끈다.
    // (MVP 카드는 배경 프로필 사진을 카드 모양대로 잘라내는 데 overflow:hidden이 꼭 필요해서
    //  overflow는 그대로 유지하고, ::after만 display:none으로 제거한다.)
    // 하이라이트/KPI/일반 카드는 ::before·::after를 꺼버려 더 이상 카드 밖으로 삐져나갈
    // 장식 요소가 없으므로, 애초에 그걸 가두려고 걸어뒀던 overflow:hidden도 같이 풀어준다 —
    // border-radius와 overflow:hidden 조합 자체가 html2canvas에서 모서리에 회색 얼룩을
    // 남기는 경우가 있었다.
    try{
      const fixStyle = clonedDoc.createElement('style');
      fixStyle.textContent = `
        .b2w2-highlight-card::before, .b2w2-card::before, .b2w2-mvp-card::before,
        .b2w2-kpi-card::before, .b2w2-kpi-card::after, .b2w2-mvp-card::after { display:none !important; }
        .b2w2-highlight-card, .b2w2-kpi-card, .b2w2-card { box-shadow:none !important; border:none !important; overflow:visible !important; }
        .b2w2-mvp-card { box-shadow:none !important; border:none !important; }
        #b2w2-basic-export-root, .b2w2-kpi-grid, .b2w2-feature-row, .b2w2-highlight-grid { background:${bg} !important; }
      `;
      clonedDoc.head.appendChild(fixStyle);
    }catch(e){}
    _sanitizeUnsupportedColorsInDoc(clonedDoc);
    try{ _forceResolveComputedColors(clonedDoc.getElementById('b2w2-basic-export-root') || clonedDoc.getElementById('b2w2-export-root')); }catch(e){}
    try{ _fixGradientTextClipInDoc(clonedDoc.getElementById('b2w2-basic-export-root') || clonedDoc.getElementById('b2w2-export-root')); }catch(e){}
    try{ _killCloneAnimations(clonedDoc); }catch(e){}
  };
  const baseOpts = {
    backgroundColor:bg, useCORS:true, allowTaint:false, logging:false, imageTimeout:20000,
    windowWidth: BASIC_CAPTURE_WIDTH + 80, scrollX:0, scrollY:0, onclone
  };
  // 안전 배율(scale) 계산용 예상 크기를 구한다.
  // 예전엔 scale:1로 html2canvas를 한 번 통째로 실행해서(=전체 페이지를 픽셀 단위로 완전히
  // 한 번 그려본 뒤 크기만 재고 버림) 이 값을 얻었는데, 대학이 많아 콘텐츠가 길수록 이
  // "측정용" 렌더링 자체가 무거워 저장/모드 전환이 느렸다. html2canvas를 실행하지 않고
  // DOM을 화면 밖에 실제 목표 폭(1320px)으로 잠깐 복제해 브라우저 레이아웃 계산만 시켜서
  // (래스터라이즈 없이) scrollHeight를 재는 방식으로 바꿔, 무거운 렌더링 없이 크기를 추정한다.
  const { naturalW, naturalH } = await _measureBasicCaptureSize(wrapEl, el, BASIC_CAPTURE_WIDTH);
  const scale = _safeExportScale(naturalW, naturalH, 4);
  return await html2canvas(el, { ...baseOpts, scale });
}
// #b2w2-basic-export-root(또는 wrap 전체)를 실제로 캔버스에 그리지 않고, 목표 폭(targetWidth)으로
// 화면 밖에 잠깐 복제해서 레이아웃만 계산한 뒤 크기를 재고 치운다. html2canvas 전체 래스터라이즈보다
// 훨씬 가벼워서, 이 측정 실패 시에도 저장 자체는 계속 진행되도록 안전한 기본값으로 폴백한다.
async function _measureBasicCaptureSize(wrapEl, el, targetWidth){
  const fallback = { naturalW: targetWidth, naturalH: Math.max(1, el.scrollHeight || 2000) };
  try{
    const holder = document.createElement('div');
    holder.style.cssText = `position:fixed;left:-99999px;top:0;width:${targetWidth}px;visibility:hidden;pointer-events:none;`;
    const clone = wrapEl.cloneNode(true);
    clone.style.width = targetWidth + 'px';
    clone.style.maxWidth = 'none';
    holder.appendChild(clone);
    document.body.appendChild(holder);
    let target = clone;
    if(wrapEl !== el && el.id){
      target = clone.querySelector('#' + el.id) || clone;
    }
    const h = target.scrollHeight || fallback.naturalH;
    const w = target.scrollWidth || targetWidth;
    document.body.removeChild(holder);
    return { naturalW: w, naturalH: h };
  }catch(e){ return fallback; }
}

async function _briefGenerateCanvas(mode, meta){
  const ctx = window._b2BriefingExportCtx;
  if(!ctx) throw new Error('브리핑 데이터를 아직 불러오지 못했습니다. 브리핑 화면을 한 번 연 뒤 다시 시도해주세요.');
  if(mode === 'basic') return await _basicCaptureBase();
  const cfg = _briefModeConfig(mode);
  const holder=document.createElement('div');
  // html2canvas는 뷰포트 밖(left:-99999px)에 있는 콘텐츠를 렌더 윈도우 밖으로 취급해
  // 잘라내는 경우가 있어, 실제 좌표(0,0)에 두고 opacity:0으로 화면에는 보이지 않게 처리한다.
  holder.style.cssText='position:fixed;left:0;top:0;opacity:0;pointer-events:none;z-index:-1';
  holder.innerHTML = `<style>${cfg.css()}</style>` + cfg.buildHtml(ctx, meta);
  document.body.appendChild(holder);
  try{
    const sheet=holder.querySelector('.'+cfg.sheetClass);
    await _imgToDataUrls(sheet);
    try{ if(typeof _waitForImages==='function') await _waitForImages(sheet,1500); }catch(e){}
    try{ await _waitForFonts(2000); }catch(e){}
    _sanitizeUnsupportedCssFunctions(sheet);
    const w=cfg.width;
    const h=cfg.fixedHeight || Math.max(1, Math.ceil(sheet.scrollHeight||0));
    const scale = _safeExportScale(w, h, cfg.scale);
    const canvas=await html2canvas(sheet,{
      backgroundColor:cfg.bg, scale:scale, useCORS:true, allowTaint:false, logging:false,
      imageTimeout:20000, width:w, height:h, windowWidth:w+80, windowHeight:h+80, scrollX:0, scrollY:0,
      onclone:(clonedDoc)=>{
        _sanitizeUnsupportedColorsInDoc(clonedDoc);
        try{ _forceResolveComputedColors(clonedDoc.querySelector('.'+cfg.sheetClass)); }catch(e){}
        try{ _fixGradientTextClipInDoc(clonedDoc.querySelector('.'+cfg.sheetClass)); }catch(e){}
        try{ _killCloneAnimations(clonedDoc); }catch(e){}
      }
    });
    return canvas;
  } finally {
    try{ if(holder.parentNode) holder.parentNode.removeChild(holder); }catch(e){}
  }
}

function _briefFilename(mode, meta){
  const cfg = _briefModeConfig(mode);
  const rawName=`브리핑_${cfg.label}_${meta.presetLabel}_${String(window._b2WeeklyDateFrom||'').slice(0,10)}_${String(window._b2WeeklyDateTo||'').slice(0,10)}${meta.univ!=='전체'?'_'+meta.univ:''}.png`;
  return rawName.replace(/[\\/:*?"<>|]+/g,'_');
}

/* ─── 미리보기 모달 스타일 (1회 주입) — render-capture-utils.js는 항상 로드되는
   core 번들이므로, 통계탭 전용 스타일(pr-report-style, lazy 로드)에 기대지 않고
   자체 클래스로 완전히 독립시킨다. ─── */
function _briefInjectPreviewCss(){
  if(document.getElementById('brief-preview-style')) return;
  const s=document.createElement('style');
  s.id='brief-preview-style';
  s.textContent = `
    .brief-img-preview-overlay{position:fixed;inset:0;background:rgba(15,23,42,.62);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px;backdrop-filter:blur(2px)}
    .brief-img-preview-modal{background:var(--white);border-radius:20px;box-shadow:var(--sh3);max-width:min(1440px,96vw);max-height:94vh;display:flex;flex-direction:column;overflow:hidden}
    .brief-img-preview-hdr{display:flex;align-items:center;justify-content:space-between;padding:14px 18px;border-bottom:1px solid var(--border);font-size:14px;font-weight:900;color:var(--text1);flex-shrink:0}
    .brief-img-preview-x{border:none;background:transparent;font-size:15px;cursor:pointer;color:var(--text2);padding:4px 8px;border-radius:8px}
    .brief-img-preview-x:hover{background:var(--surface);color:var(--text1)}
    .brief-mode-row{display:flex;gap:6px;padding:10px 18px;border-bottom:1px solid var(--border);overflow-x:auto;flex-wrap:wrap;flex-shrink:0}
    .brief-mode-btn{border:1.5px solid var(--border2);background:var(--white);color:var(--text2);font-size:12px;font-weight:800;padding:7px 13px;border-radius:999px;cursor:pointer;white-space:nowrap;transition:.12s}
    .brief-mode-btn:hover{border-color:var(--blue)}
    .brief-mode-btn.on{background:var(--blue);border-color:var(--blue);color:#fff}
    .brief-img-preview-body{flex:1;min-height:0;overflow:auto;padding:14px;background:var(--surface);display:flex;justify-content:center;align-items:flex-start;position:relative}
    .brief-img-preview-body img{width:100%;max-width:100%;height:auto;flex-shrink:0;display:block;transition:opacity .15s}
    /* '기본' 모드처럼 페이지 전체를 그대로 캡처하면 이미지가 세로로 매우 길어져,
       기본값(width:100%)으로는 계속 스크롤해야 전체를 확인할 수 있었다.
       기본은 "화면에 맞춰 축소해서 한눈에 보기"로 하고, 원본 크기로 보고 싶을 때만
       버튼으로 전환하도록 분리한다. */
    .brief-img-preview-body.fit-mode{align-items:center}
    .brief-img-preview-body.fit-mode img{width:auto;height:auto;max-width:100%;max-height:100%;object-fit:contain}
    .brief-fit-toggle{border:1.5px solid var(--border2);background:var(--white);color:var(--text2);font-size:12px;font-weight:800;padding:7px 12px;border-radius:999px;cursor:pointer;white-space:nowrap;margin-left:auto}
    .brief-fit-toggle:hover{border-color:var(--blue)}
    .brief-img-preview-ftr{display:flex;justify-content:flex-end;gap:8px;padding:12px 18px;border-top:1px solid var(--border);flex-shrink:0}
    .brief-loading .brief-img-preview-body img{opacity:.35}
    .brief-loading .brief-img-preview-body::after{content:"이미지 생성 중...";position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:12px;font-weight:800;color:var(--text2);background:var(--white);padding:8px 14px;border-radius:999px;box-shadow:var(--sh2,0 4px 14px rgba(0,0,0,.1))}
    .brief-btn{border:none;border-radius:10px;padding:9px 16px;font-size:13px;font-weight:800;cursor:pointer}
    .brief-btn-ghost{background:var(--surface);color:var(--text2)}
    .brief-btn-ghost:hover{background:var(--border)}
    .brief-btn-primary{background:var(--blue);color:#fff}
    .brief-btn-primary:hover{background:var(--blue-d,var(--blue))}
  `;
  document.head.appendChild(s);
}

function _briefShowImagePreview(canvas, mode, meta){
  _briefInjectPreviewCss();
  _briefCloseImagePreview();
  const dataUrl = canvas.toDataURL('image/png');
  const wrap=document.createElement('div');
  wrap.id='brief-img-preview-overlay';
  wrap.className='brief-img-preview-overlay';
  wrap.innerHTML = `
    <div class="brief-img-preview-modal">
      <div class="brief-img-preview-hdr">
        <span>📰 브리핑 이미지 미리보기</span>
        <button type="button" class="brief-img-preview-x" onclick="_briefCloseImagePreview()">✕</button>
      </div>
      <div class="brief-mode-row">
        ${BRIEF_MODES.map(([k,lbl])=>`<button type="button" class="brief-mode-btn ${k===mode?'on':''}" data-mode="${k}" onclick="_briefSwitchMode('${k}')">${lbl}</button>`).join('')}
        <button type="button" class="brief-fit-toggle" onclick="_briefTogglePreviewFit()">🔍 원본 크기로 보기</button>
      </div>
      <div class="brief-img-preview-body fit-mode"><img src="${dataUrl}" alt="브리핑 미리보기"></div>
      <div class="brief-img-preview-ftr">
        <button type="button" class="brief-btn brief-btn-ghost" onclick="_briefCloseImagePreview()">취소</button>
        <button type="button" class="brief-btn brief-btn-primary" onclick="_briefConfirmSaveImage()">📥 다운로드</button>
      </div>
    </div>`;
  wrap.addEventListener('click', (e)=>{ if(e.target===wrap) _briefCloseImagePreview(); });
  document.body.appendChild(wrap);
}
function _briefCloseImagePreview(){
  const el = document.getElementById('brief-img-preview-overlay');
  if(el) el.remove();
}
// 화면맞춤(축소해서 한번에 보기) ↔ 원본 크기(가로 100%, 세로 스크롤) 전환.
// '기본' 모드처럼 세로로 매우 긴 이미지를 처음부터 원본 크기로 띄우면 계속 스크롤해야
// 전체를 확인할 수 있어, 기본은 화면맞춤으로 시작하고 필요할 때만 원본 크기로 바꾼다.
function _briefTogglePreviewFit(){
  const body = document.querySelector('#brief-img-preview-overlay .brief-img-preview-body');
  const btn = document.querySelector('#brief-img-preview-overlay .brief-fit-toggle');
  if(!body) return;
  const nowFit = body.classList.toggle('fit-mode');
  if(btn) btn.textContent = nowFit ? '🔍 원본 크기로 보기' : '🗗 화면에 맞추기';
}
async function _briefSwitchMode(mode){
  if(window._briefSwitchBusy) return;
  window._briefSwitchBusy = true;
  const wrap = document.getElementById('brief-img-preview-overlay');
  if(wrap) wrap.classList.add('brief-loading');
  try{
    const meta = window._briefPendingMeta || _getBriefingExportMeta();
    const canvas = await _briefGenerateCanvas(mode, meta);
    window._briefPendingCanvas = canvas;
    window._briefLastMode = mode;
    const imgEl = wrap ? wrap.querySelector('.brief-img-preview-body img') : null;
    if(imgEl) imgEl.src = canvas.toDataURL('image/png');
    if(wrap) wrap.querySelectorAll('.brief-mode-btn').forEach(b=>b.classList.toggle('on', b.dataset.mode===mode));
  }catch(e){ alert('모드 전환 오류: '+e.message); }
  finally{ window._briefSwitchBusy = false; if(wrap) wrap.classList.remove('brief-loading'); }
}
async function _briefConfirmSaveImage(){
  const canvas = window._briefPendingCanvas;
  const meta = window._briefPendingMeta || _getBriefingExportMeta();
  const mode = window._briefLastMode || 'basic';
  _briefCloseImagePreview();
  if(!canvas) return;
  try{
    if(typeof _showSaveLoading==='function') _showSaveLoading();
    await _saveCanvasImage(canvas, _briefFilename(mode, meta), 'png');
  }catch(e){ alert('이미지 저장 오류: '+e.message); }
  finally{
    if(typeof _hideSaveLoading==='function') _hideSaveLoading();
    window._briefPendingCanvas = null;
  }
}

// 브리핑 저장 — 화면을 그대로 캡처하지 않고(그리드 레이아웃이 깨지거나 헤더만
// 캡처되는 등 html2canvas 호환성 문제가 있었음), 별도 레이아웃으로 렌더링해서
// 안정적으로 캡처한다. 저장 직전에 항상 미리보기 모달을 띄워, 모달 안에서
// 기본/신문기사/포스터/미니멀 중 원하는 모드로 바꿔보고 다운로드할 수 있다.
async function captureBriefingArticle(){
  try{
    _showSaveLoading();
    try{ await (window.ensureHtml2Canvas && window.ensureHtml2Canvas()); }catch(e){}
    if(typeof html2canvas!=='function') throw new Error('html2canvas를 불러오지 못했습니다.');
    const meta = _getBriefingExportMeta();
    const mode = window._briefLastMode || 'basic';
    const canvas = await _briefGenerateCanvas(mode, meta);
    window._briefPendingCanvas = canvas;
    window._briefPendingMeta = meta;
    window._briefLastMode = mode;
    _briefShowImagePreview(canvas, mode, meta);
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
        + '<p style="color:#fff;font-family:sans-serif;padding:12px;font-size:var(--fs-base)">이미지를 길게 눌러 저장하세요 📥</p>'
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
  window._briefSwitchMode = _briefSwitchMode;
  window._briefCloseImagePreview = _briefCloseImagePreview;
  window._briefConfirmSaveImage = _briefConfirmSaveImage;
  window._briefTogglePreviewFit = _briefTogglePreviewFit;
}catch(e){}
