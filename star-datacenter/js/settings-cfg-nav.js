/* ══════════════════════════════════════════════════════════════
   설정 - 카테고리 이동/네비게이션 (settings-cfg-apply.js 에서 분리, 2026-07-30)
   ══════════════════════════════════════════════════════════════ */

function _cfgApplyCat(cat, autoGo=true){
  window._cfgCat=cat;
  const show=_catSecs[cat]||[];
  let _bottomOpen = true;
  try{
    const mode=(localStorage.getItem('su_cfg_view_mode')||'basic')==='advanced' ? 'advanced' : 'basic';
    const saved=localStorage.getItem('su_cfg_bottom_open');
    _bottomOpen = window._cfgBottomSectionsOpen===undefined
      ? ((saved==='1' || saved==='0') ? (saved==='1') : false)
      : !!window._cfgBottomSectionsOpen;
  }catch(e){}
  // 섹션 표시/숨김
  try{
    const secs=document.querySelectorAll('[data-cfg-sec]');
    for(let i=0;i<secs.length;i++){
      const el=secs[i];
      // 모달에 올라간 섹션은 숨기지 않음
      try{ if(el.closest && el.closest('#cfgModalBody')) continue; }catch(e){}
      const id=el.getAttribute('data-cfg-sec');
      const vis=_bottomOpen && (show.indexOf(id)!==-1);
      el.style.display=vis?'':'none';
      if(el.tagName==='DETAILS') el.open=false;
    }
  }catch(e){}
  // 카테고리 버튼 스타일 업데이트 (초기 렌더 인라인 스타일은 1회성이라 JS로 재적용)
  try{
    const pills=document.querySelectorAll('.cfg-cat-pill');
    for(let i=0;i<pills.length;i++){
      const btn=pills[i];
      const on=(btn.getAttribute('data-cat')===cat);
      btn.classList.toggle('on', on);
      btn.style.borderColor = on ? 'var(--blue)' : 'var(--border)';
      // (요청사항) 비활성 배경의 회색 제거
      btn.style.background  = on ? 'var(--blue)' : 'transparent';
      btn.style.fontWeight  = on ? '800' : '700';
      btn.style.color       = on ? '#fff' : 'var(--text)';
    }
  }catch(e){}
  try{
    const btns=document.querySelectorAll('[data-cfg-cat]');
    for(let i=0;i<btns.length;i++){
      const btn=btns[i];
      const on=(btn.getAttribute('data-cfg-cat')===cat);
      if (btn.classList.contains('cfg-cat-tile')) {
        btn.style.background = on ? 'linear-gradient(180deg,rgba(79,70,229,.08),rgba(255,255,255,.98))' : 'var(--white)';
        btn.style.color = 'var(--text2)';
        btn.style.borderColor = on ? 'rgba(79,70,229,.30)' : 'var(--border)';
        btn.style.boxShadow = on ? '0 10px 24px rgba(79,70,229,.12)' : '0 4px 12px rgba(15,23,42,.04)';
        const bar = btn.firstElementChild;
        if(bar) bar.style.background = on ? '#4f46e5' : 'transparent';
        const count = btn.querySelector('span[style*="border-radius:99px"]');
        if (count) {
          count.style.color = on ? '#4338ca' : 'var(--gray-l)';
          count.style.background = on ? 'rgba(79,70,229,.10)' : 'var(--surface)';
          count.style.borderColor = on ? 'rgba(79,70,229,.18)' : 'var(--border)';
        }
        const titleEl = btn.querySelectorAll('div')[1];
        if (titleEl) titleEl.style.color = 'var(--text2)';
      } else {
        btn.style.background = on ? 'linear-gradient(135deg,var(--blue),#7c3aed)' : 'var(--white)';
        btn.style.color = on ? '#fff' : 'var(--text2)';
        btn.style.borderColor = on ? 'transparent' : 'var(--border)';
        btn.style.boxShadow = on ? '0 10px 24px rgba(37,99,235,.22)' : '0 4px 12px rgba(15,23,42,.04)';
      }
      const desc=btn.querySelector('[data-cfg-cat-desc]');
      if(desc) desc.style.opacity = on ? '.9' : '.72';
    }
    document.querySelectorAll('[data-cfg-cur-cat-label]').forEach(el=>{ el.textContent = `현재: ${_catLabel(cat)}`; });
    document.querySelectorAll('[data-cfg-cur-cat-desc]').forEach(el=>{ el.textContent = `${_catLabel(cat)} 안의 세부 메뉴를 버튼으로 바로 엽니다.`; });
    document.querySelectorAll('[data-cfg-cur-sec-buttons]').forEach(secWrap=>{
      const titleMap=window._cfgSecTitle||{};
      secWrap.innerHTML = show.map(id=>{
        const title=titleMap[id]||id;
        return `<button type="button" class="btn btn-w no-export" onclick="cfgGo('${id}')" style="display:flex;align-items:center;gap:8px;padding:10px 12px;border-radius:14px;text-align:left;background:var(--white);justify-content:flex-start">
          <span style="font-size:var(--fs-md);line-height:1">${String(title).match(/^[^\s]+/)?.[0]||'⚙️'}</span>
          <span style="font-size:var(--fs-sm);font-weight:800;color:var(--text2);min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${title.replace(/^[^\s]+\s*/,'')}</span>
        </button>`;
      }).join('');
    });
  }catch(e){}
  if(autoGo){
    const first=show[0];
    if(first) setTimeout(()=>_cfgGo(first),0);
  }
}

// 함수를 window 객체에 할당 (인라인 onclick에서 사용)
window._cfgGo = _cfgGo;
window._cfgApplyCat = _cfgApplyCat;
// (버그수정) render-nav-lazy.js에서 _lazyCfgGo를 참조하지만 미정의 상태.
// cfgGo로 위임하는 alias 추가.
window._lazyCfgGo = function(secId){ return _cfgGo(secId); };
// 인라인 onclick에서 try/catch로 에러를 숨기지 않기 위해 단순 래퍼 제공
window.cfgGo = function(secId){ return _cfgGo(secId); };
// (요청사항) 카테고리 클릭 시 해당 카테고리 "메뉴만" 보여주고 자동으로 모달을 띄우지 않음
