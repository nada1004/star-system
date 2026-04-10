/* ══════════════════════════════════════
   현황판 — 대학별 컬러블록 로스터 보드
   (구현황판 통합 포함)
══════════════════════════════════════ */

let _b2View = 'univ';
let _b2SaveUniv = '전체';
let _b2Collapsed = new Set();
let _b2ShowSolo = false;
let _b2CrewCollapsed = new Set();
let _b2CrewCardSize = 'm'; // 's' | 'm' | 'l'
let _b2CrewListMode = 'grid'; // 'grid' | 'list'
// 종합게임 뷰 전역 변수
window._b2GameListMode = 'grid'; // 'grid' | 'list'
window._b2GameCardSize = 'm'; // 's' | 'm' | 'l'

// 대학별 현황판 색상 진하기 (0~100, %)
let b2LabelAlpha  = J('su_b2la')  ?? 16;
let b2BgAlpha     = J('su_b2ba')  ?? 9;
let b2BgImgAlpha      = J('su_b2bia')  ?? 12; // 배경 이미지 진하기 기본값 (0~100, %)
let b2FreeBgAlpha     = J('su_b2fba')  ?? 25; // 무소속 배경 진하기 (기본 25%)
let b2FreeTierBgAlpha = J('su_b2ftba') ?? 15; // 무소속 티어 우측 배경 진하기 (기본 15%)
function _b2AlphaHex(pct){ return Math.round((pct||0)/100*255).toString(16).padStart(2,'0'); }

function _b2ToggleCard(btn, univName) {
  if (_b2Collapsed.has(univName)) _b2Collapsed.delete(univName); else _b2Collapsed.add(univName);
  const card = btn.closest('[data-b2card]');
  if (!card) return;
  const body = card.querySelector('.b2-card-body');
  if (body) body.style.display = _b2Collapsed.has(univName) ? 'none' : '';
  btn.textContent = _b2Collapsed.has(univName) ? '▶' : '▼';
}
function _b2CollapseAll() {
  _b2VisUnivs().filter(u=>u.name!=='무소속').forEach(u=>_b2Collapsed.add(u.name));
  const s=document.getElementById('b2-content'); if(s){s.innerHTML=_b2UnivView();injectUnivIcons(s);}
}
function _b2ExpandAll() {
  _b2Collapsed.clear();
  const s=document.getElementById('b2-content'); if(s){s.innerHTML=_b2UnivView();injectUnivIcons(s);}
}

const _B2_ROLE_ORDER = ['이사장','동아리 회장','총장','부총장','교수','코치','선장','동아리장','반장','총괄'];

function _b2RoleRank(p) {
  const i = _B2_ROLE_ORDER.indexOf(p.role||'');
  return i >= 0 ? i : 99;
}

// 숨김 대학 항상 제외 (로그인 여부 관계없이 board2에서는 hidden=true인 대학 숨김)
function _b2VisUnivs() {
  return getAllUnivs().filter(u => !u.hidden);
}

function rBoard2(C, T) {
  T.innerText = '📊 현황판';

  const univList = _b2VisUnivs().filter(u => u.name !== '무소속');

  // 탭 버튼 스타일 헬퍼
  function _b2TabBtn(view, color, label) {
    const on = _b2View === view;
    const c = color || 'var(--blue)';
    return `<button onclick="_b2View='${view}';render()" style="padding:5px 16px;border-radius:20px;border:2px solid ${on?c:'var(--border2)'};background:${on?c:'var(--white)'};color:${on?'#fff':'var(--text3)'};font-weight:700;font-size:12px;cursor:pointer">${label}</button>`;
  }

  // 잘못된 뷰 리셋 (삭제된 탭 or 로그인 필요 탭)
  if (_b2View === 'game' || _b2View === 'crew') _b2View = 'univ';
  if (_b2View === 'old' && !isLoggedIn) _b2View = 'univ';

  // 저장/초기화 바
  let saveBar = '';
  if (_b2View === 'univ') {
    saveBar = `<div style="display:flex;align-items:center;gap:6px;margin-left:auto;flex-shrink:0">
      <div style="position:relative">
        <select id="b2-save-sel" onchange="_b2SaveUniv=this.value" style="padding:4px 28px 4px 10px;border-radius:8px;border:1px solid var(--border2);font-size:12px;background:var(--white);color:var(--text2);appearance:none;cursor:pointer">
          <option value="전체">🏫 전체</option>
          ${univList.map(u=>`<option value="${u.name}"${_b2SaveUniv===u.name?' selected':''}>${u.name}</option>`).join('')}
        </select>
        <svg style="position:absolute;right:6px;top:50%;transform:translateY(-50%);pointer-events:none;color:var(--gray-l)" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m6 9 6 6 6-6"/></svg>
      </div>
      <button onclick="saveB2Img()" style="padding:4px 12px;border-radius:8px;border:1px solid var(--border2);background:var(--white);color:var(--text2);font-size:12px;font-weight:700;cursor:pointer;display:flex;align-items:center;gap:4px">📷 이미지저장</button>
    </div>`;
  } else if (_b2View === 'free') {
    saveBar = `<div style="margin-left:auto;flex-shrink:0">
      <button onclick="saveB2FreeImg()" style="padding:4px 12px;border-radius:8px;border:1px solid var(--border2);background:var(--white);color:var(--text2);font-size:12px;font-weight:700;cursor:pointer;display:flex;align-items:center;gap:4px">📷 이미지저장</button>
    </div>`;
  }

  const filterBar = `
    <div id="b2-nav" style="display:flex;align-items:center;gap:8px;margin-bottom:16px;flex-wrap:wrap">
      ${_b2TabBtn('univ','var(--blue)','🏟️ 대학별')}
      ${_b2TabBtn('free','var(--blue)','🚶 무소속')}
      ${_b2TabBtn('players','var(--purple)','👤 프로필')}
      ${isLoggedIn?_b2TabBtn('old','#64748b','📊 구현황판'):''}
      ${saveBar}
    </div>
    <div id="b2-content"></div>`;

  C.innerHTML = filterBar;

  const sub = document.getElementById('b2-content');
  if (_b2View === 'univ') {
    sub.innerHTML = _b2UnivView();
    injectUnivIcons(sub);
  } else if (_b2View === 'free') {
    sub.innerHTML = _b2FreeView();
    injectUnivIcons(sub);
  } else if (_b2View === 'players') {
    sub.innerHTML = _b2PlayersView();
  } else if (_b2View === 'old') {
    if (typeof rBoard === 'function') rBoard(sub, T);
    else sub.innerHTML = '<div style="padding:40px;text-align:center;color:var(--gray-l)">구현황판을 불러올 수 없습니다.</div>';
  }
}

/* ── 대학별 뷰 ── */
function _b2UnivView() {
  const univList = _b2VisUnivs().filter(u => u.name !== '무소속');
  if (!univList.length) return `<div style="text-align:center;color:var(--text3);padding:40px">표시할 대학이 없습니다</div>`;
  const _allVis = players.filter(p => univList.some(u=>u.name===p.univ) && !p.hidden && !p.retired && !p.hideFromBoard);
  const _tierCts = {}; _allVis.forEach(p=>{ const t=p.tier||'?'; _tierCts[t]=(_tierCts[t]||0)+1; });
  const statsBar = `<div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;padding:7px 14px;background:var(--surface);border:1px solid var(--border2);border-radius:10px;flex-wrap:wrap">
    <span style="font-size:12px;font-weight:800;color:var(--text2)">👥 ${_allVis.length}명</span>
    <span style="width:1px;height:14px;background:var(--border2);display:inline-block"></span>
    <span style="font-size:12px;font-weight:800;color:var(--text2)">🏫 ${univList.length}개 대학</span>
    ${TIERS.filter(t=>_tierCts[t]).length?`<span style="width:1px;height:14px;background:var(--border2);display:inline-block"></span>${TIERS.filter(t=>_tierCts[t]).map(t=>`<span style="font-size:11px;font-weight:700;padding:1px 7px;border-radius:8px;background:${getTierBtnColor(t)};color:${getTierBtnTextColor(t)||'#fff'}">${t} ${_tierCts[t]}</span>`).join('')}`:''}
  </div>`;
  const _b2Cols = (typeof boardGridCols!=='undefined'&&boardGridCols===2) ? 'repeat(2,1fr)' : '1fr';
  let h = statsBar + `<style>.b2-bottom-img{max-width:130px;max-height:110px;object-fit:contain;}.b2-side-panel{float:right;width:230px;margin:0 0 6px 10px;border-radius:10px;padding:8px;box-sizing:border-box;}@media(max-width:640px){.b2-side-panel{display:none!important;}.b2-bottom-img{display:none!important;}}@media(max-width:768px){.b2-univ-grid{grid-template-columns:1fr!important;}}</style>`;
  h += `<div class="b2-univ-grid" style="display:grid;grid-template-columns:${_b2Cols};gap:12px;align-items:start">`;
  univList.forEach(u => {
    // Skip universities with undefined names
    if (!u.name) return;
    const members = players.filter(p => p.univ === u.name && !p.hidden && !p.retired && !p.hideFromBoard);
    h += _b2UnivBlock(u.name, gc(u.name), members);
  });
  h += `</div>`;
  return h;
}

