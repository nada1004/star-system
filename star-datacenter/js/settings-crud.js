/* ════════════════════════════════════════════════════════
   settings-crud.js  —  스트리머 데이터 CRUD 및 설정 수정
   addPlayer / addTier / addUniv / _univDrag* 권위 소스 (SINGLE SOURCE)
   WARNING fix: settings.js / tier-tour.js의 중복 정의 제거됨
   ────────────────────────────────────────────────────────
   §1  선수(스트리머) CRUD     — addPlayer / bulkAddPlayers / openEP / savePlayer / delPlayer
   §2  openEP 헬퍼            — _savePhotoPos / 포지션 변수 초기화
   §3  모달 → 수정창 진입     — openEPFromModal
   §4  경기 기록 수정         — openRE / saveRow / _buildMemberEditHTML
   §5  대학 CRUD              — addUniv / delUniv / renameUnivAcrossData
   §6  티어 테마              — cfgTierTheme*
   §7  색상 유틸              — cfgNormHex / cfgPickColorHex
   §8  관리자 계정            — addAdminAccount / clearAllAdmins
   §9  인증 토큰              — saveFbPw / saveGhToken
════════════════════════════════════════════════════════ */
/* ════════════════════════════════════════════════════════
   §1  선수(스트리머) CRUD
════════════════════════════════════════════════════════ */
function addPlayer(){
  const n=document.getElementById('p-name').value.trim();
  if(!n)return alert('이름을 입력하세요.');
  if(players.find(p=>p.name===n)&&!confirm(`"${n}" 이름이 이미 있습니다.\n동명이인으로 등록할까요?`))return;
  const _pRole=(document.getElementById('p-role')?.value||'').trim();
  const _pPhoto=(document.getElementById('p-photo')?.value||'').trim();
  if(_pPhoto){
    if(_pPhoto.startsWith('data:')){alert('base64 이미지 직접 입력 불가 — imgur.com 등에 업로드 후 URL 사용');return;}
    if(_pPhoto.length>2000&&!confirm(`이미지 URL이 매우 깁니다 (${_pPhoto.length}자). 계속할까요?`))return;
  }
  const _pHideBoard=document.getElementById('p-hide-board')?.checked||false;
  const _pGender=document.getElementById('p-gender')?.value||'M';
  const playerData={name:n,univ:document.getElementById('p-univ').value,tier:document.getElementById('p-tier').value,
    race:document.getElementById('p-race').value,gender:_pGender,role:_pRole||undefined,
    photo:_pPhoto||undefined,hideFromBoard:_pHideBoard||undefined,
    gameType:'starcraft',win:0,loss:0,points:0,history:[]};

  players.push(playerData);
  document.getElementById('p-name').value='';
  document.getElementById('p-photo').value='';
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
  // 포지션 보정값 초기화 헬퍼 (undefined/NaN 처리 + 범위 클램프)
  const _pct  = (v, d) => { const n = parseInt(v ?? d, 10); return isNaN(n) ? d : Math.max(0, Math.min(100, n)); };
  const _dly  = (v)    => { const n = parseFloat(v ?? 1);  return isNaN(n) ? 1 : Math.max(0.2, Math.min(60, n)); };
  const _use  = (v)    => v !== false;

  const _p1X = _pct(p.photoPosX, 50),         _p1Y = _pct(p.photoPosY, 50),         _p1Use = _use(p.photoPosUse);
  const _p2X = _pct(p.photo2PosX, 50),        _p2Y = _pct(p.photo2PosY, 50),        _p2Use = _use(p.photo2PosUse);
  const _p3X = _pct(p.photo3PosX, 50),        _p3Y = _pct(p.photo3PosY, 50),        _p3Use = _use(p.photo3PosUse);
  const _p4X = _pct(p.photo4PosX, 50),        _p4Y = _pct(p.photo4PosY, 50),        _p4Use = _use(p.photo4PosUse);
  const _p5X = _pct(p.photo5PosX, 50),        _p5Y = _pct(p.photo5PosY, 50),        _p5Use = _use(p.photo5PosUse);
  const _scX = _pct(p.shareCardPhotoPosX, 50), _scY = _pct(p.shareCardPhotoPosY, 22), _scUse = _use(p.shareCardPhotoPosUse);
  const _d12 = _dly(p.photoDelay12), _d21 = _dly(p.photoDelay21 ?? p.photoDelay51), _d23 = _dly(p.photoDelay23), _d31 = _dly(p.photoDelay31 ?? p.photoDelay51), _d34 = _dly(p.photoDelay34), _d41 = _dly(p.photoDelay41 ?? p.photoDelay51), _d45 = _dly(p.photoDelay45), _d51 = _dly(p.photoDelay51);
  const _slotOrder = [
    { slot:1, url:String(p.photo||'').trim() },
    { slot:2, url:String(p.secondProfileFile||'').trim() },
    { slot:3, url:String(p.profileFile3||'').trim() },
    { slot:4, url:String(p.profileFile4||'').trim() },
    { slot:5, url:String(p.profileFile5||'').trim() }
  ].filter(item=>!!item.url);
  const _delayKey = (from, to)=>{
    if(to === 1){
      if(from === 2) return 'photoDelay21';
      if(from === 3) return 'photoDelay31';
      if(from === 4) return 'photoDelay41';
      return 'photoDelay51';
    }
    if(from === 1) return 'photoDelay12';
    if(from === 2) return 'photoDelay23';
    if(from === 3) return 'photoDelay34';
    if(from === 4) return 'photoDelay45';
    return '';
  };
  const _delayValue = (key)=>{
    const n = parseFloat(p?.[key] ?? 1);
    if(isNaN(n)) return 1;
    return Math.max(0.2, Math.min(60, n));
  };
  const _swapDelayHtml = _slotOrder.length < 2
    ? `<div style="font-size:11px;color:var(--gray-l);line-height:1.65">등록된 이미지가 1개라 전환 시간 설정이 필요하지 않습니다.</div>`
    : `<div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px">${_slotOrder.map((item, idx)=>{
        const next = _slotOrder[(idx + 1) % _slotOrder.length];
        const key = _delayKey(item.slot, next.slot);
        if(!key) return '';
        return `<div>
          <div style="font-size:11px;font-weight:800;color:var(--text3);margin-bottom:4px">${item.slot} → ${next.slot}</div>
          <input type="number" data-delay-key="${key}" min="0.2" max="60" step="0.1" value="${_delayValue(key)}" style="width:100%">
        </div>`;
      }).join('')}</div>`;
  const _epCollapsed = (key, def=true) => {
    try{
      const raw = localStorage.getItem('editPlayerSectionCollapsed');
      const map = raw ? JSON.parse(raw) : {};
      return Object.prototype.hasOwnProperty.call(map, key) ? !!map[key] : def;
    }catch(e){ return def; }
  };
  const _epCycleCollapsed = _epCollapsed('cycle', true);
  const _epP2Collapsed = _epCollapsed('p2', true);
  const _epP345Collapsed = _epCollapsed('p345', true);
  const _epHeaderCollapsed = _epCollapsed('header', true);
  const _epCardCollapsed = _epCollapsed('card', true);
  const _epShareBgCollapsed = _epCollapsed('sharebg', true);
  try{ localStorage.removeItem('editPlayerSimpleMode'); }catch(e){}
  document.getElementById('emBody').innerHTML=`
    <div id="ep-basic-top"></div>
    <div style="position:sticky;top:0;z-index:3;display:flex;gap:6px;flex-wrap:wrap;padding:8px 0 10px;margin-bottom:10px;background:linear-gradient(180deg,var(--white) 80%,rgba(255,255,255,0));border-bottom:1px solid var(--border)">
      <button type="button" class="btn btn-w btn-xs" onclick="jumpEditPlayerSection('ep-basic-top')">기본</button>
      <button type="button" class="btn btn-w btn-xs" data-ep-adv-nav="1" onclick="jumpEditPlayerSection('ep-cycle-sec')">이미지</button>
      <button type="button" class="btn btn-w btn-xs" data-ep-adv-nav="1" onclick="jumpEditPlayerSection('ep-header-sec')">헤더배경</button>
      <button type="button" class="btn btn-w btn-xs" data-ep-adv-nav="1" onclick="jumpEditPlayerSection('ep-card-sec')">공유카드</button>
      <button type="button" class="btn btn-w btn-xs" data-ep-adv-nav="1" onclick="jumpEditPlayerSection('ep-score-sec')">승패</button>
      <button type="button" class="btn btn-w btn-xs" data-ep-adv-nav="1" onclick="jumpEditPlayerSection('ep-memo-sec')">메모</button>
      <button type="button" class="btn btn-w btn-xs" data-ep-adv-nav="1" onclick="jumpEditPlayerSection('ep-alias-sec')">별명</button>
    </div>
    <div id="ep-basic-info" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:12px 14px;align-items:start;margin-bottom:14px">
      <div style="min-width:0">
        <label>스트리머 이름</label>
        <input type="text" id="ed-n" value="${p.name}">
      </div>
      <div style="min-width:0">
        <label>티어</label>
        <select id="ed-t">${TIERS.map(t=>`<option value="${t}"${p.tier===t?' selected':''}>${getTierLabel(t)}</option>`).join('')}</select>
      </div>
      <div style="min-width:0">
        <label>대학</label>
        <div style="display:flex;gap:6px;align-items:center">
          <select id="ed-u" style="flex:1;min-width:0">${getAllUnivs().filter(u=>!u.dissolved||u.name===p.univ).map(u=>`<option value="${u.name}"${p.univ===u.name?' selected':''}>${u.name}</option>`).join('')}</select>
          ${p.univ!=='무소속'?`<button type="button" onclick="document.getElementById('ed-u').value='무소속'" style="flex-shrink:0;padding:4px 10px;border-radius:7px;border:1.5px solid #9ca3af;background:var(--surface);color:#6b7280;font-size:11px;font-weight:700;cursor:pointer;white-space:nowrap">🚶 무소속</button>`:''}
        </div>
      </div>
      <div style="min-width:0">
        <label>종족</label>
        <select id="ed-r"><option value="T"${p.race==='T'?' selected':''}>테란</option><option value="Z"${p.race==='Z'?' selected':''}>저그</option><option value="P"${p.race==='P'?' selected':''}>프로토스</option><option value="N"${p.race==='N'?' selected':''}>종족미정</option></select>
      </div>
      <div style="min-width:0">
        <label>성별</label>
        <select id="ed-g"><option value="F"${(p.gender||'F')==='F'?' selected':''}>👩 여자</option><option value="M"${p.gender==='M'?' selected':''}>👨 남자</option></select>
      </div>
      <div style="grid-column:1 / -1;min-width:0">
        <label>직책 <span style="font-size:10px;font-weight:400;color:var(--gray-l)">(이사장/선장/동아리장/반장/총장/부총장/총괄/교수/코치는 정렬 우선순위 적용)</span></label>
        <div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:6px">
          ${MAIN_ROLES.map(r=>{const ic=ROLE_ICONS[r]||'🏷️';const col=ROLE_COLORS[r]||'#6b7280';return `<button type="button" onclick="const el=document.getElementById('ed-role');el.value=el.value===this.dataset.role?'':this.dataset.role;" data-role="${r}" style="padding:3px 8px;border-radius:6px;border:1.5px solid ${col};background:${p.role===r?col+'22':'var(--white)'};color:${col};font-size:11px;font-weight:700;cursor:pointer">${ic} ${r}</button>`;}).join('')}
          <button type="button" onclick="document.getElementById('ed-role').value=''" style="padding:3px 8px;border-radius:6px;border:1.5px solid #9ca3af;background:var(--white);color:#9ca3af;font-size:11px;font-weight:700;cursor:pointer">✕ 없음</button>
        </div>
        <input type="text" id="ed-role" value="${p.role||''}" placeholder="직책 직접 입력 또는 위 버튼 클릭" style="width:100%">
      </div>
      <div style="grid-column:1 / -1;min-width:0">
        <label>🏠 방송국 홈 URL <span style="font-size:10px;font-weight:400;color:var(--gray-l)">(홈 아이콘 클릭 시 이동)</span></label>
        <div style="display:flex;gap:8px;align-items:center">
          <input type="text" id="ed-channel" value="${p.channelUrl||''}" placeholder="https://chzzk.naver.com/... 또는 https://twitch.tv/..." style="flex:1;min-width:0">
          ${p.channelUrl?`<a href="${p.channelUrl}" target="_blank" style="font-size:18px;text-decoration:none" title="방송국 바로가기">🏠</a>`:''}
        </div>
        <div style="font-size:10px;color:var(--gray-l);margin-top:6px">치지직/트위치/유튜브 등 방송국 주소. 스트리머 상세에서 홈 아이콘으로 이동됩니다.</div>
      </div>
    </div>
    <div id="ep-p1-sec" class="ep-adv-section">
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

    <div id="ep-cycle-sec" class="ep-adv-section" style="margin-top:10px;padding:12px;background:var(--surface);border:1px solid var(--border);border-radius:10px">
      <div style="display:flex;justify-content:space-between;align-items:center;gap:8px">
        <div>
          <div style="font-weight:700;font-size:12px;color:var(--text2)">순환 이미지 (최대 5장)</div>
          <div style="font-size:11px;color:var(--gray-l);line-height:1.6;margin-top:4px">이미지별 탭에서 순서대로 전환됩니다. (전환 시간은 아래에서 설정)</div>
        </div>
        <button type="button" class="btn btn-w btn-xs" data-ep-toggle="cycle" onclick="toggleEditPlayerSection('cycle', this)">${_epCycleCollapsed?'펼치기':'접기'}</button>
      </div>
      <div id="ep-sec-body-cycle" style="display:${_epCycleCollapsed?'none':'block'};margin-top:${_epCycleCollapsed?'0':'10px'}">
      <div style="display:flex;flex-direction:column;gap:6px">
        <div style="display:flex;align-items:center;gap:8px">
          <span style="font-size:11px;font-weight:700;color:var(--text3);min-width:36px">이미지 1</span>
          <input type="text" id="ed-photo" value="${p.photo||''}" placeholder="https://... 기본 프로필 (현황판 카드에도 사용)" style="flex:1" oninput="(function(el){const v=el.value.trim();const img=document.getElementById('ed-photo-preview');const warn=document.getElementById('ed-photo-warn');if(v&&v.startsWith('data:')){el.style.borderColor='#dc2626';if(warn){warn.style.color='#dc2626';warn.textContent='❌ base64 이미지 직접 입력 불가 — imgur.com 등에 업로드 후 URL 사용';}}else{el.style.borderColor='';if(warn){warn.textContent='이미지 URL을 붙여넣으면 현황판 선수 카드에 프로필 사진이 표시됩니다.';warn.style.color='var(--gray-l)';}}const wrap=document.getElementById('ed-photo-preview-wrap');if(v&&!v.startsWith('data:')){img.src=v;img.style.display='block';if(wrap)wrap.style.display='inline-block';}else{if(wrap)wrap.style.display='none';}})(this)">
          <span id="ed-photo-preview-wrap" style="position:relative;width:36px;height:36px;border-radius:var(--su_profile_radius,50%);overflow:hidden;flex-shrink:0;background:#e2e8f0;border:2px solid var(--border);display:${p.photo&&!p.photo.startsWith('data:')?'inline-block':'none'}">
            <img id="ed-photo-preview" src="${p.photo&&!p.photo.startsWith('data:')?toHttpsUrl(p.photo):''}" style="width:36px;height:36px;object-fit:cover;display:block" onerror="this.style.display='none'">
          </span>
        </div>
        <div id="ed-photo-warn" style="font-size:10px;color:${p.photo&&p.photo.startsWith('data:')?'#dc2626':'var(--gray-l)'};margin-left:44px">${p.photo&&p.photo.startsWith('data:')?'❌ base64 이미지 직접 입력 불가 — imgur.com 등에 업로드 후 URL 사용':'이미지 1은 현황판 카드에도 사용됩니다.'}</div>
        <div style="display:flex;align-items:center;gap:8px">
          <span style="font-size:11px;font-weight:700;color:var(--text3);min-width:36px">이미지 2</span>
          <input type="text" id="ed-photo2" value="${p.secondProfileFile||''}" placeholder="https://... (전환 시간 설정 가능)" style="flex:1" oninput="syncEditPlayerThumbPreview('ed-photo2','ed-photo2-preview-wrap','ed-photo2-preview');edP2PosSyncFromInputs(true)">
          <span id="ed-photo2-preview-wrap" title="이미지 2 미리보기" style="position:relative;width:48px;height:48px;border-radius:12px;overflow:hidden;flex-shrink:0;background:#e2e8f0;border:2px solid var(--border);display:${p.secondProfileFile&&!p.secondProfileFile.startsWith('data:')?'inline-flex':'none'};align-items:center;justify-content:center">
            <img id="ed-photo2-preview" src="${p.secondProfileFile&&!p.secondProfileFile.startsWith('data:')?toHttpsUrl(p.secondProfileFile).replace(/\"/g,'&quot;'):''}" style="width:48px;height:48px;object-fit:cover;display:block" onerror="this.style.display='none'">
          </span>
        </div>
        <div style="display:flex;align-items:center;gap:8px">
          <span style="font-size:11px;font-weight:700;color:var(--text3);min-width:36px">이미지 3</span>
          <input type="text" id="ed-photo3" value="${p.profileFile3||''}" placeholder="https://... (선택)" style="flex:1" oninput="syncEditPlayerThumbPreview('ed-photo3','ed-photo3-preview-wrap','ed-photo3-preview');edP3PosSyncFromInputs(true)">
          <span id="ed-photo3-preview-wrap" title="이미지 3 미리보기" style="position:relative;width:48px;height:48px;border-radius:12px;overflow:hidden;flex-shrink:0;background:#e2e8f0;border:2px solid var(--border);display:${p.profileFile3&&!p.profileFile3.startsWith('data:')?'inline-flex':'none'};align-items:center;justify-content:center">
            <img id="ed-photo3-preview" src="${p.profileFile3&&!p.profileFile3.startsWith('data:')?toHttpsUrl(p.profileFile3).replace(/\"/g,'&quot;'):''}" style="width:48px;height:48px;object-fit:cover;display:block" onerror="this.style.display='none'">
          </span>
        </div>
        <div style="display:flex;align-items:center;gap:8px">
          <span style="font-size:11px;font-weight:700;color:var(--text3);min-width:36px">이미지 4</span>
          <input type="text" id="ed-photo4" value="${p.profileFile4||''}" placeholder="https://... (선택)" style="flex:1" oninput="syncEditPlayerThumbPreview('ed-photo4','ed-photo4-preview-wrap','ed-photo4-preview');edP4PosSyncFromInputs(true)">
          <span id="ed-photo4-preview-wrap" title="이미지 4 미리보기" style="position:relative;width:48px;height:48px;border-radius:12px;overflow:hidden;flex-shrink:0;background:#e2e8f0;border:2px solid var(--border);display:${p.profileFile4&&!p.profileFile4.startsWith('data:')?'inline-flex':'none'};align-items:center;justify-content:center">
            <img id="ed-photo4-preview" src="${p.profileFile4&&!p.profileFile4.startsWith('data:')?toHttpsUrl(p.profileFile4).replace(/\"/g,'&quot;'):''}" style="width:48px;height:48px;object-fit:cover;display:block" onerror="this.style.display='none'">
          </span>
        </div>
        <div style="display:flex;align-items:center;gap:8px">
          <span style="font-size:11px;font-weight:700;color:var(--text3);min-width:36px">이미지 5</span>
          <input type="text" id="ed-photo5" value="${p.profileFile5||''}" placeholder="https://... (선택)" style="flex:1" oninput="syncEditPlayerThumbPreview('ed-photo5','ed-photo5-preview-wrap','ed-photo5-preview');edP5PosSyncFromInputs(true)">
          <span id="ed-photo5-preview-wrap" title="이미지 5 미리보기" style="position:relative;width:48px;height:48px;border-radius:12px;overflow:hidden;flex-shrink:0;background:#e2e8f0;border:2px solid var(--border);display:${p.profileFile5&&!p.profileFile5.startsWith('data:')?'inline-flex':'none'};align-items:center;justify-content:center">
            <img id="ed-photo5-preview" src="${p.profileFile5&&!p.profileFile5.startsWith('data:')?toHttpsUrl(p.profileFile5).replace(/\"/g,'&quot;'):''}" style="width:48px;height:48px;object-fit:cover;display:block" onerror="this.style.display='none'">
          </span>
        </div>
      </div>
      <div style="margin-top:10px;padding:10px;background:rgba(37,99,235,.06);border:1px solid rgba(37,99,235,.18);border-radius:10px">
        <div style="font-size:12px;font-weight:900;color:var(--text2);margin-bottom:8px">전환 시간(초)</div>
        ${_swapDelayHtml}
        <div style="font-size:10px;color:var(--gray-l);margin-top:6px">※ 실제 존재하는 이미지 순서만 순환합니다.</div>
      </div>
      </div>
    </div>

    <div id="ep-p2-sec" class="ep-adv-section" style="margin-top:10px;padding:12px;background:var(--surface);border:1px solid var(--border);border-radius:10px">
      <div style="display:flex;justify-content:space-between;align-items:center;gap:8px">
        <div>
          <div style="font-weight:700;font-size:12px;color:var(--text2)">프로필 사진 2 — 얼굴 위치 보정</div>
          <div style="font-size:11px;color:var(--gray-l);line-height:1.6;margin-top:4px">프로필 2도 필요하면 위치를 저장할 수 있습니다.</div>
        </div>
        <button type="button" class="btn btn-w btn-xs" data-ep-toggle="p2" onclick="toggleEditPlayerSection('p2', this)">${_epP2Collapsed?'펼치기':'접기'}</button>
      </div>
      <div id="ep-sec-body-p2" style="display:${_epP2Collapsed?'none':'block'};margin-top:${_epP2Collapsed?'0':'10px'}">
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
    </div>

    <div id="ep-p345-sec" class="ep-adv-section" style="margin-top:10px;padding:12px;background:var(--surface);border:1px solid var(--border);border-radius:10px">
      <div style="display:flex;justify-content:space-between;align-items:center;gap:8px">
        <div>
          <div style="font-weight:700;font-size:12px;color:var(--text2)">프로필 사진 3/4/5 — 얼굴 위치 보정</div>
          <div style="font-size:11px;color:var(--gray-l);line-height:1.6;margin-top:4px">프로필 3~5도 필요하면 위치를 저장할 수 있습니다.</div>
        </div>
        <button type="button" class="btn btn-w btn-xs" data-ep-toggle="p345" onclick="toggleEditPlayerSection('p345', this)">${_epP345Collapsed?'펼치기':'접기'}</button>
      </div>
      <div id="ep-sec-body-p345" style="display:${_epP345Collapsed?'none':'block'};margin-top:${_epP345Collapsed?'0':'10px'}">

      <div style="padding:12px;background:rgba(255,255,255,.6);border:1px solid var(--border);border-radius:10px">
        <div style="font-weight:900;font-size:12px;color:var(--text2);margin-bottom:6px">이미지 3</div>
        <label style="display:flex;align-items:center;gap:6px;font-size:11px;font-weight:900;color:var(--text3);margin:-2px 0 10px">
          <input type="checkbox" id="ed-p3pos-use" ${_p3Use?'checked':''} onchange="document.getElementById('ed-p3pos-prev').style.opacity=this.checked?1:.55">
          이 보정 적용
        </label>
        <input type="hidden" id="ed-p3pos-del" value="0">
        <div id="ed-p3pos-prev" style="position:relative;height:140px;border-radius:16px;overflow:hidden;border:1.5px solid var(--border);background:linear-gradient(135deg, rgba(100,116,139,.26), rgba(100,116,139,.10));touch-action:none;user-select:none;opacity:${_p3Use?1:.55}">
          ${p.profileFile3?`<img id="ed-p3pos-img" src="${toHttpsUrl(p.profileFile3).replace(/\"/g,'&quot;')}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:${_p3X}% ${_p3Y}%;transform:scale(1.02)" onerror="this.style.display='none'">`:''}
          <div style="position:absolute;inset:0;background:linear-gradient(180deg, rgba(15,23,42,.04) 0%, rgba(15,23,42,.10) 60%, rgba(15,23,42,.22) 100%)"></div>
        </div>
        <div style="display:grid;grid-template-columns:76px 1fr 52px;gap:10px;align-items:center;margin-top:10px">
          <div style="font-size:12px;font-weight:800;color:var(--text2)">가로(X)</div>
          <input type="range" id="ed-p3pos-x" min="0" max="100" step="1" value="${_p3X}" oninput="edP3PosSyncFromInputs()" style="width:100%">
          <div id="ed-p3pos-xv" style="font-size:11px;color:var(--gray-l);font-weight:900;text-align:right">${_p3X}%</div>
        </div>
        <div style="display:grid;grid-template-columns:76px 1fr 52px;gap:10px;align-items:center;margin-top:6px">
          <div style="font-size:12px;font-weight:800;color:var(--text2)">세로(Y)</div>
          <input type="range" id="ed-p3pos-y" min="0" max="100" step="1" value="${_p3Y}" oninput="edP3PosSyncFromInputs()" style="width:100%">
          <div id="ed-p3pos-yv" style="font-size:11px;color:var(--gray-l);font-weight:900;text-align:right">${_p3Y}%</div>
        </div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end;margin-top:10px">
          <button type="button" class="btn btn-w btn-xs" onclick="edP3PosCenter()">센터(50/50)</button>
          <button type="button" class="btn btn-w btn-xs" onclick="edP3PosDelete()">삭제(기본)</button>
        </div>
      </div>

      <div style="margin-top:10px;padding:12px;background:rgba(255,255,255,.6);border:1px solid var(--border);border-radius:10px">
        <div style="font-weight:900;font-size:12px;color:var(--text2);margin-bottom:6px">이미지 4</div>
        <label style="display:flex;align-items:center;gap:6px;font-size:11px;font-weight:900;color:var(--text3);margin:-2px 0 10px">
          <input type="checkbox" id="ed-p4pos-use" ${_p4Use?'checked':''} onchange="document.getElementById('ed-p4pos-prev').style.opacity=this.checked?1:.55">
          이 보정 적용
        </label>
        <input type="hidden" id="ed-p4pos-del" value="0">
        <div id="ed-p4pos-prev" style="position:relative;height:140px;border-radius:16px;overflow:hidden;border:1.5px solid var(--border);background:linear-gradient(135deg, rgba(100,116,139,.26), rgba(100,116,139,.10));touch-action:none;user-select:none;opacity:${_p4Use?1:.55}">
          ${p.profileFile4?`<img id="ed-p4pos-img" src="${toHttpsUrl(p.profileFile4).replace(/\"/g,'&quot;')}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:${_p4X}% ${_p4Y}%;transform:scale(1.02)" onerror="this.style.display='none'">`:''}
          <div style="position:absolute;inset:0;background:linear-gradient(180deg, rgba(15,23,42,.04) 0%, rgba(15,23,42,.10) 60%, rgba(15,23,42,.22) 100%)"></div>
        </div>
        <div style="display:grid;grid-template-columns:76px 1fr 52px;gap:10px;align-items:center;margin-top:10px">
          <div style="font-size:12px;font-weight:800;color:var(--text2)">가로(X)</div>
          <input type="range" id="ed-p4pos-x" min="0" max="100" step="1" value="${_p4X}" oninput="edP4PosSyncFromInputs()" style="width:100%">
          <div id="ed-p4pos-xv" style="font-size:11px;color:var(--gray-l);font-weight:900;text-align:right">${_p4X}%</div>
        </div>
        <div style="display:grid;grid-template-columns:76px 1fr 52px;gap:10px;align-items:center;margin-top:6px">
          <div style="font-size:12px;font-weight:800;color:var(--text2)">세로(Y)</div>
          <input type="range" id="ed-p4pos-y" min="0" max="100" step="1" value="${_p4Y}" oninput="edP4PosSyncFromInputs()" style="width:100%">
          <div id="ed-p4pos-yv" style="font-size:11px;color:var(--gray-l);font-weight:900;text-align:right">${_p4Y}%</div>
        </div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end;margin-top:10px">
          <button type="button" class="btn btn-w btn-xs" onclick="edP4PosCenter()">센터(50/50)</button>
          <button type="button" class="btn btn-w btn-xs" onclick="edP4PosDelete()">삭제(기본)</button>
        </div>
      </div>

      <div style="margin-top:10px;padding:12px;background:rgba(255,255,255,.6);border:1px solid var(--border);border-radius:10px">
        <div style="font-weight:900;font-size:12px;color:var(--text2);margin-bottom:6px">이미지 5</div>
        <label style="display:flex;align-items:center;gap:6px;font-size:11px;font-weight:900;color:var(--text3);margin:-2px 0 10px">
          <input type="checkbox" id="ed-p5pos-use" ${_p5Use?'checked':''} onchange="document.getElementById('ed-p5pos-prev').style.opacity=this.checked?1:.55">
          이 보정 적용
        </label>
        <input type="hidden" id="ed-p5pos-del" value="0">
        <div id="ed-p5pos-prev" style="position:relative;height:140px;border-radius:16px;overflow:hidden;border:1.5px solid var(--border);background:linear-gradient(135deg, rgba(100,116,139,.26), rgba(100,116,139,.10));touch-action:none;user-select:none;opacity:${_p5Use?1:.55}">
          ${p.profileFile5?`<img id="ed-p5pos-img" src="${toHttpsUrl(p.profileFile5).replace(/\"/g,'&quot;')}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:${_p5X}% ${_p5Y}%;transform:scale(1.02)" onerror="this.style.display='none'">`:''}
          <div style="position:absolute;inset:0;background:linear-gradient(180deg, rgba(15,23,42,.04) 0%, rgba(15,23,42,.10) 60%, rgba(15,23,42,.22) 100%)"></div>
        </div>
        <div style="display:grid;grid-template-columns:76px 1fr 52px;gap:10px;align-items:center;margin-top:10px">
          <div style="font-size:12px;font-weight:800;color:var(--text2)">가로(X)</div>
          <input type="range" id="ed-p5pos-x" min="0" max="100" step="1" value="${_p5X}" oninput="edP5PosSyncFromInputs()" style="width:100%">
          <div id="ed-p5pos-xv" style="font-size:11px;color:var(--gray-l);font-weight:900;text-align:right">${_p5X}%</div>
        </div>
        <div style="display:grid;grid-template-columns:76px 1fr 52px;gap:10px;align-items:center;margin-top:6px">
          <div style="font-size:12px;font-weight:800;color:var(--text2)">세로(Y)</div>
          <input type="range" id="ed-p5pos-y" min="0" max="100" step="1" value="${_p5Y}" oninput="edP5PosSyncFromInputs()" style="width:100%">
          <div id="ed-p5pos-yv" style="font-size:11px;color:var(--gray-l);font-weight:900;text-align:right">${_p5Y}%</div>
        </div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end;margin-top:10px">
          <button type="button" class="btn btn-w btn-xs" onclick="edP5PosCenter()">센터(50/50)</button>
          <button type="button" class="btn btn-w btn-xs" onclick="edP5PosDelete()">삭제(기본)</button>
        </div>
      </div>
      </div>
    </div>
    <div id="ep-header-sec" class="ep-adv-section" style="margin-top:14px;padding:12px;background:var(--surface);border:1px solid var(--border);border-radius:8px">
      <div style="display:flex;justify-content:space-between;align-items:center;gap:8px">
        <div style="font-weight:700;font-size:12px;color:var(--text2)">스트리머 상세 헤더 배경</div>
        <button type="button" class="btn btn-w btn-xs" data-ep-toggle="header" onclick="toggleEditPlayerSection('header', this)">${_epHeaderCollapsed?'펼치기':'접기'}</button>
      </div>
      <div id="ep-sec-body-header" style="display:${_epHeaderCollapsed?'none':'block'};margin-top:${_epHeaderCollapsed?'0':'10px'}">
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
    </div>
    <div id="ep-card-sec" class="ep-adv-section" style="margin-top:14px;padding:12px;background:var(--surface);border:1px solid var(--border);border-radius:8px">
      <div style="display:flex;justify-content:space-between;align-items:center;gap:8px">
        <div>
          <div style="font-weight:700;font-size:12px;color:var(--text2)">카드 전용 이미지</div>
          <div style="font-size:11px;color:var(--gray-l);line-height:1.6;margin-top:4px">비워두면 프로필 사진 1을 사용합니다. 카드형 레이아웃(개인전·끝장전·프로리그 끝장전)에만 적용됩니다.</div>
        </div>
        <button type="button" class="btn btn-w btn-xs" data-ep-toggle="card" onclick="toggleEditPlayerSection('card', this)">${_epCardCollapsed?'펼치기':'접기'}</button>
      </div>
      <div id="ep-sec-body-card" style="display:${_epCardCollapsed?'none':'block'};margin-top:${_epCardCollapsed?'0':'8px'}">
      <div style="margin-bottom:10px;padding:10px;background:var(--white);border:1px solid var(--border);border-radius:10px">
        <div style="font-weight:700;font-size:12px;color:var(--text2);margin-bottom:6px">얼굴 위치 보정</div>
        <div style="font-size:11px;color:#78350f;line-height:1.6;margin-bottom:10px">(채우기/cover 기준) 아래 미리보기에서 <b>드래그</b>하거나 X/Y로 위치를 보정할 수 있습니다.</div>
        <label style="display:flex;align-items:center;gap:6px;font-size:11px;font-weight:700;color:var(--text3);margin:-2px 0 10px">
          <input type="checkbox" id="ed-cardpos-use" ${_scUse?'checked':''} onchange="document.getElementById('ed-cardpos-prev').style.opacity=this.checked?1:.55">
          이 보정 적용
        </label>
        <input type="hidden" id="ed-cardpos-del" value="0">
        <div id="ed-cardpos-prev" style="position:relative;height:150px;border-radius:16px;overflow:hidden;border:1.5px solid var(--border);background:linear-gradient(135deg, rgba(100,116,139,.20), rgba(100,116,139,.06));touch-action:none;user-select:none;opacity:${_scUse?1:.55}">
          ${p.shareCardPhoto?`<img id="ed-cardpos-img" src="${toHttpsUrl(p.shareCardPhoto).replace(/\"/g,'&quot;')}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:${_scX}% ${_scY}%;transform:scale(1.02)" onerror="this.style.display='none'">`:''}
          <div style="position:absolute;inset:0;background:linear-gradient(180deg, rgba(15,23,42,.04) 0%, rgba(15,23,42,.10) 60%, rgba(15,23,42,.22) 100%)"></div>
          <div style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:18px;height:18px;border-radius:999px;border:2px solid rgba(255,255,255,.9);box-shadow:0 2px 10px rgba(0,0,0,.35);pointer-events:none"></div>
          <div style="position:absolute;left:50%;top:0;bottom:0;width:1px;background:rgba(255,255,255,.35);pointer-events:none"></div>
          <div style="position:absolute;top:50%;left:0;right:0;height:1px;background:rgba(255,255,255,.35);pointer-events:none"></div>
        </div>
        <div style="display:grid;grid-template-columns:90px 1fr 52px;gap:10px;align-items:center;margin-top:10px">
          <div style="font-size:11px;font-weight:700;color:var(--text2)">가로(X)</div>
          <input type="range" id="ed-cardpos-x" min="0" max="100" step="1" value="${_scX}" oninput="edCardPosSyncFromInputs()" style="width:100%">
          <div id="ed-cardpos-xv" style="font-size:11px;color:var(--gray-l);font-weight:700;text-align:right">${_scX}%</div>
        </div>
        <div style="display:grid;grid-template-columns:90px 1fr 52px;gap:10px;align-items:center;margin-top:8px">
          <div style="font-size:11px;font-weight:700;color:var(--text2)">세로(Y)</div>
          <input type="range" id="ed-cardpos-y" min="0" max="100" step="1" value="${_scY}" oninput="edCardPosSyncFromInputs()" style="width:100%">
          <div id="ed-cardpos-yv" style="font-size:11px;color:var(--gray-l);font-weight:700;text-align:right">${_scY}%</div>
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px">
          <button type="button" class="btn btn-w btn-xs" onclick="edCardPosCenter()">센터(50/22)</button>
          <button type="button" class="btn btn-w btn-xs" onclick="edCardPosDelete()">삭제(기본)</button>
        </div>
      </div>
      <input type="text" id="ed-card-photo" value="${p.shareCardPhoto||''}" placeholder="https://... 이미지 URL 입력" style="width:100%" oninput="edCardPosSyncFromInputs(true)">
      </div>
    </div>
    <div id="ep-sharebg-sec" class="ep-adv-section" style="margin-top:14px;padding:12px;background:#f8fafc;border:1px solid var(--border);border-radius:8px">
      <div style="display:flex;justify-content:space-between;align-items:center;gap:8px">
        <div style="font-weight:700;font-size:12px;color:var(--text2)">개인 공유카드 배경</div>
        <button type="button" class="btn btn-w btn-xs" data-ep-toggle="sharebg" onclick="toggleEditPlayerSection('sharebg', this)">${_epShareBgCollapsed?'펼치기':'접기'}</button>
      </div>
      <div id="ep-sec-body-sharebg" style="display:${_epShareBgCollapsed?'none':'block'};margin-top:${_epShareBgCollapsed?'0':'10px'}">
      <label>배경 이미지 URL <span style="font-size:10px;font-weight:400;color:var(--gray-l)">(비워두면 대학색 배경 사용)</span></label>
      <input type="text" id="ed-sharebg" value="${p.shareCardBgImg||''}" placeholder="https://... 이미지 URL" oninput="edShareBgSyncFromInputs()">
      <div id="ed-sharebg-prev" style="position:relative;height:150px;border-radius:16px;overflow:hidden;border:1.5px solid var(--border);margin-top:10px;background:linear-gradient(135deg, rgba(100,116,139,.18), rgba(100,116,139,.06));user-select:none">
        ${(p.shareCardBgImg||'').trim()?`<div id="ed-sharebg-prev-bg" style="position:absolute;inset:-8%;background-image:url('${toHttpsUrl((p.shareCardBgImg||'').trim()).replace(/'/g,'%27')}');background-repeat:no-repeat;background-position:${((p.shareCardBgPosX||'center')+' '+(p.shareCardBgPosY||'center')).trim()};background-size:${(p.shareCardBgFit||'')==='fill'?'100% 100%':((p.shareCardBgFit||'')==='cover'?'cover':'contain')};transform:scale(${Math.max(40,Math.min(220,Number(p.shareCardBgScale||100)||100))/100});transform-origin:center center;opacity:.95;pointer-events:none"></div>`:''}
        <div id="ed-sharebg-prev-dark" style="position:absolute;inset:0;background:rgba(0,0,0,${Math.max(0,Math.min(85,Number(p.shareCardBgDark||18)||18))/100});pointer-events:none"></div>
        <div id="ed-sharebg-prev-fade" style="position:absolute;inset:0;background:rgba(255,255,255,${Math.max(0,Math.min(100,Number(p.shareCardBgFade||0)||0))/100});pointer-events:none"></div>
        ${!(p.shareCardBgImg||'').trim()?`<div id="ed-sharebg-prev-empty" style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:900;color:rgba(15,23,42,.55)">URL을 입력하면 미리보기가 표시됩니다</div>`:''}
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:10px">
        <div>
          <label>표시 방식</label>
          <select id="ed-sharebg-fit" onchange="edShareBgSyncFromInputs()">
            <option value=""${!p.shareCardBgFit?' selected':''}>기본값</option>
            <option value="contain"${p.shareCardBgFit==='contain'?' selected':''}>맞춤</option>
            <option value="cover"${p.shareCardBgFit==='cover'?' selected':''}>채우기</option>
            <option value="fill"${p.shareCardBgFit==='fill'?' selected':''}>늘리기</option>
          </select>
        </div>
        <div>
          <label>크기 조절</label>
          <div style="display:flex;align-items:center;gap:8px">
            <input type="range" id="ed-sharebg-scale" min="40" max="220" step="5" value="${Number(p.shareCardBgScale||100)||100}" style="flex:1;accent-color:var(--blue)" oninput="document.getElementById('ed-sharebg-scale-val').textContent=this.value+'%';edShareBgSyncFromInputs()">
            <span id="ed-sharebg-scale-val" style="font-size:11px;color:var(--gray-l);min-width:40px;text-align:right;font-weight:700">${Number(p.shareCardBgScale||100)||100}%</span>
          </div>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:10px">
        <div>
          <label>어둡게 덮기</label>
          <div style="display:flex;align-items:center;gap:8px">
            <input type="range" id="ed-sharebg-dark" min="0" max="85" step="5" value="${Number(p.shareCardBgDark||18)||18}" style="flex:1;accent-color:var(--blue)" oninput="document.getElementById('ed-sharebg-dark-val').textContent=this.value+'%';edShareBgSyncFromInputs()">
            <span id="ed-sharebg-dark-val" style="font-size:11px;color:var(--gray-l);min-width:40px;text-align:right;font-weight:700">${Number(p.shareCardBgDark||18)||18}%</span>
          </div>
        </div>
        <div>
          <label>반투명 밝기</label>
          <div style="display:flex;align-items:center;gap:8px">
            <input type="range" id="ed-sharebg-fade" min="0" max="100" step="5" value="${Number(p.shareCardBgFade||0)||0}" style="flex:1;accent-color:var(--blue)" oninput="document.getElementById('ed-sharebg-fade-val').textContent=this.value+'%';edShareBgSyncFromInputs()">
            <span id="ed-sharebg-fade-val" style="font-size:11px;color:var(--gray-l);min-width:40px;text-align:right;font-weight:700">${Number(p.shareCardBgFade||0)||0}%</span>
          </div>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:10px">
        <div>
          <label>가로 위치</label>
          <select id="ed-sharebg-posx" onchange="edShareBgSyncFromInputs()">
            <option value="left"${(p.shareCardBgPosX||'center')==='left'?' selected':''}>좌</option>
            <option value="center"${(!p.shareCardBgPosX||p.shareCardBgPosX==='center')?' selected':''}>중</option>
            <option value="right"${p.shareCardBgPosX==='right'?' selected':''}>우</option>
          </select>
        </div>
        <div>
          <label>세로 위치</label>
          <select id="ed-sharebg-posy" onchange="edShareBgSyncFromInputs()">
            <option value="top"${p.shareCardBgPosY==='top'?' selected':''}>상</option>
            <option value="center"${(!p.shareCardBgPosY||p.shareCardBgPosY==='center')?' selected':''}>중</option>
            <option value="bottom"${p.shareCardBgPosY==='bottom'?' selected':''}>하</option>
          </select>
        </div>
      </div>
      <div style="font-size:10px;color:var(--gray-l);margin-top:8px">공유카드 전용 배경입니다. 스트리머 상세 헤더 배경과 별도로 저장됩니다.</div>
      </div>
    </div>
    <div id="ep-icon-sec" class="ep-adv-section" style="margin-top:14px;padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:8px;">
      <div style="font-weight:700;font-size:12px;color:var(--text2);margin-bottom:10px">상태 아이콘</div>
      <div style="display:flex;flex-wrap:wrap;gap:6px" id="ed-icon-btns">
        ${(()=>{const cur=getStatusIcon(p.name);return Object.entries(STATUS_ICON_DEFS).map(([id,d])=>{const isSelected=(id==='none'&&!cur)||(d.emoji&&cur===d.emoji);const iconHTML=d.emoji?(_siIsImg(d.emoji)?_siRender(d.emoji,'18px'):d.emoji):'<span style="font-size:11px;font-weight:700">없음</span>';return `<button type="button" onclick="setStatusIconFromModal(this,'${escJS(p.name)}','${id}')" data-icon-id="${id}" title="${d.label}" style="padding:5px 10px;border-radius:7px;border:2px solid ${isSelected?'#16a34a':'var(--border)'};background:${isSelected?'#dcfce7':'var(--white)'};cursor:pointer;min-width:38px;transition:.12s;font-family:'Noto Sans KR',sans-serif;">${iconHTML}</button>`}).join('')})()}
      </div>
      <div id="ed-icon-label" style="font-size:11px;color:var(--gray-l);margin-top:7px">선택: ${(()=>{const c=getStatusIcon(p.name);const found=Object.entries(STATUS_ICON_DEFS).find(([,d])=>d.emoji&&d.emoji===c);const expiry=playerStatusExpiry[p.name];const expTxt=expiry?` (${expiry} 만료)`:'';return (found?found[1].label:'없음')+expTxt;})()}</div>
      <div id="ed-icon-expiry-row" style="display:${getStatusIcon(p.name)?'flex':'none'};align-items:center;gap:7px;margin-top:8px">
        <input type="checkbox" id="ed-icon-expiry" ${playerStatusExpiry[p.name]?'checked':''} onchange="onStatusExpiryChange('${p.name}')" style="width:14px;height:14px;cursor:pointer">
        <label for="ed-icon-expiry" style="font-size:11px;color:var(--text3);font-weight:600;cursor:pointer;margin:0">10일 후 자동으로 없음으로 변경</label>
      </div>
    </div>
    <div id="ep-score-sec" class="ep-adv-section" style="margin-top:16px;padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:8px;">
      <div style="font-weight:700;font-size:12px;color:var(--text2);margin-bottom:12px">승패 직접 조정</div>
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
        ">승패 전체 초기화</button>
        <button class="btn btn-w btn-sm" onclick="
          const p=players.find(x=>x.name===editName);
          p.win=parseInt(document.getElementById('ed-win').value)||0;
          p.loss=parseInt(document.getElementById('ed-loss').value)||0;
          p.points=parseInt(document.getElementById('ed-pts').value)||0;
          save();render();
          document.getElementById('emBody').querySelector('.apply-ok').style.display='inline-block';
          setTimeout(()=>document.getElementById('emBody').querySelector('.apply-ok').style.display='none',1500);
        " style="border-color:var(--green);color:var(--green)">승패 적용</button>
        <span class="apply-ok" style="display:none;color:var(--green);font-weight:700;font-size:12px;align-self:center">적용됨!</span>
      </div>
      <div style="font-size:10px;color:var(--gray-l);margin-top:8px">※ 승패 초기화 시 개인 경기 기록(히스토리)도 함께 삭제됩니다. 대전 기록(미니/대학대전 등)은 유지됩니다.</div>
    </div>
    <div style="margin-top:14px;padding:12px 14px;background:var(--surface);border:1px solid var(--border);border-radius:8px;">
      <div style="font-weight:700;font-size:12px;color:var(--text2);margin-bottom:10px">선수 상태</div>
      <label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:13px;font-weight:600;color:var(--text2);margin:0 0 10px;padding-bottom:10px;border-bottom:1px solid var(--border)">
        <input type="checkbox" id="ed-retired" ${p.retired?'checked':''} style="width:16px;height:16px;cursor:pointer">
        <span>은퇴 <span style="font-size:11px;font-weight:400;color:var(--gray-l)">(현황판에서만 숨김, 경기 기록 유지)</span></span>
      </label>
      <label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:13px;font-weight:600;color:var(--text2);margin:0 0 10px;padding-bottom:10px;border-bottom:1px solid var(--border)">
        <input type="checkbox" id="ed-inactive" ${p.inactive?'checked':''} style="width:16px;height:16px;cursor:pointer">
        <span>임시 상태 <span style="font-size:11px;font-weight:400;color:var(--gray-l)">(휴학/활동중단 — 반투명 표시)</span></span>
      </label>
      <label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:13px;font-weight:600;color:var(--text2);margin:0">
        <input type="checkbox" id="ed-hide-board" ${p.hideFromBoard?'checked':''} style="width:16px;height:16px;cursor:pointer">
        <span>현황판에서 숨기기 <span style="font-size:11px;font-weight:400;color:var(--gray-l)">(스탯·기록 유지)</span></span>
      </label>
    </div>
    <!-- (요청사항) 크루 소속 항목 제거 -->
    <div id="ep-memo-sec" class="ep-adv-section" style="margin-top:14px;padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:8px;">
      <div style="font-weight:700;font-size:12px;color:var(--text2);margin-bottom:8px">선수 메모</div>
      <textarea id="ed-memo" style="width:100%;min-height:70px;font-size:12px;border:1px solid var(--border);border-radius:6px;padding:8px;background:var(--white);resize:vertical;font-family:'Noto Sans KR',sans-serif;line-height:1.6;box-sizing:border-box;" placeholder="선수에 대한 메모를 입력하세요...">${p.memo||''}</textarea>
    </div>
    <div id="ep-alias-sec" class="ep-adv-section" style="margin-top:14px;padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:8px;">
      <div style="font-weight:700;font-size:12px;color:var(--text2);margin-bottom:4px">자동인식 별명</div>
      <div style="font-size:11px;color:var(--gray-l);line-height:1.6;margin-bottom:10px">붙여넣기 자동인식에서 이 별명들이 <b>${esc(p.name)}</b>으로 자동 변환됩니다.</div>
      <div id="ep-alias-list" style="display:flex;flex-wrap:wrap;gap:6px;min-height:28px;margin-bottom:10px"></div>
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        <input id="ep-alias-input" type="text" placeholder="별명 추가 (예: 샤이니)" style="flex:1;min-width:120px;max-width:240px" onkeydown="if(event.key==='Enter') epAliasAdd(decodeURIComponent('${encodeURIComponent(p.name)}'))">
        <button class="btn btn-b btn-sm" onclick="epAliasAdd(decodeURIComponent('${encodeURIComponent(p.name)}'))">추가</button>
      </div>
    </div>`;
  om('emModal');
  try{
    const pm = document.getElementById('playerModal');
    const em = document.getElementById('emModal');
    const pzComputed = parseInt(pm ? getComputedStyle(pm).zIndex : '0', 10);
    const pzInline = parseInt(pm?.style?.zIndex || '0', 10);
    const nextZ = Math.max(6100, Number.isFinite(pzComputed) ? pzComputed : 0, Number.isFinite(pzInline) ? pzInline : 0) + 40;
    if(em) em.style.setProperty('z-index', String(nextZ), 'important');
  }catch(e){}
  try{ setTimeout(()=>{ 
    const nameEl=document.getElementById('ed-n');
    if(nameEl && typeof nameEl.focus==='function'){ nameEl.focus(); try{nameEl.select();}catch(_e){} }
    if(typeof edBindP1PosDrag==='function') edBindP1PosDrag();
    if(typeof edBindP2PosDrag==='function') edBindP2PosDrag();
    if(typeof edBindP3PosDrag==='function') edBindP3PosDrag();
    if(typeof edBindP4PosDrag==='function') edBindP4PosDrag();
    if(typeof edBindP5PosDrag==='function') edBindP5PosDrag();
    if(typeof edBindCardPosDrag==='function') edBindCardPosDrag();
    if(typeof edPhbgSyncFromInputs==='function') edPhbgSyncFromInputs();
    if(typeof edBindPhbgDrag==='function') edBindPhbgDrag();
    if(typeof edShareBgSyncFromInputs==='function') edShareBgSyncFromInputs();
    if(typeof syncEditPlayerThumbPreview==='function'){
      syncEditPlayerThumbPreview('ed-photo2','ed-photo2-preview-wrap','ed-photo2-preview');
      syncEditPlayerThumbPreview('ed-photo3','ed-photo3-preview-wrap','ed-photo3-preview');
      syncEditPlayerThumbPreview('ed-photo4','ed-photo4-preview-wrap','ed-photo4-preview');
      syncEditPlayerThumbPreview('ed-photo5','ed-photo5-preview-wrap','ed-photo5-preview');
    }
    if(typeof bindEditPlayerModalShortcut==='function') bindEditPlayerModalShortcut();
    if(typeof epRenderAliasesList==='function') epRenderAliasesList(name);
  }, 0); }catch(e){}
}
window.jumpEditPlayerSection = window.jumpEditPlayerSection || function(id){
  try{
    const root = document.getElementById('emBody');
    const el = document.getElementById(id);
    if(!root || !el) return;
    const top = el.offsetTop - 8;
    root.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
  }catch(e){}
};
window.applyEditPlayerSimpleMode = window.applyEditPlayerSimpleMode || function(enabled){
  try{
    const root = document.getElementById('emBody');
    if(!root) return;
    root.querySelectorAll('.ep-adv-section').forEach(el=>{
      if(!el.dataset.epDisplayDefault) el.dataset.epDisplayDefault = el.style.display || '';
      el.style.display = el.dataset.epDisplayDefault;
    });
    root.querySelectorAll('[data-ep-adv-nav]').forEach(el=>{
      if(!el.dataset.epDisplayDefault) el.dataset.epDisplayDefault = el.style.display || '';
      el.style.display = el.dataset.epDisplayDefault;
    });
    try{ localStorage.removeItem('editPlayerSimpleMode'); }catch(e){}
  }catch(e){}
};
window.syncEditPlayerThumbPreview = window.syncEditPlayerThumbPreview || function(inputId, wrapId, imgId){
  try{
    const input = document.getElementById(inputId);
    const wrap = document.getElementById(wrapId);
    const img = document.getElementById(imgId);
    if(!wrap || !img) return;
    const v = String(input?.value || '').trim();
    if(v && !v.startsWith('data:')){
      const nextSrc = toHttpsUrl(v);
      img.onload = function(){
        img.style.display = 'block';
        wrap.style.display = 'inline-flex';
      };
      img.onerror = function(){
        wrap.style.display = 'none';
        img.style.display = 'none';
      };
      img.src = nextSrc;
      wrap.style.display = 'inline-flex';
    }else{
      wrap.style.display = 'none';
      img.style.display = 'none';
      img.removeAttribute('src');
    }
  }catch(e){}
};
window.edShareBgSyncFromInputs = window.edShareBgSyncFromInputs || function(){
  try{
    const url = String(document.getElementById('ed-sharebg')?.value || '').trim();
    const fit = String(document.getElementById('ed-sharebg-fit')?.value || '').trim();
    const scale = Math.max(40, Math.min(220, parseInt(document.getElementById('ed-sharebg-scale')?.value || '100', 10) || 100));
    const dark = Math.max(0, Math.min(85, parseInt(document.getElementById('ed-sharebg-dark')?.value || '18', 10) || 0));
    const fade = Math.max(0, Math.min(100, parseInt(document.getElementById('ed-sharebg-fade')?.value || '0', 10) || 0));
    const posX = String(document.getElementById('ed-sharebg-posx')?.value || 'center').trim();
    const posY = String(document.getElementById('ed-sharebg-posy')?.value || 'center').trim();
    const prev = document.getElementById('ed-sharebg-prev');
    if(!prev) return;
    let bg = document.getElementById('ed-sharebg-prev-bg');
    let empty = document.getElementById('ed-sharebg-prev-empty');
    if(url && !url.startsWith('data:')){
      if(!bg){
        bg = document.createElement('div');
        bg.id = 'ed-sharebg-prev-bg';
        bg.style.cssText = 'position:absolute;inset:-8%;background-repeat:no-repeat;transform-origin:center center;opacity:.95;pointer-events:none';
        prev.insertBefore(bg, prev.firstChild);
      }
      bg.style.backgroundImage = `url('${toHttpsUrl(url).replace(/'/g,'%27')}')`;
      bg.style.backgroundPosition = `${posX} ${posY}`;
      bg.style.backgroundSize = (fit==='fill') ? '100% 100%' : (fit==='contain' ? 'contain' : 'cover');
      bg.style.transform = `scale(${scale/100})`;
      bg.style.display = 'block';
      if(empty){ empty.remove(); empty = null; }
    }else{
      if(bg){ bg.style.display = 'none'; }
      if(!empty){
        empty = document.createElement('div');
        empty.id = 'ed-sharebg-prev-empty';
        empty.style.cssText = 'position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:900;color:rgba(15,23,42,.55)';
        empty.textContent = 'URL을 입력하면 미리보기가 표시됩니다';
        prev.appendChild(empty);
      }
    }
    const darkEl = document.getElementById('ed-sharebg-prev-dark');
    if(darkEl) darkEl.style.background = `rgba(0,0,0,${dark/100})`;
    const fadeEl = document.getElementById('ed-sharebg-prev-fade');
    if(fadeEl) fadeEl.style.background = `rgba(255,255,255,${fade/100})`;
  }catch(e){}
};
window.toggleEditPlayerSimpleMode = window.toggleEditPlayerSimpleMode || function(btn){
  try{
    localStorage.removeItem('editPlayerSimpleMode');
    window.applyEditPlayerSimpleMode(false);
  }catch(e){}
};
window.toggleEditPlayerSection = window.toggleEditPlayerSection || function(key, btn){
  try{
    const body = document.getElementById('ep-sec-body-' + key);
    if(!body) return;
    const nextCollapsed = body.style.display !== 'none' ? true : false;
    body.style.display = nextCollapsed ? 'none' : 'block';
    body.style.marginTop = nextCollapsed ? '0' : '10px';
    const raw = localStorage.getItem('editPlayerSectionCollapsed');
    const map = raw ? JSON.parse(raw) : {};
    map[key] = nextCollapsed;
    localStorage.setItem('editPlayerSectionCollapsed', JSON.stringify(map));
    if(btn) btn.textContent = nextCollapsed ? '펼치기' : '접기';
  }catch(e){}
};
window.bindEditPlayerModalShortcut = window.bindEditPlayerModalShortcut || function(){
  if(window._editPlayerModalShortcutBound) return;
  window._editPlayerModalShortcutBound = true;
  document.addEventListener('keydown', function(ev){
    try{
      const modal = document.getElementById('emModal');
      if(!modal || modal.style.display==='none') return;
      const key = String(ev.key||'').toLowerCase();
      if((ev.ctrlKey || ev.metaKey) && key==='s'){
        ev.preventDefault();
        if(typeof savePlayer === 'function') savePlayer();
      }
    }catch(e){}
  });
};
/* ════════════════════════════════════════════════════════
   §3  모달 → 수정창 진입 / 저장
════════════════════════════════════════════════════════ */
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
    window._resumePlayerModalAfterEdit = name;
    window._suppressPlayerModalFront = true;
    try{ if(typeof cm === 'function') cm('playerModal'); }catch(e){}
    openEP(name);
  }catch(e){
    console.error('[openEP] 오류:',e);
    alert('수정창 열기 실패: '+e.message);
  }
}
/* ════════════════════════════════════════════════════════
   §2  openEP (스트리머 수정창) 헬퍼
════════════════════════════════════════════════════════ */
// 스트리머 수정창(openEP) 포지션 저장 헬퍼
// savePlayer 내에서 각 이미지 위치 보정값을 p 객체에 기록한다.
// prefix   : 'p1pos' | 'p2pos' | 'p3pos' | 'p4pos' | 'p5pos' | 'cardpos'
// fileKey  : p 객체에서 이미지 URL을 읽는 프로퍼티명 (예: 'photo', 'secondProfileFile')
// posXKey  : p 객체에 저장할 X 프로퍼티명 (예: 'photoPosX')
// posYKey  : p 객체에 저장할 Y 프로퍼티명 (예: 'photoPosY')
// useKey   : p 객체에 저장할 사용 여부 프로퍼티명 (예: 'photoPosUse')
// defX/defY: 기본(센터) 값 — 기본값과 동일하면 저장하지 않음(용량 절약)
function _savePhotoPos(p, prefix, fileKey, posXKey, posYKey, useKey, defX, defY) {
  try {
    const use = !!document.getElementById(`ed-${prefix}-use`)?.checked;
    const del = (document.getElementById(`ed-${prefix}-del`)?.value || '0') === '1';
    const x   = parseInt(document.getElementById(`ed-${prefix}-x`)?.value || String(defX), 10);
    const y   = parseInt(document.getElementById(`ed-${prefix}-y`)?.value || String(defY), 10);
    p[useKey] = use;
    if (del || !p[fileKey]) {
      delete p[posXKey]; delete p[posYKey];
    } else if (Number.isFinite(x) && Number.isFinite(y)) {
      const xx = Math.max(0, Math.min(100, x));
      const yy = Math.max(0, Math.min(100, y));
      if (xx === defX && yy === defY) { delete p[posXKey]; delete p[posYKey]; }
      else { p[posXKey] = xx; p[posYKey] = yy; }
    }
  } catch (e) { /* 위치 보정 저장 실패는 치명적이지 않음 */ }
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
    const _renameSide = (v) => {
      if(Array.isArray(v)){
        v.forEach(item => {
          if(item && typeof item === 'object' && item.name===oldName) item.name=newName;
        });
        return;
      }
      return v;
    };
    const renameInMatches=(arr)=>{
      (arr||[]).forEach(m=>{
        (m.sets||[]).forEach(set=>{
          (set.games||[]).forEach(g=>{
            if(g.playerA===oldName)g.playerA=newName;
            if(g.playerB===oldName)g.playerB=newName;
            if(g.a1===oldName)g.a1=newName;
            if(g.a2===oldName)g.a2=newName;
            if(g.b1===oldName)g.b1=newName;
            if(g.b2===oldName)g.b2=newName;
            _renameSide(g.teamA);
            _renameSide(g.teamB);
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
              if(g.a1===oldName)g.a1=newName;
              if(g.a2===oldName)g.a2=newName;
              if(g.b1===oldName)g.b1=newName;
              if(g.b2===oldName)g.b2=newName;
              _renameSide(g.teamA);
              _renameSide(g.teamB);
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
            if(g.a1===oldName)g.a1=newName;
            if(g.a2===oldName)g.a2=newName;
            if(g.b1===oldName)g.b1=newName;
            if(g.b2===oldName)g.b2=newName;
            _renameSide(g.teamA);
            _renameSide(g.teamB);
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
            if(g.a1===oldName)g.a1=newName;
            if(g.a2===oldName)g.a2=newName;
            if(g.b1===oldName)g.b1=newName;
            if(g.b2===oldName)g.b2=newName;
            _renameSide(g.teamA);
            _renameSide(g.teamB);
          });
        });
      });
    });

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

  // 프로필 사진 1~5 / 카드 얼굴 위치 보정 저장
  _savePhotoPos(p, 'p1pos', 'photo', 'photoPosX', 'photoPosY', 'photoPosUse', 50, 50);

  // 승패/포인트 직접 조정
  const _getIntVal = (id, fallback) => { const el = document.getElementById(id); return el ? (parseInt(el.value) || 0) : fallback; };
  p.win    = _getIntVal('ed-win',  p.win);
  p.loss   = _getIntVal('ed-loss', p.loss);
  p.points = _getIntVal('ed-pts',  p.points);
  // boolean 플래그 — false면 undefined로 저장(불필요한 키 제거)
  const _flag = (id) => document.getElementById(id)?.checked || undefined;
  p.retired      = _flag('ed-retired');
  p.inactive     = _flag('ed-inactive');
  p.hideFromBoard = _flag('ed-hide-board');
  // 텍스트 필드 일괄 읽기
  const _strVal = (id) => (document.getElementById(id)?.value || '').trim() || undefined;
  const _intVal  = (id, def) => parseInt(document.getElementById(id)?.value || String(def), 10) || def;

  p.memo            = _strVal('ed-memo');
  p.channelUrl      = _strVal('ed-channel');

  // 이미지 URL (비어 있으면 undefined)
  p.secondProfileFile = _strVal('ed-photo2');
  p.profileFile3      = _strVal('ed-photo3');
  p.profileFile4      = _strVal('ed-photo4');
  p.profileFile5      = _strVal('ed-photo5');
  p.shareCardPhoto    = _strVal('ed-card-photo');

  // 헤더 배경 설정
  const _phbg      = _strVal('ed-phbg') || '';
  const _phbgFit   = _strVal('ed-phbg-fit') || '';
  const _phbgScale = _intVal('ed-phbg-scale', 100);
  const _phbgPos   = (document.getElementById('ed-phbg-pos')?.value || 'center center').trim();
  const _phbgPosX  = _intVal('ed-phbg-posx', 50);
  const _phbgPosY  = _intVal('ed-phbg-posy', 50);

  // 공유카드 배경 설정
  const _shareBg     = _strVal('ed-sharebg') || '';
  const _shareBgFit  = _strVal('ed-sharebg-fit') || '';
  const _shareBgScale = _intVal('ed-sharebg-scale', 100);
  const _shareBgDark  = _intVal('ed-sharebg-dark', 18);
  const _shareBgFade  = _intVal('ed-sharebg-fade', 0);
  const _shareBgPosX  = (document.getElementById('ed-sharebg-posx')?.value || 'center').trim();
  const _shareBgPosY  = (document.getElementById('ed-sharebg-posy')?.value || 'center').trim();


  try {
    // 이미지 전환 딜레이 저장 (기본값 1초와 같으면 키 삭제해 용량 절약)
    const _clampDelay = (v) => { const n = parseFloat(v); return isNaN(n) ? 1 : Math.max(0.2, Math.min(60, n)); };
    const _setDelay = (key, val) => {
      const v = _clampDelay(val || '1');
      if (v === 1) delete p[key]; else p[key] = v;
    };
    document.querySelectorAll('#emBody [data-delay-key]').forEach(inp=>{
      const key = String(inp?.getAttribute('data-delay-key') || '').trim();
      if(!key) return;
      _setDelay(key, inp.value);
    });
  } catch (e) { /* 딜레이 저장 실패는 치명적이지 않음 */ }

  _savePhotoPos(p, 'cardpos', 'shareCardPhoto', 'shareCardPhotoPosX', 'shareCardPhotoPosY', 'shareCardPhotoPosUse', 50, 22);
  _savePhotoPos(p, 'p2pos', 'secondProfileFile', 'photo2PosX', 'photo2PosY', 'photo2PosUse', 50, 50);
  _savePhotoPos(p, 'p3pos', 'profileFile3',      'photo3PosX', 'photo3PosY', 'photo3PosUse', 50, 50);
  _savePhotoPos(p, 'p4pos', 'profileFile4',      'photo4PosX', 'photo4PosY', 'photo4PosUse', 50, 50);
  _savePhotoPos(p, 'p5pos', 'profileFile5',      'photo5PosX', 'photo5PosY', 'photo5PosUse', 50, 50);
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
  window._resumePlayerModalAfterEdit = '';
  cm('emModal');
  
  // (요청사항) 크루 자동 전환 로직 제거
  
  render();
  try{
    const cur = window._b2SelectedPlayer && window._b2SelectedPlayer.name;
    if(cur === p.name && typeof window._b2ScheduleImageSwap === 'function') window._b2ScheduleImageSwap(p.name);
  }catch(e){}
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
        set.games = set.games.filter(g => {
          const teamA = Array.isArray(g.teamA) ? g.teamA : [];
          const teamB = Array.isArray(g.teamB) ? g.teamB : [];
          const inTeamA = teamA.some(x => (x && typeof x === 'object' ? x.name : x) === name);
          const inTeamB = teamB.some(x => (x && typeof x === 'object' ? x.name : x) === name);
          return g.playerA !== name && g.playerB !== name && g.a1 !== name && g.a2 !== name && g.b1 !== name && g.b2 !== name && !inTeamA && !inTeamB;
        });
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

