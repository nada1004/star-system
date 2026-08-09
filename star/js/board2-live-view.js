/* ══════════════════════════════════════════════════════════════
   현황판 — 📺 라이브 뷰 (SOOP 채널 등록 스트리머 방송화면 모아보기)
   - p.channelUrl 이 SOOP(sooplive) 주소인 스트리머만 추출
   - 대학별 / 티어별 필터 + 이름검색 + 정렬
   - IntersectionObserver로 화면에 보이는 카드만 iframe 로드(성능)
   - 카드 확대보기 모달 지원
   - (2026-08 제거) 방송중 여부 자동감지용 SOOP 비공식 API 폴링(/api/soop-live-status)은
     삭제됨. 카드는 항상 프로필 사진을 기본 커버로 표시하며, is-live 강조/정렬은
     더 이상 사용하지 않는다. 호버/클릭 시 실제 방송 화면 미리보기(iframe)는 그대로 동작.
   ══════════════════════════════════════════════════════════════ */

var _b2LiveUnivFilter = '전체';
var _b2LiveTierFilter = '전체';
var _b2LiveGenderFilter = (()=>{ try{ const g = localStorage.getItem('su_b2_live_gender'); return ['전체','F','M'].includes(g) ? g : '전체'; }catch(e){ return '전체'; } })();
var _b2LiveSearch = '';
var _b2LiveSortMode = (()=>{ try{ return localStorage.getItem('su_b2_live_sort') || 'tier'; }catch(e){ return 'tier'; } })(); // 'tier' | 'name' | 'univ'
var _b2LiveObserver = null;
var _b2LiveHoverOpenTimer = null;
var _b2LiveHoverCloseTimer = null;
var _b2LiveHoverOpenId = '';
var _b2LiveHoverOpenName = '';
var _b2LiveInlineHideTimers = {};
var _b2LiveViewMode = (()=>{ try{ const m = localStorage.getItem('su_b2_live_viewmode'); return ['card','theater'].includes(m) ? m : 'card'; }catch(e){ return 'card'; } })(); // 'card'(카드형) | 'theater'(시청형: 좌측 큰화면+우측 대학별 목록)
var _b2LiveTheaterSelected = null; // { id, name, univ } — 시청형 모드에서 현재 큰 화면에 재생 중인 스트리머
var _b2LiveTheaterUnivSel = null; // 시청형 모드 우측 목록에서 드릴다운한 대학명(null이면 대학 버튼 목록 표시)

// soop-multiview.js 의 정규화 로직과 동일 — 독립 로드 순서 문제 없도록 자체 보유
function _b2LiveSoopId(input) {
  const s = String(input || '').trim();
  if (!s) return '';
  try {
    const u = new URL(s, window.location.href);
    const host = (u.hostname || '').toLowerCase();
    if (host.includes('sooplive.co.kr') || host.includes('sooplive.com') || host.includes('afreecatv.com')) {
      const path = u.pathname || '';
      const m = path.match(/^\/([^\/]+)/);
      return m ? m[1] : '';
    }
  } catch (e) {}
  return '';
}

function _b2LiveEmbedUrl(id, autoplay) {
  // 라이브 탭은 항상 무음으로 시작되게 파라미터를 최대한 명시한다.
  // (2026-08-01 재변경) 호버만 해도 전부 자동재생되는 건 원치 않는다는 피드백으로
  // 기본값은 다시 자동재생 없음(autoPlay=n) — 화면(호버 미리보기/확대보기)은 뜨되
  // 재생은 사용자가 명시적으로 클릭했을 때만(autoplay 인자가 true일 때만) 시작됨.
  // SOOP 임베드 파라미터가 비공식이라 환경별 차이는 있을 수 있다.
  return id ? `https://play.sooplive.co.kr/${id}/embed?mute=y&muted=true&volume=0&showChat=false&autoPlay=${autoplay ? 'true' : 'false'}` : '';
}

function _b2LiveSetSort(mode) {
  _b2LiveSortMode = ['tier','name','univ'].includes(mode) ? mode : 'tier';
  try{ localStorage.setItem('su_b2_live_sort', _b2LiveSortMode); }catch(e){}
  const el = document.getElementById('b2-content');
  if (el) { el.innerHTML = _b2LiveView(); if (typeof injectUnivIcons === 'function') injectUnivIcons(el); }
  _b2LiveTheaterReinitIfNeeded();
}

function _b2LiveSetViewMode(mode) {
  _b2LiveViewMode = mode === 'theater' ? 'theater' : 'card';
  try{ localStorage.setItem('su_b2_live_viewmode', _b2LiveViewMode); }catch(e){}
  // 재생 중인 스트리머가 있는데 목록이 드릴다운 안 된 상태로 시청형에 진입하면,
  // 해당 스트리머의 소속 대학으로 자동 드릴다운해 목록에서 바로 보이게 한다.
  if (_b2LiveViewMode === 'theater' && _b2LiveTheaterSelected && !_b2LiveTheaterUnivSel) {
    _b2LiveTheaterUnivSel = String(_b2LiveTheaterSelected.univ || '').trim() || '무소속';
  }
  const el = document.getElementById('b2-content');
  if (el) { el.innerHTML = _b2LiveView(); if (typeof injectUnivIcons === 'function') injectUnivIcons(el); }
  if (_b2LiveViewMode === 'theater' && typeof _b2LiveTheaterInitList === 'function') setTimeout(_b2LiveTheaterInitList, 0);
}

// 시청형(theater) 모드 우측 스트리머 목록: 좌측 큰 화면(main)의 실제 렌더링 높이에
// 맞춰 우측 목록의 높이를 동적으로 맞추고(비율 기반 높이라 뷰포트 계산만으론 안 맞음),
// 그 안에서 마우스 드래그로 스크롤할 수 있게 한다(휠 스크롤도 계속 동작).
function _b2LiveTheaterSyncListHeight() {
  try {
    const main = document.getElementById('b2-live-theater-main');
    const list = document.getElementById('b2-live-theater-list');
    if (!main || !list) return;
    if (window.matchMedia && window.matchMedia('(max-width:1024px)').matches) {
      list.style.height = '';
      return;
    }
    const h = main.getBoundingClientRect().height;
    if (h > 0) list.style.height = h + 'px';
  } catch (e) {}
}

// 현재 재생 중인 스트리머가 목록에 보이면(드릴다운된 대학과 일치) 그 위치로 스크롤
function _b2LiveTheaterScrollToActive() {
  try {
    const list = document.getElementById('b2-live-theater-list');
    const active = list && list.querySelector('.b2-live-theater-item.active');
    if (!list || !active) return;
    const listRect = list.getBoundingClientRect();
    const itemRect = active.getBoundingClientRect();
    if (itemRect.top < listRect.top || itemRect.bottom > listRect.bottom) {
      active.scrollIntoView({ block: 'nearest' });
    }
  } catch (e) {}
}

