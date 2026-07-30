/* ══════════════════════════════════════════════════════════════
   인증 - 세션 상태/로그인 실패 잠금 관리 (auth.js 에서 분리, 2026-07-30)
   ══════════════════════════════════════════════════════════════ */

function _getSessionLastSeenAt(){
  try{
    return Math.max(
      Number(localStorage.getItem('su_session_last_active_at')||0) || 0,
      Number(localStorage.getItem('su_session_login_at')||0) || 0
    );
  }catch(e){
    return 0;
  }
}
window.createAdminAccountRecord = createAdminAccountRecord;
window.hasAdminAccounts = hasAdminAccounts;
window.hasPrimaryAdmin = hasPrimaryAdmin;
window.pullAdminAccountsRemote = pullAdminAccountsRemote;
window.pushAdminAccountsRemote = pushAdminAccountsRemote;
window.isRemoteAdminAuthorityReady = function(){
  return _getAdminRemoteSyncState() === 'ok';
};
async function refreshSessionAuthority(forcePull){
  if(localStorage.getItem('su_session') !== '1') return false;
  try{
    if(forcePull) await pullAdminAccountsRemote(true);
    const acct = _getSessionAccountFromCache();
    if(!acct){
      isLoggedIn=false;
      isSubAdmin=false;
      _clearSessionStorage();
      return false;
    }
    _syncSessionRoleFromAccount(acct);
    return true;
  }catch(e){
    console.warn('[refreshSessionAuthority] failed:', e.message);
    // 예외 발생 시 세션 쿠키가 없으면 로그인 상태 강제 해제
    if(localStorage.getItem('su_session') !== '1'){
      isLoggedIn = false;
      isSubAdmin = false;
      return false;
    }
    return !!_getSessionAccountFromCache();
  }
}
window.refreshSessionAuthority = refreshSessionAuthority;
window.canManageAdminSettings = function(){
  if(!(typeof isLoggedIn!=='undefined' && isLoggedIn) || (typeof isSubAdmin!=='undefined' && isSubAdmin)) return false;
  return !!_getSessionAccountFromCache();
};
window.canEditMatchRecords = function(){
  return !!(typeof isLoggedIn!=='undefined' && isLoggedIn) && !!_getSessionAccountFromCache();
};
function _isSessionExpired(){
  if(localStorage.getItem('su_session') !== '1') return false;
  const lastSeen = _getSessionLastSeenAt();
  if(!lastSeen) return true;
  return (Date.now() - lastSeen) > SESSION_MAX_AGE_MS;
}
function _touchSessionActivity(force){
  try{
    if(localStorage.getItem('su_session') !== '1') return;
    const now = Date.now();
    const prev = Number(localStorage.getItem('su_session_last_active_at')||0) || 0;
    if(force || !prev || (now - prev) > 5 * 60 * 1000){
      localStorage.setItem('su_session_last_active_at', String(now));
    }
  }catch(e){}
}
function _syncSessionStateAtBoot(){
  try{
    if(_isSessionExpired()) _clearSessionStorage();
    // 명시적 로그아웃 플래그가 있으면 세션 완전 정리
    if(localStorage.getItem('su_explicit_logout')==='1') _clearSessionStorage();
  }catch(e){}
}
function _getLoginFailInfo(){
  try{
    const raw = JSON.parse(localStorage.getItem(LOGIN_FAIL_KEY)||'{}') || {};
    return {
      count: Number(raw.count||0) || 0,
      lockUntil: Number(raw.lockUntil||0) || 0
    };
  }catch(e){
    return { count:0, lockUntil:0 };
  }
}
function _setLoginFailInfo(info){
  try{ localStorage.setItem(LOGIN_FAIL_KEY, JSON.stringify({ count:Number(info.count||0)||0, lockUntil:Number(info.lockUntil||0)||0 })); }catch(e){}
}
function _clearLoginFailInfo(){
  try{ localStorage.removeItem(LOGIN_FAIL_KEY); }catch(e){}
}
function _getLoginLockRemainingMs(){
  const info = _getLoginFailInfo();
  return Math.max(0, (Number(info.lockUntil||0)||0) - Date.now());
}
function _recordLoginFailure(){
  const info = _getLoginFailInfo();
  const nextCount = (Number(info.count||0) || 0) + 1;
  const lockUntil = nextCount >= LOGIN_FAIL_MAX ? (Date.now() + LOGIN_LOCK_MS) : 0;
  _setLoginFailInfo({ count: lockUntil ? 0 : nextCount, lockUntil });
  return { count: nextCount, lockUntil };
}
_syncSessionStateAtBoot();
// [FIX] _syncSessionStateAtBoot() 이후 su_session 재확인 + 만료 세션도 거부
let isLoggedIn=(function(){
  if(localStorage.getItem('su_session')!=='1') return false;
  if(localStorage.getItem('su_explicit_logout')==='1') return false;
  // 세션 최종 활동시각 확인: 한 번도 활동 기록이 없으면(= loginAt도 없으면) 거짓
  const _lastSeen = Math.max(
    Number(localStorage.getItem('su_session_last_active_at')||0)||0,
    Number(localStorage.getItem('su_session_login_at')||0)||0
  );
  if(!_lastSeen) return false;  // 활동기록 없는 고아 세션 → 자동 로그인 차단
  if((Date.now() - _lastSeen) > SESSION_MAX_AGE_MS){ _clearSessionStorage(); return false; }
  return true;
})();
let isSubAdmin=isLoggedIn && localStorage.getItem('su_session_role')==='sub-admin';
// 로드 즉시 window에도 동기화 (applyLoginState 호출 전에 sw() 등이 window.isLoggedIn 참조하는 경우 대비)
try{ window.isLoggedIn = isLoggedIn; window.isSubAdmin = isSubAdmin; }catch(e){}
window._authInitPromise = null;

// ── 설정 탭 즉시 가시성 적용 (applyLoginState 호출 전 깜박임 방지) ──
// auth.js 로드 시점에 isLoggedIn/isSubAdmin 값을 기반으로 즉시 display를 결정한다.
// _syncSessionStateAtBoot()가 만료 세션을 지웠을 경우 isLoggedIn도 함께 보정한다.
(function _earlyApplyCfgTab(){
  try{
    // 세션이 실제로 유효한지 재확인 (만료된 세션이 남아있을 경우 대비)
    if(isLoggedIn && _isSessionExpired()){
      isLoggedIn = false;
      isSubAdmin = false;
    }
    const _el = document.getElementById('tabCfg');
    if(_el) _el.style.display = (isLoggedIn && !isSubAdmin) ? 'flex' : 'none';
  }catch(e){
    // 오류 시 안전하게 숨김
    try{ const _el=document.getElementById('tabCfg'); if(_el) _el.style.display='none'; }catch(_){}
  }
})();

