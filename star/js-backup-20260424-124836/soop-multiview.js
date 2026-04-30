/* ══════════════════════════════════════
   📺 SOOP 멀티뷰 (팝업/오버레이)
   - 상단 버튼 클릭 → 2분할 멀티뷰
   - 주소 목록은 설정탭에서 관리
   - 모바일/태블릿 포함 반응형(폭 좁으면 1열)
══════════════════════════════════════ */
(function(){
  const LS_LIST = 'su_soop_list';
  let _soopRO = null;
  let _soopLayoutRAF = 0;
  let _soopLastBox = '';

  const $ = (id)=>document.getElementById(id);
  function toast(msg, ms){ try{ if(typeof showToast==='function') return showToast(msg, ms||2200); }catch(e){} }

  function soopNormalizeId(input){
    const s = String(input||'').trim();
    if(!s) return '';
    // 이미 ID 형태면 그대로
    if (/^[a-zA-Z0-9_]{2,}$/i.test(s) && !s.includes('/')) return s;
    // URL에서 추출
    try{
      const u = new URL(s, window.location.href);
      const host = (u.hostname || '').toLowerCase();
      if(host.includes('play.sooplive.co.kr') || host.includes('play.sooplive.com')){
        const path = u.pathname || '';
        const match = path.match(/^\/([^\/]+)/);
        return match ? match[1] : '';
      }
    }catch(e){}
    return '';
  }

  function getList(){
    const raw = String(localStorage.getItem(LS_LIST)||'').trim();
    if(!raw) return [];
    // (버그픽스/개선) ID/URL 모두 허용 + 중복 제거
    const lines = raw.split(/\r?\n/)
      .map(x=>x.trim())
      .filter(Boolean)
      .map(soopNormalizeId)
      .filter(Boolean);
    const seen = new Set();
    const out = [];
    lines.forEach(u=>{ if(!seen.has(u)){ seen.add(u); out.push(u); } });
    return out;
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
      <div class="su-modal" style="
        position:absolute;
        width:min(1100px, calc(100vw - 28px));
        height:min(720px, calc(100vh - 28px));
        resize:both;
        overflow:hidden;">
        <div class="su-modal-hd" id="soopDragHandle" style="cursor:move;user-select:none">
          <div style="display:flex;align-items:center;gap:10px;min-width:0">
            <div style="font-weight:1000;white-space:nowrap">📺 SOOP 방송보기</div>
          </div>
          <div style="display:flex;gap:8px;align-items:center;flex-shrink:0">
            <button class="btn btn-r btn-sm" onclick="window.closeSoopMulti()">닫기</button>
          </div>
        </div>
        <div class="su-modal-bd" style="padding:10px;overflow:hidden;flex:1;min-height:0">
          <!-- 방송 그리드 (팝업창 가득) -->
          <div id="soop-grid" style="display:grid;grid-template-columns:repeat(1,1fr);grid-template-rows:repeat(1,1fr);gap:10px;height:100%;min-height:0"></div>
        </div>
      </div>
    `;
    document.body.appendChild(ov);

    // 배경 클릭 닫기
    ov.addEventListener('click', (e)=>{
      if(e.target === ov) window.closeSoopMulti();
    });

    // 드래그 이동 (PC 마우스)
    const modal = ov.querySelector('.su-modal');
    const handle = ov.querySelector('#soopDragHandle');
    if(modal && handle && !handle.dataset.bound){
      handle.dataset.bound='1';
      handle.addEventListener('mousedown', (e)=>{
        // 닫기 버튼 등 컨트롤 클릭은 드래그 시작하지 않음
        try{ if(e.target && e.target.closest && e.target.closest('button')) return; }catch(_){}
        // 버튼 클릭 등은 무시
        if(e.button !== 0) return;
        e.preventDefault();
        const rect = modal.getBoundingClientRect();
        // overlay flex 영향 제거
        ov.style.alignItems = 'flex-start';
        ov.style.justifyContent = 'flex-start';
        modal.style.left = rect.left + 'px';
        modal.style.top  = rect.top  + 'px';
        const startX = e.clientX - rect.left;
        const startY = e.clientY - rect.top;
        const onMove = (ev)=>{
          const maxL = window.innerWidth - modal.offsetWidth - 6;
          const maxT = window.innerHeight - modal.offsetHeight - 6;
          modal.style.left = Math.min(maxL, Math.max(6, ev.clientX - startX)) + 'px';
          modal.style.top  = Math.min(maxT, Math.max(6, ev.clientY - startY)) + 'px';
        };
        const onUp = ()=>{
          document.removeEventListener('mousemove', onMove);
          document.removeEventListener('mouseup', onUp);
        };
        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp);
      });
    }
  }

  function embedUrl(id){ return id ? `https://play.sooplive.co.kr/${id}/embed` : 'about:blank'; }

  function applySoopLayout(){
    const ov = $('soopMultiOverlay');
    const grid = $('soop-grid');
    const bd = ov ? ov.querySelector('.su-modal-bd') : null;
    if(!ov || !grid || !bd) return;
    const ids = getList();
    const n = ids.length;
    if(!n) return;
    const W = bd.clientWidth;
    const H = bd.clientHeight;
    if(W < 50 || H < 50) return;
    const GAP = 10;
    const target = 9/16; // height/width
    let best = { cols: 1, area: -1, score: 1e9 };
    const maxCols = Math.min(n, 6);
    for(let cols=1; cols<=maxCols; cols++){
      const rows = Math.ceil(n / cols);
      const cellW = (W - GAP * (cols - 1)) / cols;
      const cellH = (H - GAP * (rows - 1)) / rows;
      if(cellW <= 0 || cellH <= 0) continue;
      const area = cellW * cellH;
      const score = Math.abs((cellH / cellW) - target);
      // 우선: 큰 면적, 다음: 비율 근접
      if(area > best.area + 1 || (Math.abs(area - best.area) <= 1 && score < best.score)){
        best = { cols, area, score };
      }
    }
    const cols = best.cols;
    const rows = Math.ceil(n / cols);
    // fr 트랙을 사용하려면 grid 컨테이너의 높이가 "확정"이어야 하므로 height:100% 유지
    grid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    grid.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
    grid.style.gridAutoRows = `unset`;
    grid.style.gap = `${GAP}px`;
    grid.style.height = '100%';
    grid.style.minHeight = '0';
  }

  function _startLayoutWatcher(){
    const ov = $('soopMultiOverlay');
    const bd = ov ? ov.querySelector('.su-modal-bd') : null;
    if(!ov || !bd) return;
    const tick = ()=>{
      const box = bd.clientWidth + 'x' + bd.clientHeight + ':' + getList().length;
      if(box !== _soopLastBox){
        _soopLastBox = box;
        applySoopLayout();
      }
      _soopLayoutRAF = requestAnimationFrame(tick);
    };
    if(_soopLayoutRAF) cancelAnimationFrame(_soopLayoutRAF);
    _soopLayoutRAF = requestAnimationFrame(tick);
  }

  function _stopLayoutWatcher(){
    if(_soopLayoutRAF){
      cancelAnimationFrame(_soopLayoutRAF);
      _soopLayoutRAF = 0;
    }
    _soopLastBox = '';
  }

  function soopRender(){
    const grid = $('soop-grid');
    if(!grid) return;
    const ids = getList();
    if(!ids.length){
      grid.innerHTML = `<div style="padding:30px;text-align:center;color:var(--gray-l);background:var(--surface);border-radius:12px;border:2px dashed var(--border2)">
        SOOP 방송 목록이 비어있습니다.
      </div>`;
      return;
    }
    grid.innerHTML = ids.map(id=>`
      <div class="soop-cell" style="background:var(--white);border:1.5px solid var(--border2);border-radius:14px;overflow:hidden;display:flex;flex-direction:column;min-height:0">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;padding:8px 10px;background:var(--surface);border-bottom:1px solid var(--border2)">
          <div style="font-weight:900;font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${id}</div>
        </div>
        <iframe src="${embedUrl(id)}" allow="autoplay; fullscreen; picture-in-picture" referrerpolicy="no-referrer" style="width:100%;height:100%;border:0;background:#000;flex:1;min-height:0"></iframe>
      </div>
    `).join('');
    // 렌더 직후 레이아웃 적용
    setTimeout(applySoopLayout, 0);
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
    // 초기 위치: 화면 중앙
    try{
      const modal = ov.querySelector('.su-modal');
      if(modal){
        ov.style.alignItems = 'flex-start';
        ov.style.justifyContent = 'flex-start';
        const w = modal.offsetWidth || 900;
        const h = modal.offsetHeight || 640;
        modal.style.left = Math.max(6, Math.floor((window.innerWidth - w)/2)) + 'px';
        modal.style.top  = Math.max(6, Math.floor((window.innerHeight - h)/2)) + 'px';
      }
    }catch(e){}
    soopRender();
    // resize observer로 팝업 크기 변경 시 자동 재배치
    try{
      if(_soopRO) { try{ _soopRO.disconnect(); }catch(_){} _soopRO = null; }
      if(window.ResizeObserver){
        const bd = ov.querySelector('.su-modal-bd');
        _soopRO = new ResizeObserver(()=>applySoopLayout());
        if(bd) _soopRO.observe(bd);
      }
    }catch(e){}
    // ResizeObserver가 없거나 동작이 불안정한 환경 대비: RAF 감시
    try{ _startLayoutWatcher(); }catch(e){}
    // 창 리사이즈에도 반영
    try{
      window.addEventListener('resize', applySoopLayout, {passive:true});
    }catch(e){}
  }

  function close(){
    const ov = $('soopMultiOverlay');
    if(!ov) return;
    ov.style.display = 'none';
    document.body.classList.remove('su-modal-open');
    // iframe 정지(리소스 절약)
    try{
      const grid = $('soop-grid');
      if(grid) grid.querySelectorAll('iframe').forEach(f=>{ f.src='about:blank'; });
    }catch(e){}
    try{ if(_soopRO){ _soopRO.disconnect(); _soopRO = null; } }catch(e){}
    try{ _stopLayoutWatcher(); }catch(e){}
    try{ window.removeEventListener('resize', applySoopLayout); }catch(e){}
  }

  function reload(){
    try{
      const grid = $('soop-grid');
      if(grid) grid.querySelectorAll('iframe').forEach(f=>{
        try{ f.contentWindow.location.reload(); }catch(e){ f.src = f.src; }
      });
    }catch(e){}
  }
  function openTabs(){
    const ids = getList();
    ids.forEach(id=>{
      const u = embedUrl(id);
      if(u && u!=='about:blank') window.open(u, '_blank', 'noopener');
    });
  }

  // 설정 변경 시 호출
  window.soopApplySettings = function(){ updateBtn(); };
  window.openSoopMulti = open;
  window.closeSoopMulti = close;
  window.soopMultiReload = reload;
  window.soopMultiOpenTabs = openTabs;

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
