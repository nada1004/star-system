/* ══════════════════════════════════════
   History Action Utilities
══════════════════════════════════════ */
function _ensureSuCtxMenu(){
  let el=document.getElementById('suCtxMenu');
  if(el) return el;
  el=document.createElement('div');
  el.id='suCtxMenu';
  el.className='su-ctxmenu no-export';
  el.style.display='none';
  document.body.appendChild(el);
  setTimeout(()=>{
    try{
      document.addEventListener('pointerdown',(e)=>{
        const m=document.getElementById('suCtxMenu');
        if(!m || m.style.display==='none') return;
        if(e && e.target && m.contains(e.target)) return;
        closeSuCtxMenu();
      }, true);
    }catch(_){}
  },0);
  return el;
}

function closeSuCtxMenu(){
  try{
    const el=document.getElementById('suCtxMenu');
    if(el){ el.style.display='none'; el.innerHTML=''; }
  }catch(e){}
}

function _shareSoloLabel(modeKey){
  const mk = String(modeKey||'').trim();
  return mk==='ind' ? '개인전' : (mk==='progj' ? '프로리그 끝장전' : '끝장전');
}

function normalizeMatchShareObjForCard(src, modeKey){
  const obj = src ? {...src} : null;
  if(!obj) return null;
  const mk = String(modeKey || obj._matchType || '').trim();
  const soloMode = (mk==='ind' || mk==='gj' || mk==='progj');
  if(soloMode){
    const w = String(obj.wName||obj.a||'').trim();
    const l = String(obj.lName||obj.b||'').trim();
    let ca = '';
    let cb = '';
    try{
      const pw = (typeof statsP==='function' && w) ? statsP(w) : null;
      const pl = (typeof statsP==='function' && l) ? statsP(l) : null;
      ca = pw?.univ && typeof gc==='function' ? gc(pw.univ) : '';
      cb = pl?.univ && typeof gc==='function' ? gc(pl.univ) : '';
    }catch(e){}
    const sub = _shareSoloLabel(mk);
    return {
      ...obj,
      a: w,
      b: l,
      sa: Number(obj.sa ?? 1),
      sb: Number(obj.sb ?? 0),
      _matchType: mk,
      _noUnivIcon: false,
      _usePlayerPhoto: true,
      _subLabel: sub,
      _shareColorA: ca || obj._shareColorA || '',
      _shareColorB: cb || obj._shareColorB || '',
      _shareCardStyle: 'solo-match',
      sets: (Array.isArray(obj.sets) && obj.sets.length) ? obj.sets : [{
        label: sub,
        scoreA: Number(obj.sa ?? 1),
        scoreB: Number(obj.sb ?? 0),
        games: [{
          playerA: w,
          playerB: l,
          winner: 'A',
          map: obj.map || ''
        }]
      }]
    };
  }
  const next = {
    ...obj,
    _matchType: mk || obj._matchType || '',
    _shareCardStyle: obj._shareCardStyle || 'match'
  };
  if(!next._usePlayerPhoto){
    try{
      const pA = next.a && typeof statsP==='function' ? statsP(next.a) : null;
      const pB = next.b && typeof statsP==='function' ? statsP(next.b) : null;
      if(pA && pB) next._usePlayerPhoto = true;
    }catch(_){}
  }
  return next;
}

async function openUnifiedMatchShareCard(shareObj){
  try{
    window._shareMatchObj = shareObj || null;
    window._shareMode = 'match';
    const ok = (typeof window._shareEnsureStatsAndOpen==='function')
      ? await window._shareEnsureStatsAndOpen()
      : (typeof openShareCardModal === 'function');
    if(!ok) return;
    if(typeof openShareCardModal==='function') openShareCardModal();
    try{
      if(typeof refreshShareCardModalMeta==='function'){
        refreshShareCardModalMeta(window._shareMatchObj || shareObj || null);
      }
    }catch(_){}
    setTimeout(()=>{
      try{
        if(window._shareMatchObj && typeof renderShareCardByMatchObj==='function'){
          renderShareCardByMatchObj(window._shareMatchObj);
        }
      }catch(_){}
    },80);
  }catch(e){}
}

function openShareCardFromDetReg(key){
  try{
    const reg = window._detReg && window._detReg[key];
    if(!reg || !reg.m) return;
    const modeKey = String(reg.mode||'').trim();
    const obj = reg.m || {};
    const mt = (modeKey==='tt' ? 'tt' : (obj._matchType || modeKey || ''));
    const shareObj = normalizeMatchShareObjForCard({...obj, _matchType: mt}, modeKey);
    openUnifiedMatchShareCard(shareObj);
  }catch(e){}
}

