/* ══════════════════════════════════════
   설정 분리: 맵/약자/상태 아이콘
══════════════════════════════════════ */
function _refreshMapList(){
  const listEl=document.getElementById('map-list');
  if(!listEl){render();return;}
  listEl.innerHTML=maps.map((m,i)=>`<div class="srow">
    <span style="font-size:14px">📍</span>
    <input type="text" value="${m}" style="flex:1" onblur="maps[${i}]=this.value;saveCfg();refreshSel()">
    <button class="btn btn-r btn-xs" onclick="delMap(${i})">🗑️ 삭제</button>
  </div>`).join('');
  document.querySelectorAll('datalist[id^="alias"]').forEach(dl=>{
    dl.innerHTML=maps.map(m=>`<option value="${m}">`).join('');
  });
  refreshSel();
}
function addMap(){
  const inp=document.getElementById('nm');
  const n=(inp?.value||'').trim();
  if(!n)return;
  maps.push(n);save();
  if(inp)inp.value='';
  _refreshMapList();
}
function delMap(i){maps.splice(i,1);save();_refreshMapList();}

function _refreshAliasList(){
  const listEl = document.getElementById('alias-list');
  if(!listEl) return;
  const entries = Object.entries(userMapAlias);
  if(entries.length === 0){
    listEl.innerHTML = '<div style="font-size:12px;color:var(--gray-l);padding:8px 0">아직 추가된 약자가 없습니다.</div>';
    return;
  }
  listEl.innerHTML = entries.filter(([k])=>!k.endsWith('__disabled')).map(([k,v])=>`
    <div class="srow" style="flex-wrap:wrap">
      <code style="background:var(--blue-ll);color:var(--blue);border-radius:5px;padding:2px 10px;font-size:13px;font-weight:700;min-width:44px;text-align:center">${k}</code>
      <span style="color:var(--gray-l)">→</span>
      <input type="text" value="${v}" id="alias-edit-${encodeURIComponent(k)}" list="alias-edit-list-${encodeURIComponent(k)}" autocomplete="off" style="flex:1;min-width:100px;padding:2px 6px;border:1px solid var(--border2);border-radius:5px;font-size:12px" onkeydown="if(event.key==='Enter')editMapAlias(decodeURIComponent('${encodeURIComponent(k)}'),this.value)">
      <datalist id="alias-edit-list-${encodeURIComponent(k)}">${maps.map(m=>`<option value="${m}">`).join('')}</datalist>
      <button class="btn btn-b btn-xs" onclick="editMapAlias(decodeURIComponent('${encodeURIComponent(k)}'),document.getElementById('alias-edit-${encodeURIComponent(k)}').value)">수정</button>
      <button class="btn btn-r btn-xs" data-ak="${encodeURIComponent(k)}" onclick="if(confirm('약자 \''+decodeURIComponent('${encodeURIComponent(k)}')+'\'를 삭제할까요?'))delMapAlias(decodeURIComponent(this.getAttribute('data-ak')))">🗑️ 삭제</button>
    </div>`).join('') || '<div style="font-size:12px;color:var(--gray-l);padding:8px 0">아직 추가된 약자가 없습니다.</div>';
}

function editMapAlias(key, newVal){
  newVal=(newVal||'').trim();
  if(!newVal){alert('맵 이름을 입력하세요.');return;}
  if(key===newVal){alert('약자와 맵 이름이 같습니다.');return;}
  userMapAlias[key]=newVal;
  saveCfg();
  _refreshAliasList();
}

