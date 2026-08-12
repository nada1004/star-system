// settings-data-ops.js에서 분리됨 (설정 - Gist 동기화 / 스토리지정보 / 레거시정리)


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
        <span style="font-size:var(--fs-caption);color:var(--text2)">${label}</span>
        <span style="font-size:var(--fs-caption);font-weight:800;color:${col}">${text}</span>
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
      <div style="display:flex;justify-content:space-between;font-size:var(--fs-sm);margin-bottom:5px">
        <span style="font-weight:700;color:var(--text)">${fmt(total)} / 5MB 사용</span>
        <span style="font-weight:700;color:${barCol}">${pct}%</span>
      </div>
      <div style="height:10px;border-radius:5px;background:var(--border2);overflow:hidden">
        <div style="height:100%;width:${pct}%;background:${barCol};border-radius:5px;transition:.3s"></div>
      </div>
      ${pct>=70?`<div style="font-size:var(--fs-caption);color:${barCol};margin-top:5px;font-weight:600">${pct>=90?'⚠️ 저장 공간이 거의 가득 찼습니다! 데이터를 정리해 주세요.':'⚠️ 저장 공간이 많이 사용되고 있습니다.'}</div>`:''}
    </div>
    <div style="font-size:var(--fs-caption);color:var(--gray-l);margin-bottom:4px">항목별 사용량 (상위 10개)</div>
      <div style="font-size:10px;color:var(--gray-l);margin-bottom:8px">기본 저장소는 <b>IndexedDB</b>이며, 아래 localStorage 사용량은 주로 설정/레거시 키 기준입니다. IndexedDB가 불가능한 환경에서만 localStorage fallback이 사용됩니다.</div>
    <div style="display:flex;flex-direction:column;gap:6px;margin-bottom:10px">
      ${backendBadge('경기 기록 저장소', matchMeta.backend||'')}
      ${backendBadge('외부탭 기록 저장소', histMeta.backend||'')}
    </div>
    ${idbRows.length?`<div style="margin-bottom:10px;padding:10px;border:1px solid var(--border);background:var(--surface);border-radius:var(--r)">
      <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:6px">
        <div style="font-size:var(--fs-sm);font-weight:800;color:var(--text2)">IndexedDB 사용량 추정</div>
        <div style="font-size:var(--fs-caption);color:var(--gray-l)">합계 약 ${fmt(idbTotal)}</div>
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
    <div style="margin-bottom:10px;padding:10px;border:1px solid var(--border);background:var(--surface);border-radius:var(--r)">
      <div style="font-size:var(--fs-sm);font-weight:800;color:var(--text2);margin-bottom:6px">저장소 관리</div>
      <div style="font-size:10px;color:var(--gray-l);margin-bottom:8px">기록 원본은 기본적으로 IndexedDB에 저장됩니다. 문제가 있을 때 현재 메모리 데이터를 다시 저장소에 안전하게 다시 기록합니다. 기록 삭제 기능은 설정에서 제공하지 않습니다.</div>
      <div style="display:flex;flex-wrap:wrap;gap:6px">
        <button class="btn btn-w btn-xs" onclick="rebuildIndexedDbStores()">IndexedDB 재빌드</button>
      </div>
    </div>
    ${legacyRows.length?`<div style="margin-bottom:8px;padding:8px 10px;border:1px solid #fcd34d;background:#fffbeb;border-radius:8px">
      <div style="font-size:var(--fs-caption);font-weight:800;color:#92400e;margin-bottom:4px">레거시 저장 키가 남아 있습니다</div>
      <div style="font-size:10px;color:#a16207;margin-bottom:6px">${legacyRows.map(r=>LABELS[r.k]||r.k).join(', ')}</div>
      <button class="btn btn-w btn-xs" onclick="cleanupLegacyMatchStorageKeys()">레거시 키 정리</button>
    </div>`:''}
    <div style="font-size:var(--fs-caption);line-height:1.8">
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
  }catch(e){el.innerHTML='<div style="color:var(--gray-l);font-size:var(--fs-sm)">사용량 계산 불가</div>';}
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

