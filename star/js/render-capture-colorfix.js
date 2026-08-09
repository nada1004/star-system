/* ══════════════════════════════════════════════════════════════
   렌더캡처 - CSS 색상 함수 정규화(html2canvas 호환) (render-capture-utils.js 에서 분리, 2026-07-30)
   ══════════════════════════════════════════════════════════════ */

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
