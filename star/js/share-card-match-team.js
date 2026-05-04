/* ══════════════════════════════════════
   Share Card Match Team
══════════════════════════════════════ */
function __shareCardUnivIconHTML(name, size){
  const url=UNIV_ICONS[name]||(univCfg.find(x=>x.name===name)||{}).icon||'';
  const s=size||'40px';
  if(url) return `<img src="${toHttpsUrl(url)}" style="width:${s};height:${s};object-fit:contain" onerror="this.outerHTML='<svg xmlns=\\'http://www.w3.org/2000/svg\\' viewBox=\\'0 0 24 24\\' fill=\\'white\\' width=\\'${s}\\' height=\\'${s}\\'><path d=\\'M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z\\'/></svg>'">`;
  return `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white' width='${s}' height='${s}'><path d='M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z'/></svg>`;
}

function __shareCardTeamMembers(ctx, side){
  const { m } = ctx;
  const arr = side==='A' ? (m.teamAMembers||[]) : (m.teamBMembers||[]);
  if(Array.isArray(arr) && arr.length) return arr;
  const uniq = new Map();
  (Array.isArray(m.sets)?m.sets:[]).forEach(s=>{
    (Array.isArray(s&&s.games)?s.games:[]).forEach(g=>{
      const name = String(side==='A' ? ((g&&g.playerA)||'') : ((g&&g.playerB)||'')).trim();
      if(!name || uniq.has(name)) return;
      const p = statsP(name) || { name };
      uniq.set(name, { ...p, name });
    });
  });
  return [...uniq.values()];
}

function __shareCardPickTeamSpotlight(ctx, side){
  if(!ctx.__teamSpotlight) ctx.__teamSpotlight = {};
  if(ctx.__teamSpotlight[side]) return ctx.__teamSpotlight[side];
  const arr = __shareCardTeamMembers(ctx, side);
  if(!arr.length) return null;
  const idx = Math.floor(Math.random() * arr.length);
  ctx.__teamSpotlight[side] = arr[idx] || arr[0] || null;
  return ctx.__teamSpotlight[side];
}

function __shareCardPickTeamRep(ctx, side){
  const { m } = ctx;
  const arr = __shareCardTeamMembers(ctx, side);
  if(!Array.isArray(arr) || !arr.length) return null;
  const byName = new Map(arr.map(x=>[String((x&&x.name)||'').trim(), x]).filter(([n])=>!!n));
  const sets = Array.isArray(m.sets) ? m.sets : [];
  const lastSet = sets.length ? sets[sets.length-1] : null;
  const lastGames = Array.isArray(lastSet && lastSet.games) ? lastSet.games : [];
  for(const g of lastGames){
    const aceName = String(side==='A' ? ((g && g.playerA) || '') : ((g && g.playerB) || '')).trim();
    if(aceName && byName.has(aceName)) return { ...(byName.get(aceName)||{}), __repReason:'ace' };
  }
  const winCount = new Map();
  sets.forEach(s=>{
    (Array.isArray(s&&s.games)?s.games:[]).forEach(g=>{
      const winnerSide = String((g&&g.winner)||'').trim();
      const winnerName = String(winnerSide===side ? (side==='A' ? g.playerA : g.playerB) : '').trim();
      if(!winnerName) return;
      winCount.set(winnerName, (winCount.get(winnerName)||0)+1);
    });
  });
  let bestName = '', bestWins = -1;
  winCount.forEach((wins, name)=>{ if(wins > bestWins){ bestWins = wins; bestName = name; } });
  if(bestName && byName.has(bestName)) return { ...(byName.get(bestName)||{}), __repReason:'wins', __repWins:bestWins };
  return arr.find(x=>x && (x.name || x.univ || x.photo)) || arr[0] || null;
}

function __shareCardTeamRepNote(ctx, side){
  return '';
}

function __shareCardTeamLineupSummary(ctx, side){
  return '';
}