function openRecActionMenu(ev, opts){
  try{ if(ev && ev.preventDefault) ev.preventDefault(); }catch(_){}
  try{ if(ev && ev.stopPropagation) ev.stopPropagation(); }catch(_){}
  try{
    if(typeof window._ensureShareCardLoaded === 'function'){
      Promise.resolve().then(()=>window._ensureShareCardLoaded()).catch(()=>{});
    }else if(typeof window._ensureStatsLoaded === 'function'){
      Promise.resolve().then(()=>window._ensureStatsLoaded()).catch(()=>{});
    }
  }catch(_){}
  const el=_ensureSuCtxMenu();
  if(!el) return;
  const o=opts||{};
  const items=[];
  items.push({k:'copy', t:'📤 결과 복사', on:()=>copyMatchResult(o.a,o.sa,o.b,o.sb,o.d,o.mode,o.idx)});
  if(o.canShare) items.push({k:'share', t:'🎴 공유 카드', on:()=>{
    if(o.key && typeof openShareCardFromDetReg==='function') return openShareCardFromDetReg(o.key);
    return openShareCardFromMatch(o.mode,o.idx);
  }});
  items.push({k:'detail', t:'📂 상세 보기', on:()=>toggleDetail(o.key)});
  if(o.canEdit) items.push({k:'edit', t:'✏️ 수정', on:()=>{
    if(o.editKind==='league') return leagueEditMatch(o.tnId,o.gi,o.mi);
    return openRE(o.mode,o.idx);
  }});
  if(o.canDel) items.push({k:'delete', t:'🗑️ 삭제', on:()=>delRec(o.mode,o.idx)});
  if(o.canMove) items.push({k:'move', t:'↗ 이동', on:()=>openMoveMatchPop(o._btnEl,o.mode,o.idx)});

  el.innerHTML = items.map((it,i)=>`<button type="button" class="su-ctxmenu-item ${it.k==='share'?'is-share':''}" data-act="${it.k||''}" data-i="${i}">${it.t}</button>`).join('');
  setTimeout(()=>{
    try{
      el.querySelectorAll('button[data-i]').forEach(b=>{
        b.onclick=(e)=>{
          try{ e.preventDefault(); e.stopPropagation(); }catch(_){}
          const idx=parseInt(b.getAttribute('data-i')||'0',10)||0;
          try{ items[idx].on(); }catch(_){}
          closeSuCtxMenu();
        };
      });
    }catch(_){}
  },0);

  try{
    const pad = 8;
    const r = (o._btnEl && o._btnEl.getBoundingClientRect) ? o._btnEl.getBoundingClientRect() : null;
    const ax = r ? r.right : (ev?.clientX||0);
    const ay = r ? r.bottom : (ev?.clientY||0);
    el.style.display='block';
    el.style.visibility='hidden';
    el.style.left = '0px';
    el.style.top  = '0px';
    const bw = el.offsetWidth || 180;
    const bh = el.offsetHeight || 220;
    let left = ax;
    let top  = ay + 6;
    if(left + bw + pad > window.innerWidth) left = window.innerWidth - bw - pad;
    if(top  + bh + pad > window.innerHeight) top  = ay - bh - 6;
    if(left < pad) left = pad;
    if(top  < pad) top  = pad;
    el.style.left = left + 'px';
    el.style.top  = top + 'px';
    el.style.visibility='visible';
  }catch(e){
    try{ el.style.display='block'; el.style.visibility='visible'; }catch(_){}
  }
}

function savePlayerMemo(name, del=false){
  const p=players.find(x=>x.name===name);
  if(!p)return;
  if(del){
    delete p.memo;
  } else {
    const el=document.getElementById('player-memo-input');
    if(el) p.memo=el.value.trim();
  }
  save();
  document.getElementById('playerModalBody').innerHTML=buildPlayerDetailHTML(p);
}

function saveMemo(mode,idx,inputId){
  let arr;
  if(mode==='mini') arr=miniM;
  else if(mode==='univm') arr=univM;
  else if(mode==='comp') arr=comps;
  else if(mode==='ck') arr=ckM;
  else if(mode==='pro') arr=proM;
  else return;
  if(!arr[idx])return;
  if(inputId===null){
    delete arr[idx].memo;
  } else {
    const el=document.getElementById(inputId);
    if(el) arr[idx].memo=el.value.trim();
  }
  save();render();
}

try{
  window.HistoryActionUtils = window.HistoryActionUtils || {
    ensureCtxMenu: _ensureSuCtxMenu,
    openRecActionMenu,
    openShareCardFromDetReg,
    openUnifiedMatchShareCard,
    normalizeMatchShareObjForCard,
    closeSuCtxMenu,
    savePlayerMemo,
    saveMemo
  };
}catch(e){}
