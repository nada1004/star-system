(function(){
  window.SharecardModules = window.SharecardModules || {};
  window.__sharecardRepPickState = window.__sharecardRepPickState || {};

  function escName(v){
    return String(v||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  }

  window._collectSharecardTeamSideNames = function(ctx, side){
    try{
      const m = ctx?.m || {};
      const sets = Array.isArray(m.sets) ? m.sets : [];
      const out = [];
      const seen = new Set();
      const add = (name)=>{
        const n = String(name||'').trim();
        if(!n || seen.has(n)) return;
        seen.add(n);
        out.push(n);
      };
      const memberArr = side==='A' ? (m.teamAMembers||[]) : (m.teamBMembers||[]);
      if(Array.isArray(memberArr) && memberArr.length){
        memberArr.forEach(mem=>add(mem && mem.name));
      }
      sets.forEach(s=>{
        (Array.isArray(s && s.games) ? s.games : []).forEach(g=>{
          add(side==='A' ? (g && g.playerA) : (g && g.playerB));
        });
      });
      return out;
    }catch(e){ return []; }
  };

  window._inferSharecardTeamRepPlayer = function(ctx, side){
    try{
      const statsP = ctx?.statsP;
      const names = typeof window._collectSharecardTeamSideNames==='function' ? window._collectSharecardTeamSideNames(ctx, side) : [];
      let best = null;
      let bestScore = -1;
      names.forEach((name, idx)=>{
        const p = typeof statsP==='function' ? (statsP(name)||null) : null;
        let score = 0;
        if(p?.photo) score += 6;
        if(p?.univ) score += 4;
        if(p?.tier) score += 2;
        score += Math.max(0, 20 - idx);
        if(score > bestScore){
          bestScore = score;
          best = p ? {name:p.name, univ:p.univ, race:p.race, tier:p.tier, photo:p.photo} : {name};
        }
      });
      return best;
    }catch(e){ return null; }
  };

  window._buildSharecardTeamRender = function(ctx){
    try{
      const {m, scp, ca, cb, caRgb, cbRgb, aWin, bWin, _dispA, _dispB, statsP, univIconHTML, toHttpsUrl, _scMixHex, _tierBg, _tierFg, _raceLabel, _univLogo} = ctx || {};
      const collect = side => window._collectSharecardTeamSideNames ? window._collectSharecardTeamSideNames({m, statsP}, side) : [];
      const buildMembers = (side)=>{
        const arrRaw = side==='A' ? (m.teamAMembers||[]) : (m.teamBMembers||[]);
        const arr = (Array.isArray(arrRaw) && arrRaw.length) ? arrRaw : collect(side).map(name=>{
          const p = typeof statsP==='function' ? (statsP(name)||null) : null;
          return p ? {name:p.name, univ:p.univ, race:p.race, photo:p.photo} : {name};
        });
        return arr.map(mem=>{
          const p = mem && mem.name ? (statsP(mem.name) || mem) : (mem || {});
          return {
            name: String((p&&p.name)||'').trim(),
            univ: String((p&&p.univ)||'').trim(),
            race: String((p&&p.race)||'').trim(),
            photo: p&&p.photo ? p.photo : ''
          };
        }).filter(x=>x.name || x.univ || x.photo);
      };
      const membersA = buildMembers('A');
      const membersB = buildMembers('B');
      const pickRandom = (arr, key)=>{
        if(!Array.isArray(arr) || !arr.length) return null;
        if(arr.length===1) return arr[0] || null;
        const last = window.__sharecardRepPickState[key] || '';
        const pool = arr.filter(x=>String(x?.name||'').trim() !== last);
        const src = pool.length ? pool : arr;
        const idx = Math.floor(Math.random() * src.length);
        const chosen = src[idx] || src[0] || null;
        window.__sharecardRepPickState[key] = String(chosen?.name||'').trim();
        return chosen;
      };
      const preA = null;
      const preB = null;
      const pickRep = (side)=>{
        const pre = side==='A' ? preA : preB;
        if(pre) return pre;
        const arr = side==='A' ? membersA : membersB;
        if(!arr.length) return null;
        const photoArr = arr.filter(x=>x && x.photo);
        return pickRandom(photoArr.length ? photoArr : arr, `${String(m?._id||m?.d||'share')}:${side}`);
      };
      const repNote = (side)=>{
        const rep = pickRep(side);
        return rep?.__repWins ? `${rep.__repWins}승` : '';
      };
      const lineupSummary = (side)=>{
        const arr = side==='A' ? (m.teamAMembers||[]) : (m.teamBMembers||[]);
        const names = (Array.isArray(arr) && arr.length ? arr.map(x=>String((x&&x.name)||'').trim()).filter(Boolean) : collect(side));
        if(!names.length) return '';
        if(names.length===1) return names[0];
        if(names.length===2) return `${names[0]} · ${names[1]}`;
        return `${names[0]} · ${names[1]} 외 ${names.length-2}명`;
      };
      const teamLogoOuter = Math.round(92*scp.logoSize);
      const teamLogoInner = Math.round(44*scp.logoSize);
      const teamLogoBox = Math.round(58*scp.logoSize);
      const teamHeaderLayout = ['stack','inline','badge','cover'].includes(String(scp.logoLayout||'')) ? String(scp.logoLayout) : 'stack';
      const teamRepIconHTML = (side, win)=>{
        const rep = pickRep(side);
        const sOuter = `${teamLogoOuter}px`;
        const col = side==='A' ? ca : cb;
        const rgb = side==='A' ? caRgb : cbRgb;
        const sideTitle = side==='A' ? _dispA : _dispB;
        const panelBg = win?`rgba(${rgb},.38)`:`rgba(${rgb},.14)`;
        const ring = win ? 'box-shadow:0 0 0 3px rgba(255,255,255,.85),0 6px 22px rgba(0,0,0,.32);' : 'opacity:.72;box-shadow:0 0 0 2px rgba(255,255,255,.2);';
        if(teamHeaderLayout==='cover'){
          const repPlayer = rep && rep.name ? (statsP(rep.name) || rep) : null;
          const repUniv = String((repPlayer&&repPlayer.univ) || sideTitle || '').trim();
          const iconSize = Math.round(146*scp.logoSize);
          return `<div style="position:relative;width:100%;height:${Math.round(164*scp.logoSize)}px;border-radius:22px;overflow:hidden;background:linear-gradient(135deg,${_scMixHex(col,'#ffffff',.82)},${_scMixHex(col,'#0f172a',.26)});border:1px solid ${win?'rgba(255,255,255,.36)':'rgba(255,255,255,.16)'};box-shadow:${win?'0 18px 38px rgba(2,6,23,.22)':'0 10px 24px rgba(2,6,23,.12)'};${win?'':'filter:saturate(.82) brightness(.92);'}">
            <div style="position:absolute;inset:0;background:radial-gradient(circle at 50% 38%, rgba(255,255,255,.18), transparent 44%), linear-gradient(180deg, rgba(255,255,255,.08), rgba(15,23,42,.08) 52%, rgba(15,23,42,.24));pointer-events:none"></div>
            <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;padding:10px">
              <div style="width:${iconSize}px;height:${iconSize}px;display:flex;align-items:center;justify-content:center;opacity:${win?'.96':'.72'};transform:scale(${win?'1':'0.94'})">
                ${repUniv ? univIconHTML(repUniv,`${iconSize}px`) : `<span style="color:#fff;font-weight:1000;font-size:${Math.round(44*scp.logoSize)}px">${side}</span>`}
              </div>
            </div>
          </div>`;
        }
        if(rep && rep.name){
          const p = statsP(rep.name) || rep;
          if(p && p.photo){
            return `<div style="position:relative;width:${sOuter};height:${sOuter};border-radius:var(--su_profile_radius,50%);margin:0 auto 8px;overflow:hidden;${ring}">
              <img src="${toHttpsUrl(p.photo)}" style="width:100%;height:100%;object-fit:cover" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
              <div style="display:none;position:absolute;inset:0;border-radius:16px;background:rgba(${rgb},.22);align-items:center;justify-content:center;border:2px solid rgba(255,255,255,.35);overflow:hidden;${win?'box-shadow:0 4px 20px rgba(0,0,0,.25);':''}">
                ${univIconHTML(p.univ||'', `${teamLogoInner}px`)}
              </div>
            </div>`;
          }
          if(p && p.univ){
            return `<div style="width:${teamLogoBox}px;height:${teamLogoBox}px;border-radius:16px;background:${panelBg};margin:${teamHeaderLayout==='stack'?'0 auto 8px':'0'};display:flex;align-items:center;justify-content:center;${win?'box-shadow:0 4px 20px rgba(0,0,0,.25);border:2px solid rgba(255,255,255,.55);':'opacity:.72;'}overflow:hidden">
              ${univIconHTML(p.univ,`${Math.round(40*scp.logoSize)}px`)}
            </div>`;
          }
        }
        return `<div style="width:${teamLogoBox}px;height:${teamLogoBox}px;border-radius:16px;background:${panelBg};margin:${teamHeaderLayout==='stack'?'0 auto 8px':'0'};display:flex;align-items:center;justify-content:center;${win?'box-shadow:0 4px 20px rgba(0,0,0,.25);border:2px solid rgba(255,255,255,.55);':'opacity:.72;'}overflow:hidden;color:#fff;font-weight:1000;font-size:${Math.round(22*scp.logoSize)}px">${side}</div>`;
      };
      const teamMiniMemberCell = (side, mem, idx)=>{
        const p = mem && mem.name ? (statsP(mem.name) || mem) : (mem || {});
        const rgb = side==='A' ? caRgb : cbRgb;
        const name = String((p && p.name) || '').trim() || `${idx+1}번`;
        const race = String((p && p.race) || '').trim();
        const univ = String((p && p.univ) || '').trim();
        let icon = '';
        if(p && p.photo){
          icon = `<div style="position:relative;width:46px;height:46px"><img src="${toHttpsUrl(p.photo)}" style="width:46px;height:46px;border-radius:999px;object-fit:cover;border:2px solid rgba(255,255,255,.68);box-shadow:0 5px 16px rgba(0,0,0,.24)" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"><div style="display:none;width:46px;height:46px;border-radius:999px;background:rgba(${rgb},.22);align-items:center;justify-content:center;border:2px solid rgba(255,255,255,.35);overflow:hidden">${univIconHTML(univ,'24px')}</div>${race ? `<span class="rbadge r${race}" style="position:absolute;right:-3px;bottom:-3px;font-size:8px;padding:0 5px;line-height:14px;box-shadow:0 3px 10px rgba(0,0,0,.22)">${race}</span>` : ''}</div>`;
        }else{
          icon = `<div style="position:relative;width:46px;height:46px"><div style="width:46px;height:46px;border-radius:999px;background:rgba(${rgb},.22);display:flex;align-items:center;justify-content:center;border:2px solid rgba(255,255,255,.35);overflow:hidden;box-shadow:0 5px 16px rgba(0,0,0,.18)">${univ ? univIconHTML(univ,'24px') : `<span style="color:#fff;font-weight:1000;font-size:15px">${name.slice(0,1)}</span>`}</div>${race ? `<span class="rbadge r${race}" style="position:absolute;right:-3px;bottom:-3px;font-size:8px;padding:0 5px;line-height:14px;box-shadow:0 3px 10px rgba(0,0,0,.22)">${race}</span>` : ''}</div>`;
        }
        return `<div style="min-width:0;padding:2px 1px;border-radius:14px;background:transparent;display:flex;flex-direction:column;align-items:center;gap:0">
          <div style="display:flex;align-items:center;justify-content:center">${icon}</div>
        </div>`;
      };
      const teamRosterPanel = (side, win)=>{
        const rgb = side==='A' ? caRgb : cbRgb;
        const arr = (side==='A' ? membersA : membersB).slice(0, 6);
        return `<div style="flex:1;min-width:0;padding:6px 6px 5px;border-radius:18px;background:${win?`rgba(${rgb},.18)`:'rgba(255,255,255,.10)'};border:1px solid ${win?'rgba(255,255,255,.34)':'rgba(255,255,255,.14)'};box-shadow:${win?'0 10px 24px rgba(0,0,0,.14)':'none'}">
          <div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px">
            ${arr.map((mem,idx)=>teamMiniMemberCell(side, mem, idx)).join('')}
          </div>
        </div>`;
      };
      const teamPosterSide = (side)=>{
        const isA = side==='A';
        const isWin = isA ? aWin : bWin;
        const col = isA ? ca : cb;
        const rgb = isA ? caRgb : cbRgb;
        const rep = pickRep(side);
        const repPlayer = rep && rep.name ? (statsP(rep.name) || rep) : null;
        const title = isA ? _dispA : _dispB;
        const repUniv = String((repPlayer&&repPlayer.univ) || title || '').trim();
        const safeRepName = escName((repPlayer&&repPlayer.name)||'');
        const media = repPlayer?.photo
          ? `<img ${safeRepName?`onclick="openPlayerModal('${safeRepName}')"`:''} title="스트리머 상세" src="${toHttpsUrl(repPlayer.photo)}" style="width:100%;height:100%;object-fit:cover;display:block;cursor:${safeRepName?'pointer':'default'}">`
          : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,rgba(${rgb},.62),rgba(15,23,42,.92));">${repUniv ? univIconHTML(repUniv,'156px') : `<span style="font-size:74px;font-weight:1000;color:#fff">${title.slice(0,1)}</span>`}</div>`;
        return `<div class="share-team-poster-side ${isWin?'is-win':'is-lose'}" style="position:relative;min-width:0;flex:1;height:${isWin?'236px':'208px'};border-radius:22px;overflow:hidden;border:1px solid ${isWin?'rgba(255,255,255,.34)':'rgba(255,255,255,.14)'};box-shadow:${isWin?'0 26px 52px rgba(2,6,23,.34)':'0 14px 28px rgba(2,6,23,.18)'};transform:${isWin?'translateY(-6px) scale(1.02)':'translateY(8px) scale(.96)'};transform-origin:center center">
          ${media}
          <div style="position:absolute;inset:0;background:${isWin?`linear-gradient(180deg,rgba(2,6,23,.12),rgba(15,23,42,.18) 24%,rgba(15,23,42,.80))`:`linear-gradient(180deg,rgba(2,6,23,.52),rgba(2,6,23,.74) 34%,rgba(2,6,23,.97))`};pointer-events:none"></div>
          ${isWin?`<div style="position:absolute;top:10px;right:10px;z-index:2;background:rgba(255,255,255,.18);border:1px solid rgba(255,255,255,.28);color:#fff;font-size:17px;line-height:1;padding:8px;border-radius:999px;backdrop-filter:blur(8px)">🏆</div>`:''}
          <div style="position:absolute;inset:auto 0 0 0;padding:16px 14px 14px;display:flex;flex-direction:column;gap:7px">
            <div style="font-size:${isWin?'26px':'22px'};font-weight:${isWin?1000:900};color:#fff;line-height:1.05;text-shadow:0 5px 18px rgba(0,0,0,.54),0 1px 0 rgba(0,0,0,.22);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${title}</div>
            ${repNote(side)?`<div><span style="display:inline-flex;align-items:center;gap:4px;background:${isWin?`rgba(${rgb},.38)`:'rgba(255,255,255,.12)'};border:1px solid ${isWin?'rgba(255,255,255,.34)':'rgba(255,255,255,.14)'};color:#fff;font-size:10px;font-weight:900;padding:3px 8px;border-radius:999px">${repNote(side)}</span></div>`:''}
          </div>
        </div>`;
      };
      const headerHTML = `<div style="position:relative">
        <div class="share-personal-grid" style="display:grid;grid-template-columns:${aWin?'minmax(0,1.14fr) minmax(0,.86fr)':bWin?'minmax(0,.86fr) minmax(0,1.14fr)':'minmax(0,1fr) minmax(0,1fr)'};gap:12px;align-items:center;margin-bottom:12px">
          ${teamPosterSide('A')}
          ${teamPosterSide('B')}
        </div>
      </div>`;
      const rosterHTML = `<div style="display:flex;gap:10px;align-items:stretch;flex-wrap:wrap;margin-bottom:${(ctx.setsHTML?'12':'0')}px">
        ${teamRosterPanel('A', aWin)}
        ${teamRosterPanel('B', bWin)}
      </div>`;
      return { preA, preB, headerHTML, rosterHTML };
    }catch(e){
      return { preA:null, preB:null, headerHTML:'', rosterHTML:'' };
    }
  };

  window.SharecardModules.team = {
    collectSideNames: window._collectSharecardTeamSideNames,
    inferRepPlayer: window._inferSharecardTeamRepPlayer,
    buildRender: window._buildSharecardTeamRender
  };
})();
