/* ══════════════════════════════════════════════════════════════
   현황판 — 📺 라이브 뷰 (SOOP 채널 등록 스트리머 방송화면 모아보기)
   - p.channelUrl 이 SOOP(sooplive) 주소인 스트리머만 추출
   - 대학별 / 티어별 필터 + 이름검색 + 정렬 + 카드크기 조절
   - IntersectionObserver로 화면에 보이는 카드만 iframe 로드(성능)
   - 카드 확대보기 모달 지원
   - 라이브 상태 자동감지:
     서버(/api/soop-live-status)가 SOOP player_live_api.php를 대신 호출해
     방송중 여부를 조회(CORS 우회). 주기적으로 폴링해 카드 테두리 강조(is-live)와
     정렬만 갱신하며, 이미 로드된 iframe은 다시 만들지 않음(방송 새로고침 방지).
     (LIVE 텍스트 뱃지는 v27에서 제거됨)
   ══════════════════════════════════════════════════════════════ */

var _b2LiveUnivFilter = '전체';
var _b2LiveTierFilter = '전체';
var _b2LiveGenderFilter = (()=>{ try{ const g = localStorage.getItem('su_b2_live_gender'); return ['전체','F','M'].includes(g) ? g : '전체'; }catch(e){ return '전체'; } })();
var _b2LiveSearch = '';
var _b2LiveSortMode = (()=>{ try{ return localStorage.getItem('su_b2_live_sort') || 'tier'; }catch(e){ return 'tier'; } })(); // 'tier' | 'name' | 'univ'
var _b2LiveCardSize = 's';
var _b2LiveObserver = null;

// ── 라이브 상태(뱃지) ──
var _b2LiveStatusCache = {};        // soopId -> { live, title, viewerCnt, ts }
var _b2LivePollTimer = null;        // setInterval 핸들
var _b2LivePollInFlight = false;    // 중복 폴링 방지
var _b2LivePollIntervalMs = 45000;  // 자동 새로고침 주기
var _b2LiveHoverOpenTimer = null;
var _b2LiveHoverCloseTimer = null;
var _b2LiveHoverOpenId = '';
var _b2LiveHoverOpenName = '';
var _b2LiveInlineHideTimers = {};

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
}

function _b2LiveSetGender(g) {
  _b2LiveGenderFilter = ['전체','F','M'].includes(g) ? g : '전체';
  try{ localStorage.setItem('su_b2_live_gender', _b2LiveGenderFilter); }catch(e){}
  const el = document.getElementById('b2-content');
  if (el) { el.innerHTML = _b2LiveView(); if (typeof injectUnivIcons === 'function') injectUnivIcons(el); }
}

function _b2LiveSetCardSize(size) {
  _b2LiveCardSize = 's';
  try{ localStorage.setItem('su_b2_live_card_size', _b2LiveCardSize); }catch(e){}
  const el = document.getElementById('b2-content');
  if (el) { el.innerHTML = _b2LiveView(); if (typeof injectUnivIcons === 'function') injectUnivIcons(el); }
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

// 서버 프록시(/api/soop-live-status)로 방송상태 일괄 조회
async function _b2LiveFetchStatus(ids) {
  if (!ids || !ids.length) return {};
  try {
    const res = await fetch('/api/soop-live-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids }),
    });
    if (!res.ok) return {};
    const data = await res.json().catch(() => null);
    return (data && data.results) || {};
  } catch (e) {
    return {};
  }
}

