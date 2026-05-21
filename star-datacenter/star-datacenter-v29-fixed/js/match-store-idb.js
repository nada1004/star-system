(function(){
  const MATCH_DB_NAME='star_datacenter_matches';
  const MATCH_DB_VER=4;
  const MATCH_STORE='match_payloads';
  const MATCH_KEY='main';
  const PLAYER_STORE='player_payloads';
  const PLAYER_KEY='main';
  const MISC_STORE='misc_payloads';
  const MATCH_META_KEY='su_match_store_meta_v1';
  const PLAYER_META_KEY='su_player_store_meta_v1';
  const MATCH_LEGACY_KEYS=['su_mm','su_um','su_cm','su_ck','su_pro','su_ptn','su_tn','su_ttm','su_indm','su_gjm'];
  const PLAYER_LEGACY_KEYS=['su_p','su_pp'];
  // misc store에서 관리하는 localStorage 레거시 키 목록
  const MISC_LEGACY_KEYS=[
    'su_wh_hist','su_wh_stats','su_wh_input','su_wh_speed',
    'su_dr_hist','su_dr_n',
    'su_gc_hist_p','su_gc_hist_m','su_gc_hist_l',
    'su_brd_photo_cache'
  ];

  function _matchStoreDefault(){
    return {
      miniM:[], univM:[], comps:[], ckM:[], proM:[], proTourneys:[],
      tourneys:[], ttM:[], indM:[], gjM:[]
    };
  }
  function _matchStoreNormalize(v){
    const d=_matchStoreDefault(), s=v||{};
    return {
      miniM:Array.isArray(s.miniM)?s.miniM:d.miniM,
      univM:Array.isArray(s.univM)?s.univM:d.univM,
      comps:Array.isArray(s.comps)?s.comps:d.comps,
      ckM:Array.isArray(s.ckM)?s.ckM:d.ckM,
      proM:Array.isArray(s.proM)?s.proM:d.proM,
      proTourneys:Array.isArray(s.proTourneys)?s.proTourneys:d.proTourneys,
      tourneys:Array.isArray(s.tourneys)?s.tourneys:d.tourneys,
      ttM:Array.isArray(s.ttM)?s.ttM:d.ttM,
      indM:Array.isArray(s.indM)?s.indM:d.indM,
      gjM:Array.isArray(s.gjM)?s.gjM:d.gjM
    };
  }
  function _hasAnyRecordPayload(v){
    const d=_matchStoreNormalize(v);
    return ['miniM','univM','comps','ckM','proM','proTourneys','tourneys','ttM','indM','gjM']
      .some(k=>Array.isArray(d[k]) && d[k].length>0);
  }
  function _mergePreferCurrent(payload, current){
    const p=_matchStoreNormalize(payload);
    const c=_matchStoreNormalize(current);
    const keys=['miniM','univM','comps','ckM','proM','proTourneys','tourneys','ttM','indM','gjM'];
    const out={};
    keys.forEach(k=>{
      out[k] = (Array.isArray(c[k]) && c[k].length>0) ? c[k] : p[k];
    });
    return _matchStoreNormalize(out);
  }
  function _playerStoreNormalize(v){
    const s=v||{};
    return {
      players:Array.isArray(s.players)?s.players:[],
      playerPhotos:(s.playerPhotos && typeof s.playerPhotos==='object') ? s.playerPhotos : {}
    };
  }
  function _hasAnyPlayerPayload(v){
    const d=_playerStoreNormalize(v);
    return Array.isArray(d.players) && d.players.length>0;
  }
  function _trimTeamMembers(arr){
    const src=Array.isArray(arr)?arr:[];
    return src.map(m=>{
      if(!m||(!m.teamAMembers&&!m.teamBMembers)) return m;
      const r={...m};
      if(r.teamAMembers) r.teamAMembers=r.teamAMembers.map(x=>({name:x.name,univ:x.univ}));
      if(r.teamBMembers) r.teamBMembers=r.teamBMembers.map(x=>({name:x.name,univ:x.univ}));
      return r;
    });
  }
  function _readGlobalLexical(name, fallback){
    try{
      switch(name){
        case 'miniM': return (typeof miniM!=='undefined') ? miniM : fallback;
        case 'univM': return (typeof univM!=='undefined') ? univM : fallback;
        case 'comps': return (typeof comps!=='undefined') ? comps : fallback;
        case 'ckM': return (typeof ckM!=='undefined') ? ckM : fallback;
        case 'proM': return (typeof proM!=='undefined') ? proM : fallback;
        case 'proTourneys': return (typeof proTourneys!=='undefined') ? proTourneys : fallback;
        case 'tourneys': return (typeof tourneys!=='undefined') ? tourneys : fallback;
        case 'ttM': return (typeof ttM!=='undefined') ? ttM : fallback;
        case 'indM': return (typeof indM!=='undefined') ? indM : fallback;
        case 'gjM': return (typeof gjM!=='undefined') ? gjM : fallback;
        default: return fallback;
      }
    }catch(e){
      return fallback;
    }
  }
  function _writeGlobalLexical(name, value){
    try{
      switch(name){
        case 'miniM': if(typeof miniM!=='undefined') miniM=value; break;
        case 'univM': if(typeof univM!=='undefined') univM=value; break;
        case 'comps': if(typeof comps!=='undefined') comps=value; break;
        case 'ckM': if(typeof ckM!=='undefined') ckM=value; break;
        case 'proM': if(typeof proM!=='undefined') proM=value; break;
        case 'proTourneys': if(typeof proTourneys!=='undefined') proTourneys=value; break;
        case 'tourneys': if(typeof tourneys!=='undefined') tourneys=value; break;
        case 'ttM': if(typeof ttM!=='undefined') ttM=value; break;
        case 'indM': if(typeof indM!=='undefined') indM=value; break;
        case 'gjM': if(typeof gjM!=='undefined') gjM=value; break;
      }
    }catch(e){}
  }
  function _snapshotFromGlobals(){
    return _matchStoreNormalize({
      miniM:_readGlobalLexical('miniM', window.miniM||[]),
      univM:_readGlobalLexical('univM', window.univM||[]),
      comps:_readGlobalLexical('comps', window.comps||[]),
      ckM:_trimTeamMembers(_readGlobalLexical('ckM', window.ckM||[])),
      proM:_trimTeamMembers(_readGlobalLexical('proM', window.proM||[])),
      proTourneys:_readGlobalLexical('proTourneys', window.proTourneys||[]),
      tourneys:_readGlobalLexical('tourneys', window.tourneys||[]),
      ttM:_trimTeamMembers(_readGlobalLexical('ttM', window.ttM||[])),
      indM:_readGlobalLexical('indM', window.indM||[]),
      gjM:_readGlobalLexical('gjM', window.gjM||[])
    });
  }
  function _snapshotPlayersFromGlobals(){
    let src=[];
    try{
      if(typeof players!=='undefined' && Array.isArray(players)) src=players;
      else if(Array.isArray(window.players)) src=window.players;
    }catch(e){}
    const playerPhotos={};
    const out=(Array.isArray(src)?src:[]).map(p=>{
      const c={...(p||{})};
      delete c.history;
      if(p && p.name && p.photo){
        playerPhotos[p.name]=p.photo;
        delete c.photo;
      }
      return c;
    });
    return _playerStoreNormalize({players:out, playerPhotos});
  }
  function _applyToGlobals(payload){
    const d=_matchStoreNormalize(payload);
    window.miniM=d.miniM;
    window.univM=d.univM;
    window.comps=d.comps;
    window.ckM=d.ckM;
    window.proM=d.proM;
    window.proTourneys=d.proTourneys;
    window.tourneys=d.tourneys;
    window.ttM=d.ttM;
    window.indM=d.indM;
    window.gjM=d.gjM;
    _writeGlobalLexical('miniM', d.miniM);
    _writeGlobalLexical('univM', d.univM);
    _writeGlobalLexical('comps', d.comps);
    _writeGlobalLexical('ckM', d.ckM);
    _writeGlobalLexical('proM', d.proM);
    _writeGlobalLexical('proTourneys', d.proTourneys);
    _writeGlobalLexical('tourneys', d.tourneys);
    _writeGlobalLexical('ttM', d.ttM);
    _writeGlobalLexical('indM', d.indM);
    _writeGlobalLexical('gjM', d.gjM);
    return d;
  }
  function _applyPlayersToGlobals(payload){
    const d=_playerStoreNormalize(payload);
    const arr=(Array.isArray(d.players)?d.players:[]).map(p=>{
      const c={...(p||{})};
      if(c && c.name && d.playerPhotos[c.name] && !c.photo) c.photo=d.playerPhotos[c.name];
      return c;
    });
    try{ window.playerPhotos = d.playerPhotos || {}; }catch(e){}
    try{ window.players = arr; }catch(e){}
    try{ if(typeof players!=='undefined') players = arr; }catch(e){}
    return d;
  }
  function _legacyLoad(){
    try{
      const J = window.J || (k=>{ try{return JSON.parse(localStorage.getItem(k)||'null');}catch(e){return null;} });
      return _matchStoreNormalize({
        miniM:J('su_mm')||[],
        univM:J('su_um')||[],
        comps:J('su_cm')||[],
        ckM:J('su_ck')||[],
        proM:J('su_pro')||[],
        proTourneys:J('su_ptn')||[],
        tourneys:J('su_tn')||[],
        ttM:J('su_ttm')||[],
        indM:J('su_indm')||[],
        gjM:J('su_gjm')||[]
      });
    }catch(e){
      console.warn('[match-store] legacy load failed:', e.message);
      return _matchStoreDefault();
    }
  }
  function _playerLegacyLoad(){
    try{
      const J = window.J || (k=>{ try{return JSON.parse(localStorage.getItem(k)||'null');}catch(e){return null;} });
      const raw = J('su_p') || [];
      const unpack = window._unpackPlayers || (v=>Array.isArray(v)?v:((v&&typeof v==='object'&&Array.isArray(v.p))?v.p:[]));
      const players = unpack(raw) || [];
      const photos = J('su_pp') || {};
      const merged = (Array.isArray(players)?players:[]).map(p=>{
        const c={...(p||{})};
        if(c && c.name && !c.photo && photos && photos[c.name]) c.photo=photos[c.name];
        return c;
      });
      return _playerStoreNormalize({ players: merged, playerPhotos: photos });
    }catch(e){
      console.warn('[player-store] legacy load failed:', e.message);
      return _playerStoreNormalize(null);
    }
  }
  function _legacySave(payload){
    const d=_matchStoreNormalize(payload);
    try{
      localStorage.setItem('su_mm', JSON.stringify(d.miniM));
      localStorage.setItem('su_um', JSON.stringify(d.univM));
      localStorage.setItem('su_cm', JSON.stringify(d.comps));
      localStorage.setItem('su_ck', JSON.stringify(d.ckM));
      localStorage.setItem('su_pro', JSON.stringify(d.proM));
      localStorage.setItem('su_ptn', JSON.stringify(d.proTourneys));
      localStorage.setItem('su_tn', JSON.stringify(d.tourneys));
      localStorage.setItem('su_ttm', JSON.stringify(d.ttM));
      localStorage.setItem('su_indm', JSON.stringify(d.indM));
      localStorage.setItem('su_gjm', JSON.stringify(d.gjM));
      return true;
    }catch(e){
      console.warn('[match-store] legacy save failed:', e.message);
      return false;
    }
  }
  function _playerLegacySave(payload){
    const d=_playerStoreNormalize(payload);
    try{
      const photoMap={...(d.playerPhotos||{})};
      const noPhoto=(Array.isArray(d.players)?d.players:[]).map(p=>{
        const c={...(p||{})};
        delete c.history;
        if(c && c.name && c.photo){
          photoMap[c.name]=c.photo;
          delete c.photo;
        }
        return c;
      });
      localStorage.setItem('su_p', JSON.stringify(noPhoto));
      localStorage.setItem('su_pp', JSON.stringify(photoMap));
      return true;
    }catch(e){
      console.warn('[player-store] legacy save failed:', e.message);
      return false;
    }
  }
  function _clearLegacyKeys(){
    MATCH_LEGACY_KEYS.forEach(k=>{
      try{ localStorage.removeItem(k); }catch(e){}
    });
  }
  function _playerClearLegacyKeys(){
    PLAYER_LEGACY_KEYS.forEach(k=>{
      try{ localStorage.removeItem(k); }catch(e){}
    });
  }
  function _metaLoad(){
    try{ return JSON.parse(localStorage.getItem(MATCH_META_KEY)||'null')||{}; }catch(e){ return {}; }
  }
  function _metaSave(obj){
    try{ localStorage.setItem(MATCH_META_KEY, JSON.stringify(obj||{})); }catch(e){}
  }
  function _playerMetaLoad(){
    try{ return JSON.parse(localStorage.getItem(PLAYER_META_KEY)||'null')||{}; }catch(e){ return {}; }
  }
  function _playerMetaSave(obj){
    try{ localStorage.setItem(PLAYER_META_KEY, JSON.stringify(obj||{})); }catch(e){}
  }
  function _openDb(){
    return new Promise((resolve,reject)=>{
      try{
        if(!window.indexedDB){ resolve(null); return; }
        const req=indexedDB.open(MATCH_DB_NAME, MATCH_DB_VER);
        req.onupgradeneeded=(ev)=>{
          const db=ev.target.result;
          if(!db.objectStoreNames.contains(MATCH_STORE)) db.createObjectStore(MATCH_STORE);
          if(!db.objectStoreNames.contains(PLAYER_STORE)) db.createObjectStore(PLAYER_STORE);
          if(!db.objectStoreNames.contains(MISC_STORE)) db.createObjectStore(MISC_STORE);
        };
        req.onsuccess=()=>resolve(req.result);
        req.onerror=()=>reject(req.error||new Error('indexedDB open failed'));
      }catch(e){ reject(e); }
    });
  }
  function _idbAvailable(){
    try{ return !!window.indexedDB; }catch(e){ return false; }
  }
  async function _idbGet(){
    const db=await _openDb();
    if(!db) return null;
    return await new Promise((resolve,reject)=>{
      try{
        const tx=db.transaction(MATCH_STORE,'readonly');
        const st=tx.objectStore(MATCH_STORE);
        const req=st.get(MATCH_KEY);
        req.onsuccess=()=>resolve(_matchStoreNormalize(req.result||null));
        req.onerror=()=>reject(req.error||new Error('indexedDB get failed'));
      }catch(e){ reject(e); }
    });
  }
  async function _idbSet(payload){
    const db=await _openDb();
    if(!db) return false;
    return await new Promise((resolve,reject)=>{
      try{
        const tx=db.transaction(MATCH_STORE,'readwrite');
        tx.objectStore(MATCH_STORE).put(_matchStoreNormalize(payload), MATCH_KEY);
        tx.oncomplete=()=>resolve(true);
        tx.onerror=()=>reject(tx.error||new Error('indexedDB put failed'));
      }catch(e){ reject(e); }
    });
  }
  async function _idbClear(){
    const db=await _openDb();
    if(!db) return false;
    return await new Promise((resolve,reject)=>{
      try{
        const tx=db.transaction(MATCH_STORE,'readwrite');
        tx.objectStore(MATCH_STORE).delete(MATCH_KEY);
        tx.oncomplete=()=>resolve(true);
        tx.onerror=()=>reject(tx.error||new Error('indexedDB delete failed'));
      }catch(e){ reject(e); }
    });
  }
  async function _playerIdbGet(){
    const db=await _openDb();
    if(!db || !db.objectStoreNames.contains(PLAYER_STORE)) return null;
    return await new Promise((resolve,reject)=>{
      try{
        const tx=db.transaction(PLAYER_STORE,'readonly');
        const st=tx.objectStore(PLAYER_STORE);
        const req=st.get(PLAYER_KEY);
        req.onsuccess=()=>resolve(_playerStoreNormalize(req.result||null));
        req.onerror=()=>reject(req.error||new Error('player indexedDB get failed'));
      }catch(e){ reject(e); }
    });
  }
  async function _playerIdbSet(payload){
    const db=await _openDb();
    if(!db) return false;
    return await new Promise((resolve,reject)=>{
      try{
        const tx=db.transaction(PLAYER_STORE,'readwrite');
        tx.objectStore(PLAYER_STORE).put(_playerStoreNormalize(payload), PLAYER_KEY);
        tx.oncomplete=()=>resolve(true);
        tx.onerror=()=>reject(tx.error||new Error('player indexedDB put failed'));
      }catch(e){ reject(e); }
    });
  }
  async function _playerIdbClear(){
    const db=await _openDb();
    if(!db || !db.objectStoreNames.contains(PLAYER_STORE)) return false;
    return await new Promise((resolve,reject)=>{
      try{
        const tx=db.transaction(PLAYER_STORE,'readwrite');
        tx.objectStore(PLAYER_STORE).delete(PLAYER_KEY);
        tx.oncomplete=()=>resolve(true);
        tx.onerror=()=>reject(tx.error||new Error('player indexedDB delete failed'));
      }catch(e){ reject(e); }
    });
  }

  // ── misc store helpers ──────────────────────────────────────────
  async function _miscIdbGet(key){
    const db=await _openDb();
    if(!db || !db.objectStoreNames.contains(MISC_STORE)) return undefined;
    return await new Promise((resolve,reject)=>{
      try{
        const tx=db.transaction(MISC_STORE,'readonly');
        const req=tx.objectStore(MISC_STORE).get(key);
        req.onsuccess=()=>resolve(req.result);
        tx.onerror=()=>reject(tx.error||new Error('misc indexedDB get failed'));
      }catch(e){ reject(e); }
    });
  }
  async function _miscIdbSet(key, value){
    const db=await _openDb();
    if(!db || !db.objectStoreNames.contains(MISC_STORE)) return false;
    return await new Promise((resolve,reject)=>{
      try{
        const tx=db.transaction(MISC_STORE,'readwrite');
        tx.objectStore(MISC_STORE).put(value, key);
        tx.oncomplete=()=>resolve(true);
        tx.onerror=()=>reject(tx.error||new Error('misc indexedDB set failed'));
      }catch(e){ reject(e); }
    });
  }
  async function _miscIdbDelete(key){
    const db=await _openDb();
    if(!db || !db.objectStoreNames.contains(MISC_STORE)) return false;
    return await new Promise((resolve,reject)=>{
      try{
        const tx=db.transaction(MISC_STORE,'readwrite');
        tx.objectStore(MISC_STORE).delete(key);
        tx.oncomplete=()=>resolve(true);
        tx.onerror=()=>reject(tx.error||new Error('misc indexedDB delete failed'));
      }catch(e){ reject(e); }
    });
  }
  // 레거시 localStorage 키를 misc IDB로 마이그레이션 (최초 1회)
  async function _miscMigrateLegacy(){
    try{
      for(const k of MISC_LEGACY_KEYS){
        try{
          const raw=localStorage.getItem(k);
          if(raw==null) continue;
          let val;
          try{ val=JSON.parse(raw); }catch(e){ val=raw; }
          await _miscIdbSet(k, val);
          localStorage.removeItem(k);
        }catch(e){}
      }
    }catch(e){}
  }

  window._matchStoreReady = window._matchStoreReady || false;
  window._matchStoreInitPromise = window._matchStoreInitPromise || null;
  window._playerStoreReady = window._playerStoreReady || false;
  window._playerStoreInitPromise = window._playerStoreInitPromise || null;

  async function initMatchStore(){
    if(window._matchStoreInitPromise) return window._matchStoreInitPromise;
    window._matchStoreInitPromise = (async()=>{
      try{
        const meta=_metaLoad();
        const useLegacyFirst = !_idbAvailable() || meta.backend==='localStorage';
        const legacyExists = (useLegacyFirst || !meta.migrated) ? MATCH_LEGACY_KEYS.some(k=>{
          try{ return localStorage.getItem(k)!=null; }catch(e){ return false; }
        }) : false;
        if(legacyExists){
          const legacy=_legacyLoad();
          _applyToGlobals(legacy);
          if(_idbAvailable()){
            try{
              await _idbSet(legacy);
              _clearLegacyKeys();
              _metaSave({migrated:true, backend:'indexedDB', updatedAt:Date.now()});
            }catch(e){
              console.warn('[match-store] legacy migrate failed:', e.message);
              _metaSave({migrated:false, backend:'localStorage', updatedAt:Date.now()});
            }
          }else{
            _metaSave({migrated:false, backend:'localStorage', updatedAt:Date.now()});
          }
          window._matchStoreReady=true;
          return legacy;
        }
        const payload=await _idbGet();
        const currentGlobals=_snapshotFromGlobals();
        if(payload){
          const merged = _mergePreferCurrent(payload, currentGlobals);
          _applyToGlobals(merged);
          try{
            if(JSON.stringify(_matchStoreNormalize(payload)) !== JSON.stringify(merged)){
              await _idbSet(merged);
            }
          }catch(e){}
        }
        _metaSave({migrated:true, backend:'indexedDB', updatedAt:Date.now()});
        window._matchStoreReady=true;
        return payload ? _mergePreferCurrent(payload, currentGlobals) : _matchStoreDefault();
      }catch(e){
        console.warn('[match-store] init failed:', e.message);
        window._matchStoreReady=true;
        return _snapshotFromGlobals();
      }
    })();
    return window._matchStoreInitPromise;
  }
  async function initPlayerStore(){
    if(window._playerStoreInitPromise) return window._playerStoreInitPromise;
    window._playerStoreInitPromise = (async()=>{
      try{
        const meta=_playerMetaLoad();
        const useLegacyFirst = !_idbAvailable() || meta.backend==='localStorage';
        const legacyExists = (useLegacyFirst || !meta.migrated) ? PLAYER_LEGACY_KEYS.some(k=>{
          try{ return localStorage.getItem(k)!=null; }catch(e){ return false; }
        }) : false;
        if(legacyExists){
          const legacy=_playerLegacyLoad();
          _applyPlayersToGlobals(legacy);
          if(_idbAvailable()){
            try{
              await _playerIdbSet(legacy);
              _playerClearLegacyKeys();
              _playerMetaSave({migrated:true, backend:'indexedDB', updatedAt:Date.now()});
            }catch(e){
              console.warn('[player-store] legacy migrate failed:', e.message);
              _playerMetaSave({migrated:false, backend:'localStorage', updatedAt:Date.now()});
            }
          }else{
            _playerMetaSave({migrated:false, backend:'localStorage', updatedAt:Date.now()});
          }
          window._playerStoreReady=true;
          return legacy;
        }
        const payload=await _playerIdbGet();
        if(_hasAnyPlayerPayload(payload)){
          _applyPlayersToGlobals(payload);
          _playerClearLegacyKeys();
          _playerMetaSave({migrated:true, backend:'indexedDB', updatedAt:Date.now()});
        }
        window._playerStoreReady=true;
        return _hasAnyPlayerPayload(payload) ? payload : _snapshotPlayersFromGlobals();
      }catch(e){
        console.warn('[player-store] init failed:', e.message);
        _playerMetaSave({migrated:false, backend:'localStorage', updatedAt:Date.now()});
        window._playerStoreReady=true;
        return _snapshotPlayersFromGlobals();
      }
    })();
    return window._playerStoreInitPromise;
  }

  async function saveMatchStore(){
    const playerPayload=_snapshotPlayersFromGlobals();
    const payload=_snapshotFromGlobals();
    try{
      try{ await _playerIdbSet(playerPayload); }catch(e){}
      const ok = await _idbSet(payload);
      if(ok){
        _clearLegacyKeys();
        _metaSave({migrated:true, backend:'indexedDB', updatedAt:Date.now()});
        return true;
      }
      const legacyOk = _legacySave(payload);
      _metaSave({migrated:false, backend:'localStorage', updatedAt:Date.now()});
      return legacyOk;
    }catch(e){
      console.warn('[match-store] save failed:', e.message);
      const legacyOk = _legacySave(payload);
      _metaSave({migrated:false, backend:'localStorage', updatedAt:Date.now()});
      return legacyOk;
    }
  }
  async function rebuildMatchStore(){
    const payload=_snapshotFromGlobals();
    const playerPayload=_snapshotPlayersFromGlobals();
    if(_idbAvailable()){
      try{
        await _idbSet(payload);
        try{ await _playerIdbSet(playerPayload); }catch(e){}
        _clearLegacyKeys();
        _metaSave({migrated:true, backend:'indexedDB', updatedAt:Date.now()});
        return {ok:true, backend:'indexedDB'};
      }catch(e){
        console.warn('[match-store] rebuild failed:', e.message);
      }
    }
    const legacyOk=_legacySave(payload);
    _metaSave({migrated:false, backend:'localStorage', updatedAt:Date.now()});
    return {ok:legacyOk, backend:'localStorage'};
  }
  async function clearMatchStore(){
    let idbOk=true;
    try{
      if(_idbAvailable()){
        await _idbClear();
        await _playerIdbClear();
      }
    }catch(e){ idbOk=false; }
    _clearLegacyKeys();
    _metaSave({migrated:_idbAvailable()&&idbOk, backend:(_idbAvailable()&&idbOk)?'indexedDB':'localStorage', updatedAt:Date.now()});
    return {ok:idbOk, backend:(_idbAvailable()&&idbOk)?'indexedDB':'localStorage'};
  }

  window.MatchStore = window.MatchStore || {
    init:initMatchStore,
    save:saveMatchStore,
    rebuild:rebuildMatchStore,
    clear:clearMatchStore,
    snapshot:_snapshotFromGlobals,
    apply:_applyToGlobals
  };
  window.PlayerStore = window.PlayerStore || {
    init:initPlayerStore,
    load:_playerIdbGet,
    save:async()=>{
      const payload=_snapshotPlayersFromGlobals();
      try{
        if(_idbAvailable()){
          const ok = await _playerIdbSet(payload);
          if(ok){
            _playerClearLegacyKeys();
            _playerMetaSave({migrated:true, backend:'indexedDB', updatedAt:Date.now()});
            return true;
          }
        }
      }catch(e){
        console.warn('[player-store] save failed:', e.message);
      }
      const legacyOk=_playerLegacySave(payload);
      _playerMetaSave({migrated:false, backend:'localStorage', updatedAt:Date.now()});
      return legacyOk;
    },
    clear:async()=>{
      let idbOk=true;
      try{ if(_idbAvailable()) await _playerIdbClear(); }catch(e){ idbOk=false; }
      _playerClearLegacyKeys();
      _playerMetaSave({migrated:_idbAvailable()&&idbOk, backend:(_idbAvailable()&&idbOk)?'indexedDB':'localStorage', updatedAt:Date.now()});
      return {ok:idbOk, backend:(_idbAvailable()&&idbOk)?'indexedDB':'localStorage'};
    },
    snapshot:_snapshotPlayersFromGlobals,
    apply:_applyPlayersToGlobals
  };

  // ── MiscStore 공개 API ──────────────────────────────────────────
  // get/set/delete: 기존 localStorage처럼 key-value로 사용,
  //   단 값은 JSON 직렬화 없이 그대로 저장/반환 (객체/배열/문자열 모두 OK)
  // fallback: IDB 불가 시 localStorage 사용
  window.MiscStore = window.MiscStore || {
    get: async function(key, fallback){
      try{
        if(_idbAvailable()){
          const v = await _miscIdbGet(key);
          if(v !== undefined) return v;
        }
      }catch(e){}
      // localStorage fallback
      try{
        const raw = localStorage.getItem(key);
        if(raw == null) return (fallback !== undefined ? fallback : undefined);
        try{ return JSON.parse(raw); }catch(e){ return raw; }
      }catch(e){ return (fallback !== undefined ? fallback : undefined); }
    },
    set: async function(key, value){
      try{
        if(_idbAvailable()){
          await _miscIdbSet(key, value);
          // IDB 성공 시 LS 레거시 제거
          try{ localStorage.removeItem(key); }catch(e){}
          return true;
        }
      }catch(e){}
      // localStorage fallback
      try{
        localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
        return true;
      }catch(e){ return false; }
    },
    delete: async function(key){
      try{ if(_idbAvailable()) await _miscIdbDelete(key); }catch(e){}
      try{ localStorage.removeItem(key); }catch(e){}
    },
    // 레거시 localStorage → IDB 마이그레이션 (앱 init 시 한 번 호출)
    migrateLegacy: _miscMigrateLegacy,
    available: _idbAvailable
  };

  // 앱 로드 시 misc 레거시 마이그레이션 자동 실행
  if(_idbAvailable()){
    setTimeout(()=>{ _miscMigrateLegacy().catch(()=>{}); }, 500);
  }
})();
