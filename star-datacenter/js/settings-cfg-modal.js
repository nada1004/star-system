function _scfgD(id,title,extra){
  // (요청사항) 펼치기 UI 대신 "팝업으로 열기" UX: 기본은 항상 닫힘
  const isOpen=false;
  // cfg-anchor: 바로가기 클릭 시 원래 위치로 되돌릴 기준점
  return `<div class="cfg-anchor" data-cfg-anchor="${id}"></div><details id="cfg-sec-${id}" class="ssec" data-cfg-sec="${id}" ${isOpen?'open':''} ontoggle="_scfgToggle('${id}',this)"${extra?' '+extra:''}>
  <summary class="cfg-sec-summary" style="list-style:none;outline:none;-webkit-appearance:none">
    <h4>${title}</h4>
    <span class="cfg-sec-right">열기 ›</span>
  </summary>`;
}

// 설정 섹션 팝업 모달 (바로가기 클릭 시 사용)
function _cfgEnsureModal(){
  let m=document.getElementById('cfgModal');
  if(m) return m;
  try{
    m=document.createElement('div');
    m.id='cfgModal';
    m.className='modal no-export cfg-modal';
    m.style.display='none';
    m.style.zIndex='9000';
    m.innerHTML=`
      <div class="mbox cfg-modal-box">
        <div class="cfg-modal-hdr">
          <div id="cfgModalTitle" class="cfg-modal-title">⚙️ 설정</div>
          <button class="cfg-modal-close" onclick="closeCfgModal()" aria-label="닫기">✕</button>
        </div>
        <div id="cfgModalBody" class="cfg-modal-body"></div>
      </div>
    `;
    document.body.appendChild(m);
  }catch(e){}
  // (요청사항) 설정을 수정하면 다른 기기에도 "바로" 반영되도록 자동 Cloud Save 트리거
  // - cfgModal 안에서 발생하는 input/change 를 감지해 디바운스 저장
  try{
    const body = m.querySelector('#cfgModalBody');
    if(body && !body._autoCloudSyncBound){
      body._autoCloudSyncBound = true;
      const _touch = ()=>{
        try{ window._scheduleCloudAppSettingsSave && window._scheduleCloudAppSettingsSave(); }catch(e){}
      };
      body.addEventListener('input', _touch, true);
      body.addEventListener('change', _touch, true);
      // 버튼 클릭으로만 바뀌는 설정도 있으니 click도 함께 감지(디바운스라 부담 적음)
      body.addEventListener('click', (ev)=>{
        try{
          const t = ev && ev.target;
          if(!t) return;
          if(t.tagName==='BUTTON' || (t.closest && t.closest('button'))) _touch();
        }catch(e){}
      }, true);
    }
  }catch(e){}
  // (요청사항) 모달 바깥(배경) 클릭으로 닫아도 섹션이 원위치로 복구되도록
  try{
    m.addEventListener('click', (ev)=>{
      try{
        // (모바일 버그픽스) 섹션을 눌러 모달을 여는 "같은 탭" 이벤트에서
        // 모달 배경 클릭으로 인식되어 바로 닫히는 현상 방지
        if(window._cfgModalJustOpenedTime && (Date.now()-window._cfgModalJustOpenedTime<350)) return;
        if(ev && ev.target===m && typeof window.closeCfgModal==='function') window.closeCfgModal();
      }catch(_){}
    }, {capture:true});
  }catch(e){}
  // 닫기 핸들러 (섹션 원위치 복구)
  if(typeof window.closeCfgModal!=='function'){
    window.closeCfgModal=function(){
      try{
        const prevId=window._cfgModalSecId;
        if(prevId){
          const prev=document.querySelector(`[data-cfg-sec="${prevId}"]`);
          const anchor=document.querySelector(`[data-cfg-anchor="${prevId}"]`);
          if(prev && anchor){
            anchor.parentNode.insertBefore(prev, anchor.nextSibling);
            prev.style.display='';
            // 목록에서는 펼치지 않음
            try{ if(prev.tagName==='DETAILS') prev.open=false; }catch(e){}
          }
          window._cfgModalSecId=null;
        }
        const body=document.getElementById('cfgModalBody');
        if(body) body.innerHTML='';
      }catch(e){}
      try{ if(typeof cm==='function') cm('cfgModal'); else { const mm=document.getElementById('cfgModal'); if(mm) mm.style.display='none'; } }catch(e){}
      try{ if(typeof window.cfgApplyBottomSectionsVisibility==='function') window.cfgApplyBottomSectionsVisibility(); }catch(e){}
    };
  }
  return m;
}

