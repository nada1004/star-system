function preparePlayerHeaderDisplayData(opts){
  const {
    player,
    isMobile=false,
    isTablet=false,
    histAll=[],
    eloVal=ELO_DEFAULT,
    winColor='#16a34a',
    lossColor='#dc2626'
  } = opts || {};
  const p = player;
  if(!p) return { photoHTML:'', channelHTML:'', eloSparkHTML:'' };

  const photoHTML = (()=>{
    if(p.photo){
      const raceL=p.race||'?';
      const imgSettings=(typeof suReadImgSettings==='function')
        ? suReadImgSettings()
        : (JSON.parse(localStorage.getItem('su_img_settings')||'{}'));
      const imgScale = isMobile ? (imgSettings.scaleMb||imgSettings.scale||1) : (isTablet ? (imgSettings.scaleTb||imgSettings.scale||1) : (imgSettings.scalePc||imgSettings.scale||1));
      const imgBrightness=imgSettings.brightness||1;
      let imageFit = 'cover'; // 스트리머 상세 팝업은 기본 cover(꽉 채움)
      let imagePos = 'center center';
      try{
        const dk = (typeof _getMdDeviceKey === 'function') ? _getMdDeviceKey() : (isMobile ? 'mb' : (isTablet ? 'tb' : 'pc'));
        const mdFit = (localStorage.getItem(`su_md_avatar_fit_${dk}`) || localStorage.getItem('su_md_avatar_fit') || '').trim();
        const mdPos = (localStorage.getItem(`su_md_avatar_pos_${dk}`) || localStorage.getItem('su_md_avatar_pos') || 'center center').trim();
        // fill(늘리기)은 100% 100%로 적용 (object-fit: fill은拉伸变形이므로 background-size 방식 사용)
        if(mdFit === 'fill') {
          imageFit = '100% 100%';
        } else if(mdFit === 'cover' || mdFit === 'contain') {
          imageFit = mdFit;
        }
        else if(typeof imgSettings.fill === 'boolean') imageFit = imgSettings.fill ? 'cover' : 'contain';
        else imageFit = (localStorage.getItem('su_b2ImageFill') === '0' ? 'cover' : 'contain');
        if(mdPos) imagePos = mdPos;
      }catch(e){
        imageFit = (typeof imgSettings.fill === 'boolean')
          ? (imgSettings.fill ? 'cover' : 'contain')
          : (localStorage.getItem('su_b2ImageFill') === '0' ? 'cover' : 'contain');
        imagePos = 'center center';
      }
      // (요청사항) 스트리머별 프로필 사진 1 얼굴 위치 보정값이 있으면 스트리머 상세(헤더 프로필 사진)에 우선 적용
      try{
        const use = (p.photoPosUse !== false); // 기본: 사용(하위호환)
        const x = Number(p.photoPosX), y = Number(p.photoPosY);
        if(use && Number.isFinite(x) && Number.isFinite(y)){
          const xx = Math.max(0, Math.min(100, x));
          const yy = Math.max(0, Math.min(100, y));
          imagePos = `${xx}% ${yy}%`;
        }
      }catch(e){}
      // (요청사항) 프로필 이미지를 선택한 모양에 맞게 꽉 채우기
      const _profShape=(()=>{try{return localStorage.getItem('su_profile_shape')||'circle';}catch(e){return 'circle';}})();
      const _profClipMap={
        diamond:'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
        hexagon:'polygon(25% 6.7%, 75% 6.7%, 100% 50%, 75% 93.3%, 25% 93.3%, 0% 50%)',
        shield:'polygon(0% 0%, 100% 0%, 100% 60%, 50% 100%, 0% 60%)',
        pentagon:'polygon(50% 0%,100% 38%,82% 100%,18% 100%,0% 38%)',
        star:'polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)',
        leaf:'polygon(50% 0%,100% 50%,50% 100%,0% 50%)',
        triangle:'polygon(50% 0%, 0% 100%, 100% 100%)',
        octagon:'polygon(30% 0%,70% 0%,100% 30%,100% 70%,70% 100%,30% 100%,0% 70%,0% 30%)',
        cross:'polygon(33% 0%,67% 0%,67% 33%,100% 33%,100% 67%,67% 67%,67% 100%,33% 100%,33% 67%,0% 67%,0% 33%,33% 33%)',
        parallelogram:'polygon(15% 0%, 100% 0%, 85% 100%, 0% 100%)',
        arrow:'polygon(0% 0%,75% 0%,100% 50%,75% 100%,0% 100%,25% 50%)'
      };
      const _profClipInline=_profClipMap[_profShape]?`clip-path:${_profClipMap[_profShape]};`:'';
      // 모양이 cover가 아닐 경우 강제 cover 적용 (꽉 채워야 모양이 깔끔함)
      const _finalFit=(imageFit==='contain'&&_profShape!=='circle'&&_profShape!=='square'&&_profShape!=='rounded')?'cover':imageFit;
      return `<span style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:28px;font-weight:900;color:rgba(255,255,255,.65)">${raceL}</span><img src="${toHttpsUrl(p.photo)}" decoding="async" fetchpriority="high" style="position:absolute;inset:0;width:100%;height:100%;object-fit:${_finalFit};object-position:${imagePos};transform:scale(${imgScale});filter:brightness(${imgBrightness});${_profClipInline}" onerror="this.style.display='none'">`;
    }
    const url=UNIV_ICONS[p.univ]||(univCfg.find(x=>x.name===p.univ)||{}).icon||'';
    return url
      ? `<img src="${toHttpsUrl(url)}" style="width:42px;height:42px;object-fit:contain;filter:brightness(0) invert(1) opacity(0.9)" onerror="this.outerHTML='<svg xmlns=\\'http://www.w3.org/2000/svg\\' viewBox=\\'0 0 24 24\\' fill=\\'white\\' width=\\'32\\' height=\\'32\\'><path d=\\'M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z\\'/></svg>'">`
      : `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white' width='32' height='32'><path d='M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z'/></svg>`;
  })();

  const channelHTML = (()=>{
    if(!p.channelUrl) return '';
    const url=p.channelUrl;
    let icon='🏠', label='방송';
    if(url.includes('chzzk.naver.com')){icon='<img src="https://ssl.pstatic.net/static/nng/glive/icon/favicon.png" style="width:13px;height:13px;border-radius:3px" onerror="this.outerHTML=\'🎮\'">';label='치지직';}
    else if(url.includes('afreecatv.com')){icon='<img src="https://res.afreecatv.com/images/aflogo.png" style="width:13px;height:13px;border-radius:3px" onerror="this.outerHTML=\'📺\'">';label='아프리카';}
    else if(url.includes('youtube.com')||url.includes('youtu.be')){icon='<img src="https://www.youtube.com/favicon.ico" style="width:13px;height:13px;border-radius:3px" onerror="this.outerHTML=\'▶️\'">';label='유튜브';}
    else if(url.includes('twitch.tv')){icon='<img src="https://static.twitchcdn.net/assets/favicon-32-e29e246c157142c1a5e8.png" style="width:13px;height:13px;border-radius:3px" onerror="this.outerHTML=\'📡\'">';label='트위치';}
    return `<a href="${url}" target="_blank" style="display:inline-flex;align-items:center;gap:4px;padding:3px 9px;border-radius:20px;background:rgba(255,255,255,.22);border:1.5px solid rgba(255,255,255,.38);text-decoration:none;font-size:11px;font-weight:700;color:#fff;flex-shrink:0">${icon} ${label}</a>`;
  })();

  const eloSparkHTML = (()=>{
    const deltas=histAll.filter(h=>h.eloDelta!=null).slice(-12);
    if(deltas.length<2) return '';
    let cur=eloVal;
    [...deltas].reverse().forEach(h=>{cur-=h.eloDelta;});
    let val=cur; const elos=[val];
    deltas.forEach(h=>{val+=h.eloDelta;elos.push(val);});
    const mn=Math.min(...elos),mx=Math.max(...elos),rng=mx-mn||1;
    const SW=60,SH=20;
    const coords=elos.map((e,i)=>`${Math.round(i/(elos.length-1)*SW)},${Math.round(SH-((e-mn)/rng)*SH)}`);
    const lc=elos[elos.length-1]>=elos[elos.length-2]?winColor:lossColor;
    return `<svg viewBox="0 0 ${SW} ${SH}" width="${SW}" height="${SH}" style="display:block;margin:3px auto 0;overflow:visible"><polyline points="${coords.join(' ')}" fill="none" stroke="${lc}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  })();

  return { photoHTML, channelHTML, eloSparkHTML };
}

function preparePlayerRecentSectionData(opts){
  const {
    player,
    modeHist=[],
    seasonsList=[],
    pageSize=20
  } = opts || {};
  const p = player;
  if(!p){
    return { seasonBar:'', filteredHist:[], totalGames:0, totalPages:1, curPage:0, displayHist:[], fromN:0, toN:0 };
  }
  let seasonBar='';
  if(seasonsList && seasonsList.length){
    const st = (typeof getPlayerDetailState==='function') ? getPlayerDetailState() : (window.PlayerDetailState||{});
    if(!st.seasonFilters) st.seasonFilters=[];
    if(!st.seasonFilter) st.seasonFilter='전체';
    seasonBar = (typeof buildPlayerSeasonFilterBar==='function')
      ? buildPlayerSeasonFilterBar({
          seasons: seasonsList,
          isLoggedIn,
          selectedFilters: st.seasonFilters,
          selectedFilter: st.seasonFilter,
          pName: p.name
        })
      : '';
  }
  const curSeason=(()=>{
    const st = (typeof getPlayerDetailState==='function') ? getPlayerDetailState() : (window.PlayerDetailState||{});
    if(!st.seasonFilter||st.seasonFilter==='전체') return null;
    return (seasonsList||[]).find(s=>s.id===st.seasonFilter)||null;
  })();
  const st = (typeof getPlayerDetailState==='function') ? getPlayerDetailState() : (window.PlayerDetailState||{});
  const curSeasons=(st.seasonFilters&&st.seasonFilters.length>0)
    ?(seasonsList||[]).filter(s=>st.seasonFilters.includes(s.id))
    :(curSeason?[curSeason]:[]);
  const filteredHist = curSeasons.length>0
    ? modeHist.filter(hh=>{
        const d=hh.date||'';
        return curSeasons.some(season=>d>=(season.start||'') && d<=(season.end||'9999-99-99'));
      })
    : modeHist;
  const totalGames=filteredHist.length;
  const totalPages=Math.ceil(totalGames/pageSize)||1;
  if(typeof playerHistPage!=='number' || isNaN(playerHistPage)) playerHistPage=0;
  const curPage=Math.max(0,Math.min(playerHistPage,totalPages-1));
  const historyRef = Array.isArray(p?.history) ? p.history : [];
  const sortedHist=[...filteredHist.map(h=>({...h,_origIdx:historyRef.indexOf(h)}))]
    .sort((a,b)=>(b.date||'').localeCompare(a.date||'')||(b.time||0)-(a.time||0));
  const displayHist = sortedHist.slice(curPage*pageSize,(curPage+1)*pageSize);
  const fromN = (curPage*pageSize+1);
  const toN = Math.min((curPage+1)*pageSize,totalGames);
  return { seasonBar, filteredHist, totalGames, totalPages, curPage, displayHist, fromN, toN };
}

try{
  window.preparePlayerHeaderDisplayData = preparePlayerHeaderDisplayData;
  window.preparePlayerRecentSectionData = preparePlayerRecentSectionData;
}catch(e){}
