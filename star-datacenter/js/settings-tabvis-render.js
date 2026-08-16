/* ══════════════════════════════════════════════════════════════
   설정 - 🧷 탭/모드 표시 관리 (js/tab-visibility.js의 TabVis 저장소를 사용)
   트리(탭>하위탭>모드) + 대전기록/대회/프로리그대회 보기모드 목록에
   PC/모바일 노출 스위치를 렌더. OFF면 비로그인 사용자에게 숨김.
   ══════════════════════════════════════════════════════════════ */

const _TV_KIND_META = {
  sub:  { label: '하위탭',      bg: '#64748b' },
  sub2: { label: '하위의하위탭', bg: '#94a3b8' },
  mode: { label: '모드',        bg: '#7c3aed' },
};

// 노출 ON/OFF 토글 스위치 (체크박스를 시각적으로 스위치처럼 보이게 렌더)
function _tvSwitch(checked, onchange, title){
  return `<label style="position:relative;display:inline-flex;align-items:center;cursor:pointer;flex-shrink:0" title="${title||''}">
    <input type="checkbox" style="position:absolute;inset:0;opacity:0;margin:0;cursor:pointer;z-index:1" ${checked?'checked':''} onchange="${onchange}">
    <span style="width:32px;height:19px;border-radius:999px;background:${checked?'var(--blue,#2563eb)':'var(--border2,#cbd5e1)'};transition:background .15s;display:inline-block;position:relative;flex-shrink:0;box-shadow:inset 0 1px 2px rgba(0,0,0,.12)">
      <span style="position:absolute;top:2px;left:${checked?'15px':'2px'};width:15px;height:15px;border-radius:50%;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.35);transition:left .15s"></span>
    </span>
  </label>`;
}

function _tvPlatformToggles(key, st){
  return `
    <div style="display:flex;align-items:center;gap:5px" title="PC 노출">
      <span style="font-size:12px;line-height:1;opacity:.75">🖥️</span>
      ${_tvSwitch(st.pc, `TabVis.setState('${key}',{pc:this.checked})`, 'PC에서 노출')}
    </div>
    <div style="display:flex;align-items:center;gap:5px" title="모바일 노출">
      <span style="font-size:12px;line-height:1;opacity:.75">📱</span>
      ${_tvSwitch(st.mobile, `TabVis.setState('${key}',{mobile:this.checked})`, '모바일에서 노출')}
    </div>`;
}

function _tvRow(key, label, depth, kindTag){
  const st = (window.TabVis && typeof window.TabVis.getState==='function') ? window.TabVis.getState(key) : {pc:1,mobile:1};
  const meta = _TV_KIND_META[kindTag] || null;
  const kindBadge = meta ? `<span style="flex-shrink:0;font-size:9.5px;font-weight:800;color:#fff;padding:2px 7px;border-radius:20px;background:${meta.bg};margin-left:7px;letter-spacing:.2px;white-space:nowrap">${meta.label}</span>` : '';
  const isOff = !st.pc || !st.mobile;
  return `
    <div data-tv-row data-tv-label="${String(label).replace(/"/g,'&quot;')}" style="display:flex;align-items:center;gap:8px;padding:8px 12px 8px ${12+depth*20}px;${depth>0?`border-left:2px solid var(--border);margin-left:${6+(depth-1)*20}px`:''};border-bottom:1px solid var(--border);${isOff?'background:color-mix(in srgb, var(--red,#ef4444) 5%, transparent)':''}">
      <div style="flex:1;min-width:0;font-size:var(--fs-sm);font-weight:${depth===0?'900':'700'};display:flex;align-items:center;white-space:nowrap;overflow:hidden">
        <span style="overflow:hidden;text-overflow:ellipsis">${label}</span>${kindBadge}
      </div>
      ${_tvPlatformToggles(key, st)}
    </div>`;
}

function _tvKindOf(node, depth){
  if(depth===0) return '';
  return node.kind==='sub' ? 'sub' : node.kind==='sub2' ? 'sub2' : node.kind==='mode' ? 'mode' : '';
}

