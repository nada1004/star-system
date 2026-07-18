/* ══════════════════════════════════════
   Match Builder Input Views
══════════════════════════════════════ */

function indInputHTML(){
  const gi=_indInput;
  const pA=gi.playerA, pB=gi.playerB;
  const pAObj=players.find(p=>p.name===pA)||{};
  const pBObj=players.find(p=>p.name===pB)||{};
  const aCol=gc(pAObj.univ)||'#2563eb', bCol=gc(pBObj.univ)||'#dc2626';
  const today=new Date().toISOString().slice(0,10);
  if(pA&&pB){
    const paMem={name:pA,univ:pAObj.univ||'',race:pAObj.race||'',tier:pAObj.tier||'',gender:pAObj.gender||''};
    const pbMem={name:pB,univ:pBObj.univ||'',race:pBObj.race||'',tier:pBObj.tier||'',gender:pBObj.gender||''};
    // _editCtx가 있으면 수정 모드 — 이미 BLD에 올바른 데이터가 세팅되어 있으므로 리셋하지 않음
    const _hasEditCtx = !!(BLD['ind'] && BLD['ind']._editCtx);
    if(!_hasEditCtx && (!BLD['ind']||!BLD['ind'].membersA||!BLD['ind'].membersB||BLD['ind'].membersA[0]?.name!==pA||BLD['ind'].membersB[0]?.name!==pB)){
      BLD['ind']={date:gi.date||today,membersA:[paMem],membersB:[pbMem],sets:[],noSetMode:true,freeGames:[]};
    } else if(!_hasEditCtx) {
      if(gi.date&&BLD['ind'].date!==gi.date)BLD['ind'].date=gi.date;
      if(!gi.date&&!BLD['ind'].date)BLD['ind'].date=today;
    } else {
      // 수정 모드: 날짜만 동기화
      if(gi.date&&BLD['ind']&&BLD['ind'].date!==gi.date)BLD['ind'].date=gi.date;
    }
  } else if(!(BLD['ind'] && BLD['ind']._editCtx)) {
    // 수정 모드가 아닌 경우에만 null 처리
    BLD['ind']=null;
  }
  const actionBar = _mbActionBar([
    `<button class="btn btn-p btn-sm mb-mini-btn" onclick="openIndPasteModal()" style="display:inline-flex;align-items:center;gap:5px">📋 자동인식</button>`,
    `<button class="btn btn-w btn-sm mb-mini-btn" onclick="openIndBulkModal()" style="display:inline-flex;align-items:center;gap:5px">➕ 여러 경기 입력</button>`
  ], '');
  const baseCard = _mbSectionCard('① 날짜 & 대전 스트리머', `
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:12px">
        <label style="font-size:var(--fs-sm);font-weight:700">날짜</label>
        <input type="date" value="${gi.date||''}" onchange="_indInput.date=this.value;if(BLD['ind'])BLD['ind'].date=this.value" style="padding:5px 8px;border:1px solid var(--border2);border-radius:6px;font-size:var(--fs-sm)">
      </div>
      <div class="mb-split">
        <div>
          <div style="font-size:var(--fs-caption);font-weight:700;color:${aCol};margin-bottom:4px">🔵 A 스트리머</div>
          ${pA?`<div style="display:flex;align-items:center;gap:6px;padding:8px;background:${aCol}18;border:2px solid ${aCol};border-radius:8px">
            ${getPlayerPhotoHTML(pA,'28px')}<span style="font-weight:800;color:${aCol}">${pA}</span>
            <span style="font-size:10px;color:var(--gray-l)">${pAObj.univ||''}</span>
            <button onclick="_indInput.playerA='';BLD['ind']=null;render()" style="margin-left:auto;background:none;border:none;color:#94a3b8;cursor:pointer;font-size:var(--fs-sm)">✕</button>
          </div>` : ''}
        </div>
        <div>
          <div style="font-size:var(--fs-caption);font-weight:700;color:${bCol};margin-bottom:4px">🔴 B 스트리머</div>
          ${pB?`<div style="display:flex;align-items:center;gap:6px;padding:8px;background:${bCol}18;border:2px solid ${bCol};border-radius:8px">
            ${getPlayerPhotoHTML(pB,'28px')}<span style="font-weight:800;color:${bCol}">${pB}</span>
            <span style="font-size:10px;color:var(--gray-l)">${pBObj.univ||''}</span>
            <button onclick="_indInput.playerB='';BLD['ind']=null;render()" style="margin-left:auto;background:none;border:none;color:#94a3b8;cursor:pointer;font-size:var(--fs-sm)">✕</button>
          </div>` : ''}
        </div>
      </div>
      ${!(pA&&pB)?_matchPlayerAssignPoolHTML('ind'):''}
    `);
  const resultCard = pA&&pB&&BLD['ind'] ? _mbSectionCard('② 경기 결과 입력', `${setBuilderHTML(BLD['ind'],'ind')}`) : '';
  return _mbFrame('🎮 개인전 입력', actionBar, baseCard + resultCard, '');
}

