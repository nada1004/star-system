/* ══════════════════════════════════════════════════════════════
   인증 - 로그인/로그아웃/내보내기·가져오기 (auth.js 에서 분리, 2026-07-30)
   ══════════════════════════════════════════════════════════════ */

async function doLogin(){
  try{ if(window._authInitPromise) await window._authInitPromise; else await pullAdminAccountsRemote(true); }catch(e){}
  const id=document.getElementById('li-id').value.trim();
  const pw=document.getElementById('li-pw').value;
  const err=document.getElementById('li-err');
  if(!id||!pw){err.textContent='아이디와 비밀번호를 입력하세요.';return;}
  err.textContent='';
  let accounts=getAdminAccounts();
  if(!accounts.length){
    try{ await pullAdminAccountsRemote(true); }catch(e){}
    accounts=getAdminAccounts();
  }
  if(_getAdminRemoteSyncState() !== 'ok' && !accounts.length){
    err.textContent='관리자 계정 정보를 아직 불러오지 못했습니다. 잠시 후 다시 시도하세요.';
    return;
  }
  const remainMs = _getLoginLockRemainingMs();
  if(remainMs > 0){
    err.textContent=`로그인 시도 제한 중입니다. ${Math.ceil(remainMs/1000)}초 후 다시 시도하세요.`;
    return;
  }
  if(!accounts.length){
    err.textContent='등록된 관리자 계정이 없습니다. 총관리자가 먼저 계정을 등록해야 합니다.';
    return;
  }
  let found=null, foundIdx=-1;
  for(let i=0;i<accounts.length;i++){
    if(await verifyAdminAccount(accounts[i], id, pw)){
      found=accounts[i];
      foundIdx=i;
      break;
    }
  }
  if(found){
    const _needsRelabel = String(found.label||'').trim().toLowerCase() === _normAdminId(id);
    if(found.v!==ADMIN_HASH_VERSION || _needsRelabel){
      try{
        accounts[foundIdx]=await createAdminAccountRecord(id,pw,found.role||'admin',found.label||id);
        _persistAdminAccounts(accounts);
        await pushAdminAccountsRemote(accounts);
      }catch(e){}
    }
    isLoggedIn=true;
    isSubAdmin=(found.role==='sub-admin');
    const now = Date.now();
    try{ localStorage.removeItem('su_explicit_logout'); }catch(e){}
    localStorage.setItem('su_session','1');
    localStorage.setItem('su_session_role',found.role||'admin');
    _setSessionIdentity(found.idHash || await sha256(_normAdminId(id)));
    localStorage.setItem('su_session_login_at', String(now));
    localStorage.setItem('su_session_last_active_at', String(now));
    _clearLoginFailInfo();
    cm('loginModal');
    document.getElementById('li-id').value='';
    document.getElementById('li-pw').value='';
    document.getElementById('li-err').textContent='';
    applyLoginState();
  } else {
    const fail = _recordLoginFailure();
    const lockedMs = Math.max(0, (Number(fail.lockUntil||0)||0) - Date.now());
    if(lockedMs > 0){
      err.textContent=`로그인 ${LOGIN_FAIL_MAX}회 실패로 ${Math.ceil(lockedMs/1000)}초 동안 잠금됩니다.`;
    }else{
      const left = Math.max(0, LOGIN_FAIL_MAX - (Number(fail.count||0) || 0));
      err.textContent=`아이디 또는 비밀번호가 올바르지 않습니다.${left>0?` (${left}회 남음)`:''}`;
    }
    document.getElementById('li-pw').value='';
  }
}

function doLogout(){
  isLoggedIn=false;
  isSubAdmin=false;
  try{ localStorage.setItem('su_explicit_logout','1'); }catch(e){}
  _clearSessionStorage();
  if(['member','cfg'].includes(curTab)){curTab='total';document.querySelectorAll('.tab').forEach(b=>b.classList.remove('on'));document.querySelector('.tab').classList.add('on');}
  if(['grpedit','input'].includes(compSub)) compSub='league';
  applyLoginState();
}

