// ══════════════════════════════════════════════════════════
// settings-crud-univ.js — 대학/티어/색상팔레트/계정 CRUD
// settings-crud.js 에서 분리됨
// 의존: constants.js, settings-crud.js (save, render, refreshSel 등 전역)
// ══════════════════════════════════════════════════════════

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

function addUniv(){const n=document.getElementById('nu-n').value.trim();const c=document.getElementById('nu-c').value;if(!n)return;univCfg.push({name:n,color:c});save();render();refreshSel();try{const modal=document.getElementById('cfgModal');if(modal&&modal.style.display!=='none'){setTimeout(()=>{try{if(typeof window._cfgGo==='function')window._cfgGo('univ');}catch(e){}},80);}}catch(e){}}
function delUniv(i){if(confirm(`"${univCfg[i].name}" 삭제?`)){univCfg.splice(i,1);save();render();refreshSel();}}
try{ if(typeof window._univDragSrc !== 'number') window._univDragSrc = -1; }catch(e){}
function _univDragStart(e,i){try{ window._univDragSrc=i; }catch(_){} e.currentTarget.style.opacity='0.4';e.dataTransfer.effectAllowed='move';}
function _univDragOver(e){e.preventDefault();e.dataTransfer.dropEffect='move';return false;}
function _univDrop(e,i){
  e.stopPropagation();
  if((window._univDragSrc??-1)===i)return false;
  const moved=univCfg.splice((window._univDragSrc??-1),1)[0];
  univCfg.splice(i,0,moved);
  save();render();
  return false;
}
function _univDragEnd(e){e.currentTarget.style.opacity='1';}

