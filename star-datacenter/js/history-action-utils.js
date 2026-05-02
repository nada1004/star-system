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

function openSimpleActionMenu(anchorEl, items, ev){
  try{ if(ev && ev.preventDefault) ev.preventDefault(); }catch(_){}
  try{ if(ev && ev.stopPropagation) ev.stopPropagation(); }catch(_){}
  const el=_ensureSuCtxMenu();
  if(!el) return;
  const list=Array.isArray(items)?items.filter(Boolean):[];
  if(!list.length){ closeSuCtxMenu(); return; }
  el.innerHTML = list.map((it,i)=>`<button type="button" class="su-ctxmenu-item" data-i="${i}">${it.t||`메뉴 ${i+1}`}</button>`).join('');
  setTimeout(()=>{
    try{
      el.querySelectorAll('button[data-i]').forEach(b=>{
        b.onclick=(e)=>{
          try{ e.preventDefault(); e.stopPropagation(); }catch(_){}
          const idx=parseInt(b.getAttribute('data-i')||'0',10)||0;
          try{ list[idx].on && list[idx].on(); }catch(_){}
          closeSuCtxMenu();
        };
      });
    }catch(_){}
  },0);
  try{
    const pad = 8;
    const r = (anchorEl && anchorEl.getBoundingClientRect) ? anchorEl.getBoundingClientRect() : null;
    const ax = r ? r.right : (ev?.clientX||0);
    const ay = r ? r.bottom : (ev?.clientY||0);
    el.style.display='block';
    el.style.visibility='hidden';
    el.style.left='0px';
    el.style.top='0px';
    const bw=el.offsetWidth||180;
    const bh=el.offsetHeight||220;
    let left=ax, top=ay+6;
    if(left+bw+pad>window.innerWidth) left=window.innerWidth-bw-pad;
    if(top+bh+pad>window.innerHeight) top=ay-bh-6;
    if(left<pad) left=pad;
    if(top<pad) top=pad;
    el.style.left=left+'px';
    el.style.top=top+'px';
    el.style.visibility='visible';
  }catch(e){
    try{ el.style.display='block'; el.style.visibility='visible'; }catch(_){}
  }
}

function openRecActionMenu(ev, opts){
  try{ if(ev && ev.preventDefault) ev.preventDefault(); }catch(_){}
  try{ if(ev && ev.stopPropagation) ev.stopPropagation(); }catch(_){}
  const el=_ensureSuCtxMenu();
  if(!el) return;
  const o=opts||{};
  const items=[];
  items.push({t:'📂 상세 보기', on:()=>toggleDetail(o.key)});
  if(o.canShare) items.push({t:'🎴 공유카드', on:()=>openShareCardFromMatch(o.mode,o.idx)});
  if(o.canEdit) items.push({t:'✏️ 수정', on:()=>openRE(o.mode,o.idx)});
  if(o.canDel) items.push({t:'🗑️ 삭제', on:()=>delRec(o.mode,o.idx)});
  if(o.canMove) items.push({t:'↗ 이동', on:()=>openMoveMatchPop(o._btnEl,o.mode,o.idx)});
  items.push({t:'📤 결과 복사', on:()=>copyMatchResult(o.a,o.sa,o.b,o.sb,o.d,o.mode,o.idx)});

  el.innerHTML = items.map((it,i)=>`<button type="button" class="su-ctxmenu-item" data-i="${i}">${it.t}</button>`).join('');
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
    openSimpleActionMenu,
    closeSuCtxMenu,
    savePlayerMemo,
    saveMemo
  };
}catch(e){}
