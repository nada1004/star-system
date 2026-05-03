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
  el.innerHTML = list.map((it,i)=>`<button type="button" class="su-ctxmenu-item ${it.kind?`is-${it.kind}`:''}" data-i="${i}">
    <span class="su-ctxmenu-item__label">${it.t||`메뉴 ${i+1}`}</span>
    ${it.d?`<span class="su-ctxmenu-item__desc">${it.d}</span>`:''}
  </button>`).join('');
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
  const _forcePersonal = ['ind','gj','progj'].includes(String(o.mode||''));
  const _canEdit = _forcePersonal ? true : !!o.canEdit;
  const _canDel = _forcePersonal ? true : !!o.canDel;
  const items=[];
  items.push({t:'📂 상세 보기', d:'세트/경기 상세 열기', kind:'primary', on:()=>toggleDetail(o.key)});
  if(o.canShare) items.push({t:'🎴 공유카드', d:'공유용 카드 생성', kind:'accent', on:()=>{ if(window._openShareFromDetReg && o.key) return window._openShareFromDetReg(o.key); }});
  if(_canEdit) items.push({t:'✏️ 수정', d:'기록 내용 수정', kind:'normal', on:()=>((typeof o.editFn==='function') ? o.editFn() : openRE(o.mode,o.idx))});
  if(o.canMove) items.push({t:'↗ 이동', d:'다른 기록 분류로 이동', kind:'normal', on:()=>openMoveMatchPop(o._btnEl,o.mode,o.idx)});
  items.push({t:'📤 결과 복사', d:'점수와 결과 텍스트 복사', kind:'normal', on:()=>copyMatchResult(o.a,o.sa,o.b,o.sb,o.d,o.mode,o.idx)});
  if(_canDel) items.push({t:'🗑️ 삭제', d:'이 기록을 완전히 삭제', kind:'danger', on:()=>((typeof o.delFn==='function') ? o.delFn() : delRec(o.mode,o.idx))});

  el.innerHTML = items.map((it,i)=>`<button type="button" class="su-ctxmenu-item ${it.kind?`is-${it.kind}`:''}" data-i="${i}">
    <span class="su-ctxmenu-item__label">${it.t}</span>
    ${it.d?`<span class="su-ctxmenu-item__desc">${it.d}</span>`:''}
  </button>`).join('');
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
