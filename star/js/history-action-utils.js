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
  const _itemStyle = (kind)=>{
    if(kind==='accent') return 'background:linear-gradient(180deg,rgba(124,58,237,.12),rgba(124,58,237,.05));box-shadow:inset 0 0 0 1px rgba(196,181,253,.42);';
    if(kind==='primary') return 'background:linear-gradient(180deg,rgba(255,255,255,.96),rgba(248,250,252,.96));box-shadow:inset 0 0 0 1px rgba(226,232,240,.95);';
    if(kind==='danger') return 'background:linear-gradient(180deg,rgba(255,255,255,.96),rgba(248,250,252,.94));';
    return 'background:linear-gradient(180deg,rgba(255,255,255,.94),rgba(248,250,252,.92));';
  };
  const _labelStyle = (kind)=>{
    if(kind==='accent') return 'color:#6d28d9;';
    if(kind==='danger') return 'color:#dc2626;';
    return 'color:#334155;';
  };
  const _descStyle = (kind)=>{
    if(kind==='accent') return 'color:#8b5cf6;';
    if(kind==='danger') return 'color:#b91c1c;';
    return 'color:#94a3b8;';
  };
  el.style.cssText='display:block;position:fixed;z-index:var(--z-dropdown);min-width:178px;max-width:min(270px,92vw);background:linear-gradient(180deg,rgba(250,251,255,.98),rgba(245,247,252,.98));border:1px solid #dfe5f1;border-radius:var(--r2);box-shadow:0 14px 34px rgba(15,23,42,.14),0 2px 8px rgba(15,23,42,.06);padding:7px;backdrop-filter:blur(10px)';
  el.innerHTML = list.map((it,i)=>`<button type="button" class="su-ctxmenu-item ${it.kind?`is-${it.kind}`:''}" data-i="${i}" style="width:100%;border:0;text-align:left;padding:11px 12px;border-radius:12px;cursor:pointer;display:flex;flex-direction:column;gap:3px;transition:background .14s ease,color .14s ease,transform .14s ease,box-shadow .14s ease;${_itemStyle(it.kind)}">
    <span class="su-ctxmenu-item__label" style="font-weight:900;line-height:1.25;${_labelStyle(it.kind)}">${it.t||`메뉴 ${i+1}`}</span>
    ${it.d?`<span class="su-ctxmenu-item__desc" style="font-size:10px;font-weight:800;line-height:1.3;${_descStyle(it.kind)}">${it.d}</span>`:''}
  </button>`).join('');
  setTimeout(()=>{
    try{
      el.querySelectorAll('button[data-i]').forEach(b=>{
        b.onmouseenter=()=>{ b.style.transform='translateY(-1px)'; b.style.boxShadow='inset 0 0 0 1px rgba(226,232,240,.98)'; };
        b.onmouseleave=()=>{ b.style.transform='translateY(0)'; b.style.boxShadow=(b.classList.contains('is-accent')?'inset 0 0 0 1px rgba(196,181,253,.42)':(b.classList.contains('is-primary')?'inset 0 0 0 1px rgba(226,232,240,.95)':'none')); };
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
  const o=opts||{};
  // 개인전 표기(alias)까지 포함해서 개인전/끝장전 계열은 항상 수정/삭제(그리고 가능하면 공유) 메뉴를 노출
  const _forcePersonal = ['ind','gj','progj','individual'].includes(String(o.mode||''));
  const _canShare = (o.canShare!==undefined && o.canShare!==null) ? !!o.canShare : (_forcePersonal ? true : false);
  const _canEdit = _forcePersonal ? true : !!o.canEdit;
  const _canDel = _forcePersonal ? true : !!o.canDel;
  const items=[];
  if(!o.hideDetail){
    items.push({t:'📂 상세 보기', d:'세트/경기 상세 열기', kind:'primary', on:()=>((typeof o.detailFn==='function') ? o.detailFn() : toggleDetail(o.key))});
  }
  if(_canShare) items.push({t:'🎴 공유카드', d:'공유용 카드 생성', kind:'accent', on:()=>{ if(typeof o.shareFn==='function') return o.shareFn(); if(window._openShareFromDetReg && o.key) return window._openShareFromDetReg(o.key); }});
  if(_canEdit) items.push({t:'✏️ 수정', d:'기록 내용 수정', kind:'normal', on:()=>((typeof o.editFn==='function') ? o.editFn() : openRE(o.mode,o.idx))});
  if(o.canMove) items.push({t:'↗ 이동', d:'다른 기록 분류로 이동', kind:'normal', on:()=>openMoveMatchPop(o._btnEl,o.mode,o.idx)});
  items.push({t:'📤 결과 복사', d:'점수와 결과 텍스트 복사', kind:'normal', on:()=>copyMatchResult(o.a,o.sa,o.b,o.sb,o.d,o.mode,o.idx)});
  if(_canDel) items.push({t:'🗑️ 삭제', d:'이 기록을 완전히 삭제', kind:'danger', on:()=>((typeof o.delFn==='function') ? o.delFn() : delRec(o.mode,o.idx,o.mid||o.matchId||o._id||''))});
  return openSimpleActionMenu(o._btnEl||null, items, ev);
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
  const _fn = (typeof window.buildPlayerDetailHTML==='function')
    ? window.buildPlayerDetailHTML
    : (typeof buildPlayerDetailHTML==='function' ? buildPlayerDetailHTML : null);
  document.getElementById('playerModalBody').innerHTML = _fn
    ? _fn(p)
    : `<div style="font-size:var(--fs-sm);color:var(--gray-l);padding:10px 0">스트리머 상세 렌더러가 아직 로드되지 않았습니다. 새로고침 후 다시 시도해주세요.</div>`;
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
