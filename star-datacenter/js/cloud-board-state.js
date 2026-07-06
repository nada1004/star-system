/* ══════════════════════════════════════
   GitHub JSON 읽기 전용 불러오기
   ▼ GitHub에 올린 data.json 의 RAW URL을 입력하세요 ▼
══════════════════════════════════════ */
const GITHUB_JSON_URL = 'https://raw.githubusercontent.com/nada1004/star-system/main/star-datacenter/data.json';

const _FB_PW_DEFAULT = 'haram1019!@'; // Firebase Security Rules admin_pw 기본값
function _boardCanManage(){
  try{ return !!(typeof isLoggedIn!=='undefined' && isLoggedIn) && !(typeof isSubAdmin!=='undefined' && isSubAdmin); }catch(e){ return false; }
}

// Firebase에 현재 데이터 저장 (관리자 전용)
async function fbCloudSave(opts) {
  const includeSettings = !(opts && opts.includeSettings === false);
  const token = localStorage.getItem('su_gh_token');
  if (!token || !_boardCanManage() || typeof window.fbSet !== 'function') return;
  const savedAt = Date.now();
  // await 이전에 설정 → race condition 방지 + 새로고침 후에도 로컬 데이터 보호
  window._lastAdminSaveTime = savedAt;
  window._isSaving = true;
  localStorage.setItem('su_last_admin_save', String(savedAt)); // 새로고침 후에도 복원
  // (용량 최적화) Firebase 페이로드를 줄이기 위해 players.photo(base64)를 분리 저장
  // - localSave와 동일한 전략: 사진은 map으로 따로 보내고, players에는 photo를 제거
  // - history의 eloAfter는 UI에서 재계산 가능하므로 제거(크기 절감)
  const _pPhotoMap = {};
  const _pNoPhoto = (players||[]).map(p=>{
    const c={...p};
    if(c.photo){ _pPhotoMap[c.name]=c.photo; delete c.photo; }

    if(c.history && c.history.length){
      // eslint-disable-next-line no-unused-vars
      c.history = c.history.map(({eloAfter,...h})=>h);
    }
    return c;
  });

  // 설정(localStorage)도 함께 업로드해서 다른 기기에서도 "바로" 적용되게 함
  // 단, 일반 "경기 기록 저장"에서는 너무 무거워질 수 있어 opts.includeSettings=false 시 생략
  const _syncLs = {};
  if(includeSettings){
    try{
      for(let i=0;i<localStorage.length;i++){
        const k = localStorage.key(i);
        if(!k || typeof k!=='string') continue;
        if(!k.startsWith('su_')) continue;
        if(k.startsWith('su_pp')) continue;
        if(k==='su_fb_pw' || k==='su_gh_token' || k==='su_admin_hash' || k==='su_admin_hashes') continue;
        if(k==='su_last_admin_save' || k==='su_last_save_time') continue;
        // 기록 저장 때마다 외부탭 원문/대형 설정까지 같이 올리면 과도하게 무거워짐
        if(k==='su_hist_ext_data_v1' || k==='su_hist_ext_proxy_presets_v1' || k==='su_hist_ext_proxy_preset_sel_v1' || k==='su_hist_ext_last_modified') continue;
        const v = localStorage.getItem(k);
        if(v==null) continue;
        // 너무 큰 값은 제외(예: 이미지 base64 등)
        if(String(v).length > 200000) continue;
        _syncLs[k] = v;
      }
    }catch(e){}
  }

  const dataObj = {
    players: _pNoPhoto,
    playerPhotos: _pPhotoMap,
    univCfg, maps, tourD, miniM, univM, comps, ckM,
    compNames, curComp, proM, proTourneys, tiers: TIERS, tourneys, indM, gjM,
    // 🎯 티어대회 기록(대전기록 탭/스트리머 history 동기화용)
    ttM: (typeof ttM!=='undefined' ? ttM : []),
    boardPlayerOrder, boardOrder, userMapAlias, playerStatusIcons, notices,
    curProComp, _ttCurComp, seasons, calScheduled,
    // 투표 집계(_my 제외하여 개인 투표 정보 보호)
    voteAgg: (()=>{ const agg={}; Object.entries(voteData||{}).forEach(([k,v])=>{ if(!k.endsWith('_my')&&v&&typeof v==='object') agg[k]=v; }); return agg; })(),
    savedAt
  };
  // photo 맵을 window에 노출하고 로컬 캐시에도 반영 (새로고침 후에도 사진 유지)
  window.playerPhotos = _pPhotoMap;
  Object.entries(_pPhotoMap).forEach(([name,url])=>{ _brdPhotoCacheSet(name, url); });
  if(includeSettings){
    dataObj.appSettings = {
      fabTabs: JSON.parse(localStorage.getItem('su_fabTabs')||'{}'),
      globalImgSettings: JSON.parse(localStorage.getItem('su_b2_global_img_settings')||'{}'),
      imgSettings: JSON.parse(localStorage.getItem('su_img_settings')||'{}'),
      fabHideMobile: localStorage.getItem('su_fabHideMobile')==='1',
      fabHidePC: localStorage.getItem('su_fabHidePC')==='1',
      darkMode: localStorage.getItem('su_dark')==='1',
      b2LabelAlpha: localStorage.getItem('su_b2la')||'16',
      b2BgAlpha: localStorage.getItem('su_b2ba')||'9',
      designV2On: localStorage.getItem('su_design_v2')==='1',
      designV2Preset: localStorage.getItem('su_design_v2_preset')||'base',
      designV2Bright: localStorage.getItem('su_design_v2_bright')||'0',
      designV2Dark: localStorage.getItem('su_design_v2_dark')||'0',
      designV2Colors: localStorage.getItem('su_design_v2_colors')||'{}',
      designV2Effects: localStorage.getItem('su_design_v2_effects')||'{}',
      appFontPreset: localStorage.getItem('su_app_font_preset')||'noto',
      appFontCss: localStorage.getItem('su_app_font_css')||'',
      appFontFamily: localStorage.getItem('su_app_font_family')||'',
      appFontCssText: localStorage.getItem('su_app_font_css_text')||'',
      appFontAliasMap: localStorage.getItem('su_app_font_alias_map')||'{}',
      uiScalePct: localStorage.getItem('su_ui_scale_pct')||'100',
      uiScalePcPct: localStorage.getItem('su_ui_scale_pc_pct')||localStorage.getItem('su_ui_scale_pct')||'100',
      uiScaleTbPct: localStorage.getItem('su_ui_scale_tb_pct')||localStorage.getItem('su_ui_scale_pct')||'100',
      uiScaleMbPct: localStorage.getItem('su_ui_scale_mb_pct')||localStorage.getItem('su_ui_scale_pct')||'100',
      bgmEnabled: (localStorage.getItem('su_bgm_enabled') ?? '1') === '1',
      bgmShuffle: (localStorage.getItem('su_bgm_shuffle') ?? '0') === '1',
      bgmVolume: parseInt(localStorage.getItem('su_bgm_volume')||'50',10) || 50,
      bgmList: localStorage.getItem('su_bgm_list') || '',
      soopList: localStorage.getItem('su_soop_list') || '',
      // 펨코스타일 설정 (su_ 접두사 없어서 ls에 미포함 → 별도 명시)
      femcoSettings: localStorage.getItem('b2_femco_settings_v1') || null,
      femcoUniv: localStorage.getItem('cfg_femco_univ') || null,
      ls: _syncLs
    };
  }
  // 페이로드 크기 검사 (압축 후 실제 전송 크기 기준)
  let _fbPayloadSize = 0;
  try {
    _fbPayloadSize = JSON.stringify(dataObj).length;
    const statusEl = document.getElementById('cloudStatus');
    const splitInfo = (typeof window.__suEstimateSplitStore === 'function')
      ? window.__suEstimateSplitStore(dataObj)
      : null;
    // (버그픽스) 경고 기준을 압축 후 크기로 변경 — LZString 압축 시 평균 40~60% 절감되므로
    // 원본 크기로 비교하면 불필요한 "저장 실패 가능" 경고가 표시됨
    let warnBytes;
    let warnLabel;
    if(splitInfo && splitInfo.maxBytes){
      warnBytes = splitInfo.maxBytes;
      warnLabel = `분리 저장 최대 파일 ${(warnBytes/1024/1024).toFixed(1)}MB`;
    } else {
      // 압축률 추정: LZString은 보통 원본의 45~55% 수준
      const compressedEstimate = Math.round(_fbPayloadSize * 0.5);
      warnBytes = compressedEstimate;
      warnLabel = `데이터 ${(_fbPayloadSize/1024/1024).toFixed(1)}MB (압축 후 약 ${(compressedEstimate/1024/1024).toFixed(1)}MB)`;
    }
    if (warnBytes > 3 * 1024 * 1024) {
      if (statusEl) { statusEl.style.color='#dc2626'; statusEl.textContent=`⚠️ ${warnLabel} — 저장 실패 가능`; }
      console.warn('[fbCloudSave] 크기 위험:', (warnBytes/1024).toFixed(0)+'KB');
    } else if (warnBytes > 2 * 1024 * 1024) {
      if (statusEl) { statusEl.style.color='#d97706'; statusEl.textContent=`⚠️ ${warnLabel} — 곧 저장 실패할 수 있습니다`; }
      console.warn('[fbCloudSave] 크기 경고:', (warnBytes/1024).toFixed(0)+'KB');
    }
    console.log('[fbCloudSave] 페이로드 크기:', (_fbPayloadSize/1024).toFixed(0)+'KB');
  } catch(e) {}
  // 🔧 Firebase는 undefined 값 저장 불가 → 전송 전 재귀적으로 undefined 제거
  function _removeUndefined(obj) {
    if (Array.isArray(obj)) {
      return obj.map(_removeUndefined);
    }
    if (obj !== null && typeof obj === 'object') {
      const result = {};
      Object.keys(obj).forEach(k => {
        if (obj[k] !== undefined) {
          result[k] = _removeUndefined(obj[k]);
        }
        // undefined 필드는 그냥 생략 (Firebase 저장 시 오류 방지)
      });
      return result;
    }
    return obj;
  }

  // 🔧 LZString 압축 후 전송
  const _tryFbSet = async (obj) => {
    const clean = _removeUndefined(obj);
    const jsonStr = JSON.stringify(clean);
    const compressed = LZString.compressToBase64(jsonStr);
    const payload = { _lz: compressed };
    console.log('[fbCloudSave] 원본:', (jsonStr.length/1024).toFixed(0)+'KB → 압축:', (compressed.length/1024).toFixed(0)+'KB ('+((1-compressed.length/jsonStr.length)*100).toFixed(0)+'% 절감)');
    return window.fbSet(payload);
  };
  try {
    await _tryFbSet(dataObj);
    // GitHub-only 모드: window.fbSet가 이미 GitHub data.json 저장을 수행함
    try{
      window._lastAppliedSavedAt = Math.max(Number(window._lastAppliedSavedAt||0)||0, savedAt);
      localStorage.setItem('su_sync_last_upload_ok_at', String(Date.now()));
      localStorage.setItem('su_sync_last_remote_saved_at', String(savedAt));
      if(typeof window.refreshCloudSyncStatus==='function') window.refreshCloudSyncStatus('✅ 업로드 완료', '#16a34a');
    }catch(e){}
  } catch(e) {
    // 에러 상세 정보 최대한 추출
    const errCode = e.code || '';
    const errMsg = e.message || '';
    const errStr = String(e);
    const errName = e.name || '';
    const fullErr = [errCode, errMsg, errName, errStr].filter(Boolean).filter((v,i,a)=>a.indexOf(v)===i).join(' | ');
    console.error('[fbCloudSave] 상세:', {code:errCode, message:errMsg, name:errName, full:errStr, error:e});
    const statusEl = document.getElementById('cloudStatus');
    if (statusEl) {
      const isSizeErr = fullErr.includes('exceeded') || fullErr.includes('too large') || fullErr.includes('payload') || fullErr.includes('413');
      const isAuthErr = fullErr.includes('Permission') || fullErr.includes('PERMISSION') || fullErr.includes('auth') || fullErr.includes('denied') || fullErr.includes('401') || fullErr.includes('403');
      const hint = isSizeErr ? ' → 데이터 크기 초과' : isAuthErr ? ' → GitHub 토큰/권한 문제' : '';
      const display = fullErr || '알 수 없는 오류 (콘솔 F12 확인)';
      statusEl.style.color='#dc2626';
      statusEl.innerHTML = '❌ GitHub 저장 실패: ' + display + hint
        + ' <button onclick="this.parentElement.textContent=\'\'" style="margin-left:6px;background:none;border:1px solid #dc2626;border-radius:4px;color:#dc2626;font-size:11px;cursor:pointer;padding:1px 6px">닫기</button>';
    }
    throw e;
  } finally {
    window._isSaving = false;
    // 저장 중 놓친 수신 데이터가 있으면 재적용
    if (window._fbPendingData) {
      const pending = window._fbPendingData;
      window._fbPendingData = null;
      setTimeout(() => {
        // pending은 이미 admin_pw 제거된 clean 데이터
        const pendingSa = Number(pending && pending.savedAt || 0) || 0;
        const localSavedAt = (()=>{ try{ return Math.max(Number(window._lastAdminSaveTime||0)||0, Number(localStorage.getItem('su_last_admin_save')||0)||0); }catch(e){ return Number(window._lastAdminSaveTime||0)||0; } })();
        const lastApplied = Number(window._lastAppliedSavedAt||0) || 0;
        if (pendingSa && localSavedAt && pendingSa < localSavedAt) {
          console.warn('[sync] pending stale remote ignored', { pendingSavedAt: pendingSa, localSavedAt });
          return;
        }
        if (pendingSa && lastApplied && pendingSa <= lastApplied) {
          return;
        }
        if (typeof _applyCloudData === 'function') {
          if(pendingSa) window._lastAppliedSavedAt = Math.max(lastApplied, pendingSa);
          _applyCloudData(pending);
          try{ if(typeof window._syncWindowDataRefs === 'function') window._syncWindowDataRefs(); }catch(e){}
          if (typeof localSave === 'function') localSave();
          try{ if(typeof window._primeMatchSyncSignature === 'function') window._primeMatchSyncSignature(true); }catch(e){}
          if (typeof fixPoints === 'function') fixPoints();
          window._compListCache = {}; window._shareAllMatchesCached = null; window._histTourneyCache = {};
          if (typeof render === 'function') render();
        }
      }, 200);
    }
  }
}

