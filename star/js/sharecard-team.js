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
      const photoMap = (window.playerPhotos && typeof window.playerPhotos==='object') ? window.playerPhotos : {};
      const collect = side => window._collectSharecardTeamSideNames ? window._collectSharecardTeamSideNames({m, statsP}, side) : [];
      const hydratePlayer = (name, base)=>{
        const key = String(name||'').trim();
        const hit = key && typeof statsP==='function' ? (statsP(key)||null) : null;
        const src = hit || base || {};
        const photo = (src && src.photo) || (key && photoMap[key]) || '';
        return {
          name: String((src&&src.name)||key||'').trim(),
          univ: String((src&&src.univ)||'').trim(),
          race: String((src&&src.race)||'').trim(),
          tier: String((src&&src.tier)||'').trim(),
          photo: photo || '',
          secondProfileFile: (src && src.secondProfileFile) || ''
        };
      };
      const buildMembers = (side)=>{
        const arrRaw = side==='A' ? (m.teamAMembers||[]) : (m.teamBMembers||[]);
        const arr = (Array.isArray(arrRaw) && arrRaw.length) ? arrRaw : collect(side).map(name=>{
          const p = hydratePlayer(name, null);
          return p.name ? p : {name};
        });
        return arr.map(mem=>hydratePlayer(mem&&mem.name, mem)).filter(x=>x.name || x.univ || x.photo);
      };
      const membersA = buildMembers('A');
      const membersB = buildMembers('B');
      // 슬라이드쇼: 경기(게임) 1번부터 마지막 경기까지 순서대로 5초마다 순환 (랜덤 아님)
      const _slideKey = String(m?._id||m?.d||'share');
      window.__sharecardSlideIdx = window.__sharecardSlideIdx || {};
      if(window.__sharecardSlideIdx[_slideKey] === undefined) window.__sharecardSlideIdx[_slideKey] = 0;
      const buildGameFrames = ()=>{
        try{
          const out = [];
          (Array.isArray(m && m.sets) ? m.sets : []).forEach((s)=>{
            (Array.isArray(s && s.games) ? s.games : []).forEach((g)=>{
              if(!g) return;
              const pA = String(g.playerA||'').trim();
              const pB = String(g.playerB||'').trim();
              if(!pA && !pB) return;
              out.push({
                playerA: pA,
                playerB: pB,
                winner: String(g.winner||'').trim(), // 'A' | 'B' | ''
                map: String(g.map||'').trim()
              });
            });
          });
          return out;
        }catch(e){
          return [];
        }
      };
      const _gameFrames = buildGameFrames();
      const pickSequential = (arr, key)=>{
        if(!Array.isArray(arr) || !arr.length) return null;
        if(arr.length===1) return arr[0] || null;
        const seqIdx = window.__sharecardSlideIdx[key] % arr.length;
        return arr[seqIdx] || arr[0] || null;
      };
      const pickGameFrame = ()=>{
        if(!_gameFrames.length) return null;
        const idx = window.__sharecardSlideIdx[_slideKey] % _gameFrames.length;
        return _gameFrames[idx] || _gameFrames[0] || null;
      };
      const preA = null;
      const preB = null;
      const pickRep = (side)=>{
        const pre = side==='A' ? preA : preB;
        if(pre) return pre;
        // 우선: 경기 프레임에서 현재 경기의 선수로 표시
        const gf = pickGameFrame();
        if(gf){
          const nm = side==='A' ? gf.playerA : gf.playerB;
          if(nm) return { name: nm, __fromGameFrame: true, __winner: gf.winner, __opponent: side==='A' ? gf.playerB : gf.playerA, __map: gf.map };
        }
        // fallback: 선수 목록 순환 (데이터가 팀 로스터만 있는 경우)
        const arr = side==='A' ? membersA : membersB;
        if(!arr.length) return null;
        const photoArr = arr.filter(x=>x && x.photo);
        return pickSequential(photoArr.length ? photoArr : arr, _slideKey);
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
      const matchType = String(m&&m._matchType||'');
      const hideTopUnivMeta = ['univ','comp','ck','tt','pro','progj','procomp-team','procomp-bkt'].includes(matchType);
      const hasUnivLogo = (name)=>{
        try{
          const key = String(name||'').trim();
          if(!key) return false;
          const cfgList = Array.isArray(window.univCfg) && window.univCfg.length
            ? window.univCfg
            : (typeof getAllUnivs==='function' ? getAllUnivs() : []);
          return !!((window.UNIV_ICONS && window.UNIV_ICONS[key]) || (cfgList.find(x=>x&&x.name===key&&(x.icon||x.img||window.UNIV_ICONS?.[key]))));
        }catch(e){
          return false;
        }
      };
      const getUnivLogoUrl = (name)=>{
        try{
          const key = String(name||'').trim();
          if(!key) return '';
          const cfgList = Array.isArray(window.univCfg) && window.univCfg.length
            ? window.univCfg
            : (typeof getAllUnivs==='function' ? getAllUnivs() : []);
          const cfg = (cfgList.find(x=>x&&x.name===key) || {});
          return String((window.UNIV_ICONS && window.UNIV_ICONS[key]) || cfg.icon || cfg.img || '').trim();
        }catch(e){
          return '';
        }
      };
      const directUnivIconHTML = (name, size)=>{
        try{
          const url = getUnivLogoUrl(name);
          if(!url) return '';
          const s = String(size||'40px');
          return `<img src="${toHttpsUrl(url)}" style="width:${s};height:${s};object-fit:contain;display:block" onerror="this.style.display='none'">`;
        }catch(e){
          return '';
        }
      };
      const resolveSideLogoUniv = (side, repPlayer)=>{
        try{
          const sideTitle = side==='A' ? _dispA : _dispB;
          const teamUniv = String(sideTitle||'').trim();
          const repUniv = String((repPlayer&&repPlayer.univ) || '').trim();
          const sideMembers = (side==='A' ? membersA : membersB) || [];
          const memberUniv = sideMembers
            .map(mem=>hydratePlayer(mem&&mem.name, mem))
            .map(p=>String((p&&p.univ)||'').trim())
            .find(v=>v && hasUnivLogo(v)) || '';
          if(teamUniv && hasUnivLogo(teamUniv)) return teamUniv;
          if(repUniv && hasUnivLogo(repUniv)) return repUniv;
          if(memberUniv) return memberUniv;
          return teamUniv || repUniv || '';
        }catch(e){
          return '';
        }
      };
      const teamRepIconHTML = (side, win)=>{
        const rep = pickRep(side);
        const repPlayer = hydratePlayer(rep&&rep.name, rep);
        const sOuter = `${teamLogoOuter}px`;
        const col = side==='A' ? ca : cb;
        const rgb = side==='A' ? caRgb : cbRgb;
        const sideTitle = side==='A' ? _dispA : _dispB;
        const logoUniv = resolveSideLogoUniv(side, repPlayer);
        const repUnivColor = logoUniv && typeof window.gc==='function' ? (window.gc(logoUniv) || col) : col;
        const loseGray = Math.round((scp.loserGray||.55)*100);
        const panelBg = win?`rgba(${rgb},.28)`:`rgba(${rgb},.12)`;
        const ring = `box-shadow:0 0 0 1px rgba(255,255,255,.18),0 6px 16px rgba(0,0,0,.10);`;
        if(teamHeaderLayout==='cover'){
          const repUniv = String((repPlayer&&repPlayer.univ) || sideTitle || '').trim();
          const iconSize = Math.round(146*scp.logoSize);
          return `<div style="position:relative;width:100%;height:${Math.round(164*scp.logoSize)}px;border-radius:22px;overflow:hidden;background:linear-gradient(135deg,${_scMixHex(col,'#ffffff',.86)},${_scMixHex(col,'#0f172a',.18)});border:1px solid rgba(255,255,255,.18);box-shadow:0 8px 18px rgba(2,6,23,.10);">
            <div style="position:absolute;inset:0;background:radial-gradient(circle at 50% 38%, rgba(255,255,255,.22), transparent 44%), linear-gradient(180deg, rgba(255,255,255,.06), rgba(15,23,42,.04) 52%, rgba(15,23,42,.14));pointer-events:none"></div>
            <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;padding:10px">
              <div style="width:${iconSize}px;height:${iconSize}px;display:flex;align-items:center;justify-content:center;opacity:${win?'.96':'.72'};transform:scale(${win?'1':'0.94'});border-radius:24px;overflow:hidden">
                ${repPlayer && repPlayer.photo
                  ? `<img src="${toHttpsUrl(repPlayer.photo)}" style="width:100%;height:100%;object-fit:cover;display:block;filter:${win?`brightness(${scp.heroBrightness||1})`:`grayscale(${loseGray}%) brightness(${scp.loserPhotoBrightness||.92})`}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"><div style="display:none;width:100%;height:100%;align-items:center;justify-content:center">${(!hideTopUnivMeta && logoUniv && hasUnivLogo(logoUniv)) ? univIconHTML(logoUniv,`${iconSize}px`) : `<span style="color:#fff;font-weight:1000;font-size:${Math.round(44*scp.logoSize)}px">${sideTitle.slice(0,1)||side}</span>`}</div>`
                  : ((!hideTopUnivMeta && logoUniv && hasUnivLogo(logoUniv)) ? univIconHTML(logoUniv,`${iconSize}px`) : `<span style="color:#fff;font-weight:1000;font-size:${Math.round(44*scp.logoSize)}px">${sideTitle.slice(0,1)||side}</span>`)}
              </div>
            </div>
          </div>`;
        }
        if(repPlayer && repPlayer.name){
          const p = repPlayer;
          if(p && p.photo){
            const _safeRepN = String(p.name||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
            return `<div onclick="openPlayerModal('${_safeRepN}')" title="스트리머 상세" style="position:relative;width:${sOuter};height:${sOuter};border-radius:var(--su_profile_radius,50%);clip-path:var(--su_profile_clip,none);margin:0 auto 8px;overflow:hidden;cursor:pointer;${ring}">
              <img src="${toHttpsUrl(p.photo)}" style="width:100%;height:100%;object-fit:cover;filter:${win?`brightness(${scp.heroBrightness||1})`:`grayscale(${loseGray}%) brightness(${scp.loserPhotoBrightness||.92})`}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
              <div style="display:none;position:absolute;inset:0;border-radius:var(--r2);background:rgba(${rgb},.22);align-items:center;justify-content:center;border:2px solid rgba(255,255,255,.35);overflow:hidden;${win?'box-shadow:0 4px 20px rgba(0,0,0,.25);':''}">
                ${hasUnivLogo(p.univ||'') ? univIconHTML(p.univ||'', `${teamLogoInner}px`) : `<span style="color:#fff;font-weight:1000;font-size:${Math.round(20*scp.logoSize)}px">${sideTitle.slice(0,1)||side}</span>`}
              </div>
            </div>`;
          }
          if(p && p.univ && !hideTopUnivMeta && hasUnivLogo(p.univ)){
            return `<div style="width:${teamLogoBox}px;height:${teamLogoBox}px;border-radius:var(--r2);background:${panelBg};margin:${teamHeaderLayout==='stack'?'0 auto 8px':'0'};display:flex;align-items:center;justify-content:center;${win?'box-shadow:0 4px 20px rgba(0,0,0,.25);border:2px solid rgba(255,255,255,.55);':'opacity:.72;'}overflow:hidden">
              ${univIconHTML(p.univ,`${Math.round(40*scp.logoSize)}px`)}
            </div>`;
          }
        }
        return `<div style="width:${teamLogoBox}px;height:${teamLogoBox}px;border-radius:var(--r2);background:${panelBg};margin:${teamHeaderLayout==='stack'?'0 auto 8px':'0'};display:flex;align-items:center;justify-content:center;${win?'box-shadow:0 4px 20px rgba(0,0,0,.25);border:2px solid rgba(255,255,255,.55);':'opacity:.72;'}overflow:hidden;color:#fff;font-weight:1000;font-size:${Math.round(22*scp.logoSize)}px">${side}</div>`;
      };
      // (요청사항) 소속 팀의 승패와 무관하게, 특정 선수 개인의 이번 경기 승/패 결과를 조회
      // -> 'win' | 'lose' | null(개인 전적 데이터 없음, 팀 승패로 대체 처리)
      const personalRecordForName = (name)=>{
        const n = String(name||'').trim();
        if(!n) return null;
        let _pw=0, _pl=0;
        // 동률(예: 1승 1패)인 경우에도 "최근 경기" 기준으로 승/패를 반환해
        // 팀 승패 fallback 때문에 프로필 크기가 뒤집히는 케이스를 방지한다.
        // - 개인 전적 데이터가 아예 없을 때만 null을 반환하여 팀 승패로 대체
        let _last = null; // 'win' | 'lose' | null
        try{
          (Array.isArray(m && m.sets) ? m.sets : []).forEach(s=>{
            (Array.isArray(s && s.games) ? s.games : []).forEach(g=>{
              if(!g) return;
              const isA = g.playerA===n, isB = g.playerB===n;
              if(!isA && !isB) return;
              if((isA && g.winner==='A') || (isB && g.winner==='B')){ _pw++; _last = 'win'; }
              else if((isA && g.winner==='B') || (isB && g.winner==='A')){ _pl++; _last = 'lose'; }
            });
          });
        }catch(e){}
        if(_pw>_pl) return 'win';
        if(_pl>_pw) return 'lose';
        // 동률이어도 실제로 경기 데이터가 있으면 "최근 경기"로 판단
        if((_pw+_pl)>0) return _last;
        return null;
      };
      const teamMiniMemberCell = (side, mem, idx, sz)=>{
        const p = hydratePlayer(mem&&mem.name, mem);
        const rgb = side==='A' ? caRgb : cbRgb;
        const name = String((p && p.name) || '').trim() || `${idx+1}번`;
        const race = String((p && p.race) || '').trim();
        const univ = String((p && p.univ) || '').trim();
        let icon = '';
        const baseSize = Math.max(28, Math.min(60, parseInt(sz||46,10)||46));
        // (요청사항) 팀 전체 승패와 무관하게, 이 선수 개인의 이번 경기 승/패에 따라 아이콘 크기·밝기를 차등 적용
        const personalRec = personalRecordForName(name);
        // (요청사항) 참여자 프로필 이미지는 항상 같은 크기로 고정
        // - 승/패는 링/톤(색감/그레이)으로만 표현하고, 크기(가로·세로)는 바꾸지 않는다.
        const size = baseSize;
        // 원본 프로필 이미지에서 아주 살짝만 회색 처리 (과하게 어둡거나 탁해지지 않도록)
        const loseFilter = personalRec==='lose' ? 'filter:grayscale(22%) brightness(.97);opacity:.94;' : '';
        const winRing = personalRec==='win' ? '0 6px 16px rgba(0,0,0,.30),0 0 0 2px rgba(255,255,255,.92)' : '0 5px 16px rgba(0,0,0,.24)';
        const logoSz = Math.max(16, Math.round(size * 0.52));
        if(p && p.photo){
          const _2ndHtml = (p.secondProfileFile && typeof _phSwap2ndHTML==='function') ? _phSwap2ndHTML(p.secondProfileFile, {style:'border-radius:var(--su_profile_radius,999px);clip-path:var(--su_profile_clip,none)'}) : '';
          const _swapCls = _2ndHtml ? ' ph-swap' : '';
          icon = `<div class="${_swapCls.trim()}" style="position:relative;width:${size}px;height:${size}px"><img src="${toHttpsUrl(p.photo)}" style="position:absolute;inset:0;width:${size}px;height:${size}px;border-radius:var(--su_profile_radius,999px);clip-path:var(--su_profile_clip,none);object-fit:cover;border:2px solid rgba(255,255,255,.68);box-shadow:${winRing};${loseFilter}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">${_2ndHtml}<div style="display:none;width:${size}px;height:${size}px;border-radius:var(--su_profile_radius,999px);clip-path:var(--su_profile_clip,none);background:rgba(${rgb},.22);align-items:center;justify-content:center;border:2px solid rgba(255,255,255,.35);overflow:hidden">${univIconHTML(univ,logoSz+'px')}</div>${race ? `<span class="rbadge r${race}" style="position:absolute;right:-3px;bottom:-3px;font-size:8px;padding:0 5px;line-height:14px;box-shadow:0 3px 10px rgba(0,0,0,.22)">${race}</span>` : ''}</div>`;
        }else{
          icon = `<div style="position:relative;width:${size}px;height:${size}px"><div style="width:${size}px;height:${size}px;border-radius:var(--su_profile_radius,999px);clip-path:var(--su_profile_clip,none);background:rgba(${rgb},.22);display:flex;align-items:center;justify-content:center;border:2px solid rgba(255,255,255,.35);overflow:hidden;box-shadow:${winRing};${loseFilter}">${univ ? univIconHTML(univ,logoSz+'px') : `<span style="color:#fff;font-weight:1000;font-size:${Math.max(12,Math.round(size*0.33))}px">${name.slice(0,1)}</span>`}</div>${race ? `<span class="rbadge r${race}" style="position:absolute;right:-3px;bottom:-3px;font-size:8px;padding:0 5px;line-height:14px;box-shadow:0 3px 10px rgba(0,0,0,.22)">${race}</span>` : ''}</div>`;
        }
        return `<div onclick="openPlayerModal('${String(name).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/'/g,'&#39;')}')" title="스트리머 상세" style="min-width:0;padding:2px 1px;border-radius:14px;background:transparent;display:flex;flex-direction:column;align-items:center;gap:0;cursor:pointer">
          <div style="display:flex;align-items:center;justify-content:center">${icon}</div>
        </div>`;
      };
      // 두 팀 중 인원이 더 많은 쪽 기준으로 기본 아이콘 크기를 통일 — 팀이 달라도
      // "개인 승"은 항상 같은 확대 크기, "개인 패"는 항상 같은 축소 크기가 되도록 함
      const _sharedRosterN = Math.max(membersA.length, membersB.length, 1);
      const _sharedIconBase = _sharedRosterN>18?30:_sharedRosterN>12?34:_sharedRosterN>8?38:46;
      const teamRosterPanel = (side, win)=>{
        const rgb = side==='A' ? caRgb : cbRgb;
        const arr = (side==='A' ? membersA : membersB) || [];
        // 인원이 많아도 전부 보이도록: 인원 수에 따라 열 수는 이 팀 인원 기준으로 조정하되, 아이콘 기준 크기는 양 팀 공통
        const n = arr.length;
        const cols = n>18?6:n>12?5:n>8?4:3;
        return `<div style="flex:1;min-width:0;padding:6px 6px 5px;border-radius:18px;background:${win?`rgba(${rgb},.18)`:'rgba(255,255,255,.10)'};border:1px solid ${win?'rgba(255,255,255,.34)':'rgba(255,255,255,.14)'};box-shadow:${win?'0 10px 24px rgba(0,0,0,.14)':'none'}">
          <div style="display:grid;grid-template-columns:repeat(${cols},minmax(0,1fr));gap:6px">
            ${arr.map((mem,idx)=>teamMiniMemberCell(side, mem, idx, _sharedIconBase)).join('')}
          </div>
        </div>`;
      };
      const teamPosterSide = (side)=>{
        const isA = side==='A';
        const teamWin = isA ? aWin : bWin;
        const col = isA ? ca : cb;
        const rgb = isA ? caRgb : cbRgb;
        const rep = pickRep(side);
        const repPlayer = hydratePlayer(rep&&rep.name, rep);
        // 경기(게임) 단위 승패:
        // - 승리한 경기면 프로필 크게, 패배한 경기면 작게
        // - 팀 전체 승패와 조합에 따라 회색/밝기 강도를 다르게 적용
        const repWinnerSide = String(rep && rep.__winner || '').trim(); // 'A'|'B'|''
        const hasGameWinner = repWinnerSide==='A' || repWinnerSide==='B';
        const gameWin = hasGameWinner ? (repWinnerSide === side) : teamWin;
        const isWin = !!gameWin;
        const overallTeamWin = !!teamWin;
        const title = isA ? _dispA : _dispB;
        const sideMembers = (isA ? membersA : membersB) || [];
        const logoUniv = resolveSideLogoUniv(side, repPlayer);
        const safeRepName = escName((repPlayer&&repPlayer.name)||'');
        const repUnivColor = logoUniv && typeof window.gc==='function' ? (window.gc(logoUniv) || col) : col;
        const baseGray = Math.round((scp.loserGray||.55)*100);
        const grayWinTeamLose = Math.max(10, Math.round(baseGray*0.40));   // 이긴 팀에서 개인 패배 (약한 회색)
        const grayLoseTeamWin = Math.max(1, Math.round(baseGray*0.05));   // 진 팀에서 개인 승리 (거의 티 안 나는 회색)
        const grayLoseTeamLose = baseGray;                                 // 진 팀에서 개인 패배 (강한 회색)
        const bHero = (scp.heroBrightness||1);
        const bLose = (scp.loserPhotoBrightness||.92);
        const _filterByState = ()=>{
          // 4가지 조합:
          // 1) 팀승 + 개인승: 거의 원본 (밝게)
          // 2) 팀승 + 개인패: 약간 회색 + 조금 더 어둡게
          // 3) 팀패 + 개인승: 약간 회색 + (2)와 다른 밝기
          // 4) 팀패 + 개인패: 강한 회색 + 패배 밝기
          if(overallTeamWin && isWin) return `brightness(${bHero})`;
          if(overallTeamWin && !isWin) return `grayscale(${grayWinTeamLose}%) brightness(${Math.max(.86, Math.min(1.05, bLose+0.02))})`;
          if(!overallTeamWin && isWin) return `grayscale(${grayLoseTeamWin}%) brightness(${Math.max(1.00, Math.min(1.12, bHero+0.04))})`;
          return `grayscale(${grayLoseTeamLose}%) brightness(${bLose})`;
        };
        const repLogoTone = isWin ? '' : 'filter:grayscale(1) brightness(.82) contrast(.9);opacity:.82;';
        const repName = String((repPlayer&&repPlayer.name) || (sideMembers[0]&&sideMembers[0].name) || '').trim();
        const memberNames = sideMembers.map(x=>String((x&&x.name)||'').trim()).filter(Boolean);
        const remainCount = Math.max(0, memberNames.filter(n=>n!==repName).length);
        const opp = String(rep && rep.__opponent || '').trim();
        const repSummary = repName
          ? (rep && rep.__fromGameFrame
              ? `<span style="font-weight:900">${escName(repName)}</span>${opp?` <span style="opacity:.68;font-weight:700"> vs ${escName(opp)}</span>`:''}`
              : `${escName(repName)}${remainCount>0?` 외 ${remainCount}명`:''}`)
          : (memberNames.length?`참가자 ${memberNames.length}명`:'');
        const showRepSummary = !['procomp-team','procomp-bkt'].includes(matchType);
        const _posterImgStyle=`width:100%;height:100%;object-fit:cover;display:block;cursor:${safeRepName?'pointer':'default'};filter:${_filterByState()}`;
        const _posterSecondHtml = (repPlayer?.photo && repPlayer?.secondProfileFile && typeof _phSwap2ndHTML==='function') ? _phSwap2ndHTML(repPlayer.secondProfileFile, {style:'object-fit:cover'}) : '';
        const media = repPlayer?.photo
          ? (_posterSecondHtml
              ? `<span class="ph-swap" style="position:absolute;inset:0;display:block">${`<img class="share-poster-media" ${safeRepName?`onclick="openPlayerModal('${safeRepName}')"`:''} title="스트리머 상세" src="${toHttpsUrl(repPlayer.photo)}" style="position:absolute;inset:0;${_posterImgStyle}">`}${_posterSecondHtml}</span>`
              : `<img class="share-poster-media" ${safeRepName?`onclick="openPlayerModal('${safeRepName}')"`:''} title="스트리머 상세" src="${toHttpsUrl(repPlayer.photo)}" style="${_posterImgStyle}">`)
          : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,rgba(${rgb},.62),rgba(15,23,42,.92));"><span style="font-size:74px;font-weight:1000;color:#fff">${title.slice(0,1)}</span></div>`;
        // 사진 배경 위에서 어두운 대학 컬러(예: 검정 계열)가 묻혀 안 보이는 문제 방지:
        // 너무 어두운 브랜드 컬러는 화이트 쪽으로 블렌딩해 최소 명도를 보장한다.
        const _titleColorLuminance = (hex)=>{
          try{
            const h=String(hex||'').replace('#','');
            if(!/^[0-9a-fA-F]{6}$/.test(h)) return 1;
            const r=parseInt(h.substr(0,2),16),g=parseInt(h.substr(2,2),16),b=parseInt(h.substr(4,2),16);
            return (0.299*r+0.587*g+0.114*b)/255;
          }catch(e){ return 1; }
        };
        const _readableTitleColor = (hex)=>{
          const lum = _titleColorLuminance(hex);
          if(lum >= 0.42) return hex;
          const mixAmt = lum < 0.18 ? .74 : .55;
          return (typeof _scMixHex==='function') ? _scMixHex(hex, '#ffffff', mixAmt) : hex;
        };
        const titleColor = isWin ? _readableTitleColor(repUnivColor) : (hideTopUnivMeta ? 'rgba(226,232,240,.78)' : 'rgba(203,213,225,.78)');
        const titleLong = title.length >= 7;
        const logoBox = isWin ? (titleLong?56:52) : (titleLong?29:27);
        const logoSize = isWin ? (titleLong?'52px':'48px') : (titleLong?'27px':'23px');
        const logoMarkup = (!hideTopUnivMeta && logoUniv) ? directUnivIconHTML(logoUniv, logoSize) : '';
        const titleStack = !!String(logoMarkup||'').trim();
        const summaryColor = ['ck','tt','pro'].includes(matchType) ? (isWin?'rgba(255,255,255,.92)':'rgba(203,213,225,.78)') : (isWin?titleColor:'rgba(203,213,225,.78)');
        const logoTitleGap = 0;
        // 이름 텍스트가 놓이는 하단 영역 전용 스크림: 사진이 밝은 부분이어도 텍스트 대비를 보장
        const nameScrimH = isWin ? 108 : 88;
        return `<div class="share-team-poster-side ${isWin?'is-win':'is-lose'}" style="position:relative;min-width:0;flex:1;height:${isWin?'248px':'201px'};border-radius:22px;overflow:hidden;border:1px solid rgba(255,255,255,.16);box-shadow:0 10px 20px rgba(2,6,23,.10);transform:translateY(${isWin?'-3':'2'}px) scale(${isWin?'1.043':'.971'});transform-origin:center center">
          ${media}
          <div style="position:absolute;inset:0;background:${isWin?'linear-gradient(180deg,rgba(2,6,23,.02),rgba(15,23,42,.05) 24%,rgba(15,23,42,.24))':'linear-gradient(180deg,rgba(2,6,23,.05),rgba(15,23,42,.10) 24%,rgba(15,23,42,.42))'};pointer-events:none"></div>
          <div style="position:absolute;inset:auto 0 0 0;height:${nameScrimH}px;background:linear-gradient(180deg,rgba(15,23,42,0),rgba(15,23,42,.5) 45%,rgba(15,23,42,.72));pointer-events:none"></div>
          <div style="position:absolute;inset:auto 0 0 0;padding:16px 14px 14px;display:flex;flex-direction:column;gap:4px">
            <div class="share-poster-name" style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:${titleStack?logoTitleGap:4}px;min-width:0;font-size:${Math.round((isWin?'28':'20')*(scp.titleScale||1))}px;font-weight:${isWin?1000:900};color:${titleColor};line-height:1.05;text-shadow:0 1px 3px rgba(0,0,0,.9),0 0 6px rgba(0,0,0,.75),0 5px 18px rgba(0,0,0,.6);white-space:normal;overflow:visible;text-overflow:clip;text-align:center">${titleStack?`<span style="display:inline-flex;align-items:flex-end;justify-content:center;width:${logoBox}px;height:${logoBox}px;flex-shrink:0;background:transparent;border:none;box-shadow:none;line-height:1;${repLogoTone}">${logoMarkup}</span>`:''}<span style="min-width:0;white-space:normal;word-break:keep-all;overflow-wrap:anywhere">${title}</span></div>
            ${showRepSummary&&repSummary?`<div class="share-poster-summary" style="font-size:${isWin?12:11}px;font-weight:800;color:${summaryColor};line-height:1.2;text-align:center;white-space:normal;overflow-wrap:anywhere;text-shadow:0 2px 10px rgba(0,0,0,.5)">${repSummary}</div>`:''}
            ${repNote(side)?`<div><span style="display:inline-flex;align-items:center;gap:4px;background:${isWin?`rgba(${rgb},.38)`:'rgba(255,255,255,.12)'};border:1px solid ${isWin?'rgba(255,255,255,.34)':'rgba(255,255,255,.14)'};color:#fff;font-size:10px;font-weight:900;padding:3px 8px;border-radius:999px">${repNote(side)}</span></div>`:''}
          </div>
        </div>`;
      };
      // 슬라이드쇼 프레임 수: 경기 수 우선, 없으면(요약 데이터만 있는 경우) 기존 로스터 기반으로 대체
      const _slideMaxA = (() => { const arr = membersA.filter(x=>x&&x.photo); return (arr.length ? arr : membersA).length; })();
      const _slideMaxB = (() => { const arr = membersB.filter(x=>x&&x.photo); return (arr.length ? arr : membersB).length; })();
      const _slideTotalFrames = Math.max(_gameFrames.length || 0, _slideMaxA, _slideMaxB, 1);
      const _slideId = 'scSlide_' + _slideKey.replace(/[^a-zA-Z0-9]/g,'_');
      const _curDotIdx = _slideTotalFrames > 1 ? (window.__sharecardSlideIdx[_slideKey] % _slideTotalFrames) : 0;
      const headerHTML = `<div id="${_slideId}" style="position:relative">
        <div class="share-personal-grid" style="display:grid;grid-template-columns:${aWin?'minmax(0,1.14fr) minmax(0,.86fr)':bWin?'minmax(0,.86fr) minmax(0,1.14fr)':'minmax(0,1fr) minmax(0,1fr)'};gap:12px;align-items:center;margin-bottom:12px">
          ${teamPosterSide('A')}
          ${teamPosterSide('B')}
        </div>
        ${_slideTotalFrames>1?`<div style="display:flex;justify-content:center;gap:5px;margin-top:6px;margin-bottom:2px">
          ${Array.from({length:_slideTotalFrames},(_,i)=>`<span style="width:7px;height:7px;border-radius:50%;background:${i===_curDotIdx?'rgba(30,41,59,.72)':'rgba(148,163,184,.38)'};transition:background .3s;display:inline-block"></span>`).join('')}
        </div>`:''}
        <span class="sc-slide-init-marker" data-sc-slide-key="${_slideKey}" data-sc-slide-total="${_slideTotalFrames}" style="display:none"></span>
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