function __shareCardTeamRepIconHTML(ctx, side, win){
  const { _vp, caRgb, cbRgb } = ctx;
  const rep = __shareCardPickTeamSpotlight(ctx, side) || __shareCardPickTeamRep(ctx, side);
  const sOuter = _vp.narrow ? '66px' : '80px';
  const rgb = side==='A' ? caRgb : cbRgb;
  const ring = win ? 'box-shadow:0 0 0 3px rgba(255,255,255,.85),0 6px 22px rgba(0,0,0,.32);' : 'opacity:.72;box-shadow:0 0 0 2px rgba(255,255,255,.2);';
  const allMembers = __shareCardTeamMembers(ctx, side);
  const fallbackUniv = String((rep&&rep.univ) || (allMembers.find(x=>x&&x.univ)||{}).univ || '').trim();
  if(rep && rep.name){
    const p = statsP(rep.name) || rep;
    if(p && p.photo){
      return `<div style="position:relative;width:${sOuter};height:${sOuter};border-radius:var(--su_profile_radius,50%);margin:0 auto 9px;overflow:hidden;${ring}">
        <img src="${toHttpsUrl(p.photo)}" style="width:100%;height:100%;object-fit:cover;object-position:center top" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
        <div style="display:none;position:absolute;inset:0;border-radius:16px;background:rgba(${rgb},.22);align-items:center;justify-content:center;border:2px solid rgba(255,255,255,.35);overflow:hidden;${win?'box-shadow:0 4px 20px rgba(0,0,0,.25);':''}">
          ${__shareCardUnivIconHTML(p.univ||'', '44px')}
        </div>
      </div>`;
    }
    if(p && p.univ){
      return `<div style="width:${_vp.narrow?'50px':'58px'};height:${_vp.narrow?'50px':'58px'};border-radius:16px;background:${win?`rgba(${rgb},.38)`:`rgba(${rgb},.14)`};margin:0 auto 8px;display:flex;align-items:center;justify-content:center;${win?'box-shadow:0 4px 20px rgba(0,0,0,.25);border:2px solid rgba(255,255,255,.55);':'opacity:.72;'}overflow:hidden">
        ${__shareCardUnivIconHTML(p.univ,_vp.narrow?'34px':'40px')}
      </div>`;
    }
  }
  if(fallbackUniv){
    return `<div style="width:${_vp.narrow?'50px':'58px'};height:${_vp.narrow?'50px':'58px'};border-radius:16px;background:${win?`rgba(${rgb},.38)`:`rgba(${rgb},.14)`};margin:0 auto 8px;display:flex;align-items:center;justify-content:center;${win?'box-shadow:0 4px 20px rgba(0,0,0,.25);border:2px solid rgba(255,255,255,.55);':'opacity:.72;'}overflow:hidden">
      ${__shareCardUnivIconHTML(fallbackUniv,_vp.narrow?'34px':'40px')}
    </div>`;
  }
  return `<div style="width:${_vp.narrow?'50px':'58px'};height:${_vp.narrow?'50px':'58px'};border-radius:16px;background:${win?`rgba(${rgb},.38)`:`rgba(${rgb},.14)`};margin:0 auto 8px;display:flex;align-items:center;justify-content:center;${win?'box-shadow:0 4px 20px rgba(0,0,0,.25);border:2px solid rgba(255,255,255,.55);':'opacity:.72;'}overflow:hidden;color:#fff;font-weight:1000;font-size:${_vp.narrow?'18px':'22px'}">${side}</div>`;
}

