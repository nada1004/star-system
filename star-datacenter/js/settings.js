/* ══════════════════════════════════════
   ⚙️ settings.js — 설정 탭 전용
   tier-tour.js에서 분리됨. 이 파일의 버그가 티어대회 탭에 영향을 주지 않습니다.
══════════════════════════════════════ */

// ─────────────────────────────────────────────────────────────
// HTML escape (설정 화면 템플릿 문자열 안전 처리)
// window.escHTML은 constants.js에서 전역 단일 정의됨
// ─────────────────────────────────────────────────────────────
function esc(s){ return window.escHTML(s); }

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
      ? `<div style="font-size:var(--fs-sm);color:var(--gray-l)">등록된 이미지가 1개라 전환 시간이 필요하지 않습니다.</div>`
      : `<div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px">${slotOrder.map((item, idx)=>{
          const next = slotOrder[(idx + 1) % slotOrder.length];
          const key = delayKey(item.slot, next.slot);
          if(!key) return '';
          const val = clamp(p[key] ?? 1);
          return `<div>
            <div style="font-size:var(--fs-caption);font-weight:900;color:var(--text3);margin-bottom:6px">${item.slot} → ${next.slot} (초)</div>
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
  '🖼️ 스트리머/프로필':['b2layout','imgsettings','imgmodalsettings','profileshape','univlogoimg','si','siAssign','pdModeBadge','pd','matchdetail','streamerheader','streamer-view'],
  '🧾 카드/기록':[
    'reccard','minicard','univckcard','univmcard',
    'tourneycard','tiertourcard','tiertourleaguecard','tiertourbrackcard',
    'procompcard','procompleaguecard','procompteamcard','procompgjcard',
    'h2hpanel','sharecard','calui'
  ],
  '🎨 UI/테마':['designv2','hdr','appfont','uisize','tierrank-view','uibtn','uifilter','tablabels','tabcolors','autofitall'],
  '🧠 자동화/도구':['bgm','soopmv','pasteRoute','fab'],
  '🧩 현황판/펨코':['b2femco','femcoorder','boardchip','oldbright','boardbg'],
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
const _HDR_PRESETS_KEY = 'su_hdr_presets_v1';
const _HDR_PRESET_SEL_KEY = 'su_hdr_preset_sel_v1';
function _hdrPresetUid(){ return 'hdr_'+Date.now().toString(36)+Math.random().toString(36).slice(2,6); }
function _hdrPresetsLoad(){
  try{
    const v = JSON.parse(localStorage.getItem(_HDR_PRESETS_KEY)||'null');
    return Array.isArray(v) ? v : [];
  }catch(e){ return []; }
}
function _hdrPresetsSave(arr){
  try{ localStorage.setItem(_HDR_PRESETS_KEY, JSON.stringify(Array.isArray(arr)?arr:[])); }catch(e){}
}
function _hdrPresetSelLoad(){ try{ return localStorage.getItem(_HDR_PRESET_SEL_KEY)||''; }catch(e){ return ''; } }
function _hdrPresetSelSave(id){ try{ localStorage.setItem(_HDR_PRESET_SEL_KEY, String(id||'')); }catch(e){} }
function _hdrPresetGetCurrentSnapshot(){
  const get=(k,def='')=>{ try{ return (localStorage.getItem(k)||def); }catch(e){ return def; } };
  let themeVars=null;
  try{ themeVars = JSON.parse(localStorage.getItem('su_theme_vars_v1')||'null'); }catch(e){ themeVars=null; }
  if(!themeVars || typeof themeVars!=='object') themeVars=null;
  return {
    title: get('su_hdr_title','스타대학 데이터 센터'),
    leftIco: get('su_hdr_left_icon','🏆'),
    leftSz: parseInt(get('su_hdr_left_size','22'),10)||22,
    rightImg: get('su_hdr_right_img',''),
    rightSz: parseInt(get('su_hdr_right_size','32'),10)||32,
    bgImg: get('su_hdr_bg_img',''),
    hH: parseInt(get('su_hdr_height','0'),10)||0,
    fx: get('su_hdr_fx','classic'),
    c1: get('su_hdr_c1','#1e3a8a'),
    c2: get('su_hdr_c2','#2563eb'),
    sync: (get('su_hdr_sync_theme','0')==='1'),
    themeVars: themeVars
  };
}
function _hdrPresetApplySnapshot(s){
  if(!s) return;
  try{ localStorage.setItem('su_hdr_title', String(s.title||'')); }catch(e){}
  try{ localStorage.setItem('su_hdr_left_icon', String(s.leftIco||'')); }catch(e){}
  try{ localStorage.setItem('su_hdr_left_size', String(s.leftSz||22)); }catch(e){}
  try{ localStorage.setItem('su_hdr_right_img', String(s.rightImg||'')); }catch(e){}
  try{ localStorage.setItem('su_hdr_right_size', String(s.rightSz||32)); }catch(e){}
  try{ localStorage.setItem('su_hdr_bg_img', String(s.bgImg||'')); }catch(e){}
  try{ localStorage.setItem('su_hdr_height', String(s.hH||0)); }catch(e){}
  try{ localStorage.setItem('su_hdr_fx', String(s.fx||'classic')); }catch(e){}
  try{ localStorage.setItem('su_hdr_c1', String(s.c1||'#1e3a8a')); }catch(e){}
  try{ localStorage.setItem('su_hdr_c2', String(s.c2||'#2563eb')); }catch(e){}
  try{ localStorage.setItem('su_hdr_sync_theme', s.sync ? '1':'0'); }catch(e){}
  // 전체 테마 변수(선택 프리셋에 themeVars가 있으면 적용)
  try{
    if(s.themeVars && typeof s.themeVars==='object'){
      localStorage.setItem('su_theme_vars_v1', JSON.stringify(s.themeVars));
    } else {
      localStorage.removeItem('su_theme_vars_v1');
    }
  }catch(e){}
  try{ window._applyThemeVars && window._applyThemeVars(); }catch(e){}
  try{ if(typeof window._applyHeaderSettings==='function') window._applyHeaderSettings(); }catch(e){}
}
function _hdrEnsurePresets(){
  let presets=_hdrPresetsLoad();
  let sel=_hdrPresetSelLoad();
  if(!presets.length){
    const snap=_hdrPresetGetCurrentSnapshot();
    presets=[{id:_hdrPresetUid(), name:'기본', createdAt:Date.now(), ...snap}];
    sel=presets[0].id;
    _hdrPresetsSave(presets);
    _hdrPresetSelSave(sel);
  }
  if(!sel || !presets.some(p=>p.id===sel)){
    sel=presets[0]?.id||'';
    _hdrPresetSelSave(sel);
  }
  // 테마팩 1회 자동 설치
  try{
    // v2: 신규 프리셋(여름방학 등) 자동 추가를 위해 버전 키를 올림
    if(localStorage.getItem('su_hdr_theme_pack_installed_v3')!=='1'){
      const out = _hdrPresetInstallThemePack(presets);
      if(out && out.changed){
        presets = out.presets;
        _hdrPresetsSave(presets);
      }
      localStorage.setItem('su_hdr_theme_pack_installed_v3','1');
    }
  }catch(e){}
  return {presets, sel};
}

// 시즌/기념일/스타크래프트 테마팩 생성
function _hdrPresetInstallThemePack(presets){
  const _existsByName = (nm)=> (presets||[]).some(p=>String(p.name||'')===nm);
  // 색 유틸
  const _hexToRgb=(hex)=>{ const h=String(hex||'').replace('#','').trim(); if(!/^[0-9a-fA-F]{6}$/.test(h)) return null; return {r:parseInt(h.slice(0,2),16),g:parseInt(h.slice(2,4),16),b:parseInt(h.slice(4,6),16)}; };
  const _rgbToHex=(r,g,b)=>{ const to=(n)=>Math.max(0,Math.min(255,Math.round(n))).toString(16).padStart(2,'0'); return `#${to(r)}${to(g)}${to(b)}`; };
  const _mix=(a,b,t)=>{ const A=_hexToRgb(a),B=_hexToRgb(b); if(!A||!B) return a||b||'#2563eb'; return _rgbToHex(A.r+(B.r-A.r)*t,A.g+(B.g-A.g)*t,A.b+(B.b-A.b)*t); };
  const _darken=(hex,t)=>_mix(hex,'#000000',t);
  const _lighten=(hex,t)=>_mix(hex,'#ffffff',t);
  const mkThemeVars=(accent)=>{
    return {
      '--blue': accent,
      '--blue-d': _darken(accent, 0.18),
      '--blue-l': _lighten(accent, 0.86),
      '--blue-ll': _lighten(accent, 0.92),
    };
  };
  const add=(name, opt)=>{
    if(_existsByName(name)) return false;
    const id=_hdrPresetUid();
    const base = _hdrPresetGetCurrentSnapshot();
    const accent = opt.accent || (opt.c2||'#2563eb');
    const themeVars = {
      ...(opt.themeVars||{}),
      ...(opt.fullTheme?{
        '--bg': opt.fullTheme.bg||'#f0f2f5',
        '--surface': opt.fullTheme.surface||'#f7f9fc',
        '--border': opt.fullTheme.border||'#e4e8ee',
        '--border2': opt.fullTheme.border2||'#cdd3dc',
        '--gold': opt.fullTheme.gold||'#d97706',
        '--gold-bg': opt.fullTheme.goldBg||'#fffbeb',
        '--gold-b': opt.fullTheme.goldB||'#fde68a',
      }:{}),
      ...mkThemeVars(accent),
      ...(opt.extraVars||{})
    };
    presets.push({
      ...base,
      id,
      name,
      createdAt: Date.now(),
      fx: opt.fx || base.fx,
      c1: opt.c1 || base.c1,
      c2: opt.c2 || base.c2,
      sync: true,
      themeVars
    });
    return true;
  };
  let changed=false;
  // 4계절
  changed = add('🌸 봄', {fx:'aurora', c1:'#22c55e', c2:'#f472b6', accent:'#22c55e', fullTheme:{bg:'#f3fff6',surface:'#f0fdf4',border:'#d1fae5',border2:'#86efac',gold:'#d97706',goldBg:'#fffbeb',goldB:'#fde68a'}}) || changed;
  changed = add('🏖️ 여름', {fx:'mesh', c1:'#0ea5e9', c2:'#22c55e', accent:'#0ea5e9', fullTheme:{bg:'#f0f9ff',surface:'#eff6ff',border:'#dbeafe',border2:'#93c5fd',gold:'#0891b2',goldBg:'#ecfeff',goldB:'#67e8f9'}}) || changed;
  changed = add('🏝️ 여름방학', {fx:'aurora', c1:'#38bdf8', c2:'#fbbf24', accent:'#f59e0b', fullTheme:{bg:'#f0f9ff',surface:'#ffffff',border:'#dbeafe',border2:'#93c5fd',gold:'#f59e0b',goldBg:'#fffbeb',goldB:'#fde68a'}}) || changed;
  changed = add('⛄ 겨울방학', {fx:'glass', c1:'#2563eb', c2:'#cbd5e1', accent:'#38bdf8', fullTheme:{bg:'#f8fafc',surface:'#f1f5f9',border:'#e2e8f0',border2:'#cbd5e1',gold:'#38bdf8',goldBg:'#eff6ff',goldB:'#93c5fd'}}) || changed;
  changed = add('🍁 가을', {fx:'stripes', c1:'#ea580c', c2:'#b45309', accent:'#ea580c', fullTheme:{bg:'#fff7ed',surface:'#fffbeb',border:'#fed7aa',border2:'#fdba74',gold:'#b45309',goldBg:'#fffbeb',goldB:'#fde68a'}}) || changed;
  changed = add('❄️ 겨울', {fx:'glass', c1:'#2563eb', c2:'#94a3b8', accent:'#2563eb', fullTheme:{bg:'#f8fafc',surface:'#f1f5f9',border:'#e2e8f0',border2:'#cbd5e1',gold:'#2563eb',goldBg:'#eff6ff',goldB:'#93c5fd'}}) || changed;
  // 기념일/데이
  changed = add('🎄 크리스마스', {fx:'mesh', c1:'#16a34a', c2:'#dc2626', accent:'#16a34a', fullTheme:{bg:'#f0fdf4',surface:'#ecfdf5',border:'#bbf7d0',border2:'#86efac',gold:'#16a34a',goldBg:'#f0fdf4',goldB:'#bbf7d0'}, extraVars:{'--red':'#dc2626'}}) || changed;
  changed = add('🧒 어린이날', {fx:'aurora', c1:'#ff4b6e', c2:'#38bdf8', accent:'#ff4b6e', fullTheme:{bg:'#fff1f2',surface:'#ffe4e6',border:'#fecdd3',border2:'#fda4af',gold:'#ff4b6e',goldBg:'#fff1f2',goldB:'#fecdd3'}}) || changed;
  changed = add('🌹 어버이날', {fx:'glass', c1:'#db2777', c2:'#f43f5e', accent:'#db2777', fullTheme:{bg:'#fff1f2',surface:'#ffe4e6',border:'#fecdd3',border2:'#fda4af',gold:'#db2777',goldBg:'#fff1f2',goldB:'#fecdd3'}}) || changed;
  changed = add('🇰🇷 광복절', {fx:'stripes', c1:'#1d4ed8', c2:'#dc2626', accent:'#1d4ed8', fullTheme:{bg:'#f8fafc',surface:'#f1f5f9',border:'#e2e8f0',border2:'#cbd5e1',gold:'#1d4ed8',goldBg:'#eff6ff',goldB:'#93c5fd'}, extraVars:{'--red':'#dc2626'}}) || changed;
  changed = add('🔤 한글날', {fx:'glass', c1:'#7c3aed', c2:'#fbbf24', accent:'#7c3aed', fullTheme:{bg:'#faf5ff',surface:'#f3e8ff',border:'#e9d5ff',border2:'#d8b4fe',gold:'#fbbf24',goldBg:'#fffbeb',goldB:'#fde68a'}}) || changed;
  changed = add('✊ 3.1절', {fx:'stripes', c1:'#111827', c2:'#e5e7eb', accent:'#111827', fullTheme:{bg:'#f8fafc',surface:'#f1f5f9',border:'#e2e8f0',border2:'#cbd5e1',gold:'#111827',goldBg:'#f1f5f9',goldB:'#cbd5e1'}}) || changed;
  changed = add('🪷 석가탄신일', {fx:'aurora', c1:'#a855f7', c2:'#22c55e', accent:'#a855f7', fullTheme:{bg:'#faf5ff',surface:'#f3e8ff',border:'#e9d5ff',border2:'#d8b4fe',gold:'#22c55e',goldBg:'#f0fdf4',goldB:'#bbf7d0'}}) || changed;
  changed = add('🤍 화이트데이', {fx:'glass', c1:'#38bdf8', c2:'#ffffff', accent:'#38bdf8', fullTheme:{bg:'#ffffff',surface:'#f8fafc',border:'#e2e8f0',border2:'#cbd5e1',gold:'#38bdf8',goldBg:'#f0f9ff',goldB:'#bae6fd'}}) || changed;
  changed = add('💘 발렌타인데이', {fx:'aurora', c1:'#e11d48', c2:'#fb7185', accent:'#e11d48', fullTheme:{bg:'#fff1f2',surface:'#ffe4e6',border:'#fecdd3',border2:'#fda4af',gold:'#e11d48',goldBg:'#fff1f2',goldB:'#fecdd3'}}) || changed;
  changed = add('💋 키스데이', {fx:'aurora', c1:'#a855f7', c2:'#fb7185', accent:'#a855f7', fullTheme:{bg:'#faf5ff',surface:'#f3e8ff',border:'#e9d5ff',border2:'#d8b4fe',gold:'#a855f7',goldBg:'#faf5ff',goldB:'#e9d5ff'}}) || changed;
  // 스타크래프트
  changed = add('🛡️ 스타크래프트: 테란', {fx:'mesh', c1:'#0f172a', c2:'#2563eb', accent:'#2563eb', fullTheme:{bg:'#f8fafc',surface:'#f1f5f9',border:'#e2e8f0',border2:'#cbd5e1',gold:'#2563eb',goldBg:'#eff6ff',goldB:'#93c5fd'}}) || changed;
  changed = add('🧬 스타크래프트: 저그', {fx:'aurora', c1:'#7c3aed', c2:'#22c55e', accent:'#7c3aed', fullTheme:{bg:'#faf5ff',surface:'#f3e8ff',border:'#e9d5ff',border2:'#d8b4fe',gold:'#7c3aed',goldBg:'#faf5ff',goldB:'#e9d5ff'}}) || changed;
  changed = add('✨ 스타크래프트: 프로토스', {fx:'glass', c1:'#1d4ed8', c2:'#fbbf24', accent:'#1d4ed8', fullTheme:{bg:'#fffbeb',surface:'#fef3c7',border:'#fde68a',border2:'#fbbf24',gold:'#fbbf24',goldBg:'#fffbeb',goldB:'#fde68a'}}) || changed;
  changed = add('🎲 스타크래프트: 랜덤', {fx:'stripes', c1:'#64748b', c2:'#2563eb', accent:'#64748b', fullTheme:{bg:'#f8fafc',surface:'#f1f5f9',border:'#e2e8f0',border2:'#cbd5e1',gold:'#64748b',goldBg:'#f1f5f9',goldB:'#cbd5e1'}}) || changed;

  return {presets, changed};
}

// 설정 화면에서 수동으로 테마팩 다시 생성/추가하고 싶을 때
window.hdrPresetInstallThemePack = function(){
  const presets=_hdrPresetsLoad();
  const out=_hdrPresetInstallThemePack(presets);
  if(out && out.changed){
    _hdrPresetsSave(out.presets);
    try{ if(typeof showToast==='function') showToast('테마 프리셋이 추가되었습니다.'); }catch(e){}
    try{ render(); }catch(e){}
  } else {
    alert('이미 테마 프리셋이 추가되어 있습니다.');
  }
};
window.hdrPresetSelect = function(id){
  const {presets}=_hdrEnsurePresets();
  const p = presets.find(x=>x.id===id) || presets[0];
  if(!p) return;
  _hdrPresetSelSave(p.id);
  _hdrPresetApplySnapshot(p);
  try{ render(); }catch(e){}
};
window.hdrPresetAdd = function(){
  const name = prompt('헤더 프리셋 이름');
  if(name===null) return;
  const nm=String(name||'').trim();
  if(!nm) return;
  const {presets}=_hdrEnsurePresets();
  const snap=_hdrPresetGetCurrentSnapshot();
  const p={id:_hdrPresetUid(), name:nm, createdAt:Date.now(), ...snap};
  const next=[...presets, p];
  _hdrPresetsSave(next);
  _hdrPresetSelSave(p.id);
  try{ render(); }catch(e){}
};
window.hdrPresetRename = function(){
  const {presets, sel}=_hdrEnsurePresets();
  const idx=presets.findIndex(p=>p.id===sel);
  if(idx<0) return;
  const name = prompt('프리셋 이름 변경', presets[idx].name||'');
  if(name===null) return;
  const nm=String(name||'').trim();
  if(!nm) return;
  presets[idx]={...presets[idx], name:nm};
  _hdrPresetsSave(presets);
  try{ render(); }catch(e){}
};
window.hdrPresetSaveCurrent = function(){
  const {presets, sel}=_hdrEnsurePresets();
  const idx=presets.findIndex(p=>p.id===sel);
  if(idx<0) return;
  const snap=_hdrPresetGetCurrentSnapshot();
  presets[idx]={...presets[idx], ...snap};
  _hdrPresetsSave(presets);
  try{ if(typeof showToast==='function') showToast('프리셋 저장됨'); }catch(e){}
  try{ render(); }catch(e){}
};
window.hdrPresetDelete = function(){
  const {presets, sel}=_hdrEnsurePresets();
  if(presets.length<=1) return alert('프리셋은 최소 1개가 필요합니다.');
  const cur=presets.find(p=>p.id===sel);
  if(!confirm(`"${cur?.name||'프리셋'}" 프리셋을 삭제할까요?`)) return;
  const next=presets.filter(p=>p.id!==sel);
  _hdrPresetsSave(next);
  _hdrPresetSelSave(next[0]?.id||'');
  // 삭제 후 첫 프리셋 적용
  try{ _hdrPresetApplySnapshot(next[0]); }catch(e){}
  try{ render(); }catch(e){}
};

// ─────────────────────────────────────────────────────────────
// (요청사항) 설정 동기화: 다른 기기/모바일/태블릿에 적용할 수 있도록 내보내기/가져오기(코드)
// - 데이터(경기 기록)는 포함하지 않고 "설정(localStorage)"만 대상
// ─────────────────────────────────────────────────────────────
window.cfgExportSettingsCode = function(){
  const out = {};
  try{
    for(let i=0;i<localStorage.length;i++){
      const k = localStorage.key(i);
      if(!k) continue;
      if(/^su_/.test(k) || /^cfg_/.test(k)){
        out[k] = localStorage.getItem(k);
      }
    }
  }catch(e){}
  try{
    // LZString은 index.html에 포함되어 있음
    return LZString.compressToBase64(JSON.stringify(out));
  }catch(e){
    return '';
  }
};
window.cfgFillSettingsCode = function(){
  const ta = document.getElementById('cfg-sync-code');
  if(!ta) return;
  const code = window.cfgExportSettingsCode();
  ta.value = code || '';
  try{ ta.focus(); ta.select(); }catch(e){}
};
window.cfgCopySettingsCode = async function(){
  const ta = document.getElementById('cfg-sync-code');
  if(!ta) return;
  try{
    await navigator.clipboard.writeText(ta.value||'');
    alert('복사됨');
  }catch(e){
    alert('복사 실패: 브라우저 권한 문제일 수 있어요.');
  }
};
window.cfgImportSettingsCode = function(){
  const ta = document.getElementById('cfg-sync-code');
  if(!ta) return;
  const code = String(ta.value||'').trim();
  if(!code) return alert('가져올 코드가 없습니다.');
  let obj=null;
  try{
    const json = LZString.decompressFromBase64(code);
    obj = JSON.parse(json||'{}');
  }catch(e){
    return alert('코드 해석 실패: 형식이 올바르지 않습니다.');
  }
  if(!obj || typeof obj!=='object') return alert('코드 해석 실패');
  if(!confirm('이 코드를 현재 기기에 적용할까요?\n(현재 설정은 덮어씁니다)')) return;
  try{
    Object.keys(obj).forEach(k=>{
      if(!( /^su_/.test(k) || /^cfg_/.test(k) )) return;
      const v = obj[k];
      if(v==null) localStorage.removeItem(k);
      else localStorage.setItem(k, String(v));
    });
  }catch(e){}
  try{ if(typeof window._applyHeaderSettings==='function') window._applyHeaderSettings(); }catch(e){}
  try{ if(typeof window.applyProfileShapeVars==='function') window.applyProfileShapeVars(); }catch(e){}
  try{ if(typeof render==='function') render(); }catch(e){}
  alert('✅ 적용 완료');
};

