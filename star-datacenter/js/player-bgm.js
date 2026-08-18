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

// [REMOVED-BGM-TOGGLE-BTN] 우측 하단 떠있는 🎵/🔇 토글 버튼 요청으로 제거.
// BGM 재생/음소거/볼륨/자동재생 로직 자체는 그대로 유지하고, 화면에 뜨는
// 버튼만 없앤다(더 이상 생성/표시하지 않음).
function _plyrBgmToggleBtnEnsure() {
  try{ const old = document.getElementById('plyrBgmToggleBtn'); if (old) old.remove(); }catch(e){}
  return null;
}

function _plyrBgmToggleBtnSync() {
  // 버튼을 더 이상 만들지 않으므로 할 일이 없음
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
  // [FIX-BGM-UNMUTE-GESTURE] 예전엔 일단 mute()로 재생을 시작해두고, 뒤이어 도는
  // setInterval에서 "재생 상태(state===1)가 확인되면" 그제서야 unMute()를 호출했다.
  // 문제는 브라우저의 소리 있는 자동재생 정책상 unMute()/setVolume() 같은 "음소거
  // 해제" 호출은 반드시 사용자 제스처(클릭 등) *그 안에서* 일어나야 인정되는데,
  // setInterval 콜백은 별개의 타이머 태스크라 제스처와 무관하게 취급된다. 그 결과
  // 스트리머를 클릭해서 선택해도(그 클릭 자체가 정당한 제스처인데도) 소리는 계속
  // 안 나고, 그 뒤에 아무 데나 한 번 더 눌러야(=진짜 새 클릭 이벤트 안에서 처리되는
  // _plyrBgmArmGestureUnlock 쪽에서 재시도) 비로소 소리가 나는 문제가 있었음.
  // 수정: 이 함수가 실제로는 대부분 방금 일어난 클릭(스트리머 선택)의 호출 체인
  // 안에서 실행되므로, 음소거 후 나중에 푸는 방식 대신 처음부터 정상 볼륨으로
  // 즉시 재생을 시도한다. 그 클릭이 유효한 제스처라면 바로 소리가 난다.
  try {
    if (_plyrBgmUserOff) { p.mute && p.mute(); }
    else { _plyrBgmApplyVol(); }
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
  // [FIX-BGM-AUTOPLAY] 위 시도가 제스처와 무관한 상황(예: 탭 복귀, 팝업 자동 열림
  // 등)에서 호출되어 브라우저가 재생 자체를 막은 경우를 대비한 안전장치. 사용자가
  // 화면 아무 곳이나 한 번 클릭/터치하면 그 제스처를 이용해 즉시 재생+볼륨 복구를
  // 강제로 시도한다. 이미 재생 중이면 아무 효과 없음.
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
      // 재생은 이미 위에서 정상 볼륨으로 시도했으므로 여기선 상태 재확인만 하고
      // 혹시 볼륨이 어긋난 경우에 한해 다시 맞춰준다(무음 강제 해제 목적 아님).
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
// context: 'popup'(상세 팝업) | 'profile'(현황판 프로필탭). 스트리머별로 재생 위치를
// 제한해뒀으면(p.bgmScope) 그 위치가 아닐 때는 재생하지 않는다.
// 등록된 BGM 링크가 없거나 이 컨텍스트에서 재생하지 않도록 설정돼 있으면 정지한다.
function _plyrBgmStart(player, context) {
  try {
    const name = player ? String(player.name || '') : '';
    let vid = player ? _plyrBgmExtractId(player.bgmUrl) : '';
    const scope = player ? String(player.bgmScope || 'both') : 'both';
    if (vid && context && scope !== 'both' && scope !== context) vid = ''; // 이 위치에서는 재생 안 함
    if (!vid) {
      // 이 스트리머는 BGM이 없음(또는 이 위치에서 재생 안 함) — 재생 중이던 다른 스트리머 BGM만 정지
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
    if (sel && b2Visible) { _plyrBgmStart(sel, 'profile'); }
    else { _plyrBgmStop(); }
  } catch (e) { try { _plyrBgmStop(); } catch (e2) {} }
}

/* ── 🔥 사전 준비(워밍업), 기능추가 2026-08-18 ──────────────────────────
   증상: 프로필탭에 처음 들어갔을 때(=탭/버튼 클릭 직후) BGM이 소리 없이
   재생되거나 아예 안 켜지고, 그 뒤에 아무 버튼(예: 설정)을 한번 더 눌러야
   비로소 소리가 남.
   원인: 유튜브 IFrame API 스크립트 로드 + YT.Player 생성이 그 자리에서
   비동기로 처음 이뤄지는데, 이 초기화가 끝나기까지 걸리는 시간(수백ms~수초)
   동안 최초 클릭이 만들어준 "사용자 제스처(user activation)" 유효 시간이
   지나가버려, 뒤늦게 호출되는 playVideo()+unMute()가 브라우저의 소리 있는
   자동재생 정책에 막힌다. 이후 아무 곳이나 다시 클릭하면 이미 만들어져 있는
   플레이어에 대해 그 새 클릭 이벤트 안에서 바로 재생을 시도하므로 정상적으로
   소리가 남 — 즉 "설정" 버튼 자체가 특별한 게 아니라, 플레이어가 이미 준비된
   상태에서 발생하는 그 어떤 클릭이든 트리거가 된다.
   대응: 페이지 로드 시점에 아무 영상도 지정하지 않은 채로 미리 IFrame API를
   불러오고 히든 플레이어를 만들어둔다. 실제 재생 시점엔 이미 준비가 끝나있어
   loadVideoById + playVideo만 즉시 실행되므로, 최초 클릭(프로필탭 진입 클릭)
   자체의 제스처 유효 시간 안에 재생이 끝나 소리가 정상적으로 난다. ── */
try {
  const _plyrBgmWarmup = () => { try { _plyrBgmEnsurePlayer(); } catch (e) {} };
  if (document.readyState === 'complete') {
    setTimeout(_plyrBgmWarmup, 300);
  } else {
    window.addEventListener('load', () => { setTimeout(_plyrBgmWarmup, 300); });
  }
} catch (e) {}