function applyLoginState(){
  if(isLoggedIn && _isSessionExpired()){
    isLoggedIn = false;
    isSubAdmin = false;
    _clearSessionStorage();
  }
  if(isLoggedIn){
    // su_session 키가 없으면 즉시 해제 (드라이런 등 외부에서 isLoggedIn=true로 오염된 경우 방어)
    if(localStorage.getItem('su_session') !== '1'){
      isLoggedIn = false;
      isSubAdmin = false;
    } else {
      const acct = _getSessionAccountFromCache();
      if(!acct){
        isLoggedIn = false;
        isSubAdmin = false;
        _clearSessionStorage();
      }else{
        _syncSessionRoleFromAccount(acct);
      }
    }
  }
  if(isLoggedIn) _touchSessionActivity(false);
  // (중요) 일부 모듈(render-nav-lazy 등)은 window.isLoggedIn을 참조함.
  // auth.js는 top-level let isLoggedIn을 사용하므로 둘을 항상 동기화한다.
  try{ window.isLoggedIn = !!isLoggedIn; }catch(e){}
  try{ window.isSubAdmin = !!isSubAdmin; }catch(e){}
  // 헤더 버튼 표시
  // 단일 아이콘 버튼으로 통합 — 로그인 상태에 따라 아이콘/title 교체
  try{
    const _authBtn = document.getElementById('hdrAuthBtn');
    if(_authBtn){
      const _ico = _authBtn.querySelector('.hdr-auth-ico');
      if(isLoggedIn){
        if(_ico) _ico.textContent = '🔓';
        _authBtn.title = '로그아웃';
        _authBtn.setAttribute('aria-label','로그아웃');
        _authBtn.classList.add('hdr-auth-btn--logged');
      } else {
        if(_ico) _ico.textContent = '🔐';
        _authBtn.title = '로그인';
        _authBtn.setAttribute('aria-label','로그인');
        _authBtn.classList.remove('hdr-auth-btn--logged');
      }
    }
  }catch(e){}
  try{ const _l=document.getElementById('hdrLoginBtn'); if(_l) _l.style.display=isLoggedIn?'none':''; }catch(e){}
  try{ const _o=document.getElementById('hdrLogoutBtn'); if(_o) _o.style.display=isLoggedIn?'':'none'; }catch(e){}
  document.getElementById('hdrLoginStatus').style.display=isLoggedIn?'':'none';
  try{
    const st=document.getElementById('hdrLoginStatus');
    if(st && isLoggedIn){
      st.textContent = isSubAdmin ? '✅ 부관리자' : '✅ 총관리자';
    }
  }catch(e){
    console.warn('[applyLoginState] 로그인 상태 표시 업데이트 실패:', e.message);
  }
  const _mobileBar=document.getElementById('mobileActionBar');
  if(_mobileBar && !isLoggedIn) { const _mBtn=_mobileBar.querySelector('button[onclick*="cloudLoad"]'); if(_mBtn) _mBtn.style.display='none'; }
  if(_mobileBar && isLoggedIn) { const _mBtn=_mobileBar.querySelector('button[onclick*="cloudLoad"]'); if(_mBtn) _mBtn.style.display='flex'; }
  // 잠금 요소
  document.querySelectorAll('.lock-admin').forEach(el=>{
    el.classList.toggle('locked',!isLoggedIn);
  });
  // 관리자 전용 탭 (설정) - 총관리자만 표시/접근
  // display:'' 대신 display:'flex'로 명시 → CSS #tabCfg{display:none}에 의해 덮이지 않도록
  const _cfgTab=document.getElementById('tabCfg');
  if(_cfgTab) _cfgTab.style.display=(isLoggedIn && !isSubAdmin)?'flex':'none';
  if((!isLoggedIn || isSubAdmin) && curTab==='cfg'){
    curTab='total';
  }
  // 데이터 내보내기/가져오기 버튼 — 로그인 시에만 표시
  const exportHint=document.getElementById('exportHint');
  if(exportHint)exportHint.style.display=(isLoggedIn && !isSubAdmin)?'':'none';
  const exportVis=document.getElementById('btnExportVis');
  const importVis=document.getElementById('btnImportVis');
  if(exportVis)exportVis.style.display=(isLoggedIn && !isSubAdmin)?'flex':'none';
  if(importVis)importVis.style.display=(isLoggedIn && !isSubAdmin)?'flex':'none';
  // 대학 상세 모달 수정 버튼 — 모달이 열려 있을 때 즉시 반영
  const univEditBtnEl=document.getElementById('univEditBtn');
  if(univEditBtnEl) univEditBtnEl.style.display=(isLoggedIn && !isSubAdmin)?'inline-flex':'none';
  // 대학 상세 모달 스타일 전환 버튼 — 관리자로 로그인해야 노출
  const univStyleBtnEl=document.getElementById('univModalStyleBtn');
  if(univStyleBtnEl) univStyleBtnEl.style.display=(isLoggedIn && !isSubAdmin)?'inline-flex':'none';
  if(!(isLoggedIn && !isSubAdmin)){ try{ if(typeof window._udCloseStylePicker==='function') window._udCloseStylePicker(); }catch(e){} }
  // 스트리머 상세 모달 수정 버튼 — 모달이 열려 있을 때 즉시 반영
  const playerEditBtnEl=document.getElementById('playerModalEditBtn');
  if(playerEditBtnEl) playerEditBtnEl.style.display=(isLoggedIn && !isSubAdmin)?'inline-flex':'none';
  // 스트리머 등록/경기 기록 입력폼 — 로그인 + 스트리머 탭일 때만 표시
  const fstrip=document.getElementById('fstrip');
  if(fstrip){
    // (요청사항) 부관리자는 스트리머 등록 불가 → 숨김
    if(!isLoggedIn || isSubAdmin){fstrip.style.display='none';}
    else{fstrip.style.display=(curTab==='total')?'block':'none';}
  }
  // FAB(모바일 플로팅 버튼)의 설정/관리자 메뉴 표시 상태도 로그인 변화 즉시 반영
  try{ if(typeof updateFabVisibility==='function') updateFabVisibility(); }catch(e){}
  render();
}
document.addEventListener('visibilitychange', ()=>{
  if(document.visibilityState !== 'visible') return;
  if(_isSessionExpired()){
    if(isLoggedIn){
      isLoggedIn = false;
      isSubAdmin = false;
      _clearSessionStorage();
      try{ if(typeof showToast==='function') showToast('🔒 로그인 세션이 만료되어 자동 로그아웃되었습니다.', 2600); }catch(e){}
      try{ applyLoginState(); }catch(e){}
    }
    return;
  }
  if(isLoggedIn){
    _touchSessionActivity(true);
    try{ refreshSessionAuthority(true).then(()=>applyLoginState()); }catch(e){}
  }
});
window.addEventListener('pointerdown', ()=>{ if(isLoggedIn) _touchSessionActivity(false); }, { passive:true });
window.addEventListener('keydown', ()=>{ if(isLoggedIn) _touchSessionActivity(false); }, { passive:true });

