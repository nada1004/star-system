/* ══════════════════════════════════════
   로그인 시스템
══════════════════════════════════════ */
// SHA-256 암호화 (crypto.subtle 미지원 환경(file:// 등) 폴백 포함)
function _rightRotate(value, amount){ return (value >>> amount) | (value << (32 - amount)); }
function sha256Sync(ascii){
  const mathPow = Math.pow;
  const maxWord = mathPow(2, 32);
  const lengthProperty = 'length';
  let i, j;
  let result = '';
  const words = [];
  const asciiBitLength = ascii[lengthProperty] * 8;
  let hash = sha256Sync.h = sha256Sync.h || [];
  let k = sha256Sync.k = sha256Sync.k || [];
  let primeCounter = k[lengthProperty];
  const isComposite = {};

  for (let candidate = 2; primeCounter < 64; candidate++){
    if (!isComposite[candidate]){
      for (i = 0; i < 313; i += candidate) isComposite[i] = candidate;
      hash[primeCounter] = (mathPow(candidate, 0.5) * maxWord) | 0;
      k[primeCounter++] = (mathPow(candidate, 1/3) * maxWord) | 0;
    }
  }

  ascii += '\x80';
  while (ascii[lengthProperty] % 64 - 56) ascii += '\x00';
  for (i = 0; i < ascii[lengthProperty]; i++){
    j = ascii.charCodeAt(i);
    words[i >> 2] |= j << ((3 - i) % 4) * 8;
  }
  words[words[lengthProperty]] = (asciiBitLength / maxWord) | 0;
  words[words[lengthProperty]] = asciiBitLength;

  for (j = 0; j < words[lengthProperty];){
    const w = words.slice(j, j += 16);
    const oldHash = hash.slice(0);
    hash = hash.slice(0, 8);

    for (i = 0; i < 64; i++){
      const w15 = w[i - 15];
      const w2 = w[i - 2];
      const a = hash[0];
      const e = hash[4];
      const temp1 = (hash[7]
        + (_rightRotate(e, 6) ^ _rightRotate(e, 11) ^ _rightRotate(e, 25))
        + ((e & hash[5]) ^ ((~e) & hash[6]))
        + k[i]
        + (w[i] = (i < 16) ? w[i] : (
          (w[i - 16]
            + (_rightRotate(w15, 7) ^ _rightRotate(w15, 18) ^ (w15 >>> 3))
            + w[i - 7]
            + (_rightRotate(w2, 17) ^ _rightRotate(w2, 19) ^ (w2 >>> 10))
          ) | 0
        ))
      ) | 0;
      const temp2 = ((_rightRotate(a, 2) ^ _rightRotate(a, 13) ^ _rightRotate(a, 22))
        + ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2]))
      ) | 0;

      hash = [(temp1 + temp2) | 0].concat(hash);
      hash[4] = (hash[4] + temp1) | 0;
      hash.pop();
    }

    for (i = 0; i < 8; i++) hash[i] = (hash[i] + oldHash[i]) | 0;
  }

  for (i = 0; i < 8; i++){
    for (j = 3; j + 1; j--){
      const b = (hash[i] >> (j * 8)) & 255;
      result += ((b < 16) ? '0' : '') + b.toString(16);
    }
  }
  return result;
}

