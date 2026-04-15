/* ══════════════════════════════════════
   TAB & RENDER
══════════════════════════════════════ */
function sw(t,el){
  // 탭 변경 시 서브탭 초기화
  if(t==='comp') { compSub='league'; leagueFilterDate=''; leagueFilterGrp=''; grpRankFilter=''; }
  if(t==='mini') miniSub='records';
  if(t==='ind') indSub='records';
  if(t==='gj') gjSub='records';
  if(t==='univck') ckSub='records';
  if(t==='univm') univmSub='records';
  // 통합탭 서브탭 초기값 (탭 진입 시에만 설정)
  if(t==='ind')      _mergedIndSub='ind';
  if(t==='gj')       _mergedIndSub='gj';
  if(t==='univm'||t==='mini') { _mergedUnivSub='mini'; miniType='mini'; }
  if(t==='univck')   _mergedUnivSub='univck';
  if(t==='comp')     _mergedCompSub='comp';
  if(t==='tiertour') _mergedCompSub='tiertour';
  if(t==='pro') { _mergedProSub='pro'; }
  if(t==='hist') histSub='mini'; // 대전 기록 탭으로 돌아올 때 초기화
  // 탭 전환 시 해당 탭 검색어 초기화
  if(window._recQ){const tabModeMap={mini:'mini',univck:'ck',univm:'univm',comp:'comp',pro:'pro',ind:'ind'};const m=tabModeMap[t];if(m)window._recQ[m]='';}
  if(t==='total')totalSearch='';
  curTab=t;openDetails={};
  document.querySelectorAll('.tab').forEach(b=>b.classList.remove('on'));
  el.classList.add('on');
  // 바텀 네비 활성화 동기화
  document.querySelectorAll('.bnav-item').forEach(b=>{
    const oc=b.getAttribute('onclick')||'';
    b.classList.toggle('on',oc.includes("'"+t+"'"));
  });
  const _fs=document.getElementById('fstrip');if(_fs)_fs.style.display=(t==='total'&&isLoggedIn)?'block':'none';
  // 이전 내용 제거 후 렌더링
  const C=document.getElementById('rcont');
  if(C) C.innerHTML='';
  render();
}
function render(){
  const C=document.getElementById('rcont');
  const T=document.getElementById('rtitle');
  if(!C||!T)return;
  const farea=document.getElementById('farea');if(farea)farea.innerHTML='';
  // 탭 버튼 UI 동기화
  document.querySelectorAll('.tab').forEach(b=>{
    const oc=b.getAttribute('onclick')||'';
    const active=oc.includes("'"+curTab+"'");
    b.classList.toggle('on',active);
  });
  // 이전 내용 제거
  C.innerHTML='';
  // 날짜 필터 변경 시 캐시 초기화
  window._compListCache={};
  window._histTourneyCache={};
  // 탭별 렌더 함수 직접 호출 (object literal 일괄 평가 에러 방지)
  switch(curTab){
    case 'total':   if(typeof rTotal==='function')   rTotal(C,T);   break;
    case 'tier':    if(typeof rTier==='function')    rTier(C,T);    break;
    case 'hist':    if(typeof rHist==='function')    rHist(C,T);    break;
    case 'ind': case 'gj':               rMergedInd(C,T);   break;
    case 'mini': case 'univm': case 'univck': rMergedUnivM(C,T); break;
    case 'comp': case 'tiertour':        rMergedComp(C,T);  break;
    case 'pro':     rMergedPro(C,T);     break;
    case 'cfg':     if(typeof rCfg==='function')     rCfg(C,T);     break;
    case 'stats':   if(typeof rStats==='function')   rStats(C,T);   break;
    case 'cal':     if(typeof rCal==='function')     rCal(C,T);     break;
    case 'roulette':if(typeof rRoulette==='function')rRoulette(C,T);break;
    case 'vote':    if(typeof rVote==='function')    rVote(C,T);    break;
    case 'board':   if(typeof rBoard==='function')   rBoard(C,T);   break;
    case 'board2':  if(typeof rBoard2==='function')  rBoard2(C,T);  break;
    default: break;
  }
  // 렌더링 후 빈 rec-summary 제거 (내용 없는 빈 줄 방지)
  // 즉시 1차 inject (PC 포함 즉시 적용)
  injectUnivIcons(C);
  requestAnimationFrame(()=>{
    C.querySelectorAll('.rec-summary').forEach(el=>{
      const header=el.querySelector('.rec-sum-header');
      if(!header||header.innerText.trim()==='')el.remove();
    });
    injectUnivIcons(C);
    // 경기 검색창 포커스 복원
    const _restoreFocus=()=>{
      // 검색 중인 특정 input으로 포커스
      if(window._searchFocusId){
        const el=document.getElementById(window._searchFocusId);
        if(el){el.focus();el.setSelectionRange(el.value.length,el.value.length);return;}
      }
      if(window._recQ){
        Object.keys(window._recQ).forEach(mode=>{
          if(!window._recQ[mode]) return;
          const el=document.getElementById('rq-'+mode);
          if(el&&document.activeElement!==el){el.focus();el.setSelectionRange(el.value.length,el.value.length);}
        });
      }
      // 스트리머 탭 검색창 포커스 복원
      const tsi=document.getElementById('total-search');
      if(tsi&&typeof totalSearch!=='undefined'&&totalSearch&&document.activeElement!==tsi){tsi.focus();tsi.setSelectionRange(tsi.value.length,tsi.value.length);}
    };
    _restoreFocus();
    // 모바일: 첫 rAF 후 한 프레임 더 (포커스 복원만, 아이콘은 앞에서 완료)
    requestAnimationFrame(()=>{_restoreFocus();});
  });
}

/* ══════════════════════════════════════
   스트리머 상세 모달 페이지네이션 헬퍼
   인라인 onclick 복잡도를 줄이고 스코핑 이슈 방지
══════════════════════════════════════ */
window._goPlayerHistPage = function(page, name){
  playerHistPage = page;
  const _p = players.find(x=>x.name===name);
  if(!_p) return;
  const _mb = document.getElementById('playerModalBody');
  if(!_mb) return;
  const _st = _mb.scrollTop;
  _mb.innerHTML = buildPlayerDetailHTML(_p);
  _mb.scrollTop = _st;
  injectUnivIcons(_mb);
};
window._goPlayerOppPage = function(page, name){
  window._oppPage = page;
  const _p = players.find(x=>x.name===name);
  if(!_p) return;
  const _mb = document.getElementById('playerModalBody');
  if(!_mb) return;
  const _st = _mb.scrollTop;
  _mb.innerHTML = buildPlayerDetailHTML(_p);
  _mb.scrollTop = _st;
  injectUnivIcons(_mb);
};
window._rebuildPlayerDetail = function(name){
  const _p = players.find(x=>x.name===name);
  if(!_p) return;
  const _mb = document.getElementById('playerModalBody');
  if(!_mb) return;
  _mb.innerHTML = buildPlayerDetailHTML(_p);
  injectUnivIcons(_mb);
};

/* ══════════════════════════════════════
   선수 이름 클릭 → 모달
   대학 클릭 → 모달
══════════════════════════════════════ */
function openPlayerModal(name){
  const p=players.find(x=>x.name===name);
  if(!p)return;
  // REQ4: 다른 선수로 변경 시 페이지 초기화
  if(window._playerModalCurrentName!==name){ playerHistPage=0; window._oppPage=0; window._playerModalYear=''; }
  document.getElementById('playerModalTitle').innerText=`👤 ${name} 스트리머 상세`;
  const _mbody=document.getElementById('playerModalBody');
  _mbody.innerHTML=buildPlayerDetailHTML(p);
  const _pdFs=(JSON.parse(localStorage.getItem('su_pd_style')||'{}').font_size||'normal');
  _mbody.style.zoom=_pdFs==='xlarge'?'1.2':_pdFs==='large'?'1.12':'1';
  injectUnivIcons(_mbody);
  // 어드민 전용 수정 버튼 (이름을 data 속성에 직접 저장 → openEP 호출 시 신뢰성 향상)
  const editBtn=document.getElementById('playerModalEditBtn');
  if(editBtn){
    editBtn.style.display=isLoggedIn?'inline-flex':'none';
    editBtn.dataset.playerName=name;
  }
  // 현재 모달에 표시 중인 선수명 저장
  window._playerModalCurrentName=name;
  om('playerModal');
  setTimeout(()=>initPEloChart(name),60);
}

// openEPFromModal은 tier-tour.js에 정의됨. 로드 지연 대비 fallback
function openEPFromModal(nameArg) {
  const name = nameArg || window._playerModalCurrentName;
  if (!name) { alert('선수 이름을 확인할 수 없습니다.'); return; }
  if (typeof openEP !== 'function') {
    // tier-tour.js가 아직 로드되지 않은 경우 지연 후 재시도
    let attempts = 0;
    const checkOpenEP = setInterval(() => {
      attempts++;
      if (typeof openEP === 'function') {
        clearInterval(checkOpenEP);
        try { openEP(name); } catch(e) { alert('수정창 열기 실패: ' + e.message); }
      } else if (attempts >= 20) {
        clearInterval(checkOpenEP);
        alert('수정창 로드 실패: 페이지를 새로고침해주세요.');
      }
    }, 200);
    return;
  }
  try { openEP(name); } catch(e) { alert('수정창 열기 실패: ' + e.message); }
}

/* ── 선수 최근 경기 수정 (관리자 전용) ── */
let _playerHistBulkSelected = new Set(); // 일괄 선택된 경기 인덱스
let _playerHistBulkMode = false; // 일괄 선택 모드

function deletePlayerHist(playerName, histIdx){
  if(!isLoggedIn)return;
  if(!confirm('이 경기 기록을 삭제할까요?\n\n⚠️ ELO와 승패 기록이 차감됩니다.'))return;
  const p=players.find(x=>x.name===playerName);
  if(!p||!p.history||!p.history[histIdx])return;
  const hh=p.history[histIdx];
  // ELO + 승/패 + 포인트 차감
  if(hh.eloDelta!=null) p.elo=(p.elo||ELO_DEFAULT)-hh.eloDelta;
  if(hh.result==='승'){ p.win=Math.max(0,(p.win||0)-1); p.points=(p.points||0)-3; }
  else { p.loss=Math.max(0,(p.loss||0)-1); p.points=(p.points||0)+3; }
  // 상대 기록도 차감
  const opp=players.find(x=>x.name===hh.opp);
  if(opp){
    const oppHist=opp.history||[];
    const oppIdx=oppHist.findIndex(o=>o.opp===playerName&&o.date===hh.date&&o.map===hh.map);
    if(oppIdx>=0){
      const oh=oppHist[oppIdx];
      if(oh.eloDelta!=null) opp.elo=(opp.elo||ELO_DEFAULT)-oh.eloDelta;
      if(oh.result==='승'){ opp.win=Math.max(0,(opp.win||0)-1); opp.points=(opp.points||0)-3; }
      else { opp.loss=Math.max(0,(opp.loss||0)-1); opp.points=(opp.points||0)+3; }
      oppHist.splice(oppIdx,1);
    }
  }
  p.history.splice(histIdx,1);
  // matchId로 해당 경기를 대전기록 배열에서도 완전 삭제
  if(hh.matchId){
    const mid=hh.matchId;
    const _arrMap={mini:miniM,univm:univM,ck:ckM,pro:proM};
    // mode로 배열 특정, 없으면 전체 탐색
    const _modeArrKey={'미니대전':'mini','시빌워':'mini','대학대전':'univm','대학CK':'ck','프로리그':'pro','티어대회':'tt'};
    const _targetKey=hh.mode?_modeArrKey[hh.mode]:null;
    const _searchArrs=_targetKey?[[_targetKey,_arrMap[_targetKey]]]:Object.entries(_arrMap);
    for(const [,arr] of _searchArrs){
      if(!arr)continue;
      const idx=arr.findIndex(m=>m._id===mid);
      if(idx>=0){ arr.splice(idx,1); break; }
    }
  }
  // indM/gjM 경기도 삭제 (개인전/끝장전은 matchId 대신 _id 사용)
  if(hh.mode==='개인전'||hh.mode==='프로리그'||hh.mode==='끝장전'||hh.mode==='프로리그끝장전'){
    const targetArr=(hh.mode==='개인전'||hh.mode==='프로리그')?indM:gjM;
    if(targetArr){
      const idx=targetArr.findIndex(m=>m._id===hh.matchId||(m.d===hh.date&&m.map===hh.map&&((m.wName===playerName&&m.lName===hh.opp)||(m.lName===playerName&&m.wName===hh.opp))));
      if(idx>=0){ targetArr.splice(idx,1); }
    }
  }
  if(typeof fixPoints==='function')fixPoints();
  save();
  render();
  const pb=document.getElementById('playerModalBody');
  if(pb){
    const p=players.find(x=>x.name===playerName);
    if(p){
      pb.innerHTML=buildPlayerDetailHTML(p);
      injectUnivIcons(pb);
    }
  }
}

function deletePlayerHistBulk(playerName){
  if(!isLoggedIn)return;
  if(_playerHistBulkSelected.size===0){
    alert('선택된 경기 기록이 없습니다.');
    return;
  }
  if(!confirm(`${_playerHistBulkSelected.size}개의 경기 기록을 삭제할까요?\n\n⚠️ ELO와 승패 기록이 차감됩니다.`))return;
  const p=players.find(x=>x.name===playerName);
  if(!p||!p.history)return;
  // 인덱스 내림차순 정렬 후 삭제 (인덱스 변동 방지)
  const sortedIdx=[..._playerHistBulkSelected].sort((a,b)=>b-a);
  sortedIdx.forEach(idx=>{
    if(p.history[idx]){
      const hh=p.history[idx];
      if(hh.eloDelta!=null) p.elo=(p.elo||ELO_DEFAULT)-hh.eloDelta;
      if(hh.result==='승'){ p.win=Math.max(0,(p.win||0)-1); p.points=(p.points||0)-3; }
      else { p.loss=Math.max(0,(p.loss||0)-1); p.points=(p.points||0)+3; }
      // 상대 기록도 차감
      const opp=players.find(x=>x.name===hh.opp);
      if(opp){
        const oppHist=opp.history||[];
        const oppIdx=oppHist.findIndex(o=>o.opp===playerName&&o.date===hh.date&&o.map===hh.map);
        if(oppIdx>=0){
          const oh=oppHist[oppIdx];
          if(oh.eloDelta!=null) opp.elo=(opp.elo||ELO_DEFAULT)-oh.eloDelta;
          if(oh.result==='승'){ opp.win=Math.max(0,(opp.win||0)-1); opp.points=(opp.points||0)-3; }
          else { opp.loss=Math.max(0,(opp.loss||0)-1); opp.points=(opp.points||0)+3; }
          oppHist.splice(oppIdx,1);
        }
      }
      p.history.splice(idx,1);
    }
  });
  _playerHistBulkSelected.clear();
  if(typeof fixPoints==='function')fixPoints();
  save();
  document.getElementById('playerModalBody').innerHTML=buildPlayerDetailHTML(p);
  injectUnivIcons(document.getElementById('playerModalBody'));
}

function togglePlayerHistBulkMode(){
  _playerHistBulkMode=!_playerHistBulkMode;
  _playerHistBulkSelected.clear();
  if(typeof window._rebuildPlayerDetail==='function') window._rebuildPlayerDetail(window._playerModalCurrentName||'');
}

function togglePlayerHistSelect(idx){
  if(_playerHistBulkSelected.has(idx)){
    _playerHistBulkSelected.delete(idx);
  }else{
    _playerHistBulkSelected.add(idx);
  }
  const btn=document.getElementById('bulk-delete-btn');
  if(btn) btn.textContent=`🗑 선택 삭제 (${_playerHistBulkSelected.size})`;
}

function togglePlayerHistSelectAll(playerName, allIndices){
  if(_playerHistBulkSelected.size===allIndices.length){
    _playerHistBulkSelected.clear();
  }else{
    allIndices.forEach(idx=>_playerHistBulkSelected.add(idx));
  }
  const btn=document.getElementById('bulk-delete-btn');
  if(btn) btn.textContent=`🗑 선택 삭제 (${_playerHistBulkSelected.size})`;
  const editBtn=document.getElementById('bulk-edit-btn');
  if(editBtn) editBtn.textContent=`✏️ 선택 수정 (${_playerHistBulkSelected.size})`;
  const checkboxes=document.querySelectorAll('.hist-select-checkbox');
  checkboxes.forEach(cb=>cb.checked=_playerHistBulkSelected.has(parseInt(cb.value)));
}

