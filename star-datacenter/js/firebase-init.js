/* ══════════════════════════════════════
   GitHub data.json 동기화 호환 레이어
   - 파일명은 firebase-init.js 유지(기존 참조 호환)
   - 실제 동작은 Firebase를 쓰지 않고 GitHub 업로드/폴링만 수행
   - 저장 구조:
     1) star-datacenter/data.json        : 경량 엔트리 포인터
     2) star-datacenter/data/index.json  : 분리 저장 인덱스
     3) star-datacenter/data/core.json   : 공통 데이터
     4) star-datacenter/data/history/*.json : 월별 기록 데이터
══════════════════════════════════════ */

const GH_OWNER = 'nada1004';
const GH_REPO = 'star-system';
const GH_BRANCH = 'main';
const GH_ENTRY_PATH = 'star-datacenter/data.json';
const GH_SPLIT_INDEX_PATH = 'star-datacenter/data/index.json';
const GH_SPLIT_CORE_PATH = 'star-datacenter/data/core.json';
const GH_SPLIT_HISTORY_DIR = 'star-datacenter/data/history';
const GH_SPLIT_SCHEMA_VERSION = 2;
const GH_MONTHLY_KEYS = ['miniM','univM','comps','ckM','proM','ttM','indM','gjM'];
const FB_AUX_DATABASE_URL = 'https://stardata1004-default-rtdb.firebaseio.com';
const FB_AUX_SIGNAL_PATH = 'syncSignals/star-datacenter';
const FB_AUX_DEFAULT_PW = 'haram1019!@';

let _pending = null;
let _lastSnapshot = null;
let _lastSavedAt = 0;
let _saveChain = Promise.resolve();
let _lastFirebaseSignalAt = Number(localStorage.getItem('su_sync_last_firebase_signal_at')||0) || 0;
let _firebaseSignalBusy = false;
let _toastPendingSignalTs = 0;
let _lastMissingMonthsSig = String(localStorage.getItem('su_sync_missing_months_sig')||'');

