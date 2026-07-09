function addSeason(){
  if(!isLoggedIn) return;
  const name=(document.getElementById('cfg-season-name')?.value||'').trim();
  const from=(document.getElementById('cfg-season-from')?.value||'').trim();
  const to=(document.getElementById('cfg-season-to')?.value||'').trim();
  if(!name||!from||!to){ alert('시즌 이름/시작일/종료일을 입력하세요.'); return; }
  seasons = Array.isArray(seasons) ? seasons : [];
  seasons.push({name, from, to});
  // 정렬
  try{ seasons.sort((a,b)=>(a.from||'').localeCompare(b.from||'')); }catch(e){}
  save(); render();
  try{ renderSeasonList(); }catch(e){}
}
function editSeason(i){
  if(!isLoggedIn) return;
  const s = (seasons||[])[i]; if(!s) return;
  const name = prompt('시즌 이름', s.name||''); if(name===null) return;
  const from = prompt('시작일(YYYY-MM-DD)', s.from||''); if(from===null) return;
  const to   = prompt('종료일(YYYY-MM-DD)', s.to||''); if(to===null) return;
  seasons[i] = {name:String(name).trim(), from:String(from).trim(), to:String(to).trim()};
  try{ seasons.sort((a,b)=>(a.from||'').localeCompare(b.from||'')); }catch(e){}
  save(); render();
  try{ renderSeasonList(); }catch(e){}
}
function deleteSeason(i){
  if(!isLoggedIn) return;
  const s=(seasons||[])[i]; if(!s) return;
  if(!confirm(`시즌 '${s.name}'을(를) 삭제할까요?`)) return;
  seasons.splice(i,1);
  save(); render();
  try{ renderSeasonList(); }catch(e){}
}


/* ══════════════════════════════════════
   경기 일괄 수정 함수들
══════════════════════════════════════ */


// ttFixOrphanRecords: IIFE 블록 제거로 전역 정의로 이동
function ttFixOrphanRecords(compName,includeWrong){
  const orphans=ttM.filter(m=>!m.compName||m.compName==='');
  const wrongComp=includeWrong?ttM.filter(m=>m.compName&&m.compName!==compName):[];
  const targets=[...orphans,...wrongComp];
  if(!targets.length){alert('연결할 기록이 없습니다.');return;}
  const wrongNames=[...new Set(wrongComp.map(m=>m.compName))].join(', ');
  const msg=`기록 ${targets.length}건을 "${compName}"에 연결합니다.${wrongNames?`\n(다른 대회명: ${wrongNames})`:''}\n계속할까요?`;
  if(!confirm(msg))return;
  targets.forEach(m=>{m.compName=compName;if(!m.n)m.n=compName;});
  save();render();
}


