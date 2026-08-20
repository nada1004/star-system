/* ══════════════════════════════════════════════════════════════
   settings-univ-bgm.js — 설정탭: 🎓 대학별 BGM 설정 (통합 관리)
   ------------------------------------------------------------------
   - 기존에는 대학마다 "대학 정보 수정" 팝업을 하나씩 열어야 BGM 링크/볼륨을
     등록할 수 있었다(js/render-univ-actions.js). 여기서는 설정탭 한 화면에서
     모든 대학의 BGM URL·개별 볼륨을 한 번에 보고 등록할 수 있게 한다.
   - 데이터는 동일한 필드(univCfg[i].bgmUrl / bgmVolume)를 그대로 공유하므로
     여기서 저장해도, 여기서 지워도 "대학 정보 수정" 팝업과 완전히 동기화된다.
   - 추가로 모든 대학에 공통 적용되는 "공통(전체) 볼륨" 배율을 두어, 개별
     대학 볼륨에 곱해서 최종 재생 볼륨을 낸다 (0~100%, 기본 100%).
   - 설정탭에서 링크를 바로 들어볼 수 있는 "미리듣기" 버튼 제공. 실제
     "소개연출" 재생(js/board2-univ-views-lineup.js)과는 완전히 분리된
     별도 유튜브 플레이어 인스턴스를 사용해 서로 간섭하지 않는다.
   ══════════════════════════════════════════════════════════════ */

// ── 공통(전체) 볼륨 배율 — 0~100(%). 각 대학 개별 볼륨에 곱해 최종 볼륨을 낸다. ──
window.getUnivBgmMasterVol = function () {
  let v;
  try { v = parseInt(localStorage.getItem('su_univbgm_master_vol') ?? '100', 10); } catch (e) { v = 100; }
  return Number.isFinite(v) ? Math.max(0, Math.min(100, v)) : 100;
};

// 개별 볼륨 × 공통(전체) 볼륨 배율 → 실제 재생 볼륨(0~100)
window.getUnivBgmEffectiveVol = function (rawVol) {
  const base = Number.isFinite(parseInt(rawVol, 10)) ? Math.max(0, Math.min(100, parseInt(rawVol, 10))) : 50;
  const master = window.getUnivBgmMasterVol();
  return Math.round(base * master / 100);
};

window.cfgSaveUnivBgmMasterVol = function (v) {
  const n = Math.max(0, Math.min(100, parseInt(v, 10) || 0));
  try { localStorage.setItem('su_univbgm_master_vol', String(n)); } catch (e) {}
  // 지금 재생 중인 "소개연출" BGM에도 즉시 반영
  try { if (typeof window._b2LineupBgmApplyVol === 'function') window._b2LineupBgmApplyVol(); } catch (e) {}
  // 설정탭 미리듣기에도 즉시 반영
  try { _cfgUnivBgmPreviewApplyVol(); } catch (e) {}
  try { window._scheduleCloudAppSettingsSave && window._scheduleCloudAppSettingsSave(); } catch (e) {}
};

// 대학 한 줄(행)의 BGM URL/볼륨을 입력값 기준으로 저장
window.cfgSaveUnivBgmRow = function (i) {
  try {
    const list = Array.isArray(window.univCfg) ? window.univCfg : (typeof univCfg !== 'undefined' ? univCfg : []);
    const u = list[i];
    if (!u) return;
    const urlInp = document.getElementById('cfg-univbgm-url-' + i);
    const volInp = document.getElementById('cfg-univbgm-vol-' + i);
    const url = String(urlInp && urlInp.value || '').trim();
    const vol = Math.max(0, Math.min(100, parseInt(volInp && volInp.value || '50', 10) || 50));
    if (url) { u.bgmUrl = url; u.bgmVolume = vol; }
    else { delete u.bgmUrl; delete u.bgmVolume; }
    try { typeof save === 'function' && save(); } catch (e) {}
    if (!url && _cfgUnivBgmPreviewIdx === i) _cfgUnivBgmPreviewStop();
    try { typeof showToast === 'function' && showToast('저장됨'); } catch (e) {}
  } catch (e) {}
};

// ── 설정탭 전용 미리듣기 플레이어 (라인업/현황판 BGM과 완전 분리된 별도 인스턴스) ──
var _cfgUnivBgmPreviewPlayer = null;
var _cfgUnivBgmPreviewReady = false;
var _cfgUnivBgmPreviewApiLoading = false;
var _cfgUnivBgmPreviewPendingVid = null;
var _cfgUnivBgmPreviewIdx = -1;

function _cfgUnivBgmExtractId(urlOrId) {
  const s = String(urlOrId || '').trim();
  if (!s) return '';
  if (/^[a-zA-Z0-9_-]{8,15}$/.test(s) && !s.includes('/')) return s;
  const m1 = s.match(/[?&]v=([a-zA-Z0-9_-]{8,15})/); if (m1) return m1[1];
  const m2 = s.match(/youtu\.be\/([a-zA-Z0-9_-]{8,15})/); if (m2) return m2[1];
  const m3 = s.match(/\/shorts\/([a-zA-Z0-9_-]{8,15})/); if (m3) return m3[1];
  const m4 = s.match(/\/embed\/([a-zA-Z0-9_-]{8,15})/); if (m4) return m4[1];
  return '';
}

