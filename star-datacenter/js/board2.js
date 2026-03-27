/* ══════════════════════════════════════
   현황판 — 대학별 컬러블록 로스터 보드
   (구현황판 통합 포함)
══════════════════════════════════════ */

let _b2View = 'univ';
let _b2SaveUniv = '전체';
let _b2Collapsed = new Set();

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
  const oldBtn = isLoggedIn
    ? `<button onclick="_b2View='old';render()" style="padding:5px 16px;border-radius:20px;border:2px solid ${_b2View==='old'?'var(--blue)':'var(--border2)'};background:${_b2View==='old'?'var(--blue)':'var(--white)'};color:${_b2View==='old'?'#fff':'var(--text3)'};font-weight:700;font-size:12px;cursor:pointer">📊 구현황판</button>`
    : '';

  const univList = _b2VisUnivs().filter(u => u.name !== '무소속');
  const allCollapsed = _b2View==='univ' && univList.length > 0 && univList.every(u=>_b2Collapsed.has(u.name));
  const saveBar = _b2View === 'univ' ? `
    <div style="display:flex;align-items:center;gap:6px;margin-left:auto;flex-shrink:0">
      <div style="position:relative">
        <select id="b2-save-sel" onchange="_b2SaveUniv=this.value" style="padding:4px 28px 4px 10px;border-radius:8px;border:1px solid var(--border2);font-size:12px;background:var(--white);color:var(--text2);appearance:none;cursor:pointer">
          <option value="전체">🏫 전체</option>
          ${univList.map(u=>`<option value="${u.name}"${_b2SaveUniv===u.name?' selected':''}>${u.name}</option>`).join('')}
        </select>
        <svg style="position:absolute;right:6px;top:50%;transform:translateY(-50%);pointer-events:none;color:var(--gray-l)" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m6 9 6 6 6-6"/></svg>
      </div>
      <button onclick="saveB2Img()" style="padding:4px 12px;border-radius:8px;border:1px solid var(--border2);background:var(--white);color:var(--text2);font-size:12px;font-weight:700;cursor:pointer;display:flex;align-items:center;gap:4px">📷 이미지저장</button>
    </div>`
  : _b2View === 'free' ? `
    <div style="margin-left:auto;flex-shrink:0">
      <button onclick="saveB2FreeImg()" style="padding:4px 12px;border-radius:8px;border:1px solid var(--border2);background:var(--white);color:var(--text2);font-size:12px;font-weight:700;cursor:pointer;display:flex;align-items:center;gap:4px">📷 이미지저장</button>
    </div>` : '';

  const extraBtns = _b2View === 'univ' ? `
    <button onclick="boardGridCols=boardGridCols===2?1:2;render()" style="padding:5px 12px;border-radius:20px;border:2px solid ${boardGridCols===2?'var(--blue)':'var(--border2)'};background:${boardGridCols===2?'var(--blue)':'var(--white)'};color:${boardGridCols===2?'#fff':'var(--text3)'};font-weight:700;font-size:12px;cursor:pointer" title="1열/2열 전환">${boardGridCols===2?'▦ 1열':'⊞ 2열'}</button>
    <button onclick="${allCollapsed?'_b2ExpandAll()':'_b2CollapseAll()'}" style="padding:5px 12px;border-radius:20px;border:2px solid var(--border2);background:var(--white);color:var(--text3);font-weight:700;font-size:12px;cursor:pointer" title="${allCollapsed?'모두 펼치기':'모두 접기'}">${allCollapsed?'⊕ 펼치기':'⊖ 접기'}</button>
    ${isLoggedIn?`<div style="display:flex;align-items:center;gap:5px;padding:4px 10px;border-radius:12px;border:1px solid var(--border2);background:var(--white)">
      <span style="font-size:10px;color:var(--gray-l);font-weight:700;white-space:nowrap">배경</span>
      <input type="range" min="0" max="40" value="${b2BgAlpha}" style="width:52px;height:4px;cursor:pointer" title="배경 진하기" oninput="b2BgAlpha=+this.value;localStorage.setItem('su_b2ba',b2BgAlpha);const s=document.getElementById('b2-content');if(s){s.innerHTML=_b2UnivView();injectUnivIcons(s);}">
      <span style="font-size:10px;color:var(--gray-l);font-weight:700;white-space:nowrap">라벨</span>
      <input type="range" min="0" max="50" value="${b2LabelAlpha}" style="width:52px;height:4px;cursor:pointer" title="라벨 진하기" oninput="b2LabelAlpha=+this.value;localStorage.setItem('su_b2la',b2LabelAlpha);const s=document.getElementById('b2-content');if(s){s.innerHTML=_b2UnivView();injectUnivIcons(s);}">
    </div>`:''}` : '';
  const filterBar = `
    <div id="b2-nav" style="display:flex;align-items:center;gap:8px;margin-bottom:16px;flex-wrap:wrap">
      <button onclick="_b2View='univ';render()" style="padding:5px 16px;border-radius:20px;border:2px solid ${_b2View==='univ'?'var(--blue)':'var(--border2)'};background:${_b2View==='univ'?'var(--blue)':'var(--white)'};color:${_b2View==='univ'?'#fff':'var(--text3)'};font-weight:700;font-size:12px;cursor:pointer">🏟️ 대학별</button>
      <button onclick="_b2View='free';render()" style="padding:5px 16px;border-radius:20px;border:2px solid ${_b2View==='free'?'var(--blue)':'var(--border2)'};background:${_b2View==='free'?'var(--blue)':'var(--white)'};color:${_b2View==='free'?'#fff':'var(--text3)'};font-weight:700;font-size:12px;cursor:pointer">🚶 무소속</button>
      ${oldBtn}
      ${extraBtns}
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
  } else if (_b2View === 'old') {
    if (typeof rBoard === 'function') rBoard(sub, T);
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
    const members = players.filter(p => p.univ === u.name && !p.hidden && !p.retired && !p.hideFromBoard);
    h += _b2UnivBlock(u.name, gc(u.name), members);
  });
  h += `</div>`;
  return h;
}

function _b2UnivBlock(univName, col, members, forExport=false) {
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

  // 사이드 패널 — 절대 위치로 오른쪽에 오버레이 (가로 구분선이 padding-right 덕에 전체 폭으로 이어짐)
  const sidePanelHtml = hasSide ? `<div style="position:absolute;top:0;right:0;width:190px;bottom:0;background:${lightCol};padding:8px;box-sizing:border-box;overflow:hidden">
    ${_simgs.map((src,i)=>`<img src="${src}" style="width:100%;border-radius:7px;${(i<_simgs.length-1||_smemo)?'margin-bottom:5px;':''}display:block;object-fit:contain" onerror="this.style.display='none'">`).join('')}
    ${_smemo?`<div style="font-size:11px;color:#333;white-space:pre-wrap;line-height:1.5;margin-top:${_simgs.length?'5px':'0'}">${_smemo}</div>`:''}
  </div>` : '';
  // 하단 메모/이미지 (bMemo/bMemoImgs)
  const _bnote = uCfg.bMemo || '';
  const _bimgs = (uCfg.bMemoImgs||[]).concat(uCfg.bMemoImg?[uCfg.bMemoImg]:[]);
  const _bimgHtmls = _bimgs.map(src=>`<img class="b2-bottom-img" src="${src}" style="border-radius:8px;display:inline-block" onerror="this.style.display='none'">`).join('');
  const bottomSection = (_bnote||_bimgs.length) ? `<div style="padding:6px 14px 10px;background:${col}15;border-top:1px solid ${col}22">
    ${_bimgHtmls?`<div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:${_bnote?'6px':'0'}">${_bimgHtmls}</div>`:''}
    ${_bnote?`<div style="font-size:12px;color:#333;white-space:pre-wrap;line-height:1.6">${_bnote}</div>`:''}
  </div>` : '';

  const _bgPos = uCfg.bgImgPos || 'center center';
  const _bgSize = uCfg.bgImgSize || 'cover';
  const _bgOpacity = ((uCfg.bgImgAlpha ?? b2BgImgAlpha) / 100).toFixed(2);
  const bgImgHtml = uCfg.bgImg
    ? forExport
      ? `<img src="${uCfg.bgImg}" crossorigin="anonymous" style="position:absolute;inset:0;width:100%;height:100%;object-fit:${_bgSize};opacity:${_bgOpacity};pointer-events:none;z-index:0">`
      : `<div style="position:absolute;inset:0;background:url('${uCfg.bgImg}') ${_bgPos}/${_bgSize} no-repeat;opacity:${_bgOpacity};pointer-events:none;z-index:0"></div>`
    : '';

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
          <button onclick="event.stopPropagation();_b2ToggleCard(this,'${univName.replace(/'/g,"\\'")}')" style="background:${textCol}22;border:1px solid ${textCol}33;color:${textCol};font-size:11px;cursor:pointer;padding:1px 7px;border-radius:8px;flex-shrink:0;font-weight:700;margin-left:3px" title="${_b2Collapsed.has(univName)?'펼치기':'접기'}">${_b2Collapsed.has(univName)?'▶':'▼'}</button>
        </div>
      </div>
      <div class="b2-card-body" style="${_b2Collapsed.has(univName)?'display:none':''}">
        <div style="position:relative;overflow:hidden">
          ${bgImgHtml}
          <div style="position:relative;z-index:1">
            <div>${rows}</div>
            ${sidePanelHtml}
          </div>
        </div>
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
    <div style="background:#64748b${_b2AlphaHex(b2FreeBgAlpha)};padding:6px 14px 12px">`;

  const _frow = (labelEl, contentEl) => `<div style="padding:5px 0;border-bottom:1px solid ${defCol}18"><div style="display:flex;align-items:stretch">${labelEl}<div style="flex:1;padding:2px 4px">${contentEl}</div></div></div>`;
  const _fl = (text, isRole) => `<span style="font-size:12px;font-weight:800;color:${isRole?defCol:'var(--text3)'};width:56px;min-width:56px;text-align:center;flex-shrink:0;display:inline-flex;align-items:center;justify-content:center;background:#64748b${_b2AlphaHex(b2FreeTierBgAlpha)};border-right:1px solid ${defCol}33;margin-right:10px">${text}</span>`;

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
  return `
    <div onclick="openPlayerModal('${(p.name||'').replace(/'/g,"\\'")}')"
      style="display:flex;align-items:center;gap:6px;padding:3px 8px 3px 3px;border-radius:20px;cursor:pointer;transition:background .12s"
      onmouseover="this.style.background='${accentCol}14'"
      onmouseout="this.style.background='transparent'">
      ${_b2Avatar(p, accentCol, 58)}
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
  return `
    <div onclick="openPlayerModal('${(p.name||'').replace(/'/g,"\\'")}')"
      style="display:flex;align-items:center;gap:7px;padding:5px 13px 5px 5px;border-radius:24px;background:var(--white);border:1.5px solid ${accentCol}44;cursor:pointer;box-shadow:0 1px 3px #0001;transition:transform .1s,box-shadow .1s"
      onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 4px 10px ${accentCol}33'"
      onmouseout="this.style.transform='';this.style.boxShadow='0 1px 3px #0001'">
      ${_b2Avatar(p, accentCol, 36)}
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

  await new Promise(r => setTimeout(r, 300));
  injectUnivIcons(tmpDiv);
  await new Promise(r => setTimeout(r, 200));
  // 이미지 먼저 data URL로 변환 후 치수 측정 (측정 전 로드 필수)
  if (typeof _imgToDataUrls === 'function') await _imgToDataUrls(tmpDiv, 6000);
  await new Promise(r => setTimeout(r, 100));

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

  await new Promise(r => setTimeout(r, 300));
  injectUnivIcons(tmpDiv);
  await new Promise(r => setTimeout(r, 200));
  if (typeof _imgToDataUrls === 'function') await _imgToDataUrls(tmpDiv, 6000);
  await new Promise(r => setTimeout(r, 100));

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
