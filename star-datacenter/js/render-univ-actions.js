;(function _injectUnivModalPremiumStyle(){
  if(typeof document==='undefined') return;
  if(document.getElementById('univ-modal-premium-style')) return;
  const s=document.createElement('style');
  s.id='univ-modal-premium-style';
  s.textContent=[
    '#univModal{backdrop-filter:blur(8px);background:var(--su-ud-modal-overlay-bg,rgba(15,23,42,.38))}',
    '#univModal .mbox,#univModal .umbox{background:var(--su-ud-modal-box-bg,linear-gradient(180deg,rgba(255,255,255,.985),rgba(248,250,252,.96)))!important;border:1px solid var(--su-ud-modal-box-border,rgba(148,163,184,.18))!important}',
    '#univModal #univModalTitle{background:linear-gradient(135deg,rgba(239,246,255,.96),rgba(255,255,255,.92))!important;border-bottom:1px solid var(--su-ud-modal-box-border,rgba(148,163,184,.18))!important}',
    '#univModal #univModalBody{background:linear-gradient(180deg,rgba(255,255,255,.94),rgba(248,250,252,.9))!important}',
    '#univModal[data-ud-univbg-enabled="1"] #univModalTitle{background:var(--su-ud-modal-title-bg)!important}',
    '#univModal[data-ud-univbg-enabled="1"][data-ud-univbg-scope="body"] #univModalBody,#univModal[data-ud-univbg-enabled="1"][data-ud-univbg-scope="cards"] #univModalBody{background:var(--su-ud-modal-body-bg)!important}',
    '#univModal[data-ud-univbg-enabled="1"] .ud-hero{background:var(--su-ud-hero-bg)!important;border:1px solid var(--su-ud-card-border)!important}',
    '#univModal[data-ud-univbg-enabled="1"][data-ud-univbg-scope="cards"] .ud-members-table-wrap,#univModal[data-ud-univbg-enabled="1"][data-ud-univbg-scope="cards"] .ud-opp-card,#univModal[data-ud-univbg-enabled="1"][data-ud-univbg-scope="cards"] .ud-match-card,#univModal[data-ud-univbg-enabled="1"][data-ud-univbg-scope="cards"] .ud-ace-card{background:var(--su-ud-card-bg)!important;border-color:var(--su-ud-card-border)!important}',
    '#univModal[data-ud-univbg-enabled="1"][data-ud-univbg-scope="cards"] .ud-members-table th,#univModal[data-ud-univbg-enabled="1"][data-ud-univbg-scope="cards"] .ud-members-table td{border-color:var(--su-ud-card-border)!important}',
    '#univModal[data-ud-univbtn-enabled="1"] .btn.btn-w,#univModal[data-ud-univbtn-enabled="1"] button.btn-w{background:var(--su-ud-card-btn-bg)!important;border-color:var(--su-ud-card-btn-border)!important;color:var(--su-ud-card-btn-text)!important}'
  ].join('');
  document.head.appendChild(s);
})();

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

function _getUnivHeaderPreviewSettings(){
  let fallback = {};
  try{ fallback = JSON.parse(localStorage.getItem('su_ud_style')||'{}') || {}; }catch(e){ fallback = {}; }
  const rawUrl = (document.getElementById('ue-hbg')?.value || '').trim();
  const fitInput = (document.getElementById('ue-hbg-fit')?.value || '').trim();
  const scaleInput = parseInt(document.getElementById('ue-hbg-scale')?.value || '', 10);
  const posXInput = parseInt(document.getElementById('ue-hbg-posx')?.value || '', 10);
  const posYInput = parseInt(document.getElementById('ue-hbg-posy')?.value || '', 10);
  const fallbackUrl = String(fallback.header_bg_img || '').trim();
  const fallbackFit = String(fallback.header_bg_fit || 'contain').trim() || 'contain';
  const fallbackScale = parseInt(fallback.header_bg_scale ?? '100', 10);
  const fallbackPosX = parseInt(fallback.header_bg_pos_x ?? '50', 10);
  const fallbackPosY = parseInt(fallback.header_bg_pos_y ?? '50', 10);
  const fit = (fitInput || fallbackFit || 'contain').trim();
  const scale = Math.max(40, Math.min(220, isNaN(scaleInput) ? (isNaN(fallbackScale) ? 100 : fallbackScale) : scaleInput));
  const posX = Math.max(0, Math.min(100, isNaN(posXInput) ? (isNaN(fallbackPosX) ? 50 : fallbackPosX) : posXInput));
  const posY = Math.max(0, Math.min(100, isNaN(posYInput) ? (isNaN(fallbackPosY) ? 50 : fallbackPosY) : posYInput));
  const imgUrl = rawUrl || fallbackUrl;
  return {
    imgUrl,
    fit: fit === 'fill' ? 'fill' : (fit === 'cover' ? 'cover' : 'contain'),
    scale,
    posX,
    posY,
    sourceLabel: rawUrl ? '대학별 설정' : (imgUrl ? '설정 기본값' : '이미지 없음'),
    hasFallback: !rawUrl && !!fallbackUrl
  };
}

