/* ══════════════════════════════════════════════════════════════
   룰렛 - GC 휠 설정/패널 렌더 (roulette.js 에서 분리, 2026-07-30)
   ══════════════════════════════════════════════════════════════ */

window._GC_DOME = 220;
window._GC_CAP_R = 17;

// ─────────────────────────────────────────────────────────────
// (요청사항) 룰렛 결과 팝업
// ─────────────────────────────────────────────────────────────
if (typeof window._rrShowPopup !== 'function') {
  window._rrShowPopup = function(title, bodyHTML){
    let m=document.getElementById('rrPopupModal');
    if(!m){
      m=document.createElement('div');
      m.id='rrPopupModal';
      m.className='modal no-export';
      m.style.cssText='display:none;z-index:9100;align-items:center;justify-content:center';
      m.addEventListener('click', (e)=>{ if(e && e.target===m) window._rrClosePopup(); });
      document.body.appendChild(m);
    }
    m.innerHTML = `
      <div class="mbox" style="width:min(520px,94vw);max-height:86vh;overflow:auto">
        <div class="mtitle" style="display:flex;align-items:center;justify-content:space-between;gap:10px">
          <span>${title||'결과'}</span>
          <button class="btn btn-w btn-xs" onclick="_rrClosePopup()">✕</button>
        </div>
        <div style="padding:10px 2px 4px">${bodyHTML||''}</div>
        <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:10px">
          <button class="btn btn-b btn-sm" onclick="_rrClosePopup()">확인</button>
        </div>
      </div>`;
    m.style.display='flex';
  };
  window._rrClosePopup = function(){
    const m=document.getElementById('rrPopupModal');
    if(m) m.style.display='none';
  };
}

// ─────────────────────────────────────────────────────────────
// (추가) 가중치/확률 파서
// 형식: "이름" 또는 "이름*2.5" (쉼표로 구분)
// - 같은 이름이 여러 번 나오면 가중치를 합산
// ─────────────────────────────────────────────────────────────
function _gcParseWeightedCSV(text){
  const raw = String(text||'');
  const tokens = raw.split(',').map(v=>v.trim()).filter(Boolean);
  const map = new Map();
  tokens.forEach(t=>{
    let name=t, w=1;
    const m=t.match(/^(.*?)(?:\*(\d+(?:\.\d+)?))$/);
    if(m){
      name=(m[1]||'').trim();
      const n=parseFloat(m[2]);
      if(!isNaN(n) && isFinite(n)) w=n;
    }
    if(!name) return;
    w=Math.max(0.01, Math.min(1000, w));
    map.set(name, (map.get(name)||0) + w);
  });
  const items=[...map.entries()].map(([name,weight])=>({name,weight}));
  const total=items.reduce((s,x)=>s+x.weight,0)||0;
  return {items,total};
}

function _gcPickWeighted(items,total){
  if(!items||!items.length) return null;
  if(!(total>0)) total = items.reduce((s,x)=>s+x.weight,0);
  let r=Math.random()*total;
  for(const it of items){
    r -= it.weight;
    if(r<=0) return it;
  }
  return items[items.length-1];
}

// ─── 연속 반복 방지 (두더지 게임과 동일한 방식) ──────────────────────────────
// 같은 이름(프로필)이 바로 다음 스핀에서 또 나오지 않도록 최근 결과를 기억해뒀다가 제외하고 뽑음.
const _GC_RECENT_AVOID = 1; // 최근 이만큼의 결과는 연속으로 다시 나오지 않음
let _gcRecentResults = { player: [], map: [] };

function _gcRememberRecent(histKey, name){
  if(!name) return;
  const bucket = histKey === 'player' ? 'player' : 'map';
  const cur = (_gcRecentResults[bucket] || []).filter(n => n !== name);
  _gcRecentResults[bucket] = [name, ...cur].slice(0, _GC_RECENT_AVOID);
}

function _gcPickWeightedAvoidRepeat(items, total, avoidNames){
  if(!items || !items.length) return null;
  const avoid = avoidNames || [];
  // 후보가 전부 회피 목록에 걸리면(항목이 1~2개뿐인 경우 등) 회피를 포기하고 그냥 뽑음
  const filtered = items.filter(it => !avoid.includes(it.name));
  if(!filtered.length) return _gcPickWeighted(items, total);
  const filteredTotal = filtered.reduce((s,x)=>s+x.weight,0);
  return _gcPickWeighted(filtered, filteredTotal);
}

const _GC_COLORS = [
  ['#FF80AB','#FF4081'],['#81D4FA','#29B6F6'],['#FFF176','#FFD600'],
  ['#B9F6CA','#00E676'],['#CE93D8','#AB47BC'],['#FFCC80','#FFA726'],
  ['#F48FB1','#EC407A'],['#80DEEA','#00BCD4'],['#FFAB91','#FF5722'],
];

function _gcFindPlayer(keyword) {
  if (typeof players === 'undefined') return null;
  return players.find(x => x.name === keyword)
    || players.find(x => x.name.includes(keyword))
    || players.find(x => keyword.includes(x.name));
}