function bulkSetBoardBgImg(){
  const url=(document.getElementById('bulk-bg-img-url')?.value||'').trim();
  const pos=document.getElementById('bulk-bg-img-pos')?.value||'center center';
  const size=document.getElementById('bulk-bg-img-size')?.value||'cover';
  if(!url){showToast('이미지 URL을 입력해주세요.');return;}
  if(!confirm('모든 대학에 동일한 배경 이미지를 적용하시겠습니까?'))return;
  univCfg.forEach(u=>{
    u.bgImg=url;
    u.bgImgPos=pos;
    u.bgImgSize=size;
  });
  save();render();
  showToast('전체 대학에 배경 이미지가 적용되었습니다.');
  // 리스트 갱신
  const bgListEl=document.getElementById('cfg-board-bg-list');
  if(bgListEl){
    bgListEl.innerHTML=univCfg.map((u,i)=>`<div style="border:1px solid var(--border);border-radius:8px;padding:10px 12px;margin-bottom:8px;background:var(--white)">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
        <div class="cdot" style="background:${u.color}"></div>
        <span style="flex:1;font-weight:700;font-size:13px">${u.name}</span>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:8px">
        <button class="btn btn-xs btn-w" onclick="promptBoardBgImgUrl('${u.name.replace(/'/g,"\\'")}')">URL 설정</button>
        ${u.bgImg?`<button class="btn btn-xs btn-r" onclick="removeBoardBgImg('${u.name.replace(/'/g,"\\'")}')">삭제</button>`:''}
      </div>
      ${u.bgImg?`<div style="margin-top:8px">
        <div style="font-size:11px;font-weight:600;color:var(--text2);margin-bottom:6px">위치</div>
        <select onchange="setBoardBgImgPos('${u.name.replace(/'/g,"\\'")}',this.value)" style="padding:4px 8px;border:1px solid var(--border2);border-radius:6px;font-size:12px">
          <option value="top left" ${u.bgImgPos==='top left'?' selected':''}>좌상단</option>
          <option value="top center" ${u.bgImgPos==='top center'?' selected':''}>중상단</option>
          <option value="top right" ${u.bgImgPos==='top right'?' selected':''}>우상단</option>
          <option value="center left" ${u.bgImgPos==='center left'?' selected':''}>좌중앙</option>
          <option value="center center" ${u.bgImgPos==='center center'?' selected':''}>중앙</option>
          <option value="center right" ${u.bgImgPos==='center right'?' selected':''}>우중앙</option>
          <option value="bottom left" ${u.bgImgPos==='bottom left'?' selected':''}>좌하단</option>
          <option value="bottom center" ${u.bgImgPos==='bottom center'?' selected':''}>중하단</option>
          <option value="bottom right" ${u.bgImgPos==='bottom right'?' selected':''}>우하단</option>
        </select>
        <div style="font-size:11px;font-weight:600;color:var(--text2);margin-bottom:6px;margin-top:8px">크기</div>
        <select onchange="setBoardBgImgSize('${u.name.replace(/'/g,"\\'")}',this.value)" style="padding:4px 8px;border:1px solid var(--border2);border-radius:6px;font-size:12px">
          <option value="cover" ${u.bgImgSize==='cover'?' selected':''}>채우기 (cover)</option>
          <option value="contain" ${u.bgImgSize==='contain'?' selected':''}>맞춤 (contain)</option>
          <option value="fill" ${u.bgImgSize==='fill'?' selected':''}>늘리기 (fill)</option>
        </select>
      </div>`:''}
    </div>`).join('');
  }
}
function bulkClearBoardBgImg(){
  if(!confirm('모든 대학의 배경 이미지를 삭제하시겠습니까?'))return;
  univCfg.forEach(u=>{
    delete u.bgImg;
    delete u.bgImgPos;
    delete u.bgImgSize;
  });
  save();render();
  showToast('전체 대학의 배경 이미지가 삭제되었습니다.');
  // 리스트 갱신
  const bgListEl=document.getElementById('cfg-board-bg-list');
  if(bgListEl){
    bgListEl.innerHTML=univCfg.map((u,i)=>`<div style="border:1px solid var(--border);border-radius:8px;padding:10px 12px;margin-bottom:8px;background:var(--white)">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
        <div class="cdot" style="background:${u.color}"></div>
        <span style="flex:1;font-weight:700;font-size:13px">${u.name}</span>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:8px">
        <button class="btn btn-xs btn-w" onclick="promptBoardBgImgUrl('${u.name.replace(/'/g,"\\'")}')">URL 설정</button>
        ${u.bgImg?`<button class="btn btn-xs btn-r" onclick="removeBoardBgImg('${u.name.replace(/'/g,"\\'")}')">삭제</button>`:''}
      </div>
      ${u.bgImg?`<div style="margin-top:8px">
        <div style="font-size:11px;font-weight:600;color:var(--text2);margin-bottom:6px">위치</div>
        <select onchange="setBoardBgImgPos('${u.name.replace(/'/g,"\\'")}',this.value)" style="padding:4px 8px;border:1px solid var(--border2);border-radius:6px;font-size:12px">
          <option value="top left" ${u.bgImgPos==='top left'?' selected':''}>좌상단</option>
          <option value="top center" ${u.bgImgPos==='top center'?' selected':''}>중상단</option>
          <option value="top right" ${u.bgImgPos==='top right'?' selected':''}>우상단</option>
          <option value="center left" ${u.bgImgPos==='center left'?' selected':''}>좌중앙</option>
          <option value="center center" ${u.bgImgPos==='center center'?' selected':''}>중앙</option>
          <option value="center right" ${u.bgImgPos==='center right'?' selected':''}>우중앙</option>
          <option value="bottom left" ${u.bgImgPos==='bottom left'?' selected':''}>좌하단</option>
          <option value="bottom center" ${u.bgImgPos==='bottom center'?' selected':''}>중하단</option>
          <option value="bottom right" ${u.bgImgPos==='bottom right'?' selected':''}>우하단</option>
        </select>
        <div style="font-size:11px;font-weight:600;color:var(--text2);margin-bottom:6px;margin-top:8px">크기</div>
        <select onchange="setBoardBgImgSize('${u.name.replace(/'/g,"\\'")}',this.value)" style="padding:4px 8px;border:1px solid var(--border2);border-radius:6px;font-size:12px">
          <option value="cover" ${u.bgImgSize==='cover'?' selected':''}>채우기 (cover)</option>
          <option value="contain" ${u.bgImgSize==='contain'?' selected':''}>맞춤 (contain)</option>
          <option value="fill" ${u.bgImgSize==='fill'?' selected':''}>늘리기 (fill)</option>
        </select>
      </div>`:''}
    </div>`).join('');
  }
}

/* ══════════════════════════════════════
   선수 CRUD
══════════════════════════════════════ */
// 등록 타입 변경 시 폼 필드 동적 표시/숨김

window.openEP=function(name){
  editName=name;const p=players.find(x=>x.name===name);
  if(!p) return;
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
    <label>🏠 방송국 홈 URL <span style="font-size:10px;font-weight:400;color:var(--gray-l)">(홈 아이콘 클릭 시 이동)</span></label>
    <div style="display:flex;gap:8px;align-items:center">
      <input type="text" id="ed-channel" value="${p.channelUrl||''}" placeholder="https://chzzk.naver.com/... 또는 https://twitch.tv/..." style="flex:1">
      ${p.channelUrl?`<a href="${p.channelUrl}" target="_blank" style="font-size:18px;text-decoration:none" title="방송국 바로가기">🏠</a>`:''}
    </div>
    <div style="font-size:10px;color:var(--gray-l);margin-top:-6px">치지직/트위치/유튜브 등 방송국 주소. 스트리머 상세에서 홈 아이콘으로 이동됩니다.</div>
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
    <!-- (요청사항) 보라크루 기능 삭제: 크루 소속 항목 제거 -->
    <div style="margin-top:14px;padding:14px;background:#fffbeb;border:1px solid #fde68a;border-radius:8px;">
      <div style="font-weight:700;font-size:12px;color:#b45309;margin-bottom:8px">📝 선수 메모</div>
      <textarea id="ed-memo" style="width:100%;min-height:70px;font-size:12px;border:1px solid #fde68a;border-radius:6px;padding:8px;background:#fff;resize:vertical;font-family:'Noto Sans KR',sans-serif;line-height:1.6;box-sizing:border-box;" placeholder="선수에 대한 메모를 입력하세요...">${p.memo||''}</textarea>
    </div>`;
  om('emModal');
}