function _updateUnivHeaderEditPreview(){
  const frame = document.getElementById('ue-hbg-preview-frame');
  if(!frame) return;
  const img = document.getElementById('ue-hbg-preview-img');
  const empty = document.getElementById('ue-hbg-preview-empty');
  const meta = document.getElementById('ue-hbg-preview-meta');
  const nameEl = document.getElementById('ue-hbg-preview-name');
  const logo = document.getElementById('ue-hbg-preview-logo');
  const logoFallback = document.getElementById('ue-hbg-preview-logo-fallback');
  const color = (document.getElementById('ue-color')?.value || '#64748b').trim() || '#64748b';
  const name = (document.getElementById('ue-name')?.value || '').trim() || (((typeof getUnivDetailState === 'function' ? getUnivDetailState() : (window.UnivDetailState||{})).currentName) || '대학명');
  const iconUrlRaw = (document.getElementById('ue-icon')?.value || '').trim();
  const iconUrl = iconUrlRaw ? toHttpsUrl(iconUrlRaw) : '';
  const { imgUrl, fit, scale, posX, posY, sourceLabel, hasFallback } = _getUnivHeaderPreviewSettings();
  frame.style.background = `linear-gradient(145deg,${color} 0%,${color}cc 60%,${color}88 100%)`;
  if(nameEl) nameEl.textContent = name;
  if(meta) meta.textContent = `${sourceLabel} · ${fit} · ${scale}% · X ${posX}% · Y ${posY}%${hasFallback ? ' · 기본값 적용중' : ''}`;
  if(logo && logoFallback){
    if(iconUrl){
      logo.src = iconUrl;
      logo.style.display = 'block';
      logoFallback.style.display = 'none';
    }else{
      logo.removeAttribute('src');
      logo.style.display = 'none';
      logoFallback.textContent = (name || '?').charAt(0);
      logoFallback.style.display = 'flex';
    }
  }
  if(img && empty){
    if(imgUrl){
      img.src = toHttpsUrl(imgUrl);
      img.style.display = 'block';
      img.style.objectFit = fit;
      img.style.objectPosition = `${posX}% ${posY}%`;
      img.style.transform = `scale(${scale/100})`;
      empty.style.display = 'none';
    }else{
      img.removeAttribute('src');
      img.style.display = 'none';
      empty.style.display = 'flex';
    }
  }
}