// 캐시된 상태를 이미 렌더된 카드 DOM에 반영 (뱃지 표시)
// ※ innerHTML을 다시 쓰지 않음 — iframe이 재로드되어 방송이 끊기는 것 방지
function _b2LiveApplyStatusToDom(container) {
  if (!container) return;
  const cards = container.querySelectorAll('.b2-live-card[data-soop-id]');
  cards.forEach(card => {
    const id = card.getAttribute('data-soop-id');
    const st = _b2LiveStatusCache[id];
    const coverImg = card.querySelector('.b2-live-cover');
    const coverFallback = card.querySelector('.b2-live-cover-fallback');
    const titleEl = card.querySelector('.b2-live-title');
    const photoUrl = card.getAttribute('data-photo-url') || '';
    const thumbUrl = st && st.thumb ? st.thumb : '';
    const coverUrl = thumbUrl || photoUrl;
    if (coverImg) {
      if (coverUrl) {
        if (coverImg.getAttribute('src') !== coverUrl) coverImg.setAttribute('src', coverUrl);
        coverImg.style.display = 'block';
        if (coverFallback) coverFallback.style.display = 'none';
      } else {
        coverImg.removeAttribute('src');
        coverImg.style.display = 'none';
        if (coverFallback) coverFallback.style.display = 'flex';
      }
    }
    if (titleEl) {
      const title = String((st && st.title) || '').trim();
      titleEl.textContent = title || '';
      titleEl.style.display = title ? '-webkit-box' : 'none';
    }
  });
}

// 현재 렌더된 카드들의 상태를 조회하고 DOM에 반영
async function _b2LivePoll() {
  if (_b2LivePollInFlight) return;
  const container = document.getElementById('b2-content');
  const cards = container ? container.querySelectorAll('.b2-live-card[data-soop-id]') : null;
  if (!container || !cards || !cards.length) { _b2LiveStopPoll(); return; }
  const ids = Array.from(cards).map(c => c.getAttribute('data-soop-id')).filter(Boolean);
  _b2LivePollInFlight = true;
  try {
    const results = await _b2LiveFetchStatus(ids);
    const now = Date.now();
    let changed = false;
    Object.keys(results).forEach(id => {
      const prevLive = !!(_b2LiveStatusCache[id] && _b2LiveStatusCache[id].live);
      const nextLive = !!(results[id] && results[id].live);
      if (prevLive !== nextLive) changed = true;
      const prev = _b2LiveStatusCache[id] || {};
      _b2LiveStatusCache[id] = Object.assign({}, prev, results[id], { ts: now });
    });
    // 폴링 도중 다른 탭으로 이동했을 수 있으니 재확인 후 반영
    const stillLive = document.getElementById('b2-content');
    if (stillLive && stillLive.querySelector('.b2-live-card[data-soop-id]')) {
      if (changed && _b2LiveSortMode === 'tier' && typeof _b2LiveRefreshResultsOnly === 'function') {
        // 라이브 여부가 바뀐 사람이 있으면 그리드를 다시 그려 라이브 우선 정렬을 반영
        // (그리드에는 iframe이 없어 재생 중단 없이 안전하게 재생성 가능)
        _b2LiveRefreshResultsOnly();
      } else {
        _b2LiveApplyStatusToDom(stillLive);
      }
    }
  } finally {
    _b2LivePollInFlight = false;
  }
}

function _b2LiveStartPoll() {
  _b2LiveStopPoll();
  _b2LivePoll();
  _b2LivePollTimer = setInterval(_b2LivePoll, _b2LivePollIntervalMs);
}

