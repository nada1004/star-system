/* ══════════════════════════════════════════════════════════════
   선수(전체) - 일괄편집 & 병합 (players-streamer-views.js 에서 분리, 2026-07-30)
   ══════════════════════════════════════════════════════════════ */

function toggleBulkEditMode(){
  _bulkEditMode=!_bulkEditMode;
  _bulkEditSelected=new Set();
  _bulkEditSearch='';
  render();
}

function toggleBulkEditPlayer(name,checked){
  if(checked) _bulkEditSelected.add(name);
  else _bulkEditSelected.delete(name);
  const cnt=document.getElementById('bulk-edit-cnt');
  if(cnt) cnt.textContent=_bulkEditSelected.size;
  const btn=document.getElementById('bulk-edit-apply-btn');
  if(btn) btn.style.display=_bulkEditSelected.size>0?'inline-flex':'none';
}

function bulkEditToggleAll(checked){
  document.querySelectorAll('[data-player-name]').forEach(cb=>{
    cb.checked=checked;
    const name=cb.dataset.playerName;
    if(name){if(checked)_bulkEditSelected.add(name);else _bulkEditSelected.delete(name);}
  });
  const cnt=document.getElementById('bulk-edit-cnt');
  if(cnt) cnt.textContent=_bulkEditSelected.size;
  const btn=document.getElementById('bulk-edit-apply-btn');
  if(btn) btn.style.display=_bulkEditSelected.size>0?'inline-flex':'none';
}

function clearBulkEditSelection(){
  _bulkEditSelected=new Set();
  const cnt=document.getElementById('bulk-edit-cnt');
  if(cnt) cnt.textContent='0';
  const btn=document.getElementById('bulk-edit-apply-btn');
  if(btn) btn.style.display='none';
  const all=document.getElementById('bulk-check-all');
  if(all) all.checked=false;
  document.querySelectorAll('[data-player-name]').forEach(cb=>{cb.checked=false;});
}

function openBulkEditModal(){
  if(!_bulkEditSelected.size) return;
  const univOpts=getAllUnivs().filter(u=>!u.dissolved).map(u=>`<option value="${u.name}">${u.name}</option>`).join('');
  const tierOpts=TIERS.map(t=>`<option value="${t}">${getTierLabel(t)}</option>`).join('');
  const sel=[..._bulkEditSelected];
  const first=sel.slice(0,30);
  const more=sel.length-first.length;
  document.getElementById('bulkEditBody').innerHTML=`
    <div style="margin-bottom:14px;padding:10px;background:var(--surface);border-radius:8px;font-size:var(--fs-sm);color:var(--text2)">
      <strong style="color:var(--blue)">${sel.length}명</strong> 선택됨: ${first.join(', ')}${more?` 외 ${more}명`:''}
      ${more?`<details style="margin-top:8px"><summary style="cursor:pointer;color:var(--gray-l);font-size:var(--fs-caption)">전체 보기</summary><div style="margin-top:6px;line-height:1.6">${sel.join(', ')}</div></details>`:''}
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px">
      <div>
        <label style="font-size:var(--fs-sm);font-weight:700;color:var(--text2);display:block;margin-bottom:4px">티어</label>
        <select id="bulk-ed-t" style="width:100%;padding:7px 10px;border:1px solid var(--border2);border-radius:8px;font-size:var(--fs-base)">
          <option value="">변경 안함</option>${tierOpts}
        </select>
      </div>
      <div>
        <label style="font-size:var(--fs-sm);font-weight:700;color:var(--text2);display:block;margin-bottom:4px">대학</label>
        <select id="bulk-ed-u" style="width:100%;padding:7px 10px;border:1px solid var(--border2);border-radius:8px;font-size:var(--fs-base)">
          <option value="">변경 안함</option>${univOpts}
        </select>
      </div>
      <div>
        <label style="font-size:var(--fs-sm);font-weight:700;color:var(--text2);display:block;margin-bottom:4px">종족</label>
        <select id="bulk-ed-r" style="width:100%;padding:7px 10px;border:1px solid var(--border2);border-radius:8px;font-size:var(--fs-base)">
          <option value="">변경 안함</option>
          <option value="T">테란</option><option value="Z">저그</option><option value="P">프로토스</option><option value="N">종족미정</option>
        </select>
      </div>
      <div>
        <label style="font-size:var(--fs-sm);font-weight:700;color:var(--text2);display:block;margin-bottom:4px">성별</label>
        <select id="bulk-ed-g" style="width:100%;padding:7px 10px;border:1px solid var(--border2);border-radius:8px;font-size:var(--fs-base)">
          <option value="">변경 안함</option>
          <option value="F">👩 여자</option><option value="M">👨 남자</option>
        </select>
      </div>
    </div>
    <div style="display:flex;align-items:center;gap:10px;padding:10px 12px;background:var(--surface);border-radius:8px;margin-bottom:4px">
      <label style="font-size:var(--fs-sm);font-weight:700;color:var(--text2)">현황판</label>
      <select id="bulk-ed-h" style="padding:6px 10px;border:1px solid var(--border2);border-radius:8px;font-size:var(--fs-base)">
        <option value="">변경 안함</option>
        <option value="hide">제외 (숨김)</option>
        <option value="show">표시</option>
      </select>
      <button onclick="bulkDeleteSelected()" style="margin-left:auto;padding:6px 14px;border-radius:8px;border:1.5px solid #ef4444;background:#fef2f2;color:#dc2626;font-size:var(--fs-sm);font-weight:700;cursor:pointer">🗑️ 선택 삭제</button>
    </div>`;
  om('bulkEditModal');
}