function _b2UnivBlock(univName, col, members, forExport=false) {
  // Safety check for undefined university name
  if (!univName) {
    return `<div style="border-radius:14px;border:2px dashed #ccc55;padding:16px 18px;background:#f5f5f5;display:flex;align-items:center;gap:10px;opacity:.7">
      <span style="font-weight:900;font-size:15px;color:#999;">[Unknown University]</span>
      <span style="font-size:11px;color:var(--gray-l)"> university name is undefined</span>
    </div>`;
  }
  
  const uCfg = univCfg.find(x => x.name === univName) || {};
  const iconUrl = uCfg.icon || uCfg.img || UNIV_ICONS[univName] || '';
  const textCol = _b2ContrastColor(col);
  const lightCol = col + _b2AlphaHex(b2BgAlpha);
  const labelCol = col + _b2AlphaHex(b2LabelAlpha);

  // 멤버 없을 때 빈 블록
  if (!members.length) {
    return `<div style="border-radius:14px;border:2px dashed ${col}55;padding:16px 18px;background:${lightCol};display:flex;align-items:center;gap:10px;opacity:.7">
      ${iconUrl?`<img src="${iconUrl}" style="width:36px;height:36px;object-fit:contain;border-radius:8px" onerror="this.style.display='none'">`:''}
      <span style="font-weight:900;font-size:15px;color:${col};cursor:pointer" onclick="if(typeof openUnivModal==='function')openUnivModal('${univName}')">${univName}</span>
      <span style="font-size:11px;color:var(--gray-l)">등록된 선수 없음</span>
    </div>`;
  }

  // 직책 그룹
  const roledMembers = members.filter(p => _B2_ROLE_ORDER.includes(p.role||''));
  roledMembers.sort((a,b) => _b2RoleRank(a) - _b2RoleRank(b));

  // 티어 그룹
  const tieredMembers = members.filter(p => !_B2_ROLE_ORDER.includes(p.role||''));
  const tierGroups = {};
  tieredMembers.forEach(p => {
    const t = p.tier || '?';
    if (!tierGroups[t]) tierGroups[t] = [];
    tierGroups[t].push(p);
  });
  const orderedTierKeys = TIERS.filter(t => tierGroups[t]).concat(
    Object.keys(tierGroups).filter(t => !TIERS.includes(t))
  );

  // 사이드 패널 (현황판 memoImgs/memo) — _tableRow 정의 전에 계산해야 padding-right에 사용 가능
  const _smemo = uCfg.memo || '';
  const _simgs = (uCfg.memoImgs||[]).concat(uCfg.memoImg?[uCfg.memoImg]:[]);
  const hasSide = !!((_smemo||_simgs.length));

  // 새 레이아웃: 왼쪽 라벨 열(대학색) + 오른쪽 스트리머 열(연한 배경)
  // hasSide 시 padding-right:190px → border-bottom 선이 사이드 패널 영역까지 이어짐
  const _tableRow = (label, isRole, chips) => `
    <div style="display:flex;align-items:stretch;border-bottom:1px solid ${col}44${hasSide?';padding-right:190px':''}">
      <div style="background:${labelCol};min-width:62px;width:62px;display:flex;align-items:center;justify-content:center;padding:7px 4px;flex-shrink:0">
        <span style="font-size:11px;font-weight:800;color:${col};text-align:center;line-height:1.3;word-break:keep-all">${label}</span>
      </div>
      <div style="flex:1;background:${lightCol};padding:7px 10px;display:flex;flex-wrap:wrap;gap:6px;align-items:center">
        ${chips}
      </div>
    </div>`;

  // 같은 직책끼리 묶어서 1행
  const roleGroups = {};
  const roleOrder = [];
  roledMembers.forEach(p => {
    const r = p.role || '';
    if (!roleGroups[r]) { roleGroups[r] = []; roleOrder.push(r); }
    roleGroups[r].push(p);
  });
  const _bgPos = uCfg.bgImgPos || 'center center';
  const _bgSize = uCfg.bgImgSize || 'cover';
  const _bgOpacity = ((uCfg.bgImgAlpha ?? b2BgImgAlpha) / 100).toFixed(2);
  const bgImgHtml = uCfg.bgImg
    ? forExport
      ? `<img src="${uCfg.bgImg}" crossorigin="anonymous" style="position:absolute;inset:0;width:100%;height:100%;object-fit:${_bgSize};opacity:${_bgOpacity};pointer-events:none;z-index:0">`
      : `<div style="position:absolute;inset:0;background:url('${uCfg.bgImg}') ${_bgPos}/${_bgSize} no-repeat;opacity:${_bgOpacity};pointer-events:none;z-index:0"></div>`
    : '';

  let rows = '';
  roleOrder.forEach(role => {
    const group = roleGroups[role];
    rows += _tableRow(role, true, group.map(p => _b2NameTag(p, col, true)).join(''));
  });
  orderedTierKeys.forEach(tier => {
    const group = tierGroups[tier];
    group.sort((a,b) => (a.name||'').localeCompare(b.name||''));
    rows += _tableRow(tier, false, group.map(p => _b2NameTag(p, col, false)).join(''));
  });
  const sidePanelHtml = hasSide ? `<div style="position:absolute;top:0;right:0;width:190px;bottom:0;background:${lightCol};padding:8px;box-sizing:border-box;overflow:hidden">
    ${_simgs.map((src,i)=>`<img src="${src}" style="width:100%;border-radius:7px;${(i<_simgs.length-1||_smemo)?'margin-bottom:5px;':''}display:block;object-fit:contain" onerror="this.style.display='none'">`).join('')}
    ${_smemo?`<div style="font-size:11px;color:#333;white-space:pre-wrap;line-height:1.5;margin-top:${_simgs.length?'5px':'0'}">${_smemo}</div>`:''}
  </div>` : '';
  const bodyContent = `<div style="position:relative;overflow:hidden">
    ${bgImgHtml}
    <div style="position:relative;z-index:1">
      <div>${rows}</div>
      ${sidePanelHtml}
    </div>
  </div>`;

  // 하단 메모/이미지 (bMemo/bMemoImgs)
  const _bnote = uCfg.bMemo || '';
  const _bimgs = (uCfg.bMemoImgs||[]).concat(uCfg.bMemoImg?[uCfg.bMemoImg]:[]);
  const _bimgHtmls = _bimgs.map(src=>`<img class="b2-bottom-img" src="${src}" style="border-radius:8px;display:inline-block" onerror="this.style.display='none'">`).join('');
  const bottomSection = (_bnote||_bimgs.length) ? `<div style="padding:6px 14px 10px;background:${col}15;border-top:1px solid ${col}22">
    ${_bimgHtmls?`<div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:${_bnote?'6px':'0'}">${_bimgHtmls}</div>`:''}
    ${_bnote?`<div style="font-size:12px;color:#333;white-space:pre-wrap;line-height:1.6">${_bnote}</div>`:''}
  </div>` : '';

  return `
    <div data-b2card="${univName.replace(/"/g,'&quot;')}" style="border-radius:14px;overflow:hidden;box-shadow:0 2px 16px ${col}30">
      <div style="background:${col};padding:10px 16px">
        <div style="display:flex;align-items:center;gap:6px;flex-wrap:nowrap;overflow:hidden">
          ${iconUrl?`<img src="${iconUrl}" style="width:36px;height:36px;object-fit:contain;border-radius:8px;flex-shrink:0;cursor:pointer" onclick="if(typeof openUnivModal==='function')openUnivModal('${univName}')" onerror="this.style.display='none'">`:''}
          <span style="font-weight:900;font-size:15px;color:${textCol};flex-shrink:0;cursor:pointer" onclick="if(typeof openUnivModal==='function')openUnivModal('${univName}')">${univName}</span>
          ${(uCfg.championships||0)>0?`<span style="display:flex;gap:1px;flex-shrink:0">${'<span style="font-size:15px">⭐</span>'.repeat(uCfg.championships)}</span>`:''}
          ${uCfg.memo2?`<span style="font-size:11px;color:${textCol}bb;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:0 1 auto;max-width:45%;margin-left:2px">${uCfg.memo2}</span>`:''}
          <span style="flex:1"></span>
          <span style="flex-shrink:0;background:${textCol}22;color:${textCol};font-size:11px;font-weight:700;padding:2px 8px;border-radius:10px;border:1px solid ${textCol}33;cursor:pointer" onclick="event.stopPropagation();openB2MemberBreakdown(this,'${univName}')">${members.length}명</span>
          ${isLoggedIn?`<button class="no-export" onclick="event.stopPropagation();_b2ToggleCard(this,'${univName.replace(/'/g,"\\'")}')" style="background:${textCol}22;border:1px solid ${textCol}33;color:${textCol};font-size:11px;cursor:pointer;padding:1px 7px;border-radius:8px;flex-shrink:0;font-weight:700;margin-left:3px" title="${_b2Collapsed.has(univName)?'펼치기':'접기'}">${_b2Collapsed.has(univName)?'▶':'▼'}</button>`:''}
        </div>
      </div>
      <div class="b2-card-body" style="${_b2Collapsed.has(univName)?'display:none':''}">
        ${bodyContent}
        ${bottomSection}
      </div>
    </div>`;
}

/* ── 무소속 뷰 ── */
function _b2FreeView() {
  const freeMembers = players.filter(p => (!p.univ || p.univ === '무소속') && !p.hidden && !p.retired && !p.hideFromBoard);
  if (!freeMembers.length) return `<div style="text-align:center;color:var(--text3);padding:40px">무소속 멤버가 없습니다</div>`;

  const roledFree = freeMembers.filter(p => _B2_ROLE_ORDER.includes(p.role||''));
  roledFree.sort((a,b) => _b2RoleRank(a) - _b2RoleRank(b));
  const tieredFree = freeMembers.filter(p => !_B2_ROLE_ORDER.includes(p.role||''));

  const tierGroups = {};
  tieredFree.forEach(p => {
    const t = p.tier || '?';
    if (!tierGroups[t]) tierGroups[t] = [];
    tierGroups[t].push(p);
  });
  const orderedTierKeys = TIERS.filter(t => tierGroups[t]).concat(
    Object.keys(tierGroups).filter(t => !TIERS.includes(t))
  );

  const defCol = '#64748b';
  let h = `<div style="border-radius:14px;overflow:hidden;box-shadow:0 2px 14px #0002">
    <div style="background:${defCol};padding:10px 16px;display:flex;align-items:center;gap:8px">
      <span style="font-weight:900;font-size:15px;color:#fff">🚶 무소속</span>
      <span style="margin-left:auto;background:#fff2;color:#fff;font-size:11px;font-weight:700;padding:2px 8px;border-radius:10px;border:1px solid #fff4">${freeMembers.length}명</span>
    </div>
    <div style="background:#64748b${_b2AlphaHex(b2BgAlpha)};padding:6px 14px 12px">`;

  const _frow = (labelEl, contentEl) => `<div style="padding:5px 0;border-bottom:1px solid ${defCol}18"><div style="display:flex;align-items:stretch">${labelEl}<div style="flex:1;padding:2px 4px">${contentEl}</div></div></div>`;
  const _fl = (text, isRole) => `<span style="font-size:12px;font-weight:800;color:${isRole?defCol:'var(--text3)'};width:56px;min-width:56px;text-align:center;flex-shrink:0;display:inline-flex;align-items:center;justify-content:center;background:#64748b${_b2AlphaHex(b2LabelAlpha)};border-right:1px solid ${defCol}33;margin-right:10px">${text}</span>`;

  // 직책 그룹
  roledFree.forEach(p => {
    h += _frow(_fl(p.role||'', true), _b2PlayerRow(p, defCol));
  });
  orderedTierKeys.forEach(tier => {
    const group = tierGroups[tier];
    group.sort((a,b) => (a.name||'').localeCompare(b.name||''));
    const col = getTierBtnColor(tier);
    h += _frow(_fl(tier, false), `<div style="display:flex;flex-wrap:wrap;gap:5px;padding:2px 0">${group.map(p => _b2NameTag(p, col, false)).join('')}</div>`);
  });
  h += `</div></div>`;
  return h;
}


/* ── 버튼 없는 이름 태그 (티어 멤버용) ── */
function _b2NameTag(p, accentCol, showTier) {
  const crewCol = p.crewName ? _gcCrew(p.crewName) : '';
  return `
    <div onclick="openPlayerModal('${(p.name||'').replace(/'/g,"\\'")}')"
      style="display:flex;align-items:center;gap:6px;padding:3px 8px 3px 3px;border-radius:20px;cursor:pointer;transition:background .12s"
      onmouseover="this.style.background='${accentCol}14'"
      onmouseout="this.style.background='transparent'">
      ${_b2Avatar(p, crewCol||accentCol, 58)}
      <span style="font-weight:700;font-size:18px;color:var(--text1);white-space:nowrap;${p.inactive?'opacity:.6':''}">${p.name||''}</span>
      ${p.race&&p.race!=='N'?`<span class="rbadge r${p.race}" style="font-size:10px;flex-shrink:0">${p.race}</span>`:''}
      ${showTier&&p.tier?`<span style="font-size:10px;font-weight:700;padding:1px 5px;border-radius:4px;background:${getTierBtnColor(p.tier)};color:${getTierBtnTextColor(p.tier)||'#fff'};flex-shrink:0">${p.tier}</span>`:''}
      ${p.inactive?'<span style="font-size:9px;background:#fff7ed;color:#9a3412;border-radius:4px;padding:1px 4px;font-weight:700;flex-shrink:0">⏸️</span>':''}
    </div>`;
}

/* ── 직책 1행 표시 ── */
function _b2PlayerRow(p, accentCol) {
  const tierCol = getTierBtnColor(p.tier||'');
  const tierTextCol = getTierBtnTextColor(p.tier||'') || '#fff';
  return `
    <div onclick="openPlayerModal('${(p.name||'').replace(/'/g,"\\'")}')"
      style="display:flex;align-items:center;gap:8px;cursor:pointer;flex:1"
      onmouseover="this.querySelector('.b2name').style.color='${accentCol}'"
      onmouseout="this.querySelector('.b2name').style.color='var(--text1)'">
      ${_b2Avatar(p, accentCol, 58)}
      <span class="b2name" style="font-weight:700;font-size:18px;color:var(--text1);transition:color .1s;${p.inactive?'opacity:.6':''}">${p.name||''}</span>
      ${p.inactive?'<span style="font-size:9px;background:#fff7ed;color:#9a3412;border-radius:4px;padding:1px 4px;font-weight:700;flex-shrink:0">⏸️</span>':''}
      ${p.race&&p.race!=='N'?`<span class="rbadge r${p.race}" style="font-size:11px;flex-shrink:0">${p.race}</span>`:''}
      <span style="font-size:11px;font-weight:700;padding:2px 8px;border-radius:6px;background:${tierCol};color:${tierTextCol}">${p.tier||'?'}</span>
    </div>`;
}

/* ── 칩 ── */
function _b2Chip(p, accentCol) {
  const crewCol = p.crewName ? _gcCrew(p.crewName) : '';
  const borderStyle = `border:1.5px solid ${accentCol}44`;
  return `
    <div onclick="openPlayerModal('${(p.name||'').replace(/'/g,"\\'")}')"
      style="display:flex;align-items:center;gap:7px;padding:5px 13px 5px 5px;border-radius:24px;background:var(--white);${borderStyle};cursor:pointer;box-shadow:0 1px 3px #0001;transition:transform .1s,box-shadow .1s"
      onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 4px 10px ${accentCol}33'"
      onmouseout="this.style.transform='';this.style.boxShadow='0 1px 3px #0001'">
      ${_b2Avatar(p, crewCol||accentCol, 36)}
      <span style="font-weight:700;font-size:13px;color:var(--text1);white-space:nowrap">${p.name||''}</span>
    </div>`;
}

/* ── 아바타 ── */
function _b2Avatar(p, col, size) {
  const raceShort = {'T':'T','Z':'Z','P':'P','N':'?'}[p.race||'N'] || '?';
  const s = size || 28;
  const badgeSize = Math.round(s * 0.38);
  const _rawIcon = getStatusIcon(p.name);
  const statusHtml = getStatusIconHTML(p.name);
  // 1시 방향(30°), 배지 중심을 원 테두리 위에 걸치게
  const r = s / 2, br = badgeSize / 2;
  const _bTop   = Math.round(r * 0.134 - br); // ≈ -7px (s=58 기준)
  const _bRight = Math.round(r * 0.5   - br); // ≈  4px
  const _isImgIcon = _rawIcon && _siIsImg(_rawIcon);
  const _badgeInner = _isImgIcon
    ? `<img src="${_rawIcon}" style="width:${badgeSize}px;height:${badgeSize}px;border-radius:50%;object-fit:cover;opacity:.82" onerror="this.style.display='none'">`
    : statusHtml.replace(/margin-left:[^;]+;/g,'').replace(/font-size:[^;]+;/g,'');
  const _badgeBg = _isImgIcon ? 'rgba(255,255,255,.72)' : 'transparent';
  const badge = statusHtml
    ? `<span style="position:absolute;top:${_bTop}px;right:${_bRight}px;width:${badgeSize}px;height:${badgeSize}px;border-radius:50%;background:${_badgeBg};overflow:hidden;display:flex;align-items:center;justify-content:center;font-size:${Math.round(badgeSize*0.82)}px;line-height:1;filter:drop-shadow(0 1px 2px rgba(0,0,0,.65))">${_badgeInner}</span>`
    : '';
  if (p.photo) {
    return `<span style="width:${s}px;height:${s}px;flex-shrink:0;display:inline-flex;position:relative">
      <img src="${p.photo}" style="width:${s}px;height:${s}px;border-radius:50%;object-fit:cover;flex-shrink:0;border:2px solid ${col}88" onerror="this.parentNode.innerHTML=_b2AvatarFallback('${raceShort}','${col}',${s})">
      ${badge}
    </span>`;
  }
  return `<span style="width:${s}px;height:${s}px;border-radius:50%;background:${col};display:inline-flex;align-items:center;justify-content:center;font-weight:900;font-size:${Math.round(s*0.45)}px;color:#fff;flex-shrink:0;border:2px solid ${col}88;position:relative">${raceShort}${badge}</span>`;
}

function _b2AvatarFallback(letter, col, size) {
  const s = size || 28;
  return `<span style="width:${s}px;height:${s}px;border-radius:50%;background:${col};display:inline-flex;align-items:center;justify-content:center;font-weight:900;font-size:${Math.round(s*0.45)}px;color:#fff;flex-shrink:0;border:2px solid ${col}88">${letter}</span>`;
}


function openB2MemberBreakdown(el, univName) {
  const existing = document.getElementById('b2-mbp');
  if (existing) { const wasEl = existing._forEl; existing.remove(); if (wasEl === el) return; }
  const col = gc(univName);
  const members = players.filter(p => p.univ === univName && !p.hidden && !p.retired && !p.hideFromBoard);
  const roled = members.filter(p => _B2_ROLE_ORDER.includes(p.role||''));
  const tiered = members.filter(p => !_B2_ROLE_ORDER.includes(p.role||''));
  const tierCounts = {};
  tiered.forEach(p => { const t = p.tier||'?'; tierCounts[t] = (tierCounts[t]||0)+1; });
  const orderedTiers = TIERS.filter(t => tierCounts[t]).concat(Object.keys(tierCounts).filter(t => !TIERS.includes(t)));
  const row = (label, val, c) => `<div style="display:flex;justify-content:space-between;align-items:center;gap:16px;padding:2px 0">
    <span style="color:${c||'var(--text2)'};font-size:12px">${label}</span>
    <span style="font-weight:700;color:var(--text1);font-size:12px">${val}명</span></div>`;
  const popup = document.createElement('div');
  popup.id = 'b2-mbp';
  popup.style.cssText = 'position:fixed;z-index:9999;background:var(--white);border:1px solid var(--border2);border-radius:12px;box-shadow:0 4px 20px #0003;padding:12px 14px;min-width:170px';
  popup.innerHTML = `
    <div style="font-weight:800;font-size:13px;color:${col};margin-bottom:8px">${univName} 구성</div>
    ${row('직책자', roled.length)}
    ${row('일반 스트리머', tiered.length)}
    ${orderedTiers.length ? `<div style="border-top:1px solid var(--border2);margin:6px 0"></div>${orderedTiers.map(t=>row(t, tierCounts[t], getTierBtnColor(t))).join('')}` : ''}`;
  popup._forEl = el;
  document.body.appendChild(popup);
  const rect = el.getBoundingClientRect();
  popup.style.top = (rect.bottom + 6) + 'px';
  popup.style.left = rect.left + 'px';
  requestAnimationFrame(() => {
    if (rect.left + popup.offsetWidth > window.innerWidth - 8) popup.style.left = (rect.right - popup.offsetWidth) + 'px';
    if (rect.bottom + popup.offsetHeight + 6 > window.innerHeight) popup.style.top = (rect.top - popup.offsetHeight - 6) + 'px';
  });
  setTimeout(() => {
    function _c(e) { if (!popup.contains(e.target) && e.target !== el) { _close(); } }
    function _s() { _close(); }
    function _close() { popup.remove(); document.removeEventListener('click', _c); window.removeEventListener('scroll', _s, true); }
    document.addEventListener('click', _c);
    window.addEventListener('scroll', _s, {capture:true, once:true});
  }, 0);
}

async function saveB2Img() {
  const univList = _b2VisUnivs().filter(u => u.name !== '무소속');
  const targets = _b2SaveUniv === '전체' ? univList : univList.filter(u => u.name === _b2SaveUniv);
  if (!targets.length) { alert('저장할 대학이 없습니다.'); return; }

  const btn = document.querySelector('[onclick="saveB2Img()"]');
  if (btn) { btn.disabled = true; btn.textContent = '⏳...'; }

  const CARD_W = 720;
  const gap = 14;
  const PAD = 24;

  const tmpDiv = document.createElement('div');
  tmpDiv.style.cssText = `position:fixed;left:-9999px;top:0;padding:${PAD}px;background:#f0f2f5;box-sizing:border-box;width:${CARD_W + PAD * 2}px`;
  tmpDiv.innerHTML = `<style>.b2-bottom-img{max-width:160px;max-height:130px;object-fit:contain;}</style>
    <div style="display:flex;flex-direction:column;gap:${gap}px">
      ${targets.map(u => _b2UnivBlock(u.name, gc(u.name), players.filter(p => p.univ === u.name && !p.hidden && !p.retired && !p.hideFromBoard), true)).join('')}
    </div>`;
  document.body.appendChild(tmpDiv);
  // no-export 요소 제거 (접기 버튼 등)
  tmpDiv.querySelectorAll('.no-export,.no-export-movebtns').forEach(el => el.remove());

  await new Promise(r => setTimeout(r, 100));
  injectUnivIcons(tmpDiv);

  const h = tmpDiv.scrollHeight + 32;
  const w = tmpDiv.scrollWidth;
  const fname = (_b2SaveUniv === '전체' ? '대학별현황판_전체' : `대학별현황판_${_b2SaveUniv}`) + '_' + new Date().toISOString().slice(0,10) + '.png';

  try {
    if (typeof _captureAndSave !== 'function') throw new Error('이미지 저장 기능을 불러오지 못했습니다.');
    await _captureAndSave(tmpDiv, w, h, fname);
  } catch(e) { alert('저장 실패: ' + e.message); }
  finally {
    document.body.removeChild(tmpDiv);
    if (btn) { btn.disabled = false; btn.textContent = '📷 이미지저장'; }
  }
}

