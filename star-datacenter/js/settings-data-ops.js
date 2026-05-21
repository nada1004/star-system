

// ── 설정/메모 동기화(GitHub Gist) 상태 패널 ──
window.cfgRenderGistSyncStatus = function(){
  const box=document.getElementById('cfg-gist-sync-status');
  if(!box) return;
  if(!window.SettingsStore){
    box.innerHTML = `<span style="color:var(--red);font-weight:900">⚠️ SettingsStore 모듈이 없습니다.</span>`;
    return;
  }
  const st = (typeof window.SettingsStore.getSyncStatus==='function')
    ? window.SettingsStore.getSyncStatus()
    : { enabled: localStorage.getItem('al_sync_enabled')==='1', gistId: localStorage.getItem('al_gist_id')||'', tokenSet: !!localStorage.getItem('al_github_token'), isAdmin: (typeof isLoggedIn!=='undefined'&&isLoggedIn)&&(!(typeof isSubAdmin!=='undefined'&&isSubAdmin)) };

  // 입력값 채우기
  try{
    const gid=document.getElementById('cfg-gist-id'); if(gid) gid.value = st.gistId || '';
    const en=document.getElementById('cfg-gist-enabled'); if(en) en.checked = !!st.enabled;
  }catch(e){}

  const parts=[];
  parts.push(`<div><b>동기화</b>: ${st.enabled?'ON':'OFF'} ${st.isAdmin?'(관리자 저장 가능)':'(읽기만 가능)'}</div>`);
  parts.push(`<div><b>Gist ID</b>: ${st.gistId?`<code>${st.gistId}</code>`:'<span style="color:var(--gray-l)">미설정</span>'}</div>`);
  parts.push(`<div><b>토큰</b>: ${st.tokenSet?'✅ 설정됨':'미설정'}</div>`);
  if(st.remoteMode) parts.push(`<div><b>원격 파일</b>: ${st.remoteMode==='legacy'?'legacy(자동 마이그레이션 대상)':'su_settings.json'}</div>`);
  if(st.lastPull) parts.push(`<div><b>마지막 불러오기</b>: ${st.lastPull}</div>`);
  if(st.lastPush) parts.push(`<div><b>마지막 저장</b>: ${st.lastPush}</div>`);
  if(st.migrated) parts.push(`<div><b>마이그레이션</b>: ✅ 수행됨</div>`);
  if(st.lastError) parts.push(`<div style="color:var(--red)"><b>최근 오류</b>: ${esc(String(st.lastError))}</div>`);
  box.innerHTML = parts.join('');
};

window.cfgGistSyncSaveCfg = function(){
  if(!window.SettingsStore) return alert('SettingsStore 모듈이 없습니다.');
  const gid=(document.getElementById('cfg-gist-id')?.value||'').trim();
  const tok=(document.getElementById('cfg-gist-token')?.value||'').trim();
  const enEl=document.getElementById('cfg-gist-enabled');
  const en = enEl ? !!enEl.checked : (window.SettingsStore.cfg().enabled);
  const patch={};
  if(gid) patch.gistId=gid;
  if(typeof en !== 'undefined') patch.enabled=en;
  // 보안: 토큰은 입력했을 때만 업데이트(빈 값은 "유지")
  if(tok) patch.token=tok;
  try{
    window.SettingsStore.setCfg(patch);
    const msg=document.getElementById('cfg-gist-sync-msg');
    if(msg) msg.textContent='✅ 저장됨';
  }catch(e){
    alert('저장 실패: '+e.message);
  }
  try{ window.cfgRenderGistSyncStatus(); }catch(e){}
};

// (요청사항) 설정 변경 자동 저장(원격/Gist) 토글
window.cfgGistSyncSetAutoPush = function(on){
  try{
    if(!window.SettingsStore) return;
    if(!window.SettingsStore.isAdmin()) return;
    window.SettingsStore.setPrefsAutoPush(!!on);
    const msg=document.getElementById('cfg-gist-sync-msg');
    if(msg) msg.textContent = on ? '✅ 자동 저장 ON' : '자동 저장 OFF';
  }catch(e){}
  try{ window.cfgRenderGistSyncStatus(); }catch(e){}
};

// 설정 UI에서 변경이 발생했을 때 "prefs" 동기화 타임스탬프 갱신 + (옵션) 자동 저장
window.cfgTouchPrefsSync = function(){
  try{
    if(window.SettingsStore && typeof window.SettingsStore.markPrefsChanged==='function'){
      window.SettingsStore.markPrefsChanged();
    }
  }catch(e){}
};

window.cfgGistSyncPull = async function(){
  const msg=document.getElementById('cfg-gist-sync-msg');
  if(msg) msg.textContent='불러오는 중...';
  try{
    if(!window.SettingsStore) throw new Error('SettingsStore 모듈이 없습니다.');
    const info = await window.SettingsStore.pull({ returnInfo:true });
    if(msg) msg.textContent = info && info.migrated ? '✅ 불러오기 완료 (+마이그레이션 완료)' : '✅ 불러오기 완료';
    try{ if(typeof showToast==='function') showToast('✅ 원격 설정 불러오기 완료'); }catch(e){}
  }catch(e){
    if(msg) msg.textContent='❌ 실패: '+e.message;
    try{ if(typeof showToast==='function') showToast('❌ 불러오기 실패: '+e.message); }catch(_){}
  }
  try{ window.cfgRenderGistSyncStatus(); }catch(e){}
};

window.cfgGistSyncPush = async function(){
  const msg=document.getElementById('cfg-gist-sync-msg');
  if(msg) msg.textContent='저장하는 중...';
  try{
    if(!window.SettingsStore) throw new Error('SettingsStore 모듈이 없습니다.');
    if(!window.SettingsStore.isAdmin()) throw new Error('관리자만 저장할 수 있습니다.');
    await window.SettingsStore.push();
    if(msg) msg.textContent='✅ 원격 저장 완료';
    try{ if(typeof showToast==='function') showToast('☁️ 다른 기기에도 반영됨'); }catch(e){}
  }catch(e){
    if(msg) msg.textContent='❌ 실패: '+e.message;
    try{ if(typeof showToast==='function') showToast('❌ 저장 실패: '+e.message); }catch(_){}
  }
  try{ window.cfgRenderGistSyncStatus(); }catch(e){}
};

