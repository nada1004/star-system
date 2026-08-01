/* ══════════════════════════════════════════════════════════════
   현황판 — 📺 라이브 뷰 (SOOP 채널 등록 스트리머 방송화면 모아보기)
   - p.channelUrl 이 SOOP(sooplive) 주소인 스트리머만 추출
   - 대학별 / 티어별 필터 + 이름검색 + 정렬 + 카드크기 조절
   - IntersectionObserver로 화면에 보이는 카드만 iframe 로드(성능)
   - 카드 확대보기 모달 지원
   - 🔴 라이브 뱃지 자동감지:
     서버(/api/soop-live-status)가 SOOP player_live_api.php를 대신 호출해
     방송중 여부를 조회(CORS 우회). 주기적으로 폴링해 뱃지 상태만
     갱신하며, 이미 로드된 iframe은 다시 만들지 않음(방송 새로고침 방지).
   ══════════════════════════════════════════════════════════════ */

var _b2LiveUnivFilter = '전체';
var _b2LiveTierFilter = '전체';
var _b2LiveGenderFilter = (()=>{ try{ const g = localStorage.getItem('su_b2_live_gender'); return ['전체','F','M'].includes(g) ? g : '전체'; }catch(e){ return '전체'; } })();
var _b2LiveSearch = '';
var _b2LiveSortMode = (()=>{ try{ return localStorage.getItem('su_b2_live_sort') || 'tier'; }catch(e){ return 'tier'; } })(); // 'tier' | 'name' | 'univ'
var _b2LiveCardSize = (()=>{ try{ const s = localStorage.getItem('su_b2_live_card_size'); return ['s','m'].includes(s) ? s : 'm'; }catch(e){ return 'm'; } })();
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

function _b2LiveSetGender(g) {
  _b2LiveGenderFilter = ['전체','F','M'].includes(g) ? g : '전체';
  try{ localStorage.setItem('su_b2_live_gender', _b2LiveGenderFilter); }catch(e){}
  const el = document.getElementById('b2-content');
  if (el) { el.innerHTML = _b2LiveView(); if (typeof injectUnivIcons === 'function') injectUnivIcons(el); }
}

