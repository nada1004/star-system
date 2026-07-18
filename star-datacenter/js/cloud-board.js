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
        + ' <button onclick="this.parentElement.textContent=\'\'" style="margin-left:6px;background:none;border:1px solid #dc2626;border-radius:4px;color:#dc2626;font-size:var(--fs-caption);cursor:pointer;padding:1px 6px">닫기</button>';
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
let boardPlayerOrder = J('su_bpo') || {};

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
    <div class="brd-mini-stat"><div class="brd-mini-stat-label">표시 스트리머</div><div class="brd-mini-stat-value">${_brdAllVis.length}</div><div class="brd-mini-stat-sub">구현황판 기준 인원</div></div>
    <div class="brd-mini-stat"><div class="brd-mini-stat-label">활성 대학</div><div class="brd-mini-stat-value">${visUnivs.length}</div><div class="brd-mini-stat-sub">숨김/해체 제외</div></div>
    <div class="brd-mini-stat"><div class="brd-mini-stat-label">현재 보기</div><div class="brd-mini-stat-value" style="font-size:var(--fs-lg)">${_currentUnivLabel}</div><div class="brd-mini-stat-sub">${boardSelUniv!=='전체'?'선택 대학 중심':'전체 흐름 보기'}</div></div>
    <div class="brd-mini-stat"><div class="brd-mini-stat-label">티어 분포</div><div class="brd-mini-stat-tier">${_tierBadges||'<span style="font-size:var(--fs-caption);color:var(--text3);font-weight:700">집계 없음</span>'}</div></div>
  </div>`;
  let h=`
  <style>
    .brd-shell{display:flex;flex-direction:column;gap:14px}
    .brd-hero{position:relative;overflow:hidden;display:flex;align-items:flex-start;justify-content:space-between;gap:16px;padding:20px 22px;border-radius:26px;background:linear-gradient(180deg,rgba(255,255,255,.99),rgba(248,250,252,.96));border:1px solid rgba(148,163,184,.18);box-shadow:0 18px 34px rgba(15,23,42,.06)}
    .brd-hero::after{content:'';position:absolute;right:-70px;top:-70px;width:220px;height:220px;border-radius:999px;background:${_hexToRgba(_heroCol,.16)};filter:blur(2px);pointer-events:none}
    .brd-hero-copy,.brd-hero-side{position:relative;z-index:1}
    .brd-hero-copy{display:flex;flex-direction:column;gap:7px;min-width:0}
    .brd-hero-kicker{font-size:var(--fs-caption);font-weight:900;letter-spacing:.08em;text-transform:uppercase;color:${_heroCol}}
    .brd-hero-title{font-size:25px;font-weight:950;letter-spacing:-.03em;color:var(--text1);line-height:1.14}
    .brd-hero-desc{font-size:var(--fs-base);line-height:1.6;color:var(--text3);max-width:720px}
    .brd-hero-badges{display:flex;flex-wrap:wrap;gap:8px}
    .brd-hero-badge{display:inline-flex;align-items:center;gap:6px;padding:8px 12px;border-radius:999px;background:${_hexToRgba(_heroCol,.1)};border:1px solid ${_hexToRgba(_heroCol,.18)};font-size:var(--fs-sm);font-weight:800;color:${_heroCol};box-shadow:0 10px 18px rgba(15,23,42,.05)}
    .brd-hero-side{display:flex;flex-wrap:wrap;gap:10px;justify-content:flex-end}
    .brd-toolbar-card{padding:14px 16px;border-radius:24px;background:linear-gradient(180deg,rgba(255,255,255,.99),rgba(248,250,252,.96));border:1px solid rgba(148,163,184,.18);box-shadow:0 18px 34px rgba(15,23,42,.06)}
    .brd-toolbar-top{display:flex;align-items:flex-start;justify-content:space-between;gap:14px;flex-wrap:wrap}
    .brd-toolbar-controls{display:flex;flex-direction:column;gap:10px;min-width:min(100%,720px)}
    .brd-toolbar-row{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
    .brd-toolbar-note{font-size:var(--fs-caption);color:var(--text3);font-weight:700}
    .brd-mini-stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:10px;min-width:min(100%,520px)}
    .brd-mini-stat{padding:12px 13px;border-radius:18px;border:1px solid rgba(148,163,184,.14);background:linear-gradient(180deg,rgba(255,255,255,.98),rgba(248,250,252,.94))}
    .brd-mini-stat-label{font-size:var(--fs-caption);font-weight:800;color:var(--text3)}
    .brd-mini-stat-value{margin-top:6px;font-size:22px;font-weight:950;letter-spacing:-.03em;color:var(--text1)}
    .brd-mini-stat-sub{margin-top:4px;font-size:var(--fs-caption);font-weight:700;color:var(--text3)}
    .brd-mini-stat-tier{margin-top:8px;display:flex;flex-wrap:wrap;gap:6px}
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
    .brd-univ-name-btn{font-weight:900;font-size:var(--fs-lg);color:#fff;letter-spacing:.2px;line-height:1.15;text-shadow:0 1px 4px rgba(0,0,0,.2);cursor:pointer;border:none;background:none;padding:0;font-family:'Noto Sans KR',sans-serif;text-align:left;transition:opacity .15s;}
    .brd-univ-name-btn:hover{text-decoration:underline;text-underline-offset:3px;opacity:.8;}
    .brd-drag-hint{font-size:10px;color:rgba(255,255,255,.5);margin-left:auto;padding:2px 6px;border-radius:4px;background:rgba(255,255,255,.1);cursor:grab;flex-shrink:0;user-select:none;}
    .brd-side-panel{float:right;width:230px;margin:0 0 6px 10px;}
    .brd-bottom-img{max-width:200px;max-height:160px;object-fit:contain;}
    @media(max-width:640px){.brd-side-panel{display:none!important;}.brd-bottom-section-img{display:none!important;}}
    /* 이동 팝업 */
    .brd-move-popup{position:fixed;z-index:5000;background:#fff;border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,.22);padding:10px;min-width:220px;max-width:260px;max-height:90vh;overflow-y:auto;border:1px solid var(--border);}
    .brd-move-popup-title{font-size:var(--fs-caption);font-weight:700;color:var(--text3);padding:4px 6px 8px;border-bottom:1px solid var(--border);margin-bottom:6px;}
    .brd-move-popup-btn{display:flex;align-items:center;gap:8px;width:100%;padding:7px 10px;border:none;background:none;border-radius:7px;cursor:pointer;font-family:'Noto Sans KR',sans-serif;font-size:var(--fs-sm);font-weight:600;color:var(--text);transition:background .1s;text-align:left;}
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
        <select id="board-univ-sel" onchange="boardSelUniv=this.value;_updateBoardSaveLabel();render();if(boardSelUniv!=='전체'){setTimeout(()=>{const c=document.querySelector(\`.brd-card[data-univ='\${boardSelUniv}']\`);if(c)c.scrollIntoView({behavior:'smooth',block:'center'});},120);}" style="appearance:none;-webkit-appearance:none;padding:6px 28px 6px 12px;border-radius:9px;border:1.5px solid var(--border2);font-size:var(--fs-sm);font-weight:700;color:var(--text);background:var(--surface);cursor:pointer;outline:none;min-width:120px;">
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
        <button onclick="b2BgAlpha=Math.max(0,b2BgAlpha-5);localStorage.setItem('su_b2ba',b2BgAlpha);render();if(typeof save==='function')save()" style="padding:1px 6px;border-radius:5px;border:1px solid var(--border2);background:var(--white);font-size:var(--fs-caption);cursor:pointer;line-height:1.4" title="배경 더 연하게">−</button>
        <input type="range" min="0" max="100" value="${b2BgAlpha}" id="brd-bg-range" style="width:55px;height:4px;cursor:pointer" title="배경 진하기 (${b2BgAlpha})" oninput="b2BgAlpha=+this.value;localStorage.setItem('su_b2ba',b2BgAlpha);render();if(typeof save==='function')save()">
        <button onclick="b2BgAlpha=Math.min(100,b2BgAlpha+5);localStorage.setItem('su_b2ba',b2BgAlpha);render();if(typeof save==='function')save()" style="padding:1px 6px;border-radius:5px;border:1px solid var(--border2);background:var(--white);font-size:var(--fs-caption);cursor:pointer;line-height:1.4" title="배경 더 진하게">+</button>
        <span style="font-size:10px;color:var(--gray-l);font-weight:700;white-space:nowrap;margin-left:4px">라벨</span>
        <button onclick="b2LabelAlpha=Math.max(0,b2LabelAlpha-5);localStorage.setItem('su_b2la',b2LabelAlpha);render();if(typeof save==='function')save()" style="padding:1px 6px;border-radius:5px;border:1px solid var(--border2);background:var(--white);font-size:var(--fs-caption);cursor:pointer;line-height:1.4" title="라벨 더 연하게">−</button>
        <input type="range" min="0" max="100" value="${b2LabelAlpha}" id="brd-label-range" style="width:55px;height:4px;cursor:pointer" title="라벨 진하기 (${b2LabelAlpha})" oninput="b2LabelAlpha=+this.value;localStorage.setItem('su_b2la',b2LabelAlpha);render();if(typeof save==='function')save()">
        <button onclick="b2LabelAlpha=Math.min(100,b2LabelAlpha+5);localStorage.setItem('su_b2la',b2LabelAlpha);render();if(typeof save==='function')save()" style="padding:1px 6px;border-radius:5px;border:1px solid var(--border2);background:var(--white);font-size:var(--fs-caption);cursor:pointer;line-height:1.4" title="라벨 더 진하게">+</button>
      </div>
      </div>
      <div class="brd-toolbar-note">${_canManage?`🖱️ 헤더 드래그·◀▶ = 대학순서 | 스트리머 드래그/클릭 = 순서·대학이동 <button onclick="openCfgHome()" style="margin-left:6px;background:var(--surface);border:1px solid var(--border2);border-radius:8px;padding:4px 10px;font-size:var(--fs-caption);cursor:pointer;color:var(--text2);font-weight:700">⚙️ 대학 색상·숨기기</button>`:'👆 스트리머 클릭 → 스트리머 상세'}</div>
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

function buildUnivBoardCard(u, forExport){
  if(!u)return'';
  const uNameJs = (typeof escJS==='function')
    ? escJS(u.name)
    : String(u.name||'').replace(/\\/g,'\\\\').replace(/'/g,"\\'").replace(/\r/g,'\\r').replace(/\n/g,'\\n');
  const col=gc(u.name);
  const iconUrl=UNIV_ICONS[u.name]||(univCfg.find(x=>x.name===u.name)||{}).icon||'';
  const sorted=_getBoardPlayers(u.name);
  if(!sorted.length&&!forExport){
    // 선수 없는 대학도 빈 카드로 표시
    return `<div class="brd-card" data-univ="${escAttr(u.name)}" style="border:2px dashed ${col}66;border-radius:14px;padding:20px 18px;background:${col}08;display:flex;align-items:center;gap:10px;opacity:.75">
      ${iconUrl?`<img src="${toHttpsUrl(iconUrl)}" style="width:var(--su_univ_logo_size,32px);height:var(--su_univ_logo_size,32px);object-fit:contain;border-radius:var(--su_univ_logo_radius,10px)" onerror="this.style.display='none'">`:''}
      <span style="font-weight:900;font-size:var(--fs-md);color:${col}">${u.name}</span>
      <span style="font-size:var(--fs-caption);color:var(--gray-l)">등록된 스트리머 없음</span>
    </div>`;
  }
  const cnt=sorted.length;
  const allUnivs=getAllUnivs();

  const RACE_CFG={T:{bg:'#dbeafe',col:'#1e40af',txt:'테'},Z:{bg:'#ede9fe',col:'#5b21b6',txt:'저'},P:{bg:'#fef3c7',col:'#92400e',txt:'프'},N:{bg:'#f1f5f9',col:'#475569',txt:'?'}};
  const hexToRgba=(h,a)=>{const r=parseInt(h.slice(1,3),16),g=parseInt(h.slice(3,5),16),b=parseInt(h.slice(5,7),16);return`rgba(${r},${g},${b},${a})`;};
  // 파스텔 변환: 원색을 흰색과 mix=60% 블렌딩
  const toPastel=(hex,mix=0.72)=>{
    const r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);
    const pr=Math.round(r*(1-mix)+255*mix),pg=Math.round(g*(1-mix)+255*mix),pb=Math.round(b*(1-mix)+255*mix);
    return '#'+[pr,pg,pb].map(v=>v.toString(16).padStart(2,'0')).join('');
  };
  const pastelCol=forExport?col:toPastel(col, Math.max(0.35, 0.95 - b2BgAlpha * 0.01));
  const headerCol = col; // 헤더는 대학 상징색 그대로 사용
  const shd=hexToRgba(col,.18);

  // 티어별 칩 레이아웃 빌더 (무소속 + forExport 시 모든 대학에 적용)
  const buildChipLayout=(isWide)=>{
    // 직급자와 일반 선수 분리
    const rolePlayers = sorted.filter(p=>p.role&&MAIN_ROLES.includes(p.role));
    const normalPlayers = sorted.filter(p=>!p.role||!MAIN_ROLES.includes(p.role));

    const tierMap={};
    normalPlayers.forEach(p=>{
      const t=p.tier||'기타';
      if(!tierMap[t])tierMap[t]=[];
      tierMap[t].push(p);
    });
    const tierOrder=TIERS.filter(t=>tierMap[t]);
    if(tierMap['기타']&&!TIERS.includes('기타'))tierOrder.push('기타');

    const buildPlayerChip=(p, chipIdx)=>{
      const pNameJs = (typeof escJS==='function')
        ? escJS(p && p.name)
        : String(p && p.name || '').replace(/\\/g,'\\\\').replace(/'/g,"\\'").replace(/\r/g,'\\r').replace(/\n/g,'\\n');
      const pNameHtml = (typeof window.escHTML==='function') ? window.escHTML(p && p.name) : String(p && p.name || '');
      const pRoleHtml = (typeof window.escHTML==='function') ? window.escHTML(p && p.role) : String(p && p.role || '');
      const rc=RACE_CFG[p.race]||{bg:'#f1f5f9',col:'#475569',txt:p.race||'?'};
      const isMain=p.role&&MAIN_ROLES.includes(p.role);
      const rCol=ROLE_COLORS[p.role]||'';
      const rIcon=ROLE_ICONS[p.role]||'';
      const photoSrcChip = _getBrdPhoto(p);
      // ── 포토카드 뷰 (화면 + 이미지저장 공통) ──
      if (boardCardView) {
        const rcBg = rc.col || col;
        const cardTierCol = p.tier ? (getTierBtnColor(p.tier) || '#64748b') : null;
        const cardTierText = p.tier ? (getTierBtnTextColor(p.tier) || '#fff') : '#fff';
        const rTxtCard = rc.txt||p.race||'?';
        const imgBorderRadius = boardCardShape === 'square' ? '8px' : '10px';
        const imgInner = photoSrcChip
          ? `<img src="${toHttpsUrl(photoSrcChip)}" class="brd-fit-auto" data-fit-kind="card" data-fit-mode="auto" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:top center;border-radius:${imgBorderRadius}" onload="_applyBoardBgAutoSizing(this)" ${forExport?'':' onerror="this.style.display=\'none\'"'}>`
          + (forExport?'':`<div style="position:absolute;inset:0;background:linear-gradient(135deg,${col},${col}aa);display:none;align-items:center;justify-content:center;font-size:30px;font-weight:900;color:#fff;border-radius:${imgBorderRadius}">${rTxtCard}</div>`)
          : `<div style="position:absolute;inset:0;background:linear-gradient(135deg,${col},${col}aa);display:flex;align-items:center;justify-content:center;font-size:30px;font-weight:900;color:#fff;border-radius:${imgBorderRadius}">${rTxtCard}</div>`;
        // 종족/티어 배지 (좌상단)
        const topBadges = `<div style="position:absolute;top:6px;left:6px;display:flex;gap:3px;flex-wrap:wrap">`
          + `<span style="font-size:9px;font-weight:900;background:${rc.col||'#64748b'};color:#fff;border-radius:4px;padding:1px 5px;line-height:1.5;text-shadow:0 1px 2px rgba(0,0,0,.4)">${rTxtCard}</span>`
          + (p.tier?`<span style="font-size:9px;font-weight:800;background:${cardTierCol};color:${cardTierText};border-radius:4px;padding:1px 5px;line-height:1.5;text-shadow:0 1px 2px rgba(0,0,0,.3)">${p.tier}</span>`:'')
          + `</div>`;
        const overlay = `<div style="position:absolute;bottom:0;left:0;right:0;background:linear-gradient(transparent,rgba(0,0,0,.82));border-radius:0 0 10px 10px;padding:22px 6px 7px;text-align:center">`
          + (p.role?`<div style="font-size:9px;font-weight:700;color:#ffffffbb;margin-bottom:1px">${pRoleHtml}</div>`:'')
          + `<div style="font-weight:800;font-size:var(--fs-caption);color:#fff;word-break:break-all;text-shadow:0 1px 3px #000a">${pNameHtml}</div>`
          + (p.channelUrl
            ? (forExport
                ? `<div style="margin-top:4px;font-size:9px;font-weight:700;color:${col};background:rgba(255,255,255,.9);border-radius:4px;padding:1px 6px;display:inline-block">▶ 방송</div>`
                : `<a href="${p.channelUrl}" target="_blank" onclick="event.stopPropagation()" style="margin-top:4px;display:inline-block;font-size:9px;font-weight:700;color:${col};background:rgba(255,255,255,.9);border-radius:4px;padding:1px 6px;text-decoration:none">▶ 방송</a>`)
            : '')
          + `</div>`;
        const cardInner = `<div style="position:relative;width:100%;${forExport?'height:110px;padding-top:0':'aspect-ratio:3/4'};overflow:hidden;border-radius:var(--r)">${imgInner}${topBadges}${overlay}</div>`;
        if (forExport) {
          return `<div style="border-radius:var(--r);overflow:hidden;border:2px solid ${hexToRgba(col,.5)}">${cardInner}</div>`;
        }
        const totalInUnivCard=sorted.length;
        const clickFnCard=_boardCanManage()
          ? `openBrdPlayerPopupFromChip(event,'${pNameJs}','${uNameJs}',${chipIdx??0},${totalInUnivCard})`
          : `openRandomPlayerModal()`;
        return `<div class="brd-chip" data-player="${escAttr(p.name)}" data-univ="${escAttr(u.name)}" data-idx="${chipIdx??0}"${_boardCanManage()?' draggable="true"':''}`
          + ` style="border-radius:var(--r);overflow:hidden;border:2px solid ${hexToRgba(col,.5)};cursor:pointer;transition:box-shadow .15s,transform .15s"`
          + ` onmouseover="this.style.boxShadow='0 6px 20px ${hexToRgba(col,.5)}';this.style.transform='translateY(-3px)'"`
          + ` onmouseout="this.style.boxShadow='';this.style.transform=''"`
          + ` onclick="event.stopPropagation();${clickFnCard}"`
          + ` ondragstart="if(_boardCanManage()){event.stopPropagation();event.dataTransfer.setData('text/chip',this.dataset.player);}">`
          + cardInner + `</div>`;
      }

      if(forExport){
        // 이미지 저장 (목록형): 화면 칩과 동일한 스타일로 렌더링
        const cBgE=hexToRgba(col,.16);
        const cBdE=hexToRgba(col,.45);
        const rTxt=rc.txt||p.race||'?';
        const chipTierCol2 = p.tier ? (getTierBtnColor(p.tier) || col) : '#9ca3af';
        const chipTierText2 = p.tier ? (getTierBtnTextColor(p.tier) || '#fff') : '#fff';
        // 전역 프로필 이미지 모양 설정(원/네모) 반영
        const imgRadius = 'var(--su_profile_radius,50%)';
        return `<span style="display:inline-flex;align-items:center;gap:12px;background:${cBgE};border-radius:var(--r2);padding:10px 18px 10px 10px;margin:5px;box-shadow:0 2px 10px rgba(0,0,0,.13);border:2px solid ${cBdE}">
          ${photoSrcChip
            ?`<img src="${toHttpsUrl(photoSrcChip)}" class="brd-fit-auto" data-fit-kind="profile" data-fit-mode="auto" style="width:64px;height:64px;border-radius:${imgRadius};object-fit:cover;flex-shrink:0;border:3px solid ${col};box-shadow:0 2px 10px ${hexToRgba(col,.4)}" onload="_applyBoardBgAutoSizing(this)">`
            :`<span style="width:64px;height:64px;border-radius:${imgRadius};background:${col};color:#fff;display:inline-flex;align-items:center;justify-content:center;font-size:26px;font-weight:900;flex-shrink:0;border:3px solid ${hexToRgba(col,.7)}">${rTxt}</span>`}
          <span style="display:inline-flex;flex-direction:column;gap:3px;min-width:0">
            ${isMain?`<span style="font-size:var(--fs-caption);font-weight:900;color:#fff;background:${col};border-radius:5px;padding:2px 8px;display:inline-block">${rIcon}${p.role}</span>`:''}
            <span style="font-weight:900;color:#111;font-size:16px;line-height:1.3;white-space:nowrap">${p.name}</span>
            <span style="display:inline-flex;align-items:center;gap:5px;line-height:1.2">
              <span style="font-size:var(--fs-sm);font-weight:900;background:${rc.col};color:#fff;border-radius:6px;padding:2px 8px">${rTxt}</span>
              ${p.tier?`<span style="font-size:var(--fs-caption);font-weight:800;background:${chipTierCol2};color:${chipTierText2};border-radius:6px;padding:2px 8px">${p.tier}</span>`:''}
            </span>
          </span>
        </span>`;
      }
      const compact=boardCompactMode;
      const totalInUniv=sorted.length;
      // 관리자는 이동/직책 팝업, 비관리자는 스트리머 상세
      const clickFn=_boardCanManage()
        ? `openBrdPlayerPopupFromChip(event,'${pNameJs}','${uNameJs}',${chipIdx??0},${totalInUniv})`
        : `openRandomPlayerModal()`;

      // 티어 고정 색상 (칩)
      const chipTierCol = p.tier ? (getTierBtnColor(p.tier) || col) : '#9ca3af';
      const chipTierText = p.tier ? (getTierBtnTextColor(p.tier) || '#fff') : '#fff';

      // 칩 배경: 대학 지정색
      const cBgL=hexToRgba(col,.16);
      const cBgH=hexToRgba(col,.28);
      const cBd=hexToRgba(col,.45);
      const rTxt=rc.txt||p.race||'?';
      const photoSz=compact?'36px':'64px';
      const photoFs=compact?'14px':'26px';
      const chipPad=compact?'5px 10px 5px 6px':'10px 18px 10px 10px';
      const chipGap=compact?'7px':'12px';
      const nameFs=compact?'13px':'16px';
      const badgeFs=compact?'10px':'12px';
      const tierBadgeFs=compact?'9px':'11px';
      // 사진 렌더: 사진 로드 실패 시 플레이스홀더(종족 텍스트) 표시
      const _photoEl = photoSrcChip
        ? `<span style="width:${photoSz};height:${photoSz};border-radius:var(--su_profile_radius,50%);flex-shrink:0;position:relative;display:inline-flex;align-items:center;justify-content:center;overflow:hidden;border:${compact?'2':'3'}px solid ${col};box-shadow:0 2px 10px ${hexToRgba(col,.4)};background:${col};color:#fff;font-size:${photoFs};font-weight:900">${rTxt}<img src="${toHttpsUrl(photoSrcChip)}" class="brd-fit-auto" data-fit-kind="profile" data-fit-mode="auto" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;border-radius:var(--su_profile_radius,50%)" onload="_applyBoardBgAutoSizing(this)" onerror="this.style.display='none'"></span>`
        : `<span style="width:${photoSz};height:${photoSz};border-radius:var(--su_profile_radius,50%);background:${col};color:#fff;display:inline-flex;align-items:center;justify-content:center;font-size:${photoFs};font-weight:900;flex-shrink:0;border:${compact?'2':'3'}px solid ${hexToRgba(col,.7)}">${rTxt}</span>`;
      return `<span class="brd-chip" data-player="${escAttr(p.name)}" data-univ="${escAttr(u.name)}" data-idx="${chipIdx??0}"${_boardCanManage()?' draggable="true"':''} style="display:inline-flex;align-items:center;gap:${chipGap};background:${cBgL};border-radius:var(--r2);padding:${chipPad};margin:${compact?'3px':'5px'};cursor:${_boardCanManage()?'grab':'pointer'};transition:all .15s;box-shadow:0 2px 10px rgba(0,0,0,.13);border:2px solid ${cBd}" onmouseover="this.style.background='${cBgH}';this.style.boxShadow='0 5px 18px rgba(0,0,0,.2)';this.style.borderColor='${hexToRgba(col,.65)}'" onmouseout="this.style.background='${cBgL}';this.style.boxShadow='0 2px 10px rgba(0,0,0,.13)';this.style.borderColor='${cBd}'" onclick="event.stopPropagation();${clickFn}" ondragstart="if(_boardCanManage()){event.stopPropagation();event.dataTransfer.setData('text/chip',this.dataset.player);}">
        ${_photoEl}
        <span style="display:inline-flex;flex-direction:column;gap:${compact?'2px':'3px'};min-width:0">
          ${isMain&&!compact?`<span style="font-size:var(--fs-caption);font-weight:900;color:#fff;background:${col};border-radius:5px;padding:2px 8px;display:inline-block">${rIcon}${p.role}</span>`:''}
          <span style="font-weight:900;color:#111;font-size:${nameFs};line-height:1.3;white-space:nowrap;${p.inactive?'opacity:.6':''}">${compact&&isMain?`${rIcon}`:''}${pNameHtml}${getStatusIconHTML(p.name)}${p.inactive?'<span style="font-size:9px;background:#fff7ed;color:#9a3412;border-radius:4px;padding:1px 4px;font-weight:700;margin-left:3px">⏸️</span>':''}${(()=>{if(!p.transferDate||!p.prevUniv)return'';const diff=(new Date()-new Date(p.transferDate))/(864e5);return diff<=30?`<span style="font-size:9px;background:#fef3c7;color:#92400e;border-radius:4px;padding:1px 5px;font-weight:800;margin-left:3px;border:1px solid #fcd34d" title="${escAttr(p.prevUniv)}에서 이적 (${escAttr(p.transferDate)})">🔄 이적</span>`:'';})()}</span>
          <span style="display:inline-flex;align-items:center;gap:${compact?'3px':'5px'};line-height:1.2">
            <span style="font-size:${badgeFs};font-weight:900;background:${rc.col};color:#fff;border-radius:6px;padding:${compact?'1px 5px':'2px 8px'}">${rTxt}</span>
            ${p.tier?`<span style="font-size:${tierBadgeFs};font-weight:800;background:${chipTierCol};color:${chipTierText};border-radius:6px;padding:${compact?'1px 5px':'2px 8px'}">${p.tier}</span>`:''}
          </span>
        </span>
      </span>`;    };

    // 전체 순서에서의 인덱스 맵
    const chipIdxMap={};
    sorted.forEach((p,i)=>{ chipIdxMap[p.name]=i; });

    // 직급자 섹션
    // 직책별 개별 행 (MAIN_ROLES 순서대로 각 역할 따로 표시)
    const roleRowsArr = MAIN_ROLES
      .map(role => rolePlayers.filter(p => p.role === role))
      .filter(group => group.length > 0);
    const roleSection = roleRowsArr.length > 0
      ? roleRowsArr.map(group => {
          const role = group[0].role;
          const rIcon = ROLE_ICONS[role] || '';
          const rCol = ROLE_COLORS[role] || col;
          return `<div style="margin-bottom:6px;padding:6px 8px 8px;border-radius:var(--r);background:${hexToRgba(col,.1)};border:1.5px solid ${hexToRgba(col,.25)}">
            <div style="font-size:10px;font-weight:900;color:#fff;padding:2px 9px;margin-bottom:4px;background:${rCol};border-radius:5px;display:inline-block;line-height:1.6">${rIcon}${role}</div>
            <div style="${boardCardView&&!forExport?'display:grid;grid-template-columns:repeat(auto-fill,minmax(90px,1fr));gap:8px;padding:4px 0':'display:flex;flex-wrap:wrap;gap:0'}">${group.map(p=>buildPlayerChip(p, chipIdxMap[p.name]??0)).join('')}</div>
          </div>`;
        }).join('')
      : '';

    // 무소속: 티어 레이블 포함 flat 리스트
    let tierRows='', allRows='';
    if(u.name==='무소속'&&!forExport){
      const tierSorted=[...sorted].sort((a,b)=>TIERS.indexOf(a.tier)-TIERS.indexOf(b.tier)||b.points-a.points);
      const chipIdxMapElo={};
      tierSorted.forEach((p,i)=>{ chipIdxMapElo[p.name]=i; });
      // 티어별 그룹핑하여 레이블 표시
      const freeTierMap={};
      tierSorted.forEach(p=>{ const t=p.tier||'기타'; if(!freeTierMap[t])freeTierMap[t]=[]; freeTierMap[t].push(p); });
      const freeTierOrder=[...TIERS.filter(t=>freeTierMap[t]),...(freeTierMap['기타']?['기타']:[])];
      tierRows=freeTierOrder.map(tier=>{
        const ps=freeTierMap[tier];
        const tColor=getTierBtnColor(tier)||col;
        const tText=getTierBtnTextColor(tier)||'#fff';
        return `<div style="padding:4px 0 2px;border-bottom:1px solid ${hexToRgba(col,.22)}">
          <div style="font-size:10px;font-weight:900;color:${tText};letter-spacing:1px;padding:2px 9px;margin-bottom:3px;background:${toPastel(tColor,Math.max(0,(50-b2LabelAlpha)*0.005))}!important;border-radius:5px;box-shadow:0 1px 4px rgba(0,0,0,.15);display:inline-block;line-height:1.5">${tier}</div>
          <div style="${boardCardView&&!forExport?'display:grid;grid-template-columns:repeat(auto-fill,minmax(90px,1fr));gap:8px;padding:4px 0':'display:flex;flex-wrap:wrap;gap:0'}">${ps.map(p=>buildPlayerChip(p, chipIdxMapElo[p.name]??0)).join('')}</div>
        </div>`;
      }).join('');
      allRows=tierRows;
    } else {
      tierRows=tierOrder.map((tier,tidx)=>{
        const ps=tierMap[tier];
        const tColor = getTierBtnColor(tier) || col;
        const tText = getTierBtnTextColor(tier) || '#fff';
        return `<div style="padding:4px 0 2px;border-bottom:1px solid ${hexToRgba(col,.22)}">
          <div style="font-size:10px;font-weight:900;color:${tText};letter-spacing:1px;padding:2px 9px;margin-bottom:3px;background:${toPastel(tColor,Math.max(0,(50-b2LabelAlpha)*0.005))}!important;border-radius:5px;box-shadow:0 1px 4px rgba(0,0,0,.15);display:inline-block;line-height:1.5">${tier}</div>
          <div style="${boardCardView&&!forExport?'display:grid;grid-template-columns:repeat(auto-fill,minmax(90px,1fr));gap:8px;padding:4px 0':'display:flex;flex-wrap:wrap;gap:0'}">${ps.map(p=>buildPlayerChip(p, chipIdxMap[p.name]??0)).join('')}</div>
        </div>`;
      }).join('');
      allRows = roleSection + tierRows;
    }

    const hdrDrag=_boardCanManage()&&!forExport?' draggable="true" ondragstart="event.stopPropagation();const card=this.closest(\'.brd-card\');const wrap=document.getElementById(\'board-wrap\');_brdDragSrc=card;card.classList.add(\'dragging\');event.dataTransfer.effectAllowed=\'move\';event.dataTransfer.setData(\'text/card\',card.dataset.univ);" ondragend="event.stopPropagation();const card=this.closest(\'.brd-card\');card.classList.remove(\'dragging\');const wrap=document.getElementById(\'board-wrap\');if(wrap){boardOrder=[...wrap.querySelectorAll(\'.brd-card\')].map(c=>c.dataset.univ);save();syncBoardOrderToUnivCfg();}wrap&&wrap.querySelectorAll(\'.brd-card\').forEach(c=>c.classList.remove(\'drag-over\'));_brdDragSrc=null;"':'';

    const _bgPos=u.bgImgPos||'center center';
    const _bgSize=u.bgImgSize||'auto';
    const _bgPosGrid=u.bgImg?(()=>{
      const vs=['top','center','bottom'],hs=['left','center','right'];
      return `<div onclick="event.stopPropagation()" style="display:flex;flex-direction:column;gap:1px" title="배경 위치">${vs.map(v=>`<div style="display:flex;gap:1px">${hs.map(h=>{const p=`${v} ${h}`,a=_bgPos===p;return`<button onclick="event.stopPropagation();setBoardBgImgPos('${uNameJs}','${p}')" style="width:10px;height:10px;border-radius:2px;border:1px solid ${a?'rgba(255,255,255,.9)':'rgba(255,255,255,.3)'};background:${a?'rgba(255,255,255,.6)':'rgba(255,255,255,.15)'};cursor:pointer;padding:0" title="${p}"></button>`;}).join('')}</div>`).join('')}</div>`;
    })():'';
    return `<div class="brd-card" data-univ="${escAttr(u.name)}" style="position:relative;--brd-col:${toPastel(col,Math.min(1, Math.max(0.35, 0.95 - b2BgAlpha * 0.01) + 0.08))};--brd-shd:${shd}${isWide?';grid-column:1/-1':''}" draggable="false">
      <div class="brd-hdr" style="background:linear-gradient(135deg,${col} 0%,${hexToRgba(col,.85)} 100%);border-radius:18px 18px 0 0;cursor:${_boardCanManage()&&!forExport?'grab':'default'};overflow:hidden"${hdrDrag}>
        <div style="display:flex;align-items:center;gap:10px;position:relative;z-index:1">
          <div style="width:var(--su_univ_logo_box,46px);height:var(--su_univ_logo_box,46px);border-radius:var(--su_univ_logo_radius,13px);background:rgba(255,255,255,.20);border:2px solid rgba(255,255,255,.35);display:flex;align-items:center;justify-content:center;flex-shrink:0;overflow:hidden;${forExport?'':'cursor:pointer'}" draggable="false" ${forExport?'':`onmousedown="event.stopPropagation()" onclick="event.stopPropagation();if(typeof openUnivModal==='function')openUnivModal('${uNameJs}')"` } title="대학 상세 보기">
            ${iconUrl?`<img src="${toHttpsUrl(iconUrl)}" style="width:var(--su_univ_logo_size,34px);height:var(--su_univ_logo_size,34px);object-fit:contain;border-radius:var(--su_univ_logo_radius,10px)" onerror="this.parentElement.innerHTML='🏫'">`:'<span style="font-size:22px">🏫</span>'}
          </div>
          <div style="flex:1;min-width:0">
            <div style="display:flex;align-items:center;gap:6px;flex-wrap:nowrap;min-width:0;overflow:hidden">
              <button class="brd-univ-name-btn" style="color:#fff!important;font-weight:900;text-shadow:0 1px 4px rgba(0,0,0,.25);font-size:var(--fs-lg);display:inline-flex;align-items:center;gap:7px;flex-shrink:0" ${forExport?'':(`onclick="event.stopPropagation();toggleBoardUniv('${uNameJs}')"`)}>
                ${(u.name||'')}${(!forExport&&(boardSelUniv||'')===u.name)?`<span style="background:rgba(255,255,255,.95);color:${col};border-radius:50%;width:22px;height:22px;display:inline-flex;align-items:center;justify-content:center;font-size:14px;font-weight:900;box-shadow:0 2px 6px rgba(0,0,0,.2);flex-shrink:0">✓</span>`:''}</button>
              ${(u.championships||0)>0?`<span style="display:flex;gap:1px;flex-shrink:0">${'<span style="font-size:var(--fs-md)">⭐</span>'.repeat(u.championships||0)}</span>`:''}
              ${_boardCanManage()&&!forExport?`<input type="text" placeholder="📌 메모..." value="${escAttr(u.memo2||'')}" style="margin-left:4px;background:rgba(255,255,255,.18);border:1px solid rgba(255,255,255,.35);border-radius:6px;padding:2px 8px;font-size:var(--fs-sm);color:#fff;outline:none;font-family:inherit;min-width:60px;width:200px;max-width:45%;flex:0 1 auto" onmousedown="event.stopPropagation()" onclick="event.stopPropagation()" onchange="setBoardMemo2('${uNameJs}',this.value)" onblur="setBoardMemo2('${uNameJs}',this.value)">`:(u.memo2?`<span style="margin-left:4px;font-size:var(--fs-sm);color:rgba(255,255,255,.92);font-weight:600;background:rgba(255,255,255,.15);border-radius:6px;padding:2px 8px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;flex-shrink:1;max-width:45%">${(typeof window.escHTML==='function')?window.escHTML(u.memo2):u.memo2}</span>`:'')}
            </div>
            <div style="font-size:var(--fs-caption);color:rgba(255,255,255,.8);margin-top:3px;display:flex;align-items:center;gap:5px">${cnt}명 <button class="brd-collapse-btn no-export" onclick="event.stopPropagation();_brdCollapseToggle('${uNameJs}')"
              style="background:rgba(255,255,255,.18);border:1px solid rgba(255,255,255,.35);border-radius:4px;color:#fff;font-size:10px;padding:0 5px;height:16px;cursor:pointer;line-height:1;font-weight:700">${boardCollapsed.has(u.name)?'▶':'▼'}</button>${u.dissolved?`<span style="background:rgba(0,0,0,.4);font-size:10px;padding:1px 7px;border-radius:var(--r);color:#fca5a5">🏚️ 해체${u.dissolvedDate?' '+u.dissolvedDate:''}</span>`:''}${_boardCanManage()&&u.hidden?`<span style="background:rgba(0,0,0,.4);font-size:10px;padding:1px 7px;border-radius:var(--r)">🚫 방문자 숨김</span>`:''}</div>
          </div>
          ${!forExport?`<div class="no-export" style="display:flex;flex-direction:column;gap:3px;flex-shrink:0">
            ${_boardCanManage()?`<div style="display:flex;gap:3px;flex-wrap:wrap;justify-content:flex-end">
{{ ... }
              <button onclick="event.stopPropagation();boardCardMove('${u.name}','left')" style="background:rgba(255,255,255,.18);border:1px solid rgba(255,255,255,.35);border-radius:5px;color:#fff;font-size:var(--fs-caption);padding:0 7px;height:22px;cursor:pointer" title="왼쪽 이동">◀</button>
              <button onclick="event.stopPropagation();boardCardMove('${u.name}','right')" style="background:rgba(255,255,255,.18);border:1px solid rgba(255,255,255,.35);border-radius:5px;color:#fff;font-size:var(--fs-caption);padding:0 7px;height:22px;cursor:pointer" title="오른쪽 이동">▶</button>
              <button onclick="event.stopPropagation();toggleBoardHide('${u.name}')" style="background:${u.hidden?'rgba(239,68,68,.55)':'rgba(255,255,255,.18)'};border:1px solid ${u.hidden?'rgba(239,68,68,.8)':'rgba(255,255,255,.35)'};border-radius:5px;color:#fff;font-size:var(--fs-sm);padding:0 7px;height:22px;cursor:pointer" title="${u.hidden?'숨김':'표시'}">${u.hidden?'🚫':'👁️'}</button>
              <label style="background:rgba(255,255,255,.18);border:1px solid rgba(255,255,255,.35);border-radius:5px;color:#fff;font-size:var(--fs-sm);padding:0 7px;height:22px;cursor:pointer;display:flex;align-items:center;position:relative;overflow:hidden" onclick="event.stopPropagation()" title="색상">🎨<input type="color" value="${col}" style="position:absolute;opacity:0;width:100%;height:100%;cursor:pointer;top:0;left:0" onchange="event.stopPropagation();changeBoardUnivColor('${u.name}',this.value)"></label>
              <button onclick="event.stopPropagation();adjustChampionship('${u.name}',1)" style="background:rgba(255,255,255,.18);border:1px solid rgba(255,255,255,.35);border-radius:5px;color:#fff;font-size:var(--fs-caption);padding:0 7px;height:22px;cursor:pointer" title="우승 추가">⭐+</button>
              <button onclick="event.stopPropagation();adjustChampionship('${u.name}',-1)" style="background:rgba(255,255,255,.18);border:1px solid rgba(255,255,255,.35);border-radius:5px;color:#fff;font-size:var(--fs-caption);padding:0 7px;height:22px;cursor:pointer" title="우승 제거">⭐-</button>
              ${(()=>{const _ci=univCfg.findIndex(x=>x.name===u.name);if(_ci<0)return'';return u.dissolved?`<button onclick="event.stopPropagation();univCfg[${_ci}].dissolved=false;univCfg[${_ci}].hidden=false;delete univCfg[${_ci}].dissolvedDate;save();render()" style="background:rgba(34,197,94,.35);border:1px solid rgba(134,239,172,.8);border-radius:5px;color:#fff;font-size:var(--fs-caption);padding:0 7px;height:22px;cursor:pointer" title="해체 복구">🔄 복구</button>`:`<button onclick="event.stopPropagation();(function(){const _i=${_ci};if(typeof openDissolveModal==='function'){openDissolveModal(_i);}else{if(!confirm('${u.name.replace(/'/g,"\\'")} 대학을 해체하시겠습니까?'))return;univCfg[_i].dissolved=true;univCfg[_i].hidden=true;univCfg[_i].dissolvedDate=new Date().toISOString().slice(0,10);save();render();}})()" style="background:rgba(234,88,12,.35);border:1px solid rgba(253,186,116,.8);border-radius:5px;color:#fff;font-size:var(--fs-caption);padding:0 7px;height:22px;cursor:pointer" title="대학 해체">🏚️ 해체</button>`;})()}
              <label style="background:rgba(255,255,255,.18);border:1px solid rgba(255,255,255,.35);border-radius:5px;color:#fff;font-size:var(--fs-caption);padding:0 7px;height:22px;cursor:pointer;display:flex;align-items:center;gap:2px" onclick="event.stopPropagation()" title="배경 이미지 파일 업로드">🖼️<input type="file" accept="image/*" style="display:none" onchange="event.stopPropagation();(function(f,n){if(!f)return;const r=new FileReader();r.onload=function(e){setBoardBgImg(n,e.target.result);};r.readAsDataURL(f);})(this.files[0],'${uNameJs}')"></label>
              <button onclick="event.stopPropagation();promptBoardBgImgUrl('${uNameJs}')" style="background:${u.bgImg&&!u.bgImg.startsWith('data:')?'rgba(99,102,241,.45)':'rgba(255,255,255,.18)'};border:1px solid ${u.bgImg&&!u.bgImg.startsWith('data:')?'rgba(165,180,252,.8)':'rgba(255,255,255,.35)'};border-radius:5px;color:#fff;font-size:var(--fs-caption);padding:0 7px;height:22px;cursor:pointer" title="배경 이미지 URL 링크">🔗</button>
              ${u.bgImg?`<button onclick="event.stopPropagation();removeBoardBgImg('${uNameJs}')" style="background:rgba(239,68,68,.35);border:1px solid rgba(239,68,68,.6);border-radius:5px;color:#fff;font-size:var(--fs-caption);padding:0 7px;height:22px;cursor:pointer" title="배경 제거">🗑️</button>
              <button onclick="event.stopPropagation();setBoardBgImgSize('${uNameJs}','${_bgSize==='cover'?'contain':(_bgSize==='contain'?'auto':'cover')}')" style="background:rgba(255,255,255,.18);border:1px solid rgba(255,255,255,.35);border-radius:5px;color:#fff;font-size:10px;padding:0 6px;height:22px;cursor:pointer" title="${_bgSize==='cover'?'맞추기(contain)':(_bgSize==='contain'?'자동(auto)':'채우기(cover)')}">${_bgSize==='cover'?'↔맞추기':(_bgSize==='contain'?'🪄자동':'⬛채우기')}</button>
              ${_bgPosGrid}`:''}
            </div>`:''}
          </div>`:''}
        </div>
      </div>
      <div class="brd-sep" style="background:${hexToRgba(col,.25)}"></div>
      <div class="brd-card-body brd-body" style="background:${u.bgImg?'transparent':toPastel(col,Math.max(0.3, 0.88 - b2BgAlpha * 0.01))};overflow:hidden;position:relative;${boardCollapsed.has(u.name)?'display:none':''}">${u.bgImg?`<div class="brd-bg-layer" data-bg-src="${String(u.bgImg).replace(/"/g,'&quot;')}" data-bg-size-mode="${_bgSize}" style="position:absolute;inset:0;background:url('${String(u.bgImg).replace(/'/g,'%27')}') ${u.bgImgPos||'center center'}/${_bgSize==='auto'?'cover':_bgSize} no-repeat;opacity:0.35;pointer-events:none;z-index:0"></div>`:''}<div style="position:relative;z-index:1;background:${u.bgImg?'rgba(255,255,255,0.75)':'transparent'};min-height:100%">${(()=>{
        const _memo=u.memo||'';
        const _imgs=(u.memoImgs||[]).length?u.memoImgs:(u.memoImg?[u.memoImg]:[]);
        const _uname=u.name.replace(/'/g,"\\'").replace(/"/g,'&quot;');
        const panelStyle=`border-radius:var(--r);padding:8px;background:rgba(255,255,255,.25);border:1px solid rgba(255,255,255,.45);backdrop-filter:blur(8px);box-shadow:0 2px 12px rgba(0,0,0,.1)`;
        // 사이드 패널 (PC only, .brd-side-panel 클래스로 모바일 숨김)
        let sidePanelHtml='';
        if(_boardCanManage()&&!forExport){
          const imgList=_imgs.map((src,i)=>`<div style="position:relative;margin-bottom:5px">
            <img src="${src}" style="width:100%;border-radius:7px;display:block" onerror="this.style.display='none'">
            <button onclick="event.stopPropagation();removeBoardMemoImg('${_uname}',${i})" style="position:absolute;top:3px;right:3px;font-size:9px;background:rgba(239,68,68,.75);border:none;border-radius:4px;padding:1px 5px;color:#fff;cursor:pointer">✕</button>
          </div>`).join('');
          sidePanelHtml=`<div class="brd-side-panel no-export" style="${panelStyle}">
            ${imgList}
            <textarea placeholder="📝 사이드 메모..." rows="2" style="width:100%;box-sizing:border-box;border:1px solid rgba(255,255,255,.55);border-radius:7px;padding:4px 6px;font-size:var(--fs-caption);background:rgba(255,255,255,.45);resize:none;outline:none;font-family:inherit;color:#222;margin-top:${_imgs.length?'2px':'0'}" onmousedown="event.stopPropagation()" onclick="event.stopPropagation()" onchange="setBoardMemo('${_uname}',this.value)" onblur="setBoardMemo('${_uname}',this.value)">${_memo}</textarea>
            <div style="display:flex;gap:4px;margin-top:4px">
              <label style="display:inline-flex;align-items:center;gap:2px;cursor:pointer;font-size:10px;font-weight:700;background:rgba(255,255,255,.6);border:1px solid rgba(255,255,255,.65);border-radius:5px;padding:2px 6px" onclick="event.stopPropagation()" title="파일 업로드">🖼️ 업로드<input type="file" accept="image/*" style="display:none" onchange="event.stopPropagation();(function(f,n){if(!f)return;const r=new FileReader();r.onload=function(e){addBoardMemoImg(n,e.target.result);};r.readAsDataURL(f);})(this.files[0],'${_uname}')"></label>
              <button onclick="event.stopPropagation();promptBoardMemoImgUrl('${_uname}')" style="display:inline-flex;align-items:center;gap:2px;cursor:pointer;font-size:10px;font-weight:700;background:rgba(255,255,255,.6);border:1px solid rgba(255,255,255,.65);border-radius:5px;padding:2px 6px" title="이미지 URL 링크">🔗 링크</button>
            </div>
          </div>`;
        } else if(!forExport&&(_memo||_imgs.length)){
          const imgList=_imgs.map(src=>`<img src="${src}" style="width:100%;border-radius:7px;margin-bottom:5px;display:block" onerror="this.style.display='none'">`).join('');
          sidePanelHtml=`<div class="brd-side-panel no-export" style="${panelStyle}">${imgList}${_memo?`<div style="font-size:var(--fs-caption);color:#333;white-space:pre-wrap;line-height:1.5;margin-top:${_imgs.length?'4px':'0'}">${_memo}</div>`:''}</div>`;
        }
        // 하단 메모 (bMemo + bMemoImgs 배열)
        const _bnote=u.bMemo||'';
        const _bimgs=(u.bMemoImgs||[]).concat(u.bMemoImg?[u.bMemoImg]:[]);
        let bottomHtml='';
        if(_boardCanManage()&&!forExport){
          const imgList=_bimgs.map((src,i)=>`<div style="display:inline-flex;flex-direction:column;gap:3px;margin-right:6px;vertical-align:top">
            <img src="${src}" class="brd-bottom-section-img" style="max-width:130px;max-height:110px;object-fit:contain;border-radius:8px;display:block" onerror="this.style.display='none'">
            <button onclick="event.stopPropagation();removeBoardNoteImg('${_uname}',${i})" style="font-size:10px;background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.25);border-radius:5px;padding:2px 6px;color:#dc2626;cursor:pointer">🗑️ 삭제</button>
          </div>`).join('');
          bottomHtml=`<div style="margin-top:8px;padding-top:8px;border-top:1px solid rgba(0,0,0,.08);display:flex;flex-direction:column;gap:5px">
            ${imgList?`<div style="display:flex;flex-wrap:wrap;gap:4px">${imgList}</div>`:''}
            <textarea placeholder="📋 하단 메모 입력..." rows="2" style="width:100%;box-sizing:border-box;border:1px solid rgba(0,0,0,.12);border-radius:7px;padding:5px 8px;font-size:var(--fs-caption);background:rgba(255,255,255,.55);resize:none;outline:none;font-family:inherit;color:#222" onmousedown="event.stopPropagation()" onclick="event.stopPropagation()" onchange="setBoardNote('${_uname}',this.value)" onblur="setBoardNote('${_uname}',this.value)">${_bnote}</textarea>
            <div style="display:flex;gap:5px;align-items:center">
              <label style="display:inline-flex;align-items:center;gap:3px;cursor:pointer;font-size:var(--fs-caption);font-weight:700;background:rgba(255,255,255,.7);border:1px solid rgba(0,0,0,.12);border-radius:6px;padding:3px 8px" onclick="event.stopPropagation()" title="파일 업로드">🖼️ 업로드<input type="file" accept="image/*" style="display:none" onchange="event.stopPropagation();(function(f,n){if(!f)return;const r=new FileReader();r.onload=function(e){addBoardNoteImg(n,e.target.result);};r.readAsDataURL(f);})(this.files[0],'${_uname}')"></label>
              <button onclick="event.stopPropagation();promptBoardNoteImgUrl('${_uname}')" style="display:inline-flex;align-items:center;gap:3px;cursor:pointer;font-size:var(--fs-caption);font-weight:700;background:rgba(255,255,255,.7);border:1px solid rgba(0,0,0,.12);border-radius:6px;padding:3px 8px" title="이미지 URL 링크">🔗 링크</button>
            </div>
          </div>`;
        } else if(_bnote||_bimgs.length){
          const imgList=_bimgs.map(src=>`<img src="${src}" class="brd-bottom-section-img" style="max-width:130px;max-height:110px;object-fit:contain;border-radius:8px;display:block" onerror="this.style.display='none'">`).join('');
          bottomHtml=`<div style="margin-top:8px;padding:8px;border-radius:8px;background:rgba(255,255,255,.35)">${imgList?`<div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:${_bnote?'6px':'0'}">${imgList}</div>`:''}${_bnote?`<div style="font-size:var(--fs-sm);color:#333;white-space:pre-wrap;line-height:1.6">${_bnote}</div>`:''}</div>`;
        }
        const mainLayout=`<div style="overflow:hidden">${sidePanelHtml}${roleSection}${tierRows}</div>`;
        return `<div style="position:relative;z-index:1">${mainLayout}${bottomHtml}</div>`;
      })()}</div></div>
    </div>`;
  };

  // 항상 칩 레이아웃 사용 (무소속은 wide)
  return buildChipLayout(u.name==='무소속');
}

function _brdToast(msg, duration=2800){
  const existing = document.getElementById('brd-toast');
  if(existing) existing.remove();
  const el = document.createElement('div');
  el.id = 'brd-toast';
  el.textContent = msg;
  el.style.cssText = 'position:fixed;bottom:28px;left:50%;transform:translateX(-50%) translateY(20px);background:#1e293b;color:#fff;padding:10px 20px;border-radius:var(--r);font-size:var(--fs-base);font-weight:600;z-index:9999;box-shadow:0 4px 20px rgba(0,0,0,.3);opacity:0;transition:opacity .25s,transform .25s;pointer-events:none;font-family:\'Noto Sans KR\',sans-serif;';
  document.body.appendChild(el);
  requestAnimationFrame(()=>{
    el.style.opacity='1'; el.style.transform='translateX(-50%) translateY(0)';
  });
  setTimeout(()=>{
    el.style.opacity='0'; el.style.transform='translateX(-50%) translateY(10px)';
    setTimeout(()=>el.remove(), 300);
  }, duration);
}

/* ── 선수 이동 팝업 ── */
let _brdPopup = null;
let _brdPopupListenerAdded = false;
function _closeBrdPopup(e){
  if(!_brdPopup) return;
  if(!_brdPopup.contains(e.target)){
    _brdClose();
  }
}
// 중앙화된 팝업 닫기 - 딤 오버레이 포함 항상 정리
// 현황판 칩 클릭 시 랜덤 스트리머 상세 열기
function openRandomPlayerModal(){
  const eligible = (window.players||[]).filter(p=>p&&p.name&&!p.hidden&&!p.retired);
  if(!eligible.length) return;
  const pick = eligible[Math.floor(Math.random()*eligible.length)];
  openPlayerModal(pick.name);
}

function _brdClose(){
  if(_brdPopup){ _brdPopup.remove(); _brdPopup=null; }
  const dim=document.getElementById('brd-popup-dim');
  if(dim) dim.remove();
}

// 칩 전용 팝업 (무소속 등 칩 레이아웃) - 위/아래 이동 대신 대학이동 위주
function openBrdPlayerPopupFromChip(e, playerName, univName, idx, total){
  if(!_boardCanManage()){ openRandomPlayerModal(); return; }
  e.stopPropagation();
  _brdClose();
  const allUnivs = _getBoardUnivs();
  const p = players.find(x=>x.name===playerName);
  if(!p) return;

  const popup = document.createElement('div');
  popup.className = 'brd-move-popup';
  _brdPopup = popup;

  const otherUnivs = allUnivs.filter(u=>u.name!==univName&&!u.dissolved);
  const univOpts = otherUnivs.map(u=>`<option value="${u.name}">${u.name}</option>`).join('');
  const _pnSafeChip = playerName.replace(/[^a-zA-Z0-9가-힣]/g,'');
  const pNameJs = (typeof escJS==='function')
    ? escJS(playerName)
    : String(playerName||'').replace(/\\/g,'\\\\').replace(/'/g,"\\'").replace(/\r/g,'\\r').replace(/\n/g,'\\n');
  const uNameJs = (typeof escJS==='function')
    ? escJS(univName)
    : String(univName||'').replace(/\\/g,'\\\\').replace(/'/g,"\\'").replace(/\r/g,'\\r').replace(/\n/g,'\\n');
  const pNameHtml = (typeof window.escHTML==='function') ? window.escHTML(playerName) : String(playerName||'');
  const uNameHtml = (typeof window.escHTML==='function') ? window.escHTML(univName) : String(univName||'');
  const _tierIdxChip = TIERS.indexOf(p.tier||'미정');
  const _prevTierChip = _tierIdxChip > 0 ? TIERS[_tierIdxChip-1] : null;
  const _nextTierChip = _tierIdxChip < TIERS.length-1 ? TIERS[_tierIdxChip+1] : null;

  popup.innerHTML = `
    <div class="brd-move-popup-title">👤 ${pNameHtml} <span style="font-size:10px;font-weight:400">(${uNameHtml})</span></div>
    <div style="padding:5px 6px 8px;border-bottom:1px solid var(--border)">
      <div style="font-size:10px;font-weight:700;color:var(--text3);margin-bottom:4px">🎭 상태 아이콘 <span style="margin-left:4px">${getStatusIconHTML(playerName)||''}</span></div>
      <div style="display:flex;flex-wrap:wrap;gap:2px;max-height:90px;overflow-y:auto" id="brd-icon-grid-${_pnSafeChip}">
        ${(()=>{const _ci=getStatusIcon(playerName);return Object.entries(STATUS_ICON_DEFS).map(([id,d])=>{const sel=(id==='none'&&!_ci)||(d.emoji&&_ci===d.emoji);const inner=d.emoji?(_siIsImg(d.emoji)?_siRender(d.emoji,'15px'):d.emoji):'<span style="font-size:9px">없음</span>';return `<button type="button" title="${d.label.replace(/"/g,'&quot;')}" onclick="setBrdStatusIcon(this,'${pNameJs}','${id}')" data-icon-id="${id}" style="padding:2px 5px;border-radius:4px;border:2px solid ${sel?'#16a34a':'var(--border)'};background:${sel?'#dcfce7':'var(--white)'};cursor:pointer;font-size:${id==='none'?'9px':'12px'};min-width:26px;display:inline-flex;align-items:center;justify-content:center">${inner}</button>`;}).join('');})()}
      </div>
    </div>
    <div class="brd-move-popup-sep"></div>
    <div style="padding:4px 6px 6px;font-size:var(--fs-caption);font-weight:700;color:var(--text3)">🏷️ 직책 수정</div>
    <div style="display:flex;gap:4px;flex-wrap:wrap;padding:0 6px 4px">
      ${['이사장','동아리 회장','총장','부총장','총괄','교수','코치'].map(r=>`<button class="btn btn-xs ${p.role===r?'btn-b':'btn-w'}" onclick="setBrdRole('${pNameJs}','${r}')" style="font-size:10px">${r}</button>`).join('')}
      <button class="btn btn-xs btn-w" onclick="setBrdRole('${pNameJs}','')" style="font-size:10px;color:#dc2626">해제</button>
    </div>
    <div style="display:flex;gap:4px;padding:0 6px 4px;align-items:center">
      <input id="brd-role-chip-${_pnSafeChip}" type="text" placeholder="직접 입력..." style="flex:1;padding:4px 7px;border-radius:6px;border:1px solid var(--border2);font-size:var(--fs-caption)">
      <button class="btn btn-b btn-xs" onclick="(function(){const inp=document.getElementById('brd-role-chip-${_pnSafeChip}');if(inp&&inp.value.trim())setBrdRole('${pNameJs}',inp.value.trim())})()">설정</button>
    </div>
    ${univName!=='무소속'?`<button onclick="const p=players.find(x=>x.name==='${pNameJs}');if(p){const from=p.univ;p.univ='무소속';delete p.role;if(boardPlayerOrder[from])boardPlayerOrder[from]=boardPlayerOrder[from].filter(n=>n!=='${pNameJs}');save();_brdClose();_refreshBoardCard(from);_refreshBoardCard('무소속');_brdToast('🚶 무소속으로 이동 완료');}" style="width:calc(100% - 12px);margin:0 6px 6px;padding:5px;border-radius:6px;border:1.5px solid #cbd5e1;background:#f8fafc;font-size:var(--fs-caption);font-weight:700;cursor:pointer;color:#475569">🚶 무소속으로 이동</button>`:``}
    <div class="brd-move-popup-sep"></div>
    <div style="padding:4px 6px 2px;font-size:var(--fs-caption);font-weight:700;color:var(--text3)">⭐ 티어</div>
    <div style="display:flex;align-items:center;gap:5px;padding:3px 6px 8px">
      <button onclick="${_prevTierChip?`setBrdTier('${pNameJs}','${_prevTierChip}')`:'void 0'}" ${!_prevTierChip?'disabled':''} style="padding:3px 10px;border-radius:6px;border:1px solid var(--border2);background:var(--surface);font-size:var(--fs-sm);font-weight:700;cursor:pointer;opacity:${!_prevTierChip?'.3':'1'}">▲</button>
      <span style="flex:1;text-align:center;font-size:var(--fs-base);font-weight:800;color:var(--text)">${p.tier||'미정'}</span>
      <button onclick="${_nextTierChip?`setBrdTier('${pNameJs}','${_nextTierChip}')`:'void 0'}" ${!_nextTierChip?'disabled':''} style="padding:3px 10px;border-radius:6px;border:1px solid var(--border2);background:var(--surface);font-size:var(--fs-sm);font-weight:700;cursor:pointer;opacity:${!_nextTierChip?'.3':'1'}">▼</button>
    </div>
    <div class="brd-move-popup-sep"></div>
    <div style="padding:4px 6px 6px;font-size:var(--fs-caption);font-weight:700;color:var(--text3)">🏫 다른 대학으로 이동</div>
    <div style="display:flex;gap:6px;padding:0 6px 6px">
      <select id="brd-chip-univ-target" style="flex:1;padding:5px 8px;border-radius:7px;border:1px solid var(--border2);font-size:var(--fs-sm);background:var(--white)">${univOpts||'<option disabled>대학 없음</option>'}</select>
      <button class="btn btn-b btn-xs" onclick="boardTransferPlayerFromChip('${pNameJs}','${uNameJs}')">이동</button>
    </div>
    <div class="brd-move-popup-sep"></div>
    <div style="padding:4px 6px 6px">
      <div style="font-size:10px;font-weight:700;color:var(--text3);margin-bottom:4px">🖼️ 프로필 이미지</div>
      <div style="display:flex;gap:4px">
        <input id="brd-photo-chip-${_pnSafeChip}" type="text" placeholder="이미지 URL 입력..." value="${(p.photo||'').replace(/"/g,'&quot;')}" style="flex:1;padding:3px 7px;border-radius:6px;border:1px solid var(--border2);font-size:var(--fs-caption)">
        <button class="btn btn-b btn-xs" onclick="setBrdPhoto('${pNameJs}',document.getElementById('brd-photo-chip-${_pnSafeChip}').value)">저장</button>
      </div>
      ${p.photo?`<button onclick="setBrdPhoto('${pNameJs}','')" style="margin-top:3px;width:100%;padding:2px;border-radius:5px;border:1px solid #fca5a5;background:#fff1f2;font-size:10px;font-weight:700;cursor:pointer;color:#dc2626">🗑️ 이미지 삭제</button>`:''}
    </div>
    <div class="brd-move-popup-sep"></div>
    <div style="padding:4px 6px 6px">
      <div style="font-size:10px;font-weight:700;color:var(--text3);margin-bottom:5px">🔧 상태</div>
      <div style="display:flex;gap:4px">
        <button onclick="(function(){const p=players.find(x=>x.name==='${pNameJs}');if(!p)return;p.retired=!p.retired;save();_brdClose();render();_brdToast(p.retired?'🎗️ 은퇴 처리됨':'↩️ 은퇴 해제됨');})()" style="flex:1;padding:5px;border-radius:6px;border:1.5px solid ${p.retired?'#6b7280':'#e2e8f0'};background:${p.retired?'#f1f5f9':'var(--white)'};font-size:var(--fs-caption);font-weight:700;cursor:pointer;color:${p.retired?'#374151':'#64748b'}">🎗️ ${p.retired?'은퇴 해제':'은퇴'}</button>
        <button onclick="(function(){const p=players.find(x=>x.name==='${pNameJs}');if(!p)return;p.hidden=!p.hidden;save();_brdClose();render();_brdToast(p.hidden?'🚫 현황판에서 숨김':'👁️ 현황판에 표시됨');})()" style="flex:1;padding:5px;border-radius:6px;border:1.5px solid ${p.hidden?'#f87171':'#e2e8f0'};background:${p.hidden?'#fff1f2':'var(--white)'};font-size:var(--fs-caption);font-weight:700;cursor:pointer;color:${p.hidden?'#dc2626':'#64748b'}">🚫 ${p.hidden?'숨김 해제':'현황판 숨기기'}</button>
      </div>
    </div>
    <button class="brd-move-popup-btn" onclick="_brdClose();openPlayerModal('${pNameJs}')">👤 스트리머 상세 보기</button>
  `;

  document.body.appendChild(popup);
  const isMobChip = window.innerWidth <= 768;
  if(isMobChip){
    const dim = document.createElement('div');
    dim.id = 'brd-popup-dim';
    dim.style.cssText = 'position:fixed;inset:0;background:rgba(15,23,42,.45);z-index:4999;backdrop-filter:blur(2px)';
    dim.onclick = () => { dim.remove(); _brdClose(); };
    document.body.insertBefore(dim, popup);
    popup.style.zIndex = '5000';
  } else {
  const targetEl = e.target.closest('.brd-chip');
  const rect = targetEl?.getBoundingClientRect() || {left:e.clientX, top:e.clientY, width:0, height:0};
  let left = rect.right + 6;
  let top = rect.top;
  const pw=240, ph=300;
  if(left + pw > window.innerWidth) left = rect.left - pw - 6;
  if(top + ph > window.innerHeight) top = window.innerHeight - ph - 10;
  if(top < 8) top = 8;
  popup.style.left = left + 'px';
  popup.style.top = top + 'px';
  }
}

function boardTransferPlayerFromChip(playerName, fromUniv){
  if(!_boardCanManage()){ alert('총관리자만 이동할 수 있습니다.'); return; }
  const sel = document.getElementById('brd-chip-univ-target');
  const toUniv = sel?.value;
  if(!toUniv || toUniv===fromUniv){ alert('이동할 대학을 선택하세요.'); return; }
  _brdClose();
  const p = players.find(x=>x.name===playerName);
  if(!p) return;
  if(!confirm(`"${playerName}"을(를) "${fromUniv}" → "${toUniv}"로 이동하시겠습니까?`)) return;
  p.prevUniv = fromUniv; p.transferDate = new Date().toISOString().slice(0,10);
  p.univ = toUniv;
  if(boardPlayerOrder[fromUniv]){
    boardPlayerOrder[fromUniv] = boardPlayerOrder[fromUniv].filter(n=>n!==playerName);
  }
  save(); saveBoardPlayerOrder();
  _refreshBoardCard(fromUniv);
  _refreshBoardCard(toUniv);
  _brdToast(`✅ "${playerName}" → "${toUniv}" 이동 완료`);
}


function openBrdPlayerPopup(e, playerName, univName, idx, total){
  // 비관리자는 팝업 없이 랜덤 스트리머 상세 열기
  if(!_boardCanManage()){ openRandomPlayerModal(); return; }

  e.stopPropagation();
  _brdClose();
  const allUnivs = _getBoardUnivs();
  const p = players.find(x=>x.name===playerName);
  if(!p) return;

  const popup = document.createElement('div');
  popup.className = 'brd-move-popup';
  _brdPopup = popup;

  const otherUnivs = allUnivs.filter(u=>u.name!==univName&&!u.dissolved);
  const univOpts = otherUnivs.map(u=>`<option value="${u.name}">${u.name}</option>`).join('');

  const _pnSafe = playerName.replace(/[^a-zA-Z0-9가-힣]/g,'');
  const pNameJs = (typeof escJS==='function')
    ? escJS(playerName)
    : String(playerName||'').replace(/\\/g,'\\\\').replace(/'/g,"\\'").replace(/\r/g,'\\r').replace(/\n/g,'\\n');
  const uNameJs = (typeof escJS==='function')
    ? escJS(univName)
    : String(univName||'').replace(/\\/g,'\\\\').replace(/'/g,"\\'").replace(/\r/g,'\\r').replace(/\n/g,'\\n');
  const pNameHtml = (typeof window.escHTML==='function') ? window.escHTML(playerName) : String(playerName||'');
  const uNameHtml = (typeof window.escHTML==='function') ? window.escHTML(univName) : String(univName||'');
  const _curIcon = getStatusIcon(playerName);
  const _tierIdx = TIERS.indexOf(p.tier||'미정');
  const _prevTier = _tierIdx > 0 ? TIERS[_tierIdx-1] : null;
  const _nextTier = _tierIdx < TIERS.length-1 ? TIERS[_tierIdx+1] : null;
  popup.innerHTML = `
    <div style="padding:8px 10px 6px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;gap:6px">
      <div style="font-size:var(--fs-sm);font-weight:800;color:var(--text)">👤 ${pNameHtml} <span style="font-size:10px;font-weight:500;color:var(--text3)">(${uNameHtml})</span></div>
      <button onclick="_brdClose()" style="background:none;border:none;color:var(--gray-l);font-size:14px;cursor:pointer;padding:0 2px;line-height:1">✕</button>
    </div>
    <div style="display:flex;gap:4px;padding:6px 8px;border-bottom:1px solid var(--border)">
      <button onclick="boardMovePlayer('${pNameJs}','${uNameJs}','top')" title="맨 위로" ${idx===0?'disabled':''} style="flex:1;padding:4px;border-radius:6px;border:1px solid var(--border2);background:var(--surface);font-size:16px;cursor:pointer;opacity:${idx===0?'.3':'1'}">⬆️</button>
      <button onclick="boardMovePlayer('${pNameJs}','${uNameJs}','up')" title="위로" ${idx===0?'disabled':''} style="flex:1;padding:4px;border-radius:6px;border:1px solid var(--border2);background:var(--surface);font-size:16px;cursor:pointer;opacity:${idx===0?'.3':'1'}">🔼</button>
      <button onclick="boardMovePlayer('${pNameJs}','${uNameJs}','down')" title="아래로" ${idx>=total-1?'disabled':''} style="flex:1;padding:4px;border-radius:6px;border:1px solid var(--border2);background:var(--surface);font-size:16px;cursor:pointer;opacity:${idx>=total-1?'.3':'1'}">🔽</button>
      <button onclick="boardMovePlayer('${pNameJs}','${uNameJs}','bottom')" title="맨 아래로" ${idx>=total-1?'disabled':''} style="flex:1;padding:4px;border-radius:6px;border:1px solid var(--border2);background:var(--surface);font-size:16px;cursor:pointer;opacity:${idx>=total-1?'.3':'1'}">⬇️</button>
    </div>
    <div style="padding:5px 8px;border-bottom:1px solid var(--border)">
      <div style="font-size:10px;font-weight:700;color:var(--text3);margin-bottom:4px">🏷️ 직책</div>
      <div style="display:flex;gap:3px;flex-wrap:wrap">
        ${['이사장','동아리 회장','총장','총괄','교수','코치'].map(r=>`<button class="btn btn-xs ${p.role===r?'btn-b':'btn-w'}" onclick="setBrdRole('${pNameJs}','${r}')" style="font-size:10px;padding:2px 7px">${r}</button>`).join('')}
        <button class="btn btn-xs btn-w" onclick="setBrdRole('${pNameJs}','')" style="font-size:10px;padding:2px 7px;color:#dc2626">해제</button>
      </div>
      <div style="display:flex;gap:4px;margin-top:4px">
        <input id="brd-role-custom-${_pnSafe}" type="text" placeholder="직접 입력..." style="flex:1;padding:3px 7px;border-radius:6px;border:1px solid var(--border2);font-size:var(--fs-caption)">
        <button class="btn btn-b btn-xs" onclick="(function(){const inp=document.getElementById('brd-role-custom-${_pnSafe}');if(inp&&inp.value.trim())setBrdRole('${pNameJs}',inp.value.trim())})()" style="font-size:var(--fs-caption)">설정</button>
      </div>
      ${univName!=='무소속'?`<button onclick="const p=players.find(x=>x.name==='${pNameJs}');if(p){const from=p.univ;p.univ='무소속';delete p.role;if(boardPlayerOrder[from])boardPlayerOrder[from]=boardPlayerOrder[from].filter(n=>n!=='${pNameJs}');save();_brdClose();_refreshBoardCard(from);_refreshBoardCard('무소속');_brdToast('🚶 무소속으로 이동 완료');}" style="width:100%;margin-top:5px;padding:4px;border-radius:6px;border:1.5px solid #cbd5e1;background:#f8fafc;font-size:var(--fs-caption);font-weight:700;cursor:pointer;color:#475569">🚶 무소속으로 이동</button>`:''}
    </div>
    <div style="padding:5px 8px;border-bottom:1px solid var(--border)">
      <div style="font-size:10px;font-weight:700;color:var(--text3);margin-bottom:4px">⭐ 티어</div>
      <div style="display:flex;align-items:center;gap:5px">
        <button onclick="${_prevTier?`setBrdTier('${pNameJs}','${_prevTier}')`:'void 0'}" ${!_prevTier?'disabled':''} style="padding:3px 10px;border-radius:6px;border:1px solid var(--border2);background:var(--surface);font-size:var(--fs-sm);font-weight:700;cursor:pointer;opacity:${!_prevTier?'.3':'1'}">▲</button>
        <span style="flex:1;text-align:center;font-size:var(--fs-base);font-weight:800;color:var(--text)">${p.tier||'미정'}</span>
        <button onclick="${_nextTier?`setBrdTier('${pNameJs}','${_nextTier}')`:'void 0'}" ${!_nextTier?'disabled':''} style="padding:3px 10px;border-radius:6px;border:1px solid var(--border2);background:var(--surface);font-size:var(--fs-sm);font-weight:700;cursor:pointer;opacity:${!_nextTier?'.3':'1'}">▼</button>
      </div>
    </div>
    <div style="padding:5px 8px;border-bottom:1px solid var(--border)">
      <div style="font-size:10px;font-weight:700;color:var(--text3);margin-bottom:4px">🎭 상태 아이콘</div>
      <div style="display:flex;flex-wrap:wrap;gap:3px" id="brd-icon-grid-${_pnSafe}">
        ${Object.entries(STATUS_ICON_DEFS).map(([id,d])=>{const sel=(id==='none'&&!_curIcon)||(d.emoji&&_curIcon===d.emoji);const inner=d.emoji?(_siIsImg(d.emoji)?_siRender(d.emoji,'16px'):d.emoji):'<span style="font-size:10px">없음</span>';return `<button type="button" title="${d.label}" onclick="setBrdStatusIcon(this,'${pNameJs}','${id}')" data-icon-id="${id}" style="padding:3px 6px;border-radius:5px;border:2px solid ${sel?'#16a34a':'var(--border)'};background:${sel?'#dcfce7':'var(--white)'};cursor:pointer;font-size:${id==='none'?'10px':'13px'};min-width:28px;transition:.1s;display:inline-flex;align-items:center;justify-content:center">${inner}</button>`;}).join('')}
      </div>
      <div style="display:flex;gap:3px;margin-top:5px;align-items:center">
        <input id="brd-si-url-${_pnSafe}" type="text" placeholder="🔗 이미지 URL 입력" style="flex:1;padding:3px 7px;border-radius:5px;border:1px solid var(--border2);font-size:var(--fs-caption)" oninput="_brdSiPreview('${_pnSafe}',this.value)">
        <span id="brd-si-prev-${_pnSafe}" style="width:22px;height:22px;display:inline-flex;align-items:center;justify-content:center;border:1px solid var(--border);border-radius:5px;background:var(--white);font-size:14px;flex-shrink:0"></span>
        <button class="btn btn-b btn-xs" onclick="_brdAddCustomIcon('${_pnSafe}','${pNameJs}')">추가</button>
      </div>
    </div>
    <div style="padding:5px 8px;border-bottom:1px solid var(--border)">
      <div style="font-size:10px;font-weight:700;color:var(--text3);margin-bottom:4px">🖼️ 프로필 이미지</div>
      <div style="display:flex;gap:4px">
        <input id="brd-photo-${_pnSafe}" type="text" placeholder="이미지 URL 입력..." value="${(p.photo||'').replace(/"/g,'&quot;')}" style="flex:1;padding:3px 7px;border-radius:6px;border:1px solid var(--border2);font-size:var(--fs-caption)">
        <button class="btn btn-b btn-xs" onclick="setBrdPhoto('${pNameJs}',document.getElementById('brd-photo-${_pnSafe}').value)">저장</button>
      </div>
      ${p.photo?`<button onclick="setBrdPhoto('${pNameJs}','')" style="margin-top:3px;width:100%;padding:2px;border-radius:5px;border:1px solid #fca5a5;background:#fff1f2;font-size:10px;font-weight:700;cursor:pointer;color:#dc2626">🗑️ 이미지 삭제</button>`:''}
    </div>
    <div style="padding:5px 8px;border-bottom:1px solid var(--border)">
      <div style="font-size:10px;font-weight:700;color:var(--text3);margin-bottom:4px">🏫 대학 이동</div>
      <div style="display:flex;gap:4px">
        <select id="brd-univ-target" style="flex:1;padding:4px 8px;border-radius:6px;border:1px solid var(--border2);font-size:var(--fs-sm);background:var(--white)">${univOpts||'<option disabled>대학 없음</option>'}</select>
        <button class="btn btn-b btn-xs" onclick="boardTransferPlayer('${pNameJs}','${uNameJs}')">이동</button>
      </div>
    </div>
    <div style="padding:5px 8px;border-bottom:1px solid var(--border)">
      <div style="font-size:10px;font-weight:700;color:var(--text3);margin-bottom:5px">🔧 상태</div>
      <div style="display:flex;gap:4px">
        <button onclick="(function(){const p=players.find(x=>x.name==='${pNameJs}');if(!p)return;p.retired=!p.retired;save();_brdClose();render();_brdToast(p.retired?'🎗️ 은퇴 처리됨':'↩️ 은퇴 해제됨');})()" style="flex:1;padding:5px;border-radius:6px;border:1.5px solid ${p.retired?'#6b7280':'#e2e8f0'};background:${p.retired?'#f1f5f9':'var(--white)'};font-size:var(--fs-caption);font-weight:700;cursor:pointer;color:${p.retired?'#374151':'#64748b'}">🎗️ ${p.retired?'은퇴 해제':'은퇴'}</button>
        <button onclick="(function(){const p=players.find(x=>x.name==='${pNameJs}');if(!p)return;p.hidden=!p.hidden;save();_brdClose();render();_brdToast(p.hidden?'🚫 현황판에서 숨김':'👁️ 현황판에 표시됨');})()" style="flex:1;padding:5px;border-radius:6px;border:1.5px solid ${p.hidden?'#f87171':'#e2e8f0'};background:${p.hidden?'#fff1f2':'var(--white)'};font-size:var(--fs-caption);font-weight:700;cursor:pointer;color:${p.hidden?'#dc2626':'#64748b'}">🚫 ${p.hidden?'숨김 해제':'현황판 숨기기'}</button>
      </div>
    </div>
    <div style="display:flex;gap:4px;padding:6px 8px">
      <button style="flex:1;padding:6px;border-radius:7px;border:none;background:#2563eb;color:#fff;font-size:var(--fs-caption);font-weight:800;cursor:pointer;font-family:'Noto Sans KR',sans-serif" onclick="_brdClose();_refreshBoardCard('${uNameJs}');save();_brdToast('✅ 저장 완료')">💾 저장</button>
      <button style="flex:1;padding:6px;border-radius:7px;border:1px solid var(--border2);background:var(--surface);color:var(--text);font-size:var(--fs-caption);font-weight:600;cursor:pointer;font-family:'Noto Sans KR',sans-serif" onclick="_brdClose();openPlayerModal('${pNameJs}')">📋 상세</button>
    </div>
  `;

  document.body.appendChild(popup);

  // 모바일에서는 딤 오버레이 + 하단 시트, PC에서는 기존 위치 계산
  const isMob = window.innerWidth <= 768;
  if(isMob){
    // 딤 오버레이 생성
    const dim = document.createElement('div');
    dim.id = 'brd-popup-dim';
    dim.style.cssText = 'position:fixed;inset:0;background:rgba(15,23,42,.45);z-index:4999;backdrop-filter:blur(2px)';
    dim.onclick = () => { dim.remove(); _brdClose(); };
    document.body.insertBefore(dim, popup);
    popup.style.zIndex = '5000';
  } else {
  // 위치 계산 - 클릭 대상이 brd-row 또는 brd-chip 어느 것이든 처리
  const targetEl = e.target.closest('.brd-row, .brd-chip');
  const rect = targetEl?.getBoundingClientRect() || {left:e.clientX, top:e.clientY, width:0, height:0};
  let left = rect.left + rect.width + 6;
  let top = rect.top;
  const pw=256, ph=420;
  if(left + pw > window.innerWidth) left = rect.left - pw - 6;
  if(top + ph > window.innerHeight) top = window.innerHeight - ph - 10;
  if(top < 8) top = 8;
  popup.style.left = left + 'px';
  popup.style.top = top + 'px';
  }
}

function setBrdTier(playerName, newTier){
  const p=players.find(x=>x.name===playerName);
  if(!p)return;
  p.tier=newTier;
  save();
  _brdClose();
  _refreshBoardCard(p.univ);
  _brdToast('⭐ 티어 변경: '+newTier);
}
function setBrdRole(playerName, role){
  const p=players.find(x=>x.name===playerName);
  if(!p)return;
  p.role=role||undefined;
  // 직책 변경 시 해당 대학의 수동 순서 초기화 → 직책 기준 자동 정렬
  if(boardPlayerOrder[p.univ]){
    delete boardPlayerOrder[p.univ];
    saveBoardPlayerOrder();
  }
  save();
  _brdClose();
  _refreshBoardCard(p.univ);
}
function setBrdPhoto(playerName, url){
  const p=players.find(x=>x.name===playerName);
  if(!p)return;
  const trimmed=url.trim();
  if(trimmed) p.photo=trimmed; else delete p.photo;
  _brdPhotoCacheSet(playerName, trimmed); // 캐시 갱신
  save();
  _refreshBoardCard(p.univ);
  _brdToast(trimmed?'🖼️ 프로필 이미지 저장 완료':'🗑️ 프로필 이미지 삭제');
}
function _brdSiPreview(pnSafe, v){
  const el = document.getElementById('brd-si-prev-'+pnSafe);
  if(!el) return;
  el.innerHTML = v && (v.startsWith('http')||v.startsWith('data:'))
    ? `<img src="${v}" style="width:18px;height:18px;object-fit:contain" onerror="this.style.display='none'">`
    : v;
}
function _brdAddCustomIcon(pnSafe, playerName){
  const urlEl = document.getElementById('brd-si-url-'+pnSafe);
  if(!urlEl || !urlEl.value.trim()) return;
  const pnJs = (typeof escJS==='function')
    ? escJS(playerName)
    : String(playerName||'').replace(/\\/g,'\\\\').replace(/'/g,"\\'").replace(/\r/g,'\\r').replace(/\n/g,'\\n');
  addCustomStatusIcon('커스텀', urlEl.value.trim());
  urlEl.value = '';
  const prev = document.getElementById('brd-si-prev-'+pnSafe);
  if(prev) prev.innerHTML = '';
  // 그리드 갱신
  const grid = document.getElementById('brd-icon-grid-'+pnSafe);
  if(!grid) return;
  const _curIcon = playerStatusIcons[playerName] || '';
  grid.innerHTML = Object.entries(STATUS_ICON_DEFS).map(([id,d])=>{
    const sel=(id==='none'&&!_curIcon)||(d.emoji&&_curIcon===d.emoji);
    const inner=d.emoji?(_siIsImg(d.emoji)?_siRender(d.emoji,'16px'):d.emoji):'<span style="font-size:10px">없음</span>';
    return `<button type="button" title="${d.label}" onclick="setBrdStatusIcon(this,'${pnJs}','${id}')" data-icon-id="${id}" style="padding:3px 6px;border-radius:5px;border:2px solid ${sel?'#16a34a':'var(--border)'};background:${sel?'#dcfce7':'var(--white)'};cursor:pointer;font-size:${id==='none'?'10px':'13px'};min-width:28px;transition:.1s;display:inline-flex;align-items:center;justify-content:center">${inner}</button>`;
  }).join('');
}
function setBrdStatusIcon(btn, playerName, iconId){
  setStatusIcon(playerName, iconId);
  const grid = btn.closest('[id^="brd-icon-grid-"]');
  if(grid){
    grid.querySelectorAll('button[data-icon-id]').forEach(b=>{
      const sel = b.dataset.iconId === iconId;
      b.style.border = '2px solid '+(sel?'#16a34a':'var(--border)');
      b.style.background = sel?'#dcfce7':'var(--white)';
    });
  }
  const p = players.find(x=>x.name===playerName);
  if(p) _refreshBoardCard(p.univ);
}

function boardMovePlayer(playerName, univName, dir){
  if(!_boardCanManage()) return;
  _brdClose();
  const sorted = _getBoardPlayers(univName);
  const idx = sorted.findIndex(p=>p.name===playerName);
  if(idx < 0) return;
  const order = sorted.map(p=>p.name);
  let ni = idx;
  if(dir==='up') ni = Math.max(0, idx-1);
  else if(dir==='down') ni = Math.min(order.length-1, idx+1);
  else if(dir==='top') ni = 0;
  else if(dir==='bottom') ni = order.length-1;
  if(ni===idx) return;
  order.splice(idx,1);
  order.splice(ni,0,playerName);
  boardPlayerOrder[univName] = order;
  saveBoardPlayerOrder();
  // Firebase에도 순서 저장 (1.5초 debounce — 연속 이동 시 한 번만 저장)
  clearTimeout(window._bpoSaveTm);
  window._bpoSaveTm = setTimeout(() => { if(typeof save === 'function') save(); }, 1500);
  // 해당 카드만 다시 렌더
  _refreshBoardCard(univName);
}

function boardTransferPlayer(playerName, fromUniv){
  if(!_boardCanManage()){ alert('총관리자만 이동할 수 있습니다.'); return; }
  const sel = document.getElementById('brd-univ-target');
  const toUniv = sel?.value;
  if(!toUniv || toUniv===fromUniv){ alert('이동할 대학을 선택하세요.'); return; }
  _brdClose();
  const p = players.find(x=>x.name===playerName);
  if(!p) return;
  if(!confirm(`"${playerName}"을(를) "${fromUniv}" → "${toUniv}"로 이동하시겠습니까?\n\n스트리머 목록·티어 순위표·스트리머 상세·대학 상세가 모두 자동 반영됩니다.`)) return;

  // 실제 데이터 변경
  p.prevUniv = fromUniv; p.transferDate = new Date().toISOString().slice(0,10);
  p.univ = toUniv;

  // boardPlayerOrder에서 제거
  if(boardPlayerOrder[fromUniv]){
    boardPlayerOrder[fromUniv] = boardPlayerOrder[fromUniv].filter(n=>n!==playerName);
  }

  // 저장
  save();
  saveBoardPlayerOrder();

  // 현황판 두 카드 즉시 갱신
  _refreshBoardCard(fromUniv);
  _refreshBoardCard(toUniv);

  // 현재 열린 스트리머 상세 모달이 해당 선수면 갱신
  const pm = document.getElementById('playerModal');
  if(pm && pm.style.display !== 'none'){
    const nameEl = pm.querySelector('.brd-univ-name-btn, [data-player-name]');
    // 모달 타이틀에 선수 이름이 있으면 갱신
    if(pm.innerHTML && pm.innerHTML.includes(playerName)){
      openPlayerModal(playerName);
    }
  }

  // 성공 토스트
  _brdToast(`✅ "${playerName}" → "${toUniv}" 이동 완료`);
}

function _refreshBoardCard(univName){
  const wrap = document.getElementById('board-wrap');
  if(!wrap){ render(); return; }
  const u = getAllUnivs().find(x=>x.name===univName);
  const existing = _findBrdCardByUniv(univName, wrap);
  // 해당 대학에 선수가 없으면 카드 제거
  if(!u || !players.some(p=>p.univ===univName)){
    if(existing) existing.remove();
    return;
  }
  const newHtml = buildUnivBoardCard(u);
  if(!newHtml){
    if(existing) existing.remove();
    return;
  }
  const tmp = document.createElement('div');
  tmp.innerHTML = newHtml;
  const newCard = tmp.firstElementChild;
  if(existing) existing.replaceWith(newCard);
  else wrap.appendChild(newCard);
  injectUnivIcons(newCard);
  // 새 카드에 드래그 이벤트 재등록
  initBoardDragCard(newCard, wrap);
  // 플레이어 행 드래그 재등록 (관리자만)
  if(_boardCanManage()) newCard.querySelectorAll('.brd-body').forEach(body=>initBoardPlayerDrag(body));
}

/* ── 카드 클릭 순서 이동 ── */
function boardCardMove(univName, dir){
  if(!_boardCanManage()) return;
  const wrap = document.getElementById('board-wrap');
  if(!wrap) return;
  const cards = [...wrap.querySelectorAll('.brd-card')];
  const idx = cards.findIndex(c => c.dataset.univ === univName);
  if(idx < 0) return;
  let newIdx;
  if(dir === 'left')  newIdx = idx - 1;
  else                newIdx = idx + 1;
  if(newIdx < 0 || newIdx >= cards.length) return;
  const target = cards[newIdx];
  if(dir === 'left') target.before(cards[idx]);
  else               target.after(cards[idx]);
  // 순서 저장
  boardOrder = [...wrap.querySelectorAll('.brd-card')].map(c => c.dataset.univ);
  save();
  syncBoardOrderToUnivCfg();
  // 이동된 카드 잠깐 하이라이트
  cards[idx].style.outline = '3px solid rgba(255,255,255,.9)';
  setTimeout(() => { cards[idx].style.outline = ''; }, 500);
}


/* ── 카드 드래그 앤 드롭 ── */
function initBoardDrag(){
  const wrap=document.getElementById('board-wrap');
  if(!wrap)return;
  wrap.querySelectorAll('.brd-card').forEach(card=>initBoardDragCard(card, wrap));
  // 플레이어 행 드래그: 관리자만
  if(_boardCanManage()) wrap.querySelectorAll('.brd-body').forEach(body=>initBoardPlayerDrag(body));
}

let _brdDragSrc = null;
let _brdRowDragSrc = null; // 플레이어 행 드래그 소스

function initBoardDragCard(card, wrap){
  // dragstart/dragend는 이제 brd-hdr 인라인 핸들러로 처리
  // dragover/drop만 카드 레벨에서 처리
  card.addEventListener('dragover',e=>{
    if(_brdRowDragSrc) return; // 플레이어 행 드래그 중이면 카드 이동 무시
    if(!_brdDragSrc) return;
    e.preventDefault();
    e.dataTransfer.dropEffect='move';
    if(_brdDragSrc!==card){
      wrap.querySelectorAll('.brd-card').forEach(c=>c.classList.remove('drag-over'));
      card.classList.add('drag-over');
    }
  });
  card.addEventListener('dragleave',e=>{
    if(!e.currentTarget.contains(e.relatedTarget)) card.classList.remove('drag-over');
  });
  card.addEventListener('drop',e=>{
    if(_brdRowDragSrc) return;
    e.preventDefault();
    if(_brdDragSrc&&_brdDragSrc!==card){
      const cards=[...wrap.querySelectorAll('.brd-card')];
      const si=cards.indexOf(_brdDragSrc), di=cards.indexOf(card);
      if(si<di) card.after(_brdDragSrc); else card.before(_brdDragSrc);
    }
    card.classList.remove('drag-over');
  });
}

/* ── 플레이어 행 드래그 앤 드롭 (스트리머 네모박스 순서 변경 + 대학 간 이동) ── */
function initBoardPlayerDrag(body){
  if(!_boardCanManage()) return; // 총관리자만

  const getUnivName = ()=> body.closest('.brd-card')?.dataset?.univ || '';

  // brd-body 자체에도 dragover/drop 등록 → 다른 대학 카드의 body 위로 드롭 지원
  body.addEventListener('dragover', e=>{
    if(!_brdRowDragSrc) return;
    e.preventDefault(); e.stopPropagation();
    e.dataTransfer.dropEffect='move';
    body.style.outline='2px dashed rgba(255,255,255,.6)';
  });
  body.addEventListener('dragleave', e=>{
    if(!body.contains(e.relatedTarget)) body.style.outline='';
  });
  body.addEventListener('drop', e=>{
    body.style.outline='';
    if(!_brdRowDragSrc) return;
    const targetUniv = getUnivName();
    const srcUniv = _brdRowDragSrc.dataset.univ;
    const playerName = _brdRowDragSrc.dataset.player;
    // 같은 카드 내 드롭은 row 레벨에서 처리됨 → 여기서는 다른 대학 카드로 이동만 처리
    if(targetUniv && targetUniv !== srcUniv){
      e.preventDefault(); e.stopPropagation();
      if(!confirm(`"${playerName}"을(를) "${srcUniv}" → "${targetUniv}"로 이동하시겠습니까?`)) return;
      const p = players.find(x=>x.name===playerName);
      if(!p) return;
      p.prevUniv = srcUniv; p.transferDate = new Date().toISOString().slice(0,10);
      p.univ = targetUniv;
      if(boardPlayerOrder[srcUniv]){
        boardPlayerOrder[srcUniv] = boardPlayerOrder[srcUniv].filter(n=>n!==playerName);
      }
      save();
      saveBoardPlayerOrder();
      _refreshBoardCard(srcUniv);
      _refreshBoardCard(targetUniv);
      _brdToast(`✅ "${playerName}" → "${targetUniv}" 이동 완료`);
    }
  });

  // brd-row(일반 카드) + brd-chip(칩 레이아웃) 둘 다 드래그 등록
  body.querySelectorAll('.brd-row[data-player], .brd-chip[data-player]').forEach(row=>{
    row.addEventListener('dragstart',e=>{
      e.stopPropagation();
      _brdRowDragSrc=row;
      row.style.opacity='.45';
      e.dataTransfer.effectAllowed='move';
      e.dataTransfer.setData('text/player', row.dataset.player+'|'+row.dataset.univ);
    });
    row.addEventListener('dragend',e=>{
      row.style.opacity='';
      document.querySelectorAll('.brd-row, .brd-chip').forEach(r=>r.style.outline='');
      document.querySelectorAll('.brd-body').forEach(b=>b.style.outline='');
      _brdRowDragSrc=null;
    });
    row.addEventListener('dragover',e=>{
      if(!_brdRowDragSrc) return;
      e.preventDefault(); e.stopPropagation();
      e.dataTransfer.dropEffect='move';
      if(_brdRowDragSrc!==row){
        body.querySelectorAll('.brd-row, .brd-chip').forEach(r=>r.style.outline='');
        row.style.outline='2px solid rgba(255,255,255,.85)';
      }
    });
    row.addEventListener('dragleave',e=>{ row.style.outline=''; });
    row.addEventListener('drop',e=>{
      e.preventDefault(); e.stopPropagation();
      row.style.outline='';
      if(!_brdRowDragSrc||_brdRowDragSrc===row) return;
      const targetUniv = row.dataset.univ;
      const srcUniv = _brdRowDragSrc.dataset.univ;
      if(targetUniv !== srcUniv){
        const playerName = _brdRowDragSrc.dataset.player;
        if(!confirm(`"${playerName}"을(를) "${srcUniv}" → "${targetUniv}"로 이동하시겠습니까?`)) return;
        const p = players.find(x=>x.name===playerName);
        if(!p) return;
        p.prevUniv = srcUniv; p.transferDate = new Date().toISOString().slice(0,10);
        p.univ = targetUniv;
        if(boardPlayerOrder[srcUniv]){
          boardPlayerOrder[srcUniv] = boardPlayerOrder[srcUniv].filter(n=>n!==playerName);
        }
        const ti2 = (boardPlayerOrder[targetUniv]||[]).indexOf(row.dataset.player);
        if(!boardPlayerOrder[targetUniv]) boardPlayerOrder[targetUniv] = _getBoardPlayers(targetUniv).map(p=>p.name);
        if(ti2>=0) boardPlayerOrder[targetUniv].splice(ti2,0,playerName);
        else boardPlayerOrder[targetUniv].push(playerName);
        save(); saveBoardPlayerOrder();
        _refreshBoardCard(srcUniv); _refreshBoardCard(targetUniv);
        _brdToast(`✅ "${playerName}" → "${targetUniv}" 이동 완료`);
        return;
      }
      // 같은 대학 내 순서 변경 (칩은 flex wrap이라 DOM 순서 변경이 시각적으로 반영됨)
      const allItems = [...body.querySelectorAll('.brd-row[data-player], .brd-chip[data-player]')];
      const si=allItems.indexOf(_brdRowDragSrc), di=allItems.indexOf(row);
      if(si>=0 && di>=0 && si!==di){
        if(si<di) row.after(_brdRowDragSrc); else row.before(_brdRowDragSrc);
        const newOrder=[...body.querySelectorAll('.brd-row[data-player], .brd-chip[data-player]')].map(r=>r.dataset.player);
        boardPlayerOrder[targetUniv]=newOrder;
        saveBoardPlayerOrder();
      }
    });
  });
}

// ── 외부 img를 data URL로 변환 (가능한 것만 변환, 실패/타임아웃 시 원본 유지) ──
const _imgDataUrlCache = (window._imgDataUrlCache = window._imgDataUrlCache || {});
const _imgDataUrlInflight = (window._imgDataUrlInflight = window._imgDataUrlInflight || {});
const _imgDataUrlCacheOrder = (window._imgDataUrlCacheOrder = window._imgDataUrlCacheOrder || []);
async function _imgToDataUrls(container, timeoutMs=8000, onProgress) {
  const imgs = [...container.querySelectorAll('img')];
  const maxConcurrent = 20;
  let idx = 0;
  let doneCount = 0;

  const stripProto = (u) => String(u||'').replace(/^https?:\/\//i, '');
  // 캐시버스트는 직접 요청 실패 후 재시도 때만 사용 (브라우저 HTTP 캐시 보존)
  const withCacheBust = (u) => {
    const s = String(u||'');
    return s + (s.includes('?') ? '&' : '?') + '_x=' + Date.now();
  };

  // 동일 URL 중복 변환 방지: inflight Promise 공유
  const _inflight = {};

  async function convertOne(img){
    return await new Promise(resolve => {
      // Add null/undefined check for img element
      if (!img || typeof img !== 'object') { resolve(); return; }
      
      let src0 = img.getAttribute('src') || '';
      if (!src0 || src0.startsWith('data:') || src0.startsWith('blob:')) { resolve(); return; }
      try{
        if(typeof toHttpsUrl === 'function'){
          const s2 = toHttpsUrl(src0);
          if(s2 && s2 !== src0){
            src0 = s2;
            try{ img.setAttribute('src', s2); }catch(e){}
          }
        }
      }catch(e){}

      // 1) 세션 캐시 히트 → 즉시 반환
      try{
        const cached = _imgDataUrlCache[src0];
        if(cached && typeof cached === 'string' && cached.startsWith('data:image/')){
          img.src = cached;
          resolve();
          return;
        }
      }catch(e){}

      // 2) 동일 URL을 다른 worker가 이미 변환 중이면 그 결과를 기다림 (중복 네트워크 요청 방지)
      if(_inflight[src0]){
        _inflight[src0].then(dataUrl => {
          if(dataUrl) try{ img.src = dataUrl; }catch(e){}
          resolve();
        }).catch(()=>resolve());
        return;
      }

      let done = false;
      let inflightResolve;
      const inflightPromise = new Promise(r => { inflightResolve = r; });
      _inflight[src0] = inflightPromise;

      const finish = (dataUrl) => {
        if(!done){
          done = true;
          try{ inflightResolve(dataUrl||null); }catch(e){}
          try{ delete _inflight[src0]; }catch(e){}
          resolve();
        }
      };
      const t = setTimeout(() => { finish(null); }, timeoutMs);

      // 직접 요청 먼저 → 실패 시에만 캐시버스트/프록시 사용 (불필요한 네트워크 호출 감소)
      const tryUrls = [src0];
      // 실패 시에만 추가 URL 시도
      const fallbackUrls = [
        withCacheBust(src0),
        'https://images.weserv.nl/?url=' + encodeURIComponent(stripProto(src0)) + '&n=-1&cb=' + Date.now(),
      ];

      let attempt = 0;
      const tryLoad = () => {
        if(done) return;
        let url;
        if (attempt === 0) {
          url = tryUrls[attempt++];
        } else {
          // 실패 시에만 fallback URL 사용
          url = fallbackUrls[attempt - 1] || null;
        }
        if(!url){ clearTimeout(t); finish(null); return; }

        const loader = new Image();
        loader.crossOrigin = 'anonymous';
        loader.onload = () => {
          if(done) return;
          if (!loader.naturalWidth || !loader.naturalHeight) { 
            if (attempt === 0) {
              tryLoad(); // 첫 시도 실패 시 fallback 시도
            } else {
              finish(null); // fallback 실패 시 종료
            }
            return; 
          }
          try{
            const cv = document.createElement('canvas');
            if (!cv) { tryLoad(); return; }
            cv.width  = loader.naturalWidth;
            cv.height = loader.naturalHeight;
            const ctx2d = cv.getContext('2d');
            if (!ctx2d) { tryLoad(); return; }
            ctx2d.drawImage(loader, 0, 0);
            // PNG 대신 WebP(지원 시) 또는 JPEG로 인코딩 → data URL 크기·속도 대폭 개선
            // 품질을 낮춰서 속도 향상 (0.88 → 0.75)
            const _supportsWebP = (()=>{ 
              try{ 
                const testCanvas = document.createElement('canvas');
                if (!testCanvas) return false;
                return testCanvas.toDataURL('image/webp').startsWith('data:image/webp'); 
              }catch(e){ return false; } 
            })();
            const dataUrl = _supportsWebP
              ? cv.toDataURL('image/webp', 0.75)
              : cv.toDataURL('image/jpeg', 0.75);
            if(!dataUrl || dataUrl === 'data:,') { tryLoad(); return; }
            if (img && typeof img === 'object') {
              img.src = dataUrl;
            }
            try{
              if(!_imgDataUrlCache[src0]) _imgDataUrlCacheOrder.push(src0);
              _imgDataUrlCache[src0] = dataUrl;
              if(_imgDataUrlCacheOrder.length > 1000){
                const drop = _imgDataUrlCacheOrder.shift();
                if(drop) delete _imgDataUrlCache[drop];
              }
            }catch(e){}
            clearTimeout(t);
            finish(dataUrl);
          }catch(e){
            tryLoad();
          }
        };
        loader.onerror = () => { tryLoad(); };
        loader.src = url;
      };

      tryLoad();
    });
  }

  async function worker(){
    while(true){
      const i = idx++;
      if(i >= imgs.length) break;
      try{ await convertOne(imgs[i]); }catch(e){}
      doneCount++;
      if(typeof onProgress === 'function'){
        try{ onProgress(doneCount, imgs.length); }catch(e){}
      }
    }
  }

  const workers = Array.from({length: Math.min(maxConcurrent, imgs.length)}, () => worker());
  await Promise.all(workers);
}

async function _precacheImgDataUrl(src0, timeoutMs){
  const key = String(src0||'');
  if(!key) return false;
  if(_imgDataUrlCache[key] && String(_imgDataUrlCache[key]).startsWith('data:image/')) return true;
  if(_imgDataUrlInflight[key]) return await _imgDataUrlInflight[key];

  const stripProto = (u) => String(u||'').replace(/^https?:\/\//i, '');
  const withCacheBust = (u) => {
    const s = String(u||'');
    return s + (s.includes('?') ? '&' : '?') + '_x=' + Date.now();
  };

  const p = new Promise((resolve) => {
    let src = key;
    try{
      if(typeof toHttpsUrl === 'function'){
        const s2 = toHttpsUrl(src);
        if(s2) src = s2;
      }
    }catch(e){}

    if(_imgDataUrlCache[src] && String(_imgDataUrlCache[src]).startsWith('data:image/')){ resolve(true); return; }

    const tryUrls = [];
    tryUrls.push(withCacheBust(src));
    tryUrls.push('https://images.weserv.nl/?url=' + encodeURIComponent(stripProto(src)) + '&n=-1&cb=' + Date.now());
    tryUrls.push('https://corsproxy.io/?' + encodeURIComponent(src));

    let attempt = 0;
    let done = false;
    const finish = (ok) => { if(!done){ done = true; resolve(!!ok); } };
    const t = setTimeout(() => finish(false), Math.max(1200, timeoutMs||8000));

    const tryLoad = () => {
      if(done) return;
      const url = tryUrls[attempt++];
      if(!url){ clearTimeout(t); finish(false); return; }
      const loader = new Image();
      loader.crossOrigin = 'anonymous';
      loader.onload = () => {
        if(done) return;
        if(!loader.naturalWidth || !loader.naturalHeight){ tryLoad(); return; }
        try{
          const cv = document.createElement('canvas');
          cv.width = loader.naturalWidth;
          cv.height = loader.naturalHeight;
          const ctx = cv.getContext('2d');
          ctx.drawImage(loader, 0, 0);
          const _supportsWebP = (()=>{ try{ return document.createElement('canvas').toDataURL('image/webp').startsWith('data:image/webp'); }catch(e){ return false; } })();
          const dataUrl = _supportsWebP
            ? cv.toDataURL('image/webp', 0.88)
            : cv.toDataURL('image/jpeg', 0.88);
          if(!dataUrl || dataUrl === 'data:,'){ tryLoad(); return; }
          try{
            if(!_imgDataUrlCache[src]) _imgDataUrlCacheOrder.push(src);
            _imgDataUrlCache[src] = dataUrl;
            if(_imgDataUrlCacheOrder.length > 500){
              const drop = _imgDataUrlCacheOrder.shift();
              if(drop) delete _imgDataUrlCache[drop];
            }
          }catch(e){}
          clearTimeout(t);
          finish(true);
        }catch(e){
          tryLoad();
        }
      };
      loader.onerror = () => { tryLoad(); };
      loader.src = url;
    };

    tryLoad();
  }).finally(()=>{ try{ delete _imgDataUrlInflight[key]; }catch(e){} });

  _imgDataUrlInflight[key] = p;
  return await p;
}

window._precacheVisibleImages = window._precacheVisibleImages || function(container, limit){
  try{
    if(!container || !container.querySelectorAll) return;
    const max = Math.max(1, parseInt(limit, 10) || 160);
    const urls = [];
    const seen = new Set();
    container.querySelectorAll('img[src]').forEach(img=>{
      const src = img.getAttribute('src') || '';
      if(!src || src.startsWith('data:') || src.startsWith('blob:')) return;
      let s = src;
      try{ if(typeof toHttpsUrl === 'function') s = toHttpsUrl(s) || s; }catch(e){}
      if(seen.has(s)) return;
      seen.add(s);
      if(_imgDataUrlCache[s] && String(_imgDataUrlCache[s]).startsWith('data:image/')) return;
      urls.push(s);
    });
    if(!urls.length) return;
    const list = urls.slice(0, max);
    const run = async () => {
      const conc = 4;
      let i = 0;
      const worker = async () => {
        while(true){
          const k = i++;
          if(k >= list.length) break;
          try{ await _precacheImgDataUrl(list[k], 8000); }catch(e){}
        }
      };
      await Promise.all(Array.from({length: Math.min(conc, list.length)}, () => worker()));
    };
    if('requestIdleCallback' in window){
      try{ window.requestIdleCallback(()=>{ run(); }, {timeout: 1200}); }catch(e){ setTimeout(()=>{ run(); }, 60); }
    } else {
      setTimeout(()=>{ run(); }, 60);
    }
  }catch(e){}
};

async function _waitForImages(container, timeoutMs){
  const ms = Math.max(300, parseInt(timeoutMs, 10) || 900);
  const imgs = container ? [...container.querySelectorAll('img[src]')] : [];
  if(!imgs.length) return true;
  const tasks = imgs.map(img=>{
    try{
      // Add null/undefined checks for img element
      if (!img || typeof img !== 'object') return Promise.resolve(false);
      if(img.complete && img.naturalWidth > 0) return Promise.resolve(true);
      if(typeof img.decode === 'function'){
        return img.decode().then(()=>true).catch(()=>false);
      }
    }catch(e){}
    return new Promise(resolve=>{
      let done = false;
      const fin = (ok)=>{ if(done) return; done=true; resolve(!!ok); };
      try{
        if (img && typeof img === 'object') {
          img.addEventListener('load', ()=>fin(true), {once:true});
          img.addEventListener('error', ()=>fin(false), {once:true});
        } else {
          fin(false);
        }
      }catch(e){ fin(false); }
      setTimeout(()=>fin(false), ms);
    });
  });
  await Promise.race([Promise.allSettled(tasks), new Promise(r=>setTimeout(r, ms))]);
  return true;
}

// ── canvas → PNG 다운로드 (toBlob+ObjectURL 방식: 대용량 PNG에 안정적) ──
async function _dlCanvasBoard(canvas, filename) {
  if (!canvas || canvas.width === 0 || canvas.height === 0) {
    alert('이미지 생성 실패: 캔버스가 비어있습니다. 다시 시도해주세요.');
    return false;
  }
  const pngName = filename.replace(/\.jpg$/i, '.png');
  const showOverlay = (src) => {
    try{
      const old = document.getElementById('__img_save_overlay');
      if(old) old.remove();
      const ov = document.createElement('div');
      ov.id = '__img_save_overlay';
      ov.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.72);z-index:999999;display:flex;align-items:center;justify-content:center;padding:16px;';
      const safeName = String(pngName||'image.png').replace(/</g,'&lt;').replace(/>/g,'&gt;');
      ov.innerHTML = `
        <div style="width:min(980px,96vw);max-height:92vh;background:#0b1220;border-radius:var(--r2);overflow:hidden;border:1px solid rgba(255,255,255,.12);box-shadow:0 18px 60px rgba(0,0,0,.45);display:flex;flex-direction:column">
          <div style="display:flex;gap:10px;align-items:center;padding:12px 14px;background:rgba(15,23,42,.92);color:#fff">
            <div style="font-weight:900;font-size:var(--fs-base)">이미지 저장</div>
            <div style="font-size:var(--fs-sm);opacity:.8">자동 다운로드가 막혔습니다. PC는 우클릭 저장 / 모바일은 길게 눌러 저장</div>
            <a href="${src}" download="${safeName}" style="margin-left:auto;text-decoration:none;color:#fff;background:#2563eb;border:1px solid rgba(255,255,255,.14);border-radius:var(--r);padding:6px 10px;font-weight:900;font-size:var(--fs-sm)">다운로드</a>
            <button id="__img_save_overlay_close" style="border:1px solid rgba(255,255,255,.16);background:rgba(255,255,255,.06);color:#fff;border-radius:var(--r);padding:6px 10px;font-weight:900;cursor:pointer;font-size:var(--fs-sm)">닫기</button>
          </div>
          <div style="padding:12px;overflow:auto;background:#111">
            <img src="${src}" style="max-width:100%;display:block;margin:0 auto;border-radius:12px;background:#111">
          </div>
        </div>
      `;
      ov.addEventListener('click', (e)=>{ if(e.target===ov) ov.remove(); });
      document.body.appendChild(ov);
      const btn = document.getElementById('__img_save_overlay_close');
      if(btn) btn.onclick = ()=>ov.remove();
    }catch(e){}
  };
  const preWin = (() => {
    try{
      const w = window.__captureDlWin;
      if(w && !w.closed) return w;
    }catch(e){}
    return null;
  })();
  try{ window.__captureDlWin = null; }catch(e){}

  if (!preWin && typeof window._saveCanvasImage === 'function') {
    await window._saveCanvasImage(canvas, pngName, 'png');
    return true;
  }

  const showInWindow = (src, isBlobUrl) => {
    if(!preWin) return;
    try{
      if(isBlobUrl){
        try{ preWin.location.href = src; }catch(e){}
        return;
      }
      preWin.document.open();
      preWin.document.write('<html><head><meta charset="utf-8"><title>이미지 저장</title></head>'
        + '<body style="margin:0;background:#111;color:#fff;font-family:sans-serif">'
        + '<div style="padding:12px;font-size:var(--fs-base)">이미지가 자동 다운로드되지 않으면, 아래 이미지를 길게 눌러 저장하세요.</div>'
        + '<img src="' + src + '" style="max-width:100%;display:block;margin:0 auto">'
        + '</body></html>');
      preWin.document.close();
    }catch(e){}
  };

  const tryDownload = (href) => {
    try{
      const a = document.createElement('a');
      a.href = href;
      a.download = pngName;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => { try{ document.body.removeChild(a); }catch(e){} }, 300);
      return true;
    }catch(e){
      return false;
    }
  };

  return await new Promise((resolve) => {
    try{
      canvas.toBlob(blob => {
        if (!blob) {
          try {
            const dataUrl = canvas.toDataURL('image/png');
            if (!dataUrl || dataUrl === 'data:,') { alert('이미지 저장 실패: 빈 이미지입니다.'); resolve(false); return; }
            const ok = tryDownload(dataUrl);
            if(!ok && !preWin){
              let w = null;
              try{ w = window.open(dataUrl, '_blank', 'noopener'); }catch(e){}
              if(!w) showOverlay(dataUrl);
            }
            showInWindow(dataUrl, false);
            resolve(true);
          } catch(e) {
            const msg = (e && e.message) ? e.message : String(e||'오류');
            if (/insecure|security/i.test(msg)) {
              alert('이미지 저장 실패: 보안 정책(CORS)으로 인해 캔버스를 저장할 수 없습니다.\n\n외부 이미지(프로필/로고/배경)가 포함되어 있으면 저장이 차단될 수 있습니다.');
            } else {
              alert('이미지 저장 실패: ' + msg);
            }
            resolve(false);
          }
          return;
        }
        const url = URL.createObjectURL(blob);
        const ok = tryDownload(url);
        if(!ok && !preWin){
          let w = null;
          try{ w = window.open(url, '_blank', 'noopener'); }catch(e){}
          if(!w) showOverlay(url);
        }
        if(preWin){
          showInWindow(url, true);
          setTimeout(() => { try{ URL.revokeObjectURL(url); }catch(e){} }, 120000);
        }else{
          setTimeout(() => { try{ URL.revokeObjectURL(url); }catch(e){} }, 800);
        }
        resolve(true);
      }, 'image/png');
    }catch(e){
      const msg = (e && e.message) ? e.message : String(e||'오류');
      if (/insecure|security/i.test(msg)) {
        alert('이미지 저장 실패: 보안 정책(CORS)으로 인해 캔버스를 저장할 수 없습니다.\n\n외부 이미지(프로필/로고/배경)가 포함되어 있으면 저장이 차단될 수 있습니다.');
      } else {
        alert('이미지 저장 실패: ' + msg);
      }
      resolve(false);
    }
  });
}

// ── html2canvas 캡처 후 저장 ──────────────────────────────────────
async function _captureAndSave(tmpDiv, w, h, filename) {
  try{ await (window.ensureHtml2Canvas && window.ensureHtml2Canvas()); }catch(e){}
  if (typeof html2canvas !== 'function') throw new Error('html2canvas를 불러오지 못했습니다.');
  try{
    // 레이아웃 강제 flush: 고정 80ms×2 대신 rAF 2프레임으로 최소 대기
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
    if(typeof _applyBoardBgAutoSizing === 'function') _applyBoardBgAutoSizing(tmpDiv);
    if(typeof _b2ApplyBgAutoSizing === 'function') _b2ApplyBgAutoSizing(tmpDiv);
    await new Promise(r => requestAnimationFrame(r));
  }catch(e){}

  try{
    const imgs = tmpDiv.querySelectorAll('img').length;
    const t = document.getElementById('_save-toast');
    if(imgs && t) t.innerHTML = '<span style="display:inline-block;animation:_spin .8s linear infinite">⏳</span> 이미지 변환 (0/'+imgs+')';
  }catch(e){}
  await _imgToDataUrls(tmpDiv, 12000, (done, total)=>{
    try{
      const t = document.getElementById('_save-toast');
      if(t) t.innerHTML = '<span style="display:inline-block;animation:_spin .8s linear infinite">⏳</span> 이미지 변환 ('+done+'/'+total+')';
    }catch(e){}
  });

  // 다크모드 CSS(body.dark .brd-card filter 등)가 export에 적용되지 않도록 일시 해제
  const wasDark = document.body.classList.contains('dark');
  if (wasDark) document.body.classList.remove('dark');

  try {
    const t = document.getElementById('_save-toast');
    if(t) t.innerHTML = '<span style="display:inline-block;animation:_spin .8s linear infinite">⏳</span> 캡처 중...';
    try{ await _waitForImages(tmpDiv, 1500); }catch(e){}
    const bg = (() => {
      try{
        const c = window.getComputedStyle ? getComputedStyle(tmpDiv).backgroundColor : '';
        if (c && c !== 'transparent' && c !== 'rgba(0, 0, 0, 0)') return c;
      }catch(e){}
      return '#f0f2f5';
    })();
    const makeOnClone = (aggressive) => {
      return function(clonedDoc){
        try{
          if(clonedDoc && clonedDoc.adoptedStyleSheets && clonedDoc.adoptedStyleSheets.length){
            try{ clonedDoc.adoptedStyleSheets = []; }catch(e){}
          }
        }catch(e){}
        if(!aggressive) return;
        try{ clonedDoc.querySelectorAll('svg').forEach(el => el.remove()); }catch(e){}
        try{
          clonedDoc.querySelectorAll('img').forEach(img => {
            try{
              const src = String(img.getAttribute('src') || img.src || '');
              if(!src) return;
              if(src.includes('data:image/svg+xml') || /\.svg(\?|#|$)/i.test(src)){
                img.style.display = 'none';
              }
            }catch(e){}
          });
        }catch(e){}
        try{
          clonedDoc.querySelectorAll('[style*="background-image"]').forEach(el => {
            try{
              const bi = String(el.style && el.style.backgroundImage ? el.style.backgroundImage : '');
              if(bi && bi.includes('url(') && !bi.includes('data:image/')) el.style.backgroundImage = 'none';
            }catch(e){}
          });
        }catch(e){}
      };
    };

    const baseOpts = {
      scale: 1,
      backgroundColor: bg,
      logging: false,
      imageTimeout: 20000,
      width: w,
      height: h,
      windowWidth: w + 100,
      windowHeight: h + 100,
      x: 0, y: 0, scrollX: 0, scrollY: 0
    };

    const isWaterfox = /waterfox/i.test(navigator.userAgent);
    const isFirefox = /firefox/i.test(navigator.userAgent);
    
    const attempts = [
      { useCORS: true, allowTaint: false, foreignObjectRendering: false, onclone: makeOnClone(false) },
      { useCORS: true, allowTaint: false, foreignObjectRendering: true, onclone: makeOnClone(false) },
      { useCORS: true, allowTaint: false, foreignObjectRendering: false, onclone: makeOnClone(true), ignoreElements: (el)=> el && el.tagName && el.tagName.toLowerCase() === 'svg' },
      ...(isWaterfox || isFirefox ? [
        { useCORS: true, allowTaint: false, foreignObjectRendering: false, onclone: makeOnClone(true),
          ignoreElements: (el)=> {
            if (!el || !el.tagName) return false;
            const tag = el.tagName.toLowerCase();
            if (tag === 'svg') return true;
            if (tag === 'img') {
              try{
                const src = String(el.getAttribute('src') || el.src || '');
                if(src && src.includes('://') && !src.includes(window.location.hostname) && !src.startsWith('data:')) return true;
              }catch(e){}
            }
            if (el.style && el.style.backgroundImage && String(el.style.backgroundImage).includes('url(') && !String(el.style.backgroundImage).includes('data:image/')) {
              return true;
            }
            return false;
          }
        }
      ] : [])
    ];

    let canvas = null;
    let lastErr = null;
    for(const opt of attempts){
      try{
        canvas = await html2canvas(tmpDiv, { ...baseOpts, ...opt });
        if (canvas && canvas.width > 0 && canvas.height > 0) { lastErr = null; break; }
        lastErr = new Error('캔버스 생성 실패');
      }catch(e){
        lastErr = e;
        const msg = _captureErrText(e);
        if(msg.includes("can't access property \"type\"") || msg.includes("can't access property 'type'")){
          continue;
        }
        if(msg === '[object Event]' || msg.startsWith('이벤트 오류(')){
          continue;
        }
        break;
      }
    }
    if(lastErr) throw new Error(_captureErrText(lastErr));
    if (!canvas || canvas.width === 0 || canvas.height === 0) throw new Error('캔버스 생성 실패');
    let ok = await _dlCanvasBoard(canvas, filename);
    if(!ok){
      // "The operation is insecure."(Firefox) 등 CORS/보안 이슈로 저장 실패하면,
      // 외부 리소스를 제거한 안전 캡처로 1회 재시도
      try{
        tmpDiv.querySelectorAll('img').forEach(img => {
          try{
            const src = String(img.getAttribute('src') || img.src || '');
            if(!src) return;
            const host = String(window.location.hostname||'');
            const safe = src.startsWith('data:') || src.startsWith('blob:') || (host && src.includes(host));
            if(!safe) img.style.display = 'none';
          }catch(e){}
        });
        tmpDiv.querySelectorAll('[style*="background-image"]').forEach(el => {
          try{
            const bi = String(el.style && el.style.backgroundImage ? el.style.backgroundImage : '');
            if(bi && bi.includes('url(') && !bi.includes('data:image/')) el.style.backgroundImage = 'none';
          }catch(e){}
        });
      }catch(e){}
      const canvas2 = await html2canvas(tmpDiv, { ...baseOpts, useCORS: true, allowTaint: false, foreignObjectRendering: false, onclone: makeOnClone(true) });
      if (!canvas2 || canvas2.width === 0 || canvas2.height === 0) throw new Error('캔버스 생성 실패');
      ok = await _dlCanvasBoard(canvas2, filename);
      if(!ok) throw new Error('이미지 저장 실패');
    }
  } finally {
    // 다크모드 클래스 복원
    if (wasDark) document.body.classList.add('dark');
  }
}

// 전체저장: board-wrap 클론 후 단일 캡처 (카운터 없음)
async function downloadBoardAll(){
  const btn=event?.currentTarget;
  if(btn){btn.disabled=true;btn._ot=btn.textContent;btn.textContent='⏳...';}
  const tmpDiv=document.createElement('div');
  try{
    try{ await (window.ensureHtml2Canvas && window.ensureHtml2Canvas()); }catch(e){}
    if (typeof html2canvas !== 'function') throw new Error('html2canvas를 불러오지 못했습니다.');
    const boardWrap=document.getElementById('board-wrap');
    if(!boardWrap||!boardWrap.children.length){alert('표시 중인 현황판이 없습니다.');return;}
    const bw=boardWrap.scrollWidth||900;
    tmpDiv.style.cssText=`position:absolute;left:-9999px;top:0;width:${bw}px;background:#f0f2f5;font-family:'Noto Sans KR',sans-serif;box-sizing:border-box;`;
    // rcont의 <style> 블록도 클론에 포함 (brd-card 등 현황판 전용 스타일)
    const rcont=document.getElementById('rcont');
    const brdStyle=rcont?rcont.querySelector('style'):null;
    tmpDiv.innerHTML=(brdStyle?brdStyle.outerHTML:'')+boardWrap.innerHTML;
    tmpDiv.querySelectorAll('.no-export,.no-export-movebtns').forEach(el=>el.remove());
    // 숨김 대학 카드 제거 (이미지 저장 시 항상 제외)
    tmpDiv.querySelectorAll('.brd-card').forEach(card=>{
      const uObj=univCfg.find(x=>x.name===card.dataset.univ);
      if(uObj&&uObj.hidden)card.remove();
    });
    document.body.appendChild(tmpDiv);
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));

    await _imgToDataUrls(tmpDiv, 12000);

    const wasDark=document.body.classList.contains('dark');
    if(wasDark)document.body.classList.remove('dark');
    try{
      const w=tmpDiv.scrollWidth||bw;
      const h=Math.max(tmpDiv.scrollHeight,tmpDiv.offsetHeight,200);
      const canvas=await html2canvas(tmpDiv,{
        scale:1,useCORS:true,allowTaint:false,
        backgroundColor:'#f0f2f5',logging:false,imageTimeout:20000,
        width:w,height:h,windowWidth:w+200,windowHeight:h+200
      });
      if(!canvas||canvas.width===0||canvas.height===0)throw new Error('캔버스 생성 실패');
      await _dlCanvasBoard(canvas,'현황판_전체저장.png');
    }finally{if(wasDark)document.body.classList.add('dark');}
  }catch(e){alert('다운로드 실패: '+e.message);}
  finally{
    if(tmpDiv.parentNode)document.body.removeChild(tmpDiv);
    if(btn){btn.disabled=false;btn.textContent=btn._ot||btn.textContent;}
  }
}