function renderStorageInfo(){
  const el=document.getElementById('cfg-storage-info');
  if(!el)return;
  try{
    let total=0;const rows=[];
    const LEGACY_KEYS=['su_mm','su_um','su_cm','su_ck','su_pro','su_ptn','su_tn','su_ttm','su_indm','su_gjm','su_hist_ext_data_v1'];
    const legacyRows=[];
    for(let i=0;i<localStorage.length;i++){
      const k=localStorage.key(i);const v=localStorage.getItem(k)||'';
      const bytes=(k.length+v.length)*2;total+=bytes;
      if(k.startsWith('su_'))rows.push({k,bytes});
      if(LEGACY_KEYS.includes(k) && v) legacyRows.push({k,bytes});
    }
    rows.sort((a,b)=>b.bytes-a.bytes);
    legacyRows.sort((a,b)=>b.bytes-a.bytes);
    const limit=5*1024*1024;
    const pct=Math.min(100,Math.round(total/limit*100));
    const barCol=pct>=90?'#dc2626':pct>=70?'#f59e0b':'#22c55e';
    const fmt=b=>b>=1024*1024?(b/1024/1024).toFixed(2)+'MB':b>=1024?(b/1024).toFixed(1)+'KB':b+'B';
    const enc = v => {
      try{ return new Blob([JSON.stringify(v??null)]).size; }catch(e){ return 0; }
    };
    const matchMeta = (()=>{ try{ return JSON.parse(localStorage.getItem('su_match_store_meta_v1')||'null')||{}; }catch(e){ return {}; } })();
    const histMeta = (()=>{ try{ return JSON.parse(localStorage.getItem('su_hist_ext_meta_v1')||'null')||{}; }catch(e){ return {}; } })();
    const backendBadge = (label, backend) => {
      const isIdb = backend==='indexedDB';
      const text = backend==='localStorage' ? 'localStorage fallback' : isIdb ? 'IndexedDB' : '미확인';
      const bg = backend==='localStorage' ? '#fff7ed' : isIdb ? '#ecfdf5' : '#f1f5f9';
      const col = backend==='localStorage' ? '#c2410c' : isIdb ? '#047857' : '#64748b';
      return `<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;padding:6px 8px;border:1px solid var(--border);border-radius:8px;background:${bg}">
        <span style="font-size:11px;color:var(--text2)">${label}</span>
        <span style="font-size:11px;font-weight:800;color:${col}">${text}</span>
      </div>`;
    };
    const matchSnap = (window.MatchStore && typeof window.MatchStore.snapshot==='function') ? window.MatchStore.snapshot() : null;
    const histExtSnap = (typeof window._histExtLoad==='function') ? _histExtLoad() : null;
    const idbRows = [];
    if(matchSnap){
      const matchBytes = enc(matchSnap);
      const matchCount =
        (matchSnap.miniM?.length||0)+(matchSnap.univM?.length||0)+(matchSnap.comps?.length||0)+
        (matchSnap.ckM?.length||0)+(matchSnap.proM?.length||0)+(matchSnap.proTourneys?.length||0)+
        (matchSnap.tourneys?.length||0)+(matchSnap.ttM?.length||0)+(matchSnap.indM?.length||0)+
        (matchSnap.gjM?.length||0);
      idbRows.push({label:'경기 기록 원본', bytes:matchBytes, count:matchCount});
    }
    if(histExtSnap){
      const extBytes = enc(histExtSnap);
      const extCount = Array.isArray(histExtSnap.items) ? histExtSnap.items.length : 0;
      idbRows.push({label:'외부탭 기록', bytes:extBytes, count:extCount});
    }
    const idbTotal = idbRows.reduce((s,r)=>s+r.bytes,0);
    const LABELS={
      'su_p':'선수 데이터',
      'su_pp':'선수 사진',
      'su_mm':'미니대전(레거시)',
      'su_um':'대학대전(레거시)',
      'su_ck':'대학CK(레거시)',
      'su_pro':'프로리그(레거시)',
      'su_cm':'대회(레거시)',
      'su_tn':'토너먼트(레거시)',
      'su_ttm':'티어대회(레거시)',
      'su_indm':'개인전(레거시)',
      'su_gjm':'끝장전(레거시)',
      'su_hist_ext_data_v1':'외부탭 데이터(레거시)',
      'su_match_store_meta_v1':'경기기록 IndexedDB 메타',
      'su_hist_ext_meta_v1':'외부탭 IndexedDB 메타',
      'su_mb':'회원관리',
      'su_notices':'공지',
      'su_psi':'상태아이콘'
    };
    el.innerHTML=`
    <div style="margin-bottom:10px">
      <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:5px">
        <span style="font-weight:700;color:var(--text)">${fmt(total)} / 5MB 사용</span>
        <span style="font-weight:700;color:${barCol}">${pct}%</span>
      </div>
      <div style="height:10px;border-radius:5px;background:var(--border2);overflow:hidden">
        <div style="height:100%;width:${pct}%;background:${barCol};border-radius:5px;transition:.3s"></div>
      </div>
      ${pct>=70?`<div style="font-size:11px;color:${barCol};margin-top:5px;font-weight:600">${pct>=90?'⚠️ 저장 공간이 거의 가득 찼습니다! 데이터를 정리해 주세요.':'⚠️ 저장 공간이 많이 사용되고 있습니다.'}</div>`:''}
    </div>
    <div style="font-size:11px;color:var(--gray-l);margin-bottom:4px">항목별 사용량 (상위 10개)</div>
      <div style="font-size:10px;color:var(--gray-l);margin-bottom:8px">기본 저장소는 <b>IndexedDB</b>이며, 아래 localStorage 사용량은 주로 설정/레거시 키 기준입니다. IndexedDB가 불가능한 환경에서만 localStorage fallback이 사용됩니다.</div>
    <div style="display:flex;flex-direction:column;gap:6px;margin-bottom:10px">
      ${backendBadge('경기 기록 저장소', matchMeta.backend||'')}
      ${backendBadge('외부탭 기록 저장소', histMeta.backend||'')}
    </div>
    ${idbRows.length?`<div style="margin-bottom:10px;padding:10px;border:1px solid var(--border);background:var(--surface);border-radius:10px">
      <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:6px">
        <div style="font-size:12px;font-weight:800;color:var(--text2)">IndexedDB 사용량 추정</div>
        <div style="font-size:11px;color:var(--gray-l)">합계 약 ${fmt(idbTotal)}</div>
      </div>
      <div style="font-size:10px;color:var(--gray-l);margin-bottom:6px">실제 브라우저 내부 저장 오버헤드는 제외한 JSON 기준 추정치입니다.</div>
      <div style="display:flex;flex-direction:column;gap:5px">
        ${idbRows.map(r=>`<div style="display:flex;align-items:center;gap:6px">
          <span style="min-width:110px;color:var(--text2)">${r.label}</span>
          <div style="flex:1;height:6px;border-radius:3px;background:var(--border2);overflow:hidden">
            <div style="height:100%;width:${idbTotal?Math.max(4,Math.round(r.bytes/idbTotal*100)):0}%;background:#34d399;border-radius:3px"></div>
          </div>
          <span style="min-width:60px;text-align:right;color:var(--gray-l)">${fmt(r.bytes)}</span>
          <span style="min-width:46px;text-align:right;color:var(--gray-l)">${r.count||0}건</span>
        </div>`).join('')}
      </div>
    </div>`:''}
    <div style="margin-bottom:10px;padding:10px;border:1px solid var(--border);background:var(--surface);border-radius:10px">
      <div style="font-size:12px;font-weight:800;color:var(--text2);margin-bottom:6px">저장소 관리</div>
      <div style="font-size:10px;color:var(--gray-l);margin-bottom:8px">기록 원본은 기본적으로 IndexedDB에 저장됩니다. 문제가 있을 때 현재 메모리 데이터를 다시 저장소에 안전하게 다시 기록합니다. 기록 삭제 기능은 설정에서 제공하지 않습니다.</div>
      <div style="display:flex;flex-wrap:wrap;gap:6px">
        <button class="btn btn-w btn-xs" onclick="rebuildIndexedDbStores()">IndexedDB 재빌드</button>
      </div>
    </div>
    ${legacyRows.length?`<div style="margin-bottom:8px;padding:8px 10px;border:1px solid #fcd34d;background:#fffbeb;border-radius:8px">
      <div style="font-size:11px;font-weight:800;color:#92400e;margin-bottom:4px">레거시 저장 키가 남아 있습니다</div>
      <div style="font-size:10px;color:#a16207;margin-bottom:6px">${legacyRows.map(r=>LABELS[r.k]||r.k).join(', ')}</div>
      <button class="btn btn-w btn-xs" onclick="cleanupLegacyMatchStorageKeys()">레거시 키 정리</button>
    </div>`:''}
    <div style="font-size:11px;line-height:1.8">
      ${rows.slice(0,10).map(({k,bytes})=>{
        const label=LABELS[k]||k;
        const bpct=Math.min(100,Math.round(bytes/limit*100));
        return `<div style="display:flex;align-items:center;gap:6px;margin-bottom:3px">
          <span style="min-width:100px;color:var(--text2)">${label}</span>
          <div style="flex:1;height:6px;border-radius:3px;background:var(--border2);overflow:hidden"><div style="height:100%;width:${bpct}%;background:#60a5fa;border-radius:3px"></div></div>
          <span style="min-width:55px;text-align:right;color:var(--gray-l)">${fmt(bytes)}</span>
        </div>`;
      }).join('')}
    </div>`;
  }catch(e){el.innerHTML='<div style="color:var(--gray-l);font-size:12px">사용량 계산 불가</div>';}
}
function cleanupLegacyMatchStorageKeys(){
  const keys=['su_mm','su_um','su_cm','su_ck','su_pro','su_ptn','su_tn','su_ttm','su_indm','su_gjm','su_hist_ext_data_v1'];
  let removed=0;
  keys.forEach(k=>{
    try{
      if(localStorage.getItem(k)!==null){
        localStorage.removeItem(k);
        removed++;
      }
    }catch(e){}
  });
  try{ renderStorageInfo(); }catch(e){}
  alert(removed?`레거시 저장 키 ${removed}개를 정리했습니다.`:'정리할 레거시 저장 키가 없습니다.');
}
async function rebuildIndexedDbStores(){
  try{
    let msgs=[];
    if(window.MatchStore && typeof window.MatchStore.rebuild==='function'){
      const r=await window.MatchStore.rebuild();
      msgs.push(`경기 기록: ${r.backend||'unknown'}`);
    }
    if(window.HistoryExternalUtils && typeof window.HistoryExternalUtils.rebuildStorage==='function'){
      const r=await window.HistoryExternalUtils.rebuildStorage();
      msgs.push(`외부탭: ${r.backend||'unknown'}`);
    }
    renderStorageInfo();
    alert(`재빌드를 완료했습니다.\n${msgs.join('\n')}`);
  }catch(e){
    alert('재빌드 중 오류가 발생했습니다.');
  }
}

