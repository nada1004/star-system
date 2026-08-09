/* ══════════════════════════════════════════════════════════════
   룰렛 - 메인 패널 네비게이션 (roulette.js 에서 분리, 2026-07-30)
   ══════════════════════════════════════════════════════════════ */

/* LAZY-LOADED — index.html에서 직접 로드되지 않음. 동적으로 필요시 로드 필요. */
// ─── 가챠 룰렛 시스템 ─────────────────────────────────────────────────────
function rRoulette(C, T) {
  T.textContent = '🎰 룰렛/게임';
  const avW = window.innerWidth;
  const avH = window.innerHeight - 130;
  const isWide = avW >= 700;
  const _dome = Math.max(190, Math.min(340, Math.round(isWide ? Math.min(avH * 0.48, avW * 0.28) : Math.min(avH * 0.38, avW * 0.7))));
  const _capR = Math.round(_dome * 0.076);
  window._GC_DOME = _dome;
  window._GC_CAP_R = _capR;

  // [Fix-4] players 비어있으면 구슬뽑기 탭 진입 시 경고 배너 + 재시도 버튼
  const _playersEmpty = (typeof players === 'undefined' || !Array.isArray(players) || players.length === 0);
  if (_playersEmpty && _gcTab === 'player') {
    const _pad = Math.max(14, Math.round(_dome * 0.085));
    C.innerHTML = renderRoulettePanel(_dome, _capR, isWide, avW, avH);
    // 탭바(상단 pill 바) 위에 경고 배너 삽입
    const _tabBarEl = C.querySelector('.fbar');
    if (_tabBarEl) {
      const _banner = document.createElement('div');
      _banner.id = 'gc-players-banner';
      _banner.style.cssText = 'background:#FFF7ED;border:2px solid #FED7AA;border-radius:12px;padding:14px 18px;margin-bottom:12px;display:flex;flex-direction:column;gap:8px';
      _banner.innerHTML = '<div style="font-size:14px;font-weight:800;color:#C2410C">⚠️ 스트리머 데이터 로드 실패</div>'
        + '<div style="font-size:var(--fs-sm);color:#92400E;line-height:1.6">구슬뽑기를 사용하려면 스트리머 목록이 필요합니다.<br>데이터를 불러오지 못했거나 아직 로딩 중입니다.</div>'
        + '<button onclick="location.reload()" style="align-self:flex-start;padding:7px 16px;border-radius:8px;border:none;background:#EA580C;color:#fff;font-size:var(--fs-sm);font-weight:700;cursor:pointer">🔄 페이지 새로고침</button>';
      C.insertBefore(_banner, C.firstChild);
    }
    // textarea 값 주입
    (function _injectTextareaValues() {
      var _gcInp = document.getElementById('gc-items-input');
      if (_gcInp) _gcInp.value = _rLsGet(_gcTab === 'player' ? 'su_gc_p' : 'su_gc_m', '');
      var _ldN = document.getElementById('ld-names-input');
      if (_ldN) _ldN.value = _rLsGet('su_ld_names', '');
      var _ldI = document.getElementById('ld-items-input');
      if (_ldI) _ldI.value = _rLsGet('su_ld_items', '');
      // 뽑기 당첨 내용(1~5등) 값 주입
      for (var k=1;k<=5;k++){
        var el = document.getElementById('ppg-prize-' + k);
        if (el) el.value = _rLsGet('su_ppg_prize_' + k, '');
      }
    })();
    if (_gcTab === 'ladder') { setTimeout(()=>{ try{ if(typeof _ldInit==='function') _ldInit(); }catch(e){} }, 60); }
    else if (_gcTab === 'duck') { setTimeout(()=>{ try{ if(typeof _drInit==='function') _drInit(); }catch(e){} }, 60); }
    else if (_gcTab === 'wheel') { setTimeout(()=>{ try{ if(typeof _whInit==='function') _whInit(); }catch(e){} }, 60); }
    else if (_gcTab === 'ppopgi') { setTimeout(()=>{ try{ if(typeof _ppgInit==='function') _ppgInit(); }catch(e){} }, 60); }
    else if (_gcTab === 'teammatch') { setTimeout(()=>{ try{ if(typeof _tmInit==='function') _tmInit(); }catch(e){} }, 60); }
    else if (_gcTab === 'tiermatch') { setTimeout(()=>{ try{ if(typeof _tiInit==='function') _tiInit(); }catch(e){} }, 60); }
    else if (_gcTab === 'quiz') { setTimeout(()=>{ try{ if(typeof _pqInit==='function') _pqInit(); }catch(e){} }, 60); }
    else if (_gcTab === 'memory') { setTimeout(()=>{ try{ if(typeof _mmInit==='function') _mmInit(); }catch(e){} }, 60); }
    else if (_gcTab === 'mole') { setTimeout(()=>{ try{ if(typeof _mwInit==='function') _mwInit(); }catch(e){} }, 60); }
    else if (_gcTab === 'omok') { setTimeout(()=>{ try{ if(typeof _omInit==='function') _omInit(); }catch(e){} }, 60); }
    else { setTimeout(()=>{ try{ if(typeof _gcSetup==='function') _gcSetup(); }catch(e){} }, 60); }
    return;
  }

  C.innerHTML = renderRoulettePanel(_dome, _capR, isWide, avW, avH);
  // [Fix-2] localStorage 값을 innerHTML 삽입 대신 .value로 안전하게 세팅 (XSS/DOM 깨짐 방지)
  (function _injectTextareaValues() {
    var _gcInp = document.getElementById('gc-items-input');
    if (_gcInp) _gcInp.value = _rLsGet(_gcTab === 'player' ? 'su_gc_p' : 'su_gc_m', '');
    var _ldN = document.getElementById('ld-names-input');
    if (_ldN) _ldN.value = _rLsGet('su_ld_names', '');
    var _ldI = document.getElementById('ld-items-input');
    if (_ldI) _ldI.value = _rLsGet('su_ld_items', '');
    // 뽑기 당첨 내용(1~5등) 값 주입
    for (var k=1;k<=5;k++){
      var el = document.getElementById('ppg-prize-' + k);
      if (el) el.value = _rLsGet('su_ppg_prize_' + k, '');
    }
  })();
  if (_gcTab === 'ladder') {
    setTimeout(()=>{ try{ if(typeof _ldInit==='function') _ldInit(); }catch(e){} }, 60);
  } else if (_gcTab === 'duck') {
    setTimeout(()=>{ try{ if(typeof _drInit==='function') _drInit(); }catch(e){} }, 60);
  } else if (_gcTab === 'wheel') {
    setTimeout(()=>{ try{ if(typeof _whInit==='function') _whInit(); }catch(e){} }, 60);
  } else if (_gcTab === 'ppopgi') {
    setTimeout(()=>{ try{ if(typeof _ppgInit==='function') _ppgInit(); }catch(e){} }, 60);
  } else if (_gcTab === 'teammatch') {
    setTimeout(()=>{ try{ if(typeof _tmInit==='function') _tmInit(); }catch(e){} }, 60);
  } else if (_gcTab === 'tiermatch') {
    setTimeout(()=>{ try{ if(typeof _tiInit==='function') _tiInit(); }catch(e){} }, 60);
  } else if (_gcTab === 'quiz') {
    setTimeout(()=>{ try{ if(typeof _pqInit==='function') _pqInit(); }catch(e){} }, 60);
  } else if (_gcTab === 'memory') {
    setTimeout(()=>{ try{ if(typeof _mmInit==='function') _mmInit(); }catch(e){} }, 60);
  } else if (_gcTab === 'mole') {
    setTimeout(()=>{ try{ if(typeof _mwInit==='function') _mwInit(); }catch(e){} }, 60);
  } else if (_gcTab === 'omok') {
    setTimeout(()=>{ try{ if(typeof _omInit==='function') _omInit(); }catch(e){} }, 60);
  } else {
    setTimeout(()=>{ try{ if(typeof _gcSetup==='function') _gcSetup(); }catch(e){} }, 60);
  }
  // (요청사항) 확률(%) 표시는 제거
}

