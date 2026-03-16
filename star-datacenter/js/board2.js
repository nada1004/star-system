/* ══════════════════════════════════════
   현황판 — 대학별 컬러블록 로스터 보드
   (구현황판 통합 포함)
══════════════════════════════════════ */

let _b2View = 'univ';

// 직책 우선순위
const _B2_ROLE_ORDER = ['이사장','총장','부총장','교수','코치','선장','동아리장','반장','총괄'];

function _b2RoleRank(p) {
  const i = _B2_ROLE_ORDER.indexOf(p.role||'');
  return i >= 0 ? i : 99;
}

function rBoard2(C, T) {
  const filterBar = `
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:16px;flex-wrap:wrap">
      <button onclick="_b2View='univ';render()" style="padding:5px 16px;border-radius:20px;border:2px solid ${_b2View==='univ'?'var(--blue)':'var(--border2)'};background:${_b2View==='univ'?'var(--blue)':'var(--white)'};color:${_b2View==='univ'?'#fff':'var(--text3)'};font-weight:700;font-size:12px;cursor:pointer">🏟️ 대학별</button>
      <button onclick="_b2View='free';render()" style="padding:5px 16px;border-radius:20px;border:2px solid ${_b2View==='free'?'var(--blue)':'var(--border2)'};background:${_b2View==='free'?'var(--blue)':'var(--white)'};color:${_b2View==='free'?'#fff':'var(--text3)'};font-weight:700;font-size:12px;cursor:pointer">🚶 무소속</button>
      <button onclick="_b2View='old';render()" style="padding:5px 16px;border-radius:20px;border:2px solid ${_b2View==='old'?'var(--blue)':'var(--border2)'};background:${_b2View==='old'?'var(--blue)':'var(--white)'};color:${_b2View==='old'?'#fff':'var(--text3)'};font-weight:700;font-size:12px;cursor:pointer">📊 구현황판</button>
    </div>`;

  let html = filterBar;
  if (_b2View === 'univ') html += _b2UnivView();
  else if (_b2View === 'free') html += _b2FreeView();
  else { C.innerHTML = html; if(typeof rBoard==='function') rBoard(C, T, true); return; }

  C.innerHTML = html;
  injectUnivIcons(C);
}

/* ── 숨김 대학 필터 (비로그인 시 hidden 제외) ── */
function _b2VisUnivs() {
  const all = getAllUnivs();
  return isLoggedIn ? all : all.filter(u => !u.hidden);
}

/* ── 대학별 뷰 ── */
function _b2UnivView() {
  const univList = _b2VisUnivs().filter(u => u.name !== '무소속');
  let h = `<div style="display:flex;flex-direction:column;gap:12px">`;
  univList.forEach(u => {
    const members = players.filter(p => p.univ === u.name && !p.hidden);
    if (!members.length) return;
    h += _b2UnivBlock(u.name, gc(u.name), members);
  });
  h += `</div>`;
  return h;
}

function _b2UnivBlock(univName, col, members) {
  const u = univCfg.find(x => x.name === univName) || {};
  const iconUrl = u.icon || u.img || UNIV_ICONS[univName] || '';
  const textCol = _b2ContrastColor(col);
  const lightCol = col + '12';

  // 직책 그룹
  const roledMembers = members.filter(p => _B2_ROLE_ORDER.includes(p.role||''));
  roledMembers.sort((a,b) => _b2RoleRank(a) - _b2RoleRank(b));

  // 티어별 일반 멤버
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

  let body = '';

  roledMembers.forEach(p => {
    body += `
      <div style="display:flex;align-items:center;gap:10px;padding:6px 0;border-bottom:1px solid ${col}18">
        <span style="font-size:11px;font-weight:700;color:${col};min-width:44px;text-align:right;flex-shrink:0">${p.role||''}</span>
        ${_b2PlayerRow(p, col)}
      </div>`;
  });

  orderedTierKeys.forEach(tier => {
    const group = tierGroups[tier];
    group.sort((a,b) => (a.name||'').localeCompare(b.name||''));
    body += `
      <div style="display:flex;align-items:flex-start;gap:10px;padding:6px 0;border-bottom:1px solid ${col}18">
        <span style="font-size:11px;font-weight:700;min-width:44px;text-align:right;flex-shrink:0;padding:2px 0;color:var(--text3)">${tier}</span>
        <div style="display:flex;flex-wrap:wrap;gap:6px;flex:1">
          ${group.map(p => _b2Chip(p, col)).join('')}
        </div>
      </div>`;
  });

  return `
    <div style="border-radius:14px;overflow:hidden;box-shadow:0 2px 14px ${col}2a">
      <div style="background:${col};padding:10px 16px;display:flex;align-items:center;gap:8px">
        ${iconUrl ? `<img src="${iconUrl}" style="width:26px;height:26px;border-radius:50%;object-fit:cover;border:2px solid ${textCol}66;flex-shrink:0" onerror="this.style.display='none'">` : ''}
        <span style="font-weight:900;font-size:15px;color:${textCol};letter-spacing:-0.3px">${univName}</span>
        ${isLoggedIn && u.hidden ? `<span style="background:rgba(0,0,0,.35);font-size:10px;padding:1px 7px;border-radius:8px;color:#fca5a5">🚫 숨김</span>` : ''}
        <span style="margin-left:auto;background:${textCol}22;color:${textCol};font-size:11px;font-weight:700;padding:2px 8px;border-radius:10px;border:1px solid ${textCol}44">${members.length}명</span>
      </div>
      <div style="background:${lightCol};padding:4px 14px 8px">
        ${body}
      </div>
    </div>`;
}

