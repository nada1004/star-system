/* ══════════════════════════════════════════════════════════════
   설정 - 뷰모드/하단섹션 토글 (settings-cfg-apply.js 에서 분리, 2026-07-30)
   ══════════════════════════════════════════════════════════════ */

window.cfgApplyCat = function(cat){
  try{ window._cfgCat=cat; }catch(e){}
  try{
    if(typeof curTab!=='undefined' && curTab==='cfg' && typeof render==='function'){
      render();
      return cat;
    }
  }catch(e){}
  return _cfgApplyCat(cat, false);
};
window.cfgSetViewMode = function(mode){
  try{
    const v = String(mode||'basic').trim();
    localStorage.setItem('su_cfg_view_mode', v==='advanced' ? 'advanced' : 'basic');
  }catch(e){}
  try{ if(typeof curTab!=='undefined' && curTab==='cfg' && typeof render==='function') render(); }catch(e){}
};
window.cfgSetBottomSectionsOpen = function(open){
  try{
    window._cfgBottomSectionsOpen = !!open;
    localStorage.setItem('su_cfg_bottom_open', window._cfgBottomSectionsOpen ? '1' : '0');
  }catch(e){}
  // DOM 직접 조작으로 즉시 접기/펼치기 (전체 재렌더링 없이)
  try{ if(typeof window.cfgApplyBottomSectionsVisibility==='function') window.cfgApplyBottomSectionsVisibility(); }catch(e){}
};
window.cfgSetRemoteCfgAuto = function(on){
  try{
    localStorage.setItem('su_cfg_remote_auto', on ? '1' : '0');
    const el = document.getElementById('cfg-remote-auto-status');
    if(el){
      el.style.color = on ? '#16a34a' : 'var(--gray-l)';
      el.textContent = on ? 'ON · 설정/상세 수정은 GitHub에도 반영, 새로고침만으로는 저장되지 않음' : 'OFF · 설정 변경은 로컬만 저장';
    }
  }catch(e){}
};
window.cfgToggleBottomSections = function(){
  try{
    const cur = window._cfgBottomSectionsOpen===undefined
      ? ((localStorage.getItem('su_cfg_bottom_open') ?? '1') === '1')
      : !!window._cfgBottomSectionsOpen;
    window.cfgSetBottomSectionsOpen(!cur);
  }catch(e){}
};
window.cfgApplySimpleView = function(){
  try{
    const mode=(localStorage.getItem('su_cfg_view_mode')||'basic')==='advanced' ? 'advanced' : 'basic';
    const q=String(window._cfgSearchQ||'').trim();
    const fav=['sharecard','uisize','calui','profileshape','tablabels','matchdetail','univ','univlogoimg'];
    const autoOpen=['sharecard','uisize','calui'];
    const all=document.querySelectorAll('[data-cfg-sec]');
    all.forEach(el=>{
      const id=String(el.getAttribute('data-cfg-sec')||'').trim();
      let vis=true;
      if(mode==='basic' && !q) vis=fav.includes(id);
      el.style.display=vis?'':'none';
      if(el.tagName==='DETAILS'){
        if(mode==='basic' && !q) el.open=autoOpen.includes(id);
      }
    });
    const cnt=document.getElementById('cfgSearchCnt');
    if(cnt && mode==='basic' && !q) cnt.textContent=`간단 보기 · 자주 쓰는 설정 ${fav.length}개`;
  }catch(e){}
};
window.cfgApplyBottomSectionsVisibility = function(){
  try{
    const mode=(localStorage.getItem('su_cfg_view_mode')||'basic')==='advanced' ? 'advanced' : 'basic';
    const q=String(window._cfgSearchQ||'').trim();
    if(window._cfgBottomSectionsOpen===undefined){
      const saved=localStorage.getItem('su_cfg_bottom_open');
      window._cfgBottomSectionsOpen = (saved==='1' || saved==='0') ? (saved==='1') : false;
    }
    const open = q ? true : !!window._cfgBottomSectionsOpen;
    if(!open){
      // 접기: 카드형 메뉴는 유지하고, 아래 상세 설정 본문만 숨김
      document.querySelectorAll('[data-cfg-sec]').forEach(el=>{
        try{ if(el.closest && el.closest('#cfgModalBody')) return; }catch(e){}
        try{ if(el.tagName==='DETAILS') el.open=false; }catch(e){}
        el.style.display='none';
      });
    } else {
      // 펼치기: 검색 중이면 검색 필터가 제어하도록 그대로 두고,
      // 검색이 아니면 현재 카테고리만 다시 적용
      if (!q) {
        try{
          if(typeof _cfgApplyCat==='function') _cfgApplyCat(window._cfgCat||'🧩 운영/콘텐츠', false);
        }catch(e){}
      }
    }
    // 버튼 텍스트 업데이트
    try{
      document.querySelectorAll('[onclick*="cfgToggleBottomSections"]').forEach(function(btn){
        const v = String(btn.getAttribute('data-cfg-toggle-variant')||'long');
        btn.textContent = v==='short'
          ? (open ? '📚 숨기기' : '📚 보기')
          : v==='plain'
            ? (open ? '원본 목록 숨기기' : '원본 목록 보기')
            : (open ? '📚 원본 목록 숨기기' : '📚 원본 목록 보기');
      });
    }catch(e){}
  }catch(e){}
};
window.cfgFocusSearch = function(){ try{ document.getElementById('cfgSearchInp')?.focus(); }catch(e){} };
window.cfgCollapseAll = function(){
  try{
    document.querySelectorAll('[data-cfg-sec]').forEach(el=>{ if(el.tagName==='DETAILS') el.open=false; });
    const sug=document.getElementById('cfgSearchSug'); if(sug){ sug.innerHTML=''; sug.style.display='none'; }
    try{ document.getElementById('cfgSearchInp')?.blur(); }catch(e){}
    try{ if(typeof showToast==='function') showToast('열린 설정 항목을 닫았습니다.'); }catch(e){}
  }catch(e){}
};
window.cfgOpenFavorites = function(){
  try{
    const fav=['pd','matchdetail','profileshape','uisize','tablabels'];
    document.querySelectorAll('[data-cfg-sec]').forEach(el=>{
      const id=el.getAttribute('data-cfg-sec');
      const vis=fav.includes(id);
      el.style.display=vis?'':'none';
      if(el.tagName==='DETAILS') el.open=vis;
    });
    const cnt=document.getElementById('cfgSearchCnt'); if(cnt) cnt.textContent=`자주 쓰는 설정 ${fav.length}개`;
  }catch(e){}
};
// 펨코스타일/신현황판 대학 순서 이동
// - 인라인 onclick에서 univCfg 직접 참조가 환경에 따라 막히는 경우가 있어(전역 let 바인딩 이슈),
//   전용 핸들러로 분리해 안정적으로 동작하게 한다.