async function sha256(str){
  try{
    if (globalThis.crypto && crypto.subtle && typeof crypto.subtle.digest === 'function'){
      const buf=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(str));
      return Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,'0')).join('');
    }
  }catch(e){
    console.warn('[sha256] Web Crypto API 실패, 동기 방식 사용:', e.message);
  }
  return sha256Sync(str);
}
const ADMIN_HASH_KEY='su_admin_hashes'; // [{v,algo,idHash,salt,iter,hash,role,label}] 배열
const LEGACY_ADMIN_HASH_KEY='su_admin_hash';
const ADMIN_UPDATED_AT_KEY='su_admin_hashes_updated_at';
const ADMIN_REMOTE_PATH='star-datacenter/data/admin-accounts.json';
const SESSION_ID_HASH_KEY='su_session_id_hash';
const ADMIN_REMOTE_SYNC_KEY='su_admin_remote_sync_state';
const ADMIN_HASH_VERSION=2;
const ADMIN_PASSWORD_MIN_LEN=8;
const ADMIN_PBKDF2_ITER=120000;
const ADMIN_FALLBACK_ITER=20000;
function _normAdminId(id){
  return String(id||'').trim().toLowerCase();
}
function _maskAdminId(id){
  const s=String(id||'').trim();
  if(!s) return '';
  if(s.length<=2) return s[0]+'*';
  if(s.length===3) return s[0]+'*'+s[2];
  return s.slice(0,2) + '*'.repeat(Math.max(2, s.length-3)) + s.slice(-1);
}
function _hexFromBytes(bytes){
  return Array.from(bytes||[]).map(b=>b.toString(16).padStart(2,'0')).join('');
}
function _bytesFromHex(hex){
  const s=String(hex||'').trim();
  const out=new Uint8Array(Math.floor(s.length/2));
  for(let i=0;i<out.length;i++) out[i]=parseInt(s.substr(i*2,2),16)||0;
  return out;
}
function _randomHex(byteLen){
  try{
    const arr=new Uint8Array(Math.max(8, byteLen||16));
    if(globalThis.crypto && typeof crypto.getRandomValues==='function'){
      crypto.getRandomValues(arr);
      return _hexFromBytes(arr);
    }
  }catch(e){}
  let s='';
  const len=Math.max(16,(byteLen||16)*2);
  for(let i=0;i<len;i++) s += Math.floor(Math.random()*16).toString(16);
  return s;
}
async function _deriveLegacyAdminHash(id,pw){
  return sha256(String(id||'').trim()+':'+String(pw||''));
}
async function _deriveAdminHashPBKDF2(id,pw,saltHex,iter){
  const material=`${_normAdminId(id)}\n${String(pw||'')}`;
  const salt=_bytesFromHex(saltHex);
  const key=await crypto.subtle.importKey('raw', new TextEncoder().encode(material), 'PBKDF2', false, ['deriveBits']);
  const bits=await crypto.subtle.deriveBits({ name:'PBKDF2', hash:'SHA-256', salt, iterations:Math.max(1000, iter||ADMIN_PBKDF2_ITER) }, key, 256);
  return _hexFromBytes(new Uint8Array(bits));
}
async function _deriveAdminHashIter(id,pw,saltHex,iter){
  let acc=`${_normAdminId(id)}\n${String(pw||'')}\n${String(saltHex||'')}`;
  const rounds=Math.max(1000, iter||ADMIN_FALLBACK_ITER);
  for(let i=0;i<rounds;i++) acc = await sha256(`${acc}:${i}`);
  return acc;
}
async function _deriveAdminHashByAlgo(id,pw,saltHex,iter,algo){
  try{
    if(algo==='pbkdf2-sha256' && globalThis.crypto && crypto.subtle && typeof crypto.subtle.importKey==='function'){
      return await _deriveAdminHashPBKDF2(id,pw,saltHex,iter);
    }
  }catch(e){}
  return _deriveAdminHashIter(id,pw,saltHex,iter);
}
async function createAdminAccountRecord(id,pw,role,label){
  const cleanId=String(id||'').trim();
  const salt=_randomHex(16);
  const algo=(globalThis.crypto && crypto.subtle && typeof crypto.subtle.importKey==='function') ? 'pbkdf2-sha256' : 'sha256-iter';
  const iter=algo==='pbkdf2-sha256' ? ADMIN_PBKDF2_ITER : ADMIN_FALLBACK_ITER;
  const idHash=await sha256(_normAdminId(cleanId));
  const hash=await _deriveAdminHashByAlgo(cleanId,pw,salt,iter,algo);
  return { v:ADMIN_HASH_VERSION, algo, idHash, salt, iter, hash, role:role||'admin', label:_maskAdminId(label||cleanId) };
}
async function verifyAdminAccount(account,id,pw){
  if(!account) return false;
  if(account.v===ADMIN_HASH_VERSION && account.hash && account.salt){
    const idHash=await sha256(_normAdminId(id));
    if(idHash !== String(account.idHash||'')) return false;
    const derived=await _deriveAdminHashByAlgo(id,pw,account.salt,account.iter,account.algo);
    return derived === String(account.hash||'');
  }
  return (await _deriveLegacyAdminHash(id,pw)) === String(account.hash||'');
}
function _persistAdminAccounts(accounts){
  try{
    localStorage.setItem(ADMIN_HASH_KEY, JSON.stringify(Array.isArray(accounts)?accounts:[]));
    localStorage.setItem(ADMIN_UPDATED_AT_KEY, String(Date.now()));
    localStorage.removeItem(LEGACY_ADMIN_HASH_KEY);
  }catch(e){}
}
function _getLocalAdminUpdatedAt(){
  try{ return Number(localStorage.getItem(ADMIN_UPDATED_AT_KEY)||0) || 0; }catch(e){ return 0; }
}
function _setLocalAdminUpdatedAt(ts){
  try{ localStorage.setItem(ADMIN_UPDATED_AT_KEY, String(Number(ts||Date.now())||Date.now())); }catch(e){}
}
function _getSessionIdHash(){
  try{ return String(localStorage.getItem(SESSION_ID_HASH_KEY)||'').trim(); }catch(e){ return ''; }
}
function _setSessionIdentity(idHash){
  try{
    if(idHash) localStorage.setItem(SESSION_ID_HASH_KEY, String(idHash));
    else localStorage.removeItem(SESSION_ID_HASH_KEY);
  }catch(e){}
}
function _setAdminRemoteSyncState(state){
  try{ localStorage.setItem(ADMIN_REMOTE_SYNC_KEY, String(state||'')); }catch(e){}
}
function _getAdminRemoteSyncState(){
  try{ return String(localStorage.getItem(ADMIN_REMOTE_SYNC_KEY)||'').trim(); }catch(e){ return ''; }
}
function _cleanupLegacyAdminArtifacts(){
  try{
    localStorage.removeItem(LEGACY_ADMIN_HASH_KEY);
    const current = getAdminAccounts();
    const cleaned = Array.isArray(current) ? current.filter(a=>{
      if(!a || typeof a !== 'object') return false;
      if(Number(a.v||0) !== ADMIN_HASH_VERSION) return false;
      return !!(a.idHash && a.hash && a.salt);
    }) : [];
    if(cleaned.length !== (current||[]).length){
      localStorage.setItem(ADMIN_HASH_KEY, JSON.stringify(cleaned));
      _setLocalAdminUpdatedAt(Date.now());
    }
    if(!cleaned.length){
      _clearSessionStorage();
      isLoggedIn = false;
      isSubAdmin = false;
    }else{
      const sid = _getSessionIdHash();
      if(sid && !cleaned.some(a=>String(a.idHash||'')===sid)){
        _clearSessionStorage();
        isLoggedIn = false;
        isSubAdmin = false;
      }
    }
  }catch(e){}
}
function _adminRepoRawUrl(){
  try{ return `https://raw.githubusercontent.com/${GH_OWNER}/${GH_REPO}/${GH_BRANCH}/${ADMIN_REMOTE_PATH}`; }catch(e){ return ''; }
}
function _adminSameOriginUrl(){
  try{ return new URL('data/admin-accounts.json', window.location.href).href; }catch(e){ return ''; }
}
function _adminRepoCdnUrl(){
  try{ return `https://cdn.jsdelivr.net/gh/${GH_OWNER}/${GH_REPO}@${GH_BRANCH}/${ADMIN_REMOTE_PATH}`; }catch(e){ return ''; }
}
function _adminRepoApiUrl(){
  try{ return `https://api.github.com/repos/${GH_OWNER}/${GH_REPO}/contents/${ADMIN_REMOTE_PATH}`; }catch(e){ return ''; }
}
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
let isLoggedIn=localStorage.getItem('su_session')==='1';
let isSubAdmin=localStorage.getItem('su_session_role')==='sub-admin';
window._authInitPromise = null;

