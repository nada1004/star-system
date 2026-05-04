/* history-detail-move.js: extracted from history.js */
/* ══════════════════════════════════════
   경기 이동 (탭 간 이동)
══════════════════════════════════════ */
var _movePop=null;
function _showMovePop(btn,opts){
  closeMovePop();
  const pop=document.createElement('div');
  pop.id='_movePop';
  pop.style.cssText='position:fixed;z-index:9999;background:var(--white,#fff);border:1px solid var(--border2,#cbd5e1);border-radius:10px;box-shadow:0 6px 24px rgba(0,0,0,.18);padding:6px;min-width:180px;font-family:\'Noto Sans KR\',sans-serif';
  const r=btn.getBoundingClientRect();
  pop.style.top=(r.bottom+4)+'px';
  pop.style.right=(window.innerWidth-r.right)+'px';
  let html='';
  opts.forEach((o,i)=>{
    html+=`<button onclick="_movePop_pick(${i})" style="display:block;width:100%;text-align:left;padding:8px 12px;border:none;background:none;cursor:pointer;font-size:13px;font-weight:600;border-radius:7px;color:var(--text,#1e293b)" onmouseenter="this.style.background='rgba(37,99,235,.08)'" onmouseleave="this.style.background='none'">${o.l}</button>`;
  });
  html+=`<button onclick="closeMovePop()" style="display:block;width:100%;text-align:left;padding:6px 12px;border:none;background:none;cursor:pointer;font-size:12px;border-radius:7px;color:var(--gray-l,#94a3b8)" onmouseenter="this.style.background='rgba(0,0,0,.04)'" onmouseleave="this.style.background='none'">취소</button>`;
  pop.innerHTML=html;
  document.body.appendChild(pop);
  _movePop=pop;
  window._movePopOpts=opts;
  setTimeout(()=>document.addEventListener('click',_movePopOutside,{once:true}),0);
}
function _movePopOutside(e){ if(_movePop&&!_movePop.contains(e.target)) closeMovePop(); }
function _movePop_pick(i){ const fn=window._movePopOpts&&window._movePopOpts[i]&&window._movePopOpts[i].fn; closeMovePop(); if(fn) fn(); }
function closeMovePop(){ if(_movePop){_movePop.remove();_movePop=null;} document.removeEventListener('click',_movePopOutside); }

// 팀 경기 이동 (mini ↔ univm ↔ civil)
function moveTeamMatch(srcMode, srcIdx, destMode, _batch=false){
  const srcArr=srcMode==='mini'?miniM:univM;
  const m=srcArr[srcIdx];
  if(!m)return;
  const srcType=m.type||'mini'; // 'mini'|'civil' (miniM 전용)
  const oldLabel=srcMode==='univm'?'대학대전':srcType==='civil'?'시빌워':'미니대전';
  const newLabel=destMode==='univm'?'대학대전':destMode==='civil'?'시빌워':'미니대전';
  if(oldLabel===newLabel)return;
  // 배열 이동
  srcArr.splice(srcIdx,1);
  if(destMode==='univm'){
    const {type:_t,...rest}=m; // type 필드 제거
    univM.unshift(rest);
    var moved=rest;
  } else {
    m.type=destMode==='civil'?'civil':'mini';
    miniM.unshift(m);
    var moved=m;
  }
  // player.history mode 레이블 업데이트
  const mid=moved._id;
  players.forEach(p=>(p.history||[]).forEach(h=>{if(h.matchId===mid)h.mode=newLabel;}));
  if(!_batch){if(typeof fixPoints==='function')fixPoints();save();render();}
}

// ── 일괄 선택 이동 ───────────────────────────────────────────
let _bulkModes = {}; // {key:bool} — 'mini'|'civil'|'univm'

