/* ══════════════════════════════════════════════════════════════
   보드2 - 프로필탭 스트리머 주제곡(BGM)
   스트리머 정보수정에 등록한 유튜브 링크를, 프로필탭에서 그 스트리머를
   선택(프로필 보기)했을 때 재생하고 다른 스트리머로 바꾸면 정지 후 새로
   재생한다. board2-univ-views-lineup.js의 "소개연출 BGM"과 같은 검증된
   방식(숨김 유튜브 플레이어, 자동재생 정책 우회를 위한 음소거 선재생)을
   쓰되, 완전히 별도 인스턴스라 서로 간섭하지 않는다.
   ══════════════════════════════════════════════════════════════ */
var _b2PlayerBgmPlayer = null;
var _b2PlayerBgmReady = false;
var _b2PlayerBgmApiLoading = false;
var _b2PlayerBgmPendingVid = null;
var _b2PlayerBgmVolume = 50;
var _b2PlayerBgmActive = false;
var _b2PlayerBgmKickTimer = null;
var _b2PlayerBgmCurName = '';

function _b2PlayerBgmExtractId(urlOrId) {
  const s = String(urlOrId || '').trim();
  if (!s) return '';
  if (/^[a-zA-Z0-9_-]{8,15}$/.test(s) && !s.includes('/')) return s;
  const m1 = s.match(/[?&]v=([a-zA-Z0-9_-]{8,15})/); if (m1) return m1[1];
  const m2 = s.match(/youtu\.be\/([a-zA-Z0-9_-]{8,15})/); if (m2) return m2[1];
  const m3 = s.match(/\/shorts\/([a-zA-Z0-9_-]{8,15})/); if (m3) return m3[1];
  const m4 = s.match(/\/embed\/([a-zA-Z0-9_-]{8,15})/); if (m4) return m4[1];
  return '';
}

