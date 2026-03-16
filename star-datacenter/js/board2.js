/* ══════════════════════════════════════
   현황판2 — 대학별 컬러블록 로스터 보드
══════════════════════════════════════ */

// 현황판2 뷰 모드: 'univ' | 'tier'
let _b2View = 'univ';

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
    // 역할 순서 정렬
    members.sort((a, b) => {
      const ri = n => MAIN_ROLES.indexOf(n.role) >= 0 ? MAIN_ROLES.indexOf(n.role) : 99;
      return ri(a) - ri(b) || (a.name||'').localeCompare(b.name||'');
    });
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
    members.sort((a,b)=>(a.univ||'').localeCompare(b.univ||'')||(a.name||'').localeCompare(b.name||''));
    h += _b2TierBlock(tier, col, textCol, members);
  });
  h += `</div>`;
  return h;
}

function _b2UnivBlock(univName, col, members) {
  const icon = _b2UnivIconHTML(univName);
  const textCol = _b2ContrastColor(col);
  const lightCol = col + '22';
  return `
    <div style="border-radius:14px;overflow:hidden;box-shadow:0 2px 12px ${col}33">
      <div style="background:${col};padding:10px 16px;display:flex;align-items:center;gap:8px">
        ${icon ? `<img src="${icon}" style="width:28px;height:28px;border-radius:50%;object-fit:cover;border:2px solid ${textCol}88;flex-shrink:0" onerror="this.style.display='none'">` : ''}
        <span style="font-weight:900;font-size:15px;color:${textCol};letter-spacing:-0.3px">${univName}</span>
        <span style="margin-left:auto;background:${textCol}22;color:${textCol};font-size:11px;font-weight:700;padding:2px 8px;border-radius:10px;border:1px solid ${textCol}44">${members.length}명</span>
      </div>
      <div style="background:${lightCol};padding:10px 12px;display:flex;flex-wrap:wrap;gap:8px">
        ${members.map(p => _b2PlayerChip(p, col)).join('')}
      </div>
    </div>`;
}

function _b2TierBlock(tier, col, textCol, members) {
  const lightCol = col + '18';
  return `
    <div style="border-radius:14px;overflow:hidden;box-shadow:0 2px 12px ${col}33">
      <div style="background:${col};padding:10px 16px;display:flex;align-items:center;gap:8px">
        <span style="font-weight:900;font-size:15px;color:${textCol};letter-spacing:-0.3px">${tier}</span>
        <span style="margin-left:auto;background:${textCol}22;color:${textCol};font-size:11px;font-weight:700;padding:2px 8px;border-radius:10px;border:1px solid ${textCol}44">${members.length}명</span>
      </div>
      <div style="background:${lightCol};padding:10px 12px;display:flex;flex-wrap:wrap;gap:8px">
        ${members.map(p => _b2PlayerChipTier(p, col)).join('')}
      </div>
    </div>`;
}

function _b2PlayerChip(p, univCol) {
  const raceIcon = {'T':'🤖','Z':'🐛','P':'✨','N':'❓'}[p.race]||'';
  const tierCol = getTierBtnColor(p.tier||'');
  const roleIcon = ROLE_ICONS[p.role]||'';
  const iconUrl = _b2PlayerIconURL(p);
  return `
    <div onclick="openPlayerModal('${(p.name||'').replace(/'/g,"\\'")}')"
      style="display:flex;align-items:center;gap:6px;padding:5px 10px 5px 6px;border-radius:20px;background:var(--white);border:1.5px solid ${univCol}55;cursor:pointer;box-shadow:0 1px 4px #0001;transition:transform .12s,box-shadow .12s"
      onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 4px 12px ${univCol}44'"
      onmouseout="this.style.transform='';this.style.boxShadow='0 1px 4px #0001'">
      ${iconUrl
        ? `<img src="${iconUrl}" style="width:28px;height:28px;border-radius:50%;object-fit:cover;border:2px solid ${univCol}88;flex-shrink:0" onerror="this.outerHTML='${_b2RaceAvatarSVG(p.race, univCol)}'">`
        : _b2RaceAvatarSVG(p.race, univCol)}
      <div style="display:flex;flex-direction:column;gap:1px">
        <div style="font-weight:700;font-size:12px;color:var(--text1);line-height:1.2">${roleIcon?roleIcon+' ':''}${p.name||''}</div>
        <div style="display:flex;align-items:center;gap:3px">
          <span style="font-size:10px;color:var(--text3)">${raceIcon}</span>
          <span style="font-size:9px;font-weight:700;padding:1px 5px;border-radius:6px;background:${tierCol};color:${getTierBtnTextColor(p.tier||'')||'#fff'}">${p.tier||'?'}</span>
        </div>
      </div>
    </div>`;
}