function _b2LiveTheaterInitList() {
  try {
    const list = document.getElementById('b2-live-theater-list');
    if (!list) return;
    if (list.dataset.dragInit !== '1') {
      list.dataset.dragInit = '1';
      let isDown = false, startY = 0, startScroll = 0, moved = false, capturedId = null;
      list.addEventListener('pointerdown', (e) => {
        if (e.button !== undefined && e.button !== 0) return;
        isDown = true; moved = false; startY = e.clientY; startScroll = list.scrollTop; capturedId = e.pointerId;
        // 주의: 여기서 setPointerCapture를 걸면 클릭(버튼 onclick)까지 list로 리디렉션되어
        // 버튼이 아예 눌리지 않게 된다 — 실제로 드래그가 확인된 순간(pointermove)에만 캡처한다.
      });
      list.addEventListener('pointermove', (e) => {
        if (!isDown) return;
        const dy = e.clientY - startY;
        if (Math.abs(dy) > 4) {
          if (!moved) {
            moved = true;
            list.style.cursor = 'grabbing';
            try { list.setPointerCapture(capturedId); } catch (e2) {}
          }
          list.scrollTop = startScroll - dy;
        }
      });
      const endDrag = () => { isDown = false; list.style.cursor = 'grab'; };
      list.addEventListener('pointerup', endDrag);
      list.addEventListener('pointerleave', endDrag);
      list.addEventListener('pointercancel', endDrag);
      // 드래그로 판단되면(4px 이상 이동) 클릭으로 이어져 스트리머가 잘못 선택되는 것 방지
      list.addEventListener('click', (e) => { if (moved) { e.stopPropagation(); e.preventDefault(); moved = false; } }, true);
      list.style.cursor = 'grab';
    }
    if (!window._b2LiveTheaterResizeBound) {
      window._b2LiveTheaterResizeBound = true;
      window.addEventListener('resize', () => { if (typeof _b2LiveTheaterSyncListHeight === 'function') _b2LiveTheaterSyncListHeight(); });
    }
    _b2LiveTheaterSyncListHeight();
    _b2LiveTheaterScrollToActive();
  } catch (e) {}
}

function _b2LiveSetGender(g) {
  _b2LiveGenderFilter = ['전체','F','M'].includes(g) ? g : '전체';
  try{ localStorage.setItem('su_b2_live_gender', _b2LiveGenderFilter); }catch(e){}
  const el = document.getElementById('b2-content');
  if (el) { el.innerHTML = _b2LiveView(); if (typeof injectUnivIcons === 'function') injectUnivIcons(el); }
  _b2LiveTheaterReinitIfNeeded();
}

function _b2LiveSetUnivFilter(v) {
  _b2LiveUnivFilter = v;
  const el = document.getElementById('b2-content');
  if (el) { el.innerHTML = _b2LiveView(); if (typeof injectUnivIcons === 'function') injectUnivIcons(el); }
  _b2LiveTheaterReinitIfNeeded();
}

function _b2LiveSetTierFilter(v) {
  _b2LiveTierFilter = v;
  const el = document.getElementById('b2-content');
  if (el) { el.innerHTML = _b2LiveView(); if (typeof injectUnivIcons === 'function') injectUnivIcons(el); }
  _b2LiveTheaterReinitIfNeeded();
}

// 필터(대학/티어/성별) 변경으로 #b2-content 전체가 새로 그려지면 시청형 우측 목록의
// 높이 동기화·드래그 스크롤 바인딩(dataset.dragInit)도 새 DOM과 함께 초기화되어 버리므로
// 재초기화한다. 카드형일 때는 아무 것도 하지 않음.
function _b2LiveTheaterReinitIfNeeded() {
  if (_b2LiveViewMode === 'theater' && typeof _b2LiveTheaterInitList === 'function') {
    setTimeout(_b2LiveTheaterInitList, 0);
  }
}

// 화면에 보이는 카드만 iframe src를 채워 넣는 지연로딩 옵저버
function _b2LiveInitObservers(container) {
  try {
    if (!container) return;
    if (_b2LiveObserver) { try{ _b2LiveObserver.disconnect(); }catch(e){} _b2LiveObserver = null; }
    const boxes = container.querySelectorAll('.b2-live-frame-box[data-src]');
    if (!boxes.length) return;
    if (!window.IntersectionObserver) {
      // 폴백: 옵저버 미지원 환경이면 즉시 전부 로드
      boxes.forEach(b => { const f = b.querySelector('iframe'); if (f && !f.src) f.src = b.dataset.src; });
      return;
    }
    _b2LiveObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const box = entry.target;
        const f = box.querySelector('iframe');
        if (f && !f.src) f.src = box.dataset.src;
        _b2LiveObserver.unobserve(box);
      });
    }, { root: null, rootMargin: '200px 0px', threshold: 0.01 });
    boxes.forEach(b => _b2LiveObserver.observe(b));
  } catch (e) {}
}

// 카드 확대보기 모달 (soop-multiview.js 와 동일한 .su-modal 스타일 재사용)
function _b2LiveEnlarge(id, name) {
  try {
    if (!id) return;
    let ov = document.getElementById('b2LiveEnlargeOverlay');
    if (!ov) {
      ov = document.createElement('div');
      ov.id = 'b2LiveEnlargeOverlay';
      ov.className = 'su-modal-overlay';
      document.body.appendChild(ov);
    }
    ov.style.display = 'flex';
    // (요청사항) 확대보기는 팝업창 가득하게 크게 표시 — su-modal-bd에 flex:1이 없으면
    // iframe height:100%가 부모 높이를 못 잡아 영상이 작게(기본 iframe 높이) 나오고
    // 나머지 공간이 빈 흰 여백으로 남는 문제가 있어 flex:1;min-height:0 추가
    ov.innerHTML = `
      <div class="su-modal" style="width:min(1024px, calc(100vw - 20px));height:min(640px, calc(100vh - 20px));overflow:hidden;display:flex;flex-direction:column">
        <div class="su-modal-hd">
          <div style="font-weight:1000">📺 ${name || ''}</div>
          <button type="button" class="btn btn-r btn-sm" onclick="document.getElementById('b2LiveEnlargeOverlay').style.display='none';document.getElementById('b2LiveEnlargeOverlay').innerHTML=''">닫기</button>
        </div>
        <div class="su-modal-bd" style="padding:0;overflow:hidden;flex:1;min-height:0;height:100%">
          <iframe src="${_b2LiveEmbedUrl(id, true)}" allow="autoplay; fullscreen; picture-in-picture" referrerpolicy="no-referrer"
            style="width:100%;height:100%;border:0;background:#000;display:block"></iframe>
        </div>
      </div>
    `;
    ov.onclick = (e) => { if (e.target === ov) { ov.style.display = 'none'; ov.innerHTML = ''; } };
  } catch (e) {}
}


// 참고사이트(ssustar/live)처럼 경과시간을 "n분 전"/"n시간 전" 형태로 표시
function _b2LiveRelativeTime(startTimeStr) {
  if (!startTimeStr) return '';
  try {
    const start = new Date(String(startTimeStr).replace(/-/g, '/'));
    const diffMs = Date.now() - start.getTime();
    if (!Number.isFinite(diffMs) || diffMs < 0) return '';
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return '방금 전';
    if (diffMin < 60) return `${diffMin}분 전`;
    const diffHour = Math.floor(diffMin / 60);
    if (diffHour < 24) return `${diffHour}시간 전`;
    return `${Math.floor(diffHour / 24)}일 전`;
  } catch (e) { return ''; }
}