async function saveB2FreeImg() {
  const btn = document.querySelector('[onclick="saveB2FreeImg()"]');
  if (btn) { btn.disabled = true; btn.textContent = '⏳...'; }

  const CARD_W = 720;
  const PAD = 24;

  const tmpDiv = document.createElement('div');
  tmpDiv.style.cssText = `position:fixed;left:-9999px;top:0;padding:${PAD}px;background:#f0f2f5;box-sizing:border-box;width:${CARD_W + PAD * 2}px`;
  tmpDiv.innerHTML = `<style>.b2-bottom-img{max-width:160px;max-height:130px;object-fit:contain;}</style>${_b2FreeView()}`;
  document.body.appendChild(tmpDiv);
  // no-export 요소 제거 (접기 버튼 등)
  tmpDiv.querySelectorAll('.no-export,.no-export-movebtns').forEach(el => el.remove());

  await new Promise(r => setTimeout(r, 100));
  injectUnivIcons(tmpDiv);

  const h = tmpDiv.scrollHeight + 32;
  const w = tmpDiv.scrollWidth;
  const fname = '무소속현황판_' + new Date().toISOString().slice(0,10) + '.png';

  try {
    if (typeof _captureAndSave !== 'function') throw new Error('이미지 저장 기능을 불러오지 못했습니다.');
    await _captureAndSave(tmpDiv, w, h, fname);
  } catch(e) { alert('저장 실패: ' + e.message); }
  finally {
    document.body.removeChild(tmpDiv);
    if (btn) { btn.disabled = false; btn.textContent = '📷 이미지저장'; }
  }
}

function _b2ContrastColor(hex) {
  try {
    const c = (hex||'').replace('#','');
    const r = parseInt(c.slice(0,2),16), g = parseInt(c.slice(2,4),16), b = parseInt(c.slice(4,6),16);
    return (r*299+g*587+b*114)/1000 > 128 ? '#1e293b' : '#ffffff';
  } catch(e){ return '#ffffff'; }
}



/* ════════════════════════════════════════
   💜 보라크루 현황판 — 크루별 블록
════════════════════════════════════════ */

function _gcCrew(crewName) {
  const c = (typeof crewCfg !== 'undefined' ? crewCfg : []).find(x => x.name === crewName);
  return (c && c.color) ? c.color : '#7c3aed';
}

/* ── 카드 너비 설정 ── */
function _crewCardMinWidth() {
  return _b2CrewCardSize === 's' ? 88 : _b2CrewCardSize === 'l' ? 150 : 110;
}