function _tvTreeHTML(nodes, depth){
  depth = depth || 0;
  return (nodes||[]).map(n=>{
    // 구분선(그룹 라벨) — 토글이 없는 순수 표시용 행. 하위탭이 많은 탭(통계/룰렛 등)을
    // 카테고리별로 시각적으로 나눠서 스크롤/스캔하기 쉽게 하기 위해 사용.
    if(n.kind==='divider'){
      return `<div data-tv-divider style="padding:8px 12px 4px ${12+depth*20}px;font-size:10.5px;font-weight:800;color:var(--gray-l);letter-spacing:.3px;background:var(--surface2,rgba(148,163,184,.06))">${n.label}</div>`;
    }
    return _tvRow(n.key, n.label, depth, _tvKindOf(n, depth)) + (n.children ? _tvTreeHTML(n.children, depth+1) : '');
  }).join('');
}

// 대전기록/대회/프로리그대회 공통 보기모드 시스템(_histTabAltAllowedModes)에서
// 실제로 사용 중인 탭ID + 허용 모드 목록을 그대로 읽어와 목록을 만든다.
// category: 이 보기모드가 실제로 노출되는 상단 메인탭 키(TabVis TREE의 'main.xxx'에서 'main.' 접두사를 뗀 값)
//   와 매칭시켜, 설정 화면에서 해당 메인탭 카드 하위에 함께 묶어 보여준다.
function _tvModeGroups(){
  const MODE_LABEL = { card:'🗂 기본', basic:'🗂 기본', mini:'🗂 미니 기본', grid:'🖼 그리드', compact:'📊 컴팩트 테이블형', broadcast:'📺 방송형' };
  const groups = [];
  groups.push({ id:'all', category:'hist', label:'대전기록 › 종합〉전체 통합', modes:['card','grid','compact','broadcast'] });
  const tabDefs = [
    // ── 🗂️ 대전 기록 탭 (종합 통합보기 안의 대회/티어대회 기록 서브탭 포함) ──
    ['histtourney','hist','대전기록 › 대회 기록보기'],
    ['histtt','hist','대전기록 › 티어대회 기록보기'],
    // ── ⚔️ 개인전/끝장전 탭 ──
    ['ind','ind','개인전/끝장전 › 개인전'],
    ['gj','ind','개인전/끝장전 › 끝장전'],
    ['progj','ind','개인전/끝장전 › 프로리그 끝장전'],
    // ── 🏟️ 대학전 탭 (미니대전/시빌워/대학CK 입력 + 대학대전 기록보기) ──
    ['mini','univm','대학전 › 미니대전 입력'],
    ['civil','univm','대학전 › 시빌워 입력'],
    ['ck','univm','대학전 › 대학CK 입력'],
    ['univm','univm','대학전 › 대학대전 기록보기'],
    // ── 🏆 대회/티어 탭 (일반대회 조별리그·대진표·일반경기 + 티어대회 기록) ──
    ['cpleague','comp','대회/티어 › 일반대회 조별리그'],
    ['cpbkt','comp','대회/티어 › 일반대회 대진표'],
    ['cpnormal','comp','대회/티어 › 일반대회 일반경기'],
    ['ttbktrecords','comp','대회/티어 › 티어대회 토너먼트 기록'],
    ['ttgrprecords','comp','대회/티어 › 티어대회 조별리그 기록'],
    ['ttrecords','comp','대회/티어 › 티어대회 일반 기록'],
    // ── 🥇 프로리그 탭 (프로리그 일반 기록보기 + 프로리그대회 조별리그·대진표·팀전·중장전) ──
    ['pro','pro','프로리그 › 프로리그(일반) 기록보기'],
    ['pcleague','pro','프로리그 › 프로리그대회 조별리그'],
    ['pctourmatch','pro','프로리그 › 프로리그대회 대진표 기록'],
    ['pcteam','pro','프로리그 › 프로리그대회 팀전'],
    ['pcgj','pro','프로리그 › 프로리그대회 중장전'],
  ];
  tabDefs.forEach(([id,category,label])=>{
    const modes = (typeof _histTabAltAllowedModes==='function') ? _histTabAllowedModesSafe(id) : ['basic','mini','grid','compact','broadcast'];
    groups.push({ id, category, label, modes });
  });
  return groups.map(g=>({ ...g, modeLabels: g.modes.map(m=>MODE_LABEL[m]||m) }));
}
// _histTabAltAllowedModes는 미등록 탭ID에 대해서도 기본 5종 모드를 반환하므로 그대로 호출.
function _histTabAllowedModesSafe(id){
  try { return _histTabAltAllowedModes(id); } catch(e){ return ['basic','mini','grid','compact','broadcast']; }
}