let _dissolveIdx = -1;
function openDissolveModal(i){
  try{ window._dissolveIdx = i; }catch(e){ _dissolveIdx = i; }
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
  const idx = (typeof window._dissolveIdx === 'number') ? window._dissolveIdx : _dissolveIdx;
  if(idx < 0) return;
  const u = univCfg[idx];
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

/* ════════════════════════════════════════════════════════
   §6  티어 테마 커스텀
════════════════════════════════════════════════════════ */
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

/* ════════════════════════════════════════════════════════
   §7  색상 유틸 (스포이드 / hex 정규화)
════════════════════════════════════════════════════════ */
function cfgNormHex(v){
  const s=String(v||'').trim();
  if(!s) return null;
  const t = s.startsWith('#') ? s.slice(1) : s;
  if(/^[0-9a-fA-F]{6}$/.test(t)) return '#'+t.toUpperCase();
  if(/^[0-9a-fA-F]{3}$/.test(t)) return '#'+t.split('').map(ch=>ch+ch).join('').toUpperCase();
  return null;
}
// ── 최근 사용 색상 저장/로드 ──
const _RECENT_COLORS_KEY = 'su_recent_colors';
function _recentColorsLoad(){ try{ return JSON.parse(localStorage.getItem(_RECENT_COLORS_KEY)||'[]'); }catch(e){ return []; } }
function _recentColorsSave(hex){
  try{
    let arr = _recentColorsLoad().filter(c=>c!==hex);
    arr.unshift(hex);
    arr = arr.slice(0,12);
    localStorage.setItem(_RECENT_COLORS_KEY, JSON.stringify(arr));
  }catch(e){}
}

// ── 미니 색상 팔레트 팝업 ──
function cfgShowColorPalette(anchorEl, currentHex, onSelect){
  // 기존 팝업 제거
  const existing = document.getElementById('cfg-color-palette-pop');
  if(existing){ existing.remove(); return; }

  // 대학 기존 색상 수집
  const univColors = (typeof univCfg!=='undefined' ? univCfg : [])
    .map(u=>u.color).filter(Boolean)
    .filter((c,i,a)=>a.indexOf(c)===i);

  // 최근 사용 색상
  const recentColors = _recentColorsLoad();

  // 프리셋 색상
  const presets = [
    '#EF4444','#F97316','#F59E0B','#EAB308','#84CC16','#22C55E',
    '#10B981','#14B8A6','#06B6D4','#3B82F6','#6366F1','#8B5CF6',
    '#A855F7','#EC4899','#F43F5E','#64748B','#1E293B','#FFFFFF'
  ];

  const pop = document.createElement('div');
  pop.id = 'cfg-color-palette-pop';
  pop.style.cssText = 'position:fixed;z-index:99999;background:var(--white);border:1px solid var(--border);border-radius:12px;padding:12px;box-shadow:0 8px 32px rgba(0,0,0,.18);min-width:220px;';

  const makeSwatches = (colors, label) => {
    if(!colors.length) return '';
    return `<div style="font-size:10px;font-weight:700;color:var(--gray-l);margin:8px 0 5px;letter-spacing:.06em;text-transform:uppercase">${label}</div>
    <div style="display:flex;flex-wrap:wrap;gap:5px;margin-bottom:4px">
      ${colors.map(c=>`<button title="${c}" style="width:22px;height:22px;border-radius:5px;background:${c};border:2px solid ${c===currentHex?'var(--text2)':'transparent'};cursor:pointer;padding:0;flex-shrink:0;box-shadow:0 1px 3px rgba(0,0,0,.15)" onclick="window._cfgPaletteSelect('${c}')"></button>`).join('')}
    </div>`;
  };

  // HEX 입력 + EyeDropper(Chrome/Edge)
  const eyedropperBtn = window.EyeDropper
    ? `<button title="화면에서 직접 찍기 (Chrome/Edge)" style="padding:4px 8px;border:1px solid var(--border);border-radius:6px;background:var(--surface);cursor:pointer;font-size:12px" onclick="window._cfgPaletteEyedrop()">🎯 찍기</button>`
    : '';

  pop.innerHTML = `
    <div style="font-size:12px;font-weight:700;color:var(--text2);margin-bottom:8px;display:flex;justify-content:space-between;align-items:center">
      색상 선택
      <button onclick="document.getElementById('cfg-color-palette-pop').remove()" style="border:none;background:none;cursor:pointer;font-size:16px;color:var(--gray-l);line-height:1;padding:0">×</button>
    </div>
    ${makeSwatches(univColors, '대학 색상')}
    ${makeSwatches(recentColors, '최근 사용')}
    ${makeSwatches(presets, '기본 색상')}
    <div style="font-size:10px;font-weight:700;color:var(--gray-l);margin:8px 0 5px;letter-spacing:.06em;text-transform:uppercase">직접 입력</div>
    <div style="display:flex;gap:6px;align-items:center">
      <input id="cfg-palette-hex-inp" type="text" value="${currentHex||''}" placeholder="#RRGGBB"
        style="flex:1;font-size:12px;padding:5px 8px;border:1px solid var(--border);border-radius:6px;font-weight:700;font-family:monospace"
        oninput="const el=this;const h=window.cfgNormHex?cfgNormHex(el.value):null;if(h){el.style.background=h;el.style.color=window._cfgContrastColor(h);}"
        onkeydown="if(event.key==='Enter'){const h=window.cfgNormHex?cfgNormHex(this.value):null;if(h)window._cfgPaletteSelect(h);}">
      ${eyedropperBtn}
      <button style="padding:4px 10px;border:1px solid var(--border);border-radius:6px;background:var(--surface);cursor:pointer;font-size:12px" onclick="const h=window.cfgNormHex?cfgNormHex(document.getElementById('cfg-palette-hex-inp').value):null;if(h)window._cfgPaletteSelect(h);">적용</button>
    </div>`;

  document.body.appendChild(pop);

  // 위치 계산 (앵커 기준)
  const rect = anchorEl.getBoundingClientRect();
  const popW = 232, popH = 360;
  let top = rect.bottom + 6;
  let left = rect.left;
  if(top + popH > window.innerHeight) top = rect.top - popH - 6;
  if(left + popW > window.innerWidth) left = window.innerWidth - popW - 8;
  pop.style.top = Math.max(4, top) + 'px';
  pop.style.left = Math.max(4, left) + 'px';

  // 콜백 등록
  window._cfgPaletteSelect = function(hex){
    _recentColorsSave(hex);
    onSelect(hex);
    pop.remove();
    delete window._cfgPaletteSelect;
    delete window._cfgPaletteEyedrop;
  };
  window._cfgPaletteEyedrop = async function(){
    try{
      const ed = new EyeDropper();
      const res = await ed.open();
      if(res && res.sRGBHex) window._cfgPaletteSelect(res.sRGBHex);
    }catch(e){}
  };
  window._cfgContrastColor = function(hex){
    try{
      const n=parseInt(hex.slice(1),16);
      const r=(n>>16)&255,g=(n>>8)&255,b=n&255;
      return (r*299+g*587+b*114)/1000>128?'#000':'#fff';
    }catch(e){ return '#000'; }
  };

  // 바깥 클릭 시 닫기
  setTimeout(()=>{
    const onOut = (e)=>{
      if(!pop.contains(e.target) && e.target!==anchorEl){
        pop.remove();
        document.removeEventListener('mousedown', onOut);
      }
    };
    document.addEventListener('mousedown', onOut);
  }, 0);
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
function cfgUnivPickColor(i, btn){
  if(typeof cfgShowColorPalette!=='function') return;
  const cur = (univCfg[i] && univCfg[i].color) || '#3b82f6';
  cfgShowColorPalette(btn, cur, (hex)=>{ cfgUnivSetColor(i, hex); });
}

function cfgTierThemePickColor(tier, btn){
  if(typeof cfgShowColorPalette!=='function') return;
  const td = (typeof tierThemes!=='undefined') && tierThemes && tierThemes[tier];
  const cur = (td && td.color) || '#3b82f6';
  cfgShowColorPalette(btn, cur, (hex)=>{ cfgTierThemeSetColor(tier, hex); });
}

/* ════════════════════════════════════════════════════════
   §8  관리자 계정 관리
════════════════════════════════════════════════════════ */
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

/* ════════════════════════════════════════════════════════
   §9  인증 토큰 / 비밀번호 저장
════════════════════════════════════════════════════════ */
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
try{ window.statsSub = window.statsSub || 'overview'; }catch(e){}