// GitHub data.json 자동 업로드 (관람자 수천 명 무료 처리용)
// 설정탭에서 GitHub 토큰(su_gh_token) 설정 시 활성화
async function githubDataSave(dataObj) {
  const token = localStorage.getItem('su_gh_token');
  if (!token) return; // 토큰 미설정 시 skip
  const apiUrl = 'https://api.github.com/repos/nada1004/star-system/contents/star-datacenter/data.json'; // 🔧 경로 통일
  // 현재 파일 SHA 조회 (업데이트 시 필수)
  const getRes = await fetch(apiUrl, {
    headers: { 'Authorization': `token ${token}`, 'Accept': 'application/vnd.github.v3+json' }
  });
  if (!getRes.ok) throw new Error('GitHub 파일 조회 실패: ' + getRes.status);
  const fileInfo = await getRes.json();
  // LZString 압축 후 base64 인코딩
  const compressed = LZString.compressToBase64(JSON.stringify(dataObj));
  const payload = { _lz: compressed };
  const jsonStr = JSON.stringify(payload);
  const b64 = btoa(unescape(encodeURIComponent(jsonStr)));
  // 파일 업데이트
  const putRes = await fetch(apiUrl, {
    method: 'PUT',
    headers: { 'Authorization': `token ${token}`, 'Accept': 'application/vnd.github.v3+json', 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: `데이터 업데이트 ${new Date().toLocaleString('ko-KR')}`,
      content: b64,
      sha: fileInfo.sha
    })
  });
  if (!putRes.ok) throw new Error('GitHub 저장 실패: ' + putRes.status);
}


try{ window.fbCloudSave = fbCloudSave; }catch(e){}

