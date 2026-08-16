/* ══════════════════════════════════════════════════════════════
   🎵 스트리머 전용 BGM (신규, 2026-08-16)
   선수 정보 수정 팝업에서 등록한 유튜브 링크(p.bgmUrl)를 스트리머 상세 팝업 및
   현황판 프로필탭에서 해당 스트리머를 볼 때 배경음악으로 자동 재생한다.
   대학별 "소개연출" BGM(js/board2-univ-views-lineup.js)과 동일한 패턴이되,
   완전히 분리된 별도 YT.Player 인스턴스를 사용해 서로 간섭하지 않는다.
   ══════════════════════════════════════════════════════════════ */
var _plyrBgmPlayer = null;
var _plyrBgmReady = false;
var _plyrBgmApiLoading = false;
var _plyrBgmPendingVid = null;
var _plyrBgmVolume = 50;
var _plyrBgmActive = false;
var _plyrBgmKickTimer = null;
var _plyrBgmCurrentName = '';
var _plyrBgmCurrentVid = '';

/* ── 🔘 재생 on/off 토글 버튼 (기능추가, 2026-08-17)
   스트리머 상세 팝업 / 현황판 프로필탭에서 자동 재생되는 BGM을 사용자가 직접
   껐다 켤 수 있도록 떠있는 작은 버튼을 하나 둔다. 두 화면 모두 같은 플레이어
   인스턴스를 공유하므로 버튼도 하나만 있으면 된다(활성 상태일 때만 노출). ── */
var _plyrBgmUserOff = false;
try { _plyrBgmUserOff = localStorage.getItem('su_plyr_bgm_off') === '1'; } catch (e) {}

function _plyrBgmToggleBtnEnsure() {
  let btn = document.getElementById('plyrBgmToggleBtn');
  if (!btn) {
    btn = document.createElement('button');
    btn.id = 'plyrBgmToggleBtn';
    btn.type = 'button';
    btn.style.cssText = 'position:fixed;right:16px;bottom:16px;z-index:99999;width:42px;height:42px;border-radius:50%;border:1px solid rgba(148,163,184,.35);background:rgba(15,23,42,.78);color:#fff;font-size:17px;display:none;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 8px 20px rgba(15,23,42,.28);backdrop-filter:blur(6px);transition:opacity .15s,transform .12s;padding:0';
    btn.onmousedown = () => { btn.style.transform = 'scale(.92)'; };
    btn.onmouseup = btn.onmouseleave = () => { btn.style.transform = 'scale(1)'; };
    btn.onclick = (ev) => { ev.stopPropagation(); _plyrBgmToggleUser(); };
    document.body.appendChild(btn);
  }
  return btn;
}

function _plyrBgmToggleBtnSync() {
  const btn = document.getElementById('plyrBgmToggleBtn');
  if (!btn) return;
  btn.style.display = _plyrBgmActive ? 'flex' : 'none';
  btn.textContent = _plyrBgmUserOff ? '🔇' : '🎵';
  btn.style.opacity = _plyrBgmUserOff ? '.55' : '1';
  btn.title = (_plyrBgmUserOff ? '스트리머 BGM 꺼짐 (클릭하여 켜기)' : '스트리머 BGM 켜짐 (클릭하여 끄기)') +
    (_plyrBgmCurrentName ? ' — ' + _plyrBgmCurrentName : '');
}

function _plyrBgmToggleUser() {
  _plyrBgmUserOff = !_plyrBgmUserOff;
  try { localStorage.setItem('su_plyr_bgm_off', _plyrBgmUserOff ? '1' : '0'); } catch (e) {}
  if (_plyrBgmPlayer && _plyrBgmActive) {
    try {
      if (_plyrBgmUserOff) {
        _plyrBgmPlayer.pauseVideo();
        if (_plyrBgmKickTimer) { clearInterval(_plyrBgmKickTimer); _plyrBgmKickTimer = null; }
      } else {
        _plyrBgmPlayer.playVideo();
        _plyrBgmApplyVol();
      }
    } catch (e) {}
  }
  _plyrBgmToggleBtnSync();
}