function _b2LiveSetCardSize(size) {
  _b2LiveCardSize = ['s','m'].includes(size) ? size : 'm';
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
          <iframe src="${_b2LiveEmbedUrl(id)}" allow="autoplay; fullscreen; picture-in-picture" referrerpolicy="no-referrer"
            style="width:100%;height:100%;border:0;background:#000;display:block"></iframe>
        </div>
      </div>
    `;
    ov.onclick = (e) => { if (e.target === ov) { ov.style.display = 'none'; ov.innerHTML = ''; } };
  } catch (e) {}
}

function _b2LiveCanHoverPreview() {
  // 일부 환경에서 matchMedia 판단이 빗나가 hover가 막히는 경우가 있어
  // 데스크톱 브라우저 기준으로는 넉넉하게 허용한다.
  try {
    if (window.matchMedia && window.matchMedia('(hover: none)').matches) return false;
  } catch (e) {}
  return true;
}

function _b2LiveEnsureHoverOverlay(){
  let ov = document.getElementById('b2LiveHoverOverlay');
  if(ov) return ov;
  ov = document.createElement('div');
  ov.id = 'b2LiveHoverOverlay';
  ov.className = 'su-modal-overlay';
  ov.style.display = 'none';
  // 바깥 클릭(다른 곳 클릭) 시 닫기
  ov.addEventListener('mousedown', (e)=>{
    try{
      if(e.target === ov) _b2LiveHideHoverPreview(true);
    }catch(_){}
  });
  // ⚠️ 깜빡임 버그 수정: 팝업(su-modal-overlay)이 화면 전체를 덮는 position:fixed 요소라서
  // 팝업이 열리는 순간 마우스 커서 아래 요소가 프로필 카드 → 팝업(배경 포함)으로 바뀐다.
  // 이전에는 "닫힘 취소" 처리가 팝업 안쪽 박스(.su-modal)에만 걸려 있어서, 커서가
  // 팝업의 어두운 배경(바깥 여백) 위에 있을 때는 닫힘 취소가 안 되고 그대로 닫혔다가,
  // 팝업이 사라지면 커서가 다시 프로필 위로 돌아온 걸로 판정되어 재오픈 → 무한 반복(깜빡임).
  // → 팝업 전체(배경 포함)에 마우스가 있으면 닫힘을 취소하고, 팝업을 완전히 벗어나야만 닫히게 함.
  ov.addEventListener('mouseenter', ()=>{ try{ clearTimeout(_b2LiveHoverCloseTimer); }catch(e){} });
  ov.addEventListener('mouseleave', ()=>{ _b2LiveHoverLeave(); });
  document.body.appendChild(ov);
  return ov;
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

// (참고사이트 방식과 동일하게 변경) 호버 시 실제 방송 iframe을 바로 불러오지 않고,
// 썸네일 이미지 + 시청자수 + 경과시간 + 방송제목만 가벼운 팝업으로 보여준다.
// 실제 시청은 카드 클릭(확대보기 _b2LiveEnlarge)에서만 iframe을 로드한다.
// → 마우스를 여러 카드에 빠르게 올려도 매번 라이브 임베드가 재생되지 않아 가볍다.
function _b2LiveShowHoverPreview(anchorEl, id, name){
  try{
    if(!_b2LiveCanHoverPreview() || !anchorEl || !id) return;
    const st = _b2LiveStatusCache[id];
    const ov = _b2LiveEnsureHoverOverlay();
    _b2LiveHoverOpenId = String(id||'');
    _b2LiveHoverOpenName = String(name||'');
    ov.style.display = 'flex';

    if (!st || !st.live) {
      // ⚠️ 수정: 서버의 라이브 상태 폴링이 아직 안 됐거나(로딩 지연) 실패한 경우에도
      // 이전에는 팝업 자체를 아예 숨겨버려서 "hover해도 팝업이 안 뜬다"는 문제가 있었음.
      // → 라이브 확정 정보가 없을 때는 실제 SOOP 방송 iframe을 바로 띄워서(두 번째 버전과
      //   동일한 방식) 최소한 팝업은 항상 뜨도록 한다. (오프라인이면 SOOP 임베드 자체가
      //   "방송 종료" 화면을 보여줌)
      ov.innerHTML = `
        <div class="su-modal" style="width:min(620px, calc(100vw - 20px));height:min(400px, calc(100vh - 20px));overflow:hidden;display:flex;flex-direction:column">
          <div class="su-modal-hd" style="display:flex;align-items:center;justify-content:space-between">
            <div style="font-weight:1000;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">📺 ${name || ''}</div>
            <button type="button" class="btn btn-r btn-sm" onclick="_b2LiveHideHoverPreview(true)">닫기</button>
          </div>
          <div class="su-modal-bd" style="padding:0;overflow:hidden;flex:1;min-height:0;height:100%">
            <iframe src="${_b2LiveEmbedUrl(id)}" allow="autoplay; fullscreen; picture-in-picture" referrerpolicy="no-referrer"
              style="width:100%;height:100%;border:0;background:#000;display:block"></iframe>
          </div>
        </div>
      `;
      try{
        const modal = ov.querySelector('.su-modal');
        if(modal && !modal.dataset.boundHover){
          modal.dataset.boundHover = '1';
          modal.addEventListener('mouseenter', ()=>{ try{ clearTimeout(_b2LiveHoverCloseTimer); }catch(e){} });
          modal.addEventListener('mouseleave', ()=>{ _b2LiveHoverLeave(); });
        }
      }catch(e){}
      return;
    }

    const safeTitle = String(st.title || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    const viewerCnt = Number.isFinite(st.viewerCnt) ? st.viewerCnt : (st.viewerCnt || '0');
    const relTime = _b2LiveRelativeTime(st.broadStart);
    const thumbHtml = st.thumb
      ? `<img src="${st.thumb}" alt="" loading="lazy" style="width:100%;height:100%;object-fit:cover;display:block;background:#111" onerror="this.style.display='none'">`
      : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:#94a3b8;background:#111;font-size:13px">미리보기 이미지 없음</div>`;

    ov.innerHTML = `
      <div class="su-modal" style="width:min(480px, calc(100vw - 20px));overflow:hidden;display:flex;flex-direction:column">
        <div class="su-modal-hd" style="display:flex;align-items:center;justify-content:space-between">
          <div style="font-weight:1000;min-width:0;display:flex;align-items:center;gap:10px;overflow:hidden">
            <span style="display:inline-flex;align-items:center;gap:5px;background:#dc2626;color:#fff;padding:3px 9px;border-radius:999px;font-size:11px;font-weight:900;line-height:1;flex-shrink:0">
              <span style="width:6px;height:6px;border-radius:50%;background:#fff;animation:b2LivePulse 1.4s infinite"></span>LIVE
            </span>
            <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${name || ''}</span>
          </div>
          <div style="display:flex;align-items:center;gap:6px;flex-shrink:0">
            <button type="button" class="btn btn-r btn-sm" onclick="_b2LiveEnlarge('${String(id).replace(/'/g,"\\'")}','${String(name||'').replace(/'/g,"\\'")}');_b2LiveHideHoverPreview(true)">시청하기</button>
            <button type="button" class="btn btn-r btn-sm" onclick="_b2LiveHideHoverPreview(true)">닫기</button>
          </div>
        </div>
        <div class="su-modal-bd" style="padding:0;overflow:hidden">
          <div style="position:relative;width:100%;aspect-ratio:16/9;background:#111">
            ${thumbHtml}
            <div style="position:absolute;top:8px;left:8px;display:flex;align-items:center;gap:5px;background:rgba(30,30,30,.75);color:#fff;padding:3px 10px;border-radius:16px;font-size:13px;font-weight:800">
              <span style="width:6px;height:6px;border-radius:50%;background:#ef4444"></span>${viewerCnt}
            </div>
            ${relTime ? `<div style="position:absolute;top:8px;right:8px;background:rgba(0,0,0,.6);color:#fff;padding:3px 10px;border-radius:16px;font-size:12px">${relTime}</div>` : ''}
          </div>
          ${safeTitle ? `<div style="padding:8px 12px;font-size:14px;color:var(--text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${safeTitle}</div>` : ''}
        </div>
      </div>
    `;
    // 모달에 마우스 올라가면 닫힘 예약 취소 (프로필→모달 이동 가능)
    try{
      const modal = ov.querySelector('.su-modal');
      if(modal && !modal.dataset.boundHover){
        modal.dataset.boundHover = '1';
        modal.addEventListener('mouseenter', ()=>{ try{ clearTimeout(_b2LiveHoverCloseTimer); }catch(e){} });
        modal.addEventListener('mouseleave', ()=>{ _b2LiveHoverLeave(); });
      }
    }catch(e){}
  }catch(e){}
}

function _b2LiveHideHoverPreview(immediate){
  try{
    clearTimeout(_b2LiveHoverOpenTimer);
    clearTimeout(_b2LiveHoverCloseTimer);
    const ov = document.getElementById('b2LiveHoverOverlay');
    if(!ov) return;
    const close = ()=>{
      ov.style.display = 'none';
      ov.innerHTML = '';
      _b2LiveHoverOpenId = '';
      _b2LiveHoverOpenName = '';
    };
    if(immediate) close();
    else _b2LiveHoverCloseTimer = setTimeout(close, 180);
  }catch(e){}
}

function _b2LiveHoverEnter(anchorEl, id, name) {
  try {
    clearTimeout(_b2LiveHoverCloseTimer);
    clearTimeout(_b2LiveHoverOpenTimer);
    _b2LiveHoverOpenTimer = setTimeout(()=>_b2LiveShowHoverPreview(anchorEl, id, name), 140);
  } catch (e) {}
}

function _b2LiveHoverLeave(e) {
  try {
    // 프로필 카드에서 벗어난 곳(relatedTarget)이 팝업 자신이면 닫지 않음(깜빡임 방지 이중 안전장치)
    const ov = document.getElementById('b2LiveHoverOverlay');
    const related = e && e.relatedTarget;
    if (ov && related && ov.contains(related)) return;
  } catch (_) {}
  _b2LiveHideHoverPreview(false);
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
  let liveCount = 0;
  cards.forEach(card => {
    const id = card.getAttribute('data-soop-id');
    const st = _b2LiveStatusCache[id];
    const badge = card.querySelector('.b2-live-badge');
    const avatarBadge = card.querySelector('.b2-live-preview-badge');
    const avatarBtn = card.querySelector('.b2-live-avatar-btn');
    const isLive = !!(st && st.live);
    if (isLive) liveCount++;
    if (badge) badge.style.display = isLive ? 'inline-flex' : 'none';
    if (avatarBadge) avatarBadge.style.display = isLive ? 'inline-flex' : 'none';
    card.classList.toggle('is-live', isLive);
    if (avatarBtn) avatarBtn.classList.toggle('is-live', isLive);
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
    let changed = false;
    Object.keys(results).forEach(id => {
      const prevLive = !!(_b2LiveStatusCache[id] && _b2LiveStatusCache[id].live);
      const nextLive = !!(results[id] && results[id].live);
      if (prevLive !== nextLive) changed = true;
      _b2LiveStatusCache[id] = Object.assign({ ts: now }, results[id]);
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

  const sizeBtn = (v, label) => `<button type="button" class="b2-toolbar-btn" onclick="_b2LiveSetCardSize('${v}')" title="카드 크기: ${label}" aria-pressed="${_b2LiveCardSize===v}"
    style="padding:7px 13px;border-radius:9px;border:1.5px solid ${_b2LiveCardSize===v?'#2563eb':'var(--border2)'};background:${_b2LiveCardSize===v?'linear-gradient(135deg,#eff6ff,#dbeafe)':'var(--white)'};color:${_b2LiveCardSize===v?'#1d4ed8':'var(--text2)'};font-size:13px;font-weight:${_b2LiveCardSize===v?900:700};cursor:pointer;margin-bottom:0">${label}</button>`;

  const genderBtn = (v, label) => `<button type="button" class="b2-toolbar-btn" onclick="_b2LiveSetGender('${v}')" title="${label}" aria-pressed="${_b2LiveGenderFilter===v}"
    style="padding:8px 14px;border-radius:20px;border:1.5px solid ${_b2LiveGenderFilter===v?'#2563eb':'var(--border2)'};background:${_b2LiveGenderFilter===v?'linear-gradient(135deg,#eff6ff,#dbeafe)':'var(--white)'};color:${_b2LiveGenderFilter===v?'#1d4ed8':'var(--text2)'};font-size:var(--fs-base);font-weight:${_b2LiveGenderFilter===v?900:700};cursor:pointer;margin-bottom:0;white-space:nowrap">${label}</button>`;

  const filterBar = `
    <style>
      @keyframes b2LivePulse { 0%,100%{opacity:1} 50%{opacity:.35} }

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
      <div style="display:flex;gap:4px;align-items:center">
        ${sizeBtn('s','S')}${sizeBtn('m','M')}
      </div>
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
    // S: 프로필 이미지가 카드를 가득 채우는 포토카드형 (아바타 원형 대신 풀블리드 이미지 + 하단 그라데이션 오버레이)
    s: { min: 70, avatar: 34, stacked: true,  fullImage: true, pad: '0',              nameFs: '11px', tagFs: '7px', univLogoFs: '20px', gap: 6 },
    m: { min: 132, avatar: 50, stacked: false, fullImage: false, pad: '8px 9px',     nameFs: '12px',  tagFs: '9px', univLogoFs: '13px', gap: 9 },
  };
  const sizeCfg = sizeCfgMap[_b2LiveCardSize] || sizeCfgMap.m;
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
          <div style="grid-column:1/-1;display:flex;align-items:center;gap:9px;margin:${isFirst ? '0' : '16px'} 0 4px">
            <span class="b2-live-group-badge" style="font-size:12.5px;padding:5px 13px;background:${tierBg};color:${tierFg};box-shadow:0 2px 6px rgba(0,0,0,.12)">${label}</span>
            <span style="font-size:var(--fs-base);color:var(--text3);font-weight:800">${tierGroupCounts[tk]}명</span>
            <div style="flex:1;height:1.5px;background:var(--border2)"></div>
          </div>`;
      }
    }

    const btnSize = sizeCfg.stacked ? 26 : 24;
    const btnAccentStyle = p.univ ? `border-color:${univColor}55;color:${univColor};background:${univColor}14;` : '';
    const enlargeBtn = `<button type="button" class="b2-live-iconbtn" onclick="_b2LiveEnlarge('${p._soopId}','${safeName}')" title="확대보기" aria-label="${safeNameHtml} 확대보기"
            style="width:${btnSize}px;height:${btnSize}px;border-radius:7px;font-size:${sizeCfg.stacked ? 12 : 10.5}px;line-height:1;padding:0;flex-shrink:0;${btnAccentStyle}">⛶</button>`;
    const linkBtn = `<a href="https://ch.sooplive.co.kr/${p._soopId}" target="_blank" rel="noopener" class="b2-live-iconbtn"
            style="width:${btnSize}px;height:${btnSize}px;border-radius:7px;font-size:${sizeCfg.stacked ? 12 : 10.5}px;${btnAccentStyle}" title="SOOP 채널로 이동" aria-label="${safeNameHtml} SOOP 채널로 이동">🔗</a>`;

    // M/L 아바타: 프로필 이미지 모양은 설정탭(⚙️ 프로필 이미지 모양)에서 지정한 대로 따르도록
    // 하드코딩된 원형(50%) 대신 --su_profile_radius / --su_profile_clip CSS 변수 사용
    const avatarBlock = `
      <div style="position:relative;flex-shrink:0" onmouseenter="_b2LiveHoverEnter(this,'${p._soopId}','${safeName}')" onmouseleave="_b2LiveHoverLeave(event)">
        <button type="button" class="b2-live-avatar-btn${badgeInitDisplay==='inline-flex'?' is-live':''}" onclick="openPlayerModal&&openPlayerModal('${safeName}')" title="${badgeInitDisplay==='inline-flex'?'선수 상세 · 마우스 올리면 라이브 미리보기':'선수 상세'}"
          style="width:${sizeCfg.avatar}px;height:${sizeCfg.avatar}px;padding:0;border:1.5px solid var(--border2);border-radius:var(--su_profile_radius,50%);clip-path:var(--su_profile_clip,none);overflow:hidden;background:var(--white);cursor:pointer;box-shadow:0 4px 12px rgba(15,23,42,.08)">
          ${avatarHtml}
        </button>
        <span class="b2-live-preview-badge" title="마우스를 올리면 라이브 미리보기"
          style="display:${badgeInitDisplay};align-items:center;gap:2px;position:absolute;right:-3px;bottom:-3px;padding:1px 5px;border:1px solid #fff;border-radius:999px;background:#dc2626;color:#fff;font-size:7px;font-weight:900;letter-spacing:.2px;line-height:1.4;box-shadow:0 1px 5px rgba(220,38,38,.4);pointer-events:none">
          <span class="b2-live-badge-dot" style="width:3px;height:3px;border-radius:50%;background:#fff;animation:b2LivePulse 1.4s infinite"></span>LIVE
        </span>
      </div>`;

    const nameHtml = `<span class="b2-live-name" style="font-weight:900;font-size:${sizeCfg.nameFs};cursor:pointer;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--text)" onclick="openPlayerModal&&openPlayerModal('${safeName}')">${p.name || ''}</span>`;
    // 대학명 텍스트 대신 대학 로고를 노출 (무소속은 태그 자체를 숨김)
    const univLogoSize = typeof getUnivLogoSizeStr === 'function' ? getUnivLogoSizeStr(p.univ, 'players', sizeCfg.univLogoFs) : sizeCfg.univLogoFs;
    const univTag = p.univ ? `<span class="b2-live-tag" title="${String(p.univ).replace(/"/g, '&quot;')}" style="display:inline-flex;align-items:center;font-size:${sizeCfg.tagFs};padding:0;background:transparent;color:${univColor};border:none;white-space:nowrap">${typeof gUI === 'function' ? gUI(p.univ, univLogoSize) : ''}</span>` : '';
    const tierTag = p.tier ? `<span class="b2-live-tag" style="font-size:${sizeCfg.tagFs};padding:1px 6px;background:${tierBg};color:${tierFg};white-space:nowrap;box-shadow:0 1px 3px rgba(0,0,0,.12)">${typeof getTierLabel === 'function' ? getTierLabel(p.tier) : p.tier}</span>` : '';
    // 카드 배경: 대학 색상의 연한 톤 (무소속은 흰색 유지)
    const cardBg = p.univ ? `${univColor}28` : 'var(--white)';

    const cardBody = sizeCfg.fullImage
      // ── S(작게) 모드: 프로필 이미지가 카드를 가득 채우는 포토카드형
      //    (원형 아바타 대신 카드 전체를 사진으로 채우고 하단에 그라데이션 위 이름/태그 오버레이)
      ? `
        <div style="position:relative;width:100%;aspect-ratio:3/4;background:${univColor}12;overflow:hidden"
          onmouseenter="_b2LiveHoverEnter(this,'${p._soopId}','${safeName}')" onmouseleave="_b2LiveHoverLeave(event)">
          ${photoUrl
            ? `<img src="${photoUrl}" alt="${safeNameHtml}" loading="lazy" decoding="async" style="width:100%;height:100%;object-fit:cover;display:block;cursor:pointer" onclick="openPlayerModal&&openPlayerModal('${safeName}')" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
               <span style="display:none;width:100%;height:100%;align-items:center;justify-content:center;background:${univColor}18;color:${univColor};font-size:18px;font-weight:1000;cursor:pointer" onclick="openPlayerModal&&openPlayerModal('${safeName}')">${safeNameHtml.slice(0,1) || '?'}</span>`
            : `<span style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:${univColor}18;color:${univColor};font-size:18px;font-weight:1000;cursor:pointer" onclick="openPlayerModal&&openPlayerModal('${safeName}')">${safeNameHtml.slice(0,1) || '?'}</span>`}
          <div style="position:absolute;left:0;right:0;bottom:0;height:60%;background:linear-gradient(to top,rgba(0,0,0,.82),rgba(0,0,0,.32) 55%,rgba(0,0,0,0));pointer-events:none"></div>
          <span class="b2-live-preview-badge" title="마우스를 올리면 라이브 미리보기"
            style="display:${badgeInitDisplay};align-items:center;gap:2px;position:absolute;top:4px;left:4px;padding:1px 5px;border:1px solid rgba(255,255,255,.95);border-radius:999px;background:#dc2626;color:#fff;font-size:7px;font-weight:900;letter-spacing:.2px;line-height:1.4;box-shadow:0 1px 4px rgba(220,38,38,.4);pointer-events:none;z-index:2">
            <span class="b2-live-badge-dot" style="width:3px;height:3px;border-radius:50%;background:#fff;animation:b2LivePulse 1.4s infinite"></span>LIVE
          </span>
          <div style="position:absolute;left:0;right:0;bottom:0;padding:5px 6px;display:flex;flex-direction:column;gap:3px;z-index:1">
            <span class="b2-live-name" style="font-weight:900;font-size:${sizeCfg.nameFs};color:#fff;text-shadow:0 1px 6px rgba(0,0,0,.85),0 1px 2px rgba(0,0,0,.9);cursor:pointer;display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" onclick="openPlayerModal&&openPlayerModal('${safeName}')">${p.name || ''}</span>
            <div style="display:flex;gap:3px;flex-wrap:wrap">
              ${p.univ ? `<span class="b2-live-tag" title="${String(p.univ).replace(/"/g, '&quot;')}" style="display:inline-flex;align-items:center;font-size:${sizeCfg.tagFs};padding:0;background:transparent;color:#fff;border:none;white-space:nowrap">${typeof gUI === 'function' ? gUI(p.univ, univLogoSize) : ''}</span>` : ''}
            </div>
          </div>
        </div>`
      // ── M/L 모드: 가로 정렬형 카드 — 축소된 크기에 맞춘 컴팩트 레이아웃
      //    (카드 안 티어뱃지는 표시하지 않음 — 대학태그만 노출)
      : `
        <div style="display:flex;align-items:center;gap:9px">
          ${avatarBlock}
          <div style="display:flex;flex-direction:column;gap:3px;min-width:0;flex:1">
            <div style="min-width:0">${nameHtml}</div>
            <div style="display:flex;gap:3px;flex-wrap:wrap">${univTag}</div>
          </div>
          <div style="display:flex;flex-direction:column;gap:3px;flex-shrink:0">${enlargeBtn}${linkBtn}</div>
        </div>`;

    return groupHeader + `
      <div class="b2-live-card${badgeInitDisplay==='inline-flex' ? ' is-live' : ''}" data-soop-id="${p._soopId}" style="position:relative;background:${cardBg};border:1.5px solid var(--border2);border-radius:12px;overflow:hidden;padding:${sizeCfg.pad}">
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