// ── 이미지탭 레이아웃 저장 함수 ──
function saveB2LayoutSettings(){
  const settings = {
    autoResize: document.getElementById('cfg-b2-auto-resize')?.checked !== false,
    autoHeight: document.getElementById('cfg-b2-auto-height')?.checked !== false,
    leftSize: parseInt(document.getElementById('cfg-b2-left-size')?.value) || 55,
    rightSize: parseInt(document.getElementById('cfg-b2-right-size')?.value) || 45,
    pcHeight: parseInt(document.getElementById('cfg-b2-pc-height')?.value) || 600,
    mobileHeight: parseInt(document.getElementById('cfg-b2-mobile-height')?.value) || 320,
    tabletHeight: parseInt(document.getElementById('cfg-b2-tablet-height')?.value) || 400
  };
  localStorage.setItem('su_b2_layout', JSON.stringify(settings));
  if(typeof save==='function')save();
  alert('이미지탭 레이아웃이 저장되었습니다.');
  if(typeof render === 'function') render();
  // board2 탭이 열려있으면 다시 렌더링
  if(typeof _b2View !== 'undefined' && document.getElementById('b2-content')) {
    document.getElementById('b2-content').innerHTML = _b2PlayersView();
    if(_b2SelectedPlayer) _b2UpdateMainDisplay(_b2SelectedPlayer.name);
  }
}

