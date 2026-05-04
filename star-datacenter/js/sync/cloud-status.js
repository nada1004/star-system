/* ══════════════════════════════════════
   GitHub/Firebase 동기화 상태 표시
══════════════════════════════════════ */

function gsSetStatus(msg, color='var(--gray-l)'){
  const el=document.getElementById('cloudStatus');
  if(el){el.textContent=msg;el.style.color=color;}
}
try{ window.gsSetStatus = gsSetStatus; }catch(e){}

function _fmtSyncTs(ts){
  const n = Number(ts||0) || 0;
  if(!n) return '기록 없음';
  try{ return new Date(n).toLocaleString('ko-KR'); }catch(e){ return '기록 없음'; }
}

function _getSyncFreshnessMeta(){
  const localLatest = Math.max(
    Number(window._lastAdminSaveTime||0) || 0,
    Number(localStorage.getItem('su_last_admin_save')||0) || 0,
    Number(localStorage.getItem('su_last_save_time')||0) || 0
  );
  const remoteLatest = Number(localStorage.getItem('su_sync_last_remote_saved_at')||0) || 0;
  const diff = localLatest - remoteLatest;
  const threshold = 1500;
  let state = 'unknown';
  let label = '비교 정보 부족';
  let color = 'var(--gray-l)';
  if(localLatest && remoteLatest){
    if(Math.abs(diff) <= threshold){
      state = 'same';
      label = '로컬/원격 거의 동일';
      color = '#16a34a';
    }else if(diff > 0){
      state = 'local_newer';
      label = '로컬이 더 최신';
      color = '#d97706';
    }else{
      state = 'remote_newer';
      label = '원격이 더 최신';
      color = '#2563eb';
    }
  }else if(localLatest){
    state = 'local_only';
    label = '로컬 저장 기록만 있음';
    color = '#d97706';
  }else if(remoteLatest){
    state = 'remote_only';
    label = '원격 저장 기록만 있음';
    color = '#2563eb';
  }
  return { localLatest, remoteLatest, diff, state, label, color };
}

function _canViewSyncDebugInfo(){
  try{
    return !!(typeof isLoggedIn!=='undefined' && isLoggedIn) && !(typeof isSubAdmin!=='undefined' && isSubAdmin);
  }catch(e){
    return false;
  }
}

function refreshCloudSyncStatus(msg, color){
  const el=document.getElementById('cloudStatus');
  const panel=document.getElementById('cfg-fb-sync-result');
  const canViewDebug = _canViewSyncDebugInfo();
  const lastUploadOk = Number(localStorage.getItem('su_sync_last_upload_ok_at')||0) || 0;
  const lastReceived = Number(localStorage.getItem('su_sync_last_received_at')||0) || 0;
  const lastRemoteSaved = Number(localStorage.getItem('su_sync_last_remote_saved_at')||0) || 0;
  const freshness = _getSyncFreshnessMeta();
  const lastSignalSeen = Number(localStorage.getItem('su_sync_last_firebase_signal_at')||0) || 0;
  const lastSignalPush = Number(localStorage.getItem('su_sync_last_firebase_signal_push_at')||0) || 0;
  const missingMonths = (()=>{ try{ return JSON.parse(localStorage.getItem('su_sync_missing_months')||'[]')||[]; }catch(e){ return []; } })();
  const failMsg = String(localStorage.getItem('su_sync_last_fail_msg')||'').trim();
  const summary = canViewDebug
    ? `저장 ${_fmtSyncTs(lastUploadOk)} / 수신 ${_fmtSyncTs(lastReceived)}${lastRemoteSaved?` / 원격저장 ${_fmtSyncTs(lastRemoteSaved)}`:''}${lastSignalSeen?` / 신호 ${_fmtSyncTs(lastSignalSeen)}`:''}${freshness.state!=='unknown'?` / ${freshness.label}`:''}`
    : (failMsg ? '동기화 문제 있음' : (msg || '동기화 대기'));
  if(el){
    el.style.color = color || (failMsg ? '#dc2626' : 'var(--gray-l)');
    el.textContent = canViewDebug ? (msg ? `${msg} · ${summary}` : summary) : summary;
  }
  if(panel){
    if(!canViewDebug){
      panel.innerHTML = `
        <div style="display:grid;gap:6px">
          <div><b>최근 상태:</b> ${msg || (failMsg ? '동기화 문제 있음' : '대기 중')}</div>
          ${failMsg?`<div style="color:#dc2626"><b>최근 실패:</b> ${failMsg}</div>`:''}
        </div>`;
      return;
    }
    panel.innerHTML = `
      <div style="display:grid;gap:6px">
        <div><b>로컬 최신 저장:</b> ${_fmtSyncTs(freshness.localLatest)}</div>
        <div><b>최근 업로드:</b> ${_fmtSyncTs(lastUploadOk)}</div>
        <div><b>최근 수신:</b> ${_fmtSyncTs(lastReceived)}</div>
        <div><b>원격 savedAt:</b> ${_fmtSyncTs(lastRemoteSaved)}</div>
        <div><b>최신 비교:</b> <span style="color:${freshness.color};font-weight:700">${freshness.label}</span></div>
        <div><b>보조 신호 수신:</b> ${_fmtSyncTs(lastSignalSeen)}</div>
        <div><b>보조 신호 발행:</b> ${_fmtSyncTs(lastSignalPush)}</div>
        <div><b>누락 월 파일:</b> ${missingMonths.length ? missingMonths.join(', ') : '없음'}</div>
        <div><b>최근 상태:</b> ${msg || (failMsg ? '업로드 실패 기록 있음' : '대기 중')}</div>
        ${failMsg?`<div style="color:#dc2626"><b>최근 실패:</b> ${failMsg}</div>`:''}
      </div>`;
  }
}

