function _rebuildPlayerDetailWithChart(name){
  const st = (typeof getPlayerDetailState==='function') ? getPlayerDetailState() : (window.PlayerDetailState||{});
  if(typeof window._rebuildPlayerDetail==='function') window._rebuildPlayerDetail(name);
  try{ setTimeout(()=>initPEloChart(name,st.year||''),60); }catch(e){}
}

function _pdResetHistPaging(){
  const st = (typeof getPlayerDetailState==='function') ? getPlayerDetailState() : (window.PlayerDetailState||{});
  st.oppPage = 0;
  playerHistPage = 0;
}

function _pdSetSingleModeFilter(name, value){
  const st = (typeof getPlayerDetailState==='function') ? getPlayerDetailState() : (window.PlayerDetailState||{});
  st.histFilter = value || '';
  st.histFilters = [];
  _pdResetHistPaging();
  if(typeof window._rebuildPlayerDetail==='function') window._rebuildPlayerDetail(name);
}

function _pdSetSingleYearFilter(name, value){
  const st = (typeof getPlayerDetailState==='function') ? getPlayerDetailState() : (window.PlayerDetailState||{});
  st.year = value || '';
  st.years = [];
  _pdResetHistPaging();
  _rebuildPlayerDetailWithChart(name);
}

function _playerHistSetAll(name, allModes, checked){
  const st = (typeof getPlayerDetailState==='function') ? getPlayerDetailState() : (window.PlayerDetailState||{});
  st.histFilters = checked ? [] : [...allModes];
  st.histFilter = '';
  _pdResetHistPaging();
  if(typeof window._rebuildPlayerDetail==='function') window._rebuildPlayerDetail(name);
}

function _playerHistToggleMode(name, mode, checked){
  const st = (typeof getPlayerDetailState==='function') ? getPlayerDetailState() : (window.PlayerDetailState||{});
  const arr = Array.isArray(st.histFilters) ? [...st.histFilters] : [];
  if(checked){
    if(!arr.includes(mode)) arr.push(mode);
  }else{
    const idx=arr.indexOf(mode);
    if(idx>-1) arr.splice(idx,1);
  }
  st.histFilters = arr;
  st.histFilter = arr.length===1 ? arr[0] : '';
  _pdResetHistPaging();
  if(typeof window._rebuildPlayerDetail==='function') window._rebuildPlayerDetail(name);
}

function _playerYearSetAll(name, allYears, checked){
  const st = (typeof getPlayerDetailState==='function') ? getPlayerDetailState() : (window.PlayerDetailState||{});
  st.years = checked ? [] : [...allYears];
  st.year = '';
  _pdResetHistPaging();
  _rebuildPlayerDetailWithChart(name);
}

function _playerYearToggle(name, year, checked){
  const st = (typeof getPlayerDetailState==='function') ? getPlayerDetailState() : (window.PlayerDetailState||{});
  const arr = Array.isArray(st.years) ? [...st.years] : [];
  if(checked){
    if(!arr.includes(year)) arr.push(year);
  }else{
    const idx=arr.indexOf(year);
    if(idx>-1) arr.splice(idx,1);
  }
  st.years = arr;
  st.year = arr.length===1 ? arr[0] : '';
  _pdResetHistPaging();
  _rebuildPlayerDetailWithChart(name);
}

function _playerYearReset(name){
  const st = (typeof getPlayerDetailState==='function') ? getPlayerDetailState() : (window.PlayerDetailState||{});
  st.year = '';
  st.years = [];
  _pdResetHistPaging();
  _rebuildPlayerDetailWithChart(name);
}

function _playerSeasonSetAll(name, allSeasonIds, checked){
  const st = (typeof getPlayerDetailState==='function') ? getPlayerDetailState() : (window.PlayerDetailState||{});
  if(checked){
    st.seasonFilters = [];
    st.seasonFilter = '전체';
  }else{
    st.seasonFilters = [...allSeasonIds];
    st.seasonFilter = 'multi';
  }
  playerHistPage = 0;
  if(typeof window._rebuildPlayerDetail==='function') window._rebuildPlayerDetail(name);
}

