/* ══════════════════════════════════════
   📺 SOOP 멀티뷰 (팝업/오버레이)
   - 상단 버튼 클릭 → 2분할 멀티뷰
   - 주소 목록은 설정탭에서 관리
   - 모바일/태블릿 포함 반응형(폭 좁으면 1열)
══════════════════════════════════════ */
(function(){
  const LS_LIST = 'su_soop_list';
  const LS_LAST_A = 'su_soop_last_a';
  const LS_LAST_B = 'su_soop_last_b';

  const $ = (id)=>document.getElementById(id);
  function toast(msg, ms){ try{ if(typeof showToast==='function') return showToast(msg, ms||2200); }catch(e){} }

  function getList(){
    const raw = String(localStorage.getItem(LS_LIST)||'').trim();
    if(!raw) return [];
    return raw.split(/\r?\n/).map(s=>s.trim()).filter(Boolean);
  }

  function btnEl(){ return $('hdrSoopBtn'); }
  function updateBtn(){
    const b = btnEl();
    if(!b) return;
    const list = getList();
    // (요청사항) 주소가 있을 때만 버튼 노출
    b.style.display = list.length ? '' : 'none';
    b.disabled = !list.length;
  }

  function buildModal(){
    if($('soopMultiOverlay')) return;
    const ov = document.createElement('div');
    ov.id = 'soopMultiOverlay';
    ov.className = 'su-modal-overlay';
    ov.style.display = 'none';
    ov.innerHTML = `
      <div class="su-modal">
        <div class="su-modal-hd">
          <div style="font-weight:1000">📺 SOOP 멀티뷰</div>
          <div style="display:flex;gap:8px;align-items:center">
            <button class="btn btn-w btn-sm" onclick="window.soopMultiSwap()">교체</button>
            <button class="btn btn-r btn-sm" onclick="window.closeSoopMulti()">닫기</button>
          </div>
        </div>
        <div class="su-modal-bd">
          <div class="su-soop-controls">
            <div class="ym-filter-controls compact" style="min-width:240px">
              <span class="ym-lbl">왼쪽</span>
              <select id="soopSelA" class="ym-sel"></select>
            </div>
            <div class="ym-filter-controls compact" style="min-width:240px">
              <span class="ym-lbl">오른쪽</span>
              <select id="soopSelB" class="ym-sel"></select>
            </div>
            <div style="margin-left:auto;display:flex;gap:8px;flex-wrap:wrap">
              <button class="btn btn-b btn-sm" onclick="window.soopMultiReload()">새로고침</button>
              <button class="btn btn-w btn-sm" onclick="window.soopMultiOpenTabs()">새 탭으로 열기</button>
            </div>
          </div>
          <div class="su-soop-grid">
            <div class="su-soop-cell">
              <iframe id="soopFrameA" class="su-soop-iframe" allow="autoplay; fullscreen; picture-in-picture" referrerpolicy="no-referrer"></iframe>
            </div>
            <div class="su-soop-cell">
              <iframe id="soopFrameB" class="su-soop-iframe" allow="autoplay; fullscreen; picture-in-picture" referrerpolicy="no-referrer"></iframe>
            </div>
          </div>
          <div class="su-soop-note">
            일부 사이트는 보안 정책(X-Frame-Options) 때문에 멀티뷰 임베드가 막힐 수 있습니다. 그 경우 <b>“새 탭으로 열기”</b>를 사용해주세요.
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(ov);

    // 배경 클릭 닫기
    ov.addEventListener('click', (e)=>{
      if(e.target === ov) window.closeSoopMulti();
    });
  }

  function fillSelect(sel, list, current){
    if(!sel) return;
    sel.innerHTML = list.map((u,i)=>`<option value="${encodeURIComponent(u)}" ${u===current?'selected':''}>${(i+1)}. ${u}</option>`).join('');
  }

  function setFrame(id, url){
    const f = $(id);
    if(!f) return;
    f.src = url || 'about:blank';
  }

  function open(){
    const list = getList();
    if(!list.length){
      toast('설정탭에서 SOOP 주소를 추가하세요.');
      return;
    }
    buildModal();
    const ov = $('soopMultiOverlay');
    ov.style.display = 'flex';
    document.body.classList.add('su-modal-open');

    const lastA = decodeURIComponent(localStorage.getItem(LS_LAST_A)||'') || list[0];
    const lastB = decodeURIComponent(localStorage.getItem(LS_LAST_B)||'') || (list[1] || list[0]);
    const selA = $('soopSelA');
    const selB = $('soopSelB');
    fillSelect(selA, list, lastA);
    fillSelect(selB, list, lastB);

    const apply = ()=>{
      const a = decodeURIComponent(selA.value||'') || list[0];
      const b = decodeURIComponent(selB.value||'') || (list[1]||list[0]);
      try{ localStorage.setItem(LS_LAST_A, encodeURIComponent(a)); }catch(e){}
      try{ localStorage.setItem(LS_LAST_B, encodeURIComponent(b)); }catch(e){}
      setFrame('soopFrameA', a);
      setFrame('soopFrameB', b);
    };
    selA.onchange = apply;
    selB.onchange = apply;
    apply();
  }

  function close(){
    const ov = $('soopMultiOverlay');
    if(!ov) return;
    ov.style.display = 'none';
    document.body.classList.remove('su-modal-open');
    // iframe 정지(리소스 절약)
    setFrame('soopFrameA','about:blank');
    setFrame('soopFrameB','about:blank');
  }

  function reload(){
    try{ $('soopFrameA').contentWindow.location.reload(); }catch(e){ /* cross origin */ $('soopFrameA').src = $('soopFrameA').src; }
    try{ $('soopFrameB').contentWindow.location.reload(); }catch(e){ $('soopFrameB').src = $('soopFrameB').src; }
  }
  function openTabs(){
    const a = decodeURIComponent($('soopSelA')?.value||'');
    const b = decodeURIComponent($('soopSelB')?.value||'');
    if(a) window.open(a, '_blank', 'noopener');
    if(b) window.open(b, '_blank', 'noopener');
  }
  function swap(){
    const selA = $('soopSelA'), selB = $('soopSelB');
    if(!selA || !selB) return;
    const t = selA.value;
    selA.value = selB.value;
    selB.value = t;
    selA.onchange && selA.onchange();
  }

  // 설정 변경 시 호출
  window.soopApplySettings = function(){ updateBtn(); };
  window.openSoopMulti = open;
  window.closeSoopMulti = close;
  window.soopMultiReload = reload;
  window.soopMultiOpenTabs = openTabs;
  window.soopMultiSwap = swap;

  window.initSoopMulti = function(){
    const b = btnEl();
    if(b && !b.dataset.bound){
      b.dataset.bound='1';
      b.addEventListener('click', (e)=>{ e.preventDefault(); open(); });
    }
    updateBtn();
  };

  try{ window.initSoopMulti(); }catch(e){}
})();

