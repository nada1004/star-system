/* ══════════════════════════════════════
   ⚙️ settings.js — 설정 탭 전용
   tier-tour.js에서 분리됨. 이 파일의 버그가 티어대회 탭에 영향을 주지 않습니다.
══════════════════════════════════════ */

// ─────────────────────────────────────────────────────────────
// HTML escape (설정 화면 템플릿 문자열 안전 처리)
// window.escHTML은 constants.js에서 전역 단일 정의됨
// ─────────────────────────────────────────────────────────────
function esc(s){ return window.escHTML(s); }

try{
  if(!window._cfgB2LogoOverlayKey) window._cfgB2LogoOverlayKey = 'su_b2_univ_logo_overlay_v1';
  window._cfgB2LogoOverlayDefault = function(){
    return { wmGlobalOn: 1, wmOn: 1, wmScale: 150, wmRight: 120, wmBottom: 30, bgScale: 100 };
  };
  window._cfgB2LogoOverlayReadAll = function(){
    const def = window._cfgB2LogoOverlayDefault();
    try{
      const raw = String(localStorage.getItem(window._cfgB2LogoOverlayKey) || '').trim();
      const parsed = raw ? (JSON.parse(raw) || {}) : {};
      const root = (parsed && typeof parsed === 'object') ? parsed : {};
      const d = (root.default && typeof root.default === 'object') ? root.default : {};
      const per = (root.perUniv && typeof root.perUniv === 'object') ? root.perUniv : {};
      root.default = Object.assign({}, def, d);
      root.perUniv = per;
      return root;
    }catch(e){
      return { default: def, perUniv: {} };
    }
  };
  window._cfgB2LogoOverlayGet = function(univName){
    const root = window._cfgB2LogoOverlayReadAll();
    const def = (root.default && typeof root.default === 'object') ? root.default : window._cfgB2LogoOverlayDefault();
    const u = String(univName||'').trim();
    const over = (u && root.perUniv && root.perUniv[u] && typeof root.perUniv[u] === 'object') ? root.perUniv[u] : {};
    return Object.assign({}, def, over);
  };
  window._cfgB2LogoOverlaySave = function(root){
    try{ localStorage.setItem(window._cfgB2LogoOverlayKey, JSON.stringify(root || {})); }catch(e){}
  };
  window._cfgB2LogoOverlaySet = function(univName, key, value){
    const u = String(univName||'').trim();
    const root = window._cfgB2LogoOverlayReadAll();
    if(!key) return;
    const vNum = (value===''||value==null) ? null : Number(value);
    const v = (vNum==null || isNaN(vNum)) ? null : vNum;
    const clamp = (k, n)=>{
      if(k === 'wmGlobalOn') return n ? 1 : 0;
      if(k === 'wmOn') return n ? 1 : 0;
      if(k === 'wmScale') return Math.max(50, Math.min(250, n));
      if(k === 'wmRight') return Math.max(0, Math.min(260, n));
      if(k === 'wmBottom') return Math.max(0, Math.min(160, n));
      if(k === 'bgScale') return Math.max(60, Math.min(120, n));
      return n;
    };
    if(!u || u === '__ALL__'){
      root.default = root.default || window._cfgB2LogoOverlayDefault();
      if(v == null) delete root.default[key];
      else root.default[key] = clamp(key, v);
      window._cfgB2LogoOverlaySave(root);
      return;
    }
    if(key === 'wmGlobalOn'){
      return;
    }
    root.perUniv = root.perUniv || {};
    root.perUniv[u] = (root.perUniv[u] && typeof root.perUniv[u] === 'object') ? root.perUniv[u] : {};
    if(v == null) delete root.perUniv[u][key];
    else root.perUniv[u][key] = clamp(key, v);
    if(!Object.keys(root.perUniv[u]).length) delete root.perUniv[u];
    window._cfgB2LogoOverlaySave(root);
  };
  window._cfgB2LogoOverlayReset = function(univName){
    const u = String(univName||'').trim();
    const root = window._cfgB2LogoOverlayReadAll();
    if(!u || u === '__ALL__'){
      try{ localStorage.removeItem(window._cfgB2LogoOverlayKey); }catch(e){}
      return;
    }
    if(root.perUniv && root.perUniv[u]) delete root.perUniv[u];
    window._cfgB2LogoOverlaySave(root);
  };
  window._cfgSoftRefreshBoard2 = function(){
    try{
      if(typeof window.curTab !== 'undefined' && window.curTab === 'board2' && typeof window.rBoard2 === 'function'){
        const C=document.getElementById('rcont');
        const T=document.getElementById('rtitle');
        if(C && T) window.rBoard2(C,T);
      }
    }catch(e){}
  };
  window._cfgSoftRefreshLive = function(){
    try{
      if(typeof window.curTab !== 'undefined' && window.curTab === 'cfg') return;
      if(typeof window.render === 'function') window.render(true);
      else if(typeof window.renderNow === 'function') window.renderNow();
    }catch(e){}
  };
  window.cfgGetB2UnivProfileView = function(){
    try{
      const raw = String(localStorage.getItem('su_b2_univ_profile_view') || '').trim();
      if(raw === 'card') return 'poster';
      if(raw === 'compact' || raw === 'media') return 'default';
      return ['default','poster','heat','split','board'].includes(raw) ? raw : 'default';
    }catch(e){
      return 'default';
    }
  };
  window.cfgSetB2UnivProfileView = function(mode){
    const next = ['default','poster','heat','split','board'].includes(String(mode||'')) ? String(mode) : 'default';
    try{ localStorage.setItem('su_b2_univ_profile_view', next); }catch(e){}
    try{ window._cfgSoftRefreshBoard2 && window._cfgSoftRefreshBoard2(); }catch(e){}
    try{ if(typeof window.cfgTouchPrefsSync==='function') window.cfgTouchPrefsSync(); }catch(e){}
  };
  window._cfgB2LogoOverlayUiSync = function(){
    try{
      const selEl = document.getElementById('cfg-b2-wm-univ');
      const sel = selEl ? (selEl.value || '__ALL__') : '__ALL__';
      const cfg = (typeof window._cfgB2LogoOverlayGet==='function') ? window._cfgB2LogoOverlayGet(sel) : window._cfgB2LogoOverlayDefault();
      const setV=(id,v)=>{ const el=document.getElementById(id); if(el) el.value=String(v); };
      const setT=(id,t)=>{ const el=document.getElementById(id); if(el) el.textContent=String(t); };
      const setC=(id,on)=>{ const el=document.getElementById(id); if(el) el.checked=!!on; };
      const gOn = (cfg.wmGlobalOn==null) ? 1 : !!Number(cfg.wmGlobalOn);
      const wmOn = (cfg.wmOn==null) ? 1 : !!Number(cfg.wmOn);
      const wmScale = parseInt(cfg.wmScale||150,10);
      const wmRight = parseInt(cfg.wmRight||120,10);
      const wmBottom = parseInt(cfg.wmBottom||30,10);
      const bgScale = parseInt(cfg.bgScale||100,10);
      setC('cfg-b2-wm-global-on', gOn);
      setC('cfg-b2-wm-on', wmOn);
      setV('cfg-b2-wm-scale', wmScale);
      setV('cfg-b2-wm-right', wmRight);
      setV('cfg-b2-wm-bottom', wmBottom);
      setV('cfg-b2-bg-scale', bgScale);
      setT('cfg-b2-wm-scale-val', wmScale+'% (x'+(wmScale/100).toFixed(2)+')');
      setT('cfg-b2-wm-right-val', wmRight+'px');
      setT('cfg-b2-wm-bottom-val', wmBottom+'px');
      setT('cfg-b2-bg-scale-val', bgScale+'%');
    }catch(e){}
  };
}catch(e){}

/* ══════════════════════════════════════
   🎨 디자인 모드 분리
   - 구현은 `js/settings/design.js`로 이동
══════════════════════════════════════ */

/* ══════════════════════════════════════
   ⚙️ 설정 섹션 접힘 상태 영속 헬퍼
══════════════════════════════════════ */
// ⚠️ tier-tour.js에도 _cfgOpen/_cfgToggle/_cfgD가 존재해서 전역이 덮어써지는 문제가 있음.
// settings.js는 고유 접두사(_scfg*)를 사용해 충돌을 원천 차단한다.
function _scfgOpen(id){try{return !!(JSON.parse(localStorage.getItem('su_cfg_open')||'{}')[id]);}catch(e){return false;}}
function _renderB2ImgSettingsWrap(){
  try{
    const wrap = document.getElementById('cfg-b2-img-settings-wrap');
    if(!wrap) return false;
    if(typeof _b2BuildImageControlGroup !== 'function') return false;
    const _shuffle = (localStorage.getItem('su_b2_profile_shuffle') ?? '1') === '1';
    const _selName = (localStorage.getItem('su_b2_swap_delay_player') || '').trim();
    const _opts = (Array.isArray(window.players) ? window.players : [])
      .map(p=>String(p&&p.name||'').trim()).filter(Boolean)
      .sort((a,b)=>a.localeCompare(b,'ko'))
      .map(n=>`<option value="${esc(n)}"${n===_selName?' selected':''}>${esc(n)}</option>`)
      .join('');
    wrap.innerHTML=`
      <div style="font-weight:700;font-size:12px;color:var(--text2);margin-bottom:10px">이미지 1 (기본 이미지)</div>
      ${_b2BuildImageControlGroup('','primary','이미지 1',true)}
      <div style="font-weight:700;font-size:12px;color:var(--text2);margin:14px 0 10px">이미지 2 (두번째 이미지)</div>
      ${_b2BuildImageControlGroup('','secondary','이미지 2',true)}
      <hr style="border:none;border-top:1px solid var(--border);margin:12px 0">
      <label style="display:flex;align-items:center;gap:8px;font-size:12px;cursor:pointer;font-weight:900;color:var(--text2)">
        <input type="checkbox" id="cfg-b2-profile-shuffle" style="width:15px;height:15px" ${_shuffle?'checked':''} onchange="localStorage.setItem('su_b2_profile_shuffle',this.checked?'1':'0');render()">
        이미지탭(프로필) 목록 랜덤(셔플)
      </label>
      <div style="font-size:11px;color:var(--gray-l);margin-top:6px">※ PC 좌/우 및 대학 필터에서도 적용됩니다(보기 재미용)</div>
      <hr style="border:none;border-top:1px dashed var(--border2);margin:14px 0">
      <div style="font-weight:900;font-size:12px;color:var(--text2);margin-bottom:10px">전환 시간(선수별)</div>
      <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-bottom:10px">
        <select id="cfg-b2-delay-player" style="flex:1;min-width:180px" onchange="localStorage.setItem('su_b2_swap_delay_player',this.value||''); if(typeof _cfgB2RenderSwapDelay==='function') _cfgB2RenderSwapDelay(this.value||'');">
          <option value="">선수 선택</option>
          ${_opts}
        </select>
        <button class="btn btn-xs btn-w" onclick="localStorage.setItem('su_b2_swap_delay_player',''); const sel=document.getElementById('cfg-b2-delay-player'); if(sel) sel.value=''; if(typeof _cfgB2RenderSwapDelay==='function') _cfgB2RenderSwapDelay('');">초기화</button>
      </div>
      <div id="cfg-b2-delay-area" style="padding:12px;background:rgba(37,99,235,.06);border:1px solid rgba(37,99,235,.18);border-radius:10px">
        <div style="font-size:12px;color:var(--gray-l)">선수를 선택하면 이미지 2→3, 3→4, 4→5 전환 시간을 설정할 수 있습니다.</div>
      </div>
    `;
    try{ if(typeof window._cfgB2RenderSwapDelay==='function') window._cfgB2RenderSwapDelay(_selName); }catch(e){}
    return true;
  }catch(e){
    return false;
  }
}

