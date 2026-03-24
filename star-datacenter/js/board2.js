/* ══════════════════════════════════════
   현황판 — 대학별 컬러블록 로스터 보드
   (구현황판 통합 포함)
══════════════════════════════════════ */

let _b2View = 'univ';

const _B2_ROLE_ORDER = ['이사장','총장','부총장','교수','코치','선장','동아리장','반장','총괄'];

function _b2RoleRank(p) {
  const i = _B2_ROLE_ORDER.indexOf(p.role||'');
  return i >= 0 ? i : 99;
}

// 숨김 대학 항상 제외 (로그인 여부 관계없이 board2에서는 hidden=true인 대학 숨김)
function _b2VisUnivs() {
  return getAllUnivs().filter(u => !u.hidden);
}

function rBoard2(C, T) {
  const oldBtn = isLoggedIn
    ? `<button onclick="_b2View='old';render()" style="padding:5px 16px;border-radius:20px;border:2px solid ${_b2View==='old'?'var(--blue)':'var(--border2)'};background:${_b2View==='old'?'var(--blue)':'var(--white)'};color:${_b2View==='old'?'#fff':'var(--text3)'};font-weight:700;font-size:12px;cursor:pointer">📊 구현황판</button>`
    : '';

  const filterBar = `
    <div id="b2-nav" style="display:flex;align-items:center;gap:8px;margin-bottom:16px;flex-wrap:wrap">
      <button onclick="_b2View='univ';render()" style="padding:5px 16px;border-radius:20px;border:2px solid ${_b2View==='univ'?'var(--blue)':'var(--border2)'};background:${_b2View==='univ'?'var(--blue)':'var(--white)'};color:${_b2View==='univ'?'#fff':'var(--text3)'};font-weight:700;font-size:12px;cursor:pointer">🏟️ 대학별</button>
      <button onclick="_b2View='free';render()" style="padding:5px 16px;border-radius:20px;border:2px solid ${_b2View==='free'?'var(--blue)':'var(--border2)'};background:${_b2View==='free'?'var(--blue)':'var(--white)'};color:${_b2View==='free'?'#fff':'var(--text3)'};font-weight:700;font-size:12px;cursor:pointer">🚶 무소속</button>
      ${oldBtn}
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
  const _b2Cols = (typeof boardGridCols!=='undefined'&&boardGridCols===2) ? 'repeat(2,1fr)' : '1fr';
  let h = `<style>.b2-bottom-img{max-width:130px;max-height:110px;object-fit:contain;}.b2-side-panel{float:right;width:230px;margin:0 0 6px 10px;border-radius:10px;padding:8px;box-sizing:border-box;}@media(max-width:640px){.b2-side-panel{display:none!important;}.b2-bottom-img{display:none!important;}}@media(max-width:768px){.b2-univ-grid{grid-template-columns:1fr!important;}}</style>`;
  h += `<div class="b2-univ-grid" style="display:grid;grid-template-columns:${_b2Cols};gap:12px;align-items:start">`;
  univList.forEach(u => {
    const members = players.filter(p => p.univ === u.name && !p.hidden && !p.retired);
    h += _b2UnivBlock(u.name, gc(u.name), members);
  });
  h += `</div>`;
  return h;
}

function _b2UnivBlock(univName, col, members) {
  const uCfg = univCfg.find(x => x.name === univName) || {};
  const iconUrl = uCfg.icon || uCfg.img || UNIV_ICONS[univName] || '';
  const textCol = _b2ContrastColor(col);
  const lightCol = col + '12';

  // 멤버 없을 때 빈 블록
  if (!members.length) {
    return `<div style="border-radius:14px;border:2px dashed ${col}66;padding:20px 18px;background:${lightCol};display:flex;align-items:center;gap:10px;opacity:.7">
      ${iconUrl?`<img src="${iconUrl}" style="width:32px;height:32px;object-fit:contain;border-radius:6px" onerror="this.style.display='none'">`:''}
      <span style="font-weight:900;font-size:15px;color:${col};cursor:pointer" onclick="if(typeof openUnivModal==='function')openUnivModal('${univName}')" title="대학 상세">${univName}</span>
      <span style="font-size:11px;color:var(--gray-l);margin-left:4px">등록된 선수 없음</span>
    </div>`;
  }

  // 직책 그룹
  const roledMembers = members.filter(p => _B2_ROLE_ORDER.includes(p.role||''));
  roledMembers.sort((a,b) => _b2RoleRank(a) - _b2RoleRank(b));

  // 티어 그룹 (직책 없는 일반 멤버)
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

  const _row = (labelEl, contentEl) => `<div style="padding:5px 0;border-bottom:1px solid ${col}40"><div style="display:flex;align-items:flex-start;gap:10px">${labelEl}${contentEl}</div></div>`;
  const _roleLabel = (text) => `<span style="font-size:12px;font-weight:800;color:${col};width:56px;min-width:56px;text-align:center;flex-shrink:0;padding-top:6px">${text}</span>`;
  const _tierLabel = (text) => `<span style="font-size:12px;font-weight:800;color:var(--text3);width:56px;min-width:56px;text-align:center;flex-shrink:0;padding-top:6px">${text}</span>`;

  // 같은 직책끼리 묶어서 1행으로
  const roleGroups = {};
  const roleOrder = [];
  roledMembers.forEach(p => {
    const r = p.role || '';
    if (!roleGroups[r]) { roleGroups[r] = []; roleOrder.push(r); }
    roleGroups[r].push(p);
  });
  let roledBody = '';
  roleOrder.forEach(role => {
    const group = roleGroups[role];
    const content = group.length === 1
      ? _b2PlayerRow(group[0], col)
      : `<div style="display:flex;flex-wrap:wrap;gap:5px;padding:2px 0">${group.map(p => _b2NameTag(p, col)).join('')}</div>`;
    roledBody += _row(_roleLabel(role), content);
  });

  let tieredBody = '';
  orderedTierKeys.forEach(tier => {
    const group = tierGroups[tier];
    group.sort((a,b) => (a.name||'').localeCompare(b.name||''));
    tieredBody += _row(_tierLabel(tier), `<div style="display:flex;flex-wrap:wrap;gap:5px;padding:2px 0">${group.map(p => _b2NameTag(p, col)).join('')}</div>`);
  });

  // 사이드 패널 (memoImgs 배열, position:absolute로 선 가리지 않음)
  const _sideMemo = uCfg.memo || '';
  const _sideImgs = (uCfg.memoImgs||[]).length ? uCfg.memoImgs : (uCfg.memoImg ? [uCfg.memoImg] : []);
  const sideImgHtml = _sideImgs.map(src=>`<img src="${src}" style="max-width:100%;max-height:160px;object-fit:contain;border-radius:7px;margin-bottom:5px;display:block" onerror="this.style.display='none'">`).join('');
  const hasSide = !!(_sideMemo||_sideImgs.length);
  const floatSideHtml = hasSide ? `<div class="b2-side-panel" style="background:${col}16;border:1px solid ${col}30">${sideImgHtml}${_sideMemo?`<div style="font-size:11px;color:#333;white-space:pre-wrap;line-height:1.5">${_sideMemo}</div>`:''}</div>` : '';

  const tierSection = `<div style="overflow:hidden">${floatSideHtml}${roledBody}${tieredBody}</div>`;

  // 하단 (bMemo + bMemoImgs 배열)
  const _bnote = uCfg.bMemo || '';
  const _bimgs = (uCfg.bMemoImgs||[]).concat(uCfg.bMemoImg?[uCfg.bMemoImg]:[]);
  const _bimgHtmls = _bimgs.map(src=>`<img class="b2-bottom-img" src="${src}" style="border-radius:8px;display:inline-block" onerror="this.style.display='none'">`).join('');
  const bottomSection = (_bnote||_bimgs.length) ? `<div style="padding:6px 14px 10px;background:${lightCol};border-top:1px solid ${col}18">
    ${_bimgHtmls?`<div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:${_bnote?'6px':'0'}">${_bimgHtmls}</div>`:''}
    ${_bnote?`<div style="font-size:12px;color:#333;white-space:pre-wrap;line-height:1.6">${_bnote}</div>`:''}
  </div>` : '';

  const _bgPos = uCfg.bgImgPos || 'center center';
  const _bgSize = uCfg.bgImgSize || 'cover';
  const bgImgHtml = uCfg.bgImg
    ? `<div style="position:absolute;inset:0;background:url('${uCfg.bgImg}') ${_bgPos}/${_bgSize} no-repeat;opacity:0.18;pointer-events:none;z-index:0"></div>`
    : '';

  return `
    <div style="border-radius:14px;overflow:hidden;box-shadow:0 2px 14px ${col}2a">
      <div style="background:${col};padding:10px 16px">
        <div style="display:flex;align-items:center;gap:6px;flex-wrap:nowrap;overflow:hidden">
          ${iconUrl ? `<img src="${iconUrl}" style="width:26px;height:26px;border-radius:50%;object-fit:cover;border:2px solid ${textCol}66;flex-shrink:0" onerror="this.style.display='none'">` : ''}
          <span style="font-weight:900;font-size:15px;color:${textCol};letter-spacing:-0.3px;flex-shrink:0;cursor:pointer" onclick="if(typeof openUnivModal==='function')openUnivModal('${univName}')" title="대학 상세">${univName}</span>
          ${(uCfg.championships||0)>0?`<span style="display:flex;gap:1px;align-items:center;flex-shrink:0">${'<span style="font-size:15px">⭐</span>'.repeat(uCfg.championships)}</span>`:''}
          ${uCfg.memo2?`<span style="font-size:11px;color:${textCol}cc;flex:0 1 auto;max-width:50%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;margin-left:2px">${uCfg.memo2}</span>`:''}
          <span style="flex:1"></span>
          <span style="flex-shrink:0;background:${textCol}22;color:${textCol};font-size:11px;font-weight:700;padding:2px 8px;border-radius:10px;border:1px solid ${textCol}44">${members.length}명</span>
        </div>
      </div>
      <div style="background:${lightCol};padding:4px 14px 8px;position:relative;overflow:hidden">
        ${bgImgHtml}
        <div style="position:relative;z-index:1">
          ${tierSection}
        </div>
      </div>
      ${bottomSection}
    </div>`;
}

/* ── 무소속 뷰 ── */
function _b2FreeView() {
  const freeMembers = players.filter(p => (!p.univ || p.univ === '무소속') && !p.hidden && !p.retired);
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
    <div style="background:#64748b0e;padding:6px 14px 12px">`;

  const _frow = (labelEl, contentEl) => `<div style="padding:5px 0;border-bottom:1px solid ${defCol}18"><div style="display:flex;align-items:flex-start;gap:10px">${labelEl}${contentEl}</div></div>`;
  const _fl = (text, isRole) => `<span style="font-size:12px;font-weight:800;color:${isRole?defCol:'var(--text3)'};width:56px;min-width:56px;text-align:center;flex-shrink:0;padding-top:6px">${text}</span>`;

  // 직책 그룹
  roledFree.forEach(p => {
    h += _frow(_fl(p.role||'', true), _b2PlayerRow(p, defCol));
  });

  orderedTierKeys.forEach(tier => {
    const group = tierGroups[tier];
    group.sort((a,b) => (a.name||'').localeCompare(b.name||''));
    const col = getTierBtnColor(tier);
    h += _frow(_fl(tier, false), `<div style="display:flex;flex-wrap:wrap;gap:5px;padding:2px 0">${group.map(p => _b2NameTag(p, col)).join('')}</div>`);
  });
  h += `</div></div>`;
  return h;
}

