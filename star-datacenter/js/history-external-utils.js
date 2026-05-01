/* ══════════════════════════════════════
   History External Utilities
══════════════════════════════════════ */
const _HIST_EXT_KEY='su_hist_ext_data_v1';
const _HIST_EXT_PROXY_KEY='su_hist_ext_proxy_v1';
const _HIST_EXT_PROXY_CFG_KEY='su_hist_ext_proxy_cfg_v1';
const _HIST_EXT_TARGET_KEY='su_hist_ext_target_v1';
const _HIST_EXT_PROXY_PRESETS_KEY='su_hist_ext_proxy_presets_v1';
const _HIST_EXT_PROXY_PRESET_SEL_KEY='su_hist_ext_proxy_preset_sel_v1';
window._histExtSel = window._histExtSel || new Set();
window._histExtPage = window._histExtPage || 1;
const _HIST_EXT_PAGE_SIZE = 30;

function _histExtLoad(){
  try{
    const raw = localStorage.getItem(_HIST_EXT_KEY) || '';
    if(!raw) return {items:[],raw:'',mode:'today',today:''};
    if(raw.startsWith('lz:')){
      const dec = (typeof LZString!=='undefined' && LZString.decompressFromUTF16)
        ? (LZString.decompressFromUTF16(raw.slice(3)) || '')
        : '';
      return JSON.parse(dec || 'null') || {items:[],raw:'',mode:'today',today:''};
    }
    return JSON.parse(raw||'null')||{items:[],raw:'',mode:'today',today:''};
  }catch(e){
    console.warn('[_histExtLoad] localStorage 로드 실패:', e.message);
    return {items:[],raw:'',mode:'today',today:''};
  }
}
function _histExtSave(v){
  try{
    const json = JSON.stringify(v);
    const packed = (typeof LZString!=='undefined' && LZString.compressFromUTF16)
      ? ('lz:' + LZString.compressFromUTF16(json))
      : json;
    localStorage.setItem(_HIST_EXT_KEY, packed);
    try{ localStorage.setItem('su_hist_ext_last_modified', String(Date.now())); }catch(e){}
    try{ window._scheduleCloudAppSettingsSave && window._scheduleCloudAppSettingsSave(); }catch(e){}
    return true;
  }catch(e){
    console.warn('[_histExtSave] localStorage 저장 실패:', e.message);
    return false;
  }
}
function _histExtUid(){ return 'hex_'+Date.now().toString(36)+Math.random().toString(36).slice(2,6); }