// 보기모드 그룹 1개 = 카드 1개(일괄 켜기/끄기 바 + 모드별 스위치 행)
function _tvModeGroupHTML(g){
  const keys = g.modes.map(mid=>'mode.'+g.id+'.'+mid);
  const keysJsLit = '[' + keys.map(k=>`'${k}'`).join(',') + ']'; // onclick 속성이 큰따옴표를 쓰므로 배열 리터럴은 작은따옴표로 직접 구성
  const pcAllOn = (window.TabVis && typeof window.TabVis.allOn==='function') ? window.TabVis.allOn(keys,'pc') : true;
  const moAllOn = (window.TabVis && typeof window.TabVis.allOn==='function') ? window.TabVis.allOn(keys,'mobile') : true;
  const rows = g.modes.map((mid,i)=> _tvRow('mode.'+g.id+'.'+mid, g.modeLabels[i], 1, 'mode')).join('');
  return `
    <div style="border:1px solid var(--border);border-radius:10px;overflow:hidden;background:var(--white)">
      <div style="display:flex;align-items:center;gap:8px;padding:7px 10px;background:var(--surface);border-bottom:1px solid var(--border)">
        <div style="flex:1;min-width:0;font-size:12.5px;font-weight:900;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${g.label}</div>
        <button type="button" class="btn btn-xs" onclick="TabVis.setMany(${keysJsLit},{pc:${pcAllOn?'false':'true'}})">🖥️ 전체 ${pcAllOn?'끄기':'켜기'}</button>
        <button type="button" class="btn btn-xs" onclick="TabVis.setMany(${keysJsLit},{mobile:${moAllOn?'false':'true'}})">📱 전체 ${moAllOn?'끄기':'켜기'}</button>
      </div>
      ${rows}
    </div>`;
}

// 메인탭 1개 = 카드 1개. 하위탭/모드(트리) + 보기모드 그룹을 모두 그 카드 안에 묶어서 보여준다.
// 하위 항목(트리 자식 또는 보기모드 그룹)이 하나도 없는 단순 메인탭은 접이식 없이 한 줄 카드로 표시.
// 노드 하위(트리 자식, divider 제외)의 실제 토글 개수와 그중 OFF(일부라도 숨김)된 개수를 센다.
// 카드 요약(summary)에 "N개 숨김" 배지로 보여줘서, 펼쳐보지 않아도 한눈에 상태를 파악할 수 있게 한다.
function _tvCountInfo(children){
  let total = 0, off = 0;
  const walk = (n) => {
    if(n.kind !== 'divider' && n.key){
      total++;
      const st = (window.TabVis && typeof window.TabVis.getState==='function') ? window.TabVis.getState(n.key) : {pc:1,mobile:1};
      if(!st.pc || !st.mobile) off++;
    }
    (n.children||[]).forEach(walk);
  };
  (children||[]).forEach(walk);
  return {total, off};
}

