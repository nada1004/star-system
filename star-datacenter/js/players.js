/* ══════════════════════════════════════
   성적 관리
══════════════════════════════════════ */
let totalRaceFilter='전체'; // 스트리머 탭 종족 필터
let totalSearch=''; // 스트리머 탭 이름 검색
let totalHideNoRecord=false; // 전적 없는 선수 숨기기
let _bulkEditMode=false; // 일괄 수정 모드
let _bulkEditSelected=new Set(); // 선택된 스트리머 이름
let _bulkEditSearch=''; // 일괄 수정(선택 모드) 검색어
let totalViewMode='table'; // 'table' | 'gallery'

function _parseTotalSearch(qRaw){
  const q=(qRaw||'').trim().toLowerCase();
  const _RMAP={'테란':'T','테':'T','저그':'Z','저':'Z','프로토스':'P','프토':'P','프':'P','종족미정':'N','미정':'N','?':'N'};
  const _GMAP={'여':'F','여자':'F','남':'M','남자':'M'};
  const toks=q.split(/\s+/).filter(Boolean);
  let rf='', gf='';
  const inc=[], exc=[];
  toks.forEach(t=>{
    if(t.startsWith('-')&&t.length>1){ exc.push(t.slice(1)); return; }
    if(_RMAP[t]) rf=_RMAP[t];
    else if(_GMAP[t]) gf=_GMAP[t];
    else inc.push(t);
  });
  return {rf,gf,inc,exc};
}

function totalApplySearchFilter(){
  const {rf,gf,inc,exc}=_parseTotalSearch(totalSearch);
  const qHas=rf||gf||inc.length||exc.length;
  // 테이블 뷰
  const table=document.querySelector('#rcont table');
  if(table){
    const rows=[...table.querySelectorAll('tr[data-player-row="1"]')];
    rows.forEach(tr=>{
      if(!qHas){ tr.style.display=''; return; }
      const hay=(tr.getAttribute('data-q')||'');
      const r=tr.getAttribute('data-r')||'';
      const g=tr.getAttribute('data-g')||'';
      const okRace=!rf||r===rf;
      const okGender=!gf||g===gf;
      const okInc=inc.length===0||inc.every(t=>hay.includes(t));
      const okExc=exc.length===0||exc.every(t=>!hay.includes(t));
      tr.style.display=(okRace&&okGender&&okInc&&okExc)?'':'none';
    });
    table.querySelectorAll('tr[data-univ-header]').forEach(h=>{
      const u=h.getAttribute('data-univ-header')||'';
      const any=rows.some(r=>r.style.display!== 'none' && r.getAttribute('data-univ')===u);
      h.style.display=any?'':'none';
    });
  }
  // 갤러리 뷰
  const cont=document.getElementById('rcont');
  if(!cont) return;
  const cards=[...cont.querySelectorAll('[data-player-card="1"]')];
  if(!cards.length) return;
  cards.forEach(card=>{
    if(!qHas){ card.style.display=''; return; }
    const hay=(card.getAttribute('data-q')||'');
    const r=card.getAttribute('data-r')||'';
    const g=card.getAttribute('data-g')||'';
    const okRace=!rf||r===rf;
    const okGender=!gf||g===gf;
    const okInc=inc.length===0||inc.every(t=>hay.includes(t));
    const okExc=exc.length===0||exc.every(t=>!hay.includes(t));
    card.style.display=(okRace&&okGender&&okInc&&okExc)?'':'none';
  });
  // 갤러리 대학 섹션 헤더 숨김
  cont.querySelectorAll('[data-gallery-univ-header]').forEach(h=>{
    const u=h.getAttribute('data-gallery-univ-header')||'';
    const any=cards.some(c=>c.style.display!=='none'&&c.getAttribute('data-univ')===u);
    h.style.display=any?'':'none';
  });
}

function bulkApplySearchFilter(){
  const table=document.querySelector('#rcont table');
  if(!table) return;
  const q=(_bulkEditSearch||'').trim().toLowerCase();
  const rows=[...table.querySelectorAll('tr[data-player-row="1"]')];
  if(!_bulkEditMode || !q) return;
  rows.forEach(tr=>{
    if(tr.style.display==='none') return;
    const hay=(tr.getAttribute('data-q')||'');
    if(!hay.includes(q)) tr.style.display='none';
  });
  table.querySelectorAll('tr[data-univ-header]').forEach(h=>{
    const u=h.getAttribute('data-univ-header')||'';
    const any=rows.some(r=>r.style.display!== 'none' && r.getAttribute('data-univ')===u);
    h.style.display=any?'':'none';
  });
}