(function _gcInjectCSS(){
  if (document.getElementById('gc-style')) return;
  const s = document.createElement('style');
  s.id = 'gc-style';
  s.textContent = '@keyframes gcConfettiFall{0%{transform:translateY(-20px) rotate(0deg);opacity:1}80%{opacity:1}100%{transform:translateY(100vh) rotate(800deg) scale(0.4);opacity:0}}'
    + '@keyframes gcBounceIcon{0%{transform:scale(0) rotate(-20deg)}60%{transform:scale(1.3) rotate(10deg)}80%{transform:scale(0.9) rotate(-5deg)}100%{transform:scale(1) rotate(0deg)}}'
    + '@keyframes gcCardAppear{0%{transform:scale(0.75) translateY(10px);opacity:0}100%{transform:scale(1) translateY(0);opacity:1}}'
    + '.gc-shell{position:relative}'
    + '.gc-shell::before{content:"";position:absolute;inset:0 10px auto 10px;height:220px;border-radius:28px;background:radial-gradient(circle at top left,rgba(96,165,250,.16),transparent 40%),radial-gradient(circle at top right,rgba(244,114,182,.14),transparent 42%);pointer-events:none}'
    + '.gc-hero{position:relative;display:flex;align-items:center;justify-content:space-between;gap:16px;padding:18px 20px;border:1px solid rgba(148,163,184,.18);border-radius:24px;background:linear-gradient(135deg,rgba(255,255,255,.97),rgba(248,250,252,.93));box-shadow:0 16px 38px rgba(15,23,42,.06),inset 0 1px 0 rgba(255,255,255,.85);margin-bottom:12px;backdrop-filter:blur(10px);overflow:hidden}'
    + '.gc-hero::after{content:"";position:absolute;left:0;top:0;bottom:0;width:5px;background:var(--gc-accent,linear-gradient(180deg,#60a5fa,#6366f1))}'
    + '.gc-hero-main{display:flex;align-items:flex-start;gap:14px;min-width:0}'
    + '.gc-hero-icon{flex-shrink:0;width:52px;height:52px;border-radius:var(--r2);display:flex;align-items:center;justify-content:center;font-size:26px;background:var(--gc-accent,linear-gradient(135deg,#60a5fa,#6366f1));box-shadow:0 8px 18px rgba(37,99,235,.28),inset 0 1px 0 rgba(255,255,255,.35);animation:gcCardAppear .35s ease both}'
    + '.gc-hero-copy{display:flex;flex-direction:column;gap:6px;min-width:0}'
    + '.gc-hero-kicker{font-size:var(--fs-caption);font-weight:900;letter-spacing:.08em;color:#2563eb;text-transform:uppercase}'
    + '.gc-hero-title{font-size:21px;font-weight:950;letter-spacing:-.03em;color:var(--text1);line-height:1.2}'
    + '.gc-hero-desc{font-size:12.5px;line-height:1.6;color:var(--text3);word-break:keep-all;max-width:52ch}'
    + '.gc-hero-badges{display:flex;flex-wrap:wrap;gap:8px;justify-content:flex-end;flex-shrink:0}'
    + '.gc-badge{display:inline-flex;align-items:center;gap:6px;padding:8px 12px;border-radius:999px;background:rgba(255,255,255,.86);border:1px solid rgba(148,163,184,.18);font-size:var(--fs-sm);font-weight:800;color:var(--text2);box-shadow:0 8px 20px rgba(15,23,42,.05);white-space:nowrap}'
    + '.gc-tabbar-card{position:relative;padding:10px 8px 8px;border:1px solid rgba(148,163,184,.18);border-radius:22px;background:linear-gradient(180deg,rgba(255,255,255,.92),rgba(248,250,252,.88));box-shadow:0 14px 30px rgba(15,23,42,.06);margin-bottom:14px}'
    + '.gc-tabbar-label{font-size:10.5px;font-weight:900;letter-spacing:.06em;color:var(--text3);text-transform:uppercase;padding:0 8px 6px;display:flex;align-items:center;gap:5px}'
    + '.gc-tabbar-scroll{position:relative}'
    + '.gc-tabbar-scroll::before,.gc-tabbar-scroll::after{content:"";position:absolute;top:0;bottom:0;width:18px;pointer-events:none;z-index:2}'
    + '.gc-tabbar-scroll::before{left:0;background:linear-gradient(90deg,rgba(248,250,252,.95),transparent)}'
    + '.gc-tabbar-scroll::after{right:0;background:linear-gradient(270deg,rgba(248,250,252,.95),transparent)}'
    + '.gc-tabbar-card .fbar{margin-bottom:0 !important;padding:2px}'
    + '.gc-card{background:linear-gradient(180deg,rgba(255,255,255,.98),rgba(248,250,252,.96));border:1px solid rgba(148,163,184,.18);border-radius:22px;box-shadow:0 16px 34px rgba(15,23,42,.06),inset 0 1px 0 rgba(255,255,255,.9)}'
    + '.gc-card-soft{position:relative;overflow:hidden}'
    + '.gc-card-soft::before{content:"";position:absolute;inset:auto -10% 65% auto;width:170px;height:170px;background:radial-gradient(circle,rgba(96,165,250,.16),transparent 68%);pointer-events:none}'
    + '.gc-stage-card{padding:18px;border-radius:26px;background:linear-gradient(180deg,rgba(255,255,255,.94),rgba(244,247,251,.92));border:1px solid rgba(148,163,184,.18);box-shadow:0 18px 38px rgba(15,23,42,.07)}'
    + '.gc-stage-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:16px}'
    + '.gc-stage-title{font-size:16px;font-weight:950;letter-spacing:-.02em;color:var(--text1)}'
    + '.gc-stage-desc{font-size:var(--fs-sm);color:var(--text3);line-height:1.55;margin-top:4px}'
    + '.gc-input-toggle{width:100%;padding:10px 14px;font-weight:900;border:1px solid rgba(148,163,184,.2);border-radius:var(--r2);background:linear-gradient(180deg,#fff,#f8fafc);color:var(--text2);cursor:pointer;transition:.15s;text-align:left;box-shadow:0 10px 20px rgba(15,23,42,.05)}'
    + '.gc-input-toggle:hover{transform:translateY(-1px);border-color:rgba(37,99,235,.26);box-shadow:0 14px 26px rgba(37,99,235,.08);color:#2563eb}'
    + '.gc-history-card{background:linear-gradient(180deg,rgba(255,255,255,.98),rgba(248,250,252,.96));border:1px solid rgba(148,163,184,.18);border-radius:18px;padding:14px 16px;box-shadow:0 14px 26px rgba(15,23,42,.05)}'
    + '.gc-history-item{display:flex;align-items:center;gap:8px;padding:8px 10px;background:rgba(255,255,255,.72);border:1px solid rgba(148,163,184,.12);border-radius:12px;font-size:var(--fs-base)}'
    + '.gc-wheel-root,.gc-duck-root{min-height:420px}'
    + 'body.dark .gc-shell::before{background:radial-gradient(circle at top left,rgba(59,130,246,.14),transparent 40%),radial-gradient(circle at top right,rgba(236,72,153,.12),transparent 42%)}'
    + 'body.dark .gc-hero,body.dark .gc-tabbar-card,body.dark .gc-card,body.dark .gc-stage-card,body.dark .gc-history-card{background:linear-gradient(180deg,rgba(15,23,42,.94),rgba(15,23,42,.9));border-color:#2d3f55;box-shadow:0 18px 36px rgba(0,0,0,.26),inset 0 1px 0 rgba(255,255,255,.03)}'
    + 'body.dark .gc-badge,body.dark .gc-history-item{background:rgba(30,41,59,.76);border-color:#334155;color:#cbd5e1}'
    + 'body.dark .gc-hero-title,body.dark .gc-stage-title{color:#f8fafc}'
    + 'body.dark .gc-hero-desc,body.dark .gc-stage-desc{color:#94a3b8}'
    + 'body.dark .gc-tabbar-label{color:#94a3b8}'
    + 'body.dark .gc-tabbar-scroll::before{background:linear-gradient(90deg,rgba(15,23,42,.95),transparent)}'
    + 'body.dark .gc-tabbar-scroll::after{background:linear-gradient(270deg,rgba(15,23,42,.95),transparent)}'
    + 'body.dark .gc-input-toggle{background:linear-gradient(180deg,#18263b,#0f172a);border-color:#334155;color:#cbd5e1;box-shadow:0 12px 24px rgba(0,0,0,.24)}'
    + 'body.dark .gc-input-toggle:hover{color:#93c5fd;border-color:#3b82f6}'
    + '@media (max-width:900px){.gc-hero-title{font-size:19px}.gc-hero-badges{justify-content:flex-start}.gc-tabbar-card{border-radius:18px}.gc-stage-card,.gc-card{border-radius:20px}}'
    + '@media (max-width:640px){.gc-shell::before{left:0;right:0;height:180px}.gc-hero{flex-direction:column;align-items:stretch;padding:16px;border-radius:20px}.gc-hero-main{align-items:center}.gc-hero-icon{width:44px;height:44px;font-size:22px;border-radius:14px}.gc-hero-title{font-size:17px}.gc-hero-desc{max-width:none}.gc-hero-badges{justify-content:flex-start}.gc-badge{font-size:var(--fs-caption);padding:7px 10px}.gc-stage-card{padding:14px}}';
  document.head.appendChild(s);
})();

