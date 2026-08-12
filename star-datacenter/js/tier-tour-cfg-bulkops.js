// tier-tour-cfg.js에서 분리됨 (대회티어탭 - 일괄수정/삭제, 붙여넣기모달, 시딩배정)
/* ══════════════════════════════════════
   (버그픽스) 설정탭 버튼 누락 함수들
   - settings.js / tier-tour.js UI에서 호출하지만 정의가 없던 함수들을 추가
   - 안전한 범위에서만 일괄 수정/삭제 수행
══════════════════════════════════════ */
function _bulkArrMapAll(){
  // 존재하는 배열만 포함
  const m = { mini:miniM, univm:univM, ck:ckM, pro:proM, tt:ttM, ind: (typeof indM!=='undefined'?indM:[]), gj:(typeof gjM!=='undefined'?gjM:[]), comp:comps };
  return m;
}

// 티어대회(토너먼트 탭)에서 경기 결과 붙여넣기(자동인식) → "토너먼트 기록"으로 저장
// - 대진표 자동 생성/자동 반영은 하지 않음(사용자가 슬롯/승자 수동 입력)
function openTierBktPasteModal(tnId){
  if(!isLoggedIn) return alert('로그인이 필요합니다.');
  const tn=(tourneys||[]).find(t=>t && t.id===tnId) || null;
  if(tn && tn.name) _ttCurComp = tn.name;
  try{ window._pasteFromTierBkt = true; }catch(e){}
  try{ window._pasteFromHistExt = false; }catch(e){}
  try{
    if(typeof openTTPasteModal==='function') openTTPasteModal();
  }catch(e){}
  // 대회명 자동 채우기
  setTimeout(()=>{
    try{
      const inp=document.getElementById('paste-comp-name');
      if(inp && tn && tn.name) inp.value = tn.name;
    }catch(e){}
  }, 40);
}

