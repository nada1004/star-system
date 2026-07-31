/* ══════════════════════════════════════════════════════════════
   현황판 — 📺 라이브 뷰 (SOOP 채널 등록 스트리머 방송화면 모아보기)
   - p.channelUrl 이 SOOP(sooplive) 주소인 스트리머만 추출
   - 대학별 / 티어별 필터 + 이름검색 + 정렬 + 카드크기 조절
   - IntersectionObserver로 화면에 보이는 카드만 iframe 로드(성능)
   - 카드 확대보기 모달 지원
   - 🔴 라이브 뱃지 자동감지 + 오프라인 카드 숨기기:
     서버(/api/soop-live-status)가 SOOP player_live_api.php를 대신 호출해
     방송중 여부를 조회(CORS 우회). 주기적으로 폴링해 뱃지·숨김 상태만
     갱신하며, 이미 로드된 iframe은 다시 만들지 않음(방송 새로고침 방지).
     비공식 API라 응답이 실패하면 "확인 불가" 상태로 두고 절대 임의로
     오프라인 처리하지 않음(오탐으로 카드가 부당하게 숨겨지는 것 방지).
   ══════════════════════════════════════════════════════════════ */

var _b2LiveUnivFilter = '전체';
var _b2LiveTierFilter = '전체';
var _b2LiveSearch = '';
var _b2LiveSortMode = (()=>{ try{ return localStorage.getItem('su_b2_live_sort') || 'tier'; }catch(e){ return 'tier'; } })(); // 'tier' | 'name' | 'univ'
var _b2LiveCardSize = (()=>{ try{ const s = localStorage.getItem('su_b2_live_card_size'); return ['s','m','l'].includes(s) ? s : 'm'; }catch(e){ return 'm'; } })();
var _b2LiveObserver = null;

// ── 라이브 상태(뱃지 / 오프라인 숨기기) ──
var _b2LiveHideOffline = (()=>{ try{ return localStorage.getItem('su_b2_live_hide_offline') === '1'; }catch(e){ return false; } })();
var _b2LiveStatusCache = {};        // soopId -> { live, title, viewerCnt, ts }
var _b2LivePollTimer = null;        // setInterval 핸들
var _b2LivePollInFlight = false;    // 중복 폴링 방지
var _b2LivePollIntervalMs = 45000;  // 자동 새로고침 주기

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

function _b2LiveEmbedUrl(id) {
  // 기본 볼륨 0 — SOOP 임베드 공식 mute 파라미터 문서가 없어 확인된 값(mute=y) 사용.
  // 100% 보장은 어려우니 실제 화면에서 확인 필요.
  return id ? `https://play.sooplive.co.kr/${id}/embed?mute=y&showChat=false` : '';
}

function _b2LiveSetSort(mode) {
  _b2LiveSortMode = ['tier','name','univ'].includes(mode) ? mode : 'tier';
  try{ localStorage.setItem('su_b2_live_sort', _b2LiveSortMode); }catch(e){}
  const el = document.getElementById('b2-content');
  if (el) { el.innerHTML = _b2LiveView(); if (typeof injectUnivIcons === 'function') injectUnivIcons(el); }
}

function _b2LiveSetCardSize(size) {
  _b2LiveCardSize = ['s','m','l'].includes(size) ? size : 'm';
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
    ov.innerHTML = `
      <div class="su-modal" style="width:min(900px, calc(100vw - 28px));height:min(560px, calc(100vh - 28px));">
        <div class="su-modal-hd">
          <div style="font-weight:1000">📺 ${name || ''}</div>
          <button type="button" class="btn btn-r btn-sm" onclick="document.getElementById('b2LiveEnlargeOverlay').style.display='none';document.getElementById('b2LiveEnlargeOverlay').innerHTML=''">닫기</button>
        </div>
        <div class="su-modal-bd" style="padding:0;overflow:hidden">
          <iframe src="${_b2LiveEmbedUrl(id)}" allow="autoplay; fullscreen; picture-in-picture" referrerpolicy="no-referrer"
            style="width:100%;height:100%;border:0;background:#000"></iframe>
        </div>
      </div>
    `;
    ov.onclick = (e) => { if (e.target === ov) { ov.style.display = 'none'; ov.innerHTML = ''; } };
  } catch (e) {}
}