async function doLogin(){
  try{ if(window._authInitPromise) await window._authInitPromise; else await pullAdminAccountsRemote(true); }catch(e){}
  const id=document.getElementById('li-id').value.trim();
  const pw=document.getElementById('li-pw').value;
  const err=document.getElementById('li-err');
  if(!id||!pw){err.textContent='아이디와 비밀번호를 입력하세요.';return;}
  err.textContent='';
  let accounts=getAdminAccounts();
  if(!accounts.length){
    try{ await pullAdminAccountsRemote(true); }catch(e){}
    accounts=getAdminAccounts();
  }
  if(_getAdminRemoteSyncState() !== 'ok' && !accounts.length){
    err.textContent='관리자 계정 정보를 아직 불러오지 못했습니다. 잠시 후 다시 시도하세요.';
    return;
  }
  const remainMs = _getLoginLockRemainingMs();
  if(remainMs > 0){
    err.textContent=`로그인 시도 제한 중입니다. ${Math.ceil(remainMs/1000)}초 후 다시 시도하세요.`;
    return;
  }
  if(!accounts.length){
    err.textContent='등록된 관리자 계정이 없습니다. 총관리자가 먼저 계정을 등록해야 합니다.';
    return;
  }
  let found=null, foundIdx=-1;
  for(let i=0;i<accounts.length;i++){
    if(await verifyAdminAccount(accounts[i], id, pw)){
      found=accounts[i];
      foundIdx=i;
      break;
    }
  }
  if(found){
    const _needsRelabel = String(found.label||'').trim().toLowerCase() === _normAdminId(id);
    if(found.v!==ADMIN_HASH_VERSION || _needsRelabel){
      try{
        accounts[foundIdx]=await createAdminAccountRecord(id,pw,found.role||'admin',found.label||id);
        _persistAdminAccounts(accounts);
        await pushAdminAccountsRemote(accounts);
      }catch(e){}
    }
    isLoggedIn=true;
    isSubAdmin=(found.role==='sub-admin');
    const now = Date.now();
    localStorage.setItem('su_session','1');
    localStorage.setItem('su_session_role',found.role||'admin');
    _setSessionIdentity(found.idHash || await sha256(_normAdminId(id)));
    localStorage.setItem('su_session_login_at', String(now));
    localStorage.setItem('su_session_last_active_at', String(now));
    _clearLoginFailInfo();
    cm('loginModal');
    document.getElementById('li-id').value='';
    document.getElementById('li-pw').value='';
    document.getElementById('li-err').textContent='';
    applyLoginState();
  } else {
    const fail = _recordLoginFailure();
    const lockedMs = Math.max(0, (Number(fail.lockUntil||0)||0) - Date.now());
    if(lockedMs > 0){
      err.textContent=`로그인 ${LOGIN_FAIL_MAX}회 실패로 ${Math.ceil(lockedMs/1000)}초 동안 잠금됩니다.`;
    }else{
      const left = Math.max(0, LOGIN_FAIL_MAX - (Number(fail.count||0) || 0));
      err.textContent=`아이디 또는 비밀번호가 올바르지 않습니다.${left>0?` (${left}회 남음)`:''}`;
    }
    document.getElementById('li-pw').value='';
  }
}

function doLogout(){
  isLoggedIn=false;
  isSubAdmin=false;
  _clearSessionStorage();
  if(['member','cfg'].includes(curTab)){curTab='total';document.querySelectorAll('.tab').forEach(b=>b.classList.remove('on'));document.querySelector('.tab').classList.add('on');}
  if(['grpedit','input'].includes(compSub)) compSub='league';
  applyLoginState();
}