// (추가) 설정탭 전용: "스트리머별 상태 아이콘 지정"만 보여주는 목록
function _renderCfgSiAssignList(){
  const el=document.getElementById('cfg-si-assign-list');
  if(!el) return;
  if(!players.length){
    el.innerHTML='<div style="padding:20px;text-align:center;color:var(--gray-l)">등록된 선수 없음</div>';
    return;
  }
  const q = String(window._cfgSiAssignQ || '').trim().toLowerCase();
  const iconOptCache = Object.entries(STATUS_ICON_DEFS);
  const match = (p)=>{
    if(!q) return true;
    const hay = `${p.name||''} ${(p.univ||'')} ${(p.tier||'')} ${(p.memo||'')}`.toLowerCase();
    return hay.includes(q);
  };
  const list = [...players].filter(match).sort((a,b)=>a.name.localeCompare(b.name,'ko'));
  el.innerHTML = list.map(p=>{
    const cur = playerStatusIcons[p.name] || '';
    const pN = p.name.replace(/\\/g,'\\\\').replace(/'/g,"\\'");
    const encN=encodeURIComponent(p.name);
    const opts = iconOptCache.map(([id,d])=>`<option value="${id}"${(!cur&&id==='none')||(cur&&(cur===id||cur===d.emoji)&&id!=='none')?' selected':''}>${!_siIsImg(d.emoji)&&d.emoji?d.emoji+' ':''}${d.label}</option>`).join('');
    const clrBtn = cur ? `<button class="btn btn-w btn-xs" style="border-color:var(--border2);color:#dc2626" onclick="setStatusIcon('${pN}','none');_cfgRefreshSiAssignRow('${pN}')">×</button>` : '';
    return `<div style="border-bottom:1px solid var(--border);padding:8px 10px">
      <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
        <span style="flex-shrink:0">${getPlayerPhotoHTML(p.name,'30px')}</span>
        <span style="font-weight:800;flex:1;min-width:140px">${p.name}<span style="font-size:10px;color:var(--gray-l);margin-left:6px">${p.univ||''}·${p.tier||''}</span></span>
        <span id="cfg-si-assign-prev-${encN}" style="min-width:26px;text-align:center;display:inline-flex;align-items:center;justify-content:center">${cur?(_siIsImg(cur)?_siRender(cur,'22px'):cur):''}</span>
        <select onchange="setStatusIcon('${pN}',this.value);_cfgRefreshSiAssignRow('${pN}')" style="font-size:var(--fs-sm);padding:5px 8px;border:1px solid var(--border2);border-radius:var(--r);min-width:140px">${opts}</select>
        <span id="cfg-si-assign-clr-${encN}">${clrBtn}</span>
      </div>
    </div>`;
  }).join('') || '<div style="padding:18px;text-align:center;color:var(--gray-l);font-size:var(--fs-sm)">검색 결과 없음</div>';
}
function _cfgRefreshSiAssignRow(name){
  const encN=encodeURIComponent(name);
  const cur=playerStatusIcons[name]||'';
  const prevEl=document.getElementById('cfg-si-assign-prev-'+encN);
  if(prevEl) prevEl.innerHTML=cur?(_siIsImg(cur)?_siRender(cur,'22px'):cur):'';
  const clrEl=document.getElementById('cfg-si-assign-clr-'+encN);
  if(clrEl){
    const pN=name.replace(/\\/g,'\\\\').replace(/'/g,"\\'");
    clrEl.innerHTML=cur?`<button class="btn btn-w btn-xs" style="border-color:var(--border2);color:#dc2626" onclick="setStatusIcon('${pN}','none');_cfgRefreshSiAssignRow('${pN}')">×</button>`:'';
  }
}
try{ window._renderCfgSiAssignList = _renderCfgSiAssignList; }catch(e){}

// ── (요청사항) 조편성 관리: 조별 경기 결과 일괄 입력(1줄=1게임) ──
// competition.js(대회/티어대회 조편성)에서 호출
window.openCompLeaguePasteModal = function(tnId, gi){
  if(!isLoggedIn) return alert('로그인이 필요합니다.');
  const tn = (typeof _findTourneyById==='function' ? _findTourneyById(tnId) : null) || (typeof tourneys!=='undefined' ? tourneys.find(t=>t.id===tnId) : null);
  if(!tn || !tn.groups || !tn.groups[gi]) return;
  // 티어대회 조편성 관리용(선수 vs 선수)
  _grpPasteState = {mode:'comp-league', tnId, gi};
  window._grpPasteMode = true;

  // pasteModal 초기화 (openGrpPasteModal과 동일 패턴)
  const textarea  = document.getElementById('paste-input');
  const previewEl = document.getElementById('paste-preview');
  const applyBtn  = document.getElementById('paste-apply-btn');
  const badge     = document.getElementById('paste-summary-badge');
  const pendWarn  = document.getElementById('paste-pending-warn');
  if (textarea)  textarea.value  = '';
  if (previewEl) previewEl.innerHTML = '';
  if (applyBtn)  { applyBtn.style.display = 'none'; applyBtn.textContent = '✅ 조에 저장'; }
  if (badge)     badge.style.display = 'none';
  if (pendWarn)  pendWarn.style.display = 'none';
  window._pasteResults = null;
  window._pasteErrors  = null;

  const dateInput = document.getElementById('paste-date');
  if (dateInput) dateInput.value = new Date().toISOString().slice(0,10);

  const modeSel = document.getElementById('paste-mode');
  if(modeSel){ modeSel.value='comp'; modeSel.style.display='none'; }
  const modeLabel = document.getElementById('paste-mode-label');
  if(modeLabel) modeLabel.style.display='none';
  const hintEl = document.getElementById('paste-mode-hint');
  if(hintEl){
    const GL='ABCDEFGHIJ';
    hintEl.innerHTML = `<div style="background:#eff6ff;border:1px solid #93c5fd;border-radius:8px;padding:8px 12px;margin-bottom:4px">
      <span style="color:#1d4ed8;font-weight:800">🏆 조별리그 일괄 입력</span>
      — <b>${tn.name}</b> · <b>GROUP ${GL[gi]||gi}조</b><br>
      <span style="font-size:var(--fs-caption);color:#6b7280">형식: 날짜 승자 패자 [맵] (여러 줄)</span>
    </div>`;
  }
  const compWrap = document.getElementById('paste-comp-wrap');
  if(compWrap){ compWrap.style.display='none'; compWrap.innerHTML=''; }
  const _pasteDetails=document.querySelector('#pasteModal details');
  if(_pasteDetails) _pasteDetails.style.display='none';

  // 세트/게임 모드 선택은 의미 없으니 숨김
  const _matchModeDiv=document.getElementById('paste-match-mode-game')?.closest('div[style]');
  if(_matchModeDiv) _matchModeDiv.style.display='none';

  const _pTitle=document.querySelector('#pasteModal .mtitle');
  if(_pTitle) _pTitle.textContent='📋 결과 붙여넣기';
  om('pasteModal');
};
function _bulkSelected(keys, prefix, defaultChecked=true){
  return keys.filter(k=>{
    const el=document.getElementById(prefix+k);
    return el ? !!el.checked : defaultChecked;
  });
}
function bulkChangeDate(){
  // (QA 드라이런/호환) 일부 환경은 isLoggedIn이 top-level let 으로 선언되어 window.isLoggedIn과 분리됨
  // - 드라이런은 window.isLoggedIn을 조작하므로 둘 다 허용
  const _li = (typeof isLoggedIn!=='undefined' ? !!isLoggedIn : false) || !!window.isLoggedIn;
  if(!_li) return;
  const from=document.getElementById('bulk-date-from')?.value||'';
  const to=document.getElementById('bulk-date-to')?.value||'';
  if(!from||!to){ alert('변경 전/후 날짜를 입력하세요.'); return; }
  const keys=_bulkSelected(['mini','univm','ck','pro','tt','ind','gj','comp'],'bulk-date-chk-');
  if(!keys.length){ alert('대상을 선택하세요.'); return; }
  const arrMap=_bulkArrMapAll();
  let changed=0;
  keys.forEach(k=>{
    const arr=arrMap[k]||[];
    arr.forEach(m=>{ if(m && m.d===from){ m.d=to; changed++; } });
  });
  if(changed){ save(); render(); }
  const el=document.getElementById('bulk-date-result');
  if(el){ el.textContent = changed?`✅ ${changed}건 변경 완료!`:'변경할 항목이 없습니다.'; setTimeout(()=>{ if(el) el.textContent=''; }, 3500); }
}
function bulkChangeMap(){
  const _li = (typeof isLoggedIn!=='undefined' ? !!isLoggedIn : false) || !!window.isLoggedIn;
  if(!_li){ alert('로그인이 필요합니다.'); return; }
  const from=(document.getElementById('bulk-map-from')?.value||'').trim();
  const to=(document.getElementById('bulk-map-to')?.value||'').trim();
  if(!from||!to){ alert('교체 전/후 맵 이름을 입력하세요.'); return; }
  if(typeof window.bulkReplaceMapEverywhere === 'function'){
    const changed = window.bulkReplaceMapEverywhere(from, to);
    if(changed){ save(); render(); }
    const el=document.getElementById('bulk-map-result');
    if(el){ el.textContent = changed?`✅ ${changed}개 맵명 교체 완료!`:'교체할 항목이 없습니다.'; setTimeout(()=>{ if(el) el.textContent=''; }, 3500); }
    return;
  }
  // (보강) 사용자가 '투혼 II' vs '투혼II' 같이 띄어쓰기 차이로 입력하는 경우가 많아서
  // - 비교는 "공백 제거 + 소문자"로 한 번 더 수행한다.
  const norm = (s)=>String(s||'').trim().toLowerCase().replace(/\s+/g,'');
  const fromN = norm(from);
  const arrMap=_bulkArrMapAll();
  const keys=Object.keys(arrMap); // 맵 교체는 전체 적용
  let changed=0;
  const rep=(obj)=>{
    if(!obj||typeof obj!=='object') return;
    if(typeof obj.map==='string'){
      const cur=obj.map.trim();
      if(cur===from || norm(cur)===fromN){ obj.map=to; changed++; }
    }
    // 세트/게임 내부도 체크
    (obj.sets||[]).forEach(st=>{
      if(typeof st.map==='string'){
        const cur=st.map.trim();
        if(cur===from || norm(cur)===fromN){ st.map=to; changed++; }
      }
      (st.games||[]).forEach(g=>{
        if(typeof g.map==='string'){
          const cur=g.map.trim();
          if(cur===from || norm(cur)===fromN){ g.map=to; changed++; }
        }
      });
    });
  };
  keys.forEach(k=>{ (arrMap[k]||[]).forEach(rep); });
  // 대회(tourneys) 내부의 games(map)도 교체
  (tourneys||[]).forEach(tn=>{
    (tn.groups||[]).forEach(grp=> (grp.matches||[]).forEach(rep));
    const br=tn.bracket||{};
    Object.values(br.matchDetails||{}).forEach(rep);
    (br.manualMatches||[]).forEach(rep);
  });
  // 맵 목록 자체도 교체(선택지 통일)
  try{
    if(Array.isArray(maps)){
      maps = maps.map(m=> ((String(m||'').trim()===from || norm(m)===fromN)?to:m));
    }
  }catch(e){}
  if(changed){ save(); render(); }
  const el=document.getElementById('bulk-map-result');
  if(el){ el.textContent = changed?`✅ ${changed}개 맵명 교체 완료!`:'교체할 항목이 없습니다.'; setTimeout(()=>{ if(el) el.textContent=''; }, 3500); }
}
function previewBulkChangeMap(){
  const _li = (typeof isLoggedIn!=='undefined' ? !!isLoggedIn : false) || !!window.isLoggedIn;
  if(!_li){ alert('로그인이 필요합니다.'); return; }
  const from=(document.getElementById('bulk-map-from')?.value||'').trim();
  if(!from){ alert('교체 전 맵 이름을 입력하세요.'); return; }
  const cnt=(typeof window.bulkCountMapEverywhere==='function') ? window.bulkCountMapEverywhere(from) : 0;
  const el=document.getElementById('bulk-map-result');
  if(el){
    el.textContent = cnt?`🔎 변경 예정 ${cnt}개`:'일치하는 맵이 없습니다.';
    setTimeout(()=>{ if(el && el.textContent.startsWith('🔎')) el.textContent=''; }, 3500);
  }
}
function bulkDeleteByDate(){
  const _li = (typeof isLoggedIn!=='undefined' ? !!isLoggedIn : false) || !!window.isLoggedIn;
  if(!_li) return;
  const from=document.getElementById('bulk-del-from')?.value||'';
  const to=document.getElementById('bulk-del-to')?.value||'';
  if(!from||!to){ alert('시작/종료 날짜를 입력하세요.'); return; }
  if(!confirm(`⚠️ ${from} ~ ${to} 범위의 기록을 삭제합니다. 되돌릴 수 없습니다.\n계속할까요?`)) return;
  const keys=_bulkSelected(['mini','univm','ck','pro','tt','ind','gj','comp'],'bulk-del-chk-', false);
  // bulk-del 체크박스는 기본 미체크라서, element 없으면 false가 자연스러움
  const arrMap=_bulkArrMapAll();
  let removed=0;
  const inRange=(d)=> d && d>=from && d<=to;
  keys.forEach(k=>{
    const arr=arrMap[k]||[];
    const before=arr.length;
    const next=arr.filter(m=> !(m && inRange(m.d)) );
    removed += (before-next.length);
    arrMap[k].length = 0;
    arrMap[k].push(...next);
  });
  if(removed){ save(); render(); }
  const el=document.getElementById('bulk-del-result');
  if(el){ el.textContent = removed?`✅ ${removed}건 삭제 완료!`:'삭제할 항목이 없습니다.'; setTimeout(()=>{ if(el) el.textContent=''; }, 3500); }
}

