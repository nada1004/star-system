function _pdRecentModeColors(){
  const defaults={'조별리그':'#2563eb','토너먼트':'#16a34a','미니대전':'#7c3aed','시빌워':'#db2777','대학대전':'#7c3aed','대학CK':'#dc2626','프로리그':'#0891b2','티어대회':'#f59e0b','대회':'#d97706','프로리그대회':'#7c3aed','끝장전':'#8b5cf6','개인전':'#8b5cf6','테스트':'#6b7280'};
  try{
    const user=JSON.parse(localStorage.getItem('su_pd_mode_badge_colors')||'{}')||{};
    return {...defaults, ...user};
  }catch(e){
    return defaults;
  }
}

function _pdNormalizeRecentModeLabel(mode){
  let modeLbl=mode||'';
  if(modeLbl==='tier') modeLbl='티어대회';
  if(modeLbl==='tt') modeLbl='티어대회';
  if(modeLbl==='univ') modeLbl='대학대전';
  if(modeLbl==='ck') modeLbl='대학CK';
  if(modeLbl==='pro') modeLbl='프로리그';
  return modeLbl;
}

function buildPlayerRecentHistoryRowHTML(opts){
  const {
    hh,
    hi,
    pName='',
    isLoggedIn=false,
    canEditByDate=false,
    bulkMode=false,
    bulkSelectedSet=null
  } = opts || {};
  const isWin=hh.result==='승';
  const isDraw=hh.result==='무';
  const eloStr=hh.eloDelta!=null
    ?`<span style="font-weight:700;font-size:11px;color:${hh.eloDelta>0?'#16a34a':hh.eloDelta<0?'#dc2626':'#64748b'}">${hh.eloDelta>0?'+':''}${hh.eloDelta}</span>`
    :'-';
  const oppP=players.find(x=>x.name===hh.opp);
  const oppRace=hh.oppRace||oppP?.race||'';
  const canBulkEdit = (isLoggedIn && !hh._readOnly && hi >= 0 && canEditByDate);
  const canEdit = (isLoggedIn && canEditByDate && (((!hh._readOnly) && hi >= 0) || !!hh._editableSource));
  const isChecked = !!(bulkSelectedSet && typeof bulkSelectedSet.has==='function' && bulkSelectedSet.has(hi));
  const selectCheckboxHTML=(bulkMode && canBulkEdit)
    ? `<td class="no-export" style="text-align:center"><input type="checkbox" class="hist-select-checkbox" data-ph-action="hist-select-one" data-ph-index="${hi}" value="${hi}" ${isChecked?'checked':''} style="cursor:pointer"></td>`
    : (bulkMode?`<td class="no-export" style="text-align:center;color:#9ca3af;font-size:11px">-</td>`:'');
  const _editableSourceAttrs = (()=>{
    if(!(hh && hh._editableSource)) return '';
    const st = hh._sourceType || '';
    const base = ` data-ph-source-type="${escAttr(st)}" data-ph-source-tn-id="${escAttr(hh._sourceTnId||'')}" data-ph-source-id="${escAttr(hh._sourceId||hh.matchId||'')}" data-ph-source-date="${escAttr(hh._sourceDate||hh.date||'')}"`;
    if(st === 'proTourStage'){
      return base + ` data-ph-source-round="${escAttr(hh._sourceRound||'')}"`;
    }
    if(st === 'proTourGrp' || st === 'tourGrp'){
      return base + ` data-ph-source-grp="${escAttr(hh._sourceGrpIdx)}" data-ph-source-mi="${escAttr(hh._sourceMatchIdx)}"`;
    }
    if(st === 'tourBkt'){
      return base + ` data-ph-source-rnd="${escAttr(hh._sourceRnd)}" data-ph-source-mi="${escAttr(hh._sourceMi)}" data-ph-source-team-a="${escAttr(hh._sourceTeamA||'')}" data-ph-source-team-b="${escAttr(hh._sourceTeamB||'')}"`;
    }
    if(st === 'proTourGj'){
      return base + ` data-ph-source-gj-idx="${escAttr(hh._sourceGjIdx)}"`;
    }
    if(st === 'ind' || st === 'gj'){
      return base + ` data-ph-source-idx="${escAttr(hh._sourceIdx)}"`;
    }
    return base;
  })();
  const editBtnHTML=canEdit
    ? `<td class="no-export" style="text-align:center;white-space:nowrap">
        <button class="btn btn-w btn-xs" data-ph-action="hist-edit-one" data-ph-name="${escJS(pName)}" data-ph-index="${hi}"${_editableSourceAttrs} title="경기 수정" style="padding:2px 6px;font-size:10px;border-color:var(--border2)">✏️</button>
        <button class="btn btn-r btn-xs" data-ph-action="hist-delete-one" data-ph-name="${escJS(pName)}" data-ph-index="${hi}"${_editableSourceAttrs} title="경기 삭제" style="padding:2px 6px;font-size:10px;margin-left:2px">🗑</button>
      </td>`
    : (isLoggedIn?'<td class="no-export"></td>':'');
  const modeLbl=_pdNormalizeRecentModeLabel(hh.mode);
  const modeColor=(_pdRecentModeColors()[modeLbl])||'#6b7280';
  const hhMid=(hh.matchId||'').replace(/'/g,"\\'");
  const navModes=['미니대전','시빌워','대학대전','대학CK','프로리그','티어대회','끝장전','프로리그끝장전','프로리그대회끝장전','개인전','조별리그','대회','토너먼트','프로리그대회','프로리그팀전','티어대회 토너먼트'];
  const selfSafe=escJS(pName);
  const oppSafe=escJS(hh.opp||'');
  const dSafe=escJS(hh.date||'');
  const mSafe=escJS(hh.map||'');
  const rSafe=escJS(hh.result||'');
  const badgeMeta = (typeof suGetRecentChipMetrics==='function')
    ? suGetRecentChipMetrics('playerRecent', window.innerWidth)
    : { deviceKey:(window.innerWidth<=768?'mb':(window.innerWidth<=1024?'tb':'pc')), scale:1, base:{px:5, fs:8, lh:14, rr:3} };
  const badgeScale = badgeMeta.scale;
  const badgeBase = badgeMeta.base;
  const modeBadgeStyle=`background:${modeColor};color:#fff;padding:0 ${(badgeBase.px*badgeScale).toFixed(2)}px;border-radius:${(badgeBase.rr*badgeScale).toFixed(2)}px;font-size:${(badgeBase.fs*badgeScale).toFixed(2)}px;font-weight:900;line-height:${(badgeBase.lh*badgeScale).toFixed(2)}px;height:${(badgeBase.lh*badgeScale).toFixed(2)}px;white-space:nowrap;display:inline-flex;align-items:center;vertical-align:middle;max-width:100%;flex-shrink:0;letter-spacing:0`;
  const resultBadgeStyle = `display:inline-flex;align-items:center;justify-content:center;min-width:${Math.max(32, (badgeBase.lh*2.7*badgeScale)).toFixed(2)}px;padding:0 ${Math.max(4, (badgeBase.px*1.7*badgeScale)).toFixed(2)}px;border-radius:${Math.max(8, (badgeBase.rr*4*badgeScale)).toFixed(2)}px;font-size:${(badgeBase.fs*badgeScale).toFixed(2)}px;font-weight:900;line-height:${(badgeBase.lh*badgeScale).toFixed(2)}px;height:${(badgeBase.lh*badgeScale).toFixed(2)}px;white-space:nowrap;letter-spacing:0`;
  const modeCellHTML=modeLbl?(
    navModes.includes(modeLbl)
      ? `<span style="${modeBadgeStyle};cursor:pointer;text-decoration:underline dotted" data-ph-action="hist-open-match" data-ph-self="${selfSafe}" data-ph-opp="${oppSafe}" data-ph-date="${dSafe}" data-ph-map="${mSafe}" data-ph-mode="${escJS(modeLbl)}" data-ph-match-id="${hhMid}" data-ph-result="${rSafe}" title="경기 상세 보기">${modeLbl}</span>`
      : `<span style="${modeBadgeStyle}">${modeLbl}</span>`
  ):'';
  return `<tr style="background:${isWin?'#f0fdf4':isDraw?'#f1f5f9':'#fef2f2'}10">
    ${selectCheckboxHTML}
    <td style="color:var(--gray-l);font-size:11px">${hh.date}</td>
    <td style="white-space:nowrap;text-align:center">${modeCellHTML}</td>
    <td style="text-align:center">${isWin
      ?`<span style="${resultBadgeStyle};background:#dcfce7;color:#16a34a;border:1px solid #bbf7d0">WIN</span>`
      :isDraw
        ?`<span style="${resultBadgeStyle};background:#f1f5f9;color:#475569;border:1px solid #e2e8f0">DRAW</span>`
        :`<span style="${resultBadgeStyle};background:#fee2e2;color:#dc2626;border:1px solid #fecaca">LOSE</span>`}</td>
    <td style="cursor:pointer;font-weight:700" data-ph-action="hist-open-player" data-ph-player="${escJS(hh.opp)}"><span style="display:inline-flex;align-items:center;gap:5px">${getPlayerPhotoHTML(hh.opp,'22px','pointer-events:none;')}<span style="color:var(--blue)">${hh.opp}</span></span></td>
    <td><span class="rbadge r${oppRace||''}" style="font-size:10px">${oppRace||''}</span></td>
    <td style="color:var(--gray-l);font-size:11px">${hh.map && hh.map !== '-' ? hh.map : ''}</td>
    <td>${eloStr}</td>
    ${editBtnHTML}
  </tr>`;
}

function buildPlayerRecentHistorySectionHTML(opts){
  const {
    pName='',
    totalGames=0,
    fromN=0,
    toN=0,
    isLoggedIn=false,
    bulkMode=false,
    bulkSelectedSet=null,
    seasonBar='',
    displayHist=[],
    curPage=0,
    totalPages=1
  } = opts || {};
  const selectAllCheckbox = bulkMode
    ? `<th class="no-export" style="width:40px"><input type="checkbox" class="hist-select-checkbox" data-ph-action="hist-select-all" data-ph-name="${escJS(pName)}" data-ph-indices="[${displayHist.map(h=>h._origIdx).join(',')}]" style="cursor:pointer"></th>`
    : '';
  const manageHeader = isLoggedIn ? '<th class="no-export" style="width:48px">관리</th>' : '';
  let h=`<div style="font-weight:700;font-size:12px;color:var(--text2);margin-bottom:6px;display:flex;align-items:center;gap:6px;flex-wrap:wrap">
    <span style="display:inline-block;width:3px;height:14px;background:var(--blue);border-radius:2px"></span>최근 경기 기록
    <span style="font-size:11px;color:var(--gray-l);font-weight:400">(총 ${totalGames}게임 · ${fromN}–${toN}번째 표시)</span>
    ${isLoggedIn?`<button class="no-export" data-ph-action="hist-bulk-toggle" style="margin-left:auto;padding:2px 8px;border-radius:10px;border:1px solid var(--border2);background:var(--white);font-size:10px;font-weight:800;cursor:pointer;color:${bulkMode?'#dc2626':'var(--text3)'}">${bulkMode?'✕ 선택 완료':'☐ 일괄 선택'}</button>`:''}
  </div>`;
  h+=seasonBar;
  h+=`<div style="border:1px solid var(--border);border-radius:10px;overflow:hidden;margin-bottom:16px">`;
  h+=`<table style="margin:0;border:none;border-radius:0"><thead><tr>${selectAllCheckbox}<th>날짜</th><th>종류</th><th>결과</th><th>상대</th><th>종족</th><th>맵</th><th>ELO</th>${manageHeader}</tr></thead><tbody>`;
  displayHist.forEach(hh=>{
    h += buildPlayerRecentHistoryRowHTML({
      hh,
      hi: hh._origIdx,
      pName,
      isLoggedIn,
      canEditByDate: (typeof _canEditByDate==='function') ? _canEditByDate(hh.date) : false,
      bulkMode,
      bulkSelectedSet
    });
  });
  h+=`</tbody></table>`;
  if(totalPages>1){
    h+=`<div style="display:flex;align-items:center;justify-content:center;gap:8px;padding:8px 12px;background:var(--surface);border-top:1px solid var(--border)">
      <button class="btn btn-w btn-xs" ${curPage===0?'disabled':''} data-ph-action="hist-page" data-ph-name="${escJS(pName)}" data-ph-page="${curPage-1}">◀ 이전</button>
      <span style="font-size:12px;color:var(--gray-l)">${curPage+1} / ${totalPages} 페이지</span>
      <button class="btn btn-w btn-xs" ${curPage>=totalPages-1?'disabled':''} data-ph-action="hist-page" data-ph-name="${escJS(pName)}" data-ph-page="${curPage+1}">다음 ▶</button>
      ${bulkMode?`<button id="bulk-edit-btn" class="btn btn-g btn-xs no-export" data-ph-action="hist-bulk-edit" data-ph-name="${escJS(pName)}" style="padding:2px 8px;font-size:10px;border-color:var(--border2)">✏️ 선택 수정 (${bulkSelectedSet?.size||0})</button><button id="bulk-delete-btn" class="btn btn-r btn-xs no-export" data-ph-action="hist-bulk-delete" data-ph-name="${escJS(pName)}" style="padding:2px 8px;font-size:10px;border-color:var(--border2)">🗑 선택 삭제 (${bulkSelectedSet?.size||0})</button>`:''}
    </div>`;
  }else if(bulkMode){
    h+=`<div style="display:flex;align-items:center;justify-content:flex-end;gap:8px;padding:8px 12px;background:var(--surface);border-top:1px solid var(--border)">
      <button id="bulk-edit-btn" class="btn btn-g btn-xs no-export" data-ph-action="hist-bulk-edit" data-ph-name="${escJS(pName)}" style="padding:2px 8px;font-size:10px;border-color:var(--border2)">✏️ 선택 수정 (${bulkSelectedSet?.size||0})</button><button id="bulk-delete-btn" class="btn btn-r btn-xs no-export" data-ph-action="hist-bulk-delete" data-ph-name="${escJS(pName)}" style="padding:2px 8px;font-size:10px;border-color:var(--border2)">🗑 선택 삭제 (${bulkSelectedSet?.size||0})</button>
    </div>`;
  }
  h+=`</div>`;
  return h;
}

function _bindPlayerRecentHistoryDelegatedEvents(){
  if(window._playerRecentHistoryDelegatedBound) return;
  window._playerRecentHistoryDelegatedBound = true;

  document.addEventListener('click', (e)=>{
    const el = e.target && e.target.closest ? e.target.closest('[data-ph-action]') : null;
    if(!el || el.disabled) return;
    const action = el.getAttribute('data-ph-action');
    const name = el.getAttribute('data-ph-name') || '';

    if(action === 'hist-bulk-toggle'){
      e.preventDefault();
      if(typeof togglePlayerHistBulkMode === 'function') togglePlayerHistBulkMode();
      return;
    }
    if(action === 'hist-page'){
      e.preventDefault();
      if(typeof window._goPlayerHistPage === 'function') window._goPlayerHistPage(Number(el.getAttribute('data-ph-page') || 0), name);
      return;
    }
    if(action === 'hist-bulk-edit'){
      e.preventDefault();
      if(typeof openPlayerHistBulkEdit === 'function') openPlayerHistBulkEdit(name);
      return;
    }
    if(action === 'hist-bulk-delete'){
      e.preventDefault();
      if(typeof deletePlayerHistBulk === 'function') deletePlayerHistBulk(name);
      return;
    }
    if(action === 'hist-edit-one'){
      e.preventDefault();
      const sourceType = el.getAttribute('data-ph-source-type') || '';
      if(sourceType){
        if(typeof openPlayerRecentEditableSourceEdit === 'function'){
          openPlayerRecentEditableSourceEdit(name, {
            sourceType,
            tnId: el.getAttribute('data-ph-source-tn-id') || '',
            round: el.getAttribute('data-ph-source-round') || '',
            grpIdx: el.getAttribute('data-ph-source-grp'),
            matchIdx: el.getAttribute('data-ph-source-mi'),
            rnd: el.getAttribute('data-ph-source-rnd'),
            mi: el.getAttribute('data-ph-source-mi'),
            teamA: el.getAttribute('data-ph-source-team-a') || '',
            teamB: el.getAttribute('data-ph-source-team-b') || '',
            d: el.getAttribute('data-ph-source-date') || '',
            sourceId: el.getAttribute('data-ph-source-id') || '',
            gjIdx: el.getAttribute('data-ph-source-gj-idx'),
            idx: el.getAttribute('data-ph-source-idx')
          });
        }
      }else if(typeof openPlayerHistEdit === 'function') openPlayerHistEdit(name, Number(el.getAttribute('data-ph-index') || -1));
      return;
    }
    if(action === 'hist-delete-one'){
      e.preventDefault();
      const sourceType = el.getAttribute('data-ph-source-type') || '';
      if(sourceType){
        if(typeof deletePlayerRecentEditableSource === 'function'){
          deletePlayerRecentEditableSource(name, {
            sourceType,
            tnId: el.getAttribute('data-ph-source-tn-id') || '',
            round: el.getAttribute('data-ph-source-round') || '',
            grpIdx: el.getAttribute('data-ph-source-grp'),
            matchIdx: el.getAttribute('data-ph-source-mi'),
            rnd: el.getAttribute('data-ph-source-rnd'),
            mi: el.getAttribute('data-ph-source-mi'),
            teamA: el.getAttribute('data-ph-source-team-a') || '',
            teamB: el.getAttribute('data-ph-source-team-b') || '',
            d: el.getAttribute('data-ph-source-date') || '',
            sourceId: el.getAttribute('data-ph-source-id') || '',
            gjIdx: el.getAttribute('data-ph-source-gj-idx'),
            idx: el.getAttribute('data-ph-source-idx')
          });
        }
      }else if(typeof deletePlayerHist === 'function') deletePlayerHist(name, Number(el.getAttribute('data-ph-index') || -1));
      return;
    }
    if(action === 'hist-open-player'){
      e.preventDefault();
      try{ cm('playerModal'); }catch(_){}
      setTimeout(()=>{
        if(typeof openPlayerModal === 'function') openPlayerModal(el.getAttribute('data-ph-player') || '');
      }, 100);
      return;
    }
    if(action === 'hist-open-match'){
      e.preventDefault();
      try{
        const _s=JSON.parse(localStorage.getItem('su_pd_style')||'{}');
        if(_s.close_on_badge!==false) cm('playerModal');
      }catch(_){}
      const self = el.getAttribute('data-ph-self') || '';
      const opp = el.getAttribute('data-ph-opp') || '';
      const date = el.getAttribute('data-ph-date') || '';
      const map = el.getAttribute('data-ph-map') || '';
      const mode = el.getAttribute('data-ph-mode') || '';
      const matchId = el.getAttribute('data-ph-match-id') || '';
      const result = el.getAttribute('data-ph-result') || '';
      setTimeout(()=>{
        if(typeof openMatchDetailFromHistory === 'function') openMatchDetailFromHistory(self, opp, date, map, mode, matchId, result);
        else if(typeof openMatchDetailByMatchId === 'function') openMatchDetailByMatchId(matchId, mode);
      }, 80);
    }
  });

  document.addEventListener('change', (e)=>{
    const el = e.target && e.target.closest ? e.target.closest('[data-ph-action]') : null;
    if(!el) return;
    const action = el.getAttribute('data-ph-action');
    if(action === 'hist-select-one'){
      if(typeof togglePlayerHistSelect === 'function') togglePlayerHistSelect(Number(el.getAttribute('data-ph-index') || -1));
      return;
    }
    if(action === 'hist-select-all'){
      const name = el.getAttribute('data-ph-name') || '';
      const raw = el.getAttribute('data-ph-indices') || '[]';
      let indices = [];
      try{ indices = JSON.parse(raw); }catch(e){}
      if(typeof togglePlayerHistSelectAll === 'function') togglePlayerHistSelectAll(name, indices);
    }
  });
}

try{
  _bindPlayerRecentHistoryDelegatedEvents();
  window.buildPlayerRecentHistoryRowHTML = buildPlayerRecentHistoryRowHTML;
  window.buildPlayerRecentHistorySectionHTML = buildPlayerRecentHistorySectionHTML;
}catch(e){}
