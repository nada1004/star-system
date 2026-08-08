// ══════════════════════════════════════════════════════════
// settings-render.js — rCfg / reCfg 권위 소스 (SINGLE SOURCE)
// CRITICAL fix: settings.js의 중복 정의 제거됨. 이 파일만 rCfg/reCfg를 정의합니다.
// ══════════════════════════════════════════════════════════
function rCfg(C,T){
  const isLoggedIn = !!window.isLoggedIn;
  const isSubAdmin = !!window.isSubAdmin;
  const _escHTML = (typeof window.escHTML==='function')
    ? window.escHTML
    : (s)=>String(s??'').replace(/[&<>"']/g, (m)=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const _escJS = (typeof window.escJS==='function')
    ? window.escJS
    : (s)=>String(s??'').replace(/\\/g,'\\\\').replace(/'/g,"\\'").replace(/\r/g,'\\r').replace(/\n/g,'\\n');
  const _escAttr = (typeof window.escAttr==='function')
    ? window.escAttr
    : (s)=>String(s??'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  const esc = (typeof window.esc==='function') ? window.esc : _escHTML;
  const _players = Array.isArray(window.players) ? window.players : [];
  const localStorage = (function(){
    try{
      const ls = window.localStorage;
      if(!ls) throw new Error('no localStorage');
      const k='__su_ls_test__';
      ls.setItem(k,'1');
      ls.removeItem(k);
      return ls;
    }catch(e){
      return { getItem: ()=>null, setItem: ()=>{}, removeItem: ()=>{} };
    }
  })();
  try{ if(!Array.isArray(window.notices)) window.notices=[]; }catch(e){}
  const notices = Array.isArray(window.notices) ? window.notices : [];
  const univCfg = Array.isArray(window.univCfg) ? window.univCfg : [];
  T.innerText='⚙️ 설정';
  if(!isLoggedIn){
    // (요청사항) 설정탭은 관리자 로그인 후만 접근 가능
    C.innerHTML=`<div class="cfg-lock-screen">
      <div class="cfg-lock-screen__icon">🔒</div>
      <div class="cfg-lock-screen__title">관리자 전용 페이지</div>
      <div class="cfg-lock-screen__desc">설정 탭은 관리자 로그인 후 이용할 수 있습니다.</div>
      <div class="cfg-lock-screen__chips">
        <span class="cfg-lock-chip">⚙️ 전체 설정 관리</span>
        <span class="cfg-lock-chip">🎨 UI 디자인 조정</span>
        <span class="cfg-lock-chip">💾 동기화/백업</span>
      </div>
      <button class="btn btn-b cfg-lock-screen__btn" onclick="om('loginModal')">&#128273; 로그인</button>
    </div>`;
    return;
  }
  if(!window._cfgCat || window._cfgCat==='전체') window._cfgCat='🧩 운영/콘텐츠';
  const _catSecs = window._catSecs || {};
  const _cfgCats=(window._cfgCatOrder && Array.isArray(window._cfgCatOrder) ? window._cfgCatOrder : Object.keys(_catSecs||{}));
  const _cfgCatIcons={
    '🧩 운영/콘텐츠':'🧩',
    '🖼️ 스트리머/프로필':'🖼️',
    '🧾 카드/기록':'🧾',
    '🎨 UI/테마':'🎨',
    '🧠 자동화/도구':'🧠',
    '🧩 현황판/펨코':'📊',
    '💾 데이터':'💾',
    '🧪 점검/고급':'🧪',
    '기타':'🗂️'
  };
  // 카테고리명 자체에 이모지가 들어있는 경우(🎨 스타일/테마, 🧪 고급/실험실) 아이콘이 2번 보이는 문제 방지
  const _catLabel = (c)=>{
    const s=String(c||'');
    return s.replace(/^[\u{1F300}-\u{1FAFF}\u2600-\u27BF]+\s*/u,'');
  };
  const _cfgCatDesc={
    '🧩 운영/콘텐츠':'공지/티어/시즌/대학/맵/자동인식',
    '🖼️ 스트리머/프로필':'이미지탭/스트리머 상세/대학 상세(팝업)/경기 상세(팝업)/상태아이콘',
    '🧾 카드/기록':'기록카드/대회카드/프로리그/개인·끝장전',
    '🎨 UI/테마':'탭/버튼/필터/폰트/모바일크기/테마',
    '🧠 자동화/도구':'배경음악(BGM)/SOOP 멀티뷰/붙여넣기 분리/FAB',
    '🧩 현황판/펨코':'현황판/펨코스타일/순서/칩/밝기/배경',
    '💾 데이터':'동기화/백업/일괄 작업',
    '🧪 점검/고급':'메뉴정리/설정 점검',
  };
  const _cfgSecTitle={
    notice:'📢 공지', tier:'🎯 티어/점수', season:'🗓️ 시즌', teammatch:'🏟️ 팀경기', acct:'🔐 계정',
    univ:'🏛️ 대학', maps:'🗺️ 맵', mAlias:'🔤 맵 약자', si:'🎭 상태 아이콘 (목록/추가)', paste:'🤖 자동인식',
    b2layout:'📐 이미지탭 레이아웃', imgsettings:'🖼️ 이미지탭 이미지', imgmodalsettings:'🖼️ 스트리머 상세 이미지',
    profileshape:'🖼️ 프로필 이미지 모양',
    pdModeBadge:'🎨 최근 경기 종목 배지 색상',
    pd:'🎨 스트리머 상세 스타일', matchdetail:'🎮 경기 상세(팝업)', ud:'🏫 대학 상세(팝업) 디자인',
    streamerheader:'🎓 스트리머탭 대학 헤더',
    univlogoimg:'🏫 대학 로고 이미지(URL)',
    b2femco:'🧩 펨코스타일', femcoorder:'🔀 펨코스타일 스타대학 순서', boardchip:'🏷️ 현황판 칩/대학로고', oldbright:'🎨 구현황판 밝기', boardbg:'🧱 현황판 배경',
    briefingfx:'🎞️ 브리핑 디자인 & 효과',
    tablabels:'🏷️ 탭 이름(라벨) 설정',
    uisize:'📱 모바일/태블릿 UI 크기',
    cardgap:'🧩 카드 간격(스트리머/티어)',
    siAssign:'🎭 스트리머별 상태 아이콘 지정',
    cfgmenu:'🧭 설정 메뉴 정리', autofitall:'📱 전역 자동 맞춤', reccard:'🧾 기록 카드', tourneycard:'🏆 대회 카드', h2hpanel:'🎮 개인전/끝장전(프로리그 끝장전) 카드',
    minicard:'⚡ 미니대전/시빌워 기록 카드', civilcard:'⚔️ 시빌워 기록 카드', univckcard:'🤝 대학CK 기록 카드', univmcard:'🏟️ 대학대전 기록 카드',
    tiertourcard:'🎯 티어대회 일반 기록 카드', tiertourleaguecard:'🎯 티어대회 조별리그 기록', tiertourbrackcard:'🎯 티어대회 대진표 기록',
    procompleaguecard:'🏆 프로리그 대회 조별리그', procompteamcard:'🏆 프로리그 대회 팀전 카드', procompgjcard:'🏆 프로리그 대회 중장전 카드', procompcard:'⭐ 프로리그 대회 카드',
    sharecard:'🪪 공유카드 디자인', calui:'📅 캘린더', appfont:'🅰️ 전역 폰트',
    'tierrank-view':'📊 티어 순위표 보기 방식',
    streamerchannel:'📺 스트리머 방송국 URL',
    'streamer-view':'🎬 스트리머탭 기본 뷰', 'streamer-tab-style':'🎬 스트리머탭 디자인/레이아웃',
    bgm:'🎵 유튜브 배경음악(BGM)', soopmv:'📺 SOOP(숲) 멀티뷰', pasteRoute:'🧠 붙여넣기 자동 분리',
    designv2:'✨ 디자인 모드', hdr:'🧩 헤더 상단바',
    fab:'📱 플로팅(FAB)', storage:'💾 저장소', datacheck:'🧾 데이터 검수', selfcheck:'🧪 설정 점검',
    sync:'🔄 동기화', firebase:'☁️ GitHub(깃허브) 동기화', aibot:'🤖 AI봇(Groq) 서버 설정', bulkdate:'📅 일괄 날짜', bulkmap:'🗺️ 일괄 맵', bulktier:'🎯 일괄 티어', bulkdel:'🗑️ 일괄 삭제', bulkconv:'🧾 변환'
  };
  // 사용자 지정 섹션명 적용
  try{
    const _ren=_cfgMenuLoadRenames();
    for(const k in (_ren||{})){
      if(!_ren[k]) continue;
      _cfgSecTitle[k]=String(_ren[k]);
    }
  }catch(e){}
  const typeOpts=[{v:'📢',l:'📢 일반 공지'},{v:'🔥',l:'🔥 중요'},{v:'⚠️',l:'⚠️ 경고/주의'},{v:'🎉',l:'🎉 이벤트'}];
  const _curSecs=_catSecs[window._cfgCat]||[];
  // 다른 함수에서도 참조할 수 있게 title 맵을 window에 노출
  window._cfgSecTitle = _cfgSecTitle;
  const _regBtn = (!isSubAdmin ? `<button class="btn btn-b no-export" onclick="openB2PlayerCreateModal()" style="padding:6px 10px;border-radius:14px;font-size:var(--fs-caption);font-weight:900;white-space:nowrap;flex-shrink:0">🎬 스트리머 등록</button>` : ``);
  const _menuBtn = `<button class="btn btn-w no-export" onclick="cfgGo('cfgmenu')" style="padding:6px 10px;border-radius:14px;font-size:var(--fs-caption);font-weight:900;white-space:nowrap;flex-shrink:0" title="설정 하위 메뉴 이름 변경/정리">🧭 메뉴정리</button>`;
  const _afOn = (localStorage.getItem('su_af_alltabs_v1') === '1');
  const _rcOn = (localStorage.getItem('su_rc_theme_on') ?? '1') === '1';
  const _rcAccent = (localStorage.getItem('su_rc_accent_mode') ?? 'none');
  const _rcBg = parseInt(localStorage.getItem('su_rc_bg_alpha') ?? '12',10) || 12;
  const _rcHd = parseInt(localStorage.getItem('su_rc_hd_alpha') ?? '14',10) || 14;
  const _rcIc = parseInt(localStorage.getItem('su_rc_uicon') ?? '24',10) || 24;
  const _rcUnivFont = parseInt(localStorage.getItem('su_rc_univ_font_pct') ?? '110',10) || 110;
  const _ymScale = parseInt(localStorage.getItem('su_ym_scale_pct') ?? '100',10) || 100;
  const _rcMemoOn = (localStorage.getItem('su_rc_memo_on') ?? '0') === '1';
  const _sfxOn = (localStorage.getItem('su_rec_side_fx_on') || '1') !== '0';
  const _sfxMode = localStorage.getItem('su_rec_side_fx_mode') || 'soft';
  const _sfxInt = Math.max(20,Math.min(100,parseInt(localStorage.getItem('su_rec_side_fx_intensity')||'68',10)||68));
  const _sfxLen = Math.max(4,Math.min(80,parseInt(localStorage.getItem('su_rec_side_fx_length')||'25',10)||25));
  const _sfxTail = Math.max(0,Math.min(140,parseInt(localStorage.getItem('su_rec_side_fx_tail')||'28',10)||28));
  const _sfxSoft = Math.max(0,Math.min(100,parseInt(localStorage.getItem('su_rec_side_fx_softness')||'52',10)||52));
  const _sfxEdge = Math.max(2,Math.min(24,parseInt(localStorage.getItem('su_rec_side_fx_edge')||'8',10)||8));
  const _avaScale = Math.round((parseFloat(localStorage.getItem('su_avatar_scale') ?? '1') || 1) * 100);
  // 🎞️ 브리핑 MVP 카드 효과 (js/board2-briefing.js의 _b2MvpFxDefaults와 기본값 동일하게 유지)
  const _mvpFxOn = (localStorage.getItem('su_b2mvp_fx_on') ?? '1') === '1';
  const _mvpFxStyle = (()=>{ const v=localStorage.getItem('su_b2mvp_fx_style'); return ['fade','vignette','topbottom','tint','spotlight','noir','diagonal','glass','none'].includes(v) ? v : 'fade'; })();
  const _mvpFxIntensity = (()=>{ const n=parseInt(localStorage.getItem('su_b2mvp_fx_intensity'),10); return Number.isFinite(n) ? Math.max(0,Math.min(100,n)) : 45; })();
  const _mvpDesignMode = (()=>{ const v=localStorage.getItem('su_b2mvp_design_mode'); return ['photo','panel','frame','glasscard','border','ribbon','split','poster'].includes(v) ? v : 'photo'; })();
  const _briefingTheme = (()=>{ const v=localStorage.getItem('su_b2_briefing_theme'); return ['classic','minimal','vivid','mono','elegant','pastel','luxury','sports','esports','pop','nature','ocean','sunset','neon'].includes(v) ? v : 'classic'; })();
  const _cfgSecDescFallback = {
    notice:'팝업 공지 등록과 노출 상태 관리',
    tier:'티어 점수 기준과 구간 조정',
    season:'시즌 추가, 이름 변경, 기본 시즌 관리',
    teammatch:'팀전 포맷과 기본 규칙 설정',
    acct:'관리자/부관리자 계정과 권한 관리',
    univ:'대학 추가, 수정, 숨김, 색상 정리',
    maps:'맵 목록 추가와 이름 관리',
    mAlias:'맵 약자 자동인식 규칙 관리',
    si:'상태 아이콘 등록과 목록 정리',
    paste:'붙여넣기 인식 규칙과 출력 형식 설정',
    b2layout:'이미지탭 좌우 비율과 높이 조정',
    imgsettings:'이미지탭 이미지 표시 방식 설정',
    imgmodalsettings:'스트리머 상세 이미지 표시 방식 설정',
    profileshape:'프로필 썸네일 모양과 효과 설정',
    pd:'스트리머 상세 카드 색감과 배치 조정',
    matchdetail:'경기 상세 팝업 레이아웃과 색감 조정',
    streamerheader:'스트리머탭 상단 대학 헤더 꾸미기',
    streamerchannel:'스트리머별 방송국 URL 빠른 입력/수정',
    'streamer-tab-style':'스트리머탭 카드/헤더/레이아웃 분위기 설정',
    univlogoimg:'대학 로고 이미지 등록과 관리',
    b2femco:'펨코스타일 색감과 카드 디자인 조정',
    femcoorder:'펨코스타일 대학 순서 정리',
    boardchip:'현황판 칩, 로고, 프로필 표시 설정',
    oldbright:'현황판 카드와 라벨 밝기 조정',
    boardbg:'현황판 배경 이미지와 라벨 배경 관리',
    briefingfx:'브리핑 탭 전체 디자인 테마와 MVP 카드 그라디언트 강도/스타일, 카드 디자인 모드 설정',
    tablabels:'상단과 하위 메뉴 이름 변경',
    uisize:'모바일/태블릿 버튼과 글자 크기 조정',
    cardgap:'스트리머/티어 카드형 카드 간격 조정',
    siAssign:'스트리머별 상태 아이콘 지정',
    cfgmenu:'자주 쓰는 설정 메뉴 이름과 순서 정리',
    autofitall:'화면 크기에 맞춘 자동 맞춤 설정',
    reccard:'기록탭 카드 스타일과 강조 방식 설정',
    tourneycard:'대회탭 카드 디자인 설정',
    h2hpanel:'개인전/끝장전 카드 레이아웃 조정',
    minicard:'미니대전/시빌워 카드 스타일 조정',
    univckcard:'대학CK 카드 디자인 설정',
    univmcard:'대학대전 카드 디자인 설정',
    tiertourcard:'티어대회 일반 경기 카드 스타일',
    tiertourleaguecard:'티어대회 조별리그 카드 스타일',
    tiertourbrackcard:'티어대회 대진표 카드 스타일',
    procompleaguecard:'프로리그 조별리그 카드 스타일',
    procompteamcard:'프로리그 팀전 카드 스타일',
    procompgjcard:'프로리그 중장전 카드 스타일',
    procompcard:'프로리그 대회 메인 카드 스타일',
    sharecard:'공유카드 템플릿과 색감 조정',
    calui:'캘린더 날짜칸과 버튼 구성 설정',
    appfont:'앱 전체 폰트와 크기 조정',
    streamerchannel:'스트리머별 SOOP/치지직 등 방송국 홈 URL 빠른 편집',
    'tierrank-view':'티어 순위표 보기 방식 변경',
    bgm:'유튜브 배경음악 표시와 링크 설정',
    soopmv:'SOOP 멀티뷰 연결 설정',
    pasteRoute:'붙여넣기 결과 자동 분리 규칙 설정',
    hdr:'상단 헤더 제목, 배경, 아이콘 조정',
    fab:'모바일 플로팅 버튼 구성 설정',
    storage:'로컬 저장 용량과 사용 현황 확인',
    datacheck:'사진/대학/티어/기록 누락과 날짜 이상 점검',
    selfcheck:'설정 동작 이상 여부 점검',
    sync:'설정 백업, 내보내기, 가져오기, 동기화',
    firebase:'GitHub/Firebase 연동 설정',
    aibot:'AI봇 서버 주소와 키 설정',
    bulkdate:'여러 기록 날짜 일괄 변경',
    bulkmap:'맵 이름 일괄 치환',
    bulktier:'선수 티어 일괄 변경',
    bulkdel:'기간별 기록 일괄 삭제',
    bulkconv:'세트제 기록 형식 일괄 변환'
  };
  const _cfgSecDesc = (window._cfgSecDescMap||{});
  const _getCfgSecDesc = (id)=>_cfgSecDesc[id] || _cfgSecDescFallback[id] || '세부 설정 열기';
  const _secButtons = _curSecs.map(id=>{
    const title=_cfgSecTitle[id]||id;
    const desc=_getCfgSecDesc(id);
    return `<button type="button" class="btn btn-w no-export cfg-sec-link" onclick="cfgGo('${id}')" style="display:flex;flex-direction:column;align-items:flex-start;gap:4px;padding:12px;border-radius:14px;text-align:left;background:var(--white);justify-content:flex-start;min-height:86px">
      <span style="font-size:var(--fs-md);line-height:1">${String(title).match(/^[^\s]+/)?.[0]||'⚙️'}</span>
      <span style="font-size:var(--fs-sm);font-weight:900;color:var(--text2);line-height:1.3;word-break:keep-all;white-space:normal">${title.replace(/^[^\s]+\s*/,'')}</span>
      <span style="font-size:10px;color:var(--gray-l);font-weight:700;line-height:1.35;white-space:normal">${desc}</span>
    </button>`;
  }).join('');

  // ── 카테고리 카드 그리드
  const _catCardAccents = ['#4f46e5','#0891b2','#16a34a','#ea580c','#7c3aed','#0369a1','#15803d','#9333ea'];
  const _catCardsHtml = _cfgCats.map((c,ci)=>{
    const on = window._cfgCat===c;
    const cj = _escJS(c);
    const icon = _cfgCatIcons[c]||'🗂️';
    const label = _catLabel(c);
    const desc = _cfgCatDesc[c]||'';
    const secCount = (_catSecs[c]||[]).length;
    const accent = _catCardAccents[ci % _catCardAccents.length];
    return `<button type="button" class="no-export cfg-cat-tile" onclick="cfgApplyCat('${cj}')" data-cfg-cat="${_escAttr(c)}"
      style="display:flex;flex-direction:column;align-items:flex-start;gap:0;padding:0;border-radius:14px;cursor:pointer;text-align:left;border:1.5px solid ${on?`${accent}55`:'var(--border)'};background:${on?`linear-gradient(180deg,${accent}12,rgba(255,255,255,.98))`:'var(--white)'};transition:all .15s;overflow:hidden;box-shadow:${on?`0 10px 26px ${accent}18`:'0 1px 4px rgba(15,23,42,.05)'}">
      <div style="width:100%;height:3px;background:${on?accent:'transparent'};flex-shrink:0;transition:background .15s"></div>
      <div style="padding:10px 12px 12px;width:100%;box-sizing:border-box">
        <div style="display:flex;align-items:center;justify-content:space-between;width:100%;margin-bottom:6px">
          <span style="font-size:22px;line-height:1">${icon}</span>
          <span style="font-size:10px;font-weight:800;color:${on?accent:'var(--gray-l)'};background:${on?`${accent}14`:'var(--surface)'};border-radius:99px;padding:2px 7px;border:1px solid ${on?`${accent}22`:'var(--border)'}">${secCount}</span>
        </div>
        <div style="font-size:var(--fs-sm);font-weight:900;color:var(--text2);line-height:1.2;margin-bottom:3px">${label}</div>
        <div style="font-size:10px;color:var(--gray-l);font-weight:600;line-height:1.4;word-break:keep-all">${desc}</div>
      </div>
    </button>`;
  }).join('');
  // ── 섹션 버튼(카테고리 안의 세부 설정 항목)
  const _secBtnColors = ['#eff6ff','#f0fdf4','#fff7ed','#fdf4ff','#fefce8','#fff1f2','#f0fdfa','#faf5ff'];
  const _secBtnIcColors = ['#2563eb','#16a34a','#ea580c','#9333ea','#ca8a04','#e11d48','#0d9488','#7c3aed'];
  const _secButtonsHtml = _curSecs.map((id,si)=>{
    const title = _cfgSecTitle[id]||id;
    const desc = _getCfgSecDesc(id);
    const icon = String(title).match(/^([^\s]+)/)?.[0]||'⚙️';
    const label = title.replace(/^[^\s]+\s*/,'');
    const bg = _secBtnColors[si % _secBtnColors.length];
    const ic = _secBtnIcColors[si % _secBtnIcColors.length];
    return `<button type="button" class="btn btn-w no-export cfg-sec-jump" onclick="cfgGo('${id}')"
      style="display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:12px;text-align:left;background:var(--white);border:1.5px solid var(--border)">
      <span style="display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:9px;background:${bg};font-size:var(--fs-md);flex-shrink:0;border:1px solid ${ic}22">${icon}</span>
      <span style="display:flex;flex-direction:column;gap:2px;min-width:0;flex:1">
        <span style="font-size:var(--fs-sm);font-weight:900;color:var(--text2);line-height:1.2">${_escHTML(label)}</span>
        ${desc?`<span style="font-size:10px;color:var(--gray-l);font-weight:600;line-height:1.3">${_escHTML(desc)}</span>`:''}
      </span>
      <span style="font-size:var(--fs-caption);color:var(--gray-l);flex-shrink:0">›</span>
    </button>`;
  }).join('');
  const _cfgHeroStats = [
    {label:'카테고리', value:`${_cfgCats.length}개`, icon:'🗂️'},
    {label:'현재 설정', value:`${_curSecs.length}개`, icon:'⚙️'}
  ];
  const _cfgHeroStatsHtml = _cfgHeroStats.map((item)=>`
    <div class="cfg-stat-card">
      <span class="cfg-stat-card__icon">${item.icon}</span>
      <span class="cfg-stat-card__meta">
        <span class="cfg-stat-card__label">${item.label}</span>
        <strong class="cfg-stat-card__value">${item.value}</strong>
      </span>
    </div>
  `).join('');

  const ctx = {isLoggedIn,isSubAdmin,_escHTML,_escJS,_escAttr,esc,_players,localStorage,notices,univCfg,_catSecs,_cfgCats,_cfgCatIcons,_catLabel,_cfgCatDesc,_cfgSecTitle,typeOpts,_curSecs,_regBtn,_menuBtn,_afOn,_rcOn,_rcAccent,_rcBg,_rcHd,_rcIc,_rcUnivFont,_ymScale,_rcMemoOn,_sfxOn,_sfxMode,_sfxInt,_sfxLen,_sfxTail,_sfxSoft,_sfxEdge,_avaScale,_mvpFxOn,_mvpFxStyle,_mvpFxIntensity,_mvpDesignMode,_briefingTheme,_cfgSecDescFallback,_cfgSecDesc,_getCfgSecDesc,_secButtons,_catCardAccents,_catCardsHtml,_secBtnColors,_secBtnIcColors,_secButtonsHtml,_cfgHeroStats,_cfgHeroStatsHtml};
  let h = _cfgSecGroup1(ctx) + _cfgSecGroup2(ctx) + _cfgSecGroup3(ctx) + _cfgSecGroup4(ctx);
setTimeout(()=>{
    // 상태 아이콘 지정 목록(전용 메뉴)
    try{ if(typeof _renderCfgSiAssignList==='function') _renderCfgSiAssignList(); }catch(e){}
    renderStorageInfo();
    renderSeasonList();
    const el=document.getElementById('adm-count');
    const listEl=document.getElementById('adm-list');
    const accounts=getAdminAccounts();
    if(el)el.textContent=accounts.length;
    if(listEl){
      if(!accounts.length){listEl.innerHTML='<div style="font-size:var(--fs-sm);color:var(--gray-l)">등록된 계정 없음</div>';return;}
      listEl.innerHTML=accounts.map((a,i)=>`
        <div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid var(--border)">
          <span style="flex:1;font-size:var(--fs-base);font-weight:600">${a.label||'(이름없음)'}</span>
          <span style="padding:2px 9px;border-radius:5px;font-size:10px;font-weight:700;${a.role==='sub-admin'?'background:#fef3c7;color:#92400e;border:1px solid #fde68a':'background:#dbeafe;color:#1e40af;border:1px solid #bfdbfe'}">${a.role==='sub-admin'?'🔰 부관리자':'👑 총관리자'}</span>
          <button class="btn btn-r btn-xs" onclick="deleteAdminAccount(${i})">🗑️ 삭제</button>
        </div>`).join('');
    }
    // 현황판 배경 설정 렌더링
    const bgListEl=document.getElementById('cfg-board-bg-list');
    if(bgListEl){
      bgListEl.innerHTML=univCfg.map((u,i)=>`<div style="border:1px solid var(--border);border-radius:8px;padding:10px 12px;margin-bottom:8px;background:var(--white)">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
          <div class="cdot" style="background:${u.color}"></div>
          <span style="flex:1;font-weight:700;font-size:var(--fs-base)">${u.name}</span>
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:8px">
          <button class="btn btn-xs btn-w" onclick="promptBoardBgImgUrl('${u.name.replace(/'/g,"\\'")}')">URL 설정</button>
          ${u.bgImg?`<button class="btn btn-xs btn-r" onclick="removeBoardBgImg('${u.name.replace(/'/g,"\\'")}')">삭제</button>`:''}
        </div>
        ${u.bgImg?`<div style="margin-top:8px">
          <div style="font-size:var(--fs-caption);font-weight:600;color:var(--text2);margin-bottom:6px">위치</div>
          <select onchange="setBoardBgImgPos('${u.name.replace(/'/g,"\\'")}',this.value)" style="padding:4px 8px;border:1px solid var(--border2);border-radius:6px;font-size:var(--fs-sm)">
            <option value="top left" ${u.bgImgPos==='top left'?' selected':''}>좌상단</option>
            <option value="top center" ${u.bgImgPos==='top center'?' selected':''}>중상단</option>
            <option value="top right" ${u.bgImgPos==='top right'?' selected':''}>우상단</option>
            <option value="center left" ${u.bgImgPos==='center left'?' selected':''}>좌중앙</option>
            <option value="center center" ${u.bgImgPos==='center center'?' selected':''}>중앙</option>
            <option value="center right" ${u.bgImgPos==='center right'?' selected':''}>우중앙</option>
            <option value="bottom left" ${u.bgImgPos==='bottom left'?' selected':''}>좌하단</option>
            <option value="bottom center" ${u.bgImgPos==='bottom center'?' selected':''}>중하단</option>
            <option value="bottom right" ${u.bgImgPos==='bottom right'?' selected':''}>우하단</option>
          </select>
          <div style="font-size:var(--fs-caption);font-weight:600;color:var(--text2);margin-bottom:6px;margin-top:8px">크기</div>
          <select onchange="setBoardBgImgSize('${u.name.replace(/'/g,"\\'")}',this.value)" style="padding:4px 8px;border:1px solid var(--border2);border-radius:6px;font-size:var(--fs-sm)">
            <option value="auto" ${(!u.bgImgSize||u.bgImgSize==='auto')?' selected':''}>자동 (브라우저/카드 맞춤)</option>
            <option value="cover" ${u.bgImgSize==='cover'?' selected':''}>채우기 (cover)</option>
            <option value="contain" ${u.bgImgSize==='contain'?' selected':''}>맞춤 (contain)</option>
            <option value="fill" ${u.bgImgSize==='fill'?' selected':''}>늘리기 (fill)</option>
          </select>
          <label style="display:flex;align-items:center;gap:6px;margin-top:10px;font-size:var(--fs-caption);font-weight:600;color:var(--text2);cursor:pointer">
            <input type="checkbox" ${u.bgIsLogo?'checked':''} onchange="setBoardBgIsLogo('${u.name.replace(/'/g,"\\'")}',this.checked)">
            🏷️ 로고형 배경 (중앙에 작게 배치 — 엠블럼/로고 이미지용)
          </label>
          <div style="display:flex;gap:8px;align-items:center;margin-top:10px">
            <label style="font-size:var(--fs-caption);font-weight:600;color:var(--text2);min-width:90px">밝기(개별):</label>
            <input type="range" min="0" max="100" value="${u.bgImgAlpha ?? b2BgImgAlpha}" style="flex:1;accent-color:var(--blue)"
              oninput="this.nextElementSibling.textContent=this.value+'%'"
              onchange="setBoardBgImgAlpha('${u.name.replace(/'/g,"\\'")}',this.value)">
            <span style="font-size:var(--fs-caption);color:var(--gray-l);min-width:34px;text-align:right;font-weight:700">${u.bgImgAlpha ?? b2BgImgAlpha}%</span>
            ${u.bgImgAlpha!=null?`<button class="btn btn-xs btn-w" onclick="setBoardBgImgAlpha('${u.name.replace(/'/g,"\\'")}',null)">전체값 사용</button>`:''}
          </div>
        </div>`:''}
      </div>`).join('');
    }
    // 이미지탭 레이아웃 설정 초기화
    const b2Layout=JSON.parse(localStorage.getItem('su_b2_layout')||'{}');
    const _b2ls=b2Layout.leftSize||55, _b2rs=b2Layout.rightSize||45;
    const _b2lEl=document.getElementById('cfg-b2-left-size'), _b2rEl=document.getElementById('cfg-b2-right-size');
    if(_b2lEl){_b2lEl.value=_b2ls;const v=document.getElementById('cfg-b2-left-size-val');if(v)v.textContent=_b2ls+'%';}
    if(_b2rEl){_b2rEl.value=_b2rs;const v=document.getElementById('cfg-b2-right-size-val');if(v)v.textContent=_b2rs+'%';}
    if(document.getElementById('cfg-b2-pc-height'))document.getElementById('cfg-b2-pc-height').value=b2Layout.pcHeight||600;
    if(document.getElementById('cfg-b2-mobile-height'))document.getElementById('cfg-b2-mobile-height').value=b2Layout.mobileHeight||320;
    if(document.getElementById('cfg-b2-tablet-height'))document.getElementById('cfg-b2-tablet-height').value=b2Layout.tabletHeight||400;
    if(document.getElementById('cfg-b2-auto-resize'))document.getElementById('cfg-b2-auto-resize').checked=b2Layout.autoResize!==false;
    if(document.getElementById('cfg-b2-auto-height'))document.getElementById('cfg-b2-auto-height').checked=b2Layout.autoHeight!==false;
    // 이미지탭 이미지 설정 (board2 전역 설정) 렌더링
    _ensureB2ImgSettingsWrap();
    // 스트리머 상세 이미지 설정 초기화
    const imgSettings = (typeof suReadImgSettings==='function')
      ? suReadImgSettings()
      : (JSON.parse(localStorage.getItem('su_img_settings')||'{}'));
    if(document.getElementById('cfg-img-fill'))document.getElementById('cfg-img-fill').checked=imgSettings.fill||false;
    if(document.getElementById('cfg-img-scale')){document.getElementById('cfg-img-scale').value=imgSettings.scale||1;document.getElementById('cfg-img-scale-val').textContent=(imgSettings.scale||1).toFixed(1)+'x';}
    if(document.getElementById('cfg-img-brightness')){document.getElementById('cfg-img-brightness').value=imgSettings.brightness||1;document.getElementById('cfg-img-brightness-val').textContent=(imgSettings.brightness||1).toFixed(1)+'x';}
    if(document.getElementById('cfg-img-scale-left')){document.getElementById('cfg-img-scale-left').value=imgSettings.scaleMb||1;document.getElementById('cfg-img-scale-left-val').textContent=(imgSettings.scaleMb||1).toFixed(1)+'x';}
    if(document.getElementById('cfg-img-scale-tablet')){document.getElementById('cfg-img-scale-tablet').value=imgSettings.scaleTb||1;document.getElementById('cfg-img-scale-tablet-val').textContent=(imgSettings.scaleTb||1).toFixed(1)+'x';}
    if(document.getElementById('cfg-img-scale-right')){document.getElementById('cfg-img-scale-right').value=imgSettings.scalePc||1;document.getElementById('cfg-img-scale-right-val').textContent=(imgSettings.scalePc||1).toFixed(1)+'x';}
    if(document.getElementById('cfg-img-random'))document.getElementById('cfg-img-random').checked=imgSettings.randomRotation||false;
    if(document.getElementById('cfg-img-interval'))document.getElementById('cfg-img-interval').value=imgSettings.interval||5;
    // 구현황판 밝기 설정 초기화
    const b2LabelAlpha=parseInt(localStorage.getItem('su_b2la')||'16');
    const b2BgAlpha=parseInt(localStorage.getItem('su_b2ba')||'9');
    if(document.getElementById('cfg-b2-label-alpha')){document.getElementById('cfg-b2-label-alpha').value=b2LabelAlpha;document.getElementById('cfg-b2-label-alpha-val').textContent=b2LabelAlpha+'%';}
    if(document.getElementById('cfg-b2-bg-alpha')){document.getElementById('cfg-b2-bg-alpha').value=b2BgAlpha;document.getElementById('cfg-b2-bg-alpha-val').textContent=b2BgAlpha+'%';}
    // 레이아웃 자동 저장 이벤트 리스너
    ['cfg-b2-left-size','cfg-b2-right-size','cfg-b2-pc-height','cfg-b2-mobile-height','cfg-b2-tablet-height'].forEach(id=>{
      const el=document.getElementById(id);
      if(el)el.addEventListener('change',saveB2LayoutSettings);
    });
    const autoResizeEl=document.getElementById('cfg-b2-auto-resize');
    if(autoResizeEl)autoResizeEl.addEventListener('change',saveB2LayoutSettings);
    const autoHeightEl=document.getElementById('cfg-b2-auto-height');
    if(autoHeightEl)autoHeightEl.addEventListener('change',saveB2LayoutSettings);
    // 스트리머 상세 이미지 설정 자동 저장 이벤트 리스너
    ['cfg-img-fill','cfg-img-scale','cfg-img-brightness','cfg-img-scale-left','cfg-img-scale-tablet','cfg-img-scale-right','cfg-img-random','cfg-img-interval'].forEach(id=>{
      const el=document.getElementById(id);
      if(el)el.addEventListener('change',saveImageSettings);
    });
    // 카테고리 필터 적용
    if(typeof _cfgApplyCat==='function') _cfgApplyCat(window._cfgCat||'🧩 운영/콘텐츠', false);
    // render 후 cfgModal이 열려있었으면 해당 섹션 재오픈
    try{
      const _prevModalSec = window._cfgModalSecId;
      const _cfgModalEl = document.getElementById('cfgModal');
      if(_prevModalSec && _cfgModalEl && _cfgModalEl.style.display!=='none'){
        if(typeof window._cfgGo==='function') window._cfgGo(_prevModalSec);
      }
    }catch(e){}
    try{ if(typeof window.cfgApplySimpleView==='function') window.cfgApplySimpleView(); }catch(e){}
    try{ if(typeof window.cfgApplyBottomSectionsVisibility==='function') window.cfgApplyBottomSectionsVisibility(); }catch(e){}
    // 펨코현황 설정 초기화
    try{ if(typeof cfgFemcoInit==='function') cfgFemcoInit(); }catch(e){}
    // 자동인식 출력 포맷 미리보기 초기화
    try{ if(typeof cfgAutoOutfmtRefreshPreview==='function') cfgAutoOutfmtRefreshPreview(); }catch(e){}
    // 경기 상세/스트리머 상세 스타일 섹션 내용 항상 렌더링 (펼침 여부 무관)
    try{ if(typeof _renderCfgMatchDetailSection==='function') _renderCfgMatchDetailSection(); }catch(e){}
    try{ if(typeof _renderCfgPdSection==='function') _renderCfgPdSection(); }catch(e){}
    // 동적 섹션이 새로 그려졌으므로 검색 텍스트 캐시 재무효화 (innerText 갱신 보장)
    try{
      document.querySelectorAll('[data-cfg-searchtext]').forEach(function(el){
        el.removeAttribute('data-cfg-searchtext');
      });
    }catch(e){}
  },50);
  C.innerHTML=h + '</div>';
  // 렌더 후 검색 텍스트 캐시 무효화: innerHTML이 새로 그려졌으므로 이전 캐시는 무효
  // cfgSearchSettings가 다음에 호출될 때 innerText를 새로 수집해 재캐싱함
  try{
    document.querySelectorAll('[data-cfg-searchtext]').forEach(function(el){
      el.removeAttribute('data-cfg-searchtext');
    });
  }catch(e){}
  // 최초 렌더 직후 카테고리 필터를 즉시 적용 (setTimeout 실행이 막히는 환경 대비)
  try{ if(typeof _cfgApplyCat==='function') _cfgApplyCat(window._cfgCat||'🧩 운영/콘텐츠', false); }catch(e){}
  try{ if(typeof window.cfgApplySimpleView==='function') window.cfgApplySimpleView(); }catch(e){}
  try{ if(typeof window.cfgApplyBottomSectionsVisibility==='function') window.cfgApplyBottomSectionsVisibility(); }catch(e){}
  // 검색어가 있으면 렌더 직후 검색 필터 적용
  try{ if(window._cfgSearchQ) window.cfgSearchSettings(window._cfgSearchQ); }catch(e){}
  // 인라인 onclick이 불발되는 환경 대비 이벤트 바인딩
  _bindCfgHandlers();
  // 설정/메모 동기화 상태 패널 초기화
  try{ if(typeof cfgRenderGistSyncStatus==='function') cfgRenderGistSyncStatus(); }catch(e){}
  setTimeout(_refreshAliasList, 10);
  // FAB 탭 설정 초기화
  window.saveFabTabSetting = function(btnKey, tabId){
    const settings=JSON.parse(localStorage.getItem('su_fabTabs')||'{}');
    settings[btnKey]=tabId;
    localStorage.setItem('su_fabTabs',JSON.stringify(settings));
    if(typeof updateFabButtonOnclick==='function')updateFabButtonOnclick();
    // Firebase에 설정 동기화
    if(typeof save==='function' && typeof isLoggedIn!=='undefined' && isLoggedIn) save();
  };
  window.initFabTabSettings = function(){
    const settings=JSON.parse(localStorage.getItem('su_fabTabs')||'{}');
    const defaults={cal:'cal',comp:'comp',univm:'univm',ind:'ind',pro:'pro'};
    Object.keys(defaults).forEach(key=>{
      const el=document.getElementById('cfg-fab-'+key);
      if(el){
        el.value=settings[key]||defaults[key];
      }
    });
    if(typeof updateFabButtonOnclick==='function')updateFabButtonOnclick();
  };
  window.saveFabVisibilitySettings = function(){
    const elM = document.getElementById('cfg-fab-hide-mobile');
    const elP = document.getElementById('cfg-fab-hide-pc');
    const hideMobile = !!(elM && elM.checked);
    const hidePC = !!(elP && elP.checked);
    try{
      if (window.SettingsStore) window.SettingsStore.setFab(hideMobile, hidePC);
      else {
        localStorage.setItem('su_fabHideMobile', hideMobile ? '1' : '0');
        localStorage.setItem('su_fabHidePC', hidePC ? '1' : '0');
        if(typeof updateFabVisibility==='function')updateFabVisibility();
      }
    }catch(e){}
    try{ if(typeof showToast==='function') showToast('✅ FAB 표시 설정 적용'); }catch(e){}
    // 다른 기기 반영: (관리자) 설정 통합 파일로 동기화
    try{ if(window.SettingsStore && window.SettingsStore.cfg().enabled) window.SettingsStore.push('ui.fab'); }catch(e){}
  };
  window.initFabVisibilitySettings = async function(){
    // 다른 기기 반영: 설정 변경 신호가 있을 때만 pull
    try{ if(window.SettingsStore && typeof window.SettingsStore.pullOnSignal==='function') await window.SettingsStore.pullOnSignal({silent:true}); }catch(e){}
    const hideMobile = localStorage.getItem('su_fabHideMobile') === '1';
    const hidePC = localStorage.getItem('su_fabHidePC') === '1';
    const elM=document.getElementById('cfg-fab-hide-mobile');
    const elP=document.getElementById('cfg-fab-hide-pc');
    if(elM) elM.checked = hideMobile;
    if(elP) elP.checked = hidePC;
    // UI 반영(열려있는 FAB 표시/숨김)
    try{ if(typeof updateFabVisibility==='function') updateFabVisibility(); }catch(e){}
  };
  setTimeout(function(){
    window.initFabTabSettings();
    window.initFabVisibilitySettings();
    try{ window.cfgInitAiProxy && window.cfgInitAiProxy(); }catch(e){}
  }, 50);
} // end first rCfg
window.rCfg = rCfg;
// reCfg: 설정탭 내용만 다시 렌더링 (render() 전체 호출 없이)
function reCfg(){
  try{
    if(typeof curTab!=='undefined' && curTab!=='cfg') return;
    const C=document.getElementById('rcont');
    const T=document.getElementById('rtitle');
    if(!C||!T) return;
    rCfg(C,T);
  }catch(e){}
}
window.reCfg = reCfg;

// ─────────────────────────────────────────────────────────────
// 선수 별명 매핑: 검색 자동완성 함수 (파일 레벨 — innerHTML script 불가 우회)
// ─────────────────────────────────────────────────────────────
(function(){
  let _palIdx = -1;

  function _palPlayerList(){
    try{ return (window.players||[]).map(p=>p.name).filter(Boolean); }catch(e){ return []; }
  }

  window.cfgPalSearchInput = function(val){
    const dd = document.getElementById('cfg-pal-dropdown');
    const hidden = document.getElementById('cfg-pal-player');
    if(!dd) return;
    const q = (val||'').trim();
    const list = q ? _palPlayerList().filter(n=>n.includes(q)) : _palPlayerList().slice(0,20);
    _palIdx = -1;
    if(!list.length){ dd.style.display='none'; if(hidden) hidden.value=''; return; }
    dd.innerHTML = list.map((n,i)=>{
      const safe = n.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
      return `<div data-idx="${i}" data-name="${safe}" style="padding:7px 12px;font-size:var(--fs-base);cursor:pointer;white-space:nowrap" onmousedown="cfgPalSelect(this.dataset.name)">${safe}</div>`;
    }).join('');
    dd.style.display = 'block';
    const exact = list.findIndex(n=>n===q);
    if(exact>=0){ if(hidden) hidden.value=list[exact]; window._palHighlight(exact,dd); }
    else if(hidden) hidden.value='';
  };

  window.cfgPalSelect = function(name){
    const s = document.getElementById('cfg-pal-player-search');
    const h = document.getElementById('cfg-pal-player');
    const dd = document.getElementById('cfg-pal-dropdown');
    if(s) s.value = name;
    if(h) h.value = name;
    if(dd) dd.style.display = 'none';
  };

  window._palHighlight = function(idx, dd){
    if(!dd) return;
    Array.from(dd.children).forEach((el,i)=>{
      el.style.background = i===idx ? 'var(--blue-l,#dbeafe)' : '';
      el.style.fontWeight = i===idx ? '700' : '';
    });
  };

  window.cfgPalSearchKey = function(e){
    const dd = document.getElementById('cfg-pal-dropdown');
    if(!dd || dd.style.display==='none'){
      if(e.key==='Enter') cfgAddPlayerAlias();
      return;
    }
    const items = Array.from(dd.children);
    if(e.key==='ArrowDown'){
      e.preventDefault();
      _palIdx = Math.min(_palIdx+1, items.length-1);
      window._palHighlight(_palIdx, dd);
      if(items[_palIdx]){ const h=document.getElementById('cfg-pal-player'); if(h) h.value=items[_palIdx].dataset.name; }
    } else if(e.key==='ArrowUp'){
      e.preventDefault();
      _palIdx = Math.max(_palIdx-1, 0);
      window._palHighlight(_palIdx, dd);
      if(items[_palIdx]){ const h=document.getElementById('cfg-pal-player'); if(h) h.value=items[_palIdx].dataset.name; }
    } else if(e.key==='Enter'){
      e.preventDefault();
      if(_palIdx>=0 && items[_palIdx]) window.cfgPalSelect(items[_palIdx].dataset.name);
      else cfgAddPlayerAlias();
    } else if(e.key==='Escape'){
      dd.style.display = 'none';
    }
  };
})();