// ── 구현황판 밝기 저장 함수 ──
function saveOldDashboardBrightness(){
  const labelAlpha = parseInt(document.getElementById('cfg-b2-label-alpha')?.value) || 16;
  const bgAlpha = parseInt(document.getElementById('cfg-b2-bg-alpha')?.value) || 9;
  localStorage.setItem('su_b2la', labelAlpha);
  localStorage.setItem('su_b2ba', bgAlpha);
  if(typeof save==='function')save();
  alert('구현황판 밝기 설정이 저장되었습니다.');
  if(typeof render === 'function') render();
}

// ── 이미지 설정 저장 함수 ──
function saveImageSettings(){
  const rawPrev = (()=>{ try{ return JSON.parse(localStorage.getItem('su_img_settings')||'{}')||{}; }catch(e){ return {}; } })();
  const settings = {
    fill: document.getElementById('cfg-img-fill')?.checked || false,
    scale: parseFloat(document.getElementById('cfg-img-scale')?.value) || 1,
    brightness: parseFloat(document.getElementById('cfg-img-brightness')?.value) || 1,
    scaleMb: parseFloat(document.getElementById('cfg-img-scale-left')?.value) || 1,
    scaleTb: parseFloat(document.getElementById('cfg-img-scale-tablet')?.value) || 1,
    scalePc: parseFloat(document.getElementById('cfg-img-scale-right')?.value) || 1,
    randomRotation: document.getElementById('cfg-img-random')?.checked || false,
    interval: parseInt(document.getElementById('cfg-img-interval')?.value) || 5,
    __byDevice: {
      mb: { scale: parseFloat(document.getElementById('cfg-img-scale-left')?.value) || 1 },
      tb: { scale: parseFloat(document.getElementById('cfg-img-scale-tablet')?.value) || 1 },
      pc: { scale: parseFloat(document.getElementById('cfg-img-scale-right')?.value) || 1 }
    }
  };
  const normalizedSettings = (typeof suNormalizeImgSettings==='function') ? suNormalizeImgSettings({...rawPrev, ...settings, __byDevice: settings.__byDevice}) : settings;
  localStorage.setItem('su_img_settings', JSON.stringify(normalizedSettings));
  try{
    const pd = JSON.parse(localStorage.getItem('su_pd_style')||'{}')||{};
    delete pd.img_fill;
    localStorage.setItem('su_pd_style', JSON.stringify(pd));
  }catch(e){}
  
  // 이미지탭(board2)과 동기화를 위한 저장
  const raw = (()=>{ try{ return JSON.parse(localStorage.getItem('su_b2_global_img_settings')||'{}')||{}; }catch(e){ return {}; } })();
  const b2Raw = (typeof suBuildBoard2ImgSettingsFromProfile==='function')
    ? suBuildBoard2ImgSettingsFromProfile(normalizedSettings, raw)
    : raw;
  localStorage.setItem('su_b2_global_img_settings', JSON.stringify(b2Raw));
  
  if(typeof save==='function')save();
  if(typeof render === 'function') render();
  try{
    const pm = document.getElementById('playerModal');
    const pst = (typeof getPlayerDetailState==='function') ? getPlayerDetailState() : (window.PlayerDetailState||{});
    if(pm && pm.style.display !== 'none' && pst.currentName && typeof openPlayerModal==='function'){
      openPlayerModal(pst.currentName);
    }
  }catch(e){}
  try{
    const um = document.getElementById('univModal');
    const ust = (typeof getUnivDetailState==='function') ? getUnivDetailState() : (window.UnivDetailState||{});
    if(um && um.style.display !== 'none' && ust.currentName && typeof openUnivModal==='function'){
      openUnivModal(ust.currentName);
    }
  }catch(e){}
  alert('이미지 설정이 저장되었습니다.');
}

// ── 우클릭 이미지 조절 메뉴 ──
// tier-tour.js 등 다른 스크립트와 전역 식별자 충돌 방지
let _settingsImgContextMenuEl = null;
let _currentImageTarget = null;