function closeBulkConfirmModal(){
  try{
    const el=document.getElementById('bulkConfirmOverlay');
    if(el) el.remove();
  }catch(e){}
}
function openBulkConfirmModal(title, message, onConfirm){
  try{
    closeBulkConfirmModal();
    const overlay=document.createElement('div');
    overlay.id='bulkConfirmOverlay';
    overlay.className='bulk-confirm-overlay';
    overlay.innerHTML=`
      <div class="bulk-confirm-box" onclick="event.stopPropagation()">
        <button class="bulk-confirm-close" onclick="closeBulkConfirmModal()" aria-label="닫기">✕</button>
        <div class="bulk-confirm-head">
          <div class="bulk-confirm-badge">삭제 확인</div>
          <div class="bulk-confirm-title">${title||'확인'}</div>
        </div>
        <div class="bulk-confirm-body">${String(message||'').replace(/\n/g,'<br>')}</div>
        <div class="bulk-confirm-actions">
          <button class="btn btn-w" onclick="closeBulkConfirmModal()">취소</button>
          <button class="btn btn-r bulk-confirm-danger" id="bulkConfirmOkBtn">삭제 진행</button>
        </div>
      </div>`;
    overlay.onclick=()=>closeBulkConfirmModal();
    document.body.appendChild(overlay);
    const okBtn=overlay.querySelector('#bulkConfirmOkBtn');
    if(okBtn){
      okBtn.onclick=()=>{
        try{ if(typeof onConfirm==='function') onConfirm(); }catch(e){}
        closeBulkConfirmModal();
      };
    }
  }catch(e){
    if(confirm(String(message||title||'진행할까요?'))){
      try{ if(typeof onConfirm==='function') onConfirm(); }catch(_){}
    }
  }
}
try{
  window.closeBulkConfirmModal = closeBulkConfirmModal;
  window.openBulkConfirmModal = openBulkConfirmModal;
}catch(e){}

function toggleBulkMode(key){
  _bulkModes[key]=!_bulkModes[key];
  render();
}
function bulkToggleAll(key,checked){
  document.querySelectorAll(`.bulk-cb[data-bkey="${key}"]`).forEach(cb=>cb.checked=checked);
  _bulkCountUpdate(key);
}
function _bulkCountUpdate(key){
  const n=[...document.querySelectorAll(`.bulk-cb[data-bkey="${key}"]:checked`)].length;
  const el=document.getElementById('bulk-cnt-'+key);
  if(el)el.textContent=n+'개 선택됨';
  const allCbs=document.querySelectorAll(`.bulk-cb[data-bkey="${key}"]`);
  const allChk=document.getElementById('bulk-all-'+key);
  if(allChk&&allCbs.length) allChk.indeterminate=n>0&&n<allCbs.length, allChk.checked=n===allCbs.length;
}
function bulkMoveTeam(bulkKey,destMode){
  const cbs=[...document.querySelectorAll(`.bulk-cb[data-bkey="${bulkKey}"]:checked`)];
  if(!cbs.length){alert('선택된 경기가 없습니다.');return;}
  const indices=cbs.map(cb=>parseInt(cb.dataset.bidx)).sort((a,b)=>b-a);
  if(!confirm(indices.length+'개 경기를 이동하시겠습니까?'))return;
  const srcMode=bulkKey==='univm'?'univm':'mini';
  indices.forEach(idx=>moveTeamMatch(srcMode,idx,destMode,true));
  _bulkModes[bulkKey]=false;
  if(typeof fixPoints==='function')fixPoints();
  save();render();
}
function bulkDeleteRecs(bulkKey){
  const cbs=[...document.querySelectorAll(`.bulk-cb[data-bkey="${bulkKey}"]:checked`)];
  if(!cbs.length){alert('선택된 경기가 없습니다.');return;}
  const indices=cbs.map(cb=>parseInt(cb.dataset.bidx)).sort((a,b)=>b-a);
  openBulkConfirmModal(
    '선택한 경기를 삭제할까요?',
    `${indices.length}개 경기를 삭제합니다.\n\n⚠️ 해당 대전의 모든 경기 결과가 선수 성적에서 차감됩니다.`,
    ()=>{
      const arr=bulkKey==='univm'?univM:bulkKey==='ck'?ckM:bulkKey==='pro'?proM:bulkKey==='tt'?ttM:miniM;
      const deletedIds=new Set();
      indices.forEach(idx=>{
        const matchObj=arr[idx];
        if(matchObj){
          if(matchObj._id){
            deletedIds.add(matchObj._id);
            (matchObj.sets||[]).forEach((set,si)=>{
              (set.games||[]).forEach((g,gi)=>{
                deletedIds.add(`${matchObj._id}_s${si}_g${gi}`);
              });
            });
          }
          arr.splice(idx,1);
          revertMatchRecord(matchObj);
          if(bulkKey==='tt' && matchObj._id) {
            try{ _removeTierTourneyMatchById(matchObj._id); }catch(e){}
          }
        }
      });
      if(deletedIds.size>0){
        players.forEach(p=>{
          if(!p.history)return;
          const removed=p.history.filter(h=>h.matchId&&deletedIds.has(h.matchId));
          if(!removed.length)return;
          p.history=p.history.filter(h=>!h.matchId||!deletedIds.has(h.matchId));
          removed.forEach(hr=>{
            if(hr.result==='승'){p.win=Math.max(0,(p.win||0)-1);p.points=(p.points||0)-3;}
            else if(hr.result==='패'){p.loss=Math.max(0,(p.loss||0)-1);p.points=(p.points||0)+3;}
            if(hr.eloDelta!=null)p.elo=(p.elo||1500)-hr.eloDelta;
          });
        });
      }
      _bulkModes[bulkKey]=false;
      if(typeof fixPoints==='function')fixPoints();
      save();render();
    }
  );
}

