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
        <span style="flex:1;font-weight:700;font-size:var(--fs-base)">${u.name}</span>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:8px">
        <button class="btn btn-xs btn-w" onclick="promptBoardBgImgUrl('${u.name.replace(/'/g,"\\'")}')">URL 설정</button>
        ${u.bgImg?`<button class="btn btn-xs btn-r" onclick="removeBoardBgImg('${u.name.replace(/'/g,"\\'")}')">삭제</button>`:''}
      </div>
      ${u.bgImg?`<div style="margin-top:8px">
        <div style="font-size:var(--fs-caption);font-weight:600;color:var(--text2);margin-bottom:6px">위치</div>
        <select onchange="setBoardBgImgPos('${u.name.replace(/'/g,"\\'")}',this.value)" style="padding:4px 8px;border:1px solid var(--border2);border-radius:6px;font-size:var(--fs-sm)">
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
        <div style="font-size:var(--fs-caption);font-weight:600;color:var(--text2);margin-bottom:6px;margin-top:8px">크기</div>
        <select onchange="setBoardBgImgSize('${u.name.replace(/'/g,"\\'")}',this.value)" style="padding:4px 8px;border:1px solid var(--border2);border-radius:6px;font-size:var(--fs-sm)">
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
        <span style="flex:1;font-weight:700;font-size:var(--fs-base)">${u.name}</span>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:8px">
        <button class="btn btn-xs btn-w" onclick="promptBoardBgImgUrl('${u.name.replace(/'/g,"\\'")}')">URL 설정</button>
        ${u.bgImg?`<button class="btn btn-xs btn-r" onclick="removeBoardBgImg('${u.name.replace(/'/g,"\\'")}')">삭제</button>`:''}
      </div>
      ${u.bgImg?`<div style="margin-top:8px">
        <div style="font-size:var(--fs-caption);font-weight:600;color:var(--text2);margin-bottom:6px">위치</div>
        <select onchange="setBoardBgImgPos('${u.name.replace(/'/g,"\\'")}',this.value)" style="padding:4px 8px;border:1px solid var(--border2);border-radius:6px;font-size:var(--fs-sm)">
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
        <div style="font-size:var(--fs-caption);font-weight:600;color:var(--text2);margin-bottom:6px;margin-top:8px">크기</div>
        <select onchange="setBoardBgImgSize('${u.name.replace(/'/g,"\\'")}',this.value)" style="padding:4px 8px;border:1px solid var(--border2);border-radius:6px;font-size:var(--fs-sm)">
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

// openEP 정의는 js/settings-crud-editmodal.js로 이전됨 (이 파일의 구버전은 완전히 죽은 코드였으므로 제거)




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
    return `<div style="padding:8px 16px;cursor:pointer;font-size:var(--fs-base);font-weight:${isCur?'800':'600'};color:${isCur?'#7c3aed':'#374151'};background:${isCur?'#f5f3ff':'white'};display:flex;align-items:center;gap:8px;"
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
