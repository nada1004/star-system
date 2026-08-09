/* ══════════════════════════════════════════════════════════════
   렌더캡처 - 로딩UI/폰트대기/기본 캡처 진입점 (render-capture-utils.js 에서 분리, 2026-07-30)
   ══════════════════════════════════════════════════════════════ */

/* ══════════════════════════════════════
   Render Capture Utilities
══════════════════════════════════════ */
function _showSaveLoading(){
  let t=document.getElementById('_save-toast');
  if(!t){
    t=document.createElement('div');
    t.id='_save-toast';
    t.style.cssText='position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:rgba(15,23,42,.88);color:#fff;padding:10px 22px;border-radius:24px;font-size:var(--fs-base);font-weight:700;z-index:99999;display:none;align-items:center;gap:8px;backdrop-filter:blur(6px);font-family:"Noto Sans KR",sans-serif;white-space:nowrap;box-shadow:0 4px 20px rgba(0,0,0,.3)';
    document.body.appendChild(t);
  }
  t.innerHTML='<span style="display:inline-block;animation:_spin .8s linear infinite">⏳</span> 저장 중...';
  t.style.display='flex';
  if(!document.getElementById('_spin-style')){
    const s=document.createElement('style');s.id='_spin-style';
    s.textContent='@keyframes _spin{to{transform:rotate(360deg)}}';
    document.head.appendChild(s);
  }
}
function _hideSaveLoading(){
  const t=document.getElementById('_save-toast');
  if(t) t.style.display='none';
}

/* html2canvas는 캡처 대상을 별도 iframe 문서로 복제(clone)한 뒤 그 복제본을 그리는데,
   복제 과정에서 요소가 새로 DOM에 삽입되는 셈이 되어 CSS keyframe 등장 애니메이션
   (예: 카드 fade-up)이 처음부터 다시 재생된다. html2canvas는 이 재생이 끝나길
   기다리지 않고 거의 즉시 스냅샷을 뜨기 때문에, 애니메이션 중간(투명도 낮음·위치 이동 중)
   상태가 그대로 캡처되어 글자/카드가 겹쳐 보이거나 흐릿하게 번지는 현상이 생긴다.
   복제 문서 전체에 애니메이션·트랜지션을 강제로 끄는 스타일을 주입해 방지한다. */
function _killCloneAnimations(clonedDoc){
  if(!clonedDoc) return;
  const s = clonedDoc.createElement('style');
  s.textContent = `*, *::before, *::after {
    animation-play-state: paused !important;
    animation-delay: 0s !important;
    animation-duration: 0s !important;
    transition-duration: 0s !important;
    transition-delay: 0s !important;
  }`;
  (clonedDoc.head || clonedDoc.documentElement).appendChild(s);
}
/* 웹폰트(Noto Sans/Serif KR)가 브라우저에 완전히 로드되기 전에 html2canvas가
   먼저 캡처해버리면, 대체 폰트로 그려지거나 폰트 교체 도중 상태가 찍혀서
   글자 획이 겹치거나 색이 번져 보이는("글자 깨짐") 현상이 생긴다.
   캡처 직전에 document.fonts.ready를 짧은 타임아웃과 함께 기다려서 방지한다. */
async function _waitForFonts(timeoutMs){
  timeoutMs = timeoutMs || 2000;
  try{
    if(!document.fonts || !document.fonts.ready) return;
    await Promise.race([
      document.fonts.ready,
      new Promise(res => setTimeout(res, timeoutMs))
    ]);
    // 폰트가 늦게 붙는 환경 대비, ready 이후에도 한 프레임 더 그리도록 소폭 대기
    await new Promise(res => setTimeout(res, 50));
  }catch(e){}
}