function _histExtProxyPresetsLoad(){
  try{
    const arr = JSON.parse(localStorage.getItem(_HIST_EXT_PROXY_PRESETS_KEY)||'null');
    return Array.isArray(arr) ? arr : [];
  }catch(e){
    console.warn('[_histExtProxyPresetsLoad] 프리셋 로드 실패:', e.message);
    return [];
  }
}
function _histExtProxyPresetsSave(arr){
  try{
    localStorage.setItem(_HIST_EXT_PROXY_PRESETS_KEY, JSON.stringify(Array.isArray(arr)?arr:[]));
  }catch(e){
    console.warn('[_histExtProxyPresetsSave] 프리셋 저장 실패:', e.message);
  }
}
function _histExtProxyPresetSelLoad(){
  try{
    return localStorage.getItem(_HIST_EXT_PROXY_PRESET_SEL_KEY)||'';
  }catch(e){
    console.warn('[_histExtProxyPresetSelLoad] 선택된 프리셋 로드 실패:', e.message);
    return '';
  }
}
function _histExtProxyPresetSelSave(id){
  try{
    localStorage.setItem(_HIST_EXT_PROXY_PRESET_SEL_KEY, String(id||''));
  }catch(e){
    console.warn('[_histExtProxyPresetSelSave] 프리셋 선택 저장 실패:', e.message);
  }
}
function _histExtEnsureProxyPresets(){
  let presets = _histExtProxyPresetsLoad();
  let sel = _histExtProxyPresetSelLoad();
  if(!presets.length){
    const legacyProxy = (()=>{
      try{ return localStorage.getItem(_HIST_EXT_PROXY_KEY)||''; }
      catch(e){ console.warn('[_histExtEnsureProxyPresets] 레거시 프록시 로드 실패:', e.message); return ''; }
    })();
    const legacyCfg = (()=>{
      try{ return JSON.parse(localStorage.getItem(_HIST_EXT_PROXY_CFG_KEY)||'null')||{}; }
      catch(e){ console.warn('[_histExtEnsureProxyPresets] 레거시 설정 로드 실패:', e.message); return {}; }
    })();
    presets = [{
      id: _histExtUid(),
      name: '기본',
      proxy: legacyProxy || '',
      bo: legacyCfg.bo || 'bj_board',
      pFrom: legacyCfg.pFrom || 1,
      pTo: legacyCfg.pTo || 6
    }];
    sel = presets[0].id;
    _histExtProxyPresetsSave(presets);
    _histExtProxyPresetSelSave(sel);
  }
  if(!sel || !presets.some(p=>p.id===sel)){
    sel = presets[0]?.id || '';
    _histExtProxyPresetSelSave(sel);
  }
  return {presets, sel};
}
function _histExtGetSelPreset(){
  const {presets, sel} = _histExtEnsureProxyPresets();
  return presets.find(p=>p.id===sel) || presets[0] || null;
}
function _histExtProxyLoad(){
  const p = _histExtGetSelPreset();
  try{
    return (p && p.proxy) ? String(p.proxy) : (localStorage.getItem(_HIST_EXT_PROXY_KEY)||'');
  }catch(e){
    console.warn('[_histExtProxyLoad] 프록시 로드 실패:', e.message);
    return '';
  }
}
function _histExtProxySave(v){
  try{
    localStorage.setItem(_HIST_EXT_PROXY_KEY, String(v||''));
  }catch(e){
    console.warn('[_histExtProxySave] 프록시 저장 실패:', e.message);
  }
}
function _histExtProxyCfgLoad(){
  const p = _histExtGetSelPreset();
  if(p) return {bo:p.bo||'bj_board', pFrom:p.pFrom||1, pTo:p.pTo||6};
  try{
    return JSON.parse(localStorage.getItem(_HIST_EXT_PROXY_CFG_KEY)||'null')||{};
  }catch(e){
    console.warn('[_histExtProxyCfgLoad] 프록시 설정 로드 실패:', e.message);
    return {};
  }
}
function _histExtProxyCfgSave(obj){
  try{
    localStorage.setItem(_HIST_EXT_PROXY_CFG_KEY, JSON.stringify(obj||{}));
  }catch(e){
    console.warn('[_histExtProxyCfgSave] 프록시 설정 저장 실패:', e.message);
  }
}
function _histExtTargetLoad(){
  try{
    return localStorage.getItem(_HIST_EXT_TARGET_KEY)||'';
  }catch(e){
    console.warn('[_histExtTargetLoad] 타겟 로드 실패:', e.message);
    return '';
  }
}
function _histExtTargetSave(v){
  try{
    localStorage.setItem(_HIST_EXT_TARGET_KEY, String(v||''));
  }catch(e){
    console.warn('[_histExtTargetSave] 타겟 저장 실패:', e.message);
  }
}
function _histExtNormDate(s){
  if(!s) return '';
  let t=String(s).trim().replace(/\./g,'-').replace(/\//g,'-').replace(/\s+/g,' ');
  const m=t.match(/(\d{2,4})-(\d{1,2})-(\d{1,2})/);
  if(!m) return '';
  let y=parseInt(m[1],10); if(y<100) y+=2000;
  const mo=String(parseInt(m[2],10)).padStart(2,'0');
  const da=String(parseInt(m[3],10)).padStart(2,'0');
  return `${y}-${mo}-${da}`;
}
function _histExtParseHTMLTable(html){
  try{
    const doc=new DOMParser().parseFromString(html,'text/html');
    const tables=[...doc.querySelectorAll('table')];
    if(!tables.length) return null;
    let bestRows=null, bestScore=-1;
    const norm = (s)=>String(s||'').replace(/\s+/g,'').toLowerCase();
    tables.forEach(t=>{
      const rows=[...t.querySelectorAll('tr')].map(tr=>[...tr.querySelectorAll('th,td')].map(td=>td.textContent.trim())).filter(r=>r.length);
      if(!rows.length) return;
      const header = rows[0] ? rows[0].map(norm).join('|') : '';
      let score = rows.length;
      if(header.includes('날짜') && header.includes('승자') && header.includes('패자')) score += 1000;
      if(header.includes('맵')) score += 200;
      if(header.includes('elo')) score += 120;
      if(header.includes('경기방식') || header.includes('방식')) score += 80;
      if(header.includes('메모') || header.includes('비고')) score += 40;
      if(score > bestScore){ bestScore = score; bestRows = rows; }
    });
    return bestRows;
  }catch(e){ return null; }
}
function _histExtParseTextTable(text){
  const lines=String(text||'').split(/\r?\n/).map(l=>l.trim()).filter(Boolean);
  if(!lines.length) return null;
  const byTab=lines.map(line=>line.split(/\t+/).map(x=>x.trim()).filter(Boolean));
  if(byTab.some(r=>r.length>=5)) return byTab;
  const bySpace=lines.map(line=>line.split(/\s{2,}/).map(x=>x.trim()).filter(Boolean));
  return bySpace.some(r=>r.length>=5) ? bySpace : null;
}
function _histExtFindHeaderIdx(rows){
  const hdr = rows && rows.length ? rows[0] : null;
  if(!hdr) return null;
  const idx = {};
  const norm = (s)=>String(s||'').replace(/\s+/g,'').toLowerCase();
  hdr.forEach((c,i)=>{
    const t = norm(c);
    if(!t) return;
    if(t.includes('날짜')||t.includes('date')) idx.date=i;
    else if(t.includes('승자')||t.includes('winner')) idx.winner=i;
    else if(t.includes('패자')||t.includes('loser')) idx.loser=i;
    else if(t==='맵'||t.includes('map')) idx.map=i;
    else if(t.includes('elo')) idx.elo=i;
    else if(t.includes('경기방식')||t.includes('방식')||t.includes('type')) idx.type=i;
    else if(t.includes('메모')||t.includes('비고')||t.includes('memo')) idx.memo=i;
  });
  return (idx.date!=null && idx.winner!=null && idx.loser!=null) ? idx : null;
}
function _histExtMapRows(rows){
  const header=(rows[0]||[]).join(' ');
  const hasHeader=/날짜|승자|패자|맵|ELO|경기방식/i.test(header);
  const hdrIdx = hasHeader ? _histExtFindHeaderIdx(rows) : null;
  const body=hasHeader?rows.slice(1):rows.slice();
  const out=[];
  body.forEach(r=>{
    if(!r || r.length<5) return;
    const d=_histExtNormDate(hdrIdx ? r[hdrIdx.date] : r[0]);
    if(!d) return;
    out.push({
      date:d,
      winner:(hdrIdx ? r[hdrIdx.winner] : r[1])||'',
      loser:(hdrIdx ? r[hdrIdx.loser] : r[2])||'',
      map:(hdrIdx && hdrIdx.map!=null ? r[hdrIdx.map] : r[3])||'',
      elo:(hdrIdx && hdrIdx.elo!=null ? r[hdrIdx.elo] : r[4])||'',
      type:(hdrIdx && hdrIdx.type!=null ? r[hdrIdx.type] : r[5])||'',
      memo:(hdrIdx && hdrIdx.memo!=null ? r[hdrIdx.memo] : r[6])||'',
    });
  });
  return out;
}
function _histExtDedup(items){
  const seen=new Set();
  const out=[];
  items.forEach(x=>{
    const k=[x.source||'',x.date,x.winner,x.loser,x.map,x.elo,x.type,x.memo].join('|');
    if(seen.has(k)) return;
    seen.add(k); out.push(x);
  });
  const _normDateSort = (d)=>{
    const s=String(d||'').trim();
    if(!s) return '';
    const m=s.match(/(\d{4})[.\-/](\d{1,2})[.\-/](\d{1,2})/);
    if(m){
      const y=m[1];
      const mo=String(parseInt(m[2],10)).padStart(2,'0');
      const da=String(parseInt(m[3],10)).padStart(2,'0');
      return `${y}-${mo}-${da}`;
    }
    return s;
  };
  out.sort((a,b)=>_normDateSort(String(b.date||'')).localeCompare(_normDateSort(String(a.date||''))));
  return out;
}
function _histExtKey(x){
  return [x.source||'',x.date||'',x.winner||'',x.loser||'',x.map||'',x.elo||'',x.type||'',x.memo||''].join('|');
}
function _histExtGetViewItems(){
  const st=_histExtLoad();
  let items = st.items || [];
  const srcSel = String(st.sourceSel||'').trim();
  if(srcSel) items = items.filter(x=>String(x.source||'')===srcSel);
  const kw = String(st.keyword||'').trim();
  if(kw){
    const q = kw.toLowerCase();
    items = items.filter(x=>{
      const w = String(x.winner||'').toLowerCase();
      const l = String(x.loser||'').toLowerCase();
      const m = String(x.map||'').toLowerCase();
      const memo = String(x.memo||'').toLowerCase();
      const type = String(x.type||'').toLowerCase();
      const src  = String(x.source||'').toLowerCase();
      return w.includes(q) || l.includes(q) || m.includes(q) || memo.includes(q) || type.includes(q) || src.includes(q);
    });
  }
  return items;
}

try{
  window.HistoryExternalUtils = window.HistoryExternalUtils || {
    load: _histExtLoad,
    save: _histExtSave,
    renderKey: _histExtKey,
    getViewItems: _histExtGetViewItems
  };
}catch(e){}
