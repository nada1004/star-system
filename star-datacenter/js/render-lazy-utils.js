/* ══════════════════════════════════════
   Render Lazy Utilities
══════════════════════════════════════ */
window._lazy = window._lazy || {loaded:{}, loading:{}};
function _loadScriptOnce(src){
  return new Promise((resolve, reject)=>{
    try{
      if(window._lazy.loaded[src]) return resolve(true);
      if(window._lazy.loading[src]) return window._lazy.loading[src].then(resolve).catch(reject);
      try{
        const resolvedSrc = new URL(src, window.location.href).href;
        const existing = [...document.scripts].find(s => {
          try{ return new URL(s.src, window.location.href).href === resolvedSrc; }
          catch(e){ return false; }
        });
        if(existing){
          window._lazy.loaded[src]=true;
          return resolve(true);
        }
      }catch(e){}
      const p = new Promise((res, rej)=>{
        const s=document.createElement('script');
        s.src=src;
        s.async=true;
        s.onload=()=>{ window._lazy.loaded[src]=true; res(true); };
        s.onerror=()=>{ rej(new Error('load fail: '+src)); };
        document.head.appendChild(s);
      });
      window._lazy.loading[src]=p;
      p.then(resolve).catch(reject);
    }catch(e){ reject(e); }
  });
}
window._loadScriptOnce = window._loadScriptOnce || _loadScriptOnce;

window.ensureHtml2Canvas = window.ensureHtml2Canvas || function(){
  return window._loadScriptOnce('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js');
};
window.ensureChartJS = window.ensureChartJS || function(){
  return window._loadScriptOnce('https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js');
};

function _lazyLoadingView(T, C, title, desc){
  try{ if(T) T.textContent = title||''; }catch(e){}
  try{
    if(C) C.innerHTML =
      `<div class="empty-state"><div class="empty-state-icon">⏳</div>`+
      `<div class="empty-state-title">${title||'로딩 중...'}</div>`+
      `<div class="empty-state-desc">${desc||'최초 1회만 로드됩니다.'}</div></div>`;
  }catch(e){}
}