function _edClampPct(v, d){
  const n = parseInt(v, 10);
  if(!Number.isFinite(n)) return d;
  return Math.max(0, Math.min(100, n));
}
function _edResolveUrlInputId(prefix){
  if(prefix==='p3pos') return 'ed-photo3';
  if(prefix==='p4pos') return 'ed-photo4';
  if(prefix==='p5pos') return 'ed-photo5';
  if(prefix==='cardpos') return 'ed-card-photo';
  return '';
}
function _edEnsurePosImg(prefix, url){
  try{
    const prev = document.getElementById(`ed-${prefix}-prev`);
    if(!prev) return null;
    let img = document.getElementById(`ed-${prefix}-img`);
    const u = String(url||'').trim();
    if(!u || u.startsWith('data:')){
      if(img) img.style.display='none';
      return img;
    }
    if(!img){
      img = document.createElement('img');
      img.id = `ed-${prefix}-img`;
      img.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transform:scale(1.02);display:block';
      img.setAttribute('onerror',"this.style.display='none'");
      prev.insertBefore(img, prev.firstChild);
    }
    img.src = toHttpsUrl(u).replace(/\"/g,'&quot;');
    img.style.display='block';
    return img;
  }catch(e){
    return null;
  }
}
function _edPosSync(prefix, defX, defY, refresh){
  try{
    const urlInputId = _edResolveUrlInputId(prefix);
    if(refresh && urlInputId){
      const url = document.getElementById(urlInputId)?.value || '';
      _edEnsurePosImg(prefix, url);
    }
    const x = _edClampPct(document.getElementById(`ed-${prefix}-x`)?.value, defX);
    const y = _edClampPct(document.getElementById(`ed-${prefix}-y`)?.value, defY);
    const img = document.getElementById(`ed-${prefix}-img`);
    if(img) img.style.objectPosition = `${x}% ${y}%`;
    const xv = document.getElementById(`ed-${prefix}-xv`); if(xv) xv.textContent = `${x}%`;
    const yv = document.getElementById(`ed-${prefix}-yv`); if(yv) yv.textContent = `${y}%`;
    const del = document.getElementById(`ed-${prefix}-del`); if(del) del.value = '0';
  }catch(e){}
}
function _edPosCenter(prefix, defX, defY){
  try{
    const xEl = document.getElementById(`ed-${prefix}-x`); if(xEl) xEl.value = String(defX);
    const yEl = document.getElementById(`ed-${prefix}-y`); if(yEl) yEl.value = String(defY);
    _edPosSync(prefix, defX, defY, true);
  }catch(e){}
}
function _edPosDelete(prefix, msg){
  try{
    const del = document.getElementById(`ed-${prefix}-del`);
    if(del) del.value = '1';
    if(msg) alert(msg);
  }catch(e){}
}
function _edBindPosDrag(prefix, defX, defY){
  try{
    const prev = document.getElementById(`ed-${prefix}-prev`);
    if(!prev || prev._dragBound) return;
    prev._dragBound = true;
    const apply = (ev)=>{
      const r = prev.getBoundingClientRect();
      const cx = (ev.clientX - r.left) / Math.max(1, r.width);
      const cy = (ev.clientY - r.top) / Math.max(1, r.height);
      const x = _edClampPct(Math.round(cx*100), defX);
      const y = _edClampPct(Math.round(cy*100), defY);
      const xEl = document.getElementById(`ed-${prefix}-x`); if(xEl) xEl.value = String(x);
      const yEl = document.getElementById(`ed-${prefix}-y`); if(yEl) yEl.value = String(y);
      _edPosSync(prefix, defX, defY, false);
    };
    prev.addEventListener('pointerdown', (ev)=>{
      try{ prev.setPointerCapture(ev.pointerId); }catch(e){}
      apply(ev);
      const mv = (e)=>apply(e);
      const up = ()=>{
        try{ prev.removeEventListener('pointermove', mv); }catch(_){}
        try{ prev.removeEventListener('pointerup', up); }catch(_){}
        try{ prev.removeEventListener('pointercancel', up); }catch(_){}
      };
      prev.addEventListener('pointermove', mv);
      prev.addEventListener('pointerup', up);
      prev.addEventListener('pointercancel', up);
    });
  }catch(e){}
}

window.edP3PosSyncFromInputs = function(refresh){ _edPosSync('p3pos', 50, 50, !!refresh); };
window.edP3PosCenter = function(){ _edPosCenter('p3pos', 50, 50); };
window.edP3PosDelete = function(){ _edPosDelete('p3pos', '프로필 사진 3 위치 보정값을 삭제합니다. (기본 center)'); };
window.edBindP3PosDrag = function(){ _edBindPosDrag('p3pos', 50, 50); };

window.edP4PosSyncFromInputs = function(refresh){ _edPosSync('p4pos', 50, 50, !!refresh); };
window.edP4PosCenter = function(){ _edPosCenter('p4pos', 50, 50); };
window.edP4PosDelete = function(){ _edPosDelete('p4pos', '프로필 사진 4 위치 보정값을 삭제합니다. (기본 center)'); };
window.edBindP4PosDrag = function(){ _edBindPosDrag('p4pos', 50, 50); };

window.edP5PosSyncFromInputs = function(refresh){ _edPosSync('p5pos', 50, 50, !!refresh); };
window.edP5PosCenter = function(){ _edPosCenter('p5pos', 50, 50); };
window.edP5PosDelete = function(){ _edPosDelete('p5pos', '프로필 사진 5 위치 보정값을 삭제합니다. (기본 center)'); };
window.edBindP5PosDrag = function(){ _edBindPosDrag('p5pos', 50, 50); };

window.edCardPosSyncFromInputs = function(refresh){ _edPosSync('cardpos', 50, 22, !!refresh); };
window.edCardPosCenter = function(){ _edPosCenter('cardpos', 50, 22); };
window.edCardPosDelete = function(){ _edPosDelete('cardpos', '개인/끝장전 카드 얼굴 위치 보정값을 삭제합니다. (기본 center 22%)'); };
window.edBindCardPosDrag = function(){ _edBindPosDrag('cardpos', 50, 22); };

/* ════════════════════════════════════════════════════════
   §4  경기 기록 수정 (openRE / saveRow)
════════════════════════════════════════════════════════ */
// 팀 경기(mini/civil/univm/ck/pro/tt)에서 A팀/B팀 멤버를 수정하는 섹션 HTML 반환
function _buildMemberEditHTML(members, side, label){
  const allNames = (typeof players !== 'undefined' && Array.isArray(players))
    ? players.map(p=>p.name).filter(Boolean).sort((a,b)=>a.localeCompare(b,'ko'))
    : [];
  const datalistId = `re-member-dl-${side}`;
  const rows = (Array.isArray(members) && members.length > 0)
    ? members.map((mb,i)=>{
        const n = String(mb&&mb.name||'').trim();
        return `<div style="display:flex;align-items:center;gap:4px;margin-bottom:4px" id="re-mem-row-${side}-${i}">
          <input type="text" list="${datalistId}" id="re-mem-${side}-${i}" value="${n.replace(/"/g,'&quot;')}" placeholder="스트리머 이름"
            style="flex:1;padding:6px 8px;border:1px solid var(--border);border-radius:8px;font-size:13px;background:var(--surface);color:var(--text1)">
          <button type="button" onclick="_reMemDel('${side}',${i})"
            style="padding:4px 8px;border-radius:8px;border:1px solid #fca5a5;background:#fff1f2;color:#dc2626;font-size:12px;font-weight:700;cursor:pointer;flex-shrink:0">✕</button>
        </div>`;
      }).join('')
    : `<div style="font-size:12px;color:var(--gray-l);padding:4px 0">참가자 없음</div>`;
  const dlOpts = allNames.map(n=>`<option value="${n.replace(/"/g,'&quot;')}">`).join('');
  return `
  <datalist id="${datalistId}">${dlOpts}</datalist>
  <div style="padding:10px;background:var(--surface-alt,#f8fafc);border:1px solid var(--border);border-radius:10px">
    <div style="font-size:12px;font-weight:800;color:var(--text2);margin-bottom:8px">${label} 참가자</div>
    <div id="re-mem-list-${side}">${rows}</div>
    <button type="button" onclick="_reMemAdd('${side}')"
      style="margin-top:4px;padding:5px 12px;border-radius:8px;border:1.5px dashed var(--blue,#2563eb);background:transparent;color:var(--blue,#2563eb);font-size:12px;font-weight:700;cursor:pointer;width:100%">+ 참가자 추가</button>
  </div>`;
}
window._reMemDel = function(side, i){
  const el = document.getElementById(`re-mem-row-${side}-${i}`);
  if(el) el.remove();
};
window._reMemAdd = function(side){
  const list = document.getElementById(`re-mem-list-${side}`);
  if(!list) return;
  const allNames = (typeof players !== 'undefined' && Array.isArray(players))
    ? players.map(p=>p.name).filter(Boolean).sort((a,b)=>a.localeCompare(b,'ko')) : [];
  const datalistId = `re-member-dl-${side}`;
  const idx = list.querySelectorAll('[id^="re-mem-row-"]').length;
  const div = document.createElement('div');
  div.id = `re-mem-row-${side}-${idx}`;
  div.style.cssText = 'display:flex;align-items:center;gap:4px;margin-bottom:4px';
  div.innerHTML = `<input type="text" list="${datalistId}" id="re-mem-${side}-${idx}" value="" placeholder="스트리머 이름"
    style="flex:1;padding:6px 8px;border:1px solid var(--border);border-radius:8px;font-size:13px;background:var(--surface);color:var(--text1)">
    <button type="button" onclick="_reMemDel('${side}',${idx})"
      style="padding:4px 8px;border-radius:8px;border:1px solid #fca5a5;background:#fff1f2;color:#dc2626;font-size:12px;font-weight:700;cursor:pointer;flex-shrink:0">✕</button>`;
  list.appendChild(div);
};
// 멤버 편집 결과를 읽어 배열로 반환
function _reReadMembers(side, originalMembers){
  const list = document.getElementById(`re-mem-list-${side}`);
  if(!list) return originalMembers || [];
  const inputs = list.querySelectorAll(`input[id^="re-mem-${side}-"]`);
  const result = [];
  inputs.forEach(inp=>{
    const n = String(inp.value||'').trim();
    if(!n) return;
    const orig = (originalMembers||[]).find(m=>m&&m.name===n) || {};
    const pObj = (typeof players !== 'undefined' && Array.isArray(players)) ? (players.find(p=>p.name===n)||{}) : {};
    result.push({ name:n, univ:orig.univ||pObj.univ||'', race:orig.race||pObj.race||'', tier:orig.tier||pObj.tier||'', gender:orig.gender||pObj.gender||'' });
  });
  return result;
}
// ── /참가자 수정 UI 헬퍼 ────────────────────────────────────────────────

function openRE(mode,idx){
  // alias/필터 모드 보정
  mode = (mode==='individual') ? 'ind' : mode;
  // civil(시빌워)은 mini 배열 공유
  if(mode==='civil') mode = 'mini';
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
  const _allUActive=allU.filter(u=>!u.dissolved);
  // 해체된 대학은 목록에서 숨기되, 이미 그 경기에 지정된 대학이면(과거 기록) 계속 선택 가능하게 유지
  const _univOpts=(selVal)=>{
    let list=_allUActive;
    if(selVal && !list.some(u=>u.name===selVal)){
      list=[...list,(allU.find(u=>u.name===selVal)||{name:selVal})];
    }
    return list.map(u=>`<option value="${u.name}"${selVal===u.name?' selected':''}>${u.name}</option>`).join('');
  };
  let body='',tit='';
  if(mode==='mini'){
    const m=miniM[idx];tit='⚡ 미니대전 수정';
    const mSetsA=m.sets?m.sets.reduce((s,st)=>s+(st.scoreA||0),0):null;
    const mSetsB=m.sets?m.sets.reduce((s,st)=>s+(st.scoreB||0),0):null;
    const _miniMemA = m.teamAMembers||[]; const _miniMemB = m.teamBMembers||[];
    body=`<label>날짜</label><input type="date" id="re-d" value="${m.d}">
      <label>팀 A 대학</label><select id="re-a">${_univOpts(m.a)}</select>
      <label>팀 A 점수 (sa)</label>
      <div style="display:flex;gap:6px;align-items:center">
        <input type="number" id="re-sa" value="${m.sa}" style="flex:1">
        ${mSetsA!==null&&mSetsA!==m.sa?`<button type="button" onclick="document.getElementById('re-sa').value=${mSetsA};document.getElementById('re-sb').value=${mSetsB}" style="font-size:11px;padding:2px 8px;background:#fef9c3;border:1px solid #ca8a04;border-radius:6px;cursor:pointer;white-space:nowrap">🔄 게임수(${mSetsA}:${mSetsB})</button>`:''}
      </div>
      <label>팀 B 대학</label><select id="re-b">${_univOpts(m.b)}</select>
      <label>팀 B 점수 (sb)</label><input type="number" id="re-sb" value="${m.sb}">
      ${mSetsA!==null?`<div style="font-size:11px;color:var(--gray-l);margin-top:2px">세트 수: A ${m.sets.filter(s=>s.winner==='A').length} / B ${m.sets.filter(s=>s.winner==='B').length} | 게임 수: A ${mSetsA} / B ${mSetsB}</div>`:''}
      ${(_miniMemA.length||_miniMemB.length)?_buildMemberEditHTML(_miniMemA,'A','A팀'):''}
      ${(_miniMemA.length||_miniMemB.length)?_buildMemberEditHTML(_miniMemB,'B','B팀'):''}
      <label>🎙️ 캐스터/스트리머</label><input type="text" id="re-caster" value="${m.caster||''}" placeholder="방송 스트리머 이름 (선택)">`;
  } else if(mode==='univm'){
    const m=univM[idx];tit='🏟️ 대학대전 수정';
    const uSetsA=m.sets?m.sets.reduce((s,st)=>s+(st.scoreA||0),0):null;
    const uSetsB=m.sets?m.sets.reduce((s,st)=>s+(st.scoreB||0),0):null;
    const _univMemA = m.teamAMembers||[]; const _univMemB = m.teamBMembers||[];
    body=`<label>날짜</label><input type="date" id="re-d" value="${m.d}">
      <label>팀 A</label><select id="re-a">${_univOpts(m.a)}</select>
      <label>A 점수 (sa)</label>
      <div style="display:flex;gap:6px;align-items:center">
        <input type="number" id="re-sa" value="${m.sa}" style="flex:1">
        ${uSetsA!==null&&uSetsA!==m.sa?`<button type="button" onclick="document.getElementById('re-sa').value=${uSetsA};document.getElementById('re-sb').value=${uSetsB}" style="font-size:11px;padding:2px 8px;background:#fef9c3;border:1px solid #ca8a04;border-radius:6px;cursor:pointer;white-space:nowrap">🔄 게임수(${uSetsA}:${uSetsB})</button>`:''}
      </div>
      <label>팀 B</label><select id="re-b">${_univOpts(m.b)}</select>
      <label>B 점수 (sb)</label><input type="number" id="re-sb" value="${m.sb}">
      ${uSetsA!==null?`<div style="font-size:11px;color:var(--gray-l);margin-top:2px">세트 수: A ${m.sets.filter(s=>s.winner==='A').length} / B ${m.sets.filter(s=>s.winner==='B').length} | 게임 수: A ${uSetsA} / B ${uSetsB}</div>`:''}
      ${_buildMemberEditHTML(_univMemA,'A','A팀')}
      ${_buildMemberEditHTML(_univMemB,'B','B팀')}
      <label>🎙️ 캐스터/스트리머</label><input type="text" id="re-caster" value="${m.caster||''}" placeholder="방송 스트리머 이름 (선택)">`;
  
  } else if(mode==='comp'){
    const c=comps[idx];tit='🎖️ 대회 수정';
    body=`<label>날짜</label><input type="date" id="re-d" value="${c.d}">
      <label>대회명</label><input type="text" id="re-cn" value="${c.n}">
      <label>대학 A</label><select id="re-a">${_univOpts(c.a||c.u)}</select>
      <label>A 세트 승</label><input type="number" id="re-sa" value="${c.sa||0}">
      <label>대학 B</label><select id="re-b">${_univOpts(c.b)}</select>
      <label>B 세트 승</label><input type="number" id="re-sb" value="${c.sb||0}">
      <label>🎙️ 캐스터/스트리머</label><input type="text" id="re-caster" value="${c.caster||''}" placeholder="방송 스트리머 이름 (선택)">`;
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
      ${_buildMemberEditHTML(mA,'A','A팀')}
      ${_buildMemberEditHTML(mB,'B','B팀')}
      <label>🎙️ 캐스터/스트리머</label><input type="text" id="re-caster" value="${m.caster||''}" placeholder="방송 스트리머 이름 (선택)">
      <div style="margin-top:6px;font-size:11px;color:var(--gray-l)">※ 세트별 개인 경기는 기록 상세보기에서 수정하세요.</div>`;
  } else if(mode==='tt'){
    const m=ttM[idx];tit='🎯 티어대회 수정';
    const ttGA=m.sets?m.sets.reduce((s,st)=>s+(st.scoreA||0),0):null;
    const ttGB=m.sets?m.sets.reduce((s,st)=>s+(st.scoreB||0),0):null;
    const ttWA=m.sets?m.sets.filter(s=>s.winner==='A').length:null;
    const ttWB=m.sets?m.sets.filter(s=>s.winner==='B').length:null;
    const _ttMemA = m.teamAMembers||[]; const _ttMemB = m.teamBMembers||[];
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
      ${_buildMemberEditHTML(_ttMemA,'A','A팀')}
      ${_buildMemberEditHTML(_ttMemB,'B','B팀')}
      <label>🎙️ 캐스터/스트리머</label><input type="text" id="re-caster" value="${m.caster||''}" placeholder="방송 스트리머 이름 (선택)">
      <div style="margin-top:6px;font-size:11px;color:var(--gray-l)">※ 세트별 개인 경기는 기록 상세보기에서 수정하세요.</div>`;
  } else if(mode==='ck'){
    const m=ckM[idx];tit='🤝 대학CK 수정';
    const _ckMemA = m.teamAMembers||[]; const _ckMemB = m.teamBMembers||[];
    body=`<label>날짜</label><input type="date" id="re-d" value="${m.d||''}">
      <label>A팀 레이블</label><input type="text" id="re-tla" value="${m.teamALabel||''}" placeholder="미입력 시 A조">
      <label>A조 세트 승</label><input type="number" id="re-sa" value="${m.sa||0}">
      <label>B팀 레이블</label><input type="text" id="re-tlb" value="${m.teamBLabel||''}" placeholder="미입력 시 B조">
      <label>B조 세트 승</label><input type="number" id="re-sb" value="${m.sb||0}">
      ${_buildMemberEditHTML(_ckMemA,'A','A팀')}
      ${_buildMemberEditHTML(_ckMemB,'B','B팀')}
      <label>🎙️ 캐스터/스트리머</label><input type="text" id="re-caster" value="${m.caster||''}" placeholder="방송 스트리머 이름 (선택)">
      <div style="margin-top:10px;font-size:11px;color:var(--gray-l)">※ 세트별 개인 경기는 기록 상세보기에서 수정하세요.</div>`;
  } else if(mode==='progj'){
    const m=gjM[idx];tit='🏅 프로리그 끝장전 수정';
    body=`<label>날짜</label><input type="date" id="re-d" value="${m.d||''}">
      <label>승자</label><input type="text" id="re-gj-w" value="${m.wName||''}">
      <label>패자</label><input type="text" id="re-gj-l" value="${m.lName||''}">
      <label>맵</label><input type="text" id="re-gj-map" value="${m.map||''}">
      <label>🎙️ 캐스터/스트리머</label><input type="text" id="re-caster" value="${m.caster||''}" placeholder="방송 스트리머 이름 (선택)">`;
  } else if(mode==='gj'){
    const m=gjM[idx];tit='⚔️ 끝장전 수정';
    body=`<label>날짜</label><input type="date" id="re-d" value="${m.d||''}">
      <label>승자</label><input type="text" id="re-gj-w" value="${m.wName||''}">
      <label>패자</label><input type="text" id="re-gj-l" value="${m.lName||''}">
      <label>맵</label><input type="text" id="re-gj-map" value="${m.map||''}">
      <label>🎙️ 캐스터/스트리머</label><input type="text" id="re-caster" value="${m.caster||''}" placeholder="방송 스트리머 이름 (선택)">`;
  } else if(mode==='ind'){
    const m=indM[idx];tit='🎮 개인전 수정';
    body=`<label>날짜</label><input type="date" id="re-d" value="${m.d||''}">
      <label>승자</label><input type="text" id="re-gj-w" value="${m.wName||''}">
      <label>패자</label><input type="text" id="re-gj-l" value="${m.lName||''}">
      <label>맵</label><input type="text" id="re-gj-map" value="${m.map||''}">
      <label>🎙️ 캐스터/스트리머</label><input type="text" id="re-caster" value="${m.caster||''}" placeholder="방송 스트리머 이름 (선택)">`;
  }
  document.getElementById('reTitle').innerText=tit;
  document.getElementById('reBody').innerHTML=body;
  // 헤더 색상 모드별 적용
  const _reHeadEl = document.getElementById('reModal-title');
  const _reHeadColor = {mini:'#7c3aed',univm:'#16a34a',ck:'#f59e0b',pro:'#0ea5e9',tt:'#10b981',comp:'#2563eb',gj:'#dc2626',progj:'#dc2626',ind:'#2563eb'}[reMode]||'#2563eb';
  if(_reHeadEl) _reHeadEl.style.background=`linear-gradient(135deg,${_reHeadColor}15,${_reHeadColor}07,#f8fafc)`;
  om('reModal');
}
function saveRow(){
  const d=document.getElementById('re-d')?.value||'';
  // (버그픽스) reIdx가 범위 밖이거나 해당 배열 항목이 없으면 조기 종료
  const _RE_ARR_GUARD = { mini: miniM, univm: univM, comp: comps, ck: ckM, pro: proM, tt: ttM, progj: gjM, gj: gjM, ind: indM };
  const _guardArr = _RE_ARR_GUARD[reMode];
  if(_guardArr && (reIdx < 0 || reIdx >= _guardArr.length || !_guardArr[reIdx])){ console.warn('[saveRow] invalid reIdx or missing item', reMode, reIdx); return; }
  if(reMode==='mini'){
    miniM[reIdx].d=d;
    miniM[reIdx].a=document.getElementById('re-a')?.value||miniM[reIdx].a;
    miniM[reIdx].b=document.getElementById('re-b')?.value||miniM[reIdx].b;
    miniM[reIdx].sa=parseInt(document.getElementById('re-sa').value)||0;
    miniM[reIdx].sb=parseInt(document.getElementById('re-sb').value)||0;
    // 참가자 수정 저장
    const _newMemA = _reReadMembers('A', miniM[reIdx].teamAMembers);
    const _newMemB = _reReadMembers('B', miniM[reIdx].teamBMembers);
    if(_newMemA.length) miniM[reIdx].teamAMembers = _newMemA;
    if(_newMemB.length) miniM[reIdx].teamBMembers = _newMemB;
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
    // 참가자 수정 저장
    const _newMemA = _reReadMembers('A', m.teamAMembers);
    const _newMemB = _reReadMembers('B', m.teamBMembers);
    if(_newMemA.length) m.teamAMembers = _newMemA;
    if(_newMemB.length) m.teamBMembers = _newMemB;
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
    // 참가자 수정 저장
    const _newMemA = _reReadMembers('A', m.teamAMembers);
    const _newMemB = _reReadMembers('B', m.teamBMembers);
    if(_newMemA.length) m.teamAMembers = _newMemA;
    if(_newMemB.length) m.teamBMembers = _newMemB;
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
    // 참가자 수정 저장
    const _newMemA = _reReadMembers('A', m.teamAMembers);
    const _newMemB = _reReadMembers('B', m.teamBMembers);
    if(_newMemA.length) m.teamAMembers = _newMemA;
    if(_newMemB.length) m.teamBMembers = _newMemB;
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
    m.teamALabel=document.getElementById('re-tla')?.value||m.teamALabel;
    m.teamBLabel=document.getElementById('re-tlb')?.value||m.teamBLabel;
    m.sa=parseInt(document.getElementById('re-sa').value)||0;
    m.sb=parseInt(document.getElementById('re-sb').value)||0;
    // 참가자 수정 저장
    const _newMemA = _reReadMembers('A', m.teamAMembers);
    const _newMemB = _reReadMembers('B', m.teamBMembers);
    if(_newMemA.length) m.teamAMembers = _newMemA;
    if(_newMemB.length) m.teamBMembers = _newMemB;
  } else if(reMode==='progj'){
    const m=gjM[reIdx];m.d=d;
    const _gjw=document.getElementById('re-gj-w')?.value.trim(); if(_gjw!==undefined&&_gjw!=='') m.wName=_gjw; else if(document.getElementById('re-gj-w')) m.wName=_gjw||m.wName;
    const _gjl=document.getElementById('re-gj-l')?.value.trim(); if(_gjl!==undefined&&_gjl!=='') m.lName=_gjl; else if(document.getElementById('re-gj-l')) m.lName=_gjl||m.lName;
    // (버그픽스) 맵을 빈 문자열로 지울 수 있도록: 입력란이 존재하면 무조건 그 값 사용
    const _gjmapEl=document.getElementById('re-gj-map'); if(_gjmapEl) m.map=_gjmapEl.value.trim();
    m._proLabel=true;
  } else if(reMode==='gj'){
    const m=gjM[reIdx];m.d=d;
    const _gjw=document.getElementById('re-gj-w')?.value.trim(); if(_gjw) m.wName=_gjw;
    const _gjl=document.getElementById('re-gj-l')?.value.trim(); if(_gjl) m.lName=_gjl;
    // (버그픽스) 맵을 빈 문자열로 지울 수 있도록: 입력란이 존재하면 무조건 그 값 사용
    const _gjmapEl=document.getElementById('re-gj-map'); if(_gjmapEl) m.map=_gjmapEl.value.trim();
  } else if(reMode==='ind'){
    const m=indM[reIdx];m.d=d;
    const _gjw=document.getElementById('re-gj-w')?.value.trim(); if(_gjw) m.wName=_gjw;
    const _gjl=document.getElementById('re-gj-l')?.value.trim(); if(_gjl) m.lName=_gjl;
    // (버그픽스) 맵을 빈 문자열로 지울 수 있도록: 입력란이 존재하면 무조건 그 값 사용
    const _gjmapEl=document.getElementById('re-gj-map'); if(_gjmapEl) m.map=_gjmapEl.value.trim();
  }
  // 🎙️ 캐스터/스트리머 저장 (모든 mode 공통)
  const _reCaster = (document.getElementById('re-caster')?.value ?? '').trim();
  // mode → 데이터 배열 매핑 (캐스터/스트리머 공통 저장)
  const _RE_ARR_MAP = { mini: miniM, univm: univM, comp: comps, ck: ckM, pro: proM, tt: ttM, progj: gjM, gj: gjM, ind: indM };
  const _reArr = _RE_ARR_MAP[reMode] ?? null;
  if(_reArr && _reArr[reIdx]) {
    if(_reCaster) _reArr[reIdx].caster = _reCaster; else delete _reArr[reIdx].caster;
  }
  save();render();cm('reModal');try{ if(typeof window._refreshOpenHistDetailAfterEdit==='function') window._refreshOpenHistDetailAfterEdit(reMode, reIdx); }catch(e){}
}

/* ════════════════════════════════════════════════════════
   §5  대학 CRUD 및 데이터 일관성
════════════════════════════════════════════════════════ */

// ══════════════════════════════════════════════════════════
// 대학/티어/색상/계정 관련 함수는 settings-crud-univ.js 로 분리됨
// renameUnivAcrossData, addUniv, delUniv, addTier, delTier,
// cfgTierTheme*, cfgShowColorPalette, saveFbPw 등
// ══════════════════════════════════════════════════════════