function _b2PlayerChipTier(p, tierCol) {
  const raceIcon = {'T':'🤖','Z':'🐛','P':'✨','N':'❓'}[p.race]||'';
  const univCol = gc(p.univ||'');
  const roleIcon = ROLE_ICONS[p.role]||'';
  const iconUrl = _b2PlayerIconURL(p);
  return `
    <div onclick="openPlayerModal('${(p.name||'').replace(/'/g,"\\'")}')"
      style="display:flex;align-items:center;gap:6px;padding:5px 10px 5px 6px;border-radius:20px;background:var(--white);border:1.5px solid ${tierCol}55;cursor:pointer;box-shadow:0 1px 4px #0001;transition:transform .12s,box-shadow .12s"
      onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 4px 12px ${tierCol}44'"
      onmouseout="this.style.transform='';this.style.boxShadow='0 1px 4px #0001'">
      ${iconUrl
        ? `<img src="${iconUrl}" style="width:28px;height:28px;border-radius:50%;object-fit:cover;border:2px solid ${univCol}88;flex-shrink:0" onerror="this.outerHTML='${_b2RaceAvatarSVG(p.race, univCol)}'">`
        : _b2RaceAvatarSVG(p.race, univCol)}
      <div style="display:flex;flex-direction:column;gap:1px">
        <div style="font-weight:700;font-size:12px;color:var(--text1);line-height:1.2">${roleIcon?roleIcon+' ':''}${p.name||''}</div>
        <div style="display:flex;align-items:center;gap:3px">
          <span style="font-size:10px">${raceIcon}</span>
          <span style="font-size:9px;font-weight:700;padding:1px 5px;border-radius:6px;background:${univCol};color:#fff">${p.univ||'?'}</span>
        </div>
      </div>
    </div>`;
}

function _b2PlayerIconURL(p) {
  return (p.icon||p.img||p.avatar||p.photo||'').trim();
}

function _b2UnivIconHTML(univName) {
  const u = univCfg.find(x => x.name === univName);
  return (u && (u.icon||u.img)) ? (u.icon||u.img) : (UNIV_ICONS[univName]||'');
}

function _b2RaceAvatarSVG(race, col) {
  const letter = {'T':'T','Z':'Z','P':'P','N':'?'}[race]||'?';
  const safe = (col||'#64748b').replace(/#/,'%23');
  return `<span style="width:28px;height:28px;border-radius:50%;background:${col||'#64748b'};display:inline-flex;align-items:center;justify-content:center;font-weight:900;font-size:12px;color:#fff;flex-shrink:0;border:2px solid ${col||'#64748b'}88">${letter}</span>`;
}

function _b2ContrastColor(hex) {
  try {
    const c = hex.replace('#','');
    const r = parseInt(c.slice(0,2),16), g = parseInt(c.slice(2,4),16), b = parseInt(c.slice(4,6),16);
    return (r*299+g*587+b*114)/1000 > 128 ? '#1e293b' : '#ffffff';
  } catch(e){ return '#ffffff'; }
}
