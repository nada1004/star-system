/* ══════════════════════════════════════════════════════════════
   대전기록 - 프로리그 대회 탭 (history-search.js 에서 분리, 2026-07-30)
   ══════════════════════════════════════════════════════════════ */

function histProCompHTML() {
  // (요청사항) 대전기록 > 프로리그 > 대회 탭 아래 하위메뉴:
  // 조별리그 / 토너먼트 / 팀전 / 중장전
  if(!window._histProCompSub) window._histProCompSub='league'; // league | tourney | team | gj
  const sub = window._histProCompSub;
  // 프로리그 대회 하위탭 색상: 청록(teal) 계열
  const _pcOn=(id)=>sub===id?'background:linear-gradient(135deg,#075985,#0891b2 58%,#38bdf8);border-color:rgba(56,189,248,.30);box-shadow:0 12px 26px rgba(8,145,178,.24);color:#fff;font-weight:800;':'';
  const _pcSubBar=`<div class="fbar merged-subbar no-export" style="overflow-x:auto;flex-wrap:nowrap;-webkit-overflow-scrolling:touch;scrollbar-width:none">
    <button class="pill ${sub==='league'?'on':''}" style="flex-shrink:0;white-space:nowrap;${_pcOn('league')}" onclick="window._histProCompSub='league';render()">📅 조별리그</button>
    <button class="pill ${sub==='tourney'?'on':''}" style="flex-shrink:0;white-space:nowrap;${_pcOn('tourney')}" onclick="window._histProCompSub='tourney';render()">🗂️ 토너먼트</button>
    <button class="pill ${sub==='team'?'on':''}" style="flex-shrink:0;white-space:nowrap;${_pcOn('team')}" onclick="window._histProCompSub='team';render()">🤝 팀전</button>
    <button class="pill ${sub==='gj'?'on':''}" style="flex-shrink:0;white-space:nowrap;${_pcOn('gj')}" onclick="window._histProCompSub='gj';render()">⚔️ 중장전</button>
  </div>`;
  let inner = '';
  if(sub==='league') inner = _histProCompLeagueListHTML();
  else if(sub==='tourney') inner = histProCompTourneyHTML(true);
  else if(sub==='team') inner = histProCompTeamHTML(true);
  else if(sub==='gj') inner = histProCompGJHTML(true);
  else inner = _histProCompLeagueListHTML();
  return _pcSubBar + inner;
}