// (버그픽스) 티어대회 삭제 시 tourneys 내부(조별/브라켓)에 남은 같은 _id 기록도 같이 제거
function _removeTierTourneyMatchById(matchId){
  const id = String(matchId||'').trim();
  if(!id) return 0;
  let removed = 0;
  try{
    (tourneys||[]).filter(t=>t && t.type==='tier').forEach(tn=>{
      // 조별리그 matches
      (tn.groups||[]).forEach(grp=>{
        if(!grp || !Array.isArray(grp.matches)) return;
        const before = grp.matches.length;
        grp.matches = grp.matches.filter(m=>!(m && String(m._id||'')===id));
        removed += (before - grp.matches.length);
      });
      // 브라켓 matchDetails/manualMatches
      const br = tn.bracket || {};
      if(br.matchDetails){
        Object.keys(br.matchDetails).forEach(k=>{
          const m = br.matchDetails[k];
          if(m && String(m._id||'')===id){
            delete br.matchDetails[k];
            removed++;
            try{ if(br.winners) delete br.winners[k]; }catch(e){}
          }
        });
      }
      if(Array.isArray(br.manualMatches)){
        const before = br.manualMatches.length;
        br.manualMatches = br.manualMatches.filter(m=>!(m && String(m._id||'')===id));
        removed += (before - br.manualMatches.length);
      }
    });
  }catch(e){}
  return removed;
}
// ─────────────────────────────────────────────────────────────

// 팀 경기 이동 팝업 열기
function openMoveMatchPop(btn,srcMode,srcIdx){
  const arr=srcMode==='mini'?miniM:univM;
  const m=arr[srcIdx];if(!m)return;
  const srcType=m.type||'mini';
  const opts=[];
  if(srcMode==='mini'&&srcType==='mini'){
    opts.push({l:'⚔️ 시빌워로 이동',fn:()=>moveTeamMatch('mini',srcIdx,'civil')});
    opts.push({l:'🏟️ 대학대전으로 이동',fn:()=>moveTeamMatch('mini',srcIdx,'univm')});
  } else if(srcMode==='mini'&&srcType==='civil'){
    opts.push({l:'⚡ 미니대전으로 이동',fn:()=>moveTeamMatch('mini',srcIdx,'mini')});
    opts.push({l:'🏟️ 대학대전으로 이동',fn:()=>moveTeamMatch('mini',srcIdx,'univm')});
  } else if(srcMode==='univm'){
    opts.push({l:'⚡ 미니대전으로 이동',fn:()=>moveTeamMatch('univm',srcIdx,'mini')});
    opts.push({l:'⚔️ 시빌워로 이동',fn:()=>moveTeamMatch('univm',srcIdx,'civil')});
  }
  _showMovePop(btn,opts);
}

function delRec(mode,i){
  openBulkConfirmModal(
    '이 경기를 삭제할까요?',
    '⚠️ 해당 대전의 모든 경기 결과가 선수 성적에서 차감됩니다.',
    ()=>{
      let matchObj=null;
      if(mode==='mini')     { matchObj=miniM[i];  miniM.splice(i,1); }
      else if(mode==='univm'){ matchObj=univM[i];  univM.splice(i,1); }
      else if(mode==='comp') { matchObj=comps[i];  comps.splice(i,1); }
      else if(mode==='ck')   { matchObj=ckM[i];    ckM.splice(i,1);   }
      else if(mode==='pro')  { matchObj=proM[i];   proM.splice(i,1);  }
      else if(mode==='tt')   { matchObj=ttM[i];    ttM.splice(i,1);   }
      if(matchObj) {
        revertMatchRecord(matchObj);
        if(mode==='tt' && matchObj._id) {
          try{ _removeTierTourneyMatchById(matchObj._id); }catch(e){}
        }
      }
      if(typeof fixPoints==='function')fixPoints();
      save();render();
    }
  );
}


