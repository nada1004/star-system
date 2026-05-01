var _mergedIndSub  = 'ind';   // 개인전 서브탭: 'ind' | 'gj'
var _mergedUnivSub = 'mini';  // 대학대전 서브탭: 'civil' | 'mini' | 'univm' | 'univck'
var _mergedCompSub = 'comp';  // 대회 서브탭: 'comp' | 'tiertour'
var _mergedProSub  = 'pro';   // 프로리그 서브탭: 'pro' | 'gj' | 'comp'

function _mergedSubBar(tabs, curSub, setFn) {
  return `<div class="fbar utilbar utilbar--scroll no-export" style="overflow-x:auto;flex-wrap:nowrap;-webkit-overflow-scrolling:touch;scrollbar-width:none;margin-bottom:16px">
    ${tabs.map(t=>`<button class="pill ${curSub===t.id?'on':''}" style="flex-shrink:0;white-space:nowrap" onclick="${setFn}='${t.id}';render()">${t.lbl}</button>`).join('')}
  </div>`;
}

function rMergedInd(C, T) {
  const bar = _mergedSubBar(
    [{id:'ind',lbl:'🎮 개인전'},{id:'gj',lbl:'⚔️ 끝장전'}],
    _mergedIndSub, '_mergedIndSub'
  );
  const sub = document.createElement('div');
  if(_mergedIndSub==='ind') { if(typeof rInd==='function') rInd(sub,T); }
  else                       { if(typeof rGJ==='function')  rGJ(sub,T);  }
  C.innerHTML = bar;
  C.appendChild(sub);
}

function rMergedUnivM(C, T) {
  const bar = _mergedSubBar(
    [{id:'civil',lbl:'⚔️ 시빌워'},{id:'mini',lbl:'⚡ 미니대전'},{id:'univm',lbl:'🏟️ 대학대전'},{id:'univck',lbl:'🤝 대학CK'}],
    _mergedUnivSub, '_mergedUnivSub'
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
  const bar = _mergedSubBar(
    [{id:'comp',lbl:'🎖️ 대회'},{id:'tiertour',lbl:'🎯 티어대회'}],
    _mergedCompSub, '_mergedCompSub'
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
  const bar = _mergedSubBar(
    [{id:'pro',lbl:'🏅 일반'},{id:'gj',lbl:'⚔️ 끝장전'},{id:'comp',lbl:'🎖️ 대회'}],
    _mergedProSub, '_mergedProSub'
  );
  const sub = document.createElement('div');
  if(_mergedProSub==='pro')       { if(typeof rPro==='function')     rPro(sub,T); }
  else if(_mergedProSub==='gj')   { if(typeof rGJ==='function')      rGJ(sub,T,true,true); }
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