// settings.js와 전역 변수명이 충돌 방지
let _ttUnivDragSrc=-1;
// _univDragStart/Over/Drop/End → settings-crud.js 단일 소스 (WARNING fix)
// tier-tour.js는 _ttUnivDragSrc 로컬 변수를 사용했으나 settings-crud.js의 window._univDragSrc로 통합

// settings.js와 전역 변수 충돌 방지
let _ttDissolveIdx = -1;

// _renderCfgSiList / _cfgRefreshSiRow → settings-map-status.js 단일 소스로 통합
// (WARNING fix: tier-tour.js에서 중복 정의 제거)

// addAdminAccount / clearAllAdmins → settings-crud-univ.js 단일 소스로 통합
// (WARNING fix: 3개 파일에 동일 코드 중복 정의되어 있던 것 정리)

function openUnifiedSyncSettings(){
  try{
    if(typeof window.openCfgDataSync === 'function') window.openCfgDataSync();
    else if(typeof window._goCfgSection === 'function') window._goCfgSection('💾 데이터');
    else if(typeof sw==='function') sw('cfg');
  }catch(e){}
  setTimeout(()=>{
    try{
      if(typeof cfgApplyCat==='function') cfgApplyCat('💾 데이터');
    }catch(e){}
    try{
      if(typeof checkFbSyncStatus==='function') checkFbSyncStatus();
    }catch(e){}
    try{
      const sec=document.getElementById('cfg-sec-firebase');
      if(sec){
        sec.open = true;
        sec.scrollIntoView({behavior:'smooth', block:'start'});
      }
    }catch(e){}
  }, 80);
}