function _tvGroupCardHTML(node, modeGroups){
  const hasKids = !!(node.children && node.children.length);
  const hasModes = !!(modeGroups && modeGroups.length);
  if(!hasKids && !hasModes){
    return `<div data-tv-cat="${node.key}" style="border:1px solid var(--border);border-radius:12px;overflow:hidden;background:var(--white)">${_tvRow(node.key, node.label, 0, '')}</div>`;
  }
  const bulkBar = hasKids ? (()=>{
    const pcAllOn = window.TabVis.groupAllOn(node.key,'pc');
    const moAllOn = window.TabVis.groupAllOn(node.key,'mobile');
    return `<div style="display:flex;align-items:center;gap:6px;padding:6px 12px;background:var(--surface2,rgba(148,163,184,.08));border-bottom:1px solid var(--border)">
      <span style="font-size:10px;font-weight:800;color:var(--gray-l);flex:1">↳ 이 탭의 하위 항목 일괄 설정</span>
      <button type="button" class="btn btn-xs" onclick="TabVis.setGroup('${node.key}',{pc:${pcAllOn?'false':'true'}})">🖥️ 하위 전체 ${pcAllOn?'끄기':'켜기'}</button>
      <button type="button" class="btn btn-xs" onclick="TabVis.setGroup('${node.key}',{mobile:${moAllOn?'false':'true'}})">📱 하위 전체 ${moAllOn?'끄기':'켜기'}</button>
    </div>`;
  })() : '';
  const modesHTML = hasModes ? `
    <div style="padding:10px;background:var(--surface2,rgba(148,163,184,.05));border-top:1px solid var(--border)">
      <div style="font-size:10px;font-weight:800;color:var(--gray-l);margin-bottom:8px">↳ 이 탭의 보기모드별 표시 설정</div>
      <div style="display:flex;flex-direction:column;gap:8px">${modeGroups.map(_tvModeGroupHTML).join('')}</div>
    </div>` : '';
  const _kidCnt = _tvCountInfo(node.children);
  let itemCount = _kidCnt.total, offCount = _kidCnt.off;
  (modeGroups||[]).forEach(g=>{
    g.modes.forEach(mid=>{
      itemCount++;
      const st = window.TabVis.getState('mode.'+g.id+'.'+mid);
      if(!st.pc || !st.mobile) offCount++;
    });
  });
  const offBadge = offCount>0 ? `<span style="flex-shrink:0;font-size:9.5px;font-weight:800;color:#fff;padding:2px 7px;border-radius:20px;background:var(--red,#ef4444);white-space:nowrap">🔸${offCount}개 숨김</span>` : '';
  return `
    <details data-tv-cat="${node.key}" style="border:1px solid var(--border);border-radius:12px;overflow:hidden;background:var(--white)">
      <summary style="cursor:pointer;padding:9px 12px;background:var(--surface);font-weight:900;font-size:var(--fs-sm);display:flex;align-items:center;gap:6px">
        <span style="flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${node.label}</span>
        ${offBadge}
        <span style="flex-shrink:0;font-size:10.5px;font-weight:700;color:var(--gray-l)">하위 ${itemCount}개 ›</span>
      </summary>
      ${_tvRow(node.key, node.label, 0, '')}
      ${bulkBar}
      ${hasKids ? _tvTreeHTML(node.children, 1) : ''}
      ${modesHTML}
    </details>`;
}

// 메인탭 순서대로(TabVis.TREE 기준) 카드를 나열하고, 대전기록류 보기모드 그룹은
// 관련된 메인탭 카드 안에 자동으로 묶어 넣는다. → 탭별 카테고리 구분으로 찾기 쉬움.
function _tvCategorizedCardsHTML(){
  const _tree = (window.TabVis && window.TabVis.TREE) ? window.TabVis.TREE : [];
  const _modeGroups = _tvModeGroups();
  const _byCategory = {};
  _modeGroups.forEach(g=>{ (_byCategory[g.category] = _byCategory[g.category] || []).push(g); });
  const cards = _tree.map(node=>{
    const catId = String(node.key||'').replace(/^main\./,'');
    const modeGroups = _byCategory[catId] || null;
    return _tvGroupCardHTML(node, modeGroups);
  });
  // 혹시 TREE에 등록되지 않은 메인탭에 매칭되는 보기모드 그룹이 남아있으면(향후 확장 대비) 별도 카드로 표시
  const _knownCats = new Set(_tree.map(n=>String(n.key||'').replace(/^main\./,'')));
  const _orphanCats = Object.keys(_byCategory).filter(c=>!_knownCats.has(c));
  _orphanCats.forEach(c=>{
    cards.push(`<div data-tv-cat="etc.${c}" style="border:1px solid var(--border);border-radius:12px;overflow:hidden;background:var(--white)">
      <div style="padding:9px 12px;background:var(--surface);font-weight:900;font-size:var(--fs-sm)">🧩 기타(${c})</div>
      <div style="padding:10px;display:flex;flex-direction:column;gap:8px">${_byCategory[c].map(_tvModeGroupHTML).join('')}</div>
    </div>`);
  });
  return `<div style="display:flex;flex-direction:column;gap:8px">${cards.join('')}</div>`;
}

