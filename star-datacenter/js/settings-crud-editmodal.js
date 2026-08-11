/* ══════════════════════════════════════════════════════════════
   설정 - 선수 편집 모달 빌더 (openEP) (settings-crud.js 에서 분리, 2026-07-30)
   ══════════════════════════════════════════════════════════════ */

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
  const _p6X = _pct(p.photo6PosX, 50),        _p6Y = _pct(p.photo6PosY, 50),        _p6Use = _use(p.photo6PosUse);
  const _p7X = _pct(p.photo7PosX, 50),        _p7Y = _pct(p.photo7PosY, 50),        _p7Use = _use(p.photo7PosUse);
  const _p8X = _pct(p.photo8PosX, 50),        _p8Y = _pct(p.photo8PosY, 50),        _p8Use = _use(p.photo8PosUse);
  const _p9X = _pct(p.photo9PosX, 50),        _p9Y = _pct(p.photo9PosY, 50),        _p9Use = _use(p.photo9PosUse);
  const _p10X = _pct(p.photo10PosX, 50),      _p10Y = _pct(p.photo10PosY, 50),      _p10Use = _use(p.photo10PosUse);
  const _scX = _pct(p.shareCardPhotoPosX, 50), _scY = _pct(p.shareCardPhotoPosY, 22), _scUse = _use(p.shareCardPhotoPosUse);
  const _d12 = _dly(p.photoDelay12), _d21 = _dly(p.photoDelay21 ?? p.photoDelay51), _d23 = _dly(p.photoDelay23), _d31 = _dly(p.photoDelay31 ?? p.photoDelay51), _d34 = _dly(p.photoDelay34), _d41 = _dly(p.photoDelay41 ?? p.photoDelay51), _d45 = _dly(p.photoDelay45), _d51 = _dly(p.photoDelay51);
  // 프로필 사진 2~10 위치 보정값 묶음 (탭 렌더링용)
  const _photoPosData = [
    { n:2,  url:String(p.secondProfileFile||'').trim(), x:_p2X,  y:_p2Y,  use:_p2Use  },
    { n:3,  url:String(p.profileFile3||'').trim(),      x:_p3X,  y:_p3Y,  use:_p3Use  },
    { n:4,  url:String(p.profileFile4||'').trim(),      x:_p4X,  y:_p4Y,  use:_p4Use  },
    { n:5,  url:String(p.profileFile5||'').trim(),      x:_p5X,  y:_p5Y,  use:_p5Use  },
    { n:6,  url:String(p.profileFile6||'').trim(),      x:_p6X,  y:_p6Y,  use:_p6Use  },
    { n:7,  url:String(p.profileFile7||'').trim(),      x:_p7X,  y:_p7Y,  use:_p7Use  },
    { n:8,  url:String(p.profileFile8||'').trim(),      x:_p8X,  y:_p8Y,  use:_p8Use  },
    { n:9,  url:String(p.profileFile9||'').trim(),      x:_p9X,  y:_p9Y,  use:_p9Use  },
    { n:10, url:String(p.profileFile10||'').trim(),     x:_p10X, y:_p10Y, use:_p10Use }
  ];
  const _slotOrder = [
    { slot:1, url:String(p.photo||'').trim() },
    { slot:2, url:String(p.secondProfileFile||'').trim() },
    { slot:3, url:String(p.profileFile3||'').trim() },
    { slot:4, url:String(p.profileFile4||'').trim() },
    { slot:5, url:String(p.profileFile5||'').trim() },
    { slot:6, url:String(p.profileFile6||'').trim() },
    { slot:7, url:String(p.profileFile7||'').trim() },
    { slot:8, url:String(p.profileFile8||'').trim() },
    { slot:9, url:String(p.profileFile9||'').trim() },
    { slot:10, url:String(p.profileFile10||'').trim() }
  ].filter(item=>!!item.url);
  const _delayKeyLegacy = {
    '1_2':'photoDelay12','2_1':'photoDelay21','2_3':'photoDelay23','3_1':'photoDelay31',
    '3_4':'photoDelay34','4_1':'photoDelay41','4_5':'photoDelay45','5_1':'photoDelay51'
  };
  const _delayKey = (from, to)=>{
    const k = `${from}_${to}`;
    return _delayKeyLegacy[k] || `photoDelay${k}`;
  };
  const _photo6to10AnyFilled = _photoPosData.slice(4).some(item=>!!item.url);
  const _delayValue = (key)=>{
    // [FIX] 값을 지정하지 않았을 때 실제로 런타임에서 사용되는 기본값(4초)과
    // 다른 값(1초)을 화면에 보여줘서 설정한 시간이 반영 안 된 것처럼 보이던 문제 수정.
    const n = parseFloat(p?.[key] ?? 4);
    if(isNaN(n)) return 4;
    return Math.max(0.2, Math.min(60, n));
  };
  const _swapDelayHtml = _slotOrder.length < 2
    ? `<div style="font-size:var(--fs-caption);color:var(--gray-l);line-height:1.65">등록된 이미지가 1개라 전환 시간 설정이 필요하지 않습니다.</div>`
    : `<div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px">${_slotOrder.map((item, idx)=>{
        const next = _slotOrder[(idx + 1) % _slotOrder.length];
        const key = _delayKey(item.slot, next.slot);
        if(!key) return '';
        return `<div>
          <div style="font-size:var(--fs-caption);font-weight:800;color:var(--text3);margin-bottom:4px">${item.slot} → ${next.slot}</div>
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
  const _epPosTabCollapsed = _epCollapsed('postab', true);
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
          ${p.univ!=='무소속'?`<button type="button" onclick="document.getElementById('ed-u').value='무소속'" style="flex-shrink:0;padding:4px 10px;border-radius:7px;border:1.5px solid #9ca3af;background:var(--surface);color:#6b7280;font-size:var(--fs-caption);font-weight:700;cursor:pointer;white-space:nowrap">🚶 무소속</button>`:''}
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
        <label>직책 <span style="font-size:10px;font-weight:400;color:var(--gray-l)">(이사장/선장/동아리장/반장/총장/부총장/총괄/교수/코치는 정렬 우선순위 적용 · 버튼은 여러 개 함께 선택 가능)</span></label>
        <div id="ed-role-btns" style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:6px">
          ${(()=>{const _cur=(p.role||'').split('&').map(s=>s.trim()).filter(Boolean);return MAIN_ROLES.map(r=>{const ic=ROLE_ICONS[r]||'🏷️';const col=ROLE_COLORS[r]||'#6b7280';const on=_cur.includes(r);return `<button type="button" onclick="_cfgToggleEdRole(this)" data-role="${r}" data-col="${col}" style="padding:3px 8px;border-radius:6px;border:1.5px solid ${col};background:${on?col+'22':'var(--white)'};color:${col};font-size:var(--fs-caption);font-weight:700;cursor:pointer">${ic} ${r}${on?' ✓':''}</button>`;}).join('');})()}
          <button type="button" onclick="document.getElementById('ed-role').value='';_cfgSyncEdRoleBtns();" style="padding:3px 8px;border-radius:6px;border:1.5px solid #9ca3af;background:var(--white);color:#9ca3af;font-size:var(--fs-caption);font-weight:700;cursor:pointer">✕ 없음</button>
        </div>
        <input type="text" id="ed-role" value="${p.role||''}" placeholder="직책 직접 입력 또는 위 버튼 클릭(여러 개 선택 시 & 로 연결됨)" oninput="_cfgSyncEdRoleBtns()" style="width:100%">
        <div style="display:flex;align-items:center;gap:6px;margin-top:8px">
          <label style="display:flex;align-items:center;gap:5px;font-size:var(--fs-caption);color:var(--gray-l);white-space:nowrap;cursor:pointer">
            <input type="checkbox" id="ed-role-order-on" ${(typeof p.roleOrder==='number')?'checked':''} onchange="document.getElementById('ed-role-order').disabled=!this.checked;" style="width:auto">
            현황판 표시 순서 직접 지정
          </label>
          <input type="number" id="ed-role-order" value="${(typeof p.roleOrder==='number')?p.roleOrder:''}" placeholder="숫자가 작을수록 앞에 표시" ${(typeof p.roleOrder==='number')?'':'disabled'} style="width:170px;flex-shrink:0">
        </div>
        <div style="font-size:10px;color:var(--gray-l);margin-top:3px">체크하지 않으면 위 직책 텍스트로 자동 정렬됩니다. 같은 순서 번호끼리는 티어 순으로 정렬됩니다.</div>
      </div>
      <div style="grid-column:1 / -1;min-width:0">
        <label>🏠 방송국 홈 URL <span style="font-size:10px;font-weight:400;color:var(--gray-l)">(홈 아이콘 클릭 시 이동)</span></label>
        <div style="display:flex;gap:8px;align-items:center">
          <input type="text" id="ed-channel" value="${p.channelUrl||''}" placeholder="https://chzzk.naver.com/... 또는 https://twitch.tv/..." style="flex:1;min-width:0">
          ${p.channelUrl?`<a href="${p.channelUrl}" target="_blank" style="font-size:var(--fs-lg);text-decoration:none" title="방송국 바로가기">🏠</a>`:''}
        </div>
        <div style="font-size:10px;color:var(--gray-l);margin-top:6px">치지직/트위치/유튜브 등 방송국 주소. 스트리머 상세에서 홈 아이콘으로 이동됩니다.</div>
      </div>
    </div>
    <div id="ep-p1-sec" class="ep-adv-section">
      <div style="font-size:var(--fs-caption);color:var(--gray-l);line-height:1.6;margin-bottom:10px">
        (채우기/cover 사용 시) 얼굴이 잘리면 아래 미리보기에서 <b>드래그</b>하거나 X/Y로 위치를 보정할 수 있습니다.
      </div>
      <label style="display:flex;align-items:center;gap:6px;font-size:var(--fs-caption);font-weight:900;color:var(--text3);margin:-2px 0 10px">
        <input type="checkbox" id="ed-p1pos-use" ${_p1Use?'checked':''} onchange="document.getElementById('ed-p1pos-prev').style.opacity=this.checked?1:.55">
        이 보정 적용(체크 해제 시 기존 설정 사용)
      </label>
      <input type="hidden" id="ed-p1pos-del" value="0">
      <div id="ed-p1pos-prev" style="position:relative;height:150px;border-radius:var(--r2);overflow:hidden;border:1.5px solid var(--border);background:linear-gradient(135deg, rgba(100,116,139,.26), rgba(100,116,139,.10));touch-action:none;user-select:none;opacity:${_p1Use?1:.55}">
        ${p.photo?`<img id="ed-p1pos-img" src="${toHttpsUrl(p.photo).replace(/\"/g,'&quot;')}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:${_p1X}% ${_p1Y}%;transform:scale(1.02)" onerror="this.style.display='none'">`:''}
        <div style="position:absolute;inset:0;background:linear-gradient(180deg, rgba(15,23,42,.04) 0%, rgba(15,23,42,.10) 60%, rgba(15,23,42,.22) 100%)"></div>
        <div style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:18px;height:18px;border-radius:999px;border:2px solid rgba(255,255,255,.9);box-shadow:0 2px 10px rgba(0,0,0,.35);pointer-events:none"></div>
        <div style="position:absolute;left:50%;top:0;bottom:0;width:1px;background:rgba(255,255,255,.35);pointer-events:none"></div>
        <div style="position:absolute;top:50%;left:0;right:0;height:1px;background:rgba(255,255,255,.35);pointer-events:none"></div>
      </div>
      <div style="display:grid;grid-template-columns:90px 1fr 52px;gap:10px;align-items:center;margin-top:10px">
        <div style="font-size:var(--fs-sm);font-weight:800;color:var(--text2)">가로(X)</div>
        <input type="range" id="ed-p1pos-x" min="0" max="100" step="1" value="${_p1X}" oninput="edP1PosSyncFromInputs()" style="width:100%">
        <div id="ed-p1pos-xv" style="font-size:var(--fs-caption);color:var(--gray-l);font-weight:900;text-align:right">${_p1X}%</div>
      </div>
      <div style="display:grid;grid-template-columns:90px 1fr 52px;gap:10px;align-items:center;margin-top:6px">
        <div style="font-size:var(--fs-sm);font-weight:800;color:var(--text2)">세로(Y)</div>
        <input type="range" id="ed-p1pos-y" min="0" max="100" step="1" value="${_p1Y}" oninput="edP1PosSyncFromInputs()" style="width:100%">
        <div id="ed-p1pos-yv" style="font-size:var(--fs-caption);color:var(--gray-l);font-weight:900;text-align:right">${_p1Y}%</div>
      </div>
      <div style="display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end;margin-top:10px">
        <button type="button" class="btn btn-w btn-xs" onclick="edP1PosCenter()">센터(50/50)</button>
        <button type="button" class="btn btn-w btn-xs" onclick="edP1PosDelete()">삭제(기본)</button>
      </div>
    </div>

    <div id="ep-cycle-sec" class="ep-adv-section" style="margin-top:10px;padding:12px;background:var(--surface);border:1px solid var(--border);border-radius:var(--r)">
      <div style="display:flex;justify-content:space-between;align-items:center;gap:8px">
        <div>
          <div style="font-weight:700;font-size:var(--fs-sm);color:var(--text2)">순환 이미지 (최대 10장)</div>
          <div style="font-size:var(--fs-caption);color:var(--gray-l);line-height:1.6;margin-top:4px">이미지별 탭에서 순서대로 전환됩니다. (전환 시간은 아래에서 설정)</div>
        </div>
        <button type="button" class="btn btn-w btn-xs" data-ep-toggle="cycle" onclick="toggleEditPlayerSection('cycle', this)">${_epCycleCollapsed?'펼치기':'접기'}</button>
      </div>
      <div id="ep-sec-body-cycle" style="display:${_epCycleCollapsed?'none':'block'};margin-top:${_epCycleCollapsed?'0':'10px'}">
      <div style="display:flex;flex-direction:column;gap:6px">
        <div style="display:flex;align-items:center;gap:8px">
          <span style="font-size:var(--fs-caption);font-weight:700;color:var(--text3);min-width:36px">이미지 1</span>
          <input type="text" id="ed-photo" value="${p.photo||''}" placeholder="https://... 기본 프로필 (현황판 카드에도 사용)" style="flex:1" oninput="(function(el){const v=el.value.trim();const img=document.getElementById('ed-photo-preview');const warn=document.getElementById('ed-photo-warn');if(v&&v.startsWith('data:')){el.style.borderColor='#dc2626';if(warn){warn.style.color='#dc2626';warn.textContent='❌ base64 이미지 직접 입력 불가 — imgur.com 등에 업로드 후 URL 사용';}}else{el.style.borderColor='';if(warn){warn.textContent='이미지 URL을 붙여넣으면 현황판 선수 카드에 프로필 사진이 표시됩니다.';warn.style.color='var(--gray-l)';}}const wrap=document.getElementById('ed-photo-preview-wrap');if(v&&!v.startsWith('data:')){img.src=v;img.style.display='block';if(wrap)wrap.style.display='inline-block';}else{if(wrap)wrap.style.display='none';}})(this)">
          <span id="ed-photo-preview-wrap" style="position:relative;width:36px;height:36px;border-radius:var(--su_profile_radius,50%);overflow:hidden;flex-shrink:0;background:#e2e8f0;border:2px solid var(--border);display:${p.photo&&!p.photo.startsWith('data:')?'inline-block':'none'}">
            <img id="ed-photo-preview" src="${p.photo&&!p.photo.startsWith('data:')?toHttpsUrl(p.photo):''}" style="width:36px;height:36px;object-fit:cover;display:block" onerror="this.style.display='none'">
          </span>
        </div>
        <div id="ed-photo-warn" style="font-size:10px;color:${p.photo&&p.photo.startsWith('data:')?'#dc2626':'var(--gray-l)'};margin-left:44px">${p.photo&&p.photo.startsWith('data:')?'❌ base64 이미지 직접 입력 불가 — imgur.com 등에 업로드 후 URL 사용':'이미지 1은 현황판 카드에도 사용됩니다.'}</div>
        <div style="display:flex;align-items:center;gap:8px">
          <span style="font-size:var(--fs-caption);font-weight:700;color:var(--text3);min-width:36px">이미지 2</span>
          <input type="text" id="ed-photo2" value="${p.secondProfileFile||''}" placeholder="https://... (전환 시간 설정 가능)" style="flex:1" oninput="syncEditPlayerThumbPreview('ed-photo2','ed-photo2-preview-wrap','ed-photo2-preview');edP2PosSyncFromInputs(true)">
          <span id="ed-photo2-preview-wrap" title="이미지 2 미리보기" style="position:relative;width:48px;height:48px;border-radius:12px;overflow:hidden;flex-shrink:0;background:#e2e8f0;border:2px solid var(--border);display:${p.secondProfileFile&&!p.secondProfileFile.startsWith('data:')?'inline-flex':'none'};align-items:center;justify-content:center">
            <img id="ed-photo2-preview" src="${p.secondProfileFile&&!p.secondProfileFile.startsWith('data:')?toHttpsUrl(p.secondProfileFile).replace(/\"/g,'&quot;'):''}" style="width:48px;height:48px;object-fit:cover;display:block" onerror="this.style.display='none'">
          </span>
        </div>
        <div style="display:flex;align-items:center;gap:8px">
          <span style="font-size:var(--fs-caption);font-weight:700;color:var(--text3);min-width:36px">이미지 3</span>
          <input type="text" id="ed-photo3" value="${p.profileFile3||''}" placeholder="https://... (선택)" style="flex:1" oninput="syncEditPlayerThumbPreview('ed-photo3','ed-photo3-preview-wrap','ed-photo3-preview');edP3PosSyncFromInputs(true)">
          <span id="ed-photo3-preview-wrap" title="이미지 3 미리보기" style="position:relative;width:48px;height:48px;border-radius:12px;overflow:hidden;flex-shrink:0;background:#e2e8f0;border:2px solid var(--border);display:${p.profileFile3&&!p.profileFile3.startsWith('data:')?'inline-flex':'none'};align-items:center;justify-content:center">
            <img id="ed-photo3-preview" src="${p.profileFile3&&!p.profileFile3.startsWith('data:')?toHttpsUrl(p.profileFile3).replace(/\"/g,'&quot;'):''}" style="width:48px;height:48px;object-fit:cover;display:block" onerror="this.style.display='none'">
          </span>
        </div>
        <div style="display:flex;align-items:center;gap:8px">
          <span style="font-size:var(--fs-caption);font-weight:700;color:var(--text3);min-width:36px">이미지 4</span>
          <input type="text" id="ed-photo4" value="${p.profileFile4||''}" placeholder="https://... (선택)" style="flex:1" oninput="syncEditPlayerThumbPreview('ed-photo4','ed-photo4-preview-wrap','ed-photo4-preview');edP4PosSyncFromInputs(true)">
          <span id="ed-photo4-preview-wrap" title="이미지 4 미리보기" style="position:relative;width:48px;height:48px;border-radius:12px;overflow:hidden;flex-shrink:0;background:#e2e8f0;border:2px solid var(--border);display:${p.profileFile4&&!p.profileFile4.startsWith('data:')?'inline-flex':'none'};align-items:center;justify-content:center">
            <img id="ed-photo4-preview" src="${p.profileFile4&&!p.profileFile4.startsWith('data:')?toHttpsUrl(p.profileFile4).replace(/\"/g,'&quot;'):''}" style="width:48px;height:48px;object-fit:cover;display:block" onerror="this.style.display='none'">
          </span>
        </div>
        <div style="display:flex;align-items:center;gap:8px">
          <span style="font-size:var(--fs-caption);font-weight:700;color:var(--text3);min-width:36px">이미지 5</span>
          <input type="text" id="ed-photo5" value="${p.profileFile5||''}" placeholder="https://... (선택)" style="flex:1" oninput="syncEditPlayerThumbPreview('ed-photo5','ed-photo5-preview-wrap','ed-photo5-preview');edP5PosSyncFromInputs(true)">
          <span id="ed-photo5-preview-wrap" title="이미지 5 미리보기" style="position:relative;width:48px;height:48px;border-radius:12px;overflow:hidden;flex-shrink:0;background:#e2e8f0;border:2px solid var(--border);display:${p.profileFile5&&!p.profileFile5.startsWith('data:')?'inline-flex':'none'};align-items:center;justify-content:center">
            <img id="ed-photo5-preview" src="${p.profileFile5&&!p.profileFile5.startsWith('data:')?toHttpsUrl(p.profileFile5).replace(/\"/g,'&quot;'):''}" style="width:48px;height:48px;object-fit:cover;display:block" onerror="this.style.display='none'">
          </span>
        </div>
        <div id="ed-photo6to10-more" style="display:${_photo6to10AnyFilled?'flex':'none'};flex-direction:column;gap:6px">
        ${[6,7,8,9,10].map(n=>{
          const val = p[n===6?'profileFile6':`profileFile${n}`]||'';
          return `<div style="display:flex;align-items:center;gap:8px">
          <span style="font-size:var(--fs-caption);font-weight:700;color:var(--text3);min-width:36px">이미지 ${n}</span>
          <input type="text" id="ed-photo${n}" value="${val}" placeholder="https://... (선택)" style="flex:1" oninput="syncEditPlayerThumbPreview('ed-photo${n}','ed-photo${n}-preview-wrap','ed-photo${n}-preview');edP${n}PosSyncFromInputs(true)">
          <span id="ed-photo${n}-preview-wrap" title="이미지 ${n} 미리보기" style="position:relative;width:48px;height:48px;border-radius:12px;overflow:hidden;flex-shrink:0;background:#e2e8f0;border:2px solid var(--border);display:${val&&!val.startsWith('data:')?'inline-flex':'none'};align-items:center;justify-content:center">
            <img id="ed-photo${n}-preview" src="${val&&!val.startsWith('data:')?toHttpsUrl(val).replace(/\"/g,'&quot;'):''}" style="width:48px;height:48px;object-fit:cover;display:block" onerror="this.style.display='none'">
          </span>
        </div>`;
        }).join('')}
        </div>
        <button type="button" id="ed-photo6to10-toggle" class="btn btn-w btn-xs" style="align-self:flex-start;margin-top:2px" onclick="(function(btn){const box=document.getElementById('ed-photo6to10-more');const show=box.style.display==='none';box.style.display=show?'flex':'none';btn.textContent=show?'사진 6~10 숨기기':'사진 6~10 추가 +';})(this)">${_photo6to10AnyFilled?'사진 6~10 숨기기':'사진 6~10 추가 +'}</button>
      </div>
      <div style="margin-top:10px;padding:10px;background:rgba(37,99,235,.06);border:1px solid rgba(37,99,235,.18);border-radius:var(--r)">
        <div style="font-size:var(--fs-sm);font-weight:900;color:var(--text2);margin-bottom:8px">전환 시간(초)</div>
        ${_swapDelayHtml}
        <div style="font-size:10px;color:var(--gray-l);margin-top:6px">※ 실제 존재하는 이미지 순서만 순환합니다.</div>
      </div>
      </div>
    </div>

    <div id="ep-p2to10-sec" class="ep-adv-section" style="margin-top:10px;padding:12px;background:var(--surface);border:1px solid var(--border);border-radius:var(--r)">
      <div style="display:flex;justify-content:space-between;align-items:center;gap:8px">
        <div>
          <div style="font-weight:700;font-size:var(--fs-sm);color:var(--text2)">프로필 사진 2~10 — 얼굴 위치 보정</div>
          <div style="font-size:var(--fs-caption);color:var(--gray-l);line-height:1.6;margin-top:4px">아래 번호를 눌러 필요한 사진만 위치를 조정하세요. (초록 점 = URL 등록됨)</div>
        </div>
        <button type="button" class="btn btn-w btn-xs" data-ep-toggle="postab" onclick="toggleEditPlayerSection('postab', this)">${_epPosTabCollapsed?'펼치기':'접기'}</button>
      </div>
      <div id="ep-sec-body-postab" style="display:${_epPosTabCollapsed?'none':'block'};margin-top:${_epPosTabCollapsed?'0':'10px'}">
      <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px">
        ${_photoPosData.map((item,idx)=>`<button type="button" class="btn btn-xs ${idx===0?'btn-b':'btn-w'}" data-pos-tab-btn="${item.n}" onclick="edPosTabSelect(${item.n})" style="position:relative;min-width:34px">${item.n}${item.url?`<span style="position:absolute;top:-3px;right:-3px;width:6px;height:6px;border-radius:999px;background:#22c55e"></span>`:''}</button>`).join('')}
      </div>
      ${_photoPosData.map((item,idx)=>`
      <div id="ep-postab-body-${item.n}" data-pos-tab-body="${item.n}" style="display:${idx===0?'block':'none'};padding:12px;background:rgba(255,255,255,.6);border:1px solid var(--border);border-radius:var(--r)">
        <div style="font-weight:900;font-size:var(--fs-sm);color:var(--text2);margin-bottom:6px">이미지 ${item.n}</div>
        <label style="display:flex;align-items:center;gap:6px;font-size:var(--fs-caption);font-weight:900;color:var(--text3);margin:-2px 0 10px">
          <input type="checkbox" id="ed-p${item.n}pos-use" ${item.use?'checked':''} onchange="document.getElementById('ed-p${item.n}pos-prev').style.opacity=this.checked?1:.55">
          이 보정 적용(체크 해제 시 기존 설정 사용)
        </label>
        <input type="hidden" id="ed-p${item.n}pos-del" value="0">
        <div id="ed-p${item.n}pos-prev" style="position:relative;height:150px;border-radius:var(--r2);overflow:hidden;border:1.5px solid var(--border);background:linear-gradient(135deg, rgba(100,116,139,.26), rgba(100,116,139,.10));touch-action:none;user-select:none;opacity:${item.use?1:.55}">
          ${item.url?`<img id="ed-p${item.n}pos-img" src="${toHttpsUrl(item.url).replace(/\"/g,'&quot;')}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:${item.x}% ${item.y}%;transform:scale(1.02)" onerror="this.style.display='none'">`:''}
          <div style="position:absolute;inset:0;background:linear-gradient(180deg, rgba(15,23,42,.04) 0%, rgba(15,23,42,.10) 60%, rgba(15,23,42,.22) 100%)"></div>
          <div style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:18px;height:18px;border-radius:999px;border:2px solid rgba(255,255,255,.9);box-shadow:0 2px 10px rgba(0,0,0,.35);pointer-events:none"></div>
          <div style="position:absolute;left:50%;top:0;bottom:0;width:1px;background:rgba(255,255,255,.35);pointer-events:none"></div>
          <div style="position:absolute;top:50%;left:0;right:0;height:1px;background:rgba(255,255,255,.35);pointer-events:none"></div>
        </div>
        <div style="display:grid;grid-template-columns:90px 1fr 52px;gap:10px;align-items:center;margin-top:10px">
          <div style="font-size:var(--fs-sm);font-weight:800;color:var(--text2)">가로(X)</div>
          <input type="range" id="ed-p${item.n}pos-x" min="0" max="100" step="1" value="${item.x}" oninput="edP${item.n}PosSyncFromInputs()" style="width:100%">
          <div id="ed-p${item.n}pos-xv" style="font-size:var(--fs-caption);color:var(--gray-l);font-weight:900;text-align:right">${item.x}%</div>
        </div>
        <div style="display:grid;grid-template-columns:90px 1fr 52px;gap:10px;align-items:center;margin-top:6px">
          <div style="font-size:var(--fs-sm);font-weight:800;color:var(--text2)">세로(Y)</div>
          <input type="range" id="ed-p${item.n}pos-y" min="0" max="100" step="1" value="${item.y}" oninput="edP${item.n}PosSyncFromInputs()" style="width:100%">
          <div id="ed-p${item.n}pos-yv" style="font-size:var(--fs-caption);color:var(--gray-l);font-weight:900;text-align:right">${item.y}%</div>
        </div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end;margin-top:10px">
          <button type="button" class="btn btn-w btn-xs" onclick="edP${item.n}PosCenter()">센터(50/50)</button>
          <button type="button" class="btn btn-w btn-xs" onclick="edP${item.n}PosDelete()">삭제(기본)</button>
        </div>
      </div>`).join('')}
      </div>
    </div>
    <div id="ep-header-sec" class="ep-adv-section" style="margin-top:14px;padding:12px;background:var(--surface);border:1px solid var(--border);border-radius:8px">
      <div style="display:flex;justify-content:space-between;align-items:center;gap:8px">
        <div style="font-weight:700;font-size:var(--fs-sm);color:var(--text2)">스트리머 상세 헤더 배경</div>
        <button type="button" class="btn btn-w btn-xs" data-ep-toggle="header" onclick="toggleEditPlayerSection('header', this)">${_epHeaderCollapsed?'펼치기':'접기'}</button>
      </div>
      <div id="ep-sec-body-header" style="display:${_epHeaderCollapsed?'none':'block'};margin-top:${_epHeaderCollapsed?'0':'10px'}">
      <div style="padding:10px;background:rgba(255,255,255,.6);border:1px solid var(--border);border-radius:var(--r);margin-bottom:12px">
        <div style="font-weight:800;font-size:var(--fs-sm);color:var(--text2);margin-bottom:8px">🎨 프로필·이름·배너 효과</div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:10px">
          <div>
            <label>프로필 이미지 효과</label>
            <select id="ed-photo-fx">
              <option value="none"${!p.pdPhotoFx||p.pdPhotoFx==='none'?' selected':''}>없음</option>
              <option value="glow"${p.pdPhotoFx==='glow'?' selected':''}>✨ 은은한 글로우</option>
              <option value="aura"${p.pdPhotoFx==='aura'?' selected':''}>💡 맥동하는 빛(오라)</option>
              <option value="spotlight"${p.pdPhotoFx==='spotlight'?' selected':''}>🔦 스포트라이트</option>
              <option value="prism"${p.pdPhotoFx==='prism'?' selected':''}>🌈 프리즘 링(회전)</option>
              <option value="sparkle"${p.pdPhotoFx==='sparkle'?' selected':''}>✦ 반짝반짝(별)</option>
              <option value="shadow"${p.pdPhotoFx==='shadow'?' selected':''}>🌑 강한 그림자</option>
              <option value="float"${p.pdPhotoFx==='float'?' selected':''}>🎈 둥실둥실</option>
              <option value="shine"${p.pdPhotoFx==='shine'?' selected':''}>💫 반짝임(스윕)</option>
              <option value="pulse"${p.pdPhotoFx==='pulse'?' selected':''}>🫀 맥박</option>
              <option value="tilt"${p.pdPhotoFx==='tilt'?' selected':''}>🌀 좌우 흔들림</option>
              <option value="halo"${p.pdPhotoFx==='halo'?' selected':''}>⭕ 퍼지는 링(헤일로)</option>
              <option value="rainbow"${p.pdPhotoFx==='rainbow'?' selected':''}>🌈 색상 순환</option>
              <option value="flash"${p.pdPhotoFx==='flash'?' selected':''}>⚡ 플래시</option>
              <option value="wobble"${p.pdPhotoFx==='wobble'?' selected':''}>🤸 왕복 기울임</option>
              <option value="orbit"${p.pdPhotoFx==='orbit'?' selected':''}>🪐 공전하는 점</option>
              <option value="flip"${p.pdPhotoFx==='flip'?' selected':''}>🔄 카드 플립</option>
              <option value="bounce"${p.pdPhotoFx==='bounce'?' selected':''}>🏀 바운스</option>
              <option value="flicker"${p.pdPhotoFx==='flicker'?' selected':''}>📺 지지직(플리커)</option>
            </select>
          </div>
          <div>
            <label>스트리머명 글자 효과</label>
            <select id="ed-name-fx">
              <option value="none"${!p.pdNameFx||p.pdNameFx==='none'?' selected':''}>없음</option>
              <option value="outline"${p.pdNameFx==='outline'?' selected':''}>✏️ 외곽선</option>
              <option value="gradient"${p.pdNameFx==='gradient'?' selected':''}>🌈 그라디언트</option>
              <option value="neon"${p.pdNameFx==='neon'?' selected':''}>💡 네온</option>
              <option value="glow"${p.pdNameFx==='glow'?' selected':''}>🔆 은은한 글로우</option>
              <option value="shimmer"${p.pdNameFx==='shimmer'?' selected':''}>✨ 시머(빛 스윕)</option>
              <option value="holo"${p.pdNameFx==='holo'?' selected':''}>💿 홀로그램</option>
              <option value="shadow3d"${p.pdNameFx==='shadow3d'?' selected':''}>🧱 입체 그림자</option>
              <option value="fire"${p.pdNameFx==='fire'?' selected':''}>🔥 불꽃</option>
              <option value="ice"${p.pdNameFx==='ice'?' selected':''}>❄️ 아이스</option>
              <option value="metallic"${p.pdNameFx==='metallic'?' selected':''}>🥇 메탈릭(금속광)</option>
              <option value="emboss"${p.pdNameFx==='emboss'?' selected':''}>🪙 양각 각인</option>
              <option value="candy"${p.pdNameFx==='candy'?' selected':''}>🍬 캔디 레인보우</option>
              <option value="flicker"${p.pdNameFx==='flicker'?' selected':''}>⚡ 네온 플리커</option>
              <option value="stone"${p.pdNameFx==='stone'?' selected':''}>🪨 돌 각인</option>
              <option value="glitch"${p.pdNameFx==='glitch'?' selected':''}>👾 글리치</option>
              <option value="chrome"${p.pdNameFx==='chrome'?' selected':''}>🔩 크롬(은속광)</option>
              <option value="pastel"${p.pdNameFx==='pastel'?' selected':''}>🌸 파스텔 레인보우</option>
            </select>
          </div>
          <div>
            <label>상단 배너 전체 효과</label>
            <select id="ed-hero-fx">
              <option value="none"${!p.pdHeroFx||p.pdHeroFx==='none'?' selected':''}>없음</option>
              <option value="aurora"${p.pdHeroFx==='aurora'?' selected':''}>🌌 오로라(부유하는 빛)</option>
              <option value="grid"${p.pdHeroFx==='grid'?' selected':''}>▦ 그리드 패턴</option>
              <option value="particles"${p.pdHeroFx==='particles'?' selected':''}>✨ 떠오르는 파티클</option>
              <option value="shine"${p.pdHeroFx==='shine'?' selected':''}>💫 전체 반짝임(스윕)</option>
              <option value="spotlight"${p.pdHeroFx==='spotlight'?' selected':''}>🔦 이동하는 스포트라이트</option>
              <option value="stripes"${p.pdHeroFx==='stripes'?' selected':''}>➗ 대각선 스트라이프</option>
              <option value="confetti"${p.pdHeroFx==='confetti'?' selected':''}>🎊 색종이(컨페티)</option>
              <option value="vignette"${p.pdHeroFx==='vignette'?' selected':''}>🌗 맥동하는 비네트</option>
              <option value="wavebands"${p.pdHeroFx==='wavebands'?' selected':''}>〰️ 흐르는 밴드</option>
              <option value="snow"${p.pdHeroFx==='snow'?' selected':''}>❄️ 눈송이</option>
              <option value="beam"${p.pdHeroFx==='beam'?' selected':''}>🔆 무빙 빔</option>
              <option value="glowpulse"${p.pdHeroFx==='glowpulse'?' selected':''}>💡 은은한 발광 펄스</option>
            </select>
          </div>
        </div>
      </div>
      <label>배경 이미지 URL <span style="font-size:10px;font-weight:400;color:var(--gray-l)">(비워두면 설정탭 기본값 사용)</span></label>
      <input type="text" id="ed-phbg" value="${p.detailHeaderBgImg||''}" placeholder="https://... 이미지 URL">
      <div id="ed-phbg-prev" style="position:relative;height:150px;border-radius:var(--r2);overflow:hidden;border:1.5px solid var(--border);margin-top:10px;background:linear-gradient(135deg, rgba(100,116,139,.26), rgba(100,116,139,.10));touch-action:none;user-select:none">
        ${(p.detailHeaderBgImg||'').trim()?`<div id="ed-phbg-prev-bg" style="position:absolute;inset:-8%;background-image:url('${toHttpsUrl((p.detailHeaderBgImg||'').trim()).replace(/'/g,'%27')}');background-repeat:no-repeat;background-position:${Number(p.detailHeaderBgPosX??50)||50}% ${Number(p.detailHeaderBgPosY??50)||50}%;background-size:${(p.detailHeaderBgFit||'')==='fill'?'100% 100%':((p.detailHeaderBgFit||'')==='cover'?'cover':'contain')};transform:scale(${Math.max(40,Math.min(220,Number(p.detailHeaderBgScale||100)||100))/100});transform-origin:center center;opacity:.85;pointer-events:none"></div>`:''}
        <div style="position:absolute;inset:0;background:linear-gradient(180deg, rgba(15,23,42,.04) 0%, rgba(15,23,42,.10) 60%, rgba(15,23,42,.22) 100%);pointer-events:none"></div>
        <div style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:18px;height:18px;border-radius:999px;border:2px solid rgba(255,255,255,.9);box-shadow:0 2px 10px rgba(0,0,0,.35);pointer-events:none"></div>
        <div style="position:absolute;left:50%;top:0;bottom:0;width:1px;background:rgba(255,255,255,.35);pointer-events:none"></div>
        <div style="position:absolute;top:50%;left:0;right:0;height:1px;background:rgba(255,255,255,.35);pointer-events:none"></div>
        <div style="position:absolute;left:10px;top:10px;z-index:1;font-size:var(--fs-caption);font-weight:900;color:rgba(255,255,255,.82);text-shadow:0 2px 8px rgba(0,0,0,.35);pointer-events:none">드래그로 위치 조정</div>
        ${!(p.detailHeaderBgImg||'').trim()?`<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:var(--fs-sm);font-weight:900;color:rgba(15,23,42,.55)">URL을 입력하면 미리보기가 표시됩니다</div>`:''}
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
            <span id="ed-phbg-scale-val" style="font-size:var(--fs-caption);color:var(--gray-l);min-width:40px;text-align:right;font-weight:700">${Number(p.detailHeaderBgScale||100)||100}%</span>
          </div>
        </div>
      </div>
      <div style="font-size:var(--fs-caption);font-weight:700;color:var(--text3);margin:10px 0 6px">이미지 위치</div>
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
            <span id="ed-phbg-posx-val" style="font-size:var(--fs-caption);color:var(--gray-l);min-width:40px;text-align:right;font-weight:700">${Number(p.detailHeaderBgPosX??50)||50}%</span>
          </div>
        </div>
        <div>
          <label>세로 미세 위치</label>
          <div style="display:flex;align-items:center;gap:8px">
            <input type="range" id="ed-phbg-posy" min="0" max="100" step="1" value="${Number(p.detailHeaderBgPosY??50)||50}" style="flex:1;accent-color:var(--blue)" oninput="document.getElementById('ed-phbg-posy-val').textContent=this.value+'%'; edPhbgSyncFromInputs()">
            <span id="ed-phbg-posy-val" style="font-size:var(--fs-caption);color:var(--gray-l);min-width:40px;text-align:right;font-weight:700">${Number(p.detailHeaderBgPosY??50)||50}%</span>
          </div>
        </div>
      </div>
      </div>
    </div>
    <div id="ep-card-sec" class="ep-adv-section" style="margin-top:14px;padding:12px;background:var(--surface);border:1px solid var(--border);border-radius:8px">
      <div style="display:flex;justify-content:space-between;align-items:center;gap:8px">
        <div>
          <div style="font-weight:700;font-size:var(--fs-sm);color:var(--text2)">카드 전용 이미지</div>
          <div style="font-size:var(--fs-caption);color:var(--gray-l);line-height:1.6;margin-top:4px">비워두면 프로필 사진 1을 사용합니다. 카드형 레이아웃(개인전·끝장전·프로리그 끝장전)에만 적용됩니다.</div>
        </div>
        <button type="button" class="btn btn-w btn-xs" data-ep-toggle="card" onclick="toggleEditPlayerSection('card', this)">${_epCardCollapsed?'펼치기':'접기'}</button>
      </div>
      <div id="ep-sec-body-card" style="display:${_epCardCollapsed?'none':'block'};margin-top:${_epCardCollapsed?'0':'8px'}">
      <div style="margin-bottom:10px;padding:10px;background:var(--white);border:1px solid var(--border);border-radius:var(--r)">
        <div style="font-weight:700;font-size:var(--fs-sm);color:var(--text2);margin-bottom:6px">얼굴 위치 보정</div>
        <div style="font-size:var(--fs-caption);color:#78350f;line-height:1.6;margin-bottom:10px">(채우기/cover 기준) 아래 미리보기에서 <b>드래그</b>하거나 X/Y로 위치를 보정할 수 있습니다.</div>
        <label style="display:flex;align-items:center;gap:6px;font-size:var(--fs-caption);font-weight:700;color:var(--text3);margin:-2px 0 10px">
          <input type="checkbox" id="ed-cardpos-use" ${_scUse?'checked':''} onchange="document.getElementById('ed-cardpos-prev').style.opacity=this.checked?1:.55">
          이 보정 적용
        </label>
        <input type="hidden" id="ed-cardpos-del" value="0">
        <div id="ed-cardpos-prev" style="position:relative;height:150px;border-radius:var(--r2);overflow:hidden;border:1.5px solid var(--border);background:linear-gradient(135deg, rgba(100,116,139,.20), rgba(100,116,139,.06));touch-action:none;user-select:none;opacity:${_scUse?1:.55}">
          ${p.shareCardPhoto?`<img id="ed-cardpos-img" src="${toHttpsUrl(p.shareCardPhoto).replace(/\"/g,'&quot;')}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:${_scX}% ${_scY}%;transform:scale(1.02)" onerror="this.style.display='none'">`:''}
          <div style="position:absolute;inset:0;background:linear-gradient(180deg, rgba(15,23,42,.04) 0%, rgba(15,23,42,.10) 60%, rgba(15,23,42,.22) 100%)"></div>
          <div style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:18px;height:18px;border-radius:999px;border:2px solid rgba(255,255,255,.9);box-shadow:0 2px 10px rgba(0,0,0,.35);pointer-events:none"></div>
          <div style="position:absolute;left:50%;top:0;bottom:0;width:1px;background:rgba(255,255,255,.35);pointer-events:none"></div>
          <div style="position:absolute;top:50%;left:0;right:0;height:1px;background:rgba(255,255,255,.35);pointer-events:none"></div>
        </div>
        <div style="display:grid;grid-template-columns:90px 1fr 52px;gap:10px;align-items:center;margin-top:10px">
          <div style="font-size:var(--fs-caption);font-weight:700;color:var(--text2)">가로(X)</div>
          <input type="range" id="ed-cardpos-x" min="0" max="100" step="1" value="${_scX}" oninput="edCardPosSyncFromInputs()" style="width:100%">
          <div id="ed-cardpos-xv" style="font-size:var(--fs-caption);color:var(--gray-l);font-weight:700;text-align:right">${_scX}%</div>
        </div>
        <div style="display:grid;grid-template-columns:90px 1fr 52px;gap:10px;align-items:center;margin-top:8px">
          <div style="font-size:var(--fs-caption);font-weight:700;color:var(--text2)">세로(Y)</div>
          <input type="range" id="ed-cardpos-y" min="0" max="100" step="1" value="${_scY}" oninput="edCardPosSyncFromInputs()" style="width:100%">
          <div id="ed-cardpos-yv" style="font-size:var(--fs-caption);color:var(--gray-l);font-weight:700;text-align:right">${_scY}%</div>
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
        <div style="font-weight:700;font-size:var(--fs-sm);color:var(--text2)">개인 공유카드 배경</div>
        <button type="button" class="btn btn-w btn-xs" data-ep-toggle="sharebg" onclick="toggleEditPlayerSection('sharebg', this)">${_epShareBgCollapsed?'펼치기':'접기'}</button>
      </div>
      <div id="ep-sec-body-sharebg" style="display:${_epShareBgCollapsed?'none':'block'};margin-top:${_epShareBgCollapsed?'0':'10px'}">
      <label>배경 이미지 URL <span style="font-size:10px;font-weight:400;color:var(--gray-l)">(비워두면 대학색 배경 사용)</span></label>
      <input type="text" id="ed-sharebg" value="${p.shareCardBgImg||''}" placeholder="https://... 이미지 URL" oninput="edShareBgSyncFromInputs()">
      <div id="ed-sharebg-prev" style="position:relative;height:150px;border-radius:var(--r2);overflow:hidden;border:1.5px solid var(--border);margin-top:10px;background:linear-gradient(135deg, rgba(100,116,139,.18), rgba(100,116,139,.06));user-select:none">
        ${(p.shareCardBgImg||'').trim()?`<div id="ed-sharebg-prev-bg" style="position:absolute;inset:-8%;background-image:url('${toHttpsUrl((p.shareCardBgImg||'').trim()).replace(/'/g,'%27')}');background-repeat:no-repeat;background-position:${((p.shareCardBgPosX||'center')+' '+(p.shareCardBgPosY||'center')).trim()};background-size:${(p.shareCardBgFit||'')==='fill'?'100% 100%':((p.shareCardBgFit||'')==='cover'?'cover':'contain')};transform:scale(${Math.max(40,Math.min(220,Number(p.shareCardBgScale||100)||100))/100});transform-origin:center center;opacity:.95;pointer-events:none"></div>`:''}
        <div id="ed-sharebg-prev-dark" style="position:absolute;inset:0;background:rgba(0,0,0,${Math.max(0,Math.min(85,Number(p.shareCardBgDark||18)||18))/100});pointer-events:none"></div>
        <div id="ed-sharebg-prev-fade" style="position:absolute;inset:0;background:rgba(255,255,255,${Math.max(0,Math.min(100,Number(p.shareCardBgFade||0)||0))/100});pointer-events:none"></div>
        ${!(p.shareCardBgImg||'').trim()?`<div id="ed-sharebg-prev-empty" style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:var(--fs-sm);font-weight:900;color:rgba(15,23,42,.55)">URL을 입력하면 미리보기가 표시됩니다</div>`:''}
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
            <span id="ed-sharebg-scale-val" style="font-size:var(--fs-caption);color:var(--gray-l);min-width:40px;text-align:right;font-weight:700">${Number(p.shareCardBgScale||100)||100}%</span>
          </div>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:10px">
        <div>
          <label>어둡게 덮기</label>
          <div style="display:flex;align-items:center;gap:8px">
            <input type="range" id="ed-sharebg-dark" min="0" max="85" step="5" value="${Number(p.shareCardBgDark||18)||18}" style="flex:1;accent-color:var(--blue)" oninput="document.getElementById('ed-sharebg-dark-val').textContent=this.value+'%';edShareBgSyncFromInputs()">
            <span id="ed-sharebg-dark-val" style="font-size:var(--fs-caption);color:var(--gray-l);min-width:40px;text-align:right;font-weight:700">${Number(p.shareCardBgDark||18)||18}%</span>
          </div>
        </div>
        <div>
          <label>반투명 밝기</label>
          <div style="display:flex;align-items:center;gap:8px">
            <input type="range" id="ed-sharebg-fade" min="0" max="100" step="5" value="${Number(p.shareCardBgFade||0)||0}" style="flex:1;accent-color:var(--blue)" oninput="document.getElementById('ed-sharebg-fade-val').textContent=this.value+'%';edShareBgSyncFromInputs()">
            <span id="ed-sharebg-fade-val" style="font-size:var(--fs-caption);color:var(--gray-l);min-width:40px;text-align:right;font-weight:700">${Number(p.shareCardBgFade||0)||0}%</span>
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
      <div style="font-weight:700;font-size:var(--fs-sm);color:var(--text2);margin-bottom:10px">상태 아이콘</div>
      <div style="display:flex;flex-wrap:wrap;gap:6px" id="ed-icon-btns">
        ${(()=>{const cur=getStatusIcon(p.name);return Object.entries(STATUS_ICON_DEFS).map(([id,d])=>{const isSelected=(id==='none'&&!cur)||(d.emoji&&cur===d.emoji);const iconHTML=d.emoji?(_siIsImg(d.emoji)?_siRender(d.emoji,'18px'):d.emoji):'<span style="font-size:var(--fs-caption);font-weight:700">없음</span>';return `<button type="button" onclick="setStatusIconFromModal(this,'${escJS(p.name)}','${id}')" data-icon-id="${id}" title="${d.label}" style="padding:5px 10px;border-radius:7px;border:2px solid ${isSelected?'#16a34a':'var(--border)'};background:${isSelected?'#dcfce7':'var(--white)'};cursor:pointer;min-width:38px;transition:.12s;font-family:'Noto Sans KR',sans-serif;">${iconHTML}</button>`}).join('')})()}
      </div>
      <div id="ed-icon-label" style="font-size:var(--fs-caption);color:var(--gray-l);margin-top:7px">선택: ${(()=>{const c=getStatusIcon(p.name);const found=Object.entries(STATUS_ICON_DEFS).find(([,d])=>d.emoji&&d.emoji===c);const expiry=playerStatusExpiry[p.name];const expTxt=expiry?` (${expiry} 만료)`:'';return (found?found[1].label:'없음')+expTxt;})()}</div>
      <div id="ed-icon-expiry-row" style="display:${getStatusIcon(p.name)?'flex':'none'};align-items:center;gap:7px;margin-top:8px">
        <input type="checkbox" id="ed-icon-expiry" ${playerStatusExpiry[p.name]?'checked':''} onchange="onStatusExpiryChange('${p.name}')" style="width:14px;height:14px;cursor:pointer">
        <label for="ed-icon-expiry" style="font-size:var(--fs-caption);color:var(--text3);font-weight:600;cursor:pointer;margin:0">10일 후 자동으로 없음으로 변경</label>
      </div>
    </div>
    <div id="ep-score-sec" class="ep-adv-section" style="margin-top:16px;padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:8px;">
      <div style="font-weight:700;font-size:var(--fs-sm);color:var(--text2);margin-bottom:12px">승패 직접 조정</div>
      <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-bottom:10px">
        <div style="flex:1;min-width:100px">
          <div style="font-size:var(--fs-caption);font-weight:700;color:var(--gray-l);margin-bottom:4px">승 (현재: ${p.win})</div>
          <input type="number" id="ed-win" value="${p.win}" min="0" style="width:100%">
        </div>
        <div style="flex:1;min-width:100px">
          <div style="font-size:var(--fs-caption);font-weight:700;color:var(--gray-l);margin-bottom:4px">패 (현재: ${p.loss})</div>
          <input type="number" id="ed-loss" value="${p.loss}" min="0" style="width:100%">
        </div>
        <div style="flex:1;min-width:100px">
          <div style="font-size:var(--fs-caption);font-weight:700;color:var(--gray-l);margin-bottom:4px">포인트 (현재: ${p.points})</div>
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
        <span class="apply-ok" style="display:none;color:var(--green);font-weight:700;font-size:var(--fs-sm);align-self:center">적용됨!</span>
      </div>
      <div style="font-size:10px;color:var(--gray-l);margin-top:8px">※ 승패 초기화 시 개인 경기 기록(히스토리)도 함께 삭제됩니다. 대전 기록(미니/대학대전 등)은 유지됩니다.</div>
    </div>
    <div style="margin-top:14px;padding:12px 14px;background:var(--surface);border:1px solid var(--border);border-radius:8px;">
      <div style="font-weight:700;font-size:var(--fs-sm);color:var(--text2);margin-bottom:10px">선수 상태</div>
      <label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:var(--fs-base);font-weight:600;color:var(--text2);margin:0 0 10px;padding-bottom:10px;border-bottom:1px solid var(--border)">
        <input type="checkbox" id="ed-retired" ${p.retired?'checked':''} style="width:16px;height:16px;cursor:pointer">
        <span>은퇴 <span style="font-size:var(--fs-caption);font-weight:400;color:var(--gray-l)">(현황판에서만 숨김, 경기 기록 유지)</span></span>
      </label>
      <label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:var(--fs-base);font-weight:600;color:var(--text2);margin:0 0 10px;padding-bottom:10px;border-bottom:1px solid var(--border)">
        <input type="checkbox" id="ed-inactive" ${p.inactive?'checked':''} style="width:16px;height:16px;cursor:pointer">
        <span>임시 상태 <span style="font-size:var(--fs-caption);font-weight:400;color:var(--gray-l)">(휴학/활동중단 — 반투명 표시)</span></span>
      </label>
      <label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:var(--fs-base);font-weight:600;color:var(--text2);margin:0">
        <input type="checkbox" id="ed-hide-board" ${p.hideFromBoard?'checked':''} style="width:16px;height:16px;cursor:pointer">
        <span>현황판에서 숨기기 <span style="font-size:var(--fs-caption);font-weight:400;color:var(--gray-l)">(스탯·기록 유지)</span></span>
      </label>
    </div>
    <!-- (요청사항) 크루 소속 항목 제거 -->
    <div id="ep-memo-sec" class="ep-adv-section" style="margin-top:14px;padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:8px;">
      <div style="font-weight:700;font-size:var(--fs-sm);color:var(--text2);margin-bottom:8px">선수 메모</div>
      <textarea id="ed-memo" style="width:100%;min-height:70px;font-size:var(--fs-sm);border:1px solid var(--border);border-radius:6px;padding:8px;background:var(--white);resize:vertical;font-family:'Noto Sans KR',sans-serif;line-height:1.6;box-sizing:border-box;" placeholder="선수에 대한 메모를 입력하세요...">${p.memo||''}</textarea>
    </div>
    <div id="ep-alias-sec" class="ep-adv-section" style="margin-top:14px;padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:8px;">
      <div style="font-weight:700;font-size:var(--fs-sm);color:var(--text2);margin-bottom:4px">자동인식 별명</div>
      <div style="font-size:var(--fs-caption);color:var(--gray-l);line-height:1.6;margin-bottom:10px">붙여넣기 자동인식에서 이 별명들이 <b>${esc(p.name)}</b>으로 자동 변환됩니다.</div>
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
    if(typeof edBindP6PosDrag==='function') edBindP6PosDrag();
    if(typeof edBindP7PosDrag==='function') edBindP7PosDrag();
    if(typeof edBindP8PosDrag==='function') edBindP8PosDrag();
    if(typeof edBindP9PosDrag==='function') edBindP9PosDrag();
    if(typeof edBindP10PosDrag==='function') edBindP10PosDrag();
    if(typeof edBindCardPosDrag==='function') edBindCardPosDrag();
    if(typeof edPhbgSyncFromInputs==='function') edPhbgSyncFromInputs();
    if(typeof edBindPhbgDrag==='function') edBindPhbgDrag();
    if(typeof edShareBgSyncFromInputs==='function') edShareBgSyncFromInputs();
    if(typeof syncEditPlayerThumbPreview==='function'){
      syncEditPlayerThumbPreview('ed-photo2','ed-photo2-preview-wrap','ed-photo2-preview');
      syncEditPlayerThumbPreview('ed-photo3','ed-photo3-preview-wrap','ed-photo3-preview');
      syncEditPlayerThumbPreview('ed-photo4','ed-photo4-preview-wrap','ed-photo4-preview');
      syncEditPlayerThumbPreview('ed-photo5','ed-photo5-preview-wrap','ed-photo5-preview');
      syncEditPlayerThumbPreview('ed-photo6','ed-photo6-preview-wrap','ed-photo6-preview');
      syncEditPlayerThumbPreview('ed-photo7','ed-photo7-preview-wrap','ed-photo7-preview');
      syncEditPlayerThumbPreview('ed-photo8','ed-photo8-preview-wrap','ed-photo8-preview');
      syncEditPlayerThumbPreview('ed-photo9','ed-photo9-preview-wrap','ed-photo9-preview');
      syncEditPlayerThumbPreview('ed-photo10','ed-photo10-preview-wrap','ed-photo10-preview');
    }
    if(typeof bindEditPlayerModalShortcut==='function') bindEditPlayerModalShortcut();
    if(typeof epRenderAliasesList==='function') epRenderAliasesList(name);
  }, 0); }catch(e){}
}
