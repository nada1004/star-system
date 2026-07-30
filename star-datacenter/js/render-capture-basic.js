/* ══════════════════════════════════════════════════════════════
   렌더캡처 - 모드설정/그라디언트텍스트 보정/기본캡처 측정 (render-capture-utils.js 에서 분리, 2026-07-30)
   ══════════════════════════════════════════════════════════════ */

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