/* ── 무소속 뷰 ── */
function _b2FreeView() {
  const freeMembers = players.filter(p => (!p.univ || p.univ === '무소속') && !p.hidden);
  if (!freeMembers.length) return `<div style="text-align:center;color:var(--text3);padding:40px">무소속 멤버가 없습니다</div>`;

  const tierGroups = {};
  freeMembers.forEach(p => {
    const t = p.tier || '?';
    if (!tierGroups[t]) tierGroups[t] = [];
    tierGroups[t].push(p);
  });
  const orderedTierKeys = TIERS.filter(t => tierGroups[t]).concat(
    Object.keys(tierGroups).filter(t => !TIERS.includes(t))
  );

  let h = `<div style="display:flex;flex-direction:column;gap:10px">`;
  orderedTierKeys.forEach(tier => {
    const group = tierGroups[tier];
    group.sort((a,b) => (a.name||'').localeCompare(b.name||''));
    const col = getTierBtnColor(tier);
    const textCol = getTierBtnTextColor(tier) || '#fff';
    h += `
      <div style="border-radius:14px;overflow:hidden;box-shadow:0 2px 10px ${col}2a">
        <div style="background:${col};padding:9px 16px;display:flex;align-items:center;gap:8px">
          <span style="font-weight:900;font-size:14px;color:${textCol}">${tier}</span>
          <span style="margin-left:auto;background:${textCol}22;color:${textCol};font-size:11px;font-weight:700;padding:2px 8px;border-radius:10px;border:1px solid ${textCol}44">${group.length}명</span>
        </div>
        <div style="background:${col}12;padding:10px 12px;display:flex;flex-wrap:wrap;gap:7px">
          ${group.map(p => _b2Chip(p, col)).join('')}
        </div>
      </div>`;
  });
  h += `</div>`;
  return h;
}

/* ── 직책 1행 표시 ── */
function _b2PlayerRow(p, accentCol) {
  const race = {'T':'테란','Z':'저그','P':'프로토스'}[p.race||''] || '';
  const tierCol = getTierBtnColor(p.tier||'');
  const tierTextCol = getTierBtnTextColor(p.tier||'') || '#fff';
  return `
    <div onclick="openPlayerModal('${(p.name||'').replace(/'/g,"\\'")}')"
      style="display:flex;align-items:center;gap:8px;cursor:pointer;flex:1"
      onmouseover="this.querySelector('.b2name').style.color='${accentCol}'"
      onmouseout="this.querySelector('.b2name').style.color='var(--text1)'">
      ${_b2Avatar(p, accentCol, 34)}
      <span class="b2name" style="font-weight:700;font-size:13px;color:var(--text1);transition:color .1s">${p.name||''}</span>
      ${race ? `<span style="font-size:10px;color:var(--text3)">${race}</span>` : ''}
      <span style="font-size:9px;font-weight:700;padding:1px 6px;border-radius:5px;background:${tierCol};color:${tierTextCol}">${p.tier||'?'}</span>
    </div>`;
}

/* ── 칩 ── */
function _b2Chip(p, accentCol) {
  const raceShort = {'T':'T','Z':'Z','P':'P'}[p.race||''] || '?';
  return `
    <div onclick="openPlayerModal('${(p.name||'').replace(/'/g,"\\'")}')"
      style="display:flex;align-items:center;gap:5px;padding:3px 9px 3px 4px;border-radius:20px;background:var(--white);border:1.5px solid ${accentCol}44;cursor:pointer;box-shadow:0 1px 3px #0001;transition:transform .1s,box-shadow .1s"
      onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 4px 10px ${accentCol}33'"
      onmouseout="this.style.transform='';this.style.boxShadow='0 1px 3px #0001'">
      ${_b2Avatar(p, accentCol, 26)}
      <span style="font-weight:700;font-size:11px;color:var(--text1);white-space:nowrap">${p.name||''}</span>
    </div>`;
}

/* ── 아바타: photo 있으면 이미지, 없으면 레이스 이니셜 원 ── */
function _b2Avatar(p, col, size) {
  const raceShort = {'T':'T','Z':'Z','P':'P','N':'?'}[p.race||'N'] || '?';
  const s = size || 28;
  if (p.photo) {
    return `<span style="position:relative;width:${s}px;height:${s}px;flex-shrink:0;display:inline-flex">
      <img src="${p.photo}" style="width:${s}px;height:${s}px;border-radius:50%;object-fit:cover;flex-shrink:0;border:2px solid ${col}88" onerror="this.parentNode.innerHTML=_b2AvatarFallback('${raceShort}','${col}',${s})">
    </span>`;
  }
  return _b2AvatarFallback(raceShort, col, s);
}

function _b2AvatarFallback(letter, col, size) {
  const s = size || 28;
  return `<span style="width:${s}px;height:${s}px;border-radius:50%;background:${col};display:inline-flex;align-items:center;justify-content:center;font-weight:900;font-size:${Math.round(s*0.45)}px;color:#fff;flex-shrink:0;border:2px solid ${col}88">${letter}</span>`;
}

function _b2ContrastColor(hex) {
  try {
    const c = (hex||'').replace('#','');
    const r = parseInt(c.slice(0,2),16), g = parseInt(c.slice(2,4),16), b = parseInt(c.slice(4,6),16);
    return (r*299+g*587+b*114)/1000 > 128 ? '#1e293b' : '#ffffff';
  } catch(e){ return '#ffffff'; }
}
