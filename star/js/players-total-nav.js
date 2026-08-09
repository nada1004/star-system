/* ══════════════════════════════════════════════════════════════
   선수(전체) - 네비게이션/숏컷 팝오버 헬퍼 (players-streamer-views.js 에서 분리, 2026-07-30)
   ══════════════════════════════════════════════════════════════ */

(function(){
  if(typeof window==='undefined' || window.__streamerMbResizeBound) return;
  window.__streamerMbResizeBound = true;
  let _lastMb = window.innerWidth<=768;
  let _t=null;
  window.addEventListener('resize', ()=>{
    clearTimeout(_t);
    _t=setTimeout(()=>{
      const nowMb = window.innerWidth<=768;
      if(nowMb!==_lastMb){
        _lastMb=nowMb;
        try{ if(typeof render==='function') render(); }catch(e){}
      }
    }, 150);
  }, {passive:true});
})();

// 스트리머 탭 리스트뷰(모바일): 행 아래 요약 정보(종족/승/패/포인트/ELO) 행을
// 기본 접힌 상태로 두고, 이름 옆 화살표를 탭했을 때만 펼치는 아코디언 방식.
// (항상 펼쳐두면 한 명당 실질 2줄을 차지해 화면 밀도가 떨어지고 스크롤이 길어지는 문제 개선)
function _toggleStreamerMobileInfo(btn){
  try{
    const row = btn.closest('tr');
    const infoRow = row && row.nextElementSibling;
    if(!infoRow || !infoRow.classList.contains('streamer-mobile-info-row')) return;
    const nowOpen = infoRow.classList.toggle('is-open');
    btn.classList.toggle('is-open', nowOpen);
    btn.setAttribute('aria-label', nowOpen?'상세 기록 접기':'상세 기록 펼치기');
  }catch(e){}
}
if(typeof window!=='undefined') window._toggleStreamerMobileInfo = _toggleStreamerMobileInfo;

// 스트리머 탭: "🏫 대학 바로가기" — 대학을 고르면 해당 대학 소속만 필터링하고(모든 보기 모드 공통),
// 현재 화면에 그 대학 섹션 헤더가 있으면(테이블/카드/심플/상세형 모두 헤더 존재) 그 위치로 스크롤 이동.
function _closeUnivShortcutPopover(){
  try{ const p=document.getElementById('streamer-univ-popover'); if(p) p.remove(); }catch(e){}
  try{ document.removeEventListener('mousedown', _univShortcutOutsideClick, true); }catch(e){}
}
function _univShortcutOutsideClick(ev){
  const pop = document.getElementById('streamer-univ-popover');
  if(!pop) return;
  if(pop.contains(ev.target)) return;
  if(ev.target && ev.target.closest && ev.target.closest('.streamer-univ-shortcut-btn')) return;
  _closeUnivShortcutPopover();
}
function _toggleUnivShortcutPopover(btn){
  const existing = document.getElementById('streamer-univ-popover');
  if(existing){ _closeUnivShortcutPopover(); return; }
  try{
    const _plU = (typeof players!=='undefined' && Array.isArray(players)) ? players : [];
    const _getUnivsU = (typeof getAllUnivs === 'function') ? getAllUnivs : null;
    const univs = _getUnivsU ? _getUnivsU().filter(u=>(typeof isLoggedIn!=='undefined'&&isLoggedIn)||!u.hidden) : [];
    const counts = new Map();
    _plU.forEach(p=>{
      if(!p || p.retired || !p.univ) return;
      counts.set(p.univ, (counts.get(p.univ)||0)+1);
    });
    const pop = document.createElement('div');
    pop.id = 'streamer-univ-popover';
    pop.className = 'streamer-univ-popover';
    pop.innerHTML = `
      <div class="streamer-univ-popover-title">🏫 대학 바로가기</div>
      <div class="streamer-univ-popover-list">
        <button type="button" class="streamer-univ-popover-item ${!totalUnivFilter?'on':''}" onclick="_selectUnivShortcut('')">전체 보기</button>
        ${univs.map(u=>`<button type="button" class="streamer-univ-popover-item ${totalUnivFilter===u.name?'on':''}" onclick="_selectUnivShortcut('${String(u.name).replace(/'/g,"\\'")}')"><span class="streamer-univ-popover-dot" style="background:${u.color||'#6366f1'}"></span><span class="streamer-univ-popover-name">${u.name}</span><span class="streamer-univ-popover-cnt">${counts.get(u.name)||0}명</span></button>`).join('')}
      </div>`;
    document.body.appendChild(pop);
    const rect = btn.getBoundingClientRect();
    pop.style.position='fixed';
    pop.style.top = (rect.bottom+6)+'px';
    let left = rect.right - pop.offsetWidth;
    if(left<8) left=8;
    pop.style.left = Math.min(left, window.innerWidth-pop.offsetWidth-8)+'px';
    setTimeout(()=>document.addEventListener('mousedown', _univShortcutOutsideClick, true), 0);
  }catch(e){}
}
function _selectUnivShortcut(name){
  totalUnivFilter = name || '';
  _closeUnivShortcutPopover();
  if(typeof render==='function') render();
  if(totalUnivFilter){
    const _targetUniv = totalUnivFilter;
    requestAnimationFrame(()=>{
      try{
        const esc = (typeof CSS!=='undefined' && CSS.escape) ? CSS.escape(_targetUniv) : _targetUniv.replace(/"/g,'\\"');
        const el = document.querySelector(`[data-univ-header="${esc}"],[data-gallery-univ-header="${esc}"],[data-simple-univ-header="${esc}"],[data-focus-univ-header="${esc}"]`);
        if(el) el.scrollIntoView({behavior:'smooth', block:'start'});
      }catch(e){}
    });
  }
}
if(typeof window!=='undefined'){
  window._toggleUnivShortcutPopover = _toggleUnivShortcutPopover;
  window._selectUnivShortcut = _selectUnivShortcut;
}

