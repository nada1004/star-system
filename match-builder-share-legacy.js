/* ══════════════════════════════════════
   Match Builder Legacy Share Renders
══════════════════════════════════════ */

function renderIndShareCard(p1, p2, p1wins, p2wins, date, winner, ids) {
  const card = document.getElementById('share-card');
  if (!card) return;
  const pp1 = players.find(x => x.name === p1) || {};
  const pp2 = players.find(x => x.name === p2) || {};
  const col1 = gc(pp1.univ || '') || '#0ea5e9';
  const col2 = gc(pp2.univ || '') || '#6366f1';
  const scp=(typeof window._getShareCardPrefs==='function'?window._getShareCardPrefs():{mode:'campus',color:.72,fx:.55,surface:'glass'});
  const _pf = scp.profileScale || 1;
  const _ff = scp.fontScale || 1;
  const _darkCard = scp.mode==='dark' || scp.mode==='poster';
  const _scoreColor = (hex, isWinner) => {
    const base = String(hex||'#64748b');
    if(typeof window._scMixHex==='function'){
      return isWinner ? window._scMixHex(base,'#ffffff',.34) : window._scMixHex(base,'#cbd5e1',.72);
    }
    return isWinner ? base : '#94a3b8';
  };

  const games = ids
    ? indM.filter(m => ids.includes(m._id))
    : indM.filter(m => {
        const pair = [m.wName, m.lName].sort();
        const pair2 = [p1, p2].sort();
        return (m.d||'') === date && pair[0] === pair2[0] && pair[1] === pair2[1];
      });

  const WC = '#111827';
  const LC = '#94a3b8';

  const raceLabel = r => r==='T'?'테란':r==='Z'?'저그':r==='P'?'프로토스':'';
  const ct = t => t ? t.replace(/티어$/,'') : '';
  const univLogo = (univ, col) => univ ? `<span style="display:inline-flex;align-items:center;justify-content:center;width:18px;height:18px;border-radius:6px;background:${col}22;border:1px solid ${col}44;overflow:hidden;flex-shrink:0">${typeof gUI==='function'?gUI(univ,'12px'):''}</span>` : '';
  const profileBlock = (name, pObj, size, extra='') => {
    const bg = gc(pObj.univ||'')||'#94a3b8';
    const initial = String(name||'?').charAt(0);
    return `<span style="position:relative;width:${size};height:${size};border-radius:var(--su_profile_radius,50%);background:${bg};display:inline-flex;align-items:center;justify-content:center;color:#fff;font-weight:900;overflow:hidden;${extra}">
      <span style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:900">${initial}</span>
      ${pObj && pObj.photo ? `<img src="${toHttpsUrl(pObj.photo)}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block" onerror="this.remove()">` : ''}
    </span>`;
  };

  const playerInfoBlock = (name, pObj, isWinner, side) => {
    const uCol = gc(pObj.univ||'') || (isWinner ? '#0ea5e9' : '#94a3b8');
    const photo = profileBlock(name, pObj, '72px', `border:3px solid ${uCol};box-shadow:${isWinner?`0 6px 18px ${uCol}55`:'0 2px 8px rgba(0,0,0,.07)'};${!isWinner&&winner?'opacity:.65;filter:grayscale(.2)':''}`);
    const race = raceLabel(pObj.race||'');
    const tier = pObj.tier ? `<span style="background:${getTierBtnColor(pObj.tier)||'#64748b'};color:${getTierBtnTextColor(pObj.tier)||'#fff'};font-size:9px;font-weight:700;padding:1px 5px;border-radius:4px">${ct(pObj.tier)}</span>` : '';
    const raceSpan = race ? `<span style="font-size:9px;color:#94a3b8;font-weight:800">${race}</span>` : '';
    const isRight = side === 'right';
    const teamLine = pObj.univ ? `<div style="display:flex;align-items:center;justify-content:${isRight?'flex-end':'flex-start'};gap:4px;margin-top:4px;min-width:0">${univLogo(pObj.univ||'', uCol)}<span style="font-size:10px;color:#475569;font-weight:800;line-height:1.2;white-space:normal;overflow-wrap:anywhere;word-break:keep-all">${pObj.univ}</span></div>` : '';
    return `<div style="flex:1;display:flex;align-items:center;gap:10px;flex-direction:${isRight?'row-reverse':'row'};background:${uCol}18;border:1px solid ${uCol}33;border-radius:16px;padding:10px 12px;min-width:0">
      <div style="flex-shrink:0;position:relative">
        ${photo}
        ${isWinner&&winner?`<div style="position:absolute;bottom:-2px;${isRight?'left:-2px':'right:-2px'};font-size:13px;filter:drop-shadow(0 1px 2px rgba(0,0,0,.2))">🏆</div>`:''}
      </div>
      <div style="text-align:${isRight?'right':'left'};flex:1;min-width:0">
        <div style="font-size:14px;font-weight:${isWinner?'1000':'800'};color:${isWinner?WC:'#334155'};line-height:1.18;white-space:normal;overflow-wrap:anywhere;word-break:keep-all">${name}</div>
        <div style="display:flex;align-items:center;justify-content:${isRight?'flex-end':'flex-start'};gap:4px;flex-wrap:wrap;margin-top:4px">${tier}${raceSpan}</div>
        ${teamLine}
      </div>
    </div>`;
  };

  const gameRows = games.map((m, gi) => {
    const p1win = m.wName === p1;
    const p1Photo = profileBlock(p1, pp1, '16px', `flex-shrink:0;${!p1win?'opacity:.35;filter:grayscale(.5)':''}`);
    const p2Photo = profileBlock(p2, pp2, '16px', `flex-shrink:0;${p1win?'opacity:.35;filter:grayscale(.5)':''}`);
    const mapTxt = m.map && m.map !== '-' ? `<span style="color:#94a3b8;font-size:9px;margin-left:2px">📍${m.map}</span>` : '';
    return `<div style="display:flex;align-items:center;gap:5px;padding:5px 8px;border-radius:8px;background:${p1win?`${col1}16`:`${col2}16`};border:1px solid ${p1win?`${col1}33`:`${col2}33`};margin-bottom:3px">
      <span style="font-size:9px;color:${p1win?col1:col2};min-width:26px;font-weight:700">${gi+1}G</span>
      <span style="display:inline-flex;align-items:center;gap:3px;flex:1;justify-content:flex-end">
        ${p1Photo}<span style="font-size:11px;font-weight:${p1win?'700':'400'};color:${p1win?WC:LC}">${p1}</span>
      </span>
      <span style="font-size:9px;color:#bae6fd;flex-shrink:0">vs</span>
      <span style="display:inline-flex;align-items:center;gap:3px;flex:1">
        ${p2Photo}<span style="font-size:11px;font-weight:${p1win?'400':'700'};color:${p1win?LC:WC}">${p2}</span>
      </span>
      ${mapTxt}
    </div>`;
  }).join('');

  const heroProfile = (name, pObj, side, isWinner) => {
    const uCol = gc(pObj.univ||'') || (side==='left'?col1:col2);
    const race = raceLabel(pObj.race||'');
    const tier = pObj.tier ? `<span style="background:${getTierBtnColor(pObj.tier)||'#64748b'};color:${getTierBtnTextColor(pObj.tier)||'#fff'};font-size:${Math.round(10*_ff)}px;font-weight:800;padding:2px 7px;border-radius:999px">${ct(pObj.tier)}</span>` : '';
    const _nameColor = isWinner ? (_darkCard ? '#ffffff' : '#111827') : (_darkCard ? 'rgba(255,255,255,.88)' : '#475569');
    const _metaColor = _darkCard ? 'rgba(255,255,255,.82)' : (isWinner?'#334155':'#64748b');
    const raceSpan = race ? `<span style="font-size:${Math.round(10*_ff)}px;color:${_metaColor};font-weight:700">${race}</span>` : '';
    const univ = pObj.univ ? `<div style="font-size:${Math.round(11*_ff)}px;color:${_metaColor};font-weight:800;display:flex;align-items:center;justify-content:${side==='left'?'flex-start':'flex-end'};gap:4px;line-height:1.25;white-space:normal;word-break:keep-all;overflow-wrap:anywhere">${univLogo(pObj.univ||'', uCol)}<span>${pObj.univ}</span></div>` : '';
    const lossFx = (!isWinner && winner) ? 'filter:grayscale(.15);opacity:.86;' : '';
    return `<div style="flex:1;display:flex;flex-direction:column;align-items:${side==='left'?'flex-start':'flex-end'};justify-content:center;min-width:0">
      <div style="position:relative;display:flex;flex-direction:column;align-items:${side==='left'?'flex-start':'flex-end'};gap:8px">
        ${profileBlock(name, pObj, `${Math.round(118*_pf)}px`, `border:4px solid rgba(255,255,255,.85);box-shadow:0 14px 34px rgba(15,23,42,.30);${lossFx}`)}
        ${isWinner&&winner?`<div style="position:absolute;top:-8px;${side==='left'?'right:-6px':'left:-6px'};width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,#facc15,#f59e0b);display:flex;align-items:center;justify-content:center;box-shadow:0 6px 16px rgba(0,0,0,.22);font-size:15px">🏆</div>`:''}
      </div>
      <div style="margin-top:10px;max-width:100%;text-align:${side==='left'?'left':'right'};display:flex;flex-direction:column;align-items:${side==='left'?'flex-start':'flex-end'};gap:6px">
        <div style="font-size:${Math.round(20*_ff)}px;font-weight:1000;line-height:1.14;color:${_nameColor};white-space:normal;overflow-wrap:anywhere;word-break:keep-all;max-width:150px;text-shadow:${_darkCard?'0 1px 10px rgba(0,0,0,.24)':'none'}">${name}</div>
        <div style="display:flex;align-items:center;justify-content:${side==='left'?'flex-start':'flex-end'};gap:6px;flex-wrap:wrap">${tier}${raceSpan}</div>
        ${univ}
        <div style="margin-top:6px;display:inline-flex;align-items:center;gap:6px;padding:5px 10px;border-radius:999px;background:${isWinner?`${uCol}16`:'#e2e8f0'};border:1px solid ${isWinner?`${uCol}33`:'#cbd5e1'};font-size:10px;font-weight:800;color:${isWinner?uCol:'#64748b'}">${isWinner?'🥇 승리':'패배'}</div>
      </div>
    </div>`;
  };

  const shellBg = scp.mode==='dark' ? 'linear-gradient(180deg,#0f172a,#111827)' : scp.mode==='aurora' ? `linear-gradient(160deg,${col1}22 0%,#f8fafc 42%,${col2}1f 100%)` : scp.mode==='poster' ? `linear-gradient(180deg,${typeof window._scMixHex==='function'?window._scMixHex(col1,'#111827',.28):col1},${typeof window._scMixHex==='function'?window._scMixHex(col2,'#111827',.28):col2})` : scp.mode==='mono' ? 'linear-gradient(180deg,#f3f4f6,#e5e7eb)' : `linear-gradient(135deg,${col1}12 0%,#f8fafc 36%,${col2}10 100%)`;
  const panelBg = scp.surface==='solid' ? '#ffffff' : 'rgba(255,255,255,.88)';
  const _cacheKey = `ind:${JSON.stringify({p1,p2,p1wins,p2wins,date,winner,ids})}`;
  const _html = `<div style="background:${shellBg};border-radius:26px;padding:16px;font-family:'Noto Sans KR',sans-serif;color:#111;overflow:hidden;position:relative;box-shadow:0 16px 44px rgba(15,23,42,.16)">
    <div style="position:relative;border-radius:24px;overflow:hidden;background:
      radial-gradient(circle at 18% 22%, ${col1}${Math.round(20+scp.color*20).toString(16).padStart(2,'0')}, transparent 28%),
      radial-gradient(circle at 82% 20%, ${col2}${Math.round(18+scp.color*18).toString(16).padStart(2,'0')}, transparent 30%),
      linear-gradient(135deg, #ffffff 0%, #f8fafc 46%, #eef2ff 100%);
      padding:18px 18px 20px;border:1px solid rgba(148,163,184,.16);box-shadow:inset 0 1px 0 rgba(255,255,255,.8)">
      <div style="position:absolute;top:-26px;right:-18px;width:140px;height:140px;border-radius:50%;background:linear-gradient(135deg,${col2}10,transparent);pointer-events:none"></div>
      <div style="position:absolute;bottom:-38px;left:-26px;width:150px;height:150px;border-radius:50%;background:linear-gradient(135deg,${col1}12,transparent);pointer-events:none"></div>
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;position:relative;z-index:1">
        <div style="font-size:11px;font-weight:900;color:${col1};background:linear-gradient(90deg,${col1}18,${col2}12);padding:5px 12px;border-radius:999px;border:1px solid ${col1}33">🎮 개인전</div>
        <div style="font-size:10px;color:#64748b;font-weight:700">${date||''}</div>
      </div>
      <div style="display:grid;grid-template-columns:minmax(0,1fr) auto minmax(0,1fr);align-items:center;gap:10px;position:relative;z-index:1">
        ${heroProfile(p1, pp1, 'left', p1===winner)}
        <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:4px 2px;min-width:88px">
          <div style="font-size:54px;font-weight:1000;line-height:1;letter-spacing:-3px;text-shadow:0 6px 16px rgba(148,163,184,.18)">
            <span style="color:${_scoreColor(col1, p1===winner)}">${p1wins}</span>
            <span style="color:#cbd5e1;font-size:26px;margin:0 2px">:</span>
            <span style="color:${_scoreColor(col2, p2===winner)}">${p2wins}</span>
          </div>
          <div style="margin-top:10px;font-size:11px;font-weight:900;letter-spacing:.8px;color:#64748b">MATCH RESULT</div>
        </div>
        ${heroProfile(p2, pp2, 'right', p2===winner)}
      </div>
    </div>
    ${games.length ? `<div style="margin-top:14px;background:${panelBg};border-radius:18px;padding:12px 12px 10px;border:1px solid rgba(148,163,184,.18);box-shadow:0 10px 24px rgba(15,23,42,.06);backdrop-filter:${scp.surface==='glass'?'blur(10px)':'none'}">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:9px">
        <div style="font-size:11px;color:#475569;font-weight:900">세트 기록</div>
        <div style="font-size:10px;color:#94a3b8;font-weight:800">${games.length}경기</div>
      </div>
      ${gameRows}
    </div>` : ''}
    <div style="margin-top:12px;display:flex;justify-content:flex-end">
      <span style="font-size:9px;color:#94a3b8;letter-spacing:.3px;font-weight:800">⭐ 스타대학 데이터 센터</span>
    </div>
  </div>`;
  if(typeof window._shareCardRenderCached==='function') window._shareCardRenderCached(card, _cacheKey, ()=>_html);
  else card.innerHTML = _html;
}

