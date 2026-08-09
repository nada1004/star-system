/* ══════════════════════════════════════════════════════════════
   인증 - 관리자 계정 원격 동기화(pull/push) (auth.js 에서 분리, 2026-07-30)
   ══════════════════════════════════════════════════════════════ */

async function pullAdminAccountsRemote(force){
  const urls = [_adminSameOriginUrl(), _adminRepoRawUrl(), _adminRepoCdnUrl(), _adminRepoApiUrl()].filter(Boolean);
  let payload = null;
  let saw404 = false;
  let sawNetworkError = false;
  for(const base of urls){
    try{
      const res = await fetch(base + '?_=' + Date.now(), { cache:'no-store', mode:'cors' });
      if(!res.ok){
        if(res.status === 404) saw404 = true;
        else sawNetworkError = true;
        continue;
      }
      const txt = (await res.text()).replace(/^\uFEFF/, '').trim();
      if(!txt || txt.startsWith('<')) continue;
      let raw = JSON.parse(txt);
      if(raw && raw.content && raw.encoding === 'base64'){
        const bin = atob(String(raw.content||'').replace(/\s/g,''));
        const bytes = new Uint8Array(bin.length);
        for(let i=0;i<bin.length;i++) bytes[i] = bin.charCodeAt(i);
        raw = JSON.parse(new TextDecoder('utf-8').decode(bytes));
      }
      if(raw && Array.isArray(raw.accounts)) { payload = raw; break; }
    }catch(e){ sawNetworkError = true; }
  }
  if(!payload || !Array.isArray(payload.accounts)){
    if(saw404){
      try{
        localStorage.setItem(ADMIN_HASH_KEY, JSON.stringify([]));
        localStorage.removeItem(LEGACY_ADMIN_HASH_KEY);
        _setLocalAdminUpdatedAt(Date.now());
      }catch(e){}
      _cleanupLegacyAdminArtifacts();
      _setAdminRemoteSyncState('missing');
    }else if(sawNetworkError){
      _setAdminRemoteSyncState('error');
    }else{
      _setAdminRemoteSyncState('invalid');
    }
    return false;
  }
  const remoteUpdatedAt = Number(payload.updatedAt||0) || Date.now();
  _setAdminRemoteSyncState('ok');
  if(!force && remoteUpdatedAt && remoteUpdatedAt <= _getLocalAdminUpdatedAt()) return true;
  try{
    localStorage.setItem(ADMIN_HASH_KEY, JSON.stringify(payload.accounts||[]));
    _setLocalAdminUpdatedAt(remoteUpdatedAt);
    localStorage.removeItem(LEGACY_ADMIN_HASH_KEY);
  }catch(e){}
  _cleanupLegacyAdminArtifacts();
  return true;
}
async function pushAdminAccountsRemote(accounts){
  const token = (localStorage.getItem('su_gh_token') || '').trim();
  if(!token) return false;
  const payload = {
    updatedAt: Date.now(),
    accounts: Array.isArray(accounts) ? accounts : []
  };
  const apiUrl = _adminRepoApiUrl();
  if(!apiUrl) return false;
  let sha;
  try{
    const getRes = await fetch(apiUrl, {
      headers: { 'Authorization': `token ${token}`, 'Accept': 'application/vnd.github.v3+json' }
    });
    if(getRes.ok){
      const fileInfo = await getRes.json();
      sha = fileInfo && fileInfo.sha;
    }else if(getRes.status !== 404){
      throw new Error('관리자 계정 원격 조회 실패: ' + getRes.status);
    }
    const body = {
      message: `admin accounts update ${new Date().toLocaleString('ko-KR')}`,
      content: btoa(unescape(encodeURIComponent(JSON.stringify(payload, null, 2)))),
      branch: GH_BRANCH
    };
    if(sha) body.sha = sha;
    const putRes = await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    if(!putRes.ok) throw new Error('관리자 계정 원격 저장 실패: ' + putRes.status);
    _setLocalAdminUpdatedAt(payload.updatedAt);
    try{
      if(window.SettingsStore && typeof window.SettingsStore.emitSignal === 'function'){
        await window.SettingsStore.emitSignal('admin-accounts');
      }
    }catch(e){}
    return true;
  }catch(e){
    console.warn('[pushAdminAccountsRemote] failed:', e.message);
    return false;
  }
}
function hasPrimaryAdmin(){
  return getAdminAccounts().some(a => (a && a.role) !== 'sub-admin');
}
function hasAdminAccounts(){
  return getAdminAccounts().length > 0;
}
async function initLoginHash(){
  const raw=localStorage.getItem(ADMIN_HASH_KEY);
  if(!raw){
    const oldH=localStorage.getItem(LEGACY_ADMIN_HASH_KEY);
    const arr=oldH?[{hash:oldH,role:'admin',label:'(기존관리자)'}]:[];
    _persistAdminAccounts(arr);
  }
  // 구 포맷 마이그레이션: 문자열 배열 → 객체 배열
  try{
    const parsed=JSON.parse(raw);
    if(Array.isArray(parsed)&&parsed.length>0&&typeof parsed[0]==='string'){
      const migrated=parsed.map((h,i)=>({hash:h,role:'admin',label:`관리자${i+1}`}));
      _persistAdminAccounts(migrated);
    }
  }catch(e){
    console.warn('[initLoginHash] 관리자 계정 마이그레이션 실패:', e.message);
  }
  _cleanupLegacyAdminArtifacts();
  try{ await pullAdminAccountsRemote(false); }catch(e){}
  _cleanupLegacyAdminArtifacts();
}
function getAdminAccounts(){
  try{
    const raw=localStorage.getItem(ADMIN_HASH_KEY);
    if(!raw)return [];
    const parsed=JSON.parse(raw);
    if(!Array.isArray(parsed))return [];
    // 구 포맷 호환
    return parsed.map((item,i)=>typeof item==='string'?{hash:item,role:'admin',label:`관리자${i+1}`}:item);
  }catch{return [];}
}
function _getSessionAccountFromCache(){
  const sid=_getSessionIdHash();
  if(!sid) return null;
  return getAdminAccounts().find(a=>String(a&&a.idHash||'')===sid) || null;
}
function _syncSessionRoleFromAccount(acct){
  if(!acct) return false;
  // su_session 키가 없으면 로그인 상태로 올리지 않음 (원천 차단)
  if(localStorage.getItem('su_session') !== '1') return false;
  const role=(acct.role==='sub-admin')?'sub-admin':'admin';
  isLoggedIn=true;
  isSubAdmin=(role==='sub-admin');
  try{ localStorage.setItem('su_session_role', role); }catch(e){}
  return true;
}
function getAdminHashes(){
  return getAdminAccounts().map(a=>a.hash);
}
async function deleteAdminAccount(idx){
  if(!(typeof window.canManageAdminSettings==='function' ? window.canManageAdminSettings() : (isLoggedIn&&!isSubAdmin))){ alert('총관리자만 계정을 관리할 수 있습니다.'); return; }
  const token = (localStorage.getItem('su_gh_token')||'').trim();
  if(!token){ alert('원격 관리자 계정 관리를 위해 GitHub 토큰을 먼저 설정해 주세요.'); return; }
  try{ await pullAdminAccountsRemote(true); }catch(e){}
  if(!confirm('이 계정을 삭제할까요?'))return;
  const accounts=getAdminAccounts();
  const target = accounts[idx];
  const adminCount = accounts.filter(a=>a && a.role!=='sub-admin').length;
  if(target && target.role!=='sub-admin' && adminCount<=1){alert('총관리자 계정은 1명 이상 있어야 합니다.');return;}
  const next = accounts.slice();
  next.splice(idx,1);
  _persistAdminAccounts(next);
  const ok = await pushAdminAccountsRemote(next);
  if(!ok){
    _persistAdminAccounts(accounts);
    alert('원격 관리자 계정 저장에 실패했습니다. 잠시 후 다시 시도해 주세요.');
    return;
  }
  await refreshSessionAuthority(false);
  if(typeof reCfg==='function')reCfg();
}
const SESSION_MAX_AGE_MS = 24 * 60 * 60 * 1000;
const LOGIN_FAIL_KEY = 'su_login_fail_info';
const LOGIN_FAIL_MAX = 5;
const LOGIN_LOCK_MS = 30 * 1000;
function _clearSessionStorage(){
  try{
    localStorage.removeItem('su_session');
    localStorage.removeItem('su_session_role');
    localStorage.removeItem(SESSION_ID_HASH_KEY);
    localStorage.removeItem('su_session_login_at');
    localStorage.removeItem('su_session_last_active_at');
  }catch(e){}
}
