/* ══════════════════════════════════════════════════════════════
   대전기록 - 목록/일괄작업/이동/삭제 (history-search.js 에서 분리, 2026-07-30)
   ══════════════════════════════════════════════════════════════ */

function getTourneyMatches(){
  const result=[];
  if(!Array.isArray(tourneys))return result;
  (tourneys||[]).forEach(tn=>{
    const br = tn.bracket || {};
    const _bktFirstSize = (typeof _bktComputeBracketSize === 'function')
      ? _bktComputeBracketSize(tn)
      : (Number(br.size)||0) || 8;
    let _bktTotalRounds = 0;
    let _n = Math.max(2, _bktFirstSize);
    while(_n > 1){ _n = Math.ceil(_n/2); _bktTotalRounds++; }
    if(_bktTotalRounds <= 0) _bktTotalRounds = 1;
    const _bktRoundLabels = {1:'결승',2:'4강',3:'8강',4:'16강',5:'32강',6:'64강',7:'128강',8:'256강'};
    const _bktRndLabel = (key)=>{
      try{
        const parts = String(key||'').split('-');
        const r = parseInt(parts[0], 10);
        if(Number.isNaN(r) || r < 0) return '';
        const rNum = _bktTotalRounds - r;
        return _bktRoundLabels[rNum] || (Math.pow(2, rNum) + '강');
      }catch(e){
        return '';
      }
    };

    // 조별리그 경기
    (tn.groups||[]).forEach((grp,gi)=>{
      const gl='ABCDEFGHIJ'[gi]||String(gi);
      const col=['#2563eb','#dc2626','#16a34a','#d97706','#7c3aed','#0891b2'][gi%6];
      (grp.matches||[]).forEach((m,mi)=>{
        if(!m.a||!m.b)return;
        if(m.sa==null||m.sb==null)return;
        result.push({
          _src:'tour',_tnId:tn.id,_gi:gi,_mi:mi,
          d:m.d||'',n:tn.name,a:m.a,b:m.b,
          sa:m.sa,sb:m.sb,sets:m.sets||[],
          grpName:grp.name,grpLetter:gl,grpColor:col
        });
      });
    });
    // 브라켓 경기 (matchDetails)
    Object.entries(br.matchDetails||{}).forEach(([key,m])=>{
      if(!m||!m.a||!m.b||m.sa==null||m.sb==null)return;
      result.push({
        _src:'tour_bracket',_tnId:tn.id,_bktKey:key,
        d:m.d||'',n:tn.name,a:m.a,b:m.b,
        sa:m.sa,sb:m.sb,sets:m.sets||[],
        rndLabel:_bktRndLabel(key),
        grpName:'토너먼트',grpLetter:'T',grpColor:'#2563eb'
      });
    });
    // 브라켓 winner-only 경기 (matchDetails에 a/b 없거나 없는 키)
    Object.entries(br.winners||{}).forEach(([key,winner])=>{
      if(!winner)return;
      const det=(br.matchDetails||{})[key];
      if(det&&det.a&&det.b&&det.sa!=null&&det.sb!=null)return; // 이미 위에서 처리
      const parts=key.split('-');
      const r=parseInt(parts[0]),mi=parseInt(parts[1]);
      const a=(det&&det.a)||((br.slots||{})[`${r}-${mi}-a`])||(r>0?((br.winners||{})[`${r-1}-${mi*2}`]||''):'');
      const b=(det&&det.b)||((br.slots||{})[`${r}-${mi}-b`])||(r>0?((br.winners||{})[`${r-1}-${mi*2+1}`]||''):'');
      if(!a||!b)return;
      result.push({
        _src:'tour_bracket',_tnId:tn.id,_bktKey:key,
        d:(det&&det.d)||'',n:tn.name,a,b,
        sa:winner===a?1:0,sb:winner===b?1:0,sets:[],
        rndLabel:_bktRndLabel(key),
        grpName:'토너먼트',grpLetter:'T',grpColor:'#2563eb'
      });
    });
    // 수동 추가 브라켓 경기 (manualMatches)
    (br.manualMatches||[]).forEach((m,idx)=>{
      if(!m||!m.a||!m.b||m.sa==null||m.sb==null)return;
      result.push({
        _src:'tour_manual',_tnId:tn.id,_manualIdx:idx,
        d:m.d||'',n:tn.name,a:m.a,b:m.b,
        sa:m.sa,sb:m.sb,sets:m.sets||[],
        rndLabel:m.rndLabel||'',
        grpName:'토너먼트',grpLetter:'T',grpColor:'#7c3aed'
      });
    });
  });
  return result;
}
function compSummaryListHTML(context){
  // tourneys 경기 + normalMatches + comps 배열 모두 합산
  const tourItems=(typeof getTourneyMatches==='function') ? getTourneyMatches() : [];
  const nmItems=(typeof getNormalMatchesForHistory==='function')?getNormalMatchesForHistory():[];
  const _comps = (typeof comps!=='undefined' && Array.isArray(comps)) ? comps : [];
  const _sortDir = (typeof recSortDir!=='undefined' && (recSortDir==='asc' || recSortDir==='desc')) ? recSortDir : ((window.recSortDir==='asc'||window.recSortDir==='desc') ? window.recSortDir : 'desc');
  const compItems=[..._comps].map((m,origIdx)=>({...m,_src:'comps',_origIdx:origIdx}));
  const allItems=[...tourItems,...nmItems,...compItems];
  if(!allItems.length)return`<div class="empty-state"><div class="empty-state-icon">📭</div><div class="empty-state-title">기록이 없습니다</div><div class="empty-state-desc">기록이 추가되면 여기에 표시됩니다</div></div>`;
  // 날짜 필터 적용 후 정렬
  const filtered=allItems.filter(m=>
    typeof passDateFilter!=='function'||passDateFilter(m.d||'')
  );
  filtered.sort((a,b)=>_sortDir==='asc'
    ?(a.d||'').localeCompare(b.d||'')
    :(b.d||'').localeCompare(a.d||''));
  const sortBar=``;
  if(!filtered.length)return sortBar+`<div class="empty-state"><div class="empty-state-icon">📅</div><div class="empty-state-title">기록이 없습니다</div><div class="empty-state-desc"></div></div>`;
  let h=sortBar;
  filtered.forEach((m,listIdx)=>{
    const a=m.a||m.hostUniv||m.u||'';const b=m.b||'';
    const ca=gc(a);const cb=gc(b);
    const aWin=m.sa>m.sb;const bWin=m.sb>m.sa;
    const key=`${context}-comp-${listIdx}`;
    const rIdx=(m._src==='comps')?m._origIdx:-1;
    // GROUP 배지 (tourneys 경기)
    const grpBadge=m._src==='tour'
      ?`<span style="background:${m.grpColor};color:#fff;font-size:10px;font-weight:700;padding:1px 8px;border-radius:4px;margin-left:6px">GROUP ${m.grpLetter}</span>`:'';
    const _pms=_collectMatchParticipantsAny(m);
    const _pmJson=JSON.stringify(_pms).replace(/"/g,"'");
    const _pmCol=(aWin?ca:bWin?cb:(ca||cb||'#64748b'));
    h+=`<div class="rec-summary rec-mode-comp${_recSideFxClass('comp')}" data-rec-mode="comp" style="--rec-mode-col:#3b82f6;--rec-mode-rgb:59,130,246;${_recSideFxStyle('comp',ca,cb)}">
      <div class="rec-sum-header">
        <span style="color:var(--text3);font-size:var(--fs-sm);font-weight:600;min-width:72px">${m.d||''}</span>
        <span style="font-weight:700;font-size:var(--fs-base)">🎖️ ${m.n||'대회'}${grpBadge}</span>
        ${_pms.length?`<button class="btn btn-w btn-xs rc-mem-btn" style="margin-left:8px" onclick="event.stopPropagation();openProMembersPopup('참여자', '${_pmCol}', ${_pmJson})">👥 참여자 ${_pms.length}</button>`:''}
        ${(() => {
          // 대회 탭 멤버 추출 (가능한 모든 포맷 대응)
          let aMembers = m.teamAMembers || [];
          let bMembers = m.teamBMembers || [];
          if (!aMembers.length && !bMembers.length && m.sets) {
            const aSet = new Set(), bSet = new Set();
            m.sets.forEach(s => {
              (s.games || []).forEach(g => {
                if (g.playerA) String(g.playerA).split(',').map(x=>x.trim()).filter(Boolean).forEach(x=>aSet.add(x));
                if (g.playerB) String(g.playerB).split(',').map(x=>x.trim()).filter(Boolean).forEach(x=>bSet.add(x));
                if (g.a1) aSet.add(String(g.a1).trim());
                if (g.a2) aSet.add(String(g.a2).trim());
                if (g.b1) bSet.add(String(g.b1).trim());
                if (g.b2) bSet.add(String(g.b2).trim());
                if (g.winner === 'A' && g.wName) { aSet.add(g.wName); if (g.lName) bSet.add(g.lName); }
                else if (g.winner === 'B' && g.wName) { bSet.add(g.wName); if (g.lName) aSet.add(g.lName); }
              });
            });
            aMembers = Array.from(aSet).map(n => ({ name: n }));
            bMembers = Array.from(bSet).map(n => ({ name: n }));
          }
          // 그래도 비어있으면 공통 유틸로 한 번 더 시도
          if((!aMembers.length && !bMembers.length) && typeof _collectMatchTeamMembersAB === 'function'){
            const ab = _collectMatchTeamMembersAB(m);
            aMembers = ab.a || [];
            bMembers = ab.b || [];
          }
          const aBtnColor = ca || '#3b82f6';
          const bBtnColor = cb || '#ef4444';
          const aMemJson = JSON.stringify(aMembers).replace(/"/g, "'");
          const bMemJson = JSON.stringify(bMembers).replace(/"/g, "'");
          // 맵 정보 추출
          const maps = [];
          (m.sets || []).forEach(s => {
            (s.games || []).forEach(g => { if (g.map && !maps.includes(g.map)) maps.push(g.map); });
          });
          const mapStr = maps.slice(0, 2).join(', ') + (maps.length > 2 ? ` 외 ${maps.length - 2}` : '');
          return `
        <div class="rec-sum-vs" style="flex-wrap:wrap;align-items:center">
          <div style="display:flex;flex-direction:column;align-items:center;gap:5px">
            ${a?`<span class="ubadge${aWin?'':' loser'} clickable-univ" style="background:${ca}" onclick="openUnivModal('${escJS(a)}')">${a}</span>`:''}
            ${aMembers.length ? `<button class="btn btn-xs rc-mem-btn" style="background:linear-gradient(135deg,${aBtnColor}15,${aBtnColor}08);border:1.5px solid ${aBtnColor}40;color:${aBtnColor};font-weight:700;box-shadow:0 2px 8px ${aBtnColor}20,0 1px 3px rgba(0,0,0,0.08);transition:all 0.2s" onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 4px 12px ${aBtnColor}30,0 2px 6px rgba(0,0,0,0.1)'" onmouseout="this.style.transform='translateY(0)';this.style.boxShadow='0 2px 8px ${aBtnColor}20,0 1px 3px rgba(0,0,0,0.08)'" onclick="event.stopPropagation();openProMembersPopup('${a.replace(/'/g,"\\'")}', '${ca}', ${aMemJson})">
              <span class="mem-ico">👥</span><span>${aMembers.length}명</span>
            </button>` : ''}
          </div>
          <div style="display:flex;flex-direction:column;align-items:center;gap:3px">
            ${(a&&b)?`<div class="rec-sum-score score-click" onclick="toggleDetail('${key}')" title="클릭하여 상세보기">
              <span class="${aWin?'wt':bWin?'lt':'pt-z'}">${m.sa||0}</span>
              <span class="score-sep" style="color:var(--text2);font-size:0.72em;font-weight:900;margin:0 4px;opacity:0.8">:</span>
              <span class="${bWin?'wt':aWin?'lt':'pt-z'}">${m.sb||0}</span>
            </div>`:''}
            ${mapStr ? `<span style="font-size:10px;color:var(--gray-l);max-width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${maps.join(', ')}">${mapStr}</span>` : ''}
            ${aWin ? `<span style="font-size:var(--fs-caption);color:#dc2626;font-weight:700">${a} 승</span>` : bWin ? `<span style="font-size:var(--fs-caption);color:#dc2626;font-weight:700">${b} 승</span>` : ''}
          </div>
          <div style="display:flex;flex-direction:column;align-items:center;gap:5px">
            ${b?`<span class="ubadge${bWin?'':' loser'} clickable-univ" style="background:${cb}" onclick="openUnivModal('${escJS(b)}')">${b}</span>`:''}
            ${bMembers.length ? `<button class="btn btn-xs rc-mem-btn" style="background:linear-gradient(135deg,${bBtnColor}15,${bBtnColor}08);border:1.5px solid ${bBtnColor}40;color:${bBtnColor};font-weight:700;box-shadow:0 2px 8px ${bBtnColor}20,0 1px 3px rgba(0,0,0,0.08);transition:all 0.2s" onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 4px 12px ${bBtnColor}30,0 2px 6px rgba(0,0,0,0.1)'" onmouseout="this.style.transform='translateY(0)';this.style.boxShadow='0 2px 8px ${bBtnColor}20,0 1px 3px rgba(0,0,0,0.08)'" onclick="event.stopPropagation();openProMembersPopup('${b.replace(/'/g,"\\'")}', '${cb}', ${bMemJson})">
              <span class="mem-ico">👥</span><span>${bMembers.length}명</span>
            </button>` : ''}
          </div>
        </div>`;
        })()}
        <div style="margin-left:auto;display:flex;align-items:center;gap:4px;flex-shrink:0" class="no-export">
          <button class="btn btn-w btn-xs rec-morebtn" style="padding:3px 10px;font-size:14px" title="메뉴"
            onclick="openRecActionMenu(event,{
              _btnEl:this,
              a:'${a.replace(/'/g,"\\'")}',
              sa:${m.sa||0},
              b:'${b.replace(/'/g,"\\'")}',
              sb:${m.sb||0},
              d:'${m.d||''}',
              mode:'comp',
              idx:${rIdx>=0?rIdx:'null'},
              key:'${key}',
              canShare:${(()=>{const _adm=(localStorage.getItem('su_share_admin_only')||'0')==='1';return(!_adm||isLoggedIn)?'true':'false';})()},
              canEdit:${((rIdx>=0 || m._src==='tour') && isLoggedIn && !isSubAdmin)?'true':'false'},
              canDel:${(rIdx>=0 && isLoggedIn && !isSubAdmin)?'true':'false'},
              shareFn:${(()=>{const _adm=(localStorage.getItem('su_share_admin_only')||'0')==='1'; if(_adm && !isLoggedIn) return 'null'; return `()=>window._openShareMatchObjCard&&window._openShareMatchObjCard(_getCompMatchObj(${listIdx},'${context}'))`;})()},
              editFn:${m._src==='tour' ? `()=>leagueEditMatch('${m._tnId}',${m._gi},${m._mi})` : 'null'},
              canMove:false
            })">⋯</button>
        </div>
      </div>
      <div id="det-${key}" class="rec-detail-area">
        ${_regDet(key,rIdx>=0?{...m,_editRef:'comp:'+rIdx}:m,'comp',a,b,ca,cb,aWin,bWin, rIdx)}
      </div>
    </div>`;
  });
  return h||`<div class="empty-state"><div class="empty-state-icon">📅</div><div class="empty-state-title">기록이 없습니다</div><div class="empty-state-desc"></div></div>`;
}
// 공유카드용 - context별 캐시된 filtered 배열에서 m 객체 반환 헬퍼
window._compListCache={};
function _getCompMatchObj(listIdx,context){
  // 캐시 없거나 데이터 변경 시 재생성
  if(!window._compListCache||!window._compListCache[context]){
    if(!window._compListCache)window._compListCache={};
    const tourItems=(typeof getTourneyMatches==='function') ? getTourneyMatches() : [];
    const _comps = (typeof comps!=='undefined' && Array.isArray(comps)) ? comps : [];
    const _sortDir = (typeof recSortDir!=='undefined' && (recSortDir==='asc' || recSortDir==='desc')) ? recSortDir : ((window.recSortDir==='asc'||window.recSortDir==='desc') ? window.recSortDir : 'desc');
    const compItems=[..._comps].map((m,origIdx)=>({...m,_src:'comps',_origIdx:origIdx}));
    const all=[...tourItems,...compItems].filter(m=>typeof passDateFilter!=='function'||passDateFilter(m.d||''));
    all.sort((a,b)=>_sortDir==='asc'?(a.d||'').localeCompare(b.d||''):(b.d||'').localeCompare(a.d||''));
    window._compListCache[context]=all;
  }
  const m = window._compListCache[context][listIdx]||null;
  if(!m) return null;
  return {...m,_matchType:'comp',compName:m.compName||m.n||'',teamALabel:m.teamALabel||m.a||'',teamBLabel:m.teamBLabel||m.b||''};
}

/* ══════════════════════════════════════
   경기 이동 (탭 간 이동)
══════════════════════════════════════ */
var _movePop=null;
function _showMovePop(btn,opts){
  closeMovePop();
  const pop=document.createElement('div');
  pop.id='_movePop';
  pop.style.cssText='position:fixed;z-index:var(--z-top);background:var(--white,#fff);border:1px solid var(--border2,#cbd5e1);border-radius:var(--r);box-shadow:0 6px 24px rgba(0,0,0,.18);padding:6px;min-width:180px;font-family:\'Noto Sans KR\',sans-serif';
  const r=btn.getBoundingClientRect();
  pop.style.top=(r.bottom+4)+'px';
  pop.style.right=(window.innerWidth-r.right)+'px';
  let html='';
  opts.forEach((o,i)=>{
    html+=`<button onclick="_movePop_pick(${i})" style="display:block;width:100%;text-align:left;padding:8px 12px;border:none;background:none;cursor:pointer;font-size:var(--fs-base);font-weight:600;border-radius:7px;color:var(--text,#1e293b)" onmouseenter="this.style.background='rgba(37,99,235,.08)'" onmouseleave="this.style.background='none'">${o.l}</button>`;
  });
  html+=`<button onclick="closeMovePop()" style="display:block;width:100%;text-align:left;padding:6px 12px;border:none;background:none;cursor:pointer;font-size:var(--fs-sm);border-radius:7px;color:var(--gray-l,#94a3b8)" onmouseenter="this.style.background='rgba(0,0,0,.04)'" onmouseleave="this.style.background='none'">취소</button>`;
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
  const arr=bulkKey==='univm'?univM:bulkKey==='ck'?ckM:bulkKey==='pro'?proM:bulkKey==='tt'?ttM:miniM;
  const resolved = [];
  cbs.forEach(cb=>{
    const idx = parseInt(cb.dataset.bidx,10);
    if(isFinite(idx) && idx>=0 && idx<arr.length && arr[idx]){ resolved.push(idx); return; }
    const mid = String(cb.dataset.bmid||'').trim();
    if(mid){
      const found = arr.findIndex(x=>{
        const id = x && (x._id || x.sid || x.matchId);
        return id && String(id) === mid;
      });
      if(found>=0) resolved.push(found);
    }
  });
  const indices = [...new Set(resolved)].sort((a,b)=>b-a);
  if(!indices.length){alert('선택된 경기가 없습니다.');return;}
  if(!confirm(indices.length+'개 경기를 삭제하시겠습니까?\n\n⚠️ 해당 대전의 모든 경기 결과가 선수 성적에서 차감됩니다.'))return;
  const deletedIds=new Set();
  indices.forEach(idx=>{
    const matchObj=arr[idx];
    if(matchObj){
      if(bulkKey==='tt'){
        try{ if(typeof window._rememberDeletedTierGeneralRestoreMatch === 'function') window._rememberDeletedTierGeneralRestoreMatch(matchObj); }catch(e){}
      }
      if(matchObj._id){
        deletedIds.add(matchObj._id);
        // 게임 레벨 ID도 추가 (sets 기반 저장: matchId_sN_gN 포맷)
        (matchObj.sets||[]).forEach((set,si)=>{
          (set.games||[]).forEach((g,gi)=>{
            deletedIds.add(`${matchObj._id}_s${si}_g${gi}`);
          });
        });
      }
      arr.splice(idx,1);
      revertMatchRecord(matchObj);
      // (버그픽스) 티어대회(tt)는 tourneys(조별/브라켓)에도 같은 _id 기록이 남아 있으면
      // 다음 렌더/마이그레이션에서 다시 ttM으로 복구되어 "삭제가 안 된 것처럼" 보일 수 있음.
      if(bulkKey==='tt' && matchObj._id) {
        try{ _removeTierTourneyMatchById(matchObj._id); }catch(e){}
      }
    }
  });
  // 안전 처리: revertMatchRecord가 놓친 history 항목 직접 정리
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
  try{ if(typeof window.refreshPlayerModalIfOpen === 'function') window.refreshPlayerModalIfOpen(); }catch(e){}
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

function delRec(mode,i,matchId){
  if(!confirm('삭제하시겠습니까?\n\n⚠️ 해당 대전의 모든 경기 결과가 선수 성적에서 차감됩니다.'))return;
  // 개인전/끝장전/프로 끝장전은 기존 delRec 로직(팀 대전 revertMatchRecord)과 구조가 달라서
  // 별도 삭제 처리 필요 (요청사항: 삭제가 안됨 해결)
  const _m = String(mode||'');
  if(_m==='ind' || _m==='individual'){
    const m = (typeof indM!=='undefined' && indM) ? indM[i] : null;
    if(!m) return;
    try{ if(typeof _removeIndResult==='function') _removeIndResult(m.wName,m.lName,m.d||'',m.map||'-',m._id); }catch(e){}
    try{ indM.splice(i,1); }catch(e){}
    // (버그픽스) 전역 window.indM 동기화 + 캐시 강제 갱신
    // — _restoreStableIndGj가 삭제 후 render 시 이전 캐시로 복원하는 문제 방지
    try{ window.indM = indM; }catch(e){}
    try{ window.__lastGoodIndM = indM.slice(); window.__indGjCacheSet_ind = true; }catch(e){}
    try{ if(typeof _rebuildAllPlayerHistoryCore==='function') _rebuildAllPlayerHistoryCore(); }catch(e){}
    save();render();
    try{ if(typeof window.refreshPlayerModalIfOpen==='function') window.refreshPlayerModalIfOpen(); }catch(e){}
    return;
  }
  if(_m==='gj' || _m==='progj'){
    try{
      const isPro = (_m==='progj');
      const pool = (typeof gjM!=='undefined' && Array.isArray(gjM))
        ? gjM.filter(x=>isPro ? !!x._proLabel : !x._proLabel)
        : [];
      const tgt = pool[i] || null;
      if(!tgt) return;
      const gi = (typeof gjM!=='undefined' && Array.isArray(gjM)) ? gjM.indexOf(tgt) : -1;
      if(gi>=0){
        try{ if(typeof _removeGjResult==='function') _removeGjResult(tgt.wName,tgt.lName,tgt.d||'',tgt.map||'-',tgt._id||tgt.matchId||undefined); }catch(e){}
        gjM.splice(gi,1);
      }
    }catch(e){}
    // (버그픽스) 전역 window.gjM 동기화 + 캐시 강제 갱신
    // — _restoreStableIndGj가 삭제 후 render 시 이전 캐시로 복원하는 문제 방지
    try{ window.gjM = gjM; }catch(e){}
    try{ window.__lastGoodGjM = gjM.slice(); window.__indGjCacheSet_gj = true; }catch(e){}
    try{ if(typeof _rebuildAllPlayerHistoryCore==='function') _rebuildAllPlayerHistoryCore(); }catch(e){}
    save();render();
    try{ if(typeof window.refreshPlayerModalIfOpen==='function') window.refreshPlayerModalIfOpen(); }catch(e){}
    return;
  }
  let matchObj=null;
  const _mid = String(matchId||'').trim();
  const _pickById = (arr)=>{
    if(!Array.isArray(arr) || !_mid) return -1;
    const idx = arr.findIndex(x=>{
      const id = x && (x._id || x.sid || x.matchId);
      return id && String(id) === _mid;
    });
    return idx;
  };
  const _safeIndex = (arr, idxHint)=>{
    const idx = Number(idxHint);
    if(Array.isArray(arr) && isFinite(idx) && idx>=0 && idx<arr.length && arr[idx]) return idx;
    const byId = _pickById(arr);
    if(byId>=0) return byId;
    return -1;
  };
  if(mode==='mini' || mode==='civil'){
    const idx = _safeIndex(miniM, i);
    if(idx>=0){ matchObj=miniM[idx]; miniM.splice(idx,1); }
  }
  else if(mode==='univm'){
    const idx = _safeIndex(univM, i);
    if(idx>=0){ matchObj=univM[idx]; univM.splice(idx,1); }
  }
  else if(mode==='comp'){
    const idx = _safeIndex(comps, i);
    if(idx>=0){ matchObj=comps[idx]; comps.splice(idx,1); }
  }
  else if(mode==='ck'){
    const idx = _safeIndex(ckM, i);
    if(idx>=0){ matchObj=ckM[idx]; ckM.splice(idx,1); }
  }
  else if(mode==='pro'){
    const idx = _safeIndex(proM, i);
    if(idx>=0){ matchObj=proM[idx]; proM.splice(idx,1); }
  }
  else if(mode==='tt'){
    const idx = _safeIndex(ttM, i);
    if(idx>=0){
      matchObj=ttM[idx];
      try{ if(typeof window._rememberDeletedTierGeneralRestoreMatch === 'function') window._rememberDeletedTierGeneralRestoreMatch(matchObj); }catch(e){}
      ttM.splice(idx,1);
    }
  }
  if(matchObj) {
    revertMatchRecord(matchObj);
    if(mode==='tt' && matchObj._id) {
      try{ _removeTierTourneyMatchById(matchObj._id); }catch(e){}
    }
  }
  if(typeof fixPoints==='function')fixPoints();
  save();render();
  try{ if(typeof window.refreshPlayerModalIfOpen === 'function') window.refreshPlayerModalIfOpen(); }catch(e){}
}


