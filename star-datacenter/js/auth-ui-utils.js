/* ══════════════════════════════════════════════════════════════
   인증 - UI 유틸(헤더검색/다크모드/결과복사/토스트) (auth.js 에서 분리, 2026-07-30)
   ══════════════════════════════════════════════════════════════ */

/* ══ 모바일 헤더 검색 토글 ══ */
function toggleHdrSearch(){
  const wrap = document.getElementById('hdrSearchWrap');
  const input = document.getElementById('globalSearch');
  if(!wrap) return;
  wrap.classList.toggle('open');
  if(wrap.classList.contains('open')){
    input.style.cssText = 'width:140px!important;opacity:1!important;pointer-events:auto!important;position:relative!important;padding:5px 10px!important;font-size:var(--fs-sm)!important;border-radius:20px;border:1px solid rgba(255,255,255,.3);background:rgba(255,255,255,.15);color:#fff;outline:none;';
    setTimeout(()=>input.focus(), 50);
    input.onblur = ()=>{ if(!input.value){ wrap.classList.remove('open'); input.style.cssText=''; } };
  } else {
    input.style.cssText = '';
    input.value = '';
    onGlobalSearch('');
  }
}
/* 상단(헤더) 다크/로그인 버튼: 아이콘 전용 + 크기 최소화 */
(function(){
  function fixHdrBtns(){
    const dk = document.getElementById('darkToggleBtn');
    const isDark = document.body.classList.contains('dark');
    if(dk){
      dk.innerHTML = isDark ? '☀️' : '🌙';
      dk.setAttribute('title', isDark ? '라이트 모드' : '다크 모드');
      dk.setAttribute('aria-label', isDark ? '라이트 모드로 전환' : '다크 모드로 전환');
    }
    const li = document.getElementById('hdrLoginBtn');
    if(li){
      li.innerHTML = '🔐';
      li.setAttribute('title', '로그인');
      li.setAttribute('aria-label', '로그인');
    }
    const lo = document.getElementById('hdrLogoutBtn');
    if(lo){
      lo.innerHTML = '🔓';
      lo.setAttribute('title', '로그아웃');
      lo.setAttribute('aria-label', '로그아웃');
    }
  }
  window.addEventListener('resize', fixHdrBtns);
  document.addEventListener('DOMContentLoaded', fixHdrBtns);
  setTimeout(fixHdrBtns, 100);
  window._fixHdrBtns = fixHdrBtns;
})();

function toggleDark(){
  const isDark=document.body.classList.toggle('dark');
  localStorage.setItem('su_dark',isDark?'1':'');
  if(window._fixHdrBtns) window._fixHdrBtns(); else document.getElementById('darkToggleBtn').textContent=isDark?'☀️ 라이트':'🌙 다크';
  // 다크 전환 시 테마 변수 재적용(다크 모드에서는 accent만 적용)
  try{
    window._applyThemeVars && window._applyThemeVars();
  }catch(e){
    console.warn('[toggleDark] 테마 변수 재적용 실패:', e.message);
  }
  // [DARKFIX] 스트리머탭/현황판탭 등 일부 카드(프로필 사진 배경, 이름 영역)는
  // 렌더링 시점에 document.body.classList.contains('dark')를 직접 검사해 색을 계산함(_b2PastelBg 등).
  // 이런 값은 CSS 변수가 아니라 순수 JS 계산값이라 body.dark 클래스만 토글해서는 갱신되지 않고,
  // 다른 이유로 다시 렌더링되기 전까지 이전 모드의 색이 그대로 남아있었음(= "다크모드 안 됨"으로 보임).
  // 토글 즉시 현재 탭을 강제로 재렌더링해서 바로 반영되게 함.
  try{
    if(typeof window.render==='function') window.render(true);
  }catch(e){
    console.warn('[toggleDark] 재렌더링 실패:', e.message);
  }
}