function _b2CrewView() {
  // 보라크루 타입 크루만 필터링 (하위 호환: type이 없으면 보라크루로 간주)
  const cfg = (typeof crewCfg !== 'undefined' ? crewCfg : []).filter(c => !c.type || c.type === '보라크루');
  const crewArr = typeof crew !== 'undefined' ? crew : [];
  const scPlayers = players || [];

  function getMembersOf(crewName) {
    const sc = scPlayers.filter(p => p.crewName === crewName);
    const pure = crewArr.filter(m => m.crewName === crewName);
    // 이름으로 중복 제거 (SC 선수와 순수 크루 멤버가 같은 사람일 경우)
    const seenNames = new Set(sc.map(p => p.name));
    const uniquePure = pure.filter(m => !seenNames.has(m.name));
    return { sc, pure: uniquePure, total: sc.length + uniquePure.length };
  }

  const knownNames = cfg.map(c => c.name);
  // 솔로: crew 배열에서 크루명 없는 사람만 (SC선수 제외)
  const soloPure = crewArr.filter(m => !m.crewName || !knownNames.includes(m.crewName));
  // 미배정 SC: crewName 있지만 cfg에 없음
  const unassignedSC = scPlayers.filter(p => p.crewName && !knownNames.includes(p.crewName));
  const totalAll = cfg.reduce((s, c) => s + getMembersOf(c.name).total, 0);

  // 뷰 모드: 'grid'=크루별 | 'list'=전체목록
  const isListMode = _b2CrewListMode === 'list';

  const cardSizeBtns = `
    <div style="display:flex;gap:2px;background:var(--surface);border:1px solid var(--border2);border-radius:8px;padding:2px">
      <button class="btn btn-xs" style="${_b2CrewCardSize==='s'?'background:#7c3aed;color:#fff;border-color:#7c3aed':'background:none;border:none;color:var(--gray-l)'}" onclick="_b2CrewCardSize='s';document.getElementById('b2-content').innerHTML=_b2CrewView()" title="소">S</button>
      <button class="btn btn-xs" style="${_b2CrewCardSize==='m'?'background:#7c3aed;color:#fff;border-color:#7c3aed':'background:none;border:none;color:var(--gray-l)'}" onclick="_b2CrewCardSize='m';document.getElementById('b2-content').innerHTML=_b2CrewView()" title="중">M</button>
      <button class="btn btn-xs" style="${_b2CrewCardSize==='l'?'background:#7c3aed;color:#fff;border-color:#7c3aed':'background:none;border:none;color:var(--gray-l)'}" onclick="_b2CrewCardSize='l';document.getElementById('b2-content').innerHTML=_b2CrewView()" title="대">L</button>
    </div>`;

  let h = '<div style="padding:16px 0">';
  h += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:20px;flex-wrap:wrap">';
  h += '<span style="font-size:18px;font-weight:900;color:#7c3aed">💜 보라크루</span>';
  h += '<span style="font-size:12px;color:var(--gray-l)">' + cfg.length + '개 크루 · ' + totalAll + '명</span>';
  // 뷰 토글
  h += '<div style="display:flex;gap:2px;background:var(--surface);border:1px solid var(--border2);border-radius:8px;padding:2px">';
  h += '<button class="btn btn-xs" style="' + (!isListMode ? 'background:#7c3aed;color:#fff;border-color:#7c3aed' : 'background:none;border:none;color:var(--gray-l)') + '" onclick="_b2CrewListMode=\'grid\';document.getElementById(\'b2-content\').innerHTML=_b2CrewView()">크루별</button>';
  h += '<button class="btn btn-xs" style="' + (isListMode ? 'background:#7c3aed;color:#fff;border-color:#7c3aed' : 'background:none;border:none;color:var(--gray-l)') + '" onclick="_b2CrewListMode=\'list\';document.getElementById(\'b2-content\').innerHTML=_b2CrewView()">전체목록</button>';
  h += '</div>';
  h += cardSizeBtns;
  h += '<div style="margin-left:auto;display:flex;gap:6px;flex-wrap:wrap">';
  // 솔로 토글
  if (soloPure.length) {
    h += '<button class="btn btn-xs" style="' + (_b2ShowSolo ? 'background:#7c3aed;color:#fff;border-color:#7c3aed' : 'border-color:#7c3aed;color:#7c3aed') + '" onclick="_b2ShowSolo=!_b2ShowSolo;document.getElementById(\'b2-content\').innerHTML=_b2CrewView()">🎙️ 솔로 ' + soloPure.length + '명</button>';
  }
  h += '<button class="btn btn-xs no-export" style="border-color:#7c3aed;color:#7c3aed" onclick="saveCrewImg(\'전체\',this)">📷 전체저장</button>';
  if (isLoggedIn) {
    h += '<button class="btn btn-xs no-export" style="background:#7c3aed;color:#fff;border-color:#7c3aed" onclick="openCrewCfgAddModal()">+ 크루 추가</button>';
    h += '<button class="btn btn-xs no-export" style="background:#6d28d9;color:#fff;border-color:#6d28d9" onclick="openCrewAddModal()">+ 크루원 추가</button>';
  }
  h += '</div></div>';

  if (!cfg.length) {
    h += '<div style="text-align:center;padding:60px 20px;color:var(--gray-l);background:var(--surface);border-radius:12px;border:2px dashed #ddd6fe">';
    h += '<div style="font-size:40px;margin-bottom:12px">💜</div>';
    h += '<div style="font-weight:700;margin-bottom:6px">등록된 크루가 없습니다</div>';
    if (isLoggedIn) h += '<div style="font-size:12px">+ 크루 추가로 크루를 먼저 만드세요</div>';
    h += '</div>';
    if (_b2ShowSolo && soloPure.length) h += _b2SoloSection(soloPure);
    h += '</div>';
    return h;
  }

  // ── 전체목록 뷰 ──
  if (isListMode) {
    h += _b2CrewListView(cfg, crewArr, scPlayers);
    if (_b2ShowSolo && soloPure.length) h += _b2SoloSection(soloPure);
    h += '</div>';
    return h;
  }

  // ── 크루별 그리드 뷰 ──
  cfg.forEach(function(c, ci) {
    const col = c.color || '#7c3aed';
    const bgAlpha = Math.round(((c.bgAlpha != null ? c.bgAlpha : 10) / 100) * 255).toString(16).padStart(2, '0');
    const labelAlpha = Math.round(((c.labelAlpha != null ? c.labelAlpha : 18) / 100) * 255).toString(16).padStart(2, '0');
    const members = getMembersOf(c.name);
    // 헤더: 항상 단색 배경 (크루 컬러)
    const hdrStyle = 'background:linear-gradient(135deg,' + col + ',' + col + 'dd);';
    // 본문(스트리머 영역): bgImage 적용
    const bodyBgStyle = c.bgImage
      ? 'background:url(' + JSON.stringify(c.bgImage) + ') center/cover no-repeat;'
      : 'background:' + col + Math.round(((c.cardAlpha != null ? c.cardAlpha : 8) / 100) * 255).toString(16).padStart(2, '0') + ';';
    const bodyOverlay = c.bgImage
      ? '<div style="position:absolute;inset:0;background:' + col + Math.round(((c.bgAlpha != null ? c.bgAlpha : 10) / 100) * 255).toString(16).padStart(2, '0') + ';pointer-events:none"></div>'
      : '';
    const safeName = c.name.replace(/\\/g,'\\\\').replace(/'/g,"\\'");
    const isCollapsed = _b2CrewCollapsed.has(c.name);
    const minW = _crewCardMinWidth();

    h += '<div style="margin-bottom:18px;border-radius:12px;overflow:hidden;border:1.5px solid ' + col + '40;box-shadow:0 2px 12px ' + col + '22">';
    // 헤더 (단색)
    h += '<div style="position:relative;padding:14px 18px;' + hdrStyle + 'min-height:56px;display:flex;align-items:center;gap:12px">';
    // 로고 (클릭 → 상세)
    h += '<div style="position:relative;cursor:pointer;flex-shrink:0" onclick="openCrewDetailModal(\'' + safeName + '\')" title="크루 상세보기">';
    if (c.logo) {
      h += '<img src="' + c.logo + '" style="width:42px;height:42px;border-radius:50%;object-fit:cover;border:2px solid #fff8" onerror="this.style.display=\'none\'">';
    } else {
      h += '<div style="width:42px;height:42px;border-radius:50%;background:#fff3;display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:900;color:#fff;border:2px solid #fff5">' + (c.name || '?')[0] + '</div>';
    }
    h += '</div>';
    // 이름 (클릭 → 상세)
    h += '<div style="position:relative;flex:1;cursor:pointer;min-width:0" onclick="openCrewDetailModal(\'' + safeName + '\')">';
    h += '<div style="font-size:16px;font-weight:900;color:#fff;text-shadow:0 1px 4px #0006">' + c.name + '</div>';
    h += '<div style="font-size:11px;color:#ffffffcc">' + members.total + '명' + (c.desc ? ' · ' + c.desc : '') + '</div>';
    h += '</div>';
    // 버튼들
    h += '<div class="no-export" style="position:relative;display:flex;gap:4px;align-items:center">';
    // 순서 이동
    if (isLoggedIn) {
      h += '<div style="display:flex;flex-direction:column;gap:1px">';
      h += '<button class="btn btn-xs" style="background:#ffffff22;color:#fff;border-color:#ffffff44;font-size:9px;padding:1px 5px;line-height:1" onclick="event.stopPropagation();moveCrewCfg(' + ci + ',-1)" title="위로">▲</button>';
      h += '<button class="btn btn-xs" style="background:#ffffff22;color:#fff;border-color:#ffffff44;font-size:9px;padding:1px 5px;line-height:1" onclick="event.stopPropagation();moveCrewCfg(' + ci + ',1)" title="아래로">▼</button>';
      h += '</div>';
    }
    h += '<button class="btn btn-xs" style="background:#ffffff22;color:#fff;border-color:#ffffff55;font-size:10px" onclick="event.stopPropagation();saveCrewImg(\'' + safeName + '\',this)">📷</button>';
    if (isLoggedIn) {
      h += '<button class="btn btn-xs" style="background:#10b98133;color:#fff;border-color:#10b98155;font-size:10px" onclick="event.stopPropagation();openCrewBulkMoveModal(\'' + safeName + '\')" title="크루 전체 종합게임으로 이동">🎮</button>';
      h += '<button class="btn btn-xs" style="background:#ffffff33;color:#fff;border-color:#ffffff55;font-size:10px" onclick="event.stopPropagation();openCrewCfgEditModal(\'' + safeName + '\')">⚙️</button>';
      h += '<button class="btn btn-xs" style="background:#ef444433;color:#fff;border-color:#ef444455;font-size:10px" onclick="event.stopPropagation();deleteCrewCfg(\'' + safeName + '\')">🗑</button>';
    }
    // 접기/펼치기
    h += '<button class="btn btn-xs" style="background:#ffffff22;color:#fff;border-color:#ffffff44;font-size:11px;padding:2px 6px" onclick="event.stopPropagation();_b2CrewCollapsed.' + (isCollapsed ? 'delete' : 'add') + '(\'' + safeName + '\');document.getElementById(\'b2-content\').innerHTML=_b2CrewView()" title="' + (isCollapsed ? '펼치기' : '접기') + '">' + (isCollapsed ? '▶' : '▼') + '</button>';
    h += '</div>';
    h += '</div>';

    // 멤버 그리드 (접혀있으면 숨김)
    if (!isCollapsed) {
      // 본문: bgImage 있으면 이미지 배경 + 반투명 오버레이, 없으면 단색
      h += '<div style="position:relative;' + bodyBgStyle + 'padding:14px">';
      if (bodyOverlay) h += bodyOverlay;
      if (!members.total) {
        h += '<div style="position:relative;text-align:center;padding:20px;color:var(--gray-l);font-size:12px">아직 크루원이 없습니다';
        if (isLoggedIn) h += '<br><button class="btn btn-xs no-export" style="margin-top:6px;border-color:' + col + ';color:' + col + '" onclick="openCrewAddModal(\'' + safeName + '\')">+ 크루원 추가</button>';
        h += '</div>';
      } else {
        h += '<div style="position:relative;display:grid;grid-template-columns:repeat(auto-fill,minmax(' + minW + 'px,1fr));gap:10px">';
        // 직책 순서: 대표(0) > 부대표(1) > 리더/매니저 > 나머지
        const _crewRankOrder = function(p) {
          const cr = (p.crewRole||p.role||'').replace(/\s/g,'');
          if(cr==='대표'||cr==='리더'||p.role==='representative') return 0;
          if(cr==='부대표'||cr==='부리더') return 1;
          if(cr==='매니저') return 2;
          return 99;
        };
        const _allMembers = [
          ...members.sc.map(p=>({...p, _isSC:true, _idx:-1})),
          ...members.pure.map(m=>({...m, _isSC:false, _idx:crewArr.findIndex(x=>x===m)}))
        ].sort((a,b) => _crewRankOrder(a) - _crewRankOrder(b));
        _allMembers.forEach(function(m) {
          if(m._isSC) h += _crewMemberCard(m.name, m.photo, m.channelUrl, true, -1, col, m.crewName, m.crewRole||'');
          else h += _crewMemberCard(m.name, m.photo, m.link, false, m._idx, col, m.crewName, m.crewRole||'');
        });
        h += '</div>';
      }
      h += '</div>';
    }
    h += '</div>';
  });

  // 미배정 SC
  if (unassignedSC.length) {
    h += '<div style="margin-bottom:18px;border-radius:12px;overflow:hidden;border:1.5px solid var(--border2)">';
    h += '<div style="padding:10px 16px;background:var(--surface);font-size:13px;font-weight:700;color:var(--gray-l)">📌 미배정 크루원</div>';
    h += '<div style="background:var(--white);padding:14px"><div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(' + _crewCardMinWidth() + 'px,1fr));gap:10px">';
    unassignedSC.forEach(function(p) { h += _crewMemberCard(p.name,p.photo,p.channelUrl,true,-1,'#6b7280','',p.crewRole||''); });
    h += '</div></div></div>';
  }

  // 솔로 방송 (crew배열 미배정)
  if (_b2ShowSolo && soloPure.length) {
    h += '<div style="margin-bottom:18px;border-radius:12px;overflow:hidden;border:1.5px solid #8b5cf640">';
    h += '<div style="padding:12px 16px;background:linear-gradient(135deg,#8b5cf620,#7c3aed15);display:flex;align-items:center;gap:8px;border-bottom:1px solid #8b5cf620">';
    h += '<span style="font-size:14px;font-weight:900;color:#7c3aed">🎙️ 무소속</span>';
    h += '<span style="font-size:11px;color:var(--gray-l)">크루 미소속 ' + soloPure.length + '명</span>';
    h += '</div>';
    h += '<div style="background:var(--white);padding:14px"><div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(' + _crewCardMinWidth() + 'px,1fr));gap:10px">';
    soloPure.forEach(function(m) {
      const idx = (typeof crew !== 'undefined' ? crew : []).findIndex(x => x === m);
      h += _crewMemberCard(m.name, m.photo, m.link, false, idx, '#7c3aed', '', '');
    });
    h += '</div></div></div>';
  }

  h += '</div>';
  return h;
}

/* ── 전체목록 뷰 ── */
function _b2CrewListView(cfg, crewArr, scPlayers) {
  const minW = _crewCardMinWidth();
  // 크루별로 그룹핑
  let h = '';
  cfg.forEach(function(c) {
    const col = c.color || '#7c3aed';
    const labelAlpha = Math.round(((c.labelAlpha != null ? c.labelAlpha : 18) / 100) * 255).toString(16).padStart(2, '0');
    const sc = scPlayers.filter(p => p.crewName === c.name);
    const pure = crewArr.filter(m => m.crewName === c.name);
    if (!sc.length && !pure.length) return;
    const rankOrder = {'대표':0,'부대표':1,'리더':0,'부리더':1,'매니저':2};
    const allMembers = [
      ...sc.map(p=>({name:p.name,photo:p.photo,link:p.channelUrl,isSC:true,idx:-1,crewRole:p.crewRole||'',role:p.role||''})),
      ...pure.map(m=>({name:m.name,photo:m.photo,link:m.link,isSC:false,idx:crewArr.findIndex(x=>x===m),crewRole:m.crewRole||'',role:m.role||''}))
    ].sort((a,b)=>{
      // Check main role first (representative gets highest priority)
      const aRoleOrder = a.role === 'representative' ? 0 : (a.role && MAIN_ROLES.includes(a.role) ? getRoleOrder(a.role) : 99);
      const bRoleOrder = b.role === 'representative' ? 0 : (b.role && MAIN_ROLES.includes(b.role) ? getRoleOrder(b.role) : 99);
      if (aRoleOrder !== bRoleOrder) return aRoleOrder - bRoleOrder;
      
      // Then check crew role
      return (rankOrder[a.crewRole]??99)-(rankOrder[b.crewRole]??99);
    });

    h += '<div style="margin-bottom:18px;border-radius:12px;overflow:hidden;border:1.5px solid ' + col + '40">';
    h += '<div style="padding:10px 16px;background:' + col + labelAlpha + ';display:flex;align-items:center;gap:8px">';
    if (c.logo) h += '<img src="' + c.logo + '" style="width:24px;height:24px;border-radius:50%;object-fit:cover;border:1.5px solid #fff8" onerror="this.style.display=\'none\'">';
    h += '<span style="font-size:13px;font-weight:900;color:#fff;text-shadow:0 1px 3px #0005">' + c.name + '</span>';
    h += '<span style="font-size:11px;color:#ffffffbb">' + allMembers.length + '명</span>';
    h += '</div>';
    h += '<div style="background:var(--white);padding:12px"><div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(' + minW + 'px,1fr));gap:8px">';
    allMembers.forEach(m => { h += _crewMemberCard(m.name, m.photo, m.link, m.isSC, m.idx, col, c.name, m.crewRole); });
    h += '</div></div></div>';
  });
  return h;
}

/* ── 솔로 섹션 (crew 배열 미배정) ── */
function _b2SoloSection(soloPure) {
  const minW = _crewCardMinWidth();
  let h = '<div style="margin-bottom:18px;border-radius:12px;overflow:hidden;border:1.5px solid #8b5cf640">';
  h += '<div style="padding:12px 16px;background:linear-gradient(135deg,#8b5cf620,#7c3aed15);display:flex;align-items:center;gap:8px;border-bottom:1px solid #8b5cf620">';
  h += '<span style="font-size:14px;font-weight:900;color:#7c3aed">🎙️ 솔로 방송</span>';
  h += '<span style="font-size:11px;color:var(--gray-l)">크루 미소속 ' + soloPure.length + '명</span>';
  h += '</div>';
  h += '<div style="background:var(--white);padding:14px"><div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(' + minW + 'px,1fr));gap:10px">';
  soloPure.forEach(function(m) {
    const idx = (typeof crew !== 'undefined' ? crew : []).findIndex(x => x === m);
    h += _crewMemberCard(m.name, m.photo, m.link, false, idx, '#7c3aed', '', '');
  });
  h += '</div></div></div>';
  return h;
}

/* ── 크루원 카드 (전체 이미지 채우기, 원형) ── */
function _crewMemberCard(name, photo, link, isSC, crewIdx, accentColor, currentCrew, crewRole) {
  const col = accentColor || '#7c3aed';
  const safeName = (name || '').replace(/\\/g,'\\\\').replace(/'/g,"\\'");
  const isLarge = _b2CrewCardSize === 'l';
  const isSmall = _b2CrewCardSize === 's';
  // 카드 높이: S=120 M=150 L=185
  const cardH = isLarge ? 185 : isSmall ? 120 : 150;
  const nameFontSize = isLarge ? 13 : isSmall ? 10 : 12;
  const roleFontSize = isLarge ? 10 : 9;

  // 이미지: 카드 전체를 원형으로 꽉 채움 (aspect-ratio 1:1, 둥근 모서리)
  const imgInner = photo
    ? '<img src="' + photo + '" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;border-radius:inherit" onerror="this.style.display=\'none\';this.nextSibling.style.display=\'flex\'">'
      + '<div style="position:absolute;inset:0;background:linear-gradient(135deg,' + col + ',' + col + '99);border-radius:inherit;display:none;align-items:center;justify-content:center;font-size:' + (cardH*0.35|0) + 'px;font-weight:900;color:#fff">' + (name||'?')[0] + '</div>'
    : '<div style="position:absolute;inset:0;background:linear-gradient(135deg,' + col + ',' + col + '99);border-radius:inherit;display:flex;align-items:center;justify-content:center;font-size:' + (cardH*0.35|0) + 'px;font-weight:900;color:#fff">' + (name||'?')[0] + '</div>';

  // 하단 그라데이션 오버레이 + 이름
  const scDot = isSC ? '<span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:#60a5fa;margin-right:3px;vertical-align:middle;flex-shrink:0"></span>' : '';
  const roleTag = crewRole ? '<div style="font-size:' + roleFontSize + 'px;color:#ffffffbb;font-weight:700;line-height:1.2;margin-bottom:1px">' + crewRole + '</div>' : '';

  const nameClickAttr = isSC ? 'onclick="openPlayerModal(\'' + safeName + '\')" style="cursor:pointer"' : '';
  const overlay = '<div style="position:absolute;bottom:0;left:0;right:0;background:linear-gradient(transparent,rgba(0,0,0,.72));border-radius:0 0 inherit inherit;padding:' + (isSmall?'14px 6px 6px':'18px 8px 8px') + ';display:flex;flex-direction:column;align-items:center">'
    + roleTag
    + '<div ' + nameClickAttr + ' style="font-weight:800;font-size:' + nameFontSize + 'px;color:#fff;text-align:center;word-break:break-all;line-height:1.2;text-shadow:0 1px 3px #000a;display:flex;align-items:center;gap:2px">' + scDot + (name||'') + '</div>'
    + '</div>';

  // 방송 링크 버튼 (카드 외부 하단)
  const linkBtn = link
    ? '<a href="' + link + '" target="_blank" rel="noopener" style="display:block;text-align:center;padding:4px 6px;background:' + col + ';color:#fff;font-size:10px;font-weight:700;text-decoration:none;border-radius:0 0 10px 10px">▶ 방송</a>'
    : '';

  // 관리자 버튼 (카드 우상단, hover 시에만 표시 / 이미지저장 시 숨김)
  let adminBtns = '';
  if (isLoggedIn) {
    const moveBtn = '<button class="btn btn-xs no-export" style="padding:1px 4px;font-size:9px;background:#7c3aed;color:#fff;border-color:#7c3aed" onclick="event.stopPropagation();openQuickCrewMoveModal(\'' + safeName + '\',' + (isSC?'true':'false') + ',' + crewIdx + ')" title="크루 이동">🔀</button>';
    const editBtn = isSC
      ? '<button class="btn btn-xs no-export" style="padding:1px 4px;font-size:9px;background:#374151;color:#fff;border-color:#374151" onclick="event.stopPropagation();openEP(\'' + safeName + '\');cm(\'playerModal\')" title="수정">✏️</button>'
      : '<button class="btn btn-xs no-export" style="padding:1px 4px;font-size:9px;background:#374151;color:#fff;border-color:#374151" onclick="event.stopPropagation();openCrewEditModal(' + crewIdx + ')" title="수정">✏️</button>';
    const delBtn = isSC ? '' : '<button class="btn btn-xs no-export" style="padding:1px 4px;font-size:9px;background:#dc2626;color:#fff;border-color:#dc2626" onclick="event.stopPropagation();deleteCrew(' + crewIdx + ')" title="삭제">🗑</button>';
    adminBtns = '<div class="no-export b2-admin-btns" style="position:absolute;top:5px;right:5px;display:flex;gap:2px;z-index:2;opacity:0;transition:opacity .18s">' + editBtn + moveBtn + delBtn + '</div>';
  }

  const cardInner = '<div style="position:relative;width:100%;aspect-ratio:1/1;border-radius:' + (link?'10px 10px 0 0':'10px') + ';overflow:hidden;box-shadow:0 2px 8px ' + col + '30">'
    + imgInner + overlay + adminBtns
    + '</div>';

  const _showBtns = 'var _ab=this.querySelector(\'.b2-admin-btns\');if(_ab)_ab.style.opacity=\'1\'';
  const _hideBtns = 'var _ab=this.querySelector(\'.b2-admin-btns\');if(_ab)_ab.style.opacity=\'0\'';
  return '<div style="border-radius:10px;overflow:hidden;border:1.5px solid ' + col + '33;transition:box-shadow .15s;cursor:' + (isSC?'pointer':'default') + '" onmouseover="this.style.boxShadow=\'0 4px 16px ' + col + '44\';' + _showBtns + '" onmouseout="this.style.boxShadow=\'\';' + _hideBtns + '"' + (isSC?' onclick="openPlayerModal(\'' + safeName + '\')"':'') + '>'
    + cardInner + linkBtn + '</div>';
}

/* ── 크루 상세 모달 ── */
function openCrewDetailModal(crewName) {
  const cfg = typeof crewCfg !== 'undefined' ? crewCfg : [];
  const c = cfg.find(x => x.name === crewName);
  if (!c) return;
  const crewArr = typeof crew !== 'undefined' ? crew : [];
  const scPlayers = typeof players !== 'undefined' ? players : [];
  const sc = scPlayers.filter(p => p.gameType === 'general' && p.crewName === crewName);
  const pure = crewArr.filter(m => m.gameType === 'general' && m.crewName === crewName);

  const col = c.color || '#7c3aed';
  const bgAlpha = Math.round(((c.bgAlpha != null ? c.bgAlpha : 10) / 100) * 255).toString(16).padStart(2, '0');
  const bgStyle = c.bgImage
    ? 'background:url(' + JSON.stringify(c.bgImage) + ') center/cover no-repeat;'
    : 'background:linear-gradient(135deg,' + col + ',' + col + 'cc);';
  const overlay = c.bgImage
    ? '<div style="position:absolute;inset:0;background:' + col + bgAlpha + ';pointer-events:none;border-radius:12px 12px 0 0"></div>'
    : '';
  const rankOrder = {'대표':0,'부대표':1,'리더':0,'부리더':1,'매니저':2};

  let html = '<div style="border-radius:12px;overflow:hidden;margin-bottom:14px;border:1.5px solid ' + col + '40">';
  html += '<div style="position:relative;padding:22px 20px;' + bgStyle + 'display:flex;align-items:center;gap:14px">';
  html += overlay;
  if (c.logo) {
    html += '<img src="' + c.logo + '" style="position:relative;width:64px;height:64px;border-radius:50%;object-fit:cover;border:3px solid #fffb;flex-shrink:0;box-shadow:0 2px 12px #0004" onerror="this.style.display=\'none\'">';
  } else {
    html += '<div style="position:relative;width:64px;height:64px;border-radius:50%;background:#fff3;display:flex;align-items:center;justify-content:center;font-size:28px;font-weight:900;color:#fff;border:3px solid #fff5;flex-shrink:0">' + (c.name || '?')[0] + '</div>';
  }
  html += '<div style="position:relative;flex:1;min-width:0">';
  html += '<div style="font-size:22px;font-weight:900;color:#fff;text-shadow:0 1px 6px #0008;margin-bottom:2px">' + c.name + '</div>';
  if (c.desc) html += '<div style="font-size:12px;color:#ffffffcc;margin-bottom:4px">' + c.desc + '</div>';
  html += '<div style="font-size:12px;color:#ffffffcc">' + (sc.length + pure.length) + '명</div>';
  html += '</div>';
  if (isLoggedIn) {
    const safeName = crewName.replace(/\\/g,'\\\\').replace(/'/g,"\\'");
    html += '<div style="position:relative;flex-shrink:0">';
    html += '<button class="btn btn-xs no-export" style="background:#ffffff33;color:#fff;border-color:#ffffff55;font-size:10px" onclick="cm(\'crewDetailModal\');openCrewCfgEditModal(\'' + safeName + '\')">⚙️ 설정</button>';
    html += '</div>';
  }
  html += '</div>';
  html += '<div style="background:var(--white);padding:14px">';
  if (!sc.length && !pure.length) {
    html += '<div style="text-align:center;padding:20px;color:var(--gray-l);font-size:12px">크루원이 없습니다</div>';
  } else {
    const allMem = [
      ...sc.map(p=>({name:p.name,photo:p.photo,link:p.channelUrl,isSC:true,idx:-1,role:p.crewRole||'',mainRole:p.role||''})),
      ...pure.map(m=>({name:m.name,photo:m.photo,link:m.link,isSC:false,idx:crewArr.findIndex(x=>x===m),role:m.crewRole||'',mainRole:m.role||''}))
    ].sort((a,b)=>{
      // Check main role first (representative gets highest priority)
      const aRoleOrder = a.mainRole === 'representative' ? 0 : (a.mainRole && MAIN_ROLES.includes(a.mainRole) ? getRoleOrder(a.mainRole) : 99);
      const bRoleOrder = b.mainRole === 'representative' ? 0 : (b.mainRole && MAIN_ROLES.includes(b.mainRole) ? getRoleOrder(b.mainRole) : 99);
      if (aRoleOrder !== bRoleOrder) return aRoleOrder - bRoleOrder;
      
      // Then check crew role
      return (rankOrder[a.role]??99)-(rankOrder[b.role]??99);
    });
    html += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(110px,1fr));gap:10px">';
    allMem.forEach(m => { html += _crewMemberCard(m.name, m.photo, m.link, m.isSC, m.idx, col, crewName, m.role); });
    html += '</div>';
  }
  html += '</div></div>';

  document.getElementById('crewDetailBody').innerHTML = html;
  document.getElementById('crewDetailTitle').textContent = c.name + ' 크루 상세';
  om('crewDetailModal');
}

/* ── 크루 이미지 저장 ── */
async function saveCrewImg(target, btn) {
  if (btn) { btn.disabled = true; btn.textContent = '⏳...'; }
  const cfg = typeof crewCfg !== 'undefined' ? crewCfg : [];
  const crewArr = typeof crew !== 'undefined' ? crew : [];
  const scPlayers = typeof players !== 'undefined' ? players : [];

  const targets = target === '전체' ? cfg : cfg.filter(c => c.name === target);
  if (!targets.length) {
    if (btn) { btn.disabled = false; btn.textContent = target === '전체' ? '📷 전체저장' : '📷'; }
    return;
  }

  const CARD_W = 720; const PAD = 24;
  const tmpDiv = document.createElement('div');
  tmpDiv.style.cssText = 'position:fixed;left:-9999px;top:0;padding:' + PAD + 'px;background:#f0f2f5;box-sizing:border-box;width:' + (CARD_W + PAD * 2) + 'px';

  let innerHtml = '';
  targets.forEach(function(c) {
    const col = c.color || '#7c3aed';
    const bgAlphaHex = Math.round(((c.bgAlpha != null ? c.bgAlpha : 10) / 100) * 255).toString(16).padStart(2, '0');
    const labelAlphaHex = Math.round(((c.labelAlpha != null ? c.labelAlpha : 18) / 100) * 255).toString(16).padStart(2, '0');
    const sc = scPlayers.filter(p => p.crewName === c.name);
    const pure = crewArr.filter(m => m.crewName === c.name);
    const bgStyle = c.bgImage
      ? 'background:url(' + JSON.stringify(c.bgImage) + ') center/cover no-repeat;'
      : 'background:' + col + labelAlphaHex + ';';
    const overlay = c.bgImage
      ? '<div style="position:absolute;inset:0;background:' + col + bgAlphaHex + ';border-radius:12px 12px 0 0;pointer-events:none"></div>'
      : '';

    innerHtml += '<div style="margin-bottom:18px;border-radius:12px;overflow:hidden;border:1.5px solid ' + col + '40;box-shadow:0 2px 12px ' + col + '22">';
    innerHtml += '<div style="position:relative;padding:14px 18px;' + bgStyle + 'display:flex;align-items:center;gap:12px">' + overlay;
    if (c.logo) {
      innerHtml += '<img src="' + c.logo + '" style="position:relative;width:42px;height:42px;border-radius:50%;object-fit:cover;border:2px solid #fff8;flex-shrink:0">';
    } else {
      innerHtml += '<div style="position:relative;width:42px;height:42px;border-radius:50%;background:#fff3;display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:900;color:#fff;border:2px solid #fff5;flex-shrink:0">' + (c.name || '?')[0] + '</div>';
    }
    innerHtml += '<div style="position:relative;flex:1"><div style="font-size:16px;font-weight:900;color:#fff;text-shadow:0 1px 4px #0006">' + c.name + '</div>';
    if (c.desc) innerHtml += '<div style="font-size:11px;color:#ffffffcc">' + c.desc + '</div>';
    innerHtml += '<div style="font-size:11px;color:#ffffffcc">' + (sc.length + pure.length) + '명</div></div></div>';
    innerHtml += '<div style="background:#fff;padding:14px">';
    if (!sc.length && !pure.length) {
      innerHtml += '<div style="text-align:center;padding:20px;color:#9ca3af;font-size:12px">크루원이 없습니다</div>';
    } else {
      innerHtml += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(110px,1fr));gap:10px">';
      sc.forEach(p => { innerHtml += _crewMemberCardStatic(p.name, p.photo, p.channelUrl, col, p.crewRole||''); });
      pure.forEach(m => { innerHtml += _crewMemberCardStatic(m.name, m.photo, m.link, col, m.crewRole||''); });
      innerHtml += '</div>';
    }
    innerHtml += '</div></div>';
  });

  tmpDiv.innerHTML = '<style>.no-export{display:none!important}</style><div style="display:flex;flex-direction:column;gap:0">' + innerHtml + '</div>';
  document.body.appendChild(tmpDiv);
  await new Promise(r => setTimeout(r, 300));
  if (typeof _imgToDataUrls === 'function') await _imgToDataUrls(tmpDiv, 8000);
  await new Promise(r => setTimeout(r, 100));

  const h = tmpDiv.scrollHeight + 32;
  const w = tmpDiv.scrollWidth;
  const fname = (target === '전체' ? '보라크루_전체' : '보라크루_' + target) + '_' + new Date().toISOString().slice(0, 10) + '.png';

  try {
    if (typeof _captureAndSave !== 'function') throw new Error('이미지 저장 기능을 불러오지 못했습니다.');
    await _captureAndSave(tmpDiv, w, h, fname);
  } catch(e) { alert('저장 실패: ' + e.message); }
  finally {
    document.body.removeChild(tmpDiv);
    if (btn) { btn.disabled = false; btn.textContent = target === '전체' ? '📷 전체저장' : '📷'; }
  }
}

// 이미지 저장용 정적 카드 (전체 이미지 채우기)
function _crewMemberCardStatic(name, photo, link, col, crewRole) {
  const roleTag = crewRole ? '<div style="font-size:9px;color:#ffffffbb;font-weight:700;margin-bottom:1px">' + crewRole + '</div>' : '';
  const imgInner = photo
    ? '<img src="' + photo + '" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;border-radius:10px 10px 0 0">'
    : '<div style="position:absolute;inset:0;background:linear-gradient(135deg,' + col + ',' + col + '99);display:flex;align-items:center;justify-content:center;font-size:42px;font-weight:900;color:#fff">' + (name||'?')[0] + '</div>';
  const overlay = '<div style="position:absolute;bottom:0;left:0;right:0;background:linear-gradient(transparent,rgba(0,0,0,.72));border-radius:0 0 10px 10px;padding:18px 8px 8px;text-align:center">'
    + roleTag
    + '<div style="font-weight:800;font-size:12px;color:#fff;word-break:break-all;text-shadow:0 1px 3px #000a">' + (name||'') + '</div>'
    + '</div>';
  const linkLabel = link ? '<div style="text-align:center;padding:4px;background:' + col + ';border-radius:0 0 10px 10px"><span style="font-size:10px;font-weight:700;color:#fff">▶ 방송</span></div>' : '';
  return '<div style="border-radius:10px;overflow:hidden;border:1.5px solid ' + col + '33">'
    + '<div style="position:relative;width:100%;aspect-ratio:1/1;border-radius:' + (link?'10px 10px 0 0':'10px') + ';overflow:hidden">' + imgInner + overlay + '</div>'
    + linkLabel + '</div>';
}

/* ── 크루 순서 이동 ── */
function moveCrewCfg(idx, dir) {
  if (!isLoggedIn) return;
  const cfg = typeof crewCfg !== 'undefined' ? crewCfg : [];
  const newIdx = idx + dir;
  if (newIdx < 0 || newIdx >= cfg.length) return;
  const tmp = cfg[idx]; cfg[idx] = cfg[newIdx]; cfg[newIdx] = tmp;
  save();
  const sub = document.getElementById('b2-content'); if (sub) sub.innerHTML = _b2CrewView();
}

/* ── 크루 빠른 이동 ── */
function openQuickCrewMoveModal(name, isSC, idx) {
  if (!isLoggedIn) return;
  const currentCrew = isSC
    ? ((typeof players !== 'undefined' ? players : []).find(p => p.name === name) || {}).crewName || ''
    : ((typeof crew !== 'undefined' ? crew : [])[idx] || {}).crewName || '';
  document.getElementById('crewMoveModalName').value = name;
  document.getElementById('crewMoveModalIsSC').value = isSC ? '1' : '0';
  document.getElementById('crewMoveModalIdx').value = idx;
  document.getElementById('crewMoveModalLabel').textContent = name;
  _refreshCrewSelect('crewMoveCrewSelect', currentCrew);
  om('crewMoveModal');
}

/* ── 크루 전체 종합게임/보라크루 이동 ── */
function openCrewBulkMoveModal(crewName) {
  if (!isLoggedIn) return;
  const cfg = typeof crewCfg !== 'undefined' ? crewCfg : [];
  const sc = (typeof players !== 'undefined' ? players : []).filter(p => p.crewName === crewName);
  const pure = (typeof crew !== 'undefined' ? crew : []).filter(m => m.crewName === crewName);
  const totalCount = sc.length + pure.length;
  if (!totalCount) { alert('이 크루에 소속된 멤버가 없습니다.'); return; }

  const gameTypes = ['starcraft','general','보라크루'];
  const currentType = sc.length > 0 ? (sc[0].gameType || 'starcraft') : 'starcraft';

  const choice = prompt(
    `"${crewName}" 크루 전체(${totalCount}명) gameType 일괄 변경\n\n` +
    `현재: ${currentType}\n\n` +
    `변경할 타입을 입력하세요:\n` +
    `  starcraft — 스타크래프트\n` +
    `  종합게임  — 종합게임\n` +
    `  보라크루  — 보라크루`,
    currentType
  );
  if (choice === null) return;
  const newType = choice.trim();
  if (!['starcraft','종합게임','보라크루'].includes(newType)) {
    alert('올바른 타입을 입력하세요: starcraft / 종합게임 / 보라크루');
    return;
  }
  if (!confirm(`"${crewName}" 크루 ${totalCount}명을 모두 "${newType}"으로 변경할까요?`)) return;

  sc.forEach(p => { p.gameType = newType; });
  // pure(crew 배열) 는 별도 데이터이므로 gameType 미지원이지만 참고로 기록
  save();
  const sub = document.getElementById('b2-content');
  if (sub) sub.innerHTML = _b2CrewView();
  alert(`완료: ${sc.length}명 변경됨`);
}

function saveQuickCrewMove() {
  if (!isLoggedIn) return;
  const name = document.getElementById('crewMoveModalName').value;
  const isSC = document.getElementById('crewMoveModalIsSC').value === '1';
  const idx = parseInt(document.getElementById('crewMoveModalIdx').value);
  const newCrew = document.getElementById('crewMoveCrewSelect').value || '';
  if (isSC) {
    const p = (typeof players !== 'undefined' ? players : []).find(x => x.name === name);
    if (p) { p.crewName = newCrew || undefined; p.isCrew = newCrew ? true : undefined; }
  } else {
    const m = (typeof crew !== 'undefined' ? crew : [])[idx];
    if (m) m.crewName = newCrew || undefined;
  }
  save();
  cm('crewMoveModal');
  const sub = document.getElementById('b2-content'); if (sub) sub.innerHTML = _b2CrewView();
}

/* ── 크루 설정 관리 ── */
function openCrewCfgAddModal() {
  if (!isLoggedIn) return;
  document.getElementById('crewCfgModalTitle').textContent = '+ 크루 추가';
  document.getElementById('crewCfgModalIdx').value = '-1';
  // 현재 뷰에 따라 크루 타입 자동 설정
  const crewType = _b2View === 'game' ? 'general' : '보라크루';
  document.getElementById('crewCfgType').value = crewType;
  document.getElementById('crewCfgName').value = '';
  document.getElementById('crewCfgColor').value = crewType === 'general' ? '#10b981' : '#7c3aed';
  document.getElementById('crewCfgLogo').value = '';
  document.getElementById('crewCfgBgImage').value = '';
  document.getElementById('crewCfgBgAlpha').value = '10';
  document.getElementById('crewCfgLabelAlpha').value = '18';
  document.getElementById('crewCfgCardAlpha').value = '8';
  document.getElementById('crewCfgDesc').value = '';
  const va = document.getElementById('crewCfgLabelAlphaVal'); if (va) va.textContent = '18';
  const vb = document.getElementById('crewCfgBgAlphaVal'); if (vb) vb.textContent = '10';
  const vc = document.getElementById('crewCfgCardAlphaVal'); if (vc) vc.textContent = '8';
  om('crewCfgModal');
}
function openCrewCfgEditModal(crewName) {
  if (!isLoggedIn) return;
  const idx = (typeof crewCfg !== 'undefined' ? crewCfg : []).findIndex(function(c) { return c.name === crewName; });
  if (idx < 0) return;
  const c = crewCfg[idx];
  document.getElementById('crewCfgModalTitle').textContent = '⚙️ 크루 설정 — ' + crewName;
  document.getElementById('crewCfgModalIdx').value = idx;
  document.getElementById('crewCfgName').value = c.name || '';
  document.getElementById('crewCfgColor').value = c.color || '#7c3aed';
  document.getElementById('crewCfgLogo').value = c.logo || '';
  document.getElementById('crewCfgBgImage').value = c.bgImage || '';
  document.getElementById('crewCfgBgAlpha').value = c.bgAlpha != null ? c.bgAlpha : 10;
  document.getElementById('crewCfgLabelAlpha').value = c.labelAlpha != null ? c.labelAlpha : 18;
  document.getElementById('crewCfgCardAlpha').value = c.cardAlpha != null ? c.cardAlpha : 8;
  document.getElementById('crewCfgDesc').value = c.desc || '';
  const va = document.getElementById('crewCfgLabelAlphaVal'); if (va) va.textContent = c.labelAlpha != null ? c.labelAlpha : 18;
  const vb = document.getElementById('crewCfgBgAlphaVal'); if (vb) vb.textContent = c.bgAlpha != null ? c.bgAlpha : 10;
  const vc = document.getElementById('crewCfgCardAlphaVal'); if (vc) vc.textContent = c.cardAlpha != null ? c.cardAlpha : 8;
  om('crewCfgModal');
}
function saveCrewCfgModal() {
  if (!isLoggedIn) return;
  const idx = parseInt(document.getElementById('crewCfgModalIdx').value);
  const name = document.getElementById('crewCfgName').value.trim();
  if (!name) { alert('크루명을 입력하세요.'); return; }
  const entry = {
    id: (idx >= 0 && crewCfg[idx]) ? crewCfg[idx].id : ('crew_' + Date.now().toString(36)),
    name: name,
    type: document.getElementById('crewCfgType').value || '보라크루', // 크루 타입: '보라크루' 또는 'general'
    color: document.getElementById('crewCfgColor').value || '#7c3aed',
    logo: document.getElementById('crewCfgLogo').value.trim(),
    bgImage: document.getElementById('crewCfgBgImage').value.trim(),
    bgAlpha: parseInt(document.getElementById('crewCfgBgAlpha').value) || 10,
    labelAlpha: parseInt(document.getElementById('crewCfgLabelAlpha').value) || 18,
    cardAlpha: parseInt(document.getElementById('crewCfgCardAlpha').value) || 8,
    desc: document.getElementById('crewCfgDesc').value.trim(),
  };
  if (typeof crewCfg === 'undefined') window.crewCfg = [];
  if (idx === -1) crewCfg.push(entry);
  else crewCfg[idx] = entry;
  save(); cm('crewCfgModal');
  const sub = document.getElementById('b2-content'); if (sub) sub.innerHTML = _b2CrewView();
}
function deleteCrewCfg(crewName) {
  if (!isLoggedIn) return;
  if (!confirm('"' + crewName + '" 크루를 삭제할까요?\n크루원들은 미배정 상태가 됩니다.')) return;
  const idx = (typeof crewCfg !== 'undefined' ? crewCfg : []).findIndex(function(c) { return c.name === crewName; });
  if (idx >= 0) crewCfg.splice(idx, 1);
  save();
  const sub = document.getElementById('b2-content'); if (sub) sub.innerHTML = _b2CrewView();
}

/* ── 크루원 관리 ── */
function _refreshCrewSelect(selId, defaultName) {
  const sel = document.getElementById(selId); if (!sel) return;
  sel.innerHTML = '<option value="">— 미배정 —</option>'
    + (typeof crewCfg !== 'undefined' ? crewCfg : []).map(function(c) {
        return '<option value="' + c.name + '"' + (c.name === defaultName ? ' selected' : '') + '>' + c.name + '</option>';
      }).join('');
}
function openCrewAddModal(defaultCrew) {
  if (!isLoggedIn) return;
  document.getElementById('crewModalTitle').textContent = '+ 크루원 추가';
  document.getElementById('crewModalIdx').value = '-1';
  document.getElementById('crewModalName').value = '';
  document.getElementById('crewModalPhoto').value = '';
  document.getElementById('crewModalLink').value = '';
  document.getElementById('crewModalRole').value = '';
  _refreshCrewSelect('crewModalCrewName', defaultCrew || '');
  om('crewModal');
}
function openCrewEditModal(idx) {
  if (!isLoggedIn) return;
  const m = (typeof crew !== 'undefined' ? crew : [])[idx];
  if (!m) return;
  document.getElementById('crewModalTitle').textContent = '✏️ 크루원 수정';
  document.getElementById('crewModalIdx').value = idx;
  document.getElementById('crewModalName').value = m.name || '';
  document.getElementById('crewModalPhoto').value = m.photo || '';
  document.getElementById('crewModalLink').value = m.link || '';
  document.getElementById('crewModalRole').value = m.crewRole || '';
  _refreshCrewSelect('crewModalCrewName', m.crewName || '');
  om('crewModal');
}
function saveCrewModal() {
  if (!isLoggedIn) return;
  const idx = parseInt(document.getElementById('crewModalIdx').value);
  const name = document.getElementById('crewModalName').value.trim();
  if (!name) { alert('이름을 입력하세요.'); return; }
  const photo = document.getElementById('crewModalPhoto').value.trim();
  const link = document.getElementById('crewModalLink').value.trim();
  const crewName = (document.getElementById('crewModalCrewName') || {}).value || '';
  const crewRole = document.getElementById('crewModalRole').value.trim();
  const entry = { name, photo, link, crewName: crewName || undefined, crewRole: crewRole || undefined };
  if (typeof crew === 'undefined') window.crew = [];
  if (idx === -1) crew.push(entry);
  else crew[idx] = entry;
  save(); cm('crewModal');
  const sub = document.getElementById('b2-content'); if (sub) sub.innerHTML = _b2CrewView();
}
function deleteCrew(idx) {
  if (!isLoggedIn) return;
  if (!confirm('크루원을 삭제할까요?')) return;
  if (typeof crew !== 'undefined') crew.splice(idx, 1);
  save();
  const sub = document.getElementById('b2-content'); if (sub) sub.innerHTML = _b2CrewView();
}

/* ════════════════════════════════════════
   🎮 종합게임 현황판 — 크루별 블록 (보라크루 스타일)
════════════════════════════════════════ */

function _b2GameView() {
  // 종합게임 타입 크루만 필터링
  const cfg = (typeof crewCfg !== 'undefined' ? crewCfg : []).filter(c => c.type === 'general');
  const crewArr = typeof crew !== 'undefined' ? crew : [];
  // 종합게임/general 타입 선수만
  const gamePlayers = (players || [])
    .filter(p => !p.hidden && !p.retired && !p.hideFromBoard &&
      p.gameType === 'general');

  function getGameMembersOf(crewName) {
    const sc = gamePlayers.filter(p => p.crewName === crewName);
    const pure = crewArr.filter(m => m.crewName === crewName);
    // 이름으로 중복 제거 (종합게임 선수와 순수 크루 멤버가 같은 사람일 경우)
    const seenNames = new Set(sc.map(p => p.name));
    const uniquePure = pure.filter(m => !seenNames.has(m.name));
    return { sc, pure: uniquePure, total: sc.length + uniquePure.length };
  }

  const knownNames = cfg.map(c => c.name);
  const soloPure = crewArr.filter(m => !m.crewName || !knownNames.includes(m.crewName));
  const unassignedGame = gamePlayers.filter(p => p.crewName && !knownNames.includes(p.crewName));
  const noCrewGame = gamePlayers.filter(p => !p.crewName);
  // 중복 제거된 전체 멤버 수 계산
  const totalAll = cfg.reduce((s, c) => s + getGameMembersOf(c.name).total, 0) + soloPure.length + unassignedGame.length + noCrewGame.length;

  const isListMode = window._b2GameListMode === 'list';
  const cardSize = window._b2GameCardSize || 'm';
  const minW = cardSize === 's' ? 88 : cardSize === 'l' ? 150 : 110;

  const cardSizeBtns = `
    <div style="display:flex;gap:2px;background:var(--surface);border:1px solid var(--border2);border-radius:8px;padding:2px">
      <button class="btn btn-xs" style="${cardSize==='s'?'background:#10b981;color:#fff;border-color:#10b981':'background:none;border:none;color:var(--gray-l)'}" onclick="window._b2GameCardSize='s';document.getElementById('b2-content').innerHTML=_b2GameView()" title="소">S</button>
      <button class="btn btn-xs" style="${cardSize==='m'?'background:#10b981;color:#fff;border-color:#10b981':'background:none;border:none;color:var(--gray-l)'}" onclick="window._b2GameCardSize='m';document.getElementById('b2-content').innerHTML=_b2GameView()" title="중">M</button>
      <button class="btn btn-xs" style="${cardSize==='l'?'background:#10b981;color:#fff;border-color:#10b981':'background:none;border:none;color:var(--gray-l)'}" onclick="window._b2GameCardSize='l';document.getElementById('b2-content').innerHTML=_b2GameView()" title="대">L</button>
    </div>`;

  let h = '<div style="padding:16px 0">';
  h += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:20px;flex-wrap:wrap">';
  h += '<span style="font-size:18px;font-weight:900;color:#10b981">🎮 종합게임</span>';
  h += '<span style="font-size:12px;color:var(--gray-l)">' + totalAll + '명</span>';
  h += '<div style="display:flex;gap:2px;background:var(--surface);border:1px solid var(--border2);border-radius:8px;padding:2px">';
  h += '<button class="btn btn-xs" style="' + (!isListMode ? 'background:#10b981;color:#fff;border-color:#10b981' : 'background:none;border:none;color:var(--gray-l)') + '" onclick="window._b2GameListMode=\'grid\';document.getElementById(\'b2-content\').innerHTML=_b2GameView()">크루별</button>';
  h += '<button class="btn btn-xs" style="' + (isListMode ? 'background:#10b981;color:#fff;border-color:#10b981' : 'background:none;border:none;color:var(--gray-l)') + '" onclick="window._b2GameListMode=\'list\';document.getElementById(\'b2-content\').innerHTML=_b2GameView()">전체목록</button>';
  h += '</div>';
  h += cardSizeBtns;
  h += '<div style="margin-left:auto;display:flex;gap:6px;flex-wrap:wrap">';
  // 솔로 토글
  if (soloPure.length) {
    h += '<button class="btn btn-xs" style="' + (_b2ShowSolo ? 'background:#10b981;color:#fff;border-color:#10b981' : 'border-color:#10b981;color:#10b981') + '" onclick="_b2ShowSolo=!_b2ShowSolo;document.getElementById(\'b2-content\').innerHTML=_b2GameView()">🎙️ 솔로 ' + soloPure.length + '명</button>';
  }
  h += '<button class="btn btn-xs no-export" style="border-color:#10b981;color:#10b981" onclick="saveGameImg(this)">📷 전체저장</button>';
  if (isLoggedIn) {
    h += '<button class="btn btn-xs no-export" style="background:#10b981;color:#fff;border-color:#10b981" onclick="openCrewCfgAddModal()">+ 크루 추가</button>';
    h += '<button class="btn btn-xs no-export" style="background:#059669;color:#fff;border-color:#059669" onclick="openCrewAddModal()">+ 크루원 추가</button>';
  }
  h += '</div></div>';

  if (!gamePlayers.length && !crewArr.length) {
    h += '<div style="text-align:center;padding:60px 20px;color:var(--gray-l);background:var(--surface);border-radius:12px;border:2px dashed #10b98140">';
    h += '<div style="font-size:40px;margin-bottom:12px">🎮</div>';
    h += '<div style="font-weight:700;margin-bottom:6px">등록된 종합게임 스트리머가 없습니다</div>';
    if (isLoggedIn) h += '<div style="font-size:12px">스트리머 등록 시 gameType을 general로 설정하세요</div>';
    h += '</div></div>';
    return h;
  }

  // ── 전체목록 뷰 ──
  if (isListMode) {
    h += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(' + minW + 'px,1fr));gap:10px">';
    // gamePlayers(players 배열) 표시
    gamePlayers.forEach(function(p) {
      const col = p.crewName ? _gcCrew(p.crewName) : '#10b981';
      h += _crewMemberCard(p.name, p.photo, p.channelUrl, true, -1, col, p.crewName, p.crewRole||'');
    });
    // crewArr(순수 크루 멤버) 표시 - 중복 제거
    const gamePlayerNames = new Set(gamePlayers.map(p => p.name));
    crewArr.forEach(function(m, mi) {
      if (!gamePlayerNames.has(m.name)) {
        const col = m.crewName ? _gcCrew(m.crewName) : '#10b981';
        h += _crewMemberCard(m.name, m.photo, m.link, false, mi, col, m.crewName, m.role||'');
      }
    });
    h += '</div>';
    // 솔로 섹션 표시
    if (_b2ShowSolo && soloPure.length) h += _b2SoloSection(soloPure);
    h += '</div>';
    return h;
  }

  // ── 크루별 그리드 뷰 ──
  cfg.forEach(function(c, ci) {
    const members = getGameMembersOf(c.name);
    if (!members.total) return; // 이 크루에 종합게임 멤버 없으면 건너뜀
    const col = c.color || '#10b981';
    const bgAlpha = Math.round(((c.bgAlpha != null ? c.bgAlpha : 10) / 100) * 255).toString(16).padStart(2, '0');
    const labelAlpha = Math.round(((c.labelAlpha != null ? c.labelAlpha : 18) / 100) * 255).toString(16).padStart(2, '0');
    const bgStyle = c.bgImage
      ? 'background:url(' + JSON.stringify(c.bgImage) + ') center/cover no-repeat;'
      : 'background:' + col + labelAlpha + ';';
    const overlay = c.bgImage
      ? '<div style="position:absolute;inset:0;background:linear-gradient(135deg,' + col + bgAlpha + ' 0%,' + col + ' 100%);border-radius:12px 12px 0 0;pointer-events:none;z-index:1"></div>'
      : '';
    const safeName = c.name.replace(/\\/g,'\\\\').replace(/'/g,"\\'");
    const isCollapsed = _b2CrewCollapsed.has('game_' + c.name);

    h += '<div style="margin-bottom:18px;border-radius:12px;overflow:hidden;border:1.5px solid ' + col + '40;box-shadow:0 2px 12px ' + col + '22">';
    h += '<div style="position:relative;padding:14px 18px;' + bgStyle + 'min-height:56px;display:flex;align-items:center;gap:12px">';
    h += overlay;
    h += '<div style="position:relative;flex-shrink:0">';
    if (c.logo) {
      h += '<img src="' + c.logo + '" style="width:42px;height:42px;border-radius:50%;object-fit:cover;border:2px solid #fff8" onerror="this.style.display=\'none\'">';
    } else {
      h += '<div style="width:42px;height:42px;border-radius:50%;background:#fff3;display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:900;color:#fff;border:2px solid #fff5">' + (c.name||'?')[0] + '</div>';
    }
    h += '</div>';
    h += '<div style="position:relative;flex:1;min-width:0">';
    h += '<div style="font-size:16px;font-weight:900;color:#fff;text-shadow:0 1px 4px #0006">' + c.name + '</div>';
    h += '<div style="font-size:11px;color:#ffffffcc">' + members.total + '명' + (c.desc ? ' · ' + c.desc : '') + '</div>';
    h += '</div>';
    h += '<div class="no-export" style="position:relative;display:flex;gap:4px;align-items:center">';
    h += '<button class="btn btn-xs" style="background:#ffffff22;color:#fff;border-color:#ffffff44;font-size:11px;padding:2px 6px" onclick="event.stopPropagation();_b2CrewCollapsed[' + (isCollapsed ? 'delete' : 'add') + '](' + "'game_" + safeName + "'" + ');document.getElementById(\'b2-content\').innerHTML=_b2GameView()" title="' + (isCollapsed ? '펼치기' : '접기') + '">' + (isCollapsed ? '▶' : '▼') + '</button>';
    h += '</div>';
    h += '</div>';

    if (!isCollapsed) {
      const cardBgAlpha = Math.round(((c.cardAlpha != null ? c.cardAlpha : 8) / 100) * 255).toString(16).padStart(2, '0');
      h += '<div style="background:' + col + cardBgAlpha + ';padding:14px">';
      h += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(' + minW + 'px,1fr));gap:10px">';
      members.sc.forEach(function(p) { h += _crewMemberCard(p.name, p.photo, p.channelUrl, true, -1, col, p.crewName, p.crewRole||''); });
      members.pure.forEach(function(m) {
        const realIdx = crewArr.findIndex(function(x) { return x === m; });
        h += _crewMemberCard(m.name, m.photo, m.link, false, realIdx, col, m.crewName, m.crewRole||'');
      });
      h += '</div></div>';
    }
    h += '</div>';
  });

  // 크루 없는 종합게임 선수 (솔로 토글과 연결)
  if (_b2ShowSolo && (noCrewGame.length || unassignedGame.length)) {
    const soloList = [...noCrewGame, ...unassignedGame];
    h += '<div style="margin-bottom:18px;border-radius:12px;overflow:hidden;border:1.5px solid #10b98140">';
    h += '<div style="padding:12px 16px;background:linear-gradient(135deg,#10b98120,#05966915);display:flex;align-items:center;gap:8px;border-bottom:1px solid #10b98120">';
    h += '<span style="font-size:14px;font-weight:900;color:#10b981">🎮 미배정</span>';
    h += '<span style="font-size:11px;color:var(--gray-l)">크루 미소속 ' + soloList.length + '명</span>';
    h += '</div>';
    h += '<div style="padding:14px;background:var(--white)">';
    h += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(' + minW + 'px,1fr));gap:10px">';
    soloList.forEach(function(p) { h += _crewMemberCard(p.name, p.photo, p.channelUrl, true, -1, '#10b981', '', p.crewRole||''); });
    h += '</div></div></div>';
  }

  h += '</div>';
  return h;
}