async function capturePlayerModal(){
  const body=document.getElementById('playerModalBody');
  if(!body){alert('캡처할 영역이 없습니다.');return;}
  const st = (typeof getPlayerDetailState==='function') ? getPlayerDetailState() : (window.PlayerDetailState||{});
  try{
    _showSaveLoading();
    try{ await (window.ensureHtml2Canvas && window.ensureHtml2Canvas()); }catch(e){}
    await _imgToDataUrls(body);
    try{ if(typeof _waitForImages==='function') await _waitForImages(body,1500); }catch(e){}
    try{ await _waitForFonts(2000); }catch(e){}
    const canvas=await html2canvas(body,{backgroundColor:'#ffffff',scale:2,useCORS:true,allowTaint:false,logging:false,imageTimeout:15000,onclone:(d)=>{try{_killCloneAnimations(d);}catch(e){}}});
    await _saveCanvasImage(canvas,`${st.currentName||'player'}_stat.png`,'png');
  }catch(e){alert('이미지 저장 오류: '+e.message);}
  finally{_hideSaveLoading();}
}

async function captureUnivModal(){
  const body=document.getElementById('univModalBody');
  const title=document.getElementById('univModalTitle');
  if(!body){alert('캡처할 영역이 없습니다.');return;}
  try{
    _showSaveLoading();
    try{ await (window.ensureHtml2Canvas && window.ensureHtml2Canvas()); }catch(e){}
    await _imgToDataUrls(body);
    try{ if(typeof _waitForImages==='function') await _waitForImages(body,1500); }catch(e){}
    try{ await _waitForFonts(2000); }catch(e){}
    const canvas=await html2canvas(body,{backgroundColor:'#ffffff',scale:2,useCORS:true,allowTaint:false,logging:false,imageTimeout:15000,onclone:(d)=>{try{_killCloneAnimations(d);}catch(e){}}});
    await _saveCanvasImage(canvas,`${title?title.innerText.replace('🏛️ ',''):'univ'}_대학정보.png`,'png');
  }catch(e){alert('이미지 저장 오류: '+e.message);}
  finally{_hideSaveLoading();}
}

async function captureDetail(id, filename){
  const el=document.getElementById(id);
  if(!el){alert('캡처할 영역이 없습니다.');return;}
  try{
    _showSaveLoading();
    try{ await (window.ensureHtml2Canvas && window.ensureHtml2Canvas()); }catch(e){}
    await _imgToDataUrls(el);
    try{ if(typeof _waitForImages==='function') await _waitForImages(el,1500); }catch(e){}
  try{ await _waitForFonts(2000); }catch(e){}
    const canvas=await html2canvas(el,{backgroundColor:'#ffffff',scale:2,useCORS:true,allowTaint:false,logging:false,imageTimeout:15000,onclone:(d)=>{try{_killCloneAnimations(d);}catch(e){}}});
    await _saveCanvasImage(canvas,`경기상세_${filename}.png`,'png');
  }catch(e){alert('이미지 저장 오류: '+e.message);}
  finally{_hideSaveLoading();}
}

function _getBriefingExportMeta(){
  const presetMap={
    thisWeek:'이번주',
    lastWeek:'지난주',
    thisMonth:'이번달',
    lastMonth:'지난달',
    custom:'기간'
  };
  const _now=new Date();
  const issueDate=_now.toISOString().slice(0,10).replace(/-/g,'.');
  const _weekdayKr=['일','월','화','수','목','금','토'][_now.getDay()];
  const issueDateFull=`${issueDate} (${_weekdayKr})`;
  const presetKey=String(window._b2WeeklyPreset||'thisWeek');
  const presetLabel=presetMap[presetKey]||'브리핑';
  const from=String(window._b2WeeklyDateFrom||'').slice(0,10).replace(/-/g,'.');
  const to=String(window._b2WeeklyDateTo||'').slice(0,10).replace(/-/g,'.');
  const univ=String(window._b2WeeklyUniv||'전체').trim()||'전체';
  return { issueDate, issueDateFull, presetKey, presetLabel, from, to, univ };
}

// color-mix()/color() 등 html2canvas가 못 읽는 함수를, 브라우저 자신의 canvas 2D 색상
// 파서에 맡겨 실제 계산된 legacy rgb()/hex 값으로 정확히 치환한다. 캔버스 fillStyle은
// 브라우저가 이해하는 어떤 CSS <color> 문법이든(color-mix, oklch, oklab, lab, color() 등)
// 항상 sRGB 8bit "rgb()"/"#hex" 문자열로 정규화해 돌려주는 스펙 특성을 이용한 것으로,
// 우리가 직접 색상 수식을 재구현하는 것보다 훨씬 정확하고 안전하다.
var _colorProbeCtx=null;