function addMapAlias(){
  const key = (document.getElementById('alias-key')?.value || '').trim();
  const val = (document.getElementById('alias-val')?.value || '').trim();
  const msg = document.getElementById('alias-msg');
  if(!key){ if(msg){msg.style.color='var(--red)';msg.textContent='약자를 입력하세요.';} return; }
  if(!val){ if(msg){msg.style.color='var(--red)';msg.textContent='맵을 선택하세요.';} return; }
  if(key===val){ if(msg){msg.style.color='var(--red)';msg.textContent='약자와 맵 이름이 같습니다.';} return; }
  if(PASTE_MAP_ALIAS_DEFAULT[key] && PASTE_MAP_ALIAS_DEFAULT[key]!==val){
    if(!confirm(`'${key}'는 기본 내장 약자(${PASTE_MAP_ALIAS_DEFAULT[key]})입니다.\n'${val}'으로 덮어쓸까요?`)) return;
  }
  userMapAlias[key]=val;
  saveCfg();
  if(msg){msg.style.color='var(--green)';msg.textContent=`✅ '${key}' → '${val}' 추가됨`;}
  document.getElementById('alias-key').value='';
  document.getElementById('alias-val').value='';
  _refreshAliasList();
}

function delMapAlias(key){
  delete userMapAlias[key];
  saveCfg();
  _refreshAliasList();
}

function restoreDefaultMapAlias(encK){
  const k=decodeURIComponent(encK);
  delete userMapAlias[k+'__disabled'];
  saveCfg(); render();
}

function delDefaultMapAlias(encK, encV){
  const k=decodeURIComponent(encK), v=decodeURIComponent(encV);
  if(!confirm(`기본 약자 '${k}' → '${v}' 를 비활성화할까요?\n(사용자 정의로 덮어쓰거나, 복원하려면 직접 추가하세요)`)) return;
  userMapAlias[k+'__disabled']='1';
  saveCfg(); render();
}