function renderRoulettePanel(dome, capR, isWide, avW, avH) {
  dome   = dome  || window._GC_DOME;
  capR   = capR  || window._GC_CAP_R;
  isWide = isWide != null ? isWide : (window.innerWidth >= 700);
  avW    = avW   || window.innerWidth;
  avH    = avH   || window.innerHeight - 130;

  const isPlayer = _gcTab === 'player';
  const isLadder = _gcTab === 'ladder';
  const isDuck   = _gcTab === 'duck';
  const isWheel  = _gcTab === 'wheel';
  const isPpopgi = _gcTab === 'ppopgi';
  const isTeamSplit = _gcTab === 'teamsplit';
  const isBracket = _gcTab === 'bracket';
  const isTeamMatch = _gcTab === 'teammatch';
  const isTierMatch = _gcTab === 'tiermatch';
  const isQuiz = _gcTab === 'quiz';
  const isMemory = _gcTab === 'memory';
  const isMole = _gcTab === 'mole';
  const isOmok = _gcTab === 'omok';
  const isJanggi = _gcTab === 'janggi';
  const isOthello = _gcTab === 'othello';
  const savedText   = (!isLadder && !isDuck && !isWheel) ? (_rLsGet(isPlayer ? 'su_gc_p' : 'su_gc_m', '') || '') : '';
  const _w = _gcParseWeightedCSV(savedText);
  const activeItems = _w.items.map(x=>x.name);

  const ldNamesText = isLadder ? (_rLsGet('su_ld_names', '') || '') : '';
  const ldItemsText = isLadder ? (_rLsGet('su_ld_items', '') || '') : '';
  const ldNames     = ldNamesText.split(',').map(v=>v.trim()).filter(v=>v);

  // 모바일/태블릿에서 dome 기반 폰트가 과하게 커져 입력창이 "불편"해지는 문제 완화
  // - 입력창/버튼은 화면폭 기준으로 적당히 clamp
  const fs   = Math.max(12, Math.min(14, Math.round(dome * 0.065)));
  const fsLg = Math.max(14, Math.min(16, Math.round(dome * 0.072)));
  const pad  = Math.max(14, Math.round(dome * 0.085));
  const isCompactUI = avW <= 1024; // 모바일/태블릿
  const rowsGC = isWide ? 3 : 4;
  const rowsLd = isWide ? 2 : 3;
  const _tabMeta = {
    player: { kicker:'LUCKY DRAW', icon:'🎰', accent:'linear-gradient(135deg,#fb923c,#ef4444)', title:'구슬뽑기', desc:'스트리머 이름을 넣고 바로 뽑는 기본 룰렛입니다.', badge1:`항목 ${activeItems.length}개`, badge2:'가중치 지원' },
    map: { kicker:'LUCKY DRAW', icon:'🗺️', accent:'linear-gradient(135deg,#34d399,#0ea5e9)', title:'맵뽑기', desc:'등록된 맵을 빠르게 고르고 랜덤으로 추첨합니다.', badge1:`맵 ${activeItems.length}개`, badge2:'맵 배지 선택' },
    ladder: { kicker:'LUCKY DRAW', icon:'🪜', accent:'linear-gradient(135deg,#a78bfa,#6366f1)', title:'사다리', desc:'참가자와 결과 항목을 연결해서 재미있게 추첨합니다.', badge1:`참가자 ${ldNames.length}명`, badge2:'캔버스 추첨' },
    duck: { kicker:'LUCKY DRAW', icon:'🐥', accent:'linear-gradient(135deg,#fbbf24,#f97316)', title:'경주', desc:'오리 경주 방식으로 더 시각적으로 결과를 뽑습니다.', badge1:'실시간 애니메이션', badge2:'가볍게 진행' },
    wheel: { kicker:'LUCKY DRAW', icon:'🎡', accent:'linear-gradient(135deg,#f472b6,#ec4899)', title:'휠', desc:'큰 룰렛 휠로 직관적으로 돌리고 결과를 확인합니다.', badge1:'휠 인터랙션', badge2:'몰입감 강화' },
    ppopgi: { kicker:'LUCKY DRAW', icon:'🎁', accent:'linear-gradient(135deg,#fb7185,#f43f5e)', title:'5x5 뽑기', desc:'카드 뒤집기 느낌으로 순서대로 결과를 열어볼 수 있습니다.', badge1:'25칸 보드', badge2:'등수 커스텀' },
    teamsplit: { kicker:'LUCKY DRAW', icon:'👥', accent:'linear-gradient(135deg,#38bdf8,#6366f1)', title:'팀 나누기', desc:'참가자를 원하는 팀 수만큼 랜덤으로 균등하게 나눕니다.', badge1:'2~8팀 지원', badge2:'균등 분배' },
    bracket: { kicker:'LUCKY DRAW', icon:'🏆', accent:'linear-gradient(135deg,#f59e0b,#ef4444)', title:'대진표 뽑기', desc:'참가자를 랜덤으로 섞어 1라운드 대진을 만들어줍니다.', badge1:'랜덤 매칭', badge2:'부전승 자동 처리' },
    teammatch: { kicker:'PUZZLE GAME', icon:'🧩', accent:'linear-gradient(135deg,#fb7185,#ec4899)', title:'소속 매칭', desc:'같은 소속(팀) 선수들을 사각형으로 묶어서 제거하는 매칭 게임입니다.', badge1:'제한시간 100초', badge2:'낙하 보충' },
    tiermatch: { kicker:'PUZZLE GAME', icon:'🎖️', accent:'linear-gradient(135deg,#34d399,#10b981)', title:'티어 매칭', desc:'같은 티어 선수들을 사각형으로 묶어서 제거하는 매칭 게임입니다.', badge1:'제한시간 100초', badge2:'낙하 보충' },
    quiz: { kicker:'QUIZ GAME', icon:'🖼️', accent:'linear-gradient(135deg,#60a5fa,#6366f1)', title:'얼굴 맞추기', desc:'사진이 점점 선명해지는 시간제한 퀴즈. 빨리 맞힐수록 스피드 보너스!', badge1:'제한시간 60초', badge2:'블러 리빌' },
    memory: { kicker:'PUZZLE GAME', icon:'🃏', accent:'linear-gradient(135deg,#818cf8,#a78bfa)', title:'짝맞추기', desc:'같은 선수 사진 두 장을 찾는 카드 매칭 게임입니다.', badge1:'제한시간 90초', badge2:'콤보 보너스' },
    mole: { kicker:'ACTION GAME', icon:'🐹', accent:'linear-gradient(135deg,#facc15,#f59e0b)', title:'두더지 잡기', desc:'문제로 나온 선수 사진과 같은 얼굴의 두더지만 재빨리 잡아보세요.', badge1:'제한시간 100초', badge2:'3x3 · 5x5 난이도' },
    omok: { kicker:'BOARD GAME', icon:'⚫⚪', accent:'linear-gradient(135deg,#334155,#0f172a)', title:'스타대학 오목', desc:'응원할 대학과 상대 대학을 골라 스트리머 프로필로 오목 대결을 펼칩니다.', badge1:'AI 대결', badge2:'대학 대항전' },
    janggi: { kicker:'BOARD GAME', icon:'♟️', accent:'linear-gradient(135deg,#7c2d12,#451a03)', title:'스타대학 장기', desc:'응원할 대학과 상대 대학을 골라 스트리머 프로필로 장기 대결을 펼칩니다.', badge1:'AI 대결', badge2:'대학 대항전' },
    othello: { kicker:'BOARD GAME', icon:'🟢', accent:'linear-gradient(135deg,#065f46,#022c22)', title:'스타대학 오델로', desc:'응원할 대학과 상대 대학을 골라 스트리머 프로필로 오델로(리버시) 대결을 펼칩니다.', badge1:'AI 대결', badge2:'대학 대항전' }
  }[_gcTab] || { kicker:'LUCKY STUDIO', icon:'🎰', accent:'linear-gradient(135deg,#60a5fa,#6366f1)', title:'룰렛/게임', desc:'원하는 방식으로 간단하게 추첨할 수 있습니다.', badge1:'빠른 추첨', badge2:'탭 전환 지원' };
  const _hero = `<section class="gc-hero" style="--gc-accent:${_tabMeta.accent}">
    <div class="gc-hero-main">
      <div class="gc-hero-icon">${_tabMeta.icon}</div>
      <div class="gc-hero-copy">
        <div class="gc-hero-kicker">${_tabMeta.kicker}</div>
        <div class="gc-hero-title">${_tabMeta.title}</div>
        <div class="gc-hero-desc">${_tabMeta.desc}</div>
      </div>
    </div>
    <div class="gc-hero-badges">
      <span class="gc-badge">✨ ${_tabMeta.badge1}</span>
      <span class="gc-badge">🎯 ${_tabMeta.badge2}</span>
      <span class="gc-badge">📱 모바일 최적화</span>
    </div>
  </section>`;

  // (추가) 현재 탭이 속한 그룹 판별 + 그룹별 탭 목록
  const _gcGroup = _GC_TAB_GROUP[_gcTab] || 'roulette';
  const _gcGroupTabs = _gcGroup === 'game' ? _GC_GAME_TABS : _GC_ROULETTE_TABS;

  // 상단 그룹 세그먼트 — "🎰 룰렛·추첨" / "🎮 미니게임"
  const _groupBar = `<div class="gc-group-bar no-export">
    <button class="gc-group-btn${_gcGroup==='roulette'?' on':''}" onclick="_gcSwitchGroup('roulette')">🎰 룰렛·추첨</button>
    <button class="gc-group-btn${_gcGroup==='game'?' on':''}" onclick="_gcSwitchGroup('game')">🎮 미니게임</button>
  </div>`;

  // 공통 탭바 HTML — 다른 탭 하위 메뉴와 동일한 pill/fbar 스타일 + 라벨/스크롤 힌트로 가독성 보강
  // (선택된 그룹의 서브탭만 표시)
  const _tabBar = `${_groupBar}<div class="gc-tabbar-scroll">
  <div class="fbar no-export" style="overflow-x:auto;flex-wrap:nowrap;-webkit-overflow-scrolling:touch;scrollbar-width:none;gap:4px;margin-bottom:6px">
    ${_gcGroupTabs.map(t => `<button class="pill${_gcTab===t.id?' on':''}" style="flex-shrink:0;white-space:nowrap" onclick="_gcSwitchTab('${t.id}')">${t.icon} ${t.label}</button>`).join('')}
  </div>
  </div>`;

  // 오리경주 탭: 별도 레이아웃
  if (isDuck) {
    return `<div class="gc-shell" style="padding:${pad}px;max-width:${avW-32}px;margin:0 auto;box-sizing:border-box">
  ${_hero}
  <div class="gc-tabbar-card">${_tabBar}</div>
  <div class="gc-stage-card gc-duck-root">
    <div class="gc-stage-head">
      <div>
        <div class="gc-stage-title">🐥 오리 경주 추첨</div>
        <div class="gc-stage-desc">보기 좋은 카드형 레이아웃으로 감싸서, 경주 화면이 더 또렷하게 보이도록 정리했습니다.</div>
      </div>
    </div>
    <div id="dr-root"></div>
  </div>
</div>`;
  }

  // 룰렛 휠 탭: 별도 레이아웃
  if (isWheel) {
    return `<div class="gc-shell" style="padding:${pad}px;max-width:${avW-32}px;margin:0 auto;box-sizing:border-box">
  ${_hero}
  <div class="gc-tabbar-card">${_tabBar}</div>
  <div class="gc-stage-card gc-wheel-root">
    <div class="gc-stage-head">
      <div>
        <div class="gc-stage-title">🎡 휠 룰렛</div>
        <div class="gc-stage-desc">휠 영역을 카드처럼 분리해서 시선이 더 잘 모이도록 구성했습니다.</div>
      </div>
    </div>
    <div id="wh-root"></div>
  </div>
</div>`;
  }

  // 🧩 소속 매칭 탭: 별도 레이아웃 (내용은 team-match-game.js가 #tm-root에 채움)
  if (isTeamMatch) {
    return `<div class="gc-shell" style="padding:${pad}px;max-width:${avW-32}px;margin:0 auto;box-sizing:border-box">
  ${_hero}
  <div class="gc-tabbar-card">${_tabBar}</div>
  <div id="tm-root"></div>
</div>`;
  }

  // 🎖️ 티어 매칭 탭: 별도 레이아웃 (내용은 tier-match-game.js가 #ti-root에 채움)
  if (isTierMatch) {
    return `<div class="gc-shell" style="padding:${pad}px;max-width:${avW-32}px;margin:0 auto;box-sizing:border-box">
  ${_hero}
  <div class="gc-tabbar-card">${_tabBar}</div>
  <div id="ti-root"></div>
</div>`;
  }

  // 🖼️ 얼굴 맞추기 탭: 별도 레이아웃 (내용은 photo-quiz-game.js가 #pq-root에 채움)
  if (isQuiz) {
    return `<div class="gc-shell" style="padding:${pad}px;max-width:${avW-32}px;margin:0 auto;box-sizing:border-box">
  ${_hero}
  <div class="gc-tabbar-card">${_tabBar}</div>
  <div id="pq-root"></div>
</div>`;
  }

  // 🃏 짝맞추기 탭: 별도 레이아웃 (내용은 memory-match-game.js가 #mm-root에 채움)
  if (isMemory) {
    return `<div class="gc-shell" style="padding:${pad}px;max-width:${avW-32}px;margin:0 auto;box-sizing:border-box">
  ${_hero}
  <div class="gc-tabbar-card">${_tabBar}</div>
  <div id="mm-root"></div>
</div>`;
  }

  // 🐹 두더지 잡기 탭: 별도 레이아웃 (내용은 mole-whack-game.js가 #mw-root에 채움)
  if (isMole) {
    return `<div class="gc-shell" style="padding:${pad}px;max-width:${avW-32}px;margin:0 auto;box-sizing:border-box">
  ${_hero}
  <div class="gc-tabbar-card">${_tabBar}</div>
  <div id="mw-root"></div>
</div>`;
  }

  // ⚫⚪ 오목 탭: 별도 레이아웃 (내용은 omok-game.js가 #om-root에 채움)
  if (isOmok) {
    return `<div class="gc-shell" style="padding:${pad}px;max-width:${avW-32}px;margin:0 auto;box-sizing:border-box">
  ${_hero}
  <div class="gc-tabbar-card">${_tabBar}</div>
  <div id="om-root"></div>
</div>`;
  }

  // ♟️ 장기 탭: 별도 레이아웃 (내용은 janggi-game.js가 #jg-root에 채움)
  if (isJanggi) {
    return `<div class="gc-shell" style="padding:${pad}px;max-width:${avW-32}px;margin:0 auto;box-sizing:border-box">
  ${_hero}
  <div class="gc-tabbar-card">${_tabBar}</div>
  <div id="jg-root"></div>
</div>`;
  }

  // 🟢 오델로 탭: 별도 레이아웃 (내용은 othello-game.js가 #ot-root에 채움)
  if (isOthello) {
    return `<div class="gc-shell" style="padding:${pad}px;max-width:${avW-32}px;margin:0 auto;box-sizing:border-box">
  ${_hero}
  <div class="gc-tabbar-card">${_tabBar}</div>
  <div id="ot-root"></div>
</div>`;
  }

  // 👥 팀 나누기 탭: 별도 레이아웃 (내용은 roulette-teamsplit.js가 #ts-root에 채움)
  if (isTeamSplit) {
    return `<div class="gc-shell" style="padding:${pad}px;max-width:${avW-32}px;margin:0 auto;box-sizing:border-box">
  ${_hero}
  <div class="gc-tabbar-card">${_tabBar}</div>
  <div id="ts-root"></div>
</div>`;
  }

  // 🏆 대진표 탭: 별도 레이아웃 (내용은 roulette-bracket.js가 #bk-root에 채움)
  if (isBracket) {
    return `<div class="gc-shell" style="padding:${pad}px;max-width:${avW-32}px;margin:0 auto;box-sizing:border-box">
  ${_hero}
  <div class="gc-tabbar-card">${_tabBar}</div>
  <div id="bk-root"></div>
</div>`;
  }

  // 🎁 뽑기 탭: 별도 레이아웃
  if (isPpopgi) {
    _ppgLoad();
    if(!_ppgBoard || !_ppgRev) _ppgNewBoard();
    const fs = Math.max(14, Math.min(18, Math.round(dome * 0.07)));
    return `<div class="gc-shell" style="padding:${pad}px;max-width:${avW-32}px;margin:0 auto;box-sizing:border-box">
  ${_hero}
  <div class="gc-tabbar-card">${_tabBar}</div>
  <div class="ppg-wrap">
    <div class="ppg-panel gc-card gc-card-soft">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px">
        <div>
          <div class="ppg-title" style="font-size:${fs}px">🎁 5×5 뽑기</div>
          <div class="ppg-sub">카드를 뒤집듯 당첨 결과를 열어보는 방식입니다.</div>
        </div>
      </div>

      <div class="ppg-actions">
        <button class="btn btn-b btn-sm" onclick="_ppgReshuffle()">🔀 새로 섞기</button>
        <button class="btn btn-w btn-sm" onclick="_ppgResetOpen()">♻️ 오픈 초기화</button>
      </div>

      <div id="ppg-grid" class="ppg-grid">
        ${Array.from({length:25}, (_,i)=>{
          const open = !!_ppgRev[i];
          const result = open ? (_ppgBoard[i] || '꽝') : '';
          const cls = open ? 'ppg-card is-open' : 'ppg-card';
          const dataRes = open ? ` data-result="${result}"` : '';
          return `<button class="${cls}" data-ppg="${i}"${dataRes} onclick="_ppgOpen(${i})" aria-label="뽑기 ${i+1}">
            <span class="ppg-card-inner">
              <span class="ppg-face ppg-front">뽑기</span>
              <span class="ppg-face ppg-back">
                <span class="ppg-back-rank"></span>
                <span class="ppg-back-prize"></span>
              </span>
            </span>
          </button>`;
        }).join('')}
      </div>

      <div class="ppg-last">
        <div class="ppg-last-label">최근 결과</div>
        <div id="ppg-last" class="ppg-last-val">—</div>
        <div id="ppg-last-sub" class="ppg-last-sub"></div>
      </div>
    </div>

    <div class="ppg-panel gc-card">
      <button id="ppg-prizecfg-toggle" class="btn btn-w btn-sm" style="width:100%" onclick="_ppgTogglePrizeCfg()">🎁 당첨 내용 입력 ▼</button>
      <div id="ppg-prizecfg-body" style="display:none;margin-top:10px">
        <div style="font-size:var(--fs-sm);color:var(--gray-l);margin-bottom:8px">각 등수에 표시할 “당첨 내용”을 적어줘. (비우면 등수만 표시)</div>
        <div class="ppg-prize-grid">
          ${[1,2,3,4,5].map(k=>`
            <label class="ppg-prize-row">
              <span class="ppg-prize-lbl">${k}등</span>
              <input id="ppg-prize-${k}" type="text" placeholder="예) 치킨 기프티콘" class="ppg-prize-inp">
            </label>
          `).join('')}
        </div>
        <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:10px">
          <button class="btn btn-b btn-sm" onclick="_ppgSavePrizeCfg()">저장</button>
        </div>
      </div>
    </div>

    <!-- (요청사항) 최근 오픈 기록 제거 -->
  </div>
</div>`;
  }

  const _maps = (typeof maps!=='undefined' && Array.isArray(maps)) ? maps : (Array.isArray(window.maps) ? window.maps : []);
  const mapBadges = (!isLadder && !isPlayer) ? _maps.map(m => {
    const active = activeItems.includes(m);
    const mj = _rEscJS(m);
    const ma = _rEscAttr(String(m||''));
    return `<span onclick="_gcToggleMap('${mj}',this)" data-map="${ma}"
      style="cursor:pointer;padding:5px 12px;border-radius:14px;font-size:${fs}px;font-weight:700;border:2px solid ${active?'#FF4B6E':'var(--border)'};background:${active?'#FFF0F3':'var(--surface)'};color:${active?'#FF4B6E':'var(--text2)'};transition:.1s;user-select:none">${_rEscHTML(m)}</span>`;
  }).join('') : '';

  const _inputSummary = isLadder
    ? (ldNames.length ? `✏️ 참가자 ${ldNames.length}명 입력됨` : '✏️ 참가자 입력 없음')
    : (activeItems.length ? `✏️ ${isPlayer?'스트리머':'맵'} ${activeItems.length}개 입력됨` : `✏️ ${isPlayer?'스트리머':'맵'} 입력 없음`);

  // 머신 치수 (가챠용)
  const bodyW     = dome + Math.round(dome * 0.11);
  const ringW     = dome - Math.round(dome * 0.11);
  const ringH     = Math.round(dome * 0.105);
  const crankSz   = Math.round(dome * 0.42);
  const exitW     = Math.round(dome * 0.38);
  const exitH     = Math.round(dome * 0.25);
  const exitCapSz = Math.round(dome * 0.25);
  const trayW     = Math.round(dome * 0.5);
  const trayH     = Math.round(dome * 0.083);
  const resIconSz = Math.round(dome * 0.36);
  const resTextSz = Math.max(20, Math.round(dome * 0.135));

  // 사다리 캔버스 크기
  const ldCanvasW = isWide ? Math.min(600, Math.round(avW * 0.55)) : Math.min(avW - 40, 420);
  const ldCanvasH = Math.max(380, Math.round(avH * 0.68));

  // 입력 컬럼 폭: 태블릿에서 너무 좁/넓지 않게 clamp
  const inputW = isWide ? Math.min(420, Math.max(280, Math.round(avW * 0.34))) : '100%';
  const innerLayout = isWide
    ? `display:flex;gap:${pad*2}px;align-items:flex-start`
    : `display:flex;flex-direction:column;align-items:center`;
  const inputColStyle = isWide ? `width:${inputW}px;flex-shrink:0` : `width:100%`;


  // 사다리: 항상 표시할 결과 항목 블록 (접기 영역 밖)
  const ldItemsAlways = isLadder ? `
    <div class="gc-card gc-card-soft" style="padding:${pad}px;margin-bottom:${Math.round(pad*0.6)}px">
      <div style="font-size:${fs}px;font-weight:700;color:var(--text3);margin-bottom:8px">결과 항목 (쉼표 구분, 이름 수와 동일하게)</div>
      <textarea id="ld-items-input" rows="${rowsLd}" oninput="_ldSaveItems(this.value)"
        style="width:100%;border:2px solid var(--border);border-radius:var(--r);padding:10px 12px;font-size:${fsLg}px;line-height:1.6;resize:none;color:var(--text1);background:var(--surface);font-family:inherit;box-sizing:border-box"></textarea><!-- [Fix-2] value는 rRoulette()에서 .value로 주입 -->
      <button onclick="_ldRebuild()" style="margin-top:10px;font-size:${fs}px;padding:6px 14px;border-radius:8px;border:1.5px solid #a78bfa;background:#f5f3ff;color:#7c3aed;cursor:pointer;font-weight:600">🎲 사다리 다시 만들기</button>
    </div>
    <div id="ld-hist-box"></div>
  ` : '';

  // 입력 본체 HTML (접기 대상)
  const inputBodyInner = isLadder ? `
    <div class="gc-card gc-card-soft" style="padding:${pad}px;margin-bottom:${Math.round(pad*0.6)}px">
      <div style="font-size:${fs}px;font-weight:700;color:var(--text3);margin-bottom:8px">참가자 이름 (쉼표 구분, 2명 이상)</div>
      <textarea id="ld-names-input" rows="${rowsLd}" oninput="_ldSaveNames(this.value)"
        style="width:100%;border:2px solid var(--border);border-radius:var(--r);padding:10px 12px;font-size:${fsLg}px;line-height:1.6;resize:none;color:var(--text1);background:var(--surface);font-family:inherit;box-sizing:border-box"></textarea><!-- [Fix-2] value는 rRoulette()에서 .value로 주입 -->
    </div>
  ` : `
    <div class="gc-card gc-card-soft" style="padding:${pad}px;margin-bottom:${pad}px">
      <div style="font-size:${fs}px;font-weight:700;color:var(--text3);margin-bottom:8px">${isPlayer?'스트리머 이름 (쉼표 구분, 부분 입력 가능)':'맵 이름 (쉼표 구분)'}</div>
      <textarea id="gc-items-input" rows="${rowsGC}" oninput="_gcSaveText(this.value)"
        style="width:100%;border:2px solid var(--border);border-radius:var(--r);padding:10px 12px;font-size:${fsLg}px;line-height:1.6;resize:none;color:var(--text1);background:var(--surface);font-family:inherit;box-sizing:border-box"></textarea><!-- [Fix-2] value는 rRoulette()에서 .value로 주입 -->
      <div style="margin-top:8px;font-size:${Math.max(11,fs-1)}px;color:var(--gray-l);line-height:1.5">
        ✅ 가중치: <b>이름*2</b> (2배) · 예) <span style="font-family:${'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace'}">폴리포이드*2, 라데온*1</span>
      </div>
      <button onclick="_gcClearItems()" style="margin-top:10px;font-size:${fs}px;padding:6px 14px;border-radius:8px;border:1.5px solid var(--border);background:var(--surface);color:var(--text3);cursor:pointer;font-weight:600">지우기</button>
    </div>
    ${(!isPlayer && mapBadges) ? `
    <div class="gc-card" style="padding:${pad}px;margin-bottom:${pad}px">
      <div style="font-size:${fs}px;font-weight:700;color:var(--text3);margin-bottom:10px">📋 등록된 맵 (클릭해서 추가)</div>
      <div style="display:flex;flex-wrap:wrap;gap:6px">${mapBadges}</div>
    </div>` : ''}
  `;

  // 가챠 결과 카드 + 기록 (가챠탭만)
  const gcResultHTML = isLadder ? '' : `
    <div id="gc-result-card" class="gc-card gc-card-soft" style="display:none;background:linear-gradient(135deg,#FFF0F3,#FFF8FA);border:2.5px solid #FF89AB;border-radius:20px;padding:${pad*1.2}px;text-align:center;animation:gcCardAppear 0.4s cubic-bezier(0.175,0.885,0.32,1.35)">
      <div style="font-size:${fs}px;font-weight:700;color:#FF89AB;letter-spacing:1px;margin-bottom:10px">🎊 당첨!</div>
      <div id="gc-pop-icon" style="font-size:${resIconSz}px;display:block;margin-bottom:8px;line-height:1.1"></div>
      <div id="gc-res-text" style="font-size:${resTextSz}px;font-weight:900;color:#C0274A;margin-bottom:6px;word-break:keep-all"></div>
      <div id="gc-res-prob" style="display:none"></div>
      <button onclick="_gcReset()" style="background:linear-gradient(135deg,#FF4B6E,#FF89AB);color:white;border:none;border-radius:14px;padding:${Math.round(pad*0.7)}px ${pad*1.5}px;font-size:${fsLg}px;font-weight:700;cursor:pointer;box-shadow:0 4px 0 #C0274A"
        onmousedown="this.style.transform='translateY(3px)';this.style.boxShadow='0 1px 0 #C0274A'"
        onmouseup="this.style.transform='';this.style.boxShadow='0 4px 0 #C0274A'">🎰 다시 뽑기!</button>
    </div>
    ${(()=>{
      const hist = _gcHistory[isPlayer?'player':'map'];
      if (!hist.length) return '';
      return `<div class="gc-history-card" style="margin-top:${Math.round(pad*0.5)}px">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
          <span style="font-size:${fs}px;font-weight:700;color:var(--text2)">📋 결과 기록 (${hist.length})</span>
          <button onclick="_gcClearHistory()" style="font-size:${Math.max(10,fs-2)}px;padding:3px 8px;border-radius:6px;border:1px solid var(--border);background:var(--surface);color:var(--text3);cursor:pointer">전체 삭제</button>
        </div>
        <div style="display:flex;flex-direction:column;gap:5px;max-height:220px;overflow-y:auto">
          ${hist.slice().reverse().map((r,i)=>`
          <div class="gc-history-item" style="font-size:${fs}px">
            <span style="color:var(--text3);font-size:${Math.max(10,fs-2)}px;min-width:18px;text-align:right">${hist.length-i}</span>
            <span style="font-weight:700;flex:1;color:var(--text1)">${r.name}</span>
            <span style="color:var(--text3);font-size:${Math.max(10,fs-2)}px">${r.time}</span>
          </div>`).join('')}
        </div>
      </div>`;
    })()}
  `;

  // 오른쪽 패널: 사다리 캔버스 or 가챠 머신
  const rightPanelHTML = isLadder ? `
  <div style="${isWide?'flex:1;display:flex;flex-direction:column;align-items:center;margin-top:'+Math.round(pad*2.1)+'px':'display:flex;flex-direction:column;align-items:center;margin-top:'+Math.round(pad*2.1)+'px'}">
    <div class="gc-stage-card" style="width:100%;max-width:${ldCanvasW+20}px;box-sizing:border-box">
      <div class="gc-stage-head">
        <div>
          <div class="gc-stage-title">🪜 사다리 추첨</div>
          <div class="gc-stage-desc">이름을 클릭하면 사다리를 타고 결과까지 바로 연결됩니다.</div>
        </div>
      </div>
      <div id="ld-instruction" style="font-size:${fs}px;color:var(--text3);font-weight:600;margin-bottom:10px;text-align:center">이름을 클릭하면 사다리를 타요!</div>
      <canvas id="ld-canvas" width="${ldCanvasW}" height="${ldCanvasH}"
        style="width:${ldCanvasW}px;height:${ldCanvasH}px;border-radius:18px;border:2px solid var(--border);background:var(--white);cursor:pointer;display:block;filter:drop-shadow(0 4px 12px rgba(0,0,0,0.08))"></canvas>
      <div id="ld-result-card" class="gc-card gc-card-soft" style="display:none;width:${ldCanvasW}px;margin-top:${pad}px;background:linear-gradient(135deg,#FFF0F3,#FFF8FA);border:2.5px solid #FF89AB;border-radius:20px;padding:${pad}px;text-align:center;box-sizing:border-box">
        <div style="font-size:${fs}px;font-weight:700;color:#FF89AB;letter-spacing:1px;margin-bottom:8px">🎊 당첨!</div>
        <div id="ld-res-name" style="font-size:${resTextSz}px;font-weight:900;color:#C0274A;margin-bottom:4px"></div>
        <div style="font-size:${fs}px;color:var(--text3);margin-bottom:8px">▼</div>
        <div id="ld-res-item" style="font-size:${resTextSz}px;font-weight:900;color:#2563eb"></div>
      </div>
    </div>
  </div>
  ` : `
  <div style="${isWide?'flex:1;display:flex;flex-direction:column;align-items:center;margin-top:'+Math.round(pad*2.1)+'px':'display:flex;flex-direction:column;align-items:center;margin-top:'+Math.round(pad*2.1)+'px'}">
    <div class="gc-stage-card" style="display:flex;flex-direction:column;align-items:center;width:100%;max-width:${bodyW+90}px;box-sizing:border-box">
      <div class="gc-stage-head" style="width:100%">
        <div>
          <div class="gc-stage-title">${isPlayer?'🎰 스트리머 구슬뽑기':'🗺️ 맵 구슬뽑기'}</div>
          <div class="gc-stage-desc">클릭 한 번으로 추첨하고, 결과는 팝업과 기록 카드로 깔끔하게 확인할 수 있습니다.</div>
        </div>
      </div>
      <div style="position:relative;display:flex;flex-direction:column;align-items:center;filter:drop-shadow(0 8px 22px rgba(255,75,110,0.35))">
        <div style="position:relative;width:${dome}px;height:${dome}px">
          <div id="gc-dome" style="width:${dome}px;height:${dome}px;background:radial-gradient(circle at 35% 30%,rgba(255,255,255,0.52),rgba(255,200,220,0.2) 55%,rgba(255,150,180,0.08));border:${Math.round(dome*0.042)}px solid white;border-radius:50%;overflow:hidden;box-shadow:inset 0 0 ${Math.round(dome*0.21)}px rgba(255,255,255,0.5),0 ${Math.round(dome*0.035)}px ${Math.round(dome*0.12)}px rgba(200,60,90,0.22),0 0 0 ${Math.round(dome*0.024)}px #FFD6E4;position:relative"></div>
          <div style="position:absolute;inset:0;border-radius:50%;background:radial-gradient(ellipse at 28% 22%,rgba(255,255,255,0.55) 0%,transparent 55%);pointer-events:none"></div>
        </div>
        <div style="width:${ringW}px;height:${ringH}px;background:linear-gradient(180deg,#fff 0%,#f8bbd0 60%,#f48fb1 100%);border-radius:0 0 ${Math.round(ringH*0.6)}px ${Math.round(ringH*0.6)}px;margin-top:${-Math.round(ringH*0.5)}px;position:relative;z-index:2;box-shadow:0 ${Math.round(ringH*0.22)}px 0 #FF4B6E"></div>
        <div style="width:${bodyW}px;background:linear-gradient(180deg,#FF4B6E 0%,#e53935 100%);margin-top:${-Math.round(dome*0.04)}px;border-radius:${Math.round(dome*0.08)}px ${Math.round(dome*0.08)}px ${Math.round(dome*0.22)}px ${Math.round(dome*0.22)}px;position:relative;z-index:1;box-shadow:0 ${Math.round(dome*0.042)}px 0 #C0274A;padding:${Math.round(dome*0.06)}px ${Math.round(dome*0.095)}px ${Math.round(dome*0.12)}px;display:flex;flex-direction:column;align-items:center;gap:${Math.round(dome*0.047)}px">
          <div id="gc-crank" onclick="_gcSpin()" title="클릭해서 뽑기!"
            style="width:${crankSz}px;height:${crankSz}px;background:radial-gradient(circle at 35% 28%,#ffffff,#d8d8d8);border:${Math.round(crankSz*0.083)}px solid #c8c8c8;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 ${Math.round(crankSz*0.083)}px 0 #aaa;transition:transform 0.8s cubic-bezier(0.4,0,0.2,1);user-select:none;position:relative;overflow:hidden">
            <div style="width:${Math.round(crankSz*0.69)}px;height:${Math.round(crankSz*0.19)}px;background:linear-gradient(180deg,#ccc,#999);border-radius:${Math.round(crankSz*0.12)}px;box-shadow:0 ${Math.round(crankSz*0.042)}px 0 #888"></div>
          </div>
          <div style="font-size:${Math.round(dome*0.07)}px;color:rgba(255,255,255,0.92);font-weight:700;letter-spacing:.5px">🎰 클릭해서 뽑기!</div>
          <div style="display:flex;flex-direction:column;align-items:center">
            <div style="position:relative;width:${exitW}px;height:${exitH}px;background:linear-gradient(180deg,#1a1a1a,#333);border-radius:${Math.round(exitW*0.12)}px ${Math.round(exitW*0.12)}px 0 0;box-shadow:inset 0 -${Math.round(exitH*0.14)}px ${Math.round(exitH*0.28)}px rgba(0,0,0,0.55)">
              <div id="gc-outcap" style="position:absolute;bottom:${-Math.round(exitCapSz*0.43)}px;left:50%;transform:translateX(-50%) scale(0);width:${exitCapSz}px;height:${exitCapSz}px;border-radius:50%;z-index:10;transition:0.65s cubic-bezier(0.175,0.885,0.32,1.45);border:${Math.round(exitCapSz*0.07)}px solid white;box-shadow:0 ${Math.round(exitCapSz*0.12)}px ${Math.round(exitCapSz*0.33)}px rgba(0,0,0,0.22)"></div>
            </div>
            <div style="width:${trayW}px;height:${trayH}px;background:linear-gradient(180deg,#d32f2f,#b71c1c);border-radius:0 0 ${Math.round(trayW*0.15)}px ${Math.round(trayW*0.15)}px;box-shadow:0 ${Math.round(trayH*0.29)}px 0 rgba(0,0,0,0.2)"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
  `;

  return `<div class="gc-shell" style="padding:${pad}px;max-width:${avW-32}px;margin:0 auto;box-sizing:border-box">
  ${_hero}
  <div class="gc-tabbar-card">${_tabBar}</div>
  <div style="${innerLayout}">
    <div style="${inputColStyle}">
      <button onclick="_gcToggleInput()" id="gc-input-toggle" class="gc-input-toggle" style="font-size:${fs}px;margin-bottom:${Math.round(pad*0.5)}px">${_gcInputOpen?'📝 입력 접기 ▲':'📝 입력 펼치기 ▼'}</button>
      <div id="gc-input-body" style="display:${_gcInputOpen?'block':'none'}">
        ${inputBodyInner}
        ${ldItemsAlways}
      </div>
      ${gcResultHTML}
    </div>
    ${rightPanelHTML}
  </div>
</div>`;
}