function saveBulkEdit(){
  const _getSelVal=(id)=>document.getElementById(id)?.value||'';
  const t=_getSelVal('bulk-ed-t');
  const u=_getSelVal('bulk-ed-u');
  const r=_getSelVal('bulk-ed-r');
  const g=_getSelVal('bulk-ed-g');
  const h=_getSelVal('bulk-ed-h');
  if(!document.getElementById('bulk-ed-t')&&!document.getElementById('bulk-ed-u')&&!document.getElementById('bulk-ed-r')&&!document.getElementById('bulk-ed-g')&&!document.getElementById('bulk-ed-h')){
    alert('일괄 편집 창을 다시 열어주세요.');
    return;
  }
  if(!t&&!u&&!r&&!g&&!h){alert('변경할 항목을 선택하세요.');return;}
  _bulkEditSelected.forEach(name=>{
    const p=players.find(x=>x.name===name);
    if(!p) return;
    if(t) p.tier=t;
    if(u) p.univ=u;
    if(r) p.race=r;
    if(g) p.gender=g;
    // p.hideFromBoard: 이 일괄편집에서 쓰는 "현황판 숨김" 플래그.
    // cloud-board-render.js의 개별 숨김 버튼은 p.hidden을 토글하는데, 용도가 같아 보이지만
    // 별개 필드입니다. 현황판(board2) 각 뷰는 두 플래그를 모두 검사합니다(!p.hidden && !p.hideFromBoard).
    if(h==='hide') p.hideFromBoard=true;
    else if(h==='show') p.hideFromBoard=undefined;
  });
  save();
  cm('bulkEditModal');
  _bulkEditMode=false;
  _bulkEditSelected=new Set();
  render();
}
function bulkDeleteSelected(){
  if(!_bulkEditSelected.size) return;
  if(!confirm(`선택한 ${_bulkEditSelected.size}명을 삭제할까요?\n전적·기록은 삭제되지 않습니다.`)) return;
  _bulkEditSelected.forEach(name=>{
    const idx=players.findIndex(x=>x.name===name);
    if(idx>=0) players.splice(idx,1);
  });
  if(typeof fixPoints==='function') fixPoints();
  save();
  cm('bulkEditModal');
  _bulkEditMode=false;
  _bulkEditSelected=new Set();
  render();
}

