/* ══════════════════════════════════════════════════════════════
   대전기록 - 상세 모달 (history-search.js 에서 분리, 2026-07-30)
   ══════════════════════════════════════════════════════════════ */

function _ensureHistDetailModal(){
  let m=document.getElementById('histDetModal');
  if(m) return m;
  m=document.createElement('div');
  m.id='histDetModal';
  m.className='modal modal--matchdetail no-export';
  m.style.cssText='z-index:var(--z-modal-4);display:none';
  m.setAttribute('onclick',"document.getElementById('histDetModal').style.display='none';try{if(typeof _mdCloseStylePicker==='function')_mdCloseStylePicker();}catch(e){}");
  m.innerHTML=`
    <div class="mbox mbox--matchdetail" onclick="event.stopPropagation()">
      <div class="cmd-head">
        <div class="cmd-head__txt">
          <div id="hmdTitle" class="cmd-title">📅 경기 상세</div>
          <div id="hmdSub" class="cmd-sub"></div>
        </div>
        <div class="cmd-head-actions no-export">
          <button id="hmdActStyle" class="cmd-hbtn detail-act-md-style" style="display:none" title="스타일 전환" onclick="event.stopPropagation();try{_mdToggleStylePicker(event);}catch(e){console.error('[hmdActStyle]',e);}">🎨</button>
          <button id="hmdActCopy" class="cmd-hbtn" title="결과 복사">📤</button>
          <button id="hmdActShare" class="cmd-hbtn" title="공유 카드">🎴</button>
        </div>
        <button class="cmd-close" onclick="document.getElementById('histDetModal').style.display='none';try{if(typeof _mdCloseStylePicker==='function')_mdCloseStylePicker();}catch(e){}" aria-label="닫기">✕</button>
      </div>
      <div id="hmdScoreBar" class="cmd-scorebar" style="display:none"></div>
      <div id="histDetBody" class="cmd-body"></div>
      <div class="cmd-actions no-export">
        <button class="btn btn-w" onclick="document.getElementById('histDetModal').style.display='none';try{if(typeof _mdCloseStylePicker==='function')_mdCloseStylePicker();}catch(e){}">닫기</button>
      </div>
    </div>`;
  document.body.appendChild(m);
  return m;
}

window._refreshOpenHistDetailAfterEdit = function(editedMode, editedIdx){
  try{
    const st = window._lastHistDetailState || null;
    if(!st || !st.key) return;
    if(String(st.mode||'') !== String(editedMode||'')) return;
    if(Number(st.idx) !== Number(editedIdx)) return;
    const arrMap = { mini: miniM, univm: univM, ck: ckM, pro: proM, tt: ttM, comp: comps, ind: indM, gj: gjM, progj: gjM };
    const src = arrMap[String(editedMode||'')] || null;
    if(src && src[editedIdx] && window._detReg && window._detReg[st.key]){
      window._detReg[st.key].m = src[editedIdx];
    }
    if(typeof openHistDetailModal === 'function') openHistDetailModal(st.key);
  }catch(e){}
};

