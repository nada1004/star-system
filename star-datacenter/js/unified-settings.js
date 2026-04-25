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
  const MIG_KEY  = 'su_unified_settings_migrated_v1';
  const PREFIX   = 'su_';

  const _origSet = localStorage.setItem.bind(localStorage);
  const _origRem = localStorage.removeItem.bind(localStorage);
  const _origClr = localStorage.clear.bind(localStorage);
  let _inSync = false;

  function _now(){ return Date.now(); }

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
        if(k===SNAP_KEY || k===MIG_KEY) continue;
        let val = null;
        try{ val = localStorage.getItem(k); }catch(e){ val = null; }
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
    if(k===SNAP_KEY || k===MIG_KEY) return;
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