function applyLoginState(){
  if(isLoggedIn && _isSessionExpired()){
    isLoggedIn = false;
    isSubAdmin = false;
    _clearSessionStorage();
  }
  if(isLoggedIn){
    const acct = _getSessionAccountFromCache();
    if(!acct){
      isLoggedIn = false;
      isSubAdmin = false;
      _clearSessionStorage();
    }else{
      _syncSessionRoleFromAccount(acct);
    }
  }
  if(isLoggedIn) _touchSessionActivity(false);
  // (중요) 일부 모듈(render-nav-lazy 등)은 window.isLoggedIn을 참조함.
  // auth.js는 top-level let isLoggedIn을 사용하므로 둘을 항상 동기화한다.
  try{ window.isLoggedIn = !!isLoggedIn; }catch(e){}
  try{ window.isSubAdmin = !!isSubAdmin; }catch(e){}
  // 헤더 버튼 표시
  document.getElementById('hdrLoginBtn').style.display=isLoggedIn?'none':'';
  document.getElementById('hdrLogoutBtn').style.display=isLoggedIn?'':'none';
  document.getElementById('hdrLoginStatus').style.display=isLoggedIn?'':'none';
  try{
    const st=document.getElementById('hdrLoginStatus');
    if(st && isLoggedIn){
      st.textContent = isSubAdmin ? '✅ 부관리자' : '✅ 총관리자';
    }
  }catch(e){
    console.warn('[applyLoginState] 로그인 상태 표시 업데이트 실패:', e.message);
  }
  const _mobileBar=document.getElementById('mobileActionBar');
  if(_mobileBar && !isLoggedIn) { const _mBtn=_mobileBar.querySelector('button[onclick*="cloudLoad"]'); if(_mBtn) _mBtn.style.display='none'; }
  if(_mobileBar && isLoggedIn) { const _mBtn=_mobileBar.querySelector('button[onclick*="cloudLoad"]'); if(_mBtn) _mBtn.style.display='flex'; }
  // 잠금 요소
  document.querySelectorAll('.lock-admin').forEach(el=>{
    el.classList.toggle('locked',!isLoggedIn);
  });
  // 관리자 전용 탭 (설정) - 총관리자만 표시/접근
  const _cfgTab=document.getElementById('tabCfg');
  if(_cfgTab) _cfgTab.style.display=(isLoggedIn && !isSubAdmin)?'':'none';
  if((!isLoggedIn || isSubAdmin) && curTab==='cfg'){
    curTab='total';
  }
  // 데이터 내보내기/가져오기 버튼 — 로그인 시에만 표시
  const exportHint=document.getElementById('exportHint');
  if(exportHint)exportHint.style.display=(isLoggedIn && !isSubAdmin)?'':'none';
  const exportVis=document.getElementById('btnExportVis');
  const importVis=document.getElementById('btnImportVis');
  if(exportVis)exportVis.style.display=(isLoggedIn && !isSubAdmin)?'flex':'none';
  if(importVis)importVis.style.display=(isLoggedIn && !isSubAdmin)?'flex':'none';
  // 대학 상세 모달 수정 버튼 — 모달이 열려 있을 때 즉시 반영
  const univEditBtnEl=document.getElementById('univEditBtn');
  if(univEditBtnEl) univEditBtnEl.style.display=(isLoggedIn && !isSubAdmin)?'inline-flex':'none';
  // 스트리머 상세 모달 수정 버튼 — 모달이 열려 있을 때 즉시 반영
  const playerEditBtnEl=document.getElementById('playerModalEditBtn');
  if(playerEditBtnEl) playerEditBtnEl.style.display=(isLoggedIn && !isSubAdmin)?'inline-flex':'none';
  // 스트리머 등록/경기 기록 입력폼 — 로그인 + 스트리머 탭일 때만 표시
  const fstrip=document.getElementById('fstrip');
  if(fstrip){
    // (요청사항) 부관리자는 스트리머 등록 불가 → 숨김
    if(!isLoggedIn || isSubAdmin){fstrip.style.display='none';}
    else{fstrip.style.display=(curTab==='total')?'block':'none';}
  }
  render();
}
document.addEventListener('visibilitychange', ()=>{
  if(document.visibilityState !== 'visible') return;
  if(_isSessionExpired()){
    if(isLoggedIn){
      isLoggedIn = false;
      isSubAdmin = false;
      _clearSessionStorage();
      try{ if(typeof showToast==='function') showToast('🔒 로그인 세션이 만료되어 자동 로그아웃되었습니다.', 2600); }catch(e){}
      try{ applyLoginState(); }catch(e){}
    }
    return;
  }
  if(isLoggedIn){
    _touchSessionActivity(true);
    try{ refreshSessionAuthority(true).then(()=>applyLoginState()); }catch(e){}
  }
});
window.addEventListener('pointerdown', ()=>{ if(isLoggedIn) _touchSessionActivity(false); }, { passive:true });
window.addEventListener('keydown', ()=>{ if(isLoggedIn) _touchSessionActivity(false); }, { passive:true });

// 수정/삭제 버튼 — 비로그인 시 숨김
function adminBtn(html){
  // (요청사항) 부관리자는 설정/편집 등 관리자 버튼 숨김 (경기 수정은 별도 로직)
  return (isLoggedIn && !isSubAdmin) ? html : '';
}
function doExport(){
  try{
    // 외부 대진기록은 현재 IndexedDB + localStorage(meta) 구조를 우선 사용
    const histExtState = (typeof _histExtLoad==='function')
      ? (_histExtLoad() || {})
      : {items:[],raw:'',mode:'today',today:'',sourceSel:'',keyword:''};
    const histExtProxyPresets = localStorage.getItem('su_hist_ext_proxy_presets_v1') || '';
    const histExtProxyPresetSel = localStorage.getItem('su_hist_ext_proxy_preset_sel_v1') || '';

    // (중요) 티어대회 기록(ttM) 및 기타 누락 데이터도 백업에 포함
    const payload = {
      players, univCfg, maps, tourD,
      miniM, univM, comps, ckM,
      compNames, curComp,
      proM, proTourneys,
      tiers: TIERS,
      tourneys,
      indM, gjM,
      // 🎯 티어대회 기록 (대전기록 탭 전용)
      ttM: (typeof ttM!=='undefined' ? ttM : []),
      // 설정/부가 데이터
      curProComp, _ttCurComp,
      userMapAlias, notices, playerStatusIcons,
      playerStatusExpiry: (typeof playerStatusExpiry!=='undefined' ? playerStatusExpiry : {}),
      customStatusIcons: (typeof _customStatusIcons!=='undefined' ? _customStatusIcons : []),
      boardOrder, boardPlayerOrder,
      seasons, calScheduled,
      // 외부 탭 데이터
      histExtState, histExtProxyPresets, histExtProxyPresetSel
    };
    const b=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});
    const url=URL.createObjectURL(b);
    const a=document.createElement('a');
    a.href=url;a.download='star_backup.json';
    document.body.appendChild(a);a.click();
    setTimeout(()=>{document.body.removeChild(a);URL.revokeObjectURL(url);},100);
  }catch(e){alert('내보내기 오류: '+e.message);}
}