try { window._plyrBgmToggleUser = _plyrBgmToggleUser; } catch (e) {}

function _plyrBgmExtractId(urlOrId) {
  const s = String(urlOrId || '').trim();
  if (!s) return '';
  if (/^[a-zA-Z0-9_-]{8,15}$/.test(s) && !s.includes('/')) return s;
  const m1 = s.match(/[?&]v=([a-zA-Z0-9_-]{8,15})/); if (m1) return m1[1];
  const m2 = s.match(/youtu\.be\/([a-zA-Z0-9_-]{8,15})/); if (m2) return m2[1];
  const m3 = s.match(/\/shorts\/([a-zA-Z0-9_-]{8,15})/); if (m3) return m3[1];
  const m4 = s.match(/\/embed\/([a-zA-Z0-9_-]{8,15})/); if (m4) return m4[1];
  return '';
}

function _plyrBgmLoadApi() {
  return new Promise((resolve) => {
    if (window.YT && window.YT.Player) return resolve(true);
    const check = () => { if (window.YT && window.YT.Player) resolve(true); else setTimeout(check, 150); };
    if (!_plyrBgmApiLoading) {
      _plyrBgmApiLoading = true;
      if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        tag.async = true;
        document.head.appendChild(tag);
      }
      const prev = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = function () { try { prev && prev(); } catch (e) {} resolve(true); };
    }
    check();
  });
}

function _plyrBgmEnsurePlayer() {
  return _plyrBgmLoadApi().then(() => {
    if (_plyrBgmPlayer) return _plyrBgmPlayer;
    let host = document.getElementById('plyrBgmHost');
    if (!host) {
      host = document.createElement('div');
      host.id = 'plyrBgmHost';
      host.style.cssText = 'position:fixed;left:-9999px;top:-9999px;width:1px;height:1px;opacity:0;pointer-events:none;z-index:-1';
      document.body.appendChild(host);
    }
    _plyrBgmPlayer = new YT.Player('plyrBgmHost', {
      width: '1', height: '1', videoId: '',
      // [FIX-BGM-AUTOPLAY] autoplay:0으로 두면 일부 브라우저가 생성된 iframe에
      // autoplay 권한(allow="autoplay")을 아예 부여하지 않아서, 이후 코드에서
      // playVideo()를 직접 호출해도 재생이 시작되지 않는 경우가 있었다.
      // autoplay:1로 두고 실제로는 loadVideoById 시점에 곡을 지정하므로 빈 플레이어
      // 상태에서 자동재생이 발생하진 않는다 — 다만 iframe에 올바른 autoplay 권한이
      // 부여되도록 하기 위한 설정이다.
      playerVars: { autoplay: 1, controls: 0, disablekb: 1, fs: 0, iv_load_policy: 3, modestbranding: 1, playsinline: 1, rel: 0 },
      events: {
        onReady: () => {
          _plyrBgmReady = true;
          // [FIX-BGM-AUTOPLAY] 일부 브라우저는 iframe에 allow="autoplay" 속성이
          // 없으면 muted 상태에서도 재생을 막는다. YT.Player가 만든 iframe에
          // 명시적으로 권한을 부여해 재생이 막히지 않게 한다.
          try {
            const ifr = (_plyrBgmPlayer.getIframe && _plyrBgmPlayer.getIframe()) || document.querySelector('#plyrBgmHost iframe');
            if (ifr) ifr.setAttribute('allow', 'autoplay; encrypted-media');
          } catch (e) {}
          _plyrBgmApplyVol();
          if (_plyrBgmPendingVid) {
            const vid = _plyrBgmPendingVid;
            _plyrBgmPendingVid = null;
            _plyrBgmPlayNow(vid);
          }
        },
        onStateChange: (e) => {
          // 곡이 끝나면 처음부터 반복 재생
          if (e.data === 0) { try { _plyrBgmPlayer.seekTo(0); _plyrBgmPlayer.playVideo(); } catch (e2) {} }
        }
      }
    });
    return _plyrBgmPlayer;
  });
}

