/* ══════════════════════════════════════════════════════════════
   탭 DOM 스태시 (신규, 2026-08-17)
   현황판 프로필탭에 이미 있던 "떠나기 직전 DOM을 보관해두고, 돌아왔을 때 화면에
   영향을 주는 값이 그대로면 재사용" 패턴을 다른 탭(전체/티어)에도 쓸 수 있게 만든
   공용 유틸. render-core.js가 매 render() 때 콘텐츠 영역(#rcont)을 통째로
   innerHTML=''로 비우기 때문에, 그 직전에 여기서 살아있는 DOM을 떼어 보관해두고
   (appendChild로 이동만 하므로 <img>가 재요청/재디코딩되지 않음), 돌아왔을 때
   시그니처가 같으면 새로 그리지 않고 그 DOM을 그대로 복원한다.
   ══════════════════════════════════════════════════════════════ */
window._tabDomStash = window._tabDomStash || {};

// 특정 rootId 마커가 현재 #rcont 안에 살아있으면(=그 탭이 방금까지 화면에 떠 있었으면)
// 그 내용을 통째로 떼어 보관한다. sigFn은 "지금 이 DOM이 어떤 상태를 반영하는지"를
// 나타내는 문자열을 계산하는 함수(각 탭 파일에서 제공).
function _tdsStashIfPresent(key, rootId, C, sigFn){
  try{
    if(!C) return;
    const marker = document.getElementById(rootId);
    if(!marker || !C.contains(marker)) return;
    if(!C.firstChild) return;
    let sig = '';
    try{ sig = (typeof sigFn === 'function') ? sigFn() : ''; }catch(e){ sig = ''; }
    const holder = document.createDocumentFragment();
    while(C.firstChild) holder.appendChild(C.firstChild);
    window._tabDomStash[key] = { node: holder, sig: sig };
  }catch(e){}
}

// 지금 새로 그리려는 내용의 시그니처가 스태시된 것과 같으면 복원하고 true를 반환.
// 다르거나 스태시가 없으면 false(호출자가 평소대로 새로 그려야 함).
function _tdsTryRestore(key, C, sigFn){
  try{
    const stash = window._tabDomStash[key];
    if(!stash || !stash.node) return false;
    let sig = '';
    try{ sig = (typeof sigFn === 'function') ? sigFn() : ''; }catch(e){ sig = ''; }
    if(!sig || sig !== stash.sig) return false;
    if(C.firstChild) C.innerHTML = '';
    C.appendChild(stash.node);
    window._tabDomStash[key] = null;
    return true;
  }catch(e){ return false; }
}

// 스태시를 더 이상 쓸 수 없게 됐을 때(탭을 벗어나 다른 값으로 실제로 다시 그렸을 때)
// 비워서 다음번에 잘못 복원되지 않게 한다.
function _tdsInvalidate(key){
  try{ window._tabDomStash[key] = null; }catch(e){}
}

try{
  window._tdsStashIfPresent = _tdsStashIfPresent;
  window._tdsTryRestore = _tdsTryRestore;
  window._tdsInvalidate = _tdsInvalidate;
}catch(e){}