function _cfgUnivBgmPreviewLoadApi() {
  return new Promise((resolve) => {
    if (window.YT && window.YT.Player) return resolve(true);
    const check = () => { if (window.YT && window.YT.Player) resolve(true); else setTimeout(check, 150); };
    if (!_cfgUnivBgmPreviewApiLoading) {
      _cfgUnivBgmPreviewApiLoading = true;
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

function _cfgUnivBgmPreviewEnsurePlayer() {
  return _cfgUnivBgmPreviewLoadApi().then(() => {
    if (_cfgUnivBgmPreviewPlayer) return _cfgUnivBgmPreviewPlayer;
    let host = document.getElementById('cfgUnivBgmPreviewHost');
    if (!host) {
      host = document.createElement('div');
      host.id = 'cfgUnivBgmPreviewHost';
      host.style.cssText = 'position:fixed;left:-9999px;top:-9999px;width:1px;height:1px;opacity:0;pointer-events:none;z-index:-1';
      document.body.appendChild(host);
    }
    _cfgUnivBgmPreviewPlayer = new YT.Player('cfgUnivBgmPreviewHost', {
      width: '1', height: '1', videoId: '',
      playerVars: { autoplay: 0, controls: 0, disablekb: 1, fs: 0, iv_load_policy: 3, modestbranding: 1, playsinline: 1, rel: 0 },
      events: {
        onReady: () => {
          _cfgUnivBgmPreviewReady = true;
          _cfgUnivBgmPreviewApplyVol();
          if (_cfgUnivBgmPreviewPendingVid) {
            const vid = _cfgUnivBgmPreviewPendingVid;
            _cfgUnivBgmPreviewPendingVid = null;
            _cfgUnivBgmPreviewPlayNow(vid);
          }
        },
        onStateChange: (e) => {
          // 미리듣기는 편의상 곡이 끝나면 처음부터 반복
          if (e.data === 0 && _cfgUnivBgmPreviewIdx >= 0) {
            try { _cfgUnivBgmPreviewPlayer.seekTo(0); _cfgUnivBgmPreviewPlayer.playVideo(); } catch (e2) {}
          }
        }
      }
    });
    return _cfgUnivBgmPreviewPlayer;
  });
}

function _cfgUnivBgmPreviewApplyVol() {
  if (!_cfgUnivBgmPreviewPlayer) return;
  try {
    const rowVolInp = _cfgUnivBgmPreviewIdx >= 0 ? document.getElementById('cfg-univbgm-vol-' + _cfgUnivBgmPreviewIdx) : null;
    const rawVol = rowVolInp ? parseInt(rowVolInp.value, 10) : 50;
    const v = window.getUnivBgmEffectiveVol(rawVol);
    if (v <= 0) { _cfgUnivBgmPreviewPlayer.mute && _cfgUnivBgmPreviewPlayer.mute(); }
    else { _cfgUnivBgmPreviewPlayer.unMute && _cfgUnivBgmPreviewPlayer.unMute(); }
    _cfgUnivBgmPreviewPlayer.setVolume(v);
  } catch (e) {}
}

function _cfgUnivBgmPreviewPlayNow(vid) {
  const p = _cfgUnivBgmPreviewPlayer;
  if (!p || !vid) return;
  try { _cfgUnivBgmPreviewApplyVol(); p.loadVideoById(vid); p.playVideo && p.playVideo(); } catch (e) {}
}

function _cfgUnivBgmPreviewSyncBtn() {
  try {
    document.querySelectorAll('[id^="cfg-univbgm-prev-btn-"]').forEach((btn) => {
      const idx = parseInt(btn.id.replace('cfg-univbgm-prev-btn-', ''), 10);
      btn.textContent = (idx === _cfgUnivBgmPreviewIdx) ? '⏸ 정지' : '▶ 미리듣기';
    });
  } catch (e) {}
}

function _cfgUnivBgmPreviewStop() {
  if (_cfgUnivBgmPreviewIdx === -1 && !_cfgUnivBgmPreviewPlayer) return;
  _cfgUnivBgmPreviewIdx = -1;
  try { _cfgUnivBgmPreviewPlayer && _cfgUnivBgmPreviewPlayer.stopVideo(); } catch (e) {}
  _cfgUnivBgmPreviewSyncBtn();
}

window.cfgPreviewUnivBgmToggle = function (i) {
  try {
    if (_cfgUnivBgmPreviewIdx === i) { _cfgUnivBgmPreviewStop(); return; }
    const urlInp = document.getElementById('cfg-univbgm-url-' + i);
    const url = String(urlInp && urlInp.value || '').trim();
    const vid = _cfgUnivBgmExtractId(url);
    if (!vid) {
      try { typeof showToast === 'function' ? showToast('유튜브 링크를 먼저 입력하세요.') : alert('유튜브 링크를 먼저 입력하세요.'); } catch (e) {}
      return;
    }
    _cfgUnivBgmPreviewIdx = i;
    _cfgUnivBgmPreviewSyncBtn();
    _cfgUnivBgmPreviewEnsurePlayer().then(() => {
      if (_cfgUnivBgmPreviewIdx !== i) return; // 그 사이 다른 행으로 바뀌었거나 정지됨
      if (_cfgUnivBgmPreviewReady) _cfgUnivBgmPreviewPlayNow(vid);
      else _cfgUnivBgmPreviewPendingVid = vid;
    });
  } catch (e) {}
};

try { window._cfgUnivBgmPreviewStop = _cfgUnivBgmPreviewStop; } catch (e) {}