function _playerSeasonToggle(name, seasonId, checked){
  const st = (typeof getPlayerDetailState==='function') ? getPlayerDetailState() : (window.PlayerDetailState||{});
  const arr = Array.isArray(st.seasonFilters) ? [...st.seasonFilters] : [];
  if(checked){
    if(!arr.includes(seasonId)) arr.push(seasonId);
  }else{
    const idx = arr.indexOf(seasonId);
    if(idx > -1) arr.splice(idx, 1);
  }
  st.seasonFilters = arr;
  st.seasonFilter = arr.length===1 ? arr[0] : (arr.length>1 ? 'multi' : '전체');
  playerHistPage = 0;
  if(typeof window._rebuildPlayerDetail==='function') window._rebuildPlayerDetail(name);
}

function _playerSeasonSetSingle(name, seasonId){
  const st = (typeof getPlayerDetailState==='function') ? getPlayerDetailState() : (window.PlayerDetailState||{});
  st.seasonFilter = seasonId || '전체';
  st.seasonFilters = [];
  playerHistPage = 0;
  if(typeof window._rebuildPlayerDetail==='function') window._rebuildPlayerDetail(name);
}

function _pdReadJsonAttr(el, key, fallback){
  try{
    const raw = el.getAttribute(key);
    return raw ? JSON.parse(raw) : fallback;
  }catch(e){
    return fallback;
  }
}

function _pdBindDelegatedEvents(){
  if(window._pdDelegatedEventsBound) return;
  window._pdDelegatedEventsBound = true;

  document.addEventListener('click', (e)=>{
    const el = e.target && e.target.closest ? e.target.closest('[data-pd-action]') : null;
    if(!el) return;
    const action = el.getAttribute('data-pd-action');
    const name = el.getAttribute('data-pd-name') || '';
    if(!action) return;

    if(action === 'hist-set-all'){
      e.preventDefault();
      const cb = el.querySelector('input');
      if(cb) cb.checked = !cb.checked;
      _playerHistSetAll(name, _pdReadJsonAttr(el, 'data-pd-all-modes', []), !!(cb && cb.checked));
      return;
    }
    if(action === 'hist-toggle-mode'){
      e.preventDefault();
      const cb = el.querySelector('input');
      if(cb) cb.checked = !cb.checked;
      _playerHistToggleMode(name, el.getAttribute('data-pd-mode') || '', !!(cb && cb.checked));
      return;
    }
    if(action === 'year-set-all'){
      e.preventDefault();
      const cb = el.querySelector('input');
      if(cb) cb.checked = !cb.checked;
      _playerYearSetAll(name, _pdReadJsonAttr(el, 'data-pd-all-years', []), !!(cb && cb.checked));
      return;
    }
    if(action === 'year-toggle'){
      e.preventDefault();
      const cb = el.querySelector('input');
      if(cb) cb.checked = !cb.checked;
      _playerYearToggle(name, el.getAttribute('data-pd-year') || '', !!(cb && cb.checked));
      return;
    }
    if(action === 'year-reset'){
      e.preventDefault();
      _playerYearReset(name);
      return;
    }
    if(action === 'season-set-all'){
      e.preventDefault();
      const cb = el.querySelector('input');
      if(cb) cb.checked = !cb.checked;
      _playerSeasonSetAll(name, _pdReadJsonAttr(el, 'data-pd-all-seasons', []), !!(cb && cb.checked));
      return;
    }
    if(action === 'season-toggle'){
      e.preventDefault();
      const cb = el.querySelector('input');
      if(cb) cb.checked = !cb.checked;
      _playerSeasonToggle(name, el.getAttribute('data-pd-season') || '', !!(cb && cb.checked));
      return;
    }
    if(action === 'season-single'){
      e.preventDefault();
      _playerSeasonSetSingle(name, el.getAttribute('data-pd-season') || '전체');
      return;
    }
  });

  document.addEventListener('change', (e)=>{
    const el = e.target && e.target.closest ? e.target.closest('[data-pd-action]') : null;
    if(!el) return;
    const action = el.getAttribute('data-pd-action');
    const name = el.getAttribute('data-pd-name') || '';
    if(action === 'hist-select'){
      _pdSetSingleModeFilter(name, el.value || '');
      return;
    }
    if(action === 'year-select'){
      _pdSetSingleYearFilter(name, el.value || '');
    }
  });
}

