function openPlayerModal(name){
  const p=players.find(x=>x.name===name);
  if(!p)return;
  const st = (typeof getPlayerDetailState==='function') ? getPlayerDetailState() : (window.PlayerDetailState||{});
  try{
    const sc=document.getElementById('sharecard-overlay');
    if(sc) sc.remove();
  }catch(e){}
  if(st.currentName!==name){
    playerHistPage=0;
    st.oppPage=0;
    st.oppSort='tot';
    st.year='';
    st.years=[];
    st.histFilter='';
    st.histFilters=[];
    st.seasonFilter='전체';
    st.seasonFilters=[];
  }
  document.getElementById('playerModalTitle').innerText=`👤 ${name} 스트리머 상세`;
  const sub=document.getElementById('playerModalSub');
  if(sub){
    sub.innerText=`${p.univ||'무소속'} · ${p.tier||'티어 미정'} · ${p.race||'종족 미정'} · 전적과 상대 기록 확인`;
  }
  const heroMeta=document.getElementById('playerModalHeroMeta');
  if(heroMeta){
    const tot=(p.win||0)+(p.loss||0);
    const wr=tot?Math.round((p.win||0)/tot*100):0;
    heroMeta.innerHTML = `
      <span class="detail-hero-chip"><b>${p.win||0}-${p.loss||0}</b><small>전적</small></span>
      <span class="detail-hero-chip"><b>${tot?wr+'%':'-'}</b><small>승률</small></span>
      <span class="detail-hero-chip"><b>${p.elo||1000}</b><small>ELO</small></span>
    `;
  }
  const avatar=document.getElementById('playerModalAvatar');
  if(avatar){
    const fallback = `<div class="detail-avatar-fallback">${String(p.name||'?').slice(0,1)}</div>`;
    try{
      avatar.innerHTML = (typeof getPlayerPhotoHTML === 'function')
        ? (getPlayerPhotoHTML(p.name,'64px','border:3px solid rgba(255,255,255,.92);box-shadow:0 10px 24px rgba(37,99,235,.18);background:#fff;object-fit:cover') || fallback)
        : fallback;
    }catch(e){
      avatar.innerHTML = fallback;
    }
  }
  const mbody=document.getElementById('playerModalBody');
  mbody.innerHTML=buildPlayerDetailHTML(p);
  const pdFs=(JSON.parse(localStorage.getItem('su_pd_style')||'{}').font_size||'normal');
  mbody.style.zoom=pdFs==='xlarge'?'1.2':pdFs==='large'?'1.12':'1';
  injectUnivIcons(mbody);
  const editBtn=document.getElementById('playerModalEditBtn');
  const editBtnMobile=document.getElementById('playerModalEditBtnMobile');
  if(editBtn){
    editBtn.style.display=isLoggedIn?'inline-flex':'none';
    editBtn.dataset.playerName=name;
  }
  if(editBtnMobile){
    editBtnMobile.style.display=isLoggedIn?'inline-flex':'none';
    editBtnMobile.dataset.playerName=name;
  }
  st.currentName=name;
  try{
    window.__suModalPlayerName = name;
    window.__suModalUnivName = '';
    if(typeof window.__suSyncUrlState==='function') window.__suSyncUrlState();
  }catch(e){}
  om('playerModal');
  setTimeout(()=>initPEloChart(name),60);
}

if(typeof window.openEPFromModal !== 'function'){
  window.openEPFromModal = function(nameArg) {
    const st = (typeof getPlayerDetailState==='function') ? getPlayerDetailState() : (window.PlayerDetailState||{});
    const name = nameArg || st.currentName;
    if (!name) { alert('선수 이름을 확인할 수 없습니다.'); return; }
    try{ if(typeof cm==='function') cm('playerModal'); }catch(e){}
    if (typeof openEP !== 'function') {
      let attempts = 0;
      const checkOpenEP = setInterval(() => {
        attempts++;
        if (typeof openEP === 'function') {
          clearInterval(checkOpenEP);
          try { setTimeout(()=>openEP(name), 50); } catch(e) { alert('수정창 열기 실패: ' + e.message); }
        } else if (attempts >= 20) {
          clearInterval(checkOpenEP);
          alert('수정창 로드 실패: 페이지를 새로고침해주세요.');
        }
      }, 200);
      return;
    }
    try { setTimeout(()=>openEP(name), 50); } catch(e) { alert('수정창 열기 실패: ' + e.message); }
  };
}

try{
  window.openPlayerModal = openPlayerModal;
}catch(e){}
