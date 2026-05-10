/* ══════════════════════════════════════
   선수 CRUD
══════════════════════════════════════ */
// 등록 타입 변경 시 폼 필드 동적 표시/숨김
function onRegTypeChange() {
  const type = document.getElementById('p-reg-type')?.value || 'starcraft';
  const scFields = ['p-univ','p-tier','p-race'];
  const genderField = document.getElementById('p-gender');
  const displayNameField = document.getElementById('p-display-name');

  // 스타크래프트 전용 필드
  scFields.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.style.display = (type === 'starcraft') ? '' : 'none';
  });

  // 성별/프로필이름 (종합게임)
  if (genderField) genderField.style.display = (type === 'general') ? '' : 'none';
  if (displayNameField) displayNameField.style.display = (type === 'general') ? '' : 'none';
}

function addPlayer(){
  const n=document.getElementById('p-name').value.trim();
  if(!n)return alert('이름을 입력하세요.');
  if(players.find(p=>p.name===n)&&!confirm(`"${n}" 이름이 이미 있습니다.\n동명이인으로 등록할까요?`))return;
  const _pRegType=(document.getElementById('p-reg-type')?.value||'starcraft');
  const _pRole=(document.getElementById('p-role')?.value||'').trim();
  const _pPhoto=(document.getElementById('p-photo')?.value||'').trim();
  const _pDisplayName=(document.getElementById('p-display-name')?.value||'').trim();
  if(_pPhoto){
    if(_pPhoto.startsWith('data:')){alert('base64 이미지 직접 입력 불가 — imgur.com 등에 업로드 후 URL 사용');return;}
    if(_pPhoto.length>2000&&!confirm(`이미지 URL이 매우 깁니다 (${_pPhoto.length}자). 계속할까요?`))return;
  }
  const _pHideBoard=document.getElementById('p-hide-board')?.checked||false;
  const _pGender=document.getElementById('p-gender')?.value||'M';

  let playerData;

  if(_pRegType==='starcraft'){
    // 순수 스타크래프트 스트리머
    playerData={name:n,univ:document.getElementById('p-univ').value,tier:document.getElementById('p-tier').value,
      race:document.getElementById('p-race').value,gender:_pGender,role:_pRole||undefined,
      photo:_pPhoto||undefined,hideFromBoard:_pHideBoard||undefined,
      gameType:'starcraft',win:0,loss:0,points:0,history:[]};

  } else if(_pRegType==='general'){
    // 종합게임 스트리머
    playerData={name:n,gender:_pGender,role:_pRole||undefined,
      photo:_pPhoto||undefined,displayName:_pDisplayName||undefined,
      hideFromBoard:_pHideBoard||undefined,
      gameType:'종합게임',
      win:0,loss:0,points:0,history:[]};
  } else {
    playerData={name:n,univ:'무소속',gender:_pGender,role:_pRole||undefined,
      photo:_pPhoto||undefined,hideFromBoard:_pHideBoard||undefined,
      gameType:'starcraft',win:0,loss:0,points:0,history:[]};
  }

  players.push(playerData);
  document.getElementById('p-name').value='';
  document.getElementById('p-photo').value='';
  if(document.getElementById('p-display-name')) document.getElementById('p-display-name').value='';
  document.getElementById('p-hide-board').checked=false;
  save();render();
}
function bulkAddPlayers(){
  if(!isLoggedIn){alert('관리자만 사용 가능합니다.');return;}
  const raw=document.getElementById('bulk-player-input')?.value||'';
  const lines=raw.split('\n').map(l=>l.trim()).filter(Boolean);
  if(!lines.length){alert('등록할 스트리머를 입력하세요.');return;}
  const RACES=new Set(['T','Z','P','N']);
  const TIER_SET=new Set(typeof TIERS!=='undefined'?TIERS:['G','K','JA','J','S']);
  let added=0;const skipped=[];
  lines.forEach(line=>{
    const parts=line.split(/\s+/);
    if(!parts[0])return;
    const name=parts[0];
    let race='T',tier='',showOnBoard=false,gender='M';
    const univParts=[];
    parts.slice(1).forEach(tok=>{
      if(tok.toLowerCase()==='show'){showOnBoard=true;return;}
      if(tok.toLowerCase()==='hide'){return;} // hide는 기본값이므로 무시
      if(tok==='남자'||tok.toUpperCase()==='M'){gender='M';return;}
      if(tok==='여자'||tok.toUpperCase()==='F'){gender='F';return;}
      if(RACES.has(tok.toUpperCase())){race=tok.toUpperCase();return;}
      if(TIER_SET.has(tok)){tier=tok;return;}
      univParts.push(tok);
    });
    const univ=univParts.join(' ')||'무소속';
    if(players.find(p=>p.name===name)){skipped.push(name);return;}
    players.push({name,univ,tier:tier||'미정',race,gender,hideFromBoard:showOnBoard?undefined:true,win:0,loss:0,points:0,history:[]});
    added++;
  });
  if(added>0){save();render();}
  const resultEl=document.getElementById('bulk-player-result');
  if(resultEl){
    let msg=`✅ ${added}명 등록 완료`;
    if(skipped.length)msg+=`\n⚠️ 중복 스킵 (${skipped.length}명): ${skipped.join(', ')}`;
    resultEl.innerHTML=msg.replace('\n','<br>');
    resultEl.style.display='block';
    if(added>0)document.getElementById('bulk-player-input').value='';
  }
}
window.openEP=function(name){
  editName=name;const p=players.find(x=>x.name===name);
  if(!p) return;
  // 개인/끝장전 배경형 선수 카드: 스트리머별 배경 위치 저장값
  const _h2hPosMap = (()=>{ try{ return JSON.parse(localStorage.getItem('su_h2h_player_bgpos')||'{}')||{}; }catch(e){ return {}; } })();
  const _h2hPos = _h2hPosMap[p.name] || { x:50, y:50 };
  const _h2hX = (()=>{ const n=parseInt(_h2hPos.x??'50',10); return isNaN(n)?50:Math.max(0,Math.min(100,n)); })();
  const _h2hY = (()=>{ const n=parseInt(_h2hPos.y??'50',10); return isNaN(n)?50:Math.max(0,Math.min(100,n)); })();
  const _h2hFit = (()=>{ try{ return (localStorage.getItem('su_h2h_panel_fit')||'cover').trim(); }catch(e){ return 'cover'; } })();
  const _h2hBgSize = _h2hFit==='fill' ? '100% 100%' : (_h2hFit==='contain' ? 'contain' : 'cover');
  const _p1X = (()=>{ const n=parseInt(p.photoPosX??'50',10); return isNaN(n)?50:Math.max(0,Math.min(100,n)); })();
  const _p1Y = (()=>{ const n=parseInt(p.photoPosY??'50',10); return isNaN(n)?50:Math.max(0,Math.min(100,n)); })();
  const _p2X = (()=>{ const n=parseInt(p.photo2PosX??'50',10); return isNaN(n)?50:Math.max(0,Math.min(100,n)); })();
  const _p2Y = (()=>{ const n=parseInt(p.photo2PosY??'50',10); return isNaN(n)?50:Math.max(0,Math.min(100,n)); })();
  const _p1Use = (p.photoPosUse !== false);
  const _p2Use = (p.photo2PosUse !== false);
  document.getElementById('emBody').innerHTML=`
    <label>스트리머 이름</label><input type="text" id="ed-n" value="${p.name}">
    <label>티어</label><select id="ed-t">${TIERS.map(t=>`<option value="${t}"${p.tier===t?' selected':''}>${getTierLabel(t)}</option>`).join('')}</select>
    <label>대학</label>
    <div style="display:flex;gap:6px;align-items:center">
      <select id="ed-u" style="flex:1">${getAllUnivs().filter(u=>!u.dissolved||u.name===p.univ).map(u=>`<option value="${u.name}"${p.univ===u.name?' selected':''}>${u.name}</option>`).join('')}</select>
      ${p.univ!=='무소속'?`<button type="button" onclick="document.getElementById('ed-u').value='무소속'" style="flex-shrink:0;padding:4px 10px;border-radius:7px;border:1.5px solid #9ca3af;background:var(--surface);color:#6b7280;font-size:11px;font-weight:700;cursor:pointer;white-space:nowrap">🚶 무소속</button>`:''}
    </div>
    <label>종족</label><select id="ed-r"><option value="T"${p.race==='T'?' selected':''}>테란</option><option value="Z"${p.race==='Z'?' selected':''}>저그</option><option value="P"${p.race==='P'?' selected':''}>프로토스</option><option value="N"${p.race==='N'?' selected':''}>종족미정</option></select>
    <label>성별</label><select id="ed-g"><option value="F"${(p.gender||'F')==='F'?' selected':''}>👩 여자</option><option value="M"${p.gender==='M'?' selected':''}>👨 남자</option></select>
    <label>직책 <span style="font-size:10px;font-weight:400;color:var(--gray-l)">(이사장/선장/동아리장/반장/총장/부총장/총괄/교수/코치는 정렬 우선순위 적용)</span></label>
    <div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:6px">
      ${MAIN_ROLES.map(r=>{const ic=ROLE_ICONS[r]||'🏷️';const col=ROLE_COLORS[r]||'#6b7280';return `<button type="button" onclick="const el=document.getElementById('ed-role');el.value=el.value===this.dataset.role?'':this.dataset.role;" data-role="${r}" style="padding:3px 8px;border-radius:6px;border:1.5px solid ${col};background:${p.role===r?col+'22':'var(--white)'};color:${col};font-size:11px;font-weight:700;cursor:pointer">${ic} ${r}</button>`;}).join('')}
      <button type="button" onclick="document.getElementById('ed-role').value=''" style="padding:3px 8px;border-radius:6px;border:1.5px solid #9ca3af;background:var(--white);color:#9ca3af;font-size:11px;font-weight:700;cursor:pointer">✕ 없음</button>
    </div>
    <input type="text" id="ed-role" value="${p.role||''}" placeholder="직책 직접 입력 또는 위 버튼 클릭" style="width:100%">
    <label>🖼 프로필 사진 URL <span style="font-size:10px;font-weight:400;color:var(--gray-l)">(현황판 카드에 표시 · 비워두면 기본 아이콘)</span></label>
    <div style="display:flex;gap:8px;align-items:center">
      <input type="text" id="ed-photo" value="${p.photo||''}" placeholder="https://... 이미지 URL 입력" style="flex:1" oninput="(function(el){const v=el.value.trim();const img=document.getElementById('ed-photo-preview');const warn=document.getElementById('ed-photo-warn');if(v&&v.startsWith('data:')){el.style.borderColor='#dc2626';if(warn){warn.style.color='#dc2626';warn.textContent='❌ base64 이미지 직접 입력 불가 — imgur.com 등에 업로드 후 URL 사용';}}else{el.style.borderColor='';if(warn){warn.textContent='이미지 URL을 붙여넣으면 현황판 선수 카드에 프로필 사진이 표시됩니다.';warn.style.color='var(--gray-l)';}}const wrap=document.getElementById('ed-photo-preview-wrap');if(v&&!v.startsWith('data:')){img.src=v;img.style.display='block';if(wrap)wrap.style.display='inline-block';}else{if(wrap)wrap.style.display='none';}})(this)">
      <span id="ed-photo-preview-wrap" style="position:relative;width:40px;height:40px;border-radius:var(--su_profile_radius,50%);overflow:hidden;flex-shrink:0;background:#e2e8f0;border:2px solid var(--border);display:${p.photo&&!p.photo.startsWith('data:')?'inline-block':'none'}">
        <img id="ed-photo-preview" src="${p.photo&&!p.photo.startsWith('data:')?toHttpsUrl(p.photo):''}" style="width:40px;height:40px;object-fit:cover;display:block" onerror="this.style.display='none';const w=document.getElementById('ed-photo-warn');if(w){w.style.color='#d97706';w.textContent='⚠️ 이미지를 불러올 수 없습니다. 다른 도메인에서 차단됐거나 URL이 잘못됐을 수 있습니다.';}">
      </span>
    </div>
    <div id="ed-photo-warn" style="font-size:10px;color:${p.photo&&p.photo.startsWith('data:')?'#dc2626':'var(--gray-l)'};margin-top:-6px">${p.photo&&p.photo.startsWith('data:')?'❌ base64 이미지 직접 입력 불가 — imgur.com 등에 업로드 후 URL 사용':'이미지 URL을 붙여넣으면 현황판 선수 카드에 프로필 사진이 표시됩니다.'}</div>

    <div style="margin-top:10px;padding:12px;background:var(--surface);border:1px solid var(--border);border-radius:10px">
      <div style="font-weight:900;font-size:12px;color:var(--text2);margin-bottom:6px">🖼 프로필 사진 1 — 얼굴 위치(자르기 보정)</div>
      <div style="font-size:11px;color:var(--gray-l);line-height:1.6;margin-bottom:10px">
        (채우기/cover 사용 시) 얼굴이 잘리면 아래 미리보기에서 <b>드래그</b>하거나 X/Y로 위치를 보정할 수 있습니다.
      </div>
      <label style="display:flex;align-items:center;gap:6px;font-size:11px;font-weight:900;color:var(--text3);margin:-2px 0 10px">
        <input type="checkbox" id="ed-p1pos-use" ${_p1Use?'checked':''} onchange="document.getElementById('ed-p1pos-prev').style.opacity=this.checked?1:.55">
        이 보정 적용(체크 해제 시 기존 설정 사용)
      </label>
      <input type="hidden" id="ed-p1pos-del" value="0">
      <div id="ed-p1pos-prev" style="position:relative;height:150px;border-radius:16px;overflow:hidden;border:1.5px solid var(--border);background:linear-gradient(135deg, rgba(100,116,139,.26), rgba(100,116,139,.10));touch-action:none;user-select:none;opacity:${_p1Use?1:.55}">
        ${p.photo?`<img id="ed-p1pos-img" src="${toHttpsUrl(p.photo).replace(/\"/g,'&quot;')}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:${_p1X}% ${_p1Y}%;transform:scale(1.02)" onerror="this.style.display='none'">`:''}
        <div style="position:absolute;inset:0;background:linear-gradient(180deg, rgba(15,23,42,.04) 0%, rgba(15,23,42,.10) 60%, rgba(15,23,42,.22) 100%)"></div>
        <div style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:18px;height:18px;border-radius:999px;border:2px solid rgba(255,255,255,.9);box-shadow:0 2px 10px rgba(0,0,0,.35);pointer-events:none"></div>
        <div style="position:absolute;left:50%;top:0;bottom:0;width:1px;background:rgba(255,255,255,.35);pointer-events:none"></div>
        <div style="position:absolute;top:50%;left:0;right:0;height:1px;background:rgba(255,255,255,.35);pointer-events:none"></div>
      </div>
      <div style="display:grid;grid-template-columns:90px 1fr 52px;gap:10px;align-items:center;margin-top:10px">
        <div style="font-size:12px;font-weight:800;color:var(--text2)">가로(X)</div>
        <input type="range" id="ed-p1pos-x" min="0" max="100" step="1" value="${_p1X}" oninput="edP1PosSyncFromInputs()" style="width:100%">
        <div id="ed-p1pos-xv" style="font-size:11px;color:var(--gray-l);font-weight:900;text-align:right">${_p1X}%</div>
      </div>
      <div style="display:grid;grid-template-columns:90px 1fr 52px;gap:10px;align-items:center;margin-top:6px">
        <div style="font-size:12px;font-weight:800;color:var(--text2)">세로(Y)</div>
        <input type="range" id="ed-p1pos-y" min="0" max="100" step="1" value="${_p1Y}" oninput="edP1PosSyncFromInputs()" style="width:100%">
        <div id="ed-p1pos-yv" style="font-size:11px;color:var(--gray-l);font-weight:900;text-align:right">${_p1Y}%</div>
      </div>
      <div style="display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end;margin-top:10px">
        <button type="button" class="btn btn-w btn-xs" onclick="edP1PosCenter()">센터(50/50)</button>
        <button type="button" class="btn btn-w btn-xs" onclick="edP1PosDelete()">삭제(기본)</button>
      </div>
    </div>

    <div style="margin-top:10px;padding:12px;background:var(--surface);border:1px solid var(--border);border-radius:10px">
      <div style="font-weight:900;font-size:12px;color:var(--text2);margin-bottom:6px">🎯 개인/끝장전 카드 — 얼굴 위치(배경)</div>
      <div style="font-size:11px;color:var(--gray-l);line-height:1.6;margin-bottom:10px">
        채우기(cover)에서 얼굴이 잘리는 경우, 아래 미리보기에서 <b>드래그</b>하거나 X/Y로 위치를 보정할 수 있습니다. (개인전/끝장전/프로리그 끝장전 적용)
      </div>
      <input type="hidden" id="ed-h2hpos-del" value="0">
      <div id="ed-h2hpos-prev" style="position:relative;height:150px;border-radius:16px;overflow:hidden;border:1.5px solid var(--border);background:${p.photo?`url('${toHttpsUrl(p.photo)}')`:'linear-gradient(135deg, rgba(100,116,139,.26), rgba(100,116,139,.10))'};background-size:${_h2hBgSize};background-position:${_h2hX}% ${_h2hY}%;background-repeat:no-repeat;touch-action:none;user-select:none">
        <div style="position:absolute;inset:0;background:linear-gradient(180deg, rgba(15,23,42,.06) 0%, rgba(15,23,42,.32) 60%, rgba(15,23,42,.78) 100%)"></div>
        <div style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:18px;height:18px;border-radius:999px;border:2px solid rgba(255,255,255,.9);box-shadow:0 2px 10px rgba(0,0,0,.35);pointer-events:none"></div>
        <div style="position:absolute;left:50%;top:0;bottom:0;width:1px;background:rgba(255,255,255,.35);pointer-events:none"></div>
        <div style="position:absolute;top:50%;left:0;right:0;height:1px;background:rgba(255,255,255,.35);pointer-events:none"></div>
        <div style="position:absolute;left:0;right:0;bottom:0;padding:10px 12px;z-index:1;text-align:center">
          <div style="font-weight:1000;font-size:16px;line-height:1.1;color:#fff;text-shadow:0 2px 10px rgba(0,0,0,.45)">${p.name}</div>
          <div style="font-size:11px;font-weight:800;color:rgba(255,255,255,.86);text-shadow:0 2px 10px rgba(0,0,0,.35)">${p.univ||''}</div>
          <div style="margin-top:4px;display:flex;gap:6px;align-items:center;justify-content:center;flex-wrap:wrap">
            ${(p.race&&p.race!=='N')?`<span class="rbadge r${p.race}" style="transform:scale(.92);transform-origin:center">${p.race}</span>`:''}
            ${p.tier?`<span style="transform:scale(.92);transform-origin:center">${getTierBadge(p.tier)}</span>`:''}
          </div>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:90px 1fr 52px;gap:10px;align-items:center;margin-top:10px">
        <div style="font-size:12px;font-weight:800;color:var(--text2)">가로(X)</div>
        <input type="range" id="ed-h2hpos-x" min="0" max="100" step="1" value="${_h2hX}"
          oninput="edH2HPosSyncFromInputs()" style="width:100%">
        <div id="ed-h2hpos-xv" style="font-size:11px;color:var(--gray-l);font-weight:900;text-align:right">${_h2hX}%</div>
      </div>
      <div style="display:grid;grid-template-columns:90px 1fr 52px;gap:10px;align-items:center;margin-top:6px">
        <div style="font-size:12px;font-weight:800;color:var(--text2)">세로(Y)</div>
        <input type="range" id="ed-h2hpos-y" min="0" max="100" step="1" value="${_h2hY}"
          oninput="edH2HPosSyncFromInputs()" style="width:100%">
        <div id="ed-h2hpos-yv" style="font-size:11px;color:var(--gray-l);font-weight:900;text-align:right">${_h2hY}%</div>
      </div>
      <div style="display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end;margin-top:10px">
        <button type="button" class="btn btn-w btn-xs" onclick="edH2HPosCenter()">센터(50/50)</button>
        <button type="button" class="btn btn-w btn-xs" onclick="edH2HPosDelete()">삭제(기본)</button>
        <button type="button" class="btn btn-b btn-xs" onclick="edH2HPosSave()">저장</button>
      </div>
      <div id="ed-h2hpos-msg" style="display:none;margin-top:6px;font-size:11px;color:var(--green);font-weight:900;text-align:right">저장됨!</div>
    </div>

    <label>🖼 프로필 이미지 2 <span style="font-size:10px;font-weight:400;color:var(--gray-l)">(모바일/교체용 · 1초 후 자동 전환)</span></label>
    <input type="text" id="ed-photo2" value="${p.secondProfileFile||''}" placeholder="https://... 이미지 URL 입력" style="width:100%">
    <div style="font-size:10px;color:var(--gray-l);margin-top:-6px">현황판 등에서 보조 프로필 이미지로 사용됩니다.</div>

    <div style="margin-top:10px;padding:12px;background:var(--surface);border:1px solid var(--border);border-radius:10px">
      <div style="font-weight:900;font-size:12px;color:var(--text2);margin-bottom:6px">🖼 프로필 사진 2 — 얼굴 위치(자르기 보정)</div>
      <div style="font-size:11px;color:var(--gray-l);line-height:1.6;margin-bottom:10px">프로필 2도 필요하면 위치를 저장할 수 있습니다.</div>
      <label style="display:flex;align-items:center;gap:6px;font-size:11px;font-weight:900;color:var(--text3);margin:-2px 0 10px">
        <input type="checkbox" id="ed-p2pos-use" ${_p2Use?'checked':''} onchange="document.getElementById('ed-p2pos-prev').style.opacity=this.checked?1:.55">
        이 보정 적용(체크 해제 시 기존 설정 사용)
      </label>
      <input type="hidden" id="ed-p2pos-del" value="0">
      <div id="ed-p2pos-prev" style="position:relative;height:150px;border-radius:16px;overflow:hidden;border:1.5px solid var(--border);background:linear-gradient(135deg, rgba(100,116,139,.26), rgba(100,116,139,.10));touch-action:none;user-select:none;opacity:${_p2Use?1:.55}">
        ${p.secondProfileFile?`<img id="ed-p2pos-img" src="${toHttpsUrl(p.secondProfileFile).replace(/\"/g,'&quot;')}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:${_p2X}% ${_p2Y}%;transform:scale(1.02)" onerror="this.style.display='none'">`:''}
        <div style="position:absolute;inset:0;background:linear-gradient(180deg, rgba(15,23,42,.04) 0%, rgba(15,23,42,.10) 60%, rgba(15,23,42,.22) 100%)"></div>
        <div style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:18px;height:18px;border-radius:999px;border:2px solid rgba(255,255,255,.9);box-shadow:0 2px 10px rgba(0,0,0,.35);pointer-events:none"></div>
        <div style="position:absolute;left:50%;top:0;bottom:0;width:1px;background:rgba(255,255,255,.35);pointer-events:none"></div>
        <div style="position:absolute;top:50%;left:0;right:0;height:1px;background:rgba(255,255,255,.35);pointer-events:none"></div>
      </div>
      <div style="display:grid;grid-template-columns:90px 1fr 52px;gap:10px;align-items:center;margin-top:10px">
        <div style="font-size:12px;font-weight:800;color:var(--text2)">가로(X)</div>
        <input type="range" id="ed-p2pos-x" min="0" max="100" step="1" value="${_p2X}" oninput="edP2PosSyncFromInputs()" style="width:100%">
        <div id="ed-p2pos-xv" style="font-size:11px;color:var(--gray-l);font-weight:900;text-align:right">${_p2X}%</div>
      </div>
      <div style="display:grid;grid-template-columns:90px 1fr 52px;gap:10px;align-items:center;margin-top:6px">
        <div style="font-size:12px;font-weight:800;color:var(--text2)">세로(Y)</div>
        <input type="range" id="ed-p2pos-y" min="0" max="100" step="1" value="${_p2Y}" oninput="edP2PosSyncFromInputs()" style="width:100%">
        <div id="ed-p2pos-yv" style="font-size:11px;color:var(--gray-l);font-weight:900;text-align:right">${_p2Y}%</div>
      </div>
      <div style="display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end;margin-top:10px">
        <button type="button" class="btn btn-w btn-xs" onclick="edP2PosCenter()">센터(50/50)</button>
        <button type="button" class="btn btn-w btn-xs" onclick="edP2PosDelete()">삭제(기본)</button>
      </div>
    </div>
    <label>🏠 방송국 홈 URL <span style="font-size:10px;font-weight:400;color:var(--gray-l)">(홈 아이콘 클릭 시 이동)</span></label>
    <div style="display:flex;gap:8px;align-items:center">
      <input type="text" id="ed-channel" value="${p.channelUrl||''}" placeholder="https://chzzk.naver.com/... 또는 https://twitch.tv/..." style="flex:1">
      ${p.channelUrl?`<a href="${p.channelUrl}" target="_blank" style="font-size:18px;text-decoration:none" title="방송국 바로가기">🏠</a>`:''}
    </div>
    <div style="font-size:10px;color:var(--gray-l);margin-top:-6px">치지직/트위치/유튜브 등 방송국 주소. 스트리머 상세에서 홈 아이콘으로 이동됩니다.</div>
    <div style="margin-top:14px;padding:12px;background:var(--surface);border:1px solid var(--border);border-radius:8px">
      <div style="font-weight:800;font-size:12px;color:var(--text2);margin-bottom:10px">🖼 스트리머 상세 헤더 배경</div>
      <label>배경 이미지 URL <span style="font-size:10px;font-weight:400;color:var(--gray-l)">(비워두면 설정탭 기본값 사용)</span></label>
      <input type="text" id="ed-phbg" value="${p.detailHeaderBgImg||''}" placeholder="https://... 이미지 URL">
      <div id="ed-phbg-prev" style="position:relative;height:150px;border-radius:16px;overflow:hidden;border:1.5px solid var(--border);margin-top:10px;background:linear-gradient(135deg, rgba(100,116,139,.26), rgba(100,116,139,.10));touch-action:none;user-select:none">
        ${(p.detailHeaderBgImg||'').trim()?`<div id="ed-phbg-prev-bg" style="position:absolute;inset:-8%;background-image:url('${toHttpsUrl((p.detailHeaderBgImg||'').trim()).replace(/'/g,'%27')}');background-repeat:no-repeat;background-position:${Number(p.detailHeaderBgPosX??50)||50}% ${Number(p.detailHeaderBgPosY??50)||50}%;background-size:${(p.detailHeaderBgFit||'')==='fill'?'100% 100%':((p.detailHeaderBgFit||'')==='cover'?'cover':'contain')};transform:scale(${Math.max(40,Math.min(220,Number(p.detailHeaderBgScale||100)||100))/100});transform-origin:center center;opacity:.85;pointer-events:none"></div>`:''}
        <div style="position:absolute;inset:0;background:linear-gradient(180deg, rgba(15,23,42,.04) 0%, rgba(15,23,42,.10) 60%, rgba(15,23,42,.22) 100%);pointer-events:none"></div>
        <div style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:18px;height:18px;border-radius:999px;border:2px solid rgba(255,255,255,.9);box-shadow:0 2px 10px rgba(0,0,0,.35);pointer-events:none"></div>
        <div style="position:absolute;left:50%;top:0;bottom:0;width:1px;background:rgba(255,255,255,.35);pointer-events:none"></div>
        <div style="position:absolute;top:50%;left:0;right:0;height:1px;background:rgba(255,255,255,.35);pointer-events:none"></div>
        <div style="position:absolute;left:10px;top:10px;z-index:1;font-size:11px;font-weight:900;color:rgba(255,255,255,.82);text-shadow:0 2px 8px rgba(0,0,0,.35);pointer-events:none">드래그로 위치 조정</div>
        ${!(p.detailHeaderBgImg||'').trim()?`<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:900;color:rgba(15,23,42,.55)">URL을 입력하면 미리보기가 표시됩니다</div>`:''}
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:10px">
        <div>
          <label>표시 방식</label>
          <select id="ed-phbg-fit" onchange="edPhbgSyncFromInputs()">
            <option value=""${!p.detailHeaderBgFit?' selected':''}>설정값 따름</option>
            <option value="contain"${p.detailHeaderBgFit==='contain'?' selected':''}>맞춤</option>
            <option value="cover"${p.detailHeaderBgFit==='cover'?' selected':''}>채우기</option>
            <option value="fill"${p.detailHeaderBgFit==='fill'?' selected':''}>늘리기</option>
          </select>
        </div>
        <div>
          <label>크기 조절</label>
          <div style="display:flex;align-items:center;gap:8px">
            <input type="range" id="ed-phbg-scale" min="40" max="220" step="5" value="${Number(p.detailHeaderBgScale||100)||100}" style="flex:1;accent-color:var(--blue)" oninput="document.getElementById('ed-phbg-scale-val').textContent=this.value+'%'; edPhbgSyncFromInputs()">
            <span id="ed-phbg-scale-val" style="font-size:11px;color:var(--gray-l);min-width:40px;text-align:right;font-weight:700">${Number(p.detailHeaderBgScale||100)||100}%</span>
          </div>
        </div>
      </div>
      <div style="font-size:11px;font-weight:700;color:var(--text3);margin:10px 0 6px">이미지 위치</div>
      <div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px">
        ${[
          ['left top','↖ 좌상'],['center top','↑ 상단'],['right top','↗ 우상'],
          ['left center','← 좌중'],['center center','• 중앙'],['right center','→ 우중'],
          ['left bottom','↙ 좌하'],['center bottom','↓ 하단'],['right bottom','↘ 우하']
        ].map(([pos,label])=>`<button type="button" data-phbg-pos="${pos}" class="btn btn-xs ${(p.detailHeaderBgPos||'center center')===pos?'btn-b':'btn-w'}"
          onclick="document.getElementById('ed-phbg-pos').value='${pos}'; document.querySelectorAll('[data-phbg-pos]').forEach(el=>el.className='btn btn-xs btn-w'); this.className='btn btn-xs btn-b';">${label}</button>`).join('')}
      </div>
      <input type="hidden" id="ed-phbg-pos" value="${p.detailHeaderBgPos||'center center'}">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:10px">
        <div>
          <label>가로 미세 위치</label>
          <div style="display:flex;align-items:center;gap:8px">
            <input type="range" id="ed-phbg-posx" min="0" max="100" step="1" value="${Number(p.detailHeaderBgPosX??50)||50}" style="flex:1;accent-color:var(--blue)" oninput="document.getElementById('ed-phbg-posx-val').textContent=this.value+'%'; edPhbgSyncFromInputs()">
            <span id="ed-phbg-posx-val" style="font-size:11px;color:var(--gray-l);min-width:40px;text-align:right;font-weight:700">${Number(p.detailHeaderBgPosX??50)||50}%</span>
          </div>
        </div>
        <div>
          <label>세로 미세 위치</label>
          <div style="display:flex;align-items:center;gap:8px">
            <input type="range" id="ed-phbg-posy" min="0" max="100" step="1" value="${Number(p.detailHeaderBgPosY??50)||50}" style="flex:1;accent-color:var(--blue)" oninput="document.getElementById('ed-phbg-posy-val').textContent=this.value+'%'; edPhbgSyncFromInputs()">
            <span id="ed-phbg-posy-val" style="font-size:11px;color:var(--gray-l);min-width:40px;text-align:right;font-weight:700">${Number(p.detailHeaderBgPosY??50)||50}%</span>
          </div>
        </div>
      </div>
    </div>
    <div style="margin-top:14px;padding:12px;background:#f8fafc;border:1px solid var(--border);border-radius:8px">
      <div style="font-weight:800;font-size:12px;color:var(--text2);margin-bottom:10px">🪪 개인 공유카드 배경</div>
      <label>배경 이미지 URL <span style="font-size:10px;font-weight:400;color:var(--gray-l)">(비워두면 대학색 배경 사용)</span></label>
      <input type="text" id="ed-sharebg" value="${p.shareCardBgImg||''}" placeholder="https://... 이미지 URL">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:10px">
        <div>
          <label>표시 방식</label>
          <select id="ed-sharebg-fit">
            <option value=""${!p.shareCardBgFit?' selected':''}>기본값</option>
            <option value="contain"${p.shareCardBgFit==='contain'?' selected':''}>맞춤</option>
            <option value="cover"${p.shareCardBgFit==='cover'?' selected':''}>채우기</option>
            <option value="fill"${p.shareCardBgFit==='fill'?' selected':''}>늘리기</option>
          </select>
        </div>
        <div>
          <label>크기 조절</label>
          <div style="display:flex;align-items:center;gap:8px">
            <input type="range" id="ed-sharebg-scale" min="40" max="220" step="5" value="${Number(p.shareCardBgScale||100)||100}" style="flex:1;accent-color:var(--blue)" oninput="document.getElementById('ed-sharebg-scale-val').textContent=this.value+'%'">
            <span id="ed-sharebg-scale-val" style="font-size:11px;color:var(--gray-l);min-width:40px;text-align:right;font-weight:700">${Number(p.shareCardBgScale||100)||100}%</span>
          </div>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:10px">
        <div>
          <label>어둡게 덮기</label>
          <div style="display:flex;align-items:center;gap:8px">
            <input type="range" id="ed-sharebg-dark" min="0" max="85" step="5" value="${Number(p.shareCardBgDark||18)||18}" style="flex:1;accent-color:var(--blue)" oninput="document.getElementById('ed-sharebg-dark-val').textContent=this.value+'%'">
            <span id="ed-sharebg-dark-val" style="font-size:11px;color:var(--gray-l);min-width:40px;text-align:right;font-weight:700">${Number(p.shareCardBgDark||18)||18}%</span>
          </div>
        </div>
        <div>
          <label>반투명 밝기</label>
          <div style="display:flex;align-items:center;gap:8px">
            <input type="range" id="ed-sharebg-fade" min="0" max="100" step="5" value="${Number(p.shareCardBgFade||0)||0}" style="flex:1;accent-color:var(--blue)" oninput="document.getElementById('ed-sharebg-fade-val').textContent=this.value+'%'">
            <span id="ed-sharebg-fade-val" style="font-size:11px;color:var(--gray-l);min-width:40px;text-align:right;font-weight:700">${Number(p.shareCardBgFade||0)||0}%</span>
          </div>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:10px">
        <div>
          <label>가로 위치</label>
          <select id="ed-sharebg-posx">
            <option value="left"${(p.shareCardBgPosX||'center')==='left'?' selected':''}>좌</option>
            <option value="center"${(!p.shareCardBgPosX||p.shareCardBgPosX==='center')?' selected':''}>중</option>
            <option value="right"${p.shareCardBgPosX==='right'?' selected':''}>우</option>
          </select>
        </div>
        <div>
          <label>세로 위치</label>
          <select id="ed-sharebg-posy">
            <option value="top"${p.shareCardBgPosY==='top'?' selected':''}>상</option>
            <option value="center"${(!p.shareCardBgPosY||p.shareCardBgPosY==='center')?' selected':''}>중</option>
            <option value="bottom"${p.shareCardBgPosY==='bottom'?' selected':''}>하</option>
          </select>
        </div>
      </div>
      <div style="font-size:10px;color:var(--gray-l);margin-top:8px">공유카드 전용 배경입니다. 스트리머 상세 헤더 배경과 별도로 저장됩니다.</div>
    </div>
    <div style="margin-top:14px;padding:14px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;">
      <div style="font-weight:700;font-size:12px;color:#15803d;margin-bottom:10px">🎭 상태 아이콘</div>
      <div style="display:flex;flex-wrap:wrap;gap:6px" id="ed-icon-btns">
        ${(()=>{const cur=getStatusIcon(p.name);return Object.entries(STATUS_ICON_DEFS).map(([id,d])=>{const isSelected=(id==='none'&&!cur)||(d.emoji&&cur===d.emoji);const iconHTML=d.emoji?(_siIsImg(d.emoji)?_siRender(d.emoji,'18px'):d.emoji):'<span style="font-size:11px;font-weight:700">없음</span>';return `<button type="button" onclick="setStatusIconFromModal(this,'${p.name}','${id}')" data-icon-id="${id}" title="${d.label}" style="padding:5px 10px;border-radius:7px;border:2px solid ${isSelected?'#16a34a':'var(--border)'};background:${isSelected?'#dcfce7':'var(--white)'};cursor:pointer;min-width:38px;transition:.12s;font-family:'Noto Sans KR',sans-serif;">${iconHTML}</button>`}).join('')})()}
      </div>
      <div id="ed-icon-label" style="font-size:11px;color:var(--gray-l);margin-top:7px">선택: ${(()=>{const c=getStatusIcon(p.name);const found=Object.entries(STATUS_ICON_DEFS).find(([,d])=>d.emoji&&d.emoji===c);const expiry=playerStatusExpiry[p.name];const expTxt=expiry?` (${expiry} 만료)`:'';return (found?found[1].label:'없음')+expTxt;})()}</div>
      <div id="ed-icon-expiry-row" style="display:${getStatusIcon(p.name)?'flex':'none'};align-items:center;gap:7px;margin-top:8px">
        <input type="checkbox" id="ed-icon-expiry" ${playerStatusExpiry[p.name]?'checked':''} onchange="onStatusExpiryChange('${p.name}')" style="width:14px;height:14px;cursor:pointer;accent-color:#16a34a">
        <label for="ed-icon-expiry" style="font-size:11px;color:#15803d;font-weight:600;cursor:pointer;margin:0">10일 후 자동으로 없음으로 변경</label>
      </div>
    </div>
    <div style="margin-top:16px;padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:8px;">
      <div style="font-weight:700;font-size:12px;color:var(--blue);margin-bottom:12px">📊 승패 직접 조정</div>
      <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-bottom:10px">
        <div style="flex:1;min-width:100px">
          <div style="font-size:11px;font-weight:700;color:var(--gray-l);margin-bottom:4px">승 (현재: ${p.win})</div>
          <input type="number" id="ed-win" value="${p.win}" min="0" style="width:100%">
        </div>
        <div style="flex:1;min-width:100px">
          <div style="font-size:11px;font-weight:700;color:var(--gray-l);margin-bottom:4px">패 (현재: ${p.loss})</div>
          <input type="number" id="ed-loss" value="${p.loss}" min="0" style="width:100%">
        </div>
        <div style="flex:1;min-width:100px">
          <div style="font-size:11px;font-weight:700;color:var(--gray-l);margin-bottom:4px">포인트 (현재: ${p.points})</div>
          <input type="number" id="ed-pts" value="${p.points}" style="width:100%">
        </div>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button class="btn btn-o btn-sm" onclick="
          if(confirm('승패와 히스토리를 모두 초기화하시겠습니까?')){
            const p=players.find(x=>x.name===editName);
            p.win=0;p.loss=0;p.points=0;p.history=[];
            document.getElementById('ed-win').value=0;
            document.getElementById('ed-loss').value=0;
            document.getElementById('ed-pts').value=0;
            save();render();
          }
        ">🔄 승패 전체 초기화</button>
        <button class="btn btn-w btn-sm" onclick="
          const p=players.find(x=>x.name===editName);
          p.win=parseInt(document.getElementById('ed-win').value)||0;
          p.loss=parseInt(document.getElementById('ed-loss').value)||0;
          p.points=parseInt(document.getElementById('ed-pts').value)||0;
          save();render();
          document.getElementById('emBody').querySelector('.apply-ok').style.display='inline-block';
          setTimeout(()=>document.getElementById('emBody').querySelector('.apply-ok').style.display='none',1500);
        " style="border-color:var(--green);color:var(--green)">✅ 승패 적용</button>
        <span class="apply-ok" style="display:none;color:var(--green);font-weight:700;font-size:12px;align-self:center">적용됨!</span>
      </div>
      <div style="font-size:10px;color:var(--gray-l);margin-top:8px">※ 승패 초기화 시 개인 경기 기록(히스토리)도 함께 삭제됩니다. 대전 기록(미니/대학대전 등)은 유지됩니다.</div>
    </div>
    <div style="margin-top:14px;padding:12px 14px;background:var(--surface);border:1px solid var(--border);border-radius:8px;display:flex;align-items:center;gap:10px">
      <label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:13px;font-weight:600;color:var(--text2);margin:0">
        <input type="checkbox" id="ed-retired" ${p.retired?'checked':''} style="width:16px;height:16px;cursor:pointer">
        🎗️ 은퇴 (현황판에서만 숨김, 경기 기록은 유지)
      </label>
    </div>
    <div style="margin-top:10px;padding:12px 14px;background:var(--surface);border:1px solid var(--border);border-radius:8px;display:flex;align-items:center;gap:10px">
      <label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:13px;font-weight:600;color:var(--text2);margin:0">
        <input type="checkbox" id="ed-inactive" ${p.inactive?'checked':''} style="width:16px;height:16px;cursor:pointer">
        ⏸️ 임시 상태 (휴학/활동중단) — 현황판에서 반투명 표시, 은퇴와 달리 숨기지 않음
      </label>
    </div>
    <div style="margin-top:10px;padding:12px 14px;background:var(--surface);border:1px solid var(--border);border-radius:8px;display:flex;align-items:center;gap:10px">
      <label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:13px;font-weight:600;color:var(--text2);margin:0">
        <input type="checkbox" id="ed-hide-board" ${p.hideFromBoard?'checked':''} style="width:16px;height:16px;cursor:pointer">
        👁️ 현황판에서 숨기기 (스탯·기록은 유지, 구현황판·신현황판 모두 적용)
      </label>
    </div>
    <!-- (요청사항) 크루 소속 항목 제거 -->
    <div style="margin-top:14px;padding:14px;background:#fffbeb;border:1px solid #fde68a;border-radius:8px;">
      <div style="font-weight:700;font-size:12px;color:#b45309;margin-bottom:8px">📝 선수 메모</div>
      <textarea id="ed-memo" style="width:100%;min-height:70px;font-size:12px;border:1px solid #fde68a;border-radius:6px;padding:8px;background:#fff;resize:vertical;font-family:'Noto Sans KR',sans-serif;line-height:1.6;box-sizing:border-box;" placeholder="선수에 대한 메모를 입력하세요...">${p.memo||''}</textarea>
    </div>`;
  om('emModal');
  try{ setTimeout(()=>{ 
    if(typeof edBindH2HPosDrag==='function') edBindH2HPosDrag(); 
    if(typeof edBindP1PosDrag==='function') edBindP1PosDrag();
    if(typeof edBindP2PosDrag==='function') edBindP2PosDrag();
    if(typeof edPhbgSyncFromInputs==='function') edPhbgSyncFromInputs();
    if(typeof edBindPhbgDrag==='function') edBindPhbgDrag();
  }, 0); }catch(e){}
}
// 스트리머 상세 모달 → 수정창 열기
// emModal(z-index:5000) > playerModal(z-index:4000) 이므로 playerModal을 닫지 않고
// 그 위에 emModal을 열기만 함 → cm/om 순서 경쟁조건 완전 제거
function openEPFromModal(nameArg){
  const canEdit = !!(typeof isLoggedIn!=='undefined' && isLoggedIn) && !(typeof isSubAdmin!=='undefined' && isSubAdmin);
  if(!canEdit){ alert('총관리자만 수정할 수 있습니다.'); return; }
  const pst = (typeof getPlayerDetailState==='function') ? getPlayerDetailState() : (window.PlayerDetailState||{});
  const name=nameArg||pst.currentName;
  if(!name){alert('선수 이름을 확인할 수 없습니다.');return;}
  const p=players.find(x=>x.name===name);
  if(!p){alert('선수 정보를 찾을 수 없습니다: '+name);return;}
  try{
    openEP(name);
  }catch(e){
    console.error('[openEP] 오류:',e);
    alert('수정창 열기 실패: '+e.message);
  }
}
function savePlayer(){
  try{
  const canEdit = !!(typeof isLoggedIn!=='undefined' && isLoggedIn) && !(typeof isSubAdmin!=='undefined' && isSubAdmin);
  if(!canEdit){ alert('총관리자만 수정할 수 있습니다.'); return; }
  const p=players.find(x=>x.name===editName);
  if(!p){alert('선수를 찾을 수 없습니다.\n현재 editName: "'+editName+'"');return;}
  const newName=(document.getElementById('ed-n')?.value||'').trim();
  if(!newName){alert('이름을 입력하세요.');return;}
  const oldName=editName;

  // 이름 변경 시 모든 기록 자동 갱신
  if(newName !== oldName){
    if(players.some(x=>x.name===newName)&&!confirm(`"${newName}" 이름의 스트리머가 이미 존재합니다.\n동명이인으로 변경하시겠습니까?`))return;
    players.forEach(other=>{
      (other.history||[]).forEach(h=>{if(h.opp===oldName)h.opp=newName;});
    });
    const renameInMatches=(arr)=>{
      (arr||[]).forEach(m=>{
        (m.sets||[]).forEach(set=>{
          (set.games||[]).forEach(g=>{
            if(g.playerA===oldName)g.playerA=newName;
            if(g.playerB===oldName)g.playerB=newName;
          });
        });
        (m.teamAMembers||[]).forEach(mb=>{if(mb.name===oldName)mb.name=newName;});
        (m.teamBMembers||[]).forEach(mb=>{if(mb.name===oldName)mb.name=newName;});
      });
    };
    renameInMatches(miniM);renameInMatches(univM);renameInMatches(comps);
    renameInMatches(ckM);renameInMatches(proM);renameInMatches(ttM);
    // 🔧 개인전/끝장전: wName/lName 갱신
    [indM, gjM].forEach(arr=>{
      (arr||[]).forEach(m=>{
        if(m.wName===oldName) m.wName=newName;
        if(m.lName===oldName) m.lName=newName;
      });
    });
    tourneys.forEach(tn=>{
      (tn.groups||[]).forEach(grp=>{
        (grp.matches||[]).forEach(m=>{
          (m.sets||[]).forEach(set=>{
            (set.games||[]).forEach(g=>{
              if(g.playerA===oldName)g.playerA=newName;
              if(g.playerB===oldName)g.playerB=newName;
            });
          });
        });
      });
      // 브라켓 경기 이름 갱신
      const br=tn.bracket||{};
      Object.values(br.matchDetails||{}).forEach(m=>{
        if(!m)return;
        if(m.a===oldName)m.a=newName;
        if(m.b===oldName)m.b=newName;
        (m.sets||[]).forEach(set=>{
          (set.games||[]).forEach(g=>{
            if(g.playerA===oldName)g.playerA=newName;
            if(g.playerB===oldName)g.playerB=newName;
          });
        });
      });
      (br.manualMatches||[]).forEach(m=>{
        if(!m)return;
        if(m.a===oldName)m.a=newName;
        if(m.b===oldName)m.b=newName;
        (m.sets||[]).forEach(set=>{
          (set.games||[]).forEach(g=>{
            if(g.playerA===oldName)g.playerA=newName;
            if(g.playerB===oldName)g.playerB=newName;
          });
        });
      });
    });

    // 개인/끝장전 배경 위치 보정값도 이름 변경 반영
    try{
      const m = JSON.parse(localStorage.getItem('su_h2h_player_bgpos')||'{}')||{};
      if(m[oldName] && !m[newName]) m[newName]=m[oldName];
      if(m[oldName]) delete m[oldName];
      localStorage.setItem('su_h2h_player_bgpos', JSON.stringify(m));
    }catch(e){}
  }

  p.name=newName;
  editName=p.name;
  p.tier=document.getElementById('ed-t')?.value||p.tier||'';
  p.univ=document.getElementById('ed-u')?.value||p.univ||'';
  p.race=document.getElementById('ed-r')?.value||p.race||'N';
  p.gender=document.getElementById('ed-g')?.value||p.gender||'F';
  const _rv=(document.getElementById('ed-role')?.value||'').trim();
  p.role=(!p.univ||p.univ==='무소속')?undefined:(_rv||undefined);
  const _photo=(document.getElementById('ed-photo')?.value||'').trim();
  if(_photo){
    if(_photo.startsWith('data:')){
      alert('❌ 프로필 사진에 base64 이미지(data:...)를 직접 붙여넣으면 동기화 저장이 실패할 수 있습니다.\n\n이미지를 imgur.com, Discord 등에 업로드한 후 URL을 사용하세요.');
      return;
    }
    if(_photo.length>2000){
      if(!confirm(`⚠️ 사진 URL이 매우 깁니다 (${_photo.length}자).\n정상 URL인지 확인하세요. 계속 저장하시겠습니까?`)) return;
    }
  }
  p.photo=_photo||undefined;

  // 프로필 사진 1 object-position 보정 저장
  try{
    const use = !!document.getElementById('ed-p1pos-use')?.checked;
    const del = (document.getElementById('ed-p1pos-del')?.value||'0') === '1';
    const x = parseInt(document.getElementById('ed-p1pos-x')?.value||'50',10);
    const y = parseInt(document.getElementById('ed-p1pos-y')?.value||'50',10);
    // 체크 해제 시: 기존 설정(기본값) 사용
    p.photoPosUse = use;
    if(del || !p.photo){
      delete p.photoPosX; delete p.photoPosY;
    }else if(Number.isFinite(x) && Number.isFinite(y)){
      const xx=Math.max(0,Math.min(100,x)), yy=Math.max(0,Math.min(100,y));
      if(xx===50 && yy===50){ delete p.photoPosX; delete p.photoPosY; }
      else { p.photoPosX=xx; p.photoPosY=yy; }
    }
  }catch(e){}

  // 개인/끝장전 카드 얼굴 위치 보정 (수정창에서 저장한 값 적용)
  try{
    const del = (document.getElementById('ed-h2hpos-del')?.value||'0') === '1';
    const map = JSON.parse(localStorage.getItem('su_h2h_player_bgpos')||'{}')||{};
    if(del){
      delete map[p.name];
    }else{
      const x = parseInt(document.getElementById('ed-h2hpos-x')?.value||'50',10);
      const y = parseInt(document.getElementById('ed-h2hpos-y')?.value||'50',10);
      if(Number.isFinite(x) && Number.isFinite(y)){
        map[p.name] = { x: Math.max(0,Math.min(100,x)), y: Math.max(0,Math.min(100,y)) };
      }
    }
    localStorage.setItem('su_h2h_player_bgpos', JSON.stringify(map));
  }catch(e){}
  const _win=document.getElementById('ed-win');
  const _loss=document.getElementById('ed-loss');
  const _pts=document.getElementById('ed-pts');
  if(_win)p.win=parseInt(_win.value)||0;
  if(_loss)p.loss=parseInt(_loss.value)||0;
  if(_pts)p.points=parseInt(_pts.value)||0;
  p.retired=document.getElementById('ed-retired')?.checked||false;
  if(!p.retired)p.retired=undefined;
  p.inactive=document.getElementById('ed-inactive')?.checked||false;
  if(!p.inactive)p.inactive=undefined;
  p.hideFromBoard=document.getElementById('ed-hide-board')?.checked||false;
  if(!p.hideFromBoard)p.hideFromBoard=undefined;
  // (요청사항) 크루 소속 항목 제거 (기존 값 유지)
  const _memo=(document.getElementById('ed-memo')?.value||'').trim();
  p.memo=_memo||undefined;
  const _channel=(document.getElementById('ed-channel')?.value||'').trim();
  p.channelUrl=_channel||undefined;
  const _photo2=(document.getElementById('ed-photo2')?.value||'').trim();
  const _phbg=(document.getElementById('ed-phbg')?.value||'').trim();
  const _phbgFit=(document.getElementById('ed-phbg-fit')?.value||'').trim();
  const _phbgScale=parseInt(document.getElementById('ed-phbg-scale')?.value||'100',10)||100;
  const _phbgPos=(document.getElementById('ed-phbg-pos')?.value||'center center').trim();
  const _phbgPosX=parseInt(document.getElementById('ed-phbg-posx')?.value||'50',10);
  const _phbgPosY=parseInt(document.getElementById('ed-phbg-posy')?.value||'50',10);
  const _shareBg=(document.getElementById('ed-sharebg')?.value||'').trim();
  const _shareBgFit=(document.getElementById('ed-sharebg-fit')?.value||'').trim();
  const _shareBgScale=parseInt(document.getElementById('ed-sharebg-scale')?.value||'100',10)||100;
  const _shareBgDark=parseInt(document.getElementById('ed-sharebg-dark')?.value||'18',10)||0;
  const _shareBgFade=parseInt(document.getElementById('ed-sharebg-fade')?.value||'0',10)||0;
  const _shareBgPosX=(document.getElementById('ed-sharebg-posx')?.value||'center').trim();
  const _shareBgPosY=(document.getElementById('ed-sharebg-posy')?.value||'center').trim();
  p.secondProfileFile=_photo2||undefined;

  // 프로필 사진 2 object-position 보정 저장
  try{
    const use = !!document.getElementById('ed-p2pos-use')?.checked;
    const del = (document.getElementById('ed-p2pos-del')?.value||'0') === '1';
    const x = parseInt(document.getElementById('ed-p2pos-x')?.value||'50',10);
    const y = parseInt(document.getElementById('ed-p2pos-y')?.value||'50',10);
    p.photo2PosUse = use;
    if(del || !p.secondProfileFile){
      delete p.photo2PosX; delete p.photo2PosY;
    }else if(Number.isFinite(x) && Number.isFinite(y)){
      const xx=Math.max(0,Math.min(100,x)), yy=Math.max(0,Math.min(100,y));
      if(xx===50 && yy===50){ delete p.photo2PosX; delete p.photo2PosY; }
      else { p.photo2PosX=xx; p.photo2PosY=yy; }
    }
  }catch(e){}
  p.detailHeaderBgImg=_phbg||undefined;
  p.detailHeaderBgFit=_phbgFit||undefined;
  p.detailHeaderBgScale=_phbg ? _phbgScale : undefined;
  p.detailHeaderBgPos=_phbg ? _phbgPos : undefined;
  p.detailHeaderBgPosX=_phbg ? (isNaN(_phbgPosX)?50:Math.max(0,Math.min(100,_phbgPosX))) : undefined;
  p.detailHeaderBgPosY=_phbg ? (isNaN(_phbgPosY)?50:Math.max(0,Math.min(100,_phbgPosY))) : undefined;
  p.shareCardBgImg=_shareBg||undefined;
  p.shareCardBgFit=_shareBgFit||undefined;
  p.shareCardBgScale=_shareBg ? _shareBgScale : undefined;
  p.shareCardBgDark=_shareBg ? _shareBgDark : undefined;
  p.shareCardBgFade=_shareBg ? _shareBgFade : undefined;
  p.shareCardBgPosX=_shareBg ? _shareBgPosX : undefined;
  p.shareCardBgPosY=_shareBg ? _shareBgPosY : undefined;
  save();
  cm('emModal');
  
  // (요청사항) 크루 자동 전환 로직 제거
  
  render();
  if(typeof openPlayerModal==='function'){
    const _savedName=p.name;
    setTimeout(()=>{
      const _p=players.find(x=>x.name===_savedName);
      if(_p) openPlayerModal(_savedName);
    },100);
  }
  }catch(e){
    console.error('[savePlayer] 오류:',e);
    alert('저장 중 오류가 발생했습니다:\n'+e.message+'\n\nF12 콘솔에서 자세한 내용을 확인하세요.');
  }
}
function setAllFemale(){
  if(!confirm(`모든 스트리머 ${players.length}명을 여자로 일괄 변경하시겠습니까?\n이후 남자 선수는 개별 수정으로 변경하세요.`))return;
  players.forEach(p=>p.gender='F');
  save();render();
  alert(`완료! 총 ${players.length}명이 여자로 변경되었습니다.`);
}

function delPlayer(){
  if(!confirm(`"${editName}" 선수를 완전 삭제할까요?\n\n⚠️ 선수 정보와 모든 경기 기록이 삭제됩니다.\n이 작업은 되돌릴 수 없습니다.`)) return;
  const name = editName;
  // 1. players 배열에서 완전 제거
  const idx = players.findIndex(x => x.name === name);
  if(idx >= 0) players.splice(idx, 1);
  // 2. 모든 경기 배열에서 해당 선수 관련 기록 제거
  // 개인전/끝장전: 해당 선수가 포함된 게임 제거
  if(typeof indM !== 'undefined') indM = indM.filter(m => m.wName !== name && m.lName !== name);
  if(typeof gjM !== 'undefined') gjM = gjM.filter(m => m.wName !== name && m.lName !== name);
  // 미니/대학대전/CK/프로/티어대회: 해당 선수가 포함된 세트의 게임 제거
  function _removePlayerFromMatches(arr) {
    arr.forEach(m => {
      if(!m.sets) return;
      m.sets.forEach(set => {
        if(!set.games) return;
        set.games = set.games.filter(g => g.playerA !== name && g.playerB !== name);
      });
    });
  }
  _removePlayerFromMatches(miniM);
  _removePlayerFromMatches(univM);
  _removePlayerFromMatches(ckM);
  _removePlayerFromMatches(proM);
  _removePlayerFromMatches(ttM);
  // 3. 다른 선수의 history에서 해당 선수와의 기록 제거 + win/loss/points/ELO 재계산
  players.forEach(p => {
    if(!p.history) return;
    const removed = p.history.filter(h => h.opp === name);
    if(!removed.length) return;
    p.history = p.history.filter(h => h.opp !== name);
    // 제거된 기록만큼 전적 차감
    removed.forEach(h => {
      if(h.result === '승') {
        p.win = Math.max(0, (p.win||0) - 1);
        p.points = (p.points||0) - 3;
        if(h.eloDelta != null) p.elo = (p.elo||ELO_DEFAULT) - h.eloDelta;
      } else if(h.result === '패') {
        p.loss = Math.max(0, (p.loss||0) - 1);
        p.points = (p.points||0) + 3;
        if(h.eloDelta != null) p.elo = (p.elo||ELO_DEFAULT) - h.eloDelta;
      }
    });
  });
  save();
  render();
  cm('emModal');
  cm('playerModal');
}

function openRE(mode,idx){
  // alias/필터 모드 보정
  mode = (mode==='individual') ? 'ind' : mode;
  // progj는 gjM 내 _proLabel=true 항목만 필터링된 인덱스일 수 있어 실제 인덱스로 매핑
  if(mode==='progj'){
    try{
      const pool = (Array.isArray(gjM)?gjM.filter(x=>!!x._proLabel):[]);
      const tgt = pool[idx] || null;
      const realIdx = tgt ? gjM.indexOf(tgt) : -1;
      if(realIdx>=0) idx = realIdx;
    }catch(e){}
  }
  reMode=mode;reIdx=idx;const allU=getAllUnivs();
  let body='',tit='';
  if(mode==='mini'){
    const m=miniM[idx];tit='⚡ 미니대전 수정';
    const mSetsA=m.sets?m.sets.reduce((s,st)=>s+(st.scoreA||0),0):null;
    const mSetsB=m.sets?m.sets.reduce((s,st)=>s+(st.scoreB||0),0):null;
    body=`<label>날짜</label><input type="date" id="re-d" value="${m.d}">
      <label>팀 A 대학</label><select id="re-a">${allU.map(u=>`<option value="${u.name}"${m.a===u.name?' selected':''}>${u.name}</option>`).join('')}</select>
      <label>팀 A 점수 (sa)</label>
      <div style="display:flex;gap:6px;align-items:center">
        <input type="number" id="re-sa" value="${m.sa}" style="flex:1">
        ${mSetsA!==null&&mSetsA!==m.sa?`<button type="button" onclick="document.getElementById('re-sa').value=${mSetsA};document.getElementById('re-sb').value=${mSetsB}" style="font-size:11px;padding:2px 8px;background:#fef9c3;border:1px solid #ca8a04;border-radius:6px;cursor:pointer;white-space:nowrap">🔄 게임수(${mSetsA}:${mSetsB})</button>`:''}
      </div>
      <label>팀 B 대학</label><select id="re-b">${allU.map(u=>`<option value="${u.name}"${m.b===u.name?' selected':''}>${u.name}</option>`).join('')}</select>
      <label>팀 B 점수 (sb)</label><input type="number" id="re-sb" value="${m.sb}">
      ${mSetsA!==null?`<div style="font-size:11px;color:var(--gray-l);margin-top:2px">세트 수: A ${m.sets.filter(s=>s.winner==='A').length} / B ${m.sets.filter(s=>s.winner==='B').length} | 게임 수: A ${mSetsA} / B ${mSetsB}</div>`:''}`;
  } else if(mode==='univm'){
    const m=univM[idx];tit='🏟️ 대학대전 수정';
    const uSetsA=m.sets?m.sets.reduce((s,st)=>s+(st.scoreA||0),0):null;
    const uSetsB=m.sets?m.sets.reduce((s,st)=>s+(st.scoreB||0),0):null;
    body=`<label>날짜</label><input type="date" id="re-d" value="${m.d}">
      <label>팀 A</label><select id="re-a">${allU.map(u=>`<option value="${u.name}"${m.a===u.name?' selected':''}>${u.name}</option>`).join('')}</select>
      <label>A 점수 (sa)</label>
      <div style="display:flex;gap:6px;align-items:center">
        <input type="number" id="re-sa" value="${m.sa}" style="flex:1">
        ${uSetsA!==null&&uSetsA!==m.sa?`<button type="button" onclick="document.getElementById('re-sa').value=${uSetsA};document.getElementById('re-sb').value=${uSetsB}" style="font-size:11px;padding:2px 8px;background:#fef9c3;border:1px solid #ca8a04;border-radius:6px;cursor:pointer;white-space:nowrap">🔄 게임수(${uSetsA}:${uSetsB})</button>`:''}
      </div>
      <label>팀 B</label><select id="re-b">${allU.map(u=>`<option value="${u.name}"${m.b===u.name?' selected':''}>${u.name}</option>`).join('')}</select>
      <label>B 점수 (sb)</label><input type="number" id="re-sb" value="${m.sb}">
      ${uSetsA!==null?`<div style="font-size:11px;color:var(--gray-l);margin-top:2px">세트 수: A ${m.sets.filter(s=>s.winner==='A').length} / B ${m.sets.filter(s=>s.winner==='B').length} | 게임 수: A ${uSetsA} / B ${uSetsB}</div>`:''}`;
  } else if(mode==='comp'){
    const c=comps[idx];tit='🎖️ 대회 수정';
    body=`<label>날짜</label><input type="date" id="re-d" value="${c.d}">
      <label>대회명</label><input type="text" id="re-cn" value="${c.n}">
      <label>대학 A</label><select id="re-a">${allU.map(u=>`<option value="${u.name}"${(c.a||c.u)===u.name?' selected':''}>${u.name}</option>`).join('')}</select>
      <label>A 세트 승</label><input type="number" id="re-sa" value="${c.sa||0}">
      <label>대학 B</label><select id="re-b">${allU.map(u=>`<option value="${u.name}"${c.b===u.name?' selected':''}>${u.name}</option>`).join('')}</select>
      <label>B 세트 승</label><input type="number" id="re-sb" value="${c.sb||0}">`;
  } else if(mode==='pro'){
    const m=proM[idx];tit='🏅 프로리그 수정';
    const mA=m.teamAMembers||[];const mB=m.teamBMembers||[];
    const pSetsGA=m.sets?m.sets.reduce((s,st)=>s+(st.scoreA||0),0):null;
    const pSetsGB=m.sets?m.sets.reduce((s,st)=>s+(st.scoreB||0),0):null;
    const pSetsWA=m.sets?m.sets.filter(s=>s.winner==='A').length:null;
    const pSetsWB=m.sets?m.sets.filter(s=>s.winner==='B').length:null;
    body=`<label>날짜</label><input type="date" id="re-d" value="${m.d||''}">
      <label>A팀 레이블</label><input type="text" id="re-tla" value="${m.teamALabel||''}">
      <label>A팀 점수 (sa)</label>
      <div style="display:flex;gap:6px;align-items:center">
        <input type="number" id="re-sa" value="${m.sa||0}" style="flex:1">
        ${pSetsGA!==null&&pSetsGA!==m.sa?`<button type="button" onclick="document.getElementById('re-sa').value=${pSetsGA};document.getElementById('re-sb').value=${pSetsGB}" style="font-size:11px;padding:2px 8px;background:#fef9c3;border:1px solid #ca8a04;border-radius:6px;cursor:pointer">🔄 게임수(${pSetsGA}:${pSetsGB})</button>`:''}
        ${pSetsWA!==null&&pSetsWA!==m.sa?`<button type="button" onclick="document.getElementById('re-sa').value=${pSetsWA};document.getElementById('re-sb').value=${pSetsWB}" style="font-size:11px;padding:2px 8px;background:#dbeafe;border:1px solid #2563eb;border-radius:6px;cursor:pointer">🔄 세트수(${pSetsWA}:${pSetsWB})</button>`:''}
      </div>
      <label>B팀 레이블</label><input type="text" id="re-tlb" value="${m.teamBLabel||''}">
      <label>B팀 점수 (sb)</label><input type="number" id="re-sb" value="${m.sb||0}">
      ${pSetsGA!==null?`<div style="font-size:11px;color:var(--gray-l);margin-top:2px">세트 수: A ${pSetsWA} / B ${pSetsWB} | 게임 수: A ${pSetsGA} / B ${pSetsGB}</div>`:''}
      <div style="margin-top:6px;font-size:11px;color:var(--gray-l)">※ 세트별 개인 경기는 기록 상세보기에서 수정하세요.</div>`;
  } else if(mode==='tt'){
    const m=ttM[idx];tit='🎯 티어대회 수정';
    const ttGA=m.sets?m.sets.reduce((s,st)=>s+(st.scoreA||0),0):null;
    const ttGB=m.sets?m.sets.reduce((s,st)=>s+(st.scoreB||0),0):null;
    const ttWA=m.sets?m.sets.filter(s=>s.winner==='A').length:null;
    const ttWB=m.sets?m.sets.filter(s=>s.winner==='B').length:null;
    body=`<label>날짜</label><input type="date" id="re-d" value="${m.d||''}">
      <label>대회명 (기록 분류 기준)</label><input type="text" id="re-ttcomp" value="${m.compName||m.n||m.t||''}">
      <label>A팀 점수 (sa)</label>
      <div style="display:flex;gap:6px;align-items:center">
        <input type="number" id="re-sa" value="${m.sa||0}" style="flex:1">
        ${ttGA!==null&&ttGA!==m.sa?`<button type="button" onclick="document.getElementById('re-sa').value=${ttGA};document.getElementById('re-sb').value=${ttGB}" style="font-size:11px;padding:2px 8px;background:#fef9c3;border:1px solid #ca8a04;border-radius:6px;cursor:pointer">🔄 게임수(${ttGA}:${ttGB})</button>`:''}
        ${ttWA!==null&&ttWA!==m.sa?`<button type="button" onclick="document.getElementById('re-sa').value=${ttWA};document.getElementById('re-sb').value=${ttWB}" style="font-size:11px;padding:2px 8px;background:#dbeafe;border:1px solid #2563eb;border-radius:6px;cursor:pointer">🔄 세트수(${ttWA}:${ttWB})</button>`:''}
      </div>
      <label>B팀 점수 (sb)</label><input type="number" id="re-sb" value="${m.sb||0}">
      ${ttGA!==null?`<div style="font-size:11px;color:var(--gray-l);margin-top:2px">세트 수: A ${ttWA} / B ${ttWB} | 게임 수: A ${ttGA} / B ${ttGB}</div>`:''}
      <div style="margin-top:6px;font-size:11px;color:var(--gray-l)">※ 세트별 개인 경기는 기록 상세보기에서 수정하세요.</div>`;
  } else if(mode==='ck'){
    const m=ckM[idx];tit='🤝 대학CK 수정';
    body=`<label>날짜</label><input type="date" id="re-d" value="${m.d||''}">
      <label>A조 세트 승</label><input type="number" id="re-sa" value="${m.sa||0}">
      <label>B조 세트 승</label><input type="number" id="re-sb" value="${m.sb||0}">
      <div style="margin-top:10px;font-size:11px;color:var(--gray-l)">※ 세트별 개인 경기는 기록 상세보기에서 수정하세요.</div>`;
  } else if(mode==='progj'){
    const m=gjM[idx];tit='🏅 프로리그 끝장전 수정';
    body=`<label>날짜</label><input type="date" id="re-d" value="${m.d||''}">
      <label>승자</label><input type="text" id="re-gj-w" value="${m.wName||''}">
      <label>패자</label><input type="text" id="re-gj-l" value="${m.lName||''}">
      <label>맵</label><input type="text" id="re-gj-map" value="${m.map||''}">`;
  } else if(mode==='gj'){
    const m=gjM[idx];tit='⚔️ 끝장전 수정';
    body=`<label>날짜</label><input type="date" id="re-d" value="${m.d||''}">
      <label>승자</label><input type="text" id="re-gj-w" value="${m.wName||''}">
      <label>패자</label><input type="text" id="re-gj-l" value="${m.lName||''}">
      <label>맵</label><input type="text" id="re-gj-map" value="${m.map||''}">`;
  } else if(mode==='ind'){
    const m=indM[idx];tit='🎮 개인전 수정';
    body=`<label>날짜</label><input type="date" id="re-d" value="${m.d||''}">
      <label>승자</label><input type="text" id="re-gj-w" value="${m.wName||''}">
      <label>패자</label><input type="text" id="re-gj-l" value="${m.lName||''}">
      <label>맵</label><input type="text" id="re-gj-map" value="${m.map||''}">`;
  }
  document.getElementById('reTitle').innerText=tit;
  document.getElementById('reBody').innerHTML=body;om('reModal');
}
function saveRow(){
  const d=document.getElementById('re-d')?.value||'';
  if(reMode==='mini'){
    miniM[reIdx].d=d;
    miniM[reIdx].a=document.getElementById('re-a')?.value||miniM[reIdx].a;
    miniM[reIdx].b=document.getElementById('re-b')?.value||miniM[reIdx].b;
    miniM[reIdx].sa=parseInt(document.getElementById('re-sa').value)||0;
    miniM[reIdx].sb=parseInt(document.getElementById('re-sb').value)||0;
    // miniM에 _id가 없으면 생성
    if(!miniM[reIdx]._id)miniM[reIdx]._id=genId();
    // 선수 history 업데이트
    (miniM[reIdx].sets||[]).forEach(set=>{
      (set.games||[]).forEach(game=>{
        if(!game._id)game._id=miniM[reIdx]._id+'-'+Date.now()+Math.random().toString(36).substr(2,9);
        updatePlayerHistoryFromGame(game, d, 'mini');
      });
    });
  } else if(reMode==='univm'){
    const m=univM[reIdx];m.d=d;m.a=document.getElementById('re-a').value;
    m.sa=parseInt(document.getElementById('re-sa').value)||0;
    m.b=document.getElementById('re-b').value;m.sb=parseInt(document.getElementById('re-sb').value)||0;
    // univM에 _id가 없으면 생성
    if(!m._id)m._id=genId();
    // 선수 history 업데이트
    (m.sets||[]).forEach(set=>{
      (set.games||[]).forEach(game=>{
        if(!game._id)game._id=m._id+'-'+Date.now()+Math.random().toString(36).substr(2,9);
        updatePlayerHistoryFromGame(game, d, 'univ');
      });
    });
  } else if(reMode==='comp'){
    const c=comps[reIdx];c.d=d;c.n=document.getElementById('re-cn').value;
    c.a=document.getElementById('re-a').value;c.u=c.a;c.hostUniv=c.a;
    c.sa=parseInt(document.getElementById('re-sa').value)||0;
    c.b=document.getElementById('re-b').value;c.sb=parseInt(document.getElementById('re-sb').value)||0;
  } else if(reMode==='pro'){
    const m=proM[reIdx];m.d=d;
    m.teamALabel=document.getElementById('re-tla')?.value||m.teamALabel;
    m.teamBLabel=document.getElementById('re-tlb')?.value||m.teamBLabel;
    m.sa=parseInt(document.getElementById('re-sa').value)||0;
    m.sb=parseInt(document.getElementById('re-sb').value)||0;
    // proM에 _id가 없으면 생성
    if(!m._id)m._id=genId();
    // 선수 history 업데이트
    (m.sets||[]).forEach(set=>{
      (set.games||[]).forEach(game=>{
        if(!game._id)game._id=m._id+'-'+Date.now()+Math.random().toString(36).substr(2,9);
        updatePlayerHistoryFromGame(game, d, 'pro');
      });
    });
  } else if(reMode==='tt'){
    const m=ttM[reIdx];m.d=d;
    const ttn=document.getElementById('re-ttcomp')?.value;
    if(ttn!==undefined){m.compName=ttn;m.n=ttn;m.t=ttn;}
    m.sa=parseInt(document.getElementById('re-sa').value)||0;
    m.sb=parseInt(document.getElementById('re-sb').value)||0;
    // ttM에 _id가 없으면 생성 (기록 탭에서 표시되도록)
    if(!m._id)m._id=genId();
    // 선수 history 업데이트
    (m.sets||[]).forEach(set=>{
      (set.games||[]).forEach(game=>{
        if(!game._id)game._id=m._id+'-'+Date.now()+Math.random().toString(36).substr(2,9);
        updatePlayerHistoryFromGame(game, d, 'tier');
      });
    });
  } else if(reMode==='ck'){
    const m=ckM[reIdx];m.d=d;
    m.sa=parseInt(document.getElementById('re-sa').value)||0;
    m.sb=parseInt(document.getElementById('re-sb').value)||0;
  } else if(reMode==='progj'){
    const m=gjM[reIdx];m.d=d;
    m.wName=document.getElementById('re-gj-w')?.value.trim()||m.wName;
    m.lName=document.getElementById('re-gj-l')?.value.trim()||m.lName;
    m.map=document.getElementById('re-gj-map')?.value.trim()||m.map;
    m._proLabel=true;
  } else if(reMode==='gj'){
    const m=gjM[reIdx];m.d=d;
    m.wName=document.getElementById('re-gj-w')?.value.trim()||m.wName;
    m.lName=document.getElementById('re-gj-l')?.value.trim()||m.lName;
    m.map=document.getElementById('re-gj-map')?.value.trim()||m.map;
  } else if(reMode==='ind'){
    const m=indM[reIdx];m.d=d;
    m.wName=document.getElementById('re-gj-w')?.value.trim()||m.wName;
    m.lName=document.getElementById('re-gj-l')?.value.trim()||m.lName;
    m.map=document.getElementById('re-gj-map')?.value.trim()||m.map;
  }
  save();render();cm('reModal');
}

function renameUnivAcrossData(oldName,newName){
  oldName=(oldName||'').trim();
  newName=(newName||'').trim();
  if(!oldName||!newName||oldName===newName) return false;

  const _renameHistory=(h)=>{
    if(!h) return;
    ['univ','myUniv','oppUniv','team','oppTeam','teamA','teamB','teamALabel','teamBLabel'].forEach(k=>{
      if(h[k]===oldName) h[k]=newName;
    });
  };
  const _renameMember=(m)=>{
    if(m&&m.univ===oldName) m.univ=newName;
  };
  const _renameMatch=(m)=>{
    if(!m) return;
    ['a','b','u','hostUniv','teamALabel','teamBLabel'].forEach(k=>{
      if(m[k]===oldName) m[k]=newName;
    });
    (m.teamAMembers||[]).forEach(_renameMember);
    (m.teamBMembers||[]).forEach(_renameMember);
    (m.membersA||[]).forEach(_renameMember);
    (m.membersB||[]).forEach(_renameMember);
    (m.sets||[]).forEach(set=>{
      (set.games||[]).forEach(g=>{
        ['univA','univB','wUniv','lUniv','teamA','teamB'].forEach(k=>{
          if(g[k]===oldName) g[k]=newName;
        });
      });
    });
  };

  (players||[]).forEach(p=>{
    if(p.univ===oldName) p.univ=newName;
    (p.history||[]).forEach(_renameHistory);
  });

  [miniM,univM,comps,ckM,proM,ttM,indM,gjM].forEach(arr=>{
    (arr||[]).forEach(_renameMatch);
  });

  (tourneys||[]).forEach(tn=>{
    (tn.groups||[]).forEach(grp=>{
      if(Array.isArray(grp.univs)) grp.univs=grp.univs.map(u=>u===oldName?newName:u);
      (grp.matches||[]).forEach(_renameMatch);
    });
    const br=tn.bracket||{};
    Object.keys(br.slots||{}).forEach(k=>{ if(br.slots[k]===oldName) br.slots[k]=newName; });
    Object.keys(br.winners||{}).forEach(k=>{ if(br.winners[k]===oldName) br.winners[k]=newName; });
    if(br.champ===oldName) br.champ=newName;
    Object.values(br.matchDetails||{}).forEach(_renameMatch);
    (br.manualMatches||[]).forEach(_renameMatch);
  });

  (proTourneys||[]).forEach(tn=>{
    (tn.groups||[]).forEach(grp=>{
      if(Array.isArray(grp.univs)) grp.univs=grp.univs.map(u=>u===oldName?newName:u);
      (grp.matches||[]).forEach(_renameMatch);
    });
  });

  if(typeof boardPlayerOrder!=='undefined' && boardPlayerOrder && boardPlayerOrder[oldName]){
    if(!boardPlayerOrder[newName]) boardPlayerOrder[newName]=boardPlayerOrder[oldName];
    delete boardPlayerOrder[oldName];
    if(typeof saveBoardPlayerOrder==='function') saveBoardPlayerOrder();
  }

  return true;
}

function addUniv(){const n=document.getElementById('nu-n').value.trim();const c=document.getElementById('nu-c').value;if(!n)return;univCfg.push({name:n,color:c});save();render();refreshSel();}
function delUniv(i){if(confirm(`"${univCfg[i].name}" 삭제?`)){univCfg.splice(i,1);save();render();refreshSel();}}
let _univDragSrc=-1;
function _univDragStart(e,i){_univDragSrc=i;e.currentTarget.style.opacity='0.4';e.dataTransfer.effectAllowed='move';}
function _univDragOver(e){e.preventDefault();e.dataTransfer.dropEffect='move';return false;}
function _univDrop(e,i){
  e.stopPropagation();
  if(_univDragSrc===i)return false;
  const moved=univCfg.splice(_univDragSrc,1)[0];
  univCfg.splice(i,0,moved);
  save();render();
  return false;
}
function _univDragEnd(e){e.currentTarget.style.opacity='1';}

let _dissolveIdx = -1;
function openDissolveModal(i){
  _dissolveIdx = i;
  const u = univCfg[i];
  document.getElementById('dissolve-title').textContent = `"${u.name}" 해체 처리`;
  const today = new Date().toISOString().slice(0,10);
  document.getElementById('dissolve-date').value = today;
  const cnt = players.filter(p=>p.univ===u.name).length;
  document.getElementById('dissolve-player-count').textContent = cnt ? `현재 소속 선수 ${cnt}명` : '소속 선수 없음';
  document.getElementById('dissolve-move-players').checked = cnt > 0;
  om('dissolveModal');
}
function confirmDissolve(){
  if(_dissolveIdx < 0) return;
  const u = univCfg[_dissolveIdx];
  const date = document.getElementById('dissolve-date').value || new Date().toISOString().slice(0,10);
  const movePlayers = document.getElementById('dissolve-move-players').checked;
  u.dissolved = true;
  u.hidden = true;
  u.dissolvedDate = date;
  if(movePlayers){
    players.forEach(p=>{ if(p.univ===u.name){ p.univ='무소속'; p.role=undefined; } });
  }
  // 해체된 대학의 현황판 수동 순서 데이터 정리
  if(typeof boardPlayerOrder !== 'undefined' && boardPlayerOrder[u.name]){
    delete boardPlayerOrder[u.name];
    if(typeof saveBoardPlayerOrder === 'function') saveBoardPlayerOrder();
  }
  save();
  cm('dissolveModal');
  render();
  if(typeof renderBoard==='function') renderBoard();
}
function addTier(){
  const n=document.getElementById('nt-name').value.trim();
  if(!n)return alert('티어 이름을 입력하세요.');
  if(TIERS.includes(n))return alert('이미 존재하는 티어입니다.');
  TIERS.push(n);
  // TIERS는 const이므로 push 가능
  save();render();
  document.getElementById('p-tier').innerHTML=TIERS.map(t=>`<option value="${t}">${getTierLabel(t)}</option>`).join('');
}
function delTier(t){
  const protectedTiers=['G','K','JA','J','S','0티어'];
  if(protectedTiers.includes(t))return alert('기본 티어는 삭제할 수 없습니다.');
  if(!confirm(`"${t}" 티어를 삭제하시겠습니까?\n해당 티어의 선수는 기본 티어로 변경되지 않습니다.`))return;
  const idx=TIERS.indexOf(t);
  if(idx>=0)TIERS.splice(idx,1);
  save();render();
  document.getElementById('p-tier').innerHTML=TIERS.map(t2=>`<option value="${t2}">${getTierLabel(t2)}</option>`).join('');
}

// ── 티어 색상/밝기/이모지 커스텀 ──
function cfgTierThemeSetBri(pct){
  if(typeof setTierTheme!=='function') return;
  const v=(parseInt(pct,10)||100)/100;
  setTierTheme({bri:v});
  if(typeof render==='function') render();
  if(typeof reCfg==='function') reCfg();
}
function cfgTierThemeSetSat(pct){
  if(typeof setTierTheme!=='function') return;
  const v=(parseInt(pct,10)||100)/100;
  setTierTheme({sat:v});
  if(typeof render==='function') render();
  if(typeof reCfg==='function') reCfg();
}
function cfgTierThemeSetColor(tier, hex){
  if(typeof setTierTheme!=='function') return;
  const c = cfgNormHex(hex);
  if(!c){ try{ alert('색상 코드는 #RRGGBB 형식으로 입력하세요.'); }catch(e){}; return; }
  setTierTheme({bg:{[tier]:c}});
  // 입력창 동기화
  try{
    const sid=encodeURIComponent(tier);
    const cInp=document.getElementById('cfg-tier-c-'+sid);
    if(cInp) cInp.value=c;
    const hInp=document.getElementById('cfg-tier-hex-'+sid);
    if(hInp) hInp.value=c;
  }catch(e){}
  if(typeof render==='function') render();
  if(typeof reCfg==='function') reCfg();
}
function cfgTierThemeSetIcon(tier, icon){
  if(typeof setTierTheme!=='function') return;
  setTierTheme({icon:{[tier]:String(icon||'').trim()}});
  if(typeof render==='function') render();
  if(typeof reCfg==='function') reCfg();
}
function cfgTierThemeReset(){
  if(typeof resetTierTheme!=='function') return;
  if(!confirm('티어 색상/이모지를 기본값으로 초기화할까요?')) return;
  resetTierTheme();
  if(typeof render==='function') render();
  if(typeof reCfg==='function') reCfg();
}

// ── 색상 입력/스포이드 공용 유틸 ──
function cfgNormHex(v){
  const s=String(v||'').trim();
  if(!s) return null;
  const t = s.startsWith('#') ? s.slice(1) : s;
  if(/^[0-9a-fA-F]{6}$/.test(t)) return '#'+t.toUpperCase();
  if(/^[0-9a-fA-F]{3}$/.test(t)) return '#'+t.split('').map(ch=>ch+ch).join('').toUpperCase();
  return null;
}
async function cfgPickColorHex(){
  try{
    if(!window.EyeDropper){
      alert('스포이드 기능은 크롬/엣지 등 일부 브라우저에서만 지원됩니다.');
      return null;
    }
    const ed=new EyeDropper();
    const res=await ed.open();
    return res && res.sRGBHex ? String(res.sRGBHex) : null;
  }catch(e){
    return null;
  }
}

function cfgUnivSetColor(i, hex){
  const c = cfgNormHex(hex);
  if(!c){ try{ alert('색상 코드는 #RRGGBB 형식으로 입력하세요.'); }catch(e){}; return; }
  try{ univCfg[i].color = c; }catch(e){ return; }
  // UI 동기화
  try{ 
    const cInp=document.getElementById('cfg-univ-c-'+i);
    const row=cInp && cInp.closest ? cInp.closest('.srow') : null;
    const dot=row ? row.querySelector('.cdot') : null;
    if(dot) dot.style.background=c;
  }catch(e){}
  try{
    const cInp=document.getElementById('cfg-univ-c-'+i);
    if(cInp) cInp.value=c;
    const hInp=document.getElementById('cfg-univ-hex-'+i);
    if(hInp) hInp.value=c;
  }catch(e){}
  try{ save(); }catch(e){}
  try{ if(typeof renderBoard==='function') renderBoard(); }catch(e){}
}
async function cfgUnivPickColor(i){
  const c = await cfgPickColorHex();
  if(c) cfgUnivSetColor(i,c);
}

async function cfgTierThemePickColor(tier){
  const c = await cfgPickColorHex();
  if(c) cfgTierThemeSetColor(tier,c);
}

async function addAdminAccount(){
  const id=document.getElementById('adm-id').value.trim();
  const pw=document.getElementById('adm-pw').value;
  const roleEl=document.getElementById('adm-role');
  const role=roleEl?roleEl.value:'admin';
  const msg=document.getElementById('adm-msg');
  if(!id||!pw){msg.style.color='var(--red)';msg.textContent='아이디와 비밀번호를 모두 입력하세요.';return;}
  if(pw.length<8){msg.style.color='var(--red)';msg.textContent='비밀번호는 8자 이상이어야 합니다.';return;}
  const token=(localStorage.getItem('su_gh_token')||'').trim();
  if(!token){msg.style.color='var(--red)';msg.textContent='원격 관리자 계정 관리를 위해 GitHub 토큰을 먼저 설정하세요.';return;}
  try{ if(typeof pullAdminAccountsRemote==='function') await pullAdminAccountsRemote(true); }catch(e){}
  const accounts=getAdminAccounts();
  const idNorm=String(id||'').trim().toLowerCase();
  const idHash=await sha256(idNorm);
  if(accounts.some(a=>String(a.idHash||'')===idHash)){msg.style.color='var(--gold)';msg.textContent='이미 동일한 아이디가 등록되어 있습니다.';return;}
  if(role==='admin' && accounts.some(a=>(a && a.role)!=='sub-admin')){msg.style.color='var(--red)';msg.textContent='총관리자 계정은 1명만 등록할 수 있습니다.';return;}
  const rec=(typeof createAdminAccountRecord==='function') ? await createAdminAccountRecord(id,pw,role,id) : {hash:await sha256(id+':'+pw),role,label:id};
  const next=accounts.concat([rec]);
  localStorage.setItem(ADMIN_HASH_KEY,JSON.stringify(next));
  try{ localStorage.setItem('su_admin_hashes_updated_at', String(Date.now())); }catch(e){}
  const ok=(typeof pushAdminAccountsRemote==='function') ? await pushAdminAccountsRemote(next) : false;
  if(!ok){
    localStorage.setItem(ADMIN_HASH_KEY,JSON.stringify(accounts));
    msg.style.color='var(--red)';
    msg.textContent='원격 관리자 계정 저장에 실패했습니다. 다시 시도해 주세요.';
    return;
  }
  msg.style.color='var(--green)';
  const roleLabel=role==='sub-admin'?'부관리자':'총관리자';
  msg.textContent=`✅ ${roleLabel} 계정이 추가되었습니다. 총 ${next.length}명`;
  document.getElementById('adm-id').value='';
  document.getElementById('adm-pw').value='';
  reCfg();
}

async function clearAllAdmins(){
  if(!confirm('모든 관리자 계정을 삭제할까요?\n원격 관리자 계정 목록도 함께 비워집니다.'))return;
  const token=(localStorage.getItem('su_gh_token')||'').trim();
  if(!token){ alert('원격 관리자 계정 관리를 위해 GitHub 토큰을 먼저 설정하세요.'); return; }
  const prev=getAdminAccounts();
  localStorage.setItem(ADMIN_HASH_KEY,JSON.stringify([]));
  try{ localStorage.setItem('su_admin_hashes_updated_at', String(Date.now())); }catch(e){}
  const ok=(typeof pushAdminAccountsRemote==='function') ? await pushAdminAccountsRemote([]) : false;
  if(!ok){
    localStorage.setItem(ADMIN_HASH_KEY,JSON.stringify(prev));
    alert('원격 관리자 계정 삭제에 실패했습니다. 다시 시도해 주세요.');
    return;
  }
  doLogout();
  alert('초기화 완료. 원격 관리자 계정 목록이 비워졌습니다.');
}

function saveFbPw(){
  const pw = document.getElementById('cfg-fb-pw')?.value.trim();
  const statusEl = document.getElementById('fb-pw-status');
  if (!pw) { if(statusEl) statusEl.textContent = '⚠️ 보조 신호 비밀번호를 입력하세요.'; return; }
  localStorage.setItem('su_fb_pw', pw);
  if (statusEl) statusEl.textContent = '✅ 보조 신호 비밀번호 저장됨';
  const input = document.getElementById('cfg-fb-pw');
  if (input) input.value = '';
}
function clearFbPw(){
  localStorage.removeItem('su_fb_pw');
  const statusEl = document.getElementById('fb-pw-status');
  if (statusEl) statusEl.textContent = '미설정';
}
function saveGhToken(){
  const val = document.getElementById('cfg-gh-token')?.value.trim();
  const statusEl = document.getElementById('gh-token-status');
  if (!val) { if(statusEl) statusEl.textContent = '⚠️ 토큰을 입력하세요.'; return; }
  localStorage.setItem('su_gh_token', val);
  if(statusEl) statusEl.textContent = '✅ 토큰 저장됨 (저장 시 GitHub 자동 업로드 활성)';
  const input = document.getElementById('cfg-gh-token');
  if(input) input.value = '';
}
function clearGhToken(){
  localStorage.removeItem('su_gh_token');
  const statusEl = document.getElementById('gh-token-status');
  if(statusEl) statusEl.textContent = '미설정 (GitHub 업로드 비활성 / 보조 신호만 수신)';
}

/* ==========================================
   STATISTICS TAB
========================================== */
let statsSub='overview';