function __shareCardTeamMiniMemberCell(ctx, side, mem, idx){
  const { _vp, ca, cb, caRgb, cbRgb } = ctx;
  const p = mem && mem.name ? (statsP(mem.name) || mem) : (mem || {});
  const rgb = side==='A' ? caRgb : cbRgb;
  const name = String((p && p.name) || '').trim() || `${idx+1}번`;
  const race = String((p && p.race) || '').trim();
  const univ = String((p && p.univ) || '').trim();
  let icon = '';
  if(p && p.photo){
    icon = `<img src="${toHttpsUrl(p.photo)}" style="width:28px;height:28px;border-radius:var(--su_profile_radius,50%);object-fit:cover;object-position:center top;border:1.5px solid rgba(255,255,255,.55)" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"><div style="display:none;width:28px;height:28px;border-radius:10px;background:rgba(${rgb},.22);align-items:center;justify-content:center;border:1.5px solid rgba(255,255,255,.35);overflow:hidden">${__shareCardUnivIconHTML(univ,'18px')}</div>`;
  }else{
    icon = `<div style="width:28px;height:28px;border-radius:10px;background:rgba(${rgb},.22);display:flex;align-items:center;justify-content:center;border:1.5px solid rgba(255,255,255,.35);overflow:hidden">${univ ? __shareCardUnivIconHTML(univ,'18px') : `<span style="color:#fff;font-weight:1000;font-size:11px">${name.slice(0,1)}</span>`}</div>`;
  }
  return `<div style="min-width:0;padding:${_vp.narrow?'6px 5px':'7px 6px'};border-radius:12px;background:linear-gradient(180deg, rgba(255,255,255,.14), rgba(255,255,255,.08));border:1px solid rgba(255,255,255,.16);display:flex;flex-direction:column;align-items:center;gap:4px;box-shadow:inset 0 1px 0 rgba(255,255,255,.08)">
    <div style="display:flex;align-items:center;justify-content:center">${icon}</div>
    <div style="font-size:${_vp.narrow?'9px':'10px'};font-weight:900;color:#fff;max-width:100%;white-space:${_vp.tiny?'normal':'nowrap'};overflow:hidden;text-overflow:ellipsis;line-height:1.18;text-align:center;word-break:keep-all">${name}</div>
    <div style="display:flex;align-items:center;gap:3px;min-height:14px;justify-content:center;max-width:100%">
      ${race ? `<span class="rbadge r${race}" style="font-size:8px;padding:0 5px;line-height:14px;border-radius:999px">${race}</span>` : ''}
      ${univ ? `<span style="font-size:8px;color:rgba(255,255,255,.68);max-width:${_vp.narrow?'42px':'54px'};white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${univ}</span>` : ''}
    </div>
  </div>`;
}

function __shareCardTeamRosterPanel(ctx, side, win){
  const { _vp, caRgb, cbRgb, _dispA, _dispB } = ctx;
  const arr = __shareCardTeamMembers(ctx, side);
  const label = side==='A' ? _dispA : _dispB;
  const rgb = side==='A' ? caRgb : cbRgb;
  const show = arr.slice(0,5);
  return `<div style="flex:1;min-width:0;padding:${_vp.narrow?'9px 9px 8px':'11px 11px 10px'};border-radius:18px;background:${win?`linear-gradient(180deg, rgba(${rgb},.22), rgba(255,255,255,.12))`:'linear-gradient(180deg, rgba(255,255,255,.17), rgba(255,255,255,.08))'};border:1px solid ${win?'rgba(255,255,255,.34)':'rgba(255,255,255,.15)'};box-shadow:${win?'0 12px 26px rgba(0,0,0,.16)':'0 8px 18px rgba(15,23,42,.06)'};backdrop-filter:blur(8px);position:relative;overflow:hidden">
    <div style="position:absolute;inset:0 0 auto 0;height:18px;background:linear-gradient(180deg, rgba(255,255,255,.10), rgba(255,255,255,0));pointer-events:none"></div>
    <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:8px">
      <div style="font-size:${_vp.narrow?'11px':'12px'};font-weight:1000;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${label}</div>
      <div style="font-size:9px;font-weight:900;color:rgba(255,255,255,.9);background:rgba(255,255,255,.16);padding:2px 8px;border-radius:999px;flex-shrink:0">${arr.length}명</div>
    </div>
    <div style="display:grid;grid-template-columns:repeat(${_vp.narrow?3:5},minmax(0,1fr));gap:5px">
      ${show.map((mem,idx)=>__shareCardTeamMiniMemberCell(ctx, side, mem, idx)).join('')}
    </div>
  </div>`;
}

function __shareCardTeamParticipantsStrip(ctx, side){
  const { _vp } = ctx;
  const arr = __shareCardTeamMembers(ctx, side).slice(0,5);
  if(!arr.length) return '';
  return `<div style="display:flex;justify-content:center;align-items:center;gap:4px;flex-wrap:wrap;margin-top:5px">
    ${arr.map(mem=>{
      const p = mem && mem.name ? (statsP(mem.name) || mem) : (mem || {});
      if(p && p.photo){
        return `<img src="${toHttpsUrl(p.photo)}" title="${String(p.name||'')}" style="width:${_vp.narrow?'24px':'28px'};height:${_vp.narrow?'24px':'28px'};border-radius:999px;object-fit:cover;object-position:center top;border:1.5px solid rgba(255,255,255,.65);box-shadow:0 2px 8px rgba(0,0,0,.18)">`;
      }
      if(p && p.univ){
        return `<div title="${String(p.name||p.univ||'')}" style="width:${_vp.narrow?'24px':'28px'};height:${_vp.narrow?'24px':'28px'};border-radius:999px;background:rgba(255,255,255,.18);display:flex;align-items:center;justify-content:center;border:1.5px solid rgba(255,255,255,.4);overflow:hidden">${__shareCardUnivIconHTML(p.univ,_vp.narrow?'14px':'16px')}</div>`;
      }
      return `<div title="${String(p.name||'')}" style="width:${_vp.narrow?'24px':'28px'};height:${_vp.narrow?'24px':'28px'};border-radius:999px;background:rgba(255,255,255,.18);display:flex;align-items:center;justify-content:center;border:1.5px solid rgba(255,255,255,.4);color:#fff;font-size:10px;font-weight:1000">${String((p&&p.name)||'?').slice(0,1)}</div>`;
    }).join('')}
  </div>`;
}

function __shareCardTeamHeaderHTML(ctx){
  const { _teamMode, _vp, aWin, bWin, draw, m, _dispA, _dispB } = ctx;
  if(!_teamMode) return '';
  return `
    <div style="display:flex;align-items:flex-start;justify-content:center;gap:${_vp.narrow?'10px':'14px'};margin-bottom:14px;position:relative;z-index:1;flex-wrap:${_vp.narrow?'wrap':'nowrap'}">
      <div style="text-align:center;flex:1;min-width:0">
        ${__shareCardTeamRepIconHTML(ctx, 'A', aWin)}
        <div style="font-size:${_vp.narrow?'13px':'15px'};font-weight:${aWin?1000:800};color:${aWin?'#fff':'rgba(255,255,255,.82)'};white-space:${_vp.tiny?'normal':'nowrap'};overflow:hidden;text-overflow:ellipsis;text-shadow:0 2px 10px rgba(0,0,0,.18);line-height:1.2">${_dispA}</div>
        ${__shareCardTeamParticipantsStrip(ctx, 'A')}
        ${aWin?`<div style="margin-top:6px"><span style="background:rgba(255,255,255,.22);border:1px solid rgba(255,255,255,.42);color:#fff;font-size:9px;font-weight:900;padding:2px 9px;border-radius:999px">승리</span></div>`:`<div style="margin-top:6px"><span style="background:rgba(255,255,255,.10);border:1px solid rgba(255,255,255,.14);color:rgba(255,255,255,.72);font-size:9px;font-weight:800;padding:2px 9px;border-radius:999px">패배</span></div>`}
      </div>
      <div style="text-align:center;flex-shrink:0;padding:${_vp.narrow?'2px 0 0':'4px 6px 0'};order:${_vp.narrow?3:0};width:${_vp.narrow?'100%':'auto'}">
        <div style="font-size:${_vp.narrow?'42px':'56px'};font-weight:1000;letter-spacing:${_vp.narrow?'1px':'2px'};line-height:1;color:#fff;text-shadow:0 4px 16px rgba(0,0,0,.24)">
          <span>${m.sa??'-'}</span><span style="font-size:${_vp.narrow?'24px':'30px'};opacity:.58;margin:0 2px">:</span><span>${m.sb??'-'}</span>
        </div>
        ${draw?`<div style="margin-top:6px;display:inline-flex;align-items:center;gap:5px;padding:3px 10px;border-radius:999px;background:rgba(255,255,255,.14);border:1px solid rgba(255,255,255,.16);font-size:9px;color:rgba(255,255,255,.88);font-weight:900;letter-spacing:.4px">무승부</div>`:''}
      </div>
      <div style="text-align:center;flex:1;min-width:0">
        ${__shareCardTeamRepIconHTML(ctx, 'B', bWin)}
        <div style="font-size:${_vp.narrow?'13px':'15px'};font-weight:${bWin?1000:800};color:${bWin?'#fff':'rgba(255,255,255,.82)'};white-space:${_vp.tiny?'normal':'nowrap'};overflow:hidden;text-overflow:ellipsis;text-shadow:0 2px 10px rgba(0,0,0,.18);line-height:1.2">${_dispB}</div>
        ${__shareCardTeamParticipantsStrip(ctx, 'B')}
        ${bWin?`<div style="margin-top:6px"><span style="background:rgba(255,255,255,.22);border:1px solid rgba(255,255,255,.42);color:#fff;font-size:9px;font-weight:900;padding:2px 9px;border-radius:999px">승리</span></div>`:`<div style="margin-top:6px"><span style="background:rgba(255,255,255,.10);border:1px solid rgba(255,255,255,.14);color:rgba(255,255,255,.72);font-size:9px;font-weight:800;padding:2px 9px;border-radius:999px">패배</span></div>`}
      </div>
    </div>
    <div style="display:flex;gap:8px;align-items:stretch;position:relative;z-index:1;flex-direction:${_vp.narrow?'column':'row'}">
      ${__shareCardTeamRosterPanel(ctx, 'A', aWin)}
      ${__shareCardTeamRosterPanel(ctx, 'B', bWin)}
    </div>
  `;
}

try{
  window.__shareCardUnivIconHTML = __shareCardUnivIconHTML;
  window.__shareCardPickTeamRep = __shareCardPickTeamRep;
  window.__shareCardTeamRepNote = __shareCardTeamRepNote;
  window.__shareCardTeamLineupSummary = __shareCardTeamLineupSummary;
  window.__shareCardTeamMembers = __shareCardTeamMembers;
  window.__shareCardPickTeamSpotlight = __shareCardPickTeamSpotlight;
  window.__shareCardTeamRepIconHTML = __shareCardTeamRepIconHTML;
  window.__shareCardTeamMiniMemberCell = __shareCardTeamMiniMemberCell;
  window.__shareCardTeamRosterPanel = __shareCardTeamRosterPanel;
  window.__shareCardTeamParticipantsStrip = __shareCardTeamParticipantsStrip;
  window.__shareCardTeamHeaderHTML = __shareCardTeamHeaderHTML;
}catch(e){}
