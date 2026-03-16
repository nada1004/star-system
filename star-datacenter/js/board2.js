/* ══════════════════════════════════════
   현황판2 — 대학별 컬러블록 로스터 보드
══════════════════════════════════════ */

let _b2View = 'univ';

// 현황판2 직책 우선순위 (이사장 > 총장 > 부총장 > 교수 > 코치 > 나머지)
const _B2_ROLE_ORDER = ['이사장','총장','부총장','교수','코치','선장','동아리장','반장','총괄'];

function _b2RoleRank(p) {
  const i = _B2_ROLE_ORDER.indexOf(p.role||'');
  return i >= 0 ? i : 99;
}

function rBoard2(C, T) {
  const univList = getAllUnivs();
  const filterBar = `
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:16px;flex-wrap:wrap">
      <button onclick="_b2View='univ';render()" style="padding:5px 16px;border-radius:20px;border:2px solid ${_b2View==='univ'?'var(--blue)':'var(--border2)'};background:${_b2View==='univ'?'var(--blue)':'var(--white)'};color:${_b2View==='univ'?'#fff':'var(--text3)'};font-weight:700;font-size:12px;cursor:pointer">🏟️ 대학별</button>
      <button onclick="_b2View='tier';render()" style="padding:5px 16px;border-radius:20px;border:2px solid ${_b2View==='tier'?'var(--blue)':'var(--border2)'};background:${_b2View==='tier'?'var(--blue)':'var(--white)'};color:${_b2View==='tier'?'#fff':'var(--text3)'};font-weight:700;font-size:12px;cursor:pointer">🏅 티어별</button>
    </div>`;

  let html = filterBar;
  if (_b2View === 'univ') html += _b2UnivView(univList);
  else html += _b2TierView();

  C.innerHTML = html;
  injectUnivIcons(C);
}

function _b2UnivView(univList) {
  let h = `<div style="display:flex;flex-direction:column;gap:10px">`;
  univList.forEach(u => {
    const col = gc(u.name);
    const members = players.filter(p => p.univ === u.name && !p.hidden);
    if (!members.length) return;
    members.sort((a, b) => _b2RoleRank(a) - _b2RoleRank(b) || (a.name||'').localeCompare(b.name||''));
    h += _b2UnivBlock(u.name, col, members);
  });
  h += `</div>`;
  return h;
}

function _b2TierView() {
  let h = `<div style="display:flex;flex-direction:column;gap:10px">`;
  const usedTiers = [...new Set(players.filter(p=>!p.hidden).map(p=>p.tier||'').filter(Boolean))];
  const orderedTiers = TIERS.filter(t => usedTiers.includes(t));
  orderedTiers.forEach(tier => {
    const col = getTierBtnColor(tier);
    const textCol = getTierBtnTextColor(tier);
    const members = players.filter(p => (p.tier||'') === tier && !p.hidden);
    if (!members.length) return;
    members.sort((a,b) => _b2RoleRank(a) - _b2RoleRank(b) || (a.univ||'').localeCompare(b.univ||'') || (a.name||'').localeCompare(b.name||''));
    h += _b2TierBlock(tier, col, textCol, members);
  });
  h += `</div>`;
  return h;
}

function _b2UnivBlock(univName, col, members) {
  const u = univCfg.find(x => x.name === univName) || {};
  const iconUrl = u.icon || u.img || UNIV_ICONS[univName] || '';
  const textCol = _b2ContrastColor(col);
  const lightCol = col + '18';
  return `
    <div style="border-radius:14px;overflow:hidden;box-shadow:0 2px 12px ${col}33">
      <div style="background:${col};padding:10px 16px;display:flex;align-items:center;gap:8px">
        ${iconUrl ? `<img src="${iconUrl}" style="width:26px;height:26px;border-radius:50%;object-fit:cover;border:2px solid ${textCol}66;flex-shrink:0" onerror="this.style.display='none'">` : ''}
        <span style="font-weight:900;font-size:15px;color:${textCol};letter-spacing:-0.3px">${univName}</span>
        <span style="margin-left:auto;background:${textCol}22;color:${textCol};font-size:11px;font-weight:700;padding:2px 8px;border-radius:10px;border:1px solid ${textCol}44">${members.length}명</span>
      </div>
      <div style="background:${lightCol};padding:10px 12px;display:flex;flex-wrap:wrap;gap:7px">
        ${members.map(p => _b2Chip(p, col, 'univ')).join('')}
      </div>
    </div>`;
}