function showImageContextMenu(e, imgElement){
  e.preventDefault();
  _currentImageTarget = imgElement;
  
  // 기존 메뉴 제거
  if(_settingsImgContextMenuEl){
    _settingsImgContextMenuEl.remove();
  }
  
  const menu = document.createElement('div');
  menu.style.cssText = `
    position: fixed;
    left: ${e.clientX}px;
    top: ${e.clientY}px;
    background: var(--white);
    border: 1px solid var(--border2);
    border-radius: 8px;
    padding: 8px 0;
    min-width: 180px;
    z-index: 10000;
    box-shadow: 0 4px 20px rgba(0,0,0,0.15);
  `;
  
  const imgSettings = JSON.parse(localStorage.getItem('su_img_settings')||'{}');
  const currentScale = imgElement.dataset.scale || imgSettings.scale || 1;
  const currentBrightness = imgElement.dataset.brightness || imgSettings.brightness || 1;
  
  menu.innerHTML = `
    <div style="padding: 8px 16px; font-size: 12px; font-weight: 700; color: var(--text2); border-bottom: 1px solid var(--border);">
      🖼️ 이미지 조절
    </div>
    <div style="padding: 8px 16px;">
      <label style="font-size: 11px; font-weight: 600; color: var(--text3); display: block; margin-bottom: 4px;">크기: <span id="ctx-scale-val">${currentScale}x</span></label>
      <input type="range" id="ctx-scale" min="0.5" max="3" step="0.1" value="${currentScale}" style="width: 100%;" oninput="document.getElementById('ctx-scale-val').textContent=this.value+'x'">
    </div>
    <div style="padding: 8px 16px;">
      <label style="font-size: 11px; font-weight: 600; color: var(--text3); display: block; margin-bottom: 4px;">밝기: <span id="ctx-bright-val">${currentBrightness}x</span></label>
      <input type="range" id="ctx-bright" min="0.3" max="2" step="0.1" value="${currentBrightness}" style="width: 100%;" oninput="document.getElementById('ctx-bright-val').textContent=this.value+'x'">
    </div>
    <div style="padding: 8px 16px; border-top: 1px solid var(--border);">
      <button onclick="applyImageContextStyle()" style="width: 100%; padding: 6px 12px; background: var(--blue); color: #fff; border: none; border-radius: 6px; font-size: 12px; font-weight: 600; cursor:pointer;">✅ 적용</button>
    </div>
  `;
  
  document.body.appendChild(menu);
  _settingsImgContextMenuEl = menu;
  
  // 메뉴 외부 클릭 시 닫기
  setTimeout(()=>{
    const closeMenu = (ev)=>{
      if(!menu.contains(ev.target)){
        menu.remove();
        _settingsImgContextMenuEl = null;
        document.removeEventListener('click', closeMenu);
      }
    };
    document.addEventListener('click', closeMenu);
  }, 0);
}

function applyImageContextStyle(){
  if(!_currentImageTarget) return;
  
  const scale = document.getElementById('ctx-scale')?.value || 1;
  const brightness = document.getElementById('ctx-bright')?.value || 1;
  
  _currentImageTarget.style.transform = `scale(${scale})`;
  _currentImageTarget.style.filter = `brightness(${brightness})`;
  _currentImageTarget.dataset.scale = scale;
  _currentImageTarget.dataset.brightness = brightness;
  
  if(_settingsImgContextMenuEl){
    _settingsImgContextMenuEl.remove();
    _settingsImgContextMenuEl = null;
  }
}

// ── 랜덤 이미지 회전 ──
let _randomRotationTimer = null;

function startRandomRotation(){
  stopRandomRotation();
  const imgSettings = JSON.parse(localStorage.getItem('su_img_settings')||'{}');
  if(!imgSettings.randomRotation) return;
  
  const interval = (imgSettings.interval || 5) * 1000;
  
  _randomRotationTimer = setInterval(()=>{
    rotateRandomImage();
  }, interval);
}

function stopRandomRotation(){
  if(_randomRotationTimer){
    clearInterval(_randomRotationTimer);
    _randomRotationTimer = null;
  }
}

function rotateRandomImage(){
  const imgSettings = JSON.parse(localStorage.getItem('su_img_settings')||'{}');
  if(!imgSettings.randomRotation) return;
  
  // 랜덤 스트리머 선택
  if(players && players.length > 0){
    const randomPlayer = players[Math.floor(Math.random() * players.length)];
    
    // 전체대학 보기
    if(currentTab === 'total'){
      const imgContainer = document.querySelector('.random-image-container');
      if(imgContainer && randomPlayer.photo){
        imgContainer.src = toHttpsUrl(randomPlayer.photo);
      }
    }
    
    // 이미지탭(board2)
    const b2MainImg = document.getElementById('b2-main-img-1');
    if(b2MainImg && randomPlayer.photo && typeof _b2UpdateMainDisplay === 'function'){
      _b2UpdateMainDisplay(randomPlayer.name);
    }
  }
}

// 현재 탭 추적
let currentTab = 'total';

// 탭 변경 시 회전 제어
if(!window.__swWrappedForSettings){
  const originalSw = window.sw;
  window.sw = function(tab, el){
    currentTab = tab;
    const ret = originalSw ? originalSw.apply(this, arguments) : undefined;
    let imgSettings = {};
    try{
      imgSettings = JSON.parse(localStorage.getItem('su_img_settings')||'{}') || {};
    }catch(e){
      imgSettings = {};
    }
    try{
      if(imgSettings.randomRotation){
        startRandomRotation();
      } else {
        stopRandomRotation();
      }
    }catch(e){}
    return ret;
  };
  window._cfgSecDescMap={
    notice:'팝업 공지와 공지 노출 관리',
    tier:'점수, 티어 기준, 랭킹 규칙',
    season:'시즌 구간과 기간 관리',
    teammatch:'팀전/대학전 경기 규칙',
    acct:'관리자 계정과 접근 설정',
    univ:'대학 정보와 기본 색상',
    maps:'맵 목록과 표시명 관리',
    mAlias:'맵 별칭/약자 자동 인식',
    si:'상태 아이콘 목록 관리',
    paste:'붙여넣기 자동 인식 규칙',
    b2layout:'이미지 탭 레이아웃 조절',
    imgsettings:'이미지 탭 이미지 표시 설정',
    imgmodalsettings:'스트리머 상세 이미지 설정',
    profileshape:'프로필 모양/반경/표시 방식',
    pdModeBadge:'최근 경기 종목 배지 색상',
    pd:'스트리머 상세 카드 디자인',
    matchdetail:'경기 상세 팝업 디자인',
    univlogoimg:'대학 로고 URL과 로고 자산',
    b2femco:'펨코/신현황판 표시 방식',
    femcoorder:'현황판 대학 순서 정렬',
    boardchip:'현황판 프로필/로고/칩 크기',
    oldbright:'현황판 밝기/배경 톤',
    boardbg:'현황판 배경 이미지와 라벨 배경',
    tablabels:'메인/서브 탭 이름 변경',
    uisize:'PC/태블릿/모바일 UI 크기',
    siAssign:'스트리머별 상태 아이콘 지정',
    cfgmenu:'설정 하위 메뉴 이름/순서 정리',
    autofitall:'화면별 자동 맞춤',
    reccard:'기록 카드 스타일',
    tourneycard:'대회 카드 스타일',
    sharecard:'공유카드 모드/색상/프로필 크기',
    calui:'캘린더 날짜칩/공유 버튼',
    appfont:'전역 폰트와 크기',
    bgm:'유튜브 BGM 관리',
    soopmv:'SOOP 멀티뷰',
    pasteRoute:'붙여넣기 분기 자동화',
    designv2:'전역 디자인 모드',
    hdr:'헤더 상단바 디자인',
    fab:'플로팅 버튼 구성',
    storage:'저장소/백업 확인',
    selfcheck:'설정 진단과 점검',
    sync:'동기화 기본 설정',
    firebase:'GitHub 동기화',
    bulkdate:'날짜 일괄 수정',
    bulkmap:'맵 일괄 수정',
    bulktier:'티어 일괄 수정',
    bulkdel:'기록 일괄 삭제',
    bulkconv:'기록 형식 변환'
  };
  window.__swWrappedForSettings = true;
}