/* ══════════════════════════════════════
   설정 카테고리 필터
══════════════════════════════════════ */
if(typeof window._cfgCat==='undefined'||window._cfgCat==='전체'||!Object.keys(_catSecs||{}).includes(window._cfgCat)) window._cfgCat=(window._cfgCatOrder&&window._cfgCatOrder[0])||'🧩 운영/콘텐츠';
function _cfgGo(secId){
  // 섹션이 다른 카테고리에 속하면 카테고리 자동 전환
  try{
    let targetCat=null;
    for(const cat in _catSecs){
      const arr=_catSecs[cat]||[];
      if(arr.indexOf(secId)!==-1){ targetCat=cat; break; }
    }
    if(targetCat && window._cfgCat!==targetCat) _cfgApplyCat(targetCat,false);
  }catch(e){}

  const el=document.getElementById(`cfg-sec-${secId}`) || document.querySelector(`[data-cfg-sec="${secId}"]`);
  if(!el){
    try{
      // 디버그: 특정 환경에서만 섹션 탐색이 실패하는 현상(‘pd만 됨’) 추적용
      if(window.__CFG_DEBUG){
        const secs=[...document.querySelectorAll('[data-cfg-sec]')].slice(0,40).map(x=>`${x.getAttribute('data-cfg-sec')}#${x.id||''}`);
        console.warn('[cfgGo] section not found:', secId, 'known secs=', secs);
      }
    }catch(e){}
    return;
  }

  // 기존 열림 닫기 (아코디언)
  try{
    const all=document.querySelectorAll('[data-cfg-sec]');
    for(let i=0;i<all.length;i++){
      const d=all[i];
      if(d!==el && d.tagName==='DETAILS') d.open=false;
    }
  }catch(e){}

  // 바로가기 클릭 시: 해당 섹션을 팝업 모달로 표시
  try{
    _cfgEnsureModal();
    // 이전에 모달로 올린 섹션이 있으면 원위치 복구
    const prevId=window._cfgModalSecId;
    if(prevId && prevId!==secId){
        const prev=document.getElementById(`cfg-sec-${prevId}`) || document.querySelector(`[data-cfg-sec="${prevId}"]`);
      const anchor=document.querySelector(`[data-cfg-anchor="${prevId}"]`);
      if(prev && anchor){
        anchor.parentNode.insertBefore(prev, anchor.nextSibling);
        prev.style.display='';
      }
    }
    window._cfgModalSecId=secId;
    const titleEl=document.getElementById('cfgModalTitle');
    if(titleEl){
      const t = (window._cfgSecTitle && window._cfgSecTitle[secId]) ? window._cfgSecTitle[secId] : '';
      // 요청사항: cfgmenu는 팝업 헤더에서도 "설정 메뉴" 문구가 보이도록 고정
      titleEl.textContent = (secId==='cfgmenu') ? '🧭 설정 메뉴 정리' : (t || '⚙️ 설정');
    }
    const body=document.getElementById('cfgModalBody');
    if(body){
      body.innerHTML='';
      el.style.display='';
      body.appendChild(el);
      try{ body.scrollTop = 0; }catch(e){}
      // (요청사항) 팝업에서는 내용이 보여야 하므로 펼침
      try{ if(el.tagName==='DETAILS') el.open=true; }catch(e){}
      // (보강) 동적 섹션은 팝업 이동만으로 toggle 이벤트가 안 나는 환경이 있어 수동 렌더
      try{
        if(secId==='profileshape' && typeof window._renderCfgProfileShapeSection==='function') window._renderCfgProfileShapeSection();
        if(secId==='uisize' && typeof window._renderCfgUiSizeSection==='function') window._renderCfgUiSizeSection();
        if(secId==='pd' && typeof window._renderCfgPdSection==='function') window._renderCfgPdSection();
        if(secId==='ud' && typeof window._renderCfgUdSection==='function') window._renderCfgUdSection();
        if(secId==='pdModeBadge' && typeof window._renderCfgPdModeBadgeSection==='function') window._renderCfgPdModeBadgeSection();
        if(secId==='matchdetail' && typeof window._renderCfgMatchDetailSection==='function') window._renderCfgMatchDetailSection();
        if(secId==='aibot' && typeof window.cfgInitAiProxy==='function') window.cfgInitAiProxy();
      }catch(e){}
    }
    // (모바일 버그픽스) pointerdown에서 섹션을 누를 경우,
    // 같은 탭 이벤트의 click/touchend 타겟이 모달 배경으로 잡히며 "열렸다가 바로 닫히는" 케이스가 있음
    // → 모달 표시를 다음 tick으로 미뤄 동일 이벤트 사이클에서의 배경 클릭 판정을 회피
    const mm=document.getElementById('cfgModal');
    if(mm){
      window._cfgModalJustOpenedTime = Date.now();
      setTimeout(()=>{
        try{ mm.style.display='flex'; }catch(e){}
        try{
          const b=document.getElementById('cfgModalBody');
          if(b) b.scrollTop = 0;
        }catch(e){}
        if(typeof om==='function'){ try{ om('cfgModal'); }catch(err){ if(window.__CFG_DEBUG) console.error('[cfgGo] om() failed', err); } }
      }, 0);
    } else {
      if(typeof om==='function'){ try{ om('cfgModal'); }catch(err){ if(window.__CFG_DEBUG) console.error('[cfgGo] om() failed', err); } }
    }
  }catch(e){
    // 기존엔 조용히 삼켜서 “버튼 반응 없음”처럼 보였음 → 콘솔에 노출
    try{ console.error('[cfgGo] failed:', secId, e); }catch(_){}
  }
  // (요청사항) 목록에서는 펼치기 사용 안 함(팝업으로만 확인)
  // - 팝업으로 옮겨진 경우는 위에서 open=true 처리
  try{ if(el && el.tagName==='DETAILS' && !(el.closest && el.closest('#cfgModalBody'))) el.open=false; }catch(e){}
}