// ── GitHub JSON 가져오기 (네트워크 요청 + 파싱만, 적용은 호출자가 결정) ──
// cloudLoad(수동)와 _autoSyncApply(자동) 양쪽에서 공유하는 fetch 로직.
async function _fetchGithubData(){
  if(typeof window.__suFetchGithubMergedData === 'function'){
    return await window.__suFetchGithubMergedData();
  }
  const baseUrl=GITHUB_JSON_URL;
  const ghApiUrl='https://api.github.com/repos/nada1004/star-system/contents/star-datacenter/data.json';
  const urls=[
    baseUrl+'?nocache='+Date.now(),
    'https://cdn.jsdelivr.net/gh/nada1004/star-system@main/star-datacenter/data.json',
    ghApiUrl,
    'https://corsproxy.io/?url='+encodeURIComponent(baseUrl),
    'https://api.allorigins.win/raw?url='+encodeURIComponent(baseUrl),
  ];

  // 각 URL을 파싱까지 완료한 데이터 객체로 변환하는 함수
  const tryUrl = async (url) => {
    const ctrl=new AbortController();
    const timer=setTimeout(()=>ctrl.abort(),12000);
    try{
      const res=await fetch(url,{cache:'no-store',mode:'cors',signal:ctrl.signal});
      clearTimeout(timer);
      if(!res.ok) throw new Error('HTTP '+res.status);
      const text=(await res.text()).replace(/^\uFEFF/,'').trim();
      if(text.startsWith('<')) throw new Error('HTML 응답');
      const raw=JSON.parse(text);
      if(raw&&raw.content&&raw.encoding==='base64'){
        const bin=atob(raw.content.replace(/\s/g,''));
        const bytes=new Uint8Array(bin.length);
        for(let i=0;i<bin.length;i++) bytes[i]=bin.charCodeAt(i);
        return JSON.parse(new TextDecoder('utf-8').decode(bytes));
      }
      return raw;
    }catch(e){ clearTimeout(timer); throw e; }
  };

  // 모든 URL 동시 시도 → 가장 먼저 성공한 결과 사용 (Promise.any)
  try{
    return await Promise.any(urls.map(tryUrl));
  }catch(aggErr){
    const errs=(aggErr.errors||[aggErr]).map((e,i)=>`[${i+1}] ${e?.message||e}`).join('\n');
    throw new Error('데이터를 불러올 수 없습니다.\n\n원인:\n'+errs+'\n\n해결방법:\n· 인터넷 연결 확인\n· GitHub 저장소(nada1004/star-system)가 공개(Public) 상태인지 확인\n· data.json 파일이 main 브랜치에 있는지 확인');
  }
}

// 가져온 데이터를 전역 상태에 적용 + 탭/캐시 초기화 + init() 재실행까지 공통 처리
function _applyFetchedCloudData(d){
  _applyCloudData(d);
  console.log('[불러오기] 데이터 구조:', {players:players.length,miniM:miniM.length,univM:univM.length,comps:comps.length,ckM:ckM.length,proM:proM.length,tourneys:tourneys.length});

  localSave();
  fixPoints();
  window._compListCache={}; // 대회 목록 캐시 초기화
  window._shareAllMatchesCached=null; // 공유카드 캐시 초기화
  window._histTourneyCache={}; // 대회 기록 탭 캐시 초기화
  curTab='total'; // 탭 초기화 (렌더링 오류 방지)
  statsSub='overview';
  histSub='mini';
  compSub='league';
  // yearOptions를 불러온 데이터에서 자동 추출
  (function(){
    const allD=[...d.miniM||[],...d.univM||[],...d.comps||[],...d.ckM||[],...d.proM||[]];
    mergeValidYearsIntoOptions(yearOptions, allD);
  })();
  filterYear='전체'; // 연도 필터 초기화 (데이터가 다른 년도일 수 있음)
  filterMonth='전체';
  init();

  const compCount=(d.comps||[]).length;
  const tourCount=(d.tourneys||[]).reduce((s,t)=>s+(t.groups||[]).reduce((ss,g)=>ss+(g.matches||[]).filter(m=>m.sa!=null).length,0),0);
  const miniCount=(d.miniM||[]).length;
  return { compCount, tourCount, miniCount };
}

// ── GitHub JSON 불러오기 (수동 — 사용자가 버튼을 눌렀을 때) ───────
window.cloudLoad = async function(){
  try{
    gsSetStatus('📥 불러오는 중...', 'var(--blue)');
    const loadBtn=document.getElementById('btnCloudLoad');
    if(loadBtn){loadBtn.disabled=true;loadBtn.textContent='⏳ 불러오는 중...';}

    const d = await _fetchGithubData();
    if(!confirm('GitHub 데이터를 불러옵니다.\n\n⚠️ 현재 로컬 데이터가 덮어씌워집니다. 계속하시겠습니까?')) {
      if(loadBtn){loadBtn.disabled=false;loadBtn.innerHTML='<span>☁️</span> 데이터 불러오기';}
      return;
    }

    const { compCount, tourCount, miniCount } = _applyFetchedCloudData(d);
    const _lb=document.getElementById('btnCloudLoad');if(_lb){_lb.disabled=false;_lb.innerHTML='<span>☁️</span> 데이터 불러오기';}
    gsSetStatus(`✅ 불러오기 완료 (${new Date().toLocaleTimeString()}) — 미니 ${miniCount}건·대회 ${compCount+tourCount}건`, 'var(--green)');
  } catch(e){
    const _lb2=document.getElementById('btnCloudLoad');if(_lb2){_lb2.disabled=false;_lb2.innerHTML='<span>☁️</span> 데이터 불러오기';}
    const errMsg=e.message||String(e);
    gsSetStatus('❌ 불러오기 실패 (하단 메시지 확인)', 'var(--red)');
    console.error('[cloudLoad 오류]', e);
    // 간결한 에러 메시지 표시
    const shortMsg=errMsg.split('\n').slice(0,3).join('\n');
    setTimeout(()=>alert('⚠️ 데이터 불러오기 실패\n\n'+shortMsg), 100);
  }
};

// ── GitHub JSON 자동 동기화 (백그라운드 — confirm 없이 조용히) ─────
// 수동 cloudLoad와 달리 confirm 다이얼로그를 띄우지 않는다.
// 호출 시점 가드(모달 열림/입력 중 여부 등)는 _autoSyncCheck에서 처리한다.
window._autoSyncApply = async function(){
  const d = await _fetchGithubData();
  return _applyFetchedCloudData(d);
};


/* ════ 현황판 탭 rBoard ════ */
// 현황판 전용 photo 캐시: setBrdPhoto 저장 시 갱신, 렌더링 시 참조
var _brdPhotoCache = (function(){
  try{
    const raw = localStorage.getItem('su_brd_photo_cache');
    return raw ? JSON.parse(raw) : {};
  }catch(e){ return {}; }
})();
// MiscStore에서 비동기 로드 (IDB 우선)
(async function _brdPhotoCacheLoadFromIdb(){
  try{
    if(typeof MiscStore==='undefined') return;
    const v = await MiscStore.get('su_brd_photo_cache');
    if(v && typeof v === 'object') _brdPhotoCache = v;
  }catch(e){}
})();
function _brdPhotoCacheSet(name, url){
  if(url) _brdPhotoCache[name]=url;
  else delete _brdPhotoCache[name];
  try{
    if(typeof MiscStore!=='undefined') MiscStore.set('su_brd_photo_cache', _brdPhotoCache);
    else localStorage.setItem('su_brd_photo_cache', JSON.stringify(_brdPhotoCache));
  }catch(e){}
}
function _getBrdPhoto(p){
  return p.photo
    || (window.playerPhotos && window.playerPhotos[p.name])
    || _brdPhotoCache[p.name]
    || '';
}