async function checkFbSyncStatus(){
  const el=document.getElementById('cfg-fb-sync-result');
  if(!el)return;
  el.innerHTML='<span style="color:var(--blue)">🔄 확인 중...</span>';
  const canViewDebug = _canViewSyncDebugInfo();
  const fbConnected=typeof window.fbSet==='function';
  const hasPw=!!localStorage.getItem('su_gh_token');
  const lastSave=localStorage.getItem('su_last_save_time');
  const lastSignal=Number(localStorage.getItem('su_sync_last_firebase_signal_at')||0) || 0;
  const freshness=_getSyncFreshnessMeta();
  const missingMonths=(()=>{ try{ return JSON.parse(localStorage.getItem('su_sync_missing_months')||'[]')||[]; }catch(e){ return []; } })();
  const localSize=(()=>{let t=0;for(let k in localStorage){if(k.startsWith('su_'))t+=((localStorage.getItem(k)||'').length*2);}return t;})();
  const fmt=b=>b>=1024*1024?(b/1024/1024).toFixed(2)+'MB':b>=1024?(b/1024).toFixed(1)+'KB':b+'B';
  const fbSize=window._lastFbDataSize||null;

  let rows=`
    <div style="display:grid;gap:8px">
      <div style="display:flex;align-items:center;gap:8px;padding:8px 10px;border-radius:8px;background:${fbConnected?'#f0fdf4':'#fef2f2'};border:1px solid ${fbConnected?'#bbf7d0':'#fecaca'}">
        <span style="font-size:16px">${fbConnected?'✅':'❌'}</span>
        <div>
          <div style="font-weight:700;font-size:12px">GitHub 동기화 모듈</div>
          <div style="font-size:11px;color:var(--gray-l)">${fbConnected?'정상 연결됨':'GitHub 동기화 모듈 미로드'}</div>
        </div>
      </div>
      <div style="display:flex;align-items:center;gap:8px;padding:8px 10px;border-radius:8px;background:${hasPw?'#f0fdf4':'#fffbeb'};border:1px solid ${hasPw?'#bbf7d0':'#fde68a'}">
        <span style="font-size:16px">${hasPw?'🔑':'⚠️'}</span>
        <div>
          <div style="font-weight:700;font-size:12px">GitHub 토큰</div>
          <div style="font-size:11px;color:var(--gray-l)">${hasPw?'설정됨 — 수동 버튼으로 GitHub data.json 업로드 가능':'미설정 — GitHub 업로드 불가, 로컬만 저장'}</div>
        </div>
      </div>
      <div style="display:flex;align-items:center;gap:8px;padding:8px 10px;border-radius:8px;background:${lastSignal?'#eff6ff':'#f8fafc'};border:1px solid ${lastSignal?'#bfdbfe':'var(--border)'}">
        <span style="font-size:16px">📡</span>
        <div>
          <div style="font-weight:700;font-size:12px">보조 신호 채널</div>
          <div style="font-size:11px;color:var(--gray-l)">${canViewDebug ? (lastSignal?`최근 신호 ${new Date(lastSignal).toLocaleString('ko-KR')}`:'아직 수신 기록 없음') : (lastSignal?'새 데이터 수신 기록 있음':'아직 수신 기록 없음')}</div>
        </div>
      </div>
      <div style="display:flex;align-items:center;gap:8px;padding:8px 10px;border-radius:8px;background:${missingMonths.length?'#fff7ed':'var(--surface)'};border:1px solid ${missingMonths.length?'#fdba74':'var(--border)'}">
        <span style="font-size:16px">${missingMonths.length?'⚠️':'🗂️'}</span>
        <div>
          <div style="font-weight:700;font-size:12px">월별 기록 파일</div>
          <div style="font-size:11px;color:var(--gray-l)">${missingMonths.length?`누락: ${missingMonths.join(', ')}`:'누락 없음'}</div>
        </div>
      </div>
      ${canViewDebug ? `
      <div style="display:flex;align-items:center;gap:8px;padding:8px 10px;border-radius:8px;background:var(--surface);border:1px solid var(--border)">
        <span style="font-size:16px">💾</span>
        <div>
          <div style="font-weight:700;font-size:12px">마지막 저장</div>
          <div style="font-size:11px;color:var(--gray-l)">${lastSave?new Date(parseInt(lastSave)).toLocaleString('ko-KR'):'기록 없음'}</div>
        </div>
      </div>
      <div style="display:flex;align-items:center;gap:8px;padding:8px 10px;border-radius:8px;background:${freshness.state==='local_newer'?'#fff7ed':freshness.state==='remote_newer'?'#eff6ff':'#f0fdf4'};border:1px solid ${freshness.state==='local_newer'?'#fdba74':freshness.state==='remote_newer'?'#bfdbfe':'#bbf7d0'}">
        <span style="font-size:16px">${freshness.state==='local_newer'?'🖥️':freshness.state==='remote_newer'?'☁️':'🤝'}</span>
        <div>
          <div style="font-weight:700;font-size:12px">로컬/원격 최신 비교</div>
          <div style="font-size:11px;color:${freshness.color}">${freshness.label}</div>
          <div style="font-size:10px;color:var(--gray-l)">로컬 ${_fmtSyncTs(freshness.localLatest)} / 원격 ${_fmtSyncTs(freshness.remoteLatest)}</div>
        </div>
      </div>
      <div style="display:flex;align-items:center;gap:8px;padding:8px 10px;border-radius:8px;background:var(--surface);border:1px solid var(--border)">
        <span style="font-size:16px">📦</span>
        <div>
          <div style="font-weight:700;font-size:12px">로컬 데이터 크기</div>
          <div style="font-size:11px;color:var(--gray-l)">${fmt(localSize)} ${fbSize?`/ 동기화 데이터: ${fmt(fbSize*2)}`:'(동기화 크기 미확인)'}</div>
        </div>
      </div>` : ''}
      <div style="display:grid;gap:8px;grid-template-columns:1fr">
        ${missingMonths.length?`<button class="btn btn-w btn-sm" onclick="(async(btn)=>{const old=btn.textContent;btn.disabled=true;btn.textContent='🔄 누락 월 재수신 중...';try{if(typeof fbRetryMissingMonths==='function') await fbRetryMissingMonths();}catch(e){console.error('[fbRetryMissingMonths]',e);}finally{btn.disabled=false;btn.textContent=old;setTimeout(checkFbSyncStatus,300);}})(this)" style="width:100%">🗂️ 누락 월 다시받기</button>`:''}
        ${isLoggedIn&&hasPw?`<button class="btn btn-b btn-sm" onclick="(async(btn)=>{const old=btn.textContent;btn.disabled=true;btn.textContent='⏫ 업로드 중...';try{await fbCloudSave();localStorage.setItem('su_last_save_time',Date.now());btn.textContent='✅ 완료';}catch(e){btn.textContent='❌ 실패';}finally{setTimeout(()=>{btn.disabled=false;btn.textContent=old;checkFbSyncStatus();},500);}})(this)" style="width:100%">⬆️ 지금 GitHub data.json에 업로드</button>`:''}
      </div>
    </div>`;
  el.innerHTML=rows;
}

try{ window._fmtSyncTs = _fmtSyncTs; }catch(e){}
try{ window._getSyncFreshnessMeta = _getSyncFreshnessMeta; }catch(e){}
try{ window._canViewSyncDebugInfo = _canViewSyncDebugInfo; }catch(e){}
try{ window.refreshCloudSyncStatus = refreshCloudSyncStatus; }catch(e){}
try{ window.checkFbSyncStatus = checkFbSyncStatus; }catch(e){}