// 포인트 순 전체 랭킹 뷰
function buildBoardRankViewHTML(univs){
  // 전체 선수 포인트 순 정렬
  const univNames=new Set(univs.map(u=>u.name));
  const allPlayers=(players||[]).filter(p=>p.univ&&univNames.has(p.univ)&&(p.win||0)+(p.loss||0)>0)
    .map(p=>({...p,_univ:p.univ,_col:gc(p.univ)}));
  allPlayers.sort((a,b)=>(b.points||0)-(a.points||0));
  if(!allPlayers.length) return `<div style="padding:40px;text-align:center;color:var(--gray-l)">스트리머 없음</div>`;
  const TIER_ICONS={'G':'👑','K':'🌟','JA':'⚡','J':'🔥','S':'💎','0티어':'⭐','1티어':'🥇','2티어':'🥈','3티어':'🥉'};
  let h=`<div style="background:var(--white);border-radius:14px;border:1px solid var(--border);overflow:hidden">
    <div style="padding:14px 18px;font-weight:900;font-size:var(--fs-md);color:var(--blue);border-bottom:2px solid var(--blue-ll)">🏅 포인트 순 전체 랭킹</div>
    <table style="width:100%;border-collapse:collapse">
      <thead><tr style="background:var(--bg2)">
        <th style="padding:8px 12px;text-align:center;font-size:var(--fs-sm);color:var(--text3)">순위</th>
        <th style="padding:8px 12px;text-align:left;font-size:var(--fs-sm);color:var(--text3)">선수</th>
        <th style="padding:8px 12px;text-align:left;font-size:var(--fs-sm);color:var(--text3)">대학</th>
        <th style="padding:8px 12px;text-align:center;font-size:var(--fs-sm);color:var(--text3)">티어</th>
        <th style="padding:8px 12px;text-align:center;font-size:var(--fs-sm);color:var(--text3)">승</th>
        <th style="padding:8px 12px;text-align:center;font-size:var(--fs-sm);color:var(--text3)">패</th>
        <th style="padding:8px 12px;text-align:center;font-size:var(--fs-sm);color:var(--text3)">포인트</th>
      </tr></thead><tbody>`;
  allPlayers.forEach((p,i)=>{
    const tierIcon=TIER_ICONS[p.tier]||'';
    const rnk=i===0?`<span class="rk1">1</span>`:i===1?`<span class="rk2">2</span>`:i===2?`<span class="rk3">3</span>`:`<span style="font-weight:700">${i+1}</span>`;
    const pts=p.points||0;
    const ptsCol=pts>0?'#16a34a':pts<0?'#dc2626':'#64748b';
    const pNameJs = (typeof escJS==='function')
      ? escJS(p.name)
      : String(p.name||'').replace(/\\/g,'\\\\').replace(/'/g,"\\'").replace(/\r/g,'\\r').replace(/\n/g,'\\n');
    const univNameJs = (typeof escJS==='function')
      ? escJS(p._univ)
      : String(p._univ||'').replace(/\\/g,'\\\\').replace(/'/g,"\\'").replace(/\r/g,'\\r').replace(/\n/g,'\\n');
    h+=`<tr style="border-top:1px solid var(--border)">
      <td style="padding:7px 12px;text-align:center">${rnk}</td>
      <td style="padding:7px 12px;text-align:left">
        <div style="display:flex;align-items:center;gap:6px;cursor:pointer" onclick="openPlayerModal('${pNameJs}')">
          ${getPlayerPhotoHTML(p.name,'24px')}
          <span style="font-weight:700;font-size:var(--fs-base)">${p.name||''}</span>
        </div>
      </td>
      <td style="padding:7px 12px">
        <span class="ubadge clickable-univ" style="background:${p._col};font-size:10px;padding:2px 7px" onclick="openUnivModal('${univNameJs}')">${p._univ||''}</span>
      </td>
      <td style="padding:7px 12px;text-align:center;font-size:var(--fs-sm)">${tierIcon}${p.tier||''}</td>
      <td style="padding:7px 12px;text-align:center;color:#16a34a;font-weight:700">${p.win||0}</td>
      <td style="padding:7px 12px;text-align:center;color:#dc2626;font-weight:700">${p.loss||0}</td>
      <td style="padding:7px 12px;text-align:center;font-weight:900;font-size:14px;color:${ptsCol}">${pts>0?'+':''}${pts}</td>
    </tr>`;
  });
  h+=`</tbody></table></div>`;
  return h;
}

// 대학별 다운
async function downloadBoardSel(){
  const btn=event?.currentTarget;
  if(btn){btn.disabled=true;btn._ot=btn.textContent;btn.textContent='⏳...';}
  const tmpDiv=document.createElement('div');
  try{
    if(!boardSelUniv||boardSelUniv==='전체'){alert('대학을 선택하세요.');return;}
    const u=getAllUnivs().find(x=>x.name===boardSelUniv);
    if(!u){alert('해당 대학을 찾을 수 없습니다.');return;}
    const boardWrap=document.getElementById('board-wrap');
    if(boardWrap){
      const card=_findBrdCardByUniv(boardSelUniv, boardWrap);
      if(card){
        const domOrder=[...card.querySelectorAll('[data-player]')].map(el=>el.dataset.player).filter(Boolean);
        if(domOrder.length>0) boardPlayerOrder[boardSelUniv]=domOrder;
      }
    }
    tmpDiv.style.cssText='position:absolute;left:-9999px;top:0;width:900px;background:#f0f2f5;padding:12px;font-family:\'Noto Sans KR\',sans-serif;box-sizing:border-box;';
    const rcontSel=document.getElementById('rcont');
    const brdStyleSel=rcontSel?rcontSel.querySelector('style'):null;
    tmpDiv.innerHTML=(brdStyleSel?brdStyleSel.outerHTML:'')+buildUnivBoardCard(u, true);
    tmpDiv.querySelectorAll('.no-export,.no-export-movebtns').forEach(el=>el.remove());
    document.body.appendChild(tmpDiv);
    injectUnivIcons(tmpDiv);
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
    void tmpDiv.getBoundingClientRect();
    const selW = tmpDiv.offsetWidth || 900;
    const selH = Math.max(tmpDiv.scrollHeight, tmpDiv.offsetHeight, 100);
    await _captureAndSave(tmpDiv, selW, selH, '현황판_'+boardSelUniv+'.png');
  }catch(e){alert('다운로드 실패: '+e.message);}
  finally{
    if(tmpDiv.parentNode) document.body.removeChild(tmpDiv);
    if(btn){btn.disabled=false;btn.textContent=btn._ot||btn.textContent;}
  }
}

// ═══════════════════════════════════════════════════════════════
// 자동 동기화 (폴링) 기능 - GitHub 데이터 변경 자동 감지
// ═══════════════════════════════════════════════════════════════
let _autoSyncTimer = null;
let _lastRemoteSavedAt = 0;

// 원격 저장소의 savedAt 체크 (경량)
async function _checkRemoteSavedAt() {
  try {
    const urls = [
      GITHUB_JSON_URL + '?_=' + Date.now(),
      'https://cdn.jsdelivr.net/gh/nada1004/star-system@main/star-datacenter/data.json?_=' + Date.now()
    ];
    for (const url of urls) {
      try {
        const res = await fetch(url, { cache: 'no-store', mode: 'cors', signal: AbortSignal.timeout(8000) });
        if (!res.ok) continue;
        const text = (await res.text()).replace(/^\uFEFF/, '').trim();
        const raw = JSON.parse(text);
        return Number(raw && raw.savedAt || 0) || 0;
      } catch (e) { continue; }
    }
  } catch (e) {}
  return 0;
}

// 모달이 열려있거나(사용자가 상세 화면을 보는 중) 텍스트를 입력하는 중이면
// 자동 동기화로 화면을 통째로 다시 그리는 것은 다음 주기로 미룬다.
// (전체 재렌더가 프로필 이미지 DOM을 새로 만들어 깜빡임/작업 중단을 유발하므로)
function _autoSyncShouldDefer() {
  try {
    const active = document.activeElement;
    if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.isContentEditable)) {
      return true;
    }
    const openModal = Array.from(document.querySelectorAll('.modal,[id$="Modal"],[id$="modal"]'))
      .find(el => {
        const st = window.getComputedStyle(el);
        return st.display !== 'none' && st.visibility !== 'hidden';
      });
    if (openModal) return true;
  } catch (e) {}
  return false;
}