let boardSelUniv='전체';
let boardCompactMode=false; // 소형 칩 보기
let boardGridCols=1; // 1열/2열 보기
let boardCardView=false; // 포토카드 뷰
let boardCardShape='circle'; // 포토카드 이미지 모양: 'circle' | 'square'
let boardCollapsed = new Set(); // 접힌 대학 이름 집합
// 칩 프로필 이미지 설정 (localStorage에서 복원)
// NOTE: 전역(인라인 onclick) 접근 호환을 위해 var 사용 (window 프로퍼티로 노출)
var boardChipPhotoShape = localStorage.getItem('su_bcp_shape') || 'circle'; // 'circle' | 'square'
var boardChipPhotoSize  = parseInt(localStorage.getItem('su_bcp_size') || '26', 10); // px
var boardChipLayoutScale = parseInt(localStorage.getItem('su_bcp_layout') || '100', 10); // percent
function saveBoardChipPhotoSettings(){
  localStorage.setItem('su_bcp_shape', boardChipPhotoShape);
  localStorage.setItem('su_bcp_size', String(boardChipPhotoSize));
  localStorage.setItem('su_bcp_layout', String(boardChipLayoutScale||100));
  try{ if(typeof window.cfgTouchPrefsSync==="function") window.cfgTouchPrefsSync(); }catch(e){}
  // 스트리머 프로필 이미지 공통 CSS 변수 동기화
  try{ if(typeof applyProfileShapeVars==='function') applyProfileShapeVars(); }catch(e){}
}
// 현황판 선수 순서: {univ: [name, name, ...]}
var boardPlayerOrder = J('su_bpo') || {};

function _findBrdCardByUniv(univName, root){
  try{
    const base = root || document.getElementById('board-wrap') || document;
    const cards = base && base.querySelectorAll ? base.querySelectorAll('.brd-card') : [];
    for(const c of cards){
      if(c && c.dataset && c.dataset.univ === univName) return c;
    }
    return null;
  }catch(e){
    return null;
  }
}

function _getBoardUnivs(){
  const univs = getAllUnivs();
  if(!boardOrder.length) return univs;
  const ordered = [];
  const seen = new Set();
  boardOrder.forEach(name => { const u = univs.find(x=>x.name===name); if(u&&!seen.has(u.name)){ordered.push(u);seen.add(u.name);} });
  univs.forEach(u => { if(!seen.has(u.name)){ordered.push(u);seen.add(u.name);} });
  return ordered;
}
function toggleBoardUniv(name){
  if(typeof boardSelUniv==='undefined') return;
  boardSelUniv = (boardSelUniv===name) ? '전체' : name;
  const sel = document.getElementById('board-univ-sel');
  if(sel) sel.value = boardSelUniv;
  _updateBoardSaveLabel();
  render();
}
function _brdCollapseToggle(univName) {
  if (boardCollapsed.has(univName)) boardCollapsed.delete(univName); else boardCollapsed.add(univName);
  const card = _findBrdCardByUniv(univName);
  if (!card) return;
  const body = card.querySelector('.brd-card-body');
  if (body) body.style.display = boardCollapsed.has(univName) ? 'none' : '';
  const btn = card.querySelector('.brd-collapse-btn');
  if (btn) btn.textContent = boardCollapsed.has(univName) ? '▶' : '▼';
}
function _brdCollapseAll() {
  _getBoardUnivs().forEach(u => boardCollapsed.add(u.name));
  document.querySelectorAll('.brd-card').forEach(card => {
    const body = card.querySelector('.brd-card-body'); if(body) body.style.display='none';
    const btn = card.querySelector('.brd-collapse-btn'); if(btn) btn.textContent='▶';
  });
}
function _brdExpandAll() {
  boardCollapsed.clear();
  document.querySelectorAll('.brd-card').forEach(card => {
    const body = card.querySelector('.brd-card-body'); if(body) body.style.display='';
    const btn = card.querySelector('.brd-collapse-btn'); if(btn) btn.textContent='▼';
  });
}
function _updateBoardSaveLabel(){
  const lbl = document.getElementById('btn-img-save-label');
  const brdLbl = document.getElementById('brd-save-btn-label');
  const text = (boardSelUniv && boardSelUniv!=='전체') ? boardSelUniv+' 이미지저장' : '이미지저장';
  if(lbl) lbl.textContent = text;
  if(brdLbl) brdLbl.textContent = text;
}

function _captureErrText(e){
  try{
    if(!e) return '알 수 없는 오류';
    if (typeof e === 'string') return e;
    if (e instanceof Error) return e.message || String(e);
    if (typeof Event !== 'undefined' && e instanceof Event) {
      const t = e && e.type ? e.type : 'event';
      return '이벤트 오류(' + t + ')';
    }
    if (e && typeof e === 'object') {
      if (typeof e.message === 'string' && e.message) return e.message;
      if (typeof e.type === 'string' && e.type) return '이벤트 오류(' + e.type + ')';
    }
    return String(e);
  }catch(_e){
    return '알 수 없는 오류';
  }
}

// 하단 이미지저장 버튼: 현재 보이는 화면을 그대로 캡처 (현황판 전체/개별 저장은 현황판 탭 내 버튼 사용)
window.saveCurrentView = async function saveCurrentView(){
  const cap = document.getElementById('cap');
  if(!cap){ alert('캡처할 영역이 없습니다.'); return; }

  const btn = document.getElementById('btn-img-save');
  const oldBtnHtml = btn ? btn.innerHTML : '';
  if(btn){ btn.disabled = true; btn.innerHTML = '⏳ 저장중'; }

  const _setToast = (text) => {
    try{
      const t = document.getElementById('_save-toast');
      if(t) t.innerHTML = text;
    }catch(e){}
  };

  const tmpDiv = document.createElement('div');
  const capRect = cap.getBoundingClientRect();
  const capW = Math.max(320, Math.round(capRect.width || cap.scrollWidth || 900));
  const capH = Math.max(200, Math.round(cap.scrollHeight || cap.offsetHeight || capRect.height || 600));

  tmpDiv.style.cssText = `position:fixed;left:-9999px;top:0;width:${capW}px;min-height:${capH}px;background:#ffffff;padding:24px;box-sizing:border-box;`;
  tmpDiv.innerHTML = cap.innerHTML;
  tmpDiv.querySelectorAll('.no-export').forEach(el=>el.remove());

  document.body.appendChild(tmpDiv);

  try{
    if(typeof _showSaveLoading === 'function') _showSaveLoading();
    _setToast('<span style="display:inline-block;animation:_spin .8s linear infinite">⏳</span> 준비 중...');
    try{
      const a = document.createElement('a');
      const supportsDownload = ('download' in a);
      const ua = String(navigator.userAgent||'');
      const isIOS = /iPad|iPhone|iPod/i.test(ua);
      const isInApp = /KAKAOTALK|Instagram|FBAN|FBAV|NAVER|Whale|Line/i.test(ua);
      if(!supportsDownload || isIOS || isInApp){
        const w = window.open('', '_blank');
        if(w){
          try{
            w.document.write('<html><head><meta charset="utf-8"><title>이미지 생성 중...</title></head>'
              + '<body style="margin:0;font-family:sans-serif;background:#111;color:#fff;padding:14px">'
              + '이미지 생성 중입니다... 잠시만 기다려주세요.'
              + '</body></html>');
            w.document.close();
          }catch(e){}
          window.__captureDlWin = w;
        }
      }
    }catch(e){}
    try{
      if(typeof _applyBoardBgAutoSizing === 'function') _applyBoardBgAutoSizing(tmpDiv);
      if(typeof _b2ApplyBgAutoSizing === 'function') _b2ApplyBgAutoSizing(tmpDiv);
    }catch(e){}

    const w = Math.max(320, tmpDiv.scrollWidth || capW);
    const h = Math.max(200, tmpDiv.scrollHeight || capH);
    const tabNames = {total:'스트리머',board2:'현황판',tier:'티어순위',mini:'미니대전',univm:'대학대전',univck:'대학CK',comp:'대회',pro:'프로리그',hist:'대전기록',stats:'통계',cal:'캘린더'};
    const fname = `스타대학_${tabNames[window.curTab]||window.curTab||'화면'}_${new Date().toISOString().slice(0,10)}.png`;

    await _captureAndSave(tmpDiv, w, h, fname);
  }catch(e){
    alert('이미지 저장 오류: ' + _captureErrText(e));
  }finally{
    if(tmpDiv.parentNode) document.body.removeChild(tmpDiv);
    if(typeof _hideSaveLoading === 'function') _hideSaveLoading();
    if(btn){ btn.disabled = false; btn.innerHTML = oldBtnHtml; }
  }
}


