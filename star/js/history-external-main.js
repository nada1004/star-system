/* history-external-main.js: extracted from history.js */
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
    else if(typeof openMiniPasteModal==='function') openMiniPasteModal();
  }catch(e){}
}
function _histExtTargetToPasteMode(target){
  const t = String(target||'').trim();
  if(t==='pro') return 'pro';
  if(t==='progj') return 'progj';
  if(t==='tt-general' || t==='tt-league' || t==='tt-bkt') return 'tt';
  return t || 'mini';
}
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
  // 1) HTML 테이블 통째 복사 → 기존 외부탭 파서 재사용
  const htmlRows = _histExtParseHTMLTable(txt);
  if(htmlRows && htmlRows.length){
    const parsed = _histExtMapRows(htmlRows);
    if(parsed && parsed.length) return _histExtRowsToPasteLines(parsed, target);
  }
  // 2) TSV/간격 기반 텍스트 표
  const textRows = _histExtParseTextTable(txt);
  if(textRows && textRows.length){
    const parsed = _histExtMapRows(textRows);
    if(parsed && parsed.length) return _histExtRowsToPasteLines(parsed, target);
  }
  // 3) 날짜/승자/패자/맵 정도가 한 줄에 있을 때의 단순 표 보정
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
  // 4) 위 규칙으로 못 읽으면 원문 그대로 자동인식 모달에 넘김
  return txt;
}
window.histExt2SendRawToPasteModal = function(){
  const raw = (document.getElementById('hist-ext2-raw')?.value || '').trim();
  if(!raw){ alert('붙여넣기 내용이 없습니다'); return; }
  const target = (document.getElementById('hist-ext2-target')?.value || '').trim();
  if(!target){ alert('저장 대상(미니/개인전 등)을 먼저 선택해주세요'); return; }
  _histExtTargetSave(target);
  try{ window._pasteFromHistExt = true; }catch(e){}
  _histOpenPasteModalByTarget(target);
  const payload = _histExtRawToPastePayload(raw, target);
  setTimeout(()=>{
    try{
      const ta = document.getElementById('paste-input');
      if(ta) ta.value = payload;
      if(typeof pastePreview==='function') pastePreview();
    }catch(e){}
  }, 60);
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

// 선택 결과를 "경기 결과 붙여넣기(자동인식)" 모달로 전송
function _histExtToPasteName(s){
  let t = String(s||'').trim();
  // "메모: 대호" 같은 형태가 이름 칸에 섞여 들어오는 경우 대비
  t = t.replace(/^(?:메모|비고|memo)\s*[:：]\s*/i,'').trim();
  // "승 xxx", "패 xxx" 같은 접두 제거
  t = t.replace(/^(승|패)\s+/,'').trim();
  // 이모지/기호 제거(외부 표 복사 시 섞이는 경우)
  t = t.replace(/[✅❌⭕⬜🆚🌐⭐★■□●○◆◇]/g,'').trim();
  // 뒤쪽 괄호 설명 제거: "대호 (프로토스)" / "대호(P)" 등
  t = t.replace(/\s*\((?:[PTZN]|테란|저그|프로토스|토스|Terran|Zerg|Protoss)\)\s*$/i,'').trim();
  // "이름 P" → "이름 (P)" (자동인식기 TSV 규칙)
  const m = t.match(/^(.+?)\s+([PTZN])$/i);
  if(m) t = `${m[1].trim()} (${m[2].toUpperCase()})`;
  return t;
}
window.histExtSendToPasteModal = function(){
  const items = _histExtGetViewItems();
  const sel = window._histExtSel || new Set();
  const picked = items.filter(x=>sel.has(_histExtKey(x)));
  if(!picked.length){
    alert('선택된 행이 없습니다');
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
  const lines = picked.map(x=>{
    const d = (x.date||'').trim();
    const w = _histExtToPasteName(x.winner);
    const l = _histExtToPasteName(x.loser);
    const mp = (x.map||'-').trim();
    const memo = String(x.memo||'').replace(/\t+/g,' ').replace(/\r?\n/g,' ').trim();
    // TSV(2인칭): 선수1\t선수2\t맵\t승/패(ELO)\t[타입]
    // 날짜는 "YYYY-MM-DD " 접두로 포함(파서가 날짜를 먼저 인식)
    return `${d} ${w}\t${l}\t${mp}\t승\t${target}${memo?`\t${memo}`:''}`;
  }).join('\n');

  // 해당 모드의 붙여넣기 모달 열기
  try{
    if(target==='ind' && typeof openIndPasteModal==='function') openIndPasteModal();
    else if(target==='gj' && typeof openGJPasteModal==='function') openGJPasteModal();
    else if(target==='ck' && typeof openCKPasteModal==='function') openCKPasteModal();
    else if(target==='univm' && typeof openUnivmPasteModal==='function') openUnivmPasteModal();
    else if(target==='tt' && typeof openTTPasteModal==='function') openTTPasteModal();
    else if(target==='comp' && typeof openCompPasteModal==='function') openCompPasteModal();
    else if(typeof openMiniPasteModal==='function') openMiniPasteModal();
  }catch(e){}

  // 모달 textarea 채우고 미리보기 실행
  setTimeout(()=>{
    try{
      const ta = document.getElementById('paste-input');
      if(ta) ta.value = lines;
      if(typeof pastePreview==='function') pastePreview();
    }catch(e){}
  }, 60);
};

// 프록시 URL 빠른 입력: 전체 URL을 붙여넣으면 proxy/bo/page 범위를 자동 세팅
window.histExtApplyQuickUrl = function(){
  const raw = (document.getElementById('hist-ext-quickurl')?.value || '').trim();
  if(!raw) return;
  try{
    const u = new URL(raw);
    // (개선) 일부 프록시는 /board.php 같은 경로가 필수일 수 있음
    // - 사용자가 /board.php?... 형태로 넣으면 경로까지 포함해서 저장
    // - 끝의 '/'는 제거(중복 슬래시 방지)
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
  // UI 리셋
  try{ window.histExtResetUI && window.histExtResetUI(); }catch(e){}
  let rows=null, fmt='-';
  if(/<table[\s>]/i.test(raw)){ rows=_histExtParseHTMLTable(raw); if(rows) fmt='HTML 표'; }
  if(!rows){ rows=_histExtParseTextTable(raw); if(rows) fmt='텍스트 표'; }
  // (추가) 붙여넣기 데이터는 기존 items에 누적
  const parsed=(rows?_histExtMapRows(rows):[]).map(x=>({...x, source:x.source||'붙여넣기'}));
  const merged=_histExtDedup([...(st.items||[]), ...parsed]);
  // (용량 최적화) raw(붙여넣은 원문 HTML/텍스트)는 용량이 매우 커질 수 있어 저장하지 않음
  // - items(정규화된 데이터)만 저장하면 다른 기기 동기화/검색에는 충분
  const next={...st, items:merged, raw:'', mode:'all', today:''};
  const ok=_histExtSave(next);
  if(!ok){
    alert('⚠️ 외부 데이터 저장에 실패했습니다.\n브라우저 저장공간(localStorage) 용량이 부족할 수 있어요.\n(가능하면 크롬/엣지에서 다시 시도하거나, 페이지 범위를 줄여주세요)');
  }
  // 출력
  try{ document.getElementById('hist-ext-fmt').textContent=fmt; }catch(e){}
  try{ document.getElementById('hist-ext-cnt-raw').textContent=String(parsed.length); }catch(e){}
  try{ document.getElementById('hist-ext-cnt').textContent=String(merged.length); }catch(e){}
  try{ document.getElementById('hist-ext-cnt-store').textContent=String(merged.length); }catch(e){}
  try{ _histExtRenderTable(_histExtGetViewItems()); }catch(e){}
};

// 프록시 URL(Cloudflare Worker)로 페이지 자동 가져오기
window.histExtFetchFromProxy = async function(){
  const proxy=(document.getElementById('hist-ext-proxy')?.value||'').trim();
  const bo=(document.getElementById('hist-ext-bo')?.value||'bj_board').trim();
  const pFrom=parseInt(document.getElementById('hist-ext-pageFrom')?.value||'1',10)||1;
  const pTo=parseInt(document.getElementById('hist-ext-pageTo')?.value||String(pFrom),10)||pFrom;
  if(!proxy){
    alert('프록시 URL을 입력해주세요');
    return;
  }
  _histExtProxySave(proxy);
  _histExtProxyCfgSave({bo, pFrom, pTo});
  // 선택 프리셋에도 반영
  try{
    const {presets, sel} = _histExtEnsureProxyPresets();
    const idx = presets.findIndex(p=>p.id===sel);
    if(idx>=0){
      presets[idx] = {...presets[idx], proxy, bo, pFrom, pTo};
      _histExtProxyPresetsSave(presets);
    }
  }catch(e){}
  // UI 리셋
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
      // (개선) proxy가 /board.php까지 포함할 수 있으므로 "/?" 고정 결합을 쓰지 않는다
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

    // 진행 로그 표시(가벼운 텍스트)
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

  // 저장
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

  // "오늘만"일 때도 전체 수집 결과를 안내(사용자가 1페이지만 가져왔다고 착각 방지)
  try{
    const hint=document.getElementById('hist-ext-hint');
    if(hint){
      let minAll='', maxAll='';
      try{
        const ds = (allItems||[]).map(x=>x.date).filter(Boolean).sort();
        minAll = ds[0] || '';
        maxAll = ds[ds.length-1] || '';
      }catch(e){}
      hint.textContent = `전체 ${allItems.length}행 표시 중`;
    }
  }catch(e){}

  // 결과가 0이면 원인 파악용 안내를 출력 영역에 같이 표시
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
  // (요청사항) "초기화"는 외부탭 데이터가 완전히 사라져야 함
  // - Firebase 실시간 수신이 직후에 옛 데이터를 덮어쓰는 현상 방지:
  //   삭제 시에도 last_modified를 최신으로 찍고, 데이터는 빈 값으로 저장해 클라우드에 반영한다.
  try{ localStorage.setItem(_HIST_EXT_KEY, ''); }catch(e){}
  try{ localStorage.setItem('su_hist_ext_last_modified', String(Date.now())); }catch(e){}
  // 관련 설정도 초기화(선택 프리셋/프리셋 목록)
  try{ localStorage.setItem(_HIST_EXT_PROXY_PRESETS_KEY, ''); }catch(e){}
  try{ localStorage.setItem(_HIST_EXT_PROXY_PRESET_SEL_KEY, ''); }catch(e){}
  // UI 즉시 비우기(렌더/동기화 타이밍에 상관없이 바로 사라지게)
  try{ window.histExtResetUI && window.histExtResetUI(); }catch(e){}
  try{ const ta=document.getElementById('hist-ext-raw'); if(ta) ta.value=''; }catch(e){}
  try{ const out=document.getElementById('hist-ext-out'); if(out) out.innerHTML=`<div class="empty-state"><div class="empty-state-icon">📎</div><div class="empty-state-title">출력할 데이터가 없습니다</div><div class="empty-state-desc">표를 붙여넣거나 URL로 가져오면 여기에 표시됩니다</div></div>`; }catch(e){}
  try{ ['hist-ext-cnt-raw','hist-ext-cnt','hist-ext-cnt-store'].forEach(id=>{ const el=document.getElementById(id); if(el) el.textContent='0'; }); }catch(e){}
  try{ const hint=document.getElementById('hist-ext-hint'); if(hint) hint.textContent=''; }catch(e){}
  try{ window._scheduleCloudAppSettingsSave && window._scheduleCloudAppSettingsSave(); }catch(e){}
  try{ render(); }catch(e){}
};
// 외부 데이터 전체 삭제(확인 포함) — 출력 영역에서 바로 실행 가능
window.histExtClearAll = function(){
  if(!confirm('외부 탭 데이터를 모두 삭제할까요?\n(되돌릴 수 없습니다)')) return;
  try{ localStorage.setItem(_HIST_EXT_KEY, ''); }catch(e){}
  try{ localStorage.setItem('su_hist_ext_last_modified', String(Date.now())); }catch(e){}
  try{ localStorage.setItem(_HIST_EXT_PROXY_PRESETS_KEY, ''); }catch(e){}
  try{ localStorage.setItem(_HIST_EXT_PROXY_PRESET_SEL_KEY, ''); }catch(e){}
  try{ window.histExtResetUI && window.histExtResetUI(); }catch(e){}
  try{
    const ta=document.getElementById('hist-ext-raw');
    if(ta) ta.value='';
  }catch(e){}
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
            <th style="padding:10px;text-align:left;white-space:nowrap;width:34px">
              <input type="checkbox" ${allOnPage?'checked':''} onchange="histExtSelPage(this.checked)" />
            </th>
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
                <td style="padding:10px;white-space:nowrap">
                  <input type="checkbox" ${on?'checked':''} onchange="histExtToggleSel('${k.replace(/'/g,"\\'")}')" />
                </td>
                <td style="padding:10px;white-space:nowrap;color:var(--gray-l);font-size:11px;font-weight:900">
                  ${x.source?esc(x.source):''}
                </td>
                <td style="padding:10px;white-space:nowrap;font-weight:900">${x.date}</td>
                <td style="padding:10px">
                  <span style="display:inline-flex;align-items:center;gap:6px">
                    <span style="font-size:11px;font-weight:1000;padding:2px 7px;border-radius:999px;background:rgba(22,163,74,.12);border:1px solid rgba(22,163,74,.28);color:#166534">승</span>
                    <span style="font-weight:1000">${w}</span>
                  </span>
                </td>
                <td style="padding:10px">
                  <span style="display:inline-flex;align-items:center;gap:6px">
                    <span style="font-size:11px;font-weight:1000;padding:2px 7px;border-radius:999px;background:rgba(220,38,38,.10);border:1px solid rgba(220,38,38,.25);color:#7f1d1d">패</span>
                    <span style="font-weight:900;color:var(--text2)">${l}</span>
                  </span>
                </td>
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
  // 권한 재확인(수동 변경 대비)
  try{
    if(!(typeof isLoggedIn!=='undefined' && isLoggedIn) || (typeof isSubAdmin!=='undefined' && isSubAdmin)){
      return `<div class="empty-state"><div class="empty-state-icon">🔒</div><div class="empty-state-title">관리자 전용</div><div class="empty-state-desc">관리자 로그인 시 이용 가능합니다</div></div>`;
    }
  }catch(e){}
  const st=_histExtLoad();
  const ps=_histExtEnsureProxyPresets();
  const presets = ps.presets || [];
  const selPresetId = ps.sel || '';
  const selPreset = presets.find(p=>p.id===selPresetId) || presets[0] || {id:'',name:'기본'};
  const proxy = _histExtProxyLoad();
  const pCfg = _histExtProxyCfgLoad();
  const tSel = _histExtTargetLoad();
  const keyword = String(st.keyword||'').trim();
  const srcSel = String(st.sourceSel||'').trim();
  const srcOptions = [...new Set((st.items||[]).map(x=>String(x.source||'').trim()).filter(Boolean))].sort((a,b)=>a.localeCompare(b));
  const today=st.today||(()=>{const d=new Date();const y=d.getFullYear();const m=String(d.getMonth()+1).padStart(2,'0');const da=String(d.getDate()).padStart(2,'0');return `${y}-${m}-${da}`;})();
  // 초기 렌더
  const initItems = (st.items||[]);
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
        <div style="border:1px solid var(--border);border-radius:10px;padding:8px;background:var(--surface)">
          <div style="font-size:11px;color:var(--gray-l);font-weight:900">형식</div>
          <div style="font-size:13px;font-weight:1000" id="hist-ext-fmt">-</div>
        </div>
        <div style="border:1px solid var(--border);border-radius:10px;padding:8px;background:var(--surface)">
          <div style="font-size:11px;color:var(--gray-l);font-weight:900">가져온 행(원본)</div>
          <div style="font-size:13px;font-weight:1000" id="hist-ext-cnt-raw">0</div>
        </div>
        <div style="border:1px solid var(--border);border-radius:10px;padding:8px;background:var(--surface)">
          <div style="font-size:11px;color:var(--gray-l);font-weight:900">중복 제거 후</div>
          <div style="font-size:13px;font-weight:1000" id="hist-ext-cnt">0</div>
        </div>
        <div style="border:1px solid var(--border);border-radius:10px;padding:8px;background:var(--surface)">
          <div style="font-size:11px;color:var(--gray-l);font-weight:900">저장됨(누적)</div>
          <div style="font-size:13px;font-weight:1000" id="hist-ext-cnt-store">${(st.items||[]).length}</div>
        </div>
      </div>
      <div id="hist-ext-out"></div>
    </div>
  `;
}


/* 전체 통합/기록 상세 코어 블록은 `js/history-records-core.js`로 분리됨 */

/* 선수별 검색/대학 비교/대회 요약 블록은 `js/history-search-views.js`로 분리됨 */

/* 경기 이동/상세모달 블록은 `js/history-detail-move.js`로 분리됨 */

