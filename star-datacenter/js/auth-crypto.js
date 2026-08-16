/* ══════════════════════════════════════════════════════════════
   인증 - SHA256/해시 & 관리자 계정 로컬 유틸 (auth.js 에서 분리, 2026-07-30)
   ══════════════════════════════════════════════════════════════ */

﻿﻿﻿﻿﻿﻿﻿/* ══════════════════════════════════════
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
const ADMIN_PBKDF2_ITER=300000; // [보안 강화] 120,000 → 300,000 (OWASP 권장치에 근접). 기존 계정은 저장된 iter값으로 검증되므로 영향 없음
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
      } else if(localStorage.getItem('su_session') !== '1'){
        // su_session 키 없이 id_hash만 남아있는 케이스: 로그인 상태 강제 해제
        isLoggedIn = false;
        isSubAdmin = false;
        try{ window.isLoggedIn = false; window.isSubAdmin = false; }catch(e){}
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
