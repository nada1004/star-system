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
  document.getElementById('univModalTitle').innerHTML=`<span class="detail-main">🎓 ${univName}</span>`;
  document.getElementById('univModalBody').innerHTML=buildUnivDetailHTML(univName);
  injectUnivIcons(document.getElementById('univModalBody'));
  st.currentName=univName;
  st.editOpen=false;
  om('univModal');
  try{ if(typeof window._syncTabUrlFromState==='function') window._syncTabUrlFromState('replace'); }catch(e){}
  const editBtn=document.getElementById('univEditBtn');
  if(editBtn){
    const canEdit = !!(typeof isLoggedIn!=='undefined' && isLoggedIn) && !(typeof isSubAdmin!=='undefined' && isSubAdmin);
    editBtn.style.display=canEdit?'inline-flex':'none';
  }
  requestAnimationFrame(()=>{
    const btn=document.getElementById('univEditBtn');
    if(btn){
      const canEdit = !!(typeof isLoggedIn!=='undefined' && isLoggedIn) && !(typeof isSubAdmin!=='undefined' && isSubAdmin);
      btn.style.display=canEdit?'inline-flex':'none';
    }
  });
}

function toggleUnivEdit(){
  const canEdit = !!(typeof isLoggedIn!=='undefined' && isLoggedIn) && !(typeof isSubAdmin!=='undefined' && isSubAdmin);
  if(!canEdit) return;
  const st = (typeof getUnivDetailState==='function') ? getUnivDetailState() : (window.UnivDetailState||{});
  st.editOpen=!st.editOpen;
  const btn=document.getElementById('univEditBtn');
  if(st.editOpen){
    if(btn) btn.textContent='✕ 닫기';
    const univName=st.currentName;
    const u=univCfg.find(x=>x.name===univName)||{};
    // 펨코스타일 배경(대학별)
    const fem = (function(){
      try{
        const s = (window._cfgFemcoLoad ? window._cfgFemcoLoad() : (JSON.parse(localStorage.getItem('b2_femco_settings_v1')||'{}')||{}));
        const raw = (s && s.univBgMedia && s.univBgMedia[univName]) || '';
        const d = { url:'', alpha:30 };
        if(!raw) return d;
        if(typeof raw === 'string') return { ...d, url: raw };
        if(typeof raw === 'object') return { ...d, url: (raw.url||''), alpha: (raw.alpha==null?30:raw.alpha) };
        return d;
      }catch(e){ return { url:'', alpha:30 }; }
    })();
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
      <div style="padding:12px;background:var(--white);border:1px solid var(--border);border-radius:8px;margin-bottom:12px">
        <div style="font-weight:800;font-size:12px;color:var(--text2);margin-bottom:10px">🖼 대학 상세 헤더 배경</div>
        <label style="font-size:11px;font-weight:700;color:var(--text3);display:block;margin-bottom:4px">배경 이미지 URL <span style="font-size:10px;font-weight:400;color:var(--gray-l)">(비워두면 설정탭 기본값 사용)</span></label>
        <input type="text" id="ue-hbg" value="${u.detailHeaderBgImg||''}" placeholder="https://... 이미지 URL" style="width:100%;margin-bottom:10px;padding:6px 10px;border-radius:7px;border:1px solid var(--border2);font-size:12px;box-sizing:border-box">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
          <div>
            <label style="font-size:11px;font-weight:700;color:var(--text3);display:block;margin-bottom:4px">표시 방식</label>
            <select id="ue-hbg-fit" style="width:100%;padding:6px 10px;border-radius:7px;border:1px solid var(--border2);font-size:12px">
              <option value=""${!u.detailHeaderBgFit?' selected':''}>설정값 따름</option>
              <option value="contain"${u.detailHeaderBgFit==='contain'?' selected':''}>맞춤</option>
              <option value="cover"${u.detailHeaderBgFit==='cover'?' selected':''}>채우기</option>
              <option value="fill"${u.detailHeaderBgFit==='fill'?' selected':''}>늘리기</option>
            </select>
          </div>
          <div>
            <label style="font-size:11px;font-weight:700;color:var(--text3);display:block;margin-bottom:4px">크기 조절</label>
            <div style="display:flex;align-items:center;gap:8px">
              <input type="range" id="ue-hbg-scale" min="40" max="220" step="5" value="${Number(u.detailHeaderBgScale||100)||100}" style="flex:1;accent-color:var(--blue)" oninput="document.getElementById('ue-hbg-scale-val').textContent=this.value+'%'">
              <span id="ue-hbg-scale-val" style="font-size:11px;color:var(--gray-l);min-width:40px;text-align:right;font-weight:700">${Number(u.detailHeaderBgScale||100)||100}%</span>
            </div>
          </div>
        </div>
      </div>
      <div style="padding:12px;background:var(--white);border:1px solid var(--border);border-radius:8px;margin-bottom:12px">
        <div style="font-weight:800;font-size:12px;color:var(--text2);margin-bottom:10px">🧩 펨코스타일 배경 이미지/영상</div>
        <label style="font-size:11px;font-weight:700;color:var(--text3);display:block;margin-bottom:4px">배경 링크(URL) <span style="font-size:10px;font-weight:400;color:var(--gray-l)">(펨코스타일 대학 카드 배경)</span></label>
        <input type="text" id="ue-femco-bg-url" value="${(fem.url||'').replace(/\"/g,'&quot;')}" placeholder="https://... (jpg/png/gif/webp/mp4/유튜브/트위치)" style="width:100%;margin-bottom:10px;padding:6px 10px;border-radius:7px;border:1px solid var(--border2);font-size:12px;box-sizing:border-box">
        <label style="font-size:11px;font-weight:700;color:var(--text3);display:block;margin-bottom:4px">투명도</label>
        <div style="display:flex;align-items:center;gap:8px">
          <input type="range" id="ue-femco-bg-alpha" min="0" max="100" step="1" value="${Math.max(0,Math.min(100,parseInt(fem.alpha||30,10)||30))}" style="flex:1;accent-color:var(--blue)"
            oninput="document.getElementById('ue-femco-bg-alpha-val').textContent=this.value+'%'">
          <span id="ue-femco-bg-alpha-val" style="font-size:11px;color:var(--gray-l);min-width:40px;text-align:right;font-weight:700">${Math.max(0,Math.min(100,parseInt(fem.alpha||30,10)||30))}%</span>
        </div>
        <div style="font-size:10px;color:var(--gray-l);margin-top:8px;line-height:1.45">
          • 이미지/GIF: 대학 카드 배경으로 적용<br>
          • MP4/WEBM: “배경영상” 버튼 표시(클릭 재생)<br>
          • 유튜브/트위치: “배경링크” 버튼 표시(새창)
        </div>
      </div>
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
  const canEdit = !!(typeof isLoggedIn!=='undefined' && isLoggedIn) && !(typeof isSubAdmin!=='undefined' && isSubAdmin);
  if(!canEdit) return;
  const st = (typeof getUnivDetailState==='function') ? getUnivDetailState() : (window.UnivDetailState||{});
  const univName=st.currentName;
  const u=univCfg.find(x=>x.name===univName);
  if(!u) return;
  const newName=(document.getElementById('ue-name')?.value||'').trim();
  const newColor=document.getElementById('ue-color')?.value||u.color;
  const newIcon=(document.getElementById('ue-icon')?.value||'').trim();
  const newHdrBg=(document.getElementById('ue-hbg')?.value||'').trim();
  const newHdrFit=(document.getElementById('ue-hbg-fit')?.value||'').trim();
  const newHdrScale=parseInt(document.getElementById('ue-hbg-scale')?.value||'100',10)||100;
  const femcoBgUrl=(document.getElementById('ue-femco-bg-url')?.value||'').trim();
  const femcoBgAlpha=parseInt(document.getElementById('ue-femco-bg-alpha')?.value||'30',10);
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
  if(newHdrBg) u.detailHeaderBgImg=newHdrBg; else delete u.detailHeaderBgImg;
  if(newHdrFit) u.detailHeaderBgFit=newHdrFit; else delete u.detailHeaderBgFit;
  if(newHdrBg) u.detailHeaderBgScale=newHdrScale; else delete u.detailHeaderBgScale;
  // 펨코스타일 배경(대학별): b2_femco_settings_v1.univBgMedia[대학명]
  try{
    const load = window._cfgFemcoLoad ? window._cfgFemcoLoad : ()=>{ try{return JSON.parse(localStorage.getItem('b2_femco_settings_v1')||'{}')||{};}catch(e){return {}; } };
    const save = window._cfgFemcoSave ? window._cfgFemcoSave : (obj)=>{ try{ localStorage.setItem('b2_femco_settings_v1', JSON.stringify(obj||{})); }catch(e){} };
    const s = load();
    s.univBgMedia = s.univBgMedia || {};
    const nm = newName || univName;
    if(!femcoBgUrl){
      delete s.univBgMedia[nm];
    }else{
      const prev = s.univBgMedia[nm];
      const base = (prev && typeof prev==='object') ? prev : (prev && typeof prev==='string' ? {url:prev} : {});
      s.univBgMedia[nm] = { ...base, url:femcoBgUrl, alpha: Math.max(0,Math.min(100,isNaN(femcoBgAlpha)?30:femcoBgAlpha)) };
    }
    save(s);
    // (기기 동기화) prefs 변경으로 기록 + (옵션) 자동 저장
    try{ if(window.SettingsStore && typeof window.SettingsStore.markPrefsChanged==='function') window.SettingsStore.markPrefsChanged(); }catch(e){}
  }catch(e){}
  save();render();
  st.currentName=newName;
  document.getElementById('univModalTitle').innerHTML=`<span class="detail-main">🎓 ${newName}</span>`;
  document.getElementById('univModalBody').innerHTML=buildUnivDetailHTML(newName);
  injectUnivIcons(document.getElementById('univModalBody'));
  st.editOpen=false;
  const btn=document.getElementById('univEditBtn');
  if(btn){
    const canEdit = !!(typeof isLoggedIn!=='undefined' && isLoggedIn) && !(typeof isSubAdmin!=='undefined' && isSubAdmin);
    btn.textContent='✏️ 수정';
    btn.style.display=canEdit?'inline-flex':'none';
  }
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