function _getMatchDetailTeamHeaderColor(modeKey, side, fallback){
  try{
    const mode = String(modeKey||'').trim();
    const sd = (String(side||'A').toUpperCase()==='B') ? 'b' : 'a';
    if(mode==='ck' || mode==='pro' || mode==='tt'){
      const key = `su_md_team_hdr_${mode}_${sd}`;
      const v = String(localStorage.getItem(key)||'').trim();
      if(/^#[0-9a-fA-F]{6}$/.test(v)) return v;
    }
  }catch(e){}
  return fallback;
}

function _applyOpenHistDetailTeamHeaderColors(){
  try{
    const m=document.getElementById('histDetModal');
    if(!m || m.style.display==='none') return;
    const mode = m.dataset.mode || '';
    const baseA = m.dataset.teamColorA || '#64748b';
    const baseB = m.dataset.teamColorB || '#64748b';
    const ca = _getMatchDetailTeamHeaderColor(mode, 'A', baseA);
    const cb = _getMatchDetailTeamHeaderColor(mode, 'B', baseB);
    const teams = m.querySelectorAll('.cmd-score .cmd-team');
    if(teams[0]) teams[0].style.background = `linear-gradient(135deg,${ca},${ca}cc)`;
    if(teams[1]) teams[1].style.background = `linear-gradient(135deg,${cb},${cb}cc)`;
  }catch(e){}
}

function openHistDetailModal(key){
  const reg=(window._detReg||{})[key];
  if(!reg || !reg.m) return;
  const _mdDesignMode = (()=>{ try{ const v=(localStorage.getItem('su_md_design_mode')||'classic').trim(); return ['classic','glass','editorial','sunset','aurora','mono','retro','paper','holo','league','noir','blueprint'].includes(v)?v:'classic'; }catch(e){ return 'classic'; } })();
  const _mdLayoutMode = (()=>{ try{ const v=(localStorage.getItem('su_md_layout_mode')||'default').trim(); return ['default','compact','focus','broadcast','split','poster','arena','scoreboard','cute','magazine','nintendo'].includes(v)?v:'default'; }catch(e){ return 'default'; } })();
  try{
    window._lastHistDetailState = {
      key,
      mode: String(reg.mode||''),
      idx: (reg.idx!==undefined && reg.idx!==null) ? Number(reg.idx) : null
    };
  }catch(e){}
  try{ window.__detailCtx = 'histModal'; }catch(_){}
  const m=_ensureHistDetailModal();
  try{
    if(m){
      m.setAttribute('data-md-mode', _mdDesignMode);
      m.setAttribute('data-md-layout', _mdLayoutMode);
      const box = m.querySelector('.mbox--matchdetail');
      const body = m.querySelector('.cmd-body');
      if(box){
        box.setAttribute('data-md-mode', _mdDesignMode);
        box.setAttribute('data-md-layout', _mdLayoutMode);
      }
      if(body){
        body.setAttribute('data-md-mode', _mdDesignMode);
        body.setAttribute('data-md-layout', _mdLayoutMode);
      }
    }
  }catch(e){}
  const titleEl=document.getElementById('hmdTitle');
  const subEl=document.getElementById('hmdSub');
  const bar=document.getElementById('hmdScoreBar');
  const bodyEl=document.getElementById('histDetBody');
  const match=reg.m;
  const idx = (reg.idx!==undefined && reg.idx!==null) ? reg.idx : null;
  const modeKey = reg.mode || '';
  try{
    const mode = String(modeKey||'').trim();
    const modeForEdit = (mode==='civil') ? 'mini' : mode;
    const canEdit = !!(typeof isLoggedIn!=='undefined' && isLoggedIn) && !(typeof isSubAdmin!=='undefined' && isSubAdmin) && idx!=null;
    const editable = ['mini','univm','ck','pro','tt','comp'].includes(modeForEdit);
    if(canEdit && editable && match && !match._editRef){
      match._editRef = `${modeForEdit}:${idx}`;
    }
  }catch(e){}
  try{
    const styleBtn=document.getElementById('hmdActStyle');
    if(styleBtn){
      const canStyle = !!(typeof isLoggedIn!=='undefined' && isLoggedIn) && !(typeof isSubAdmin!=='undefined' && isSubAdmin);
      styleBtn.style.display = canStyle ? 'inline-flex' : 'none';
    }
  }catch(e){}
  try{
    document.querySelectorAll('#histDetModal .cmd-detail-shell').forEach(el=>{
      el.setAttribute('data-md-mode', _mdDesignMode);
      el.setAttribute('data-md-layout', _mdLayoutMode);
    });
  }catch(e){}
  try{ if(typeof window._syncTabUrlFromState==='function') window._syncTabUrlFromState('replace'); }catch(e){}
  const _resolveOriginalShareSource = ()=> typeof window._resolveHistoryShareSource==='function'
    ? window._resolveHistoryShareSource(match, modeKey, idx)
    : null;
  // 공유카드: 인덱스 기반이 어려운 케이스(comp 통합/대회 포함)에서는 match 객체로 직접 오픈
  const _buildDetailSharePayload = ()=>{
    try{
      if(typeof window._buildHistoryDetailSharePayload==='function'){
        return window._buildHistoryDetailSharePayload(match, modeKey, idx);
      }
      if(!match) return null;
      const source = _resolveOriginalShareSource();
      if(source) return source;
      if((match.a||match.b) && match.sa!=null && match.sb!=null){
        return {...match, _matchType:(modeKey||'')};
      }
      const A = reg.lA || match.a || match.wName || 'A';
      const B = reg.lB || match.b || match.lName || 'B';
      if(Array.isArray(match.games) && match.games.length){
        const games = match.games.map(g=>{
          const w = g.wName || (g.winner==='A'?A:(g.winner==='B'?B:''));
          return {
            playerA: A,
            playerB: B,
            winner: w===A ? 'A' : 'B',
            map: g.map||''
          };
        });
        const sa = games.filter(g=>g.winner==='A').length;
        const sb = games.filter(g=>g.winner==='B').length;
        return { a:A, b:B, sa, sb, d:match.d||'', n:match.n||'', sets:[{scoreA:sa, scoreB:sb, winner:sa>sb?'A':sb>sa?'B':'', games}], _usePlayerPhoto:true, _matchType:(modeKey||'') };
      }
      if(match.wName || match.lName){
        const w = match.wName||'';
        const sa = w===A ? 1 : 0;
        const sb = w===B ? 1 : 0;
        return { a:A, b:B, sa, sb, d:match.d||'', n:match.n||'', sets:[{scoreA:sa, scoreB:sb, winner:sa>sb?'A':sb>sa?'B':'', games:[{playerA:A, playerB:B, winner:sa>sb?'A':'B', map:match.map||''}]}], _usePlayerPhoto:true, _matchType:(modeKey||'') };
      }
    }catch(e){}
    return null;
  };
  const _openShareByObj = (obj)=>{
    try{
      // 티어대회(tt) 등에서 공유카드 표기 보정
      const _mt = modeKey==='tt' ? 'tt' : (obj?._matchType || (modeKey||''));
      const _usePhoto = modeKey==='tt' ? true : (obj?._usePlayerPhoto || false);
      const _payload = obj ? {...obj, _matchType:_mt, _usePlayerPhoto:_usePhoto} : null;
      if(typeof window._openShareMatchObjCard==='function') window._openShareMatchObjCard(_payload);
    }catch(e){}
  };
  // 헤더 액션(고정)
  try{
    const copyBtn=document.getElementById('hmdActCopy');
    if(copyBtn){
      copyBtn.onclick = (e)=>{
        try{ e.preventDefault(); e.stopPropagation(); }catch(_){}
        const a=(match.a||reg.lA||''); const b=(match.b||reg.lB||'');
        copyMatchResult(String(a), match.sa||0, String(b), match.sb||0, match.d||'', modeKey, idx??0);
      };
    }
    const shareBtn=document.getElementById('hmdActShare');
    if(shareBtn){
      const _adm=(localStorage.getItem('su_share_admin_only')||'0')==='1';
      const canShare = (!_adm || isLoggedIn);
      shareBtn.style.display = canShare ? '' : 'none';
      shareBtn.onclick = (e)=>{
        try{ e.preventDefault(); e.stopPropagation(); }catch(_){}
        if(!canShare) return;
        const _payload = _buildDetailSharePayload();
        if(_payload){
          _openShareByObj(_payload);
          return;
        }
        // comp 포함 전 모드 지원
        if(typeof openShareCardFromMatch==='function' && idx!==null && modeKey!=='comp'){
          openShareCardFromMatch(modeKey, idx);
          return;
        }
        if(typeof openShareCardFromMatch==='function' && idx!==null && modeKey==='comp' && Array.isArray(comps) && comps[idx]){
          openShareCardFromMatch('comp', idx);
          return;
        }
        // fallback: match 객체로 직접 (대회 통합/인덱스 없는 케이스)
        _openShareByObj({...match, _matchType:(modeKey||'')});
      };
    }
  }catch(e){}
  const labelA=reg.lA || match.a || 'A';
  const labelB=reg.lB || match.b || 'B';
  const isDone=(match.sa!=null && match.sb!=null);
  const aWin=isDone && (match.sa>match.sb);
  const bWin=isDone && (match.sb>match.sa);
  const score=isDone ? `${match.sa}:${match.sb}` : '';

  // 헤더 텍스트
  if(titleEl) titleEl.textContent = isDone ? `📅 ${labelA} ${match.sa} VS ${match.sb} ${labelB}` : `📅 ${labelA} VS ${labelB}`;
  if(subEl){
    const parts=[];
    if(match.d) parts.push(`📅 ${String(match.d).slice(0,10)}`);
    if(match.t) parts.push(String(match.t));
    if(match.n) parts.push(String(match.n));
    if(match.memo) parts.push(`📝 ${String(match.memo)}`);
    subEl.textContent = parts.join(' · ');
  }

  // 스코어바(가능할 때만)
  try{
    if(bar){
      if(isDone){
        const safe=(s)=>String(s||'').replace(/[<>]/g,'');
        const _icon = (name)=>{
          try{
            const url=UNIV_ICONS[name]||(univCfg.find(x=>x.name===name)||{}).icon||'';
            if(url) return `<img class="cmd-uicon" src="${toHttpsUrl(url)}" style="object-fit:contain;background:transparent;border:none;border-radius:0;padding:0" onerror="this.style.display='none'">`;
          }catch(e){}
          return '';
        };
        const _playerMeta = (name, col, isLose) => {
          try{
            const p = (players||[]).find(x=>x && x.name===name);
            if(!p) return '';
            const race = p.race ? `<span class="rbadge cmd-head-race r${p.race}" style="font-size:10px">${p.race}</span>` : '';
            const tierTxt = p.tier ? String(p.tier).replace(/티어$/,'') : '';
            const tier = p.tier ? `<span class="cmd-head-tier" style="background:${getTierBtnColor(p.tier)||'#64748b'};color:${getTierBtnTextColor(p.tier)||'#fff'}">${tierTxt}</span>` : '';
            return `<span class="cmd-team-meta">${tier}${race}</span>`;
          }catch(e){
            return '';
          }
        };
        const _resolvePlayerCol = (name, fallback) => {
          try{
            const p = (players||[]).find(x=>x && x.name===name);
            return (p && gc(p.univ)) || fallback || '#64748b';
          }catch(e){
            return fallback || '#64748b';
          }
        };
        const caBase=_resolvePlayerCol(labelA, reg.ca||'#64748b');
        const cbBase=_resolvePlayerCol(labelB, reg.cb||'#64748b');
        const ca=_getMatchDetailTeamHeaderColor(modeKey, 'A', caBase);
        const cb=_getMatchDetailTeamHeaderColor(modeKey, 'B', cbBase);
        const loseTeamA = isDone && !aWin && !!(match.sa!=null || match.sb!=null);
        const loseTeamB = isDone && !bWin && !!(match.sa!=null || match.sb!=null);
        const metaA = _playerMeta(labelA, caBase, loseTeamA);
        const metaB = _playerMeta(labelB, cbBase, loseTeamB);
        try{
          m.dataset.mode = String(modeKey||'');
          m.dataset.teamColorA = caBase;
          m.dataset.teamColorB = cbBase;
        }catch(e){}
        bar.innerHTML = `<div class="cmd-score">
          <div class="cmd-team ${aWin?'is-win':''} ${loseTeamA?'is-lose':''}" style="background:${loseTeamA?'linear-gradient(180deg, rgba(248,250,252,.98), rgba(241,245,249,.96))':`linear-gradient(135deg,${ca},${ca}cc)`};border-color:${loseTeamA?'rgba(203,213,225,.88)':'rgba(255,255,255,.28)'};padding:0 18px;color:${loseTeamA?'#64748b':'#fff'}"><span class="cmd-team-text" style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);align-items:center;text-align:center;justify-content:center;gap:3px;max-width:calc(100% - 82px)"><span style="display:inline-flex;align-items:center;justify-content:center;gap:8px;max-width:100%"><span class="cmd-team-name" style="font-weight:1000">${safe(labelA)}</span>${_icon(labelA)}</span>${metaA}</span></div>
          <div class="cmd-mid"><span style="color:${aWin?'var(--win-col)':bWin?'var(--lose-col)':'#111827'}">${match.sa??''}</span><span class="cmd-colon">:</span><span style="color:${bWin?'var(--win-col)':aWin?'var(--lose-col)':'#111827'}">${match.sb??''}</span></div>
          <div class="cmd-team ${bWin?'is-win':''} ${loseTeamB?'is-lose':''}" style="background:${loseTeamB?'linear-gradient(180deg, rgba(248,250,252,.98), rgba(241,245,249,.96))':`linear-gradient(135deg,${cb},${cb}cc)`};border-color:${loseTeamB?'rgba(203,213,225,.88)':'rgba(255,255,255,.28)'};padding:0 18px;color:${loseTeamB?'#64748b':'#fff'}"><span class="cmd-team-text" style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);align-items:center;text-align:center;justify-content:center;gap:3px;max-width:calc(100% - 82px)"><span style="display:inline-flex;align-items:center;justify-content:center;gap:8px;max-width:100%">${_icon(labelB)}<span class="cmd-team-name" style="font-weight:1000">${safe(labelB)}</span></span>${metaB}</span></div>
        </div>`;
        bar.style.display='block';
      }else{
        bar.style.display='none';
        bar.innerHTML='';
      }
    }
  }catch(e){}
  if(bodyEl){
    bodyEl.innerHTML = (typeof buildDetailHTML==='function'
      ? `<div class="cmd-detail">${buildDetailHTML(match, reg.mode, labelA, labelB, reg.ca, reg.cb, reg.aW, reg.bW)}</div>`
      : '<div style="padding:10px;color:var(--gray-l)">상세 렌더 함수를 찾을 수 없습니다.</div>');
    try{ injectUnivIcons(bodyEl); }catch(e){}
    try{ bodyEl.scrollTop = 0; }catch(e){}
  }
  try{
    const box = m.querySelector('.mbox--matchdetail');
    if(box) box.scrollTop = 0;
  }catch(e){}
  if(typeof om==='function') om('histDetModal');
  else m.style.display='block';
}

function toggleDetail(key){
  // (요청사항) 상세는 인라인 펼치기 대신 팝업으로 표시
  openHistDetailModal(key);
}

function _histSearchSplitSideNames(v){
  return String(v || '').split(/[,+，]/).map(s => s.trim()).filter(Boolean);
}
function _histSearchGameSideNames(g, side){
  if (!g) return [];
  if (side === 'A') {
    if (Array.isArray(g.teamA) && g.teamA.length) return g.teamA.map(x => typeof x === 'object' ? x.name : x).filter(Boolean);
    if (g.a1 || g.a2) return [g.a1, g.a2].filter(Boolean);
    return _histSearchSplitSideNames(g.playerA);
  }
  if (Array.isArray(g.teamB) && g.teamB.length) return g.teamB.map(x => typeof x === 'object' ? x.name : x).filter(Boolean);
  if (g.b1 || g.b2) return [g.b1, g.b2].filter(Boolean);
  return _histSearchSplitSideNames(g.playerB);
}
function _histSearchEscHtml(v){
  return String(v ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}
function _histSearchEscJs(v){
  return String(v ?? '').replace(/\\/g,'\\\\').replace(/'/g,"\\'").replace(/\r/g,'\\r').replace(/\n/g,'\\n');
}
function _histSearchTeamBadge(names){
  return (names || []).length >= 2
    ? `<span style="display:inline-flex;align-items:center;justify-content:center;min-width:30px;height:18px;padding:0 6px;border-radius:999px;background:#e0f2fe;color:#0369a1;font-size:10px;font-weight:900;flex-shrink:0">2:2</span>`
    : '';
}
function _histSearchRenderNameList(names){
  const safeNames = (names || []).filter(Boolean);
  if (!safeNames.length) return '?';
  return safeNames.map(name => {
    const safeJs = _histSearchEscJs(name);
    return `<span onclick="openPlayerModal('${safeJs}')" style="cursor:pointer;text-decoration:underline dotted">${_histSearchEscHtml(name)}</span>`;
  }).join(`<span style="color:var(--text3)"> / </span>`);
}
function _histSearchTeamText(names){
  const safeNames = (names || []).filter(Boolean);
  return safeNames.length ? safeNames.join(' / ') : '?';
}

/* ══════════════════════════════════════
   대전기록 액션 메뉴(⋯)
   - (개선) 아이콘 버튼(복사/공유/상세/수정/삭제/이동)을 한 곳에 모아 UI 복잡도 감소
══════════════════════════════════════ */
// 대전기록 > 외부2 (관리자 전용, iframe)
// 외부2 / 외부3 UI는 `js/history-external-ui.js`로 분리

function buildSingleSetHTML(m, si, labelA, labelB, ca, cb){
  if(!m.sets||!m.sets[si])return`<div style="font-size:var(--fs-caption);color:var(--gray-l)">세트 기록 없음</div>`;
  const set=m.sets[si];
  const isAce=(si===m.sets.length-1&&m.sets.length>=3);
  const sLabel=isAce?'🎯 에이스전':`${si+1}세트`;
  const swA=set.scoreA||0,swB=set.scoreB||0;
  const setAWin=swA>swB,setBWin=swB>swA;
  let h=`<div style="font-size:var(--fs-caption);font-weight:700;color:${isAce?'#7c3aed':'var(--blue)'};margin-bottom:8px">${sLabel} — ${labelA} <span class="${setAWin?'wt':'lt'}">${swA}</span>:<span class="${setBWin?'wt':'lt'}">${swB}</span> ${labelB}</div>`;
  if(set.games&&set.games.length){
    set.games.forEach((g,gi)=>{
      if(!g.playerA&&!g.playerB)return;
      const sideA = _histSearchGameSideNames(g, 'A');
      const sideB = _histSearchGameSideNames(g, 'B');
      const isTeamA = sideA.length >= 2;
      const isTeamB = sideB.length >= 2;
      const pA=(!isTeamA && g.playerA) ? players.find(p=>p.name===g.playerA) : null;
      const pB=(!isTeamB && g.playerB) ? players.find(p=>p.name===g.playerB) : null;
      const pca=(pA&&gc(pA.univ))||ca;
      const pcb=(pB&&gc(pB.univ))||cb;
      const aIsWinner=g.winner==='A';const bIsWinner=g.winner==='B';const hasWinner=!!g.winner;
      const winBgA=(typeof getMatchWinTint==='function'?getMatchWinTint(pca):(pca+'22'));
      const winBgB=(typeof getMatchWinTint==='function'?getMatchWinTint(pcb):(pcb+'22'));
      const winBorderA=pca+'66',winBorderB=pcb+'66';
      const styleA=hasWinner?(aIsWinner?`display:flex;align-items:center;gap:4px;padding:4px 10px;border-radius:6px;background:${winBgA};border:2px solid ${winBorderA};`:`display:flex;align-items:center;gap:4px;padding:4px 10px;border-radius:6px;background:${pca}12;border:1px solid ${pca}33;opacity:0.72;`):`display:flex;align-items:center;gap:4px;padding:4px 10px;border-radius:6px;background:${pca}12;border:1px solid ${pca}33;`;
      const styleB=hasWinner?(bIsWinner?`display:flex;align-items:center;gap:4px;padding:4px 10px;border-radius:6px;background:${winBgB};border:2px solid ${winBorderB};`:`display:flex;align-items:center;gap:4px;padding:4px 10px;border-radius:6px;background:${pcb}12;border:1px solid ${pcb}33;opacity:0.72;`):`display:flex;align-items:center;gap:4px;padding:4px 10px;border-radius:6px;background:${pcb}12;border:1px solid ${pcb}33;`;
      const cA=g.playerA?`onclick="openPlayerModal('${escJS(g.playerA)}')" style="cursor:pointer;text-decoration:underline dotted"`:'';
      const cB=g.playerB?`onclick="openPlayerModal('${escJS(g.playerB)}')" style="cursor:pointer;text-decoration:underline dotted"`:'';
      const mapStr=g.map?`<span style="background:var(--surface);border:1px solid var(--border);padding:2px 6px;border-radius:4px;font-size:10px">${g.map}</span>`:'';
      const teamANameHTML = `${_histSearchTeamBadge(sideA)}<strong style="font-size:14px;display:inline-flex;align-items:center;gap:6px;flex-wrap:wrap">${_histSearchRenderNameList(sideA)}</strong>`;
      const teamBNameHTML = `${_histSearchTeamBadge(sideB)}<strong style="font-size:14px;display:inline-flex;align-items:center;gap:6px;flex-wrap:wrap">${_histSearchRenderNameList(sideB)}</strong>`;
      h+=`<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;flex-wrap:wrap">
        <span style="color:var(--gray-l);font-size:var(--fs-caption);font-weight:900;min-width:54px;text-align:center">경기 ${gi+1}</span>
        <div style="${styleA}">${isTeamA ? teamANameHTML : `${pA?getPlayerPhotoHTML(pA.name,'30px','margin-right:4px'):''} ${pA?`<span class="rbadge r${pA.race}" style="font-size:var(--fs-caption);padding:2px 6px">${pA.race}</span>`:''}<strong style="font-size:14px" ${cA}>${g.playerA||'?'}</strong>${pA?genderIcon(pA.gender):''}`}<span style="font-size:var(--fs-caption);color:${ca};font-weight:700;margin-left:2px">(${labelA})</span>${aIsWinner&&hasWinner?`<span style="background:${ca};color:#fff;font-size:10px;font-weight:800;padding:2px 8px;border-radius:4px;margin-left:4px">WIN</span>`:''}</div>
        <span style="color:var(--gray-l);font-size:var(--fs-sm);font-weight:700">vs</span>
        <div style="${styleB}">${isTeamB ? teamBNameHTML : `${pB?getPlayerPhotoHTML(pB.name,'30px','margin-right:4px'):''} ${pB?`<span class="rbadge r${pB.race}" style="font-size:var(--fs-caption);padding:2px 6px">${pB.race}</span>`:''}<strong style="font-size:14px" ${cB}>${g.playerB||'?'}</strong>${pB?genderIcon(pB.gender):''}`}<span style="font-size:var(--fs-caption);color:${cb};font-weight:700;margin-left:2px">(${labelB})</span>${bIsWinner&&hasWinner?`<span style="background:${cb};color:#fff;font-size:10px;font-weight:800;padding:2px 8px;border-radius:4px;margin-left:4px">WIN</span>`:''}</div>
        ${mapStr}
      </div>`;
    });
  }
  return h;
}

/* ══════════════════════════════════════
   대전 기록 > 프로리그 대회 탭
══════════════════════════════════════ */