function doImport(){document.getElementById('fi').click();}
function doFile(inp){
  const r=new FileReader();
  r.onload=async e=>{
    try{
      const d=JSON.parse(e.target.result);
      if(!d||typeof d!=='object'||Array.isArray(d)){
        alert('파일이 유효한 JSON 객체가 아닙니다.');
        return;
      }
      players=d.players||[];univCfg=d.univCfg||univCfg;maps=d.maps||maps;tourD=d.tourD||Array(15).fill('');
      if(d.tiers&&d.tiers.length)TIERS.splice(0,TIERS.length,...d.tiers);
      miniM=d.miniM||[];univM=d.univM||[];comps=d.comps||[];ckM=d.ckM||[];
      compNames=d.compNames||[];curComp=d.curComp||'';
      proM=d.proM||[];
      if(d.proTourneys!==undefined) proTourneys=d.proTourneys||[];
      tourneys=d.tourneys||[];
      // 🎯 티어대회 기록 복원(있으면 그대로 사용, 없으면 아래에서 tourneys로 마이그레이션)
      if(d.ttM!==undefined) ttM=d.ttM||[];
      // 외부 대진기록 복원
      if(d.histExtState!==undefined){
        try{
          if(typeof _histExtSave==='function') _histExtSave(d.histExtState||{items:[],raw:'',mode:'today',today:'',sourceSel:'',keyword:''});
          else localStorage.setItem('su_hist_ext_data_v1', JSON.stringify(d.histExtState||{}));
        }catch(e){
          console.warn('[doFile] histExtState 복원 실패:', e.message);
        }
      }else if(d.histExtRaw!==undefined){
        try{ localStorage.setItem('su_hist_ext_data_v1', String(d.histExtRaw||'')); }catch(e){
          console.warn('[doFile] histExtRaw localStorage 저장 실패:', e.message);
        }
      }else if(d.histExt){
        // 구버전 호환: histExt 객체 형태면 JSON 문자열로 저장
        try{ localStorage.setItem('su_hist_ext_data_v1', JSON.stringify(d.histExt)); }catch(e){
          console.warn('[doFile] histExt localStorage 저장 실패:', e.message);
        }
      }
      if(d.histExtProxyPresets!==undefined){
        try{ localStorage.setItem('su_hist_ext_proxy_presets_v1', String(d.histExtProxyPresets||'')); }catch(e){}
      }
      if(d.histExtProxyPresetSel!==undefined){
        try{ localStorage.setItem('su_hist_ext_proxy_preset_sel_v1', String(d.histExtProxyPresetSel||'')); }catch(e){}
      }
      // 🔧 누락 변수 복원 추가
      if(d.indM!==undefined) indM=d.indM||[];
      if(d.gjM!==undefined) gjM=d.gjM||[];
      if(d.curProComp!==undefined) curProComp=d.curProComp||'';
      if(d.userMapAlias!==undefined) userMapAlias=d.userMapAlias||{};
      if(d.notices!==undefined) notices=d.notices||[];
      if(d.playerStatusIcons!==undefined) playerStatusIcons=d.playerStatusIcons||{};
      if(d.playerStatusExpiry!==undefined && typeof playerStatusExpiry!=='undefined') playerStatusExpiry=d.playerStatusExpiry||{};
      if(d.customStatusIcons!==undefined && typeof _customStatusIcons!=='undefined') _customStatusIcons=d.customStatusIcons||[];
      try{ if(typeof _rebuildCustomStatusDefs==='function') _rebuildCustomStatusDefs(); }catch(e){}
      try{ if(typeof _iconPersistState==='function') _iconPersistState(); }catch(e){}
      if(d.boardOrder!==undefined) boardOrder=d.boardOrder||[];
      if(d.boardPlayerOrder!==undefined) boardPlayerOrder=d.boardPlayerOrder||{};
      if(d.seasons!==undefined) seasons=d.seasons||[];
      if(d.calScheduled!==undefined) calScheduled=d.calScheduled||[];
      if(d._ttCurComp!==undefined) _ttCurComp=d._ttCurComp||'';
      window._compListCache={};window._shareAllMatchesCached=null;
      (function(){
        const allD=[...miniM,...univM,...comps,...ckM,...proM];
        mergeValidYearsIntoOptions(yearOptions, allD);
      })();
      filterYear='전체';filterMonth='전체';
      // (중요) ttM이 백업에 없었던 구버전 파일이라면 tourneys(type='tier')에서 ttM를 재구성
      try{
        if((!ttM || !ttM.length) && typeof _migrateTierTourneys==='function'){
          try{ if(typeof _ttMigrated!=='undefined') _ttMigrated=false; }catch(e){}
          _migrateTierTourneys();
        }
      }catch(e){}
      fixPoints();
      try{ if(typeof _rebuildAllPlayerHistoryCore==='function') _rebuildAllPlayerHistoryCore(); }catch(e){}
      await save();
      init();
      // 동명이인 감지
      const _dupSeen={};const _dupFound=[];
      players.forEach(p=>{if(_dupSeen[p.name])_dupFound.push(p.name);else _dupSeen[p.name]=true;});
      const _dupUniq=[...new Set(_dupFound)];
      if(_dupUniq.length) alert('⚠️ 동명이인 감지!\n중복 이름: '+_dupUniq.join(', ')+'\n\n설정 탭 > 데이터 진단에서 수정하세요.');
      alert('✅ 데이터 임포트 완료');
    }catch(err){
      console.error('[doFile] 파일 처리 오류:', err);
      alert(`파일 읽기 오류: ${err.message}\n올바른 JSON 파일인지 확인하세요.`);
    }
  };
  r.readAsText(inp.files[0]);
}

