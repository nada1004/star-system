/* ══════════════════════════════════════
   보조 신호 감지 / 강제 동기화 / 배지
══════════════════════════════════════ */

function _getLastSyncSeenAt(){
  try{
    return Math.max(
      Number(localStorage.getItem('su_sync_last_received_at')||0) || 0,
      Number(localStorage.getItem('su_sync_last_remote_saved_at')||0) || 0,
      Number(_lastSavedAt||0) || 0
    );
  }catch(e){
    return Number(_lastSavedAt||0) || 0;
  }
}
function _formatSyncAge(ts){
  const n = Number(ts||0) || 0;
  if(!n) return '동기화 대기';
  const diffSec = Math.max(0, Math.floor((Date.now() - n) / 1000));
  if(diffSec < 60) return '마지막 동기화: 방금';
  const diffMin = Math.floor(diffSec / 60);
  if(diffMin < 60) return `마지막 동기화: ${diffMin}분 전`;
  const diffHour = Math.floor(diffMin / 60);
  if(diffHour < 24) return `마지막 동기화: ${diffHour}시간 전`;
  const diffDay = Math.floor(diffHour / 24);
  return `마지막 동기화: ${diffDay}일 전`;
}
function _updateSyncAgeBadge(){
  try{
    const el = document.getElementById('syncAgeBadge');
    if(!el) return;
    const ts = _getLastSyncSeenAt();
    el.textContent = _formatSyncAge(ts);
    el.title = ts ? `마지막 동기화 시각: ${new Date(ts).toLocaleString('ko-KR')}` : '아직 동기화 기록이 없습니다';
    el.style.opacity = ts ? '1' : '.8';
  }catch(e){}
}
function _bindSyncAgeBadge(){
  if(_syncAgeBadgeBound) return;
  _syncAgeBadgeBound = true;
  _updateSyncAgeBadge();
  setInterval(_updateSyncAgeBadge, 60000);
}
function _clearAutoRetryMissingTimer(){
  if(_autoRetryMissingTimer){
    clearTimeout(_autoRetryMissingTimer);
    _autoRetryMissingTimer = null;
  }
}
function _scheduleMissingMonthsAutoRetry(months){
  const miss = Array.isArray(months) ? months.filter(Boolean) : [];
  const sig = miss.join(',');
  if(!sig){
    _autoRetryMissingAttempt = 0;
    _autoRetryMissingSig = '';
    _clearAutoRetryMissingTimer();
    return;
  }
  if(sig !== _autoRetryMissingSig){
    _autoRetryMissingSig = sig;
    _autoRetryMissingAttempt = 0;
    _clearAutoRetryMissingTimer();
  }
  if(_autoRetryMissingBusy || _autoRetryMissingTimer || _autoRetryMissingAttempt >= 2) return;
  const delay = _autoRetryMissingAttempt === 0 ? 5000 : 30000;
  _autoRetryMissingTimer = setTimeout(async ()=>{
    _autoRetryMissingTimer = null;
    if(_autoRetryMissingBusy || _autoRetryMissingAttempt >= 2) return;
    _autoRetryMissingBusy = true;
    _autoRetryMissingAttempt += 1;
    try{
      if(typeof window.fbRetryMissingMonths === 'function'){
        await window.fbRetryMissingMonths();
      }
    }catch(e){}
    finally{
      _autoRetryMissingBusy = false;
      const latestMiss = (()=>{ try{ return JSON.parse(localStorage.getItem('su_sync_missing_months')||'[]')||[]; }catch(e){ return []; } })().filter(Boolean);
      if(latestMiss.length){
        if(_autoRetryMissingAttempt < 2){
          _scheduleMissingMonthsAutoRetry(latestMiss);
        }else{
          _toastSync(`⚠️ 누락 월 자동 재시도 후에도 남음: ${latestMiss.join(', ')}`, 3600);
        }
      }else{
        _autoRetryMissingAttempt = 0;
        _autoRetryMissingSig = '';
      }
    }
  }, delay);
}
function _deliver(data) {
  _lastSnapshot = data;
  try{
    const sa = Number(data && data.savedAt || 0) || 0;
    if(sa){
      _lastSavedAt = sa;
      localStorage.setItem('su_sync_last_remote_saved_at', String(sa));
      if(_toastPendingSignalTs && sa >= _toastPendingSignalTs){
        _toastSync('✅ 다른 기기 데이터가 반영되었습니다', 2200);
        _toastPendingSignalTs = 0;
      }
    }
    localStorage.setItem('su_sync_last_received_at', String(Date.now()));
    _updateSyncAgeBadge();
  }catch(e){}
  try{
    const miss = Array.isArray(data && data._missingMonths) ? data._missingMonths.filter(Boolean) : [];
    const sig = miss.join(',');
    if(miss.length){
      if(sig && sig !== _lastMissingMonthsSig){
        _toastSync(`⚠️ 일부 월 데이터 누락: ${miss.join(', ')}`, 3600);
      }
      _setMissingMonthsMeta(miss);
      _scheduleMissingMonthsAutoRetry(miss);
    }else{
      if(_lastMissingMonthsSig){
        _toastSync('✅ 누락된 월 데이터 없이 모두 반영되었습니다', 2200);
      }
      _setMissingMonthsMeta([]);
      _scheduleMissingMonthsAutoRetry([]);
    }
  }catch(e){}
  try{ if(typeof window.refreshCloudSyncStatus==='function') window.refreshCloudSyncStatus('📥 다른 기기 데이터 수신', 'var(--blue)'); }catch(e){}
  if (typeof window.onFirebaseLoad === 'function') window.onFirebaseLoad(data);
  else _pending = data;
}
let _fbCallbackSet = false;
(function pollCallback() {
  if (_fbCallbackSet) return;
  if (typeof window.onFirebaseLoad === 'function' && _pending) {
    _fbCallbackSet = true;
    window.onFirebaseLoad(_pending);
    _pending = null;
  } else {
    setTimeout(pollCallback, 200);
  }
})();
function _firebaseSignalUrl(){
  return `${FB_AUX_DATABASE_URL}/${FB_AUX_SIGNAL_PATH}.json`;
}
function _firebaseSignalTs(sig){
  return Number(sig && (sig.savedAt || sig.version || sig.updatedAt) || 0) || 0;
}
function _rememberFirebaseSignal(sig){
  const ts = _firebaseSignalTs(sig);
  if(!ts) return 0;
  if(ts > _lastFirebaseSignalAt) _lastFirebaseSignalAt = ts;
  try{ localStorage.setItem('su_sync_last_firebase_signal_at', String(_lastFirebaseSignalAt)); }catch(e){}
  return ts;
}
function _toastSync(msg, ms){
  try{
    if(typeof window.showToast === 'function') window.showToast(msg, ms || 2200);
  }catch(e){}
}
function _setMissingMonthsMeta(months){
  const arr = Array.isArray(months) ? months.filter(Boolean) : [];
  const sig = arr.join(',');
  try{
    localStorage.setItem('su_sync_missing_months', JSON.stringify(arr));
    localStorage.setItem('su_sync_missing_months_sig', sig);
    localStorage.setItem('su_sync_missing_months_checked_at', String(Date.now()));
  }catch(e){}
  _lastMissingMonthsSig = sig;
  return { arr, sig };
}
async function _fetchFirebaseSignal(){
  const res = await fetch(_firebaseSignalUrl() + '?_=' + Date.now(), { cache:'no-store', mode:'cors' });
  if(!res.ok) throw new Error('Firebase signal HTTP ' + res.status);
  return await res.json();
}
async function _pushFirebaseSignal(meta){
  // [보안 수정] 소스에 하드코딩된 기본 비밀번호를 제거했습니다.
  // su_fb_pw가 로컬에 설정되어 있지 않으면 신호를 보내지 않고 조용히 건너뜁니다.
  const pw = localStorage.getItem('su_fb_pw') || '';
  if(!pw){
    console.warn('[firebase-signal] su_fb_pw가 설정되어 있지 않아 신호 푸시를 건너뜁니다. 관리자 설정에서 su_fb_pw를 지정하세요.');
    return;
  }
  const savedAt = Number(meta && meta.savedAt || Date.now()) || Date.now();
  const payload = {
    admin_pw: pw,
    source: 'github-primary',
    repo: `${GH_OWNER}/${GH_REPO}`,
    path: 'star-datacenter/data',
    savedAt,
    version: savedAt,
    changed: Array.isArray(meta && meta.changed) ? meta.changed.slice(0, 12) : ['all'],
    updatedAt: Date.now()
  };
  const res = await fetch(_firebaseSignalUrl(), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if(!res.ok) throw new Error('Firebase signal write failed: ' + res.status);
  try{ localStorage.setItem('su_sync_last_firebase_signal_push_at', String(payload.updatedAt)); }catch(e){}
  _rememberFirebaseSignal(payload);
}
async function _pollFirebaseSignalOnce(force){
  if(_firebaseSignalBusy) return;
  _firebaseSignalBusy = true;
  try{
    const sig = await _fetchFirebaseSignal();
    const sigTs = _firebaseSignalTs(sig);
    if(!sigTs) return;
    const prev = _lastFirebaseSignalAt;
    _rememberFirebaseSignal(sig);
    const hasNewSignal = sigTs > prev;
    if(hasNewSignal){
      if(!force){
        _toastPendingSignalTs = sigTs;
        _toastSync('📡 다른 기기에서 새 데이터 감지됨', 2200);
      }
      try{
        if(typeof window.refreshCloudSyncStatus==='function'){
          window.refreshCloudSyncStatus('📡 보조 신호 감지 — GitHub 확인 중', '#2563eb');
        }
      }catch(e){}
      const _ghPoll = (typeof window._pollGithubOnce==='function')
        ? window._pollGithubOnce : (typeof _pollGithubOnce==='function' ? _pollGithubOnce : null);
      if((sigTs > _lastSavedAt || !_lastSnapshot) && typeof _ghPoll==='function') await _ghPoll(true);
    }else if(force && !_lastSnapshot){
      const _ghPoll = (typeof window._pollGithubOnce==='function')
        ? window._pollGithubOnce : (typeof _pollGithubOnce==='function' ? _pollGithubOnce : null);
      if(typeof _ghPoll==='function') await _ghPoll(true);
    }
  }catch(e){}
  finally{
    _firebaseSignalBusy = false;
  }
}
window.fbForceSync = async function () {
  try{
    if(typeof window._b2FlushImgSettingsSave === 'function'){
      window._b2FlushImgSettingsSave();
      await new Promise(r=>setTimeout(r, 30));
    }
  }catch(e){}
  try{
    if(window._isSaving){
      try{ if(typeof window.refreshCloudSyncStatus==='function') window.refreshCloudSyncStatus('⏳ 저장 중이라 강제 동기화를 잠시 막음', '#d97706'); }catch(e){}
      alert('저장 중입니다.\n업로드가 끝난 뒤 다시 시도해주세요.');
      return false;
    }
  }catch(e){}
  const data = await _fetchGithubData();
  if (!data) return;
  try{
    const remoteSa = Number(data && data.savedAt || 0) || 0;
    const localSa = Math.max(
      Number(window._lastAdminSaveTime||0) || 0,
      Number(localStorage.getItem('su_last_admin_save')||0) || 0
    );
    if(remoteSa && localSa && localSa > remoteSa){
      const fmt = (ts)=>{ try{ return new Date(Number(ts)||0).toLocaleString('ko-KR'); }catch(e){ return String(ts||''); } };
      const ok = confirm(
        '로컬 데이터가 원격보다 더 최신으로 보입니다.\n\n'
        + `로컬 최근 저장: ${fmt(localSa)}\n`
        + `원격 savedAt: ${fmt(remoteSa)}\n\n`
        + '그래도 강제 동기화를 진행하면 로컬 변경사항이 원격 상태로 덮일 수 있습니다.\n'
        + '계속하시겠습니까?'
      );
      if(!ok){
        try{ if(typeof window.refreshCloudSyncStatus==='function') window.refreshCloudSyncStatus('✋ 강제 동기화 취소됨', '#d97706'); }catch(e){}
        return false;
      }
      try{ if(typeof window.refreshCloudSyncStatus==='function') window.refreshCloudSyncStatus('⚠️ 로컬보다 오래된 원격 강제 적용 중...', '#d97706'); }catch(e){}
    }else{
      try{ if(typeof window.refreshCloudSyncStatus==='function') window.refreshCloudSyncStatus('🔄 수동 동기화 시작...', '#2563eb'); }catch(e){}
    }
  }catch(e){}
  _lastSnapshot = data;
  try{
    const sa = Number(data && data.savedAt || 0) || 0;
    if(sa){
      _lastSavedAt = sa;
      localStorage.setItem('su_sync_last_remote_saved_at', String(sa));
    }
    localStorage.setItem('su_sync_last_received_at', String(Date.now()));
  }catch(e){}
  if (typeof window.onFirebaseLoad === 'function') {
    window._forcingSync = true;
    window.onFirebaseLoad(data);
    window._forcingSync = false;
  }
  try{ if(typeof localSave==='function') localSave(); }catch(e){}
  try{ if(typeof window._primeMatchSyncSignature === 'function') window._primeMatchSyncSignature(true); }catch(e){}
  try{ if(typeof window.refreshCloudSyncStatus==='function') window.refreshCloudSyncStatus('🔄 수동 동기화 완료', '#2563eb'); }catch(e){}
  return true;
};
try{ window._deliver = _deliver; }catch(e){}
try{ window._fetchFirebaseSignal = _fetchFirebaseSignal; }catch(e){}
try{ window._pushFirebaseSignal = _pushFirebaseSignal; }catch(e){}
try{ window._pollFirebaseSignalOnce = _pollFirebaseSignalOnce; }catch(e){}
try{ window._bindSyncAgeBadge = _bindSyncAgeBadge; }catch(e){}
try{ window._updateSyncAgeBadge = _updateSyncAgeBadge; }catch(e){}