async function saveGameImg(btn) {
  if (btn) { btn.disabled = true; btn.textContent = '저장 중...'; }
  const PAD = 24;
  const CARD_W = 720;
  const tmpDiv = document.createElement('div');
  tmpDiv.style.cssText = `position:fixed;left:-9999px;top:0;padding:${PAD}px;background:#f0f2f5;box-sizing:border-box;width:${CARD_W + PAD * 2}px`;
  tmpDiv.innerHTML = _b2GameView();
  // no-export 요소 숨기기
  tmpDiv.querySelectorAll('.no-export').forEach(el => { el.style.display = 'none'; });
  document.body.appendChild(tmpDiv);
  await new Promise(r => setTimeout(r, 100));
  injectUnivIcons(tmpDiv);
  const h = tmpDiv.scrollHeight + 32;
  const w = tmpDiv.scrollWidth;
  const fname = '종합게임_' + new Date().toISOString().slice(0,10) + '.png';
  try {
    if (typeof _captureAndSave !== 'function') throw new Error('이미지 저장 함수를 찾을 수 없습니다.');
    await _captureAndSave(tmpDiv, w, h, fname);
  } catch(e) { alert('저장 실패: ' + e.message); }
  finally {
    document.body.removeChild(tmpDiv);
    if (btn) { btn.disabled = false; btn.textContent = '📷 전체저장'; }
  }
}