function _b2LiveFindCard(anchorEl){
  try{ return anchorEl && anchorEl.closest ? anchorEl.closest('.b2-live-card') : null; }catch(e){ return null; }
}

// 프로필 이미지에 마우스를 올리면 방송 화면을 보여줌 (기본은 자동재생 없음 — 정지 화면으로 대기,
// forcePlay=true로 호출하면(클릭 시) 바로 재생 시작)
function _b2LiveShowInlinePreview(anchorEl, id, forcePlay) {
  try {
    if (!anchorEl || !id) return;
    const card = _b2LiveFindCard(anchorEl);
    if (!card) return;
    if (_b2LiveInlineHideTimers[id]) { clearTimeout(_b2LiveInlineHideTimers[id]); _b2LiveInlineHideTimers[id] = null; }
    const frameBox = card.querySelector('.b2-live-inline-box');
    const frame = card.querySelector('.b2-live-inline-frame');
    const cover = card.querySelector('.b2-live-cover-wrap');
    if (frameBox) frameBox.style.display = 'block';
    if (cover) cover.style.opacity = '0';
    if (frame) {
      const nextSrc = _b2LiveEmbedUrl(id, !!forcePlay);
      // autoplay 여부(n↔y)만 바뀌어도 src가 달라지므로, 호버 중 이미 떠있던 화면을
      // 클릭해 재생으로 전환하는 경우에도 정상적으로 다시 로드됨
      if (frame.getAttribute('src') !== nextSrc) frame.setAttribute('src', nextSrc);
    }
    card.classList.add('is-previewing');
  } catch (e) {}
}

// 마우스가 프로필 이미지를 벗어나면 다시 썸네일로 복귀
function _b2LiveHideInlinePreview(anchorEl, id, e) {
  try {
    const card = _b2LiveFindCard(anchorEl);
    if (!card || !id) return;
    const related = e && e.relatedTarget;
    if (related && anchorEl.contains && anchorEl.contains(related)) return;
    if (_b2LiveInlineHideTimers[id]) clearTimeout(_b2LiveInlineHideTimers[id]);
    _b2LiveInlineHideTimers[id] = setTimeout(() => {
      try {
        if (anchorEl.matches && anchorEl.matches(':hover')) return;
        const frameBox = card.querySelector('.b2-live-inline-box');
        const frame = card.querySelector('.b2-live-inline-frame');
        const cover = card.querySelector('.b2-live-cover-wrap');
        if (frame) frame.removeAttribute('src');
        if (frameBox) frameBox.style.display = 'none';
        if (cover) cover.style.opacity = '1';
        card.classList.remove('is-previewing');
      } catch (_) {}
    }, 120);
  } catch (e) {}
}

// 방송화면(프로필 큰 이미지)을 클릭하면 바로 재생되도록 — 호버로 뜬 화면은 자동재생되지
// 않지만, 클릭은 명시적 재생 의도이므로 forcePlay=true로 호출해 바로 재생 시작
function _b2LiveClickCover(el, id) {
  try {
    if (!el || !id) return;
    _b2LiveShowInlinePreview(el, id, true);
  } catch (e) {}
}