async function _ensureRouletteLoaded(){
  const scripts=[
    'js/roulette.js?v=20260424-08',
    'js/duck-race.js?v=20260424-04',
    'js/wheel.js?v=20260416-08',
  ];
  for(const src of scripts) await _loadScriptOnce(src);
}
async function _ensureStatsLoaded(){
  await window.ensureChartJS();
  await _loadScriptOnce('js/stats.js?v=20260502-02');
}
async function _ensureCalendarLoaded(){
  await _loadScriptOnce('js/calendar.js?v=20260422-01');
}
try{
  const _prewarmCalendar = ()=>{ try{ _ensureCalendarLoaded(); }catch(e){} };
  if(typeof window.requestIdleCallback === 'function'){
    window.requestIdleCallback(_prewarmCalendar, { timeout: 2500 });
  }else{
    setTimeout(_prewarmCalendar, 1200);
  }
}catch(e){}
async function _ensureVoteLoaded(){
  await window.ensureHtml2Canvas();
  await _loadScriptOnce('js/vote.js');
}
async function _ensureCloudBoardLoaded(){
  await window.ensureHtml2Canvas();
  await _loadScriptOnce('js/sync/cloud-apply.js?v=20260502-01');
  await _loadScriptOnce('js/sync/cloud-status.js?v=20260502-01');
  await _loadScriptOnce('js/cloud-board.js?v=20260502-03');
}
async function _ensureSettingsLoaded(){
  await _loadScriptOnce('js/settings/font-controls.js?v=20260502-01');
  await _loadScriptOnce('js/settings/ui-scale-controls.js?v=20260502-01');
  await _loadScriptOnce('js/settings.js?v=20260502-01');
}
function _lazyGsSetStatus(msg, color='var(--gray-l)'){
  try{
    const el = document.getElementById('cloudStatus');
    if(el){ el.textContent = msg || ''; el.style.color = color || 'var(--gray-l)'; }
  }catch(e){}
}
async function _ensureCloudFeatureReady(){
  try{
    await _ensureCloudBoardLoaded();
    return true;
  }catch(e){
    console.error('[lazy] cloud feature load fail', e);
    return false;
  }
}
async function _lazyFbCloudSave(opts){
  const ok = await _ensureCloudFeatureReady();
  if(!ok) throw new Error('cloud-board load fail');
  const fn = window.fbCloudSave;
  if(typeof fn === 'function' && fn !== _lazyFbCloudSave) return fn(opts);
  throw new Error('fbCloudSave unavailable');
}
async function _lazyFbUpdate(patch){
  const ok = await _ensureCloudFeatureReady();
  if(!ok) throw new Error('cloud-board load fail');
  const fn = window.fbUpdate;
  if(typeof fn === 'function' && fn !== _lazyFbUpdate) return fn(patch);
  throw new Error('fbUpdate unavailable');
}
async function _lazyCloudLoad(){
  const ok = await _ensureCloudFeatureReady();
  if(!ok) throw new Error('cloud-board load fail');
  const fn = window.cloudLoad;
  if(typeof fn === 'function' && fn !== _lazyCloudLoad) return fn();
  throw new Error('cloudLoad unavailable');
}
window.gsSetStatus = window.gsSetStatus || _lazyGsSetStatus;
window.fbCloudSave = window.fbCloudSave || _lazyFbCloudSave;
window.fbUpdate = window.fbUpdate || _lazyFbUpdate;
window.cloudLoad = window.cloudLoad || _lazyCloudLoad;
async function _ensureElboardLoaded(){
  await _loadScriptOnce('js/elboard.js?v=20260422-01');
}
function _lazyRCfg(C, T){
  _lazyLoadingView(T, C, '설정', '설정 모듈을 불러오는 중...');
  (async()=>{
    try{
      await _ensureSettingsLoaded();
      const fn = window.rCfg;
      if(typeof fn === 'function' && fn !== _lazyRCfg) fn(C, T);
      else render(true);
    }catch(e){
      console.error('[lazy] settings load fail', e);
      try{
        if(C) C.innerHTML='<div class="empty-state"><div class="empty-state-icon">⚠️</div><div class="empty-state-title">설정 로딩 실패</div><div class="empty-state-desc">새로고침 후 다시 시도해주세요.</div></div>';
      }catch(_){}
    }
  })();
}
function _lazyCfgGo(secId){
  (async()=>{
    try{
      await _ensureSettingsLoaded();
      const fn = window.cfgGo;
      if(typeof fn === 'function' && fn !== _lazyCfgGo) fn(secId);
      else{
        if(typeof window._goTopTab === 'function') window._goTopTab('cfg');
      }
    }catch(e){
      console.error('[lazy] cfgGo load fail', e);
      try{ alert('설정 로딩 실패: 새로고침 후 다시 시도해주세요.'); }catch(_){}
    }
  })();
}
function _lazyReCfg(){
  (async()=>{
    try{
      await _ensureSettingsLoaded();
      const fn = window.reCfg;
      if(typeof fn === 'function' && fn !== _lazyReCfg) fn();
      else render(true);
    }catch(e){
      console.error('[lazy] reCfg load fail', e);
    }
  })();
}
async function _ensureChatbotLoaded(){
  await _loadScriptOnce('js/chatbot.js?v=20260430-01');
}
function _lazyOpenChatbot(mode){
  (async()=>{
    try{
      await _ensureChatbotLoaded();
      const fn = window.openChatbot;
      if(typeof fn === 'function' && fn !== _lazyOpenChatbot) fn(mode);
    }catch(e){
      console.error('[lazy] chatbot load fail', e);
      try{ alert('챗봇 로딩 실패: 새로고침 후 다시 시도해주세요.'); }catch(_){}
    }
  })();
}
function _lazyCloseChatbot(ev){
  (async()=>{
    try{
      await _ensureChatbotLoaded();
      const fn = window.closeChatbot;
      if(typeof fn === 'function' && fn !== _lazyCloseChatbot) fn(ev);
    }catch(e){}
  })();
}
function _lazySendMessage(){
  (async()=>{
    try{
      await _ensureChatbotLoaded();
      const fn = window.sendMessage;
      if(typeof fn === 'function' && fn !== _lazySendMessage) fn();
    }catch(e){}
  })();
}
function _lazyClearChatHistory(){
  (async()=>{
    try{
      await _ensureChatbotLoaded();
      const fn = window.clearChatHistory;
      if(typeof fn === 'function' && fn !== _lazyClearChatHistory) fn();
    }catch(e){}
  })();
}
window.openChatbot = window.openChatbot || _lazyOpenChatbot;
window.closeChatbot = window.closeChatbot || _lazyCloseChatbot;
window.sendMessage = window.sendMessage || _lazySendMessage;
window.clearChatHistory = window.clearChatHistory || _lazyClearChatHistory;
window.rCfg = window.rCfg || _lazyRCfg;
window.cfgGo = window.cfgGo || _lazyCfgGo;
window.reCfg = window.reCfg || _lazyReCfg;

try{
  window.RenderLazyUtils = window.RenderLazyUtils || {
    loadScriptOnce: _loadScriptOnce,
    lazyLoadingView: _lazyLoadingView
  };
}catch(e){}