function bulkChangeTier(){
  if(!isLoggedIn) return;
  const fromTier=document.getElementById('bulk-tier-from')?.value||'';
  const toTier=document.getElementById('bulk-tier-to')?.value||'';
  const targetUniv=document.getElementById('bulk-tier-univ')?.value||'';
  if(!toTier){alert('변경할 티어를 선택하세요.');return;}
  const targets=players.filter(p=>{
    if(fromTier && (p.tier||'미정')!==fromTier) return false;
    if(targetUniv && p.univ!==targetUniv) return false;
    return true;
  });
  if(!targets.length){alert('해당하는 선수가 없습니다.');return;}
  if(!confirm(`${targets.length}명의 티어를 '${toTier}'으로 변경할까요?\n\n${targets.slice(0,5).map(p=>p.name).join(', ')}${targets.length>5?` 외 ${targets.length-5}명`:''}`)) return;
  targets.forEach(p=>{ p.tier=toTier; });
  save(); render();
  const el=document.getElementById('bulk-tier-result');
  if(el){ el.textContent=`✅ ${targets.length}명 변경 완료!`; setTimeout(()=>{if(el)el.textContent='';},3000); }
}

/* ══════════════════════════════════════
   경기 일괄 수정 함수들
══════════════════════════════════════ */
function bulkConvertToGameScore(){
  if(!isLoggedIn) return;
  const arrMap = {mini:miniM, univm:univM, ck:ckM, pro:proM, tt:ttM};
  const targets = ['mini','univm','ck','pro','tt'].filter(m=>document.getElementById('bulk-conv-chk-'+m)?.checked);
  if(!targets.length){ alert('대상을 선택하세요.'); return; }

  let converted = 0;
  targets.forEach(key=>{
    const arr = arrMap[key]||[];
    arr.forEach(m=>{
      if(!m.sets||!m.sets.length) return;
      const gA = m.sets.reduce((s,st)=>s+(st.scoreA||0),0);
      const gB = m.sets.reduce((s,st)=>s+(st.scoreB||0),0);
      // 세트 수와 다를 때만 변환
      if(gA!==m.sa||gB!==m.sb){
        m.sa=gA; m.sb=gB;
        m.scoreMode='game';
        converted++;
      }
    });
  });

  // 대회(tourneys) 조별리그도 변환
  (tourneys||[]).forEach(tn=>{
    if(!tn.groups) return;
    tn.groups.forEach(grp=>{
      (grp.matches||[]).forEach(m=>{
        if(!m.sets||!m.sets.length) return;
        const gA=m.sets.reduce((s,st)=>s+(st.scoreA||0),0);
        const gB=m.sets.reduce((s,st)=>s+(st.scoreB||0),0);
        if(gA!==m.sa||gB!==m.sb){
          m.sa=gA; m.sb=gB;
          m.scoreMode='game';
          converted++;
        }
      });
    });
    // 브라켓 경기도 변환
    const br=tn.bracket||{};
    Object.values(br.matchDetails||{}).forEach(m=>{
      if(!m||!m.sets||!m.sets.length) return;
      const gA=m.sets.reduce((s,st)=>s+(st.scoreA||0),0);
      const gB=m.sets.reduce((s,st)=>s+(st.scoreB||0),0);
      if(gA!==m.sa||gB!==m.sb){
        m.sa=gA; m.sb=gB;
        m.scoreMode='game';
        converted++;
      }
    });
    (br.manualMatches||[]).forEach(m=>{
      if(!m.sets||!m.sets.length) return;
      const gA=m.sets.reduce((s,st)=>s+(st.scoreA||0),0);
      const gB=m.sets.reduce((s,st)=>s+(st.scoreB||0),0);
      if(gA!==m.sa||gB!==m.sb){
        m.sa=gA; m.sb=gB;
        m.scoreMode='game';
        converted++;
      }
    });
  });

  if(converted===0){
    const el=document.getElementById('bulk-conv-result');
    if(el) el.textContent='변환할 경기가 없습니다. (이미 게임수 합산으로 저장됨)';
    return;
  }
  save(); render();
  const el=document.getElementById('bulk-conv-result');
  if(el) el.textContent='✅ '+converted+'건 변환 완료!';
  setTimeout(()=>{ if(el) el.textContent=''; }, 3000);
}

