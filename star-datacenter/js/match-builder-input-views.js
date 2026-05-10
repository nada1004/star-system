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
    if(!BLD['ind']||!BLD['ind'].membersA||!BLD['ind'].membersB||BLD['ind'].membersA[0]?.name!==pA||BLD['ind'].membersB[0]?.name!==pB){
      BLD['ind']={date:gi.date||today,membersA:[paMem],membersB:[pbMem],sets:[],noSetMode:true,freeGames:[]};
    } else {
      if(gi.date&&BLD['ind'].date!==gi.date)BLD['ind'].date=gi.date;
      if(!gi.date&&!BLD['ind'].date)BLD['ind'].date=today;
    }
  } else {
    BLD['ind']=null;
  }
  const actionBar = _mbActionBar([
    `<button class="btn btn-p btn-sm mb-mini-btn" onclick="openIndPasteModal()" style="display:inline-flex;align-items:center;gap:5px">📋 자동인식</button>`,
    `<button class="btn btn-w btn-sm mb-mini-btn" onclick="openIndBulkModal()" style="display:inline-flex;align-items:center;gap:5px">➕ 여러 경기 입력</button>`
  ], '');
  const baseCard = _mbSectionCard('① 날짜 & 대전 스트리머', `
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:12px">
        <label style="font-size:12px;font-weight:700">날짜</label>
        <input type="date" value="${gi.date||''}" onchange="_indInput.date=this.value;if(BLD['ind'])BLD['ind'].date=this.value" style="padding:5px 8px;border:1px solid var(--border2);border-radius:6px;font-size:12px">
      </div>
      <div class="mb-split">
        <div>
          <div style="font-size:11px;font-weight:700;color:${aCol};margin-bottom:4px">🔵 A 스트리머</div>
          ${pA?`<div style="display:flex;align-items:center;gap:6px;padding:8px;background:${aCol}18;border:2px solid ${aCol};border-radius:8px">
            ${getPlayerPhotoHTML(pA,'28px')}<span style="font-weight:800;color:${aCol}">${pA}</span>
            <span style="font-size:10px;color:var(--gray-l)">${pAObj.univ||''}</span>
            <button onclick="_indInput.playerA='';BLD['ind']=null;render()" style="margin-left:auto;background:none;border:none;color:#94a3b8;cursor:pointer;font-size:12px">✕</button>
          </div>` : ''}
        </div>
        <div>
          <div style="font-size:11px;font-weight:700;color:${bCol};margin-bottom:4px">🔴 B 스트리머</div>
          ${pB?`<div style="display:flex;align-items:center;gap:6px;padding:8px;background:${bCol}18;border:2px solid ${bCol};border-radius:8px">
            ${getPlayerPhotoHTML(pB,'28px')}<span style="font-weight:800;color:${bCol}">${pB}</span>
            <span style="font-size:10px;color:var(--gray-l)">${pBObj.univ||''}</span>
            <button onclick="_indInput.playerB='';BLD['ind']=null;render()" style="margin-left:auto;background:none;border:none;color:#94a3b8;cursor:pointer;font-size:12px">✕</button>
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
    if(!BLD['gj'] || !BLD['gj'].membersA || !BLD['gj'].membersB || BLD['gj'].membersA[0]?.name!==pA || BLD['gj'].membersB[0]?.name!==pB){
      BLD['gj']={date:gi.date||today,membersA:[paMem],membersB:[pbMem],sets:[],noSetMode:true,freeGames:[],_proLabel:!!_gjProMode};
    } else {
      if(BLD['gj']._proLabel!==!!_gjProMode) BLD['gj']._proLabel=!!_gjProMode;
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
          <label style="font-size:12px;font-weight:700">날짜</label>
          <input type="date" value="${gi.date||''}" onchange="_gjInput.date=this.value;if(BLD['gj'])BLD['gj'].date=this.value;render()" style="padding:5px 8px;border:1px solid var(--border2);border-radius:6px;font-size:12px">
        </div>
      </div>
      <div class="mb-split">
        <div>
          <div style="font-size:11px;font-weight:700;color:${aCol};margin-bottom:4px">🔵 A 스트리머</div>
          ${pA?`<div style="display:flex;align-items:center;gap:6px;padding:8px;background:${aCol}18;border:2px solid ${aCol};border-radius:8px">
            ${getPlayerPhotoHTML(pA,'28px')}
            <span style="font-weight:800;color:${aCol}">${pA}</span>
            <span style="font-size:10px;color:var(--gray-l)">${pAObj.univ||''}</span>
            <button onclick="_gjInput.playerA='';BLD['gj']=null;render()" style="margin-left:auto;background:none;border:none;color:#94a3b8;cursor:pointer;font-size:12px">✕</button>
          </div>` : ''}
        </div>
        <div>
          <div style="font-size:11px;font-weight:700;color:${bCol};margin-bottom:4px">🔴 B 스트리머</div>
          ${pB?`<div style="display:flex;align-items:center;gap:6px;padding:8px;background:${bCol}18;border:2px solid ${bCol};border-radius:8px">
            ${getPlayerPhotoHTML(pB,'28px')}
            <span style="font-weight:800;color:${bCol}">${pB}</span>
            <span style="font-size:10px;color:var(--gray-l)">${pBObj.univ||''}</span>
            <button onclick="_gjInput.playerB='';BLD['gj']=null;render()" style="margin-left:auto;background:none;border:none;color:#94a3b8;cursor:pointer;font-size:12px">✕</button>
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
        // 프로리그 탭 > 프로 끝장전 하위탭
        if(typeof _mergedProSub==='undefined' || _mergedProSub==='gj') _proMode = true;
      }else if(curTab==='ind' || curTab==='gj'){
        // 개인전/끝장전 탭
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
  if(_proMode){
    try{ curTab='pro'; }catch(e){}
    try{ _mergedProSub='gj'; }catch(e){}
  }else{
    try{ curTab='ind'; }catch(e){}
    try{ _mergedIndSub='gj'; }catch(e){}
  }
  try{ if(typeof window._syncTabUrlFromState==='function') window._syncTabUrlFromState('replace'); }catch(e){}
  render();
  try{ if(typeof window.refreshPlayerModalIfOpen==='function') window.refreshPlayerModalIfOpen(); }catch(e){}
  setTimeout(()=>{
    if(confirm(`✅ ${gi.games.length}경기 저장 완료!\n공유카드를 열겠습니까?`)){
      openGJShareCard(gi.playerA,gi.playerB,p1w,p2w,dateVal,winner,{proOnly:_proMode});
    }
  },200);
}
