(function(){
  const MATCH_DB_NAME='star_datacenter_matches';
  const MATCH_DB_VER=1;
  const MATCH_STORE='match_payloads';
  const MATCH_KEY='main';
  const MATCH_META_KEY='su_match_store_meta_v1';
  const MATCH_LEGACY_KEYS=['su_mm','su_um','su_cm','su_ck','su_pro','su_ptn','su_tn','su_ttm','su_indm','su_gjm'];

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
  function _snapshotFromGlobals(){
    return _matchStoreNormalize({
      miniM:window.miniM||[],
      univM:window.univM||[],
      comps:window.comps||[],
      ckM:_trimTeamMembers(window.ckM||[]),
      proM:_trimTeamMembers(window.proM||[]),
      proTourneys:window.proTourneys||[],
      tourneys:window.tourneys||[],
      ttM:_trimTeamMembers(window.ttM||[]),
      indM:window.indM||[],
      gjM:window.gjM||[]
    });
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
  function _clearLegacyKeys(){
    MATCH_LEGACY_KEYS.forEach(k=>{
      try{ localStorage.removeItem(k); }catch(e){}
    });
  }
  function _metaLoad(){
    try{ return JSON.parse(localStorage.getItem(MATCH_META_KEY)||'null')||{}; }catch(e){ return {}; }
  }
  function _metaSave(obj){
    try{ localStorage.setItem(MATCH_META_KEY, JSON.stringify(obj||{})); }catch(e){}
  }
  function _openDb(){
    return new Promise((resolve,reject)=>{
      try{
        if(!window.indexedDB){ resolve(null); return; }
        const req=indexedDB.open(MATCH_DB_NAME, MATCH_DB_VER);
        req.onupgradeneeded=(ev)=>{
          const db=ev.target.result;
          if(!db.objectStoreNames.contains(MATCH_STORE)) db.createObjectStore(MATCH_STORE);
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

  window._matchStoreReady = window._matchStoreReady || false;
  window._matchStoreInitPromise = window._matchStoreInitPromise || null;

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
        if(payload){
          _applyToGlobals(payload);
        }
        _metaSave({migrated:true, backend:'indexedDB', updatedAt:Date.now()});
        window._matchStoreReady=true;
        return payload || _matchStoreDefault();
      }catch(e){
        console.warn('[match-store] init failed:', e.message);
        window._matchStoreReady=true;
        return _snapshotFromGlobals();
      }
    })();
    return window._matchStoreInitPromise;
  }

  async function saveMatchStore(){
    const payload=_snapshotFromGlobals();
    try{
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
    if(_idbAvailable()){
      try{
        await _idbSet(payload);
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
    try{ if(_idbAvailable()) await _idbClear(); }catch(e){ idbOk=false; }
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
})();