function indDirectSave(){
  const gi=_indInput;
  if(!gi.playerA||!gi.playerB){alert('스트리머 두 명을 선택하세요.');return;}
  if(!gi.games.length){alert('경기 결과를 1경기 이상 입력하세요.');return;}
  const sid=genId();
  const dateVal=gi.date||'';
  const newGames=gi.games.map(g=>({
    _id:genId(),sid,d:dateVal,
    wName:g.winner==='A'?gi.playerA:gi.playerB,
    lName:g.winner==='A'?gi.playerB:gi.playerA,
    map:g.map||''
  }));
  newGames.forEach(m=>{
    applyGameResult(m.wName,m.lName,dateVal,'',m._id,'','','개인전');
  });
  indM.unshift(...newGames);
  _indInput={date:gi.date,playerA:gi.playerA,playerB:gi.playerB,games:[]};
  save();
  indSub='records';
  render();
}

function _gjCanInput(){
  try{
    return !!isLoggedIn;
  }catch(e){
    return false;
  }
}

function openGJProPasteModal(){
  openGJPasteModal();
  window._gjProPaste=true;
}

function gjInputHTML(){
  const gi=_gjInput;
  const pA=gi.playerA, pB=gi.playerB;
  const pAObj=players.find(p=>p.name===pA)||{};
  const pBObj=players.find(p=>p.name===pB)||{};
  const aCol=gc(pAObj.univ)||'#2563eb', bCol=gc(pBObj.univ)||'#dc2626';

  const today=new Date().toISOString().slice(0,10);
  if(pA&&pB){
    const paMem={name:pA,univ:pAObj.univ||'',race:pAObj.race||'',tier:pAObj.tier||'',gender:pAObj.gender||''};
    const pbMem={name:pB,univ:pBObj.univ||'',race:pBObj.race||'',tier:pBObj.tier||'',gender:pBObj.gender||''};
    // ✅ 수정: _proLabel은 _gjProMode가 아닌 curTab 기준으로 결정
    // _gjProMode는 rGJ 호출 순서/타이밍에 따라 오염될 수 있어 신뢰하지 않음
    const _curIsProMode = (typeof curTab!=='undefined') ? curTab==='pro' : !!_gjProMode;
    // ✅ 수정: 아래 조건 중 하나라도 해당하면 BLD['gj']를 새로 생성
    //   1) BLD['gj']가 없거나 선수가 다른 경우 (기존)
    //   2) _editCtx가 남아있는 경우 — openGJSessionEdit 후 탭 이동 시 오염된 수정 컨텍스트 제거
    //   3) _proLabel이 현재 탭 모드와 다른 경우 — 프로탭→개인전탭 이동 시 잔류 proLabel 제거
    const _bldGj = BLD['gj'];
    // ✅ 수정: _editCtx가 있으면 수정 모드 — BLD를 절대 리셋하지 않음
    //   - openGJSessionEdit로 설정된 수정 컨텍스트(_editCtx)가 있을 때 리셋하면 수정 데이터가 날아가는 버그
    //   - _editCtx가 있으면 이미 올바른 데이터가 세팅된 상태이므로 리셋하지 않음
    //   - _proLabel 불일치 조건도 _editCtx가 있을 때는 무시해야 함
    const _hasEditCtxGj = !!(_bldGj && _bldGj._editCtx);
    const _needsReset = !_hasEditCtxGj && (
      !_bldGj
      || !_bldGj.membersA || !_bldGj.membersB
      || _bldGj.membersA[0]?.name !== pA || _bldGj.membersB[0]?.name !== pB
      || !!_bldGj._proLabel !== _curIsProMode // proLabel 불일치 시 새로 생성 (수정 모드 아닐 때만)
    );
    if(_needsReset){
      BLD['gj']={date:gi.date||today,membersA:[paMem],membersB:[pbMem],sets:[],noSetMode:true,freeGames:[],_proLabel:_curIsProMode};
    } else {
      if(gi.date && BLD['gj'].date!==gi.date) BLD['gj'].date=gi.date;
      if(!gi.date && !BLD['gj'].date) BLD['gj'].date=today;
    }
  } else {
    BLD['gj']=null;
  }
  const actionBar = _mbActionBar([
    `<button class="btn btn-p btn-sm mb-mini-btn" onclick="${_gjProMode?'openGJProPasteModal':'openGJPasteModal'}()" style="display:inline-flex;align-items:center;gap:5px">📋 자동인식</button>`
  ], '');
  const baseCard = _mbSectionCard('① 날짜 & 대전 스트리머', `
      <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin-bottom:12px">
        <div style="display:flex;align-items:center;gap:6px">
          <label style="font-size:var(--fs-sm);font-weight:700">날짜</label>
          <input type="date" value="${gi.date||''}" onchange="_gjInput.date=this.value;if(BLD['gj'])BLD['gj'].date=this.value;render()" style="padding:5px 8px;border:1px solid var(--border2);border-radius:6px;font-size:var(--fs-sm)">
        </div>
      </div>
      <div class="mb-split">
        <div>
          <div style="font-size:var(--fs-caption);font-weight:700;color:${aCol};margin-bottom:4px">🔵 A 스트리머</div>
          ${pA?`<div style="display:flex;align-items:center;gap:6px;padding:8px;background:${aCol}18;border:2px solid ${aCol};border-radius:8px">
            ${getPlayerPhotoHTML(pA,'28px')}
            <span style="font-weight:800;color:${aCol}">${pA}</span>
            <span style="font-size:10px;color:var(--gray-l)">${pAObj.univ||''}</span>
            <button onclick="_gjInput.playerA='';BLD['gj']=null;render()" style="margin-left:auto;background:none;border:none;color:#94a3b8;cursor:pointer;font-size:var(--fs-sm)">✕</button>
          </div>` : ''}
        </div>
        <div>
          <div style="font-size:var(--fs-caption);font-weight:700;color:${bCol};margin-bottom:4px">🔴 B 스트리머</div>
          ${pB?`<div style="display:flex;align-items:center;gap:6px;padding:8px;background:${bCol}18;border:2px solid ${bCol};border-radius:8px">
            ${getPlayerPhotoHTML(pB,'28px')}
            <span style="font-weight:800;color:${bCol}">${pB}</span>
            <span style="font-size:10px;color:var(--gray-l)">${pBObj.univ||''}</span>
            <button onclick="_gjInput.playerB='';BLD['gj']=null;render()" style="margin-left:auto;background:none;border:none;color:#94a3b8;cursor:pointer;font-size:var(--fs-sm)">✕</button>
          </div>` : ''}
        </div>
      </div>
      ${!(pA&&pB)?_matchPlayerAssignPoolHTML('gj'):''}
    `);
  const resultCard = pA&&pB&&BLD['gj'] ? _mbSectionCard('② 경기 결과 입력', `${setBuilderHTML(BLD['gj'],'gj')}`) : '';
  return _mbFrame(_gjProMode?'🏅 프로리그 끝장전 입력':'⚔️ 끝장전 입력', actionBar, baseCard + resultCard, _gjProMode?'':'끝장전 공통 입력 카드');
}

