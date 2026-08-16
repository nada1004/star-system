/* ══════════════════════════════════════════════════════════════
   설정 - 보드2 이미지 설정 UI (settings-base.js 에서 분리, 2026-07-30)
   ══════════════════════════════════════════════════════════════ */

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
      <div style="font-weight:700;font-size:var(--fs-sm);color:var(--text2);margin-bottom:10px">이미지 1 (기본 이미지)</div>
      ${_b2BuildImageControlGroup('','primary','이미지 1',true)}
      <div style="font-weight:700;font-size:var(--fs-sm);color:var(--text2);margin:14px 0 10px">이미지 2 (두번째 이미지)</div>
      ${_b2BuildImageControlGroup('','secondary','이미지 2',true)}
      <hr style="border:none;border-top:1px solid var(--border);margin:12px 0">
      <label style="display:flex;align-items:center;gap:8px;font-size:var(--fs-sm);cursor:pointer;font-weight:900;color:var(--text2)">
        <input type="checkbox" id="cfg-b2-profile-shuffle" style="width:15px;height:15px" ${_shuffle?'checked':''} onchange="localStorage.setItem('su_b2_profile_shuffle',this.checked?'1':'0');render()">
        이미지탭(프로필) 목록 랜덤(셔플)
      </label>
      <div style="font-size:var(--fs-caption);color:var(--gray-l);margin-top:6px">※ PC 좌/우 및 대학 필터에서도 적용됩니다(보기 재미용)</div>
      <hr style="border:none;border-top:1px dashed var(--border2);margin:14px 0">
      <div style="font-weight:900;font-size:var(--fs-sm);color:var(--text2);margin-bottom:10px">전환 시간(선수별)</div>
      <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-bottom:10px">
        <select id="cfg-b2-delay-player" style="flex:1;min-width:180px" onchange="localStorage.setItem('su_b2_swap_delay_player',this.value||''); if(typeof _cfgB2RenderSwapDelay==='function') _cfgB2RenderSwapDelay(this.value||'');">
          <option value="">선수 선택</option>
          ${_opts}
        </select>
        <button class="btn btn-xs btn-w" onclick="localStorage.setItem('su_b2_swap_delay_player',''); const sel=document.getElementById('cfg-b2-delay-player'); if(sel) sel.value=''; if(typeof _cfgB2RenderSwapDelay==='function') _cfgB2RenderSwapDelay('');">초기화</button>
      </div>
      <div id="cfg-b2-delay-area" style="padding:12px;background:rgba(37,99,235,.06);border:1px solid rgba(37,99,235,.18);border-radius:var(--r)">
        <div style="font-size:var(--fs-sm);color:var(--gray-l)">선수를 선택하면 이미지 2→3, 3→4, 4→5 전환 시간을 설정할 수 있습니다.</div>
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
      area.innerHTML = `<div style="font-size:var(--fs-sm);color:var(--gray-l)">선수를 선택하면 이미지 전환 시간을 세부적으로 설정할 수 있습니다.</div>`;
      return;
    }
    const p = (Array.isArray(window.players)?window.players:[]).find(x=>x && x.name===name);
    if(!p){
      area.innerHTML = `<div style="font-size:var(--fs-sm);color:var(--gray-l)">선수를 찾을 수 없습니다.</div>`;
      return;
    }
    const clamp = (v)=>{ const n = parseFloat(v); if(isNaN(n)) return 4; return Math.max(0.2, Math.min(60, n)); };
    const slotOrder = [
      { slot:1, url:String(p.photo||'').trim() },
      { slot:2, url:String(p.secondProfileFile||'').trim() },
      { slot:3, url:String(p.profileFile3||'').trim() },
      { slot:4, url:String(p.profileFile4||'').trim() },
      { slot:5, url:String(p.profileFile5||'').trim() },
      { slot:6, url:String(p.profileFile6||'').trim() },
      { slot:7, url:String(p.profileFile7||'').trim() },
      { slot:8, url:String(p.profileFile8||'').trim() },
      { slot:9, url:String(p.profileFile9||'').trim() },
      { slot:10, url:String(p.profileFile10||'').trim() }
    ].filter(item=>!!item.url);
    const _delayKeyLegacy = {
      '1_2':'photoDelay12','2_1':'photoDelay21','2_3':'photoDelay23','3_1':'photoDelay31',
      '3_4':'photoDelay34','4_1':'photoDelay41','4_5':'photoDelay45','5_1':'photoDelay51'
    };
    const delayKey = (from, to)=>{
      const k = `${from}_${to}`;
      return _delayKeyLegacy[k] || `photoDelay${k}`;
    };
    const safe = name.replace(/\\/g,'\\\\').replace(/'/g,"\\'");
    const inputsHtml = slotOrder.length < 2
      ? `<div style="font-size:var(--fs-sm);color:var(--gray-l)">등록된 이미지가 1개라 전환 시간이 필요하지 않습니다.</div>`
      : `<div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px">${slotOrder.map((item, idx)=>{
          const next = slotOrder[(idx + 1) % slotOrder.length];
          const key = delayKey(item.slot, next.slot);
          if(!key) return '';
          const val = clamp(p[key] ?? 4);
          return `<div>
            <div style="font-size:var(--fs-caption);font-weight:900;color:var(--text3);margin-bottom:6px">${item.slot} → ${next.slot} (초)</div>
            <input type="number" data-delay-key="${key}" min="0.2" max="60" step="0.1" value="${val}" style="width:100%" oninput="_cfgB2SaveSwapDelay('${safe}')">
          </div>`;
        }).join('')}</div>`;
    area.innerHTML = `
      ${inputsHtml}
      <div style="font-size:10px;color:var(--gray-l);margin-top:8px">값은 즉시 저장됩니다.</div>
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
    const clamp = (v)=>{ const n = parseFloat(v); if(isNaN(n)) return 4; return Math.max(0.2, Math.min(60, n)); };
    inputs.forEach(input=>{
      const key = String(input?.getAttribute('data-delay-key') || '').trim();
      if(!key) return;
      // [FIX] 값이 1이면 무조건 삭제하던 로직 제거 — 사용자가 입력한 값을 항상 그대로 저장한다.
      p[key] = clamp(input.value);
    });
    // [FIX-DELAY-INPUT-DEBOUNCE] 예전에는 키 입력마다(oninput) 곧바로 save()와 슬라이드쇼
    // 재시작(_b2ScheduleImageSwap)을 호출해서, 숫자 여러 자리를 입력하는 동안 슬라이드쇼가
    // 키 입력마다 계속 처음부터 재시작됐다. 값 반영 자체는 즉시 하되, 저장/재시작은 입력이
    // 잠시 멈춘 뒤(400ms) 한 번만 실행되도록 디바운스한다.
    window._b2DelaySaveDebounce = window._b2DelaySaveDebounce || {};
    if (window._b2DelaySaveDebounce[name]) clearTimeout(window._b2DelaySaveDebounce[name]);
    window._b2DelaySaveDebounce[name] = setTimeout(()=>{
      try{
        if(typeof window.save === 'function') window.save();
        const cur = window._b2SelectedPlayer && window._b2SelectedPlayer.name;
        if(cur === name && typeof window._b2ScheduleImageSwap === 'function') window._b2ScheduleImageSwap(name);
      }catch(e){}
    }, 400);
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
  '🖼️ 스트리머/프로필':['b2layout','imgsettings','imgmodalsettings','profileshape','univlogoimg','si','siAssign','pdModeBadge','pd','matchdetail','ud','streamerheader','streamerchannel','streamer-view','streamer-tab-style'],
  '🧾 카드/기록':[
    'reccard','minicard','univckcard','univmcard',
    'tourneycard','tiertourcard','tiertourleaguecard','tiertourbrackcard',
    'procompcard','procompleaguecard','procompteamcard','procompgjcard',
    'h2hpanel','sharecard','calui'
  ],
  '🎨 UI/테마':['designv2','hdr','appfont','uisize','cardgap','tierrank-view','uibtn','uifilter','tablabels','tabcolors','tabvis','autofitall'],
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
        <div style="font-size:var(--fs-caption);font-weight:800;color:var(--text3)">${label}</div>
        <div style="margin-top:6px;font-size:22px;font-weight:950;color:${color}">${count}</div>
        <div style="margin-top:4px;font-size:var(--fs-caption);color:var(--text3)">${sub}</div>
      </div>`;
    const playerButtons = arr => arr.slice(0, 8).map(p => `
      <button type="button" class="btn btn-w btn-xs" style="padding:4px 8px;border-radius:999px" onclick="openPlayerModal('${_escJ(String(p?.name || ''))}')">${_escH(String(p?.name || '-'))}</button>
    `).join('');
    const sectionBox = (title, arr, body, empty) => `
      <div style="padding:12px;border:1px solid var(--border);border-radius:14px;background:var(--white)">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:8px">
          <div style="font-size:var(--fs-sm);font-weight:900;color:var(--text2)">${title}</div>
          <span style="font-size:var(--fs-caption);font-weight:800;color:var(--text3)">${arr.length}건</span>
        </div>
        ${arr.length ? body : `<div style="font-size:var(--fs-caption);color:var(--gray-l)">${empty}</div>`}
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
          ${sectionBox('잘못된 대학값', invalidUniv, `<div style="display:flex;flex-direction:column;gap:6px">${invalidUniv.slice(0, 8).map(p=>`<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;padding:8px 10px;border-radius:var(--r);background:var(--surface)"><button type="button" class="btn btn-w btn-xs" onclick="openPlayerModal('${_escJ(String(p?.name || ''))}')">${_escH(String(p?.name || '-'))}</button><span style="font-size:var(--fs-caption);color:#dc2626;font-weight:800">${_escH(String(p?.univ || '-'))}</span></div>`).join('')}</div>`, '이상 없음')}
          ${sectionBox('중복 이름 의심', duplicateGroups, `<div style="display:flex;flex-direction:column;gap:6px">${duplicateGroups.slice(0, 8).map(group=>`<div style="padding:8px 10px;border-radius:var(--r);background:var(--surface);font-size:var(--fs-caption);color:var(--text2);font-weight:800">${group.map(p=>_escH(String(p?.name || '-'))).join(' / ')}</div>`).join('')}</div>`, '중복 의심 없음')}
          ${sectionBox('날짜 형식 이상 기록', dateIssues, `<div style="display:flex;flex-direction:column;gap:6px">${dateIssues.map(item=>`<div style="padding:8px 10px;border-radius:var(--r);background:#fff1f2;border:1px solid #fecdd3;font-size:var(--fs-caption)"><strong style="color:#be123c">${_escH(item.name)}</strong><span style="color:var(--text3)"> · ${_escH(item.raw)}</span></div>`).join('')}</div>`, '이상 없음')}
        </div>
      </div>`;
  }catch(e){
    out.innerHTML = `<div style="font-size:var(--fs-sm);color:#dc2626">데이터 검수 중 오류: ${_escH(e?.message || e)}</div>`;
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
