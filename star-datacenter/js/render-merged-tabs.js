// [FIX-17] _mergedXxxSub 변수: 탭 이탈 후에도 값이 유지되는 "의도적 영속 상태"
// - 재진입 시 마지막 선택 서브탭을 기억하는 UX 의도 (sw()의 || 패턴이 이를 지원)
// - 단, sw()에서 명시적으로 초기화하는 탭(gj → _mergedIndSub='gj')은 강제 덮어쓰기
// - 비의도적 잔류를 방지하려면 sw() 내 TAB_ENTER 맵에서 명시적으로 초기화 필요
var _mergedIndSub  = 'ind';   // 개인전 서브탭: 'ind' | 'gj'
var _mergedUnivSub = 'mini';  // 대학대전 서브탭: 'civil' | 'mini' | 'univm' | 'univck'
var _mergedCompSub = 'comp';  // 대회 서브탭: 'comp' | 'tiertour'
var _mergedProSub  = 'pro';   // 프로리그 서브탭: 'pro' | 'gj' | 'comp'

function _mergedSubBar(tabs, curSub, setFn, ctx) {
  return `<div class="fbar utilbar utilbar--scroll merged-subbar no-export" style="overflow-x:auto;flex-wrap:nowrap;-webkit-overflow-scrolling:touch;scrollbar-width:none">
    ${tabs.map(t=>{
      const isOn = curSub===t.id;
      const colorStyle = (isOn && ctx && typeof getTabColorStyle==='function') ? getTabColorStyle(ctx, t.id) : '';
      return `<button class="pill ${isOn?'on':''}" style="flex-shrink:0;white-space:nowrap;${colorStyle}" onclick="${setFn}='${t.id}';render()">${t.lbl}</button>`;
    }).join('')}
  </div>`;
}

function rMergedInd(C, T) {
  const tabs = (typeof applyTabLabels==='function')
    ? applyTabLabels('mergedInd', [{id:'ind',lbl:'🎮 개인전'},{id:'gj',lbl:'⚔️ 끝장전'}])
    : [{id:'ind',lbl:'🎮 개인전'},{id:'gj',lbl:'⚔️ 끝장전'}];
  const bar = _mergedSubBar(
    tabs,
    _mergedIndSub, '_mergedIndSub', 'mergedInd'
  );
  const sub = document.createElement('div');
  if(_mergedIndSub==='ind') {
    if(typeof rInd==='function') rInd(sub,T);
    else sub.innerHTML='<div class="empty-state">개인전 모듈을 불러올 수 없습니다.</div>';
  }
  else {
    if(typeof rGJ==='function')  rGJ(sub,T);
    else sub.innerHTML='<div class="empty-state">끝장전 모듈을 불러올 수 없습니다.</div>';
  }
  // [FIX-7] reflow 2회 → 1회: DocumentFragment로 한 번에 삽입
  const _frag = document.createDocumentFragment();
  const _barWrap = document.createElement('div');
  _barWrap.className = 'merged-bar-wrap';
  _barWrap.innerHTML = bar;
  // bar 내부 요소들만 꺼내서 frag에 추가 (div 래퍼 없이)
  while(_barWrap.firstChild) _frag.appendChild(_barWrap.firstChild);
  _frag.appendChild(sub);
  C.textContent = '';
  C.appendChild(_frag);
}

function rMergedUnivM(C, T) {
  const tabs = (typeof applyTabLabels==='function')
    ? applyTabLabels('mergedUniv', [{id:'civil',lbl:'⚔️ 시빌워'},{id:'mini',lbl:'⚡ 미니대전'},{id:'univm',lbl:'🏟️ 대학대전'},{id:'univck',lbl:'🤝 대학CK'}])
    : [{id:'civil',lbl:'⚔️ 시빌워'},{id:'mini',lbl:'⚡ 미니대전'},{id:'univm',lbl:'🏟️ 대학대전'},{id:'univck',lbl:'🤝 대학CK'}];
  const bar = _mergedSubBar(
    tabs,
    _mergedUnivSub, '_mergedUnivSub', 'mergedUniv'
  );
  const sub = document.createElement('div');
  if(_mergedUnivSub==='civil')       { miniType='civil';  if(typeof rMini==='function')  rMini(sub,T);  else sub.innerHTML='<div class="empty-state">시빌워 모듈을 불러올 수 없습니다.</div>'; }
  else if(_mergedUnivSub==='mini')   { miniType='mini';   if(typeof rMini==='function')  rMini(sub,T);  else sub.innerHTML='<div class="empty-state">미니대전 모듈을 불러올 수 없습니다.</div>'; }
  else if(_mergedUnivSub==='univck') { if(typeof rCK==='function')    rCK(sub,T);    else sub.innerHTML='<div class="empty-state">대학CK 모듈을 불러올 수 없습니다.</div>'; }
  else                                { if(typeof rUnivM==='function') rUnivM(sub,T); else sub.innerHTML='<div class="empty-state">대학대전 모듈을 불러올 수 없습니다.</div>'; }
  // [FIX-7] reflow 2회 → 1회: DocumentFragment로 한 번에 삽입
  const _frag = document.createDocumentFragment();
  const _barWrap = document.createElement('div');
  _barWrap.className = 'merged-bar-wrap';
  _barWrap.innerHTML = bar;
  // bar 내부 요소들만 꺼내서 frag에 추가 (div 래퍼 없이)
  while(_barWrap.firstChild) _frag.appendChild(_barWrap.firstChild);
  _frag.appendChild(sub);
  C.textContent = '';
  C.appendChild(_frag);
}