function _ensureHistDetailModal(){
  let m=document.getElementById('histDetModal');
  if(m) return m;
  m=document.createElement('div');
  m.id='histDetModal';
  m.className='modal modal--matchdetail no-export';
  // (개선) z-index는 CSS 변수로 통일 (공유카드가 항상 위로 오도록)
  m.style.cssText='z-index:var(--z-modal-4);display:none';
  m.setAttribute('onclick',"cm('histDetModal')");
  m.innerHTML=`
    <div class="mbox mbox--matchdetail" onclick="event.stopPropagation()">
      <div class="cmd-head">
        <div class="cmd-head__txt">
          <div id="hmdTitle" class="cmd-title">📅 경기 상세</div>
          <div id="hmdSub" class="cmd-sub"></div>
        </div>
        <div class="cmd-head-actions no-export">
          <button id="hmdActCopy" class="cmd-hbtn" title="결과 복사">📤</button>
          <button id="hmdActShare" class="cmd-hbtn cmd-hbtn--share" data-role="share" title="공유 카드">🎴</button>
        </div>
        <button class="cmd-close" onclick="cm('histDetModal')" aria-label="닫기">✕</button>
      </div>
      <div id="hmdScoreBar" class="cmd-scorebar" style="display:none"></div>
      <div id="histDetBody" class="cmd-body"></div>
      <div class="cmd-actions no-export">
        <button class="btn btn-w" onclick="cm('histDetModal')">닫기</button>
      </div>
    </div>`;
  document.body.appendChild(m);
  return m;
}