function buildPlayerHistFilterBar(opts){
  const {
    allModes=[],
    isLoggedIn=false,
    selectedFilters=[],
    selectedFilter='',
    pName='',
    chipFs='10px',
    chipPad='2px 6px',
    chipR='8px'
  } = opts || {};
  if(allModes.length<=1) return '';
  const safeName = (typeof escJS==='function') ? escJS(pName) : String(pName||'').replace(/'/g,"\\'");
  return `<div class="pd-hist-filter-bar" style="display:flex;gap:4px;flex-wrap:wrap;margin:0 0 8px;align-items:center">
    <span style="font-size:${chipFs}px;font-weight:900;color:var(--text3);flex-shrink:0">종목</span>
    ${isLoggedIn?`<div style="display:flex;gap:4px;flex-wrap:wrap">
      <label class="mode-filter-chip ${selectedFilters.length===0?'active':''}" data-pd-action="hist-set-all" data-pd-name="${safeName}" data-pd-all-modes='${JSON.stringify(allModes).replace(/'/g,'&#39;')}' style="display:flex;align-items:center;gap:4px;font-size:${chipFs}px;font-weight:900;padding:${chipPad};border-radius:${chipR};border:1px solid var(--border2);background:${selectedFilters.length===0?'var(--blue)':'var(--surface)'};color:${selectedFilters.length===0?'#fff':'var(--text3)'};cursor:pointer">
        <input type="checkbox" ${selectedFilters.length===0?'checked':''} style="cursor:pointer;pointer-events:none">전체
      </label>
      ${allModes.map(m=>`<label class="mode-filter-chip ${selectedFilters.includes(m)?'active':''}" data-pd-action="hist-toggle-mode" data-pd-name="${safeName}" data-pd-mode="${String(m).replace(/"/g,'&quot;')}" style="display:flex;align-items:center;gap:4px;font-size:${chipFs}px;font-weight:900;padding:${chipPad};border-radius:${chipR};border:1px solid var(--border2);background:${selectedFilters.includes(m)?'var(--blue)':'var(--surface)'};color:${selectedFilters.includes(m)?'#fff':'var(--text3)'};cursor:pointer">
        <input type="checkbox" value="${m}" ${selectedFilters.includes(m)?'checked':''} style="cursor:pointer;pointer-events:none">${m}
      </label>`).join('')}
    </div>`:`<select data-pd-action="hist-select" data-pd-name="${safeName}"
      style="padding:2px 6px;border:1px solid ${selectedFilter?'var(--blue)':'var(--border2)'};border-radius:8px;font-size:10px;font-weight:900;background:${selectedFilter?'#eff6ff':'var(--white)'};color:${selectedFilter?'var(--blue)':'var(--text)'}">
      <option value="" ${!selectedFilter?'selected':''}>전체</option>
      ${allModes.map(m=>`<option value="${m}" ${selectedFilter===m?'selected':''}>${m}</option>`).join('')}
    </select>`}
  </div>`;
}