function renderGJShareCard(p1, p2, p1wins, p2wins, date, winner, opts) {
  const card = document.getElementById('share-card');
  if (!card) return;
  const proOnly = !!(opts && opts.proOnly);
  const pp1 = players.find(x => x.name === p1) || {};
  const pp2 = players.find(x => x.name === p2) || {};
  const col1 = proOnly ? '#1d4ed8' : gc(pp1.univ || '');
  const col2 = proOnly ? '#7c3aed' : gc(pp2.univ || '');
  const scp=(typeof window._getShareCardPrefs==='function'?window._getShareCardPrefs():{mode:'campus',color:.72,fx:.55,surface:'glass'});
  const _pf = scp.profileScale || 1;
  const _ff = scp.fontScale || 1;
  const _darkCard = (!proOnly) || scp.mode==='dark' || scp.mode==='poster';
  const _scoreColor = (hex, isWinner) => {
    const base = String(hex||'#64748b');
    if(typeof window._scMixHex==='function'){
      return isWinner ? window._scMixHex(base,'#ffffff', proOnly ? .18 : .42) : window._scMixHex(base,'#cbd5e1', proOnly ? .74 : .82);
    }
    return isWinner ? base : '#94a3b8';
  };

  const pair = [p1, p2].sort();
  const games = gjM.filter(m => {
    const mp = [m.wName, m.lName].sort();
    return (m.d||'') === date && mp[0] === pair[0] && mp[1] === pair[1] && (!!m._proLabel===proOnly);
  });

  const WC = '#111';
  const LC = '#94a3b8';

  const raceLabel = r => r==='T'?'테란':r==='Z'?'저그':r==='P'?'프로토스':'';
  const ct = t => t ? t.replace(/티어$/,'') : '';
  const univLogo = (univ, col) => univ ? `<span style="display:inline-flex;align-items:center;justify-content:center;width:18px;height:18px;border-radius:6px;background:${col}22;border:1px solid ${col}44;overflow:hidden;flex-shrink:0">${typeof gUI==='function'?gUI(univ,'12px'):''}</span>` : '';
  const profileBlock = (name, pObj, size, extra='') => {
    const bg = gc(pObj.univ||'')||'#94a3b8';
    const initial = String(name||'?').charAt(0);
    return `<span style="position:relative;width:${size};height:${size};border-radius:var(--su_profile_radius,50%);background:${bg};display:inline-flex;align-items:center;justify-content:center;color:#fff;font-weight:900;overflow:hidden;${extra}">
      <span style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:900">${initial}</span>
      ${pObj && pObj.photo ? `<img src="${toHttpsUrl(pObj.photo)}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block" onerror="this.remove()">` : ''}
    </span>`;
  };
  const playerInfoBlock = (name, pObj, isWinner, side) => {
    const uCol = gc(pObj.univ||'') || (isWinner ? '#a855f7' : '#94a3b8');
    const paneBg = proOnly ? `${uCol}14` : 'rgba(255,255,255,.08)';
    const paneBd = proOnly ? `${uCol}26` : 'rgba(255,255,255,.14)';
    const photoShadow = isWinner ? `0 6px 18px ${uCol}44` : '0 2px 8px rgba(0,0,0,.07)';
    const photoLossFx = (!isWinner&&winner) ? 'opacity:.86;filter:grayscale(.12);' : '';
    const photo = profileBlock(name, pObj, `${Math.round(112*_pf)}px`, `border:3px solid ${uCol};box-shadow:${photoShadow};${photoLossFx}`);
    const race = raceLabel(pObj.race||'');
    const tier = pObj.tier ? `<span style="background:${getTierBtnColor(pObj.tier)||'#64748b'};color:${getTierBtnTextColor(pObj.tier)||'#fff'};font-size:${Math.round(10*_ff)}px;font-weight:800;padding:2px 6px;border-radius:999px">${ct(pObj.tier)}</span>` : '';
    const _nameColor = isWinner ? (_darkCard ? '#ffffff' : '#111827') : (_darkCard ? 'rgba(255,255,255,.88)' : '#334155');
    const _metaColor = _darkCard ? 'rgba(255,255,255,.84)' : '#475569';
    const raceSpan = race ? `<span style="font-size:${Math.round(10*_ff)}px;color:${_metaColor};font-weight:800">${race}</span>` : '';
    const isRight = side === 'right';
    const alignText = isRight ? 'right' : 'left';
    const justify = isRight ? 'flex-end' : 'flex-start';
    const winBadge = (isWinner&&winner) ? `<div style="position:absolute;bottom:-2px;${isRight?'left:-2px':'right:-2px'};font-size:13px;filter:drop-shadow(0 1px 2px rgba(0,0,0,.2))">🏆</div>` : '';
    const teamLine = pObj.univ ? `<div style="display:flex;align-items:center;justify-content:${justify};gap:4px;min-width:0">${univLogo(pObj.univ||'', uCol)}<span style="font-size:${Math.round(11*_ff)}px;color:${_metaColor};font-weight:800;line-height:1.25;white-space:normal;overflow-wrap:anywhere;word-break:keep-all">${pObj.univ}</span></div>` : '';
    return `<div style="flex:1;display:flex;flex-direction:column;align-items:${isRight?'flex-end':'flex-start'};gap:10px;background:${paneBg};border:1px solid ${paneBd};border-radius:16px;padding:14px 12px;min-width:0;backdrop-filter:${proOnly?'none':'blur(10px)'}">
      <div style="flex-shrink:0;position:relative">
        ${photo}
        ${winBadge}
      </div>
      <div style="text-align:${alignText};width:100%;min-width:0;display:flex;flex-direction:column;align-items:${isRight?'flex-end':'flex-start'};gap:6px">
        <div style="font-size:${Math.round(18*_ff)}px;font-weight:${isWinner?'1000':'800'};color:${_nameColor};line-height:1.16;white-space:normal;overflow-wrap:anywhere;word-break:keep-all;max-width:150px;text-shadow:${_darkCard?'0 1px 10px rgba(0,0,0,.24)':'none'}">${name}</div>
        <div style="display:flex;align-items:center;justify-content:${justify};gap:4px;flex-wrap:wrap">${tier}${raceSpan}</div>
        ${teamLine}
      </div>
    </div>`;
  };

  const gameRows = games.map((m, gi) => {
    const p1win = m.wName === p1;
    const p1Photo = profileBlock(p1, pp1, '16px', `flex-shrink:0;${!p1win?'opacity:.35;filter:grayscale(.5)':''}`);
    const p2Photo = profileBlock(p2, pp2, '16px', `flex-shrink:0;${p1win?'opacity:.35;filter:grayscale(.5)':''}`);
    const mapTxt = m.map && m.map !== '-' ? `<span style="color:#94a3b8;font-size:9px;margin-left:2px">📍${m.map}</span>` : '';
    return `<div style="display:flex;align-items:center;gap:5px;padding:5px 8px;border-radius:8px;background:${p1win?`${col1}16`:`${col2}16`};border:1px solid ${p1win?`${col1}33`:`${col2}33`};margin-bottom:3px">
      <span style="font-size:9px;color:${p1win?col1:col2};min-width:26px;font-weight:700">${gi+1}G</span>
      <span style="display:inline-flex;align-items:center;gap:3px;flex:1;justify-content:flex-end">
        ${p1Photo}<span style="font-size:11px;font-weight:${p1win?'700':'400'};color:${p1win?WC:LC}">${p1}</span>
      </span>
      <span style="font-size:9px;color:#ddd6fe;flex-shrink:0">vs</span>
      <span style="display:inline-flex;align-items:center;gap:3px;flex:1">
        ${p2Photo}<span style="font-size:11px;font-weight:${p1win?'400':'700'};color:${p1win?LC:WC}">${p2}</span>
      </span>
      ${mapTxt}
    </div>`;
  }).join('');

  const gjBg = proOnly
    ? 'linear-gradient(135deg,#eef4ff 0%,#ffffff 36%,#f5f3ff 100%)'
    : `linear-gradient(135deg,${col1} 0%, ${typeof window._scMixHex==='function'?window._scMixHex(col1,'#0f172a',.34):'#0f172a'} 46%, ${col2} 100%)`;
  const _cacheKey = `gj:${JSON.stringify({p1,p2,p1wins,p2wins,date,winner,proOnly})}`;
  const _html = `<div style="background:${gjBg};border-radius:24px;padding:20px 18px;font-family:'Noto Sans KR',sans-serif;color:${proOnly?'#111':'#fff'};overflow:hidden;position:relative;box-shadow:0 14px 42px rgba(15,23,42,.22)">
    <div style="position:absolute;top:0;left:0;right:0;height:5px;background:linear-gradient(90deg,${col1},${col2});border-radius:22px 22px 0 0"></div>
    <div style="position:absolute;top:-40px;right:-40px;width:160px;height:160px;border-radius:50%;background:linear-gradient(135deg,${col2}20,transparent);pointer-events:none"></div>
    <div style="position:absolute;bottom:-30px;left:-30px;width:110px;height:110px;border-radius:50%;background:linear-gradient(135deg,${col1}18,transparent);pointer-events:none"></div>
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;margin-top:4px">
      <div style="font-size:11px;font-weight:900;color:${proOnly?col1:'#fff'};background:${proOnly?'linear-gradient(90deg,#dbeafe,#ede9fe)':'rgba(255,255,255,.10)'};padding:5px 12px;border-radius:999px;border:1.5px solid ${proOnly?'#bfdbfe':'rgba(255,255,255,.16)'};backdrop-filter:${proOnly?'none':'blur(10px)'}">${proOnly?'🏅 프로리그 끝장전':'⚔️ 끝장전'}</div>
      <div style="font-size:10px;color:${proOnly?col2:'rgba(255,255,255,.74)'};font-weight:700">${date||''}</div>
    </div>
    <div style="display:flex;align-items:stretch;gap:10px;margin-bottom:${games.length?'14':'0'}px">
      ${playerInfoBlock(p1, pp1, p1===winner, 'left')}
      <div style="text-align:center;flex-shrink:0;padding:10px 2px 0;min-width:80px">
        <div style="font-size:46px;font-weight:900;line-height:1;letter-spacing:-2px;text-shadow:${proOnly?'none':'0 10px 24px rgba(0,0,0,.25)'}">
          <span style="color:${_scoreColor(col1, p1===winner)}">${p1wins}</span>
          <span style="color:${proOnly?'#cbd5e1':'rgba(255,255,255,.38)'};font-size:22px;margin:0 1px">:</span>
          <span style="color:${_scoreColor(col2, p2===winner)}">${p2wins}</span>
        </div>
        ${winner?`<div style="font-size:8px;background:linear-gradient(90deg,${col1},${col2});-webkit-background-clip:text;-webkit-text-fill-color:transparent;font-weight:800;margin-top:5px;letter-spacing:1px">WIN</div>`:''}
      </div>
      ${playerInfoBlock(p2, pp2, p2===winner, 'right')}
    </div>
    ${games.length ? `<div style="background:${proOnly?'rgba(255,255,255,.7)':(scp.surface==='solid'?'rgba(255,255,255,.12)':'rgba(255,255,255,.08)')};backdrop-filter:blur(${proOnly||scp.surface==='glass'?'10px':'0px'});border-radius:16px;padding:10px;border:1px solid ${proOnly?'rgba(196,181,253,.3)':'rgba(255,255,255,.14)'}">
      <div style="font-size:9px;color:${proOnly?'#a78bfa':'rgba(255,255,255,.72)'};font-weight:800;margin-bottom:8px;letter-spacing:.7px">경기 상세</div>
      ${gameRows}
    </div>` : ''}
    <div style="margin-top:12px;text-align:right;font-size:8px;color:${proOnly?'#c4b5fd':'rgba(255,255,255,.36)'};letter-spacing:.3px">⭐ 스타대학 데이터 센터</div>
  </div>`;
  if(typeof window._shareCardRenderCached==='function') window._shareCardRenderCached(card, _cacheKey, ()=>_html);
  else card.innerHTML = _html;
}