function _cfgTabVisSectionHTML(){
  return `${_scfgD('tabvis','🧷 탭/모드 표시 관리(비로그인 숨김)')}
    <div style="font-size:var(--fs-sm);color:var(--gray-l);margin-bottom:4px">
      OFF(회색)로 끈 항목은 <b>로그인하지 않은 사용자</b>에게는 버튼 자체가 완전히 사라집니다. 로그인(관리자)한 상태에서는 항상 평소처럼 보입니다.
    </div>
    <div style="display:flex;align-items:center;gap:10px;font-size:11px;color:var(--gray-l);margin-bottom:8px;padding:6px 10px;background:var(--surface2,rgba(148,163,184,.08));border-radius:8px">
      <span>🖥️ = PC 화면 노출</span><span>·</span><span>📱 = 모바일 화면 노출</span><span>·</span><span>빨간 배경 행 = 일부 OFF됨</span>
    </div>
    <div style="margin-bottom:12px;position:relative">
      <input id="tvSearchInput" type="text" placeholder="🔎 탭/모드 이름으로 찾기 (예: 방송형, 라인업, 대진표...)" oninput="_tvFilter(this.value)"
        style="width:100%;box-sizing:border-box;padding:8px 34px 8px 12px;border:1px solid var(--border);border-radius:8px;font-size:var(--fs-sm);background:var(--white);color:var(--fg)">
      <button type="button" onclick="const i=document.getElementById('tvSearchInput');i.value='';_tvFilter('');i.focus()" title="검색어 지우기"
        style="position:absolute;right:6px;top:50%;transform:translateY(-50%);border:none;background:transparent;color:var(--gray-l);cursor:pointer;font-size:14px;line-height:1;padding:4px">✕</button>
    </div>
    <div style="font-size:11px;color:var(--gray-l);margin-bottom:8px">📌 상단탭 별로 묶여 있습니다. 탭 이름을 눌러 펼치면 하위탭·모드별 표시 설정이 나옵니다.</div>
    <div id="tvNoResults" style="display:none;padding:20px 12px;text-align:center;color:var(--gray-l);font-size:var(--fs-sm);border:1px dashed var(--border);border-radius:12px">🔎 검색 결과가 없습니다.</div>
    <div id="tvCardsWrap" style="display:flex;flex-direction:column;gap:14px">
      ${_tvCategorizedCardsHTML()}
      <div style="display:flex;gap:8px;flex-wrap:wrap;padding-top:2px">
        <button class="btn btn-w" onclick="if(confirm('탭/모드 표시 설정을 모두 초기화할까요?')){TabVis.resetAll();try{if(typeof showToast==='function')showToast('초기화 완료');}catch(e){}}">🔄 전체 초기화(모두 표시)</button>
      </div>
    </div>
  </details>`;
}

// 검색창 입력 시 라벨이 일치하지 않는 행은 숨기고, 일치하는 행이 있는 카드는 자동으로 펼쳐서 보여준다.
// 구분선(카테고리 라벨)은 그 아래(다음 구분선 전까지) 보이는 행이 하나도 없으면 함께 숨긴다.
function _tvFilter(q){
  q = String(q||'').trim().toLowerCase();
  try{
    let anyCardVisible = false;
    document.querySelectorAll('[data-tv-cat]').forEach(catEl=>{
      let anyVisible = false;
      catEl.querySelectorAll('[data-tv-row]').forEach(rowEl=>{
        const label = (rowEl.getAttribute('data-tv-label')||'').toLowerCase();
        const match = !q || label.includes(q);
        rowEl.style.display = match ? '' : 'none';
        if(match) anyVisible = true;
      });
      let pendingDividers = [];
      let sawRowSincePending = false;
      const _flushPending = (visible)=>{ pendingDividers.forEach(d=>{ d.style.display = visible ? '' : 'none'; }); pendingDividers=[]; };
      catEl.querySelectorAll('[data-tv-divider],[data-tv-row]').forEach(el=>{
        if(el.hasAttribute('data-tv-divider')){
          _flushPending(sawRowSincePending);
          pendingDividers.push(el);
          sawRowSincePending = false;
        } else if(el.style.display !== 'none'){
          sawRowSincePending = true;
        }
      });
      _flushPending(sawRowSincePending);
      catEl.style.display = anyVisible ? '' : 'none';
      if(catEl.tagName === 'DETAILS' && q && anyVisible) catEl.open = true;
      if(anyVisible) anyCardVisible = true;
    });
    const _noRes = document.getElementById('tvNoResults');
    if(_noRes) _noRes.style.display = (q && !anyCardVisible) ? '' : 'none';
  }catch(e){}
}