function _b2TierBlock(tier, col, textCol, members) {
  const lightCol = col + '18';
  return `
    <div style="border-radius:14px;overflow:hidden;box-shadow:0 2px 12px ${col}33">
      <div style="background:${col};padding:10px 16px;display:flex;align-items:center;gap:8px">
        <span style="font-weight:900;font-size:15px;color:${textCol||'#fff'};letter-spacing:-0.3px">${tier}</span>
        <span style="margin-left:auto;background:${(textCol||'#fff')}22;color:${textCol||'#fff'};font-size:11px;font-weight:700;padding:2px 8px;border-radius:10px;border:1px solid ${(textCol||'#fff')}44">${members.length}명</span>
      </div>
      <div style="background:${lightCol};padding:10px 12px;display:flex;flex-wrap:wrap;gap:7px">
        ${members.map(p => _b2Chip(p, col, 'tier')).join('')}
      </div>
    </div>`;
}

function _b2Chip(p, accentCol, mode) {
  const race = {'T':'테란','Z':'저그','P':'프로토스','N':''}[p.race||'N']||'';
  const raceShort = {'T':'T','Z':'Z','P':'P','N':''}[p.race||'N']||'';
  const univCol = gc(p.univ||'');
  const tierCol = getTierBtnColor(p.tier||'');
  const tierTextCol = getTierBtnTextColor(p.tier||'') || '#fff';
  const roleIcon = ROLE_ICONS[p.role||''] || '';
  const borderCol = mode === 'univ' ? accentCol : univCol;

  // 아바타: 레이스 이니셜 원형
  const avatar = `<span style="width:30px;height:30px;border-radius:50%;background:${borderCol};display:inline-flex;align-items:center;justify-content:center;font-weight:900;font-size:13px;color:#fff;flex-shrink:0">${raceShort||'?'}</span>`;

  // 서브 배지
  const subBadge = mode === 'univ'
    ? `<span style="font-size:9px;font-weight:700;padding:1px 5px;border-radius:5px;background:${tierCol};color:${tierTextCol}">${p.tier||'?'}</span>`
    : `<span style="font-size:9px;font-weight:700;padding:1px 5px;border-radius:5px;background:${univCol};color:#fff;max-width:60px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${p.univ||'?'}</span>`;

  return `<div onclick="openPlayerModal('${(p.name||'').replace(/'/g,"\\'")}')"
    style="display:flex;align-items:center;gap:6px;padding:4px 10px 4px 5px;border-radius:20px;background:var(--white);border:1.5px solid ${borderCol}55;cursor:pointer;box-shadow:0 1px 3px #0001;transition:transform .1s,box-shadow .1s"
    onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 4px 10px ${borderCol}44'"
    onmouseout="this.style.transform='';this.style.boxShadow='0 1px 3px #0001'">
    ${avatar}
    <div style="display:flex;flex-direction:column;gap:2px;min-width:0">
      <span style="font-weight:700;font-size:12px;color:var(--text1);line-height:1;white-space:nowrap">${roleIcon ? roleIcon+' ' : ''}${p.name||''}</span>
      <div style="display:flex;align-items:center;gap:3px">${subBadge}</div>
    </div>
  </div>`;
}

function _b2ContrastColor(hex) {
  try {
    const c = (hex||'').replace('#','');
    const r = parseInt(c.slice(0,2),16), g = parseInt(c.slice(2,4),16), b = parseInt(c.slice(4,6),16);
    return (r*299+g*587+b*114)/1000 > 128 ? '#1e293b' : '#ffffff';
  } catch(e){ return '#ffffff'; }
}