function refreshSel(){
  const allU=getAllUnivs().filter(u=>!u.dissolved);
  document.getElementById('p-univ').innerHTML=allU.map(u=>`<option value="${u.name}"${u.name==='무소속'?' selected':''}>${u.name}</option>`).join('');
  const mmap=document.getElementById('m-map');
  if(mmap) mmap.innerHTML=maps.map(m=>`<option value="${m}">${m}</option>`).join('');
}
function openGameEditModal(editRef, si, gi){
  const [mode, idxStr]=editRef.split(':');
  const idx=parseInt(idxStr);
  const arr=mode==='mini'?miniM:mode==='univm'?univM:mode==='ck'?ckM:mode==='pro'?proM:mode==='comp'?comps:null;
  if(!arr)return;
  const m=arr[idx];if(!m)return;
  const set=m.sets&&m.sets[si];if(!set)return;
  const g=set.games&&set.games[gi];if(!g)return;

  // 해당 경기에 뛴 팀 멤버만 추출
  const isCKmode=(mode==='ck'||mode==='pro'||mode==='tt');
  let teamANames=[], teamBNames=[];
  if(isCKmode){
    teamANames=(m.teamAMembers||[]).map(x=>x.name);
    teamBNames=(m.teamBMembers||[]).map(x=>x.name);
  } else {
    // mini/univm: 같은 대학 선수들
    const univA=m.a||''; const univB=m.b||'';
    teamANames=players.filter(p=>p.univ===univA).map(p=>p.name).sort();
    teamBNames=players.filter(p=>p.univ===univB).map(p=>p.name).sort();
  }

  const mapOpts=maps.map(mp=>`<option value="${mp}"${g.map===mp?' selected':''}>${mp}</option>`).join('');
  const modal=document.createElement('div');
  modal.className='modal modal--gameedit';modal.style.display='flex';
  // (요청사항) 저장/취소 버튼 아래 여백 최소화
  modal.innerHTML=`<div class="mbox su-form-modal su-form-modal--compact" style="max-width:460px;padding-bottom:12px">
    <div class="su-form-modal__head">
      <div class="mtitle">✏️ 경기 수정</div>
      <div class="su-form-modal__sub">${si===2?'에이스전':(si+1)+'세트'} · 경기${gi+1}</div>
    </div>
    <div class="su-form-modal__body">
      <div class="su-field-row">
        <label class="su-field-label" style="color:#2563eb">🔵 A팀 선수</label>
        <select id="gem-pA" style="flex:1">
          <option value="">—선택—</option>
          ${teamANames.map(n=>`<option value="${n}"${g.playerA===n?' selected':''}>${n}</option>`).join('')}
        </select>
      </div>
      <div class="su-field-row">
        <label class="su-field-label" style="color:#dc2626">🔴 B팀 선수</label>
        <select id="gem-pB" style="flex:1">
          <option value="">—선택—</option>
          ${teamBNames.map(n=>`<option value="${n}"${g.playerB===n?' selected':''}>${n}</option>`).join('')}
        </select>
      </div>
      <div class="su-field-row">
        <label class="su-field-label">승자</label>
        <select id="gem-winner" style="flex:1">
          <option value="">(미정)</option>
          <option value="A"${g.winner==='A'?' selected':''}>🔵 A팀 승</option>
          <option value="B"${g.winner==='B'?' selected':''}>🔴 B팀 승</option>
        </select>
      </div>
      <div class="su-field-row">
        <label class="su-field-label">맵</label>
        <select id="gem-map" style="flex:1"><option value="">맵 없음</option>${mapOpts}</select>
      </div>
    </div>
    <div class="su-form-modal__foot">
      <button class="btn btn-w btn-sm" onclick="this.closest('.modal').remove()">취소</button>
      <button class="btn btn-g btn-sm" onclick="saveGameEdit('${editRef}',${si},${gi},this)">✅ 저장</button>
    </div>
  </div>`;
  document.body.appendChild(modal);
}

