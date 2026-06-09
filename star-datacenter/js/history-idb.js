/* LEGACY - NOT LOADED — 레거시 파일. index.html에서 로드되지 않습니다. */
/* ══════════════════════════════════════
   IndexedDB 1차 도입
   - 경기 기록/대회/사진/기초 데이터 localStorage → IndexedDB로 분리
   - 대상: miniM, univM, ckM, proM, ttM, indM, gjM, comps, tourneys, proTourneys,
           players base/history/photo, boardPlayerOrder, votes, rank snapshot,
           univCfg, maps, tourD, boardOrder, notices, seasons, calScheduled
   - 작은 설정값/세션/UI 상태는 기존 localStorage 유지
══════════════════════════════════════ */
(function(){
  const DB_NAME = 'star-datacenter-db';
  const DB_VERSION = 1;
  const STORE_NAME = 'historyKv';
  const META_KEY = '__meta__';
  const PLAYER_BASE_KEY = 'playerBaseList';
  const PLAYER_HISTORY_KEY = 'playerHistMap';
  const PLAYER_PHOTO_KEY = 'playerPhotoMap';
  const BOARD_PLAYER_ORDER_KEY = 'boardPlayerOrderMap';
  const VOTE_DATA_KEY = 'voteDataMap';
  const RANK_SNAPSHOT_KEY = 'rankSnapshotMeta';
  const MODE_KEY = 'su_history_store_mode';
  const MIGRATION_KEY = 'su_history_idb_migrated_v1';
  const HISTORY_KEYS = [
    { idbKey:'miniM', lsKey:'su_mm', get:()=>miniM, set:(v)=>{ miniM = Array.isArray(v) ? v : []; } },
    { idbKey:'univM', lsKey:'su_um', get:()=>univM, set:(v)=>{ univM = Array.isArray(v) ? v : []; } },
    { idbKey:'ckM',   lsKey:'su_ck', get:()=>ckM,   set:(v)=>{ ckM = Array.isArray(v) ? v : []; } },
    { idbKey:'proM',  lsKey:'su_pro', get:()=>proM, set:(v)=>{ proM = Array.isArray(v) ? v : []; } },
    { idbKey:'ttM',   lsKey:'su_ttm', get:()=>ttM,  set:(v)=>{ ttM = Array.isArray(v) ? v : []; } },
    { idbKey:'indM',  lsKey:'su_indm', get:()=>indM,set:(v)=>{ indM = Array.isArray(v) ? v : []; } },
    { idbKey:'gjM',   lsKey:'su_gjm', get:()=>gjM,  set:(v)=>{ gjM = Array.isArray(v) ? v : []; } },
    { idbKey:'comps', lsKey:'su_cm',  get:()=>comps, set:(v)=>{ comps = Array.isArray(v) ? v : []; } },
    { idbKey:'tourneys', lsKey:'su_tn', get:()=>tourneys, set:(v)=>{ tourneys = Array.isArray(v) ? v : []; } },
    { idbKey:'proTourneys', lsKey:'su_ptn', get:()=>proTourneys, set:(v)=>{ proTourneys = Array.isArray(v) ? v : []; } },
    { idbKey:'univCfg', lsKey:'su_u', get:()=>univCfg, set:(v)=>{ univCfg = Array.isArray(v) ? v : []; } },
    { idbKey:'maps', lsKey:'su_m', get:()=>maps, set:(v)=>{ maps = Array.isArray(v) ? v : []; } },
    { idbKey:'tourD', lsKey:'su_t', get:()=>tourD, set:(v)=>{ tourD = Array.isArray(v) ? v : []; } },
    { idbKey:'boardOrder', lsKey:'su_boardOrder', get:()=>boardOrder, set:(v)=>{ boardOrder = Array.isArray(v) ? v : []; } },
    { idbKey:'notices', lsKey:'su_notices', get:()=>notices, set:(v)=>{ notices = Array.isArray(v) ? v : []; } },
    { idbKey:'seasons', lsKey:'su_seasons', get:()=>seasons, set:(v)=>{ seasons = Array.isArray(v) ? v : []; } },
    { idbKey:'calScheduled', lsKey:'su_cal_sched', get:()=>calScheduled, set:(v)=>{ calScheduled = Array.isArray(v) ? v : []; } },
  ];

  let _dbPromise = null;
  let _persistTimer = null;
  let _pendingSnapshot = null;
  let _playerBaseTimer = null;
  let _pendingPlayerBaseList = null;
  let _playerHistTimer = null;
  let _pendingPlayerHistMap = null;
  let _photoTimer = null;
  let _pendingPhotoMap = null;
  let _boardPlayerOrderTimer = null;
  let _pendingBoardPlayerOrderMap = null;
  let _voteTimer = null;
  let _pendingVoteDataMap = null;
  let _rankTimer = null;
  let _pendingRankSnapshotMeta = null;
  let _persistChain = Promise.resolve();
  let _idbUsable = typeof indexedDB !== 'undefined';

  function _clonePlain(value){
    try{ return JSON.parse(JSON.stringify(value)); }catch(e){ return value; }
  }
  function _historySnapshotFromGlobals(){
    const out = {};
    HISTORY_KEYS.forEach(k=>{ out[k.idbKey] = _clonePlain(k.get() || []); });
    return out;
  }
  function _playerHistoryMapFromGlobals(){
    const out = {};
    (Array.isArray(players) ? players : []).forEach(p=>{
      const name = String(p && p.name || '').trim();
      if(!name) return;
      out[name] = _clonePlain(Array.isArray(p.history) ? p.history : []);
    });
    return out;
  }
  function _playerBaseListFromGlobals(){
    return _clonePlain(Array.isArray(players) ? players.map(p=>{
      const c = { ...(p||{}) };
      delete c.photo;
      delete c.history;
      return c;
    }) : []);
  }
  function _playerPhotoMapFromGlobals(){
    const out = {};
    (Array.isArray(players) ? players : []).forEach(p=>{
      const name = String(p && p.name || '').trim();
      if(!name || !p || !p.photo) return;
      out[name] = p.photo;
    });
    return out;
  }
  function _boardPlayerOrderMapFromGlobals(){
    return _clonePlain((typeof boardPlayerOrder === 'object' && boardPlayerOrder) ? boardPlayerOrder : {});
  }
  function _voteDataMapFromGlobals(){
    return _clonePlain((typeof voteData === 'object' && voteData) ? voteData : {});
  }
  function _rankSnapshotMetaFromGlobals(){
    return _clonePlain({
      snap: (typeof _rankSnapshot === 'object' && _rankSnapshot) ? _rankSnapshot : {},
      date: String(typeof _rankSnapDate !== 'undefined' ? (_rankSnapDate || '') : '')
    });
  }
  function _saveHistoryFallbackToLocalStorage(snapshot){
    try{
      HISTORY_KEYS.forEach(k=>{
        if(typeof _lsSave === 'function') _lsSave(k.lsKey, snapshot[k.idbKey] || []);
      });
      localStorage.setItem(MODE_KEY, 'local');
    }catch(e){}
  }
  function _savePhotoFallbackToLocalStorage(map){
    try{
      if(typeof _lsSave === 'function') _lsSave('su_pp', map || {});
    }catch(e){}
  }
  function _savePlayerBaseFallbackToLocalStorage(list){
    try{
      if(typeof _lsSave === 'function') _lsSave('su_p', list || []);
    }catch(e){}
  }
  function _saveBoardPlayerOrderFallbackToLocalStorage(map){
    try{
      if(typeof _lsSave === 'function') _lsSave('su_bpo', map || {});
      else localStorage.setItem('su_bpo', JSON.stringify(map || {}));
    }catch(e){}
  }
  function _saveVoteDataFallbackToLocalStorage(map){
    try{ localStorage.setItem('su_votes', JSON.stringify(map || {})); }catch(e){}
  }
  function _saveRankSnapshotFallbackToLocalStorage(meta){
    try{
      const snap = meta && typeof meta === 'object' ? (meta.snap || {}) : {};
      const date = meta && typeof meta === 'object' ? String(meta.date || '') : '';
      localStorage.setItem('su_rank_snap', JSON.stringify(snap));
      localStorage.setItem('su_rank_snap_date', date);
    }catch(e){}
  }
  function _hasLegacyPlayerHistoryInPlayers(){
    try{
      return (Array.isArray(players) ? players : []).some(p=>Array.isArray(p && p.history) && p.history.length);
    }catch(e){
      return false;
    }
  }
  function _applyPlayerHistoryMapToPlayers(map){
    const src = (map && typeof map === 'object') ? map : {};
    (Array.isArray(players) ? players : []).forEach(p=>{
      const name = String(p && p.name || '').trim();
      if(!name) return;
      p.history = Array.isArray(src[name]) ? src[name] : [];
    });
  }
  function _applyPhotoMapToPlayers(map){
    const src = (map && typeof map === 'object') ? map : {};
    (Array.isArray(players) ? players : []).forEach(p=>{
      const name = String(p && p.name || '').trim();
      if(!name) return;
      if(src[name]) p.photo = src[name];
    });
  }
  function _applyBoardPlayerOrderMap(map){
    try{
      const src = (map && typeof map === 'object') ? map : {};
      if(typeof boardPlayerOrder === 'undefined' || !boardPlayerOrder || typeof boardPlayerOrder !== 'object'){
        boardPlayerOrder = {};
      }
      Object.keys(boardPlayerOrder).forEach(k=>delete boardPlayerOrder[k]);
      Object.assign(boardPlayerOrder, src);
    }catch(e){
      try{ boardPlayerOrder = (map && typeof map === 'object') ? map : {}; }catch(_){}
    }
  }
  function _applyVoteDataMap(map){
    try{
      const src = (map && typeof map === 'object') ? map : {};
      if(typeof voteData === 'undefined' || !voteData || typeof voteData !== 'object'){
        voteData = {};
      }
      Object.keys(voteData).forEach(k=>delete voteData[k]);
      Object.assign(voteData, src);
    }catch(e){
      try{ voteData = (map && typeof map === 'object') ? map : {}; }catch(_){}
    }
  }
  function _applyRankSnapshotMeta(meta){
    const src = (meta && typeof meta === 'object') ? meta : {};
    try{ _rankSnapshot = (src.snap && typeof src.snap === 'object') ? src.snap : {}; }catch(e){}
    try{ _rankSnapDate = String(src.date || ''); }catch(e){}
  }
  function _cleanupLegacyHistoryLocalStorage(){
    try{
      HISTORY_KEYS.forEach(k=>localStorage.removeItem(k.lsKey));
      localStorage.removeItem('su_p');
      localStorage.removeItem('su_pp');
      localStorage.removeItem('su_bpo');
      localStorage.removeItem('su_votes');
      localStorage.removeItem('su_rank_snap');
      localStorage.removeItem('su_rank_snap_date');
      localStorage.setItem(MODE_KEY, 'idb');
      localStorage.setItem(MIGRATION_KEY, '1');
    }catch(e){}
  }
  function _hasAnyLegacyLocalHistory(){
    try{
      return HISTORY_KEYS.some(k=>{
        const raw = localStorage.getItem(k.lsKey);
        return !!(raw && raw.length);
      });
    }catch(e){
      return false;
    }
  }
  function _hasLegacyPhotoMap(){
    try{
      const raw = localStorage.getItem('su_pp');
      return !!(raw && raw.length);
    }catch(e){
      return false;
    }
  }
  function _hasLegacyPlayerBase(){
    try{
      const raw = localStorage.getItem('su_p');
      return !!(raw && raw.length);
    }catch(e){
      return false;
    }
  }
  function _hasLegacyBoardPlayerOrder(){
    try{
      const raw = localStorage.getItem('su_bpo');
      return !!(raw && raw.length);
    }catch(e){
      return false;
    }
  }
  function _hasLegacyVotes(){
    try{
      const raw = localStorage.getItem('su_votes');
      return !!(raw && raw.length);
    }catch(e){
      return false;
    }
  }
  function _hasLegacyRankSnapshot(){
    try{
      const raw = localStorage.getItem('su_rank_snap');
      return !!(raw && raw.length);
    }catch(e){
      return false;
    }
  }
  function _applyHistorySnapshot(snapshot){
    HISTORY_KEYS.forEach(k=>{
      if(Object.prototype.hasOwnProperty.call(snapshot, k.idbKey)){
        k.set(Array.isArray(snapshot[k.idbKey]) ? snapshot[k.idbKey] : []);
      }
    });
  }
  function _applyPlayerBaseList(list){
    try{
      const next = Array.isArray(list) ? list : [];
      if(typeof _unpackPlayers === 'function') players = _unpackPlayers(next) || [];
      else players = next;
      try{
        if(window._playerSchemaNeedsSave && typeof localSave === 'function'){
          localSave();
          window._playerSchemaNeedsSave = false;
        }
      }catch(_e){}
    }catch(e){
      players = Array.isArray(list) ? list : [];
    }
  }
  function _openHistoryDb(){
    if(!_idbUsable) return Promise.reject(new Error('indexedDB unavailable'));
    if(_dbPromise) return _dbPromise;
    _dbPromise = new Promise((resolve, reject)=>{
      try{
        const req = indexedDB.open(DB_NAME, DB_VERSION);
        req.onupgradeneeded = ()=>{
          const db = req.result;
          if(!db.objectStoreNames.contains(STORE_NAME)){
            db.createObjectStore(STORE_NAME);
          }
        };
        req.onsuccess = ()=>resolve(req.result);
        req.onerror = ()=>reject(req.error || new Error('indexedDB open failed'));
      }catch(e){
        reject(e);
      }
    }).catch(err=>{
      _idbUsable = false;
      throw err;
    });
    return _dbPromise;
  }
  async function _idbGetMany(keys){
    const db = await _openHistoryDb();
    return new Promise((resolve, reject)=>{
      try{
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const out = {};
        let left = keys.length;
        if(!left){ resolve(out); return; }
        keys.forEach(key=>{
          const req = store.get(key);
          req.onsuccess = ()=>{
            out[key] = req.result;
            left -= 1;
            if(left === 0) resolve(out);
          };
          req.onerror = ()=>reject(req.error || new Error('indexedDB get failed: ' + key));
        });
      }catch(e){
        reject(e);
      }
    });
  }
  async function _idbPutSnapshot(snapshot){
    const db = await _openHistoryDb();
    return new Promise((resolve, reject)=>{
      try{
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        HISTORY_KEYS.forEach(k=>{
          store.put(snapshot[k.idbKey] || [], k.idbKey);
        });
        store.put({ updatedAt: Date.now(), mode:'idb' }, META_KEY);
        tx.oncomplete = ()=>resolve(true);
        tx.onerror = ()=>reject(tx.error || new Error('indexedDB put failed'));
      }catch(e){
        reject(e);
      }
    });
  }
  async function _idbPutPlayerHistoryMap(map){
    const db = await _openHistoryDb();
    return new Promise((resolve, reject)=>{
      try{
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        store.put(map || {}, PLAYER_HISTORY_KEY);
        tx.oncomplete = ()=>resolve(true);
        tx.onerror = ()=>reject(tx.error || new Error('indexedDB put playerHistMap failed'));
      }catch(e){
        reject(e);
      }
    });
  }
  async function _idbPutPlayerBaseList(list){
    const db = await _openHistoryDb();
    return new Promise((resolve, reject)=>{
      try{
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        store.put(list || [], PLAYER_BASE_KEY);
        tx.oncomplete = ()=>resolve(true);
        tx.onerror = ()=>reject(tx.error || new Error('indexedDB put playerBaseList failed'));
      }catch(e){
        reject(e);
      }
    });
  }
  async function _idbPutPlayerPhotoMap(map){
    const db = await _openHistoryDb();
    return new Promise((resolve, reject)=>{
      try{
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        store.put(map || {}, PLAYER_PHOTO_KEY);
        tx.oncomplete = ()=>resolve(true);
        tx.onerror = ()=>reject(tx.error || new Error('indexedDB put playerPhotoMap failed'));
      }catch(e){
        reject(e);
      }
    });
  }
  async function _idbPutBoardPlayerOrderMap(map){
    const db = await _openHistoryDb();
    return new Promise((resolve, reject)=>{
      try{
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        store.put(map || {}, BOARD_PLAYER_ORDER_KEY);
        tx.oncomplete = ()=>resolve(true);
        tx.onerror = ()=>reject(tx.error || new Error('indexedDB put boardPlayerOrderMap failed'));
      }catch(e){
        reject(e);
      }
    });
  }
  async function _idbPutVoteDataMap(map){
    const db = await _openHistoryDb();
    return new Promise((resolve, reject)=>{
      try{
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        store.put(map || {}, VOTE_DATA_KEY);
        tx.oncomplete = ()=>resolve(true);
        tx.onerror = ()=>reject(tx.error || new Error('indexedDB put voteDataMap failed'));
      }catch(e){
        reject(e);
      }
    });
  }
  async function _idbPutRankSnapshotMeta(meta){
    const db = await _openHistoryDb();
    return new Promise((resolve, reject)=>{
      try{
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        store.put(meta || { snap:{}, date:'' }, RANK_SNAPSHOT_KEY);
        tx.oncomplete = ()=>resolve(true);
        tx.onerror = ()=>reject(tx.error || new Error('indexedDB put rankSnapshotMeta failed'));
      }catch(e){
        reject(e);
      }
    });
  }
  async function _persistHistorySnapshot(snapshot){
    const snap = snapshot || _pendingSnapshot;
    if(!snap) return false;
    try{
      await _idbPutSnapshot(snap);
      _cleanupLegacyHistoryLocalStorage();
      return true;
    }catch(e){
      console.warn('[history-idb] persist failed, fallback to localStorage', e);
      _saveHistoryFallbackToLocalStorage(snap);
      return false;
    }
  }
  async function _persistPlayerHistoryMap(map){
    const next = map || _pendingPlayerHistMap;
    if(!next) return false;
    try{
      await _idbPutPlayerHistoryMap(next);
      return true;
    }catch(e){
      console.warn('[history-idb] player history persist failed', e);
      return false;
    }
  }
  async function _persistPlayerBaseList(list){
    const next = list || _pendingPlayerBaseList;
    if(!next) return false;
    try{
      await _idbPutPlayerBaseList(next);
      try{ localStorage.removeItem('su_p'); }catch(e){}
      return true;
    }catch(e){
      console.warn('[history-idb] player base persist failed', e);
      _savePlayerBaseFallbackToLocalStorage(next);
      return false;
    }
  }
  async function _persistPlayerPhotoMap(map){
    const next = map || _pendingPhotoMap;
    if(!next) return false;
    try{
      await _idbPutPlayerPhotoMap(next);
      try{ localStorage.removeItem('su_pp'); }catch(e){}
      return true;
    }catch(e){
      console.warn('[history-idb] player photo persist failed', e);
      _savePhotoFallbackToLocalStorage(next);
      return false;
    }
  }
  async function _persistBoardPlayerOrderMap(map){
    const next = map || _pendingBoardPlayerOrderMap;
    if(!next) return false;
    try{
      await _idbPutBoardPlayerOrderMap(next);
      try{ localStorage.removeItem('su_bpo'); }catch(e){}
      return true;
    }catch(e){
      console.warn('[history-idb] boardPlayerOrder persist failed', e);
      _saveBoardPlayerOrderFallbackToLocalStorage(next);
      return false;
    }
  }
  async function _persistVoteDataMap(map){
    const next = map || _pendingVoteDataMap;
    if(!next) return false;
    try{
      await _idbPutVoteDataMap(next);
      try{ localStorage.removeItem('su_votes'); }catch(e){}
      return true;
    }catch(e){
      console.warn('[history-idb] voteData persist failed', e);
      _saveVoteDataFallbackToLocalStorage(next);
      return false;
    }
  }
  async function _persistRankSnapshotMeta(meta){
    const next = meta || _pendingRankSnapshotMeta;
    if(!next) return false;
    try{
      await _idbPutRankSnapshotMeta(next);
      try{
        localStorage.removeItem('su_rank_snap');
        localStorage.removeItem('su_rank_snap_date');
      }catch(e){}
      return true;
    }catch(e){
      console.warn('[history-idb] rankSnapshot persist failed', e);
      _saveRankSnapshotFallbackToLocalStorage(next);
      return false;
    }
  }
  function _queueHistoryPersist(snapshot, immediate){
    _pendingSnapshot = _clonePlain(snapshot || _historySnapshotFromGlobals());
    if(_persistTimer) clearTimeout(_persistTimer);
    const delay = immediate ? 0 : 120;
    _persistTimer = setTimeout(()=>{
      _persistTimer = null;
      const snap = _pendingSnapshot;
      _pendingSnapshot = null;
      _persistChain = _persistChain.then(()=>_persistHistorySnapshot(snap)).catch(()=>{});
    }, delay);
    return true;
  }
  function _queuePlayerBasePersist(list, immediate){
    _pendingPlayerBaseList = _clonePlain(list || _playerBaseListFromGlobals());
    if(_playerBaseTimer) clearTimeout(_playerBaseTimer);
    const delay = immediate ? 0 : 120;
    _playerBaseTimer = setTimeout(()=>{
      _playerBaseTimer = null;
      const next = _pendingPlayerBaseList;
      _pendingPlayerBaseList = null;
      _persistChain = _persistChain.then(()=>_persistPlayerBaseList(next)).catch(()=>{});
    }, delay);
    return true;
  }
  function _queuePlayerHistoryPersist(map, immediate){
    _pendingPlayerHistMap = _clonePlain(map || _playerHistoryMapFromGlobals());
    if(_playerHistTimer) clearTimeout(_playerHistTimer);
    const delay = immediate ? 0 : 120;
    _playerHistTimer = setTimeout(()=>{
      _playerHistTimer = null;
      const next = _pendingPlayerHistMap;
      _pendingPlayerHistMap = null;
      _persistChain = _persistChain.then(()=>_persistPlayerHistoryMap(next)).catch(()=>{});
    }, delay);
    return true;
  }
  function _queuePlayerPhotoPersist(map, immediate){
    _pendingPhotoMap = _clonePlain(map || _playerPhotoMapFromGlobals());
    if(_photoTimer) clearTimeout(_photoTimer);
    const delay = immediate ? 0 : 120;
    _photoTimer = setTimeout(()=>{
      _photoTimer = null;
      const next = _pendingPhotoMap;
      _pendingPhotoMap = null;
      _persistChain = _persistChain.then(()=>_persistPlayerPhotoMap(next)).catch(()=>{});
    }, delay);
    return true;
  }
  function _queueBoardPlayerOrderPersist(map, immediate){
    _pendingBoardPlayerOrderMap = _clonePlain(map || _boardPlayerOrderMapFromGlobals());
    if(_boardPlayerOrderTimer) clearTimeout(_boardPlayerOrderTimer);
    const delay = immediate ? 0 : 120;
    _boardPlayerOrderTimer = setTimeout(()=>{
      _boardPlayerOrderTimer = null;
      const next = _pendingBoardPlayerOrderMap;
      _pendingBoardPlayerOrderMap = null;
      _persistChain = _persistChain.then(()=>_persistBoardPlayerOrderMap(next)).catch(()=>{});
    }, delay);
    return true;
  }
  function _queueVoteDataPersist(map, immediate){
    _pendingVoteDataMap = _clonePlain(map || _voteDataMapFromGlobals());
    if(_voteTimer) clearTimeout(_voteTimer);
    const delay = immediate ? 0 : 120;
    _voteTimer = setTimeout(()=>{
      _voteTimer = null;
      const next = _pendingVoteDataMap;
      _pendingVoteDataMap = null;
      _persistChain = _persistChain.then(()=>_persistVoteDataMap(next)).catch(()=>{});
    }, delay);
    return true;
  }
  function _queueRankSnapshotPersist(meta, immediate){
    _pendingRankSnapshotMeta = _clonePlain(meta || _rankSnapshotMetaFromGlobals());
    if(_rankTimer) clearTimeout(_rankTimer);
    const delay = immediate ? 0 : 120;
    _rankTimer = setTimeout(()=>{
      _rankTimer = null;
      const next = _pendingRankSnapshotMeta;
      _pendingRankSnapshotMeta = null;
      _persistChain = _persistChain.then(()=>_persistRankSnapshotMeta(next)).catch(()=>{});
    }, delay);
    return true;
  }
  async function _hasIndexedDbData(){
    if(!_idbUsable) return false;
    try{
      const data = await _idbGetMany([META_KEY, PLAYER_BASE_KEY, PLAYER_HISTORY_KEY, PLAYER_PHOTO_KEY, BOARD_PLAYER_ORDER_KEY, VOTE_DATA_KEY, RANK_SNAPSHOT_KEY, ...HISTORY_KEYS.map(k=>k.idbKey)]);
      return !!data[META_KEY]
        || Array.isArray(data[PLAYER_BASE_KEY])
        || (data[PLAYER_HISTORY_KEY] && typeof data[PLAYER_HISTORY_KEY] === 'object')
        || (data[PLAYER_PHOTO_KEY] && typeof data[PLAYER_PHOTO_KEY] === 'object')
        || (data[BOARD_PLAYER_ORDER_KEY] && typeof data[BOARD_PLAYER_ORDER_KEY] === 'object')
        || (data[VOTE_DATA_KEY] && typeof data[VOTE_DATA_KEY] === 'object')
        || (data[RANK_SNAPSHOT_KEY] && typeof data[RANK_SNAPSHOT_KEY] === 'object')
        || HISTORY_KEYS.some(k=>Array.isArray(data[k.idbKey]));
    }catch(e){
      return false;
    }
  }
  async function _hydrateHistoryFromIndexedDB(){
    if(!_idbUsable) return false;
    try{
      const data = await _idbGetMany([...HISTORY_KEYS.map(k=>k.idbKey), PLAYER_BASE_KEY, PLAYER_HISTORY_KEY, PLAYER_PHOTO_KEY, BOARD_PLAYER_ORDER_KEY, VOTE_DATA_KEY, RANK_SNAPSHOT_KEY, META_KEY]);
      const meta = data[META_KEY];
      const playerBaseList = Array.isArray(data[PLAYER_BASE_KEY]) ? data[PLAYER_BASE_KEY] : null;
      const playerHistMap = (data[PLAYER_HISTORY_KEY] && typeof data[PLAYER_HISTORY_KEY] === 'object') ? data[PLAYER_HISTORY_KEY] : null;
      const playerPhotoMap = (data[PLAYER_PHOTO_KEY] && typeof data[PLAYER_PHOTO_KEY] === 'object') ? data[PLAYER_PHOTO_KEY] : null;
      const boardPlayerOrderMap = (data[BOARD_PLAYER_ORDER_KEY] && typeof data[BOARD_PLAYER_ORDER_KEY] === 'object') ? data[BOARD_PLAYER_ORDER_KEY] : null;
      const voteDataMap = (data[VOTE_DATA_KEY] && typeof data[VOTE_DATA_KEY] === 'object') ? data[VOTE_DATA_KEY] : null;
      const rankSnapshotMeta = (data[RANK_SNAPSHOT_KEY] && typeof data[RANK_SNAPSHOT_KEY] === 'object') ? data[RANK_SNAPSHOT_KEY] : null;
      const hasIdbData = !!meta || HISTORY_KEYS.some(k=>Array.isArray(data[k.idbKey])) || !!playerBaseList || !!playerHistMap || !!playerPhotoMap || !!boardPlayerOrderMap || !!voteDataMap || !!rankSnapshotMeta;
      if(hasIdbData){
        const snapshot = {};
        HISTORY_KEYS.forEach(k=>{ snapshot[k.idbKey] = Array.isArray(data[k.idbKey]) ? data[k.idbKey] : []; });
        _applyHistorySnapshot(snapshot);
        if(playerBaseList) _applyPlayerBaseList(playerBaseList);
        if(playerHistMap) _applyPlayerHistoryMapToPlayers(playerHistMap);
        if(playerPhotoMap) _applyPhotoMapToPlayers(playerPhotoMap);
        if(boardPlayerOrderMap) _applyBoardPlayerOrderMap(boardPlayerOrderMap);
        if(voteDataMap) _applyVoteDataMap(voteDataMap);
        if(rankSnapshotMeta) _applyRankSnapshotMeta(rankSnapshotMeta);
        _cleanupLegacyHistoryLocalStorage();
        return true;
      }
      const legacyPlayerBase = _hasLegacyPlayerBase();
      const legacyPlayerHist = _hasLegacyPlayerHistoryInPlayers();
      const legacyPhotoMap = _hasLegacyPhotoMap();
      const legacyBoardPlayerOrder = _hasLegacyBoardPlayerOrder();
      const legacyVotes = _hasLegacyVotes();
      const legacyRankSnapshot = _hasLegacyRankSnapshot();
      if(_hasAnyLegacyLocalHistory() || legacyPlayerBase || legacyPlayerHist || legacyPhotoMap || legacyBoardPlayerOrder || legacyVotes || legacyRankSnapshot){
        const snapshot = _historySnapshotFromGlobals();
        await _persistHistorySnapshot(snapshot);
        if(legacyPlayerBase){
          await _persistPlayerBaseList(_playerBaseListFromGlobals());
        }
        if(legacyPlayerHist){
          await _persistPlayerHistoryMap(_playerHistoryMapFromGlobals());
          try{ if(typeof localSave === 'function') localSave(); }catch(e){}
        }
        if(legacyPhotoMap){
          try{
            const raw = (typeof J === 'function') ? (J('su_pp') || {}) : {};
            await _persistPlayerPhotoMap(raw);
          }catch(e){}
        }
        if(legacyBoardPlayerOrder){
          try{
            const raw = (typeof J === 'function') ? (J('su_bpo') || {}) : {};
            await _persistBoardPlayerOrderMap(raw);
          }catch(e){}
        }
        if(legacyVotes){
          try{
            const raw = JSON.parse(localStorage.getItem('su_votes')||'{}');
            await _persistVoteDataMap(raw);
          }catch(e){}
        }
        if(legacyRankSnapshot){
          try{
            const raw = {
              snap: (typeof J === 'function') ? (J('su_rank_snap') || {}) : {},
              date: localStorage.getItem('su_rank_snap_date') || ''
            };
            await _persistRankSnapshotMeta(raw);
          }catch(e){}
        }
        return true;
      }
    }catch(e){
      console.warn('[history-idb] hydrate failed, using localStorage fallback', e);
      _saveHistoryFallbackToLocalStorage(_historySnapshotFromGlobals());
    }
    return false;
  }

  window.__suHydrateHistoryFromIDB = _hydrateHistoryFromIndexedDB;
  window.__suQueueHistoryPersist = _queueHistoryPersist;
  window.__suQueuePlayerBasePersist = _queuePlayerBasePersist;
  window.__suQueuePlayerHistoryPersist = _queuePlayerHistoryPersist;
  window.__suQueuePlayerPhotoPersist = _queuePlayerPhotoPersist;
  window.__suQueueBoardPlayerOrderPersist = _queueBoardPlayerOrderPersist;
  window.__suQueueVoteDataPersist = _queueVoteDataPersist;
  window.__suQueueRankSnapshotPersist = _queueRankSnapshotPersist;
  window.__suHasIndexedDBData = _hasIndexedDbData;
  window.__suFlushHistoryPersistNow = function(){
    if(_persistTimer){
      clearTimeout(_persistTimer);
      _persistTimer = null;
    }
    if(_playerHistTimer){
      clearTimeout(_playerHistTimer);
      _playerHistTimer = null;
    }
    if(_playerBaseTimer){
      clearTimeout(_playerBaseTimer);
      _playerBaseTimer = null;
    }
    if(_photoTimer){
      clearTimeout(_photoTimer);
      _photoTimer = null;
    }
    if(_boardPlayerOrderTimer){
      clearTimeout(_boardPlayerOrderTimer);
      _boardPlayerOrderTimer = null;
    }
    if(_voteTimer){
      clearTimeout(_voteTimer);
      _voteTimer = null;
    }
    if(_rankTimer){
      clearTimeout(_rankTimer);
      _rankTimer = null;
    }
    const snap = _pendingSnapshot;
    const playerBase = _pendingPlayerBaseList;
    const playerMap = _pendingPlayerHistMap;
    const photoMap = _pendingPhotoMap;
    const boardPlayerOrderMap = _pendingBoardPlayerOrderMap;
    const voteDataMap = _pendingVoteDataMap;
    const rankSnapshotMeta = _pendingRankSnapshotMeta;
    _pendingSnapshot = null;
    _pendingPlayerBaseList = null;
    _pendingPlayerHistMap = null;
    _pendingPhotoMap = null;
    _pendingBoardPlayerOrderMap = null;
    _pendingVoteDataMap = null;
    _pendingRankSnapshotMeta = null;
    if(!snap && !playerBase && !playerMap && !photoMap && !boardPlayerOrderMap && !voteDataMap && !rankSnapshotMeta) return Promise.resolve(false);
    _persistChain = _persistChain
      .then(()=> snap ? _persistHistorySnapshot(snap) : true)
      .then(()=> playerBase ? _persistPlayerBaseList(playerBase) : true)
      .then(()=> playerMap ? _persistPlayerHistoryMap(playerMap) : true)
      .then(()=> photoMap ? _persistPlayerPhotoMap(photoMap) : true)
      .then(()=> boardPlayerOrderMap ? _persistBoardPlayerOrderMap(boardPlayerOrderMap) : true)
      .then(()=> voteDataMap ? _persistVoteDataMap(voteDataMap) : true)
      .then(()=> rankSnapshotMeta ? _persistRankSnapshotMeta(rankSnapshotMeta) : true)
      .catch(()=>{});
    return _persistChain;
  };

  document.addEventListener('visibilitychange', ()=>{
    if(document.visibilityState === 'hidden'){
      try{ window.__suFlushHistoryPersistNow(); }catch(e){}
    }
  });
  window.addEventListener('pagehide', ()=>{
    try{ window.__suFlushHistoryPersistNow(); }catch(e){}
  });
})();
