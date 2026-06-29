function cfgTierThemePickColor(tier,btn){ if(typeof cfgShowColorPalette==='function'){ const td=(typeof tierThemes!=='undefined')&&tierThemes&&tierThemes[tier]; const cur=(td&&td.color)||'#3b82f6'; cfgShowColorPalette(btn,cur,(hex)=>cfgTierThemeSetColor(tier,hex)); } }

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


/* ==========================================
   STATISTICS TAB
========================================== */
try{ window.statsSub = window.statsSub || 'overview'; }catch(e){}