window._cfgB2RenderSwapDelay = function(playerName){
  try{
    const area = document.getElementById('cfg-b2-delay-area');
    if(!area) return;
    const name = String(playerName||'').trim();
    if(!name){
      area.innerHTML = `<div style="font-size:12px;color:var(--gray-l)">선수를 선택하면 이미지 전환 시간을 세부적으로 설정할 수 있습니다.</div>`;
      return;
    }
    const p = (Array.isArray(window.players)?window.players:[]).find(x=>x && x.name===name);
    if(!p){
      area.innerHTML = `<div style="font-size:12px;color:var(--gray-l)">선수를 찾을 수 없습니다.</div>`;
      return;
    }
    const clamp = (v)=>{ const n = parseFloat(v); if(isNaN(n)) return 1; return Math.max(0.2, Math.min(60, n)); };
    const slotOrder = [
      { slot:1, url:String(p.photo||'').trim() },
      { slot:2, url:String(p.secondProfileFile||'').trim() },
      { slot:3, url:String(p.profileFile3||'').trim() },
      { slot:4, url:String(p.profileFile4||'').trim() },
      { slot:5, url:String(p.profileFile5||'').trim() }
    ].filter(item=>!!item.url);
    const delayKey = (from, to)=>{
      if(to === 1){
        if(from === 2) return 'photoDelay21';
        if(from === 3) return 'photoDelay31';
        if(from === 4) return 'photoDelay41';
        return 'photoDelay51';
      }
      if(from === 1) return 'photoDelay12';
      if(from === 2) return 'photoDelay23';
      if(from === 3) return 'photoDelay34';
      if(from === 4) return 'photoDelay45';
      return '';
    };
    const safe = name.replace(/\\/g,'\\\\').replace(/'/g,"\\'");
    const inputsHtml = slotOrder.length < 2
      ? `<div style="font-size:12px;color:var(--gray-l)">등록된 이미지가 1개라 전환 시간이 필요하지 않습니다.</div>`
      : `<div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px">${slotOrder.map((item, idx)=>{
          const next = slotOrder[(idx + 1) % slotOrder.length];
          const key = delayKey(item.slot, next.slot);
          if(!key) return '';
          const val = clamp(p[key] ?? 1);
          return `<div>
            <div style="font-size:11px;font-weight:900;color:var(--text3);margin-bottom:6px">${item.slot} → ${next.slot} (초)</div>
            <input type="number" data-delay-key="${key}" min="0.2" max="60" step="0.1" value="${val}" style="width:100%" oninput="_cfgB2SaveSwapDelay('${safe}')">
          </div>`;
        }).join('')}</div>`;
    area.innerHTML = `
      ${inputsHtml}
      <div style="font-size:10px;color:var(--gray-l);margin-top:8px">값은 즉시 저장됩니다. 기본값(1초)은 저장하지 않습니다.</div>
    `;
  }catch(e){}
};
window._cfgB2SaveSwapDelay = function(playerName){
  try{
    const area = document.getElementById('cfg-b2-delay-area');
    if(!area) return;
    const name = String(playerName||'').trim();
    const p = (Array.isArray(window.players)?window.players:[]).find(x=>x && x.name===name);
    if(!p) return;
    const inputs = area.querySelectorAll('input[type="number"]');
    if(!inputs || !inputs.length) return;
    const clamp = (v)=>{ const n = parseFloat(v); if(isNaN(n)) return 1; return Math.max(0.2, Math.min(60, n)); };
    inputs.forEach(input=>{
      const key = String(input?.getAttribute('data-delay-key') || '').trim();
      if(!key) return;
      const v = clamp(input.value);
      if(v===1) delete p[key]; else p[key] = v;
    });
    if(typeof window.save === 'function') window.save();
    try{
      const cur = window._b2SelectedPlayer && window._b2SelectedPlayer.name;
      if(cur === name && typeof window._b2ScheduleImageSwap === 'function') window._b2ScheduleImageSwap(name);
    }catch(e){}
  }catch(e){}
};
function _ensureB2ImgSettingsWrap(retry){
  if(_renderB2ImgSettingsWrap()) return;
  if(retry === false) return;
  try{
    setTimeout(()=>{ _renderB2ImgSettingsWrap(); }, 160);
  }catch(e){}
}
function _scfgToggle(id,el){
  try{
    // 아코디언: 하나 열리면 나머지는 닫기
    if(el && el.open){
      document.querySelectorAll('[data-cfg-sec]').forEach(d=>{
        if(d!==el && d.tagName==='DETAILS') d.open=false;
      });
    }
  }catch(e){}
  try{
    const o=JSON.parse(localStorage.getItem('su_cfg_open')||'{}');
    o[id]=el.open;
    localStorage.setItem('su_cfg_open',JSON.stringify(o));
    const sp=el.querySelector('summary .cfg-toggle-txt');
    if(sp)sp.textContent=el.open?'▴ 접기':'▾ 펼치기';
  }catch(e){}
  // (요청사항) 특정 섹션은 열릴 때 동적 렌더링
  try{
    if(el && el.open && id==='pd' && typeof window._renderCfgPdSection==='function'){
      window._renderCfgPdSection();
    }
    if(el && el.open && id==='ud' && typeof window._renderCfgUdSection==='function'){
      window._renderCfgUdSection();
    }
    if(el && el.open && id==='profileshape' && typeof window._renderCfgProfileShapeSection==='function'){
      window._renderCfgProfileShapeSection();
    }
    if(el && el.open && id==='uisize' && typeof window._renderCfgUiSizeSection==='function'){
      window._renderCfgUiSizeSection();
    }
    if(el && el.open && id==='pdModeBadge' && typeof window._renderCfgPdModeBadgeSection==='function'){
      window._renderCfgPdModeBadgeSection();
    }
    if(el && el.open && id==='paste' && typeof window.cfgRenderPlayerAliasMap==='function'){
      window.cfgRenderPlayerAliasMap();
    }
    if(el && el.open && id==='datacheck' && typeof window.cfgRunDataAudit==='function'){
      window.cfgRunDataAudit();
    }
    if(el && el.open && id==='imgsettings'){
      _ensureB2ImgSettingsWrap();
    }
  }catch(e){}
}
// ─────────────────────────────────────────────────────────────
// 설정 메뉴 구성(사용자 정리 지원)
// - 카테고리 이동 + 순서 변경을 localStorage로 저장
// ─────────────────────────────────────────────────────────────
const _CFG_MENU_KEY = 'su_cfg_menu_layout_v1';

// (통합 v2) 설정 카테고리를 더 "공격적으로" 재배치/통합
// - 카드/스코어 관련 설정을 한 곳에서 찾을 수 있게 정리
// - UI(탭/버튼/폰트/모바일크기)와 자동화(멀티뷰/BGM/붙여넣기)를 분리
const _DEFAULT_CATSECS = {
  '🧩 운영/콘텐츠':['notice','tier','season','teammatch','acct','univ','maps','mAlias','paste'],
  '🖼️ 스트리머/프로필':['b2layout','imgsettings','imgmodalsettings','profileshape','univlogoimg','si','siAssign','pdModeBadge','pd','matchdetail','ud','streamerheader','streamer-view','streamer-tab-style'],
  '🧾 카드/기록':[
    'reccard','minicard','univckcard','univmcard',
    'tourneycard','tiertourcard','tiertourleaguecard','tiertourbrackcard',
    'procompcard','procompleaguecard','procompteamcard','procompgjcard',
    'h2hpanel','sharecard','calui'
  ],
  '🎨 UI/테마':['designv2','hdr','appfont','uisize','cardgap','tierrank-view','uibtn','uifilter','tablabels','tabcolors','autofitall'],
  '🧠 자동화/도구':['bgm','soopmv','pasteRoute','fab'],
  '🧩 현황판/펨코':['b2femco','femcoorder','boardchip','oldbright','boardbg','briefingfx'],
  '💾 데이터':['sync','firebase','aibot','storage','bulkdate','bulkmap','bulktier','bulkdel','bulkconv'],
  '🧪 점검/고급':['cfgmenu','datacheck','selfcheck']
};

window.cfgRunDataAudit = function(){
  const out = document.getElementById('cfg-datacheck-out');
  if(!out) return;
  const _escH = (typeof window.escHTML === 'function')
    ? window.escHTML
    : (s)=>String(s ?? '').replace(/[&<>"']/g, (m)=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const _escJ = (typeof window.escJS === 'function')
    ? window.escJS
    : (s)=>String(s ?? '').replace(/\\/g,'\\\\').replace(/'/g,"\\'").replace(/\r/g,'\\r').replace(/\n/g,'\\n');
  try{
    const allPlayers = Array.isArray(window.players) ? window.players : [];
    const players = allPlayers.filter(p => !p?.hidden && !p?.retired);
    const allUnivs = Array.isArray(window.univCfg) ? window.univCfg : [];
    const validUnivs = new Set(allUnivs
      .filter(u => u && !u.hidden && !u.dissolved)
      .map(u => String(u.name || '').trim())
      .filter(Boolean));
    const histOf = p => Array.isArray(p?.history) ? p.history.filter(Boolean) : [];
    const dateNum = (v)=>{
      if(typeof window._b2DateNum === 'function') return window._b2DateNum(v);
      const digits = String(v || '').replace(/\D/g,'');
      return digits.length >= 8 ? (parseInt(digits.slice(0,8), 10) || 0) : 0;
    };
    const fmtNum = (d)=>{
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      return parseInt(`${yyyy}${mm}${dd}`, 10);
    };
    const recentFrom = new Date();
    recentFrom.setDate(recentFrom.getDate() - 30);
    const recentFromN = fmtNum(recentFrom);
    const recentLabel = `${recentFrom.toISOString().slice(0,10)} 이후`;

    const noPhoto = players.filter(p => !String(p?.photo || '').trim());
    const noUniv = players.filter(p => !String(p?.univ || '').trim());
    const invalidUniv = players.filter(p => {
      const u = String(p?.univ || '').trim();
      return !!u && !validUnivs.has(u);
    });
    const noTier = players.filter(p => !String(p?.tier || '').trim());
    const noRecent = players.filter(p => !histOf(p).some(h => dateNum(h?.date || h?.d || '') >= recentFromN));

    const nameMap = new Map();
    players.forEach(p => {
      const key = String(p?.name || '').trim().toLowerCase();
      if(!key) return;
      if(!nameMap.has(key)) nameMap.set(key, []);
      nameMap.get(key).push(p);
    });
    const duplicateGroups = Array.from(nameMap.values()).filter(arr => arr.length > 1);

    const dateIssues = [];
    players.forEach(p => {
      histOf(p).forEach((h, idx) => {
        const raw = String(h?.date || h?.d || '').trim();
        if(!raw) return;
        if(dateNum(raw)) return;
        if(dateIssues.length < 16){
          dateIssues.push({ name:String(p?.name || ''), raw, idx });
        }
      });
    });

    const metricCard = (label, count, sub, color) => `
      <div style="padding:12px 14px;border-radius:14px;border:1px solid ${color}22;background:${color}0d;min-width:140px;flex:1">
        <div style="font-size:11px;font-weight:800;color:var(--text3)">${label}</div>
        <div style="margin-top:6px;font-size:22px;font-weight:950;color:${color}">${count}</div>
        <div style="margin-top:4px;font-size:11px;color:var(--text3)">${sub}</div>
      </div>`;
    const playerButtons = arr => arr.slice(0, 8).map(p => `
      <button type="button" class="btn btn-w btn-xs" style="padding:4px 8px;border-radius:999px" onclick="openPlayerModal('${_escJ(String(p?.name || ''))}')">${_escH(String(p?.name || '-'))}</button>
    `).join('');
    const sectionBox = (title, arr, body, empty) => `
      <div style="padding:12px;border:1px solid var(--border);border-radius:14px;background:var(--white)">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:8px">
          <div style="font-size:12px;font-weight:900;color:var(--text2)">${title}</div>
          <span style="font-size:11px;font-weight:800;color:var(--text3)">${arr.length}건</span>
        </div>
        ${arr.length ? body : `<div style="font-size:11px;color:var(--gray-l)">${empty}</div>`}
      </div>`;

    out.innerHTML = `
      <div style="display:flex;flex-direction:column;gap:12px">
        <div style="display:flex;gap:10px;flex-wrap:wrap">
          ${metricCard('사진 누락', noPhoto.length, '프로필 이미지 미등록', '#2563eb')}
          ${metricCard('대학 미지정', noUniv.length, '대학 값 없음', '#f59e0b')}
          ${metricCard('티어 미설정', noTier.length, '티어 값 없음', '#8b5cf6')}
          ${metricCard('최근 30일 기록 없음', noRecent.length, recentLabel, '#64748b')}
        </div>
        <div style="display:flex;gap:10px;flex-wrap:wrap">
          ${metricCard('잘못된 대학값', invalidUniv.length, '설정된 대학 목록과 불일치', '#ef4444')}
          ${metricCard('중복 이름 의심', duplicateGroups.length, '이름이 같은 스트리머 그룹', '#10b981')}
          ${metricCard('날짜 형식 이상', dateIssues.length, 'history 날짜 파싱 실패', '#dc2626')}
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px">
          ${sectionBox('사진 누락 스트리머', noPhoto, `<div style="display:flex;gap:6px;flex-wrap:wrap">${playerButtons(noPhoto)}</div>`, '누락 없음')}
          ${sectionBox('대학 미지정 스트리머', noUniv, `<div style="display:flex;gap:6px;flex-wrap:wrap">${playerButtons(noUniv)}</div>`, '누락 없음')}
          ${sectionBox('티어 미설정 스트리머', noTier, `<div style="display:flex;gap:6px;flex-wrap:wrap">${playerButtons(noTier)}</div>`, '누락 없음')}
          ${sectionBox('최근 30일 기록 없음', noRecent, `<div style="display:flex;gap:6px;flex-wrap:wrap">${playerButtons(noRecent)}</div>`, '모두 최근 기록 있음')}
          ${sectionBox('잘못된 대학값', invalidUniv, `<div style="display:flex;flex-direction:column;gap:6px">${invalidUniv.slice(0, 8).map(p=>`<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;padding:8px 10px;border-radius:10px;background:var(--surface)"><button type="button" class="btn btn-w btn-xs" onclick="openPlayerModal('${_escJ(String(p?.name || ''))}')">${_escH(String(p?.name || '-'))}</button><span style="font-size:11px;color:#dc2626;font-weight:800">${_escH(String(p?.univ || '-'))}</span></div>`).join('')}</div>`, '이상 없음')}
          ${sectionBox('중복 이름 의심', duplicateGroups, `<div style="display:flex;flex-direction:column;gap:6px">${duplicateGroups.slice(0, 8).map(group=>`<div style="padding:8px 10px;border-radius:10px;background:var(--surface);font-size:11px;color:var(--text2);font-weight:800">${group.map(p=>_escH(String(p?.name || '-'))).join(' / ')}</div>`).join('')}</div>`, '중복 의심 없음')}
          ${sectionBox('날짜 형식 이상 기록', dateIssues, `<div style="display:flex;flex-direction:column;gap:6px">${dateIssues.map(item=>`<div style="padding:8px 10px;border-radius:10px;background:#fff1f2;border:1px solid #fecdd3;font-size:11px"><strong style="color:#be123c">${_escH(item.name)}</strong><span style="color:var(--text3)"> · ${_escH(item.raw)}</span></div>`).join('')}</div>`, '이상 없음')}
        </div>
      </div>`;
  }catch(e){
    out.innerHTML = `<div style="font-size:12px;color:#dc2626">데이터 검수 중 오류: ${_escH(e?.message || e)}</div>`;
  }
};

// ─────────────────────────────────────────────────────────────
// 🤖 AI봇(Groq) 프록시 서버 설정
// - 브라우저에 API 키를 저장/동기화하지 않고, 서버에만 키를 두는 방식(권장)
// - 여기서는 프록시 서버 URL만 저장하고 SettingsStore(동기화)로 다른 기기 반영
// ─────────────────────────────────────────────────────────────
window.cfgInitAiProxy = async function(){
  try{ if(window.SettingsStore && typeof window.SettingsStore.pullOnSignal==='function') await window.SettingsStore.pullOnSignal({silent:true}); }catch(e){}
  let cur = { proxyUrl:'' };
  try{
    if(window.SettingsStore && typeof window.SettingsStore.getAiCfg==='function') cur = window.SettingsStore.getAiCfg() || cur;
    else cur = JSON.parse(localStorage.getItem('su_ai_cfg')||'{}') || cur;
  }catch(e){}
  const inp=document.getElementById('cfg-ai-proxy-url');
  if(inp) inp.value = cur.proxyUrl || '';

  // 키 상태
  try{
    const st=document.getElementById('cfg-ai-key-status');
    const has = !!(cur && cur.apiKey);
    if(st) st.textContent = has ? '✅ 키 설정됨 (보안상 다시 표시하지 않음)' : '미설정';
  }catch(e){}
};
window.cfgSaveAiProxyUrl = async function(){
  const inp=document.getElementById('cfg-ai-proxy-url');
  const url=String(inp?.value||'').trim();
  const st=document.getElementById('cfg-ai-proxy-status');
  try{
    if(window.SettingsStore && typeof window.SettingsStore.setAiCfg==='function'){
      window.SettingsStore.setAiCfg({ proxyUrl: url });
      // (관리자+동기화 ON) 즉시 원격 반영
      try{
        const c = window.SettingsStore.cfg();
        if(c && c.enabled){
          await window.SettingsStore.push('ai'); // 토큰 필요
          if(st) st.textContent = '✅ 저장 + 다른 기기 반영 완료';
          return;
        }
      }catch(e){}
      // enabled인데 push 실패한 경우(토큰 없음 등) 메시지 보강
      try{
        const c2 = window.SettingsStore.cfg();
        if(c2 && c2.enabled){
          if(st) st.textContent = '⚠️ 로컬 저장됨. 다른 기기 반영은 실패했습니다. (GitHub 토큰 필요)';
          return;
        }
      }catch(e){}
      if(st) st.textContent = '✅ 저장 완료';
    }else{
      const next={ proxyUrl:url, updatedAt:new Date().toISOString() };
      localStorage.setItem('su_ai_cfg', JSON.stringify(next));
      if(st) st.textContent = '✅ 저장 완료';
    }
  }catch(e){
    if(st) st.textContent = '❌ 저장 실패: '+(e.message||e);
  }
};
window.cfgTestAiProxy = async function(){
  const inp=document.getElementById('cfg-ai-proxy-url');
  const st=document.getElementById('cfg-ai-proxy-status');
  const base=String(inp?.value||'').trim().replace(/\/+$/,'');
  if(!base){ if(st) st.textContent='서버 주소를 입력하세요.'; return; }
  if(st) st.textContent='테스트 중...';
  try{
    const r = await fetch(base+'/api/health', {cache:'no-store'});
    if(!r.ok) throw new Error('HTTP '+r.status);
    const j = await r.json().catch(()=>({}));
    if(j && j.ok) { if(st) st.textContent='✅ 연결 성공'; }
    else { if(st) st.textContent='⚠️ 응답은 받았지만 ok가 아닙니다.'; }
  }catch(e){
    if(st) st.textContent='❌ 연결 실패: '+(e.message||e);
  }
};

window.cfgSaveAiApiKey = async function(){
  const inp=document.getElementById('cfg-ai-api-key');
  const key=String(inp?.value||'').trim();
  const st=document.getElementById('cfg-ai-key-status');
  if(!key){ if(st) st.textContent='키를 입력하세요.'; return; }
  try{
    if(window.SettingsStore && typeof window.SettingsStore.setAiCfg==='function'){
      window.SettingsStore.setAiCfg({ apiKey: key });
      // 입력칸은 즉시 비움(노출 최소화)
      try{ if(inp) inp.value=''; }catch(e){}
      if(st) st.textContent='✅ 키 저장 완료 (동기화 제외: 이 기기에만 저장됨)';
    }else{
      const cur = JSON.parse(localStorage.getItem('su_ai_cfg')||'{}');
      const next={ ...cur, apiKey:key, updatedAt:new Date().toISOString() };
      localStorage.setItem('su_ai_cfg', JSON.stringify(next));
      try{ if(inp) inp.value=''; }catch(e){}
      if(st) st.textContent='✅ 키 저장 완료 (보안상 입력칸은 비워집니다)';
    }
  }catch(e){
    if(st) st.textContent='❌ 저장 실패: '+(e.message||e);
  }
};
window.cfgClearAiApiKey = async function(){
  const st=document.getElementById('cfg-ai-key-status');
  try{
    if(window.SettingsStore && typeof window.SettingsStore.setAiCfg==='function'){
      window.SettingsStore.setAiCfg({ apiKey: '' });
    }else{
      const cur = JSON.parse(localStorage.getItem('su_ai_cfg')||'{}');
      const next={ ...cur, apiKey:'', updatedAt:new Date().toISOString() };
      localStorage.setItem('su_ai_cfg', JSON.stringify(next));
    }
    if(st) st.textContent='✅ 키 삭제됨 (동기화 제외)';
  }catch(e){
    if(st) st.textContent='❌ 실패: '+(e.message||e);
  }
};
const _cfgAllSecs=[...new Set(Object.values(_DEFAULT_CATSECS).flat())];

function _cfgMenuLoad(){
  try{ return JSON.parse(localStorage.getItem(_CFG_MENU_KEY) || 'null'); }catch(e){ return null; }
}

// (요청) 설정 하위 메뉴(섹션) 이름 변경
function _cfgMenuLoadRenames(){
  try{ return JSON.parse(localStorage.getItem('su_cfg_sec_renames')||'{}')||{}; }catch(e){ return {}; }
}
function _cfgMenuSaveRenames(v){
  try{ localStorage.setItem('su_cfg_sec_renames', JSON.stringify(v||{})); }catch(e){}
}
window.cfgMenuRenameSec = function(secId){
  const titles = window._cfgSecTitle || {};
  const cur = _cfgMenuLoadRenames();
  const curName = cur[secId] || titles[secId] || secId;
  const nv = prompt('설정 메뉴 이름 변경', curName);
  if(nv===null) return;
  const s = String(nv||'').trim();
  if(!s){ delete cur[secId]; }
  else cur[secId]=s;
  _cfgMenuSaveRenames(cur);
  try{ render(); }catch(e){}
};
window.cfgMenuResetSecNames = function(){
  if(!confirm('설정 하위 메뉴 이름 변경을 모두 초기화할까요?')) return;
  _cfgMenuSaveRenames({});
  try{ render(); }catch(e){}
};

// ─────────────────────────────────────────────────────────────
// (요청사항) 현황판/이미지별(프로필)/펨코현황: 모바일·태블릿 원클릭 자동 맞춤
// - 사용자가 기존 설정을 덮어써도 OK(원클릭 자동화)
// ─────────────────────────────────────────────────────────────
window.cfgAutoFitBoard = function(){
  const w = Math.max(320, Math.min(1920, window.innerWidth || 1024));
  const isMobile = w <= 768;
  const isTablet = w > 768 && w <= 1024;

  // 1) UI 스케일(글자/아이콘) — init.js 자동 스케일이 있으나, 즉시 반영을 위해 한 번 더 적용
  try{
    let s = 1;
    if (w <= 360) s = 0.92;
    else if (w <= 430) s = 0.96;
    else if (w <= 520) s = 0.98;
    else if (w <= 768) s = 1.00;
    else if (w <= 1024) s = 1.02;
    else s = 1.00;
    document.documentElement.style.setProperty('--uiS', String(s));
  }catch(e){}

  // 2) 이미지별(프로필) 레이아웃(su_b2_layout)
  try{
    const settings = {
      autoResize: true,
      autoHeight: true,
      leftSize: 55,
      rightSize: 45,
      pcHeight: 600,
      tabletHeight: isTablet ? 420 : 400,
      mobileHeight: isMobile ? 380 : 320
    };
    localStorage.setItem('su_b2_layout', JSON.stringify(settings));
    // 설정 UI 반영
    const setVal = (id, val) => { const el=document.getElementById(id); if(el) el.value = val; };
    setVal('cfg-b2-left-size', settings.leftSize);
    setVal('cfg-b2-right-size', settings.rightSize);
    setVal('cfg-b2-pc-height', settings.pcHeight);
    setVal('cfg-b2-tablet-height', settings.tabletHeight);
    setVal('cfg-b2-mobile-height', settings.mobileHeight);
    try{ document.getElementById('cfg-b2-left-size-val').textContent = settings.leftSize+'%'; }catch(e){}
    try{ document.getElementById('cfg-b2-right-size-val').textContent = settings.rightSize+'%'; }catch(e){}
    try{ const chk=document.getElementById('cfg-b2-auto-resize'); if(chk) chk.checked = true; }catch(e){}
  }catch(e){}

  // 3) 이미지별(프로필) 이미지 잘림 방지: 기기별 전역 이미지 설정(su_b2_global_img_settings)
  // - 현재 기기 설정이 없을 때만 기본값을 채움 (기존 사용자 설정 덮어쓰기 방지)
  try{
    const fit = (w <= 1024) ? 'contain' : 'cover';
    const dk = w <= 768 ? 'mb' : (w <= 1024 ? 'tb' : 'pc');
    const raw = (()=>{ try{ return JSON.parse(localStorage.getItem('su_b2_global_img_settings')||'{}')||{}; }catch(e){ return {}; } })();
    if(!raw.__byDevice || typeof raw.__byDevice!=='object') raw.__byDevice = {};
    if(!raw.__byDevice[dk] || typeof raw.__byDevice[dk] !== 'object') raw.__byDevice[dk] = {};
    if(!raw.__byDevice[dk].primary) raw.__byDevice[dk].primary = {scale:100, brightness:100, fit, offsetX:0, offsetY:0, zoom:100, fill:fit, posX:0, posY:0};
    if(!raw.__byDevice[dk].secondary) raw.__byDevice[dk].secondary = {scale:100, brightness:100, fit, offsetX:0, offsetY:0, zoom:100, fill:fit, posX:0, posY:0};
    localStorage.setItem('su_b2_global_img_settings', JSON.stringify(raw));
  }catch(e){}

  // 4) 펨코현황: 모바일/태블릿 프리셋
  try{
    const cur = _cfgFemcoLoad();
    const next = {...cur};
    if (w <= 1024){
      next.contentAlign = 'left';
      next.contentPadX = isMobile ? 10 : 12;
      next.contentOffsetX = 0;
      next.colWidth = isMobile ? 150 : 160;
      next.rowsPerCol = isMobile ? 8 : 7;      // 세로 줄 수 ↑ → 가로 스크롤 ↓
      next.playerImgSize = isMobile ? 40 : 44;
      next.colGap = isMobile ? 8 : 10;         // 상하 간격
      next.univGap = isMobile ? 12 : 16;        // 대학 간 여백
      next.countFontSize = isMobile ? 11 : 12;
      next.nameFontSize = isMobile ? 11 : 12;
      next.roleFontSize = isMobile ? 9 : 10;
      next.statusIconSize = isMobile ? 16 : 18;
      next.starSize = isMobile ? 14 : 15;
      next.headGap = isMobile ? 6 : 10;
    }
    _cfgFemcoSave(next);
    try{ if(typeof cfgFemcoInit==='function') cfgFemcoInit(); }catch(e){}
  }catch(e){}

  // 5) 즉시 반영
  try{ if(typeof save==='function') save(); }catch(e){}
  try{ if(typeof render==='function') render(); }catch(e){}
  try{
    // board2 탭이 열려있으면 다시 렌더링
    if(typeof _b2View !== 'undefined' && document.getElementById('b2-content')) {
      if(_b2View==='players') {
        document.getElementById('b2-content').innerHTML = _b2PlayersView();
        if(typeof _b2UpdateMainDisplay==='function' && typeof _b2SelectedPlayer !== 'undefined' && _b2SelectedPlayer) _b2UpdateMainDisplay(_b2SelectedPlayer.name);
      } else if(_b2View==='femco'){
        document.getElementById('b2-content').innerHTML = _b2FemcoView();
        try{ injectUnivIcons(document.getElementById('b2-content')); }catch(e){}
      }
    }
  }catch(e){}

  alert('✅ 브라우저 맞춤 자동 적용 완료');
};

// ─────────────────────────────────────────────────────────────
// (요청사항) 모든 탭 공통: 모바일/태블릿 레이아웃 자동 맞춤(전역)
// - B 옵션: 화면 크기 + 레이아웃(그리드/간격)까지 자동
// ─────────────────────────────────────────────────────────────
const _AF_ALLTABS_KEY = 'su_af_alltabs_v1';
window.cfgSetAutoFitAllTabs = function(on){
  try{ localStorage.setItem(_AF_ALLTABS_KEY, on ? '1' : '0'); }catch(e){}
  try{ if(typeof window._applyAllTabsAutoFit === 'function') window._applyAllTabsAutoFit(); }catch(e){}
  try{ if(typeof render === 'function') render(); }catch(e){}
};

// ─────────────────────────────────────────────────────────────
// (요청사항) 기록 카드 테마/밝기/아이콘/메모 설정
// ─────────────────────────────────────────────────────────────
window.cfgSetRecCardSettings = function(){
  const on = !!document.getElementById('cfg-rc-theme-on')?.checked;
  const accent = (document.getElementById('cfg-rc-accent')?.value || 'none').trim();
  const bg = parseInt(document.getElementById('cfg-rc-bg')?.value||'12',10);
  const hd = parseInt(document.getElementById('cfg-rc-hd')?.value||'14',10);
  const ic = parseInt(document.getElementById('cfg-rc-uicon')?.value||'18',10);
  const univFontPct = parseInt(document.getElementById('cfg-rc-univ-font')?.value||'100',10);
  const ymScalePct = parseInt(document.getElementById('cfg-ym-scale')?.value||'100',10);
  const memoOn = !!document.getElementById('cfg-rc-memo-on')?.checked;
  const ava = parseInt(document.getElementById('cfg-ava-scale')?.value||'100',10);
  const vsAlign = (document.getElementById('cfg-rc-vs-align')?.value || 'center').trim(); // left|center|right
  const scScale = parseInt(document.getElementById('cfg-rc-score-scale')?.value||'88',10);
  const lpcEl = document.getElementById('cfg-rc-layout-pc');
  const lmbEl = document.getElementById('cfg-rc-layout-mb');
  const ckA = (document.getElementById('cfg-team-ck-a')?.value || '#2563eb').trim();
  const ckB = (document.getElementById('cfg-team-ck-b')?.value || '#6366f1').trim();
  const proA = (document.getElementById('cfg-team-pro-a')?.value || '#0f766e').trim();
  const proB = (document.getElementById('cfg-team-pro-b')?.value || '#4f46e5').trim();
  const _hex = v => /^#[0-9a-fA-F]{6}$/.test(String(v||'').trim()) ? String(v).trim() : '';

  try{ localStorage.setItem('su_rc_theme_on', on ? '1' : '0'); }catch(e){}
  try{ localStorage.setItem('su_rc_accent_mode', ['none','header','border','full','gradient'].includes(accent)?accent:'none'); }catch(e){}
  try{ localStorage.setItem('su_rc_bg_alpha', String(Math.max(0,Math.min(30,bg)))); }catch(e){}
  try{ localStorage.setItem('su_rc_hd_alpha', String(Math.max(0,Math.min(30,hd)))); }catch(e){}
  try{ localStorage.setItem('su_rc_uicon', String(Math.max(12,Math.min(34,ic)))); }catch(e){}
  try{ localStorage.setItem('su_rc_univ_font_pct', String(Math.max(90,Math.min(150,univFontPct||100)))); }catch(e){}
  try{ localStorage.setItem('su_ym_scale_pct', String(Math.max(80,Math.min(140,ymScalePct||100)))); }catch(e){}
  try{ localStorage.setItem('su_rc_memo_on', memoOn ? '1' : '0'); }catch(e){}
  try{ localStorage.setItem('su_avatar_scale', String(Math.max(70,Math.min(160,ava))/100)); }catch(e){}
  try{ localStorage.setItem('su_rc_vs_align', ['left','center','right'].includes(vsAlign)?vsAlign:'center'); }catch(e){}
  try{ localStorage.setItem('su_rc_score_scale', String(Math.max(50,Math.min(130,scScale)))); }catch(e){}
  try{
    if(lpcEl){
      const v = parseInt(lpcEl.value||'100',10) || 100;
      localStorage.setItem('su_rc_layout_scale_pc', String(Math.max(60,Math.min(120,v))));
    }
    if(lmbEl){
      const v = parseInt(lmbEl.value||'100',10) || 100;
      localStorage.setItem('su_rc_layout_scale_mb', String(Math.max(60,Math.min(120,v))));
    }
  }catch(e){}
  try{ if(_hex(ckA)) localStorage.setItem('su_team_color_ck_a', _hex(ckA)); }catch(e){}
  try{ if(_hex(ckB)) localStorage.setItem('su_team_color_ck_b', _hex(ckB)); }catch(e){}
  try{ if(_hex(proA)) localStorage.setItem('su_team_color_pro_a', _hex(proA)); }catch(e){}
  try{ if(_hex(proB)) localStorage.setItem('su_team_color_pro_b', _hex(proB)); }catch(e){}
  try{
    const rcAvaSize = parseInt(document.getElementById('cfg-rc-avatar-size')?.value||'38',10);
    localStorage.setItem('su_rec_avatar_size', String(Math.max(20,Math.min(80,rcAvaSize))));
  }catch(e){}
  try{
    const rcAvaFit = document.getElementById('cfg-rc-avatar-fit')?.value || 'contain';
    localStorage.setItem('su_rec_avatar_fit', ['contain','cover'].includes(rcAvaFit)?rcAvaFit:'contain');
  }catch(e){}
  try{ if(typeof window.cfgSyncTeamColorPreview==='function') window.cfgSyncTeamColorPreview(); }catch(e){}

  // 즉시 반영 (init.js 미로드/순서 이슈 대비: 여기서도 직접 적용)
  try{
    const _bg=Math.max(0,Math.min(30,bg));
    const _hd=Math.max(0,Math.min(30,hd));
    const _ic=Math.max(12,Math.min(34,ic));
    const _uf=Math.max(90,Math.min(150,univFontPct||100));
    const _ys=Math.max(80,Math.min(140,ymScalePct||100));
    const _accent=['none','header','border','full','gradient'].includes(accent)?accent:'none';
    const _va=['left','center','right'].includes(vsAlign)?vsAlign:'left';
    const _ss=Math.max(50,Math.min(130,scScale||88));
    const _vsJust=(_va==='center')?'center':(_va==='right')?'flex-end':'flex-start';
    if(document.body){
      document.body.classList.toggle('rc-theme-on', !!on);
      document.body.classList.toggle('rc-accent-header', !!on && _accent==='header');
      document.body.classList.toggle('rc-accent-border', !!on && _accent==='border');
      document.body.classList.toggle('rc-accent-full', !!on && _accent==='full');
      document.body.classList.toggle('rc-accent-gradient', !!on && _accent==='gradient');
    }
    document.documentElement.style.setProperty('--rc-bg-a', String(_bg/100));
    document.documentElement.style.setProperty('--rc-hd-a', String(_hd/100));
    document.documentElement.style.setProperty('--rc-uicon', _ic+'px');
    document.documentElement.style.setProperty('--rc-univ-font-scale', String(_uf/100));
    document.documentElement.style.setProperty('--ym-scale', String(_ys/100));
    document.documentElement.style.setProperty('--rc-memo-on', memoOn?'1':'0');
    document.documentElement.style.setProperty('--rc-vs-justify', _vsJust);
    document.documentElement.style.setProperty('--rc-score-scale', String(_ss/100));
  }catch(e){}
  try{ if(typeof window._applyRecCardTheme === 'function') window._applyRecCardTheme(); }catch(e){}
  try{ window.applyRecLayoutScale && window.applyRecLayoutScale(); }catch(e){}
  try{ if(typeof render === 'function') render(); }catch(e){}
};

window.applyRecLayoutScale = function(){
  try{
    const w = Math.max(320, Math.min(1920, window.innerWidth||1024));
    const isMobile = w <= 768;
    const key = isMobile ? 'su_rc_layout_scale_mb' : 'su_rc_layout_scale_pc';
    const pct = parseInt(localStorage.getItem(key) || '100', 10);
    const v = Math.max(60, Math.min(120, isNaN(pct)?100:pct)) / 100;
    document.documentElement.style.setProperty('--rc-layout-scale', String(v));
  }catch(e){}
};
try{
  if(!window._recLayoutScaleBound){
    window._recLayoutScaleBound = true;
    window.addEventListener('resize', ()=>{ try{ window.applyRecLayoutScale && window.applyRecLayoutScale(); }catch(e){} }, {passive:true});
  }
}catch(e){}

// ─────────────────────────────────────────────────────────────
// (요청사항) 미니대전/대학대전/대학CK/티어대회/프로리그/대회: 대학(팀) 버튼 크기(참여자 버튼은 유지)
// - CSS 변수: --rc-match-btn-scale
// - localStorage: su_match_btn_scale_pc, su_match_btn_scale_mb  (단위: %)
// ─────────────────────────────────────────────────────────────
window.applyMatchBtnScale = function(){
  try{
    const w = Math.max(320, Math.min(1920, window.innerWidth||1024));
    const isMobile = w <= 768;
    const key = isMobile ? 'su_match_btn_scale_mb' : 'su_match_btn_scale_pc';
    const pct = parseInt(localStorage.getItem(key) || (isMobile?'100':'100'), 10);
    const v = Math.max(40, Math.min(220, isNaN(pct)?100:pct)) / 100;
    document.documentElement.style.setProperty('--rc-match-btn-scale', String(v));
  }catch(e){}
};
window.cfgSetMatchBtnScaleSettings = function(){
  try{
    const pc = parseInt(document.getElementById('cfg-mbtn-pc')?.value||'100',10) || 100;
    const mb = parseInt(document.getElementById('cfg-mbtn-mb')?.value||'100',10) || 100;
    localStorage.setItem('su_match_btn_scale_pc', String(Math.max(40,Math.min(220,pc))));
    localStorage.setItem('su_match_btn_scale_mb', String(Math.max(40,Math.min(220,mb))));
  }catch(e){}
  try{ window.applyMatchBtnScale && window.applyMatchBtnScale(); }catch(e){}
  try{ if(typeof render==='function') render(); }catch(e){}
};
try{
  if(!window._matchBtnScaleBound){
    window._matchBtnScaleBound = true;
    window.addEventListener('resize', ()=>{ try{ window.applyMatchBtnScale && window.applyMatchBtnScale(); }catch(e){} }, {passive:true});
  }
}catch(e){}

// ─────────────────────────────────────────────────────────────
// (요청사항) 기록 카드 참가자(👥) 버튼 크기(미니/시빌워/대학대전/대학CK/티어대회/프로리그/대회 등 기록탭)
// - CSS 변수: --rc-mem-btn-scale
// - localStorage: su_rc_mem_btn_scale_pc, su_rc_mem_btn_scale_mb (단위:%)
// ─────────────────────────────────────────────────────────────
window.applyRecMemBtnScale = function(){
  try{
    const w = Math.max(320, Math.min(1920, window.innerWidth||1024));
    const isMobile = w <= 768;
    const key = isMobile ? 'su_rc_mem_btn_scale_mb' : 'su_rc_mem_btn_scale_pc';
    const pct = parseInt(localStorage.getItem(key) || '100', 10);
    const v = Math.max(40, Math.min(240, isNaN(pct)?100:pct)) / 100;
    document.documentElement.style.setProperty('--rc-mem-btn-scale', String(v));
  }catch(e){}
};
window.cfgSetRecMemBtnScaleSettings = function(){
  try{
    const pc = parseInt(document.getElementById('cfg-rc-mem-pc')?.value||'100',10) || 100;
    const mb = parseInt(document.getElementById('cfg-rc-mem-mb')?.value||'100',10) || 100;
    localStorage.setItem('su_rc_mem_btn_scale_pc', String(Math.max(40,Math.min(240,pc))));
    localStorage.setItem('su_rc_mem_btn_scale_mb', String(Math.max(40,Math.min(240,mb))));
  }catch(e){}
  try{ window.applyRecMemBtnScale && window.applyRecMemBtnScale(); }catch(e){}
  try{ if(typeof render==='function') render(); }catch(e){}
};
try{
  if(!window._rcMemBtnScaleBound){
    window._rcMemBtnScaleBound = true;
    window.addEventListener('resize', ()=>{ try{ window.applyRecMemBtnScale && window.applyRecMemBtnScale(); }catch(e){} }, {passive:true});
  }
}catch(e){}

// ─────────────────────────────────────────────────────────────
// (요청사항) 기록 카드: 스코어 ↔ 대학 버튼 간격
// - CSS 변수: --rc-vs-gap (px)
// - localStorage: su_rc_vs_gap_pc, su_rc_vs_gap_mb (단위:px)
// ─────────────────────────────────────────────────────────────
window.applyRecVsGap = function(){
  try{
    const w = Math.max(320, Math.min(1920, window.innerWidth||1024));
    const isMobile = w <= 768;
    const key = isMobile ? 'su_rc_vs_gap_mb' : 'su_rc_vs_gap_pc';
    const px = parseInt(localStorage.getItem(key) || (isMobile?'8':'12'), 10);
    const v = Math.max(0, Math.min(120, isNaN(px)?(isMobile?8:12):px));
    document.documentElement.style.setProperty('--rc-vs-gap', v+'px');
  }catch(e){}
};
window.cfgSetRecVsGapSettings = function(){
  try{
    const pc = parseInt(document.getElementById('cfg-rc-gap-pc')?.value||'12',10);
    const mb = parseInt(document.getElementById('cfg-rc-gap-mb')?.value||'8',10);
    localStorage.setItem('su_rc_vs_gap_pc', String(Math.max(0,Math.min(120,isNaN(pc)?12:pc))));
    localStorage.setItem('su_rc_vs_gap_mb', String(Math.max(0,Math.min(120,isNaN(mb)?8:mb))));
  }catch(e){}
  try{ window.applyRecVsGap && window.applyRecVsGap(); }catch(e){}
  try{ if(typeof render==='function') render(); }catch(e){}
};
try{
  if(!window._rcVsGapBound){
    window._rcVsGapBound = true;
    window.addEventListener('resize', ()=>{ try{ window.applyRecVsGap && window.applyRecVsGap(); }catch(e){} }, {passive:true});
  }
}catch(e){}

// ─────────────────────────────────────────────────────────────
// (요청사항) 대회탭(조별/토너) 대학(팀) 버튼 크기
// - CSS 변수: --tc-team-btn-scale
// - localStorage: su_tc_team_btn_scale_pc, su_tc_team_btn_scale_mb  (단위: %)
// ─────────────────────────────────────────────────────────────
window.applyTourneyTeamBtnScale = function(){
  try{
    const w = Math.max(320, Math.min(1920, window.innerWidth||1024));
    const isMobile = w <= 768;
    const key = isMobile ? 'su_tc_team_btn_scale_mb' : 'su_tc_team_btn_scale_pc';
    const pct = parseInt(localStorage.getItem(key) || '100', 10);
    // 아주 작게~아주 크게
    const v = Math.max(40, Math.min(220, isNaN(pct)?100:pct)) / 100;
    document.documentElement.style.setProperty('--tc-team-btn-scale', String(v));
  }catch(e){}
};
window.cfgSetTourneyTeamBtnScaleSettings = function(){
  try{
    const pc = parseInt(document.getElementById('cfg-tc-team-pc')?.value||'100',10) || 100;
    const mb = parseInt(document.getElementById('cfg-tc-team-mb')?.value||'100',10) || 100;
    localStorage.setItem('su_tc_team_btn_scale_pc', String(Math.max(40,Math.min(220,pc))));
    localStorage.setItem('su_tc_team_btn_scale_mb', String(Math.max(40,Math.min(220,mb))));
  }catch(e){}
  try{ window.applyTourneyTeamBtnScale && window.applyTourneyTeamBtnScale(); }catch(e){}
  try{ if(typeof render==='function') render(); }catch(e){}
};
try{
  if(!window._tcTeamBtnScaleBound){
    window._tcTeamBtnScaleBound = true;
    window.addEventListener('resize', ()=>{ try{ window.applyTourneyTeamBtnScale && window.applyTourneyTeamBtnScale(); }catch(e){} }, {passive:true});
  }
}catch(e){}

// ─────────────────────────────────────────────────────────────
// (요청사항) 대회탭 대학 버튼: 폰트/로고 아이콘 크기 개별 조절
// - CSS 변수: --tc-team-font-scale, --tc-team-icon-scale
// - localStorage: su_tc_team_font_scale_pc/mb, su_tc_team_icon_scale_pc/mb (단위:%)
// ─────────────────────────────────────────────────────────────
window.applyTourneyTeamBtnDetailScale = function(){
  try{
    const w = Math.max(320, Math.min(1920, window.innerWidth||1024));
    const isMobile = w <= 768;
    const fKey = isMobile ? 'su_tc_team_font_scale_mb' : 'su_tc_team_font_scale_pc';
    const iKey = isMobile ? 'su_tc_team_icon_scale_mb' : 'su_tc_team_icon_scale_pc';
    const fp = parseInt(localStorage.getItem(fKey) || '100', 10);
    const ip = parseInt(localStorage.getItem(iKey) || '100', 10);
    const fv = Math.max(40, Math.min(240, isNaN(fp)?100:fp)) / 100;
    const iv = Math.max(40, Math.min(240, isNaN(ip)?100:ip)) / 100;
    document.documentElement.style.setProperty('--tc-team-font-scale', String(fv));
    document.documentElement.style.setProperty('--tc-team-icon-scale', String(iv));
  }catch(e){}
};
window.cfgSetTourneyTeamBtnDetailScaleSettings = function(){
  try{
    const fpc = parseInt(document.getElementById('cfg-tc-team-font-pc')?.value||'100',10) || 100;
    const fmb = parseInt(document.getElementById('cfg-tc-team-font-mb')?.value||'100',10) || 100;
    const ipc = parseInt(document.getElementById('cfg-tc-team-ico-pc')?.value||'100',10) || 100;
    const imb = parseInt(document.getElementById('cfg-tc-team-ico-mb')?.value||'100',10) || 100;
    localStorage.setItem('su_tc_team_font_scale_pc', String(Math.max(40,Math.min(240,fpc))));
    localStorage.setItem('su_tc_team_font_scale_mb', String(Math.max(40,Math.min(240,fmb))));
    localStorage.setItem('su_tc_team_icon_scale_pc', String(Math.max(40,Math.min(240,ipc))));
    localStorage.setItem('su_tc_team_icon_scale_mb', String(Math.max(40,Math.min(240,imb))));
  }catch(e){}
  try{ window.applyTourneyTeamBtnDetailScale && window.applyTourneyTeamBtnDetailScale(); }catch(e){}
  try{ if(typeof render==='function') render(); }catch(e){}
};
try{
  if(!window._tcTeamBtnDetailScaleBound){
    window._tcTeamBtnDetailScaleBound = true;
    window.addEventListener('resize', ()=>{ try{ window.applyTourneyTeamBtnDetailScale && window.applyTourneyTeamBtnDetailScale(); }catch(e){} }, {passive:true});
  }
}catch(e){}

// ─────────────────────────────────────────────────────────────
// (요청사항) 대회탭 참가자(👥) 버튼 크기 조절
// - CSS 변수: --tc-mem-btn-scale
// - localStorage: su_tc_mem_btn_scale_pc/mb (단위:%)
// ─────────────────────────────────────────────────────────────
window.applyTourneyMemBtnScale = function(){
  try{
    const w = Math.max(320, Math.min(1920, window.innerWidth||1024));
    const isMobile = w <= 768;
    const key = isMobile ? 'su_tc_mem_btn_scale_mb' : 'su_tc_mem_btn_scale_pc';
    const pct = parseInt(localStorage.getItem(key) || '100', 10);
    const v = Math.max(40, Math.min(240, isNaN(pct)?100:pct)) / 100;
    document.documentElement.style.setProperty('--tc-mem-btn-scale', String(v));
  }catch(e){}
};
window.cfgSetTourneyMemBtnScaleSettings = function(){
  try{
    const pc = parseInt(document.getElementById('cfg-tc-mem-pc')?.value||'100',10) || 100;
    const mb = parseInt(document.getElementById('cfg-tc-mem-mb')?.value||'100',10) || 100;
    localStorage.setItem('su_tc_mem_btn_scale_pc', String(Math.max(40,Math.min(240,pc))));
    localStorage.setItem('su_tc_mem_btn_scale_mb', String(Math.max(40,Math.min(240,mb))));
  }catch(e){}
  try{ window.applyTourneyMemBtnScale && window.applyTourneyMemBtnScale(); }catch(e){}
  try{ if(typeof render==='function') render(); }catch(e){}
};
try{
  if(!window._tcMemBtnScaleBound){
    window._tcMemBtnScaleBound = true;
    window.addEventListener('resize', ()=>{ try{ window.applyTourneyMemBtnScale && window.applyTourneyMemBtnScale(); }catch(e){} }, {passive:true});
  }
}catch(e){}

// ─────────────────────────────────────────────────────────────
// (요청사항) 대회탭(조별/토너) 스코어 ↔ 대학 버튼 간격
// - CSS 변수: --tc-vs-gap (px)
// - localStorage: su_tc_vs_gap_pc, su_tc_vs_gap_mb (단위:px)
// ─────────────────────────────────────────────────────────────
window.applyTourneyVsGap = function(){
  try{
    const w = Math.max(320, Math.min(1920, window.innerWidth||1024));
    const isMobile = w <= 768;
    const key = isMobile ? 'su_tc_vs_gap_mb' : 'su_tc_vs_gap_pc';
    const px = parseInt(localStorage.getItem(key) || (isMobile?'8':'12'), 10);
    const v = Math.max(0, Math.min(120, isNaN(px)?(isMobile?8:12):px));
    document.documentElement.style.setProperty('--tc-vs-gap', v+'px');
  }catch(e){}
};
window.cfgSetTourneyVsGapSettings = function(){
  try{
    const pc = parseInt(document.getElementById('cfg-tc-gap-pc')?.value||'12',10);
    const mb = parseInt(document.getElementById('cfg-tc-gap-mb')?.value||'8',10);
    localStorage.setItem('su_tc_vs_gap_pc', String(Math.max(0,Math.min(120,isNaN(pc)?12:pc))));
    localStorage.setItem('su_tc_vs_gap_mb', String(Math.max(0,Math.min(120,isNaN(mb)?8:mb))));
  }catch(e){}
  try{ window.applyTourneyVsGap && window.applyTourneyVsGap(); }catch(e){}
  try{ if(typeof render==='function') render(); }catch(e){}
};

window.applyStreamerCardGap = function(){
  try{
    const w = Math.max(320, Math.min(1920, window.innerWidth||1024));
    const isMobile = w <= 768;
    const key = isMobile ? 'su_streamer_card_gap_mb' : 'su_streamer_card_gap_pc';
    const def = isMobile ? 9 : 13;
    const px = parseInt(localStorage.getItem(key) || String(def), 10);
    const v = Math.max(4, Math.min(80, isNaN(px) ? def : px));
    document.documentElement.style.setProperty('--su-streamer-card-gap', v+'px');
  }catch(e){}
};
window.cfgSetStreamerCardGapSettings = function(){
  try{
    const pc = parseInt(document.getElementById('cfg-streamer-gap-pc')?.value||'13',10);
    const mb = parseInt(document.getElementById('cfg-streamer-gap-mb')?.value||'9',10);
    localStorage.setItem('su_streamer_card_gap_pc', String(Math.max(4,Math.min(80,isNaN(pc)?13:pc))));
    localStorage.setItem('su_streamer_card_gap_mb', String(Math.max(4,Math.min(80,isNaN(mb)?9:mb))));
  }catch(e){}
  try{ window.applyStreamerCardGap && window.applyStreamerCardGap(); }catch(e){}
  try{ if(typeof render==='function') render(); }catch(e){}
};
try{
  if(!window._streamerCardGapBound){
    window._streamerCardGapBound = true;
    window.addEventListener('resize', ()=>{ try{ window.applyStreamerCardGap && window.applyStreamerCardGap(); }catch(e){} }, {passive:true});
  }
}catch(e){}

window.applyTierCardGap = function(){
  try{
    const w = Math.max(320, Math.min(1920, window.innerWidth||1024));
    const isMobile = w <= 768;
    const key = isMobile ? 'su_tier_card_gap_mb' : 'su_tier_card_gap_pc';
    const def = isMobile ? 18 : 26;
    const px = parseInt(localStorage.getItem(key) || String(def), 10);
    const v = Math.max(10, Math.min(80, isNaN(px) ? def : px));
    document.documentElement.style.setProperty('--su-tier-card-gap', v+'px');
  }catch(e){}
};
window.cfgSetTierCardGapSettings = function(){
  try{
    const pc = parseInt(document.getElementById('cfg-tier-gap-pc')?.value||'26',10);
    const mb = parseInt(document.getElementById('cfg-tier-gap-mb')?.value||'18',10);
    localStorage.setItem('su_tier_card_gap_pc', String(Math.max(10,Math.min(80,isNaN(pc)?26:pc))));
    localStorage.setItem('su_tier_card_gap_mb', String(Math.max(10,Math.min(80,isNaN(mb)?18:mb))));
  }catch(e){}
  try{ window.applyTierCardGap && window.applyTierCardGap(); }catch(e){}
  try{ if(typeof render==='function') render(); }catch(e){}
};
try{
  if(!window._tierCardGapBound){
    window._tierCardGapBound = true;
    window.addEventListener('resize', ()=>{ try{ window.applyTierCardGap && window.applyTierCardGap(); }catch(e){} }, {passive:true});
  }
}catch(e){}

// 대회탭 스코어 크기 설정 (TC Score Scale)
window.cfgSetTcScoreScale = function(){
  try{
    const pc = parseInt(document.getElementById('cfg-tc-score-pc')?.value||'82',10);
    const mb = parseInt(document.getElementById('cfg-tc-score-mb')?.value||'75',10);
    localStorage.setItem('su_tc_score_scale_pc', String(Math.max(50,Math.min(150,pc))));
    localStorage.setItem('su_tc_score_scale_mb', String(Math.max(50,Math.min(150,mb))));
    const isMb = window.innerWidth <= 768;
    const val = isMb ? Math.max(50,Math.min(150,mb)) : Math.max(50,Math.min(150,pc));
    document.documentElement.style.setProperty('--tc-score-scale', String(val/100));
  }catch(e){}
  try{ if(typeof render==='function') render(); }catch(e){}
};

window._applyTcScoreScale = function(){
  try{
    const isMb = window.innerWidth <= 768;
    const pcV = parseInt(localStorage.getItem('su_tc_score_scale_pc')||'82',10);
    const mbV = parseInt(localStorage.getItem('su_tc_score_scale_mb')||'75',10);
    const val = isMb ? Math.max(50,Math.min(150,mbV)) : Math.max(50,Math.min(150,pcV));
    document.documentElement.style.setProperty('--tc-score-scale', String(val/100));
  }catch(e){}
};

try{
  if(!window._tcVsGapBound){
    window._tcVsGapBound = true;
    window.addEventListener('resize', ()=>{ try{ window.applyTourneyVsGap && window.applyTourneyVsGap(); }catch(e){} }, {passive:true});
  }
}catch(e){}

// ─────────────────────────────────────────────────────────────
// (요청사항) 스코어 숫자 색상(승/패) 공통 설정
// - CSS 변수: --score-win/--score-lose (+ 그라데이션 상단색은 자동 생성)
// - localStorage: su_score_win, su_score_lose (hex)
// ─────────────────────────────────────────────────────────────
function _hexToRgb_(hex){
  const h=String(hex||'').trim().replace('#','');
  if(h.length!==6) return null;
  const r=parseInt(h.slice(0,2),16), g=parseInt(h.slice(2,4),16), b=parseInt(h.slice(4,6),16);
  if(!Number.isFinite(r)||!Number.isFinite(g)||!Number.isFinite(b)) return null;
  return {r,g,b};
}
function _mixRgb_(a,b,t){
  t=Math.max(0,Math.min(1,Number(t)||0));
  const r=Math.round(a.r+(b.r-a.r)*t);
  const g=Math.round(a.g+(b.g-a.g)*t);
  const b2=Math.round(a.b+(b.b-a.b)*t);
  return {r,g,b:b2};
}
function _rgbToHex_(c){
  const to=(n)=>String(Math.max(0,Math.min(255,n|0)).toString(16)).padStart(2,'0');
  return '#'+to(c.r)+to(c.g)+to(c.b);
}
window.applyScoreColors = function(){
  try{
    const win=String(localStorage.getItem('su_score_win')||'#16a34a').trim();
    const lose=String(localStorage.getItem('su_score_lose')||'#dc2626').trim();
    const wr=_hexToRgb_(win)||{r:22,g:163,b:74};
    const lr=_hexToRgb_(lose)||{r:220,g:38,b:38};
    const w2=_mixRgb_(wr,{r:255,g:255,b:255},0.18);
    const l2=_mixRgb_(lr,{r:255,g:255,b:255},0.20);
    document.documentElement.style.setProperty('--score-win', _rgbToHex_(wr));
    document.documentElement.style.setProperty('--score-win-2', _rgbToHex_(w2));
    document.documentElement.style.setProperty('--score-lose', _rgbToHex_(lr));
    document.documentElement.style.setProperty('--score-lose-2', _rgbToHex_(l2));
  }catch(e){}
};
window.cfgSetScoreColors = function(){
  try{
    const w=String(document.getElementById('cfg-score-win')?.value||'#16a34a').trim();
    const l=String(document.getElementById('cfg-score-lose')?.value||'#dc2626').trim();
    if(/^#[0-9a-fA-F]{6}$/.test(w)) localStorage.setItem('su_score_win', w);
    if(/^#[0-9a-fA-F]{6}$/.test(l)) localStorage.setItem('su_score_lose', l);
  }catch(e){}
  try{ window.applyScoreColors && window.applyScoreColors(); }catch(e){}
  try{ if(typeof render==='function') render(); }catch(e){}
};

// ─────────────────────────────────────────────────────────────
// (요청사항) 기록 카드 배경 효과 전체 ON/OFF (승리색 배경 + 양끝 효과)
// - 별도 저장키 없이 su_rc_theme_on / su_rec_side_fx_on 를 동시에 조절
// ─────────────────────────────────────────────────────────────
window.cfgSetRecBgFxAll = function(on){
  try{ localStorage.setItem('su_rc_theme_on', on ? '1' : '0'); }catch(e){}
  try{ localStorage.setItem('su_rec_side_fx_on', on ? '1' : '0'); }catch(e){}
  try{
    const rc=document.getElementById('cfg-rc-theme-on');
    if(rc) rc.checked = !!on;
  }catch(e){}
  try{
    const sfx=document.getElementById('cfg-sidefx-on');
    if(sfx) sfx.checked = !!on;
  }catch(e){}
  // 사이드FX는 history-core.js의 setter가 변수를 같이 갱신하므로 가능하면 호출
  try{ if(typeof window.cfgSetRecSideFxEnabled==='function') window.cfgSetRecSideFxEnabled(!!on); }catch(e){}
  try{ if(typeof window.cfgSetRecCardSettings==='function') window.cfgSetRecCardSettings(); }catch(e){}
  try{ if(typeof window._applyRecCardTheme==='function') window._applyRecCardTheme(); }catch(e){}
  try{ if(typeof render==='function') render(); }catch(e){}
};

window.cfgSetProCompAvatarSettings = function(){
  try{
    const pc = parseInt(document.getElementById('cfg-procomp-ava-pc')?.value||'52',10) || 52;
    const mb = parseInt(document.getElementById('cfg-procomp-ava-mb')?.value||'40',10) || 40;
    const fit = String(document.getElementById('cfg-procomp-ava-fit')?.value||'cover').trim();
    localStorage.setItem('su_procomp_avatar_pc', String(Math.max(28,Math.min(200,pc))));
    localStorage.setItem('su_procomp_avatar_mb', String(Math.max(24,Math.min(160,mb))));
    localStorage.setItem('su_procomp_avatar_fit', (fit==='contain'||fit==='cover'||fit==='fill') ? fit : 'cover');
  }catch(e){}
  try{ if(typeof render==='function') render(); }catch(e){}
};

window.cfgSetProCompScoreSettings = function(){
  try{
    const pc = parseInt(document.getElementById('cfg-procomp-score-pc')?.value||'100',10) || 100;
    const mb = parseInt(document.getElementById('cfg-procomp-score-mb')?.value||'100',10) || 100;
    localStorage.setItem('su_procomp_score_scale_pc', String(Math.max(60,Math.min(160,pc))));
    localStorage.setItem('su_procomp_score_scale_mb', String(Math.max(60,Math.min(160,mb))));
  }catch(e){}
  try{ if(typeof render==='function') render(); }catch(e){}
};

window.cfgSetProCompLayoutSettings = function(){
  try{
    const pc = parseInt(document.getElementById('cfg-procomp-layout-pc')?.value||'100',10) || 100;
    const mb = parseInt(document.getElementById('cfg-procomp-layout-mb')?.value||'100',10) || 100;
    localStorage.setItem('su_procomp_layout_scale_pc', String(Math.max(60,Math.min(120,pc))));
    localStorage.setItem('su_procomp_layout_scale_mb', String(Math.max(60,Math.min(120,mb))));
  }catch(e){}
  try{ if(typeof render==='function') render(); }catch(e){}
};

// 개인전/끝장전/프로리그끝장전 선수 패널(프로필 배경 카드) 설정
window.cfgSetH2HPanelSettings = function(){
  try{
    const pc = parseInt(document.getElementById('cfg-h2h-panel-pc')?.value||'150',10) || 150;
    const mb = parseInt(document.getElementById('cfg-h2h-panel-mb')?.value||'126',10) || 126;
    const fit = String(document.getElementById('cfg-h2h-panel-fit')?.value||'cover').trim();
    const wpc = parseInt(document.getElementById('cfg-h2h-w-pc')?.value||'105',10) || 105;
    const hpc = parseInt(document.getElementById('cfg-h2h-h-pc')?.value||'100',10) || 100;
    const wmb = parseInt(document.getElementById('cfg-h2h-w-mb')?.value||'100',10) || 100;
    const hmb = parseInt(document.getElementById('cfg-h2h-h-mb')?.value||'100',10) || 100;
    const gpc = parseInt(document.getElementById('cfg-h2h-gap-pc')?.value||'10',10);
    const gmb = parseInt(document.getElementById('cfg-h2h-gap-mb')?.value||'8',10);
    const spc = parseInt(document.getElementById('cfg-h2h-scorepad-pc')?.value||'10',10);
    const smb = parseInt(document.getElementById('cfg-h2h-scorepad-mb')?.value||'6',10);
    localStorage.setItem('su_h2h_panel_pc', String(Math.max(110,Math.min(230,pc))));
    localStorage.setItem('su_h2h_panel_mb', String(Math.max(96,Math.min(210,mb))));
    localStorage.setItem('su_h2h_panel_fit', (fit==='contain'||fit==='cover'||fit==='fill') ? fit : 'cover');
    // 10%까지 허용(요청사항) + 더 넓게(스코어 앞까지) 쓸 수 있게 최대 300%
    localStorage.setItem('su_h2h_panel_wmul_pc', String(Math.max(10,Math.min(300,wpc))));
    localStorage.setItem('su_h2h_panel_hmul_pc', String(Math.max(10,Math.min(300,hpc))));
    localStorage.setItem('su_h2h_panel_wmul_mb', String(Math.max(10,Math.min(300,wmb))));
    localStorage.setItem('su_h2h_panel_hmul_mb', String(Math.max(10,Math.min(300,hmb))));
    // 스코어 ↔ 선수패널 간격 + 스코어 좌우 여백
    localStorage.setItem('su_h2h_score_gap_pc', String(Math.max(0,Math.min(120,isNaN(gpc)?10:gpc))));
    localStorage.setItem('su_h2h_score_gap_mb', String(Math.max(0,Math.min(120,isNaN(gmb)?8:gmb))));
    localStorage.setItem('su_h2h_score_pad_pc', String(Math.max(0,Math.min(24,isNaN(spc)?10:spc))));
    localStorage.setItem('su_h2h_score_pad_mb', String(Math.max(0,Math.min(24,isNaN(smb)?6:smb))));
  }catch(e){}
  try{ if(typeof render==='function') render(); }catch(e){}
};

// 개인/끝장전: 스트리머별 프로필 배경 위치(object-position) 저장
function _cfgH2HBgPosLoadAll(){
  try{ return JSON.parse(localStorage.getItem('su_h2h_player_bgpos')||'{}')||{}; }catch(e){ return {}; }
}
function _cfgH2HBgPosSaveAll(map){
  try{ localStorage.setItem('su_h2h_player_bgpos', JSON.stringify(map||{})); }catch(e){}
}
window.cfgH2HBgPosLoad = function(){
  try{
    const name=String(document.getElementById('cfg-h2h-bgpos-name')?.value||'').trim();
    const map=_cfgH2HBgPosLoadAll();
    const it=map[name]||{x:50,y:50};
    const x=Math.max(0,Math.min(100,Number(it.x))); const y=Math.max(0,Math.min(100,Number(it.y)));
    const xi=document.getElementById('cfg-h2h-bgpos-x');
    const yi=document.getElementById('cfg-h2h-bgpos-y');
    if(xi){ xi.value=String(Number.isFinite(x)?x:50); document.getElementById('cfg-h2h-bgpos-xv').textContent=xi.value+'%'; }
    if(yi){ yi.value=String(Number.isFinite(y)?y:50); document.getElementById('cfg-h2h-bgpos-yv').textContent=yi.value+'%'; }
  }catch(e){}
};
window.cfgH2HBgPosSave = function(){
  try{
    const name=String(document.getElementById('cfg-h2h-bgpos-name')?.value||'').trim();
    if(!name){ alert('스트리머 이름을 입력하세요.'); return; }
    const x=parseInt(document.getElementById('cfg-h2h-bgpos-x')?.value||'50',10) || 50;
    const y=parseInt(document.getElementById('cfg-h2h-bgpos-y')?.value||'50',10) || 50;
    const map=_cfgH2HBgPosLoadAll();
    map[name]={x:Math.max(0,Math.min(100,x)), y:Math.max(0,Math.min(100,y))};
    _cfgH2HBgPosSaveAll(map);
  }catch(e){}
  try{ if(typeof render==='function') render(); }catch(e){}
};
window.cfgH2HBgPosReset = function(){
  try{
    const name=String(document.getElementById('cfg-h2h-bgpos-name')?.value||'').trim();
    if(!name){ alert('스트리머 이름을 입력하세요.'); return; }
    const map=_cfgH2HBgPosLoadAll();
    delete map[name];
    _cfgH2HBgPosSaveAll(map);
    const xi=document.getElementById('cfg-h2h-bgpos-x');
    const yi=document.getElementById('cfg-h2h-bgpos-y');
    if(xi){ xi.value='50'; document.getElementById('cfg-h2h-bgpos-xv').textContent='50%'; }
    if(yi){ yi.value='50'; document.getElementById('cfg-h2h-bgpos-yv').textContent='50%'; }
  }catch(e){}
  try{ if(typeof render==='function') render(); }catch(e){}
};

// ─────────────────────────────────────────────────────────────
// (요청사항) 스트리머탭 대학 헤더 그라데이션 스타일
// - CSS 변수: --univ-header-bg
// - localStorage: su_univ_header_gradient
// - 옵션: solid, left-to-right, left-to-both, top-to-bottom, both-to-center
// ─────────────────────────────────────────────────────────────
window.applyUnivHeaderGradient = function(){
  try{
    const mode = localStorage.getItem('su_univ_header_gradient') || 'left-to-right';
    let gradient = '';
    switch(mode){
      case 'solid':
        gradient = 'var(--c,#2563eb)';
        break;
      case 'left-to-right':
        gradient = 'linear-gradient(90deg, var(--c,#2563eb), color-mix(in srgb, var(--c,#2563eb) 70%, transparent))';
        break;
      case 'left-to-both':
        gradient = 'linear-gradient(90deg, var(--c,#2563eb) 0%, var(--c,#2563eb) 30%, color-mix(in srgb, var(--c,#2563eb) 50%, transparent) 100%)';
        break;
      case 'top-to-bottom':
        gradient = 'linear-gradient(180deg, var(--c,#2563eb), color-mix(in srgb, var(--c,#2563eb) 70%, transparent))';
        break;
      case 'both-to-center':
        gradient = 'linear-gradient(90deg, color-mix(in srgb, var(--c,#2563eb) 50%, transparent) 0%, var(--c,#2563eb) 50%, color-mix(in srgb, var(--c,#2563eb) 50%, transparent) 100%)';
        break;
      default:
        gradient = 'linear-gradient(90deg, var(--c,#2563eb), color-mix(in srgb, var(--c,#2563eb) 70%, transparent))';
    }
    document.documentElement.style.setProperty('--univ-header-bg', gradient);
  }catch(e){}
};
window.cfgSetUnivHeaderGradient = function(mode){
  try{
    const validModes = ['solid', 'left-to-right', 'left-to-both', 'top-to-bottom', 'both-to-center'];
    const m = validModes.includes(mode) ? mode : 'left-to-right';
    localStorage.setItem('su_univ_header_gradient', m);
  }catch(e){}
  try{ window.applyUnivHeaderGradient && window.applyUnivHeaderGradient(); }catch(e){}
  try{ if(typeof render==='function') render(); }catch(e){}
};
try{
  window.applyUnivHeaderGradient && window.applyUnivHeaderGradient();
}catch(e){}

// ─────────────────────────────────────────────────────────────
// (요청사항) 스트리머탭 대학 헤더 배경 이미지/텍스트 설정
// - CSS 변수: --univ-header-bg-image, --univ-header-bg-size, --univ-header-bg-position, --univ-header-bg-opacity
// - CSS 변수: --univ-header-text, --univ-header-text-size, --univ-header-text-color, --univ-header-text-top, --univ-header-text-right
// - localStorage: su_univ_header_bg_image, su_univ_header_bg_size, su_univ_header_bg_position, su_univ_header_bg_opacity
// - localStorage: su_univ_header_text, su_univ_header_text_size, su_univ_header_text_color, su_univ_header_text_top, su_univ_header_text_right
// ─────────────────────────────────────────────────────────────
window.applyUnivHeaderBgImage = function(){
  try{
    const imageUrl = localStorage.getItem('su_univ_header_bg_image') || '';
    const bgSize = localStorage.getItem('su_univ_header_bg_size') || 'cover';
    const bgPosition = localStorage.getItem('su_univ_header_bg_position') || 'center center';
    const opacity = Math.max(0, Math.min(100, parseInt(localStorage.getItem('su_univ_header_bg_opacity') || '0', 10))) / 100;
    
    document.documentElement.style.setProperty('--univ-header-bg-image', imageUrl ? `url('${imageUrl}')` : 'none');
    document.documentElement.style.setProperty('--univ-header-bg-size', bgSize);
    document.documentElement.style.setProperty('--univ-header-bg-position', bgPosition);
    document.documentElement.style.setProperty('--univ-header-bg-opacity', String(opacity));
  }catch(e){}
};
window.applyUnivHeaderText = function(){
  try{
    const text = localStorage.getItem('su_univ_header_text') || '';
    const fontSize = Math.max(8, Math.min(32, parseInt(localStorage.getItem('su_univ_header_text_size') || '12', 10))) + 'px';
    const textColor = localStorage.getItem('su_univ_header_text_color') || 'rgba(255,255,255,0.8)';
    const textTop = localStorage.getItem('su_univ_header_text_top') || '50%';
    const textRight = localStorage.getItem('su_univ_header_text_right') || '10px';
    const textYTransform = textTop === '50%' ? '-50%' : '0';
    
    document.documentElement.style.setProperty('--univ-header-text', text ? `'${text.replace(/'/g, "\\'")}'` : "''");
    document.documentElement.style.setProperty('--univ-header-text-size', fontSize);
    document.documentElement.style.setProperty('--univ-header-text-color', textColor);
    document.documentElement.style.setProperty('--univ-header-text-top', textTop);
    document.documentElement.style.setProperty('--univ-header-text-right', textRight);
    document.documentElement.style.setProperty('--univ-header-text-y-transform', textYTransform);
  }catch(e){}
};
window.cfgSetUnivHeaderBgImage = function(url){
  try{
    localStorage.setItem('su_univ_header_bg_image', url || '');
  }catch(e){}
  try{ window.applyUnivHeaderBgImage && window.applyUnivHeaderBgImage(); }catch(e){}
  try{ window.SettingsStore && typeof window.SettingsStore.markPrefsChanged==='function' && window.SettingsStore.markPrefsChanged(); }catch(e){}
};
window.cfgSetUnivHeaderBgSize = function(size){
  try{
    const validSizes = ['cover', 'contain', 'auto', '100% 100%', '50% 50%'];
    const s = validSizes.includes(size) ? size : 'cover';
    localStorage.setItem('su_univ_header_bg_size', s);
  }catch(e){}
  try{ window.applyUnivHeaderBgImage && window.applyUnivHeaderBgImage(); }catch(e){}
  try{ window.SettingsStore && typeof window.SettingsStore.markPrefsChanged==='function' && window.SettingsStore.markPrefsChanged(); }catch(e){}
};
window.cfgSetUnivHeaderBgPosition = function(pos){
  try{
    const validPositions = ['center center', 'top center', 'bottom center', 'left center', 'right center', 'top left', 'top right', 'bottom left', 'bottom right'];
    const p = validPositions.includes(pos) ? pos : 'center center';
    localStorage.setItem('su_univ_header_bg_position', p);
  }catch(e){}
  try{ window.applyUnivHeaderBgImage && window.applyUnivHeaderBgImage(); }catch(e){}
  try{ window.SettingsStore && typeof window.SettingsStore.markPrefsChanged==='function' && window.SettingsStore.markPrefsChanged(); }catch(e){}
};
window.cfgSetUnivHeaderBgOpacity = function(opacity){
  try{
    const n = Math.max(0, Math.min(100, parseInt(opacity || '0', 10) || 0));
    localStorage.setItem('su_univ_header_bg_opacity', String(n));
  }catch(e){}
  try{ window.applyUnivHeaderBgImage && window.applyUnivHeaderBgImage(); }catch(e){}
  try{ window.SettingsStore && typeof window.SettingsStore.markPrefsChanged==='function' && window.SettingsStore.markPrefsChanged(); }catch(e){}
};
window.cfgSetUnivHeaderText = function(text){
  try{
    localStorage.setItem('su_univ_header_text', text || '');
  }catch(e){}
  try{ window.applyUnivHeaderText && window.applyUnivHeaderText(); }catch(e){}
  try{ if(typeof render==='function') render(); }catch(e){}
};
window.cfgSetUnivHeaderTextSize = function(size){
  try{
    const n = Math.max(8, Math.min(32, parseInt(size || '12', 10) || 12));
    localStorage.setItem('su_univ_header_text_size', String(n));
  }catch(e){}
  try{ window.applyUnivHeaderText && window.applyUnivHeaderText(); }catch(e){}
  try{ if(typeof render==='function') render(); }catch(e){}
};
window.cfgSetUnivHeaderTextColor = function(color){
  try{
    localStorage.setItem('su_univ_header_text_color', color || 'rgba(255,255,255,0.8)');
  }catch(e){}
  try{ window.applyUnivHeaderText && window.applyUnivHeaderText(); }catch(e){}
  try{ if(typeof render==='function') render(); }catch(e){}
};
window.cfgSetUnivHeaderTextTop = function(top){
  try{
    const validTops = ['0%', '25%', '50%', '75%', '100%'];
    const t = validTops.includes(top) ? top : '50%';
    localStorage.setItem('su_univ_header_text_top', t);
  }catch(e){}
  try{ window.applyUnivHeaderText && window.applyUnivHeaderText(); }catch(e){}
  try{ if(typeof render==='function') render(); }catch(e){}
};
window.cfgSetUnivHeaderTextRight = function(right){
  try{
    const n = Math.max(0, Math.min(50, parseInt(right || '10', 10) || 10));
    localStorage.setItem('su_univ_header_text_right', String(n) + 'px');
  }catch(e){}
  try{ window.applyUnivHeaderText && window.applyUnivHeaderText(); }catch(e){}
  try{ if(typeof render==='function') render(); }catch(e){}
};
window.cfgSetUnivHeaderTextPos = function(pos){
  try{
    const validPos = ['left', 'center', 'right'];
    const p = validPos.includes(pos) ? pos : 'right';
    localStorage.setItem('su_univ_header_text_pos', p);
  }catch(e){}
  try{ if(typeof render==='function') render(); }catch(e){}
};
window.cfgSetUnivHeaderGradientLength = function(len){
  try{
    const n = Math.max(20, Math.min(100, parseInt(len || '70', 10) || 70));
    localStorage.setItem('su_univ_header_gradient_length', String(n));
  }catch(e){}
  try{ if(typeof render==='function') render(); }catch(e){}
};
window.cfgSetUnivHeaderGradientColor = function(color){
  try{
    localStorage.setItem('su_univ_header_gradient_color', String(color || '#ffffff'));
  }catch(e){}
  try{ if(typeof render==='function') render(); }catch(e){}
};
try{
  window.applyUnivHeaderBgImage && window.applyUnivHeaderBgImage();
  window.applyUnivHeaderText && window.applyUnivHeaderText();
}catch(e){}

function renderIfPossible(){
  try{ if(typeof render==='function') render(); }catch(e){}
}

// ─────────────────────────────────────────────────────────────
// 스트리머 상세 수정창(openEP)용: 개인/끝장전 배경 위치(드래그)
// ─────────────────────────────────────────────────────────────
function _edH2HPosLoadAll(){
  try{ return JSON.parse(localStorage.getItem('su_h2h_player_bgpos')||'{}')||{}; }catch(e){ return {}; }
}
function _edH2HPosSaveAll(map){
  try{ localStorage.setItem('su_h2h_player_bgpos', JSON.stringify(map||{})); }catch(e){}
}
window.edH2HPosSyncFromInputs = function(){
  try{
    const xEl=document.getElementById('ed-h2hpos-x');
    const yEl=document.getElementById('ed-h2hpos-y');
    const x=parseInt(xEl?.value||'50',10) || 50;
    const y=parseInt(yEl?.value||'50',10) || 50;
    const prev=document.getElementById('ed-h2hpos-prev');
    if(prev) prev.style.backgroundPosition = `${Math.max(0,Math.min(100,x))}% ${Math.max(0,Math.min(100,y))}%`;
    const xv=document.getElementById('ed-h2hpos-xv'); if(xv) xv.textContent=`${Math.max(0,Math.min(100,x))}%`;
    const yv=document.getElementById('ed-h2hpos-yv'); if(yv) yv.textContent=`${Math.max(0,Math.min(100,y))}%`;
    const del=document.getElementById('ed-h2hpos-del'); if(del) del.value='0';
  }catch(e){}
};
window.edH2HPosCenter = function(){
  try{
    const xEl=document.getElementById('ed-h2hpos-x');
    const yEl=document.getElementById('ed-h2hpos-y');
    if(xEl) xEl.value='50';
    if(yEl) yEl.value='50';
    window.edH2HPosSyncFromInputs && window.edH2HPosSyncFromInputs();
  }catch(e){}
};
window.edH2HPosDelete = function(){
  try{
    const del=document.getElementById('ed-h2hpos-del'); if(del) del.value='1';
    const msg=document.getElementById('ed-h2hpos-msg'); if(msg){ msg.style.display='none'; }
    alert('이 스트리머의 얼굴 위치 보정값을 삭제합니다. (기본 center로 표시)');
  }catch(e){}
};
window.edH2HPosSave = function(){
  try{
    const name=String(document.getElementById('ed-n')?.value||editName||'').trim();
    if(!name){ alert('스트리머 이름을 확인할 수 없습니다.'); return; }
    const x=parseInt(document.getElementById('ed-h2hpos-x')?.value||'50',10) || 50;
    const y=parseInt(document.getElementById('ed-h2hpos-y')?.value||'50',10) || 50;
    const map=_edH2HPosLoadAll();
    map[name]={x:Math.max(0,Math.min(100,x)), y:Math.max(0,Math.min(100,y))};
    _edH2HPosSaveAll(map);
    const del=document.getElementById('ed-h2hpos-del'); if(del) del.value='0';
    const msg=document.getElementById('ed-h2hpos-msg');
    if(msg){ msg.style.display='block'; setTimeout(()=>{ try{ msg.style.display='none'; }catch(e){} }, 1200); }
  }catch(e){}
  try{ if(typeof render==='function') render(); }catch(e){}
};
window.edBindH2HPosDrag = function(){
  try{
    const prev=document.getElementById('ed-h2hpos-prev');
    if(!prev || prev._dragBound) return;
    prev._dragBound = true;
    const applyFromEvent = (ev)=>{
      const r = prev.getBoundingClientRect();
      const cx = (ev.clientX - r.left) / Math.max(1, r.width);
      const cy = (ev.clientY - r.top) / Math.max(1, r.height);
      const x = Math.max(0, Math.min(100, Math.round(cx*100)));
      const y = Math.max(0, Math.min(100, Math.round(cy*100)));
      const xEl=document.getElementById('ed-h2hpos-x');
      const yEl=document.getElementById('ed-h2hpos-y');
      if(xEl) xEl.value=String(x);
      if(yEl) yEl.value=String(y);
      window.edH2HPosSyncFromInputs && window.edH2HPosSyncFromInputs();
    };
    prev.addEventListener('pointerdown', (ev)=>{
      try{ prev.setPointerCapture(ev.pointerId); }catch(e){}
      applyFromEvent(ev);
      const onMove=(e)=>applyFromEvent(e);
      const onUp=(e)=>{
        try{ prev.removeEventListener('pointermove', onMove); }catch(_){}
        try{ prev.removeEventListener('pointerup', onUp); }catch(_){}
        try{ prev.removeEventListener('pointercancel', onUp); }catch(_){}
      };
      prev.addEventListener('pointermove', onMove);
      prev.addEventListener('pointerup', onUp);
      prev.addEventListener('pointercancel', onUp);
    });
  }catch(e){}
};

// ─────────────────────────────────────────────────────────────
// 스트리머 상세 수정창(openEP)용: 프로필 사진1/2 object-position 드래그 보정
// 저장 필드: players[].photoPosX/photoPosY, photo2PosX/photo2PosY
// ─────────────────────────────────────────────────────────────
function _edClamp01(n){ return Math.max(0, Math.min(100, n)); }
window.edP1PosSyncFromInputs = function(){
  try{
    const x=parseInt(document.getElementById('ed-p1pos-x')?.value||'50',10) || 50;
    const y=parseInt(document.getElementById('ed-p1pos-y')?.value||'50',10) || 50;
    const img=document.getElementById('ed-p1pos-img');
    if(img) img.style.objectPosition = `${_edClamp01(x)}% ${_edClamp01(y)}%`;
    const xv=document.getElementById('ed-p1pos-xv'); if(xv) xv.textContent=`${_edClamp01(x)}%`;
    const yv=document.getElementById('ed-p1pos-yv'); if(yv) yv.textContent=`${_edClamp01(y)}%`;
    const del=document.getElementById('ed-p1pos-del'); if(del) del.value='0';
  }catch(e){}
};
window.edP1PosCenter = function(){
  try{
    const xEl=document.getElementById('ed-p1pos-x'); if(xEl) xEl.value='50';
    const yEl=document.getElementById('ed-p1pos-y'); if(yEl) yEl.value='50';
    window.edP1PosSyncFromInputs && window.edP1PosSyncFromInputs();
  }catch(e){}
};
window.edP1PosDelete = function(){
  try{
    const del=document.getElementById('ed-p1pos-del'); if(del) del.value='1';
    alert('프로필 사진 1 위치 보정값을 삭제합니다. (기본 center)');
  }catch(e){}
};
window.edBindP1PosDrag = function(){
  try{
    const prev=document.getElementById('ed-p1pos-prev');
    if(!prev || prev._dragBound) return;
    prev._dragBound=true;
    const apply=(ev)=>{
      const r=prev.getBoundingClientRect();
      const cx=(ev.clientX-r.left)/Math.max(1,r.width);
      const cy=(ev.clientY-r.top)/Math.max(1,r.height);
      const x=_edClamp01(Math.round(cx*100));
      const y=_edClamp01(Math.round(cy*100));
      const xEl=document.getElementById('ed-p1pos-x'); if(xEl) xEl.value=String(x);
      const yEl=document.getElementById('ed-p1pos-y'); if(yEl) yEl.value=String(y);
      window.edP1PosSyncFromInputs && window.edP1PosSyncFromInputs();
    };
    prev.addEventListener('pointerdown',(ev)=>{
      try{ prev.setPointerCapture(ev.pointerId); }catch(e){}
      apply(ev);
      const mv=(e)=>apply(e);
      const up=()=>{ try{prev.removeEventListener('pointermove',mv);}catch(_){}
        try{prev.removeEventListener('pointerup',up);}catch(_){}
        try{prev.removeEventListener('pointercancel',up);}catch(_){}
      };
      prev.addEventListener('pointermove',mv);
      prev.addEventListener('pointerup',up);
      prev.addEventListener('pointercancel',up);
    });
  }catch(e){}
};

window.edP2PosSyncFromInputs = function(){
  try{
    const x=parseInt(document.getElementById('ed-p2pos-x')?.value||'50',10) || 50;
    const y=parseInt(document.getElementById('ed-p2pos-y')?.value||'50',10) || 50;
    const img=document.getElementById('ed-p2pos-img');
    if(img) img.style.objectPosition = `${_edClamp01(x)}% ${_edClamp01(y)}%`;
    const xv=document.getElementById('ed-p2pos-xv'); if(xv) xv.textContent=`${_edClamp01(x)}%`;
    const yv=document.getElementById('ed-p2pos-yv'); if(yv) yv.textContent=`${_edClamp01(y)}%`;
    const del=document.getElementById('ed-p2pos-del'); if(del) del.value='0';
  }catch(e){}
};
window.edP2PosCenter = function(){
  try{
    const xEl=document.getElementById('ed-p2pos-x'); if(xEl) xEl.value='50';
    const yEl=document.getElementById('ed-p2pos-y'); if(yEl) yEl.value='50';
    window.edP2PosSyncFromInputs && window.edP2PosSyncFromInputs();
  }catch(e){}
};
window.edP2PosDelete = function(){
  try{
    const del=document.getElementById('ed-p2pos-del'); if(del) del.value='1';
    alert('프로필 사진 2 위치 보정값을 삭제합니다. (기본 center)');
  }catch(e){}
};
window.edBindP2PosDrag = function(){
  try{
    const prev=document.getElementById('ed-p2pos-prev');
    if(!prev || prev._dragBound) return;
    prev._dragBound=true;
    const apply=(ev)=>{
      const r=prev.getBoundingClientRect();
      const cx=(ev.clientX-r.left)/Math.max(1,r.width);
      const cy=(ev.clientY-r.top)/Math.max(1,r.height);
      const x=_edClamp01(Math.round(cx*100));
      const y=_edClamp01(Math.round(cy*100));
      const xEl=document.getElementById('ed-p2pos-x'); if(xEl) xEl.value=String(x);
      const yEl=document.getElementById('ed-p2pos-y'); if(yEl) yEl.value=String(y);
      window.edP2PosSyncFromInputs && window.edP2PosSyncFromInputs();
    };
    prev.addEventListener('pointerdown',(ev)=>{
      try{ prev.setPointerCapture(ev.pointerId); }catch(e){}
      apply(ev);
      const mv=(e)=>apply(e);
      const up=()=>{ try{prev.removeEventListener('pointermove',mv);}catch(_){}
        try{prev.removeEventListener('pointerup',up);}catch(_){}
        try{prev.removeEventListener('pointercancel',up);}catch(_){}
      };
      prev.addEventListener('pointermove',mv);
      prev.addEventListener('pointerup',up);
      prev.addEventListener('pointercancel',up);
    });
  }catch(e){}
};

// ─────────────────────────────────────────────────────────────
// 스트리머 상세 수정창(openEP)용: 헤더 배경 드래그 보정
// ─────────────────────────────────────────────────────────────
function _edPhbgResolveFit(){
  try{
    const v=String(document.getElementById('ed-phbg-fit')?.value||'').trim();
    if(v==='contain'||v==='cover'||v==='fill') return v;
    // "설정값 따름"일 때는 설정탭 기본값 추정
    const pdStyle=JSON.parse(localStorage.getItem('su_pd_style')||'{}')||{};
    const imgSettings=(typeof suReadImgSettings==='function')
      ? suReadImgSettings()
      : (JSON.parse(localStorage.getItem('su_img_settings')||'{}')||{});
    const hasFill = typeof imgSettings.fill === 'boolean';
    if(hasFill) return imgSettings.fill ? 'cover' : 'contain';
    const legacy=String(pdStyle.header_bg_fit||pdStyle.img_fill||'contain').trim();
    return (legacy==='cover'||legacy==='fill') ? legacy : 'contain';
  }catch(e){ return 'contain'; }
}
window.edPhbgSyncFromInputs = function(){
  try{
    const wrap=document.getElementById('ed-phbg-prev');
    let bg=document.getElementById('ed-phbg-prev-bg');
    if(!wrap) return;
    const url=String(document.getElementById('ed-phbg')?.value||'').trim();
    const fit=_edPhbgResolveFit();
    const size = (fit==='fill') ? '100% 100%' : (fit==='cover' ? 'cover' : 'contain');
    const scale = Math.max(40, Math.min(220, parseInt(document.getElementById('ed-phbg-scale')?.value||'100',10) || 100));
    const x = Math.max(0, Math.min(100, parseInt(document.getElementById('ed-phbg-posx')?.value||'50',10) || 50));
    const y = Math.max(0, Math.min(100, parseInt(document.getElementById('ed-phbg-posy')?.value||'50',10) || 50));
    if(!bg){
      bg=document.createElement('div');
      bg.id='ed-phbg-prev-bg';
      bg.style.position='absolute';
      bg.style.inset='-8%';
      bg.style.pointerEvents='none';
      wrap.prepend(bg);
    }
    if(!url){
      bg.style.backgroundImage='none';
      bg.style.opacity='0';
      return;
    }
    bg.style.opacity='.85';
    bg.style.backgroundImage=`url('${toHttpsUrl(url).replace(/'/g,'%27')}')`;
    bg.style.backgroundRepeat='no-repeat';
    bg.style.backgroundPosition=`${x}% ${y}%`;
    bg.style.backgroundSize=size;
    bg.style.transform=`scale(${scale/100})`;
    bg.style.transformOrigin='center center';
  }catch(e){}
};
window.edBindPhbgDrag = function(){
  try{
    const wrap=document.getElementById('ed-phbg-prev');
    if(!wrap || wrap._dragBound) return;
    wrap._dragBound=true;
    const apply=(ev)=>{
      const r=wrap.getBoundingClientRect();
      const cx=(ev.clientX-r.left)/Math.max(1,r.width);
      const cy=(ev.clientY-r.top)/Math.max(1,r.height);
      const x=Math.max(0,Math.min(100,Math.round(cx*100)));
      const y=Math.max(0,Math.min(100,Math.round(cy*100)));
      const xEl=document.getElementById('ed-phbg-posx'); if(xEl) xEl.value=String(x);
      const yEl=document.getElementById('ed-phbg-posy'); if(yEl) yEl.value=String(y);
      const xv=document.getElementById('ed-phbg-posx-val'); if(xv) xv.textContent=`${x}%`;
      const yv=document.getElementById('ed-phbg-posy-val'); if(yv) yv.textContent=`${y}%`;
      try{ document.getElementById('ed-phbg-pos').value='custom'; }catch(_){}
      try{ document.querySelectorAll('[data-phbg-pos]').forEach(el=>el.className='btn btn-xs btn-w'); }catch(_){}
      window.edPhbgSyncFromInputs && window.edPhbgSyncFromInputs();
    };
    wrap.addEventListener('pointerdown',(ev)=>{
      try{ wrap.setPointerCapture(ev.pointerId); }catch(e){}
      apply(ev);
      const mv=(e)=>apply(e);
      const up=()=>{ try{wrap.removeEventListener('pointermove',mv);}catch(_){}
        try{wrap.removeEventListener('pointerup',up);}catch(_){}
        try{wrap.removeEventListener('pointercancel',up);}catch(_){}
      };
      wrap.addEventListener('pointermove',mv);
      wrap.addEventListener('pointerup',up);
      wrap.addEventListener('pointercancel',up);
    });
  }catch(e){}
};

// ─────────────────────────────────────────────────────────────
// (요청사항) 대회탭 카드(조별리그 일정 등) 전용 디자인 3안
// ─────────────────────────────────────────────────────────────
window.cfgSetTourneyCardSettings = function(){
  const on = !!document.getElementById('cfg-tc-theme-on')?.checked;
  const accent = (document.getElementById('cfg-tc-accent')?.value || 'none').trim();
  const hd = parseInt(document.getElementById('cfg-tc-hd')?.value||'12',10);
  const bw = parseInt(document.getElementById('cfg-tc-bw')?.value||'4',10);
  const ic = parseInt(document.getElementById('cfg-tc-uicon')?.value||'34',10);
  const lw = parseInt(document.getElementById('cfg-tc-line-w')?.value||'2',10);
  const la = parseInt(document.getElementById('cfg-tc-line-a')?.value||'70',10);

  try{ localStorage.setItem('su_tc_theme_on', on ? '1' : '0'); }catch(e){}
  try{ localStorage.setItem('su_tc_accent_mode', ['none','header','border'].includes(accent)?accent:'none'); }catch(e){}
  try{ localStorage.setItem('su_tc_hd_alpha', String(Math.max(0,Math.min(30,hd)))); }catch(e){}
  try{ localStorage.setItem('su_tc_border_w', String(Math.max(2,Math.min(6,bw)))); }catch(e){}
  try{ localStorage.setItem('su_tc_uicon', String(Math.max(24,Math.min(48,ic)))); }catch(e){}
  try{ localStorage.setItem('su_tc_line_w', String(Math.max(1,Math.min(4,lw)))); }catch(e){}
  try{ localStorage.setItem('su_tc_line_a', String(Math.max(25,Math.min(100,la)))); }catch(e){}

  // 즉시 반영 (init.js 미로드/순서 이슈 대비)
  try{
    const _hd=Math.max(0,Math.min(30,hd));
    const _bw=Math.max(2,Math.min(6,bw));
    const _ic=Math.max(24,Math.min(48,ic));
    const _lw=Math.max(1,Math.min(4,lw));
    const _la=Math.max(25,Math.min(100,la));
    const _accent=['none','header','border'].includes(accent)?accent:'none';
    if(document.body){
      document.body.classList.toggle('tc-theme-on', !!on);
      document.body.classList.toggle('tc-accent-header', !!on && _accent==='header');
      document.body.classList.toggle('tc-accent-border', !!on && _accent==='border');
    }
    document.documentElement.style.setProperty('--tc-hd-a', String(_hd/100));
    document.documentElement.style.setProperty('--tc-bw', _bw+'px');
    document.documentElement.style.setProperty('--tc-uicon', _ic+'px');
    document.documentElement.style.setProperty('--tc-line-w', _lw+'px');
    document.documentElement.style.setProperty('--tc-line-a', String(_la/100));
  }catch(e){}
  try{ if(typeof window._applyTourneyCardTheme === 'function') window._applyTourneyCardTheme(); }catch(e){}
  try{ if(typeof render === 'function') render(); }catch(e){}
};

// ─────────────────────────────────────────────────────────────
// 공유카드 전역 디자인 모드 / 색상 효과
// ─────────────────────────────────────────────────────────────
window.cfgSetShareCardSettings = window.cfgSetShareCardSettings || function(){
  const mode = (document.getElementById('cfg-sc-mode')?.value || 'campus').trim();
  const color = parseInt(document.getElementById('cfg-sc-color')?.value||'72',10);
  const fx = parseInt(document.getElementById('cfg-sc-fx')?.value||'55',10);
  const winbg = parseInt(document.getElementById('cfg-sc-winbg')?.value||'55',10);
  const losergray = parseInt(document.getElementById('cfg-sc-losergray')?.value||'55',10);
  const profile = parseInt(document.getElementById('cfg-sc-profile')?.value||'100',10);
  const font = parseInt(document.getElementById('cfg-sc-font')?.value||'100',10);
  const surface = (document.getElementById('cfg-sc-surface')?.value || 'glass').trim();
  const logoLayout = (document.getElementById('cfg-sc-logo-layout')?.value || 'stack').trim();
  const logoSize = parseInt(document.getElementById('cfg-sc-logo-size')?.value||'100',10);
  const logoFit = (document.getElementById('cfg-sc-logo-fit')?.value || 'contain').trim();
  try{ localStorage.setItem('su_sc_mode', ['campus','vivid','soft','dark','minimal','aurora','poster','mono'].includes(mode)?mode:'campus'); }catch(e){}
  try{ localStorage.setItem('su_sc_color', String(Math.max(20,Math.min(100,color)))); }catch(e){}
  try{ localStorage.setItem('su_sc_fx', String(Math.max(0,Math.min(100,fx)))); }catch(e){}
  try{ localStorage.setItem('su_sc_winbg', String(Math.max(0,Math.min(100,winbg)))); }catch(e){}
  try{ localStorage.setItem('su_sc_losergray', String(Math.max(10,Math.min(90,losergray)))); }catch(e){}
  try{ localStorage.setItem('su_sc_profile_pct', String(Math.max(70,Math.min(145,profile)))); }catch(e){}
  try{ localStorage.setItem('su_sc_font_pct', String(Math.max(85,Math.min(135,font)))); }catch(e){}
  try{ localStorage.setItem('su_sc_surface', ['glass','clean','solid'].includes(surface)?surface:'glass'); }catch(e){}
  try{ localStorage.setItem('su_sc_logo_layout', ['stack','inline','badge','cover'].includes(logoLayout)?logoLayout:'stack'); }catch(e){}
  try{ localStorage.setItem('su_sc_logo_size', String(Math.max(70,Math.min(150,logoSize)))); }catch(e){}
  try{ localStorage.setItem('su_sc_logo_fit', ['contain','cover','fill','zoom'].includes(logoFit)?logoFit:'contain'); }catch(e){}
  try{ if(typeof render === 'function') render(); }catch(e){}
};
window.cfgSyncTeamColorPreview = window.cfgSyncTeamColorPreview || function(){
  try{
    const ckA = document.getElementById('cfg-team-ck-a')?.value || (localStorage.getItem('su_team_color_ck_a')||'#2563eb');
    const ckB = document.getElementById('cfg-team-ck-b')?.value || (localStorage.getItem('su_team_color_ck_b')||'#6366f1');
    const proA = document.getElementById('cfg-team-pro-a')?.value || (localStorage.getItem('su_team_color_pro_a')||'#0f766e');
    const proB = document.getElementById('cfg-team-pro-b')?.value || (localStorage.getItem('su_team_color_pro_b')||'#4f46e5');
    const paint=(id,color,label)=>{
      const el=document.getElementById(id);
      if(!el) return;
      el.style.background=color;
      el.style.borderColor=color;
      el.textContent=label;
    };
    paint('cfg-team-ck-prev-a', ckA, `A팀 ${ckA}`);
    paint('cfg-team-ck-prev-b', ckB, `B팀 ${ckB}`);
    paint('cfg-team-pro-prev-a', proA, `A팀 ${proA}`);
    paint('cfg-team-pro-prev-b', proB, `B팀 ${proB}`);
  }catch(e){}
};
try{
  const _m = [
    ['su_team_color_ck_a', '#0e7490', '#2563eb'],
    ['su_team_color_ck_b', '#b45309', '#6366f1'],
    ['su_team_color_pro_b', '#7c3aed', '#4f46e5']
  ];
  _m.forEach(([k, oldV, nextV])=>{
    try{
      const cur = String(localStorage.getItem(k)||'').trim().toLowerCase();
      if(!cur || cur===oldV.toLowerCase()) localStorage.setItem(k, nextV);
    }catch(e){}
  });
}catch(e){}
window.cfgPreviewShareCardMode = window.cfgPreviewShareCardMode || function(mode){
  const el=document.getElementById('cfg-sc-mode');
  if(el) el.value = ['campus','vivid','soft','dark','minimal','aurora','poster','mono'].includes(mode)?mode:'campus';
  window.cfgSetShareCardSettings && window.cfgSetShareCardSettings();
};
window.cfgSetShareCardOverrides = function(){
  const pairs = [
    ['default', document.getElementById('cfg-sc-ov-def')?.value || 'inherit'],
    ['ck', document.getElementById('cfg-sc-ov-ck')?.value || 'inherit'],
    ['pro', document.getElementById('cfg-sc-ov-pro')?.value || 'inherit'],
    ['tt', document.getElementById('cfg-sc-ov-tt')?.value || 'inherit'],
    ['comp', document.getElementById('cfg-sc-ov-comp')?.value || 'inherit'],
    ['procomp-bkt', document.getElementById('cfg-sc-ov-bkt')?.value || 'inherit'],
  ];
  pairs.forEach(([k,v])=>{
    try{
      if(v==='inherit') localStorage.removeItem(`su_sc_mode_${k}`);
      else localStorage.setItem(`su_sc_mode_${k}`, v);
    }catch(e){}
  });
  const grayPairs = [
    ['default', document.getElementById('cfg-sc-gray-def')?.value || 'inherit'],
    ['ck', document.getElementById('cfg-sc-gray-ck')?.value || 'inherit'],
    ['pro', document.getElementById('cfg-sc-gray-pro')?.value || 'inherit'],
    ['tt', document.getElementById('cfg-sc-gray-tt')?.value || 'inherit'],
    ['comp', document.getElementById('cfg-sc-gray-comp')?.value || 'inherit'],
    ['procomp-bkt', document.getElementById('cfg-sc-gray-bkt')?.value || 'inherit'],
  ];
  grayPairs.forEach(([k,v])=>{
    try{
      if(v==='inherit') localStorage.removeItem(`su_sc_losergray_${k}`);
      else localStorage.setItem(`su_sc_losergray_${k}`, String(Math.max(10,Math.min(90,parseInt(v,10)||55))));
    }catch(e){}
  });
  const profilePairs = [
    ['default', document.getElementById('cfg-sc-prof-def')?.value || 'inherit'],
    ['ck', document.getElementById('cfg-sc-prof-ck')?.value || 'inherit'],
    ['pro', document.getElementById('cfg-sc-prof-pro')?.value || 'inherit'],
    ['tt', document.getElementById('cfg-sc-prof-tt')?.value || 'inherit'],
    ['comp', document.getElementById('cfg-sc-prof-comp')?.value || 'inherit'],
    ['procomp-bkt', document.getElementById('cfg-sc-prof-bkt')?.value || 'inherit'],
  ];
  profilePairs.forEach(([k,v])=>{
    try{
      if(v==='inherit') localStorage.removeItem(`su_sc_profile_pct_${k}`);
      else localStorage.setItem(`su_sc_profile_pct_${k}`, String(Math.max(70,Math.min(145,parseInt(v,10)||100))));
    }catch(e){}
  });
  const fontPairs = [
    ['default', document.getElementById('cfg-sc-font-def')?.value || 'inherit'],
    ['ck', document.getElementById('cfg-sc-font-ck')?.value || 'inherit'],
    ['pro', document.getElementById('cfg-sc-font-pro')?.value || 'inherit'],
    ['tt', document.getElementById('cfg-sc-font-tt')?.value || 'inherit'],
    ['comp', document.getElementById('cfg-sc-font-comp')?.value || 'inherit'],
    ['procomp-bkt', document.getElementById('cfg-sc-font-bkt')?.value || 'inherit'],
  ];
  fontPairs.forEach(([k,v])=>{
    try{
      if(v==='inherit') localStorage.removeItem(`su_sc_font_pct_${k}`);
      else localStorage.setItem(`su_sc_font_pct_${k}`, String(Math.max(85,Math.min(135,parseInt(v,10)||100))));
    }catch(e){}
  });
  const shapePairs = [
    ['default', document.getElementById('cfg-sc-shape-def')?.value || 'inherit'],
    ['ck', document.getElementById('cfg-sc-shape-ck')?.value || 'inherit'],
    ['pro', document.getElementById('cfg-sc-shape-pro')?.value || 'inherit'],
    ['tt', document.getElementById('cfg-sc-shape-tt')?.value || 'inherit'],
    ['comp', document.getElementById('cfg-sc-shape-comp')?.value || 'inherit'],
    ['procomp-bkt', document.getElementById('cfg-sc-shape-bkt')?.value || 'inherit'],
  ];
  shapePairs.forEach(([k,v])=>{
    try{
      if(v==='inherit') localStorage.removeItem(`su_sc_cardshape_${k}`);
      else localStorage.setItem(`su_sc_cardshape_${k}`, ['rounded','sharp','soft','ribbon','tag','ticket'].includes(v)?v:'rounded');
    }catch(e){}
  });
  try{ if(typeof render === 'function') render(); }catch(e){}
};

// ─────────────────────────────────────────────────────────────
// (요청사항) 토너먼트 대진표/브라켓 디자인 프리셋
// - 기존 슬라이더(선두께/진하기/테두리/로고크기 등)에 값을 "한 번에" 채워줌
// - 실제 저장/적용은 cfgSetTourneyCardSettings()가 수행
// ─────────────────────────────────────────────────────────────
window.cfgApplyBracketPreset = function(preset){
  const p = (preset || '').trim();
  const presets = {
    '기본':      {on:true, accent:'none',  hd:12, bw:4, ic:34, lw:2, la:70},
    '월드컵':    {on:true, accent:'header',hd:18, bw:5, ic:42, lw:3, la:85},
    '프로리그':  {on:true, accent:'border',hd:10, bw:6, ic:38, lw:2, la:78},
    '컴팩트':    {on:true, accent:'none',  hd:8,  bw:3, ic:30, lw:1, la:65},
    '미니멀':    {on:true, accent:'none',  hd:0,  bw:1, ic:32, lw:1, la:40},
    '다크리그':  {on:true, accent:'border',hd:16, bw:6, ic:40, lw:3, la:90},
  };
  const v = presets[p] || presets['기본'];
  const set = (id, val) => { const el=document.getElementById(id); if(el){ el.value = String(val); el.dispatchEvent(new Event('input')); } };
  try{
    const chk=document.getElementById('cfg-tc-theme-on'); if(chk) chk.checked = !!v.on;
    const sel=document.getElementById('cfg-tc-accent'); if(sel) sel.value = v.accent;
    set('cfg-tc-hd', v.hd); set('cfg-tc-bw', v.bw); set('cfg-tc-uicon', v.ic); set('cfg-tc-line-w', v.lw); set('cfg-tc-line-a', v.la);
    // 숫자 박스 동기화(있는 경우)
    const syncNum = (rangeId, numSpanId, suf='') => {
      const r=document.getElementById(rangeId); const s=document.getElementById(numSpanId);
      if(r && s) s.textContent = r.value + suf;
    };
    syncNum('cfg-tc-hd','cfg-tc-hd-v','%');
    syncNum('cfg-tc-bw','cfg-tc-bw-v','px');
    syncNum('cfg-tc-uicon','cfg-tc-ic-v','px');
    syncNum('cfg-tc-line-w','cfg-tc-lw-v','px');
    syncNum('cfg-tc-line-a','cfg-tc-la-v','%');
  }catch(e){}
  try{ window.cfgSetTourneyCardSettings && window.cfgSetTourneyCardSettings(); }catch(e){}
};

// ─────────────────────────────────────────────────────────────
// (요청사항) 캘린더 요약칩/공유 버튼 구성
// ─────────────────────────────────────────────────────────────
window.cfgSetCalendarUiSettings = function(){
  const chipMode = (document.getElementById('cfg-cal-chip')?.value || 'types').trim(); // total | types
  const shareAdminOnly = !!document.getElementById('cfg-share-adminonly')?.checked;
  try{ localStorage.setItem('su_cal_chip_mode', (chipMode==='total'?'total':'types')); }catch(e){}
  try{ localStorage.setItem('su_share_admin_only', shareAdminOnly ? '1' : '0'); }catch(e){}
  try{ if(typeof render === 'function') render(); }catch(e){}
};

// ─────────────────────────────────────────────────────────────
// (요청사항) 날짜 버튼 메뉴(대회/프로리그 일정) 디자인 모드
// - ASL 스케줄 페이지처럼 날짜 탭 형태 + 미니 매치업 프리뷰
// ─────────────────────────────────────────────────────────────
window.cfgSetDateMenuStyle = function(){
  const v = (document.getElementById('cfg-date-menu-style')?.value || 'pill').trim(); // pill | asl
  try{ localStorage.setItem('su_date_menu_style', v==='asl' ? 'asl' : 'pill'); }catch(e){}
  try{ if(typeof render === 'function') render(); }catch(e){}
};

// ─────────────────────────────────────────────────────────────
// (요청사항) 헤더 커스텀(제목/좌측 아이콘/우측 이미지/배경 이미지/높이)
// ─────────────────────────────────────────────────────────────
window.cfgSetHeaderSettings = function(){
  const title = (document.getElementById('cfg-hdr-title')?.value || '').trim();
  const lIco  = (document.getElementById('cfg-hdr-left')?.value || '').trim();
  const lSz   = parseInt(document.getElementById('cfg-hdr-left-sz')?.value || '22',10) || 22;
  const rImg  = (document.getElementById('cfg-hdr-right')?.value || '').trim();
  const rSz   = parseInt(document.getElementById('cfg-hdr-right-sz')?.value || '32',10) || 32;
  const bgImg = (document.getElementById('cfg-hdr-bg')?.value || '').trim();
  const hH    = parseInt(document.getElementById('cfg-hdr-h')?.value || '0',10) || 0;
  const fx    = (document.getElementById('cfg-hdr-fx')?.value || 'classic').trim();
  const c1    = (document.getElementById('cfg-hdr-c1')?.value || '').trim();
  const c2    = (document.getElementById('cfg-hdr-c2')?.value || '').trim();
  const sync  = !!document.getElementById('cfg-hdr-sync')?.checked;
  try{ localStorage.setItem('su_hdr_title', title); }catch(e){}
  try{ localStorage.setItem('su_hdr_left_icon', lIco); }catch(e){}
  try{ localStorage.setItem('su_hdr_left_size', String(Math.max(14,Math.min(44,lSz)))); }catch(e){}
  try{ localStorage.setItem('su_hdr_right_img', rImg); }catch(e){}
  try{ localStorage.setItem('su_hdr_right_size', String(Math.max(18,Math.min(70,rSz)))); }catch(e){}
  try{ localStorage.setItem('su_hdr_bg_img', bgImg); }catch(e){}
  try{ localStorage.setItem('su_hdr_height', String(Math.max(0,Math.min(140,hH)))); }catch(e){}
  try{ localStorage.setItem('su_hdr_fx', fx); }catch(e){}
  try{ localStorage.setItem('su_hdr_c1', c1); }catch(e){}
  try{ localStorage.setItem('su_hdr_c2', c2); }catch(e){}
  try{ localStorage.setItem('su_hdr_sync_theme', sync?'1':'0'); }catch(e){}
  try{ if(typeof window._applyHeaderSettings === 'function') window._applyHeaderSettings(); }catch(e){}
  try{ if(typeof render === 'function') render(); }catch(e){}
};

// ─────────────────────────────────────────────────────────────
// (요청사항) 헤더 테마 프리셋
// - 여러 개 저장/선택/적용
// ─────────────────────────────────────────────────────────────