function _b2LiveView() {
  // SOOP 채널 등록된 스트리머만 추출 (대학 소속이거나 무소속탭에 있는 멤버만 — 'YB' 표기만 제외)
  const soopPlayers = (typeof players !== 'undefined' ? players : []).filter(p => {
    if (p.hidden || p.retired || p.hideFromBoard) return false;
    const _u = String(p?.univ || '').trim();
    if (_u === 'YB') return false;
    return !!_b2LiveSoopId(p.channelUrl);
  }).map(p => Object.assign({ _soopId: _b2LiveSoopId(p.channelUrl) }, p));

  // 대학 목록 (필터용, univCfg 순서 정렬)
  const univList = [...new Set(soopPlayers.map(p => String(p?.univ || '').trim()).filter(Boolean))];
  if (typeof univCfg !== 'undefined') {
    univList.sort((a, b) => {
      const idxA = univCfg.findIndex(u => u.name === a);
      const idxB = univCfg.findIndex(u => u.name === b);
      return (idxA >= 0 ? idxA : 999) - (idxB >= 0 ? idxB : 999);
    });
  } else {
    univList.sort();
  }

  const _liveDark = (typeof document !== 'undefined' && document.body && document.body.classList.contains('dark'));
  const genderBtn = (v, label) => `<button type="button" class="b2-toolbar-btn" onclick="_b2LiveSetGender('${v}')" title="${label}" aria-pressed="${_b2LiveGenderFilter===v}"
    style="padding:8px 14px;border-radius:20px;border:1.5px solid ${_b2LiveGenderFilter===v?(_liveDark?'#60a5fa':'#2563eb'):'var(--border2)'};background:${_b2LiveGenderFilter===v?(_liveDark?'linear-gradient(135deg,#1e3a5f,#1e293b)':'linear-gradient(135deg,#eff6ff,#dbeafe)'):'var(--white)'};color:${_b2LiveGenderFilter===v?(_liveDark?'#93c5fd':'#1d4ed8'):'var(--text2)'};font-size:var(--fs-base);font-weight:${_b2LiveGenderFilter===v?900:700};cursor:pointer;margin-bottom:0;white-space:nowrap">${label}</button>`;

  const filterBar = `
    <style>
      /* ── 라이브탭 카드 리뉴얼: 가독성/사용성 개선 공용 클래스 ── */
      .b2-live-card{ transition:box-shadow .15s ease, border-color .15s ease, transform .15s ease; }
      .b2-live-card:hover{ box-shadow:0 10px 26px rgba(15,23,42,.10); border-color:#94a3b8; transform:translateY(-2px); }
      .b2-live-card.is-live{ border-color:rgba(220,38,38,.4); box-shadow:0 0 0 1px rgba(220,38,38,.12); }
      .b2-live-card.is-live:hover{ box-shadow:0 12px 28px rgba(220,38,38,.16); }

      .b2-live-name{ transition:color .12s ease; }
      .b2-live-name:hover{ color:#2563eb; text-decoration:underline; text-decoration-thickness:1.5px; text-underline-offset:2px; }

      .b2-live-tag{ display:inline-flex; align-items:center; line-height:1.5; border-radius:999px; font-weight:800; }

      .b2-live-iconbtn{ display:inline-flex; align-items:center; justify-content:center; border:1.5px solid var(--border2); background:var(--white); color:var(--text2); cursor:pointer; text-decoration:none; transition:background .12s ease, border-color .12s ease, color .12s ease, transform .1s ease; }
      .b2-live-iconbtn:hover{ background:#eff6ff; border-color:#93c5fd; color:#1d4ed8; }
      .b2-live-iconbtn:active{ transform:scale(.92); }
      .b2-live-iconbtn:focus-visible{ outline:2px solid #2563eb; outline-offset:2px; }

      .b2-live-iconbtn-photo{ border-color:rgba(255,255,255,.4); background:rgba(15,23,42,.38); color:#fff; backdrop-filter:blur(3px); }
      .b2-live-iconbtn-photo:hover{ background:rgba(15,23,42,.6); border-color:rgba(255,255,255,.7); color:#fff; }

      .b2-live-avatar-btn{ transition:box-shadow .15s ease; }
      .b2-live-avatar-btn.is-live{ box-shadow:0 0 0 2px rgba(220,38,38,.35), 0 4px 12px rgba(15,23,42,.1); }

      .b2-live-group-badge{ font-weight:900; border-radius:999px; letter-spacing:.2px; }

      .b2-toolbar-btn:hover{ filter:brightness(.97); }
    </style>
    <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:10px">
      <div style="display:flex;gap:3px;align-items:center;background:var(--surface);padding:3px;border-radius:20px;border:1.5px solid var(--border2)">
        <button type="button" onclick="_b2LiveSetViewMode('card')" aria-pressed="${_b2LiveViewMode==='card'}"
          style="padding:6px 13px;border-radius:16px;border:none;cursor:pointer;font-weight:900;font-size:var(--fs-base);white-space:nowrap;background:${_b2LiveViewMode==='card'?'var(--white)':'transparent'};box-shadow:${_b2LiveViewMode==='card'?'0 2px 6px rgba(15,23,42,.12)':'none'};color:${_b2LiveViewMode==='card'?'var(--text)':'var(--text3)'}">🖼️ 카드형</button>
        <button type="button" onclick="_b2LiveSetViewMode('theater')" aria-pressed="${_b2LiveViewMode==='theater'}"
          style="padding:6px 13px;border-radius:16px;border:none;cursor:pointer;font-weight:900;font-size:var(--fs-base);white-space:nowrap;background:${_b2LiveViewMode==='theater'?'var(--white)':'transparent'};box-shadow:${_b2LiveViewMode==='theater'?'0 2px 6px rgba(15,23,42,.12)':'none'};color:${_b2LiveViewMode==='theater'?'var(--text)':'var(--text3)'}">🎬 시청형</button>
      </div>
      <div style="position:relative">
        <select id="b2-live-univ-sel" class="b2-toolbar-select"
          onchange="_b2LiveSetUnivFilter(this.value)"
          style="padding:8px 30px 8px 13px;border-radius:20px;border:1.5px solid var(--border2);font-size:var(--fs-base);font-weight:700;background:var(--white);color:var(--text2);appearance:none;cursor:pointer">
          <option value="전체"${_b2LiveUnivFilter === '전체' ? ' selected' : ''}>🏫 전체 대학</option>
          ${univList.map(u => `<option value="${u}"${_b2LiveUnivFilter === u ? ' selected' : ''}>${u}</option>`).join('')}
        </select>
      </div>
      <div style="position:relative">
        <select id="b2-live-tier-sel" class="b2-toolbar-select"
          onchange="_b2LiveSetTierFilter(this.value)"
          style="padding:8px 30px 8px 13px;border-radius:20px;border:1.5px solid var(--border2);font-size:var(--fs-base);font-weight:700;background:var(--white);color:var(--text2);appearance:none;cursor:pointer">
          <option value="전체"${_b2LiveTierFilter === '전체' ? ' selected' : ''}>🎖️ 전체 티어</option>
          ${(typeof TIERS !== 'undefined' ? TIERS : []).map(t => `<option value="${t}"${_b2LiveTierFilter === t ? ' selected' : ''}>${typeof getTierLabel === 'function' ? getTierLabel(t) : t}</option>`).join('')}
        </select>
      </div>
      <div style="position:relative">
        <select id="b2-live-sort-sel" class="b2-toolbar-select"
          onchange="_b2LiveSetSort(this.value)"
          style="padding:8px 30px 8px 13px;border-radius:20px;border:1.5px solid var(--border2);font-size:var(--fs-base);font-weight:700;background:var(--white);color:var(--text2);appearance:none;cursor:pointer">
          <option value="tier"${_b2LiveSortMode==='tier'?' selected':''}>🎖️ 티어순</option>
          <option value="univ"${_b2LiveSortMode==='univ'?' selected':''}>🏫 대학순</option>
          <option value="name"${_b2LiveSortMode==='name'?' selected':''}>🔤 이름순</option>
        </select>
      </div>
      <div style="display:flex;gap:4px;align-items:center">
        ${genderBtn('전체','전체')}${genderBtn('F','♀ 여자만')}${genderBtn('M','♂ 남자만')}
      </div>
      <a href="https://www.sooplive.com/live/group/game?categoryNo=00040001&amp;categoryName=%EC%8A%A4%ED%83%80%ED%81%AC%EB%9E%98%ED%94%84%ED%8A%B8"
        target="_blank" rel="noopener noreferrer" class="b2-toolbar-btn"
        style="display:inline-flex;align-items:center;gap:5px;padding:8px 14px;border-radius:20px;border:1.5px solid #16a34a;background:${_liveDark?'linear-gradient(135deg,#052e1a,#0a3d24)':'linear-gradient(135deg,#f0fdf4,#dcfce7)'};color:${_liveDark?'#4ade80':'#15803d'};font-size:var(--fs-base);font-weight:900;text-decoration:none;white-space:nowrap">📡 SOOP 라이브</a>
      <input id="b2-live-search" type="text" placeholder="🔍 이름 검색" value="${(_b2LiveSearch||'').replace(/"/g,'&quot;')}"
        oninput="_b2LiveSearch=this.value;_b2LiveRefreshResultsOnly&&_b2LiveRefreshResultsOnly()"
        style="padding:8px 14px;border-radius:20px;border:1.5px solid var(--border2);font-size:var(--fs-base);font-weight:700;background:var(--white);color:var(--text2);width:150px">
    </div>
  `;

  if (_b2LiveViewMode === 'theater') {
    return filterBar + _b2LiveTheaterHTML();
  }
  return filterBar + `<div id="b2-live-results">${_b2LiveResultsHTML()}</div>`;
}

