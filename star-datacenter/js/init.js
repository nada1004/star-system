function showNoticePopup(){
  if(typeof notices==='undefined'||!notices.length) return;
  const active=notices.filter(n=>n.active);
  if(!active.length) return;
  const today=new Date().toLocaleDateString('ko-KR').replace(/\./g,'').replace(/ /g,'');
  // 공지별 개별 숨김 키 — 새 공지는 독립적으로 팝업됨
  const n=active.find(n=>!localStorage.getItem('su_nhide_'+n.id+'_'+today));
  if(!n) return;
  const todayKey='su_nhide_'+n.id+'_'+today;
  const titleEl=document.getElementById('notice-popup-title');
  const bodyEl=document.getElementById('notice-popup-body');
  const dateEl=document.getElementById('notice-popup-date');
  const iconEl=document.getElementById('notice-popup-type-icon');
  const headerEl=document.getElementById('notice-popup-header');
  if(!titleEl||!bodyEl) return;
  titleEl.textContent=n.title||'공지';
  bodyEl.textContent=n.body||'';
  dateEl.textContent=n.date||'';
  iconEl.textContent=n.type||'📢';
  // 타입별 헤더 색상
  const colors={'🔥':'linear-gradient(135deg,#991b1b,#dc2626)','⚠️':'linear-gradient(135deg,#92400e,#d97706)','🎉':'linear-gradient(135deg,#065f46,#059669)'};
  if(headerEl) headerEl.style.background=colors[n.type]||'linear-gradient(135deg,#1e3a8a,#2563eb)';
  window._noticePopupHideKey=todayKey;
  om('noticePopupModal');
}
function closeNoticePopup(){
  const chk=document.getElementById('notice-no-show-today');
  if(chk&&chk.checked&&window._noticePopupHideKey){
    localStorage.setItem(window._noticePopupHideKey,'1');
  }
  cm('noticePopupModal');
}

function init(){
  fixPoints();
  // ELO 미설정 선수에게 기본값 부여
  if(typeof ELO_DEFAULT!=='undefined'){
    players.forEach(p=>{ if(p.elo===undefined||p.elo===null) p.elo=ELO_DEFAULT; });
  }
  // 대회(tourneys) 기록 자동 소급 반영 (미반영분만, 중복 방지 내장)
  if(typeof syncTourneyHistory==='function') syncTourneyHistory();
  // 티어대회 데이터 마이그레이션 (조별리그/브라켓 기록 → ttM 동기화)
  if(typeof _migrateTierTourneys==='function') _migrateTierTourneys();
  // 티어대전 → 티어대회 명칭 마이그레이션
  if(typeof _migrateTierTourName==='function') _migrateTierTourName();
  // 연도 필터는 getYearOptions()가 렌더링 시 동적으로 계산하므로 별도 추출 불필요
  const ptier=document.getElementById('p-tier');
  if(ptier) ptier.innerHTML=TIERS.map(t=>`<option value="${t}">${getTierLabel(t)}</option>`).join('');
  try{refreshSel();}catch(e){}
  initLoginHash();
  applyLoginState();
  render();
  setTimeout(showNoticePopup, 800);
  // 🆕 URL 파라미터로 선수/대학 자동 오픈
  setTimeout(()=>{
    try{
      const params = new URLSearchParams(window.location.search);
      const playerParam = params.get('player');
      const univParam = params.get('univ');
      const queryParam = params.get('query');
      if(playerParam && typeof openPlayerModal==='function'){
        openPlayerModal(decodeURIComponent(playerParam));
      } else if(univParam && typeof openUnivModal==='function'){
        openUnivModal(decodeURIComponent(univParam));
      } else if(queryParam){
        const q = decodeURIComponent(queryParam);
        const exact = players.find(p=>p.name===q);
        if(exact && typeof openPlayerModal==='function'){
          openPlayerModal(q);
        } else {
          if(typeof sw==='function') sw('stats');
          if(typeof statsSub!=='undefined') statsSub='psearch';
          if(typeof _psearchQ!=='undefined') _psearchQ=q;
          if(typeof render==='function') render();
        }
      }
    }catch(e){}
  }, 1200);
}
init();
initDark();

