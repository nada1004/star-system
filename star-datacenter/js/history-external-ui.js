/* ══════════════════════════════════════
   대전 기록 > 외부 / 외부2 / 외부3 UI 컨트롤러
   - 저장/파싱 유틸은 history-external-utils.js 사용
══════════════════════════════════════ */

window.histExtSetSource = function(v){
  const st=_histExtLoad();
  const next={...st, sourceSel:String(v||'')};
  _histExtSave(next);
  try{ window.histExtResetUI && window.histExtResetUI(); }catch(e){ console.warn('[histExtSetSource] UI 초기화 실패:', e.message); }
  try{ _histExtRenderTable(_histExtGetViewItems()); }catch(e){ console.error('[histExtSetSource] 테이블 렌더링 실패:', e.message); }
};
window.histExtResetUI = function(){
  try{ window._histExtSel = new Set(); }catch(e){ console.warn('[histExtResetUI] 선택 초기화 실패:', e.message); }
  window._histExtPage = 1;
};
window.histExtSetKeyword = function(v){
  const st=_histExtLoad();
  const kw=String(v||'').trim();
  const next={...st, keyword:kw};
  _histExtSave(next);
  try{ window.histExtResetUI && window.histExtResetUI(); }catch(e){ console.warn('[histExtSetKeyword] UI 초기화 실패:', e.message); }
  try{ _histExtRenderTable(_histExtGetViewItems()); }catch(e){ console.error('[histExtSetKeyword] 테이블 렌더링 실패:', e.message); }
};
window.histExtClearKeyword = function(){
  try{
    const el=document.getElementById('hist-ext-keyword');
    if(el) el.value='';
  }catch(e){ console.warn('[histExtClearKeyword] 키워드 필드 초기화 실패:', e.message); }
  window.histExtSetKeyword('');
};
window.histExtToggleSel = function(key){
  const sel = window._histExtSel || (window._histExtSel=new Set());
  if(sel.has(key)) sel.delete(key); else sel.add(key);
  try{ _histExtRenderTable(_histExtGetViewItems()); }catch(e){ console.error('[histExtToggleSel] 테이블 렌더링 실패:', e.message); }
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
  try{ _histExtRenderTable(items); }catch(e){ console.error('[histExtSelPage] 테이블 렌더링 실패:', e.message); }
};
window.histExtPageTo = function(p){
  const items = _histExtGetViewItems();
  const total = Math.max(1, Math.ceil(items.length/_HIST_EXT_PAGE_SIZE));
  const np = Math.max(1, Math.min(total, parseInt(p,10)||1));
  window._histExtPage = np;
  try{ _histExtRenderTable(items); }catch(e){ console.error('[histExtPageTo] 테이블 렌더링 실패:', e.message); }
};
window.histExtCopySelected = async function(){
  const items = _histExtGetViewItems();
  const sel = window._histExtSel || new Set();
  const picked = items.filter(x=>sel.has(_histExtKey(x)));
  if(!picked.length){ alert('선택된 행이 없습니다'); return; }
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

window.histExtInputToPasteModal = function(){
  const raw = (document.getElementById('hist-ext-raw')?.value || '').trim();
  if(!raw){ alert('붙여넣기 내용이 없습니다'); return; }
  const target = (document.getElementById('hist-ext-target')?.value || '').trim();
  if(!target){ alert('저장 대상(미니/개인전 등)을 먼저 선택해주세요'); return; }
  _histExtTargetSave(target);
  try{ window._pasteFromHistExt = true; }catch(e){}
  _histOpenPasteModalByTarget(target);
  _histFillPasteModalByTarget(target, raw);
};

function _histOpenPasteModalByTarget(target){
  try{
    if(target==='ind' && typeof openIndPasteModal==='function') openIndPasteModal();
    else if(target==='pro' && typeof openProPasteModal==='function') openProPasteModal();
    else if(target==='progj' && typeof openGJProPasteModal==='function') openGJProPasteModal();
    else if(target==='gj' && typeof openGJPasteModal==='function') openGJPasteModal();
    else if(target==='ck' && typeof openCKPasteModal==='function') openCKPasteModal();
    else if(target==='univm' && typeof openUnivmPasteModal==='function') openUnivmPasteModal();
    else if(target==='tt-general' && typeof openTTPasteModal==='function'){ try{ localStorage.setItem('su_tt_paste_stage','general'); }catch(e){} openTTPasteModal(); }
    else if(target==='tt-league' && typeof openTTPasteModal==='function'){ try{ localStorage.setItem('su_tt_paste_stage','league'); }catch(e){} openTTPasteModal(); }
    else if(target==='tt-bkt' && typeof openTTPasteModal==='function'){ try{ localStorage.setItem('su_tt_paste_stage','bkt'); }catch(e){} openTTPasteModal(); }
    else if(target==='tt' && typeof openTTPasteModal==='function') openTTPasteModal();
    else if(target==='comp' && typeof openCompPasteModal==='function') openCompPasteModal();
    else if(/^procomp-/.test(String(target||'')) && typeof window._histExtOpenProCompStagePaste==='function') window._histExtOpenProCompStagePaste(target);
    else if(typeof openMiniPasteModal==='function') openMiniPasteModal();
  }catch(e){}
}
function _histFillPasteModalByTarget(target, payload){
  const t = String(target||'').trim();
  const txt = String(payload||'');
  setTimeout(()=>{
    try{
      if(t === 'pro'){
        const ta = document.getElementById('pro-paste-input');
        if(ta) ta.value = txt;
        if(typeof proPreview === 'function') proPreview();
        return;
      }
      if(/^procomp-/.test(t)){
        const ta = document.getElementById('_pcStageBulkText');
        if(ta) ta.value = txt;
        return;
      }
      const ta = document.getElementById('paste-input') || document.getElementById('_pasteText') || document.getElementById('_ttPasteText');
      if(ta) ta.value = txt;
      if(typeof pastePreview === 'function') pastePreview();
    }catch(e){}
  }, 60);
}
function _histExtTargetToPasteMode(target){
  const t = String(target||'').trim();
  if(t==='pro') return 'pro';
  if(t==='progj') return 'progj';
  if(t==='tt-general' || t==='tt-league' || t==='tt-bkt') return 'tt';
  if(/^procomp-/.test(t)) return 'ind';
  return t || 'mini';
}
function _histGetCurrentProCompTourney(){
  try{
    const list = Array.isArray(proTourneys) ? proTourneys : [];
    return list.find(t=>t && t.name===curProComp) || list[0] || null;
  }catch(e){
    return null;
  }
}
function _histMapProCompTargetToRound(target){
  const t = String(target||'').trim();
  if(t==='procomp-64') return '64강';
  if(t==='procomp-32') return '32강';
  if(t==='procomp-16') return '16강';
  if(t==='procomp-8') return '8강';
  if(t==='procomp-4') return '4강';
  if(t==='procomp-final') return '결승';
  return '';
}
function _histExtRowsToSimpleWinnerLoserLines(items){
  return (items||[]).map(x=>{
    const w = _histExtToPasteName(x.winner);
    const l = _histExtToPasteName(x.loser);
    const mp = (x.map||'').trim();
    return [w, l, mp].filter(Boolean).join(' ').trim();
  }).filter(Boolean).join('\n');
}
window._histExtOpenProCompStagePaste = function(target){
  const tn = _histGetCurrentProCompTourney();
  const round = _histMapProCompTargetToRound(target);
  if(!tn){ alert('현재 선택된 프로리그 대회가 없습니다. 먼저 프로리그 대회 탭에서 대회를 선택해주세요.'); return false; }
  if(!round){ alert('프로리그 대회 라운드 선택이 올바르지 않습니다.'); return false; }
  if(typeof openPcStageBulkPasteModal !== 'function'){ alert('프로리그 대회 붙여넣기 모달을 열 수 없습니다.'); return false; }
  window._pcStageRecRound = round;
  openPcStageBulkPasteModal(tn.id, round);
  return true;
};
function _histExtRowsToPasteLines(items, target){
  const pasteMode = _histExtTargetToPasteMode(target);
  return (items||[]).map(x=>{
    const d = (x.date||'').trim();
    const w = _histExtToPasteName(x.winner);
    const l = _histExtToPasteName(x.loser);
    const mp = (x.map||'-').trim();
    const memo = String(x.memo||'').replace(/\t+/g,' ').replace(/\r?\n/g,' ').trim();
    return `${d} ${w}\t${l}\t${mp}\t승\t${pasteMode}${memo?`\t${memo}`:''}`;
  }).join('\n');
}
function _histExtRawToPastePayload(raw, target){
  const txt = String(raw||'').trim();
  if(!txt) return '';
  const htmlRows = _histExtParseHTMLTable(txt);
  if(htmlRows && htmlRows.length){
    const parsed = _histExtMapRows(htmlRows);
    if(parsed && parsed.length) return _histExtRowsToPasteLines(parsed, target);
  }
  const textRows = _histExtParseTextTable(txt);
  if(textRows && textRows.length){
    const parsed = _histExtMapRows(textRows);
    if(parsed && parsed.length) return _histExtRowsToPasteLines(parsed, target);
  }
  const lines = txt.split(/\r?\n/).map(v=>v.trim()).filter(Boolean);
  const simple = [];
  for(const line of lines){
    const cols = line.split(/\s{2,}|\t+/).map(v=>v.trim()).filter(Boolean);
    if(cols.length >= 4){
      const d = _histExtNormDate(cols[0]);
      if(d){
        simple.push({
          date: d,
          winner: cols[1] || '',
          loser: cols[2] || '',
          map: cols[3] || '-',
          elo: cols[4] || '',
          type: cols[5] || '',
          memo: cols.slice(6).join(' ') || ''
        });
      }
    }
  }
  if(simple.length) return _histExtRowsToPasteLines(simple, target);
  return txt;
}
window.histExt2SendRawToPasteModal = function(){
  const raw = (document.getElementById('hist-ext2-raw')?.value || '').trim();
  if(!raw){ alert('붙여넣기 내용이 없습니다'); return; }
  const target = (document.getElementById('hist-ext2-target')?.value || '').trim();
  if(!target){ alert('저장 대상(미니/개인전 등)을 먼저 선택해주세요'); return; }
  _histExtTargetSave(target);
  if(/^procomp-/.test(target)){
    const ok = window._histExtOpenProCompStagePaste && window._histExtOpenProCompStagePaste(target);
    if(!ok) return;
    const htmlRows = _histExtParseHTMLTable(raw);
    const textRows = _histExtParseTextTable(raw);
    const payload =
      (htmlRows && htmlRows.length ? _histExtRowsToSimpleWinnerLoserLines(_histExtMapRows(htmlRows)||[]) : '') ||
      (textRows && textRows.length ? _histExtRowsToSimpleWinnerLoserLines(_histExtMapRows(textRows)||[]) : '') ||
      raw;
    _histFillPasteModalByTarget(target, payload);
    return;
  }
  try{ window._pasteFromHistExt = true; }catch(e){}
  _histOpenPasteModalByTarget(target);
  const payload = _histExtRawToPastePayload(raw, target);
  _histFillPasteModalByTarget(target, payload);
};
window.histExt2PasteFromClipboard = async function(){
  try{
    const t = await navigator.clipboard.readText();
    const ta = document.getElementById('hist-ext2-raw');
    if(ta) ta.value = t || '';
  }catch(e){
    alert('클립보드 읽기 실패: 브라우저 권한(HTTPS/사용자 허용) 문제일 수 있어요.');
  }
};

function _histExtToPasteName(s){
  let t = String(s||'').trim();
  t = t.replace(/^(?:메모|비고|memo)\s*[:：]\s*/i,'').trim();
  t = t.replace(/^(승|패)\s+/,'').trim();
  t = t.replace(/[✅❌⭕⬜🆚🌐⭐★■□●○◆◇]/g,'').trim();
  t = t.replace(/\s*\((?:[PTZN]|테란|저그|프로토스|토스|Terran|Zerg|Protoss)\)\s*$/i,'').trim();
  const m = t.match(/^(.+?)\s+([PTZN])$/i);
  if(m) t = `${m[1].trim()} (${m[2].toUpperCase()})`;
  return t;
}
window.histExtSendToPasteModal = function(){
  const items = _histExtGetViewItems();
  const sel = window._histExtSel || new Set();
  const picked = items.filter(x=>sel.has(_histExtKey(x)));
  if(!picked.length){ alert('선택된 행이 없습니다'); return; }
  const target = (document.getElementById('hist-ext-target')?.value || '').trim();
  if(!target){ alert('저장 대상(미니/개인전 등)을 먼저 선택해주세요'); return; }
  _histExtTargetSave(target);
  try{ window._pasteFromHistExt = true; }catch(e){}
  const lines = picked.map(x=>{
    const d = (x.date||'').trim();
    const w = _histExtToPasteName(x.winner);
    const l = _histExtToPasteName(x.loser);
    const mp = (x.map||'-').trim();
    const memo = String(x.memo||'').replace(/\t+/g,' ').replace(/\r?\n/g,' ').trim();
    return `${d} ${w}\t${l}\t${mp}\t승\t${_histExtTargetToPasteMode(target)}${memo?`\t${memo}`:''}`;
  }).join('\n');
  _histOpenPasteModalByTarget(target);
  _histFillPasteModalByTarget(target, lines);
};
window.histExtApplyQuickUrl = function(){
  const raw = (document.getElementById('hist-ext-quickurl')?.value || '').trim();
  if(!raw) return;
  try{
    const u = new URL(raw);
    let base = (u.origin || '') + (u.pathname || '');
    base = base.replace(/\/+$/,'');
    if(!base) base = u.origin + '/';
    const bo = u.searchParams.get('bo_table') || 'bj_board';
    const pages = u.searchParams.getAll('page').map(x=>parseInt(x,10)).filter(n=>!isNaN(n));
    const pFrom = pages.length ? Math.min(...pages) : (parseInt(u.searchParams.get('pageFrom')||'1',10)||1);
    const pTo   = pages.length ? Math.max(...pages) : (parseInt(u.searchParams.get('pageTo')||String(pFrom),10)||pFrom);
    const proxyEl = document.getElementById('hist-ext-proxy');
    const boEl = document.getElementById('hist-ext-bo');
    const pfEl = document.getElementById('hist-ext-pageFrom');
    const ptEl = document.getElementById('hist-ext-pageTo');
    if(proxyEl) proxyEl.value = base;
    if(boEl) boEl.value = bo;
    if(pfEl) pfEl.value = pFrom;
    if(ptEl) ptEl.value = pTo;
    _histExtProxySave(base);
    const pCfg=_histExtProxyCfgLoad();
    _histExtProxyCfgSave({...pCfg, bo, pFrom, pTo});
    alert(`✅ URL 자동 입력 완료\n- 주소: ${base}\n- bo_table=${bo}\n- 페이지: ${pFrom}~${pTo}`);
  }catch(e){
    alert('URL 형식이 올바르지 않습니다');
  }
};
window.histExtParseAndRender = function(opts){
  const st=_histExtLoad();
  const raw=document.getElementById('hist-ext-raw')?.value||'';
  try{ window.histExtResetUI && window.histExtResetUI(); }catch(e){}
  let rows=null, fmt='-';
  if(/<table[\s>]/i.test(raw)){ rows=_histExtParseHTMLTable(raw); if(rows) fmt='HTML 표'; }
  if(!rows){ rows=_histExtParseTextTable(raw); if(rows) fmt='텍스트 표'; }
  const parsed=(rows?_histExtMapRows(rows):[]).map(x=>({...x, source:x.source||'붙여넣기'}));
  const merged=_histExtDedup([...(st.items||[]), ...parsed]);
  const next={...st, items:merged, raw:'', mode:'all', today:''};
  const ok=_histExtSave(next);
  if(!ok){
    alert('⚠️ 외부 데이터 저장에 실패했습니다.\n브라우저 저장공간(localStorage) 용량이 부족할 수 있어요.\n(가능하면 크롬/엣지에서 다시 시도하거나, 페이지 범위를 줄여주세요)');
  }
  try{ document.getElementById('hist-ext-fmt').textContent=fmt; }catch(e){}
  try{ document.getElementById('hist-ext-cnt-raw').textContent=String(parsed.length); }catch(e){}
  try{ document.getElementById('hist-ext-cnt').textContent=String(merged.length); }catch(e){}
  try{ document.getElementById('hist-ext-cnt-store').textContent=String(merged.length); }catch(e){}
  try{ _histExtRenderTable(_histExtGetViewItems()); }catch(e){}
};
window.histExtFetchFromProxy = async function(){
  const proxy=(document.getElementById('hist-ext-proxy')?.value||'').trim();
  const bo=(document.getElementById('hist-ext-bo')?.value||'bj_board').trim();
  const pFrom=parseInt(document.getElementById('hist-ext-pageFrom')?.value||'1',10)||1;
  const pTo=parseInt(document.getElementById('hist-ext-pageTo')?.value||String(pFrom),10)||pFrom;
  if(!proxy){ alert('프록시 URL을 입력해주세요'); return; }
  _histExtProxySave(proxy);
  _histExtProxyCfgSave({bo, pFrom, pTo});
  try{
    const {presets, sel} = _histExtEnsureProxyPresets();
    const idx = presets.findIndex(p=>p.id===sel);
    if(idx>=0){
      presets[idx] = {...presets[idx], proxy, bo, pFrom, pTo};
      _histExtProxyPresetsSave(presets);
    }
  }catch(e){}
  try{ window.histExtResetUI && window.histExtResetUI(); }catch(e){}
  const prog=document.getElementById('hist-ext-prog');
  const setProg=(s)=>{ if(prog) prog.textContent=s; };
  setProg('가져오는 중...');

  let rawItems=[];
  let fmt='프록시';
  const _preset = _histExtGetSelPreset();
  const _srcName = (_preset && _preset.name) ? _preset.name : '프록시';
  const start=Math.min(pFrom,pTo), end=Math.max(pFrom,pTo);
  const pageLog=[];
  const logEl=document.getElementById('hist-ext-log');
  const setLog=(html)=>{ if(logEl) logEl.innerHTML=html; };
  setLog(`<div style="font-size:11px;color:var(--gray-l)">요청 범위: ${start} ~ ${end} (bo_table=${bo})</div>`);

  let lastHtmlPreview='';
  for(let p=start; p<=end; p++){
    setProg(`페이지 ${p}/${end} 불러오는 중...`);
    let html='';
    try{
      const base = proxy.replace(/\/+$/,'');
      const joiner = base.includes('?') ? '&' : '?';
      const u = `${base}${joiner}bo_table=${encodeURIComponent(bo)}&page=${encodeURIComponent(String(p))}`;
      const res = await fetch(u, {method:'GET'});
      html = await res.text();
      if(!lastHtmlPreview && html) lastHtmlPreview = html.slice(0, 2500);
    }catch(e){
      console.error('proxy fetch error', e);
      pageLog.push({p, ok:false, rows:0, msg:'fetch 실패'});
      continue;
    }
    const rows=_histExtParseHTMLTable(html) || [];
    const items=_histExtMapRows(rows).map(x=>({...x, source:_srcName}));
    if(items.length) rawItems = rawItems.concat(items);
    const sample = items[0] ? `${items[0].date} ${items[0].winner} vs ${items[0].loser}` : '';
    let minD='', maxD='';
    try{
      if(items.length){
        const ds = items.map(x=>x.date).filter(Boolean).sort();
        minD = ds[0] || '';
        maxD = ds[ds.length-1] || '';
      }
    }catch(e){}
    pageLog.push({p, ok:true, rows:items.length, sample, minD, maxD});

    setLog(`
      <div style="font-size:11px;color:var(--gray-l)">요청 범위: ${start} ~ ${end} (bo_table=${bo})</div>
      <div style="font-size:11px;color:var(--gray-l);margin-top:4px">가져온 페이지: ${pageLog.length} / ${end-start+1}</div>
      <div style="margin-top:6px;display:flex;flex-wrap:wrap;gap:6px">
        ${pageLog.map(x=>`<span style="border:1px solid var(--border);background:var(--surface);padding:3px 8px;border-radius:999px;font-size:11px">
          p${x.p}: ${x.ok ? (x.rows+'행') : '실패'}${x.minD&&x.maxD?` · ${x.minD}~${x.maxD}`:''}${x.sample ? ` · ${x.sample}`:''}
        </span>`).join('')}
      </div>
    `);
  }

  const allItems=_histExtDedup(rawItems);
  const st=_histExtLoad();
  const merged=_histExtDedup([...(st.items||[]), ...allItems]);
  const next={...st, items:merged, raw:st.raw||'', mode:'all', today:''};
  const ok=_histExtSave(next);
  if(!ok){
    alert('⚠️ 외부 데이터 저장에 실패했습니다.\n브라우저 저장공간(localStorage) 용량이 부족할 수 있어요.\n(페이지 범위를 줄이거나, 크롬/엣지에서 다시 시도해주세요)');
  }

  try{ document.getElementById('hist-ext-fmt').textContent=fmt; }catch(e){}
  try{ document.getElementById('hist-ext-cnt-raw').textContent=String(rawItems.length); }catch(e){}
  try{ document.getElementById('hist-ext-cnt').textContent=String(merged.length); }catch(e){}
  try{ document.getElementById('hist-ext-cnt-store').textContent=String(merged.length); }catch(e){}
  try{ _histExtRenderTable(_histExtGetViewItems()); }catch(e){}

  try{
    const hint=document.getElementById('hist-ext-hint');
    if(hint){
      hint.textContent = `전체 ${allItems.length}행 표시 중`;
    }
  }catch(e){}

  if(!allItems.length){
    const out=document.getElementById('hist-ext-out');
    if(out){
      const esc=(s)=>String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
      out.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">🕵️</div>
          <div class="empty-state-title">가져온 데이터가 0행입니다</div>
          <div class="empty-state-desc">가져온 페이지에 전적 표가 없거나, 테이블 구조가 예상과 다를 수 있습니다.</div>
        </div>
        <details style="margin-top:10px;border:1px solid var(--border);border-radius:12px;background:var(--surface);padding:10px">
          <summary style="cursor:pointer;font-weight:900">디버그: 가져온 HTML 일부 보기</summary>
          <pre style="white-space:pre-wrap;font-size:11px;color:var(--gray-l);margin-top:8px">${esc(lastHtmlPreview)}</pre>
        </details>
      `;
    }
  }
  setProg(`완료: ${_histExtGetViewItems().length}행 출력`);
};
window.histExtClear = function(){
  try{ if(typeof _histExtClearData==='function') _histExtClearData(); else localStorage.setItem(_HIST_EXT_KEY, ''); }catch(e){}
  try{ localStorage.setItem('su_hist_ext_last_modified', String(Date.now())); }catch(e){}
  try{ localStorage.setItem(_HIST_EXT_PROXY_PRESETS_KEY, ''); }catch(e){}
  try{ localStorage.setItem(_HIST_EXT_PROXY_PRESET_SEL_KEY, ''); }catch(e){}
  try{ window.histExtResetUI && window.histExtResetUI(); }catch(e){}
  try{ const ta=document.getElementById('hist-ext-raw'); if(ta) ta.value=''; }catch(e){}
  try{ const out=document.getElementById('hist-ext-out'); if(out) out.innerHTML=`<div class="empty-state"><div class="empty-state-icon">📎</div><div class="empty-state-title">출력할 데이터가 없습니다</div><div class="empty-state-desc">표를 붙여넣거나 URL로 가져오면 여기에 표시됩니다</div></div>`; }catch(e){}
  try{ ['hist-ext-cnt-raw','hist-ext-cnt','hist-ext-cnt-store'].forEach(id=>{ const el=document.getElementById(id); if(el) el.textContent='0'; }); }catch(e){}
  try{ const hint=document.getElementById('hist-ext-hint'); if(hint) hint.textContent=''; }catch(e){}
  try{ window._scheduleCloudAppSettingsSave && window._scheduleCloudAppSettingsSave(); }catch(e){}
  try{ render(); }catch(e){}
};
window.histExtClearAll = function(){
  if(!confirm('외부 탭 데이터를 모두 삭제할까요?\n(되돌릴 수 없습니다)')) return;
  try{ if(typeof _histExtClearData==='function') _histExtClearData(); else localStorage.setItem(_HIST_EXT_KEY, ''); }catch(e){}
  try{ localStorage.setItem('su_hist_ext_last_modified', String(Date.now())); }catch(e){}
  try{ localStorage.setItem(_HIST_EXT_PROXY_PRESETS_KEY, ''); }catch(e){}
  try{ localStorage.setItem(_HIST_EXT_PROXY_PRESET_SEL_KEY, ''); }catch(e){}
  try{ window.histExtResetUI && window.histExtResetUI(); }catch(e){}
  try{ const ta=document.getElementById('hist-ext-raw'); if(ta) ta.value=''; }catch(e){}
  try{ const out=document.getElementById('hist-ext-out'); if(out) out.innerHTML=`<div class="empty-state"><div class="empty-state-icon">📎</div><div class="empty-state-title">출력할 데이터가 없습니다</div><div class="empty-state-desc">표를 붙여넣거나 URL로 가져오면 여기에 표시됩니다</div></div>`; }catch(e){}
  try{ ['hist-ext-cnt-raw','hist-ext-cnt','hist-ext-cnt-store'].forEach(id=>{ const el=document.getElementById(id); if(el) el.textContent='0'; }); }catch(e){}
  try{ const hint=document.getElementById('hist-ext-hint'); if(hint) hint.textContent=''; }catch(e){}
  try{ window._scheduleCloudAppSettingsSave && window._scheduleCloudAppSettingsSave(); }catch(e){}
  try{ render(); }catch(e){}
};
window.histExtCopy = async function(){
  const st=_histExtLoad();
  const items=st.items||[];
  const tsv=items.map(x=>[x.date,x.winner,x.loser,x.map,x.elo,x.type,x.memo].join('\t')).join('\n');
  try{
    await navigator.clipboard.writeText(tsv);
    alert('복사됨');
  }catch(e){
    alert('복사 실패: 브라우저 권한 문제일 수 있어요.');
  }
};
function _histExtRenderTable(items){
  const out=document.getElementById('hist-ext-out');
  if(!out) return;
  if(!items.length){
    out.innerHTML=`<div class="empty-state"><div class="empty-state-icon">📎</div><div class="empty-state-title">출력할 데이터가 없습니다</div><div class="empty-state-desc">표를 붙여넣고 ‘파싱/출력’을 눌러주세요</div></div>`;
    return;
  }
  const sel = window._histExtSel || (window._histExtSel=new Set());
  const totalPages = Math.max(1, Math.ceil(items.length/_HIST_EXT_PAGE_SIZE));
  const page = Math.max(1, Math.min(totalPages, window._histExtPage||1));
  window._histExtPage = page;
  const start = (page-1)*_HIST_EXT_PAGE_SIZE;
  const slice = items.slice(start, start+_HIST_EXT_PAGE_SIZE);
  const allOnPage = slice.length>0 && slice.every(x=>sel.has(_histExtKey(x)));
  const pager = `
    <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;margin-bottom:8px">
      <div style="font-size:12px;color:var(--gray-l);font-weight:900">
        ${items.length}경기 · ${page}/${totalPages} 페이지 · (페이지당 ${_HIST_EXT_PAGE_SIZE})
      </div>
      <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap">
        <button class="btn btn-w btn-xs" onclick="histExtSelPage(${allOnPage?'false':'true'})">${allOnPage?'현재페이지 선택해제':'현재페이지 전체선택'}</button>
        <button class="btn btn-w btn-xs" onclick="histExtCopySelected()">선택 복사</button>
        <button class="btn btn-w btn-xs" onclick="histExtPageTo(${page-1})" ${page<=1?'disabled':''}>◀</button>
        <button class="btn btn-w btn-xs" onclick="histExtPageTo(${page+1})" ${page>=totalPages?'disabled':''}>▶</button>
      </div>
    </div>
  `;
  out.innerHTML= pager + `
    <div style="overflow:auto;border:1px solid var(--border);border-radius:12px;background:var(--white)">
      <table style="width:100%;border-collapse:collapse;font-size:12px">
        <thead>
          <tr style="background:var(--surface);color:var(--text3);font-weight:900">
            <th style="padding:10px;text-align:left;white-space:nowrap;width:34px"><input type="checkbox" ${allOnPage?'checked':''} onchange="histExtSelPage(this.checked)" /></th>
            <th style="padding:10px;text-align:left;white-space:nowrap">소스</th>
            <th style="padding:10px;text-align:left;white-space:nowrap">날짜</th>
            <th style="padding:10px;text-align:left;white-space:nowrap">승자</th>
            <th style="padding:10px;text-align:left;white-space:nowrap">패자</th>
            <th style="padding:10px;text-align:left;white-space:nowrap">맵</th>
            <th style="padding:10px;text-align:left;white-space:nowrap">ELO</th>
            <th style="padding:10px;text-align:left;white-space:nowrap">경기방식</th>
            <th style="padding:10px;text-align:left;white-space:nowrap">메모</th>
          </tr>
        </thead>
        <tbody>
          ${slice.map(x=>{
            const k=_histExtKey(x);
            const on=sel.has(k);
            const w = x.winner||'';
            const l = x.loser||'';
            return `
              <tr style="border-top:1px solid var(--border)">
                <td style="padding:10px;white-space:nowrap"><input type="checkbox" ${on?'checked':''} onchange="histExtToggleSel('${k.replace(/'/g,"\\'")}')" /></td>
                <td style="padding:10px;white-space:nowrap;color:var(--gray-l);font-size:11px;font-weight:900">${x.source?esc(x.source):''}</td>
                <td style="padding:10px;white-space:nowrap;font-weight:900">${x.date}</td>
                <td style="padding:10px"><span style="display:inline-flex;align-items:center;gap:6px"><span style="font-size:11px;font-weight:1000;padding:2px 7px;border-radius:999px;background:rgba(22,163,74,.12);border:1px solid rgba(22,163,74,.28);color:#166534">승</span><span style="font-weight:1000">${w}</span></span></td>
                <td style="padding:10px"><span style="display:inline-flex;align-items:center;gap:6px"><span style="font-size:11px;font-weight:1000;padding:2px 7px;border-radius:999px;background:rgba(220,38,38,.10);border:1px solid rgba(220,38,38,.25);color:#7f1d1d">패</span><span style="font-weight:900;color:var(--text2)">${l}</span></span></td>
                <td style="padding:10px;color:var(--text3);font-weight:700">${x.map||''}</td>
                <td style="padding:10px;white-space:nowrap">${x.elo||''}</td>
                <td style="padding:10px;color:var(--gray-l)">${x.type||''}</td>
                <td style="padding:10px;color:var(--text2);font-weight:700">${x.memo||''}</td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>
  `;
}
function histExternalHTML(){
  try{
    if(!(typeof isLoggedIn!=='undefined' && isLoggedIn) || (typeof isSubAdmin!=='undefined' && isSubAdmin)){
      return `<div class="empty-state"><div class="empty-state-icon">🔒</div><div class="empty-state-title">관리자 전용</div><div class="empty-state-desc">관리자 로그인 시 이용 가능합니다</div></div>`;
    }
  }catch(e){}
  const st=_histExtLoad();
  const ps=_histExtEnsureProxyPresets();
  const presets = ps.presets || [];
  const selPresetId = ps.sel || '';
  const proxy = _histExtProxyLoad();
  const pCfg = _histExtProxyCfgLoad();
  const tSel = _histExtTargetLoad();
  const keyword = String(st.keyword||'').trim();
  const srcSel = String(st.sourceSel||'').trim();
  const srcOptions = [...new Set((st.items||[]).map(x=>String(x.source||'').trim()).filter(Boolean))].sort((a,b)=>a.localeCompare(b));
  setTimeout(()=>{ try{ _histExtRenderTable(_histExtGetViewItems()); }catch(e){} }, 0);
  return `
    <div style="border:1px solid var(--border);border-radius:12px;background:var(--white);padding:12px;margin-bottom:10px">
      <div style="display:flex;gap:8px;align-items:center;justify-content:space-between;flex-wrap:wrap;margin-bottom:8px">
        <div style="font-weight:900">0) 프록시 URL로 자동 가져오기</div>
        <div id="hist-ext-prog" style="font-size:11px;color:var(--gray-l)"></div>
      </div>
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:8px">
        <div class="flabel">프리셋</div>
        <select id="hist-ext-preset" onchange="histExtPresetSelect(this.value)" style="padding:6px 10px;border:1px solid var(--border2);border-radius:8px;font-size:12px;font-weight:900;min-width:160px">
          ${presets.map(p=>`<option value="${p.id}"${p.id===selPresetId?' selected':''}>${esc(p.name||'')}</option>`).join('')}
        </select>
        <button class="btn btn-w btn-xs" onclick="histExtPresetAdd()">+ 추가</button>
        <button class="btn btn-w btn-xs" onclick="histExtPresetRename()">이름변경</button>
        <button class="btn btn-b btn-xs" onclick="histExtPresetSaveCurrent()">저장</button>
        <button class="btn btn-r btn-xs" onclick="histExtPresetDelete()">삭제</button>
        <span style="font-size:11px;color:var(--gray-l)">※ 선택 후 URL로 가져오기</span>
      </div>
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:8px">
        <div class="flabel">빠른 URL</div>
        <input id="hist-ext-quickurl" placeholder="예: https://elo-proxy1.kpoppd.workers.dev/board.php?bo_table=bj_board&page=1&page=2" style="flex:1;min-width:260px;padding:6px 10px;border:1px solid var(--border2);border-radius:8px">
        <button class="btn btn-w btn-xs" onclick="histExtApplyQuickUrl()">자동 입력</button>
        <span style="font-size:11px;color:var(--gray-l)"></span>
      </div>
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        <div class="flabel">프록시</div>
        <input id="hist-ext-proxy" value="${(proxy||'').replace(/"/g,'&quot;')}" placeholder="예) https://elo-proxy1.kpoppd.workers.dev" style="flex:1;min-width:240px;padding:6px 10px;border:1px solid var(--border2);border-radius:8px">
        <div class="flabel">bo_table</div>
        <input id="hist-ext-bo" value="${(pCfg.bo||'bj_board')}" style="width:120px;padding:6px 10px;border:1px solid var(--border2);border-radius:8px">
        <div class="flabel">페이지</div>
        <input id="hist-ext-pageFrom" type="number" value="${(pCfg.pFrom||1)}" min="1" style="width:78px;padding:6px 10px;border:1px solid var(--border2);border-radius:8px">
        <span style="color:var(--gray-l);font-weight:900">~</span>
        <input id="hist-ext-pageTo" type="number" value="${(pCfg.pTo||6)}" min="1" style="width:78px;padding:6px 10px;border:1px solid var(--border2);border-radius:8px">
        <button class="btn btn-b" onclick="histExtFetchFromProxy()">URL로 가져오기</button>
      </div>
      <div style="margin-top:8px;font-size:11px;color:var(--gray-l)"></div>
      <div id="hist-ext-log" style="margin-top:8px"></div>
      <details style="margin-top:10px;border:1px solid var(--border);border-radius:12px;background:var(--surface);padding:10px">
        <summary style="cursor:pointer;font-weight:1000">1) 붙여넣기</summary>
        <div style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap;align-items:center">
          <button class="btn btn-w btn-xs" onclick="histExtPasteFromClipboard()">📋 클립보드 붙여넣기</button>
          <button class="btn btn-w btn-xs" onclick="histExtParseAndRender()">🔎 외부탭으로 인식/추가</button>
          <button class="btn btn-p btn-xs" onclick="histExtInputToPasteModal()">➡️ 선택한 저장대상으로 자동인식</button>
          <button class="btn btn-w btn-xs" onclick="histExtClear()">🗑️ 데이터 초기화</button>
          <span style="font-size:11px;color:var(--gray-l)">형식: 날짜\t승자\t패자\t맵\tELO\t경기방식\t메모</span>
        </div>
        <textarea id="hist-ext-raw" style="width:100%;min-height:140px;border:1px solid var(--border2);border-radius:10px;padding:10px;font-size:12px;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,'Liberation Mono','Courier New',monospace;margin-top:8px" placeholder="여기에 TSV/CSV를 붙여넣으면 자동으로 인식해서 표에 추가합니다.">${(st.raw||'').replace(/</g,'&lt;')}</textarea>
      </details>
    </div>
    <div style="border:1px solid var(--border);border-radius:12px;background:var(--white);padding:12px">
      <div style="display:flex;gap:8px;align-items:center;justify-content:space-between;flex-wrap:wrap;margin-bottom:8px">
        <div style="font-weight:900">2) 출력</div>
        <div style="display:flex;gap:6px;flex-wrap:wrap">
          <button class="btn btn-w btn-xs" onclick="histExtCopy()">전체 복사(현재 보기)</button>
          <button class="btn btn-w btn-xs" onclick="histExtClearAll()">🗑️ 전체 삭제</button>
          <select id="hist-ext-target" style="padding:5px 8px;border:1px solid var(--border2);border-radius:8px;font-size:12px;font-weight:900">
            <option value="" ${!tSel?'selected':''}>(저장대상 선택)</option>
            <option value="mini" ${tSel==='mini'?'selected':''}>미니대전</option>
            <option value="ind" ${tSel==='ind'?'selected':''}>개인전</option>
            <option value="gj" ${tSel==='gj'?'selected':''}>끝장전</option>
            <option value="ck" ${tSel==='ck'?'selected':''}>대학CK</option>
            <option value="univm" ${tSel==='univm'?'selected':''}>대학대전</option>
            <option value="tt" ${tSel==='tt'?'selected':''}>티어대회</option>
            <option value="comp" ${tSel==='comp'?'selected':''}>대회</option>
          </select>
          <button class="btn btn-p btn-xs" onclick="histExtSendToPasteModal()">선택 → 자동인식 열기</button>
        </div>
      </div>
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin:-2px 0 8px;padding:8px 10px;border:1px solid var(--border);border-radius:10px;background:var(--surface)">
        <div class="flabel">🔎 검색</div>
        <select id="hist-ext-srcsel" onchange="histExtSetSource(this.value)" style="padding:6px 10px;border:1px solid var(--border2);border-radius:8px;font-size:12px;font-weight:900;min-width:140px">
          <option value=""${!srcSel?' selected':''}>전체</option>
          ${srcOptions.map(s=>`<option value="${esc(s)}"${s===srcSel?' selected':''}>${esc(s)}</option>`).join('')}
        </select>
        <input id="hist-ext-keyword" value="${keyword.replace(/\"/g,'&quot;')}" placeholder="선수명/맵/메모 (예: 히엉, 폴리포이드, 빌드)" style="flex:1;min-width:220px;padding:6px 10px;border:1px solid var(--border2);border-radius:8px"
          onkeydown="if(event.key==='Enter'){histExtSetKeyword(this.value)}">
        <button class="btn btn-w btn-xs" onclick="histExtSetKeyword(document.getElementById('hist-ext-keyword').value)">적용</button>
        <button class="btn btn-w btn-xs" onclick="histExtClearKeyword()">초기화</button>
        <span style="margin-left:auto;font-size:11px;color:var(--gray-l)">※ 현재 보기(미리보기)만 필터</span>
      </div>
      <div id="hist-ext-hint" style="font-size:11px;color:var(--gray-l);margin:-2px 0 8px"></div>
      <div style="display:grid;grid-template-columns:repeat(4, minmax(0,1fr));gap:6px;margin-bottom:8px">
        <div style="border:1px solid var(--border);border-radius:10px;padding:8px;background:var(--surface)"><div style="font-size:11px;color:var(--gray-l);font-weight:900">형식</div><div style="font-size:13px;font-weight:1000" id="hist-ext-fmt">-</div></div>
        <div style="border:1px solid var(--border);border-radius:10px;padding:8px;background:var(--surface)"><div style="font-size:11px;color:var(--gray-l);font-weight:900">가져온 행(원본)</div><div style="font-size:13px;font-weight:1000" id="hist-ext-cnt-raw">0</div></div>
        <div style="border:1px solid var(--border);border-radius:10px;padding:8px;background:var(--surface)"><div style="font-size:11px;color:var(--gray-l);font-weight:900">중복 제거 후</div><div style="font-size:13px;font-weight:1000" id="hist-ext-cnt">0</div></div>
        <div style="border:1px solid var(--border);border-radius:10px;padding:8px;background:var(--surface)"><div style="font-size:11px;color:var(--gray-l);font-weight:900">저장됨(누적)</div><div style="font-size:13px;font-weight:1000" id="hist-ext-cnt-store">${(st.items||[]).length}</div></div>
      </div>
      <div id="hist-ext-out"></div>
    </div>
  `;
}

window.histExtPresetSelect = function(id){
  const {presets}=_histExtEnsureProxyPresets();
  const p = presets.find(x=>x.id===id) || presets[0];
  if(!p) return;
  _histExtProxyPresetSelSave(p.id);
  try{
    const proxyEl=document.getElementById('hist-ext-proxy');
    const boEl=document.getElementById('hist-ext-bo');
    const pfEl=document.getElementById('hist-ext-pageFrom');
    const ptEl=document.getElementById('hist-ext-pageTo');
    if(proxyEl) proxyEl.value = p.proxy || '';
    if(boEl) boEl.value = p.bo || 'bj_board';
    if(pfEl) pfEl.value = String(p.pFrom||1);
    if(ptEl) ptEl.value = String(p.pTo||6);
  }catch(e){}
};
window.histExtPresetSaveCurrent = function(){
  const {presets, sel}=_histExtEnsureProxyPresets();
  const idx = presets.findIndex(p=>p.id===sel);
  if(idx<0) return;
  const proxy=(document.getElementById('hist-ext-proxy')?.value||'').trim();
  const bo=(document.getElementById('hist-ext-bo')?.value||'bj_board').trim();
  const pFrom=parseInt(document.getElementById('hist-ext-pageFrom')?.value||'1',10)||1;
  const pTo=parseInt(document.getElementById('hist-ext-pageTo')?.value||String(pFrom),10)||pFrom;
  presets[idx] = {...presets[idx], proxy, bo, pFrom, pTo};
  _histExtProxyPresetsSave(presets);
  _histExtProxySave(proxy);
  _histExtProxyCfgSave({bo,pFrom,pTo});
  try{ if(typeof showToast==='function') showToast('저장됨'); }catch(e){}
};
window.histExtPresetAdd = function(){
  const name = prompt('프록시 프리셋 이름');
  if(name===null) return;
  const nm = String(name||'').trim();
  if(!nm) return;
  const {presets}=_histExtEnsureProxyPresets();
  const proxy=(document.getElementById('hist-ext-proxy')?.value||'').trim();
  const bo=(document.getElementById('hist-ext-bo')?.value||'bj_board').trim();
  const pFrom=parseInt(document.getElementById('hist-ext-pageFrom')?.value||'1',10)||1;
  const pTo=parseInt(document.getElementById('hist-ext-pageTo')?.value||String(pFrom),10)||pFrom;
  const p = {id:_histExtUid(), name:nm, proxy, bo, pFrom, pTo};
  const next=[...presets, p];
  _histExtProxyPresetsSave(next);
  _histExtProxyPresetSelSave(p.id);
  try{ render(); }catch(e){}
};
window.histExtPresetRename = function(){
  const {presets, sel}=_histExtEnsureProxyPresets();
  const idx = presets.findIndex(p=>p.id===sel);
  if(idx<0) return;
  const cur = presets[idx].name || '';
  const name = prompt('프리셋 이름 변경', cur);
  if(name===null) return;
  const nm = String(name||'').trim();
  if(!nm) return;
  presets[idx] = {...presets[idx], name:nm};
  _histExtProxyPresetsSave(presets);
  try{ render(); }catch(e){}
};
window.histExtPresetDelete = function(){
  const {presets, sel}=_histExtEnsureProxyPresets();
  const idx = presets.findIndex(p=>p.id===sel);
  if(idx<0) return;
  if(presets.length<=1){ alert('프리셋은 최소 1개가 필요합니다.'); return; }
  if(!confirm(`"${presets[idx].name||'프리셋'}" 프리셋을 삭제할까요?`)) return;
  const next = presets.filter(p=>p.id!==sel);
  _histExtProxyPresetsSave(next);
  _histExtProxyPresetSelSave(next[0]?.id||'');
  try{ render(); }catch(e){}
};

function histExternal2HTML(){
  try{
    if(!(typeof isLoggedIn!=='undefined' && isLoggedIn) || (typeof isSubAdmin!=='undefined' && isSubAdmin)){
      return `<div class="empty-state"><div class="empty-state-icon">🔒</div><div class="empty-state-title">관리자 전용</div><div class="empty-state-desc">관리자 로그인 시 이용 가능합니다</div></div>`;
    }
  }catch(e){}
  const url = 'https://rapid-scene-ac45.kpoppd.workers.dev/men/bbs/board.php?bo_table=search_list';
  const tSel = _histExtTargetLoad();
  return `
    <div style="border:1px solid var(--border);border-radius:12px;background:var(--white);padding:12px;margin-bottom:10px">
      <div style="display:flex;gap:8px;align-items:center;justify-content:space-between;flex-wrap:wrap">
        <div style="font-weight:900">🌐 외부2 (관리자 전용)</div>
        <a class="btn btn-w btn-xs" href="${url}" target="_blank" rel="noopener noreferrer" style="text-decoration:none">새 창으로 열기</a>
      </div>
      <div style="font-size:11px;color:var(--gray-l);margin-top:6px;line-height:1.5">
        ※ 외부 사이트가 <b>X-Frame-Options / CSP</b>로 iframe을 차단하면 화면에 표시되지 않을 수 있습니다. (그 경우 ‘새 창으로 열기’만 가능)
      </div>
    </div>
    <div style="border:1px solid var(--border);border-radius:12px;background:var(--white);padding:12px;margin-bottom:10px">
      <div style="font-weight:900;margin-bottom:8px">📋 특정 경기만 복사 → 자동인식</div>
      <div style="font-size:11px;color:var(--gray-l);line-height:1.55;margin-bottom:8px">
        외부2 화면이나 새 창에서 <b>원하는 경기 몇 개만 드래그 복사</b>한 뒤 여기에 붙여넣고 자동인식을 누르면 됩니다.<br>
        표 형태(날짜/승자/패자/맵)면 자동 정리해서 보내고, 아니면 원문 그대로 자동인식 모달에 넘깁니다.
      </div>
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:8px">
        <select id="hist-ext2-target" style="padding:5px 8px;border:1px solid var(--border2);border-radius:8px;font-size:12px;font-weight:900">
          <option value="" ${!tSel?'selected':''}>(저장대상 선택)</option>
          <option value="mini" ${tSel==='mini'?'selected':''}>미니대전</option>
          <option value="ind" ${tSel==='ind'?'selected':''}>개인전</option>
          <option value="pro" ${tSel==='pro'?'selected':''}>프로리그 일반</option>
          <option value="progj" ${tSel==='progj'?'selected':''}>프로리그 끝장전</option>
          <option value="procomp-64" ${tSel==='procomp-64'?'selected':''}>프로리그 대회 64강</option>
          <option value="procomp-32" ${tSel==='procomp-32'?'selected':''}>프로리그 대회 32강</option>
          <option value="procomp-16" ${tSel==='procomp-16'?'selected':''}>프로리그 대회 16강</option>
          <option value="procomp-8" ${tSel==='procomp-8'?'selected':''}>프로리그 대회 8강</option>
          <option value="procomp-4" ${tSel==='procomp-4'?'selected':''}>프로리그 대회 4강</option>
          <option value="procomp-final" ${tSel==='procomp-final'?'selected':''}>프로리그 대회 결승</option>
          <option value="gj" ${tSel==='gj'?'selected':''}>끝장전</option>
          <option value="ck" ${tSel==='ck'?'selected':''}>대학CK</option>
          <option value="univm" ${tSel==='univm'?'selected':''}>대학대전</option>
          <option value="tt-general" ${tSel==='tt-general'?'selected':''}>티어대회 일반</option>
          <option value="tt-league" ${tSel==='tt-league'?'selected':''}>티어대회 조별리그</option>
          <option value="tt-bkt" ${tSel==='tt-bkt'?'selected':''}>티어대회 토너먼트</option>
          <option value="comp" ${tSel==='comp'?'selected':''}>대회</option>
        </select>
        <button class="btn btn-w btn-xs" onclick="histExt2PasteFromClipboard()">📋 클립보드 붙여넣기</button>
        <button class="btn btn-p btn-xs" onclick="histExt2SendRawToPasteModal()">➡️ 자동인식 열기</button>
      </div>
      <div style="font-size:11px;color:var(--gray-l);margin:-2px 0 8px 0;line-height:1.5">
        ※ 프로리그 일반/끝장전, 프로리그 대회 64강~결승, 티어대회 일반/조별리그/토너먼트까지 선택 가능하게 연결했습니다.<br>
        ※ 프로리그 대회 저장은 현재 선택된 프로리그 대회 기준으로 들어갑니다.
      </div>
      <textarea id="hist-ext2-raw" style="width:100%;min-height:110px;border:1px solid var(--border2);border-radius:10px;padding:10px;font-size:12px;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,'Liberation Mono','Courier New',monospace" placeholder="예: 특정 경기 몇 개만 선택 복사한 텍스트"></textarea>
    </div>
    <div style="border:1px solid var(--border);border-radius:12px;background:var(--white);overflow:hidden">
      <iframe src="${url}" style="width:100%;height:72vh;min-height:520px;border:0;display:block;background:#fff" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
    </div>
  `;
}

const _HIST_EXT3_PAGE_KEY = 'su_hist_ext3_page';
window.histExt3SetPage = function(p){
  try{
    const n = Math.max(1, Math.min(9999, parseInt(p,10) || 1));
    localStorage.setItem(_HIST_EXT3_PAGE_KEY, String(n));
    const inp = document.getElementById('hist-ext3-page');
    if(inp) inp.value = String(n);
    const frame = document.getElementById('hist-ext3-frame');
    const base = 'https://elo-proxy1.kpoppd.workers.dev/board.php?bo_table=bj_board&page=';
    if(frame) frame.src = base + encodeURIComponent(String(n));
  }catch(e){}
};
function histExternal3HTML(){
  try{
    if(!(typeof isLoggedIn!=='undefined' && isLoggedIn) || (typeof isSubAdmin!=='undefined' && isSubAdmin)){
      return `<div class="empty-state"><div class="empty-state-icon">🔒</div><div class="empty-state-title">관리자 전용</div><div class="empty-state-desc">관리자 로그인 시 이용 가능합니다</div></div>`;
    }
  }catch(e){}
  const page = (()=>{ try{ return parseInt(localStorage.getItem(_HIST_EXT3_PAGE_KEY)||'1',10)||1; }catch(e){ return 1; } })();
  const base = 'https://elo-proxy1.kpoppd.workers.dev/board.php?bo_table=bj_board&page=';
  const url = base + encodeURIComponent(String(page));
  const tSel = _histExtTargetLoad();
  return `
    <div style="border:1px solid var(--border);border-radius:12px;background:var(--white);padding:12px;margin-bottom:10px">
      <div style="display:flex;gap:8px;align-items:center;justify-content:space-between;flex-wrap:wrap">
        <div style="font-weight:900">🌐 외부3 (관리자 전용)</div>
        <a class="btn btn-w btn-xs" href="${url}" target="_blank" rel="noopener noreferrer" style="text-decoration:none">새 창으로 열기</a>
      </div>
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-top:10px">
        <button class="btn btn-w btn-xs" onclick="histExt3SetPage((parseInt(document.getElementById('hist-ext3-page').value||'1',10)||1)-1)">◀ 이전</button>
        <div style="font-size:12px;font-weight:900;color:var(--text2)">페이지</div>
        <input id="hist-ext3-page" type="number" min="1" value="${page}" style="width:92px;padding:6px 10px;border:1px solid var(--border2);border-radius:8px;font-weight:900" onkeydown="if(event.key==='Enter'){histExt3SetPage(this.value)}">
        <button class="btn btn-b btn-xs" onclick="histExt3SetPage(document.getElementById('hist-ext3-page').value)">이동</button>
        <button class="btn btn-w btn-xs" onclick="histExt3SetPage((parseInt(document.getElementById('hist-ext3-page').value||'1',10)||1)+1)">다음 ▶</button>
        <span style="font-size:11px;color:var(--gray-l)">※ iframe은 1페이지만 표시됩니다(페이지 이동으로 2/3/… 확인)</span>
      </div>
      <div style="font-size:11px;color:var(--gray-l);margin-top:6px;line-height:1.5">
        ※ 외부 사이트가 <b>X-Frame-Options / CSP</b>로 iframe을 차단하면 화면에 표시되지 않을 수 있습니다.
      </div>
    </div>
    <div style="border:1px solid var(--border);border-radius:12px;background:var(--white);padding:12px;margin-bottom:10px">
      <div style="font-weight:900;margin-bottom:8px">📋 외부3 복사 → 자동인식</div>
      <div style="font-size:11px;color:var(--gray-l);line-height:1.55;margin-bottom:8px">
        외부3 화면이나 새 창에서 <b>원하는 경기만 드래그 복사</b>한 뒤 여기에 붙여넣고 자동인식을 누르면 됩니다.<br>
        표 형태면 자동 정리해서 보내고, 아니면 원문 그대로 자동인식 모달에 넘깁니다.
      </div>
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:8px">
        <select id="hist-ext3-target" style="padding:5px 8px;border:1px solid var(--border2);border-radius:8px;font-size:12px;font-weight:900">
          <option value="" ${!tSel?'selected':''}>(저장대상 선택)</option>
          <option value="mini" ${tSel==='mini'?'selected':''}>미니대전</option>
          <option value="ind" ${tSel==='ind'?'selected':''}>개인전</option>
          <option value="gj" ${tSel==='gj'?'selected':''}>끝장전</option>
          <option value="ck" ${tSel==='ck'?'selected':''}>대학CK</option>
          <option value="univm" ${tSel==='univm'?'selected':''}>대학대전</option>
          <option value="tt-general" ${tSel==='tt-general'?'selected':''}>티어대회 일반</option>
          <option value="tt-bkt" ${tSel==='tt-bkt'?'selected':''}>티어대회 토너먼트</option>
        </select>
        <button class="btn btn-w btn-xs" onclick="histExt3PasteFromClipboard()">📋 클립보드 붙여넣기</button>
        <button class="btn btn-p btn-xs" onclick="histExt3SendRawToPasteModal()">➡️ 자동인식 열기</button>
      </div>
      <textarea id="hist-ext3-raw" style="width:100%;min-height:110px;border:1px solid var(--border2);border-radius:10px;padding:10px;font-size:12px;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,'Liberation Mono','Courier New',monospace" placeholder="예: 외부3에서 특정 경기만 선택 복사한 텍스트"></textarea>
    </div>
    <div style="border:1px solid var(--border);border-radius:12px;background:var(--white);overflow:hidden">
      <iframe id="hist-ext3-frame" src="${url}" style="width:100%;height:72vh;min-height:520px;border:0;display:block;background:#fff" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
    </div>
  `;
}
window.histExt3SendRawToPasteModal = function(){
  const raw = (document.getElementById('hist-ext3-raw')?.value || '').trim();
  if(!raw){ alert('붙여넣기 내용이 없습니다'); return; }
  const target = (document.getElementById('hist-ext3-target')?.value || '').trim();
  if(!target){ alert('저장 대상(미니/개인전 등)을 먼저 선택해주세요'); return; }
  _histExtTargetSave(target);
  try{ window._pasteFromHistExt = true; }catch(e){}
  _histOpenPasteModalByTarget(target);
  const payload = _histExtRawToPastePayload(raw, target);
  _histFillPasteModalByTarget(target, payload);
};
window.histExt3PasteFromClipboard = async function(){
  try{
    const t = await navigator.clipboard.readText();
    const ta = document.getElementById('hist-ext3-raw');
    if(ta) ta.value = t || '';
  }catch(e){
    alert('클립보드 읽기 실패: 브라우저 권한(HTTPS/사용자 허용) 문제일 수 있어요.');
  }
};