function openPlayerHistBulkEdit(playerName){
  if(!isLoggedIn)return;
  if(_playerHistBulkSelected.size===0){
    alert('선택된 경기 기록이 없습니다.');
    return;
  }
  const p=players.find(x=>x.name===playerName);
  if(!p||!p.history)return;
  
  // 선택된 기록들의 공통 값 추출
  const selectedHists=[..._playerHistBulkSelected].map(idx=>p.history[idx]).filter(Boolean);
  const allModes=[...new Set(selectedHists.map(h=>h.mode).filter(Boolean))];
  const allMaps=[...new Set(selectedHists.map(h=>h.map).filter(Boolean))];
  
  document.getElementById('reTitle').textContent=`✏️ 일괄 경기 수정 — ${playerName} (${_playerHistBulkSelected.size}개)`;
  document.getElementById('reBody').innerHTML=`
    <div style="display:flex;flex-direction:column;gap:12px">
      <div style="background:#fef3c7;border:1px solid #fcd34d;border-radius:8px;padding:10px;font-size:11px;color:#92400e">
        ⚠️ 선택된 ${_playerHistBulkSelected.size}개의 경기 기록을 일괄 수정합니다.
      </div>
      <div>
        <label style="font-weight:700;font-size:12px;margin-bottom:4px;display:block">종목 변경</label>
        <select id="phe-bulk-mode" style="width:100%">
          <option value="">변경 안함</option>
          ${allModes.map(m=>`<option value="${m}">${m} (현재값)</option>`).join('')}
          <option value="개인전">개인전</option>
          <option value="프로리그">프로리그</option>
          <option value="끝장전">끝장전</option>
          <option value="미니대전">미니대전</option>
          <option value="시빌워">시빌워</option>
          <option value="대학대전">대학대전</option>
          <option value="대학CK">대학CK</option>
          <option value="티어대회">티어대회</option>
        </select>
      </div>
      <div>
        <label style="font-weight:700;font-size:12px;margin-bottom:4px;display:block">맵 변경</label>
        <div style="display:flex;gap:6px">
          <select id="phe-bulk-map-sel" style="flex:1" onchange="const v=this.value;const inp=document.getElementById('phe-bulk-map');if(v)inp.value=v;">
            <option value="">목록에서 선택</option>
            ${maps.map(m=>`<option value="${m}">${m}</option>`).join('')}
          </select>
          <input id="phe-bulk-map" type="text" placeholder="또는 직접 입력" style="flex:1">
        </div>
      </div>
      <div>
        <label style="font-weight:700;font-size:12px;margin-bottom:4px;display:block">날짜 변경</label>
        <input id="phe-bulk-date" type="date" placeholder="YYYY-MM-DD" style="width:100%">
      </div>
      <div style="display:flex;gap:8px;margin-top:8px">
        <button class="btn btn-g" onclick="savePlayerHistBulkEdit('${playerName}')" style="flex:1">저장</button>
        <button class="btn btn-w" onclick="cm('reModal')" style="flex:1">취소</button>
      </div>
    </div>
  `;
  om('reModal');
}

function savePlayerHistBulkEdit(playerName){
  if(!isLoggedIn)return;
  const p=players.find(x=>x.name===playerName);
  if(!p||!p.history)return;
  
  const newMode=document.getElementById('phe-bulk-mode').value;
  const newMap=document.getElementById('phe-bulk-map').value;
  const newDate=document.getElementById('phe-bulk-date').value;
  
  if(!newMode&&!newMap&&!newDate){
    alert('변경할 항목을 선택해주세요.');
    return;
  }
  
  if(!confirm(`${_playerHistBulkSelected.size}개의 경기 기록을 수정할까요?`))return;
  
  const sortedIdx=[..._playerHistBulkSelected].sort((a,b)=>b-a);
  sortedIdx.forEach(idx=>{
    if(p.history[idx]){
      const hh=p.history[idx];
      if(newMode) hh.mode=newMode;
      if(newMap) hh.map=newMap;
      if(newDate) hh.date=newDate;
    }
  });
  
  _playerHistBulkSelected.clear();
  save();
  render();
  cm('reModal');
  const pb=document.getElementById('playerModalBody');
  if(pb){
    const p=players.find(x=>x.name===playerName);
    if(p){
      pb.innerHTML=buildPlayerDetailHTML(p);
      injectUnivIcons(pb);
    }
  }
}

function openPlayerHistEdit(playerName, histIdx){
  if(!isLoggedIn)return;
  const p=players.find(x=>x.name===playerName);
  if(!p||!p.history||!p.history[histIdx])return;
  const hh=p.history[histIdx];
  const races=['T','Z','P'];
  // mapOpts: select는 항상 "목록에서 선택" 기본값, selected 없음
  const mapOpts=maps.map(m=>`<option value="${m}">${m}</option>`).join('');
  document.getElementById('reTitle').textContent=`✏️ 경기 수정 — ${playerName} vs ${hh.opp}`;
  document.getElementById('reBody').innerHTML=`
    <div style="display:flex;flex-direction:column;gap:8px">
      <div><label>날짜</label><input id="phe-date" type="date" value="${hh.date||''}" style="width:100%"></div>
      <div><label>결과</label>
        <select id="phe-result" style="width:100%">
          <option value="승"${hh.result==='승'?' selected':''}>승</option>
          <option value="패"${hh.result==='패'?' selected':''}>패</option>
        </select>
      </div>
      <div><label>상대 이름</label><input id="phe-opp" type="text" value="${hh.opp||''}" style="width:100%"></div>
      <div><label>상대 종족</label>
        <select id="phe-race" style="width:100%">
          ${races.map(r=>`<option value="${r}"${hh.oppRace===r?' selected':''}>${r}</option>`).join('')}
        </select>
      </div>
      <div><label>맵</label>
        <div style="display:flex;gap:6px">
          <select id="phe-map-sel" style="flex:1" onchange="const v=this.value;const inp=document.getElementById('phe-map');if(v)inp.value=v;">
            <option value="">목록에서 선택</option>${mapOpts}
          </select>
          <input id="phe-map" type="text" value="${!hh.map||hh.map==='-'?'':hh.map}" placeholder="맵 이름 직접 입력" style="flex:1">
        </div>
        <div style="font-size:10px;color:var(--gray-l);margin-top:2px">기록값: ${hh.map||'-'}</div>
      </div>
      <div><label>당시 소속 대학</label>
        <select id="phe-univ" style="width:100%">
          <option value="">미지정</option>
          ${getAllUnivs().map(u=>`<option value="${u.name}"${(hh.univ||p.univ)===u.name?' selected':''}>${u.name}</option>`).join('')}
        </select>
        <div style="font-size:10px;color:var(--gray-l);margin-top:2px">현재: ${p.univ||'무소속'} · 기록: ${hh.univ||'(미저장)'}</div>
      </div>
    </div>`;
  // 저장 버튼 임시 교체 (완료 후 원래 saveRow 복원)
  const saveBtnOrig=document.querySelector('#reModal .btn-b');
  if(saveBtnOrig){
    const _prevOnclick=saveBtnOrig.onclick;
    saveBtnOrig.onclick=function(){
      const oldDate=hh.date, oldMap=hh.map, oldOpp=hh.opp, oldResult=hh.result;
      const newDate=document.getElementById('phe-date').value;
      const newResult=document.getElementById('phe-result').value;
      const newOpp=document.getElementById('phe-opp').value;
      const newRace=document.getElementById('phe-race').value;
      const newMap=document.getElementById('phe-map').value||'-';
      const _newUniv=document.getElementById('phe-univ')?.value;

      // ── 결과(승/패) 변경 시 본인 ELO·승패·포인트 재계산 ──
      if(newResult!==oldResult){
        // 기존 결과 되돌리기
        if(hh.eloDelta!=null) p.elo=(p.elo||ELO_DEFAULT)-hh.eloDelta;
        if(oldResult==='승'){p.win=Math.max(0,(p.win||0)-1);p.points=(p.points||0)-3;}
        else{p.loss=Math.max(0,(p.loss||0)-1);p.points=(p.points||0)+3;}
        // 새 결과 적용 (ELO delta 부호 반전)
        const newDelta=hh.eloDelta!=null?-hh.eloDelta:null;
        if(newDelta!=null){p.elo=(p.elo||ELO_DEFAULT)+newDelta;hh.eloDelta=newDelta;}
        if(newResult==='승'){p.win=(p.win||0)+1;p.points=(p.points||0)+3;}
        else{p.loss=(p.loss||0)+1;p.points=(p.points||0)-3;}
      }

      hh.date=newDate;
      hh.result=newResult;
      hh.opp=newOpp;
      hh.oppRace=newRace;
      hh.map=newMap;
      if(_newUniv) hh.univ=_newUniv;

      // ── 상대방 history도 날짜/맵/결과 동기화 ──
      const oppPlayer=players.find(x=>x.name===oldOpp);
      if(oppPlayer){
        const oppH=(oppPlayer.history||[]).find(o=>
          o.opp===playerName&&o.date===oldDate&&(o.map||'-')===(oldMap||'-')
        );
        if(oppH){
          oppH.date=newDate;
          oppH.map=newMap;
          if(newOpp!==oldOpp) oppH.opp=newOpp;
          // 결과 변경 시 상대방 결과·ELO·승패도 반전
          if(newResult!==oldResult){
            const oppOldResult=oppH.result;
            if(oppH.eloDelta!=null) oppPlayer.elo=(oppPlayer.elo||ELO_DEFAULT)-oppH.eloDelta;
            if(oppOldResult==='승'){oppPlayer.win=Math.max(0,(oppPlayer.win||0)-1);oppPlayer.points=(oppPlayer.points||0)-3;}
            else{oppPlayer.loss=Math.max(0,(oppPlayer.loss||0)-1);oppPlayer.points=(oppPlayer.points||0)+3;}
            const newOppDelta=oppH.eloDelta!=null?-oppH.eloDelta:null;
            if(newOppDelta!=null){oppPlayer.elo=(oppPlayer.elo||ELO_DEFAULT)+newOppDelta;oppH.eloDelta=newOppDelta;}
            oppH.result=oppOldResult==='승'?'패':'승';
            if(oppH.result==='승'){oppPlayer.win=(oppPlayer.win||0)+1;oppPlayer.points=(oppPlayer.points||0)+3;}
            else{oppPlayer.loss=(oppPlayer.loss||0)+1;oppPlayer.points=(oppPlayer.points||0)-3;}
          }
        }
      }

      // ── 대전기록 배열(.d)도 날짜 동기화 (tourneys 포함) ──
      if(hh.matchId && newDate){
        const mid=hh.matchId;
        const _flatArrs=[miniM,univM,ckM,proM,comps,
          typeof gjM!=='undefined'?gjM:[],
          typeof indM!=='undefined'?indM:[]];
        let found=false;
        for(const arr of _flatArrs){
          if(!arr)continue;
          const entry=arr.find(m=>m._id===mid);
          if(entry){entry.d=newDate;found=true;break;}
        }
        // tourneys 내 경기 탐색 (대회/티어대회)
        if(!found && typeof tourneys!=='undefined'){
          outer: for(const tn of tourneys){
            for(const grp of (tn.groups||[])){
              for(const m of (grp.matches||[])){
                if(m._id===mid){m.d=newDate;found=true;break outer;}
              }
            }
            const br=tn.bracket||{};
            for(const m of Object.values(br.matchDetails||{})){
              if(m&&m._id===mid){m.d=newDate;found=true;break outer;}
            }
            for(const m of (br.manualMatches||[])){
              if(m&&m._id===mid){m.d=newDate;found=true;break outer;}
            }
          }
        }
      }

      saveBtnOrig.onclick=_prevOnclick;
      if(typeof fixPoints==='function')fixPoints();
      save();
      render();
      cm('reModal');
      const pb=document.getElementById('playerModalBody');
      if(pb){
        const p=players.find(x=>x.name===playerName);
        if(p){
          pb.innerHTML=buildPlayerDetailHTML(p);
          injectUnivIcons(pb);
        }
      }
    };
  }
  om('reModal');
}

// 현황판 대학 공유카드 바로 열기
function openBoardUnivShareCard(univName){
  if(!univName||univName==='전체')return;
  _shareMode='univ';
  _shareUnivSearch=univName;
  openShareCardModal();
  setTimeout(()=>renderShareCardByUniv(univName),80);
}

function openShareCardFromPlayer(){
  const name=window._playerModalCurrentName;
  if(!name)return;
  cm('playerModal');
  _shareMode='player';
  _sharePlayerSearch=name;
  openShareCardModal();
  setTimeout(()=>renderShareCardByPlayer(name),80);
}

function openShareCardFromUniv(){
  const name=window._univModalCurrentName;
  if(!name)return;
  cm('univModal');
  _shareMode='univ';
  _shareUnivSearch=name;
  openShareCardModal();
  setTimeout(()=>renderShareCardByUniv(name),80);
}
function openProCompMatchShare(a,b,sa,sb,d){
  window._shareMatchObj={a,b,sa,sb,d,_noUnivIcon:true,_matchType:'pro'};
  _shareMode='match';openShareCardModal();
  setTimeout(function(){if(window._shareMatchObj)renderShareCardByMatchObj(window._shareMatchObj);},80);
}
function openShareCardFromMatch(mode,idx){
  const arr=mode==='mini'?miniM:mode==='univm'?univM:mode==='ck'?ckM:mode==='comp'?comps:mode==='pro'?proM:miniM;
  const m=arr[idx]||null;
  const isCKorPro=(mode==='ck'||mode==='pro');
  window._shareMatchObj=m?{...m,_noUnivIcon:isCKorPro,_matchType:isCKorPro?mode:''}:null;
  _shareMode='match';
  openShareCardModal();
  setTimeout(()=>{
    if(window._shareMatchObj)renderShareCardByMatchObj(window._shareMatchObj);
  },80);
}

// ── 이미지 저장 로딩 토스트 ──────────────────────────────────────
function _showSaveLoading(){
  let t=document.getElementById('_save-toast');
  if(!t){
    t=document.createElement('div');
    t.id='_save-toast';
    t.style.cssText='position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:rgba(15,23,42,.88);color:#fff;padding:10px 22px;border-radius:24px;font-size:13px;font-weight:700;z-index:99999;display:none;align-items:center;gap:8px;backdrop-filter:blur(6px);font-family:"Noto Sans KR",sans-serif;white-space:nowrap;box-shadow:0 4px 20px rgba(0,0,0,.3)';
    document.body.appendChild(t);
  }
  t.innerHTML='<span style="display:inline-block;animation:_spin .8s linear infinite">⏳</span> 저장 중...';
  t.style.display='flex';
  if(!document.getElementById('_spin-style')){
    const s=document.createElement('style');s.id='_spin-style';
    s.textContent='@keyframes _spin{to{transform:rotate(360deg)}}';
    document.head.appendChild(s);
  }
}
function _hideSaveLoading(){
  const t=document.getElementById('_save-toast');
  if(t) t.style.display='none';
}

async function capturePlayerModal(){
  const body=document.getElementById('playerModalBody');
  if(!body){alert('캡처할 영역이 없습니다.');return;}
  try{
    _showSaveLoading();
    await _imgToDataUrls(body);
    const canvas=await html2canvas(body,{backgroundColor:'#ffffff',scale:2,useCORS:false,allowTaint:false});
    await _saveCanvasImage(canvas,`${window._playerModalCurrentName||'player'}_stat.png`,'png');
  }catch(e){alert('이미지 저장 오류: '+e.message);}
  finally{_hideSaveLoading();}
}

async function captureUnivModal(){
  const body=document.getElementById('univModalBody');
  const title=document.getElementById('univModalTitle');
  if(!body){alert('캡처할 영역이 없습니다.');return;}
  try{
    _showSaveLoading();
    await _imgToDataUrls(body);
    const canvas=await html2canvas(body,{backgroundColor:'#ffffff',scale:2,useCORS:false,allowTaint:false});
    await _saveCanvasImage(canvas,`${title?title.innerText.replace('🏛️ ',''):'univ'}_대학정보.png`,'png');
  }catch(e){alert('이미지 저장 오류: '+e.message);}
  finally{_hideSaveLoading();}
}

async function captureDetail(id, filename){
  const el=document.getElementById(id);
  if(!el){alert('캡처할 영역이 없습니다.');return;}
  try{
    _showSaveLoading();
    await _imgToDataUrls(el);
    const canvas=await html2canvas(el,{backgroundColor:'#ffffff',scale:2,useCORS:false,allowTaint:false});
    await _saveCanvasImage(canvas,`경기상세_${filename}.png`,'png');
  }catch(e){alert('이미지 저장 오류: '+e.message);}
  finally{_hideSaveLoading();}
}

function openUnivModal(univName){
  if(!univName)return;
  document.getElementById('univModalTitle').innerText=`${univName} 대학 상세`;
  document.getElementById('univModalBody').innerHTML=buildUnivDetailHTML(univName);
  injectUnivIcons(document.getElementById('univModalBody'));
  window._univModalCurrentName=univName;
  window._univEditOpen=false;
  om('univModal');
  const editBtn=document.getElementById('univEditBtn');
  if(editBtn) editBtn.style.display=isLoggedIn?'inline-flex':'none';
  // 비동기 업데이트(Firebase 등)로 버튼이 숨겨지는 경우를 방지
  requestAnimationFrame(()=>{
    const btn=document.getElementById('univEditBtn');
    if(btn) btn.style.display=isLoggedIn?'inline-flex':'none';
  });
}