function _renderCfgSiList(){
  const el=document.getElementById('cfg-si-list');
  if(!el)return;
  if(!players.length){el.innerHTML='<div style="padding:20px;text-align:center;color:var(--gray-l)">등록된 선수 없음</div>';return;}
  const iconOptCache=Object.entries(STATUS_ICON_DEFS);
  el.innerHTML=[...players].sort((a,b)=>a.name.localeCompare(b.name,'ko')).map(p=>{
    const cur=playerStatusIcons[p.name]||'';
    const pN=p.name.replace(/\\/g,'\\\\').replace(/'/g,"\\'");
    const encN=encodeURIComponent(p.name);
    const opts=iconOptCache.map(([id,d])=>`<option value="${id}"${(!cur&&id==='none')||(cur&&(cur===id||cur===d.emoji)&&id!=='none')?' selected':''}>${!_siIsImg(d.emoji)&&d.emoji?d.emoji+' ':''}${d.label}</option>`).join('');
    const delBtn=p.photo?`<button onclick="setProfilePhoto('${pN}','')" style="font-size:11px;padding:2px 6px;border-radius:5px;border:1px solid #fca5a5;background:#fff1f2;color:#dc2626;cursor:pointer;flex-shrink:0" title="이미지 삭제">🗑️</button>`:'';
    const clrBtn=cur?`<button onclick="setStatusIcon('${pN}','none');_cfgRefreshSiRow('${pN}')" style="background:none;border:1px solid var(--border2);border-radius:4px;color:#dc2626;cursor:pointer;font-size:12px;padding:2px 7px" title="아이콘 제거">×</button>`:'';
    return `<div style="border-bottom:1px solid var(--border)">
      <div style="display:flex;align-items:center;gap:8px;padding:7px 12px 4px">
        <span id="cfg-photo-wrap-${encN}" style="flex-shrink:0">${getPlayerPhotoHTML(p.name,'32px')}</span>
        <span style="font-weight:600;flex:1;min-width:0;font-size:13px">${p.name}<span style="font-size:10px;color:var(--gray-l);margin-left:4px">${p.univ||''}·${p.tier||''}</span></span>
        <span id="cfg-si-prev-${encN}" style="min-width:26px;text-align:center;display:inline-flex;align-items:center;justify-content:center">${cur?(_siIsImg(cur)?_siRender(cur,'22px'):cur):''}</span>
        <select onchange="setStatusIcon('${pN}',this.value);_cfgRefreshSiRow('${pN}')" style="font-size:12px;padding:3px 6px;border:1px solid var(--border2);border-radius:5px;max-width:120px">${opts}</select>
        <span id="cfg-si-clr-${encN}">${clrBtn}</span>
      </div>
      <div style="display:flex;align-items:center;gap:5px;padding:0 12px 6px 52px">
        <span style="font-size:10px;color:var(--gray-l);white-space:nowrap">🖼️ 프로필</span>
        <input type="text" id="cfg-photo-url-${encN}" placeholder="이미지 URL 입력..." value="${(p.photo||'').replace(/"/g,'&quot;')}" style="flex:1;min-width:0;font-size:11px;padding:2px 6px;border:1px solid var(--border2);border-radius:5px" onkeydown="if(event.key==='Enter')setProfilePhoto('${pN}',this.value)">
        <button onclick="setProfilePhoto('${pN}',document.getElementById('cfg-photo-url-${encN}').value)" style="font-size:11px;padding:2px 8px;border-radius:5px;border:1px solid var(--blue);background:var(--blue-ll);color:var(--blue);cursor:pointer;white-space:nowrap;flex-shrink:0">저장</button>
        ${delBtn}
      </div>
    </div>`;
  }).join('');
}

function _cfgRefreshSiRow(name){
  const encN=encodeURIComponent(name);
  const cur=playerStatusIcons[name]||'';
  const prevEl=document.getElementById('cfg-si-prev-'+encN);
  if(prevEl) prevEl.innerHTML=cur?(_siIsImg(cur)?_siRender(cur,'22px'):cur):'';
  const clrEl=document.getElementById('cfg-si-clr-'+encN);
  if(clrEl){
    const pN=name.replace(/\\/g,'\\\\').replace(/'/g,"\\'");
    clrEl.innerHTML=cur?`<button onclick="setStatusIcon('${pN}','none');_cfgRefreshSiRow('${pN}')" style="background:none;border:1px solid var(--border2);border-radius:4px;color:#dc2626;cursor:pointer;font-size:12px;padding:2px 7px" title="아이콘 제거">×</button>`:'';
  }
}

function setProfilePhoto(name, url){
  const p=players.find(x=>x.name===name);
  if(!p)return;
  const trimmed=(url||'').trim();
  if(trimmed) p.photo=trimmed; else delete p.photo;
  savePhotos();
  const encN=encodeURIComponent(name);
  const wrap=document.getElementById('cfg-photo-wrap-'+encN);
  if(wrap) wrap.innerHTML=getPlayerPhotoHTML(name,'32px');
  const urlInp=document.getElementById('cfg-photo-url-'+encN);
  if(urlInp) urlInp.value=trimmed;
  const row=urlInp&&urlInp.parentElement;
  if(row){
    const delBtn=row.querySelector('button[title="이미지 삭제"]');
    const pN=name.replace(/\\/g,'\\\\').replace(/'/g,"\\'");
    if(trimmed&&!delBtn){
      const b=document.createElement('button');
      b.title='이미지 삭제';
      b.style.cssText='font-size:11px;padding:2px 6px;border-radius:5px;border:1px solid #fca5a5;background:#fff1f2;color:#dc2626;cursor:pointer;flex-shrink:0';
      b.textContent='🗑️';
      b.onclick=()=>setProfilePhoto(pN,'');
      row.appendChild(b);
    } else if(!trimmed&&delBtn){
      delBtn.remove();
    }
  }
}

try{
  window.SettingsModules = window.SettingsModules || {};
  window.SettingsModules.mapStatus = {
    refreshMapList: _refreshMapList,
    refreshAliasList: _refreshAliasList,
    renderStatusIconList: _renderCfgSiList
  };
}catch(e){}
