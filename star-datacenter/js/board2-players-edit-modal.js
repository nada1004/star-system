/* ══════════════════════════════════════════════════════════════
   보드2 - 프로필 편집 모달 (board2-players.js 에서 분리, 2026-07-30)
   ══════════════════════════════════════════════════════════════ */

function openB2ProfileEditModal(playerName) {
  const player = players.find(p => p.name === playerName);
  if (!player) return;
  const _normMediaUrl = (v)=>{
    const s = String(v == null ? '' : v).trim();
    if(!s) return '';
    const lower = s.toLowerCase();
    if(lower === 'null' || lower === 'undefined' || lower === 'about:blank' || lower === 'javascript:void(0)' || lower === '#') return '';
    return s;
  };
  const _trimMedia = (v)=>_normMediaUrl(v);
  const _media1 = _trimMedia(player.photo);
  const _media2 = _trimMedia(player.secondProfileFile);
  const _media3 = _trimMedia(player.profileFile3);
  const _media4 = _trimMedia(player.profileFile4);
  const _media5 = _trimMedia(player.profileFile5);
  const _media6 = _trimMedia(player.profileFile6);
  const _media7 = _trimMedia(player.profileFile7);
  const _media8 = _trimMedia(player.profileFile8);
  const _media9 = _trimMedia(player.profileFile9);
  const _media10 = _trimMedia(player.profileFile10);
  const _mediaBgm = _trimMedia(player.bgmUrl);
  const _slotOrder = [
    { slot:1, url:_media1 },
    { slot:2, url:_media2 },
    { slot:3, url:_media3 },
    { slot:4, url:_media4 },
    { slot:5, url:_media5 },
    { slot:6, url:_media6 },
    { slot:7, url:_media7 },
    { slot:8, url:_media8 },
    { slot:9, url:_media9 },
    { slot:10, url:_media10 }
  ].filter(item => !!item.url);
  // [FIX] 1~5번까지만 지원하던 하드코딩 테이블 대신, 실제 순환 로직(board2-image-utils.js의
  // _delayKeyLegacy + `photoDelay${from}_${to}` 패턴)과 동일한 규칙을 그대로 사용해
  // 6~10번 슬롯 간 전환에도 올바른 키가 매칭되도록 함.
  const _swapDelayKeyLegacy = {
    '1_2':'photoDelay12', '2_1':'photoDelay21', '2_3':'photoDelay23', '3_1':'photoDelay31',
    '3_4':'photoDelay34', '4_1':'photoDelay41', '4_5':'photoDelay45', '5_1':'photoDelay51'
  };
  const _swapDelayKey = (from, to)=>{
    return _swapDelayKeyLegacy[`${from}_${to}`] || `photoDelay${from}_${to}`;
  };
  const _swapDelayVal = (key)=>{
    const n = parseFloat(player?.[key] ?? 4);
    if(isNaN(n)) return 4;
    return Math.max(0.2, Math.min(60, n));
  };
  const clampDelay = (v)=>{
    const n = parseFloat(v);
    if(isNaN(n)) return 4;
    return Math.max(0.2, Math.min(60, n));
  };
  const _swapDelayInputs = _slotOrder.length < 2
    ? `<div style="font-size:var(--fs-caption);color:var(--gray-l);line-height:1.65">등록된 이미지가 1개라 전환 시간 설정이 필요하지 않습니다.</div>`
    : `<div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px">${_slotOrder.map((item, idx)=>{
        const next = _slotOrder[(idx + 1) % _slotOrder.length];
        const key = _swapDelayKey(item.slot, next.slot);
        if(!key) return '';
        return `<div>
          <div style="font-size:var(--fs-caption);font-weight:800;color:var(--text3);margin-bottom:6px">${item.slot} → ${next.slot}</div>
          <input type="number" data-b2-delay-key="${key}" min="0.2" max="60" step="0.1" value="${_swapDelayVal(key)}" style="width:100%;padding:8px 12px;border:1px solid var(--border2);border-radius:8px;font-size:var(--fs-base)">
        </div>`;
      }).join('')}</div>`;

  const modal = document.createElement('div');
  modal.id = 'b2-profile-edit-modal';
  modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:var(--z-modal-5)';
  
  modal.innerHTML = `
    <div style="background:var(--white);border-radius:var(--r2);padding:24px;max-width:500px;width:90%;max-height:80vh;overflow-y:auto;box-shadow:0 10px 40px rgba(0,0,0,0.3)">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px">
        <h3 style="margin:0;font-size:var(--fs-lg);font-weight:800;color:var(--text1)">✏️ 프로필 수정</h3>
        <button onclick="document.getElementById('b2-profile-edit-modal').remove()" style="background:none;border:none;font-size:20px;cursor:pointer;color:var(--gray-l)">✕</button>
      </div>
      <div style="margin-bottom:16px">
        <label style="font-size:var(--fs-base);font-weight:700;color:var(--text2);display:block;margin-bottom:6px">선수 이름</label>
        <div style="font-size:14px;color:var(--text3);padding:8px 12px;background:var(--surface);border-radius:8px">${player.name}</div>
      </div>
      <div style="margin-bottom:16px">
        <label style="font-size:var(--fs-base);font-weight:700;color:var(--text2);display:block;margin-bottom:6px">🎵 주제곡 BGM <span style="font-size:10px;font-weight:400;color:var(--gray-l)">(유튜브 링크 — 프로필탭에서 이 선수를 선택하면 재생됩니다)</span></label>
        <input type="text" id="b2-ed-bgm-url" value="${_mediaBgm}" placeholder="https://www.youtube.com/watch?v=... 또는 https://youtu.be/..." style="width:100%;padding:8px 12px;border:1px solid var(--border2);border-radius:8px;font-size:var(--fs-base)">
        <div style="font-size:10px;color:var(--gray-l);margin-top:4px">다른 선수를 선택하면 자동으로 정지되고 새 곡으로 바뀝니다. 비워두면 BGM 없이 조용히 표시됩니다.</div>
      </div>
      <div style="margin-bottom:16px">
        <label style="font-size:var(--fs-base);font-weight:700;color:var(--text2);display:block;margin-bottom:6px">프로필 이미지 1 (PC/기본) <span style="font-size:10px;font-weight:400;color:var(--gray-l)">(선택 즉시 표시)</span></label>
        <div style="display:flex;gap:8px;align-items:center">
          <input type="text" id="b2-ed-photo" value="${_media1}" placeholder="https://... 이미지 URL 입력" style="flex:1;padding:8px 12px;border:1px solid var(--border2);border-radius:8px;font-size:var(--fs-base)">
          <span id="b2-ed-photo-preview-wrap" style="position:relative;width:40px;height:40px;border-radius:var(--su_profile_radius,50%);overflow:hidden;flex-shrink:0;background:#e2e8f0;border:2px solid var(--border);display:${_media1&&!_media1.startsWith('data:')?'inline-block':'none'}">
            <img id="b2-ed-photo-preview" src="${_media1&&!_media1.startsWith('data:')?toHttpsUrl(_media1):''}" style="width:40px;height:40px;object-fit:cover;display:block" onerror="this.style.display='none'">
          </span>
        </div>
        <div id="b2-ed-photo-warn" style="font-size:10px;color:${_media1&&_media1.startsWith('data:')?'#dc2626':'var(--gray-l)'};margin-top:4px">${_media1&&_media1.startsWith('data:')?'❌ base64 이미지 직접 입력 불가 — imgur.com 등에 업로드 후 URL 사용':'이미지 URL을 붙여넣으면 현황판 선수 카드에 프로필 사진이 표시됩니다.'}</div>
      </div>
      <div style="margin-bottom:16px">
        <label style="font-size:var(--fs-base);font-weight:700;color:var(--text2);display:block;margin-bottom:6px">프로필 이미지 2 (모바일/교체용) <span style="font-size:10px;font-weight:400;color:var(--gray-l)">(설정한 시간 후 자동 교체)</span></label>
        <div style="display:flex;gap:8px;align-items:center">
          <input type="text" id="b2-ed-second-profile" value="${_media2}" placeholder="https://... 이미지 URL 입력" style="flex:1;padding:8px 12px;border:1px solid var(--border2);border-radius:8px;font-size:var(--fs-base)">
          <span id="b2-ed-photo2-preview-wrap" style="position:relative;width:40px;height:40px;border-radius:12px;overflow:hidden;flex-shrink:0;background:#e2e8f0;border:2px solid var(--border);display:${_media2&&!_media2.startsWith('data:')?'inline-flex':'none'};align-items:center;justify-content:center">
            <img id="b2-ed-photo2-preview" src="${_media2&&!_media2.startsWith('data:')?toHttpsUrl(_media2).replace(/\"/g,'&quot;'):''}" style="width:40px;height:40px;object-fit:cover;display:block" onerror="this.style.display='none'">
            <video id="b2-ed-photo2-preview-vid" src="" muted playsinline loop style="width:40px;height:40px;object-fit:cover;display:none"></video>
          </span>
        </div>
        <div style="font-size:10px;color:var(--gray-l);margin-top:4px">스트리머 선택 후 설정한 시간 뒤 이 이미지로 자동 전환됩니다.</div>
      </div>
      <div style="margin-bottom:16px">
        <label style="font-size:var(--fs-base);font-weight:700;color:var(--text2);display:block;margin-bottom:6px">프로필 이미지 3 (순환용)</label>
        <div style="display:flex;gap:8px;align-items:center">
          <input type="text" id="b2-ed-photo3" value="${_media3}" placeholder="https://... (gif/mp4 가능)" style="flex:1;padding:8px 12px;border:1px solid var(--border2);border-radius:8px;font-size:var(--fs-base)">
          <span id="b2-ed-photo3-preview-wrap" style="position:relative;width:40px;height:40px;border-radius:12px;overflow:hidden;flex-shrink:0;background:#e2e8f0;border:2px solid var(--border);display:${_media3&&!_media3.startsWith('data:')?'inline-flex':'none'};align-items:center;justify-content:center">
            <img id="b2-ed-photo3-preview" src="${_media3&&!_media3.startsWith('data:')?toHttpsUrl(_media3).replace(/\"/g,'&quot;'):''}" style="width:40px;height:40px;object-fit:cover;display:block" onerror="this.style.display='none'">
            <video id="b2-ed-photo3-preview-vid" src="" muted playsinline loop style="width:40px;height:40px;object-fit:cover;display:none"></video>
          </span>
        </div>
      </div>
      <div style="margin-bottom:16px">
        <label style="font-size:var(--fs-base);font-weight:700;color:var(--text2);display:block;margin-bottom:6px">프로필 이미지 4 (순환용)</label>
        <div style="display:flex;gap:8px;align-items:center">
          <input type="text" id="b2-ed-photo4" value="${_media4}" placeholder="https://... (gif/mp4 가능)" style="flex:1;padding:8px 12px;border:1px solid var(--border2);border-radius:8px;font-size:var(--fs-base)">
          <span id="b2-ed-photo4-preview-wrap" style="position:relative;width:40px;height:40px;border-radius:12px;overflow:hidden;flex-shrink:0;background:#e2e8f0;border:2px solid var(--border);display:${_media4&&!_media4.startsWith('data:')?'inline-flex':'none'};align-items:center;justify-content:center">
            <img id="b2-ed-photo4-preview" src="${_media4&&!_media4.startsWith('data:')?toHttpsUrl(_media4).replace(/\"/g,'&quot;'):''}" style="width:40px;height:40px;object-fit:cover;display:block" onerror="this.style.display='none'">
            <video id="b2-ed-photo4-preview-vid" src="" muted playsinline loop style="width:40px;height:40px;object-fit:cover;display:none"></video>
          </span>
        </div>
      </div>
      <div style="margin-bottom:16px">
        <label style="font-size:var(--fs-base);font-weight:700;color:var(--text2);display:block;margin-bottom:6px">프로필 이미지 5 (순환용)</label>
        <div style="display:flex;gap:8px;align-items:center">
          <input type="text" id="b2-ed-photo5" value="${_media5}" placeholder="https://... (gif/mp4 가능)" style="flex:1;padding:8px 12px;border:1px solid var(--border2);border-radius:8px;font-size:var(--fs-base)">
          <span id="b2-ed-photo5-preview-wrap" style="position:relative;width:40px;height:40px;border-radius:12px;overflow:hidden;flex-shrink:0;background:#e2e8f0;border:2px solid var(--border);display:${_media5&&!_media5.startsWith('data:')?'inline-flex':'none'};align-items:center;justify-content:center">
            <img id="b2-ed-photo5-preview" src="${_media5&&!_media5.startsWith('data:')?toHttpsUrl(_media5).replace(/\"/g,'&quot;'):''}" style="width:40px;height:40px;object-fit:cover;display:block" onerror="this.style.display='none'">
            <video id="b2-ed-photo5-preview-vid" src="" muted playsinline loop style="width:40px;height:40px;object-fit:cover;display:none"></video>
          </span>
        </div>
      </div>
      ${[6,7,8,9,10].map(_n=>{
        const _v = { 6:_media6, 7:_media7, 8:_media8, 9:_media9, 10:_media10 }[_n];
        return `<div style="margin-bottom:16px">
        <label style="font-size:var(--fs-base);font-weight:700;color:var(--text2);display:block;margin-bottom:6px">프로필 이미지 ${_n} (순환용)</label>
        <div style="display:flex;gap:8px;align-items:center">
          <input type="text" id="b2-ed-photo${_n}" value="${_v}" placeholder="https://... (gif/mp4 가능)" style="flex:1;padding:8px 12px;border:1px solid var(--border2);border-radius:8px;font-size:var(--fs-base)">
          <span id="b2-ed-photo${_n}-preview-wrap" style="position:relative;width:40px;height:40px;border-radius:12px;overflow:hidden;flex-shrink:0;background:#e2e8f0;border:2px solid var(--border);display:${_v&&!_v.startsWith('data:')?'inline-flex':'none'};align-items:center;justify-content:center">
            <img id="b2-ed-photo${_n}-preview" src="${_v&&!_v.startsWith('data:')?toHttpsUrl(_v).replace(/\"/g,'&quot;'):''}" style="width:40px;height:40px;object-fit:cover;display:block" onerror="this.style.display='none'">
            <video id="b2-ed-photo${_n}-preview-vid" src="" muted playsinline loop style="width:40px;height:40px;object-fit:cover;display:none"></video>
          </span>
        </div>
      </div>`;
      }).join('')}
      <div style="font-size:10px;color:var(--gray-l);margin:-8px 0 16px">이미지별 탭에서 2→3→...→10(→1) 순서로, 등록된 이미지만 순환합니다.</div>
      <div style="margin-top:10px;margin-bottom:16px;padding:12px;background:rgba(37,99,235,.06);border:1px solid rgba(37,99,235,.18);border-radius:var(--r)">
        <div style="font-size:var(--fs-base);font-weight:800;color:var(--text2);margin-bottom:10px">전환 시간(초)</div>
        ${_swapDelayInputs}
        <div style="font-size:10px;color:var(--gray-l);margin-top:10px">※ 실제 존재하는 이미지 순서만 순환합니다. mp4는 끝까지 재생 후 다음 이미지로 이동합니다.</div>
      </div>
      <div style="display:flex;gap:8px;margin-top:20px">
        <button onclick="document.getElementById('b2-profile-edit-modal').remove()" style="flex:1;padding:10px 16px;background:var(--surface);border:1px solid var(--border2);border-radius:8px;color:var(--text2);font-size:var(--fs-base);font-weight:600;cursor:pointer">취소</button>
        <button onclick="saveB2Profile('${player.name.replace(/'/g, "\\'")}')" style="flex:1;padding:10px 16px;background:var(--blue);border:1px solid var(--blue);border-radius:8px;color:#fff;font-size:var(--fs-base);font-weight:600;cursor:pointer">저장</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  const _b2IsVideoUrl = (u)=>{
    const s = String(u||'').trim().toLowerCase().split('#')[0].split('?')[0];
    return s.endsWith('.mp4') || s.endsWith('.webm') || s.endsWith('.ogg') || s.endsWith('.mov') || s.endsWith('.m4v');
  };
  const _b2SyncSmallPreview = (inputId, wrapId, imgId, vidId)=>{
    try{
      const inp = document.getElementById(inputId);
      const wrap = document.getElementById(wrapId);
      const img = document.getElementById(imgId);
      const vid = document.getElementById(vidId);
      if(!wrap || !img || !vid) return;
      const v = String(inp?.value || '').trim();
      if(!v || v.startsWith('data:')){
        wrap.style.display = 'none';
        img.style.display = 'none';
        vid.style.display = 'none';
        img.removeAttribute('src');
        vid.removeAttribute('src');
        try{ vid.pause(); }catch(e){}
        return;
      }
      const src = toHttpsUrl(v);
      wrap.style.display = 'inline-flex';
      if(_b2IsVideoUrl(src)){
        img.style.display = 'none';
        vid.style.display = 'block';
        vid.src = src;
        try{ vid.currentTime = 0; }catch(e){}
        try{ vid.play && vid.play(); }catch(e){}
      }else{
        vid.style.display = 'none';
        try{ vid.pause(); }catch(e){}
        vid.removeAttribute('src');
        img.style.display = 'block';
        img.src = src;
      }
    }catch(e){}
  };
  
  // 첫 번째 프로필 URL 입력 시 미리보기
  const photoInput = document.getElementById('b2-ed-photo');
  if (photoInput) {
    photoInput.addEventListener('input', function() {
      const v = this.value.trim();
      const img = document.getElementById('b2-ed-photo-preview');
      const warn = document.getElementById('b2-ed-photo-warn');
      const wrap = document.getElementById('b2-ed-photo-preview-wrap');
      
      if (v && v.startsWith('data:')) {
        this.style.borderColor = '#dc2626';
        if (warn) {
          warn.style.color = '#dc2626';
          warn.textContent = '❌ base64 이미지 직접 입력 불가 — imgur.com 등에 업로드 후 URL 사용';
        }
      } else {
        this.style.borderColor = '';
        if (warn) {
          warn.textContent = '이미지 URL을 붙여넣으면 현황판 선수 카드에 프로필 사진이 표시됩니다.';
          warn.style.color = 'var(--gray-l)';
        }
      }
      
      if (v && !v.startsWith('data:')) {
        img.src = toHttpsUrl(v);
        img.style.display = 'block';
        if (wrap) wrap.style.display = 'inline-block';
      } else {
        if (wrap) wrap.style.display = 'none';
      }
    });
  }
  ['b2-ed-second-profile','b2-ed-photo3','b2-ed-photo4','b2-ed-photo5','b2-ed-photo6','b2-ed-photo7','b2-ed-photo8','b2-ed-photo9','b2-ed-photo10'].forEach((id, idx)=>{
    const el = document.getElementById(id);
    if(!el) return;
    const map = [
      ['b2-ed-photo2-preview-wrap','b2-ed-photo2-preview','b2-ed-photo2-preview-vid'],
      ['b2-ed-photo3-preview-wrap','b2-ed-photo3-preview','b2-ed-photo3-preview-vid'],
      ['b2-ed-photo4-preview-wrap','b2-ed-photo4-preview','b2-ed-photo4-preview-vid'],
      ['b2-ed-photo5-preview-wrap','b2-ed-photo5-preview','b2-ed-photo5-preview-vid'],
      ['b2-ed-photo6-preview-wrap','b2-ed-photo6-preview','b2-ed-photo6-preview-vid'],
      ['b2-ed-photo7-preview-wrap','b2-ed-photo7-preview','b2-ed-photo7-preview-vid'],
      ['b2-ed-photo8-preview-wrap','b2-ed-photo8-preview','b2-ed-photo8-preview-vid'],
      ['b2-ed-photo9-preview-wrap','b2-ed-photo9-preview','b2-ed-photo9-preview-vid'],
      ['b2-ed-photo10-preview-wrap','b2-ed-photo10-preview','b2-ed-photo10-preview-vid']
    ][idx] || null;
    if(!map) return;
    el.addEventListener('input', ()=>_b2SyncSmallPreview(id, map[0], map[1], map[2]));
    _b2SyncSmallPreview(id, map[0], map[1], map[2]);
  });
}

