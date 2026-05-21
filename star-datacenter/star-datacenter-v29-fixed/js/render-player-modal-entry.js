function openPlayerModal(name){
  const p=players.find(x=>x.name===name);
  if(!p)return;
  try{
    const pm = document.getElementById('playerModal');
    if(pm){
      if(typeof window._bringModalToFront === 'function') window._bringModalToFront(pm);
      pm.classList.add('modal--player-top');
    }
  }catch(e){}
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
  document.getElementById('playerModalTitle').innerHTML=`<span class="detail-main">👤 ${name}</span>`;
  const mbody=document.getElementById('playerModalBody');
  mbody.innerHTML=buildPlayerDetailHTML(p);
  const pdFs=(JSON.parse(localStorage.getItem('su_pd_style')||'{}').font_size||'normal');
  mbody.style.zoom=pdFs==='xlarge'?'1.2':pdFs==='large'?'1.12':'1';
  injectUnivIcons(mbody);
  const editBtn=document.getElementById('playerModalEditBtn');
  if(editBtn){
    const canEdit = !!(typeof isLoggedIn!=='undefined' && isLoggedIn) && !(typeof isSubAdmin!=='undefined' && isSubAdmin);
    editBtn.style.display=canEdit?'inline-flex':'none';
    editBtn.dataset.playerName=name;
  }
  st.currentName=name;
  om('playerModal');
  try{ if(typeof window._syncTabUrlFromState==='function') window._syncTabUrlFromState('replace'); }catch(e){}
  setTimeout(()=>initPEloChart(name),60);
}

if(typeof window.openEPFromModal !== 'function'){
  window.openEPFromModal = function(nameArg) {
    const canEdit = !!(typeof isLoggedIn!=='undefined' && isLoggedIn) && !(typeof isSubAdmin!=='undefined' && isSubAdmin);
    if(!canEdit){ alert('총관리자만 수정할 수 있습니다.'); return; }
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