// 프로필 우상단 LIVE 배지 클릭용 미리보기 모달
function _b2LivePreview(id, name) {
  try {
    if (!id) return;
    let ov = document.getElementById('b2LivePreviewOverlay');
    if (!ov) {
      ov = document.createElement('div');
      ov.id = 'b2LivePreviewOverlay';
      ov.className = 'su-modal-overlay';
      document.body.appendChild(ov);
    }
    ov.style.display = 'flex';
    ov.innerHTML = `
      <div class="su-modal" style="width:min(540px, calc(100vw - 28px));height:auto;max-height:min(430px, calc(100vh - 28px));overflow:hidden">
        <div class="su-modal-hd">
          <div style="font-weight:1000;min-width:0;display:flex;align-items:center;gap:8px">
            <span style="display:inline-flex;align-items:center;gap:5px;background:#dc2626;color:#fff;padding:3px 9px;border-radius:999px;font-size:11px;font-weight:900;line-height:1">
              <span style="width:6px;height:6px;border-radius:50%;background:#fff;animation:b2LivePulse 1.4s infinite"></span>LIVE
            </span>
            <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${name || ''}</span>
          </div>
          <div style="display:flex;align-items:center;gap:6px">
            <a href="https://ch.sooplive.co.kr/${id}" target="_blank" rel="noopener" class="btn btn-b btn-sm" style="text-decoration:none">SOOP 열기</a>
            <button type="button" class="btn btn-g btn-sm" onclick="_b2LiveEnlarge('${id}','${String(name || '').replace(/'/g, "\\'")}')">확대</button>
            <button type="button" class="btn btn-r btn-sm" onclick="document.getElementById('b2LivePreviewOverlay').style.display='none';document.getElementById('b2LivePreviewOverlay').innerHTML=''">닫기</button>
          </div>
        </div>
        <div class="su-modal-bd" style="padding:0;overflow:hidden">
          <div style="position:relative;width:100%;aspect-ratio:16/9;background:#000">
            <iframe src="${_b2LiveEmbedUrl(id)}" allow="autoplay; fullscreen; picture-in-picture" referrerpolicy="no-referrer"
              style="position:absolute;inset:0;width:100%;height:100%;border:0;background:#000"></iframe>
          </div>
        </div>
      </div>
    `;
    ov.onclick = (e) => { if (e.target === ov) { ov.style.display = 'none'; ov.innerHTML = ''; } };
  } catch (e) {}
}

