/* history-external-state.js: rebuilt from v127 history.js */
window.histExtSetSource = function(v){
  const st=_histExtLoad();
  const next={...st, sourceSel:String(v||'')};
  _histExtSave(next);
  try{
    window.histExtResetUI && window.histExtResetUI();
  }catch(e){
    console.warn('[histExtSetSource] UI 초기화 실패:', e.message);
  }
  try{
    _histExtRenderTable(_histExtGetViewItems());
  }catch(e){
    console.error('[histExtSetSource] 테이블 렌더링 실패:', e.message);
  }
};
window.histExtResetUI = function(){
  try{
    window._histExtSel = new Set();
  }catch(e){
    console.warn('[histExtResetUI] 선택 초기화 실패:', e.message);
  }
  window._histExtPage = 1;
};
window.histExtSetKeyword = function(v){
  const st=_histExtLoad();
  const kw=String(v||'').trim();
  const next={...st, keyword:kw};
  _histExtSave(next);
  try{
    window.histExtResetUI && window.histExtResetUI();
  }catch(e){
    console.warn('[histExtSetKeyword] UI 초기화 실패:', e.message);
  }
  try{
    _histExtRenderTable(_histExtGetViewItems());
  }catch(e){
    console.error('[histExtSetKeyword] 테이블 렌더링 실패:', e.message);
  }
};
window.histExtClearKeyword = function(){
  try{
    const el=document.getElementById('hist-ext-keyword');
    if(el) el.value='';
  }catch(e){
    console.warn('[histExtClearKeyword] 키워드 필드 초기화 실패:', e.message);
  }
  window.histExtSetKeyword('');
};
window.histExtToggleSel = function(key){
  const sel = window._histExtSel || (window._histExtSel=new Set());
  if(sel.has(key)) sel.delete(key); else sel.add(key);
  try{
    _histExtRenderTable(_histExtGetViewItems());
  }catch(e){
    console.error('[histExtToggleSel] 테이블 렌더링 실패:', e.message);
  }
};
window.histExtSelPage = function(on){
  const items = _histExtGetViewItems();
  const page = window._histExtPage || 1;
  const start = (page-1)*_HIST_EXT_PAGE_SIZE;
  const slice = items.slice(start, start+_HIST_EXT_PAGE_SIZE);
  const sel = window._histExtSel || (window._histExtSel=new Set());
  slice.forEach(x=>{
    const k=_histExtKey(x);
    if(on) sel.add(k); else sel.delete(k);
  });
  try{
    _histExtRenderTable(items);
  }catch(e){
    console.error('[histExtSelPage] 테이블 렌더링 실패:', e.message);
  }
};
window.histExtPageTo = function(p){
  const items = _histExtGetViewItems();
  const total = Math.max(1, Math.ceil(items.length/_HIST_EXT_PAGE_SIZE));
  const np = Math.max(1, Math.min(total, parseInt(p,10)||1));
  window._histExtPage = np;
  try{
    _histExtRenderTable(items);
  }catch(e){
    console.error('[histExtPageTo] 테이블 렌더링 실패:', e.message);
  }
};
window.histExtCopySelected = async function(){
  const items = _histExtGetViewItems();
  const sel = window._histExtSel || new Set();
  const picked = items.filter(x=>sel.has(_histExtKey(x)));
  if(!picked.length){
    alert('선택된 행이 없습니다');
    return;
  }
  const tsv=picked.map(x=>[x.date,x.winner,x.loser,x.map,x.elo,x.type,x.memo].join('\t')).join('\n');
  try{
    await navigator.clipboard.writeText(tsv);
    alert('선택 복사됨');
  }catch(e){
    console.error('[histExtCopySelected] 클립보드 복사 실패:', e.message);
    alert('복사 실패: 브라우저 권한 문제일 수 있어요.');
  }
};
window.histExtPasteFromClipboard = async function(){
  try{
    const t = await navigator.clipboard.readText();
    const ta = document.getElementById('hist-ext-raw');
    if(ta) ta.value = t || '';
    histExtParseAndRender();
  }catch(e){
    alert('클립보드 읽기 실패: 브라우저 권한(HTTPS/사용자 허용) 문제일 수 있어요.');
  }
};

// 붙여넣기 입력칸(외부탭) 내용을 선택한 저장대상 자동인식 모달로 전송
window.histExtInputToPasteModal = function(){
  const raw = (document.getElementById('hist-ext-raw')?.value || '').trim();
  if(!raw){
    alert('붙여넣기 내용이 없습니다');
    return;
  }
  const target = (document.getElementById('hist-ext-target')?.value || '').trim();
  if(!target){
    alert('저장 대상(미니/개인전 등)을 먼저 선택해주세요');
    return;
  }
  _histExtTargetSave(target);
  // (요청사항) 외부탭에서 자동인식 모달로 넘어가도, 저장 후 외부탭 화면이 리셋되지 않게
  try{ window._pasteFromHistExt = true; }catch(e){}
  try{
    if(target==='ind' && typeof openIndPasteModal==='function') openIndPasteModal();
    else if(target==='gj' && typeof openGJPasteModal==='function') openGJPasteModal();
    else if(target==='ck' && typeof openCKPasteModal==='function') openCKPasteModal();
    else if(target==='univm' && typeof openUnivmPasteModal==='function') openUnivmPasteModal();
    else if(target==='tt' && typeof openTTPasteModal==='function') openTTPasteModal();
    else if(target==='comp' && typeof openCompPasteModal==='function') openCompPasteModal();
    else if(typeof openMiniPasteModal==='function') openMiniPasteModal();
  }catch(e){}
  setTimeout(()=>{
    try{
      const ta = document.getElementById('paste-input');
      if(ta) ta.value = raw;
      if(typeof pastePreview==='function') pastePreview();
    }catch(e){}
  }, 60);
};