function _b2PlayerBgmLoadApi() {
  return new Promise((resolve) => {
    if (window.YT && window.YT.Player) return resolve(true);
    const check = () => { if (window.YT && window.YT.Player) resolve(true); else setTimeout(check, 150); };
    if (!_b2PlayerBgmApiLoading) {
      _b2PlayerBgmApiLoading = true;
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

function _b2PlayerBgmEnsurePlayer() {
  return _b2PlayerBgmLoadApi().then(() => {
    if (_b2PlayerBgmPlayer) return _b2PlayerBgmPlayer;
    let host = document.getElementById('b2PlayerBgmHost');
    if (!host) {
      host = document.createElement('div');
      host.id = 'b2PlayerBgmHost';
      host.style.cssText = 'position:fixed;left:-9999px;top:-9999px;width:1px;height:1px;opacity:0;pointer-events:none;z-index:-1';
      document.body.appendChild(host);
    }
    _b2PlayerBgmPlayer = new YT.Player('b2PlayerBgmHost', {
      width: '1', height: '1', videoId: '',
      playerVars: { autoplay: 0, controls: 0, disablekb: 1, fs: 0, iv_load_policy: 3, modestbranding: 1, playsinline: 1, rel: 0 },
      events: {
        onReady: () => {
          _b2PlayerBgmReady = true;
          _b2PlayerBgmApplyVol();
          if (_b2PlayerBgmPendingVid) {
            const vid = _b2PlayerBgmPendingVid;
            _b2PlayerBgmPendingVid = null;
            _b2PlayerBgmPlayNow(vid);
          }
        },
        onStateChange: (e) => {
          // 곡이 짧아서 화면을 보는 동안 먼저 끝나면 처음부터 반복 재생
          if (e.data === 0) { try { _b2PlayerBgmPlayer.seekTo(0); _b2PlayerBgmPlayer.playVideo(); } catch (e2) {} }
        }
      }
    });
    return _b2PlayerBgmPlayer;
  });
}

function _b2PlayerBgmApplyVol() {
  if (!_b2PlayerBgmPlayer) return;
  try {
    const v = Math.max(0, Math.min(100, parseInt(_b2PlayerBgmVolume, 10) || 0));
    if (v <= 0) { _b2PlayerBgmPlayer.mute && _b2PlayerBgmPlayer.mute(); }
    else { _b2PlayerBgmPlayer.unMute && _b2PlayerBgmPlayer.unMute(); }
    _b2PlayerBgmPlayer.setVolume(v);
  } catch (e) {}
}

// 유튜브 자동재생 정책 우회: 음소거 상태로 먼저 재생을 시작하고, 실제로 재생이
// 잡히면 음소거를 풀고 저장된 볼륨을 적용한다. 안 잡히면 몇 번 더 시도한다.
function _b2PlayerBgmPlayNow(vid) {
  const p = _b2PlayerBgmPlayer;
  if (!p || !vid) return;
  try {
    if (p.mute) p.mute();
    p.loadVideoById(vid);
    if (p.playVideo) p.playVideo();
  } catch (e) {}
  if (_b2PlayerBgmKickTimer) { clearInterval(_b2PlayerBgmKickTimer); _b2PlayerBgmKickTimer = null; }
  let tries = 0;
  _b2PlayerBgmKickTimer = setInterval(() => {
    if (!_b2PlayerBgmActive || !_b2PlayerBgmPlayer) {
      clearInterval(_b2PlayerBgmKickTimer); _b2PlayerBgmKickTimer = null; return;
    }
    let st = -1;
    try { st = _b2PlayerBgmPlayer.getPlayerState(); } catch (e) {}
    if (st === 1) {
      _b2PlayerBgmApplyVol();
      clearInterval(_b2PlayerBgmKickTimer); _b2PlayerBgmKickTimer = null; return;
    }
    if (++tries > 20) { clearInterval(_b2PlayerBgmKickTimer); _b2PlayerBgmKickTimer = null; return; }
    try { _b2PlayerBgmPlayer.playVideo(); } catch (e) {}
  }, 300);
}

// 프로필탭에서 스트리머를 선택(프로필 보기)했을 때 호출 — 그 선수에게 등록된
// 주제곡 링크가 있으면 재생하고, 없으면 이전 곡을 정지만 한다. 다른 스트리머를
// 누르면 이 함수가 다시 호출되며 자연히 이전 곡은 정지되고 새 곡이 재생된다.
function _b2PlayerBgmStart(playerName) {
  try {
    _b2PlayerBgmCurName = playerName || '';
    const list = (typeof players !== 'undefined') ? players : [];
    const p = list.find(x => x.name === playerName);
    const vid = p ? _b2PlayerBgmExtractId(p.bgmUrl) : '';
    if (!vid) { _b2PlayerBgmStop(); return; }
    _b2PlayerBgmVolume = Number.isFinite(parseInt(p.bgmVolume, 10)) ? Math.max(0, Math.min(100, parseInt(p.bgmVolume, 10))) : 50;
    _b2PlayerBgmActive = true;
    _b2PlayerBgmEnsurePlayer().then(() => {
      // 그 사이 다른 스트리머로 또 바뀌었으면 지금 로드하려던 곡은 재생하지 않는다.
      if (!_b2PlayerBgmActive || _b2PlayerBgmCurName !== playerName) return;
      if (_b2PlayerBgmReady) { _b2PlayerBgmPlayNow(vid); }
      else { _b2PlayerBgmPendingVid = vid; }
    });
    _b2PlayerBgmSyncControls();
  } catch (e) {}
}

function _b2PlayerBgmStop() {
  _b2PlayerBgmActive = false;
  _b2PlayerBgmPendingVid = null;
  if (_b2PlayerBgmKickTimer) { clearInterval(_b2PlayerBgmKickTimer); _b2PlayerBgmKickTimer = null; }
  try { if (_b2PlayerBgmPlayer) _b2PlayerBgmPlayer.stopVideo(); } catch (e) {}
  _b2PlayerBgmSyncControls();
}

// 컨트롤 패널의 🔊/🔇 토글 버튼에서 호출
function _b2PlayerBgmToggleMute() {
  if (!_b2PlayerBgmActive) return;
  _b2PlayerBgmVolume = _b2PlayerBgmVolume > 0 ? 0 : 50;
  _b2PlayerBgmApplyVol();
  try {
    const p = (typeof players !== 'undefined') ? players.find(x => x.name === _b2PlayerBgmCurName) : null;
    if (p) { p.bgmVolume = _b2PlayerBgmVolume; try { if (typeof save === 'function') save(); } catch (e) {} }
  } catch (e) {}
  _b2PlayerBgmSyncControls();
}

function _b2PlayerBgmSyncControls() {
  const btn = document.getElementById('b2-bgm-toggle-btn');
  if (btn) {
    btn.style.display = _b2PlayerBgmActive ? 'inline-flex' : 'none';
    btn.textContent = (_b2PlayerBgmVolume > 0) ? '🔊' : '🔇';
  }
}

try {
  window._b2PlayerBgmStart = _b2PlayerBgmStart;
  window._b2PlayerBgmStop = _b2PlayerBgmStop;
  window._b2PlayerBgmToggleMute = _b2PlayerBgmToggleMute;
} catch (e) {}