function _plyrBgmApplyVol() {
  if (!_plyrBgmPlayer) return;
  try {
    const v = Math.max(0, Math.min(100, parseInt(_plyrBgmVolume, 10) || 0));
    if (v <= 0) { _plyrBgmPlayer.mute && _plyrBgmPlayer.mute(); }
    else { _plyrBgmPlayer.unMute && _plyrBgmPlayer.unMute(); }
    _plyrBgmPlayer.setVolume(v);
  } catch (e) {}
}

// 브라우저 자동재생 정책 대응: 음소거로 먼저 재생 시작 후, 재생이 실제로 붙으면
// 음소거를 풀고 저장된 볼륨을 적용한다 (대학 BGM과 동일 패턴).
function _plyrBgmPlayNow(vid) {
  const p = _plyrBgmPlayer;
  if (!p || !vid) return;
  try {
    if (p.mute) p.mute();
    p.loadVideoById(vid);
    if (p.playVideo) p.playVideo();
  } catch (e) {}
  // 🔘 사용자가 재생 on/off 토글로 꺼둔 상태라면 곡을 불러오되 바로 일시정지해
  // 자동재생을 시작하지 않는다(다음 사용자 조작 전까지 무음 유지).
  if (_plyrBgmUserOff) {
    try { p.pauseVideo && p.pauseVideo(); } catch (e) {}
    _plyrBgmToggleBtnSync();
    return;
  }
  // [FIX-BGM-AUTOPLAY] 브라우저의 자동재생 정책이 유독 엄격해서 muted 상태로도
  // 재생이 시작되지 않는 경우(제스처 없이 열린 팝업 등)를 대비한 최종 안전장치.
  // 사용자가 상세 팝업 안에서 아무 곳이나 한 번 클릭/터치하면 그 제스처를 이용해
  // 즉시 재생+볼륨 복구를 강제로 시도한다. 이미 재생 중이면 아무 효과 없음.
  try { _plyrBgmArmGestureUnlock(); } catch (e) {}
  if (_plyrBgmKickTimer) { clearInterval(_plyrBgmKickTimer); _plyrBgmKickTimer = null; }
  let tries = 0;
  _plyrBgmKickTimer = setInterval(() => {
    if (!_plyrBgmActive || !_plyrBgmPlayer || _plyrBgmUserOff) {
      clearInterval(_plyrBgmKickTimer); _plyrBgmKickTimer = null; return;
    }
    let st = -1;
    try { st = _plyrBgmPlayer.getPlayerState(); } catch (e) {}
    if (st === 1) {
      _plyrBgmApplyVol();
      clearInterval(_plyrBgmKickTimer); _plyrBgmKickTimer = null; return;
    }
    if (++tries > 20) { clearInterval(_plyrBgmKickTimer); _plyrBgmKickTimer = null; return; }
    try { _plyrBgmPlayer.playVideo(); } catch (e) {}
  }, 300);
}

