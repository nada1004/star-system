/* ─────────────────────────────────────────────────────────────
  통합 설정 스냅샷 (v1)
  - 사용자가 요청한 “비슷한 주제 설정 통합”을 위해:
    1) localStorage의 su_* 설정들을 주제별로 모아 1개의 JSON으로 저장
    2) setItem/removeItem 호출을 감시하여 스냅샷을 자동 갱신

  ⚠️ 주의
  - 기존 설정 키(su_*)는 그대로 유지(호환성 최우선)
  - 이 파일은 “정리/백업/마이그레이션 기반”으로만 사용 (기능 영향 최소)
───────────────────────────────────────────────────────────── */

(function(){
  const SNAP_KEY = 'su_unified_settings_v1';
  // (v2) 너무 큰 데이터(선수/대전 데이터 등)까지 스냅샷에 중복 저장되어 용량을 과도하게 차지하는 문제 개선
  // - 기존 su_* 키는 그대로 유지하고, "통합 설정 스냅샷"은 '설정' 성격의 키만 저장한다.
  // - 한번만 재구축되도록 MIG_KEY 버전을 올린다.
  const MIG_KEY  = 'su_unified_settings_migrated_v2';
  const PREFIX   = 'su_';

  const _origSet = localStorage.setItem.bind(localStorage);
  const _origRem = localStorage.removeItem.bind(localStorage);
  const _origClr = localStorage.clear.bind(localStorage);
  let _inSync = false;

  function _now(){ return Date.now(); }

  // 스냅샷에서 제외할 "대용량/대전 데이터" 키들
  // (대전 데이터는 별도 키로 이미 저장되므로, 스냅샷에 중복 저장하면 용량만 커짐)
  const _EXCLUDE_KEYS = new Set([
    'su_p','su_pp','su_t','su_mm','su_um','su_cm','su_ck','su_pro','su_ptn','su_tn','su_ttm','su_indm','su_gjm',
    'su_rank_snap','su_cal_sched','su_votes','su_notices','su_seasons',
    // 빌더 편집 상태는 크기가 커질 수 있고, 백업 대상으로 우선순위 낮음
    'su_bld_ck','su_bld_pro'
  ]);
  const _MAX_VAL_LEN = 12000; // 12KB 이상이면 스냅샷에서 제외 (설정 스냅샷 용도)

  function _shouldSkip(k, v){
    try{
      if(!k || typeof k!=='string') return true;
      if(!k.startsWith(PREFIX)) return true;
      if(k===SNAP_KEY || k===MIG_KEY) return true;
      if(_EXCLUDE_KEYS.has(k)) return true;
      if(typeof v==='string' && v.length > _MAX_VAL_LEN) return true;
      return false;
    }catch(e){
      return true;
    }
  }

  function _catOf(k){
    if(!k || typeof k!=='string') return 'misc';
    if(k.startsWith('su_b2_') || k.startsWith('su_img')) return 'images';
    if(k.startsWith('su_pd_') || k.startsWith('su_md_')) return 'matchdetail';
    if(k.startsWith('su_rc_') || k.startsWith('su_tc_')) return 'cards';
    if(k.startsWith('su_hdr_') || k.startsWith('su_design_v2') || k==='su_dark' || k.startsWith('su_ui_') || k.startsWith('su_btn_') || k.startsWith('su_app_font_')) return 'ui';
    if(k.includes('femco') || k.startsWith('su_board') || k==='su_boardOrder' || k==='su_old_board' || k.startsWith('su_board2') || k.startsWith('su_chip')) return 'board';
    if(k.startsWith('su_bgm_') || k.startsWith('su_soop_') || k.startsWith('su_paste_') || k==='su_paste_route_rules' || k.startsWith('su_auto_')) return 'automation';
    if(k.startsWith('su_cal_') || k.startsWith('su_date_')) return 'calendar';
    return 'misc';
  }

  function _loadSnap(){
    try{
      const v = JSON.parse(localStorage.getItem(SNAP_KEY)||'null');
      if(v && typeof v==='object') return v;
    }catch(e){}
    return {v:1, updatedAt:0, cats:{images:{}, matchdetail:{}, cards:{}, ui:{}, board:{}, automation:{}, calendar:{}, misc:{}}};
  }

  function _saveSnap(s){
    try{
      _inSync = true;
      _origSet(SNAP_KEY, JSON.stringify(s));
    }catch(e){
    }finally{
      _inSync = false;
    }
  }

  function _rebuildFromLocalStorage(){
    const snap = {v:1, updatedAt:_now(), cats:{images:{}, matchdetail:{}, cards:{}, ui:{}, board:{}, automation:{}, calendar:{}, misc:{}}};
    try{
      for(let i=0;i<localStorage.length;i++){
        const k = localStorage.key(i);
        if(!k || !k.startsWith(PREFIX)) continue;
        let val = null;
        try{ val = localStorage.getItem(k); }catch(e){ val = null; }
        if(_shouldSkip(k, val)) continue;
        const cat = _catOf(k);
        if(!snap.cats[cat]) snap.cats[cat] = {};
        snap.cats[cat][k] = val;
      }
    }catch(e){}
    _saveSnap(snap);
    return snap;
  }

  function _ensureMigrated(){
    try{
      if(localStorage.getItem(MIG_KEY)==='1') return;
      _rebuildFromLocalStorage();
      _origSet(MIG_KEY,'1');
    }catch(e){}
  }

  function _upsert(k, v){
    if(!k || !k.startsWith(PREFIX)) return;
    if(_shouldSkip(k, v)) return;
    const snap = _loadSnap();
    const cat = _catOf(k);
    if(!snap.cats) snap.cats = {};
    if(!snap.cats[cat]) snap.cats[cat] = {};
    snap.cats[cat][k] = v;
    snap.updatedAt = _now();
    _saveSnap(snap);
  }

  function _del(k){
    if(!k || !k.startsWith(PREFIX)) return;
    if(k===SNAP_KEY || k===MIG_KEY) return;
    if(_EXCLUDE_KEYS.has(k)) return;
    const snap = _loadSnap();
    const cat = _catOf(k);
    try{ if(snap.cats && snap.cats[cat]) delete snap.cats[cat][k]; }catch(e){}
    snap.updatedAt = _now();
    _saveSnap(snap);
  }

  // public helpers
  window.exportUnifiedSettings = function(){
    try{ return JSON.stringify(_loadSnap(), null, 2); }catch(e){ return '{}'; }
  };
  window.rebuildUnifiedSettings = function(){
    _rebuildFromLocalStorage();
    return true;
  };
  window.importUnifiedSettings = function(jsonText){
    try{
      const s = JSON.parse(String(jsonText||'')||'{}');
      const cats = s && s.cats ? s.cats : null;
      if(!cats) throw new Error('invalid format');
      const flat = Object.values(cats).flatMap(obj => Object.entries(obj||{}));
      if(!confirm(`통합 설정을 적용할까요?\n총 ${flat.length}개의 su_* 키를 덮어씁니다.`)) return false;
      flat.forEach(([k,v])=>{ try{ localStorage.setItem(k, v); }catch(e){} });
      _rebuildFromLocalStorage();
      try{ if(typeof render==='function') render(); }catch(e){}
      return true;
    }catch(e){
      alert('통합 설정 가져오기 실패: '+(e && e.message ? e.message : e));
      return false;
    }
  };

  // install wrappers
  try{
    localStorage.setItem = function(k, v){
      const r = _origSet(k, v);
      if(!_inSync) _upsert(String(k), String(v));
      return r;
    };
    localStorage.removeItem = function(k){
      const r = _origRem(k);
      if(!_inSync) _del(String(k));
      return r;
    };
    localStorage.clear = function(){
      const r = _origClr();
      if(!_inSync) _rebuildFromLocalStorage();
      return r;
    };
  }catch(e){}

  _ensureMigrated();
})();