// 수정/삭제 버튼 — 비로그인 시 숨김
function adminBtn(html){
  // (요청사항) 부관리자는 설정/편집 등 관리자 버튼 숨김 (경기 수정은 별도 로직)
  return (isLoggedIn && !isSubAdmin) ? html : '';
}
function doExport(){
  try{
    // 외부 대진기록은 현재 IndexedDB + localStorage(meta) 구조를 우선 사용
    const histExtState = (typeof _histExtLoad==='function')
      ? (_histExtLoad() || {})
      : {items:[],raw:'',mode:'today',today:'',sourceSel:'',keyword:''};
    const histExtProxyPresets = localStorage.getItem('su_hist_ext_proxy_presets_v1') || '';
    const histExtProxyPresetSel = localStorage.getItem('su_hist_ext_proxy_preset_sel_v1') || '';

    // (중요) 티어대회 기록(ttM) 및 기타 누락 데이터도 백업에 포함
    const payload = {
      players, univCfg, maps, tourD,
      miniM, univM, comps, ckM,
      compNames, curComp,
      proM, proTourneys,
      tiers: TIERS,
      tourneys,
      indM, gjM,
      // 🎯 티어대회 기록 (대전기록 탭 전용)
      ttM: (typeof ttM!=='undefined' ? ttM : []),
      // 설정/부가 데이터
      curProComp, _ttCurComp,
      userMapAlias, notices, playerStatusIcons,
      playerStatusExpiry: (typeof playerStatusExpiry!=='undefined' ? playerStatusExpiry : {}),
      customStatusIcons: (typeof _customStatusIcons!=='undefined' ? _customStatusIcons : []),
      boardOrder, boardPlayerOrder,
      seasons, calScheduled,
      // 외부 탭 데이터
      histExtState, histExtProxyPresets, histExtProxyPresetSel
    };
    const b=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});
    const url=URL.createObjectURL(b);
    const a=document.createElement('a');
    a.href=url;a.download='star_backup.json';
    document.body.appendChild(a);a.click();
    setTimeout(()=>{document.body.removeChild(a);URL.revokeObjectURL(url);},100);
  }catch(e){alert('내보내기 오류: '+e.message);}
}