// [FIX-BGM-AUTOPLAY] 자동재생이 브라우저 정책으로 막힌 경우를 위한 1회성
// 사용자 제스처 언락. 문서 아무 곳이나 클릭/터치/키 입력이 들어오면 그 순간의
// 제스처 컨텍스트를 이용해 재생을 강제로 다시 시도한다. 한 번 성공하면 스스로
// 해제되고, 재생 세션이 바뀌면(_plyrBgmStop) 다음 시작 때 다시 걸린다.
let _plyrBgmGestureArmed = false;
function _plyrBgmArmGestureUnlock() {
  if (_plyrBgmGestureArmed) return;
  _plyrBgmGestureArmed = true;
  const tryUnlock = () => {
    try {
      if (!_plyrBgmActive || !_plyrBgmPlayer) return;
      let st = -1;
      try { st = _plyrBgmPlayer.getPlayerState(); } catch (e) {}
      if (st !== 1) {
        try { _plyrBgmPlayer.playVideo(); } catch (e) {}
      }
      _plyrBgmApplyVol();
    } catch (e) {}
  };
  const events = ['pointerdown', 'click', 'touchstart', 'keydown'];
  const handler = () => {
    tryUnlock();
    events.forEach(ev => document.removeEventListener(ev, handler, true));
    _plyrBgmGestureArmed = false;
  };
  events.forEach(ev => document.addEventListener(ev, handler, { capture: true, once: true, passive: true }));
}

// 스트리머 상세 팝업이 열리거나 현황판 프로필탭에서 스트리머를 선택했을 때 호출.
// 등록된 BGM 링크가 없으면 재생 중이던 것을 정지한다.
function _plyrBgmStart(player) {
  try {
    const name = player ? String(player.name || '') : '';
    const vid = player ? _plyrBgmExtractId(player.bgmUrl) : '';
    if (!vid) {
      // 이 스트리머는 BGM이 없음 — 재생 중이던 다른 스트리머 BGM만 정지
      _plyrBgmStop();
      return;
    }
    // 이미 같은 스트리머의 같은 곡이 재생 중이면 재시작하지 않음(재렌더 시 끊김 방지)
    if (_plyrBgmActive && _plyrBgmCurrentName === name && _plyrBgmCurrentVid === vid) return;
    _plyrBgmCurrentName = name;
    _plyrBgmCurrentVid = vid;
    _plyrBgmVolume = Number.isFinite(parseInt(player.bgmVolume, 10)) ? Math.max(0, Math.min(100, parseInt(player.bgmVolume, 10))) : 50;
    _plyrBgmActive = true;
    try { _plyrBgmToggleBtnEnsure(); _plyrBgmToggleBtnSync(); } catch (e) {}
    _plyrBgmEnsurePlayer().then(() => {
      if (!_plyrBgmActive || _plyrBgmCurrentName !== name) return; // 그 사이 다른 스트리머로 바뀐 경우 무시
      if (_plyrBgmReady) { _plyrBgmPlayNow(vid); }
      else { _plyrBgmPendingVid = vid; }
    });
  } catch (e) {}
}

function _plyrBgmStop() {
  if (!_plyrBgmActive && !_plyrBgmCurrentName) return;
  _plyrBgmActive = false;
  _plyrBgmCurrentName = '';
  _plyrBgmCurrentVid = '';
  _plyrBgmPendingVid = null;
  if (_plyrBgmKickTimer) { clearInterval(_plyrBgmKickTimer); _plyrBgmKickTimer = null; }
  try { if (_plyrBgmPlayer) _plyrBgmPlayer.stopVideo(); } catch (e) {}
  _plyrBgmGestureArmed = false;
  try { _plyrBgmToggleBtnSync(); } catch (e) {}
}

// 스트리머 상세 팝업이 닫혔을 때 호출 — 현황판 프로필탭에 선택된 스트리머가 있고
// 그 탭이 여전히 보이는 중이면 그 스트리머의 BGM으로 복귀, 아니면 그냥 정지.
function _plyrBgmResumeProfileTab() {
  try {
    const sel = (typeof _b2SelectedPlayer !== 'undefined') ? _b2SelectedPlayer : null;
    const b2Visible = !!(typeof curTab !== 'undefined' && curTab === 'board2' && typeof _b2View !== 'undefined' && _b2View === 'players');
    if (sel && b2Visible) { _plyrBgmStart(sel); }
    else { _plyrBgmStop(); }
  } catch (e) { try { _plyrBgmStop(); } catch (e2) {} }
}