function openMergePlayersModal(){
  if(!isLoggedIn) return;
  const modalId='_mergePlayersModal';
  let modal=document.getElementById(modalId);
  if(modal) modal.remove();
  modal=document.createElement('div');
  modal.id=modalId;
  modal.style.cssText='position:fixed;inset:0;background:#0008;z-index:var(--z-modal-5);display:flex;align-items:center;justify-content:center;padding:16px;box-sizing:border-box';
  const list=players.map(p=>p.name).filter(Boolean).sort((a,b)=>a.localeCompare(b));
  modal.innerHTML=`<div style="background:var(--white);border-radius:var(--r2);padding:18px 18px 16px;width:520px;max-width:100%;box-shadow:0 10px 50px rgba(0,0,0,.35)">
    <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:10px">
      <div style="font-weight:900;font-size:var(--fs-md)">🔀 스트리머 병합</div>
      <button class="btn btn-w btn-xs" onclick="document.getElementById('${modalId}').remove()">닫기</button>
    </div>
    <div style="font-size:var(--fs-sm);color:var(--text3);line-height:1.6;margin-bottom:12px">
      A(원본)를 B(대상)로 합칩니다. 모든 기록/대진/현황판에서 A 이름을 B로 치환합니다.
    </div>
    <datalist id="_mergePlayersList">${list.map(n=>`<option value="${escAttr(n)}"></option>`).join('')}</datalist>
    <div style="display:flex;gap:10px;flex-wrap:wrap">
      <div style="flex:1;min-width:220px">
        <div style="font-size:var(--fs-sm);font-weight:800;color:var(--text2);margin-bottom:4px">A (원본)</div>
        <input id="_mergeFrom" list="_mergePlayersList" placeholder="예: 닉네임(오타)" style="width:100%;padding:8px 10px;border:1.5px solid var(--border2);border-radius:var(--r);box-sizing:border-box">
      </div>
      <div style="flex:1;min-width:220px">
        <div style="font-size:var(--fs-sm);font-weight:800;color:var(--text2);margin-bottom:4px">B (대상)</div>
        <input id="_mergeTo" list="_mergePlayersList" placeholder="예: 닉네임(정상)" style="width:100%;padding:8px 10px;border:1.5px solid var(--border2);border-radius:var(--r);box-sizing:border-box">
      </div>
    </div>
    <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-top:12px">
      <label style="display:flex;align-items:center;gap:8px;font-size:var(--fs-sm);color:var(--text3);cursor:pointer">
        <input id="_mergeDel" type="checkbox" checked style="width:15px;height:15px;cursor:pointer"> A(원본) 스트리머 삭제
      </label>
      <label style="display:flex;align-items:center;gap:8px;font-size:var(--fs-sm);color:var(--text3);cursor:pointer">
        <input id="_mergeFill" type="checkbox" checked style="width:15px;height:15px;cursor:pointer"> B 정보가 비면 A 정보로 보강(사진/채널/메모)
      </label>
    </div>
    <div style="display:flex;gap:10px;margin-top:14px">
      <button class="btn btn-b" style="flex:1" onclick="mergePlayersApply()">병합 실행</button>
      <button class="btn btn-w" style="flex:1" onclick="document.getElementById('${modalId}').remove()">취소</button>
    </div>
  </div>`;
  document.body.appendChild(modal);
  const i=document.getElementById('_mergeFrom');
  if(i) i.focus();
}

function mergePlayersApply(){
  const from=(document.getElementById('_mergeFrom')?.value||'').trim();
  const to=(document.getElementById('_mergeTo')?.value||'').trim();
  const del=document.getElementById('_mergeDel')?.checked||false;
  const fill=document.getElementById('_mergeFill')?.checked||false;
  mergePlayers(from,to,{del,fill});
}

