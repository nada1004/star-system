function buildBoardRankViewHTML(univs){
  // 전체 선수 포인트 순 정렬
  const univNames=new Set(univs.map(u=>u.name));
  const allPlayers=(players||[]).filter(p=>p.univ&&univNames.has(p.univ)&&(p.win||0)+(p.loss||0)>0)
    .map(p=>({...p,_univ:p.univ,_col:gc(p.univ)}));
  allPlayers.sort((a,b)=>(b.points||0)-(a.points||0));
  if(!allPlayers.length) return `<div style="padding:40px;text-align:center;color:var(--gray-l)">스트리머 없음</div>`;
  const TIER_ICONS={'G':'👑','K':'🌟','JA':'⚡','J':'🔥','S':'💎','0티어':'⭐','1티어':'🥇','2티어':'🥈','3티어':'🥉'};
  let h=`<div style="background:var(--white);border-radius:14px;border:1px solid var(--border);overflow:hidden">
    <div style="padding:14px 18px;font-weight:900;font-size:15px;color:var(--blue);border-bottom:2px solid var(--blue-ll)">🏅 포인트 순 전체 랭킹</div>
    <table style="width:100%;border-collapse:collapse">
      <thead><tr style="background:var(--bg2)">
        <th style="padding:8px 12px;text-align:center;font-size:12px;color:var(--text3)">순위</th>
        <th style="padding:8px 12px;text-align:left;font-size:12px;color:var(--text3)">선수</th>
        <th style="padding:8px 12px;text-align:left;font-size:12px;color:var(--text3)">대학</th>
        <th style="padding:8px 12px;text-align:center;font-size:12px;color:var(--text3)">티어</th>
        <th style="padding:8px 12px;text-align:center;font-size:12px;color:var(--text3)">승</th>
        <th style="padding:8px 12px;text-align:center;font-size:12px;color:var(--text3)">패</th>
        <th style="padding:8px 12px;text-align:center;font-size:12px;color:var(--text3)">포인트</th>
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
          <span style="font-weight:700;font-size:13px">${p.name||''}</span>
        </div>
      </td>
      <td style="padding:7px 12px">
        <span class="ubadge clickable-univ" style="background:${p._col};font-size:10px;padding:2px 7px" onclick="openUnivModal('${univNameJs}')">${p._univ||''}</span>
      </td>
      <td style="padding:7px 12px;text-align:center;font-size:12px">${tierIcon}${p.tier||''}</td>
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
            statusEl.innerHTML = `🔄 GitHub에 새 데이터 있음 <button onclick="window.cloudLoad()" style="margin-left:6px;padding:2px 8px;border:1px solid #2563eb;border-radius:4px;background:#eff6ff;color:#2563eb;font-size:11px;cursor:pointer">불러오기</button>`;
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