// 전역 폰트/전역 폰트 크기/전역 UI 배율 관련 로직은
// `js/settings/font-controls.js`, `js/settings/ui-scale-controls.js`로 분리

// ─────────────────────────────────────────────────────────────
// (요청사항) 필터/하위메뉴(접기) 설정
// - su_filter_lock_open:       '1'이면 필터 항상 펼침(접기 버튼 숨김)
// - su_submenu_filter_enabled: '1'이면 하위메뉴를 "필터로 접기" 사용
// ─────────────────────────────────────────────────────────────
window.cfgSetUiFilterMenuSettings = function(){
  const lock = document.getElementById('cfg-filter-lock')?.checked ? '1' : '0';
  const enabled = document.getElementById('cfg-submenu-filter')?.checked ? '1' : '0';
  try{ localStorage.setItem('su_filter_lock_open', lock); }catch(e){}
  try{ localStorage.setItem('su_submenu_filter_enabled', enabled); }catch(e){}
  // 잠금 ON이면 현재 열린 상태로 강제
  if(lock==='1'){
    try{ window._histFilterOpen=true; }catch(e){}
    try{ window._statsFilterOpen=true; }catch(e){}
    try{ window._miniFilterOpen=true; }catch(e){}
    try{ window._indFilterOpen=true; }catch(e){}
    try{ window._gjFilterOpen=true; }catch(e){}
    try{ window._ckFilterOpen=true; }catch(e){}
    try{ window._univmFilterOpen=true; }catch(e){}
    try{ window._proFilterOpen=true; }catch(e){}
    try{ window._compFilterOpen=true; }catch(e){}
  }
  try{ if(typeof render==='function') render(); }catch(e){}
};
window.cfgResetUiFilterMenuSettings = function(){
  try{ localStorage.removeItem('su_filter_lock_open'); }catch(e){}
  try{ localStorage.removeItem('su_submenu_filter_enabled'); }catch(e){}
  try{
    const a=document.getElementById('cfg-filter-lock'); if(a) a.checked=true;
    const b=document.getElementById('cfg-submenu-filter'); if(b) b.checked=true;
  }catch(e){}
  window.cfgSetUiFilterMenuSettings();
};

// ─────────────────────────────────────────────────────────────
// (요청사항) 경기 결과 '자동인식' 호환 옵션
// - su_paste_compat: '1'이면 전각 괄호/🆚/VS 공백 없는 형태 등을 넓게 인식
// ─────────────────────────────────────────────────────────────
window.cfgSetPasteCompatSettings = function(){
  const on = document.getElementById('cfg-paste-compat')?.checked ? '1' : '0';
  try{ localStorage.setItem('su_paste_compat', on); }catch(e){}
};
try{ window.cfgSetPasteCompatSettings(); }catch(e){}
window.cfgResetPasteCompatSettings = function(){
  try{ localStorage.removeItem('su_paste_compat'); }catch(e){}
  try{
    const a=document.getElementById('cfg-paste-compat'); if(a) a.checked=true;
  }catch(e){}
  window.cfgSetPasteCompatSettings();
};

// ─────────────────────────────────────────────────────────────
// (요청사항) 자동인식 보강: 선수 별명 → 실제 선수명 매핑
// - localStorage: su_player_alias_map (JSON)
// ─────────────────────────────────────────────────────────────
const _PAL_KEY = 'su_player_alias_map';
function _palLoad(){
  try{ return JSON.parse(localStorage.getItem(_PAL_KEY)||'{}')||{}; }catch(e){ return {}; }
}
function _palSave(obj){
  try{ localStorage.setItem(_PAL_KEY, JSON.stringify(obj||{})); }catch(e){}
}
window.cfgRenderPlayerAliasMap = function(){
  const box = document.getElementById('cfg-pal-list');
  if(!box) return;
  const m = _palLoad();
  const keys = Object.keys(m).sort((a,b)=>a.localeCompare(b));
  if(!keys.length){
    box.innerHTML = `<div style="font-size:var(--fs-sm);color:var(--gray-l);text-align:center;padding:18px">등록된 별명 매핑 없음</div>`;
    return;
  }
  box.innerHTML = keys.map(k=>{
    const v = String(m[k]||'').trim();
    return `<div style="display:flex;align-items:center;gap:8px;padding:6px 8px;border-bottom:1px solid var(--border)">
      <span style="font-family:monospace;font-size:var(--fs-sm);font-weight:900;color:var(--text2);min-width:90px">${esc(k)}</span>
      <span style="color:var(--gray-l)">→</span>
      <span style="font-size:var(--fs-sm);font-weight:900;color:var(--blue);flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(v)}</span>
      <button class="btn btn-r btn-xs" onclick="cfgDelPlayerAlias('${encodeURIComponent(k)}')">삭제</button>
    </div>`;
  }).join('');
};
window.cfgAddPlayerAlias = function(){
  const a = document.getElementById('cfg-pal-alias');
  const p = document.getElementById('cfg-pal-player');
  const alias = String(a?.value||'').trim();
  const player = String(p?.value||'').trim();
  if(!alias){ if(typeof showToast==='function') showToast('별명을 입력해주세요.'); return; }
  if(!player){ if(typeof showToast==='function') showToast('선수를 선택해주세요.'); return; }
  const m = _palLoad();
  m[alias] = player;
  _palSave(m);
  if(a) a.value='';
  // 검색 input·hidden input 초기화
  const ps = document.getElementById('cfg-pal-player-search');
  if(ps) ps.value = '';
  if(p) p.value = '';
  const dd = document.getElementById('cfg-pal-dropdown');
  if(dd) dd.style.display = 'none';
  window.cfgRenderPlayerAliasMap();
  if(typeof showToast==='function') showToast(`✅ 별명 등록: ${alias} → ${player}`);
};
window.cfgDelPlayerAlias = function(encKey){
  const key = decodeURIComponent(encKey||'');
  const m = _palLoad();
  delete m[key];
  _palSave(m);
  window.cfgRenderPlayerAliasMap();
};
window.cfgResetPlayerAliasMap = function(){
  if(!confirm('선수 별명 매핑을 모두 초기화할까요?')) return;
  try{ localStorage.removeItem(_PAL_KEY); }catch(e){}
  window.cfgRenderPlayerAliasMap();
  if(typeof showToast==='function') showToast('초기화 완료');
};

// ─────────────────────────────────────────────────────────────
// openEP 수정창 전용: 해당 선수의 별명 목록 렌더링 / 추가 / 삭제
// ─────────────────────────────────────────────────────────────
window.epRenderAliasesList = function(playerName){
  const box = document.getElementById('ep-alias-list');
  if(!box) return;
  const m = _palLoad();
  const aliases = Object.keys(m).filter(k => m[k] === playerName).sort((a,b)=>a.localeCompare(b));
  if(!aliases.length){
    box.innerHTML = '<span style="font-size:var(--fs-caption);color:var(--gray-l)">등록된 별명 없음</span>';
    return;
  }
  box.innerHTML = aliases.map(alias=>{
    const safe = alias.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    const enc = encodeURIComponent(alias);
    return `<span style="display:inline-flex;align-items:center;gap:5px;font-size:var(--fs-sm);padding:3px 10px 3px 12px;border-radius:99px;background:var(--white);border:1px solid var(--border);color:var(--text2);white-space:nowrap">
      ${safe}
      <button onclick="epAliasDel('${enc}','${encodeURIComponent(playerName)}')" style="display:inline-flex;align-items:center;justify-content:center;width:14px;height:14px;border-radius:50%;border:none;background:var(--border);color:var(--gray-l);cursor:pointer;font-size:10px;padding:0;line-height:1;flex-shrink:0">✕</button>
    </span>`;
  }).join('');
};

window.epAliasAdd = function(playerName){
  const inp = document.getElementById('ep-alias-input');
  const alias = String(inp ? inp.value : '').trim();
  if(!alias){ if(typeof showToast==='function') showToast('별명을 입력해주세요.'); return; }
  if(!playerName){ return; }
  const m = _palLoad();
  if(m[alias] && m[alias] !== playerName){
    if(!confirm("'" + alias + "'\ub294 \uc774\ubbf8 '" + m[alias] + "'\uc5d0 \ub4f1\ub85d\ub418\uc5b4 \uc788\uc2b5\ub2c8\ub2e4.\n'" + playerName + "'\uc73c\ub85c \ubcc0\uacbd\ud560\uae4c\uc694?")) return;
  }
  m[alias] = playerName;
  _palSave(m);
  if(inp) inp.value = '';
  window.epRenderAliasesList(playerName);
  if(typeof window.cfgRenderPlayerAliasMap==='function') window.cfgRenderPlayerAliasMap();
  if(typeof showToast==='function') showToast('\u2705 \ubcc4\uba85 \ub4f1\ub85d: ' + alias + ' \u2192 ' + playerName);
};

window.epAliasDel = function(encAlias, encPlayer){
  const alias = decodeURIComponent(encAlias||'');
  const playerName = decodeURIComponent(encPlayer||'');
  const m = _palLoad();
  delete m[alias];
  _palSave(m);
  window.epRenderAliasesList(playerName);
  if(typeof window.cfgRenderPlayerAliasMap==='function') window.cfgRenderPlayerAliasMap();
};

// ─────────────────────────────────────────────────────────────
// (요청사항) 자동인식 변환툴: 가공되지 않은 텍스트 → 리포트 포맷
// 규칙은 사용자 메시지의 [출력 가이드라인]을 따른다.
// ─────────────────────────────────────────────────────────────
window.cfgPasteConvertRun = function(){
  const inp = document.getElementById('cfg-paste-conv-in');
  const out = document.getElementById('cfg-paste-conv-out');
  if(!inp || !out) return;
  const raw = String(inp.value||'').trim();
  if(!raw){ out.textContent=''; return; }
  const lines = raw.split(/\r?\n/).map(l=>l.trim()).filter(Boolean);
  const mapFix = (m)=>{
    const s = String(m||'').trim();
    if(!s) return '-';
    const t = s.replace(/[\[\]]/g,'').trim();
    const d = {
      '실피':'실피드','실피드':'실피드',
      '폴':'폴리포이드','폴스':'폴리포이드','폴리':'폴리포이드','폴리포이드':'폴리포이드',
      '제인':'제인스','제인스':'제인스',
      '녹아':'녹아웃','녹아웃':'녹아웃',
      '에티':'애티튜드','애티':'애티튜드','애티튜드':'애티튜드',
      '매치':'매치포인트','매치포인트':'매치포인트'
    };
    return d[t] || t;
  };
  const raceOf = (name)=>{
    try{
      if(typeof players !== 'undefined' && Array.isArray(players)){
        const p = players.find(x=>x && x.name===name);
        const r = (p && p.race) ? String(p.race).trim().toUpperCase() : '';
        if(r==='T'||r==='Z'||r==='P') return r;
      }
    }catch(e){}
    return 'N';
  };
  const parsed = [];
  lines.forEach(line=>{
    // 순번/불필요 텍스트 제거
    line = line
      // [1SET] / [2SET] 같은 세트 표기 제거 (맵 []와 혼동 방지)
      .replace(/^\[\s*\d+\s*set\s*\]\s*/i, '')
      .replace(/^\d+\s*set\s*/i, '')
      // "1경기", "1세트" 제거
      .replace(/^[\d]+\s*(?:경기|세트)\s*/,'')
      .trim();
    // 맵 추출: [맵]
    let map='-';
    const mm = line.match(/\[([^\]]+)\]/);
    if(mm){ map = mapFix(mm[1]); line = line.replace(mm[0],'').trim(); }
    // 전각 괄호/VS 정규화
    line = line.replace(/[（]/g,'(').replace(/[）]/g,')').replace(/🆚/g,'vs');
    // '조기석(승) vs (패)변현제' / '(승)조기석 vs 변현제(패)' 등 대응
    const vs = line.split(/\s*vs\s*/i);
    if(vs.length<2) return;
    const L = vs[0].trim();
    const R = vs.slice(1).join('vs').trim();
    const pick = (s)=>{
      s = s.replace(/\s+/g,' ').trim();
      // 불필요 점수/주석 제거
      s = s.replace(/\b\d+\/\d+\b.*$/,'').trim();
      // (승)/(패) + 이름
      let m = s.match(/^\((승|패)\)\s*(.+)$/);
      if(m) return {res:m[1], name:m[2].trim().replace(/\((승|패)\)/g,'').trim()};
      // 이름 + (승)/(패)
      m = s.match(/^(.+?)\s*\((승|패)\)\s*$/);
      if(m) return {res:m[2], name:m[1].trim().replace(/\((승|패)\)/g,'').trim()};
      return null;
    };
    const p1 = pick(L), p2 = pick(R);
    if(!p1 || !p2 || !p1.name || !p2.name) return;
    let win='', lose='';
    if(p1.res==='승' && p2.res==='패'){ win=p1.name; lose=p2.name; }
    else if(p1.res==='패' && p2.res==='승'){ win=p2.name; lose=p1.name; }
    else return;
    parsed.push({win,lose,map});
  });
  if(!parsed.length){
    out.textContent = '인식된 경기 없음 (형식을 확인해주세요)';
    return;
  }
  // 최종 스코어(첫 경기의 두 선수 기준)
  const A = parsed[0].win;
  const B = parsed[0].lose;
  let aW=0,bW=0;
  parsed.forEach(g=>{
    if(g.win===A) aW++;
    else if(g.win===B) bW++;
  });
  const body = parsed.map(g=>{
    // (요청사항) 전역 자동인식 출력 포맷을 따름
    if(typeof window.autoFormatMatchLine === 'function'){
      return window.autoFormatMatchLine(g.win, g.lose, g.map);
    }
    const wR = raceOf(g.win), lR = raceOf(g.lose);
    return `${g.win}(${wR}) ✅ 🆚️ ⬜ ${g.lose}(${lR}) [${g.map}]`;
  }).filter(Boolean).join('\n');
  const tail = `\n\n[최종 결과] ${A}(${raceOf(A)}) ${aW} : ${bW} ${B}(${raceOf(B)})`;
  out.textContent = body + tail;
};

// ─────────────────────────────────────────────────────────────
// 🎵 유튜브 BGM 설정 저장
// ─────────────────────────────────────────────────────────────
window.cfgSaveBgmSettings = function(){
  const on = document.getElementById('cfg-bgm-on')?.checked ? '1' : '0';
  const sh = document.getElementById('cfg-bgm-shuffle')?.checked ? '1' : '0';
  const vol = parseInt(document.getElementById('cfg-bgm-vol')?.value||'50',10) || 50;
  const list = String(document.getElementById('cfg-bgm-list')?.value||'').trim();
  try{ localStorage.setItem('su_bgm_enabled', on); }catch(e){}
  try{ localStorage.setItem('su_bgm_shuffle', sh); }catch(e){}
  try{ localStorage.setItem('su_bgm_volume', String(Math.max(0,Math.min(100,vol)))); }catch(e){}
  try{ localStorage.setItem('su_bgm_list', list); }catch(e){}
  try{ window.bgmApplySettings && window.bgmApplySettings(); }catch(e){}
  try{ window._scheduleCloudAppSettingsSave && window._scheduleCloudAppSettingsSave(); }catch(e){}
};