// 대학 내 선수 정렬 (boardPlayerOrder 우선, 없으면 기본 정렬)
function _getBoardPlayers(univName, includeRetired=false){
  const univPlayers = players.filter(p=>p.univ===univName&&(includeRetired||!p.retired)&&!p.hideFromBoard&&!p.hidden);
  const order = boardPlayerOrder[univName] || [];
  if(!order.length){
    // 무소속: 티어 → 포인트 순
    if(univName==='무소속'){
      return [...univPlayers].sort((a,b)=>TIERS.indexOf(a.tier)-TIERS.indexOf(b.tier)||b.points-a.points);
    }
    // 기본: MAIN_ROLES → 티어 → 포인트
    return [...univPlayers].sort((a,b)=>{
      const ra=getRoleOrder(a.role),rb=getRoleOrder(b.role);
      if(ra!==rb)return ra-rb;
      return TIERS.indexOf(a.tier)-TIERS.indexOf(b.tier)||b.points-a.points;
    });
  }
  const sorted = [];
  order.forEach(name=>{ const p=univPlayers.find(x=>x.name===name); if(p) sorted.push(p); });
  univPlayers.forEach(p=>{ if(!order.includes(p.name)) sorted.push(p); });
  return sorted;
}

function saveBoardPlayerOrder(){
  localStorage.setItem('su_bpo', JSON.stringify(boardPlayerOrder));
}

const _brdBgImageMeta = {};
let _brdBgAutoResizeBound = false;

function _loadBoardBgImageMeta(url, cb){
  try{
    const src = toHttpsUrl(url||'');
    if(!src){ cb && cb(null); return; }
    if(_brdBgImageMeta[src] && _brdBgImageMeta[src].w && _brdBgImageMeta[src].h){
      cb && cb(_brdBgImageMeta[src]);
      return;
    }
    const img = new Image();
    img.onload = function(){
      _brdBgImageMeta[src] = { w: img.naturalWidth||0, h: img.naturalHeight||0 };
      cb && cb(_brdBgImageMeta[src]);
    };
    img.onerror = function(){ cb && cb(null); };
    img.src = src;
  }catch(e){
    cb && cb(null);
  }
}

function _resolveBoardAutoFit(kind, mode, rect, meta){
  const rawMode = String(mode||'auto');
  if(rawMode==='cover' || rawMode==='contain' || rawMode==='fill') return rawMode;
  const vw = window.innerWidth || 1280;
  if(!rect || !rect.width || !rect.height){
    if(kind==='card') return vw <= 900 ? 'contain' : 'cover';
    if(kind==='profile') return vw <= 640 ? 'contain' : 'cover';
    return vw <= 900 ? 'contain' : 'cover';
  }
  if(!meta || !meta.w || !meta.h){
    if(kind==='profile'){
      if(vw <= 640) return 'contain';
      if(rect.width <= 70) return 'contain';
      return 'cover';
    }
    if(kind==='card'){
      if(vw <= 900) return 'contain';
      if(rect.width < 120) return 'contain';
      return 'cover';
    }
    if(vw <= 640) return 'contain';
    if(rect.width < 300) return 'contain';
    return 'cover';
  }
  const cardRatio = rect.width / rect.height;
  const imgRatio = meta.w / meta.h;
  const diff = Math.abs(Math.log(imgRatio / cardRatio));
  if(kind==='profile'){
    if(vw <= 640) return diff > 0.33 ? 'contain' : 'cover';
    if(vw <= 1024) return diff > 0.3 ? 'contain' : 'cover';
    if(imgRatio > 1.55 || imgRatio < 0.7) return 'contain';
    return diff > 0.28 ? 'contain' : 'cover';
  }
  if(kind==='card'){
    if(vw <= 640) return diff > 0.24 ? 'contain' : 'cover';
    if(vw <= 1024) return diff > 0.28 ? 'contain' : 'cover';
    if(imgRatio > 1.14 || imgRatio < 0.5) return 'contain';
    return diff > 0.3 ? 'contain' : 'cover';
  }
  if(vw <= 640) return diff > 0.32 ? 'contain' : 'cover';
  if(vw <= 1024) return diff > 0.3 ? 'contain' : 'cover';
  if(rect.width < 280 || rect.height < 220) return diff > 0.24 ? 'contain' : 'cover';
  if(imgRatio > 1.75 || imgRatio < 0.64) return 'contain';
  return diff > 0.4 ? 'contain' : 'cover';
}

function _resolveBoardBgSizeMode(mode, rect, meta){
  return _resolveBoardAutoFit('bg', mode, rect, meta);
}

function _resolveBoardAutoPosition(kind, fit, rect, meta){
  if(fit !== 'cover') return 'center center';
  const imgRatio = meta && meta.w && meta.h ? (meta.w / meta.h) : 1;
  const boxRatio = rect && rect.width && rect.height ? (rect.width / rect.height) : 1;
  if(!imgRatio || !boxRatio) return 'center center';
  const portraitPressure = boxRatio / imgRatio;
  if(kind === 'bg'){
    if(portraitPressure > 2.1 && rect && rect.height >= 260) return 'bottom center';
    if(portraitPressure > 1.35) return 'top center';
    return 'center center';
  }
  if(kind === 'card'){
    if(portraitPressure > 1.55) return 'top center';
    if(portraitPressure > 1.2) return 'top center';
    return 'center center';
  }
  if(kind === 'profile'){
    if(portraitPressure > 1.45) return 'top center';
    return 'center center';
  }
  return 'center center';
}

function _applyBoardBgAutoSizing(root){
  try{
    const scope = root || document;
    const _collect = (selector)=>{
      const arr = [];
      if(scope && scope.matches && scope.matches(selector)) arr.push(scope);
      if(scope && scope.querySelectorAll) arr.push(...scope.querySelectorAll(selector));
      return arr;
    };
    const els = _collect('.brd-bg-layer[data-bg-size-mode]');
    els.forEach(el=>{
      const mode = el.getAttribute('data-bg-size-mode') || 'auto';
      const cardBody = el.closest('.brd-body') || el.parentElement;
      const rect = cardBody ? cardBody.getBoundingClientRect() : null;
      if(mode !== 'auto'){
        el.style.backgroundSize = mode;
        return;
      }
      const src = el.getAttribute('data-bg-src') || '';
      const apply = (meta)=>{
        const resolved = _resolveBoardBgSizeMode(mode, rect, meta);
        el.style.backgroundSize = resolved;
        el.setAttribute('data-bg-size-resolved', resolved);
      };
      _loadBoardBgImageMeta(src, apply);
    });
    const imgs = _collect('.brd-fit-auto[data-fit-kind]');
    imgs.forEach(el=>{
      const mode = el.getAttribute('data-fit-mode') || 'auto';
      const kind = el.getAttribute('data-fit-kind') || 'profile';
      const rect = el.getBoundingClientRect ? el.getBoundingClientRect() : null;
      const apply = (meta)=>{
        const resolved = _resolveBoardAutoFit(kind, mode, rect, meta);
        el.style.objectFit = resolved;
        const pos = _resolveBoardAutoPosition(kind, resolved, rect, meta);
        el.style.objectPosition = pos;
        el.setAttribute('data-fit-resolved', resolved);
      };
      const src = el.currentSrc || el.getAttribute('src') || '';
      _loadBoardBgImageMeta(src, apply);
    });
  }catch(e){}
}

function _bindBoardBgAutoResize(){
  if(_brdBgAutoResizeBound) return;
  _brdBgAutoResizeBound = true;
  const rerun = ()=>{
    try{
      const wrap = document.getElementById('board-wrap');
      if(!wrap) return;
      requestAnimationFrame(()=>_applyBoardBgAutoSizing(wrap));
    }catch(e){}
  };
  window.addEventListener('resize', rerun);
  window.addEventListener('orientationchange', ()=>setTimeout(rerun, 80));
  document.addEventListener('visibilitychange', ()=>{
    if(document.visibilityState === 'visible') setTimeout(rerun, 60);
  });
}

