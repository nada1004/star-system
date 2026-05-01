function _bindUnivActionsDelegatedEvents(){
  if(window._univActionsDelegatedBound) return;
  window._univActionsDelegatedBound = true;

  document.addEventListener('click', (e)=>{
    const el = e.target && e.target.closest ? e.target.closest('[data-ua-action]') : null;
    if(!el) return;
    const action = el.getAttribute('data-ua-action');
    if(action === 'save-edit'){
      e.preventDefault();
      if(typeof saveUnivEdit === 'function') saveUnivEdit();
      return;
    }
    if(action === 'cancel-edit'){
      e.preventDefault();
      if(typeof toggleUnivEdit === 'function') toggleUnivEdit();
    }
  });
}

function openUnivModal(univName){
  if(!univName)return;
  const st = (typeof getUnivDetailState==='function') ? getUnivDetailState() : (window.UnivDetailState||{});
  try{ if(typeof applyUnivLogoVars==='function') applyUnivLogoVars(); }catch(e){}
  document.getElementById('univModalTitle').innerText=`${univName} 대학 상세`;
  document.getElementById('univModalBody').innerHTML=buildUnivDetailHTML(univName);
  injectUnivIcons(document.getElementById('univModalBody'));
  st.currentName=univName;
  st.editOpen=false;
  om('univModal');
  const editBtn=document.getElementById('univEditBtn');
  if(editBtn) editBtn.style.display=isLoggedIn?'inline-flex':'none';
  requestAnimationFrame(()=>{
    const btn=document.getElementById('univEditBtn');
    if(btn) btn.style.display=isLoggedIn?'inline-flex':'none';
  });
}

function toggleUnivEdit(){
  const st = (typeof getUnivDetailState==='function') ? getUnivDetailState() : (window.UnivDetailState||{});
  st.editOpen=!st.editOpen;
  const btn=document.getElementById('univEditBtn');
  if(st.editOpen){
    if(btn) btn.textContent='✕ 닫기';
    const univName=st.currentName;
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
        <input type="text" id="ue-icon" value="${u.icon||''}" placeholder="https://... 이미지 URL" style="flex:1;padding:6px 10px;border-radius:7px;border:1px solid var(--border2);font-size:12px" oninput="const v=this.value.trim();const img=document.getElementById('ue-icon-preview');if(v){img.src=toHttpsUrl(v);img.style.display='block';}else img.style.display='none'">
        <img id="ue-icon-preview" src="${toHttpsUrl(u.icon||'')}" style="width:40px;height:40px;object-fit:contain;border-radius:var(--su_univ_logo_radius,8px);border:1px solid var(--border);${u.icon?'':'display:none'}" onerror="this.style.display='none'">
      </div>
      <div style="font-size:10px;color:var(--gray-l);margin-bottom:12px">현황판·선수 상세에서 대학 로고로 표시됩니다.</div>
      <div style="display:flex;gap:6px">
        <button class="btn btn-b" style="flex:1" data-ua-action="save-edit">💾 저장</button>
        <button class="btn btn-w" data-ua-action="cancel-edit">취소</button>
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
  const st = (typeof getUnivDetailState==='function') ? getUnivDetailState() : (window.UnivDetailState||{});
  const univName=st.currentName;
  const u=univCfg.find(x=>x.name===univName);
  if(!u) return;
  const newName=(document.getElementById('ue-name')?.value||'').trim();
  const newColor=document.getElementById('ue-color')?.value||u.color;
  const newIcon=(document.getElementById('ue-icon')?.value||'').trim();
  if(!newName){alert('이름을 입력하세요.');return;}
  if(newName!==univName){
    players.forEach(p=>{if(p.univ===univName)p.univ=newName;});
    [...(miniM||[]), ...(univM||[]), ...(ckM||[]), ...(proM||[]), ...(comps||[])].forEach(m=>{
      if(m.a===univName)m.a=newName;
      if(m.b===univName)m.b=newName;
      (m.teamAMembers||[]).forEach(x=>{if(x.univ===univName)x.univ=newName;});
      (m.teamBMembers||[]).forEach(x=>{if(x.univ===univName)x.univ=newName;});
    });
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
  st.currentName=newName;
  document.getElementById('univModalTitle').innerText=`${newName} 대학 상세`;
  document.getElementById('univModalBody').innerHTML=buildUnivDetailHTML(newName);
  injectUnivIcons(document.getElementById('univModalBody'));
  st.editOpen=false;
  const btn=document.getElementById('univEditBtn');
  if(btn){ btn.textContent='✏️ 수정'; btn.style.display=isLoggedIn?'inline-flex':'none'; }
}

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

try{
  _bindUnivActionsDelegatedEvents();
  window.openUnivModal = openUnivModal;
  window.toggleUnivEdit = toggleUnivEdit;
  window.saveUnivEdit = saveUnivEdit;
  window.navToMatch = navToMatch;
}catch(e){}
