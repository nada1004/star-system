/* ══════════════════════════════════════════════════════════════
   초기화 - 에러 배너/전역 에러 핸들러/공지팝업 (init.js 에서 분리, 2026-07-30)
   ══════════════════════════════════════════════════════════════ */

function showNoticePopup(){
  if(typeof notices==='undefined'||!notices.length) return;
  const active=notices.filter(n=>n.active);
  if(!active.length) return;
  const today=new Date().toLocaleDateString('ko-KR').replace(/\./g,'').replace(/ /g,'');
  // 공지별 개별 숨김 키 — 새 공지는 독립적으로 팝업됨
  const n=active.find(n=>!localStorage.getItem('su_nhide_'+n.id+'_'+today));
  if(!n) return;
  const todayKey='su_nhide_'+n.id+'_'+today;
  const titleEl=document.getElementById('notice-popup-title');
  const bodyEl=document.getElementById('notice-popup-body');
  const dateEl=document.getElementById('notice-popup-date');
  const iconEl=document.getElementById('notice-popup-type-icon');
  const headerEl=document.getElementById('notice-popup-header');
  if(!titleEl||!bodyEl) return;
  titleEl.textContent=n.title||'공지';
  bodyEl.textContent=n.body||'';
  dateEl.textContent=n.date||'';
  iconEl.textContent=n.type||'📢';
  // 타입별 헤더 색상
  const colors={'🔥':'linear-gradient(135deg,#991b1b,#dc2626)','⚠️':'linear-gradient(135deg,#92400e,#d97706)','🎉':'linear-gradient(135deg,#065f46,#059669)'};
  if(headerEl) headerEl.style.background=colors[n.type]||'linear-gradient(135deg,#1e3a8a,#2563eb)';
  window._noticePopupHideKey=todayKey;
  om('noticePopupModal');
}
try{
  const _cfgRemotePolicy = localStorage.getItem('su_cfg_remote_policy_v2');
  if(_cfgRemotePolicy !== '1'){
    localStorage.setItem('su_cfg_remote_auto', '1');
    localStorage.setItem('su_cfg_remote_policy_v2', '1');
  }
}catch(e){}
function closeNoticePopup(){
  const chk=document.getElementById('notice-no-show-today');
  if(chk&&chk.checked&&window._noticePopupHideKey){
    localStorage.setItem(window._noticePopupHideKey,'1');
  }
  cm('noticePopupModal');
}
let _appErrorBannerEl = null;
let _lastGlobalErrorMsg = '';
let _lastGlobalErrorAt = 0;
function _ensureAppErrorBanner(){
  try{
    if(_appErrorBannerEl && document.body.contains(_appErrorBannerEl)) return _appErrorBannerEl;
    const el = document.createElement('div');
    el.id = 'app-error-banner';
    el.style.cssText = 'position:fixed;top:12px;left:50%;transform:translateX(-50%);z-index:99999;display:none;max-width:min(92vw,720px);width:max-content;background:#7f1d1d;color:#fff;border:1px solid rgba(255,255,255,.18);box-shadow:0 10px 30px rgba(0,0,0,.24);border-radius:14px;padding:10px 14px;font-size:var(--fs-base);line-height:1.45;align-items:center;gap:10px';
    const msg = document.createElement('div');
    msg.id = 'app-error-banner-msg';
    msg.style.cssText = 'font-weight:700;letter-spacing:-.2px';
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = '닫기';
    btn.style.cssText = 'border:none;background:rgba(255,255,255,.16);color:#fff;border-radius:999px;padding:6px 10px;font-size:var(--fs-sm);font-weight:700;cursor:pointer;flex-shrink:0';
    btn.onclick = ()=>{ try{ el.style.display='none'; }catch(e){} };
    el.appendChild(msg);
    el.appendChild(btn);
    document.body.appendChild(el);
    _appErrorBannerEl = el;
    return el;
  }catch(e){
    return null;
  }
}
window._showGlobalAppError = function(message, opts){
  try{
    const msg = String(message || '오류가 발생했습니다. 새로고침 후 다시 시도해주세요.');
    const now = Date.now();
    if(msg === _lastGlobalErrorMsg && (now - _lastGlobalErrorAt) < 2500) return;
    _lastGlobalErrorMsg = msg;
    _lastGlobalErrorAt = now;
    const el = _ensureAppErrorBanner();
    if(el){
      const box = el.querySelector('#app-error-banner-msg');
      if(box) box.textContent = msg;
      el.style.display = 'flex';
    }
    try{ if(typeof showToast === 'function') showToast(msg, 3200); }catch(e){}
    if(opts && opts.renderFallback){
      const C = document.getElementById('rcont');
      if(C && !String(C.innerHTML||'').trim()){
        C.innerHTML = `
          <div class="empty-state">
            <div class="empty-state-icon">⚠️</div>
            <div class="empty-state-title">화면을 그리는 중 오류가 발생했습니다</div>
            <div class="empty-state-desc">새로고침 후 다시 시도해주세요. 문제가 계속되면 최근 작업을 확인해주세요.</div>
          </div>
        `;
      }
    }
  }catch(e){}
};
window.addEventListener('error', (event)=>{
  try{
    const msg = (event && event.message) ? String(event.message) : '';
    // "Script error."는 cross-origin 스크립트의 CORS 보안 메시지 — 실제 오류 내용이 없으므로 무시
    if(!msg || msg === 'Script error.' || msg === 'Script error') return;
    // 파일명/줄/열 정보를 함께 표시 — 어디서 난 오류인지 바로 알 수 있도록
    let loc = '';
    try{
      const fname = event && event.filename ? String(event.filename).split('/').pop() : '';
      if(fname) loc = ` (${fname}:${event.lineno||'?'}:${event.colno||'?'})`;
    }catch(e2){}
    const message = `오류가 발생했습니다: ${msg}${loc}`;
    // 콘솔에도 상세히 남겨서 개발자가 스택트레이스까지 확인 가능하도록
    try{ console.error('[전역 오류]', msg, loc, event && event.error); }catch(e3){}
    window._showGlobalAppError(message);
  }catch(e){}
});
window.addEventListener('unhandledrejection', (event)=>{
  try{
    const reason = event && event.reason;
    const detail = typeof reason === 'string'
      ? reason
      : (reason && reason.message) ? reason.message : '비동기 처리 중 오류가 발생했습니다.';
    window._showGlobalAppError(`오류가 발생했습니다: ${detail}`);
  }catch(e){}
});