// (주의) 통계 탭 구현은 stats.js에서 담당한다.
// 과거 임시 코드가 tier-tour.js에도 포함돼 있었는데, settings.js / stats.js와 전역 변수 충돌로
// tier-tour.js 자체가 로드 실패하는 문제가 생겨 제거함.

// 개인 순위 버튼 우클릭 메뉴
function showRankContext(e){
  e.preventDefault();
  e.stopPropagation();
  
  const existingMenu = document.getElementById('rank-context-menu');
  if(existingMenu) existingMenu.remove();
  
  if(!window._rankSort)window._rankSort={};
  const sk=window._rankSort['tt']||'w';
  
  const menu = document.createElement('div');
  menu.id = 'rank-context-menu';
  menu.style.cssText = `
    position: fixed;
    left: ${e.clientX}px;
    top: ${e.clientY}px;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 99999;
    min-width: 160px;
    padding: 4px 0;
  `;
  
  // [UX] 현재 정렬 항목 강조 표시
  const _skItems=[
    {key:'w',icon:'🏆',label:'승순'},
    {key:'rate',icon:'📊',label:'승률순'},
    {key:'l',icon:'📉',label:'패순'},
  ];
  menu.innerHTML = _skItems.map(item=>{
    const isCur=sk===item.key;
    return `<div style="padding:8px 16px;cursor:pointer;font-size:13px;font-weight:${isCur?'800':'600'};color:${isCur?'#7c3aed':'#374151'};background:${isCur?'#f5f3ff':'white'};display:flex;align-items:center;gap:8px;"
         onmouseover="this.style.background='${isCur?'#ede9fe':'#f9fafb'}'" 
         onmouseout="this.style.background='${isCur?'#f5f3ff':'white'}'"
         onclick="window._rankSort['tt']='${item.key}';render();document.getElementById('rank-context-menu').remove();">
      <span style="font-size:14px">${item.icon}</span>
      <span>${item.label}</span>
      ${isCur?'<span style="margin-left:auto;font-size:10px;color:#7c3aed">✓ 현재</span>':''}
    </div>`;
  }).join('');
  
  document.body.appendChild(menu);
  
  const closeMenu = (ev) => {
    if(!menu.contains(ev.target)){
      menu.remove();
      document.removeEventListener('click', closeMenu);
    }
  };
  setTimeout(() => document.addEventListener('click', closeMenu), 10);
}

// 토너먼트 버튼 우클릭 메뉴
function showTournamentContext(e){
  e.preventDefault();
  e.stopPropagation();
  
  const existingMenu = document.getElementById('tournament-context-menu');
  if(existingMenu) existingMenu.remove();
  
  const menu = document.createElement('div');
  menu.id = 'tournament-context-menu';
  menu.style.cssText = `
    position: fixed;
    left: ${e.clientX}px;
    top: ${e.clientY}px;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 99999;
    min-width: 160px;
    padding: 4px 0;
  `;
  
  menu.innerHTML = `
    <div style="padding: 8px 16px; cursor: pointer; font-size: 13px; font-weight: 600; color: #374151; display: flex; align-items: center; gap: 8px;"
         onmouseover="this.style.background='#f9fafb'" 
         onmouseout="this.style.background='white'"
         onclick="goToTournamentRecords()">
      <span style="font-size: 14px">🏆</span>
      <span>토너먼트 기록</span>
    </div>
  `;
  
  document.body.appendChild(menu);
  
  const closeMenu = (ev) => {
    if(!menu.contains(ev.target)){
      menu.remove();
      document.removeEventListener('click', closeMenu);
    }
  };
  setTimeout(() => document.addEventListener('click', closeMenu), 10);
}

// 대전기록 탭의 티어대회 토너먼트 서브탭으로 이동
function goToTournamentRecords(){
  const menu = document.getElementById('tournament-context-menu');
  if(menu) menu.remove();
  
  curTab = 'hist';
  histSub = 'tiertour-bkt';
  openDetails = {};
  if(!window.histPage) window.histPage = {};
  window.histPage['tiertour-bkt'] = 0;
  render();
}
