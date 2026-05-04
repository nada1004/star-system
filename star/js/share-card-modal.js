/* ══════════════════════════════════════
   Share Card Split Parts
══════════════════════════════════════ */
function _resolveShareSoloModeKey(m){
  try{
    const mk = String(m?._matchType||'').trim();
    if(['ind','gj','progj'].includes(mk)) return mk;
    const sub = `${String(m?._subLabel||'')} ${String(m?._proLabel||'')} ${String(m?.n||'')}`.trim();
    if(String(m?._shareCardStyle||'').trim()==='solo-match'){
      if(sub.includes('프로리그') && sub.includes('끝장전')) return 'progj';
      if(sub.includes('개인전')) return 'ind';
      if(sub.includes('끝장전')) return 'gj';
    }
    if((m?.wName || m?.lName) && sub.includes('프로리그')) return 'progj';
    if((m?.wName || m?.lName) && sub.includes('끝장전')) return 'gj';
    if(m?.wName || m?.lName) return 'ind';
  }catch(e){}
  return '';
}

function openShareCardModal(){
  // 기존 모달 제거
  const existing=document.getElementById('sharecard-overlay');
  if(existing)existing.remove();
  
  const overlay=document.createElement('div');
  overlay.id='sharecard-overlay';
  overlay.className='sharecard-modal-overlay';
  overlay.innerHTML=`<div class="sharecard-modal-box" onclick="event.stopPropagation()" style="max-width:520px;width:96vw;background:linear-gradient(180deg,#ffffff,#f8fafc)">
    <button class="sharecard-modal-close" onclick="document.getElementById('sharecard-overlay').remove()" style="z-index:2">✕</button>
    <div class="sharecard-modal-head" style="position:relative">
      <div class="sharecard-modal-head-title" style="padding-right:36px">
        <span id="sharecard-modal-title" style="font-weight:1000;font-size:16px;color:var(--text)">🎴 공유 카드</span>
        <span id="sharecard-modal-badge" class="sharecard-modal-badge">통합 디자인</span>
      </div>
    </div>
    <div class="sharecard-modal-stage">
      <div class="sharecard-preview-shell">
        <div id="modal-share-card" style="display:flex;justify-content:center;overflow:auto;max-height:70vh;padding:2px">
          <div id="share-card" style="width:100%;max-width:440px;min-height:140px;border-radius:22px;overflow:hidden;box-shadow:0 14px 38px rgba(15,23,42,.18);font-family:'Noto Sans KR',sans-serif;display:block">
            <p style="text-align:center;color:var(--gray-l);padding:36px 20px;font-size:13px">카드를 생성하는 중...</p>
          </div>
        </div>
      </div>
    </div>
    <div class="sharecard-modal-actions">
      <button class="btn btn-p" onclick="downloadShareCardJpg()">📷 JPG 저장</button>
      <button class="btn btn-b" onclick="downloadShareCard()">🖼 PNG 저장</button>
      <button class="btn btn-w" onclick="document.getElementById('sharecard-overlay').remove()">닫기</button>
    </div>
  </div>`;
  // 배경 클릭 시 닫기
  overlay.addEventListener('click', function(e){
    if(e.target===overlay) overlay.remove();
  });
  document.body.appendChild(overlay);
  try{ refreshShareCardModalMeta(window._shareMatchObj || null); }catch(e){}
}

// 공유카드 초기화
function resetShareCard(el){
  const c=el||document.getElementById('share-card');
  if(!c)return;
  c.innerHTML='<p style="text-align:center;color:var(--gray-l);padding:36px 20px;font-size:13px">위에서 선택하면 카드가 생성됩니다</p>';
}

function refreshShareCardModalMeta(src){
  try{
    const t=document.getElementById('sharecard-modal-title');
    const b=document.getElementById('sharecard-modal-badge');
    if(!t || !b) return;
    const m = src || window._shareMatchObj || null;
    const mk = _resolveShareSoloModeKey(m) || String(m?._matchType||'').trim();
    if(['ind','gj','progj'].includes(mk)){
      const map = {
        ind:['⚔️ 개인전 공유 카드','개인전 통일 디자인'],
        gj:['🔥 끝장전 공유 카드','끝장전 통일 디자인'],
        progj:['👑 프로리그 끝장전 공유 카드','프로리그 끝장전 통일 디자인']
      };
      t.textContent = map[mk][0];
      b.textContent = map[mk][1];
      return;
    }
    const teamMap = {
      mini:['⚡ 미니대전 공유 카드','미니대전 매치 디자인'],
      univm:['🏟️ 대학대전 공유 카드','대학대전 매치 디자인'],
      comp:['🏆 대회 공유 카드','대회 매치 디자인'],
      pro:['🏆 프로리그 공유 카드','프로리그 매치 디자인'],
      ck:['🤝 대학CK 공유 카드','대학CK 매치 디자인'],
      tt:['🎯 티어대회 공유 카드','티어대회 매치 디자인'],
      'procomp-team':['🤝 프로리그 팀전 공유 카드','프로리그 팀전 디자인'],
      'procomp-bkt':['🗂️ 프로리그 토너먼트 공유 카드','프로리그 토너먼트 디자인']
    };
    if(teamMap[mk]){
      t.textContent = teamMap[mk][0];
      b.textContent = teamMap[mk][1];
      return;
    }
    t.textContent = '🎴 공유 카드';
    b.textContent = '통합 디자인';
  }catch(e){}
}


try{
  window.openShareCardModal = openShareCardModal;
  window.resetShareCard = resetShareCard;
  window.refreshShareCardModalMeta = refreshShareCardModalMeta;
}catch(e){}
