function showNoticePopup(){
  if(typeof notices==='undefined'||!notices.length) return;
  const active=notices.filter(n=>n.active);
  if(!active.length) return;
  const n=active[0];
  const todayKey='su_notice_hide_'+new Date().toLocaleDateString('ko-KR').replace(/\./g,'').replace(/ /g,'');
  if(localStorage.getItem(todayKey)) return;
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
  window._noticePopupTodayKey=todayKey;
  om('noticePopupModal');
}
function closeNoticePopup(){
  const chk=document.getElementById('notice-no-show-today');
  if(chk&&chk.checked&&window._noticePopupTodayKey){
    localStorage.setItem(window._noticePopupTodayKey,'1');
  }
  cm('noticePopupModal');
}

function init(){
  fixPoints();
  // ELO 미설정 선수에게 기본값 부여
  if(typeof ELO_DEFAULT!=='undefined'){
    players.forEach(p=>{ if(p.elo===undefined||p.elo===null) p.elo=ELO_DEFAULT; });
  }
  const ptier=document.getElementById('p-tier');
  if(ptier) ptier.innerHTML=TIERS.map(t=>`<option value="${t}">${getTierLabel(t)}</option>`).join('');
  try{refreshSel();}catch(e){}
  const mdate=document.getElementById('m-date');
  if(mdate) mdate.valueAsDate=new Date();
  initLoginHash();
  applyLoginState();
  render();
  setTimeout(showNoticePopup, 800);
}
init();
initDark();

// ── 사이트 첫 접속 시 자동 불러오기 ──
(async function autoLoad(){
  try{
    const stored = localStorage.getItem('su_p');
    const hasLocal = stored && JSON.parse(stored).length > 0;
    if(hasLocal) return;
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
      members  = d.members  || d.member  || [];
      tourneys = d.tourneys || d.tournaments || d.tourney || [];
      ttM      = d.ttM      || d.tt      || [];
      if(d.notices && d.notices.length) notices = d.notices;
      if(d.tiers && d.tiers.length) TIERS.splice(0, TIERS.length, ...d.tiers);
      const allD=[...miniM,...univM,...comps,...ckM,...proM];
      const years=new Set(allD.map(m=>(m.d||'').slice(0,4)).filter(y=>/^\d{4}$/.test(y)));
      years.forEach(y=>{if(!yearOptions.includes(y))yearOptions.push(y);});
      yearOptions.sort();
      fixPoints(); save(); init();
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