function rTotal(C,T){
  T.innerText='🎬 전체 스타크래프트 스트리머 리스트';
  // 랭킹 스냅샷 업데이트 (하루 1회)
  if(typeof updateRankSnapshot === 'function') updateRankSnapshot();
  const raceOpts=['전체','T','Z','P','N'];
  const _showBulk=isLoggedIn&&_bulkEditMode;
  const _ncols=(isLoggedIn?11:10)+(_showBulk?1:0);
  // (모바일/태블릿) 검색창이 커서 버튼들이 2줄로 밀리는 문제 방지
  // - 한 줄 유지 + 가로 스크롤(드래그)로 접근
  let filterBar=`<div class="fbar utilbar utilbar--scroll" style="margin-bottom:16px;flex-wrap:nowrap;gap:6px;overflow-x:auto;-webkit-overflow-scrolling:touch;scrollbar-width:none">
    ${raceOpts.map(r=>`<button class="pill ${totalRaceFilter===r?'on':''}" onclick="totalRaceFilter='${r}';render()">${r==='전체'?'전체':RNAME[r]||r}</button>`).join('')}
    <span style="color:var(--border2);align-self:center">│</span>
    <input id="total-search" type="text" value="${(totalSearch||'').replace(/"/g,'&quot;')}" placeholder="🔍 이름/대학/티어/직책 + (테/저/프, 남/여) 검색..."
      oncompositionstart="window._tsComp=true"
      oncompositionend="window._tsComp=false;totalSearch=this.value;totalApplySearchFilter()"
      oninput="totalSearch=this.value;if(!window._tsComp)totalApplySearchFilter()"
      autocomplete="off" spellcheck="false"
      style="padding:5px 8px;border:1px solid var(--border2);border-radius:10px;font-size:12px;min-width:140px;max-width:220px;flex:0 1 190px;background:var(--white);color:var(--text)">
    <button class="pill ${totalHideNoRecord?'on':''}" style="${totalHideNoRecord?'background:#f59e0b;border-color:#f59e0b;color:#fff':''}" onclick="totalHideNoRecord=!totalHideNoRecord;render()">전적없음 숨김</button>
    <span style="color:var(--border2);align-self:center">│</span>
    <button class="pill ${totalViewMode==='gallery'?'on':''}" onclick="totalViewMode=(totalViewMode==='gallery'?'table':'gallery');_bulkEditMode=false;render()" title="${totalViewMode==='gallery'?'목록으로 돌아가기':'갤러리 뷰'}">▦ 갤러리</button>
    ${totalViewMode==='table'?(isLoggedIn?`<button class="pill ${_bulkEditMode?'on':''}" onclick="toggleBulkEditMode()" style="${_bulkEditMode?'background:#3b82f6;border-color:#3b82f6;color:#fff':''}">☑ 일괄 수정</button>`:''):''}
    ${totalViewMode==='table'?(isLoggedIn?`<button class="pill" onclick="openMergePlayersModal()">🔀 병합</button>`:''):''}
    ${_showBulk&&totalViewMode==='table'?`<button class="pill ${_bulkEditSelected.size>0?'on':''}" onclick="clearBulkEditSelection()" style="${_bulkEditSelected.size>0?'background:#ef4444;border-color:#ef4444;color:#fff':''}">선택 초기화</button>
      <button id="bulk-edit-apply-btn" onclick="openBulkEditModal()" style="padding:4px 12px;border-radius:12px;border:1.5px solid #2563eb;background:#eff6ff;color:#1d4ed8;font-size:12px;font-weight:700;cursor:pointer;display:${_bulkEditSelected.size>0?'inline-flex':'none'};align-items:center;gap:4px">✏️ <span id="bulk-edit-cnt">${_bulkEditSelected.size}</span>명 수정</button>
      <input type="text" value="${(_bulkEditSearch||'').replace(/"/g,'&quot;')}" placeholder="선택 모드 내 검색..."
        oncompositionstart="window._tsComp2=true"
        oncompositionend="window._tsComp2=false;_bulkEditSearch=this.value;bulkApplySearchFilter()"
        oninput="_bulkEditSearch=this.value;if(!window._tsComp2)bulkApplySearchFilter()"
        autocomplete="off" spellcheck="false"
        style="padding:5px 10px;border:1px solid var(--border2);border-radius:10px;font-size:12px;min-width:170px;background:var(--white);color:var(--text)">`:''}
  </div>`;

    let tableHTML=`<div style="overflow-x:auto;-webkit-overflow-scrolling:touch;width:100%"><table style="table-layout:fixed;width:100%"><colgroup>
    ${_showBulk?'<col style="width:36px">':''}
    <col style="width:52px"><col style="width:80px"><col style="width:60px"><col style="width:220px"><col class="col-hide-mobile" style="width:50px">
    <col style="width:52px"><col style="width:52px">
    <col style="width:70px"><col style="width:80px"><col style="width:60px">
    ${isLoggedIn?'<col style="width:70px">':''}
  </colgroup><thead><tr>
    ${_showBulk?`<th style="text-align:center;padding:8px 4px"><input type="checkbox" id="bulk-check-all" onchange="bulkEditToggleAll(this.checked)" style="cursor:pointer"></th>`:''}
    <th style="text-align:center;white-space:nowrap;padding:8px 6px">순위</th>
    <th style="text-align:center;white-space:nowrap;padding:8px 10px">티어</th>
    <th style="text-align:center;white-space:nowrap;padding:8px 8px">종족</th>
    <th style="text-align:left;padding:8px 12px">스트리머</th>
    <th class="col-hide-mobile" style="text-align:center;white-space:nowrap;padding:8px 10px">승</th>
    <th class="col-hide-mobile" style="text-align:center;white-space:nowrap;padding:8px 10px">패</th>
    <th style="text-align:center;white-space:nowrap;padding:8px 10px">승률</th>
    <th class="col-hide-mobile" style="text-align:center;white-space:nowrap;padding:8px 10px">포인트</th>
    <th class="col-hide-mobile" style="text-align:center;white-space:nowrap;padding:8px 10px">ELO</th>
    <th class="col-hide-mobile" style="text-align:center;white-space:nowrap;padding:8px 6px">활동</th>
    ${isLoggedIn?'<th class="no-export" style="text-align:center;white-space:nowrap;padding:8px 10px">관리</th>':''}
  </tr></thead><tbody>`;

  // 전체 순위 맵 (points 기준)
  const _allRanked = [...players].filter(p=>!p.retired).sort((a,b)=>(b.points||0)-(a.points||0)||(b.win||0)-(a.win||0));
  const _rankMap = {};
  _allRanked.forEach((p,i) => { _rankMap[p.name] = i+1; });

  // 갤러리 뷰 분기
  if(totalViewMode==='gallery'){
    C.innerHTML=filterBar+_buildGalleryView(_rankMap);
    injectUnivIcons(C);
    requestAnimationFrame(()=>injectUnivIcons(C));
    totalApplySearchFilter();
    const si=C.querySelector('#total-search');
    if(si&&totalSearch){si.focus();si.setSelectionRange(si.value.length,si.value.length);}
    return;
  }

  let totalShown=0;
  const _visiblePhotoUrls = [];
  
  // University section for StarCraft streamers (exclude general)
  getAllUnivs().filter(u=>isLoggedIn||!u.hidden).forEach(u=>{
    const _isHiddenUniv=isLoggedIn&&u.hidden;
    let up=players.filter(p=>p.univ===u.name&&p.gameType!=='general');
    if(totalRaceFilter!=='전체') up=up.filter(p=>p.race===totalRaceFilter);
    if(totalHideNoRecord) up=up.filter(p=>((p.win||0)+(p.loss||0))>0);
    if(!up.length)return;
    totalShown+=up.length;
    const _univTotal=players.filter(p=>p.univ===u.name).length; // 은퇴 포함 전체 인원
    // 대학별 헤더 배경 설정 적용
    const _hdrBgImg = u.streamerHeaderBgImg || '';
    const _hdrBgSize = u.streamerHeaderBgSize || 'cover';
    const _hdrBgPos = u.streamerHeaderBgPos || 'center center';
    const _hdrBgOpacity = Math.max(0, Math.min(100, parseInt(u.streamerHeaderBgOpacity, 10) || 30)) / 100;
    const _hdrGradient = u.streamerHeaderGradient || '';
    const _hdrText = u.streamerHeaderText || '';
    const _hdrTextSize = u.streamerHeaderTextSize || '12';
    const _hdrTextColor = u.streamerHeaderTextColor || 'rgba(255,255,255,0.8)';
    const _hdrTextPos = u.streamerHeaderTextPos || localStorage.getItem('su_univ_header_text_pos') || 'right';
    // 그라데이션 스타일 결정
    let _gradientStyle = '';
    if (_hdrGradient || (!_hdrBgImg && !_hdrGradient)) {
      const gMode = _hdrGradient || (localStorage.getItem('su_univ_header_gradient') || 'left-to-right');
      // 대학별 설정 우선, 없으면 전역 설정 사용
      const gLen = Math.max(20, Math.min(100, parseInt(u.streamerHeaderGradientLen || localStorage.getItem('su_univ_header_gradient_length') || '70', 10) || 70));
      const gColorRaw = u.streamerHeaderGradientColor || localStorage.getItem('su_univ_header_gradient_color') || '#ffffff';
      const gColor = (gColorRaw && gColorRaw !== '#ffffff') ? gColorRaw : u.color;
      const gMix = `${gColor} ${gLen}%, transparent`;
      switch(gMode){
        case 'solid':
          _gradientStyle = u.color;
          break;
        case 'left-to-right':
          _gradientStyle = `linear-gradient(90deg, ${u.color}, color-mix(in srgb, ${gMix}))`;
          break;
        case 'left-to-both':
          _gradientStyle = `linear-gradient(90deg, ${u.color} 0%, ${u.color} ${Math.round(gLen/2)}%, color-mix(in srgb, ${u.color} ${gLen}%, transparent) 100%)`;
          break;
        case 'top-to-bottom':
          _gradientStyle = `linear-gradient(180deg, ${u.color}, color-mix(in srgb, ${gMix}))`;
          break;
        case 'both-to-center':
          _gradientStyle = `linear-gradient(90deg, color-mix(in srgb, ${u.color} ${Math.round(100-gLen)}%, transparent) 0%, ${u.color} 50%, color-mix(in srgb, ${u.color} ${Math.round(100-gLen)}%, transparent) 100%)`;
          break;
        default:
          _gradientStyle = `linear-gradient(90deg, ${u.color}, color-mix(in srgb, ${gMix}))`;
      }
    }
    // 배경 이미지가 있으면 그라데이션과 함께 적용
    let _tdBgStyle = _gradientStyle || u.color;
    let _tdBgSize = 'auto';
    let _tdBgPos = 'center center';
    if (_hdrBgImg) {
      // 이미지가 있으면 그라데이션 위에 이미지 오버레이
      _tdBgStyle = `linear-gradient(rgba(0,0,0,${1 - _hdrBgOpacity}), rgba(0,0,0,${1 - _hdrBgOpacity})), url('${_hdrBgImg.replace(/'/g, "\\'")}'), ${_gradientStyle || u.color}`;
      _tdBgSize = `${_hdrBgSize}, ${_hdrBgSize}, auto`;
      _tdBgPos = `${_hdrBgPos}, ${_hdrBgPos}, center center`;
    }
    // 커스텀 텍스트 스타일
    const _textStyle = _hdrText ? `position:relative;` : '';
    // 텍스트 위치에 따른 스타일 결정
    let _textHtml = '';
    if (_hdrText) {
      const _textBaseStyle = `font-size:${_hdrTextSize}px;color:${_hdrTextColor};font-weight:900;white-space:nowrap;`;
      if (_hdrTextPos === 'left') {
        _textHtml = `<span style="${_textBaseStyle}margin-right:8px;">${_hdrText}</span>`;
      } else if (_hdrTextPos === 'center') {
        _textHtml = `<span style="${_textBaseStyle}position:absolute;left:50%;transform:translateX(-50%);">${_hdrText}</span>`;
      } else {
        // right (default)
        _textHtml = `<span style="${_textBaseStyle}margin-left:auto;">${_hdrText}</span>`;
      }
    }
    tableHTML+=`<tr class="ugrp" data-univ-header="${u.name}" style="--c:${u.color};${_isHiddenUniv?'opacity:.55;':''}"><td colspan="${_ncols}" style="${_textStyle}background:${_tdBgStyle};background-size:${_tdBgSize};background-position:${_tdBgPos};background-repeat:no-repeat;position:relative;">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:6px">
        <div style="display:flex;align-items:center;gap:4px;flex-wrap:wrap">
          ${_hdrTextPos === 'left' ? _textHtml : ''}
          <span class="clickable-univ" onclick="openUnivModal('${u.name}')" style="background:${u.color};color:#fff;font-size:14px;display:inline-flex;align-items:center;gap:4px;padding:4px 10px;border-radius:8px;font-weight:700">${gUI(u.name,(typeof getUnivLogoSizeStr==='function'?getUnivLogoSizeStr(u.name,'players','26px'):'26px'))}${u.name}</span>
          ${u.dissolved?`<span style="font-size:10px;background:rgba(0,0,0,.35);color:#fca5a5;border-radius:4px;padding:1px 6px;font-weight:700">🏚️ 해체${u.dissolvedDate?' '+u.dissolvedDate:''}</span>`:''}
          ${_isHiddenUniv?`<span style="font-size:10px;background:rgba(0,0,0,.4);border-radius:4px;padding:1px 6px;font-weight:700">🚫 방문자 숨김</span>`:''}
        </div>
        ${_hdrTextPos === 'center' ? _textHtml : ''}
        <span style="font-size:11px;color:rgba(255,255,255,.8);white-space:nowrap;font-weight:600">${_univTotal}명</span>
        ${_hdrTextPos === 'right' ? _textHtml : ''}
      </div>
    </td></tr>`;
    // 스트리머 탭: 항상 직책→티어→포인트 순 (현황판 수동 순서 무시)
    const sorted = [...up].sort((a,b)=>getRoleOrder(a.role)-getRoleOrder(b.role)||TIERS.indexOf(a.tier)-TIERS.indexOf(b.tier)||b.points-a.points);
    // 직책자와 일반 선수 분리
    const _rolePl = sorted.filter(p=>p.role&&MAIN_ROLES.includes(p.role));
    const _normalPl = sorted.filter(p=>!p.role||!MAIN_ROLES.includes(p.role));
    const _displayList = _rolePl.length ? [..._rolePl, null, ..._normalPl] : _normalPl; // null = 구분자
    let lt='';
    let _inRoleSection = _rolePl.length > 0;
    if(_inRoleSection) tableHTML+=`<tr class="tgrp" style="--c:${u.color||'#6366f1'}"><td colspan="${_ncols}" style="background:${(u.color||'#6366f1')}22;color:${u.color||'#6366f1'}">👑 직책자 (${_rolePl.length}명)</td></tr>`;
    _displayList.forEach(p=>{
      if(p===null){
        // 구분자 - 직책 섹션 끝, 일반 선수 시작
        _inRoleSection=false; lt='';
        if(_normalPl.length) tableHTML+=`<tr class="tgrp" style="--c:${u.color||'#6366f1'}"><td colspan="${_ncols}">▷ 일반 스트리머 (${_normalPl.length}명)</td></tr>`;
        return;
      }
      if(!_inRoleSection && (p.tier||'미정')!==lt){lt=p.tier||'미정';tableHTML+=`<tr class="tgrp"><td colspan="${_ncols}">▷ ${getTierLabel(p.tier||'미정')}</td></tr>`;}
      const wr=(p.win+p.loss)?Math.round(p.win/(p.win+p.loss)*100):0;
      const _pRank = _rankMap[p.name];
      const _pChange = typeof getRankChangeBadge==='function' ? getRankChangeBadge(p.name, _pRank) : '';
      const _pSafe=(p.name||'').replace(/\\/g,'\\\\').replace(/'/g,"\\'");
      const _q = `${p.name||''} ${(p.univ||'')} ${(p.tier||'')} ${(p.role||'')}`.toLowerCase();
      if(p.photo) _visiblePhotoUrls.push(p.photo);
      tableHTML+=`<tr data-player-row="1" data-univ="${u.name}" data-q="${_q.replace(/"/g,'&quot;')}" data-r="${p.race||''}" data-g="${p.gender||''}">
        ${_showBulk?`<td style="text-align:center;padding:7px 4px"><input type="checkbox" data-player-name="${_pSafe}" ${_bulkEditSelected.has(p.name)?'checked':''} onchange="toggleBulkEditPlayer('${_pSafe}',this.checked)" style="cursor:pointer;width:15px;height:15px"></td>`:''}
        <td style="text-align:center;white-space:nowrap;padding:5px 4px">
          <div style="font-size:11px;font-weight:800;color:var(--text3);line-height:1.2">${_pRank||'-'}</div>
          <div>${_pChange}</div>
        </td>
        <td style="text-align:center;white-space:nowrap;padding:7px 10px">${getTierBadge(p.tier)}</td>
        <td style="text-align:center;white-space:nowrap;padding:7px 8px"><span class="rbadge r${p.race}" style="font-size:11px">${p.race||'?'}</span></td>
        <td style="text-align:left;padding:6px 12px;white-space:nowrap">
          <span style="display:inline-flex;align-items:center;gap:8px">
            ${p.photo?`<span onclick="openPlayerModal('${_pSafe}')" title="스트리머 상세" style="width:40px;height:40px;border-radius:var(--su_profile_radius,50%);flex-shrink:0;display:inline-flex;align-items:center;justify-content:center;overflow:hidden;border:2px solid var(--border);background:var(--border2);font-size:11px;font-weight:900;color:#64748b;position:relative;cursor:pointer">${p.race||'?'}<img src="${toHttpsUrl(p.photo)}" decoding="async" fetchpriority="high" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;border-radius:inherit" onerror="this.style.display='none'"></span>`:'<span style="display:inline-block;width:40px;height:40px;border-radius:var(--su_profile_radius,50%);background:var(--border2);border:2px solid var(--border);flex-shrink:0"></span>'}
            <span style="font-weight:600">${p.role?`${getRoleBadgeHTML(p.role,'10px')} `:''}<span class="clickable-name" onclick="openPlayerModal('${_pSafe}')">${p.name}</span>${p.retired?'<span style="font-size:10px;background:#e2e8f0;color:#64748b;border-radius:4px;padding:1px 5px;margin-left:4px;font-weight:700">🎗️ 은퇴</span>':''}${p.inactive?'<span style="font-size:10px;background:#fff7ed;color:#9a3412;border-radius:4px;padding:1px 5px;margin-left:4px;font-weight:700">⏸️ 휴학</span>':''}${genderIcon(p.gender)}${getStatusIconHTML(p.name)}</span>
          </span>
        </td>
        <td class="col-hide-mobile wt" style="text-align:center;white-space:nowrap;padding:7px 10px">${p.win}</td>
        <td class="col-hide-mobile lt" style="text-align:center;white-space:nowrap;padding:7px 10px">${p.loss}</td>
        <td style="text-align:center;white-space:nowrap;padding:7px 10px;font-weight:700;color:${(p.win+p.loss)===0?'var(--gray-l)':wr>=50?'var(--green)':'var(--red)'}">
          ${(p.win+p.loss)?wr+'%':'-'}${(p.win+p.loss)?`<br><span style="font-size:9px;color:var(--gray-l);font-weight:400">${p.win+p.loss}전</span>`:''}
        </td>
        <td class="col-hide-mobile ${pC(p.points)}" style="text-align:center;white-space:nowrap;padding:7px 10px;font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:13px">${pS(p.points)}</td>
        <td class="col-hide-mobile" style="text-align:center;white-space:nowrap;padding:7px 10px;font-family:'Noto Sans KR',sans-serif;font-weight:700;font-size:12px;color:${(p.elo||ELO_DEFAULT)>=ELO_DEFAULT?'#2563eb':'#dc2626'}">${p.elo||ELO_DEFAULT}</td>
        <td class="col-hide-mobile" style="text-align:center;padding:7px 4px">${(()=>{
          const _today2=new Date().toISOString().slice(0,10);
          const _30ago2=new Date(Date.now()-30*24*60*60*1000).toISOString().slice(0,10);
          const _7ago2=new Date(Date.now()-7*24*60*60*1000).toISOString().slice(0,10);
          const lastD=(p.history||[]).reduce((mx,h)=>h.date>mx?h.date:mx,'');
          if(!lastD) return '<span style="font-size:9px;color:#9ca3af" title="전적 없음">-</span>';
          if(lastD>=_7ago2) return `<span style="font-size:9px;font-weight:800;color:#16a34a" title="최근 활동 (7일 이내)">🟢</span>`;
          if(lastD>=_30ago2) return `<span style="font-size:9px;font-weight:800;color:#f59e0b" title="활동 중 (30일 이내)">🟡</span>`;
          return '<span style="font-size:9px;font-weight:800;color:#9ca3af" title="비활성 (30일 이상)">⚫</span>';
        })()}</td>
        ${isLoggedIn?`<td class="no-export" style="text-align:center;white-space:nowrap;padding:7px 8px">${adminBtn(`<button class="btn btn-w btn-xs" onclick="openEPFromModal('${_pSafe}')">✏️ 수정</button>`)}</td>`:''}
      </tr>`;
    });
  });
  if(totalShown===0){
    tableHTML+=`<tr><td colspan="${_ncols}"><div class="empty-state"><div class="empty-state-icon">🔍</div><div class="empty-state-title">검색 결과가 없습니다</div><div class="empty-state-desc">다른 검색어나 필터를 사용해보세요</div></div></td></tr>`;
  }
  tableHTML+=`</tbody></table></div>`;

  C.innerHTML = filterBar + tableHTML;
  try{ if(typeof prewarmImageUrls==='function') prewarmImageUrls(_visiblePhotoUrls, 28); }catch(e){}
  injectUnivIcons(C);
  requestAnimationFrame(()=>injectUnivIcons(C));
  totalApplySearchFilter();
  bulkApplySearchFilter();
  const si=C.querySelector('#total-search');
  if(si&&totalSearch){si.focus();si.setSelectionRange(si.value.length,si.value.length);}
}

function _buildGalleryView(rankMap){
  const RACE_CLR={T:'#2563eb',Z:'#7c3aed',P:'#c2410c',N:'#64748b'};
  let html='<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:10px;padding:4px 0">';
  let anyShown=false;
  const _galleryPhotoUrls = [];
  getAllUnivs().filter(u=>isLoggedIn||!u.hidden).forEach(u=>{
    let up=players.filter(p=>p.univ===u.name&&p.gameType!=='general'&&!p.retired);
    if(totalRaceFilter!=='전체') up=up.filter(p=>p.race===totalRaceFilter);
    if(totalHideNoRecord) up=up.filter(p=>((p.win||0)+(p.loss||0))>0);
    if(!up.length) return;
    anyShown=true;
    const sorted=[...up].sort((a,b)=>getRoleOrder(a.role)-getRoleOrder(b.role)||TIERS.indexOf(a.tier)-TIERS.indexOf(b.tier)||(b.points||0)-(a.points||0));
    // 대학 헤더: 대학별 설정 적용
    const _gHdrBgImg = u.streamerHeaderBgImg || '';
    const _gHdrBgSize = u.streamerHeaderBgSize || 'cover';
    const _gHdrBgPos = u.streamerHeaderBgPos || 'center center';
    const _gHdrBgOpacity = Math.max(0, Math.min(100, parseInt(u.streamerHeaderBgOpacity, 10) || 30)) / 100;
    const _gHdrGradient = u.streamerHeaderGradient || '';
    const _gHdrText = u.streamerHeaderText || '';
    const _gHdrTextSize = u.streamerHeaderTextSize || '12';
    const _gHdrTextColor = u.streamerHeaderTextColor || 'rgba(255,255,255,0.85)';
    const _gHdrTextPos = u.streamerHeaderTextPos || localStorage.getItem('su_univ_header_text_pos') || 'right';
    // 그라데이션 스타일 결정
    let _gGradientStyle = '';
    if (_gHdrGradient || (!_gHdrBgImg && !_gHdrGradient)) {
      const gMode = _gHdrGradient || (localStorage.getItem('su_univ_header_gradient') || 'left-to-right');
      // 대학별 설정 우선, 없으면 전역 설정 사용
      const gLen = Math.max(20, Math.min(100, parseInt(u.streamerHeaderGradientLen || localStorage.getItem('su_univ_header_gradient_length') || '70', 10) || 70));
      const gColorRaw = u.streamerHeaderGradientColor || localStorage.getItem('su_univ_header_gradient_color') || '#ffffff';
      const gColor = (gColorRaw && gColorRaw !== '#ffffff') ? gColorRaw : (u.color || '#6366f1');
      const gMix = `${gColor} ${gLen}%, transparent`;
      switch(gMode){
        case 'solid':
          _gGradientStyle = u.color || '#6366f1';
          break;
        case 'left-to-right':
          _gGradientStyle = `linear-gradient(90deg, ${u.color || '#6366f1'}, color-mix(in srgb, ${gMix}))`;
          break;
        case 'left-to-both':
          _gGradientStyle = `linear-gradient(90deg, ${u.color || '#6366f1'} 0%, ${u.color || '#6366f1'} ${Math.round(gLen/2)}%, color-mix(in srgb, ${u.color || '#6366f1'} ${gLen}%, transparent) 100%)`;
          break;
        case 'top-to-bottom':
          _gGradientStyle = `linear-gradient(180deg, ${u.color || '#6366f1'}, color-mix(in srgb, ${gMix}))`;
          break;
        case 'both-to-center':
          _gGradientStyle = `linear-gradient(90deg, color-mix(in srgb, ${u.color || '#6366f1'} ${Math.round(100-gLen)}%, transparent) 0%, ${u.color || '#6366f1'} 50%, color-mix(in srgb, ${u.color || '#6366f1'} ${Math.round(100-gLen)}%, transparent) 100%)`;
          break;
        default:
          _gGradientStyle = `linear-gradient(90deg, ${u.color || '#6366f1'}, color-mix(in srgb, ${gMix}))`;
      }
    }
    // 배경 이미지가 있으면 그라데이션과 함께 적용
    let _gFinalBgStyle = _gGradientStyle || (u.color || '#6366f1');
    let _gFinalBgSize = 'auto';
    let _gFinalBgPos = 'center center';
    if (_gHdrBgImg) {
      // 이미지가 있으면 그라데이션 위에 이미지 오버레이 (오버레이 블렌딩 사용)
      _gFinalBgStyle = `linear-gradient(rgba(0,0,0,${1 - _gHdrBgOpacity}), rgba(0,0,0,${1 - _gHdrBgOpacity})), url('${_gHdrBgImg.replace(/'/g, "\\'")}'), ${_gGradientStyle || (u.color || '#6366f1')}`;
      _gFinalBgSize = `${_gHdrBgSize}, ${_gHdrBgSize}, auto`;
      _gFinalBgPos = `${_gHdrBgPos}, ${_gHdrBgPos}, center center`;
    }
    // 텍스트 위치에 따른 스타일 결정
    let _gTextHtml = '';
    if (_gHdrText) {
      const _gTextBaseStyle = `font-size:${_gHdrTextSize}px;color:${_gHdrTextColor};font-weight:900;white-space:nowrap;`;
      if (_gHdrTextPos === 'left') {
        _gTextHtml = `<span style="${_gTextBaseStyle}margin-right:8px;">${_gHdrText}</span>`;
      } else if (_gHdrTextPos === 'center') {
        _gTextHtml = `<span style="${_gTextBaseStyle}position:absolute;left:50%;transform:translateX(-50%);">${_gHdrText}</span>`;
      } else {
        // right (default)
        _gTextHtml = `<span style="${_gTextBaseStyle}margin-left:auto;">${_gHdrText}</span>`;
      }
    }
    html+=`<div data-gallery-univ-header="${u.name}" style="grid-column:1/-1;display:flex;align-items:center;gap:6px;padding:10px 12px 10px;background:${_gFinalBgStyle};background-size:${_gFinalBgSize};background-position:${_gFinalBgPos};background-repeat:no-repeat;border-radius:12px;margin-top:6px;position:relative;">
      ${_gHdrTextPos === 'left' ? _gTextHtml : ''}
      <span class="ubadge" data-icon-done="1" style="background:rgba(255,255,255,.2);color:#fff;display:inline-flex;align-items:center;gap:4px;font-size:12px">${gUI(u.name,(typeof getUnivLogoSizeStr==='function'?getUnivLogoSizeStr(u.name,'players','20px'):'20px'))}${u.name}</span>
      ${_gHdrTextPos === 'center' ? _gTextHtml : ''}
      <span style="font-size:11px;color:rgba(255,255,255,.85);font-weight:600">${up.length}명</span>
      ${_gHdrTextPos === 'right' ? _gTextHtml : ''}
    </div>`;
    sorted.forEach(p=>{
      const wr=(p.win+p.loss)?Math.round(p.win/(p.win+p.loss)*100):null;
      const clr=RACE_CLR[p.race]||'#64748b';
      const _pSafe=(p.name||'').replace(/\\/g,'\\\\').replace(/'/g,"\\'");
      const q=`${p.name||''} ${(p.univ||'')} ${(p.tier||'')} ${(p.role||'')}`.toLowerCase();
      const actDot=(()=>{
        const lastD=(p.history||[]).reduce((mx,h)=>h.date>mx?h.date:mx,'');
        if(!lastD) return '#9ca3af';
        const _7ago=new Date(Date.now()-7*86400000).toISOString().slice(0,10);
        const _30ago=new Date(Date.now()-30*86400000).toISOString().slice(0,10);
        if(lastD>=_7ago) return '#16a34a';
        if(lastD>=_30ago) return '#f59e0b';
        return '#9ca3af';
      })();
      if(p.photo) _galleryPhotoUrls.push(p.photo);
      html+=`<div data-player-card="1" data-univ="${u.name}" data-q="${q.replace(/"/g,'&quot;')}" data-r="${p.race||''}" data-g="${p.gender||''}"
        onclick="openPlayerModal('${_pSafe}')"
        style="position:relative;border-radius:14px;overflow:hidden;cursor:pointer;aspect-ratio:3/4;background:${clr}22;border:2px solid ${clr}44;transition:transform .15s,box-shadow .15s"
        onmouseenter="this.style.transform='translateY(-4px)';this.style.boxShadow='0 10px 28px rgba(0,0,0,.22)'"
        onmouseleave="this.style.transform='';this.style.boxShadow=''">
        ${p.photo
          ? `<img src="${toHttpsUrl(p.photo)}" decoding="async" fetchpriority="high" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:top center" onerror="this.parentNode.querySelector('.gc-placeholder').style.display='flex';this.style.display='none'">`
          : ''}
        <div class="gc-placeholder" style="position:absolute;inset:0;display:${p.photo?'none':'flex'};align-items:center;justify-content:center;font-size:36px;font-weight:900;color:${clr};background:${clr}15">${p.race||'?'}</div>
        <div style="position:absolute;inset:0;background:linear-gradient(to bottom,rgba(0,0,0,0) 40%,rgba(0,0,0,.82) 100%)"></div>
        <div style="position:absolute;top:7px;left:8px;font-size:9px;font-weight:800;color:rgba(255,255,255,.7)">${rankMap[p.name]?'#'+rankMap[p.name]:''}</div>
        <div style="position:absolute;top:7px;right:8px;width:7px;height:7px;border-radius:50%;background:${actDot};box-shadow:0 0 4px ${actDot}" title="${actDot==='#16a34a'?'최근 활동 7일 이내':actDot==='#f59e0b'?'활동 중 30일 이내':'비활성'}"></div>
        <div style="position:absolute;bottom:0;left:0;right:0;padding:8px 8px 9px;text-align:left">
          <div style="font-size:12px;font-weight:800;color:#fff;line-height:1.3;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${p.name}">${p.name}${genderIcon(p.gender)}</div>
          ${p.role?`<div style="font-size:9px;color:rgba(255,255,255,.7);margin-bottom:3px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${p.role}</div>`:''}
          <div style="display:flex;align-items:center;gap:3px;flex-wrap:wrap;margin-top:2px">
            ${getTierBadge(p.tier)}<span class="rbadge r${p.race}" style="font-size:9px;padding:1px 4px">${p.race||'?'}</span>
          </div>
          <div style="margin-top:4px;display:flex;align-items:center;justify-content:space-between;gap:4px">
            <span style="font-size:10px;font-weight:700;color:${(p.elo||ELO_DEFAULT)>=ELO_DEFAULT?'#93c5fd':'#fca5a5'}">${p.elo||ELO_DEFAULT} ELO</span>
            <span style="font-size:10px;color:${wr===null?'rgba(255,255,255,.5)':wr>=50?'#86efac':'#fca5a5'};font-weight:600">${wr===null?'-':`${wr}%`}</span>
          </div>
        </div>
      </div>`;
    });
  });
  if(!anyShown) html+=`<div style="grid-column:1/-1"><div class="empty-state"><div class="empty-state-icon">🔍</div><div class="empty-state-title">검색 결과가 없습니다</div></div></div>`;
  html+='</div>';
  try{ if(typeof prewarmImageUrls==='function') prewarmImageUrls(_galleryPhotoUrls, 28); }catch(e){}
  return html;
}

function toggleBulkEditMode(){
  _bulkEditMode=!_bulkEditMode;
  _bulkEditSelected=new Set();
  _bulkEditSearch='';
  render();
}

function toggleBulkEditPlayer(name,checked){
  if(checked) _bulkEditSelected.add(name);
  else _bulkEditSelected.delete(name);
  const cnt=document.getElementById('bulk-edit-cnt');
  if(cnt) cnt.textContent=_bulkEditSelected.size;
  const btn=document.getElementById('bulk-edit-apply-btn');
  if(btn) btn.style.display=_bulkEditSelected.size>0?'inline-flex':'none';
}

function bulkEditToggleAll(checked){
  document.querySelectorAll('[data-player-name]').forEach(cb=>{
    cb.checked=checked;
    const name=cb.dataset.playerName;
    if(name){if(checked)_bulkEditSelected.add(name);else _bulkEditSelected.delete(name);}
  });
  const cnt=document.getElementById('bulk-edit-cnt');
  if(cnt) cnt.textContent=_bulkEditSelected.size;
  const btn=document.getElementById('bulk-edit-apply-btn');
  if(btn) btn.style.display=_bulkEditSelected.size>0?'inline-flex':'none';
}

function clearBulkEditSelection(){
  _bulkEditSelected=new Set();
  const cnt=document.getElementById('bulk-edit-cnt');
  if(cnt) cnt.textContent='0';
  const btn=document.getElementById('bulk-edit-apply-btn');
  if(btn) btn.style.display='none';
  const all=document.getElementById('bulk-check-all');
  if(all) all.checked=false;
  document.querySelectorAll('[data-player-name]').forEach(cb=>{cb.checked=false;});
}

function openBulkEditModal(){
  if(!_bulkEditSelected.size) return;
  const univOpts=getAllUnivs().filter(u=>!u.dissolved).map(u=>`<option value="${u.name}">${u.name}</option>`).join('');
  const tierOpts=TIERS.map(t=>`<option value="${t}">${getTierLabel(t)}</option>`).join('');
  const sel=[..._bulkEditSelected];
  const first=sel.slice(0,30);
  const more=sel.length-first.length;
  document.getElementById('bulkEditBody').innerHTML=`
    <div style="margin-bottom:14px;padding:10px;background:var(--surface);border-radius:8px;font-size:12px;color:var(--text2)">
      <strong style="color:var(--blue)">${sel.length}명</strong> 선택됨: ${first.join(', ')}${more?` 외 ${more}명`:''}
      ${more?`<details style="margin-top:8px"><summary style="cursor:pointer;color:var(--gray-l);font-size:11px">전체 보기</summary><div style="margin-top:6px;line-height:1.6">${sel.join(', ')}</div></details>`:''}
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px">
      <div>
        <label style="font-size:12px;font-weight:700;color:var(--text2);display:block;margin-bottom:4px">티어</label>
        <select id="bulk-ed-t" style="width:100%;padding:7px 10px;border:1px solid var(--border2);border-radius:8px;font-size:13px">
          <option value="">변경 안함</option>${tierOpts}
        </select>
      </div>
      <div>
        <label style="font-size:12px;font-weight:700;color:var(--text2);display:block;margin-bottom:4px">대학</label>
        <select id="bulk-ed-u" style="width:100%;padding:7px 10px;border:1px solid var(--border2);border-radius:8px;font-size:13px">
          <option value="">변경 안함</option>${univOpts}
        </select>
      </div>
      <div>
        <label style="font-size:12px;font-weight:700;color:var(--text2);display:block;margin-bottom:4px">종족</label>
        <select id="bulk-ed-r" style="width:100%;padding:7px 10px;border:1px solid var(--border2);border-radius:8px;font-size:13px">
          <option value="">변경 안함</option>
          <option value="T">테란</option><option value="Z">저그</option><option value="P">프로토스</option><option value="N">종족미정</option>
        </select>
      </div>
      <div>
        <label style="font-size:12px;font-weight:700;color:var(--text2);display:block;margin-bottom:4px">성별</label>
        <select id="bulk-ed-g" style="width:100%;padding:7px 10px;border:1px solid var(--border2);border-radius:8px;font-size:13px">
          <option value="">변경 안함</option>
          <option value="F">👩 여자</option><option value="M">👨 남자</option>
        </select>
      </div>
    </div>
    <div style="display:flex;align-items:center;gap:10px;padding:10px 12px;background:var(--surface);border-radius:8px;margin-bottom:4px">
      <label style="font-size:12px;font-weight:700;color:var(--text2)">현황판</label>
      <select id="bulk-ed-h" style="padding:6px 10px;border:1px solid var(--border2);border-radius:8px;font-size:13px">
        <option value="">변경 안함</option>
        <option value="hide">제외 (숨김)</option>
        <option value="show">표시</option>
      </select>
      <button onclick="bulkDeleteSelected()" style="margin-left:auto;padding:6px 14px;border-radius:8px;border:1.5px solid #ef4444;background:#fef2f2;color:#dc2626;font-size:12px;font-weight:700;cursor:pointer">🗑️ 선택 삭제</button>
    </div>`;
  om('bulkEditModal');
}

function saveBulkEdit(){
  const t=document.getElementById('bulk-ed-t').value;
  const u=document.getElementById('bulk-ed-u').value;
  const r=document.getElementById('bulk-ed-r').value;
  const g=document.getElementById('bulk-ed-g').value;
  const h=document.getElementById('bulk-ed-h').value;
  if(!t&&!u&&!r&&!g&&!h){alert('변경할 항목을 선택하세요.');return;}
  _bulkEditSelected.forEach(name=>{
    const p=players.find(x=>x.name===name);
    if(!p) return;
    if(t) p.tier=t;
    if(u) p.univ=u;
    if(r) p.race=r;
    if(g) p.gender=g;
    if(h==='hide') p.hideFromBoard=true;
    else if(h==='show') p.hideFromBoard=undefined;
  });
  save();
  cm('bulkEditModal');
  _bulkEditMode=false;
  _bulkEditSelected=new Set();
  render();
}
function bulkDeleteSelected(){
  if(!_bulkEditSelected.size) return;
  if(!confirm(`선택한 ${_bulkEditSelected.size}명을 삭제할까요?\n전적·기록은 삭제되지 않습니다.`)) return;
  _bulkEditSelected.forEach(name=>{
    const idx=players.findIndex(x=>x.name===name);
    if(idx>=0) players.splice(idx,1);
  });
  if(typeof fixPoints==='function') fixPoints();
  save();
  cm('bulkEditModal');
  _bulkEditMode=false;
  _bulkEditSelected=new Set();
  render();
}

function openMergePlayersModal(){
  if(!isLoggedIn) return;
  const modalId='_mergePlayersModal';
  let modal=document.getElementById(modalId);
  if(modal) modal.remove();
  modal=document.createElement('div');
  modal.id=modalId;
  // (개선) z-index CSS 변수로 통일
  modal.style.cssText='position:fixed;inset:0;background:#0008;z-index:var(--z-modal-5);display:flex;align-items:center;justify-content:center;padding:16px;box-sizing:border-box';
  const list=players.map(p=>p.name).filter(Boolean).sort((a,b)=>a.localeCompare(b));
  modal.innerHTML=`<div style="background:var(--white);border-radius:16px;padding:18px 18px 16px;width:520px;max-width:100%;box-shadow:0 10px 50px rgba(0,0,0,.35)">
    <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:10px">
      <div style="font-weight:900;font-size:15px">🔀 스트리머 병합</div>
      <button class="btn btn-w btn-xs" onclick="document.getElementById('${modalId}').remove()">닫기</button>
    </div>
    <div style="font-size:12px;color:var(--text3);line-height:1.6;margin-bottom:12px">
      A(원본)를 B(대상)로 합칩니다. 모든 기록/대진/현황판에서 A 이름을 B로 치환합니다.
    </div>
    <datalist id="_mergePlayersList">${list.map(n=>`<option value="${escAttr(n)}"></option>`).join('')}</datalist>
    <div style="display:flex;gap:10px;flex-wrap:wrap">
      <div style="flex:1;min-width:220px">
        <div style="font-size:12px;font-weight:800;color:var(--text2);margin-bottom:4px">A (원본)</div>
        <input id="_mergeFrom" list="_mergePlayersList" placeholder="예: 닉네임(오타)" style="width:100%;padding:8px 10px;border:1.5px solid var(--border2);border-radius:10px;box-sizing:border-box">
      </div>
      <div style="flex:1;min-width:220px">
        <div style="font-size:12px;font-weight:800;color:var(--text2);margin-bottom:4px">B (대상)</div>
        <input id="_mergeTo" list="_mergePlayersList" placeholder="예: 닉네임(정상)" style="width:100%;padding:8px 10px;border:1.5px solid var(--border2);border-radius:10px;box-sizing:border-box">
      </div>
    </div>
    <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-top:12px">
      <label style="display:flex;align-items:center;gap:8px;font-size:12px;color:var(--text3);cursor:pointer">
        <input id="_mergeDel" type="checkbox" checked style="width:15px;height:15px;cursor:pointer"> A(원본) 스트리머 삭제
      </label>
      <label style="display:flex;align-items:center;gap:8px;font-size:12px;color:var(--text3);cursor:pointer">
        <input id="_mergeFill" type="checkbox" checked style="width:15px;height:15px;cursor:pointer"> B 정보가 비면 A 정보로 보강(사진/채널/메모)
      </label>
    </div>
    <div style="display:flex;gap:10px;margin-top:14px">
      <button class="btn btn-b" style="flex:1" onclick="mergePlayersApply()">병합 실행</button>
      <button class="btn btn-w" style="flex:1" onclick="document.getElementById('${modalId}').remove()">취소</button>
    </div>
  </div>`;
  document.body.appendChild(modal);
  const i=document.getElementById('_mergeFrom');
  if(i) i.focus();
}

function mergePlayersApply(){
  const from=(document.getElementById('_mergeFrom')?.value||'').trim();
  const to=(document.getElementById('_mergeTo')?.value||'').trim();
  const del=document.getElementById('_mergeDel')?.checked||false;
  const fill=document.getElementById('_mergeFill')?.checked||false;
  mergePlayers(from,to,{del,fill});
}

function mergePlayers(fromName, toName, opt){
  if(!fromName||!toName) return alert('A/B 둘 다 입력하세요.');
  if(fromName===toName) return alert('A와 B가 같습니다.');
  const fromP=players.find(p=>p.name===fromName);
  const toP=players.find(p=>p.name===toName);
  if(!fromP) return alert(`원본(A) "${fromName}"을 찾을 수 없습니다.`);
  if(!toP) return alert(`대상(B) "${toName}"을 찾을 수 없습니다.`);
  if(!confirm(`"${fromName}" → "${toName}" 병합을 진행할까요?\n(되돌리기 어렵습니다)`)) return;

  const _repList = (arr, fn) => { (arr||[]).forEach(fn); };
  const _repMembers = (mems) => { _repList(mems, m => { if(m && m.name===fromName) m.name=toName; }); };
  const _repGames = (games) => { _repList(games, g => { if(!g) return; if(g.playerA===fromName) g.playerA=toName; if(g.playerB===fromName) g.playerB=toName; if(g.wName===fromName) g.wName=toName; if(g.lName===fromName) g.lName=toName; if(g.winner===fromName) g.winner=toName; }); };
  const _repSets = (sets) => { _repList(sets, s => { if(!s) return; _repGames(s.games); if(s.winner===fromName) s.winner=toName; }); };
  const _repMatch = (m) => {
    if(!m) return;
    if(m.a===fromName) m.a=toName;
    if(m.b===fromName) m.b=toName;
    if(m.wName===fromName) m.wName=toName;
    if(m.lName===fromName) m.lName=toName;
    if(m.playerA===fromName) m.playerA=toName;
    if(m.playerB===fromName) m.playerB=toName;
    if(m.winner===fromName) m.winner=toName;
    _repMembers(m.membersA);
    _repMembers(m.membersB);
    _repMembers(m.teamAMembers);
    _repMembers(m.teamBMembers);
    _repSets(m.sets);
    _repGames(m.games);
  };

  _repList([...(miniM||[]), ...(univM||[]), ...(ckM||[]), ...(proM||[]), ...(comps||[]), ...(ttM||[])], _repMatch);
  _repList(indM||[], m => { if(!m) return; if(m.wName===fromName) m.wName=toName; if(m.lName===fromName) m.lName=toName; if(m.matchupA===fromName) m.matchupA=toName; if(m.matchupB===fromName) m.matchupB=toName; });
  _repList(gjM||[], m => { if(!m) return; if(m.wName===fromName) m.wName=toName; if(m.lName===fromName) m.lName=toName; });

  const _repTourney = (tn) => {
    if(!tn) return;
    if(Array.isArray(tn.groups)){
      tn.groups.forEach(g=>{
        if(!g) return;
        if(Array.isArray(g.players)) g.players=g.players.map(n=>n===fromName?toName:n);
        if(Array.isArray(g.univs)) g.univs=g.univs.map(n=>n===fromName?toName:n);
        _repList(g.matches, _repMatch);
      });
    }
    if(Array.isArray(tn.bracket)){
      tn.bracket.forEach(r=>_repList(r,_repMatch));
    }
    if(tn.thirdPlace) _repMatch(tn.thirdPlace);
    if(Array.isArray(tn.gjMatches)) _repList(tn.gjMatches, s => { if(!s) return; if(s.a===fromName) s.a=toName; if(s.b===fromName) s.b=toName; _repList(s.games, g => { if(!g) return; if(g.winner===fromName) g.winner=toName; }); });
  };
  _repList(proTourneys||[], _repTourney);
  _repList(tourneys||[], _repTourney);

  players.forEach(p=>{
    if(!p) return;
    if(Array.isArray(p.history)){
      p.history.forEach(h=>{
        if(!h) return;
        if(h.opp===fromName) h.opp=toName;
        if(h.who===fromName) h.who=toName;
      });
    }
  });

  if(typeof boardPlayerOrder!=='undefined' && boardPlayerOrder){
    Object.keys(boardPlayerOrder).forEach(u=>{
      const arr=boardPlayerOrder[u]||[];
      const hasTo=arr.includes(toName);
      boardPlayerOrder[u]=arr.filter(n=>n!==fromName);
      if(!hasTo && arr.includes(fromName)) boardPlayerOrder[u].push(toName);
    });
    if(typeof saveBoardPlayerOrder==='function') saveBoardPlayerOrder();
  }

  if(typeof playerStatusIcons!=='undefined'){
    if(playerStatusIcons[fromName] && !playerStatusIcons[toName]) playerStatusIcons[toName]=playerStatusIcons[fromName];
    delete playerStatusIcons[fromName];
    try{ if(typeof _iconPersistState==='function') _iconPersistState(); }catch(e){}
  }

  if(opt?.fill){
    if(!toP.photo && fromP.photo) toP.photo=fromP.photo;
    if(!toP.channelUrl && fromP.channelUrl) toP.channelUrl=fromP.channelUrl;
    if(!toP.memo && fromP.memo) toP.memo=fromP.memo;
  }
  toP.win=(toP.win||0)+(fromP.win||0);
  toP.loss=(toP.loss||0)+(fromP.loss||0);
  toP.points=(toP.points||0)+(fromP.points||0);
  if(!toP.elo && fromP.elo) toP.elo=fromP.elo;
  if(Array.isArray(fromP.history)){
    if(!Array.isArray(toP.history)) toP.history=[];
    toP.history.unshift(...fromP.history);
  }

  if(opt?.del){
    const idx=players.findIndex(p=>p.name===fromName);
    if(idx>=0) players.splice(idx,1);
  }

  if(typeof fixPoints==='function') fixPoints();
  save();
  const m=document.getElementById('_mergePlayersModal');
  if(m) m.remove();
  render();
}

function tierRankGoHist(modeId, playerName){
  const mode=(modeId||'').toLowerCase();
  let type='전체';
  if(mode.startsWith('mini_')||mode.startsWith('civ_')) type='mini';
  else if(mode.startsWith('univm_')) type='univm';
  else if(mode.startsWith('ck_')) type='ck';
  else if(mode.startsWith('pro_')) type='pro';
  else if(mode.startsWith('tt_')) type='tt';
  else if(mode.startsWith('ind_')) type='ind';
  else if(mode.startsWith('gj_')) type='gj';
  else if(mode.startsWith('comp_')) type='tourney';
  if(!window._recQ) window._recQ={};
  window._recQ['all']=playerName||'';
  window._recTypeFilter=type;
  curTab='hist';
  histSub='all';
  openDetails={};
  if(window.histPage && window.histPage['all']!==undefined) window.histPage['all']=0;
  render();
}

/* ══════════════════════════════════════
   티어 순위표
══════════════════════════════════════ */
let tierRankMode='tier'; // tier | winstreak | wins | revstreak | winrate | recent

function rTier(C,T){
  T.innerText='📊 티어 순위표';
  const allU=getAllUnivs();
  const F=document.getElementById('farea');
  // 모드 버튼
  const modes=[
    {id:'tier',lbl:'📊 티어순'},
    {id:'wins',lbl:'🏆 다승순'},
    {id:'winstreak',lbl:'🔥 승차순'},
    {id:'winrate',lbl:'📈 승률순'},
    {id:'revstreak',lbl:'❄️ 역승차순'},
  ];
  const modeSortBtns=[
    {id:'mini_win',lbl:'⚡ 미니 승',color:'#7c3aed'},
    {id:'mini_loss',lbl:'⚡ 미니 패',color:'#7c3aed'},
    {id:'ck_win',lbl:'🤝 CK 승',color:'#dc2626'},
    {id:'ck_loss',lbl:'🤝 CK 패',color:'#dc2626'},
    {id:'comp_win',lbl:'🏆 대회 승',color:'#d97706'},
    {id:'comp_loss',lbl:'🏆 대회 패',color:'#d97706'},
    {id:'ind_win',lbl:'🎮 개인전 승',color:'#16a34a'},
    {id:'ind_loss',lbl:'🎮 개인전 패',color:'#16a34a'},
    {id:'gj_win',lbl:'⚔️ 끝장전 승',color:'#8b5cf6'},
    {id:'gj_loss',lbl:'⚔️ 끝장전 패',color:'#8b5cf6'},
    {id:'civ_win',lbl:'⚔️ 시빌워 승',color:'#db2777'},
    {id:'civ_loss',lbl:'⚔️ 시빌워 패',color:'#db2777'},
    {id:'tt_win',lbl:'🎯 티어대회 승',color:'#f59e0b'},
    {id:'tt_loss',lbl:'🎯 티어대회 패',color:'#f59e0b'},
    {id:'pro_win',lbl:'🏅 프로리그 승',color:'#0891b2'},
    {id:'pro_loss',lbl:'🏅 프로리그 패',color:'#0891b2'},
    {id:'univm_win',lbl:'🏟️ 대학대전 승',color:'#7c3aed'},
    {id:'univm_loss',lbl:'🏟️ 대학대전 패',color:'#7c3aed'},
  ];
  const allModeIds=new Set([...modes.map(m=>m.id),...modeSortBtns.map(m=>m.id)]);
  if(!tierRankMode||!allModeIds.has(tierRankMode)) tierRankMode='tier';
  const _curModeNoFilter=tierRankMode&&(!window._tierTypeSet||window._tierTypeSet.size===0);
  if(window._tierTypeFilterOpen===undefined) window._tierTypeFilterOpen=false;
  if(window._tierFilterOpen===undefined) window._tierFilterOpen=false;
  if(!window._tierRaceFilter) window._tierRaceFilter='전체';
  if(window._tierHideNoRecord===undefined) window._tierHideNoRecord=false;
  const _hasTypeFilter=window._tierTypeSet&&window._tierTypeSet.size>0;
  // 활성 필터 수 계산 (뱃지용)
  const _activeFilters=[
    fUniv!=='전체', fTier!=='전체',
    window._tierRaceFilter!=='전체',
    window._tierHideNoRecord, window._tierExcludeMale,
    _hasTypeFilter
  ].filter(Boolean).length;

  // ── 1행: 필터(좌측) + 보기 모드 + (우측) 티어표 ──
  let fh=`<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">`;
  fh+=`<div class="fbar" style="flex:1 1 420px;min-width:0;overflow-x:auto;flex-wrap:nowrap;-webkit-overflow-scrolling:touch;scrollbar-width:none;gap:4px">`;
  fh+=`<button class="pill ${window._tierFilterOpen||_activeFilters>0?'on':''}" style="flex-shrink:0;white-space:nowrap" onclick="window._tierFilterOpen=!window._tierFilterOpen;render()">🔍 필터${_activeFilters>0?` (${_activeFilters})`:''} ${window._tierFilterOpen?'▲':'▼'}</button>`;
  modes.forEach(m=>{
    const on=tierRankMode===m.id&&_curModeNoFilter;
    fh+=`<button class="pill ${on?'on':''}" style="flex-shrink:0;white-space:nowrap" onclick="tierRankMode='${m.id}';window._tierTypeSet=new Set();render()">${m.lbl}</button>`;
  });
  fh+=`</div>`;
  // ── 뷰 전환 버튼 (우측) ──
  const _viewModes=[
    {id:'table',      icon:'📋', title:'테이블'},
    {id:'card',       icon:'🃏', title:'카드그리드'},
    {id:'podium',     icon:'🏆', title:'포디움'},
    {id:'compact',    icon:'📝', title:'컴팩트'},
    {id:'tier-group', icon:'🎖️', title:'티어별 그룹'},
  ];
  if(!window._tierViewMode) window._tierViewMode = (()=>{try{return localStorage.getItem('su_tier_view_mode')||'table';}catch(e){return 'table';}})();
  fh+=`<div style="display:flex;gap:3px;flex-shrink:0;flex-wrap:wrap;justify-content:flex-end">`;
  _viewModes.forEach(vm=>{
    const on=window._tierViewMode===vm.id;
    fh+=`<button title="${vm.title}" onclick="window._tierViewMode='${vm.id}';try{localStorage.setItem('su_tier_view_mode','${vm.id}');}catch(e){}render()" style="padding:5px 8px;border-radius:7px;border:1.5px solid ${on?'var(--blue)':'var(--border2)'};background:${on?'#eff6ff':'var(--white)'};color:${on?'var(--blue)':'var(--text3)'};font-size:13px;cursor:pointer;line-height:1">${vm.icon}</button>`;
  });
  fh+=`</div>`;
  // (요청사항) 티어순위표 하위 메뉴의 '티어표' 버튼 제거
  fh+=`</div>`;

  if(window._tierFilterOpen||_activeFilters>0){
  {
    // ── 2행: 대학 (스크롤) ──
    fh+=`<div class="fbar" style="overflow-x:auto;flex-wrap:nowrap;-webkit-overflow-scrolling:touch;scrollbar-width:none;gap:6px;padding-bottom:2px">`;
    fh+=`<button class="pill ${fUniv==='전체'?'on':''}" style="flex-shrink:0" onclick="sf('전체','${fTier}')">전체</button>`;
    allU.forEach(u=>{fh+=`<button class="pill ${fUniv===u.name?'on':''}" style="flex-shrink:0;${fUniv===u.name?`background:${u.color};border-color:${u.color};color:#fff`:''}" onclick="sf('${u.name}','${fTier}')">${u.name}</button>`;});
    fh+=`</div>`;
    // ── 3행: 티어 (스크롤) ──
    fh+=`<div class="fbar" style="overflow-x:auto;flex-wrap:nowrap;-webkit-overflow-scrolling:touch;scrollbar-width:none;gap:6px;padding-bottom:2px">`;
    fh+=`<button class="pill ${fTier==='전체'?'on':''}" style="flex-shrink:0" onclick="sf('${fUniv}','전체')">전체</button>`;
    TIERS.forEach(t=>{
      const _bc=getTierBtnColor(t),_bt=getTierBtnTextColor(t),_sel=fTier===t;
      fh+=`<button class="pill" style="flex-shrink:0;border-color:${_bc};border-width:${_sel?'2':'1'}px;${_sel?`background:${_bc};color:${_bt};font-weight:700;`:'color:'+_bc+';'}" onclick="sf('${fUniv}','${t}')">${getTierPillLabel(t)}</button>`;
    });
    fh+=`</div>`;
    // ── 4행: 종족 + 옵션 (flex-wrap) ──
    fh+=`<div class="fbar" style="flex-wrap:wrap;gap:6px">`;
    ['전체','T','Z','P'].forEach(r=>{
      fh+=`<button class="pill ${window._tierRaceFilter===r?'on':''}" onclick="window._tierRaceFilter='${r}';render()">${r==='전체'?'전체':r}</button>`;
    });
    fh+=`<span style="color:var(--border2);align-self:center">│</span>`;
    fh+=`<button class="pill ${window._tierHideNoRecord?'on':''}" style="${window._tierHideNoRecord?'background:#f59e0b;border-color:#f59e0b;color:#fff':''}" onclick="window._tierHideNoRecord=!window._tierHideNoRecord;render()">전적없는 스트리머 숨김</button>`;
    fh+=`<button class="pill ${window._tierExcludeMale?'on':''}" style="${window._tierExcludeMale?'background:#ec4899;border-color:#ec4899;color:#fff':''}" onclick="window._tierExcludeMale=!window._tierExcludeMale;render()">남자 제외</button>`;
    fh+=`</div>`;
  }

  // ── 3행: 유형별 필터 ──
  const _typeCount=window._tierTypeSet?window._tierTypeSet.size:0;
  const _toggleBtnLabel=window._tierTypeFilterOpen?'▲ 접기':`▼ 선택${_typeCount>0?` (${_typeCount})`:''}`;
  const _toggleBtnStyle=_typeCount>0&&!window._tierTypeFilterOpen
    ?'padding:3px 10px;border-radius:12px;border:2px solid var(--blue);background:var(--blue);font-size:11px;cursor:pointer;color:#fff;font-weight:700'
    :'padding:3px 10px;border-radius:12px;border:1px solid var(--border2);background:var(--surface);font-size:11px;cursor:pointer;color:var(--text3)';
  fh+=`<div class="fbar" style="gap:6px;flex-wrap:wrap;align-items:center">
    <button class="pill ${!_hasTypeFilter?'on':''}" onclick="window._tierTypeSet=new Set();window._tierTypeFilterOpen=false;render()">전체</button>`;
  if(_hasTypeFilter){
    window._tierTypeSet.forEach(id=>{
      const mb=modeSortBtns.find(m=>m.id===id);
      if(mb) fh+=`<button class="pill on" style="background:${mb.color};border-color:${mb.color};color:#fff" onclick="window._tierTypeSet.delete('${id}');render()">${mb.lbl} ✕</button>`;
    });
  }
  fh+=`<button onclick="window._tierTypeFilterOpen=!window._tierTypeFilterOpen;render()" style="${_toggleBtnStyle}">${_toggleBtnLabel}</button>`;
  if(window._tierTypeFilterOpen){
    fh+=`<div style="width:100%;display:flex;flex-wrap:wrap;gap:5px;padding:8px 10px;background:var(--surface);border-radius:10px;border:1px solid var(--border2);margin-top:2px">`;
    modeSortBtns.forEach(m=>{
      if(!window._tierTypeSet)window._tierTypeSet=new Set();
      const on=window._tierTypeSet.has(m.id);
      fh+=`<button class="pill ${on?'on':''}" style="${on?`background:${m.color};border-color:${m.color};color:#fff`:''}" onclick="if(!window._tierTypeSet)window._tierTypeSet=new Set();window._tierTypeSet.has('${m.id}')?window._tierTypeSet.delete('${m.id}'):window._tierTypeSet.add('${m.id}');render()">${m.lbl}</button>`;
    });
    fh+=`</div>`;
  }
  fh+=`</div>`;
  } // end filter open block
  F.innerHTML=fh;

  if(false&&tierRankMode==='recent'){
    // 최근 경기 내역 (버튼 삭제됨 - 사용 안 함)
    const recentGames=[];
    function extractGames(matchList,label){
      matchList.forEach(m=>{
        (m.sets||[]).forEach(set=>{
          (set.games||[]).forEach(g=>{
            if(!g.playerA||!g.playerB||!g.winner)return;
            const wn=g.winner==='A'?g.playerA:g.playerB;
            const ln=g.winner==='A'?g.playerB:g.playerA;
            recentGames.push({date:m.d||'',winner:wn,loser:ln,map:g.map||'-',label:label||''});
          });
        });
      });
    }
    extractGames(miniM,'미니대전');
    extractGames(univM,'대학대전');
    extractGames(comps,'대회');
    extractGames(ckM,'대학CK');
    extractGames(proM,'프로리그');
    // 조별리그 대회 경기 포함
    const tourItems=typeof getTourneyMatches==='function'?getTourneyMatches():[];
    extractGames(tourItems,'조별대회');
    // 티어대회 포함
    if(ttM&&ttM.length) extractGames(ttM,'티어대회');
    // 개인전/끝장전 포함 (구조 다름: wName/lName 직접 필드)
    (indM||[]).forEach(m=>{
      recentGames.push({date:m.d||'',winner:m.wName,loser:m.lName,map:m.map||'-',label:'개인전'});
    });
    (gjM||[]).forEach(m=>{
      recentGames.push({date:m.d||'',winner:m.wName,loser:m.lName,map:m.map||'-',label:m._proLabel?'프로끝장전':'끝장전'});
    });
    recentGames.sort((a,b)=>b.date.localeCompare(a.date));

    // 종족 필터 상태
    if(!window._recentRaceFilter) window._recentRaceFilter='전체';
    // 티어 필터 상태
    if(!window._recentTierFilter) window._recentTierFilter='전체';

    let filtered=recentGames;
    if(window._recentRaceFilter!=='전체'){
      filtered=filtered.filter(g=>{
        const wp=players.find(p=>p.name===g.winner);
        const lp=players.find(p=>p.name===g.loser);
        return (wp&&wp.race===window._recentRaceFilter)||(lp&&lp.race===window._recentRaceFilter);
      });
    }
    if(window._recentTierFilter!=='전체'){
      filtered=filtered.filter(g=>{
        const wp=players.find(p=>p.name===g.winner);
        const lp=players.find(p=>p.name===g.loser);
        return (wp&&wp.tier===window._recentTierFilter)||(lp&&lp.tier===window._recentTierFilter);
      });
    }

    let fh=`<div class="fbar">`;
    ['전체','T','Z','P'].forEach(r=>{
      fh+=`<button class="pill ${window._recentRaceFilter===r?'on':''}" onclick="window._recentRaceFilter='${r}';render()">${r==='전체'?'전체':r}</button>`;
    });
    fh+=`<button class="pill ${window._recentTierFilter==='전체'?'on':''}" style="margin-left:8px" onclick="window._recentTierFilter='전체';render()">전체</button>`;
    TIERS.forEach(t=>{
    const _bc=getTierBtnColor(t),_bt=getTierBtnTextColor(t),_sel=window._recentTierFilter===t;
    fh+=`<button class="pill" style="border-color:${_bc};border-width:${_sel?'2':'1'}px;${_sel?`background:${_bc};color:${_bt};font-weight:700;`:'color:'+_bc+';'}" onmouseover="if(!${_sel})this.style.background='${_bc}22'" onmouseout="if(!${_sel})this.style.background=''" onclick="window._recentTierFilter='${t}';render()">${getTierPillLabel(t)}</button>`;
  });
    fh+=`</div>`;
    F.innerHTML+=fh;

    let h=`<div style="font-size:11px;color:var(--gray-l);margin-bottom:8px">총 ${filtered.length}건</div>`;
    h+=`<table><thead><tr><th>날짜</th><th>종류</th><th>승자</th><th>패자</th><th>맵</th></tr></thead><tbody>`;
    if(!filtered.length)h+=`<tr><td colspan="5" style="padding:30px;color:var(--gray-l);text-align:center">경기 기록 없음</td></tr>`;
    const pageSize=100;
    if(window._recentPage===undefined) window._recentPage=0;
    const totalPages=Math.max(1,Math.ceil(filtered.length/pageSize));
    if(window._recentPage>=totalPages) window._recentPage=totalPages-1;
    const paged=filtered.slice(window._recentPage*pageSize,(window._recentPage+1)*pageSize);
    if(filtered.length>pageSize){
      h+=`<tr><td colspan="5" style="padding:10px 0">
        <div style="display:flex;align-items:center;justify-content:center;gap:8px">
          <button class="btn btn-w btn-xs" onclick="window._recentPage=Math.max(0,(window._recentPage||0)-1);render()" ${window._recentPage<=0?'disabled':''}>이전</button>
          <span style="font-size:11px;color:var(--gray-l)">${(window._recentPage||0)+1} / ${totalPages}</span>
          <button class="btn btn-w btn-xs" onclick="window._recentPage=Math.min(${totalPages-1},(window._recentPage||0)+1);render()" ${window._recentPage>=totalPages-1?'disabled':''}>다음</button>
        </div>
      </td></tr>`;
    }
    paged.forEach(g=>{
      const wp=players.find(p=>p.name===g.winner);const lp=players.find(p=>p.name===g.loser);
      const wc=wp?gc(wp.univ):'#888';const lc=lp?gc(lp.univ):'#888';
      const lblColors={'미니대전':'#2563eb','대학대전':'#7c3aed','대회':'#d97706','대학CK':'#dc2626','프로리그':'#0891b2','조별대회':'#16a34a','티어대회':'#7c3aed'};
      const lblColor=lblColors[g.label]||'#6b7280';
      h+=`<tr>
        <td style="color:var(--gray-l);font-size:11px">${g.date}</td>
        <td><span style="background:${lblColor};color:#fff;padding:1px 7px;border-radius:4px;font-size:10px;font-weight:700">${g.label||'-'}</span></td>
        <td><span style="display:inline-flex;align-items:center;gap:5px;font-weight:800" class="wt">
          ${wp?getPlayerPhotoHTML(g.winner,'22px'):''}
          <span style="cursor:pointer" onclick="openPlayerModal('${(g.winner||'').replace(/\\/g,'\\\\').replace(/'/g,"\\'")}')">
            ${wp?`<span class="rbadge r${wp.race}" style="font-size:10px;margin-right:2px">${wp.race}</span>`:''}${g.winner}${getStatusIconHTML(g.winner)}</span></span>
          ${wp?`<span class="ubadge" style="background:${wc};font-size:10px;padding:1px 6px;margin-left:4px">${wp.univ}</span>`:''}</td>
        <td><span style="display:inline-flex;align-items:center;gap:5px;opacity:.75">
          ${lp?getPlayerPhotoHTML(g.loser,'22px'):''}
          <span style="cursor:pointer" onclick="openPlayerModal('${(g.loser||'').replace(/\\/g,'\\\\').replace(/'/g,"\\'")}')">
            ${lp?`<span class="rbadge r${lp.race}" style="font-size:10px;margin-right:2px">${lp.race}</span>`:''}${g.loser}</span></span>
          ${lp?`<span class="ubadge" style="background:${lc};font-size:10px;padding:1px 6px;margin-left:4px;opacity:.7">${lp.univ}</span>`:''}</td>
        <td style="color:var(--gray-l);font-size:11px">${g.map}</td>
      </tr>`;
    });
    C.innerHTML=h+`</tbody></table>`;
    return;
  }

  let list=[...players]; // 모든 선수 표시 (승패 기록 없어도)
  if(fUniv!=='전체')list=list.filter(p=>p.univ===fUniv);
  if(fTier!=='전체')list=list.filter(p=>fTier==='미정'?(p.tier==='미정'||!p.tier):p.tier===fTier);
  // 종족 필터 적용
  if(window._tierRaceFilter&&window._tierRaceFilter!=='전체') list=list.filter(p=>p.race===window._tierRaceFilter);
  // 전적없는 선수 숨기기
  if(window._tierHideNoRecord) list=list.filter(p=>(p.win+p.loss)>0);
  // 남자 제외
  if(window._tierExcludeMale) list=list.filter(p=>p.gender!=='M');

  let _modePStats=null;
  let _typeSum=null; // 다중선택 시 합산 스코어 맵 {name: number}

  // 유형별 다중선택이 활성화된 경우
  if(window._tierTypeSet && window._tierTypeSet.size>0){
    // 각 유형별 데이터 집계 함수
    function _collectPS(arr, useWL){
      const _ps={};
      (arr||[]).forEach(m=>{(m.sets||[]).forEach(st=>{(st.games||[]).forEach(g=>{
        let wn,ln;
        if(g.wName&&g.lName){wn=g.wName;ln=g.lName;}
        else if(g.playerA&&g.playerB&&g.winner){wn=g.winner==='A'?g.playerA:g.playerB;ln=g.winner==='A'?g.playerB:g.playerA;}
        else return;
        if(!_ps[wn])_ps[wn]={w:0,l:0};if(!_ps[ln])_ps[ln]={w:0,l:0};
        _ps[wn].w++;_ps[ln].l++;
      });});});
      return _ps;
    }
    function _collectPSFromGames(games){
      const _ps={};
      (games||[]).forEach(g=>{
        if(!g.playerA||!g.playerB||!g.winner)return;
        const wn=g.winner==='A'?g.playerA:g.playerB;const ln=g.winner==='A'?g.playerB:g.playerA;
        if(!_ps[wn])_ps[wn]={w:0,l:0};if(!_ps[ln])_ps[ln]={w:0,l:0};
        _ps[wn].w++;_ps[ln].l++;
      });
      return _ps;
    }
    function _collectIndPS(arr){
      const _ps={};
      (arr||[]).forEach(m=>{
        if(!m.wName||!m.lName)return;
        if(!_ps[m.wName])_ps[m.wName]={w:0,l:0};if(!_ps[m.lName])_ps[m.lName]={w:0,l:0};
        _ps[m.wName].w++;_ps[m.lName].l++;
      });
      return _ps;
    }
    function _collectCompPS(){
      const _ps={};
      function _cg(g){if(!g.playerA||!g.playerB||!g.winner)return;const wn=g.winner==='A'?g.playerA:g.playerB;const ln=g.winner==='A'?g.playerB:g.playerA;if(!_ps[wn])_ps[wn]={w:0,l:0};if(!_ps[ln])_ps[ln]={w:0,l:0};_ps[wn].w++;_ps[ln].l++;}
      (tourneys||[]).forEach(tn=>{
        (tn.groups||[]).forEach(grp=>{(grp.matches||[]).forEach(m=>{(m.sets||[]).forEach(st=>{(st.games||[]).forEach(_cg);});});});
        const _br=typeof getBracket==='function'?getBracket(tn):{};
        Object.values(_br.matchDetails||{}).forEach(m=>{(m.sets||[]).forEach(st=>{(st.games||[]).forEach(_cg);});});
      });
      return _ps;
    }

    const typeDataMap={
      mini_win:()=>_collectPS(miniM),mini_loss:()=>_collectPS(miniM),
      ck_win:()=>_collectPS(ckM),ck_loss:()=>_collectPS(ckM),
      comp_win:()=>_collectCompPS(),comp_loss:()=>_collectCompPS(),
      ind_win:()=>_collectIndPS(indM),ind_loss:()=>_collectIndPS(indM),
      gj_win:()=>_collectIndPS(gjM),gj_loss:()=>_collectIndPS(gjM),
      civ_win:()=>_collectPS((miniM||[]).filter(m=>m.type==='civil'||(m.a==='A팀'&&m.b==='B팀'))),
      civ_loss:()=>_collectPS((miniM||[]).filter(m=>m.type==='civil'||(m.a==='A팀'&&m.b==='B팀'))),
      tt_win:()=>_collectPS(ttM),tt_loss:()=>_collectPS(ttM),
      pro_win:()=>_collectPS(proM),pro_loss:()=>_collectPS(proM),
      univm_win:()=>_collectPS(univM),univm_loss:()=>_collectPS(univM),
    };
    const sumMap={};
    window._tierTypeSet.forEach(modeId=>{
      const isWin=modeId.endsWith('_win');
      const getter=typeDataMap[modeId];
      if(!getter)return;
      const ps=getter();
      Object.keys(ps).forEach(name=>{
        if(!sumMap[name])sumMap[name]=0;
        sumMap[name]+=(isWin?ps[name].w:ps[name].l);
      });
    });
    _typeSum=sumMap;
    list.sort((a,b)=>(sumMap[b.name]||0)-(sumMap[a.name]||0));
  }
  else if(tierRankMode==='tier'){const _ti=t=>{ const i=TIERS.indexOf(t||'미정'); return i<0?TIERS.length:i; }; list.sort((a,b)=>_ti(a.tier)-_ti(b.tier)||b.points-a.points);}
  else if(tierRankMode==='wins') list.sort((a,b)=>b.win-a.win||a.loss-b.loss);
  else if(tierRankMode==='winrate'){
    list=list.filter(p=>(p.win+p.loss)>=1);
    list.sort((a,b)=>{const ra=(a.win+a.loss)?a.win/(a.win+a.loss):0;const rb=(b.win+b.loss)?b.win/(b.win+b.loss):0;return rb-ra||b.win-a.win;});
  }
  else if(tierRankMode==='winstreak'){
    // 승차: 승수 - 패수 (많을수록 상위)
    list.sort((a,b)=>(b.win-b.loss)-(a.win-a.loss)||b.win-a.win);
  }
  else if(tierRankMode==='revstreak'){
    // 역승차: 패수 - 승수 (많을수록 상위, 즉 승차 낮은 순)
    list.sort((a,b)=>(b.loss-b.win)-(a.loss-a.win)||b.loss-a.loss);
  }
  else if(tierRankMode==='elo'){
    list.sort((a,b)=>(b.elo||ELO_DEFAULT)-(a.elo||ELO_DEFAULT));
  }
  else if(tierRankMode==='mini_win'||tierRankMode==='mini_loss'){
    const _ps={};
    (miniM||[]).forEach(m=>{(m.sets||[]).forEach(st=>{(st.games||[]).forEach(g=>{
      let wn,ln;
      if(g.wName&&g.lName){wn=g.wName;ln=g.lName;}
      else if(g.playerA&&g.playerB&&g.winner){wn=g.winner==='A'?g.playerA:g.playerB;ln=g.winner==='A'?g.playerB:g.playerA;}
      else return;
      if(!_ps[wn])_ps[wn]={w:0,l:0};if(!_ps[ln])_ps[ln]={w:0,l:0};
      _ps[wn].w++;_ps[ln].l++;
    });});});
    _modePStats=_ps;
    list.sort((a,b)=>tierRankMode==='mini_win'?(_ps[b.name]?.w||0)-(_ps[a.name]?.w||0):(_ps[b.name]?.l||0)-(_ps[a.name]?.l||0));
  }
  else if(tierRankMode==='ck_win'||tierRankMode==='ck_loss'){
    const _ps={};
    (ckM||[]).forEach(m=>{(m.sets||[]).forEach(st=>{(st.games||[]).forEach(g=>{
      if(!g.playerA||!g.playerB||!g.winner)return;
      const wn=g.winner==='A'?g.playerA:g.playerB;const ln=g.winner==='A'?g.playerB:g.playerA;
      if(!_ps[wn])_ps[wn]={w:0,l:0};if(!_ps[ln])_ps[ln]={w:0,l:0};
      _ps[wn].w++;_ps[ln].l++;
    });});});
    _modePStats=_ps;
    list.sort((a,b)=>tierRankMode==='ck_win'?(_ps[b.name]?.w||0)-(_ps[a.name]?.w||0):(_ps[b.name]?.l||0)-(_ps[a.name]?.l||0));
  }
  else if(tierRankMode==='comp_win'||tierRankMode==='comp_loss'){
    const _ps={};
    function _cntGame(g){
      if(!g.playerA||!g.playerB||!g.winner)return;
      const wn=g.winner==='A'?g.playerA:g.playerB;const ln=g.winner==='A'?g.playerB:g.playerA;
      if(!_ps[wn])_ps[wn]={w:0,l:0};if(!_ps[ln])_ps[ln]={w:0,l:0};
      _ps[wn].w++;_ps[ln].l++;
    }
    (tourneys||[]).forEach(tn=>{
      (tn.groups||[]).forEach(grp=>{(grp.matches||[]).forEach(m=>{(m.sets||[]).forEach(st=>{(st.games||[]).forEach(_cntGame);});});});
      const _br=typeof getBracket==='function'?getBracket(tn):{};
      Object.values(_br.matchDetails||{}).forEach(m=>{(m.sets||[]).forEach(st=>{(st.games||[]).forEach(_cntGame);});});
    });
    _modePStats=_ps;
    list.sort((a,b)=>tierRankMode==='comp_win'?(_ps[b.name]?.w||0)-(_ps[a.name]?.w||0):(_ps[b.name]?.l||0)-(_ps[a.name]?.l||0));
  }

  const modeHeaders={
    tier:'포인트',wins:'승',winrate:'승률',winstreak:'승차',revstreak:'역승차',
    mini_win:'미니승',mini_loss:'미니패',ck_win:'CK승',ck_loss:'CK패',comp_win:'대회승',comp_loss:'대회패',
    ind_win:'개인전승',ind_loss:'개인전패',gj_win:'끝장전승',gj_loss:'끝장전패',
    civ_win:'시빌워승',civ_loss:'시빌워패',tt_win:'티어대회승',tt_loss:'티어대회패',
    pro_win:'프로리그승',pro_loss:'프로리그패',univm_win:'대학대전승',univm_loss:'대학대전패'
  };
  const hasTypeSet=window._tierTypeSet&&window._tierTypeSet.size>0;
  const extraHeader=hasTypeSet?(window._tierTypeSet.size===1?modeHeaders[[...window._tierTypeSet][0]]||'합산':'합산'):modeHeaders[tierRankMode]||'포인트';

  // ── 뷰별 렌더링 ──
  const _li = (typeof isLoggedIn!=='undefined' ? !!isLoggedIn : false) || !!window.isLoggedIn;
  const _isMb = (typeof window !== 'undefined' && window.innerWidth <= 768);
  const _pad = _isMb ? '6px 8px' : '8px 10px';
  const _padName = _isMb ? '6px 10px' : '8px 12px';
  const _today2=new Date().toISOString().slice(0,10);
  const _30ago2=new Date(Date.now()-30*24*60*60*1000).toISOString().slice(0,10);
  const _7ago2=new Date(Date.now()-7*24*60*60*1000).toISOString().slice(0,10);
  const _canGoHist = (()=>{
    const pick = hasTypeSet && window._tierTypeSet.size===1 ? [...window._tierTypeSet][0] : (!hasTypeSet ? tierRankMode : '');
    return pick && pick.endsWith('_win') || pick && pick.endsWith('_loss');
  })();

  // 공통 헬퍼
  function _getExtraVal(p){
    const tot=p.win+p.loss; const wr=tot?Math.round(p.win/tot*100):0;
    if(_typeSum!==null){const sv=_typeSum[p.name]||0;return`<span style="font-weight:800;color:${sv>0?'#16a34a':sv<0?'#dc2626':'var(--gray-l)'}">${sv}</span>`;}
    if(tierRankMode==='tier') return`<span class="${pC(p.points)}" style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:14px">${pS(p.points)}</span>`;
    if(tierRankMode==='wins') return`<span class="wt" style="font-size:15px;font-weight:800">${p.win}</span>`;
    if(tierRankMode==='winrate') return`<span style="font-weight:700;color:${wr>=50?'var(--green)':'var(--red)'}">${tot?wr+'%':'-'}</span>`;
    if(tierRankMode==='winstreak'){const d=p.win-p.loss;return`<span style="font-weight:800;color:${d>0?'var(--green)':d<0?'var(--red)':'var(--gray-l)'}">${d>0?'+':''}${d}</span>`;}
    if(tierRankMode==='revstreak'){const d=p.loss-p.win;return`<span style="font-weight:800;color:${d>0?'var(--red)':d<0?'var(--green)':'var(--gray-l)'}">${d>0?'+':''}${d}</span>`;}
    if(tierRankMode==='elo'){const e=p.elo||ELO_DEFAULT;return`<span style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:14px;color:${e>=1400?'#7c3aed':e>=1300?'var(--gold)':e>=1200?'var(--green)':'var(--red)'}">${e}</span>`;}
    if(['mini_win','mini_loss','ck_win','ck_loss','comp_win','comp_loss','ind_win','ind_loss','gj_win','gj_loss','civ_win','civ_loss','tt_win','tt_loss','pro_win','pro_loss','univm_win','univm_loss'].includes(tierRankMode)){
      const _v=_modePStats?_modePStats[p.name]:null; const isWin=tierRankMode.endsWith('_win'); const cnt=_v?(isWin?_v.w:_v.l):0;
      return`<span style="font-weight:800;color:${isWin?'#16a34a':'#dc2626'}">${cnt}</span>`;
    }
    return '';
  }
  function _getActHTML(p){
    const _lastD=(p.history||[]).reduce((mx,h)=>h.date>mx?h.date:mx,'');
    if(!_lastD) return '<span style="font-size:10px;color:#9ca3af">-</span>';
    if(_lastD>=_7ago2) return`<span style="font-size:10px;font-weight:900;color:#16a34a" title="7일 이내">🟢</span>`;
    if(_lastD>=_30ago2) return`<span style="font-size:10px;font-weight:900;color:#f59e0b" title="30일 이내">🟡</span>`;
    return '<span style="font-size:10px;font-weight:900;color:#9ca3af">⚫</span>';
  }
  function _getUnivIconHTML(p){
    const url=UNIV_ICONS[p.univ]||(univCfg.find(x=>x.name===p.univ)||{}).icon||'';
    return url?`<img src="${toHttpsUrl(url)}" style="width:22px;height:22px;object-fit:contain;border-radius:var(--su_univ_logo_radius,6px);flex-shrink:0" onerror="this.style.display='none'">`:``; 
  }

  const _vm = window._tierViewMode || 'table';
  let h='';

  // ════════════════════════════════════════════
  // 뷰1: TABLE (기존)
  // ════════════════════════════════════════════
  if(_vm==='table'){
  const _wrapStyle = `overflow-x:auto;-webkit-overflow-scrolling:touch;width:100%`;
  const _tableStyle = _isMb
    ? `table-layout:auto;width:max-content;max-width:100%`
    : `table-layout:auto;width:100%;min-width:1120px;max-width:1600px;margin:0 auto`;
  h=`<div style="${_wrapStyle}">
    <table style="${_tableStyle}"><thead><tr>
      <th style="text-align:center;white-space:nowrap;padding:${_pad}">순위</th>
      <th style="text-align:center;white-space:nowrap;padding:${_pad}">티어</th>
      <th style="text-align:center;white-space:nowrap;padding:${_pad}">대학</th>
      <th style="text-align:center;white-space:nowrap;padding:${_pad}">종족</th>
      <th style="text-align:left;white-space:nowrap;padding:${_padName}">스트리머</th>
      <th style="text-align:center;white-space:nowrap;padding:${_pad}">승</th>
      <th style="text-align:center;white-space:nowrap;padding:${_pad}">패</th>
      <th style="text-align:center;white-space:nowrap;padding:${_pad}">승률</th>
      <th style="text-align:center;white-space:nowrap;padding:${_pad}">${extraHeader}</th>
      <th class="col-hide-mobile" style="text-align:center;white-space:nowrap;padding:${_pad}">ELO</th>
      <th class="col-hide-mobile" style="text-align:center;white-space:nowrap;padding:${_pad}">활동</th>
      ${_li?`<th class="no-export col-hide-mobile" style="text-align:center;white-space:nowrap;padding:${_pad}">관리</th>`:''}
    </tr></thead><tbody>`;
  list.forEach((p,i)=>{
    const col=gc(p.univ);const tot=p.win+p.loss;const wr=tot?Math.round(p.win/tot*100):0;
    let rnkHTML;
    if(i===0) rnkHTML=`<span class="rk1">1등</span>`;
    else if(i===1) rnkHTML=`<span class="rk2">2등</span>`;
    else if(i===2) rnkHTML=`<span class="rk3">3등</span>`;
    else rnkHTML=`<span style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:13px">${i+1}위</span>`;
    const extraVal=_getExtraVal(p);
    const univIconHTML=_getUnivIconHTML(p);
    const _pSafe=(p.name||'').replace(/\\/g,'\\\\').replace(/'/g,"\\'");
    const _modePick = hasTypeSet && window._tierTypeSet.size===1 ? [...window._tierTypeSet][0] : (!hasTypeSet ? tierRankMode : '');
    const _clickHist = (_canGoHist && _modePick) ? `onclick="tierRankGoHist('${_modePick}','${_pSafe}')"` : '';
    const _actHTML=_getActHTML(p);
    const _elo = (p.elo||ELO_DEFAULT);
    h+=`<tr style="border-left:3px solid ${col};background:${gcHex8(p.univ,.06)}">
      <td style="text-align:center;white-space:nowrap;padding:${_pad}">${rnkHTML}</td>
      <td style="text-align:center;white-space:nowrap;padding:${_pad}">${getTierBadge(p.tier)}</td>
      <td style="text-align:center;white-space:nowrap;padding:${_pad}">
        <span class="ubadge clickable-univ" data-icon-done="1"
          style="background:${col};display:inline-flex;align-items:center;gap:6px;font-size:${_isMb?11:13}px;max-width:${_isMb?90:120}px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap"
          onclick="openUnivModal('${p.univ}')"
        >${univIconHTML}${p.univ}</span>
      </td>
      <td style="text-align:center;white-space:nowrap;padding:${_pad}"><span class="rbadge r${p.race}">${p.race}</span></td>
      <td style="text-align:left;white-space:nowrap;padding:${_padName};font-weight:700;min-width:0">
        <span style="display:inline-flex;align-items:center;gap:6px;min-width:0;max-width:${_isMb?170:260}px">
          ${getPlayerPhotoHTML(p.name,_isMb?'34px':'40px')}
          <span class="clickable-name" style="min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" onclick="openPlayerModal('${_pSafe}')">${p.name}</span>
          <span style="flex-shrink:0">${genderIcon(p.gender)}${getStatusIconHTML(p.name)}</span>
        </span>
      </td>
      <td style="text-align:center;white-space:nowrap;padding:${_pad};font-weight:900;color:var(--score-win)">${p.win}</td>
      <td style="text-align:center;white-space:nowrap;padding:${_pad};font-weight:900;color:var(--score-lose)">${p.loss}</td>
      <td style="text-align:center;white-space:nowrap;padding:${_pad};font-weight:800;color:${tot===0?'var(--gray-l)':wr>=50?'var(--green)':'var(--red)'}">${tot?wr+'%':'-'}</td>
      <td style="text-align:center;white-space:nowrap;padding:${_pad};${_canGoHist?'cursor:pointer;text-decoration:underline dotted':''}" ${_clickHist} title="${_canGoHist?'대전기록탭에서 보기':''}">${extraVal}</td>
      <td class="col-hide-mobile" style="text-align:center;white-space:nowrap;padding:${_pad};font-weight:800;color:${_elo>=ELO_DEFAULT?'#2563eb':'#dc2626'}">${_elo}</td>
      <td class="col-hide-mobile" style="text-align:center;white-space:nowrap;padding:${_pad}">${_actHTML}</td>
      ${_li?`<td class="no-export col-hide-mobile" style="text-align:center;white-space:nowrap;padding:${_pad}">${adminBtn(`<button class="btn btn-w btn-xs" onclick="openEPFromModal('${_pSafe}')">✏️ 수정</button>`)}</td>`:''}
    </tr>`;
  });
  h+=`</tbody></table></div>`;
  }

  // ════════════════════════════════════════════
  // 뷰2: CARD GRID (카드 그리드)
  // ════════════════════════════════════════════
  else if(_vm==='card'){
  h=`<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(${_isMb?'140px':'180px'},1fr));gap:${_isMb?'8px':'12px'};padding:4px 0">`;
  list.forEach((p,i)=>{
    const col=gc(p.univ)||'#64748b'; const tot=p.win+p.loss; const wr=tot?Math.round(p.win/tot*100):0;
    const _pSafe=(p.name||'').replace(/\\/g,'\\\\').replace(/'/g,"\\'");
    const univIconHTML=_getUnivIconHTML(p);
    const extraVal=_getExtraVal(p);
    const _actHTML=_getActHTML(p);
    const _rankLabel=i===0?'🥇':i===1?'🥈':i===2?'🥉':`<span style="font-size:11px;font-weight:900;color:var(--text3)">${i+1}위</span>`;
    h+=`<div onclick="openPlayerModal('${_pSafe}')" style="cursor:pointer;background:var(--white);border:1.5px solid ${col}33;border-top:3px solid ${col};border-radius:12px;padding:12px 10px;display:flex;flex-direction:column;align-items:center;gap:6px;transition:box-shadow .15s,transform .15s;position:relative" onmouseover="this.style.boxShadow='0 6px 20px rgba(0,0,0,.1)';this.style.transform='translateY(-2px)'" onmouseout="this.style.boxShadow='none';this.style.transform='none'">
      <div style="position:absolute;top:7px;left:9px;font-size:12px">${_rankLabel}</div>
      <div style="position:absolute;top:7px;right:9px">${_actHTML}</div>
      <div style="margin-top:10px">${getPlayerPhotoHTML(p.name,_isMb?'44px':'52px')}</div>
      <div style="font-weight:800;font-size:${_isMb?12:13}px;text-align:center;line-height:1.3;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${p.name}</div>
      <div style="display:flex;align-items:center;gap:4px;justify-content:center">
        <span class="ubadge" data-icon-done="1" style="background:${col};display:inline-flex;align-items:center;gap:3px;font-size:10px;padding:2px 6px">${univIconHTML}${p.univ}</span>
      </div>
      <div style="display:flex;align-items:center;gap:6px;justify-content:center">
        ${getTierBadge(p.tier)}<span class="rbadge r${p.race}" style="font-size:10px">${p.race}</span>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:4px;width:100%;text-align:center;border-top:1px solid var(--border2);padding-top:6px;margin-top:2px">
        <div><div style="font-size:10px;color:var(--gray-l)">승</div><div style="font-weight:900;font-size:13px;color:var(--score-win)">${p.win}</div></div>
        <div><div style="font-size:10px;color:var(--gray-l)">패</div><div style="font-weight:900;font-size:13px;color:var(--score-lose)">${p.loss}</div></div>
        <div><div style="font-size:10px;color:var(--gray-l)">승률</div><div style="font-weight:800;font-size:12px;color:${tot===0?'var(--gray-l)':wr>=50?'var(--green)':'var(--red)'}">${tot?wr+'%':'-'}</div></div>
      </div>
      <div style="font-size:11px;text-align:center">${extraVal}</div>
    </div>`;
  });
  h+=`</div>`;
  }

  // ════════════════════════════════════════════
  // 뷰3: PODIUM (포디움 + 나머지 리스트)
  // ════════════════════════════════════════════
  else if(_vm==='podium'){
  const top3=list.slice(0,3); const rest=list.slice(3);
  // 포디움 (2위/1위/3위 순서로 배치)
  const podOrder=[1,0,2]; // 인덱스: 2위, 1위, 3위 순서
  const podH=[100,130,85]; // 받침대 높이
  const podColors=['#c0c0c0','#fbbf24','#cd7f32'];
  const podLabels=['🥈','🥇','🥉'];
  h=`<div style="display:flex;align-items:flex-end;justify-content:center;gap:${_isMb?'6px':'16px'};padding:16px 8px 8px;margin-bottom:12px">`;
  podOrder.forEach((pi,ci)=>{
    if(!top3[pi]) return;
    const p=top3[pi]; const col=gc(p.univ)||'#64748b';
    const _pSafe=(p.name||'').replace(/\\/g,'\\\\').replace(/'/g,"\\'");
    const tot=p.win+p.loss; const wr=tot?Math.round(p.win/tot*100):0;
    h+=`<div style="display:flex;flex-direction:column;align-items:center;gap:6px;cursor:pointer;flex:${pi===0?'0 0 ${_isMb?120:150}px':'0 0 ${_isMb?100:130}px'}" onclick="openPlayerModal('${_pSafe}')">
      <div style="font-size:${pi===0?(_isMb?'24px':'28px'):(_isMb?'20px':'24px')}">${podLabels[ci]}</div>
      ${getPlayerPhotoHTML(p.name,pi===0?(_isMb?'56px':'70px'):(_isMb?'44px':'56px'))}
      <div style="font-weight:900;font-size:${pi===0?12:11}px;text-align:center;max-width:${_isMb?100:130}px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${p.name}</div>
      <div style="display:flex;align-items:center;gap:4px">${getTierBadge(p.tier)}</div>
      <div style="background:${col};color:#fff;border-radius:6px;padding:2px 8px;font-size:10px;font-weight:700;max-width:${_isMb?90:110}px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${p.univ}</div>
      <div style="font-size:11px;font-weight:800;color:${tot===0?'var(--gray-l)':wr>=50?'var(--green)':'var(--red)'}">${tot?wr+'%':'-'} (${p.win}W${p.loss}L)</div>
      <div style="width:100%;background:${podColors[ci]}33;border:2px solid ${podColors[ci]};border-bottom:none;border-radius:8px 8px 0 0;height:${podH[ci]}px;display:flex;align-items:center;justify-content:center">
        <span style="font-size:${_isMb?22:28}px;font-weight:900;color:${podColors[ci]};opacity:.6">${pi+1}</span>
      </div>
    </div>`;
  });
  h+=`</div>`;
  // 4위 이하: 컴팩트 리스트
  if(rest.length){
    h+=`<div style="border-top:2px solid var(--border);padding-top:8px">`;
    rest.forEach((p,i)=>{
      const ri=i+3; const col=gc(p.univ)||'#64748b';
      const tot=p.win+p.loss; const wr=tot?Math.round(p.win/tot*100):0;
      const _pSafe=(p.name||'').replace(/\\/g,'\\\\').replace(/'/g,"\\'");
      h+=`<div onclick="openPlayerModal('${_pSafe}')" style="cursor:pointer;display:flex;align-items:center;gap:8px;padding:7px 10px;border-radius:8px;border-left:3px solid ${col};margin-bottom:4px;background:${gcHex8(p.univ,.04)}" onmouseover="this.style.background='${gcHex8(p.univ,.10)}'" onmouseout="this.style.background='${gcHex8(p.univ,.04)}'">
        <span style="font-weight:900;font-size:12px;color:var(--text3);min-width:28px;text-align:center">${ri+1}위</span>
        ${getPlayerPhotoHTML(p.name,'32px')}
        <span style="font-weight:700;font-size:13px;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${p.name}</span>
        ${getTierBadge(p.tier)}
        <span class="ubadge" style="background:${col};font-size:10px;padding:1px 6px">${p.univ}</span>
        <span style="font-size:11px;font-weight:800;color:${tot===0?'var(--gray-l)':wr>=50?'var(--green)':'var(--red)'};min-width:36px;text-align:right">${tot?wr+'%':'-'}</span>
      </div>`;
    });
    h+=`</div>`;
  }
  }

  // ════════════════════════════════════════════
  // 뷰4: COMPACT (초밀도 리스트)
  // ════════════════════════════════════════════
  else if(_vm==='compact'){
  h=`<div style="display:flex;flex-direction:column;gap:2px">`;
  list.forEach((p,i)=>{
    const col=gc(p.univ)||'#64748b'; const tot=p.win+p.loss; const wr=tot?Math.round(p.win/tot*100):0;
    const _pSafe=(p.name||'').replace(/\\/g,'\\\\').replace(/'/g,"\\'");
    const extraVal=_getExtraVal(p); const _actHTML=_getActHTML(p);
    const _elo=(p.elo||ELO_DEFAULT);
    let rnkStr=i<3?['🥇','🥈','🥉'][i]:`<span style="font-size:11px;font-weight:900;color:var(--text3);min-width:20px;text-align:center;display:inline-block">${i+1}</span>`;
    h+=`<div onclick="openPlayerModal('${_pSafe}')" style="cursor:pointer;display:flex;align-items:center;gap:6px;padding:5px 10px;border-radius:6px;background:var(--white);border:1px solid var(--border);border-left:3px solid ${col}" onmouseover="this.style.background='${gcHex8(p.univ,.07)}'" onmouseout="this.style.background='var(--white)'">
      <span style="min-width:24px;text-align:center;font-size:13px">${rnkStr}</span>
      ${getPlayerPhotoHTML(p.name,'26px')}
      <span style="font-weight:700;font-size:12px;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${p.name}${genderIcon(p.gender)}</span>
      ${getTierBadge(p.tier)}
      <span class="rbadge r${p.race}" style="font-size:9px">${p.race}</span>
      <span class="ubadge" style="background:${col};font-size:9px;padding:1px 5px;max-width:${_isMb?60:80}px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${p.univ}</span>
      <span style="font-size:11px;min-width:${_isMb?0:70}px;text-align:right;${_isMb?'display:none':''}"><span style="color:var(--score-win);font-weight:900">${p.win}</span><span style="color:var(--gray-l)">W</span><span style="color:var(--score-lose);font-weight:900">${p.loss}</span><span style="color:var(--gray-l)">L</span></span>
      <span style="font-size:11px;font-weight:800;min-width:36px;text-align:right;color:${tot===0?'var(--gray-l)':wr>=50?'var(--green)':'var(--red)'}">${tot?wr+'%':'-'}</span>
      <span style="font-size:11px;min-width:30px;text-align:right;${_isMb?'display:none':''}">${extraVal}</span>
      <span style="min-width:16px;text-align:center;${_isMb?'display:none':''}">${_actHTML}</span>
    </div>`;
  });
  h+=`</div>`;
  }

  // ════════════════════════════════════════════
  // 뷰5: TIER-GROUP (티어별 그룹)
  // ════════════════════════════════════════════
  else if(_vm==='tier-group'){
  const _tierGroups={};
  list.forEach((p,i)=>{
    const t=p.tier||'미정';
    if(!_tierGroups[t]) _tierGroups[t]={tier:t,players:[]};
    _tierGroups[t].players.push({p,i});
  });
  const _orderedTiers=[...TIERS,'미정'].filter(t=>_tierGroups[t]);
  h='';
  _orderedTiers.forEach(t=>{
    const grp=_tierGroups[t]; if(!grp) return;
    const _tc=getTierBtnColor(t)||'#64748b'; const _tt=getTierBtnTextColor(t)||'#fff';
    h+=`<div style="margin-bottom:14px">
      <div style="display:flex;align-items:center;gap:8px;padding:8px 12px;background:${_tc}18;border-left:4px solid ${_tc};border-radius:0 8px 8px 0;margin-bottom:6px">
        <span style="background:${_tc};color:${_tt};font-weight:900;font-size:13px;padding:3px 12px;border-radius:5px">${getTierLabel(t)}</span>
        <span style="font-size:12px;font-weight:700;color:var(--text3)">${grp.players.length}명</span>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(${_isMb?'130px':'160px'},1fr));gap:${_isMb?'6px':'8px'};padding:0 4px">`;
    grp.players.forEach(({p,i})=>{
      const col=gc(p.univ)||'#64748b'; const tot=p.win+p.loss; const wr=tot?Math.round(p.win/tot*100):0;
      const _pSafe=(p.name||'').replace(/\\/g,'\\\\').replace(/'/g,"\\'");
      h+=`<div onclick="openPlayerModal('${_pSafe}')" style="cursor:pointer;background:var(--white);border:1px solid ${col}33;border-radius:10px;padding:10px 8px;display:flex;flex-direction:column;align-items:center;gap:4px;transition:box-shadow .12s" onmouseover="this.style.boxShadow='0 4px 14px rgba(0,0,0,.09)'" onmouseout="this.style.boxShadow='none'">
        <span style="align-self:flex-start;font-size:10px;font-weight:900;color:var(--text3)">${i+1}위</span>
        ${getPlayerPhotoHTML(p.name,_isMb?'40px':'46px')}
        <span style="font-weight:800;font-size:${_isMb?11:12}px;text-align:center;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${p.name}</span>
        <span class="ubadge" data-icon-done="1" style="background:${col};font-size:9px;padding:1px 5px;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${p.univ}</span>
        <span class="rbadge r${p.race}" style="font-size:9px">${p.race}</span>
        <div style="font-size:10px;font-weight:800;color:${tot===0?'var(--gray-l)':wr>=50?'var(--green)':'var(--red)'}">${tot?wr+'%':'-'} (${p.win}W${p.loss}L)</div>
      </div>`;
    });
    h+=`</div></div>`;
  });
  }

  C.innerHTML=h;
}