function toggleUnivEdit(){
  window._univEditOpen=!window._univEditOpen;
  const btn=document.getElementById('univEditBtn');
  if(window._univEditOpen){
    if(btn) btn.textContent='✕ 닫기';
    const univName=window._univModalCurrentName;
    const u=univCfg.find(x=>x.name===univName)||{};
    const editHTML=`<div id="univ-edit-panel" style="background:var(--surface);border:1.5px solid var(--border2);border-radius:12px;padding:16px;margin-bottom:16px">
      <div style="font-weight:800;font-size:13px;color:var(--blue);margin-bottom:12px">✏️ 대학 정보 수정</div>
      <label style="font-size:11px;font-weight:700;color:var(--text3);display:block;margin-bottom:4px">대학 이름</label>
      <input type="text" id="ue-name" value="${u.name||''}" style="width:100%;margin-bottom:10px;padding:6px 10px;border-radius:7px;border:1px solid var(--border2);font-size:13px;box-sizing:border-box">
      <label style="font-size:11px;font-weight:700;color:var(--text3);display:block;margin-bottom:4px">대표 색상</label>
      <div style="display:flex;gap:8px;align-items:center;margin-bottom:10px">
        <input type="color" id="ue-color" value="${u.color||'#6b7280'}" style="width:44px;height:36px;padding:2px;border-radius:6px;border:1px solid var(--border2);cursor:pointer">
        <span style="font-size:12px;color:var(--text3)">현재: ${u.color||'미설정'}</span>
      </div>
      <label style="font-size:11px;font-weight:700;color:var(--text3);display:block;margin-bottom:4px">🖼 로고 이미지 URL</label>
      <div style="display:flex;gap:8px;align-items:center;margin-bottom:6px">
        <input type="text" id="ue-icon" value="${u.icon||''}" placeholder="https://... 이미지 URL" style="flex:1;padding:6px 10px;border-radius:7px;border:1px solid var(--border2);font-size:12px" oninput="const v=this.value.trim();const img=document.getElementById('ue-icon-preview');if(v){img.src=v;img.style.display='block';}else img.style.display='none'">
        <img id="ue-icon-preview" src="${u.icon||''}" style="width:40px;height:40px;object-fit:contain;border-radius:8px;border:1px solid var(--border);${u.icon?'':'display:none'}" onerror="this.style.display='none'">
      </div>
      <div style="font-size:10px;color:var(--gray-l);margin-bottom:12px">현황판·선수 상세에서 대학 로고로 표시됩니다.</div>
      <div style="display:flex;gap:6px">
        <button class="btn btn-b" style="flex:1" onclick="saveUnivEdit()">💾 저장</button>
        <button class="btn btn-w" onclick="toggleUnivEdit()">취소</button>
      </div>
    </div>`;
    const body=document.getElementById('univModalBody');
    body.insertAdjacentHTML('afterbegin',editHTML);
  } else {
    if(btn) btn.textContent='✏️ 수정';
    const panel=document.getElementById('univ-edit-panel');
    if(panel) panel.remove();
  }
}

function saveUnivEdit(){
  const univName=window._univModalCurrentName;
  const u=univCfg.find(x=>x.name===univName);
  if(!u) return;
  const newName=(document.getElementById('ue-name')?.value||'').trim();
  const newColor=document.getElementById('ue-color')?.value||u.color;
  const newIcon=(document.getElementById('ue-icon')?.value||'').trim();
  if(!newName){alert('이름을 입력하세요.');return;}
  // 이름 변경 시 players univ 갱신
  if(newName!==univName){
    players.forEach(p=>{if(p.univ===univName)p.univ=newName;});
    _repList([...(miniM||[]), ...(univM||[]), ...(ckM||[]), ...(proM||[]), ...(comps||[])], _repMatch);(m=>{
      if(m.a===univName)m.a=newName;if(m.b===univName)m.b=newName;
      (m.teamAMembers||[]).forEach(x=>{if(x.univ===univName)x.univ=newName;});
      (m.teamBMembers||[]).forEach(x=>{if(x.univ===univName)x.univ=newName;});
    });
    // boardPlayerOrder 키 갱신
    if(typeof boardPlayerOrder!=='undefined'&&boardPlayerOrder[univName]){
      boardPlayerOrder[newName]=boardPlayerOrder[univName];
      delete boardPlayerOrder[univName];
      if(typeof saveBoardPlayerOrder==='function')saveBoardPlayerOrder();
    }
  }
  u.name=newName;
  u.color=newColor;
  if(newIcon) u.icon=newIcon; else delete u.icon;
  save();render();
  window._univModalCurrentName=newName;
  document.getElementById('univModalTitle').innerText=`${newName} 대학 상세`;
  document.getElementById('univModalBody').innerHTML=buildUnivDetailHTML(newName);
  injectUnivIcons(document.getElementById('univModalBody'));
  window._univEditOpen=false;
  const btn=document.getElementById('univEditBtn');
  if(btn){ btn.textContent='✏️ 수정'; btn.style.display=isLoggedIn?'inline-flex':'none'; }
}

// 스트리머 상세 최근 경기 배지 클릭 → 해당 기록 탭으로 이동
function navToMatch(matchId, modeLbl){
  if(!matchId) return;
  if(modeLbl==='티어대회'){
    navToTierMatch(matchId);
    return;
  }
  const _cfg={
    '미니대전':       {histSub:'mini',        arrMode:'mini',  arr:()=>miniM},
    '시빌워':         {histSub:'civil',       arrMode:'mini',  arr:()=>miniM},
    '대학대전':       {histSub:'univm',       arrMode:'univm', arr:()=>univM},
    '대학CK':         {histSub:'ck',          arrMode:'ck',    arr:()=>ckM},
    '프로리그':       {histSub:'pro',         arrMode:'pro',   arr:()=>proM},
    '끝장전':         {histSub:'gj'},
    '프로리그끝장전': {histSub:'progj'},
    '프로리그대회끝장전':{histSub:'procompgj'},
    '개인전':         {histSub:'ind'},
    '조별리그':       {histSub:'comp'},
    '대회':           {histSub:'comp'},
    '토너먼트':       {histSub:'tourney'},
    '프로리그대회':   {histSub:'procomp'},
    '프로리그팀전':   {histSub:'procompteam'},
  }[modeLbl];
  if(!_cfg) return;
  cm('playerModal');
  curTab='hist';
  histSub=_cfg.histSub;
  openDetails={};
  document.querySelectorAll('.tab').forEach(b=>{
    const oc=b.getAttribute('onclick')||'';
    b.classList.toggle('on',oc.includes("'hist'"));
  });
  if(_cfg.arr&&_cfg.arrMode){
    const srcArr=_cfg.arr();
    const idx=srcArr.findIndex(m=>m._id===matchId);
    if(idx>=0){
      const isCK=(_cfg.arrMode==='ck'||_cfg.arrMode==='pro');
      filterYear='전체';filterMonth='전체';
      const filt=srcArr.map((m,i)=>({m,i})).filter(({m})=>{
        if(isCK){if(!m.teamAMembers||!m.teamBMembers)return false;}
        else{if(!m.a||!m.b)return false;}
        return m.sa!=null&&m.sb!=null&&!isNaN(Number(m.sa))&&!isNaN(Number(m.sb));
      });
      const pos=filt.findIndex(f=>f.i===idx);
      const ps=typeof getHistPageSize==='function'?getHistPageSize():20;
      if(pos>=0) histPage[_cfg.arrMode]=Math.floor(pos/ps);
    }
  }
  render();
  if(_cfg.arr&&_cfg.arrMode){
    const srcArr=_cfg.arr();
    const idx=srcArr.findIndex(m=>m._id===matchId);
    if(idx>=0){
      const key='hist-'+_cfg.arrMode+'-'+idx;
      setTimeout(()=>{
        const el=document.getElementById('det-'+key);
        if(el){
          if(!openDetails[key])toggleDetail(key);
          setTimeout(()=>el.scrollIntoView({behavior:'smooth',block:'center'}),80);
        }
      },400);
    }
  }
}