function saveGameEdit(editRef, si, gi, btn){
  const [mode, idxStr]=editRef.split(':');
  const idx=parseInt(idxStr);
  const arr=mode==='mini'?miniM:mode==='univm'?univM:mode==='ck'?ckM:mode==='pro'?proM:mode==='comp'?comps:null;
  if(!arr)return;
  const m=arr[idx];if(!m)return;
  const set=m.sets&&m.sets[si];if(!set)return;
  const g=set.games&&set.games[gi];if(!g)return;

  // pro 외 모드: 기존 이 게임의 선수 history 되돌리기
  if(mode!=='pro' && g.playerA && g.playerB && g.winner){
    const oldWin=g.winner==='A'?g.playerA:g.playerB;
    const oldLose=g.winner==='A'?g.playerB:g.playerA;
    const mid=m._id||null;
    const mdate=m.d||'';
    const wP=players.find(p=>p.name===oldWin);
    const lP=players.find(p=>p.name===oldLose);
    if(wP){
      if(!wP.history)wP.history=[];
      wP.win=Math.max(0,(wP.win||0)-1);
      wP.points=(wP.points||0)-3;
      let wi=mid?wP.history.findIndex(h=>h.matchId===mid&&h.result==='승'&&h.opp===oldLose):-1;
      if(wi<0)wi=wP.history.findIndex(h=>h.result==='승'&&h.opp===oldLose&&h.date===mdate);
      if(wi>=0){const hr=wP.history[wi];if(hr.eloDelta!=null)wP.elo=(wP.elo||ELO_DEFAULT)-hr.eloDelta;wP.history.splice(wi,1);}
    }
    if(lP){
      if(!lP.history)lP.history=[];
      lP.loss=Math.max(0,(lP.loss||0)-1);
      lP.points=(lP.points||0)+3;
      let li=mid?lP.history.findIndex(h=>h.matchId===mid&&h.result==='패'&&h.opp===oldWin):-1;
      if(li<0)li=lP.history.findIndex(h=>h.result==='패'&&h.opp===oldWin&&h.date===mdate);
      if(li>=0){const hr=lP.history[li];if(hr.eloDelta!=null)lP.elo=(lP.elo||ELO_DEFAULT)-hr.eloDelta;lP.history.splice(li,1);}
    }
  }

  // 게임 데이터 업데이트
  const newPA=document.getElementById('gem-pA').value||g.playerA;
  const newPB=document.getElementById('gem-pB').value||g.playerB;
  const newWinner=document.getElementById('gem-winner').value||g.winner;
  const newMap=document.getElementById('gem-map').value||g.map;
  g.playerA=newPA; g.playerB=newPB; g.winner=newWinner; g.map=newMap;

  // pro 외 모드: 새 결과 선수 history에 반영
  if(mode!=='pro' && newPA && newPB && newWinner){
    const _geLabel={mini:'미니대전',univm:'대학대전',ck:'대학CK',tt:'티어대회',comp:'조별리그'}[mode]||'';
    applyGameResult(
      newWinner==='A'?newPA:newPB,
      newWinner==='A'?newPB:newPA,
      m.d||'', newMap||'-', m._id||'', '', '', _geLabel
    );
  }

  // 세트/총점 재계산
  let sA=0,sB=0;
  (set.games||[]).forEach(gg=>{if(gg.winner==='A')sA++;else if(gg.winner==='B')sB++;});
  set.scoreA=sA;set.scoreB=sB;
  set.winner=sA>sB?'A':sB>sA?'B':'';
  let tA=0,tB=0;
  (m.sets||[]).forEach(s=>{if(s.winner==='A')tA++;else if(s.winner==='B')tB++;});
  m.sa=tA;m.sb=tB;
  save();
  btn.closest('.modal').remove();
  render();
  // (보강) 티어대회 경기 수정 후 최근 경기 누락 방지
  try{ if(mode==='tt' && typeof syncTierTtMHistory==='function') syncTierTtMHistory(); }catch(e){}
  try{ if(typeof window.refreshPlayerModalIfOpen==='function') window.refreshPlayerModalIfOpen(); }catch(e){}
}

async function captureStats(){
  const el=document.getElementById('stats-univ-sec');
  if(!el){alert('캡처할 영역이 없습니다.');return;}
  try{
    _showSaveLoading();
    try{ await (window.ensureHtml2Canvas && window.ensureHtml2Canvas()); }catch(e){}
    await _imgToDataUrls(el);
    const canvas=await html2canvas(el,{backgroundColor:'#ffffff',scale:2,useCORS:false,allowTaint:false});
    const a=document.createElement('a');a.download=`stats_${new Date().toISOString().slice(0,10)}.jpg`;
    a.href=canvas.toDataURL('image/jpeg',.93);a.click();
  }catch(e){alert('이미지 저장 오류: '+e.message);}
  finally{_hideSaveLoading();}
}

async function captureSection(sectionId, filename){
  const el=document.getElementById(sectionId);
  if(!el){alert('캡처할 영역이 없습니다.');return;}
  try{
    _showSaveLoading();
    try{ await (window.ensureHtml2Canvas && window.ensureHtml2Canvas()); }catch(e){}
    await _imgToDataUrls(el);
    const canvas=await html2canvas(el,{backgroundColor:'#ffffff',scale:2,useCORS:false,allowTaint:false,logging:false});
    const a=document.createElement('a');
    a.download=`${filename||sectionId}_${new Date().toISOString().slice(0,10)}.jpg`;
    a.href=canvas.toDataURL('image/jpeg',.93);a.click();
  }catch(e){alert('이미지 저장 오류: '+e.message);}
  finally{_hideSaveLoading();}
}