function rMergedComp(C, T) {
  const tabs = (typeof applyTabLabels==='function')
    ? applyTabLabels('mergedComp', [{id:'comp',lbl:'🎖️ 일반 대회'},{id:'tiertour',lbl:'🎯 티어대회'}])
    : [{id:'comp',lbl:'🎖️ 일반 대회'},{id:'tiertour',lbl:'🎯 티어대회'}];
  const bar = _mergedSubBar(
    tabs,
    _mergedCompSub, '_mergedCompSub', 'mergedComp'
  );
  const sub = document.createElement('div');
  if(_mergedCompSub==='comp') {
    if(typeof rComp==='function') rComp(sub,T);
    else sub.innerHTML=`<div style="padding:30px;text-align:center;color:var(--gray-l)">대회 모듈 로딩 중...</div>`;
  } else {
    if(typeof rTierTourTab==='function') rTierTourTab(sub,T);
    else sub.innerHTML=`<div style="padding:30px;text-align:center;color:var(--gray-l)">티어대회 모듈을 불러오지 못했습니다. 새로고침 후 다시 시도해주세요.</div>`;
  }
  // [FIX-7] reflow 2회 → 1회: DocumentFragment로 한 번에 삽입
  const _frag = document.createDocumentFragment();
  const _barWrap = document.createElement('div');
  _barWrap.className = 'merged-bar-wrap';
  _barWrap.innerHTML = bar;
  // bar 내부 요소들만 꺼내서 frag에 추가 (div 래퍼 없이)
  while(_barWrap.firstChild) _frag.appendChild(_barWrap.firstChild);
  _frag.appendChild(sub);
  C.textContent = '';
  C.appendChild(_frag);
}

function rMergedPro(C, T) {
  const tabs = (typeof applyTabLabels==='function')
    ? applyTabLabels('mergedPro', [{id:'pro',lbl:'🏅 프로리그'},{id:'gj',lbl:'⚔️ 프로 끝장전'},{id:'comp',lbl:'🏆 프로리그 대회'}])
    : [{id:'pro',lbl:'🏅 프로리그'},{id:'gj',lbl:'⚔️ 프로 끝장전'},{id:'comp',lbl:'🏆 프로리그 대회'}];
  const bar = _mergedSubBar(
    tabs,
    _mergedProSub, '_mergedProSub', 'mergedPro'
  );
  const sub = document.createElement('div');
  if(_mergedProSub==='pro')       { if(typeof rPro==='function')     rPro(sub,T);     else sub.innerHTML='<div class="empty-state">프로리그 모듈을 불러올 수 없습니다.</div>'; }
  else if(_mergedProSub==='gj')   {
    if(typeof rGJ==='function') rGJ(sub,T,true,true);
    else sub.innerHTML='<div class="empty-state">프로 끝장전 모듈을 불러올 수 없습니다.</div>';
  }
  else                            { if(typeof rProComp==='function') rProComp(sub,T); else sub.innerHTML='<div class="empty-state">프로리그 대회 모듈을 불러올 수 없습니다.</div>'; }
  // [FIX-7] reflow 2회 → 1회: DocumentFragment로 한 번에 삽입
  const _frag = document.createDocumentFragment();
  const _barWrap = document.createElement('div');
  _barWrap.className = 'merged-bar-wrap';
  _barWrap.innerHTML = bar;
  // bar 내부 요소들만 꺼내서 frag에 추가 (div 래퍼 없이)
  while(_barWrap.firstChild) _frag.appendChild(_barWrap.firstChild);
  _frag.appendChild(sub);
  C.textContent = '';
  C.appendChild(_frag);
}

try{
  window.rMergedInd = rMergedInd;
  window.rMergedUnivM = rMergedUnivM;
  window.rMergedComp = rMergedComp;
  window.rMergedPro = rMergedPro;
}catch(e){}
