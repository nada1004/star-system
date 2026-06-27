// 플레이어 모달용 이미지 프리로드 캐시
;(function _injectPlayerModalPremiumStyle(){
  if(typeof document==='undefined') return;
  if(document.getElementById('player-modal-premium-style')) return;
  const s=document.createElement('style');
  s.id='player-modal-premium-style';
  s.textContent=[
    '#playerModal.modal--player-top{backdrop-filter:blur(8px);background:rgba(15,23,42,.38)}',
    '#playerModal.modal--player-top .mbox,#playerModal.modal--player-top .mbox--player{width:min(1160px,calc(100vw - 24px));max-height:min(92vh,940px);border-radius:30px;background:linear-gradient(180deg,rgba(255,255,255,.985),rgba(248,250,252,.96));border:1px solid rgba(148,163,184,.18);box-shadow:0 30px 64px rgba(15,23,42,.22),inset 0 1px 0 rgba(255,255,255,.88);overflow:hidden}',
    '#playerModal.modal--player-top #playerModalTitle{padding:18px 22px 14px;background:linear-gradient(135deg,rgba(239,246,255,.96),rgba(255,255,255,.92));border-bottom:1px solid rgba(148,163,184,.18);font-size:22px;font-weight:950;letter-spacing:-.03em;color:var(--text1)}',
    '#playerModal.modal--player-top #playerModalBody{padding:18px 20px 22px;background:linear-gradient(180deg,rgba(255,255,255,.94),rgba(248,250,252,.9));overflow:auto}',
    '.pd-premium-shell{display:flex;flex-direction:column;gap:14px}',
    '.pd-premium-shell>div{border-radius:22px!important;box-shadow:0 16px 32px rgba(15,23,42,.06),inset 0 1px 0 rgba(255,255,255,.5)}',
    '.pd-premium-shell>div:first-child{border-radius:26px!important;box-shadow:0 20px 40px rgba(15,23,42,.10),inset 0 1px 0 rgba(255,255,255,.32)}',
    '.pd-premium-shell canvas{border-radius:14px}',
    '.pd-premium-shell .btn,.pd-premium-shell button{box-shadow:0 10px 18px rgba(15,23,42,.05)}',
    'body.dark #playerModal.modal--player-top .mbox,body.dark #playerModal.modal--player-top .mbox--player{background:linear-gradient(180deg,rgba(15,23,42,.98),rgba(15,23,42,.94));border-color:#334155;box-shadow:0 30px 64px rgba(0,0,0,.42),inset 0 1px 0 rgba(255,255,255,.03)}',
    'body.dark #playerModal.modal--player-top #playerModalTitle{background:linear-gradient(180deg,rgba(15,23,42,.96),rgba(15,23,42,.9));border-color:#334155;color:#f8fafc}',
    'body.dark #playerModal.modal--player-top #playerModalBody{background:linear-gradient(180deg,rgba(15,23,42,.92),rgba(15,23,42,.9))}',
    'body.dark .pd-premium-shell>div{box-shadow:0 16px 30px rgba(0,0,0,.2),inset 0 1px 0 rgba(255,255,255,.03)}',
    '@media (max-width:780px){#playerModal.modal--player-top .mbox,#playerModal.modal--player-top .mbox--player{width:min(100vw - 12px,1000px);border-radius:22px}#playerModal.modal--player-top #playerModalTitle{padding:14px 16px 12px;font-size:19px}#playerModal.modal--player-top #playerModalBody{padding:14px 12px 16px}.pd-premium-shell{gap:10px}.pd-premium-shell>div{border-radius:18px!important}.pd-premium-shell>div:first-child{border-radius:20px!important}}'
  ].join('');
  document.head.appendChild(s);
})();

const _pmImgCache = new Map();

// 이미지 URL들을 미리 로드하고, 모두 완료(또는 타임아웃)되면 resolve
function _prewarmPlayerModalImages(p){
  try{
    const urls = [];
    if(p.photo) urls.push(typeof toHttpsUrl==='function' ? toHttpsUrl(p.photo) : p.photo);
    try{
      const pdStyle = JSON.parse(localStorage.getItem('su_pd_style')||'{}');
      const isMobile = window.innerWidth<=768;
      const imgUrlLegacy = isMobile?(pdStyle.img2||''):(pdStyle.img1||'');
      const bgImg = (p.detailHeaderBgImg||pdStyle.header_bg_img||imgUrlLegacy||'').trim();
      if(bgImg) urls.push(typeof toHttpsUrl==='function' ? toHttpsUrl(bgImg) : bgImg);
    }catch(e){}

    const filtered = urls.filter(Boolean);
    if(!filtered.length) return Promise.resolve();

    const promises = filtered.map(src => {
      // 이미 캐시에 있고 완료된 이미지면 즉시 resolve
      const cached = _pmImgCache.get(src);
      if(cached && cached.complete && cached.naturalWidth > 0) return Promise.resolve();

      return new Promise(resolve => {
        const img = new Image();
        img.decoding = 'async';
        img.fetchPriority = 'high';
        const done = () => resolve();
        img.onload = done;
        img.onerror = done;
        img.src = src;
        _pmImgCache.set(src, img);
        if(_pmImgCache.size > 40){
          const firstKey = _pmImgCache.keys().next().value;
          _pmImgCache.delete(firstKey);
        }
      });
    });

    // 최대 400ms 대기 (그 이후엔 그냥 표시)
    return Promise.race([
      Promise.all(promises),
      new Promise(r => setTimeout(r, 400))
    ]);
  }catch(e){
    return Promise.resolve();
  }
}

function _doOpenPlayerModal(name, p){
  const st = (typeof getPlayerDetailState==='function') ? getPlayerDetailState() : (window.PlayerDetailState||{});
  const em = document.getElementById('emModal');
  const isEditModalOpen = !!(em && getComputedStyle(em).display !== 'none');
  const keepEditModalFront = !!window._suppressPlayerModalFront || (isEditModalOpen && st.currentName === name);
  try{
    const pm = document.getElementById('playerModal');
    if(pm){
      if(!keepEditModalFront && typeof window._bringModalToFront === 'function') window._bringModalToFront(pm);
      pm.classList.add('modal--player-top');
    }
  }catch(e){}
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
  if(!keepEditModalFront) om('playerModal');
  try{ if(typeof window._syncTabUrlFromState==='function') window._syncTabUrlFromState('replace'); }catch(e){}
  setTimeout(()=>initPEloChart(name),60);
}

function openPlayerModal(name){
  const p=players.find(x=>x.name===name);
  if(!p)return;

  // 이미지를 미리 로드한 뒤 모달 오픈 (최대 400ms 대기, 캐시 히트 시 즉시)
  _prewarmPlayerModalImages(p).then(()=>{
    _doOpenPlayerModal(name, p);
  }).catch(()=>{
    _doOpenPlayerModal(name, p);
  });
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