// 설정 변경을 다른 기기에 자동 반영하기 위한 로컬스토리지 변경 감지(동기화 enabled + 관리자+토큰이면 자동 push)
try{
  if(!window._suLsSyncHooked){
    window._suLsSyncHooked = true;
    const _origSet = localStorage.setItem ? localStorage.setItem.bind(localStorage) : null;
    const _origRem = localStorage.removeItem ? localStorage.removeItem.bind(localStorage) : null;
    let _lsGuard = false;
    const _isSyncKey = (k)=>{
      if(!k || typeof k!=='string') return false;
      if(k === 'su_sync_prefs_updated_at') return false;
      if(k === 'su_sync_last_pull' || k === 'su_sync_last_push' || k === 'su_sync_last_error') return false;
      if(k === 'al_github_token' || k === 'su_gh_token' || k === 'su_fb_pw' || k === 'su_admin_hash' || k === 'su_admin_hashes') return false;
      return k.startsWith('su_') || k.startsWith('cfg_') || k.startsWith('al_');
    };
    const _touch = ()=>{
      if(_lsGuard) return;
      _lsGuard = true;
      try{
        if(window.SettingsStore && typeof window.SettingsStore.markPrefsChanged==='function'){
          window.SettingsStore.markPrefsChanged();
        }
      }catch(e){}
      _lsGuard = false;
    };
    if(_origSet){
      localStorage.setItem = function(k,v){
        _origSet(String(k), String(v));
        try{ if(_isSyncKey(k)) _touch(); }catch(e){}
      };
    }
    if(_origRem){
      localStorage.removeItem = function(k){
        _origRem(String(k));
        try{ if(_isSyncKey(k)) _touch(); }catch(e){}
      };
    }
  }
}catch(e){}

// ─────────────────────────────────────────────────────────────
// (요청사항) 가로 "드래그 메뉴" 지원
// - overflow-x:auto 인 메뉴 바를 마우스로 클릭-드래그 해서 스크롤 가능하게
// - render() 이후 동적으로 생성되는 요소에도 적용됨 (render-core.js에서 호출)