function openHistDetailModal(key){
  const reg=(window._detReg||{})[key];
  if(!reg || !reg.m) return;
  try{
    if(typeof window._ensureShareCardLoaded === 'function'){
      Promise.resolve().then(()=>window._ensureShareCardLoaded()).catch(()=>{});
    }else if(typeof window._ensureStatsLoaded === 'function'){
      Promise.resolve().then(()=>window._ensureStatsLoaded()).catch(()=>{});
    }
  }catch(_){}
  try{ window.__detailCtx = 'histModal'; }catch(_){}
  try{
    window.__suOpenHistDetailKey = key;
    if(typeof window.__suSyncUrlState==='function') window.__suSyncUrlState();
  }catch(e){}
  const m=_ensureHistDetailModal();
  const titleEl=document.getElementById('hmdTitle');
  const subEl=document.getElementById('hmdSub');
  const bar=document.getElementById('hmdScoreBar');
  const bodyEl=document.getElementById('histDetBody');
  const match=reg.m;
  const idx = (reg.idx!==undefined && reg.idx!==null) ? reg.idx : null;
  const modeKey = reg.mode || '';
  // 공유카드: 인덱스 기반이 어려운 케이스(comp 통합/대회 포함)에서는 match 객체로 직접 오픈
  const _openShareByObj = (obj)=>{
    try{
      const _mt = modeKey==='tt' ? 'tt' : (obj?._matchType || (modeKey||''));
      const _raw = obj ? {...obj, _matchType:_mt, _usePlayerPhoto:(modeKey==='tt' ? true : (obj?._usePlayerPhoto || false))} : null;
      if(typeof window.HistoryActionUtils?.normalizeMatchShareObjForCard === 'function' &&
         typeof window.HistoryActionUtils?.openUnifiedMatchShareCard === 'function'){
        const _shareObj = window.HistoryActionUtils.normalizeMatchShareObjForCard(_raw, modeKey);
        window.HistoryActionUtils.openUnifiedMatchShareCard(_shareObj);
        return;
      }
      window._shareMatchObj = _raw;
      window._shareMode = 'match';
      if(typeof openShareCardModal==='function') openShareCardModal();
      setTimeout(()=>{ try{ if(window._shareMatchObj && typeof renderShareCardByMatchObj==='function') renderShareCardByMatchObj(window._shareMatchObj); }catch(_){ } }, 80);
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
        if(typeof openShareCardFromDetReg==='function' && key){
          openShareCardFromDetReg(key);
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
  const _safeHtml = (s)=>String(s||'').replace(/[&<>"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[ch]));
  const _soloMode = ['ind','gj','progj'].includes(String(modeKey||''));
  const headAName = _soloMode ? (match.wName || match.a || labelA) : (match.a || labelA);
  const headBName = _soloMode ? (match.lName || match.b || labelB) : (match.b || labelB);
  const _pmA = headAName && typeof statsP==='function' ? statsP(headAName) : null;
  const _pmB = headBName && typeof statsP==='function' ? statsP(headBName) : null;
  const _headCa = (_pmA && _pmA.univ && typeof gc==='function') ? gc(_pmA.univ) : (reg.ca||'#64748b');
  const _headCb = (_pmB && _pmB.univ && typeof gc==='function') ? gc(_pmB.univ) : (reg.cb||'#64748b');
  const _headSubA = _pmA?.univ || '';
  const _headSubB = _pmB?.univ || '';
  const _gameCount = Array.isArray(match.sets) ? match.sets.reduce((n,s)=>n+((s&&s.games&&s.games.length)||0),0) : 0;

  // 헤더 텍스트
  if(titleEl){
    titleEl.innerHTML = `
      <span class="cmd-titleline">
        <span class="cmd-title-name is-a" style="--cmd-name-col:${_headCa}">${_safeHtml(headAName)}</span>
        <span class="cmd-title-vs">vs</span>
        <span class="cmd-title-name is-b" style="--cmd-name-col:${_headCb}">${_safeHtml(headBName)}</span>
        ${score?`<span class="cmd-title-score">${_safeHtml(score)}</span>`:''}
      </span>`;
  }
  if(subEl){
    const parts=[];
    if(match.d) parts.push(`📅 ${String(match.d).slice(0,10)}`);
    if(match.t) parts.push(String(match.t));
    if(match.n) parts.push(String(match.n));
    if(_gameCount>0) parts.push(`🎮 ${_gameCount}경기`);
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
            const p = (typeof players!=='undefined' ? (players||[]).find(x=>x && x.name===name) : null);
            // 크기는 CSS 변수(--su_md_logo_size)로 제어
            if(p) return `<span class="cmd-uicon" style="border-radius:var(--su_profile_radius,50%);overflow:hidden;display:inline-flex;align-items:center;justify-content:center;border:2px solid rgba(255,255,255,.55);box-shadow:0 6px 16px rgba(0,0,0,.14)">${getPlayerPhotoHTML(name,'var(--su_md_logo_size,42px)','width:100%;height:100%;object-fit:cover')}</span>`;
            const url=UNIV_ICONS[name]||(univCfg.find(x=>x.name===name)||{}).icon||'';
            if(url) return `<img class="cmd-uicon" src="${toHttpsUrl(url)}" style="object-fit:contain;border-radius:var(--su_univ_logo_radius,12px);background:rgba(255,255,255,.18);border:1px solid rgba(255,255,255,.35);padding:7px" onerror="this.style.display='none'">`;
          }catch(e){}
          return '';
        };
        const ca=_headCa;
        const cb=_headCb;
        const teamSubA = _headSubA ? `<div class="cmd-team-sub">${_safeHtml(_headSubA)}</div>` : '';
        const teamSubB = _headSubB ? `<div class="cmd-team-sub">${_safeHtml(_headSubB)}</div>` : '';
        bar.innerHTML = `<div class="cmd-score">
          <div class="cmd-team" style="background:linear-gradient(135deg,${ca},${ca}cc)">${_icon(headAName)}<div class="cmd-team-meta"><span class="cmd-team-name" style="font-weight:1000">${safe(headAName)}</span>${teamSubA}</div></div>
          <div class="cmd-mid"><span style="color:${aWin?'#16a34a':bWin?'#dc2626':'#111827'}">${match.sa??''}</span><span class="cmd-colon">:</span><span style="color:${bWin?'#16a34a':aWin?'#dc2626':'#111827'}">${match.sb??''}</span></div>
          <div class="cmd-team" style="background:linear-gradient(135deg,${cb},${cb}cc)">${_icon(headBName)}<div class="cmd-team-meta"><span class="cmd-team-name" style="font-weight:1000">${safe(headBName)}</span>${teamSubB}</div></div>
        </div>`;
        try{
          const mid=bar.querySelector('.cmd-mid');
          if(mid){
            mid.style.setProperty('--cmd-col-a', ca);
            mid.style.setProperty('--cmd-col-b', cb);
          }
        }catch(e){}
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
  }
  m.style.display='block';
}

function toggleDetail(key){
  // (요청사항) 상세는 인라인 펼치기 대신 팝업으로 표시
  openHistDetailModal(key);
}