// 오프라인 숨기기 토글
function _b2LiveToggleHideOffline() {
  _b2LiveHideOffline = !_b2LiveHideOffline;
  try{ localStorage.setItem('su_b2_live_hide_offline', _b2LiveHideOffline ? '1' : '0'); }catch(e){}
  const el = document.getElementById('b2-content');
  if (el) { el.innerHTML = _b2LiveView(); if (typeof injectUnivIcons === 'function') injectUnivIcons(el); }
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

// 캐시된 상태를 이미 렌더된 카드 DOM에 반영 (뱃지 표시 + 오프라인 숨김)
// ※ innerHTML을 다시 쓰지 않음 — iframe이 재로드되어 방송이 끊기는 것 방지
function _b2LiveApplyStatusToDom(container) {
  if (!container) return;
  const cards = container.querySelectorAll('.b2-live-card[data-soop-id]');
  let liveCount = 0;
  cards.forEach(card => {
    const id = card.getAttribute('data-soop-id');
    const st = _b2LiveStatusCache[id];
    const badge = card.querySelector('.b2-live-badge');
    const avatarBadge = card.querySelector('.b2-live-preview-badge');
    if (st && st.live) {
      liveCount++;
      if (badge) badge.style.display = 'inline-flex';
      if (avatarBadge) avatarBadge.style.display = 'inline-flex';
      card.style.display = '';
    } else if (st) {
      // 확인 완료 & 오프라인
      if (badge) badge.style.display = 'none';
      if (avatarBadge) avatarBadge.style.display = 'none';
      card.style.display = _b2LiveHideOffline ? 'none' : '';
    } else {
      // 아직 확인 못함 — 오프라인으로 단정하지 않고 그대로 표시
      if (badge) badge.style.display = 'none';
      if (avatarBadge) avatarBadge.style.display = 'none';
    }
  });
  const counter = document.getElementById('b2-live-count-badge');
  if (counter) counter.textContent = `🔴 라이브 ${liveCount}명`;
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
    Object.keys(results).forEach(id => {
      _b2LiveStatusCache[id] = Object.assign({ ts: now }, results[id]);
    });
    // 폴링 도중 다른 탭으로 이동했을 수 있으니 재확인 후 반영
    const stillLive = document.getElementById('b2-content');
    if (stillLive && stillLive.querySelector('.b2-live-card[data-soop-id]')) {
      _b2LiveApplyStatusToDom(stillLive);
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
  const dissolvedUnivs = typeof univCfg !== 'undefined'
    ? new Set((univCfg.filter(u => u.dissolved) || []).map(u => u.name))
    : new Set();

  // SOOP 채널 등록된 스트리머만 추출 (YB/무소속 제외 — 다른 현황판 뷰와 동일 기준)
  const soopPlayers = (typeof players !== 'undefined' ? players : []).filter(p => {
    if (p.hidden || p.retired || p.hideFromBoard) return false;
    const _u = String(p?.univ || '').trim();
    if (_u === 'YB' || _u === '무소속' || !_u) return false;
    if (dissolvedUnivs.has(p.univ)) return false;
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

  const univFiltered = _b2LiveUnivFilter === '전체'
    ? soopPlayers
    : soopPlayers.filter(p => String(p?.univ || '').trim() === _b2LiveUnivFilter);

  const tierFiltered0 = _b2LiveTierFilter === '전체'
    ? univFiltered
    : univFiltered.filter(p => p.tier === _b2LiveTierFilter);

  const q = String(_b2LiveSearch || '').trim().toLowerCase();
  const searched = q
    ? tierFiltered0.filter(p => String(p.name || '').toLowerCase().includes(q))
    : tierFiltered0;

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

  // 오프라인 숨기기: 캐시상 "확인됨 & 오프라인"인 경우만 제외.
  // 아직 확인 안 된(unknown) 항목은 오탐 방지를 위해 그대로 표시하고,
  // 이후 폴링에서 오프라인으로 확인되면 DOM에서 display:none 처리됨.
  const liveFiltered = _b2LiveHideOffline
    ? tierFiltered.filter(p => { const st = _b2LiveStatusCache[p._soopId]; return !st || st.live; })
    : tierFiltered;
  const knownLiveCount = tierFiltered.reduce((n, p) => n + ((_b2LiveStatusCache[p._soopId] && _b2LiveStatusCache[p._soopId].live) ? 1 : 0), 0);
  const unknownCount = tierFiltered.reduce((n, p) => n + (_b2LiveStatusCache[p._soopId] ? 0 : 1), 0);

  const sizeMap = { s: 170, m: 240, l: 320 };
  const cardMinPx = sizeMap[_b2LiveCardSize] || 240;

  const sizeBtn = (v, label) => `<button type="button" class="b2-toolbar-btn" onclick="_b2LiveSetCardSize('${v}')"
    style="padding:4px 10px;border-radius:8px;border:1px solid ${_b2LiveCardSize===v?'#2563eb':'var(--border2)'};background:${_b2LiveCardSize===v?'linear-gradient(135deg,#eff6ff,#dbeafe)':'var(--white)'};color:${_b2LiveCardSize===v?'#1d4ed8':'var(--text2)'};font-size:var(--fs-sm);font-weight:${_b2LiveCardSize===v?900:700};cursor:pointer;margin-bottom:0">${label}</button>`;

  const hideOfflineBtn = `<button type="button" class="b2-toolbar-btn" onclick="_b2LiveToggleHideOffline()" title="오프라인 카드 숨기기"
    style="padding:4px 12px;border-radius:20px;border:1px solid ${_b2LiveHideOffline?'#dc2626':'var(--border2)'};background:${_b2LiveHideOffline?'linear-gradient(135deg,#fef2f2,#fee2e2)':'var(--white)'};color:${_b2LiveHideOffline?'#b91c1c':'var(--text2)'};font-size:var(--fs-sm);font-weight:${_b2LiveHideOffline?900:700};cursor:pointer;display:inline-flex;align-items:center;gap:4px">
    ${_b2LiveHideOffline ? '🙈' : '👁️'} 오프라인 숨기기
  </button>`;

  const refreshBtn = `<button type="button" class="b2-toolbar-btn" onclick="_b2LivePoll()" title="라이브 상태 새로고침"
    style="padding:4px 10px;border-radius:8px;border:1px solid var(--border2);background:var(--white);color:var(--text2);font-size:var(--fs-sm);font-weight:700;cursor:pointer">🔄</button>`;

  const filterBar = `
    <style>
      @keyframes b2LivePulse { 0%,100%{opacity:1} 50%{opacity:.35} }
    </style>
    <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:10px">
      <div style="position:relative">
        <select id="b2-live-univ-sel" class="b2-toolbar-select"
          onchange="_b2LiveUnivFilter=this.value;document.getElementById('b2-content').innerHTML=_b2LiveView();injectUnivIcons&&injectUnivIcons(document.getElementById('b2-content'))"
          style="padding:6px 28px 6px 12px;border-radius:20px;border:1px solid var(--border2);font-size:var(--fs-base);background:var(--white);color:var(--text2);appearance:none;cursor:pointer">
          <option value="전체"${_b2LiveUnivFilter === '전체' ? ' selected' : ''}>🏫 전체 대학</option>
          ${univList.map(u => `<option value="${u}"${_b2LiveUnivFilter === u ? ' selected' : ''}>${u}</option>`).join('')}
        </select>
      </div>
      <div style="position:relative">
        <select id="b2-live-tier-sel" class="b2-toolbar-select"
          onchange="_b2LiveTierFilter=this.value;document.getElementById('b2-content').innerHTML=_b2LiveView();injectUnivIcons&&injectUnivIcons(document.getElementById('b2-content'))"
          style="padding:6px 28px 6px 12px;border-radius:20px;border:1px solid var(--border2);font-size:var(--fs-base);background:var(--white);color:var(--text2);appearance:none;cursor:pointer">
          <option value="전체"${_b2LiveTierFilter === '전체' ? ' selected' : ''}>🎖️ 전체 티어</option>
          ${(typeof TIERS !== 'undefined' ? TIERS : []).map(t => `<option value="${t}"${_b2LiveTierFilter === t ? ' selected' : ''}>${typeof getTierLabel === 'function' ? getTierLabel(t) : t}</option>`).join('')}
        </select>
      </div>
      <div style="position:relative">
        <select id="b2-live-sort-sel" class="b2-toolbar-select"
          onchange="_b2LiveSetSort(this.value)"
          style="padding:6px 28px 6px 12px;border-radius:20px;border:1px solid var(--border2);font-size:var(--fs-base);background:var(--white);color:var(--text2);appearance:none;cursor:pointer">
          <option value="tier"${_b2LiveSortMode==='tier'?' selected':''}>🎖️ 티어순</option>
          <option value="univ"${_b2LiveSortMode==='univ'?' selected':''}>🏫 대학순</option>
          <option value="name"${_b2LiveSortMode==='name'?' selected':''}>🔤 이름순</option>
        </select>
      </div>
      <input id="b2-live-search" type="text" placeholder="🔍 이름 검색" value="${(_b2LiveSearch||'').replace(/"/g,'&quot;')}"
        oninput="_b2LiveSearch=this.value;document.getElementById('b2-content').innerHTML=_b2LiveView();injectUnivIcons&&injectUnivIcons(document.getElementById('b2-content'));const _v=document.getElementById('b2-live-search');if(_v){_v.focus();_v.setSelectionRange(_v.value.length,_v.value.length)}"
        style="padding:6px 12px;border-radius:20px;border:1px solid var(--border2);font-size:var(--fs-base);background:var(--white);color:var(--text2);width:140px">
      <div style="display:flex;gap:4px;align-items:center">
        ${sizeBtn('s','S')}${sizeBtn('m','M')}${sizeBtn('l','L')}
      </div>
      ${hideOfflineBtn}
      ${refreshBtn}
      <div style="margin-left:auto;display:flex;align-items:center;gap:10px;font-size:var(--fs-sm);color:var(--gray-l);font-weight:700">
        <span id="b2-live-count-badge">🔴 라이브 ${knownLiveCount}명</span>
        ${unknownCount > 0 ? `<span title="아직 방송상태 확인이 안 된 스트리머 — 오프라인 숨기기 대상에서 제외되어 계속 표시됩니다">⏳ 미확인 ${unknownCount}명</span>` : ''}
        <span>📺 ${liveFiltered.length}명 표시중 (SOOP 등록 ${soopPlayers.length}명)</span>
      </div>
    </div>
    <div style="display:flex;align-items:center;gap:6px;padding:8px 12px;margin-bottom:14px;background:var(--surface);border:1px dashed var(--border2);border-radius:10px;font-size:var(--fs-sm);color:var(--gray-l)">
      ℹ️ 방송중 여부는 SOOP 비공식 API를 주기적으로 조회해 표시하므로 실제와 최대 ${Math.round(_b2LivePollIntervalMs/1000)}초 정도 차이가 날 수 있습니다.
      오프라인 숨기기 중 새로 방송을 시작한 스트리머는 필터를 다시 선택하거나 🔄 새로고침을 누르면 다시 나타납니다.
      ${unknownCount > 0 ? ' ⏳ 표시가 있는 스트리머는 상태 확인이 안 되어 오프라인이어도 숨겨지지 않습니다.' : ''}
    </div>
  `;

  if (!soopPlayers.length) {
    return `
      <div style="padding:60px 20px;text-align:center;color:var(--gray-l)">
        <div style="font-size:48px;margin-bottom:12px">📺</div>
        <div style="font-weight:700">SOOP 방송국 주소가 등록된 스트리머가 없습니다</div>
        <div style="font-size:var(--fs-sm);margin-top:6px">스트리머 정보수정 → 🏠 방송국 홈 URL 에 SOOP(sooplive) 주소를 입력해주세요.</div>
      </div>`;
  }

  if (!tierFiltered.length) {
    return filterBar + `
      <div style="padding:60px 20px;text-align:center;color:var(--gray-l)">
        <div style="font-size:40px;margin-bottom:10px">🔍</div>
        <div style="font-weight:700">해당 조건에 맞는 스트리머가 없습니다</div>
      </div>`;
  }

  if (!liveFiltered.length) {
    return filterBar + `
      <div style="padding:60px 20px;text-align:center;color:var(--gray-l)">
        <div style="font-size:40px;margin-bottom:10px">📴</div>
        <div style="font-weight:700">현재 방송중인 스트리머가 없습니다</div>
        <div style="font-size:var(--fs-sm);margin-top:6px">오프라인 숨기기가 켜져 있습니다. 👁️ 버튼으로 끄면 전체 카드를 볼 수 있어요.</div>
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
    const embedUrl = _b2LiveEmbedUrl(p._soopId);
    const stKnown = _b2LiveStatusCache[p._soopId];
    const badgeInitDisplay = (stKnown && stKnown.live) ? 'inline-flex' : 'none';
    const photoUrl = p.photo ? ((typeof toHttpsUrl === 'function' ? toHttpsUrl(p.photo) : p.photo).replace(/"/g, '&quot;')) : '';
    const avatarHtml = photoUrl
      ? `<img src="${photoUrl}" alt="${safeNameHtml}" loading="lazy" decoding="async" style="width:100%;height:100%;object-fit:cover;display:block" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
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
          <div style="grid-column:1/-1;display:flex;align-items:center;gap:8px;margin:${isFirst ? '0' : '10px'} 0 2px">
            <span style="font-size:11px;font-weight:900;padding:3px 10px;border-radius:999px;background:${tierBg};color:${tierFg}">${label}</span>
            <span style="font-size:var(--fs-sm);color:var(--gray-l);font-weight:700">${tierGroupCounts[tk]}명</span>
            <div style="flex:1;height:1px;background:var(--border2)"></div>
          </div>`;
      }
    }

    return groupHeader + `
      <div class="b2-live-card" data-soop-id="${p._soopId}" style="background:var(--white);border:1.5px solid var(--border2);border-radius:14px;overflow:hidden;display:flex;flex-direction:column">
        <div class="b2-live-frame-box" data-src="${embedUrl}" style="position:relative;width:100%;aspect-ratio:16/9;background:#000">
          <iframe loading="lazy" allow="fullscreen; picture-in-picture" referrerpolicy="no-referrer"
            style="width:100%;height:100%;border:0"></iframe>
          <span class="b2-live-badge" style="display:${badgeInitDisplay};align-items:center;gap:4px;position:absolute;top:6px;left:6px;padding:2px 8px;border-radius:999px;background:#dc2626;color:#fff;font-size:10px;font-weight:900;letter-spacing:.3px;box-shadow:0 2px 6px rgba(220,38,38,.45);pointer-events:none">
            <span style="width:6px;height:6px;border-radius:50%;background:#fff;animation:b2LivePulse 1.4s infinite"></span>LIVE
          </span>
          <button type="button" onclick="_b2LiveEnlarge('${p._soopId}','${safeName}')" title="확대보기"
            style="position:absolute;top:6px;right:6px;width:26px;height:26px;border-radius:8px;border:0;background:rgba(0,0,0,.55);color:#fff;font-size:13px;cursor:pointer;line-height:26px;padding:0">⛶</button>
        </div>
        <div style="display:flex;align-items:center;gap:10px;padding:8px 10px">
          <div style="position:relative;flex-shrink:0">
            <button type="button" onclick="openPlayerModal&&openPlayerModal('${safeName}')" title="선수 상세"
              style="width:42px;height:42px;padding:0;border:1px solid var(--border2);border-radius:50%;overflow:hidden;background:var(--white);cursor:pointer;box-shadow:0 4px 12px rgba(15,23,42,.08)">
              ${avatarHtml}
            </button>
            <button type="button" class="b2-live-preview-badge" onclick="event.stopPropagation();_b2LivePreview('${p._soopId}','${safeName}')" title="라이브 미리보기"
              style="display:${badgeInitDisplay};align-items:center;gap:4px;position:absolute;right:-3px;bottom:-3px;padding:2px 7px;border:1px solid rgba(255,255,255,.9);border-radius:999px;background:#dc2626;color:#fff;font-size:9px;font-weight:900;letter-spacing:.2px;line-height:1;box-shadow:0 2px 6px rgba(220,38,38,.35);cursor:pointer">
              <span style="width:5px;height:5px;border-radius:50%;background:#fff;animation:b2LivePulse 1.4s infinite"></span>LIVE
            </button>
          </div>
          <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;min-width:0;flex:1">
            <span style="font-weight:900;font-size:var(--fs-base);cursor:pointer;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" onclick="openPlayerModal&&openPlayerModal('${safeName}')">${p.name || ''}</span>
            ${p.univ ? `<span style="font-size:10px;font-weight:800;padding:1px 7px;border-radius:999px;background:${univColor}1a;color:${univColor}">${p.univ}</span>` : ''}
            ${p.tier ? `<span style="font-size:10px;font-weight:800;padding:1px 7px;border-radius:999px;background:${tierBg};color:${tierFg}">${typeof getTierLabel === 'function' ? getTierLabel(p.tier) : p.tier}</span>` : ''}
          </div>
          <a href="https://ch.sooplive.co.kr/${p._soopId}" target="_blank" rel="noopener" style="font-size:12px;text-decoration:none;flex-shrink:0" title="SOOP 채널로 이동">🔗</a>
        </div>
      </div>
    `;
  }).join('');

  setTimeout(() => {
    try{
      const el = document.getElementById('b2-content');
      _b2LiveInitObservers(el);
      _b2LiveApplyStatusToDom(el); // 기존 캐시로 즉시 뱃지/숨김 반영(깜빡임 방지)
      _b2LiveStartPoll();          // 최신 상태 폴링 시작(다른 탭 이동 시 자동 중단)
    }catch(e){}
  }, 0);

  return filterBar + `
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(${cardMinPx}px,1fr));gap:14px">
      ${cards}
    </div>
  `;
}