function _deliver(data) {
  _lastSnapshot = data;
  try{
    const sa = Number(data && data.savedAt || 0) || 0;
    if(sa){
      _lastSavedAt = sa;
      localStorage.setItem('su_sync_last_remote_saved_at', String(sa));
    }
    localStorage.setItem('su_sync_last_received_at', String(Date.now()));
  }catch(e){}
  try{
    const sa = Number(data && data.savedAt || 0) || 0;
    if(_toastPendingSignalTs && sa && sa >= _toastPendingSignalTs){
      _toastSync('✅ 다른 기기 데이터가 반영되었습니다', 2200);
      _toastPendingSignalTs = 0;
    }
  }catch(e){}
  try{
    const miss = Array.isArray(data && data._missingMonths) ? data._missingMonths.filter(Boolean) : [];
    const sig = miss.join(',');
    if(miss.length){
      if(sig && sig !== _lastMissingMonthsSig){
        _toastSync(`⚠️ 일부 월 데이터 누락: ${miss.join(', ')}`, 3600);
      }
      _setMissingMonthsMeta(miss);
    }else{
      if(_lastMissingMonthsSig){
        _toastSync('✅ 누락된 월 데이터 없이 모두 반영되었습니다', 2200);
      }
      _setMissingMonthsMeta([]);
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

function _repoApiUrl(repoPath){
  return `https://api.github.com/repos/${GH_OWNER}/${GH_REPO}/contents/${repoPath}`;
}
function _repoRawUrl(repoPath){
  return `https://raw.githubusercontent.com/${GH_OWNER}/${GH_REPO}/${GH_BRANCH}/${repoPath}`;
}
function _repoCdnUrl(repoPath){
  return `https://cdn.jsdelivr.net/gh/${GH_OWNER}/${GH_REPO}@${GH_BRANCH}/${repoPath}`;
}
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
  const pw = localStorage.getItem('su_fb_pw') || FB_AUX_DEFAULT_PW;
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

function _decodeGithubPayload(raw){
  let d = raw;
  if(d && d.content && d.encoding === 'base64'){
    const b64 = String(d.content || '').replace(/\s/g,'');
    const bin = atob(b64);
    const bytes = new Uint8Array(bin.length);
    for(let i=0;i<bin.length;i++) bytes[i] = bin.charCodeAt(i);
    d = JSON.parse(new TextDecoder('utf-8').decode(bytes));
  }
  if(d && typeof d._lz === 'string' && window.LZString){
    d = JSON.parse(window.LZString.decompressFromBase64(d._lz));
  }
  return d;
}

function _encodeGithubPayload(obj){
  try{
    if(window.LZString){
      return { _lz: window.LZString.compressToBase64(JSON.stringify(obj)) };
    }
  }catch(e){}
  return obj;
}

async function _fetchRepoJson(repoPath){
  const urls = [
    _repoRawUrl(repoPath) + '?_=' + Date.now(),
    _repoCdnUrl(repoPath) + '?_=' + Date.now(),
    _repoApiUrl(repoPath)
  ];
  let lastErr = null;
  for(const url of urls){
    try{
      const res = await fetch(url, { cache:'no-store', mode:'cors' });
      if(!res.ok) throw new Error('HTTP ' + res.status);
      const text = (await res.text()).replace(/^\uFEFF/, '').trim();
      if(!text || text.startsWith('<')) throw new Error('invalid response');
      const raw = JSON.parse(text);
      return _decodeGithubPayload(raw);
    }catch(e){
      lastErr = e;
    }
  }
  throw lastErr || new Error(`${repoPath} fetch failed`);
}

async function _putRepoJsonOnce(repoPath, payloadObj, message){
  const token = localStorage.getItem('su_gh_token');
  if(!token) throw new Error('GitHub 토큰이 설정되어 있지 않습니다.');
  const apiUrl = _repoApiUrl(repoPath);
  let sha = undefined;
  const getRes = await fetch(apiUrl, {
    headers: { 'Authorization': `token ${token}`, 'Accept': 'application/vnd.github.v3+json' }
  });
  if(getRes.ok){
    const fileInfo = await getRes.json();
    sha = fileInfo && fileInfo.sha;
  }else if(getRes.status !== 404){
    throw new Error('GitHub 파일 조회 실패: ' + getRes.status);
  }
  const jsonStr = JSON.stringify(payloadObj);
  const b64 = btoa(unescape(encodeURIComponent(jsonStr)));
  const body = {
    message: `${message} ${new Date().toLocaleString('ko-KR')}`,
    content: b64,
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
  if (!putRes.ok) throw new Error(`${repoPath} 저장 실패: ${putRes.status}`);
}

async function _putRepoJson(repoPath, payloadObj, message){
  let lastErr = null;
  for(let attempt=0; attempt<3; attempt++){
    try{
      return await _putRepoJsonOnce(repoPath, payloadObj, message);
    }catch(e){
      lastErr = e;
      const msg = String((e && e.message) || e || '');
      if(!/409/.test(msg)) throw e;
      await new Promise(r=>setTimeout(r, 250 * (attempt + 1)));
    }
  }
  throw lastErr || new Error(`${repoPath} 저장 실패: 409`);
}

function _monthKeyFromValue(v){
  try{
    if(typeof v === 'number' && isFinite(v)){
      return new Date(v).toISOString().slice(0,7);
    }
    const s = String(v || '').trim();
    if(/^\d{4}-\d{2}/.test(s)) return s.slice(0,7);
    if(/^\d{4}\.\d{2}/.test(s)) return s.slice(0,7).replace('.', '-');
    if(/^\d{4}\/\d{2}/.test(s)) return s.slice(0,7).replace('/', '-');
  }catch(e){}
  return '';
}

function _ensureMonthBucket(months, mk){
  const key = mk || 'unknown';
  if(!months[key]){
    months[key] = {
      playerHistory: {},
      histExtItems: []
    };
    GH_MONTHLY_KEYS.forEach(k=>{ months[key][k] = []; });
  }
  return months[key];
}

function _clonePlain(v){
  try{ return JSON.parse(JSON.stringify(v)); }catch(e){ return v; }
}

function _buildSplitStoreData(fullData){
  const src = _clonePlain(fullData || {}) || {};
  const months = {};
  const savedAt = Number(src.savedAt || Date.now()) || Date.now();

  const core = { ...src, savedAt, schemaVersion: GH_SPLIT_SCHEMA_VERSION };

  if(Array.isArray(core.players)){
    core.players = core.players.map(p=>{
      const c = { ...(p || {}) };
      delete c.history;
      return c;
    });
  }

  GH_MONTHLY_KEYS.forEach(k=>{
    const arr = Array.isArray(src[k]) ? src[k] : [];
    arr.forEach(item=>{
      const mk = _monthKeyFromValue(item && (item.d || item.date || item.createdAt || item.savedAt)) || 'unknown';
      _ensureMonthBucket(months, mk)[k].push(item);
    });
    core[k] = [];
  });

  try{
    const hx = src.histExt || {};
    const items = Array.isArray(hx.items) ? hx.items : [];
    items.forEach(item=>{
      const mk = _monthKeyFromValue(item && (item.date || item.d || item.time)) || 'unknown';
      _ensureMonthBucket(months, mk).histExtItems.push(item);
    });
    core.histExt = { ...hx, items: [] };
  }catch(e){}

  try{
    (Array.isArray(src.players) ? src.players : []).forEach(p=>{
      const name = String(p && p.name || '').trim();
      const hist = Array.isArray(p && p.history) ? p.history : [];
      if(!name || !hist.length) return;
      hist.forEach(h=>{
        const mk = _monthKeyFromValue(h && (h.date || h.d || h.time)) || 'unknown';
        const bucket = _ensureMonthBucket(months, mk);
        if(!bucket.playerHistory[name]) bucket.playerHistory[name] = [];
        bucket.playerHistory[name].push(h);
      });
    });
  }catch(e){}

  const historyMonths = Object.keys(months).sort();
  const index = {
    schemaVersion: GH_SPLIT_SCHEMA_VERSION,
    splitStore: true,
    savedAt,
    corePath: GH_SPLIT_CORE_PATH,
    historyMonths,
    historyDir: GH_SPLIT_HISTORY_DIR
  };
  const entry = {
    schemaVersion: GH_SPLIT_SCHEMA_VERSION,
    splitStore: true,
    indexPath: GH_SPLIT_INDEX_PATH,
    savedAt,
    historyMonths
  };
  return { entry, index, core, months, historyMonths };
}

function _estimateSplitStore(fullData){
  const built = _buildSplitStoreData(fullData);
  const files = [];
  files.push({ path: GH_ENTRY_PATH, bytes: JSON.stringify(_encodeGithubPayload(built.entry)).length });
  files.push({ path: GH_SPLIT_INDEX_PATH, bytes: JSON.stringify(_encodeGithubPayload(built.index)).length });
  files.push({ path: GH_SPLIT_CORE_PATH, bytes: JSON.stringify(_encodeGithubPayload(built.core)).length });
  built.historyMonths.forEach(mk=>{
    const part = {
      schemaVersion: GH_SPLIT_SCHEMA_VERSION,
      month: mk,
      savedAt: built.index.savedAt,
      ...built.months[mk]
    };
    files.push({ path: `${GH_SPLIT_HISTORY_DIR}/${mk}.json`, bytes: JSON.stringify(_encodeGithubPayload(part)).length });
  });
  files.sort((a,b)=>b.bytes-a.bytes);
  return {
    fileCount: files.length,
    maxBytes: files[0] ? files[0].bytes : 0,
    totalBytes: files.reduce((s,x)=>s+x.bytes,0),
    files
  };
}

async function _saveSplitStore(fullData){
  const built = _buildSplitStoreData(fullData);
  await _putRepoJson(GH_SPLIT_CORE_PATH, _encodeGithubPayload(built.core), 'core.json 업데이트');
  for(const mk of built.historyMonths){
    const part = {
      schemaVersion: GH_SPLIT_SCHEMA_VERSION,
      month: mk,
      savedAt: built.index.savedAt,
      ...built.months[mk]
    };
    await _putRepoJson(`${GH_SPLIT_HISTORY_DIR}/${mk}.json`, _encodeGithubPayload(part), `${mk}.json 업데이트`);
  }
  await _putRepoJson(GH_SPLIT_INDEX_PATH, _encodeGithubPayload(built.index), 'index.json 업데이트');
  await _putRepoJson(GH_ENTRY_PATH, _encodeGithubPayload(built.entry), 'data.json 엔트리 업데이트');
}

async function _saveLegacySingleFile(fullData){
  const legacy = _encodeGithubPayload(fullData || {});
  await _putRepoJson(GH_ENTRY_PATH, legacy, 'data.json 단일 저장');
}

function _queueGithubSave(task){
  const run = async ()=>task();
  const p = _saveChain.then(run, run);
  _saveChain = p.catch(()=>{});
  return p;
}

async function _fetchSplitGithubData(indexLike){
  const idx = indexLike && indexLike.corePath ? indexLike : await _fetchRepoJson(GH_SPLIT_INDEX_PATH);
  const months = Array.isArray(idx && idx.historyMonths) ? idx.historyMonths : [];
  const core = await _fetchRepoJson(String(idx.corePath || GH_SPLIT_CORE_PATH));
  const missingMonths = [];
  const monthParts = await Promise.all(months.map(async mk=>{
    try{
      return await _fetchRepoJson(`${String(idx.historyDir || GH_SPLIT_HISTORY_DIR)}/${mk}.json`);
    }catch(e){
      missingMonths.push(mk);
      return null;
    }
  }));
  const out = { ...(core || {}), savedAt: Number((idx && idx.savedAt) || (core && core.savedAt) || Date.now()) || Date.now() };
  GH_MONTHLY_KEYS.forEach(k=>{ out[k] = []; });
  if(!out.histExt || typeof out.histExt !== 'object') out.histExt = {};
  out.histExt.items = [];

  const histMap = {};
  monthParts.filter(Boolean).forEach(part=>{
    GH_MONTHLY_KEYS.forEach(k=>{
      if(Array.isArray(part[k])) out[k] = out[k].concat(part[k]);
    });
    if(Array.isArray(part.histExtItems)) out.histExt.items = out.histExt.items.concat(part.histExtItems);
    const ph = part.playerHistory || {};
    Object.keys(ph).forEach(name=>{
      if(!histMap[name]) histMap[name] = [];
      if(Array.isArray(ph[name])) histMap[name] = histMap[name].concat(ph[name]);
    });
  });

  if(Array.isArray(out.players)){
    out.players = out.players.map(p=>{
      const name = String(p && p.name || '').trim();
      return { ...(p || {}), history: histMap[name] || [] };
    });
  }
  out.schemaVersion = GH_SPLIT_SCHEMA_VERSION;
  out._missingMonths = missingMonths;
  return out;
}
function _mergeMonthPartsIntoData(baseData, monthParts){
  const out = _clonePlain(baseData || {}) || {};
  GH_MONTHLY_KEYS.forEach(k=>{ if(!Array.isArray(out[k])) out[k] = []; });
  if(!out.histExt || typeof out.histExt !== 'object') out.histExt = {};
  if(!Array.isArray(out.histExt.items)) out.histExt.items = [];
  const playerMap = new Map();
  if(Array.isArray(out.players)){
    out.players.forEach((p, idx)=>{
      const name = String(p && p.name || '').trim();
      if(name) playerMap.set(name, idx);
      if(!Array.isArray(out.players[idx].history)) out.players[idx].history = [];
    });
  }
  (Array.isArray(monthParts) ? monthParts : []).filter(Boolean).forEach(part=>{
    GH_MONTHLY_KEYS.forEach(k=>{
      if(Array.isArray(part[k])) out[k] = out[k].concat(part[k]);
    });
    if(Array.isArray(part.histExtItems)) out.histExt.items = out.histExt.items.concat(part.histExtItems);
    const ph = part.playerHistory || {};
    Object.keys(ph).forEach(name=>{
      if(!playerMap.has(name)) return;
      const idx = playerMap.get(name);
      const cur = Array.isArray(out.players[idx].history) ? out.players[idx].history : [];
      out.players[idx].history = cur.concat(Array.isArray(ph[name]) ? ph[name] : []);
    });
    const psa = Number(part && part.savedAt || 0) || 0;
    if(psa) out.savedAt = Math.max(Number(out.savedAt||0)||0, psa);
  });
  return out;
}

async function _fetchGithubData(){
  let entryErr = null;
  try{
    const entry = await _fetchRepoJson(GH_ENTRY_PATH);
    if(entry && entry.splitStore){
      return await _fetchSplitGithubData(entry.indexPath ? await _fetchRepoJson(entry.indexPath) : entry);
    }
    return entry;
  }catch(e){
    entryErr = e;
  }
  try{
    const idx = await _fetchRepoJson(GH_SPLIT_INDEX_PATH);
    return await _fetchSplitGithubData(idx);
  }catch(e){
    throw entryErr || e || new Error('GitHub data fetch failed');
  }
}

async function _pollGithubOnce(force){
  try{
    const d = await _fetchGithubData();
    const sa = Number(d && d.savedAt || 0) || 0;
    if(force || (sa && sa > _lastSavedAt) || !_lastSnapshot){
      _deliver(d);
    }
  }catch(e){}
}
window.fbRetryMissingMonths = async function(){
  const missing = (()=>{ try{ return JSON.parse(localStorage.getItem('su_sync_missing_months')||'[]')||[]; }catch(e){ return []; } })().filter(Boolean);
  if(!missing.length){
    _toastSync('✅ 누락된 월이 없습니다', 1800);
    try{ if(typeof window.refreshCloudSyncStatus==='function') window.refreshCloudSyncStatus('✅ 누락 월 없음', '#16a34a'); }catch(e){}
    return { ok:true, retried:[], stillMissing:[] };
  }
  try{ if(typeof window.refreshCloudSyncStatus==='function') window.refreshCloudSyncStatus('🔄 누락 월 다시 받는 중...', '#2563eb'); }catch(e){}
  const idx = await _fetchRepoJson(GH_SPLIT_INDEX_PATH);
  const historyDir = String((idx && idx.historyDir) || GH_SPLIT_HISTORY_DIR);
  const retried = [];
  const stillMissing = [];
  const parts = await Promise.all(missing.map(async mk=>{
    try{
      const part = await _fetchRepoJson(`${historyDir}/${mk}.json`);
      retried.push(mk);
      return part;
    }catch(e){
      stillMissing.push(mk);
      return null;
    }
  }));
  if(retried.length){
    const base = _lastSnapshot || await _fetchGithubData();
    const next = _mergeMonthPartsIntoData(base, parts);
    next._missingMonths = stillMissing;
    _deliver(next);
    try{ if(typeof localSave==='function') localSave(); }catch(e){}
  }else{
    _setMissingMonthsMeta(stillMissing);
    try{ if(typeof window.refreshCloudSyncStatus==='function') window.refreshCloudSyncStatus('⚠️ 누락 월 재수신 실패', '#d97706'); }catch(e){}
  }
  if(retried.length && !stillMissing.length) _toastSync('✅ 누락 월 데이터를 모두 다시 받았습니다', 2400);
  else if(retried.length) _toastSync(`⚠️ 일부만 복구됨: ${stillMissing.join(', ')}`, 3200);
  else _toastSync('❌ 누락 월 다시받기 실패', 2400);
  return { ok: retried.length>0, retried, stillMissing };
};
async function _pollFirebaseSignalOnce(force){
  if(_firebaseSignalBusy) return;
  _firebaseSignalBusy = true;
  try{
    const sig = await _fetchFirebaseSignal();
    const sigTs = _firebaseSignalTs(sig);
    if(!sigTs) return;
    const prev = _lastFirebaseSignalAt;
    _rememberFirebaseSignal(sig);
    if(force || sigTs > prev){
      if(!force && sigTs > prev){
        _toastPendingSignalTs = sigTs;
        _toastSync('📡 다른 기기에서 새 데이터 감지됨', 2200);
      }
      try{
        if(typeof window.refreshCloudSyncStatus==='function'){
          window.refreshCloudSyncStatus('📡 보조 신호 감지 — GitHub 확인 중', '#2563eb');
        }
      }catch(e){}
      if(force || sigTs > _lastSavedAt || !_lastSnapshot){
        await _pollGithubOnce(true);
      }
    }
  }catch(e){}
  finally{
    _firebaseSignalBusy = false;
  }
}

window.__suBuildSplitStoreData = _buildSplitStoreData;
window.__suEstimateSplitStore = _estimateSplitStore;
window.__suFetchGithubMergedData = _fetchGithubData;

// 데이터 쓰기 함수 (기존 fbSet 호환)
// - data는 보통 { _lz: '...' } 형태로 들어옴
window.fbSet = async function (data) {
  return _queueGithubSave(async ()=>{
    const full = _decodeGithubPayload(data);
    const savedAt = Number(full && full.savedAt || Date.now()) || Date.now();
    try{
      await _saveSplitStore(full);
    }catch(splitErr){
      console.warn('[split-save] failed, fallback to legacy data.json', splitErr);
      await _saveLegacySingleFile(full);
    }
    try{ await _pushFirebaseSignal({ savedAt, changed:['all'] }); }catch(sigErr){ console.warn('[firebase-signal] notify failed', sigErr); }
  });
};

// 부분 업데이트 호환
// - 현재 GitHub 데이터를 읽어서 병합 후 다시 업로드
window.fbUpdate = async function (patch) {
  return _queueGithubSave(async ()=>{
    const cur = await _fetchGithubData().catch(()=>({}));
    const next = { ...(cur || {}), ...(patch || {}), savedAt: Date.now() };
    const changed = Object.keys(patch || {});
    try{
      await _saveSplitStore(next);
    }catch(splitErr){
      console.warn('[split-save] failed on update, fallback to legacy data.json', splitErr);
      await _saveLegacySingleFile(next);
    }
    try{ await _pushFirebaseSignal({ savedAt: next.savedAt, changed }); }catch(sigErr){ console.warn('[firebase-signal] notify failed', sigErr); }
  });
};

// 강제 1회 fetch (수동 동기화 버튼용)
window.fbForceSync = async function () {
  const data = await _fetchGithubData();
  if (!data) return;
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
  try{ if(typeof window.refreshCloudSyncStatus==='function') window.refreshCloudSyncStatus('🔄 수동 동기화 완료', '#2563eb'); }catch(e){}
};

// 초기 로드 + 주기적 GitHub polling
setTimeout(()=>{ _pollGithubOnce(true); _pollFirebaseSignalOnce(true); }, 150);
setInterval(()=>{
  if(document.visibilityState !== 'visible') return;
  _pollFirebaseSignalOnce(false);
}, 2000);
setInterval(()=>{
  if(document.visibilityState !== 'visible') return;
  _pollGithubOnce(false);
}, 5000);
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    _pollFirebaseSignalOnce(true);
    _pollGithubOnce(true);
  }
});