// (버그수정 2026-07-31) 검색창에 한글(IME)을 입력할 때, 매 글자마다 #b2-content
// 전체(툴바 + input 포함)를 innerHTML로 통째로 재생성하면 <input> DOM 노드 자체가
// 매번 새로 만들어져 브라우저의 조합(composition) 상태가 끊기고 "다나짱"이
// "ㄷㅏㄴㅏㅉㅏㅇ"처럼 자모 분리되어 나오는 문제가 있었다.
// → 검색 input은 그대로 두고, 결과 그리드(#b2-live-results)만 갱신하도록 분리.
//   (input 노드가 파괴되지 않으므로 composition/커서/포커스가 전혀 끊기지 않아
//    별도의 oncompositionstart/end 가드나 포커스 복원 로직도 필요 없어짐)
function _b2LiveResultsHTML() {
  const soopPlayers = (typeof players !== 'undefined' ? players : []).filter(p => {
    if (p.hidden || p.retired || p.hideFromBoard) return false;
    const _u = String(p?.univ || '').trim();
    if (_u === 'YB') return false;
    return !!_b2LiveSoopId(p.channelUrl);
  }).map(p => Object.assign({ _soopId: _b2LiveSoopId(p.channelUrl) }, p));

  const univFiltered = _b2LiveUnivFilter === '전체'
    ? soopPlayers
    : soopPlayers.filter(p => String(p?.univ || '').trim() === _b2LiveUnivFilter);

  const tierFiltered0 = _b2LiveTierFilter === '전체'
    ? univFiltered
    : univFiltered.filter(p => p.tier === _b2LiveTierFilter);

  const genderFiltered0 = _b2LiveGenderFilter === '전체'
    ? tierFiltered0
    : tierFiltered0.filter(p => p.gender === _b2LiveGenderFilter);

  const q = String(_b2LiveSearch || '').trim().toLowerCase();
  const searched = q
    ? genderFiltered0.filter(p => String(p.name || '').toLowerCase().includes(q))
    : genderFiltered0;

  const tierOrder = typeof TIERS !== 'undefined' ? TIERS : [];
  const univOrder = typeof univCfg !== 'undefined' ? univCfg.map(u => u.name) : [];
  const tierFiltered = searched.slice().sort((a, b) => {
    if (_b2LiveSortMode === 'name') {
      return String(a.name || '').localeCompare(String(b.name || ''), 'ko');
    }
    if (_b2LiveSortMode === 'univ') {
      const ia = univOrder.indexOf(a.univ); const ib = univOrder.indexOf(b.univ);
      const ra = ia >= 0 ? ia : 999; const rb = ib >= 0 ? ib : 999;
      if (ra !== rb) return ra - rb;
      return String(a.name || '').localeCompare(String(b.name || ''), 'ko');
    }
    // 기본: 티어순
    const idxA = tierOrder.indexOf(a.tier); const idxB = tierOrder.indexOf(b.tier);
    const rankA = idxA >= 0 ? idxA : 999; const rankB = idxB >= 0 ? idxB : 999;
    if (rankA !== rankB) return rankA - rankB;
    return String(a.name || '').localeCompare(String(b.name || ''), 'ko');
  });

  const liveFiltered = tierFiltered;

  const sizeCfgMap = {
    s: { min: 158, avatar: 30, pad: '0', nameFs: '12.5px', tagFs: '9px', univLogoFs: '18px', gap: 8, metaFs: '10px', titleFs: '11px' },
  };
  const sizeCfg = sizeCfgMap.s;
  const cardMinPx = sizeCfg.min;

  if (!soopPlayers.length) {
    return `
      <div style="padding:60px 20px;text-align:center;color:var(--gray-l)">
        <div style="font-size:48px;margin-bottom:12px">📺</div>
        <div style="font-weight:700">SOOP 방송국 주소가 등록된 스트리머가 없습니다</div>
        <div style="font-size:var(--fs-sm);margin-top:6px">스트리머 정보수정 → 🏠 방송국 홈 URL 에 SOOP(sooplive) 주소를 입력해주세요.</div>
      </div>`;
  }

  if (!tierFiltered.length) {
    return `
      <div style="padding:60px 20px;text-align:center;color:var(--gray-l)">
        <div style="font-size:40px;margin-bottom:10px">🔍</div>
        <div style="font-weight:700">해당 조건에 맞는 스트리머가 없습니다</div>
      </div>`;
  }

  // 티어순 정렬 + 전체 티어 보기일 때만 그룹 헤더 삽입(구별 표시)
  const showTierGroups = _b2LiveSortMode === 'tier' && _b2LiveTierFilter === '전체';
  const tierGroupCounts = {};
  if (showTierGroups) {
    liveFiltered.forEach(p => {
      const k = p.tier || '__none__';
      tierGroupCounts[k] = (tierGroupCounts[k] || 0) + 1;
    });
  }
  let _lastTierKey;
  const cards = liveFiltered.map(p => {
    const univColor = typeof gc === 'function' ? gc(p.univ) : '#6b7280';
    const tierBg = typeof getTierBtnColor === 'function' ? getTierBtnColor(p.tier) : '#64748b';
    const tierFg = typeof getTierBtnTextColor === 'function' ? (getTierBtnTextColor(p.tier) || '#fff') : '#fff';
    const safeName = (typeof escJS === 'function') ? escJS(p.name) : String(p.name || '').replace(/'/g, "\\'");
    const safeNameHtml = String(p.name || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    const photoUrl = p.photo ? ((typeof toHttpsUrl === 'function' ? toHttpsUrl(p.photo) : p.photo).replace(/"/g, '&quot;')) : '';
    const coverUrl = photoUrl;
    const titleHtml = '';
    const avatarHtml = photoUrl
      ? `<img src="${photoUrl}" alt="${safeNameHtml}" loading="lazy" decoding="async" style="width:100%;height:100%;object-fit:cover;object-position:center 18%;display:block" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
         <span style="display:none;width:100%;height:100%;align-items:center;justify-content:center;background:${univColor}18;color:${univColor};font-size:18px;font-weight:1000">${safeNameHtml.slice(0,1) || '?'}</span>`
      : `<span style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:${univColor}18;color:${univColor};font-size:18px;font-weight:1000">${safeNameHtml.slice(0,1) || '?'}</span>`;

    let groupHeader = '';
    if (showTierGroups) {
      const tk = p.tier || '__none__';
      if (tk !== _lastTierKey) {
        const isFirst = _lastTierKey === undefined;
        _lastTierKey = tk;
        const label = p.tier ? (typeof getTierLabel === 'function' ? getTierLabel(p.tier) : p.tier) : '미지정';
        groupHeader = `
          <div style="grid-column:1/-1;display:flex;align-items:center;gap:9px;margin:${isFirst ? '0' : '16px'} 0 4px">
            <span class="b2-live-group-badge" style="font-size:12.5px;padding:5px 13px;background:${tierBg};color:${tierFg};box-shadow:0 2px 6px rgba(0,0,0,.12)">${label}</span>
            <span style="font-size:var(--fs-base);color:var(--text3);font-weight:800">${tierGroupCounts[tk]}명</span>
            <div style="flex:1;height:1.5px;background:var(--border2)"></div>
          </div>`;
      }
    }

    const btnSize = sizeCfg.avatar <= 40 ? 24 : 26;
    const btnAccentStyle = p.univ ? `border-color:${univColor}55;color:${univColor};background:${univColor}14;` : '';
    const enlargeBtn = `<button type="button" class="b2-live-iconbtn" onclick="_b2LiveEnlarge('${p._soopId}','${safeName}')" title="확대보기" aria-label="${safeNameHtml} 확대보기"
            style="width:${btnSize}px;height:${btnSize}px;border-radius:8px;font-size:${sizeCfg.avatar <= 40 ? 11.5 : 12.5}px;line-height:1;padding:0;flex-shrink:0;box-shadow:0 2px 8px rgba(15,23,42,.06);${btnAccentStyle}">⛶</button>`;
    const linkBtn = `<a href="https://ch.sooplive.co.kr/${p._soopId}" target="_blank" rel="noopener" class="b2-live-iconbtn"
            style="width:${btnSize}px;height:${btnSize}px;border-radius:8px;font-size:${sizeCfg.avatar <= 40 ? 11.5 : 12.5}px;box-shadow:0 2px 8px rgba(15,23,42,.06);${btnAccentStyle}" title="SOOP 채널로 이동" aria-label="${safeNameHtml} SOOP 채널로 이동">🔗</a>`;

    // 아바타: 프로필 이미지 모양은 설정탭(⚙️ 프로필 이미지 모양)에서 지정한 대로 따르도록
    // 하드코딩된 원형(50%) 대신 --su_profile_radius / --su_profile_clip CSS 변수 사용
    const avatarBlock = `
      <div style="position:relative;flex-shrink:0" onmouseenter="_b2LiveShowInlinePreview(this,'${p._soopId}')" onmouseleave="_b2LiveHideInlinePreview(this,'${p._soopId}',event)">
        <button type="button" class="b2-live-avatar-btn" onclick="openPlayerModal&&openPlayerModal('${safeName}')" title="선수 상세"
          style="width:${sizeCfg.avatar}px;height:${sizeCfg.avatar}px;padding:0;border:2px solid rgba(255,255,255,.96);border-radius:var(--su_profile_radius,50%);clip-path:var(--su_profile_clip,none);overflow:hidden;background:var(--white);cursor:pointer;box-shadow:0 6px 16px rgba(15,23,42,.14)">
          ${avatarHtml}
        </button>
      </div>`;

    const nameHtml = `<span class="b2-live-name" style="font-weight:900;font-size:${sizeCfg.nameFs};cursor:pointer;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--text)" onclick="openPlayerModal&&openPlayerModal('${safeName}')">${p.name || ''}</span>`;
    // 대학명 텍스트 대신 대학 로고를 노출 (무소속은 태그 자체를 숨김)
    const univLogoSize = typeof getUnivLogoSizeStr === 'function' ? getUnivLogoSizeStr(p.univ, 'players', sizeCfg.univLogoFs) : sizeCfg.univLogoFs;
    const univTag = p.univ ? `<span class="b2-live-tag" title="${String(p.univ).replace(/"/g, '&quot;')}" style="display:inline-flex;align-items:center;font-size:${sizeCfg.tagFs};padding:0;background:transparent;color:${univColor};border:none;white-space:nowrap">${typeof gUI === 'function' ? gUI(p.univ, univLogoSize) : ''}</span>` : '';
    const cardBg = p.univ ? `${univColor}18` : 'var(--white)';
    const titleLine = titleHtml || '';

    const cardBody = `
      <div style="display:flex;flex-direction:column">
        <div style="position:relative;width:100%;aspect-ratio:16/13;background:${univColor}12;overflow:hidden" onmouseenter="_b2LiveShowInlinePreview(this,'${p._soopId}')" onmouseleave="_b2LiveHideInlinePreview(this,'${p._soopId}',event)">
          <div class="b2-live-cover-wrap" style="position:absolute;inset:0;transition:opacity .15s ease">
            <img class="b2-live-cover" src="${coverUrl}" alt="${safeNameHtml}" loading="lazy" decoding="async"
              style="width:100%;height:100%;object-fit:cover;object-position:center 18%;display:${coverUrl ? 'block' : 'none'};cursor:pointer"
              onclick="_b2LiveClickCover(this,'${p._soopId}')"
              onerror="this.style.display='none';const fb=this.parentNode.querySelector('.b2-live-cover-fallback');if(fb) fb.style.display='flex'">
            <div class="b2-live-cover-fallback" style="display:${coverUrl ? 'none' : 'flex'};position:absolute;inset:0;align-items:center;justify-content:center;background:${univColor}18;color:${univColor};font-size:26px;font-weight:1000;cursor:pointer" onclick="openPlayerModal&&openPlayerModal('${safeName}')">${safeNameHtml.slice(0,1) || '?'}</div>
            <div style="position:absolute;inset:0;background:linear-gradient(to top,rgba(15,23,42,.30),rgba(15,23,42,.08) 48%,rgba(15,23,42,0));pointer-events:none"></div>
          </div>
          <div class="b2-live-inline-box" style="display:none;position:absolute;inset:0;background:#000">
            <iframe class="b2-live-inline-frame" src="" allow="autoplay; fullscreen; picture-in-picture" referrerpolicy="no-referrer"
              style="width:100%;height:100%;border:0;background:#000;display:block"></iframe>
          </div>
        </div>
        <div style="padding:2px 8px 6px;display:flex;flex-direction:column">
          <div style="display:flex;align-items:center;gap:8px;margin-top:-3px;min-height:${sizeCfg.avatar + 6}px">
            ${avatarBlock}
            <div style="display:flex;flex-direction:column;gap:2px;min-width:0;flex:1;padding-top:4px">
              <div style="display:flex;align-items:center;gap:5px;min-width:0">
                <div style="min-width:0;flex:1">${nameHtml}</div>
                ${univTag}
              </div>
              <div class="b2-live-title" style="font-size:${sizeCfg.titleFs};font-weight:600;line-height:1.25;color:var(--text3);display:${titleLine ? '-webkit-box' : 'none'};-webkit-line-clamp:1;-webkit-box-orient:vertical;overflow:hidden;word-break:break-word">${titleLine}</div>
            </div>
            <div style="display:flex;flex-direction:column;gap:5px;flex-shrink:0;padding-top:2px">${enlargeBtn}${linkBtn}</div>
          </div>
        </div>
      </div>`;

    return groupHeader + `
      <div class="b2-live-card" data-soop-id="${p._soopId}" data-photo-url="${photoUrl}" style="position:relative;background:${cardBg};border:1.5px solid var(--border2);border-radius:16px;overflow:hidden;padding:${sizeCfg.pad}">
        ${cardBody}
      </div>
    `;
  }).join('');

  return `
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(${cardMinPx}px,1fr));gap:${sizeCfg.gap}px">
      ${cards}
    </div>
  `;
}

// 검색어 변경 시: #b2-content 전체가 아니라 #b2-live-results(카드 그리드)만 갱신.
// 검색 input 자신은 DOM에서 전혀 교체되지 않으므로 IME 조합/커서/포커스가 유지된다.
function _b2LiveRefreshResultsOnly() {
  try {
    if (_b2LiveViewMode === 'theater') {
      const body = document.getElementById('b2-live-theater-list-body');
      if (body) body.innerHTML = _b2LiveTheaterListBodyHTML();
      return;
    }
    const box = document.getElementById('b2-live-results');
    if (!box) return; // 다른 탭으로 이미 이동한 경우
    box.innerHTML = _b2LiveResultsHTML();
    injectUnivIcons && injectUnivIcons(box);
  } catch (e) {}
}

/* ══════════════════════════════════════════════════════════════
   🎬 시청형 모드 — 프로필탭(b2-players-wrapper)과 동일하게
   왼쪽 큰 화면 + 오른쪽 대학별 목록 구조. 목록 클릭 시 왼쪽 화면만
   교체(전체 재렌더 없음)해서 목록 스크롤 위치가 유지된다.
   ══════════════════════════════════════════════════════════════ */

// 카드형과 동일한 필터(대학/티어/성별/검색)만 적용, 정렬은 대학별 그룹핑 고정이라 미사용
function _b2LiveTheaterFilteredList() {
  const soopPlayers = (typeof players !== 'undefined' ? players : []).filter(p => {
    if (p.hidden || p.retired || p.hideFromBoard) return false;
    const _u = String(p?.univ || '').trim();
    if (_u === 'YB') return false;
    return !!_b2LiveSoopId(p.channelUrl);
  }).map(p => Object.assign({ _soopId: _b2LiveSoopId(p.channelUrl) }, p));

  const univFiltered = _b2LiveUnivFilter === '전체'
    ? soopPlayers
    : soopPlayers.filter(p => String(p?.univ || '').trim() === _b2LiveUnivFilter);
  const tierFiltered = _b2LiveTierFilter === '전체'
    ? univFiltered
    : univFiltered.filter(p => p.tier === _b2LiveTierFilter);
  const genderFiltered = _b2LiveGenderFilter === '전체'
    ? tierFiltered
    : tierFiltered.filter(p => p.gender === _b2LiveGenderFilter);

  const q = String(_b2LiveSearch || '').trim().toLowerCase();
  return q ? genderFiltered.filter(p => String(p.name || '').toLowerCase().includes(q)) : genderFiltered;
}

function _b2LiveTheaterHTML() {
  const list = _b2LiveTheaterFilteredList();

  if (!list.length) {
    return `
      <div style="padding:60px 20px;text-align:center;color:var(--gray-l)">
        <div style="font-size:40px;margin-bottom:10px">🔍</div>
        <div style="font-weight:700">해당 조건에 맞는 스트리머가 없습니다</div>
      </div>`;
  }

  // 이전 선택이 현재 필터 결과에 없으면 선택 해제(안내 문구로 복귀)
  if (_b2LiveTheaterSelected && !list.some(p => p._soopId === _b2LiveTheaterSelected.id)) {
    _b2LiveTheaterSelected = null;
  }

  return `
    <style>
      .b2-live-theater-wrapper{ display:flex; gap:18px; align-items:flex-start; min-height:480px; }
      .b2-live-theater-main{ flex:1 1 auto; min-width:0; position:relative; border-radius:20px; overflow:hidden; background:#0f172a; display:flex; flex-direction:column; }
      .b2-live-theater-video{ width:100%; aspect-ratio:16/9; background:#000; }
      .b2-live-theater-list{ flex:0 0 118px; width:118px; min-width:0; overflow-y:auto; overscroll-behavior:contain; -webkit-overflow-scrolling:touch; padding-right:4px; height:calc(100vh - 230px); cursor:grab; touch-action:pan-y; user-select:none; }
      .b2-live-theater-item:hover{ background:var(--surface); }
      .b2-live-theater-univbtn:hover{ background:var(--surface); }
      @media (max-width:1024px){
        .b2-live-theater-wrapper{ flex-direction:column; }
        .b2-live-theater-main{ flex:none; width:100%; }
        .b2-live-theater-list{ flex:none; width:100%; height:auto; max-height:420px; }
      }
    </style>
    <div class="b2-live-theater-wrapper">
      <div class="b2-live-theater-main" id="b2-live-theater-main">${_b2LiveTheaterMainHTML()}</div>
      <div class="b2-live-theater-list" id="b2-live-theater-list">
        <div id="b2-live-theater-list-body">${_b2LiveTheaterListBodyHTML()}</div>
      </div>
    </div>`;
}

// 대학별 그룹핑 (univCfg 등록 순서, 무소속은 맨 뒤)
function _b2LiveTheaterGroups() {
  const list = _b2LiveTheaterFilteredList();
  const univOrder = typeof univCfg !== 'undefined' ? univCfg.map(u => u.name) : [];
  const groups = {};
  list.forEach(p => {
    const u = String(p.univ || '').trim() || '무소속';
    (groups[u] = groups[u] || []).push(p);
  });
  const groupNames = Object.keys(groups).sort((a, b) => {
    if (a === '무소속') return 1;
    if (b === '무소속') return -1;
    const ia = univOrder.indexOf(a), ib = univOrder.indexOf(b);
    return (ia >= 0 ? ia : 999) - (ib >= 0 ? ib : 999);
  });
  groupNames.forEach(u => groups[u].sort((a, b) =>
    (typeof getRoleOrder === 'function' ? getRoleOrder(a.role, a) - getRoleOrder(b.role, b) : 0)
    || (typeof TIERS !== 'undefined' ? TIERS.indexOf(a.tier) - TIERS.indexOf(b.tier) : 0)
    || ((b.points || 0) - (a.points || 0))
    || String(a.name || '').localeCompare(String(b.name || ''), 'ko')
  ));
  return { groups, groupNames };
}

function _b2LiveTheaterItemHtml(p, univLabel) {
  const safeName = (typeof escJS === 'function') ? escJS(p.name) : String(p.name || '').replace(/'/g, "\\'");
  const safeUniv = String(univLabel || '').replace(/'/g, "\\'");
  const safeNameHtml = String(p.name || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const photoUrl = p.photo ? ((typeof toHttpsUrl === 'function' ? toHttpsUrl(p.photo) : p.photo).replace(/"/g, '&quot;')) : '';
  const active = !!(_b2LiveTheaterSelected && _b2LiveTheaterSelected.id === p._soopId);
  const univColor = typeof gc === 'function' ? gc(univLabel === '무소속' ? '' : univLabel) : '#6b7280';
  const avatarHtml = photoUrl
    ? `<img src="${photoUrl}" alt="${safeNameHtml}" loading="lazy" decoding="async" style="width:100%;height:100%;object-fit:cover;object-position:center 18%;display:block" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"><span style="display:none;width:100%;height:100%;align-items:center;justify-content:center;background:${univColor}18;color:${univColor};font-size:14px;font-weight:1000">${safeNameHtml.slice(0, 1) || '?'}</span>`
    : `<span style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:${univColor}18;color:${univColor};font-size:14px;font-weight:1000">${safeNameHtml.slice(0, 1) || '?'}</span>`;
  // 정렬 기준(직급→티어)을 목록에서도 바로 알아볼 수 있게 직급 아이콘 + 티어 색상 점 표시
  const roleIcon = (p.role && typeof _roleMatchedMain === 'function' && _roleMatchedMain(p.role) && typeof ROLE_ICONS !== 'undefined')
    ? (ROLE_ICONS[_roleMatchedMain(p.role)] || '') : '';
  const tierColor = typeof getTierBtnColor === 'function' ? getTierBtnColor(p.tier) : '#94a3b8';
  const tierDot = `<span title="${p.tier ? (typeof getTierLabel === 'function' ? getTierLabel(p.tier) : p.tier) : ''}" style="width:7px;height:7px;border-radius:50%;background:${tierColor};flex-shrink:0;box-shadow:0 0 0 1.5px var(--white)"></span>`;
  return `
    <button type="button" class="b2-live-theater-item${active ? ' active' : ''}" data-soop-id="${p._soopId}"
      onclick="_b2LiveTheaterSelect('${p._soopId}','${safeName}','${safeUniv}')"
      style="display:flex;align-items:center;gap:9px;width:100%;text-align:left;padding:6px 8px;border-radius:12px;border:1.5px solid ${active ? 'var(--blue)' : 'transparent'};background:${active ? 'var(--surface)' : 'transparent'};cursor:pointer">
      <span style="position:relative;width:34px;height:34px;flex-shrink:0">
        <span style="display:block;width:100%;height:100%;border-radius:var(--su_profile_radius,50%);clip-path:var(--su_profile_clip,none);overflow:hidden;border:1.5px solid rgba(255,255,255,.9);box-shadow:0 2px 6px rgba(15,23,42,.12)">${avatarHtml}</span>
        <span style="position:absolute;right:-2px;bottom:-2px">${tierDot}</span>
      </span>
      <span style="min-width:0;flex:1;display:flex;align-items:center;gap:3px">
        ${roleIcon ? `<span style="font-size:10px;flex-shrink:0" title="${String(p.role || '').replace(/"/g, '&quot;')}">${roleIcon}</span>` : ''}
        <span style="min-width:0;font-weight:800;font-size:var(--fs-base);color:var(--text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${p.name || ''}</span>
      </span>
    </button>`;
}

// 목록 영역 내용: 처음엔 대학 버튼 목록만 보여주고, 대학을 누르면 그 대학 스트리머만 +
// "◀ 처음으로" 버튼으로 전환(리스트 세로 길이가 화면 아래로 무한정 안 늘어나게)
function _b2LiveTheaterListBodyHTML() {
  const { groups, groupNames } = _b2LiveTheaterGroups();

  if (!groupNames.length) {
    return `<div style="padding:30px 8px;text-align:center;color:var(--gray-l);font-size:11px;font-weight:700">조건에 맞는<br>스트리머가 없습니다</div>`;
  }

  // 선택된 대학이 현재 필터 결과에 없으면 처음 화면으로
  if (_b2LiveTheaterUnivSel && !groupNames.includes(_b2LiveTheaterUnivSel)) {
    _b2LiveTheaterUnivSel = null;
  }

  if (!_b2LiveTheaterUnivSel) {
    return groupNames.map(u => {
      const safeU = String(u).replace(/'/g, "\\'");
      return `
        <button type="button" class="b2-live-theater-univbtn" onclick="_b2LiveTheaterSelectUniv('${safeU}')"
          style="display:flex;align-items:center;gap:6px;width:100%;text-align:left;padding:8px 6px;border-radius:12px;border:1.5px solid var(--border2);background:var(--white);cursor:pointer;margin-bottom:4px">
          ${typeof gUI === 'function' ? gUI(u === '무소속' ? '' : u, '16px') : ''}
          <span style="min-width:0;flex:1;font-weight:900;font-size:11px;color:var(--text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${u}</span>
          <span style="font-size:10px;color:var(--text3);font-weight:700;flex-shrink:0">${groups[u].length}</span>
        </button>`;
    }).join('');
  }

  const items = (groups[_b2LiveTheaterUnivSel] || []).map(p => _b2LiveTheaterItemHtml(p, _b2LiveTheaterUnivSel)).join('');
  return `
    <button type="button" onclick="_b2LiveTheaterSelectUniv(null)"
      style="display:flex;align-items:center;gap:4px;width:100%;text-align:left;padding:6px 4px;border-radius:10px;border:none;background:transparent;color:var(--blue);font-weight:900;font-size:11.5px;cursor:pointer;margin-bottom:6px">
      ◀ 처음으로
    </button>
    <div style="display:flex;align-items:center;gap:6px;padding:2px 4px 8px">
      ${typeof gUI === 'function' ? gUI(_b2LiveTheaterUnivSel === '무소속' ? '' : _b2LiveTheaterUnivSel, '15px') : ''}
      <span style="font-weight:900;font-size:11.5px;color:var(--text2);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${_b2LiveTheaterUnivSel}</span>
    </div>
    <div style="display:flex;flex-direction:column;gap:2px">${items}</div>`;
}

// 대학 버튼 클릭(드릴다운) / "처음으로"(u=null) — 목록 영역만 교체, 큰 화면은 그대로 유지
function _b2LiveTheaterSelectUniv(u) {
  try {
    _b2LiveTheaterUnivSel = u || null;
    const body = document.getElementById('b2-live-theater-list-body');
    if (body) body.innerHTML = _b2LiveTheaterListBodyHTML();
    const listBox = document.getElementById('b2-live-theater-list');
    const active = listBox && listBox.querySelector('.b2-live-theater-item.active');
    if (listBox) { if (active) active.scrollIntoView({ block: 'nearest' }); else listBox.scrollTop = 0; }
  } catch (e) {}
}

function _b2LiveTheaterMainHTML() {
  const sel = _b2LiveTheaterSelected;
  if (!sel) {
    return `
      <div class="b2-live-theater-video" style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;color:rgba(255,255,255,.7)">
        <div style="font-size:44px">📺</div>
        <div style="font-weight:800;font-size:var(--fs-base)">왼쪽에서 스트리머를 선택하면 방송이 나옵니다</div>
      </div>`;
  }
  const safeNameHtml = String(sel.name || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const univColor = (sel.univ && sel.univ !== '무소속' && typeof gc === 'function') ? gc(sel.univ) : '#1e293b';
  return `
    <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px 14px;background:linear-gradient(100deg,${univColor} -10%,#0f172a 90%);color:#fff;flex-shrink:0">
      <div style="display:flex;align-items:center;gap:8px;min-width:0">
        ${typeof gUI === 'function' ? gUI(sel.univ === '무소속' ? '' : sel.univ, '16px') : ''}
        <span style="font-weight:900;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-shadow:0 1px 3px rgba(0,0,0,.35)">${safeNameHtml}</span>
      </div>
      <a href="https://ch.sooplive.co.kr/${sel.id}" target="_blank" rel="noopener" style="color:#93c5fd;font-weight:800;font-size:var(--fs-sm);text-decoration:none;white-space:nowrap;flex-shrink:0">🔗 채널로 이동</a>
    </div>
    <div class="b2-live-theater-video">
      <iframe src="${_b2LiveEmbedUrl(sel.id, true)}" allow="autoplay; fullscreen; picture-in-picture" referrerpolicy="no-referrer" style="width:100%;height:100%;border:0;background:#000;display:block"></iframe>
    </div>`;
}

// 목록 클릭 시 왼쪽 큰 화면만 교체(전체 재렌더 없음 — 목록 스크롤 유지)
function _b2LiveTheaterSelect(id, name, univ) {
  try {
    if (!id) return;
    _b2LiveTheaterSelected = { id, name, univ };
    const main = document.getElementById('b2-live-theater-main');
    if (main) main.innerHTML = _b2LiveTheaterMainHTML();
    document.querySelectorAll('.b2-live-theater-item').forEach(btn => {
      const on = btn.getAttribute('data-soop-id') === id;
      btn.classList.toggle('active', on);
      btn.style.borderColor = on ? 'var(--blue)' : 'transparent';
      btn.style.background = on ? 'var(--surface)' : 'transparent';
    });
    // 방송 선택 시 상단 안내문구(고정 높이)가 헤더바로 바뀌며 main 높이가 달라지므로 재동기화
    if (typeof _b2LiveTheaterSyncListHeight === 'function') setTimeout(_b2LiveTheaterSyncListHeight, 0);
  } catch (e) {}
}