/* ── 클립보드 복사 유틸 ── */
function copyMatchResult(a, sa, b, sb, date, mode, idx){
  const winner=sa>sb?a:sb>sa?b:'무승부';
  const lines=[];
  lines.push(`📋 경기 결과 [${date||'날짜미상'}]`);
  lines.push(`${a} ${sa} : ${sb} ${b}${winner!=='무승부'?' → '+winner+' 승':' → 무승부'}`);

  // 세트/게임 상세 내역 추가
  let m=null;
  if(mode==='mini'&&idx!=null&&idx!=='null') m=miniM[idx];
  else if(mode==='univm'&&idx!=null&&idx!=='null') m=univM[idx];
  else if(mode==='ck'&&idx!=null&&idx!=='null') m=ckM[idx];
  else if(mode==='pro'&&idx!=null&&idx!=='null') m=proM[idx];
  else if(mode==='comp'&&idx!=null&&idx!=='null') m=comps[idx];

  if(m&&m.sets&&m.sets.length){
    lines.push('');
    const isCK=(mode==='ck'||mode==='pro'||mode==='tt');
    m.sets.forEach((set,si)=>{
      const sLabel=si===2?'에이스전':`${si+1}세트`;
      const sA=set.scoreA||0,sB=set.scoreB||0;
      const sw=sA>sB?a:sB>sA?b:'무승부';
      lines.push(`[${sLabel}] ${a} ${sA}:${sB} ${b}${sw!=='무승부'?' ('+sw+')':''}`);
      if(set.games&&set.games.length){
        set.games.forEach((g,gi)=>{
          if(!g.playerA&&!g.playerB)return;
          const wn=g.winner==='A'?g.playerA:g.winner==='B'?g.playerB:'';
          const mapStr=g.map&&g.map!=='-'?` | ${g.map}`:'';
          lines.push(`  경기${gi+1}: ${g.playerA||'?'} vs ${g.playerB||'?'}${wn?' → '+wn+' 승':''}${mapStr}`);
        });
      }
    });
  }

  const text=lines.join('\n');
  navigator.clipboard.writeText(text).then(()=>{
    showToast('📋 상세 결과 복사됐습니다!');
  }).catch(()=>{
    try{
      const ta=document.createElement('textarea');
      ta.value=text;ta.style.cssText='position:fixed;top:-9999px;left:-9999px';
      document.body.appendChild(ta);ta.focus();ta.select();
      const ok=document.execCommand('copy');
      document.body.removeChild(ta);
      if(ok)showToast('📋 복사됐습니다!');
      else showToast('❌ 복사 실패 — 직접 선택 후 복사해 주세요.',3500);
    }catch(e2){
      showToast('❌ 복사를 지원하지 않는 브라우저입니다.',3500);
    }
  });
}

/* ── 토스트 알림 ── */
function showToast(msg, duration=2000){
  let t=document.getElementById('_toast');
  if(!t){
    t=document.createElement('div');t.id='_toast';
    t.style.cssText='position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:#1e293b;color:#fff;padding:9px 20px;border-radius:20px;font-size:var(--fs-base);font-weight:600;z-index:9999;pointer-events:none;opacity:0;transition:opacity .2s;font-family:"Noto Sans KR",sans-serif;box-shadow:0 4px 16px rgba(0,0,0,.25)';
    document.body.appendChild(t);
  }
  t.textContent=msg;
  t.style.opacity='1';
  clearTimeout(t._tid);
  t._tid=setTimeout(()=>{t.style.opacity='0';},duration);
}
function initDark(){
  if(localStorage.getItem('su_dark')==='1'){
    document.body.classList.add('dark');
  }
  // 초기화 후 버튼 텍스트 설정 (모바일/PC 자동 대응)
  setTimeout(()=>{ if(window._fixHdrBtns) window._fixHdrBtns(); }, 50);
}

/* ── [FIX-3] 인증 상태 단일 진실 공급원 헬퍼 ──
   render-nav-lazy.js의 sw()와 다른 모든 파일에서
   window.isLoggedIn / lexical isLoggedIn / localStorage 3중 체크 대신
   이 함수 하나만 사용한다.
*/
window.getIsLoggedIn = function(){
  try{
    if(localStorage.getItem('su_session') !== '1') return false;
    return !!(typeof isLoggedIn !== 'undefined' ? isLoggedIn : window.isLoggedIn);
  }catch(e){
    return false;
  }
};