function doImport(){document.getElementById('fi').click();}
function doFile(inp){
  const r=new FileReader();
  r.onload=async e=>{
    try{
      const d=JSON.parse(e.target.result);
      if(!d||typeof d!=='object'||Array.isArray(d)){
        alert('파일이 유효한 JSON 객체가 아닙니다.');
        return;
      }
      players=d.players||[];univCfg=d.univCfg||univCfg;maps=d.maps||maps;tourD=d.tourD||Array(15).fill('');
      if(d.tiers&&d.tiers.length)TIERS.splice(0,TIERS.length,...d.tiers);
      miniM=d.miniM||[];univM=d.univM||[];comps=d.comps||[];ckM=d.ckM||[];
      compNames=d.compNames||[];curComp=d.curComp||'';
      proM=d.proM||[];
      if(d.proTourneys!==undefined) proTourneys=d.proTourneys||[];
      tourneys=d.tourneys||[];
      // 🎯 티어대회 기록 복원(있으면 그대로 사용, 없으면 아래에서 tourneys로 마이그레이션)
      if(d.ttM!==undefined) ttM=d.ttM||[];
      // 외부 대진기록 복원
      if(d.histExtState!==undefined){
        try{
          if(typeof _histExtSave==='function') _histExtSave(d.histExtState||{items:[],raw:'',mode:'today',today:'',sourceSel:'',keyword:''});
          else localStorage.setItem('su_hist_ext_data_v1', JSON.stringify(d.histExtState||{}));
        }catch(e){
          console.warn('[doFile] histExtState 복원 실패:', e.message);
        }
      }else if(d.histExtRaw!==undefined){
        try{ localStorage.setItem('su_hist_ext_data_v1', String(d.histExtRaw||'')); }catch(e){
          console.warn('[doFile] histExtRaw localStorage 저장 실패:', e.message);
        }
      }else if(d.histExt){
        // 구버전 호환: histExt 객체 형태면 JSON 문자열로 저장
        try{ localStorage.setItem('su_hist_ext_data_v1', JSON.stringify(d.histExt)); }catch(e){
          console.warn('[doFile] histExt localStorage 저장 실패:', e.message);
        }
      }
      if(d.histExtProxyPresets!==undefined){
        try{ localStorage.setItem('su_hist_ext_proxy_presets_v1', String(d.histExtProxyPresets||'')); }catch(e){}
      }
      if(d.histExtProxyPresetSel!==undefined){
        try{ localStorage.setItem('su_hist_ext_proxy_preset_sel_v1', String(d.histExtProxyPresetSel||'')); }catch(e){}
      }
      // 🔧 누락 변수 복원 추가
      if(d.indM!==undefined) indM=d.indM||[];
      if(d.gjM!==undefined) gjM=d.gjM||[];
      if(d.curProComp!==undefined) curProComp=d.curProComp||'';
      if(d.userMapAlias!==undefined) userMapAlias=d.userMapAlias||{};
      if(d.notices!==undefined) notices=d.notices||[];
      if(d.playerStatusIcons!==undefined) playerStatusIcons=d.playerStatusIcons||{};
      if(d.playerStatusExpiry!==undefined && typeof playerStatusExpiry!=='undefined') playerStatusExpiry=d.playerStatusExpiry||{};
      if(d.customStatusIcons!==undefined && typeof _customStatusIcons!=='undefined') _customStatusIcons=d.customStatusIcons||[];
      try{ if(typeof _rebuildCustomStatusDefs==='function') _rebuildCustomStatusDefs(); }catch(e){}
      try{ if(typeof _iconPersistState==='function') _iconPersistState(); }catch(e){}
      if(d.boardOrder!==undefined) boardOrder=d.boardOrder||[];
      if(d.boardPlayerOrder!==undefined) boardPlayerOrder=d.boardPlayerOrder||{};
      if(d.seasons!==undefined) seasons=d.seasons||[];
      if(d.calScheduled!==undefined) calScheduled=d.calScheduled||[];
      if(d._ttCurComp!==undefined) _ttCurComp=d._ttCurComp||'';
      window._compListCache={};window._shareAllMatchesCached=null;
      (function(){
        const allD=[...miniM,...univM,...comps,...ckM,...proM];
        mergeValidYearsIntoOptions(yearOptions, allD);
      })();
      filterYear='전체';filterMonth='전체';
      // (중요) ttM이 백업에 없었던 구버전 파일이라면 tourneys(type='tier')에서 ttM를 재구성
      try{
        if((!ttM || !ttM.length) && typeof _migrateTierTourneys==='function'){
          try{ if(typeof _ttMigrated!=='undefined') _ttMigrated=false; }catch(e){}
          _migrateTierTourneys();
        }
      }catch(e){}
      fixPoints();
      try{ if(typeof _rebuildAllPlayerHistoryCore==='function') _rebuildAllPlayerHistoryCore(); }catch(e){}
      await save();
      init();
      // 동명이인 감지
      const _dupSeen={};const _dupFound=[];
      players.forEach(p=>{if(_dupSeen[p.name])_dupFound.push(p.name);else _dupSeen[p.name]=true;});
      const _dupUniq=[...new Set(_dupFound)];
      if(_dupUniq.length) alert('⚠️ 동명이인 감지!\n중복 이름: '+_dupUniq.join(', ')+'\n\n설정 탭 > 데이터 진단에서 수정하세요.');
      alert('✅ 데이터 임포트 완료');
    }catch(err){
      console.error('[doFile] 파일 처리 오류:', err);
      alert(`파일 읽기 오류: ${err.message}\n올바른 JSON 파일인지 확인하세요.`);
    }
  };
  r.readAsText(inp.files[0]);
}

function refreshSel(){
  const allU=getAllUnivs().filter(u=>!u.dissolved);
  document.getElementById('p-univ').innerHTML=allU.map(u=>`<option value="${u.name}"${u.name==='무소속'?' selected':''}>${u.name}</option>`).join('');
  const mmap=document.getElementById('m-map');
  if(mmap) mmap.innerHTML=maps.map(m=>`<option value="${m}">${m}</option>`).join('');
}
// ── 경기 수정 모달 상태 ──
