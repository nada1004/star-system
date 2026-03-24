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

/* ── 대학별 뷰 (컬러 행 로스터) ── */
function _b2UnivView() {
  const univList = _b2VisUnivs().filter(u => u.name !== '무소속');
  if (!univList.length) return `<div style="text-align:center;color:var(--text3);padding:40px">표시할 대학이 없습니다</div>`;
  let h = `<div style="display:flex;flex-direction:column;gap:3px">`;
  univList.forEach(u => {
    const col = gc(u.name);
    const textCol = _b2ContrastColor(col);
    const lightCol = col + '18';
    const uCfg = univCfg.find(x => x.name === u.name) || {};
    const iconUrl = uCfg.icon || uCfg.img || UNIV_ICONS[u.name] || '';
    const members = players.filter(p => p.univ === u.name && !p.hidden && !p.retired);
    // 직책→티어→이름 순 정렬
    const roled = members.filter(p => _B2_ROLE_ORDER.includes(p.role||''));
    roled.sort((a,b) => _b2RoleRank(a) - _b2RoleRank(b));
    const normal = members.filter(p => !_B2_ROLE_ORDER.includes(p.role||''));
    normal.sort((a,b) => TIERS.indexOf(a.tier||'미정') - TIERS.indexOf(b.tier||'미정') || (a.name||'').localeCompare(b.name||''));
    const sorted = [...roled, ...normal];
    const chips = sorted.map(p => {
      const raceShort = {'T':'T','Z':'Z','P':'P'}[p.race||''] || '?';
      const tierCol = getTierBtnColor(p.tier||'');
      const tierTextCol = getTierBtnTextColor(p.tier||'') || '#fff';
      const avatarHtml = p.photo
        ? `<img src="${p.photo}" style="width:22px;height:22px;border-radius:50%;object-fit:cover;flex-shrink:0;border:1.5px solid rgba(255,255,255,.7)" onerror="this.style.display='none'">`
        : `<span style="width:22px;height:22px;border-radius:50%;background:${col};display:inline-flex;align-items:center;justify-content:center;font-size:9px;font-weight:900;color:${textCol};flex-shrink:0;border:1.5px solid rgba(255,255,255,.5)">${raceShort}</span>`;
      const badge = p.role
        ? `<span style="font-size:9px;font-weight:700;padding:1px 4px;border-radius:3px;background:${col};color:${textCol};flex-shrink:0">${p.role}</span>`
        : `<span style="font-size:9px;font-weight:700;padding:1px 4px;border-radius:3px;background:${tierCol};color:${tierTextCol};flex-shrink:0">${p.tier||'?'}</span>`;
      return `<div onclick="openPlayerModal('${(p.name||'').replace(/'/g,"\\'")}')"
        style="display:inline-flex;align-items:center;gap:4px;padding:3px 7px 3px 3px;border-radius:20px;cursor:pointer;background:rgba(255,255,255,.75);border:1px solid rgba(255,255,255,.85);white-space:nowrap;transition:transform .1s"
        onmouseover="this.style.transform='translateY(-1px)'" onmouseout="this.style.transform=''">
        ${avatarHtml}
        <span style="font-weight:700;font-size:12px;color:#1e293b;${p.inactive?'opacity:.55':''}">${p.name||''}</span>
        ${badge}
      </div>`;
    }).join('');
    h += `<div style="display:flex;align-items:stretch;border-radius:8px;overflow:hidden;min-height:46px">
      <div onclick="if(typeof openUnivModal==='function')openUnivModal('${u.name}')" title="대학 상세"
        style="background:${col};min-width:110px;width:110px;display:flex;align-items:center;gap:6px;padding:7px 10px 7px 12px;flex-shrink:0;cursor:pointer">
        ${iconUrl?`<img src="${iconUrl}" style="width:22px;height:22px;border-radius:50%;object-fit:cover;flex-shrink:0;border:1.5px solid ${textCol}44" onerror="this.style.display='none'">`:''}
        <div style="min-width:0;flex:1">
          <div style="font-weight:900;font-size:12px;color:${textCol};line-height:1.2;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${u.name}</div>
          <div style="font-size:10px;color:${textCol}aa;font-weight:600">${members.length}명</div>
        </div>
      </div>
      <div style="background:${lightCol};flex:1;display:flex;align-items:center;flex-wrap:wrap;gap:4px;padding:5px 10px">
        ${chips||`<span style="font-size:11px;color:var(--gray-l)">등록된 선수 없음</span>`}
      </div>
    </div>`;
  });
  h += `</div>`;
  return h;
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
      ${p.inactive?'<span style="font-size:9px;background:#fff7ed;color:#9a3412;border-radius:4px;padding:1px 4px;font-weight:700;flex-shrink:0">⏸️</span>':''}
    </div>`;
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
      ${_b2Avatar(p, accentCol, 40)}
      <span class="b2name" style="font-weight:700;font-size:16px;color:var(--text1);transition:color .1s;${p.inactive?'opacity:.6':''}">${p.name||''}</span>
      ${p.inactive?'<span style="font-size:9px;background:#fff7ed;color:#9a3412;border-radius:4px;padding:1px 4px;font-weight:700;flex-shrink:0">⏸️</span>':''}
      ${race ? `<span style="font-size:12px;color:var(--text3)">${race}</span>` : ''}
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

function _b2ContrastColor(hex) {
  try {
    const c = (hex||'').replace('#','');
    const r = parseInt(c.slice(0,2),16), g = parseInt(c.slice(2,4),16), b = parseInt(c.slice(4,6),16);
    return (r*299+g*587+b*114)/1000 > 128 ? '#1e293b' : '#ffffff';
  } catch(e){ return '#ffffff'; }
}