// ─────────────────────────────────────────────────────────────
// 반응형 UI 스케일(자동): 브라우저/기기 폭에 따라 글자/아이콘 크기 자동 조절
// - CSS 변수 --uiS 로 제어 (style.css에서 적용)
// ─────────────────────────────────────────────────────────────
function _applyUiScale(){
  try{
    const w = Math.max(320, Math.min(1920, window.innerWidth || 1024));
    // 모바일은 살짝 작게(정보 밀도↑), 태블릿/PC는 기본
    let s = 1;
    if (w <= 360) s = 0.92;
    else if (w <= 430) s = 0.96;
    else if (w <= 520) s = 0.98;
    else if (w <= 768) s = 1.00;
    else if (w <= 1024) s = 1.02;
    else s = 1.00;
    document.documentElement.style.setProperty('--uiS', String(s));
  }catch(e){}
}
window.addEventListener('resize', ()=>{ _applyUiScale(); }, {passive:true});
_applyUiScale();

// ─────────────────────────────────────────────────────────────
// 상단 탭/필터바: 스와이프/드래그로 가로 스크롤 가능하게(이동 버튼 없이도)
// - 대상: .tabs, .fbar (overflow-x:auto 영역)
// ─────────────────────────────────────────────────────────────
window.enableDragScroll = function(){
  try{
    document.querySelectorAll('.tabs, .fbar').forEach(el=>{
      if (el.dataset.dragScrollBound === '1') return;
      el.dataset.dragScrollBound = '1';
      el.style.cursor = 'grab';
      let down = false, startX = 0, startLeft = 0, moved = false;
      const onDown = (e) => {
        // 버튼/인풋 위에서는 드래그 시작 안 함
        const t = e.target;
        if (t && (t.closest('button') || t.closest('input') || t.closest('select') || t.closest('textarea'))) return;
        down = true; moved = false;
        startX = (e.touches ? e.touches[0].clientX : e.clientX);
        startLeft = el.scrollLeft;
        el.style.cursor = 'grabbing';
      };
      const onMove = (e) => {
        if (!down) return;
        const x = (e.touches ? e.touches[0].clientX : e.clientX);
        const dx = x - startX;
        if (Math.abs(dx) > 4) moved = true;
        el.scrollLeft = startLeft - dx;
        if (moved) e.preventDefault && e.preventDefault();
      };
      const onUp = () => { down = false; el.style.cursor = 'grab'; };
      el.addEventListener('mousedown', onDown);
      el.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
      el.addEventListener('touchstart', onDown, {passive:true});
      el.addEventListener('touchmove', onMove, {passive:false});
      el.addEventListener('touchend', onUp, {passive:true});
      // 드래그 후 클릭 오동작 방지
      el.addEventListener('click', (e)=>{ if(moved){ e.stopPropagation(); e.preventDefault(); moved=false; } }, true);
    });
  }catch(e){}
};
// 초기 1회
setTimeout(()=>{ try{ window.enableDragScroll && window.enableDragScroll(); }catch(e){} }, 400);

