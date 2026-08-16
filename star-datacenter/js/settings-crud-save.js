/* ══════════════════════════════════════════════════════════════
   설정 - 편집모달 보조기능 & 저장/삭제 (settings-crud.js 에서 분리, 2026-07-30)
   ══════════════════════════════════════════════════════════════ */

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
        empty.style.cssText = 'position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:var(--fs-sm);font-weight:900;color:rgba(15,23,42,.55)';
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

  // [FIX-NO-REFRESH-ON-SAVE] 저장 후 실제로 화면에 보이는 미디어(사진/영상 슬롯·위치·효과)가
  // 바뀌었을 때만 좌측 메인 이미지 DOM을 다시 그린다. 사진과 무관한 필드(승패/메모/티어 등)만
  // 바꿔 저장한 경우엔 이미지가 깜빡이며 새로고침(슬라이드쇼도 1번으로 리셋)되는 게 불필요한
  // 현상이었음 — 아래 스냅샷으로 저장 전/후를 비교해 필요할 때만 전체 재그리기를 한다.
  const _b2MediaSnapshot = (pl) => JSON.stringify([
    pl.photo, pl.secondProfileFile, pl.profileFile3, pl.profileFile4, pl.profileFile5,
    pl.profileFile6, pl.profileFile7, pl.profileFile8, pl.profileFile9, pl.profileFile10,
    pl.photoPosX, pl.photoPosY, pl.photoPosUse,
    pl.photo2PosX, pl.photo2PosY, pl.photo2PosUse,
    pl.photo3PosX, pl.photo3PosY, pl.photo3PosUse,
    pl.photo4PosX, pl.photo4PosY, pl.photo4PosUse,
    pl.photo5PosX, pl.photo5PosY, pl.photo5PosUse,
    pl.photo6PosX, pl.photo6PosY, pl.photo6PosUse,
    pl.photo7PosX, pl.photo7PosY, pl.photo7PosUse,
    pl.photo8PosX, pl.photo8PosY, pl.photo8PosUse,
    pl.photo9PosX, pl.photo9PosY, pl.photo9PosUse,
    pl.photo10PosX, pl.photo10PosY, pl.photo10PosUse,
    pl.pdPhotoFx, pl.name, pl.tier, pl.race, pl.univ
  ]);
  const _b2MediaBefore = _b2MediaSnapshot(p);

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
  const _roleOrderOn=document.getElementById('ed-role-order-on')?.checked;
  const _roleOrderRaw=document.getElementById('ed-role-order')?.value;
  if(_roleOrderOn && _roleOrderRaw!==''&&_roleOrderRaw!=null && !isNaN(parseInt(_roleOrderRaw,10))){
    p.roleOrder=parseInt(_roleOrderRaw,10);
  }else{
    delete p.roleOrder;
  }
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
  p.oneLiner        = _strVal('ed-oneliner');
  p.bgmUrl          = _strVal('ed-bgm-url');
  p.bgmVolume       = p.bgmUrl ? Math.max(0,Math.min(100, parseInt(document.getElementById('ed-bgm-vol')?.value||'50',10)||50)) : undefined;

  // 이미지 URL (비어 있으면 undefined)
  p.secondProfileFile = _strVal('ed-photo2');
  p.profileFile3      = _strVal('ed-photo3');
  p.profileFile4      = _strVal('ed-photo4');
  p.profileFile5      = _strVal('ed-photo5');
  p.profileFile6      = _strVal('ed-photo6');
  p.profileFile7      = _strVal('ed-photo7');
  p.profileFile8      = _strVal('ed-photo8');
  p.profileFile9      = _strVal('ed-photo9');
  p.profileFile10     = _strVal('ed-photo10');
  p.shareCardPhoto    = _strVal('ed-card-photo');

  // 헤더 배경 설정
  const _phbg      = _strVal('ed-phbg') || '';
  const _phbgFit   = _strVal('ed-phbg-fit') || '';
  const _phbgScale = _intVal('ed-phbg-scale', 100);
  const _phbgPos   = (document.getElementById('ed-phbg-pos')?.value || 'center center').trim();
  const _phbgPosX  = _intVal('ed-phbg-posx', 50);
  const _phbgPosY  = _intVal('ed-phbg-posy', 50);

  // 프로필 이미지·이름·배너 효과
  const _photoFx = (document.getElementById('ed-photo-fx')?.value || 'none').trim();
  const _nameFx  = (document.getElementById('ed-name-fx')?.value || 'none').trim();
  const _heroFx  = (document.getElementById('ed-hero-fx')?.value || 'none').trim();

  // 공유카드 배경 설정
  const _shareBg     = _strVal('ed-sharebg') || '';
  const _shareBgFit  = _strVal('ed-sharebg-fit') || '';
  const _shareBgScale = _intVal('ed-sharebg-scale', 100);
  const _shareBgDark  = _intVal('ed-sharebg-dark', 18);
  const _shareBgFade  = _intVal('ed-sharebg-fade', 0);
  const _shareBgPosX  = (document.getElementById('ed-sharebg-posx')?.value || 'center').trim();
  const _shareBgPosY  = (document.getElementById('ed-sharebg-posy')?.value || 'center').trim();


  try {
    // [FIX] 예전에는 값이 1(구 기본값 표기)이면 무조건 삭제해서, 사용자가 실제로 원하는
    // 전환 시간(예: 1초)을 입력해도 저장 시 사라지고 런타임 기본값(4초)으로 되돌아가는 문제가 있었음.
    // 현황판(board2) 프로필 수정 모달과 동일하게, 입력된 값을 항상 그대로 저장한다.
    const _clampDelay = (v) => { const n = parseFloat(v); return isNaN(n) ? 4 : Math.max(0.2, Math.min(60, n)); };
    document.querySelectorAll('#emBody [data-delay-key]').forEach(inp=>{
      const key = String(inp?.getAttribute('data-delay-key') || '').trim();
      if(!key) return;
      p[key] = _clampDelay(inp?.value ?? p[key] ?? 4);
    });
  } catch (e) { /* 딜레이 저장 실패는 치명적이지 않음 */ }

  _savePhotoPos(p, 'cardpos', 'shareCardPhoto', 'shareCardPhotoPosX', 'shareCardPhotoPosY', 'shareCardPhotoPosUse', 50, 22);
  _savePhotoPos(p, 'p2pos', 'secondProfileFile', 'photo2PosX', 'photo2PosY', 'photo2PosUse', 50, 50);
  _savePhotoPos(p, 'p3pos', 'profileFile3',      'photo3PosX', 'photo3PosY', 'photo3PosUse', 50, 50);
  _savePhotoPos(p, 'p4pos', 'profileFile4',      'photo4PosX', 'photo4PosY', 'photo4PosUse', 50, 50);
  _savePhotoPos(p, 'p5pos', 'profileFile5',      'photo5PosX', 'photo5PosY', 'photo5PosUse', 50, 50);
  _savePhotoPos(p, 'p6pos', 'profileFile6',      'photo6PosX', 'photo6PosY', 'photo6PosUse', 50, 50);
  _savePhotoPos(p, 'p7pos', 'profileFile7',      'photo7PosX', 'photo7PosY', 'photo7PosUse', 50, 50);
  _savePhotoPos(p, 'p8pos', 'profileFile8',      'photo8PosX', 'photo8PosY', 'photo8PosUse', 50, 50);
  _savePhotoPos(p, 'p9pos', 'profileFile9',      'photo9PosX', 'photo9PosY', 'photo9PosUse', 50, 50);
  _savePhotoPos(p, 'p10pos', 'profileFile10',    'photo10PosX', 'photo10PosY', 'photo10PosUse', 50, 50);
  p.detailHeaderBgImg=_phbg||undefined;
  p.detailHeaderBgFit=_phbgFit||undefined;
  p.detailHeaderBgScale=_phbg ? _phbgScale : undefined;
  p.detailHeaderBgPos=_phbg ? _phbgPos : undefined;
  p.detailHeaderBgPosX=_phbg ? (isNaN(_phbgPosX)?50:Math.max(0,Math.min(100,_phbgPosX))) : undefined;
  p.detailHeaderBgPosY=_phbg ? (isNaN(_phbgPosY)?50:Math.max(0,Math.min(100,_phbgPosY))) : undefined;
  p.pdPhotoFx=(_photoFx&&_photoFx!=='none') ? _photoFx : undefined;
  p.pdNameFx=(_nameFx&&_nameFx!=='none') ? _nameFx : undefined;
  p.pdHeroFx=(_heroFx&&_heroFx!=='none') ? _heroFx : undefined;
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
    // [FIX-NO-REFRESH-ON-SAVE] 화면에 실제 영향을 주는 미디어 필드가 하나도 안 바뀌었으면
    // 좌측 메인 이미지 DOM은 그대로 두고(슬라이드쇼 유지), 이름/티어/종족/대학 같은 텍스트만
    // 가볍게 갱신한다. 사진/영상이 바뀐 경우에만 기존처럼 전체를 다시 그린다.
    if(cur === p.name){
      const _mediaChanged = _b2MediaBefore !== _b2MediaSnapshot(p);
      if(_mediaChanged){
        if(typeof window._b2UpdateMainDisplay === 'function') window._b2UpdateMainDisplay(p.name);
        else if(typeof window._b2ScheduleImageSwap === 'function') window._b2ScheduleImageSwap(p.name);
      } else if(typeof window._b2UpdateMainDisplayInfoOnly === 'function'){
        window._b2UpdateMainDisplayInfoOnly(p.name);
      }
    }
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