// 자동 동기화 실행
async function _autoSyncCheck() {
  if (!_boardCanManage()) return; // 로그인/권한 체크
  if (window._isSaving) return; // 현재 저장 중이면 스킵
  
  try {
    const remoteAt = await _checkRemoteSavedAt();
    if (!remoteAt) return;
    
    _lastRemoteSavedAt = remoteAt;
    
    // 로컬 저장 시간 확인
    const localSavedAt = Math.max(
      Number(window._lastAdminSaveTime || 0) || 0,
      Number(localStorage.getItem('su_last_admin_save') || 0) || 0,
      Number(window._lastAppliedSavedAt || 0) || 0
    );
    
    // 원격에 더 새로운 데이터가 있으면 자동으로 불러오기
    if (remoteAt > localSavedAt + 3000) { // 3초 여유
      if (_autoSyncShouldDefer()) {
        console.log('[autoSync] 모달/입력 중 - 이번 주기는 보류 (다음 30초에 재시도)');
        return;
      }
      console.log('[autoSync] 원격에 새 데이터 감지 - 자동 동기화 시작');
      
      // 자동으로 데이터 불러오기 (confirm 없이 조용히)
      if (typeof window._autoSyncApply === 'function') {
        try {
          await window._autoSyncApply();
          console.log('[autoSync] 자동 동기화 완료');
          // 알림 토스트
          if (typeof showToast === 'function') {
            showToast('✅ 다른 기기의 변경 사항이 자동으로 동기화되었습니다.', 3000);
          }
        } catch (e) {
          console.error('[autoSync] 자동 동기화 실패:', e);
          
          // 실패 시 수동 불러오기 버튼 표시
          const statusEl = document.getElementById('cloudStatus');
          if (statusEl) {
            statusEl.style.color = '#2563eb';
            statusEl.innerHTML = `🔄 GitHub에 새 데이터 있음 <button onclick="window.cloudLoad()" style="margin-left:6px;padding:2px 8px;border:1px solid #2563eb;border-radius:4px;background:#eff6ff;color:#2563eb;font-size:var(--fs-caption);cursor:pointer">불러오기</button>`;
          }
        }
      }
    }
  } catch (e) {
    console.warn('[autoSync] 체크 실패:', e);
  }
}

