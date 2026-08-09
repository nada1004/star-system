/* ══════════════════════════════════════════════════════════════
   설정 - 선수 추가(단건/벌크) (settings-crud.js 에서 분리, 2026-07-30)
   ══════════════════════════════════════════════════════════════ */

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
// 직책 버튼 다중선택: 클릭한 직책을 ed-role 입력값에 추가/제거 토글(& 로 연결)
window._cfgToggleEdRole=function(btn){
  const el=document.getElementById('ed-role'); if(!el||!btn) return;
  const role=btn.dataset.role;
  const parts=(el.value||'').split('&').map(s=>s.trim()).filter(Boolean);
  const idx=parts.indexOf(role);
  if(idx>=0) parts.splice(idx,1); else parts.push(role);
  el.value=parts.join(' & ');
  window._cfgSyncEdRoleBtns();
};
// ed-role 입력값(직접 입력 포함)에 맞춰 직책 버튼들의 선택 표시를 다시 그린다
window._cfgSyncEdRoleBtns=function(){
  const el=document.getElementById('ed-role'); const wrap=document.getElementById('ed-role-btns');
  if(!el||!wrap) return;
  const parts=(el.value||'').split('&').map(s=>s.trim()).filter(Boolean);
  wrap.querySelectorAll('[data-role]').forEach(b=>{
    const on=parts.includes(b.dataset.role);
    const col=b.dataset.col||'#6b7280';
    b.style.background=on?col+'22':'var(--white)';
    const ic=(typeof ROLE_ICONS!=='undefined'&&ROLE_ICONS[b.dataset.role])||'🏷️';
    b.textContent=`${ic} ${b.dataset.role}${on?' ✓':''}`;
  });
};