function openUnivModal(univName){
  if(!univName)return;
  const st = (typeof getUnivDetailState==='function') ? getUnivDetailState() : (window.UnivDetailState||{});
  try{ if(typeof applyUnivLogoVars==='function') applyUnivLogoVars(); }catch(e){}
  const titleEl = document.getElementById('univModalTitle');
  const bodyEl = document.getElementById('univModalBody');
  if(titleEl) titleEl.innerHTML=`<span class="detail-main">🎓 ${univName}</span>`;
  if(bodyEl){
    const _fn = (typeof buildUnivDetailHTML==='function')
      ? buildUnivDetailHTML
      : (typeof window.buildUnivDetailHTML==='function' ? window.buildUnivDetailHTML : null);
    bodyEl.innerHTML = _fn
      ? _fn(univName)
      : `<div style="padding:14px 12px;border-radius:var(--r2);border:1px solid rgba(148,163,184,.18);background:linear-gradient(180deg,rgba(255,255,255,.98),rgba(248,250,252,.94));box-shadow:0 12px 24px rgba(15,23,42,.06)">
          <div style="font-size:var(--fs-base);font-weight:950;color:var(--text2);margin-bottom:6px">대학 상세 렌더러 로드 실패</div>
          <div style="font-size:var(--fs-sm);color:var(--text3);line-height:1.6">buildUnivDetailHTML을 찾을 수 없습니다. 새로고침 후 다시 시도해주세요.</div>
        </div>`;
    bodyEl.scrollTop = 0;
    try{
      const scrollBox = bodyEl.closest('.umbox');
      if(scrollBox) scrollBox.scrollTop = 0;
    }catch(e){}
    injectUnivIcons(bodyEl);
  }
  st.currentName=univName;
  st.editOpen=false;
  om('univModal');
  requestAnimationFrame(()=>{
    try{
      if(bodyEl) bodyEl.scrollTop = 0;
      const scrollBox = bodyEl && bodyEl.closest ? bodyEl.closest('.umbox') : null;
      if(scrollBox) scrollBox.scrollTop = 0;
    }catch(e){}
  });
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
      <div style="font-weight:800;font-size:var(--fs-base);color:var(--blue);margin-bottom:12px">✏️ 대학 정보 수정</div>
      <label style="font-size:var(--fs-caption);font-weight:700;color:var(--text3);display:block;margin-bottom:4px">대학 이름</label>
      <input type="text" id="ue-name" value="${(typeof escAttr==='function'?escAttr(u.name||''):String(u.name||''))}" style="width:100%;margin-bottom:10px;padding:6px 10px;border-radius:7px;border:1px solid var(--border2);font-size:var(--fs-base);box-sizing:border-box" oninput="try{if(typeof _updateUnivHeaderEditPreview==='function')_updateUnivHeaderEditPreview();}catch(e){}">
      <label style="font-size:var(--fs-caption);font-weight:700;color:var(--text3);display:block;margin-bottom:4px">대표 색상</label>
      <div style="display:flex;gap:8px;align-items:center;margin-bottom:10px">
        <input type="color" id="ue-color" value="${u.color||'#6b7280'}" style="width:44px;height:36px;padding:2px;border-radius:6px;border:1px solid var(--border2);cursor:pointer" oninput="try{if(typeof _updateUnivHeaderEditPreview==='function')_updateUnivHeaderEditPreview();}catch(e){}">
        <span style="font-size:var(--fs-sm);color:var(--text3)">현재: ${u.color||'미설정'}</span>
      </div>
      <label style="font-size:var(--fs-caption);font-weight:700;color:var(--text3);display:block;margin-bottom:4px">🖼 로고 이미지 URL</label>
      <div style="display:flex;gap:8px;align-items:center;margin-bottom:6px">
        <input type="text" id="ue-icon" value="${u.icon||''}" placeholder="https://... 이미지 URL" style="flex:1;padding:6px 10px;border-radius:7px;border:1px solid var(--border2);font-size:var(--fs-sm)" oninput="const v=this.value.trim();const img=document.getElementById('ue-icon-preview');if(v){img.src=toHttpsUrl(v);img.style.display='block';}else img.style.display='none';try{if(typeof _updateUnivHeaderEditPreview==='function')_updateUnivHeaderEditPreview();}catch(e){}">
        <img id="ue-icon-preview" src="${toHttpsUrl(u.icon||'')}" style="width:40px;height:40px;object-fit:contain;border-radius:var(--su_univ_logo_radius,8px);border:1px solid var(--border);${u.icon?'':'display:none'}" onerror="this.style.display='none'">
      </div>
      <div style="font-size:10px;color:var(--gray-l);margin-bottom:12px">현황판·선수 상세에서 대학 로고로 표시됩니다.</div>
      <div style="padding:12px;background:var(--white);border:1px solid var(--border);border-radius:8px;margin-bottom:12px">
        <div style="font-weight:800;font-size:var(--fs-sm);color:var(--text2);margin-bottom:10px">🖼 대학 상세 헤더 배경</div>
        <label style="font-size:var(--fs-caption);font-weight:700;color:var(--text3);display:block;margin-bottom:4px">배경 이미지 URL <span style="font-size:10px;font-weight:400;color:var(--gray-l)">(비워두면 설정탭 기본값 사용)</span></label>
        <input type="text" id="ue-hbg" value="${u.detailHeaderBgImg||''}" placeholder="https://... 이미지 URL" style="width:100%;margin-bottom:10px;padding:6px 10px;border-radius:7px;border:1px solid var(--border2);font-size:var(--fs-sm);box-sizing:border-box" oninput="try{if(typeof _updateUnivHeaderEditPreview==='function')_updateUnivHeaderEditPreview();}catch(e){}">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
          <div>
            <label style="font-size:var(--fs-caption);font-weight:700;color:var(--text3);display:block;margin-bottom:4px">표시 방식</label>
            <select id="ue-hbg-fit" style="width:100%;padding:6px 10px;border-radius:7px;border:1px solid var(--border2);font-size:var(--fs-sm)" onchange="try{if(typeof _updateUnivHeaderEditPreview==='function')_updateUnivHeaderEditPreview();}catch(e){}">
              <option value=""${!u.detailHeaderBgFit?' selected':''}>설정값 따름</option>
              <option value="contain"${u.detailHeaderBgFit==='contain'?' selected':''}>맞춤</option>
              <option value="cover"${u.detailHeaderBgFit==='cover'?' selected':''}>채우기</option>
              <option value="fill"${u.detailHeaderBgFit==='fill'?' selected':''}>늘리기</option>
            </select>
          </div>
          <div>
            <label style="font-size:var(--fs-caption);font-weight:700;color:var(--text3);display:block;margin-bottom:4px">크기 조절</label>
            <div style="display:flex;align-items:center;gap:8px">
              <input type="range" id="ue-hbg-scale" min="40" max="220" step="5" value="${Number(u.detailHeaderBgScale||100)||100}" style="flex:1;accent-color:var(--blue)" oninput="document.getElementById('ue-hbg-scale-val').textContent=this.value+'%';try{if(typeof _updateUnivHeaderEditPreview==='function')_updateUnivHeaderEditPreview();}catch(e){}">
              <span id="ue-hbg-scale-val" style="font-size:var(--fs-caption);color:var(--gray-l);min-width:40px;text-align:right;font-weight:700">${Number(u.detailHeaderBgScale||100)||100}%</span>
            </div>
          </div>
        </div>
        <label style="font-size:var(--fs-caption);font-weight:700;color:var(--text3);display:block;margin-bottom:4px;margin-top:10px">가로 위치 (좌/우)</label>
        <div style="display:flex;align-items:center;gap:8px">
          <input type="range" id="ue-hbg-posx" min="0" max="100" step="1" value="${(u.detailHeaderBgPosX==null?50:Math.max(0,Math.min(100,parseInt(u.detailHeaderBgPosX,10)||50)))}" style="flex:1;accent-color:var(--blue)" oninput="document.getElementById('ue-hbg-posx-val').textContent=this.value+'%';try{if(typeof _updateUnivHeaderEditPreview==='function')_updateUnivHeaderEditPreview();}catch(e){}">
          <span id="ue-hbg-posx-val" style="font-size:var(--fs-caption);color:var(--gray-l);min-width:40px;text-align:right;font-weight:700">${(u.detailHeaderBgPosX==null?50:Math.max(0,Math.min(100,parseInt(u.detailHeaderBgPosX,10)||50)))}%</span>
        </div>
        <label style="font-size:var(--fs-caption);font-weight:700;color:var(--text3);display:block;margin-bottom:4px;margin-top:10px">세로 위치 (위/아래)</label>
        <div style="display:flex;align-items:center;gap:8px">
          <input type="range" id="ue-hbg-posy" min="0" max="100" step="1" value="${(u.detailHeaderBgPosY==null?50:Math.max(0,Math.min(100,parseInt(u.detailHeaderBgPosY,10)||50)))}" style="flex:1;accent-color:var(--blue)" oninput="document.getElementById('ue-hbg-posy-val').textContent=this.value+'%';try{if(typeof _updateUnivHeaderEditPreview==='function')_updateUnivHeaderEditPreview();}catch(e){}">
          <span id="ue-hbg-posy-val" style="font-size:var(--fs-caption);color:var(--gray-l);min-width:40px;text-align:right;font-weight:700">${(u.detailHeaderBgPosY==null?50:Math.max(0,Math.min(100,parseInt(u.detailHeaderBgPosY,10)||50)))}%</span>
        </div>
        <div style="margin-top:12px">
          <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:8px;flex-wrap:wrap">
            <div style="font-size:var(--fs-caption);font-weight:800;color:var(--text2)">미리보기</div>
            <div id="ue-hbg-preview-meta" style="font-size:10px;color:var(--gray-l);font-weight:700">이미지 없음</div>
          </div>
          <div id="ue-hbg-preview-frame" style="position:relative;min-height:152px;border-radius:var(--r2);overflow:hidden;border:1px solid rgba(255,255,255,.24);box-shadow:0 14px 26px rgba(15,23,42,.12);background:linear-gradient(145deg,${u.color||'#6b7280'} 0%,${(u.color||'#6b7280')}cc 60%,${(u.color||'#6b7280')}88 100%)">
            <div style="position:absolute;inset:0;overflow:hidden">
              <img id="ue-hbg-preview-img" src="" alt="" style="position:absolute;inset:-8%;width:116%;height:116%;object-fit:contain;object-position:50% 50%;transform:scale(1);transform-origin:center center;opacity:.32;display:none" onerror="this.style.display='none';const empty=document.getElementById('ue-hbg-preview-empty');if(empty)empty.style.display='flex'">
            </div>
            <div style="position:absolute;inset:0;background:linear-gradient(160deg,rgba(15,23,42,.08) 0%,rgba(15,23,42,.30) 100%)"></div>
            <div style="position:absolute;top:-34px;right:-22px;width:118px;height:118px;border-radius:50%;background:rgba(255,255,255,.08)"></div>
            <div style="position:absolute;bottom:-30px;left:24px;width:92px;height:92px;border-radius:50%;background:rgba(255,255,255,.05)"></div>
            <div style="position:relative;z-index:2;padding:16px;display:flex;align-items:flex-start;gap:12px">
              <div style="width:56px;height:56px;border-radius:18px;background:rgba(255,255,255,.16);border:1px solid rgba(255,255,255,.26);box-shadow:0 8px 24px rgba(0,0,0,.18);display:flex;align-items:center;justify-content:center;overflow:hidden;flex-shrink:0">
                <img id="ue-hbg-preview-logo" src="" alt="" style="width:100%;height:100%;object-fit:contain;padding:8px;display:none" onerror="this.style.display='none';const f=document.getElementById('ue-hbg-preview-logo-fallback');if(f)f.style.display='flex'">
                <span id="ue-hbg-preview-logo-fallback" style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:900;color:#fff">${(typeof window.escHTML==='function'?window.escHTML((u.name||'?').charAt(0)):(u.name||'?').charAt(0))}</span>
              </div>
              <div style="min-width:0;flex:1;padding-top:2px">
                <div style="font-size:9px;letter-spacing:.14em;font-weight:900;color:rgba(255,255,255,.60);text-transform:uppercase;margin-bottom:5px">Detail Header Preview</div>
                <div id="ue-hbg-preview-name" style="font-size:22px;font-weight:950;color:#fff;line-height:1.16;text-shadow:0 2px 10px rgba(0,0,0,.28);word-break:keep-all">${(typeof window.escHTML==='function'?window.escHTML(u.name||''):String(u.name||''))}</div>
                <div style="margin-top:9px;display:flex;gap:6px;flex-wrap:wrap">
                  <span style="display:inline-flex;align-items:center;padding:5px 10px;border-radius:999px;background:rgba(15,23,42,.30);border:1px solid rgba(255,255,255,.16);font-size:10px;font-weight:800;color:rgba(255,255,255,.84)">배경 잘림 미리보기</span>
                  <span style="display:inline-flex;align-items:center;padding:5px 10px;border-radius:999px;background:rgba(15,23,42,.24);border:1px solid rgba(255,255,255,.14);font-size:10px;font-weight:700;color:rgba(255,255,255,.72)">실제 저장 전 확인</span>
                </div>
              </div>
            </div>
            <div id="ue-hbg-preview-empty" style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;padding:18px;text-align:center;font-size:var(--fs-caption);line-height:1.6;color:rgba(255,255,255,.82);font-weight:700;background:linear-gradient(180deg,rgba(255,255,255,.04),rgba(255,255,255,.00))">
              배경 이미지 URL을 입력하면<br>여기서 바로 헤더 느낌을 확인할 수 있습니다.
            </div>
          </div>
          <div style="font-size:10px;color:var(--gray-l);margin-top:7px;line-height:1.5">실제 대학 상세 팝업 상단처럼 배경 크기/잘림 느낌을 바로 확인할 수 있습니다.</div>
        </div>
      </div>
      <div style="padding:12px;background:var(--white);border:1px solid var(--border);border-radius:8px;margin-bottom:12px">
        <div style="font-weight:800;font-size:var(--fs-sm);color:var(--text2);margin-bottom:10px">📋 스트리머탭 대학 헤더 설정</div>
        <label style="font-size:var(--fs-caption);font-weight:700;color:var(--text3);display:block;margin-bottom:4px">헤더 배경 이미지 URL <span style="font-size:10px;font-weight:400;color:var(--gray-l)">(비워두면 기본 그라데이션)</span></label>
        <input type="text" id="ue-streamer-hbg" value="${u.streamerHeaderBgImg||''}" placeholder="https://... 이미지 URL" style="width:100%;margin-bottom:10px;padding:6px 10px;border-radius:7px;border:1px solid var(--border2);font-size:var(--fs-sm);box-sizing:border-box">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px">
          <div>
            <label style="font-size:var(--fs-caption);font-weight:700;color:var(--text3);display:block;margin-bottom:4px">이미지 크기</label>
            <select id="ue-streamer-hbg-size" style="width:100%;padding:6px 10px;border-radius:7px;border:1px solid var(--border2);font-size:var(--fs-sm)">
              <option value="cover"${(!u.streamerHeaderBgSize||u.streamerHeaderBgSize==='cover')?' selected':''}>꽉 차게 (cover)</option>
              <option value="contain"${u.streamerHeaderBgSize==='contain'?' selected':''}>맞추기 (contain)</option>
              <option value="auto"${u.streamerHeaderBgSize==='auto'?' selected':''}>자동 (auto)</option>
            </select>
          </div>
          <div>
            <label style="font-size:var(--fs-caption);font-weight:700;color:var(--text3);display:block;margin-bottom:4px">이미지 위치</label>
            <select id="ue-streamer-hbg-pos" style="width:100%;padding:6px 10px;border-radius:7px;border:1px solid var(--border2);font-size:var(--fs-sm)">
              <option value="center center"${(!u.streamerHeaderBgPos||u.streamerHeaderBgPos==='center center')?' selected':''}>중앙</option>
              <option value="top center"${u.streamerHeaderBgPos==='top center'?' selected':''}>상단 중앙</option>
              <option value="bottom center"${u.streamerHeaderBgPos==='bottom center'?' selected':''}>하단 중앙</option>
              <option value="left center"${u.streamerHeaderBgPos==='left center'?' selected':''}>왼쪽 중앙</option>
              <option value="right center"${u.streamerHeaderBgPos==='right center'?' selected':''}>오른쪽 중앙</option>
            </select>
          </div>
        </div>
        <label style="font-size:var(--fs-caption);font-weight:700;color:var(--text3);display:block;margin-bottom:4px">이미지 투명도</label>
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">
          <input type="range" id="ue-streamer-hbg-opacity" min="0" max="100" step="5" value="${Number(u.streamerHeaderBgOpacity||30)||30}" style="flex:1;accent-color:var(--blue)" oninput="document.getElementById('ue-streamer-hbg-opacity-val').textContent=this.value+'%'">
          <span id="ue-streamer-hbg-opacity-val" style="font-size:var(--fs-caption);color:var(--gray-l);min-width:40px;text-align:right;font-weight:700">${Number(u.streamerHeaderBgOpacity||30)||30}%</span>
        </div>
        <label style="font-size:var(--fs-caption);font-weight:700;color:var(--text3);display:block;margin-bottom:4px">그라데이션 스타일</label>
        <select id="ue-streamer-hbg-gradient" style="width:100%;padding:6px 10px;border-radius:7px;border:1px solid var(--border2);font-size:var(--fs-sm);margin-bottom:10px">
          <option value=""${!u.streamerHeaderGradient?' selected':''}>설정탭 기본값</option>
          <option value="solid"${u.streamerHeaderGradient==='solid'?' selected':''}>단색</option>
          <option value="left-to-right"${u.streamerHeaderGradient==='left-to-right'?' selected':''}>왼쪽→오른쪽</option>
          <option value="left-to-both"${u.streamerHeaderGradient==='left-to-both'?' selected':''}>왼쪽→양쪽</option>
          <option value="top-to-bottom"${u.streamerHeaderGradient==='top-to-bottom'?' selected':''}>상단→하단</option>
          <option value="both-to-center"${u.streamerHeaderGradient==='both-to-center'?' selected':''}>양쪽→중앙</option>
        </select>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px">
          <div>
            <label style="font-size:var(--fs-caption);font-weight:700;color:var(--text3);display:block;margin-bottom:4px">효과 길이</label>
            <select id="ue-streamer-hbg-len" style="width:100%;padding:6px 10px;border-radius:7px;border:1px solid var(--border2);font-size:var(--fs-sm)">
              <option value=""${!u.streamerHeaderGradientLen?' selected':''}>설정탭 기본값</option>
              <option value="30"${u.streamerHeaderGradientLen==='30'?' selected':''}>30% (짧게)</option>
              <option value="50"${u.streamerHeaderGradientLen==='50'?' selected':''}>50%</option>
              <option value="70"${u.streamerHeaderGradientLen==='70'?' selected':''}>70% (보통)</option>
              <option value="100"${u.streamerHeaderGradientLen==='100'?' selected':''}>100% (길게)</option>
            </select>
          </div>
          <div>
            <label style="font-size:var(--fs-caption);font-weight:700;color:var(--text3);display:block;margin-bottom:4px">효과 색상</label>
            <input type="color" id="ue-streamer-hbg-color" value="${u.streamerHeaderGradientColor||'#ffffff'}" style="width:100%;height:32px;padding:2px;border-radius:6px;border:1px solid var(--border2);cursor:pointer">
          </div>
        </div>
        <label style="font-size:var(--fs-caption);font-weight:700;color:var(--text3);display:block;margin-bottom:4px">커스텀 텍스트</label>
        <input type="text" id="ue-streamer-text" value="${u.streamerHeaderText||''}" placeholder="헤더에 표시할 텍스트" style="width:100%;margin-bottom:10px;padding:6px 10px;border-radius:7px;border:1px solid var(--border2);font-size:var(--fs-sm);box-sizing:border-box">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px">
          <div>
            <label style="font-size:var(--fs-caption);font-weight:700;color:var(--text3);display:block;margin-bottom:4px">텍스트 크기</label>
            <select id="ue-streamer-text-size" style="width:100%;padding:6px 10px;border-radius:7px;border:1px solid var(--border2);font-size:var(--fs-sm)">
              <option value="10"${(!u.streamerHeaderTextSize||u.streamerHeaderTextSize==='10')?' selected':''}>10px</option>
              <option value="12"${u.streamerHeaderTextSize==='12'?' selected':''}>12px</option>
              <option value="14"${u.streamerHeaderTextSize==='14'?' selected':''}>14px</option>
              <option value="16"${u.streamerHeaderTextSize==='16'?' selected':''}>16px</option>
              <option value="20"${u.streamerHeaderTextSize==='20'?' selected':''}>20px</option>
            </select>
          </div>
          <div>
            <label style="font-size:var(--fs-caption);font-weight:700;color:var(--text3);display:block;margin-bottom:4px">텍스트 색상</label>
            <input type="color" id="ue-streamer-text-color" value="${u.streamerHeaderTextColor||'#ffffff'}" style="width:100%;height:32px;padding:2px;border-radius:6px;border:1px solid var(--border2);cursor:pointer">
          </div>
        </div>
        <label style="font-size:var(--fs-caption);font-weight:700;color:var(--text3);display:block;margin-bottom:4px">텍스트 위치</label>
        <select id="ue-streamer-text-pos" style="width:100%;padding:6px 10px;border-radius:7px;border:1px solid var(--border2);font-size:var(--fs-sm)">
          <option value="left"${(!u.streamerHeaderTextPos||u.streamerHeaderTextPos==='left')?' selected':''}>좌측 (대학 이름 옆)</option>
          <option value="center"${u.streamerHeaderTextPos==='center'?' selected':''}>중앙</option>
          <option value="right"${u.streamerHeaderTextPos==='right'?' selected':''}>우측 (기본)</option>
        </select>
      </div>
      <div style="padding:12px;background:var(--white);border:1px solid var(--border);border-radius:8px;margin-bottom:12px">
        <div style="font-weight:800;font-size:var(--fs-sm);color:var(--text2);margin-bottom:10px">🧩 펨코스타일 배경 이미지/영상</div>
        <label style="font-size:var(--fs-caption);font-weight:700;color:var(--text3);display:block;margin-bottom:4px">배경 링크(URL) <span style="font-size:10px;font-weight:400;color:var(--gray-l)">(펨코스타일 대학 카드 배경)</span></label>
        <input type="text" id="ue-femco-bg-url" value="${(fem.url||'').replace(/\"/g,'&quot;')}" placeholder="https://... (jpg/png/gif/webp/mp4/유튜브/트위치)" style="width:100%;margin-bottom:10px;padding:6px 10px;border-radius:7px;border:1px solid var(--border2);font-size:var(--fs-sm);box-sizing:border-box">
        <label style="font-size:var(--fs-caption);font-weight:700;color:var(--text3);display:block;margin-bottom:4px">투명도</label>
        <div style="display:flex;align-items:center;gap:8px">
          <input type="range" id="ue-femco-bg-alpha" min="0" max="100" step="1" value="${Math.max(0,Math.min(100,parseInt(fem.alpha||30,10)||30))}" style="flex:1;accent-color:var(--blue)"
            oninput="document.getElementById('ue-femco-bg-alpha-val').textContent=this.value+'%'">
          <span id="ue-femco-bg-alpha-val" style="font-size:var(--fs-caption);color:var(--gray-l);min-width:40px;text-align:right;font-weight:700">${Math.max(0,Math.min(100,parseInt(fem.alpha||30,10)||30))}%</span>
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
    try{ if(typeof _updateUnivHeaderEditPreview==='function') _updateUnivHeaderEditPreview(); }catch(e){}
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
  const newHdrPosX=parseInt(document.getElementById('ue-hbg-posx')?.value||'50',10);
  const newHdrPosY=parseInt(document.getElementById('ue-hbg-posy')?.value||'50',10);
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
  if(newHdrBg) u.detailHeaderBgPosX=Math.max(0,Math.min(100,isNaN(newHdrPosX)?50:newHdrPosX)); else delete u.detailHeaderBgPosX;
  if(newHdrBg) u.detailHeaderBgPosY=Math.max(0,Math.min(100,isNaN(newHdrPosY)?50:newHdrPosY)); else delete u.detailHeaderBgPosY;
  // 스트리머탭 대학 헤더 설정(대학별)
  const streamerHdrBg=(document.getElementById('ue-streamer-hbg')?.value||'').trim();
  const streamerHdrSize=(document.getElementById('ue-streamer-hbg-size')?.value||'').trim();
  const streamerHdrPos=(document.getElementById('ue-streamer-hbg-pos')?.value||'').trim();
  const streamerHdrOpacity=parseInt(document.getElementById('ue-streamer-hbg-opacity')?.value||'30',10);
  const streamerHdrGradient=(document.getElementById('ue-streamer-hbg-gradient')?.value||'').trim();
  const streamerHdrGradientLen=(document.getElementById('ue-streamer-hbg-len')?.value||'').trim();
  const streamerHdrGradientColor=(document.getElementById('ue-streamer-hbg-color')?.value||'').trim();
  const streamerText=(document.getElementById('ue-streamer-text')?.value||'').trim();
  const streamerTextSize=(document.getElementById('ue-streamer-text-size')?.value||'').trim();
  const streamerTextColor=(document.getElementById('ue-streamer-text-color')?.value||'').trim();
  const streamerTextPos=(document.getElementById('ue-streamer-text-pos')?.value||'').trim();
  if(streamerHdrBg) u.streamerHeaderBgImg=streamerHdrBg; else delete u.streamerHeaderBgImg;
  if(streamerHdrSize) u.streamerHeaderBgSize=streamerHdrSize; else delete u.streamerHeaderBgSize;
  if(streamerHdrPos) u.streamerHeaderBgPos=streamerHdrPos; else delete u.streamerHeaderBgPos;
  if(streamerHdrBg) u.streamerHeaderBgOpacity=Math.max(0,Math.min(100,streamerHdrOpacity)); else delete u.streamerHeaderBgOpacity;
  if(streamerHdrGradient) u.streamerHeaderGradient=streamerHdrGradient; else delete u.streamerHeaderGradient;
  if(streamerHdrGradientLen) u.streamerHeaderGradientLen=streamerHdrGradientLen; else delete u.streamerHeaderGradientLen;
  if(streamerHdrGradientColor && streamerHdrGradientColor!=='#ffffff') u.streamerHeaderGradientColor=streamerHdrGradientColor; else delete u.streamerHeaderGradientColor;
  if(streamerText) u.streamerHeaderText=streamerText; else delete u.streamerHeaderText;
  if(streamerText) u.streamerHeaderTextSize=streamerTextSize; else delete u.streamerHeaderTextSize;
  if(streamerText) u.streamerHeaderTextColor=streamerTextColor; else delete u.streamerHeaderTextColor;
  if(streamerText) u.streamerHeaderTextPos=streamerTextPos||'right'; else delete u.streamerHeaderTextPos;
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
  {
    const _fn = (typeof buildUnivDetailHTML==='function')
      ? buildUnivDetailHTML
      : (typeof window.buildUnivDetailHTML==='function' ? window.buildUnivDetailHTML : null);
    document.getElementById('univModalBody').innerHTML = _fn
      ? _fn(newName)
      : `<div style="padding:14px 12px;border-radius:var(--r2);border:1px solid rgba(148,163,184,.18);background:linear-gradient(180deg,rgba(255,255,255,.98),rgba(248,250,252,.94));box-shadow:0 12px 24px rgba(15,23,42,.06)">
          <div style="font-size:var(--fs-base);font-weight:950;color:var(--text2);margin-bottom:6px">대학 상세 렌더러 로드 실패</div>
          <div style="font-size:var(--fs-sm);color:var(--text3);line-height:1.6">buildUnivDetailHTML을 찾을 수 없습니다. 새로고침 후 다시 시도해주세요.</div>
        </div>`;
  }
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
  window._updateUnivHeaderEditPreview = _updateUnivHeaderEditPreview;
  window.navToMatch = navToMatch;
}catch(e){}