/* ══ 모바일 헤더 검색 토글 ══ */
function toggleHdrSearch(){
  const wrap = document.getElementById('hdrSearchWrap');
  const input = document.getElementById('globalSearch');
  if(!wrap) return;
  wrap.classList.toggle('open');
  if(wrap.classList.contains('open')){
    input.style.cssText = 'width:140px!important;opacity:1!important;pointer-events:auto!important;position:relative!important;padding:5px 10px!important;font-size:12px!important;border-radius:20px;border:1px solid rgba(255,255,255,.3);background:rgba(255,255,255,.15);color:#fff;outline:none;';
    setTimeout(()=>input.focus(), 50);
    input.onblur = ()=>{ if(!input.value){ wrap.classList.remove('open'); input.style.cssText=''; } };
  } else {
    input.style.cssText = '';
    input.value = '';
    onGlobalSearch('');
  }
}
/* 상단(헤더) 다크/로그인 버튼: 아이콘 전용 + 크기 최소화 */
(function(){
  function fixHdrBtns(){
    const dk = document.getElementById('darkToggleBtn');
    const isDark = document.body.classList.contains('dark');
    if(dk){
      dk.innerHTML = isDark ? '☀️' : '🌙';
      dk.setAttribute('title', isDark ? '라이트 모드' : '다크 모드');
      dk.setAttribute('aria-label', isDark ? '라이트 모드로 전환' : '다크 모드로 전환');
    }
    const li = document.getElementById('hdrLoginBtn');
    if(li){
      li.innerHTML = '🔐';
      li.setAttribute('title', '로그인');
      li.setAttribute('aria-label', '로그인');
    }
    const lo = document.getElementById('hdrLogoutBtn');
    if(lo){
      lo.innerHTML = '🔓';
      lo.setAttribute('title', '로그아웃');
      lo.setAttribute('aria-label', '로그아웃');
    }
  }
  window.addEventListener('resize', fixHdrBtns);
  document.addEventListener('DOMContentLoaded', fixHdrBtns);
  setTimeout(fixHdrBtns, 100);
  window._fixHdrBtns = fixHdrBtns;
})();

function toggleDark(){
  const isDark=document.body.classList.toggle('dark');
  localStorage.setItem('su_dark',isDark?'1':'');
  if(window._fixHdrBtns) window._fixHdrBtns(); else document.getElementById('darkToggleBtn').textContent=isDark?'☀️ 라이트':'🌙 다크';
  // 다크 전환 시 테마 변수 재적용(다크 모드에서는 accent만 적용)
  try{
    window._applyThemeVars && window._applyThemeVars();
  }catch(e){
    console.warn('[toggleDark] 테마 변수 재적용 실패:', e.message);
  }
}

/* ── 클립보드 복사 유틸 ── */
function copyMatchResult(a, sa, b, sb, date, mode, idx){
  const winner=sa>sb?a:sb>sa?b:'무승부';
  const lines=[];
  lines.push(`📋 경기 결과 [${date||'날짜미상'}]`);
  lines.push(`${a} ${sa} : ${sb} ${b}${winner!=='무승부'?' → '+winner+' 승':' → 무승부'}`);

  // 세트/게임 상세 내역 추가
  let m=null;
  if(mode==='mini'&&idx!=null&&idx!=='null') m=miniM[idx];
  else if(mode==='univm'&&idx!=null&&idx!=='null') m=univM[idx];
  else if(mode==='ck'&&idx!=null&&idx!=='null') m=ckM[idx];
  else if(mode==='pro'&&idx!=null&&idx!=='null') m=proM[idx];
  else if(mode==='comp'&&idx!=null&&idx!=='null') m=comps[idx];

  if(m&&m.sets&&m.sets.length){
    lines.push('');
    const isCK=(mode==='ck'||mode==='pro'||mode==='tt');
    m.sets.forEach((set,si)=>{
      const sLabel=si===2?'에이스전':`${si+1}세트`;
      const sA=set.scoreA||0,sB=set.scoreB||0;
      const sw=sA>sB?a:sB>sA?b:'무승부';
      lines.push(`[${sLabel}] ${a} ${sA}:${sB} ${b}${sw!=='무승부'?' ('+sw+')':''}`);
      if(set.games&&set.games.length){
        set.games.forEach((g,gi)=>{
          if(!g.playerA&&!g.playerB)return;
          const wn=g.winner==='A'?g.playerA:g.winner==='B'?g.playerB:'';
          const mapStr=g.map&&g.map!=='-'?` | ${g.map}`:'';
          lines.push(`  경기${gi+1}: ${g.playerA||'?'} vs ${g.playerB||'?'}${wn?' → '+wn+' 승':''}${mapStr}`);
        });
      }
    });
  }

  const text=lines.join('\n');
  navigator.clipboard.writeText(text).then(()=>{
    showToast('📋 상세 결과 복사됐습니다!');
  }).catch(()=>{
    try{
      const ta=document.createElement('textarea');
      ta.value=text;ta.style.cssText='position:fixed;top:-9999px;left:-9999px';
      document.body.appendChild(ta);ta.focus();ta.select();
      const ok=document.execCommand('copy');
      document.body.removeChild(ta);
      if(ok)showToast('📋 복사됐습니다!');
      else showToast('❌ 복사 실패 — 직접 선택 후 복사해 주세요.',3500);
    }catch(e2){
      showToast('❌ 복사를 지원하지 않는 브라우저입니다.',3500);
    }
  });
}

/* ── 토스트 알림 ── */
function showToast(msg, duration=2000){
  let t=document.getElementById('_toast');
  if(!t){
    t=document.createElement('div');t.id='_toast';
    t.style.cssText='position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:#1e293b;color:#fff;padding:9px 20px;border-radius:20px;font-size:13px;font-weight:600;z-index:9999;pointer-events:none;opacity:0;transition:opacity .2s;font-family:"Noto Sans KR",sans-serif;box-shadow:0 4px 16px rgba(0,0,0,.25)';
    document.body.appendChild(t);
  }
  t.textContent=msg;
  t.style.opacity='1';
  clearTimeout(t._tid);
  t._tid=setTimeout(()=>{t.style.opacity='0';},duration);
}
function initDark(){
  if(localStorage.getItem('su_dark')==='1'){
    document.body.classList.add('dark');
  }
  // 초기화 후 버튼 텍스트 설정 (모바일/PC 자동 대응)
  setTimeout(()=>{ if(window._fixHdrBtns) window._fixHdrBtns(); }, 50);
}