function gjDirectSave(){
  const gi=_gjInput;
  if(!gi.playerA||!gi.playerB){alert('스트리머 두 명을 선택하세요.');return;}
  if(!gi.games.length){alert('경기 결과를 1경기 이상 입력하세요.');return;}
  // 🔧 저장 시점에 "현재 탭 컨텍스트" 기준으로 프로리그 끝장전 여부를 확정
  // - 전역 _gjProMode가 탭 전환 타이밍/렌더 순서에 따라 뒤바뀌는 경우가 있어,
  //   개인전 끝장전이 프로리그 끝장전으로 저장되거나(또는 그 반대) 저장 후 탭이 잘못 이동되는 문제가 발생할 수 있음
  let _proMode = !!_gjProMode;
  try{
    if(typeof curTab!=='undefined'){
      if(curTab==='pro'){
        // 프로리그 탭이면 항상 프로 끝장전으로 저장
        // (_mergedProSub 값에 관계없이 프로탭에서 입력한 끝장전은 프로 끝장전임)
        _proMode = true;
      }else if(curTab==='ind' || curTab==='gj'){
        // 개인전/끝장전 탭이면 항상 일반 끝장전으로 저장
        _proMode = false;
      }
    }
  }catch(e){}
  _gjProMode = _proMode;
  const sid=genId();
  const dateVal=gi.date||new Date().toISOString().slice(0,10);
  const newGames=gi.games.map(w=>({
    _id:genId(),sid,d:dateVal,
    wName:w==='A'?gi.playerA:gi.playerB,
    lName:w==='A'?gi.playerB:gi.playerA,
    map:'',
    ...(_proMode?{_proLabel:true}:{})
  }));
  newGames.forEach(m=>{
    // 게임 단위로 고유 matchId를 부여해야 history/중복체크/삭제가 정상 동작함
    applyGameResult(m.wName,m.lName,dateVal,'',m._id,'','',_proMode?'프로리그끝장전':'끝장전');
  });
  gjM.unshift(...newGames);
  const p1w=gi.games.filter(g=>g==='A').length, p2w=gi.games.filter(g=>g==='B').length;
  const winner=p1w>p2w?gi.playerA:p2w>p1w?gi.playerB:'';
  _gjInput={date:gi.date,playerA:gi.playerA,playerB:gi.playerB,games:[]};
  save();
  gjSub='records';
  // ✅ 수정: 저장 후 탭 이동 제거 - 현재 탭(개인전/프로리그) 그대로 유지
  // saveMatch('gj')와 달리 gjDirectSave는 간이 입력 경로로, 현재 위치를 바꾸지 않음
  try{ if(typeof window._syncTabUrlFromState==='function') window._syncTabUrlFromState('replace'); }catch(e){}
  render();
  try{ if(typeof window.refreshPlayerModalIfOpen==='function') window.refreshPlayerModalIfOpen(); }catch(e){}
  setTimeout(()=>{
    if(confirm(`✅ ${gi.games.length}경기 저장 완료!\n공유카드를 열겠습니까?`)){
      openGJShareCard(gi.playerA,gi.playerB,p1w,p2w,dateVal,winner,{proOnly:_proMode});
    }
  },200);
}