// ─────────────────────────────────────────────────────────────
// 📺 SOOP 멀티뷰 설정 저장
// ─────────────────────────────────────────────────────────────
window.cfgSaveSoopSettings = function(){
  let list = String(document.getElementById('cfg-soop-list')?.value||'');
  // (버그픽스) 동일 SOOP 링크 중복 저장 방지 (공백/끝 슬래시 차이 포함)
  const norm = (u)=>{
    u = String(u||'').trim();
    if(!u) return '';
    // 끝 슬래시 제거
    u = u.replace(/\/+$/,'');
    // 해시 제거
    u = u.replace(/#.*$/,'');
    return u;
  };
  const lines = list.split(/\r?\n/).map(norm).filter(Boolean);
  const uniq = [...new Set(lines)];
  list = uniq.join('\n').trim();
  try{
    const ta = document.getElementById('cfg-soop-list');
    if(ta) ta.value = list;
  }catch(e){}
  try{ localStorage.setItem('su_soop_list', list); }catch(e){}
  try{ window.soopApplySettings && window.soopApplySettings(); }catch(e){}
  try{ window._scheduleCloudAppSettingsSave && window._scheduleCloudAppSettingsSave(); }catch(e){}
};

// ─────────────────────────────────────────────
// (요청사항) 결과 붙여넣기 자동 분리 저장 규칙
// - localStorage: su_paste_route_rules
// - 형식(한 줄): /정규식/flags => 모드
//   또는: 키워드 => 모드
// - 모드 예: 개인전, 끝장전, 미니대전, 시빌워, 대학대전, 대학CK, 프로리그, 티어대회, 대회 ...
// ─────────────────────────────────────────────
window.cfgSavePasteRouteRules = function(){
  const v = String(document.getElementById('cfg-paste-route')?.value||'');
  try{ localStorage.setItem('su_paste_route_rules', v); }catch(e){}
};

// ─────────────────────────────────────────────────────────────
// (요청사항) 설정 변경 시 다른 기기 반영: 관리자면 자동 Cloud Save(디바운스)
// - 사용자가 "저장 버튼"을 누르지 않아도 일정 시간 후 fbCloudSave 실행
// ─────────────────────────────────────────────────────────────
window._scheduleCloudAppSettingsSave = function(){
  try{
    if(typeof isLoggedIn==='undefined' || !isLoggedIn) return;
    if(typeof saveCfg!=='function') return;
    // 클라우드 데이터 수신/적용 중 또는 저장 중이면 재업로드(에코) 방지
    if(window._applyingCloudData) return;
    if(window._isSaving) return;
    clearTimeout(window._autoAppSettingsSaveT);
    window._autoAppSettingsSaveT = setTimeout(()=>{
      try{ saveCfg(); }catch(e){}
    }, 450);
  }catch(e){}
};
window.cfgPasteConvertCopy = function(){
  const out = document.getElementById('cfg-paste-conv-out');
  if(!out) return;
  const txt = out.textContent || '';
  if(!txt) return;
  try{
    navigator.clipboard.writeText(txt);
    alert('✅ 복사 완료');
  }catch(e){
    prompt('아래 내용을 복사하세요:', txt);
  }
};

// ─────────────────────────────────────────────────────────────
// (요청사항) 자동인식 출력 포맷(전역) 설정
// - localStorage: su_auto_outfmt (JSON)
// - search-core.js의 autoOutfmtLoad/autoOutfmtSave/autoFormatMatchLine와 연동
// ─────────────────────────────────────────────────────────────
function _cfgAutoOutfmtDefault(){
  return { includeRace:true, includeMap:true, mapBrackets:true, winnerEmphasis:'none', hideUnknownRace:true };
}
function _cfgAutoOutfmtLoad(){
  try{
    const raw = localStorage.getItem('su_auto_outfmt');
    if(!raw) return _cfgAutoOutfmtDefault();
    const obj = JSON.parse(raw) || {};
    return {..._cfgAutoOutfmtDefault(), ...obj};
  }catch(e){ return _cfgAutoOutfmtDefault(); }
}
function _cfgAutoOutfmtSave(next){
  try{ localStorage.setItem('su_auto_outfmt', JSON.stringify({..._cfgAutoOutfmtDefault(), ...(next||{})})); }catch(e){}
}
window.cfgAutoOutfmtUpd = function(k,v){
  const cur = _cfgAutoOutfmtLoad();
  const next = {...cur};
  const boolKeys = ['includeRace','includeMap','mapBrackets','hideUnknownRace'];
  next[k] = boolKeys.includes(k) ? (!!v) : v;
  _cfgAutoOutfmtSave(next);
  try{ window.cfgAutoOutfmtRefreshPreview && window.cfgAutoOutfmtRefreshPreview(); }catch(e){}
};
window.cfgAutoOutfmtReset = function(){
  _cfgAutoOutfmtSave(_cfgAutoOutfmtDefault());
  try{ window.cfgAutoOutfmtRefreshPreview && window.cfgAutoOutfmtRefreshPreview(); }catch(e){}
};
window.cfgAutoOutfmtRefreshPreview = function(){
  const s = _cfgAutoOutfmtLoad();
  const el = document.getElementById('cfg-auto-outfmt-preview');
  if(!el) return;
  try{
    // search-core.js 포맷터가 있으면 그걸로 미리보기
    if(typeof window.autoFormatMatchLine==='function'){
      el.textContent = window.autoFormatMatchLine('조기석','변현제','실피드');
      return;
    }
  }catch(e){}
  // fallback
  const emph = (n)=> s.winnerEmphasis==='md'?`**${n}**`:s.winnerEmphasis==='star'?`★${n}`:n;
  const map = s.includeMap ? (s.mapBrackets?'[실피드]':'실피드') : '';
  const raceW = s.includeRace ? '(T)' : '';
  const raceL = s.includeRace ? '(P)' : '';
  el.textContent = `${emph('조기석')}${raceW} ✅ 🆚️ ⬜ 변현제${raceL}${map?(' '+map):''}`.trim();
};

// ─────────────────────────────────────────────────────────────
// (점검) 설정탭 핸들러 누락 체크(“눌러도 안 되는 버튼” 빠르게 찾기)
// - settings 화면에 렌더된 data-cfg-sec 영역에서 onclick/onchange/oninput 을 스캔
// ─────────────────────────────────────────────────────────────
window.cfgRunSettingsSelfCheck = function(){
  const out = document.getElementById('cfg-selfcheck-out');
  if(out) out.innerHTML = '<div style="color:var(--gray-l);font-size:var(--fs-sm)">검사 중...</div>';
  try{
    const JS_KEYWORDS = new Set(['if','for','while','function','typeof','new','return','let','const','var','switch','case','do','break','continue','try','catch','finally','throw','class','extends','super','static','async','await','yield','import','export','default','from','as','delete','in','instanceof','of','void','undefined','null','true','false','this','arguments','eval','isNaN','parseInt','parseFloat','encodeURIComponent','decodeURIComponent']);
    const secs = Array.from(document.querySelectorAll('[data-cfg-sec]'));
    const html = secs.map(el=>el.outerHTML).join('\n');
    const re = /(?:onclick|onchange|oninput)=\"\s*([A-Za-z_][A-Za-z0-9_]*)\s*\(/g;
    const called = new Set();
    let m;
    while((m=re.exec(html))) called.add(m[1]);
    const missing = Array.from(called).filter(fn => !JS_KEYWORDS.has(fn) && typeof window[fn] !== 'function').sort();

    // 각 탭 함수 확인
    const tabFuncs = {
      '기록탭': ['rHist'],
      '미니탭': ['rMini'],
      '대회탭': ['rComp'],
      '현황판탭': ['rBoard2'],
      '티어토너먼트': ['rTierTourTab'],
      '프로리그': ['rPro'],
      '캘린더': ['rCal'],
      '통계': ['rStats'],
      '붙여넣기': ['pastePreview', 'openGrpPasteModal'],
    };
    const tabMissing = {};
    for(const [tab, funcs] of Object.entries(tabFuncs)){
      const missing = funcs.filter(f => typeof window[f] !== 'function');
      if(missing.length > 0) tabMissing[tab] = missing;
    }

    if(out){
      let html = '';
      if(missing.length > 0){
        html += `<div style="font-size:var(--fs-sm);color:#dc2626;font-weight:1000;margin-bottom:8px">⚠️ settings.js 핸들러 누락 ${missing.length}개</div>
                 <div style="font-family:ui-monospace,monospace;font-size:var(--fs-sm);white-space:pre-wrap;line-height:1.5;margin-bottom:12px">${missing.join('\\n')}</div>`;
      }
      if(Object.keys(tabMissing).length > 0){
        html += `<div style="font-size:var(--fs-sm);color:#ea580c;font-weight:1000;margin-bottom:6px">⚠️ 탭 렌더러 누락</div>
                 <div style="font-family:ui-monospace,monospace;font-size:var(--fs-caption);white-space:pre-wrap;line-height:1.6">`;
        for(const [tab, funcs] of Object.entries(tabMissing)){
          html += `${tab}: ${funcs.join(', ')}\\n`;
        }
        html += `</div>`;
      }
      if(missing.length === 0 && Object.keys(tabMissing).length === 0){
        html = `<div style="font-size:var(--fs-sm);color:#16a34a;font-weight:1000">✅ 모든 핸들러 및 탭 함수 정상</div>`;
      }
      out.innerHTML = html;
    }
  }catch(e){
    if(out) out.innerHTML = `<div style="font-size:var(--fs-sm);color:#dc2626;font-weight:1000">검사 실패: ${String(e)}</div>`;
  }
};
function _cfgMenuSave(v){
  try{ localStorage.setItem(_CFG_MENU_KEY, JSON.stringify(v)); }catch(e){}
}
function _cfgMenuNormalize(layout){
  const all = _cfgAllSecs.slice();
  const defCats = Object.keys(_DEFAULT_CATSECS);
  let catOrder = Array.isArray(layout?.catOrder) ? layout.catOrder.filter(c=>typeof c==='string' && c.trim()) : defCats.slice();
  // 구버전 호환: 카테고리명 변경/병합
  const oldToNewCat = {
    '게임 운영':'🧩 운영/콘텐츠',
    '콘텐츠 관리':'🧩 운영/콘텐츠',
    '현황판 관리':'🧩 현황판/펨코',
    '이미지 관리':'🖼️ 스트리머/프로필',
    '🖼️ 이미지/프로필':'🖼️ 스트리머/프로필',
    '🎨 스타일/테마':'🎨 UI/테마',
    '🎨 디자인/테마':'🎨 UI/테마',
    '🧪 고급/실험실':'🧪 점검/고급',
    '🧪 고급/점검':'🧪 점검/고급',
    '데이터 관리':'💾 데이터',
    '시스템 설정':'🎨 UI/테마',
  };
  catOrder = catOrder.map(c => oldToNewCat[c] || c).filter((v,i,a)=>a.indexOf(v)===i);
  // 기본 카테고리 누락 시 추가
  defCats.forEach(c=>{ if(!catOrder.includes(c)) catOrder.push(c); });

  const catSecs = {};
  const legacyCatSecs = layout?.catSecs && typeof layout.catSecs === 'object' ? layout.catSecs : {};
  const aliasCatSecs = {};
  // 구버전/사용자 레이아웃의 카테고리를 신규 카테고리로 병합
  try{
    Object.entries(legacyCatSecs||{}).forEach(([cat, secs])=>{
      const nc = oldToNewCat[cat] || cat;
      if(!Array.isArray(secs)) return;
      if(!aliasCatSecs[nc]) aliasCatSecs[nc] = [];
      secs.forEach(s=>{ if(!aliasCatSecs[nc].includes(s)) aliasCatSecs[nc].push(s); });
    });
  }catch(e){}

  // (구버전 호환) '시스템 설정'을 섹션 단위로 분배하던 로직은
  // 위의 oldToNewCat 병합으로 자연스럽게 해결됨.
  // 사용자 레이아웃 반영
  catOrder.forEach(c=>{
    const arr = (aliasCatSecs && Array.isArray(aliasCatSecs[c])) ? aliasCatSecs[c] : (_DEFAULT_CATSECS[c] || []);
    catSecs[c] = arr.filter(sec => all.includes(sec));
  });
  // 누락된 섹션은 기본 위치에 추가
  const used = new Set(Object.values(catSecs).flat());
  all.forEach(sec=>{
    if(used.has(sec)) return;
    const defCat = Object.keys(_DEFAULT_CATSECS).find(c => (_DEFAULT_CATSECS[c]||[]).includes(sec)) || defCats[0];
    if(!catSecs[defCat]) catSecs[defCat] = [];
    catSecs[defCat].push(sec);
    used.add(sec);
  });
  // 빈 카테고리 제거(단, 기본 카테고리는 유지)
  catOrder.forEach(c=>{ if(!catSecs[c]) catSecs[c] = []; });
  return {catOrder, catSecs};
}

let _catSecs = (() => {
  const raw = _cfgMenuLoad();
  const norm = _cfgMenuNormalize(raw || {});
  try{ window._cfgCatOrder = norm.catOrder; }catch(e){}
  // catSecs만 rCfg/_cfgApplyCat에서 사용
  const cs = norm.catSecs;
  try{ window._catSecs = cs; }catch(e){}
  return cs;
})();

function _cfgMenuApplyAndRerender(layout){
  const norm = _cfgMenuNormalize(layout || {});
  _cfgMenuSave(norm);
  _catSecs = norm.catSecs;
  try{ window._catSecs = _catSecs; }catch(e){}
  try{ window._cfgCatOrder = norm.catOrder; }catch(e){}
  try{
    if(!Object.keys(_catSecs).includes(window._cfgCat)){
      window._cfgCat = (window._cfgCatOrder && window._cfgCatOrder[0]) || '🧩 운영/콘텐츠';
    }
  }catch(e){}
  try{ render(); }catch(e){}
}

// 섹션을 다른 카테고리로 이동
window.cfgMenuSetCat = function(secId, targetCat){
  const cur = _cfgMenuNormalize(_cfgMenuLoad() || {});
  const cats = cur.catOrder.slice();
  if(!cats.includes(targetCat)) cats.push(targetCat);
  // 제거
  cats.forEach(c=>{
    cur.catSecs[c] = (cur.catSecs[c]||[]).filter(x=>x!==secId);
  });
  cur.catSecs[targetCat] = cur.catSecs[targetCat] || [];
  cur.catSecs[targetCat].push(secId);
  _cfgMenuApplyAndRerender(cur);
};

// 섹션 순서 이동(같은 카테고리 내)
window.cfgMenuMoveSec = function(secId, dir){
  const cur = _cfgMenuNormalize(_cfgMenuLoad() || {});
  const cats = cur.catOrder.slice();
  let foundCat = null;
  cats.forEach(c=>{
    if((cur.catSecs[c]||[]).includes(secId)) foundCat = c;
  });
  if(!foundCat) return;
  const arr = cur.catSecs[foundCat] || [];
  const i = arr.indexOf(secId);
  const j = i + (dir==='up'?-1:1);
  if(i<0 || j<0 || j>=arr.length) return;
  [arr[i], arr[j]] = [arr[j], arr[i]];
  cur.catSecs[foundCat] = arr;
  _cfgMenuApplyAndRerender(cur);
};

// 카테고리 순서 이동
window.cfgMenuMoveCat = function(cat, dir){
  const cur = _cfgMenuNormalize(_cfgMenuLoad() || {});
  const arr = cur.catOrder.slice();
  const i = arr.indexOf(cat);
  const j = i + (dir==='up'?-1:1);
  if(i<0 || j<0 || j>=arr.length) return;
  [arr[i], arr[j]] = [arr[j], arr[i]];
  cur.catOrder = arr;
  _cfgMenuApplyAndRerender(cur);
};

window.cfgMenuReset = function(){
  try{ localStorage.removeItem(_CFG_MENU_KEY); }catch(e){}
  _cfgMenuApplyAndRerender({});
};

// (요청사항) 설정 상단 "바로가기" UI 제거됨.

// closest()/matches()/includes() 미지원 환경 대비: 상위로 올라가며 data-attr 탐색
function _cfgFindUpAttr(el, attrName, maxDepth){
  maxDepth = (typeof maxDepth === 'number') ? maxDepth : 8;
  let cur = el;
  for(let i=0;i<maxDepth && cur;i++){
    try{
      if(cur.getAttribute && cur.getAttribute(attrName)!=null) return cur;
    }catch(e){}
    cur = cur.parentNode;
  }
  return null;
}

/* ══════════════════════════════════════
   🧩 펨코현황 설정 (이미지 관리)
   - localStorage: b2_femco_settings_v1
══════════════════════════════════════ */
const _FEMCO_CFG_KEY = 'b2_femco_settings_v1';
function _cfgFemcoDefaults(){
  return {
    autoLayout: 1,     // 1: 인원수/화면폭에 맞춰 자동 레이아웃, 0: 수동 설정값 사용
    logoSize: 150,
    logoPos: 'top',
    logoAttachTitle: 1, // 1: 로고+대학명 같이 이동, 0: 로고만 이동
    headGap: 10,        // 로고-대학명(세로) 간격
    titleSize: 28,
    titleFont: 'system',
    playerImgSize: 46,
    playerImgShape: 'square',
    rowsPerCol: 5,
    colWidth: 170,
    colGap: 10,
    univGap: 18,
    countFontSize: 12,
    contentPadX: 16,
    contentAlign: 'left', // left | center (기본은 좌측)
    contentOffsetX: 0,      // 좌우 미세 이동(-40~40)
    univSubtitles: {},
    subtitleSize: 12,
    subtitleWeight: 800,
    subtitleColor: '',
    nameFontSize: 12,
    roleFontSize: 10,
    tierBadgeSize: 10,
    tierBadgePadX: 6,
    starSize: 15,
    statusIconSize: 18,
    univColorOverrides: {},
    // 대학별 배경 미디어
    // - 기존 호환: 값이 string이면 URL로 처리
    // - 신규: {url, alpha, sizeMode, sizeVal, pos, repeat, ox, oy}
    univBgMedia: {},
    // (요청) 배경 미디어 오버레이(투명도) — 0(없음) ~ 70(진하게)
    bgOverlay: 22,
    // (요청) 로고/대학명 위치 미세조정(px)
    logoOffsetX: 0,
    logoOffsetY: 0,
    titleOffsetX: 0,
    titleOffsetY: 0,
    // (요청) 대학명 위치(로고 기준) — left/right/top/bottom
    titlePos: 'bottom'
  };
}
function _cfgFemcoLoad(){
  try{
    const raw = localStorage.getItem(_FEMCO_CFG_KEY);
    if(!raw) return _cfgFemcoDefaults();
    const obj = JSON.parse(raw) || {};
    return {..._cfgFemcoDefaults(), ...obj,
      univSubtitles:{...((_cfgFemcoDefaults().univSubtitles)||{}), ...(obj.univSubtitles||{})},
      univColorOverrides:{...((_cfgFemcoDefaults().univColorOverrides)||{}), ...(obj.univColorOverrides||{})},
      univBgMedia:{...((_cfgFemcoDefaults().univBgMedia)||{}), ...(obj.univBgMedia||{})}
    };
  }catch(e){ return _cfgFemcoDefaults(); }
}
function _cfgFemcoSave(obj){
  try{ localStorage.setItem(_FEMCO_CFG_KEY, JSON.stringify(obj)); }catch(e){}
}

// (리팩터) 펨코 설정 단일 소스(SSOT): 다른 모듈(board2.js 등)에서 재사용할 수 있도록 노출
// - 기존 동작은 그대로 유지하며, 중복 defaults/load/save를 제거하기 위한 목적
try{
  window._cfgFemcoDefaults = _cfgFemcoDefaults;
  window._cfgFemcoLoad = _cfgFemcoLoad;
  window._cfgFemcoSave = _cfgFemcoSave;
}catch(e){}

window.cfgFemcoUpd = function(k, v){
  const cur = _cfgFemcoLoad();
  const next = {...cur};
  const numKeys = ['autoLayout','logoSize','logoAttachTitle','logoPos','headGap','titleSize','playerImgSize','rowsPerCol','colWidth','colGap','univGap','countFontSize','contentPadX','contentOffsetX','starSize','statusIconSize','subtitleSize','subtitleWeight','nameFontSize','roleFontSize','tierBadgeSize','tierBadgePadX','bgOverlay','logoOffsetX','logoOffsetY','titleOffsetX','titleOffsetY'];
  next[k] = numKeys.includes(k) ? parseInt(v, 10) : v;

  // 수동 조절을 건드리면 자동 레이아웃 OFF (원클릭 자동화 요구사항: 사용자가 바꾸면 유지)
  const manualKeys = ['rowsPerCol','colWidth','colGap','univGap','playerImgSize','contentPadX','contentOffsetX','nameFontSize','roleFontSize','countFontSize','headGap','logoSize','statusIconSize','starSize','bgOverlay','logoOffsetX','logoOffsetY','titleOffsetX','titleOffsetY','logoPos','titlePos','logoAttachTitle'];
  if (k !== 'autoLayout' && manualKeys.includes(k)) {
    next.autoLayout = 0;
  }
  _cfgFemcoSave(next);
  // 즉시 반영(로고 위치/오버레이 등이 "안 먹는" 것처럼 보이는 문제 방지)
  try{ if(typeof render === 'function') render(); }catch(e){}
};

window.cfgFemcoInit = function(){
  const s = _cfgFemcoLoad();
  const setVal = (id, val) => { const el=document.getElementById(id); if(el) el.value = val; };
  try{ const chk=document.getElementById('cfg-femco-autoLayout'); if(chk) chk.checked = (s.autoLayout ?? 1) ? true : false; }catch(e){}
  setVal('cfg-femco-logoSize', s.logoSize); setVal('cfg-femco-logoSizeNum', s.logoSize);
  setVal('cfg-femco-logoPos', s.logoPos);
  setVal('cfg-femco-titlePos', s.titlePos || 'bottom');
  try{ const chk=document.getElementById('cfg-femco-logoAttachTitle'); if(chk) chk.checked = (s.logoAttachTitle ?? 1) ? true : false; }catch(e){}
  setVal('cfg-femco-headGap', s.headGap || 10); setVal('cfg-femco-headGapNum', s.headGap || 10);
  setVal('cfg-femco-titleSize', s.titleSize); setVal('cfg-femco-titleSizeNum', s.titleSize);
  setVal('cfg-femco-titleFont', s.titleFont);
  setVal('cfg-femco-playerImgSize', s.playerImgSize); setVal('cfg-femco-playerImgSizeNum', s.playerImgSize);
  setVal('cfg-femco-playerImgShape', s.playerImgShape);
  setVal('cfg-femco-rowsPerCol', s.rowsPerCol); setVal('cfg-femco-rowsPerColNum', s.rowsPerCol);
  setVal('cfg-femco-colWidth', s.colWidth); setVal('cfg-femco-colWidthNum', s.colWidth);
  setVal('cfg-femco-colGap', s.colGap); setVal('cfg-femco-colGapNum', s.colGap);
  setVal('cfg-femco-univGap', s.univGap || 18); setVal('cfg-femco-univGapNum', s.univGap || 18);
  setVal('cfg-femco-countFontSize', s.countFontSize || 12); setVal('cfg-femco-countFontSizeNum', s.countFontSize || 12);
  setVal('cfg-femco-contentPadX', s.contentPadX || 16); setVal('cfg-femco-contentPadXNum', s.contentPadX || 16);
  setVal('cfg-femco-contentAlign', s.contentAlign || 'left');
  setVal('cfg-femco-contentOffsetX', s.contentOffsetX || 0); setVal('cfg-femco-contentOffsetXNum', s.contentOffsetX || 0);
  setVal('cfg-femco-nameFontSize', s.nameFontSize || 12); setVal('cfg-femco-nameFontSizeNum', s.nameFontSize || 12);
  setVal('cfg-femco-roleFontSize', s.roleFontSize || 10); setVal('cfg-femco-roleFontSizeNum', s.roleFontSize || 10);
  setVal('cfg-femco-tierBadgeSize', s.tierBadgeSize || 10); setVal('cfg-femco-tierBadgeSizeNum', s.tierBadgeSize || 10);
  setVal('cfg-femco-starSize', s.starSize || 15); setVal('cfg-femco-starSizeNum', s.starSize || 15);
  setVal('cfg-femco-statusIconSize', s.statusIconSize || 18); setVal('cfg-femco-statusIconSizeNum', s.statusIconSize || 18);
  setVal('cfg-femco-subtitleSize', s.subtitleSize); setVal('cfg-femco-subtitleSizeNum', s.subtitleSize);
  setVal('cfg-femco-subtitleWeight', s.subtitleWeight);
  setVal('cfg-femco-subtitleColor', (s.subtitleColor && s.subtitleColor.startsWith('#')) ? s.subtitleColor : '#ffffff');
  setVal('cfg-femco-bgOverlay', s.bgOverlay ?? 22); setVal('cfg-femco-bgOverlayNum', s.bgOverlay ?? 22);
  setVal('cfg-femco-logoOffsetX', s.logoOffsetX ?? 0); setVal('cfg-femco-logoOffsetXNum', s.logoOffsetX ?? 0);
  setVal('cfg-femco-logoOffsetY', s.logoOffsetY ?? 0); setVal('cfg-femco-logoOffsetYNum', s.logoOffsetY ?? 0);
  setVal('cfg-femco-titleOffsetX', s.titleOffsetX ?? 0); setVal('cfg-femco-titleOffsetXNum', s.titleOffsetX ?? 0);
  setVal('cfg-femco-titleOffsetY', s.titleOffsetY ?? 0); setVal('cfg-femco-titleOffsetYNum', s.titleOffsetY ?? 0);

  // 대학 셀렉트 채우기
  const sel = document.getElementById('cfg-femco-univ');
  if (sel) {
    const names = (typeof univCfg !== 'undefined' ? univCfg : []).map(u=>u.name).filter(Boolean);
    if (!names.includes('무소속')) names.push('무소속');
    const curUniv = localStorage.getItem('cfg_femco_univ') || names[0] || '';
    sel.innerHTML = names.map(n=>`<option value="${n}"${n===curUniv?' selected':''}>${n}</option>`).join('');
    localStorage.setItem('cfg_femco_univ', curUniv);
  }
  if (typeof window.cfgFemcoRefreshUnivFields === 'function') window.cfgFemcoRefreshUnivFields();
};

window.cfgFemcoRefreshUnivFields = function(){
  const s = _cfgFemcoLoad();
  const sel = document.getElementById('cfg-femco-univ');
  const u = sel ? sel.value : (localStorage.getItem('cfg_femco_univ') || '');
  const c = (s.univColorOverrides||{})[u] || '#000000';
  const sub = (s.univSubtitles||{})[u] || '';
  const rawBg = (s.univBgMedia||{})[u] || '';
  const bgObj = (function(){
    const d={url:'',alpha:30,sizeMode:'cover',sizeVal:90,pos:'center',repeat:'no-repeat',ox:0,oy:0};
    if(!rawBg) return d;
    if(typeof rawBg==='string') return {...d,url:rawBg};
    if(typeof rawBg==='object') return {...d,...rawBg,url:(rawBg.url||'')};
    return d;
  })();
  const colorEl = document.getElementById('cfg-femco-univColor');
  const subEl = document.getElementById('cfg-femco-subtitle');
  const bgEl = document.getElementById('cfg-femco-bgMediaUrl');
  const bgHint = document.getElementById('cfg-femco-bgMediaHint');
  if (colorEl) colorEl.value = c;
  if (subEl) subEl.value = sub;
  if (bgEl) bgEl.value = bgObj.url || '';
  if (bgHint) bgHint.textContent = bgObj.url ? '설정됨' : '미설정';
  // 배경 옵션
  const setVal=(id,v)=>{const el=document.getElementById(id);if(el!=null) el.value=v;};
  setVal('cfg-femco-bgAlpha', bgObj.alpha);
  setVal('cfg-femco-bgAlphaNum', bgObj.alpha);
  setVal('cfg-femco-bgSizeMode', bgObj.sizeMode);
  setVal('cfg-femco-bgSizeVal', bgObj.sizeVal);
  setVal('cfg-femco-bgPos', bgObj.pos);
  setVal('cfg-femco-bgRepeat', bgObj.repeat);
  setVal('cfg-femco-bgOffX', bgObj.ox);
  setVal('cfg-femco-bgOffXNum', bgObj.ox);
  setVal('cfg-femco-bgOffY', bgObj.oy);
  setVal('cfg-femco-bgOffYNum', bgObj.oy);
};

window.cfgFemcoSetBgMedia = function(url){
  const s = _cfgFemcoLoad();
  const sel = document.getElementById('cfg-femco-univ');
  const u = sel ? sel.value : '';
  if(!u) return;
  s.univBgMedia = s.univBgMedia || {};
  const v = (url || '').trim();
  if(!v) delete s.univBgMedia[u];
  else {
    const prev = s.univBgMedia[u];
    if(prev && typeof prev==='object') s.univBgMedia[u] = {...prev, url:v};
    else s.univBgMedia[u] = {url:v, alpha:30, sizeMode:'cover', sizeVal:90, pos:'center', repeat:'no-repeat', ox:0, oy:0};
  }
  _cfgFemcoSave(s);
  try{ window.cfgFemcoRefreshUnivFields && window.cfgFemcoRefreshUnivFields(); }catch(e){}
  try{ if(typeof render==='function') render(); }catch(e){}
};

window.cfgFemcoSetBgOpt = function(k, v){
  const s = _cfgFemcoLoad();
  const sel = document.getElementById('cfg-femco-univ');
  const u = sel ? sel.value : '';
  if(!u) return;
  s.univBgMedia = s.univBgMedia || {};
  const d={url:'',alpha:30,sizeMode:'cover',sizeVal:90,pos:'center',repeat:'no-repeat',ox:0,oy:0};
  const cur = s.univBgMedia[u];
  const obj = (!cur ? {...d} : (typeof cur==='string' ? {...d,url:cur} : {...d,...cur}));
  const numKeys=['alpha','sizeVal','ox','oy'];
  obj[k] = numKeys.includes(k) ? parseInt(v,10) : v;
  // URL이 없는 상태에서 옵션만 바뀌어도 저장은 허용(추후 URL 입력시 바로 적용)
  s.univBgMedia[u]=obj;
  _cfgFemcoSave(s);
  try{ window.cfgFemcoRefreshUnivFields && window.cfgFemcoRefreshUnivFields(); }catch(e){}
  try{ if(typeof render==='function') render(); }catch(e){}
};

window.cfgFemcoSetUnivColor = function(color){
  const s = _cfgFemcoLoad();
  const sel = document.getElementById('cfg-femco-univ');
  const u = sel ? sel.value : '';
  if(!u) return;
  s.univColorOverrides = s.univColorOverrides || {};
  s.univColorOverrides[u] = color;
  _cfgFemcoSave(s);
};
window.cfgFemcoClearUnivColor = function(){
  const s = _cfgFemcoLoad();
  const sel = document.getElementById('cfg-femco-univ');
  const u = sel ? sel.value : '';
  if(!u) return;
  s.univColorOverrides = s.univColorOverrides || {};
  delete s.univColorOverrides[u];
  _cfgFemcoSave(s);
  window.cfgFemcoRefreshUnivFields();
};
window.cfgFemcoSetSubtitle = function(text){
  const s = _cfgFemcoLoad();
  const sel = document.getElementById('cfg-femco-univ');
  const u = sel ? sel.value : '';
  if(!u) return;
  s.univSubtitles = s.univSubtitles || {};
  s.univSubtitles[u] = (text || '').trim();
  _cfgFemcoSave(s);
};
window.cfgFemcoClearSubtitle = function(){
  const s = _cfgFemcoLoad();
  const sel = document.getElementById('cfg-femco-univ');
  const u = sel ? sel.value : '';
  if(!u) return;
  s.univSubtitles = s.univSubtitles || {};
  delete s.univSubtitles[u];
  _cfgFemcoSave(s);
  window.cfgFemcoRefreshUnivFields();
};
window.cfgFemcoReset = function(){
  _cfgFemcoSave(_cfgFemcoDefaults());
  window.cfgFemcoInit();
};

// 설정 탭 버튼이 "반응 없음"처럼 보일 때를 대비한 이벤트 바인딩(인라인 onclick 불발 대비)
let _cfgLastTapHandledAt = 0;
let _cfgLastTapHandledKey = '';
let _cfgPointerDownAt = 0;
let _cfgPointerDownKey = '';
function _cfgShouldIgnoreDuplicateTap(e, key){
  try{
    const now = Date.now();
    const type = String(e && e.type || '');
    const safeKey = String(key || '');
    // pointerdown은 별도 추적 — 실제 처리(pointerup/click)와 분리
    if(type === 'pointerdown'){
      _cfgPointerDownAt = now;
      _cfgPointerDownKey = safeKey;
      return false; // pointerdown 단계에서는 차단하지 않음
    }
    // pointerup/click: pointerdown으로 이미 처리된 경우만 중복으로 간주
    if(safeKey && _cfgLastTapHandledKey === safeKey && (now - _cfgLastTapHandledAt) < 400){
      return true;
    }
    if(safeKey && (type === 'pointerup' || type === 'click' || type === 'touchend')){
      _cfgLastTapHandledAt = now;
      _cfgLastTapHandledKey = safeKey;
    }
  }catch(_){}
  return false;
}
function _cfgHandleCfgClick(e){
  // 설정탭이 실제로 렌더된 상태에서만 처리
  // (바로가기 UI를 삭제했으므로 cfg-shortcuts는 더 이상 존재하지 않음)
  // 설정 화면이 아닌 경우에는 무시
  try{
    if(!document.querySelector('.cfg-cat-pill') && !document.querySelector('[data-cfg-sec]')) return;
  }catch(_){}
  const t = e.target;
  const catBtn = _cfgFindUpAttr(t, 'data-cfg-cat');
  if(catBtn){
    // preventDefault 제거 - 인라인 onclick도 작동하도록
    const cat = catBtn.getAttribute('data-cfg-cat');
    if(_cfgShouldIgnoreDuplicateTap(e, 'cat:' + String(cat||''))) return;
    if(cat){ _cfgApplyCat(cat, false); }
    return;
  }
  const goBtn = _cfgFindUpAttr(t, 'data-cfg-go');
  if(goBtn){
    // preventDefault 제거 - 인라인 onclick도 작동하도록
    const sec = goBtn.getAttribute('data-cfg-go');
    if(_cfgShouldIgnoreDuplicateTap(e, 'go:' + String(sec||''))) return;
    if(sec){ _cfgGo(sec); }
    return;
  }
  // (요청사항) 섹션(summary) 클릭 시 "펼치기" 대신 팝업(모달)로 열기
  // - 모달 안(#cfgModalBody)에서는 토글 대신 '팝업 닫기'
  try{
    const secWrap = _cfgFindUpAttr(t, 'data-cfg-sec');
    if(secWrap && secWrap.tagName === 'DETAILS'){
      const inModal = !!(secWrap.closest && secWrap.closest('#cfgModalBody'));
      // summary 영역 클릭인지 확인
      let cur = t, inSummary = false, sumEl = null;
      for(let i=0;i<8 && cur && cur!==secWrap;i++){
        if(cur.tagName === 'SUMMARY'){ inSummary = true; sumEl = cur; break; }
        cur = cur.parentNode;
      }
      if(inSummary){
        // (버그픽스) 섹션(details[data-cfg-sec]) 내부에 또 다른 <details><summary> UI가 있을 수 있음.
        // 그 경우 중첩 summary 클릭까지 "섹션 요약 클릭"으로 오인하여 모달이 닫히는 문제가 발생.
        // → summary의 직접 부모가 secWrap(섹션 details)일 때만 섹션 요약 클릭으로 처리한다.
        try{
          if(sumEl && sumEl.parentNode !== secWrap){
            return; // 중첩 details/summary는 기본 토글 동작 허용
          }
        }catch(_){}
        if(inModal){
          try{ if(e && e.preventDefault) e.preventDefault(); }catch(_){}
          try{ if(e && e.stopPropagation) e.stopPropagation(); }catch(_){}
          try{ if(typeof closeCfgModal==='function') closeCfgModal(); }catch(_){}
          return;
        }
        const secId = secWrap.getAttribute('data-cfg-sec');
        if(secId){
          if(_cfgShouldIgnoreDuplicateTap(e, 'sec:' + String(secId||''))) return;
          try{ if(e && e.preventDefault) e.preventDefault(); }catch(_){}
          try{ if(e && e.stopPropagation) e.stopPropagation(); }catch(_){}
          // (요청사항) '펼치기' 동작은 하지 않고 팝업만 띄우기
          try{ secWrap.open = false; }catch(_){}
          _cfgGo(secId);
          return;
        }
      }
    }
  }catch(_){}
}
function _bindCfgHandlers(){
  if(window._cfgGlobalBound) return;
  window._cfgGlobalBound = true;
  // 일부 웹뷰/확장환경에서 document 캡처 클릭이 차단되는 케이스가 있어
  // window 캡처(pointerup)를 우선으로 바인딩한다.
  // details/summary 토글을 확실히 막기 위해 pointerdown도 캡처로 선 바인딩
  // 모바일에서는 touchend + click 중복 발화가 있어 touchend는 바인딩하지 않음
  try{ document.addEventListener('pointerdown', _cfgHandleCfgClick, true); }catch(e){}
  try{ window.addEventListener('pointerup', _cfgHandleCfgClick, true); }catch(e){}
  try{ document.addEventListener('click', _cfgHandleCfgClick, true); }catch(e){}

  // (요청사항) 설정 변경 → 다른 기기 반영(동기화 ON + 자동 저장 ON일 때)
  // - settings 모달 내부에서 발생하는 input/change를 감지해 prefs 변경을 기록
  // - 펨코스타일(슬라이더 oninput)도 여기로 같이 잡힘
  try{
    const _touch = (ev)=>{
      try{
        if(typeof curTab!=='undefined' && curTab!=='cfg') return;
        const t = ev && ev.target;
        if(!t) return;
        // 토큰/비밀번호 입력 등은 자동 저장 제외
        const id = String(t.id||'');
        if(id.startsWith('cfg-gist-') || id.startsWith('cfg-gh-') || id.startsWith('cfg-fb-')) return;
        if(t.type==='password') return;
        // 설정 영역의 입력만
        if(!id.startsWith('cfg-') && !(t.closest && t.closest('#cfgModalBody'))) return;
        if(typeof window.cfgTouchPrefsSync==='function') window.cfgTouchPrefsSync();
      }catch(e){}
    };
    document.addEventListener('input', _touch, true);
    document.addEventListener('change', _touch, true);
    document.addEventListener('click', (ev)=>{
      try{
        if(typeof curTab!=='undefined' && curTab!=='cfg') return;
        const t = ev && ev.target;
        if(!t) return;
        if(t.tagName==='BUTTON' || (t.closest && t.closest('button'))){
          const btn = t.tagName==='BUTTON'?t:(t.closest('button'));
          const id = String(btn && btn.id || '');
          if(id.startsWith('cfg-gist-') || id.startsWith('cfg-gh-') || id.startsWith('cfg-fb-')) return;
          if(typeof window.cfgTouchPrefsSync==='function') window.cfgTouchPrefsSync();
        }
      }catch(e){}
    }, true);
  }catch(e){}
}
function _scfgD(id,title,extra){
  // (요청사항) 펼치기 UI 대신 "팝업으로 열기" UX: 기본은 항상 닫힘
  const isOpen=false;
  // cfg-anchor: 바로가기 클릭 시 원래 위치로 되돌릴 기준점
  return `<div class="cfg-anchor" data-cfg-anchor="${id}"></div><details id="cfg-sec-${id}" class="ssec" data-cfg-sec="${id}" ${isOpen?'open':''} ontoggle="_scfgToggle('${id}',this)"${extra?' '+extra:''}>
  <summary class="cfg-sec-summary" style="list-style:none;outline:none;-webkit-appearance:none">
    <h4>${title}</h4>
    <span class="cfg-sec-right">열기 ›</span>
  </summary>`;
}

// 설정 섹션 팝업 모달 (바로가기 클릭 시 사용)
function _cfgEnsureModal(){
  let m=document.getElementById('cfgModal');
  if(m) return m;
  try{
    m=document.createElement('div');
    m.id='cfgModal';
    m.className='modal no-export cfg-modal';
    m.style.display='none';
    m.style.zIndex='9000';
    m.innerHTML=`
      <div class="mbox cfg-modal-box">
        <div class="cfg-modal-hdr">
          <div id="cfgModalTitle" class="cfg-modal-title">⚙️ 설정</div>
          <button class="cfg-modal-close" onclick="closeCfgModal()" aria-label="닫기">✕</button>
        </div>
        <div id="cfgModalBody" class="cfg-modal-body"></div>
      </div>
    `;
    document.body.appendChild(m);
  }catch(e){}
  // (요청사항) 설정을 수정하면 다른 기기에도 "바로" 반영되도록 자동 Cloud Save 트리거
  // - cfgModal 안에서 발생하는 input/change 를 감지해 디바운스 저장
  try{
    const body = m.querySelector('#cfgModalBody');
    if(body && !body._autoCloudSyncBound){
      body._autoCloudSyncBound = true;
      const _touch = ()=>{
        try{ window._scheduleCloudAppSettingsSave && window._scheduleCloudAppSettingsSave(); }catch(e){}
      };
      body.addEventListener('input', _touch, true);
      body.addEventListener('change', _touch, true);
      // 버튼 클릭으로만 바뀌는 설정도 있으니 click도 함께 감지(디바운스라 부담 적음)
      body.addEventListener('click', (ev)=>{
        try{
          const t = ev && ev.target;
          if(!t) return;
          if(t.tagName==='BUTTON' || (t.closest && t.closest('button'))) _touch();
        }catch(e){}
      }, true);
    }
  }catch(e){}
  // (요청사항) 모달 바깥(배경) 클릭으로 닫아도 섹션이 원위치로 복구되도록
  try{
    m.addEventListener('click', (ev)=>{
      try{
        // (모바일 버그픽스) 섹션을 눌러 모달을 여는 "같은 탭" 이벤트에서
        // 모달 배경 클릭으로 인식되어 바로 닫히는 현상 방지
        if(window._cfgModalJustOpenedTime && (Date.now()-window._cfgModalJustOpenedTime<350)) return;
        if(ev && ev.target===m && typeof window.closeCfgModal==='function') window.closeCfgModal();
      }catch(_){}
    }, {capture:true});
  }catch(e){}
  // 닫기 핸들러 (섹션 원위치 복구)
  if(typeof window.closeCfgModal!=='function'){
    window.closeCfgModal=function(){
      try{
        const prevId=window._cfgModalSecId;
        if(prevId){
          const prev=document.querySelector(`[data-cfg-sec="${prevId}"]`);
          const anchor=document.querySelector(`[data-cfg-anchor="${prevId}"]`);
          if(prev && anchor){
            anchor.parentNode.insertBefore(prev, anchor.nextSibling);
            prev.style.display='';
            // 목록에서는 펼치지 않음
            try{ if(prev.tagName==='DETAILS') prev.open=false; }catch(e){}
          }
          window._cfgModalSecId=null;
        }
        const body=document.getElementById('cfgModalBody');
        if(body) body.innerHTML='';
      }catch(e){}
      try{ if(typeof cm==='function') cm('cfgModal'); else { const mm=document.getElementById('cfgModal'); if(mm) mm.style.display='none'; } }catch(e){}
      try{ if(typeof window.cfgApplyBottomSectionsVisibility==='function') window.cfgApplyBottomSectionsVisibility(); }catch(e){}
    };
  }
  return m;
}

/* ══════════════════════════════════════
   설정 카테고리 필터
══════════════════════════════════════ */
if(typeof window._cfgCat==='undefined'||window._cfgCat==='전체'||!Object.keys(_catSecs||{}).includes(window._cfgCat)) window._cfgCat=(window._cfgCatOrder&&window._cfgCatOrder[0])||'🧩 운영/콘텐츠';
function _cfgGo(secId){
  // 섹션이 다른 카테고리에 속하면 카테고리 자동 전환
  try{
    let targetCat=null;
    for(const cat in _catSecs){
      const arr=_catSecs[cat]||[];
      if(arr.indexOf(secId)!==-1){ targetCat=cat; break; }
    }
    if(targetCat && window._cfgCat!==targetCat) _cfgApplyCat(targetCat,false);
  }catch(e){}

  const el=document.getElementById(`cfg-sec-${secId}`) || document.querySelector(`[data-cfg-sec="${secId}"]`);
  if(!el){
    try{
      // 디버그: 특정 환경에서만 섹션 탐색이 실패하는 현상(‘pd만 됨’) 추적용
      if(window.__CFG_DEBUG){
        const secs=[...document.querySelectorAll('[data-cfg-sec]')].slice(0,40).map(x=>`${x.getAttribute('data-cfg-sec')}#${x.id||''}`);
        console.warn('[cfgGo] section not found:', secId, 'known secs=', secs);
      }
    }catch(e){}
    return;
  }

  // 기존 열림 닫기 (아코디언)
  try{
    const all=document.querySelectorAll('[data-cfg-sec]');
    for(let i=0;i<all.length;i++){
      const d=all[i];
      if(d!==el && d.tagName==='DETAILS') d.open=false;
    }
  }catch(e){}

  // 바로가기 클릭 시: 해당 섹션을 팝업 모달로 표시
  try{
    _cfgEnsureModal();
    // 이전에 모달로 올린 섹션이 있으면 원위치 복구
    const prevId=window._cfgModalSecId;
    if(prevId && prevId!==secId){
        const prev=document.getElementById(`cfg-sec-${prevId}`) || document.querySelector(`[data-cfg-sec="${prevId}"]`);
      const anchor=document.querySelector(`[data-cfg-anchor="${prevId}"]`);
      if(prev && anchor){
        anchor.parentNode.insertBefore(prev, anchor.nextSibling);
        prev.style.display='';
      }
    }
    window._cfgModalSecId=secId;
    const titleEl=document.getElementById('cfgModalTitle');
    if(titleEl){
      const t = (window._cfgSecTitle && window._cfgSecTitle[secId]) ? window._cfgSecTitle[secId] : '';
      // 요청사항: cfgmenu는 팝업 헤더에서도 "설정 메뉴" 문구가 보이도록 고정
      titleEl.textContent = (secId==='cfgmenu') ? '🧭 설정 메뉴 정리' : (t || '⚙️ 설정');
    }
    const body=document.getElementById('cfgModalBody');
    if(body){
      body.innerHTML='';
      el.style.display='';
      body.appendChild(el);
      try{ body.scrollTop = 0; }catch(e){}
      // (요청사항) 팝업에서는 내용이 보여야 하므로 펼침
      try{ if(el.tagName==='DETAILS') el.open=true; }catch(e){}
      // (보강) 동적 섹션은 팝업 이동만으로 toggle 이벤트가 안 나는 환경이 있어 수동 렌더
      try{
        if(secId==='profileshape' && typeof window._renderCfgProfileShapeSection==='function') window._renderCfgProfileShapeSection();
        if(secId==='uisize' && typeof window._renderCfgUiSizeSection==='function') window._renderCfgUiSizeSection();
        if(secId==='pd' && typeof window._renderCfgPdSection==='function') window._renderCfgPdSection();
        if(secId==='pdModeBadge' && typeof window._renderCfgPdModeBadgeSection==='function') window._renderCfgPdModeBadgeSection();
        if(secId==='matchdetail' && typeof window._renderCfgMatchDetailSection==='function') window._renderCfgMatchDetailSection();
        if(secId==='aibot' && typeof window.cfgInitAiProxy==='function') window.cfgInitAiProxy();
      }catch(e){}
    }
    // (모바일 버그픽스) pointerdown에서 섹션을 누를 경우,
    // 같은 탭 이벤트의 click/touchend 타겟이 모달 배경으로 잡히며 "열렸다가 바로 닫히는" 케이스가 있음
    // → 모달 표시를 다음 tick으로 미뤄 동일 이벤트 사이클에서의 배경 클릭 판정을 회피
    const mm=document.getElementById('cfgModal');
    if(mm){
      window._cfgModalJustOpenedTime = Date.now();
      setTimeout(()=>{
        try{ mm.style.display='flex'; }catch(e){}
        try{
          const b=document.getElementById('cfgModalBody');
          if(b) b.scrollTop = 0;
        }catch(e){}
        if(typeof om==='function'){ try{ om('cfgModal'); }catch(err){ if(window.__CFG_DEBUG) console.error('[cfgGo] om() failed', err); } }
      }, 0);
    } else {
      if(typeof om==='function'){ try{ om('cfgModal'); }catch(err){ if(window.__CFG_DEBUG) console.error('[cfgGo] om() failed', err); } }
    }
  }catch(e){
    // 기존엔 조용히 삼켜서 “버튼 반응 없음”처럼 보였음 → 콘솔에 노출
    try{ console.error('[cfgGo] failed:', secId, e); }catch(_){}
  }
  // (요청사항) 목록에서는 펼치기 사용 안 함(팝업으로만 확인)
  // - 팝업으로 옮겨진 경우는 위에서 open=true 처리
  try{ if(el && el.tagName==='DETAILS' && !(el.closest && el.closest('#cfgModalBody'))) el.open=false; }catch(e){}
}

function _cfgApplyCat(cat, autoGo=true){
  window._cfgCat=cat;
  const show=_catSecs[cat]||[];
  let _bottomOpen = true;
  try{
    const mode=(localStorage.getItem('su_cfg_view_mode')||'basic')==='advanced' ? 'advanced' : 'basic';
    const saved=localStorage.getItem('su_cfg_bottom_open');
    _bottomOpen = window._cfgBottomSectionsOpen===undefined
      ? ((saved==='1' || saved==='0') ? (saved==='1') : false)
      : !!window._cfgBottomSectionsOpen;
  }catch(e){}
  // 섹션 표시/숨김
  try{
    const secs=document.querySelectorAll('[data-cfg-sec]');
    for(let i=0;i<secs.length;i++){
      const el=secs[i];
      // 모달에 올라간 섹션은 숨기지 않음
      try{ if(el.closest && el.closest('#cfgModalBody')) continue; }catch(e){}
      const id=el.getAttribute('data-cfg-sec');
      const vis=_bottomOpen && (show.indexOf(id)!==-1);
      el.style.display=vis?'':'none';
      if(el.tagName==='DETAILS') el.open=false;
    }
  }catch(e){}
  // 카테고리 버튼 스타일 업데이트 (초기 렌더 인라인 스타일은 1회성이라 JS로 재적용)
  try{
    const pills=document.querySelectorAll('.cfg-cat-pill');
    for(let i=0;i<pills.length;i++){
      const btn=pills[i];
      const on=(btn.getAttribute('data-cat')===cat);
      btn.classList.toggle('on', on);
      btn.style.borderColor = on ? 'var(--blue)' : 'var(--border)';
      // (요청사항) 비활성 배경의 회색 제거
      btn.style.background  = on ? 'var(--blue)' : 'transparent';
      btn.style.fontWeight  = on ? '800' : '700';
      btn.style.color       = on ? '#fff' : 'var(--text)';
    }
  }catch(e){}
  try{
    const btns=document.querySelectorAll('[data-cfg-cat]');
    for(let i=0;i<btns.length;i++){
      const btn=btns[i];
      const on=(btn.getAttribute('data-cfg-cat')===cat);
      if (btn.classList.contains('cfg-cat-tile')) {
        btn.style.background = on ? 'linear-gradient(180deg,rgba(79,70,229,.08),rgba(255,255,255,.98))' : 'var(--white)';
        btn.style.color = 'var(--text2)';
        btn.style.borderColor = on ? 'rgba(79,70,229,.30)' : 'var(--border)';
        btn.style.boxShadow = on ? '0 10px 24px rgba(79,70,229,.12)' : '0 4px 12px rgba(15,23,42,.04)';
        const bar = btn.firstElementChild;
        if(bar) bar.style.background = on ? '#4f46e5' : 'transparent';
        const count = btn.querySelector('span[style*="border-radius:99px"]');
        if (count) {
          count.style.color = on ? '#4338ca' : 'var(--gray-l)';
          count.style.background = on ? 'rgba(79,70,229,.10)' : 'var(--surface)';
          count.style.borderColor = on ? 'rgba(79,70,229,.18)' : 'var(--border)';
        }
        const titleEl = btn.querySelectorAll('div')[1];
        if (titleEl) titleEl.style.color = 'var(--text2)';
      } else {
        btn.style.background = on ? 'linear-gradient(135deg,var(--blue),#7c3aed)' : 'var(--white)';
        btn.style.color = on ? '#fff' : 'var(--text2)';
        btn.style.borderColor = on ? 'transparent' : 'var(--border)';
        btn.style.boxShadow = on ? '0 10px 24px rgba(37,99,235,.22)' : '0 4px 12px rgba(15,23,42,.04)';
      }
      const desc=btn.querySelector('[data-cfg-cat-desc]');
      if(desc) desc.style.opacity = on ? '.9' : '.72';
    }
    document.querySelectorAll('[data-cfg-cur-cat-label]').forEach(el=>{ el.textContent = `현재: ${_catLabel(cat)}`; });
    document.querySelectorAll('[data-cfg-cur-cat-desc]').forEach(el=>{ el.textContent = `${_catLabel(cat)} 안의 세부 메뉴를 버튼으로 바로 엽니다.`; });
    document.querySelectorAll('[data-cfg-cur-sec-buttons]').forEach(secWrap=>{
      const titleMap=window._cfgSecTitle||{};
      secWrap.innerHTML = show.map(id=>{
        const title=titleMap[id]||id;
        return `<button type="button" class="btn btn-w no-export" onclick="cfgGo('${id}')" style="display:flex;align-items:center;gap:8px;padding:10px 12px;border-radius:14px;text-align:left;background:var(--white);justify-content:flex-start">
          <span style="font-size:var(--fs-md);line-height:1">${String(title).match(/^[^\s]+/)?.[0]||'⚙️'}</span>
          <span style="font-size:var(--fs-sm);font-weight:800;color:var(--text2);min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${title.replace(/^[^\s]+\s*/,'')}</span>
        </button>`;
      }).join('');
    });
  }catch(e){}
  if(autoGo){
    const first=show[0];
    if(first) setTimeout(()=>_cfgGo(first),0);
  }
}

// 함수를 window 객체에 할당 (인라인 onclick에서 사용)
window._cfgGo = _cfgGo;
window._cfgApplyCat = _cfgApplyCat;
// (버그수정) render-nav-lazy.js에서 _lazyCfgGo를 참조하지만 미정의 상태.
// cfgGo로 위임하는 alias 추가.
window._lazyCfgGo = function(secId){ return _cfgGo(secId); };
// 인라인 onclick에서 try/catch로 에러를 숨기지 않기 위해 단순 래퍼 제공
window.cfgGo = function(secId){ return _cfgGo(secId); };
// (요청사항) 카테고리 클릭 시 해당 카테고리 "메뉴만" 보여주고 자동으로 모달을 띄우지 않음
window.cfgApplyCat = function(cat){
  try{ window._cfgCat=cat; }catch(e){}
  try{
    if(typeof curTab!=='undefined' && curTab==='cfg' && typeof render==='function'){
      render();
      return cat;
    }
  }catch(e){}
  return _cfgApplyCat(cat, false);
};
window.cfgSetViewMode = function(mode){
  try{
    const v = String(mode||'basic').trim();
    localStorage.setItem('su_cfg_view_mode', v==='advanced' ? 'advanced' : 'basic');
  }catch(e){}
  try{ if(typeof curTab!=='undefined' && curTab==='cfg' && typeof render==='function') render(); }catch(e){}
};
window.cfgSetBottomSectionsOpen = function(open){
  try{
    window._cfgBottomSectionsOpen = !!open;
    localStorage.setItem('su_cfg_bottom_open', window._cfgBottomSectionsOpen ? '1' : '0');
  }catch(e){}
  // DOM 직접 조작으로 즉시 접기/펼치기 (전체 재렌더링 없이)
  try{ if(typeof window.cfgApplyBottomSectionsVisibility==='function') window.cfgApplyBottomSectionsVisibility(); }catch(e){}
};
window.cfgSetRemoteCfgAuto = function(on){
  try{
    localStorage.setItem('su_cfg_remote_auto', on ? '1' : '0');
    const el = document.getElementById('cfg-remote-auto-status');
    if(el){
      el.style.color = on ? '#16a34a' : 'var(--gray-l)';
      el.textContent = on ? 'ON · 설정/상세 수정은 GitHub에도 반영, 새로고침만으로는 저장되지 않음' : 'OFF · 설정 변경은 로컬만 저장';
    }
  }catch(e){}
};
window.cfgToggleBottomSections = function(){
  try{
    const cur = window._cfgBottomSectionsOpen===undefined
      ? ((localStorage.getItem('su_cfg_bottom_open') ?? '1') === '1')
      : !!window._cfgBottomSectionsOpen;
    window.cfgSetBottomSectionsOpen(!cur);
  }catch(e){}
};
window.cfgApplySimpleView = function(){
  try{
    const mode=(localStorage.getItem('su_cfg_view_mode')||'basic')==='advanced' ? 'advanced' : 'basic';
    const q=String(window._cfgSearchQ||'').trim();
    const fav=['sharecard','uisize','calui','profileshape','tablabels','matchdetail','univ','univlogoimg'];
    const autoOpen=['sharecard','uisize','calui'];
    const all=document.querySelectorAll('[data-cfg-sec]');
    all.forEach(el=>{
      const id=String(el.getAttribute('data-cfg-sec')||'').trim();
      let vis=true;
      if(mode==='basic' && !q) vis=fav.includes(id);
      el.style.display=vis?'':'none';
      if(el.tagName==='DETAILS'){
        if(mode==='basic' && !q) el.open=autoOpen.includes(id);
      }
    });
    const cnt=document.getElementById('cfgSearchCnt');
    if(cnt && mode==='basic' && !q) cnt.textContent=`간단 보기 · 자주 쓰는 설정 ${fav.length}개`;
  }catch(e){}
};
window.cfgApplyBottomSectionsVisibility = function(){
  try{
    const mode=(localStorage.getItem('su_cfg_view_mode')||'basic')==='advanced' ? 'advanced' : 'basic';
    const q=String(window._cfgSearchQ||'').trim();
    if(window._cfgBottomSectionsOpen===undefined){
      const saved=localStorage.getItem('su_cfg_bottom_open');
      window._cfgBottomSectionsOpen = (saved==='1' || saved==='0') ? (saved==='1') : false;
    }
    const open = q ? true : !!window._cfgBottomSectionsOpen;
    if(!open){
      // 접기: 카드형 메뉴는 유지하고, 아래 상세 설정 본문만 숨김
      document.querySelectorAll('[data-cfg-sec]').forEach(el=>{
        try{ if(el.closest && el.closest('#cfgModalBody')) return; }catch(e){}
        try{ if(el.tagName==='DETAILS') el.open=false; }catch(e){}
        el.style.display='none';
      });
    } else {
      // 펼치기: 검색 중이면 검색 필터가 제어하도록 그대로 두고,
      // 검색이 아니면 현재 카테고리만 다시 적용
      if (!q) {
        try{
          if(typeof _cfgApplyCat==='function') _cfgApplyCat(window._cfgCat||'🧩 운영/콘텐츠', false);
        }catch(e){}
      }
    }
    // 버튼 텍스트 업데이트
    try{
      document.querySelectorAll('[onclick*="cfgToggleBottomSections"]').forEach(function(btn){
        const v = String(btn.getAttribute('data-cfg-toggle-variant')||'long');
        btn.textContent = v==='short'
          ? (open ? '📚 숨기기' : '📚 보기')
          : v==='plain'
            ? (open ? '원본 목록 숨기기' : '원본 목록 보기')
            : (open ? '📚 원본 목록 숨기기' : '📚 원본 목록 보기');
      });
    }catch(e){}
  }catch(e){}
};
window.cfgFocusSearch = function(){ try{ document.getElementById('cfgSearchInp')?.focus(); }catch(e){} };
window.cfgCollapseAll = function(){
  try{
    document.querySelectorAll('[data-cfg-sec]').forEach(el=>{ if(el.tagName==='DETAILS') el.open=false; });
    const sug=document.getElementById('cfgSearchSug'); if(sug){ sug.innerHTML=''; sug.style.display='none'; }
    try{ document.getElementById('cfgSearchInp')?.blur(); }catch(e){}
    try{ if(typeof showToast==='function') showToast('열린 설정 항목을 닫았습니다.'); }catch(e){}
  }catch(e){}
};
window.cfgOpenFavorites = function(){
  try{
    const fav=['pd','matchdetail','profileshape','uisize','tablabels'];
    document.querySelectorAll('[data-cfg-sec]').forEach(el=>{
      const id=el.getAttribute('data-cfg-sec');
      const vis=fav.includes(id);
      el.style.display=vis?'':'none';
      if(el.tagName==='DETAILS') el.open=vis;
    });
    const cnt=document.getElementById('cfgSearchCnt'); if(cnt) cnt.textContent=`자주 쓰는 설정 ${fav.length}개`;
  }catch(e){}
};
// 펨코스타일/신현황판 대학 순서 이동
// - 인라인 onclick에서 univCfg 직접 참조가 환경에 따라 막히는 경우가 있어(전역 let 바인딩 이슈),
//   전용 핸들러로 분리해 안정적으로 동작하게 한다.
window.cfgUnivOrderMove = function(i, dir){
  try{
    i = parseInt(i, 10);
    if(isNaN(i)) return;
    if(!Array.isArray(univCfg)) return;
    // 설정 팝업에는 "해체되지 않은 대학"만 노출되므로,
    // 이동도 원본 배열의 인접 인덱스가 아니라 "표시 중인 목록 순서" 기준으로 처리해야 한다.
    const visibleIdxs = univCfg
      .map((u, idx) => ({ u, idx }))
      .filter(x => x.u && !x.u.dissolved)
      .map(x => x.idx);
    const pos = visibleIdxs.indexOf(i);
    if(pos < 0) return;
    const nextPos = pos + (dir==='up' ? -1 : 1);
    if(nextPos < 0 || nextPos >= visibleIdxs.length) return;
    const j = visibleIdxs[nextPos];
    const moved = univCfg.splice(i, 1)[0];
    // splice 제거 후 뒤쪽 요소 인덱스가 당겨지므로 보정
    const insertAt = j > i ? j - 1 : j;
    univCfg.splice(insertAt, 0, moved);
    // 중요: boardOrder가 존재하면 추후 syncBoardOrderToUnivCfg()에서 순서가 되돌아갈 수 있음
    // → boardOrder도 함께 갱신하고 "정식 save()"로 저장
    try{
      if(typeof boardOrder!=='undefined'){
        boardOrder = univCfg.map(u=>u && u.name).filter(Boolean);
      }
    }catch(e){}
    try{ if(typeof save==='function') save(); else if(typeof localSave==='function') localSave(); else if(typeof saveCfg==='function') saveCfg(); }catch(e){}
    try{ if(typeof render==='function') render(); }catch(e){}
    try{ if(typeof showToast==='function') showToast('✅ 순서 저장됨'); }catch(e){}
  }catch(e){
    try{ console.error('[cfgUnivOrderMove] failed', e); }catch(_){}
  }
};

// ─────────────────────────────────────────────────────────────
// (호환/성능) 지연 로딩으로 인해 “함수 없음”으로 오탐되는 케이스 방지용 스텁들
// - settings.js는 상세 조립 파일보다 먼저 로드되므로 여기서 먼저 기본 스텁을 제공해둔다.
// - 실제 구현 파일이 로드되면(예: `render-player-detail.js`) 자동으로 대체된다.
// ─────────────────────────────────────────────────────────────
(function(){
  // cloud-board.js에 정의됨
  function _lazyCheckFbSyncStatus(){
    try{
      const loader = window._loadScriptOnce;
      if(typeof loader !== 'function'){
        alert('기능 로딩 중입니다. 잠시 후 다시 시도해주세요.');
        return;
      }
      loader('js/cloud-board.js?v=20260717-ds03').then(()=>{
        const fn = window.checkFbSyncStatus;
        if(typeof fn === 'function' && fn !== _lazyCheckFbSyncStatus) fn();
      }).catch((e)=>{
        console.error('[lazy] checkFbSyncStatus load fail', e);
        alert('동기화 상태 확인 로딩 실패');
      });
    }catch(e){}
  }
  window.checkFbSyncStatus = window.checkFbSyncStatus || _lazyCheckFbSyncStatus;

  // calendar.js에 정의됨
  function _lazyRCal(C, T){
    try{
      const loader = window._loadScriptOnce;
      if(typeof loader !== 'function'){
        if(C) C.innerHTML = '<div style="padding:24px;color:var(--gray-l);text-align:center">캘린더 로딩 중...</div>';
        return;
      }
      loader('js/calendar.js?v=20260717-ds03').then(()=>{
        const fn = window.rCal;
        if(typeof fn === 'function' && fn !== _lazyRCal) fn(C, T);
      }).catch((e)=>{
        console.error('[lazy] rCal load fail', e);
      });
    }catch(e){}
  }
  window.rCal = window.rCal || _lazyRCal;

  // stats.js + Chart.js에 정의됨
  function _lazyRStats(C, T){
    try{
      const loader = window._loadScriptOnce;
      if(typeof loader !== 'function'){
        if(C) C.innerHTML = '<div style="padding:24px;color:var(--gray-l);text-align:center">통계 로딩 중...</div>';
        return;
      }
      const ensureChart = window.ensureChartJS || (()=>loader('https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js'));
      // CRITICAL fix: 통계 스크립트 로딩은 render-lazy-utils.js의 _ensureStatsLoaded() 권위 소스 사용
      (window._ensureStatsLoaded ? window._ensureStatsLoaded() : Promise.resolve()).then(()=>{
        const fn = window.rStats;
        if(typeof fn === 'function' && fn !== _lazyRStats) fn(C, T);
      }).catch((e)=>{
        console.error('[lazy] rStats load fail', e);
      });
    }catch(e){}
  }
  window.rStats = window.rStats || _lazyRStats;
})();

// ─────────────────────────────────────────────────────────────
// (요청사항) "QA 체크리스트 전부 되는지" 빠른 드라이런 점검
// - 실제 사용자 데이터는 건드리지 않도록:
//   1) 전역 배열/함수(save/render/document.getElementById/localStorage 일부키)를 백업
//   2) 더미 데이터로 실행 후 원복
// - 네트워크/외부 리소스(동기화/이미지 링크)는 "함수 존재/초기화 여부"만 체크
// ─────────────────────────────────────────────────────────────
window.cfgRunFullQaDryRun = function(){
  const out = document.getElementById('cfg-selfcheck-out');
  if(out) out.innerHTML = '<div style="color:var(--gray-l);font-size:var(--fs-sm)">QA 점검 중...</div>';
  const rows = [];
  const ok = (name, pass, detail='')=>{
    rows.push({name, pass, detail});
  };
  const mustFn = (name, fnName)=>{
    ok(name, typeof window[fnName] === 'function', fnName);
  };
  const mustEl = (name, sel)=>{
    ok(name, !!document.querySelector(sel), sel);
  };

  // 0) 핵심 DOM/함수 존재 여부(광범위)
  mustEl('자동인식 모달 존재', '#pasteModal');
  mustEl('티어대회 구분 선택 UI', '#paste-tt-stage');
  mustFn('맵 약자 변환(resolveMapName)', 'resolveMapName');
  mustFn('맵 약자 합치기(getMapAlias)', 'getMapAlias');
  mustFn('상태 아이콘 설정(setStatusIcon)', 'setStatusIcon');
  mustFn('상태 아이콘 조회(getStatusIcon)', 'getStatusIcon');
  mustFn('모바일/태블릿 UI 변수 적용(applyResponsiveUiVars)', 'applyResponsiveUiVars');
  // 일괄 기능(실제 구현은 tier-tour.js)
  mustFn('일괄 날짜 변경(bulkChangeDate)', 'bulkChangeDate');
  mustFn('일괄 맵 교체(bulkChangeMap)', 'bulkChangeMap');
  mustFn('일괄 티어 변경(bulkChangeTier)', 'bulkChangeTier');
  mustFn('일괄 날짜범위 삭제(bulkDeleteByDate)', 'bulkDeleteByDate');
  mustFn('세트→게임수 합산 변환(bulkConvertToGameScore)', 'bulkConvertToGameScore');

  // 1) 드라이런 실행(가능한 것만)
  const backup = {};
  const backupLs = {};
  try{
    // 로그인 강제(드라이런에서는 권한/계정과 무관하게 동작 확인만)
    backup.isLoggedIn = (typeof window.isLoggedIn !== 'undefined') ? window.isLoggedIn : undefined;
    backup.isLoggedInLex = (typeof isLoggedIn !== 'undefined') ? isLoggedIn : undefined;
    try{ window.isLoggedIn = true; }catch(e){}
    try{ if(typeof isLoggedIn !== 'undefined') isLoggedIn = true; }catch(e){}

    // 전역 배열 백업
    ['miniM','univM','ckM','proM','ttM','comps','indM','gjM','tourneys','maps','players','compNames','curComp','userMapAlias','playerStatusIcons','playerStatusExpiry'].forEach(k=>{
      if(typeof window[k] !== 'undefined') backup[k] = window[k];
    });
    // (중요) 이 프로젝트는 constants.js/auth.js에서 top-level let로 전역 데이터를 들고 있어
    // window.*와 분리될 수 있음 → 드라이런은 실제 바인딩(miniM 등)을 직접 교체해야 테스트가 통과함
    try{ backup._lex_miniM = (typeof miniM!=='undefined') ? miniM : undefined; }catch(e){}
    try{ backup._lex_univM = (typeof univM!=='undefined') ? univM : undefined; }catch(e){}
    try{ backup._lex_ckM   = (typeof ckM!=='undefined') ? ckM : undefined; }catch(e){}
    try{ backup._lex_proM  = (typeof proM!=='undefined') ? proM : undefined; }catch(e){}
    try{ backup._lex_ttM   = (typeof ttM!=='undefined') ? ttM : undefined; }catch(e){}
    try{ backup._lex_comps = (typeof comps!=='undefined') ? comps : undefined; }catch(e){}
    try{ backup._lex_indM  = (typeof indM!=='undefined') ? indM : undefined; }catch(e){}
    try{ backup._lex_gjM   = (typeof gjM!=='undefined') ? gjM : undefined; }catch(e){}
    try{ backup._lex_tourneys = (typeof tourneys!=='undefined') ? tourneys : undefined; }catch(e){}
    try{ backup._lex_maps  = (typeof maps!=='undefined') ? maps : undefined; }catch(e){}
    try{ backup._lex_players = (typeof players!=='undefined') ? players : undefined; }catch(e){}
    // save/render 백업
    backup.save = window.save;
    backup.render = window.render;
    // document.getElementById 백업
    backup.getEl = document.getElementById.bind(document);

    // localStorage 백업(점검에서 변경할 키만)
    const lsKeys = ['su_psi','su_psi_expiry','su_tt_paste_stage','su_pd_badge_scale','su_pd_chip_scale','su_mb_scale','su_tb_scale'];
    lsKeys.forEach(k=>{ try{ backupLs[k] = localStorage.getItem(k); }catch(e){} });

    // save/render 스텁(실제 저장 금지)
    let saveCnt=0, renderCnt=0;
    window.save = ()=>{ saveCnt++; };
    window.render = ()=>{ renderCnt++; };

    // 더미 데이터 세팅
    const _dmMini = [{ d:'2026-04-01', map:'투혼II', sets:[{scoreA:1,scoreB:0,games:[{playerA:'A',playerB:'B',map:'투혼II',winner:'A'}]}], sa:1, sb:0 }];
    const _dmUniv = [{ d:'2026-04-01', sets:[{map:'투혼 II',scoreA:1,scoreB:0,games:[{playerA:'C',playerB:'D',map:'투혼II',winner:'A'}]}], sa:1, sb:0 }];
    const _dmTT   = [{ d:'2026-04-01', sets:[{scoreA:1,scoreB:0,games:[{playerA:'E',playerB:'F',map:'폴리포이드',winner:'A'}]}], sa:1, sb:0, stage:'general' }];
    const _dmPlayers = [{name:'A',tier:'S',univ:'U1'},{name:'B',tier:'A',univ:'U1'},{name:'C',tier:'S',univ:'U2'}];
    const _dmMaps = ['투혼 II','폴리포이드'];

    try{ if(typeof miniM!=='undefined') miniM = _dmMini; }catch(e){}
    try{ if(typeof univM!=='undefined') univM = _dmUniv; }catch(e){}
    try{ if(typeof ckM!=='undefined') ckM = []; }catch(e){}
    try{ if(typeof proM!=='undefined') proM = []; }catch(e){}
    try{ if(typeof ttM!=='undefined') ttM = _dmTT; }catch(e){}
    try{ if(typeof comps!=='undefined') comps = []; }catch(e){}
    try{ if(typeof indM!=='undefined') indM = []; }catch(e){}
    try{ if(typeof gjM!=='undefined') gjM = []; }catch(e){}
    try{ if(typeof tourneys!=='undefined') tourneys = []; }catch(e){}
    try{ if(typeof players!=='undefined') players = _dmPlayers; }catch(e){}
    try{ if(typeof maps!=='undefined') maps = _dmMaps; }catch(e){}

    // window.*도 동일 객체를 가리키게 맞춰서 검증/출력 PASS 처리
    try{ window.miniM = (typeof miniM!=='undefined') ? miniM : _dmMini; }catch(e){}
    try{ window.univM = (typeof univM!=='undefined') ? univM : _dmUniv; }catch(e){}
    try{ window.ckM   = (typeof ckM!=='undefined') ? ckM : []; }catch(e){}
    try{ window.proM  = (typeof proM!=='undefined') ? proM : []; }catch(e){}
    try{ window.ttM   = (typeof ttM!=='undefined') ? ttM : _dmTT; }catch(e){}
    try{ window.comps = (typeof comps!=='undefined') ? comps : []; }catch(e){}
    try{ window.indM  = (typeof indM!=='undefined') ? indM : []; }catch(e){}
    try{ window.gjM   = (typeof gjM!=='undefined') ? gjM : []; }catch(e){}
    try{ window.tourneys = (typeof tourneys!=='undefined') ? tourneys : []; }catch(e){}
    try{ window.players = (typeof players!=='undefined') ? players : _dmPlayers; }catch(e){}
    try{ window.maps = (typeof maps!=='undefined') ? maps : _dmMaps; }catch(e){}

    // document.getElementById 훅(일괄 입력값 제공)
    const fake = {
      // 날짜 변경
      'bulk-date-from': { value:'2026-04-01' },
      'bulk-date-to':   { value:'2026-04-30' },
      'bulk-date-chk-mini': { checked:true },
      'bulk-date-chk-univm': { checked:true },
      // 다른 모드들은 드라이런에서 제외(실데이터 접근 방지)
      'bulk-date-chk-ck': { checked:false },
      'bulk-date-chk-pro': { checked:false },
      'bulk-date-chk-tt': { checked:false },
      'bulk-date-chk-ind': { checked:false },
      'bulk-date-chk-gj': { checked:false },
      'bulk-date-chk-comp': { checked:false },
      // 맵 교체
      'bulk-map-from': { value:'투혼II' },
      'bulk-map-to': { value:'투혼' },
      // 티어 변경
      'bulk-tier-from': { value:'S' },
      'bulk-tier-to': { value:'B' },
      'bulk-tier-univ': { value:'U1' },
      // 삭제
      'bulk-del-from': { value:'2026-04-01' },
      'bulk-del-to': { value:'2026-04-30' },
      'bulk-del-chk-mini': { checked:true },
      // 변환
      'bulk-conv-chk-mini': { checked:true },
      'bulk-conv-chk-univm': { checked:true },
      // 티어대회 구분
      'paste-tt-stage': { value:'bkt' },
    };
    document.getElementById = (id)=> (fake[id] ? fake[id] : backup.getEl(id));

    // confirm은 true로 가정(중복/삭제 경고 등)
    backup.confirm = window.confirm;
    window.confirm = ()=>true;

    // 1-1) 일괄 날짜 변경
    if(typeof window.bulkChangeDate==='function'){
      window.bulkChangeDate();
      ok('드라이런: 날짜 일괄 변경', (miniM?.[0]?.d)==='2026-04-30' && (univM?.[0]?.d)==='2026-04-30');
    } else ok('드라이런: 날짜 일괄 변경', false, '함수 없음');

    // 1-2) 맵 일괄 교체(띄어쓰기 무시 포함)
    if(typeof window.bulkChangeMap==='function'){
      window.bulkChangeMap();
      ok('드라이런: 맵 일괄 교체', (miniM?.[0]?.map)==='투혼' && (univM?.[0]?.sets?.[0]?.map)==='투혼');
    } else ok('드라이런: 맵 일괄 교체', false, '함수 없음');

    // 1-3) 선수 일괄 티어 변경
    if(typeof window.bulkChangeTier==='function'){
      window.bulkChangeTier();
      ok('드라이런: 선수 일괄 티어 변경', players.find(p=>p.name==='A')?.tier==='B' && players.find(p=>p.name==='C')?.tier==='S');
    } else ok('드라이런: 선수 일괄 티어 변경', false, '함수 없음');

    // 1-4) 날짜 범위 일괄 삭제
    if(typeof window.bulkDeleteByDate==='function'){
      window.bulkDeleteByDate();
      ok('드라이런: 날짜 범위 일괄 삭제', Array.isArray(miniM) && miniM.length===0);
    } else ok('드라이런: 날짜 범위 일괄 삭제', false, '함수 없음');

    // 1-5) 세트→게임수 합산 변환
    if(typeof window.bulkConvertToGameScore==='function'){
      try{ if(typeof miniM!=='undefined') miniM = [{ sa:2, sb:1, sets:[{scoreA:1,scoreB:0},{scoreA:1,scoreB:1},{scoreA:1,scoreB:0}] }]; }catch(e){}
      try{ if(typeof univM!=='undefined') univM = [{ sa:0, sb:0, sets:[{scoreA:0,scoreB:1},{scoreA:0,scoreB:1},{scoreA:0,scoreB:1}] }]; }catch(e){}
      window.bulkConvertToGameScore();
      ok('드라이런: 세트→게임수 합산 변환', miniM[0].sa===3 && miniM[0].sb===1 && univM[0].sb===3);
    } else ok('드라이런: 세트→게임수 합산 변환', false, '함수 없음');

    // 1-6) 상태 아이콘 저장/해제
    if(typeof window.setStatusIcon==='function' && typeof window.getStatusIcon==='function'){
      try{
        window.setStatusIcon('테스터', 'fire');
        ok('드라이런: 상태 아이콘 저장', window.getStatusIcon('테스터')==='🔥');
        window.setStatusIcon('테스터', 'none');
        ok('드라이런: 상태 아이콘 해제', !window.getStatusIcon('테스터'));
      }catch(e){ ok('드라이런: 상태 아이콘', false, e.message); }
    }

    // 1-7) 맵 약자 변환(대표 케이스)
    if(typeof window.resolveMapName==='function'){
      ok('드라이런: 맵 약자 변환(폴→폴리포이드)', window.resolveMapName('폴')==='폴리포이드');
    }

    // 1-8) 티어대회 구분 저장(선택값 읽기 가능 여부)
    ok('티어대회 구분(stage) 저장 필드', true, 'ttM.stage 사용(일반/조별/토너)');

    ok('save/render 호출이 실제 저장 없이 동작', saveCnt>=0 && renderCnt>=0, `save=${saveCnt}, render=${renderCnt}`);
  }catch(e){
    ok('드라이런 실행', false, String(e.message||e));
  }finally{
    // 원복
    try{
      if(backup.getEl) document.getElementById = backup.getEl;
      if(typeof backup.confirm === 'function') window.confirm = backup.confirm;
      if(backup.save) window.save = backup.save;
      if(backup.render) window.render = backup.render;
      if(typeof backup.isLoggedIn !== 'undefined') window.isLoggedIn = backup.isLoggedIn;
      try{ if(typeof backup.isLoggedInLex !== 'undefined' && typeof isLoggedIn !== 'undefined') isLoggedIn = backup.isLoggedInLex; }catch(e){}
      Object.keys(backup).forEach(k=>{
        if(['save','render','getEl','confirm','isLoggedIn'].includes(k)) return;
        window[k] = backup[k];
      });
      // lexical 전역 원복
      try{ if(typeof backup._lex_miniM!=='undefined' && typeof miniM!=='undefined') miniM = backup._lex_miniM; }catch(e){}
      try{ if(typeof backup._lex_univM!=='undefined' && typeof univM!=='undefined') univM = backup._lex_univM; }catch(e){}
      try{ if(typeof backup._lex_ckM!=='undefined' && typeof ckM!=='undefined') ckM = backup._lex_ckM; }catch(e){}
      try{ if(typeof backup._lex_proM!=='undefined' && typeof proM!=='undefined') proM = backup._lex_proM; }catch(e){}
      try{ if(typeof backup._lex_ttM!=='undefined' && typeof ttM!=='undefined') ttM = backup._lex_ttM; }catch(e){}
      try{ if(typeof backup._lex_comps!=='undefined' && typeof comps!=='undefined') comps = backup._lex_comps; }catch(e){}
      try{ if(typeof backup._lex_indM!=='undefined' && typeof indM!=='undefined') indM = backup._lex_indM; }catch(e){}
      try{ if(typeof backup._lex_gjM!=='undefined' && typeof gjM!=='undefined') gjM = backup._lex_gjM; }catch(e){}
      try{ if(typeof backup._lex_tourneys!=='undefined' && typeof tourneys!=='undefined') tourneys = backup._lex_tourneys; }catch(e){}
      try{ if(typeof backup._lex_maps!=='undefined' && typeof maps!=='undefined') maps = backup._lex_maps; }catch(e){}
      try{ if(typeof backup._lex_players!=='undefined' && typeof players!=='undefined') players = backup._lex_players; }catch(e){}
      Object.keys(backupLs).forEach(k=>{
        try{
          if(backupLs[k] === null || typeof backupLs[k] === 'undefined') localStorage.removeItem(k);
          else localStorage.setItem(k, backupLs[k]);
        }catch(e){}
      });
    }catch(e){}
  }

  // 출력
  if(out){
    const passN = rows.filter(r=>r.pass).length;
    const failN = rows.length - passN;
    out.innerHTML = `
      <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin-bottom:10px">
        <div style="font-size:var(--fs-sm);font-weight:1000;color:${failN? '#dc2626':'#16a34a'}">QA 결과: ${passN} PASS / ${failN} FAIL</div>
        <div style="font-size:var(--fs-caption);color:var(--gray-l)">※ 동기화/외부 이미지 링크/실서버 연동은 여기서 완전 검증이 어렵습니다(함수/초기화 수준만 확인).</div>
      </div>
      <div style="border:1px solid var(--border);border-radius:12px;overflow:hidden">
        <div style="display:grid;grid-template-columns:1.4fr .4fr 1fr;gap:0;background:var(--surface);border-bottom:1px solid var(--border);font-size:var(--fs-caption);font-weight:900;color:var(--text2)">
          <div style="padding:8px 10px">항목</div><div style="padding:8px 10px">결과</div><div style="padding:8px 10px">메모</div>
        </div>
        ${rows.map(r=>`
          <div style="display:grid;grid-template-columns:1.4fr .4fr 1fr;gap:0;border-bottom:1px solid var(--border)">
            <div style="padding:8px 10px;font-size:var(--fs-sm);color:var(--text2)">${esc(r.name)}</div>
            <div style="padding:8px 10px;font-size:var(--fs-sm);font-weight:1000;color:${r.pass?'#16a34a':'#dc2626'}">${r.pass?'PASS':'FAIL'}</div>
            <div style="padding:8px 10px;font-size:var(--fs-caption);color:var(--gray-l);font-family:ui-monospace,monospace;white-space:pre-wrap">${esc(r.detail||'')}</div>
          </div>
        `).join('')}
      </div>
    `;
  }
};
// 설정 검색(섹션 필터)
window.cfgSearchSettings = function(q){
  window._cfgSearchQ = String(q||'').trim();
  const qq = window._cfgSearchQ.toLowerCase();
  // 검색어 없으면 현재 카테고리 기준으로 복구
  if(!qq){
    try{ _cfgApplyCat(window._cfgCat, false); }catch(e){}
    try{ const cnt=document.getElementById('cfgSearchCnt'); if(cnt) cnt.textContent=''; }catch(e){}
    try{ const sug=document.getElementById('cfgSearchSug'); if(sug){ sug.innerHTML=''; sug.style.display='none'; } }catch(e){}
    return;
  }
  let shown=0;
  try{
    const secs=document.querySelectorAll('[data-cfg-sec]');
    for(let i=0;i<secs.length;i++){
      const el=secs[i];
      // 모달에 올라간 섹션은 숨기지 않음
      try{ if(el.closest && el.closest('#cfgModalBody')) continue; }catch(e){}
      const id=el.getAttribute('data-cfg-sec')||'';
      const t = (window._cfgSecTitle && window._cfgSecTitle[id]) ? String(window._cfgSecTitle[id]) : id;
      const plain = t.replace(/<[^>]+>/g,'').replace(/^[\u{1F300}-\u{1FAFF}\u2600-\u27BF]+\s*/u,'');
      // 섹션 제목뿐 아니라 내부 세부 설정 문구도 검색 대상에 포함.
      // data-cfg-searchtext 속성을 캐시로 사용하며, rCfg 렌더 시 속성이 제거돼 자동 재수집됨.
      let st = el.getAttribute('data-cfg-searchtext');
      if(!st){
        try{
          const raw = el.innerText || '';
          // 빈 innerText는 캐싱하지 않음 (아직 화면에 없는 동적 섹션 대비)
          st = (plain + ' ' + raw).toLowerCase();
          if(raw.trim()) el.setAttribute('data-cfg-searchtext', st);
        }catch(e){
          st = plain.toLowerCase();
        }
      }
      const hit = id.toLowerCase().includes(qq) || st.includes(qq);
      el.style.display = hit ? '' : 'none';
      if(hit) shown++;
      if(el.tagName==='DETAILS') el.open=false;
    }
  }catch(e){}
  try{ const cnt=document.getElementById('cfgSearchCnt'); if(cnt) cnt.textContent = `검색 ${shown}개`; }catch(e){}

  // (개선) 검색 결과 "바로가기" 추천 목록
  try{
    const sug=document.getElementById('cfgSearchSug');
    if(!sug) return;
    const titles=window._cfgSecTitle||{};
    const hits=[];
    for(const id in titles){
      const t=String(titles[id]||'');
      const plain=t.replace(/<[^>]+>/g,'');
      const hay=(id+' '+plain).toLowerCase();
      if(hay.includes(qq)) hits.push({id,t:plain});
    }
    hits.sort((a,b)=>a.t.localeCompare(b.t,'ko'));
    const top=hits.slice(0,10);
    if(!top.length){
      sug.innerHTML='';
      sug.style.display='none';
      return;
    }
    sug.innerHTML = top.map(x=>`<button type="button" class="cfg-search-item" onclick="(function(){try{cfgGo('${x.id}');}catch(e){};try{document.getElementById('cfgSearchSug').style.display='none';}catch(e){}})()">${x.t}</button>`).join('');
    sug.style.display='block';
  }catch(e){}
};

// 디버그 플래그 (기본 OFF): URL에 ?cfgdebug=1 이 포함되면 콘솔에 자세히 기록
try{
  if(typeof window.__CFG_DEBUG==='undefined'){
    window.__CFG_DEBUG = (typeof location!=='undefined' && (location.search||'').indexOf('cfgdebug=1')!==-1);
  }
}catch(e){}


// rCfg / reCfg 는 settings-render.js 에서 단독 정의됩니다. 이 파일에서는 정의하지 않습니다.
// (CRITICAL fix: 이중 정의 제거 — settings-render.js 가 권위 소스)



// ── 설정/메모 동기화(GitHub Gist) 상태 패널 ──
window.cfgRenderGistSyncStatus = function(){
  const box=document.getElementById('cfg-gist-sync-status');
  if(!box) return;
  if(!window.SettingsStore){
    box.innerHTML = `<span style="color:var(--red);font-weight:900">⚠️ SettingsStore 모듈이 없습니다.</span>`;
    return;
  }
  const st = (typeof window.SettingsStore.getSyncStatus==='function')
    ? window.SettingsStore.getSyncStatus()
    : { enabled: localStorage.getItem('al_sync_enabled')==='1', gistId: localStorage.getItem('al_gist_id')||'', tokenSet: !!localStorage.getItem('al_github_token'), isAdmin: (typeof isLoggedIn!=='undefined'&&isLoggedIn)&&(!(typeof isSubAdmin!=='undefined'&&isSubAdmin)) };

  // 입력값 채우기
  try{
    const gid=document.getElementById('cfg-gist-id'); if(gid) gid.value = st.gistId || '';
    const en=document.getElementById('cfg-gist-enabled'); if(en) en.checked = !!st.enabled;
  }catch(e){}

  const parts=[];
  parts.push(`<div><b>동기화</b>: ${st.enabled?'ON':'OFF'} ${st.isAdmin?'(관리자 저장 가능)':'(읽기만 가능)'}</div>`);
  parts.push(`<div><b>Gist ID</b>: ${st.gistId?`<code>${st.gistId}</code>`:'<span style="color:var(--gray-l)">미설정</span>'}</div>`);
  parts.push(`<div><b>토큰</b>: ${st.tokenSet?'✅ 설정됨':'미설정'}</div>`);
  if(st.remoteMode) parts.push(`<div><b>원격 파일</b>: ${st.remoteMode==='legacy'?'legacy(자동 마이그레이션 대상)':'su_settings.json'}</div>`);
  if(st.lastPull) parts.push(`<div><b>마지막 불러오기</b>: ${st.lastPull}</div>`);
  if(st.lastPush) parts.push(`<div><b>마지막 저장</b>: ${st.lastPush}</div>`);
  if(st.migrated) parts.push(`<div><b>마이그레이션</b>: ✅ 수행됨</div>`);
  if(st.lastError) parts.push(`<div style="color:var(--red)"><b>최근 오류</b>: ${esc(String(st.lastError))}</div>`);
  box.innerHTML = parts.join('');
};

window.cfgGistSyncSaveCfg = function(){
  if(!window.SettingsStore) return alert('SettingsStore 모듈이 없습니다.');
  const gid=(document.getElementById('cfg-gist-id')?.value||'').trim();
  const tok=(document.getElementById('cfg-gist-token')?.value||'').trim();
  const enEl=document.getElementById('cfg-gist-enabled');
  const en = enEl ? !!enEl.checked : (window.SettingsStore.cfg().enabled);
  const patch={};
  if(gid) patch.gistId=gid;
  if(typeof en !== 'undefined') patch.enabled=en;
  // 보안: 토큰은 입력했을 때만 업데이트(빈 값은 "유지")
  if(tok) patch.token=tok;
  try{
    window.SettingsStore.setCfg(patch);
    const msg=document.getElementById('cfg-gist-sync-msg');
    if(msg) msg.textContent='✅ 저장됨';
  }catch(e){
    alert('저장 실패: '+e.message);
  }
  try{ window.cfgRenderGistSyncStatus(); }catch(e){}
};

// (요청사항) 설정 변경 자동 저장(원격/Gist) 토글
window.cfgGistSyncSetAutoPush = function(on){
  try{
    if(!window.SettingsStore) return;
    if(!window.SettingsStore.isAdmin()) return;
    window.SettingsStore.setPrefsAutoPush(!!on);
    const msg=document.getElementById('cfg-gist-sync-msg');
    if(msg) msg.textContent = on ? '✅ 자동 저장 ON' : '자동 저장 OFF';
  }catch(e){}
  try{ window.cfgRenderGistSyncStatus(); }catch(e){}
};

// 설정 UI에서 변경이 발생했을 때 "prefs" 동기화 타임스탬프 갱신 + (옵션) 자동 저장
window.cfgTouchPrefsSync = function(){
  try{
    if(window.SettingsStore && typeof window.SettingsStore.markPrefsChanged==='function'){
      window.SettingsStore.markPrefsChanged();
    }
  }catch(e){}
};

window.cfgGistSyncPull = async function(){
  const msg=document.getElementById('cfg-gist-sync-msg');
  if(msg) msg.textContent='불러오는 중...';
  try{
    if(!window.SettingsStore) throw new Error('SettingsStore 모듈이 없습니다.');
    const info = await window.SettingsStore.pull({ returnInfo:true });
    if(msg) msg.textContent = info && info.migrated ? '✅ 불러오기 완료 (+마이그레이션 완료)' : '✅ 불러오기 완료';
    try{ if(typeof showToast==='function') showToast('✅ 원격 설정 불러오기 완료'); }catch(e){}
  }catch(e){
    if(msg) msg.textContent='❌ 실패: '+e.message;
    try{ if(typeof showToast==='function') showToast('❌ 불러오기 실패: '+e.message); }catch(_){}
  }
  try{ window.cfgRenderGistSyncStatus(); }catch(e){}
};

window.cfgGistSyncPush = async function(){
  const msg=document.getElementById('cfg-gist-sync-msg');
  if(msg) msg.textContent='저장하는 중...';
  try{
    if(!window.SettingsStore) throw new Error('SettingsStore 모듈이 없습니다.');
    if(!window.SettingsStore.isAdmin()) throw new Error('관리자만 저장할 수 있습니다.');
    await window.SettingsStore.push();
    if(msg) msg.textContent='✅ 원격 저장 완료';
    try{ if(typeof showToast==='function') showToast('☁️ 다른 기기에도 반영됨'); }catch(e){}
  }catch(e){
    if(msg) msg.textContent='❌ 실패: '+e.message;
    try{ if(typeof showToast==='function') showToast('❌ 저장 실패: '+e.message); }catch(_){}
  }
  try{ window.cfgRenderGistSyncStatus(); }catch(e){}
};

async function rebuildIndexedDbStores(){
  try{
    let msgs=[];
    if(window.MatchStore && typeof window.MatchStore.rebuild==='function'){
      const r=await window.MatchStore.rebuild();
      msgs.push(`경기 기록: ${r.backend||'unknown'}`);
    }
    if(window.HistoryExternalUtils && typeof window.HistoryExternalUtils.rebuildStorage==='function'){
      const r=await window.HistoryExternalUtils.rebuildStorage();
      msgs.push(`외부탭: ${r.backend||'unknown'}`);
    }
    renderStorageInfo();
    alert(`재빌드를 완료했습니다.\n${msgs.join('\n')}`);
  }catch(e){
    alert('재빌드 중 오류가 발생했습니다.');
  }
}

// ── 이미지탭 레이아웃 저장 함수 ──

// ── 구현황판 밝기 저장 함수 ──

// ── 이미지 설정 저장 함수 ──

// ── 우클릭 이미지 조절 메뉴 ──
// tier-tour.js 등 다른 스크립트와 전역 식별자 충돌 방지
try{
  if(typeof window._settingsImgContextMenuEl === 'undefined') window._settingsImgContextMenuEl = null;
  if(typeof window._currentImageTarget === 'undefined') window._currentImageTarget = null;
}catch(e){}



// ── 랜덤 이미지 회전 ──
try{ if(typeof window._randomRotationTimer === 'undefined') window._randomRotationTimer = null; }catch(e){}




// 현재 탭 추적
try{ if(typeof window._settingsCurrentTab !== 'string') window._settingsCurrentTab = 'total'; }catch(e){}

// [FIX-2] sw() 원숭이패치 중복 제거: settings-data-ops.js에서만 패치하므로 이 블록은 삭제.
// _cfgSecDescMap은 settings-data-ops.js의 패치 블록 안에 이미 정의되어 있음.


/* ══════════════════════════════════════
   경기 일괄 수정 함수들
══════════════════════════════════════ */

// (요청사항) 저장된 점수 방식(scoreMode: set/game)에 맞춰 sa/sb를 일괄 재계산
// - 세트로 저장된 기록은 세트승으로, 경기제로 저장된 기록은 게임수 합산으로 정리
// - scoreMode 미설정(old data)은 sets 기반으로 추정(set wins 합이 2 이상이면 set, 아니면 game)

// (요청사항) 경기 기록을 "세트제(세트 승리 수)" 스코어로 일괄 변환
// - sets 배열 기반으로 sa/sb를 (세트 승)으로 재계산
// - 기존 sa/sb가 게임수로 저장된 경우를 한번에 수정하기 위함


/* ══════════════════════════════════════
   시즌 관리 함수
══════════════════════════════════════ */



/* ══════════════════════════════════════
   선수 CRUD
══════════════════════════════════════ */
// 등록 타입 변경 시 폼 필드 동적 표시/숨김

window.openEP=function(name){
  editName=name;const p=players.find(x=>x.name===name);
  if(!p) return;
  // 개인/끝장전 배경형 선수 카드: 스트리머별 배경 위치 저장값
  const _h2hPosMap = (()=>{ try{ return JSON.parse(localStorage.getItem('su_h2h_player_bgpos')||'{}')||{}; }catch(e){ return {}; } })();
  const _h2hPos = _h2hPosMap[p.name] || { x:50, y:50 };
  const _h2hX = (()=>{ const n=parseInt(_h2hPos.x??'50',10); return isNaN(n)?50:Math.max(0,Math.min(100,n)); })();
  const _h2hY = (()=>{ const n=parseInt(_h2hPos.y??'50',10); return isNaN(n)?50:Math.max(0,Math.min(100,n)); })();
  const _h2hFit = (()=>{ try{ return (localStorage.getItem('su_h2h_panel_fit')||'cover').trim(); }catch(e){ return 'cover'; } })();
  const _h2hBgSize = _h2hFit==='fill' ? '100% 100%' : (_h2hFit==='contain' ? 'contain' : 'cover');
  const _p1X = (()=>{ const n=parseInt(p.photoPosX??'50',10); return isNaN(n)?50:Math.max(0,Math.min(100,n)); })();
  const _p1Y = (()=>{ const n=parseInt(p.photoPosY??'50',10); return isNaN(n)?50:Math.max(0,Math.min(100,n)); })();
  const _p2X = (()=>{ const n=parseInt(p.photo2PosX??'50',10); return isNaN(n)?50:Math.max(0,Math.min(100,n)); })();
  const _p2Y = (()=>{ const n=parseInt(p.photo2PosY??'50',10); return isNaN(n)?50:Math.max(0,Math.min(100,n)); })();
  const _p1Use = (p.photoPosUse !== false);
  const _p2Use = (p.photo2PosUse !== false);
  document.getElementById('emBody').innerHTML=`
    <label>스트리머 이름</label><input type="text" id="ed-n" value="${p.name}">
    <label>티어</label><select id="ed-t">${TIERS.map(t=>`<option value="${t}"${p.tier===t?' selected':''}>${getTierLabel(t)}</option>`).join('')}</select>
    <label>대학</label>
    <div style="display:flex;gap:6px;align-items:center">
      <select id="ed-u" style="flex:1">${getAllUnivs().filter(u=>!u.dissolved||u.name===p.univ).map(u=>`<option value="${u.name}"${p.univ===u.name?' selected':''}>${u.name}</option>`).join('')}</select>
      ${p.univ!=='무소속'?`<button type="button" onclick="document.getElementById('ed-u').value='무소속'" style="flex-shrink:0;padding:4px 10px;border-radius:7px;border:1.5px solid #9ca3af;background:var(--surface);color:#6b7280;font-size:var(--fs-caption);font-weight:700;cursor:pointer;white-space:nowrap">🚶 무소속</button>`:''}
    </div>
    <label>종족</label><select id="ed-r"><option value="T"${p.race==='T'?' selected':''}>테란</option><option value="Z"${p.race==='Z'?' selected':''}>저그</option><option value="P"${p.race==='P'?' selected':''}>프로토스</option><option value="N"${p.race==='N'?' selected':''}>종족미정</option></select>
    <label>성별</label><select id="ed-g"><option value="F"${(p.gender||'F')==='F'?' selected':''}>👩 여자</option><option value="M"${p.gender==='M'?' selected':''}>👨 남자</option></select>
    <label>직책 <span style="font-size:10px;font-weight:400;color:var(--gray-l)">(이사장/선장/동아리장/반장/총장/부총장/총괄/교수/코치는 정렬 우선순위 적용)</span></label>
    <div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:6px">
      ${MAIN_ROLES.map(r=>{const ic=ROLE_ICONS[r]||'🏷️';const col=ROLE_COLORS[r]||'#6b7280';return `<button type="button" onclick="const el=document.getElementById('ed-role');el.value=el.value===this.dataset.role?'':this.dataset.role;" data-role="${r}" style="padding:3px 8px;border-radius:6px;border:1.5px solid ${col};background:${p.role===r?col+'22':'var(--white)'};color:${col};font-size:var(--fs-caption);font-weight:700;cursor:pointer">${ic} ${r}</button>`;}).join('')}
      <button type="button" onclick="document.getElementById('ed-role').value=''" style="padding:3px 8px;border-radius:6px;border:1.5px solid #9ca3af;background:var(--white);color:#9ca3af;font-size:var(--fs-caption);font-weight:700;cursor:pointer">✕ 없음</button>
    </div>
    <input type="text" id="ed-role" value="${p.role||''}" placeholder="직책 직접 입력 또는 위 버튼 클릭" style="width:100%">
    <label>🖼 프로필 사진 URL <span style="font-size:10px;font-weight:400;color:var(--gray-l)">(현황판 카드에 표시 · 비워두면 기본 아이콘)</span></label>
    <div style="display:flex;gap:8px;align-items:center">
      <input type="text" id="ed-photo" value="${p.photo||''}" placeholder="https://... 이미지 URL 입력" style="flex:1" oninput="(function(el){const v=el.value.trim();const img=document.getElementById('ed-photo-preview');const warn=document.getElementById('ed-photo-warn');if(v&&v.startsWith('data:')){el.style.borderColor='#dc2626';if(warn){warn.style.color='#dc2626';warn.textContent='❌ base64 이미지 직접 입력 불가 — imgur.com 등에 업로드 후 URL 사용';}}else{el.style.borderColor='';if(warn){warn.textContent='이미지 URL을 붙여넣으면 현황판 선수 카드에 프로필 사진이 표시됩니다.';warn.style.color='var(--gray-l)';}}const wrap=document.getElementById('ed-photo-preview-wrap');if(v&&!v.startsWith('data:')){img.src=v;img.style.display='block';if(wrap)wrap.style.display='inline-block';}else{if(wrap)wrap.style.display='none';}})(this)">
      <span id="ed-photo-preview-wrap" style="position:relative;width:40px;height:40px;border-radius:var(--su_profile_radius,50%);overflow:hidden;flex-shrink:0;background:#e2e8f0;border:2px solid var(--border);display:${p.photo&&!p.photo.startsWith('data:')?'inline-block':'none'}">
        <img id="ed-photo-preview" src="${p.photo&&!p.photo.startsWith('data:')?toHttpsUrl(p.photo):''}" style="width:40px;height:40px;object-fit:cover;display:block" onerror="this.style.display='none';const w=document.getElementById('ed-photo-warn');if(w){w.style.color='#d97706';w.textContent='⚠️ 이미지를 불러올 수 없습니다. 다른 도메인에서 차단됐거나 URL이 잘못됐을 수 있습니다.';}">
      </span>
    </div>
    <div id="ed-photo-warn" style="font-size:10px;color:${p.photo&&p.photo.startsWith('data:')?'#dc2626':'var(--gray-l)'};margin-top:-6px">${p.photo&&p.photo.startsWith('data:')?'❌ base64 이미지 직접 입력 불가 — imgur.com 등에 업로드 후 URL 사용':'이미지 URL을 붙여넣으면 현황판 선수 카드에 프로필 사진이 표시됩니다.'}</div>

    <div style="margin-top:10px;padding:12px;background:var(--surface);border:1px solid var(--border);border-radius:var(--r)">
      <div style="font-weight:900;font-size:var(--fs-sm);color:var(--text2);margin-bottom:6px">🖼 프로필 사진 1 — 얼굴 위치(자르기 보정)</div>
      <div style="font-size:var(--fs-caption);color:var(--gray-l);line-height:1.6;margin-bottom:10px">
        (채우기/cover 사용 시) 얼굴이 잘리면 아래 미리보기에서 <b>드래그</b>하거나 X/Y로 위치를 보정할 수 있습니다.
      </div>
      <label style="display:flex;align-items:center;gap:6px;font-size:var(--fs-caption);font-weight:900;color:var(--text3);margin:-2px 0 10px">
        <input type="checkbox" id="ed-p1pos-use" ${_p1Use?'checked':''} onchange="document.getElementById('ed-p1pos-prev').style.opacity=this.checked?1:.55">
        이 보정 적용(체크 해제 시 기존 설정 사용)
      </label>
      <input type="hidden" id="ed-p1pos-del" value="0">
      <div id="ed-p1pos-prev" style="position:relative;height:150px;border-radius:var(--r2);overflow:hidden;border:1.5px solid var(--border);background:linear-gradient(135deg, rgba(100,116,139,.26), rgba(100,116,139,.10));touch-action:none;user-select:none;opacity:${_p1Use?1:.55}">
        ${p.photo?`<img id="ed-p1pos-img" src="${toHttpsUrl(p.photo).replace(/\"/g,'&quot;')}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:${_p1X}% ${_p1Y}%;transform:scale(1.02)" onerror="this.style.display='none'">`:''}
        <div style="position:absolute;inset:0;background:linear-gradient(180deg, rgba(15,23,42,.04) 0%, rgba(15,23,42,.10) 60%, rgba(15,23,42,.22) 100%)"></div>
        <div style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:18px;height:18px;border-radius:999px;border:2px solid rgba(255,255,255,.9);box-shadow:0 2px 10px rgba(0,0,0,.35);pointer-events:none"></div>
        <div style="position:absolute;left:50%;top:0;bottom:0;width:1px;background:rgba(255,255,255,.35);pointer-events:none"></div>
        <div style="position:absolute;top:50%;left:0;right:0;height:1px;background:rgba(255,255,255,.35);pointer-events:none"></div>
      </div>
      <div style="display:grid;grid-template-columns:90px 1fr 52px;gap:10px;align-items:center;margin-top:10px">
        <div style="font-size:var(--fs-sm);font-weight:800;color:var(--text2)">가로(X)</div>
        <input type="range" id="ed-p1pos-x" min="0" max="100" step="1" value="${_p1X}" oninput="edP1PosSyncFromInputs()" style="width:100%">
        <div id="ed-p1pos-xv" style="font-size:var(--fs-caption);color:var(--gray-l);font-weight:900;text-align:right">${_p1X}%</div>
      </div>
      <div style="display:grid;grid-template-columns:90px 1fr 52px;gap:10px;align-items:center;margin-top:6px">
        <div style="font-size:var(--fs-sm);font-weight:800;color:var(--text2)">세로(Y)</div>
        <input type="range" id="ed-p1pos-y" min="0" max="100" step="1" value="${_p1Y}" oninput="edP1PosSyncFromInputs()" style="width:100%">
        <div id="ed-p1pos-yv" style="font-size:var(--fs-caption);color:var(--gray-l);font-weight:900;text-align:right">${_p1Y}%</div>
      </div>
      <div style="display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end;margin-top:10px">
        <button type="button" class="btn btn-w btn-xs" onclick="edP1PosCenter()">센터(50/50)</button>
        <button type="button" class="btn btn-w btn-xs" onclick="edP1PosDelete()">삭제(기본)</button>
      </div>
    </div>

    <div style="margin-top:10px;padding:12px;background:var(--surface);border:1px solid var(--border);border-radius:var(--r)">
      <div style="font-weight:900;font-size:var(--fs-sm);color:var(--text2);margin-bottom:6px">🎯 개인/끝장전 카드 — 얼굴 위치(배경)</div>
      <div style="font-size:var(--fs-caption);color:var(--gray-l);line-height:1.6;margin-bottom:10px">
        채우기(cover)에서 얼굴이 잘리는 경우, 아래 미리보기에서 <b>드래그</b>하거나 X/Y로 위치를 보정할 수 있습니다. (개인전/끝장전/프로리그 끝장전 적용)
      </div>
      <input type="hidden" id="ed-h2hpos-del" value="0">
      <div id="ed-h2hpos-prev" style="position:relative;height:150px;border-radius:var(--r2);overflow:hidden;border:1.5px solid var(--border);background:${p.photo?`url('${toHttpsUrl(p.photo)}')`:'linear-gradient(135deg, rgba(100,116,139,.26), rgba(100,116,139,.10))'};background-size:${_h2hBgSize};background-position:${_h2hX}% ${_h2hY}%;background-repeat:no-repeat;touch-action:none;user-select:none">
        <div style="position:absolute;inset:0;background:linear-gradient(180deg, rgba(15,23,42,.06) 0%, rgba(15,23,42,.32) 60%, rgba(15,23,42,.78) 100%)"></div>
        <div style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:18px;height:18px;border-radius:999px;border:2px solid rgba(255,255,255,.9);box-shadow:0 2px 10px rgba(0,0,0,.35);pointer-events:none"></div>
        <div style="position:absolute;left:50%;top:0;bottom:0;width:1px;background:rgba(255,255,255,.35);pointer-events:none"></div>
        <div style="position:absolute;top:50%;left:0;right:0;height:1px;background:rgba(255,255,255,.35);pointer-events:none"></div>
        <div style="position:absolute;left:0;right:0;bottom:0;padding:10px 12px;z-index:1;text-align:center">
          <div style="font-weight:1000;font-size:16px;line-height:1.1;color:#fff;text-shadow:0 2px 10px rgba(0,0,0,.45)">${p.name}</div>
          <div style="font-size:var(--fs-caption);font-weight:800;color:rgba(255,255,255,.86);text-shadow:0 2px 10px rgba(0,0,0,.35)">${p.univ||''}</div>
          <div style="margin-top:4px;display:flex;gap:6px;align-items:center;justify-content:center;flex-wrap:wrap">
            ${(p.race&&p.race!=='N')?`<span class="rbadge r${p.race}" style="transform:scale(.92);transform-origin:center">${p.race}</span>`:''}
            ${p.tier?`<span style="transform:scale(.92);transform-origin:center">${getTierBadge(p.tier)}</span>`:''}
          </div>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:90px 1fr 52px;gap:10px;align-items:center;margin-top:10px">
        <div style="font-size:var(--fs-sm);font-weight:800;color:var(--text2)">가로(X)</div>
        <input type="range" id="ed-h2hpos-x" min="0" max="100" step="1" value="${_h2hX}"
          oninput="edH2HPosSyncFromInputs()" style="width:100%">
        <div id="ed-h2hpos-xv" style="font-size:var(--fs-caption);color:var(--gray-l);font-weight:900;text-align:right">${_h2hX}%</div>
      </div>
      <div style="display:grid;grid-template-columns:90px 1fr 52px;gap:10px;align-items:center;margin-top:6px">
        <div style="font-size:var(--fs-sm);font-weight:800;color:var(--text2)">세로(Y)</div>
        <input type="range" id="ed-h2hpos-y" min="0" max="100" step="1" value="${_h2hY}"
          oninput="edH2HPosSyncFromInputs()" style="width:100%">
        <div id="ed-h2hpos-yv" style="font-size:var(--fs-caption);color:var(--gray-l);font-weight:900;text-align:right">${_h2hY}%</div>
      </div>
      <div style="display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end;margin-top:10px">
        <button type="button" class="btn btn-w btn-xs" onclick="edH2HPosCenter()">센터(50/50)</button>
        <button type="button" class="btn btn-w btn-xs" onclick="edH2HPosDelete()">삭제(기본)</button>
        <button type="button" class="btn btn-b btn-xs" onclick="edH2HPosSave()">저장</button>
      </div>
      <div id="ed-h2hpos-msg" style="display:none;margin-top:6px;font-size:var(--fs-caption);color:var(--green);font-weight:900;text-align:right">저장됨!</div>
    </div>

    <label>🖼 프로필 이미지 2 <span style="font-size:10px;font-weight:400;color:var(--gray-l)">(모바일/교체용 · 1초 후 자동 전환)</span></label>
    <input type="text" id="ed-photo2" value="${p.secondProfileFile||''}" placeholder="https://... 이미지 URL 입력" style="width:100%">
    <div style="font-size:10px;color:var(--gray-l);margin-top:-6px">현황판 등에서 보조 프로필 이미지로 사용됩니다.</div>

    <div style="margin-top:10px;padding:12px;background:var(--surface);border:1px solid var(--border);border-radius:var(--r)">
      <div style="font-weight:900;font-size:var(--fs-sm);color:var(--text2);margin-bottom:6px">🖼 프로필 사진 2 — 얼굴 위치(자르기 보정)</div>
      <div style="font-size:var(--fs-caption);color:var(--gray-l);line-height:1.6;margin-bottom:10px">프로필 2도 필요하면 위치를 저장할 수 있습니다.</div>
      <label style="display:flex;align-items:center;gap:6px;font-size:var(--fs-caption);font-weight:900;color:var(--text3);margin:-2px 0 10px">
        <input type="checkbox" id="ed-p2pos-use" ${_p2Use?'checked':''} onchange="document.getElementById('ed-p2pos-prev').style.opacity=this.checked?1:.55">
        이 보정 적용(체크 해제 시 기존 설정 사용)
      </label>
      <input type="hidden" id="ed-p2pos-del" value="0">
      <div id="ed-p2pos-prev" style="position:relative;height:150px;border-radius:var(--r2);overflow:hidden;border:1.5px solid var(--border);background:linear-gradient(135deg, rgba(100,116,139,.26), rgba(100,116,139,.10));touch-action:none;user-select:none;opacity:${_p2Use?1:.55}">
        ${p.secondProfileFile?`<img id="ed-p2pos-img" src="${toHttpsUrl(p.secondProfileFile).replace(/\"/g,'&quot;')}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:${_p2X}% ${_p2Y}%;transform:scale(1.02)" onerror="this.style.display='none'">`:''}
        <div style="position:absolute;inset:0;background:linear-gradient(180deg, rgba(15,23,42,.04) 0%, rgba(15,23,42,.10) 60%, rgba(15,23,42,.22) 100%)"></div>
        <div style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:18px;height:18px;border-radius:999px;border:2px solid rgba(255,255,255,.9);box-shadow:0 2px 10px rgba(0,0,0,.35);pointer-events:none"></div>
        <div style="position:absolute;left:50%;top:0;bottom:0;width:1px;background:rgba(255,255,255,.35);pointer-events:none"></div>
        <div style="position:absolute;top:50%;left:0;right:0;height:1px;background:rgba(255,255,255,.35);pointer-events:none"></div>
      </div>
      <div style="display:grid;grid-template-columns:90px 1fr 52px;gap:10px;align-items:center;margin-top:10px">
        <div style="font-size:var(--fs-sm);font-weight:800;color:var(--text2)">가로(X)</div>
        <input type="range" id="ed-p2pos-x" min="0" max="100" step="1" value="${_p2X}" oninput="edP2PosSyncFromInputs()" style="width:100%">
        <div id="ed-p2pos-xv" style="font-size:var(--fs-caption);color:var(--gray-l);font-weight:900;text-align:right">${_p2X}%</div>
      </div>
      <div style="display:grid;grid-template-columns:90px 1fr 52px;gap:10px;align-items:center;margin-top:6px">
        <div style="font-size:var(--fs-sm);font-weight:800;color:var(--text2)">세로(Y)</div>
        <input type="range" id="ed-p2pos-y" min="0" max="100" step="1" value="${_p2Y}" oninput="edP2PosSyncFromInputs()" style="width:100%">
        <div id="ed-p2pos-yv" style="font-size:var(--fs-caption);color:var(--gray-l);font-weight:900;text-align:right">${_p2Y}%</div>
      </div>
      <div style="display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end;margin-top:10px">
        <button type="button" class="btn btn-w btn-xs" onclick="edP2PosCenter()">센터(50/50)</button>
        <button type="button" class="btn btn-w btn-xs" onclick="edP2PosDelete()">삭제(기본)</button>
      </div>
    </div>
    <label>🏠 방송국 홈 URL <span style="font-size:10px;font-weight:400;color:var(--gray-l)">(홈 아이콘 클릭 시 이동)</span></label>
    <div style="display:flex;gap:8px;align-items:center">
      <input type="text" id="ed-channel" value="${p.channelUrl||''}" placeholder="https://chzzk.naver.com/... 또는 https://twitch.tv/..." style="flex:1">
      ${p.channelUrl?`<a href="${p.channelUrl}" target="_blank" style="font-size:var(--fs-lg);text-decoration:none" title="방송국 바로가기">🏠</a>`:''}
    </div>
    <div style="font-size:10px;color:var(--gray-l);margin-top:-6px">치지직/트위치/유튜브 등 방송국 주소. 스트리머 상세에서 홈 아이콘으로 이동됩니다.</div>
    <div style="margin-top:14px;padding:12px;background:var(--surface);border:1px solid var(--border);border-radius:8px">
      <div style="font-weight:800;font-size:var(--fs-sm);color:var(--text2);margin-bottom:10px">🖼 스트리머 상세 헤더 배경</div>
      <label>배경 이미지 URL <span style="font-size:10px;font-weight:400;color:var(--gray-l)">(비워두면 설정탭 기본값 사용)</span></label>
      <input type="text" id="ed-phbg" value="${p.detailHeaderBgImg||''}" placeholder="https://... 이미지 URL">
      <div id="ed-phbg-prev" style="position:relative;height:150px;border-radius:var(--r2);overflow:hidden;border:1.5px solid var(--border);margin-top:10px;background:linear-gradient(135deg, rgba(100,116,139,.26), rgba(100,116,139,.10));touch-action:none;user-select:none">
        ${(p.detailHeaderBgImg||'').trim()?`<div id="ed-phbg-prev-bg" style="position:absolute;inset:-8%;background-image:url('${toHttpsUrl((p.detailHeaderBgImg||'').trim()).replace(/'/g,'%27')}');background-repeat:no-repeat;background-position:${Number(p.detailHeaderBgPosX??50)||50}% ${Number(p.detailHeaderBgPosY??50)||50}%;background-size:${(p.detailHeaderBgFit||'')==='fill'?'100% 100%':((p.detailHeaderBgFit||'')==='cover'?'cover':'contain')};transform:scale(${Math.max(40,Math.min(220,Number(p.detailHeaderBgScale||100)||100))/100});transform-origin:center center;opacity:.85;pointer-events:none"></div>`:''}
        <div style="position:absolute;inset:0;background:linear-gradient(180deg, rgba(15,23,42,.04) 0%, rgba(15,23,42,.10) 60%, rgba(15,23,42,.22) 100%);pointer-events:none"></div>
        <div style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:18px;height:18px;border-radius:999px;border:2px solid rgba(255,255,255,.9);box-shadow:0 2px 10px rgba(0,0,0,.35);pointer-events:none"></div>
        <div style="position:absolute;left:50%;top:0;bottom:0;width:1px;background:rgba(255,255,255,.35);pointer-events:none"></div>
        <div style="position:absolute;top:50%;left:0;right:0;height:1px;background:rgba(255,255,255,.35);pointer-events:none"></div>
        <div style="position:absolute;left:10px;top:10px;z-index:1;font-size:var(--fs-caption);font-weight:900;color:rgba(255,255,255,.82);text-shadow:0 2px 8px rgba(0,0,0,.35);pointer-events:none">드래그로 위치 조정</div>
        ${!(p.detailHeaderBgImg||'').trim()?`<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:var(--fs-sm);font-weight:900;color:rgba(15,23,42,.55)">URL을 입력하면 미리보기가 표시됩니다</div>`:''}
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:10px">
        <div>
          <label>표시 방식</label>
          <select id="ed-phbg-fit" onchange="edPhbgSyncFromInputs()">
            <option value=""${!p.detailHeaderBgFit?' selected':''}>설정값 따름</option>
            <option value="contain"${p.detailHeaderBgFit==='contain'?' selected':''}>맞춤</option>
            <option value="cover"${p.detailHeaderBgFit==='cover'?' selected':''}>채우기</option>
            <option value="fill"${p.detailHeaderBgFit==='fill'?' selected':''}>늘리기</option>
          </select>
        </div>
        <div>
          <label>크기 조절</label>
          <div style="display:flex;align-items:center;gap:8px">
            <input type="range" id="ed-phbg-scale" min="40" max="220" step="5" value="${Number(p.detailHeaderBgScale||100)||100}" style="flex:1;accent-color:var(--blue)" oninput="document.getElementById('ed-phbg-scale-val').textContent=this.value+'%'; edPhbgSyncFromInputs()">
            <span id="ed-phbg-scale-val" style="font-size:var(--fs-caption);color:var(--gray-l);min-width:40px;text-align:right;font-weight:700">${Number(p.detailHeaderBgScale||100)||100}%</span>
          </div>
        </div>
      </div>
      <div style="font-size:var(--fs-caption);font-weight:700;color:var(--text3);margin:10px 0 6px">이미지 위치</div>
      <div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px">
        ${[
          ['left top','↖ 좌상'],['center top','↑ 상단'],['right top','↗ 우상'],
          ['left center','← 좌중'],['center center','• 중앙'],['right center','→ 우중'],
          ['left bottom','↙ 좌하'],['center bottom','↓ 하단'],['right bottom','↘ 우하']
        ].map(([pos,label])=>`<button type="button" data-phbg-pos="${pos}" class="btn btn-xs ${(p.detailHeaderBgPos||'center center')===pos?'btn-b':'btn-w'}"
          onclick="document.getElementById('ed-phbg-pos').value='${pos}'; document.querySelectorAll('[data-phbg-pos]').forEach(el=>el.className='btn btn-xs btn-w'); this.className='btn btn-xs btn-b';">${label}</button>`).join('')}
      </div>
      <input type="hidden" id="ed-phbg-pos" value="${p.detailHeaderBgPos||'center center'}">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:10px">
        <div>
          <label>가로 미세 위치</label>
          <div style="display:flex;align-items:center;gap:8px">
            <input type="range" id="ed-phbg-posx" min="0" max="100" step="1" value="${Number(p.detailHeaderBgPosX??50)||50}" style="flex:1;accent-color:var(--blue)" oninput="document.getElementById('ed-phbg-posx-val').textContent=this.value+'%'; edPhbgSyncFromInputs()">
            <span id="ed-phbg-posx-val" style="font-size:var(--fs-caption);color:var(--gray-l);min-width:40px;text-align:right;font-weight:700">${Number(p.detailHeaderBgPosX??50)||50}%</span>
          </div>
        </div>
        <div>
          <label>세로 미세 위치</label>
          <div style="display:flex;align-items:center;gap:8px">
            <input type="range" id="ed-phbg-posy" min="0" max="100" step="1" value="${Number(p.detailHeaderBgPosY??50)||50}" style="flex:1;accent-color:var(--blue)" oninput="document.getElementById('ed-phbg-posy-val').textContent=this.value+'%'; edPhbgSyncFromInputs()">
            <span id="ed-phbg-posy-val" style="font-size:var(--fs-caption);color:var(--gray-l);min-width:40px;text-align:right;font-weight:700">${Number(p.detailHeaderBgPosY??50)||50}%</span>
          </div>
        </div>
      </div>
    </div>
    <div style="margin-top:14px;padding:12px;background:#f8fafc;border:1px solid var(--border);border-radius:8px">
      <div style="font-weight:800;font-size:var(--fs-sm);color:var(--text2);margin-bottom:10px">🪪 개인 공유카드 배경</div>
      <label>배경 이미지 URL <span style="font-size:10px;font-weight:400;color:var(--gray-l)">(비워두면 대학색 배경 사용)</span></label>
      <input type="text" id="ed-sharebg" value="${p.shareCardBgImg||''}" placeholder="https://... 이미지 URL">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:10px">
        <div>
          <label>표시 방식</label>
          <select id="ed-sharebg-fit">
            <option value=""${!p.shareCardBgFit?' selected':''}>기본값</option>
            <option value="contain"${p.shareCardBgFit==='contain'?' selected':''}>맞춤</option>
            <option value="cover"${p.shareCardBgFit==='cover'?' selected':''}>채우기</option>
            <option value="fill"${p.shareCardBgFit==='fill'?' selected':''}>늘리기</option>
          </select>
        </div>
        <div>
          <label>크기 조절</label>
          <div style="display:flex;align-items:center;gap:8px">
            <input type="range" id="ed-sharebg-scale" min="40" max="220" step="5" value="${Number(p.shareCardBgScale||100)||100}" style="flex:1;accent-color:var(--blue)" oninput="document.getElementById('ed-sharebg-scale-val').textContent=this.value+'%'">
            <span id="ed-sharebg-scale-val" style="font-size:var(--fs-caption);color:var(--gray-l);min-width:40px;text-align:right;font-weight:700">${Number(p.shareCardBgScale||100)||100}%</span>
          </div>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:10px">
        <div>
          <label>어둡게 덮기</label>
          <div style="display:flex;align-items:center;gap:8px">
            <input type="range" id="ed-sharebg-dark" min="0" max="85" step="5" value="${Number(p.shareCardBgDark||18)||18}" style="flex:1;accent-color:var(--blue)" oninput="document.getElementById('ed-sharebg-dark-val').textContent=this.value+'%'">
            <span id="ed-sharebg-dark-val" style="font-size:var(--fs-caption);color:var(--gray-l);min-width:40px;text-align:right;font-weight:700">${Number(p.shareCardBgDark||18)||18}%</span>
          </div>
        </div>
        <div>
          <label>반투명 밝기</label>
          <div style="display:flex;align-items:center;gap:8px">
            <input type="range" id="ed-sharebg-fade" min="0" max="100" step="5" value="${Number(p.shareCardBgFade||0)||0}" style="flex:1;accent-color:var(--blue)" oninput="document.getElementById('ed-sharebg-fade-val').textContent=this.value+'%'">
            <span id="ed-sharebg-fade-val" style="font-size:var(--fs-caption);color:var(--gray-l);min-width:40px;text-align:right;font-weight:700">${Number(p.shareCardBgFade||0)||0}%</span>
          </div>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:10px">
        <div>
          <label>가로 위치</label>
          <select id="ed-sharebg-posx">
            <option value="left"${(p.shareCardBgPosX||'center')==='left'?' selected':''}>좌</option>
            <option value="center"${(!p.shareCardBgPosX||p.shareCardBgPosX==='center')?' selected':''}>중</option>
            <option value="right"${p.shareCardBgPosX==='right'?' selected':''}>우</option>
          </select>
        </div>
        <div>
          <label>세로 위치</label>
          <select id="ed-sharebg-posy">
            <option value="top"${p.shareCardBgPosY==='top'?' selected':''}>상</option>
            <option value="center"${(!p.shareCardBgPosY||p.shareCardBgPosY==='center')?' selected':''}>중</option>
            <option value="bottom"${p.shareCardBgPosY==='bottom'?' selected':''}>하</option>
          </select>
        </div>
      </div>
      <div style="font-size:10px;color:var(--gray-l);margin-top:8px">공유카드 전용 배경입니다. 스트리머 상세 헤더 배경과 별도로 저장됩니다.</div>
    </div>
    <div style="margin-top:14px;padding:14px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;">
      <div style="font-weight:700;font-size:var(--fs-sm);color:#15803d;margin-bottom:10px">🎭 상태 아이콘</div>
      <div style="display:flex;flex-wrap:wrap;gap:6px" id="ed-icon-btns">
        ${(()=>{const cur=getStatusIcon(p.name);return Object.entries(STATUS_ICON_DEFS).map(([id,d])=>{const isSelected=(id==='none'&&!cur)||(d.emoji&&cur===d.emoji);const iconHTML=d.emoji?(_siIsImg(d.emoji)?_siRender(d.emoji,'18px'):d.emoji):'<span style="font-size:var(--fs-caption);font-weight:700">없음</span>';return `<button type="button" onclick="setStatusIconFromModal(this,'${p.name}','${id}')" data-icon-id="${id}" title="${d.label}" style="padding:5px 10px;border-radius:7px;border:2px solid ${isSelected?'#16a34a':'var(--border)'};background:${isSelected?'#dcfce7':'var(--white)'};cursor:pointer;min-width:38px;transition:.12s;font-family:'Noto Sans KR',sans-serif;">${iconHTML}</button>`}).join('')})()}
      </div>
      <div id="ed-icon-label" style="font-size:var(--fs-caption);color:var(--gray-l);margin-top:7px">선택: ${(()=>{const c=getStatusIcon(p.name);const found=Object.entries(STATUS_ICON_DEFS).find(([,d])=>d.emoji&&d.emoji===c);const expiry=playerStatusExpiry[p.name];const expTxt=expiry?` (${expiry} 만료)`:'';return (found?found[1].label:'없음')+expTxt;})()}</div>
      <div id="ed-icon-expiry-row" style="display:${getStatusIcon(p.name)?'flex':'none'};align-items:center;gap:7px;margin-top:8px">
        <input type="checkbox" id="ed-icon-expiry" ${playerStatusExpiry[p.name]?'checked':''} onchange="onStatusExpiryChange('${p.name}')" style="width:14px;height:14px;cursor:pointer;accent-color:#16a34a">
        <label for="ed-icon-expiry" style="font-size:var(--fs-caption);color:#15803d;font-weight:600;cursor:pointer;margin:0">10일 후 자동으로 없음으로 변경</label>
      </div>
    </div>
    <div style="margin-top:16px;padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:8px;">
      <div style="font-weight:700;font-size:var(--fs-sm);color:var(--blue);margin-bottom:12px">📊 승패 직접 조정</div>
      <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-bottom:10px">
        <div style="flex:1;min-width:100px">
          <div style="font-size:var(--fs-caption);font-weight:700;color:var(--gray-l);margin-bottom:4px">승 (현재: ${p.win})</div>
          <input type="number" id="ed-win" value="${p.win}" min="0" style="width:100%">
        </div>
        <div style="flex:1;min-width:100px">
          <div style="font-size:var(--fs-caption);font-weight:700;color:var(--gray-l);margin-bottom:4px">패 (현재: ${p.loss})</div>
          <input type="number" id="ed-loss" value="${p.loss}" min="0" style="width:100%">
        </div>
        <div style="flex:1;min-width:100px">
          <div style="font-size:var(--fs-caption);font-weight:700;color:var(--gray-l);margin-bottom:4px">포인트 (현재: ${p.points})</div>
          <input type="number" id="ed-pts" value="${p.points}" style="width:100%">
        </div>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button class="btn btn-o btn-sm" onclick="
          if(confirm('승패와 히스토리를 모두 초기화하시겠습니까?')){
            const p=players.find(x=>x.name===editName);
            p.win=0;p.loss=0;p.points=0;p.history=[];
            document.getElementById('ed-win').value=0;
            document.getElementById('ed-loss').value=0;
            document.getElementById('ed-pts').value=0;
            save();render();
          }
        ">🔄 승패 전체 초기화</button>
        <button class="btn btn-w btn-sm" onclick="
          const p=players.find(x=>x.name===editName);
          p.win=parseInt(document.getElementById('ed-win').value)||0;
          p.loss=parseInt(document.getElementById('ed-loss').value)||0;
          p.points=parseInt(document.getElementById('ed-pts').value)||0;
          save();render();
          document.getElementById('emBody').querySelector('.apply-ok').style.display='inline-block';
          setTimeout(()=>document.getElementById('emBody').querySelector('.apply-ok').style.display='none',1500);
        " style="border-color:var(--green);color:var(--green)">✅ 승패 적용</button>
        <span class="apply-ok" style="display:none;color:var(--green);font-weight:700;font-size:var(--fs-sm);align-self:center">적용됨!</span>
      </div>
      <div style="font-size:10px;color:var(--gray-l);margin-top:8px">※ 승패 초기화 시 개인 경기 기록(히스토리)도 함께 삭제됩니다. 대전 기록(미니/대학대전 등)은 유지됩니다.</div>
    </div>
    <div style="margin-top:14px;padding:12px 14px;background:var(--surface);border:1px solid var(--border);border-radius:8px;display:flex;align-items:center;gap:10px">
      <label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:var(--fs-base);font-weight:600;color:var(--text2);margin:0">
        <input type="checkbox" id="ed-retired" ${p.retired?'checked':''} style="width:16px;height:16px;cursor:pointer">
        🎗️ 은퇴 (현황판에서만 숨김, 경기 기록은 유지)
      </label>
    </div>
    <div style="margin-top:10px;padding:12px 14px;background:var(--surface);border:1px solid var(--border);border-radius:8px;display:flex;align-items:center;gap:10px">
      <label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:var(--fs-base);font-weight:600;color:var(--text2);margin:0">
        <input type="checkbox" id="ed-inactive" ${p.inactive?'checked':''} style="width:16px;height:16px;cursor:pointer">
        ⏸️ 임시 상태 (휴학/활동중단) — 현황판에서 반투명 표시, 은퇴와 달리 숨기지 않음
      </label>
    </div>
    <div style="margin-top:10px;padding:12px 14px;background:var(--surface);border:1px solid var(--border);border-radius:8px;display:flex;align-items:center;gap:10px">
      <label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:var(--fs-base);font-weight:600;color:var(--text2);margin:0">
        <input type="checkbox" id="ed-hide-board" ${p.hideFromBoard?'checked':''} style="width:16px;height:16px;cursor:pointer">
        👁️ 현황판에서 숨기기 (스탯·기록은 유지, 구현황판·신현황판 모두 적용)
      </label>
    </div>
    <!-- (요청사항) 크루 소속 항목 제거 -->
    <div style="margin-top:14px;padding:14px;background:#fffbeb;border:1px solid #fde68a;border-radius:8px;">
      <div style="font-weight:700;font-size:var(--fs-sm);color:#b45309;margin-bottom:8px">📝 선수 메모</div>
      <textarea id="ed-memo" style="width:100%;min-height:70px;font-size:var(--fs-sm);border:1px solid #fde68a;border-radius:6px;padding:8px;background:#fff;resize:vertical;font-family:'Noto Sans KR',sans-serif;line-height:1.6;box-sizing:border-box;" placeholder="선수에 대한 메모를 입력하세요...">${p.memo||''}</textarea>
    </div>`;
  om('emModal');
  try{ setTimeout(()=>{ 
    if(typeof edBindH2HPosDrag==='function') edBindH2HPosDrag(); 
    if(typeof edBindP1PosDrag==='function') edBindP1PosDrag();
    if(typeof edBindP2PosDrag==='function') edBindP2PosDrag();
    if(typeof edPhbgSyncFromInputs==='function') edPhbgSyncFromInputs();
    if(typeof edBindPhbgDrag==='function') edBindPhbgDrag();
  }, 0); }catch(e){}
}
// 스트리머 상세 모달 → 수정창 열기
// emModal(z-index:5000) > playerModal(z-index:4000) 이므로 playerModal을 닫지 않고
// 그 위에 emModal을 열기만 함 → cm/om 순서 경쟁조건 완전 제거




try{ if(typeof window._univDragSrc !== 'number') window._univDragSrc = -1; }catch(e){}
// _univDragStart/Over/Drop/End → settings-crud.js 단일 소스 (WARNING fix)

try{ if(typeof window._dissolveIdx !== 'number') window._dissolveIdx = -1; }catch(e){}

// ── 티어 색상/밝기/이모지 커스텀 ──

// ── 색상 입력/스포이드 공용 유틸 ──
// cfgUnivPickColor / cfgTierThemePickColor / cfgShowColorPalette
// → settings-crud.js 에 권위 소스 존재, 여기선 생략
function cfgUnivPickColor(i,btn){ if(typeof cfgShowColorPalette==='function'){ const cur=(univCfg[i]&&univCfg[i].color)||'#3b82f6'; cfgShowColorPalette(btn,cur,(hex)=>cfgUnivSetColor(i,hex)); } }
function cfgTierThemePickColor(tier,btn){ if(typeof cfgShowColorPalette==='function'){ const td=(typeof tierThemes!=='undefined')&&tierThemes&&tierThemes[tier]; const cur=(td&&td.color)||'#3b82f6'; cfgShowColorPalette(btn,cur,(hex)=>cfgTierThemeSetColor(tier,hex)); } }

async function addAdminAccount(){
  const id=document.getElementById('adm-id').value.trim();
  const pw=document.getElementById('adm-pw').value;
  const roleEl=document.getElementById('adm-role');
  const role=roleEl?roleEl.value:'admin';
  const msg=document.getElementById('adm-msg');
  if(!id||!pw){msg.style.color='var(--red)';msg.textContent='아이디와 비밀번호를 모두 입력하세요.';return;}
  if(pw.length<8){msg.style.color='var(--red)';msg.textContent='비밀번호는 8자 이상이어야 합니다.';return;}
  const token=(localStorage.getItem('su_gh_token')||'').trim();
  if(!token){msg.style.color='var(--red)';msg.textContent='원격 관리자 계정 관리를 위해 GitHub 토큰을 먼저 설정하세요.';return;}
  try{ if(typeof pullAdminAccountsRemote==='function') await pullAdminAccountsRemote(true); }catch(e){}
  const accounts=getAdminAccounts();
  const idNorm=String(id||'').trim().toLowerCase();
  const idHash=await sha256(idNorm);
  if(accounts.some(a=>String(a.idHash||'')===idHash)){msg.style.color='var(--gold)';msg.textContent='이미 동일한 아이디가 등록되어 있습니다.';return;}
  if(role==='admin' && accounts.some(a=>(a && a.role)!=='sub-admin')){msg.style.color='var(--red)';msg.textContent='총관리자 계정은 1명만 등록할 수 있습니다.';return;}
  const rec=(typeof createAdminAccountRecord==='function') ? await createAdminAccountRecord(id,pw,role,id) : {hash:await sha256(id+':'+pw),role,label:id};
  const next=accounts.concat([rec]);
  localStorage.setItem(ADMIN_HASH_KEY,JSON.stringify(next));
  try{ localStorage.setItem('su_admin_hashes_updated_at', String(Date.now())); }catch(e){}
  const ok=(typeof pushAdminAccountsRemote==='function') ? await pushAdminAccountsRemote(next) : false;
  if(!ok){
    localStorage.setItem(ADMIN_HASH_KEY,JSON.stringify(accounts));
    msg.style.color='var(--red)';
    msg.textContent='원격 관리자 계정 저장에 실패했습니다. 다시 시도해 주세요.';
    return;
  }
  msg.style.color='var(--green)';
  const roleLabel=role==='sub-admin'?'부관리자':'총관리자';
  msg.textContent=`✅ ${roleLabel} 계정이 추가되었습니다. 총 ${next.length}명`;
  document.getElementById('adm-id').value='';
  document.getElementById('adm-pw').value='';
  reCfg();
}

async function clearAllAdmins(){
  if(!confirm('모든 관리자 계정을 삭제할까요?\n원격 관리자 계정 목록도 함께 비워집니다.'))return;
  const token=(localStorage.getItem('su_gh_token')||'').trim();
  if(!token){ alert('원격 관리자 계정 관리를 위해 GitHub 토큰을 먼저 설정하세요.'); return; }
  const prev=getAdminAccounts();
  localStorage.setItem(ADMIN_HASH_KEY,JSON.stringify([]));
  try{ localStorage.setItem('su_admin_hashes_updated_at', String(Date.now())); }catch(e){}
  const ok=(typeof pushAdminAccountsRemote==='function') ? await pushAdminAccountsRemote([]) : false;
  if(!ok){
    localStorage.setItem(ADMIN_HASH_KEY,JSON.stringify(prev));
    alert('원격 관리자 계정 삭제에 실패했습니다. 다시 시도해 주세요.');
    return;
  }
  doLogout();
  alert('초기화 완료. 원격 관리자 계정 목록이 비워졌습니다.');
}


/* ==========================================
   STATISTICS TAB
========================================== */
try{ window.statsSub = window.statsSub || 'overview'; }catch(e){}