/* ── 버튼 없는 이름 태그 (티어 멤버용) ── */
function _b2NameTag(p, accentCol) {
  return `
    <div onclick="openPlayerModal('${(p.name||'').replace(/'/g,"\\'")}')"
      style="display:flex;align-items:center;gap:6px;padding:3px 8px 3px 3px;border-radius:20px;cursor:pointer;transition:background .12s"
      onmouseover="this.style.background='${accentCol}14'"
      onmouseout="this.style.background='transparent'">
      ${_b2Avatar(p, accentCol, 40)}
      <span style="font-weight:700;font-size:14px;color:var(--text1);white-space:nowrap;${p.inactive?'opacity:.6':''}">${p.name||''}</span>
      ${p.race&&p.race!=='N'?_b2RaceIcon(p.race,15):''}
      ${p.tier?`<span style="font-size:10px;font-weight:700;padding:1px 5px;border-radius:4px;background:${getTierBtnColor(p.tier)};color:${getTierBtnTextColor(p.tier)||'#fff'};flex-shrink:0">${p.tier}</span>`:''}
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
      ${_b2Avatar(p, accentCol, 40)}
      <span class="b2name" style="font-weight:700;font-size:16px;color:var(--text1);transition:color .1s;${p.inactive?'opacity:.6':''}">${p.name||''}</span>
      ${p.inactive?'<span style="font-size:9px;background:#fff7ed;color:#9a3412;border-radius:4px;padding:1px 4px;font-weight:700;flex-shrink:0">⏸️</span>':''}
      ${p.race&&p.race!=='N'?_b2RaceIcon(p.race,18):''}
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
  if (p.photo) {
    return `<span style="width:${s}px;height:${s}px;flex-shrink:0;display:inline-flex">
      <img src="${p.photo}" style="width:${s}px;height:${s}px;border-radius:50%;object-fit:cover;flex-shrink:0;border:2px solid ${col}88" onerror="this.parentNode.innerHTML=_b2AvatarFallback('${raceShort}','${col}',${s})">
    </span>`;
  }
  return _b2AvatarFallback(raceShort, col, s);
}

function _b2AvatarFallback(letter, col, size) {
  const s = size || 28;
  return `<span style="width:${s}px;height:${s}px;border-radius:50%;background:${col};display:inline-flex;align-items:center;justify-content:center;font-weight:900;font-size:${Math.round(s*0.45)}px;color:#fff;flex-shrink:0;border:2px solid ${col}88">${letter}</span>`;
}

/* ── 종족 SVG 아이콘 ── */
function _b2RaceIcon(race, size) {
  const s = size || 16;
  if (race === 'T') return `<svg width="${s}" height="${s}" viewBox="0 0 16 16" fill="none" style="flex-shrink:0" title="테란"><circle cx="8" cy="8" r="7" fill="#dbeafe" stroke="#1d4ed8" stroke-width="1.5"/><line x1="8" y1="2.5" x2="8" y2="13.5" stroke="#1d4ed8" stroke-width="1.5"/><line x1="2.5" y1="8" x2="13.5" y2="8" stroke="#1d4ed8" stroke-width="1.5"/><circle cx="8" cy="8" r="2" fill="#1d4ed8"/></svg>`;
  if (race === 'Z') return `<svg width="${s}" height="${s}" viewBox="0 0 16 16" fill="none" style="flex-shrink:0" title="저그"><circle cx="8" cy="8" r="7" fill="#ede9fe" stroke="#7c3aed" stroke-width="1.5"/><path d="M8 2.5L9.5 6H13L10.2 8.2L11.2 12L8 9.8L4.8 12L5.8 8.2L3 6H6.5Z" fill="#7c3aed"/></svg>`;
  if (race === 'P') return `<svg width="${s}" height="${s}" viewBox="0 0 16 16" fill="none" style="flex-shrink:0" title="프로토스"><circle cx="8" cy="8" r="7" fill="#fef3c7" stroke="#b45309" stroke-width="1.5"/><polygon points="8,3.5 12.5,12 3.5,12" fill="#b45309"/></svg>`;
  return `<svg width="${s}" height="${s}" viewBox="0 0 16 16" fill="none" style="flex-shrink:0"><circle cx="8" cy="8" r="7" fill="#f1f5f9" stroke="#94a3b8" stroke-width="1.5"/><text x="8" y="12" text-anchor="middle" font-size="8" fill="#64748b" font-weight="700">?</text></svg>`;
}

function _b2ContrastColor(hex) {
  try {
    const c = (hex||'').replace('#','');
    const r = parseInt(c.slice(0,2),16), g = parseInt(c.slice(2,4),16), b = parseInt(c.slice(4,6),16);
    return (r*299+g*587+b*114)/1000 > 128 ? '#1e293b' : '#ffffff';
  } catch(e){ return '#ffffff'; }
}