// 탭 복귀/포커스 시 즉시 동기화 체크
(function(){
  const _onVisible = ()=>{ try{ if(typeof _autoSyncCheck==='function') _autoSyncCheck(); }catch(e){} };
  document.addEventListener('visibilitychange', ()=>{ if(document.visibilityState==='visible') _onVisible(); });
  window.addEventListener('focus', _onVisible);
})();

// 자동 동기화 시작 (30초마다 체크)
function startAutoSync() {
  if (_autoSyncTimer) clearInterval(_autoSyncTimer);
  _autoSyncTimer = setInterval(_autoSyncCheck, 30 * 1000); // 30초
  console.log('[autoSync] 자동 동기화 시작 (30초 간격)');
}

// 자동 동기화 중지
function stopAutoSync() {
  if (_autoSyncTimer) {
    clearInterval(_autoSyncTimer);
    _autoSyncTimer = null;
    console.log('[autoSync] 자동 동기화 중지');
  }
}

// 페이지 로드 후 자동 시작 + 저장 완료 후 재시작 (통합)
window.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    if (typeof isLoggedIn !== 'undefined' && isLoggedIn) {
      startAutoSync();
      setTimeout(_autoSyncCheck, 5000);
    }
    // 저장 완료 후 30초 뒤 동기화 체크 (GitHub 반영 대기)
    const _origSave = window.fbCloudSave;
    if (_origSave) {
      window.fbCloudSave = async function(...args) {
        const result = await _origSave.apply(this, args);
        setTimeout(_autoSyncCheck, 30000);
        return result;
      };
    }
  }, 2000);
}, { once: true });

(function() {
})();