// ── 사이트 첫 접속 시 자동 불러오기 ──
(async function autoLoad(){
  try{
    // J()를 사용해 LZ-String 압축 데이터도 올바르게 감지
    const localPlayers = J('su_p');
    if(localPlayers && localPlayers.length > 0) return;
  }catch(e){}
  console.log('[자동 불러오기] 로컬 데이터 없음 → GitHub 자동 로드');
  const _RAW = 'https://raw.githubusercontent.com/nada1004/star-system/main/data.json';
  const _API = 'https://api.github.com/repos/nada1004/star-system/contents/data.json';
  const _CDN = 'https://cdn.jsdelivr.net/gh/nada1004/star-system@main/data.json';
  const _PROXY = 'https://api.allorigins.win/raw?url=' + encodeURIComponent(_RAW);
  const urls = [_RAW, _CDN, _API, _PROXY];
  gsSetStatus && gsSetStatus('🔄 데이터 불러오는 중...','var(--blue)');
  let d = null;
  for(const url of urls){
    try{
      const res = await Promise.race([
        fetch(url, {cache:'no-store', mode:'cors'}),
        new Promise((_,r)=>setTimeout(()=>r(new Error('timeout')),10000))
      ]);
      if(!res || !res.ok) continue;
      const text = await res.text();
      if(!text || !text.trim()) continue;
      let raw;
      try{ raw = JSON.parse(text); }catch(e){ continue; }
      if(raw && raw.content && raw.encoding==='base64'){
        try{
          const b64 = raw.content.replace(/\s/g,'');
          const bin = atob(b64);
          const bytes = new Uint8Array(bin.length);
          for(let i=0;i<bin.length;i++) bytes[i]=bin.charCodeAt(i);
          d = JSON.parse(new TextDecoder('utf-8').decode(bytes));
        }catch(e){ continue; }
      } else {
        d = raw;
      }
      if(d){ console.log('[자동 불러오기] 성공:', url); break; }
    }catch(e){ console.log('[자동 불러오기] 실패:', url, e.message); continue; }
  }
  if(d){
    // LZString 압축 데이터 자동 해제
    if(d && typeof d._lz === 'string'){
      try{ d = JSON.parse(LZString.decompressFromBase64(d._lz)); }
      catch(e){ console.warn('[자동 불러오기] 압축 해제 실패:', e); }
    }
    try{
      players  = d.players  || d.player  || [];
      univCfg  = d.univCfg  || d.univConfig || d.universities || univCfg;
      maps     = d.maps     || d.map     || maps;
      tourD    = d.tourD    || d.tournamentDates || Array(15).fill('');
      miniM    = d.miniM    || d.mini    || d.miniMatches || [];
      univM    = d.univM    || d.univ    || d.univMatches || [];
      comps    = d.comps    || d.comp    || d.competitions || [];
      ckM      = d.ckM      || d.ck      || d.ckMatches   || [];
      compNames= d.compNames|| d.competitionNames || [];
      curComp  = d.curComp  || d.currentComp || '';
      proM     = d.proM     || d.pro     || d.proMatches  || [];
      tourneys = d.tourneys || d.tournaments || d.tourney || [];
      ttM      = d.ttM      || d.tt      || [];
      if(d.notices && d.notices.length) notices = d.notices;
      if(d.tiers && d.tiers.length) TIERS.splice(0, TIERS.length, ...d.tiers);
      const allD=[...miniM,...univM,...comps,...ckM,...proM];
      const years=new Set(allD.map(m=>(m.d||'').slice(0,4)).filter(y=>/^\d{4}$/.test(y)));
      years.forEach(y=>{if(!yearOptions.includes(y))yearOptions.push(y);});
      yearOptions.sort();
      fixPoints();
      // autoLoad 후 티어대회 마이그레이션 재실행 (flag 리셋 후 재호출)
      if(typeof _migrateTierTourneys==='function'){
        if(typeof _ttMigrated!=='undefined') _ttMigrated=false;
        _migrateTierTourneys();
      }
      // autoLoad 후 티어대전→티어대회 명칭 마이그레이션 재실행
      if(typeof _migrateTierTourName==='function'){
        if(typeof _tierTourNameMigrated!=='undefined') _tierTourNameMigrated=false;
        _migrateTierTourName();
      }
      save(); render();
      gsSetStatus && gsSetStatus('✅ 자동 불러오기 완료 ('+new Date().toLocaleTimeString()+')','var(--green)');
    }catch(e){
      console.error('[자동 불러오기] 데이터 적용 오류:', e);
      gsSetStatus && gsSetStatus('','');
    }
  } else {
    gsSetStatus && gsSetStatus('','');
    console.warn('[자동 불러오기] 모든 URL 실패');
  }
})();