function _pcRecDetailEsc(s){
  return String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function _pcRecDetailPhotoHTML(name, size, isLose){
  const safeName = _pcRecDetailEsc(name || '?');
  const click = name ? `onclick="event.stopPropagation();openPlayerModal('${escJS(name)}')"` : '';
  const loseStyle = isLose ? 'filter:grayscale(1);opacity:.58;' : '';
  try{
    if (typeof getPlayerPhotoHTML === 'function') {
      const html = getPlayerPhotoHTML(name, `${size}px`, `object-fit:cover;vertical-align:middle;${loseStyle}`);
      if (html) {
        return `<span style="display:inline-flex;align-items:center;justify-content:center;width:${size}px;height:${size}px;overflow:hidden;border-radius:var(--su_profile_radius,50%);clip-path:var(--su_profile_clip,none);flex-shrink:0;cursor:pointer;${loseStyle}" ${click}>${html}</span>`;
      }
    }
  }catch(e){}
  return `<span style="display:inline-flex;align-items:center;justify-content:center;width:${size}px;height:${size}px;border-radius:var(--su_profile_radius,50%);clip-path:var(--su_profile_clip,none);background:var(--surface);border:1px solid var(--border);font-size:${Math.max(11, Math.round(size*.42))}px;font-weight:900;color:var(--gray-l);flex-shrink:0;${loseStyle}" ${click}>${safeName.slice(0,1)}</span>`;
}
function _pcRecDetailPlayerHTML(name, isWin, size){
  const safeName = _pcRecDetailEsc(name || '?');
  const click = name ? `onclick="event.stopPropagation();openPlayerModal('${escJS(name)}')"` : '';
  const isLose = !isWin;
  let race = '';
  let univ = '';
  let tier = '';
  let univCol = '';
  try{
    const ps = (typeof players!=='undefined' && Array.isArray(players)) ? players : (Array.isArray(window.players) ? window.players : []);
    const p = name ? ps.find(x=>x && x.name===name) : null;
    if (p) {
      race = String(p.race || '').trim();
      univ = String(p.univ || '').trim();
      tier = String(p.tier || '').trim();
      if (univ && typeof gc === 'function') univCol = String(gc(univ) || '');
    }
  }catch(e){}
  const tierHTML = tier ? `${typeof _getTierBadge === 'function' ? _getTierBadge(tier) : `<span style="display:inline-flex;align-items:center;padding:2px 7px;border-radius:999px;background:#475569;color:#fff;font-size:10px;font-weight:800">${_pcRecDetailEsc(tier)}</span>`}` : '';
  const raceHTML = race ? `<span class="rbadge r${_pcRecDetailEsc(race)}" style="font-size:10px;padding:2px 6px">${_pcRecDetailEsc(race)}</span>` : '';
  const univHTML = univ ? `<span class="ubadge" style="background:${_pcRecDetailEsc(univCol||'#64748b')};font-size:10px;padding:2px 8px">${_pcRecDetailEsc(univ)}</span>` : '';
  const metaHTML = (tierHTML || raceHTML || univHTML) ? `<span class="pcd-player__meta">${tierHTML}${raceHTML}${univHTML}</span>` : '';
  return `<span class="pcd-player ${isWin?'is-win':'is-lose'}" style="display:inline-flex;align-items:center;gap:10px;min-width:0">
    <span class="pcd-player__photo">
      ${_pcRecDetailPhotoHTML(name, size, isLose)}
    </span>
    <span class="pcd-player__info">
      <span class="pcd-player__name" ${click} style="min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;cursor:pointer;font-size:14px;font-weight:${isWin?'900':'800'};color:${isWin?'#86efac':'#f8fafc'};${isLose?'opacity:.92;':''}">${safeName}</span>
      ${metaHTML}
    </span>
  </span>`;
}
function _pcRecDetailSummaryMetaHTML(payload){
  const games = Array.isArray(payload?.games) ? payload.games : [];
  const first = games[0] || {};
  const bits = [];
  if (first.map) bits.push(`<span class="pcd-meta2__item pcd-meta2__item--map">🗺️ ${_pcRecDetailEsc(first.map)}</span>`);
  if (first.note) bits.push(`<span class="pcd-meta2__item pcd-meta2__item--note">📝 ${_pcRecDetailEsc(first.note)}</span>`);
  if (!bits.length) return '';
  return `<div class="pcd-meta2">${bits.join('')}</div>`;
}
function _pcRecDetailRowsHTML(payload){
  const p1 = String(payload?.p1 || '');
  const p2 = String(payload?.p2 || '');
  const p1Col = String(payload?.p1Col || '#2563eb');
  const p2Col = String(payload?.p2Col || '#dc2626');
  const games = Array.isArray(payload?.games) ? payload.games : [];
  if (!games.length) {
    return `<div style="font-size:var(--fs-sm);color:var(--gray-l);padding:12px 2px">상세 게임 기록이 없습니다.</div>`;
  }
  if (games.length === 1) return '';
  return games.map((g, idx) => {
    const row = g || {};
    let left = p1 || '?';
    let right = p2 || '?';
    let winSide = '';
    let leftNames = [];
    let rightNames = [];
    if (row.wName || row.lName) {
      leftNames = _histSearchSplitSideNames(row.wName || left);
      rightNames = _histSearchSplitSideNames(row.lName || right);
      left = _histSearchTeamText(leftNames);
      right = _histSearchTeamText(rightNames);
      winSide = 'left';
    } else {
      leftNames = _histSearchGameSideNames(row, 'A');
      rightNames = _histSearchGameSideNames(row, 'B');
      left = leftNames.length ? _histSearchTeamText(leftNames) : String(row.a || left);
      right = rightNames.length ? _histSearchTeamText(rightNames) : String(row.b || right);
      const winner = String(row.winner || '');
      if (winner === 'A' || winner === left || winner === p1) winSide = 'left';
      else if (winner === 'B' || winner === right || winner === p2) winSide = 'right';
    }
    const map = row.map ? _pcRecDetailEsc(row.map) : '';
    const note = row.note ? _pcRecDetailEsc(row.note) : '';
    const leftBadge = _histSearchTeamBadge(leftNames);
    const rightBadge = _histSearchTeamBadge(rightNames);
    const isTeam = leftNames.length >= 2 || rightNames.length >= 2;
    const memberHTML = (name, isLose) => {
      const safe = _pcRecDetailEsc(name || '?');
      const click = name ? `onclick="event.stopPropagation();openPlayerModal('${escJS(name)}')"` : '';
      return `<div class="pcd-member">
        ${_pcRecDetailPhotoHTML(name, 28, isLose)}
        <span class="pcd-member__name" ${click}>${safe}</span>
      </div>`;
    };
    const teamHTML = (names, side) => {
      const isWin = winSide === side;
      const isLose = winSide && winSide !== side;
      const badge = _histSearchTeamBadge(names);
      const members = (names||[]).slice(0, 2).map(n => memberHTML(n, isLose)).join('');
      const sideCol = side === 'left' ? p1Col : p2Col;
      return `<div class="pcd-team pcd-team--${side} ${isWin?'is-win':''} ${isLose?'is-lose':''}" style="--pcd-team-col:${_pcRecDetailEsc(sideCol)}">
        <div class="pcd-team__head">
          <span class="pcd-team__badge">${badge || ''}</span>
          ${isWin?`<span class="pcd-row__win">WIN</span>`:''}
        </div>
        <div class="pcd-team__members">${members}</div>
      </div>`;
    };
    if (isTeam) {
      return `<div class="pcd-row pcd-row--team">
        ${teamHTML(leftNames, 'left')}
        <div class="pcd-mid">
          <div class="pcd-mid__idx">${idx+1}경기</div>
          ${map?`<div class="pcd-mid__map">🗺️ ${map}</div>`:''}
          ${note?`<div class="pcd-mid__note">📝 ${note}</div>`:''}
        </div>
        ${teamHTML(rightNames, 'right')}
      </div>`;
    }
    return `<div class="pcd-row">
      <span class="pcd-row__idx">${idx+1}경기</span>
      ${winSide==='left'?`<span class="pcd-row__win">WIN</span>`:''}
      <span class="pcd-row__side" style="font-weight:${winSide==='left'?'900':'700'};color:${winSide==='left'?'var(--win-col,#dc2626)':winSide==='right'?'var(--lose-col,#2563eb)':'var(--text)'}">${leftBadge}<span class="pcd-row__name">${_pcRecDetailEsc(left)}</span></span>
      <span class="pcd-row__vs">vs</span>
      <span class="pcd-row__side" style="font-weight:${winSide==='right'?'900':'700'};color:${winSide==='right'?'var(--win-col,#dc2626)':winSide==='left'?'var(--lose-col,#2563eb)':'var(--text)'}">${rightBadge}<span class="pcd-row__name">${_pcRecDetailEsc(right)}</span></span>
      ${winSide==='right'?`<span class="pcd-row__win pcd-row__win--right">WIN</span>`:''}
      ${map?`<span class="pcd-row__map">🗺️ ${map}</span>`:'<span class="pcd-row__map"></span>'}
      ${note?`<span class="pcd-row__note">📝 ${note}</span>`:''}
    </div>`;
  }).join('');
}
window.openProCompRecordDetailPopup = window.openProCompRecordDetailPopup || function(encodedPayload){
  try{
    const payload = typeof encodedPayload === 'string'
      ? JSON.parse(decodeURIComponent(encodedPayload))
      : (encodedPayload || {});
    const p1 = String(payload.p1 || payload.a || '?');
    const p2 = String(payload.p2 || payload.b || '?');
    const p1Score = Number(payload.p1Score ?? payload.sa ?? 0);
    const p2Score = Number(payload.p2Score ?? payload.sb ?? 0);
    const winner = String(payload.winner || '');
    const seriesWinner = winner===p1 ? 'A' : winner===p2 ? 'B' : (p1Score>p2Score?'A':p2Score>p1Score?'B':'');
    const _colByName = (name, fallback) => {
      try{
        const p = (players||[]).find(x=>x && String(x.name||'').trim()===String(name||'').trim());
        const col = p && p.univ ? gc(p.univ) : '';
        return (col && col !== '#6b7280') ? col : (fallback || gc(name||'') || '#64748b');
      }catch(e){
        return fallback || '#64748b';
      }
    };
    const ca = _colByName(p1, String(payload.p1Col || payload.ca || '#2563eb'));
    const cb = _colByName(p2, String(payload.p2Col || payload.cb || '#dc2626'));
    const gamesRaw = Array.isArray(payload.games) ? payload.games : [];
    const games = gamesRaw.map((g)=>{
      const ga = String(g?.a || g?.playerA || p1);
      const gb = String(g?.b || g?.playerB || p2);
      const w = String(g?.winner||'');
      const ww = (w==='A'||w==='B') ? w : (w===ga?'A':w===gb?'B':'');
      return {
        playerA: ga,
        playerB: gb,
        winner: ww || '',
        map: String(g?.map||'')
      };
    });
    const match = {
      a: p1,
      b: p2,
      sa: p1Score,
      sb: p2Score,
      d: String(payload.date || payload.d || ''),
      t: String(payload.title || payload.t || ''),
      n: String(payload.subtitle || payload.n || ''),
      sets: [{
        scoreA: p1Score,
        scoreB: p2Score,
        winner: seriesWinner,
        games
      }]
    };
    const key = `procomp:detail:${Date.now()}:${Math.random().toString(36).slice(2,7)}`;
    window._detReg = window._detReg || {};
    window._detReg[key] = {
      m: match,
      mode: 'procomp',
      lA: p1,
      lB: p2,
      ca,
      cb,
      aW: p1Score>p2Score,
      bW: p2Score>p1Score,
      idx: null
    };
    if(typeof openHistDetailModal === 'function'){
      openHistDetailModal(key);
      return;
    }
  }catch(e){
    console.warn('openProCompRecordDetailPopup failed', e);
  }
};
function _histProCompH2HCardHTML(opts){
  const o = opts || {};
  const p1 = String(o.p1||'');
  const p2 = String(o.p2||'');
  const p1Col = o.p1Col || '#3b82f6';
  const p2Col = o.p2Col || '#ef4444';
  const p1Score = Number(o.p1Score||0);
  const p2Score = Number(o.p2Score||0);
  const winner = String(o.winner||'');
  const badges = Array.isArray(o.badges) ? o.badges.filter(Boolean) : [];
  const actionHtml = o.actionHtml || '';
  const detailOnClick = o.detailOnClick ? String(o.detailOnClick) : '';
  const isMb = (typeof _h2hIsMobile === 'function') ? _h2hIsMobile() : (window.innerWidth <= 768);
  const scorePad = (typeof _h2hScorePadPx === 'function') ? _h2hScorePadPx() : (isMb ? 6 : 10);
  const scoreGap = (typeof _h2hScoreGapPx === 'function') ? _h2hScoreGapPx() : (isMb ? 8 : 10);
  const isTie = !winner && p1Score === p2Score && (p1Score + p2Score) > 0;
  const p1Bg = (typeof _h2hPlayerBgPanel === 'function')
    ? _h2hPlayerBgPanel(p1, winner === p1, !!winner && winner !== p1)
    : `<div style="padding:10px 12px;font-weight:900">${p1||'?'}</div>`;
  const p2Bg = (typeof _h2hPlayerBgPanel === 'function')
    ? _h2hPlayerBgPanel(p2, winner === p2, !!winner && winner !== p2)
    : `<div style="padding:10px 12px;font-weight:900">${p2||'?'}</div>`;
  const mode = (typeof _h2hCardMode === 'function') ? _h2hCardMode() : 'panel';
  const scoreColP1 = winner === p1 ? 'var(--win-col)' : winner === p2 ? 'var(--lose-col)' : (isTie ? '#b45309' : 'var(--text2)');
  const scoreColP2 = winner === p2 ? 'var(--win-col)' : winner === p1 ? 'var(--lose-col)' : (isTie ? '#b45309' : 'var(--text2)');
  const body = (typeof _h2hCardBody === 'function')
    ? _h2hCardBody(mode, { p1, p2, d:o.date||'', games:o.games||[] }, p1Score, p2Score, winner, p1Col, p2Col, '1fr auto 1fr', isMb, scorePad, scoreGap, '', p1Bg, p2Bg, scoreColP1, scoreColP2)
    : `<div style="display:flex;align-items:center;justify-content:space-between;padding:${isMb?'10px':'14px'}"><div>${p1}</div><div style="font-weight:900">${p1Score}:${p2Score}</div><div>${p2}</div></div>`;
  const wrapFx = (typeof _safeHeadToHeadSideFx === 'function') ? _safeHeadToHeadSideFx(p1Col, p2Col) : 'background:var(--white);';
  return `<div class="h2h-rec-card" style="border:var(--h2h-card-border,1px solid var(--border));border-bottom:var(--h2h-card-border-bottom,none);border-radius:var(--h2h-card-radius,12px);margin-bottom:var(--h2h-card-gap,8px);overflow:hidden;box-shadow:var(--h2h-card-shadow,none);${wrapFx||'background:var(--white);'}">
    <div${detailOnClick?` style="cursor:pointer" onclick="${detailOnClick}" title="경기 상세 열기"`:''}>
      ${body}
    </div>
    <div style="border-top:1px solid var(--border);display:flex;align-items:center;gap:8px;padding:${isMb?'7px 10px':'8px 14px'};background:var(--bg2);flex-wrap:wrap">
      ${badges.join('')}
      <span style="margin-left:auto"></span>
      ${actionHtml?`<span onclick="event.stopPropagation()">${actionHtml}</span>`:''}
    </div>
  </div>`;
}

// 대전기록 > 프로리그 > 대회 > 조별리그(리스트)
function _histProCompLeagueListHTML(){
  // proTourneys에서 완료된 경기만 추출 (조별리그)
  const allItems = [];
  (proTourneys||[]).forEach(tn => {
    // 조별리그 경기
    (tn.groups||[]).forEach((grp, gi) => {
      const gl = 'ABCDEFGHIJ'[gi]||gi;
      const col = ['#2563eb','#dc2626','#16a34a','#d97706','#7c3aed','#0891b2'][gi%6];
      (grp.matches||[]).forEach((m, mi) => {
        if (!m.a||!m.b||!m.winner) return;
        // (요청사항) 조편성 관리에서 "기록 반영=대진표 기록(stage)"인 경우
        // 조별리그 기록 목록에 중복으로 노출되지 않도록 제외
        if (m._stageRecId || (grp._recTarget||'')==='stage') return;
        if (typeof passDateFilter==='function'&&!passDateFilter(m.d||'')) return;
        allItems.push({...m, _tnName:tn.name, _tnId:tn.id, _gi:gi, _mi:mi, _stage:'조별리그', _stageDetail:`GROUP ${gl}`, _stageColor:col});
      });
    });
  });
  allItems.sort((a,b)=>recSortDir==='asc'?(a.d||'').localeCompare(b.d||''):(b.d||'').localeCompare(a.d||''));
  const sortBar = ``;
  if (!allItems.length) return sortBar+`<div class="empty-state"><div class="empty-state-icon">🏅</div><div class="empty-state-title">프로리그 대회 기록이 없습니다</div><div class="empty-state-desc">대회 경기를 입력하면 여기에 표시됩니다</div></div>`;

  let h = '';
  // 대회명별 그룹화
  const groups = {};
  allItems.forEach(m => {
    if (!groups[m._tnName]) groups[m._tnName] = [];
    groups[m._tnName].push(m);
  });

  const _tb = p => p&&p.tier?`<span style="background:${getTierBtnColor(p.tier)||'#64748b'};color:${getTierBtnTextColor(p.tier)||'#fff'};font-size:9px;font-weight:700;padding:1px 4px;border-radius:3px">${p.tier}</span>`:'';
  const _rb = p => p&&p.race?`<span class="rbadge r${p.race}" style="font-size:9px;padding:0 3px">${p.race}</span>`:'';
  const _avaPx = (()=>{ try{ const pc=parseInt(localStorage.getItem('su_procomp_avatar_pc')||'52',10)||52; const mb=parseInt(localStorage.getItem('su_procomp_avatar_mb')||'40',10)||40; const isMb=window.innerWidth<=768; return Math.max(18, Math.min(160, isMb?mb:pc)); }catch(e){ return 22; } })();
  const _avaFit = (()=>{ try{ const v=String(localStorage.getItem('su_procomp_avatar_fit')||'cover').trim(); return (v==='contain'||v==='cover'||v==='fill')?v:'cover'; }catch(e){ return 'cover'; } })();
  const _photo = (name)=>{ try{ return (typeof getPlayerPhotoHTML==='function') ? getPlayerPhotoHTML(name, _avaPx+'px', `margin-right:3px;object-fit:${_avaFit};vertical-align:middle;`) : ''; }catch(e){ return ''; } };

  h += sortBar;
  Object.entries(groups).forEach(([tnName, items]) => {
    h += `<div style="background:linear-gradient(135deg,var(--blue-l) 0%,var(--white) 100%);border:1.5px solid var(--blue-ll);border-left:4px solid #0891b2;border-radius:12px;padding:12px 16px;margin:14px 0 6px;display:flex;align-items:center;gap:8px;flex-wrap:wrap">
      <span style="font-size:16px">🏅</span>
      <span style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:var(--fs-md);color:#0891b2">${tnName}</span>
      <span style="font-size:var(--fs-caption);font-weight:700;color:#0891b2;background:#e0f2fe;border-radius:20px;padding:2px 10px;margin-left:auto">${items.length}경기</span>
    </div>`;
    items.forEach(m => {
      const pa = players.find(p=>String(p.name||'').trim()===String(m.a||'').trim());
      const pb = players.find(p=>String(p.name||'').trim()===String(m.b||'').trim());
      const aWin = m.winner==='A';
      const bWin = m.winner==='B';
      const _gcByUniv = (name, p)=>{
        try{
          const u = p && p.univ ? gc(p.univ) : '';
          return (u && u !== '#6b7280') ? u : gc(name||'');
        }catch(e){
          return gc(name||'');
        }
      };
      const ca = _gcByUniv(m.a, pa);
      const cb = _gcByUniv(m.b, pb);
      const _detailPayload = encodeURIComponent(JSON.stringify({
        title:'프로리그 대회 조별리그',
        subtitle:`${m._tnName||''} · ${m._stageDetail||''}`,
        p1:m.a, p2:m.b, p1Score:aWin?1:0, p2Score:bWin?1:0,
        winner:aWin?m.a:(bWin?m.b:''), date:m.d||'', games:[m]
      }));
      const _menuBtn = `<button class="btn btn-w btn-xs rec-morebtn" style="padding:3px 10px;font-size:14px" title="메뉴"
        onclick="openRecActionMenu(event,{
          _btnEl:this,
          hideDetail:true,
          a:'${(m.a||'').replace(/'/g,"\\'")}',
          sa:${aWin?1:0},
          b:'${(m.b||'').replace(/'/g,"\\'")}',
          sb:${bWin?1:0},
          d:'${m.d||''}',
          mode:'procomp',
          idx:0,
          key:'',
          canShare:true,
          shareFn:()=>openProCompMatchShare('${(m.a||'').replace(/'/g,"\\'")}','${(m.b||'').replace(/'/g,"\\'")}',${aWin?1:0},${bWin?1:0},'${m.d||''}'),
          canEdit:${isLoggedIn?'true':'false'},
          canDel:${isLoggedIn?'true':'false'},
          editFn:${isLoggedIn?`()=>proCompEditMatch('${m._tnId||''}',${m._gi||0},${m._mi||0})`:'null'},
          delFn:${isLoggedIn?`()=>proCompDelMatch('${m._tnId||''}',${m._gi||0},${m._mi||0})`:'null'},
          canMove:false
        })">⋯</button>`;
      h += _histProCompH2HCardHTML({
        p1:m.a, p2:m.b, p1Col:ca, p2Col:cb,
        p1Score:aWin?1:0, p2Score:bWin?1:0,
        winner:aWin?m.a:(bWin?m.b:''),
        date:m.d||'', games:[m],
        badges:[
          `<span style="font-size:var(--fs-caption);color:var(--gray-l)">${m.d?m.d.slice(2).replace(/-/g,'/'):'미정'}</span>`,
          `<span style="font-size:10px;font-weight:700;padding:2px 8px;border-radius:99px;background:#e0f2fe;color:#0891b2">조별리그</span>`,
          `<span style="font-size:10px;font-weight:700;padding:2px 8px;border-radius:99px;background:${m._stageColor};color:#fff">${m._stageDetail}</span>`,
          m.map?`<span style="font-size:var(--fs-caption);color:var(--gray-l)">🗺️ ${m.map}</span>`:'',
          pa&&pa.univ?`<span style="font-size:var(--fs-caption);color:${ca};font-weight:800">${pa.univ}</span>`:'',
          pb&&pb.univ?`<span style="font-size:var(--fs-caption);color:${cb};font-weight:800">${pb.univ}</span>`:''
        ],
        detailOnClick:`window.openProCompRecordDetailPopup('${_detailPayload}')`,
        actionHtml:_menuBtn
      });
    });
  });
  return h;
}

/* ══════════════════════════════════════
   대전 기록 > 프로리그 토너먼트 탭 (대진표 + 3위전)
══════════════════════════════════════ */
function histProCompTourneyHTML(_omitBar) {
  const _pcSubBar2=_omitBar?'':`<div class="fbar merged-subbar no-export" style="overflow-x:auto;flex-wrap:nowrap;-webkit-overflow-scrolling:touch;scrollbar-width:none">
    <button class="pill" style="flex-shrink:0;white-space:nowrap" onclick="window._histProCompSub='league';histSub='procomp';render()">📅 조별리그</button>
    <button class="pill on" style="flex-shrink:0;white-space:nowrap">🗂️ 토너먼트</button>
    <button class="pill" style="flex-shrink:0;white-space:nowrap" onclick="window._histProCompSub='team';histSub='procomp';render()">🤝 팀전</button>
    <button class="pill" style="flex-shrink:0;white-space:nowrap" onclick="window._histProCompSub='gj';histSub='procomp';render()">⚔️ 중장전</button>
  </div>`;
  const allItems = [];
  (proTourneys||[]).forEach(tn => {
    // 1) (신규) 대진표 기록(라운드 기록) 기반
    if(tn && tn.stageRecords){
      const st = tn.stageRecords || {};
      const order=['64강','32강','16강','8강','4강','결승'];
      const colOf = (r)=>r==='결승'?'#f59e0b':r==='4강'?'#7c3aed':r==='8강'?'#dc2626':'#2563eb';
      let hasStageItems = false;
      order.forEach(r=>{
        (st[r]||[]).forEach((m, idx)=>{
          if(!m||!m.a||!m.b||!m.winner) return;
          if (typeof passDateFilter==='function'&&!passDateFilter(m.d||'')) return;
          hasStageItems = true;
          allItems.push({...m, _tnName:tn.name, _tnId:tn.id, _round:r, _idx:idx, _stage:'토너먼트', _stageDetail:r, _stageColor:colOf(r), d:m.d||''});
        });
      });
      if(hasStageItems) return;
    }
    // 2) (호환) 기존 대진표(bracket) 기반
    const rounds = tn.bracket||[];
    const totalRounds = rounds.length;
    rounds.forEach((rnd, ri) => {
      // 라운드 표기: 16강/8강/4강/결승 (※ 4강=준결승)
      const rndLabel = ri===totalRounds-1?'결승':ri===totalRounds-2?'4강':ri===totalRounds-3?'8강':`${Math.pow(2,totalRounds-ri)}강`;
      const stageColor = ri===totalRounds-1?'#f59e0b':ri===totalRounds-2?'#7c3aed':ri===totalRounds-3?'#dc2626':'#2563eb';
      rnd.forEach(m => {
        if (!m.a||!m.b) return;
        const scoreA = (m._games||[]).filter(g=>g.winner==='A').length;
        const scoreB = (m._games||[]).filter(g=>g.winner==='B').length;
        const isTieSaved = (!m.winner && Array.isArray(m._games) && m._games.length>0 && scoreA===scoreB && (scoreA+scoreB)>0);
        if (!m.winner && !isTieSaved) return;
        if (typeof passDateFilter==='function'&&!passDateFilter(m.d||'')) return;
        allItems.push({...m, _tnName:tn.name, _tnId:tn.id, _ri:ri, _mi:(m._mi!==undefined?m._mi:null), _stage:'토너먼트', _stageDetail:rndLabel, _stageColor:stageColor, d:m.d||'', _isTie:isTieSaved, _scoreA:scoreA, _scoreB:scoreB});
      });
    });
    if (tn.thirdPlace&&tn.thirdPlace.a&&tn.thirdPlace.b&&tn.thirdPlace.winner) {
      if (!(typeof passDateFilter==='function'&&!passDateFilter(tn.thirdPlace.d||''))) {
        allItems.push({...tn.thirdPlace, _tnName:tn.name, _tnId:tn.id, _ri:'3rd', _mi:0, _stage:'토너먼트', _stageDetail:'3위전', _stageColor:'#cd7f32', d:tn.thirdPlace.d||''});
      }
    }
  });
  allItems.sort((a,b)=>recSortDir==='asc'?(a.d||'').localeCompare(b.d||''):(b.d||'').localeCompare(a.d||''));
  const sortBar=``;
  if (!allItems.length) return _pcSubBar2+sortBar+`<div class="empty-state"><div class="empty-state-icon">🗂️</div><div class="empty-state-title">토너먼트 기록이 없습니다</div><div class="empty-state-desc">대진표 기록에서 결과를 입력하면 여기에 표시됩니다</div></div>`;
  const groups={};
  allItems.forEach(m=>{if(!groups[m._tnName])groups[m._tnName]=[];groups[m._tnName].push(m);});
  const _tb=p=>p&&p.tier?`<span style="background:${getTierBtnColor(p.tier)||'#64748b'};color:${getTierBtnTextColor(p.tier)||'#fff'};font-size:9px;font-weight:700;padding:1px 4px;border-radius:3px">${p.tier}</span>`:'';
  const _rb=p=>p&&p.race?`<span class="rbadge r${p.race}" style="font-size:9px;padding:0 3px">${p.race}</span>`:'';
  const _avaPx = (()=>{ try{ const pc=parseInt(localStorage.getItem('su_procomp_avatar_pc')||'52',10)||52; const mb=parseInt(localStorage.getItem('su_procomp_avatar_mb')||'40',10)||40; const isMb=window.innerWidth<=768; return Math.max(18, Math.min(160, isMb?mb:pc)); }catch(e){ return 22; } })();
  const _avaFit = (()=>{ try{ const v=String(localStorage.getItem('su_procomp_avatar_fit')||'cover').trim(); return (v==='contain'||v==='cover'||v==='fill')?v:'cover'; }catch(e){ return 'cover'; } })();
  const _photo = (name)=>{ try{ return (typeof getPlayerPhotoHTML==='function') ? getPlayerPhotoHTML(name, _avaPx+'px', `margin-right:3px;object-fit:${_avaFit};vertical-align:middle;`) : ''; }catch(e){ return ''; } };
  let h=_pcSubBar2+sortBar;
  Object.entries(groups).forEach(([tnName,items])=>{
    h+=`<div style="background:linear-gradient(135deg,#f5f3ff 0%,var(--white) 100%);border:1.5px solid #ddd6fe;border-left:4px solid #7c3aed;border-radius:12px;padding:12px 16px;margin:14px 0 6px;display:flex;align-items:center;gap:8px;flex-wrap:wrap">
      <span style="font-size:16px">🗂️</span>
      <span style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:var(--fs-md);color:#7c3aed">${tnName}</span>
      <span style="font-size:var(--fs-caption);font-weight:700;color:#7c3aed;background:#f5f3ff;border-radius:20px;padding:2px 10px;margin-left:auto">${items.length}경기</span>
    </div>`;
    items.forEach(m=>{
      const pa=players.find(p=>String(p.name||'').trim()===String(m.a||'').trim());
      const pb=players.find(p=>String(p.name||'').trim()===String(m.b||'').trim());
      const aWin=m.winner==='A', bWin=m.winner==='B';
      const _gcByUniv = (name, p)=>{
        try{
          const u = p && p.univ ? gc(p.univ) : '';
          return (u && u !== '#6b7280') ? u : gc(name||'');
        }catch(e){
          return gc(name||'');
        }
      };
      const ca = _gcByUniv(m.a, pa);
      const cb = _gcByUniv(m.b, pb);
      const _detailPayload = encodeURIComponent(JSON.stringify({
        title:'프로리그 대회 토너먼트',
        subtitle:`${m._tnName||''} · ${m._stageDetail||''}`,
        p1:m.a, p2:m.b,
        p1Score:m._isTie?(m._scoreA||0):(aWin?1:0),
        p2Score:m._isTie?(m._scoreB||0):(bWin?1:0),
        winner:m._isTie?'':(aWin?m.a:(bWin?m.b:'')),
        date:m.d||'',
        games:(Array.isArray(m._games)&&m._games.length)?m._games:[m]
      }));
      const _menuBtn = `<button class="btn btn-w btn-xs rec-morebtn" style="padding:3px 10px;font-size:14px" title="메뉴"
        onclick="openRecActionMenu(event,{
          _btnEl:this,
          hideDetail:true,
          a:'${(m.a||'').replace(/'/g,"\\'")}',
          sa:${m._isTie?(m._scoreA||0):(aWin?1:0)},
          b:'${(m.b||'').replace(/'/g,"\\'")}',
          sb:${m._isTie?(m._scoreB||0):(bWin?1:0)},
          d:'${m.d||''}',
          mode:'procomptn',
          idx:0,
          key:'',
          canShare:true,
          shareFn:()=>openProCompMatchShare('${(m.a||'').replace(/'/g,"\\'")}','${(m.b||'').replace(/'/g,"\\'")}',${m._isTie?(m._scoreA||0):(aWin?1:0)},${m._isTie?(m._scoreB||0):(bWin?1:0)},'${m.d||''}'),
          canEdit:${isLoggedIn?'true':'false'},
          canDel:false,
          editFn:${isLoggedIn?`()=>{ try{ if(typeof openPcStageRecModal==='function' && m._round) openPcStageRecModal('${(m._tnId||'').replace(/'/g,"\\'")}', '${(m._round||'').replace(/'/g,"\\'")}', ${m._idx||0}); else if(typeof openPcBktPasteModal==='function') openPcBktPasteModal('${(m._tnId||'').replace(/'/g,"\\'")}', ${JSON.stringify(m._ri)}, ${m._mi||0}); }catch(e){} }`:'null'},
          canMove:false
        })">⋯</button>`;
      h+=_histProCompH2HCardHTML({
        p1:m.a, p2:m.b, p1Col:ca, p2Col:cb,
        p1Score:m._isTie?(m._scoreA||0):(aWin?1:0),
        p2Score:m._isTie?(m._scoreB||0):(bWin?1:0),
        winner:m._isTie?'':(aWin?m.a:(bWin?m.b:'')),
        date:m.d||'', games:m._games||[m],
        badges:[
          `<span style="font-size:var(--fs-caption);color:var(--gray-l)">${m.d?m.d.slice(2).replace(/-/g,'/'):'미정'}</span>`,
          `<span style="font-size:10px;font-weight:700;padding:2px 8px;border-radius:99px;background:#f5f3ff;color:#7c3aed">토너먼트</span>`,
          `<span style="font-size:10px;font-weight:700;padding:2px 8px;border-radius:99px;background:${m._stageColor};color:#fff">${m._stageDetail}</span>`,
          m._isTie?`<span style="font-size:10px;font-weight:800;padding:2px 8px;border-radius:99px;background:#fffbeb;color:#b45309">⚖️ ${m._scoreA||0}:${m._scoreB||0}</span>`:'',
          m.map?`<span style="font-size:var(--fs-caption);color:var(--gray-l)">🗺️ ${m.map}</span>`:'',
          pa&&pa.univ?`<span style="font-size:var(--fs-caption);color:${ca};font-weight:800">${pa.univ}</span>`:'',
          pb&&pb.univ?`<span style="font-size:var(--fs-caption);color:${cb};font-weight:800">${pb.univ}</span>`:''
        ],
        detailOnClick:`window.openProCompRecordDetailPopup('${_detailPayload}')`,
        actionHtml:_menuBtn
      });
    });
  });
  return h;
}

/* ══════════════════════════════════════
   대전 기록 > 프로리그 팀전 탭
══════════════════════════════════════ */
function histProCompTeamHTML(_omitBar) {
  // proTourneys.teamMatches 전체 추출
  const tmList = []; // [{tnName, tm}]
  (proTourneys||[]).forEach(tn => {
    (tn.teamMatches||[]).forEach(tm => {
      const games = (tm.games||[]).filter(g=>g.wName&&g.lName);
      if (!games.length) return;
      if (typeof passDateFilter==='function'&&!passDateFilter(tm.d||'')) return;
      tmList.push({tnName:tn.name, tm});
    });
  });
  tmList.sort((a,b)=>recSortDir==='asc'?(a.tm.d||'').localeCompare(b.tm.d||''):(b.tm.d||'').localeCompare(a.tm.d||''));
  const totalGames = tmList.reduce((s,x)=>s+(x.tm.games||[]).filter(g=>g.wName&&g.lName).length,0);
  const sortBar=`<div class="fbar no-export" style="overflow-x:auto;flex-wrap:nowrap;-webkit-overflow-scrolling:touch;scrollbar-width:none;gap:4px;margin-bottom:6px;align-items:center">
    <span style="font-size:var(--fs-caption);color:var(--gray-l)">${totalGames}경기 / ${tmList.length}팀전</span>
  </div>`;
  if (!tmList.length) return sortBar+`<div class="empty-state"><div class="empty-state-icon">🤝</div><div class="empty-state-title">팀전 기록이 없습니다</div><div class="empty-state-desc">프로리그 대회 팀전 결과를 입력하면 여기에 표시됩니다</div></div>`;
  const _tb=p=>p&&p.tier?`<span style="background:${getTierBtnColor(p.tier)||'#64748b'};color:${getTierBtnTextColor(p.tier)||'#fff'};font-size:9px;font-weight:700;padding:1px 4px;border-radius:3px">${p.tier}</span>`:'';
  const _rb=p=>p&&p.race?`<span class="rbadge r${p.race}" style="font-size:9px;padding:0 3px">${p.race}</span>`:'';
  const _avaPx = (()=>{ try{ const pc=parseInt(localStorage.getItem('su_procomp_avatar_pc')||'52',10)||52; const mb=parseInt(localStorage.getItem('su_procomp_avatar_mb')||'40',10)||40; const isMb=window.innerWidth<=768; return Math.max(18, Math.min(160, isMb?mb:pc)); }catch(e){ return 22; } })();
  const _avaFit = (()=>{ try{ const v=String(localStorage.getItem('su_procomp_avatar_fit')||'cover').trim(); return (v==='contain'||v==='cover'||v==='fill')?v:'cover'; }catch(e){ return 'cover'; } })();
  const _photo = (name)=>{ try{ return (typeof getPlayerPhotoHTML==='function') ? getPlayerPhotoHTML(name, _avaPx+'px', `margin-right:3px;object-fit:${_avaFit};vertical-align:middle;`) : ''; }catch(e){ return ''; } };
  const _proSideCols = getFixedSideColors('pro');
  const colA=_proSideCols.a, colB=_proSideCols.b;
  let h=sortBar;
  // 대회명별 그룹
  const byTn={};
  tmList.forEach(({tnName,tm})=>{ if(!byTn[tnName])byTn[tnName]=[]; byTn[tnName].push(tm); });
  Object.entries(byTn).forEach(([tnName,tms])=>{
    const gCnt=tms.reduce((s,tm)=>s+(tm.games||[]).filter(g=>g.wName&&g.lName).length,0);
    h+=`<div style="background:linear-gradient(135deg,#ecfdf5 0%,var(--white) 100%);border:1.5px solid #bbf7d0;border-left:4px solid #16a34a;border-radius:12px;padding:12px 16px;margin:14px 0 6px;display:flex;align-items:center;gap:8px;flex-wrap:wrap">
      <span style="font-size:16px">🤝</span>
      <span style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:var(--fs-md);color:#16a34a">${tnName}</span>
      <span style="font-size:var(--fs-caption);font-weight:700;color:#16a34a;background:#dcfce7;border-radius:20px;padding:2px 10px;margin-left:auto">${tms.length}팀전 · ${gCnt}경기</span>
    </div>`;
    tms.forEach(tm=>{
      const aWin=tm.sa>tm.sb, bWin=tm.sb>tm.sa;
      const games=(tm.games||[]).filter(g=>g.wName&&g.lName);
      const _teamDetailPayload = encodeURIComponent(JSON.stringify({
        title:'프로리그 대회 팀전',
        subtitle:`${tnName||''} · ${tm.teamAName||'A팀'} vs ${tm.teamBName||'B팀'}`,
        p1:tm.teamAName||'A팀', p2:tm.teamBName||'B팀',
        p1Score:tm.sa||0, p2Score:tm.sb||0,
        winner:aWin?(tm.teamAName||'A팀'):(bWin?(tm.teamBName||'B팀'):''),
        date:tm.d||'', games:games
      }));
      h+=`<div class="rec-summary${_recSideFxClass('procompteam')}" data-rec-mode="procompteam" style="border:1.5px solid var(--border);border-radius:var(--r);padding:0;margin-bottom:10px;${_recSideFxStyle('procompteam',colA,colB)}">
        <div class="rec-sum-header rec-sum-header--stack" style="padding:10px 14px">
          <div class="rec-topline">
            <div class="rec-meta-row">
              <span class="rec-meta-chip">📅 ${tm.d||'날짜 미정'}</span>
              <span class="rec-meta-chip rec-meta-chip--blue">팀전</span>
              <span class="rec-meta-chip" style="background:${aWin?colA:bWin?colB:'#64748b'};border-color:${aWin?colA:bWin?colB:'#64748b'};color:#fff;cursor:pointer" onclick="window.openProCompRecordDetailPopup('${_teamDetailPayload}')" title="경기 상세 열기">${tm.sa||0}:${tm.sb||0}</span>
              <span class="rec-meta-chip">${games.length}경기</span>
            </div>
            <div class="rec-actions rec-actions--inline no-export">
              <button class="btn btn-w btn-xs rec-morebtn" style="padding:3px 10px;font-size:14px" title="메뉴"
                onclick="openRecActionMenu(event,{
                  _btnEl:this,
                  hideDetail:true,
                  a:'${(tm.teamAName||'A팀').replace(/'/g,"\\'")}',
                  sa:${tm.sa||0},
                  b:'${(tm.teamBName||'B팀').replace(/'/g,"\\'")}',
                  sb:${tm.sb||0},
                  d:'${tm.d||''}',
                  mode:'procomp-team',
                  idx:0,
                  key:'',
                  canShare:true,
                  shareFn:()=>openProCompMatchShare('${(tm.teamAName||'A팀').replace(/'/g,"\\'")}','${(tm.teamBName||'B팀').replace(/'/g,"\\'")}',${tm.sa||0},${tm.sb||0},'${tm.d||''}'),
                  canEdit:false,
                  canDel:false,
                  canMove:false
                })">⋯</button>
            </div>
          </div>
          <div class="rec-sum-vs" style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;justify-content:center">
            <span style="font-weight:${aWin?900:700};color:${aWin?colA:'var(--text)'};font-size:14px">${tm.teamAName||'A팀'}</span>
            <span style="font-size:var(--fs-sm);color:var(--gray-l);font-weight:900">vs</span>
            <span style="font-weight:${bWin?900:700};color:${bWin?colB:'var(--text)'};font-size:14px">${tm.teamBName||'B팀'}</span>
          </div>
        </div>
        ${games.map(g=>{
          const pw=players.find(p=>p.name===g.wName), pl=players.find(p=>p.name===g.lName);
          const wNames = _histSearchSplitSideNames(g.wName);
          const lNames = _histSearchSplitSideNames(g.lName);
          const wDisplay = _histSearchTeamText(wNames);
          const lDisplay = _histSearchTeamText(lNames);
          const isTeamGame = wNames.length >= 2 || lNames.length >= 2;
          const sideWin=g._sideW==='A'?tm.teamAName||'A팀':tm.teamBName||'B팀';
          const winCol = g._sideW==='A' ? colA : colB;
          const loseCol = g._sideW==='A' ? colB : colA;
          const _detailPayload = encodeURIComponent(JSON.stringify({
            title:'프로리그 대회 팀전 세트',
            subtitle:`${tnName||''} · ${sideWin}`,
            p1:wDisplay, p2:lDisplay, p1Score:1, p2Score:0, winner:wDisplay, date:tm.d||'', games:[g]
          }));
          return _histProCompH2HCardHTML({
            p1:wDisplay, p2:lDisplay, p1Col:winCol, p2Col:loseCol,
            p1Score:1, p2Score:0, winner:wDisplay, date:tm.d||'', games:[g],
            badges:[
              `<span style="font-size:var(--fs-caption);color:var(--gray-l)">${tm.d?tm.d.slice(2).replace(/-/g,'/'):'미정'}</span>`,
              `<span style="font-size:10px;font-weight:700;padding:2px 8px;border-radius:99px;background:${winCol};color:#fff">${sideWin}</span>`,
              `<span style="font-size:10px;font-weight:700;padding:2px 8px;border-radius:99px;background:#e0f2fe;color:#0284c7">${isTeamGame ? '2:2' : '팀전'}</span>`,
              g.map?`<span style="font-size:var(--fs-caption);color:var(--gray-l)">🗺️ ${g.map}</span>`:'',
              pw&&pw.univ?`<span style="font-size:var(--fs-caption);color:${winCol};font-weight:800">${pw.univ}</span>`:'',
              pl&&pl.univ?`<span style="font-size:var(--fs-caption);color:${loseCol};font-weight:800">${pl.univ}</span>`:''
            ],
            detailOnClick:`window.openProCompRecordDetailPopup('${_detailPayload}')`
          });
        }).join('')}
      </div>`;
    });
  });
  return h;
}

/* ══════════════════════════════════════
   ⚔️ 프로리그 대회 중장전 기록
══════════════════════════════════════ */
function histProCompGJHTML(_omitBar){
  const _pcGjBar=_omitBar?'':`<div class="fbar merged-subbar no-export" style="overflow-x:auto;flex-wrap:nowrap;-webkit-overflow-scrolling:touch;scrollbar-width:none">
    <button class="pill" style="flex-shrink:0;white-space:nowrap" onclick="window._histProCompSub='league';histSub='procomp';render()">📅 조별리그</button>
    <button class="pill" style="flex-shrink:0;white-space:nowrap" onclick="window._histProCompSub='tourney';histSub='procomp';render()">🗂️ 토너먼트</button>
    <button class="pill" style="flex-shrink:0;white-space:nowrap" onclick="window._histProCompSub='team';histSub='procomp';render()">🤝 팀전</button>
    <button class="pill on" style="flex-shrink:0;white-space:nowrap">⚔️ 중장전</button>
  </div>`;
  const allSess=[];
  (proTourneys||[]).forEach(tn=>{
    (tn.gjMatches||[]).forEach(sess=>{
      allSess.push({...sess,tnName:tn.name});
    });
  });
  if(!allSess.length)return _pcGjBar+`<div class="empty-state"><div class="empty-state-icon">⚔️</div><div class="empty-state-title">프로리그 대회 중장전 기록이 없습니다</div><div class="empty-state-desc">프로리그 대회 탭 → 중장전에서 입력하세요</div></div>`;
  allSess.sort((a,b)=>(b.d||'').localeCompare(a.d||''));
  let h=_pcGjBar;
  allSess.forEach(sess=>{
    const p1w=(sess.games||[]).filter(g=>g.winner===sess.a).length;
    const p2w=(sess.games||[]).filter(g=>g.winner===sess.b).length;
    const winner=p1w>p2w?sess.a:p2w>p1w?sess.b:'';
    const _sid = String(sess._id||'').replace(/'/g,"\\'");
    const pa = players.find(p=>String(p.name||'').trim()===String(sess.a||'').trim());
    const pb = players.find(p=>String(p.name||'').trim()===String(sess.b||'').trim());
    const _gcByUniv = (name, p)=>{
      try{
        const u = p && p.univ ? gc(p.univ) : '';
        return (u && u !== '#6b7280') ? u : gc(name||'');
      }catch(e){
        return gc(name||'');
      }
    };
    const _pcgjColA=_gcByUniv(sess.a, pa);
    const _pcgjColB=_gcByUniv(sess.b, pb);
    const _detailBtn = `<button class="btn btn-w btn-xs no-export" onclick="openMatchDetailByMatchId('${_sid}','프로리그대회끝장전')">📂 경기 상세</button>`;
    h += _histProCompH2HCardHTML({
      p1:sess.a, p2:sess.b, p1Col:_pcgjColA, p2Col:_pcgjColB,
      p1Score:p1w, p2Score:p2w, winner:winner,
      date:sess.d||'', games:(sess.games||[]),
      badges:[
        `<span style="font-size:var(--fs-caption);color:var(--gray-l)">${sess.d||'날짜 미정'}</span>`,
        `<span style="font-size:10px;font-weight:700;padding:2px 8px;border-radius:99px;background:#dcfce7;color:#166534">중장전</span>`,
        `<span style="font-size:10px;font-weight:700;padding:2px 8px;border-radius:99px;background:#0891b2;color:#fff">🎖️ ${sess.tnName||''}</span>`,
        `<span style="font-size:var(--fs-caption);color:var(--gray-l)">${(sess.games||[]).length}게임</span>`,
        pa&&pa.univ?`<span style="font-size:var(--fs-caption);color:${_pcgjColA};font-weight:800">${pa.univ}</span>`:'',
        pb&&pb.univ?`<span style="font-size:var(--fs-caption);color:${_pcgjColB};font-weight:800">${pb.univ}</span>`:'',
        winner?`<span style="font-size:10px;font-weight:800;padding:2px 8px;border-radius:99px;background:${winner===sess.a?_pcgjColA:_pcgjColB};color:#fff">${winner} 승</span>`:''
      ],
      detailOnClick:`openMatchDetailByMatchId('${_sid}','프로리그대회끝장전')`,
      actionHtml:_detailBtn
    });
  });
  return h;
}

// 팀 멤버 팝업 (프로리그, 미니, 대학, 티어, 토너먼트 등)
function openProMembersPopup(teamLabel, teamColor, members){
  try{
    if(!members || !members.length) return;

    // 이미 열린 모달이 있으면 닫기
    const existing = document.getElementById('proMembersModal');
    if(existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'proMembersModal';
    // modal-drag.js가 인식하도록 class 부여 (PC에서 헤더 드래그 이동)
    modal.className = 'modal';
    modal.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:var(--z-top);display:flex;align-items:center;justify-content:center;padding:16px;box-sizing:border-box;';

    const membersHTML = members.map(mem => {
      const memName = typeof mem === 'string' ? mem : (mem.name || mem);
      const p = players.find(x => x.name === memName) || {};
      const pColor = gc(p.univ) || '#64748b';
      return `
        <div style="display:flex;align-items:center;gap:10px;padding:10px;background:#f9fafb;border-radius:var(--r);border:1px solid #e5e7eb;">
          <span style="cursor:pointer" onclick="openPlayerModal('${memName.replace(/'/g,"\\'")}')">
            ${getPlayerPhotoHTML(memName, '44px')}
          </span>
          <div style="flex:1;min-width:0;">
            <div style="font-weight:700;font-size:14px;color:#1f2937;cursor:pointer" onclick="openPlayerModal('${memName.replace(/'/g,"\\'")}')">${memName}</div>
            <div style="font-size:var(--fs-caption);color:#6b7280;display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
              ${p.univ ? `<span class="ubadge" style="background:${pColor};font-size:10px;padding:1px 6px;">${p.univ}</span>` : ''}
              ${p.tier ? `<span style="background:${getTierBtnColor(p.tier)};color:${getTierBtnTextColor(p.tier)};font-size:10px;padding:1px 6px;border-radius:4px;font-weight:700;">${p.tier}</span>` : ''}
              ${p.race ? `<span class="rbadge r${p.race}" style="font-size:10px;padding:1px 5px;">${p.race}</span>` : ''}
            </div>
          </div>
        </div>
      `;
    }).join('');

    modal.innerHTML = `
      <div class="mbox" style="background:var(--white);border-radius:var(--r2);max-width:420px;width:100%;max-height:80vh;overflow:auto;padding:18px 18px 16px;box-shadow:0 20px 60px rgba(0,0,0,0.3);">
        <div class="mtitle" style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;cursor:move;user-select:none">
          <div style="display:flex;align-items:center;gap:10px;min-width:0;">
            <span style="width:12px;height:12px;border-radius:50%;background:${teamColor};flex-shrink:0"></span>
            <div style="min-width:0">
              <div style="margin:0;font-size:16px;font-weight:900;line-height:1.1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${teamLabel} 참가자</div>
              <div style="font-size:var(--fs-sm);color:#6b7280;margin-top:2px">총 ${members.length}명</div>
            </div>
          </div>
          <button onclick="document.getElementById('proMembersModal').remove()" style="background:none;border:none;font-size:24px;cursor:pointer;line-height:1">×</button>
        </div>
        <div style="display:flex;flex-direction:column;gap:8px;">
          ${membersHTML}
        </div>
        <div style="margin-top:14px;display:flex;justify-content:center;">
          <button class="btn btn-w" onclick="document.getElementById('proMembersModal').remove()">닫기</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }catch(e){
    console.error('[openProMembersPopup] 오류:', e);
  }
}