function mergePlayers(fromName, toName, opt){
  if(!fromName||!toName) return alert('A/B 둘 다 입력하세요.');
  if(fromName===toName) return alert('A와 B가 같습니다.');
  const fromP=players.find(p=>p.name===fromName);
  const toP=players.find(p=>p.name===toName);
  if(!fromP) return alert(`원본(A) "${fromName}"을 찾을 수 없습니다.`);
  if(!toP) return alert(`대상(B) "${toName}"을 찾을 수 없습니다.`);
  if(!confirm(`"${fromName}" → "${toName}" 병합을 진행할까요?\n(되돌리기 어렵습니다)`)) return;

  const _repList = (arr, fn) => { (arr||[]).forEach(fn); };
  const _repMembers = (mems) => { _repList(mems, m => { if(m && m.name===fromName) m.name=toName; }); };
  const _repGames = (games) => { _repList(games, g => { if(!g) return; if(g.playerA===fromName) g.playerA=toName; if(g.playerB===fromName) g.playerB=toName; if(g.wName===fromName) g.wName=toName; if(g.lName===fromName) g.lName=toName; if(g.winner===fromName) g.winner=toName; }); };
  const _repSets = (sets) => { _repList(sets, s => { if(!s) return; _repGames(s.games); if(s.winner===fromName) s.winner=toName; }); };
  const _repMatch = (m) => {
    if(!m) return;
    if(m.a===fromName) m.a=toName;
    if(m.b===fromName) m.b=toName;
    if(m.wName===fromName) m.wName=toName;
    if(m.lName===fromName) m.lName=toName;
    if(m.playerA===fromName) m.playerA=toName;
    if(m.playerB===fromName) m.playerB=toName;
    if(m.winner===fromName) m.winner=toName;
    _repMembers(m.membersA);
    _repMembers(m.membersB);
    _repMembers(m.teamAMembers);
    _repMembers(m.teamBMembers);
    _repSets(m.sets);
    _repGames(m.games);
  };

  _repList([...(miniM||[]), ...(univM||[]), ...(ckM||[]), ...(proM||[]), ...(comps||[]), ...(ttM||[])], _repMatch);
  _repList(indM||[], m => { if(!m) return; if(m.wName===fromName) m.wName=toName; if(m.lName===fromName) m.lName=toName; if(m.matchupA===fromName) m.matchupA=toName; if(m.matchupB===fromName) m.matchupB=toName; });
  _repList(gjM||[], m => { if(!m) return; if(m.wName===fromName) m.wName=toName; if(m.lName===fromName) m.lName=toName; });

  const _repTourney = (tn) => {
    if(!tn) return;
    if(Array.isArray(tn.groups)){
      tn.groups.forEach(g=>{
        if(!g) return;
        if(Array.isArray(g.players)) g.players=g.players.map(n=>n===fromName?toName:n);
        if(Array.isArray(g.univs)) g.univs=g.univs.map(n=>n===fromName?toName:n);
        _repList(g.matches, _repMatch);
      });
    }
    if(Array.isArray(tn.bracket)){
      tn.bracket.forEach(r=>_repList(r,_repMatch));
    }
    if(tn.thirdPlace) _repMatch(tn.thirdPlace);
    if(Array.isArray(tn.gjMatches)) _repList(tn.gjMatches, s => { if(!s) return; if(s.a===fromName) s.a=toName; if(s.b===fromName) s.b=toName; _repList(s.games, g => { if(!g) return; if(g.winner===fromName) g.winner=toName; }); });
  };
  _repList(proTourneys||[], _repTourney);
  _repList(tourneys||[], _repTourney);

  players.forEach(p=>{
    if(!p) return;
    if(Array.isArray(p.history)){
      p.history.forEach(h=>{
        if(!h) return;
        if(h.opp===fromName) h.opp=toName;
        if(h.who===fromName) h.who=toName;
      });
    }
  });

  if(typeof boardPlayerOrder!=='undefined' && boardPlayerOrder){
    Object.keys(boardPlayerOrder).forEach(u=>{
      const arr=boardPlayerOrder[u]||[];
      const hasTo=arr.includes(toName);
      boardPlayerOrder[u]=arr.filter(n=>n!==fromName);
      if(!hasTo && arr.includes(fromName)) boardPlayerOrder[u].push(toName);
    });
    if(typeof saveBoardPlayerOrder==='function') saveBoardPlayerOrder();
  }

  if(typeof playerStatusIcons!=='undefined'){
    if(playerStatusIcons[fromName] && !playerStatusIcons[toName]) playerStatusIcons[toName]=playerStatusIcons[fromName];
    delete playerStatusIcons[fromName];
    try{ if(typeof _iconPersistState==='function') _iconPersistState(); }catch(e){}
  }

  if(opt?.fill){
    if(!toP.photo && fromP.photo) toP.photo=fromP.photo;
    if(!toP.channelUrl && fromP.channelUrl) toP.channelUrl=fromP.channelUrl;
    if(!toP.memo && fromP.memo) toP.memo=fromP.memo;
  }
  toP.win=(toP.win||0)+(fromP.win||0);
  toP.loss=(toP.loss||0)+(fromP.loss||0);
  toP.points=(toP.points||0)+(fromP.points||0);
  if(!toP.elo && fromP.elo) toP.elo=fromP.elo;
  if(Array.isArray(fromP.history)){
    if(!Array.isArray(toP.history)) toP.history=[];
    toP.history.unshift(...fromP.history);
  }

  if(opt?.del){
    const idx=players.findIndex(p=>p.name===fromName);
    if(idx>=0) players.splice(idx,1);
  }

  if(typeof fixPoints==='function') fixPoints();
  save();
  const m=document.getElementById('_mergePlayersModal');
  if(m) m.remove();
  render();
}