function buildPlayerYearFilterBar(opts){
  const {
    availYears=[],
    isLoggedIn=false,
    selectedYears=[],
    selectedYear='',
    modeHist=[],
    pName='',
    chipFs='10px',
    chipPad='2px 6px',
    chipR='8px',
    isMobile=false
  } = opts || {};
  if(availYears.length<=0) return '';
  const safeName = (typeof escJS==='function') ? escJS(pName) : String(pName||'').replace(/'/g,"\\'");
  const yWin=modeHist.filter(h=>h.result==='승').length;
  const yLoss=modeHist.filter(h=>h.result==='패').length;
  const yTot=yWin+yLoss;
  const yWr=yTot?Math.round(yWin/yTot*100):0;
  return `<div class="pd-year-filter-bar" style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin:0 0 10px;padding:${isMobile?'5px 7px':'6px 8px'};background:var(--surface);border:1px solid var(--border);border-radius:10px">
    <span style="font-size:${chipFs}px;font-weight:900;color:var(--text3);flex-shrink:0">연도</span>
    ${isLoggedIn?`<div style="display:flex;gap:4px;flex-wrap:wrap">
      <label class="year-filter-chip ${selectedYears.length===0?'active':''}" data-pd-action="year-set-all" data-pd-name="${safeName}" data-pd-all-years='${JSON.stringify(availYears).replace(/'/g,'&#39;')}' style="display:flex;align-items:center;gap:4px;font-size:${chipFs}px;font-weight:900;padding:${chipPad};border-radius:${chipR};border:1px solid var(--border2);background:${selectedYears.length===0?'var(--blue)':'var(--surface)'};color:${selectedYears.length===0?'#fff':'var(--text3)'};cursor:pointer">
        <input type="checkbox" ${selectedYears.length===0?'checked':''} style="cursor:pointer;pointer-events:none">전체
      </label>
      ${availYears.map(y=>`<label class="year-filter-chip ${selectedYears.includes(y)?'active':''}" data-pd-action="year-toggle" data-pd-name="${safeName}" data-pd-year="${String(y).replace(/"/g,'&quot;')}" style="display:flex;align-items:center;gap:4px;font-size:${chipFs}px;font-weight:900;padding:${chipPad};border-radius:${chipR};border:1px solid var(--border2);background:${selectedYears.includes(y)?'var(--blue)':'var(--surface)'};color:${selectedYears.includes(y)?'#fff':'var(--text3)'};cursor:pointer">
        <input type="checkbox" value="${y}" ${selectedYears.includes(y)?'checked':''} style="cursor:pointer;pointer-events:none">${y}년
      </label>`).join('')}
    </div>`:`<select data-pd-action="year-select" data-pd-name="${safeName}"
      style="padding:2px 6px;border:1px solid ${selectedYear?'var(--blue)':'var(--border2)'};border-radius:8px;font-size:10px;font-weight:900;background:${selectedYear?'#eff6ff':'var(--white)'};color:${selectedYear?'var(--blue)':'var(--text)'}">
      <option value="" ${!selectedYear?'selected':''}>전체</option>
      ${availYears.map(y=>`<option value="${y}" ${selectedYear===y?'selected':''}>${y}년</option>`).join('')}
    </select>`}
    ${selectedYear&&yTot?`<span style="font-size:10px;font-weight:800;color:var(--text2)">${yWin}승 ${yLoss}패 <span style="color:${yWr>=50?'#16a34a':'#dc2626'}">${yWr}%</span> (${yTot})</span>`:''}
    ${selectedYear?`<button data-pd-action="year-reset" data-pd-name="${safeName}" style="margin-left:auto;padding:2px 8px;border-radius:10px;border:1px solid var(--border2);background:var(--white);font-size:10px;cursor:pointer;font-weight:800;color:var(--text3)">초기화</button>`:''}
  </div>`;
}

