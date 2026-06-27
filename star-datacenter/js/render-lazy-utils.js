/* ══════════════════════════════════════
   Render Lazy Utilities
══════════════════════════════════════ */
window._lazy = window._lazy || {loaded:{}, loading:{}};
function _loadScriptOnce(src){
  return new Promise((resolve, reject)=>{
    try{
      const _canonKey = (u)=>{
        try{
          const url = new URL(u, window.location.href);
          const isSameOrigin = url.origin === window.location.origin;
          if(!isSameOrigin) return url.href;
          if(!String(url.pathname||'').toLowerCase().endsWith('.js')) return url.href;
          return url.origin + url.pathname;
        }catch(e){
          return String(u||'');
        }
      };
      const key = _canonKey(src);
      if(window._lazy.loaded[src] || window._lazy.loaded[key]) return resolve(true);
      if(window._lazy.loading[src] || window._lazy.loading[key]) return (window._lazy.loading[src] || window._lazy.loading[key]).then(resolve).catch(reject);
      try{
        const resolvedSrc = new URL(src, window.location.href).href;
        const resolvedKey = _canonKey(resolvedSrc);
        const existing = [...document.scripts].find(s => {
          try{
            const ex = new URL(s.src, window.location.href).href;
            return ex === resolvedSrc || _canonKey(ex) === resolvedKey;
          }
          catch(e){ return false; }
        });
        if(existing){
          window._lazy.loaded[src]=true;
          window._lazy.loaded[key]=true;
          return resolve(true);
        }
      }catch(e){}
      const p = new Promise((res, rej)=>{
        const _try = (u, retrying)=>{
          const s=document.createElement('script');
          s.src=u;
          s.async=true;
          s.onload=()=>{
            try{ window._lazy.loaded[src]=true; }catch(e){}
            try{ window._lazy.loaded[u]=true; }catch(e){}
            try{ window._lazy.loaded[key]=true; }catch(e){}
            try{ window._lazy.loaded[_canonKey(u)]=true; }catch(e){}
            res(true);
          };
          s.onerror=()=>{
            // 일부 호스팅/환경에서 쿼리스트링(?)이 붙은 로컬 경로 로드가 실패하는 케이스가 있어 1회만 재시도
            if(!retrying && typeof u==='string' && u.includes('?')){
              try{
                const base = u.split('?')[0];
                if(base && base !== u) return _try(base, true);
              }catch(e){}
            }
            rej(new Error('load fail: '+u));
          };
          document.head.appendChild(s);
        };
        _try(src, false);
      });
      window._lazy.loading[src]=p;
      window._lazy.loading[key]=p;
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
    'js/wheel.js?v=20260529-01',
    'js/duck-race.js?v=20260424-04',
    'js/roulette.js?v=20260529-01',
  ];
  for(const src of scripts) await _loadScriptOnce(src);
}
async function _ensureStatsLoaded(){
  await window.ensureChartJS();
  await _loadScriptOnce('js/sharecard-normalize.js?v=20260503-01');
  await _loadScriptOnce('js/sharecard-theme.js?v=20260503-05');
  await _loadScriptOnce('js/sharecard-team.js?v=20260517-01');
  await _loadScriptOnce('js/stats-core-utils.js?v=20260503-02');
  await _loadScriptOnce('js/stats-tier-rank-utils.js?v=20260503-01');
  await _loadScriptOnce('js/stats-heatmap-utils.js?v=20260503-01');
  await _loadScriptOnce('js/stats-period-utils.js?v=20260503-01');
  await _loadScriptOnce('js/stats-period-renderer.js?v=20260503-01');
  await _loadScriptOnce('js/stats-tierwin-renderer.js?v=20260503-01');
  await _loadScriptOnce('js/stats-heatmap-renderer.js?v=20260503-01');
  await _loadScriptOnce('js/stats-maprank-renderer.js?v=20260503-01');
  await _loadScriptOnce('js/stats-univmatrix-renderer.js?v=20260503-01');
  await _loadScriptOnce('js/stats-advanced-renderers.js?v=20260627-01');
  await _loadScriptOnce('js/stats-export-utils.js?v=20260503-01');
  await _loadScriptOnce('js/sharecard-runtime.js?v=20260517-01');
  await _loadScriptOnce('js/sharecard-render-entity.js?v=20260504-03');
  await _loadScriptOnce('js/sharecard-render-match-helpers.js?v=20260503-01');
  await _loadScriptOnce('js/sharecard-render-match-score.js?v=20260503-01');
  await _loadScriptOnce('js/sharecard-render-match-layout.js?v=20260504-02');
  await _loadScriptOnce('js/sharecard-render-match-shell.js?v=20260504-01');
  await _loadScriptOnce('js/sharecard-render-match-sections.js?v=20260503-02');
  await _loadScriptOnce('js/sharecard-render-match-context.js?v=20260503-01');
  await _loadScriptOnce('js/sharecard-render-match-utils.js?v=20260517-01');
  await _loadScriptOnce('js/sharecard-render-match-pipeline.js?v=20260517-01');
  await _loadScriptOnce('js/sharecard-match-openers.js?v=20260503-01');
  await _loadScriptOnce('js/stats.js?v=' + (window.SU_STATS_JS_V || '20260516-01'));
}
window._ensureShareCardRuntime = window._ensureShareCardRuntime || async function(){
  await _loadScriptOnce('js/stats-core-utils.js?v=20260503-02');
  await _loadScriptOnce('js/stats-tier-rank-utils.js?v=20260503-01');
  await _loadScriptOnce('js/stats-heatmap-utils.js?v=20260503-01');
  await _loadScriptOnce('js/stats-period-utils.js?v=20260503-01');
  await _loadScriptOnce('js/stats-period-renderer.js?v=20260503-01');
  await _loadScriptOnce('js/stats-tierwin-renderer.js?v=20260503-01');
  await _loadScriptOnce('js/stats-heatmap-renderer.js?v=20260503-01');
  await _loadScriptOnce('js/stats-maprank-renderer.js?v=20260503-01');
  await _loadScriptOnce('js/stats-univmatrix-renderer.js?v=20260503-01');
  await _loadScriptOnce('js/stats-advanced-renderers.js?v=20260627-01');
  await _loadScriptOnce('js/stats-export-utils.js?v=20260503-01');
  await _loadScriptOnce('js/sharecard-normalize.js?v=20260503-01');
  await _loadScriptOnce('js/sharecard-theme.js?v=20260503-05');
  await _loadScriptOnce('js/sharecard-team.js?v=20260517-01');
  await _loadScriptOnce('js/sharecard-runtime.js?v=20260517-01');
  await _loadScriptOnce('js/sharecard-render-entity.js?v=20260504-03');
  await _loadScriptOnce('js/sharecard-render-match-helpers.js?v=20260503-01');
  await _loadScriptOnce('js/sharecard-render-match-score.js?v=20260503-01');
  await _loadScriptOnce('js/sharecard-render-match-layout.js?v=20260504-02');
  await _loadScriptOnce('js/sharecard-render-match-shell.js?v=20260504-01');
  await _loadScriptOnce('js/sharecard-render-match-sections.js?v=20260503-02');
  await _loadScriptOnce('js/sharecard-render-match-context.js?v=20260503-01');
  await _loadScriptOnce('js/sharecard-render-match-utils.js?v=20260517-01');
  await _loadScriptOnce('js/sharecard-render-match-pipeline.js?v=20260517-01');
  await _loadScriptOnce('js/sharecard-match-openers.js?v=20260503-01');
  await _loadScriptOnce('js/stats.js?v=' + (window.SU_STATS_JS_V || '20260516-01'));
};
async function _ensureCalendarLoaded(){
  await _loadScriptOnce('js/calendar.js?v=20260504-02');
}
try{
  const _prewarmCalendar = ()=>{ try{ _ensureCalendarLoaded(); }catch(e){} };
  if(typeof window.requestIdleCallback === 'function'){
    window.requestIdleCallback(_prewarmCalendar, { timeout: 2500 });
  }else{
    setTimeout(_prewarmCalendar, 1200);
  }
}catch(e){}
// 앱 초기화 후 idle에 전체 플레이어 프로필 이미지 미리 로드
// → 스트리머탭/현황판탭 진입 시 이미 캐시에 있어 즉시 표시
try{
  const _prewarmAllProfileImages = ()=>{
    try{
      if(typeof prewarmImageUrls !== 'function') return;
      if(!Array.isArray(window.players)) return;
      const urls = [];
      window.players.forEach(p=>{
        if(!p) return;
        if(p.photo) urls.push(p.photo);
      });
      prewarmImageUrls(urls, 240);
    }catch(e){}
  };
  // 데이터 로드가 완료된 뒤 실행되도록 500ms 후 idle 큐에 등록
  const _scheduleProfilePrewarm = ()=>{
    if(typeof window.requestIdleCallback === 'function'){
      window.requestIdleCallback(_prewarmAllProfileImages, { timeout: 3000 });
    }else{
      setTimeout(_prewarmAllProfileImages, 800);
    }
  };
  setTimeout(_scheduleProfilePrewarm, 500);
}catch(e){}
try{
  const _prewarmShareCard = ()=>{ try{ window._ensureShareCardRuntime && window._ensureShareCardRuntime(); }catch(e){} };
  if(typeof window.requestIdleCallback === 'function'){
    window.requestIdleCallback(_prewarmShareCard, { timeout: 2200 });
  }else{
    setTimeout(_prewarmShareCard, 900);
  }
}catch(e){}
async function _ensureVoteLoaded(){
  await window.ensureHtml2Canvas();
  await _loadScriptOnce('js/vote.js');
}
async function _ensureCloudBoardLoaded(){
  await window.ensureHtml2Canvas();
  await _loadScriptOnce('js/sync/cloud-apply.js?v=20260502-04');
  await _loadScriptOnce('js/sync/cloud-status.js?v=20260503-01');
  await _loadScriptOnce('js/cloud-board.js?v=20260502-05');
}
async function _ensureSettingsLoaded(){
  await _loadScriptOnce('js/settings/font-controls.js?v=20260502-01');
  await _loadScriptOnce('js/settings/ui-scale-controls.js?v=20260502-01');
  await _loadScriptOnce('js/settings/team-colors.js?v=20260503-01');
  await _loadScriptOnce('js/settings/sharecard.js?v=20260503-01');
  await _loadScriptOnce('js/settings.js?v=20260521-v29');
  await _loadScriptOnce('js/settings-render.js?v=20260521-v29');
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
      // else: 무한루프 방지 - settings 로드 후에도 rCfg 없으면 에러 표시
      else if(C) C.innerHTML='<div class="empty-state"><div class="empty-state-icon">⚠️</div><div class="empty-state-title">설정 로딩 실패</div><div class="empty-state-desc">새로고침(F5) 후 다시 시도해주세요.</div></div>';
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
      // else: settings 로드 후에도 reCfg 없으면 무시 (무한루프 방지)
    }catch(e){
      console.error('[lazy] reCfg load fail', e);
    }
  })();
}
async function _ensureChatbotLoaded(){
  await _loadScriptOnce('js/chatbot.js?v=20260623-01');
  await _loadScriptOnce('js/chatbot-utils.js?v=20260623-01');
  await _loadScriptOnce('js/chatbot-fuzzy.js?v=20260623-01');
  await _loadScriptOnce('js/chatbot-sync.js?v=20260623-01');
  await _loadScriptOnce('js/chatbot-aibot.js?v=20260623-01');
  await _loadScriptOnce('js/chatbot-formatters.js?v=20260623-01');
  await _loadScriptOnce('js/chatbot-formatters-player-card.js?v=20260623-01');
  await _loadScriptOnce('js/chatbot-formatters-recent.js?v=20260623-01');
  await _loadScriptOnce('js/chatbot-formatters-stats.js?v=20260623-01');
  await _loadScriptOnce('js/chatbot-formatters-matches.js?v=20260623-01');
  await _loadScriptOnce('js/chatbot-formatters-records.js?v=20260623-01');
  await _loadScriptOnce('js/chatbot-formatters-search.js?v=20260623-01');
  await _loadScriptOnce('js/chatbot-formatters-tournaments.js?v=20260623-01');
  await _loadScriptOnce('js/chatbot-formatters-univ.js?v=20260623-01');
  await _loadScriptOnce('js/chatbot-handlers.js?v=20260623-01');
  await _loadScriptOnce('js/chatbot-ui.js?v=20260623-01');
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