function buildPlayerDetailHTML(p){
  // 보라크루/종합게임 전용 UI 분기
  const _gt = p.gameType || 'starcraft';
  if (_gt === '보라크루') return _buildCrewPlayerDetailHTML(p, '#7c3aed', '💜 보라크루');
  if (_gt === 'general') return _buildCrewPlayerDetailHTML(p, '#10b981', '🎮 종합게임');

  const col=gc(p.univ)||'#6366f1';
  const _winC ='#16a34a';
  const _lossC='#dc2626';
  const _pdStyle=JSON.parse(localStorage.getItem('su_pd_style')||'{}');
  const _darken=((_pdStyle.univ_darken||{})[p.univ]||0);
  // 모바일/PC 이미지 설정 적용
  const _isMobile=window.innerWidth<=768;
  const _imgUrl=_isMobile?(_pdStyle.img2||''):(_pdStyle.img1||'');
  const _imgSettings=JSON.parse(localStorage.getItem('su_img_settings')||'{}');
  const _imgZoom=(_pdStyle.img_zoom||100) * (_isMobile?(_imgSettings.scaleLeft||1):(_imgSettings.scaleRight||1));
  const _imgFill=_pdStyle.img_fill||'cover';
  const _imgX=_pdStyle.img_x||0;
  const _imgY=_pdStyle.img_y||0;
  let _hdrBg;
  if(_imgUrl){
    const _baseBg=_darken>0
      ?`linear-gradient(rgba(0,0,0,${_darken}),rgba(0,0,0,${_darken})),linear-gradient(135deg,${col},${col}ee)`
      :`linear-gradient(135deg,${col},${col}ee)`;
    _hdrBg=`${_baseBg},url('${_imgUrl}') ${_imgX}px ${_imgY}px / ${_imgZoom}% ${_imgZoom}% ${_imgFill} no-repeat`;
  }else{
    _hdrBg=_darken>0
      ?`linear-gradient(rgba(0,0,0,${_darken}),rgba(0,0,0,${_darken})),linear-gradient(135deg,${col},${col}ee)`
      :`linear-gradient(135deg,${col},${col}ee)`;
  }
  const _p2h=v=>Math.max(0,Math.min(255,Math.round(v*2.55))).toString(16).padStart(2,'0');
  const _statsTint=_pdStyle.stats_tint!==undefined?_pdStyle.stats_tint:8;
  const _modeTint=_pdStyle.mode_tint!==undefined?_pdStyle.mode_tint:10;
  const _CPM={light:{win:'#22c55e',loss:'#f87171'},normal:{win:'#16a34a',loss:'#dc2626'},dark:{win:'#15803d',loss:'#b91c1c'}};
  const _cp=_CPM[_pdStyle.color_preset||'normal'];
  const _cWin=_cp.win; const _cLoss=_cp.loss;
  // ── 연도 필터 (indM/gjM 포함) ──
  const _year=window._playerModalYear||'';
  const _histDupKey=h=>{
    if(h?.matchId) return `mid:${h.matchId}`;
    return `${h?.date||''}|${h?.map||'-'}|${[p.name,h?.opp||''].sort().join('|')}|${h?.mode||''}`;
  };
  // p.history 중복 제거
  const _historySet=new Set();
  const _dedupedHistory=(p.history||[]).filter(h=>{
    const k=_histDupKey(h);
    if(_historySet.has(k))return false;
    _historySet.add(k);
    return true;
  });
  // history에서 matchId Set 추출
  const _existingMatchIds=new Set(_dedupedHistory.map(h=>h.matchId).filter(Boolean));
  // history에서 중복 키 Set 추출
  const _existingKeys=new Set(_dedupedHistory.map(h=>_histDupKey(h)));

  // indM/gjM에서 추출 (p.history 미반영분)
  const _indMatches=(typeof indM!=='undefined'?indM:[]).filter(m=>m.wName===p.name||m.lName===p.name).map(m=>({
    date:m.d||'',time:0,result:m.wName===p.name?'승':'패',
    opp:m.wName===p.name?m.lName:m.wName,
    oppRace:(players.find(x=>x.name===(m.wName===p.name?m.lName:m.wName))||{}).race||'',
    map:m.map||'-',matchId:m._id||'',mode:m._proLabel?'프로리그':'개인전',
    _dupKey:`${m.d||''}|${m.map||''}|${[m.wName,m.lName].sort().join('|')}`
  }));
  const _gjMatches=(typeof gjM!=='undefined'?gjM:[]).filter(m=>m.wName===p.name||m.lName===p.name).map(m=>({
    date:m.d||'',time:0,result:m.wName===p.name?'승':'패',
    opp:m.wName===p.name?m.lName:m.wName,
    oppRace:(players.find(x=>x.name===(m.wName===p.name?m.lName:m.wName))||{}).race||'',
    map:m.map||'-',matchId:m._id||'',mode:m._proLabel?'프로리그끝장전':'끝장전',
    _dupKey:`${m.d||''}|${m.map||''}|${[m.wName,m.lName].sort().join('|')}`
  }));

  // miniM/univM/ckM/proM에서 추출 (p.history 미반영분)
  const _otherMatches=[];
  if(typeof miniM!=='undefined'&&miniM.length){
    miniM.forEach(m=>{
      (m.sets||[]).forEach((s,setIdx)=>{
        (s.games||[]).forEach((g,gameIdx)=>{
          if((g.playerA===p.name||g.playerB===p.name)&&g.winner){
            const opp=g.playerA===p.name?g.playerB:g.playerA;
            const oppP=players.find(x=>x.name===opp);
            const gameId = g._id || `${m._id}_s${setIdx}_g${gameIdx}`;
            _otherMatches.push({
              date:m.d||'',time:0,result:g.playerA===p.name&&g.winner==='A'?'승':g.playerB===p.name&&g.winner==='B'?'승':'패',
              opp,oppRace:oppP?.race||'',map:g.map||'-',matchId:gameId,mode:m.type==='civil'?'시빌워':'미니대전',
              _dupKey:`mid:${gameId}`
            });
          }
        });
      });
    });
  }
  if(typeof univM!=='undefined'&&univM.length){
    univM.forEach(m=>{
      (m.sets||[]).forEach((s,setIdx)=>{
        (s.games||[]).forEach((g,gameIdx)=>{
          if((g.playerA===p.name||g.playerB===p.name)&&g.winner){
            const opp=g.playerA===p.name?g.playerB:g.playerA;
            const oppP=players.find(x=>x.name===opp);
            const gameId = g._id || `${m._id}_s${setIdx}_g${gameIdx}`;
            _otherMatches.push({
              date:m.d||'',time:0,result:g.playerA===p.name&&g.winner==='A'?'승':g.playerB===p.name&&g.winner==='B'?'승':'패',
              opp,oppRace:oppP?.race||'',map:g.map||'-',matchId:gameId,mode:'대학대전',
              _dupKey:`mid:${gameId}`
            });
          }
        });
      });
    });
  }
  if(typeof ckM!=='undefined'&&ckM.length){
    ckM.forEach(m=>{
      (m.sets||[]).forEach((s,setIdx)=>{
        (s.games||[]).forEach((g,gameIdx)=>{
          if((g.playerA===p.name||g.playerB===p.name)&&g.winner){
            const opp=g.playerA===p.name?g.playerB:g.playerA;
            const oppP=players.find(x=>x.name===opp);
            const gameId = g._id || `${m._id}_s${setIdx}_g${gameIdx}`;
            _otherMatches.push({
              date:m.d||'',time:0,result:g.playerA===p.name&&g.winner==='A'?'승':g.playerB===p.name&&g.winner==='B'?'승':'패',
              opp,oppRace:oppP?.race||'',map:g.map||'-',matchId:gameId,mode:'대학CK',
              _dupKey:`mid:${gameId}`
            });
          }
        });
      });
    });
  }
  if(typeof proM!=='undefined'&&proM.length){
    proM.forEach(m=>{
      (m.sets||[]).forEach((s,setIdx)=>{
        (s.games||[]).forEach((g,gameIdx)=>{
          if((g.playerA===p.name||g.playerB===p.name)&&g.winner){
            const opp=g.playerA===p.name?g.playerB:g.playerA;
            const oppP=players.find(x=>x.name===opp);
            const gameId = g._id || `${m._id}_s${setIdx}_g${gameIdx}`;
            _otherMatches.push({
              date:m.d||'',time:0,result:g.playerA===p.name&&g.winner==='A'?'승':g.playerB===p.name&&g.winner==='B'?'승':'패',
              opp,oppRace:oppP?.race||'',map:g.map||'-',matchId:gameId,mode:'프로리그',
              _dupKey:`mid:${gameId}`
            });
          }
        });
      });
    });
  }
  if(typeof tourneys!=='undefined'&&tourneys.length){
    (tourneys.filter(t=>t.type==='tier')).forEach(tn=>{
      (tn.groups||[]).forEach(grp=>{
        (grp.matches||[]).forEach(m=>{
          (m.sets||[]).forEach(s=>{
            (s.games||[]).forEach(g=>{
              if((g.playerA===p.name||g.playerB===p.name)&&g.winner){
                const opp=g.playerA===p.name?g.playerB:g.playerA;
                const oppP=players.find(x=>x.name===opp);
                _otherMatches.push({
                  date:m.d||'',time:0,result:g.playerA===p.name&&g.winner==='A'?'승':g.playerB===p.name&&g.winner==='B'?'승':'패',
                  opp,oppRace:oppP?.race||'',map:g.map||'-',matchId:m._id||'',mode:'티어대회',
                  _dupKey:`${m.d||''}|${g.map||''}|${[g.playerA,g.playerB].sort().join('|')}`
                });
              }
            });
          });
        });
      });
      Object.values((tn.bracket||{}).matchDetails||{}).forEach(m=>{
        (m.sets||[]).forEach(s=>{
          (s.games||[]).forEach(g=>{
            if((g.playerA===p.name||g.playerB===p.name)&&g.winner){
              const opp=g.playerA===p.name?g.playerB:g.playerA;
              const oppP=players.find(x=>x.name===opp);
              _otherMatches.push({
                date:m.d||'',time:0,result:g.playerA===p.name&&g.winner==='A'?'승':g.playerB===p.name&&g.winner==='B'?'승':'패',
                opp,oppRace:oppP?.race||'',map:g.map||'-',matchId:m._id||'',mode:'티어대회',
                _dupKey:`${m.d||''}|${g.map||''}|${[g.playerA,g.playerB].sort().join('|')}`
              });
            }
          });
        });
      });
    });
  }

  // tourneys 조별리그/브라켓에서 직접 추출 (p.history 미반영분)
  const _tourMatches=[];
  (typeof tourneys!=='undefined'?tourneys:[]).forEach(tn=>{
    (tn.groups||[]).forEach(grp=>{
      (grp.matches||[]).forEach(m=>{
        if(!m._id||_existingMatchIds.has(m._id))return;
        (m.sets||[]).forEach(s=>{(s.games||[]).forEach(g=>{
          if(!g.playerA||!g.playerB||!g.winner)return;
          const wn=g.winner==='A'?g.playerA:g.playerB;
          const ln=g.winner==='A'?g.playerB:g.playerA;
          if(wn!==p.name&&ln!==p.name)return;
          const opp=wn===p.name?ln:wn;
          const oppP=players.find(x=>x.name===opp);
          _tourMatches.push({date:m.d||'',time:0,result:wn===p.name?'승':'패',opp,oppRace:oppP?.race||'',map:g.map||'-',matchId:m._id,mode:tn.type==='tier'?'티어대회':'조별리그',_readOnly:true});
        });});
      });
    });
    Object.values((tn.bracket||{}).matchDetails||{}).forEach(m=>{
      if(!m._id||_existingMatchIds.has(m._id))return;
      (m.sets||[]).forEach(s=>{(s.games||[]).forEach(g=>{
        if(!g.playerA||!g.playerB||!g.winner)return;
        const wn=g.winner==='A'?g.playerA:g.playerB;
        const ln=g.winner==='A'?g.playerB:g.playerA;
        if(wn!==p.name&&ln!==p.name)return;
        const opp=wn===p.name?ln:wn;
        const oppP=players.find(x=>x.name===opp);
        _tourMatches.push({date:m.d||'',time:0,result:wn===p.name?'승':'패',opp,oppRace:oppP?.race||'',map:g.map||'-',matchId:m._id,mode:tn.type==='tier'?'티어대회':'대회',_readOnly:true});
      });});
    });
  });
  // indM/gjM/otherMatches/tourMatches 추가 (중복 제거)
  const _extraMatches=[..._indMatches,..._gjMatches,..._otherMatches,..._tourMatches].filter(h=>!h.matchId||!_existingMatchIds.has(h.matchId)||!_existingKeys.has(_histDupKey(h)));
  const _histAll=[..._dedupedHistory,..._extraMatches].sort((a,b)=>((b.date||'')+'').localeCompare((a.date||'')+'')||((b.time||0)-(a.time||0)));
  // 연도 필터링 (단일 또는 멀티)
  const _hist=_year?_histAll.filter(h=>{
    const y=(h.date||'').slice(0,4);
    if(window._playerModalYears&&window._playerModalYears.length>0) return window._playerModalYears.includes(y);
    return y.startsWith(_year);
  }):_histAll;
  // 소스별 필터 (mode 기반 - 단일 또는 멀티)
  if(window._playerHistFilter===undefined)window._playerHistFilter=null;
  const _modeHist=(window._playerHistFilters&&window._playerHistFilters.length>0)
    ?_hist.filter(hh=>window._playerHistFilters.includes(hh.mode))
    :(window._playerHistFilter?_hist.filter(hh=>hh.mode===window._playerHistFilter):_hist);
  const _availYears=[...new Set(_histAll.map(h=>(h.date||'').slice(0,4)).filter(y=>y.length===4))].sort().reverse();
  const opps={},rv={T:{w:0,l:0},Z:{w:0,l:0},P:{w:0,l:0},N:{w:0,l:0}};
  _modeHist.forEach(h=>{
    if(!opps[h.opp])opps[h.opp]={w:0,l:0,race:h.oppRace};
    if(h.result==='승'){opps[h.opp].w++;if(rv[h.oppRace])rv[h.oppRace].w++;}
    else{opps[h.opp].l++;if(rv[h.oppRace])rv[h.oppRace].l++;}
  });
  const tot=p.win+p.loss;const wr=tot?Math.round(p.win/tot*100):0;
  const eloVal=p.elo||ELO_DEFAULT;
  const eloColor=eloVal>=1400?'#7c3aed':eloVal>=1300?'#d97706':eloVal>=1200?'#16a34a':'#dc2626';

  // ── 상단 프로필 카드 (이름영역=대학색, 통계영역=연한 대학색) ──
  const _photoHTML=(()=>{
    if(p.photo){
      const raceL=p.race||'?';
      const imageFit = localStorage.getItem('su_b2ImageFill') === '0' ? 'cover' : 'contain';
      const _imgSettings=JSON.parse(localStorage.getItem('su_img_settings')||'{}');
      const _imgScale=(_isMobile?(_imgSettings.scaleLeft||1):(_imgSettings.scaleRight||1));
      const _imgBrightness=_imgSettings.brightness||1;
      return `<span style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:28px;font-weight:900;color:rgba(255,255,255,.65)">${raceL}</span><img src="${p.photo}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:${imageFit};object-position:center;transform:scale(${_imgScale});filter:brightness(${_imgBrightness})" onerror="this.style.display='none'">`;
    }
    const url=UNIV_ICONS[p.univ]||(univCfg.find(x=>x.name===p.univ)||{}).icon||'';
    return url
      ? `<img src="${url}" style="width:42px;height:42px;object-fit:contain;filter:brightness(0) invert(1) opacity(0.9)" onerror="this.outerHTML='<svg xmlns=\\'http://www.w3.org/2000/svg\\' viewBox=\\'0 0 24 24\\' fill=\\'white\\' width=\\'32\\' height=\\'32\\'><path d=\\'M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z\\'/></svg>'">`
      : `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white' width='32' height='32'><path d='M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z'/></svg>`;
  })();
  const _channelHTML=(()=>{
    if(!p.channelUrl) return '';
    const url=p.channelUrl;
    let icon='🏠', label='방송';
    if(url.includes('chzzk.naver.com')){icon='<img src="https://ssl.pstatic.net/static/nng/glive/icon/favicon.png" style="width:13px;height:13px;border-radius:3px" onerror="this.outerHTML=\'🎮\'">';label='치지직';}
    else if(url.includes('afreecatv.com')){icon='<img src="https://res.afreecatv.com/images/aflogo.png" style="width:13px;height:13px;border-radius:3px" onerror="this.outerHTML=\'📺\'">';label='아프리카';}
    else if(url.includes('youtube.com')||url.includes('youtu.be')){icon='<img src="https://www.youtube.com/favicon.ico" style="width:13px;height:13px;border-radius:3px" onerror="this.outerHTML=\'▶️\'">';label='유튜브';}
    else if(url.includes('twitch.tv')){icon='<img src="https://static.twitchcdn.net/assets/favicon-32-e29e246c157142c1a5e8.png" style="width:13px;height:13px;border-radius:3px" onerror="this.outerHTML=\'📡\'">';label='트위치';}
    return `<a href="${url}" target="_blank" style="display:inline-flex;align-items:center;gap:4px;padding:3px 9px;border-radius:20px;background:rgba(255,255,255,.22);border:1.5px solid rgba(255,255,255,.38);text-decoration:none;font-size:11px;font-weight:700;color:#fff;flex-shrink:0">${icon} ${label}</a>`;
  })();
  const _eloSparkHTML=(()=>{
    const deltas=_histAll.filter(h=>h.eloDelta!=null).slice(-12);
    if(deltas.length<2) return '';
    let cur=eloVal;
    [...deltas].reverse().forEach(h=>{cur-=h.eloDelta;});
    let val=cur; const elos=[val];
    deltas.forEach(h=>{val+=h.eloDelta;elos.push(val);});
    const mn=Math.min(...elos),mx=Math.max(...elos),rng=mx-mn||1;
    const SW=60,SH=20;
    const coords=elos.map((e,i)=>`${Math.round(i/(elos.length-1)*SW)},${Math.round(SH-((e-mn)/rng)*SH)}`);
    const lc=elos[elos.length-1]>=elos[elos.length-2]?_winC:_lossC;
    return `<svg viewBox="0 0 ${SW} ${SH}" width="${SW}" height="${SH}" style="display:block;margin:3px auto 0;overflow:visible"><polyline points="${coords.join(' ')}" fill="none" stroke="${lc}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  })();

  let h=`<div style="background:var(--white);border:1.5px solid var(--border2);border-radius:18px;margin-bottom:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.08)">
    <div style="background:${_hdrBg};padding:18px 18px 16px;position:relative;overflow:hidden">
      <div style="position:absolute;top:-25px;right:-25px;width:110px;height:110px;border-radius:50%;background:rgba(255,255,255,.09);pointer-events:none"></div>
      <div style="position:absolute;bottom:-40px;left:5px;width:80px;height:80px;border-radius:50%;background:rgba(255,255,255,.06);pointer-events:none"></div>
      <div style="display:flex;align-items:center;gap:14px;flex-wrap:wrap;position:relative">
        <div style="width:76px;height:76px;border-radius:16px;background:rgba(255,255,255,.2);border:2.5px solid rgba(255,255,255,.45);display:flex;align-items:center;justify-content:center;flex-shrink:0;overflow:hidden;position:relative;box-shadow:0 3px 14px rgba(0,0,0,.2)">${_photoHTML}</div>
        <div style="flex:1;min-width:0">
          <div style="display:flex;align-items:center;gap:7px;flex-wrap:wrap;margin-bottom:6px">
            <span style="font-size:20px;font-weight:900;color:#fff;text-shadow:0 1px 5px rgba(0,0,0,.2)">${p.name}${genderIcon(p.gender)}</span>
            ${p.role?getRoleBadgeHTML(p.role,'11px'):''}
            ${p.tier?`<span style="background:rgba(255,255,255,.22);border:1.5px solid rgba(255,255,255,.38);border-radius:6px;padding:2px 9px;font-size:11px;font-weight:800;color:#fff">${getTierLabel(p.tier)||p.tier}</span>`:''}
          </div>
          <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">
            <span class="ubadge${p.univ&&p.univ!=='무소속'?' clickable-univ':''}" data-icon-done="1"
              style="background:rgba(255,255,255,.22);color:#fff;border:1.5px solid rgba(255,255,255,.38);font-size:11px;padding:3px 10px;display:inline-flex;align-items:center;gap:4px;border-radius:20px;font-weight:700${p.univ&&p.univ!=='무소속'?';cursor:pointer':''}"
              ${p.univ&&p.univ!=='무소속'?`onclick="cm('playerModal');setTimeout(()=>openUnivModal('${p.univ}'),100)"`:''}>${gUI(p.univ,'12px')}${p.univ||'무소속'}</span>
            <span style="background:rgba(255,255,255,.22);border:1px solid rgba(255,255,255,.35);border-radius:20px;padding:3px 9px;font-size:11px;font-weight:700;color:#fff">${p.race||''} ${RNAME[p.race]||''}</span>
            ${_channelHTML}
          </div>
        </div>
      </div>
    </div>
    <div style="background:${col}${_p2h(_statsTint)};display:grid;grid-template-columns:repeat(4,1fr)">
      <div style="text-align:center;padding:14px 6px;border-right:1px solid ${col}30">
        <div style="font-size:9px;font-weight:800;color:var(--text3);letter-spacing:.6px;margin-bottom:5px">전적</div>
        <div style="font-weight:900;font-size:14px"><span style="color:${_cWin}">${p.win}W</span> <span style="color:${_cLoss}">${p.loss}L</span></div>
      </div>
      <div style="text-align:center;padding:14px 6px;border-right:1px solid ${col}30">
        <div style="font-size:9px;font-weight:800;color:var(--text3);letter-spacing:.6px;margin-bottom:5px">승률</div>
        <div style="font-weight:900;font-size:22px;line-height:1;color:${tot?(wr>=50?_cWin:_cLoss):'var(--gray-l)'}">${tot?wr+'%':'-'}</div>
      </div>
      <div style="text-align:center;padding:14px 6px;border-right:1px solid ${col}30">
        <div style="font-size:9px;font-weight:800;color:var(--text3);letter-spacing:.6px;margin-bottom:5px">포인트</div>
        <div style="font-weight:900;font-size:20px;line-height:1;color:${(p.points||0)>=0?_cWin:_cLoss}">${pS(p.points)}</div>
      </div>
      <div style="text-align:center;padding:14px 6px">
        <div style="font-size:9px;font-weight:800;color:var(--text3);letter-spacing:.6px;margin-bottom:5px">ELO</div>
        <div style="font-weight:900;font-size:20px;line-height:1;color:${eloColor}">${eloVal}</div>
        ${_eloSparkHTML}
      </div>
    </div>
  </div>`;

  // ── 연승/연패 + 랭킹 위치 + 최근 폼 ──
  {
    // 연승/연패 계산
    const hist = _histAll.slice();
    let streak = 0, streakType = '';
    for(const h of hist) {
      if(streak===0){ streak=1; streakType=h.result; }
      else if(h.result===streakType) streak++;
      else break;
    }
    const _isWinStreak = streakType==='승';
    const streakBg = _isWinStreak ? '#dcfce7' : '#fee2e2';
    const streakCol = _isWinStreak ? '#16a34a' : '#dc2626';
    const streakBd = _isWinStreak ? '#bbf7d0' : '#fecaca';
    const streakEmoji = _isWinStreak ? '🔥' : '❄️';
    const streakHTML = streak>=2
      ? `<span style="font-size:11px;font-weight:800;padding:3px 10px;border-radius:20px;background:${streakBg};color:${streakCol};border:1px solid ${streakBd}">${streakEmoji} ${streak}연${streakType}</span>`
      : '';

    // 랭킹 위치
    const allRanked=[...players].filter(q=>!q.retired).sort((a,b)=>(b.points||0)-(a.points||0)||(b.win||0)-(a.win||0));
    const myRank = allRanked.findIndex(q=>q.name===p.name)+1;
    const rankChange = typeof getRankChangeBadge==='function' ? getRankChangeBadge(p.name, myRank) : '';
    const rankHTML = myRank ? `<span style="font-size:11px;font-weight:800;color:var(--text3)">🏅 전체 ${myRank}위</span> ${rankChange}` : '';

    // 최근 10경기 폼
    const recent10 = hist.slice(0,10);
    const formHTML = recent10.length>=3 ? `<div style="display:flex;gap:2px;align-items:center">
      ${recent10.map(h=>`<span style="width:14px;height:14px;border-radius:50%;background:${h.result==='승'?'#16a34a':'#dc2626'};display:inline-block;flex-shrink:0" title="${h.result} vs ${h.opp||''}"></span>`).join('')}
      <span style="font-size:10px;color:var(--gray-l);margin-left:3px">최근${recent10.length}</span>
    </div>` : '';

    if(streakHTML||rankHTML||formHTML){
      h+=`<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:8px 12px;margin-bottom:14px">
        ${rankHTML}
        ${streakHTML}
        ${formHTML}
      </div>`;
    }
  }

  // ── 소스별 필터 드롭다운 ──
  const allModes=[...new Set(_histAll.map(h=>h.mode||'').filter(Boolean))].sort();
  // 멀티 선택 지원을 위한 배열 초기화
  if(!window._playerHistFilters) window._playerHistFilters=[];
  if(!window._playerHistFilter) window._playerHistFilter='';
  const filterBar=allModes.length>1?`<div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:8px">
    <span style="font-size:11px;font-weight:700;color:var(--text3);flex-shrink:0">📂 종목</span>
    ${isLoggedIn?`<div style="display:flex;gap:4px;flex-wrap:wrap">
      <label class="mode-filter-chip ${window._playerHistFilters.length===0?'active':''}" style="display:flex;align-items:center;gap:4px;font-size:11px;font-weight:700;padding:4px 10px;border-radius:12px;border:1px solid var(--border2);background:${window._playerHistFilters.length===0?'var(--blue)':'var(--surface)'};color:${window._playerHistFilters.length===0?'#fff':'var(--text3)'};cursor:pointer;transition:all 0.15s" onclick="const cb=this.querySelector('input');cb.checked=!cb.checked;if(cb.checked){window._playerHistFilters=[];window._playerHistFilter='';}else{window._playerHistFilters=allModes.map(m=>m);window._playerHistFilter='multi';}window._oppPage=0;playerHistPage=0;window._rebuildPlayerDetail('${escJS(p.name)}')">
        <input type="checkbox" ${window._playerHistFilters.length===0?'checked':''} style="cursor:pointer;pointer-events:none">전체
      </label>
      ${allModes.map(m=>`<label class="mode-filter-chip ${window._playerHistFilters.includes(m)?'active':''}" style="display:flex;align-items:center;gap:4px;font-size:11px;font-weight:700;padding:4px 10px;border-radius:12px;border:1px solid var(--border2);background:${window._playerHistFilters.includes(m)?'var(--blue)':'var(--surface)'};color:${window._playerHistFilters.includes(m)?'#fff':'var(--text3)'};cursor:pointer;transition:all 0.15s" onclick="const cb=this.querySelector('input');cb.checked=!cb.checked;const arr=window._playerHistFilters||[];if(cb.checked){if(!arr.includes('${m}'))arr.push('${m}');}else{const idx=arr.indexOf('${m}');if(idx>-1)arr.splice(idx,1);}window._playerHistFilters=arr;window._playerHistFilter=arr.length===1?arr[0]:(arr.length>1?'multi':'');window._oppPage=0;playerHistPage=0;window._rebuildPlayerDetail('${escJS(p.name)}')">
        <input type="checkbox" value="${m}" ${window._playerHistFilters.includes(m)?'checked':''} style="cursor:pointer;pointer-events:none">${m}
      </label>`).join('')}
    </div>`:`<select onchange="window._playerHistFilter=this.value||null;window._playerHistFilters=[];window._oppPage=0;playerHistPage=0;window._rebuildPlayerDetail('${escJS(p.name)}')"
      style="padding:4px 10px;border:1.5px solid ${window._playerHistFilter?'var(--blue)':'var(--border2)'};border-radius:8px;font-size:12px;font-weight:700;background:${window._playerHistFilter?'#eff6ff':'var(--white)'};color:${window._playerHistFilter?'var(--blue)':'var(--text)'}">
      <option value="" ${!window._playerHistFilter?'selected':''}>전체</option>
      ${allModes.map(m=>`<option value="${m}" ${window._playerHistFilter===m?'selected':''}>${m}</option>`).join('')}
    </select>`}
  </div>`:'';
  h+=filterBar;

  // ── 연도 필터 드롭다운 ──
  if(_availYears.length>0){
    const _pSafeY=escJS(p.name);
    // 멀티 선택 지원을 위한 배열 초기화
    if(!window._playerModalYears) window._playerModalYears=[];
    if(!window._playerModalYear) window._playerModalYear='';
    const _yWin=_modeHist.filter(h=>h.result==='승').length;
    const _yLoss=_modeHist.filter(h=>h.result==='패').length;
    const _yTot=_yWin+_yLoss;
    const _yWr=_yTot?Math.round(_yWin/_yTot*100):0;
    h+=`<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:14px;padding:8px 12px;background:var(--surface);border:1px solid var(--border);border-radius:10px">
      <span style="font-size:11px;font-weight:700;color:var(--text3);flex-shrink:0">📅 연도</span>
      ${isLoggedIn?`<div style="display:flex;gap:4px;flex-wrap:wrap">
        <label class="year-filter-chip ${window._playerModalYears.length===0?'active':''}" style="display:flex;align-items:center;gap:4px;font-size:11px;font-weight:700;padding:4px 10px;border-radius:12px;border:1px solid var(--border2);background:${window._playerModalYears.length===0?'var(--blue)':'var(--surface)'};color:${window._playerModalYears.length===0?'#fff':'var(--text3)'};cursor:pointer;transition:all 0.15s" onclick="const cb=this.querySelector('input');cb.checked=!cb.checked;if(cb.checked){window._playerModalYears=[];window._playerModalYear='';}else{window._playerModalYears=_availYears.map(y=>y);window._playerModalYear='multi';}window._oppPage=0;playerHistPage=0;window._rebuildPlayerDetail('${_pSafeY}');setTimeout(()=>initPEloChart('${_pSafeY}',window._playerModalYear),60)">
          <input type="checkbox" ${window._playerModalYears.length===0?'checked':''} style="cursor:pointer;pointer-events:none">전체
        </label>
        ${_availYears.map(y=>`<label class="year-filter-chip ${window._playerModalYears.includes(y)?'active':''}" style="display:flex;align-items:center;gap:4px;font-size:11px;font-weight:700;padding:4px 10px;border-radius:12px;border:1px solid var(--border2);background:${window._playerModalYears.includes(y)?'var(--blue)':'var(--surface)'};color:${window._playerModalYears.includes(y)?'#fff':'var(--text3)'};cursor:pointer;transition:all 0.15s" onclick="const cb=this.querySelector('input');cb.checked=!cb.checked;const arr=window._playerModalYears||[];if(cb.checked){if(!arr.includes('${y}'))arr.push('${y}');}else{const idx=arr.indexOf('${y}');if(idx>-1)arr.splice(idx,1);}window._playerModalYears=arr;window._playerModalYear=arr.length===1?arr[0]:(arr.length>1?'multi':'');window._oppPage=0;playerHistPage=0;window._rebuildPlayerDetail('${_pSafeY}');setTimeout(()=>initPEloChart('${_pSafeY}',window._playerModalYear),60)">
          <input type="checkbox" value="${y}" ${window._playerModalYears.includes(y)?'checked':''} style="cursor:pointer;pointer-events:none">${y}년
        </label>`).join('')}
      </div>`:`<select onchange="window._playerModalYear=this.value;window._playerModalYears=[];window._oppPage=0;playerHistPage=0;window._rebuildPlayerDetail('${_pSafeY}');setTimeout(()=>initPEloChart('${_pSafeY}',window._playerModalYear),60)"
        style="padding:4px 10px;border:1.5px solid ${_year?'var(--blue)':'var(--border2)'};border-radius:8px;font-size:12px;font-weight:700;background:${_year?'#eff6ff':'var(--white)'};color:${_year?'var(--blue)':'var(--text)'}">
        <option value="" ${!_year?'selected':''}>전체</option>
        ${_availYears.map(y=>`<option value="${y}" ${_year===y?'selected':''}>${y}년</option>`).join('')}
      </select>`}
      ${_year&&_yTot?`<span style="font-size:11px;font-weight:700;color:var(--text2)">${_yWin}승 ${_yLoss}패 <span style="color:${_yWr>=50?'#16a34a':'#dc2626'}">${_yWr}%</span> (${_yTot}경기)</span>`:''}
      ${_year?`<button onclick="window._playerModalYear='';window._playerModalYears=[];window._oppPage=0;playerHistPage=0;window._rebuildPlayerDetail('${_pSafeY}');setTimeout(()=>initPEloChart('${_pSafeY}',''),60)" style="margin-left:auto;padding:3px 9px;border-radius:6px;border:1px solid var(--border2);background:var(--white);font-size:11px;cursor:pointer;font-weight:600;color:var(--text3)">✕ 초기화</button>`:''}
    </div>`;
  }

  // ── ELO 추이 차트 (년도 필터 적용) ──
  const _eloChartPts=_modeHist.filter(h=>h.eloDelta!=null||h.eloAfter!=null);
  if(_eloChartPts.length>=3){
    h+=`<div style="background:var(--white);border:1.5px solid var(--border2);border-radius:14px;padding:14px 16px;margin-bottom:14px">
      <div style="font-weight:700;font-size:12px;color:var(--text2);margin-bottom:10px;display:flex;align-items:center;gap:6px">
        <span style="display:inline-block;width:3px;height:14px;background:#7c3aed;border-radius:2px"></span>
        ELO 변화 추이${_year?` (${_year}년)`:''}
        <span style="font-size:10px;color:var(--gray-l);font-weight:400;margin-left:4px">${_eloChartPts.length}경기</span>
        <span style="font-size:10px;font-weight:700;margin-left:auto;color:${eloColor}">${eloVal}</span>
      </div>
      <div style="position:relative">
        <canvas id="pEloChart" style="width:100%;height:140px;display:block"></canvas>
        <div id="pEloTip" style="position:absolute;display:none;background:rgba(15,23,42,.92);color:#fff;font-size:10px;padding:6px 9px;border-radius:8px;pointer-events:none;white-space:nowrap;z-index:10;box-shadow:0 4px 12px rgba(0,0,0,.3)"></div>
      </div>
    </div>`;
  }



  // ── 모드별 전적 ──
  const _modeColors={'미니대전':'#7c3aed','대학대전':'#2563eb','대학CK':'#dc2626','끝장전':'#8b5cf6','개인전':'#0891b2','티어대회':'#f59e0b','대회':'#d97706','프로리그':'#16a34a'};
  const _histModeStats={};
  _modeHist.forEach(hh=>{if(hh.mode){if(!_histModeStats[hh.mode])_histModeStats[hh.mode]={w:0,l:0};if(hh.result==='승')_histModeStats[hh.mode].w++;else _histModeStats[hh.mode].l++;}});
  // 대회: 조별리그+토너먼트+대회 통합 (p.history + tourneys 직접 집계)
  let _compW=(_histModeStats['대회']?.w||0)+(_histModeStats['조별리그']?.w||0)+(_histModeStats['토너먼트']?.w||0);
  let _compL=(_histModeStats['대회']?.l||0)+(_histModeStats['조별리그']?.l||0)+(_histModeStats['토너먼트']?.l||0);
  // tourneys에만 있고 p.history에 없는 기록도 집계
  const _histMatchIds=new Set(_histAll.map(h=>h.matchId).filter(Boolean));
  function _cGame(g,matchId){if(!g.playerA||!g.playerB||!g.winner)return;if(_histMatchIds.has(matchId))return;const wn=g.winner==='A'?g.playerA:g.playerB;const ln=g.winner==='A'?g.playerB:g.playerA;if(wn===p.name)_compW++;else if(ln===p.name)_compL++;}
  (tourneys||[]).forEach(tn=>{
    (tn.groups||[]).forEach(grp=>{(grp.matches||[]).forEach(m=>{(m.sets||[]).forEach(s=>{(s.games||[]).forEach(g=>_cGame(g,m._id||''));});});});
    Object.values((tn.bracket||{}).matchDetails||{}).forEach(m=>{(m.sets||[]).forEach(s=>{(s.games||[]).forEach(g=>_cGame(g,m._id||''));});});
  });
  // 끝장전: gjM에서 직접 집계
  const _gjW=(gjM||[]).filter(g=>g.wName===p.name&&(!_year||(g.d||'').startsWith(_year))).length;
  const _gjL=(gjM||[]).filter(g=>g.lName===p.name&&(!_year||(g.d||'').startsWith(_year))).length;
  const _fixedModes=[
    {key:'미니대전',w:_histModeStats['미니대전']?.w||0,l:_histModeStats['미니대전']?.l||0},
    {key:'대학대전',w:_histModeStats['대학대전']?.w||0,l:_histModeStats['대학대전']?.l||0},
    {key:'대학CK',w:_histModeStats['대학CK']?.w||0,l:_histModeStats['대학CK']?.l||0},
    {key:'끝장전',w:_gjW,l:_gjL},
    {key:'개인전',w:_histModeStats['개인전']?.w||0,l:_histModeStats['개인전']?.l||0},
    {key:'티어대회',w:_histModeStats['티어대회']?.w||0,l:_histModeStats['티어대회']?.l||0},
    {key:'대회',w:_compW,l:_compL},
    {key:'프로리그',w:_histModeStats['프로리그']?.w||0,l:_histModeStats['프로리그']?.l||0},
  ];
  h+=`<div style="margin-bottom:14px">
    <div style="font-weight:700;font-size:12px;color:var(--text2);margin-bottom:8px;display:flex;align-items:center;gap:6px">
      <span style="display:inline-block;width:3px;height:14px;background:#6b7280;border-radius:2px"></span>
      모드별 전적
    </div>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px">`;
  _fixedModes.forEach(({key,w,l})=>{
    const t=w+l;const wr=t?Math.round(w/t*100):0;
    const mc=_modeColors[key]||'#6b7280';
    const wrCol=t?(wr>=50?_cWin:_cLoss):'#9ca3af';
    h+=`<div style="background:${mc}${_p2h(_modeTint)};border:1.5px solid ${mc}${_p2h(Math.min(99,_modeTint*3.5))};border-radius:10px;padding:8px 6px;text-align:center">
      <div style="font-size:10px;color:${mc};font-weight:800;margin-bottom:5px;letter-spacing:.2px">${key}</div>
      <div style="font-size:12px;font-weight:700;margin-bottom:2px"><span style="color:${_cWin}">${w}승</span> <span style="color:${_cLoss}">${l}패</span></div>
      <div style="font-size:13px;font-weight:900;color:${wrCol}">${t?wr+'%':'-'}</div>
    </div>`;
  });
  h+=`</div></div>`;

  // ── 상대 전적 ──
  {
    if(!window._oppSort) window._oppSort='tot';
    const oppList=Object.entries(opps);
    if(oppList.length){
      const _pSafeOpp=escJS(p.name);
      const _rebuildOpp=`window._rebuildPlayerDetail('${_pSafeOpp}')`;
      if(window._oppSort==='wr') oppList.sort((a,b)=>{const ta=a[1].w+a[1].l,tb=b[1].w+b[1].l;const wa=ta?a[1].w/ta:0,wb=tb?b[1].w/tb:0;return wb-wa;});
      else if(window._oppSort==='w') oppList.sort((a,b)=>b[1].w-a[1].w||a[1].l-b[1].l);
      else oppList.sort((a,b)=>(b[1].w+b[1].l)-(a[1].w+a[1].l));
      if(!window._oppPage) window._oppPage=0;
      const _oppPageSize=10;
      const _oppTotalPages=Math.ceil(oppList.length/_oppPageSize)||1;
      const _oppCurPage=Math.max(0,Math.min(window._oppPage,_oppTotalPages-1));
      const _oppDisplay=oppList.slice(_oppCurPage*_oppPageSize,(_oppCurPage+1)*_oppPageSize);
      const _oppResetSort=`window._oppPage=0;`;
      h+=`<div style="margin-bottom:14px">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;flex-wrap:wrap">
          <div style="font-weight:700;font-size:12px;color:var(--text2);display:flex;align-items:center;gap:6px">
            <span style="display:inline-block;width:3px;height:14px;background:var(--blue);border-radius:2px"></span>
            상대 전적 <span style="font-size:11px;color:var(--gray-l);font-weight:400">(${oppList.length}명)</span>
          </div>
          <div style="margin-left:auto;display:flex;gap:4px">
            <button onclick="${_oppResetSort}window._oppSort='tot';${_rebuildOpp}" style="padding:2px 8px;border-radius:8px;border:1px solid ${window._oppSort==='tot'?'var(--blue)':'var(--border2)'};background:${window._oppSort==='tot'?'var(--blue)':'var(--white)'};color:${window._oppSort==='tot'?'#fff':'var(--text3)'};font-size:10px;font-weight:700;cursor:pointer">다전순</button>
            <button onclick="${_oppResetSort}window._oppSort='w';${_rebuildOpp}" style="padding:2px 8px;border-radius:8px;border:1px solid ${window._oppSort==='w'?'var(--blue)':'var(--border2)'};background:${window._oppSort==='w'?'var(--blue)':'var(--white)'};color:${window._oppSort==='w'?'#fff':'var(--text3)'};font-size:10px;font-weight:700;cursor:pointer">승리순</button>
            <button onclick="${_oppResetSort}window._oppSort='wr';${_rebuildOpp}" style="padding:2px 8px;border-radius:8px;border:1px solid ${window._oppSort==='wr'?'var(--blue)':'var(--border2)'};background:${window._oppSort==='wr'?'var(--blue)':'var(--white)'};color:${window._oppSort==='wr'?'#fff':'var(--text3)'};font-size:10px;font-weight:700;cursor:pointer">승률순</button>
          </div>
        </div>
        <div style="border:1px solid var(--border);border-radius:10px;overflow:hidden">
          <table style="margin:0;border:none;border-radius:0">
            <thead><tr>
              <th style="text-align:left;padding:7px 12px">선수</th>
              <th style="text-align:center;width:40px">종족</th>
              <th style="text-align:center;width:80px">대학</th>
              <th style="text-align:center;width:36px">승</th>
              <th style="text-align:center;width:36px">패</th>
              <th style="text-align:center;width:52px">승률</th>
            </tr></thead>
            <tbody>
              ${_oppDisplay.map(([opp,s])=>{
                const ot=s.w+s.l;const ow=ot?Math.round(s.w/ot*100):0;
                const op=players.find(x=>x.name===opp);
                const oc=gc(op?.univ||'');
                const oppSafe=opp.replace(/'/g,"\'");
                return `<tr style="cursor:pointer;transition:.1s" onclick="cm('playerModal');setTimeout(()=>openPlayerModal('${oppSafe}'),100)" onmouseover="this.style.background='${oc}12'" onmouseout="this.style.background=''">
                  <td style="padding:6px 12px">
                    <div style="display:flex;align-items:center;gap:7px">
                      ${getPlayerPhotoHTML(opp,'36px')}
                      <span style="font-weight:700;font-size:13px">${opp}</span>
                    </div>
                  </td>
                  <td style="text-align:center"><span class="rbadge r${s.race||op?.race||'?'}" style="font-size:10px">${s.race||op?.race||'?'}</span></td>
                  <td style="text-align:center"><span style="background:${oc};color:#fff;padding:1px 7px;border-radius:4px;font-size:10px;font-weight:700;white-space:nowrap">${op?.univ||'-'}</span></td>
                  <td style="text-align:center;font-weight:700;color:#16a34a">${s.w}</td>
                  <td style="text-align:center;font-weight:700;color:#dc2626">${s.l}</td>
                  <td style="text-align:center;font-weight:800;font-size:12px;color:${ot?(ow>=50?'#16a34a':'#dc2626'):'var(--gray-l)'}">${ot?ow+'%':'-'}</td>
                </tr>`;
              }).join('')}
            </tbody>
          </table>
          ${_oppTotalPages>1?`<div style="display:flex;align-items:center;justify-content:center;gap:8px;padding:8px 12px;background:var(--surface);border-top:1px solid var(--border)">
            <button class="btn btn-w btn-xs" ${_oppCurPage===0?'disabled':''} onclick="window._goPlayerOppPage(${_oppCurPage-1},'${escJS(p.name)}')">◀ 이전</button>
            <span style="font-size:12px;color:var(--gray-l)">${_oppCurPage+1} / ${_oppTotalPages} 페이지</span>
            <button class="btn btn-w btn-xs" ${_oppCurPage>=_oppTotalPages-1?'disabled':''} onclick="window._goPlayerOppPage(${_oppCurPage+1},'${escJS(p.name)}')">다음 ▶</button>
          </div>`:''}
        </div>
      </div>`;
    }
  }

  // ── 최근 기록 ──
  if(_modeHist.length){
    // 시즌 필터 UI
    let seasonBar='';
    if(typeof seasons!=='undefined' && seasons && seasons.length){
      const _rbFn=`window._rebuildPlayerDetail('${escJS(p.name)}')`;
      // 멀티 선택 지원을 위한 배열 초기화
      if(!window._playerSeasonFilters) window._playerSeasonFilters=[];
      if(!window._playerSeasonFilter) window._playerSeasonFilter='전체';
      seasonBar=`<div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:8px;align-items:center">
        <span style="font-size:10px;color:var(--gray-l);font-weight:700">시즌</span>
        ${isLoggedIn?`<div style="display:flex;gap:4px;flex-wrap:wrap">
          <label class="season-filter-chip ${window._playerSeasonFilters.length===0?'active':''}" style="display:flex;align-items:center;gap:4px;font-size:10px;font-weight:700;padding:3px 8px;border-radius:10px;border:1px solid var(--border2);background:${window._playerSeasonFilters.length===0?'var(--blue)':'var(--surface)'};color:${window._playerSeasonFilters.length===0?'#fff':'var(--text3)'};cursor:pointer;transition:all 0.15s" onclick="const cb=this.querySelector('input');cb.checked=!cb.checked;if(cb.checked){window._playerSeasonFilters=[];window._playerSeasonFilter='전체';}else{window._playerSeasonFilters=seasons.map(s=>s.id);window._playerSeasonFilter='multi';}playerHistPage=0;${_rbFn}">
            <input type="checkbox" ${window._playerSeasonFilters.length===0?'checked':''} style="cursor:pointer;pointer-events:none">전체
          </label>
          ${seasons.map(s=>{
            const isOn=window._playerSeasonFilters.includes(s.id);
            const _sid=escJS(s.id);
            return `<label class="season-filter-chip ${isOn?'active':''}" style="display:flex;align-items:center;gap:4px;font-size:10px;font-weight:700;padding:3px 8px;border-radius:10px;border:1px solid var(--border2);background:${isOn?'var(--blue)':'var(--surface)'};color:${isOn?'#fff':'var(--text3)'};cursor:pointer;transition:all 0.15s" onclick="const cb=this.querySelector('input');cb.checked=!cb.checked;const arr=window._playerSeasonFilters||[];if(cb.checked){if(!arr.includes('${s.id}'))arr.push('${s.id}');}else{const idx=arr.indexOf('${s.id}');if(idx>-1)arr.splice(idx,1);}window._playerSeasonFilters=arr;window._playerSeasonFilter=arr.length===1?arr[0]:(arr.length>1?'multi':'전체');playerHistPage=0;${_rbFn}">
              <input type="checkbox" value="${s.id}" ${isOn?'checked':''} style="cursor:pointer;pointer-events:none">${s.name}
            </label>`;
          }).join('')}
        </div>`:`<button onclick="window._playerSeasonFilter='전체';window._playerSeasonFilters=[];playerHistPage=0;${_rbFn}" style="padding:2px 8px;border-radius:10px;border:1px solid ${window._playerSeasonFilter==='전체'?'var(--blue)':'var(--border2)'};background:${window._playerSeasonFilter==='전체'?'var(--blue)':'var(--white)'};color:${window._playerSeasonFilter==='전체'?'#fff':'var(--text3)'};font-size:10px;font-weight:700;cursor:pointer">전체</button>
        ${seasons.map(s=>{
          const isOn=window._playerSeasonFilter===s.id;
          const _sid=escJS(s.id);
          return `<button onclick="window._playerSeasonFilter='${_sid}';window._playerSeasonFilters=[];playerHistPage=0;${_rbFn}" style="padding:2px 8px;border-radius:10px;border:1px solid ${isOn?'var(--blue)':'var(--border2)'};background:${isOn?'var(--blue)':'var(--white)'};color:${isOn?'#fff':'var(--text3)'};font-size:10px;font-weight:700;cursor:pointer">${s.name}</button>`;
        }).join('')}`}
      </div>`;
    }

    const _curSeason=(()=>{
      if(!window._playerSeasonFilter||window._playerSeasonFilter==='전체') return null;
      return (typeof seasons!=='undefined'?seasons:[]).find(s=>s.id===window._playerSeasonFilter)||null;
    })();
    const _curSeasons=(window._playerSeasonFilters&&window._playerSeasonFilters.length>0)
      ?(typeof seasons!=='undefined'?seasons:[]).filter(s=>window._playerSeasonFilters.includes(s.id))
      :(_curSeason?[_curSeason]:[]);
    const filteredHist = _curSeasons.length>0
      ? _modeHist.filter(hh=>{
          const d=hh.date||'';
          return _curSeasons.some(season=>d>=(season.start||'') && d<=(season.end||'9999-99-99'));
        })
      : _modeHist;
    const totalGames=filteredHist.length;
    const pageSize=HIST_PAGE_SIZE||20;
    const totalPages=Math.ceil(totalGames/pageSize)||1;
    if(typeof playerHistPage!=='number' || isNaN(playerHistPage)) playerHistPage=0;
    const curPage=Math.max(0,Math.min(playerHistPage,totalPages-1));
    // 날짜 최신순 정렬 (원본 인덱스 보존)
    const sortedHist=[...filteredHist.map((h,i)=>({...h,_origIdx:p.history.indexOf(h)}))]
      .sort((a,b)=>(b.date||'').localeCompare(a.date||'')||(b.time||0)-(a.time||0));
    const displayHist=sortedHist.slice(curPage*pageSize,(curPage+1)*pageSize);
    const fromN=curPage*pageSize+1, toN=Math.min((curPage+1)*pageSize,totalGames);
    h+=`<div style="font-weight:700;font-size:12px;color:var(--text2);margin-bottom:6px;display:flex;align-items:center;gap:6px"><span style="display:inline-block;width:3px;height:14px;background:var(--blue);border-radius:2px"></span>최근 경기 기록 <span style="font-size:11px;color:var(--gray-l);font-weight:400">(총 ${totalGames}게임 · ${fromN}–${toN}번째 표시)</span>${isLoggedIn?`<button class="btn btn-w btn-xs no-export" onclick="togglePlayerHistBulkMode()" style="margin-left:auto;padding:2px 8px;font-size:10px;border-color:var(--border2)">${_playerHistBulkMode?'✕ 선택 완료':'☐ 일괄 선택'}</button>`:''}</div>`;
    h+=seasonBar;
    h+=`<div style="border:1px solid var(--border);border-radius:10px;overflow:hidden;margin-bottom:16px">`;
    const selectAllCheckbox = _playerHistBulkMode
      ? `<th class="no-export" style="width:40px"><input type="checkbox" class="hist-select-checkbox" onchange="togglePlayerHistSelectAll('${escJS(p.name)}',[${displayHist.map(h=>h._origIdx).join(',')}])" style="cursor:pointer"></th>`
      : '';
    const manageHeader = isLoggedIn ? '<th class="no-export" style="width:48px">관리</th>' : '';
    h+=`<table style="margin:0;border:none;border-radius:0"><thead><tr>${selectAllCheckbox}<th>날짜</th><th>종류</th><th>결과</th><th>상대</th><th>종족</th><th>맵</th><th>ELO</th>${manageHeader}</tr></thead><tbody>`;
    displayHist.forEach((hh)=>{
      const hi=hh._origIdx;
      const isWin=hh.result==='승';
      const eloStr=hh.eloDelta!=null?`<span style="font-weight:700;font-size:11px;color:${hh.eloDelta>0?'#16a34a':'#dc2626'}">${hh.eloDelta>0?'+':''}${hh.eloDelta}</span>`:'-';
      const oppP=players.find(x=>x.name===hh.opp);const oppCol=oppP?gc(oppP.univ):'#6b7280';
      // Backfill missing oppRace from players array
      const oppRace=hh.oppRace||oppP?.race||'';
      const selectCheckboxHTML=_playerHistBulkMode?`<td class="no-export" style="text-align:center"><input type="checkbox" class="hist-select-checkbox" value="${hi}" ${_playerHistBulkSelected.has(hi)?'checked':''} onchange="togglePlayerHistSelect(${hi})" style="cursor:pointer"></td>`:'';
      const editBtnHTML=(isLoggedIn&&!hh._readOnly)?`<td class="no-export" style="text-align:center;white-space:nowrap">
        <button class="btn btn-w btn-xs" onclick="openPlayerHistEdit('${p.name}',${hi})" title="경기 수정" style="padding:2px 6px;font-size:10px;border-color:var(--border2)">✏️</button>
        <button class="btn btn-r btn-xs" onclick="deletePlayerHist('${p.name}',${hi})" title="경기 삭제" style="padding:2px 6px;font-size:10px;margin-left:2px">🗑</button>
      </td>`:(isLoggedIn?'<td class="no-export"></td>':'');
      const modeLbl=hh.mode||'';
      const modeBadgeColors={'조별리그':'#2563eb','토너먼트':'#16a34a','미니대전':'#7c3aed','시빌워':'#db2777','대학대전':'#7c3aed','대학CK':'#dc2626','프로리그':'#0891b2','티어대회':'#f59e0b','대회':'#d97706','끝장전':'#8b5cf6','개인전':'#8b5cf6','테스트':'#6b7280'};
      const modeColor=modeBadgeColors[modeLbl]||'#6b7280';
      const _hhMid=(hh.matchId||'').replace(/'/g,"\\'");
      const _navModes=['미니대전','시빌워','대학대전','대학CK','프로리그','티어대회','끝장전','프로리그끝장전','프로리그대회끝장전','개인전','조별리그','대회','토너먼트','프로리그대회','프로리그팀전'];
      const modeCellHTML=modeLbl?(_hhMid&&_navModes.includes(modeLbl)
        ?`<span style="background:${modeColor};color:#fff;padding:1px 6px;border-radius:4px;font-size:10px;font-weight:700;cursor:pointer;text-decoration:underline dotted" onclick="navToMatch('${_hhMid}','${modeLbl.replace(/'/g,"\\'")}')" title="해당 경기로 이동">${modeLbl}</span>`
        :`<span style="background:${modeColor};color:#fff;padding:1px 6px;border-radius:4px;font-size:10px;font-weight:700">${modeLbl}</span>`)
        :'';
      h+=`<tr style="background:${isWin?'#f0fdf4':'#fef2f2'}10">
        ${selectCheckboxHTML}
        <td style="color:var(--gray-l);font-size:11px">${hh.date}</td>
        <td>${modeCellHTML}</td>
        <td>${isWin?`<span style="background:#dcfce7;color:#16a34a;border:1px solid #bbf7d0;font-size:10px;font-weight:800;padding:2px 8px;border-radius:20px">WIN</span>`:`<span style="background:#fee2e2;color:#dc2626;border:1px solid #fecaca;font-size:10px;font-weight:800;padding:2px 8px;border-radius:20px">LOSE</span>`}</td>
        <td style="cursor:pointer;font-weight:700" onclick="cm('playerModal');setTimeout(()=>openPlayerModal('${escJS(hh.opp)}'),100)"><span style="display:inline-flex;align-items:center;gap:5px">${getPlayerPhotoHTML(hh.opp,'22px','pointer-events:none;')}<span style="color:var(--blue)">${hh.opp}</span></span></td>
        <td><span class="rbadge r${oppRace||''}" style="font-size:10px">${oppRace||''}</span></td>
        <td style="color:var(--gray-l);font-size:11px">${hh.map && hh.map !== '-' ? hh.map : ''}</td>
        <td>${eloStr}</td>
        ${editBtnHTML}
      </tr>`;
    });
    h+=`</tbody></table>`;
    if(totalPages>1){
      h+=`<div style="display:flex;align-items:center;justify-content:center;gap:8px;padding:8px 12px;background:var(--surface);border-top:1px solid var(--border)">
        <button class="btn btn-w btn-xs" ${curPage===0?'disabled':''} onclick="window._goPlayerHistPage(${curPage-1},'${escJS(p.name)}')">◀ 이전</button>
        <span style="font-size:12px;color:var(--gray-l)">${curPage+1} / ${totalPages} 페이지</span>
        <button class="btn btn-w btn-xs" ${curPage>=totalPages-1?'disabled':''} onclick="window._goPlayerHistPage(${curPage+1},'${escJS(p.name)}')">다음 ▶</button>
        ${_playerHistBulkMode?`<button id="bulk-edit-btn" class="btn btn-g btn-xs no-export" onclick="openPlayerHistBulkEdit('${escJS(p.name)}')" style="padding:2px 8px;font-size:10px;border-color:var(--border2)">✏️ 선택 수정 (${_playerHistBulkSelected.size})</button><button id="bulk-delete-btn" class="btn btn-r btn-xs no-export" onclick="deletePlayerHistBulk('${escJS(p.name)}')" style="padding:2px 8px;font-size:10px;border-color:var(--border2)">🗑 선택 삭제 (${_playerHistBulkSelected.size})</button>`:''}
      </div>`;
    }else if(_playerHistBulkMode){
      h+=`<div style="display:flex;align-items:center;justify-content:flex-end;gap:8px;padding:8px 12px;background:var(--surface);border-top:1px solid var(--border)">
        <button id="bulk-edit-btn" class="btn btn-g btn-xs no-export" onclick="openPlayerHistBulkEdit('${escJS(p.name)}')" style="padding:2px 8px;font-size:10px;border-color:var(--border2)">✏️ 선택 수정 (${_playerHistBulkSelected.size})</button><button id="bulk-delete-btn" class="btn btn-r btn-xs no-export" onclick="deletePlayerHistBulk('${escJS(p.name)}')" style="padding:2px 8px;font-size:10px;border-color:var(--border2)">🗑 선택 삭제 (${_playerHistBulkSelected.size})</button>
      </div>`;
    }
    h+=`</div>`;
  }

  // ── 맵별 승률 ──
  {
    const mapStats = {};
    _modeHist.forEach(h=>{
      if(!h.map || h.map==='-' || h.map==='') return;
      if(!mapStats[h.map]) mapStats[h.map]={w:0,l:0};
      if(h.result==='승') mapStats[h.map].w++;
      else mapStats[h.map].l++;
    });
    const mapList = Object.entries(mapStats)
      .filter(([,s])=>s.w+s.l>=2)
      .sort((a,b)=>(b[1].w+b[1].l)-(a[1].w+a[1].l))
      .slice(0,8);
    if(mapList.length>=2){
      const mapCards = mapList.map(([mapName,s])=>{
        const t=s.w+s.l;
        const wr=Math.round(s.w/t*100);
        const barCol = wr>=60?'#16a34a':wr>=40?'#f59e0b':'#dc2626';
        return `<div style="background:var(--surface);border:1px solid var(--border);border-radius:8px;padding:8px 10px;min-width:80px;flex:1">
          <div style="font-size:10px;font-weight:700;color:var(--text2);margin-bottom:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${mapName}</div>
          <div style="height:4px;background:var(--border);border-radius:2px;margin-bottom:4px">
            <div style="height:4px;width:${wr}%;background:${barCol};border-radius:2px"></div>
          </div>
          <div style="display:flex;justify-content:space-between;font-size:10px">
            <span style="color:${barCol};font-weight:800">${wr}%</span>
            <span style="color:var(--gray-l)">${s.w}승${s.l}패</span>
          </div>
        </div>`;
      }).join('');
      h += `<div style="background:var(--white);border:1.5px solid var(--border2);border-radius:14px;padding:14px 16px;margin-bottom:14px">
        <div style="font-weight:700;font-size:12px;color:var(--text2);margin-bottom:10px;display:flex;align-items:center;gap:6px">
          <span style="display:inline-block;width:3px;height:14px;background:#f59e0b;border-radius:2px"></span>
          맵별 승률
          <span style="font-size:10px;color:var(--gray-l);font-weight:400">(2게임 이상)</span>
        </div>
        <div style="display:flex;gap:6px;flex-wrap:wrap">${mapCards}</div>
      </div>`;
    }
  }

  // ── 같은 대학 팀원 ──
  if(p.univ && p.univ !== '무소속'){
    const teammates = players.filter(q=>q.univ===p.univ&&q.name!==p.name&&!q.retired);
    if(teammates.length){
      // 직책자 먼저, 그 다음 포인트순
      const tmSorted = [...teammates].sort((a,b)=>getRoleOrder(a.role)-getRoleOrder(b.role)||(b.points||0)-(a.points||0));
      const tmCards = tmSorted.map(q=>{
        const qCol=gc(q.univ);
        const qSafe=q.name.replace(/'/g,"\'");
        const qPhoto=q.photo
          ?`<img src="${q.photo}" style="width:32px;height:32px;border-radius:50%;object-fit:cover;flex-shrink:0;border:2px solid ${qCol}66" onerror="this.style.display='none'">`
          :`<div style="width:32px;height:32px;border-radius:50%;background:${qCol};display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:900;color:#fff;flex-shrink:0">${q.name[0]}</div>`;
        return `<button onclick="cm('playerModal');setTimeout(()=>openPlayerModal('${qSafe}'),80)" style="display:inline-flex;align-items:center;gap:6px;padding:5px 10px 5px 6px;border-radius:24px;border:1.5px solid ${qCol}44;background:${qCol}10;cursor:pointer;font-family:'Noto Sans KR',sans-serif;font-size:11px;font-weight:700;color:var(--text)">
          ${qPhoto}<span>${q.role?getRoleBadgeHTML(q.role,'9px')+' ':''} ${q.name}</span>${getTierBadge(q.tier)}
        </button>`;
      }).join('');
      h += `<div style="background:var(--white);border:1.5px solid var(--border2);border-radius:14px;padding:14px 16px;margin-bottom:14px">
        <div style="font-weight:700;font-size:12px;color:var(--text2);margin-bottom:10px;display:flex;align-items:center;gap:6px">
          <span style="display:inline-block;width:3px;height:14px;background:${col};border-radius:2px"></span>
          ${p.univ} 팀원 (${teammates.length}명)
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:5px">${tmCards}</div>
      </div>`;
    }
  }

  // ── 선수 메모 (관리자만) ──
  if(isLoggedIn){
    h+=`<div style="background:var(--gold-bg);border:1px solid var(--gold-b);border-radius:12px;padding:14px 16px">
      <div style="font-weight:700;font-size:12px;color:var(--gold);margin-bottom:8px">📝 스트리머 메모</div>
      ${p.memo?`<div style="font-size:12px;color:var(--text2);margin-bottom:10px;line-height:1.7;white-space:pre-wrap">${p.memo}</div>`:'<div style="font-size:12px;color:var(--gray-l);margin-bottom:10px">메모 없음</div>'}
      <textarea id="player-memo-input" style="width:100%;min-height:60px;font-size:12px;border:1px solid var(--gold-b);border-radius:8px;padding:8px 10px;resize:vertical;font-family:'Noto Sans KR',sans-serif;background:var(--surface)" placeholder="스트리머 메모...">${p.memo||''}</textarea>
      <div style="display:flex;gap:6px;margin-top:8px">
        <button class="btn btn-b btn-sm" onclick="savePlayerMemo('${p.name}')">💾 저장</button>
        ${p.memo?`<button class="btn btn-r btn-sm" onclick="savePlayerMemo('${p.name}',true)">🗑️ 삭제</button>`:''}
      </div>
    </div>`;
  }
  return h;
}

function buildUnivDetailHTML(univName){
  const col=gc(univName);
  const members=getMembers(univName);
  const oppStats={};
  function addOpp(myU,oppU,myWin){
    if(myU!==univName)return;
    if(oppU===univName)return;
    if(!oppStats[oppU])oppStats[oppU]={w:0,l:0};
    if(myWin)oppStats[oppU].w++;else oppStats[oppU].l++;
  }
  miniM.forEach(m=>{addOpp(m.a,m.b,m.sa>m.sb);addOpp(m.b,m.a,m.sb>m.sa);});
  univM.forEach(m=>{addOpp(m.a,m.b,m.sa>m.sb);addOpp(m.b,m.a,m.sb>m.sa);});
  comps.forEach(m=>{const a=m.a||m.u||'';addOpp(a,m.b,m.sa>m.sb);addOpp(m.b,a,m.sb>m.sa);});

  // 개인 전적: 현재 소속이 아니어도 history.univ 기준으로 집계
  let wins=0, tot=0;
  players.forEach(p=>{
    (p.history||[]).forEach(h=>{
      if((h.univ||p.univ)===univName){
        tot++;
        if(h.result==='승') wins++;
      }
    });
  });
  const pts=members.reduce((s,p)=>s+p.points,0);
  const wr=tot?Math.round(wins/tot*100):0;

  // ── 상단 대학 헤더 카드 ──
  let h=`<div style="background:linear-gradient(135deg,${col},${col}cc);border-radius:16px;padding:20px 24px;margin-bottom:18px;color:#fff;position:relative;overflow:hidden">
    <div style="position:absolute;top:-20px;right:-20px;width:100px;height:100px;border-radius:50%;background:rgba(255,255,255,.08);pointer-events:none"></div>
    <div style="position:absolute;bottom:-30px;right:40px;width:70px;height:70px;border-radius:50%;background:rgba(255,255,255,.05);pointer-events:none"></div>
    <div style="display:flex;align-items:center;gap:14px;margin-bottom:18px">
      <div style="width:72px;height:72px;border-radius:18px;background:rgba(255,255,255,.2);display:flex;align-items:center;justify-content:center;font-size:38px;border:2px solid rgba(255,255,255,.35);flex-shrink:0">
        ${gUI(univName,'46px')}
      </div>
      <div>
        <div style="font-size:20px;font-weight:900;color:#fff;text-shadow:0 1px 6px rgba(0,0,0,.2)">
          ${univName}
          ${(()=>{const _u=univCfg.find(u=>u.name===univName);return _u?.dissolved?`<span style="font-size:12px;font-weight:700;background:rgba(0,0,0,.3);color:#fca5a5;border-radius:6px;padding:2px 8px;margin-left:6px;vertical-align:middle">🏚️ 해체${_u.dissolvedDate?' '+_u.dissolvedDate:''}</span>`:'';})()}
        </div>
        <div style="font-size:12px;color:rgba(255,255,255,.75);margin-top:2px">소속 스트리머 ${members.length}명</div>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px">
      <div style="background:rgba(255,255,255,.15);border-radius:10px;padding:10px 8px;text-align:center;backdrop-filter:blur(4px)">
        <div style="font-size:10px;color:rgba(255,255,255,.75);margin-bottom:3px">개인 전적</div>
        <div style="font-weight:900;font-size:13px;color:#fff">${wins}승 ${tot-wins}패</div>
      </div>
      <div style="background:rgba(255,255,255,.15);border-radius:10px;padding:10px 8px;text-align:center;backdrop-filter:blur(4px)">
        <div style="font-size:10px;color:rgba(255,255,255,.75);margin-bottom:3px">개인 승률</div>
        <div style="font-weight:900;font-size:14px;color:${wr>=50?'#bbf7d0':'#fca5a5'}">${tot?wr+'%':'-'}</div>
      </div>
      <div style="background:rgba(255,255,255,.15);border-radius:10px;padding:10px 8px;text-align:center;backdrop-filter:blur(4px)">
        <div style="font-size:10px;color:rgba(255,255,255,.75);margin-bottom:3px">총 포인트</div>
        <div style="font-weight:900;font-size:13px;color:${pts>0?'#fef08a':pts<0?'#fca5a5':'#fff'}">${pts>0?'+':''}${pts}</div>
      </div>
      <div style="background:rgba(255,255,255,.15);border-radius:10px;padding:10px 8px;text-align:center;backdrop-filter:blur(4px)">
        <div style="font-size:10px;color:rgba(255,255,255,.75);margin-bottom:3px">선수 수</div>
        <div style="font-weight:900;font-size:14px;color:#fff">${members.length}명</div>
      </div>
    </div>
  </div>`;

  // ── 소속 선수 ──
  if(members.length){
    const sorted=[...members].sort((a,b)=>getRoleOrder(a.role)-getRoleOrder(b.role)||TIERS.indexOf(a.tier)-TIERS.indexOf(b.tier)||b.points-a.points);
    const displayList=sorted; // 전체 선수 표시 (남자 포함, 경기 이력 없어도)
    h+=`<div style="font-weight:700;font-size:12px;color:${col};margin-bottom:10px;display:flex;align-items:center;gap:6px">
      <span style="display:inline-block;width:3px;height:14px;background:${col};border-radius:2px"></span>소속 스트리머 (${displayList.length}명)
    </div>`;
    h+=`<div style="border:1px solid var(--border);border-radius:10px;overflow:hidden;margin-bottom:18px"><table style="margin:0;border:none;border-radius:0;table-layout:auto"><thead><tr><th style="text-align:center;width:1px;white-space:nowrap;padding:7px 6px">직책</th><th style="text-align:center">티어</th><th style="text-align:center;width:50px">종족</th><th style="text-align:left;padding-left:10px">이름</th><th style="text-align:center;width:40px">성별</th><th style="text-align:center;width:40px">승</th><th style="text-align:center;width:40px">패</th><th style="text-align:center;width:52px">승률</th><th style="text-align:center;width:60px">포인트</th></tr></thead><tbody>`;
    displayList.forEach(p=>{
      const tw=p.win+p.loss;const twr=tw?Math.round(p.win/tw*100):0;
      h+=`<tr style="cursor:pointer" onclick="cm('univModal');setTimeout(()=>openPlayerModal('${escJS(p.name)}'),100)" onmouseover="this.style.background=gcHex8('${p.univ}',.12)" onmouseout="this.style.background=gcHex8('${p.univ}',.06)"
          style="border-left:3px solid ${col};background:${gcHex8(p.univ,.06)}">\r\n        <td style="text-align:center;padding:5px 4px;white-space:nowrap">${p.role?getRoleBadgeHTML(p.role,'10px'):''}</td>
        <td style="text-align:center">${getTierBadge(p.tier)}</td>
        <td style="text-align:center"><span class="rbadge r${p.race}">${p.race}</span></td>
        <td style="text-align:left;padding-left:10px;font-weight:600"><span style="display:inline-flex;align-items:center;gap:6px">${getPlayerPhotoHTML(p.name,'32px')}<span class="clickable-name">${p.name}</span>${getStatusIconHTML(p.name)}</span></td>
        <td style="text-align:center">${genderIcon(p.gender)}</td>
        <td style="text-align:center" class="wt">${p.win}</td>
        <td style="text-align:center" class="lt">${p.loss}</td>
        <td style="text-align:center;font-weight:700;color:${twr>=50?'#16a34a':'#dc2626'}">${tw?twr+'%':'-'}</td>
        <td style="text-align:center" class="${pC(p.points)}">${pS(p.points)}</td>
      </tr>`;
    });
    h+=`</tbody></table></div>`;
  }

  // ── 상대 대학 전적 ──
  const oppList=Object.entries(oppStats).filter(([,s])=>s.w+s.l>0).sort((a,b)=>(b[1].w+b[1].l)-(a[1].w+a[1].l));
  if(oppList.length){
    h+=`<div style="font-weight:700;font-size:12px;color:#7c3aed;margin-bottom:10px;display:flex;align-items:center;gap:6px">
      <span style="display:inline-block;width:3px;height:14px;background:#7c3aed;border-radius:2px"></span>상대 대학 전적
    </div>`;
    h+=`<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:18px">`;
    oppList.forEach(([opp,s])=>{
      const ot=s.w+s.l;const ow=ot?Math.round(s.w/ot*100):0;
      const oc=gc(opp);
      h+=`<div style="background:var(--white);border:1px solid var(--border);border-radius:10px;padding:10px 14px;text-align:center;cursor:pointer;min-width:90px;box-shadow:0 1px 4px rgba(0,0,0,.04)"
        onclick="cm('univModal');setTimeout(()=>openUnivModal('${opp}'),100)">
        <span class="ubadge" data-icon-done="1" style="background:${oc};font-size:11px;margin-bottom:6px;display:inline-flex;align-items:center;gap:3px">${gUI(opp,'11px')}${opp}</span>
        <div style="font-size:11px;margin-top:4px"><span class="wt">${s.w}</span>승 <span class="lt">${s.l}</span>패</div>
        <div style="font-weight:700;font-size:11px;color:${ow>=50?'#16a34a':'#dc2626'}">${ow}%</div>
      </div>`;
    });
    h+=`</div>`;
  }

  // ── 최근 대전 기록 ──
  const myMatches=[
    ...miniM.filter(m=>m.a===univName||m.b===univName).map(m=>({...m,mode:'미니대전'})),
    ...univM.filter(m=>m.a===univName||m.b===univName).map(m=>({...m,mode:'대학대전'})),
  ].sort((a,b)=>(b.d||'').localeCompare(a.d||''));
  if(myMatches.length){
    h+=`<div style="font-weight:700;font-size:12px;color:#d97706;margin-bottom:10px;display:flex;align-items:center;gap:6px">
      <span style="display:inline-block;width:3px;height:14px;background:#d97706;border-radius:2px"></span>최근 대전 기록
    </div>`;
    h+=`<div style="border:1px solid var(--border);border-radius:10px;overflow:hidden">`;
    h+=`<table style="margin:0;border:none;border-radius:0"><thead><tr><th>날짜</th><th>종류</th><th>상대</th><th>결과</th></tr></thead><tbody>`;
    myMatches.slice(0,10).forEach(m=>{
      const isA=m.a===univName;
      const opp=isA?m.b:m.a;
      const myS=isA?m.sa:m.sb;const oppS=isA?m.sb:m.sa;
      const win=myS>oppS;const oc=gc(opp);
      const modeBg=m.mode==='미니대전'?'#2563eb':'#7c3aed';
      h+=`<tr>
        <td style="color:var(--text3);font-size:12px;font-weight:600">${m.d||''}</td>
        <td><span style="background:${modeBg};color:#fff;padding:1px 8px;border-radius:4px;font-size:10px;font-weight:700">${m.mode}</span></td>
        <td><span class="ubadge clickable-univ" style="background:${oc};font-size:10px;padding:1px 7px" onclick="cm('univModal');setTimeout(()=>openUnivModal('${opp}'),100)">${opp}</span></td>
        <td>${win?`<span class="wt" style="font-weight:800">${myS}:${oppS} 승</span>`:`<span class="lt" style="font-weight:800">${myS}:${oppS} 패</span>`}</td>
      </tr>`;
    });
    h+=`</tbody></table></div>`;
  }
  // ── 에이스 선수 하이라이트 ──
  {
    const activeM = members.filter(p=>!p.retired&&(p.win+p.loss)>0);
    if(activeM.length>=2){
      const byPoints = [...activeM].sort((a,b)=>(b.points||0)-(a.points||0));
      const byWR = [...activeM].filter(p=>p.win+p.loss>=5).sort((a,b)=>{
        const wa=(a.win+a.loss)?a.win/(a.win+a.loss):0;
        const wb=(b.win+b.loss)?b.win/(b.win+b.loss):0;
        return wb-wa;
      });
      const byElo = [...activeM].sort((a,b)=>(b.elo||ELO_DEFAULT)-(a.elo||ELO_DEFAULT));
      const aces = [
        {label:'🏆 포인트 1위', p:byPoints[0]},
        {label:'📈 승률 1위', p:byWR[0]},
        {label:'⚡ ELO 1위', p:byElo[0]},
      ].filter(x=>x.p);
      // 중복 제거
      const seen=new Set();
      const uniqueAces=aces.filter(x=>{ if(seen.has(x.p.name))return false; seen.add(x.p.name); return true; });
      if(uniqueAces.length){
        h+=(()=>{
        const rows=uniqueAces.map(({label,p:ap})=>{
          if(!ap) return '';
          const wr=(ap.win+ap.loss)?Math.round(ap.win/(ap.win+ap.loss)*100):0;
          const safeName=escJS(ap.name);
          const photoEl=ap.photo
            ?`<img src="${ap.photo}" style="width:30px;height:30px;border-radius:50%;object-fit:cover;border:2px solid ${col}" onerror="this.style.display='none'">`
            :`<div style="width:30px;height:30px;border-radius:50%;background:${col};display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:900;color:#fff">${ap.name[0]}</div>`;
          return `<div style="flex:1;min-width:120px;background:linear-gradient(135deg,${col}18,${col}08);border:1.5px solid ${col}44;border-radius:12px;padding:10px 12px;cursor:pointer" onclick="cm('univModal');setTimeout(()=>openPlayerModal('${safeName}'),100)">
            <div style="font-size:10px;font-weight:700;color:${col};margin-bottom:5px">${label}</div>
            <div style="display:flex;align-items:center;gap:6px">
              ${photoEl}
              <div>
                <div style="font-weight:800;font-size:13px">${ap.name}</div>
                <div style="font-size:10px;color:var(--gray-l)">${wr}% · ${ap.points}pt · ELO ${ap.elo||ELO_DEFAULT}</div>
              </div>
            </div>
          </div>`;
        }).filter(Boolean).join('');
        return `<div style="margin-top:16px">
          <div style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:14px;color:${col};margin-bottom:10px;padding-bottom:6px;border-bottom:2px solid ${col}33">⭐ 에이스 스트리머</div>
          <div style="display:flex;gap:8px;flex-wrap:wrap">${rows}</div>
        </div>`;
      })();
      }
    }
  }

  return h;
}/* ══════════════════════════════════════
   통합 탭 렌더 함수
══════════════════════════════════════ */
var _mergedIndSub  = 'ind';   // 개인전 서브탭: 'ind' | 'gj'
var _mergedUnivSub = 'mini';  // 대학대전 서브탭: 'civil' | 'mini' | 'univm' | 'univck'
var _mergedCompSub = 'comp';  // 대회 서브탭: 'comp' | 'tiertour'
var _mergedProSub  = 'pro';   // 프로리그 서브탭: 'pro' | 'gj' | 'comp'

function _mergedSubBar(tabs, curSub, setFn) {
  return `<div class="fbar no-export" style="overflow-x:auto;flex-wrap:nowrap;-webkit-overflow-scrolling:touch;scrollbar-width:none;margin-bottom:16px">
    ${tabs.map(t=>`<button class="pill ${curSub===t.id?'on':''}" style="flex-shrink:0;white-space:nowrap" onclick="${setFn}='${t.id}';render()">${t.lbl}</button>`).join('')}
  </div>`;
}

function rMergedInd(C, T) {
  const bar = _mergedSubBar(
    [{id:'ind',lbl:'🎮 개인전'},{id:'gj',lbl:'⚔️ 끝장전'}],
    _mergedIndSub, '_mergedIndSub'
  );
  const sub = document.createElement('div');
  if(_mergedIndSub==='ind') { if(typeof rInd==='function') rInd(sub,T); }
  else                       { if(typeof rGJ==='function')  rGJ(sub,T);  }
  C.innerHTML = bar;
  C.appendChild(sub);
}

function rMergedUnivM(C, T) {
  const bar = _mergedSubBar(
    [{id:'civil',lbl:'⚔️ 시빌워'},{id:'mini',lbl:'⚡ 미니대전'},{id:'univm',lbl:'🏟️ 대학대전'},{id:'univck',lbl:'🤝 대학CK'}],
    _mergedUnivSub, '_mergedUnivSub'
  );
  const sub = document.createElement('div');
  if(_mergedUnivSub==='civil')       { miniType='civil';  if(typeof rMini==='function')  rMini(sub,T); }
  else if(_mergedUnivSub==='mini')   { miniType='mini';   if(typeof rMini==='function')  rMini(sub,T); }
  else if(_mergedUnivSub==='univck') { if(typeof rCK==='function')    rCK(sub,T);   }
  else                                { if(typeof rUnivM==='function') rUnivM(sub,T); }
  C.innerHTML = bar;
  C.appendChild(sub);
}

function rMergedComp(C, T) {
  const bar = _mergedSubBar(
    [{id:'comp',lbl:'🎖️ 대회'},{id:'tiertour',lbl:'🎯 티어대회'}],
    _mergedCompSub, '_mergedCompSub'
  );
  const sub = document.createElement('div');
  if(_mergedCompSub==='comp') { if(typeof rComp==='function')        rComp(sub,T); }
  else                         { if(typeof rTierTourTab==='function') rTierTourTab(sub,T); }
  C.innerHTML = bar;
  C.appendChild(sub);
}

function rMergedPro(C, T) {
  const bar = _mergedSubBar(
    [{id:'pro',lbl:'🏅 일반'},{id:'gj',lbl:'⚔️ 끝장전'},{id:'comp',lbl:'🎖️ 대회'}],
    _mergedProSub, '_mergedProSub'
  );
  const sub = document.createElement('div');
  if(_mergedProSub==='pro')       { if(typeof rPro==='function')     rPro(sub,T); }
  else if(_mergedProSub==='gj')   { if(typeof rGJ==='function')      rGJ(sub,T,true,true); }
  else                            { if(typeof rProComp==='function') rProComp(sub,T); }
  C.innerHTML = bar;
  C.appendChild(sub);
}

/* ══════════════════════════════════════
   선수 모달 ELO 추이 차트
══════════════════════════════════════ */
function initPEloChart(name, year){
  const p=players.find(x=>x.name===name);
  const canvas=document.getElementById('pEloChart');
  const tip=document.getElementById('pEloTip');
  if(!p||!canvas)return;
  // 전체 history로 ELO 재계산 (정확한 누적값 산출)
  const histAll=[...(p.history||[])].reverse();
  let _eloRc=p.elo||ELO_DEFAULT;
  const _eloRcMap=new Map();
  [...histAll].reverse().forEach((h,i)=>{_eloRcMap.set(i,_eloRc);_eloRc-=(h.eloDelta||0);});
  const allPts=[];let elo=ELO_DEFAULT;
  histAll.forEach((h,i)=>{
    const _ea = h.eloAfter != null ? h.eloAfter : (_eloRcMap.get(histAll.length-1-i) ?? null);
    if(_ea!=null) allPts.push({elo:_ea,date:h.date||'',result:h.result,opp:h.opp||'',delta:h.eloDelta||0});
    else{elo+=(h.eloDelta||0);allPts.push({elo,date:h.date||'',result:h.result,opp:h.opp||'',delta:h.eloDelta||0});}
  });
  // 년도 필터 적용 (ELO 값은 전체 기반으로 계산된 것 사용)
  const _yr=year||window._playerModalYear||'';
  const pts=_yr?allPts.filter(pt=>(pt.date||'').startsWith(_yr)):allPts;
  // x축 인덱스 재부여
  pts.forEach((pt,i)=>pt.i=i);
  if(pts.length<2){canvas.style.display='none';return;}
  const W=canvas.offsetWidth||canvas.parentElement?.offsetWidth||300;
  const H=140;
  canvas.width=W;canvas.height=H;
  const pad={t:14,r:14,b:32,l:46};
  const minE=Math.min(...pts.map(x=>x.elo))-15;
  const maxE=Math.max(...pts.map(x=>x.elo))+15;
  const mapX=i=>(i/(pts.length-1||1))*(W-pad.l-pad.r)+pad.l;
  const mapY=e=>H-pad.b-((e-minE)/(maxE-minE||1))*(H-pad.t-pad.b);
  const ctx=canvas.getContext('2d');
  ctx.clearRect(0,0,W,H);
  ctx.strokeStyle='#e2e8f0';ctx.lineWidth=1;
  for(let g=0;g<=3;g++){
    const y=pad.t+g*(H-pad.t-pad.b)/3;
    ctx.beginPath();ctx.moveTo(pad.l,y);ctx.lineTo(W-pad.r,y);ctx.stroke();
    ctx.fillStyle='#94a3b8';ctx.font='9px sans-serif';ctx.textAlign='right';
    ctx.fillText(Math.round(maxE-g*(maxE-minE)/3),pad.l-3,y+3);
  }
  if(minE<1200&&maxE>1200){
    const by=mapY(1200);
    ctx.strokeStyle='#cbd5e1';ctx.setLineDash([3,3]);ctx.lineWidth=1;
    ctx.beginPath();ctx.moveTo(pad.l,by);ctx.lineTo(W-pad.r,by);ctx.stroke();
    ctx.setLineDash([]);
  }
  const grad=ctx.createLinearGradient(0,pad.t,0,H-pad.b);
  grad.addColorStop(0,'rgba(124,58,237,.18)');grad.addColorStop(1,'rgba(124,58,237,0)');
  ctx.beginPath();ctx.moveTo(mapX(0),mapY(pts[0].elo));
  pts.forEach(pt=>ctx.lineTo(mapX(pt.i),mapY(pt.elo)));
  ctx.lineTo(mapX(pts.length-1),H-pad.b);ctx.lineTo(mapX(0),H-pad.b);
  ctx.closePath();ctx.fillStyle=grad;ctx.fill();
  ctx.beginPath();ctx.strokeStyle='#7c3aed';ctx.lineWidth=2;
  ctx.moveTo(mapX(0),mapY(pts[0].elo));
  pts.forEach(pt=>ctx.lineTo(mapX(pt.i),mapY(pt.elo)));
  ctx.stroke();
  pts.forEach(pt=>{
    ctx.beginPath();ctx.arc(mapX(pt.i),mapY(pt.elo),3,0,Math.PI*2);
    ctx.fillStyle=pt.result==='승'?'#16a34a':'#dc2626';
    ctx.fill();ctx.strokeStyle='#fff';ctx.lineWidth=1.2;ctx.stroke();
  });
  ctx.fillStyle='#64748b';ctx.font='9px sans-serif';ctx.textAlign='center';
  [0,Math.floor((pts.length-1)/2),pts.length-1].filter((v,i,a)=>a.indexOf(v)===i).forEach(idx=>{
    if(pts[idx]&&pts[idx].date)ctx.fillText(pts[idx].date.slice(5)||'',mapX(idx),H-pad.b+12);
  });
  if(tip){
    canvas.onmousemove=e=>{
      const rect=canvas.getBoundingClientRect();
      const mx=(e.clientX-rect.left)*(W/rect.width);
      let ci=0,md=Infinity;
      pts.forEach((pt,i)=>{const d=Math.abs(mapX(pt.i)-mx);if(d<md){md=d;ci=i;}});
      if(md<28){
        const pt=pts[ci];const sign=pt.delta>=0?'+':'';
        tip.innerHTML=`<b>${pt.opp||'?'}</b> <span style="color:${pt.result==='승'?'#86efac':'#fca5a5'}">${pt.result}</span><br>${sign}${pt.delta} → <b>${pt.elo}</b><br><span style="color:#94a3b8">${pt.date}</span>`;
        const tx=mapX(ci)*(rect.width/W);
        const ty=mapY(pt.elo)*(rect.height/H);
        tip.style.display='block';
        tip.style.left=(tx>rect.width/2?tx-130:tx+10)+'px';
        tip.style.top=Math.max(0,ty-10)+'px';
      } else tip.style.display='none';
    };
    canvas.onmouseleave=()=>{tip.style.display='none';};
  }
}

/* ══════════════════════════════════════
   이미지 저장 공통 유틸 (stats.js / vs.js / vote.js 공유)
   stats.js보다 먼저 로드되는 render.js로 이동 (로드 순서 버그 수정)
══════════════════════════════════════ */
async function _downloadCanvasImage(canvas, filename, mimeType, quality){
  return new Promise((resolve) => {
    try {
      canvas.toBlob(function(blob){
        if(!blob){ resolve(false); return; }
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(()=>{ document.body.removeChild(a); URL.revokeObjectURL(url); }, 300);
        resolve(true);
      }, mimeType, quality);
    } catch(e) { resolve(false); }
  });
}
async function _saveCanvasImage(canvas, filename, fmt){
  const mime = fmt==='jpg' ? 'image/jpeg' : 'image/png';
  const q = fmt==='jpg' ? 0.95 : undefined;
  const ok = await _downloadCanvasImage(canvas, filename, mime, q);
  if(!ok){
    const dataUrl = fmt==='jpg' ? canvas.toDataURL('image/jpeg', 0.95) : canvas.toDataURL('image/png');
    const w = window.open('', '_blank');
    if(w){
      w.document.write('<html><body style="margin:0;background:#111">'
        + '<p style="color:#fff;font-family:sans-serif;padding:12px;font-size:13px">이미지를 길게 눌러 저장하세요 📥</p>'
        + '<img src="' + dataUrl + '" style="max-width:100%;display:block">'
        + '</body></html>');
    } else {
      window.location.href = fmt==='jpg' ? canvas.toDataURL('image/jpeg', 0.95) : canvas.toDataURL('image/png');
    }
  }
}

/* ══════════════════════════════════════
   보라크루 / 종합게임 스트리머 상세 UI
══════════════════════════════════════ */
function _buildCrewPlayerDetailHTML(p, accentCol, typeLabel) {
  const crewCfgArr = typeof crewCfg !== 'undefined' ? crewCfg : [];
  const crewInfo = p.crewName ? crewCfgArr.find(c => c.name === p.crewName) : null;
  const crewCol = crewInfo ? (crewInfo.color || accentCol) : accentCol;

  // 헤더 배경
  const hdrBg = crewInfo && crewInfo.bgImage
    ? `url(${JSON.stringify(crewInfo.bgImage)}) center/cover no-repeat`
    : `linear-gradient(135deg, ${crewCol}, ${crewCol}cc)`;

  // 프로필 이미지
  const photoHTML = p.photo
    ? `<img src="${p.photo}" style="width:100%;height:100%;object-fit:cover;position:absolute;inset:0" onerror="this.style.display='none'">`
    : `<div style="display:flex;align-items:center;justify-content:center;width:100%;height:100%;font-size:32px;font-weight:900;color:rgba(255,255,255,.7)">${(p.name||'?')[0]}</div>`;

  // 방송 링크
  const channelHTML = (()=>{
    if (!p.channelUrl) return '';
    const url = p.channelUrl;
    let icon = '🏠', label = '방송';
    if (url.includes('chzzk.naver.com')) { icon = '🎮'; label = '치지직'; }
    else if (url.includes('afreecatv.com')) { icon = '📺'; label = '아프리카'; }
    else if (url.includes('youtube.com') || url.includes('youtu.be')) { icon = '▶️'; label = '유튜브'; }
    else if (url.includes('twitch.tv')) { icon = '📡'; label = '트위치'; }
    return `<a href="${url}" target="_blank" style="display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:20px;background:rgba(255,255,255,.22);border:1.5px solid rgba(255,255,255,.38);text-decoration:none;font-size:11px;font-weight:700;color:#fff">${icon} ${label}</a>`;
  })();

  // 크루 로고
  const crewLogoHTML = crewInfo && crewInfo.logo
    ? `<img src="${crewInfo.logo}" style="width:18px;height:18px;object-fit:contain;border-radius:3px;flex-shrink:0" onerror="this.style.display='none'"> `
    : '';

  // 직책 뱃지
  const crewRoleHTML = (p.crewRole||p.role)
    ? `<span style="background:rgba(255,255,255,.25);border:1px solid rgba(255,255,255,.4);border-radius:10px;padding:2px 8px;font-size:10px;font-weight:800;color:#fff">${p.crewRole||p.role}</span>`
    : '';

  // 성별
  const genderIcon = p.gender === 'M' ? '👨' : p.gender === 'F' ? '👩' : '';

  let h = `<div style="background:var(--white);border:1.5px solid var(--border2);border-radius:18px;margin-bottom:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.08)">
    <div style="background:${hdrBg};padding:20px 18px 18px;position:relative;overflow:hidden">
      <div style="position:absolute;top:-25px;right:-25px;width:110px;height:110px;border-radius:50%;background:rgba(255,255,255,.09);pointer-events:none"></div>
      <div style="display:flex;align-items:center;gap:14px;flex-wrap:wrap;position:relative">
        <div style="width:76px;height:76px;border-radius:50%;background:rgba(255,255,255,.2);border:2.5px solid rgba(255,255,255,.45);flex-shrink:0;overflow:hidden;position:relative;box-shadow:0 3px 14px rgba(0,0,0,.2)">${photoHTML}</div>
        <div style="flex:1;min-width:0">
          <div style="display:flex;align-items:center;gap:7px;flex-wrap:wrap;margin-bottom:6px">
            <span style="font-size:20px;font-weight:900;color:#fff;text-shadow:0 1px 5px rgba(0,0,0,.2)">${p.name} ${genderIcon}</span>
            ${crewRoleHTML}
          </div>
          <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">
            ${p.crewName ? `<span style="background:rgba(255,255,255,.22);color:#fff;border:1.5px solid rgba(255,255,255,.38);font-size:11px;padding:3px 10px;display:inline-flex;align-items:center;gap:4px;border-radius:20px;font-weight:700">${crewLogoHTML}${p.crewName}</span>` : ''}
            <span style="background:rgba(255,255,255,.18);border:1px solid rgba(255,255,255,.3);border-radius:20px;padding:3px 9px;font-size:11px;font-weight:700;color:#fff">${typeLabel}</span>
            ${channelHTML}
          </div>
        </div>
      </div>
    </div>
  </div>`;

  // 메모가 있으면 표시
  if (p.memo) {
    h += `<div style="background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:10px 14px;margin-bottom:14px;font-size:12px;color:var(--text2);line-height:1.6">
      <span style="font-weight:700;color:${crewCol}">📝 메모</span><br>${p.memo.replace(/\n/g,'<br>')}
    </div>`;
  }

  // 같은 크루 멤버 보기
  if (p.crewName) {
    const crewMembers = (typeof players !== 'undefined' ? players : [])
      .filter(q => q.crewName === p.crewName && q.name !== p.name && !q.hidden && !q.retired);
    if (crewMembers.length) {
      h += `<div style="background:var(--white);border:1.5px solid ${crewCol}33;border-radius:12px;padding:14px;margin-bottom:14px">
        <div style="font-size:12px;font-weight:800;color:${crewCol};margin-bottom:10px">${crewLogoHTML}${p.crewName} 크루원 (${crewMembers.length}명)</div>
        <div style="display:flex;flex-wrap:wrap;gap:8px">`;
      crewMembers.forEach(q => {
        const qSafe = escJS(q.name);
        h += `<button onclick="cm('playerModal');setTimeout(()=>openPlayerModal('${qSafe}'),100)" style="display:inline-flex;align-items:center;gap:6px;padding:5px 10px 5px 6px;border-radius:24px;border:1.5px solid ${crewCol}44;background:${crewCol}10;cursor:pointer;font-family:'Noto Sans KR',sans-serif;font-size:11px;font-weight:700;color:var(--text)">
          ${getPlayerPhotoHTML(q.name,'22px','pointer-events:none;border-radius:50%')} ${q.name}${q.crewRole?` <span style="font-size:9px;color:${crewCol}">${q.crewRole}</span>`:''}
        </button>`;
      });
      h += `</div></div>`;
    }
  }

  return h;
}