function rBoard(C,T){
  T.textContent='📊 현황판';
  const univs=_getBoardUnivs();
  const _canManage=_boardCanManage();
  const visUnivs=(_canManage?univs:univs.filter(u=>!u.hidden)).filter(u=>!u.dissolved);
  if(!univs.length){C.innerHTML='<div style="padding:40px;text-align:center;color:var(--gray-l)">등록된 선수가 없습니다.</div>';return;}
  const _hexToRgba = (h,a)=>{
    try{
      const c=String(h||'#64748b').replace('#','');
      const r=parseInt(c.slice(0,2),16), g=parseInt(c.slice(2,4),16), b=parseInt(c.slice(4,6),16);
      return `rgba(${r},${g},${b},${a})`;
    }catch(e){ return `rgba(100,116,139,${a||0.2})`; }
  };
  const _contrastText = (hex)=>{
    try{
      const c=String(hex||'').replace('#','').trim();
      const r=parseInt(c.slice(0,2),16), g=parseInt(c.slice(2,4),16), b=parseInt(c.slice(4,6),16);
      const f=(v)=>{ v/=255; return v<=0.03928? v/12.92 : Math.pow((v+0.055)/1.055,2.4); };
      const L=0.2126*f(r)+0.7152*f(g)+0.0722*f(b);
      return ((1.0+0.05)/(L+0.05) >= (L+0.05)/(0.02+0.05)) ? '#ffffff' : '#0f172a';
    }catch(e){ return '#ffffff'; }
  };
  // 칩 이미지 크기에 따라 행 레이아웃도 함께 스케일 (이미지만 커지고 레이아웃은 고정되는 현상 방지)
  const _bcpScale = Math.max(0.7, Math.min(1.8, (boardChipLayoutScale||100) / 100));
  const _bcpGap = Math.round(7 * _bcpScale);
  const _bcpPadY = Math.round(5 * _bcpScale);
  const _bcpPadX = Math.round(10 * _bcpScale);
  const _bcpNameFs = Math.round(12 * _bcpScale);
  const _bcpRoleFs = Math.round(9 * _bcpScale);
  // 통계 계산
  const _brdAllVis = visUnivs.flatMap(u => _getBoardPlayers(u.name));
  const _brdTierCts = {}; _brdAllVis.forEach(p=>{ const t=p.tier||'?'; _brdTierCts[t]=(_brdTierCts[t]||0)+1; });
  const _brdAllCollapsed = visUnivs.length > 0 && visUnivs.every(u=>boardCollapsed.has(u.name));
  const _heroCol = boardSelUniv!=='전체' ? (gc(boardSelUniv)||'#2563eb') : '#2563eb';
  const _heroTc = _contrastText(_heroCol);
  const _currentUnivLabel = boardSelUniv!=='전체' ? boardSelUniv : '전체 대학';
  const _tierBadges = TIERS.filter(t=>_brdTierCts[t]).map(t=>`<span style="font-size:10px;font-weight:800;padding:3px 8px;border-radius:999px;background:${getTierBtnColor(t)||'#64748b'};color:${getTierBtnTextColor(t)||'#fff'}">${t} ${_brdTierCts[t]}</span>`).join('');
  const _brdStatsHtml = `<div class="brd-mini-stats">
    <div class="brd-mini-stat" style="--stat-accent:#6366f1"><div class="brd-mini-stat-label">표시 스트리머</div><div class="brd-mini-stat-value">${_brdAllVis.length}</div><div class="brd-mini-stat-sub">구현황판 기준 인원</div></div>
    <div class="brd-mini-stat" style="--stat-accent:#0ea5e9"><div class="brd-mini-stat-label">활성 대학</div><div class="brd-mini-stat-value">${visUnivs.length}</div><div class="brd-mini-stat-sub">숨김/해체 제외</div></div>
    <div class="brd-mini-stat" style="--stat-accent:${_heroCol}"><div class="brd-mini-stat-label">현재 보기</div><div class="brd-mini-stat-value" style="font-size:18px;color:${_heroCol}">${_currentUnivLabel}</div><div class="brd-mini-stat-sub">${boardSelUniv!=='전체'?'선택 대학 중심':'전체 흐름 보기'}</div></div>
    <div class="brd-mini-stat" style="--stat-accent:#f59e0b"><div class="brd-mini-stat-label">티어 분포</div><div class="brd-mini-stat-tier">${_tierBadges||'<span style="font-size:11px;color:var(--text3);font-weight:700">집계 없음</span>'}</div></div>
  </div>`;
  let h=`
  <style>
    .brd-shell{display:flex;flex-direction:column;gap:14px}
    .brd-hero{position:relative;overflow:hidden;display:flex;align-items:flex-start;justify-content:space-between;gap:16px;padding:20px 22px;border-radius:26px;background:linear-gradient(180deg,rgba(255,255,255,.99),rgba(248,250,252,.96));border:1px solid rgba(148,163,184,.18);box-shadow:0 18px 34px rgba(15,23,42,.06)}
    .brd-hero::after{content:'';position:absolute;right:-70px;top:-70px;width:220px;height:220px;border-radius:999px;background:${_hexToRgba(_heroCol,.16)};filter:blur(2px);pointer-events:none}
    .brd-hero-copy,.brd-hero-side{position:relative;z-index:1}
    .brd-hero-copy{display:flex;flex-direction:column;gap:7px;min-width:0}
    .brd-hero-kicker{font-size:11px;font-weight:900;letter-spacing:.08em;text-transform:uppercase;color:${_heroCol}}
    .brd-hero-title{font-size:25px;font-weight:950;letter-spacing:-.03em;color:var(--text1);line-height:1.14}
    .brd-hero-desc{font-size:13px;line-height:1.6;color:var(--text3);max-width:720px}
    .brd-hero-badges{display:flex;flex-wrap:wrap;gap:8px}
    .brd-hero-badge{display:inline-flex;align-items:center;gap:6px;padding:8px 12px;border-radius:999px;background:${_hexToRgba(_heroCol,.1)};border:1px solid ${_hexToRgba(_heroCol,.18)};font-size:12px;font-weight:800;color:${_heroCol};box-shadow:0 10px 18px rgba(15,23,42,.05)}
    .brd-hero-side{display:flex;flex-wrap:wrap;gap:10px;justify-content:flex-end}
    .brd-toolbar-card{padding:14px 16px;border-radius:24px;background:linear-gradient(180deg,rgba(255,255,255,.99),rgba(248,250,252,.96));border:1px solid rgba(148,163,184,.18);box-shadow:0 18px 34px rgba(15,23,42,.06)}
    .brd-toolbar-top{display:flex;align-items:flex-start;justify-content:space-between;gap:14px;flex-wrap:wrap}
    .brd-toolbar-controls{display:flex;flex-direction:column;gap:10px;min-width:min(100%,720px)}
    .brd-toolbar-row{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
    .brd-toolbar-note{font-size:11px;color:var(--text3);font-weight:700}
    .brd-mini-stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:10px;min-width:min(100%,520px)}
    .brd-mini-stat{padding:14px 16px;border-radius:16px;border:1px solid rgba(148,163,184,.16);background:linear-gradient(180deg,rgba(255,255,255,.99),rgba(248,250,252,.94));box-shadow:0 6px 16px rgba(15,23,42,.05);position:relative;overflow:hidden}
    .brd-mini-stat::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:var(--stat-accent,#2563eb);border-radius:16px 16px 0 0;opacity:.7}
    .brd-mini-stat-label{font-size:10px;font-weight:900;color:var(--text3);letter-spacing:.06em;text-transform:uppercase}
    .brd-mini-stat-value{margin-top:5px;font-size:24px;font-weight:950;letter-spacing:-.03em;color:var(--text1)}
    .brd-mini-stat-sub{margin-top:3px;font-size:11px;font-weight:700;color:var(--text3)}
    .brd-mini-stat-tier{margin-top:8px;display:flex;flex-wrap:wrap;gap:5px}
    .brd-card{background:var(--brd-col,#dbeafe);border-radius:18px;overflow:hidden;box-shadow:0 4px 18px var(--brd-shd,rgba(37,99,235,.15)),0 1px 6px rgba(0,0,0,.07);position:relative;transition:transform .18s,box-shadow .18s;align-self:start;border:1px solid rgba(0,0,0,.06);}
    .brd-card:hover{transform:translateY(-2px);box-shadow:0 10px 32px var(--brd-shd,rgba(37,99,235,.22)),0 3px 10px rgba(0,0,0,.1);}
    .brd-card.drag-over{outline:3px solid rgba(0,0,0,.2);opacity:.85;}
    .brd-card.dragging{opacity:.45;transform:scale(.97);}
    .brd-hdr{padding:16px 18px 13px;position:relative;z-index:1;cursor:grab;}
    .brd-hdr:active{cursor:grabbing;}
    .brd-hdr::before{content:'';position:absolute;inset:0;background:linear-gradient(145deg,rgba(255,255,255,.18) 0%,rgba(255,255,255,0) 55%);pointer-events:none;z-index:0;}
    .brd-circle{position:absolute;border-radius:50%;background:rgba(255,255,255,.15);pointer-events:none;}
    .brd-row{display:flex;align-items:center;gap:${_bcpGap}px;padding:${_bcpPadY}px ${_bcpPadX}px;border-radius:9px;background:rgba(255,255,255,.82);border:1px solid rgba(255,255,255,.7);transition:background .12s,box-shadow .12s;}
    .brd-row:hover{box-shadow:0 2px 8px rgba(0,0,0,.1);}
    .brd-row-btn{cursor:pointer;flex:1;display:flex;align-items:center;gap:7px;background:none;border:none;padding:0;font-family:'Noto Sans KR',sans-serif;min-width:0;}
    .brd-photo{width:${boardChipPhotoSize}px;height:${boardChipPhotoSize}px;border-radius:var(--su_profile_radius,50%);clip-path:var(--su_profile_clip,none);object-fit:cover;flex-shrink:0;background:rgba(0,0,0,.08);border:1.5px solid rgba(255,255,255,.7);}
    .brd-photo-placeholder{width:${boardChipPhotoSize}px;height:${boardChipPhotoSize}px;border-radius:var(--su_profile_radius,50%);clip-path:var(--su_profile_clip,none);flex-shrink:0;background:rgba(255,255,255,.4);border:1.5px solid rgba(255,255,255,.5);display:flex;align-items:center;justify-content:center;font-size:${Math.round(12*_bcpScale)}px;color:rgba(0,0,0,.35);}
    .brd-race{font-size:9px;font-weight:800;padding:2px 6px;border-radius:5px;flex-shrink:0;letter-spacing:.3px;}
    .brd-name{font-weight:700;font-size:${_bcpNameFs}px;color:#1e293b;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;flex:1;min-width:0;text-align:left;}
    .brd-role-main{font-size:${_bcpRoleFs}px;padding:1px 5px;border-radius:4px;font-weight:700;white-space:nowrap;flex-shrink:0;border:1px solid;}
    .brd-role-sub{font-size:${_bcpRoleFs}px;padding:1px 5px;border-radius:4px;font-weight:600;white-space:nowrap;flex-shrink:0;background:rgba(100,116,139,.1);color:#475569;border:1px solid rgba(100,116,139,.2);}
    .brd-move-btn{display:flex;flex-direction:column;gap:1px;flex-shrink:0;opacity:.55;}
    .brd-move-btn button{background:none;border:none;cursor:pointer;font-size:9px;padding:0 2px;line-height:1;color:#1e293b;transition:opacity .12s;}
    .brd-move-btn button:hover{opacity:.5;}
    .brd-move-btn button:disabled{opacity:.18;cursor:default;}
    .brd-sep{height:1px;background:rgba(0,0,0,.1);margin:0 18px;}
    .brd-body{padding:10px 10px 14px;display:flex;flex-direction:column;gap:4px;overflow:hidden;}
    .brd-row-drag{cursor:grab;}.brd-row-drag:active{cursor:grabbing;}
    .brd-tier-lbl{font-size:9px;font-weight:700;color:rgba(0,0,0,.45);letter-spacing:.8px;text-transform:uppercase;padding:0 2px;margin:6px 0 2px;}
    .brd-tier-lbl:first-child{margin-top:0;}
    .brd-univ-name-btn{font-weight:900;font-size:18px;color:#fff;letter-spacing:.2px;line-height:1.15;text-shadow:0 1px 4px rgba(0,0,0,.2);cursor:pointer;border:none;background:none;padding:0;font-family:'Noto Sans KR',sans-serif;text-align:left;transition:opacity .15s;}
    .brd-univ-name-btn:hover{text-decoration:underline;text-underline-offset:3px;opacity:.8;}
    .brd-drag-hint{font-size:10px;color:rgba(255,255,255,.5);margin-left:auto;padding:2px 6px;border-radius:4px;background:rgba(255,255,255,.1);cursor:grab;flex-shrink:0;user-select:none;}
    .brd-side-panel{float:right;width:230px;margin:0 0 6px 10px;}
    .brd-bottom-img{max-width:200px;max-height:160px;object-fit:contain;}
    @media(max-width:640px){.brd-side-panel{display:none!important;}.brd-bottom-section-img{display:none!important;}}
    /* 이동 팝업 */
    .brd-move-popup{position:fixed;z-index:5000;background:#fff;border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,.22);padding:10px;min-width:220px;max-width:260px;max-height:90vh;overflow-y:auto;border:1px solid var(--border);}
    .brd-move-popup-title{font-size:11px;font-weight:700;color:var(--text3);padding:4px 6px 8px;border-bottom:1px solid var(--border);margin-bottom:6px;}
    .brd-move-popup-btn{display:flex;align-items:center;gap:8px;width:100%;padding:7px 10px;border:none;background:none;border-radius:7px;cursor:pointer;font-family:'Noto Sans KR',sans-serif;font-size:12px;font-weight:600;color:var(--text);transition:background .1s;text-align:left;}
    .brd-move-popup-btn:hover{background:var(--blue-l);color:var(--blue);}
    .brd-move-popup-btn:disabled{opacity:.35;cursor:default;background:none;}
    .brd-move-popup-sep{height:1px;background:var(--border);margin:4px 0;}
    .brd-toolbar{position:sticky;top:0;z-index:100;background:transparent!important;padding-bottom:6px;}
    body.dark .brd-hero,body.dark .brd-toolbar-card{background:linear-gradient(180deg,rgba(15,23,42,.94),rgba(15,23,42,.9));border-color:#334155;box-shadow:0 20px 38px rgba(0,0,0,.28)}
    body.dark .brd-hero-title{color:#f8fafc}
    body.dark .brd-hero-desc,body.dark .brd-toolbar-note{color:#94a3b8}
    body.dark .brd-hero-badge{background:${_hexToRgba(_heroCol,.2)};border-color:${_hexToRgba(_heroCol,.28)};color:${_heroTc}}
    body.dark .brd-mini-stat{background:linear-gradient(180deg,rgba(15,23,42,.92),rgba(30,41,59,.88));border-color:#334155}
    body.dark .brd-mini-stat-value{color:#e2e8f0}
    body.dark .brd-mini-stat-label,body.dark .brd-mini-stat-sub{color:#94a3b8}
    @media(max-width:900px){.brd-hero{flex-direction:column;padding:18px;border-radius:22px}.brd-hero-side{justify-content:flex-start}.brd-toolbar-top{flex-direction:column}.brd-toolbar-controls,.brd-mini-stats{min-width:100%}}
    @media(max-width:768px){#board-wrap{grid-template-columns:1fr!important;}}
    @media(max-width:640px){
      /* 모바일: 상단 배지(brd-hero-badges)에 이미 같은 정보가 요약돼 있으므로 중복되는 미니 통계 카드는 숨김 */
      .brd-mini-stats{display:none!important}
    }
  </style>
  <div class="brd-shell">
  <section class="brd-hero no-export">
    <div class="brd-hero-copy">
      <div class="brd-hero-kicker">Classic Board</div>
      <div class="brd-hero-title">📊 구현황판</div>
      <div class="brd-hero-desc">${boardSelUniv!=='전체' ? `${boardSelUniv} 중심으로 기존 현황판 레이아웃을 더 깔끔한 카드형 UI로 정리했습니다.` : '기존 현황판 흐름은 유지하면서 상단 탐색과 통계 영역을 더 보기 좋고 직관적으로 다듬었습니다.'}</div>
      <div class="brd-hero-badges">
        <span class="brd-hero-badge">현재 보기 · ${_currentUnivLabel}</span>
        <span class="brd-hero-badge">표시 스트리머 ${_brdAllVis.length}명</span>
        <span class="brd-hero-badge">대학 ${visUnivs.length}곳</span>
        <span class="brd-hero-badge">${boardCardView?'포토카드':'기본 카드'} · ${boardGridCols===2?'2열':'1열'}</span>
      </div>
    </div>
    <div class="brd-hero-side">
      <span class="brd-hero-badge" style="background:linear-gradient(135deg,${_heroCol},${_hexToRgba(_heroCol,.82)});border-color:${_heroCol};color:${_heroTc};box-shadow:0 16px 28px ${_hexToRgba(_heroCol,.22)}">${_currentUnivLabel}</span>
    </div>
  </section>
  <div class="brd-toolbar-card no-export">
  <div class="fbar" style="overflow-x:auto;flex-wrap:nowrap;-webkit-overflow-scrolling:touch;scrollbar-width:none;gap:4px;margin-bottom:10px">
    <button class="pill ${boardGridCols===2?'on':''}" style="flex-shrink:0;white-space:nowrap" onclick="boardGridCols=boardGridCols===2?1:2;render()" title="1열/2열 보기 전환">${boardGridCols===2?'▦ 1열':'⊞ 2열'}</button>
    <button class="pill ${boardCardView?'on':''}" style="flex-shrink:0;white-space:nowrap" onclick="boardCardView=!boardCardView;if(boardCardView)boardCardShape=boardCardShape==='circle'?'square':'circle';render()" title="포토카드 뷰 전환">▦ 포토카드</button>
    <button class="pill ${boardCompactMode?'on':''}" style="flex-shrink:0;white-space:nowrap" onclick="boardCompactMode=!boardCompactMode;render()" title="소형/대형 칩 전환">${boardCompactMode?'⬛ 크게보기':'🔲 소형으로'}</button>
    <button class="pill ${_brdAllCollapsed?'on':''}" style="flex-shrink:0;white-space:nowrap" onclick="${_brdAllCollapsed?'_brdExpandAll()':'_brdCollapseAll()'}" title="${_brdAllCollapsed?'모두 펼치기':'모두 접기'}">${_brdAllCollapsed?'⊕ 펼치기':'⊖ 접기'}</button>
  </div>
  <div class="brd-toolbar brd-toolbar-top">
    <div class="brd-toolbar-controls">
      <div class="brd-toolbar-row">
      <div style="position:relative">
        <select id="board-univ-sel" onchange="boardSelUniv=this.value;_updateBoardSaveLabel();render();if(boardSelUniv!=='전체'){setTimeout(()=>{const c=document.querySelector(\`.brd-card[data-univ='\${boardSelUniv}']\`);if(c)c.scrollIntoView({behavior:'smooth',block:'center'});},120);}" style="appearance:none;-webkit-appearance:none;padding:6px 28px 6px 12px;border-radius:9px;border:1.5px solid var(--border2);font-size:12px;font-weight:700;color:var(--text);background:var(--surface);cursor:pointer;outline:none;min-width:120px;">
          <option value="전체">🏫 전체 보기</option>
          ${visUnivs.map(u=>`<option value="${u.name}"${boardSelUniv===u.name?' selected':''}>${u.name}${_canManage&&u.hidden?' (숨김)':''}</option>`).join('')}
        </select>
        <svg style="position:absolute;right:8px;top:50%;transform:translateY(-50%);pointer-events:none;color:var(--gray-l)" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m6 9 6 6 6-6"/></svg>
      </div>
      <button class="pill" onclick="boardSelUniv&&boardSelUniv!=='전체'?downloadBoardSel():downloadBoardAll()" id="brd-save-btn">
        📷 <span id="brd-save-btn-label">${boardSelUniv&&boardSelUniv!=='전체'?boardSelUniv+' 이미지저장':'이미지저장'}</span>
      </button>
      <div style="display:flex;align-items:center;gap:5px;padding:4px 10px;border-radius:9px;border:1.5px solid var(--border2);background:var(--surface)">
        <span style="font-size:10px;color:var(--gray-l);font-weight:700;white-space:nowrap">배경</span>
        <button onclick="b2BgAlpha=Math.max(0,b2BgAlpha-5);localStorage.setItem('su_b2ba',b2BgAlpha);render();if(typeof save==='function')save()" style="padding:1px 6px;border-radius:5px;border:1px solid var(--border2);background:var(--white);font-size:11px;cursor:pointer;line-height:1.4" title="배경 더 연하게">−</button>
        <input type="range" min="0" max="100" value="${b2BgAlpha}" id="brd-bg-range" style="width:55px;height:4px;cursor:pointer" title="배경 진하기 (${b2BgAlpha})" oninput="b2BgAlpha=+this.value;localStorage.setItem('su_b2ba',b2BgAlpha);render();if(typeof save==='function')save()">
        <button onclick="b2BgAlpha=Math.min(100,b2BgAlpha+5);localStorage.setItem('su_b2ba',b2BgAlpha);render();if(typeof save==='function')save()" style="padding:1px 6px;border-radius:5px;border:1px solid var(--border2);background:var(--white);font-size:11px;cursor:pointer;line-height:1.4" title="배경 더 진하게">+</button>
        <span style="font-size:10px;color:var(--gray-l);font-weight:700;white-space:nowrap;margin-left:4px">라벨</span>
        <button onclick="b2LabelAlpha=Math.max(0,b2LabelAlpha-5);localStorage.setItem('su_b2la',b2LabelAlpha);render();if(typeof save==='function')save()" style="padding:1px 6px;border-radius:5px;border:1px solid var(--border2);background:var(--white);font-size:11px;cursor:pointer;line-height:1.4" title="라벨 더 연하게">−</button>
        <input type="range" min="0" max="100" value="${b2LabelAlpha}" id="brd-label-range" style="width:55px;height:4px;cursor:pointer" title="라벨 진하기 (${b2LabelAlpha})" oninput="b2LabelAlpha=+this.value;localStorage.setItem('su_b2la',b2LabelAlpha);render();if(typeof save==='function')save()">
        <button onclick="b2LabelAlpha=Math.min(100,b2LabelAlpha+5);localStorage.setItem('su_b2la',b2LabelAlpha);render();if(typeof save==='function')save()" style="padding:1px 6px;border-radius:5px;border:1px solid var(--border2);background:var(--white);font-size:11px;cursor:pointer;line-height:1.4" title="라벨 더 진하게">+</button>
      </div>
      </div>
      <div class="brd-toolbar-note">${_canManage?`🖱️ 헤더 드래그·◀▶ = 대학순서 | 스트리머 드래그/클릭 = 순서·대학이동 <button onclick="openCfgHome()" style="margin-left:6px;background:var(--surface);border:1px solid var(--border2);border-radius:8px;padding:4px 10px;font-size:11px;cursor:pointer;color:var(--text2);font-weight:700">⚙️ 대학 색상·숨기기</button>`:'👆 스트리머 클릭 → 스트리머 상세'}</div>
    </div>
    ${_brdStatsHtml}
  </div>
  </div>
  <div id="board-wrap" style="display:grid;grid-template-columns:${boardGridCols===2?'repeat(2,1fr)':'1fr'};gap:14px;align-items:start">`;
  const targets=boardSelUniv==='전체'?visUnivs:visUnivs.filter(u=>u.name===boardSelUniv);
  targets.forEach(u=>{ h+=buildUnivBoardCard(u); });
  h+=`</div>
</div>
`;
  C.innerHTML=h;
  injectUnivIcons(C);
  requestAnimationFrame(()=>{
    injectUnivIcons(C);
    initBoardDrag();
    _bindBoardBgAutoResize();
    _applyBoardBgAutoSizing(C);
  });
  // 팝업 닫기 이벤트 (한 번만 등록)
  if(!_brdPopupListenerAdded){
    document.addEventListener('click', _closeBrdPopup, {capture:true});
    _brdPopupListenerAdded = true;
  }
}