function buildPlayerSeasonFilterBar(opts){
  const {
    seasons=[],
    isLoggedIn=false,
    selectedFilters=[],
    selectedFilter='전체',
    pName=''
  } = opts || {};
  if(!seasons || !seasons.length) return '';
  const safeName = (typeof escJS==='function') ? escJS(pName) : String(pName||'').replace(/'/g,"\\'");
  return `<div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:8px;align-items:center">
    <span style="font-size:10px;color:var(--gray-l);font-weight:700">시즌</span>
    ${isLoggedIn?`<div style="display:flex;gap:4px;flex-wrap:wrap">
      <label class="season-filter-chip ${selectedFilters.length===0?'active':''}" data-pd-action="season-set-all" data-pd-name="${safeName}" data-pd-all-seasons='${JSON.stringify(seasons.map(s=>s.id)).replace(/'/g,'&#39;')}' style="display:flex;align-items:center;gap:4px;font-size:10px;font-weight:700;padding:3px 8px;border-radius:10px;border:1px solid var(--border2);background:${selectedFilters.length===0?'var(--blue)':'var(--surface)'};color:${selectedFilters.length===0?'#fff':'var(--text3)'};cursor:pointer;transition:all 0.15s">
        <input type="checkbox" ${selectedFilters.length===0?'checked':''} style="cursor:pointer;pointer-events:none">전체
      </label>
      ${seasons.map(s=>{
        const isOn=selectedFilters.includes(s.id);
        return `<label class="season-filter-chip ${isOn?'active':''}" data-pd-action="season-toggle" data-pd-name="${safeName}" data-pd-season="${s.id}" style="display:flex;align-items:center;gap:4px;font-size:10px;font-weight:700;padding:3px 8px;border-radius:10px;border:1px solid var(--border2);background:${isOn?'var(--blue)':'var(--surface)'};color:${isOn?'#fff':'var(--text3)'};cursor:pointer;transition:all 0.15s">
          <input type="checkbox" value="${s.id}" ${isOn?'checked':''} style="cursor:pointer;pointer-events:none">${s.name}
        </label>`;
      }).join('')}
    </div>`:`<button data-pd-action="season-single" data-pd-name="${safeName}" data-pd-season="전체" style="padding:2px 8px;border-radius:10px;border:1px solid ${selectedFilter==='전체'?'var(--blue)':'var(--border2)'};background:${selectedFilter==='전체'?'var(--blue)':'var(--white)'};color:${selectedFilter==='전체'?'#fff':'var(--text3)'};font-size:10px;font-weight:700;cursor:pointer">전체</button>
    ${seasons.map(s=>{
      const isOn=selectedFilter===s.id;
      return `<button data-pd-action="season-single" data-pd-name="${safeName}" data-pd-season="${s.id}" style="padding:2px 8px;border-radius:10px;border:1px solid ${isOn?'var(--blue)':'var(--border2)'};background:${isOn?'var(--blue)':'var(--white)'};color:${isOn?'#fff':'var(--text3)'};font-size:10px;font-weight:700;cursor:pointer">${s.name}</button>`;
    }).join('')}`}
  </div>`;
}

try{
  _pdBindDelegatedEvents();
  window._pdSetSingleModeFilter = _pdSetSingleModeFilter;
  window._pdSetSingleYearFilter = _pdSetSingleYearFilter;
  window._playerHistSetAll = _playerHistSetAll;
  window._playerHistToggleMode = _playerHistToggleMode;
  window._playerYearSetAll = _playerYearSetAll;
  window._playerYearToggle = _playerYearToggle;
  window._playerYearReset = _playerYearReset;
  window._playerSeasonSetAll = _playerSeasonSetAll;
  window._playerSeasonToggle = _playerSeasonToggle;
  window._playerSeasonSetSingle = _playerSeasonSetSingle;
  window.buildPlayerHistFilterBar = buildPlayerHistFilterBar;
  window.buildPlayerYearFilterBar = buildPlayerYearFilterBar;
  window.buildPlayerSeasonFilterBar = buildPlayerSeasonFilterBar;
}catch(e){}