/* ════════════════════════════════════════
   👤 프로필 뷰 — 좌측 메인 디스플레이 + 우측 그리드
════════════════════════════════════════ */

let _b2PlayersFilter = 'all';
let _b2PlayersUnivFilter = '전체';
let _b2SelectedPlayer = null;

function _b2PlayersView() {
  const visPlayers = players.filter(p => !p.hidden && !p.retired);
  
  // 대학 필터링
  const univFilteredPlayers = _b2PlayersUnivFilter === '전체' 
    ? visPlayers 
    : visPlayers.filter(p => p.univ === _b2PlayersUnivFilter);
  
  // 종족 필터링
  const filteredPlayers = _b2PlayersFilter === 'all' 
    ? univFilteredPlayers 
    : univFilteredPlayers.filter(p => p.race === _b2PlayersFilter);

  if (!filteredPlayers.length) {
    return `<div style="text-align:center;padding:60px 20px;color:var(--gray-l)">
      <div style="font-size:48px;margin-bottom:12px">👤</div>
      <div style="font-weight:700">표시할 선수가 없습니다</div>
    </div>`;
  }

  // 기본 선택 선수
  if (!_b2SelectedPlayer || !filteredPlayers.find(p => p.name === _b2SelectedPlayer.name)) {
    _b2SelectedPlayer = filteredPlayers[0];
  }

  // 대학 목록 (필터용)
  const univList = [...new Set(visPlayers.map(p => p.univ).filter(u => u && u !== '무소속'))].sort();
  
  // 정렬: 직급 우선, 티어 순서 (0,1,2,3,4,유스 마지막)
  const roleOrder = ['이사장', '동아리 회장', '총장', '부총장', '교수', '코치', '선장', '동아리장', '반장', '총괄'];
  const tierOrder = ['0', '1', '2', '3', '4', '유스'];
  
  filteredPlayers.sort((a, b) => {
    // 직급 우선
    const aRoleIdx = roleOrder.indexOf(a.role || '');
    const bRoleIdx = roleOrder.indexOf(b.role || '');
    const aHasRole = aRoleIdx >= 0;
    const bHasRole = bRoleIdx >= 0;
    
    if (aHasRole && !bHasRole) return -1;
    if (!aHasRole && bHasRole) return 1;
    if (aHasRole && bHasRole && aRoleIdx !== bRoleIdx) return aRoleIdx - bRoleIdx;
    
    // 티어 순서
    const aTier = a.tier || '?';
    const bTier = b.tier || '?';
    const aTierIdx = tierOrder.indexOf(aTier);
    const bTierIdx = tierOrder.indexOf(bTier);
    
    if (aTierIdx >= 0 && bTierIdx >= 0 && aTierIdx !== bTierIdx) return aTierIdx - bTierIdx;
    if (aTierIdx >= 0 && bTierIdx < 0) return -1;
    if (aTierIdx < 0 && bTierIdx >= 0) return 1;
    
    // 이름 순 (동률 시)
    return (a.name || '').localeCompare(b.name || '');
  });

  const themeColors = {
    'P': { glow: 'rgba(241, 196, 15, 0.3)', bg: 'rgba(241, 196, 15, 0.1)', border: '#f1c40f' },
    'T': { glow: 'rgba(52, 152, 219, 0.3)', bg: 'rgba(52, 152, 219, 0.1)', border: '#3498db' },
    'Z': { glow: 'rgba(231, 76, 60, 0.3)', bg: 'rgba(231, 76, 60, 0.1)', border: '#e74c3c' },
    'N': { glow: 'rgba(149, 165, 166, 0.3)', bg: 'rgba(149, 165, 166, 0.1)', border: '#95a5a6' }
  };
  const theme = themeColors[_b2SelectedPlayer.race] || themeColors['N'];

  let h = `
    <style>
      .b2-players-wrapper {
        display: flex;
        gap: 24px;
        height: calc(100vh - 180px);
        min-height: 500px;
      }
      .b2-players-main {
        flex: 0 0 40%;
        position: relative;
      }
      .b2-players-main-content {
        width: 100%;
        height: 100%;
        background: ${theme.bg};
        backdrop-filter: blur(25px);
        border: 1px solid rgba(255,255,255,0.2);
        border-radius: 24px;
        overflow: hidden;
        box-shadow: 0 20px 50px rgba(0,0,0,0.3), 0 0 30px ${theme.glow};
        transition: all 0.5s ease;
      }
      .b2-players-main-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: center top;
        transition: opacity 0.3s ease;
      }
      .b2-players-info {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        padding: 30px;
        background: linear-gradient(to top, rgba(0,0,0,0.9), transparent);
        z-index: 2;
      }
      .b2-players-name {
        font-size: 36px;
        font-weight: 800;
        margin-bottom: 8px;
        color: #fff;
      }
      .b2-players-details {
        font-size: 14px;
        color: rgba(255,255,255,0.8);
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        align-items: center;
      }
      .b2-players-tier {
        background: ${theme.border};
        color: #fff;
        padding: 4px 12px;
        border-radius: 12px;
        font-weight: 700;
        font-size: 13px;
      }
      .b2-players-race {
        font-size: 16px;
        font-weight: 800;
      }
      .b2-players-grid-wrapper {
        flex: 1;
        background: rgba(255,255,255,0.05);
        backdrop-filter: blur(15px);
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 24px;
        padding: 20px;
        overflow-y: auto;
      }
      .b2-players-grid-wrapper::-webkit-scrollbar {
        width: 6px;
      }
      .b2-players-grid-wrapper::-webkit-scrollbar-thumb {
        background: rgba(255,255,255,0.2);
        border-radius: 10px;
      }
      .b2-players-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
        gap: 12px;
      }
      .b2-players-card {
        cursor: pointer;
        transition: all 0.3s cubic-bezier(0.165, 0.84, 0.44, 1);
        position: relative;
      }
      .b2-players-card:hover {
        transform: translateY(-8px);
      }
      .b2-players-card.active {
        transform: translateY(-4px);
      }
      .b2-players-thumbnail {
        width: 100%;
        aspect-ratio: 1;
        object-fit: contain;
        object-position: center;
        border-radius: 16px;
        border: 2px solid transparent;
        background: rgba(255,255,255,0.1);
        transition: all 0.3s ease;
      }
      .b2-players-card.active .b2-players-thumbnail {
        border-color: ${theme.border};
        box-shadow: 0 8px 25px ${theme.glow};
      }
      .b2-players-label {
        margin-top: 6px;
        font-size: 12px;
        color: var(--text3);
        font-weight: 600;
        text-align: center;
      }
      .b2-players-card.active .b2-players-label {
        color: var(--text1);
        font-weight: 700;
      }
      .b2-players-filter-btn {
        background: rgba(255,255,255,0.1);
        border: 1px solid rgba(255,255,255,0.2);
        color: var(--text3);
        padding: 6px 16px;
        border-radius: 20px;
        cursor: pointer;
        font-size: 13px;
        font-weight: 600;
        transition: all 0.3s ease;
      }
      .b2-players-filter-btn:hover {
        background: rgba(255,255,255,0.2);
        color: var(--text1);
      }
      .b2-players-filter-btn.active {
        background: ${theme.border};
        border-color: ${theme.border};
        color: #fff;
        box-shadow: 0 4px 15px ${theme.glow};
      }
      .b2-players-filter-btn[data-race="all"].active {
        background: var(--blue);
        border-color: var(--blue);
        box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4);
      }
      @media (max-width: 768px) {
        .b2-players-wrapper {
          flex-direction: column;
          height: auto;
        }
        .b2-players-main {
          flex: none;
          height: 400px;
        }
        .b2-players-grid-wrapper {
          height: auto;
          min-height: 400px;
        }
      }
    </style>
  `;

  // 필터 바
  h += `
    <div style="display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap;align-items:center">
      <div style="position:relative">
        <select id="b2-players-univ-sel" onchange="_b2PlayersUnivFilter=this.value;document.getElementById('b2-content').innerHTML=_b2PlayersView()" style="padding:6px 28px 6px 12px;border-radius:20px;border:1px solid var(--border2);font-size:13px;background:var(--white);color:var(--text2);appearance:none;cursor:pointer">
          <option value="전체" ${_b2PlayersUnivFilter === '전체' ? 'selected' : ''}>🏫 전체 대학</option>
          ${univList.map(u => `<option value="${u}" ${_b2PlayersUnivFilter === u ? 'selected' : ''}>${u}</option>`).join('')}
        </select>
        <svg style="position:absolute;right:8px;top:50%;transform:translateY(-50%);pointer-events:none;color:var(--gray-l)" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m6 9 6 6 6-6"/></svg>
      </div>
      <div style="width:1px;height:24px;background:var(--border2);display:inline-block"></div>
      <button class="b2-players-filter-btn ${_b2PlayersFilter === 'all' ? 'active' : ''}" data-race="all" onclick="_b2PlayersFilter='all';document.getElementById('b2-content').innerHTML=_b2PlayersView()">ALL</button>
      <button class="b2-players-filter-btn ${_b2PlayersFilter === 'P' ? 'active' : ''}" data-race="P" onclick="_b2PlayersFilter='P';document.getElementById('b2-content').innerHTML=_b2PlayersView()">PROTOSS</button>
      <button class="b2-players-filter-btn ${_b2PlayersFilter === 'T' ? 'active' : ''}" data-race="T" onclick="_b2PlayersFilter='T';document.getElementById('b2-content').innerHTML=_b2PlayersView()">TERRAN</button>
      <button class="b2-players-filter-btn ${_b2PlayersFilter === 'Z' ? 'active' : ''}" data-race="Z" onclick="_b2PlayersFilter='Z';document.getElementById('b2-content').innerHTML=_b2PlayersView()">ZERG</button>
    </div>
  `;

  // 메인 래퍼
  h += `<div class="b2-players-wrapper">`;
  
  // 좌측 메인 디스플레이
  h += `
    <div class="b2-players-main">
      <div class="b2-players-main-content" id="b2-players-main-box">
        ${_b2SelectedPlayer.photo 
          ? `<img src="${_b2SelectedPlayer.photo}" class="b2-players-main-image" alt="${_b2SelectedPlayer.name}">`
          : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,0.05);font-size:64px;font-weight:900;color:rgba(255,255,255,0.2)">${(_b2SelectedPlayer.name||'?')[0]}</div>`
        }
        <div class="b2-players-info">
          <div class="b2-players-name">${_b2SelectedPlayer.name || '이름 없음'}</div>
          <div class="b2-players-details">
            <span class="b2-players-tier">${_b2SelectedPlayer.tier || '?'}티어</span>
            <span class="b2-players-race">${_b2SelectedPlayer.race === 'P' ? '프로토스' : _b2SelectedPlayer.race === 'T' ? '테란' : _b2SelectedPlayer.race === 'Z' ? '저그' : '종족미정'}</span>
            ${_b2SelectedPlayer.univ ? `<span>🏫 ${_b2SelectedPlayer.univ}</span>` : ''}
            ${_b2SelectedPlayer.role ? `<span>👔 ${_b2SelectedPlayer.role}</span>` : ''}
          </div>
        </div>
      </div>
    </div>
  `;

  // 우측 그리드
  h += `
    <div class="b2-players-grid-wrapper">
      <div class="b2-players-grid">
  `;

  filteredPlayers.forEach(p => {
    const isActive = _b2SelectedPlayer && _b2SelectedPlayer.name === p.name;
    const raceTheme = themeColors[p.race] || themeColors['N'];
    
    h += `
      <div class="b2-players-card ${isActive ? 'active' : ''}" onclick="_b2UpdateMainDisplay('${p.name}')">
        ${p.photo 
          ? `<img src="${p.photo}" class="b2-players-thumbnail" alt="${p.name}" onerror="this.style.display='none'">`
          : `<div class="b2-players-thumbnail" style="display:flex;align-items:center;justify-content:center;background:${raceTheme.bg};font-size:32px;font-weight:900;color:${raceTheme.border}">${(p.name||'?')[0]}</div>`
        }
        <div class="b2-players-label">${p.name || '이름 없음'}</div>
      </div>
    `;
  });

  h += `
      </div>
    </div>
  `;

  h += `</div>`;

  return h;
}

function _b2UpdateMainDisplay(playerName) {
  const player = players.find(p => p.name === playerName);
  if (!player) return;
  
  _b2SelectedPlayer = player;
  
  const themeColors = {
    'P': { glow: 'rgba(241, 196, 15, 0.3)', bg: 'rgba(241, 196, 15, 0.1)', border: '#f1c40f' },
    'T': { glow: 'rgba(52, 152, 219, 0.3)', bg: 'rgba(52, 152, 219, 0.1)', border: '#3498db' },
    'Z': { glow: 'rgba(231, 76, 60, 0.3)', bg: 'rgba(231, 76, 60, 0.1)', border: '#e74c3c' },
    'N': { glow: 'rgba(149, 165, 166, 0.3)', bg: 'rgba(149, 165, 166, 0.1)', border: '#95a5a6' }
  };
  const theme = themeColors[player.race] || themeColors['N'];
  
  // 메인 디스플레이 업데이트
  const mainBox = document.getElementById('b2-players-main-box');
  if (mainBox) {
    mainBox.style.setProperty('--theme-glow', theme.glow);
    mainBox.style.setProperty('--theme-bg', theme.bg);
    
    // 기존 타이머 정리
    if (mainBox._videoTimeout) {
      clearTimeout(mainBox._videoTimeout);
      mainBox._videoTimeout = null;
    }
    
    const hasSecondProfile = player.videoFile && player.videoFile.length > 0;
    const ext = hasSecondProfile ? player.videoFile.toLowerCase().split('.').pop() : '';
    const isGif = ext === 'gif';
    const isVideo = ['mp4', 'webm', 'mov', 'avi', 'mkv'].includes(ext);
    const isImage = ['jpg', 'jpeg', 'png', 'webp', 'bmp'].includes(ext);
    
    mainBox.innerHTML = `
      <div style="position:relative;width:100%;height:100%;background:rgba(0,0,0,0.1)">
        ${player.photo 
          ? `<img src="${player.photo}" class="b2-players-main-image" alt="${player.name}" style="opacity:1;transition:opacity 0.5s ease;object-fit:contain;object-position:center">`
          : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,0.05);font-size:64px;font-weight:900;color:rgba(255,255,255,0.2)">${(player.name||'?')[0]}</div>`
        }
        ${hasSecondProfile ? (isGif || isImage
          ? `<img src="${player.videoFile}" class="b2-players-second" style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:contain;object-position:center;opacity:0;transition:opacity 0.5s ease">`
          : `<video class="b2-players-video" style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:contain;object-position:center;opacity:0;transition:opacity 0.5s ease" autoplay loop muted playsinline></video>`
        ) : ''}
        <div class="b2-players-info">
          <div class="b2-players-name">${player.name || '이름 없음'}</div>
          <div class="b2-players-details">
            <span class="b2-players-tier" style="background:${theme.border}">${player.tier || '?'}티어</span>
            <span class="b2-players-race">${player.race === 'P' ? '프로토스' : player.race === 'T' ? '테란' : player.race === 'Z' ? '저그' : '종족미정'}</span>
            ${player.univ ? `<span>🏫 ${player.univ}</span>` : ''}
            ${player.role ? `<span>👔 ${player.role}</span>` : ''}
          </div>
        </div>
      </div>
    `;
    
    // 1초 후 두번째 프로필 표시
    if (hasSecondProfile) {
      mainBox._videoTimeout = setTimeout(() => {
        const mainImage = mainBox.querySelector('.b2-players-main-image');
        if (mainImage) mainImage.style.opacity = '0';
        
        if (isGif || isImage) {
          const secondImg = mainBox.querySelector('.b2-players-second');
          if (secondImg) secondImg.style.opacity = '1';
        } else if (isVideo) {
          const video = mainBox.querySelector('.b2-players-video');
          if (video) {
            video.src = player.videoFile;
            video.load();
            video.play().then(() => {
              video.style.opacity = '1';
            }).catch(err => {
              console.log('Video autoplay failed:', err);
            });
          }
        }
      }, 1000);
    }
  }
  
  // 활성 카드 스타일 업데이트
  document.querySelectorAll('.b2-players-card').forEach(card => {
    card.classList.remove('active');
    const cardName = card.querySelector('.b2-players-label')?.textContent;
    if (cardName === playerName) {
      card.classList.add('active');
      const thumbnail = card.querySelector('.b2-players-thumbnail');
      if (thumbnail) {
        thumbnail.style.borderColor = theme.border;
        thumbnail.style.boxShadow = `0 8px 25px ${theme.glow}`;
      }
    } else {
      const thumbnail = card.querySelector('.b2-players-thumbnail');
      if (thumbnail) {
        thumbnail.style.borderColor = 'transparent';
        thumbnail.style.boxShadow = 'none';
      }
    }
  });
}
