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
    'su_bld_ck','su_bld_pro',
    // UI 전용 상태 키: 섹션 열고 닫을 때마다 변경되므로 스냅샷에서 제외
    'su_cfg_open','su_cfg_bottom_open','su_cfg_view_mode'
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
    if(k.startsWith('su_rc_') || k.startsWith('su_tc_') ||
       k.startsWith('su_mini_') || k.startsWith('su_ck_card') ||
       k.startsWith('su_univm_') || k.startsWith('su_univck_') ||
       k.startsWith('su_tt_') || k.startsWith('su_pcomp_') ||
       k.startsWith('su_h2h_') || k==='su_tier_view_mode' ||
       k.startsWith('su_match_btn_') || k.startsWith('su_ym_') ||
       k.startsWith('su_rec_avatar') || k.startsWith('su_avatar_') ||
       k.startsWith('su_team_color_')) return 'cards';
    if(k.startsWith('su_hdr_') || k.startsWith('su_design_v2') || k==='su_dark' || k.startsWith('su_ui_') || k.startsWith('su_btn_') || k.startsWith('su_app_font_')) return 'ui';
    if(k.includes('femco') || k.startsWith('su_board') || k==='su_boardOrder' || k==='su_old_board' || k.startsWith('su_board2') || k.startsWith('su_chip') || k.startsWith('su_b2mvp_') || k==='su_b2_briefing_theme') return 'board';
    if(k.startsWith('su_bgm_') || k.startsWith('su_soop_') || k.startsWith('su_paste_') || k==='su_paste_route_rules' || k.startsWith('su_auto_')) return 'automation';
    if(k.startsWith('su_cal_') || k.startsWith('su_date_')) return 'calendar';
    return 'misc';
  }

  function _loadSnap(){
    try{
      const v = JSON.parse(localStorage.getItem(SNAP_KEY)||'null');
      if(v && typeof v==='object') return v;
    }catch(e){}
    return {v:2, updatedAt:0, cats:{images:{}, matchdetail:{}, cards:{}, ui:{}, board:{}, automation:{}, calendar:{}, misc:{}}};
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
    const snap = {v:2, updatedAt:_now(), cats:{images:{}, matchdetail:{}, cards:{}, ui:{}, board:{}, automation:{}, calendar:{}, misc:{}}};
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
      // (버그픽스) import 중 각 setItem이 클라우드 트리거를 반복 발생시키는 문제 방지
      // _inSync=true로 래퍼를 우회하고, 완료 후 단 한 번만 스냅샷 재구축 + 클라우드 트리거
      _inSync = true;
      try{
        flat.forEach(([k,v])=>{ try{ _origSet(k, v); }catch(e){} });
      }finally{
        _inSync = false;
      }
      _rebuildFromLocalStorage();
      // 임포트 완료 후 클라우드 동기화 1회 예약
      try{
        clearTimeout(_cloudDebounceT);
        _cloudDebounceT = setTimeout(function(){
          try{ if(typeof window._scheduleCloudAppSettingsSave === 'function') window._scheduleCloudAppSettingsSave(); }catch(e){}
        }, 600);
      }catch(e){}
      try{ if(typeof render==='function') render(); }catch(e){}
      return true;
    }catch(e){
      alert('통합 설정 가져오기 실패: '+(e && e.message ? e.message : e));
      return false;
    }
  };

  // ── 클라우드 자동 동기화: su_* 설정 키 변경 시 GitHub에 자동 반영 ──
  // 대용량/경기기록/보안/상태 키는 제외하고, 순수 "설정" 키만 트리거
  const _CLOUD_EXCLUDE_EXACT = new Set([
    'su_p','su_pp','su_t','su_mm','su_um','su_cm','su_ck','su_pro','su_ptn','su_tn','su_ttm','su_indm','su_gjm',
    'su_rank_snap','su_cal_sched','su_votes','su_notices','su_seasons',
    'su_bld_ck','su_bld_pro',
    'su_unified_settings_v1','su_unified_settings_migrated_v2',
    'su_gh_token','su_fb_pw','su_admin_hash','su_admin_hashes',
    'su_last_admin_save','su_last_save_time','su_admin_hashes_updated_at',
  ]);
  const _CLOUD_EXCLUDE_PREFIX = [
    'su_sync_','su_match_store_','su_sharecard_cache_',
    'su_hist_ext_','su_hist_ext_meta_',
  ];
  // UI 전용 상태 키 (너무 자주 바뀌어서 클라우드 저장 불필요)
  const _CLOUD_EXCLUDE_UI_STATE = new Set([
    'su_cfg_open','su_cfg_bottom_open','su_cfg_view_mode',
  ]);

  let _cloudDebounceT = null;
  function _maybeScheduleCloud(k){
    try{
      if(_inSync) return;
      if(!k || typeof k!=='string') return;
      if(!k.startsWith('su_') && k!=='b2_femco_settings_v1' && k!=='cfg_femco_univ') return;
      if(_CLOUD_EXCLUDE_EXACT.has(k)) return;
      if(_CLOUD_EXCLUDE_UI_STATE.has(k)) return;
      for(const p of _CLOUD_EXCLUDE_PREFIX){ if(k.startsWith(p)) return; }
      // 디바운스: 연속 변경 시 마지막 변경 후 600ms에 한 번만 실행
      clearTimeout(_cloudDebounceT);
      _cloudDebounceT = setTimeout(function(){
        try{
          if(typeof window._scheduleCloudAppSettingsSave === 'function'){
            window._scheduleCloudAppSettingsSave();
          }
        }catch(e){}
      }, 600);
    }catch(e){}
  }

  // install wrappers
  try{
    localStorage.setItem = function(k, v){
      const r = _origSet(k, v);
      if(!_inSync){
        _upsert(String(k), String(v));
        _maybeScheduleCloud(String(k));
      }
      return r;
    };
    localStorage.removeItem = function(k){
      const r = _origRem(k);
      if(!_inSync){
        _del(String(k));
        _maybeScheduleCloud(String(k));
      }
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
