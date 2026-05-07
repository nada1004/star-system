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
  }
  else {
    if(typeof rGJ==='function')  rGJ(sub,T);
  }
  C.innerHTML = bar;
  C.appendChild(sub);
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
  if(_mergedUnivSub==='civil')       { miniType='civil';  if(typeof rMini==='function')  rMini(sub,T); }
  else if(_mergedUnivSub==='mini')   { miniType='mini';   if(typeof rMini==='function')  rMini(sub,T); }
  else if(_mergedUnivSub==='univck') { if(typeof rCK==='function')    rCK(sub,T);   }
  else                                { if(typeof rUnivM==='function') rUnivM(sub,T); }
  C.innerHTML = bar;
  C.appendChild(sub);
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
  C.innerHTML = bar;
  C.appendChild(sub);
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
  if(_mergedProSub==='pro')       { if(typeof rPro==='function')     rPro(sub,T); }
  else if(_mergedProSub==='gj')   {
    if(typeof rGJ==='function') rGJ(sub,T,true,true);
  }
  else                            { if(typeof rProComp==='function') rProComp(sub,T); }
  C.innerHTML = bar;
  C.appendChild(sub);
}

try{
  window.rMergedInd = rMergedInd;
  window.rMergedUnivM = rMergedUnivM;
  window.rMergedComp = rMergedComp;
  window.rMergedPro = rMergedPro;
}catch(e){}