// (요청사항) 저장된 점수 방식(scoreMode: set/game)에 맞춰 sa/sb를 일괄 재계산
// - 세트로 저장된 기록은 세트승으로, 경기제로 저장된 기록은 게임수 합산으로 정리
// - scoreMode 미설정(old data)은 sets 기반으로 추정(set wins 합이 2 이상이면 set, 아니면 game)
function bulkRecalcScoreByMode(){
  if(!isLoggedIn) return;
  const arrMap = {mini:miniM, univm:univM, ck:ckM, pro:proM, tt:ttM};
  const targets = ['mini','univm','ck','pro','tt'].filter(m=>document.getElementById('bulk-conv-chk-'+m)?.checked);
  if(!targets.length){ alert('대상을 선택하세요.'); return; }

  const _calc = (sets, mode)=>{
    let sa=0, sb=0;
    (sets||[]).forEach(st=>{
      if(!st) return;
      const games = Array.isArray(st.games) ? st.games : [];
      const scoreA = (st.scoreA!=null) ? Number(st.scoreA) : games.filter(g=>g && g.winner==='A').length;
      const scoreB = (st.scoreB!=null) ? Number(st.scoreB) : games.filter(g=>g && g.winner==='B').length;
      let w = st.winner;
      if(!w) w = scoreA>scoreB?'A':scoreB>scoreA?'B':'';
      if(mode==='set'){
        if(w==='A') sa += 1;
        else if(w==='B') sb += 1;
      }else{
        sa += (isNaN(scoreA)?0:scoreA);
        sb += (isNaN(scoreB)?0:scoreB);
      }
    });
    return {sa, sb};
  };
  const _inferMode = (m)=>{
    const sm = (m && m.scoreMode) ? String(m.scoreMode) : '';
    if(sm==='set' || sm==='game') return sm;
    const sets = Array.isArray(m?.sets) ? m.sets : [];
    let wA=0, wB=0;
    sets.forEach(st=>{
      if(!st) return;
      const w = st.winner || ((st.scoreA||0)>(st.scoreB||0)?'A':(st.scoreB||0)>(st.scoreA||0)?'B':'');
      if(w==='A') wA++; else if(w==='B') wB++;
    });
    return (wA+wB>=2) ? 'set' : 'game';
  };

  let changed=0, setCnt=0, gameCnt=0;
  const _applyToMatch = (m)=>{
    if(!m || !m.sets || !m.sets.length) return;
    const mode = _inferMode(m);
    const sc = _calc(m.sets, mode);
    const need = (m.sa!==sc.sa || m.sb!==sc.sb) || (m.scoreMode!==mode);
    if(!need) return;
    m.sa = sc.sa;
    m.sb = sc.sb;
    m.scoreMode = mode;
    changed++;
    if(mode==='set') setCnt++; else gameCnt++;
  };

  targets.forEach(key=>{
    (arrMap[key]||[]).forEach(_applyToMatch);
  });
  // 대회(tourneys)도 포함
  (tourneys||[]).forEach(tn=>{
    if(tn?.groups){
      tn.groups.forEach(grp=>{
        (grp?.matches||[]).forEach(_applyToMatch);
      });
    }
    const br=tn?.bracket||{};
    Object.values(br.matchDetails||{}).forEach(_applyToMatch);
    (br.manualMatches||[]).forEach(_applyToMatch);
  });

  const el=document.getElementById('bulk-conv3-result');
  if(changed===0){
    if(el) el.textContent='재계산할 항목이 없습니다. (이미 저장형식대로 정리됨)';
    return;
  }
  save(); render();
  if(el) el.textContent=`✅ ${changed}건 재계산 완료! (세트제 ${setCnt} / 경기제 ${gameCnt})`;
  setTimeout(()=>{ if(el) el.textContent=''; }, 3500);
}

// (요청사항) 경기 기록을 "세트제(세트 승리 수)" 스코어로 일괄 변환
// - sets 배열 기반으로 sa/sb를 (세트 승)으로 재계산
// - 기존 sa/sb가 게임수로 저장된 경우를 한번에 수정하기 위함
function bulkConvertToSetScore(){
  if(!isLoggedIn) return;
  const arrMap = {mini:miniM, univm:univM, ck:ckM, pro:proM, tt:ttM};
  const targets = ['mini','univm','ck','pro','tt'].filter(m=>document.getElementById('bulk-conv-chk-'+m)?.checked);
  if(!targets.length){ alert('대상을 선택하세요.'); return; }

  const _setWins = (sets)=>{
    let sa=0, sb=0;
    (sets||[]).forEach(st=>{
      if(!st) return;
      const w = st.winner || ((st.scoreA||0)>(st.scoreB||0)?'A':(st.scoreB||0)>(st.scoreA||0)?'B':'');
      if(w==='A') sa++;
      else if(w==='B') sb++;
    });
    return {sa, sb};
  };

  let converted = 0;
  targets.forEach(key=>{
    const arr = arrMap[key]||[];
    arr.forEach(m=>{
      if(!m.sets||!m.sets.length) return;
      const w=_setWins(m.sets);
      if(w.sa!==m.sa || w.sb!==m.sb){
        m.sa=w.sa; m.sb=w.sb;
        m.scoreMode='set';
        converted++;
      }
    });
  });

  // 대회(tourneys) 조별리그/브라켓도 변환(있으면)
  (tourneys||[]).forEach(tn=>{
    if(!tn.groups) return;
    tn.groups.forEach(grp=>{
      (grp.matches||[]).forEach(m=>{
        if(!m.sets||!m.sets.length) return;
        const w=_setWins(m.sets);
        if(w.sa!==m.sa || w.sb!==m.sb){
          m.sa=w.sa; m.sb=w.sb;
          m.scoreMode='set';
          converted++;
        }
      });
    });
    const br=tn.bracket||{};
    Object.values(br.matchDetails||{}).forEach(m=>{
      if(!m||!m.sets||!m.sets.length) return;
      const w=_setWins(m.sets);
      if(w.sa!==m.sa || w.sb!==m.sb){
        m.sa=w.sa; m.sb=w.sb;
        m.scoreMode='set';
        converted++;
      }
    });
    (br.manualMatches||[]).forEach(m=>{
      if(!m.sets||!m.sets.length) return;
      const w=_setWins(m.sets);
      if(w.sa!==m.sa || w.sb!==m.sb){
        m.sa=w.sa; m.sb=w.sb;
        m.scoreMode='set';
        converted++;
      }
    });
  });

  if(converted===0){
    const el=document.getElementById('bulk-conv2-result');
    if(el) el.textContent='변환할 경기가 없습니다. (이미 세트제로 저장됨)';
    return;
  }
  save(); render();
  const el=document.getElementById('bulk-conv2-result');
  if(el) el.textContent='✅ '+converted+'건 변환 완료!';
  setTimeout(()=>{ if(el) el.textContent=''; }, 3000);
}