function _b2LiveStopPoll() {
  if (_b2LivePollTimer) { clearInterval(_b2LivePollTimer); _b2LivePollTimer = null; }
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

  const genderBtn = (v, label) => `<button type="button" class="b2-toolbar-btn" onclick="_b2LiveSetGender('${v}')" title="${label}" aria-pressed="${_b2LiveGenderFilter===v}"
    style="padding:8px 14px;border-radius:20px;border:1.5px solid ${_b2LiveGenderFilter===v?'#2563eb':'var(--border2)'};background:${_b2LiveGenderFilter===v?'linear-gradient(135deg,#eff6ff,#dbeafe)':'var(--white)'};color:${_b2LiveGenderFilter===v?'#1d4ed8':'var(--text2)'};font-size:var(--fs-base);font-weight:${_b2LiveGenderFilter===v?900:700};cursor:pointer;margin-bottom:0;white-space:nowrap">${label}</button>`;

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
      <div style="position:relative">
        <select id="b2-live-univ-sel" class="b2-toolbar-select"
          onchange="_b2LiveUnivFilter=this.value;document.getElementById('b2-content').innerHTML=_b2LiveView();injectUnivIcons&&injectUnivIcons(document.getElementById('b2-content'))"
          style="padding:8px 30px 8px 13px;border-radius:20px;border:1.5px solid var(--border2);font-size:var(--fs-base);font-weight:700;background:var(--white);color:var(--text2);appearance:none;cursor:pointer">
          <option value="전체"${_b2LiveUnivFilter === '전체' ? ' selected' : ''}>🏫 전체 대학</option>
          ${univList.map(u => `<option value="${u}"${_b2LiveUnivFilter === u ? ' selected' : ''}>${u}</option>`).join('')}
        </select>
      </div>
      <div style="position:relative">
        <select id="b2-live-tier-sel" class="b2-toolbar-select"
          onchange="_b2LiveTierFilter=this.value;document.getElementById('b2-content').innerHTML=_b2LiveView();injectUnivIcons&&injectUnivIcons(document.getElementById('b2-content'))"
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
      <input id="b2-live-search" type="text" placeholder="🔍 이름 검색" value="${(_b2LiveSearch||'').replace(/"/g,'&quot;')}"
        oninput="_b2LiveSearch=this.value;_b2LiveRefreshResultsOnly&&_b2LiveRefreshResultsOnly()"
        style="padding:8px 14px;border-radius:20px;border:1.5px solid var(--border2);font-size:var(--fs-base);font-weight:700;background:var(--white);color:var(--text2);width:150px">
    </div>
  `;

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
  // (참고사이트 방식) 같은 그룹(티어/대학) 안에서는 방송 중인 스트리머를 먼저 보여준다
  const _isLiveP = (p) => { const st = _b2LiveStatusCache[p._soopId]; return !!(st && st.live) ? 0 : 1; };
  const tierFiltered = searched.slice().sort((a, b) => {
    if (_b2LiveSortMode === 'name') {
      const la = _isLiveP(a), lb = _isLiveP(b);
      if (la !== lb) return la - lb;
      return String(a.name || '').localeCompare(String(b.name || ''), 'ko');
    }
    if (_b2LiveSortMode === 'univ') {
      const ia = univOrder.indexOf(a.univ); const ib = univOrder.indexOf(b.univ);
      const ra = ia >= 0 ? ia : 999; const rb = ib >= 0 ? ib : 999;
      if (ra !== rb) return ra - rb;
      const la = _isLiveP(a), lb = _isLiveP(b);
      if (la !== lb) return la - lb;
      return String(a.name || '').localeCompare(String(b.name || ''), 'ko');
    }
    // 기본: 티어순 (같은 티어 안에서는 라이브 우선)
    const idxA = tierOrder.indexOf(a.tier); const idxB = tierOrder.indexOf(b.tier);
    const rankA = idxA >= 0 ? idxA : 999; const rankB = idxB >= 0 ? idxB : 999;
    if (rankA !== rankB) return rankA - rankB;
    const la = _isLiveP(a), lb = _isLiveP(b);
    if (la !== lb) return la - lb;
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
    const safeName = String(p.name || '').replace(/'/g, "\\'");
    const safeNameHtml = String(p.name || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    const stKnown = _b2LiveStatusCache[p._soopId];
    const photoUrl = p.photo ? ((typeof toHttpsUrl === 'function' ? toHttpsUrl(p.photo) : p.photo).replace(/"/g, '&quot;')) : '';
    const thumbUrl = stKnown && stKnown.thumb ? String(stKnown.thumb).replace(/"/g, '&quot;') : '';
    const coverUrl = thumbUrl || photoUrl;
    const titleText = String((stKnown && stKnown.title) || '').trim();
    const titleHtml = titleText.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
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

  setTimeout(() => {
    try{
      const el = document.getElementById('b2-content');
      // (요청사항) 라이브 탭 진입 시 방송이 자동으로 로드되지 않도록 iframe 미사용
      _b2LiveApplyStatusToDom(el); // 기존 캐시로 즉시 뱃지/숨김 반영(깜빡임 방지)
      _b2LiveStartPoll();          // 최신 상태 폴링 시작(다른 탭 이동 시 자동 중단)
    }catch(e){}
  }, 0);

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
    const box = document.getElementById('b2-live-results');
    if (!box) return; // 다른 탭으로 이미 이동한 경우
    box.innerHTML = _b2LiveResultsHTML();
    injectUnivIcons && injectUnivIcons(box);
  } catch (e) {}
}