/* ══════════════════════════════════════
   시즌 관리 함수
══════════════════════════════════════ */
function renderSeasonList(){
  const el = document.getElementById('cfg-season-list');
  if(!el) return;
  if(!seasons.length){
    el.innerHTML = '<div style="font-size:12px;color:var(--gray-l);padding:8px 0">등록된 시즌이 없습니다.</div>';
    return;
  }
  el.innerHTML = seasons.map((s,i) => `
    <div style="display:flex;align-items:center;gap:8px;padding:8px 10px;background:var(--white);border:1px solid var(--border);border-radius:8px;margin-bottom:6px;flex-wrap:wrap">
      <span style="font-size:13px;font-weight:800;color:#7c3aed;min-width:100px">🏆 ${s.name}</span>
      <span style="font-size:11px;color:var(--gray-l)">${s.from} ~ ${s.to}</span>
      ${isLoggedIn ? '<button class="btn btn-w btn-xs" style="margin-left:auto" onclick="editSeason('+i+')">✏️ 수정</button><button class="btn btn-r btn-xs" onclick="deleteSeason('+i+')">🗑️</button>' : '<span style="margin-left:auto"></span>'}
    </div>`).join('');
}

function setBoardMemo2(univName, text){
  const u=univCfg.find(x=>x.name===univName);
  if(!u||!isLoggedIn)return;
  u.memo2=text;
  save();
}
function setBoardNote(univName, text){
  const u=univCfg.find(x=>x.name===univName);
  if(!u||!isLoggedIn)return;
  u.bMemo=text;
  save();
}
function addBoardNoteImg(univName, dataUrl){
  const u=univCfg.find(x=>x.name===univName);
  if(!u||!isLoggedIn)return;
  if(!u.bMemoImgs)u.bMemoImgs=[];
  u.bMemoImgs.push(dataUrl);
  save();render();
}
function removeBoardNoteImg(univName, idx){
  const u=univCfg.find(x=>x.name===univName);
  if(!u||!isLoggedIn)return;
  if(!u.bMemoImgs)u.bMemoImgs=[];
  u.bMemoImgs.splice(idx,1);
  save();render();
}
function setBoardMemoImg(univName, dataUrl){
  const u=univCfg.find(x=>x.name===univName);
  if(!u||!isLoggedIn)return;
  u.memoImg=dataUrl;
  save();render();
}
function addBoardMemoImg(univName, dataUrl){
  const u=univCfg.find(x=>x.name===univName);
  if(!u||!isLoggedIn)return;
  if(!u.memoImgs)u.memoImgs=[];
  u.memoImgs.push(dataUrl);
  save();render();
}
function removeBoardMemoImg(univName, idx){
  const u=univCfg.find(x=>x.name===univName);
  if(!u||!isLoggedIn)return;
  if(!u.memoImgs)u.memoImgs=[];
  u.memoImgs.splice(idx,1);
  save();render();
}

function setBoardBgImg(univName, dataUrl){
  const u=univCfg.find(x=>x.name===univName);
  if(!u||!isLoggedIn)return;
  u.bgImg=dataUrl;
  save();render();
}
function removeBoardBgImg(univName){
  const u=univCfg.find(x=>x.name===univName);
  if(!u||!isLoggedIn)return;
  delete u.bgImg;
  delete u.bgImgPos;
  save();render();
}
function setBoardBgImgPos(univName, pos){
  const u=univCfg.find(x=>x.name===univName);
  if(!u||!isLoggedIn)return;
  u.bgImgPos=pos;
  save();render();
}
function setBoardBgImgSize(univName, size){
  const u=univCfg.find(x=>x.name===univName);
  if(!u||!isLoggedIn)return;
  u.bgImgSize=size;
  save();render();
}
function promptBoardBgImgUrl(univName){
  const u=univCfg.find(x=>x.name===univName);
  if(!u||!isLoggedIn)return;
  const cur=u.bgImg&&!u.bgImg.startsWith('data:')?u.bgImg:'';
  const url=prompt('배경 이미지 URL을 입력하세요:\n(예: https://example.com/image.png)',cur);
  if(url===null)return;
  const trimmed=url.trim();
  if(!trimmed){showToast('URL을 입력해주세요.');return;}
  setBoardBgImg(univName,trimmed);
}
function promptBoardMemoImgUrl(univName){
  const u=univCfg.find(x=>x.name===univName);
  if(!u||!isLoggedIn)return;
  const url=prompt('사이드 이미지 URL을 입력하세요:\n(예: https://example.com/image.png)','');
  if(url===null)return;
  const trimmed=url.trim();
  if(!trimmed){showToast('URL을 입력해주세요.');return;}
  addBoardMemoImg(univName,trimmed);
}
function promptBoardNoteImgUrl(univName){
  const u=univCfg.find(x=>x.name===univName);
  if(!u||!isLoggedIn)return;
  const url=prompt('하단 이미지 URL을 입력하세요:\n(예: https://example.com/image.png)','');
  if(url===null)return;
  const trimmed=url.trim();
  if(!trimmed){showToast('URL을 입력해주세요.');return;}
  addBoardNoteImg(univName,trimmed);
}

